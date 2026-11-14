// ============================================================
//  grove85 — Phase 85: the Deep Grove, the lost place off Greenroot Wood (world plan, big place 4, approved 13 Nov).
//
//  Canon: "The oldest iron-boughs, pre-Orthodoxy. No path leads in that is the same way twice" (Vol II). Under it is
//  something from the First Cycle that was transmitting "long before the Synod learned how" (Vol I, a secret). "The path
//  changes behind them. Something under the roots is transmitting, and it is not in any key the Octave uses." The silent
//  circle: the iron-boughs go quiet in a widening ring round a stranger, and everything for two kilometres knows.
//  Real country: Wistman's Wood (dwarf oaks out of furred boulders) and the oldest coppice stools.
//
//  The wonder, the canon one: the path is not the same way twice. A gap in the north side of Greenroot Wood opens on a
//  few glades, each with three ways on. One way in each glade sounds lower than the others; follow the lower note and the
//  glades lead inward, to the oldest tree, the Stool (a ring of trunks round a hollow). Take any other way and the wood
//  lets you out at the gap you came in by. Which way is the low one is worked out from the hour and how many times you
//  have come, never from chance: the same for two players and for the tests. Every note also has a caption.
//  Nobody is in the Grove and nothing attacks there. At night the silent circle closes round you, and what it calls is
//  waiting at the gap when you come out. Nothing opens at the Stool: what is under the roots belongs to a later book.
//  To find: carters' marks (who came in, and when they came out, by what was growing; some of them wrong), and two
//  things left behind: a carter's oilskin, and a fallen iron-bough at the Stool's foot.
//  Everything here is [PROPOSED] under the approved plan. Flags (small ints, validated): p85g_visits (0-255),
//  p85g_depth (0-3), p85g_called (1 when the circle has called), p85g_stool (1 once stood in). No random numbers.
// ============================================================
'use strict';

const GROVE85 = (function () {
  const MAP = 'p85_deepgrove', W = 80, H = 62, PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('grove85: ' + k, e); } };
  const TX = {
    name: S('The Deep Grove'),
    gapOut: S('A gap in the north side of the wood, between two boulders furred green. The trees beyond are older than these.'),
    gapDoor: S('Into the Deep Grove'),
    out: S('Out to Greenroot Wood'),
    enter: S('The wood closes behind you. The path you came in by is not there when you look round.'),
    glade: S('A glade. Oaks no higher than a man grow out of the boulders, every branch furred with moss. Three ways go on.'),
    way: S('A way on, between the trees'),
    low: S('[a low note, under hearing, from this way]'),
    high: S('[a thinner note, higher, from this way]'),
    inward: S('The note is lower here. The wood lets you further in.'),
    lostOut: S('You walk by eye, and the wood lets you out where you came in.'),
    stool: S('The Stool: the oldest tree, a ring of trunks round a hollow where one trunk used to be, a thousand years ago or more.'),
    stoolIn: S('You stand in the hollow of the Stool. Under the roots something is sending, slow and patient, and it is not in any key the Octave uses. Nothing opens. Nothing asks you in.'),
    mark1: S('Cut in the bark: three notches, and IN AT ELDER-FLOWER. Under it: OUT AT ELDER-FLOWER. The same flower, or a year on; it does not say.'),
    mark2: S('Cut in a boulder: TWO OF US IN AT HAYMAKING. Under it, one name, and OUT THE DAY BEFORE.'),
    mark3: S('Cut in the bark, deep and careful: IN AT FIRST FROST. Nothing under it.'),
    mark4: S('A carter\'s mark, a wheel with a nail through it, and IN WHEN THE SLOES WERE RIPE, OUT WHEN THEY WERE RIPE.'),
    circle: S('The iron-boughs go quiet round you. Not all at once: a ring of quiet, widening, and you can hear it close. Everything for a long way off knows where you are now.'),
    called: S('Something is waiting at the gap. The circle called it.'),
    coatName: S('Carter\'s Oilskin'), coatDesc: S('A long coat of oiled canvas, folded on a boulder and left. It keeps the rain off and the noise in.'),
    boughName: S('Fallen Iron-Bough'), boughDesc: S('A bough of iron-oak, fallen from the Stool and as hard as its name. Iron bites the Quiet, and this is the oldest iron in the Reach.'),
    journal: S('The Deep Grove: off the north side of Greenroot Wood. The path is not the same way twice. Follow the lower note, and it leads in, to the oldest tree.'),
  };
  const GRASS = 0, MOSS = 1, STONE = 2;
  const FLOORS = ['t_grass', 't_moss', 't_stone'];   // index 2 is not water here: nothing in the Grove is deep
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------------------------------------------------------------- the gear
  const COAT = { name: TX.coatName, slot: 'body', ar: 3, noise: -0.3, value: 46, desc: TX.coatDesc };
  const BOUGH = { name: TX.boughName, img: 'fp_mace', dmg: [6, 14], reach: 1.45, noise: 1.6, speed: 0.62, type: 'iron', blunt: true, value: 52, desc: TX.boughDesc };
  function gear() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p85_bough) WEAPONS.p85_bough = Object.assign({}, BOUGH);
    if (typeof ARMOR !== 'undefined' && !ARMOR.a_p85_coat) ARMOR.a_p85_coat = Object.assign({}, COAT);
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p85_bough) ITEMS.w_p85_bough = { name: TX.boughName, sprite: 'gear', weapon: 'p85_bough', value: 52, desc: TX.boughDesc };
      if (!ITEMS.a_p85_coat) ITEMS.a_p85_coat = Object.assign({ sprite: 'gear', armor: true }, COAT);
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && ICONS.C_PX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p85_bough')) {
      const bough = (d) => { d.tilt(12, 12); d.layer('#3a3a3e', { shiny: 1 }).rrect(-1.6, -12, 3.2, 24).rrect(1, -8, 4, 1.6).rrect(-5, -2, 4, 1.6); d.layer('#5a7a3a').rect(-1.6, -4, 3.2, 3).rect(-1.6, 5, 3.2, 2); d.mark('#e6ecee', 18, 2); };
      ICONS.PIX['weapon:p85_bough'] = bough; ICONS.PIX.w_p85_bough = bough;
      ICONS.PIX.a_p85_coat = (d) => { d.layer('#5a5238', { shiny: 1 }).rect(5, 3, 14, 18).rect(2, 4, 4, 12).rect(18, 4, 4, 12); d.layer('#3e3826').rect(11, 3, 2, 18); d.layer('#7a7050').rect(6, 3, 12, 2); };
    } } catch (e) { /* the pack shows them without a picture */ }
  }

  // ---------------------------------------------------------------- pictures: dwarf oaks out of boulders, furred green; the Stool
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    const E = (x, cx, cy, rx, ry, col, r) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); x.fill(); };
    const fur = (x, cx, cy, rx, ry, seed) => { for (let i = 0; i < 40; i++) { const a = h2(i, seed) * PI * 2, rr = Math.sqrt(h2(seed, i)) , px = cx + Math.cos(a) * rx * rr, py = cy + Math.sin(a) * ry * rr; E(x, px, py, 2.2, 1.6, i % 3 ? '#5f8a3a' : '#7aa64a'); } };
    const boulder = (x, cx, cy, rx, ry, seed) => { E(x, cx, cy, rx, ry, '#5e5c54'); E(x, cx - rx * 0.2, cy - ry * 0.3, rx * 0.7, ry * 0.5, '#6e6c62'); fur(x, cx, cy - ry * 0.35, rx * 0.95, ry * 0.6, seed); };
    // a dwarf oak growing out of a boulder: a short thick trunk, limbs that twist out sideways more than up, every limb
    // furred with moss and hung with lichen, small leaf in clumps at the ends (Wistman's Wood)
    const dwarf = (x, w, h, seed) => {
      const limbs = [];
      const limb = (ax, ay, ang, len, wd, depth) => { if (depth > 4 || len < 4) return; const bend = (h2(seed, depth * 13 + ax) - 0.5) * 0.9, mx = ax + Math.cos(ang + bend) * len * 0.5, my = ay + Math.sin(ang + bend) * len * 0.5, bx = ax + Math.cos(ang) * len, by = ay + Math.sin(ang) * len;
        limbs.push([ax, ay, mx, my, bx, by, wd]);
        const n = depth < 2 ? 3 : 2; for (let k = 0; k < n; k++) { const t = (k + 1) / (n + 0.5), sx = ax + (bx - ax) * t, sy = ay + (by - ay) * t; limb(sx, sy, ang + (k % 2 ? 0.75 : -0.8) * (0.7 + h2(seed + k, depth) * 0.6), len * 0.62, wd * 0.62, depth + 1); }
        limb(bx, by, ang + (h2(seed, depth + 7) - 0.5) * 0.8, len * 0.6, wd * 0.7, depth + 1); };
      limb(w * 0.5, h - 20, -PI / 2 - 0.35 + h2(seed, 1) * 0.3, h * 0.26, 13, 0);
      limb(w * 0.5, h - 26, -PI / 2 + 0.5 + h2(seed, 2) * 0.3, h * 0.2, 9, 1);
      for (const [ax, ay, mx, my, bx, by, wd] of limbs) { x.strokeStyle = '#3a3026'; x.lineWidth = wd; x.lineCap = 'round'; x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo(mx, my, bx, by); x.stroke(); }
      for (const [ax, ay, mx, my, bx, by, wd] of limbs) { x.strokeStyle = '#5c8a34'; x.lineWidth = Math.max(1.2, wd * 0.55); x.beginPath(); x.moveTo(ax, ay - wd * 0.3); x.quadraticCurveTo(mx, my - wd * 0.3, bx, by - wd * 0.3); x.stroke(); }
      for (let i = 0; i < limbs.length; i++) { const [, , mx, my] = limbs[i]; if (i % 2) E(x, mx, my + 3, 1.4, 4, 'rgba(170,190,150,0.8)'); }   // lichen hanging
      for (const [, , , , bx, by, wd] of limbs) if (wd < 5) for (let k = 0; k < 3; k++) E(x, bx + (h2(bx, k) - 0.5) * 10, by + (h2(by, k) - 0.5) * 8, 5, 3.5, k % 2 ? 'rgba(78,112,46,0.92)' : 'rgba(104,140,60,0.92)');
      boulder(x, w / 2, h - 13, w * 0.34, 13, seed);
      for (let i = 0; i < 5; i++) { const fx = w * (0.18 + i * 0.16), fy = h - 4; x.strokeStyle = '#6a9a3a'; x.lineWidth = 1.4; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(fx, fy); x.quadraticCurveTo(fx + k * 3, fy - 8, fx + k * 6, fy - 6); x.stroke(); } }   // ferns at the foot
    };
    add('p85_dwarfoak', 128, 112, 1.9, (x) => dwarf(x, 128, 112, 3));
    add('p85_dwarfoak2', 128, 112, 1.9, (x) => dwarf(x, 128, 112, 9));
    add('p85_boulder', 64, 40, 0.5, (x) => boulder(x, 32, 24, 26, 15, 5));
    // the Stool: a ring of old trunks round a hollow, each trunk gnarled, barked, mossed, branching into a crown above
    add('p85_stool', 224, 224, 3.4, (x) => {
      E(x, 112, 216, 100, 8, 'rgba(0,0,0,0.3)');
      const T = [[30, 15, -0.32], [62, 19, -0.14], [92, 13, -0.05], [134, 14, 0.06], [164, 20, 0.16], [196, 15, 0.34]];
      // crowns first, behind the trunks
      T.forEach(([bx, w0, lean], i) => { const tx = bx + lean * 150, ty = 30 + h2(i, 21) * 40; for (let k = 0; k < 16; k++) E(x, tx + (h2(i, k) - 0.5) * 80, ty + (h2(k, i + 3) - 0.5) * 56, 12 + h2(k, i) * 8, 9 + h2(i, k + 1) * 6, k % 3 ? 'rgba(62,96,40,0.95)' : 'rgba(86,124,52,0.95)'); });
      T.forEach(([bx, w0, lean], i) => {
        const top = 52 + Math.round(h2(i, 21) * 40), tx = bx + lean * 150;
        x.fillStyle = i % 2 ? '#3c3328' : '#4a3f32';
        x.beginPath(); x.moveTo(bx - w0, 214); x.bezierCurveTo(bx - w0 + lean * 40, 160, tx - w0 * 0.8 - 6, 110, tx - w0 * 0.6, top); x.lineTo(tx + w0 * 0.6, top); x.bezierCurveTo(tx + w0 * 0.8 + 6, 110, bx + w0 + lean * 40, 160, bx + w0, 214); x.closePath(); x.fill();
        x.strokeStyle = 'rgba(20,16,12,0.5)'; x.lineWidth = 1.5; for (let k = -2; k <= 2; k++) { x.beginPath(); x.moveTo(bx + k * w0 * 0.35, 212); x.bezierCurveTo(bx + k * w0 * 0.35 + lean * 40, 160, tx + k * w0 * 0.25, 110, tx + k * w0 * 0.22, top + 4); x.stroke(); }   // bark furrows
        x.strokeStyle = '#5c8a34'; x.lineWidth = 4; x.beginPath(); x.moveTo(bx - w0 + 3, 208); x.bezierCurveTo(bx - w0 + lean * 40 + 3, 160, tx - w0 * 0.8 - 3, 110, tx - w0 * 0.6 + 2, top + 6); x.stroke();          // moss up the north side
        for (const [ang, len] of [[-2.2, 34], [-0.9, 30], [-1.6, 24]]) { x.strokeStyle = '#3c3328'; x.lineWidth = 6; x.beginPath(); x.moveTo(tx, top + 6); x.quadraticCurveTo(tx + Math.cos(ang) * len * 0.6, top + Math.sin(ang) * len * 0.3, tx + Math.cos(ang) * len, top + Math.sin(ang) * len); x.stroke(); }
        for (let k = 0; k < 4; k++) E(x, tx + (h2(i, k + 9) - 0.5) * 40, top - 14 + (h2(k + 9, i) - 0.5) * 24, 13, 9, k % 2 ? 'rgba(70,106,44,0.95)' : 'rgba(96,134,56,0.95)');
      });
      E(x, 112, 196, 24, 20, '#100e0a'); E(x, 112, 200, 16, 13, '#060504');                 // the hollow, between the middle trunks
      for (let i = 0; i < 14; i++) { x.strokeStyle = '#3c3328'; x.lineWidth = 5; x.beginPath(); x.moveTo(14 + i * 15, 214); x.quadraticCurveTo(8 + i * 16, 206, i * 17, 220); x.stroke(); x.strokeStyle = '#5c8a34'; x.lineWidth = 2; x.beginPath(); x.moveTo(14 + i * 15, 212); x.quadraticCurveTo(8 + i * 16, 204, i * 17, 218); x.stroke(); }
    });
  }

  // ---------------------------------------------------------------- the place: four glades and the Stool, walled by the wood
  const GLADES = [[40, 50], [15, 28], [40, 28], [65, 28]];   // 0 is where you come in; 1-3 are the inner glades
  const STOOL = [40, 8];
  const R = 6.5;
  const WAYS = [[-1, 0], [0, -1], [1, 0]];                  // west, north, east from each glade's middle
  function build(back) {
    const m = new GameMap(MAP, TX.name, W, H, { outdoor: true, floor: 't_grass', floorTextures: FLOORS, fogDist: 16, fogColor: [62, 78, 60], music: 'grove', danger: 0, spawn: { x: GLADES[0][0] + 0.5, y: H - 2.5, dir: -PI / 2 } });
    // the wood itself is open ground under trees too thick to pass: OPEN marks where you can walk; everywhere else is blocked
    const OPEN = new Uint8Array(W * H);
    m.border('t_hedge');
    const clear = (cx, cy, r) => { for (let y = Math.floor(cy - r); y <= cy + r; y++) for (let x = Math.floor(cx - r); x <= cx + r; x++) if (x > 0 && y > 0 && x < W - 1 && y < H - 1 && Math.hypot(x + 0.5 - cx - 0.5, (y + 0.5 - cy - 0.5) * 1.1) < r) { m.set(x, y, null); OPEN[y * W + x] = 1; } };
    for (const [cx, cy] of GLADES) clear(cx, cy, R);
    clear(STOOL[0], STOOL[1] + 1, 7);
    // the way in from the gap: a short lane into the first glade, the gap behind it
    for (let y = GLADES[0][1] + 6; y <= H - 2; y++) for (const x of (y >= H - 5 ? [38, 39, 40, 41, 42] : [39, 40, 41])) { m.set(x, y, null); OPEN[y * W + x] = 1; }
    m.set(40, H - 1, DOOR({ tex: 't_deepwood', portal: back, label: TX.out }));
    // each glade's three ways: a stub of path into the trees, ending where the wood turns you
    const WAYCELLS = [];
    GLADES.forEach(([cx, cy], g) => WAYS.forEach(([dx, dy], k) => { for (let s = 6; s <= 9; s++) { const x = cx + dx * s, y = cy + dy * s; for (const o of [-1, 0, 1]) { const xx = x + (dy ? o : 0), yy = y + (dx ? o : 0); m.set(xx, yy, null); OPEN[yy * W + xx] = 1; } } WAYCELLS.push({ g, k, x: cx + dx * 9 + 0.5, y: cy + dy * 9 + 0.5 }); }));
    m._p85g = { WAYCELLS, OPEN };
    m.isBlocked = function (x, y) { if (x < 0 || y < 0 || x >= W || y >= H || !OPEN[y * W + x]) return true; return GameMap.prototype.isBlocked.call(this, x, y); };
    // the wood round every open place: old oaks and dwarf oaks close together, a band deep enough that you never see through it
    const nearOpen = (x, y, r) => { for (let dy = -r; dy <= r; dy++) for (let dx = -r; dx <= r; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < W && yy < H && OPEN[yy * W + xx]) return true; } return false; };
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) {
      if (OPEN[y * W + x] || !nearOpen(x, y, 3)) continue;
      const k = h2(x * 3 + 1, y * 5 + 2); if ((x + y) % 2 && !nearOpen(x, y, 1)) continue;
      const big = !nearOpen(x, y, 1) && k < 0.55;
      m.deco(big ? 'oak' : (k < 0.78 ? 'p85_dwarfoak' : 'p85_dwarfoak2'), x + 0.2 + h2(x, y) * 0.6, y + 0.2 + h2(y, x) * 0.6, { radius: 0.45, scale: big ? 1.6 + k : 0.9 + k * 0.5 });
    }
    // the glades' dressing: dwarf oaks out of boulders round the edges, boulders, the odd one in the middle
    GLADES.forEach(([cx, cy], g) => {
      for (let i = 0; i < 16; i++) { const a = (i / 16) * PI * 2 + h2(g, i) * 0.3, rr = R - 0.9 - h2(i, g + 2) * 1.2, x = cx + 0.5 + Math.cos(a) * rr, y = cy + 0.5 + Math.sin(a) * rr;
        if (WAYS.some(([dx, dy]) => Math.abs(Math.atan2(dy, dx) - Math.atan2(y - cy - 0.5, x - cx - 0.5)) < 0.45 || Math.abs(Math.abs(Math.atan2(dy, dx) - Math.atan2(y - cy - 0.5, x - cx - 0.5)) - 2 * PI) < 0.45)) continue;
        if (g === 0 && y > cy + 3 && Math.abs(x - cx - 0.5) < 2) continue;
        m.deco(i % 3 === 2 ? 'p85_boulder' : (i % 2 ? 'p85_dwarfoak' : 'p85_dwarfoak2'), x, y, { radius: i % 3 === 2 ? 0.45 : 0.5, scale: 0.85 + h2(g * 7, i) * 0.4, label: TX.glade }); }
      m.deco('p85_boulder', cx + 2.2, cy - 1.6, { radius: 0.45, scale: 0.8 });
      m.deco('sign', cx - 1.4, cy + 1.6, { radius: 0.1, scale: 0.01, solid: false, label: TX.glade });
      WAYS.forEach(([dx, dy], k) => m.deco('p83_none', cx + 0.5 + dx * 7.5, cy + 0.5 + dy * 7.5, { radius: 0.05, scale: 0.3, solid: false, label: TX.way, _p85g: 'way', _g: g, _k: k }));
    });
    // the Stool, and what was left at its foot
    m.deco('p85_stool', STOOL[0] + 0.5, STOOL[1] + 0.2, { radius: 1.4, scale: 1, label: TX.stool, _p85g: 'stool' });
    for (let i = 0; i < 10; i++) { const a = PI * 0.15 + (i / 9) * PI * 0.7, x = STOOL[0] + 0.5 + Math.cos(a) * 5.6, y = STOOL[1] + 1.5 + Math.sin(a) * 4.4; m.deco(i % 2 ? 'p85_dwarfoak' : 'p85_boulder', x, y, { radius: 0.45, scale: 0.9 }); }
    m.add({ kind: 'item', item: 'w_p85_bough', x: STOOL[0] + 2.4, y: STOOL[1] + 3.0, sprite: 'gear', scale: 0.5, yOff: 0, solid: false, label: TX.boughName });
    // the carters' marks, one in each glade; the oilskin left on a boulder in the third
    const MARKS = [TX.mark1, TX.mark2, TX.mark3, TX.mark4];
    GLADES.forEach(([cx, cy], g) => m.deco('sign', cx - 3.0, cy - 2.6, { radius: 0.15, scale: 0.55, label: MARKS[g] }));
    m.add({ kind: 'item', item: 'a_p85_coat', x: GLADES[3][0] + 1.2, y: GLADES[3][1] + 2.6, sprite: 'gear', scale: 0.45, yOff: 0, solid: false, label: TX.coatName });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- the gap in Greenroot Wood's north side
  let GAP = null;
  function join(maps) {
    const B = typeof ROAD79B !== 'undefined' ? ROAD79B : null, E = B && maps[B.EAST]; if (!E || maps[MAP]) return;
    // the north edge cell with open ground in front of it, nearest the middle of the stretch and away from its doors
    const doorsAt = []; for (let i = 0; i < E.cells.length; i++) { const c = E.cells[i]; if (c && c.door) doorsAt.push([i % E.w, (i / E.w) | 0]); }
    let best = null;
    for (let y = 0; y <= 2 && !best; y++) for (let x = 3; x < E.w - 3; x++) {
      const c = E.get(x, y); if (!c || c.door) continue;
      if (![1, 2, 3].every((d) => !E.isBlocked(x, y + d)) || E.isBlocked(x - 1, y + 1) || E.isBlocked(x + 1, y + 1)) continue;
      if (doorsAt.some(([dx, dy]) => Math.hypot(dx - x, dy - y) < 14)) continue;
      const score = Math.abs(x - E.w * 0.55); if (!best || score < best.score) best = { x, y, score };
    }
    if (!best) { warnOnce('gap', 'no gap in the wood'); return; }
    GAP = { map: B.EAST, x: best.x + 0.5, y: best.y + 1.6, dir: PI / 2 };
    E.set(best.x, best.y, DOOR({ tex: 't_deepwood', portal: { map: MAP, x: GLADES[0][0] + 0.5, y: H - 2.5, dir: -PI / 2 }, label: TX.gapDoor }));
    const at = E.baseCount == null ? E.entities.length : E.baseCount;
    E.entities.splice(at, 0, { kind: 'deco', sprite: 'p85_boulder', x: best.x - 0.7, y: best.y + 1.2, scale: 0.8, solid: true, radius: 0.4, label: TX.gapOut }, { kind: 'deco', sprite: 'p85_boulder', x: best.x + 1.7, y: best.y + 1.2, scale: 0.7, solid: true, radius: 0.4, label: TX.gapOut });
    if (E.baseCount != null) E.baseCount += 2;
    maps[MAP] = build(Object.assign({}, GAP));
  }

  // ---------------------------------------------------------------- the ways that change: from the hour and the count of visits, never chance
  const f = () => G.flags, fint = (k, max) => { const v = Number(f()['p85g_' + k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const hour = () => ((((Number(G.tod) || 0) % 1) + 1) % 1) * 24;
  const night = () => { const h = hour(); return h >= 20 || h < 5; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const band = () => Math.floor(hour() / 3);
  // which glade stands at each depth this visit (1 and 2 are two different inner glades), and which of its ways is low
  function gladeAt(depth) { if (depth <= 0) return 0; const v = fint('visits', 255), a = 1 + ((v * 7 + band() * 3) % 3), b = 1 + ((a + (v + band()) % 2) % 3); return depth === 1 ? a : (b === a ? 1 + (a % 3) : b); }
  function lowWay(depth) { const v = fint('visits', 255); return (v * 5 + band() * 7 + depth * 11 + 1) % 3; }
  function arriveAt(g) { const [cx, cy] = GLADES[g]; return { x: cx + 0.5, y: cy + 2.5, dir: -PI / 2 }; }
  let lastNote = 0, lastWay = -1, circleT = 0, circleSaid = false;
  function takeWay(g, k) {
    const depth = fint('depth', 3), here = gladeAt(depth);
    if (g !== here) { place(arriveAt(here)); return; }          // a glade not in this visit's chain: the wood turns you back to where you were
    if (k === lowWay(depth)) {
      const next = depth + 1; f().p85g_depth = next;
      if (next >= 3) { place({ x: STOOL[0] + 0.5, y: STOOL[1] + 6.2, dir: -PI / 2 }); say(TX.inward, 'good', 4000); }
      else { place(arriveAt(gladeAt(next))); say(TX.inward, 'good', 4000); }
    } else { f().p85g_depth = 0; say(TX.lostOut, '', 5000); loadMap(GAP.map, Object.assign({}, GAP)); }
  }
  function place(p) { const c = Engine.cam; c.x = p.x; c.y = p.y; c.dir = p.dir; try { if (typeof R3D !== 'undefined' && R3D.invalidate) R3D.invalidate(); } catch (e) { /* */ } }
  function tick(dt) {
    if (typeof G === 'undefined' || !G.map || G.map.id !== MAP || G.state !== 'play') return;
    const c = Engine.cam, m = G.map, d = m._p85g; if (!d) return;
    // walking into the end of a way: the wood decides where it goes
    for (const w of d.WAYCELLS) if (Math.hypot(c.x - w.x, c.y - w.y) < 0.9) { takeWay(w.g, w.k); return; }
    // near a way's mouth: its note, and a caption for it
    const depth = fint('depth', 3), here = gladeAt(depth);
    let near = null; for (const e of G.ents) if (e && e._p85g === 'way' && e._g === here && Math.hypot(c.x - e.x, c.y - e.y) < 2.4) near = e;
    lastNote -= dt;
    if (near && (near._k !== lastWay || lastNote <= 0)) { lastWay = near._k; lastNote = 3.2; const lowOne = near._k === lowWay(depth);
      try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.song) Audio_.sfx.song(lowOne ? 87 : 233 + near._k * 30, 1.6); } catch (e) { /* silent */ }
      say(lowOne ? TX.low : TX.high, '', 2600); }
    if (!near) lastWay = -1;
    // the Stool
    if (!fint('stool', 1) && Math.hypot(c.x - STOOL[0] - 0.5, c.y - STOOL[1] - 1.6) < 2.2) { f().p85g_stool = 1; say(TX.stoolIn, '', 11000); try { questXp(40); } catch (e) { /* */ } try { if (Audio_.sfx.song) { Audio_.sfx.song(61, 2.4); setTimeout(() => Audio_.sfx.song(73, 2.4), 900); } } catch (e) { /* */ } }
    // the silent circle, after dark: it closes round you once you have been in a while
    if (night()) { circleT += dt; if (circleT > 20 && !circleSaid) { circleSaid = true; f().p85g_called = 1; say(TX.circle, 'bad', 9000); } }
  }
  // coming out after the circle has called: something waits at the gap
  function outside() {
    if (!GAP || G.mapId !== GAP.map || fint('called', 1) !== 1) return;
    f().p85g_called = 0;
    const m = G.map, made = [];
    for (const [dx, dy] of [[-1.6, 2.6], [1.8, 3.0], [0.2, 4.2]]) { const x = GAP.x + dx, y = GAP.y + dy; if (m.isBlocked(Math.floor(x), Math.floor(y))) continue; const e = { kind: 'enemy', type: 'hound', x, y, transient: true, _p85gCalled: true }; try { if (typeof hydrate === 'function') hydrate(e); } catch (er) { continue; } m.entities.push(e); if (G.ents !== m.entities && Array.isArray(G.ents)) G.ents.push(e); made.push(1); }
    if (made.length) say(TX.called, 'bad', 6000);
  }

  function wire() {
    gear(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { gear(); art(); join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function (id) {
      const from = typeof G !== 'undefined' ? G.mapId : null;
      const r = _l.apply(this, arguments);
      try {
        if (G.mapId === MAP && from !== MAP) { f().p85g_visits = (fint('visits', 255) + 1) % 256; f().p85g_depth = 0; circleT = 0; circleSaid = false; lastWay = -1; say(TX.enter, '', 5000); if (!G.flags.p85g_journal) { G.flags.p85g_journal = 1; try { journal('side', TX.journal); } catch (e) { /* */ } } }
        if (from === MAP && G.mapId !== MAP) outside();
      } catch (e) { warnOnce('load', e); }
      return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { /* next frame */ } return r; }; }
  }
  // the finger-posts at the gap (js/bearings82b.js reads these) [PROPOSED]: no names on them, by design
  if (typeof window !== 'undefined') window.P82B_POSTS = (window.P82B_POSTS || []).concat([
    { id: 'greenroot_gap', map: 'p79_road_e', to: [MAP], text: S('A post by the gap, its arm broken off. Nobody has cut a name on what is left.') },
    { id: 'grove_gap', map: MAP, to: ['p79_road_e'], text: S('A post, furred green, with no arm at all. The way out is behind you, or it was.') },
  ]);
  wire();

  return { MAP, W, H, TX, TEXTS, GLADES, STOOL, build, join, gladeAt, lowWay, takeWay, tick, gap: () => GAP, gear, art };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = GROVE85;
if (typeof window !== 'undefined') window.GROVE85 = GROVE85;
