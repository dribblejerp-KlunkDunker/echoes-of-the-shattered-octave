// ============================================================
//  body21 — Phase 21 "Wow", team BODY: the player's own body in first person.
//
//  WHAT YOU SEE (the CPU raycaster path; every piece follows js/gearlook21.js, the one table of "what the player looks
//  like in this gear" that the character card shares):
//    * ARMS AND HANDS IN YOUR GEAR. The painted first-person weapon pictures (fp_* in js/assets.js) are re-coloured per
//      outfit: the sleeve takes the body armour (quilted gambeson, oilcloth robe with its silver cuff, mail, the Bell-Plate's
//      bronze vambrace over mail, the jerkin's linen shirt and leather bracer, brigandine canvas and brass rivets, Hush-cloth),
//      the hand takes the gloves (leather, mail gauntlets with a steel cuff) or the traveller's own skin (the portrait's
//      tone), and a glassed traveller's LEFT hand is Aether-Glass. Each picture also gets the rest of its sleeve below its
//      bottom edge, so a thrust or an overhead blow lifts an arm, never a cut-off sleeve.
//    * WEAPONS AS PART OF THE ARM. Every weapon reads as itself: Tobin's bronze blade, the glass-edged greatsword, Sable's
//      ivory nib-knife with its lilac tip, the dirk's basket hilt, a fan of throwing knives, Vesper's red-wrapped haft, the
//      toll-hammer's ash handle, the quarry great-maul's lead head on an ash haft, the bell-glaive's curved blade.
//      Two-handers are held in two hands (the spear, the glaive and the glass greatsword get the second hand on the haft).
//    * THE SHIELD ON THE OFF ARM, face out: the Corsair buckler (iron rim and boss, a red band) or the Synod kite (the dead
//      queen on an oxblood field), resting low on the left, raised across the body while you guard (UPG.blocking), driven
//      forward by a shield bash (ARMS12), lowered with the weapon (FPHANDS) and stowed on the back behind a two-hander.
//    * THE GLASS ARM at rest: a glassed traveller with a blade in the right hand sees the glass left hand low on the left.
//    * LEGS AND BOOTS when you look down: boots per pair (shoes, felt soft boots, hobnails with their studs, iron greaves
//      over riding boots), trousers in the calling's colours, and the body armour's hem over them (the robe to the ankles,
//      the Hush-cloth coat to the calf, mail to the knee, the cuirass's tassets, a jerkin's skirt). They step with your walk.
//    * WHAT IS ON YOUR HEAD when you look up: the kettle helm's riveted brim, the bell-helm's rim and verdigris lip
//      over the eye slit, the Hush-cloth hood's edges, the leather cap's stitched seam come down across the top of sight.
//    * LIGHT ON THE BODY: arms, shield and legs take the scene's light at your feet (night outdoors, lamps and hearths
//      close by), never darker than readable; glass stays bright (it gives its own light).
//
//  COMBAT TIMING IS UNTOUCHED. This module wraps nothing that runs the simulation: no update(), attack(), damagePlayer()
//  or castSong() wrapper; it reads G.attack/G.song/UPG/ARMS12/FPHANDS state only while drawing, and it draws every weapon
//  with the pose the game already computes (animWeaponPose through drawHUD). It never calls Math.random.
//  How the drawing is wired: drawHUD is wrapped (outermost, loaded last). For the duration of the inner draw the
//  Engine.images entries of the visible weapons point at gear-coloured copies of the same size (so every pose, trail and
//  off-hand stays where it was), and Engine.ctx.drawImage is hooked so that, wherever a gear copy is drawn, its sleeve
//  continuation and any extra hand is drawn with the very same transform. Legs are drawn before the weapon, the shield
//  just before the weapon. Everything is restored in finally blocks.
//
//  R3D (Phase 21 CORE's WebGL2 renderer, js/r3d21.js): see the R3D section at the end: the same pictures are handed to
//  the 3D scene as view-space layers with their own depth range; without R3D (or when its API is missing) the overlay
//  path above runs, so the raycaster fallback always shows the body.
//
//  Switches (Options > Graphics & access, and GFX.body21 so the Original preset is the untouched original):
//    Player body (gear on arms, shield, legs) / Feet when looking down / Light on the body. localStorage 'octave.body21.v1'.
//  Art: procedural stand-in pixel art drawn in code here (shields, the second hand, legs and boots) plus re-colourings
//  of the existing fp_* paintings; cached per outfit and light level, never rebuilt per frame.
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.body21 === undefined) GFX.body21 = GFX.preset !== 'original';
  if (Array.isArray(GFX.FX) && !GFX.FX.includes('body21')) GFX.FX.push('body21');
}

const BODY21 = (() => {
  const KEY = 'octave.body21.v1';
  const set = { on: true, feet: true, light: true };
  try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') for (const k of Object.keys(set)) if (typeof o[k] === 'boolean') set[k] = o[k]; } catch (e) { /* storage may be blocked */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(set)); } catch (e) { /* ignore */ } }
  const GL = () => (typeof GEARLOOK21 === 'object' ? GEARLOOK21 : null);
  const on = () => set.on && !!GL() && (typeof GFX === 'undefined' || GFX.body21 !== false);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const lerp = (a, b, t) => a + (b - a) * t;
  const mixc = (a, b, t) => [lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)];
  const mulc = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const reduced = () => !!(typeof GFX !== 'undefined' && GFX.reduceMotion);
  const stats = { builds: 0, hits: 0, tints: 0, drawn: { arms: 0, shield: 0, feet: 0, glassIdle: 0, ext: 0, extra: 0 }, lastMs: 0, maxMs: 0, frames: 0, warn: {} };
  const warnOnce = (k, e) => { if (!stats.warn[k]) { stats.warn[k] = 1; console.warn('body21 ' + k, e); } };
  const mkCanvas = (w, h) => { const c = document.createElement('canvas'); c.width = Math.max(1, w | 0); c.height = Math.max(1, h | 0); return c; };

  // ================================================================ colour helpers
  function hsv(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn;
    let h = 0; if (d) h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [((h * 60) + 360) % 360, mx ? d / mx : 0, mx / 255];
  }
  const lum = (r, g, b) => (0.3 * r + 0.59 * g + 0.11 * b) / 255;
  // a 6-step ramp from a gear colour entry (dark .. specular)
  function rampOf(col) {
    if (!col) return null;
    if (Array.isArray(col)) { const r = GL().ramp(col, 5); return [mulc(r[0], 0.7), r[0], r[1], r[2], r[3], mixc(r[4], [255, 248, 230], 0.35)]; }
    return [mulc(col.dark, 0.75), col.dark, col.shade, col.base, col.light, mixc(col.light, [255, 250, 236], 0.4)];
  }
  // map a relative brightness t (1 = the region's typical tone) onto a ramp, smoothly
  function onRamp(R, t) {
    const stops = [0.12, 0.38, 0.68, 1.0, 1.42, 1.95];
    if (t <= stops[0]) return R[0];
    for (let i = 1; i < 6; i++) if (t <= stops[i]) { const k = (t - stops[i - 1]) / (stops[i] - stops[i - 1]); return mixc(R[i - 1], R[i], k); }
    return R[5];
  }
  // surface patterns in the 2x art's pixels: a brightness multiplier (they read at 1x and at device resolution)
  const PATTERN = {
    none: () => 1,
    grain: (x, y) => (((x * 7 + y * 3) % 11) === 0 ? 0.9 : 1),
    weave: (x, y) => (((x + y) & 1) ? 0.95 : 1.03),
    quilt: (x, y) => (((x + y) % 9 === 0 || ((x - y) % 9 + 9) % 9 === 0) ? 0.72 : 1.02),
    mail: (x, y) => { const r = ((y / 3) | 0), xx = (x + (r & 1) * 2) & 3, yy = y % 3; return yy === 0 ? 0.68 : xx === 0 ? 0.74 : (xx === 2 && yy === 1) ? 1.3 : 1.04; },
    rivets: (x, y) => ((x % 8 === 3 && y % 8 === 3) ? 1.7 : (x % 8 === 4 && y % 8 === 4) ? 0.6 : 1),
    studs: (x, y) => ((x % 6 === 2 && y % 6 === 2) ? 1.6 : 1),
    plates: (x, y) => (y % 10 === 0 ? 0.62 : y % 10 === 1 ? 1.28 : 1),
    stole: () => 1,
    facets: (x, y) => ((((x * 3 + y * 5) >> 3) & 1) ? 1.12 : 0.94),
  };
  const patOf = (name) => PATTERN[name] || PATTERN.none;

  // ================================================================ 1. THE FIRST-PERSON PAINTINGS, SEGMENTED
  // Hand regions per painting, in the painting's own pixels (each fp_* is 2x the 320x200 view). Inside a hand polygon a
  // warm brown pixel is glove; anywhere, a green (or the pistol's blue) pixel is sleeve; outside, brown is wood (a grip, a
  // haft, a stock), grey is metal, saturated gold is brass. `excl`: polygons inside a hand region that are NOT hand (the
  // spear's shaft below the fist). fp_hands is all skin: `forearm` polygons turn the bare forearms into sleeves, x < `leftX`
  // is the left hand. `second`: where a two-handed grip puts the left hand (centre, the shaft's angle, the forearm's end).
  const META = {
    fp_sword: { gloves: [[[26, 132], [48, 126], [62, 140], [99, 152], [99, 190], [52, 190], [24, 168]]] },
    fp_longsword: { gloves: [[[32, 142], [50, 137], [62, 148], [106, 162], [106, 196], [50, 196], [30, 178]]], blade: 130, guard: [118, 140],
      second: { x: 58, y: 178, ang: 1.25, arm: [-40, 270] } },
    fp_knife: { gloves: [[[30, 118], [52, 114], [64, 124], [98, 138], [98, 180], [45, 180], [28, 158]]], blade: 101, guard: [99, 108], tip: 24 },
    fp_axe: { gloves: [[[42, 119], [62, 114], [78, 128], [109, 145], [109, 190], [58, 190], [42, 165]]] },
    fp_mace: { gloves: [[[28, 127], [48, 122], [64, 132], [96, 146], [96, 188], [42, 188], [26, 160]]], head: 56 },
    fp_spear: { gloves: [[[38, 146], [56, 141], [72, 150], [111, 170], [111, 198], [48, 198], [36, 170]]], excl: [[[54, 160], [62, 157], [76, 198], [62, 198]]],
      fork: 70, second: { x: 46, y: 104, ang: 1.21, arm: [-70, 250] } },
    fp_maul: { gloves: [[[56, 116], [78, 111], [96, 128], [127, 148], [127, 196], [56, 196], [56, 170], [64, 150]]], head: 52 },
    fp_crossbow: { leftX: 84, gloves: [[[0, 150], [0, 120], [40, 80], [55, 52], [64, 47], [72, 60], [84, 96], [92, 110], [88, 150]], [[86, 104], [100, 96], [118, 90], [130, 100], [162, 118], [162, 150], [86, 150]]] },
    fp_pistol: { gloves: [[[24, 104], [40, 96], [62, 92], [92, 92], [106, 104], [140, 130], [198, 150], [198, 190], [60, 190], [30, 150]]] },
    fp_hands: { skin: true, leftX: 140, forearm: [[[0, 190], [0, 150], [40, 150], [115, 126], [118, 190]], [[178, 190], [176, 120], [222, 100], [290, 140], [290, 190]]] },
    fp_glass: { glass: true },
  };
  function inPoly(x, y, P) {
    let c = false;
    for (let i = 0, j = P.length - 1; i < P.length; j = i++) {
      const xi = P[i][0], yi = P[i][1], xj = P[j][0], yj = P[j][1];
      if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) c = !c;
    }
    return c;
  }
  // classes
  const K = { NONE: 0, INK: 1, SLEEVE: 2, HAND: 3, METAL: 4, BRASS: 5, WOOD: 6, GLOW: 7, GLASS: 8, OTHER: 9 };
  const segCache = new Map();
  function segment(key) {
    let s = segCache.get(key); if (s) return s;
    const img = Engine.images[key]; const M = META[key];
    if (!img || !M || !img.width) return null;
    if (M.gloves && M.handTop == null) M.handTop = Math.min(...M.gloves.map((P) => Math.min(...P.map((p) => p[1]))));
    const w = img.width, h = img.height, c = mkCanvas(w, h), x = c.getContext('2d');
    x.drawImage(img, 0, 0);
    const src = x.getImageData(0, 0, w, h), d = src.data, N = w * h;
    const cls = new Uint8Array(N), L = new Float32Array(N), left = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let xx = 0; xx < w; xx++) {
      const i = y * w + xx, o = i * 4, a = d[o + 3];
      if (a < 12) continue;
      const r = d[o], g = d[o + 1], b = d[o + 2], [hu, sa, va] = hsv(r, g, b);
      L[i] = lum(r, g, b);
      if (M.leftX != null) left[i] = xx < M.leftX ? 1 : 0;   // the left arm's half of the picture
      if (M.glass) { cls[i] = K.GLASS; continue; }
      if (M.skin) {
        if (va > 0.8 && sa < 0.55 && hu > 25 && hu < 70) { cls[i] = K.GLOW; continue; }
        const fore = M.forearm.some((P) => inPoly(xx, y, P));
        cls[i] = va < 0.1 ? K.INK : fore ? K.SLEEVE : K.HAND;
        continue;
      }
      // sleeves only below the top of the hands (greenish wood or a blued barrel up the weapon is not cloth)
      const sleeve = y > M.handTop && ((hu >= 60 && hu <= 175 && sa > 0.14 && va > 0.06) || (hu >= 200 && hu <= 265 && sa > 0.22));
      if (sleeve) { cls[i] = K.SLEEVE; continue; }
      const inHand = M.gloves.some((P) => inPoly(xx, y, P)) && !(M.excl && M.excl.some((P) => inPoly(xx, y, P)));
      const warm = (hu < 52 || hu > 335) && sa > 0.18;
      if (va < 0.09) { cls[i] = K.INK; continue; }
      if (inHand && warm) { cls[i] = K.HAND; continue; }
      if (warm && sa > 0.38 && va > 0.42 && hu > 24 && hu < 58) { cls[i] = K.BRASS; continue; }
      if (sa < 0.26) { cls[i] = K.METAL; continue; }
      if (warm) { cls[i] = K.WOOD; continue; }
      cls[i] = K.OTHER;
    }
    // ink takes the class of most of its neighbours, so outlines recolour with what they outline
    const ink = new Uint8Array(N);
    for (let y = 1; y < h - 1; y++) for (let xx = 1; xx < w - 1; xx++) {
      const i = y * w + xx; if (cls[i] !== K.INK) continue;
      const n = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
      for (const j of [i - 1, i + 1, i - w, i + w, i - w - 1, i - w + 1, i + w - 1, i + w + 1]) n[cls[j]]++;
      let best = K.INK, bn = 0; for (const k of [K.SLEEVE, K.HAND]) if (n[k] > bn) { bn = n[k]; best = k; }
      if (bn >= 3) ink[i] = best;
    }
    // typical brightness of each region (the ramp's "base")
    const ref = {};
    for (const k of [K.SLEEVE, K.HAND, K.METAL, K.WOOD, K.BRASS]) {
      const v = []; for (let i = 0; i < N; i++) if (cls[i] === k) v.push(L[i]);
      v.sort((a, b) => a - b); ref[k] = v.length ? v[(v.length * 0.6) | 0] || 0.3 : 0.3;
    }
    // distance (pixels) of each sleeve pixel from the hand, and of each hand pixel from the sleeve: cuffs and bracers
    const dHand = chamfer(cls, w, h, K.HAND), dSleeve = chamfer(cls, w, h, K.SLEEVE);
    s = { key, w, h, src, cls, ink, L, ref, dHand, dSleeve, left, M };
    segCache.set(key, s);
    return s;
  }
  // two-pass chamfer distance to the nearest pixel of class k
  function chamfer(cls, w, h, k) {
    const N = w * h, D = new Float32Array(N);
    for (let i = 0; i < N; i++) D[i] = cls[i] === k ? 0 : 1e4;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x; let v = D[i]; if (!v) continue;
      if (x) v = Math.min(v, D[i - 1] + 1); if (y) { v = Math.min(v, D[i - w] + 1); if (x) v = Math.min(v, D[i - w - 1] + 1.414); if (x < w - 1) v = Math.min(v, D[i - w + 1] + 1.414); }
      D[i] = v;
    }
    for (let y = h - 1; y >= 0; y--) for (let x = w - 1; x >= 0; x--) {
      const i = y * w + x; let v = D[i]; if (!v) continue;
      if (x < w - 1) v = Math.min(v, D[i + 1] + 1); if (y < h - 1) { v = Math.min(v, D[i + w] + 1); if (x < w - 1) v = Math.min(v, D[i + w + 1] + 1.414); if (x) v = Math.min(v, D[i + w - 1] + 1.414); }
      D[i] = v;
    }
    return D;
  }

  // ================================================================ 2. A SMALL PIXEL PAINTER (procedural stand-in art)
  // Parts are filled as flat codes, then each part is shaded as a rounded form: distance in from its edges becomes a
  // height, the height's slope a normal, lit from the upper left and the front; metal gets a highlight; a nearer part
  // casts a dark line on a farther one; the silhouette gets a dark outline. Patterns (mail, quilting, rivets) modulate it.
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function pix(w, h) { return { w: Math.ceil(w), h: Math.ceil(h), code: new Uint8Array(Math.ceil(w) * Math.ceil(h)), parts: [null] }; }
  function part(P, spec) { P.parts.push(Object.assign({ z: P.parts.length, round: 6, sheen: 0, pat: PATTERN.none, grad: null, emis: false, flat: 0 }, spec)); return P.parts.length - 1; }
  function put(P, x, y, id) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < P.w && y < P.h) P.code[y * P.w + x] = id; }
  function poly(P, pts, id) {
    let y0 = 1e9, y1 = -1e9; for (const p of pts) { y0 = Math.min(y0, p[1]); y1 = Math.max(y1, p[1]); }
    for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(P.h - 1, Math.ceil(y1)); y++) {
      const xs = [], yc = y + 0.5;
      for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
        const a = pts[i], b = pts[j];
        if ((a[1] > yc) !== (b[1] > yc)) xs.push(a[0] + (yc - a[1]) * (b[0] - a[0]) / (b[1] - a[1]));
      }
      xs.sort((a, b) => a - b);
      for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.round(xs[k])); x < Math.min(P.w, Math.round(xs[k + 1])); x++) P.code[y * P.w + x] = id;
    }
  }
  function ell(P, cx, cy, rx, ry, id, rot) {
    const c = Math.cos(rot || 0), s = Math.sin(rot || 0), R = Math.max(rx, ry) + 1;
    for (let y = Math.floor(cy - R); y <= Math.ceil(cy + R); y++) for (let x = Math.floor(cx - R); x <= Math.ceil(cx + R); x++) {
      const dx = x + 0.5 - cx, dy = y + 0.5 - cy, u = (dx * c + dy * s) / rx, v = (-dx * s + dy * c) / ry;
      if (u * u + v * v <= 1) put(P, x, y, id);
    }
  }
  function cap(P, ax, ay, bx, by, r0, r1, id) {
    const R = Math.max(r0, r1) + 1, x0 = Math.floor(Math.min(ax, bx) - R), x1 = Math.ceil(Math.max(ax, bx) + R), y0 = Math.floor(Math.min(ay, by) - R), y1 = Math.ceil(Math.max(ay, by) + R);
    const vx = bx - ax, vy = by - ay, L2 = vx * vx + vy * vy || 1;
    for (let y = Math.max(0, y0); y <= Math.min(P.h - 1, y1); y++) for (let x = Math.max(0, x0); x <= Math.min(P.w - 1, x1); x++) {
      const px = x + 0.5, py = y + 0.5, t = clamp(((px - ax) * vx + (py - ay) * vy) / L2, 0, 1), dx = px - (ax + vx * t), dy = py - (ay + vy * t), r = r0 + (r1 - r0) * t;
      if (dx * dx + dy * dy <= r * r) P.code[y * P.w + x] = id;
    }
  }
  function render(P, opts) {
    opts = opts || {};
    const { w, h, code, parts } = P, N = w * h;
    const edge = new Uint8Array(N);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, c = code[i]; if (!c) continue;
      if (x === 0 || y === 0 || x === w - 1 || y === h - 1 || code[i - 1] !== c || code[i + 1] !== c || code[i - w] !== c || code[i + w] !== c) edge[i] = 1;
    }
    const D = chamfer(edge, w, h, 1);
    const Hh = new Float32Array(N);
    for (let i = 0; i < N; i++) { const c = code[i]; if (!c) continue; const r = parts[c].round; Hh[i] = Math.sqrt(Math.min(D[i] + 0.5, r) / r); }
    const out = new ImageData(w, h), o = out.data, emis = opts.emis ? new ImageData(w, h) : null;
    const Lx = -0.5, Ly = -0.62, Lz = 0.6, Ln = Math.hypot(Lx, Ly, Lz), lx = Lx / Ln, ly = Ly / Ln, lz = Lz / Ln;
    const hx = lx, hy = ly, hz = lz + 1, hn = Math.hypot(hx, hy, hz);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, c = code[i]; if (!c) continue;
      const pt = parts[c];
      const hh = (j) => (code[j] === c ? Hh[j] : Hh[i]);
      const gx = (x > 0 ? hh(i + 1 < N ? i + 1 : i) : Hh[i]) - (x > 0 ? hh(i - 1) : Hh[i]);
      const gy = (y < h - 1 ? hh(i + w) : Hh[i]) - (y > 0 ? hh(i - w) : Hh[i]);
      let nx = -gx * 1.8, ny = -gy * 1.8, nz = 1; const nn = Math.hypot(nx, ny, nz); nx /= nn; ny /= nn; nz /= nn;
      const dif = Math.max(0, nx * lx + ny * ly + nz * lz);
      let t = pt.flat ? pt.flat : 0.42 + 0.9 * dif;
      if (pt.sheen) { const sp = Math.max(0, (nx * hx + ny * hy + nz * hz) / hn); t += Math.pow(sp, 18) * pt.sheen * 1.1; }
      t *= pt.pat(x, y);
      if (pt.grad) t *= pt.grad(x, y);
      // a nearer part throws a thin shadow on this one
      for (const j of [i - 1, i + 1, i - w, i + w]) { const cj = j >= 0 && j < N ? code[j] : 0; if (cj && cj !== c && parts[cj].z > pt.z) { t *= 0.5; break; } }
      t += (BAYER[((y & 3) << 2) | (x & 3)] - 7.5) / 16 * 0.07;
      const col = onRamp(pt.R, t), q = i * 4;
      o[q] = col[0]; o[q + 1] = col[1]; o[q + 2] = col[2]; o[q + 3] = pt.alpha || 255;
      if (emis && pt.emis) { emis.data[q] = col[0]; emis.data[q + 1] = col[1]; emis.data[q + 2] = col[2]; emis.data[q + 3] = pt.alpha || 255; }
    }
    if (opts.outline !== false) {
      // the silhouette's outline, in the darkest tone of what it outlines
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (code[i]) continue;
        let c = 0; for (const j of [x > 0 ? i - 1 : -1, x < w - 1 ? i + 1 : -1, y > 0 ? i - w : -1, y < h - 1 ? i + w : -1]) if (j >= 0 && code[j]) { c = code[j]; break; }
        if (!c || parts[c].noOutline) continue;
        const k = parts[c].R[0], q = i * 4; o[q] = k[0] * 0.55; o[q + 1] = k[1] * 0.55; o[q + 2] = k[2] * 0.6; o[q + 3] = 235;
      }
    }
    const cv = mkCanvas(w, h); cv.getContext('2d').putImageData(out, 0, 0);
    let ecv = null; if (emis) { ecv = mkCanvas(w, h); ecv.getContext('2d').putImageData(emis, 0, 0); }
    return { canvas: cv, emis: ecv, w, h };
  }
  const hash2 = (x, y, s) => { let v = (x * 374761393 + y * 668265263 + (s || 0) * 1442695041) | 0; v = Math.imul(v ^ (v >>> 13), 1274126177); return ((v ^ (v >>> 16)) >>> 0) / 4294967296; };

  // ================================================================ 3. WHAT AN ARM WEARS (from GEARLOOK21)
  // zones along the forearm, by distance (2x pixels) from the hand: a cuff, a bracer or vambrace, a rolled sleeve; then
  // the sleeve itself. And on the hand, by distance from the sleeve: a gauntlet's steel cuff.
  function armSpec(look, side) {
    const G2 = GL(), body = look.body, sl = body.sleeve || {}, hands = look.hands;
    const glass = side === 'left' && look.glassArm;
    const sleeveCol = sl.col || look.calling.coat;
    const S = { R: rampOf(sleeveCol), pat: patOf(G2.MATERIALS[sl.material || 'linen'] ? G2.MATERIALS[sl.material || 'linen'].pattern : 'weave'), zones: [] };
    if (body.pattern === 'quilt') S.pat = PATTERN.quilt;
    if (sl.material === 'mail') S.pat = PATTERN.mail;
    if (sl.plated) S.zones.push({ d: 19, R: rampOf(body.col), pat: PATTERN.none, sheen: 1, line: true });               // vambrace over mail
    else if (sl.bracer) S.zones.push({ d: 15, R: rampOf(body.material === 'leather' ? body.col : body.col), pat: body.pattern === 'rivets' ? PATTERN.rivets : PATTERN.grain, line: true });
    else if (sl.rolled) { S.zones.push({ d: 11, skin: true }); S.zones.push({ d: 16, R: rampOf(mulc(sleeveCol, 0.78)), pat: PATTERN.weave, line: true }); }
    if (sl.cuff && !sl.rolled && !sl.bracer && !sl.plated) S.zones.push({ d: sl.wide ? 7 : 4, R: rampOf(sl.cuff), pat: PATTERN.none, line: false });
    if (glass) S.zones.unshift({ d: 12, glass: true });   // the glass runs past the wrist under the cuff
    const Hd = { R: null, pat: PATTERN.none, zones: [], glass };
    if (glass) Hd.R = rampOf(G2.GLASS);
    else if (hands.bare) Hd.R = rampOf(look.skin);
    else { Hd.R = rampOf(hands.col); Hd.pat = patOf(hands.pattern); if (hands.shape === 'gauntlets') Hd.zones.push({ d: 9, R: rampOf(G2.ARMOR.a_kettle.col), pat: PATTERN.plates, sheen: 1 }); }
    return { S, H: Hd, skinR: rampOf(look.skin), glassR: rampOf(G2.GLASS) };
  }

  // ================================================================ 4. THE WEAPON IN THE HAND (per weapon id)
  // metal / wood / brass pixels of the painting re-toned for weapons that share a painting; null keeps the paint
  function weaponTone(wid, key, x, y, k, t, s) {
    const M = s.M, G2 = GL(), W = G2.WEAPONS[wid] || G2.WEAPONS.sword, C = W.col;
    const rp = (c) => rampOf(c);
    switch (wid) {
      case 'tobin_blade':
        if (k === K.METAL) return { c: onRamp(rp(y < (M.guard ? M.guard[0] : 120) ? C.blade : C.guard), t * 1.02) };
        if (k === K.WOOD) return { c: onRamp(rp(C.grip), t) };
        return null;
      case 'p12_glassblade':
        if (k === K.METAL && y < (M.blade || 130)) return { c: onRamp(rampOf(G2.GLASS), t * 1.05 * PATTERN.facets(x, y)), emis: true };
        return null;
      case 'sable_dagger':
        if (k === K.METAL && y < M.tip) return { c: onRamp(rp(C.edge), t * 1.1), emis: true };
        if (k === K.METAL && y < M.blade) return { c: onRamp(rp(C.blade), t) };
        if (k === K.METAL && y < M.guard[1]) return { c: onRamp(rp(C.guard), t), emis: true };
        if (k === K.WOOD) return { c: onRamp(rp(C.grip), t * 0.9) };
        return null;
      case 'p12_greatmaul':
        if ((k === K.METAL || k === K.BRASS) && y < M.head) return { c: onRamp(rp(C.head), t * 0.92) };
        if (k === K.METAL || k === K.BRASS) return { c: onRamp(rp(C.grip), t * PATTERN.grain(x, y)) };
        return null;
      case 'tollhammer':
        if (k === K.BRASS || (k === K.METAL && y < M.head)) return { c: onRamp(rp(C.head), t) };
        if (k === K.METAL) return { c: onRamp(rp(C.grip), t * PATTERN.grain(x, y)) };
        return null;
      case 'vesper_hook':
        if (k === K.WOOD) return { c: onRamp(rp(((y / 7) | 0) % 3 === 0 ? [62, 30, 26] : C.guard), t) };
        if (k === K.METAL) return { c: onRamp(rp(C.blade), t * 0.96) };
        return null;
      case 'throwknife':
        if (k === K.WOOD) return { c: onRamp(rp(C.grip), t) };
        return null;
      case 'p12_bellglaive':
        return null;   // the fork is replaced by a painted blade (extras)
      default: return null;
    }
  }

  // ================================================================ 5. BUILD ONE GEAR-COLOURED PAINTING
  const EXT = { fp_crossbow: [[-0.6, 0.8, 0, 81], [0.6, 0.8, 81, 999]], fp_hands: [[-0.45, 0.89, 0, 145], [0.6, 0.8, 145, 999]], fp_pistol: [[0.75, 0.66, 0, 999]] };
  const buildCache = new Map();
  function buildKey(key, look, wid, side) {
    return [key, wid, side, look.key, look.glassArm ? 1 : 0].join('#');
  }
  function build(key, look, wid, side) {
    const bk = buildKey(key, look, wid, side);
    let b = buildCache.get(bk); if (b) { stats.hits++; return b; }
    const s = segment(key); if (!s) return null;
    const t0 = performance.now();
    const { w, h, cls, ink, L, ref, dHand, dSleeve, src, M } = s;
    const A = armSpec(look, side), AL = side === 'right' ? armSpec(look, 'left') : A;
    const out = new ImageData(new Uint8ClampedArray(src.data), w, h), o = out.data;
    const em = new ImageData(w, h), e = em.data; let anyEmis = false;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, q = i * 4; let k = cls[i]; if (!k) continue;
      if (k === K.INK) k = ink[i] || K.INK;
      let col = null, emis = false;
      const t = L[i] / (ref[k] || 0.3);
      // which arm this pixel belongs to: the left hand of fp_hands / the crossbow's left glove, or the painting's side
      const leftHere = !!s.left[i];
      const AA = leftHere ? AL : A;
      if (k === K.SLEEVE) {
        const d = dHand[i]; let z = null;
        for (const zz of AA.S.zones) if (d < zz.d) { z = zz; break; }
        if (z && z.glass) { col = onRamp(AA.glassR, t * PATTERN.facets(x, y)); emis = true; }
        else if (z && z.skin) col = onRamp(AA.skinR, t);
        else if (z) { let tt = t * z.pat(x, y); if (z.line && d > z.d - 2.2) tt *= 0.55; else if (z.line && d > z.d - 4) tt *= 1.25; if (z.sheen && d < 3) tt *= 1.3; col = onRamp(z.R, tt); }
        else col = onRamp(AA.S.R, t * AA.S.pat(x, y));
      } else if (k === K.HAND) {
        const d = dSleeve[i]; let z = null; for (const zz of AA.H.zones) if (d < zz.d) { z = zz; break; }
        if (AA.H.glass) { col = onRamp(AA.H.R, t * 1.1 * PATTERN.facets(x, y)); emis = true; }
        else if (z) col = onRamp(z.R, t * z.pat(x, y) * (d > z.d - 2 ? 0.6 : 1));
        else col = onRamp(AA.H.R, t * AA.H.pat(x, y));
      } else if (k === K.GLASS) { emis = true; }
      else if (k === K.METAL || k === K.WOOD || k === K.BRASS) {
        const r = weaponTone(wid, key, x, y, k, t, s); if (r) { col = r.c; emis = !!r.emis; }
      }
      if (col) { o[q] = col[0]; o[q + 1] = col[1]; o[q + 2] = col[2]; }
      if (emis) { e[q] = o[q]; e[q + 1] = o[q + 1]; e[q + 2] = o[q + 2]; e[q + 3] = o[q + 3]; anyEmis = true; }
    }
    const main = mkCanvas(w, h), mx = main.getContext('2d');
    mx.putImageData(out, 0, 0);
    let emisCv = null; if (anyEmis) { emisCv = mkCanvas(w, h); emisCv.getContext('2d').putImageData(em, 0, 0); }
    const extras = paintExtras(key, wid, look, side, main, s, A);
    const ext = sleeveExtension(key, main, s);
    b = { key, wid, side, main, emis: emisCv, ext, over: extras.over, w, h, ms: 0 };
    b.ms = performance.now() - t0; stats.builds++;
    if (buildCache.size > 48) buildCache.delete(buildCache.keys().next().value);
    buildCache.set(bk, b); OWNED.set(main, b);
    return b;
  }
  const OWNED = new WeakMap();   // gear canvas -> its build (the drawImage hook finds extras through this)

  // the rest of the sleeve: the painting's edge strip of sleeve (or glass) pushed out along the arm, outside the picture
  function sleeveExtension(key, main, s) {
    const { w, h, cls } = s, dirs = EXT[key] || [[0.6, 0.8, 0, 999]], LEN = 90, PAD = 100;
    const ec = mkCanvas(w + PAD * 2, h + LEN + 4), ex = ec.getContext('2d');
    const md = main.getContext('2d').getImageData(0, 0, w, h).data;
    let any = false;
    for (const [dx, dy, xa, xb] of dirs) {
      const strip = mkCanvas(w, h), sx = strip.getContext('2d'), id = sx.createImageData(w, h);
      let n = 0;
      for (let y = 0; y < h; y++) for (let x = Math.max(0, xa); x < Math.min(w, xb); x++) {
        const nearB = y >= h - 5, nearR = dx > 0 && x >= w - 5, nearL = dx < 0 && x <= 4;
        if (!(nearB || nearR || nearL)) continue;
        const i = y * w + x, k = cls[i]; if (!(k === K.SLEEVE || k === K.GLASS || (k === K.INK && s.ink[i] === K.SLEEVE))) continue;
        const q = i * 4; id.data[q] = md[q]; id.data[q + 1] = md[q + 1]; id.data[q + 2] = md[q + 2]; id.data[q + 3] = md[q + 3]; n++;
      }
      if (!n) continue; any = true;
      sx.putImageData(id, 0, 0);
      for (let k = 1; k <= LEN; k++) ex.drawImage(strip, PAD + dx * k, dy * k);
    }
    if (!any) return null;
    ex.clearRect(PAD, 0, w, h);    // inside the picture the painting itself is the arm
    return { canvas: ec, ox: -PAD, oy: 0, w: ec.width, h: ec.height };
  }

  // ================================================================ 6. EXTRAS PAINTED IN CODE ON A PAINTING
  function paintExtras(key, wid, look, side, main, s, A) {
    const res = { over: [] }, G2 = GL(), W = G2.WEAPONS[wid];
    const mx = main.getContext('2d');
    if (wid === 'p12_bellglaive' && key === 'fp_spear') {
      // the fork's tines give way to one curved bell-bronze blade on the same socket
      const id = mx.getImageData(0, 0, s.w, s.h), d = id.data;
      for (let y = 0; y < s.M.fork; y++) for (let x = 0; x < s.w; x++) d[(y * s.w + x) * 4 + 3] = 0;
      mx.putImageData(id, 0, 0);
      const P = pix(s.w, s.h), C = W.col;
      const blade = part(P, { R: rampOf(C.blade), sheen: 0.9, round: 5 });
      const edge = part(P, { R: rampOf(C.edge), sheen: 1, round: 2, flat: 1.25 });
      const spike = part(P, { R: rampOf(C.blade), sheen: 0.8, round: 3 });
      poly(P, [[25, 74], [21, 56], [14, 38], [8, 21], [5, 6], [10, 3], [20, 14], [30, 31], [36, 51], [39, 74]], blade);
      poly(P, [[35, 66], [34, 51], [28, 32], [19, 15], [10, 4], [12, 3], [22, 14], [31, 31], [37, 51], [38, 66]], edge);
      poly(P, [[22, 54], [10, 58], [8, 60], [21, 60]], spike);
      mx.drawImage(render(P).canvas, 0, 0);
    }
    if (wid === 'p12_dirk' && key === 'fp_knife') {
      // a basket of steel bars round the knuckles, from the guard to the pommel
      const P = pix(s.w, s.h), C = W.col, bar = part(P, { R: rampOf(C.guard), sheen: 1, round: 2 });
      const curves = [[[34, 104], [22, 120], [22, 140], [40, 158]], [[40, 105], [30, 121], [31, 139], [46, 156]], [[46, 106], [40, 120], [41, 136], [52, 152]]];
      for (const c of curves) { let px = c[0][0], py = c[0][1]; for (let k = 1; k <= 14; k++) { const t = k / 14, u = 1 - t; const x = u * u * u * c[0][0] + 3 * u * u * t * c[1][0] + 3 * u * t * t * c[2][0] + t * t * t * c[3][0], y = u * u * u * c[0][1] + 3 * u * u * t * c[1][1] + 3 * u * t * t * c[2][1] + t * t * t * c[3][1]; cap(P, px, py, x, y, 1.6, 1.6, bar); px = x; py = y; } }
      mx.drawImage(render(P).canvas, 0, 0);
    }
    if (wid === 'throwknife' && key === 'fp_knife') {
      // a fan of balanced blades in the hand: two more behind the first
      const bl = mkCanvas(s.w, s.h), bx = bl.getContext('2d'); bx.drawImage(main, 0, 0, s.w, s.M.guard[1], 0, 0, s.w, s.M.guard[1]);
      bx.globalCompositeOperation = 'source-atop'; bx.fillStyle = 'rgba(20,18,24,0.28)'; bx.fillRect(0, 0, s.w, s.h);
      const fan = mkCanvas(s.w, s.h), fx = fan.getContext('2d');
      for (const a of [-0.26, 0.2]) { fx.save(); fx.translate(44, 108); fx.rotate(a); fx.drawImage(bl, -44, -108); fx.restore(); }
      fx.drawImage(main, 0, 0);
      mx.clearRect(0, 0, s.w, s.h); mx.drawImage(fan, 0, 0);
    }
    const sec = s.M.second;
    if (sec && W && W.grip === 'two') res.over.push(paintSecondHand(sec, look));
    return res;
  }

  // a left hand closed round a haft or a hilt, its forearm running off the bottom-left of the picture
  function paintSecondHand(sec, look) {
    const A = armSpec(look, 'left');
    const ex = sec.arm[0], ey = sec.arm[1], x0 = Math.floor(Math.min(sec.x, ex) - 30), y0 = Math.floor(Math.min(sec.y, ey) - 30), x1 = Math.ceil(Math.max(sec.x, ex) + 30), y1 = Math.ceil(Math.max(sec.y, ey) + 30);
    const P = pix(x1 - x0, y1 - y0), cx = sec.x - x0, cy = sec.y - y0, ax = ex - x0, ay = ey - y0;
    const u = [Math.cos(sec.ang), Math.sin(sec.ang)], v = [-u[1], u[0]];          // u: down the haft; v: across it
    const fa = Math.atan2(ay - cy, ax - cx), f = [Math.cos(fa), Math.sin(fa)];     // toward the elbow
    const sleeve = part(P, { R: A.S.R, pat: A.S.pat, round: 9, z: 1 });
    const z0 = A.S.zones[0];
    const cuff = z0 ? part(P, { R: z0.glass ? A.glassR : z0.skin ? A.skinR : z0.R, pat: z0.pat || PATTERN.none, sheen: z0.sheen || (z0.glass ? 1 : 0), round: 7, z: 2, emis: !!z0.glass }) : 0;
    const handR = A.H.R, hp = A.H.pat, hs = A.H.glass ? 1 : (look.hands.shape === 'gauntlets' ? 0.8 : 0.2);
    const back = part(P, { R: handR, pat: hp, round: 7, z: 3, sheen: hs, emis: A.H.glass });
    const thumb = part(P, { R: handR, pat: hp, round: 4, z: 4, sheen: hs, emis: A.H.glass });
    const fing = part(P, { R: handR, pat: hp, round: 3, z: 5, sheen: hs, emis: A.H.glass });
    cap(P, cx + f[0] * 10, cy + f[1] * 10, ax, ay, 11, 17, sleeve);
    if (cuff) cap(P, cx + f[0] * 8, cy + f[1] * 8, cx + f[0] * 24, cy + f[1] * 24, 10.5, 12, cuff);
    if (look.hands.shape === 'gauntlets' && !A.H.glass) { const gc = part(P, { R: rampOf(GL().ARMOR.a_kettle.col), pat: PATTERN.plates, sheen: 1, round: 5, z: 2.5 }); cap(P, cx + f[0] * 8, cy + f[1] * 8, cx + f[0] * 17, cy + f[1] * 17, 11, 12.5, gc); }
    ell(P, cx + f[0] * 4, cy + f[1] * 4, 12, 10, back, sec.ang);
    cap(P, cx - v[0] * 8 + u[0] * 4, cy - v[1] * 8 + u[1] * 4, cx - v[0] * 2 - u[0] * 8, cy - v[1] * 2 - u[1] * 8, 3.6, 3, thumb);
    for (let i = 0; i < 4; i++) { const k = -7 + i * 5.2; ell(P, cx + v[0] * 6 + u[0] * k, cy + v[1] * 6 + u[1] * k, 6, 3, fing, sec.ang + Math.PI / 2); }
    const r = render(P, { emis: true });
    return { canvas: r.canvas, emis: r.emis, ox: x0, oy: y0, w: r.w, h: r.h };
  }

  // ================================================================ 7. THE SHIELD AND THE OFF ARM
  const shieldCache = new Map();
  function shieldArt(look) {
    const sh = look.shield; if (!sh) return null;
    const k = sh.id + '|' + look.key; let a = shieldCache.get(k); if (a) return a;
    const F = sh.face;
    if (sh.shape === 'kite') {
      const W2 = 112, H2 = 164, P = pix(W2, H2), cx = W2 / 2;
      const outline = []; for (let i = 0; i <= 12; i++) { const t = i / 12; outline.push([6 + t * 100, 14 - Math.sin(t * Math.PI) * 10]); }
      for (let i = 1; i <= 14; i++) { const t = i / 14; outline.push([106 - Math.pow(t, 1.7) * 50, 14 + t * 146 - (1 - t) * t * 0]); }
      for (let i = 1; i < 14; i++) { const t = 1 - i / 14; outline.push([6 + Math.pow(t, 1.7) * 50, 14 + t * 146]); }
      const inset = outline.map(([x, y]) => [cx + (x - cx) * 0.88, 14 + (y - 14) * 0.94 + 4]);
      const rim = part(P, { R: rampOf(F.rim), sheen: 0.9, round: 4, z: 1 });
      const field = part(P, { R: rampOf(F.field), round: 40, z: 2, pat: (x, y) => (hash2(x >> 1, y >> 1, 7) < 0.05 ? 0.78 : hash2(x, y, 3) < 0.02 ? 1.2 : 1) });
      const fig = part(P, { R: rampOf(F.figure), round: 5, z: 3 });
      const crown = part(P, { R: rampOf(F.boss), sheen: 1, round: 2, z: 4 });
      const dark = part(P, { R: rampOf([60, 40, 40]), round: 2, z: 5, flat: 0.8 });
      poly(P, outline, rim); poly(P, inset, field);
      // the dead queen: a pale crowned figure, hands folded, a long gown [PROPOSED]
      ell(P, cx, 48, 7.5, 9, fig);
      poly(P, [[cx - 8, 60], [cx + 8, 60], [cx + 13, 72], [cx + 17, 116], [cx + 22, 126], [cx - 22, 126], [cx - 17, 116], [cx - 13, 72]], fig);
      poly(P, [[cx - 9, 40], [cx - 9, 31], [cx - 5, 36], [cx, 28], [cx + 5, 36], [cx + 9, 31], [cx + 9, 40]], crown);
      ell(P, cx, 82, 6, 4, crown);
      cap(P, cx - 3, 46, cx - 3, 47, 1, 1, dark); cap(P, cx + 3, 46, cx + 3, 47, 1, 1, dark);   // closed eyes
      cap(P, cx, 92, cx, 122, 0.8, 0.8, dark);
      const r = render(P, { emis: false });
      // rivets round the rim
      const x = r.canvas.getContext('2d'); x.fillStyle = 'rgb(236,220,170)';
      for (const [px, py] of [[16, 14], [56, 6], [96, 14], [100, 60], [12, 60], [80, 112], [32, 112]]) x.fillRect(px, py, 2, 2);
      a = { canvas: r.canvas, w: W2, h: H2, hx: cx, hy: 70, kind: 'kite' };
    } else {
      const W2 = 76, H2 = 76, P = pix(W2, H2), c = 38;
      const rim = part(P, { R: rampOf(F.rim), sheen: 0.9, round: 4, z: 1 });
      const field = part(P, { R: rampOf(F.field), round: 30, z: 2, pat: PATTERN.grain });
      const band = part(P, { R: rampOf(F.figure), round: 3, z: 3 });
      const field2 = part(P, { R: rampOf(F.field), round: 12, z: 4, pat: PATTERN.grain });
      const boss = part(P, { R: rampOf(F.boss), sheen: 1.2, round: 9, z: 5 });
      ell(P, c, c, 36, 36, rim); ell(P, c, c, 30, 30, field); ell(P, c, c, 22, 22, band); ell(P, c, c, 18, 18, field2); ell(P, c, c, 10, 10, boss);
      const r = render(P);
      const x = r.canvas.getContext('2d'); x.fillStyle = 'rgb(224,226,222)';
      for (let i = 0; i < 8; i++) { const an = i * Math.PI / 4 + 0.39; x.fillRect(Math.round(c + Math.cos(an) * 33) - 1, Math.round(c + Math.sin(an) * 33) - 1, 2, 2); }
      a = { canvas: r.canvas, w: W2, h: H2, hx: c, hy: c, kind: 'buckler' };
    }
    shieldCache.set(k, a); if (shieldCache.size > 12) shieldCache.delete(shieldCache.keys().next().value);
    return a;
  }
  // the off forearm, sleeve and all, painted pointing up from its elbow (bottom) to its wrist (top)
  const armCache = new Map();
  function offArmArt(look, glassHand) {
    const k = look.key + '|' + (glassHand ? 'g' : 'n'); let a = armCache.get(k); if (a) return a;
    const A = armSpec(look, 'left'), P = pix(48, 170);
    const sleeve = part(P, { R: A.S.R, pat: A.S.pat, round: 10, z: 1 });
    cap(P, 24, 22, 24, 170, 15, 20, sleeve);
    const z0 = A.S.zones[0];
    if (z0) { const cf = part(P, { R: z0.glass ? A.glassR : z0.skin ? A.skinR : z0.R, pat: z0.pat || PATTERN.none, sheen: z0.sheen || (z0.glass ? 1 : 0), round: 8, z: 2, emis: !!z0.glass }); cap(P, 24, 10, 24, 10 + z0.d * 1.4, 14, 15, cf); }
    const hand = part(P, { R: A.H.R, pat: A.H.pat, round: 8, z: 3, sheen: A.H.glass ? 1 : 0.2, emis: A.H.glass });
    ell(P, 24, 10, 13, 10, hand);
    const r = render(P, { emis: true });
    a = { canvas: r.canvas, emis: r.emis, w: 48, h: 170 };
    armCache.set(k, a); if (armCache.size > 12) armCache.delete(armCache.keys().next().value);
    return a;
  }

  // ================================================================ 8. LEGS AND BOOTS (seen from above)
  // A 300 x 300 picture (2x pixels) of the lower body as you see it looking down: boots at the top, shins, knees, thighs
  // running back under you to the bottom edge, the body armour's hem over them. Walk frames: 8 phases + standing.
  const legCache = new Map();
  const hemY = (len) => (len <= 0.6 ? 300 - clamp(len / 0.6, 0, 1) * 150 : 150 - (len - 0.6) / 0.4 * 70);
  function legArt(look, phase) {
    const k = look.key + '|' + phase; let a = legCache.get(k); if (a) return a;
    const G2 = GL(), Wd = 300, Ht = 300, P = pix(Wd, Ht), cx = 150;
    const body = look.body, feet = look.feet, coat = look.calling.coat;
    const trouser = mixc(mulc(coat, 0.95), [96, 88, 76], 0.4);
    const tro = part(P, { R: rampOf(trouser), pat: PATTERN.weave, round: 12, z: 1, grad: (x, y) => 0.88 + y / 300 * 0.2 });
    const bootR = rampOf(feet.shape === 'greaves' ? feet.col.trim : feet.col);
    const boot = part(P, { R: bootR, pat: patOf(feet.pattern === 'studs' ? 'grain' : feet.pattern === 'plates' ? 'none' : feet.pattern), round: 9, z: 3, sheen: feet.material === 'leather' ? 0.45 : feet.material === 'iron' ? 1 : 0.1 });
    const shaftCol = feet.shape === 'greaves' ? feet.col.trim : feet.col.base;
    const shaft = part(P, { R: rampOf(shaftCol), pat: PATTERN.grain, round: 10, z: 2, sheen: 0.35 });
    const plate = feet.shape === 'greaves' ? part(P, { R: rampOf(feet.col), sheen: 1.1, round: 6, z: 2.6 }) : 0;
    const wrap = feet.shape === 'softboots' ? part(P, { R: rampOf(mulc(feet.col.base, 0.62)), round: 2, z: 3.5, flat: 0.9 }) : 0;
    const stud = feet.shape === 'hobnails' ? part(P, { R: rampOf(feet.col.trim), sheen: 1.2, round: 2, z: 3.6 }) : 0;
    const welt = feet.shape !== 'softboots' ? part(P, { R: rampOf(mulc(feet.shape === 'greaves' ? feet.col.trim : feet.col.base, 0.55)), round: 2, z: 2.9 }) : 0;
    const toecap = feet.shape === 'hobnails' || feet.shape === 'greaves' ? part(P, { R: rampOf(mulc(feet.shape === 'greaves' ? feet.col.trim : feet.col.base, 0.85)), round: 6, z: 3.2, sheen: 0.6 }) : 0;
    const moving = phase >= 0, feetPos = [];
    for (const side of [-1, 1]) {
      const ph = moving ? (phase / 8 + (side > 0 ? 0.5 : 0)) * Math.PI * 2 : 0;
      const fwd = moving ? Math.sin(ph) : 0, lift = moving ? Math.max(0, Math.cos(ph)) * 0.6 : 0;
      const s = 1 - fwd * 0.08, fx = cx + side * (34 + fwd * 2), fy = 56 - fwd * 20;
      feetPos.push({ side, fx, fy, s, lift });
    }
    // the far foot first, so the near one overlaps it
    feetPos.sort((a, b) => a.fy - b.fy);
    for (const f of feetPos) {
      const { side, fx, fy, s, lift } = f, kx = fx + side * 6, ky = 160, hx = fx + side * 26, hy = 312;
      // thigh and shin (trousers), then the boot's shaft over the shin
      cap(P, kx, ky, hx, hy, 23, 32, tro);
      cap(P, fx, fy + 16 * s, kx, ky, 13 * s, 22, tro);
      const top = feet.shape === 'greaves' ? ky + 4 : feet.shape === 'hobnails' ? fy + 74 : feet.shape === 'softboots' ? fy + 40 : fy + 22;
      const tt = clamp((top - fy) / (ky - fy), 0, 1);
      if (feet.shape !== 'shoes') cap(P, fx, fy + 12 * s, lerp(fx, kx, tt), top, 15 * s, lerp(13 * s, 22, tt) + 1.5, shaft);
      if (plate) { cap(P, fx + side * 1, fy + 30, kx, ky - 6, 10, 15, plate); ell(P, kx, ky - 2, 15, 12, plate); }
      // the foot from above: a rounded toe, widest at the ball, narrowing to the ankle; a sole's welt round the toe;
      // the trailing foot is shorter on screen (its heel lifts as it pushes off)
      const toeR = 15.5 * s, tx = fx + side * 3, ty = fy - 34 * s * (1 - lift * 0.22), ank = fy + 16 * s;
      const outline = (grow) => { const pts = []; for (let i = 0; i <= 10; i++) { const a = Math.PI + i / 10 * Math.PI; pts.push([tx + Math.cos(a) * (toeR + grow), ty + toeR + Math.sin(a) * (toeR + grow)]); } pts.push([tx + toeR + grow - 1, ty + toeR + 10 * s], [fx + 12 * s + grow, ank], [fx - 12 * s - grow, ank], [tx - toeR - grow + 1, ty + toeR + 10 * s]); return pts; };
      if (welt) poly(P, outline(2.2), welt);
      poly(P, outline(0), boot);
      if (toecap) ell(P, tx, ty + toeR * 0.85, toeR * 0.78, toeR * 0.62, toecap);
      const toeY = ty + toeR;
      if (wrap) for (let i = 0; i < 3; i++) cap(P, fx - 14 * s, fy + 14 + i * 9, fx + 14 * s, fy + 22 + i * 9, 1.4, 1.4, wrap);
      if (stud) for (let i = 0; i < 11; i++) { const an = Math.PI * (1.05 + i * 0.09); const sx = tx + Math.cos(an) * (toeR + 1.2), sy = toeY + Math.sin(an) * (toeR + 1.2); put(P, sx, sy, stud); put(P, sx + 1, sy, stud); }
      if (feet.shape === 'shoes') { const tie = part(P, { R: rampOf(mulc(feet.col.base, 0.7)), round: 2, z: 3.5, flat: 0.85 }); cap(P, fx - 6, fy + 2, fx + 6, fy + 6, 1.3, 1.3, tie); cap(P, fx - 6, fy + 8, fx + 6, fy + 12, 1.3, 1.3, tie); }
    }
    // the body armour's hem over the thighs (len from GEARLOOK21), and a belt at the bottom edge
    const hy = hemY(body.len == null ? 0.1 : body.len), bR = rampOf(body.col || coat);
    const bpat = body.pattern === 'quilt' ? PATTERN.quilt : body.material === 'mail' ? PATTERN.mail : body.pattern === 'rivets' ? PATTERN.rivets : body.pattern === 'plates' ? PATTERN.plates : PATTERN.weave;
    const coatP = part(P, { R: bR, pat: bpat, round: 18, z: 5, sheen: body.material === 'bellbronze' ? 1 : body.material === 'mail' ? 0.7 : body.material === 'oilcloth' ? 0.4 : 0 });
    const wave = (x) => Math.sin(x * 0.11) * 3;
    if (body.shape === 'robe' || body.shape === 'longcoat' || body.shape === 'hauberk') {
      // a skirt that hangs over both legs; the longcoat and the mail are split up the middle
      const spread = body.shape === 'robe' ? 64 : 72, gap = body.shape === 'robe' ? 0 : body.shape === 'longcoat' ? 16 : 6;
      for (const side of [-1, 1]) {
        const xin = cx + side * gap, xout = cx + side * (spread + 30), xhem = cx + side * spread;
        const pts = [[xin, 300], [xout, 300], [xhem + side * 6, hy + wave(xhem)]];
        for (let i = 1; i < 8; i++) { const t = i / 8, x = lerp(xhem, xin, t); pts.push([x, hy + wave(x) + (gap ? t * t * 10 : 0)]); }
        pts.push([xin, hy + (gap ? 12 : 0)]);
        poly(P, pts, coatP);
      }
      if (body.pattern === 'stole') { const stole = part(P, { R: rampOf(body.col.trim), sheen: 0.6, round: 4, z: 6 }); for (const side of [-1, 1]) poly(P, [[cx + side * 10, 300], [cx + side * 22, 300], [cx + side * 18, hy - 10], [cx + side * 8, hy - 6]], stole); }
    } else if (body.shape === 'cuirass') {
      // tassets: three rows of bell-bronze plates over the hips
      for (let r = 0; r < 3; r++) { const y0 = 300 - r * 26; const pl = part(P, { R: bR, sheen: 1.1, round: 7, z: 5 + r * 0.1 }); for (const side of [-1, 1]) poly(P, [[cx + side * 4, y0], [cx + side * 100, y0], [cx + side * 92, y0 - 30], [cx + side * 8, y0 - 34]], pl); }
    } else {
      // a skirt or a hem straight across: gambeson, brigandine, jerkin, a shirt
      const pts = [[cx - 120, 300], [cx + 120, 300]];
      for (let i = 0; i <= 16; i++) { const x = cx + 110 - i * 13.75; pts.push([x, hy + wave(x) + Math.abs(x - cx) * 0.06]); }
      poly(P, pts, coatP);
    }
    if (body.shape !== 'robe' && body.shape !== 'cuirass') {
      const belt = part(P, { R: rampOf([62, 44, 32]), pat: PATTERN.grain, round: 4, z: 7, sheen: 0.4 });
      poly(P, [[cx - 120, 300], [cx + 120, 300], [cx + 112, 286], [cx - 112, 286]], belt);
      const buck = part(P, { R: rampOf([190, 160, 96]), sheen: 1.2, round: 3, z: 8 });
      poly(P, [[cx - 9, 299], [cx + 9, 299], [cx + 8, 285], [cx - 8, 285]], buck);
    }
    const r = render(P);
    a = { canvas: r.canvas, w: Wd, h: Ht, feet: feetPos.map((f) => ({ x: f.fx, y: f.fy, s: f.s })) };
    legCache.set(k, a); if (legCache.size > 40) legCache.delete(legCache.keys().next().value);
    return a;
  }

  // ================================================================ 8b. WHAT YOU WEAR ON YOUR HEAD (seen when you look up)
  // The brim of a kettle helm, the bell-helm's rim over the eye slit, the hood's edge, the leather cap's seam: each comes
  // down from the top of the view as the look goes up, the way a brim crosses the top of your sight. 640 x 90 (2x).
  const headCache = new Map();
  function headArt(look) {
    const hd = look.head; if (!hd || hd.bare) return null;
    const k = hd.id + '|' + look.key; let a = headCache.get(k); if (a) return a;
    const W2 = 640, H2 = 90, P = pix(W2, H2), R = rampOf(hd.col), cx = 320;
    if (hd.shape === 'kettle') {
      const brim = part(P, { R, sheen: 1, round: 10, z: 1, pat: PATTERN.none, grad: (x, y) => 0.7 + y / 90 * 0.5 });
      const pts = []; for (let i = 0; i <= 32; i++) { const x = i / 32 * W2; pts.push([x, 26 + 34 * Math.sin(i / 32 * Math.PI)]); } pts.push([W2, 0], [0, 0]);
      poly(P, pts, brim);
      const r = render(P); const x = r.canvas.getContext('2d'); x.fillStyle = 'rgb(214,220,224)';
      for (let i = 2; i < 31; i += 4) { const px = i / 32 * W2, py = 26 + 34 * Math.sin(i / 32 * Math.PI) - 7; x.fillRect(px - 1, py - 1, 3, 3); }
      a = { canvas: r.canvas };
    } else if (hd.shape === 'bellhelm') {
      const rim = part(P, { R, sheen: 1.1, round: 8, z: 1, grad: (x, y) => 0.65 + y / 90 * 0.55 });
      const lip = part(P, { R: rampOf(hd.col.trim), round: 3, z: 2, sheen: 0.6 });
      const pts = []; for (let i = 0; i <= 32; i++) { const x = i / 32 * W2; pts.push([x, 40 + 22 * Math.pow(Math.abs(i / 16 - 1), 2.2) * -1 + 22]); } pts.push([W2, 0], [0, 0]);
      poly(P, pts, rim);
      for (let i = 0; i < 32; i++) { const x0 = i / 32 * W2, x1 = (i + 1) / 32 * W2, y0 = 62 - 22 * Math.pow(Math.abs(i / 16 - 1), 2.2), y1 = 62 - 22 * Math.pow(Math.abs((i + 1) / 16 - 1), 2.2); cap(P, x0, y0 - 3, x1, y1 - 3, 2.6, 2.6, lip); }
      a = { canvas: render(P).canvas };
    } else if (hd.shape === 'hood') {
      const wool = part(P, { R, pat: PATTERN.weave, round: 14, z: 1, grad: (x, y) => 0.6 + y / 90 * 0.5 });
      for (const side of [-1, 1]) { const pts = [[cx + side * 320, 0], [cx + side * 320, 90], [cx + side * 270, 60], [cx + side * 200, 28], [cx + side * 120, 10], [cx, 4], [cx, 0]]; poly(P, pts, wool); }
      a = { canvas: render(P).canvas };
    } else {   // cap
      const leather = part(P, { R, pat: PATTERN.grain, round: 6, z: 1, sheen: 0.4, grad: (x, y) => 0.7 + y / 90 * 0.4 });
      const pts = []; for (let i = 0; i <= 32; i++) { const x = i / 32 * W2; pts.push([x, 10 + 14 * Math.sin(i / 32 * Math.PI)]); } pts.push([W2, 0], [0, 0]);
      poly(P, pts, leather);
      const r = render(P); const x = r.canvas.getContext('2d'); x.fillStyle = 'rgba(40,24,14,0.9)';
      for (let i = 1; i < 64; i += 2) { const px = i / 64 * W2; x.fillRect(px, 6 + 14 * Math.sin(i / 64 * Math.PI), 4, 1); }
      a = { canvas: r.canvas };
    }
    headCache.set(k, a); if (headCache.size > 8) headCache.delete(headCache.keys().next().value);
    return a;
  }

  // ================================================================ 9. LIGHT ON THE BODY
  // The engine lights a sprite beside you with the map's light (outdoors: the hour and the weather, F.light) plus the
  // lamps around it; the body takes the same, read from the last frame's post hook and Engine.lightAt, smoothed, and
  // floored so arms and boots stay readable on the darkest night. Glass is emissive and keeps its own light.
  const LT = { k: [1, 1, 1], key: '32,32,32', frameLight: 1, outdoor: false, lamp: [0, 0, 0], n: 0, FLOOR: 0.42 };
  try { Engine.addPostHook((F) => { LT.frameLight = typeof F.light === 'number' ? F.light : 1; LT.outdoor = !!(G.map && G.map.outdoor); }, 1e9); } catch (e) { warnOnce('posthook', e); }
  // the lamps near you, the engine's own light kinds and colours (js/engine.js gatherLights) without the wall masks:
  // cheap enough for every frame's budget, read every sixth frame
  function lampsAt(x, y) {
    const out = [0, 0, 0], ents = G.ents || [];
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i]; if (!e || e.hidden || e.dead) continue;
      const dx = e.x - x, dy = e.y - y, d2 = dx * dx + dy * dy; if (d2 > 36) continue;
      const sp = e.sprite; let r = 0, c = null;
      if (sp === 'kaelen' || e.item === 'shard' || e.item === 'core' || e.glassLamp) { r = sp === 'kaelen' ? 3.2 : 2.5; c = [18, 66, 58]; }
      else if (sp === 'lamp' && (e.glow === undefined || e.glow > 0.05)) { r = 4.5; c = [58, 38, 12]; }
      else if (sp === 'campfire' || sp === 'hearth') { r = 5.8; c = [78, 40, 10]; }
      else if (sp === 'basin' || sp === 'loom' || sp === 'web' || sp === 'cocoon') { r = 4.2; c = [34, 24, 64]; }
      else if (sp === 'cores' || sp === 'coil' || e.type === 'aegis' || e.lightCol) { r = 4; c = e.lightCol || [20, 58, 48]; }
      if (!c || d2 >= r * r) continue;
      const k = 1 - d2 / (r * r), kk = k * k;
      out[0] += c[0] * kk; out[1] += c[1] * kk; out[2] += c[2] * kk;
    }
    try { if (typeof UPG === 'object' && UPG && UPG.lantern) { out[0] += 46; out[1] += 30; out[2] += 10; } } catch (e) { /* no lantern */ }
    return out.map((v) => Math.min(90, v));
  }
  function updateLight(dt) {
    let tgt = [1, 1, 1];
    if (set.light) {
      if ((LT.n++ % 6) === 0 || dt === 0) { try { LT.lamp = lampsAt(Engine.cam.x, Engine.cam.y); } catch (e) { LT.lamp = [0, 0, 0]; } }
      const base = LT.outdoor ? clamp(LT.frameLight, 0, 1) : 1;
      tgt = [0, 1, 2].map((c) => clamp(base + (LT.lamp[c] || 0) / 255 * 1.4, LT.FLOOR, 1));
    }
    // no smoothing over time: the light depends only on where you stand and the hour (so two frames of the same moment are
    // the same picture); the steps of 1/16 with the hysteresis below keep it from flickering
    for (let c = 0; c < 3; c++) LT.k[c] = tgt[c];
    // the applied level moves in steps of 1/16 and only when the light has really moved (hysteresis): a re-tint is a
    // canvas recomposite per picture, so it happens a few times as you walk past a lamp, not every frame
    const cur = LT.key.split(',').map((v) => +v / 32);
    const far = LT.k.some((v, c) => Math.abs(v - cur[c]) > 0.07) || (LT.k.every((v, c) => Math.abs(v - tgt[c]) < 0.01) && tgt.some((v, c) => Math.abs(v - cur[c]) > 0.02));
    if (far || dt === 0) LT.key = LT.k.map((v) => Math.round(v * 16) * 2).join(',');
  }
  const tintCache = new WeakMap();
  function lit(cv, em) {
    if (!cv || REC) return cv;           // under R3D the scene's shading lights the body
    if (LT.key === '32,32,32') return cv;
    let e = tintCache.get(cv); if (e && e.key === LT.key) return e.cv;
    const out = e ? e.cv : mkCanvas(cv.width, cv.height), x = out.getContext('2d');
    const q = LT.key.split(',').map((v) => Math.round(+v / 32 * 255));
    x.globalCompositeOperation = 'copy'; x.drawImage(cv, 0, 0);
    x.globalCompositeOperation = 'multiply'; x.fillStyle = `rgb(${q[0]},${q[1]},${q[2]})`; x.fillRect(0, 0, out.width, out.height);
    x.globalCompositeOperation = 'destination-in'; x.drawImage(cv, 0, 0);
    x.globalCompositeOperation = 'source-over'; if (em) x.drawImage(em, 0, 0);
    tintCache.set(cv, { key: LT.key, cv: out }); stats.tints++;
    const b = OWNED.get(cv); if (b) OWNED.set(out, b);
    return out;
  }

  // ================================================================ 10. FRAME STATE (presentation only: read, never written back)
  const WS = { t: 0, x: null, y: null, map: null, stride: 0, speed: 0, gk: 0 };
  function frameState() {
    const now = performance.now(), dt = WS.t ? clamp((now - WS.t) / 1000, 0, 0.1) : 0; WS.t = now;
    const c = Engine.cam; let inst = 0;
    if (WS.map === G.mapId && WS.x != null) { const d = Math.hypot(c.x - WS.x, c.y - WS.y); if (d < 1 && dt > 0) { WS.stride += d; inst = d / dt; } }
    WS.x = c.x; WS.y = c.y; WS.map = G.mapId;
    WS.speed += (inst - WS.speed) * (dt === 0 ? 1 : Math.min(1, dt * 8));
    const guard = typeof UPG !== 'undefined' && UPG && UPG.blocking && G.state === 'play' ? 1 : 0;
    WS.gk += (guard - WS.gk) * (reduced() || dt === 0 ? 1 : Math.min(1, dt * 16));
    updateLight(dt);
    return dt;
  }

  // ================================================================ 11. DRAWING
  // Under R3D the body is not painted on the HUD canvas: every picture is RECORDED (its four corners in logical 320x150
  // pixels, from the canvas transform it would have been drawn with) and the R3D 'body' pass draws the list in the scene,
  // lit by the scene's shading and graded by its post chain. REC is that recording (null on the raycaster path).
  let REC = null;
  function put2(ctx, img, dx, dy, dw, dh, em) {
    if (REC) {
      const L = REC.inv.multiply(ctx.getTransform());
      const p = (x, y) => { const q = L.transformPoint({ x, y }); return [q.x, q.y]; };
      REC.list.push({ img, em: em || null, pts: [p(dx, dy), p(dx + dw, dy), p(dx + dw, dy + dh), p(dx, dy + dh)] });
      return;
    }
    ctx.drawImage(img, dx, dy, dw, dh);
  }
  const VWv = () => (typeof VW === 'number' ? VW : 320), VHv = () => (typeof VIEW_H === 'number' ? VIEW_H : 150);
  const fph = () => (typeof FPHANDS === 'object' && FPHANDS && FPHANDS.st) ? FPHANDS.st : null;
  // the off arm's idle sway, in half-pixel steps (a picture that moves by a hundredth of a pixel between two frames would
  // flip a scatter of nearest-sampled pixels; in steps it moves all at once)
  const bobNow = (ph) => Math.round(((Engine.cam.bob || 0) + (G.attack && G.attack.t > 0 ? 0 : Math.sin(performance.now() / 900 + (ph || 0)) * 1.4)) * 2) / 2;
  // the widest look in rows the renderer allows (R3D.camera.limit() is an angle; the Original preset keeps 40 rows)
  function pitchMax() { try { if (typeof R3D === 'object' && R3D && R3D.camera) { const v = R3D.FX * Math.tan(R3D.camera.limit()); if (v > 0) return v; } } catch (e) { /* default */ } return 40; }
  function hiddenBody() {
    if (G.state !== 'play' || G.dead || G.openPanel) return true;
    const f = fph(); if (f && f.climb > 0) return true;
    try { if (typeof horseActive === 'function' && horseActive()) return true; } catch (e) { /* no horse */ }
    try { if (typeof DEEP16 === 'object' && DEEP16 && typeof DEEP16.swimming === 'function' && DEEP16.swimming()) return true; } catch (e) { /* no water */ }
    return false;
  }
  let shadowCv = null;
  function footShadow() {
    if (shadowCv) return shadowCv;
    shadowCv = mkCanvas(64, 32); const x = shadowCv.getContext('2d'), g = x.createRadialGradient(32, 16, 0, 32, 16, 32);
    g.addColorStop(0, 'rgba(0,0,0,0.42)'); g.addColorStop(0.6, 'rgba(0,0,0,0.22)'); g.addColorStop(1, 'rgba(0,0,0,0)');
    x.setTransform(1, 0, 0, 0.5, 0, 8); x.fillStyle = g; x.fillRect(0, 0, 64, 64); return shadowCv;
  }
  // legs and boots: they come up from the bottom edge as the look goes down, and ride the floor's shear with it
  function legsPose() {
    const pm = pitchMax(), pitch = Engine.cam.pitch || 0;
    const k = clamp((-pitch - 0.2 * Math.min(pm, 40)) / (0.8 * Math.min(pm, 40)), 0, 1); if (k <= 0) return null;
    const kk = k * k * (3 - 2 * k);
    const toeY = Math.max(0, VHv() + 6 - kk * 74 - Math.max(0, -pitch - 40) * 0.9) + (Engine.cam.bob || 0) * 1.2;
    return { k: kk, toeY };
  }
  function drawLegs(ctx, look) {
    if (!set.feet || hiddenBody()) return false;
    const moving = WS.speed > 0.45 && !reduced();
    const frame = moving ? Math.floor(((WS.stride / 1.5) % 1) * 8) & 7 : -1;
    if (REC) { const art = legArt(look, frame); if (art) { REC.legs = art; stats.drawn.feet++; } return !!art; }   // true 3D: a quad at your feet (R3D pass)
    const pose = legsPose(); if (!pose) return false;
    const art = legArt(look, frame); if (!art) return false;
    const LS = 0.62, x0 = VWv() / 2 - 150 * LS, y0 = pose.toeY - 12;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VWv(), VHv()); ctx.clip();
    const sh = footShadow();
    for (const f of art.feet) ctx.drawImage(sh, x0 + f.x * LS - 19 * f.s, y0 + (f.y - 30) * LS, 38 * f.s, 30);
    ctx.drawImage(lit(art.canvas), x0, y0, 300 * LS, 300 * LS);
    ctx.restore();
    stats.drawn.feet++;
    return true;
  }
  function headPose() {
    if (REC) { let a = 0; try { a = R3D.camera.angle(); } catch (e) { a = 0; } const k = clamp((a - 0.14) / 0.36, 0, 1); return k > 0 ? { k: k * k * (3 - 2 * k) } : null; }
    const pm = pitchMax(), pitch = Engine.cam.pitch || 0;
    const k = clamp((pitch - 0.25 * Math.min(pm, 40)) / (0.75 * Math.min(pm, 40)), 0, 1); if (k <= 0) return null;
    return { k: k * k * (3 - 2 * k) };
  }
  function drawHead(ctx, look) {
    if (hiddenBody() || !look.head || look.head.bare) return false;
    const p = headPose(); if (!p) return false;
    const a = headArt(look); if (!a) return false;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VWv(), VHv()); ctx.clip();
    put2(ctx, lit(a.canvas), 0, -45 + p.k * 45 + (Engine.cam.bob || 0) * 0.6, VWv(), 45);
    ctx.restore(); stats.drawn.head = (stats.drawn.head || 0) + 1;
    return true;
  }
  function shieldPose(art) {
    const kite = art.kind === 'kite';
    const rest = kite ? [48, 124, 0.5, -0.12] : [44, 126, 0.5, -0.1];
    const guard = kite ? [118, 98, 0.56, 0.02] : [126, 96, 0.64, 0.02];
    const bash = kite ? [130, 88, 0.68, 0.06] : [136, 84, 0.78, 0.04];
    let gk = WS.gk, bk = 0;
    try { if (typeof ARMS12 === 'object' && ARMS12.st && ARMS12.st.bashT > 0) bk = Math.sin(clamp(1 - ARMS12.st.bashT / ARMS12.BAL.bash.dur, 0, 1) * Math.PI); } catch (e) { bk = 0; }
    if (reduced()) { gk = gk > 0.5 ? 1 : 0; bk = bk > 0.3 ? 1 : 0; }
    const m = (i) => lerp(lerp(rest[i], guard[i], gk), bash[i], bk);
    const f = fph(), drop = f ? (f.lower > 0 ? f.lower * f.lower * (3 - 2 * f.lower) * 110 : 0) : 0;
    return { x: m(0), y: m(1) + bobNow(1.7) * 1.5 + drop, s: m(2), r: m(3), gk, bk };
  }
  function drawOffArm(ctx, look, ax, ay, glassHand) {
    const a = offArmArt(look, glassHand); if (!a) return;
    const ex = ax - 46, ey = VHv() + 60, ang = Math.atan2(-(ex - ax), ey - ay);   // the arm runs from the hand down-left out of the view
    ctx.save(); ctx.translate(ax, ay); ctx.rotate(ang); put2(ctx, lit(a.canvas, a.emis), -10, -4, 20, 72, a.emis); ctx.restore();
  }
  function drawShield(ctx, look) {
    if (!look.shield || look.shieldStowed || hiddenBody()) return false;
    const art = shieldArt(look); if (!art) return false;
    const p = shieldPose(art);
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VWv(), VHv()); ctx.clip();
    drawOffArm(ctx, look, p.x - 2, p.y + (art.kind === 'kite' ? 4 : 2), false);
    ctx.translate(p.x, p.y); ctx.rotate(p.r); ctx.scale(p.s * (art.kind === 'kite' ? 0.86 : 0.92), p.s);
    put2(ctx, lit(art.canvas), -art.hx, -art.hy, art.w, art.h);
    ctx.restore();
    stats.drawn.shield++;
    return true;
  }
  // a glassed traveller with a blade in the right hand: the glass left hand rests low on the left (fp_glass, mirrored)
  function drawGlassIdle(ctx, look, wid) {
    if (!look.glassArm || hiddenBody() || look.shield && !look.shieldStowed || look.offhand || look.twoHanded) return false;
    if (wid === 'glass' || wid === 'hands' || G.song.t > 0 || G.songFx > 0) return false;
    const img = Engine.images.fp_glass; if (!img || !img.width) return false;
    const f = fph(), drop = f && f.lower > 0 ? f.lower * 90 : 0;
    const iw = img.width * 0.34, ih = img.height * 0.34;
    ctx.save(); ctx.beginPath(); ctx.rect(0, 0, VWv(), VHv()); ctx.clip();
    ctx.translate(16 + iw * 0.5, VHv() + 30 + bobNow(1.7) * 1.5 + drop + WS.gk * 30); ctx.rotate(0.5); ctx.scale(-1, 1);
    put2(ctx, img, -iw * 0.5, -ih + 12, iw, ih, img);
    ctx.restore();
    stats.drawn.glassIdle++;
    return true;
  }

  // the drawImage hook: wherever a gear painting is drawn, its sleeve continuation goes under it and its extra hand over
  // it, in the same transform; the shield (or the resting glass hand) goes in once, just before the first weapon picture
  function makeHook(ctx, look, wid, baseM) {
    const orig = CanvasRenderingContext2D.prototype.drawImage, setT = CanvasRenderingContext2D.prototype.setTransform;
    const st = { offDone: false };
    const hook = function (img) {
      const b = img && OWNED.get(img);
      if (!b || arguments.length !== 5) return orig.apply(this, arguments);
      const dx = arguments[1], dy = arguments[2], dw = arguments[3], dh = arguments[4], sx = dw / img.width, sy = dh / img.height;
      if (!st.offDone && b.side === 'right') {
        st.offDone = true;
        try {
          this.save(); setT.call(this, baseM); this.drawImage = orig;
          if (!drawShield(this, look)) drawGlassIdle(this, look, wid);
        } catch (e) { warnOnce('off arm', e); } finally { this.drawImage = hook; this.restore(); }
      }
      const dr = (c, x, y, w, h, em) => { if (REC) { const keep = this.drawImage; this.drawImage = orig; try { put2(this, c, x, y, w, h, em); } finally { this.drawImage = keep; } } else orig.call(this, c, x, y, w, h); };
      if (b.ext) { dr(lit(b.ext.canvas), dx + b.ext.ox * sx, dy + b.ext.oy * sy, b.ext.w * sx, b.ext.h * sy); stats.drawn.ext++; }
      dr(img, dx, dy, dw, dh, b.emis); stats.drawn.arms++;
      for (const o of b.over) { dr(lit(o.canvas, o.emis), dx + o.ox * sx, dy + o.oy * sy, o.w * sx, o.h * sy, o.emis); stats.drawn.extra++; }
      return undefined;
    };
    return { hook, st };
  }

  function visibleWeapons(look) {
    const p = G.player, wid = p.weapons ? p.weapons[p.weapon] : 'hands', W = (typeof WEAPONS === 'object' && WEAPONS[wid]) || WEAPONS.hands;
    const list = [[W.img, wid, 'right']];
    const f = fph(); if (f && f.shown && f.shown !== wid && WEAPONS[f.shown] && WEAPONS[f.shown].img !== W.img) list.push([WEAPONS[f.shown].img, f.shown, 'right']);   // the one being put away
    if (look.offhand && WEAPONS[look.offhand.id] && WEAPONS[look.offhand.id].img !== W.img) list.push([WEAPONS[look.offhand.id].img, look.offhand.id, 'left']);
    if (W.img !== 'fp_hands') list.push(['fp_hands', 'hands', 'right']);   // Songs are cast from the bare (or gloved, or glass) hands
    return { wid, list };
  }

  const LIFT = 30;
  const _drawHUD = drawHUD;
  drawHUD = function () {
    if (!on() || !G.player || typeof Engine === 'undefined' || !Engine.images) return _drawHUD.apply(this, arguments);
    const t0 = performance.now(), ctx = Engine.ctx;
    let look = null, swaps = [], hookSt = null, had = false, prev = null;
    REC = r3dOn() ? { inv: ctx.getTransform().inverse(), list: [], legs: null } : null;
    try {
      look = GL().of(G.player);
      frameState();
      drawLegs(ctx, look);
      drawHead(ctx, look);
      const vw = visibleWeapons(look);
      for (const [img, wid, side] of vw.list) {
        if (!Engine.images[img] || swaps.some((s) => s[0] === img)) continue;
        const b = build(img, look, wid, side); if (!b) continue;
        const c = lit(b.main, b.emis); OWNED.set(c, b);
        swaps.push([img, Engine.images[img]]); Engine.images[img] = c;
      }
      const baseM = ctx.getTransform();
      const H = makeHook(ctx, look, vw.wid, baseM); hookSt = H.st;
      had = Object.prototype.hasOwnProperty.call(ctx, 'drawImage'); prev = ctx.drawImage;
      ctx.drawImage = H.hook;
    } catch (e) { warnOnce('setup', e); }
    // the arm comes up into view: every weapon picture (and its trail, its off hand, its holster drop) is drawn LIFT
    // pixels higher, by lending the draw a lower head-bob for its duration (they all add cam.bob x 1.5)
    const bob0 = Engine.cam.bob;
    // not for the bare hands and Songs: the casting pose has its own rise and its glow its own place
    const handsUp = !!(G.song && G.song.t > 0) || G.songFx > 0 || (() => { try { return currentWeapon().img === 'fp_hands'; } catch (e) { return false; } })();
    if (look && !handsUp) Engine.cam.bob = (bob0 || 0) - LIFT / 1.5;
    let r;
    try { r = _drawHUD.apply(this, arguments); } finally {
      Engine.cam.bob = bob0;
      try { if (had) ctx.drawImage = prev; else delete ctx.drawImage; } catch (e) { /* restored below */ }
      for (const [img, orig] of swaps) Engine.images[img] = orig;
    }
    try {
      // nothing drew a weapon picture this frame (the weapon is away): the shield still rides the arm
      if (look && hookSt && !hookSt.offDone && G.state === 'play') { ctx.save(); if (!drawShield(ctx, look)) drawGlassIdle(ctx, look, ''); ctx.restore(); }
    } catch (e) { warnOnce('late shield', e); }
    if (REC) { R3B.last = REC; REC = null; } else R3B.last = null;
    const ms = performance.now() - t0; stats.lastMs = ms; stats.maxMs = Math.max(stats.maxMs * 0.995, ms); stats.frames++;
    return r;
  };

  // ================================================================ 11b. R3D: THE BODY IN THE 3D SCENE (pass 'body', order 40)
  // CONTRACT use (js/r3d21.js): R3D.addPass({ name: 'body', order: 40 }), R3D.program() with the common + shade chunks
  // (R3DSurf kind 2 = body: the raycaster's ambient, flicker and point lights at the player, or LIGHT's shading once it
  // replaces the chunk), R3D.bindScene(), MRT outputs oColor / oAux (material 6 sprite, emissive in g). What it draws:
  //   * the legs picture as a quad in the world: from the toes on the ground ahead of you to the hips under the eye,
  //     facing up and back toward the eye, with soft contact shadows; depth-tested like any geometry, so it is seen
  //     exactly when the true camera looks down, and a wall you are pressed against still hides it;
  //   * every first-person picture recorded by drawHUD (arms, sleeves, second hand, shield, off arm, the resting glass
  //     hand, the helm's brim) as screen quads in its own depth range (in front of the world, no depth write), drawn the
  //     frame after they were posed (one frame of latency on a camera-locked picture).
  // If the pass cannot compile or R3D is not showing, the raycaster path above paints the same pictures on the HUD canvas.
  const R3B = { last: null, prog: null, failed: false, gl: null, vao: null, vbo: null, tex: new Map(), drawn: 0, quads: 0, legs: 0, err: '' };
  function r3dOn() {
    try { return typeof R3D === 'object' && R3D && !R3B.failed && !!R3B.prog && R3D.shown() && !!R3D.getPass('body'); } catch (e) { return false; }
  }
  const BODY_VS = `
layout(location = 0) in vec4 aPos;   // xyz world (GL) or (ndc.xy, 0) ; w unused
layout(location = 1) in vec3 aUv;    // uv, mode (0 screen, 1 world, 2 shadow)
out vec2 vUv; out vec3 vPos; flat out float vMode;
void main() {
  vUv = aUv.xy; vMode = aUv.z;
  if (aUv.z > 0.5) { vPos = aPos.xyz; gl_Position = uViewProj * vec4(aPos.xyz, 1.0); }
  else { vPos = uEye.xyz + vec3(uFwdH.xy * 0.3, -0.12); gl_Position = vec4(aPos.xy, -1.0, 1.0); }
}`;
  const BODY_FS = `
uniform sampler2D uImg; uniform sampler2D uEm; uniform float uHasEm;
in vec2 vUv; in vec3 vPos; flat in float vMode;
layout(location = 0) out vec4 oColor; layout(location = 1) out vec4 oAux;
void main() {
  vec4 c = texture(uImg, vUv);
  if (vMode > 1.5) { float a = c.a * 0.9; if (a < 0.01) discard; oColor = vec4(0.0, 0.0, 0.0, a); oAux = vec4(5.0 / 255.0, 0.0, 0.0, a); return; }
  if (c.a < 0.5) discard;
  float e = uHasEm > 0.5 ? step(0.5, texture(uEm, vUv).a) : 0.0;
  R3DSurf s; s.albedo = c.rgb; s.pos = vPos; s.nrm = vec3(-uFwdH.xy, 0.0); s.side = 1.0; s.mat = 6.0; s.emissive = e; s.fi = 1.0; s.ladd = vec3(0.0); s.kind = 2;
  vec3 col = r3dShade(s);
  col = mix(col, c.rgb, e);
  oColor = vec4(col, 1.0); oAux = vec4(6.0 / 255.0, e, 0.0, 1.0);
}`;
  function texOf(g, cv) {
    let t = R3B.tex.get(cv);
    if (t) { R3B.tex.delete(cv); R3B.tex.set(cv, t); return t; }   // LRU order
    t = g.createTexture(); g.bindTexture(g.TEXTURE_2D, t);
    g.pixelStorei(g.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); g.pixelStorei(g.UNPACK_FLIP_Y_WEBGL, false);
    g.texImage2D(g.TEXTURE_2D, 0, g.RGBA, g.RGBA, g.UNSIGNED_BYTE, cv);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
    g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
    R3B.tex.set(cv, t);
    if (R3B.tex.size > 64) { const k = R3B.tex.keys().next().value; g.deleteTexture(R3B.tex.get(k)); R3B.tex.delete(k); }
    return t;
  }
  const quadBuf = new Float32Array(4 * 7);
  function quad(g, pts, mode, img, em) {
    // pts: 4 corners (TL, TR, BR, BL) as [x, y, z] (world) or [ndcX, ndcY, 0]
    const uv = [[0, 0], [1, 0], [1, 1], [0, 1]], order = [0, 1, 3, 2];
    for (let i = 0; i < 4; i++) { const k = order[i], o = i * 7; quadBuf[o] = pts[k][0]; quadBuf[o + 1] = pts[k][1]; quadBuf[o + 2] = pts[k][2]; quadBuf[o + 3] = 1; quadBuf[o + 4] = uv[k][0]; quadBuf[o + 5] = uv[k][1]; quadBuf[o + 6] = mode; }
    g.activeTexture(g.TEXTURE6); g.bindTexture(g.TEXTURE_2D, texOf(g, img));
    if (em) { g.activeTexture(g.TEXTURE7); g.bindTexture(g.TEXTURE_2D, texOf(g, em)); }
    g.uniform1f(R3B.prog.u.uHasEm, em ? 1 : 0);
    g.bindBuffer(g.ARRAY_BUFFER, R3B.vbo); g.bufferData(g.ARRAY_BUFFER, quadBuf, g.STREAM_DRAW);
    g.drawArrays(g.TRIANGLE_STRIP, 0, 4); R3B.quads++;
  }
  const bodyPass = {
    name: 'body', order: 40,
    init(g, R) {
      R3B.gl = g; R3B.tex.clear(); R3B.failed = false;
      try {
        R3B.prog = R.program(BODY_VS, BODY_FS, { chunks: ['common', 'shade'] });
        if (!R3B.prog || !R3B.prog.p) throw new Error('no program');
      } catch (e) { R3B.failed = true; R3B.err = String(e && e.message || e).slice(0, 200); warnOnce('r3d program', e); return; }
      R3B.vao = g.createVertexArray(); R3B.vbo = g.createBuffer();
      g.bindVertexArray(R3B.vao); g.bindBuffer(g.ARRAY_BUFFER, R3B.vbo);
      g.enableVertexAttribArray(0); g.vertexAttribPointer(0, 4, g.FLOAT, false, 28, 0);
      g.enableVertexAttribArray(1); g.vertexAttribPointer(1, 3, g.FLOAT, false, 28, 16);
      g.bindVertexArray(null);
    },
    dispose(g) { for (const t of R3B.tex.values()) g.deleteTexture(t); R3B.tex.clear(); },
    enabled() { return on() && !R3B.failed && !!R3B.last; },
    draw(g, F, R) {
      const rec = R3B.last; if (!rec || R3B.failed || !R3B.prog || !R3B.prog.p) return;
      R.bindScene(g, F); R.use(R3B.prog);
      g.uniform1i(R3B.prog.u.uImg, 6); g.uniform1i(R3B.prog.u.uEm, 7);
      g.bindVertexArray(R3B.vao); g.disable(g.CULL_FACE);
      // legs: a quad in the world, toes on the ground ahead, hips under the eye
      if (rec.legs && set.feet) {
        const c = Engine.cam, fx = Math.cos(c.dir), fy = Math.sin(c.dir), rx = -fy, ry = fx, gz = (c.z || 0.5) - 0.5;
        const W2 = 0.19, toe = 0.36, hip = -0.14, toG = (x, y, z) => R.toGL ? R.toGL(x, y, z) : [x, y, z * R.ZK];
        const P = (fwd, side, z) => toG(c.x + fx * fwd + rx * side, c.y + fy * fwd + ry * side, z);
        g.enable(g.DEPTH_TEST); g.depthFunc(g.LEQUAL);
        // contact shadows under the feet (blended, no depth write)
        g.depthMask(false); g.enable(g.BLEND); g.blendFunc(g.SRC_ALPHA, g.ONE_MINUS_SRC_ALPHA);
        const sh = footShadow();
        for (const f of rec.legs.feet) { const fw = toe - (f.y / 300) * (toe - hip), sd = (f.x - 150) / 300 * 2 * W2; quad(g, [P(fw + 0.06, sd - 0.05, gz + 0.004), P(fw + 0.06, sd + 0.05, gz + 0.004), P(fw - 0.04, sd + 0.05, gz + 0.004), P(fw - 0.04, sd - 0.05, gz + 0.004)], 2, sh); }
        g.disable(g.BLEND); g.depthMask(true);
        quad(g, [P(toe, -W2, gz + 0.02), P(toe, W2, gz + 0.02), P(hip, W2, gz + 0.27), P(hip, -W2, gz + 0.27)], 1, rec.legs.canvas);
        R3B.legs++;
      }
      // first-person pictures: screen quads in front of everything, no depth write
      g.disable(g.DEPTH_TEST); g.depthMask(false);
      for (const it of rec.list) {
        const pts = it.pts.map((q) => [q[0] / 160 - 1, 1 - q[1] / 75, 0]);
        quad(g, pts, 0, it.img, it.em);
      }
      g.depthMask(true); g.enable(g.DEPTH_TEST);
      g.bindVertexArray(null);
      R3B.drawn++;
    },
  };
  // ---- js/fp-feel.js's screen effects under R3D (R3D.cpuHooks() gives them to BODY): the CPU post hook (order 100) does
  // not run under R3D, so the same three looks run here as pass 'feel' (order 89, after the scene is resolved and before
  // LIGHT's post): the small ROLL of a gentle head-bob (a vertical shear about the centre column, whole rows), DEAFNESS
  // (a soft horizontal blur, two passes when strong, and a steady dim grey rim — nothing brightens, nothing pulses) and
  // the HUSH (the view drains toward grey and dims a little). Same formulas as fp-feel's post(), read from FEEL.state.
  const FEEL_VS = `
out vec2 vUv;
void main() { vec2 p = vec2(float((gl_VertexID << 1) & 2), float(gl_VertexID & 2)); vUv = p; gl_Position = vec4(p * 2.0 - 1.0, 0.0, 1.0); }`;
  const FEEL_FS = `
uniform sampler2D uSrc; uniform vec4 uFx;   // x roll slope, y deafness 0..1, z hush 0..1
in vec2 vUv;
layout(location = 0) out vec4 oColor;
vec3 at(vec2 uv) { return texture(uSrc, uv).rgb; }
void main() {
  vec2 sz = vec2(textureSize(uSrc, 0)), px = 1.0 / sz;
  vec2 uv = vUv;
  if (abs(uFx.x) > 0.0) { float dy = floor((uv.x * sz.x - sz.x * 0.5) * uFx.x + 0.5); uv.y = clamp(uv.y + dy * px.y, 0.5 * px.y, 1.0 - 0.5 * px.y); }
  vec3 c = at(uv);
  if (uFx.z > 0.02) {
    float keep = 1.0 - uFx.z * 0.85, dim = 1.0 - uFx.z * 0.08;
    float l = dot(c, vec3(77.0, 150.0, 29.0) / 256.0);
    c = (vec3(l) + (c - vec3(l)) * keep) * dim;
  }
  if (uFx.y > 0.02) {
    float a = uFx.y;
    vec3 l1 = at(uv - vec2(px.x, 0.0)), r1 = at(uv + vec2(px.x, 0.0));
    vec3 bl = 0.25 * l1 + 0.25 * r1 + 0.5 * c;
    if (a > 0.66) { vec3 l2 = at(uv - vec2(2.0 * px.x, 0.0)), r2 = at(uv + vec2(2.0 * px.x, 0.0)); bl = (l2 + 4.0 * l1 + 6.0 * c + 4.0 * r1 + r2) / 16.0; }
    c = a > 0.4 ? bl : mix(c, bl, 0.5);
    vec2 d = (vUv - 0.5) * 2.0; float e = d.x * d.x * 0.5 + d.y * d.y * 0.5;
    if (e >= 0.45) { float k = min(1.0, (e - 0.45) / 0.55) * a * 0.4; c = mix(c, vec3(36.0, 38.0, 40.0) / 255.0, k); }
  }
  oColor = vec4(c, 1.0);
}`;
  const FX3 = { prog: null, failed: false, tex: null, fb: null, w: 0, h: 0, fmt: 0, drawn: 0 };
  function feelState() { try { return typeof FEEL === 'object' && FEEL && FEEL.state ? FEEL.state : null; } catch (e) { return null; } }
  const feelPass = {
    name: 'feel', order: 89,
    init(g, R) {
      FX3.tex = null; FX3.fb = null; FX3.w = FX3.h = 0; FX3.failed = false;
      try { FX3.prog = R.program(FEEL_VS, FEEL_FS, { chunks: ['common'] }); if (!FX3.prog || !FX3.prog.p) throw new Error('no program'); } catch (e) { FX3.failed = true; warnOnce('feel program', e); }
    },
    dispose(g) { if (FX3.tex) g.deleteTexture(FX3.tex); if (FX3.fb) g.deleteFramebuffer(FX3.fb); FX3.tex = FX3.fb = null; },
    enabled() { const f = feelState(); return !FX3.failed && !!f && (Math.abs(f.rollDeg) > 0.02 || f.deaf > 0.02 || f.hush > 0.02); },
    draw(g, F, R) {
      const f = feelState(); if (FX3.failed || !FX3.prog || !f) return;
      if (!(Math.abs(f.rollDeg) > 0.02 || f.deaf > 0.02 || f.hush > 0.02)) return;
      const s = R.resolveScene ? R.resolveScene(g, F) : F.targets.scene; if (!s) return;
      const fmt = s.hdr ? g.RGBA16F : g.RGBA8;
      if (!FX3.tex || FX3.w !== s.w || FX3.h !== s.h || FX3.fmt !== fmt) {
        if (FX3.tex) g.deleteTexture(FX3.tex); if (FX3.fb) g.deleteFramebuffer(FX3.fb);
        FX3.tex = g.createTexture(); g.bindTexture(g.TEXTURE_2D, FX3.tex);
        g.texStorage2D(g.TEXTURE_2D, 1, fmt, s.w, s.h);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MIN_FILTER, g.NEAREST); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_MAG_FILTER, g.NEAREST);
        g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_S, g.CLAMP_TO_EDGE); g.texParameteri(g.TEXTURE_2D, g.TEXTURE_WRAP_T, g.CLAMP_TO_EDGE);
        FX3.fb = g.createFramebuffer(); g.bindFramebuffer(g.FRAMEBUFFER, FX3.fb); g.framebufferTexture2D(g.FRAMEBUFFER, g.COLOR_ATTACHMENT0, g.TEXTURE_2D, FX3.tex, 0);
        FX3.w = s.w; FX3.h = s.h; FX3.fmt = fmt;
      }
      // copy the scene's colour aside, then draw the effect back into the (resolved) scene colour only
      g.bindFramebuffer(g.READ_FRAMEBUFFER, s.fb); g.readBuffer(g.COLOR_ATTACHMENT0);
      g.bindFramebuffer(g.DRAW_FRAMEBUFFER, FX3.fb); g.drawBuffers([g.COLOR_ATTACHMENT0]);
      g.blitFramebuffer(0, 0, s.w, s.h, 0, 0, s.w, s.h, g.COLOR_BUFFER_BIT, g.NEAREST);
      g.bindFramebuffer(g.READ_FRAMEBUFFER, null);
      g.bindFramebuffer(g.FRAMEBUFFER, s.fb); g.viewport(0, 0, s.w, s.h); g.drawBuffers([g.COLOR_ATTACHMENT0, g.NONE]);
      g.disable(g.DEPTH_TEST); g.depthMask(false); g.disable(g.BLEND); g.disable(g.CULL_FACE);
      R.use(FX3.prog);
      g.activeTexture(g.TEXTURE6); g.bindTexture(g.TEXTURE_2D, FX3.tex); g.uniform1i(FX3.prog.u.uSrc, 6);
      // CPU: rows shifted per logical column at the CPU frame's width; here per render pixel, so the same tilt
      g.uniform4f(FX3.prog.u.uFx, Math.abs(f.rollDeg) > 0.02 ? Math.tan(f.rollDeg * Math.PI / 180) : 0, f.deaf > 0.02 ? f.deaf : 0, f.hush > 0.02 ? f.hush : 0, 0);
      g.drawArrays(g.TRIANGLES, 0, 3);
      g.drawBuffers([g.COLOR_ATTACHMENT0, g.COLOR_ATTACHMENT1]); g.depthMask(true); g.enable(g.DEPTH_TEST);
      FX3.drawn++;
    },
  };
  function wireR3D() {
    if (typeof R3D !== 'object' || !R3D || typeof R3D.addPass !== 'function') return false;
    try { R3D.addPass(bodyPass); R3D.addPass(feelPass); return true; } catch (e) { warnOnce('r3d addPass', e); return false; }
  }
  wireR3D();

  // ================================================================ 12. OPTIONS (Graphics & access)
  const ROWS = [
    ['b21-on', 'on', 'Player body', 'your gear on your arms and hands, the shield on your arm, legs and boots'],
    ['b21-feet', 'feet', 'Feet when looking down', 'legs, boots and the hem of your armour'],
    ['b21-light', 'light', 'Light on the body', 'arms and boots take the light where you stand'],
  ];
  function syncBtn(b, k) { b.textContent = set[k] ? 'On' : 'Off'; b.setAttribute('aria-pressed', set[k] ? 'true' : 'false'); b.classList.toggle('sel', !!set[k]); }
  function setSwitch(k, v) { if (!(k in set)) return false; set[k] = !!v; save(); const row = ROWS.find((r) => r[1] === k), b = row && document.getElementById(row[0]); if (b) syncBtn(b, k); return set[k]; }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('b21-on')) return;
    for (const [id, k, label, hint] of ROWS) {
      const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.textContent = label + ' ';
      const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = hint; lab.appendChild(sm);
      const b = document.createElement('button'); b.type = 'button'; b.className = 'dfbtn small'; b.id = id; b.setAttribute('aria-label', label);
      b.onclick = () => setSwitch(k, !set[k]);
      syncBtn(b, k);
      grid.appendChild(lab); grid.appendChild(b);
    }
  }
  if (typeof renderAccessibilityMenu === 'function') {
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRows(); } catch (e) { warnOnce('rows', e); } return r; };
  }

  function clearCaches() { headCache.clear(); buildCache.clear(); shieldCache.clear(); armCache.clear(); legCache.clear(); }
  return { set, setSwitch, on, stats, META, K, LT, WS, segment, build, shieldArt, offArmArt, legArt, legsPose, headArt, headPose, shieldPose, armSpec, clearCaches, hemY,
    R3B, FX3, r3dOn, look: () => (GL() && G.player ? GL().of(G.player) : null), visibleWeapons, pix, part, poly, ell, cap, render, rampOf, onRamp, PATTERN };
})();
if (typeof window !== 'undefined') window.BODY21 = BODY21;
