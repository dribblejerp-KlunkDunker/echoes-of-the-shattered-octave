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
  // The 3D view renders at S times the logical 320x150 (S = 1 or 2). Everything
  // outside the engine - HUD, overlays, input, picking - keeps working in the
  // logical 320x200 space: the canvas grows and its 2D transform scales by S.
  let S = 1, RW = VW, RH = VIEW_H;
  let frame = ctx.createImageData(RW, RH);
  let fb = new Uint32Array(frame.data.buffer);
  let zbuf = new Float32Array(RW);
  let ztop = new Float32Array(RW);   // screen row of the nearest wall's top edge, per column
  // Per-pixel depth (both render paths fill it every frame). On relief maps
  // sprites test against it pixel by pixel, so a crest, a parapet or a stepped
  // roof hides exactly what is behind it; post passes use it everywhere.
  let dbuf = new Float32Array(RW * RH);
  // What each pixel shows, for post passes: see MAT below.
  let mbuf = new Uint8Array(RW * RH);
  // glow: pixels that give their own light (lamps, fire, glass, emissive mask
  // pixels), so post passes can bloom real lights instead of guessing from colour
  const MAT = { other: 0, sky: 1, water: 2, shallows: 3, wall: 4, ground: 5, sprite: 6, ceiling: 7, glow: 8 };
  const SURF_BIAS = 0.45;   // ground never swallows the feet of what stands on it
  // ---- extension points ------------------------------------------------
  // Sky hooks run after the sky, sun and moon and before the horizon ridges;
  // post hooks run after sprites, before the frame is shown. A hook that
  // throws is skipped for that frame: effects never break a frame.
  const skyHooks = [], postHooks = [];
  function addSkyHook(fn, order) { skyHooks.push({ fn, order: order || 0 }); skyHooks.sort((a, b) => a.order - b.order); }
  function addPostHook(fn, order) { postHooks.push({ fn, order: order || 0 }); postHooks.sort((a, b) => a.order - b.order); }
  const FI = {};   // frame info handed to hooks; reused every frame
  function runHooks(list) { for (let i = 0; i < list.length; i++) { try { list[i].fn(FI); } catch (err) { if (!list[i].warned) { list[i].warned = true; console.warn('render hook failed', err); } } } }
  // close-range wall detail (a 64x64 greyscale modulation texture) and the view
  // distance / interior darkness multipliers that presets and lighting set
  let detail = null, detailDist = 2.5, fogK = 1, ambK = 1;
  function setDetail(tex, dist) { detail = tex || null; if (dist) detailDist = dist; }
  function setLook(o) { if (!o) return; if (o.fogK != null) fogK = Math.max(0.3, Math.min(2, +o.fogK || 1)); if (o.ambientK != null) ambK = Math.max(0, Math.min(2, +o.ambientK)); }

  // ---- asset decoding -------------------------------------------------
  const textures = {};   // name -> Uint32Array(64*64)
  const sprites = {};    // name -> {w,h,data:Uint32Array, img}
  // Procedural art registers here the same way decoded art does.
  function addTexture(name, data) { if (!(data instanceof Uint32Array) || data.length !== TEX * TEX) throw new Error('texture must be 64x64 Uint32Array'); textures[name] = data; return data; }
  function addSprite(name, sp) { if (!sp || !(sp.data instanceof Uint32Array) || sp.data.length !== sp.w * sp.h) throw new Error('sprite needs w, h and Uint32Array data'); sprites[name] = Object.assign({ hs: 1, cx: 0.5, dy: 0 }, sp); return sprites[name]; }
  // A sprite's emissive mask: 1 where a pixel gives its own light (glass, flame).
  function setEmissive(name, mask) { const sp = sprites[name]; if (!sp) return false; sp.emit = mask && mask.length === sp.w * sp.h ? mask : null; return !!sp.emit; }
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
  // close-range detail: modulate a texel by a finer greyscale pattern, k = 0..1 with distance
  function detailPx(px, ty, tx, k) {
    const d = detail[(((ty << 1) & 63) * TEX) + ((tx << 1) & 63)] & 255;
    const m = 1 + (d / 255 - 0.5) * 0.45 * k;
    const r = Math.min(255, (px & 255) * m), g = Math.min(255, ((px >> 8) & 255) * m), b = Math.min(255, ((px >> 16) & 255) * m);
    return (px & 0xff000000) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0);
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
    // lightning respects the No flashes access setting
    wxFlash = (typeof GFX !== 'undefined' && GFX.noFlash) ? 0 : Math.max(0, Math.min(1, +v.flash || 0));
    wxCloud = Math.max(0, Math.min(1, +v.cloud || 0));
    const t = v.tint && v.tint.length === 3 ? v.tint : [0, 0, 0];
    wxTR = +t[0] || 0; wxTG = +t[1] || 0; wxTB = +t[2] || 0;
  }
  function rgb(r, g, b) { return (255 << 24) | (b << 16) | (g << 8) | r; }

  // ---- dynamic coloured point-lights ----------------------------------
  const ptLights = [];
  // Each map light carries a visibility mask over the cells around it, so a
  // lamp does not light the far side of a wall. Masks are pooled per frame.
  const visPool = [];
  function blocksLight(c, ci) {
    if (!c) return false;
    if (c.door) { const d = map.doors[ci]; return !(d && d.open > 0.7); }
    if (c.top != null) { const g = map.lvls ? map.lvls[ci] : 0; if (c.top - g < 0.6) return false; }   // you can see (and light) over a low wall
    return true;
  }
  function lightVis(L, k) {
    const R = Math.ceil(L.r), D = 2 * R + 1, ox = (L.x | 0) - R, oy = (L.y | 0) - R;
    let vis = visPool[k]; if (!vis || vis.length < D * D) vis = visPool[k] = new Uint8Array(D * D);
    const mw = map.w, mh = map.h, grid = map.cells;
    for (let j = 0; j < D; j++) for (let i = 0; i < D; i++) {
      const tx = ox + i, ty = oy + j; let ok = 1;
      if (tx < 0 || ty < 0 || tx >= mw || ty >= mh) ok = 0;
      else {
        // walk from the light to the cell centre; any blocking cell between them shadows it
        const ex = tx + 0.5, ey = ty + 0.5, dx = ex - L.x, dy = ey - L.y, n = Math.ceil(Math.max(Math.abs(dx), Math.abs(dy)) * 2);
        for (let s = 1; s < n; s++) {
          const px = (L.x + dx * s / n) | 0, py = (L.y + dy * s / n) | 0;
          if (px === tx && py === ty) break;
          if (px === (L.x | 0) && py === (L.y | 0)) continue;
          const ci = py * mw + px; if (blocksLight(grid[ci], ci)) { ok = 0; break; }
        }
      }
      vis[j * D + i] = ok;
    }
    L.vis = vis; L.vox = ox; L.voy = oy; L.vd = D;
  }
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
    // lights too far from the camera to touch anything in view are dropped before their masks are built
    if (opts && opts.cull) { const lim = fogDist + 1; let j = 0; for (let k = 0; k < ptLights.length; k++) { const L = ptLights[k], dx = L.x - cam.x, dy = L.y - cam.y, r = lim + L.r; if (dx * dx + dy * dy <= r * r) ptLights[j++] = L; } ptLights.length = j; }
    if (map) for (let k = 0; k < ptLights.length; k++) { const L = ptLights[k]; if (L.occlude === false) { L.vis = null; continue; } lightVis(L, k); }
  }
  function litBy(L, wx, wy) {
    if (!L.vis) return true;
    const i = (wx | 0) - L.vox, j = (wy | 0) - L.voy;
    return i >= 0 && j >= 0 && i < L.vd && j < L.vd && L.vis[j * L.vd + i] === 1;
  }
  // the same sum, written to LR/LG/LB instead of a fresh array, for the
  // per-pixel relief passes where an allocation every few pixels shows up
  let LR = 0, LG = 0, LB = 0;
  function sampleLightV(wx, wy) {
    let cr = 0, cg = 0, cb = 0;
    for (let i = 0; i < ptLights.length; i++) {
      const L = ptLights[i], dx = wx - L.x, dy = wy - L.y, d2 = dx * dx + dy * dy, r2 = L.r * L.r;
      if (d2 < r2 && litBy(L, wx, wy)) { const k = 1 - d2 / r2; const kk = k * k; cr += L.cr * kk; cg += L.cg * kk; cb += L.cb * kk; }
    }
    LR = cr > 90 ? 90 : cr; LG = cg > 90 ? 90 : cg; LB = cb > 90 ? 90 : cb;
  }
  function sampleLight(wx, wy) {
    let cr = 0, cg = 0, cb = 0;
    for (let i = 0; i < ptLights.length; i++) {
      const L = ptLights[i], dx = wx - L.x, dy = wy - L.y, d2 = dx * dx + dy * dy, r2 = L.r * L.r;
      if (d2 < r2 && litBy(L, wx, wy)) {
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
  let ambientBase = 0;
  function setMap(m) { scanRelief(m); map = m; cam.z = 0.5; ambientBase = ambient = m.ambient || 0; const fc = m.fogColor || [0, 0, 0]; baseR = fc[0]; baseG = fc[1]; baseB = fc[2]; baseFog = m.fogDist || 12; fogDist = baseFog; fogR = baseR; fogG = baseG; fogB = baseB; }

  // ---- sky -----------------------------------------------------------
  let skyR = new Float32Array(RH), skyG = new Float32Array(RH), skyB = new Float32Array(RH);
  let skyDay = 1;
  // a band of slow cloud: smooth 1D noise, wrapped
  const CLOUD_N = 1024, cloud = new Float32Array(CLOUD_N);
  (function () { const seedv = [], K = 16; for (let i = 0; i < K; i++) seedv.push(Math.random() * 2 - 1); for (let i = 0; i < CLOUD_N; i++) { const u = i / CLOUD_N * K; const a = u | 0, f = u - a; const sm = f * f * (3 - 2 * f); cloud[i] = seedv[a % K] * (1 - sm) + seedv[(a + 1) % K] * sm; } })();
  function buildSky(timeOfDay) {
    // timeOfDay 0..1 ; 0=midnight 0.5=noon; the Light is fading: colours pale
    const dayness = Math.max(0, Math.min(1, (Math.cos((timeOfDay - 0.5) * Math.PI * 2) + 0.3) / 1.3));
    const warm = Math.exp(-Math.pow(timeOfDay - 0.76, 2) / 0.004) + Math.exp(-Math.pow(timeOfDay - 0.26, 2) / 0.004);
    for (let y = 0; y < RH; y++) {
      const t = y / RH; // 0 top .. 1 horizon-ish
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
        const cl = cloud[((((y / S) | 0) * 5 + scroll) & (CLOUD_N - 1))];
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
    const w = RW, h = RH;
    const outdoor = !!map.outdoor;
    ambient = outdoor ? ambientBase : ambientBase * ambK;
    if (outdoor) buildSky(timeOfDay);
    gatherLights(entities, { playerLight: opts.playerLight, cull: true });
    const grid = map.cells, mw = map.w, mh = map.h;
    const dirX = Math.cos(cam.dir), dirY = Math.sin(cam.dir);
    const planeX = -dirY * FOV * 0.66, planeY = dirX * FOV * 0.66;
    const horizon = (h >> 1) + ((cam.pitch * S) | 0) + ((cam.bob * S) | 0);
    const posZ = 0.5 * h;
    const flick = lightFlicker;
    const light = outdoor ? 1 : 1;
    // weather: thicker air, lower light, and one bright frame of lightning.
    // It is the sky's business only: interiors keep their own air and lamps.
    const wxK = outdoor ? 1 : 0;
    fogDist = baseFog * fogK * (1 - wxHaze * 0.4 * wxK);
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
    const ceilZ = map.ceilZ || 1;                     // absolute ceiling height (interiors)
    const ceilMap = map.ceilCells, ceilTexList = map.ceilTextures ? map.ceilTextures.map(n => textures[n]) : null;
    const decals = map.decals || null;                // cell index -> decal texture name
    const MAT_W = 4, MAT_G = 5;

    for (let y = 0; y < h; y++) {
      const isFloor = y > horizon;
      if (relief && isFloor) continue;   // the column pass owns the ground on relief maps
      if (!isFloor) {
        if (outdoor) {
          const sy = Math.max(0, Math.min(h - 1, y - ((cam.pitch + cam.bob) * S | 0) + (h >> 2)));
          const br = skyR[sy], bg = skyG[sy], bb = skyB[sy];
          const amp = (6 + 14 * skyDay) * (1 - sy / h);
          const base = ((cam.dir / (Math.PI * 2)) * CLOUD_N * 1.6 + (sy / S) * 2.1) | 0;
          let o = y * w;
          for (let x = 0; x < w; x++) {
            const cv = cloud[(base + (((x / S) * 1.7) | 0)) & (CLOUD_N - 1)] * amp;
            dbuf[o] = 1e9; mbuf[o] = 1;
            fb[o++] = (255 << 24) | (((bb + cv) | 0) << 16) | (((bg + cv) | 0) << 8) | ((br + cv) | 0);
          }
          continue;
        }
        if (!ceilTex) { let o = y * w; const c = rgb(fogR, fogG, fogB); for (let x = 0; x < w; x++) { dbuf[o] = 1e9; mbuf[o] = 0; fb[o++] = c; } continue; }
      }
      const p = isFloor ? (y - horizon) : (horizon - y);
      if (p === 0) { let o = y * w; for (let x = 0; x < w; x++) { dbuf[o] = 1e9; mbuf[o] = 0; fb[o++] = fogPx; } continue; }
      // the floor is half a unit below the eye on flat maps; a ceiling sits at
      // its own absolute height (one unit unless the map says otherwise)
      const rowDist = isFloor ? posZ / p : (ceilZ - cam.z) * h / p;
      const rowDepth = isFloor ? rowDist + SURF_BIAS : rowDist, rowMat = isFloor ? MAT_G : 7;
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
        else if (!isFloor && ceilMap && cx >= 0 && cy >= 0 && cx < mw && cy < mh) { const idx = ceilMap[cy * mw + cx]; if (idx && ceilTexList[idx]) t = ceilTexList[idx]; }
        let px, mat = rowMat;
        if (t === texWater) { px = t[((ty + wScroll) & 63) * TEX + ((tx + wave[ty]) & 63)]; mat = 2; }
        else if (t === texShal) { px = t[((ty + sScroll) & 63) * TEX + ((tx + (wave[(ty + 16) & 63] >> 1)) & 63)]; mat = 3; }
        else px = t[ty * TEX + tx];
        dbuf[o] = rowDepth; mbuf[o] = mat;
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

    // -- sky hooks: stars, panoramas, things crossing the sky -----------
    Object.assign(FI, { fb, dbuf, mbuf, w, h, S, horizon, dirX, dirY, planeX, planeY, cam, map, outdoor, tod: timeOfDay, skyDay, light: light_, fogR, fogG, fogB, fogDist, animT, ptLights, relief, wx: { haze: wxHaze, dark: wxDark, cloud: wxCloud, flash: wxFlash },
      // Phase 10 (look10): what the ground-shadow and fight-mark pass needs to put a disc on the floor with the
      // renderer's own depth rule: the sorted sprite list (filled below, same array), the ground-height lookup
      // and the bias that sits between a ground pixel's depth and its true distance. Read-only for hooks.
      sprList, gAt, surfBias: SURF_BIAS });
    if (skyHooks.length) runHooks(skyHooks);

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
      // light is sampled just in front of the face, in the open cell it faces
      const hitX = cam.x + (dist - 0.02) * face.rdx, hitY = cam.y + (dist - 0.02) * face.rdy;
      const [lcr, lcg, lcb] = ptLights.length ? sampleLight(hitX, hitY) : [0, 0, 0];
      const ditherOn = !!(opts && opts.dither);
      const dec = decals && face.ci != null && decals[face.ci] ? textures[decals[face.ci]] : null;
      const det = detail && dist < detailDist ? 1 - dist / detailDist : 0;
      for (let y = dsC; y <= deC; y++) {
        const ty = (tp | 0) & 63; tp += step;
        let px = tex[ty * TEX + tx];
        if (dec) { const d = dec[ty * TEX + tx]; if ((d >>> 24) > 100) px = d; }
        if (det) px = detailPx(px, ty, tx, det);
        const df = ditherOn ? (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) * 0.0045 : 0;
        const fUse = df ? Math.max(0, Math.min(1, fi + df)) : fi;
        fb[o] = outdoor ? tint(px, fUse, fogR, fogG, fogB, lcr, lcg, lcb) : shade(px, fUse, lcr, lcg, lcb);
        dbuf[o] = dist; mbuf[o] = MAT_W;
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
            if (openAmt > 0 && typeof Doors !== 'undefined') {
              // swinging leaf (Doors.swing is 0 when GFX.swingDoors is off or the doorway is unclear)
              const sw = Doors.swing(d, mapX, mapY, cam.x, cam.y, rdx, rdy, grid, mw);
              if (sw === 1) continue;
              if (sw === 2) { faces.push({ dist: Doors.out.t, wallX: Doors.out.u, base: cellLvl, top: cellLvl + 1, side: Doors.out.side, rdx, rdy, tex: c.tex, ci: mapY * mw + mapX }); break; }
            }
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
            faces.push({ dist, wallX: frac - openAmt, base: cellLvl, top: cellLvl + 1, side, rdx, rdy, tex: c.tex, ci: mapY * mw + mapX });
            break;
          }
          const dist = side === 0 ? (sdx - ddx) : (sdy - ddy);
          let wx = side === 0 ? cam.y + dist * rdy : cam.x + dist * rdx;
          wx -= Math.floor(wx);
          faces.push({ dist, wallX: wx, base: cellLvl, top: c.top != null ? c.top : cellLvl + 1, side, rdx, rdy, tex: c.tex, ci: mapY * mw + mapX });
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
          let px, mat = MAT_G;
          if (tex === texWater) { px = tex[((ty + wScroll) & 63) * TEX + ((tx + wave[ty]) & 63)]; mat = 2; }
          else if (tex === texShal) { px = tex[((ty + sScroll) & 63) * TEX + ((tx + (wave[(ty + 16) & 63] >> 1)) & 63)]; mat = 3; }
          else px = tex[ty * TEX + tx];
          mbuf[o] = mat;
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
      const riser = (x, rdx, rdy, t, zLo, zHi, wallX, side, texHi, zSplit, texLo, clip, ci) => {
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
        if (nL) { sampleLightV(CX + (t - 0.02) * rdx, CY + (t - 0.02) * rdy); cr = LR; cg = LG; cb = LB; }
        const dec = decals && ci != null && decals[ci] ? textures[decals[ci]] : null;
        const det = detail && t < detailDist ? 1 - t / detailDist : 0;
        const k = t / h;
        let o = ys * w + x;
        for (let y = ys; y <= ye; y++, o += w) {
          const z = CZ - (y + 0.5 - horizon) * k;
          const hi = z >= zSplit - 1e-4;
          const tex = hi ? texHi : texLo;
          const ty = (((hi ? zHi : zSplit) - z) * TEX | 0) & 63;
          let px = tex[ty * TEX + tx];
          if (hi && dec) { const d = dec[ty * TEX + tx]; if ((d >>> 24) > 100) px = d; }
          if (det) px = detailPx(px, ty, tx, det);
          const df = ditherOn ? (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) * 0.0045 : 0;
          const fUse = df ? Math.max(0, Math.min(1, fi + df)) : fi;
          fb[o] = outdoor ? tint(px, fUse, fogR, fogG, fogB, cr, cg, cb) : shade(px, fUse, cr, cg, cb);
          dbuf[o] = t; mbuf[o] = MAT_W;
        }
        return ys < clip ? ys : clip;
      };
      // interiors: walls reach the ceiling unless they carry their own top
      const wallTop0 = map.ceil ? ceilZ : 0;
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
              let tD, frac, hit = true, dSide = side;
              // swinging leaf (0: sliding leaf; 1: miss; 2: hit)
              const sw = (openAmt > 0 && typeof Doors !== 'undefined') ? Doors.swing(d, cx, cy, CX, CY, rdx, rdy, grid, mw) : 0;
              if (sw) { hit = sw === 2; if (hit) { tD = Doors.out.t; frac = Doors.out.u + openAmt; dSide = Doors.out.side; } }
              else if (side === 0) { tD = tIn + ddx * 0.5; const hy = CY + tD * rdy; if ((hy | 0) !== cy) hit = false; frac = hy - cy; }
              else { tD = tIn + ddy * 0.5; const hx = CX + tD * rdx; if ((hx | 0) !== cx) hit = false; frac = hx - cx; }
              if (hit && frac >= openAmt) {
                clip = riser(x, rdx, rdy, tIn, zOut, base, wallX, side, sideOf(cx, cy), -1e9, null, clip);
                clip = surf(x, rdx, rdy, tIn, base, tD, base, texOfFloor(cx, cy), clip);
                const dTex = textures[c.tex] || stoneTex;
                clip = riser(x, rdx, rdy, tD, base, base + 1, frac - openAmt, dSide, dTex, base, dTex, clip, ci);
                // a lintel over the door, up to the ceiling of a tall room
                if (wallTop0 > base + 1) clip = riser(x, rdx, rdy, tD, base + 1, wallTop0, frac - openAmt, dSide, stoneTex, base + 1, stoneTex, clip);
                if (tD < nearest) nearest = tD;
                // past a closed door: only taller things beyond can still show
                capZ = Math.max(base + 1, wallTop0); capTex = dTex; tIn = tD;
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
            const top = c.top != null ? c.top : Math.max(base + 1, wallTop0);
            const wTex = textures[c.tex] || stoneTex;
            if (tIn < nearest && top > zOut + 0.02) nearest = tIn;
            clip = riser(x, rdx, rdy, tIn, zOut, top, wallX, side, wTex, base, sideOf(cx, cy), clip, ci);
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
        // rows at or above the horizon already hold sky or ceiling (and their depth)
        let o = (horizon + 1) * w + x;
        for (let y = horizon + 1; y < clip; y++, o += w) { if (y < 0) continue; dbuf[o] = 1e9; mbuf[o] = 0; fb[o] = fogPx; }
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
      e._screen = { x0: dsX / S, x1: deX / S, y0: dsY / S, y1: deY / S, dist: d, z: trY };
      const tw = sp.w, th = sp.h, sdat = sp.data;
      const [scr, scg, scb] = ptLights.length ? sampleLight(e.x, e.y) : [0, 0, 0];
      const ecr = e.elite ? scr + 28 : scr, ecg = e.elite ? scg + 20 : scg, ecb = scb;
      const emit = sp.emit || null, fiE = Math.max(fi, 0.95);
      const glowEnt = e.glow > 0.3 || e.animGlow > 0.3 || !!e.glassLamp || e.item === 'shard' || e.item === 'core', matS = glowEnt ? 8 : 6;
      const plain = !skew && !flip && alpha >= 1 && !hurt && !emit;
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
            if ((px >>> 24) > 100 && (!relief || dbuf[o] > trY)) { fb[o] = e.flash ? rgb(255, 230, 200) : (outdoor ? tint(px, fi, fogR, fogG, fogB, ecr, ecg, ecb) : shade(px, fi, ecr, ecg, ecb)); dbuf[o] = trY; mbuf[o] = matS; }
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
            const lit = emit && emit[ty * tw + tx], fiP = lit ? fiE : fi;
            dbuf[o] = trY; mbuf[o] = lit ? 8 : matS;
            if (hurt) { const r = px & 255, g = (px >>> 8) & 255, b = (px >>> 16) & 255, k = hurt * 0.45; px = ((px & 0xff000000) | ((b * (1 - k)) << 16) | ((g * (1 - k)) << 8) | (r + (255 - r) * k)) >>> 0; }
            fb[o] = e.flash ? rgb(255, 230, 200) : (outdoor ? tint(px, fiP, fogR, fogG, fogB, ecr, ecg, ecb) : shade(px, fiP, ecr, ecg, ecb));
          }
          o += w;
        }
      }
    }

    // -- post hooks: fog grading, bloom, mist, water ------------------
    if (postHooks.length) { FI.light = light_; FI.ambient = ambient; runHooks(postHooks); }
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
          const ry = (Math.max(s.y0, Math.min(s.y1, cy)) * S) | 0, px = Math.max(0, Math.min(RW - 1, (cx * S) | 0));
          if (ry >= 0 && ry < RH && dbuf[ry * RW + px] < s.z - 0.05) continue;   // something solid is in front
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
  // depth and material at a logical (320x150) pixel of the last frame
  function depthAt(x, y) { x = (x * S) | 0; y = (y * S) | 0; if (x < 0 || y < 0 || x >= RW || y >= RH) return 1e9; return dbuf[y * RW + x]; }
  function materialAt(x, y) { x = (x * S) | 0; y = (y * S) | 0; if (x < 0 || y < 0 || x >= RW || y >= RH) return 0; return mbuf[y * RW + x]; }
  // Render the 3D view at 1x or 2x. The canvas grows with it and its 2D
  // transform scales, so HUD and overlay code keep drawing in 320x200.
  function setScale(s) {
    s = s === 2 ? 2 : 1;
    if (s === S && canvas.width === VW * s) return S;
    S = s; RW = VW * S; RH = VIEW_H * S;
    canvas.width = VW * S; canvas.height = VH * S;
    ctx.setTransform(S, 0, 0, S, 0, 0); ctx.imageSmoothingEnabled = false;
    frame = ctx.createImageData(RW, RH); fb = new Uint32Array(frame.data.buffer);
    zbuf = new Float32Array(RW); ztop = new Float32Array(RW);
    dbuf = new Float32Array(RW * RH); mbuf = new Uint8Array(RW * RH);
    skyR = new Float32Array(RH); skyG = new Float32Array(RH); skyB = new Float32Array(RH);
    return S;
  }
  function getScale() { return S; }
  // the coloured light the given entities cast on a world point (walls shadow it)
  function lightAt(entities, wx, wy) { if (!map) return [0, 0, 0]; gatherLights(entities, {}); return sampleLight(wx, wy); }
  return { canvas, ctx, cam, textures, sprites, images, loadAll, render, setMap, scanRelief, setWeather, pick, pickWall, setFlicker, setTime, depthAt, materialAt, rgb, VW, VH, VIEW_H,
    setScale, getScale, lightAt, addSkyHook, addPostHook, addTexture, addSprite, setEmissive, setDetail, setLook, MAT };
})();
