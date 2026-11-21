// hands109x — Phase 109, an option for the first-person hands and arms (for the owner's ruling; not used by the game yet).
// Interface: tools/dev/hands109.js. Built by team X: pixel art.
//
// How it is made: the hands, arms, sleeves and the sword are built in 3D from simple solids (tapered capsules, ellipsoids
// and flat faces) in centimetres, posed, and rasterised at a third of the view (384 x 167) into an index buffer: every
// pixel knows its material, its part, its depth and its surface normal. Rules then shade it the way a pixel artist would:
// a small hue-shifted palette per material, light from the upper left, a cast shadow where a nearer part stands toward the
// light, selective outlines (dark on the shadow side, a darker tone of the local colour on the lit side), inner lines
// only where one form overlaps another, a clean-up pass for stray pixels, and hand-placed-looking details (seams and
// stitches, creases, nails, tendons, mail rings, the fuller, the grip wrap). The glass arm is cut into flat facets.
// The low picture is scaled up three times with nearest-neighbour, so every pixel is a crisp 3 x 3 block.
// Pure: no Math.random, no images, no fonts; the same arguments always give the same pixels.
'use strict';
const HANDS109X = (() => {
  const W = 384, H = 167, SC = 3, OW = 1152, OH = 500;
  const hash = (a, b) => { let n = Math.imul(a, 374761393) + Math.imul(b, 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

  // ---------------------------------------------------------------- vectors
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const D2R = Math.PI / 180;
  // rotate v about unit axis k by angle a (Rodrigues)
  const rot = (v, k, a) => { const c = Math.cos(a), s = Math.sin(a); return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))); };

  // ---------------------------------------------------------------- colour
  function rgb2hsl(c) {
    const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    if (s === 0) return [l * 255, l * 255, l * 255].map(Math.round);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  // a hue-shifted ramp: index bi is the base colour; shadows turn by hs degrees (redder, cooler), lights by hl (yellower)
  function ramp(rgb, n, bi, o) {
    const [h, s, l] = rgb2hsl(rgb), out = [];
    for (let i = 0; i < n; i++) {
      let hh = h, ss = s, ll = l;
      if (i < bi) { const t = (bi - i) / bi; hh = h + o.hs * t; ll = l + (o.lo - l) * t; ss = s * (1 + (o.ss == null ? 0.15 : o.ss) * t); }
      else if (i > bi) { const t = (i - bi) / (n - 1 - bi); hh = h + o.hl * t; ll = l + (o.hi - l) * t; ss = s * (1 - (o.sl == null ? 0.3 : o.sl) * t); }
      out.push(hsl2rgb(hh, ss, ll));
    }
    return out;
  }
  const hex = (s) => s.map((x) => [parseInt(x.slice(1, 3), 16), parseInt(x.slice(3, 5), 16), parseInt(x.slice(5, 7), 16)]);
  const mix = (a, b, t) => [0, 1, 2].map((i) => Math.round(a[i] + (b[i] - a[i]) * t));

  // ---------------------------------------------------------------- materials
  const M = { NONE: 0, SKIN: 1, LEATHER: 2, MAIL: 3, WOOL: 4, STEEL: 5, GLASS: 6, WRAP: 7, IRON: 8, CUFF: 9 };
  // per material: the diffuse cut points on n.L (giving tones 1..k), whether the top tone is a highlight, and its spec cut
  const SHADE = {
    [M.SKIN]: { cuts: [-0.25, 0.1, 0.45, 0.8], spec: 0.95, top: 6 },
    [M.LEATHER]: { cuts: [-0.2, 0.2, 0.62], spec: 0.985, top: 5 },
    [M.CUFF]: { cuts: [-0.2, 0.18, 0.52], spec: 0.93, top: 5 },
    [M.MAIL]: { cuts: [-0.25, 0.3], spec: 2, top: 4 },
    [M.WOOL]: { cuts: [-0.25, 0.12, 0.5], spec: 2, top: 4 },
    [M.STEEL]: { cuts: [-0.05, 0.3, 0.6], spec: 0.9, top: 5 },
    [M.IRON]: { cuts: [-0.1, 0.3, 0.68], spec: 0.96, top: 5 },
    [M.WRAP]: { cuts: [-0.15, 0.25, 0.6], spec: 2, top: 5 },
    [M.GLASS]: { cuts: [-0.45, -0.1, 0.22, 0.52], spec: 0.9, top: 6 },
  };
  function palettes(look) {
    const skin = look.skin || [214, 170, 136], sleeve = look.sleeve || [92, 78, 62];
    const P = [];
    P[M.SKIN] = ramp(skin, 7, 4, { hs: -14, hl: 8, lo: 0.14, hi: 0.8, ss: 0.32, sl: -0.15 });
    P.skinRed = ramp(mix(skin, [206, 96, 84], 0.38), 7, 4, { hs: -12, hl: 8, lo: 0.13, hi: 0.8, ss: 0.5, sl: -0.05 });
    P[M.LEATHER] = ramp([112, 68, 38], 6, 3, { hs: -16, hl: 12, lo: 0.08, hi: 0.56, ss: 0.2, sl: 0.2 });
    P[M.CUFF] = ramp([86, 54, 34], 6, 3, { hs: -16, hl: 12, lo: 0.06, hi: 0.48, ss: 0.2, sl: 0.2 });
    P[M.WRAP] = ramp([84, 52, 34], 6, 3, { hs: -14, hl: 14, lo: 0.06, hi: 0.52, ss: 0.15, sl: 0.2 });
    P[M.MAIL] = hex(['#16181f', '#363a46', '#61687a', '#9aa2b2', '#dde3ec']);
    P[M.WOOL] = ramp(sleeve, 5, 3, { hs: -18, hl: 10, lo: 0.08, hi: 0.5, ss: 0.15, sl: 0.2 });
    P[M.STEEL] = hex(['#171b27', '#384157', '#64718c', '#9eacc2', '#d4e0ec', '#fbfdff']);
    P.sky = hex(['#1e2433', '#46536a', '#8c8579', '#93abc6', '#c6d8ea', '#ffffff']);
    P[M.IRON] = hex(['#141419', '#2e2f38', '#545766', '#868a99', '#bcc0cb', '#eef0f4']);
    P[M.GLASS] = hex(['#061230', '#0c2a62', '#144596', '#1f63bf', '#3388dc', '#6cbcf2', '#c8f4ff']);
    return P;
  }

  // ---------------------------------------------------------------- posing
  // a hand frame: Y along the fingers, Z out of the back of the hand, X toward the little finger (right-handed)
  function frame(fingerDir, dorsalDir) {
    const Y = norm(fingerDir); let Z = norm(dorsalDir); Z = norm(sub(Z, mul(Y, dot(Z, Y)))); const X = cross(Y, Z);
    return { X, Y, Z };
  }
  // P: { f: frame, s: pixels per cm, ax, ay: the wrist on screen, z0, mirror, D: camera distance (cm) }
  const toWorld = (P, l) => { const f = P.f; let w = add(add(mul(f.X, l[0]), mul(f.Y, l[1])), mul(f.Z, l[2])); if (P.roll) { const c = Math.cos(P.roll * D2R), sn = Math.sin(P.roll * D2R); w = [w[0] * c - w[1] * sn, w[0] * sn + w[1] * c, w[2]]; } w = [w[0], w[1], w[2] + (P.z0 || 0)]; if (P.mirror) w[0] = -w[0]; return w; };
  const proj = (P, w) => { const k = P.D / (P.D - w[2]); return [P.ax + P.s * k * w[0], P.ay - P.s * k * w[1], w[2], k]; };

  // ---------------------------------------------------------------- the scene
  function Scene() { return { prims: [], lines: [], spots: [], gid: 1 }; }
  // tapered capsule in hand-local cm
  function cap(S, P, a, b, ra, rb, mat, grp, tag) {
    S.prims.push({ k: 'cap', P, a: toWorld(P, a), b: toWorld(P, b), ra, rb, mat, grp, tag: tag || null });
  }
  function ell(S, P, c, ax, mat, grp, tag) { // ax: three local axis vectors (their lengths are the radii)
    const wc = toWorld(P, c), o = toWorld(P, [0, 0, 0]);
    const e = ax.map((v) => sub(toWorld(P, v), o));
    S.prims.push({ k: 'ell', P, c: wc, e, mat, grp, tag: tag || null });
  }
  function tri(S, P, a, b, c, mat, grp, tag, uv) {
    S.prims.push({ k: 'tri', P, p: [toWorld(P, a), toWorld(P, b), toWorld(P, c)], mat, grp, tag: tag || null, uv: uv || [[0, 0], [0, 0], [0, 0]] });
  }
  // a line drawn on the surface: points in hand-local cm; mode: 'dark' | 'light' | 'stitch' | 'crease' | 'nail'
  function line(S, P, pts, mode, grp, opt) { S.lines.push({ P, pts: pts.map((p) => toWorld(P, p)), mode, grp, opt: opt || {} }); }
  function spot(S, P, c, r, mode, grp) { S.spots.push({ P, c: toWorld(P, c), r, mode, grp }); }

  // ---------------------------------------------------------------- the hand, in cm (right hand; the left is mirrored)
  const FING = [ // knuckle (x, y, z), segment lengths, radii
    { k: [-2.85, 9.55, 0.2], L: [4.0, 2.4, 2.05], r: [0.98, 0.88, 0.8] },
    { k: [-0.95, 10.05, 0.25], L: [4.5, 2.8, 2.25], r: [1.02, 0.92, 0.83] },
    { k: [0.95, 9.7, 0.2], L: [4.2, 2.65, 2.15], r: [0.97, 0.87, 0.79] },
    { k: [2.75, 8.85, 0.05], L: [3.35, 1.95, 1.85], r: [0.84, 0.76, 0.7] },
  ];
  // the joints of one finger: flexion angles (degrees) at the three joints, spread (degrees, + toward the little finger)
  function fingerJoints(fi, flex, spread) {
    const F = FING[fi]; const pts = [F.k]; let th = 0, p = F.k; const ph = spread * D2R;
    for (let j = 0; j < 3; j++) {
      th += flex[j] * D2R;
      const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph) * Math.cos(th), -Math.sin(th)];
      p = add(p, mul(d, F.L[j])); pts.push(p);
    }
    return pts;
  }

  // o: { curl: 'fist'|'grip'|'open', hand: material, glass, bare, sleeve: bool, cuff: bool, foreLen }
  function addHand(S, P, o) {
    S.lastP = P;
    const hm = o.hand, g = S.gid; S.gid += 20;
    const G = { palm: g, f: [g + 1, g + 2, g + 3, g + 4], thumb: g + 5, wrist: g + 6, cuff: g + 7, hem: g + 8, sleeve: g + 9 };
    const curl = o.curl;
    const flex = curl === 'fist' ? [[86, 102, 66], [88, 102, 64], [90, 100, 62], [92, 98, 60]]
      : curl === 'grip' ? [[74, 96, 52], [80, 96, 52], [84, 94, 52], [88, 92, 50]]
        : [[6, 10, 6], [4, 8, 5], [6, 9, 6], [10, 12, 8]];
    const spread = curl === 'open' ? [-9, -2, 5, 12] : [-2, 0, 1, 3];
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const J = fingerJoints(i, flex[i], spread[i]), F = FING[i];
      fingers.push(J);
      // the knuckle head, then the three segments
      cap(S, P, J[0], J[1], F.r[0] * 1.05, F.r[1], hm, G.f[i], { finger: i, seg: 0 });
      cap(S, P, J[1], J[2], F.r[1], F.r[2], hm, G.f[i], { finger: i, seg: 1 });
      cap(S, P, J[2], J[3], F.r[2], F.r[2] * 0.82, hm, G.f[i], { finger: i, seg: 2 });
      ell(S, P, add(F.k, [0, -0.35, 0.2]), [[F.r[0] * 1.08, 0, 0], [0, F.r[0] * 1.15, 0], [0, 0, F.r[0] * 1.05]], hm, G.palm, { knuckle: i });
    }
    // the palm and the heel of the hand
    ell(S, P, [-0.05, 5.0, -0.15], [[4.0, 0, 0], [0, 5.5, 0], [0, 0, 1.5]], hm, G.palm, { palm: 1 });
    ell(S, P, [2.6, 3.6, -0.6], [[1.45, 0, 0], [0, 3.2, 0], [0, 0, 1.15]], hm, G.palm, { palm: 1 });
    // the thumb: its root (thenar), metacarpal, proximal and distal
    const cmc = [-2.2, 1.4, -0.6];
    let tm, ti, tt;
    if (curl === 'open') { tm = [-4.3, 5.0, -1.1]; ti = [-5.7, 7.4, -1.0]; tt = [-6.5, 9.5, -0.8]; ell(S, P, [-3.3, 6.1, -0.55], [[1.25, 0, 0], [0, 2.1, 0], [0, 0, 0.7]], hm, G.palm, { palm: 1 }); }
    else if (curl === 'grip') { tm = [-4.5, 5.6, -3.4]; ti = [-3.6, 8.3, -5.6]; tt = [-1.2, 9.1, -5.9]; }
    else { tm = [-4.4, 5.5, -3.1]; ti = [-3.5, 8.1, -5.1]; tt = [-0.8, 8.6, -5.2]; }
    ell(S, P, [-2.3, 3.4, -1.1], [[1.6, 0, 0], [0, 2.6, 0], [0, 0, 1.3]], hm, G.palm, { palm: 1 });
    cap(S, P, cmc, tm, 1.5, 1.22, hm, G.thumb, { thumb: 0 });
    cap(S, P, tm, ti, 1.18, 1.08, hm, G.thumb, { thumb: 1 });
    cap(S, P, ti, tt, 1.06, 0.86, hm, G.thumb, { thumb: 2 });
    // the wrist and the forearm; the wrist may bend (o.dev: toward the little finger, o.flexW: toward the palm)
    const fl = o.foreLen || 26, fm = o.glass ? M.GLASS : o.bare ? M.SKIN : hm;
    const piv = [0, 0.8, -0.2];
    const fa = (q) => { let r = sub(q, piv); if (o.dev) r = rot(r, [0, 0, 1], o.dev * D2R); if (o.flexW) r = rot(r, [1, 0, 0], o.flexW * D2R); return add(piv, r); };
    cap(S, P, [0, 1.6, -0.25], fa([0, -1.5, -0.15]), 2.35, 2.25, fm, G.wrist, { fore: 1 });
    cap(S, P, fa([0, -1.5, -0.15]), fa([0.1, -fl, 0.2]), 2.25, 3.25, fm, G.wrist, { fore: 1 });
    // glove cuff, flared
    if (o.cuff) {
      const cm = M.CUFF;
      cap(S, P, fa([0, 0.2, -0.2]), fa([0, -5.6, 0]), 2.75, 3.5, cm, G.cuff, { cuff: 1 });
      const ring = (y, r) => { const pts = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2; pts.push(fa([Math.cos(a) * r, y, Math.sin(a) * r * 0.95])); } return pts; };
      line(S, P, ring(-4.9, 3.42), 'dark', G.cuff);
      line(S, P, ring(-0.6, 2.86), 'stitch', G.cuff);
    }
    if (o.sleeve) {
      cap(S, P, fa([0, -6.4, 0]), fa([0, -7.9, 0.05]), 3.95, 4.1, M.WOOL, G.hem, { hem: 1 });
      cap(S, P, fa([0, -7.9, 0.05]), fa([0.2, -fl - 6, 0.4]), 4.1, 5.6, M.WOOL, G.sleeve, { sleeve: 1 });
    }
    // details on the back of the hand
    const dors = (x, y) => [x, y, 1.42 * Math.sqrt(Math.max(0, 1 - (x / 4.0) ** 2 - ((y - 5) / 5.5) ** 2)) - 0.1];
    if (hm === M.LEATHER || hm === M.MAIL) {
      // the glove's seams: down the back from between the knuckles to the cuff, and the side of the index finger
      for (const sx of [-1.9, 0.0, 1.85]) line(S, P, [dors(sx * 0.9, 9.0), dors(sx * 0.72, 6.5), dors(sx * 0.5, 3.6)], hm === M.MAIL ? 'none' : 'stitch', G.palm);
      for (let i = 0; i < 4; i++) {
        const J = fingers[i], F = FING[i];
        // knuckle creases across the dorsal side of the middle joint
        const c = J[2], d = norm(sub(J[2], J[1])), up = norm(cross(d, [1, 0, 0]));
        const zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d))));
        const rr = F.r[1] * 1.02;
        line(S, P, [add(add(J[1], mul(zc, rr)), [-0.5, 0, 0]), add(add(J[1], mul(zc, rr)), [0.5, 0, 0])], 'crease', G.f[i]);
        void c; void up;
      }
      for (let i = 0; i < 4; i++) spot(S, P, add(FING[i].k, [0, 0.1, 1.1]), 0.42, 'wear', G.palm);
    }
    if (hm === M.SKIN) {
      // tendons from the knuckles toward the wrist, a little redness at the knuckles, the nails
      for (let i = 0; i < 4; i++) {
        const k = FING[i].k;
        line(S, P, [dors(k[0] * 0.95, k[1] - 1.2), dors(k[0] * 0.7, 6.0), dors(k[0] * 0.32, 2.6)], 'tendon', G.palm);
        spot(S, P, add(k, [0, 0.1, 1.0]), 0.95, 'red', G.palm);
        const J = fingers[i];
        spot(S, P, add(J[1], [0, 0.2, 0.5]), 0.45, 'red', G.f[i]);
        // the nail: on the dorsal side of the last segment, near its tip
        const d = norm(sub(J[3], J[2])), zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d))));
        const n0 = add(lerp3(J[2], J[3], 0.45), mul(zc, FING[i].r[2] * 0.85)), n1 = add(lerp3(J[2], J[3], 0.92), mul(zc, FING[i].r[2] * 0.62));
        line(S, P, [n0, n1], 'nail', G.f[i]);
      }
      // the thumbnail
      const d = norm(sub(tt, ti));
      const side = curl === 'open' ? [0.25, -0.2, 1] : [-0.75, 0.1, 0.6];
      const zc = norm(sub(side, mul(d, dot(side, d))));
      line(S, P, [add(lerp3(ti, tt, 0.5), mul(zc, 0.85)), add(lerp3(ti, tt, 0.92), mul(zc, 0.62))], 'nail', G.thumb);
    }
    if (hm === M.LEATHER) {
      // the thumb's seam and the side seam of the index finger
      line(S, P, [add(tm, [0, 0, 1.0]), add(ti, [0.2, 0, 0.95]), add(lerp3(ti, tt, 0.7), [0.2, 0, 0.85])], 'dark', G.thumb);
    }
    return { G, fingers, thumb: [cmc, tm, ti, tt] };
  }

  // the short sword, in the right hand's frame: the grip runs along the hand's X through the curled fingers
  function addSword(S, P0) {
    const g = S.gid; S.gid += 10;
    const gy = 9.05, gz = -2.75, gx0 = 4.6, gx1 = -4.35; // grip from the little finger's side to the guard
    // the grip lies a little across the palm: the sword turns about the back of the hand's axis
    const tilt = 15 * D2R, ctr = [0, gy, gz];
    const P = Object.assign({}, P0);
    const tw = (q) => add(ctr, rot(sub(q, ctr), [0, 0, 1], -tilt));
    const C = (a, b, ra, rb, m, gg, tag) => cap(S, P, tw(a), tw(b), ra, rb, m, gg, tag);
    C([gx0, gy, gz], [gx1, gy, gz], 1.3, 1.3, M.WRAP, g, { grip: 1 });
    // the pommel
    ell(S, P, tw([gx0 + 1.45, gy, gz]), [[1.35, 0, 0], [0, 1.6, 0], [0, 0, 1.6]].map((v) => rot(v, [0, 0, 1], -tilt)), M.IRON, g + 1, {});
    C([gx0 + 2.6, gy, gz], [gx0 + 3.1, gy, gz], 0.6, 0.45, M.IRON, g + 1, {});
    // the crossguard: a bar across the blade's width, its ends a little swollen
    const qx = gx1 - 0.55, qw = 4.4;
    C([qx, gy - qw, gz], [qx, gy + qw, gz], 0.72, 0.72, M.IRON, g + 2, {});
    C([qx, gy - qw - 0.2, gz], [qx, gy - qw + 0.5, gz], 0.82, 0.78, M.IRON, g + 2, {});
    C([qx, gy + qw - 0.5, gz], [qx, gy + qw + 0.2, gz], 0.78, 0.82, M.IRON, g + 2, {});
    C([qx - 0.2, gy, gz], [qx - 0.9, gy, gz], 1.1, 0.75, M.IRON, g + 2, {}); // the ricasso block
    // the blade: flat faces (+Z and -Z), its width along Y, a ridge down the middle; two bevels per face
    const b0 = qx - 0.7, L = 33, tipL = 6.5, w0 = 1.85, w1 = 1.5, t = 0.3;
    const base = b0, sh = b0 - (L - tipL), tip = b0 - L;
    const U = (x) => (base - x) / L;
    for (const s of [1, -1]) {
      const cz = gz + s * t;
      const c0 = tw([base, gy, cz]), c1 = tw([sh, gy, cz]), ct = tw([tip, gy, gz]);
      const eL0 = tw([base, gy - w0, gz]), eL1 = tw([sh, gy - w1, gz]), eR0 = tw([base, gy + w0, gz]), eR1 = tw([sh, gy + w1, gz]);
      tri(S, P, c0, eL0, eL1, M.STEEL, g + 3, { blade: -1 }, [[U(base), 0], [U(base), -1], [U(sh), -1]]);
      tri(S, P, c0, eL1, c1, M.STEEL, g + 3, { blade: -1 }, [[U(base), 0], [U(sh), -1], [U(sh), 0]]);
      tri(S, P, c1, eL1, ct, M.STEEL, g + 3, { blade: -1 }, [[U(sh), 0], [U(sh), -1], [1, 0]]);
      tri(S, P, c0, eR1, eR0, M.STEEL, g + 3, { blade: 1 }, [[U(base), 0], [U(sh), 1], [U(base), 1]]);
      tri(S, P, c0, c1, eR1, M.STEEL, g + 3, { blade: 1 }, [[U(base), 0], [U(sh), 0], [U(sh), 1]]);
      tri(S, P, c1, ct, eR1, M.STEEL, g + 3, { blade: 1 }, [[U(sh), 0], [1, 0], [U(sh), 1]]);
    }
    // the fuller: a groove down the first two thirds of the blade, on both faces (the depth test keeps the near one)
    for (const s of [1, -1]) {
      void s;
    }
    // the grip's leather wrap: a spiral of dark lines
    for (let k = 0; k < 7; k++) {
      const pts = []; for (let j = 0; j <= 10; j++) { const a = j / 10 * Math.PI * 2, x = gx0 - 0.4 - k * 1.25 - j / 10 * 1.25; if (x < gx1 + 0.3) break; pts.push(tw([x, gy + Math.cos(a) * 1.32, gz + Math.sin(a) * 1.32])); }
      if (pts.length > 1) line(S, P, pts, 'dark', g);
    }
    return { g };
  }

  // ---------------------------------------------------------------- rasterising
  function raster(S) {
    const N = W * H;
    const B = {
      depth: new Float32Array(N).fill(-1e9), nx: new Float32Array(N), ny: new Float32Array(N), nz: new Float32Array(N),
      mat: new Uint8Array(N), grp: new Int32Array(N), u: new Float32Array(N), v: new Float32Array(N), prim: new Int32Array(N).fill(-1),
    };
    const put = (i, z, nx, ny, nz, p, pi, u, v) => {
      if (z <= B.depth[i]) return;
      B.depth[i] = z; B.nx[i] = nx; B.ny[i] = ny; B.nz[i] = nz; B.mat[i] = p.mat; B.grp[i] = p.grp; B.u[i] = u; B.v[i] = v; B.prim[i] = pi;
    };
    S.prims.forEach((p, pi) => {
      const P = p.P;
      if (p.k === 'cap') {
        const A = proj(P, p.a), Bp = proj(P, p.b);
        const Ra = p.ra * P.s * A[3], Rb = p.rb * P.s * Bp[3];
        const x0 = Math.max(0, Math.floor(Math.min(A[0] - Ra, Bp[0] - Rb))), x1 = Math.min(W - 1, Math.ceil(Math.max(A[0] + Ra, Bp[0] + Rb)));
        const y0 = Math.max(0, Math.floor(Math.min(A[1] - Ra, Bp[1] - Rb))), y1 = Math.min(H - 1, Math.ceil(Math.max(A[1] + Ra, Bp[1] + Rb)));
        const dx = Bp[0] - A[0], dy = Bp[1] - A[1], l2 = dx * dx + dy * dy || 1e-6, len = Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]);
        const il = 1 / Math.sqrt(l2);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          let t = ((px - A[0]) * dx + (py - A[1]) * dy) / l2; t = t < 0 ? 0 : t > 1 ? 1 : t;
          const cx = A[0] + dx * t, cy = A[1] + dy * t, r = Ra + (Rb - Ra) * t;
          const ox = px - cx, oy = py - cy, d2 = ox * ox + oy * oy;
          if (d2 >= r * r) continue;
          const h = Math.sqrt(r * r - d2), k = A[3] + (Bp[3] - A[3]) * t;
          const z = A[2] + (Bp[2] - A[2]) * t + h / (P.s * k);
          // v: the signed angle around the axis (seen from the front), u: cm along the axis
          const side = (ox * (-dy) + oy * dx) * il;
          put(y * W + x, z, ox / r, -oy / r, h / r, p, pi, t * len, Math.asin(Math.max(-1, Math.min(1, side / r))));
        }
      } else if (p.k === 'ell') {
        const C = proj(P, p.c), k = C[3];
        // inverse of the axis matrix (columns e0, e1, e2)
        const [a, b, c] = p.e;
        const det = dot(a, cross(b, c));
        const inv = [mul(cross(b, c), 1 / det), mul(cross(c, a), 1 / det), mul(cross(a, b), 1 / det)]; // rows
        const rmax = Math.max(Math.hypot(...a), Math.hypot(...b), Math.hypot(...c)) * P.s * k;
        const x0 = Math.max(0, Math.floor(C[0] - rmax)), x1 = Math.min(W - 1, Math.ceil(C[0] + rmax));
        const y0 = Math.max(0, Math.floor(C[1] - rmax)), y1 = Math.min(H - 1, Math.ceil(C[1] + rmax));
        const bz = [inv[0][2], inv[1][2], inv[2][2]], bb = dot(bz, bz);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const wx = (x + 0.5 - C[0]) / (P.s * k), wy = -(y + 0.5 - C[1]) / (P.s * k);
          const q = [inv[0][0] * wx + inv[0][1] * wy, inv[1][0] * wx + inv[1][1] * wy, inv[2][0] * wx + inv[2][1] * wy];
          const ab = dot(q, bz), disc = ab * ab - bb * (dot(q, q) - 1);
          if (disc <= 0) continue;
          const zz = (-ab + Math.sqrt(disc)) / bb;
          const s = add(q, mul(bz, zz));
          // the normal: inverse-transpose of the axis matrix applied to s
          const n = norm([inv[0][0] * s[0] + inv[1][0] * s[1] + inv[2][0] * s[2], inv[0][1] * s[0] + inv[1][1] * s[1] + inv[2][1] * s[2], inv[0][2] * s[0] + inv[1][2] * s[1] + inv[2][2] * s[2]]);
          put(y * W + x, p.c[2] + zz, n[0], n[1], n[2], p, pi, s[1], s[0]);
        }
      } else if (p.k === 'tri') {
        const Q = p.p.map((w) => proj(P, w));
        let n = norm(cross(sub(p.p[1], p.p[0]), sub(p.p[2], p.p[0])));
        if (n[2] < 0) n = mul(n, -1);
        const x0 = Math.max(0, Math.floor(Math.min(Q[0][0], Q[1][0], Q[2][0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(Q[0][0], Q[1][0], Q[2][0])));
        const y0 = Math.max(0, Math.floor(Math.min(Q[0][1], Q[1][1], Q[2][1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(Q[0][1], Q[1][1], Q[2][1])));
        const ar = (Q[1][0] - Q[0][0]) * (Q[2][1] - Q[0][1]) - (Q[2][0] - Q[0][0]) * (Q[1][1] - Q[0][1]);
        if (Math.abs(ar) < 1e-6) return;
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          const w0 = ((Q[1][0] - px) * (Q[2][1] - py) - (Q[2][0] - px) * (Q[1][1] - py)) / ar;
          const w1 = ((Q[2][0] - px) * (Q[0][1] - py) - (Q[0][0] - px) * (Q[2][1] - py)) / ar;
          const w2 = 1 - w0 - w1;
          if (w0 < -1e-4 || w1 < -1e-4 || w2 < -1e-4) continue;
          const z = w0 * Q[0][2] + w1 * Q[1][2] + w2 * Q[2][2];
          const u = w0 * p.uv[0][0] + w1 * p.uv[1][0] + w2 * p.uv[2][0], v = w0 * p.uv[0][1] + w1 * p.uv[1][1] + w2 * p.uv[2][1];
          put(y * W + x, z, n[0], n[1], n[2], p, pi, u, v);
        }
      }
    });
    return B;
  }

  // ---------------------------------------------------------------- shading by rules
  const LIGHT = norm([-0.6, 0.6, 0.45]);
  const HALF = norm(add(LIGHT, [0, 0, 1]));
  function shade(S, B, look, song) {
    const N = W * H, tone = new Int8Array(N).fill(-1), tint = new Uint8Array(N); // tint: 1 = knuckle red
    const prims = S.prims, T0 = { sky: new Uint8Array(N) };
    for (let i = 0; i < N; i++) {
      const m = B.mat[i]; if (!m) continue;
      const p = prims[B.prim[i]], tag = p.tag || {};
      let n = [B.nx[i], B.ny[i], B.nz[i]];
      if (m === M.WOOL) {
        // folds: a soft ripple running round the sleeve, a little askew
        const f = Math.sin(B.u[i] * 1.05 + B.v[i] * 1.6) * 0.38 + Math.sin(B.u[i] * 0.47 - B.v[i] * 0.9 + 1.3) * 0.22;
        const P = p.P, ax = norm(sub(p.b, p.a)); n = norm(add(n, mul(ax, f)));
        void P;
      }
      if (m === M.STEEL) {
        // each bevel turns a little toward its edge; the lit one shows the sky, the other the steel
        const side = tag.blade || 0;
        const P = p.P, f = P.f, wdir = toWorldDir(P, f, [0, 1, 0]);
        n = norm(add(n, mul(wdir, 0.42 * side)));
        const lit = dot(n, LIGHT) > dot(norm(add([B.nx[i], B.ny[i], B.nz[i]], mul(wdir, -0.42 * side))), LIGHT);
        const u = B.u[i], av = Math.abs(B.v[i]);
        let tt;
        if (lit) {
          tt = u < 0.12 ? 2 : (u > 0.44 && u < 0.5) ? 3 : 4;              // the street, the horizon, the sky
          if (av < 0.24 && u < 0.66) tt = 1;                               // the fuller's groove
          else if (av < 0.44 && u < 0.66) tt = 5;                          // its lit lip
          T0.sky[i] = 1;
        } else {
          tt = u < 0.14 ? 1 : 2;
          if (av > 0.62) tt = 3;
          if (av < 0.24 && u < 0.66) tt = 1;
        }
        tone[i] = tt; continue;
      }
      const w = dot(n, LIGHT), sp = dot(n, HALF);
      const cfg = SHADE[m];
      const off = (hash(B.grp[i], 77) - 0.5) * 0.09;
      let t = 1; for (const c of cfg.cuts) if (w > c + off) t++;
      if (sp > cfg.spec && w > 0.3 && !tag.palm && !tag.fore) t = cfg.top;
      tone[i] = t;
    }
    return { tone, tint, sky: T0.sky };
  }
  function toWorldDir(P, f, l) { let w = add(add(mul(f.X, l[0]), mul(f.Y, l[1])), mul(f.Z, l[2])); if (P.roll) { const c = Math.cos(P.roll * D2R), sn = Math.sin(P.roll * D2R); w = [w[0] * c - w[1] * sn, w[0] * sn + w[1] * c, w[2]]; } if (P.mirror) w = [-w[0], w[1], w[2]]; return w; }

  const IDX = (x, y) => y * W + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;

  // a nearer part toward the light throws a shadow; a deep crease is darker (ambient occlusion from the depths)
  function castShadow(B, T) {
    const N = W * H, out = new Int8Array(T.tone);
    const lx = -1, ly = -1; // toward the light on screen: up and to the left
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = IDX(x, y); if (!B.mat[i] || B.mat[i] === M.STEEL) continue;
      const z = B.depth[i]; let sh = 0;
      for (let s = 1; s <= 3; s++) {
        const X = x + lx * s, Y = y + ly * s; if (!inb(X, Y)) break;
        const j = IDX(X, Y); if (B.mat[j] && B.grp[j] !== B.grp[i] && B.depth[j] > z + 0.9 + s * 0.35) { sh = 1; break; }
      }
      if (sh && out[i] > 1) out[i] -= 1;
    }
    T.tone = out; void N;
  }

  // stray pixels: a pixel no 4-neighbour of the same material shares a tone with takes the commonest tone around it
  function cleanup(B, T, skip) {
    for (let pass = 0; pass < 2; pass++) {
      const t = T.tone, out = new Int8Array(t);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = IDX(x, y), m = B.mat[i]; if (!m || skip[m]) continue;
        let same = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const j = IDX(x + dx, y + dy); if (B.mat[j] === m && t[j] === t[i]) same++; }
        if (same >= 1) continue;
        const cnt = {}; let best = t[i], bc = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const j = IDX(x + dx, y + dy); if (B.mat[j] !== m) continue;
          const c = (cnt[t[j]] = (cnt[t[j]] || 0) + 1); if (c > bc) { bc = c; best = t[j]; }
        }
        out[i] = best;
      }
      T.tone = out;
    }
  }

  // a 3 x 3 majority within one part: rounds off ragged tone boundaries the way a pixel artist would tidy them
  function modeFilter(B, T, skip) {
    const t = T.tone, out = new Int8Array(t);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y), m = B.mat[i]; if (!m || skip[m]) continue;
      const cnt = new Int8Array(8); let n = 0;
      for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const j = IDX(x + dx, y + dy); if (B.mat[j] === m && B.grp[j] === B.grp[i]) { cnt[t[j]]++; n++; } }
      if (n < 6) continue;
      let best = t[i], bc = cnt[t[i]]; for (let k = 0; k < 8; k++) if (cnt[k] > bc) { bc = cnt[k]; best = k; }
      if (bc >= 5) out[i] = best;
    }
    T.tone = out;
  }

  // lines and spots on the surfaces
  function decals(S, B, T, look) {
    const t = T.tone;
    const onSurf = (x, y, z, grp) => { if (!inb(x, y)) return -1; const i = IDX(x, y); if (!B.mat[i]) return -1; if (Math.abs(B.depth[i] - z) > 1.1) return -1; if (grp != null && B.grp[i] !== grp) return -1; return i; };
    for (const L of S.lines) {
      if (L.mode === 'none') continue;
      const pts = L.pts.map((w) => proj(L.P, w));
      let n = 0;
      for (let s = 0; s < pts.length - 1; s++) {
        const a = pts[s], b = pts[s + 1];
        const steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1]))));
        let last = -1;
        for (let k = 0; k <= steps; k++) {
          const f = k / steps, x = Math.floor(a[0] + (b[0] - a[0]) * f), y = Math.floor(a[1] + (b[1] - a[1]) * f), z = a[2] + (b[2] - a[2]) * f;
          const i = onSurf(x, y, z, L.grp); if (i < 0 || i === last) continue; last = i; n++;
          const m = B.mat[i], top = SHADE[m].top;
          if (L.mode === 'dark') t[i] = Math.max(0, Math.min(t[i] - 2, 1));
          else if (L.mode === 'stitch') t[i] = (n % 3 === 0) ? Math.min(top - 1, t[i] + 1) : Math.max(0, Math.min(t[i] - 1, 2));
          else if (L.mode === 'crease') t[i] = Math.max(0, t[i] - 2);
          else if (L.mode === 'fuller') t[i] = Math.max(1, t[i] - 2);
          else if (L.mode === 'fullerLit') t[i] = Math.min(top, t[i] + 1);
          else if (L.mode === 'tendon') { if (t[i] >= 3) t[i] = Math.min(top - 1, t[i] + 1); }
          else if (L.mode === 'nail') { t[i] = Math.min(top, Math.max(t[i] + 2, 4)); T.tint[i] = 0; T.nail = T.nail || new Uint8Array(W * H); T.nail[i] = 1; }
        }
      }
    }
    for (const sp of S.spots) {
      const c = proj(sp.P, sp.c), r = sp.r * sp.P.s * c[3];
      for (let y = Math.floor(c[1] - r); y <= Math.ceil(c[1] + r); y++) for (let x = Math.floor(c[0] - r); x <= Math.ceil(c[0] + r); x++) {
        if ((x + 0.5 - c[0]) ** 2 + (y + 0.5 - c[1]) ** 2 > r * r) continue;
        const i = onSurf(x, y, c[2], sp.grp); if (i < 0) continue;
        if (sp.mode === 'wear') { if (t[i] >= 3 && t[i] < SHADE[B.mat[i]].top) t[i] += 1; }
        else if (sp.mode === 'red') T.tint[i] = 1;
      }
    }
  }

  // mail: rings, each one a little "o" around the surface
  function mailRings(S, B, T) {
    const t = T.tone, ring = 0.9; // cm
    for (let i = 0; i < W * H; i++) {
      if (B.mat[i] !== M.MAIL) continue;
      const pr = S.prims[B.prim[i]];
      let a, b;
      if (pr.k === 'cap') { const r = (pr.ra + pr.rb) / 2; a = B.u[i] / ring; b = B.v[i] * r / (ring * 0.8); }
      else { a = B.u[i] * Math.hypot(...pr.e[1]) / ring; b = B.v[i] * Math.hypot(...pr.e[0]) / (ring * 0.8); }
      const row = Math.floor(b), fu = a + (row & 1) * 0.5;
      const cu = fu - Math.floor(fu) - 0.5, cv = b - row - 0.5;
      const d = Math.hypot(cu, cv);
      const base = t[i];
      if (d < 0.17) t[i] = Math.max(0, base - 2);                                   // the hole
      else if (d < 0.44) t[i] = Math.max(1, Math.min(4, base + ((cu + cv) < -0.05 ? 1 : (cu + cv) > 0.25 ? -1 : 0))); // the ring, lit on its upper left
      else t[i] = Math.max(0, base - 1);                                            // where the rings overlap
    }
  }

  // the glass: flat facets cut in a jittered grid, each lit by its own tilted plane
  function glassFacets(S, B, T) {
    const N = W * H, cell = 2.1; // cm on the surface
    const fid = new Int32Array(N).fill(-1);
    // a jittered grid of points over each solid's own surface (along it and around it), each square cut along one
    // diagonal or the other: flat triangles that wrap round the fingers and the forearm like cut glass
    const V = (gx, gy, s) => [gx + (hash(gx * 7 + 3 + s, gy * 13 + 1) - 0.5) * 0.5, gy + (hash(gx * 11 + 5, gy * 3 + 9 + s) - 0.5) * 0.5];
    const inTri = (p, a, b, c) => {
      const d1 = (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]);
      const d2 = (p[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (p[1] - c[1]);
      const d3 = (p[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (p[1] - a[1]);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    };
    for (let i = 0; i < N; i++) {
      if (B.mat[i] !== M.GLASS) continue;
      const pi = B.prim[i], pr = S.prims[pi];
      let a, b;
      if (pr.k === 'cap') { const r = (pr.ra + pr.rb) / 2; a = B.u[i] / cell; b = B.v[i] * r / (cell * 0.95); }
      else { const r0 = Math.hypot(...pr.e[0]), r1 = Math.hypot(...pr.e[1]); a = B.u[i] * r1 / cell; b = B.v[i] * r0 / cell; }
      const p = [a, b], gx = Math.floor(a), gy = Math.floor(b), sd = pi * 31;
      let id = -1;
      for (let oy = -1; oy <= 1 && id < 0; oy++) for (let ox = -1; ox <= 1 && id < 0; ox++) {
        const cx = gx + ox, cy = gy + oy, A = V(cx, cy, sd), Bv = V(cx + 1, cy, sd), C = V(cx, cy + 1, sd), Dv = V(cx + 1, cy + 1, sd);
        const diag = hash(cx * 5 + 1 + sd, cy * 9 + 7) < 0.5;
        const t1 = diag ? [A, Bv, Dv] : [A, Bv, C], t2 = diag ? [A, Dv, C] : [Bv, Dv, C];
        if (inTri(p, ...t1)) id = ((cx + 100) * 200 + (cy + 100)) * 2;
        else if (inTri(p, ...t2)) id = ((cx + 100) * 200 + (cy + 100)) * 2 + 1;
      }
      if (id < 0) id = ((gx + 100) * 200 + (gy + 100)) * 2;
      fid[i] = id * 97 + pi;
    }
    const acc = new Map();
    for (let i = 0; i < N; i++) {
      if (fid[i] < 0) continue; let a = acc.get(fid[i]); if (!a) { a = [0, 0, 0, 0]; acc.set(fid[i], a); }
      a[0] += B.nx[i]; a[1] += B.ny[i]; a[2] += B.nz[i]; a[3]++;
    }
    const fn = new Map();
    for (const [k, a] of acc) {
      const h1 = hash(k, 1) - 0.5, h2 = hash(k, 2) - 0.5, h3 = hash(k, 3) - 0.5;
      fn.set(k, norm([a[0] / a[3] + h1 * 0.3, a[1] / a[3] + h2 * 0.3, a[2] / a[3] + h3 * 0.1]));
    }
    const t = T.tone, cfg = SHADE[M.GLASS];
    for (let i = 0; i < N; i++) {
      if (fid[i] < 0) continue;
      const n = fn.get(fid[i]), w = dot(n, LIGHT);
      let tt = 1; for (const c of cfg.cuts) if (w > c) tt++;
      const hv = hash(fid[i], 5); if (hv < 0.22) tt--; else if (hv > 0.8) tt++;
      t[i] = Math.max(1, Math.min(5, tt));
    }
    // the seams between facets: some dark, a few bright, the rest only the change of tone
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
      const i = IDX(x, y); if (fid[i] < 0) continue;
      for (const j of [IDX(x + 1, y), IDX(x, y + 1)]) {
        if (fid[j] < 0 || fid[j] === fid[i]) continue;
        const a = Math.min(fid[i], fid[j]), b = Math.max(fid[i], fid[j]), hh = hash(a, b);
        // the seam goes on the darker side
        const k = t[i] <= t[j] ? i : j;
        if (hh < 0.16) t[k] = Math.max(0, Math.min(t[k] - 1, 1));
        else if (hh > 0.9 && Math.max(t[i], t[j]) >= 4) { const o = k === i ? j : i; t[o] = 6; }
      }
    }
    T.fid = fid;
  }

  // a chamfer distance from the edge of the drawn shape (in pixels), for the glow inside the glass
  function edgeDist(B) {
    const N = W * H, d = new Float32Array(N);
    for (let i = 0; i < N; i++) d[i] = B.mat[i] ? 1e4 : 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = IDX(x, y); if (!d[i]) continue; let m = d[i]; if (x > 0) m = Math.min(m, d[i - 1] + 1); if (y > 0) m = Math.min(m, d[i - W] + 1); if (x > 0 && y > 0) m = Math.min(m, d[i - W - 1] + 1.41); if (x < W - 1 && y > 0) m = Math.min(m, d[i - W + 1] + 1.41); if (x === 0 || y === 0) m = Math.min(m, 1); d[i] = m; }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = IDX(x, y); if (!d[i]) continue; let m = d[i]; if (x < W - 1) m = Math.min(m, d[i + 1] + 1); if (y < H - 1) m = Math.min(m, d[i + W] + 1); if (x < W - 1 && y < H - 1) m = Math.min(m, d[i + W + 1] + 1.41); if (x > 0 && y < H - 1) m = Math.min(m, d[i + W - 1] + 1.41); d[i] = m; }
    return d;
  }

  // outlines: selective on the silhouette, inner lines where a part passes in front of another
  function outlines(B, T) {
    const t = T.tone, out = new Int8Array(t), kind = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = IDX(x, y), m = B.mat[i]; if (!m) continue;
      // the silhouette: which sides are empty
      let lit = 0, dark = 0;
      const nb = [[-1, 0, 1], [0, -1, 1], [1, 0, 0], [0, 1, 0]];
      for (const [dx, dy, toward] of nb) {
        const X = x + dx, Y = y + dy;
        const empty = !inb(X, Y) ? (Y >= H || X >= W || X < 0 ? 0 : 1) : !B.mat[IDX(X, Y)];
        if (empty) { if (toward) lit++; else dark++; }
      }
      if (lit || dark) {
        const shadowSide = dark > 0 && (B.nx[i] * LIGHT[0] + B.ny[i] * LIGHT[1] + B.nz[i] * LIGHT[2]) < 0.35;
        if (m === M.GLASS) { out[i] = shadowSide ? 6 : 1; kind[i] = shadowSide ? 3 : 1; }
        else if (m === M.STEEL) { const litEdge = lit > 0 && !dark; out[i] = litEdge ? 2 : 0; kind[i] = litEdge ? 5 : 2; if (T.sky) T.sky[i] = 0; }
        else if (shadowSide || dark) { out[i] = 0; kind[i] = 2; }
        else { out[i] = Math.max(0, Math.min(t[i] - 2, 2)); kind[i] = 1; }
        continue;
      }
      // inner lines: a neighbour of another part, clearly nearer
      for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
        const j = IDX(x + dx, y + dy);
        if (B.grp[j] !== B.grp[i] && B.depth[j] > B.depth[i] + 0.55) {
          out[i] = m === M.GLASS ? 0 : Math.max(0, Math.min(t[i] - 2, 1)); kind[i] = 4; break;
        }
      }
    }
    // the blade's bright edge: one pixel inside its lit outline
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y); if (B.mat[i] !== M.STEEL || kind[i]) continue;
      if (kind[i - 1] === 5 || kind[i - W] === 5) { out[i] = 5; if (T.sky) T.sky[i] = 1; }
    }
    T.tone = out; T.kind = kind;
  }

  // the sleeve: a sparing checker where its mid tones meet (the one place this picture dithers)
  function woolDither(B, T) {
    const t = T.tone, out = new Int8Array(t);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y); if (B.mat[i] !== M.WOOL || T.kind[i] || t[i] !== 2) continue;
      let up = 0; for (const j of [i - 1, i + 1, i - W, i + W]) if (B.mat[j] === M.WOOL && t[j] === 3) up = 1;
      if (up && ((x + y) & 1) === 0) out[i] = 3;
    }
    T.tone = out;
  }

  // rim: just inside the dark outline on the shadow side, the light bounced back from the street
  function rim(B, T) {
    const t = T.tone, k = T.kind, out = new Int8Array(t);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y), m = B.mat[i]; if (!m || k[i]) continue;
      if (m === M.GLASS || m === M.STEEL || m === M.MAIL) continue;
      let near = 0;
      for (const [dx, dy] of [[1, 0], [0, 1], [1, 1]]) if (k[IDX(x + dx, y + dy)] === 2) near++;
      if (near >= 2 && B.nz[i] < 0.75 && t[i] <= 2 && t[i] >= 1) out[i] = t[i] + 1;
    }
    T.tone = out;
  }

  // ---------------------------------------------------------------- the poses
  const D = 62;
  function rightFistPose(ax, ay, s, raise) {
    // knuckles up and to the left, the thumb on top, the back of the hand to the right and a little away
    return { f: frame([-0.62 * raise - 0.12, 0.62 * raise + 0.2, -0.42], [0.62, -0.05, -0.55]), s, ax, ay, z0: 0, D, mirror: false };
  }

  function build(pose, look) {
    const S = Scene();
    const hm = look.hands === 'bare' ? M.SKIN : look.hands === 'mail' ? M.MAIL : M.LEATHER;
    const gloved = hm !== M.SKIN;
    const right = (P, curl, ex) => addHand(S, P, Object.assign({ curl, hand: hm, bare: !gloved, cuff: gloved, sleeve: true, foreLen: 30 }, ex || {}));
    const leftArm = (P, curl, ex) => look.glassArm
      ? addHand(S, P, Object.assign({ curl, hand: M.GLASS, glass: true, cuff: false, sleeve: false, foreLen: 34 }, ex || {}))
      : addHand(S, P, Object.assign({ curl, hand: hm, bare: !gloved, cuff: gloved, sleeve: true, foreLen: 30 }, ex || {}));
    // the low fist that rests at the side (the right one; mirrored for the left)
    const restR = (ax, ay) => ({ f: frame([-0.5, 0.55, -0.55], [0.62, -0.1, -0.6]), s: 5.9, ax, ay, z0: 0, D, mirror: false });
    // the raised fist: knuckles up and to the left, the thumb on top, the back of the hand to the right and away
    const raisedR = (ax, ay) => ({ f: frame(RAISE.Y, RAISE.Z), s: RAISE.s, ax: ax + (RAISE.dx || 0), ay: ay + (RAISE.dy || 0), z0: 0, D, mirror: false, roll: RAISE.roll || 0 });
    // the screen is 384 x 167 (a third of the view)
    if (pose === 'sword') {
      right({ f: frame(SW.Y, SW.Z), s: SW.s, ax: SW.ax, ay: SW.ay, z0: 0, D, mirror: false, roll: SW.roll }, 'grip', { dev: SW.dev });
      addSword(S, S.lastP);
      const L = restR(384 - 318, 157); L.mirror = true; leftArm(L, 'fist');
    } else if (pose === 'fist') {
      right(raisedR(350, 128), 'fist');
      const L = restR(384 - 318, 157); L.mirror = true; leftArm(L, 'fist');
    } else if (pose === 'glass') {
      const P = raisedR(384 - 350, 128); P.mirror = true; leftArm(P, 'fist');
      right(restR(322, 155), 'fist');
    } else if (pose === 'song') {
      const Pr = { f: frame([-0.12, 1, -0.25], [0.12, 0.2, 1]), s: 5.6, ax: 250, ay: 126, z0: 0, D, mirror: false };
      right(Pr, 'open', { dev: 12, flexW: -8 });
      const Pl = Object.assign({}, Pr, { mirror: true, ax: 384 - 250 });
      leftArm(Pl, 'open', { dev: 12, flexW: -8 });
    }
    return S;
  }
  let RAISE = { Y: [-0.62, 0.72, 0.0], Z: [0.3, 0.1, -0.95], s: 6.4 };
  const SW = { Y: [-0.958, 0.284, 0.037], Z: [-0.224, -0.662, -0.715], dev: 30, s: 6.0, ax: 356, ay: 143, roll: 9 };

  // ---------------------------------------------------------------- compose
  function pixels(pose, look) {
    const S = build(pose, look);
    const B = raster(S);
    const T = shade(S, B, look);
    castShadow(B, T);
    modeFilter(B, T, { [M.MAIL]: 1, [M.GLASS]: 1, [M.STEEL]: 1 });
    cleanup(B, T, { [M.MAIL]: 1, [M.GLASS]: 1, [M.STEEL]: 1 });
    if (S.prims.some((p) => p.mat === M.GLASS)) glassFacets(S, B, T);
    mailRings(S, B, T);
    decals(S, B, T, look);
    outlines(B, T);
    woolDither(B, T);
    rim(B, T);
    const PAL = palettes(look);
    const N = W * H, data = new Uint8ClampedArray(N * 4);
    const ed = edgeDist(B);
    const song = pose === 'song' && look.song ? look.song : null;
    const sc = song ? [W / 2, 74] : null;
    for (let i = 0; i < N; i++) {
      const m = B.mat[i];
      const x = i % W, y = (i / W) | 0;
      if (!m) {
        // the glass's quarter glow: a faint pale halo one pixel out
        let g = 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (inb(X, Y) && B.mat[IDX(X, Y)] === M.GLASS) g = 1; }
        if (g) { data[i * 4] = 150; data[i * 4 + 1] = 226; data[i * 4 + 2] = 255; data[i * 4 + 3] = 70; }
        continue;
      }
      let tt = T.tone[i]; const pal = m === M.SKIN && T.tint[i] ? PAL.skinRed : PAL[m];
      tt = Math.max(0, Math.min(pal.length - 1, tt));
      let c = pal[tt];
      if (m === M.STEEL) {
        // the sky in the blade: the upper part of the lit bevel takes the sky's blue
        if (T.sky[i]) c = PAL.sky[tt];
      }
      if (m === M.GLASS) {
        // a few lighter pixels inside: the glow at a quarter of its strength
        if (ed[i] >= 3 && tt <= 3 && hash(T.fid ? T.fid[i] : 0, 9) < 0.18) c = PAL[M.GLASS][Math.min(5, tt + 1)];
      }
      if (song) {
        // the Song's light on the inner edges
        const n = [B.nx[i], B.ny[i], B.nz[i]], dx = sc[0] - (x + 0.5), dy = -(sc[1] - (y + 0.5)), dl = Math.hypot(dx, dy);
        const l = dot(n, norm([dx, dy, 6])) * Math.max(0, 1 - dl / 62);
        const lv = l > 0.36 ? 2 : l > 0.14 ? 1 : 0;
        if (lv) c = mix(c, mix(song, [255, 250, 220], 0.3), (lv === 2 ? 0.66 : 0.36) + (m === M.GLASS ? 0.16 : 0));
      }
      data[i * 4] = c[0]; data[i * 4 + 1] = c[1]; data[i * 4 + 2] = c[2]; data[i * 4 + 3] = 255;
    }
    if (song) songGlow(data, B, sc, song);
    return { w: W, h: H, data };
  }

  // the Song's light between the palms: a few concentric tones, behind the hands
  function songGlow(data, B, c, song) {
    const rings = [[2.6, mix(song, [255, 255, 240], 0.85), 255], [4.6, mix(song, [255, 250, 225], 0.5), 255], [7.2, song, 230], [10.5, song, 150], [15, mix(song, [255, 220, 120], 0.2), 80], [21, song, 34]];
    for (let y = Math.floor(c[1] - 22); y <= c[1] + 22; y++) for (let x = Math.floor(c[0] - 22); x <= c[0] + 22; x++) {
      if (!inb(x, y)) continue; const i = IDX(x, y); if (B.mat[i]) continue;
      const d = Math.hypot(x + 0.5 - c[0], (y + 0.5 - c[1]) * 1.12);
      for (let k = 0; k < rings.length; k++) {
        let r = rings[k][0];
        // a two-pixel checker at the boundary of the two outer rings
        if (k >= 3 && ((x >> 0) + (y >> 0)) % 2 === 0) r += 0.9;
        if (d < r) {
          const [cc, a] = [rings[k][1], rings[k][2]];
          const A = data[i * 4 + 3] / 255, na = a / 255;
          if (A > 0) { data[i * 4] = cc[0] * na + data[i * 4] * (1 - na); data[i * 4 + 1] = cc[1] * na + data[i * 4 + 1] * (1 - na); data[i * 4 + 2] = cc[2] * na + data[i * 4 + 2] * (1 - na); data[i * 4 + 3] = Math.max(A, na) * 255; }
          else { data[i * 4] = cc[0]; data[i * 4 + 1] = cc[1]; data[i * 4 + 2] = cc[2]; data[i * 4 + 3] = a; }
          break;
        }
      }
    }
  }

  const cache = new Map();
  function render(pose, look, light) {
    void light;
    const key = pose + '|' + JSON.stringify(look || {});
    let low = cache.get(key);
    if (!low) { low = pixels(pose, look || {}); cache.set(key, low); }
    const c = document.createElement('canvas'); c.width = OW; c.height = OH;
    const s = document.createElement('canvas'); s.width = W; s.height = H;
    s.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(low.data), W, H), 0, 0);
    const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.drawImage(s, 0, 0, W * SC, H * SC);
    return c;
  }
  return { render, _pixels: pixels, _raise: (o) => { RAISE = Object.assign({}, RAISE, o); }, W, H, SC };
})();
if (typeof window !== 'undefined') window.HANDS109X = HANDS109X;
