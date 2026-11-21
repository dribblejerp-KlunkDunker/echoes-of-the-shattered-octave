// hands109s — Phase 109, option S for the first-person hands and arms: "Sculpted, lit by the world".
// (For the owner's ruling; not used by the game yet.) Interface: tools/dev/hands109.js. Built by team S.
//
// The hands and arms are real 3D shapes built in code (a jointed hand: a cupped superellipsoid palm, four fingers of
// three tapered segments each, a thumb with its metacarpal and two joints, the wrist, a tapering forearm, a wool sleeve
// with hashed folds and a rolled hem, a flared glove cuff), posed by joint angles, and drawn by the small WebGL1 renderer
// below on an offscreen canvas at twice the size, then halved into the 1152 x 500 canvas the interface asks for.
// The world lights them: the key light (`light.dir`, `light.key`), a hemispheric ambient from `light.amb` (warmer from
// the ground, cooler from the sky), a torch from low in front at night (`light.torch`), a rim light, per-vertex ambient
// occlusion and soft self-shadow (both from sphere proxies of every part), and in the Song pose a point light of the
// Song's colour between the palms. Materials are shaders: skin, leather, mail, wool, steel, glass, nail.
// Pure: no Math.random (a hash), the same arguments give the same pixels. Geometry is cached per pose and look.
'use strict';
const HANDS109S = (() => {
  const W = 1152, H = 500, SS = 2, FOVY = 40 * Math.PI / 180, NEAR = 4, FAR = 400;
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
  // vertex: pos3 nrm3 loc3 uv2 occ2 ex4 = 17 floats. ex: [wear/redness, seam distance (cm), along seam (cm), crease]
  const STRIDE = 17;
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
      g.v.push(...WP[k], ...WN[k], ...LP[k], ...UV[k], 1, 1, ...EX[k]); g.parts.push(part); g.n++;
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
  const POSE = {
    fist: { f: [[92, 120, 76, -3], [94, 122, 76, 0], [96, 122, 74, 3], [98, 120, 72, 6]], t: { z: [-0.83, -0.05, 0.55], pts: [[-3.75, 4.7, -2.7], [-3.0, 7.0, -5.0], [-0.4, 7.6, -5.2]] } },
    grip: { f: [[80, 100, 60, -4], [82, 102, 60, -1], [84, 102, 60, 3], [86, 100, 58, 6]], t: { z: [-0.89, -0.27, 0.36], pts: [[-3.75, 4.9, -2.5], [-3.2, 7.3, -4.7], [-0.9, 8.3, -5.4]] } },
    open: { f: [[6, 8, 5, -9], [4, 6, 4, -2], [6, 8, 5, 5], [9, 10, 6, 12]], t: { d: [-0.72, 0.64, -0.26], z: [-0.55, -0.15, 0.82], f: [10, 12] } },
  };
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
          const fade = clamp((y - 1.2) / 2.0, 0, 1) * clamp((FING[k].at[1] - 0.6 - y) / 1.5, 0, 1);
          td += Math.exp(-Math.pow((x - xt) / 0.34, 2)) * fade;
        }
        z += (skinny ? 0.16 : 0.05) * td * dorsal;
      }
      // leather: three stitched lines on the back
      let seam = 99, along = y, wear = 0;
      if (mat === 'leather' && z > 0.3 && y > 1.6 && y < 6.6) for (const xl of [-1.8, 0.0, 1.8]) seam = Math.min(seam, Math.abs(x - xl));
      if (y > CY + 2.5 && z > 0) wear = clamp((y - CY - 2.5) / 2.0, 0, 1) * clamp(z / C, 0, 1);
      return { p: [x, y, z], uv: [x, y], ex: [skinny ? wear * 0.6 : wear * 0.8, seam, along, 0] };
    };
    grid(sc, handMat, ppart, hf, ID(), 40, 30, palmFn);
    for (let gy = 1.2; gy <= 8.4; gy += 1.8) for (let gx = -3.0; gx <= 3.01; gx += 2.0) sphere(sc, app(hf, [gx, gy, -0.1]), 1.45, ppart);
    // ---- fingers
    const tips = [];
    FING.forEach((fd, k) => {
      const [mcp, pip, dip, spl] = pose.f[k];
      let lf = chain(T(...fd.at), RZ(-spl), RX(-mcp));
      const flex = [mcp, pip, dip];
      for (let s = 0; s < 3; s++) {
        const L = fd.L[s], r0 = fd.r[s], r1 = fd.r[s + 1], bendIn = flex[s], bendOut = s < 2 ? flex[s + 1] : 0;
        const ex = (y, phi, rho) => {
          const dors = Math.max(0, Math.sin(phi));
          const nb = Math.exp(-Math.pow(y / 1.0, 2)), nt = Math.exp(-Math.pow((y - L) / 0.9, 2));
          const knk = (nb * clamp(bendIn / 90, 0, 1) * (s === 0 ? 1.2 : 0.8) + nt * clamp(bendOut / 90, 0, 1) * 0.8) * dors;
          let seam = 99, along = y + s * 5;
          if (mat === 'leather') { const a = Math.min(Math.abs(phi), Math.abs(phi - Math.PI), Math.abs(phi - 2 * Math.PI)); seam = a * rho; }
          const cb = Math.exp(-Math.pow(y / 0.55, 2)), ct = Math.exp(-Math.pow((y - L) / 0.5, 2));
          const crease = (cb * (s === 1 ? 1 : s === 2 ? 0.5 : 0) + ct * (s === 0 ? 1 : s === 1 ? 0.5 : 0)) * dors;
          const tipR = s === 2 ? 0.35 * clamp((y - L * 0.4) / (L * 0.6), 0, 1) : 0;
          return [clamp(knk + tipR, 0, 1), seam, along, crease];
        };
        const mod = (y) => 1 + 0.09 * Math.exp(-Math.pow(y / 0.55, 2)) * (s > 0 ? 1 : 0.4) + 0.06 * Math.exp(-Math.pow((y - L) / 0.55, 2));
        capsule(sc, handMat, W2(lf), lf, L, r0, r1, { sx: s === 0 ? 1.12 : 1.06, sz: 0.94, nu: res.nu, nv: res.nv, mod, ex, pad: s === 2 ? (y) => 0.22 * Math.exp(-Math.pow((y - L * 0.55) / (L * 0.45), 2)) : null });
        if (s === 2 && skinny) {
          // the nail: a thin flattened cap on the back of the last segment
          const nf = chain(lf, T(0, L * 0.58, r1 * 0.80 * 0.94), RX(-8));
          const np = sc.part++, na = r1 * 0.74, nb2 = L * 0.42;
          grid(sc, 'nail', np, W2(nf), nf, 14, 8, (u, v) => {
            const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2, ct = Math.cos(th);
            let x = na * spow(ct, 0.5) * spow(Math.cos(ph), 0.6), y = nb2 * spow(Math.sin(th), 0.5), z = 0.13 * spow(ct, 0.5) * spow(Math.sin(ph), 0.6);
            z -= 0.18 * (x / na) * (x / na); // curved across the finger
            if (v === 0 || v === 1) x = z = 0;
            return { p: [x, y, z], uv: [x, y], ex: [clamp((y / nb2 + 1) / 2, 0, 1), 99, 0, 0] };
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
        const Y = norm(sub(pts[k + 1], pts[k])), Z = norm(sub(Zp, mul(Y, dot(Y, Zp))));
        frames.push(F(pts[k], cross(Y, Z), Y, Z)); Ls.push(len(sub(pts[k + 1], pts[k]))); Zp = Z;
        if (k > 0) fl[k - 1] = Math.acos(clamp(dot(Y, frames[k - 1].Y), -1, 1)) / D2R;
      }
      const rs = [[1.6, 1.2], [1.16, 1.05], [1.06, 0.88]];
      for (let s = 0; s < 3; s++) {
        const L = Ls[s], lf = frames[s];
        const ex = (y, phi, rho) => {
          const dors = Math.max(0, Math.sin(phi)), nt = Math.exp(-Math.pow((y - L) / 0.9, 2)), nb = Math.exp(-Math.pow(y / 0.9, 2));
          let seam = 99; if (mat === 'leather' && s > 0) { const a = Math.min(Math.abs(phi), Math.abs(phi - Math.PI), Math.abs(phi - 2 * Math.PI)); seam = a * rho; }
          return [clamp((nt * fl[s] / 60 + (s > 0 ? nb * fl[s - 1] / 60 : 0)) * dors, 0, 1) * 0.7, seam, y + s * 5, (s > 0 ? nb : 0) * dors];
        };
        const pad = s === 2 ? (y) => 0.3 * Math.exp(-Math.pow((y - L * 0.5) / (L * 0.5), 2)) : s === 0 ? (y) => 0.35 * Math.exp(-Math.pow((y - L * 0.4) / (L * 0.6), 2)) : null;
        capsule(sc, handMat, W2(lf), lf, L, rs[s][0], rs[s][1], { sx: s === 0 ? 1.2 : 1.05, sz: s === 0 ? 0.95 : 0.92, nu: res.nu, nv: res.nv, ex, pad, mod: (y) => 1 + 0.06 * Math.exp(-Math.pow((y - L) / 0.5, 2)) });
        if (s === 2 && skinny) {
          const nf = chain(lf, T(0, L * 0.6, rs[2][1] * 0.82 * 0.92), RX(-8));
          const np = sc.part++, na = rs[2][1] * 0.78, nb2 = L * 0.38;
          grid(sc, 'nail', np, W2(nf), nf, 14, 8, (u, v) => {
            const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2, ct = Math.cos(th);
            let x = na * spow(ct, 0.5) * spow(Math.cos(ph), 0.6), y = nb2 * spow(Math.sin(th), 0.5), z = 0.14 * spow(ct, 0.5) * spow(Math.sin(ph), 0.6);
            z -= 0.2 * (x / na) * (x / na); if (v === 0 || v === 1) x = z = 0;
            return { p: [x, y, z], uv: [x, y], ex: [clamp((y / nb2 + 1) / 2, 0, 1), 99, 0, 0] };
          });
        }
        if (s === 0) thumbMcp = pts[1];
      }
    }
    // ---- inside a fist the fingers press into the palm's pads: fill the hollow so no daylight shows through it
    if (h.pose === 'fist') {
      const lf = T(-0.4, 7.0, -2.7), part = sc.part++;
      grid(sc, handMat, part, W2(lf), lf, 20, 14, (u, v) => {
        const th = -Math.PI / 2 + v * Math.PI, ph = u * Math.PI * 2;
        return { p: [3.3 * Math.cos(th) * Math.cos(ph), 1.9 * Math.sin(th), 1.6 * Math.cos(th) * Math.sin(ph)], uv: [ph, th], ex: [0, 99, 0, 0] };
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
    const rx = (s) => s < 0 ? 2.9 : lerp(2.9, 4.2, sm(clamp(s / 24, 0, 1))) + 0.25 * Math.exp(-Math.pow((s - 19) / 6, 2));
    const rz = (s) => s < 0 ? 1.95 : lerp(1.95, 3.8, sm(clamp(s / 24, 0, 1)));
    const armMat = glass ? 'glass' : mat === 'bare' ? 'skin' : 'leather'; // a gloved wrist is the glove's own
    {
      const part = sc.part++, nu = 30, nv = 36;
      grid(sc, armMat, part, af, afl, nu, nv, (u, v) => {
        const s = -1.6 + v * (FL + 1.6), ph = u * Math.PI * 2;
        let rr = 1; if (s < 0) rr = Math.sqrt(Math.max(0, 1 - Math.pow(s / 1.6, 2)));
        if (v === 0) rr = 0;
        const j = 1;
        // the ulna's knob at the wrist, on the little finger's side
        const knob = 1 + 0.07 * Math.exp(-Math.pow((s - 1.4) / 1.0, 2)) * Math.max(0, Math.cos(ph - 0.5));
        return { p: [rx(s) * Math.cos(ph) * rr * j * knob, s, rz(s) * Math.sin(ph) * rr * j], uv: [ph * 3.2, s], ex: [0, 99, 0, 0] };
      });
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
        const fl = 1.45 * Math.pow(clamp((s - 1.2) / (s1 - 1.2), 0, 1), 1.4);
        const wob = 1 + 0.03 * (vn3(Math.cos(ph) * 2 + 3, Math.sin(ph) * 2, s * 0.4) - 0.5);
        const r = (q) => (q + 0.42 + fl + dr) * wob;
        const seam = Math.min(Math.abs(s - (s1 - 0.75)), Math.abs(ph - 0.2) * 4 + (s < 1 ? 9 : 0));
        return { p: [r(rx(Math.max(s, 0))) * Math.cos(ph), s, r(rz(Math.max(s, 0))) * Math.sin(ph)], uv: [ph * 4, s], ex: [0, v < 0.2 ? 99 : seam, s < s1 - 1.2 ? ph * 4 : s * 3, 0] };
      }, { flip: true });
      for (let s = 0; s < s1; s += 2) sphere(sc, app(af, [0, s, 0]), Math.min(rx(s), rz(s)) + 0.5, part);
    }
    // the wool sleeve: folds from hashed noise, a rolled hem
    if (h.sleeve) {
      const part = sc.part++, s0 = mat === 'bare' ? 2.6 : 4.1, s1 = FL + 2;
      const fold = (ph, s) => {
        const c = Math.cos(ph), sn = Math.sin(ph);
        return 0.75 * (fbm(c * 1.3 + 11, sn * 1.3 + 4, s * 0.16) - 0.5) + 0.35 * Math.sin(s * 0.55 + 2.4 * vn3(c * 1.5, sn * 1.5, s * 0.05 + 3)) * clamp((s - s0 - 3) / 6, 0, 1)
          + 0.25 * (vn3(c * 3.1 + 7, sn * 3.1, s * 0.4) - 0.5);
      };
      grid(sc, 'wool', part, af, afl, 48, 58, (u, v) => {
        const ph = u * Math.PI * 2;
        let s, dr;
        if (v < 0.06) { const t = v / 0.06; s = lerp(s0 + 1.6, s0 + 0.1, t); dr = -0.42; }
        else if (v < 0.14) { const t = (v - 0.06) / 0.08, a = Math.PI * t; s = s0 + 0.1 - Math.sin(a) * 0.36; dr = -0.42 + (1 - Math.cos(a)) * 0.36; }
        else { const t = (v - 0.14) / 0.86; s = lerp(s0 + 0.1, s1, t); dr = 0.3 * Math.exp(-Math.pow((s - s0 - 0.5) / 0.6, 2)); }
        const r = (q) => q + 1.25 + fold(ph, s) + dr + 0.25 * clamp((s - s0) / 20, 0, 1);
        return { p: [r(rx(s)) * Math.cos(ph), s, r(rz(s)) * Math.sin(ph)], uv: [ph * 5, s], ex: [0, 99, 0, v < 0.14 ? 1 : 0] };
      });
    }
    return { tips };
  }

  // ---------------------------------------------------------------- the short sword, in the right hand's frame: the grip
  // across the curled fingers, the blade out past the thumb (local -x), its edges in line with the knuckles
  function buildSword(sc, hf) {
    const G = [0.3, 8.15, -2.55];
    const sf = chain(hf, T(...G)); // sword frame: +x pommel side, -x blade
    const lf0 = T(...G);
    // grip (leather-wrapped), along x: capsule axis is local y, so turn y -> -x
    const gf = chain(sf, T(5.0, 0, 0), RZ(90)), glf = chain(lf0, T(5.0, 0, 0), RZ(90));
    capsule(sc, 'grip', gf, glf, 10.0, 1.32, 1.42, { nu: 20, nv: 18, sx: 1, sz: 0.92 });
    // pommel
    {
      const pf = chain(sf, T(6.3, 0, 0), RZ(90)), plf = chain(lf0, T(6.3, 0, 0), RZ(90));
      capsule(sc, 'iron', pf, plf, 0.6, 1.75, 1.6, { nu: 22, nv: 18, sx: 1, sz: 0.86, mod: (y) => 1 - 0.18 * Math.exp(-Math.pow((y + 1.6) / 0.5, 2)) });
    }
    // crossguard: a bar across, along the edge direction (local y), swelling at the ends
    {
      const cf = chain(sf, T(-5.6, -7.2, 0)), clf = chain(lf0, T(-5.6, -7.2, 0));
      capsule(sc, 'iron', cf, clf, 14.4, 0.78, 0.78, { nu: 16, nv: 26, sx: 0.85, sz: 0.75, mod: (y) => 1 + 0.3 * Math.exp(-Math.pow((y - 0) / 0.9, 2)) + 0.3 * Math.exp(-Math.pow((y - 14.4) / 0.9, 2)) - 0.1 * Math.exp(-Math.pow((y - 7.2) / 2, 2)) });
    }
    // the blade: a lens of bevels with a fuller, flat-shaded faces, from the guard out along -x
    {
      const part = sc.part++, g = group(sc, 'steel'), BL = 43, x0 = -6.2;
      const st = [0, 0.04, 0.3, 0.55, 0.72, 0.84, 0.93, 1.0];
      const hw = (t) => t < 0.72 ? lerp(2.25, 1.75, t / 0.72) : 1.75 * Math.sqrt(Math.max(0, 1 - Math.pow((t - 0.72) / 0.28, 1.6)));
      const th = (t) => lerp(0.36, 0.14, t) * (t > 0.9 ? (1 - t) / 0.1 : 1) + 0.001;
      const fullerOn = (t) => clamp(1 - (t - 0.5) / 0.2, 0, 1) * clamp(t / 0.04, 0, 1);
      // cross-section (y, z, edge flag) around the lens, counter-clockwise seen from the tip
      const sec = (t) => {
        const w = hw(t), z = th(t), f = fullerOn(t);
        const pts = [[w, 0, 1], [w * 0.6, z * 0.66, 0], [w * 0.3, z, 0], [w * 0.17, z - 0.16 * f, 0], [0, z - 0.22 * f, 0], [-w * 0.17, z - 0.16 * f, 0], [-w * 0.3, z, 0], [-w * 0.6, z * 0.66, 0],
          [-w, 0, 1], [-w * 0.6, -z * 0.66, 0], [-w * 0.3, -z, 0], [-w * 0.17, -z + 0.16 * f, 0], [0, -z + 0.22 * f, 0], [w * 0.17, -z + 0.16 * f, 0], [w * 0.3, -z, 0], [w * 0.6, -z * 0.66, 0]];
        return pts;
      };
      const P = st.map((t) => sec(t).map(([y, z, e], i) => ({ w: app(sf, [x0 - t * BL, y, z]), l: app(lf0, [x0 - t * BL, y, z]), e, t, fu: [3, 4, 5, 11, 12, 13].includes(i) ? fullerOn(t) : 0 })));
      const n = P[0].length;
      const mir = det(sf) < 0;
      for (let k = 0; k < st.length - 1; k++) for (let i = 0; i < n; i++) {
        const a = P[k][i], b = P[k][(i + 1) % n], c = P[k + 1][i], d = P[k + 1][(i + 1) % n];
        const quad = [[a, c, b], [b, c, d]];
        for (const q of quad) {
          let nn = cross(sub(q[1].w, q[0].w), sub(q[2].w, q[0].w)); if (len(nn) < 1e-9) continue; nn = norm(nn);
          // outward: away from the blade's axis
          const ctr = app(sf, [x0 - q[0].t * BL, 0, 0]);
          let tri = q; if (dot(nn, sub(q[0].w, ctr)) + dot(nn, sub(q[1].w, ctr)) + dot(nn, sub(q[2].w, ctr)) < 0) { nn = mul(nn, -1); tri = [q[0], q[2], q[1]]; }
          for (const vtx of tri) { g.v.push(...vtx.w, ...nn, ...vtx.l, vtx.t, 0, 1, 1, vtx.e, vtx.fu, 0, 0); g.parts.push(part); g.i.push(g.n); g.n++; }
        }
      }
      void mir;
    }
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
        v[o + 11] = clamp(1 - occ * 0.75, 0.18, 1);
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

  // ---------------------------------------------------------------- the poses (world, cm; the eye at the origin, -z ahead)
  function scenePose(pose, look) {
    const sc = newScene();
    const right = look.hands || 'leather';
    const leftMat = look.glassArm ? 'glass' : right;
    const sleeveR = true, sleeveL = !look.glassArm;
    let song = null;
    const FISTC = [-0.3, 7.2, -1.5]; // a fist's middle, in the hand's frame
    const raisedFist = (m, mat, sleeve) => {
      // the raised fist: knuckles up and towards the middle, the curled fingers and the thumb across them towards us
      const f0 = handFrame([0, 0, 0], [-0.45 * m, 0.75, -0.4], [0.4 * m, -0.2, -0.88], m < 0);
      buildHand(sc, { frame: placeAt(f0, FISTC, m > 0 ? 975 : 177, 290, 36), pose: 'fist', mat, sleeve, arm: [0.36 * m, -0.88, 0.3] });
    };
    const restFist = (m, mat, sleeve, cx, cy, D) => {
      // the resting fist low in the corner, the forearm out of the bottom
      const f0 = handFrame([0, 0, 0], [0.75 * m, 0.3, -0.55], [-0.4 * m, 0.3, -0.85], m > 0);
      buildHand(sc, { frame: placeAt(f0, FISTC, cx, cy, D), pose: 'fist', mat, sleeve, arm: [-0.62 * m, -0.6, 0.5] });
    };
    if (pose === 'fist') {
      raisedFist(1, right, sleeveR);
      restFist(1, leftMat, sleeveL, 245, 392, 39);
    } else if (pose === 'glass') {
      raisedFist(-1, 'glass', false);
      restFist(-1, right, sleeveR, 915, 380, 39);
    } else if (pose === 'sword') {
      // the blade (the hand's -x, past the thumb) rises away up the view, leaning a little left; the palm's side to us
      const hf0 = handFrameXZ([0, 0, 0], mul([0.3, 0.68, -0.67], -1), [0.45, -0.1, -0.88]);
      const hf2 = placeAt(hf0, [0.3, 8.15, -2.55], 985, 350, 42);
      buildHand(sc, { frame: hf2, pose: 'grip', mat: right, sleeve: sleeveR, arm: [0.38, -0.85, 0.36] });
      buildSword(sc, hf2);
      restFist(1, leftMat, sleeveL, 240, 382, 37);
    } else if (pose.startsWith('dbgv')) { // dbgv|yx,yy,yz|zx,zy,zz|pose|left: try an orientation at the raised fist's place
      const [, ys, zs, hp, lft] = pose.split('|'), Y = ys.split(',').map(Number), Z = zs.split(',').map(Number), lf = lft === 'L';
      const f0 = handFrame([0, 0, 0], Y, Z, lf);
      buildHand(sc, { frame: placeAt(f0, FISTC, lf ? 236 : 1000, lf ? 390 : 300, lf ? 33 : 36), pose: hp || 'fist', mat: 'bare', sleeve: true, arm: lf ? [-0.45, -0.62, 0.64] : [0.38, -0.78, 0.5] });
    } else if (pose.startsWith('dbg')) { // dbg-<hand pose>-<view>-<mat>: one right hand, centred, for checking the anatomy
      const [, hp, view, mat] = pose.split('-');
      const V = { back: [[0, 1, 0], [0, 0, 1]], side: [[0, 1, 0], [1, 0, 0]], palm: [[0, 1, 0], [0, 0, -1]], thumb: [[0, 1, 0], [-1, 0, 0]], top: [[0, 0, -1], [0, 1, 0]] }[view] || [[0, 1, 0], [0, 0, 1]];
      const hf = handFrame([0, -9, -36], V[0], V[1], false);
      buildHand(sc, { frame: hf, pose: hp, mat: mat || 'bare', sleeve: true, arm: mul(V[0], -1) });
      if (hp === 'grip') buildSword(sc, hf);
    } else { // song
      // both hands open and raised, backs to us, the palms turned a little towards each other; the Song between them
      const fr = placeAt(handFrame([0, 0, 0], [0.1, 1, -0.12], [0.3, 0.06, 0.95], false), [0, 5, 0], 740, 240, 41);
      const fl = placeAt(handFrame([0, 0, 0], [-0.1, 1, -0.12], [-0.3, 0.06, 0.95], true), [0, 5, 0], 412, 240, 41);
      buildHand(sc, { frame: fr, pose: 'open', mat: right, sleeve: sleeveR, arm: [0.2, -0.97, 0.15] });
      buildHand(sc, { frame: fl, pose: 'open', mat: leftMat, sleeve: sleeveL, arm: [-0.2, -0.97, 0.15] });
      song = mul(add(app(fr, [0, 5.5, -2.5]), app(fl, [0, 5.5, -2.5])), 0.5);
    }
    occlusion(sc);
    return { sc, song };
  }

  // ---------------------------------------------------------------- the renderer
  const VS = `attribute vec3 a_pos, a_nrm, a_loc; attribute vec2 a_uv, a_occ; attribute vec4 a_ex;
uniform mat4 u_proj; varying vec3 v_pos, v_nrm, v_loc; varying vec2 v_uv, v_occ; varying vec4 v_ex;
void main(){ v_pos=a_pos; v_nrm=a_nrm; v_loc=a_loc; v_uv=a_uv; v_occ=a_occ; v_ex=a_ex; gl_Position=u_proj*vec4(a_pos,1.0); }`;
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
  float h = vnoise(v_loc*5.0)*0.006 + vnoise(v_loc*23.0)*0.0022;
  float cr = v_ex.w * pow(abs(sin(v_uv.y*9.0 + vnoise(v_loc*3.0)*2.0)), 10.0); h -= cr*0.06;
  N = bump(N, v_pos, h);
  vec3 alb = pow(u_base, vec3(1.15)) * mix(vec3(1.0), vec3(1.2,0.7,0.64), clamp(v_ex.x,0.0,1.0)*0.75) * (0.9 + 0.2*vnoise(v_loc*1.3)) * (1.0 - cr*0.3);
  float ndl = dot(N,L); vec3 w = vec3(0.5,0.3,0.24);
  vec3 dif = clamp((vec3(ndl)+w)/(1.0+w), 0.0, 1.0); dif *= dif;
  vec3 shc = mix(vec3(sh), vec3(1.0), vec3(0.18,0.06,0.03)*(1.0-sh));
  vec3 Hh = normalize(L+V); float spec = pow(max(dot(N,Hh),0.0), 22.0) * 0.18 * (0.3+0.7*sh);
  float fr = pow(1.0 - max(dot(N,V),0.0), 4.0);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.4, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.35, Ls);
  vec3 col = alb * (u_key*dif*shc + hemi(N)*ao*0.85 + tor*ao + sng) + u_key*spec*sh + (u_key*sh*0.06 + u_amb*0.12)*fr*ao
           + alb*u_rim*rimf(N,V)*1.4 + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),22.0)*0.1;
  gl_FragColor = vec4(tonemap(col), 1.0); }`,
    nail: `void main(){ vec3 N = normalize(v_nrm), V = normalize(-v_pos), L = u_keyDir;
  float ao = v_occ.x, sh = v_occ.y;
  vec3 alb = mix(u_base*vec3(1.05,0.86,0.84), vec3(0.85,0.78,0.72), smoothstep(0.75,0.95,v_ex.x));
  float ndl = max(dot(N,L),0.0); vec3 Hh = normalize(L+V);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.2, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.2, Ls);
  vec3 col = alb*(u_key*ndl*sh + hemi(N)*ao + tor + sng) + u_key*pow(max(dot(N,Hh),0.0),60.0)*0.5*sh + env(reflect(-V,N))*0.05;
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
  vec3 x = (v_loc + vec3(0.37, 0.71, 0.19)) / 3.9;
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
  float seam = 1.0 - smoothstep(wv*0.9, wv*2.3, m);
  vec3 cid = ip + vec3(pm*0.137, pm*0.291, pm*0.073);
  // which face is nearest decides the neighbour; a few edges are bright
  float face = m == bc.x ? 0.0 : m == bc.y ? 1.0 : m == bc.z ? 2.0 : 3.0;
  float bright = seam * step(hsh(ip*1.31 + vec3(face*3.1 + pm*0.7, face, pm)), 0.13);
  vec3 tl = h33(cid*1.91 + vec3(4.0)) - 0.5;
  vec3 N = normalize(N0*0.28 + tl*0.95 + V*0.42);
  float fh = hsh(cid*2.3 + vec3(9.0));
  float ndv = max(dot(N0,V), 0.0), ndl = dot(N,L);
  vec3 Hh = normalize(L+V), R = reflect(-V,N);
  float F = 0.04 + 0.96*pow(1.0 - max(dot(N,V),0.0), 5.0);
  vec3 deep = u_base * (0.2 + 1.3*fh*fh);
  vec3 Lt, Ls; vec3 tor = pl(N, u_torchPos, u_torch, 30.0, 0.0, Lt); vec3 sng = pl(N, u_songPos, u_song, 13.0, 0.3, Ls);
  vec3 body = deep*(u_key*(0.08 + 1.1*max(ndl,0.0))*(0.45+0.55*sh) + hemi(N)*0.8*ao + tor*1.1 + sng*1.6)
            + u_alt*0.25*u_lvl*(0.35 + 0.65*(1.0-ndv));
  vec3 refl = env(R)*u_alt*0.9*F;
  float gl = pow(max(dot(N,Hh),0.0), 300.0)*7.0;
  vec3 col = body + refl + u_key*gl*sh + u_torch*pow(max(dot(N,normalize(Lt+V)),0.0),120.0)*4.0 + u_song*pow(max(dot(N,normalize(Ls+V)),0.0),30.0)*1.2;
  // the rim: bright where the form turns away
  float rim = pow(1.0 - ndv, 6.0);
  col += (u_alt*1.6*u_lvl + u_rim*1.8 + u_torch*0.5) * rim + u_alt*0.3*u_lvl*pow(1.0 - ndv, 2.0);
  col = mix(col, u_base*0.05, seam*0.85);
  col = mix(col, (u_alt*1.3 + vec3(0.35))*u_lvl + u_torch*0.6, bright*(0.5 + 0.5*sh));
  float al = mix(0.76, 0.96, smoothstep(0.08, 0.6, ndv)); al = max(al, seam*0.95);
  vec3 c = tonemap(col);
  gl_FragColor = vec4(c*al, al); }`,
  };

  let GL = null;
  function initGL() {
    if (GL) return GL;
    const cv = document.createElement('canvas'); cv.width = W * SS; cv.height = H * SS;
    const gl = cv.getContext('webgl', { alpha: true, premultipliedAlpha: true, antialias: false, preserveDrawingBuffer: true, depth: true });
    if (!gl) throw new Error('hands109s: no WebGL');
    gl.getExtension('OES_standard_derivatives'); const u32 = gl.getExtension('OES_element_index_uint');
    const sh = (type, src) => { const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s); if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error('hands109s shader: ' + gl.getShaderInfoLog(s)); return s; };
    const vs = sh(gl.VERTEX_SHADER, VS), progs = {};
    for (const [k, body] of Object.entries(FS)) {
      const p = gl.createProgram(); gl.attachShader(p, vs); gl.attachShader(p, sh(gl.FRAGMENT_SHADER, FS_HEAD + body));
      ['a_pos', 'a_nrm', 'a_loc', 'a_uv', 'a_occ', 'a_ex'].forEach((n, i) => gl.bindAttribLocation(p, i, n));
      gl.linkProgram(p); if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error('hands109s link: ' + gl.getProgramInfoLog(p));
      const U = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
      for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); U[a.name] = gl.getUniformLocation(p, a.name); }
      progs[k] = { p, U };
    }
    GL = { cv, gl, progs, u32 };
    return GL;
  }
  function upload(sc) {
    const { gl, u32 } = initGL();
    for (const g of Object.values(sc.groups)) {
      if (g.buf) continue;
      g.buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.v), gl.DYNAMIC_DRAW);
      g.ibuf = gl.createBuffer(); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ibuf);
      if (g.n > 65535 && !u32) throw new Error('hands109s: too many vertices');
      g.big = g.n > 65535; gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, g.big ? new Uint32Array(g.i) : new Uint16Array(g.i), gl.STATIC_DRAW);
      g.count = g.i.length;
    }
  }
  function reshadow(sc, L) {
    const { gl } = initGL();
    shadows(sc, L);
    for (const g of Object.values(sc.groups)) { gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(g.v), gl.DYNAMIC_DRAW); }
  }
  const lin = (c, k) => [Math.pow(c[0] / 255, 2.2) * k, Math.pow(c[1] / 255, 2.2) * k, Math.pow(c[2] / 255, 2.2) * k];
  function proj() {
    const f = 1 / TF;
    return new Float32Array([f / ASPECT, 0, 0, 0, 0, f, 0, 0, 0, 0, (FAR + NEAR) / (NEAR - FAR), -1, 0, 0, 2 * FAR * NEAR / (NEAR - FAR), 0]);
  }
  const toScreen = (p) => [(p[0] / (-p[2] * TF * ASPECT) + 1) * W / 2, (1 - p[1] / (-p[2] * TF)) * H / 2];

  const CACHE = {};
  function render(pose, look, light) {
    look = look || {}; light = light || { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null };
    if (!['sword', 'fist', 'glass', 'song'].includes(pose) && !/^dbg/.test(pose)) pose = 'fist';
    if (/^dbgv/.test(pose)) look = Object.assign({}, look, { hands: 'bare' });
    const key = pose + '|' + (look.hands || 'leather') + '|' + (look.glassArm ? 1 : 0);
    let E = CACHE[key];
    if (!E) { E = CACHE[key] = scenePose(pose, look); upload(E.sc); }
    const L = norm(light.dir || [-0.45, 0.7, 0.55]);
    const lkey = L.map((x) => x.toFixed(4)).join(',');
    if (E.lkey !== lkey) { reshadow(E.sc, L); E.lkey = lkey; }
    const { gl, cv, progs } = initGL();
    gl.viewport(0, 0, W * SS, H * SS);
    gl.clearColor(0, 0, 0, 0); gl.clearDepth(1); gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    // the world's light
    const night = !!light.torch;
    const keyc = lin(light.key || [255, 244, 226], night ? 2.2 : 2.1), amb = lin(light.amb || [120, 132, 150], night ? 2.4 : 1.05);
    const torch = light.torch ? lin(light.torch, 1.5) : [0, 0, 0];
    const skyLin = lin((light.amb || [120, 132, 150]).map((x) => Math.min(255, x * 1.3)), 1.0);
    const horLin = lin((light.key || [255, 244, 226]).map((x, i) => Math.min(255, (x * 0.55 + (light.amb || [120, 132, 150])[i] * 0.6))), 1.0);
    const gndLin = night ? [0.012, 0.01, 0.009] : lin([118, 92, 66], 0.9);
    const rim = night ? mul(lin(light.key, 1.0), 1.6) : add(mul(lin(light.amb, 1), 1.1), mul(lin(light.key, 1), 0.35));
    const songOn = pose === 'song' && look.song && E.song;
    const songc = songOn ? lin(look.song, 14.0) : [0, 0, 0];
    const P = proj();
    const mats = {
      skin: { base: lin(look.skin || [214, 170, 136], 1), alt: [0, 0, 0] },
      nail: { base: lin(look.skin || [214, 170, 136], 1), alt: [0, 0, 0] },
      leather: { base: lin([96, 62, 40], 1), alt: lin([150, 112, 80], 1) },
      grip: { base: lin([74, 48, 32], 1), alt: [0, 0, 0] },
      mail: { base: lin([170, 172, 178], 1), alt: [0, 0, 0] },
      wool: { base: lin(look.sleeve || [92, 78, 62], 1), alt: [0, 0, 0] },
      steel: { base: lin([214, 218, 224], 1), alt: [0, 0, 0] },
      iron: { base: lin([150, 140, 128], 1), alt: [0, 0, 0] },
      glass: { base: lin([30, 104, 205], 1), alt: lin([120, 205, 255], 1) },
    };
    const order = ['wool', 'skin', 'nail', 'leather', 'mail', 'grip', 'iron', 'steel', 'glass'];
    for (const m of order) {
      const g = E.sc.groups[m]; if (!g) continue;
      const pr = progs[m], U = pr.U; gl.useProgram(pr.p);
      if (m === 'glass') { gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA); } else gl.disable(gl.BLEND);
      gl.uniformMatrix4fv(U.u_proj, false, P);
      const u3 = (n, v) => { if (U[n]) gl.uniform3fv(U[n], v); };
      u3('u_keyDir', L); u3('u_key', keyc); u3('u_amb', amb); u3('u_torchPos', [7, -30, -16]); u3('u_torch', torch);
      u3('u_songPos', E.song || [0, 0, -40]); u3('u_song', songc); u3('u_rimDir', norm([0.55, 0.45, -0.7])); u3('u_rim', rim);
      u3('u_sky', skyLin); u3('u_hor', horLin); u3('u_gnd', gndLin); u3('u_base', mats[m].base); u3('u_alt', mats[m].alt);
      if (U.u_exposure) gl.uniform1f(U.u_exposure, night ? 1.0 : 1.05);
      if (U.u_lvl) gl.uniform1f(U.u_lvl, night ? 0.4 : 1.0);
      gl.bindBuffer(gl.ARRAY_BUFFER, g.buf); gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ibuf);
      const sz = [3, 3, 3, 2, 2, 4]; let off = 0;
      for (let i = 0; i < 6; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, sz[i], gl.FLOAT, false, STRIDE * 4, off * 4); off += sz[i]; }
      gl.drawElements(gl.TRIANGLES, g.count, g.big ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
    }
    gl.disable(gl.BLEND);
    // halve into the interface's canvas
    const out = document.createElement('canvas'); out.width = W; out.height = H;
    const x = out.getContext('2d'); x.imageSmoothingEnabled = true; x.imageSmoothingQuality = 'high';
    x.drawImage(cv, 0, 0, W, H);
    // the Song's glow between the palms
    if (songOn) {
      const [sx, sy] = toScreen(E.song), c = look.song;
      x.save(); x.globalCompositeOperation = 'lighter';
      const gr = x.createRadialGradient(sx, sy, 0, sx, sy, 210);
      gr.addColorStop(0, `rgba(${c[0]},${c[1]},${c[2]},0.7)`); gr.addColorStop(0.15, `rgba(${c[0]},${c[1]},${c[2]},0.38)`);
      gr.addColorStop(0.45, `rgba(${c[0]},${c[1]},${c[2]},0.12)`); gr.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      x.fillStyle = gr; x.fillRect(sx - 210, sy - 210, 420, 420);
      const core = x.createRadialGradient(sx, sy, 0, sx, sy, 46);
      core.addColorStop(0, 'rgba(255,250,225,0.95)'); core.addColorStop(0.35, `rgba(${c[0]},${c[1]},${c[2]},0.5)`); core.addColorStop(1, `rgba(${c[0]},${c[1]},${c[2]},0)`);
      x.fillStyle = core; x.fillRect(sx - 46, sy - 46, 92, 92);
      x.restore();
    }
    return out;
  }
  return { render, _toScreen: toScreen, _scene: scenePose };
})();
if (typeof window !== 'undefined') window.HANDS109S = HANDS109S;
