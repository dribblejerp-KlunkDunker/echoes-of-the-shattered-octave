// ============================================================
//  lanes85 — Phase 85: the Sunk Lanes, the punt, and the Low Rings grown into the old town (world plan, road 2 and
//  big place 3, approved 13 Nov).
//
//  Canon: the Low Rings are Oakhaven's "flooded lower city, abandoned since the Flume began over-pumping" (Vol II). The
//  plan settles where they lie [PROPOSED, approved]: when the Hedge was planted in 417 it ran along dry ground at the
//  foot of the Ladder, and the drowned quarter was left outside it. The water-gate at the Ladder's foot is grown shut.
//    the Sunk Lanes   one short stretch between Stillwater Landing and the Low Rings: a causeway, then boards laid from
//                     roof to roof, then a hedge-bank, bending round open pools. The punt-woman keeps her punt here.
//    Cross Pool       the old town's heart, west of the Low Rings: the market cross under clear green water, lit from
//                     beneath by the Flume's sap-light after dark; the corn loft; the weavers' garrets on one long
//                     board; the Ladder's Foot, where Oakhaven can be heard over the Hedge and not reached; two salvagers.
//    the punt         hired from the punt-woman for a sovereign. Pole it over the deep water the boards go round; some
//                     things can only be reached by it. Use the punt to get in; X (or a mooring) to get out.
//    her task         she fished up a child's reed. The garrets' reeds are each a different note and one hook is bare.
//    by night         on a still, clear night the water drops a hand and the kerb-tops of the old street come up as
//                     stepping stones to a house that cannot be reached at any other time. In storm the water rises and
//                     the drones come out of the lanes (danger 2).
//  Special gear: the Punt-Pole (it reaches, and it pushes back) from the punt-woman, and the Market-Warden's Buckler at
//  the drowned cross, by punt only. The cashbox the looters left "for being too heavy" lies there too.
//  Everything here is [PROPOSED] under the approved plan. Flags (small ints, validated): p85l_punt (1 hired),
//  p85l_reed (0 none, 1 carried, 2 hung, 3 paid), p85l_heard (the Ladder's Foot). Nothing visual uses random numbers.
// ============================================================
'use strict';

const LANES85 = (function () {
  const LANES = 'p85_sunklanes', POOL = 'p85_crosspool', PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('lanes85: ' + k, e); } };
  const TX = {
    nameL: S('The Sunk Lanes'), namePool: S('The Low Rings: Cross Pool'),
    toLanding: S('On to Stillwater Landing'), toRings: S('On to the Low Rings'), toPool: S('West, by the boards, to Cross Pool'), poolBack: S('East, to the Low Rings'),
    lanes: S('The Sunk Lanes. It is not a road but a way: a causeway, then boards from roof to roof, then a bank of hedge. The pools on either side are deeper than they look.'),
    causeway: S('The causeway: old cobbles, a hand under the water in places. Keep to the middle.'),
    boards: S('Boards laid from roof to roof. Under them, the street. Under the street, nobody knows.'),
    bank: S('A hedge-bank, planted on the old lane wall. The only dry thing for a long way.'),
    woman: S('The punt-woman'),
    womanHire: S('"A sovereign and she\'s yours, while you\'re in the Lanes and the Pool. Use her to get in, and get out at any stage or bank. And while you\'re poling about: I fished this up. A child\'s reed. It wants hanging back over its own door. The weavers\' row, in the Pool. One hook\'s bare."'),
    womanPoor: S('"A sovereign for the punt. I don\'t do credit. The water doesn\'t either."'),
    womanWait: S('"The weavers\' row, in the Pool. One hook bare. You\'ll hear which."'),
    womanPaid: S('"Back where it belongs. Here: my old pole. It\'s too long for me now, and it pushes as well as it ever did."'),
    womanIdle: S('"Mind the pools. They look like puddles until they don\'t."'),
    reedGot: S('She gives you the reed. It is cut short and tuned, and somebody has scratched a mark on it.'),
    punt: S('A punt, flat and black with tar, and a pole across it'),
    puntNot: S('It is the punt-woman\'s. Ask her.'),
    puntIn: S('You step down into the punt and take up the pole.'),
    puntOut: S('You step out and make the punt fast.'),
    puntNoLand: S('There is nowhere to step out here.'),
    stage: S('A mooring stage: a few planks on posts'),
    pool: S('Cross Pool. The market cross stands under the water in the middle of it, with the whole square round it, kerb and step and gutter, as plain as through glass.'),
    cross: S('The market cross, under the water. The steps round its foot are green, and something heavy lies on the bottom one.'),
    street: S('Under the water, the old street: a kerb, a doorstep, a boot-scraper.'),
    nightLight: S('After dark the water is lit from underneath, green, and the whole drowned street shows under the boards.'),
    loft: S('The corn loft'), loftIn: S('The corn loft. Sacks gone to dust, a winnowing fan on the wall, the floor dry.'),
    garrets: S('The weavers\' garrets, all along one long board. Every door has a reed over it, each for a child born behind it.'),
    reed: S('A tuned reed over a door. It sounds when you touch it.'),
    hook: S('A bare hook over a door, where a reed was.'),
    hang: S('You hang the reed on the bare hook. It sounds its note, and the row is whole: each door a step higher than the last.'),
    hookDone: S('The child\'s reed, back over its own door.'),
    garretShut: S('A garret door, swollen shut.'),
    ladder: S('The Ladder\'s Foot. A water-gate grown shut, the wood gone into itself like a healed wound. Oakhaven is on the other side.'),
    heard: S('Over the Hedge, close: a cart on cobbles, somebody calling a name, a door. Oakhaven, a wall\'s width away, and no way through.'),
    kerbs: S('The kerb-tops of the old street, just under the water.'),
    kerbsUp: S('The Flume\'s note has dropped tonight, and the water with it. The kerb-tops stand out of the pool like stepping stones.'),
    kerbHouse: S('A house in the middle of the pool. Its door is only reachable when the water is down.'),
    storm: S('The water is up in the storm, and the drones have come out of the lanes.'),
    salvager: S('A salvager'), salvagerB: S('The other salvager'),
    salvGreet: S('"We\'re working. You\'re not. Go and not work somewhere else."'),
    salvWork: S('"Lead off the garret roofs, brass off the doors. What the water left."'),
    salvPlace: S('"The cross? There\'s a box on the bottom step nobody\'s lifted. Too heavy. You\'d want a punt and a back."'),
    salvBark: S('"Mind the boat."'),
    poleName: S('Punt-Pole'), poleDesc: S('Twelve feet of ash, shod with iron at the foot. It reaches further than a spear, and what it reaches it pushes away.'),
    buckName: S('Market-Warden\'s Buckler'), buckDesc: S('A round of brass from the market cross, stamped with the weights and measures. It turns a blow, and it rings when it does.'),
    cashbox: S('The cashbox the looters left: iron-bound, and far too heavy'),
    journal: S('The Sunk Lanes and Cross Pool: the Low Rings go on west into the old town, drowned. The punt-woman hires her punt for a sovereign.'),
    journalReed: S('The punt-woman fished up a child\'s reed. It belongs over a door on the weavers\' row in Cross Pool, where one hook is bare.'),
  };
  const SH = 0, COB = 1, WATER = 2, WOOD = 3, MOSS = 4, GRASS = 5, ROOF = 6;
  const FLOORS = ['t_shallows', 't_cobble', 't_water', 't_wood', 't_moss', 't_grass', 't_roof'];
  const NOTES = [174, 196, 220, 247, 262, 294];     // the weavers' row, door by door; the bare hook is the fourth
  const BARE = 3;
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };

  // ---------------------------------------------------------------- the gear
  const POLE = { name: TX.poleName, img: 'fp_spear', dmg: [3, 9], reach: 2.5, noise: 1.0, speed: 0.62, type: 'iron', blunt: true, value: 40, desc: TX.poleDesc, p85push: true };
  const BUCK = { name: TX.buckName, slot: 'shield', ar: 3, noise: 0.2, value: 50, desc: TX.buckDesc };
  function gear() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p85_pole) WEAPONS.p85_pole = Object.assign({}, POLE);
    if (typeof ARMOR !== 'undefined' && !ARMOR.a_p85_buckler) ARMOR.a_p85_buckler = Object.assign({}, BUCK);
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p85_pole) ITEMS.w_p85_pole = { name: TX.poleName, sprite: 'gear', weapon: 'p85_pole', value: 40, desc: TX.poleDesc };
      if (!ITEMS.a_p85_buckler) ITEMS.a_p85_buckler = Object.assign({ sprite: 'gear', armor: true }, BUCK);
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && ICONS.C_PX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p85_pole')) {
      const C = ICONS.C_PX;
      const pole = (d) => { d.tilt(12, 12); d.layer(C.ash).rrect(-1, -14, 2, 27); d.layer(C.iron, { shiny: 1 }).rrect(-1.4, 10, 2.8, 4); d.mark('#e6ecee', 20, 2); };
      ICONS.PIX['weapon:p85_pole'] = pole; ICONS.PIX.w_p85_pole = pole;
      ICONS.PIX.a_p85_buckler = (d) => { d.layer('#b08a3a', { shiny: 1 }).rrect(3, 3, 18, 18); d.layer('#7a5a20').rect(11, 3, 2, 18).rect(3, 11, 18, 2); d.layer('#e8cc80').rect(5, 5, 4, 1).rect(15, 15, 3, 1); };
    } } catch (e) { /* the pack shows them without a picture */ }
  }

  // ---------------------------------------------------------------- pictures
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    // the punt, moored: long, flat, square-ended, black with tar, the pole across it
    add('p85_punt', 128, 32, 0.35, (x) => {
      x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(4, 28, 120, 4);
      x.fillStyle = '#1c1a18'; x.beginPath(); x.moveTo(4, 14); x.lineTo(124, 14); x.lineTo(118, 28); x.lineTo(10, 28); x.closePath(); x.fill();
      x.fillStyle = '#3a342c'; x.fillRect(6, 14, 116, 3); x.fillStyle = '#2a2622'; for (let i = 0; i < 5; i++) x.fillRect(16 + i * 24, 17, 2, 10);
      x.strokeStyle = '#8a6a44'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 8); x.lineTo(128, 12); x.stroke();
    });
    // the drowned market cross and the old street, seen through green water (pale, tinted, softened)
    const sunk = (x, w, h, fn) => { fn(x); const d = x.getImageData(0, 0, w, h); for (let i = 0; i < d.data.length; i += 4) { if (!d.data[i + 3]) continue; const l = (d.data[i] + d.data[i + 1] + d.data[i + 2]) / 3; d.data[i] = l * 0.35; d.data[i + 1] = 60 + l * 0.6; d.data[i + 2] = 40 + l * 0.45; d.data[i + 3] = Math.round(d.data[i + 3] * 0.7); } x.putImageData(d, 0, 0); };
    add('p85_cross', 48, 96, 1.3, (x) => sunk(x, 48, 96, () => {
      x.fillStyle = '#8a8478'; x.fillRect(4, 84, 40, 12); x.fillRect(10, 76, 28, 8); x.fillRect(16, 70, 16, 6);
      x.fillRect(21, 10, 6, 60); x.fillRect(12, 18, 24, 5); x.fillStyle = '#6a645a'; x.fillRect(21, 10, 2, 60);
      x.fillStyle = '#3a3630'; x.fillRect(28, 86, 10, 8);      // the box on the bottom step
    }));
    add('p85_kerb', 64, 24, 0.3, (x) => sunk(x, 64, 24, () => { x.fillStyle = '#8a8478'; x.fillRect(0, 10, 64, 8); x.fillStyle = '#6a645a'; x.fillRect(0, 16, 64, 2); x.fillStyle = '#7a7468'; x.fillRect(40, 2, 18, 8); x.fillStyle = '#3a3630'; x.fillRect(8, 4, 3, 6); x.fillRect(5, 4, 9, 2); }));
    // a bare hook on a door-post
    add('p85_hook', 16, 64, 0.8, (x) => { x.fillStyle = '#4a3a2a'; x.fillRect(6, 0, 4, 64); x.strokeStyle = '#2a2a2c'; x.lineWidth = 2; x.beginPath(); x.moveTo(10, 10); x.lineTo(14, 10); x.lineTo(14, 16); x.stroke(); });
    // the stage: planks on posts
    add('p85_stage', 64, 24, 0.3, (x) => { x.fillStyle = '#5a4430'; x.fillRect(0, 4, 64, 6); x.fillStyle = '#3a2a1c'; for (const px of [4, 30, 56]) x.fillRect(px, 10, 4, 14); x.fillStyle = '#7a5e40'; x.fillRect(0, 4, 64, 1); });
  }

  // ---------------------------------------------------------------- shared building helpers
  function line(pts, step, fn) { for (let i = 0; i < pts.length - 1; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], L = Math.hypot(bx - ax, by - ay), n = Math.max(1, Math.ceil(L / step)); for (let k = 0; k <= n; k++) fn(ax + (bx - ax) * k / n, ay + (by - ay) * k / n); } }
  function path(m, pts, w, idx, lvl) { const seen = new Set(); line(pts, 0.35, (px, py) => { for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) { const x = Math.floor(px - (w - 1) / 2) + dx, y = Math.floor(py - (w - 1) / 2) + dy, k = y * m.w + x; if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1 || seen.has(k)) continue; seen.add(k); m.setFloor(x, y, idx); if (lvl != null) m.setLvl(x, y, lvl); } }); return seen; }
  const fillAll = (m, idx) => { for (let i = 0; i < m.w * m.h; i++) m.floorCells[i] = idx; };
  const drowned = (m, x0, y0, x1, y1, top) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (!m.get(x, y)) m.block(x, y, 't_house', top, { capTex: 't_roof' }); };

  // ---------------------------------------------------------------- the Sunk Lanes: one stretch, east (the Landing) to west (the Low Rings)
  const LW = 96, LH = 36, LGY = 18;
  const LWAY = [[LW - 1.5, LGY + 0.5], [86, 15.5], [78, 20.5], [70, 16.5], [64, 18.5], [56, 15.5], [46, 19.5], [36, 16.5], [30, 18.5], [18, 15.5], [8, 19.5], [1.5, LGY + 0.5]];
  const SHOP = [49.5, 27.5], LANE_MOOR = [84.5, 21.9];
  function buildLanes(east, west) {
    const m = new GameMap(LANES, TX.nameL, LW, LH, { outdoor: true, floor: 't_water', floorTextures: FLOORS, fogDist: 26, fogColor: [52, 62, 58], music: 'grove', danger: 1, spawn: { x: LW - 1.8, y: LGY + 0.5, dir: PI } });
    fillAll(m, WATER);
    m.border('t_hedge');
    m.set(LW - 1, LGY, DOOR({ tex: 't_hedge', portal: east, label: TX.toLanding }));
    m.set(0, LGY, DOOR({ tex: 't_hedge', portal: west, label: TX.toRings }));
    // shallows wide round the whole way; the way itself: cobbles, then boards and roof-ridges, then the bank
    path(m, LWAY, 5, SH);
    path(m, LWAY.slice(0, 5), 2, COB);
    const boards = path(m, LWAY.slice(4, 9), 2, WOOD, 0.12);
    path(m, LWAY.slice(8), 3, GRASS, 0.3);
    path(m, LWAY.slice(8), 1, MOSS, 0.3);
    // where the boards cross a roof, the ridge is the walk; the rest of each roof stands up out of the water
    const ROOFS = [[60, 13, 63, 15], [51, 16, 54, 18], [40, 15, 43, 17], [33, 19, 36, 21]];
    for (const [x0, y0, x1, y1] of ROOFS) for (let y = y0 - 2; y <= y1 + 2; y++) for (let x = x0; x <= x1; x++) { const k = y * LW + x; if (boards.has(k)) { m.setFloor(x, y, ROOF); m.setLvl(x, y, 0.3); } else if (y >= y0 - 1 && y <= y1 + 1 && !m.get(x, y)) m.block(x, y, 't_house', 0.9 + h2(x, y) * 0.4, { capTex: 't_roof' }); }
    // open pools: the deep water comes right up to the way here and there
    for (const [cx, cy, r] of [[74, 26, 4], [58, 8, 4], [24, 25, 5], [90, 8, 3]]) for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) if (Math.hypot(x - cx, y - cy) < r && m.floorCells[y * LW + x] === SH) m.setFloor(x, y, WATER);
    // the drowned shop-front, out in the deep south of the boards: by punt only
    drowned(m, 47, 29, 52, 31, 1.6);
    // hedges along the bank, and willows on its far side
    line(LWAY.slice(8), 1.6, (x, y) => { for (const s of [-1, 1]) { const px = x + 0.3 * s, py = y + s * 2.1; if (m.get(Math.floor(px), Math.floor(py)) || m.floorCells[Math.floor(py) * LW + Math.floor(px)] === WATER) continue; m.deco(h2(Math.floor(x), s + 3) < 0.6 ? 'p22_haw' : 'p20_thorn', px, py, { radius: 0.3, scale: 0.8 }); } });
    // posts, lamps, reeds, roofs further off
    for (const [x, y] of [[90, 20], [80, 14], [68, 20], [44, 21], [26, 14]]) if (!m.isBlocked(x, y)) m.deco('p12r_post', x + 0.5, y + 0.5, { radius: 0.12, scale: 0.6 });
    for (const [x, y] of [[72, 18.5], [48, 17.5], [20, 17.5]]) m.deco('p16f_lamp', x, y, { solid: false, radius: 0.1, scale: 0.7, glow: 0.7, lightCol: [40, 140, 70], label: TX.boards });
    for (let i = 0; i < 40; i++) { const x = 3 + h2(i, 3) * (LW - 6), y = 2 + h2(i, 5) * (LH - 4), f = m.floorCells[Math.floor(y) * LW + Math.floor(x)]; if (f !== SH || m.get(Math.floor(x), Math.floor(y))) continue; m.deco('p_reed' + (1 + (i % 2)), x, y, { solid: false, radius: 0.1, scale: 0.55 }); }
    for (const [x, y, sc] of [[82, 6, 1.0], [66, 30, 1.1], [38, 7, 0.9], [12, 28, 1.0], [92, 30, 0.9]]) m.deco('p16f_sunkroof', x, y, { solid: true, radius: 0.45, scale: sc });
    m.deco('sign', LW - 3.2, LGY - 1.0, { radius: 0.2, scale: 0.75, label: TX.lanes });
    m.deco('sign', 82.0, 17.0, { radius: 0.15, scale: 0.6, label: TX.causeway });
    m.deco('sign', 9.0, 16.4, { radius: 0.15, scale: 0.6, label: TX.bank });
    // the punt-woman, her stage and her punt
    for (let y = 18; y <= 20; y++) for (let x = 84; x <= 88; x++) if (m.floorCells[y * LW + x] !== COB) m.setFloor(x, y, SH);
    for (let y = 21; y <= 25; y++) for (let x = 82; x <= 87; x++) m.setFloor(x, y, WATER);
    m.deco('p85_stage', 86.2, 21.5, { radius: 0.1, scale: 1, solid: false, label: TX.stage, use: 'p85l_stage' });
    m.deco('p60_wom_c', 87.4, 19.4, { radius: 0.3, scale: 1, label: TX.woman, use: 'p85l_woman' });
    m.deco('p85_punt', LANE_MOOR[0], LANE_MOOR[1], { radius: 0.2, scale: 1, solid: false, label: TX.punt, use: 'p85l_punt', _p85l: 'punt' });
    m.add({ kind: 'item', item: 'cache', tier: 2, x: SHOP[0], y: SHOP[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    // drones in the pools' edges; two more come out in storm
    m.enemy('miredrone', 66.5, 23.5, { passive: true, facing: 0.6 }); m.enemy('miredrone', 30.5, 12.5, { passive: true, facing: 2.4 });
    m.enemy('miredrone', 76.5, 12.5, { passive: true, facing: 1.4, hidden: true, _p85l: 'storm' }); m.enemy('miredrone', 40.5, 23.5, { passive: true, facing: 3.4, hidden: true, _p85l: 'storm' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- Cross Pool: the old town grown west of the Low Rings
  const PW = 72, PH = 56, PGY = 40;
  const CROSS = [36.5, 28.5], CASH = [37.6, 30.4], BUCKLER = [35.3, 30.6], POOL_MOOR = [45.5, 33.5];
  const KERB = [[41, 9], [42, 9], [43, 9], [44, 9], [45, 9], [46, 9], [47, 9], [48, 9], [49, 9], [50, 9], [51, 9]];
  const GARRETS = [10, 17, 24, 31, 38, 45];      // door x along the weavers' row (doors at y 44)
  function buildPool(east) {
    const m = new GameMap(POOL, TX.namePool, PW, PH, { outdoor: true, floor: 't_shallows', floorTextures: FLOORS, fogDist: 24, fogColor: [46, 58, 54], music: 'grove', danger: 1, spawn: { x: PW - 1.8, y: PGY + 0.5, dir: PI } });
    m.border('t_hedge');
    m.set(PW - 1, PGY, DOOR({ tex: 't_hedge', portal: east, label: TX.poolBack }));
    // the town: drowned houses on a grid of streets; the streets are shallows, the squares and the wider lanes deep
    for (let by = 0; by < 5; by++) for (let bx = 0; bx < 7; bx++) {
      const x0 = 3 + bx * 10, y0 = 3 + by * 10, x1 = x0 + 6, y1 = y0 + 5;
      if (x1 > PW - 3 || y1 > PH - 3) continue;
      if (x0 <= CROSS[0] + 8 && x1 >= CROSS[0] - 8 && y0 <= CROSS[1] + 7 && y1 >= CROSS[1] - 7) continue;   // the square
      if (y0 >= 40) continue;                                                                                  // the weavers' row and its board
      if (x0 >= 40 && y0 <= 13 && x1 <= 60) continue;                                                       // the kerb house's pool
      if (x0 <= 14 && y0 <= 13) continue;                                                                    // the corn loft
      if (x0 <= 38 && x1 >= 35 && y0 < 20) continue;                                                       // the way up to the Ladder's Foot
      if (x0 >= 47 && y1 >= 37) continue;                                                                    // the board to the gate
      drowned(m, x0, y0, x1, y1, 1.0 + h2(bx, by) * 1.2);
    }
    // the square: deep water, a board walk round it on three sides
    for (let y = 20; y <= 37; y++) for (let x = 27; x <= 46; x++) m.setFloor(x, y, WATER);
    path(m, [[26.5, 19.5], [47.5, 19.5], [47.5, 38.5], [26.5, 38.5]], 1, WOOD, 0.12);
    path(m, [[47.5, 38.5], [PW - 1.5, PGY + 0.5]], 2, WOOD, 0.12);
    // the kerb house: a house standing alone in its own pool, the old kerb leading to it under the water
    for (let y = 3; y <= 15; y++) for (let x = 41; x <= 62; x++) if (!m.get(x, y)) m.setFloor(x, y, WATER);
    m.rect(53, 5, 59, 12, 't_house'); m.clear(54, 6, 58, 11); for (let y = 6; y <= 11; y++) for (let x = 54; x <= 58; x++) { m.setLvl(x, y, 0.3); m.setFloor(x, y, WOOD); }
    m.set(53, 9, DOOR({ label: TX.kerbHouse })); m.setFloor(52, 9, WATER);
    m._p85l = { KERB: KERB.concat([[52, 9]]) };
    // the corn loft: a dry upper room in the north-west
    m.rect(4, 4, 12, 11, 't_house'); m.clear(5, 5, 11, 10); for (let y = 5; y <= 10; y++) for (let x = 5; x <= 11; x++) { m.setLvl(x, y, 0.3); m.setFloor(x, y, WOOD); }
    m.set(8, 11, DOOR({ label: TX.loft })); m.setLvl(8, 11, 0.3);
    // the weavers' row: six garrets on the south side, one long board in front of them
    for (let i = 0; i < GARRETS.length; i++) { const dx = GARRETS[i]; m.rect(dx - 2, 45, dx + 3, 50, 't_house'); drowned(m, dx - 1, 46, dx + 2, 49, 1.3); m.set(dx, 45, DOOR({ locked: '__never', lockMsg: TX.garretShut, label: TX.garretShut })); }
    for (let y = 41; y <= 44; y++) for (let x = 3; x <= 50; x++) if (!m.get(x, y)) m.setFloor(x, y, WATER);
    path(m, [[6.5, 43.5], [49.5, 43.5]], 1, WOOD, 0.12);
    path(m, [[26.5, 38.5], [26.5, 43.5]], 1, WOOD, 0.12);
    // the Ladder's Foot: the grown-shut water-gate in the north wall
    for (let x = 33; x <= 39; x++) m.set(x, 0, WALL('p16f_grown'));
    for (let y = 1; y <= 4; y++) for (let x = 31; x <= 41; x++) if (!m.get(x, y)) m.setFloor(x, y, MOSS);
    path(m, [[36.5, 4.5], [36.5, 19.5]], 2, SH);
    // the drowned street under the square: the cross, kerbs, doorsteps (lit from beneath after dark)
    m.deco('p85_cross', CROSS[0], CROSS[1], { radius: 0.4, scale: 1, solid: false, yOff: -0.3, label: TX.cross, _p85l: 'sunk' });
    for (const [x, y] of [[30.5, 23.5], [42.5, 24.5], [31.5, 34.5], [43.0, 33.0], [36.5, 22.0], [36.5, 35.5]]) m.deco('p85_kerb', x, y, { radius: 0.1, scale: 1, solid: false, yOff: -0.22, label: TX.street, _p85l: 'sunk' });
    for (const [x, y] of KERB) m.deco('p85_kerb', x + 0.5, y + 0.5, { radius: 0.05, scale: 0.8, solid: false, label: TX.kerbs, _p85l: 'kerb' });
    // the punt and its stage, the cashbox and the buckler on the cross's bottom step
    m.deco('p85_stage', POOL_MOOR[0] + 1.4, POOL_MOOR[1], { radius: 0.1, scale: 1, solid: false, label: TX.stage, use: 'p85l_stage' });
    m.deco('p85_punt', POOL_MOOR[0], POOL_MOOR[1], { radius: 0.2, scale: 1, solid: false, label: TX.punt, use: 'p85l_punt', _p85l: 'punt' });
    m.add({ kind: 'item', item: 'cache', tier: 3, x: CASH[0], y: CASH[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: TX.cashbox });
    m.add({ kind: 'item', item: 'a_p85_buckler', x: BUCKLER[0], y: BUCKLER[1], sprite: 'gear', scale: 0.45, yOff: 0, solid: false, label: TX.buckName });
    // the corn loft's and the kerb house's things
    m.deco('sign', 6.0, 5.6, { radius: 0.15, scale: 0.6, label: TX.loftIn });
    m.add({ kind: 'item', item: 'cache', tier: 1, x: 10.4, y: 6.0, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.add({ kind: 'item', item: 'cache', tier: 2, x: 57.4, y: 7.0, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    // the reeds over the garret doors, and the bare hook
    GARRETS.forEach((dx, i) => { const o = { solid: false, radius: 0.1, scale: 0.55, yOff: -0.4, _p85l: 'reed', _i: i };
      if (i === BARE) m.deco('p85_hook', dx + 0.5, 44.35, Object.assign(o, { label: TX.hook, use: 'p85l_hook' })); else m.deco('p9p_doorreed', dx + 0.5, 44.35, Object.assign(o, { label: TX.reed, use: 'p85l_reed' })); });
    // signs
    m.deco('sign', 48.6, 37.6, { radius: 0.2, scale: 0.75, label: TX.pool });
    m.deco('sign', 7.6, 42.6, { radius: 0.15, scale: 0.6, label: TX.garrets });
    m.deco('sign', 34.4, 2.0, { radius: 0.2, scale: 0.7, label: TX.ladder, _p85l: 'ladder' });
    m.deco('sign', 44.0, 17.6, { radius: 0.15, scale: 0.55, label: TX.kerbHouse });
    // lamps along the boards, posts, reeds
    for (const [x, y] of [[26.6, 21.0], [47.4, 26.0], [40.0, 38.6], [60.0, 40.6], [20.0, 43.4]]) m.deco('p16f_lamp', x, y, { solid: false, radius: 0.1, scale: 0.7, glow: 0.7, lightCol: [40, 140, 70] });
    for (let i = 0; i < 30; i++) { const x = 3 + h2(i, 13) * (PW - 6), y = 3 + h2(i, 17) * (PH - 6); if (m.floorCells[Math.floor(y) * PW + Math.floor(x)] !== SH || m.get(Math.floor(x), Math.floor(y))) continue; m.deco('p_reed' + (1 + (i % 2)), x, y, { solid: false, radius: 0.1, scale: 0.55 }); }
    // drones in the lanes, more in storm
    m.enemy('miredrone', 16.5, 26.5, { passive: true, facing: 0.6 }); m.enemy('miredrone', 55.5, 26.5, { passive: true, facing: 2.6 }); m.enemy('miredrone', 21.5, 15.5, { passive: true, facing: 1.6 });
    m.enemy('miredrone', 64.5, 20.5, { passive: true, hidden: true, _p85l: 'storm' }); m.enemy('miredrone', 11.5, 36.5, { passive: true, hidden: true, _p85l: 'storm' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joining: the Landing and the Low Rings, with the Lanes between; Cross Pool off the Low Rings' west side
  const door = (m, target) => { for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === target) return c; } return null; };
  function join(maps) {
    const land = maps.flume_landing, rings = maps.flume_lowrings; if (!land || !rings || maps[LANES]) return;
    const out = door(land, 'flume_lowrings'), back = door(rings, 'flume_landing'); if (!out || !back) { warnOnce('join', 'no gangway'); return; }
    maps[LANES] = buildLanes(Object.assign({}, back.portal), Object.assign({}, out.portal));
    out.portal = { map: LANES, x: LW - 1.8, y: LGY + 0.5, dir: PI }; back.portal = { map: LANES, x: 1.8, y: LGY + 0.5, dir: 0 };
    rings.set(0, 13, DOOR({ tex: 't_hedge', portal: { map: POOL, x: PW - 1.8, y: PGY + 0.5, dir: PI }, label: TX.toPool }));
    maps[POOL] = buildPool({ map: 'flume_lowrings', x: 1.8, y: 13.5, dir: 0 });
  }

  // ---------------------------------------------------------------- the punt
  const f = () => G.flags, fint = (k) => { const v = Number(f()['p85l_' + k]); return Number.isFinite(v) ? v : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const onWater = () => typeof G !== 'undefined' && G.map && (G.map.id === LANES || G.map.id === POOL);
  let inPunt = false, bowEl = null;
  const floorAt = (m, x, y) => (m.floorCells ? m.floorCells[Math.floor(y) * m.w + Math.floor(x)] : -1);
  const puntEnt = () => G.ents.find((e) => e && e._p85l === 'punt');
  function bow(on) {
    if (typeof document === 'undefined') return;
    if (!bowEl) {
      const cv = document.getElementById('view'), v = (cv && cv.parentElement) || document.body; if (!v) return;
      bowEl = document.createElement('canvas'); bowEl.width = 240; bowEl.height = 90; bowEl.id = 'p85-bow';
      bowEl.style.cssText = 'position:absolute;left:50%;bottom:0;width:34%;transform:translateX(-50%);pointer-events:none;z-index:6;image-rendering:pixelated;display:none';
      const x = bowEl.getContext('2d');
      x.fillStyle = '#1c1a18'; x.beginPath(); x.moveTo(40, 90); x.lineTo(70, 20); x.lineTo(170, 20); x.lineTo(200, 90); x.closePath(); x.fill();
      x.fillStyle = '#3a342c'; x.beginPath(); x.moveTo(62, 40); x.lineTo(70, 20); x.lineTo(170, 20); x.lineTo(178, 40); x.closePath(); x.fill();
      x.fillStyle = '#2a2622'; for (let i = 0; i < 3; i++) x.fillRect(66 - i * 6, 46 + i * 15, 108 + i * 12, 4);
      x.strokeStyle = '#8a6a44'; x.lineWidth = 6; x.beginPath(); x.moveTo(210, 90); x.lineTo(150, 0); x.stroke();
      x.strokeStyle = '#a8845a'; x.lineWidth = 2; x.beginPath(); x.moveTo(208, 90); x.lineTo(148, 0); x.stroke();
      v.appendChild(bowEl);
    }
    bowEl.style.display = on ? 'block' : 'none';
    if (on) { const cv = document.getElementById('view'), par = bowEl.parentElement; if (cv && par) { const a = cv.getBoundingClientRect(), b = par.getBoundingClientRect(), hud = a.height * (1 - (typeof VIEW_H !== 'undefined' && typeof VH !== 'undefined' ? VIEW_H / VH : 0.75)); bowEl.style.bottom = Math.max(0, b.bottom - a.bottom + hud) + 'px'; bowEl.style.width = Math.round(a.width * 0.34) + 'px'; bowEl.style.left = Math.round(a.left - b.left + a.width / 2) + 'px'; } }
  }
  function savePunt() { const p = puntEnt(); if (!p) return; const s = G.player.p85punt && typeof G.player.p85punt === 'object' ? G.player.p85punt : (G.player.p85punt = {}); s[G.map.id] = [Math.round(p.x * 10) / 10, Math.round(p.y * 10) / 10]; }
  function placePunt() { const p = puntEnt(), s = G.player && G.player.p85punt && G.player.p85punt[G.map.id]; if (!p || !Array.isArray(s) || !Number.isFinite(+s[0]) || !Number.isFinite(+s[1])) return; if (floorAt(G.map, +s[0], +s[1]) === WATER) { p.x = +s[0]; p.y = +s[1]; } }
  function getIn() {
    if (!onWater() || inPunt) return false;
    const p = puntEnt(); if (!p) return false;
    if (fint('punt') !== 1) { say(TX.puntNot, '', 3500); return true; }
    const c = Engine.cam; if (Math.hypot(p.x - c.x, p.y - c.y) > 2.4) return false;
    try { if (typeof MOUNTS84 !== 'undefined' && MOUNTS84.mounted()) MOUNTS84.getDown(null); } catch (e) { /* on foot */ }
    inPunt = true; c.x = p.x; c.y = p.y; p.hidden = true; bow(true); say(TX.puntIn, '', 3000); return true;
  }
  function getOut(at) {
    if (!inPunt) return false;
    const c = Engine.cam, m = G.map, p = puntEnt();
    let spot = at || null;
    if (!spot) for (let r = 1; r <= 2 && !spot; r++) for (let k = 0; k < 16 && !spot; k++) { const a = k * PI / 8, x = c.x + Math.cos(a) * r * 0.8, y = c.y + Math.sin(a) * r * 0.8; if (!m.isBlocked(Math.floor(x), Math.floor(y))) spot = [Math.floor(x) + 0.5, Math.floor(y) + 0.5]; }
    if (!spot) { say(TX.puntNoLand, 'warn', 2500); return true; }
    if (p) { p.x = c.x; p.y = c.y; p.hidden = false; }
    inPunt = false; c.x = spot[0]; c.y = spot[1]; bow(false); savePunt(); say(TX.puntOut, '', 2500); return true;
  }

  // ---------------------------------------------------------------- the hour, the weather, the task
  const hour = () => ((((Number(G.tod) || 0) % 1) + 1) % 1) * 24;
  const night = () => { const h = hour(); return h >= 20 || h < 5; };
  const weather = () => (typeof Weather !== 'undefined' ? Weather.state : 'clear');
  const lowWater = () => night() && weather() === 'clear';
  function sync() {
    if (!onWater() || !G.flags) return;
    const m = G.map, nt = night(), storm = weather() === 'storm';
    m.danger = storm ? 2 : 1;
    for (const e of G.ents) { if (!e || !e._p85l) continue;
      if (e._p85l === 'sunk') { e.glow = nt ? 0.5 : 0; e.lightCol = [40, 150, 100]; }
      else if (e._p85l === 'storm') { if (e.kind === 'enemy' && !e.dead) e.hidden = !storm; }
      else if (e._p85l === 'kerb') e.label = lowWater() ? TX.kerbsUp : TX.kerbs;
      else if (e._p85l === 'reed' && e._i === BARE) { const hung = fint('reed') >= 2; e.sprite = hung ? 'p9p_doorreed' : 'p85_hook'; e.label = hung ? TX.hookDone : TX.hook; e.use = hung ? 'p85l_reed' : 'p85l_hook'; } }
    // a still, clear night: the water drops a hand and the kerb-tops come up
    if (m._p85l && m._p85l.KERB) { const want = lowWater() ? SH : WATER, c = Engine.cam; for (const [x, y] of m._p85l.KERB) { const i = y * m.w + x; if (m.floorCells[i] === want) continue; if (want === WATER && Math.floor(c.x) === x && Math.floor(c.y) === y && !inPunt) continue; m.floorCells[i] = want; } }
    // the Ladder's Foot: Oakhaven heard over the Hedge
    if (m.id === POOL && !fint('heard') && Engine.cam.y < 6 && Math.abs(Engine.cam.x - 36.5) < 6) { f().p85l_heard = 1; say(TX.heard, '', 9000); }
  }
  function tone(hz) { try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.song) Audio_.sfx.song(hz, 1.2); } catch (e) { /* silent */ } }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p85l_/.test(e.use) || typeof G === 'undefined' || !G.map) return false;
    const u = e.use;
    if (u === 'p85l_punt') { getIn(); return true; }
    if (u === 'p85l_stage') { if (inPunt) { const fr = typeof travelFreeNear === 'function' ? travelFreeNear(G.map, e.x, e.y - 0.6) : null; getOut(fr ? [fr[0], fr[1]] : null); } else say(TX.stage, '', 2500); return true; }
    if (u === 'p85l_woman') {
      if (fint('punt') !== 1) {
        if (!Number.isFinite(G.player.gold) || G.player.gold < 1) { say(TX.womanPoor, '', 6000); return true; }
        G.player.gold -= 1; f().p85l_punt = 1; if (!fint('reed')) f().p85l_reed = 1;
        say(TX.womanHire, '', 12000); setTimeout(() => say(TX.reedGot, 'good', 5000), 1500);
        try { journal('side', TX.journal); journal('side', TX.journalReed); } catch (err) { /* */ }
        return true;
      }
      const r = fint('reed');
      if (r === 2) { f().p85l_reed = 3; say(TX.womanPaid, 'good', 9000); try { G.player.inv.push({ id: 'w_p85_pole', n: 1 }); G.gold(4); questXp(30); } catch (err) { /* */ } return true; }
      say(r === 1 ? TX.womanWait : TX.womanIdle, '', 6000); return true;
    }
    if (u === 'p85l_reed') { tone(NOTES[e._i] || 220); say(TX.reed, '', 2500); return true; }
    if (u === 'p85l_hook') { if (fint('reed') === 1) { f().p85l_reed = 2; tone(NOTES[BARE]); say(TX.hang, 'good', 8000); sync(); } else say(TX.hook, '', 3000); return true; }
    return false;
  }

  function wire() {
    gear(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { gear(); art(); join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { if (inPunt) { try { savePunt(); } catch (e) { /* */ } inPunt = false; bow(false); } const r = _l.apply(this, arguments); try { if (onWater()) placePunt(); sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function () { const r = _u.apply(this, arguments); try { sync(); if (inPunt) { bow(true); const p = puntEnt(); if (p) { p.x = Engine.cam.x; p.y = Engine.cam.y; } } } catch (e) { /* next frame */ } return r; }; }
    // in the punt: you go over the water and the shallows, and nowhere else
    if (typeof playerMove === 'function') { const _m = playerMove; playerMove = function (o) {
      if (!(inPunt && typeof Engine !== 'undefined' && o === Engine.cam && onWater())) return _m.apply(this, arguments);
      const m = G.map, own = Object.prototype.hasOwnProperty.call(m, 'isBlocked'), was = m.isBlocked;
      m.isBlocked = function (x, y) { if (this.isSolidCell(x, y)) return true; const fl = this.floorCells[y * this.w + x]; return !(fl === WATER || fl === SH); };
      try { return _m.apply(this, arguments); } finally { if (own) m.isBlocked = was; else delete m.isBlocked; }
    }; }
    // the Punt-Pole: what it reaches, it pushes away
    if (typeof attack === 'function') { const _a = attack; attack = function () {
      let before = null; try { if (typeof currentWeapon === 'function' && currentWeapon() && currentWeapon().p85push) before = new Map(G.ents.filter((e) => e && e.kind === 'enemy' && !e.dead).map((e) => [e, e.hp])); } catch (e) { before = null; }
      const r = _a.apply(this, arguments);
      try { if (before) { const c = Engine.cam; for (const [e, hp] of before) { if (e.dead || e.hp >= hp || (e.def && e.def.boss)) continue; const d = Math.hypot(e.x - c.x, e.y - c.y) || 1, nx = e.x + (e.x - c.x) / d * 0.8, ny = e.y + (e.y - c.y) / d * 0.8; if (!G.map.isBlocked(Math.floor(nx), Math.floor(ny))) { e.x = nx; e.y = ny; } } } } catch (e) { /* a plain blow */ }
      return r; }; }
    // X gets you in or out of the punt (taken first, so the pony's X does not answer it)
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('keydown', (ev) => {
      try { if (typeof G === 'undefined' || G.state !== 'play' || ev.repeat || !onWater()) return; const k = typeof keyOf === 'function' ? keyOf(ev) : (ev.key || '').toLowerCase(); if (k !== 'x') return;
        const done = inPunt ? getOut() : getIn(); if (done) { ev.preventDefault(); ev.stopImmediatePropagation(); } } catch (e) { warnOnce('key', e); }
    }, true);
    // the finger-posts at the new gates (js/bearings82b.js reads these) [PROPOSED]
    if (typeof window !== 'undefined') {
      window.P82B_REMAP = Object.assign(window.P82B_REMAP || {}, { flume_landing: Object.assign({}, (window.P82B_REMAP || {}).flume_landing, { flume_lowrings: LANES }), flume_lowrings: { flume_landing: LANES } });
      window.P82B_POSTS = (window.P82B_POSTS || []).concat([
        { id: 'lanes_east', map: LANES, to: ['flume_landing'], text: S('A plank on a post. STILLWATER, east. Under it, in tar: the causeway is the dry way.') },
        { id: 'lanes_west', map: LANES, to: ['flume_lowrings'], text: S('A plank on a post. THE LOW RINGS. Under it, in tar: keep off the pools.') },
        { id: 'rings_west', map: 'flume_lowrings', to: [POOL], text: S('A plank on a post. CROSS POOL, by the boards. Somebody has added: and the cross.') },
        { id: 'pool_east', map: POOL, to: ['flume_lowrings'], text: S('A plank on a post. THE LOW RINGS, east. STILLWATER beyond.') },
      ]);
    }
  }
  wire();

  return { LANES, POOL, TX, TEXTS, NOTES, BARE, SHOP, CROSS, CASH, BUCKLER, KERB, GARRETS, buildLanes, buildPool, join, sync, useOwn, getIn, getOut, inPunt: () => inPunt, lowWater, gear, art };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = LANES85;
if (typeof window !== 'undefined') window.LANES85 = LANES85;
