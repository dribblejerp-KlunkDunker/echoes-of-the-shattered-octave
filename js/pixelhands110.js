// ============================================================
//  pixelhands110 — Phase 110: the pixel-art hands, in the game.
//
//  The owner, 21 Nov 2026, on the three options of Phase 109: "lets use the pixel art in the game for now but I do want
//  to eventually use the sculpted lit by the world". This is option 3 (tools/hands109/hands109x.js, which stays where it
//  is, untouched), made a game module: everywhere you see your own hands, they are pixel art.
//
//  How (the same model and rules as option 3, copied here and adapted):
//    * the hands, forearms and sleeves are built in 3D from tapered capsules and ellipsoids in centimetres, posed, and
//      rasterised at a third of the picture's resolution into a buffer that knows each pixel's material, part, depth and
//      normal; rules then shade it as a pixel artist would: small hue-shifted ramps per material, light from the upper
//      left, cast shadows, a majority filter and a stray-pixel cleanup, sel-out outlines, inner lines only where one form
//      passes in front of another, details (stitches, creases, wear, tendons, nails, mail rings, plates), the glass arm
//      cut into azure facets with dark seams, a few bright edges and a bright rim; scaled up three times, nearest-neighbour
//      (every pixel a crisp 3 x 3 block of the picture's own pixels);
//    * every weapon is FP87's own painting of it with no hand (FP87.paint(wid, look, { noHands: true }), which also says
//      where each hand grips and at what angle), turned into pixel art at the same grain: averaged down, a small palette
//      of hue-shifted ramps from its own colours, strays removed, sel-out outlines; the pixel hand is posed so its fist
//      closes round the grip there (both hands on two-handed and pole weapons; ranged weapons held as FP87 holds them);
//    * the hands alone (FP87.paintHands: the bare or gloved fist, the glass arm, the open hands for a Song) and the
//      climb's two fists on a rung (js/fp-hands.js asks PIXELHANDS110.climbHand).
//  Every glove and gauntlet keeps its own colours and its form (leather, mail, plate, cloth; fingerless cuffs, coils,
//  vambraces, long cuffs, mitts, wraps; the trim), the sleeve its own (rolled, mail, bare arm, its cuff). The glass arm is
//  the LEFT arm; it does not blaze (its glow is a quarter of its old light, as approved on 14 Nov).
//
//  FP87.paint and FP87.paintHands are wrapped: the same canvas sizes and fields (k, below, right, center, flip, shift,
//  tip, root, pose), so js/body21.js and js/fp-hands.js draw them unchanged; `emis` carries the glass's glow and the
//  brightest glints. Cached per weapon and look in FP87's own cache (FP87.cache.clear() clears these too).
//  Nothing here changes the game: damage, timing, swings and Songs are as they were. Only pictures. No Math.random.
//
//  Switch: GFX.pixelHands (in GFX.FX: off in Original, on in every other preset); Options row "Pixel hands". Off, the
//  game draws exactly Phase 98's hands (FP87's own output). PIXELHANDS110.paint / paintHands / climbHand / on / setOn.
// ============================================================
'use strict';

const PIXELHANDS110 = (() => {
  const FLAG = 'pixelHands';
  if (typeof GFX !== 'undefined') {
    if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = true;   // the player's own choice, kept across launches
    if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
  }
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; if (typeof console !== 'undefined') console.warn('pixelhands110 ' + k, e); };
  const GR = 3;                 // the grain: picture pixels to one pixel of the pixel art
  const hash = (a, b) => { let n = Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };

  // ---------------------------------------------------------------- vectors
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const norm = (a) => { const l = Math.hypot(a[0], a[1], a[2]) || 1; return [a[0] / l, a[1] / l, a[2] / l]; };
  const lerp3 = (a, b, t) => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
  const D2R = Math.PI / 180;
  const rot = (v, k, a) => { const c = Math.cos(a), s = Math.sin(a); return add(add(mul(v, c), mul(cross(k, v), s)), mul(k, dot(k, v) * (1 - c))); };

  // ---------------------------------------------------------------- colour
  function rgb2hsl(c) {
    const r = c[0] / 255, g = c[1] / 255, b = c[2] / 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    const h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  function hsl2rgb(h, s, l) {
    h = ((h % 360) + 360) % 360 / 360; s = Math.max(0, Math.min(1, s)); l = Math.max(0, Math.min(1, l));
    if (s === 0) return [l * 255, l * 255, l * 255].map(Math.round);
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s, p = 2 * l - q;
    const f = (t) => { t = (t + 1) % 1; return t < 1 / 6 ? p + (q - p) * 6 * t : t < 1 / 2 ? q : t < 2 / 3 ? p + (q - p) * (2 / 3 - t) * 6 : p; };
    return [f(h + 1 / 3), f(h), f(h - 1 / 3)].map((v) => Math.round(v * 255));
  }
  // a hue-shifted ramp: index bi is the base colour; shadows turn by hs degrees, lights by hl
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
  const lumOf = (c) => (c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15) / 255;
  const scl = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))));

  // ---------------------------------------------------------------- materials
  const M = { NONE: 0, SKIN: 1, GLOVE: 2, MAIL: 3, WOOL: 4, PLATE: 5, GLASS: 6, TRIM: 7, SLMAIL: 8, CUFF: 9, SCUFF: 10 };
  const SHADE = {
    [M.SKIN]: { cuts: [-0.25, 0.1, 0.45, 0.8], spec: 0.95, top: 6 },
    [M.GLOVE]: { cuts: [-0.2, 0.2, 0.62], spec: 0.985, top: 5 },
    [M.CUFF]: { cuts: [-0.2, 0.18, 0.52], spec: 0.93, top: 5 },
    [M.MAIL]: { cuts: [-0.25, 0.3], spec: 2, top: 4 },
    [M.SLMAIL]: { cuts: [-0.25, 0.3], spec: 2, top: 4 },
    [M.WOOL]: { cuts: [-0.25, 0.12, 0.5], spec: 2, top: 4 },
    [M.SCUFF]: { cuts: [-0.25, 0.12, 0.5], spec: 2, top: 4 },
    [M.PLATE]: { cuts: [-0.1, 0.3, 0.68], spec: 0.94, top: 5 },
    [M.TRIM]: { cuts: [-0.15, 0.3, 0.65], spec: 0.96, top: 4 },
    [M.GLASS]: { cuts: [-0.45, -0.1, 0.22, 0.52], spec: 0.9, top: 6 },
  };
  const GLASS_PAL = hex(['#061230', '#0c2a62', '#144596', '#1f63bf', '#3388dc', '#6cbcf2', '#c8f4ff']);

  // what the hands wear, read from FP87's look (look.hands, look.skin, look.body.sleeve, look.glassArm)
  function wearOf(look) {
    const Hd = look && look.hands, skin = (look && look.skin) || [214, 170, 136];
    const B = look && look.body, sl = (B && B.sleeve) || {};
    const sleeveMat = sl.material === 'skin' ? 'skin' : sl.material === 'mail' ? 'mail' : 'cloth';
    const scol = sl.col || (B && B.col && B.col.base) || [120, 100, 80];
    const w = { skin, gloved: false, hand: M.SKIN, form: '', pattern: '', col: null, trim: null, cuff: null, sleeve: { mat: sleeveMat, col: scol, rolled: !!sl.rolled && sleeveMat !== 'skin', cuff: sl.cuff || null } };
    if (!Hd || Hd.bare || !Hd.col) return w;
    const c = Hd.col, mat = Hd.material, form = Hd.form || '';
    w.gloved = true; w.form = form; w.pattern = Hd.pattern || ''; w.col = c; w.trim = c.trim || null; w.shape = Hd.shape; w.material = mat;
    w.hand = mat === 'mail' ? M.MAIL : (mat === 'iron' || mat === 'bellbronze' || mat === 'steel') ? M.PLATE : M.GLOVE;
    if (form === 'coils') { w.hand = M.SKIN; w.coils = true; }                                   // the barrow's coils: bare hands, bronze on the forearm
    if (form === 'cuffs') { w.fingerless = true; }                                               // fingerless kid
    w.cuff = form === 'coils' ? null : form === 'vambrace' ? { len: 11, r0: 2.55, r1: 3.55, mat: M.PLATE } : form === 'longcuff' ? { len: 9.5, r0: 2.8, r1: 4.3, mat: M.CUFF }
      : form === 'cuffs' ? { len: 6, r0: 2.5, r1: 2.95, mat: M.CUFF } : (form === 'mitts' || form === 'wraps' || form === 'darned' || form === 'felted') ? { len: 3.4, r0: 2.55, r1: 2.95, mat: M.CUFF }
        : Hd.shape === 'gauntlets' ? { len: 7.5, r0: 2.85, r1: 4.0, mat: w.hand === M.MAIL ? M.PLATE : M.CUFF } : { len: 5.6, r0: 2.75, r1: 3.5, mat: M.CUFF };
    return w;
  }
  function palettes(wear) {
    const P = [];
    const skin = wear.skin;
    P[M.SKIN] = ramp(skin, 7, 4, { hs: -14, hl: 8, lo: 0.14, hi: 0.8, ss: 0.32, sl: -0.15 });
    P.skinRed = ramp(mix(skin, [206, 96, 84], 0.38), 7, 4, { hs: -12, hl: 8, lo: 0.13, hi: 0.8, ss: 0.5, sl: -0.05 });
    const c = wear.col || { base: [112, 68, 38], shade: [74, 46, 28], light: [150, 106, 70] };
    const Lb = rgb2hsl(c.base)[2], Ll = rgb2hsl(c.light || c.base)[2], Ld = rgb2hsl(c.dark || c.shade || c.base)[2];
    const lo = Math.max(0.02, Math.min(Lb * 0.35, Ld * 0.55)), hi = Math.min(0.95, Math.max(Ll + 0.1, Lb + 0.16));
    P[M.GLOVE] = ramp(c.base, 6, 3, { hs: -16, hl: 12, lo, hi, ss: 0.2, sl: 0.2 });
    P[M.CUFF] = ramp(mix(c.base, c.shade || c.base, 0.35), 6, 3, { hs: -16, hl: 12, lo: lo * 0.85, hi: hi - 0.05, ss: 0.2, sl: 0.2 });
    P[M.MAIL] = ramp(c.base, 5, 2, { hs: -10, hl: 10, lo: Math.min(0.08, lo), hi: Math.min(0.78, Math.max(0.66, hi - 0.08)), ss: 0.1, sl: 0.4 });
    P[M.PLATE] = ramp(c.base, 6, 2, { hs: -12, hl: 14, lo: Math.min(0.08, lo), hi: Math.min(0.86, Math.max(0.74, hi)), ss: 0.15, sl: 0.4 });
    const tr = wear.coils ? (c.trim || [92, 138, 112]) : (wear.trim || mix(c.base, [230, 220, 200], 0.4));
    P[M.TRIM] = ramp(tr, 5, 2, { hs: -12, hl: 10, lo: Math.min(0.1, rgb2hsl(tr)[2] * 0.4), hi: Math.min(0.94, rgb2hsl(tr)[2] + 0.25), ss: 0.15, sl: 0.3 });
    if (wear.coils) P[M.PLATE] = ramp(c.base, 6, 2, { hs: -12, hl: 14, lo: 0.08, hi: 0.86, ss: 0.15, sl: 0.45 });
    const sc = wear.sleeve.col;
    P[M.WOOL] = ramp(sc, 5, 3, { hs: -18, hl: 10, lo: Math.min(0.08, rgb2hsl(sc)[2] * 0.4), hi: Math.min(0.9, rgb2hsl(sc)[2] + 0.2), ss: 0.15, sl: 0.2 });
    P[M.SLMAIL] = ramp(sc, 5, 2, { hs: -10, hl: 10, lo: 0.08, hi: 0.84, ss: 0.1, sl: 0.4 });
    const cf = wear.sleeve.cuff || scl(sc, 0.7);
    P[M.SCUFF] = ramp(cf, 5, 3, { hs: -18, hl: 10, lo: Math.min(0.07, rgb2hsl(cf)[2] * 0.4), hi: Math.min(0.9, rgb2hsl(cf)[2] + 0.2), ss: 0.15, sl: 0.2 });
    P[M.GLASS] = GLASS_PAL;
    return P;
  }

  // ---------------------------------------------------------------- posing
  function frame(fingerDir, dorsalDir) {
    const Y = norm(fingerDir); let Z = norm(dorsalDir); Z = norm(sub(Z, mul(Y, dot(Z, Y)))); const X = cross(Y, Z);
    return { X, Y, Z };
  }
  // P: { f: frame, s: pixels per cm, ax, ay: the hand's origin on screen, mirror, roll (degrees, about the view axis), D }
  const D = 62;
  const toWorld = (P, l) => { const f = P.f; let w = add(add(mul(f.X, l[0]), mul(f.Y, l[1])), mul(f.Z, l[2])); if (P.roll) { const c = Math.cos(P.roll * D2R), sn = Math.sin(P.roll * D2R); w = [w[0] * c - w[1] * sn, w[0] * sn + w[1] * c, w[2]]; } if (P.mirror) w[0] = -w[0]; return w; };
  // (a forearm coming at the eye swells no more than half as large again: past that it read as a ball, not an arm)
  const proj = (P, w) => { const k = P.D / (P.D - Math.min(w[2], P.D * 0.33)); return [P.ax + P.s * k * w[0], P.ay - P.s * k * w[1], w[2], k]; };
  const scr = (P, l) => proj(P, toWorld(P, l));

  // ---------------------------------------------------------------- the scene
  let W = 0, H = 0;                // the low picture being built
  const IDX = (x, y) => y * W + x;
  const inb = (x, y) => x >= 0 && y >= 0 && x < W && y < H;
  function Scene() { return { prims: [], lines: [], spots: [], gid: 1 }; }
  function cap(S, P, a, b, ra, rb, mat, grp, tag) { S.prims.push({ k: 'cap', P, a: toWorld(P, a), b: toWorld(P, b), ra, rb, mat, grp, tag: tag || null }); }
  function ell(S, P, c, ax, mat, grp, tag) { const wc = toWorld(P, c), o = toWorld(P, [0, 0, 0]); S.prims.push({ k: 'ell', P, c: wc, e: ax.map((v) => sub(toWorld(P, v), o)), mat, grp, tag: tag || null }); }
  function line(S, P, pts, mode, grp) { S.lines.push({ P, pts: pts.map((p) => toWorld(P, p)), mode, grp }); }
  function spot(S, P, c, r, mode, grp) { S.spots.push({ P, c: toWorld(P, c), r, mode, grp }); }

  // ---------------------------------------------------------------- the hand, in cm (right hand; the left is mirrored)
  const FING = [
    { k: [-2.85, 9.55, 0.2], L: [4.0, 2.4, 2.05], r: [0.98, 0.88, 0.8] },
    { k: [-0.95, 10.05, 0.25], L: [4.5, 2.8, 2.25], r: [1.02, 0.92, 0.83] },
    { k: [0.95, 9.7, 0.2], L: [4.2, 2.65, 2.15], r: [0.97, 0.87, 0.79] },
    { k: [2.75, 8.85, 0.05], L: [3.35, 1.95, 1.85], r: [0.84, 0.76, 0.7] },
  ];
  function fingerJoints(fi, flex, spread) {
    const F = FING[fi]; const pts = [F.k]; let th = 0, p = F.k; const ph = spread * D2R;
    for (let j = 0; j < 3; j++) { th += flex[j] * D2R; const d = [Math.sin(ph) * Math.cos(th), Math.cos(ph) * Math.cos(th), -Math.sin(th)]; p = add(p, mul(d, F.L[j])); pts.push(p); }
    return pts;
  }
  // the grip the 'grip' curl closes round (option 3's sword grip): its centre and its axis (toward the little finger)
  const GRIP_C = [0.125, 9.05, -2.75], GRIP_AX = rot([1, 0, 0], [0, 0, 1], -15 * D2R);

  // o: { curl: 'fist'|'grip'|'open', wear, glass, foreLen, dev, flexW, noSleeve }
  function addHand(S, P, o) {
    const wear = o.wear, glass = !!o.glass, g = S.gid; S.gid += 20;
    const G = { palm: g, f: [g + 1, g + 2, g + 3, g + 4], thumb: g + 5, wrist: g + 6, cuff: g + 7, hem: g + 8, sleeve: g + 9, trim: g + 10, roll: g + 11, thenar: g + 12, hypo: g + 13 };
    if (wear.form === 'mitts' && !glass) G.f = [g + 1, g + 1, g + 1, g + 1];                       // mittens: the fingers are one
    const hm = glass ? M.GLASS : wear.hand, gloved = wear.gloved && !glass && !wear.coils;
    const fingerM = (seg) => (wear.fingerless && !glass && seg > 0 ? M.SKIN : hm);
    const curl = o.curl;
    const flex = curl === 'fist' ? [[86, 102, 66], [88, 102, 64], [90, 100, 62], [92, 98, 60]]
      : (curl === 'grip' || curl === 'hook') ? [[74, 96, 52], [80, 96, 52], [84, 94, 52], [88, 92, 50]]
        : [[6, 10, 6], [4, 8, 5], [6, 9, 6], [10, 12, 8]];
    const spread = curl === 'open' ? [-9, -2, 5, 12] : [-2, 0, 1, 3];
    const fingers = [];
    for (let i = 0; i < 4; i++) {
      const J = fingerJoints(i, flex[i], spread[i]), F = FING[i]; fingers.push(J);
      if (o.only === 'fingers') { for (let j = 0; j < 3; j++) cap(S, P, J[j], J[j + 1], F.r[Math.min(2, j)] * (j ? 1 : 1.05), j < 2 ? F.r[j + 1] : F.r[2] * 0.82, fingerM(j), G.f[i], { finger: i, seg: j }); continue; }
      cap(S, P, J[0], J[1], F.r[0] * 1.05, F.r[1], fingerM(0), G.f[i], { finger: i, seg: 0 });
      cap(S, P, J[1], J[2], F.r[1], F.r[2], fingerM(1), G.f[i], { finger: i, seg: 1 });
      cap(S, P, J[2], J[3], F.r[2], F.r[2] * 0.82, fingerM(2), G.f[i], { finger: i, seg: 2 });
      ell(S, P, add(F.k, [0, -0.35, 0.2]), [[F.r[0] * 1.08, 0, 0], [0, F.r[0] * 1.15, 0], [0, 0, F.r[0] * 1.05]], hm, G.palm, { knuckle: i });
    }
    if (o.only === 'fingers') {   // their nails, and no more
      if (hm === M.SKIN || wear.fingerless) for (let i = 0; i < 4; i++) { const J = fingers[i], d = norm(sub(J[3], J[2])), zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d)))); line(S, P, [add(lerp3(J[2], J[3], 0.45), mul(zc, FING[i].r[2] * 0.85)), add(lerp3(J[2], J[3], 0.92), mul(zc, FING[i].r[2] * 0.62))], 'nail', G.f[i]); }
      return { G, fingers };
    }
    ell(S, P, [-0.05, 5.0, -0.15], [[4.0, 0, 0], [0, 5.5, 0], [0, 0, 1.5]], hm, G.palm, { palm: 1 });
    // Phase 111: the heel of the hand and the thumb's pad are forms of their own (they were one broad flat plane with
    // the palm): each rounds into the light by itself, and a line falls where one stands in front of the palm's hollow
    ell(S, P, [2.5, 3.3, -0.95], [[1.5, 0, 0], [0, 3.1, 0], [0, 0, 1.3]], hm, G.hypo, { palm: 1, pad: 1 });
    const cmc = [-2.2, 1.4, -0.6];
    let tm, ti, tt;
    if (curl === 'open') { tm = [-4.3, 5.0, -1.1]; ti = [-5.7, 7.4, -1.0]; tt = [-6.5, 9.5, -0.8]; ell(S, P, [-3.3, 6.1, -0.55], [[1.25, 0, 0], [0, 2.1, 0], [0, 0, 0.7]], hm, G.palm, { palm: 1 }); }
    else if (curl === 'grip') { tm = [-4.5, 5.6, -3.4]; ti = [-3.6, 8.3, -5.6]; tt = [-1.2, 9.1, -5.9]; }
    else if (curl === 'hook') { tm = [-4.4, 4.9, -1.0]; ti = [-5.0, 6.9, -0.9]; tt = [-5.1, 8.5, -1.1]; }
    else { tm = [-4.4, 5.5, -3.1]; ti = [-3.5, 8.1, -5.1]; tt = [-0.8, 8.6, -5.2]; }
    ell(S, P, [-2.45, 3.5, -1.45], [[1.8, 0, 0], [0.35, 2.75, 0], [0, 0, 1.6]], hm, G.thenar, { palm: 1, pad: 1 });
    cap(S, P, cmc, tm, 1.5, 1.22, hm, G.thumb, { thumb: 0 });
    cap(S, P, tm, ti, 1.18, 1.08, fingerM(1), G.thumb, { thumb: 1 });
    cap(S, P, ti, tt, 1.06, 0.86, fingerM(2), G.thumb, { thumb: 2 });
    // the wrist and the forearm; the wrist may bend (o.dev: toward the little finger, o.flexW: toward the palm)
    const fl = o.foreLen || 30, sl = wear.sleeve;
    const bareArm = !glass && (sl.mat === 'skin' || sl.rolled);
    const fm = glass ? M.GLASS : (gloved && !bareArm && hm !== M.MAIL && hm !== M.PLATE) ? hm : M.SKIN;
    const piv = [0, 0.8, -0.2];
    const fa = (q) => { let r = sub(q, piv); if (o.dev) r = rot(r, [0, 0, 1], o.dev * D2R); if (o.flexW) r = rot(r, [1, 0, 0], o.flexW * D2R); return add(piv, r); };
    cap(S, P, [0, 1.6, -0.25], fa([0, -1.5, -0.15]), 2.35, 2.25, gloved || glass ? hm : M.SKIN, G.wrist, { fore: 1, arm: 1 });
    // the forearm runs only as far as the sleeve: a long tapered solid coming at the eye swells wider than it is along its
    // length on the screen, and under a sleeve that showed past the sleeve's roll as a ball
    const sleeved = !glass && !o.noSleeve && sl.mat !== 'skin', fEnd = sleeved ? (sl.rolled ? 14.6 : 7.4) : fl;
    cap(S, P, fa([0, -1.5, -0.15]), fa([0.1 * fEnd / fl, -fEnd, 0.2 * fEnd / fl]), 2.25, 2.25 + (fEnd / fl), fm, G.wrist, { fore: 1, arm: 1, ob: !sleeved });
    if (!sleeved) cap(S, P, fa([0.1, -fl, 0.2]), fa([0.2, -fl - 34, 0.5]), 3.25, 4.1, fm, G.wrist, { fore: 1, arm: 1, oa: 1 });   // Phase 111: on, past the picture's edge
    const ring = (y, r) => { const pts = []; for (let i = 0; i <= 28; i++) { const a = i / 28 * Math.PI * 2; pts.push(fa([Math.cos(a) * r, y, Math.sin(a) * r * 0.95])); } return pts; };
    // the glove's cuff, flared; its trim
    if (gloved && wear.cuff) {
      const C = wear.cuff, cm = C.mat;
      cap(S, P, fa([0, 0.2, -0.2]), fa([0, -C.len, 0]), C.r0, C.r1, cm, G.cuff, { cuff: 1, arm: 1 });
      line(S, P, ring(-C.len + 0.7, C.r1 * 0.98), 'dark', G.cuff);
      if (cm === M.CUFF && wear.pattern !== 'none' && wear.pattern !== 'weave') line(S, P, ring(-0.6, C.r0 * 1.04), 'stitch', G.cuff);
      if (cm === M.PLATE) for (let k = 1; k < 4; k++) line(S, P, ring(-C.len * k / 4, C.r0 + (C.r1 - C.r0) * k / 4 + 0.04), 'dark', G.cuff);   // the vambrace's lames
      // the trim: a band painted round the cuff's edge (a short solid there read as a ball when the arm came at the eye)
      if (wear.trim && wear.form !== 'darned' && wear.form !== 'mitts') for (const dy of [0.25, 0.6, 0.95]) line(S, P, ring(-C.len + dy, C.r1 - dy * (C.r1 - C.r0) / C.len + 0.02), 'trim', G.cuff);
      if (wear.pattern === 'rivets' || wear.form === 'brake') for (let k = 0; k < 5; k++) { const a = -0.4 + k * 0.55; spot(S, P, fa([Math.cos(a) * C.r1 * 0.92, -C.len * 0.55, Math.sin(a) * C.r1 * 0.9]), 0.38, 'rivet', G.cuff); }
    }
    if (wear.coils && !glass) for (let k = 0; k < 6; k++) for (const dy of [0, 0.3]) { const y = -2.4 - k * 1.0 - dy, r = 2.27 + (-y - 1.5) * 0.04; line(S, P, ring(y, r), k % 3 === 2 ? 'trim' : 'plate', G.wrist); }   // the barrow's coils, wound round the bare forearm
    // the sleeve
    if (!glass && !o.noSleeve && sl.mat !== 'skin') {
      const sm = sl.mat === 'mail' ? M.SLMAIL : M.WOOL;
      const y0 = sl.rolled ? -13.5 : -6.4;
      if (sl.rolled) cap(S, P, fa([0, y0 + 0.4, 0]), fa([0, y0 - 1.7, 0.05]), 2.8, 2.95, M.WOOL, G.roll, { hem: 1, arm: 1, ob: 1 });   // the roll of the sleeve
      else cap(S, P, fa([0, y0, 0]), fa([0, y0 - 1.5, 0.05]), 3.95, 4.1, sl.cuff ? M.SCUFF : sm, G.hem, { hem: 1, arm: 1 });
      cap(S, P, fa([0, y0 - 1.5, 0.05]), fa([0.2, -fl - 14, 0.4]), sl.rolled ? 2.95 : 4.1, 6.2, sm, G.sleeve, { sleeve: 1, arm: 1, oa: 1, ob: 1 });
      cap(S, P, fa([0.2, -fl - 14, 0.4]), fa([0.3, -fl - 46, 0.6]), 6.2, 7.0, sm, G.sleeve, { sleeve: 1, arm: 1, oa: 1, u0: fl + 12.5 + y0 });   // Phase 111: on, past the picture's edge
    }
    // Phase 111: the palm side of the wrist. Bare: two creases across it and the two tendons running up the forearm;
    // gloved in leather: the gather where the glove is drawn in
    const wristP = (x, y, lift) => fa([x, y, -Math.sqrt(Math.max(0, 2.3 * 2.3 - x * x)) - 0.2 + (lift || 0)]);
    if (!glass && !gloved) {
      for (const y of [0.9, 0.2]) line(S, P, [-1.9, -1.0, 0, 1.0, 1.9].map((x) => wristP(x, y + x * x * 0.06)), 'crease1', G.wrist);
      for (const x of [-0.5, 0.55]) line(S, P, [-0.4, -2.2, -4.2, -6.0].map((y) => wristP(x * (1 - y * 0.03), y)), 'tendon', G.wrist);
    } else if (!glass && hm === M.GLOVE && !wear.fingerless) {
      line(S, P, [-2.0, -1.0, 0, 1.0, 2.0].map((x) => wristP(x, 0.5)), 'crease1', G.wrist);
    }
    // details on the back of the hand
    const dors = (x, y) => [x, y, 1.42 * Math.sqrt(Math.max(0, 1 - (x / 4.0) ** 2 - ((y - 5) / 5.5) ** 2)) - 0.1];
    if (!glass && (hm === M.GLOVE || hm === M.MAIL || hm === M.PLATE)) {
      const seam = hm === M.GLOVE ? (wear.pattern === 'grain' || wear.material === 'leather' ? 'stitch' : wear.form === 'mitts' ? 'none' : 'dark') : 'none';
      for (const sx of [-1.9, 0.0, 1.85]) line(S, P, [dors(sx * 0.9, 9.0), dors(sx * 0.72, 6.5), dors(sx * 0.5, 3.6)], seam, G.palm);
      for (let i = 0; i < 4; i++) {
        const J = fingers[i], F = FING[i], d = norm(sub(J[2], J[1])), zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d)))), rr = F.r[1] * 1.02;
        if (hm !== M.MAIL) line(S, P, [add(add(J[1], mul(zc, rr)), [-0.5, 0, 0]), add(add(J[1], mul(zc, rr)), [0.5, 0, 0])], hm === M.PLATE ? 'dark' : 'crease', G.f[i]);
        if (hm === M.PLATE) { const d2 = norm(sub(J[1], J[0])), z2 = norm(sub([0, 0, 1], mul(d2, dot([0, 0, 1], d2)))); line(S, P, [add(add(J[0], mul(z2, F.r[0] * 1.06)), [-0.6, 0, 0]), add(add(J[0], mul(z2, F.r[0] * 1.06)), [0.6, 0, 0])], 'dark', G.f[i]); }
      }
      if (hm === M.GLOVE) for (let i = 0; i < 4; i++) spot(S, P, add(FING[i].k, [0, 0.1, 1.1]), 0.42, 'wear', G.palm);
      if (hm === M.PLATE) line(S, P, [dors(-3.2, 7.4), dors(0, 7.9), dors(3.0, 7.2)], 'dark', G.palm);
      if (wear.form === 'wraps') for (let i = 0; i < 4; i++) for (const t of [0.35, 0.75]) { const J = fingers[i]; const c = lerp3(J[0], J[1], t), d = norm(sub(J[1], J[0])); const zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d)))); line(S, P, [add(add(c, mul(zc, FING[i].r[0])), [-0.6, -0.2, 0]), add(add(c, mul(zc, FING[i].r[0])), [0.6, 0.2, 0])], 'dark', G.f[i]); }
      if (wear.form === 'wraps') for (const y of [3.0, 5.2, 7.2]) line(S, P, [dors(-3.4, y - 0.4), dors(0, y), dors(3.3, y + 0.4)], 'dark', G.palm);
      if (wear.form === 'darned' && P.mirror) { const J = fingers[0]; line(S, P, [lerp3(J[0], J[1], 0.3), lerp3(J[0], J[1], 0.8)].map((q) => add(q, [0, 0, FING[0].r[0] * 0.95])), 'darn', G.f[0]); }
    }
    if (hm === M.SKIN || wear.fingerless) {
      for (let i = 0; i < 4; i++) {
        const k = FING[i].k, J = fingers[i];
        if (hm === M.SKIN) { line(S, P, [dors(k[0] * 0.95, k[1] - 1.2), dors(k[0] * 0.7, 6.0), dors(k[0] * 0.32, 2.6)], 'tendon', G.palm); spot(S, P, add(k, [0, 0.1, 1.0]), 0.95, 'red', G.palm); }
        spot(S, P, add(J[1], [0, 0.2, 0.5]), 0.45, 'red', G.f[i]);
        const d = norm(sub(J[3], J[2])), zc = norm(sub([0, 0, 1], mul(d, dot([0, 0, 1], d))));
        line(S, P, [add(lerp3(J[2], J[3], 0.45), mul(zc, FING[i].r[2] * 0.85)), add(lerp3(J[2], J[3], 0.92), mul(zc, FING[i].r[2] * 0.62))], 'nail', G.f[i]);
      }
      const d = norm(sub(tt, ti)), side = curl === 'open' ? [0.25, -0.2, 1] : [-0.75, 0.1, 0.6], zc = norm(sub(side, mul(d, dot(side, d))));
      line(S, P, [add(lerp3(ti, tt, 0.5), mul(zc, 0.85)), add(lerp3(ti, tt, 0.92), mul(zc, 0.62))], 'nail', G.thumb);
    }
    if (hm === M.GLOVE && (wear.material === 'leather')) line(S, P, [add(tm, [0, 0, 1.0]), add(ti, [0.2, 0, 0.95]), add(lerp3(ti, tt, 0.7), [0.2, 0, 0.85])], 'dark', G.thumb);
    return { G, fingers };
  }

  // ---------------------------------------------------------------- rasterising
  function raster(S) {
    const N = W * H;
    const B = { depth: new Float32Array(N).fill(-1e9), nx: new Float32Array(N), ny: new Float32Array(N), nz: new Float32Array(N), mat: new Uint8Array(N), grp: new Int32Array(N), u: new Float32Array(N), v: new Float32Array(N), prim: new Int32Array(N).fill(-1) };
    const put = (i, z, nx, ny, nz, p, pi, u, v) => { if (z <= B.depth[i]) return; B.depth[i] = z; B.nx[i] = nx; B.ny[i] = ny; B.nz[i] = nz; B.mat[i] = p.mat; B.grp[i] = p.grp; B.u[i] = u; B.v[i] = v; B.prim[i] = pi; };
    S.prims.forEach((p, pi) => {
      const P = p.P;
      if (p.k === 'cap') {
        const A = proj(P, p.a), Bp = proj(P, p.b), Ra = p.ra * P.s * A[3], Rb = p.rb * P.s * Bp[3];
        const x0 = Math.max(0, Math.floor(Math.min(A[0] - Ra, Bp[0] - Rb))), x1 = Math.min(W - 1, Math.ceil(Math.max(A[0] + Ra, Bp[0] + Rb)));
        const y0 = Math.max(0, Math.floor(Math.min(A[1] - Ra, Bp[1] - Rb))), y1 = Math.min(H - 1, Math.ceil(Math.max(A[1] + Ra, Bp[1] + Rb)));
        const oa = !!(p.tag && p.tag.oa), ob = !!(p.tag && p.tag.ob);
        const dx = Bp[0] - A[0], dy = Bp[1] - A[1], l2 = dx * dx + dy * dy || 1e-6, len = Math.hypot(p.b[0] - p.a[0], p.b[1] - p.a[1], p.b[2] - p.a[2]), il = 1 / Math.sqrt(l2);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const px = x + 0.5, py = y + 0.5;
          let t = ((px - A[0]) * dx + (py - A[1]) * dy) / l2;
          // Phase 111: an end that another solid carries on from is left open (no rounded end): seen along the arm, the
          // rounded ends of the sleeve's parts stood out of it as pale discs
          if ((t < 0 && oa) || (t > 1 && ob)) continue;
          t = t < 0 ? 0 : t > 1 ? 1 : t;
          const cx = A[0] + dx * t, cy = A[1] + dy * t, r = Ra + (Rb - Ra) * t, ox = px - cx, oy = py - cy, d2 = ox * ox + oy * oy;
          if (d2 >= r * r) continue;
          const h = Math.sqrt(r * r - d2), k = A[3] + (Bp[3] - A[3]) * t, z = A[2] + (Bp[2] - A[2]) * t + h / (P.s * k), side = (ox * (-dy) + oy * dx) * il;
          put(y * W + x, z, ox / r, -oy / r, h / r, p, pi, t * len, Math.asin(Math.max(-1, Math.min(1, side / r))));
        }
      } else if (p.k === 'ell') {
        const C = proj(P, p.c), k = C[3], [a, b, c] = p.e, det = dot(a, cross(b, c));
        const inv = [mul(cross(b, c), 1 / det), mul(cross(c, a), 1 / det), mul(cross(a, b), 1 / det)];
        const rmax = Math.max(Math.hypot(...a), Math.hypot(...b), Math.hypot(...c)) * P.s * k;
        const x0 = Math.max(0, Math.floor(C[0] - rmax)), x1 = Math.min(W - 1, Math.ceil(C[0] + rmax)), y0 = Math.max(0, Math.floor(C[1] - rmax)), y1 = Math.min(H - 1, Math.ceil(C[1] + rmax));
        const bz = [inv[0][2], inv[1][2], inv[2][2]], bb = dot(bz, bz);
        for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
          const wx = (x + 0.5 - C[0]) / (P.s * k), wy = -(y + 0.5 - C[1]) / (P.s * k);
          const q = [inv[0][0] * wx + inv[0][1] * wy, inv[1][0] * wx + inv[1][1] * wy, inv[2][0] * wx + inv[2][1] * wy];
          const ab = dot(q, bz), disc = ab * ab - bb * (dot(q, q) - 1); if (disc <= 0) continue;
          const zz = (-ab + Math.sqrt(disc)) / bb, s = add(q, mul(bz, zz));
          const n = norm([inv[0][0] * s[0] + inv[1][0] * s[1] + inv[2][0] * s[2], inv[0][1] * s[0] + inv[1][1] * s[1] + inv[2][1] * s[2], inv[0][2] * s[0] + inv[1][2] * s[1] + inv[2][2] * s[2]]);
          put(y * W + x, p.c[2] + zz, n[0], n[1], n[2], p, pi, s[1], s[0]);
        }
      }
    });
    return B;
  }

  // ---------------------------------------------------------------- shading by rules
  const LIGHT = norm([-0.6, 0.6, 0.45]), HALF = norm(add(LIGHT, [0, 0, 1]));
  function shade(S, B) {
    const N = W * H, tone = new Int8Array(N).fill(-1), tint = new Uint8Array(N), prims = S.prims;
    for (let i = 0; i < N; i++) {
      const m = B.mat[i]; if (!m) continue;
      const p = prims[B.prim[i]], tag = p.tag || {};
      let n = [B.nx[i], B.ny[i], B.nz[i]];
      const w = dot(n, LIGHT), sp = dot(n, HALF), cfg = SHADE[m], off = (hash(B.grp[i], 77) - 0.5) * 0.09;
      let t = 1; for (const c of cfg.cuts) if (w > c + off) t++;
      // Phase 111: leather's lightest tone on the broad forms (the back of the hand, the pads, the wrist) only where they
      // face the light squarely: at 0.62 it lay there in blotches
      if (m === M.GLOVE && (tag.palm || tag.fore) && t === 4 && w < 0.9) t = 3;
      if (sp > cfg.spec && w > 0.3 && !tag.palm && !tag.fore) t = cfg.top;
      tone[i] = t;
    }
    return { tone, tint };
  }
  // Phase 111: a cloth sleeve's folds are drawn, not shaded: the sleeve is lit as the plain round it is (clean bands of
  // tone along it), and each fold is a dark crease with a light ridge beside it, running askew round the arm, unevenly
  // spaced. (They were a ripple in the surface's slope; along a sleeve seen at length that broke its light into a row of
  // pale ovals, like a pattern printed on the cloth.)
  function folds(S, B, T) {
    const t = T.tone, TWO = Math.PI * 2;
    for (let i = 0; i < W * H; i++) {
      const m = B.mat[i]; if (m !== M.WOOL && m !== M.SCUFF) continue;
      const p = S.prims[B.prim[i]]; if (p.k !== 'cap' || !(p.tag && p.tag.sleeve)) continue;
      const u = B.u[i] + (p.tag.u0 || 0), q = (u * 0.75 + B.v[i] * 1.25 + 0.9 * Math.sin(u * 0.23 + 0.7)) / TWO, fr = q - Math.floor(q), wd = 0.2 / (p.P.s * 1.1);
      if (fr < wd) t[i] = Math.max(1, t[i] - 1); else if (fr < wd * 2) t[i] = Math.min(SHADE[m].top, t[i] + 1);
    }
  }
  function castShadow(B, T) {
    const out = new Int8Array(T.tone);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = IDX(x, y); if (!B.mat[i]) continue;
      const z = B.depth[i]; let sh = 0;
      for (let s = 1; s <= 3; s++) { const X = x - s, Y = y - s; if (!inb(X, Y)) break; const j = IDX(X, Y); if (B.mat[j] && B.grp[j] !== B.grp[i] && B.depth[j] > z + 0.9 + s * 0.35) { sh = 1; break; } }
      if (sh && out[i] > 1) out[i] -= 1;
    }
    T.tone = out;
  }
  function cleanup(B, T, skip) {
    for (let pass = 0; pass < 2; pass++) {
      const t = T.tone, out = new Int8Array(t);
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
        const i = IDX(x, y), m = B.mat[i]; if (!m || skip[m]) continue;
        let same = 0;
        for (const j of [i + 1, i - 1, i + W, i - W]) if (B.mat[j] === m && t[j] === t[i]) same++;
        if (same >= 1) continue;
        const cnt = {}; let best = t[i], bc = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const j = IDX(x + dx, y + dy); if (B.mat[j] !== m) continue; const c = (cnt[t[j]] = (cnt[t[j]] || 0) + 1); if (c > bc) { bc = c; best = t[j]; } }
        out[i] = best;
      }
      T.tone = out;
    }
  }
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
  function decals(S, B, T) {
    const t = T.tone;
    const onSurf = (x, y, z, grp) => { if (!inb(x, y)) return -1; const i = IDX(x, y); if (!B.mat[i]) return -1; if (Math.abs(B.depth[i] - z) > 1.1) return -1; if (grp != null && B.grp[i] !== grp) return -1; return i; };
    for (const L of S.lines) {
      if (L.mode === 'none') continue;
      const pts = L.pts.map((w) => proj(L.P, w)); let n = 0;
      for (let s = 0; s < pts.length - 1; s++) {
        const a = pts[s], b = pts[s + 1], steps = Math.max(1, Math.ceil(Math.max(Math.abs(b[0] - a[0]), Math.abs(b[1] - a[1])))); let last = -1;
        for (let k = 0; k <= steps; k++) {
          const f = k / steps, x = Math.floor(a[0] + (b[0] - a[0]) * f), y = Math.floor(a[1] + (b[1] - a[1]) * f), z = a[2] + (b[2] - a[2]) * f;
          const i = onSurf(x, y, z, L.grp); if (i < 0 || i === last) continue; last = i; n++;
          const top = SHADE[B.mat[i]].top;
          if (L.mode === 'dark') t[i] = Math.max(0, Math.min(t[i] - 2, 1));
          else if (L.mode === 'stitch') t[i] = (n % 3 === 0) ? Math.min(top - 1, t[i] + 1) : Math.max(0, Math.min(t[i] - 1, 2));
          else if (L.mode === 'crease') t[i] = Math.max(0, t[i] - 2);
          else if (L.mode === 'crease1') t[i] = Math.max(1, t[i] - 1);
          else if (L.mode === 'darn') t[i] = top;
          else if (L.mode === 'trim') T.tint[i] = 2;
          else if (L.mode === 'plate') T.tint[i] = 3;
          else if (L.mode === 'tendon') { if (t[i] >= 3) t[i] = Math.min(top - 1, t[i] + 1); }
          else if (L.mode === 'nail') { if (B.mat[i] === M.SKIN) { t[i] = Math.min(top, Math.max(t[i] + 2, 4)); T.tint[i] = 0; } }
        }
      }
    }
    for (const sp of S.spots) {
      const c = proj(sp.P, sp.c), r = Math.max(0.6, sp.r * sp.P.s * c[3]);
      for (let y = Math.floor(c[1] - r); y <= Math.ceil(c[1] + r); y++) for (let x = Math.floor(c[0] - r); x <= Math.ceil(c[0] + r); x++) {
        if ((x + 0.5 - c[0]) ** 2 + (y + 0.5 - c[1]) ** 2 > r * r) continue;
        const i = onSurf(x, y, c[2], sp.grp); if (i < 0) continue;
        if (sp.mode === 'wear') {   // Phase 111: a scuff, not a disc: a solid heart of a pixel or two, the rest in a checker
          const core = (x + 0.5 - c[0]) ** 2 + (y + 0.5 - c[1]) ** 2 < r * r * 0.3;
          if (t[i] >= 2 && t[i] < SHADE[B.mat[i]].top - 1 && (core || ((x + y) & 1) === 0)) t[i] += 1;
        }
        else if (sp.mode === 'red') { if (B.mat[i] === M.SKIN) T.tint[i] = 1; }
        else if (sp.mode === 'rivet') T.tint[i] = 2;
      }
    }
  }
  function mailRings(S, B, T) {
    const t = T.tone, ring = 1.2;   // a little coarser than option 3's: at the game's size its rings were busy
    for (let i = 0; i < W * H; i++) {
      if (B.mat[i] !== M.MAIL && B.mat[i] !== M.SLMAIL) continue;
      const pr = S.prims[B.prim[i]]; let a, b;
      if (pr.k === 'cap') { const r = (pr.ra + pr.rb) / 2; a = B.u[i] / ring; b = B.v[i] * r / (ring * 0.8); }
      else { a = B.u[i] * Math.hypot(...pr.e[1]) / ring; b = B.v[i] * Math.hypot(...pr.e[0]) / (ring * 0.8); }
      const row = Math.floor(b), fu = a + (row & 1) * 0.5, cu = fu - Math.floor(fu) - 0.5, cv = b - row - 0.5, d = Math.hypot(cu, cv), base = t[i];
      if (d < 0.2) t[i] = Math.max(0, base - 1);
      else if (d < 0.44) t[i] = Math.max(1, Math.min(3, base + ((cu + cv) < -0.1 ? 1 : 0)));
      else t[i] = Math.max(0, base - 1);
    }
  }
  function glassFacets(S, B, T) {
    const N = W * H, cell = 2.1, fid = new Int32Array(N).fill(-1);
    const V = (gx, gy, s) => [gx + (hash(gx * 7 + 3 + s, gy * 13 + 1) - 0.5) * 0.5, gy + (hash(gx * 11 + 5, gy * 3 + 9 + s) - 0.5) * 0.5];
    const inTri = (p, a, b, c) => {
      const d1 = (p[0] - b[0]) * (a[1] - b[1]) - (a[0] - b[0]) * (p[1] - b[1]), d2 = (p[0] - c[0]) * (b[1] - c[1]) - (b[0] - c[0]) * (p[1] - c[1]), d3 = (p[0] - a[0]) * (c[1] - a[1]) - (c[0] - a[0]) * (p[1] - a[1]);
      return !((d1 < 0 || d2 < 0 || d3 < 0) && (d1 > 0 || d2 > 0 || d3 > 0));
    };
    for (let i = 0; i < N; i++) {
      if (B.mat[i] !== M.GLASS) continue;
      const pi = B.prim[i], pr = S.prims[pi]; let a, b;
      if (pr.k === 'cap') { const r = (pr.ra + pr.rb) / 2; a = B.u[i] / cell; b = B.v[i] * r / (cell * 0.95); }
      else { const r0 = Math.hypot(...pr.e[0]), r1 = Math.hypot(...pr.e[1]); a = B.u[i] * r1 / cell; b = B.v[i] * r0 / cell; }
      const p = [a, b], gx = Math.floor(a), gy = Math.floor(b), sd = pi * 31; let id = -1;
      for (let oy = -1; oy <= 1 && id < 0; oy++) for (let ox = -1; ox <= 1 && id < 0; ox++) {
        const cx = gx + ox, cy = gy + oy, A = V(cx, cy, sd), Bv = V(cx + 1, cy, sd), C = V(cx, cy + 1, sd), Dv = V(cx + 1, cy + 1, sd);
        const diag = hash(cx * 5 + 1 + sd, cy * 9 + 7) < 0.5, t1 = diag ? [A, Bv, Dv] : [A, Bv, C], t2 = diag ? [A, Dv, C] : [Bv, Dv, C];
        if (inTri(p, ...t1)) id = ((cx + 100) * 200 + (cy + 100)) * 2; else if (inTri(p, ...t2)) id = ((cx + 100) * 200 + (cy + 100)) * 2 + 1;
      }
      if (id < 0) id = ((gx + 100) * 200 + (gy + 100)) * 2;
      fid[i] = id * 97 + pi;
    }
    const acc = new Map();
    for (let i = 0; i < N; i++) { if (fid[i] < 0) continue; let a = acc.get(fid[i]); if (!a) { a = [0, 0, 0, 0]; acc.set(fid[i], a); } a[0] += B.nx[i]; a[1] += B.ny[i]; a[2] += B.nz[i]; a[3]++; }
    const fn = new Map();
    for (const [k, a] of acc) fn.set(k, norm([a[0] / a[3] + (hash(k, 1) - 0.5) * 0.3, a[1] / a[3] + (hash(k, 2) - 0.5) * 0.3, a[2] / a[3] + (hash(k, 3) - 0.5) * 0.1]));
    const t = T.tone, cfg = SHADE[M.GLASS];
    for (let i = 0; i < N; i++) {
      if (fid[i] < 0) continue;
      const w = dot(fn.get(fid[i]), LIGHT); let tt = 1; for (const c of cfg.cuts) if (w > c) tt++;
      const hv = hash(fid[i], 5); if (hv < 0.22) tt--; else if (hv > 0.8) tt++;
      t[i] = Math.max(1, Math.min(5, tt));
    }
    for (let y = 0; y < H - 1; y++) for (let x = 0; x < W - 1; x++) {
      const i = IDX(x, y); if (fid[i] < 0) continue;
      for (const j of [IDX(x + 1, y), IDX(x, y + 1)]) {
        if (fid[j] < 0 || fid[j] === fid[i]) continue;
        const hh = hash(Math.min(fid[i], fid[j]), Math.max(fid[i], fid[j])), k = t[i] <= t[j] ? i : j;
        if (hh < 0.16) t[k] = Math.max(0, Math.min(t[k] - 1, 1));
        else if (hh > 0.9 && Math.max(t[i], t[j]) >= 4) { const o = k === i ? j : i; t[o] = 6; }
      }
    }
    T.fid = fid;
  }
  function edgeDist(B) {
    const N = W * H, d = new Float32Array(N);
    for (let i = 0; i < N; i++) d[i] = B.mat[i] ? 1e4 : 0;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const i = IDX(x, y); if (!d[i]) continue; let m = d[i]; if (x > 0) m = Math.min(m, d[i - 1] + 1); if (y > 0) m = Math.min(m, d[i - W] + 1); if (x > 0 && y > 0) m = Math.min(m, d[i - W - 1] + 1.41); if (x < W - 1 && y > 0) m = Math.min(m, d[i - W + 1] + 1.41); if (x === 0 || y === 0) m = Math.min(m, 1); d[i] = m; }
    for (let y = H - 1; y >= 0; y--) for (let x = W - 1; x >= 0; x--) { const i = IDX(x, y); if (!d[i]) continue; let m = d[i]; if (x < W - 1) m = Math.min(m, d[i + 1] + 1); if (y < H - 1) m = Math.min(m, d[i + W] + 1); if (x < W - 1 && y < H - 1) m = Math.min(m, d[i + W + 1] + 1.41); if (x > 0 && y < H - 1) m = Math.min(m, d[i + W - 1] + 1.41); d[i] = m; }
    return d;
  }
  // outlines: selective on the silhouette, inner lines where a part passes in front of another. A silhouette that runs
  // off the picture (the forearm out of the bottom or the right) gets no outline there.
  function outlines(B, T) {
    const t = T.tone, out = new Int8Array(t), kind = new Uint8Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const i = IDX(x, y), m = B.mat[i]; if (!m) continue;
      let lit = 0, dark = 0;
      for (const [dx, dy, toward] of [[-1, 0, 1], [0, -1, 1], [1, 0, 0], [0, 1, 0]]) { const X = x + dx, Y = y + dy; if (inb(X, Y) && !B.mat[IDX(X, Y)]) { if (toward) lit++; else dark++; } }
      if (lit || dark) {
        const shadowSide = dark > 0 && (B.nx[i] * LIGHT[0] + B.ny[i] * LIGHT[1] + B.nz[i] * LIGHT[2]) < 0.35;
        if (m === M.GLASS) { out[i] = shadowSide ? 6 : 1; kind[i] = shadowSide ? 3 : 1; }
        else if (shadowSide || dark) { out[i] = 0; kind[i] = 2; }
        else { out[i] = Math.max(0, Math.min(t[i] - 2, 2)); kind[i] = 1; }
        continue;
      }
      for (const j of [i - 1, i + 1, i - W, i + W]) if (B.grp[j] !== B.grp[i] && B.depth[j] > B.depth[i] + 0.55) { out[i] = m === M.GLASS ? 0 : Math.max(0, Math.min(t[i] - 2, 1)); kind[i] = 4; break; }
    }
    T.tone = out; T.kind = kind;
  }
  function woolDither(B, T) {
    const t = T.tone, out = new Int8Array(t);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y); if (B.mat[i] !== M.WOOL || T.kind[i] || t[i] !== 2) continue;
      let up = 0; for (const j of [i - 1, i + 1, i - W, i + W]) if (B.mat[j] === M.WOOL && t[j] === 3) up = 1;
      if (up && ((x + y) & 1) === 0) out[i] = 3;
    }
    T.tone = out;
  }
  function rim(B, T) {
    const t = T.tone, k = T.kind, out = new Int8Array(t);
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      const i = IDX(x, y), m = B.mat[i]; if (!m || k[i]) continue;
      if (m === M.GLASS || m === M.MAIL || m === M.SLMAIL) continue;
      let near = 0; for (const j of [i + 1, i + W, i + W + 1]) if (k[j] === 2) near++;
      if (near >= 2 && B.nz[i] < 0.75 && t[i] <= 2 && t[i] >= 1) out[i] = t[i] + 1;
    }
    T.tone = out;
  }

  // the hand layers of one scene: rgba of the arm (forearms, cuffs, sleeves) and of the hands, the glass mask, the halo
  function shadeScene(S, wear) {
    const B = raster(S), T = shade(S, B);
    castShadow(B, T);
    const skip = { [M.MAIL]: 1, [M.SLMAIL]: 1, [M.GLASS]: 1 };
    modeFilter(B, T, skip); cleanup(B, T, skip);
    if (S.prims.some((p) => p.mat === M.GLASS)) glassFacets(S, B, T);
    folds(S, B, T); mailRings(S, B, T); decals(S, B, T); outlines(B, T); woolDither(B, T); rim(B, T);
    const PAL = palettes(wear), N = W * H, ed = edgeDist(B);
    const col = new Uint8ClampedArray(N * 4), layer = new Uint8Array(N), glass = new Uint8Array(N);   // layer: 1 arm, 2 hand, 3 halo
    for (let i = 0; i < N; i++) {
      const m = B.mat[i], x = i % W, y = (i / W) | 0;
      if (!m) {   // the glass's quarter glow: a faint pale halo one pixel out
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (inb(X, Y) && B.mat[IDX(X, Y)] === M.GLASS) { col[i * 4] = 150; col[i * 4 + 1] = 226; col[i * 4 + 2] = 255; col[i * 4 + 3] = 70; layer[i] = 3; break; } }
        continue;
      }
      const pal = m === M.GLASS ? PAL[m] : m === M.SKIN && T.tint[i] === 1 ? PAL.skinRed : T.tint[i] === 2 ? PAL[M.TRIM] : T.tint[i] === 3 ? PAL[M.PLATE] : PAL[m];
      const tt = Math.max(0, Math.min(pal.length - 1, T.tone[i]));
      let c = pal[tt];
      if (m === M.GLASS) { glass[i] = 1; if (ed[i] >= 3 && tt <= 3 && hash(T.fid ? T.fid[i] : 0, 9) < 0.18) c = PAL[M.GLASS][Math.min(5, tt + 1)]; }
      col[i * 4] = c[0]; col[i * 4 + 1] = c[1]; col[i * 4 + 2] = c[2]; col[i * 4 + 3] = 255;
      const tag = S.prims[B.prim[i]].tag || {};
      layer[i] = tag.arm ? 1 : 2;
    }
    // Phase 111: a Song's light (S.song: where it burns on the sheet, and how far toward the eye, in cm): how squarely
    // each pixel faces it, and how near it is, in three steps. The picture stays as painted; the steps are drawn over
    // it in the Song's colour (songCanvas), so the light lies on the inner edges of the fingers and palms and nowhere else
    let song = null;
    if (S.song) {
      song = new Uint8Array(N);
      for (let i = 0; i < N; i++) {
        const m = B.mat[i]; if (!m || T.kind[i] === 2) continue;
        const P = S.prims[B.prim[i]].P, z = B.depth[i], k = P.D / (P.D - Math.min(z, P.D * 0.33)), kl = P.D / (P.D - S.song.z);
        const dx = (S.song.x - P.ax) / (P.s * kl) - (i % W + 0.5 - P.ax) / (P.s * k), dy = -(S.song.y - P.ay) / (P.s * kl) + (((i / W) | 0) + 0.5 - P.ay) / (P.s * k), dz = S.song.z - z;
        const d = Math.hypot(dx, dy, dz) || 1, w = (B.nx[i] * dx + B.ny[i] * dy + B.nz[i] * dz) / d, v = Math.max(0, w * 0.9 + 0.1) / (1 + (d / S.song.r) ** 2);
        song[i] = v > 0.46 ? 3 : v > 0.28 ? 2 : v > 0.13 ? 1 : 0;
      }
    }
    return { col, layer, glass, song };
  }

  // ---------------------------------------------------------------- placing a hand
  // the hand's frame for a grip (option 3's sword hold), turned about the view axis and moved so its fist closes on
  // the grip at the grip frame FP87 gives: m maps the grip's own frame (origin on the grip, the business end up -y) to
  // the picture; everything in low pixels here
  const SW = { Y: [-0.958, 0.284, 0.037], Z: [-0.224, -0.662, -0.715], dev: 42, roll: 9 };
  const S_GRIP = 15.6;             // picture pixels per centimetre of hand, for a hand at FP87's size (its fist spans the grip so)
  const wrapA = (a) => { while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI; return a; };
  function gripPose(g, opt) {
    const m = g.m, sc = Math.hypot(m[0], m[1]) || 1;
    const T = [m[4] / GR + OX, m[5] / GR + OY], U = norm([-m[2], -m[3], 0]), want = Math.atan2(U[1], U[0]);
    const P = { f: frame(SW.Y, SW.Z), s: S_GRIP * sc * ((opt && opt.size) || 1) / GR, ax: 0, ay: 0, D, mirror: !!g.mirror, roll: SW.roll };
    const ang = (r) => { P.roll = r; const a = scr(P, sub(GRIP_C, GRIP_AX)), b = scr(P, add(GRIP_C, GRIP_AX)); return Math.atan2(a[1] - b[1], a[0] - b[0]); };
    let r = SW.roll;
    for (let it = 0; it < 5; it++) { const e = wrapA(ang(r) - want); if (Math.abs(e) < 1e-4) break; const d = wrapA(ang(r + 1) - ang(r)) || 1e-3; r -= e / d; }
    P.roll = r;
    const c = scr(P, GRIP_C); P.ax = T[0] - c[0]; P.ay = T[1] - c[1];
    return P;
  }
  // the wrist's bend (toward the little finger) that sends the forearm along FP87's own forearm line, so it leaves the
  // picture where the old one did (off the bottom, or the side that is off the screen)
  function armDev(P, arm, dev0, flexW) {
    if (!arm) return dev0;
    const want = Math.atan2((arm[3] - arm[1]), (arm[2] - arm[0])), piv = [0, 0.8, -0.2];
    const fa = (q, dev) => { let r = sub(q, piv); r = rot(r, [0, 0, 1], dev * D2R); if (flexW) r = rot(r, [1, 0, 0], flexW * D2R); return add(piv, r); };
    const ang = (dev) => { const a = scr(P, fa([0, -1.5, -0.15], dev)), b = scr(P, fa([0.1, -26, 0.2], dev)); return Math.atan2(b[1] - a[1], b[0] - a[0]); };
    let d = dev0;
    for (let it = 0; it < 6; it++) { const e = wrapA(ang(d) - want); if (Math.abs(e) < 0.01) break; const k = wrapA(ang(d + 2) - ang(d)) / 2; if (Math.abs(k) < 1e-4) break; d = Math.max(-25, Math.min(95, d - e / k)); }
    return d;
  }
  // a hand fitted to a box: the hand's own parts (not the arm) as tall as h, centred at (cx, cy); P is posed already
  function fitPose(P, curl, cx, cy, h, wear) {
    const S = Scene(); P.ax = 0; P.ay = 0; P.s = 1;
    addHand(S, P, { curl, wear, foreLen: 2, noSleeve: true });
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of S.prims) { if (p.tag && p.tag.arm) continue; const pts = p.k === 'cap' ? [[p.a, p.ra], [p.b, p.rb]] : [[p.c, Math.max(...p.e.map((v) => Math.hypot(...v)))]]; for (const [w, r] of pts) { const q = proj(P, w); x0 = Math.min(x0, q[0] - r * q[3]); x1 = Math.max(x1, q[0] + r * q[3]); y0 = Math.min(y0, q[1] - r * q[3]); y1 = Math.max(y1, q[1] + r * q[3]); } }
    P.s = h / Math.max(1e-6, y1 - y0); P.ax = cx - P.s * (x0 + x1) / 2; P.ay = cy - P.s * (y0 + y1) / 2;
    return P;
  }

  // ---------------------------------------------------------------- the weapon, as pixel art
  // FP87's own painting (no hand), averaged down to the grain; a small palette of hue-shifted ramps from its own
  // colours; strays removed; sel-out outlines (a darker tone of its own colour on the lit side, near black on the shadow side)
  function pixelWeapon(src, w, h) {
    const SW0 = src.width, SH0 = src.height, sd = src.getContext('2d').getImageData(0, 0, SW0, SH0).data;
    const N = w * h, R = new Float32Array(N), Gc = new Float32Array(N), Bc = new Float32Array(N), on1 = new Uint8Array(N);
    for (let by = 0; by < h; by++) for (let bx = 0; bx < w; bx++) {
      let sa = 0, r = 0, g = 0, b = 0, mx = 0;
      for (let yy = by * GR; yy < Math.min(SH0, by * GR + GR); yy++) for (let xx = bx * GR; xx < Math.min(SW0, bx * GR + GR); xx++) { const q = (yy * SW0 + xx) * 4, a = sd[q + 3]; if (!a) continue; sa += a; r += sd[q] * a; g += sd[q + 1] * a; b += sd[q + 2] * a; if (a > mx) mx = a; }
      const cov = sa / (GR * GR * 255), i = by * w + bx;
      if (cov >= 0.42 || (mx > 120 && cov >= 0.1)) { on1[i] = 1; R[i] = r / sa; Gc[i] = g / sa; Bc[i] = b / sa; }
    }
    // families by colour, lightness aside: a few k-means rounds on the chroma, seeded far apart (deterministic)
    const ids = []; for (let i = 0; i < N; i++) if (on1[i]) ids.push(i);
    const out = new Uint8ClampedArray(N * 4); if (!ids.length) return { col: out, on: on1 };
    const ch = (i) => { const r = R[i], g = Gc[i], b = Bc[i], l = (r * 0.3 + g * 0.55 + b * 0.15) + 24; return [(r - g) / l * 100, ((r + g) / 2 - b) / l * 100]; };
    const CH = ids.map(ch), K = Math.min(7, Math.max(1, Math.round(ids.length / 60)));
    const cen = [CH[0].slice()];
    while (cen.length < K) { let bi = -1, bd = -1; for (let n = 0; n < CH.length; n += 3) { let dm = 1e9; for (const c of cen) dm = Math.min(dm, (CH[n][0] - c[0]) ** 2 + (CH[n][1] - c[1]) ** 2); if (dm > bd) { bd = dm; bi = n; } } if (bd < 36) break; cen.push(CH[bi].slice()); }
    const fam = new Int8Array(ids.length);
    for (let it = 0; it < 6; it++) {
      const acc = cen.map(() => [0, 0, 0]);
      for (let n = 0; n < CH.length; n++) { let best = 0, bd = 1e9; for (let k = 0; k < cen.length; k++) { const d = (CH[n][0] - cen[k][0]) ** 2 + (CH[n][1] - cen[k][1]) ** 2; if (d < bd) { bd = d; best = k; } } fam[n] = best; acc[best][0] += CH[n][0]; acc[best][1] += CH[n][1]; acc[best][2]++; }
      for (let k = 0; k < cen.length; k++) if (acc[k][2]) cen[k] = [acc[k][0] / acc[k][2], acc[k][1] / acc[k][2]];
    }
    // each family's ramp: its mean colour at its own place between its darkest and its lightest, hue-shifted
    const RAMPS = cen.map((_, k) => {
      let r = 0, g = 0, b = 0, n = 0, lmin = 1, lmax = 0, ls = [];
      for (let j = 0; j < ids.length; j++) if (fam[j] === k) { const i = ids[j]; r += R[i]; g += Gc[i]; b += Bc[i]; n++; const l = rgb2hsl([R[i], Gc[i], Bc[i]])[2]; ls.push(l); }
      if (!n) return null;
      ls.sort((a, b2) => a - b2); lmin = ls[Math.floor(ls.length * 0.03)]; lmax = ls[Math.floor(ls.length * 0.97)];
      const base = [r / n, g / n, b / n], lb = rgb2hsl(base)[2], NT = 6;
      const lo = Math.max(0.03, Math.min(lb - 0.08, lmin * 0.85)), hi = Math.min(0.97, Math.max(lb + 0.1, lmax + 0.04));
      const bi = Math.max(1, Math.min(NT - 2, Math.round((lb - lo) / Math.max(0.05, hi - lo) * (NT - 1))));
      return ramp(base, NT, bi, { hs: -14, hl: 10, lo, hi, ss: 0.12, sl: 0.25 });
    });
    const F = new Int8Array(N).fill(-1), Tn = new Int8Array(N);
    for (let j = 0; j < ids.length; j++) {
      const i = ids[j], rp = RAMPS[fam[j]]; F[i] = fam[j];
      let best = 0, bd = 1e9; for (let t = 0; t < rp.length; t++) { const c = rp[t], d = (c[0] - R[i]) ** 2 * 0.3 + (c[1] - Gc[i]) ** 2 * 0.55 + (c[2] - Bc[i]) ** 2 * 0.15; if (d < bd) { bd = d; best = t; } }
      Tn[i] = best;
    }
    // strays: a pixel no 4-neighbour of its family shares a tone with takes the commonest tone of its family around it
    for (let pass = 0; pass < 2; pass++) {
      const t2 = new Int8Array(Tn);
      for (let y = 1; y < h - 1; y++) for (let x = 1; x < w - 1; x++) {
        const i = y * w + x; if (F[i] < 0) continue;
        let same = 0; for (const j of [i - 1, i + 1, i - w, i + w]) if (F[j] === F[i] && Tn[j] === Tn[i]) same++;
        if (same) continue;
        const cnt = new Int8Array(8); let best = Tn[i], bc = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { if (!dx && !dy) continue; const j = i + dy * w + dx; if (F[j] !== F[i]) continue; const c = ++cnt[Tn[j]]; if (c > bc) { bc = c; best = Tn[j]; } }
        if (bc >= 2) t2[i] = best;
      }
      Tn.set(t2);
    }
    // sel-out
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; if (F[i] < 0) continue;
      const rp = RAMPS[F[i]]; let t = Tn[i];
      const emp = (X, Y) => X >= 0 && Y >= 0 && X < w && Y < h && F[Y * w + X] < 0;
      const litE = emp(x - 1, y) || emp(x, y - 1), darkE = emp(x + 1, y) || emp(x, y + 1);
      const thin = (emp(x - 1, y) && emp(x + 1, y)) || (emp(x, y - 1) && emp(x, y + 1));
      let c;
      if (thin) c = rp[Math.max(1, t - 1)];                 // a cord, a string, a thin bar: its own colour, not all outline
      else if (darkE) c = mix(rp[0], [8, 8, 14], 0.45);
      else if (litE) c = rp[Math.max(0, Math.min(t - 2, 2))];
      else c = rp[t];
      out[i * 4] = c[0]; out[i * 4 + 1] = c[1]; out[i * 4 + 2] = c[2]; out[i * 4 + 3] = 255;
    }
    return { col: out, on: on1 };
  }

  // ---------------------------------------------------------------- the picture
  // Phase 111: the picture is built on a wider sheet than FP87's own canvas, MRG low pixels more below it and to one
  // side, so the forearm and its sleeve run on past the picture's edge. What is on the sheet inside FP87's canvas is the
  // picture, exactly where it was; the arms on the whole sheet are given beside it as `ext` (js/body21.js draws an `ext`
  // under its picture, in the same transform). Through a swing the picture turns and travels, and the arm used to end
  // in the air at the picture's edge; now it runs out of the view.
  const MRG = 110;
  let OX = 0, OY = 0;                 // where the picture's own corner is on the sheet
  function sheet(Wf, Hf, left) { const w = Math.ceil(Wf / GR), h = Math.ceil(Hf / GR); OX = left ? MRG : 0; OY = 0; W = w + MRG; H = h + MRG; return { w, h }; }
  function plain(Wf, Hf) { W = Math.ceil(Wf / GR); H = Math.ceil(Hf / GR); OX = 0; OY = 0; return { w: W, h: H }; }
  const mkc = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  // nearest-neighbour up by the grain: a w x h rectangle of the sheet at (x0, y0) into a canvas of its own
  function upCanvas(src, x0, y0, w, h, Wf, Hf) {
    const c = mkc(Wf, Hf), x = c.getContext('2d'), id = x.createImageData(Wf, Hf), d = id.data;
    for (let y = 0; y < Hf; y++) { const ly = y0 + ((y / GR) | 0); if (ly >= H) break; const row = ly * W; for (let xx = 0; xx < Wf; xx++) { const lx = x0 + ((xx / GR) | 0); if (lx >= W) break; const q = (row + lx) * 4, t = (y * Wf + xx) * 4; d[t] = src[q]; d[t + 1] = src[q + 1]; d[t + 2] = src[q + 2]; d[t + 3] = src[q + 3]; } }
    x.putImageData(id, 0, 0); return c;
  }
  // the glow: the glass's bright edges, rim and lit facets (about a quarter of the arm, at a quarter of its old light: its
  // deep azure planes are lit by the world like the rest of you, so at rest it does not blaze), and the brightest glints
  function glowOf(low, gm) {
    const em = new Uint8ClampedArray(W * H * 4); let any = false;
    for (let i = 0; i < W * H; i++) {
      const q = i * 4; if (!low[q + 3]) continue;
      if (gm[i]) { if (low[q + 2] > 230 && low[q + 3] === 255) { em[q] = low[q] * 0.22; em[q + 1] = low[q + 1] * 0.22; em[q + 2] = low[q + 2] * 0.22; em[q + 3] = 255; any = true; } continue; }
      const l = low[q] * 0.3 + low[q + 1] * 0.55 + low[q + 2] * 0.15;
      if (l > 180 && low[q + 3] > 200) { const k = Math.min(1, (l - 180) / 60) * 0.2; em[q] = low[q] * k; em[q + 1] = low[q + 1] * k; em[q + 2] = low[q + 2] * k; em[q + 3] = 255; any = true; }
    }
    return any ? em : null;
  }
  const SONG_A = [0, 64, 118, 176];   // how strongly each step of a Song's light lies over the painted colour
  // C: what compose gives (the sheet); x0: where the picture's corner is on it; (Wf, Hf): FP87's canvas
  function finish(C, x0, Wf, Hf) {
    const low = C.low, w = Math.ceil(Wf / GR), h = Math.ceil(Hf / GR), em = glowOf(low, C.gm);
    const out = { canvas: upCanvas(low, x0, 0, w, h, Wf, Hf), emis: em ? upCanvas(em, x0, 0, w, h, Wf, Hf) : null, ext: null, song: null };
    out.canvas.__px111 = true; if (out.emis) out.emis.__px111 = true;
    // the arms beyond the picture's edge
    let far = false;
    if (C.arm && (W > w || H > h)) for (let y = 0; y < H && !far; y++) for (let x = 0; x < W; x++) if (C.arm[y * W + x] && (x < x0 || x >= x0 + w || y >= h)) { far = true; break; }
    if (far) {
      const al = new Uint8ClampedArray(W * H * 4), ae = em ? new Uint8ClampedArray(W * H * 4) : null; let anyE = false;
      for (let i = 0; i < W * H; i++) { if (!C.arm[i]) continue; const q = i * 4; al[q] = low[q]; al[q + 1] = low[q + 1]; al[q + 2] = low[q + 2]; al[q + 3] = low[q + 3]; if (ae && em[q + 3]) { ae[q] = em[q]; ae[q + 1] = em[q + 1]; ae[q + 2] = em[q + 2]; ae[q + 3] = 255; anyE = true; } }
      out.ext = { canvas: upCanvas(al, 0, 0, W, H, W * GR, H * GR), emis: anyE ? upCanvas(ae, 0, 0, W, H, W * GR, H * GR) : null, ox: -x0 * GR, oy: 0, w: W * GR, h: H * GR };
      out.ext.canvas.__px111 = true; if (out.ext.emis) out.ext.emis.__px111 = true;
    }
    if (C.song) {
      const sm = new Uint8ClampedArray(W * H * 4); let any = false;
      for (let i = 0; i < W * H; i++) { const v = C.song[i]; if (!v || !low[i * 4 + 3]) continue; const q = i * 4; sm[q] = sm[q + 1] = sm[q + 2] = 255; sm[q + 3] = SONG_A[v]; any = true; }
      if (any) { out.song = upCanvas(sm, x0, 0, w, h, Wf, Hf); out.song.__px111song = true; }
    }
    return out;
  }
  // lay the layers: the arms, then the weapon, then the hands
  function compose(hands, weapon) {
    const N = W * H, low = new Uint8ClampedArray(N * 4), gm = new Uint8Array(N), arm = new Uint8Array(N), song = hands && hands.song ? new Uint8Array(N) : null;
    for (let i = 0; i < N; i++) {
      const q = i * 4, L = hands ? hands.layer[i] : 0;
      let src = null;
      if (L === 2) src = hands.col; else if (weapon && weapon.on[i]) src = weapon.col; else if (L === 1 || L === 3) src = hands.col;
      if (!src) continue;
      low[q] = src[q]; low[q + 1] = src[q + 1]; low[q + 2] = src[q + 2]; low[q + 3] = src[q + 3];
      if (src === hands.col) { if (hands.glass[i]) gm[i] = 1; if (L === 1 || (L === 3 && armHalo(hands.layer, i))) arm[i] = 1; if (song) song[i] = hands.song[i]; }
    }
    return { low, gm, arm, song };
  }
  // a halo pixel belongs to the arm when it lies against the arm
  function armHalo(layer, i) { const x = i % W, y = (i / W) | 0; return (x > 0 && layer[i - 1] === 1) || (x < W - 1 && layer[i + 1] === 1) || (y > 0 && layer[i - W] === 1) || (y < H - 1 && layer[i + W] === 1); }
  // the left hand mirrored on its own canvas side is the one FP87 draws mirrored: flip a sheet left to right
  function flipLow(C) {
    const o = new Uint8ClampedArray(C.low.length), fl = (a) => { if (!a) return null; const r = new Uint8Array(a.length); for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) r[y * W + (W - 1 - x)] = a[y * W + x]; return r; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const a = y * W + x, b = y * W + (W - 1 - x); o.set(C.low.subarray(a * 4, a * 4 + 4), b * 4); }
    return { low: o, gm: fl(C.gm), arm: fl(C.arm), song: fl(C.song) };
  }

  const KEYP = 'px110|';
  const lookKey = (look) => [look && look.key, look && look.glassArm ? 1 : 0].join('|');
  const stats = { builds: 0, lastMs: 0, maxMs: 0 };
  function note(t0) { const ms = performance.now() - t0; stats.builds++; stats.lastMs = ms; stats.maxMs = Math.max(stats.maxMs, ms); }

  // a weapon in the hand
  function paint(wid, look) {
    const ck = KEYP + 'w|' + wid + '|' + lookKey(look), cache = FP87.cache; let hit = cache.get(ck); if (hit) return hit;
    const t0 = performance.now();
    const r = _paint(wid, look, { noHands: true }); if (!r) return null;
    const Wf = r.canvas.width, Hf = r.canvas.height, M0 = sheet(Wf, Hf, false);
    const wear = wearOf(look), wp = pixelWeapon(r.canvas, M0.w, M0.h), weapon = { col: new Uint8ClampedArray(W * H * 4), on: new Uint8Array(W * H) };
    for (let y = 0; y < M0.h; y++) { weapon.on.set(wp.on.subarray(y * M0.w, (y + 1) * M0.w), y * W); weapon.col.set(wp.col.subarray(y * M0.w * 4, (y + 1) * M0.w * 4), y * W * 4); }
    const S = Scene();
    for (const g of r.grips || []) {
      const P = gripPose(g, null), glass = g.side === 'left' && !!(look && look.glassArm);
      // a forearm leaving by a side of the picture that is on the screen (the left side always; the right side of a
      // picture held in the middle) would be cut off there: it is sent down to leave by the bottom instead
      let arm = g.arm;
      if (arm && g.side === 'left') arm = [arm[0], arm[1], Math.max(arm[2], Wf * 0.18), Math.max(arm[3], Hf + 40)];
      else if (arm && r.center) arm = [arm[0], arm[1], Math.min(arm[2], Wf * 0.86), Math.max(arm[3], Hf + 40)];
      addHand(S, P, { curl: 'grip', wear, glass, foreLen: 34, dev: armDev(P, arm ? arm.map((v) => v / GR) : null, SW.dev, 0) });
    }
    const hands = S.prims.length ? shadeScene(S, wear) : null;
    const out = finish(compose(hands, weapon), 0, Wf, Hf);
    hit = Object.assign({}, r, { canvas: out.canvas, emis: out.emis, ext: out.ext, pixel: true }); delete hit.grips;
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit); note(t0);
    return hit;
  }
  // the hands alone: 'fist', 'glassfist' (the glass arm, drawn mirrored on the left), 'open' (a Song)
  let RAISE = { Y: [-0.62, 0.72, 0.0], Z: [0.3, 0.1, -0.95] };
  const SONG = { Y: [-0.12, 1, -0.25], Z: [0.12, 0.2, 1] };
  function paintHands(look, pose) {
    const ck = KEYP + 'h|' + pose + '|' + lookKey(look), cache = FP87.cache; let hit = cache.get(ck); if (hit) return hit;
    const t0 = performance.now();
    const r = _paintHands(look, pose, { noHands: true }); if (!r) return null;
    const Wf = r.canvas.width, Hf = r.canvas.height, glass = pose === 'glassfist', M0 = sheet(Wf, Hf, glass);
    const wear = wearOf(look), S = Scene();
    if (pose === 'open') {
      for (const g of r.grips || []) {
        const m = g.m, sc = Math.hypot(m[0], m[1]), Z = 1.85;
        // FP87's open hand: its back and fingers from y -42 to 33 in its frame, centred a little left of its origin
        const cx = (m[0] * -1.5 * Z * (g.mirror ? -1 : 1) + m[2] * -4.5 * Z + m[4]) / GR, cy = (m[1] * -1.5 * Z * (g.mirror ? -1 : 1) + m[3] * -4.5 * Z + m[5]) / GR;
        const P = { f: frame(SONG.Y, SONG.Z), s: 1, ax: 0, ay: 0, D, mirror: !!g.mirror, roll: (g.mirror ? 1 : -1) * 4 };
        fitPose(P, 'open', cx + OX, cy + OY, 75 * Z * sc * 1.02 / GR, wear);
        addHand(S, P, { curl: 'open', wear, glass: g.side === 'left' && !!(look && look.glassArm), foreLen: 34, dev: 12, flexW: -8 });
      }
      // the Song's light burns between the hands, where js/fp-hands.js draws its halo: 74 view pixels above the bottom
      // of the picture's place (the picture is 2k picture pixels to a view pixel), level with the hands, so it lies on
      // what faces inward and not on the backs of the hands
      S.song = { x: OX + Wf / 2 / GR, y: OY + (Hf - (74 + (r.below || 0)) * 2 * (r.k || 2)) / GR, z: -1, r: 13 };
    } else {
      const g = (r.grips || [])[0]; if (!g) return null;
      const m = g.m, sc = Math.hypot(m[0], m[1]), Z = 1.85;
      // FP87's fist: x -34..44, y -40..44 in its frame (times 1.85)
      let cx = (m[0] * 5 * Z + m[2] * 2 * Z + m[4]) / GR; const cy = (m[1] * 5 * Z + m[3] * 2 * Z + m[5]) / GR;
      // the glass arm is the LEFT arm: it is built as a left hand where the mirror image of this place is, lit from the
      // upper left as it will be seen, and the sheet is flipped so that body21's own mirroring puts it back
      if (glass) cx = M0.w - cx;
      const P = { f: frame(RAISE.Y, RAISE.Z), s: 1, ax: 0, ay: 0, D, mirror: glass, roll: 0 };
      fitPose(P, 'fist', cx + OX, cy + OY, 84 * Z * sc * 0.98 / GR, wear);
      addHand(S, P, { curl: 'fist', wear: glass ? Object.assign({}, wear, { gloved: false, hand: M.SKIN }) : wear, glass, foreLen: 36 });
    }
    let C = compose(shadeScene(S, wear), null);
    if (glass) C = flipLow(C);
    const out = finish(C, 0, Wf, Hf);
    hit = Object.assign({}, r, { canvas: out.canvas, emis: out.emis, ext: out.ext, song: out.song, pixel: true }); delete hit.grips;
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit); note(t0);
    return hit;
  }
  // a Song's light for a picture of the open hands, in the Song's colour (js/fp-hands.js draws it over the hands)
  const songTints = new WeakMap();
  function songCanvas(mask, col) {
    if (!mask) return null;
    let per = songTints.get(mask); if (!per) { per = new Map(); songTints.set(mask, per); }
    const key = col.join(','); let c = per.get(key); if (c) return c;
    c = mkc(mask.width, mask.height); const x = c.getContext('2d'); x.drawImage(mask, 0, 0);
    x.globalCompositeOperation = 'source-in'; x.fillStyle = 'rgb(' + col.map((v) => Math.round(Math.min(255, v * 0.55 + 255 * 0.45))).join(',') + ')'; x.fillRect(0, 0, c.width, c.height);
    c.__px111song = true;
    if (per.size > 8) per.clear();
    per.set(key, c); return c;
  }

  // ---------------------------------------------------------------- the climb: a fist on a rung (js/fp-hands.js)
  // a fist seen from behind, its fingers over a level rung, the forearm down out of the bottom of the view. The picture
  // is 4 picture pixels to a view pixel, like FP87's; drawn by climbHand at the rung's place
  const CL = { w: 48, h: 176, gx: 24, gy: 18 };     // in view pixels: the picture's size, where the rung passes through the fist
  function climbArt(look, left) {
    const ck = KEYP + 'c|' + (left ? 'L' : 'R') + '|' + lookKey(look), cache = FP87.cache; let hit = cache.get(ck); if (hit) return hit;
    const Wf = CL.w * 4, Hf = CL.h * 4; plain(Wf, Hf);
    const wear = wearOf(look), S = Scene();
    const P = { f: frame([0, 0.97, -0.25], [0, 0.25, 0.97]), s: 1, ax: 0, ay: 0, D, mirror: !!left, roll: left ? -6 : 6 };
    // the rung through the curled fingers: GRIP_C at the rung's place; the fist about 34 view pixels across
    P.s = 34 * 4 / 9.2 / GR;
    const c = scr(P, GRIP_C); P.ax = CL.gx * 4 / GR - c[0]; P.ay = CL.gy * 4 / GR - c[1];
    addHand(S, P, { curl: 'grip', wear, glass: !!left && !!(look && look.glassArm), foreLen: 46 });
    const out = finish(compose(shadeScene(S, wear), null), 0, Wf, Hf);
    hit = { canvas: out.canvas, emis: out.emis };
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit);
    return hit;
  }
  // i: 0 the left hand, 1 the right; (x, y): the old fist's top-left corner (32 x 14 view pixels over the rung)
  function climbHand(ctx, i, x, y) {
    if (!on()) return false;
    let look = null; try { look = typeof GEARLOOK21 === 'object' && G.player ? GEARLOOK21.of(G.player) : null; } catch (e) { look = null; }
    if (!look) return false;
    const a = climbArt(look, i === 0);
    ctx.drawImage(a.canvas, x + 16 - CL.gx, y + 2 - CL.gy, CL.w, CL.h);
    return true;
  }

  // ---------------------------------------------------------------- the arm behind a shield (js/body21.js)
  // Phase 111. The shield rides the left forearm, its face toward you: the forearm comes up from below behind it, the palm
  // against its back, and the four fingers are hooked over its rim onto the face. Two pictures, to the same measure: the
  // whole arm and hand (drawn under the shield) and the fingers alone (drawn over it), each with the place where the
  // rim's edge passes through the hooked fingers (hx, hy), 4 picture pixels to a view pixel; the arm points up the picture.
  const OA = { w: 44, h: 168, hx: 22, hy: 16, cm: 7.6 };     // view pixels; cm: picture pixels to a centimetre of hand
  function offArm(look) { return on() ? offArmArt(look) : null; }
  function offArmArt(look) {
    const ck = KEYP + 'o|' + lookKey(look), cache = (typeof FP87 === 'object' && FP87.cache) || localCache; let hit = cache.get(ck); if (hit) return hit;
    const Wf = OA.w * 4, Hf = OA.h * 4, glass = !!(look && look.glassArm), wear = wearOf(look);
    const pic = (only) => {
      plain(Wf, Hf);
      const S = Scene(), P = { f: frame([0.05, 0.975, -0.2], [0, -0.2, -0.98]), s: OA.cm / GR, ax: 0, ay: 0, D, mirror: true, roll: 0 };
      const c = scr(P, GRIP_C); P.ax = OA.hx * 4 / GR - c[0]; P.ay = OA.hy * 4 / GR - c[1];
      addHand(S, P, { curl: 'hook', wear: glass ? Object.assign({}, wear, { gloved: false, hand: M.SKIN }) : wear, glass, foreLen: 50, only });
      return finish(compose(shadeScene(S, wear), null), 0, Wf, Hf);
    };
    const a = pic(null), f = pic('fingers');
    hit = { canvas: a.canvas, emis: a.emis, fingers: f.canvas, fingersEm: f.emis, w: OA.w, h: OA.h, hx: OA.hx, hy: OA.hy, pixel: true };
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit);
    return hit;
  }
  const localCache = new Map();

  // ---------------------------------------------------------------- the wraps
  let _paint = null, _paintHands = null;
  function wrap() {
    if (typeof FP87 !== 'object' || !FP87 || FP87._px110) return;
    _paint = FP87.paint; _paintHands = FP87.paintHands;
    FP87.paint = function (wid, look, opt) {
      if (!on() || opt) return _paint.apply(this, arguments);
      try { return paint(wid, look); } catch (e) { warnOnce('paint ' + wid, e); return _paint.apply(this, arguments); }
    };
    FP87.paintHands = function (look, pose, opt) {
      if (!on() || opt) return _paintHands.apply(this, arguments);
      try { return paintHands(look, pose); } catch (e) { warnOnce('hands ' + pose, e); return _paintHands.apply(this, arguments); }
    };
    FP87._px110 = { paint: _paint, paintHands: _paintHands };
  }
  try { wrap(); } catch (e) { warnOnce('wrap', e); }

  // ---------------------------------------------------------------- the switch and the Options row
  let last = on();
  function rebuild() { try { if (typeof BODY21 === 'object' && BODY21.clearCaches) BODY21.clearCaches(); } catch (e) { warnOnce('clear', e); } }
  const ROW = ['gfx-pixelhands110', 'Pixel hands', 'your hands, arms and weapons drawn as pixel art'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = on(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
    if (on() !== last) { last = on(); rebuild(); }
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
          b.onclick = () => setOn(!on());
          const after = document.getElementById('gfx-edges107') || document.getElementById('gfx-sharp107') || document.getElementById('gfx-cover105');
          if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
          else { grid.appendChild(lab); grid.appendChild(b); }
          syncRow();
        }
      } catch (e) { warnOnce('row', e); }
      return r;
    };
  }
  try { wireRow(); } catch (e) { warnOnce('wire', e); }
  try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { if (on() !== last) { last = on(); rebuild(); } try { syncRow(); } catch (e) { /* menu closed */ } }); } catch (e) { warnOnce('onChange', e); }

  // for the working tools only (tools/dev/px111.js): one picture of posed hands, no game needed
  //   spec: { w, h (picture pixels), look, hands: [{ Y, Z, curl, glass, mirror, roll, fit: [cx, cy, h] | at: [x, y, pixels per cm], dev, flexW, foreLen, noSleeve }] }
  function devHands(spec) {
    if (spec.offArm) return offArmArt(spec.look);
    if (spec.sheet) sheet(spec.w, spec.h, false); else plain(spec.w, spec.h);
    const wear = wearOf(spec.look), S = Scene();
    for (const h of spec.hands) {
      const P = { f: frame(h.Y, h.Z), s: 1, ax: 0, ay: 0, D, mirror: !!h.mirror, roll: h.roll || 0 };
      if (h.fit) fitPose(P, h.curl, h.fit[0] / GR, h.fit[1] / GR, h.fit[2] / GR, wear); else { P.s = h.at[2] / GR; P.ax = h.at[0] / GR; P.ay = h.at[1] / GR; }
      addHand(S, P, { curl: h.curl, wear: h.glass ? Object.assign({}, wear, { gloved: false, hand: M.SKIN }) : wear, glass: !!h.glass, foreLen: h.foreLen || 34, dev: h.dev || 0, flexW: h.flexW || 0, noSleeve: !!h.noSleeve, only: h.only });
    }
    if (spec.song) S.song = { x: spec.song[0] / GR, y: spec.song[1] / GR, z: spec.song[2] == null ? -1 : spec.song[2], r: spec.song[3] || 13 };
    return finish(compose(shadeScene(S, wear), null), 0, spec.w, spec.h);
  }

  return { FLAG, GR, on, setOn, paint, paintHands, climbHand, climbArt, offArm, songCanvas, wearOf, ROW, stats, MRG, original: () => (FP87 && FP87._px110) || null, _raise: (o) => { RAISE = Object.assign({}, RAISE, o); }, _dev: { hands: devHands } };
})();
if (typeof window !== 'undefined') window.PIXELHANDS110 = PIXELHANDS110;
