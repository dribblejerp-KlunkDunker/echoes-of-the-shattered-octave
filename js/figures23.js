// ============================================================
//  figures23 — Phase 23 "Living figures": NPCs, enemies, companions and co-op players with moving limbs, heads and
//  mouths, in two looks the player picks in Options ("Characters"):
//
//  * 3D FIGURES (on the true 3D renderer, js/r3d21.js). Each character is a jointed low-poly body: pelvis, chest, neck,
//    head with a hinged jaw and eyelids, upper arms, forearms, hands, thighs, shins and feet, plus a skirt, coat or
//    robe where the drawing has one. The body is FITTED TO THE CHARACTER'S OWN DRAWING: every limb is a tube whose
//    thickness is measured from the front picture's silhouette, and the picture itself is projected onto the body
//    (the front picture on the front half, the back view on the back half), so from the front at rest a figure looks
//    like its painting, and from every other angle it has real volume. Anything the body does not cover (a polearm,
//    an axe head, a lantern) becomes a cut-out card held by the nearest bone, so a weapon moves with the hand.
//    Each part is textured from its own copy of the picture with the parts in front of it painted out (a torso that
//    was hidden behind an arm gets the torso's colours, not the arm's), so a limb that swings never leaves a ghost of
//    itself behind.
//  * 2.5D PUPPETS (both renderers). The same rig and the same animator, but each part of the character's own view
//    picture (front, oblique, side, back) is cut out and moved in the picture plane, foreshortened as the 3D bone
//    turns. Frames are made on demand at a stepped 12 frames a second (pixel-art animation) and cached, so a walk
//    cycle is a handful of sprites that both renderers reuse. On the classic raycaster the 3D figures fall back to this.
//  * ORIGINAL: the pictures exactly as before.
//
//  WHAT MOVES (one animator for both looks): breathing and weight shift at rest; a walk with swinging arms and legs,
//  bent knees and elbows and a bobbing pelvis, tied to how fast the entity really moves; heads turn to look at the
//  player when near, and townsfolk turn their whole body to face someone who stops to talk; mouths open and close
//  while a character speaks to you (dialogue); eyes blink; wind-up and strike with the weapon arm and a twist of the
//  torso, timed by the same signals js/anim.js uses for its attack frames; a recoil from every hit; a drunk wobble
//  when stunned. Deaths and corpses keep their existing animations (the figure hands back to the picture).
//
//  RIG SPECS: a character is converted when it has a spec: joint positions read off its front picture (pixel x, row,
//  and optionally a depth toward the viewer), the eye and mouth rows, the skirt rows and a few flags (helmeted: no
//  face, which arm holds the weapon, what glows). Phase 23 starts with a pilot (Kaelen, the townsman, the Carillon
//  Legionnaire); the rest of the cast follows once the pilot is approved. Everything else is drawn as before.
//
//  CONTRACT AND SAFETY. Visual only: reads entities and game state, writes only fields that start with _f23 and
//  e._screen through js/sprites21.js (exactly what the picture would have written), consumes no game random numbers
//  (its own generator), saves nothing but the Options choice (localStorage 'octave.figures23.v1'). Picking, AI,
//  collision, noise and line of sight never see the figures: an entity drawn as a figure still has its picture's
//  screen rectangle. The Original preset and GFX.p23_figures = false give the pictures exactly as before. Any error
//  in a frame puts that character back on its picture for good (logged once).
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.p23_figures === undefined) GFX.p23_figures = true;
  if (GFX.FX && !GFX.FX.includes('p23_figures')) GFX.FX.push('p23_figures');
}

const FIGURES23 = (() => {
  const STORE = 'octave.figures23.v1';
  const MODES = ['figures', 'puppets', 'off'];
  const st = { mode: 'figures', built: 0, failed: {}, warned: {}, drawn: 0, puppets: 0, puppetFrames: 0, ms: 0, calls: 0 };
  try { const s = JSON.parse(localStorage.getItem(STORE) || 'null'); if (s && MODES.includes(s.mode)) st.mode = s.mode; } catch (e) { /* default */ }
  function save() { try { localStorage.setItem(STORE, JSON.stringify({ mode: st.mode })); } catch (e) { /* private mode */ } }
  function warnOnce(k, e) { if (st.warned[k]) return; st.warned[k] = true; try { console.warn('figures23: ' + k, e); } catch (x) { /* fine */ } }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());

  // own random generator (never Math.random: the game's sequence stays as it was)
  let seed = 977;
  const rnd = () => { seed = (seed * 16807) % 2147483647; return seed / 2147483647; };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };

  // ================================================================ rig specs (front-picture pixel coordinates)
  // Points are [x, row] or [x, row, depth] (depth: pixels toward the viewer). Pairs are [image-left, image-right].
  // head [x0, row0, x1, row1]; eyes (null: no visible face); mouth row (null: no jaw); neck = base of the neck;
  // pelvis = waist; sh/el/wr/hd = shoulder, elbow, wrist, end of hand; hip/kn/an = hip, knee, ankle;
  // skirt [top row, hem row] or null; weapon: the arm that strikes (0 image-left, 1 image-right);
  // glow(r, g, b): texels that give their own light; heavy: a slower, heavier gait; talker: turns to face you.
  const SPECS = {
    townsman: {
      head: [21, 0, 41, 25], eyes: [[26, 13], [35, 13]], mouth: 21, neck: [31, 28], pelvis: [31, 70],
      sh: [[13, 34], [49, 34]], el: [[8, 59], [54, 59]], wr: [[8, 81], [54, 81]], hd: [[9, 93], [54, 93]],
      hip: [[24, 82], [39, 82]], kn: [[22, 124], [40, 124]], an: [[18, 151], [44, 151]],
      skirt: [62, 113], weapon: 1, talker: true,
    },
    kaelen: {
      head: [20, 0, 39, 27], eyes: [[26, 13], [34, 13]], mouth: 21, neck: [30, 29], pelvis: [30, 68],
      sh: [[14, 34], [46, 34]], el: [[9, 56], [51, 56]], wr: [[7, 79], [54, 81]], hd: [[6, 92], [54, 95]],
      hip: [[23, 80], [37, 80]], kn: [[22, 122], [39, 122]], an: [[17, 151], [42, 151]],
      skirt: [60, 131], weapon: 1, talker: true,
      glow: (r, g, b) => b > 150 && g > 140 && r < 150 && b - r > 50,
    },
    legionnaire: {
      head: [26, 15, 49, 44], eyes: null, mouth: null, neck: [37, 48], pelvis: [37, 90],
      sh: [[18, 53], [54, 53]], el: [[13, 64, 2], [58, 72]], wr: [[13, 71, 7], [59, 90]], hd: [[13, 79, 7], [60, 101]],
      hip: [[30, 97], [46, 97]], kn: [[29, 123], [47, 123]], an: [[26, 151], [48, 151]],
      skirt: [80, 100], weapon: 0, heavy: true,
    },
  };

  // ================================================================ bones
  // 0 root (pelvis), 1 chest, 2 neck, 3 head, 4 jaw, 5 lid0, 6 lid1, 7-9 arm0 (upper, fore, hand), 10-12 arm1,
  // 13-15 leg0 (thigh, shin, foot), 16-18 leg1
  const NB = 19;
  const PARENT = [-1, 0, 1, 2, 3, 3, 3, 1, 7, 8, 1, 10, 11, 0, 13, 14, 0, 16, 17];
  const B_ARM = [[7, 8, 9], [10, 11, 12]], B_LEG = [[13, 14, 15], [16, 17, 18]];

  // ================================================================ building a model from a picture and a spec
  const models = new Map();       // sprite name -> model | null (failed)
  function pixAt(sp, x, y) { x |= 0; y |= 0; if (x < 0 || y < 0 || x >= sp.w || y >= sp.h) return 0; return sp.data[y * sp.w + x]; }
  function opaque(sp, x, y) { return (pixAt(sp, x, y) >>> 24) > 100; }

  // the back picture, turned round and stretched onto the front picture's box, so one (x, row) reads both
  function alignedBack(name, sp) {
    let bk = null;
    try { if (typeof DIRECTIONS !== 'undefined' && DIRECTIONS.view) { const v = DIRECTIONS.view(name, 4, ''); bk = v && v.sprite ? v.sprite : v; } } catch (e) { bk = null; }
    const out = new Uint32Array(sp.w * sp.h);
    const bb = (s) => { let x0 = 1e9, x1 = -1; for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if ((s.data[y * s.w + x] >>> 24) > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; } return [x0, x1]; };
    if (!bk || !bk.data || bk.h !== sp.h) {
      // no back view: the front, mirrored back again (so a no-op), darkened toward the garment
      for (let i = 0; i < out.length; i++) { const p = sp.data[i]; const a = p >>> 24; out[i] = ((a << 24) | ((((p >> 16) & 255) * 0.62) << 16) | ((((p >> 8) & 255) * 0.62) << 8) | ((p & 255) * 0.62)) >>> 0; }
      return out;
    }
    const [f0, f1] = bb(sp), [b0, b1] = bb(bk);
    const fw = Math.max(1, f1 - f0), bw = Math.max(1, b1 - b0);
    for (let y = 0; y < sp.h; y++) for (let x = 0; x < sp.w; x++) {
      // mirror: the front's left edge is the back view's right edge
      const bx = Math.round(b1 - (x - f0) * bw / fw);
      out[y * sp.w + x] = bx >= 0 && bx < bk.w ? bk.data[y * bk.w + bx] : 0;
    }
    return out;
  }

  function build(name) {
    const spec = SPECS[name]; const sp = typeof Engine !== 'undefined' && Engine.sprites ? Engine.sprites[name] : null;
    if (!spec || !sp || !sp.data) return null;
    const W = sp.w, H = sp.h, AX = (sp.cx == null ? 0.5 : sp.cx) * W;
    const toM = (p, depth) => [p[0] + 0.5 - AX, depth != null ? depth : (p[2] || 0), H - p[1] - 0.5];   // image -> model px
    const label = new Int16Array(W * H).fill(-1);
    const parts = [];          // { id, bone, kind, minX.., poly fill }
    const V = [];              // vertex floats: pos3 nrm3 uv2 bi2 bw1 k2 = 13
    const I = [];
    const FL = 13;
    const pivots = new Array(NB);
    const mouthZ = spec.mouth != null ? H - spec.mouth - 0.5 : null;

    let cur = null;      // the part being built: its vertices read its band of the atlas
    function newPart(kind, bone, prio) { const p = { id: parts.length, kind, bone, prio }; parts.push(p); cur = p; return p; }
    function vert(P, N, bi0, bi1, w1, ny, flag, uvo) {
      const u = P[0] + AX, v = H - P[2] + (cur ? cur.id * H : 0);
      V.push(P[0], P[1], P[2], N[0], N[1], N[2], u + (uvo ? uvo[0] : 0), v + (uvo ? uvo[1] : 0), bi0, bi1, w1, ny, flag);
      return V.length / FL - 1;
    }
    // image-space convex polygon fill into the label buffer (claims only unclaimed pixels; transparent ones too, so a
    // part's own copy of the picture is dilated over its whole silhouette)
    function fillPoly(pts, id) {
      let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
      for (const [x, y] of pts) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
      const n = pts.length;
      for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(H - 1, Math.ceil(y1)); y++) for (let x = Math.max(0, Math.floor(x0)); x <= Math.min(W - 1, Math.ceil(x1)); x++) {
        const px = x + 0.5, py = y + 0.5; let pos = 0, neg = 0;
        for (let i = 0; i < n; i++) { const a = pts[i], b = pts[(i + 1) % n]; const c = (b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]); if (c > 0) pos++; else if (c < 0) neg++; }
        if (pos && neg) continue;
        const k = y * W + x; if (label[k] < 0) label[k] = id;
      }
    }
    // measure the half width of the picture across a point (image coords), along an image direction, stopping at the
    // edge of the silhouette or at a pixel already claimed by a part in front
    function measure(cx, cy, dx, dy, maxR) {
      const run = (s) => { let r = 0, gap = 0; for (let t = 0.5; t <= maxR; t += 0.5) { const x = cx + dx * t * s, y = cy + dy * t * s, k = ((y | 0) * W + (x | 0)); const ok = opaque(sp, x, y) && !(x >= 0 && y >= 0 && x < W && y < H && label[k] >= 0); if (ok) { r = t; gap = 0; } else if (++gap > 2) break; } return r; };
      return [run(1), run(-1)];
    }

    // ---- a tube along a bone: rings fitted to the picture
    function tube(A, B, opt) {
      const part = newPart('tube', opt.bone, opt.prio || 1);
      const D = [B[0] - A[0], B[1] - A[1], B[2] - A[2]], len = Math.hypot(D[0], D[1], D[2]) || 1;
      D[0] /= len; D[1] /= len; D[2] /= len;
      // lateral: model X projected off the bone; depth: D x L
      let L = [1 - D[0] * D[0], -D[0] * D[1], -D[0] * D[2]]; let ll = Math.hypot(L[0], L[1], L[2]);
      if (ll < 0.2) { L = [-D[2] * D[0], -D[2] * D[1], 1 - D[2] * D[2]]; ll = Math.hypot(L[0], L[1], L[2]); }
      L = [L[0] / ll, L[1] / ll, L[2] / ll];
      const F = [D[1] * L[2] - D[2] * L[1], D[2] * L[0] - D[0] * L[2], D[0] * L[1] - D[1] * L[0]];
      if (F[1] < 0) { F[0] = -F[0]; F[1] = -F[1]; F[2] = -F[2]; }
      const n = Math.max(3, Math.ceil(len / (opt.step || 3)) + 1), segs = opt.segs || 10;
      const rx = [], cs = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1); const C = [A[0] + (B[0] - A[0]) * t, A[1] + (B[1] - A[1]) * t, A[2] + (B[2] - A[2]) * t];
        let r = opt.r != null ? (typeof opt.r === 'function' ? opt.r(t) : opt.r) : null, sh = 0;
        if (r == null) {
          const ix = C[0] + AX, iy = H - C[2], ldx = L[0], ldy = -L[2], lm = Math.hypot(ldx, ldy) || 1;
          const [a, b] = measure(ix, iy, ldx / lm, ldy / lm, opt.maxR || 8);
          r = (a + b) / 2; sh = clamp((a - b) / 2, -(opt.shift || 1.5), opt.shift || 1.5);
          if (r < (opt.minR || 2)) { r = opt.minR || 2; sh = 0; }
        }
        rx.push(r); cs.push([C[0] + L[0] * sh, C[1] + L[1] * sh, C[2] + L[2] * sh]);
      }
      // smooth the radii (pixel noise in the outline is not a bump in the arm)
      for (let pass = 0; pass < 2; pass++) for (let i = 1; i < n - 1; i++) rx[i] = (rx[i - 1] + 2 * rx[i] + rx[i + 1]) / 4;
      const dk = opt.depth || 1.0, ry = opt.ry;
      const rings = [];
      for (let i = 0; i < n; i++) {
        const t = i / (n - 1), C = cs[i], r = rx[i], q = ry != null ? (typeof ry === 'function' ? ry(t, r) : ry) : r * dk;
        const [b0, b1, w1] = opt.skin ? opt.skin(t) : [opt.bone, opt.bone, 0];
        const ring = [];
        for (let s = 0; s < segs; s++) {
          const a = (s / segs) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          const P = [C[0] + L[0] * r * ca + F[0] * q * sa, C[1] + L[1] * r * ca + F[1] * q * sa, C[2] + L[2] * r * ca + F[2] * q * sa];
          let N = [L[0] * ca / r + F[0] * sa / q, L[1] * ca / r + F[1] * sa / q, L[2] * ca / r + F[2] * sa / q]; const nl = Math.hypot(N[0], N[1], N[2]) || 1; N = [N[0] / nl, N[1] / nl, N[2] / nl];
          let bb0 = b0, bb1 = b1, ww = w1;
          if (opt.skinV) { const s2 = opt.skinV(t, P, N); bb0 = s2[0]; bb1 = s2[1]; ww = s2[2]; }
          ring.push(vert(P, N, bb0, bb1, ww, N[1], 0));
        }
        rings.push(ring);
      }
      for (let i = 0; i < n - 1; i++) for (let s = 0; s < segs; s++) { const a = rings[i][s], b = rings[i][(s + 1) % segs], c = rings[i + 1][s], d = rings[i + 1][(s + 1) % segs]; I.push(a, c, b, b, c, d); }
      // caps
      for (const [ri, sgn] of [[0, -1], [n - 1, 1]]) {
        const C = cs[ri], [b0, b1, w1] = opt.skin ? opt.skin(ri ? 1 : 0) : [opt.bone, opt.bone, 0];
        const c = vert(C, [D[0] * sgn, D[1] * sgn, D[2] * sgn], b0, b1, w1, 0, 0);
        for (let s = 0; s < segs; s++) { const a = rings[ri][s], b = rings[ri][(s + 1) % segs]; if (sgn < 0) I.push(c, a, b); else I.push(c, b, a); }
      }
      // silhouette into the label buffer
      for (let i = 0; i < n - 1; i++) {
        const pj = (C, r, s) => [C[0] + L[0] * r * s + AX, H - (C[2] + L[2] * r * s)];
        fillPoly([pj(cs[i], rx[i], 1), pj(cs[i + 1], rx[i + 1], 1), pj(cs[i + 1], rx[i + 1], -1), pj(cs[i], rx[i], -1)], part.id);
      }
      part.r = rx; part.c = cs;
      return part;
    }

    // ---- joints in model space
    const J = {};
    for (const k of ['neck', 'pelvis']) J[k] = toM(spec[k]);
    for (const k of ['sh', 'el', 'wr', 'hd', 'hip', 'kn', 'an']) J[k] = [toM(spec[k][0]), toM(spec[k][1])];
    const hb = spec.head, hcx = (hb[0] + hb[2]) / 2, hcy = (hb[1] + hb[3]) / 2, hrx = (hb[2] - hb[0]) / 2, hrz = (hb[3] - hb[1]) / 2;
    const HC = toM([hcx, hcy], 1);
    const chin = toM([hcx, hb[3] - 1], 0);
    // pivots (model space)
    pivots[0] = J.pelvis.slice(); pivots[1] = J.pelvis.slice(); pivots[2] = J.neck.slice(); pivots[3] = chin.slice();
    pivots[4] = [HC[0], HC[1] - hrx * 0.35, mouthZ != null ? mouthZ + 1 : HC[2]];
    for (let s = 0; s < 2; s++) {
      pivots[B_ARM[s][0]] = J.sh[s]; pivots[B_ARM[s][1]] = J.el[s]; pivots[B_ARM[s][2]] = J.wr[s];
      pivots[B_LEG[s][0]] = J.hip[s]; pivots[B_LEG[s][1]] = J.kn[s]; pivots[B_LEG[s][2]] = J.an[s];
    }
    const eyes = spec.eyes ? spec.eyes.map((e) => toM(e)) : null;
    pivots[5] = eyes ? [eyes[0][0], 0, eyes[0][2] + 1.6] : HC.slice(); pivots[6] = eyes ? [eyes[1][0], 0, eyes[1][2] + 1.6] : HC.slice();

    // ---- arms first (they are in front of the torso and the skirt)
    const armPrio = 6;
    for (let s = 0; s < 2; s++) {
      const [bu, bf, bh] = B_ARM[s];
      tube(J.sh[s], J.el[s], { bone: bu, maxR: 8, minR: 3, prio: armPrio, skin: (t) => [bu, bf, smooth(0.8, 1, t) * 0.5] });
      tube(J.el[s], J.wr[s], { bone: bf, maxR: 7, minR: 2.5, prio: armPrio, skin: (t) => [bf, t < 0.5 ? bu : bh, t < 0.5 ? (1 - smooth(0, 0.25, t)) * 0.5 : smooth(0.8, 1, t) * 0.5] });
      tube(J.wr[s], J.hd[s], { bone: bh, maxR: 6, minR: 2, prio: armPrio, step: 2 });
    }
    // ---- the head: an ellipsoid with a hinged jaw (the mouth-line ring is doubled so the jaw opens a real gap), eyelids
    {
      const part = newPart('head', 3, 5);
      const ry = hrx * 1.02, LON = 14;
      // latitudes: z values top to bottom, the mouth line included exactly
      const zs = []; const NL = 12;
      for (let i = 0; i <= NL; i++) zs.push(HC[2] + hrz * Math.cos(Math.PI * i / NL));
      let mouthI = -1;
      if (mouthZ != null && mouthZ < HC[2] && mouthZ > HC[2] - hrz * 0.95) {
        let best = 1, bi = -1; for (let i = 1; i < NL; i++) { const d = Math.abs(zs[i] - mouthZ); if (d < best * hrz) { best = d / hrz; bi = i; } }
        if (bi > 0) { zs[bi] = mouthZ; mouthI = bi; }
      }
      const ringAt = (z, jawSide) => {
        const cz = clamp((z - HC[2]) / hrz, -1, 1), rr = Math.sqrt(Math.max(0, 1 - cz * cz));
        const ring = [];
        for (let s = 0; s < LON; s++) {
          const a = (s / LON) * Math.PI * 2, ca = Math.cos(a), sa = Math.sin(a);
          const P = [HC[0] + hrx * rr * ca, HC[1] + ry * rr * sa, z];
          let N = [ca * rr / hrx, sa * rr / ry, cz / hrz]; const nl = Math.hypot(N[0], N[1], N[2]) || 1; N = [N[0] / nl, N[1] / nl, N[2] / nl];
          // the jaw takes the front of everything below the mouth line
          const jw = jawSide ? clamp((sa + 0.15) / 0.55, 0, 1) : 0;
          ring.push(vert(P, N, 3, 4, jw, N[1], 0));
        }
        return ring;
      };
      const rings = [];
      for (let i = 0; i <= NL; i++) {
        if (i === mouthI) rings.push({ up: ringAt(zs[i], false), dn: ringAt(zs[i], true) });
        else { const r = ringAt(zs[i], mouthI > 0 && i > mouthI); rings.push({ up: r, dn: r }); }
      }
      for (let i = 0; i < NL; i++) {
        const A = rings[i].dn, Bq = rings[i + 1].up;
        for (let s = 0; s < LON; s++) { const a = A[s], b = A[(s + 1) % LON], c = Bq[s], d = Bq[(s + 1) % LON]; I.push(a, c, b, b, c, d); }
      }
      // silhouette: an ellipse
      const pts = []; for (let k = 0; k < 20; k++) { const a = k / 20 * Math.PI * 2; pts.push([hcx + 0.5 + Math.cos(a) * (hrx + 0.6), hcy + 0.5 + Math.sin(a) * (hrz + 0.6)]); }
      fillPoly(pts, part.id);
      part.mouthI = mouthI;
      // the mouth: a dark cavity inside the head, seen through the gap when the jaw drops
      if (mouthI > 0) {
        const cav = newPart('cavity', 3, 0);
        const cr = [hrx * 0.62, ry * 0.7, hrz * 0.3], cc = [HC[0], HC[1] + ry * 0.12, mouthZ];
        const R0 = [];
        for (let i = 0; i <= 6; i++) { const ph = Math.PI * i / 6, row = []; for (let s = 0; s < 10; s++) { const a = s / 10 * Math.PI * 2; const N = [Math.sin(ph) * Math.cos(a), Math.sin(ph) * Math.sin(a), Math.cos(ph)]; row.push(vert([cc[0] + cr[0] * N[0], cc[1] + cr[1] * N[1], cc[2] + cr[2] * N[2]], N, 3, 4, N[2] < 0 ? 0.7 : 0, (N[1] > 0.55 && N[2] > -0.1) ? 1 : 0, 2)); } R0.push(row); }
        for (let i = 0; i < 6; i++) for (let s = 0; s < 10; s++) { const a = R0[i][s], b = R0[i][(s + 1) % 10], c = R0[i + 1][s], d = R0[i + 1][(s + 1) % 10]; I.push(a, c, b, b, c, d); }
      }
      // eyelids: small skin patches just proud of the face, folded up into the brow when open; textured from the skin
      // a few rows above the eye
      if (eyes) {
        for (let k = 0; k < 2; k++) {
          const lid = newPart('lid', 5 + k, 0); lid.skinOf = part.id;
          const E = eyes[k], ew = Math.max(1.6, hrx * 0.24), eh = 2.2, top = E[2] + 1.6;
          const surfY = (x, z) => { const cz = (z - HC[2]) / hrz, cx = (x - HC[0]) / hrx; return HC[1] + ry * Math.sqrt(Math.max(0, 1 - cz * cz - cx * cx)) + 0.35; };
          const q = [];
          for (let j = 0; j <= 1; j++) for (let i = 0; i <= 2; i++) {
            const x = E[0] + (i - 1) * ew, z = top - j * eh * 1.25;
            q.push(vert([x, surfY(x, z), z], [0, 1, 0], 5 + k, 5 + k, 0, 1, 0, [0, -3]));
          }
          I.push(q[0], q[3], q[1], q[1], q[3], q[4], q[1], q[4], q[2], q[2], q[4], q[5]);
        }
      }
    }
    // ---- neck
    tube(J.neck, chin, { bone: 2, maxR: 6, minR: 2.5, prio: 4, step: 2, skin: (t) => [2, t < 0.5 ? 1 : 3, t < 0.5 ? (1 - smooth(0, 0.4, t)) * 0.5 : smooth(0.6, 1, t) * 0.5] });
    // ---- torso: waist to the base of the neck, the lower part bending with the pelvis
    const torsoTop = [J.neck[0], J.neck[1], J.neck[2] - 1];
    tube(J.pelvis, torsoTop, { bone: 1, maxR: 24, minR: 6, prio: 2, depth: 0.74, shift: 2, segs: 14, skin: (t) => [1, 0, (1 - smooth(0.05, 0.45, t)) * 0.85] });
    // ---- skirt / coat / robe / tassets: hips to hem, each side following its thigh more toward the hem
    if (spec.skirt) {
      const top = toM([spec.pelvis[0], spec.skirt[0]]), hem = toM([spec.pelvis[0], spec.skirt[1]]);
      const hipX = [J.hip[0][0], J.hip[1][0]];
      const cx0 = (hipX[0] + hipX[1]) / 2;
      tube(top, hem, {
        bone: 0, maxR: 30, minR: 8, prio: 3, depth: 0.78, shift: 3, segs: 16, step: 3,
        skinV: (t, P) => {
          const side = P[0] < cx0 ? 0 : 1, lat = clamp(Math.abs(P[0] - cx0) / Math.max(4, Math.abs(hipX[side] - cx0) * 1.6), 0, 1);
          return [0, B_LEG[side][0], smooth(0.05, 1, t) * (0.25 + 0.5 * lat)];
        },
      });
    }
    // ---- legs and feet
    for (let s = 0; s < 2; s++) {
      const [bt, bs, bf] = B_LEG[s];
      tube(J.hip[s], J.kn[s], { bone: bt, maxR: 9, minR: 4, prio: 1, skin: (t) => [bt, t < 0.5 ? 0 : bs, t < 0.5 ? (1 - smooth(0, 0.2, t)) * 0.45 : smooth(0.85, 1, t) * 0.5] });
      tube(J.kn[s], J.an[s], { bone: bs, maxR: 8, minR: 3.5, prio: 1, skin: (t) => [bs, t < 0.5 ? bt : bf, t < 0.5 ? (1 - smooth(0, 0.15, t)) * 0.5 : smooth(0.85, 1, t) * 0.4] });
      // foot: from the heel forward, as wide as the boot's sole and as tall as the boot below the ankle
      const A = J.an[s];
      let fw = 3; { let lo = 1e9, hi = -1e9; for (let y = H - 3; y < H; y++) for (let x = 0; x < W; x++) if (opaque(sp, x, y) && label[y * W + x] < 0 && Math.abs(x + 0.5 - AX - A[0]) < 9) { if (x < lo) lo = x; if (x > hi) hi = x; } if (hi > lo) fw = (hi - lo + 1) / 2; }
      const fz = Math.max(2.5, A[2] * 0.55);
      const fx = A[0];
      tube([fx, A[1] - 3, fz], [fx, A[1] + 9, fz * 0.8], { bone: bf, r: fw, ry: (t) => fz * (1 - 0.2 * t), prio: 1, step: 3, segs: 10 });
      // the boot's rows below the ankle are the foot's in the picture
      const pts = [[fx + AX - fw, H - A[2] - 1], [fx + AX + fw, H - A[2] - 1], [fx + AX + fw, H], [fx + AX - fw, H]];
      fillPoly(pts, parts.length - 1);
    }

    // ---- what no part covers: cut-out cards held by the nearest bone (polearms, axe heads, lanterns, coat tails)
    {
      const seen = new Uint8Array(W * H);
      for (let y0 = 0; y0 < H; y0++) for (let x0 = 0; x0 < W; x0++) {
        const k0 = y0 * W + x0; if (seen[k0] || label[k0] >= 0 || !opaque(sp, x0, y0)) continue;
        const comp = [k0]; seen[k0] = 1;
        for (let q = 0; q < comp.length; q++) {
          const k = comp[q], x = k % W, y = (k / W) | 0;
          for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx; if (!seen[nk] && label[nk] < 0 && opaque(sp, nx, ny)) { seen[nk] = 1; comp.push(nk); } }
        }
        if (comp.length < 6) continue;
        // nearest claimed pixel decides the bone and the depth
        let best = 1e9, bp = null;
        let bx0 = 1e9, bx1 = -1, by0 = 1e9, by1 = -1;
        for (const k of comp) { const x = k % W, y = (k / W) | 0; if (x < bx0) bx0 = x; if (x > bx1) bx1 = x; if (y < by0) by0 = y; if (y > by1) by1 = y; }
        // search outward from the component's pixels (sampled) for a claimed pixel
        const step = Math.max(1, Math.floor(comp.length / 60));
        for (let q = 0; q < comp.length; q += step) {
          const x = comp[q] % W, y = (comp[q] / W) | 0;
          for (let r = 1; r < 14 && r * r < best; r++) for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) {
            if (Math.max(Math.abs(dx), Math.abs(dy)) !== r) continue;
            const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
            const l = label[ny * W + nx]; if (l < 0) continue; const d2 = dx * dx + dy * dy;
            const pt = parts[l]; if (pt.kind === 'cavity' || pt.kind === 'lid' || pt.kind === 'card') continue;
            if (d2 < best) { best = d2; bp = pt; }
          }
        }
        const bone = bp ? bp.bone : 0;
        const card = newPart('card', bone, 7);
        for (const k of comp) label[k] = card.id;
        // the card lies in the picture plane at the depth of the bone's pivot
        const dep = pivots[bone] ? pivots[bone][1] : 0;
        const c = [[bx0, by0], [bx1 + 1, by0], [bx0, by1 + 1], [bx1 + 1, by1 + 1]].map(([x, y]) => vert([x - AX, dep, H - y], [0, 1, 0], bone, bone, 0, 1, 1));
        I.push(c[0], c[2], c[1], c[1], c[2], c[3]);
        // a narrow card (a polearm, a staff, a lantern) gets a second plane across the first, so it still reads edge-on
        if (bx1 - bx0 < 30) {
          const mx = (bx0 + bx1 + 1) / 2 - AX, hw = (bx1 + 1 - bx0) / 2;
          const x = [[-hw, by0], [hw, by0], [-hw, by1 + 1], [hw, by1 + 1]].map(([o, y]) => {
            const i = vert([mx, dep + o, H - y], [1, 0, 0], bone, bone, 0, 1, 1);
            V[i * FL + 6] = mx + o + AX;      // texture across the second plane = the picture across the first
            return i;
          });
          I.push(x[0], x[2], x[1], x[1], x[2], x[3]);
        }
      }
    }

    // ---- each part's own copy of the front and back pictures, the other parts painted out (grown from its own pixels)
    const back = alignedBack(name, sp);
    const np = parts.length;
    const AW = W * 2, AH = H * np;
    const atlas = new Uint32Array(AW * AH);
    const glow = spec.glow || null;
    for (const p of parts) {
      if (p.kind === 'cavity') continue;
      const src = p.kind === 'lid' ? p.skinOf : p.id;
      for (let side = 0; side < 2; side++) {
        const pic = side ? back : sp.data;
        const buf = new Uint32Array(W * H), have = new Uint8Array(W * H);
        let x0 = W, x1 = -1, y0 = H, y1 = -1;
        for (let k = 0; k < W * H; k++) {
          if (label[k] !== src) continue;
          const x = k % W, y = (k / W) | 0; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
          const px = pic[k]; if ((px >>> 24) > 100) { buf[k] = (px | 0xff000000) >>> 0; have[k] = 1; }
        }
        if (x1 < 0) continue;
        if (p.kind !== 'card') {
          // grow: 16 rings of 4-neighbour averages, over the part's box plus a margin
          const mx0 = Math.max(0, x0 - 4), mx1 = Math.min(W - 1, x1 + 4), my0 = Math.max(0, y0 - 6), my1 = Math.min(H - 1, y1 + 6);
          for (let it = 0; it < 16; it++) {
            const add = [];
            for (let y = my0; y <= my1; y++) for (let x = mx0; x <= mx1; x++) {
              const k = y * W + x; if (have[k]) continue;
              let r = 0, g = 0, b = 0, n = 0;
              for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < mx0 || ny < my0 || nx > mx1 || ny > my1) continue; const nk = ny * W + nx; if (!have[nk]) continue; const q = buf[nk]; r += q & 255; g += (q >> 8) & 255; b += (q >> 16) & 255; n++; }
              if (n) add.push(k, ((255 << 24) | (((b / n) | 0) << 16) | (((g / n) | 0) << 8) | ((r / n) | 0)) >>> 0);
            }
            if (!add.length) break;
            for (let i = 0; i < add.length; i += 2) { buf[add[i]] = add[i + 1]; have[add[i]] = 1; }
          }
        }
        // into the atlas; texels that give their own light are stored with alpha 200
        const oy = p.id * H, ox = side * W;
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          let q = buf[y * W + x]; if (!q) continue;
          if (glow && glow(q & 255, (q >> 8) & 255, (q >> 16) & 255)) q = ((q & 0xffffff) | (200 << 24)) >>> 0;
          else if (sp.emit && !side && sp.emit[y * W + x]) q = ((q & 0xffffff) | (200 << 24)) >>> 0;
          atlas[(oy + y) * AW + ox + x] = q;
        }
      }
    }
    st.built++;
    const model = {
      name, spec, sp, W, H, AX, parts, pivots, nb: NB,
      verts: new Float32Array(V), index: (V.length / FL) > 65535 ? new Uint32Array(I) : new Uint16Array(I),
      atlas, AW, AH, label, mouthZ, HC, hr: [hrx, hrz], eyes,
      height: H, gl: null,
    };
    return model;
  }

  function modelFor(name) {
    if (models.has(name)) return models.get(name);
    let m = null;
    try { m = build(name); } catch (e) { warnOnce('build ' + name, e); m = null; }
    models.set(name, m);
    return m;
  }

  // ================================================================ the animator (shared by figures and puppets)
  // state: { t, walkPh, walk (0..1), atk (-1 none, 0..1 wind-up then strike), hurt (0..1), stun, talk (0..1 jaw),
  //          blink (0..1), yaw (head), pitch (head), bodyYaw (twist), breath, heavy, weapon }
  const R = new Float32Array(NB * 3);      // per bone: rx (forward swing), ry (sideways), rz (twist)
  const SCL = new Float32Array(NB);        // per bone: z scale (lids)
  const LIFT = [0];
  function pose(model, s) {
    R.fill(0); SCL.fill(1); LIFT[0] = 0;
    const set = (b, x, y, z) => { R[b * 3] += x; R[b * 3 + 1] += y; R[b * 3 + 2] += z; };
    const ph = s.walkPh, w = s.walk, hv = s.heavy ? 0.75 : 1;
    // breathing and idle weight shift
    const br = Math.sin(s.t * 1.7 + s.seed);
    set(1, 0.015 * br * (1 - w), 0, 0);
    set(0, 0, 0.025 * Math.sin(s.t * 0.37 + s.seed) * (1 - w), 0);
    set(13, 0, -0.025 * Math.sin(s.t * 0.37 + s.seed) * (1 - w), 0); set(16, 0, -0.025 * Math.sin(s.t * 0.37 + s.seed) * (1 - w), 0);
    for (let k = 0; k < 2; k++) { const out = k ? -1 : 1; set(B_ARM[k][0], 0.03 * Math.sin(s.t * 0.9 + s.seed + k), out * 0.035 * (1 - w), 0); set(B_ARM[k][1], 0.08 + 0.04 * Math.sin(s.t * 0.7 + k), 0, 0); }
    // walking
    if (w > 0.001) {
      const sw = Math.sin(ph), cw = Math.cos(ph);
      for (let k = 0; k < 2; k++) {
        const sg = k ? -1 : 1, a = sw * sg;
        set(B_LEG[k][0], 0.5 * hv * a * w, 0, 0);
        // the knee folds as the leg swings through (behind the body, coming forward)
        const fold = Math.max(0, -Math.sin(ph * 1 + (k ? Math.PI : 0) - 0.9));
        set(B_LEG[k][1], -0.95 * hv * fold * w, 0, 0);
        set(B_LEG[k][2], (0.25 * Math.max(0, a) - 0.2 * fold) * w, 0, 0);
        // arms counter-swing, elbows bend more on the forward swing
        set(B_ARM[k][0], -0.4 * hv * a * w, 0, 0);
        set(B_ARM[k][1], (0.18 + 0.25 * Math.max(0, -a)) * w, 0, 0);
      }
      LIFT[0] = Math.abs(cw) * 1.6 * hv * w;
      set(0, 0, 0, 0.09 * sw * w);
      set(1, 0.06 * w, 0, -0.14 * sw * w);
      set(3, 0, 0, 0.05 * sw * w);
    }
    // attack: wind-up raises the weapon arm up and back, the strike brings it down and across, the torso twists
    if (s.atk >= 0) {
      const k = s.weapon, a = s.atk;
      const up = a < 0.4 ? smooth(0, 0.4, a) : 1 - smooth(0.4, 0.75, a);
      const down = a < 0.4 ? 0 : smooth(0.4, 0.62, a) * (1 - smooth(0.8, 1, a));
      const sg = k ? 1 : -1;
      set(B_ARM[k][0], 2.6 * up + 0.9 * down, -sg * 0.25 * up, sg * 0.3 * down);
      set(B_ARM[k][1], 0.9 * up + 0.2 * down, 0, 0);
      set(B_ARM[k][2], -0.4 * up + 0.5 * down, 0, 0);
      set(B_ARM[1 - k][0], 0.5 * up, 0, 0); set(B_ARM[1 - k][1], 0.5 * up, 0, 0);
      set(1, -0.12 * up + 0.22 * down, 0, sg * (0.22 * up - 0.38 * down));
      set(0, 0, 0, sg * (0.08 * up - 0.14 * down));
      set(B_LEG[k][0], 0.3 * down, 0, 0); set(B_LEG[1 - k][0], -0.2 * down, 0, 0); set(B_LEG[1 - k][1], -0.25 * down, 0, 0);
    }
    // a hit: recoil back, head snaps
    if (s.hurt > 0) { const h = s.hurt; set(1, -0.32 * h, 0, 0.08 * h * Math.sin(s.t * 40)); set(3, -0.28 * h, 0, 0); set(B_ARM[0][0], -0.3 * h, 0.2 * h, 0); set(B_ARM[1][0], -0.3 * h, -0.2 * h, 0); }
    // stunned: a slow drunk wobble
    if (s.stun) { set(0, 0, 0.1 * Math.sin(s.t * 3.1), 0); set(1, 0.12 * Math.sin(s.t * 2.3), 0, 0); set(3, 0.2 * Math.sin(s.t * 2.9), 0.15 * Math.sin(s.t * 1.7), 0); }
    // head: look, nod while talking, jaw, blink
    set(3, s.pitch - 0.04 * Math.max(0, br) * (1 - w) + (s.talk > 0 ? 0.05 * Math.sin(s.t * 3.3) : 0), 0, s.yaw);
    set(2, 0, 0, s.yaw * 0.35);
    set(4, -s.talk * 0.6, 0, 0);
    SCL[5] = SCL[6] = s.blink;
    // talking hands: the free hand opens out a little
    if (s.talk > 0) { const k = 1 - s.weapon; set(B_ARM[k][1], 0.35 + 0.2 * Math.sin(s.t * 2.1), 0, 0); }
    return { R, SCL, lift: LIFT[0] };
  }

  // bone matrices (model px space): M_b = M_parent * T(p) * Rz * Ry * Rx * S * T(-p)
  const MAT = new Float32Array(NB * 16);
  function bones(model, P) {
    const piv = model.pivots;
    for (let b = 0; b < NB; b++) {
      const p = piv[b] || [0, 0, 0];
      const rx = P.R[b * 3], ry = P.R[b * 3 + 1], rz = P.R[b * 3 + 2];
      const cx = Math.cos(rx), sx = Math.sin(rx), cy = Math.cos(ry), sy = Math.sin(ry), cz = Math.cos(rz), sz = Math.sin(rz);
      // R = Rz * Ry * Rx (column vectors). Rx: (y,z) forward swing (+rx moves a hanging limb toward +y)
      // Rx = [1 0 0; 0 cx -sx; 0 sx cx] maps (0,0,-L) to (0, sx*L, -cx*L): forward for rx > 0 (y = +L sin rx). ok.
      const r00 = cz * cy, r01 = cz * sy * sx - sz * cx, r02 = cz * sy * cx + sz * sx;
      const r10 = sz * cy, r11 = sz * sy * sx + cz * cx, r12 = sz * sy * cx - cz * sx;
      const r20 = -sy, r21 = cy * sx, r22 = cy * cx;
      const s = P.SCL[b];
      // local = T(p) R S T(-p), S scales z about the pivot (lids)
      const l = [r00, r10, r20, 0, r01, r11, r21, 0, r02 * s, r12 * s, r22 * s, 0, 0, 0, 0, 1];
      l[12] = p[0] - (l[0] * p[0] + l[4] * p[1] + l[8] * p[2]);
      l[13] = p[1] - (l[1] * p[0] + l[5] * p[1] + l[9] * p[2]);
      l[14] = p[2] - (l[2] * p[0] + l[6] * p[1] + l[10] * p[2]);
      if (b === 0) l[14] += P.lift;
      const par = PARENT[b], o = b * 16;
      if (par < 0) { for (let i = 0; i < 16; i++) MAT[o + i] = l[i]; continue; }
      const q = par * 16;
      for (let c = 0; c < 4; c++) for (let r = 0; r < 4; r++) {
        MAT[o + c * 4 + r] = MAT[q + r] * l[c * 4] + MAT[q + 4 + r] * l[c * 4 + 1] + MAT[q + 8 + r] * l[c * 4 + 2] + MAT[q + 12 + r] * l[c * 4 + 3];
      }
    }
    return MAT;
  }

  // ---------------------------------------------------------------- per-entity animation state from the game's signals
  function stateFor(e, dt, T) {
    let a = e._f23; if (!a) { a = e._f23 = { ph: 0, walk: 0, yaw: 0, pitch: 0, by: null, blinkT: 1 + rnd() * 3, blink: 1, talk: 0, atk: -1, seed: rnd() * 6.28, lastT: T, hurt: 0 }; }
    const spec = SPECS[e.sprite] || {};
    const spd = e._spd || 0;
    a.walk += ((spd > 0.25 ? clamp(spd / 1.2, 0.5, 1) : 0) - a.walk) * Math.min(1, dt * 8);
    a.ph += Math.max(spd, a.walk * 0.6) * dt * (spec.heavy ? 3.6 : 4.2);
    // attack: the same signals anim.js reads; a.atk runs 0..1 over the swing
    if (e._strike > 0 || e._atk > 0) { if (a.atk < 0) a.atk = 0; }
    if (a.atk >= 0) { a.atk += dt / (spec.heavy ? 0.62 : 0.5); if (a.atk >= 1) a.atk = (e._strike > 0.05 || e._atk > 0.05) ? 0.3 : -1; }
    // hurt
    a.hurt = e._hurt > 0 ? clamp(e._hurt / 0.3, 0, 1) : Math.max(0, a.hurt - dt * 4);
    // talking: the jaw follows a syllable rhythm while this character holds the conversation
    const talking = !!e._f23talk || (typeof DLG !== 'undefined' && DLG.ent === e && typeof G !== 'undefined' && G.state === 'dialogue');
    const jawT = talking ? clamp(0.5 + 0.5 * Math.sin(T * 13 + Math.sin(T * 5.3) * 2) * (0.6 + 0.4 * Math.sin(T * 2.7)), 0, 1) * (0.55 + 0.45 * Math.abs(Math.sin(T * 1.9))) : 0;
    a.talk += (jawT - a.talk) * Math.min(1, dt * 25);
    // blink
    a.blinkT -= dt; if (a.blinkT < 0) { a.blinkT = 2.2 + rnd() * 3.5; a.blinkS = 0.13; }
    if (a.blinkS > 0) { a.blinkS -= dt; a.blink = 1; } else a.blink = 0;
    // where the player is, in this body's frame
    const c = Engine.cam, dx = c.x - e.x, dy = c.y - e.y, d = Math.hypot(dx, dy);
    // body heading: the game's facing when it has one; else (and for townsfolk you stop to talk to) toward the player
    const toP = Math.atan2(dy, dx);
    let want = Number.isFinite(e.facing) ? e.facing : toP;
    if ((talking || (spec.talker && e.kind === 'npc' && d < 2.2 && spd < 0.2)) && !e.companion) want = toP;
    if (e._f23hold != null) want = e._f23hold;      // tests and screenshots: a fixed heading
    if (a.by == null) a.by = want;
    let dd = ((want - a.by + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    a.by += dd * Math.min(1, dt * (talking ? 4 : 2.5));
    // head: toward the player when near and in front of the body
    let rel = ((toP - a.by + Math.PI * 3) % (Math.PI * 2)) - Math.PI;
    const look = d < 5 && Math.abs(rel) < 1.9 ? clamp(rel, -1.0, 1.0) : 0.25 * Math.sin(T * 0.23 + a.seed);
    a.yaw += (look - a.yaw) * Math.min(1, dt * 3.5);
    const pitchWant = d < 5 ? clamp(Math.atan2(0.5 - 0.85 * (e.scale || 1), Math.max(0.3, d)), -0.35, 0.35) : 0;
    a.pitch += (pitchWant - a.pitch) * Math.min(1, dt * 3);
    return {
      t: T, seed: a.seed, walkPh: a.ph, walk: a.walk, atk: a.atk, hurt: a.hurt, stun: e.stun > 0, talk: a.talk,
      blink: a.blink ? 1 : 0.08, yaw: a.yaw, pitch: a.pitch, heavy: !!spec.heavy, weapon: spec.weapon == null ? 1 : spec.weapon, bodyYaw: a.by,
    };
  }

  // ================================================================ who is drawn how
  function originalish() {
    if (typeof GFX === 'undefined') return true;
    if (GFX.p23_figures === false) return true;
    if (GFX.preset === 'plain' || GFX.preset === 'original') return true;
    try { return typeof PRESETS !== 'undefined' && PRESETS.current && PRESETS.current() === 'original'; } catch (e) { return false; }
  }
  function mode() { return originalish() ? 'off' : st.mode; }
  function eligible(e) {
    if (!e || !e.sprite || !SPECS[e.sprite] || st.failed[e.sprite]) return false;
    if (e.dead || e.deathArt || e.corpse || e.hidden) return false;
    return true;
  }
  const r3dOn = () => { try { return typeof R3D !== 'undefined' && !!R3D && typeof R3D.shown === 'function' && R3D.shown() && G3.ok; } catch (e) { return false; } };

  // js/sprites21.js asks, per entity it is about to draw as a billboard, whether this module draws it instead
  function wants(e) {
    if (mode() !== 'figures' || !eligible(e) || !G3.ok) return false;   // only R3D's sprite collection asks
    const m = modelFor(e.sprite); if (!m) { st.failed[e.sprite] = true; return false; }
    return true;
  }
  // ... and hands over what it computed for the billboard: position, size, light, flags
  const queue = [];
  let qFrame = -1;
  function submit(e, o) {
    const fno = G3.frameNo;
    if (qFrame !== fno) { queue.length = 0; qFrame = fno; }
    queue.push({ e, o });
  }

  // ================================================================ GL: the figure pass (R3D order 31) and shadow casters
  const G3 = { ok: false, gl: null, prog: null, cprog: null, frameNo: 0, R: null };
  const FIG_VS = `
layout(location=0) in vec3 a_p; layout(location=1) in vec3 a_n; layout(location=2) in vec2 a_uv;
layout(location=3) in vec2 a_bi; layout(location=4) in float a_bw; layout(location=5) in vec2 a_k;
uniform mat4 u_bones[19]; uniform mat4 u_model;   // model px -> GL space
uniform float u_band;
out vec2 v_uv; out vec3 v_n; out vec3 v_w; out float v_ny; flat out float v_flag; out float v_band;
void main() {
  mat4 M = u_bones[int(a_bi.x + 0.5)] * (1.0 - a_bw) + u_bones[int(a_bi.y + 0.5)] * a_bw;
  vec4 P = u_model * (M * vec4(a_p, 1.0));
  v_n = normalize(mat3(u_model) * (mat3(M) * a_n));
  v_w = P.xyz; v_uv = a_uv; v_ny = a_k.x; v_flag = a_k.y; v_band = u_band;
  gl_Position = uViewProj * P;
}`;
  const FIG_FS = `
uniform sampler2D u_tex; uniform vec2 u_size; uniform vec4 u_k;   // light f, hurt, alpha, flags (1 flash, 8 glowing)
uniform vec4 u_l;   // point light rgb, glow floor
uniform float u_px;
in vec2 v_uv; in vec3 v_n; in vec3 v_w; in float v_ny; flat in float v_flag; in float v_band;
layout(location=0) out vec4 oColor; layout(location=1) out vec4 oAux;
const float BY[16] = float[16](0., 8., 2., 10., 12., 4., 14., 6., 3., 11., 1., 9., 15., 7., 13., 5.);
void main() {
  float al = u_k.z; int flags = int(u_k.w + 0.5);
  if (al < 0.999) { ivec2 q = ivec2(floor(gl_FragCoord.xy / u_px)) & 3; if (BY[q.y * 4 + q.x] >= al * 16.0) discard; }
  vec3 c; float emis = 0.0;
  if (v_flag > 1.5) { c = mix(vec3(0.16, 0.04, 0.04), vec3(0.78, 0.72, 0.6), smoothstep(0.55, 0.95, v_ny)); }
  else {
    vec2 px = floor(v_uv) + 0.5;
    vec2 uvF = vec2(px.x, px.y + v_band) / u_size;
    vec2 uvB = vec2(px.x + u_size.x * 0.5, px.y + v_band) / u_size;
    vec4 tf = texture(u_tex, uvF), tb = texture(u_tex, uvB);
    if (v_flag > 0.5) {
      bool fromFront = dot(v_n, uEye.xyz - v_w) > 0.0;
      vec4 t = fromFront ? (tf.a > 0.3 ? tf : tb) : (tb.a > 0.3 ? tb : tf);
      if (t.a < 0.3) discard;
      c = t.rgb; emis = (t.a > 0.3 && t.a < 0.9) ? 1.0 : 0.0;
    }
    else {
      float wf = smoothstep(-0.35, 0.35, v_ny);
      if (tb.a < 0.3) wf = 1.0; if (tf.a < 0.3) wf = 0.0;
      vec4 t = mix(tb, tf, wf);
      c = t.rgb; emis = (t.a > 0.3 && t.a < 0.9) ? 1.0 : 0.0;
    }
  }
  // form: a soft key from above and in front of the eye, so the painted shading gains real volume without doubling
  vec3 n = normalize(v_n);
  if (v_flag > 0.5 && dot(n, uEye.xyz - v_w) < 0.0) n = -n;
  vec3 key = normalize(vec3(-uFwdH.xy * 0.55 + vec2(uFwdH.y, -uFwdH.x) * 0.3, 0.8));
  float form = 0.8 + 0.3 * max(dot(n, key), 0.0) - 0.08 * max(-n.z, 0.0);
  form += 0.06 * pow(1.0 - abs(dot(n, normalize(uEye.xyz - v_w))), 3.0);
  float hk = u_k.y * 0.45;
  if (hk > 0.0) c = vec3(c.r + (1.0 - c.r) * hk, c.g * (1.0 - hk), c.b * (1.0 - hk));
  float f = emis > 0.5 ? max(u_k.x, u_l.w) : u_k.x;
  R3DSurf s; s.albedo = c; s.pos = v_w; s.nrm = n; s.side = 1.0; s.mat = 6.0; s.emissive = emis; s.fi = f; s.ladd = u_l.rgb; s.kind = 1;
  vec3 col = r3dShade(s) * (emis > 0.5 ? 1.0 : form);
  if ((flags & 1) != 0) col = vec3(1.0, 230.0 / 255.0, 200.0 / 255.0);
  oColor = vec4(col, 1.0);
  oAux = vec4(((emis > 0.5 || (flags & 8) != 0) ? 8.0 : 6.0) / 255.0, emis, 0.0, 1.0);
}`;
  const CAST_VS = `#version 300 es
precision highp float;
layout(location=0) in vec3 a_p; layout(location=3) in vec2 a_bi; layout(location=4) in float a_bw; layout(location=5) in vec2 a_k;
uniform mat4 u_bones[19]; uniform mat4 u_model; uniform mat4 u_vp; uniform float u_zk;
out float v_flag; out vec2 v_uv;
layout(location=2) in vec2 a_uv;
void main() {
  mat4 M = u_bones[int(a_bi.x + 0.5)] * (1.0 - a_bw) + u_bones[int(a_bi.y + 0.5)] * a_bw;
  vec4 P = u_model * (M * vec4(a_p, 1.0));
  v_flag = a_k.y; v_uv = a_uv;
  gl_Position = u_vp * vec4(P.xy, P.z / u_zk, 1.0);
}`;
  const CAST_FS = `#version 300 es
precision highp float;
in float v_flag; in vec2 v_uv;
uniform sampler2D u_tex; uniform vec2 u_size; uniform float u_band;
out vec4 o;
void main() {
  if (v_flag > 1.5) discard;
  if (v_flag > 0.5) { vec2 px = floor(v_uv) + 0.5; if (texture(u_tex, vec2(px.x, px.y + u_band) / u_size).a < 0.3) discard; }
  o = vec4(1.0);
}`;

  function compileRaw(vs, fs) {
    const gl = G3.gl;
    const mk = (t, s) => { const sh = gl.createShader(t); gl.shaderSource(sh, s); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; };
    const p = gl.createProgram(); gl.attachShader(p, mk(gl.VERTEX_SHADER, vs)); gl.attachShader(p, mk(gl.FRAGMENT_SHADER, fs)); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); const nm = a.name.replace(/\[0\]$/, ''); u[nm] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  }
  function uniformsOf(p) { const gl = G3.gl, u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS); for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); } return u; }

  // each part's vertices read their own band of the atlas: the band is per part, so a model is drawn part by part?
  // No: one draw per model. The band rides in the vertex: a_uv.y already holds the picture row; the part's band offset
  // is added at build time (stampBands) so the shader's u_band is 0 for figures.
  function upload(m) {
    const gl = G3.gl;
    const g = m.gl = { vao: gl.createVertexArray(), vb: gl.createBuffer(), ib: gl.createBuffer(), tex: gl.createTexture(), n: m.index.length, type: m.index instanceof Uint32Array ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, ctx: gl };
    gl.bindVertexArray(g.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, g.vb); gl.bufferData(gl.ARRAY_BUFFER, m.verts, gl.STATIC_DRAW);
    const S = 13 * 4;
    gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 3, gl.FLOAT, false, S, 0);
    gl.enableVertexAttribArray(1); gl.vertexAttribPointer(1, 3, gl.FLOAT, false, S, 12);
    gl.enableVertexAttribArray(2); gl.vertexAttribPointer(2, 2, gl.FLOAT, false, S, 24);
    gl.enableVertexAttribArray(3); gl.vertexAttribPointer(3, 2, gl.FLOAT, false, S, 32);
    gl.enableVertexAttribArray(4); gl.vertexAttribPointer(4, 1, gl.FLOAT, false, S, 40);
    gl.enableVertexAttribArray(5); gl.vertexAttribPointer(5, 2, gl.FLOAT, false, S, 44);
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, g.ib); gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, m.index, gl.STATIC_DRAW);
    gl.bindVertexArray(null);
    const at = gl.getParameter(gl.ACTIVE_TEXTURE);
    gl.activeTexture(gl.TEXTURE0 + 8);
    gl.bindTexture(gl.TEXTURE_2D, g.tex);
    const ua = gl.getParameter(gl.UNPACK_ALIGNMENT);
    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false); gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false); gl.pixelStorei(gl.UNPACK_ALIGNMENT, 4);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA8, m.AW, m.AH, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array(m.atlas.buffer));
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, ua);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.activeTexture(at);
  }

  // model px -> GL space for one entity: the picture's height in game units is scale * hs (the billboard's rule)
  const MODEL = new Float32Array(16);
  function modelMatrix(m, it, yaw, ZK) {
    const o = it.o, unit = o.unit, s = unit * (m.sp.hs || 1) / m.H * ZK;
    const fx = Math.cos(yaw), fy = Math.sin(yaw);
    // body X -> (sin, -cos), body Y -> (cos, sin), body Z -> up
    MODEL[0] = fy * s; MODEL[1] = -fx * s; MODEL[2] = 0; MODEL[3] = 0;
    MODEL[4] = fx * s; MODEL[5] = fy * s; MODEL[6] = 0; MODEL[7] = 0;
    MODEL[8] = 0; MODEL[9] = 0; MODEL[10] = s; MODEL[11] = 0;
    MODEL[12] = o.x; MODEL[13] = o.y; MODEL[14] = o.z0 * ZK; MODEL[15] = 1;
    return MODEL;
  }

  let lastT = null;
  function prepare(F) {
    // animate every queued figure once per frame; the casters and the pass reuse the matrices
    const T = F.time != null ? F.time : (typeof ANIM !== 'undefined' ? ANIM.T : 0);
    const dt = lastT == null ? 0.016 : clamp(T - lastT, 0, 0.1); lastT = T;
    for (const it of queue) {
      const e = it.e, m = modelFor(e.sprite); if (!m) continue;
      try {
        const s = stateFor(e, dt, T);
        it.m = m;
        it.bones = new Float32Array(bones(m, pose(m, s)));
        it.yaw = s.bodyYaw;
      } catch (err) { warnOnce('animate ' + e.sprite, err); st.failed[e.sprite] = true; it.m = null; }
    }
  }
  function drawFigures(gl, F) {
    if (!queue.length || qFrame !== G3.frameNo) return;
    const t0 = now();
    const P = G3.prog; if (!P || !P.p) return;
    const R3 = G3.R; R3.use(P);
    R3.bindScene(gl, F);
    gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(true); gl.disable(gl.BLEND);
    gl.enable(gl.CULL_FACE); gl.cullFace(gl.BACK); gl.frontFace(gl.CCW);
    gl.uniform1i(P.u.u_tex, 8); gl.uniform1f(P.u.u_px, Math.max(1, F.pxK || 1)); gl.uniform1f(P.u.u_band, 0);
    gl.activeTexture(gl.TEXTURE0 + 8);
    let n = 0;
    for (const it of queue) {
      const m = it.m; if (!m || !it.bones) continue;
      if (!m.gl || m.gl.ctx !== gl) upload(m);
      gl.bindTexture(gl.TEXTURE_2D, m.gl.tex);
      gl.uniform2f(P.u.u_size, m.AW, m.AH);
      gl.uniformMatrix4fv(P.u.u_bones, false, it.bones);
      gl.uniformMatrix4fv(P.u.u_model, false, modelMatrix(m, it, it.yaw, F.ZK || 0.61875));
      const o = it.o;
      gl.uniform4f(P.u.u_k, o.f, o.hurt || 0, o.alpha, o.flags || 0);
      gl.uniform4f(P.u.u_l, o.lr, o.lg, o.lb, o.glowFloor || 0.95);
      // cards are double-sided: drawn without culling in the same call would need two passes; the body is closed, so
      // cull off costs little and keeps cards visible from behind
      gl.disable(gl.CULL_FACE);
      gl.bindVertexArray(m.gl.vao);
      gl.drawElements(gl.TRIANGLES, m.gl.n, m.gl.type, 0);
      n++; st.calls++;
    }
    gl.bindVertexArray(null); gl.disable(gl.CULL_FACE); gl.activeTexture(gl.TEXTURE0);
    st.drawn = n; st.ms = now() - t0;
  }
  function drawCasters(cview) {
    const gl = G3.gl; if (!gl || !queue.length || qFrame !== G3.frameNo || !cview || !cview.vp) return;
    try {
      if (!G3.cprog) { G3.cprog = compileRaw(CAST_VS, CAST_FS); }
      const P = G3.cprog; gl.useProgram(P.p);
      gl.uniformMatrix4fv(P.u.u_vp, false, cview.vp);
      const ZK = (typeof R3D !== 'undefined' && R3D.ZK) || 0.61875;
      gl.uniform1f(P.u.u_zk, ZK); gl.uniform1i(P.u.u_tex, 8); gl.uniform1f(P.u.u_band, 0);
      gl.enable(gl.DEPTH_TEST); gl.depthMask(true); gl.disable(gl.BLEND); gl.disable(gl.CULL_FACE);
      gl.activeTexture(gl.TEXTURE0 + 8);
      for (const it of queue) {
        const m = it.m; if (!m || !it.bones) continue;
        if (!m.gl || m.gl.ctx !== gl) upload(m);
        gl.bindTexture(gl.TEXTURE_2D, m.gl.tex);
        gl.uniform2f(P.u.u_size, m.AW, m.AH);
        gl.uniformMatrix4fv(P.u.u_bones, false, it.bones);
        gl.uniformMatrix4fv(P.u.u_model, false, modelMatrix(m, it, it.yaw, ZK));
        gl.bindVertexArray(m.gl.vao);
        gl.drawElements(gl.TRIANGLES, m.gl.n, m.gl.type, 0);
      }
      gl.bindVertexArray(null); gl.activeTexture(gl.TEXTURE0);
    } catch (e) { warnOnce('casters', e); }
  }

  function attach() {
    try { wireMenu(); } catch (e) { warnOnce('menu', e); }
    try { wrapChooser(); } catch (e) { warnOnce('chooser', e); }
    if (typeof R3D === 'undefined' || !R3D || !R3D.addPass) return;
    R3D.addPass({
      name: 'figures23', order: 31,
      init(gl, api) {
        G3.gl = gl; G3.R = api || R3D; G3.cprog = null;
        for (const m of models.values()) if (m) m.gl = null;
        try { G3.prog = (api || R3D).program(FIG_VS, FIG_FS, { chunks: ['common', 'shade'] }); G3.ok = true; } catch (e) { warnOnce('program', e); G3.ok = false; }
      },
      enabled() { return G3.ok && queue.length > 0 && qFrame === G3.frameNo; },
      draw(gl, F) { try { drawFigures(gl, F); } catch (e) { warnOnce('draw', e); } },
      dispose() { G3.ok = false; },
    });
    R3D.on('frame', () => { G3.frameNo++; });
    // the queue is filled while SPRITES21 collects (right after 'frame'); animate before the first pass that needs it
    R3D.addPass({ name: 'figures23-prep', order: 1, draw(gl, F) { if (qFrame === G3.frameNo) { try { prepare(F); } catch (e) { warnOnce('prepare', e); } } } });
    R3D.on('lost', () => { G3.ok = false; G3.cprog = null; for (const m of models.values()) if (m) m.gl = null; });
    // shadows: LIGHT renders SPRITES21's casters into its sun/moon map; ours go into the same map
    if (typeof SPRITES21 !== 'undefined' && SPRITES21 && SPRITES21.drawCasters && !SPRITES21._f23cast) {
      const orig = SPRITES21.drawCasters;
      SPRITES21.drawCasters = function (cview) { const r = orig.apply(this, arguments); try { drawCasters(cview); } catch (e) { warnOnce('casters', e); } return r; };
      SPRITES21._f23cast = true;
    }
  }


  // ================================================================ 2.5D puppets
  // A puppet rig per (character, view): the view's own picture cut by bone. Which bone owns a pixel comes from the 3D
  // body seen from that view (a small z-buffer over its rest pose); pixels the body does not reach go to the nearest
  // bone (a polearm to the hand). Each bone's cut-out is grown into the pixels other bones cover, so nothing behind a
  // moving limb is a hole. A frame: every bone's cut-out drawn with the 2D affine that its 3D bone makes in that view.
  const MARGIN_T = 36, MARGIN_S = 18;
  const rigs = new Map();         // name|view -> rig | null
  const frames = new Map();       // key -> sprite (LRU)
  const FRAME_CAP = 260;
  function viewSprite(name, v) {
    if (!v) return Engine.sprites[name];
    try { if (typeof DIRECTIONS !== 'undefined' && DIRECTIONS.view) { const r = DIRECTIONS.view(name, v, ''); return r && r.sprite && !r.data ? r.sprite : r; } } catch (e) { /* stand-in below */ }
    return Engine.sprites[name];
  }
  function camAxes(v) {
    const phi = v * Math.PI / 4, c = Math.cos(phi), s = Math.sin(phi);
    return { right: [c, s, 0], toCam: [-s, c, 0] };   // body frame: right = X cos + Y sin, toward the camera = Y cos - X sin
  }
  function rigFor(name, v) {
    const key = name + '|' + v;
    if (rigs.has(key)) return rigs.get(key);
    let r = null;
    try { r = buildRig(name, v); } catch (e) { warnOnce('rig ' + key, e); r = null; }
    rigs.set(key, r);
    return r;
  }
  function buildRig(name, v) {
    const m = modelFor(name); const vs = viewSprite(name, v);
    if (!m || !vs || !vs.data) return null;
    const W = vs.w, H = vs.h, { right, toCam } = camAxes(v);
    const FL = 13, VV = m.verts, nv = VV.length / FL;
    // rest-pose projection: horizontal = along right; fitted to the view picture over the torso's rows
    const sp = m.sp, rowN = H - m.pivots[2][2], rowP = H - m.pivots[0][2];
    const bbox = (pts) => { let a = 1e9, b = -1e9; for (const x of pts) { if (x < a) a = x; if (x > b) b = x; } return [a, b]; };
    const projX = [];
    for (let i = 0; i < nv; i++) { const o = i * FL; if (VV[o + 12] > 0.5) continue; const z = VV[o + 2]; const row = m.H - z; if (row < rowN || row > rowP) continue; projX.push(VV[o] * right[0] + VV[o + 1] * right[1]); }
    const picX = []; for (let y = Math.max(0, rowN | 0); y < Math.min(H, rowP | 0); y++) for (let x = 0; x < W; x++) if ((vs.data[y * W + x] >>> 24) > 100) picX.push(x);
    const [p0, p1] = bbox(projX), [q0, q1] = bbox(picX);
    const kx = (q1 - q0 + 1) / Math.max(1, p1 - p0), ox = q0 - p0 * kx;
    const ky = H / m.H;
    const toImg = (P) => [P[0] * right[0] * kx + P[1] * right[1] * kx + ox, (m.H - P[2]) * ky];
    const depthOf = (P) => P[0] * toCam[0] + P[1] * toCam[1];
    // z-buffer of bones over the rest pose (body parts only: no cards, no cavity, no lids)
    const zb = new Float32Array(W * H).fill(-1e9), lab = new Int16Array(W * H).fill(-1);
    const idx = m.index, P = [];
    for (let i = 0; i < nv; i++) { const o = i * FL; P.push([VV[o], VV[o + 1], VV[o + 2]]); }
    const boneOf = (i) => { const o = i * FL; return VV[o + 10] > 0.5 ? VV[o + 9] : VV[o + 8]; };
    for (let t = 0; t < idx.length; t += 3) {
      const a = idx[t], b = idx[t + 1], c = idx[t + 2];
      const fa = VV[a * FL + 12]; if (fa > 0.5) continue;
      const bone = boneOf(a); if (bone === 5 || bone === 6) continue;
      const A = toImg(P[a]), B = toImg(P[b]), C = toImg(P[c]), da = depthOf(P[a]), db = depthOf(P[b]), dc = depthOf(P[c]);
      const x0 = Math.max(0, Math.floor(Math.min(A[0], B[0], C[0]))), x1 = Math.min(W - 1, Math.ceil(Math.max(A[0], B[0], C[0])));
      const y0 = Math.max(0, Math.floor(Math.min(A[1], B[1], C[1]))), y1 = Math.min(H - 1, Math.ceil(Math.max(A[1], B[1], C[1])));
      const den = (B[1] - C[1]) * (A[0] - C[0]) + (C[0] - B[0]) * (A[1] - C[1]); if (Math.abs(den) < 1e-6) continue;
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
        const px = x + 0.5, py = y + 0.5;
        const w0 = ((B[1] - C[1]) * (px - C[0]) + (C[0] - B[0]) * (py - C[1])) / den, w1 = ((C[1] - A[1]) * (px - C[0]) + (A[0] - C[0]) * (py - C[1])) / den, w2 = 1 - w0 - w1;
        if (w0 < -0.02 || w1 < -0.02 || w2 < -0.02) continue;
        const d = w0 * da + w1 * db + w2 * dc, k = y * W + x;
        if (d > zb[k]) { zb[k] = d; lab[k] = bone; }
      }
    }
    // the picture's pixels the body missed go to the nearest bone
    const own = new Int16Array(W * H).fill(-1);
    const q = [];
    for (let k = 0; k < W * H; k++) { if ((vs.data[k] >>> 24) <= 100) continue; if (lab[k] >= 0) { own[k] = lab[k]; q.push(k); } }
    for (let h = 0; h < q.length; h++) {
      const k = q[h], x = k % W, y = (k / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx; if (own[nk] >= 0 || (vs.data[nk] >>> 24) <= 100) continue; own[nk] = own[k]; q.push(nk); }
    }
    // per-bone cut-outs on canvases, grown 4 px into pixels other bones own (never into the background)
    const cuts = [], depth = new Float32Array(NB), cnt = new Float32Array(NB);
    for (let k = 0; k < W * H; k++) if (own[k] >= 0 && zb[k] > -1e8) { depth[own[k]] += zb[k]; cnt[own[k]]++; }
    for (let b = 0; b < NB; b++) {
      let any = false; const buf = new Uint32Array(W * H), have = new Uint8Array(W * H);
      for (let k = 0; k < W * H; k++) if (own[k] === b) { buf[k] = vs.data[k] | 0xff000000; have[k] = 1; any = true; }
      if (!any) { cuts.push(null); continue; }
      if (b !== 4) for (let it = 0; it < 4; it++) {
        const add = [];
        for (let k = 0; k < W * H; k++) {
          if (have[k] || own[k] < 0) continue; const x = k % W, y = (k / W) | 0; let r = 0, g = 0, bl = 0, n = 0;
          for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue; const nk = ny * W + nx; if (!have[nk]) continue; const p = buf[nk]; r += p & 255; g += (p >> 8) & 255; bl += (p >> 16) & 255; n++; }
          if (n) add.push(k, ((255 << 24) | (((bl / n) | 0) << 16) | (((g / n) | 0) << 8) | ((r / n) | 0)) >>> 0);
        }
        for (let i = 0; i < add.length; i += 2) { buf[add[i]] = add[i + 1]; have[add[i]] = 1; }
      }
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
      cv.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(buf.buffer), W, H), 0, 0);
      cuts.push(cv);
      depth[b] = cnt[b] ? depth[b] / cnt[b] : 0;
    }
    // eyelids: skin from three rows above each eye, shown only while the eyes are shut (front views)
    const lids = [];
    if (m.eyes && v <= 1) for (const E of m.eyes) {
      const [ix, iy] = toImg(E); const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d');
      const w = Math.max(2, Math.round(m.hr[0] * 0.5 * kx)), x0 = Math.round(ix - w / 2), y0 = Math.round(iy - 1);
      c.drawImage(cuts[3] || cv, x0, y0 - 3, w, 2, x0, y0, w, 2);
      lids.push(cv);
    }
    // the mouth: the top rows of the jaw's cut-out, dark, drawn under the jaw so a dropped jaw opens onto it
    let mouth = null;
    if (cuts[4] && v <= 2) {
      let top = H; for (let k = 0; k < W * H; k++) if (own[k] === 4) top = Math.min(top, (k / W) | 0);
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const c = cv.getContext('2d'); const id = c.createImageData(W, H); const d32 = new Uint32Array(id.data.buffer);
      for (let k = 0; k < W * H; k++) { const y = (k / W) | 0; if (own[k] === 4 && y < top + 3) d32[k] = 0xff0a0a24; }
      c.putImageData(id, 0, 0); mouth = cv;
    }
    return { name, v, W, H, kx, ox, ky, right, toCam, cuts, depth, lids, mouth, vs, m, toImg };
  }
  // the 2D affine of bone b in this view: where the bone's matrix sends the picture plane through its pivot
  function affine(rig, M, b) {
    const m = rig.m, p = m.pivots[b] || [0, 0, 0], o = b * 16;
    const R = rig.right, Z = [0, 0, 1];
    const tf = (P) => [M[o] * P[0] + M[o + 4] * P[1] + M[o + 8] * P[2] + M[o + 12], M[o + 1] * P[0] + M[o + 5] * P[1] + M[o + 9] * P[2] + M[o + 13], M[o + 2] * P[0] + M[o + 6] * P[1] + M[o + 10] * P[2] + M[o + 14]];
    const P0 = p, P1 = [p[0] + R[0], p[1] + R[1], p[2]], P2 = [p[0], p[1], p[2] - 1];
    const a0 = rig.toImg(P0), a1 = rig.toImg(P1), a2 = rig.toImg(P2);
    const b0 = rig.toImg(tf(P0)), b1 = rig.toImg(tf(P1)), b2 = rig.toImg(tf(P2));
    // solve [b] = A [a] + t with a's basis (a1 - a0, a2 - a0)
    const ux = a1[0] - a0[0], uy = a1[1] - a0[1], vx = a2[0] - a0[0], vy = a2[1] - a0[1];
    const det = ux * vy - uy * vx || 1e-6;
    const B1x = b1[0] - b0[0], B1y = b1[1] - b0[1], B2x = b2[0] - b0[0], B2y = b2[1] - b0[1];
    const a = (B1x * vy - B2x * uy) / det, c = (B2x * ux - B1x * vx) / det;
    const bb = (B1y * vy - B2y * uy) / det, d = (B2y * ux - B1y * vx) / det;
    const e = b0[0] - (a * a0[0] + c * a0[1]), f = b0[1] - (bb * a0[0] + d * a0[1]);
    const dz = (tf(P0)[0] - P0[0]) * rig.toCam[0] + (tf(P0)[1] - P0[1]) * rig.toCam[1];
    return [a, bb, c, d, e, f, dz];
  }
  let pcv = null, pctx = null;
  function puppetFrame(e, rig, s) {
    // quantized state: a stepped, cacheable animation (12 poses a cycle at most)
    const qWalk = s.walk > 0.4 ? 1 : 0, qPh = qWalk ? Math.floor(((s.walkPh % (Math.PI * 2)) + Math.PI * 2) % (Math.PI * 2) / (Math.PI / 4)) : 0;
    const qAtk = s.atk >= 0 ? Math.min(7, Math.floor(s.atk * 8)) : -1, qHurt = s.hurt > 0.4 ? 1 : 0;
    const qTalk = s.talk > 0.6 ? 2 : s.talk > 0.25 ? 1 : 0, qBlink = s.blink > 0.5 ? 1 : 0;
    const qYaw = Math.round(clamp(s.yaw, -1, 1) / 0.33), qPit = Math.round(s.pitch / 0.2);
    const key = rig.name + '|' + rig.v + '|' + qWalk + qPh + '|' + qAtk + '|' + qHurt + qTalk + qBlink + '|' + qYaw + '|' + qPit;
    let sp = frames.get(key);
    if (sp) { frames.delete(key); frames.set(key, sp); return sp; }
    const qs = Object.assign({}, s, { t: 0, seed: 0, walk: qWalk, walkPh: (qPh + 0.5) * Math.PI / 4, atk: qAtk < 0 ? -1 : (qAtk + 0.5) / 8, hurt: qHurt, talk: qTalk * 0.5, blink: qBlink ? 1 : 0.08, yaw: qYaw * 0.33, pitch: qPit * 0.2, stun: false });
    const M = bones(rig.m, pose(rig.m, qs));
    const W = rig.W + MARGIN_S * 2, H = rig.H + MARGIN_T;
    if (!pcv) { pcv = document.createElement('canvas'); pctx = pcv.getContext('2d', { willReadFrequently: true }); }
    if (pcv.width !== W || pcv.height !== H) { pcv.width = W; pcv.height = H; }
    const c = pctx; c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, W, H); c.imageSmoothingEnabled = false;
    const order = [];
    for (let b = 0; b < NB; b++) if (rig.cuts[b]) { const A = affine(rig, M, b); order.push([rig.depth[b] + A[6] * 0.35 + (b === 3 ? 0.6 : b === 4 ? 0.7 : 0), b, A]); }
    order.sort((x, y) => x[0] - y[0]);
    for (const [, b, A] of order) {
      c.setTransform(A[0], A[1], A[2], A[3], A[4] + MARGIN_S, A[5] + MARGIN_T);
      c.drawImage(rig.cuts[b], 0, 0);
      if (b === 3 && qBlink && rig.lids.length) for (const L of rig.lids) c.drawImage(L, 0, 0);
      if (b === 3 && qTalk && rig.mouth) c.drawImage(rig.mouth, 0, 0);
    }
    c.setTransform(1, 0, 0, 1, 0, 0);
    const img = c.getImageData(0, 0, W, H);
    const data = new Uint32Array(img.data.buffer.slice(0));
    // canvas drawing smooths alpha at the cut edges: make every texel fully opaque or clear, as sprites are
    for (let i = 0; i < data.length; i++) { const a = data[i] >>> 24; data[i] = a > 110 ? (data[i] | 0xff000000) >>> 0 : 0; }
    // trim to the picture's own box, grown only where a limb or a weapon really leaves it: at rest the frame's screen
    // rect is exactly the picture's (name tags, health bars and picking stay where they were)
    let x0 = MARGIN_S, x1 = MARGIN_S + rig.W - 1, y0 = MARGIN_T;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) if (data[y * W + x]) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; }
    const w2 = x1 - x0 + 1, h2 = H - y0, out = new Uint32Array(w2 * h2);
    for (let y = 0; y < h2; y++) out.set(data.subarray((y + y0) * W + x0, (y + y0) * W + x0 + w2), y * w2);
    const vs = rig.vs, hs = (vs.hs || 1) * h2 / rig.H, cx0 = vs.cx == null ? 0.5 : vs.cx;
    sp = { w: w2, h: h2, data: out, hs, cx: (cx0 * rig.W + MARGIN_S - x0) / w2, dy: vs.dy || 0, f23: true };
    frames.set(key, sp); st.puppetFrames++;
    if (frames.size > FRAME_CAP) frames.delete(frames.keys().next().value);
    return sp;
  }
  // the game's sprite chooser, wrapped: puppets (or 3D figures' fallback on the classic renderer) answer for characters
  // with a rig; every other entity, and every death/corpse, goes through untouched
  let lastPT = null;
  function wrapChooser() {
    if (typeof animDirectionalSprite !== 'function' || animDirectionalSprite._f23) return;
    const inner = animDirectionalSprite;
    const wrapped = function (e) {
      const md = mode();
      if (md === 'off' || (md === 'figures' && r3dOn()) || !eligible(e)) return inner.apply(this, arguments);
      try {
        const T = typeof ANIM !== 'undefined' ? ANIM.T : 0;
        let a = e._f23pT; const dt = a == null ? 0.016 : clamp(T - a, 0, 0.1); e._f23pT = T;
        if (dt > 0 || !e._f23s) e._f23s = stateFor(e, dt, T);
        const s = e._f23s;
        const c = Engine.cam, rel = Math.atan2(c.y - e.y, c.x - e.x) - s.bodyYaw;
        const oct = ((Math.round(rel / (Math.PI / 4)) % 8) + 8) % 8, v = Math.min(oct, 8 - oct), flip = oct > 4;
        const rig = rigFor(e.sprite, v); if (!rig) return inner.apply(this, arguments);
        // the frame is drawn for the unflipped view; the head turns the other way when mirrored
        const s2 = flip ? Object.assign({}, s, { yaw: -s.yaw }) : s;
        st.puppets++;
        return { sprite: puppetFrame(e, rig, s2), flip };
      } catch (err) { warnOnce('puppet ' + e.sprite, err); st.failed[e.sprite] = true; return inner.apply(this, arguments); }
    };
    wrapped._f23 = true;
    animDirectionalSprite = wrapped;   // eslint-disable-line no-global-assign
  }

  // ================================================================ Options: "Characters"
  const ROW = ['fig23-mode', 'Characters', '3D figures: jointed bodies that walk, turn their heads and talk; Puppets: the pictures, cut out and moved; Original: the pictures as they were'];
  const LABEL = { figures: '3D figures', puppets: 'Puppets', off: 'Original' };
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const orig = originalish();
    b.textContent = orig ? 'Original' : LABEL[st.mode] + (st.mode === 'figures' && !r3dOn() ? ' (as puppets)' : '');
    b.setAttribute('aria-pressed', st.mode !== 'off' && !orig ? 'true' : 'false');
    b.classList.toggle('sel', st.mode !== 'off' && !orig);
    const h = document.getElementById(ROW[0] + '-hint');
    if (h) h.textContent = orig ? 'the Original preset always shows the original pictures' : st.mode === 'figures' && !r3dOn() ? '3D figures need the True 3D renderer; on Classic they are shown as puppets' : ROW[2];
  }
  function appendRow() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById(ROW[0]) || !document.getElementById('gfx-state')) return;
    const anchor = document.getElementById('r3d-cap') || document.getElementById('r3d-mode') || document.getElementById('gpu-comp');
    const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.id = ROW[0] + '-label'; lab.textContent = ROW[1] + ' ';
    const small = document.createElement('small'); small.className = 'muted'; small.id = ROW[0] + '-hint'; small.textContent = ROW[2]; lab.appendChild(small);
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
    b.onclick = () => { if (originalish()) return; st.mode = MODES[(MODES.indexOf(st.mode) + 1) % MODES.length]; save(); syncRow(); };
    if (anchor && anchor.parentNode === grid) { anchor.insertAdjacentElement('afterend', b); anchor.insertAdjacentElement('afterend', lab); }
    else { grid.appendChild(lab); grid.appendChild(b); }
    syncRow();
  }
  function wireMenu() {
    if (typeof renderAccessibilityMenu !== 'function') return;
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRow(); } catch (e) { warnOnce('row', e); } return r; };
  }

  return {
    st, SPECS, models, modelFor, rigFor, frames, pose, bones, stateFor, wants, submit, mode, eligible, attach, G3,
    setMode(m) { if (!MODES.includes(m)) return false; st.mode = m; save(); syncRow(); return true; },
    get queue() { return queue; },
  };
})();

try { FIGURES23.attach(); } catch (e) { try { console.warn('figures23: attach', e); } catch (x) { /* fine */ } }
