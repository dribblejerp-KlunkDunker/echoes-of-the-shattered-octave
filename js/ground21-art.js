// ============================================================
//  ground21-art — Phase 21 "Wow", team GROUND: the close-up detail art for R3D.
//
//  For every floor, ground, wall and ceiling texture the maps use (64 x 64 pixel art), this draws a 4x version
//  (256 x 256) that is real pixel art, never an upscale: cobbles get bevelled edges, hairline cracks, chips and moss in
//  the mortar; planks get grain, knots, nails and seams; grass gets blades and clover; dirt gets pebbles and roots;
//  flagstones get chips; sand and snow get ripples; roofs, plaster, brick, cave rock, marble and metal their own touch.
//  Procedural art from the game's own textures (no assets). Three rules hold for every texture:
//    1. palette: every pixel is a colour of the texture's own palette (its colours, clustered, with light and dark ramps;
//       a handful of family accents such as moss green and nail iron), so the detail reads as the same pixel art;
//    2. agreement: the mean colour of every 16 x 16 block equals the mean of the 4 x 4 base texels it covers (to within
//       a couple of levels), so the near detail fades into the base texture at a distance with no visible pop;
//    3. tiling: every operation wraps (periodic noise, wrapped neighbours and drawing), so the 256 x 256 tile is seamless.
//  Deterministic: seeded by the texture's name, arithmetic only (no Math.sin/exp/pow, which engines may round
//  differently), so node (tools/art/ground21.js) and every browser draw the same pixels.
//
//  One factory, three homes: the page (window.GROUND21_ART), a Web Worker built from GROUND21_ART.source (js/ground21.js
//  draws the textures off the main thread) and node (module.exports, for the committed tool and the tests).
// ============================================================
'use strict';

function ground21ArtFactory() {
  const N = 64, K = 4, M = 256, MM = M * M, NN = N * N;

  // ---------------------------------------------------------------------------------------------- deterministic helpers
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }
  function rng(seed) {
    let a = (seed >>> 0) || 1;
    return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }
  function h2(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1013904223)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16;
    return (h >>> 0) / 4294967296;
  }
  const wrap = (v) => v & 255;    // M = 256 and N = 64: two's complement masks wrap negatives too
  const wrapN = (v) => v & 63;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const sstep = (t) => t * t * (3 - 2 * t);
  // periodic value noise over the 256 tile: cells cx x cy pixels (both divide 256); 0..1
  function vnoise(cx, cy, seed) {
    const gx = M / cx, gy = M / cy, out = new Float32Array(MM);
    for (let y = 0; y < M; y++) {
      const fy = y / cy, iy = Math.floor(fy), ty = sstep(fy - iy), j0 = iy % gy, j1 = (iy + 1) % gy;
      for (let x = 0; x < M; x++) {
        const fx = x / cx, ix = Math.floor(fx), tx = sstep(fx - ix), i0 = ix % gx, i1 = (ix + 1) % gx;
        const a = h2(i0, j0, seed), b = h2(i1, j0, seed), c = h2(i0, j1, seed), d = h2(i1, j1, seed);
        out[y * M + x] = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
      }
    }
    return out;
  }
  function fbm(c, oct, seed, ax) {   // ax: anisotropy (cell height = c * ax)
    const out = new Float32Array(MM); let amp = 1, tot = 0;
    for (let o = 0; o < oct; o++) {
      const cc = Math.max(1, c >> o), cy = Math.max(1, Math.min(M, Math.round(cc * (ax || 1))));
      const n = vnoise(cc, cy, seed + o * 7919);
      for (let i = 0; i < MM; i++) out[i] += n[i] * amp;
      tot += amp; amp *= 0.5;
    }
    for (let i = 0; i < MM; i++) out[i] /= tot;
    return out;
  }
  const lumOf = (r, g, b) => 0.299 * r + 0.587 * g + 0.114 * b;
  const DIR4 = [[1, 0], [0, 1], [1, 1], [1, -1]];

  // ---------------------------------------------------------------------------------------------- families
  // mat: the default material of a face; st: the texture has structure (mortar, seams, outlines) to follow;
  // moss: moss in the joints (0..1); cracks: hairline cracks per tile; bevel: edge width in px; ov: overlays.
  const FAM = {
    cobble: { mat: 'stone', st: true, moss: 0.55, cracks: 16, chips: 26, bevel: 2, pits: 0.010, joint: 0.32, valley: 1 },
    flag: { mat: 'stone', st: true, moss: 0.30, cracks: 22, chips: 34, bevel: 1, pits: 0.008, minJoint: 60, emboss: 0.09, faceVote: 1.9, joint: 0.15, warp: 0.3 },
    masonry: { mat: 'stone', st: true, moss: 0.14, cracks: 12, chips: 26, bevel: 1, pits: 0.010, minJoint: 40, emboss: 0.11, faceVote: 1.9, joint: 0.17, warp: 0.16 },
    brick: { mat: 'brick', st: true, moss: 0.10, cracks: 6, chips: 30, bevel: 1, pits: 0.022, minJoint: 40, joint: 0.2, warp: 0.12 },
    marble: { mat: 'marble', st: true, moss: 0, cracks: 3, chips: 8, bevel: 1, pits: 0.002, veins: true, minJoint: 60, emboss: 0.07, faceVote: 2.0, joint: 0.12, warp: 0.18 },
    rock: { mat: 'rock', st: true, moss: 0.12, cracks: 14, chips: 10, bevel: 1, pits: 0.012, facets: true, joint: 0.16, valley: 1.3 },
    wood: { mat: 'wood', st: true, moss: 0, cracks: 0, chips: 0, bevel: 1, nails: true, knots: 3, minJoint: 40, emboss: 0.09, joint: 0.14, warp: 0.12, faceVote: 1.2 },
    bark: { mat: 'wood', st: true, moss: 0.10, cracks: 0, chips: 0, bevel: 1, knots: 1, heavy: true, joint: 0.12 },
    mixed: { mat: 'auto', st: true, moss: 0, cracks: 4, chips: 6, bevel: 1, knots: 1, nails: true, minJoint: 40, emboss: 0.09, joint: 0.05, warp: 0.04, faceVote: 0.95, clean: true },
    plaster: { mat: 'plaster', st: true, moss: 0, cracks: 10, chips: 12, bevel: 1, pits: 0.004, minJoint: 60, emboss: 0.07, faceVote: 1.9, joint: 0.05, warp: 0.1, clean: true },
    paint: { mat: 'plaster', st: true, moss: 0, cracks: 3, chips: 2, bevel: 1, pits: 0.001, soft: true, minJoint: 60, emboss: 0.06, joint: 0.05, warp: 0.05, faceVote: 0.95, clean: true },
    metal: { mat: 'metal', st: true, moss: 0, cracks: 0, chips: 0, bevel: 1, rivets: true, joint: 0.1, warp: 0.08, faceVote: 1.0, clean: true },
    roof: { mat: 'roof', st: true, moss: 0.35, cracks: 4, chips: 18, bevel: 1, pits: 0.008, minJoint: 30, joint: 0.2, warp: 0.16 },
    grass: { mat: 'grass', st: false, tufts: 1500, clover: 22, emboss: 0.05 },
    turf: { mat: 'grass', st: false, tufts: 1100, clover: 14, emboss: 0.05 },
    leaf: { mat: 'leaf', st: false, leaves: 900, emboss: 0.08 },
    dirt: { mat: 'dirt', st: false, pebbles: 150, roots: 9, sprigs: 50, emboss: 0.08, leaves: 420, warp: 0.75 },
    track: { mat: 'dirt', st: false, pebbles: 160, roots: 3, tufts: 260, emboss: 0.08 },
    sand: { mat: 'sand', st: false, ripples: true, pebbles: 16, emboss: 0.05 },
    snow: { mat: 'snow', st: false, ripples: true, sparkle: true, emboss: 0.002, warp: 0.4 },
    chalk: { mat: 'plaster', st: false, ripples: false, pebbles: 20, speck: true, emboss: 0.06 },
  };
  // Every floor, ground, wall and ceiling texture of the 44 maps (and the extras' maps) has a family here.
  const NAMES = {
    t_cobble: 'cobble', p17c_mole: 'cobble', c_rock: 'cobble',
    t_flag: 'flag', p17c_flags: 'flag', p17c_sthi: 'flag', p17c_stlo: 'flag', ln17_depth: 'flag',
    t_stone: 'masonry', ln17_wall: 'masonry', ln17_wall2: 'masonry', ln17_coping: 'masonry', ln17_stairhole: 'masonry',
    p17c_ashlar: 'masonry', p17c_retain: 'masonry', p17c_retain2: 'masonry', p17c_retain3: 'masonry', p17c_quay: 'masonry',
    t_catacomb: 'masonry', p9p_reedstone: 'masonry', d18_down: 'masonry', d18_up: 'masonry', p17c_parapet: 'mixed',
    t_mausoleum: 'brick', t_greymarble: 'marble', t_marble: 'marble', c_vault: 'paint',
    p16h_rock: 'rock', p17c_cliff: 'rock', t_glassrock: 'rock', gates_rubble: 'rock',
    p15r_burn: 'rock', p15r_char_a: 'rock', p15r_char_b: 'rock', p15r_char_c: 'rock',
    t_wood: 'wood', p17c_plank: 'wood', t_door: 'wood', p17c_door: 'wood', p16d_counter: 'wood', p16d_drawers: 'mixed',
    p16f_gate: 'wood', p17p_gate: 'wood', t_p20_gate: 'wood', p17c_shutter: 'wood', p16k_deck: 'wood', p17p_post: 'wood',
    p17p_rivergate: 'wood', p16f_grown: 'bark', p16f_grown2: 'bark', p16f_grown3: 'bark', p16f_knot: 'bark', p17p_bark: 'bark',
    p17p_woods: 'bark', c_beams: 'mixed', t_house: 'mixed',
    p17c_front: 'plaster', p17c_front2: 'plaster', p17c_front3: 'plaster', p17c_plaster: 'plaster', p17c_plaster2: 'plaster',
    p17c_plaster3: 'plaster', p16d_airceil: 'plaster',
    t_grass: 'grass', p17c_turf: 'turf', p17c_turf2: 'turf', t_moss: 'dirt', t_p20_track: 'track',
    t_hedge: 'leaf', p17p_hedge: 'leaf', p17p_leaves: 'leaf', p17p_leaves2: 'leaf', t_deepwood: 'leaf',
    ln17_snow: 'snow', p17p_snow: 'snow', p17p_snowroad: 'snow', t_p20_chalk: 'chalk',
    t_brass: 'metal', ln17_rail: 'metal', p17c_rail: 'metal', gates_bars_closed: 'metal',
    t_roof: 'roof', p17c_slate: 'roof',
  };
  // overlays and animated surfaces keep the base texture: decals, water, mist, the void
  const SKIP = /^(d_|p15r_|t_water$|t_shallows$|p16k_mist$|r3d_|gates_bars$)/;   // p15r_*: the fire's char decals
  function wants(name) { return !SKIP.test(name); }

  // ---------------------------------------------------------------------------------------------- base analysis
  function analyse(base) {
    const R = new Float32Array(NN), G = new Float32Array(NN), B = new Float32Array(NN), L = new Float32Array(NN), A = new Uint8Array(NN);
    for (let i = 0; i < NN; i++) { R[i] = base[i * 4]; G[i] = base[i * 4 + 1]; B[i] = base[i * 4 + 2]; A[i] = base[i * 4 + 3]; L[i] = lumOf(R[i], G[i], B[i]); }
    // local median (7 x 7, wrapped) and the groove strength: how much darker than its neighbourhood a texel is
    const med = new Float32Array(NN), win = new Float32Array(49);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let k = 0; for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) win[k++] = L[wrapN(y + j) * N + wrapN(x + i)];
      win.sort(); med[y * N + x] = win[33];   // the 68th percentile: the face's light, even where joints are wide
    }
    const g = new Float32Array(NN);
    for (let i = 0; i < NN; i++) { const d = med[i] - L[i]; g[i] = clamp((d - (5 + 0.09 * med[i])) / (6 + 0.10 * med[i]), 0, 1); }
    // lone dark texels are speckle, not structure
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x; if (g[i] < 0.5) continue;
      let n = 0; for (let j = -1; j <= 1; j++) for (let k2 = -1; k2 <= 1; k2++) if ((j || k2) && g[wrapN(y + j) * N + wrapN(x + k2)] >= 0.5) n++;
      if (n < 2) g[i] *= 0.35;
    }
    // joint score: darkness against the local light (d), averaged along short runs in four directions, so a mortar line
    // or a seam (dark all along) scores high and a dark speck (dark alone) does not
    const dk = new Float32Array(NN), line = new Float32Array(NN);
    for (let i = 0; i < NN; i++) dk[i] = med[i] - L[i];
    const DIRS = [[1, 0], [0, 1], [1, 1], [1, -1]];
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      let best = -1e9;
      for (const [ax, ay] of DIRS) { let sm = 0; for (let t = -2; t <= 2; t++) sm += dk[wrapN(y + ay * t) * N + wrapN(x + ax * t)]; if (sm > best) best = sm; }
      line[y * N + x] = 0.5 * dk[y * N + x] + 0.5 * best / 5;
    }
    // grain direction: the axis along which neighbours differ least
    let dx = 0, dy = 0;
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) { const i = y * N + x; dx += Math.abs(L[i] - L[y * N + wrapN(x + 1)]); dy += Math.abs(L[i] - L[wrapN(y + 1) * N + x]); }
    // texel noise: the base's own speckle (lum residual against its class's 3 x 3 mean), so the 4x version can draw grain
    // of the same strength at a finer scale instead of repeating each texel as a 4 x 4 block
    const sig = new Float32Array(NN);
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      const i = y * N + x, cl = g[i] >= 0.5; let s = 0, n = 0, s2 = 0;
      for (let j = -1; j <= 1; j++) for (let k2 = -1; k2 <= 1; k2++) { const q = wrapN(y + j) * N + wrapN(x + k2); if ((g[q] >= 0.5) !== cl) continue; s += L[q]; s2 += L[q] * L[q]; n++; }
      sig[i] = Math.sqrt(Math.max(0, s2 / n - (s / n) * (s / n)));
    }
    return { R, G, B, L, A, g, med, sig, dk, line, grainX: dx < dy * 0.92, grainY: dy < dx * 0.92 };
  }

  // ---------------------------------------------------------------------------------------------- palette
  function hsv(r, g, b) {
    const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; let h = 0;
    if (d > 0) { if (mx === r) h = ((g - b) / d + 6) % 6; else if (mx === g) h = (b - r) / d + 2; else h = (r - g) / d + 4; h *= 60; }
    return { h, s: mx > 0 ? d / mx : 0, v: mx };
  }
  function buildPalette(an, accents) {
    // k-means (deterministic seeds: luminance quantiles) on the opaque texels
    const idx = []; for (let i = 0; i < NN; i++) if (an.A[i] > 100) idx.push(i);
    if (!idx.length) for (let i = 0; i < NN; i++) idx.push(i);
    idx.sort((a, b) => an.L[a] - an.L[b] || a - b);
    const KC = 18, C = [];
    for (let k = 0; k < KC; k++) { const i = idx[Math.min(idx.length - 1, Math.floor((k + 0.5) / KC * idx.length))]; C.push([an.R[i], an.G[i], an.B[i]]); }
    for (let it = 0; it < 6; it++) {
      const S = C.map(() => [0, 0, 0, 0]);
      for (const i of idx) {
        let best = 0, bd = 1e9;
        for (let k = 0; k < KC; k++) { const c = C[k], d = (an.R[i] - c[0]) ** 2 * 2 + (an.G[i] - c[1]) ** 2 * 4 + (an.B[i] - c[2]) ** 2 * 3; if (d < bd) { bd = d; best = k; } }
        const s = S[best]; s[0] += an.R[i]; s[1] += an.G[i]; s[2] += an.B[i]; s[3]++;
      }
      for (let k = 0; k < KC; k++) if (S[k][3]) C[k] = [S[k][0] / S[k][3], S[k][1] / S[k][3], S[k][2] / S[k][3]];
    }
    // rare but distinct colours (flowers, gilding, glints) get clusters of their own: up to 8 farthest points
    const dist2 = (i, c) => (an.R[i] - c[0]) ** 2 * 2 + (an.G[i] - c[1]) ** 2 * 4 + (an.B[i] - c[2]) ** 2 * 3;
    for (let extra = 0; extra < 8; extra++) {
      let far = -1, fd = 0;
      for (const i of idx) { let bd = 1e12; for (const c of C) { const d = dist2(i, c); if (d < bd) bd = d; } if (bd > fd) { fd = bd; far = i; } }
      if (far < 0 || fd < 40 * 40 * 3) break;
      C.push([an.R[far], an.G[far], an.B[far]]);
    }
    const P = [], ramp = [];
    const RAMP = [0.62, 0.74, 0.87, 1, 1.13, 1.27, 1.42];   // index 3 is the cluster's own colour (ramp[k][4 + lv - 1])
    for (const c of C) {
      const rr = [];
      for (const m of RAMP) {
        // light steps warm a touch and dark steps cool a touch, as a pixel artist's ramps do
        const lk = clamp(lumOf(c[0], c[1], c[2]) / 90, 0, 1), w = m > 1 ? (m - 1) * 12 * lk : 0, cool = m < 1 ? (1 - m) * 8 * lk : 0;
        const col = [clamp(Math.round(c[0] * m + w), 0, 255), clamp(Math.round(c[1] * m + w * 0.6), 0, 255), clamp(Math.round(c[2] * m + cool), 0, 255)];
        P.push(col); rr.push(col);
      }
      ramp.push([rr[0]].concat(rr));   // ramp[k][4 + lv], lv -3..3 -> rr[lv + 3]
    }
    for (const a of accents) P.push(a);
    // drop duplicates
    const seen = new Set(), out = [];
    for (const p of P) { const k = (p[0] << 16) | (p[1] << 8) | p[2]; if (!seen.has(k)) { seen.add(k); out.push(p); } }
    return { colors: out, clusters: C, ramp };
  }
  function makeQuant(pal) {
    const cache = new Int16Array(64 * 64 * 64).fill(-1), P = pal.colors;
    return (r, g, b) => {
      const k = ((clamp(r, 0, 255) >> 2) << 12) | ((clamp(g, 0, 255) >> 2) << 6) | (clamp(b, 0, 255) >> 2);
      let v = cache[k];
      if (v < 0) {
        const rr = ((k >> 12) << 2) + 2, gg = (((k >> 6) & 63) << 2) + 2, bb = ((k & 63) << 2) + 2; let bd = 1e12;
        for (let i = 0; i < P.length; i++) { const p = P[i], d = (rr - p[0]) ** 2 * 2 + (gg - p[1]) ** 2 * 4 + (bb - p[2]) ** 2 * 3; if (d < bd) { bd = d; v = i; } }
        cache[k] = v;
      }
      return v;
    };
  }

  // ---------------------------------------------------------------------------------------------- the generator
  function familyOf(name, an) {
    if (NAMES[name]) return NAMES[name];
    // a texture this table does not know (a later module's): guess from structure and colour
    let gf = 0, r = 0, gg = 0, b = 0; for (let i = 0; i < NN; i++) { if (an.g[i] > 0.5) gf++; r += an.R[i]; gg += an.G[i]; b += an.B[i]; }
    gf /= NN; const c = hsv(r / NN, gg / NN, b / NN);
    if (gf > 0.07) return c.h > 15 && c.h < 45 && c.s > 0.35 ? 'wood' : 'masonry';
    if (c.h > 60 && c.h < 160 && c.s > 0.2) return 'grass';
    if (c.v > 200 && c.s < 0.12) return 'snow';
    if (c.h > 15 && c.h < 50 && c.s > 0.25) return 'dirt';
    return 'masonry';
  }

  function make(name, base, opt) {
    opt = opt || {};
    const an = analyse(base);
    const famName = opt.family || familyOf(name, an), F = FAM[famName] || FAM.masonry;
    // joints: the family's share of texels with the highest joint score (and darker than their light at all)
    if (F.st) {
      const sorted0 = Float32Array.from(an.line).sort(), thr = Math.max(2, sorted0[Math.floor((1 - (F.joint || 0.14)) * (NN - 1))]);
      for (let i = 0; i < NN; i++) an.g[i] = an.line[i] >= thr && an.dk[i] > 1 ? 1 : 0;
      // bridge gaps of one or two texels along a row, a column or a diagonal: a mortar line is drawn unbroken
      for (let pass = 0; pass < 2; pass++) {
        const add = [];
        for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
          const i = y * N + x; if (an.g[i]) continue;
          const at = (dx, dy) => an.g[wrapN(y + dy) * N + wrapN(x + dx)];
          let hit = false;
          for (const [ax, ay] of DIR4) {
            const a1 = at(-ax, -ay), b1 = at(ax, ay), a2 = at(-2 * ax, -2 * ay), b2 = at(2 * ax, 2 * ay);
            if ((a1 && b1) || (a1 && b2 && an.line[i] > 0) || (a2 && b1 && an.line[i] > 0)) { hit = true; break; }
          }
          if (hit && an.dk[i] > -4) add.push(i);
        }
        for (const i of add) an.g[i] = 1;
      }
      // lone joint texels are speckle
      for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
        const i = y * N + x; if (!an.g[i]) continue;
        let n = 0; for (let j = -1; j <= 1; j++) for (let k2 = -1; k2 <= 1; k2++) if ((j || k2) && an.g[wrapN(y + j) * N + wrapN(x + k2)]) n++;
        if (n < 1) an.g[i] = 0;
      }
    }
    const seed = hashStr(name) ^ 0x9e3779b9;
    const rand = rng(seed);
    // accents: moss, iron, clover, root (all muted, read against the texture's palette)
    let mr = 0, mg = 0, mb = 0; for (let i = 0; i < NN; i++) { mr += an.R[i]; mg += an.G[i]; mb += an.B[i]; }
    mr /= NN; mg /= NN; mb /= NN; const mL = lumOf(mr, mg, mb);
    const mossK = clamp(mL / 120, 0.45, 1.15);
    const ACC = {
      moss: [[Math.round(52 * mossK), Math.round(70 * mossK), Math.round(30 * mossK)], [Math.round(72 * mossK), Math.round(94 * mossK), Math.round(38 * mossK)], [Math.round(98 * mossK), Math.round(118 * mossK), Math.round(48 * mossK)]],
      iron: [[38, 34, 32], [70, 66, 62], [128, 122, 112]],
    };
    const accents = [];
    if (F.moss) accents.push(...ACC.moss);
    if (F.nails || F.rivets) accents.push(...ACC.iron);
    const pal = buildPalette(an, accents);
    const quant = makeQuant(pal);

    // --- 1. the class map at 4x: each pixel takes the palette cluster that owns most of the (warped) texels around it,
    // so the base's clusters keep their colours and places but get round, hand-drawn edges instead of 4 x 4 blocks;
    // and a smooth height (the base's luminance, tent-filtered) for the light and shade
    const warpX = fbm(32, 2, seed + 11), warpY = fbm(32, 2, seed + 13), rough = fbm(8, 2, seed + 17);
    const CL = pal.clusters, KC = CL.length;
    const tcl = new Uint8Array(NN);
    for (let t = 0; t < NN; t++) { let best = 0, bd = 1e12; for (let k = 0; k < KC; k++) { const c = CL[k], d = (an.R[t] - c[0]) ** 2 * 2 + (an.G[t] - c[1]) ** 2 * 4 + (an.B[t] - c[2]) ** 2 * 3; if (d < bd) { bd = d; best = k; } } tcl[t] = best; }
    const cls = new Uint8Array(MM), Hs = new Float32Array(MM), src = new Int32Array(MM), wc = new Float32Array(KC), touched = new Uint8Array(64);
    const W = F.warp != null ? F.warp : F.st ? 0.36 : 0.62;
    const VR = F.st ? 0.82 : 0.95;   // vote radius (texels): small enough that a one-texel line or speck keeps its core
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
      const p = y * M + x;
      const u = (x + 0.5) / K + (warpX[p] - 0.5) * 2 * W, v = (y + 0.5) / K + (warpY[p] - 0.5) * 2 * W;
      const fu = u - 0.5, fv = v - 0.5, iu = Math.floor(fu), iv = Math.floor(fv);
      let hs = 0, ws = 0;
      for (let j = -1; j <= 2; j++) for (let i = -1; i <= 2; i++) {
        const ti = ((iv + j) & 63) * N + ((iu + i) & 63), bx = 1 - Math.abs(fu - (iu + i)) / 1.5, by = 1 - Math.abs(fv - (iv + j)) / 1.5;
        if (bx > 0 && by > 0) { hs += an.L[ti] * bx * by; ws += bx * by; }
      }
      Hs[p] = hs / ws; src[p] = wrapN(Math.floor(v)) * N + wrapN(Math.floor(u));
    }
    // --- 2. joints: valleys of the height (darker than the 21 px neighbourhood) joined with the base's dark grooves,
    // specks removed; then the faces between them (stones, planks, bricks), wrapped, with their unwrapped extent
    const box = (A, r) => {   // wrapped separable box blur
      const T1 = new Float32Array(MM), T2 = new Float32Array(MM), n = 2 * r + 1;
      for (let y = 0; y < M; y++) { let s0 = 0; for (let i = -r; i <= r; i++) s0 += A[y * M + wrap(i)]; for (let x = 0; x < M; x++) { T1[y * M + x] = s0 / n; s0 += A[y * M + wrap(x + r + 1)] - A[y * M + wrap(x - r)]; } }
      for (let x = 0; x < M; x++) { let s0 = 0; for (let i = -r; i <= r; i++) s0 += T1[wrap(i) * M + x]; for (let y = 0; y < M; y++) { T2[y * M + x] = s0 / n; s0 += T1[wrap(y + r + 1) * M + x] - T1[wrap(y - r) * M + x]; } }
      return T2;
    };
    const Hb = box(Hs, 10);
    const mask = new Uint8Array(MM);
    if (F.st) {
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
        const p = y * M + x;
        const fu = (x + 0.5) / K - 0.5 + (warpX[p] - 0.5) * 2 * W, fv = (y + 0.5) / K - 0.5 + (warpY[p] - 0.5) * 2 * W;
        const iu = Math.floor(fu), iv = Math.floor(fv), tu = fu - iu, tv = fv - iv;
        const a = an.g[wrapN(iv) * N + wrapN(iu)], b = an.g[wrapN(iv) * N + wrapN(iu + 1)], c = an.g[wrapN(iv + 1) * N + wrapN(iu)], d = an.g[wrapN(iv + 1) * N + wrapN(iu + 1)];
        const gs = (a + (b - a) * tu) * (1 - tv) + (c + (d - c) * tu) * tv;
        const valley = !!F.valley && Hs[p] < Hb[p] - Math.max(3, 0.075 * Hb[p]) * F.valley + (rough[p] - 0.5) * 4;
        mask[p] = (gs > 0.52 + (rough[p] - 0.5) * 0.34 || valley) ? 1 : 0;
      }
      // drop joint specks smaller than 14 px (they are speckle on a stone, not mortar)
      const seenJ = new Uint8Array(MM), qq = new Int32Array(MM);
      for (let s0 = 0; s0 < MM; s0++) {
        if (!mask[s0] || seenJ[s0]) continue;
        let h = 0, t = 0; qq[t++] = s0; seenJ[s0] = 1;
        while (h < t) { const p = qq[h++], x = p % M, y = (p / M) | 0;
          for (let d = 0; d < 4; d++) { const q = d === 0 ? y * M + ((x + 1) & 255) : d === 1 ? y * M + ((x + 255) & 255) : d === 2 ? ((y + 1) & 255) * M + x : ((y + 255) & 255) * M + x; if (mask[q] && !seenJ[q]) { seenJ[q] = 1; qq[t++] = q; } } }
        if (t < (F.minJoint || 14)) for (let i = 0; i < t; i++) mask[qq[i]] = 0;
      }
    }
    // the class vote: joints keep a tight radius (one-texel lines survive); faces vote wider over face texels only, so a
    // stone or plank reads as a few flat clusters, the way a pixel artist paints one, not as the base's texel noise
    const VRF = F.st ? (F.faceVote || 1.45) : VR;
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
      const p = y * M + x, jm = mask[p] === 1, R0 = jm ? VR : VRF, reach = Math.ceil(R0);
      const u = (x + 0.5) / K + (warpX[p] - 0.5) * 2 * W, v = (y + 0.5) / K + (warpY[p] - 0.5) * 2 * W;
      const fu = u - 0.5, fv = v - 0.5, iu = Math.floor(fu), iv = Math.floor(fv);
      let nt = 0;
      for (let pass = 0; pass < 2 && nt === 0; pass++) {
        for (let j = 1 - reach; j <= reach; j++) for (let i = 1 - reach; i <= reach; i++) {
          const ti = ((iv + j) & 63) * N + ((iu + i) & 63);
          if (pass === 0 && F.st && !jm && an.g[ti] >= 0.5) continue;     // a face votes with face texels
          const ax = 1 - Math.abs(fu - (iu + i)) / R0, ay = 1 - Math.abs(fv - (iv + j)) / R0;
          if (ax > 0 && ay > 0) { const k = tcl[ti]; if (wc[k] === 0) touched[nt++] = k; wc[k] += ax * ay; }
        }
      }
      let best = 0, bw0 = -1;
      for (let q = 0; q < nt; q++) { const k = touched[q], w = wc[k] + h2(x, y, seed + k) * 0.06; wc[k] = 0; if (w > bw0 || (w === bw0 && k < best)) { bw0 = w; best = k; } }
      cls[p] = best;
    }
    const lab = new Int32Array(MM).fill(-1), comps = [];
    const qx = new Int32Array(MM), qy = new Int32Array(MM), ux = new Int32Array(MM), uy = new Int32Array(MM);
    for (let s0 = 0; s0 < MM; s0++) {
      if (mask[s0] || lab[s0] >= 0) continue;
      const id = comps.length; let h = 0, t = 0;
      qx[t] = s0 % M; qy[t] = (s0 / M) | 0; t++; lab[s0] = id; ux[s0] = s0 % M; uy[s0] = (s0 / M) | 0;
      let n = 0, sx = 0, sy = 0, sxx = 0, syy = 0, cr = 0, cg = 0, cb = 0, minx = 1e9, maxx = -1e9, miny = 1e9, maxy = -1e9;
      while (h < t) {
        const x = qx[h], y = qy[h]; h++;
        const p = y * M + x, X = ux[p], Y = uy[p];
        n++; sx += X; sy += Y; sxx += X * X; syy += Y * Y; const cc = CL[cls[p]]; cr += cc[0]; cg += cc[1]; cb += cc[2];
        if (X < minx) minx = X; if (X > maxx) maxx = X; if (Y < miny) miny = Y; if (Y > maxy) maxy = Y;
        for (let d = 0; d < 4; d++) {
          const ddx = d === 0 ? 1 : d === 1 ? -1 : 0, ddy = d === 2 ? 1 : d === 3 ? -1 : 0;
          const nx = wrap(x + ddx), ny = wrap(y + ddy), q = ny * M + nx;
          if (mask[q] || lab[q] >= 0) continue;
          lab[q] = id; ux[q] = X + ddx; uy[q] = Y + ddy; qx[t] = nx; qy[t] = ny; t++;
        }
      }
      comps.push({ n, cx: sx / n, cy: sy / n, vx: sxx / n - (sx / n) ** 2, vy: syy / n - (sy / n) ** 2, r: cr / n, g: cg / n, b: cb / n, w: maxx - minx + 1, h: maxy - miny + 1, mat: F.mat });
    }
    // materials of the faces in mixed textures (timber and plaster, doors with iron bands, windows)
    for (const c of comps) {
      const k = hsv(c.r, c.g, c.b);
      let mat = F.mat;
      if (F.mat === 'auto') mat = k.v < 45 ? 'dark' : (k.h >= 10 && k.h <= 48 && k.s > 0.32) ? 'wood' : (k.s < 0.2 && k.v > 150) ? 'plaster' : (k.h > 180 && k.h < 260 && k.s > 0.15) ? 'dark' : 'stone';
      else if (mat === 'plaster' && (k.v < 70 || (k.h > 180 && k.h < 260 && k.s > 0.2))) mat = 'dark';   // window panes and shutters
      else if (mat === 'plaster' && k.h >= 10 && k.h <= 48 && k.s > 0.35) mat = 'wood';
      else if (mat === 'wood' && k.s < 0.16 && k.v < 140 && c.n < MM * 0.2) mat = 'metal';                // iron bands and hinges
      else if (mat === 'wood' && k.s < 0.18 && k.v >= 150) mat = 'plaster';
      if (F.st && c.n > MM * 0.6 && mat !== 'grass') c.big = true;                                      // a face that is the whole tile
      c.mat = mat;
      c.grainX = c.w > c.h * 1.3 ? true : c.h > c.w * 1.3 ? false : !an.grainY;
    }
    // distance (px, capped) from each joint pixel to a face: thin joints are mortar, wide ones are areas (panes, holes)
    const jd = new Uint8Array(MM).fill(255);
    { const qq = new Int32Array(MM); let h = 0, t = 0;
      for (let p = 0; p < MM; p++) if (!mask[p]) { jd[p] = 0; qq[t++] = p; }
      while (h < t) { const p = qq[h++], d = jd[p]; if (d >= 6) continue; const x = p % M, y = (p / M) | 0;
        for (let e = 0; e < 4; e++) { const q = e === 0 ? y * M + ((x + 1) & 255) : e === 1 ? y * M + ((x + 255) & 255) : e === 2 ? ((y + 1) & 255) * M + x : ((y + 255) & 255) * M + x; if (jd[q] === 255) { jd[q] = d + 1; qq[t++] = q; } } } }

    // distance (px, capped at 6) from each face pixel to the nearest joint
    const fdist = new Uint8Array(MM).fill(255);
    { const qq = new Int32Array(MM); let h = 0, t = 0;
      for (let p = 0; p < MM; p++) if (mask[p]) { fdist[p] = 0; qq[t++] = p; }
      while (h < t) { const p = qq[h++], d = fdist[p]; if (d >= 6) continue; const x = p & 255, y = p >> 8;
        for (let e = 0; e < 4; e++) { const q = e === 0 ? y * M + ((x + 1) & 255) : e === 1 ? y * M + ((x + 255) & 255) : e === 2 ? ((y + 1) & 255) * M + x : ((y + 255) & 255) * M + x; if (fdist[q] === 255) { fdist[q] = d + 1; qq[t++] = q; } } } }
    const jdFace = (x, y) => fdist[(y & 255) * M + (x & 255)];
    // --- 3. paint in ramp steps: light from the upper left on every rise of the height (emboss, in whole steps), bevels
    // on the faces, shadowed joints, then each material's grain; every pixel is a colour of the palette
    const O = new Float32Array(MM * 3), LV = new Int8Array(MM);
    const mott = fbm(32, 3, seed + 23), grainN = fbm(64, 3, seed + 29, 1);
    const along = vnoise(64, 4, seed + 37), alongY = vnoise(4, 64, seed + 41);
    const isFace = (x, y) => !mask[wrap(y) * M + wrap(x)];
    const bw = F.bevel || 1;
    const Gd = new Float32Array(MM);
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) Gd[y * M + x] = (Hs[y * M + wrap(x + 1)] - Hs[y * M + wrap(x - 1)]) + (Hs[wrap(y + 1) * M + x] - Hs[wrap(y - 1) * M + x]);
    const sorted = Float32Array.from(Gd).sort();
    const pct = (q) => sorted[clamp(Math.floor(q * MM), 0, MM - 1)];
    const E1 = F.emboss != null ? F.emboss : 0.13, E2 = E1 * 0.25;
    const lit1 = Math.max(1.2, pct(1 - E1)), lit2 = Math.max(2.4, pct(1 - E2)), sh1 = Math.min(-1.2, pct(E1)), sh2 = Math.min(-2.4, pct(E2));
    for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
      const p = y * M + x;
      let lv = 0;
      const gd = Gd[p];
      // inside a face (away from its joints) only strong rises shade, by one step: no craters from texel noise
      const inFace = F.st && !mask[p] && jdFace(x, y) > 3;
      if (inFace) lv += gd > lit2 * 1.4 ? 1 : gd < sh2 * 1.4 ? -1 : 0;
      else lv += gd > lit2 ? 2 : gd > lit1 ? 1 : gd < sh2 ? -2 : gd < sh1 ? -1 : 0;
      const hn = h2(x, y, seed);
      let k = 1;
      if (mask[p]) {
        if (jd[p] <= 3) {
          lv -= 1;
          if (isFace(x, y - 1) || isFace(x - 1, y)) lv -= 1;
          if (F.mat !== 'wood' && F.mat !== 'auto' && hn > 0.9) lv += 1;   // grit
        } else if (hn > 0.97) lv += 1;
      } else {
        const c = comps[lab[p]], mat = c.mat;
        if (F.st && !c.big && mat !== 'dark') {
          let hi = false, lo = false;
          for (let d = 1; d <= bw; d++) { if (!isFace(x - d, y) || !isFace(x, y - d)) hi = true; if (!isFace(x + d, y) || !isFace(x, y + d)) lo = true; }
          if (hi && !lo) lv = Math.max(lv, 0) + 1; else if (lo && !hi) lv = Math.min(lv, 0) - 1;
        }
        if (mat === 'stone' || mat === 'brick' || mat === 'roof' || mat === 'marble' || mat === 'rock') {
          const sp = mat === 'brick' ? 0.06 : mat === 'marble' ? 0.015 : 0.04;
          if (hn < sp) lv -= 1; else if (hn > 1 - sp * 0.7) lv += 1;
          if (F.pits && hn < F.pits) lv -= 1; else if (F.pits && h2(x - 1, y - 1, seed) < F.pits) lv += 1;
          k *= 1 + (mott[p] - 0.5) * 0.08;
          if (mat === 'roof' && !c.big) { const t = clamp((uy[p] - (c.cy - c.h / 2)) / Math.max(4, c.h), 0, 1); lv += t < 0.22 ? -1 : t > 0.86 ? 1 : 0; }
          if ((F.facets || mat === 'rock') && !c.big) {
            const dxx = ux[p] - c.cx, dyy = uy[p] - c.cy, a = h2(lab[p], 7, seed) * 2 - 1, bq = h2(lab[p], 9, seed) * 2 - 1;
            const f = (dxx * a + dyy * bq) / Math.max(6, Math.sqrt(c.vx + c.vy) * 2.2);
            lv += f > 0.45 ? 1 : f < -0.45 ? -1 : 0;
          }
        } else if (mat === 'wood') {
          const gX = c.grainX, gq = gX ? along[p] : alongY[p];
          const gv = gq + (grainN[p] - 0.5) * 0.5;
          lv += gv > 0.7 ? 1 : gv < 0.28 ? -1 : 0;
          const ring = (gX ? y : x) + Math.floor((gX ? warpY[p] : warpX[p]) * 6);
          if (h2(gX ? 0 : ring, gX ? ring : 0, seed + 3) < 0.16) lv -= 1;                       // dark late-wood lines
          if (F.heavy && hn < 0.05) lv -= 1;
        } else if (mat === 'plaster') {
          if (hn < 0.005) lv -= 1; else if (hn > 0.997) lv += 1;
          if (F.pits && hn < F.pits) lv -= 1;
        } else if (mat === 'metal') {
          const gq = c.grainX ? along[p] : alongY[p];
          lv += gq > 0.72 ? 1 : gq < 0.25 ? -1 : 0;
        } else if (mat === 'grass' || mat === 'leaf' || mat === 'dirt') {
          if (hn < 0.07) lv -= 1; else if (hn > 0.95) lv += 1;
          k *= 1 + (mott[p] - 0.5) * 0.1;
        } else if (mat === 'sand' || mat === 'snow') {
          if (hn < (mat === 'snow' ? 0.006 : 0.03)) lv -= 1; else if (hn > 0.98) lv += 1;
          k *= 1 + (mott[p] - 0.5) * 0.04;
        }
        if (F.speck && hn > 0.992) lv -= 2;
      }
      lv = clamp(lv, -3, 3); LV[p] = lv;
      const c = pal.ramp[cls[p]][4 + lv];
      O[p * 3] = c[0] * k; O[p * 3 + 1] = c[1] * k; O[p * 3 + 2] = c[2] * k;
    }

    // --- 4. overlays, drawn wrapped
    const put = (x, y, r, g, b) => { const p = wrap(y) * M + wrap(x); O[p * 3] = r; O[p * 3 + 1] = g; O[p * 3 + 2] = b; };
    const mul = (x, y, k) => { const p = wrap(y) * M + wrap(x); O[p * 3] *= k; O[p * 3 + 1] *= k; O[p * 3 + 2] *= k; };
    const get = (x, y) => { const p = wrap(y) * M + wrap(x); return [O[p * 3], O[p * 3 + 1], O[p * 3 + 2]]; };
    const faceAt = (x, y) => !mask[wrap(y) * M + wrap(x)];
    const matAt = (x, y) => { const p = wrap(y) * M + wrap(x); return mask[p] ? null : comps[lab[p]].mat; };
    const stoneish = (m) => m === 'stone' || m === 'brick' || m === 'rock' || m === 'marble' || m === 'roof' || m === 'plaster';
    const nearJoint = (x, y, r) => { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (!faceAt(x + i, y + j)) return true; return false; };

    // marble veins: thin wandering lines through the faces
    if (F.veins) {
      const vw = fbm(64, 3, seed + 51);
      const kx = 2 + Math.floor(rand() * 3), ky = 1 + Math.floor(rand() * 2);
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
        const p = y * M + x; if (mask[p]) continue;
        const ph = (x * kx + y * ky) / M + vw[p] * 3.2, t = Math.abs(ph - Math.floor(ph) - 0.5);
        if (t < 0.011) mul(x, y, 0.86); else if (t < 0.02 && h2(x, y, seed + 5) < 0.4) mul(x, y, 0.93);
        const ph2 = (x * (kx + 3) - y * ky) / M + vw[p] * 2.1, t2 = Math.abs(ph2 - Math.floor(ph2) - 0.5);
        if (t2 < 0.006) mul(x, y, 0.93);
      }
    }
    // hairline cracks from the joints into the faces
    for (let n = 0, tries = 0; n < (F.cracks || 0) && tries < 4000; tries++) {
      let x = Math.floor(rand() * M), y = Math.floor(rand() * M);
      if (!faceAt(x, y) || !nearJoint(x, y, 1) || !stoneish(matAt(x, y))) continue;
      const p0 = wrap(y) * M + wrap(x); if (comps[lab[p0]].big && F.mat !== 'plaster' && F.mat !== 'rock') continue;
      n++;
      let a = rand() * 8 | 0; const len = 8 + (rand() * 22 | 0);
      const DX = [1, 1, 0, -1, -1, -1, 0, 1], DY = [0, 1, 1, 1, 0, -1, -1, -1];
      for (let s = 0; s < len; s++) {
        const r0 = rand(); if (r0 < 0.25) a = (a + 1) & 7; else if (r0 < 0.5) a = (a + 7) & 7;
        x += DX[a]; y += DY[a];
        if (!faceAt(x, y)) break;
        mul(x, y, 0.62);
        if (faceAt(x + 1, y + 1) && rand() < 0.6) mul(x + 1, y + 1, 1.1);
        if (rand() < 0.12) { const b2 = (a + (rand() < 0.5 ? 2 : 6)) & 7; if (faceAt(x + DX[b2], y + DY[b2])) mul(x + DX[b2], y + DY[b2], 0.72); }
      }
    }
    // chips: small bites out of a face's edge, the broken stone a little darker, its lower lip catching light
    for (let n = 0, tries = 0; n < (F.chips || 0) && tries < 4000; tries++) {
      const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
      if (!faceAt(x, y) || !stoneish(matAt(x, y))) continue;
      let jx = 0, jy = 0, ok = false;
      for (const [ddx, ddy] of [[-1, 0], [0, -1], [1, 0], [0, 1]]) if (!faceAt(x + ddx, y + ddy)) { jx = ddx; jy = ddy; ok = true; break; }
      if (!ok) continue; n++;
      const rad = 1 + (rand() * 2.4);
      for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
        if (i * i + j * j > rad * rad || !faceAt(x + i, y + j)) continue;
        if ((i * jx + j * jy) < -0.5) continue;
        mul(x + i, y + j, 0.74);
      }
      for (let j = -3; j <= 3; j++) for (let i = -3; i <= 3; i++) {
        const d2 = i * i + j * j; if (d2 <= rad * rad || d2 > (rad + 1.2) * (rad + 1.2) || !faceAt(x + i, y + j)) continue;
        if ((i * jx + j * jy) > -0.5) mul(x + i, y + j, i + j > 0 ? 1.14 : 0.86);
      }
    }
    // moss in the joints and creeping a pixel or two onto the stones
    if (F.moss) {
      const mn = fbm(32, 3, seed + 61), thr = 1 - F.moss * 0.62;
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
        const p = y * M + x; const v = mn[p] + (h2(x, y, seed + 7) - 0.5) * 0.12;
        if (v < thr) continue;
        const inJoint = mask[p] && jd[p] <= 3, edge = !mask[p] && nearJoint(x, y, 1) && v > thr + 0.08;
        if (!inJoint && !edge) continue;
        const L0 = lumOf(O[p * 3], O[p * 3 + 1], O[p * 3 + 2]);
        const lvl = v > thr + 0.16 ? 2 : v > thr + 0.07 ? 1 : 0;
        const c = ACC.moss[clamp(lvl + (h2(x, y, seed + 9) < 0.3 ? 1 : 0) - (isFace(x, y - 1) ? 0 : 1), 0, 2)];
        const kk = clamp(L0 / 70, 0.6, 1.2);
        put(x, y, c[0] * kk, c[1] * kk, c[2] * kk);
      }
    }
    // wood: knots with rings; nails where the planks cross the joists, and beside the end seams
    if (F.knots) {
      for (let n = 0, tries = 0; n < F.knots * 2 && tries < 600; tries++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        if (matAt(x, y) !== 'wood' || nearJoint(x, y, 5)) continue;
        n++;
        const gX = comps[lab[wrap(y) * M + wrap(x)]].grainX;
        const rl = 3 + rand() * 4, rs = 1.6 + rand() * 1.4;
        for (let j = -12; j <= 12; j++) for (let i = -12; i <= 12; i++) {
          const a = gX ? i / (rl * 1.8) : i / rs, b = gX ? j / rs : j / (rl * 1.8);
          const d = Math.sqrt(a * a + b * b);
          if (!faceAt(x + i, y + j) || matAt(x + i, y + j) !== 'wood') continue;
          if (d < 0.45) mul(x + i, y + j, 0.56);
          else if (d < 0.75) mul(x + i, y + j, 0.82);
          else if (d < 1.0) mul(x + i, y + j, 1.08);
          else if (d < 1.35 && Math.abs(d - 1.2) < 0.09) mul(x + i, y + j, 0.88);
          else if (d < 2.1 && Math.abs(d - 1.8) < 0.07) mul(x + i, y + j, 0.92);
        }
      }
    }
    const nail = (x, y) => {
      const I = ACC.iron;
      put(x, y, I[1][0], I[1][1], I[1][2]); put(x + 1, y, I[0][0], I[0][1], I[0][2]); put(x, y + 1, I[0][0], I[0][1], I[0][2]); put(x + 1, y + 1, I[0][0] * 0.8, I[0][1] * 0.8, I[0][2] * 0.8);
      put(x, y, I[2][0], I[2][1], I[2][2]);
      mul(x + 2, y + 1, 0.82); mul(x + 1, y + 2, 0.82);
    };
    if (F.nails) {
      // joists: two lines across the grain per tile; a nail in each plank where a joist crosses it
      const placed = new Set();
      for (const jpos of [40, 168]) {
        for (let axis = 0; axis < 2; axis++) {
          let run = 0, start = 0;
          for (let s = 0; s <= M; s++) {
            const x = axis === 0 ? jpos : s, y = axis === 0 ? s : jpos;
            const ok = s < M && matAt(x, y) === 'wood' && (comps[lab[wrap(y) * M + wrap(x)]].grainX === (axis === 0));
            if (ok) { if (!run) start = s; run++; continue; }
            if (run >= 7) {
              const c = start + (run >> 1);
              const nx = axis === 0 ? jpos : c - 1, ny = axis === 0 ? c - 1 : jpos;
              const key = (wrap(ny) >> 3) * 64 + (wrap(nx) >> 3);
              if (!placed.has(key) && !nearJoint(nx, ny, 2)) { nail(nx, ny); placed.add(key); }
            }
            run = 0;
          }
        }
      }
    }
    if (F.rivets) {
      for (let n = 0, tries = 0; n < 24 && tries < 3000; tries++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        if (matAt(x, y) !== 'metal' || nearJoint(x, y, 2) || !nearJoint(x, y, 5)) continue;
        n++; nail(x, y);
      }
    }
    // grass: tufts of blades fanning from a dark root, each blade climbing the ramp from shadow to a lit tip
    const DX8 = [0, 1, 1, 1, 0, -1, -1, -1], DY8 = [-1, -1, 0, 1, 1, 1, 0, -1];
    const rampAt = (x, y, lv) => pal.ramp[cls[wrap(y) * M + wrap(x)]][4 + clamp(lv, -3, 3)];
    const blade = (x, y, ang, len, k0) => {
      let fx = x, fy = y; const r0 = cls[wrap(y) * M + wrap(x)];
      for (let s = 0; s < len; s++) {
        const t = len > 1 ? s / (len - 1) : 1;
        const lv = Math.round(-2 + t * (3 + k0));
        const c = pal.ramp[r0][4 + clamp(lv, -3, 3)];
        const X = Math.round(fx), Y = Math.round(fy);
        put(X, Y, c[0], c[1], c[2]);
        if (s < len - 1) { const q = wrap(Y + 1) * M + wrap(X + 1); const c2 = pal.ramp[cls[q]][2]; if (h2(X, Y, seed + 5) < 0.5) put(X + 1, Y + 1, c2[0], c2[1], c2[2]); }
        fx += DX8[ang] * 0.95; fy += DY8[ang] * 0.95;
        if (s === (len >> 1) && h2(x, y, seed + 77) < 0.35) ang = (ang + (h2(y, x, seed) < 0.5 ? 1 : 7)) & 7;
      }
    };
    if (F.tufts) {
      const dens = fbm(32, 2, seed + 71);
      for (let n = 0, tries = 0; n < F.tufts && tries < F.tufts * 6; tries++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        if (dens[y * M + x] < 0.3 + rand() * 0.25) continue;
        n++;
        const dir = rand() * 8 | 0, nb = 3 + (rand() * 4 | 0);
        for (let b = 0; b < nb; b++) {
          const ang = (dir + ((b % 3) - 1) + 8) & 7;
          blade(x + (b & 1), y, ang, 4 + (rand() * 6 | 0), rand() < 0.35 ? 1 : 0);
        }
        const rc = rampAt(x, y, -3); put(x, y, rc[0], rc[1], rc[2]);
      }
    }
    if (F.clover) {
      for (let n = 0; n < F.clover; n++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        const base0 = get(x, y), L0 = lumOf(base0[0], base0[1], base0[2]);
        const c = [L0 * 0.62, L0 * 1.05 + 10, L0 * 0.58];
        for (const [ox, oy] of [[0, -2], [-2, 1], [2, 1]]) for (let j = -1; j <= 1; j++) for (let i = -1; i <= 1; i++) {
          if (i * i + j * j > 1) continue;
          const kk = (i < 0 || j < 0) ? 1.12 : 0.92;
          put(x + ox + i, y + oy + j, c[0] * kk, c[1] * kk, c[2] * kk);
        }
        put(x, y, c[0] * 0.7, c[1] * 0.7, c[2] * 0.7);
        mul(x + 3, y + 2, 0.75); mul(x + 1, y + 3, 0.75);
      }
    }
    // dirt: pebbles with a lit top, a shaded underside and a cast shadow; roots that wander; sprigs of green
    const pebble = (x, y, rx, ry, tone) => {
      const b0 = get(x, y), L0 = lumOf(b0[0], b0[1], b0[2]);
      const gr = clamp(L0 * 1.35 + 18, 50, 210) * tone;
      const c = [gr * 1.02, gr * 0.98, gr * 0.9];
      for (let j = -5; j <= 5; j++) for (let i = -5; i <= 5; i++) {
        const d = (i * i) / (rx * rx) + (j * j) / (ry * ry);
        if (d <= 1) { const kk = (i + j) / (rx + ry) < -0.25 ? 1.18 : (i + j) / (rx + ry) > 0.3 ? 0.76 : 1; put(x + i, y + j, c[0] * kk, c[1] * kk, c[2] * kk); }
        else { const d2 = ((i - 1) * (i - 1)) / (rx * rx) + ((j - 1) * (j - 1)) / (ry * ry); if (d2 <= 1) mul(x + i, y + j, 0.72); }
      }
    };
    if (F.pebbles) {
      for (let n = 0; n < F.pebbles; n++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        const big = rand() < 0.3; pebble(x, y, big ? 2.6 + rand() * 1.6 : 1.3 + rand() * 1.2, big ? 2 + rand() * 1.3 : 1 + rand() * 0.9, 0.82 + rand() * 0.26);
      }
    }
    if (F.roots) {
      for (let n = 0; n < F.roots; n++) {
        let x = rand() * M, y = rand() * M, a = rand() * 6.283; const len = 26 + rand() * 50;
        for (let s = 0; s < len; s++) {
          a += (rand() - 0.5) * 0.7;
          // cos/sin by a short polynomial (deterministic everywhere)
          const t = ((a % 6.283185307) + 6.283185307) % 6.283185307 - 3.141592654;
          const sn = t * (1 - t * t / 6 * (1 - t * t / 20 * (1 - t * t / 42 * (1 - t * t / 72))));
          const t2 = t + 1.570796327 > 3.141592654 ? t + 1.570796327 - 6.283185307 : t + 1.570796327;
          const cs = t2 * (1 - t2 * t2 / 6 * (1 - t2 * t2 / 20 * (1 - t2 * t2 / 42 * (1 - t2 * t2 / 72))));
          x += cs; y += sn;
          const X = Math.round(x), Y = Math.round(y);
          const rc = rampAt(X, Y, -3), rl = rampAt(X, Y - 1, 1);
          put(X, Y, rc[0] * 0.9, rc[1] * 0.85, rc[2] * 0.8); if (s < len * 0.5) put(X, Y + 1, rc[0], rc[1], rc[2]);
          put(X, Y - 1, rl[0], rl[1], rl[2]);
          if (rand() < 0.05) { const bx = X + (rand() < 0.5 ? 1 : -1), by = Y + 1; mul(bx, by, 0.7); mul(bx, by + 1, 0.8); }
        }
      }
    }
    if (F.sprigs) {
      for (let n = 0; n < F.sprigs; n++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        const b0 = get(x, y), L0 = lumOf(b0[0], b0[1], b0[2]);
        const c = [L0 * 0.75, L0 * 1.15 + 8, L0 * 0.55];
        put(x, y, c[0], c[1], c[2]); put(x - 1, y - 1, c[0] * 1.1, c[1] * 1.1, c[2] * 1.1); put(x + 1, y - 1, c[0] * 1.15, c[1] * 1.15, c[2] * 1.15);
        if (rand() < 0.5) put(x, y - 2, c[0] * 1.2, c[1] * 1.2, c[2] * 1.2);
        mul(x, y + 1, 0.8);
      }
    }
    // leaves: little ovals, lit tops and dark undersides, layered until the leafy pattern is drawn in leaves
    if (F.leaves) {
      for (let n = 0; n < F.leaves; n++) {
        const x = Math.floor(rand() * M), y = Math.floor(rand() * M);
        const b0 = get(x, y); const L0 = lumOf(b0[0], b0[1], b0[2]);
        if (L0 < 18) continue;
        const horiz = rand() < 0.5, rl = 2 + rand() * 1.6, rs = 1 + rand() * 0.6, tone = 0.92 + rand() * 0.2;
        for (let j = -4; j <= 4; j++) for (let i = -4; i <= 4; i++) {
          const a = horiz ? i / rl : i / rs, b = horiz ? j / rs : j / rl, d = a * a + b * b;
          if (d > 1) continue;
          const kk = (j < 0 ? 1.14 : j > 0 ? 0.86 : 1) * tone;
          put(x + i, y + j, b0[0] * kk, b0[1] * kk, b0[2] * kk);
          if (d > 0.55 && j > 0) mul(x + i, y + j + 1, 0.8);
        }
        if (rand() < 0.5) mul(x, y, 0.85);   // the midrib
      }
    }
    // sand and snow: ripples (a periodic phase, so they tile), grains and sparkle
    if (F.ripples) {
      const rw = fbm(64, 2, seed + 81);
      const kx = 1 + Math.floor(rand() * 2), ky = 9 + Math.floor(rand() * 4);
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
        const p = y * M + x; const ph = (x * kx + y * ky) / M + rw[p] * 2.5; const t = ph - Math.floor(ph);
        if (t < 0.05) mul(x, y, F.sparkle ? 1.03 : 1.07); else if (!F.sparkle && t > 0.5 && t < 0.56) mul(x, y, 0.9);   // snow: crests only, no troughs
      }
    }
    if (F.sparkle) for (let n = 0; n < 160; n++) { const x = Math.floor(rand() * M), y = Math.floor(rand() * M); mul(x, y, 1.12); }

    // --- 5. palette and agreement: quantise, then nudge each 16 x 16 block's mean onto its base mean (a few rounds;
    // the nudges stay below a palette step, so they move only the pixels already near the next colour)
    const T = new Float32Array(16 * 16 * 3);
    for (let by = 0; by < 16; by++) for (let bx = 0; bx < 16; bx++) {
      let r = 0, g = 0, b = 0;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) { const t = (by * 4 + j) * N + bx * 4 + i; r += an.R[t]; g += an.G[t]; b += an.B[t]; }
      const o = (by * 16 + bx) * 3; T[o] = r / 16; T[o + 1] = g / 16; T[o + 2] = b / 16;
    }
    const Q = new Int16Array(MM), P = pal.colors;
    const E = new Float32Array(16 * 16 * 3);
    const blockErr = () => {
      E.fill(0);
      for (let p = 0; p < MM; p++) { const x = p % M, y = (p / M) | 0, o = ((y >> 4) * 16 + (x >> 4)) * 3, c = P[Q[p]]; E[o] += c[0]; E[o + 1] += c[1]; E[o + 2] += c[2]; }
      let mx = 0; for (let i = 0; i < E.length; i++) { E[i] = T[i] - E[i] / 256; if (Math.abs(E[i]) > mx) mx = Math.abs(E[i]); }
      return mx;
    };
    const doQuant = () => { for (let p = 0; p < MM; p++) Q[p] = quant(O[p * 3] + 0.5 | 0, O[p * 3 + 1] + 0.5 | 0, O[p * 3 + 2] + 0.5 | 0); };
    doQuant();
    if (F.clean) {
      // clean, flat art (beams, plaster, panels): a pixel unlike all four neighbours that agree with each other is noise
      for (let p = 0; p < MM; p++) {
        const x = p & 255, y = p >> 8, a = Q[y * M + ((x + 1) & 255)];
        if (a !== Q[p] && a === Q[y * M + ((x + 255) & 255)] && a === Q[((y + 1) & 255) * M + x] && a === Q[((y + 255) & 255) * M + x]) { Q[p] = a; const c = P[a]; O[p * 3] = c[0]; O[p * 3 + 1] = c[1]; O[p * 3 + 2] = c[2]; }
      }
    }
    let err = blockErr(), rounds = 0;
    // smooth rounds first (a bilinear field between block centres: no block edges), then exact per-block steps
    for (; rounds < 7 && err > 1.2; rounds++) {
      const smooth = rounds < 6;
      for (let y = 0; y < M; y++) for (let x = 0; x < M; x++) {
        const p = y * M + x;
        for (let ch = 0; ch < 3; ch++) {
          let e;
          if (smooth) {
            const fx = (x + 0.5) / 16 - 0.5, fy = (y + 0.5) / 16 - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), tx = fx - ix, ty = fy - iy;
            const i0 = (ix + 16) & 15, i1 = (ix + 17) & 15, j0 = (iy + 16) & 15, j1 = (iy + 17) & 15;
            const a = E[(j0 * 16 + i0) * 3 + ch], b = E[(j0 * 16 + i1) * 3 + ch], c = E[(j1 * 16 + i0) * 3 + ch], d = E[(j1 * 16 + i1) * 3 + ch];
            e = (a + (b - a) * tx) * (1 - ty) + (c + (d - c) * tx) * ty;
          } else e = E[((y >> 4) * 16 + (x >> 4)) * 3 + ch];
          O[p * 3 + ch] += e;
        }
      }
      doQuant(); err = blockErr();
    }
    // greedy boundary pass: in a block that is still off, move edges by a pixel (a pixel takes a neighbour's colour) or
    // step a pixel one shade along its ramp, whichever brings the block's mean closest, until it matches; this is how
    // a pixel artist would fix it, and it keeps the palette and the crisp edges
    if (err > 1.0) {
      const step = new Int16Array(P.length * 2).fill(-1);   // [darker, lighter] palette index along a ramp
      const key = new Map(); P.forEach((c, i) => key.set((c[0] << 16) | (c[1] << 8) | c[2], i));
      for (const rr of pal.ramp) for (let i = 1; i < rr.length; i++) {
        const a = key.get((rr[i][0] << 16) | (rr[i][1] << 8) | rr[i][2]);
        if (a === undefined) continue;
        if (i > 1) { const d = key.get((rr[i - 1][0] << 16) | (rr[i - 1][1] << 8) | rr[i - 1][2]); if (d !== undefined && d !== a) step[a * 2] = d; }
        if (i < rr.length - 1) { const l = key.get((rr[i + 1][0] << 16) | (rr[i + 1][1] << 8) | rr[i + 1][2]); if (l !== undefined && l !== a) step[a * 2 + 1] = l; }
      }
      const cand = new Int32Array(256 * 6 * 2), done = new Uint8Array(256);
      for (let by = 0; by < 16; by++) for (let bx = 0; bx < 16; bx++) {
        const o = (by * 16 + bx) * 3;
        let er = E[o] * 256, eg = E[o + 1] * 256, eb = E[o + 2] * 256;   // wanted change of the block's sums
        if (Math.abs(er) <= 200 && Math.abs(eg) <= 200 && Math.abs(eb) <= 200) continue;
        let nc = 0; done.fill(0);
        for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) {
          const x = bx * 16 + i, y = by * 16 + j, p = y * M + x, a = Q[p];
          const opts = [Q[y * M + wrap(x + 1)], Q[y * M + wrap(x - 1)], Q[wrap(y + 1) * M + x], Q[wrap(y - 1) * M + x], step[a * 2], step[a * 2 + 1]];
          for (let k = 0; k < 6; k++) { const b = opts[k]; if (b < 0 || b === a) continue; let dup = false; for (let q = 0; q < k; q++) if (opts[q] === b) dup = true; if (dup) continue; cand[nc * 2] = (j * 16 + i) | (k >= 4 ? 256 : 0); cand[nc * 2 + 1] = b; nc++; }
        }
        for (let it = 0; it < 256; it++) {
          const cur = er * er + eg * eg + eb * eb; if (cur <= 3 * 64 * 64) break;
          // boundary moves first (an edge shifts by a pixel); a lone shade step only when no edge move helps
          let best = -1, bv = cur;
          for (let pass = 0; pass < 2 && best < 0; pass++) {
            for (let c = 0; c < nc; c++) {
              const raw = cand[c * 2], li = raw & 255; if (done[li] || ((raw >> 8) !== pass)) continue;
              const p = (by * 16 + (li >> 4)) * M + bx * 16 + (li & 15), A = P[Q[p]], B = P[cand[c * 2 + 1]];
              const r = er - (B[0] - A[0]), g = eg - (B[1] - A[1]), b = eb - (B[2] - A[2]), v = r * r + g * g + b * b;
              if (v < bv) { bv = v; best = c; }
            }
          }
          if (best < 0) break;
          const li = cand[best * 2] & 255, p = (by * 16 + (li >> 4)) * M + bx * 16 + (li & 15), A = P[Q[p]], B = P[cand[best * 2 + 1]];
          er -= B[0] - A[0]; eg -= B[1] - A[1]; eb -= B[2] - A[2]; Q[p] = cand[best * 2 + 1]; done[li] = 1;
        }
      }
      err = blockErr();
    }
    // --- 6. out: RGBA, opaque (the base texture's alpha still decides cut-outs in the shader)
    const out = new Uint8Array(MM * 4);
    const used = new Set();
    for (let p = 0; p < MM; p++) { const c = P[Q[p]]; out[p * 4] = c[0]; out[p * 4 + 1] = c[1]; out[p * 4 + 2] = c[2]; out[p * 4 + 3] = 255; used.add(Q[p]); }
    return { data: out, family: famName, err, rounds, colors: used.size, palette: P.length, debug: opt.debug ? { mask, cls, g: an.g } : null };
  }

  // ---------------------------------------------------------------------------------------------- checks (tests, tools)
  function blockMeanError(base, det) {   // max |mean(16x16 block) - mean(4x4 base texels)| over blocks and channels
    let mx = 0, sum = 0;
    for (let by = 0; by < 16; by++) for (let bx = 0; bx < 16; bx++) for (let ch = 0; ch < 3; ch++) {
      let a = 0, b = 0;
      for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) a += base[((by * 4 + j) * N + bx * 4 + i) * 4 + ch];
      for (let j = 0; j < 16; j++) for (let i = 0; i < 16; i++) b += det[((by * 16 + j) * M + bx * 16 + i) * 4 + ch];
      const e = Math.abs(a / 16 - b / 256); sum += e; if (e > mx) mx = e;
    }
    return { max: mx, mean: sum / 768 };
  }
  // seam: the colour step across the tile's wrap edge compared with the steps inside (1.0 = like any interior line)
  function seamRatio(det) {
    const d = (a, b) => Math.abs(det[a] - det[b]) + Math.abs(det[a + 1] - det[b + 1]) + Math.abs(det[a + 2] - det[b + 2]);
    let edge = 0, inner = 0, n = 0;
    for (let i = 0; i < M; i++) {
      edge += d((i * M + M - 1) * 4, (i * M) * 4) + d(((M - 1) * M + i) * 4, i * 4);
      for (const k of [63, 127, 191]) inner += d((i * M + k) * 4, (i * M + k + 1) * 4) + d((k * M + i) * 4, ((k + 1) * M + i) * 4);
      n++;
    }
    return (edge / 2) / Math.max(1e-6, inner / 6);
  }
  function texSum(d) { let h = 0x811c9dc5; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619); return h >>> 0; }

  return { N, K, M, FAM, NAMES, wants, familyOf: (name, base) => familyOf(name, analyse(base)), make, blockMeanError, seamRatio, texSum, hashStr };
}

// the three homes
if (typeof module !== 'undefined' && module.exports) module.exports = ground21ArtFactory();
if (typeof window !== 'undefined') { window.GROUND21_ART = ground21ArtFactory(); window.GROUND21_ART.source = '(' + ground21ArtFactory.toString() + ')()'; }
