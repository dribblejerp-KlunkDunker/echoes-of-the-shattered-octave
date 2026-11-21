// hands109p — Phase 109, an option for the first-person hands and arms (for the owner's ruling; not used by the game yet).
// Interface: tools/dev/hands109.js. Built by team P: "Painted".
//
// The hands are painted, the way the game's moving paintings are: a picture made at twice the view's size and brought
// down with smoothing. How a picture is made:
//   1. the forms: each hand is a small sculpture of round forms in the view's own space (finger bones as tapered
//      tubes with round knuckles, the back of the hand, the pads of the palm and the thumb, the wrist, the forearm,
//      the glove's cuff, the wool sleeve), posed in three dimensions and laid down nearest-wins, the forms of one hand
//      flowing into each other where they meet (the fingers stay apart). That gives, for every pixel, which form it
//      is, how far it is and which way it faces;
//   2. the underpainting: every pixel is coloured from that: warm lights from the upper left, cooler shadows, red in
//      the turn from light to shadow and at the knuckles, light thrown back from the street into the shadows, a rim
//      where a form turns away, shadows the fingers cast on each other, dark in the creases; and the materials
//      (skin with its nails and tendons, the leather glove with its seams, stitching and worn knuckles, mail rings,
//      wool folds and hem, the glass arm's azure planes, steel);
//   3. the brushwork: thousands of short curved strokes along each form, big to small, each in the colour under it
//      (a little warmer in the lights, cooler in the shadows), kept inside their own form; then the crisp touches:
//      highlights, the creases over the joints; the sword's blade is painted on its own (bevels, fuller, edge, sky).
// Pure: the same arguments give the same pixels (a hash, never Math.random). No images, fonts or libraries.
'use strict';
const HANDS109P = (() => {
  const W = 1152, H = 500, S = 2, BW = W * S, BH = H * S, N = BW * BH;
  const FOC = 760 * S, CX = BW / 2, CY = BH / 2;
  const { sqrt, min, max, abs, sin, cos, exp, PI, atan2, pow, floor, round } = Math;
  const hash = (a, b) => { let n = Math.imul(a, 374761393) + Math.imul(b, 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const h3 = (a, b, c) => hash(Math.imul(a, 73856093) ^ Math.imul(c, 83492791), b ^ Math.imul(c, 19349663));
  const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
  const sstep = (a, b, v) => { const t = clamp((v - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const mix = (a, b, t) => a + (b - a) * t;
  // vectors
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp3 = (a, b, t) => [mix(a[0], b[0], t), mix(a[1], b[1], t), mix(a[2], b[2], t)];
  const ortho = (v, axis) => norm(sub(v, mul(axis, dot(v, axis))));
  // smooth value noise in 3D (for grain and fibres)
  let NT = null;                                                // a 32^3 lattice of hashed values, made once
  function vnoise(x, y, z) {
    if (!NT) { NT = new Float32Array(32768); for (let i = 0; i < 32768; i++) NT[i] = h3(i & 31, (i >> 5) & 31, i >> 10); }
    const xi = floor(x), yi = floor(y), zi = floor(z), xf = x - xi, yf = y - yi, zf = z - zi;
    const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf), w = zf * zf * (3 - 2 * zf);
    const x0 = xi & 31, x1 = (xi + 1) & 31, y0 = (yi & 31) << 5, y1 = ((yi + 1) & 31) << 5, z0 = (zi & 31) << 10, z1 = ((zi + 1) & 31) << 10;
    const a = mix(mix(NT[x0 + y0 + z0], NT[x1 + y0 + z0], u), mix(NT[x0 + y1 + z0], NT[x1 + y1 + z0], u), v);
    const b = mix(mix(NT[x0 + y0 + z1], NT[x1 + y0 + z1], u), mix(NT[x0 + y1 + z1], NT[x1 + y1 + z1], u), v);
    return mix(a, b, w);
  }

  // ---------------------------------------------------------------- buffers (made once, reused)
  let Z, NX, NY, NZ, U, PID, MAT, GRP, AO, SH, SPEC, hand, handX;
  function buffers() {
    if (Z) return;
    Z = new Float32Array(N); NX = new Float32Array(N); NY = new Float32Array(N); NZ = new Float32Array(N); U = new Float32Array(N);
    PID = new Uint16Array(N); MAT = new Uint8Array(N); GRP = new Uint8Array(N); AO = new Float32Array(N); SH = new Float32Array(N); SPEC = new Uint8Array(N);
    const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
    hand = mk(BW, BH); handX = hand.getContext('2d');
  }
  const M_SKIN = 1, M_LEATHER = 2, M_MAIL = 3, M_WOOL = 4, M_GLASS = 5, M_STEEL = 6, M_GRIP = 7, M_INNER = 8;
  let parts = [], bx0, by0, bx1, by1;
  const proj = (p) => { const z = min(p[2], -4); const k = FOC / -z; return [CX + p[0] * k, CY - p[1] * k, k]; };

  // ---------------------------------------------------------------- laying down the forms
  const BLEND = 0.42;                                           // cm: how far the forms of one hand flow into each other
  function frag(i, z, nx, ny, nz, pid, grp, mat, u) {
    const zo = Z[i];
    if (PID[i] && (GRP[i] & grp) && abs(z - zo) < BLEND * 2.5) {
      const h = clamp(0.5 + 0.5 * (z - zo) / BLEND, 0, 1);
      const zn = mix(zo, z, h) + BLEND * h * (1 - h);
      let mx = mix(NX[i], nx, h), my = mix(NY[i], ny, h), mz = mix(NZ[i], nz, h);
      // the fillet where they meet faces a little more up the crease
      const l = 1 / (Math.hypot(mx, my, mz) || 1); Z[i] = zn; NX[i] = mx * l; NY[i] = my * l; NZ[i] = mz * l;
      if (h > 0.5) { PID[i] = pid; MAT[i] = mat; U[i] = u; GRP[i] = grp; }
      return;
    }
    if (PID[i] && z <= zo) return;
    Z[i] = z; NX[i] = nx; NY[i] = ny; NZ[i] = nz; PID[i] = pid; MAT[i] = mat; GRP[i] = grp; U[i] = u;
  }
  function grow(x0, y0, x1, y1) { bx0 = min(bx0, x0); by0 = min(by0, y0); bx1 = max(bx1, x1); by1 = max(by1, y1); }
  // a tapered tube with round ends (or an open end: the far wall inside when it faces you, a clean cut when not)
  function capsule(a, b, ra, rb, part, grp, mat, open) {
    const pid = parts.push(part); part.axis = norm(sub(b, a)); part.len = Math.hypot(...sub(b, a)); part.r = (ra + rb) / 2;
    const A = proj(a), B = proj(b), R0 = ra * A[2], R1 = rb * B[2];
    const x0 = max(0, floor(min(A[0] - R0, B[0] - R1))), x1 = min(BW - 1, Math.ceil(max(A[0] + R0, B[0] + R1)));
    const y0 = max(0, floor(min(A[1] - R0, B[1] - R1))), y1 = min(BH - 1, Math.ceil(max(A[1] + R0, B[1] + R1)));
    if (x1 < x0 || y1 < y0) return part;
    grow(x0, y0, x1, y1);
    const dx = B[0] - A[0], dy = B[1] - A[1], L2 = dx * dx + dy * dy || 1e-6, za = a[2], zb = b[2], len = part.len;
    part.sang = atan2(dy, dx); part.slen = sqrt(L2);
    const faceA = (open & 1) ? dot(norm(sub(a, b)), norm(mul(a, -1))) > 0 : false, faceB = (open & 2) ? dot(norm(sub(b, a)), norm(mul(b, -1))) > 0 : false;
    const Rm = max(R0, R1) + 1, Ls = sqrt(L2), nxn = -dy / Ls, nyn = dx / Ls;
    for (let y = y0; y <= y1; y++) {
      const py = y + 0.5;
      // this row's span of the shape: the two end discs and the band between them
      let lo = 1e9, hi = -1e9;
      const ya = py - A[1], yb = py - B[1];
      if (abs(ya) < Rm) { const w = sqrt(Rm * Rm - ya * ya); lo = min(lo, A[0] - w); hi = max(hi, A[0] + w); }
      if (abs(yb) < Rm) { const w = sqrt(Rm * Rm - yb * yb); lo = min(lo, B[0] - w); hi = max(hi, B[0] + w); }
      if (abs(nxn) > 1e-6 && abs(dx) > 1e-6) {
        const c1 = (py - A[1]) * nyn - A[0] * nxn; let b0 = (-Rm - c1) / nxn, b1 = (Rm - c1) / nxn; if (b0 > b1) { const q = b0; b0 = b1; b1 = q; }
        let s0 = A[0] - ya * dy / dx, s1 = A[0] + (L2 - ya * dy) / dx; if (s0 > s1) { const q = s0; s0 = s1; s1 = q; }
        const l2 = max(b0, s0), h2 = min(b1, s1); if (l2 <= h2) { lo = min(lo, l2); hi = max(hi, h2); }
      } else { lo = x0; hi = x1; }
      const xa = max(x0, floor(lo)), xb = min(x1, Math.ceil(hi));
      for (let x = xa; x <= xb; x++) {
        const px = x + 0.5;
        let t = ((px - A[0]) * dx + (py - A[1]) * dy) / L2, end = 0;
        if (t < 0) { t = 0; end = 1; } else if (t > 1) { t = 1; end = 2; }
        const R = R0 + (R1 - R0) * t, ex = px - (A[0] + dx * t), ey = py - (A[1] + dy * t), d2 = ex * ex + ey * ey;
        if (d2 >= R * R) continue;
        const h = sqrt(1 - d2 / (R * R)), r = ra + (rb - ra) * t, zc = za + (zb - za) * t;
        if (end & open) {
          if (!(end === 1 ? faceA : faceB)) continue;
          frag(y * BW + x, zc - h * r, -ex / R, ey / R, h, pid, 0, M_INNER, sqrt(d2) / R);
          continue;
        }
        frag(y * BW + x, zc + h * r, ex / R, -ey / R, h, pid, grp, mat, t * len);
      }
    }
    return part;
  }
  // an ellipsoid (axes: three unit vectors, radii)
  function ellipsoid(c, ax, rad, part, grp, mat) {
    const pid = parts.push(part); part.r = (rad[0] + rad[1] + rad[2]) / 3; part.c = c;
    const C = proj(c), k = C[2];
    const ex = sqrt((ax[0][0] * rad[0]) ** 2 + (ax[1][0] * rad[1]) ** 2 + (ax[2][0] * rad[2]) ** 2) * k;
    const ey = sqrt((ax[0][1] * rad[0]) ** 2 + (ax[1][1] * rad[1]) ** 2 + (ax[2][1] * rad[2]) ** 2) * k;
    const x0 = max(0, floor(C[0] - ex)), x1 = min(BW - 1, Math.ceil(C[0] + ex)), y0 = max(0, floor(C[1] - ey)), y1 = min(BH - 1, Math.ceil(C[1] + ey));
    if (x1 < x0 || y1 < y0) return part;
    grow(x0, y0, x1, y1);
    const m = [ax[0][2] / rad[0], ax[1][2] / rad[1], ax[2][2] / rad[2]], qa = m[0] * m[0] + m[1] * m[1] + m[2] * m[2];
    for (let y = y0; y <= y1; y++) {
      const Y = -(y + 0.5 - C[1]) / k;
      for (let x = x0; x <= x1; x++) {
        const X = (x + 0.5 - C[0]) / k;
        const q0 = (ax[0][0] * X + ax[0][1] * Y) / rad[0], q1 = (ax[1][0] * X + ax[1][1] * Y) / rad[1], q2 = (ax[2][0] * X + ax[2][1] * Y) / rad[2];
        const qb = 2 * (q0 * m[0] + q1 * m[1] + q2 * m[2]), qc = q0 * q0 + q1 * q1 + q2 * q2 - 1, disc = qb * qb - 4 * qa * qc;
        if (disc < 0) continue;
        const t = (-qb + sqrt(disc)) / (2 * qa);
        const s0 = (q0 + t * m[0]) / rad[0], s1 = (q1 + t * m[1]) / rad[1], s2 = (q2 + t * m[2]) / rad[2];
        let nx = ax[0][0] * s0 + ax[1][0] * s1 + ax[2][0] * s2, ny = ax[0][1] * s0 + ax[1][1] * s1 + ax[2][1] * s2, nz = ax[0][2] * s0 + ax[1][2] * s1 + ax[2][2] * s2;
        const l = 1 / (Math.hypot(nx, ny, nz) || 1);
        frag(y * BW + x, c[2] + t, nx * l, ny * l, nz * l, pid, grp, mat, 0);
      }
    }
    return part;
  }

  // ---------------------------------------------------------------- the hand
  // Local frame of a right hand: X across toward the thumb, Y out of the back of the hand, Z from the wrist toward the
  // knuckles; centimetres, the wrist at the origin. A left hand is the right one mirrored (x -> -x) at the end.
  const FING = [
    { k: [2.95, 0.05, 8.4], L: [4.3, 2.5, 2.0], r: [1.0, 0.88, 0.78, 0.66] },
    { k: [0.98, 0.3, 8.8], L: [4.8, 2.9, 2.15], r: [1.04, 0.92, 0.81, 0.68] },
    { k: [-0.98, 0.2, 8.35], L: [4.45, 2.75, 2.05], r: [0.99, 0.87, 0.77, 0.65] },
    { k: [-2.85, -0.2, 7.45], L: [3.5, 2.05, 1.85], r: [0.87, 0.77, 0.68, 0.57] },
  ];
  const D2R = PI / 180;
  function makeFrame(W0, f, bHint, mirror) {
    f = norm(f); const b = ortho(bHint, f), a = cross(b, f);
    const H = { W: W0, a, b, f, mirror };
    H.p = (X, Y, Z) => [W0[0] + a[0] * X + b[0] * Y + f[0] * Z, W0[1] + a[1] * X + b[1] * Y + f[1] * Z, W0[2] + a[2] * X + b[2] * Y + f[2] * Z];
    H.d = (X, Y, Z) => [a[0] * X + b[0] * Y + f[0] * Z, a[1] * X + b[1] * Y + f[1] * Z, a[2] * X + b[2] * Y + f[2] * Z];
    return H;
  }
  // mirror a world point / direction for the left hand
  const MX = (H, v) => H.mirror ? [-v[0], v[1], v[2]] : v;

  // the thumb of a fist: from its root at the wrist out to the index finger's side, then across the middle segments of
  // the index and middle fingers (which lie at about Y -4.6, Z 6 to 8.6), nail outward
  const FIST_THUMB = { j: [[2.5, -1.3, 1.6], [3.9, -4.2, 5.0], [3.1, -6.15, 6.9], [0.55, -6.35, 7.35]], r: [1.0, 1.12, 1.02, 0.86], dors: [0.1, -1, 0.15] };
  // the poses (right-hand equivalents: a left hand is given where its mirror image would be)
  const POSE = {
    // a fist as it is: the four fingers side by side and parallel, each folded at all three joints so the tips are
    // hidden in the palm; the knuckle heads in a row on top (the middle one highest), the second joints in a row below,
    // the thumb across the middle segments of the first two fingers with its nail toward you. It is seen from the front
    // and a little above: the palm's side toward you, the backs of the first segments on top.
    raised: {
      C: [17.2, -2.6, -40], at: [0.4, -2.6, 7.2], f: [-0.34, 0.9, -0.06], b: [0.22, 0.2, -0.95], fist: 1,
      flex: [[92, 102, 72], [92, 102, 72], [92, 102, 72], [92, 100, 70]], spread: [-1, 0, 1, 3],
      thumb: FIST_THUMB,
    },
    low: {
      C: [15.4, -7.6, -41], at: [0.4, -2.6, 7.2], f: [-0.5, 0.82, -0.04], b: [0.3, 0.2, -0.93], fist: 1,
      flex: [[92, 102, 72], [92, 102, 72], [92, 102, 72], [92, 100, 70]], spread: [-1, 0, 1, 3],
      thumb: FIST_THUMB,
    },
    // the same compact fist closed round the grip (the grip runs along the knuckle row); the palm's side toward you,
    // the wrist cocked so the forearm comes up from the lower right; the blade leans to the upper left
    sword: {
      C: [18.6, -6.6, -40], at: [0, -2.6, 6.8], f: [-0.92, -0.2, 0.0], grip: [0.2, 0.54, -0.815], fist: 1, fore: [0.4, -0.86, 0.3],
      flex: [[88, 100, 72], [88, 100, 72], [88, 100, 72], [90, 98, 70]], spread: [0, 0, 0, 1],
      thumb: FIST_THUMB,
    },
    open: {
      C: [9.6, -3.0, -51], at: [0, -0.5, 4.5], f: [-0.16, 0.95, -0.2], b: [0.18, 0.25, 0.95],
      flex: [[10, 14, 8], [8, 12, 6], [10, 13, 7], [13, 15, 8]], spread: [8, 2, -5, -13],
      thumb: { j: [[2.5, -1.0, 1.5], [4.0, -1.2, 4.3], [5.0, -0.8, 6.6], [5.6, -0.45, 8.6]], r: [1.25, 1.1, 0.98, 0.82], dors: [0.55, 0.8, -0.1] },
    },
  };

  // build one arm: hand (with its forearm, glove cuff and sleeve) or the glass arm; adds parts, returns its details
  function arm(cfg, mirror, mat, look, hi) {
    const glass = mat === M_GLASS, bare = mat === M_SKIN, gloved = !glass && !bare;
    // build in right-hand terms, then mirror every point; the wrist is placed so that cfg.at (local) lands on cfg.C
    let fv = cfg.f, bv = cfg.b;
    if (cfg.grip) { const a = norm(cfg.grip); fv = ortho(cfg.f, a); bv = cross(fv, a); }
    const H0 = makeFrame([0, 0, 0], fv, bv, false), off = H0.d(...cfg.at), Wr = sub(cfg.C, off);
    const W0 = mirror ? [-Wr[0], Wr[1], Wr[2]] : Wr;
    const H = makeFrame(Wr, fv, bv, mirror);
    const P = (X, Y, Z) => MX(H, H.p(X, Y, Z)), Dw = (v) => MX(H, v);
    const frameW = { W: W0, a: Dw(H.a), b: Dw(H.b), f: Dw(H.f) };
    const th = gloved ? 0.13 : 0;                                // a glove's thickness
    const handMat = mat, info = { knuck: [], creases: [], frame: frameW, hand: hi, mat };
    const base = (kind, extra) => Object.assign({ kind, hand: hi, mat: handMat, frame: frameW, glass, bare }, extra || {});
    const bitF = (i) => 1 << i, ALL = 127;
    // the back of the hand, the pads of the palm, the wrist
    const ax = [frameW.a, frameW.b, frameW.f];
    ellipsoid(P(0.1, -0.75, 4.45), ax, [3.75 + th, 1.2 + th, 4.3 + th], base('palm', { dors: frameW.b }), ALL, handMat);
    ellipsoid(P(0.1, -0.35, 0.5), ax, [2.75 + th, 1.6 + th, 2.0], base('palm', { dors: frameW.b }), ALL, handMat);
    ellipsoid(P(2.1, -1.55, 2.9), ax, [1.5 + th, 1.3 + th, 2.6], base('palm', { dors: frameW.b }), ALL, handMat);
    if (cfg.fist) ellipsoid(P(0.1, -2.3, 7.0), ax, [3.4 + th, 1.4, 1.5], base('palm', { dors: frameW.b }), ALL, handMat);
    ellipsoid(P(-2.6, -1.3, 3.8), ax, [1.25 + th, 1.15 + th, 3.0], base('palm', { dors: frameW.b }), ALL, handMat);
    // the knuckles
    for (let i = 0; i < 4; i++) {
      const F = FING[i], kp = P(F.k[0], F.k[1] - 0.22, F.k[2] - 0.3);
      capsule(kp, kp, F.r[0] * (cfg.fist ? 1.04 : 0.94) + th, F.r[0] * (cfg.fist ? 1.04 : 0.94) + th, base('knuckle', { dors: frameW.b }), ALL, handMat, 0);
      info.knuck.push(P(F.k[0], F.k[1] + 1.0, F.k[2]));
      if (i < 3) { const G = FING[i + 1]; capsule(P(F.k[0], F.k[1] - 0.1, F.k[2] - 0.35), P(G.k[0], G.k[1] - 0.1, G.k[2] - 0.35), 0.95 + th, 0.95 + th, base('knuckle', { dors: frameW.b }), ALL, handMat, 0); }
      if (bare) { // the tendons on the back of the hand
        capsule(P(F.k[0] * 0.25, 0.32, 1.3), P(F.k[0] * 0.8, F.k[1] + 0.42, F.k[2] - 1.7), 0.22, 0.26, base('palm', { dors: frameW.b }), ALL, handMat, 0);
      }
    }
    // the fingers
    let fAng = 0;
    for (let i = 0; i < 4; i++) {
      const F = FING[i], fl = cfg.flex[i], sp = cfg.spread[i] * D2R;
      const d0 = [sin(sp), 0, cos(sp)];
      let p = [F.k[0], F.k[1], F.k[2]], cum = 0;
      for (let s = 0; s < 3; s++) {
        cum += fl[s] * D2R;
        const dl = [d0[0] * cos(cum), -sin(cum), d0[2] * cos(cum)], dorsL = [d0[0] * sin(cum), cos(cum), d0[2] * sin(cum)];
        const q = [p[0] + dl[0] * F.L[s], p[1] + dl[1] * F.L[s], p[2] + dl[2] * F.L[s]];
        const kind = ['prox', 'mid', 'dist'][s];
        const fat = cfg.fist ? 0.1 + 0.05 * s : 0;                // a fist's fingers pressed together
        const seg = capsule(P(...p), P(...q), F.r[s] + th + fat, F.r[s + 1] + th + fat, base(kind, { dors: Dw(H.d(...dorsL)), finger: i, nail: bare && s === 2 }), bitF(i) | 64, handMat, 0);
        if (s === 0) fAng = seg.sang || 0;
        seg.fang = fAng;                                        // the glass's planes run along the finger, segments and joints alike
        // the joints (an open hand's only fill the waist between its segments)
        if (s < 2) { const jp = P(...q), jr = F.r[s + 1] * (cfg.fist ? (s ? 1.0 : 1.04) : 0.93) + th + fat; capsule(jp, jp, jr, jr, base('joint', { dors: Dw(H.d(...dorsL)), finger: i, fang: fAng }), bitF(i) | 64, handMat, 0); }
        if (s < 2) {
          info.creases.push({ p: P(q[0] + dorsL[0] * (F.r[s + 1] + th), q[1] + dorsL[1] * (F.r[s + 1] + th), q[2] + dorsL[2] * (F.r[s + 1] + th)), axis: Dw(H.d(...dl)), dors: Dw(H.d(...dorsL)), r: F.r[s + 1] + th, n: s === 0 ? 3 : 2, finger: i });
          if (s === 0 && gloved) { const d0l = [d0[0], 0, d0[2]], up0 = [0, 1, 0], rr = F.r[0] + th; info.creases.push({ p: P(F.k[0] - d0l[0] * 1.1 + up0[0] * rr, F.k[1] + rr * 0.95, F.k[2] - d0l[2] * 1.1), axis: Dw(H.d(...d0l)), dors: Dw(H.d(...up0)), r: rr * 1.1, n: 3, soft: 1, finger: i }); }
          if (s === 0) info.knuck.push(P(q[0] + dorsL[0] * 0.7, q[1] + dorsL[1] * 0.7, q[2] + dorsL[2] * 0.7));
        }
        p = q;
      }
    }
    // the thumb
    const T = cfg.thumb.j;
    for (let s = 0; s < 3; s++) {
      const a = T[s], b = T[s + 1], axL = norm(sub(b, a)), dl = ortho(cfg.thumb.dors, axL);
      const seg = capsule(P(...a), P(...b), cfg.thumb.r[s] + th, cfg.thumb.r[s + 1] + th, base(s === 0 ? 'tmeta' : s === 1 ? 'prox' : 'dist', { dors: Dw(H.d(...dl)), finger: 4, nail: bare && s === 2 }), s === 0 ? ALL : 128, handMat, 0);   // the thumb lies on the fingers; it does not melt into them
      if (s === 0) fAng = seg.sang || 0;
      seg.fang = fAng;
      if (s === 1) info.creases.push({ p: P(...add(b, mul(dl, cfg.thumb.r[2] + th))), axis: Dw(H.d(...axL)), dors: Dw(H.d(...dl)), r: cfg.thumb.r[2] + th, n: 2, finger: 4 });
    }
    // the wrist and forearm (two bones side by side: an oval, not a pipe)
    // the forearm runs back from the wrist along the hand's own line, or along cfg.fore (a cocked wrist, as on a grip)
    const fore = cfg.fore ? norm(cfg.fore) : null;
    const A = (X, Y, d) => fore ? MX(H, add(H.p(X, Y, 0), mul(fore, -d))) : P(X, Y, d);
    const elbow = (X) => A(X, -0.6, -27);
    const fm = glass ? M_GLASS : gloved ? M_WOOL : M_SKIN;      // under a glove the arm is in its sleeve
    capsule(P(1.0, -0.35, 0.4), elbow(1.7), 2.05, 3.05, base('forearm', gloved ? { mat: M_WOOL, dors: frameW.b, seed: hi + 5 } : {}), 64 | 32, fm, 0);
    capsule(P(-1.0, -0.45, 0.4), elbow(-1.5), 1.95, 2.9, base('forearm', gloved ? { mat: M_WOOL, dors: frameW.b, seed: hi + 7 } : {}), 64 | 32, fm, 0);
    if (gloved) capsule(A(0.05, -0.4, -0.2), A(0.05, -0.5, -5.6), 2.7, 3.2, base('cuff', { dors: frameW.b }), 0, mat, 2);
    if (!glass) capsule(A(0.1, -0.5, gloved ? -5.2 : -2.6), A(0.2, -0.6, -29), gloved ? 3.25 : 3.65, 5.9, base('sleeve', { dors: frameW.b, seed: hi, mat: M_WOOL }), 0, M_WOOL, 1);
    // the sword in this hand
    if (cfg.grip) {
      const gY = -2.6, gZ = 6.8;
      const g = Dw(H.d(1, 0, 0));
      capsule(P(-5.6, gY, gZ), P(4.4, gY, gZ), 1.25, 1.3, { kind: 'grip', hand: hi, mat: M_GRIP }, 0, M_GRIP, 0);
      const gc = P(5.1, gY, gZ);
      // the crossguard runs along the blade's edges: across the blade, its flat turned mostly toward you
      const flatN = ortho(norm(mul(gc, -1)), g), e0 = norm(cross(g, flatN)), e = norm(add(mul(e0, 0.97), mul(flatN, 0.24)));
      capsule(add(gc, mul(e, -5.6)), add(gc, mul(e, 5.6)), 0.62, 0.55, { kind: 'guard', hand: hi, mat: M_STEEL }, 0, M_STEEL, 0);
      ellipsoid(gc, [g, e, norm(cross(g, e))], [0.75, 1.5, 1.05], { kind: 'guard', hand: hi, mat: M_STEEL }, 0, M_STEEL);
      capsule(P(-5.6, gY, gZ), P(-6.6, gY, gZ), 0.95, 0.8, { kind: 'guard', hand: hi, mat: M_STEEL }, 0, M_STEEL, 0);
      capsule(P(-7.3, gY, gZ), P(-7.3, gY, gZ), 1.4, 1.4, { kind: 'pommel', hand: hi, mat: M_STEEL, dull: 1 }, 0, M_STEEL, 0);
      info.sword = { base: add(gc, mul(g, 0.55)), g, e };
    }
    return info;
  }

  // ---------------------------------------------------------------- shadows and creases (from the forms themselves)
  function occlusion(L) {
    const R1 = [], dirs = 8;
    for (let d = 0; d < dirs; d++) R1.push([cos(d * PI * 2 / dirs + 0.3), sin(d * PI * 2 / dirs + 0.3)]);
    for (let y = by0; y <= by1; y += 2) for (let x = bx0; x <= bx1; x += 2) {
      let i = y * BW + x;
      if (!PID[i]) { if (x + 1 < BW && PID[i + 1]) i++; else if (y + 1 < BH && PID[i + BW]) i += BW; else if (x + 1 < BW && y + 1 < BH && PID[i + BW + 1]) i += BW + 1; else continue; }
      const z = Z[i], k = FOC / -z;
      // creases: nearby surfaces standing nearer to you
      let occ = 0;
      for (let ring = 0; ring < 2; ring++) {
        const rp = (ring ? 1.9 : 0.75) * k;
        for (let d = 0; d < dirs; d++) {
          const sx = (x + R1[d][0] * rp) | 0, sy = (y + R1[d][1] * rp) | 0;
          if (sx < 0 || sy < 0 || sx >= BW || sy >= BH) continue;
          const j = sy * BW + sx; if (!PID[j]) continue;
          const dz = Z[j] - z; if (dz > 0.12 && dz < 6) occ += min(1, dz / (ring ? 2.2 : 1.0));
        }
      }
      const aoV = 1 - 0.62 * min(1, occ / 9);
      // shadows: walk toward the light and see whether a nearer form stands in the way
      const X = (x + 0.5 - CX) / FOC * -z, Y = -(y + 0.5 - CY) / FOC * -z;
      const px = X + NX[i] * 0.12, py = Y + NY[i] * 0.12, pz = z + NZ[i] * 0.12;
      let sh = 0;
      for (let s = 1; s <= 9; s++) {
        const t = 0.32 * s * s * 0.7 + 0.15 * s, qx = px + L[0] * t, qy = py + L[1] * t, qz = pz + L[2] * t;
        const kk = FOC / -qz, sx = (CX + qx * kk) | 0, sy = (CY - qy * kk) | 0;
        if (sx < 0 || sy < 0 || sx >= BW || sy >= BH) break;
        const j = sy * BW + sx; if (!PID[j]) continue;
        const dz = Z[j] - qz; if (dz > 0.18 && dz < 4.5) { sh = max(sh, min(1, (dz - 0.18) / 0.5) * (1 - s / 14)); }
      }
      const j0 = y * BW + x; AO[j0] = AO[j0 + 1] = AO[j0 + BW] = AO[j0 + BW + 1] = aoV; SH[j0] = SH[j0 + 1] = SH[j0 + BW] = SH[j0 + BW + 1] = 1 - sh;
    }
  }

  // ---------------------------------------------------------------- the underpainting
  function env(ry) {                                            // what steel and glass see: sky above, street below
    const t = sstep(-0.35, 0.35, ry), su = sqrt(max(0, ry)), gd = sqrt(max(0, -ry));
    const sr = mix(0.84, 0.5, su), sg = mix(0.85, 0.62, su), sb = mix(0.84, 0.82, su), gr = mix(0.7, 0.38, gd), gg = mix(0.64, 0.29, gd), gb = mix(0.56, 0.2, gd);
    return [mix(gr, sr, t), mix(gg, sg, t), mix(gb, sb, t)];
  }
  // the glass arm's planes, as the owner approved them: few, large, straight-edged facets (triangles and a few quads)
  // laid on the picture the way a painter lays planes: a grid of jittered corners, each cell cut along one diagonal
  // or left whole. facet(x, y, i, part) leaves in F_: the plane's id, the id of its nearest seam, centimetres to that
  // seam, and the plane's own flat facing
  const GRID = new Map(), DX8 = [3, -3, 0, 0, 2, -2, 2, -2], DY8 = [0, 0, 3, -3, 2, 2, -2, -2];
  let cGk = -1, cAng = 0, cGu = 1, cGv = 1, tId = 0, tX = 0, tY = 0, tZ = 0, F_id = 0, F_id2 = 0, F_e = 0, F_x = 0, F_y = 0, F_z = 1;
  const JIT = 0.27;
  const LU = (i, j, gk) => i + (hash(Math.imul(i, 7) + gk, j) - 0.5) * 2 * JIT, LV = (i, j, gk) => j + (hash(Math.imul(j, 13) + gk, i + 5) - 0.5) * 2 * JIT;
  const QU = new Float64Array(4), QV = new Float64Array(4);
  let qCi = 1e9, qCj = 1e9, qGk = -1, qHc = 0;
  // signed distance (positive inside) from (u, v) to the edge a -> b of a counter-clockwise polygon, in scaled units
  const edgeD = (u, v, au, av, bu, bv) => { const ex = (bu - au) * cGu, ey = (bv - av) * cGv, l = Math.hypot(ex, ey) || 1; return (ex * (v - av) * cGv - ey * (u - au) * cGu) / l; };
  function facetIn(u, v, ci, cj, gk) {
    // the cell's corners, counter-clockwise in (u, v): (i, j), (i + 1, j), (i + 1, j + 1), (i, j + 1)
    if (ci !== qCi || cj !== qCj || gk !== qGk) {             // kept while the pixels stay in one cell
      qCi = ci; qCj = cj; qGk = gk;
      QU[0] = LU(ci, cj, gk); QV[0] = LV(ci, cj, gk); QU[1] = LU(ci + 1, cj, gk); QV[1] = LV(ci + 1, cj, gk);
      QU[2] = LU(ci + 1, cj + 1, gk); QV[2] = LV(ci + 1, cj + 1, gk); QU[3] = LU(ci, cj + 1, gk); QV[3] = LV(ci, cj + 1, gk);
      qHc = hash(Math.imul(ci, 31) + gk, Math.imul(cj, 17) + 3);
    }
    const hc = qHc, whole = hc < 0.28, diag = hc < 0.64 ? 0 : 1;
    const e0 = edgeD(u, v, QU[0], QV[0], QU[1], QV[1]), e1 = edgeD(u, v, QU[1], QV[1], QU[2], QV[2]), e2 = edgeD(u, v, QU[2], QV[2], QU[3], QV[3]), e3 = edgeD(u, v, QU[3], QV[3], QU[0], QV[0]);
    if (e0 < 0 || e1 < 0 || e2 < 0 || e3 < 0) return false;
    const base = (Math.imul(ci, 73856093) ^ Math.imul(cj, 19349663) ^ Math.imul(gk, 83492791)) | 0;
    const eid = (k) => (base * 4 + k) | 0;
    let best = e0, bid = (Math.imul(cj, 977) ^ Math.imul(ci, 3) ^ gk) | 0, cu, cv;
    // the outer edges' ids are shared with the neighbouring cells (bottom / left edges of this cell = top / right of theirs)
    const idB = (Math.imul(cj, 977) ^ Math.imul(ci, 3) ^ gk) | 0, idR = (Math.imul(ci + 1, 1931) ^ Math.imul(cj, 5) ^ gk) | 0;
    const idT = (Math.imul(cj + 1, 977) ^ Math.imul(ci, 3) ^ gk) | 0, idL = (Math.imul(ci, 1931) ^ Math.imul(cj, 5) ^ gk) | 0;
    if (whole) {
      F_id = base; best = e0; bid = idB;
      if (e1 < best) { best = e1; bid = idR; } if (e2 < best) { best = e2; bid = idT; } if (e3 < best) { best = e3; bid = idL; }
      cu = (QU[0] + QU[1] + QU[2] + QU[3]) / 4; cv = (QV[0] + QV[1] + QV[2] + QV[3]) / 4;
    } else if (diag === 0) {                                     // cut from corner 0 to corner 2
      const d = edgeD(u, v, QU[0], QV[0], QU[2], QV[2]);
      if (d < 0) { F_id = eid(1); best = e0; bid = idB; if (e1 < best) { best = e1; bid = idR; } if (-d < best) { best = -d; bid = eid(3); } cu = (QU[0] + QU[1] + QU[2]) / 3; cv = (QV[0] + QV[1] + QV[2]) / 3; }
      else { F_id = eid(2); best = e2; bid = idT; if (e3 < best) { best = e3; bid = idL; } if (d < best) { best = d; bid = eid(3); } cu = (QU[0] + QU[2] + QU[3]) / 3; cv = (QV[0] + QV[2] + QV[3]) / 3; }
    } else {                                                     // cut from corner 1 to corner 3
      const d = edgeD(u, v, QU[1], QV[1], QU[3], QV[3]);
      if (d < 0) { F_id = eid(1); best = e1; bid = idR; if (e2 < best) { best = e2; bid = idT; } if (-d < best) { best = -d; bid = eid(3); } cu = (QU[1] + QU[2] + QU[3]) / 3; cv = (QV[1] + QV[2] + QV[3]) / 3; }
      else { F_id = eid(2); best = e0; bid = idB; if (e3 < best) { best = e3; bid = idL; } if (d < best) { best = d; bid = eid(3); } cu = (QU[0] + QU[1] + QU[3]) / 3; cv = (QV[0] + QV[1] + QV[3]) / 3; }
    }
    F_id2 = bid; F_e = best; F_cu = cu; F_cv = cv;
    return true;
  }
  let F_cu = 0, F_cv = 0;
  function facet(x, y, i, part) {
    const z = Z[i], k = FOC / -z;
    const wide = part.kind === 'palm' || part.kind === 'knuckle', farm = part.kind === 'forearm', fing = !wide && !farm && part.finger !== undefined;
    const gk = wide || farm ? 5000 + part.hand * 10 : fing ? 7000 + part.hand * 10 + part.finger : PID[i];
    const ang = wide || farm ? (part.hand ? 0.9 : 0.6) : fing ? part.fang : (part.sang || 0);
    if (gk !== cGk) {                                            // the grid's size, in pixels (fixed by the first pixel seen)
      cGk = gk; let gd = GRID.get(gk);
      if (!gd) { gd = [ang, (wide || farm ? 4.8 : fing ? 2.5 : max(2.3, part.len * 0.95)) * k, (wide || farm ? 3.8 : part.r * 2.2) * k]; GRID.set(gk, gd); }
      cAng = gd[0]; cGu = gd[1]; cGv = gd[2];
    }
    const ca = cos(cAng), sa = sin(cAng), u = (x * ca + y * sa) / cGu, v = (-x * sa + y * ca) / cGv, iu = floor(u), iv = floor(v);
    let ok = facetIn(u, v, iu, iv, gk);
    for (let q = 0; !ok && q < 8; q++) ok = facetIn(u, v, iu + [1, -1, 0, 0, 1, 1, -1, -1][q], iv + [0, 0, 1, -1, 1, -1, 1, -1][q], gk);
    if (!ok) { F_id = (Math.imul(iu, 31) ^ Math.imul(iv, 7) ^ gk) | 0; F_id2 = F_id + 1; F_e = 9; F_cu = u; F_cv = v; }
    F_e /= k;                                                   // to centimetres
    // the plane's own facing: the form's facing at the plane's middle (a flat plane), turned a little as a cutter leaves it
    const id1 = F_id;
    let fx = NX[i], fy = NY[i], fz = NZ[i];
    for (let tries = 0; tries < 2; tries++) {
      const t = tries ? 0.5 : 1, uu = mix(u, F_cu, t) * cGu, vv = mix(v, F_cv, t) * cGv;
      const sx = round(uu * ca - vv * sa), sy = round(uu * sa + vv * ca);
      if (sx >= 0 && sy >= 0 && sx < BW && sy < BH) { const j = sy * BW + sx; if (PID[j] && MAT[j] === M_GLASS && parts[PID[j] - 1].hand === part.hand) { fx = NX[j]; fy = NY[j]; fz = NZ[j]; break; } }
    }
    if (id1 !== tId) { tId = id1; tX = (h3(id1, 1, 7) - 0.5) * 0.8; tY = (h3(id1, 2, 7) - 0.5) * 0.8; tZ = (h3(id1, 3, 7) - 0.5) * 0.6 + 0.1; }
    fx += tX; fy += tY; fz += tZ;
    const m = 1 / (Math.hypot(fx, fy, fz) || 1); F_x = fx * m; F_y = fy * m; F_z = fz * m;
  }
  function shade(img, look, lt, song) {
    const L = norm([lt.dir[0], lt.dir[1], lt.dir[2]]), key = lt.key.map(v => v / 255), amb = lt.amb.map(v => v / 255);
    const Hh = norm([L[0], L[1], L[2] + 1]), RB = norm([0.6, 0.45, -0.6]);
    const skin = look.skin.map(v => v / 255), wool = look.sleeve.map(v => v / 255);
    const ground = [0.66, 0.5, 0.36], sky = [0.66, 0.76, 0.92];
    const D = img.data;
    const sc = song ? song.col : null;
    for (let y = by0; y <= by1; y++) for (let x = bx0; x <= bx1; x++) {
      const i = y * BW + x, pid = PID[i]; if (!pid) continue;
      const part = parts[pid - 1], mat = MAT[i], z = Z[i];
      let nx = NX[i], ny = NY[i], nz = NZ[i];
      const X = (x + 0.5 - CX) / FOC * -z, Y = -(y + 0.5 - CY) / FOC * -z;
      let ao = AO[i]; const shd = SH[i];
      let br = 0.5, bg = 0.5, bb = 0.5, ks = 0.1, shin = 16, alpha = 1, wrap = 0.25, sss = 0, rimK = 0.4, metal = 0, emit = null, glassNow = false, soft = 0;
      const fr = part.frame;
      if (mat === M_SKIN) {
        br = skin[0]; bg = skin[1]; bb = skin[2]; ks = 0.1; shin = 14; wrap = 0.22; sss = 1;
        // red at the knuckles and the joints, and toward the finger tips
        let kr = 0; const hk = HK[part.hand];
        if (hk) for (let q = 0; q < hk.length; q++) { const p = hk[q], d2 = (X - p[0]) ** 2 + (Y - p[1]) ** 2 + (z - p[2]) ** 2; if (d2 < 5) kr = max(kr, exp(-d2 / 1.1)); }
        if (part.kind === 'dist') kr = max(kr, 0.25 * U[i] / part.len);
        br *= 1 + 0.06 * kr; bg *= 1 - 0.17 * kr; bb *= 1 - 0.17 * kr; ks += 0.06 * kr;
        // skin's own mottle
        const mn = vnoise(X * 2.2, Y * 2.2, z * 2.2) - 0.5; br *= 1 + mn * 0.05; bg *= 1 + mn * 0.07; bb *= 1 + mn * 0.06;
        if (part.nail) {
          const dv = part.dors, nd = nx * dv[0] + ny * dv[1] + nz * dv[2], tt = U[i] / part.len, na = nx * part.axis[0] + ny * part.axis[1] + nz * part.axis[2];
          if (nd > 0.6 && tt > 0.32 && na < 0.75) {
            // the nail: paler and pinker than the skin, a pale half-moon at its root, a pale free edge, glossy
            const lun = tt < 0.5 ? sstep(0.5, 0.38, tt) : 0, edge = na > 0.42 || (tt >= 0.999 && na > 0.28) ? 1 : 0;
            br = 0.86; bg = 0.66; bb = 0.6;
            br = mix(br, 0.97, lun * 0.7); bg = mix(bg, 0.88, lun * 0.7); bb = mix(bb, 0.84, lun * 0.7);
            if (edge) { br = 0.97; bg = 0.92; bb = 0.84; }
            if (nd < 0.6 || tt < 0.35) { br *= 0.72; bg *= 0.6; bb *= 0.6; }
            ks = 0.4; shin = 50; sss = 0.3;
          }
        }
      } else if (mat === M_LEATHER || mat === M_MAIL) {
        let ring = false;
        if (mat === M_MAIL) {
          // mail over the back of the hand, the fingers' backs and the cuff; the palm is leather
          const dv = part.dors; const nd = dv ? nx * dv[0] + ny * dv[1] + nz * dv[2] : 1;
          if (nd > -0.25 || part.kind === 'cuff') {
            // rings laid in rows along the form, at their size on the picture (a painter's mail, not a texture)
            const k = FOC / -z, p = 0.48 * k, ang = part.sang !== undefined && part.slen > 6 ? part.sang : (fr ? fangle(fr) : 0);
            const ca = cos(ang), sa = sin(ang), ru = (x * ca + y * sa) / p, rv = (-x * sa + y * ca) / (p * 0.82), row = floor(rv);
            let best = 9, bdx = 0, bdy = 0, bid = 0;
            for (let j = -1; j <= 1; j++) {
              const r2 = row + j, o2 = (r2 & 1) ? 0.5 : 0, cu0 = floor(ru - o2);
              for (let q = -1; q <= 1; q++) {
                const cu = cu0 + q + 0.5 + o2, cv = r2 + 0.5, du = ru - cu, dv = (rv - cv) * 0.82, rr = sqrt(du * du + dv * dv), dd = abs(rr - 0.37);
                const pri = dd - (((r2 + cu0 + q) & 1) ? 0.025 : 0);
                if (pri < best) { best = pri; bdx = (du * ca - dv * sa) / (rr || 1); bdy = (du * sa + dv * ca) / (rr || 1); bid = r2 * 131 + cu0 + q; }
              }
            }
            if (best < 0.09) {
              ring = true; const tilt = (abs(best) / 0.09) * 0.9 * (best >= 0 ? 1 : -1);
              nx += bdx * tilt * 0.8; ny -= bdy * tilt * 0.8; const l = 1 / Math.hypot(nx, ny, nz); nx *= l; ny *= l; nz *= l;
              const vv = 0.9 + 0.2 * hash(bid, 3);
              br = 0.4 * vv; bg = 0.41 * vv; bb = 0.43 * vv; metal = 0.6; ks = 0.8; shin = 36; rimK = 0.3;
            } else { br = 0.11; bg = 0.1; bb = 0.1; ks = 0.05; ao *= 0.75; }
          }
        }
        if (!ring && !(mat === M_MAIL && br < 0.12)) {
          br = 0.38; bg = 0.245; bb = 0.145; ks = 0.1; shin = 6; wrap = 0.24; rimK = 0.6; soft = 1;
          if (part.kind === 'cuff') { br = 0.4; bg = 0.26; bb = 0.155; }
          const gn = vnoise(X * 3.1, Y * 3.1, z * 3.1) - 0.5, gf = hash(x >> 1, y >> 1) - 0.5, gw = vnoise(X * 0.7 + 9, Y * 0.7, z * 0.7) - 0.5;
          const m = 1 + gn * 0.14 + gf * 0.07 + gw * 0.26; br *= m; bg *= m; bb *= m;
          // worn paler at the knuckles
          let kr = 0; const hk = HK[part.hand];
          if (hk) for (let q = 0; q < hk.length; q++) { const p = hk[q], d2 = (X - p[0]) ** 2 + (Y - p[1]) ** 2 + (z - p[2]) ** 2; if (d2 < 6) kr = max(kr, exp(-d2 / 1.4)); }
          kr *= 0.75 + gn;
          br = mix(br, 0.52, kr * 0.26); bg = mix(bg, 0.39, kr * 0.26); bb = mix(bb, 0.28, kr * 0.26);
          // seams with stitching along the sides of the fingers
          const dv = part.dors;
          if (dv && (part.kind === 'prox' || part.kind === 'mid' || part.kind === 'dist')) {
            const sd = part.side || (part.side = cross(part.axis, dv)), nd = nx * dv[0] + ny * dv[1] + nz * dv[2], ns = nx * sd[0] + ny * sd[1] + nz * sd[2];
            const ang = abs(atan2(ns, nd)), sdist = abs(ang - PI / 2) * part.r;
            if (sdist < 0.05) { br *= 0.7; bg *= 0.67; bb *= 0.64; }
            else if (sdist < 0.2 && sdist > 0.1 && ((U[i] / 0.3) % 1) < 0.55) { br = mix(br, 0.66, 0.6); bg = mix(bg, 0.55, 0.6); bb = mix(bb, 0.4, 0.6); }
          }
          // three stitched lines down the back of the glove
          if (part.kind === 'palm') {
            const dx = X - fr.W[0], dy = Y - fr.W[1], dz = z - fr.W[2], la = dx * fr.a[0] + dy * fr.a[1] + dz * fr.a[2], lb = dx * fr.b[0] + dy * fr.b[1] + dz * fr.b[2], lf = dx * fr.f[0] + dy * fr.f[1] + dz * fr.f[2];
            if (lb > 0.2 && lf > 1.6 && lf < 6.8) for (const X0 of [1.95, 0.0, -1.95]) {
              const xx = la - X0 * (0.82 + (lf - 1.6) * 0.035), ph = (lf / 0.34) % 1;
              if (abs(xx) < 0.1) { const rid = xx / 0.1; nx += fr.a[0] * rid * 0.25; ny += fr.a[1] * rid * 0.25; nz += fr.a[2] * rid * 0.25; }
              if (abs(xx) < 0.045 && ph < 0.6) { br = mix(br, 0.5, 0.5); bg = mix(bg, 0.4, 0.5); bb = mix(bb, 0.28, 0.5); }
              else if (abs(xx) < 0.05) { br *= 0.6; bg *= 0.58; bb *= 0.55; }
            }
          }
          // the cuff: a row of stitches near its edge
          if (part.kind === 'cuff') {
            const ue = part.len - U[i];
            if (abs(ue - 0.75) < 0.05) { br *= 0.5; bg *= 0.48; bb *= 0.45; }
            if (ue < 0.35) { br *= 1.18; bg *= 1.15; bb *= 1.1; }
            if (U[i] < 0.6) { br *= 0.8; bg *= 0.78; bb *= 0.76; }
          }
        }
      } else if (mat === M_WOOL) {
        br = wool[0]; bg = wool[1]; bb = wool[2]; ks = 0.03; shin = 5; wrap = 0.4; rimK = 0.55;
        // folds: soft rolls across the sleeve, wandering round it
        const dv = part.dors, ax = part.axis, sd = part.side || (part.side = cross(ax, dv)), nd = nx * dv[0] + ny * dv[1] + nz * dv[2], ns = nx * sd[0] + ny * sd[1] + nz * sd[2];
        const ang = atan2(ns, nd), u = U[i];
        const ph = u * 2 * PI / 3.6 + 1.5 * sin(ang * 1.3 + part.seed * 2.1) + 2.2 * vnoise(u * 0.35, ang * 0.8, part.seed * 3);
        const fold = sin(ph), A = 0.42 * sstep(0, 3, u);
        nx += ax[0] * fold * A; ny += ax[1] * fold * A; nz += ax[2] * fold * A;
        const l = 1 / Math.hypot(nx, ny, nz); nx *= l; ny *= l; nz *= l;
        ao *= 1 - 0.18 * max(0, -cos(ph)) * sstep(0, 3, u);
        // fibre and weave
        const fn = vnoise(X * 9, Y * 9, z * 9) - 0.5, wv = sin((u * 22) + sin(ang * 40) * 0.6) * 0.5;
        const m = 1 + fn * 0.14 + wv * 0.035; br *= m; bg *= m; bb *= m;
        // the hem
        if (u < 1.5) { const hb = (0.75 - u) / 0.75; nx += ax[0] * hb * 0.5; ny += ax[1] * hb * 0.5; nz += ax[2] * hb * 0.5; const l2 = 1 / Math.hypot(nx, ny, nz); nx *= l2; ny *= l2; nz *= l2; }
        if (abs(u - 1.6) < 0.07) { br *= 0.6; bg *= 0.6; bb *= 0.6; }
      } else if (mat === M_GLASS) {
        glassNow = true;
      } else if (mat === M_STEEL) {
        br = 0.5; bg = 0.5; bb = 0.52; metal = 0.85; ks = 0.9; shin = 50; rimK = 0.2;
        if (part.dull) { br = 0.4; bg = 0.39; bb = 0.4; metal = 0.55; ks = 0.5; shin = 30; }
      } else if (mat === M_GRIP) {
        // a leather wrap wound round the grip
        const ax = part.axis, rf = part.rf || (part.rf = ortho([0, 0, 1], ax)), sd = part.side || (part.side = cross(ax, rf)), ang = atan2(nx * sd[0] + ny * sd[1] + nz * sd[2], nx * rf[0] + ny * rf[1] + nz * rf[2]);
        const ph = U[i] / 0.62 + ang / (2 * PI), f = ph - floor(ph);
        br = 0.24; bg = 0.15; bb = 0.09; ks = 0.25; shin = 12;
        const g = f < 0.14 ? 0.45 : 1 - 0.25 * abs(f - 0.57) * 2; br *= g; bg *= g; bb *= g;
        const tl = (f - 0.57) * 0.6; nx += ax[0] * tl; ny += ax[1] * tl; nz += ax[2] * tl; const l = 1 / Math.hypot(nx, ny, nz); nx *= l; ny *= l; nz *= l;
      } else if (mat === M_INNER) {
        const lip = U[i] > 0.86 ? 1 : 0;
        const pm = part.mat === M_WOOL ? wool : [0.3, 0.19, 0.11];
        br = pm[0] * (0.25 + 0.75 * lip); bg = pm[1] * (0.25 + 0.75 * lip); bb = pm[2] * (0.25 + 0.75 * lip); ks = 0; ao *= 0.6 + 0.4 * lip;
      }

      let r, g, b, sp = 0;
      if (glassNow) {
        // the glass arm: deep azure planes, dark seams, a few bright edges, a bright rim, a quarter of its glow
        facet(x, y, i, part);
        const id = F_id, fx = F_x, fy = F_y, fz = F_z;
        // each plane its own value: most from how it faces the light, a few nearly black-blue, a few pale
        const hv = h3(id, 5, 9), dark = hv < 0.14, pale = hv > 0.87;
        const dl = max(0, fx * L[0] + fy * L[1] + fz * L[2]), val = dark ? 0.1 : 0.72 + 0.55 * h3(id, 8, 9);
        const fq = 1 - max(0, nz * 0.35 + fz * 0.65), fres = fq * fq * sqrt(fq), sil = pow(1 - max(0, nz), 6), smooth = max(0, nx * L[0] + ny * L[1] + nz * L[2]) * 0.5;
        // a plane's value from how it faces the light: deep azure turned away, clear blue toward it
        const t1 = clamp(sstep(-0.1, 0.8, dl) * val + (pale ? 0.25 : 0), 0, 1.1), t2 = sstep(0.7, 0.98, dl);
        r = mix(0.01, 0.14, t1); g = mix(0.05, 0.46, t1); b = mix(0.2, 0.88, t1);
        const t3 = pale ? 0.42 + 0.3 * t2 : t2 * (h3(id, 4, 2) < 0.18 ? 0.45 : 0.06);
        r = mix(r, 0.58, t3); g = mix(g, 0.84, t3); b = mix(b, 0.98, t3);
        r += 0.02 * smooth; g += 0.05 * smooth; b += 0.08 * smooth;
        // planes turned up hold the sky, planes turned down the street's warmth
        const ry2 = 2 * fz * fy - 0; const ev = env(ry2); const rk = 0.05 + 0.3 * fres;
        r += (ev[0] - 0.5) * rk * 0.5; g += (ev[1] - 0.5) * rk * 0.6; b += (ev[2] - 0.45) * rk * 0.8;
        // the inner glow, a quarter of its first strength, strongest through the thick of the arm
        const core = nz * nz * (part.r > 1.5 ? 0.7 : 0.5); r += 0.03 * core; g += 0.11 * core; b += 0.2 * core;
        // the bright rim
        r += 0.25 * fres * fres + 0.6 * sil; g += 0.4 * fres * fres + 0.85 * sil; b += 0.45 * fres * fres + 0.95 * sil;
        const hx = max(0, fx * Hh[0] + fy * Hh[1] + fz * Hh[2]), h2 = hx * hx, h4 = h2 * h2, h8 = h4 * h4, h32 = h8 * h8 * h8 * h8;
        const hs = max(0, nx * Hh[0] + ny * Hh[1] + nz * Hh[2]), s2 = hs * hs, s4 = s2 * s2, s8 = s4 * s4, s16 = s8 * s8, s32 = s16 * s16, s128 = s32 * s32 * s32 * s32;
        // a plane catches the light only when it faces it squarely, and only some of them (as cut glass flashes)
        sp = (h32 * h32 * (h3(id, 6, 3) < 0.45 ? 0.75 : 0.25) + s128 * s32 * 0.25) * shd; r += sp * 0.85; g += sp * 0.95; b += sp;
        r *= 0.8 + 0.2 * shd; g *= 0.8 + 0.2 * shd; b *= 0.85 + 0.15 * shd;
        // the seams between the planes: most dark and fine, a few catching the light
        const e = F_e, pairH = hash(F_id2, 77);
        if (e < 0.075) { const s = sstep(0.075, 0.02, e); if (pairH < 0.13) { r = mix(r, 0.82, s); g = mix(g, 0.96, s); b = mix(b, 1, s); } else { r = mix(r, 0.01, s * 0.8); g = mix(g, 0.05, s * 0.8); b = mix(b, 0.16, s * 0.8); } }
        r *= mix(0.7, 1, ao); g *= mix(0.7, 1, ao); b *= mix(0.78, 1, ao);
        // each form of the arm outlined: a bright rim where it stands in front of something, a dark seam where it passes behind
        let front = 0, behind = 0;
        for (let q = 0; q < 8; q++) {
          const dx = DX8[q], dy = DY8[q], xx = x + dx, yy = y + dy;
          if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) { front += 0.5; continue; }
          const j = yy * BW + xx;
          if (!PID[j]) front += 0.5; else { const dz = Z[j] - z; if (dz < -0.5) front += min(0.5, (-dz - 0.5) * 0.8); else if (dz > 0.5) behind += min(0.5, (dz - 0.5) * 0.8); }
        }
        if (front > 0.25) { const s = min(1, (front - 0.25) * 0.9); r = mix(r, 0.62, s * 0.8); g = mix(g, 0.88, s * 0.8); b = mix(b, 1.0, s * 0.8); }
        else if (behind > 0.25) { const s = min(1, (behind - 0.25) * 0.8); r = mix(r, 0.01, s * 0.75); g = mix(g, 0.04, s * 0.75); b = mix(b, 0.14, s * 0.75); }
        // the thin of it lets the world through
        alpha = clamp(0.8 + 0.3 * fres + 0.08 * t2 - (part.r < 1.2 ? 0.07 : 0) - (h3(id, 9, 1) < 0.3 ? 0.07 : 0), 0.66, 1);
        if (song) { const sx = song.p[0] - X, sy = song.p[1] - Y, sz = song.p[2] - z, sd = Math.hypot(sx, sy, sz), I = 1 / (1 + (sd / 9) ** 2), nd = max(0, (nx * sx + ny * sy + nz * sz) / sd); const s = I * (nd * 0.8 + fres * 1.6) * 1.1; r += sc[0] * s; g += sc[1] * s; b += sc[2] * s; }
      } else {
        const ndl = nx * L[0] + ny * L[1] + nz * L[2];
        const d0 = max(0, (ndl + wrap) / (1 + wrap)), dm = sstep(0.12, 0.5, d0);
        // the light in planes, as a painter masses it: light, half-tone, shadow, with soft steps between
        const q0 = (d0 * 0.45 + dm * 0.55) * (0.15 + 0.85 * shd), q3 = q0 * 3, qf = q3 - floor(q3);
        let diff = mix(q0, min(1, (floor(q3) + sstep(0.3, 0.7, qf)) / 3), soft ? 0.15 : 0.55);   // leather's light is soft, not stepped
        const skyA = (0.72 + 0.28 * ny) * ao * 0.8, bounce = (max(0, -ny) * 0.6 + 0.1) * ao * 0.5;
        const fres = pow(1 - max(0, nz), 3), rimS = fres * (0.3 + 0.7 * max(0, nx * RB[0] + ny * RB[1] + nz * RB[2])) * rimK * ao;
        const hx = nx * Hh[0] + ny * Hh[1] + nz * Hh[2]; sp = pow(max(0, hx), shin) * ks * (0.2 + 0.8 * shd);
        if (metal) {
          const ry = 2 * nz * ny, ev = env(ry);
          r = mix(br * (key[0] * diff + amb[0] * skyA), ev[0] * br * 1.35, metal) + sp * key[0];
          g = mix(bg * (key[1] * diff + amb[1] * skyA), ev[1] * bg * 1.35, metal) + sp * key[1];
          b = mix(bb * (key[2] * diff + amb[2] * skyA), ev[2] * bb * 1.35, metal) + sp * key[2];
          r *= mix(0.55, 1, ao); g *= mix(0.55, 1, ao); b *= mix(0.55, 1, ao);
          r += sky[0] * rimS * 0.5; g += sky[1] * rimS * 0.5; b += sky[2] * rimS * 0.5;
        } else {
          // a painter's ramp: shadow (warm and dark), half-tone (rosier for skin), light (the key's colour); then the
          // sky's cool on planes turned up, the street's warmth thrown back into planes turned down, dark in the creases
          const HT = sss ? HALF_SKIN : mat === M_WOOL ? HALF_WOOL : HALF_LEATHER, SD = sss ? SHAD_SKIN : mat === M_WOOL ? SHAD_WOOL : SHAD_LEATHER;
          const t = diff, lo = t < 0.5, u2 = lo ? t / 0.5 : (t - 0.5) / 0.5;
          const kr = key[0] * 1.04, kg = key[1] * 1.02, kb = key[2];
          r = br * (lo ? mix(SD[0], HT[0], u2) : mix(HT[0], kr, u2)); g = bg * (lo ? mix(SD[1], HT[1], u2) : mix(HT[1], kg, u2)); b = bb * (lo ? mix(SD[2], HT[2], u2) : mix(HT[2], kb, u2));
          const dark = (1 - t) * ao, up = max(0, ny), dn = max(0, -ny);
          r += br * (amb[0] * 0.42 * up + ground[0] * 0.5 * dn + 0.04) * dark; g += bg * (amb[1] * 0.42 * up + ground[1] * 0.45 * dn + 0.04) * dark; b += bb * (amb[2] * 0.5 * up + ground[2] * 0.35 * dn + 0.05) * dark;
          if (soft) { r *= mix(0.74, 1, ao); g *= mix(0.7, 1, ao); b *= mix(0.7, 1, ao); }   // leather: soft creases, no hard outlines
          else { r *= mix(0.5, 1, ao); g *= mix(0.45, 1, ao); b *= mix(0.45, 1, ao); }
          if (soft) {
            // leather's soft sheen: a broad low gloss toward the light and a pale bloom where the form turns away
            const sh2 = max(0, hx), sh4 = sh2 * sh2 * sh2 * sh2, graze = (1 - max(0, nz)) ** 2 * max(0, ndl + 0.35) * (0.3 + 0.7 * shd);
            const s2 = (sh4 * 0.16 + graze * 0.16) * ao; r += key[0] * s2 * 0.95; g += key[1] * s2 * 0.88; b += key[2] * s2 * 0.8;
          }
          r += sp * key[0] + sky[0] * rimS * 0.5; g += sp * key[1] + sky[1] * rimS * 0.5; b += sp * key[2] + sky[2] * rimS * 0.58;
        }
        if (song) {
          const sx = song.p[0] - X, sy = song.p[1] - Y, sz = song.p[2] - z, sd = Math.hypot(sx, sy, sz), I = 1 / (1 + (sd / 7) ** 2), nd = max(0, (nx * sx + ny * sy + nz * sz) / sd);
          const s = I * (nd * 1.2 + fres * 1.5) * ao; r += sc[0] * s * (br + 0.15) * 1.8; g += sc[1] * s * (bg + 0.12) * 1.8; b += sc[2] * s * (bb + 0.05) * 1.8;
          const edge = fres * nd * I; r += sc[0] * edge * 0.9; g += sc[1] * edge * 0.85; b += sc[2] * edge * 0.6;
        }
      }
      // a soft shoulder for the brightest lights
      if (r > 0.86) r = 0.86 + (r - 0.86) * 0.55; if (g > 0.86) g = 0.86 + (g - 0.86) * 0.55; if (b > 0.86) b = 0.86 + (b - 0.86) * 0.55;
      const o = i * 4; D[o] = r * 255; D[o + 1] = g * 255; D[o + 2] = b * 255; D[o + 3] = alpha * 255;
      SPEC[i] = clamp(sp * 255, 0, 255);
    }
  }
  let HK = [];
  const HALF_SKIN = [0.9, 0.64, 0.58], SHAD_SKIN = [0.5, 0.33, 0.31], HALF_LEATHER = [0.72, 0.6, 0.55], SHAD_LEATHER = [0.46, 0.37, 0.33], HALF_WOOL = [0.74, 0.72, 0.74], SHAD_WOOL = [0.4, 0.38, 0.42];

  // ---------------------------------------------------------------- the brushwork
  function brushwork(ctx, img) {
    const D = img.data;
    const passes = [
      { sp: 15, w: [8, 15], l: [20, 40], a: 0.4, j: 0.1 },
      { sp: 11, w: [4.5, 8], l: [12, 24], a: 0.45, j: 0.09 },
      { sp: 8, w: [2.4, 4], l: [7, 13], a: 0.42, j: 0.08 },
    ];
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.lineCap = 'round';
    let n = 0;
    passes.forEach((ps, pi) => {
      const gx0 = floor(bx0 / ps.sp), gx1 = floor(bx1 / ps.sp), gy0 = floor(by0 / ps.sp), gy1 = floor(by1 / ps.sp);
      for (let gy = gy0; gy <= gy1; gy++) for (let gx = gx0; gx <= gx1; gx++) {
        const hA = hash(gx * 3 + pi, gy * 5 + 1), hB = hash(gx + 77, gy * 3 + pi), hC = hash(gy + 13 * pi, gx + 5);
        const x = floor((gx + hA) * ps.sp), y = floor((gy + hB) * ps.sp);
        if (x < 0 || y < 0 || x >= BW || y >= BH) continue;
        const i = y * BW + x, pid = PID[i]; if (!pid) continue;
        const mat = MAT[i]; if (mat === M_GLASS || mat === M_INNER || mat === M_MAIL || (mat === M_STEEL && pi > 0)) continue;
        const part = parts[pid - 1]; if (part.kind === 'knuckle' || part.kind === 'joint') continue;
        const Rp = part.r * FOC / -Z[i];
        let ang = part.sang !== undefined && part.slen > 6 ? part.sang : (part.frame ? fangle(part.frame) : 0);
        // along the form where the light changes little; where it turns, along the turn (never across it)
        const rr = ps.sp >> 1, lumAt = (xx, yy) => { if (xx < 0 || yy < 0 || xx >= BW || yy >= BH) return -1; const j = yy * BW + xx; if (PID[j] !== pid) return -1; const q = j * 4; return D[q] * 0.3 + D[q + 1] * 0.55 + D[q + 2] * 0.15; };
        const c0 = lumAt(x, y), lx1 = lumAt(x + rr, y), lx0 = lumAt(x - rr, y), ly1 = lumAt(x, y + rr), ly0 = lumAt(x, y - rr);
        const gxl = (lx1 < 0 ? c0 : lx1) - (lx0 < 0 ? c0 : lx0), gyl = (ly1 < 0 ? c0 : ly1) - (ly0 < 0 ? c0 : ly0), gm = Math.hypot(gxl, gyl);
        if (gm > 6) { let ia = atan2(gyl, gxl) + PI / 2; if (cos(ia - ang) < 0) ia += PI; const wgt = min(1, (gm - 6) / 14); ang = ang + wgt * (atan2(sin(ia - ang), cos(ia - ang))); }
        ang += (hC - 0.5) * (part.kind === 'palm' || part.kind === 'knuckle' ? 0.5 : 0.3);
        const len = min(mix(ps.l[0], ps.l[1], hB), Rp * 2.2), w = min(mix(ps.w[0], ps.w[1], hC), Rp * 0.45);
        let ca = cos(ang) * len / 2, sa = sin(ang) * len / 2;
        let ok = false;
        for (let tries = 0; tries < 2 && !ok; tries++) {
          const ax = (x - ca) | 0, ay = (y - sa) | 0, bx = (x + ca) | 0, by = (y + sa) | 0;
          if (ax >= 0 && ay >= 0 && bx >= 0 && by >= 0 && ax < BW && bx < BW && ay < BH && by < BH && PID[ay * BW + ax] === pid && PID[by * BW + bx] === pid) ok = true;
          else { ca *= 0.5; sa *= 0.5; }
        }
        if (!ok) continue;
        const o = i * 4; let r = D[o], g = D[o + 1], b = D[o + 2];
        const lum = (r + g + b) / 765, jv = 1 + (hash(gx * 11 + pi, gy * 7) - 0.5) * 2 * ps.j;
        r *= jv; g *= jv; b *= jv;
        if (lum > 0.45) { r *= 1.03; b *= 0.96; } else { r *= 0.97; b *= 1.05; }
        const bend = (hash(gx, gy + 99) - 0.5) * len * 0.35, mx = x - sin(ang) * bend, my = y + cos(ang) * bend;
        ctx.strokeStyle = `rgba(${r | 0},${g | 0},${b | 0},${ps.a})`; ctx.lineWidth = w;
        ctx.beginPath(); ctx.moveTo(x - ca, y - sa); ctx.quadraticCurveTo(mx, my, x + ca, y + sa); ctx.stroke(); n++;
      }
    });
    // the crisp touches: highlights
    for (let y = by0; y <= by1; y += 4) for (let x = bx0 + (y & 4 ? 2 : 0); x <= bx1; x += 5) {
      const i = y * BW + x, s = SPEC[i]; if (s < 70 || !PID[i]) continue;
      const mat = MAT[i]; if (mat === M_GLASS) continue;
      const part = parts[PID[i] - 1], ang = (part.sang || 0) + (hash(x, y) - 0.5) * 0.4, len = 3 + 6 * hash(y, x), o = i * 4;
      const t = min(1, s / 255) * 0.75;
      ctx.strokeStyle = `rgba(${min(255, D[o] + 60) | 0},${min(255, D[o + 1] + 55) | 0},${min(255, D[o + 2] + 45) | 0},${t})`; ctx.lineWidth = 2 + 2 * hash(x + 3, y);
      ctx.beginPath(); ctx.moveTo(x - cos(ang) * len, y - sin(ang) * len); ctx.lineTo(x + cos(ang) * len, y + sin(ang) * len); ctx.stroke(); n++;
    }
    ctx.restore();
    return n;
  }
  const fangle = (fr) => { const a = proj(fr.W), b = proj(add(fr.W, mul(fr.f, 5))); return atan2(b[1] - a[1], b[0] - a[0]); };

  // creases over the joints, painted crisp
  function creases(ctx, infos) {
    ctx.save(); ctx.globalCompositeOperation = 'source-atop'; ctx.lineCap = 'round';
    for (const inf of infos) {
      if (inf.mat === M_GLASS || inf.mat === M_MAIL) continue;
      const leather = inf.mat === M_LEATHER;
      for (const c of inf.creases) {
        if (c.dors[2] < -0.05) continue;
        const P = proj(c.p), x = P[0] | 0, y = P[1] | 0; if (x < 0 || y < 0 || x >= BW || y >= BH) continue;
        const i = y * BW + x; if (!PID[i] || abs(Z[i] - c.p[2]) > 0.45 || parts[PID[i] - 1].finger !== c.finger) continue;   // only on its own finger
        const A = proj(add(c.p, c.axis)), ax = A[0] - P[0], ay = A[1] - P[1], al = Math.hypot(ax, ay) || 1, ux0 = ax / al, uy0 = ay / al;
        const half = c.r * P[2] * 0.62 * (0.5 + 0.5 * min(1, c.dors[2] + 0.4));
        const n = c.n - (hash(x, y) < 0.4 ? 1 : 0);
        for (let k = 0; k < n; k++) {
          // leather folds lie unevenly: each its own spacing, length and slant
          const tl = leather ? (hash(k + 11, x) - 0.5) * 0.55 : 0, ux = ux0 * cos(tl) - uy0 * sin(tl), uy = ux0 * sin(tl) + uy0 * cos(tl);
          const off = (k - (n - 1) / 2) * 0.2 * P[2] * (leather ? 0.7 + 0.6 * hash(k, y + 5) : 1) + (hash(x, k) - 0.5) * 4, hl = half * (0.65 + 0.35 * hash(y, k + 3)) * (1 - 0.15 * k) * (leather ? 0.6 + 0.5 * hash(k + 1, x + 9) : 1), sh = (hash(k, x + y) - 0.5) * hl * 0.5;
          const cx = P[0] + ux * off - uy * sh * 0.3, cy = P[1] + uy * off + ux * sh * 0.3, bow = (0.12 + 0.18 * hash(k + 7, x)) * hl;
          const line = (o, col, w) => { ctx.strokeStyle = col; ctx.lineWidth = w; ctx.beginPath(); ctx.moveTo(cx - uy * hl + ux * o, cy + ux * hl + uy * o); ctx.quadraticCurveTo(cx + ux * (bow + o), cy + uy * (bow + o), cx + uy * hl * 0.9 + ux * o, cy - ux * hl * 0.9 + uy * o); ctx.stroke(); };
          if (leather) { const a = 0.6 + 0.4 * hash(k + 3, y); line(0, `rgba(20,10,4,${0.1 * a})`, 5); line(0, `rgba(28,14,6,${0.3 * a})`, 1.3); line(-2.2, `rgba(176,134,98,${0.22 * a})`, 1.4); }
          else { line(0, 'rgba(120,60,50,0.12)', 4.5); line(0, 'rgba(105,52,42,0.36)', 1.3); line(-2, 'rgba(255,230,205,0.22)', 1.3); }
        }
      }
    }
    ctx.restore();
  }

  // ---------------------------------------------------------------- the sword's blade, painted on its own
  function blade(ctx, sw, lt) {
    const g = sw.g, e = sw.e, Lb = 47, w0 = 1.75;
    const pt = (t, s) => { const w = t < 0.8 ? w0 * (1 - 0.14 * t / 0.8) : w0 * 0.86 * (1 - (t - 0.8) / 0.2) ** 0.85; const p = add(add(sw.base, mul(g, t * Lb)), mul(e, s * w)); const q = proj(p); return [q[0], q[1]]; };
    const T = [];
    for (let k = 0; k <= 40; k++) T.push(k / 40);
    const edgeL = T.map(t => pt(t, -1)), edgeR = T.map(t => pt(t, 1)), mid = T.map(t => pt(t, 0));
    // which edge is to the left on screen, toward the light
    const flip = edgeL[5][0] > edgeR[5][0];
    const lit = flip ? edgeR : edgeL, dim = flip ? edgeL : edgeR;
    const poly = (a, b) => { ctx.beginPath(); ctx.moveTo(a[0][0], a[0][1]); for (const p of a) ctx.lineTo(p[0], p[1]); for (let k = b.length - 1; k >= 0; k--) ctx.lineTo(b[k][0], b[k][1]); ctx.closePath(); };
    const base = mid[0], tip = mid[40];
    const grad = (c0, c1, c2) => { const gr = ctx.createLinearGradient(base[0], base[1], tip[0], tip[1]); gr.addColorStop(0, c0); gr.addColorStop(0.55, c1); gr.addColorStop(1, c2); return gr; };
    ctx.save();
    // the two bevelled halves: the lit one, the shaded one; the street at the hilt, the sky toward the point
    poly(lit, mid); ctx.fillStyle = grad('rgb(150,140,128)', 'rgb(196,200,204)', 'rgb(226,236,248)'); ctx.fill();
    poly(mid, dim); ctx.fillStyle = grad('rgb(84,80,78)', 'rgb(118,128,142)', 'rgb(160,182,212)'); ctx.fill();
    // brushed steel: long streaks
    ctx.save(); poly(lit, dim); ctx.clip(); ctx.lineCap = 'round';
    for (let k = 0; k < 70; k++) {
      const s = (hash(k, 3) * 2 - 1) * 0.95, t0 = hash(k, 5) * 0.75, t1 = min(1, t0 + 0.15 + hash(k, 7) * 0.4);
      const a = pt(t0, s), b = pt(t1, s), lt2 = hash(k, 9) > 0.5;
      ctx.strokeStyle = lt2 ? `rgba(255,255,255,${0.05 + 0.08 * hash(k, 11)})` : `rgba(40,44,52,${0.05 + 0.08 * hash(k, 11)})`; ctx.lineWidth = 1 + 3 * hash(k, 13);
      ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
    }
    // the sky's reflection: a pale band down the lit bevel toward the point
    const sk = []; for (let k = 22; k <= 40; k++) sk.push(pt(k / 40, flip ? 0.55 : -0.55));
    ctx.strokeStyle = 'rgba(236,244,255,0.5)'; ctx.lineWidth = 5; ctx.beginPath(); sk.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    // the fuller: a groove down the middle, shadowed on its lit side, bright on its other
    const fu = (s) => T.filter(t => t > 0.03 && t < 0.6).map(t => pt(t, s * (1 - t * 0.3)));
    const fl = fu(-0.2), fr = fu(0.2);
    ctx.beginPath(); fl.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); for (let k = fr.length - 1; k >= 0; k--) ctx.lineTo(fr[k][0], fr[k][1]); ctx.closePath();
    ctx.fillStyle = 'rgba(70,76,88,0.55)'; ctx.fill();
    const fLit = flip ? fr : fl, fDim = flip ? fl : fr;
    ctx.strokeStyle = 'rgba(30,32,40,0.75)'; ctx.lineWidth = 2.2; ctx.beginPath(); fLit.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    ctx.strokeStyle = 'rgba(240,246,255,0.75)'; ctx.lineWidth = 1.8; ctx.beginPath(); fDim.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    // the ridge above the fuller to the point
    const rg = T.filter(t => t >= 0.6).map(t => pt(t, 0));
    ctx.strokeStyle = 'rgba(250,252,255,0.6)'; ctx.lineWidth = 1.6; ctx.beginPath(); rg.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    // the cutting bevels along each edge
    const bev = (s0, s1, col) => { const a = T.map(t => pt(t, s0)), b = T.map(t => pt(t, s1)); poly(a, b); ctx.fillStyle = col; ctx.fill(); };
    bev(flip ? 1 : -1, flip ? 0.8 : -0.8, 'rgba(255,255,250,0.32)'); bev(flip ? -1 : 1, flip ? -0.8 : 0.8, 'rgba(20,24,32,0.25)');
    ctx.restore();
    // the edges: a bright line on the lit one, a finer one on the other
    ctx.lineJoin = 'round';
    ctx.strokeStyle = 'rgba(255,255,248,0.95)'; ctx.lineWidth = 2.2; ctx.beginPath(); lit.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    ctx.strokeStyle = 'rgba(210,224,240,0.7)'; ctx.lineWidth = 1.4; ctx.beginPath(); dim.forEach((p, k) => k ? ctx.lineTo(p[0], p[1]) : ctx.moveTo(p[0], p[1])); ctx.stroke();
    // a glint
    const gp = pt(0.36, flip ? 0.85 : -0.85); const gr2 = ctx.createRadialGradient(gp[0], gp[1], 0, gp[0], gp[1], 16); gr2.addColorStop(0, 'rgba(255,255,255,0.9)'); gr2.addColorStop(1, 'rgba(255,255,255,0)');
    ctx.fillStyle = gr2; ctx.fillRect(gp[0] - 16, gp[1] - 16, 32, 32);
    ctx.restore();
  }

  // ---------------------------------------------------------------- render
  const DAY = { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null };
  let last = {}, IMG = null, prevRows = [0, BH - 1];
  function render(pose, look, light) {
    buffers();
    look = look || {}; const lt = light && light.key ? light : DAY;
    look = { hands: look.hands || 'leather', skin: look.skin || [214, 170, 136], sleeve: look.sleeve || [92, 78, 62], glassArm: !!look.glassArm, song: look.song || null };
    const t0 = performance.now();
    // only the rows the last picture used need clearing (the rest are clear already; depth is read only where a form is)
    if (prevRows[1] >= prevRows[0]) { PID.fill(0, prevRows[0] * BW, (prevRows[1] + 1) * BW); if (IMG) IMG.data.fill(0, prevRows[0] * BW * 4, (prevRows[1] + 1) * BW * 4); }
    parts = []; bx0 = BW; by0 = BH; bx1 = -1; by1 = -1;
    const handMat = look.hands === 'bare' ? M_SKIN : look.hands === 'mail' ? M_MAIL : M_LEATHER;
    const leftMat = look.glassArm ? M_GLASS : handMat;
    const infos = [];
    if (pose === 'sword') { infos.push(arm(POSE.sword, false, handMat, look, 0)); infos.push(arm(POSE.low, true, leftMat, look, 1)); }
    else if (pose === 'fist') { infos.push(arm(POSE.raised, false, handMat, look, 0)); infos.push(arm(POSE.low, true, leftMat, look, 1)); }
    else if (pose === 'glass') { infos.push(arm(Object.assign({}, POSE.raised, { C: [16.4, -2.2, -40] }), true, M_GLASS, look, 0)); infos.push(arm(POSE.low, false, handMat, look, 1)); }
    else { infos.push(arm(POSE.open, false, handMat, look, 0)); infos.push(arm(POSE.open, true, leftMat, look, 1)); }
    HK = infos.map(f => f.knuck);
    const t1 = performance.now();
    let song = null;
    if (pose === 'song' && look.song) {
      const a = infos[0].frame, b = infos[1].frame, mid = mul(add(add(a.W, mul(a.f, 5.5)), add(b.W, mul(b.f, 5.5))), 0.5);
      song = { p: add(mid, [0, 0, -2.5]), col: look.song.map(v => v / 255) };
    }
    const L = norm(lt.dir);
    occlusion(L);
    const t2 = performance.now();
    const x0 = max(0, bx0), y0 = max(0, by0), w = max(1, bx1 - x0 + 1), h = max(1, by1 - y0 + 1);
    // the underpainting, into its own layer
    handX.setTransform(1, 0, 0, 1, 0, 0); handX.globalCompositeOperation = 'source-over'; handX.globalAlpha = 1; handX.clearRect(0, 0, BW, BH);
    if (!IMG) IMG = handX.createImageData(BW, BH);
    const img = IMG; prevRows = [y0, min(BH - 1, y0 + h)];
    const tf0 = performance.now(); cGk = -1; tId = 0; GRID.clear(); qGk = -1; const tf1 = performance.now();
    shade(img, look, lt, song); const tf2 = performance.now();
    handX.putImageData(img, 0, 0, x0, y0, w, h);
    const t3 = performance.now();
    const strokes = brushwork(handX, img);
    creases(handX, infos);
    const t4 = performance.now();
    // the picture at twice the size: the blade and the Song behind, the hands, the Song's light in front
    const c = document.createElement('canvas'); c.width = W; c.height = H; const cx = c.getContext('2d');
    cx.setTransform(1 / S, 0, 0, 1 / S, 0, 0);
    const sw = infos.find(f => f.sword);
    if (sw) blade(cx, sw.sword, lt);
    if (song) glow(cx, song, 0);
    cx.setTransform(1, 0, 0, 1, 0, 0); cx.imageSmoothingEnabled = true; cx.imageSmoothingQuality = 'low';
    const ex = x0 & ~1, ey = y0 & ~1, ew = (w + 2) & ~1, eh = (h + 2) & ~1;
    cx.drawImage(hand, ex, ey, ew, eh, ex / S, ey / S, ew / S, eh / S);
    cx.setTransform(1 / S, 0, 0, 1 / S, 0, 0);
    if (song) glow(cx, song, 1);
    const t5 = performance.now();
    last = { forms: +(t1 - t0).toFixed(1), shadows: +(t2 - t1).toFixed(1), under: +(t3 - t2).toFixed(1), brush: +(t4 - t3).toFixed(1), out: +(t5 - t4).toFixed(1), strokes, parts: parts.length, facets: +(tf1 - tf0).toFixed(1), shade: +(tf2 - tf1).toFixed(1), bbox: [bx0, by0, bx1, by1] };
    return c;
  }
  // the Song's light between the palms
  function glow(ctx, song, front) {
    const P = proj(song.p), c = song.col.map(v => (v * 255) | 0), R = song.p ? 12 * P[2] : 200;
    ctx.save();
    if (!front) {
      const g = ctx.createRadialGradient(P[0], P[1], 0, P[0], P[1], R);
      g.addColorStop(0, `rgba(255,248,220,0.85)`); g.addColorStop(0.12, `rgba(${c[0]},${c[1]},${c[2]},0.62)`); g.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},0.2)`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g; ctx.fillRect(P[0] - R, P[1] - R, 2 * R, 2 * R);
      // motes of the Song drifting in the light
      for (let k = 0; k < 26; k++) {
        const a = hash(k, 41) * PI * 2, d = pow(hash(k, 43), 0.7) * R * 0.75, x = P[0] + cos(a) * d * 0.8, y = P[1] + sin(a) * d * 1.1, s = 2 + 5 * hash(k, 47);
        const g2 = ctx.createRadialGradient(x, y, 0, x, y, s); g2.addColorStop(0, 'rgba(255,250,225,0.9)'); g2.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
        ctx.fillStyle = g2; ctx.fillRect(x - s, y - s, 2 * s, 2 * s);
      }
    } else {
      ctx.globalCompositeOperation = 'lighter';
      const g = ctx.createRadialGradient(P[0], P[1], 0, P[0], P[1], R * 0.6);
      g.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.35)`); g.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      ctx.fillStyle = g; ctx.fillRect(P[0] - R, P[1] - R, 2 * R, 2 * R);
    }
    ctx.restore();
  }
  return { render, _stats: () => last };
})();
if (typeof window !== 'undefined') window.HANDS109P = HANDS109P;   // the review harness looks for it on the window
if (typeof module !== 'undefined') module.exports = HANDS109P;
