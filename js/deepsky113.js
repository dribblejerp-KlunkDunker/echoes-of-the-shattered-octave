// ============================================================
//  deepsky113 — Phase 113b (the owner, 22 Nov 2026): "at night in locations with little to no light pollution I want
//  the night sky to be lit with the most beautiful galaxies possible but not over the top. Something to be in awe of."
//  And, on reading the plan: "Maybe a little over the top is actually ok." The Chord (the band of star-dust, kept and
//  named by the Phase 20-21 rulings) as a river of stars, eight faint note-stars along it and three far galaxies
//  (approved 22 Nov), a deeper star field and rare shooting stars, where the night is truly dark.
//  See story/Game Layer/Phase 113b - The deep night sky.md
//
//  ONE MAP, BOTH VIEWS. Everything is built once, in code, into one deep-sky map of the upper half of the sky: 1536
//  columns round (one per logical pixel at the view's centre, as the panoramas are) by 384 rows from the horizon to the
//  zenith (the same angle a row), RGBA16UI: R and G carry the diffuse light at full darkness (8 bits a colour, and the
//  river's own lane-softened glow), B and A a star (8 bits a colour, which gate it obeys, its twinkle's phase). Hashed
//  noise only, built a few rows a frame, so no frame stalls. The classic view samples it per sky pixel (an Engine sky
//  hook, after js/sky.js's stars and under its panoramas); the 3D view reads it with one texelFetch in js/light21.js's sky
//  shader. Both quantise with the same 4x4 ordered dither, in steps of 4 of 255, at the game's logical pixel.
//
//  HOW DARK IS HERE: darkness(), 0 a lit street .. 1 the open wild on a moonless clear night, from the hour, the cloud and
//  haze, the moon (its phase and height, as js/light21.js and js/calendar11.js have them), the lamps and fires near you
//  (the engine's own light list: lamp, campfire, hearth, Light-glass...) and the kind of place (a short table below, the
//  towns from js/towns108.js). Indoors, underground, in a place lit by its own light (map.bright: the Bleach, the Rift)
//  and on the Rift it is 0. Below 0.35 the old sky; 0.35 to 0.75 the river comes up; above 0.75 the dust lanes, the star
//  grain, the far galaxies and the shooting stars.
//
//  THE RIFT: "the sky over the Rift, which was black and starless" (Book Three). On maps whose id begins p100_ or p113_
//  no star of any kind is drawn, switch or no switch: js/sky.js and js/light21.js ask starless() (the one change not
//  behind the switch).
//
//  FOR THE STONES: window.STARLORE113 (supplied later; read with a guard, nothing if absent) gives constellations and
//  wanderers; their stars are laid into the map as real stars (gate 3: the bright ones survive a lit town), and
//  dirOf(id), visible(id) and drawChart(ctx, id, x, y, w, h, opts) serve the standing stones. Replace the table object to
//  change it (or call relore()).
//  Switch: GFX.deepSky, Options > Graphics "Deep night sky"; off in Original and Low. Nothing here uses Math.random.
// ============================================================
'use strict';

const DEEPSKY113 = (function () {
  const TAU = Math.PI * 2, D2R = Math.PI / 180, R2D = 180 / Math.PI;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const W = 1536, H = 384, ROWK = H / (Math.PI / 2);   // rows per radian of elevation
  const FX = 160 / 0.66;                               // the logical focal length (js/r3d21.js R3D.FX)
  const DS = 0.35;                                     // diffuse light: 255 in a channel is 0.35 of white
  const FLAG = 'deepSky';
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('deepsky113: ' + k + ': ' + (e && e.message ? e.message : e)); } catch (x) { /* none */ } };

  // ---------------------------------------------------------------- the switch
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = false;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;

  // ---------------------------------------------------------------- hashed noise
  function hh(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; h = Math.imul(h, 2246822519); h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  }
  // value noise, periodic in x with period px cells
  function vn(x, y, px, s) {
    const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi;
    fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const x0 = ((xi % px) + px) % px, x1 = (x0 + 1) % px;
    const a = hh(x0, yi, s), b = hh(x1, yi, s), c = hh(x0, yi + 1, s), d = hh(x1, yi + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  // fbm over galactic longitude l (degrees, wrapping) and latitude b (degrees), base cell `cell` degrees (divides 360)
  function fbm(l, b, cell, s, oct) {
    let sum = 0, amp = 0.5, norm = 0, c = cell;
    for (let o = 0; o < oct; o++) { const p = Math.round(360 / c); sum += amp * vn((l + 180) / c, b / c, p, s + o * 101); norm += amp; amp *= 0.5; c /= 2; }
    return sum / norm;
  }

  // ---------------------------------------------------------------- the sky's geometry
  // directions: x east, y south, z up (the map grid's atan2 bearings: 0 east, PI/2 south, -PI/2 north)
  const dirOfAE = (az, el) => [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)];
  const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const aeOf = (d) => ({ az: Math.atan2(d[1], d[0]), el: Math.asin(clamp(d[2], -1, 1)) });
  // the Chord's great circle: js/light21.js's bandN, kept
  const N = nrm([0.35, 0.82, 0.45]);
  const circleEl = (az) => Math.atan2(-(N[0] * Math.cos(az) + N[1] * Math.sin(az)), N[2]);
  // the core. The design asked for it in the south-east, but that half of this great circle is under the horizon (it
  // crosses the horizon at about 23 degrees north of east and 23 south of west, and stands highest, 63 degrees, in the
  // north-west); the nearest honest place is low in the east-north-east end, where the river comes up out of the horizon
  const CORE_AZ = -36 * D2R;
  const U = dirOfAE(CORE_AZ, circleEl(CORE_AZ));
  let V = cross(N, U);
  { const p = dirOfAE(-80 * D2R, circleEl(-80 * D2R)); if (dot(p, V) < 0) V = [-V[0], -V[1], -V[2]]; }   // l grows up the arc
  const galOf = (d) => [Math.atan2(dot(d, V), dot(d, U)) * R2D, Math.asin(clamp(dot(d, N), -1, 1)) * R2D];
  const fromGal = (l, b) => { l *= D2R; b *= D2R; const cb = Math.cos(b); return aeOf([cb * (Math.cos(l) * U[0] + Math.sin(l) * V[0]) + Math.sin(b) * N[0], cb * (Math.cos(l) * U[1] + Math.sin(l) * V[1]) + Math.sin(b) * N[1], cb * (Math.cos(l) * U[2] + Math.sin(l) * V[2]) + Math.sin(b) * N[2]]); };

  // ---------------------------------------------------------------- the river (all in degrees of l and b)
  const sigmaOf = (l) => 2.3 + 2.9 * Math.exp(-(l / 40) * (l / 40));
  const meander = (l) => (fbm(l, 0, 40, 7, 2) - 0.5) * 2.6;
  const diskOf = (l) => 0.26 * (0.36 + 0.64 * Math.exp(-Math.abs(l) / 80));
  // star-clouds: knots of light along the band
  const KNOTS = [];
  for (let k = 0; k < 15; k++) KNOTS.push({ l: -18 + hh(k, 1, 31) * 165, b: (hh(k, 2, 31) - 0.5) * 4, s: 1.1 + hh(k, 3, 31) * 2.2, a: 0.018 + hh(k, 4, 31) * 0.035 });
  // rose knots: no more than ten in all (the owner, 22 Nov), none wider than about a degree; nine here, one in the big cloud
  const ROSE = [];
  for (let k = 0; k < 9; k++) ROSE.push({ l: -10 + k * 15 + hh(k, 5, 37) * 9, b: (hh(k, 6, 37) - 0.5) * 3.2, s: 0.22 + hh(k, 7, 37) * 0.15, a: 0.035 + hh(k, 8, 37) * 0.03 });
  // the dust lanes: the great lane, its branch, a spur across the core, and fine filaments
  const lane1B = (l) => 0.3 + 1.5 * Math.sin((l + 10) / 21) + (fbm(l, 3, 12, 41, 3) - 0.5) * 3.4;
  const lane1W = (l) => (0.5 + 1.1 * Math.exp(-((l - 5) / 35) * ((l - 5) / 35))) * (0.45 + 1.1 * fbm(l, 9, 4, 43, 3));
  function laneT(l, b) {
    let T = 1;
    if (l > -26 && l < 100) {
      const fade = smooth(-26, -16, l) * (1 - smooth(80, 100, l));
      const jit = (fbm(l * 3, b * 3, 3, 59, 3) - 0.5) * 0.9, brk = smooth(0.28, 0.42, fbm(l, b, 6, 61, 2));
      const c1 = lane1B(l), w1 = lane1W(l), o1 = (1 - smooth(w1 * 0.7, w1 * 1.2, Math.abs(b - c1 + jit))) * fade * brk;
      T *= 1 - 0.96 * o1;
      if (l > 8 && l < 72) { const c2 = c1 + (l - 8) * 0.09 + 1.0 + (fbm(l, 7, 6, 49, 2) - 0.5) * 1.4, w2 = 0.3 + 0.45 * fbm(l, 5, 6, 47, 2), o2 = (1 - smooth(w2 * 0.6, w2 * 1.25, Math.abs(b - c2 + jit))) * smooth(8, 16, l) * (1 - smooth(60, 72, l)); T *= 1 - 0.92 * o2; }
      if (l > -16 && l < 22) { const c3 = c1 - 2.4 + l * 0.06 + (fbm(l, 11, 6, 51, 2) - 0.5) * 1.2, w3 = 0.3 + 0.3 * fbm(l, 2, 3, 53, 2), o3 = (1 - smooth(w3 * 0.6, w3 * 1.25, Math.abs(b - c3 + jit))) * smooth(-16, -9, l) * (1 - smooth(14, 22, l)); T *= 1 - 0.88 * o3; }
    }
    // filaments: ridges of noise, threading the brighter half of the band
    const rn = 1 - Math.abs(2 * fbm(l, b * 2.2, 6, 53, 3) - 1);
    T *= 1 - 0.75 * smooth(0.86, 0.97, rn) * Math.exp(-(b * b) / 30);
    return T;
  }

  // ---------------------------------------------------------------- the far galaxies (approved 22 Nov)
  // each in its own tangent plane: e (along the horizon), n (up the sky); sizes in degrees
  const GALAXIES = [
    { name: 'the tilted spiral', kind: 'spiral', az: 104 * D2R, el: 20 * D2R, R: 4.0, q: 0.3, pa: 32, core: 0.18, cr: 0.09, arm: 0.36, lane: true },
    { name: 'the small face-on spiral', kind: 'spiral', az: 48 * D2R, el: 22 * D2R, R: 1.8, q: 0.9, pa: 70, core: 0.16, cr: 0.13, arm: 0.34, lane: false },
    { name: 'the pair of ragged clouds', kind: 'clouds', az: 76 * D2R, el: 10 * D2R, R: 3.2, parts: [{ dx: 0, dy: 0, rx: 2.8, ry: 1.7, a: 0.15, s: 61 }, { dx: 11, dy: 3.5, rx: 1.4, ry: 1.0, a: 0.13, s: 67 }] },
  ];
  for (const g of GALAXIES) {
    g.d = dirOfAE(g.az, g.el); g.e = nrm(cross([0, 0, 1], g.d)); g.n = cross(g.d, g.e);
    g.cosR = Math.cos((g.kind === 'clouds' ? 16 : g.R * 1.35) * D2R);
  }
  // light of a galaxy at a direction: [r, g, b] or null
  const GOUT = [0, 0, 0];
  function galaxyAt(g, dx, dy, dz) {
    const c = dx * g.d[0] + dy * g.d[1] + dz * g.d[2]; if (c < g.cosR) return null;
    const x = (dx * g.e[0] + dy * g.e[1] + dz * g.e[2]) * R2D, y = (dx * g.n[0] + dy * g.n[1] + dz * g.n[2]) * R2D;
    if (g.kind === 'clouds') {
      let r = 0, gg = 0, b = 0;
      for (const p of g.parts) {
        const u = (x - p.dx) / p.rx, v = (y - p.dy) / p.ry, rr = u * u + v * v; if (rr > 4) continue;
        const n = fbm(x * 18 + p.s, y * 18, 6, p.s, 4);
        const ragged = clamp((n - 0.32 - rr * 0.16) * 2.2, 0, 1);
        const I = p.a * Math.exp(-rr * 1.0) * (0.4 + 1.1 * ragged * ragged);
        r += I * 0.86; gg += I * 0.9; b += I * 1.0;
        if (p.s === 61) { const kx = x + 0.9, ky = y - 0.35, k = Math.exp(-(kx * kx + ky * ky) / (2 * 0.28 * 0.28)) * 0.05; r += k * 1.0; gg += k * 0.55; b += k * 0.66; }   // the tenth rose knot
      }
      if (r + gg + b <= 0) return null; GOUT[0] = r; GOUT[1] = gg; GOUT[2] = b; return GOUT;
    }
    const pa = g.pa * D2R, u = (x * Math.cos(pa) + y * Math.sin(pa)) / g.R, v0 = (-x * Math.sin(pa) + y * Math.cos(pa)) / g.R, v = v0 / g.q;
    const r = Math.hypot(u, v); if (r > 1.35) return null;
    const ph = Math.atan2(v, u), arms = 0.5 + 0.5 * Math.cos(2 * (ph - Math.log(r + 0.04) * 2.4));
    const disk = Math.exp(-r * 2.3) * (0.3 + 0.7 * arms * arms) * (1 - smooth(1.0, 1.35, r));
    const knots = arms > 0.8 && r > 0.25 && r < 0.95 ? smooth(0.82, 0.95, fbm(u * 40, v * 40, 6, 71, 2)) * 0.6 : 0;
    const core = Math.exp(-(r / g.cr) * (r / g.cr));
    let lane = 1; if (g.lane) lane = 1 - 0.65 * Math.exp(-Math.pow((v0 - 0.08) / 0.05, 2)) * (1 - smooth(0.5, 0.9, Math.abs(u)));
    const Ic = g.core * core, Ia = g.arm * (disk + knots) * lane;
    // the core warm, the arms blue-white, the outermost arm a breath of violet
    const vi = smooth(0.55, 1.0, r) * 0.5;
    GOUT[0] = Ic * 1.0 + Ia * (0.78 + 0.1 * vi); GOUT[1] = Ic * 0.92 + Ia * (0.86 - 0.08 * vi); GOUT[2] = Ic * 0.76 + Ia * 1.0;
    const L = GOUT[0] * 0.3 + GOUT[1] * 0.59 + GOUT[2] * 0.11; if (L > 0.18) { const k = 0.18 / L; GOUT[0] *= k; GOUT[1] *= k; GOUT[2] *= k; }   // a galaxy's core: about 0.18 of white at most
    return GOUT;
  }

  // ---------------------------------------------------------------- stars
  const NOTE_RGB = [[74, 156, 98], [180, 96, 62], [118, 128, 150], [186, 158, 86], [108, 196, 206], [100, 154, 206], [154, 112, 200], [124, 114, 134]];   // js/skies14.js NOTES, in order
  // the eight notes (approved 22 Nov): along the Chord from its western end (Growth) to its eastern, the Spire of Decay's end
  const NOTES = [];
  for (let k = 0; k < 8; k++) {
    const l = 146 - k * 20.5, b = (hh(k, 1, 91) - 0.5) * 2.6, ae = fromGal(l, b);
    const c = NOTE_RGB[k], m = Math.max(c[0], c[1], c[2]);
    NOTES.push({ l, b, az: ae.az, el: ae.el, rgb: [0.72 + 0.28 * c[0] / m, 0.72 + 0.28 * c[1] / m, 0.72 + 0.28 * c[2] / m], mag: 0.34 });
  }
  // the dozen brightest, each with a one-pixel cross glint
  const BRIGHT = [];
  for (let k = 0; k < 12; k++) BRIGHT.push({ az: hh(k, 1, 97) * TAU - Math.PI, el: (8 + hh(k, 2, 97) * 62) * D2R, mag: 0.6 + hh(k, 3, 97) * 0.2, cls: hh(k, 4, 97) < 0.6 ? 0 : hh(k, 4, 97) < 0.85 ? 1 : 2 });
  const STAR_RGB = [[0.93, 0.95, 1.0], [0.7, 0.8, 1.0], [1.0, 0.82, 0.6]];

  // ---------------------------------------------------------------- the map
  const MAP = { data: null, row: 0, ready: false, built: 0 };
  const COSAZ = new Float64Array(W), SINAZ = new Float64Array(W);
  for (let i = 0; i < W; i++) { const az = (i + 0.5) / W * TAU - Math.PI; COSAZ[i] = Math.cos(az); SINAZ[i] = Math.sin(az); }
  const stats = { map: { coreMax: 0, bandMean: 0, galaxyMax: 0, stars: 0, bandN: 0, bandSum: 0 }, slices: 0 };
  const enc8 = (v) => clamp(Math.round(v), 0, 255);
  function putStar(i, j, r, g, b, gate, ph) {
    if (j < 0 || j >= H) return;
    i = ((i % W) + W) % W; const o = (j * W + i) * 4, D = MAP.data;
    const old = Math.max(D[o + 2] & 255, D[o + 2] >> 8, D[o + 3] & 255), nb = Math.max(r, g, b) * 255;
    if (old >= nb) return;
    D[o + 2] = enc8(r * 255) | (enc8(g * 255) << 8);
    D[o + 3] = enc8(b * 255) | ((gate & 3) << 8) | ((ph & 63) << 10);
  }
  function buildRow(j, i0, i1) {
    const D = MAP.data, el = (j + 0.5) / ROWK, cosE = Math.cos(el), sE = Math.sin(el), M = stats.map;
    const wide = el > 55 * D2R ? Math.max(1, Math.round(1 / cosE)) : 1;
    for (let i = i0; i < i1; i++) {
      const az = (i + 0.5) / W * TAU - Math.PI, dx = COSAZ[i] * cosE, dy = SINAZ[i] * cosE, dz = sE;
      const l = Math.atan2(dx * V[0] + dy * V[1] + dz * V[2], dx * U[0] + dy * U[1] + dz * U[2]) * R2D, b = Math.asin(clamp(dx * N[0] + dy * N[1] + dz * N[2], -1, 1)) * R2D;
      let r = 0, g = 0, bl = 0, river = 0, prof = 0, T = 1;
      if (Math.abs(b) < 26) {
        const bb = b - meander(l), sg = sigmaOf(l) * (0.8 + 0.45 * fbm(l, bb, 6, 13, 2));
        prof = Math.exp(-0.5 * (bb / sg) * (bb / sg));
        const tf = fbm(l, b, 3, 17, 4), tex = 0.35 + 1.25 * tf * tf * 1.6;
        const bulge = 0.17 * Math.exp(-0.5 * ((l / 8.5) * (l / 8.5) + (b / 5) * (b / 5)));
        let knots = 0; for (const k of KNOTS) { const dl = l - k.l, db = b - k.b; if (dl > 8 || dl < -8) continue; knots += k.a * Math.exp(-(dl * dl + db * db) / (2 * k.s * k.s)); }
        let rose = 0; for (const k of ROSE) { const dl = l - k.l, db = b - k.b; if (dl > 2 || dl < -2) continue; rose += k.a * Math.exp(-(dl * dl + db * db) / (2 * k.s * k.s)); }
        T = laneT(l, b);
        const disk = diskOf(l) * prof;
        const I = (disk * tex + bulge + knots * (0.4 + 0.6 * prof)) * T;
        const grain = 0.72 + 0.56 * hh(i, j, 3);
        const wc = bulge / (disk + bulge + knots + 1e-6);
        // the arms silver-blue, the core warm cream; the far arms with a faint teal on one side of the lane, violet on the other
        const far = smooth(55, 120, Math.abs(l)) * 0.45, side = fbm(l, b, 24, 19, 1) > 0.5;
        let cr = 0.8 + 0.2 * wc, cg = 0.87 + 0.05 * wc, cb = 1.0 - 0.24 * wc;
        if (far > 0) { if (side) { cr -= 0.12 * far; cg += 0.06 * far; cb -= 0.04 * far; } else { cr += 0.04 * far; cg -= 0.1 * far; } }
        r = I * grain * cr; g = I * grain * cg; bl = I * grain * cb;
        r += rose * T * 1.0; g += rose * T * 0.5; bl += rose * T * 0.64;
        river = (disk * (0.85 + 0.3 * (tex - 1)) + bulge + knots * 0.7) * (1 - 0.4 * (1 - T));
        const lum = r * 0.3 + g * 0.59 + bl * 0.11;
        if (lum > 0.31) { const k = 0.31 / lum; r *= k; g *= k; bl *= k; }
        if (lum > M.coreMax) M.coreMax = Math.min(0.31, lum);
        if (Math.abs(b) < 4 && l > -15 && l < 150) { M.bandSum += Math.min(0.31, lum); M.bandN++; }
      }
      for (const G of GALAXIES) { const c = galaxyAt(G, dx, dy, dz); if (c) { r += c[0]; g += c[1]; bl += c[2]; const L = c[0] * 0.3 + c[1] * 0.59 + c[2] * 0.11; if (L > M.galaxyMax) M.galaxyMax = L; } }
      const o = (j * W + i) * 4;
      D[o] = enc8(r / DS * 255) | (enc8(g / DS * 255) << 8);
      D[o + 1] = enc8(bl / DS * 255) | (enc8(river / DS * 255) << 8);
      // the field: as many on the sky to a square degree everywhere, thickening toward the band, thinning in the lanes
      const p = cosE * (0.0042 + 0.034 * Math.min(1, prof + Math.exp(-0.5 * ((l / 12) * (l / 12) + (b / 7) * (b / 7)))) * T);
      if (hh(i, j, 11) < p) {
        const u = hh(i, j, 12), m = (0.05 + 0.5 * Math.pow(u, 5)) * (0.35 + 0.65 * T), cu = hh(i, j, 13), cls = cu < 0.7 ? 0 : cu < 0.9 ? 1 : 2, c = STAR_RGB[cls];
        const ph = (hh(i, j, 14) * 63) | 0;
        for (let k = 0; k < wide; k++) putStar(i + k, j, c[0] * m, c[1] * m, c[2] * m, m > 0.15 ? 1 : 2, ph);
        M.stars++;
      }
    }
  }
  function finish() {
    const tex = (ae, f) => { const i = Math.floor((ae.az / TAU + 0.5) * W), j = Math.floor(ae.el * ROWK); return [i, j]; };
    for (let k = 0; k < BRIGHT.length; k++) {
      const s = BRIGHT[k], [i, j] = tex(s), c = STAR_RGB[s.cls], m = s.mag, ph = (hh(k, 9, 97) * 62) | 0;
      putStar(i, j, c[0] * m, c[1] * m, c[2] * m, 1, ph);
      for (const [di, dj] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) putStar(i + di, j + dj, c[0] * m * 0.32, c[1] * m * 0.32, c[2] * m * 0.32, 1, ph);
    }
    for (let k = 0; k < NOTES.length; k++) { const s = NOTES[k], [i, j] = tex(s); putStar(i, j, s.rgb[0] * s.mag, s.rgb[1] * s.mag, s.rgb[2] * s.mag, 1, (hh(k, 3, 91) * 62) | 0); }
    const M = stats.map; M.bandMean = M.bandN ? M.bandSum / M.bandN : 0;
    MAP.ready = true; MAP.built++; MAP.gen = (MAP.gen || 0) + 1; lore.key = null;
  }
  function reset() { MAP.data = new Uint16Array(W * H * 4); MAP.row = 0; MAP.col = 0; MAP.ready = false; Object.assign(stats.map, { coreMax: 0, bandMean: 0, galaxyMax: 0, stars: 0, bandN: 0, bandSum: 0 }); lore.saved = null; lore.key = null; }
  // a slice: eight rows, or fewer if the clock says three milliseconds have gone
  // a slice: up to 4096 texels, or fewer if the clock says two and a half milliseconds have gone
  function slice() {
    if (MAP.ready) return true;
    if (!MAP.data) reset();
    const t0 = performance.now();
    for (let n = 0; n < 32 && MAP.row < H; n++) {
      const i0 = MAP.col || 0, i1 = Math.min(W, i0 + 128);
      buildRow(MAP.row, i0, i1);
      if (i1 >= W) { MAP.row++; MAP.col = 0; } else MAP.col = i1;
      if (performance.now() - t0 > 2) break;
    }
    stats.slices++;
    if (MAP.row >= H) finish();
    return MAP.ready;
  }
  function build() { while (!slice()) { /* all of it now */ } syncLore(); return MAP; }
  function hash() { const D = MAP.data; if (!D) return ''; let h = 2166136261; for (let i = 0; i < D.length; i++) { h ^= D[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }

  // ---------------------------------------------------------------- the stones' stars (window.STARLORE113)
  const lore = { key: null, saved: null, cons: [], wand: [], byId: {} };
  const fin = (v) => typeof v === 'number' && isFinite(v);
  function readLore() {
    let t = null; try { t = typeof window !== 'undefined' ? window.STARLORE113 : (typeof STARLORE113 !== 'undefined' ? STARLORE113 : null); } catch (e) { t = null; }
    return t && typeof t === 'object' ? t : null;
  }
  function parseLore(t) {
    const cons = [], wand = [], byId = {};
    const hue = (h) => (Array.isArray(h) && h.length >= 3 && h.every(fin) ? [clamp(h[0], 0, 1), clamp(h[1], 0, 1), clamp(h[2], 0, 1)] : null);
    const star = (s) => (s && fin(s.az) && fin(s.el) ? { az: s.az, el: s.el, mag: fin(s.mag) ? clamp(s.mag, 0, 1) : 0.5, hue: hue(s.hue) } : null);
    if (t && Array.isArray(t.cons)) for (const c of t.cons) {
      if (!c || typeof c.id !== 'string' || !Array.isArray(c.stars)) continue;
      const stars = c.stars.map(star); if (!stars.length || stars.some((s) => !s)) continue;
      const lines = Array.isArray(c.lines) ? c.lines.filter((p) => Array.isArray(p) && p.length === 2 && stars[p[0]] && stars[p[1]]) : [];
      const C = { id: c.id, stars, lines, kind: 'con' }; cons.push(C); byId[c.id] = C;
    }
    if (t && Array.isArray(t.wanderers)) for (const w of t.wanderers) {
      const s = w && typeof w.id === 'string' ? star(w) : null; if (!s) continue;
      const C = { id: w.id, stars: [s], lines: [], kind: 'wanderer' }; wand.push(C); byId[w.id] = C;
    }
    return { cons, wand, byId };
  }
  const STEADY = 63;
  // lay the table's stars into the map (restoring what they covered first); called when the table object changes
  function syncLore() {
    const t = readLore();
    if (t === lore.key && lore.parsed) return false;
    lore.key = t;
    const P = parseLore(t); lore.cons = P.cons; lore.wand = P.wand; lore.byId = P.byId; lore.parsed = true;
    if (!MAP.ready) return true;
    const D = MAP.data;
    if (lore.saved) { for (const [o, b, a] of lore.saved) { D[o + 2] = b; D[o + 3] = a; } lore.saved = null; }
    const saved = [];
    const put = (i, j, rgb, k, ph) => {
      if (j < 0 || j >= H) return; i = ((i % W) + W) % W; const o = (j * W + i) * 4;
      saved.push([o, D[o + 2], D[o + 3]]);
      D[o + 2] = enc8(rgb[0] * k * 255) | (enc8(rgb[1] * k * 255) << 8); D[o + 3] = enc8(rgb[2] * k * 255) | (3 << 8) | (ph << 10);
    };
    for (const C of lore.cons.concat(lore.wand)) for (let n = 0; n < C.stars.length; n++) {
      const s = C.stars[n]; if (s.el < 0) continue;
      const i = Math.floor((s.az / TAU + 0.5) * W), j = Math.floor(s.el * ROWK), rgb = s.hue || [0.95, 0.96, 1.0], k = 0.28 + 0.62 * s.mag;
      const ph = C.kind === 'wanderer' ? STEADY : (hh(n, i, 101) * 62) | 0;
      if (C.kind === 'wanderer') { put(i, j, rgb, k, ph); for (const [di, dj] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(i + di, j + dj, rgb, k * 0.55, ph); }
      else { put(i, j, rgb, k, ph); if (s.mag > 0.55) for (const [di, dj] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) put(i + di, j + dj, rgb, k * 0.3, ph); }
    }
    lore.saved = saved.reverse();   // restored last-written first, so the map comes back exactly
    GLS.dirty = true;
    return true;
  }
  function relore() { lore.key = undefined; lore.parsed = false; syncLore(); }

  // ---------------------------------------------------------------- how dark is here
  // the weather the engine was last given (Engine.setWeather is wrapped, not edited)
  const WX = { haze: 0, cloud: 0, flash: 0, dark: 0 };
  try {
    if (typeof Engine !== 'undefined' && Engine.setWeather) {
      const _sw = Engine.setWeather;
      Engine.setWeather = function (v) { try { if (v) { WX.haze = clamp(+v.haze || 0, 0, 0.6); WX.cloud = clamp(+v.cloud || 0, 0, 1); WX.dark = clamp(+v.dark || 0, 0, 0.6); WX.flash = (typeof GFX !== 'undefined' && GFX.noFlash) ? 0 : clamp(+v.flash || 0, 0, 1); } } catch (e) { /* keep the last */ } return _sw.apply(this, arguments); };
    }
  } catch (e) { warnOnce('weather', e); }
  // the kind of place: a city with lit streets, a hamlet's few windows; the towns are js/towns108.js's (a town's windows)
  const KIND = { oakhaven: 0.6, whispergrove: 0.5, p31_bellyard: 0.5, cantabile_harbour: 0.55, clearing: 0.06, cantabile_cay: 0.06, p30_hollow: 0.1 };
  const TOWN_GLOW = 0.28;
  const LIGHT_K = (e) => { const sp = e.sprite; if (sp === 'lamp') return e.glow === undefined || e.glow > 0.05 ? 1 : 0; if (sp === 'campfire' || sp === 'hearth') return 1.3; if (sp === 'kaelen' || e.item === 'shard' || e.item === 'core' || e.glassLamp) return 0.4; if (sp === 'basin' || sp === 'loom' || sp === 'web' || sp === 'cocoon') return 0.3; if (sp === 'cores' || sp === 'coil' || e.type === 'aegis' || e.lightCol) return 0.4; return 0; };
  const starless = (m) => { const id = m && typeof m === 'object' ? m.id : m; return typeof id === 'string' && /^p1(00|13)_/.test(id); };
  function curMap() { try { if (typeof G !== 'undefined' && G.maps && G.mapId && G.maps[G.mapId]) return G.maps[G.mapId]; } catch (e) { /* none */ } return null; }
  function moonPart(tod, day, cloud) {
    const elev = Math.cos((tod - 0.5) * TAU);
    if (!(elev < 0.02)) return 1;
    const idx = ((((day | 0) + 3) % 8) + 8) % 8;
    const ill = (typeof GFX === 'undefined' || GFX.moonPhase !== false) ? (1 - Math.cos(idx * Math.PI / 4)) / 2 : 1;
    const mEl = Math.max(0.12, Math.asin(clamp(-elev, -1, 1)) * 0.74);
    return 1 - 0.34 * ill * smooth(0.05, 0.9, Math.sin(mEl)) * clamp(1 - cloud, 0, 1);
  }
  // star visibility as the old sky has it (night, cloud, haze, flash): 0..1
  function skyVis(m, tod, wx) {
    if (!m || !m.outdoor || starless(m)) return 0;
    const elev = Math.cos((tod - 0.5) * TAU), night = 1 - smooth(-0.2, 0.05, elev);
    if (night <= 0) return 0;
    const clear = clamp(1 - Math.max(0, (wx.cloud || 0) - 0.08) * 2.2, 0, 1) * clamp(1 - (wx.haze || 0) * 3, 0, 1) * (1 - clamp(wx.flash || 0, 0, 1));
    return night * clear;
  }
  function glowAt(m, x, y) {
    let ents = null; try { ents = typeof G !== 'undefined' && G.mapId === m.id && G.ents ? G.ents : m.entities; } catch (e) { ents = m.entities; }
    let sum = 0, near = 1e9, n = 0;
    if (ents) for (let i = 0; i < ents.length; i++) {
      const e = ents[i]; if (!e || e.hidden || e.dead) continue;
      const k = LIGHT_K(e); if (!k) continue; n++;
      const d = Math.hypot(e.x - x, e.y - y); if (d < near) near = d;
      if (d < 30) { const f = 1 - d / 30; sum += k * f * f; }
    }
    let kind = KIND[m.id]; if (kind === undefined) kind = (typeof TOWNS108 !== 'undefined' && TOWNS108.TOWNS && TOWNS108.TOWNS[m.id]) ? TOWN_GLOW : 0;
    const nearK = n ? clamp(1 - (near - 6) / 30, 0, 1) : 1;
    return 1 - (1 - kind * nearK) * Math.exp(-0.32 * sum);
  }
  // darkness: 0 a lit street .. 1 the open wild on a moonless clear night; s: { map, tod, wx, x, y, day } (default: now)
  function darknessOf(s) {
    const m = s.map; if (!m || !m.outdoor || m.bright || starless(m)) return 0;
    const sv = skyVis(m, s.tod, s.wx); if (sv <= 0) return 0;
    return clamp(sv * moonPart(s.tod, s.day, s.wx.cloud || 0) * (1 - glowAt(m, s.x, s.y)), 0, 1);
  }
  function nowState(F) {
    const m = F && F.map ? F.map : curMap();
    const tod = F && F.tod != null ? F.tod : (typeof G !== 'undefined' ? G.tod : 0.5);
    const wx = F && F.wx ? F.wx : (F && F.env && F.env.wx ? F.env.wx : WX);
    const cam = F && F.cam ? F.cam : (typeof Engine !== 'undefined' ? Engine.cam : { x: 0, y: 0 });
    return { map: m, tod, wx, x: cam.x, y: cam.y, day: typeof G !== 'undefined' ? G.day | 0 : 0 };
  }
  function darkness(F) { try { return darknessOf(nowState(F)); } catch (e) { warnOnce('darkness', e); return 0; } }

  // ---------------------------------------------------------------- the Spire of Decay's quarter
  // Book One: "the Spire of Decay's end of the sky had that faint wrongness to it". The game's painted continent
  // (js/travel.js TRAVEL_REALMS, img/map_continent.jpg, 1440 x 960) has the Rift, where the Gate of Decay was drilled,
  // due east of the Reach; on the Reach's maps (js/bearings82b.js's chart of the Reach) a patch twenty degrees wide, low
  // over that bearing, holds its stars still and its star-dust a shade greyer
  const SPIRE = { az: null, el: 15 * D2R, half: 10 * D2R };
  try {
    if (typeof TRAVEL_REALMS !== 'undefined') {
      const R = TRAVEL_REALMS.find((r) => r.id === 'reach'), F2 = TRAVEL_REALMS.find((r) => r.id === 'rift');
      if (R && F2) SPIRE.az = Math.atan2((F2.c[1] - R.c[1]) * 960, (F2.c[0] - R.c[0]) * 1440);
    }
  } catch (e) { SPIRE.az = null; }
  let reachKey = '', reachSet = null;
  function inReach(id) {
    try {
      if (typeof BEARINGS82B === 'undefined' || !BEARINGS82B.layoutRegion || typeof G === 'undefined' || !G.maps) return false;
      const k = Object.keys(G.maps).length + ':' + (BEARINGS82B.L && BEARINGS82B.L.lay && BEARINGS82B.L.lay.reach ? 1 : 0);
      if (k !== reachKey) {
        reachKey = k;
        const lay = (BEARINGS82B.L && BEARINGS82B.L.lay && BEARINGS82B.L.lay.reach) || BEARINGS82B.layoutRegion(G.maps, 'reach', typeof TRAVEL_REGIONS !== 'undefined' ? TRAVEL_REGIONS.reach : null);
        reachSet = lay && lay.places ? new Set(Object.keys(lay.places)) : null;
      }
      return !!(reachSet && reachSet.has(id));
    } catch (e) { warnOnce('reach', e); return false; }
  }
  // for js/sky.js and js/light21.js's own stars: the quarter on this frame's map, only with the switch on (else null)
  function stillQuarter(F) { if (!on() || !F || !F.map) return null; const sp = spire(F.map.id); return sp ? { az: sp.az, half: sp.half, tanTop: Math.tan(SPIRE.el) } : null; }
  function spire(id) { return SPIRE.az != null && inReach(id) ? { az: SPIRE.az, el: SPIRE.el * 0.5, half: SPIRE.half, top: SPIRE.el } : null; }

  // ---------------------------------------------------------------- shooting stars
  // a deterministic schedule on the animation clock, as js/sky.js schedules the Kestrel: one chance in each 50 s bucket
  const MET = { bucket: 50, p: 0.32 };
  function meteorOf(k) {
    if (k < 1 || hh(k, 0, 77) >= MET.p) return null;
    const t0 = k * MET.bucket + hh(k, 1, 77) * 40, dur = 0.45 + 0.5 * hh(k, 2, 77);
    const az = hh(k, 3, 77) * TAU - Math.PI, el = (24 + hh(k, 4, 77) * 30) * D2R, len = (9 + hh(k, 5, 77) * 12) * D2R;
    const ang = (20 + hh(k, 6, 77) * 45) * D2R, side = hh(k, 7, 77) < 0.5 ? -1 : 1;
    return { k, t0, dur, az0: az, el0: el, az1: az + side * len * Math.cos(ang) / Math.cos(el), el1: el - len * Math.sin(ang), b: 0.55 + 0.3 * hh(k, 8, 77) };
  }
  function meteors(t0, t1) { const out = []; for (let k = Math.floor(t0 / MET.bucket); k <= Math.floor(t1 / MET.bucket); k++) { const m = meteorOf(k); if (m && m.t0 + m.dur >= t0 && m.t0 <= t1) out.push(m); } return out; }
  // where the one in flight at time t is: its head and the end of its tail
  function meteorAt(t) {
    if (!fin(t)) return null;
    const m = meteorOf(Math.floor(t / MET.bucket)); if (!m || t < m.t0 || t > m.t0 + m.dur) return null;
    const u = (t - m.t0) / m.dur, ut = Math.max(0, u - 0.4), L = (a, b, f) => a + (b - a) * f;
    return { t0: m.t0, u, az: L(m.az0, m.az1, u), el: L(m.el0, m.el1, u), taz: L(m.az0, m.az1, ut), tel: L(m.el0, m.el1, ut), b: m.b * Math.sin(Math.PI * Math.min(1, u * 1.15)) };
  }

  // ---------------------------------------------------------------- the frame's numbers, shared by both views
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5], BTH = new Float32Array(BAY.map((v) => (v + 0.5) / 16));
  const last = { d: 0, sv: 0, river: 0, deep: 0, px: 0, spirePx: 0, meteor: 0 };
  let draws = 0;
  // rows: Engine.render is wrapped so `last` speaks of the frame just drawn in either view
  try {
    if (typeof Engine !== 'undefined' && Engine.render) {
      const _r = Engine.render;
      Engine.render = function () { last.px = 0; last.spirePx = 0; last.meteor = 0; last.river = 0; last.deep = 0; last.d = 0; last.sv = 0; return _r.apply(this, arguments); };
    }
  } catch (e) { warnOnce('render', e); }
  function frameK(F) {
    const s = nowState(F);
    const d = darknessOf(s), sv = (s.map && !s.map.bright) ? skyVis(s.map, s.tod, s.wx) : 0;
    last.d = d; last.sv = sv; last.river = smooth(0.35, 0.75, d); last.deep = smooth(0.75, 0.92, d);
    return { d, sv, s };
  }

  // ---------------------------------------------------------------- the classic view (an Engine sky hook)
  let colI = new Int16Array(0), colSp = new Uint8Array(0), cKey = '';
  let rowJ = new Int16Array(0), rowExt = new Float32Array(0), rowAmp = new Float32Array(0), rowSp = new Uint8Array(0), rKey = '';
  function drawClassic(F) {
    if (!F || !F.outdoor) return;
    if (starless(F.map) || !on()) return;
    const id = F.map && F.map.id, sp = spire(id);
    const K = frameK(F), d = K.d, sv = K.sv;
    if (d <= 0 && sv <= 0) return;
    if (!MAP.ready) { slice(); if (!MAP.ready) return; }
    syncLore();
    DEEPSKY113.lastFrame = F; draws++;
    const { fb, mbuf, w, h, S, horizon } = F;
    const yEnd = Math.min(horizon, h); if (yEnd <= 0) return;
    const ck = w + ':' + F.dirX + ':' + F.dirY + ':' + F.planeX + ':' + F.planeY + ':' + (sp ? sp.az : 'n');
    if (ck !== cKey) {
      if (colI.length !== w) { colI = new Int16Array(w); colSp = new Uint8Array(w); }
      for (let x = 0; x < w; x++) {
        const cx = 2 * (x + 0.5) / w - 1, az = Math.atan2(F.dirY + F.planeY * cx, F.dirX + F.planeX * cx);
        colI[x] = (((Math.floor((az / TAU + 0.5) * W)) % W) + W) % W;
        colSp[x] = sp && Math.abs(((az - sp.az + Math.PI) % TAU + TAU) % TAU - Math.PI) < sp.half ? 1 : 0;
      }
      cKey = ck;
    }
    const rk = horizon + ':' + h + ':' + S;
    if (rk !== rKey) {
      if (rowJ.length !== h) { rowJ = new Int16Array(h); rowExt = new Float32Array(h); rowAmp = new Float32Array(h); rowSp = new Uint8Array(h); }
      for (let y = 0; y < h; y++) {
        if (y >= horizon) { rowJ[y] = -1; continue; }
        const el = Math.atan((horizon - y - 0.5) / (S * FX)), se = Math.sin(el);
        rowJ[y] = Math.min(H - 1, Math.floor(el * ROWK)); rowExt[y] = smooth(0.0, 0.16, se); rowAmp[y] = 0.18 + 0.4 * (1 - smooth(0, 0.35, se)); rowSp[y] = el < SPIRE.el ? 1 : 0;
      }
      rKey = rk;
    }
    const Dd = MAP.data, riv = last.river, dp = last.deep, t = F.animT || 0;
    const thr = (1 - d) * 0.55;
    // the dust and the river at 0..255 for one unit of the map's diffuse channels
    const U = DS, rr = 0.86 * U, rg = 0.9 * U, rb = 1.0 * U;
    let n = 0, nsp = 0;
    for (let y = 0; y < yEnd; y++) {
      const j = rowJ[y]; if (j < 0) continue;
      const ext = rowExt[y]; if (ext <= 0) continue;
      const base = j * W, by = ((((y / S) | 0) & 3) << 2), amp = rowAmp[y], rsp = rowSp[y];
      let o = y * w;
      for (let x = 0; x < w; x++, o++) {
        if (mbuf[o] !== 1) continue;
        const ti = (base + colI[x]) << 2, a = Dd[ti], b = Dd[ti + 1], c = Dd[ti + 2], e = Dd[ti + 3];
        if ((a | b | c | e) === 0) continue;
        let ar = 0, ag = 0, ab = 0;
        if (riv > 0 && (a | b)) {
          const river = b >> 8, k1 = riv * (1 - dp), k2 = riv * dp;
          ar = (rr * river * k1 + (a & 255) * U * k2); ag = (rg * river * k1 + (a >> 8) * U * k2); ab = (rb * river * k1 + (b & 255) * U * k2);
        }
        const isSp = rsp && colSp[x];
        if (isSp) { const L = (ar * 0.3 + ag * 0.59 + ab * 0.11) * 0.9; ar += (L - ar) * 0.65; ag += (L - ag) * 0.65; ab += (L - ab) * 0.65; nsp++; }
        if (c | (e & 255)) {
          const gate = (e >> 8) & 3, ph = e >> 10;
          const sr = c & 255, sg = c >> 8, sb = e & 255;
          let sk = gate === 1 ? riv : gate === 2 ? dp : 0;
          if (gate === 3) { const m = Math.max(sr, sg, sb) / 255; sk = sv * clamp((m - thr) / 0.2, 0, 1); }
          if (sk > 0) {
            let tw = 1;
            if (!isSp && ph !== STEADY) { const pr = ph / 64 * TAU; tw = 1 - amp * (gate === 3 ? 0.35 : 1) * (0.5 + 0.5 * Math.sin(t * (1.3 + 2.6 * ((ph * 0.618) % 1)) + pr)); }
            const f = sk * tw; ar += sr * f; ag += sg * f; ab += sb * f;
          }
        }
        if (ar + ag + ab <= 0) continue;
        const px = fb[o], pr0 = px & 255, pg0 = (px >> 8) & 255, pb0 = (px >> 16) & 255;
        let allow = 1.3 - (pr0 + pg0 + pb0) * 0.0043573; if (allow <= 0) continue; if (allow > 1) allow = 1;   // 1 - (lum - 0.09) / 0.3
        const al = allow * ext * 0.25, bt = BTH[by | (((x / S) | 0) & 3)];
        const qr = ((ar * al + bt) | 0) << 2, qg = ((ag * al + bt) | 0) << 2, qb = ((ab * al + bt) | 0) << 2;
        if (!(qr | qg | qb)) continue;
        const R = pr0 + qr, Gc = pg0 + qg, B = pb0 + qb;
        fb[o] = (255 << 24) | ((B > 255 ? 255 : B) << 16) | ((Gc > 255 ? 255 : Gc) << 8) | (R > 255 ? 255 : R);
        n++;
      }
    }
    last.px = n; last.spirePx = nsp;
    // a shooting star: a short dithered streak, its head brightest, drawn only on sky pixels
    if (dp > 0) {
      const M = meteorAt(t);
      if (M) {
        const pl = Math.hypot(F.planeX, F.planeY);
        const proj = (az, el) => { const cA = Math.cos(az), sA = Math.sin(az), fwd = cA * F.dirX + sA * F.dirY; if (fwd < 0.2) return null; const camX = (-cA * F.dirY + sA * F.dirX) / (fwd * pl); return [(camX + 1) * 0.5 * w, horizon - Math.tan(el) * FX * S]; };
        const ph = proj(M.az, M.el), pt = proj(M.taz, M.tel);
        if (ph && pt) {
          const steps = Math.max(2, Math.ceil(Math.hypot(ph[0] - pt[0], ph[1] - pt[1]) / S * 1.5));
          let mn = 0;
          for (let k = 0; k <= steps; k++) {
            const f = k / steps, x0 = Math.floor((pt[0] + (ph[0] - pt[0]) * f) / S) * S, y0 = Math.floor((pt[1] + (ph[1] - pt[1]) * f) / S) * S;
            const v = M.b * dp * (0.15 + 0.85 * f * f) * 255 * rowExtAt(y0, horizon, S);
            for (let dy = 0; dy < S; dy++) for (let dx = 0; dx < S; dx++) {
              const xx = x0 + dx, yy = y0 + dy; if (xx < 0 || xx >= w || yy < 0 || yy >= yEnd) continue;
              const o = yy * w + xx; if (mbuf[o] !== 1) continue;
              const bt = (BAY[((((yy / S) | 0) & 3) << 2) | (((xx / S) | 0) & 3)] + 0.5) / 16, q = Math.floor(v / 8 + bt) * 8; if (q <= 0) continue;
              const px = fb[o], R = (px & 255) + q * 0.92, Gc = ((px >> 8) & 255) + q * 0.95, B = ((px >> 16) & 255) + q;
              fb[o] = (255 << 24) | ((B > 255 ? 255 : B | 0) << 16) | ((Gc > 255 ? 255 : Gc | 0) << 8) | (R > 255 ? 255 : R | 0); mn++;
            }
          }
          last.meteor = mn;
        }
      }
    }
  }
  const rowExtAt = (y, horizon, S) => { if (y >= horizon) return 0; return smooth(0.0, 0.16, Math.sin(Math.atan((horizon - y) / (S * FX)))); };
  try { if (typeof Engine !== 'undefined' && Engine.addSkyHook) Engine.addSkyHook((F) => { try { drawClassic(F); } catch (e) { warnOnce('classic', e); } }, 15); } catch (e) { warnOnce('hook', e); }

  // ---------------------------------------------------------------- the 3D view (js/light21.js's sky pass asks)
  const GLS = { gl: null, tex: null, dirty: true, gen: -1 };
  function resetGL() { GLS.gl = null; GLS.tex = null; GLS.dirty = true; }
  // { tex, k: [darkness, star visibility, the Spire's bearing or -100, pixel scale], met: [head az, el, tail az, el] } or null
  function skyGL(gl, F) {
    if (!F || !F.outdoor || !on() || starless(F.map)) return null;
    const K = frameK(F); if (K.d <= 0 && K.sv <= 0) return null;
    if (!MAP.ready) { slice(); if (!MAP.ready) return null; }
    syncLore();
    if (GLS.gl !== gl || !GLS.tex) { GLS.gl = gl; GLS.tex = gl.createTexture(); GLS.dirty = true; gl.bindTexture(gl.TEXTURE_2D, GLS.tex); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE); GLS.gen = -1; }
    if (GLS.dirty || GLS.gen !== MAP.gen) { gl.bindTexture(gl.TEXTURE_2D, GLS.tex); gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA16UI, W, H, 0, gl.RGBA_INTEGER, gl.UNSIGNED_SHORT, MAP.data); GLS.dirty = false; GLS.gen = MAP.gen; }
    draws++;
    const sp = spire(F.map && F.map.id);
    const t = (F.env && F.env.animT) || F.animT || 0;
    const M = last.deep > 0 ? meteorAt(t) : null;
    last.px = 1; last.meteor = M && M.b > 0 ? 1 : 0;
    const pxK = (typeof GFX !== 'undefined' && GFX.scale === 2) ? 2 : 1;
    return { tex: GLS.tex, k: [K.d, K.sv, sp ? sp.az : -100, pxK], met: M ? [M.az, M.el, M.taz, M.tel] : [0, -1, 0, -1], metB: M ? M.b : 0 };
  }

  // ---------------------------------------------------------------- the stones: dirOf, visible, drawChart
  function item(id) { syncLore(); return typeof id === 'string' && lore.byId[id] ? lore.byId[id] : null; }
  function middle(C) { let v = [0, 0, 0]; for (const s of C.stars) { const d = dirOfAE(s.az, s.el); v = [v[0] + d[0], v[1] + d[1], v[2] + d[2]]; } return aeOf(nrm(v)); }
  function dirOf(id) { const C = item(id); return C ? middle(C) : null; }
  function visible(id) {
    try {
      const C = item(id); if (!C) return 0;
      const s = nowState(null); if (!s.map || !s.map.outdoor || s.map.bright || starless(s.map)) return 0;
      const sv = skyVis(s.map, s.tod, s.wx); if (sv <= 0) return 0;
      const d = darknessOf(s), thr = (1 - d) * 0.55;
      let sum = 0;
      for (const st of C.stars) { if (st.el <= 0.02) continue; const m = Math.max(...(st.hue || [0.95, 0.96, 1])) * (0.28 + 0.62 * st.mag); sum += clamp((m - thr) / 0.2, 0, 1) * smooth(0.0, 0.16, Math.sin(st.el)); }
      return clamp(sv * sum / C.stars.length, 0, 1);
    } catch (e) { warnOnce('visible', e); return 0; }
  }
  // the zoomed picture through a stone: the same map's light (smoothly read, then dithered at a two-pixel art grain), the
  // same field stars, the figure's stars large with soft glints, its lines drawn in (opts.lines 0..1), a dark round sight
  function drawChart(ctx, id, x, y, w, h, opts) {
    try {
      const C = item(id); if (!C || !ctx || !(w > 0) || !(h > 0)) return false;
      opts = opts || {};
      if (!MAP.ready) build(); else syncLore();
      const lines = clamp(fin(opts.lines) ? opts.lines : 1, 0, 1);
      w = Math.round(w); h = Math.round(h);
      const mid = middle(C), cd = dirOfAE(mid.az, mid.el), ce = nrm(cross([0, 0, 1], cd)), cn = cross(cd, ce);
      // the figure framed with a margin: its spread in the tangent plane, at least six degrees across
      let ext = 3 * D2R;
      const pts = C.stars.map((s) => { const d = dirOfAE(s.az, s.el), z = dot(d, cd); const X = dot(d, ce) / z, Y = dot(d, cn) / z; ext = Math.max(ext, Math.abs(X) * h / w, Math.abs(Y)); return [X, Y]; });
      const scale = (h * 0.5 * 0.72) / ext;   // pixels a unit of the tangent plane
      const P = 2, cw = Math.ceil(w / P), ch = Math.ceil(h / P), img = ctx.createImageData(w, h), out = img.data;
      const Dd = MAP.data, buf = new Float32Array(cw * ch * 3);
      const toDir = (px, py) => { const X = (px - w / 2) / scale, Y = (h / 2 - py) / scale; return nrm([cd[0] + X * ce[0] + Y * cn[0], cd[1] + X * ce[1] + Y * cn[1], cd[2] + X * ce[2] + Y * cn[2]]); };
      const toPx = (d) => { const z = dot(d, cd); if (z <= 0.05) return null; return [w / 2 + dot(d, ce) / z * scale, h / 2 - dot(d, cn) / z * scale]; };
      const dust = (fi, fj, c) => { const i = ((fi % W) + W) % W, j = clamp(fj, 0, H - 1), o = (j * W + i) * 4; return c === 0 ? (Dd[o] & 255) : c === 1 ? (Dd[o] >> 8) : (Dd[o + 1] & 255); };
      // the light behind, read smoothly (bilinear) so the zoom is not a mosaic of the map's texels
      for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
        const d = toDir(i * P + P / 2, j * P + P / 2), el = Math.asin(clamp(d[2], -1, 1)), az = Math.atan2(d[1], d[0]), q = (j * cw + i) * 3;
        if (el < 0) { buf[q] = 10; buf[q + 1] = 10; buf[q + 2] = 12; continue; }
        const fx = (az / TAU + 0.5) * W - 0.5, fy = el * ROWK - 0.5, ix = Math.floor(fx), iy = Math.floor(fy), ax = fx - ix, ay = fy - iy;
        const sky = [6 + 14 * (1 - Math.min(1, el * 3)), 8 + 14 * (1 - Math.min(1, el * 3)), 22 + 18 * (1 - Math.min(1, el * 3))];
        for (let c = 0; c < 3; c++) {
          const v = (dust(ix, iy, c) * (1 - ax) + dust(ix + 1, iy, c) * ax) * (1 - ay) + (dust(ix, iy + 1, c) * (1 - ax) + dust(ix + 1, iy + 1, c) * ax) * ay;
          buf[q + c] = sky[c] + v * DS * 1.25;
        }
      }
      // the field's own stars, as points on the art grid (the figure's, gate 3, are drawn large below)
      const R = Math.hypot(w, h) * 0.5 / scale, jr0 = Math.max(0, Math.floor((mid.el - R * 1.2) * ROWK)), jr1 = Math.min(H - 1, Math.ceil((mid.el + R * 1.2) * ROWK));
      const addPt = (cx, cy, r, g, b) => { const i = Math.floor(cx / P), j = Math.floor(cy / P); if (i < 0 || j < 0 || i >= cw || j >= ch) return; const q = (j * cw + i) * 3; buf[q] += r; buf[q + 1] += g; buf[q + 2] += b; };
      for (let j = jr0; j <= jr1; j++) {
        const el = (j + 0.5) / ROWK, span = Math.min(Math.PI, R * 1.3 / Math.max(0.05, Math.cos(el)));
        const i0 = Math.floor(((mid.az - span) / TAU + 0.5) * W), i1 = Math.ceil(((mid.az + span) / TAU + 0.5) * W);
        for (let ii = i0; ii <= i1; ii++) {
          const i = ((ii % W) + W) % W, o = (j * W + i) * 4, c = Dd[o + 2], e = Dd[o + 3]; if (!(c | (e & 255))) continue;
          if (((e >> 8) & 3) === 3) continue;
          const p = toPx(dirOfAE((i + 0.5) / W * TAU - Math.PI, el)); if (!p) continue;
          const k = 1.5, sr = (c & 255) * k, sg = (c >> 8) * k, sb = (e & 255) * k, m = Math.max(sr, sg, sb);
          addPt(p[0], p[1], sr, sg, sb);
          if (m > 200) for (const [dx, dy] of [[-P, 0], [P, 0], [0, -P], [0, P]]) addPt(p[0] + dx, p[1] + dy, sr * 0.3, sg * 0.3, sb * 0.3);
        }
      }
      // the lines: dotted pale gold, stopping short of each star
      const sp = pts.map(([X, Y]) => [w / 2 + X * scale, h / 2 - Y * scale]);
      if (lines > 0) for (const [a, b] of C.lines) {
        const A = sp[a], B = sp[b], L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L < 1) continue;
        const ra = 7 + 9 * C.stars[a].mag, rb = 7 + 9 * C.stars[b].mag;
        for (let s = ra; s < L - rb; s += P) {
          const f = s / L, i = Math.floor((A[0] + (B[0] - A[0]) * f) / P), j = Math.floor((A[1] + (B[1] - A[1]) * f) / P);
          if (i < 0 || j < 0 || i >= cw || j >= ch) continue;
          if ((BAY[((j & 3) << 2) | (i & 3)] + 0.5) / 16 > lines * 0.8) continue;   // fades in as a dither
          const q = (j * cw + i) * 3; buf[q] += 92 * lines; buf[q + 1] += 80 * lines; buf[q + 2] += 50 * lines;
        }
      }
      // the figure's stars: a bright core, a soft dithered halo, four glints (none for a wanderer: a small steady disc)
      for (let n = 0; n < C.stars.length; n++) {
        const s = C.stars[n], [px, py] = sp[n], col = s.hue || [0.95, 0.96, 1.0], wand = C.kind === 'wanderer';
        const core = wand ? 3 + 3 * s.mag : 2 + 3.5 * s.mag, halo = core * (wand ? 3 : 4.5), spike = wand ? 0 : 10 + 30 * s.mag, top = 255 * (0.65 + 0.35 * s.mag);
        const i0 = Math.floor((px - Math.max(halo, spike)) / P), i1 = Math.ceil((px + Math.max(halo, spike)) / P), j0 = Math.floor((py - Math.max(halo, spike)) / P), j1 = Math.ceil((py + Math.max(halo, spike)) / P);
        for (let j = j0; j <= j1; j++) for (let i = i0; i <= i1; i++) {
          if (i < 0 || j < 0 || i >= cw || j >= ch) continue;
          const dx = i * P + P / 2 - px, dy = j * P + P / 2 - py, r = Math.hypot(dx, dy);
          let v = r <= core ? 1 : Math.exp(-Math.pow((r - core) / (halo * 0.45), 2)) * 0.45;
          if (spike > 0) { const ax = Math.abs(dx), ay = Math.abs(dy); if (ay < P * 0.6 && ax < spike) v = Math.max(v, 0.55 * (1 - ax / spike)); if (ax < P * 0.6 && ay < spike) v = Math.max(v, 0.55 * (1 - ay / spike)); }
          if (v <= 0.01) continue;
          const q = (j * cw + i) * 3, wh = r <= core * 0.6 ? 0.5 : 0;   // the heart of a star burns toward white
          buf[q] += top * v * (col[0] + (1 - col[0]) * wh); buf[q + 1] += top * v * (col[1] + (1 - col[1]) * wh); buf[q + 2] += top * v * (col[2] + (1 - col[2]) * wh);
        }
      }
      // the sight: the stone's round opening, dark at its rim; then the whole quantised with the ordered dither
      const rx = cw / 2, ry = ch / 2, rim = Math.min(rx, ry) * 0.06;
      for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
        const q = (j * cw + i) * 3, ex = (i + 0.5 - rx) / rx, ey = (j + 0.5 - ry) / ry, rr = Math.sqrt(ex * ex * 0.55 + ey * ey * 0.45) * 1.08;
        const vig = 1 - smooth(0.86, 1.0, rr), bt = (BAY[((j & 3) << 2) | (i & 3)] + 0.5) / 16;
        const ring = rr > 1.0 ? 1 : 0;
        for (let c = 0; c < 3; c++) {
          let v = buf[q + c] * vig; if (ring) v = c === 0 ? 14 : c === 1 ? 12 : 11;
          v = Math.floor(v / 4 + bt) * 4; v = v > 255 ? 255 : v < 0 ? 0 : v;
          for (let dy = 0; dy < P; dy++) for (let dx = 0; dx < P; dx++) { const X = i * P + dx, Y = j * P + dy; if (X >= w || Y >= h) continue; const o = (Y * w + X) * 4; out[o + c] = v; out[o + 3] = 255; }
        }
        void rim;
      }
      ctx.putImageData(img, Math.round(x), Math.round(y));
      return true;
    } catch (e) { warnOnce('chart', e); return false; }
  }

  // ---------------------------------------------------------------- the Options row: "Deep night sky", Off / On
  const ROW = ['gfx-deepsky113', 'Deep night sky', 'the band of star-dust as a river of stars, and far galaxies, where the night is truly dark'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = on(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
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
          const after = document.getElementById('gfx-curve');
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

  // ---------------------------------------------------------------- what the tests and the tools read
  // a point inside a dust lane, a point of the band beside it, and a point of the sky well away from the band
  const LANE = (() => {
    let best = null;
    for (let l = -18; l <= 60; l += 0.5) {
      const c = lane1B(l), w = lane1W(l), lane = fromGal(l, c), beside = fromGal(l, c - w * 1.15 - 1.7);
      if (lane.el < 12 * D2R || lane.el > 23 * D2R || beside.el < 12 * D2R || laneT(l, c - w * 1.15 - 1.7) < 0.92 || laneT(l, c) > 0.1) continue;
      if (!best || w > best.w) best = { l, w, lane, beside };
    }
    if (!best) { const l = 35, c = lane1B(l); best = { l, w: lane1W(l), lane: fromGal(l, c), beside: fromGal(l, c - 3) }; }
    // away: low in the southern sky, well off the band and clear of the far galaxies
    let away = null;
    for (let a = 120; a <= 240 && !away; a += 5) {
      const p = { az: a * D2R, el: 16 * D2R }, d = dirOfAE(p.az, p.el);
      if (Math.abs(galOf(d)[1]) > 25 && GALAXIES.every((g) => dot(d, g.d) < Math.cos(14 * D2R))) away = { az: Math.atan2(Math.sin(p.az), Math.cos(p.az)), el: p.el };
    }
    return { l: best.l, lane: best.lane, beside: best.beside, away };
  })();
  const CORE = aeOf(U);

  return {
    FLAG, ROW, W, H, on, setOn, darkness, darknessOf, starless, spire, reset, slice, build, ready: () => MAP.ready, hash, stats, last,
    lastFrame: null, drawCount: () => draws, hooks: { classic: drawClassic }, skyGL, resetGL, map: () => MAP,
    stillQuarter, meteors, meteorAt, dirOf, visible, drawChart, relore,
    sample(az, el) { if (!MAP.ready) return null; const i = ((Math.floor((az / TAU + 0.5) * W) % W) + W) % W, j = clamp(Math.floor(el * ROWK), 0, H - 1), o = (j * W + i) * 4, D = MAP.data; return { dust: [(D[o] & 255) / 255 * DS, (D[o] >> 8) / 255 * DS, (D[o + 1] & 255) / 255 * DS], river: (D[o + 1] >> 8) / 255 * DS, star: [(D[o + 2] & 255) / 255, (D[o + 2] >> 8) / 255, (D[o + 3] & 255) / 255], gate: (D[o + 3] >> 8) & 3 }; },
    CORE, LANE, GALAXIES: GALAXIES.map((g) => ({ name: g.name, kind: g.kind, az: g.az, el: g.el, R: g.R })), NOTES, BRIGHT, SPIRE, N, galOf, fromGal,
  };
})();
if (typeof window !== 'undefined') window.DEEPSKY113 = DEEPSKY113;
