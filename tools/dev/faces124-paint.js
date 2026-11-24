'use strict';
// ============================================================================
//  faces124-paint — Phase 124 stage 1 TRIAL (not loaded by the game). Three ways of making a talk-window face in code:
//   A  painted from nothing (a bust painter at 384, brought down to 96)
//   B  the borrowed painting (townsman / townswoman) warped, aged, re-toned and re-dressed with painted overlays
//   C  the same, from the nearest of the painted busts
//  Run by tools/dev/faces124-trial.js in a page of the game's origin. No Math.random: hashed noise only.
// ============================================================================
const FT = (function () {
  const K = 4, N = 96 * K;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w || N; c.height = h || N; return c; };
  // ---------------------------------------------------------------- hashed noise
  function hs(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy);
    const a = hs(xi, yi, s), b = hs(xi + 1, yi, s), c = hs(xi, yi + 1, s), d = hs(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  const fbm = (x, y, s) => vn(x, y, s) * 0.55 + vn(x * 2.1, y * 2.1, s + 7) * 0.3 + vn(x * 4.3, y * 4.3, s + 13) * 0.15;
  const rgb = (c, k, a) => { k = k === undefined ? 1 : k; const f = (v) => Math.max(0, Math.min(255, Math.round(v * k))); return a === undefined ? `rgb(${f(c[0])},${f(c[1])},${f(c[2])})` : `rgba(${f(c[0])},${f(c[1])},${f(c[2])},${a})`; };
  const mix = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const ctxOf = (c) => { const x = c.getContext('2d', { willReadFrequently: true }); x.setTransform(K, 0, 0, K, 0, 0); return x; };
  function soft(x, blur, fn) { x.save(); x.filter = 'blur(' + (blur * K) + 'px)'; fn(); x.restore(); }
  function ell(x, cx, cy, rx, ry, fill, rot) { x.beginPath(); x.ellipse(cx, cy, Math.max(0.01, rx), Math.max(0.01, ry), rot || 0, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); }
  function stroke(x, pts, w, col) { x.beginPath(); x.moveTo(pts[0], pts[1]); if (pts.length === 4) x.lineTo(pts[2], pts[3]); else if (pts.length === 6) x.quadraticCurveTo(pts[2], pts[3], pts[4], pts[5]); else x.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); x.lineWidth = w; x.strokeStyle = col; x.lineCap = 'round'; x.stroke(); }
  function poly(x, pts, fill) { x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) { const p = pts[i]; if (p.length === 2) x.lineTo(p[0], p[1]); else if (p.length === 4) x.quadraticCurveTo(p[0], p[1], p[2], p[3]); else x.bezierCurveTo(p[0], p[1], p[2], p[3], p[4], p[5]); } x.closePath(); if (fill) { x.fillStyle = fill; x.fill(); } }

  // ---------------------------------------------------------------- texture: brushed grain from hashed noise
  // Modulates the pixels where alpha > 0 (a layer) or everywhere (the whole bust). amt ~0.2.
  function texture(c, amt, seed, angle) {
    const x = c.getContext('2d', { willReadFrequently: true }), id = x.getImageData(0, 0, N, N), d = id.data;
    const ca = Math.cos(angle || 0.6), sa = Math.sin(angle || 0.6);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const o = (j * N + i) * 4; if (d[o + 3] === 0) continue;
      const u = (i * ca + j * sa), v = (-i * sa + j * ca);
      const n = vn(u / 18, v / 3.2, seed) * 0.6 + vn(u / 7, v / 1.6, seed + 3) * 0.4, g = (hs(i, j, seed + 9) - 0.5) * 0.06;
      const m = 1 + (n - 0.5) * amt * 2 + g;
      d[o] *= m; d[o + 1] *= m; d[o + 2] *= m;
    }
    x.putImageData(id, 0, 0);
  }
  function blit(base, L) { const bx = base.getContext('2d'); bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.drawImage(L, 0, 0); bx.restore(); }
  function layer(base, fn, amt, seed, angle) { const L = mk(); fn(ctxOf(L)); if (amt) texture(L, amt, seed, angle); const bx = base.getContext('2d'); bx.save(); bx.setTransform(1, 0, 0, 1, 0, 0); bx.filter = 'blur(1.2px)'; bx.drawImage(L, 0, 0); bx.restore(); }
  function down(c) { const h = mk(192, 192), hx = h.getContext('2d'); hx.imageSmoothingQuality = 'high'; hx.drawImage(c, 0, 0, 192, 192);
    const o = mk(96, 96), ox = o.getContext('2d'); ox.imageSmoothingQuality = 'high'; ox.drawImage(h, 0, 0, 96, 96); return o; }

  // ---------------------------------------------------------------- the ground
  function ground(c, seed) {
    const x = ctxOf(c); x.fillStyle = 'rgb(30,23,20)'; x.fillRect(0, 0, 96, 96);
    const g = x.createRadialGradient(46, 34, 4, 48, 40, 66); g.addColorStop(0, 'rgba(66,50,40,0.9)'); g.addColorStop(1, 'rgba(20,15,13,0)'); x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    soft(x, 6, () => { for (let k = 0; k < 7; k++) ell(x, 10 + hs(k, 1, seed) * 76, 6 + hs(k, 2, seed) * 80, 9, 7, 'rgba(' + (hs(k, 3, seed) < 0.5 ? '12,9,8' : '58,44,36') + ',0.35)'); });
  }

  // ---------------------------------------------------------------- the body: cloth with light from the upper left
  function bodyPath(x, cx, sh, s, w) { w = w || 1; poly(x, [[cx - 6 * s, sh - 3], [cx - 16 * s * w, sh + 1, cx - 31 * s * w, sh + 3, cx - 38 * s * w, sh + 14], [cx - 46 * s * w, 100], [cx + 46 * s * w, 100], [cx + 38 * s * w, sh + 14], [cx + 31 * s * w, sh + 3, cx + 16 * s * w, sh + 1, cx + 6 * s, sh - 3]]); }
  function cloth(x, col, cx, sh, s, seed, w, folds) {
    bodyPath(x, cx, sh, s, w); x.fillStyle = rgb(col); x.fill();
    x.save(); bodyPath(x, cx, sh, s, w); x.clip();
    const g = x.createLinearGradient(cx - 40 * s, sh, cx + 40 * s, sh + 30); g.addColorStop(0, rgb(col, 1.25, 0.55)); g.addColorStop(0.45, rgb(col, 1, 0)); g.addColorStop(1, rgb(col, 0.45, 0.75)); x.fillStyle = g; x.fillRect(0, 0, 96, 100);
    const v = x.createLinearGradient(0, sh, 0, 96); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(10,6,4,0.45)'); x.fillStyle = v; x.fillRect(0, 0, 96, 100);
    soft(x, 0.7, () => { for (let k = 0; k < (folds || 9); k++) { const fx = cx + (hs(k, 5, seed) - 0.5) * 80 * s, fy = sh + 6 + hs(k, 6, seed) * 20, len = 14 + hs(k, 7, seed) * 30, bend = (hs(k, 8, seed) - 0.5) * 8;
      stroke(x, [fx, fy, fx + bend, fy + len / 2, fx + bend * 0.4, fy + len], 1.4 + hs(k, 9, seed) * 1.4, rgb(col, 0.5, 0.45)); stroke(x, [fx - 1.4, fy + 1, fx + bend - 1.4, fy + len / 2, fx + bend * 0.4 - 1.2, fy + len * 0.8], 0.8, rgb(col, 1.35, 0.25)); } });
    soft(x, 2.5, () => { ell(x, cx - 24 * s, sh + 6, 10 * s, 5, rgb(col, 1.4, 0.35)); ell(x, cx + 26 * s, sh + 8, 10 * s, 6, rgb(col, 0.4, 0.45)); });
    x.restore();
  }
  function neck(x, P) { const { cx, sh, s } = P, top = P.ey + 9 * P.fl; poly(x, [[cx - 4.6 * s * P.fw, top], [cx - 5.4 * s, sh + 2], [cx + 5.4 * s, sh + 2], [cx + 4.6 * s * P.fw, top]], rgb(P.skin, 0.8));
    soft(x, 1.2, () => { ell(x, cx + 1, top + 3, 5 * s, 3.2, rgb(P.skin, 0.42, 0.75)); ell(x, cx - 2, sh - 1, 3, 2.5, rgb(P.skin, 1.05, 0.4)); }); }

  // ---------------------------------------------------------------- the head
  // P: cx, ey (eye line), u (half the eye gap), fw / fl (face width / length), jaw, skin, eye, hair, age (0..1), fem, mouth: 'set'|'open'|'fist'|'meek', brow
  function headPath(x, P) { const { cx } = P, rx = 9 * P.fw * P.s, hy = P.ey + 1.2, top = hy - 13.2 * P.fl * P.s, chin = hy + 13.6 * P.fl * P.s, jw = rx * (P.jaw || 0.78);
    poly(x, [[cx, top], [cx + rx * 0.9, top, cx + rx * 1.02, hy - 6, cx + rx, hy - 1], [cx + rx * 0.98, hy + 4, cx + jw * 1.05, hy + 7.5 * P.fl, cx + jw * 0.72, chin - 2.6], [cx + jw * 0.4, chin + 0.2, cx + 1.5, chin, cx, chin], [cx - 1.5, chin, cx - jw * 0.4, chin + 0.2, cx - jw * 0.72, chin - 2.6], [cx - jw * 1.05, hy + 7.5 * P.fl, cx - rx * 0.98, hy + 4, cx - rx, hy - 1], [cx - rx * 1.02, hy - 6, cx - rx * 0.9, top, cx, top]]);
    return { rx, hy, top, chin }; }
  function head(x, P) {
    const S = P.skin, u = P.u, cx = P.cx, ey = P.ey, sc = P.s, my = ey + 10.2 * P.fl * sc, mw = (P.mw || 2.6) * sc, age = P.age || 0;
    const H = headPath(x, P); soft(x, 0.35, () => { headPath(x, P); x.fillStyle = rgb(S, 0.82); x.fill(); });
    // ears
    soft(x, 0.3, () => { ell(x, cx - H.rx - 0.3, ey + 2.8, 1.5, 2.6, rgb(S, 0.7)); ell(x, cx + H.rx + 0.3, ey + 2.8, 1.5, 2.6, rgb(S, 0.5)); });
    x.save(); headPath(x, P); x.clip();
    const lg = x.createRadialGradient(cx - H.rx * 0.35, ey - 2, 1, cx - H.rx * 0.2, ey, H.rx * 1.7); lg.addColorStop(0, rgb(S, 1.16, 0.95)); lg.addColorStop(0.55, rgb(S, 1, 0.5)); lg.addColorStop(1, rgb(S, 0.6, 0)); x.fillStyle = lg; x.fillRect(0, 0, 96, 96);
    const sg = x.createLinearGradient(cx + H.rx * 0.15, 0, cx + H.rx, 0); sg.addColorStop(0, rgb(S, 0.5, 0)); sg.addColorStop(1, rgb(S, 0.42, 0.7)); x.fillStyle = sg; x.fillRect(0, 0, 96, 96);
    soft(x, 1.6, () => {
      ell(x, cx, H.chin + 0.5, H.rx * 0.8, 3, rgb(S, 0.55, 0.6));                                    // under the jaw
      ell(x, cx - u - 1, ey + 4.6, 2.4, 1.6, 'rgba(190,80,70,0.13)'); ell(x, cx + u + 1, ey + 4.6, 2.4, 1.6, 'rgba(170,70,60,0.12)');   // warmth in the cheeks
      ell(x, cx - u, ey - 0.3, 2.9 * sc, 2 * sc, rgb(S, 0.42, 0.9)); ell(x, cx + u, ey - 0.3, 2.9 * sc, 2 * sc, rgb(S, 0.34, 0.95)); ell(x, cx - H.rx * 0.55, ey + 3.5, 2.6, 2, rgb(S, 1.15, 0.5));   // the sockets
      ell(x, cx - 0.6, ey - 5.5, 4.5, 2.2, rgb(S, 1.18, 0.35));                                   // the brow catches the light
      if (age > 0.3) { ell(x, cx - H.rx * 0.62, ey + 6.2, 2 * sc, 3.2 * sc, rgb(S, 0.55, 0.35 * age)); ell(x, cx + H.rx * 0.62, ey + 6.2, 2 * sc, 3.2 * sc, rgb(S, 0.45, 0.45 * age)); ell(x, cx - u - 0.3, ey - 1.8, 2.6, 0.9, rgb(S, 0.55, 0.3 * age)); }   // hollows
    });
    // nose
    soft(x, 0.45, () => {
      stroke(x, [cx + 1.1 * sc, ey + 0.6, cx + 1.4 * sc, ey + 3.5, cx + 1.6 * sc, ey + 6.2], 1.5 * sc, rgb(S, 0.6, 0.55));
      stroke(x, [cx - 0.4, ey + 0.8, cx - 0.4, ey + 3.5, cx - 0.2, ey + 5.6], 0.8 * sc, rgb(S, 1.2, 0.45));
      ell(x, cx - 0.1, ey + 6.3 * P.fl, 1.4 * sc, 1.1 * sc, rgb(S, 1.08, 0.7));
      ell(x, cx - 1.15 * sc, ey + 7.0 * P.fl, 0.55, 0.38, rgb(S, 0.3, 0.8)); ell(x, cx + 1.15 * sc, ey + 7.0 * P.fl, 0.55, 0.38, rgb(S, 0.3, 0.85));
      ell(x, cx + 0.4, ey + 7.9 * P.fl, 2 * sc, 0.6, rgb(S, 0.55, 0.5));
    });
    // mouth
    const mood = P.mouth || 'set', curve = mood === 'meek' ? 0.25 : mood === 'fist' ? 0.55 : 0.05;
    soft(x, 0.35, () => {
      ell(x, cx, my - 0.55, mw * 0.85, 0.55 * (mood === 'fist' ? 0.6 : 1), 'rgba(' + Math.round(S[0] * 0.66) + ',' + Math.round(S[1] * 0.46) + ',' + Math.round(S[2] * 0.42) + ',0.85)');
      ell(x, cx + 0.2, my + 0.85, mw * 0.68, 0.6 * (mood === 'fist' ? 0.5 : 1), 'rgba(' + Math.round(Math.min(255, S[0] * 0.95)) + ',' + Math.round(S[1] * 0.7) + ',' + Math.round(S[2] * 0.64) + ',0.75)');
      if (mood === 'open') ell(x, cx, my + 0.2, mw * 0.55, 0.85, 'rgb(46,22,20)');
      stroke(x, [cx - mw, my + curve, cx, my - curve * 0.6, cx + mw, my + curve], 0.55, rgb(S, 0.3, 0.9));
      ell(x, cx, my + 2.1, mw * 0.55, 0.55, rgb(S, 0.6, 0.45));
      ell(x, cx - 0.4, my + 3.6 * P.fl, 2.2, 1.2, rgb(S, 1.1, 0.4));    // the chin's light
    });
    // age
    if (age > 0) soft(x, 0.3, () => {
      const a = age; const dk = rgb(S, 0.45, 0.42 * a), lt = rgb(S, 1.2, 0.3 * a);
      for (const sd of [-1, 1]) {
        stroke(x, [cx + sd * 2.1 * sc, ey + 6.6, cx + sd * (mw + 1.6), my - 0.5, cx + sd * (mw + 1.2), my + 2.2], 0.5, dk);
        stroke(x, [cx + sd * 2.7 * sc, ey + 6.6, cx + sd * (mw + 2.2), my - 0.5, cx + sd * (mw + 1.8), my + 2.2], 0.5, lt);
        stroke(x, [cx + sd * (u - 1.8), ey + 1.5, cx + sd * u, ey + 2.4, cx + sd * (u + 1.8), ey + 1.4], 0.4, dk);
        if (a > 0.5) { for (let k = 0; k < 3; k++) stroke(x, [cx + sd * (u + 2.3), ey - 0.5 + k * 0.9, cx + sd * (u + 3.6), ey - 0.9 + k * 1.3], 0.3, dk); stroke(x, [cx + sd * (mw + 0.6), my + 1.5, cx + sd * (mw + 0.9), my + 4.5, cx + sd * (mw - 0.2), H.chin - 1], 0.45, dk); }
      }
      for (let k = 0; k < (a > 0.5 ? 3 : 2); k++) stroke(x, [cx - 4.5, ey - 4.6 - k * 1.35, cx, ey - 5 - k * 1.4, cx + 4.5, ey - 4.6 - k * 1.35], 0.35, dk);
      if (P.frown) { stroke(x, [cx - 0.8, ey - 3.6, cx - 0.6, ey - 1.6], 0.35, dk); stroke(x, [cx + 0.8, ey - 3.6, cx + 0.6, ey - 1.6], 0.35, dk); }
    });
    if (P.stubble) soft(x, 0.2, () => { x.globalAlpha = P.stubble; for (let k = 0; k < 260; k++) { const a = hs(k, 1, 77) * Math.PI, r = hs(k, 2, 77); const px = cx + Math.cos(a) * H.rx * 0.95 * r * (hs(k, 3, 77) < 0.5 ? -1 : 1), py = my - 1.5 + Math.abs(Math.sin(a)) * 6 * r + hs(k, 4, 77) * 3; if (Math.abs(px - cx) < mw + 0.5 && Math.abs(py - my) < 1) continue; ell(x, px, py, 0.32, 0.32, rgb(P.hair, 0.6)); } x.globalAlpha = 1; });
    x.restore();
    eyes(x, P);
  }
  function eyes(x, P) {
    const S = P.skin, cx = P.cx, ey = P.ey, u = P.u, sc = P.s, nar = P.narrow || 0;
    for (const sd of [-1, 1]) {
      const ex = cx + sd * u, lit = sd < 0 ? 1 : 0.85;
      soft(x, 0.18, () => {
        ell(x, ex, ey + 0.1, 1.35 * sc, (0.62 - nar * 0.2) * sc, rgb(mix(S, [235, 228, 214], 0.45), 0.8 * lit));
        ell(x, ex + 0.1, ey + 0.1, 0.62 * sc, (0.6 - nar * 0.18) * sc, rgb(P.eye, lit));
        ell(x, ex + 0.1, ey + 0.1, 0.3 * sc, 0.3 * sc, 'rgba(10,8,8,0.9)');
        ell(x, ex - 0.2, ey - 0.15, 0.17, 0.17, 'rgba(255,250,240,' + (0.75 * lit) + ')');
        stroke(x, [ex - 1.55 * sc, ey + 0.2, ex, ey - (0.95 - nar * 0.4) * sc, ex + 1.55 * sc, ey + 0.1], 0.5, 'rgba(30,18,14,0.85)');
        stroke(x, [ex - 1.4 * sc, ey - 0.4, ex, ey - (1.6 - nar * 0.3) * sc, ex + 1.5 * sc, ey - 0.6], 0.35, rgb(S, 1.05, 0.6));
      });
      // brow
      const bin = P.brow === 'down' ? -1.3 : P.brow === 'up' ? -2.9 : -2.4, bout = P.brow === 'up' ? -2.4 : -2.6;
      soft(x, 0.35, () => stroke(x, [cx + sd * 1.3 * sc, ey + bin, cx + sd * (u + 0.4), ey + Math.min(bin, bout) - 0.6, cx + sd * (u + 2.8 * sc), ey + bout + 0.4], (P.fem ? 0.85 : 1.15) * sc, rgb(mix(P.hair, S, 0.3), 0.55, 0.95)));
    }
  }

  // ---------------------------------------------------------------- hair
  function strands(x, n, seed, fn, col, w, a) { for (let k = 0; k < n; k++) { const t = k / (n - 1), pts = fn(t, k); const sh = 0.72 + hs(k, 1, seed) * 0.55; stroke(x, pts, w * (0.7 + hs(k, 2, seed) * 0.6), rgb(col, sh, a)); } }
  function hairBack(x, P) {
    const { cx, ey, s } = P, rx = 9 * P.fw * s, col = P.hair, top = ey + 1.2 - 13.2 * P.fl * s;
    if (P.hairStyle === 'long') {
      poly(x, [[cx - rx - 1, ey - 4], [cx - rx - 4, ey + 10, cx - rx - 4, ey + 20, cx - rx - 2, ey + 27], [cx + rx + 2, ey + 27], [cx + rx + 4, ey + 20, cx + rx + 4, ey + 10, cx + rx + 1, ey - 4], [cx, top - 4]], rgb(col, 0.7));
      strands(x, 40, 11, (t) => { const sd = t < 0.5 ? -1 : 1, q = (t < 0.5 ? t : 1 - t) * 2; const x0 = cx + sd * (rx * (0.4 + q * 0.6)); return [x0, ey - 6, x0 + sd * 3, ey + 6, x0 + sd * (2 + q * 2), ey + 26]; }, col, 0.6, 0.6);
    }
    if (P.hairStyle === 'tied') { ell(x, cx + rx * 0.5, top + 4, 3.5, 3.2, rgb(col, 0.8)); }
  }
  function hairFront(x, P) {
    const { cx, ey, s } = P, rx = 9 * P.fw * s, col = P.hair, hy = ey + 1.2, top = hy - 13.2 * P.fl * s, line = ey - 5.2 * s, part = cx + (P.part || -2);
    const st = P.hairStyle; if (!st || st === 'none') return;
    const cap = (low, side) => { poly(x, [[cx - rx - 0.8, line + side], [cx - rx - 1.2, top + 1, cx - rx * 0.4, top - 2.4, cx, top - 2.4], [cx + rx * 0.4, top - 2.4, cx + rx + 1.2, top + 1, cx + rx + 0.8, line + side], [cx + rx * 0.5, line + low, cx + 1, line - 1.4, cx - 1, line - 1.4], [cx - rx * 0.5, line + low, cx - rx - 0.8, line + side, cx - rx - 0.8, line + side]], rgb(col, 0.82)); };
    if (st === 'pulled' || st === 'crop' || st === 'tied' || st === 'long' || st === 'short') {
      const side = st === 'long' ? 7 : st === 'pulled' ? 5 : st === 'short' ? 4 : st === 'crop' ? 4.5 : 3;
      cap(st === 'long' ? 1.2 : 0.4, side);
      x.save(); x.beginPath(); x.rect(0, 0, 96, line + side + 0.5); x.clip();
      const g = x.createLinearGradient(cx - rx, 0, cx + rx, 0); g.addColorStop(0, rgb(col, 1.15, 0.0)); g.addColorStop(1, rgb(col, 0.5, 0.55));
      strands(x, 46, P.seed || 3, (t) => { const sd = t < 0.5 ? -1 : 1, q = Math.abs(t - 0.5) * 2; const ex = cx + sd * (rx * (0.25 + q * 0.85)) + 0.3, eyy = line + 0.4 + q * side; return [part + sd * 0.2, top - 2, part + sd * rx * 0.5 * (0.5 + q), top - 1.6 + q * 2.4, ex, eyy]; }, col, 0.55, 0.75);
      x.fillStyle = g; cap(st === 'long' ? 1.2 : 0.4, side); x.fill();
      x.restore();
      if (P.streak) { strands(x, 10, 31, (t) => { const sd = t < 0.5 ? -1 : 1, q = Math.abs(t - 0.5) * 2; return [part, top - 2, part + sd * rx * 0.6, top + q * 2, cx + sd * rx * (0.3 + q * 0.7), line + q * 5]; }, P.streak, 0.4, 0.6); }
      if (st === 'pulled') { strands(x, 9, 21, (t, k) => { const sd = k % 2 ? 1 : -1; const x0 = cx + sd * (rx + 0.2); return [x0, line + 3, x0 + sd * 1.2, line + 7, x0 + sd * 0.2 - sd * hs(k, 4, 9) * 1.5, line + 10 + hs(k, 5, 9) * 3]; }, col, 0.35, 0.65); }
      if (st === 'long') { strands(x, 18, 41, (t, k) => { const sd = k % 2 ? 1 : -1, q = t; const x0 = cx + sd * (rx * 0.6 + q * rx * 0.5); return [x0, line + 1, x0 + sd * 2.2, line + 9, x0 + sd * 1.5, line + 18 + q * 8]; }, col, 0.6, 0.75); }
    }
  }

  // ---------------------------------------------------------------- headwear and over-garments (shared by A, B, C)
  // Every piece takes the face anchor P (cx, ey, s, sh) so it fits a painting's head as well as A's.
  const W = {};
  W.hat = (x, P) => { const { cx, ey, s } = P, col = P.hatCol || [74, 64, 54], by = ey - 5.8 * s, br = 15.5 * s;
    soft(x, 1.6, () => ell(x, cx + 1, by + 2.6, br * 0.8, 2.8, 'rgba(10,6,4,0.55)'));
    poly(x, [[cx - 8.5 * s, by], [cx - 9 * s, by - 9 * s, cx - 4 * s, by - 11 * s, cx + 1, by - 10.6 * s], [cx + 6 * s, by - 11 * s, cx + 9.4 * s, by - 8 * s, cx + 8.8 * s, by]], rgb(col));
    ell(x, cx, by, br, 3.2 * s, rgb(col, 0.9), -0.04);
    soft(x, 0.6, () => { ell(x, cx - 4 * s, by - 6 * s, 3.5 * s, 4 * s, rgb(col, 1.35, 0.5)); ell(x, cx + 7 * s, by - 3 * s, 3 * s, 5 * s, rgb(col, 0.5, 0.6)); ell(x, cx - 5, by - 0.8, br * 0.6, 1.1 * s, rgb(col, 1.3, 0.5)); stroke(x, [cx - 8.6 * s, by - 1.8 * s, cx, by - 1.2 * s, cx + 8.6 * s, by - 1.8 * s], 1.2 * s, rgb(col, 0.45, 0.9)); }); };
  W.wrap = (x, P) => { const { cx, ey, s } = P, rx = 9 * P.fw * s, col = [22, 20, 22];
    x.save(); x.beginPath(); x.ellipse(cx, ey + 1, rx + 3.2, 16 * s, 0, 0, Math.PI * 2); x.rect(cx - 6 * s, ey + 10, 12 * s, 20); x.moveTo(cx + rx + 0.5, ey - 0.2); x.ellipse(cx, ey - 0.2, rx * 0.88, 1.75 * s, 0, 0, Math.PI * 2, true); x.fillStyle = rgb(col); x.fill('evenodd'); x.clip('evenodd');
    for (let k = 0; k < 16; k++) { const y0 = ey - 18 + k * 2.6; stroke(x, [cx - rx - 6, y0 + 3, cx, y0 - 1 + (k % 2) * 2, cx + rx + 6, y0 + 2], 1.6, rgb(col, 1.7 + hs(k, 1, 5) * 0.9, 0.7)); stroke(x, [cx - rx - 6, y0 + 4.2, cx, y0 + 0.4 + (k % 2) * 2, cx + rx + 6, y0 + 3.4], 0.6, 'rgba(0,0,0,0.6)'); }
    const g = x.createLinearGradient(cx - rx, 0, cx + rx + 4, 0); g.addColorStop(0, 'rgba(120,110,104,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0.45)'); x.fillStyle = g; x.fillRect(0, 0, 96, 96); x.restore();
    soft(x, 0.5, () => { ell(x, cx, ey - 1.6 * s, rx * 0.85, 0.5, 'rgba(0,0,0,0.6)'); ell(x, cx, ey + 1.6 * s, rx * 0.85, 0.5, 'rgba(0,0,0,0.5)'); }); };
  W.coif = (x, P, col) => { const { cx, ey, s } = P, rx = 9 * P.fw * s, top = ey + 1.2 - 13.2 * P.fl * s;
    poly(x, [[cx - rx - 1.6, ey + 6], [cx - rx - 2.6, top - 2, cx + rx + 2.6, top - 2, cx + rx + 1.6, ey + 6], [cx + rx - 0.2, ey - 1, cx + rx * 0.4, ey - 6.4 * s, cx, ey - 6.2 * s], [cx - rx * 0.4, ey - 6.4 * s, cx - rx + 0.2, ey - 1, cx - rx - 1.6, ey + 6]], rgb(col));
    soft(x, 0.8, () => { ell(x, cx - rx * 0.4, top + 2, 4, 3, rgb(col, 1.2, 0.6)); ell(x, cx + rx + 0.6, ey + 1, 1.6, 5, rgb(col, 0.6, 0.7)); stroke(x, [cx - rx * 0.8, ey - 5.6 * s, cx, ey - 7.2 * s, cx + rx * 0.8, ey - 5.6 * s], 0.7, rgb(col, 0.7, 0.7)); }); };
  W.coat = (x, P, col) => { const { cx, sh, s } = P;   // a drover's coat: turned-up collar and lapels
    for (const sd of [-1, 1]) { poly(x, [[cx + sd * 5 * s, sh - 4], [cx + sd * 10 * s, sh - 1], [cx + sd * 13 * s, sh + 8], [cx + sd * 4 * s, sh + 30], [cx + sd * 1.5 * s, sh + 30]], rgb(col, sd < 0 ? 1.1 : 0.75)); stroke(x, [cx + sd * 4 * s, sh + 30, cx + sd * 13 * s, sh + 8], 0.7, rgb(col, 0.45, 0.9)); }
    poly(x, [[cx - 1.5 * s, sh + 30], [cx + 1.5 * s, sh + 30], [cx + 1.5 * s, 96], [cx - 1.5 * s, 96]], rgb(col, 0.55)); };
  W.shawl = (x, P, col) => { const { cx, sh } = P, s = P.s * 0.82, tip = sh + 22; col = mix(col, [40, 34, 28], 0.3);
    poly(x, [[cx - 6 * s, sh - 3], [cx - 20 * s, sh + 1, cx - 34 * s, sh + 6, cx - 30 * s, sh + 16], [cx - 8 * s, tip - 4, cx, tip], [cx + 8 * s, tip - 4, cx + 30 * s, sh + 16], [cx + 34 * s, sh + 6, cx + 20 * s, sh + 1, cx + 6 * s, sh - 3], [cx, sh + 4]], rgb(col));
    x.save(); poly(x, [[cx - 6 * s, sh - 3], [cx - 20 * s, sh + 1, cx - 34 * s, sh + 6, cx - 30 * s, sh + 16], [cx - 8 * s, tip - 4, cx, tip], [cx + 8 * s, tip - 4, cx + 30 * s, sh + 16], [cx + 34 * s, sh + 6, cx + 20 * s, sh + 1, cx + 6 * s, sh - 3], [cx, sh + 4]]); x.clip();
    for (let k = 0; k < 18; k++) stroke(x, [cx - 40, sh + k * 1.6, cx, sh + 6 + k * 1.6, cx + 40, sh + k * 1.6], 0.45, k % 2 ? rgb(col, 0.7, 0.6) : rgb(col, 1.1, 0.35)); soft(x, 2, () => { ell(x, cx + 14 * s, sh + 12, 12 * s, 8, rgb(col, 0.35, 0.6)); ell(x, cx - 6 * s, sh + 18, 8 * s, 5, rgb(col, 0.45, 0.5)); });
    const g = x.createLinearGradient(cx - 30, 0, cx + 30, 0); g.addColorStop(0, rgb(col, 1.3, 0.35)); g.addColorStop(1, rgb(col, 0.4, 0.55)); x.fillStyle = g; x.fillRect(0, 0, 96, 96);
    soft(x, 0.8, () => stroke(x, [cx - 5 * s, sh + 4, cx - 2, sh + 14, cx + 3, sh + 22], 1.6, rgb(col, 0.5, 0.6))); x.restore();
    for (let k = 0; k < 15; k++) { const t = k / 14, sd = t < 0.5 ? -1 : 1, q = Math.abs(t - 0.5) * 2, px = cx + sd * q * 29 * s, py = tip - q * (tip - sh - 16) + 0.5; stroke(x, [px, py, px + 0.3, py + 2.6 + hs(k, 1, 8) * 1.6], 0.45, rgb(col, 0.85, 0.9)); } };
  W.stick = (x, P, skin) => { const y0 = 87, y1 = 90;
    soft(x, 1, () => stroke(x, [4, y0 + 2, 92, y1 + 2], 2.6, 'rgba(8,5,4,0.6)'));
    stroke(x, [3, y0, 93, y1], 2.1, 'rgb(62,44,30)'); stroke(x, [3, y0 - 0.6, 93, y1 - 0.6], 0.5, 'rgba(150,110,74,0.7)');
    for (const hx of [P.cx - 13, P.cx + 13]) { const hy = y0 + (hx - 3) / 90 * (y1 - y0); poly(x, [[hx - 4.2, hy + 1.6], [hx - 4, hy - 3.4, hx + 3, hy - 4.4, hx + 4.3, hy - 1], [hx + 4.6, hy + 2.2], [hx, hy + 3.4, hx - 3, hy + 3]], rgb(skin, 0.85));
      soft(x, 0.25, () => { for (let k = 0; k < 4; k++) stroke(x, [hx - 3 + k * 2, hy - 2.2, hx - 2.6 + k * 2, hy + 2.2], 0.35, rgb(skin, 0.5, 0.7)); ell(x, hx - 1, hy - 2.4, 3, 1, rgb(skin, 1.15, 0.6)); }); } };
  W.plates = (x, P) => { const { cx, sh, s } = P;
    poly(x, [[cx - 7 * s, sh - 7], [cx + 7 * s, sh - 7], [cx + 8 * s, sh + 2], [cx - 8 * s, sh + 2]], 'rgb(70,74,82)'); stroke(x, [cx - 7.6 * s, sh - 6.4, cx + 7.6 * s, sh - 6.4], 0.5, 'rgba(150,154,164,0.6)');
    x.save(); bodyPath(x, cx, sh, s); x.clip();
    for (let r = 0; r < 6; r++) for (let c2 = -5; c2 <= 5; c2++) { const px = cx + c2 * 6.6 * s + (r % 2) * 3.3 * s, py = sh + 4 + r * 8 * s; if (Math.abs(px - cx) < 2) continue; const lit = px < cx ? 1.06 : 0.78;
      x.fillStyle = rgb([118, 122, 130], lit, 0.55); x.fillRect(px - 2.5 * s, py, 5 * s, 6.2 * s); x.fillStyle = rgb([170, 174, 184], lit, 0.45); x.fillRect(px - 2.5 * s, py, 5 * s, 0.6); x.fillStyle = 'rgba(30,32,38,0.7)'; x.fillRect(px - 2.5 * s, py + 6.2 * s - 0.7, 5 * s, 0.7); x.fillStyle = 'rgba(30,32,38,0.5)'; for (const dx of [-1.6, 1.6]) x.fillRect(px + dx * s - 0.2, py + 0.9, 0.5, 0.5); }
    x.restore();
    x.fillStyle = 'rgb(214,210,196)'; x.fillRect(cx + 4 * s, sh + 10, 9 * s, 5 * s); x.fillStyle = 'rgb(26,26,28)'; for (let k = 0; k < 3; k++) x.fillRect(cx + 5.2 * s + k * 2.6 * s, sh + 11, 1.2 * s, 3 * s); };
  W.admiral = (x, P) => { const { cx, sh, s } = P, gold = [182, 146, 76];
    poly(x, [[cx - 6 * s, sh - 4], [cx + 6 * s, sh - 4], [cx + 4 * s, sh + 9], [cx, sh + 14], [cx - 4 * s, sh + 9]], 'rgb(206,198,180)');
    soft(x, 0.4, () => ell(x, cx + 2, sh + 3, 3, 5, 'rgba(90,80,70,0.5)'));
    for (const sd of [-1, 1]) { poly(x, [[cx + sd * 6 * s, sh - 5], [cx + sd * 11 * s, sh - 2], [cx + sd * 15 * s, sh + 10], [cx + sd * 6 * s, sh + 36], [cx + sd * 3.5 * s, sh + 36], [cx + sd * 5 * s, sh + 8]], rgb([34, 44, 72], sd < 0 ? 1.2 : 0.8));
      stroke(x, [cx + sd * 5 * s, sh + 8, cx + sd * 6.2 * s, sh + 36], 0.8, rgb(gold)); stroke(x, [cx + sd * 15 * s, sh + 10, cx + sd * 6 * s, sh + 36], 0.7, rgb(gold, 0.8));
      for (let k = 0; k < 3; k++) { ell(x, cx + sd * 9.5 * s, sh + 16 + k * 6, 0.9 * s, 0.9 * s, rgb(gold, sd < 0 ? 1.15 : 0.8)); ell(x, cx + sd * 9.3 * s, sh + 15.7 + k * 6, 0.35, 0.35, 'rgba(255,240,190,0.8)'); }
      poly(x, [[cx + sd * 15 * s, sh + 0.5], [cx + sd * 30 * s, sh + 4], [cx + sd * 31 * s, sh + 8.5], [cx + sd * 15 * s, sh + 6]], rgb(gold, sd < 0 ? 0.95 : 0.65));
      for (let k = 0; k < 7; k++) stroke(x, [cx + sd * (18 + k * 2) * s, sh + 5.5 + k * 0.45, cx + sd * (18 + k * 2) * s, sh + 9.5 + k * 0.4], 0.5, rgb(gold, sd < 0 ? 0.9 : 0.6)); } };
  W.robe = (x, P) => { const bx = P.robeX !== undefined ? P.robeX : P.cx + 14 * P.s, by = 72;   // a white robe folded over her arm, lower right
    soft(x, 1.5, () => ell(x, bx + 12, by + 16, 18, 12, 'rgba(6,4,4,0.6)'));
    poly(x, [[bx, by + 4], [bx + 12, by - 2, bx + 26, by, bx + 34, by + 4], [bx + 36, 98], [bx + 2, 98], [bx - 3, by + 18, bx - 2, by + 10, bx, by + 4]], 'rgb(232,226,212)');
    x.save(); poly(x, [[bx, by + 4], [bx + 12, by - 2, bx + 26, by, bx + 34, by + 4], [bx + 36, 98], [bx + 2, 98], [bx - 3, by + 18, bx - 2, by + 10, bx, by + 4]]); x.clip();
    soft(x, 0.6, () => { for (let k = 0; k < 6; k++) stroke(x, [bx + 2 + k * 5.6, by + 2, bx + 3 + k * 5.8, by + 16, bx + 2 + k * 6, 98], 0.9, 'rgba(150,140,128,0.55)'); stroke(x, [bx - 2, by + 12, bx + 18, by + 9, bx + 38, by + 12], 1.4, 'rgba(160,150,136,0.6)'); stroke(x, [bx - 2, by + 10.8, bx + 18, by + 7.8, bx + 38, by + 10.8], 0.7, 'rgba(255,252,244,0.7)'); });
    const g = x.createLinearGradient(bx, 0, bx + 36, 0); g.addColorStop(0, 'rgba(255,250,240,0.15)'); g.addColorStop(1, 'rgba(40,30,30,0.45)'); x.fillStyle = g; x.fillRect(0, 0, 96, 98); x.restore();
    poly(x, [[bx - 6, by + 9], [bx + 30, by + 8], [bx + 30, by + 15], [bx - 6, by + 16]], rgb(P.skin, 0.8)); soft(x, 0.4, () => { ell(x, bx + 10, by + 10, 16, 1.4, rgb(P.skin, 1.12, 0.6)); ell(x, bx + 10, by + 15, 18, 1.2, rgb(P.skin, 0.5, 0.6)); });
    poly(x, [[bx - 2, by + 8], [bx + 26, by + 4, bx + 36, by + 8, bx + 38, by + 14], [bx + 30, by + 22], [bx + 8, by + 22, bx - 2, by + 20, bx - 2, by + 8]], 'rgb(238,232,220)'); soft(x, 0.5, () => stroke(x, [bx, by + 19, bx + 18, by + 17, bx + 34, by + 18], 1, 'rgba(150,140,128,0.6)')); };
  W.sleeves = (x, P) => { const { cx, s } = P; stroke(x, [cx - 30 * s, 80, cx - 24 * s, 90, cx - 22 * s, 98], 2.4, 'rgba(70,64,74,0.6)'); };
  W.pack = (x, P) => { const { cx, sh, s } = P, col = [96, 84, 62];   // behind: drawn before the body
    poly(x, [[cx + 14 * s, sh + 4], [cx + 16 * s, sh - 12, cx + 36 * s, sh - 12, cx + 40 * s, sh + 6], [cx + 42 * s, sh + 22]], rgb(col));
    soft(x, 0.8, () => { ell(x, cx + 24 * s, sh - 6, 7 * s, 3.5, rgb(col, 1.3, 0.5)); stroke(x, [cx + 20 * s, sh - 5, cx + 28 * s, sh - 1, cx + 38 * s, sh + 2], 0.9, rgb(col, 0.5, 0.6)); stroke(x, [cx + 22 * s, sh - 9.5, cx + 30 * s, sh - 2], 1.1, 'rgba(60,40,26,0.9)'); }); };
  W.strap = (x, P) => { const { cx, sh, s } = P;
    poly(x, [[cx + 12 * s, sh - 1], [cx + 17 * s, sh], [cx - 16 * s, 98], [cx - 22 * s, 98]], 'rgb(74,52,34)'); stroke(x, [cx + 13 * s, sh - 0.6, cx - 20.6 * s, 98], 0.5, 'rgba(160,120,80,0.6)');
    x.fillStyle = 'rgb(150,130,90)'; x.fillRect(cx - 3 * s, sh + 26, 4.5 * s, 4 * s); x.fillStyle = 'rgb(70,52,34)'; x.fillRect(cx - 2 * s, sh + 27, 2.5 * s, 2 * s); };
  W.shirt = (x, P, col) => { const { cx, sh, s } = P; poly(x, [[cx - 6 * s, sh - 4], [cx + 6 * s, sh - 4], [cx + 5 * s, sh + 6], [cx, sh + 13], [cx - 5 * s, sh + 6]], rgb(col)); soft(x, 0.6, () => ell(x, cx, sh + 5, 2.4, 5, rgb(P.skin, 0.75, 0.7))); };
  W.hook = (x, P) => { const px = P.cx + 34 * P.s;   // the Tallyman's hook on a notched black ash pole
    soft(x, 1, () => stroke(x, [px + 2, 10, px + 2, 98], 3, 'rgba(0,0,0,0.5)'));
    stroke(x, [px, 8, px + 0.6, 98], 2.4, 'rgb(34,28,26)'); for (let y = 14; y < 96; y += 4.5) stroke(x, [px - 1, y, px + 1.4, y + 0.3], 0.45, 'rgba(160,146,124,0.75)');
    stroke(x, [px, 9, px - 1, 1, px - 7, 1, px - 8, 6], 1.4, 'rgb(96,100,108)'); stroke(x, [px - 0.4, 8.4, px - 1.2, 1.6, px - 6.6, 1.4], 0.45, 'rgba(200,204,212,0.7)');
    poly(x, [[px - 2.4, 8], [px + 2.8, 8], [px + 3.6, 15], [px + 1, 13], [px - 2, 16]], 'rgb(18,16,16)'); };
  W.paleHand = (x, P) => { const hx = P.cx - 26 * P.s, hy = 82;   // bare and white; the pillar shows through two fingers
    poly(x, [[hx - 5, hy + 12], [hx - 6, hy + 2, hx - 4, hy - 2, hx, hy - 2], [hx + 5, hy - 2, hx + 6, hy + 4, hx + 5, hy + 12]], 'rgb(226,224,218)');
    for (let k = 0; k < 4; k++) { const fx = hx - 3.6 + k * 2.4; x.globalAlpha = k === 1 || k === 2 ? 0.42 : 1; poly(x, [[fx - 1, hy - 1], [fx - 1.1, hy - 7 - (k === 1 || k === 2 ? 1 : 0)], [fx, hy - 8.4 - (k === 1 || k === 2 ? 1 : 0), fx + 1.1, hy - 7], [fx + 1, hy - 1]], 'rgb(236,234,228)'); x.globalAlpha = 1; }
    soft(x, 0.4, () => { ell(x, hx + 3, hy + 4, 2.5, 6, 'rgba(120,118,120,0.5)'); ell(x, hx - 2, hy + 2, 2, 4, 'rgba(255,255,255,0.4)'); }); };

  // ---------------------------------------------------------------- the people (A recipes) [PROPOSED]
  const SK = { pale: [214, 186, 164], fair: [204, 172, 148], weather: [182, 140, 112], olive: [176, 144, 122] };
  const PEOPLE = {
    marrable: { name: 'Old Marrable', fem: 1, age: 1, skin: [204, 170, 146], hair: [222, 220, 212], eye: [74, 70, 64], hairStyle: 'pulled', fw: 0.9, fl: 1.04, jaw: 0.66, mouth: 'meek', brow: 'up', mw: 2.3,
      cloth: [92, 70, 48], pre: [], over: [['coat', [92, 70, 48]], ['shawl', [104, 112, 92]], ['stick']] },
    trooper: { name: 'The trooper at the tip', fem: 1, age: 0.15, skin: [182, 146, 122], hair: [34, 28, 26], eye: [52, 40, 30], hairStyle: 'long', fw: 0.96, fl: 1, jaw: 0.74, mouth: 'open', mw: 2.4, part: 2,
      cloth: [104, 108, 116], over: [['plates']] },
    tally: { name: 'The Tallyman', fem: 0, age: 0.3, skin: [186, 160, 140], hair: [30, 26, 24], eye: [60, 52, 44], hairStyle: 'none', fw: 1, fl: 1, jaw: 0.8, narrow: 0.6, brow: 'down',
      cloth: [24, 22, 24], over: [['wrap'], ['hook'], ['paleHand']] },
    perpetua: { name: 'Perpetua Lisle', fem: 1, age: 0.62, skin: [208, 188, 168], hair: [186, 186, 182], eye: [70, 72, 76], hairStyle: 'crop', fw: 0.88, fl: 1.08, jaw: 0.7, mouth: 'fist', brow: 'set', mw: 2.2, frown: 1, part: 0,
      cloth: [28, 26, 30], over: [['robe']] },
    packman: { name: 'The packman', fem: 0, age: 0.5, skin: [184, 140, 112], hair: [86, 70, 56], eye: [60, 48, 36], hairStyle: 'short', fw: 1.05, fl: 0.98, jaw: 0.86, mouth: 'set', mw: 2.7, stubble: 0.35,
      cloth: [76, 90, 112], pre: [['pack']], over: [['shirt', [168, 156, 132]], ['strap'], ['hat']] },
    oona: { name: 'Oona Salt', fem: 1, age: 0.42, skin: [190, 150, 124], hair: [52, 44, 40], streak: [150, 146, 140], eye: [118, 128, 132], hairStyle: 'tied', fw: 0.98, fl: 0.98, jaw: 0.84, mouth: 'fist', brow: 'down', narrow: 0.5, mw: 2.4, frown: 1,
      cloth: [30, 38, 62], over: [['admiral']] },
  };
  const ORDER = ['marrable', 'trooper', 'tally', 'perpetua', 'packman', 'oona'];
  function applyOver(x, list, P) { for (const [k, col] of list || []) { if (k === 'stick') W.stick(x, P, P.skin); else W[k](x, P, col); } }
  function textured(c, fn, amt, seed) { layer(c, fn, amt, seed); }

  function wayA(id) {
    const R = PEOPLE[id], seed = 100 + ORDER.indexOf(id) * 17;
    const P = Object.assign({ cx: 48, ey: 23, u: 4.5 * 1.12, s: 1.12, sh: 43, seed }, R);
    const c = mk(); ground(c, seed);
    textured(c, (x) => { applyOver(x, R.pre, P); hairBack(x, P); }, 0.12, seed + 1);
    textured(c, (x) => cloth(x, R.cloth, P.cx, P.sh, 0.86, seed), 0.26, seed + 2);
    textured(c, (x) => neck(x, P), 0.05, seed + 3);
    textured(c, (x) => { head(x, P); hairFront(x, P); }, 0.06, seed + 4);
    textured(c, (x) => applyOver(x, R.over, P), 0.16, seed + 5);
    finish(c, seed);
    return down(c);
  }
  function finish(c, seed) {
    const x = ctxOf(c);
    const v = x.createRadialGradient(48, 40, 30, 48, 46, 72); v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(8,5,4,0.6)'); x.fillStyle = v; x.fillRect(0, 0, 96, 96);
    x.globalCompositeOperation = 'soft-light'; x.fillStyle = 'rgba(150,110,70,0.35)'; x.fillRect(0, 0, 96, 96); x.globalCompositeOperation = 'source-over';
    texture(c, 0.05, seed + 40, -0.4);
  }

  // ---------------------------------------------------------------- B and C: a painting, changed
  // F: [left eye x, y, right eye x, y, mouth x, y]; shoulder line sh; regions in 96 units.
  const SRC = {
    townsman: { F: [43, 19, 53, 19, 48, 29.5], sh: 40, face: [48, 24, 10, 13], head: [47, 8, 15, 9], body: 37, fem: 0 },
    townswoman: { F: [34, 24.5, 43, 24.5, 38.5, 33.5], sh: 47, face: [38.5, 28, 8.5, 12.5], head: [39, 22, 20, 27], body: 46, item: [84, 82, 17, 17], fem: 1 },
    hetty: { F: [39, 17, 48, 17, 45, 25], sh: 33, face: [44, 20, 9, 12], head: [44, 9, 12, 9], body: 31, item: [29, 72, 11, 15], fem: 1 },
    nell: { F: [40, 29, 51, 29, 46, 42], sh: 52, face: [46, 35, 8.5, 13], head: [45, 26, 19, 22], body: 49, fem: 1 },
    tongueless: { F: [42.5, 24, 49.5, 24, 46, 31], sh: 42, face: [46, 27, 6, 8], head: [46, 22, 18, 24], body: 40, fem: 0 },
    bettany: { F: [45, 22, 53, 22, 49, 31], sh: 41, face: [49, 26, 8, 11], head: [49, 22, 15.5, 21], body: 40, item: [16, 64, 18, 32], fem: 1 },
    rooke: { F: [45.6, 15.6, 56, 15.6, 51.25, 26.9], sh: 36, face: [51, 20, 8, 12], head: [51, 9, 10, 7], body: 34, fem: 0 },
    mags: { F: [39.25, 17, 50.5, 17, 45.5, 28.4], sh: 36, face: [45, 22, 9, 12], head: [45, 11, 13, 9], body: 34, item: [30, 80, 14, 12], fem: 1 },
  };
  const loaded = {};
  function load(id) { return loaded[id] || (loaded[id] = new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = rej; i.src = '/img/p_' + id + '.jpg'; })); }
  function maskOf(fn, blur) { const c = mk(), x = ctxOf(c); x.filter = 'blur(' + (blur * K) + 'px)'; x.fillStyle = '#fff'; fn(x); const d = x.getImageData(0, 0, N, N).data, m = new Float32Array(N * N); for (let i = 0; i < m.length; i++) m[i] = d[i * 4 + 3] / 255; return m; }
  const mSub = (a, b) => { for (let i = 0; i < a.length; i++) a[i] = Math.max(0, a[i] - b[i]); return a; };
  // warp: handles [type, x, y, r, a, b]: 'S' scale about (x, y) by (a, b) inside radius r; 'M' move by (a, b)
  function warp(c, hs_) {
    const x = c.getContext('2d', { willReadFrequently: true }), src = x.getImageData(0, 0, N, N), o = x.createImageData(N, N), s = src.data, d = o.data;
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const px = i / K, py = j / K; let qx = px, qy = py;
      for (const h of hs_) { const dx = px - h[1], dy = py - h[2], w = Math.exp(-(dx * dx + dy * dy) / (h[3] * h[3]));
        if (h[0] === 'S') { qx -= w * dx * (1 - 1 / h[4]); qy -= w * dy * (1 - 1 / h[5]); } else { qx -= w * h[4]; qy -= w * h[5]; } }
      const fx = Math.min(N - 1.001, Math.max(0, qx * K)), fy = Math.min(N - 1.001, Math.max(0, qy * K)), x0 = fx | 0, y0 = fy | 0, ax = fx - x0, ay = fy - y0, o0 = (y0 * N + x0) * 4, oo = (j * N + i) * 4;
      for (let ch = 0; ch < 3; ch++) d[oo + ch] = (s[o0 + ch] * (1 - ax) + s[o0 + 4 + ch] * ax) * (1 - ay) + (s[o0 + N * 4 + ch] * (1 - ax) + s[o0 + N * 4 + 4 + ch] * ax) * ay;
      d[oo + 3] = 255;
    }
    x.putImageData(o, 0, 0);
  }
  // re-tone inside a mask: the painting's own light and shade kept, the colour replaced (or multiplied, for skin)
  function retone(c, m, target, mode, keepBg) {
    const x = c.getContext('2d', { willReadFrequently: true }), id = x.getImageData(0, 0, N, N), d = id.data;
    let sl = 0, sw = 0, sr = 0, sg = 0, sb = 0;
    const bgw = (o) => { const db = Math.abs(d[o] - 32) + Math.abs(d[o + 1] - 25) + Math.abs(d[o + 2] - 22); return Math.min(1, Math.max(0, (db - 14) / 34)); };
    for (let i = 0; i < m.length; i++) { const o = i * 4, w = m[i] * (keepBg ? bgw(o) : 1); if (w < 0.3) continue; sl += w * (d[o] * 0.3 + d[o + 1] * 0.59 + d[o + 2] * 0.11); sr += w * d[o]; sg += w * d[o + 1]; sb += w * d[o + 2]; sw += w; }
    if (!sw) return; const Lref = sl / sw, mean = [sr / sw, sg / sw, sb / sw], tl = target[0] * 0.3 + target[1] * 0.59 + target[2] * 0.11;
    for (let i = 0; i < m.length; i++) { let w = m[i]; if (w <= 0) continue; const o = i * 4, r = d[o], g = d[o + 1], b = d[o + 2], L = r * 0.3 + g * 0.59 + b * 0.11;
      if (keepBg) { const db = Math.abs(r - 32) + Math.abs(g - 25) + Math.abs(b - 22); w *= Math.min(1, Math.max(0, (db - 14) / 34)); }
      let nr, ng, nb;
      if (mode === 'mul') { const ml = mean[0] * 0.3 + mean[1] * 0.59 + mean[2] * 0.11, q = ml / tl; nr = r * target[0] / mean[0] * q; ng = g * target[1] / mean[1] * q; nb = b * target[2] / mean[2] * q; }
      else { const k = Math.pow(L / Lref, mode === 'flat' ? 0.7 : 1) * (mode === 'bright' ? 1 : 1); nr = target[0] * k; ng = target[1] * k; nb = target[2] * k; if (tl < 40) { const lift = (L - Lref) * 0.35; nr += lift; ng += lift; nb += lift; } }
      d[o] = r + (nr - r) * w; d[o + 1] = g + (ng - g) * w; d[o + 2] = b + (nb - b) * w; }
    x.putImageData(id, 0, 0);
  }
  // per person: which overlays, re-tones and warps go on a painting
  const CHANGE = {
    marrable: { B: 'townswoman', C: 'hetty', Bx: { headcloth: [104, 112, 92], hairOver: 'pulled' }, Cx: { hair: 'white' }, fw: 0.9, fl: 1.06, age: 1, body: [92, 70, 48], brow: 'up', mouthDown: 0.5, over: [['coat', [92, 70, 48]], ['shawl', [104, 112, 92]], ['stick']] },
    trooper: { B: 'townswoman', C: 'nell', fw: 1.02, fl: 0.98, age: 0.1, headcloth: 'bg', hairOver: 'long', body: [104, 108, 116], skin: [182, 146, 122], mouthOpen: 1, over: [['plates']] },
    tally: { B: 'townsman', C: 'tongueless', fw: 1, fl: 1, age: 0, headcloth: [22, 20, 22], body: [24, 22, 24], over: [['wrap'], ['hook'], ['paleHand']] },
    perpetua: { B: 'townswoman', C: 'bettany', Cx: { robeX: 4 }, fw: 0.9, fl: 1.08, age: 0.6, headcloth: [184, 184, 180], body: [28, 26, 30], item: [28, 26, 30], brow: 'set', mouthDown: 0.3, over: [['robe']] },
    packman: { B: 'townsman', C: 'rooke', fw: 1.06, fl: 0.98, age: 0.45, headcloth: 'bg', body: [76, 90, 112], skin: [184, 140, 112], over: [['pack', null, 'pre'], ['shirt', [168, 156, 132]], ['strap'], ['hat']] },
    oona: { B: 'townswoman', C: 'mags', fw: 1.04, fl: 0.96, age: 0.4, headcloth: 'bg', hairOver: 'tied', hairCol: [52, 44, 40], body: [30, 38, 62], item: [30, 38, 62], skin: [190, 150, 124], brow: 'down', mouthDown: 0.4, over: [['admiral']] },
  };
  async function wayBC(id, which) {
    const R = PEOPLE[id], Ch = Object.assign({}, CHANGE[id], CHANGE[id][which + 'x'] || {}), sid = Ch[which], S = SRC[sid], F = S.F, seed = 300 + ORDER.indexOf(id) * 13 + (which === 'C' ? 7 : 0);
    const img = await load(sid), c = mk(), x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; x.drawImage(img, 0, 0, N, N);
    const cx = (F[0] + F[2]) / 2, ey = (F[1] + F[3]) / 2, u = (F[2] - F[0]) / 2, sc = u / 4.5, my = F[5];
    const P = Object.assign({}, R, { cx, ey, u, s: sc, sh: S.sh, fw: 1, fl: 1, seed });
    // 1 the warp: the face broader or longer, the jaw, the brows and the mouth's corners
    const H = [['S', cx, ey + 3 * sc, 13 * sc, Ch.fw, Ch.fl]];
    if (Ch.brow === 'down') H.push(['M', cx - u, ey - 2.4 * sc, 2.4 * sc, 0.4 * sc, 0.9 * sc], ['M', cx + u, ey - 2.4 * sc, 2.4 * sc, -0.4 * sc, 0.9 * sc]);
    if (Ch.brow === 'up') H.push(['M', cx - u + 1, ey - 2.6 * sc, 2.2 * sc, 0, -0.7 * sc], ['M', cx + u - 1, ey - 2.6 * sc, 2.2 * sc, 0, -0.7 * sc]);
    if (Ch.mouthDown) H.push(['M', F[4] - 2.6 * sc, my, 1.7 * sc, 0, Ch.mouthDown * sc], ['M', F[4] + 2.6 * sc, my, 1.7 * sc, 0, Ch.mouthDown * sc]);
    warp(c, H);
    // 2 re-tone: the body's cloth, the head-cloth or hair, the thing held, the skin
    const faceM = () => maskOf((m) => { m.beginPath(); m.ellipse(S.face[0], S.face[1], S.face[2] * Ch.fw, S.face[3] * Ch.fl, 0, 0, Math.PI * 2); m.fill(); }, 1.2);
    const bodyM = mSub(maskOf((m) => { m.fillRect(0, S.body, 96, 96); }, 1.5), maskOf((m) => { m.beginPath(); m.ellipse(S.face[0], S.face[1], S.face[2] * 0.9, S.face[3] * 1.05, 0, 0, Math.PI * 2); m.fill(); }, 1));
    if (Ch.body) retone(c, bodyM, Ch.body, 'col', true);
    if (Ch.item && S.item) retone(c, maskOf((m) => { m.beginPath(); m.ellipse(S.item[0], S.item[1], S.item[2], S.item[3], 0, 0, Math.PI * 2); m.fill(); }, 2), Ch.item, 'col', true);
    const headM = mSub(maskOf((m) => { m.beginPath(); m.ellipse(S.head[0], S.head[1], S.head[2], S.head[3], 0, 0, Math.PI * 2); m.fill(); m.fillRect(S.head[0] - S.head[2], S.head[1], S.head[2] * 2, Math.max(0, S.body - S.head[1])); }, 1.2), faceM());
    if (Ch.headcloth === 'bg') retone(c, headM, [30, 24, 21], 'flat', false);
    else if (Ch.headcloth) retone(c, headM, Ch.headcloth, 'col', true);
    if (Ch.hair === 'white') retone(c, headM, [214, 212, 204], 'col', true);
    if (Ch.skin) retone(c, faceM(), Ch.skin, 'mul', false);
    if (Ch.age > 0.5) retone(c, faceM(), [196, 168, 150], 'mul', false);
    // 3 painted changes on the face: age, an open mouth, hair
    const x4 = ctxOf(c);
    const PP = Object.assign({}, P, { s: sc, fw: Ch.fw, fl: Ch.fl, skin: R.skin, robeX: Ch.robeX });
    const pre = (Ch.over || []).filter((o) => o[2] === 'pre'), post = (Ch.over || []).filter((o) => o[2] !== 'pre');
    if (pre.length) { const L = mk(); applyOver(ctxOf(L), pre, PP); texture(L, 0.15, seed + 2); const lx = L.getContext('2d'); lx.globalCompositeOperation = 'destination-in'; lx.drawImage(maskCanvas(bgMask(c)), 0, 0); blit(c, L); }
    if (Ch.age) { x4.save(); x4.globalCompositeOperation = 'multiply'; ageOnly(x4, Object.assign({}, PP, { age: Ch.age, mw: 2.4 * sc, my })); x4.restore(); }
    if (Ch.mouthOpen) soft(x4, 0.3, () => ell(x4, F[4], my + 0.4, 1.4 * sc, 0.8 * sc, 'rgba(40,18,16,0.85)'));
    if (Ch.hairOver) { const L = mk(), lx = ctxOf(L); const HP = Object.assign({}, PP, { hairStyle: Ch.hairOver, hair: Ch.hairCol || R.hair, streak: R.streak, fw: Ch.fw * 1.02, fl: Ch.fl });
      if (Ch.hairOver === 'long') { hairBack(lx, HP); } lx.save(); lx.globalCompositeOperation = 'destination-out'; ellAt(lx, S.face, Ch, 0.9); lx.restore(); hairFront(lx, HP); texture(L, 0.08, seed + 3); blit(c, L); }
    layer(c, (lx) => applyOver(lx, post, PP), 0.16, seed + 5);
    finish(c, seed);
    return down(c);
  }
  function ellAt(x, f, Ch, k) { x.beginPath(); x.ellipse(f[0], f[1] + 2, f[2] * Ch.fw * k, f[3] * Ch.fl * k, 0, 0, Math.PI * 2); x.fillStyle = '#fff'; x.fill(); }
  function bgMask(c) { const d = c.getContext('2d', { willReadFrequently: true }).getImageData(0, 0, N, N).data, m = new Float32Array(N * N); for (let i = 0; i < m.length; i++) { const o = i * 4, db = Math.abs(d[o] - 32) + Math.abs(d[o + 1] - 25) + Math.abs(d[o + 2] - 22); m[i] = Math.min(1, Math.max(0, 1 - (db - 10) / 30)); } return m; }
  function maskCanvas(m) { const c = mk(), x = c.getContext('2d'), id = x.createImageData(N, N); for (let i = 0; i < m.length; i++) { id.data[i * 4 + 3] = m[i] * 255; } x.putImageData(id, 0, 0); return c; }
  function ageOnly(x, P) {   // the age strokes of head(), alone, for painting onto a painted face
    const { cx, ey, u, s: sc, my, mw, age: a } = P; const dk = 'rgba(120,84,66,' + (0.55 * a) + ')';
    soft(x, 0.35, () => { for (const sd of [-1, 1]) {
      stroke(x, [cx + sd * 2.1 * sc, ey + 6 * sc, cx + sd * (mw + 1.5), my - 0.6, cx + sd * (mw + 1.1), my + 2], 0.55, dk);
      stroke(x, [cx + sd * (u - 1.7), ey + 1.5 * sc, cx + sd * u, ey + 2.4 * sc, cx + sd * (u + 1.8), ey + 1.4 * sc], 0.45, dk);
      if (a > 0.5) { for (let k = 0; k < 3; k++) stroke(x, [cx + sd * (u + 2.2 * sc), ey - 0.5 + k, cx + sd * (u + 3.5 * sc), ey - 0.9 + k * 1.3], 0.35, dk); stroke(x, [cx + sd * (mw + 0.5), my + 1.5, cx + sd * (mw + 0.9), my + 4.5 * sc, cx + sd * (mw - 0.2), my + 7 * sc], 0.45, dk);
        ell(x, cx + sd * 7 * sc, ey + 6 * sc, 1.8 * sc, 3 * sc, 'rgba(110,80,66,' + (0.35 * a) + ')'); }
    }
    for (let k = 0; k < (a > 0.5 ? 3 : 2); k++) stroke(x, [cx - 4 * sc, ey - 4.4 * sc - k * 1.3, cx, ey - 4.9 * sc - k * 1.35, cx + 4 * sc, ey - 4.4 * sc - k * 1.3], 0.35, dk); });
  }

  async function run() {
    const out = {}, ms = { A: [], B: [], C: [] };
    for (const id of ORDER) {
      let t = performance.now(); out[id + '_A'] = wayA(id).toDataURL('image/png'); ms.A.push(performance.now() - t);
      for (const w of ['B', 'C']) { await load(CHANGE[id][w]); t = performance.now(); out[id + '_' + w] = (await wayBC(id, w)).toDataURL('image/png'); ms[w].push(performance.now() - t); }
      out[id + '_now'] = CHANGE[id].B; out[id + '_csrc'] = CHANGE[id].C;
    }
    return { out, ms, names: ORDER.map((k) => PEOPLE[k].name) };
  }
  return { run, wayA, wayBC, PEOPLE, ORDER };
})();
if (typeof window !== 'undefined') window.FT = FT;
