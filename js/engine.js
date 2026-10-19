// ============================================================
//  ECHOES OF THE SHATTERED OCTAVE — software raycaster
//  320x200 internal resolution, Daggerfall-style view + HUD
// ============================================================
'use strict';

const VW = 320, VH = 200;       // full canvas
const VIEW_H = 150;             // 3D viewport height (HUD below)
const TEX = 64;
const STEP_UP = 0.36;   // tallest rise a walker takes without stairs
const FALL_SAFE = 0.9;  // drops shorter than this cost no health
const MAX_GRADE = 1.1;  // steepest slope (rise per unit run) a walker can climb
const SNAP_DOWN = 0.2;  // walking down less than this per step keeps your feet on the ground

const Engine = (() => {
  const canvas = document.getElementById('view');
  const ctx = canvas.getContext('2d', { alpha: false });
  const frame = ctx.createImageData(VW, VIEW_H);
  const fb = new Uint32Array(frame.data.buffer);
  const zbuf = new Float32Array(VW);
  const ztop = new Float32Array(VW);   // screen row of the nearest wall's top edge, per column
  // Per-pixel depth for maps with relief (raised ground, slopes, low walls,
  // towers). Sprites test against it pixel by pixel, so a crest, a parapet or
  // a stepped roof hides exactly what is behind it and nothing more.
  const dbuf = new Float32Array(VW * VIEW_H);
  const SURF_BIAS = 0.45;   // ground never swallows the feet of what stands on it

  // ---- asset decoding -------------------------------------------------
  const textures = {};   // name -> Uint32Array(64*64)
  const sprites = {};    // name -> {w,h,data:Uint32Array, img}
  const images = {};     // name -> HTMLImageElement (first-person weapons, etc.)

  function loadDataUrl(src) {
    return new Promise((res, rej) => {
      const im = new Image();
      im.onload = () => res(im);
      im.onerror = rej;
      im.src = src;
    });
  }
  async function loadAll(onProgress) {
    const keys = [
      ...Object.keys(ASSETS.tex).map(k => ['tex', k]),
      ...Object.keys(ASSETS.spr).map(k => ['spr', k]),
      ...Object.keys(ASSETS.fp).map(k => ['fp', k]),
    ];
    let n = 0;
    for (const [kind, k] of keys) {
      const im = await loadDataUrl(ASSETS[kind][k]);
      const c = document.createElement('canvas');
      c.width = im.width; c.height = im.height;
      const cx = c.getContext('2d');
      cx.drawImage(im, 0, 0);
      const d = cx.getImageData(0, 0, im.width, im.height);
      const u32 = new Uint32Array(d.data.buffer);
      if (kind === 'tex') textures[k] = u32;
      else if (kind === 'spr') { sprites[k] = { w: im.width, h: im.height, data: u32, img: im }; const md = ASSETS.meta && ASSETS.meta[k]; if (md) { sprites[k].hs = md.hs || 1; sprites[k].cx = md.cx == null ? 0.5 : md.cx; sprites[k].dy = md.dy || 0; } }
      else images[k] = im;
      n++;
      if (onProgress) onProgress(n / keys.length);
    }
  }

  // ---- colour helpers -------------------------------------------------
  // pixels are ABGR little-endian in Uint32
  function shade(px, f, cr, cg, cb) {
    // f in [0,1]
    const r = Math.min(255, (px & 255) * f + (cr || 0)), g = Math.min(255, ((px >> 8) & 255) * f + (cg || 0)), b = Math.min(255, ((px >> 16) & 255) * f + (cb || 0));
    return (255 << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0);
  }
  function tint(px, f, tr, tg, tb, cr, cg, cb) {
    // blend toward fog colour (tr,tg,tb) by (1-f), then darken by ambient light (module var `light_`), plus point-light colour
    const r = Math.min(255, ((px & 255) * f + tr * (1 - f)) * light_ + (cr || 0)), g = Math.min(255, (((px >> 8) & 255) * f + tg * (1 - f)) * light_ + (cg || 0)), b = Math.min(255, (((px >> 16) & 255) * f + tb * (1 - f)) * light_ + (cb || 0));
    return (255 << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0);
  }
  let light_ = 1;
  let lastRelief = false;   // whether the last frame filled the per-pixel depth buffer
  // ---- weather (driven by js/weather.js) ------------------------------
  // Thick air and low light never touch the map: they bend what the renderer
  // already draws, so a sunny save and a stormy one share the same map data.
  let wxHaze = 0, wxDark = 0, wxFlash = 0, wxCloud = 0, wxTR = 0, wxTG = 0, wxTB = 0;
  function setWeather(v) {
    if (!v) return;
    wxHaze = Math.max(0, Math.min(0.6, +v.haze || 0));
    wxDark = Math.max(0, Math.min(0.6, +v.dark || 0));
    wxFlash = Math.max(0, Math.min(1, +v.flash || 0));
    wxCloud = Math.max(0, Math.min(1, +v.cloud || 0));
    const t = v.tint && v.tint.length === 3 ? v.tint : [0, 0, 0];
    wxTR = +t[0] || 0; wxTG = +t[1] || 0; wxTB = +t[2] || 0;
  }
  function rgb(r, g, b) { return (255 << 24) | (b << 16) | (g << 8) | r; }

  // ---- dynamic coloured point-lights ----------------------------------
  const ptLights = [];
  function gatherLights(entities, opts) {
    ptLights.length = 0;
    if (opts && opts.playerLight) ptLights.push(opts.playerLight);
    if (!entities) return;
    for (let i = 0; i < entities.length; i++) {
      const e = entities[i];
      if (!e || e.hidden || e.dead) continue;
      const sp = e.sprite;
      if (sp === 'kaelen' || e.item === 'shard' || e.item === 'core' || e.glassLamp) {
        const pulse = 0.88 + 0.12 * Math.sin(animT * 2.4 + e.x);
        ptLights.push({ x: e.x, y: e.y, r: sp === 'kaelen' ? 3.2 : 2.5, cr: 18 * pulse, cg: 66 * pulse, cb: 58 * pulse });
      } else if (sp === 'lamp' && (e.glow === undefined || e.glow > 0.05)) {
        ptLights.push({ x: e.x, y: e.y, r: 4.5, cr: 58, cg: 38, cb: 12 });
      } else if (sp === 'campfire' || sp === 'hearth') {
        ptLights.push({ x: e.x, y: e.y, r: 5.8, cr: 78, cg: 40, cb: 10 });
      } else if (sp === 'basin' || sp === 'loom' || sp === 'web' || sp === 'cocoon') {
        ptLights.push({ x: e.x, y: e.y, r: 4.2, cr: 34, cg: 24, cb: 64 });
      } else if (sp === 'cores' || sp === 'coil' || e.type === 'aegis' || e.lightCol) {
        const lc = e.lightCol || [20, 58, 48];
        ptLights.push({ x: e.x, y: e.y, r: 4.0, cr: lc[0], cg: lc[1], cb: lc[2] });
      }
    }
  }
  // the same sum, written to LR/LG/LB instead of a fresh array, for the
  // per-pixel relief passes where an allocation every few pixels shows up
  let LR = 0, LG = 0, LB = 0;
  function sampleLightV(wx, wy) {
    let cr = 0, cg = 0, cb = 0;
    for (let i = 0; i < ptLights.length; i++) {
      const L = ptLights[i], dx = wx - L.x, dy = wy - L.y, d2 = dx * dx + dy * dy, r2 = L.r * L.r;
      if (d2 < r2) { const k = 1 - d2 / r2; const kk = k * k; cr += L.cr * kk; cg += L.cg * kk; cb += L.cb * kk; }
    }
    LR = cr > 90 ? 90 : cr; LG = cg > 90 ? 90 : cg; LB = cb > 90 ? 90 : cb;
  }
  function sampleLight(wx, wy) {
    let cr = 0, cg = 0, cb = 0;
    for (let i = 0; i < ptLights.length; i++) {
      const L = ptLights[i], dx = wx - L.x, dy = wy - L.y, d2 = dx * dx + dy * dy, r2 = L.r * L.r;
      if (d2 < r2) {
        const k = 1 - d2 / r2; const kk = k * k;
        cr += L.cr * kk; cg += L.cg * kk; cb += L.cb * kk;
      }
    }
    return [cr > 90 ? 90 : cr, cg > 90 ? 90 : cg, cb > 90 ? 90 : cb];
  }

  // ---- renderer state -------------------------------------------------
  // z is the eye height above the world baseline. Flat maps keep it at 0.5;
  // game.js lifts it as the player climbs stands on raised ground.
  const cam = { x: 2, y: 2, dir: 0, pitch: 0, bob: 0, z: 0.5 };
  let map = null;        // current map object (grid, w, h, cells)
  let fogDist = 12, fogR = 0, fogG = 0, fogB = 0, lightFlicker = 1, ambient = 0;
  let ambientDark = 1;   // night factor
  let baseR = 0, baseG = 0, baseB = 0, baseFog = 12;   // the map's own air, before weather
  const FOV = 1.0;       // plane length (approx 90 deg)

  // A map has relief when anything in it is not a flat one-unit block on flat
  // ground: a height field, sloped vertices, or a cell with its own top.
  function scanRelief(m) {
    let top = 1, any = false;
    if (m.lvls) { any = true; for (let i = 0; i < m.lvls.length; i++) if (m.lvls[i] + 1 > top) top = m.lvls[i] + 1; }
    if (m.verts) { any = true; for (let i = 0; i < m.verts.length; i++) if (m.verts[i] > top) top = m.verts[i]; }
    for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.top != null) { any = true; if (c.top > top) top = c.top; } }
    m.relief = any; m.maxTop = top;
    return any;
  }
  function setMap(m) { scanRelief(m); map = m; cam.z = 0.5; ambient = m.ambient || 0; const fc = m.fogColor || [0, 0, 0]; baseR = fc[0]; baseG = fc[1]; baseB = fc[2]; baseFog = m.fogDist || 12; fogDist = baseFog; fogR = baseR; fogG = baseG; fogB = baseB; }

  // ---- sky -----------------------------------------------------------
  const skyR = new Float32Array(VIEW_H), skyG = new Float32Array(VIEW_H), skyB = new Float32Array(VIEW_H);
  let skyDay = 1;
  // a band of slow cloud: smooth 1D noise, wrapped
  const CLOUD_N = 1024, cloud = new Float32Array(CLOUD_N);
  (function () { const seedv = [], K = 16; for (let i = 0; i < K; i++) seedv.push(Math.random() * 2 - 1); for (let i = 0; i < CLOUD_N; i++) { const u = i / CLOUD_N * K; const a = u | 0, f = u - a; const sm = f * f * (3 - 2 * f); cloud[i] = seedv[a % K] * (1 - sm) + seedv[(a + 1) % K] * sm; } })();
  function buildSky(timeOfDay) {
    // timeOfDay 0..1 ; 0=midnight 0.5=noon; the Light is fading: colours pale
    const dayness = Math.max(0, Math.min(1, (Math.cos((timeOfDay - 0.5) * Math.PI * 2) + 0.3) / 1.3));
    const warm = Math.exp(-Math.pow(timeOfDay - 0.76, 2) / 0.004) + Math.exp(-Math.pow(timeOfDay - 0.26, 2) / 0.004);
    for (let y = 0; y < VIEW_H; y++) {
      const t = y / VIEW_H; // 0 top .. 1 horizon-ish
      // night: deep indigo -> grey ; day: pale washed sky -> dusty horizon
      const nr = 10 + 30 * t, ng = 10 + 28 * t, nb = 24 + 36 * t;
      const dr = 140 + 70 * t, dg = 152 + 58 * t, db = 168 + 32 * t;
      let r = nr + (dr - nr) * dayness, g = ng + (dg - ng) * dayness, b = nb + (db - nb) * dayness;
      r += 70 * warm * t * t; g += 22 * warm * t * t; b -= 20 * warm * t * t;
      if (wxHaze) { r = r * (1 - wxHaze) + wxTR * wxHaze; g = g * (1 - wxHaze) + wxTG * wxHaze; b = b * (1 - wxHaze) + wxTB * wxHaze; }
      if (wxDark) { r *= 1 - wxDark * 0.62; g *= 1 - wxDark * 0.58; b *= 1 - wxDark * 0.42; }
      // cloud: the noise this engine has always carried, now actually drawn.
      // Thicker overhead, thinner at the horizon, and driven by the wind above.
      if (wxCloud > 0.01) {
        const t0 = (typeof performance !== 'undefined' ? performance.now() : Date.now()) / 1000;
        const scroll = (t0 * (4 + 16 * wxCloud)) | 0;
        const cl = cloud[((y * 5 + scroll) & (CLOUD_N - 1))];
        const band = 0.4 + 0.6 * (1 - t);
        const shade = 1 - (0.10 + 0.52 * wxCloud) * (0.5 + 0.5 * cl) * band;
        r *= shade; g *= shade; b *= shade * 0.985;
      }
      if (wxFlash) { r += (255 - r) * 0.55 * wxFlash; g += (255 - g) * 0.55 * wxFlash; b += (255 - b) * 0.5 * wxFlash; }
      skyR[y] = r; skyG[y] = g; skyB[y] = b;
    }
    skyDay = dayness;
    ambientDark = 0.28 + 0.72 * dayness;
  }
  buildSky(0.3);

  // ---- main render ---------------------------------------------------
  const sprList = [];
  let animT = 0;
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  const wave = new Int8Array(64);
  function render(entities, timeOfDay, opts) {
    opts = opts || {};
    if (!map) return;
    const w = VW, h = VIEW_H;
    const outdoor = !!map.outdoor;
    if (outdoor) buildSky(timeOfDay);
    gatherLights(entities, opts);
    const grid = map.cells, mw = map.w, mh = map.h;
    const dirX = Math.cos(cam.dir), dirY = Math.sin(cam.dir);
    const planeX = -dirY * FOV * 0.66, planeY = dirX * FOV * 0.66;
    const horizon = (h >> 1) + (cam.pitch | 0) + (cam.bob | 0);
    const posZ = 0.5 * h;
    const flick = lightFlicker;
    const light = outdoor ? 1 : 1;
    // weather: thicker air, lower light, and one bright frame of lightning.
    // It is the sky's business only: interiors keep their own air and lamps.
    const wxK = outdoor ? 1 : 0;
    fogDist = baseFog * (1 - wxHaze * 0.4 * wxK);
    fogR = baseR * (1 - wxHaze * wxK) + wxTR * wxHaze * wxK;
    fogG = baseG * (1 - wxHaze * wxK) + wxTG * wxHaze * wxK;
    fogB = baseB * (1 - wxHaze * wxK) + wxTB * wxHaze * wxK;
    light_ = (outdoor ? ambientDark : 1) * (1 - wxDark * wxK) + wxFlash * 0.45 * wxK;
    const fogMul = 1 / fogDist;

    // -- floor & ceiling ----------------------------------------------
    const floorTexDefault = textures[map.floor] || textures.t_flag;
    const texWater = textures.t_water, texShal = textures.t_shallows;
    for (let i = 0; i < 64; i++) wave[i] = Math.round(Math.sin(i / 64 * Math.PI * 4 + animT * 1.8) * 1.6);
    const wScroll = (animT * 3) | 0, sScroll = (animT * 1.2) | 0;
    const ceilTex = map.ceil ? textures[map.ceil] : null;
    const rayDirX0 = dirX - planeX, rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX, rayDirY1 = dirY + planeY;
    const floorMap = map.floorCells; // Uint8Array index into map.floorTextures or null
    const floorTexList = map.floorTextures ? map.floorTextures.map(n => textures[n]) : null;
    const heightMap = map.lvls;   // per-cell floor elevation, or null on flat maps
    const verts = map.verts, smooth = map.smooth, VW1 = mw + 1;   // sloped ground: corner heights + mask
    const relief = !!(map.relief || heightMap || verts);
    lastRelief = relief;
    // surface height of cell (cx,cy) at world point (px,py): sloped cells blend
    // their four corners, every other cell is one flat height
    const gAt = (px, py, cx, cy) => {
      const i = cy * mw + cx;
      if (smooth && smooth[i]) {
        let fx = px - cx, fy = py - cy;
        fx = fx < 0 ? 0 : fx > 1 ? 1 : fx; fy = fy < 0 ? 0 : fy > 1 ? 1 : fy;
        const v = cy * VW1 + cx;
        return (verts[v] * (1 - fx) + verts[v + 1] * fx) * (1 - fy) + (verts[v + VW1] * (1 - fx) + verts[v + VW1 + 1] * fx) * fy;
      }
      return heightMap ? heightMap[i] : 0;
    };
    const fogPx = rgb(fogR, fogG, fogB);

    for (let y = 0; y < h; y++) {
      const isFloor = y > horizon;
      if (relief && isFloor) continue;   // the column pass owns the ground on relief maps
      if (!isFloor) {
        if (outdoor) {
          const sy = Math.max(0, Math.min(h - 1, y - cam.pitch - cam.bob + (h >> 2)));
          const br = skyR[sy], bg = skyG[sy], bb = skyB[sy];
          const amp = (6 + 14 * skyDay) * (1 - sy / h);
          const base = ((cam.dir / (Math.PI * 2)) * CLOUD_N * 1.6 + sy * 2.1) | 0;
          let o = y * w;
          for (let x = 0; x < w; x++) {
            const cv = cloud[(base + ((x * 1.7) | 0)) & (CLOUD_N - 1)] * amp;
            fb[o++] = (255 << 24) | (((bb + cv) | 0) << 16) | (((bg + cv) | 0) << 8) | ((br + cv) | 0);
          }
          continue;
        }
        if (!ceilTex) { let o = y * w; const c = rgb(fogR, fogG, fogB); for (let x = 0; x < w; x++) fb[o++] = c; continue; }
      }
      const p = isFloor ? (y - horizon) : (horizon - y);
      if (p === 0) { let o = y * w; for (let x = 0; x < w; x++) fb[o++] = fogPx; continue; }
      const rowDist = posZ / p;
      let f = light * (1 - rowDist * fogMul);
      if (f < 0) f = 0;
      f = ambient + (1 - ambient) * f;
      if (!outdoor) f *= flick;
      const stepX = rowDist * (rayDirX1 - rayDirX0) / w, stepY = rowDist * (rayDirY1 - rayDirY0) / w;
      let fx = cam.x + rowDist * rayDirX0, fy = cam.y + rowDist * rayDirY0;
      let o = y * w;
      const tex = isFloor ? floorTexDefault : ceilTex;
      const fi = Math.round(f * 255) / 255;
      let fcr = 0, fcg = 0, fcb = 0;
      for (let x = 0; x < w; x++) {
        if ((x & 3) === 0 && ptLights.length && rowDist < 10) [fcr, fcg, fcb] = sampleLight(fx, fy);
        const cx = fx | 0, cy = fy | 0;
        const tx = ((fx - cx) * TEX) & 63, ty = ((fy - cy) * TEX) & 63;
        let t = tex;
        if (isFloor && floorMap && cx >= 0 && cy >= 0 && cx < mw && cy < mh) { const idx = floorMap[cy * mw + cx]; if (idx) t = floorTexList[idx]; }
        let px;
        if (t === texWater) px = t[((ty + wScroll) & 63) * TEX + ((tx + wave[ty]) & 63)];
        else if (t === texShal) px = t[((ty + sScroll) & 63) * TEX + ((tx + (wave[(ty + 16) & 63] >> 1)) & 63)];
        else px = t[ty * TEX + tx];
        fb[o++] = outdoor ? tint(px, fi, fogR, fogG, fogB, fcr, fcg, fcb) : shade(px, fi, fcr, fcg, fcb);
        fx += stepX; fy += stepY;
      }
    }

    // -- sun and moon (outdoor only) ----------------------------------
    // Drawn before the ridges so country can stand in front of the light.
    if (outdoor) {
      const sunA = (timeOfDay - 0.25) * Math.PI * 2;
      const elev = Math.cos((timeOfDay - 0.5) * Math.PI * 2);
      const night = elev < 0.02;
      const bodyA = night ? sunA + Math.PI : sunA;
      const bodyEl = night ? Math.min(0.8, Math.max(0.18, -elev)) : Math.min(0.95, elev);
      const bodyCY = Math.max(2, Math.min(horizon - 1, horizon - bodyEl * h * 0.58));
      const warm = 1 - Math.min(1, Math.abs(elev) * 1.5);
      const tr = night ? 150 : 255, tg = night ? 160 : 236 * (1 - warm * 0.12), tb = night ? 190 : 196 * (1 - warm * 0.34);
      const strength = (night ? 0.45 : 1) * (1 - Math.min(0.8, wxCloud * 0.8)) * (1 - wxDark * 0.5);
      const row = new Float32Array(h);
      for (let y = 0; y < horizon; y++) { const dd = (y - bodyCY) / (h * 0.44); row[y] = Math.exp(-dd * dd); }
      const rDisc = Math.max(2.5, h * 0.05);
      for (let x = 0; x < w; x++) {
        const camX = 2 * x / w - 1;
        const ang = Math.atan2(dirY + planeY * camX, dirX + planeX * camX);
        let da = ang - bodyA; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
        const d = Math.abs(da);
        if (d > 0.95) continue;
        const k = d / 0.4;
        const glow = Math.exp(-k * k) * strength;
        const disc = d < rDisc / (w * 0.55) ? 1 : 0;
        if (glow < 0.02 && !disc) continue;
        for (let y = 0; y < horizon; y++) {
          let a = glow * row[y] * 0.55;
          if (disc) { const dy = (y - bodyCY) / rDisc, dx = da / (rDisc / (w * 0.55)); const dd2 = Math.sqrt(dx * dx + dy * dy); if (dd2 <= 1) a = Math.max(a, 0.9 - dd2 * 0.2); }
          if (a <= 0.004) continue;
          const i = y * w + x, px = fb[i];
          const R = Math.min(255, (px & 255) + tr * a), G2 = Math.min(255, ((px >> 8) & 255) + tg * a), B = Math.min(255, ((px >> 16) & 255) + tb * a);
          fb[i] = (255 << 24) | (B << 16) | (G2 << 8) | R;
        }
      }
    }

    // -- distant landmarks (horizon silhouettes, outdoor only) --------
    if (outdoor && typeof LANDMARKS !== 'undefined') {
      const lms = LANDMARKS[map.id] || LANDMARKS._default;
      const dayM = 0.32 + 0.68 * skyDay;
      for (let li = 0; li < lms.length; li++) {
        const lm = lms[li];
        const sil = lm.c || [30, 26, 42];
        for (let x = 0; x < w; x++) {
          const camX = 2 * x / w - 1;
          const ang = Math.atan2(dirY + planeY * camX, dirX + planeX * camX);
          let da = ang - lm.a; while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
          const t = Math.abs(da) / lm.aw; if (t >= 1) continue;
          // a ridge is a hill curve with a little lumpiness along its length, so
          // hills, mountain ranges and cliff shoulders do not read as plain cones
          let prof = Math.pow(1 - t, lm.p || 1.6);
          if (lm.ridge) prof *= 1 + lm.ridge * Math.sin(t * 11 + (lm.seed || 0) * 2.7) * 0.5;
          const top = Math.round(horizon - lm.h * h * Math.max(0, prof));
          const span = Math.max(1, horizon - top);
          const cap = lm.cap, capH = cap ? (lm.capH || 0.3) : 0;
          for (let y = Math.max(0, top); y <= horizon; y++) {
            const v = (horizon - y) / span;
            // aerial perspective: far country thins into the air more than near country
            let mix = 0.30 + 0.5 * t * t + 0.25 * v + (lm.far || 0) * 0.55; if (mix > 0.95) mix = 0.95;
            let sr = sil[0], sg = sil[1], sb = sil[2];
            if (cap && v > 1 - capH) { const k = Math.min(1, (v - (1 - capH)) / Math.max(0.08, capH)); sr = sr * (1 - k) + cap[0] * k; sg = sg * (1 - k) + cap[1] * k; sb = sb * (1 - k) + cap[2] * k; }
            const rr = (((sr * (1 - mix) + fogR * mix) * dayM) | 0) & 255;
            const gg = (((sg * (1 - mix) + fogG * mix) * dayM) | 0) & 255;
            const bb = (((sb * (1 - mix) + fogB * mix) * dayM) | 0) & 255;
            fb[y * w + x] = (255 << 24) | (bb << 16) | (gg << 8) | rr;
          }
        }
      }
    }

    // -- walls --------------------------------------------------------
    // A column can show more than one face: the low step of a stair in front,
    // and the taller ground behind it. Rays collect faces while they can still
    // see over each rise, then paint them far to near.
    const doors = map.doors;
    const faces = [];
    function drawFace(face, x) {
      const dist = face.dist;
      const tex = textures[face.tex] || textures.t_stone;
      let ds, de, step;
      if (heightMap) {
        ds = horizon + (h / dist) * (cam.z - face.top);
        de = horizon + (h / dist) * (cam.z - face.base);
        step = TEX / Math.max(1, de - ds);
      } else {
        const lineH = (h / dist) | 0;
        ds = -lineH / 2 + horizon; de = lineH / 2 + horizon; step = TEX / lineH;
      }
      const dsC = Math.max(0, ds | 0), deC = Math.min(h - 1, de | 0);
      if (deC < dsC) return dsC;
      let tx = (face.wallX * TEX) | 0;
      if ((face.side === 0 && face.rdx > 0) || (face.side === 1 && face.rdy < 0)) tx = TEX - tx - 1;
      let f = light * (1 - dist * fogMul);
      if (f < 0) f = 0;
      f = ambient + (1 - ambient) * f;
      if (face.side === 1) f *= 0.8;
      if (!outdoor) f *= flick;
      const fi = Math.round(f * 255) / 255;
      let tp = (dsC - ds) * step;
      let o = dsC * w + x;
      const hitX = cam.x + dist * face.rdx, hitY = cam.y + dist * face.rdy;
      const [lcr, lcg, lcb] = ptLights.length ? sampleLight(hitX, hitY) : [0, 0, 0];
      const ditherOn = !!(opts && opts.dither);
      for (let y = dsC; y <= deC; y++) {
        const ty = (tp | 0) & 63; tp += step;
        const px = tex[ty * TEX + tx];
        const df = ditherOn ? (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) * 0.0045 : 0;
        const fUse = df ? Math.max(0, Math.min(1, fi + df)) : fi;
        fb[o] = outdoor ? tint(px, fUse, fogR, fogG, fogB, lcr, lcg, lcb) : shade(px, fUse, lcr, lcg, lcb);
        o += w;
      }
      return dsC;
    }
    if (!relief) {
    for (let x = 0; x < w; x++) {
      const camX = 2 * x / w - 1;
      const rdx = dirX + planeX * camX, rdy = dirY + planeY * camX;
      let mapX = cam.x | 0, mapY = cam.y | 0;
      const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
      let stepX, stepY, sdx, sdy;
      if (rdx < 0) { stepX = -1; sdx = (cam.x - mapX) * ddx; } else { stepX = 1; sdx = (mapX + 1 - cam.x) * ddx; }
      if (rdy < 0) { stepY = -1; sdy = (cam.y - mapY) * ddy; } else { stepY = 1; sdy = (mapY + 1 - cam.y) * ddy; }
      let side = 0;
      // the ground the ray is currently over, so a rise becomes a visible face
      let prevLvl = heightMap ? (heightMap[(cam.y | 0) * mw + (cam.x | 0)] || 0) : 0;
      for (let iter = 0; iter < 96; iter++) {
        if (sdx < sdy) { sdx += ddx; mapX += stepX; side = 0; } else { sdy += ddy; mapY += stepY; side = 1; }
        if (mapX < 0 || mapY < 0 || mapX >= mw || mapY >= mh) break;
        const c = grid[mapY * mw + mapX];
        const cellLvl = heightMap ? heightMap[mapY * mw + mapX] : 0;
        if (!c && heightMap && cellLvl - prevLvl > 0.02) {
          // a rise in open ground is a cliff face: draw the ground's own edge
          const dist = side === 0 ? (sdx - ddx) : (sdy - ddy);
          let wx = side === 0 ? cam.y + dist * rdy : cam.x + dist * rdx;
          wx -= Math.floor(wx);
          const fidx = floorMap ? floorMap[mapY * mw + mapX] : 0;
          faces.push({ dist, wallX: wx, base: prevLvl, top: cellLvl, side, rdx, rdy, tex: (map.floorTextures && fidx && map.floorTextures[fidx]) || map.floor });
          prevLvl = cellLvl;
          if (cellLvl > cam.z - 0.02) break;   // cannot see over this one
          continue;
        }
        if (c) {
          if (c.door) {
            // thin door in the middle of the cell, sliding along its own axis
            const d = doors[mapY * mw + mapX];
            const openAmt = d ? d.open : 0;
            if (openAmt >= 0.98) continue;
            let dist, frac;
            if (side === 0) {
              dist = sdx - ddx + ddx * 0.5; // distance to mid-plane
              const hy = cam.y + dist * rdy;
              if ((hy | 0) !== mapY) continue;
              frac = hy - mapY;
              if (frac < openAmt) continue;
            } else {
              dist = sdy - ddy + ddy * 0.5;
              const hx = cam.x + dist * rdx;
              if ((hx | 0) !== mapX) continue;
              frac = hx - mapX;
              if (frac < openAmt) continue;
            }
            faces.push({ dist, wallX: frac - openAmt, base: cellLvl, top: cellLvl + 1, side, rdx, rdy, tex: c.tex });
            break;
          }
          const dist = side === 0 ? (sdx - ddx) : (sdy - ddy);
          let wx = side === 0 ? cam.y + dist * rdy : cam.x + dist * rdx;
          wx -= Math.floor(wx);
          faces.push({ dist, wallX: wx, base: cellLvl, top: c.top != null ? c.top : cellLvl + 1, side, rdx, rdy, tex: c.tex });
          break;
        }
        if (heightMap) prevLvl = cellLvl;
      }
      if (!faces.length) { zbuf[x] = 1e9; ztop[x] = -1e9; continue; }
      zbuf[x] = faces[0].dist;
      for (let i = faces.length - 1; i >= 0; i--) {
        const dsC = drawFace(faces[i], x);
        if (i === 0) ztop[x] = dsC;
      }
      faces.length = 0;
    }
    }

    // -- relief: ground, risers, walls and caps, front to back ---------
    // Each column walks its ray from the eye outward and fills screen rows
    // from the bottom up. Whatever is drawn first is nearest, so a row is
    // written once and everything behind it is clipped by `clip`, the lowest
    // row not yet filled. Ground is drawn as straight pieces along the ray,
    // solved row by row for exact perspective; a rise between cells is a
    // vertical face; a block below the eye shows its cap; and the walk goes on
    // past tall faces for as long as anything taller could still show above.
    if (relief) {
      const CX = cam.x, CY = cam.y, CZ = cam.z;   // hoisted: these are read per pixel
      const sideTex = map.sideTex || null;     // per-cell riser texture names
      const maxTop = map.maxTop != null ? map.maxTop : 2;
      const ditherOn = !!opts.dither;
      const texOfFloor = (cx, cy) => { if (floorMap) { const idx = floorMap[cy * mw + cx]; if (idx) return floorTexList[idx]; } return floorTexDefault; };
      const sideOf = (cx, cy) => { const n = sideTex && sideTex[cy * mw + cx]; return (n && textures[n]) || texOfFloor(cx, cy); };
      const stoneTex = textures.t_stone;
      let lcr = 0, lcg = 0, lcb = 0;
      const nL = ptLights.length;
      // a straight piece of surface along the ray, (t0,z0) to (t1,z1)
      const surf = (x, rdx, rdy, t0, z0, t1, z1, tex, clip) => {
        if (t0 < 0.03) t0 = 0.03;
        if (t1 <= t0) return clip;
        const yA = horizon + h * (CZ - z0) / t0, yB = horizon + h * (CZ - z1) / t1;
        if (!(yB < yA)) return clip;                  // edge-on, or seen from behind
        let ys = Math.ceil(yB); if (ys < 0) ys = 0;
        let ye = yA < h ? Math.floor(yA) : h - 1; if (ye > clip - 1) ye = clip - 1;
        if (ye < ys) return clip;
        const dt = t1 - t0, dz = z1 - z0, K = h * (CZ - z0);
        let o = ys * w + x;
        for (let y = ys; y <= ye; y++, o += w) {
          const p = y - horizon, den = p * dt + h * dz;
          let s = den !== 0 ? (K - p * t0) / den : 0;
          s = s < 0 ? 0 : s > 1 ? 1 : s;
          const t = t0 + s * dt;
          const fx = CX + t * rdx, fy = CY + t * rdy;
          const tx = ((fx - (fx | 0)) * TEX) & 63, ty = ((fy - (fy | 0)) * TEX) & 63;   // map space is never negative
          let px;
          if (tex === texWater) px = tex[((ty + wScroll) & 63) * TEX + ((tx + wave[ty]) & 63)];
          else if (tex === texShal) px = tex[((ty + sScroll) & 63) * TEX + ((tx + (wave[(ty + 16) & 63] >> 1)) & 63)];
          else px = tex[ty * TEX + tx];
          let f = light * (1 - t * fogMul); if (f < 0) f = 0;
          f = ambient + (1 - ambient) * f;
          if (!outdoor) f *= flick;
          if (nL && (y === ys || (y & 3) === 0)) { if (t < 10) { sampleLightV(fx, fy); lcr = LR; lcg = LG; lcb = LB; } else lcr = lcg = lcb = 0; }
          const fi = Math.round(f * 255) / 255;
          fb[o] = outdoor ? tint(px, fi, fogR, fogG, fogB, lcr, lcg, lcb) : shade(px, fi, lcr, lcg, lcb);
          dbuf[o] = t + SURF_BIAS;
        }
        return ys < clip ? ys : clip;
      };
      // a vertical face at distance t from zLo to zHi: texHi above zSplit
      // (a wall), texLo below it (the side of the ground the wall stands on)
      const riser = (x, rdx, rdy, t, zLo, zHi, wallX, side, texHi, zSplit, texLo, clip) => {
        if (zHi - zLo < 0.02) return clip;
        const yT = horizon + h * (CZ - zHi) / t, yBt = horizon + h * (CZ - zLo) / t;
        let ys = yT | 0; if (ys < 0) ys = 0;
        let ye = yBt < h ? yBt | 0 : h - 1; if (ye > clip - 1) ye = clip - 1;
        if (ye < ys) return clip;
        let tx = (wallX * TEX) | 0;
        if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = TEX - tx - 1;
        let f = light * (1 - t * fogMul); if (f < 0) f = 0;
        f = ambient + (1 - ambient) * f;
        if (side === 1) f *= 0.8;
        if (!outdoor) f *= flick;
        const fi = Math.round(f * 255) / 255;
        let cr = 0, cg = 0, cb = 0;
        if (nL) { sampleLightV(CX + t * rdx, CY + t * rdy); cr = LR; cg = LG; cb = LB; }
        const k = t / h;
        let o = ys * w + x;
        for (let y = ys; y <= ye; y++, o += w) {
          const z = CZ - (y + 0.5 - horizon) * k;
          const hi = z >= zSplit - 1e-4;
          const tex = hi ? texHi : texLo;
          const ty = (((hi ? zHi : zSplit) - z) * TEX | 0) & 63;
          const px = tex[ty * TEX + tx];
          const df = ditherOn ? (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) * 0.0045 : 0;
          const fUse = df ? Math.max(0, Math.min(1, fi + df)) : fi;
          fb[o] = outdoor ? tint(px, fUse, fogR, fogG, fogB, cr, cg, cb) : shade(px, fUse, cr, cg, cb);
          dbuf[o] = t;
        }
        return ys < clip ? ys : clip;
      };
      for (let x = 0; x < w; x++) {
        const camX = 2 * x / w - 1;
        const rdx = dirX + planeX * camX, rdy = dirY + planeY * camX;
        let cx = CX | 0, cy = CY | 0;
        const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
        let stepX, stepY, sdx, sdy;
        if (rdx < 0) { stepX = -1; sdx = (CX - cx) * ddx; } else { stepX = 1; sdx = (cx + 1 - CX) * ddx; }
        if (rdy < 0) { stepY = -1; sdy = (CY - cy) * ddy; } else { stepY = 1; sdy = (cy + 1 - CY) * ddy; }
        let clip = h, side = 0, tIn = 0, nearest = 1e9;
        let capZ = null, capTex = null;     // set while the ray crosses the top of a block
        for (let iter = 0; iter < 160; iter++) {
          // -- the surface of the cell the ray is crossing, from tIn to tOut
          const tOut = sdx < sdy ? sdx : sdy;
          let zOut;
          if (capZ !== null) {
            zOut = capZ;
            if (capZ < CZ) clip = surf(x, rdx, rdy, tIn, capZ, tOut, capZ, capTex, clip);
          } else {
            const ci = cy * mw + cx, tex = texOfFloor(cx, cy);
            if (smooth && smooth[ci]) {
              const tm = (tIn + tOut) * 0.5;
              const z0 = gAt(CX + tIn * rdx, CY + tIn * rdy, cx, cy);
              const zm = gAt(CX + tm * rdx, CY + tm * rdy, cx, cy);
              zOut = gAt(CX + tOut * rdx, CY + tOut * rdy, cx, cy);
              clip = surf(x, rdx, rdy, tIn, z0, tm, zm, tex, clip);
              clip = surf(x, rdx, rdy, tm, zm, tOut, zOut, tex, clip);
            } else {
              zOut = heightMap ? heightMap[ci] : 0;
              clip = surf(x, rdx, rdy, tIn, zOut, tOut, zOut, tex, clip);
            }
          }
          // nothing further can show: the screen is full, or the tallest thing
          // on the map would still project below what is already drawn
          if (clip <= 0) break;
          // (when the eye is above everything, things only approach the horizon)
          if (tOut > 0.05 && (maxTop >= CZ ? horizon + h * (CZ - maxTop) / tOut : horizon) >= clip) break;
          // -- step into the next cell
          if (sdx < sdy) { sdx += ddx; cx += stepX; side = 0; } else { sdy += ddy; cy += stepY; side = 1; }
          if (cx < 0 || cy < 0 || cx >= mw || cy >= mh) break;
          tIn = tOut;
          let wallX = side === 0 ? CY + tIn * rdy : CX + tIn * rdx;
          wallX -= Math.floor(wallX);
          const ci = cy * mw + cx, c = grid[ci];
          const base = (smooth && smooth[ci]) ? gAt(CX + tIn * rdx, CY + tIn * rdy, cx, cy) : (heightMap ? heightMap[ci] : 0);
          capZ = null;
          if (c && c.door) {
            const d = doors[ci]; const openAmt = d ? d.open : 0;
            if (openAmt < 0.98) {
              let tD, frac, hit = true;
              if (side === 0) { tD = tIn + ddx * 0.5; const hy = CY + tD * rdy; if ((hy | 0) !== cy) hit = false; frac = hy - cy; }
              else { tD = tIn + ddy * 0.5; const hx = CX + tD * rdx; if ((hx | 0) !== cx) hit = false; frac = hx - cx; }
              if (hit && frac >= openAmt) {
                clip = riser(x, rdx, rdy, tIn, zOut, base, wallX, side, sideOf(cx, cy), -1e9, null, clip);
                clip = surf(x, rdx, rdy, tIn, base, tD, base, texOfFloor(cx, cy), clip);
                const dTex = textures[c.tex] || stoneTex;
                clip = riser(x, rdx, rdy, tD, base, base + 1, frac - openAmt, side, dTex, base, dTex, clip);
                if (tD < nearest) nearest = tD;
                // past a closed door: only taller things beyond can still show
                capZ = base + 1; capTex = dTex; tIn = tD;
                continue;
              }
            }
            // an open (or missed) door is ground
            if (base > zOut) clip = riser(x, rdx, rdy, tIn, zOut, base, wallX, side, sideOf(cx, cy), -1e9, null, clip);
            continue;
          }
          if (c) {
            // a block: its face rises from whatever ground is in front to its
            // top; above its own base it wears the wall texture
            const top = c.top != null ? c.top : base + 1;
            const wTex = textures[c.tex] || stoneTex;
            if (tIn < nearest && top > zOut + 0.02) nearest = tIn;
            clip = riser(x, rdx, rdy, tIn, zOut, top, wallX, side, wTex, base, sideOf(cx, cy), clip);
            capZ = top; capTex = (c.capTex && textures[c.capTex]) || wTex;
            continue;
          }
          // open ground: a rise is a riser face, a drop draws nothing
          if (base > zOut + 0.02) {
            if (tIn < nearest) nearest = tIn;
            clip = riser(x, rdx, rdy, tIn, zOut, base, wallX, side, sideOf(cx, cy), -1e9, null, clip);
          }
        }
        // what the ray never reached is air: haze below the horizon, sky above
        zbuf[x] = nearest; ztop[x] = clip;
        let o = x;
        for (let y = 0; y < clip; y++, o += w) { dbuf[o] = 1e9; if (y > horizon) fb[o] = fogPx; }
      }
    }

    // -- sprites ------------------------------------------------------
    sprList.length = 0;
    for (const e of entities) {
      e._screen = null;
      if (!e.sprite || e.hidden) continue;
      const dx = e.x - cam.x, dy = e.y - cam.y;
      const d2 = dx * dx + dy * dy;
      if (d2 > fogDist * fogDist * 1.3) continue;
      e._d2 = d2; sprList.push(e);
    }
    sprList.sort((a, b) => b._d2 - a._d2);
    const invDet = 1 / (planeX * dirY - dirX * planeY);
    for (const e of sprList) {
      const directional = typeof animDirectionalSprite === 'function' ? animDirectionalSprite(e) : { sprite: (e.animSprite && sprites[e.animSprite]) || sprites[e.sprite], flip: !!e.animFlip };
      const sp = directional.sprite; if (!sp) continue;
      const spriteFlip = directional.flip;
      const sx = e.x - cam.x, sy = e.y - cam.y;
      const trX = invDet * (dirY * sx - dirX * sy);
      const trY = invDet * (-planeY * sx + planeX * sy);
      if (trY <= 0.08) continue;
      const screenX = ((w / 2) * (1 + trX / trY)) | 0;
      const scale = e.scale || 1;
      const unitH = Math.abs((h / trY) * scale);
      const baseH = unitH * (sp.hs || 1);
      const sprH = (baseH * (e.animSY || 1)) | 0;
      const vMove = (((e.yOff || 0) - (e.animLift || 0)) * h / trY + (sp.dy || 0) * unitH) | 0; // + = lower
      // sprites stand on the floor of the cell they are in, whatever its height
      const scx = Math.min(mw - 1, Math.max(0, e.x | 0)), scy = Math.min(mh - 1, Math.max(0, e.y | 0));
      const sprFloor = (heightMap || smooth) ? gAt(e.x, e.y, scx, scy) : 0;
      const baseline = horizon + (((cam.z - sprFloor) * h / trY) | 0) + vMove;
      const dsY = baseline - sprH, deY = baseline;
      const sprW = Math.max(1, (baseH * sp.w / sp.h * (e.animSX || 1)) | 0);
      const cx0 = sp.cx == null ? 0.5 : sp.cx;
      const dsX = screenX - ((spriteFlip ? 1 - cx0 : cx0) * sprW | 0), deX = dsX + sprW;
      const d = Math.sqrt(e._d2);
      let f = light * (1 - d * fogMul);
      if (f < 0) f = 0;
      f = ambient + (1 - ambient) * f;
      if (!outdoor) f *= flick;
      if (e.glow) f = Math.max(f, e.glow);
      if (e.animGlow) f = Math.max(f, e.animGlow);
      if (e.item === 'shard' || e.item === 'core' || e.glassLamp) f = Math.max(f, 0.9);
      if (e.flash) f = 1;
      const fi = Math.round(f * 255) / 255;
      const skew = e.animSkew || 0, flip = spriteFlip, alpha = e.animAlpha == null ? 1 : e.animAlpha, hurt = e.animHurt || 0;
      if (alpha <= 0.02) { e._screen = null; continue; }
      const shTop = skew * sprH;
      const xs = Math.max(0, (dsX + Math.min(0, shTop)) | 0), xe = Math.min(w - 1, (deX + Math.max(0, shTop)) | 0);
      const ys = Math.max(0, dsY), ye = Math.min(h - 1, deY);
      if (xe < xs || ye < ys) continue;
      e._screen = { x0: dsX, x1: deX, y0: dsY, y1: deY, dist: d, z: trY };
      const tw = sp.w, th = sp.h, sdat = sp.data;
      const [scr, scg, scb] = ptLights.length ? sampleLight(e.x, e.y) : [0, 0, 0];
      const ecr = e.elite ? scr + 28 : scr, ecg = e.elite ? scg + 20 : scg, ecb = scb;
      const plain = !skew && !flip && alpha >= 1 && !hurt;
      const aT = alpha * 16;
      for (let x = xs; x <= xe; x++) {
        // a wall in front hides only the pixels below its top edge, so a body
        // behind a low wall still shows its head and shoulders
        let yEnd = ye;
        if (!relief && trY >= zbuf[x]) { yEnd = Math.min(ye, ztop[x] - 1); if (yEnd < ys) continue; }
        let o = ys * w + x;
        if (plain) {
          const tx = (((x - dsX) * tw) / sprW) | 0;
          if (tx < 0 || tx >= tw) continue;
          for (let y = ys; y <= yEnd; y++) {
            const ty = (((y - dsY) * th) / sprH) | 0;
            const px = sdat[ty * tw + tx];
            if ((px >>> 24) > 100 && (!relief || dbuf[o] > trY)) fb[o] = e.flash ? rgb(255, 230, 200) : (outdoor ? tint(px, fi, fogR, fogG, fogB, ecr, ecg, ecb) : shade(px, fi, ecr, ecg, ecb));
            o += w;
          }
          continue;
        }
        for (let y = ys; y <= yEnd; y++) {
          const sx = skew ? x - skew * (deY - y) : x;
          let tx = (((sx - dsX) * tw) / sprW) | 0;
          if (tx < 0 || tx >= tw || (alpha < 1 && BAYER[((y & 3) << 2) | (x & 3)] >= aT)) { o += w; continue; }
          if (flip) tx = tw - 1 - tx;
          const ty = (((y - dsY) * th) / sprH) | 0;
          let px = sdat[ty * tw + tx];
          if ((px >>> 24) > 100 && (!relief || dbuf[o] > trY)) {
            if (hurt) { const r = px & 255, g = (px >>> 8) & 255, b = (px >>> 16) & 255, k = hurt * 0.45; px = ((px & 0xff000000) | ((b * (1 - k)) << 16) | ((g * (1 - k)) << 8) | (r + (255 - r) * k)) >>> 0; }
            fb[o] = e.flash ? rgb(255, 230, 200) : (outdoor ? tint(px, fi, fogR, fogG, fogB, ecr, ecg, ecb) : shade(px, fi, ecr, ecg, ecb));
          }
          o += w;
        }
      }
    }

    // -- post: hush / damage tints handled by caller via overlay -------
    ctx.putImageData(frame, 0, 0);
  }

  // Which entity is under the crosshair and within reach. The crosshair is
  // the centre of the view, which is where a pitched look aims; eye level (the
  // horizon row) still counts too, so level play picks exactly as it always
  // has. On relief maps the pixel must not be hidden behind a crest or wall.
  function pick(entities, maxDist) {
    let best = null, bd = 1e9;
    const cx = VW / 2, aim = VIEW_H / 2, eye = VIEW_H / 2 + cam.pitch;
    for (const e of entities) {
      const s = e._screen; if (!s || e.hidden || e.nopick) continue;
      if (s.dist > maxDist) continue;
      if (!(cx >= s.x0 - 4 && cx <= s.x1 + 4)) continue;
      let ok = false;
      for (const cy of aim === eye ? [aim] : [aim, eye]) {
        if (!(cy >= s.y0 && cy <= s.y1 + 6)) continue;
        if (lastRelief && s.z) {
          const ry = Math.max(s.y0, Math.min(s.y1, cy)) | 0, px = Math.max(0, Math.min(VW - 1, cx | 0));
          if (ry >= 0 && ry < VIEW_H && dbuf[ry * VW + px] < s.z - 0.05) continue;   // something solid is in front
        }
        ok = true; break;
      }
      if (ok && s.dist < bd) { bd = s.dist; best = e; }
    }
    return best;
  }
  // what wall cell is in front of the camera within reach
  function pickWall(maxDist) {
    const dirX = Math.cos(cam.dir), dirY = Math.sin(cam.dir);
    for (let t = 0.2; t < maxDist; t += 0.1) {
      const x = (cam.x + dirX * t) | 0, y = (cam.y + dirY * t) | 0;
      if (x < 0 || y < 0 || x >= map.w || y >= map.h) return null;
      const c = map.cells[y * map.w + x];
      if (c) return { x, y, cell: c, dist: t };
    }
    return null;
  }

  function setFlicker(v) { lightFlicker = v; }
  function setTime(t) { animT = t; }

  // depth of what was drawn at a screen pixel on the last relief frame (1e9 = sky/air)
  function depthAt(x, y) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= VW || y >= VIEW_H) return 1e9; return dbuf[y * VW + x]; }
  return { canvas, ctx, cam, textures, sprites, images, loadAll, render, setMap, scanRelief, setWeather, pick, pickWall, setFlicker, setTime, depthAt, rgb, VW, VH, VIEW_H };
})();
