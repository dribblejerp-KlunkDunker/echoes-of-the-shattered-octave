// ============================================================
//  ECHOES OF THE SHATTERED OCTAVE — software raycaster
//  320x200 internal resolution, Daggerfall-style view + HUD
// ============================================================
'use strict';

const VW = 320, VH = 200;       // full canvas
const VIEW_H = 150;             // 3D viewport height (HUD below)
const TEX = 64;

const Engine = (() => {
  const canvas = document.getElementById('view');
  const ctx = canvas.getContext('2d', { alpha: false });
  const frame = ctx.createImageData(VW, VIEW_H);
  const fb = new Uint32Array(frame.data.buffer);
  const zbuf = new Float32Array(VW);

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
      else if (kind === 'spr') sprites[k] = { w: im.width, h: im.height, data: u32, img: im };
      else images[k] = im;
      n++;
      if (onProgress) onProgress(n / keys.length);
    }
  }

  // ---- colour helpers -------------------------------------------------
  // pixels are ABGR little-endian in Uint32
  function shade(px, f) {
    // f in [0,1]
    if (f >= 0.999) return px;
    const r = (px & 255) * f, g = ((px >> 8) & 255) * f, b = ((px >> 16) & 255) * f;
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }
  function tint(px, f, tr, tg, tb) {
    // blend toward fog colour (tr,tg,tb) by (1-f), then darken by ambient light (module var `light_`)
    const r = ((px & 255) * f + tr * (1 - f)) * light_, g = (((px >> 8) & 255) * f + tg * (1 - f)) * light_, b = (((px >> 16) & 255) * f + tb * (1 - f)) * light_;
    return (255 << 24) | (b << 16) | (g << 8) | r;
  }
  let light_ = 1;
  function rgb(r, g, b) { return (255 << 24) | (b << 16) | (g << 8) | r; }

  // ---- renderer state -------------------------------------------------
  const cam = { x: 2, y: 2, dir: 0, pitch: 0, bob: 0 };
  let map = null;        // current map object (grid, w, h, cells)
  let fogDist = 12, fogR = 0, fogG = 0, fogB = 0, lightFlicker = 1, ambient = 0;
  let ambientDark = 1;   // night factor
  const FOV = 1.0;       // plane length (approx 90 deg)

  function setMap(m) { map = m; fogDist = m.fogDist || 12; ambient = m.ambient || 0; const fc = m.fogColor || [0, 0, 0]; fogR = fc[0]; fogG = fc[1]; fogB = fc[2]; }

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
      skyR[y] = r; skyG[y] = g; skyB[y] = b;
    }
    skyDay = dayness;
    ambientDark = 0.5 + 0.5 * dayness;
  }
  buildSky(0.3);

  // ---- main render ---------------------------------------------------
  const sprList = [];
  function render(entities, timeOfDay, opts) {
    opts = opts || {};
    if (!map) return;
    const w = VW, h = VIEW_H;
    const outdoor = !!map.outdoor;
    if (outdoor) buildSky(timeOfDay);
    const grid = map.cells, mw = map.w, mh = map.h;
    const dirX = Math.cos(cam.dir), dirY = Math.sin(cam.dir);
    const planeX = -dirY * FOV * 0.66, planeY = dirX * FOV * 0.66;
    const horizon = (h >> 1) + (cam.pitch | 0) + (cam.bob | 0);
    const posZ = 0.5 * h;
    const flick = lightFlicker;
    const light = outdoor ? 1 : 1;
    light_ = outdoor ? ambientDark : 1;
    const fogMul = 1 / fogDist;

    // -- floor & ceiling ----------------------------------------------
    const floorTexDefault = textures[map.floor] || textures.t_flag;
    const ceilTex = map.ceil ? textures[map.ceil] : null;
    const rayDirX0 = dirX - planeX, rayDirY0 = dirY - planeY;
    const rayDirX1 = dirX + planeX, rayDirY1 = dirY + planeY;
    const floorMap = map.floorCells; // Uint8Array index into map.floorTextures or null
    const floorTexList = map.floorTextures ? map.floorTextures.map(n => textures[n]) : null;

    for (let y = 0; y < h; y++) {
      const isFloor = y > horizon;
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
      if (p === 0) { let o = y * w; for (let x = 0; x < w; x++) fb[o++] = rgb(fogR, fogG, fogB); continue; }
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
      for (let x = 0; x < w; x++) {
        const cx = fx | 0, cy = fy | 0;
        const tx = ((fx - cx) * TEX) & 63, ty = ((fy - cy) * TEX) & 63;
        let t = tex;
        if (isFloor && floorMap && cx >= 0 && cy >= 0 && cx < mw && cy < mh) { const idx = floorMap[cy * mw + cx]; if (idx) t = floorTexList[idx]; }
        const px = t[ty * TEX + tx];
        fb[o++] = outdoor ? tint(px, fi, fogR, fogG, fogB) : shade(px, fi);
        fx += stepX; fy += stepY;
      }
    }

    // -- walls --------------------------------------------------------
    const doors = map.doors;
    for (let x = 0; x < w; x++) {
      const camX = 2 * x / w - 1;
      const rdx = dirX + planeX * camX, rdy = dirY + planeY * camX;
      let mapX = cam.x | 0, mapY = cam.y | 0;
      const ddx = Math.abs(1 / rdx), ddy = Math.abs(1 / rdy);
      let stepX, stepY, sdx, sdy;
      if (rdx < 0) { stepX = -1; sdx = (cam.x - mapX) * ddx; } else { stepX = 1; sdx = (mapX + 1 - cam.x) * ddx; }
      if (rdy < 0) { stepY = -1; sdy = (cam.y - mapY) * ddy; } else { stepY = 1; sdy = (mapY + 1 - cam.y) * ddy; }
      let hit = 0, side = 0, texName = null, dist = 0, wallX = 0, iter = 0, isDoor = false;
      while (!hit && iter++ < 96) {
        if (sdx < sdy) { sdx += ddx; mapX += stepX; side = 0; } else { sdy += ddy; mapY += stepY; side = 1; }
        if (mapX < 0 || mapY < 0 || mapX >= mw || mapY >= mh) { hit = 2; break; }
        const c = grid[mapY * mw + mapX];
        if (c) {
          if (c.door) {
            // thin door in the middle of the cell, sliding along its own axis
            const d = doors[mapY * mw + mapX];
            const openAmt = d ? d.open : 0;
            if (openAmt >= 0.98) continue;
            if (side === 0) {
              const pd = sdx - ddx + ddx * 0.5; // distance to mid-plane
              const hy = cam.y + pd * rdy;
              if ((hy | 0) !== mapY) continue;
              const frac = hy - mapY;
              if (frac < openAmt) continue;
              dist = pd; wallX = frac - openAmt; hit = 1; texName = c.tex; isDoor = true;
            } else {
              const pd = sdy - ddy + ddy * 0.5;
              const hx = cam.x + pd * rdx;
              if ((hx | 0) !== mapX) continue;
              const frac = hx - mapX;
              if (frac < openAmt) continue;
              dist = pd; wallX = frac - openAmt; hit = 1; texName = c.tex; isDoor = true;
            }
          } else {
            hit = 1; texName = c.tex;
            dist = side === 0 ? (sdx - ddx) : (sdy - ddy);
            wallX = side === 0 ? cam.y + dist * rdy : cam.x + dist * rdx;
            wallX -= Math.floor(wallX);
          }
        }
      }
      if (hit !== 1) { zbuf[x] = 1e9; continue; }
      zbuf[x] = dist;
      const lineH = (h / dist) | 0;
      let ds = -lineH / 2 + horizon, de = lineH / 2 + horizon;
      const dsC = Math.max(0, ds | 0), deC = Math.min(h - 1, de | 0);
      const tex = textures[texName] || textures.t_stone;
      let tx = (wallX * TEX) | 0;
      if ((side === 0 && rdx > 0) || (side === 1 && rdy < 0)) tx = TEX - tx - 1;
      let f = light * (1 - dist * fogMul);
      if (f < 0) f = 0;
      f = ambient + (1 - ambient) * f;
      if (side === 1) f *= 0.8;
      if (!outdoor) f *= flick;
      const fi = Math.round(f * 255) / 255;
      const step = TEX / lineH;
      let tp = (dsC - ds) * step;
      let o = dsC * w + x;
      // adjacent-door shading: darken door frames slightly
      for (let y = dsC; y <= deC; y++) {
        const ty = (tp | 0) & 63; tp += step;
        const px = tex[ty * TEX + tx];
        fb[o] = outdoor ? tint(px, fi, fogR, fogG, fogB) : shade(px, fi);
        o += w;
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
      const sp = sprites[e.sprite]; if (!sp) continue;
      const sx = e.x - cam.x, sy = e.y - cam.y;
      const trX = invDet * (dirY * sx - dirX * sy);
      const trY = invDet * (-planeY * sx + planeX * sy);
      if (trY <= 0.08) continue;
      const screenX = ((w / 2) * (1 + trX / trY)) | 0;
      const scale = e.scale || 1;
      const sprH = Math.abs((h / trY) * scale) | 0;
      const vMove = ((e.yOff || 0) * h / trY) | 0; // + = lower
      // sprites sit on the floor: bottom at horizon + half unit height
      const baseline = horizon + ((0.5 * h / trY) | 0) + vMove;
      const dsY = baseline - sprH, deY = baseline;
      const sprW = (sprH * sp.w / sp.h) | 0;
      const dsX = screenX - (sprW >> 1), deX = dsX + sprW;
      const d = Math.sqrt(e._d2);
      let f = light * (1 - d * fogMul);
      if (f < 0) f = 0;
      f = ambient + (1 - ambient) * f;
      if (!outdoor) f *= flick;
      if (e.glow) f = Math.max(f, e.glow);
      if (e.flash) f = 1;
      const fi = Math.round(f * 255) / 255;
      const xs = Math.max(0, dsX), xe = Math.min(w - 1, deX);
      const ys = Math.max(0, dsY), ye = Math.min(h - 1, deY);
      if (xe < xs || ye < ys) continue;
      e._screen = { x0: dsX, x1: deX, y0: dsY, y1: deY, dist: d };
      const tw = sp.w, th = sp.h, sdat = sp.data;
      for (let x = xs; x <= xe; x++) {
        if (trY >= zbuf[x]) continue;
        const tx = (((x - dsX) * tw) / sprW) | 0;
        let o = ys * w + x;
        for (let y = ys; y <= ye; y++) {
          const ty = (((y - dsY) * th) / sprH) | 0;
          const px = sdat[ty * tw + tx];
          if ((px >>> 24) > 100) {
            fb[o] = e.flash ? rgb(255, 230, 200) : (outdoor ? tint(px, fi, fogR, fogG, fogB) : shade(px, fi));
          }
          o += w;
        }
      }
    }

    // -- post: hush / damage tints handled by caller via overlay -------
    ctx.putImageData(frame, 0, 0);
  }

  // Which entity is under the crosshair (centre) and within reach
  function pick(entities, maxDist) {
    let best = null, bd = 1e9;
    const cx = VW / 2, cy = VIEW_H / 2 + cam.pitch;
    for (const e of entities) {
      const s = e._screen; if (!s || e.hidden) continue;
      if (s.dist > maxDist) continue;
      if (cx >= s.x0 - 4 && cx <= s.x1 + 4 && cy >= s.y0 && cy <= s.y1 + 6) {
        if (s.dist < bd) { bd = s.dist; best = e; }
      }
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

  return { canvas, ctx, cam, textures, sprites, images, loadAll, render, setMap, pick, pickWall, setFlicker, rgb, VW, VH, VIEW_H };
})();
