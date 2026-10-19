// ============================================================
//  sky — Phase 2 module: night stars, painted area panoramas and the
//  Drift-Kestrel's flyovers in Part Three. Three sky hooks (Engine.addSkyHook),
//  so everything draws before the LANDMARKS ridges, the terrain and the walls
//  and only ever touches pixels the renderer marked as sky (F.mbuf === 1).
//  Switches: GFX.stars, GFX.panoramas, GFX.flyovers (all false = the old sky).
// ============================================================
'use strict';

const SKY = (() => {
  const TAU = Math.PI * 2;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const PN = 2048;                       // panorama table width: one entry per 0.176 degrees
  const FLAGS = ['stars', 'panoramas', 'flyovers'];
  if (typeof GFX !== 'undefined') {
    for (const k of FLAGS) { if (GFX[k] === undefined) GFX[k] = true; if (!GFX.FX.includes(k)) GFX.FX.push(k); }
  }
  const on = (k) => typeof GFX === 'undefined' || GFX[k] !== false;
  // how much of the sky is night: 0 by day, 1 deep in the dark (F.skyDay falls to 0)
  const nightOf = (F) => clamp((0.5 - F.skyDay) / 0.45, 0, 1);

  function mulberry(seed) {
    let a = seed >>> 0;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  // one deterministic number in 0..1 from an integer and a salt (the flyover schedule)
  function hash01(n, salt) { const r = mulberry((Math.imul(n | 0, 2654435761) ^ Math.imul(salt | 0, 40503)) >>> 0); r(); return r(); }

  // bearing of a world direction (0 = +x, as atan2(y, x)) -> screen column, or -1 if behind / outside the view
  function projectX(F, bearing, margin) {
    const c = Math.cos(bearing), s = Math.sin(bearing);
    const fwd = c * F.dirX + s * F.dirY; if (fwd < 0.15) return -1;
    const p = Math.hypot(F.planeX, F.planeY);
    const camX = (-c * F.dirY + s * F.dirX) / (fwd * p);
    const m = 1 + (margin || 0);
    if (camX < -m || camX > m) return -1;
    return (camX + 1) * 0.5 * F.w;
  }

  // ---- night stars -------------------------------------------------
  // A fixed field: each star owns a bearing and an elevation, so it turns with
  // the view like the real thing. Projected per star (no per-pixel work).
  const NSTAR = 760;
  const st = { cx: new Float32Array(NSTAR), sy: new Float32Array(NSTAR), el: new Float32Array(NSTAR), mag: new Float32Array(NSTAR), ph: new Float32Array(NSTAR), sp: new Float32Array(NSTAR), r: new Uint8Array(NSTAR), g: new Uint8Array(NSTAR), b: new Uint8Array(NSTAR) };
  (function buildStars() {
    const r = mulberry(0x57A25);
    for (let i = 0; i < NSTAR; i++) {
      const th = r() * TAU; st.cx[i] = Math.cos(th); st.sy[i] = Math.sin(th);
      st.el[i] = 0.03 + Math.pow(r(), 0.85) * 1.18;           // fractions of half the view height above the horizon
      const m = r(); st.mag[i] = 0.22 + 0.78 * m * m * m;     // most are faint, a few are bright
      st.ph[i] = r() * TAU; st.sp[i] = 1.2 + r() * 3.4;
      const tint = r();                                       // cold white, blue, or a warm ember
      if (tint < 0.55) { st.r[i] = 235; st.g[i] = 240; st.b[i] = 255; } else if (tint < 0.82) { st.r[i] = 170; st.g[i] = 195; st.b[i] = 255; } else { st.r[i] = 255; st.g[i] = 214; st.b[i] = 160; }
    }
  })();
  const stats = { stars: 0, panoPx: 0, flyPx: 0 };

  function drawStars(F) {
    stats.stars = 0;
    if (!F.outdoor || !on('stars')) return;
    const night = nightOf(F);
    // cloud and haze put the stars out; a storm or a sea-fog leaves none
    const vis = night * clamp(1 - F.wx.cloud * 1.45, 0, 1) * clamp(1 - F.wx.haze * 3.2, 0, 1) * (1 - F.wx.flash);
    if (vis < 0.03) return;
    const { fb, mbuf, w, h, S, horizon, dirX, dirY } = F;
    const p = Math.hypot(F.planeX, F.planeY), halfH = h * 0.5, t = F.animT;
    const extent = h * 0.1;           // stars dim into the horizon haze
    let n = 0;
    for (let i = 0; i < NSTAR; i++) {
      const c = st.cx[i], s = st.sy[i];
      const fwd = c * dirX + s * dirY; if (fwd < 0.15) continue;
      const camX = (-c * dirY + s * dirX) / (fwd * p);
      if (camX < -1.02 || camX > 1.02) continue;
      const x = ((camX + 1) * 0.5 * w) | 0;
      const y = (horizon - st.el[i] * halfH) | 0;
      if (y < 0 || y >= horizon) continue;
      const ext = clamp((horizon - y) / extent, 0, 1);
      const tw = 0.76 + 0.24 * Math.sin(t * st.sp[i] + st.ph[i]);   // subtle twinkle tied to the animation clock
      const base = vis * st.mag[i] * tw * ext;
      if (base < 0.03) continue;
      const bright = st.mag[i] > 0.7;
      for (let k = 0; k < 5; k++) {
        if (k > 0 && !(bright && base > 0.35)) break;
        const ox = k === 1 ? -S : k === 2 ? S : 0, oy = k === 3 ? -S : k === 4 ? S : 0;
        const kf = k ? 0.3 : 1;
        for (let dy = 0; dy < S; dy++) {
          const yy = y + oy + dy; if (yy < 0 || yy >= horizon) continue;
          for (let dx = 0; dx < S; dx++) {
            const xx = x + ox + dx; if (xx < 0 || xx >= w) continue;
            const o = yy * w + xx; if (mbuf[o] !== 1) continue;
            const px = fb[o], pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
            // only where the sky is dark: moon glow and dusk wash the stars out
            const lum = (pr + pg + pb) / 3, allow = clamp(1 - (lum - 20) / 110, 0, 1);
            const a = base * kf * allow; if (a < 0.02) continue;
            const r = pr + st.r[i] * a, g = pg + st.g[i] * a, b = pb + st.b[i] * a;
            fb[o] = (255 << 24) | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);
          }
        }
      }
      n++;
    }
    stats.stars = n;
  }

  // ---- painted area panoramas --------------------------------------
  // Per map, three layers of distant country painted once into a 2048-wide
  // height table (plus a tone table for patchy light). Each frame they are laid
  // just above the horizon at fixed bearings, far layer first, mixed toward the
  // air colour by time of day and weather. Procedural stand-in for painted art.
  function mkLayer(maxH, col, mix, alpha, cap) { return { h: new Float32Array(PN), tone: new Uint8Array(PN), maxH: maxH * 1.5, col, mix: mix - 0.08, a: Math.min(1, alpha + 0.04), cap: cap || null, lights: null }; }
  // smooth periodic value noise added into a layer's heights
  function addNoise(a, r, cells, amp, base) {
    const v = new Float32Array(cells); for (let i = 0; i < cells; i++) v[i] = r();
    for (let i = 0; i < PN; i++) { const u = i / PN * cells, i0 = u | 0, f = u - i0, sm = f * f * (3 - 2 * f); a[i] += base + amp * (v[i0 % cells] * (1 - sm) + v[(i0 + 1) % cells] * sm); }
  }
  // a stand of trees: conifers are narrow spires, round crowns are soft domes
  function addTrees(a, r, base, spacing, hLo, hHi, wLo, wHi, kind) {
    for (let pos = r() * spacing; pos < PN; pos += spacing * (0.55 + 0.9 * r())) {
      const hh = hLo + r() * (hHi - hLo), wd = wLo + r() * (wHi - wLo), c = Math.round(pos);
      for (let d = -Math.ceil(wd); d <= Math.ceil(wd); d++) {
        const t = Math.abs(d) / wd; if (t >= 1) continue;
        const prof = kind === 'conifer' ? Math.pow(1 - t, 0.85) * (0.9 + 0.1 * ((d & 1) ? 1 : 0)) : Math.sqrt(1 - t * t);
        const i = (c + d + PN) & (PN - 1), v = base + hh * prof; if (v > a[i]) a[i] = v;
      }
    }
  }
  function addBlock(a, c, w, top, slope) { for (let k = 0; k < w; k++) { const i = (c + k + PN) & (PN - 1), v = top * (1 - slope * (k / w)); if (v > a[i]) a[i] = v; } }
  function addSpire(a, c, w, top) { for (let k = -w; k <= w; k++) { const i = (c + k + PN) & (PN - 1), v = top * (1 - Math.abs(k) / (w + 1)); if (v > a[i]) a[i] = v; } }
  function addHouse(L, r, c, w, wall, roof) {
    for (let k = 0; k < w; k++) { const i = (c + k) & (PN - 1), v = wall + roof * (1 - Math.abs(2 * k / (w - 1) - 1)); if (v > L.h[i]) L.h[i] = v; }
    const ch = (c + Math.round(w * 0.7)) & (PN - 1); for (let k = 0; k < 2; k++) { const i = (ch + k) & (PN - 1); L.h[i] = Math.max(L.h[i], wall + roof * 0.7 + 0.13); }
    if (L.lights && r() < 0.6) L.lights.push({ i: (c + 1 + Math.floor(r() * (w - 2))) & (PN - 1), f: wall * 0.55 });
  }
  function addTone(L, r) { const v = new Float32Array(48); for (let i = 0; i < 48; i++) v[i] = r(); for (let i = 0; i < PN; i++) { const u = i / PN * 48, i0 = u | 0, f = u - i0; L.tone[i] = clamp(((v[i0 % 48] * (1 - f) + v[(i0 + 1) % 48] * f) * 4) | 0, 0, 3); } }
  function finish(L, r) { for (let i = 0; i < PN; i++) L.h[i] = clamp(L.h[i], 0, 1); addTone(L, r); return L; }

  // recipes: far wash, middle treeline, near skyline. Colours are the silhouette
  // before the air takes it; mix is how far each layer sits in the haze.
  const RECIPES = {
    oakhaven(r) {   // wooded downs, the Hedge wall and the old town's roofs and chimneys
      const A = mkLayer(0.085, [54, 58, 78], 0.78, 0.62, [150, 156, 176]); addNoise(A.h, r, 9, 0.5, 0.18); addNoise(A.h, r, 31, 0.18, 0);
      const B = mkLayer(0.075, [34, 44, 56], 0.66, 0.86); addNoise(B.h, r, 14, 0.2, 0.16); addTrees(B.h, r, 0.12, 9, 0.2, 0.55, 5, 9, 'round');
      const C = mkLayer(0.115, [32, 30, 42], 0.52, 0.96); C.lights = [];
      for (let i = 0; i < PN; i++) C.h[i] = 0.12 + 0.03 * ((i >> 2) & 1);  // the Hedge wall's crenellations
      for (let c = 20; c < PN - 30; c += 20 + Math.floor(r() * 26)) { if (r() < 0.78) addHouse(C, r, c, 9 + Math.floor(r() * 9), 0.22 + r() * 0.2, 0.18 + r() * 0.16); }
      addBlock(C.h, 310, 14, 0.78, 0.35); addSpire(C.h, 700, 5, 0.9); addBlock(C.h, 1180, 12, 0.66, 0.5); addBlock(C.h, 1620, 16, 0.58, 0.2); addSpire(C.h, 1900, 4, 0.74);
      return [finish(A, r), finish(B, r), finish(C, r)];
    },
    clearing(r) {   // the forest edge outside the Hedge, a standing-stone ring and a broken pylon
      const A = mkLayer(0.09, [44, 52, 70], 0.8, 0.6, [142, 150, 170]); addNoise(A.h, r, 7, 0.55, 0.15); addNoise(A.h, r, 25, 0.16, 0);
      const B = mkLayer(0.085, [26, 40, 38], 0.68, 0.88); addNoise(B.h, r, 18, 0.14, 0.12); addTrees(B.h, r, 0.1, 6, 0.3, 0.85, 4, 7, 'conifer');
      const C = mkLayer(0.1, [24, 32, 32], 0.54, 0.96); addNoise(C.h, r, 22, 0.1, 0.08); addTrees(C.h, r, 0.08, 11, 0.25, 0.7, 6, 10, 'round');
      for (let k = 0; k < 7; k++) addBlock(C.h, 1000 + k * 18, 5, 0.34 + r() * 0.2, 0.25);   // the standing stones
      addBlock(C.h, 1700, 7, 0.95, 0.65);                                                   // the pylon, snapped
      return [finish(A, r), finish(B, r), finish(C, r)];
    },
    whispergrove(r) {   // violet hush: weeping willows, the sunken court's broken colonnade and spires
      const A = mkLayer(0.08, [64, 52, 88], 0.8, 0.58); addNoise(A.h, r, 8, 0.5, 0.2); addNoise(A.h, r, 27, 0.15, 0);
      const B = mkLayer(0.08, [46, 38, 68], 0.68, 0.84); addNoise(B.h, r, 16, 0.18, 0.14); addTrees(B.h, r, 0.1, 10, 0.3, 0.7, 7, 12, 'round');
      const C = mkLayer(0.13, [34, 28, 54], 0.54, 0.95); addNoise(C.h, r, 12, 0.08, 0.06);
      for (let k = 0; k < 34; k++) { const c = 60 + k * 54 + Math.floor(r() * 10); addBlock(C.h, c, 3, 0.25 + r() * 0.65, r() < 0.5 ? 0.6 : 0.05); if (r() < 0.2) addBlock(C.h, c, 40, 0.3, 0); }
      for (let k = 0; k < 6; k++) addSpire(C.h, 150 + k * 330 + Math.floor(r() * 60), 3, 0.82 + r() * 0.18);
      return [finish(A, r), finish(B, r), finish(C, r)];
    },
    deepwoods(r) {   // snow-shouldered far hills, black conifer forest, a broken tower stump
      const A = mkLayer(0.1, [50, 54, 74], 0.8, 0.62, [150, 160, 184]); addNoise(A.h, r, 6, 0.6, 0.18); addNoise(A.h, r, 22, 0.2, 0);
      const B = mkLayer(0.1, [24, 32, 36], 0.66, 0.9); addNoise(B.h, r, 15, 0.12, 0.1); addTrees(B.h, r, 0.08, 4, 0.35, 0.95, 3, 6, 'conifer');
      const C = mkLayer(0.12, [18, 24, 28], 0.52, 0.97); addNoise(C.h, r, 24, 0.08, 0.06); addTrees(C.h, r, 0.06, 5, 0.3, 1, 3, 6, 'conifer');
      addBlock(C.h, 900, 11, 0.7, 0.4);
      return [finish(A, r), finish(B, r), finish(C, r)];
    },
    _default(r) {   // rolling country with a few lone trees
      const A = mkLayer(0.085, [52, 56, 74], 0.8, 0.6); addNoise(A.h, r, 8, 0.5, 0.18); addNoise(A.h, r, 27, 0.15, 0);
      const B = mkLayer(0.075, [38, 42, 52], 0.68, 0.84); addNoise(B.h, r, 13, 0.3, 0.1);
      const C = mkLayer(0.08, [30, 32, 40], 0.56, 0.94); addNoise(C.h, r, 18, 0.16, 0.06); addTrees(C.h, r, 0.06, 40, 0.3, 0.6, 5, 8, 'round');
      return [finish(A, r), finish(B, r), finish(C, r)];
    },
  };
  const panos = {};
  function panorama(id) {
    const key = RECIPES[id] ? id : '_default';
    if (!panos[key]) panos[key] = RECIPES[key](mulberry(hashStr('pano:' + key)));
    return panos[key];
  }
  for (const k in RECIPES) panorama(k);   // built once at load, never per frame

  // per-frame state kept outside the draw so nothing allocates
  let bi = new Int16Array(320), biDir = NaN, biW = 0, biP = NaN;
  const lut = new Uint8Array(3 * 4 * 16 * 3);       // layer x tone x step x rgb, rebuilt each frame
  function drawPanorama(F) {
    stats.panoPx = 0;
    if (!F.outdoor || !on('panoramas')) return;
    const { fb, mbuf, w, h, horizon } = F;
    if (horizon < 1) return;
    const layers = panorama(F.map && F.map.id);
    // bearing index of every column, recomputed only when the view turns
    if (bi.length !== w) { bi = new Int16Array(w); biDir = NaN; }
    if (biDir !== F.cam.dir || biW !== w || biP !== F.planeX) {
      for (let x = 0; x < w; x++) { const cx = 2 * x / w - 1; const ang = Math.atan2(F.dirY + F.planeY * cx, F.dirX + F.planeX * cx); bi[x] = (((ang / TAU + 0.5) * PN) | 0) & (PN - 1); }
      biDir = F.cam.dir; biW = w; biP = F.planeX;
    }
    // the air: half the sky's own colour at the horizon, half the map's fog (which already carries weather)
    const yh = clamp(horizon, 0, h - 1) * w;
    let sr = 0, sg = 0, sb = 0;
    for (let k = 1; k <= 3; k++) { const px = fb[yh + ((w * k / 4) | 0)]; sr += px & 255; sg += (px >> 8) & 255; sb += (px >> 16) & 255; }
    const hr = sr / 6 + F.fogR * 0.5, hg = sg / 6 + F.fogG * 0.5, hb = sb / 6 + F.fogB * 0.5;
    const dayM = (0.34 + 0.66 * F.skyDay) * (1 - F.wx.dark * 0.45);
    const hazeAdd = F.wx.haze * 0.7;
    for (let li = 0; li < 3; li++) {
      const L = layers[li];
      for (let tn = 0; tn < 4; tn++) {
        const tf = (0.86 + 0.09 * tn) * dayM;
        for (let s = 0; s < 16; s++) {
          const v = (s + 0.5) / 16;
          let r = L.col[0], g = L.col[1], b = L.col[2];
          if (L.cap && v > 0.68) { const k = (v - 0.68) / 0.32 * 0.55; r += (L.cap[0] - r) * k; g += (L.cap[1] - g) * k; b += (L.cap[2] - b) * k; }
          // soft wash: the base of each layer drowns in ground haze, the crest stays clearer
          const mix = clamp(L.mix + hazeAdd + (1 - v) * 0.28 - v * 0.05, 0, 0.96);
          const o = ((li * 4 + tn) * 16 + s) * 3;
          lut[o] = r * tf * (1 - mix) + hr * mix; lut[o + 1] = g * tf * (1 - mix) + hg * mix; lut[o + 2] = b * tf * (1 - mix) + hb * mix;
        }
      }
    }
    const yEnd = Math.min(horizon, h - 1);
    let n = 0;
    for (let li = 0; li < 3; li++) {
      const L = layers[li], a8 = (L.a * 256) | 0, a4 = a8 >> 1, span = L.maxH * h;
      const lb = li * 64 * 3;
      for (let x = 0; x < w; x++) {
        const idx = bi[x], hg = L.h[idx]; if (hg <= 0.004) continue;
        const rows = (hg * span + 0.5) | 0; if (rows < 1) continue;
        const yTop = horizon - rows + 1, y0 = yTop < 0 ? 0 : yTop;
        const tb = lb + L.tone[idx] * 16 * 3;
        for (let y = y0; y <= yEnd; y++) {
          const o = y * w + x; if (mbuf[o] !== 1) continue;
          const s = (((horizon - y) / rows) * 16) | 0, q = tb + (s > 15 ? 15 : s) * 3;
          const al = y === yTop ? a4 : a8;
          const px = fb[o], pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
          fb[o] = (255 << 24) | ((pb + (((lut[q + 2] - pb) * al) >> 8)) << 16) | ((pg + (((lut[q + 1] - pg) * al) >> 8)) << 8) | (pr + (((lut[q] - pr) * al) >> 8));
          n++;
        }
      }
    }
    // lit windows in the old town after dark
    const night = nightOf(F), L2 = layers[2];
    if (L2.lights && night > 0.25 && F.wx.haze < 0.25) {
      const aw = night * (1 - F.wx.haze * 3) * 0.85;
      for (let k = 0; k < L2.lights.length; k++) {
        const lt = L2.lights[k], x = projectX(F, (lt.i / PN - 0.5) * TAU, 0.02); if (x < 0) continue;
        const y = (horizon - lt.f * L2.maxH * h) | 0, xi = x | 0;
        for (let dy = 0; dy < F.S; dy++) for (let dx = 0; dx < F.S; dx++) {
          const yy = y + dy, xx = xi + dx; if (yy < 0 || yy > yEnd || xx >= w) continue;
          const o = yy * w + xx, px = fb[o], pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
          fb[o] = (255 << 24) | ((pb + ((70 - pb) * aw)) << 16) | ((pg + ((178 - pg) * aw)) << 8) | (pr + ((255 - pr) * aw));
        }
      }
    }
    stats.panoPx = n;
  }

  // ---- Drift-Kestrel flyovers --------------------------------------
  // Once a cycle (about 90 s) the airship crosses the sky over the Spectral
  // Woods and the Deep Woods for about 12 s, small and hazed, on a fixed
  // bearing path derived from the animation clock, so turning the view moves it.
  const FLY = { period: 90, dur: 12, maps: { whispergrove: true, deepwoods: true }, sweep: 1.35 };
  let forced = null;
  const last = { active: false, forced: false, u: 0, bearing: 0, elev: 0, dir: 1, x: -1, y: -1, drawn: 0, mapId: '' };
  // the flight in progress at animation time t, or null
  function flightAt(t) {
    if (forced) { if (t >= forced.start && t < forced.start + FLY.dur) return { start: forced.start, u: (t - forced.start) / FLY.dur, b0: forced.b0, dir: forced.dir, k: -1, forced: true }; return null; }
    if (t < 0) return null;
    const k = Math.floor(t / FLY.period), start = k * FLY.period + 18 + hash01(k, 1) * 50;
    if (t < start || t >= start + FLY.dur) return null;
    return { start, u: (t - start) / FLY.dur, b0: hash01(k, 2) * TAU - Math.PI, dir: hash01(k, 3) < 0.5 ? -1 : 1, k, forced: false };
  }
  const ship = { S: 0, dw: 0, dh: 0, r: null, g: null, b: null, a: null };
  // area-average the Kestrel sprite down to a few pixels once per render scale
  function buildShip(S) {
    const sp = typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites.kestrel; if (!sp) return false;
    const dw = 30 * S, dh = Math.max(2, Math.round(dw * sp.h / sp.w)), n = dw * dh;
    const r = new Uint8Array(n), g = new Uint8Array(n), b = new Uint8Array(n), a = new Uint8Array(n);
    const sx = sp.w / dw, sy = sp.h / dh;
    for (let y = 0; y < dh; y++) for (let x = 0; x < dw; x++) {
      let tr = 0, tg = 0, tb = 0, ta = 0, cnt = 0;
      for (let yy = (y * sy) | 0, ye = Math.max(yy + 1, ((y + 1) * sy) | 0); yy < ye; yy++) for (let xx = (x * sx) | 0, xe = Math.max(xx + 1, ((x + 1) * sx) | 0); xx < xe; xx++) {
        let px = sp.data[yy * sp.w + xx], al = px >>> 24;
        // willow foliage is olive (green close to red); the bronze hull and the mast are what should read at this size
        if (al > 0 && ((px >> 8) & 255) >= (px & 255) - 4) al *= 0.35;
        ta += al; cnt++;
        if (al > 0) { tr += (px & 255) * al; tg += ((px >> 8) & 255) * al; tb += ((px >> 16) & 255) * al; }
      }
      const o = y * dw + x;
      if (ta > 0) { r[o] = tr / ta; g[o] = tg / ta; b[o] = tb / ta; }
      a[o] = ta / cnt;
    }
    Object.assign(ship, { S, dw, dh, r, g, b, a });
    return true;
  }
  function drawFlyover(F) {
    last.drawn = 0; last.active = false;
    if (!F.outdoor || !on('flyovers')) return;
    const id = F.map && F.map.id;
    if (!forced && !FLY.maps[id]) return;
    const f = flightAt(F.animT); if (!f) return;
    const bearing = f.b0 + f.dir * (f.u - 0.5) * FLY.sweep;
    const elev = 0.56 + 0.05 * Math.sin(f.u * Math.PI * 2 + (f.k > 0 ? f.k : 0));
    Object.assign(last, { active: true, forced: f.forced, u: f.u, bearing, elev, dir: f.dir, mapId: id });
    const { fb, mbuf, w, h, S, horizon } = F;
    const xc = projectX(F, bearing, 0.15), yc = horizon - elev * h * 0.5;
    last.x = xc; last.y = yc;
    if (xc < -w * 0.15 || xc >= w * 1.15 || yc < 0 || yc >= horizon) return;
    if (ship.S !== S && !buildShip(S)) return;
    const { dw, dh } = ship;
    const fade = Math.min(1, f.u * FLY.dur, (1 - f.u) * FLY.dur);   // ease in and out over the first and last second
    const night = nightOf(F);
    const dayM = (0.34 + 0.66 * F.skyDay) * (1 - F.wx.dark * 0.45);
    // hazed: the ship is only ever part-covered, and the weather thins it further
    const dens = 0.62 * fade * clamp(1 - F.wx.haze * 1.6, 0.15, 1);
    const x0 = Math.round(xc - dw / 2), y0 = Math.round(yc - dh / 2), flip = f.dir < 0;
    let n = 0;
    for (let y = 0; y < dh; y++) {
      const yy = y0 + y; if (yy < 0 || yy >= horizon) continue;
      for (let x = 0; x < dw; x++) {
        const xx = x0 + x; if (xx < 0 || xx >= w) continue;
        const so = y * dw + (flip ? dw - 1 - x : x), sa = ship.a[so]; if (sa < 40) continue;
        const o = yy * w + xx; if (mbuf[o] !== 1) continue;
        const al = sa / 255 * dens;
        const px = fb[o], pr = px & 255, pg = (px >> 8) & 255, pb = (px >> 16) & 255;
        fb[o] = (255 << 24) | ((pb + (ship.b[so] * dayM * 0.8 - pb) * al) << 16) | ((pg + (ship.g[so] * dayM * 0.8 - pg) * al) << 8) | (pr + (ship.r[so] * dayM * 0.8 - pr) * al);
        n++;
      }
    }
    // after dark she carries a blinking lamp at the bow
    if (night > 0.3 && (F.animT % 1.6) < 0.25 && F.wx.haze < 0.3) {
      const lx = x0 + (flip ? 2 : dw - 3), ly = y0 + (dh >> 1);
      for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) {
        const yy = ly + dy, xx = lx + dx; if (yy < 0 || yy >= horizon || xx < 0 || xx >= w) continue;
        const o = yy * w + xx; if (mbuf[o] !== 1) continue;
        fb[o] = (255 << 24) | (60 << 16) | (70 << 8) | 255; n++;
      }
    }
    last.drawn = n; stats.flyPx = n;
  }

  // ---- registration -------------------------------------------------
  // orders: stars first, then the panorama over them, then the ship over both
  if (typeof Engine !== 'undefined' && Engine.addSkyHook) {
    Engine.addSkyHook(drawStars, 10);
    Engine.addSkyHook(drawPanorama, 20);
    Engine.addSkyHook(drawFlyover, 30);
  }

  return {
    // test hooks: force a flyover starting at animation time t0 (null clears it)
    // and read what the last frame did with it
    flyover(t0, bearing0, dir) {
      if (t0 == null) { forced = null; return null; }
      forced = { start: +t0, b0: bearing0 == null ? 0 : +bearing0, dir: dir < 0 ? -1 : 1 };
      return Object.assign({}, forced);
    },
    flightAt,
    state() { return Object.assign({}, last); },
    panorama,
    hooks: { stars: drawStars, panoramas: drawPanorama, flyovers: drawFlyover },   // so a test can time each on its own
    stats,
    FLY,
    NSTAR,
    PN,
  };
})();
