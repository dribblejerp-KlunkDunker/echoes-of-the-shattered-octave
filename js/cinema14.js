// ============================================================
//  cinema14 — Phase 14 (a world that shows the story), the CINEMA team: the owner's approved "Phase 2" look, made real.
//
//  The owner approved a prototype (reference-mock.js, level 2) that did everything in one slow per-pixel post pass. Here:
//    - ground fog: a low band hugging the floor below the horizon, thicker with distance, modulated by a precomputed
//      tiling noise texture that drifts slowly.                                                 switch "Ground fog"
//    - aerial perspective: depth blends toward the sky colour just above the horizon (outdoors) or a warm black (indoors).
//      The engine's own far haze (FAR team: viewDist above 1.4 outdoors, F.far) does this outdoors in the Cinematic preset,
//      so this term switches itself off whenever F.far (or Engine.hasAerial) is true: in practice it runs indoors and
//      when far mode is off.                                                                     switch "Ground fog"
//    - bloom on emissive pixels only (Engine.MAT.glow: lamps, fire, Light-glass, emissive sprites; and the sun/moon disc on
//      the sky) via a downsample chain 1/2 -> 1/4 -> 1/8 of the logical view (box down, tent, add up).
//    - god rays: a radial blur of bright light / sky pixels toward the brightest point on an 80x38 grid (a quarter of the
//      logical view, at any render scale), 12 samples.                                          switch "Cinematic light"
//    - grade: saturation 1.12 and contrast 1.08, then a vignette (0.35 at the corners).          switch "Cinematic grade"
//  Fog, aerial, bloom and rays are ONE post hook (order 95: after post.js's grade at 40 and the sparks at 45, before the
//  camera feel at 100 and Dread at 110): the light chain runs on small buffers, then one full-resolution loop adds fog,
//  aerial and light, touching only the rows that have any. The GRADE AND VIGNETTE are not done in JavaScript: they are a
//  backdrop-filter (saturate + contrast) with a radial-gradient vignette on an overlay that covers exactly the 3D view
//  (not the HUD), so the compositor does them on the GPU. In JavaScript they alone cost ~1.7 ms per frame at 2x on the
//  build server, which is most of the 2.5 ms budget; the game already grades #view with a CSS filter (#view.unwrite).
//
//  The three switches are GFX flags (cineLight, cineFog, cineGrade) that only the Cinematic preset turns on
//  (js/presets.js CINEMA_ONLY): Original / Low / Medium / High / Ultra frames are byte-identical to a page without this
//  file, and the overlay is not displayed. The owner rejected blur and heavy particles: there is no depth of field, no
//  tilt-shift and no particles here.
//
//  Accessibility: No flashes = the rays hold still (no shimmer) and bloom is halved; Reduce motion = the fog noise is
//  frozen; High contrast (html.ac-hc) = no grade and no vignette; colour-blind palettes are not read or touched.
//  Settings: localStorage 'octave.cinema14.v1' remembers the Cinematic preset and the three switches between sessions.
//  Procedural stand-in: the fog noise is generated here; nothing is loaded. Nothing here touches saves or Math.random.
// ============================================================
'use strict';

for (const k of ['cineLight', 'cineFog', 'cineGrade']) {
  if (typeof GFX === 'undefined') break;
  if (GFX[k] === undefined) GFX[k] = false;   // the boot preset (medium) has them off; presets.js turns them on in Cinematic
  if (!GFX.FX.includes(k)) GFX.FX.push(k);
}

const CINEMA14 = (() => {
  const KEY = 'octave.cinema14.v1';
  const FLAGS = ['cineLight', 'cineFog', 'cineGrade'];
  // Tunables. The values follow the owner's prototype (reference-mock.js, level 2), retuned for the cheaper passes.
  const T = {
    aerial: { reach: 1.2, pow: 1.6, out: 0.75, inn: 0.45, inCol: [8, 6, 10] },
    fog: { a: 0.32, near: 1.5, band: 5, above: 0.05, distK: 0.9, inCol: [70, 62, 58], outAdd: [20, 20, 24], outMul: 0.9, drift1: 1.2, drift2: -0.72 },
    bloom: { glowLuma: 165, sunLuma: 225, gain: 0.5, noFlashK: 0.5, cap: 96 },
    rays: { luma: 150, steps: 12, decay: 0.865, reach: 0.9, str: 0.55, shimmer: 0.12 },
    grade: { sat: 1.12, con: 1.08, vig: 0.35, vigPow: 1.1 },
  };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const on = (k) => typeof GFX !== 'undefined' && GFX[k] === true;
  const engineAerial = (F) => F.far === true || (typeof Engine !== 'undefined' && (typeof Engine.hasAerial === 'function' ? !!Engine.hasAerial() : Engine.hasAerial === true));
  const stats = { profile: false, ms: 0, frames: 0, last: null, ph: { light: 0, final: 0 } };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // ---- tiling fog noise: two octaves of smooth value noise, each periodic, baked once (procedural stand-in) ------------
  // Octave 1 cells are 24x10 logical pixels, octave 2 cells 9x5, as in the prototype; each is its own texture so the two
  // can drift at their own speeds with one lookup each.
  function bakeNoise(cw, ch, cellsX, cellsY, seed) {
    const W = cw * cellsX, H = ch * cellsY, g = new Float32Array(cellsX * cellsY), out = new Float32Array(W * H);
    let s = seed >>> 0;
    for (let i = 0; i < g.length; i++) { s = (Math.imul(s, 1103515245) + 12345) >>> 0; g[i] = (s >>> 8) / 16777216; }
    for (let y = 0; y < H; y++) {
      const fy = y / ch, yi = fy | 0, v0 = fy - yi, v = v0 * v0 * (3 - 2 * v0), y0 = yi % cellsY, y1 = (yi + 1) % cellsY;
      for (let x = 0; x < W; x++) {
        const fx = x / cw, xi = fx | 0, u0 = fx - xi, u = u0 * u0 * (3 - 2 * u0), x0 = xi % cellsX, x1 = (xi + 1) % cellsX;
        const a = g[y0 * cellsX + x0], b = g[y0 * cellsX + x1], c = g[y1 * cellsX + x0], d = g[y1 * cellsX + x1];
        out[y * W + x] = a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
      }
    }
    return { W, H, data: out };
  }
  const N1 = bakeNoise(24, 10, 16, 8, 419), N2 = bakeNoise(9, 5, 32, 16, 528);   // 384x80 and 288x80, tiling

  // ---- buffers, rebuilt only when the render size changes --------------------------------------------------------------
  // The light chain works on the LOGICAL view (320x150), whatever the render scale: level 1 is half of it (160x75), level 2
  // a quarter (80x38, also the god-ray grid), level 3 an eighth (40x19). At 2x the bright pass reads one pixel per logical
  // pixel, so the whole light chain costs the same at 1x and 2x; only the final loop runs at full resolution.
  let FW = 0, FH = 0, FS = 1;
  let w1 = 0, h1 = 0, w2 = 0, h2 = 0, w3 = 0, h3 = 0;
  let b1 = null, b2 = null, b3 = null, rS = null, rO = null, act1 = null, rowAct = null, rowV = null;   // RGB interleaved Float32
  let ux0 = null, ux1 = null, uxf = null, uy0 = null, uy1 = null, uyf = null;   // all per logical pixel
  let n1x = null, n2x = null, fogN = null, LR = null, LG = null, LB = null;
  function ensure(w, h, S) {
    if (w === FW && h === FH && S === FS) return;
    FW = w; FH = h; FS = S;
    const lw = Math.ceil(w / S), lh = Math.ceil(h / S);
    w1 = Math.ceil(lw / 2); h1 = Math.ceil(lh / 2); w2 = Math.ceil(w1 / 2); h2 = Math.ceil(h1 / 2); w3 = Math.ceil(w2 / 2); h3 = Math.ceil(h2 / 2);
    b1 = new Float32Array(w1 * h1 * 3); b2 = new Float32Array(w2 * h2 * 3); b3 = new Float32Array(w3 * h3 * 3);
    rS = new Float32Array(w2 * h2 * 3); rO = new Float32Array(w2 * h2 * 3);
    act1 = new Uint8Array(w1 * h1); rowAct = new Uint8Array(w1); rowV = new Float32Array(w1 * 3);
    // per logical pixel: bilinear tables from level 1 (2 logical pixels per cell), vignette parts, fog noise columns
    ux0 = new Int32Array(lw); ux1 = new Int32Array(lw); uxf = new Float32Array(lw); uy0 = new Int32Array(lh); uy1 = new Int32Array(lh); uyf = new Float32Array(lh);
    for (let x = 0; x < lw; x++) { const u = (x + 0.5) / 2 - 0.5, i = Math.floor(u); ux0[x] = clamp(i, 0, w1 - 1); ux1[x] = clamp(i + 1, 0, w1 - 1); uxf[x] = u - i; }
    for (let y = 0; y < lh; y++) { const u = (y + 0.5) / 2 - 0.5, i = Math.floor(u); uy0[y] = clamp(i, 0, h1 - 1); uy1[y] = clamp(i + 1, 0, h1 - 1); uyf[y] = u - i; }
    n1x = new Int32Array(lw); n2x = new Int32Array(lw);
    fogN = new Int32Array(lw); LR = new Int32Array(lw); LG = new Int32Array(lw); LB = new Int32Array(lw);
  }
  const AER_N = 512; const aerLut = new Int32Array(AER_N); let aerKey = '';
  function buildAer(aK) {
    const key = T.aerial.pow + '|' + aK;
    if (key === aerKey) return;
    aerKey = key;
    for (let i = 0; i < AER_N; i++) { const k = Math.round(256 * aK * Math.pow(i / (AER_N - 1), T.aerial.pow)); aerLut[i] = k < 3 ? 0 : k; }   // under 1%: nothing to see, skip it
  }
  // the two fog octaves as bytes, pre-weighted 0.7 and 0.3, so their sum is 0..255
  const N1q = new Uint8Array(N1.data.length), N2q = new Uint8Array(N2.data.length);
  for (let i = 0; i < N1q.length; i++) N1q[i] = Math.round(N1.data[i] * 0.7 * 255);
  for (let i = 0; i < N2q.length; i++) N2q[i] = Math.round(N2.data[i] * 0.3 * 255);

  // ---- the sky colour just above the horizon (or the fog colour when there is no sky in view) -------------------------
  const skyCol = [0, 0, 0];
  function skyColour(F) {
    const { w, h, mbuf, fb, horizon } = F; let r = 0, g = 0, b = 0, c = 0;
    const S = F.S || 1, y0 = clamp((horizon | 0) - 6 * S, 0, h - 1);
    for (let y = Math.max(0, y0 - 8 * S); y <= y0; y += S) for (let x = 0, o = y * w; x < w; x += 2 * S) if (mbuf[o + x] === 1) { const p = fb[o + x]; r += p & 255; g += (p >> 8) & 255; b += (p >> 16) & 255; c++; }
    if (c) { skyCol[0] = r / c; skyCol[1] = g / c; skyCol[2] = b / c; } else { skyCol[0] = F.fogR; skyCol[1] = F.fogG; skyCol[2] = F.fogB; }
    return skyCol;
  }

  // ---- light: bright pass (one sample per logical pixel) into two sources: bloom (emissive + sun) and rays -----------
  const best = { x: 0, y: 0, v: 0 };
  let lastShimmer = 1, lastBloomK = 0, lastFogShift = 0;
  function brightPass(F) {
    const { fb, mbuf, w, h } = F, cb = T.bloom, cr = T.rays, S = F.S || 1;
    b1.fill(0); rS.fill(0);
    // as the prototype: a pixel's weight ramps from the threshold to white, judged on the colour actually shown
    const gL = cb.glowLuma, sunL = cb.sunLuma, rayL = cr.luma;
    const gs = 1 / (255 - gL), ss = 1 / (255 - sunL), rs = 1 / (255 - rayL);
    let any = false;
    for (let y = 0, ly = 0; y < h; y += S, ly++) {
      const o = y * w, r1 = (ly >> 1) * w1, r2 = (ly >> 2) * w2;
      for (let x = 0, lx = 0; x < w; x += S, lx++) {
        const m = mbuf[o + x];
        if (m !== 8 && m !== 1) continue;
        const p = fb[o + x], r = p & 255, g = (p >> 8) & 255, b = (p >> 16) & 255;
        const l = (r * 77 + g * 150 + b * 29) >> 8;
        if (l <= rayL && l <= gL) continue;
        let k = 0;
        if (m === 8) { if (l > gL) k = (l - gL) * gs; } else if (l > sunL) k = (l - sunL) * ss;
        if (k > 0) { const i = (r1 + (lx >> 1)) * 3; b1[i] += r * k; b1[i + 1] += g * k; b1[i + 2] += b * k; any = true; }
        if (l > rayL) {
          const kr = (l - rayL) * rs * (m === 8 ? 1 : 0.6), j = (r2 + (lx >> 2)) * 3;
          rS[j] += r * kr; rS[j + 1] += g * kr; rS[j + 2] += b * kr;
        }
      }
    }
    if (any) for (let i = 0; i < b1.length; i++) b1[i] *= 0.25;   // box: a level-1 cell is 2x2 logical pixels
    best.v = 0;
    for (let i = 0, c = 0; c < w2 * h2; c++, i += 3) {
      if (rS[i] + rS[i + 1] + rS[i + 2] === 0) continue;
      rS[i] *= 0.0625; rS[i + 1] *= 0.0625; rS[i + 2] *= 0.0625;   // a ray cell is 4x4 logical pixels
      const v = rS[i] + rS[i + 1] + rS[i + 2];
      if (v > best.v) { best.v = v; best.x = c % w2; best.y = (c / w2) | 0; }
    }
    return any;
  }
  function down(src, sw, sh, dst, dw, dh) {
    for (let y = 0; y < dh; y++) {
      const ya = Math.min(sh - 1, y * 2), yb = Math.min(sh - 1, y * 2 + 1);
      for (let x = 0; x < dw; x++) {
        const xa = Math.min(sw - 1, x * 2), xb = Math.min(sw - 1, x * 2 + 1), o = (y * dw + x) * 3;
        const i00 = (ya * sw + xa) * 3, i10 = (ya * sw + xb) * 3, i01 = (yb * sw + xa) * 3, i11 = (yb * sw + xb) * 3;
        dst[o] = (src[i00] + src[i10] + src[i01] + src[i11]) * 0.25;
        dst[o + 1] = (src[i00 + 1] + src[i10 + 1] + src[i01 + 1] + src[i11 + 1]) * 0.25;
        dst[o + 2] = (src[i00 + 2] + src[i10 + 2] + src[i01 + 2] + src[i11 + 2]) * 0.25;
      }
    }
  }
  // 3x3 tent blur in place (through a scratch buffer), used on each level before it is added upward
  let tScr = new Float32Array(0);
  function tent(buf, bw, bh) {
    if (tScr.length < buf.length) tScr = new Float32Array(buf.length);
    const t = tScr;
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const o = (y * bw + x) * 3, l = (y * bw + (x > 0 ? x - 1 : 0)) * 3, r = (y * bw + (x < bw - 1 ? x + 1 : x)) * 3;
      t[o] = (buf[l] + 2 * buf[o] + buf[r]) * 0.25; t[o + 1] = (buf[l + 1] + 2 * buf[o + 1] + buf[r + 1]) * 0.25; t[o + 2] = (buf[l + 2] + 2 * buf[o + 2] + buf[r + 2]) * 0.25;
    }
    for (let y = 0; y < bh; y++) for (let x = 0; x < bw; x++) {
      const o = (y * bw + x) * 3, u = ((y > 0 ? y - 1 : 0) * bw + x) * 3, d = ((y < bh - 1 ? y + 1 : y) * bw + x) * 3;
      buf[o] = (t[u] + 2 * t[o] + t[d]) * 0.25; buf[o + 1] = (t[u + 1] + 2 * t[o + 1] + t[d + 1]) * 0.25; buf[o + 2] = (t[u + 2] + 2 * t[o + 2] + t[d + 2]) * 0.25;
    }
  }
  // bilinear upsample-add of a coarse buffer (cw x ch) into a finer one (fw x fh), scaled by k. The index and weight tables
  // for each size pair are built once.
  const upTabs = {};
  function upTab(cn, fn) {
    const key = cn + '>' + fn;
    let t = upTabs[key]; if (t) return t;
    const a = new Int32Array(fn), b = new Int32Array(fn), f = new Float32Array(fn), sc = cn / fn;
    for (let i = 0; i < fn; i++) { const u = (i + 0.5) * sc - 0.5, j = Math.floor(u); a[i] = clamp(j, 0, cn - 1); b[i] = clamp(j + 1, 0, cn - 1); f[i] = u - j; }
    t = upTabs[key] = { a, b, f }; return t;
  }
  let upRow = new Float32Array(0);
  function upAdd(src, cw, ch, dst, fw, fh, k) {
    const X = upTab(cw, fw), Y = upTab(ch, fh), xa = X.a, xb = X.b, xf = X.f;
    if (upRow.length < cw * 3) upRow = new Float32Array(cw * 3);
    const t = upRow;
    for (let y = 0; y < fh; y++) {
      // separable: blend the two source rows once, then each destination cell blends two neighbours of that row
      const fy = Y.f[y], ra = Y.a[y] * cw * 3, rb = Y.b[y] * cw * 3, ky0 = (1 - fy) * k, ky1 = fy * k;
      for (let q = 0; q < cw * 3; q++) t[q] = src[ra + q] * ky0 + src[rb + q] * ky1;
      let o = y * fw * 3;
      for (let x = 0; x < fw; x++, o += 3) {
        const fx = xf[x], gx = 1 - fx, i = xa[x] * 3, j = xb[x] * 3;
        dst[o] += t[i] * gx + t[j] * fx; dst[o + 1] += t[i + 1] * gx + t[j + 1] * fx; dst[o + 2] += t[i + 2] * gx + t[j + 2] * fx;
      }
    }
  }
  // god rays on the 80x38 grid: every cell walks 12 steps toward the brightest cell, gathering decaying light
  function rays(F, noFlash) {
    const c = T.rays;
    if (best.v < 1) return 0;
    rO.fill(0);
    const bx = best.x + 0.5, by = best.y + 0.5, steps = c.steps;
    // a gentle shimmer of the shafts (dust in the light); No flashes holds them still
    const at = F.animT || 0, sh = noFlash ? 1 : 1 + c.shimmer * Math.sin(at * 2.3) * Math.sin(at * 0.9 + 1.1);
    lastShimmer = sh;
    const str = c.str * sh / steps * 2;
    for (let y = 0; y < h2; y++) for (let x = 0; x < w2; x++) {
      const dx = (bx - (x + 0.5)) / steps * c.reach, dy = (by - (y + 0.5)) / steps * c.reach;
      let sx = x + 0.5, sy = y + 0.5, wt = 1, r = 0, g = 0, b = 0;
      for (let s = 0; s < steps; s++) {
        sx += dx; sy += dy;
        const j = ((sy | 0) * w2 + (sx | 0)) * 3;   // the walk heads inward to a cell on the grid, so it never leaves it
        r += rS[j] * wt; g += rS[j + 1] * wt; b += rS[j + 2] * wt; wt *= c.decay;
      }
      const o = (y * w2 + x) * 3; rO[o] = r * str; rO[o + 1] = g * str; rO[o + 2] = b * str;
    }
    return 1;
  }

  // one render row of the final loop (kept small and separate so the engine optimises it on its own)
  function shadeRow(fb, dbuf, o, w, sh, doAer, doFogRow, rowLit, aScale, aR, aG, aB, fDist, fNear, fR, fG, fB) {
    const rowAF = doAer || doFogRow, AM = AER_N - 1;
    for (let x = 0; x < w; x++) {
      const i = o + x, p = fb[i], lx = x >> sh;
      let r = p & 255, g = (p >> 8) & 255, b = (p >> 16) & 255, ch = rowLit;
      if (rowAF) {
        const d = dbuf[i];
        if (d < 1e8) {   // the sky (Engine.MAT.sky) is exactly the pixels at 1e9
          if (doAer) {
            let ai = (d * aScale) | 0; if (ai > AM) ai = AM;
            const k = aerLut[ai];
            if (k !== 0) { r += ((aR - r) * k + 128) >> 8; g += ((aG - g) * k + 128) >> 8; b += ((aB - b) * k + 128) >> 8; ch = true; }
          }
          if (doFogRow && d >= fNear) {
            let dk = (d * fDist) | 0; if (dk > 256) dk = 256;
            const k = (fogN[lx] * dk) >> 8;
            if (k !== 0) { r += ((fR - r) * k + 128) >> 8; g += ((fG - g) * k + 128) >> 8; b += ((fB - b) * k + 128) >> 8; ch = true; }
          }
        }
      }
      if (!ch) continue;   // nothing landed on this pixel: leave it as it is
      if (rowLit) { r += LR[lx]; g += LG[lx]; b += LB[lx]; if (r > 255) r = 255; if (g > 255) g = 255; if (b > 255) b = 255; }
      fb[i] = (p & -16777216) | (b << 16) | (g << 8) | r;
    }
  }

  // ---- the hook ------------------------------------------------------------------------------------------------------
  function hook(F) {
    const doLight = on('cineLight'), doFog = on('cineFog');
    if (!doLight && !doFog) return;
    if (!F.fb || !F.dbuf || !F.mbuf) return;
    const t0 = stats.profile ? now() : 0;
    const { fb, dbuf, mbuf, w, h } = F, S = F.S || 1;
    const noFlash = !!(typeof GFX !== 'undefined' && GFX.noFlash), still = !!(typeof GFX !== 'undefined' && GFX.reduceMotion);
    ensure(w, h, S);
    // a lightning flash already lifts the frame: light gives way to it, as post.js bloom does
    const flash = F.wx ? F.wx.flash || 0 : 0, fk = clamp(1 - flash * 1.6, 0, 1);

    // 1. light, all on the small buffers. Bloom: box down 1 -> 2 -> 3, tent each coarse level, add upward. The rays live on
    //    level 2's grid and join it there; level 2 is then added once into level 1, which the final loop reads.
    let lit = false;
    if (doLight && fk > 0.02) {
      const any = brightPass(F);
      const hasRays = rays(F, noFlash);
      if (any || hasRays) {
        const bk = T.bloom.gain * fk * (noFlash ? T.bloom.noFlashK : 1); lastBloomK = bk;
        const n2 = w2 * h2 * 3, n1 = w1 * h1 * 3;
        if (any) {
          down(b1, w1, h1, b2, w2, h2); down(b2, w2, h2, b3, w3, h3);
          tent(b3, w3, h3); tent(b2, w2, h2);
          upAdd(b3, w3, h3, b2, w2, h2, 1); tent(b2, w2, h2);
          for (let i = 0; i < n2; i++) b2[i] *= bk;
          for (let i = 0; i < n1; i++) b1[i] *= bk;
        } else { b2.fill(0); b1.fill(0); }
        if (hasRays) for (let i = 0; i < n2; i++) b2[i] += rO[i] * fk;
        upAdd(b2, w2, h2, b1, w1, h1, 1);
        const cap = T.bloom.cap;
        for (let i = 0, c = 0; c < w1 * h1; c++, i += 3) {
          if (b1[i] > cap) b1[i] = cap; if (b1[i + 1] > cap) b1[i + 1] = cap; if (b1[i + 2] > cap) b1[i + 2] = cap;
          const a = b1[i] + b1[i + 1] + b1[i + 2] > 2.5 ? 1 : 0;   // adds at least about a level somewhere act1[c] = a; if (a) lit = true;
        }
      }
    }

    const t1 = stats.profile ? now() : 0;
    if (stats.profile) stats.ph.light += t1 - t0;
    // 2. aerial and fog constants (integers: weights in 1/256)
    const sky = skyColour(F), base = F.fogDist || 12, out = !!F.outdoor;
    const doAer = doFog && !engineAerial(F);
    const A = T.aerial, Fo = T.fog;
    buildAer(out ? A.out : A.inn);
    const aR = (out ? sky[0] : A.inCol[0]) | 0, aG = (out ? sky[1] : A.inCol[1]) | 0, aB = (out ? sky[2] : A.inCol[2]) | 0;
    const aScale = (AER_N - 1) / (base * A.reach);
    const fR = (out ? sky[0] * Fo.outMul + Fo.outAdd[0] : Fo.inCol[0]) | 0, fG = (out ? sky[1] * Fo.outMul + Fo.outAdd[1] : Fo.inCol[1]) | 0, fB = (out ? sky[2] * Fo.outMul + Fo.outAdd[2] : Fo.inCol[2]) | 0;
    const fDist = 256 / (base * Fo.distK), fNear = Fo.near, horizon = F.horizon;
    const tt = still ? 0 : (F.animT || 0);
    if (doFog) {
      const o1 = Math.round(tt * Fo.drift1), o2 = Math.round(tt * Fo.drift2); lastFogShift = o1 * 1000 + o2;
      for (let lx = 0, lw = n1x.length; lx < lw; lx++) { n1x[lx] = (((lx + o1) % N1.W) + N1.W) % N1.W; n2x[lx] = (((lx + o2) % N2.W) + N2.W) % N2.W; }
    }

    // 3. the one full-resolution loop. Everything smooth (fog noise, the light add) is worked out once per LOGICAL pixel
    //    per logical row; each render pixel then only does its own colour and depth arithmetic. Rows with nothing to do
    //    are not touched at all.
    const lw = Math.ceil(w / S), lh = Math.ceil(h / S), sh = S === 2 ? 1 : 0;
    for (let ly = 0; ly < lh; ly++) {
      // fog: whether this logical row holds the band, and its strength times the noise, per logical column
      let rowFog = 0;
      if (doFog) {
        const below = ((ly + 0.5) * S - horizon) / h;
        if (below >= -Fo.above) rowFog = Math.round(256 * Fo.a * Math.max(0, 1 - Math.abs(below) * Fo.band));
        if (rowFog > 0) { const n1r = (ly % N1.H) * N1.W, n2r = (ly % N2.H) * N2.W; for (let lx = 0; lx < lw; lx++) fogN[lx] = (rowFog * (N1q[n1r + n1x[lx]] + N2q[n2r + n2x[lx]])) >> 8; }
      }
      const rowAF = doAer || rowFog > 0;
      // light: bilinear from level 1 at each logical pixel's centre
      let rowLit = false;
      if (lit) {
        const ra = uy0[ly] * w1, rb = uy1[ly] * w1, fy = uyf[ly];
        let anyA = false;
        for (let x = 0; x < w1; x++) { const a = act1[ra + x] | act1[rb + x]; rowAct[x] = a; if (a) anyA = true; }
        if (anyA) {
          rowLit = true;
          // the two level-1 rows blended once, then each logical pixel blends its two cells of that row
          const A3 = ra * 3, B3 = rb * 3, gy = 1 - fy;
          for (let q = 0; q < w1 * 3; q++) rowV[q] = b1[A3 + q] * gy + b1[B3 + q] * fy;
          for (let lx = 0; lx < lw; lx++) {
            const xa = ux0[lx], xb = ux1[lx];
            if (!(rowAct[xa] | rowAct[xb])) { LR[lx] = 0; LG[lx] = 0; LB[lx] = 0; continue; }
            const fx = uxf[lx], gx = 1 - fx, i = xa * 3, j = xb * 3;
            LR[lx] = (rowV[i] * gx + rowV[j] * fx + 0.5) | 0; LG[lx] = (rowV[i + 1] * gx + rowV[j + 1] * fx + 0.5) | 0; LB[lx] = (rowV[i + 2] * gx + rowV[j + 2] * fx + 0.5) | 0;
          }
        }
      }
      if (!rowAF && !rowLit) continue;   // nothing on this row: leave it untouched
      const y1 = Math.min(h, (ly + 1) * S);
      for (let y = ly * S; y < y1; y++) shadeRow(fb, dbuf, y * w, w, sh, doAer, rowFog > 0, rowLit, aScale, aR, aG, aB, fDist, fNear, fR, fG, fB);
    }
    if (stats.profile) { const t2 = now(); stats.ph.final += t2 - t1; stats.ms += t2 - t0; stats.frames++; }
    stats.last = { lit, aerial: doAer, fog: doFog, shimmer: lastShimmer, bloomK: lastBloomK, fogShift: lastFogShift, best: { x: best.x, y: best.y, v: Math.round(best.v) } };
  }

  // ---- grade + vignette on the compositor ---------------------------------------------------------------------------
  // alpha of black at distance t (0 centre .. 1 corner) = vig * t^vigPow, as the prototype's 1 - t^2.2*0.35 (its t was the
  // squared distance ratio raised to 1.1)
  function vignetteCss() {
    const g = T.grade, stops = [0, 0.3, 0.45, 0.6, 0.7, 0.8, 0.9, 1];
    return 'radial-gradient(circle farthest-corner at 50% 50%, ' + stops.map(t => 'rgba(0,0,0,' + (g.vig * Math.pow(t, 2 * g.vigPow)).toFixed(4) + ') ' + Math.round(t * 100) + '%').join(', ') + ')';
  }
  let overlay = null;
  function ensureOverlay() {
    if (overlay || typeof document === 'undefined') return overlay;
    const view = document.getElementById('view');
    if (!view || !view.parentNode) return null;
    if (!document.getElementById('cinema14-style')) {
      const st = document.createElement('style'); st.id = 'cinema14-style';
      const vh = typeof Engine !== 'undefined' && Engine.VIEW_H && Engine.VH ? (Engine.VIEW_H / Engine.VH * 100) : 75;
      st.textContent = '#cine14-veil{position:absolute;left:0;top:0;width:100%;height:' + vh + '%;pointer-events:none;display:none;' +
        'backdrop-filter:saturate(' + T.grade.sat + ') contrast(' + T.grade.con + ');-webkit-backdrop-filter:saturate(' + T.grade.sat + ') contrast(' + T.grade.con + ');' +
        'background:' + vignetteCss() + '}' +
        '#cine14-veil.on{display:block}' +
        'html.ac-hc #cine14-veil{display:none!important}';   // high contrast: no grade, no vignette
      document.head.appendChild(st);
    }
    overlay = document.createElement('div'); overlay.id = 'cine14-veil'; overlay.setAttribute('aria-hidden', 'true');
    view.insertAdjacentElement('afterend', overlay);   // right above the 3D view, under every other overlay and panel
    return overlay;
  }
  function syncGrade() {
    const want = on('cineGrade');
    const el = want ? ensureOverlay() : overlay;
    if (el) el.classList.toggle('on', want);
  }
  // whether the grade is showing now (tests)
  function gradeShown() { return !!(overlay && overlay.classList.contains('on') && getComputedStyle(overlay).display !== 'none'); }

  // ---- settings: remembered between sessions -------------------------------------------------------------------------
  let quiet = false;
  function save() {
    if (quiet || typeof GFX === 'undefined') return;
    try {
      const mine = FLAGS.some(k => GFX[k] === true);
      localStorage.setItem(KEY, JSON.stringify({ p: GFX.preset === 'cinematic' || mine ? 1 : 0, l: GFX.cineLight ? 1 : 0, f: GFX.cineFog ? 1 : 0, g: GFX.cineGrade ? 1 : 0 }));
    } catch (e) { /* no storage: fine */ }
  }
  function restore() {
    let o = null;
    try { o = JSON.parse(localStorage.getItem(KEY) || 'null'); } catch (e) { return; }
    if (!o || typeof o !== 'object' || o.p !== 1 || typeof PRESETS === 'undefined') return;
    quiet = true;
    try {
      PRESETS.apply('cinematic');
      GFX.cineLight = o.l !== 0; GFX.cineFog = o.f !== 0; GFX.cineGrade = o.g !== 0;
      GFX.preset = PRESETS.current(); GFX.changed();
    } finally { quiet = false; }
  }

  // ---- Options rows (Graphics & access, after the graphics block) ----------------------------------------------------
  const ROWS = [
    ['cine-light', 'Cinematic light', 'bloom on lamps and Light-glass, soft light shafts', 'cineLight'],
    ['cine-fog', 'Ground fog', 'a low drifting fog band and distance haze', 'cineFog'],
    ['cine-grade', 'Cinematic grade', 'richer colour and a soft vignette', 'cineGrade'],
  ];
  function syncBtn(b, k) { const v = GFX[k] === true; b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v); }
  function setSwitch(k, v) {
    if (!FLAGS.includes(k)) return false;
    GFX[k] = !!v;
    if (typeof PRESETS !== 'undefined') { GFX.preset = PRESETS.current(); }
    GFX.changed();
    if (typeof PRESETS !== 'undefined' && PRESETS.refresh) PRESETS.refresh();
    syncRows();
    return GFX[k];
  }
  function syncRows() { for (const [id, , , k] of ROWS) { const b = typeof document !== 'undefined' && document.getElementById(id); if (b) syncBtn(b, k); } }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('cine-light')) return;
    let anchor = document.getElementById('gfx-curve');
    for (const [id, label, hint, k] of ROWS) {
      const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.id = id + '-label'; lab.textContent = label + ' ';
      const small = document.createElement('small'); small.className = 'muted'; small.textContent = hint; lab.appendChild(small);
      const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = id; b.type = 'button'; b.setAttribute('aria-label', label);
      b.onclick = () => setSwitch(k, GFX[k] !== true);
      syncBtn(b, k);
      if (anchor && anchor.parentNode === grid) { anchor.insertAdjacentElement('afterend', b); anchor.insertAdjacentElement('afterend', lab); anchor = b; }
      else { grid.appendChild(lab); grid.appendChild(b); }
    }
  }
  function wire() {
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () {
        const r = _acc.apply(this, arguments);
        try { appendRows(); } catch (e) { console.warn('cinema14 rows failed', e); }
        return r;
      };
    }
    if (typeof GFX !== 'undefined') GFX.onChange(() => { save(); try { syncGrade(); syncRows(); } catch (e) { /* menu closed */ } });
    // the preset buttons live in presets.js: keep the switch rows in step when one is pressed
  }

  if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook(hook, 95);
  wire();
  restore();
  try { if (typeof document !== 'undefined' && document.readyState === 'loading') document.addEventListener('DOMContentLoaded', syncGrade); else syncGrade(); } catch (e) { /* no DOM */ }

  return { KEY, FLAGS, T, hook, stats, gradeShown, syncGrade, overlay: () => overlay, setSwitch, ROWS, noise: { N1, N2 }, engineAerial, sizes: () => ({ w1, h1, w2, h2, w3, h3 }) };
})();
if (typeof window !== 'undefined') window.CINEMA14 = CINEMA14;
