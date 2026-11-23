// ============================================================
//  sculpted112 — Phase 112: the sculpted hands, lit by the world.
//
//  The owner, 21 Nov 2026, on Phase 109's three options: "lets use the pixel art in the game for now but I do want to
//  eventually use the sculpted lit by the world". This is option S (tools/hands109/hands109s.js, which stays where it is,
//  untouched): its jointed hand, its materials and its small WebGL renderer, made a game module. It is an Options choice
//  ("Sculpted hands"), off in every preset until the owner says: the pixel hands stay the default.
//
//  How it sits in the game:
//    * js/body21.js still asks FP87 for each first-person picture and still poses it (the swing, the lowering, the sway,
//      the weapon's weight, the glass arm's mirror). With this on, in the 3D view, it does not draw the picture: it hands
//      this module the picture's place on the screen (place), and at the end of the frame draws this module's canvas once.
//    * each hand is posed where the pixel hand is (PIXELHANDS110.poses: one source for both), built once per pose and
//      look, and placed each frame by a matrix made from the picture's place, so it moves exactly as the picture would;
//    * a weapon is FP87's own painted picture (no hands), on a flat card through the grip: the fingers nearer the eye
//      close over it, the rest of the hand is behind it;
//    * the light is the game's, each frame (js/light21.js: the sun or moon's colour and direction, the sky's and the
//      ground's light; lamps near you as a torch; a Song's colour between the open hands).
//  Pure: no Math.random; the same state gives the same pixels.
// ============================================================
'use strict';
const SCULPTED112 = (() => {
  const W = 1152, H = 540, SS = 1, FOVY = 40 * Math.PI / 180, NEAR = 4, FAR = 400;
  const ASPECT = W / H, TF = Math.tan(FOVY / 2);

  // ---------------------------------------------------------------- hash and noise (no Math.random anywhere)
  const hash = (a, b) => { let n = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const hash3 = (a, b, c) => hash(a ^ Math.imul(c | 0, 1103515245), b + Math.imul(c | 0, 7919));
  const sm = (t) => t * t * (3 - 2 * t);
  function vn3(x, y, z) {
    const xi = Math.floor(x), yi = Math.floor(y), zi = Math.floor(z), fx = sm(x - xi), fy = sm(y - yi), fz = sm(z - zi);
    const L = (a, b, t) => a + (b - a) * t, g = (i, j, k) => hash3(xi + i, yi + j, zi + k);
    return L(L(L(g(0, 0, 0), g(1, 0, 0), fx), L(g(0, 1, 0), g(1, 1, 0), fx), fy), L(L(g(0, 0, 1), g(1, 0, 1), fx), L(g(0, 1, 1), g(1, 1, 1), fx), fy), fz);
  }
  const fbm = (x, y, z) => vn3(x, y, z) * 0.6 + vn3(x * 2.1 + 5.3, y * 2.1 + 1.7, z * 2.1 + 9.1) * 0.3 + vn3(x * 4.3 + 2.2, y * 4.3 + 7.4, z * 4.3 + 3.9) * 0.1;

  // ---------------------------------------------------------------- vectors and frames
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]], sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s], dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const len = (a) => Math.hypot(a[0], a[1], a[2]), norm = (a) => { const l = len(a) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp = (a, b, t) => a + (b - a) * t, clamp = (x, a, b) => Math.max(a, Math.min(b, x));
  const D2R = Math.PI / 180;
  // a frame: origin o and the columns X, Y, Z (local axes in the parent); det -1 for a mirrored (left) hand
  const F = (o, X, Y, Z) => ({ o, X, Y, Z });
  const ID = () => F([0, 0, 0], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const rotv = (f, v) => [f.X[0] * v[0] + f.Y[0] * v[1] + f.Z[0] * v[2], f.X[1] * v[0] + f.Y[1] * v[1] + f.Z[1] * v[2], f.X[2] * v[0] + f.Y[2] * v[1] + f.Z[2] * v[2]];
  const app = (f, v) => add(f.o, rotv(f, v));
  const comp = (a, b) => F(app(a, b.o), rotv(a, b.X), rotv(a, b.Y), rotv(a, b.Z));
  const T = (x, y, z) => F([x, y, z], [1, 0, 0], [0, 1, 0], [0, 0, 1]);
  const RX = (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return F([0, 0, 0], [1, 0, 0], [0, c, s], [0, -s, c]); };
  const RY = (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return F([0, 0, 0], [c, 0, -s], [0, 1, 0], [s, 0, c]); };
  const RZ = (d) => { const c = Math.cos(d * D2R), s = Math.sin(d * D2R); return F([0, 0, 0], [c, s, 0], [-s, c, 0], [0, 0, 1]); };
  const chain = (...fs) => fs.reduce((a, b) => comp(a, b));
  // a hand's frame in the world from where its fingers point (Y) and where its back faces (Z); a left hand is mirrored
  function handFrame(o, yDir, zGuess, left) {
    const Y = norm(yDir), Z = norm(sub(zGuess, mul(Y, dot(Y, zGuess)))), X = cross(Y, Z);
    return F(o, left ? mul(X, -1) : X, Y, Z);
  }
  function handFrameXZ(o, xDir, zGuess) {
    const X = norm(xDir), Z = norm(sub(zGuess, mul(X, dot(X, zGuess)))), Y = cross(Z, X);
    return F(o, X, Y, Z);
  }
  // put a hand so that its local point lp falls on the canvas pixel (cx, cy) at depth D (cm ahead of the eye)
  function placeAt(f, lp, cx, cy, D) {
    const target = [(cx / (W / 2) - 1) * D * TF * ASPECT, (1 - cy / (H / 2)) * D * TF, -D];
    return F(sub(target, rotv(f, lp)), f.X, f.Y, f.Z);
  }
  const det = (f) => dot(f.X, cross(f.Y, f.Z));

  // ---------------------------------------------------------------- mesh building
  // vertex: pos3 nrm3 loc3 uv2 occ3 ex4 = 18 floats. occ: [ambient occlusion, soft shadow, how far the vertex goes with the
  // forearm when the wrist turns (0 the hand, 1 the arm)]; ex: [wear/redness, seam distance (cm), along seam (cm), crease]
  const STRIDE = 18;
  function newScene() { return { groups: {}, spheres: [], part: 0, verts: [] }; }
  function group(sc, mat) { return sc.groups[mat] || (sc.groups[mat] = { mat, v: [], i: [], n: 0, parts: [] }); }
  // a parametric grid: f(u, v) -> { p:[x,y,z] local, uv:[a,b], ex:[4] }; u wraps (around), v runs 0..1 (along)
  function grid(sc, mat, part, wf, lf, nu, nv, f, opt) {
    opt = opt || {};
    const g = group(sc, mat), P = [], UV = [], EX = [];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      const r = f(i / nu, j / nv, i, j); P.push(r.p); UV.push(r.uv || [0, 0]); EX.push(r.ex || [0, 99, 0, 0]);
    }
    const at = (i, j) => P[j * (nu + 1) + i];
    const wrap = opt.open ? false : true;
    const N = [];
    for (let j = 0; j <= nv; j++) for (let i = 0; i <= nu; i++) {
      let du;
      if (wrap) { const ip = (i + 1) % nu, im = (i - 1 + nu) % nu; du = sub(at(ip === 0 ? nu : ip, j), at(im, j)); if (i === 0 || i === nu) du = sub(at(1, j), at(nu - 1, j)); }
      else du = sub(at(Math.min(nu, i + 1), j), at(Math.max(0, i - 1), j));
      const dv = sub(at(i, Math.min(nv, j + 1)), at(i, Math.max(0, j - 1)));
      const c = cross(dv, du); N.push(len(c) < 1e-9 ? null : norm(c));
    }
    // poles: the average of the next ring in
    for (let j = 0; j <= nv; j++) {
      if (N[j * (nu + 1)] !== null) continue;
      const jj = j < nv / 2 ? j + 1 : j - 1; let s = [0, 0, 0];
      for (let i = 0; i < nu; i++) { const q = N[jj * (nu + 1) + i]; if (q) s = add(s, q); }
      s = norm(s); for (let i = 0; i <= nu; i++) if (!N[j * (nu + 1) + i]) N[j * (nu + 1) + i] = s;
    }
    if (opt.flip) for (let k = 0; k < N.length; k++) N[k] = mul(N[k], -1);
    const mir = det(wf) < 0;
    const WP = P.map((p) => app(wf, p)), WN = N.map((n) => norm(rotv(wf, n))), LP = P.map((p) => app(lf, p));
    const swap = mir !== !!opt.flip;
    const base = g.n;
    for (let k = 0; k < WP.length; k++) {
      // (an arm's part: its first centimetres past the wrist go part of the way with it, so the joint bends and does not break)
      g.v.push(...WP[k], ...WN[k], ...LP[k], ...UV[k], 1, 1, opt.arm ? sm(clamp((P[k][1] + 1.0) / 3.5, 0, 1)) : 0, ...EX[k]); g.parts.push(part); g.n++;
    }
    for (let j = 0; j < nv; j++) for (let i = 0; i < nu; i++) {
      const a = base + j * (nu + 1) + i, b = a + (nu + 1), c = a + 1, d = b + 1;
      if (swap) g.i.push(a, c, b, c, d, b); else g.i.push(a, b, c, c, b, d);
    }
  }
  const sphere = (sc, c, r, part) => sc.spheres.push({ c, r, part });

  // a tapered capsule along local +y from 0 to L, radii r0 -> r1, cross-section scaled (sx, sz); mod(y, phi, rho) -> radius
  // multiplier; ex(y, phi, rho) -> the extra attributes
  function capsule(sc, mat, wf, lf, L, r0, r1, o) {
    o = o || {};
    const part = sc.part++, sx = o.sx || 1, sz = o.sz || 1, nu = o.nu || 18, nv = o.nv || 16;
    const a0 = Math.PI / 2 * r0, a2 = Math.PI / 2 * r1, tot = a0 + L + a2;
    grid(sc, mat, part, wf, lf, nu, nv, (u, v) => {
      const s = v * tot; let y, rho;
      if (s < a0) { const a = -Math.PI / 2 + s / r0; y = r0 * Math.sin(a); rho = r0 * Math.cos(a); }
      else if (s < a0 + L) { const t = (s - a0) / L; y = t * L; rho = lerp(r0, r1, t); }
      else { const a = (s - a0 - L) / r1; y = L + r1 * Math.sin(a); rho = r1 * Math.cos(a); }
      if (v === 0) { y = -r0; rho = 0; } if (v === 1) { y = L + r1; rho = 0; }
      const phi = u * Math.PI * 2;
      const m = o.mod ? o.mod(y, phi, rho) : 1;
      let x = rho * sx * Math.cos(phi) * m, z = rho * sz * Math.sin(phi) * m;
      if (o.pad && z < 0) z *= 1 + o.pad(y);
      return { p: [x, y, z], uv: [phi * (r0 + r1) / 2, y], ex: o.ex ? o.ex(y, phi, rho) : [0, 99, 0, 0] };
    });
    const step = Math.max(0.5, Math.min(r0, r1) * 0.8);
    for (let y = 0; y <= L + 1e-6; y += step) sphere(sc, app(wf, [0, y, 0]), lerp(r0, r1, y / Math.max(L, 1e-6)) * Math.min(sx, sz) * 1.0, part);
    if (L < step) sphere(sc, app(wf, [0, L, 0]), r1 * Math.min(sx, sz), part);
    return part;
  }

  // ---------------------------------------------------------------- the hand (a right hand in its own frame: wrist at the
  // origin, +y towards the fingers, +z the back of the hand, +x the little finger's side; a left hand is its mirror)
  const FING = [ // MCP position, segment lengths, radii (proximal..tip), width/depth
    { at: [-2.75, 8.7, -0.1], L: [4.1, 2.6, 2.05], r: [0.94, 0.86, 0.78, 0.69] },
    { at: [-0.9, 9.1, 0.0], L: [4.5, 2.95, 2.15], r: [0.97, 0.89, 0.8, 0.71] },
    { at: [0.95, 8.75, -0.05], L: [4.2, 2.75, 2.05], r: [0.92, 0.84, 0.76, 0.67] },
    { at: [2.7, 7.95, -0.2], L: [3.4, 2.05, 1.85], r: [0.81, 0.74, 0.67, 0.6] },
  ];
  // a pose: per finger [MCP, PIP, DIP flexion, splay] in degrees; the thumb: its metacarpal's direction and its nail's
  // facing (hand-local), then its MCP and IP flexion
  // a pose's thumb may give the facing of each segment (zs): the thumb turns along its length, so that in a fist its nail
  // faces out of the fist's front while its metacarpal's mound stays on the palm's side
  const POSE = {
    fist: { f: [[90, 117, 72, 2, -7], [92, 118, 72, 0.5, -2.5], [94, 118, 70, -2, 3], [96, 116, 68, -4, 8]], t: { z: [-0.83, -0.05, 0.55], zs: [[-0.83, -0.05, 0.55], [-0.6, -0.15, -0.78], [-0.12, 0.3, -0.95]], pts: [[-3.75, 4.7, -2.7], [-3.0, 6.9, -5.0], [-0.35, 7.5, -5.25]] } },
    grip: { f: [[80, 100, 60, -4], [82, 102, 60, -1], [84, 102, 60, 3], [86, 100, 58, 6]], t: { z: [-0.89, -0.27, 0.36], zs: [[-0.89, -0.27, 0.36], [-0.6, -0.2, -0.77], [-0.2, 0.25, -0.95]], pts: [[-3.75, 4.9, -2.5], [-3.2, 7.3, -4.7], [-0.9, 8.3, -5.4]] } },
    open: { f: [[6, 8, 5, -9], [4, 6, 4, -2], [6, 8, 5, 5], [9, 10, 6, 12]], t: { d: [-0.72, 0.64, -0.26], z: [-0.55, -0.15, 0.82], f: [10, 12] } },
  };
  // the sword's grip in the right hand's frame: its middle, and its turn about the hand's z so that it lies along the
  // knuckles' line (the index's knuckle higher than the little finger's)
  const GRIP_G = [0.3, 8.0, -2.55], GRIP_ROT = -7.8, GRIP_R = 1.37;
  // a finger's joint frames (the base of each segment, then the tip) for [MCP, PIP, DIP, splay]
  function fingerChain(fd, ang) {
    const [mcp, pip, dip, spl] = ang, fl = [mcp, pip, dip];
    let lf = chain(T(...fd.at), RZ(-spl), RY(ang[4] || 0), RX(-mcp)); const fr = [lf];
    for (let s = 0; s < 3; s++) { lf = chain(lf, T(0, fd.L[s], 0), RX(-(s < 2 ? fl[s + 1] : 0))); fr.push(lf); }
    return fr;
  }
  // wrap a finger round the grip: the flexions that lay its segments on the grip's surface, with its middle knuckle at
  // the same turn round the grip as the others' (so the knuckles run in a line along it)
  // (the search is the costly part of building a gripping hand, and its answer depends only on the finger and its
  // thickness: it is made once and kept)
  const FIT = new Map();
  function fitGrip(fd, spl, rf) {
    const fk = fd.at.join(',') + '|' + spl + '|' + rf.toFixed(3), kept = FIT.get(fk); if (kept) return kept;
    const ga = GRIP_ROT * D2R, a = [Math.cos(ga), Math.sin(ga), 0], e1 = [0, 0, 1], e2 = cross(a, e1), Rc = GRIP_R + rf * 0.92;
    const rel = (p) => { const d = sub(p, GRIP_G); return sub(d, mul(a, dot(d, a))); };
    const thStar = -2.45;
    let best = null;
    for (let mcp = 30; mcp <= 100; mcp += 2.5) for (let pip = 40; pip <= 118; pip += 3) for (let dip = 15; dip <= 85; dip += 5) {
      const fr = fingerChain(fd, [mcp, pip, dip, spl]); let err = 0;
      for (let s = 0; s < 3; s++) for (const t of (s === 0 ? [0.6, 0.8, 1.0] : [0.35, 0.7, 1.0])) {
        const e = len(rel(app(fr[s], [0, fd.L[s] * t, 0]))) - Rc * (s === 2 && t === 1 ? 0.9 : 1);
        err += e < 0 ? 8 * e * e : e * e;
      }
      const q = rel(fr[1].o); let dth = Math.atan2(dot(q, e2), dot(q, e1)) - thStar;
      dth = Math.atan2(Math.sin(dth), Math.cos(dth)); err += 1.5 * dth * dth;
      if (!best || err < best.err) best = { err, f: [mcp, pip, dip, spl] };
    }
    FIT.set(fk, best.f);
    return best.f;
  }
  function buildHand(sc, h) {
    const hf = h.frame, mat = h.mat, skinny = mat === 'bare', glass = mat === 'glass';
    const res = { nu: 18, nv: 16 };
    const handMat = glass ? 'glass' : mat === 'bare' ? 'skin' : mat;
    const pose = POSE[h.pose];
    const W2 = (lf) => comp(hf, lf);
    // ---- the palm: a cupped superellipsoid, a slanted knuckle line, an arched back, a hollow, tendons on a bare back
    const ppart = sc.part++;
    const A = 4.15, B = 4.75, C = 1.5, CY = 4.55, e1 = 0.62, e2 = 0.8;
    const spow = (x, e) => Math.sign(x) * Math.pow(Math.abs(x), e);
    const palmFn = (u, v) => {
      const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2;
      const ct = Math.cos(th), st = Math.sin(th);
      let x = A * spow(ct, e1) * spow(Math.cos(ph), e2), y = B * spow(st, e1), z = C * spow(ct, e1) * spow(Math.sin(ph), e2);
      if (v === 0) { x = 0; z = 0; y = -B; } if (v === 1) { x = 0; z = 0; y = B; }
      y += CY;
      // knuckle line slants (index longer), the wrist end narrows
      if (y > CY) y += (-x * 0.16) * ((y - CY) / B);
      if (y < CY) { const k = 1 - 0.3 * Math.pow((CY - y) / B, 2); x *= k; z *= 1 - 0.1 * Math.pow((CY - y) / B, 2); }
      // the back arches; the palm cups
      z -= 0.05 * x * x;
      const cx = clamp(1 - Math.pow(x / A, 2), 0, 1), cy = clamp(1 - Math.pow((y - CY) / B, 2), 0, 1);
      if (z < 0) {
        z += 0.75 * cx * cy; z -= 0.35 * Math.exp(-Math.pow((x - 2.6) / 1.2, 2)) * Math.exp(-Math.pow((y - 3.6) / 2.2, 2));
        z -= (h.pose === 'open' ? 0.25 : 0.6) * Math.exp(-Math.pow((y - 7.9) / 1.2, 2)) * clamp(1 - Math.pow(x / A, 4), 0, 1);
      }
      // tendons and the knuckles' heads on the back
      if (z > 0) {
        const dorsal = clamp(z / C, 0, 1);
        let td = 0;
        for (let k = 0; k < 4; k++) {
          const fx = FING[k].at[0], xt = lerp(fx * 0.25, fx, clamp((y - 1.2) / 7.4, 0, 1));
          const fade = clamp((y - 1.6) / 2.0, 0, 1) * clamp((FING[k].at[1] - 0.3 - y) / 1.8, 0, 1) * (k === 3 ? 0.7 : 1);
          td += Math.exp(-Math.pow((x - xt) / (skinny ? (h.pose === 'fist' ? 0.21 : 0.24) : 0.27), 2)) * fade;
        }
        z += (skinny ? (h.pose === 'fist' ? 0.44 : 0.27) : 0.05) * td * dorsal;
        // the flat plane of the back between the knuckles and the wrist
        if (skinny) z -= 0.12 * dorsal * Math.exp(-Math.pow((y - 5.2) / 2.2, 2)) * clamp(1 - Math.pow(x / A, 2), 0, 1);
      }
      // leather: three stitched lines on the back
      let seam = 99, along = y, wear = 0;
      if (mat === 'leather' && z > 0.3 && y > 1.6 && y < 6.6) for (const xl of [-1.8, 0.0, 1.8]) seam = Math.min(seam, Math.abs(x - xl));
      if (y > CY + 2.5 && z > 0) wear = clamp((y - CY - 2.5) / 2.0, 0, 1) * clamp(z / C, 0, 1);
      // (Phase 122) bare skin: the heel of the hand paler (a negative redness), the back's knuckle line redder
      if (skinny && z < 0.2) wear -= 0.75 * clamp((4.2 - y) / 3.2, 0, 1);
      // (Phase 122) bare skin: the palm's own lines (the two across it and the one round the thumb's mound), each a
      // crease line (seam) and a weight (crease); the back of the hand carries the skin's fine lines only
      let crease = 0;
      if (skinny) {
        seam = y + 0.01;
        if (z < 0) {
          const pv = clamp(-z / C, 0, 1);
          const L1 = y - (7.25 + 0.22 * x), w1 = Math.exp(-Math.pow(L1 / 0.45, 2)) * clamp((x + 1.6) / 2.2, 0, 1);
          const L2 = y - (6.35 - 0.18 * x), w2 = Math.exp(-Math.pow(L2 / 0.45, 2)) * clamp((1.8 - x) / 2.4, 0, 1);
          const L3 = Math.hypot(x + 2.9, (y - 2.0) * 0.8) - 2.7, w3 = Math.exp(-Math.pow(L3 / 0.45, 2)) * clamp((7.0 - y) / 2, 0, 1) * clamp((0.8 - x) / 1.5, 0, 1);
          // (and where the hand is closed the palm folds: its lines deepen)
          const best = w1 >= w2 && w1 >= w3 ? [w1, L1] : w2 >= w3 ? [w2, L2] : [w3, L3];
          crease = best[0] * pv; seam = best[1] + 0.07;
        }
      }
      return { p: [x, y, z], uv: [x, y], ex: [skinny ? wear * (wear > 0 ? 0.8 : 1) : wear * 0.8, seam, along, crease] };
    };
    grid(sc, handMat, ppart, hf, ID(), skinny ? 96 : 68, skinny ? 58 : 44, palmFn);
    for (let gy = 1.2; gy <= 8.4; gy += 1.8) for (let gx = -3.0; gx <= 3.01; gx += 2.0) sphere(sc, app(hf, [gx, gy, -0.1]), 1.45, ppart);
    // ---- fingers
    const tips = [];
    // an adult's fingers: slimmer than the first sculpt (the proximal segment 0.85 of it), tapering more to the tip; a
    // glove's leather adds a little back
    const RS = [0.85, 0.81, 0.76, 0.72], thick = skinny || glass ? 1 : 1.1;
    FING.forEach((fd, k) => {
      const fr = fd.r.map((r, i) => r * RS[i] * thick);
      const ang = h.pose === 'grip' && h.wrap ? fitGrip(fd, pose.f[k][3], fr[1]) : (h.f || pose.f)[k];
      // splay turns an open finger aside; tilt (the fifth value) leans a curled finger's plane so that, in a fist, the
      // folded fingers press together
      const [mcp, pip, dip, spl] = ang;
      let lf = chain(T(...fd.at), RZ(-spl), RY(ang[4] || 0), RX(-mcp));
      const flex = [mcp, pip, dip];
      // the knuckle's head: the metacarpal's end, a hard rounded ridge on the back of the hand (the middle one highest)
      if (h.pose !== 'open' || skinny) {
        const op = h.pose === 'open', hi = [0.1, 0.24, 0.12, 0.0][k] * (op ? 0.4 : 1);
        const kf = chain(T(fd.at[0], fd.at[1] + (op ? -0.2 : 0.05), (op ? 0.3 : 0.28) + hi), RZ(-spl * 0.5), RX(op ? 0 : -42));
        const kp = sc.part++, kx = fr[0] * 1.3, ky = op ? 0.78 : 1.0, kz = op ? 0.58 : 0.78;
        grid(sc, handMat, kp, W2(kf), kf, 18, 12, (u, v) => {
          const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2, ct = Math.cos(th);
          let x = kx * spow(ct, 0.8) * spow(Math.cos(ph), 0.85), y = ky * spow(Math.sin(th), 0.8), z = kz * spow(ct, 0.8) * spow(Math.sin(ph), 0.85);
          if (z > 0) z *= 1 + 0.18 * Math.exp(-x * x / (kx * kx * 0.12)); // a ridge along the bone, not a dome
          if (v === 0 || v === 1) x = z = 0;
          // (Phase 122) bare: redder, and creased across, as the skin over a knuckle is
          return { p: [x, y, z], uv: [x * 3, y * 3], ex: skinny ? [(op ? 0.55 : 0.8) * clamp(z / kz, 0, 1), y - 0.25 * x * x, y, clamp(z / kz, 0, 1) * (op ? 0.2 : 0.75)] : [clamp(z / kz, 0, 1), 99, y, 0] };
        });
      }
      for (let s = 0; s < 3; s++) {
        const L = fd.L[s], r0 = fr[s], r1 = fr[s + 1], bendIn = flex[s], bendOut = s < 2 ? flex[s + 1] : 0;
        const ex = (y, phi, rho) => {
          const dors = Math.max(0, Math.sin(phi));
          const nb = Math.exp(-Math.pow(y / 1.0, 2)), nt = Math.exp(-Math.pow((y - L) / 0.9, 2));
          const knk = (nb * clamp(bendIn / 90, 0, 1) * (s === 0 ? 1.2 : 0.8) + nt * clamp(bendOut / 90, 0, 1) * 0.8) * dors;
          let seam = 99, along = y + s * 5;
          if (mat === 'leather') { const a = Math.min(Math.abs(phi), Math.abs(phi - Math.PI), Math.abs(phi - 2 * Math.PI)); seam = a * rho; }
          const cb = Math.exp(-Math.pow(y / 0.55, 2)), ct = Math.exp(-Math.pow((y - L) / 0.5, 2));
          let crease = (cb * (s === 1 ? 1 : s === 2 ? 0.5 : 0) + ct * (s === 0 ? 1 : s === 1 ? 0.5 : 0)) * (0.45 + 0.55 * dors);
          const tipR = s === 2 ? 0.35 * clamp((y - L * 0.4) / (L * 0.6), 0, 1) : 0;
          // (Phase 122) bare skin: the creases at each joint run across the finger (bowed toward the joint at its sides), a
          // band of them wider and stronger over the back of the bent middle joint; a few at the knuckle's foot
          if (skinny) {
            const cb2 = Math.exp(-Math.pow(y / 0.65, 2)), ct2 = Math.exp(-Math.pow((y - L) / 0.65, 2)), bowed = 0.22 * Math.cos(phi) * Math.cos(phi) * rho;
            crease = (cb2 * (s === 1 ? 1 : s === 2 ? 0.75 : 0.45 * dors) + ct2 * (s === 0 ? 1 : s === 1 ? 0.75 : 0)) * (0.6 + 0.4 * dors);
            seam = (y < L / 2 ? y + bowed : y - L - bowed) + 0.01;
          }
          return [clamp(knk + tipR, 0, 1), seam, along, crease];
        };
        // flat planes between the joints (a squarish section, the shaft a little waisted), and a hard corner on the
        // back of each bent joint where the bone's end shows
        const sqn = skinny || glass ? 2.8 : 2.4;
        const mod = (y, phi) => {
          const c = Math.abs(Math.cos(phi)), sn = Math.sin(phi), dors = Math.max(0, sn);
          const tipFade = s === 2 ? clamp((L * 0.85 - y) / (L * 0.5), 0, 1) : 1;
          const sq = 1 + (Math.pow(Math.pow(c, sqn) + Math.pow(Math.abs(sn), sqn), -1 / sqn) - 1) * tipFade * (sn > 0 ? 1 : 0.5);
          const waist = 1 - 0.05 * Math.sin(Math.PI * clamp(y / L, 0, 1));
          const jIn = Math.exp(-Math.pow(y / 0.42, 2)) * (s > 0 ? 0.07 : 0.03);
          const jOut = Math.exp(-Math.pow((y - L) / 0.42, 2)) * (s < 2 ? 0.05 : 0);
          const corner = (Math.exp(-Math.pow((y - L) / 0.36, 2)) * clamp(bendOut / 90, 0, 1.2) * 0.16 + Math.exp(-Math.pow(y / 0.36, 2)) * clamp(bendIn / 90, 0, 1.2) * (s > 0 ? 0.1 : 0)) * dors * dors;
          return 0.97 * sq * waist + jIn + jOut + corner;
        };
        const segPart = capsule(sc, handMat, W2(lf), lf, L, r0, r1, { sx: s === 0 ? 1.1 : 1.1, sz: 0.92, nu: 22, nv: 26, mod, ex, pad: s === 2 ? (y) => 0.2 * Math.exp(-Math.pow((y - L * 0.55) / (L * 0.45), 2)) : (y) => (skinny ? 0.4 : 0.14) * Math.sin(Math.PI * clamp(y / L, 0, 1)) });
        if (s === 2 && skinny) {
          // the nail: a thin plate on the back of the last segment, seated on its surface (Phase 122: it had sunk into the
          // finger), its sides tucked into the folds; ex: how far from the cuticle to the free edge, and across it
          const rm = lerp(r0, r1, 0.58) * 0.92 * 0.97;
          const nf = chain(lf, T(0, L * 0.6, rm * 1.04 - 0.08), RX(-8));
          // (its shade is its finger's: the nail is counted as a part of the segment it lies on)
          const np = segPart, na = rm * 0.74, nb2 = L * 0.4;
          grid(sc, 'nail', np, W2(nf), nf, 18, 12, (u, v) => {
            const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2, ct = Math.cos(th);
            let x = na * spow(ct, 0.5) * spow(Math.cos(ph), 0.6), y = nb2 * spow(Math.sin(th), 0.5), z = 0.11 * spow(ct, 0.5) * spow(Math.sin(ph), 0.6);
            z -= 0.22 * (x / na) * (x / na); // curved across the finger
            if (v === 0 || v === 1) x = z = 0;
            return { p: [x, y, z], uv: [x, y], ex: [clamp((y / nb2 + 1) / 2, 0, 1), x / na, 0, 0] };
          });
        }
        lf = chain(lf, T(0, L, 0), RX(-(s < 2 ? flex[s + 1] : 0)));
      }
      tips.push(app(hf, lf.o));
    });
    let thumbMcp = null;
    // ---- the thumb: from the wrist, its metacarpal in the fleshy mound, then two segments and the pad
    {
      const CMC = [-1.75, 1.7, -0.75];
      // the thumb is posed by its metacarpal's direction and two flexions, or by where its joints are (pts); either
      // way each segment's frame follows the one before it
      let pts;
      if (pose.t.pts) pts = [CMC, ...pose.t.pts];
      else {
        const ty = norm(pose.t.d), tz = norm(sub(pose.t.z, mul(ty, dot(ty, pose.t.z)))), [mf, ipf] = pose.t.f;
        let lf0 = F(CMC, cross(ty, tz), ty, tz); pts = [CMC];
        [4.6, 3.2, 2.7].forEach((L, k) => { lf0 = chain(lf0, T(0, L, 0), RX(-[mf, ipf, 0][k])); pts.push(lf0.o); });
      }
      let Zp = pose.t.z; const fl = [0, 0, 0], Ls = [], frames = [];
      for (let k = 0; k < 3; k++) {
        if (pose.t.zs) Zp = pose.t.zs[k];
        const Y = norm(sub(pts[k + 1], pts[k])), Z = norm(sub(Zp, mul(Y, dot(Y, Zp))));
        frames.push(F(pts[k], cross(Y, Z), Y, Z)); Ls.push(len(sub(pts[k + 1], pts[k]))); Zp = Z;
        if (k > 0) fl[k - 1] = Math.acos(clamp(dot(Y, frames[k - 1].Y), -1, 1)) / D2R;
      }
      const tk = skinny || glass ? 1 : 1.08;
      const rs = [[skinny ? 1.25 : 1.6, skinny ? 1.0 : 1.2], [0.93 * tk, 0.86 * tk], [0.86 * tk, 0.68 * tk]];
      for (let s = 0; s < 3; s++) {
        const L = Ls[s], lf = frames[s];
        const ex = (y, phi, rho) => {
          const dors = Math.max(0, Math.sin(phi)), nt = Math.exp(-Math.pow((y - L) / 0.9, 2)), nb = Math.exp(-Math.pow(y / 0.9, 2));
          let seam = 99; if (mat === 'leather' && s > 0) { const a = Math.min(Math.abs(phi), Math.abs(phi - Math.PI), Math.abs(phi - 2 * Math.PI)); seam = a * rho; }
          let crease = (s > 0 ? nb : 0) * dors;
          // (Phase 122) bare skin: the thumb's joints creased across, as the fingers' are
          if (skinny) {
            const nb2 = Math.exp(-Math.pow(y / 0.7, 2)), nt2 = Math.exp(-Math.pow((y - L) / 0.7, 2)), bowed = 0.2 * Math.cos(phi) * Math.cos(phi) * rho;
            crease = (s > 0 ? nb2 : 0) * (0.35 + 0.65 * dors) + (s < 2 ? nt2 * 0.8 : 0) * (0.35 + 0.65 * dors);
            seam = (y < L / 2 ? y + bowed : y - L - bowed) + 0.01;
          }
          return [clamp((nt * fl[s] / 60 + (s > 0 ? nb * fl[s - 1] / 60 : 0)) * dors, 0, 1) * (skinny ? 0.9 : 0.7), seam, y + s * 5, crease];
        };
        const pad = s === 2 ? (y) => (skinny ? 0.2 : 0.12) * Math.exp(-Math.pow((y - L * 0.5) / (L * 0.5), 2)) : s === 0 ? (y) => (skinny ? 0.15 : 0.35) * Math.exp(-Math.pow((y - L * 0.4) / (L * 0.6), 2)) : null;
        const tmod = (y, phi) => {
          const sn = Math.sin(phi), c = Math.abs(Math.cos(phi)), dors = Math.max(0, sn);
          const sq = s === 0 ? 1 : 1 + (Math.pow(Math.pow(c, 2.6) + Math.pow(Math.abs(sn), 2.6), -1 / 2.6) - 1) * (sn > 0 ? 1 : 0.4) * (s === 2 ? clamp((L * 0.8 - y) / (L * 0.5), 0, 1) : 1);
          return 0.97 * sq + 0.05 * Math.exp(-Math.pow((y - L) / 0.45, 2)) * (s < 2 ? 1 : 0) + 0.12 * Math.exp(-Math.pow((y - L) / 0.36, 2)) * dors * dors * (s === 1 ? clamp(fl[1] / 60, 0, 1) : 0);
        };
        const segPart = capsule(sc, handMat, W2(lf), lf, L, rs[s][0], rs[s][1], { sx: s === 0 ? 1.2 : 1.04, sz: s === 0 ? 0.95 : 0.88, nu: 22, nv: 22, ex, pad, mod: tmod });
        if (s === 2 && skinny) {
          // (Phase 122) the thumb's nail seated on its surface, wider and squarer than a finger's
          const rm = lerp(rs[2][0], rs[2][1], 0.6) * 0.88 * 0.97;
          const nf = chain(lf, T(0, L * 0.5, rm * 1.04 - 0.05), RX(2));
          const np = segPart, na = rm * 0.86, nb2 = L * 0.3;
          grid(sc, 'nail', np, W2(nf), nf, 18, 12, (u, v) => {
            const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2, ct = Math.cos(th);
            let x = na * spow(ct, 0.6) * spow(Math.cos(ph), 0.7), y = nb2 * spow(Math.sin(th), 0.6), z = 0.1 * spow(ct, 0.5) * spow(Math.sin(ph), 0.6);
            z -= 0.24 * (x / na) * (x / na); if (v === 0 || v === 1) x = z = 0;
            return { p: [x, y, z], uv: [x, y], ex: [clamp((y / nb2 + 1) / 2, 0, 1), x / na, 0, 0] };
          });
        }
        if (s === 0) thumbMcp = pts[1];
      }
    }
    // ---- inside a fist the fingers press into the palm's pads: fill the hollow so no daylight shows through it
    if (h.pose === 'fist') {
      const lf = T(-0.4, 7.0, -2.35), part = sc.part++;
      grid(sc, handMat, part, W2(lf), lf, 20, 14, (u, v) => {
        const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2;
        return { p: [3.4 * Math.cos(th) * Math.cos(ph), 2.1 * Math.sin(th), 1.45 * Math.cos(th) * Math.sin(ph)], uv: [ph, th], ex: [0, 99, 0, 0] };
      });
    }
    // ---- the web between the thumb and the index finger
    {
      const A0 = thumbMcp, B0 = [-2.5, 6.6, -0.35];
      const Y = norm(sub(B0, A0)), Z = norm(sub([0, 0, 1], mul(Y, Y[2]))), lf = F(A0, cross(Y, Z), Y, Z);
      capsule(sc, handMat, W2(lf), lf, len(sub(B0, A0)), 1.0, 0.8, { sx: 1.0, sz: 0.62, nu: 14, nv: 12, ex: () => [0, 99, 0, 0] });
    }
    // ---- wrist and forearm (and the cuff and the sleeve), along the arm's own frame from the wrist to the elbow
    const ad = norm(h.arm), hx = norm(sub(hf.X, mul(ad, dot(ad, hf.X))));
    const mirror = det(hf) < 0;
    const az = cross(hx, ad);
    const af = F(app(hf, [0, 0.6, -0.1]), mirror ? mul(hx, -1) : hx, ad, mirror ? az : az);
    // keep the arm frame's own handedness the same as the hand's
    if ((det(af) < 0) !== mirror) af.Z = mul(af.Z, -1);
    const afl = ID(); // its local frame is its own
    const FL = 44;
    // (Phase 122) in a climb the arm is raised over the head and hangs toward you from the rung: a slimmer forearm (the
    // flesh of the forearm runs to the elbow, out of the view), so that with its sleeve it is no wider on the screen than
    // the pixel arm's
    const cl = !!h.climb;
    const rx = cl ? (s) => s < 0 ? 2.9 : lerp(2.9, 2.55, sm(clamp(s / 6, 0, 1))) + 0.22 * sm(clamp((s - 6) / 22, 0, 1))
      : (s) => s < 0 ? 2.9 : lerp(2.9, 4.2, sm(clamp(s / 24, 0, 1))) + 0.25 * Math.exp(-Math.pow((s - 19) / 6, 2));
    const rz = cl ? (s) => s < 0 ? 1.8 : lerp(1.8, 2.7, sm(clamp(s / 24, 0, 1))) : (s) => s < 0 ? 1.8 : lerp(1.8, 3.8, sm(clamp(s / 24, 0, 1)));
    // a gloved wrist is the glove's own; in a climb the sleeve falls back, and the forearm between the glove's cuff and
    // the sleeve is bare
    const armMat = glass ? 'glass' : mat === 'bare' || cl ? 'skin' : 'leather';
    {
      const part = sc.part++, nu = 44, nv = 44;
      grid(sc, armMat, part, af, afl, nu, nv, (u, v) => {
        const s = -1.6 + v * (FL + 1.6), ph = u * Math.PI * 2;
        let rr = 1; if (s < 0) rr = Math.sqrt(Math.max(0, 1 - Math.pow(s / 1.6, 2)));
        if (v === 0) rr = 0;
        const j = 1;
        // the ulna's knob at the wrist, on the little finger's side
        const bone = skinny ? 1 : 0.45;
        const knob = 1 + bone * 0.2 * Math.exp(-Math.pow((s - 1.5) / 0.75, 2)) * Math.pow(Math.max(0, Math.cos(ph - 0.55)), 3);
        // the radius's end on the thumb's side, and the wrist a little narrower between the hand and the forearm's flesh
        const rad = 1 + bone * 0.07 * Math.exp(-Math.pow((s - 1.2) / 0.9, 2)) * Math.pow(Math.max(0, Math.cos(ph - Math.PI + 0.4)), 2);
        const neck = 1 - bone * 0.06 * Math.exp(-Math.pow((s - 3.2) / 1.6, 2));
        // two tendons running up the inside of the wrist and a flatter back
        const flat = 1 - bone * 0.05 * Math.pow(Math.max(0, Math.sin(ph)), 4) * clamp(1 - s / 10, 0, 1);
        const m = knob * rad * neck * flat;
        // (Phase 122) a bare wrist is creased across where it bends: the bracelet lines on the inside, finer ones on the back
        const wc = skinny ? Math.exp(-Math.pow((s - 1.1) / 0.55, 2)) * (Math.sin(ph) < 0 ? 0.9 : 0.2) : 0;
        return { p: [rx(s) * Math.cos(ph) * rr * j * m, s, rz(s) * Math.sin(ph) * rr * j * m], uv: [ph * 3.2, s], ex: [0.25 * (knob - 1) / 0.2 * bone, skinny ? s - 1.1 + 0.12 * Math.cos(ph) * Math.cos(ph) + 0.01 : 99, 0, wc] };
      }, { arm: true });
      for (let s = 0; s < 30; s += 2.2) sphere(sc, app(af, [0, s, 0]), Math.min(rx(s), rz(s)) * 0.95, part);
    }
    // the glove's flared cuff
    if (mat === 'leather' || mat === 'mail') {
      const part = sc.part++, s1 = 5.0;
      grid(sc, 'leather', part, af, afl, 34, 22, (u, v) => {
        const ph = u * Math.PI * 2;
        // profile: inside lip -> rim -> outside down to the wrist
        let s, dr;
        if (v < 0.12) { const t = v / 0.12; s = lerp(s1 - 1.4, s1 - 0.05, t); dr = -0.25; }
        else if (v < 0.24) { const t = (v - 0.12) / 0.12, a = Math.PI * t; s = s1 - 0.05 + Math.sin(a) * 0.22; dr = -0.25 + (1 - Math.cos(a)) * 0.22; }
        else { const t = (v - 0.24) / 0.76; s = lerp(s1, -0.9, t); dr = 0.2; }
        const fl = (cl ? 0.75 : 1.45) * Math.pow(clamp((s - 1.2) / (s1 - 1.2), 0, 1), 1.4);
        const wob = 1 + 0.03 * (vn3(Math.cos(ph) * 2 + 3, Math.sin(ph) * 2, s * 0.4) - 0.5);
        const r = (q) => (q + 0.42 + fl + dr) * wob;
        const seam = Math.min(Math.abs(s - (s1 - 0.75)), Math.abs(ph - 0.2) * 4 + (s < 1 ? 9 : 0));
        return { p: [r(rx(Math.max(s, 0))) * Math.cos(ph), s, r(rz(Math.max(s, 0))) * Math.sin(ph)], uv: [ph * 4, s], ex: [0, v < 0.2 ? 99 : seam, s < s1 - 1.2 ? ph * 4 : s * 3, 0] };
      }, { flip: true, arm: true });
      for (let s = 0; s < s1; s += 2) sphere(sc, app(af, [0, s, 0]), Math.min(rx(s), rz(s)) + 0.5, part);
    }
    // the wool sleeve: folds from hashed noise, a rolled hem
    if (h.sleeve) {
      // (Phase 122) in a climb the sleeve falls back from the wrist, as it does on an arm raised over the head, and its cuff
      // narrows toward the wrist: it hugs the forearm at its hem and loosens further down, its folds shallower
      const part = sc.part++, s0 = cl ? (mat === 'bare' ? 7.5 : 9.0) : mat === 'bare' ? 2.6 : 4.1, s1 = FL + 2, fk = cl ? 0.45 : 1;
      const fold = (ph, s) => {
        const c = Math.cos(ph), sn = Math.sin(ph);
        return fk * (0.75 * (fbm(c * 1.3 + 11, sn * 1.3 + 4, s * 0.16) - 0.5) + 0.35 * Math.sin(s * 0.55 + 2.4 * vn3(c * 1.5, sn * 1.5, s * 0.05 + 3)) * clamp((s - s0 - 3) / 6, 0, 1)
          + 0.25 * (vn3(c * 3.1 + 7, sn * 3.1, s * 0.4) - 0.5));
      };
      // (pushed back, the wool gathers in a few soft rings just above its hem)
      const ease = cl ? (s) => 0.36 + 0.16 * sm(clamp((s - s0) / 16, 0, 1)) : () => 1.25;
      const bunch = cl ? (ph, s) => { const b = Math.exp(-Math.pow((s - s0 - 2.2) / 2.6, 2)); return b * (0.1 + 0.16 * Math.sin(s * 1.9 + 1.6 * vn3(Math.cos(ph) * 1.4 + 2, Math.sin(ph) * 1.4, s * 0.2))); } : () => 0;
      grid(sc, 'wool', part, af, afl, 48, 58, (u, v) => {
        const ph = u * Math.PI * 2;
        let s, dr;
        if (v < 0.06) { const t = v / 0.06; s = lerp(s0 + 1.6, s0 + 0.1, t); dr = -0.42; }
        else if (v < 0.14) { const t = (v - 0.06) / 0.08, a = Math.PI * t; s = s0 + 0.1 - Math.sin(a) * 0.36; dr = -0.42 + (1 - Math.cos(a)) * 0.36; }
        else { const t = (v - 0.14) / 0.86; s = lerp(s0 + 0.1, s1, t); dr = 0.3 * Math.exp(-Math.pow((s - s0 - 0.5) / 0.6, 2)); }
        const r = (q) => q + ease(s) + bunch(ph, s) + fold(ph, s) + dr * (cl ? 0.6 : 1) + 0.25 * clamp((s - s0) / 20, 0, 1);
        return { p: [r(rx(s)) * Math.cos(ph), s, r(rz(s)) * Math.sin(ph)], uv: [ph * 5, s], ex: [0, 99, 0, v < 0.14 ? 1 : 0] };
      }, { arm: true });
    }
    // the wrist, for the joint: where it is, the line across it (it bends about this), the forearm's line, and the line
    // through it from palm to back (it tilts to the thumb's side or the little finger's about this)
    sc.wrist = { o: af.o, X: af.X, Y: af.Y, Z: af.Z };
    return { tips };
  }

  // ---------------------------------------------------------------- ambient occlusion and soft self-shadow per vertex
  function occlusion(sc) {
    const S = sc.spheres;
    for (const g of Object.values(sc.groups)) {
      const v = g.v;
      for (let k = 0; k < g.n; k++) {
        const o = k * STRIDE, p = [v[o], v[o + 1], v[o + 2]], n = [v[o + 3], v[o + 4], v[o + 5]], part = g.parts[k];
        let occ = 0;
        for (let m = 0; m < S.length; m++) {
          const s = S[m]; if (s.part === part) continue;
          const dx = s.c[0] - p[0], dy = s.c[1] - p[1], dz = s.c[2] - p[2], d2 = dx * dx + dy * dy + dz * dz, r2 = s.r * s.r;
          if (d2 > r2 * 30) continue;
          const d = Math.sqrt(d2); if (d < s.r * 0.92) continue;
          const c = (dx * n[0] + dy * n[1] + dz * n[2]) / d; if (c <= 0) continue;
          occ += c * r2 / d2;
        }
        v[o + 11] = clamp(1 - occ * 0.9, 0.15, 1);
      }
    }
  }
  function shadows(sc, L) {
    const S = sc.spheres;
    for (const g of Object.values(sc.groups)) {
      const v = g.v;
      for (let k = 0; k < g.n; k++) {
        const o = k * STRIDE, px = v[o], py = v[o + 1], pz = v[o + 2], part = g.parts[k];
        let sh = 1;
        for (let m = 0; m < S.length; m++) {
          const s = S[m]; if (s.part === part) continue;
          const dx = s.c[0] - px, dy = s.c[1] - py, dz = s.c[2] - pz;
          const t = dx * L[0] + dy * L[1] + dz * L[2]; if (t <= 0) continue;
          const d2 = dx * dx + dy * dy + dz * dz; if (d2 < s.r * s.r * 1.1) continue;
          const q = Math.sqrt(Math.max(0, d2 - t * t)) - s.r;
          const pen = 0.18 * t + 0.4;
          sh = Math.min(sh, clamp(0.5 + q / pen, 0, 1));
          if (sh <= 0) break;
        }
        v[o + 12] = sh * sh * (3 - 2 * sh);
      }
    }
  }

  // ---------------------------------------------------------------- the renderer
  const VS = `attribute vec3 a_pos, a_nrm, a_loc, a_occ; attribute vec2 a_uv; attribute vec4 a_ex; uniform vec3 u_wpiv; uniform mat3 u_wrot;
uniform mat4 u_proj, u_model; varying vec3 v_pos, v_nrm, v_loc; varying vec2 v_uv, v_occ; varying vec4 v_ex;
void main(){ vec3 q=mix(a_pos, u_wrot*(a_pos-u_wpiv)+u_wpiv, a_occ.z), n=normalize(mix(a_nrm, u_wrot*a_nrm, a_occ.z));
  vec4 p=u_model*vec4(q,1.0); v_pos=p.xyz; v_nrm=normalize((u_model*vec4(n,0.0)).xyz); v_loc=a_loc; v_uv=a_uv; v_occ=a_occ.xy; v_ex=a_ex; gl_Position=u_proj*p; }`;
  const FS_HEAD = `#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec3 v_pos, v_nrm, v_loc; varying vec2 v_uv, v_occ; varying vec4 v_ex;
uniform vec3 u_keyDir, u_key, u_amb, u_torchPos, u_torch, u_songPos, u_song, u_rimDir, u_rim, u_sky, u_hor, u_gnd, u_base, u_alt;
uniform float u_exposure, u_lvl;
float hsh(vec3 p){ p = fract(p*0.3183099 + vec3(0.71,0.113,0.419)); p *= 17.0; return fract(p.x*p.y*p.z*(p.x+p.y+p.z)); }
float vnoise(vec3 x){ vec3 i=floor(x), f=fract(x); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(hsh(i),hsh(i+vec3(1,0,0)),f.x), mix(hsh(i+vec3(0,1,0)),hsh(i+vec3(1,1,0)),f.x),f.y),
             mix(mix(hsh(i+vec3(0,0,1)),hsh(i+vec3(1,0,1)),f.x), mix(hsh(i+vec3(0,1,1)),hsh(i+vec3(1,1,1)),f.x),f.y), f.z); }
vec3 bump(vec3 N, vec3 P, float h){ vec3 dpx=dFdx(P), dpy=dFdy(P); float dhx=dFdx(h), dhy=dFdy(h);
  vec3 r1=cross(dpy,N), r2=cross(N,dpx); float d=dot(dpx,r1); vec3 g=sign(d)*(dhx*r1+dhy*r2); return normalize(abs(d)*N - g); }
vec3 env(vec3 R){ vec3 c = R.y > 0.0 ? mix(u_hor, u_sky, pow(R.y, 0.55)) : mix(u_hor, u_gnd, pow(-R.y, 0.35));
  vec3 td = normalize(u_torchPos - v_pos); c += u_torch * 0.5 * pow(max(dot(R, td), 0.0), 6.0); return c; }
vec3 hemi(vec3 N){ return u_amb * mix(vec3(1.18,0.98,0.8)*0.75, vec3(0.94,1.0,1.1), N.y*0.5+0.5); }
vec3 pl(vec3 N, vec3 lp, vec3 lc, float range, float wrap, out vec3 Ld){ vec3 d = lp - v_pos; float dist = length(d); Ld = d/dist;
  float att = 1.0/(1.0 + dist*dist/(range*range)); return lc*att*max((dot(N,Ld)+wrap)/(1.0+wrap), 0.0); }
vec3 tonemap(vec3 c){ c *= u_exposure; float l = dot(c, vec3(0.2126, 0.7152, 0.0722));
  vec3 a = c * ((1.0 - exp(-l)) / max(l, 1e-4)), b = 1.0 - exp(-c);
  c = mix(a, b, 0.35); c = c / (1.0 + max(max(c.r, max(c.g, c.b)) - 1.0, 0.0)); return pow(c, vec3(1.0/2.2)); }
float rimf(vec3 N, vec3 V){ float f = 1.0 - max(dot(N,V),0.0); return f*f*f * (0.55 + 0.45*max(dot(N,u_rimDir),0.0)); }
`;
  // per-material fragment bodies; each sets col (linear) and a (alpha)
  const FS = {
    skin: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  // the skin's fine relief: broad soft lumps, a hashed fine grain (pores), and a faint cross-hatch of creases
  float h = vnoise(v_loc*5.0)*0.006 + vnoise(v_loc*23.0)*0.002;
  float pore = hsh(floor(v_loc*36.0)); h -= smoothstep(0.82, 1.0, pore)*0.0016;
  float gr = vnoise(v_loc*52.0); h += gr*0.0012;
  vec3 q = v_loc*vec3(9.0, 4.0, 9.0);
  float hatch = pow(abs(sin(q.x*2.1 + q.y*1.3 + sin(v_loc.y*3.1 + v_loc.z*1.7)*1.5)), 14.0) + pow(abs(sin(q.z*2.3 - q.y*1.1 + sin(v_loc.x*2.9 - v_loc.y*1.3)*1.5)), 14.0);
  h -= hatch*0.0011;
  // (Phase 122) bare skin (it carries its crease line in v_ex.y): the fine cross-hatch of the skin's lines deeper, and
  // drawn a shade darker, as on the back of a working hand
  if (v_ex.y < 50.0) h -= hatch*0.003;
  // the creases at the joints. (Phase 122) Bare skin carries its own crease line (v_ex.y, cm from the joint, bowed at
  // the sides): a band of fine lines across it, each breaking and rejoining, the skin between them a little raised;
  // elsewhere (a glove's wrist) the old few lines along the segment
  float cc = v_ex.y < 50.0 ? v_ex.y : v_uv.y*0.73;
  float wob = vnoise(v_loc*2.3)*1.3 + vnoise(v_loc*6.5 + 4.0)*0.5;
  float brk = smoothstep(0.3, 0.68, vnoise(v_loc*vec3(7.0, 2.0, 7.0) + 2.7));
  float fq = 11.0;
  float ln = pow(abs(sin(cc*fq + wob)), v_ex.y < 50.0 ? 18.0 : 24.0);
  float cr = v_ex.w * ln * (v_ex.y < 50.0 ? 0.2 + 0.8*brk : 1.0);
  float ridge = v_ex.w * pow(abs(cos(cc*fq + wob)), 8.0) * (v_ex.y < 50.0 ? 1.0 : 0.0);
  h -= cr*(v_ex.y < 50.0 ? 0.026 : 0.009); h += ridge*0.009;
  N = bump(N, v_pos, h);
  float red = clamp(v_ex.x, 0.0, 1.0), pale = clamp(-v_ex.x, 0.0, 1.0);
  vec3 alb = pow(u_base, vec3(1.15)) * mix(vec3(1.0), vec3(1.25,0.7,0.62), red*0.6) * (0.9 + 0.2*vnoise(v_loc*1.3)) * (1.0 - cr*(v_ex.y < 50.0 ? 0.72 : 0.22) - v_ex.w*0.08 + ridge*0.22*brk) * (0.97 + 0.06*gr)
    * (v_ex.y < 50.0 ? 1.0 - hatch*0.11 : 1.0);
  // (Phase 122) the heel of the hand paler and a little yellower, as thick skin is
  alb = mix(alb, alb*vec3(1.16, 1.12, 1.02), pale*0.7);
  float ndl = dot(N,L); vec3 w = vec3(0.5,0.3,0.24);
  vec3 dif = clamp((vec3(ndl)+w)/(1.0+w), 0.0, 1.0); dif *= dif;
  vec3 shc = mix(vec3(sh), vec3(1.0), vec3(0.18,0.06,0.03)*(1.0-sh));
  // less gloss: a low broad sheen and a faint tight one
  vec3 Hh = normalize(L+V); float nh = max(dot(N,Hh),0.0);
  float spec = (pow(nh, 18.0)*0.05 + pow(nh, 70.0)*0.06) * (0.3+0.7*sh);
  // (Phase 122) bare skin: the skin drawn taut over a knuckle has a sheen of its own
  if (v_ex.y < 50.0) spec *= 1.0 + red*4.5;
  float fr = pow(1.0 - max(dot(N,V),0.0), 4.0);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.4, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.35, Ls);
  vec3 col = alb * (u_key*dif*shc + hemi(N)*ao*0.85*vec3(0.9,0.97,1.1) + tor*ao + sng) + u_key*spec*sh + (u_key*sh*0.03 + u_amb*0.07)*fr*ao
           + alb*u_rim*rimf(N,V)*1.4 + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),22.0)*0.05;
  // the shade is cooler than the light
  float lit = clamp(max(ndl, 0.0)*sh, 0.0, 1.0);
  col *= mix(vec3(0.9, 0.96, 1.07), vec3(1.0), smoothstep(0.0, 0.5, lit));
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    // (Phase 122) a nail that reads as a nail: a paler plate than the skin, its half-moon at the base, faint ridges along it,
    // a darker rim where it goes under the cuticle and the folds at its sides, and the free edge pale and lit. A working
    // hand: no polish, a little worn at the edge
    nail: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  float al = clamp(v_ex.x, 0.0, 1.0), ac = clamp(abs(v_ex.y), 0.0, 1.0);
  // (the far edge follows the nail's own rounded outline: how far out along the oval this point is)
  float rr = length(vec2(ac, al*2.0 - 1.0));
  float h = sin(v_ex.y*26.0 + vnoise(v_loc*9.0)*1.5)*0.0008 + vnoise(v_loc*30.0)*0.0005;
  N = bump(N, v_pos, h);
  vec3 skin = pow(u_base, vec3(1.15));
  // a soft plate: the skin's colour a little paler and pinker, the half-moon a touch paler again
  vec3 plate = mix(skin*vec3(1.06,0.9,0.9), vec3(0.6,0.42,0.42), 0.22);
  vec3 alb = mix(plate, plate*vec3(1.16,1.13,1.1), (1.0 - smoothstep(0.1, 0.28, al))*(1.0 - smoothstep(0.2, 0.6, ac)));
  // the free edge: a thin rounded rim, a shade paler than the plate (no white)
  float edge = smoothstep(0.86, 0.96, rr) * smoothstep(0.55, 0.8, al);
  alb = mix(alb, plate*vec3(1.22,1.17,1.1), edge);
  // the folds: the skin lapping over the plate at the cuticle and down the sides, a faint darker line where it goes under
  float fold = max(1.0 - smoothstep(0.04, 0.1, al), smoothstep(0.86, 0.94, ac) * (1.0 - smoothstep(0.6, 0.85, al)));
  float groove = max(smoothstep(0.05, 0.1, al) * (1.0 - smoothstep(0.1, 0.17, al)), smoothstep(0.74, 0.82, ac) * (1.0 - smoothstep(0.84, 0.9, ac)) * (1.0 - smoothstep(0.6, 0.85, al)));
  alb = mix(alb, skin*vec3(0.72, 0.56, 0.52), groove*0.5);
  alb = mix(alb, skin, fold);
  // (lit as the skin round it is lit, so that it is paler than the skin by its colour and not by its light)
  float ndl = dot(N,L); vec3 Hh = normalize(L+V); vec3 w = vec3(0.3,0.22,0.2);
  vec3 dif = clamp((vec3(ndl)+w)/(1.0+w), 0.0, 1.0); dif *= dif;
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.2, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.2, Ls);
  float gloss = (1.0 - fold) * (1.0 - groove);
  vec3 col = alb*(u_key*dif*sh + hemi(N)*ao*0.85*vec3(0.9,0.97,1.1) + tor*ao + sng) + u_key*(pow(max(dot(N,Hh),0.0),90.0)*0.18 + pow(max(dot(N,Hh),0.0),16.0)*0.02)*sh*gloss
           + env(reflect(-V,N))*0.04*gloss + (u_key*0.05*sh + u_rim*0.12)*edge;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    leather: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  float g1 = vnoise(v_loc*11.0), g2 = vnoise(v_loc*29.0);
  float h = g1*0.025 + g2*0.012;
  float sd = abs(v_ex.y);
  float groove = 1.0 - smoothstep(0.035, 0.1, sd);
  float stitch = (1.0 - smoothstep(0.035, 0.07, abs(sd - 0.2))) * smoothstep(0.25, 0.45, abs(fract(v_ex.z*2.4) - 0.5)*2.0);
  float cr = v_ex.w * pow(abs(sin(v_uv.y*7.0 + g1*2.5)), 8.0);
  h += -groove*0.07 + stitch*0.03 - cr*0.05;
  N = bump(N, v_pos, h);
  float wear = clamp(v_ex.x,0.0,1.0);
  float mott = vnoise(v_loc*0.9)*0.5 + vnoise(v_loc*2.7)*0.5;
  vec3 alb = u_base * (0.78 + 0.4*mott) * (0.92 + 0.16*g2);
  alb = mix(alb, u_alt, wear*0.6);
  alb *= 1.0 - groove*0.55 - cr*0.35;
  alb = mix(alb, vec3(0.42,0.33,0.22), stitch*0.85);
  float ndl = dot(N,L); float dif = max((ndl+0.15)/1.15, 0.0);
  vec3 Hh = normalize(L+V); float gloss = 18.0 + 30.0*wear;
  float spec = pow(max(dot(N,Hh),0.0), gloss) * (0.16 + 0.3*wear) * (1.0 - groove);
  float fr = pow(1.0 - max(dot(N,V),0.0), 4.0);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.2, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.3, Ls);
  vec3 col = alb*(u_key*dif*sh + hemi(N)*ao + tor*ao + sng) + u_key*spec*sh + env(reflect(-V,N))*fr*0.12*ao
           + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),gloss)*0.25*ao + u_rim*rimf(N,V)*0.35;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    grip: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  float q = fract((v_uv.y + v_uv.x*0.55)/1.05);
  float h = sin(q*3.14159)*0.12 + vnoise(v_loc*14.0)*0.02;
  N = bump(N, v_pos, h);
  vec3 alb = u_base * (0.65 + 0.35*sin(q*3.14159)) * (0.85+0.3*vnoise(v_loc*3.0));
  float dif = max(dot(N,L),0.0); vec3 Hh = normalize(L+V);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.2, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.3, Ls);
  vec3 col = alb*(u_key*dif*sh + hemi(N)*ao + tor*ao + sng) + u_key*pow(max(dot(N,Hh),0.0),24.0)*0.15*sh;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    mail: `float rings(vec2 p, out float dark){ float hg = 0.0; dark = 1.0;
  for (int dy=-1; dy<=1; dy++) for (int dx=-1; dx<=1; dx++) {
    float row = floor(p.y/0.27) + float(dy); float off = mod(row, 2.0)*0.5;
    float colm = floor(p.x/0.40 - off) + float(dx);
    vec2 c = vec2((colm + off + 0.5)*0.40, (row + 0.5)*0.27);
    vec2 d = (p - c)*vec2(1.0, 1.3); float r = length(d);
    float t = 1.0 - clamp(abs(r - 0.17)/0.055, 0.0, 1.0);
    float hh = sqrt(t)*(0.75 + 0.25*hsh(vec3(colm,row,3.0))) + (d.y > 0.0 ? 0.15 : 0.0)*t;
    hg = max(hg, hh); dark = min(dark, smoothstep(0.0, 0.12, abs(r - 0.17) - 0.05));
  } return hg; }
void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y; float dk;
  float h = rings(v_uv*vec2(1.0,1.0), dk);
  N = bump(N, v_pos, h*0.09);
  float ring = smoothstep(0.05, 0.3, h);
  vec3 alb = mix(vec3(0.02,0.02,0.025), u_base*(0.8+0.4*vnoise(v_loc*2.0)), ring);
  float dif = max(dot(N,L),0.0); vec3 Hh = normalize(L+V);
  float spec = pow(max(dot(N,Hh),0.0), 55.0) * 2.2 * ring;
  vec3 R = reflect(-V,N);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.0, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.2, Ls);
  vec3 col = alb*(u_key*dif*sh*0.6 + hemi(N)*ao*0.8 + tor*0.6 + sng) + env(R)*0.35*ring*ao + u_key*spec*sh
           + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),55.0)*1.2*ring + u_rim*rimf(N,V)*0.4*ring;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    wool: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  float f1 = vnoise(v_loc*vec3(9.0,2.5,9.0)), f2 = vnoise(v_loc*24.0);
  float knit = abs(sin(v_uv.x*9.0 + f1*1.5))*0.5 + 0.5;
  float h = f1*0.05 + f2*0.03 + knit*0.015;
  N = bump(N, v_pos, h);
  vec3 alb = u_base * (0.8 + 0.3*vnoise(v_loc*0.7)) * (0.9 + 0.2*f2) * (1.0 - v_ex.w*0.15);
  float ndl = dot(N,L); float dif = clamp((ndl+0.45)/1.45, 0.0, 1.0);
  float fr = 1.0 - max(dot(N,V),0.0);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.5, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.5, Ls);
  vec3 col = alb*(u_key*dif*sh + hemi(N)*ao + tor*ao + sng) + alb*(u_key*sh*0.5 + u_amb*0.8 + u_torch*0.25)*pow(fr,2.5)*0.9*ao
           + u_rim*alb*rimf(N,V)*1.2;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    steel: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float edge = v_ex.x, fu = v_ex.y, t = v_uv.x;
  float br = vnoise(vec3(t*40.0, v_loc.y*30.0, v_loc.z*30.0));
  vec3 R = reflect(-V,N);
  // the sky in it: the reflection, and a sky-to-ground gradient along the blade (sky at the point, the ground near the guard)
  vec3 e = env(R);
  vec3 grad = mix(mix(u_gnd*1.6 + u_hor*0.25, u_hor, smoothstep(0.0, 0.45, t)), u_sky*1.1, smoothstep(0.45, 1.0, t));
  float facing = abs(dot(N, V));
  vec3 refl = mix(e, grad, 0.55) * (0.75 + 0.25*br);
  refl *= mix(1.0, 0.55, fu);
  vec3 Hh = normalize(L+V); float sp = pow(max(dot(N,Hh),0.0), 90.0)*3.0 + pow(max(dot(N,Hh),0.0), 10.0)*0.22;
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.0, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.0, Ls);
  float fr = 0.75 + 0.25*pow(1.0 - facing, 3.0);
  vec3 col = u_base*(refl*fr + u_key*max(dot(N,L),0.0)*0.18 + hemi(N)*0.15) + u_key*sp*v_occ.y
           + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),30.0)*1.6 + u_torch*0.04 + sng*0.6
           + (u_hor*0.9 + u_key*0.35 + u_torch*0.5) * smoothstep(0.6, 1.0, edge);
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    iron: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  float h = vnoise(v_loc*9.0)*0.02; N = bump(N, v_pos, h);
  vec3 R = reflect(-V,N); vec3 Hh = normalize(L+V);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.0, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.0, Ls);
  vec3 col = u_base*(env(R)*0.55*ao + u_key*max(dot(N,L),0.0)*0.35*sh + hemi(N)*0.3*ao + tor*0.4 + sng*0.5)
           + u_key*pow(max(dot(N,Hh),0.0),45.0)*1.2*sh + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),40.0)*0.8;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    glass: `vec3 h33(vec3 p){ return vec3(hsh(p), hsh(p + vec3(17.3, 5.1, 9.7)), hsh(p + vec3(3.9, 41.2, 23.5))); }
void main(){ vec3 N0 = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  // the planes: the hand's own space cut into tetrahedra (the simplex lattice, about 3.9 cm); where the surface passes
  // through one tetrahedron it is one plane of the glass, with straight edges where it meets the next
  vec3 x = (v_loc + vec3(0.37, 0.71, 0.19)) / 5.6;
  vec3 sk = x + (x.x + x.y + x.z) / 3.0;
  vec3 ip = floor(sk), f = sk - ip;
  vec3 a = f; float pm = 0.0;
  // sort the fraction (descending) and remember the order: it names the tetrahedron inside the cube
  if (a.x < a.y) { a.xy = a.yx; pm += 1.0; }
  if (a.y < a.z) { a.yz = a.zy; pm += 2.0; }
  if (a.x < a.y) { a.xy = a.yx; pm += 4.0; }
  vec4 bc = vec4(1.0 - a.x, a.x - a.y, a.y - a.z, a.z);
  float m = min(min(bc.x, bc.y), min(bc.z, bc.w));
  float wv = fwidth(m);
  float seam = 1.0 - smoothstep(wv*0.45, wv*1.25, m);
  vec3 cid = ip + vec3(pm*0.137, pm*0.291, pm*0.073);
  // which face is nearest decides the neighbour; a few edges are bright
  float face = m == bc.x ? 0.0 : m == bc.y ? 1.0 : m == bc.z ? 2.0 : 3.0;
  float bright = seam * step(hsh(ip*1.31 + vec3(face*3.1 + pm*0.7, face, pm)), 0.09);
  vec3 tl = h33(cid*1.91 + vec3(4.0)) - 0.5;
  vec3 N = normalize(N0*0.28 + tl*0.95 + V*0.42);
  float fh = hsh(cid*2.3 + vec3(9.0));
  // a few planes (about one in five) are cut to catch the key light: each flashes whole, the rest stay dark and deep
  vec3 Hk = normalize(L+V);
  float katch = step(hsh(cid*3.7 + vec3(1.0, 5.0, 2.0)), 0.16);
  N = normalize(mix(N, Hk, katch*0.72));
  float ndv = max(dot(N0,V), 0.0), ndl = dot(N,L);
  vec3 Hh = normalize(L+V), R = reflect(-V,N);
  float F = 0.04 + 0.96*pow(1.0 - max(dot(N,V),0.0), 5.0);
  // each plane its own value: some nearly black-blue, most a deep azure, a few pale
  float tone = fh < 0.3 ? 0.05 + fh*0.4 : fh > 0.91 ? 1.5 : 0.25 + (fh - 0.3)*1.1;
  vec3 deep = u_base * tone; if (fh > 0.91) deep = mix(deep, u_alt*0.8, 0.25);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.0, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.3, Ls);
  // (Phase 112: the glass holds its own azure in the game's light. The sun's warm light alone left it a dull teal by
  // day, so the light on the glass is taken three parts as its brightness and one part as its colour, and the glass
  // gives a little light of its own)
  vec3 keyG = mix(vec3(dot(u_key, vec3(0.2126, 0.7152, 0.0722))), u_key, 0.25);
  vec3 body = deep*(keyG*(0.06 + 0.75*max(ndl,0.0))*(0.45+0.55*sh) + hemi(N)*0.7*ao + tor*1.1 + sng*1.1)
            + u_alt*0.25*u_lvl*(0.35 + 0.65*(1.0-ndv)) + u_base*0.42*u_lvl*(0.4 + 0.6*min(tone, 1.0));
  vec3 refl = env(R)*u_alt*0.9*F*(0.45 + 0.55*katch);
  float nh = max(dot(N,Hh),0.0);
  // (Phase 112: the planes that catch the light flash half as hard as the option's did: in the game's own light and
  // through its bloom they stood white, a harlequin's sleeve)
  float gl = katch*(pow(nh, 30.0)*0.42 + pow(nh, 400.0)*2.0);
  vec3 col = body + refl + mix(u_key, u_alt*1.6, 0.3)*gl*sh + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),120.0)*4.0 + u_song*pow(max(dot(N,normalize(Ls+V)),0.0),30.0)*1.2;
  // the rim: bright where the form turns away
  float rim = pow(1.0 - ndv, 6.0);
  col += (u_alt*1.6*u_lvl + u_rim*1.8 + u_torch*0.5) * rim + u_alt*0.3*u_lvl*pow(1.0 - ndv, 2.0);
  col = mix(col, vec3(0.002, 0.006, 0.02), seam*0.93);
  col = mix(col, (u_alt*1.3 + vec3(0.35))*u_lvl + u_torch*0.6, bright*(0.5 + 0.5*sh));
  float al = mix(0.76, 0.96, smoothstep(0.08, 0.6, ndv)); al = max(al, seam*0.95);
  vec3 c = tonemap(col);
  gl_FragColor = vec4(c*al, al); }`,
  };


  // ---------------------------------------------------------------- the switch
  const FLAG = 'sculptedHands';
  // Phase 122 (the owner, 23 Nov: "finish up with 5"): the sculpted hands are the default in the 3D view. The switch is in
  // GFX.FX and in Low's list (js/presets.js LOW_OFF): on in every preset above Low, off in Original (the game as first made)
  // and in Low (weak machines: the cost per frame is not yet measured on a phone or a low-end laptop). PRESETS.keep
  // restores the player's own stored choice, if there is one, and stores every later change. A returning player whose
  // settings are their own ('custom') starts as the preset those settings were made from (js/max20.js base) wants.
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (GFX[FLAG] === undefined && typeof PRESETS !== 'undefined' && PRESETS.table && !PRESETS.table[GFX.preset]) {
        const base = typeof MAX20 === 'object' && MAX20 && MAX20.state && MAX20.state.base;
        if (base && PRESETS.table[base] && PRESETS.fxWanted) GFX[FLAG] = PRESETS.fxWanted(PRESETS.table[base].fx, FLAG);
      }
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = false;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  // the hands' own WebGL canvas: if it cannot be made, or its context is lost, the pixel hands are drawn, silently (the
  // player's choice is kept; a context restored, or the choice made again, tries afresh)
  let glDead = false;
  const glReady = () => {
    if (glDead) return false;
    if (GL) return !GL.gl.isContextLost();
    try { initGL(); return true; } catch (e) { glDead = true; stats.noGL = String(e && e.message || e).slice(0, 120); return false; }
  };
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true && typeof PIXELHANDS110 === 'object' && !!PIXELHANDS110.poses && glReady();
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('sculpted112: ' + k + ': ' + (e && e.message ? e.message : e)); } catch (x) { /* none */ } };

  // ---------------------------------------------------------------- WebGL
  const PIC_VS = `attribute vec3 a_pos; attribute vec2 a_uv; uniform mat4 u_proj, u_model; varying vec2 v_uv;
void main(){ v_uv=a_uv; gl_Position=u_proj*u_model*vec4(a_pos,1.0); }`;
  const PIC_FS = `precision highp float; varying vec2 v_uv; uniform sampler2D u_tex; uniform vec3 u_lightc;
void main(){ vec4 c=texture2D(u_tex, v_uv); if (c.a < 0.5) discard; gl_FragColor=vec4(c.rgb*u_lightc, 1.0); }`;
  let GL = null;
  function initGL() {
    if (GL) return GL;
    const cv = document.createElement('canvas'); cv.width = W * SS; cv.height = H * SS;
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: true, preserveDrawingBuffer: true, depth: true });
    if (!gl) throw new Error('sculpted112: no WebGL');
    // (Phase 122) a lost context: the pixel hands until it is restored; restored, every hand is built again on a new canvas
    cv.addEventListener('webglcontextlost', (e) => { e.preventDefault(); items = []; });
    cv.addEventListener('webglcontextrestored', () => { if (GL && GL.cv === cv) { GL = null; CACHE.clear(); items = []; } });
    gl.getExtension('OES_standard_derivatives'); const u32 = gl.getExtension('OES_element_index_uint');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('sculpted112 shader: ' + gl.getShaderInfoLog(s)); return s; };
    const link = (vsrc, fsrc, attrs) => {
      const p = gl.createProgram(); gl.attachShader(p, sh(gl.VERTEX_SHADER, vsrc)); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, fsrc));
      attrs.forEach((n, i) => gl.bindAttribLocation(p, i, n));
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('sculpted112 link: ' + gl.getProgramInfoLog(p));
      const U = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); U[a.name] = gl.getUniformLocation(p, a.name); }
      return { p, U };
    };
    const progs = {};
    for (const [k, body] of Object.entries(FS)) progs[k] = link(VS, FS_HEAD + body, ['a_pos', 'a_nrm', 'a_loc', 'a_uv', 'a_occ', 'a_ex']);
    const pic = link(PIC_VS, PIC_FS, ['a_pos', 'a_uv']);
    const qbuf = gl.createBuffer();
    cv.__live = true;   // js/body21.js sends a canvas so marked to the 3D view afresh each frame
    GL = { cv, gl, progs, pic, qbuf, u32, tex: new Map() };
    return GL;
  }
  function upload(sc) {
    const { gl, u32 } = initGL();
    for (const g of Object.values(sc.groups)) {
      if (g.buf) continue;
      g.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.v), gl.STATIC_DRAW);
      g.ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ibuf);
      if (g.n > 65535 && !u32) throw new Error('sculpted112: too many vertices');
      g.big = g.n > 65535; gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.big ? new Uint32Array(g.i) : new Uint16Array(g.i), gl.STATIC_DRAW);
      g.count = g.i.length;
    }
  }
  const lin = (c, k) => [Math.pow(Math.max(0, c[0]) / 255, 2.2) * k, Math.pow(Math.max(0, c[1]) / 255, 2.2) * k, Math.pow(Math.max(0, c[2]) / 255, 2.2) * k];
  const PROJ = (() => { const f = 1 / TF; return new Float32Array([f / ASPECT, 0, 0, 0, 0, f, 0, 0, 0, 0, (FAR + NEAR) / (NEAR - FAR), -1, 0, 0, 2 * FAR * NEAR / (NEAR - FAR), 0]); })();

  // ---------------------------------------------------------------- a hand, built once for a pose and a look
  // It is built about its anchor (the grip's middle, or the palm's): x right, y up, z toward the eye, in centimetres.
  const PALM = [0, 5, 0], KEY_DIR = norm([-0.45, 0.7, 0.55]);
  const CACHE = new Map();
  const r2 = (v) => v.map((x) => x.toFixed(2)).join(',');
  function matOf(h, look) {
    if (h.glass) return { mat: 'glass', sleeve: false, base: [30, 104, 205], alt: [120, 205, 255] };
    // (bare, gloved and sleeved are told as the pixel hands tell them: js/pixelhands110.js wearOf)
    const g = look && look.hands, B = look && look.body, sl = (B && B.sleeve) || {}, sleeve = sl.material !== 'skin', wool = sl.col || (B && B.col && B.col.base) || [120, 100, 80];
    if (!g || g.bare || !g.col) return { mat: 'bare', sleeve, wool };
    const metal = /^(mail|iron|bellbronze|steel)$/.test(String(g.material || ''));
    const c = g.col;
    return metal ? { mat: 'mail', sleeve, wool, base: c.base || [170, 172, 178] } : { mat: 'leather', sleeve, wool, base: c.base || [96, 62, 40], alt: c.light || [150, 112, 80] };
  }
  // an open hand's fingers as a Song gathers: 0 half curled (a hand at rest), 1 opening, 2 open (the pose itself)
  const REST = [[30, 40, 24, -4], [32, 42, 26, -1], [34, 42, 26, 2], [38, 44, 28, 6]], SPREAD = [0.85, 0.42, 0];
  let built = 0;
  // variant: for an open hand, 0..2 as above. A variant not yet built is built only if nothing else was built this
  // frame; otherwise null comes back and the caller draws the open hand it has (one build a frame, never a stall)
  function handScene(h, look, flipped, variant, climb) {
    const v = h.curl === 'open' && variant != null && variant < 2 ? variant : 2;
    const M = matOf(h, look), key = [h.curl, M.mat, M.sleeve ? 1 : 0, r2(h.Y), r2(h.Z), r2(h.arm), h.left ? 1 : 0, flipped ? 1 : 0, v, climb ? 1 : 0].join('|');
    let E = CACHE.get(key); if (E) return E;
    if (v < 2 && built > 0) return null;
    built++;
    const pose = h.curl === 'grip' ? 'grip' : h.curl === 'open' ? 'open' : 'fist';
    const fAng = v < 2 ? POSE.open.f.map((a, k) => a.map((x, i) => lerp(x, REST[k][i], SPREAD[v]))) : null;
    const f0 = handFrame([0, 0, 0], h.Y, h.Z, h.left), anchor = pose === 'grip' ? GRIP_G : PALM;
    const fr = F(mul(rotv(f0, anchor), -1), f0.X, f0.Y, f0.Z);
    const sc = newScene();
    buildHand(sc, { frame: fr, pose, wrap: pose === 'grip', mat: M.mat, sleeve: M.sleeve, arm: norm(h.arm), f: fAng, climb: !!climb });
    occlusion(sc);
    // the soft self-shadow is cast once, for the light from the upper left as the hand is seen (a picture drawn mirrored
    // is lit from its own upper right, so that on the screen the light is still from the left)
    shadows(sc, flipped ? [-KEY_DIR[0], KEY_DIR[1], KEY_DIR[2]] : KEY_DIR);
    upload(sc);
    E = { sc, M, fr, det: det(f0) }; if (CACHE.size > 60) CACHE.clear();
    CACHE.set(key, E); return E;
  }

  // ---------------------------------------------------------------- a frame
  // place(kind, id, look, t): a first-person picture the game has posed. t = [a, b, c, d, e, f]: picture pixels to the view's
  // 320 x 150 (x' = a x + c y + e, y' = b x + d y + f). flush(light) draws what was added and gives the canvas (or null).
  const DV = 45;                          // how far ahead of the eye the pictures' plane stands (cm)
  const UQ = DV * TF / 75;                // view units to one of the view's 150 pixels at that distance
  let items = [];
  const posed = new Map();
  function begin() { items = []; }
  // anim (or nothing): how the wrist stands this frame, { dev, flex } in degrees, and for open hands how far the fingers
  // have opened, { spread: 0 | 1 | 2 }
  function place(kind, id, look, t, anim) {
    if (!on()) return false;
    try {
      const key = kind + '|' + id + '|' + (look && look.key) + '|' + (look && look.glassArm ? 1 : 0);
      let P = posed.get(key);
      if (P === undefined) { P = PIXELHANDS110.poses(kind, id, look) || null; if (posed.size > 60) posed.clear(); posed.set(key, P); }
      if (!P || !P.hands.length) return false;
      items.push({ P, look, t, kind, id, anim: anim || null });
      return true;
    } catch (e) { warnOnce('place ' + id, e); return false; }
  }
  // card(canvas, t): a painted picture (a shield's face) stood in the pictures' plane, in the order it is given: what was
  // placed before it and lies behind the plane is hidden by it, what comes forward of the plane (hooked fingers) is not
  function card(canvas, t) {
    if (!on() || !canvas) return false;
    items.push({ P: { w: canvas.width, h: canvas.height, weapon: canvas, hands: [] }, look: null, t, kind: 'card', id: '' });
    return true;
  }
  // the matrix that carries a point about (px, py) on the picture, s view-plane units to its own unit, into the view
  function matrix(t, px, py, s) {
    const [a, b, c, d, e, f] = t, sq = Math.sqrt(Math.abs(a * d - b * c)), lx = a * px + c * py + e, ly = b * px + d * py + f;
    return new Float32Array([a * s * UQ, -b * s * UQ, 0, 0, -c * s * UQ, d * s * UQ, 0, 0, 0, 0, s * sq * UQ, 0, (lx - 160) * UQ, -(ly - 75) * UQ, -DV, 1]);
  }
  const mirrored = (t) => t[0] * t[3] - t[1] * t[2] < 0;
  // a turn about a line through the origin (Rodrigues), as a 3 x 3 in column order; two of them, one after the other
  const turn = (k, deg) => { const a = deg * D2R, c = Math.cos(a), s = Math.sin(a), t = 1 - c, [x, y, z] = k; return [t * x * x + c, t * x * y + s * z, t * x * z - s * y, t * x * y - s * z, t * y * y + c, t * y * z + s * x, t * x * z + s * y, t * y * z - s * x, t * z * z + c]; };
  const mul3 = (A, B) => { const o = new Array(9); for (let c = 0; c < 3; c++) for (let r = 0; r < 3; r++) o[c * 3 + r] = A[r] * B[c * 3] + A[3 + r] * B[c * 3 + 1] + A[6 + r] * B[c * 3 + 2]; return o; };
  const ID3 = new Float32Array([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  function wristTurn(w, anim) {
    if (!w || !anim || (!anim.dev && !anim.flex)) return ID3;
    return new Float32Array(mul3(turn(w.Z, anim.dev || 0), turn(w.X, anim.flex || 0)));
  }
  const apply = (m, p) => [m[0] * p[0] + m[4] * p[1] + m[8] * p[2] + m[12], m[1] * p[0] + m[5] * p[1] + m[9] * p[2] + m[13], m[2] * p[0] + m[6] * p[1] + m[10] * p[2] + m[14]];
  function texOf(cv) {
    const { gl, tex } = GL; let t = tex.get(cv); if (t) return t;
    t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t); gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, cv);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    if (tex.size > 40) { for (const x of tex.values()) gl.deleteTexture(x); tex.clear(); }
    tex.set(cv, t); return t;
  }
  const stats = { frames: 0, hands: 0, cards: 0, lastMs: 0, noGL: '' };
  // light: { key: [r, g, b] the sun's or moon's light (0..255 and over), dir: where it comes from in the view (x right,
  //   y up, z toward the eye), sky, ground: the sky's and the ground's light, night: 0..1, torch: lamps near you or null,
  //   song: a Song's colour times its strength, or null, lock: true while the glass arm is locked }
  function flush(light) {
    if (!items.length) return null;
    if (!GL || GL.gl.isContextLost()) { items = []; return null; }
    const t0 = performance.now(); built = 0;
    const { gl, cv, progs, pic, qbuf } = initGL();
    light = light || { key: [255, 244, 226], dir: KEY_DIR, sky: [120, 132, 150], night: 0, torch: null, song: null };
    const n = clamp(light.night || 0, 0, 1), L = norm(light.dir || KEY_DIR), sky = light.sky || [120, 132, 150];
    gl.viewport(0, 0, W * SS, H * SS);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK);
    const keyc = lin(light.key, lerp(2.1, 2.2, n)), amb = lin(sky, lerp(1.05, 2.4, n)), torch = light.torch ? lin(light.torch, 1.5) : [0, 0, 0];
    const skyLin = lin(sky.map((x) => Math.min(255, x * 1.3)), 1.0), horLin = lin(light.key.map((x, i) => Math.min(255, x * 0.55 + sky[i] * 0.6)), 1.0);
    const gndLin = (light.ground ? lin(light.ground, 0.9) : lin([118, 92, 66], 0.9)).map((v, i) => lerp(v, [0.012, 0.01, 0.009][i], n));
    const rimD = add(mul(lin(sky, 1), 1.1), mul(lin(light.key, 1), 0.35)), rimN = mul(lin(light.key, 1.0), 1.6), rim = rimD.map((v, i) => lerp(v, rimN[i], n));
    // what a painted card (a weapon) is multiplied by: full in full light, darker as the light falls, never unreadable
    const lv = [0, 1, 2].map((i) => (light.key[i] + sky[i] * 0.9 + (light.torch ? light.torch[i] * 0.5 : 0)) / 255), mx = Math.max(1, lv[0], lv[1], lv[2]);
    const cardL = lv.map((v) => Math.max(0.42, Math.min(1, v / mx)));
    // a Song burns between the open hands
    let songPos = [0, 0, -DV], songc = [0, 0, 0];
    if (light.song) for (const it of items) if (it.kind === 'h' && it.id === 'open' && it.P.hands.length === 2) {
      const pts = it.P.hands.map((h) => { const E = handScene(h, it.look, mirrored(it.t)), m = matrix(it.t, h.x, h.y, h.cm), l = app(E.fr, [0, 5.5, -2.5]); return apply(m, l); });
      songPos = mul(add(pts[0], pts[1]), 0.5); songc = lin(light.song, 14.0);
    }
    for (const it of items) {
      const flip = mirrored(it.t);
      // the weapon's card, through the grip
      if (it.P.weapon) {
        const m = matrix(it.t, 0, 0, 1); m[4] = -m[4]; m[5] = -m[5];   // the picture's own y runs down
        gl.useProgram(pic.p); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
        gl.bindBuffer(gl.ARRAY_BUFFER, qbuf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([0, 0, 0, 0, 0, it.P.w, 0, 0, 1, 0, it.P.w, it.P.h, 0, 1, 1, 0, 0, 0, 0, 0, it.P.w, it.P.h, 0, 1, 1, 0, it.P.h, 0, 0, 1]), gl.DYNAMIC_DRAW);
        for (let i = 2; i < 6; i++) gl.disableVertexAttribArray(i);
        gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 20, 0); gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 2, gl.FLOAT, false, 20, 12);
        gl.uniformMatrix4fv(pic.U.u_proj, false, PROJ); gl.uniformMatrix4fv(pic.U.u_model, false, m); gl.uniform3fv(pic.U.u_lightc, cardL);
        gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texOf(it.P.weapon)); gl.uniform1i(pic.U.u_tex, 0);
        gl.drawArrays(gl.TRIANGLES, 0, 6); gl.enable(gl.CULL_FACE); stats.cards++;
      }
      for (const h of it.P.hands) {
        const E = handScene(h, it.look, flip, it.anim ? it.anim.spread : null, it.kind === 'c') || handScene(h, it.look, flip, null, it.kind === 'c'), m = matrix(it.t, h.x, h.y, h.cm);
        // the wrist as a joint: the forearm turned about it (anim: dev degrees to the thumb's side, flex degrees to the palm's)
        const wrot = wristTurn(E.sc.wrist, it.anim);
        // a picture drawn mirrored turns the faces' winding round (a left hand's own mirroring is already in its mesh)
        gl.frontFace(flip ? gl.CW : gl.CCW);
        // (the colours are the look's as it is now: a hand built for one pair of gloves is the same hand in another pair)
        const M = matOf(h, it.look);
        const mats = {
          skin: { base: lin((it.look && it.look.skin) || [214, 170, 136], 1), alt: [0, 0, 0] }, nail: { base: lin((it.look && it.look.skin) || [214, 170, 136], 1), alt: [0, 0, 0] },
          leather: { base: lin(M.base || [96, 62, 40], 1), alt: lin(M.alt || [150, 112, 80], 1) }, grip: { base: lin([74, 48, 32], 1), alt: [0, 0, 0] },
          mail: { base: lin(M.base || [170, 172, 178], 1), alt: [0, 0, 0] }, wool: { base: lin(M.wool || [92, 78, 62], 1), alt: [0, 0, 0] },
          steel: { base: lin([214, 218, 224], 1), alt: [0, 0, 0] }, iron: { base: lin([150, 140, 128], 1), alt: [0, 0, 0] },
          glass: { base: lin([30, 104, 205], 1), alt: lin([120, 205, 255], 1) },
        };
        // the locked glass arm rings flat: the raised arm is washed pale (as js/body21.js washes the pixel one)
        if (light.lock && it.kind === 'h' && it.id === 'glassfist') { const pale = lin([196, 204, 212], 1); mats.glass.base = mats.glass.base.map((v, i) => lerp(v, pale[i], 0.45)); mats.glass.alt = mats.glass.alt.map((v, i) => lerp(v, pale[i], 0.45)); }
        for (const k of ['wool', 'skin', 'nail', 'leather', 'mail', 'grip', 'iron', 'steel', 'glass']) {
          const g = E.sc.groups[k]; if (!g) continue;
          const pr = progs[k], U = pr.U; gl.useProgram(pr.p);
          if (k === 'glass') { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
          gl.uniformMatrix4fv(U.u_proj, false, PROJ); gl.uniformMatrix4fv(U.u_model, false, m);
          if (U.u_wrot) gl.uniformMatrix3fv(U.u_wrot, false, wrot); if (U.u_wpiv) gl.uniform3fv(U.u_wpiv, E.sc.wrist ? E.sc.wrist.o : [0, 0, 0]);
          const u3 = (nm, v) => { if (U[nm]) gl.uniform3fv(U[nm], v); };
          u3('u_keyDir', L); u3('u_key', keyc); u3('u_amb', amb); u3('u_torchPos', [7, -30, -16]); u3('u_torch', torch);
          u3('u_songPos', songPos); u3('u_song', songc); u3('u_rimDir', norm([0.55, 0.45, -0.7])); u3('u_rim', rim);
          u3('u_sky', skyLin); u3('u_hor', horLin); u3('u_gnd', gndLin); u3('u_base', mats[k].base); u3('u_alt', mats[k].alt);
          if (U.u_exposure) gl.uniform1f(U.u_exposure, lerp(1.05, 1.0, n));
          if (U.u_lvl) gl.uniform1f(U.u_lvl, lerp(1.0, 0.4, n));
          gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ibuf);
          const sz = [3, 3, 3, 2, 3, 4]; let off = 0;
          for (let i = 0; i < 6; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, sz[i], gl.FLOAT, false, STRIDE * 4, off * 4); off += sz[i]; }
          gl.drawElements(gl.TRIANGLES, g.count, g.big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
        }
        gl.disable(gl.BLEND); stats.hands++;
      }
    }
    items = []; stats.frames++; stats.lastMs = performance.now() - t0;
    return cv;
  }
  function clear() { CACHE.clear(); posed.clear(); glDead = false; }
  // the canvas as last drawn, for tests: { w, h, data } (rows bottom first, as WebGL reads them)
  function read() { if (!GL) return null; const { gl } = GL, w = W * SS, h = H * SS, data = new Uint8Array(w * h * 4); gl.readPixels(0, 0, w, h, gl.RGBA, gl.UNSIGNED_BYTE, data); return { w, h, data }; }

  // ---------------------------------------------------------------- the Options row: "Hands: in pixels / sculpted"
  const ROW = ['gfx-sculpted112', 'Hands', 'in pixels, or sculpted and lit by the world (the 3D view)'];
  const WORDS = ['In pixels', 'Sculpted'];
  const chosen = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = chosen(); b.textContent = WORDS[v ? 1 : 0]; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v; glDead = false;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
    try { if (typeof BODY21 === 'object' && BODY21.clearCaches) BODY21.clearCaches(); } catch (e) { warnOnce('clear', e); }
    syncRow();
  }
  function wireRow() {
    if (typeof renderAccessibilityMenu !== 'function' || typeof document === 'undefined') return;
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () {
      const r = _acc.apply(this, arguments);
      try {
        const grid = document.querySelector('#modal-panel .ctl-grid');
        if (grid && !document.getElementById(ROW[0])) {
          const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(ROW[1] + ' '));
          const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = ROW[2]; lab.appendChild(sm);
          const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
          b.onclick = () => setOn(!chosen());
          const after = document.getElementById('gfx-pixelhands110');
          if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
          else { grid.appendChild(lab); grid.appendChild(b); }
          syncRow();
        }
      } catch (e) { warnOnce('row', e); }
      return r;
    };
  }
  try { wireRow(); } catch (e) { warnOnce('wire', e); }
  try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { try { syncRow(); } catch (e) { /* menu closed */ } }); } catch (e) { warnOnce('onChange', e); }

  return { FLAG, ROW, WORDS, on, setOn, begin, place, card, flush, clear, read, stats, W, H, _gl: () => GL };
})();
if (typeof window !== 'undefined') window.SCULPTED112 = SCULPTED112;
