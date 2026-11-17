// ============================================================
//  cliffs96 — the Dawning Heights, part four: the Chalk Cliffs (Phase 96; plan: Phase 89:272, Phase 90:131, approved 14 Nov
//  2026; team B's design, 16 Nov).
//
//  WHAT THE BOOK MADE OF THE PLAN. The Chalk Cliffs are two lines of canon, both in Vol II: "Shadow remnants crawl up them
//  nightly. The Vigil rings a bell at dusk and the bell is the only thing that works" (Vol II:93) and "Shadow remnant. Up
//  the chalk cliffs at dusk" (Vol II:112). No book names them. A shadow remnant has no bestiary entry: no look, no harm, no
//  fear. So the remnant here is the least the place needs [PROPOSED]: a shadow with nothing to cast it, lying on the rock,
//  that climbs from dusk and does cold harm; weapons and songs do nothing to it; only the bell holds it. "Below the cloud
//  deck" is cut: Book Two has no cloud in the Heights. The peaks have their snow (Harvestmonth 419; BkII 523). There is no
//  Bleach here: the cliffs stand on the range, away from the city.
//
//  THE PLACE (Phase 90:131): the postern yard at the top, on the map's south edge against the Vigil's north wall (a lamp), the cliff path in switchbacks, three ledges, the foot.
//  THE TIMER: the Vigil's dusk bell, read from VIGIL96.bell (the one contract between the two modules) with a safe copy
//  here (localBell) behind a typeof guard. Twelve strokes, one every six seconds, from the engine's sunset (tod 0.75).
//  While it rings the remnants cannot climb: each stroke and they let go. When it stops, it is dark, and they come up the
//  path toward you at a walk. The yard is safe [PROPOSED]. Up from the foot before the last stroke: "the top before dark".
//
//  Flags (small ints): p96b_foot (the cairn taken), p96b_top (up before the last stroke, rewarded once), p96b_dark (caught on
//  the face at dark, to 99), p96b_cseen (bits: the once lines).
// ============================================================
'use strict';

const CLIFFS96 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p96_cliffs', VIGIL = 'p96_vigil';
  const W = 36, H = 150, DROP_Z = -40, SLOPE = 0.11;
  const hv = (vy) => -SLOPE * (H - vy);   // the top (the yard) is at the south edge
  const lvlAt = (j) => hv(j + 0.5);
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('cliffs96: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('The Chalk Cliffs'),                                          // Vol II:93
    doorVigil: S('The postern, back into Sun-Peak Vigil'),
    barred: S('Barred.'),
    arrive: S('A yard of trodden snow outside the Vigil\'s postern. Below it a path goes down the white face, ledge under ledge.'),
    ledge1: S('The first ledge.'), ledge2: S('The second ledge.'), ledge3: S('The third ledge.'),
    foot: S('The foot of the path. Past its edge the rock falls away again.'),
    reststone: S('A flat stone at the back of the ledge, worn smooth on top by people sitting.'),
    overhang: S('The rock leans out over the back of the ledge. Under it is a dry hollow, out of the wind.'),
    ring: S('An iron ring set deep in the rock, with a hand-rope tied to it going down the next stretch.'),
    cairn: S('A cairn of flat stones at the foot of the path. A name is cut in each stone, in many hands.'),
    cairnTake: S('Under the top stone, wrapped in oilcloth: twenty-five sovereigns and a tonic. You take them.'),
    cairnDone: S('The names. Nothing else.'),
    lamp: S('The postern lamp'),
    // the finger-posts at the two ends of the postern (js/bearings82b.js)
    postCliffs: S('A finger-post. SUN-PEAK VIGIL, up, by the postern.'),
    postVigil: S('A finger-post. THE CHALK CLIFFS, down, by the postern. Under it, smaller: be up before the last stroke.'),
    lampLabel: S('A lamp on an iron post by the postern, unlit. Stand by it to light it.'),
    lampLit: S('The lamp by the postern, burning. Use it to rest.'),
    // the bell, heard from above (Vol II:93: "The Vigil rings a bell at dusk")
    stroke: S('The dusk bell. {0} of twelve.'),
    seen: S('At the foot, shadows lie on the rock with nothing to cast them.'),
    letGo: S('Below, the shadows let go of the rock.'),
    dark: S('The last stroke. Dark.'),
    top: S('Up before the last stroke.'),
    // the shadow remnant (Vol II:93, 112: the name, and that they crawl up; the rest is [PROPOSED])
    remnant: S('Shadow Remnant'),
    remnantDesc: S('A shadow with nothing to cast it. It goes up the rock the way a shadow goes when the sun moves.'),
    cold: S('It is cold where it holds you.'),
    noHarm: S('The blow goes into it and out of the rock behind. Nothing.'),
    noSong: S('It does not listen.'),
  };

  // ================================================================ the plan (cells; x east, y south; the face goes down to the north)
  // The plan is written top-down (the yard at the top of the page, the face going down the page) and then turned north for
  // south as a whole, so that the yard and its postern lie on the SOUTH edge, against the Vigil's north wall, and the face
  // goes down to the NORTH (the map agrees with the ground: js/bearings82b.js). One transform, never number by number.
  const MY = (y) => H - y;                                  // a point
  const MJ = (j) => H - 1 - j;                              // a cell
  const MC = (j) => H - 2 - j;                              // the top cell of a two-cell block
  const MR = (r) => [r[0], MJ(r[3]), r[2], MJ(r[1])];       // a rectangle of cells
  const MPt = (p) => [p[0], MY(p[1])];
  const D = {
    arrive: [18.5, 3.5], door: [18, 1], vigilOut: [34.5, 2.6],
    yard: [10, 2, 26, 9], lamp: [13.5, 6.5],
    ledge1: [6, 40, 30, 46], ledge2: [6, 78, 30, 84], ledge3: [6, 114, 30, 120], foot: [4, 138, 32, 147],
    reststone: [7.6, 43.5], overhang: [6.7, 81.0], ring: [19.6, 120.8], cairn: [18.5, 143.5],
    lip: 10,
  };
  const P = {
    arrive: MPt(D.arrive), arriveDir: -PI / 2, door: [D.door[0], MJ(D.door[1])], vigilOut: D.vigilOut,   // vigilOut is in the Vigil's own map
    yard: MR(D.yard), lamp: MPt(D.lamp),
    ledge1: MR(D.ledge1), ledge2: MR(D.ledge2), ledge3: MR(D.ledge3), foot: MR(D.foot),
    reststone: MPt(D.reststone), overhang: MPt(D.overhang), ring: MPt(D.ring), cairn: MPt(D.cairn),
    lip: MJ(D.lip),   // the last row of the face; the yard lies beyond it (y > lip)
  };
  // the path: two cells wide, a corner at each point (the left column of the pair), three ledges between the stretches
  const D_WAY = [
    [[17, 9], [17, 18], [22, 18], [22, 30], [17, 30], [17, 40]],
    [[20, 46], [20, 56], [15, 56], [15, 67], [20, 67], [20, 78]],
    [[17, 84], [17, 94], [22, 94], [22, 105], [17, 105], [17, 114]],
    [[20, 120], [20, 128], [15, 128], [15, 138]],
  ];
  const WAY = D_WAY.map((run) => run.map(([x, y]) => [x, MC(y)]));
  const FOOT_X = [6.5, 9.5, 12.5, 15.5, 20.5, 23.5, 26.5, 29.5], FOOT_Y = MY(146.5), UP = 1;   // UP: the way up the face, in y (south, toward the yard)
  const FLOORS = ['t_p96c_path', 't_p96c_ledge', 't_p96c_drop'];
  const PATH = 0, LEDGE = 1, DROP = 2;
  const SPEED = 1.1, TOUCH = 0.9, TOUCH_COOL = 1.0, DMG = [4, 7], XP_TOP = 150, STIR = 0.3, STIR_MAX = 1.8;

  // ================================================================ the dusk bell (the contract with VIGIL96; this is the safe copy)
  const BELL = { at: 0.75, strokes: 12, gap: 1 / 360 };
  const SEC_PER_DAY = 90 * 24;   // game.js: G.tod += dt / (90 * 24)
  function localBell(tod) {
    let t = Number(tod);
    if (!Number.isFinite(t)) { const g = typeof G !== 'undefined' ? Number(G.tod) : NaN; t = Number.isFinite(g) ? g : 0.5; }
    t = ((t % 1) + 1) % 1;
    const end = BELL.at + BELL.strokes * BELL.gap;
    if (t >= 0.25 && t < BELL.at) return { phase: 'day', stroke: 0, left: BELL.strokes, toDark: end - t };
    if (t >= BELL.at && t < end) { const s = Math.min(BELL.strokes, Math.floor((t - BELL.at) / BELL.gap) + 1); return { phase: 'ringing', stroke: s, left: BELL.strokes - s, toDark: end - t }; }
    return { phase: 'dark', stroke: BELL.strokes, left: 0, toDark: 0 };
  }
  const bell = (t) => {
    try { if (typeof VIGIL96 !== 'undefined' && VIGIL96 && typeof VIGIL96.bell === 'function') { const b = VIGIL96.bell(t); if (b && typeof b.phase === 'string') return b; } } catch (e) { warnOnce('vigil bell', e); }
    return localBell(t);
  };
  // real seconds since the bell stopped (0 by day and while it rings)
  const secondsDark = (tod) => { const end = BELL.at + BELL.strokes * BELL.gap; let t = Number.isFinite(Number(tod)) ? ((Number(tod) % 1) + 1) % 1 : 0.5; if (t < end) t += 1; return localBell(tod).phase === 'dark' ? (t - end) * SEC_PER_DAY : 0; };

  // ================================================================ art (code-drawn; hashed noise, never chance)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || !Engine.sprites || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn) => {
      if (Engine.sprites[name]) return; const x = canvas(w, h, fn);
      Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) });
    };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
    const SNOW = 'rgb(234,238,246)';
    if (Engine.addTexture) {
      // the cliff rock: off-white and pale grey, bedding lines, faint vertical streaks (white, but not paper)
      tex('t_p96c_chalk', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) {
          let v = 200 + h2(i, j) * 12 + h2(i >> 3, j >> 3) * 8;
          const bed = (j + ((h2(i >> 3, 7) * 3) | 0)) % 11; if (bed === 0) v -= 30; else if (bed === 1) v -= 12;
          if (h2(i, 0) > 0.86) v -= 9 * h2(i, j >> 3);
          x.fillStyle = rgb(v, v - 1, v - 4); x.fillRect(i, j, 1, 1);
        }
      });
      // the path: trodden grey-white grit, snow in the cracks
      tex('t_p96c_path', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { let v = 172 + h2(i, j) * 22 + h2(i >> 2, j >> 2) * 8; if (h2(j, i) > 0.94) v -= 42; x.fillStyle = rgb(v, v - 2, v - 6); x.fillRect(i, j, 1, 1); }
        for (let k = 0; k < 6; k++) { let ci = h2(k, 1) * 64, cj = h2(k, 2) * 64; for (let s = 0; s < 14; s++) { px(x, SNOW, ci | 0, cj | 0, 2, 1); ci = (ci + (h2(k, s) - 0.5) * 6 + 64) % 64; cj = (cj + 1.5 + h2(s, k) * 2) % 64; } }
      });
      // a ledge: broad flat slabs, snow along the joints
      tex('t_p96c_ledge', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 5, off = (row & 1) * 16, sl = ((i + off) >> 5) & 1; const v = 188 + h2(sl + row * 3, 5) * 14 + h2(i, j) * 9; x.fillStyle = rgb(v, v - 1, v - 5); x.fillRect(i, j, 1, 1); }
        for (const j of [0, 32]) { px(x, 'rgb(138,136,132)', 0, j, 64, 1); px(x, SNOW, 0, j + 1, 64, 1); }
        for (const [i, j] of [[16, 0], [48, 0], [0, 32], [32, 32]]) { px(x, 'rgb(138,136,132)', i, j, 1, 32); px(x, SNOW, i + 1, j + 2, 1, 26); }
      });
      // what is seen far down past the edge: dark air over the peaks below
      tex('t_p96c_drop', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 44 + h2(i, j) * 10; px(x, h2(i >> 2, j >> 2) > 0.92 ? 'rgb(170,176,188)' : rgb(v - 6, v - 2, v + 8), i, j); } });
      // the postern: an old plank door, iron-banded, in a frame of the same white rock
      tex('t_p96c_postern', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 204 + h2(i, j) * 12; px(x, rgb(v, v - 1, v - 4), i, j); }
        for (let j = 8; j < 64; j++) for (let i = 10; i < 54; i++) { const p = (i - 10) >> 3, v = 80 + h2(p, 3) * 18 + h2(i, j) * 10 - ((i - 10) % 8 === 0 ? 22 : 0); px(x, rgb(v, v * 0.82, v * 0.64), i, j); }
        for (let i = 10; i < 54; i++) { const d = Math.abs(i - 32) / 22; const top = 8 - Math.round((1 - d * d) * 6); px(x, 'rgb(150,146,140)', i, top, 1, 2); }
        for (const j of [16, 46]) { px(x, 'rgb(46,46,50)', 10, j, 44, 4); for (let i = 13; i < 54; i += 8) px(x, 'rgb(110,110,116)', i, j + 1, 2, 2); }
        px(x, 'rgb(40,40,44)', 44, 32, 4, 5); px(x, 'rgb(120,120,126)', 45, 33, 2, 2);
      });
    }
    // ---- the shadow remnant: a long flat shadow lying on the rock, soft at the rim, no eyes, no light (five frames)
    const remnant = (pose) => (x, w, h) => {
      const img = x.createImageData(w, h), d = img.data;
      const wave = pose === '_w1' ? 0.25 : pose === '_w2' ? 0.75 : -1;
      const reach = pose === '_a1' ? 10 : pose === '_a2' ? 20 : 0;
      const i0 = 22 - reach, i1 = 150;
      const seed = ['', '_w1', '_w2', '_a1', '_a2'].indexOf(pose) * 17 + 3;
      for (let i = i0; i < i1; i++) {
        const u = (i - i0) / (i1 - i0);
        let t = Math.pow(Math.sin(PI * Math.min(1, u * 1.05)), 0.55) * 0.62 + (u < 0.25 ? 0.22 * Math.sin(PI * u / 0.25) : 0);   // the long body, one end fuller
        if (wave >= 0) t *= 1 + 0.2 * Math.sin(2 * PI * (u * 2 + wave));
        if (reach && u < 0.3) t *= 1 + (reach / 20) * 0.5 * (1 - u / 0.3);
        t += (h2((i >> 3) + seed, 11) - 0.5) * 0.05;
        const top = h - 1 - Math.max(2, t * (h - 3));
        for (let j = 0; j < h; j++) {
          if (j < top) continue;
          const edge = Math.min(j - top, i - i0 + 1, i1 - i, (h - 1 - j) + 3);
          const a = edge < 1.5 ? 70 : edge < 3 ? 140 : 236;
          const v = 20 + h2(i, j) * 8 + (j - top < 4 ? 10 : 0) - (i > 100 ? (i - 100) * 0.08 : 0);
          const k = (j * w + i) * 4; d[k] = v; d[k + 1] = v + 2; d[k + 2] = v + 10; d[k + 3] = a;
        }
      }
      x.putImageData(img, 0, 0);
    };
    for (const pose of ['', '_w1', '_w2', '_a1', '_a2']) add('p96c_remnant' + pose, 160, 40, 0.46, remnant(pose));
    // the cairn: flat stones, a name cut in each
    add('p96c_cairn', 64, 104, 1.15, (x) => {
      let y = 102, wd = 56, n = 0;
      while (wd > 12 && y > 8) {
        const th = 8 + ((h2(n, 4) * 5) | 0), cx = 32 + (h2(n, 9) - 0.5) * 6;
        for (let j = 0; j < th; j++) for (let i = 0; i < wd; i++) { const e = Math.min(j, th - 1 - j, i, wd - 1 - i); if (e < 1 && h2(i, j + n) > 0.5) continue; const v = 176 + h2(i + n * 7, j) * 22 + (j < 2 ? 18 : 0) - (j > th - 3 ? 30 : 0); px(x, rgb(v, v - 2, v - 7), (cx - wd / 2 + i) | 0, y - th + j); }
        for (let k = 0; k < 4; k++) px(x, 'rgb(96,92,88)', (cx - wd / 2 + 6 + k * (wd / 5) + h2(k, n) * 3) | 0, y - (th >> 1) - 1, 2 + ((h2(n, k) * 3) | 0), 1);
        y -= th; wd -= 6 + ((h2(n, 2) * 4) | 0); n++;
      }
    });
    // the rest-stone: a squat slab, worn on top
    add('p96c_reststone', 80, 34, 0.38, (x) => {
      for (let j = 4; j < 34; j++) for (let i = 2; i < 78; i++) { const v = (j < 9 ? 214 : 182) + h2(i, j) * 14 - (j > 29 ? 26 : 0); px(x, rgb(v, v - 1, v - 6), i, j); }
      px(x, 'rgb(150,148,144)', 2, 9, 76, 1);
    });
    // the overhang: the rock leaning out over a dry hollow
    add('p96c_overhang', 128, 120, 2.5, (x) => {
      for (let j = 0; j < 120; j++) for (let i = 0; i < 128; i++) {
        const lip = 42 + Math.sin(i / 128 * PI) * 10 + (h2(i >> 3, 2) - 0.5) * 4;
        const side = i < 12 + h2(j >> 3, 1) * 5 || i > 114 - h2(j >> 3, 6) * 5;
        let v;
        if (j < lip || side) { v = 196 + h2(i, j) * 14 - ((j + ((h2(i >> 3, 7) * 3) | 0)) % 11 === 0 ? 26 : 0) - (j > lip - 4 && !side ? 46 : 0); }
        else { const depth = Math.min(1, (j - lip) / 30); v = 70 + depth * 28 + h2(i, j) * 8 + (j > 108 ? 40 : 0); }
        px(x, rgb(v, v - 1, v - 4), i, j);
      }
    });
    // the iron ring in the rock, and the hand-rope going down from it
    add('p96c_ring', 40, 110, 1.3, (x) => {
      px(x, 'rgb(150,148,144)', 12, 4, 16, 10); px(x, 'rgb(52,52,56)', 18, 8, 4, 6);
      x.strokeStyle = 'rgb(58,58,62)'; x.lineWidth = 3; x.beginPath(); x.arc(20, 22, 8, 0, PI * 2); x.stroke();
      x.strokeStyle = 'rgb(112,112,118)'; x.lineWidth = 1; x.beginPath(); x.arc(19, 21, 8, PI, PI * 1.6); x.stroke();
      x.strokeStyle = 'rgb(150,126,88)'; x.lineWidth = 3; x.beginPath(); x.moveTo(20, 30); x.quadraticCurveTo(28, 70, 22, 109); x.stroke();
      x.strokeStyle = 'rgb(112,92,62)'; x.lineWidth = 1; for (let j = 34; j < 108; j += 5) { x.beginPath(); x.moveTo(21 + Math.sin(j / 20) * 3, j); x.lineTo(24 + Math.sin(j / 20) * 3, j + 2); x.stroke(); }
    });
  }

  // the peaks round the range, white, snow on their summits (BkII 523: "white as bone ... snow on their summits")
  try { if (typeof LANDMARKS !== 'undefined' && !LANDMARKS[MAP]) LANDMARKS[MAP] = [
    { a: 0.1, aw: 1.1, h: 0.26, p: 1.6, ridge: 0.6, seed: 2.1, far: 0.55, cap: [228, 232, 240], capH: 0.34, c: [150, 154, 166] },
    { a: 1.0, aw: 0.8, h: 0.20, p: 1.8, ridge: 0.5, seed: 4.6, far: 0.7, cap: [222, 226, 236], capH: 0.3, c: [140, 146, 160] },
    { a: 1.75, aw: 1.0, h: 0.30, p: 1.5, ridge: 0.55, seed: 7.9, far: 0.45, cap: [230, 234, 242], capH: 0.36, c: [156, 160, 172] },
    { a: -0.8, aw: 0.9, h: 0.22, p: 1.7, ridge: 0.5, seed: 1.2, far: 0.65, cap: [224, 228, 238], capH: 0.3, c: [146, 150, 162] },
    { a: 2.6, aw: 0.7, h: 0.16, p: 1.4, ridge: 0.4, seed: 5.5, far: 0.8, cap: [220, 224, 234], capH: 0.28, c: [138, 142, 156] },
  ]; } catch (e) { /* the plain sky */ }

  // ================================================================ the remnant (an enemy the engine leaves still; this module moves it)
  const REMNANT_DEF = { name: TX.remnant, sprite: 'p96c_remnant', hp: 99999, dmg: DMG.slice(), speed: 0, reach: 0, scale: 1, yOff: 0.02, xp: 0, desc: TX.remnantDesc };
  function defs() {
    if (typeof ENEMIES !== 'undefined' && !ENEMIES.p96c_remnant) ENEMIES.p96c_remnant = Object.assign({}, REMNANT_DEF);
    try { if (typeof VOICES !== 'undefined' && VOICES.ENEMY_VOICES && !VOICES.ENEMY_VOICES.p96c_remnant) VOICES.ENEMY_VOICES.p96c_remnant = { style: 'silent' }; } catch (e) { warnOnce('voice', e); }
  }

  // ================================================================ the lamp (the Souls rules: group 'l', one lamp, no keeper)
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return LAMPS;
    LAMPS = SOULS91.register('l', { maps: [MAP], revive: [] }, [
      { map: MAP, x: P.lamp[0], y: P.lamp[1], wx: P.lamp[0] + 1.4, wy: P.lamp[1], dir: P.arriveDir, name: TX.lamp, sprite: 'p92_shadelamp', litSprite: 'p92_shadelamplit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [240, 186, 110] },
    ]) || [];
    return LAMPS;
  }

  // ================================================================ building the face
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  const inR = (r, i, j) => i >= r[0] && i <= r[2] && j >= r[1] && j <= r[3];
  // kind: 0 drop, 1 path, 2 ledge (yard, ledges, foot), 3 rock
  function plan() {
    const kind = new Uint8Array(W * H);
    const rect = (x0, y0, x1, y1, k) => { for (let j = Math.min(y0, y1); j <= Math.max(y0, y1); j++) for (let i = Math.min(x0, x1); i <= Math.max(x0, x1); i++) if (at(i, j) >= 0 && kind[at(i, j)] !== 2) kind[at(i, j)] = k; };
    for (const r of [P.yard, P.ledge1, P.ledge2, P.ledge3, P.foot]) rect(r[0], r[1], r[2], r[3], 2);
    for (const run of WAY) for (let n = 0; n + 1 < run.length; n++) { const [ax, ay] = run[n], [bx, by] = run[n + 1]; rect(ax, ay + 1, bx + 1, by, 1); }   // the mirror of the plan's (ax, ay)-(bx+1, by+1): the two-cell block lies the other way up
    // the face: west of a row's last open cell it is rock; east of it, the drop
    const E = new Int16Array(H).fill(-1);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (kind[at(i, j)]) E[j] = Math.max(E[j], i);
    const out = kind.slice();
    for (let j = 0; j < H; j++) {
      const e = E[j];
      for (let i = 0; i < W; i++) {
        const k = at(i, j); if (kind[k]) continue;
        if (j >= H - 2) out[k] = 3;
        else if (j <= P.foot[1] - 1 || i >= W - 1) out[k] = 0;
        else out[k] = i <= e ? 3 : 0;
      }
    }
    return out;
  }
  const open = (kind, i, j) => { const k = at(i, j); return k >= 0 && (kind[k] === 1 || kind[k] === 2); };
  // where a remnant may lie: the path, the ledges and the foot, not the yard
  const walkable = (kind, i, j) => j <= P.lip && open(kind, i, j);
  function field(kind, seeds) {
    const d = new Int32Array(W * H).fill(-1), q = [];
    for (const [i, j] of seeds) { const k = at(i, j); if (k >= 0 && d[k] < 0 && walkable(kind, i, j)) { d[k] = 0; q.push(k); } }
    for (let h = 0; h < q.length; h++) { const k = q[h], i = k % W, j = (k / W) | 0; for (const [a, b] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const ni = i + a, nj = j + b, nk = at(ni, nj); if (nk < 0 || d[nk] >= 0 || !walkable(kind, ni, nj)) continue; d[nk] = d[k] + 1; q.push(nk); } }
    return d;
  }
  let KIND = null, TOPF = null;
  const kindOf = () => { if (!KIND) KIND = plan(); return KIND; };
  const lipSeeds = (kind) => { const s = []; for (let i = 0; i < W; i++) if (walkable(kind, i, P.lip)) s.push([i, P.lip]); return s; };
  const topField = () => { if (!TOPF) TOPF = field(kindOf(), lipSeeds(kindOf())); return TOPF; };

  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { outdoor: true, floor: 't_p96c_path', ceil: null, floorTextures: FLOORS, fogDist: 24, fogColor: [86, 92, 106], ambient: 0.28, music: 'inside', danger: 2,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: P.arriveDir } });
    const kind = kindOf();
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) V[vy * W1 + vx] = hv(vy);
    m.setSide(0, 0, W - 1, H - 1, 't_p96c_chalk');
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k], lv = lvlAt(j);
      if (t === 1 || t === 2) { m.smooth[k] = 1; L[k] = lv; m.setFloor(i, j, t === 1 ? PATH : LEDGE); continue; }
      m.smooth[k] = 0;
      if (t === 3) { L[k] = lv; m.block(i, j, 't_p96c_chalk', lv + 4); continue; }
      L[k] = DROP_Z; m.setFloor(i, j, DROP);
    }
    m._p96c = { kind };
    // ---- the postern (the way in and out: the yard under the Vigil's bell tower)
    m.set(P.door[0], P.door[1], DOOR({ tex: 't_p96c_postern', portal: { map: VIGIL, x: P.vigilOut[0], y: P.vigilOut[1], dir: PI / 2 }, label: TX.doorVigil }));
    // ---- the ledges and the foot
    m.deco('p96c_reststone', P.reststone[0], P.reststone[1], { radius: 0.5, scale: 1, solid: true, label: TX.reststone, _p96c: 'rest' });
    m.deco('p96c_overhang', P.overhang[0], P.overhang[1], { radius: 0.5, scale: 1, solid: true, label: TX.overhang, _p96c: 'overhang' });
    m.deco('p96c_ring', P.ring[0], P.ring[1], { radius: 0.15, scale: 1, solid: false, label: TX.ring, _p96c: 'ring' });
    m.deco('p96c_cairn', P.cairn[0], P.cairn[1], { radius: 0.5, scale: 1, solid: true, use: 'p96c_cairn', label: TX.cairn, _p96c: 'cairn' });
    // ---- the lamp
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) m.add(SOULS91.lampEnt(L0));
    // ---- the eight remnants: built hidden at the foot; the bell's phase shows them, this module moves them
    FOOT_X.forEach((x, n) => m.enemy('p96c_remnant', x, FOOT_Y, { passive: true, hidden: true, solid: false, _p96c: 'remnant', _n: n }));
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world: the map, and its postern
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    defs(); art();
    const m = build();
    // the way back up is a door into the Vigil (the yard under its bell tower); if the Vigil is not built, it stays barred
    if (!maps[VIGIL]) m.set(P.door[0], P.door[1], DOOR({ tex: 't_p96c_postern', locked: '__never', lockMsg: TX.barred, label: TX.barred }));
    maps[MAP] = m;
    // the finger-posts by the postern, at both ends (the Vigil's way out is there only while the Cliffs are)
    try { if (maps[VIGIL] && typeof BEARINGS82B !== 'undefined' && BEARINGS82B.placePosts) BEARINGS82B.placePosts(maps); } catch (e) { warnOnce('posts', e); }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p96b_cseen', 65535); if (s & (1 << bit)) return false; f().p96b_cseen = s | (1 << bit); say(t, cls, ms); return true; };
  const here = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const ents = () => (G.ents || []).filter((e) => e && e._p96c === 'remnant');
  const live = () => ents().filter((e) => !e.hidden && !e.dead);
  let lastStroke = -1, lastPhase = '', entered = true, footDay = -1, touchN = 0, chase = { key: '', d: null };

  const duskDay = () => Math.max(0, Math.floor(Number(G.day) || 0));
  const toFoot = (e) => { e.x = FOOT_X[e._n] != null ? FOOT_X[e._n] : 18.5; e.y = FOOT_Y; e._stir = 0; };
  function showAll(v) { for (const e of ents()) { e.hidden = !v; e.dead = false; e.solid = false; e.state = 'passive'; if (v && e.hpMax) e.hp = e.hpMax; } }
  // one step toward lower ground on a distance field (the next cell's centre); null at the bottom of it
  function stepOn(d, x, y) {
    const i = x | 0, j = y | 0, k = at(i, j); const here0 = k >= 0 ? d[k] : -1;
    let best = null, bv = here0 >= 0 ? here0 : 1e9;
    for (const [a, b] of [[0, UP], [1, 0], [-1, 0], [0, -UP]]) { const nk = at(i + a, j + b); if (nk < 0 || d[nk] < 0) continue; if (d[nk] < bv) { bv = d[nk]; best = [i + a + 0.5, j + b + 0.5]; } }
    if (!best && here0 < 0) return [i + 0.5, j + 0.5];
    return best;
  }
  // after the bell, a remnant has come up the path for D units (the same for every reader of the same tod; never chance)
  function placeAlong(e, D) {
    toFoot(e); const d = topField(); let left = Math.max(0, D);
    for (let n = 0; n < 2000 && left > 0; n++) {
      const t = stepOn(d, e.x, e.y); if (!t) break;
      const dx = t[0] - e.x, dy = t[1] - e.y, l = Math.hypot(dx, dy); if (l < 1e-6) break;
      const s = Math.min(left, l); e.x += dx / l * s; e.y += dy / l * s; left -= s;
    }
    if (e.y > P.lip + 0.95) e.y = P.lip + 0.95;
  }
  function rebuild(b) {
    if (b.phase === 'day') { showAll(false); for (const e of ents()) toFoot(e); return; }
    showAll(true);
    if (b.phase === 'ringing') { for (const e of ents()) toFoot(e); return; }
    const D = SPEED * secondsDark(typeof G !== 'undefined' ? G.tod : 0.5);
    for (const e of ents()) placeAlong(e, D - e._n * 0.7);
  }
  // the field toward the player (the lip, if the player stands in the yard)
  function chaseField(c) {
    const kind = G.map._p96c ? G.map._p96c.kind : kindOf(), i = c.x | 0, j = c.y | 0, key = i + ',' + j;
    if (chase.key === key && chase.d) return chase.d;
    const seeds = walkable(kind, i, j) ? [[i, j]] : j > P.lip ? lipSeeds(kind) : [[i, j], [i - 1, j], [i + 1, j], [i, j - 1], [i, j + 1]];
    chase = { key, d: field(kind, seeds) }; return chase.d;
  }
  function hunt(dt, c, p) {
    const d = chaseField(c), list = live(), inYard = c.y >= P.lip + 1;
    const tx = c.x, ty = inYard ? P.lip + 0.6 : c.y;
    const dist = (e) => Math.hypot(e.x - c.x, e.y - c.y);
    const order = list.slice().sort((a, b) => dist(a) - dist(b) || a._n - b._n);
    for (const e of order) {
      const step = SPEED * dt; if (step <= 0) break;
      if (dist(e) < 0.45) continue;
      const k = at(e.x | 0, e.y | 0), dv = k >= 0 ? d[k] : -1;
      let t = (dv >= 0 && dv <= 1) ? [tx, ty] : stepOn(d, e.x, e.y);
      if (!t) t = [tx, ty];
      const dx = t[0] - e.x, dy = t[1] - e.y, l = Math.hypot(dx, dy); if (l < 1e-6) continue;
      const s = Math.min(step, l), nx = e.x + dx / l * s, ny = Math.min(P.lip + 0.95, e.y + dy / l * s);
      if (list.some((o) => o !== e && Math.hypot(o.x - nx, o.y - ny) < 0.5 && dist(o) < dist(e))) continue;   // one waits behind another
      e.x = nx; e.y = ny;
    }
    // the cold: within reach, once a second each; the yard is safe
    if (inYard) return;
    for (const e of list) {
      e._cool = Math.max(0, (e._cool || 0) - dt);
      if (e._cool > 0 || dist(e) > TOUCH || G.dead) continue;
      e._cool = TOUCH_COOL; touchN++;
      const dmg = DMG[0] + Math.floor(h2(touchN, 96) * (DMG[1] - DMG[0] + 1));
      once(7, TX.cold, 'bad', 5000);
      e._strike = 0.3;
      try { if (typeof damagePlayer === 'function') damagePlayer(dmg, TX.remnant); else { p.hp -= dmg; if (p.hp <= 0) die(TX.remnant); } } catch (er) { warnOnce('cold', er); }
      if (G.dead) return;
    }
  }

  function tick(dt) {
    if (!here() || G.state !== 'play' || !G.player || G.dead) return;
    const p = G.player, c = Engine.cam, b = bell(G.tod);
    if (entered) { entered = false; rebuild(b); lastStroke = b.stroke; lastPhase = b.phase; once(0, TX.arrive, '', 9000); }
    // keep them as they are: no harm takes, nothing else moves them
    for (const e of ents()) {
      if (e.dead) { e.dead = false; e.hidden = b.phase === 'day'; }
      e.state = 'passive'; e.solid = false; e.stun = 0;
      if (e.hpMax && e.hp < e.hpMax) { e.hp = e.hpMax; if (!e.hidden) once(8, TX.noHarm, '', 5000); }
      if (e._strike > 0) e._strike = Math.max(0, e._strike - dt);
    }
    // the bell, heard from above
    if (b.phase === 'ringing' && b.stroke > lastStroke) {
      try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.bell) Audio_.sfx.bell(); } catch (e) { /* audio is optional */ }
      say(fmt(TX.stroke, b.stroke), 'warn', 3800);
      if (lastPhase !== 'ringing') { rebuild(b); once(5, TX.seen, 'warn', 7000); }
      else { for (const e of live()) toFoot(e); if (live().length) once(6, TX.letGo, '', 5000); }
    }
    if (b.phase === 'dark' && lastPhase === 'ringing') {
      if (c.y < P.lip + 1) { say(TX.dark, 'bad', 6000); f().p96b_dark = Math.min(99, fint('p96b_dark', 99) + 1); }
      showAll(true);
    }
    if (b.phase === 'day' && lastPhase && lastPhase !== 'day') { showAll(false); for (const e of ents()) toFoot(e); }
    lastStroke = b.stroke; lastPhase = b.phase;
    // where you are: the ledges, the foot, the top before dark
    const i = c.x | 0, j = c.y | 0;
    if (inR(P.ledge1, i, j)) once(1, TX.ledge1, '', 4000);
    if (inR(P.ledge2, i, j)) once(2, TX.ledge2, '', 4000);
    if (inR(P.ledge3, i, j)) once(3, TX.ledge3, '', 4000);
    if (inR(P.foot, i, j)) once(4, TX.foot, '', 6000);
    const t = ((Number(G.tod) % 1) + 1) % 1;
    if (j <= P.foot[3] && (b.phase === 'ringing' || (b.phase === 'day' && t >= 0.5))) footDay = duskDay();
    if (j > P.lip && b.phase === 'ringing' && footDay === duskDay() && !fint('p96b_top', 1)) {
      f().p96b_top = 1; say(TX.top, 'good', 7000);
      try { if (typeof questXp === 'function') questXp(XP_TOP); else p.xp += XP_TOP; } catch (e) { warnOnce('xp', e); }
    }
    // the remnants: they stir at the foot while it rings, and come up the path once it is dark
    if (b.phase === 'ringing') for (const e of live()) { const s = Math.min(STIR_MAX, (e._stir || 0) + STIR * dt); e._stir = s; e.y = FOOT_Y + UP * s; }
    else if (b.phase === 'dark') hunt(dt, c, p);
  }

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || e.use !== 'p96c_cairn' || !here()) return false;
    if (fint('p96b_foot', 1)) { say(TX.cairnDone, '', 4000); return true; }
    f().p96b_foot = 1;
    try { G.gold(25); } catch (er) { warnOnce('gold', er); }
    try { G.give(typeof ITEMS !== 'undefined' && ITEMS.tonic ? 'tonic' : 'bandage'); } catch (er) { warnOnce('give', er); }
    try { Audio_.sfx.pickup(); } catch (er) { /* */ }
    say(TX.cairnTake, 'good', 7000);
    return true;
  }
  // a song does nothing to them
  function sung() { if (here() && live().length) once(9, TX.noSong, 'warn', 4500); }

  // ================================================================ wiring
  // the finger-posts (read by js/bearings82b.js; placed in join(), once both maps are built)
  if (typeof window !== 'undefined') window.P82B_POSTS = (window.P82B_POSTS || []).concat([
    { id: 'p96_cliffs_postern', map: MAP, to: [VIGIL], text: TX.postCliffs },
    { id: 'p96_vigil_postern', map: VIGIL, to: [MAP], text: TX.postVigil },
  ]);
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { entered = true; chase = { key: '', d: null }; } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof castSong === 'function') { const _cs = castSong; castSong = function () { const r = _cs.apply(this, arguments); try { sung(); } catch (e) { warnOnce('song', e); } return r; }; }
    // nothing puts a remnant down: only the bell holds it
    if (typeof killEnemy === 'function') { const _k = killEnemy; killEnemy = function (e) { if (e && e.type === 'p96c_remnant') { e.hp = e.hpMax || 99999; e.dead = false; return undefined; } return _k.apply(this, arguments); }; }
  }
  wire();

  return { TX, TEXTS, MAP, VIGIL, W, H, P, D, WAY, D_WAY, MY, MJ, UP, FOOT_X, FOOT_Y, BELL, REMNANT_DEF, hv, lvlAt, plan, build, join, tick, useOwn, sung, bell, localBell, secondsDark,
    lamps: () => LAMPS, remnants: live, all: ents, topField, field, walkable: (i, j) => walkable(kindOf(), i, j),
    setTod: (t) => { G.tod = ((Number(t) % 1) + 1) % 1; }, reenter: () => { entered = true; chase = { key: '', d: null }; },
    consts: { SPEED, TOUCH, TOUCH_COOL, DMG, XP_TOP, SEC_PER_DAY } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = CLIFFS96;
if (typeof window !== 'undefined') window.CLIFFS96 = CLIFFS96;
