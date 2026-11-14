// ============================================================
//  drove83 — Phase 83, road 3 of the world plan (story/Game Layer/Phase 81 - The World Plan.md, "Road 3. The drove
//  road"; approved by the owner, 13 Nov 2026, "approve all"). Every line here is [PROPOSED], for his review, in
//  story/Game Layer/Phase 83 - New In-Game Text (for review).md.
//
//  Until now the stile in the Watch Downs' south hedge dropped straight into Wethercombe, "down a drove-road" that was not
//  there to walk. Now the road itself is there, in two stretches, walked north to south (each takes over the two doors it
//  stands between; nothing else about either place changes):
//    the Grey Wethers      (DROVE83.WETHERS)  the Watch Downs  ->  the Hundred Hollows      danger 0, like the Downs
//      The drove road, wide and green, a hundred sheep abreast, swinging round the head of a dry valley, through a flock of
//      grey sarsen stones lying in the grass like sheep lying down (each with its own bell-note; in a high wind the whole
//      flock sounds by itself), past a dew-pond to the Three Pines at the drovers' halt.
//      To find: a pinfold with a tally-stick still in the wall; a drover's cache under the middle pine.
//      To meet: returners, a family with a handcart come out of the Hedge after two years to see what is left of their
//      farm; the old woman among them, a drover's daughter (her task: strike five of the Wethers in the order of the
//      drovers' call, so she can hear it once more; out of order it is only noise); a furze-cutter cutting for the beacons.
//    the Hundred Hollows   (DROVE83.HOLLOWS)  the Grey Wethers  ->  Wethercombe            danger 1
//      The road narrows into a holloway, a green tunnel under hawthorn, and comes out on a down that is all grassed-over
//      pits, a hundred of them; then down by terraces into Wethercombe. One hollow is not grassed over: white chalk and a
//      dark mouth (the Antler Galleries, Phase 85; nothing opens yet). Hounds den in the Hollows after dark.
//  At night the three fold-fires, once lit (js/sheepwalk22.js), show from the road as three fires on three hills. At dawn
//  after a wet night the combe fills with mist, and the road runs above a white sea.
//  Canon kept: the Downs and everything on them; "There are no sheep"; the flocks shorn for the Hedge in 417; the furze
//  woodpile and the three fold-fires; Tamar Farrant first back. Flags: p83d_call (how many of the five struck in order,
//  0-5), p83d_paid (1 once the old woman has paid), p83d_wetnight (the day whose dawn follows a wet night).
//  Nothing visual uses random numbers.
// ============================================================
'use strict';

const DROVE83 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI, WETHERS = 'p83_wethers', HOLLOWS = 'p83_hollows', DOWNS = 'p20_downs', COMBE = 'p22_combe';
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('drove83: ' + k, e); } };
  const h2 = (a, b) => { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const along = (pts, step, fn) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 0; k <= n; k++) fn(ax + (bx - ax) * k / n, ay + (by - ay) * k / n); } };
  const hour = () => { const t = typeof G !== 'undefined' ? Number(G.tod) || 0 : 0; return (((t % 1) + 1) % 1) * 24; };
  const night = () => { const h = hour(); return h >= 20 || h < 5; };
  const wet = () => typeof Weather !== 'undefined' && (Weather.state === 'rain' || Weather.state === 'storm');
  const windy = () => typeof Weather !== 'undefined' && (Number(Weather.wind) || 0) >= 0.42;
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };

  const TX = {
    nameW: S('The drove road: the Grey Wethers'), nameH: S('The drove road: the Hundred Hollows'),
    upToDowns: S('Up to the Watch Downs'), onToHollows: S('On to the Hundred Hollows'), backToWethers: S('Back to the Grey Wethers'), downToCombe: S('Down to Wethercombe'),
    // the Grey Wethers
    drove: S('The drove road. Wide enough for a hundred sheep abreast, and green, because nothing has walked it in two years.'),
    valley: S('A dry valley, all turf and no stream. The water went down into the chalk a long time ago, and the valley never noticed.'),
    wethers: S('The Grey Wethers. A flock of grey stones lying in the grass, like sheep lying down. From the road, for a moment, you count them.'),
    wether: S('A grey wether: a sarsen stone, lying down. Knock it and it gives a note.'),
    wetherWind: S('The wind is up, and the stones are sounding by themselves: a hillside of bells, faint, and no sheep anywhere.'),
    marked: [S('A grey wether with one stroke of red raddle on its back.'), S('A grey wether with two strokes of red raddle on its back.'), S('A grey wether with three strokes of red raddle on its back.'),
      S('A grey wether with four strokes of red raddle on its back.'), S('A grey wether with five strokes of red raddle on its back.')],
    knock: S('You knock the stone. It gives a note, and the note goes on longer than it should.'),
    callOk: S('The stone answers, and the note runs down the hill to the road.'),
    callDone: S('The fifth stone rings, and the call goes out over the down the way it used to. Down at the Three Pines, the old woman stands up.'),
    callWrong: S('Out of order the stones only clang, and the clang goes a long way.'),
    pond: S('A dew-pond: a dish of puddled chalk on the top of the down, holding rain and mist. Nothing has drunk from it in two years. It is full.'),
    pines: S('The Three Pines, the drovers\' halt. Every night of a drove ended under a clump like this; you could see the next one a day ahead.'),
    cache: S('Something wrapped in oilskin, under the roots of the middle pine.'),
    pinfold: S('A pinfold: a pound of flint and chalk for strays, its gate gone.'),
    tally: S('A tally-stick pushed into a crack in the pinfold wall, notched for strays. The last notch is cut deeper than the rest.'),
    cart: S('A handcart, with everything a family kept roped down under a blanket.'),
    camp: S('The returners\' fire, small, under the pines.'),
    furze: S('Furze, in yellow flower and all thorn.'),
    faggots: S('Furze faggots, cut and bound, for the beacons.'),
    farFire: S('Far off on a hill, a fire. Somebody has lit the beacon.'),
    // the Hundred Hollows
    holloway: S('The holloway. The road has worn itself down between its banks until the hawthorn meets overhead, and you walk in a green tunnel.'),
    hollows: S('The Hundred Hollows. The down is all grassed-over pits, side by side, like a field of giant thumb-prints.'),
    hollow: S('A hollow, grassed over, a little deeper than a man is tall.'),
    den: S('Flattened grass in the bottom of a hollow, and a smell. Something lies up here.'),
    shaft: S('One hollow the grass has not closed over: white chalk sides, and at the bottom a dark mouth going down. It was dug, long ago, with something that was not iron.'),
    terraces: S('Terraces down into the combe, each one a step of turf, ploughed along the hill once.'),
    mist: S('Mist fills the combe below like milk in a bowl, and the hilltops stand out of it like islands.'),
    // the people
    oldName: S('An old woman, a drover\'s daughter'),
    oldGreet: S('"My father drove this road. Twice a year, eight hundred head, and he knew every stone on the down by its note."'),
    oldWork: S('"I can\'t get up to the stones any more. Will you? My father raddled five of them, one stroke to five. The drovers\' call goes three, one, four, two, five." She hums it. "Strike them in that order and they call the flock. Out of order they only make a noise, and noise brings the hounds out of the Hollows."'),
    oldPlace: S('"We were inside the Hedge two years. Tamar Farrant came out first. We\'re the next. I wanted to hear the stones once more."'),
    oldBark: S('The old woman, humming five notes under her breath.'),
    oldPaid: S('The old woman holds your hand in both of hers and leaves a coin in it. "That was it. That was the call."'),
    journal: S('The drove road: I struck the five raddled Grey Wethers in the drovers\' call, three, one, four, two, five, for the old woman at the Three Pines.'),
    manName: S('A returner'), womName: S('A returner, his wife'), boyName: S('A returner\'s boy'),
    manGreet: S('"Two years in the Hedge. We\'re going to see if the farm\'s still there. Wethercombe way, past the Hollows."'),
    manWork: S('"Pulling the cart. Mother can walk, slow. The boy can\'t stop running."'),
    manPlace: S('"It\'s so quiet out here. Inside you never had quiet. You never had room."'),
    manBark: S('A returner, to the cart: "Nearly there. Nearly."'),
    womGreet: S('"Mind the boy. He\'ll talk to you all day."'),
    womWork: S('"Looking. Just looking. I\'d forgotten how far you can see."'),
    womPlace: S('"Tamar wrote that the house still stands. She didn\'t say what\'s in it."'),
    womBark: S('A returner, shading her eyes: "Is that our hill?"'),
    boyGreet: S('"Are those sheep? They\'re not sheep. Gran says they ring."'),
    boyWork: S('"Counting the stones. I got to forty and lost count."'),
    boyPlace: S('"I never saw a hill before. I was little when we went in."'),
    boyBark: S('The boy: "Forty-one. Forty-two."'),
    cutName: S('A furze-cutter'),
    cutGreet: S('"Furze for the beacons. It burns fast and hot and tells the whole Reach you\'re there."'),
    cutWork: S('"Faggots for the Long Down and Hob\'s Knap and Ewe Barrow. Somebody lights them now, nights. I don\'t ask who."'),
    cutPlace: S('"The Hollows? Not after dark. The hounds lie up in them. In the day they\'re only holes."'),
    cutBark: S('A furze-cutter, sucking a thumb: "Every bush bites."'),
  };

  // ---------------------------------------------------------------- the land of the Grey Wethers (north to south)
  const WW = 120, WH = 160, WGN = 60, WGS = 40;
  const WROAD = [[WGN + 0.5, 0.6], [WGN + 0.5, 8], [56, 22], [50, 40], [45, 56], [47, 70], [55, 84], [60, 98], [56, 112], [48, 124], [40, 134], [38, 146], [WGS + 0.5, 154], [WGS + 0.5, WH - 0.6]];
  const WHILLS = [[28, 30, 24, 20, 2.4], [94, 26, 26, 18, 2.8], [100, 104, 22, 30, 3.0], [16, 92, 18, 24, 2.2], [78, 132, 28, 18, 2.6], [22, 150, 20, 12, 1.6], [76, 106, 16, 14, 1.8],
    [14, 6, 10, 6, 2.6], [110, 154, 10, 7, 3.2], [8, 154, 9, 7, 3.0]];
  const VALLEY = [[119, 74], [100, 72], [84, 76], [70, 74]];              // the dry valley; its head is beside the road's swing
  const POND = [92, 88, 2.7], PINES = [[34.5, 126.5], [37.6, 124.6], [36.2, 129.8]], HALT = [32.5, 132.5], PINFOLD = [16, 110, 22, 116];
  const MARKED = [[83.5, 101.5], [74.5, 95.5], [88.5, 113.5], [71.5, 109.5], [80.5, 120.5]];   // the raddled stones, one stroke to five
  const CALL = [2, 0, 3, 1, 4];                                            // "three, one, four, two, five"
  const NOTES = [196, 220, 247, 294, 330];                                 // their notes (a drover's pentatonic) [PROPOSED]
  const FURZE = [[88, 40], [96, 46], [84, 50], [100, 38]];
  const FAR_W = [[28.5, 30.5, 0], [92.5, 104.5, 1], [16.5, 92.5, 2]];     // where the fold-fires show from this stretch (Long Down, Hob's Knap, Ewe Barrow)
  // ---------------------------------------------------------------- the land of the Hundred Hollows
  const HW = 110, HH = 170, HGN = 50, HGS = 56, DOWN_Z = 1.8, HOLLOWAY_END = 58, TERRACE_Y = 130, STEPS = 5;
  const HROAD = [[HGN + 0.5, 0.6], [HGN + 0.5, 6], [46, 18], [54, 32], [49, 46], [52, HOLLOWAY_END], [44, 70], [50, 84], [40, 98], [48, 112], [42, 126], [22, 134], [82, 142], [26, 150], [72, 158], [HGS + 0.5, 163], [HGS + 0.5, HH - 0.6]];
  const SHAFT_NEAR = [82, 96], DENS_NEAR = [[18, 80], [92, 74], [88, 118]];
  const FAR_H = [[30.5, 4.5, 0], [98.5, 26.5, 1], [12.5, 30.5, 2]];

  const GRASS = 0, MOSS = 1, WATER = 2, CHALK = 3, TRACK = 4, MEADOW = 5;
  const FLOORS = ['t_grass', 't_moss', 't_water', 't_p20_chalk', 't_p20_track', 't_p22_meadow'];
  function lineCells(m, pts, w, fn) { along(pts, 0.4, (px, py) => { for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) { const x = Math.floor(px - (w - 1) / 2) + dx, y = Math.floor(py - (w - 1) / 2) + dy; if (x >= 1 && y >= 1 && x < m.w - 1 && y < m.h - 1) fn(x, y, y * m.w + x); } }); }
  const distTo = (pts) => { const L = []; along(pts, 0.5, (x, y) => L.push(x, y)); return (x, y) => { let b = 1e9; for (let i = 0; i < L.length; i += 2) { const d = Math.hypot(L[i] - x, L[i + 1] - y); if (d < b) b = d; } return b; }; };
  // lower the ground: every corner within `wid` of the line comes down toward `floor`, softly at the edge
  function carve(m, test, x0, y0, x1, y1) {
    const V = m.ensureVerts(), W1 = m.w + 1;
    for (let vy = Math.max(0, y0); vy <= Math.min(m.h, y1); vy++) for (let vx = Math.max(0, x0); vx <= Math.min(m.w, x1); vx++) { const z = test(vx, vy, V[vy * W1 + vx]); if (z !== null && z < V[vy * W1 + vx]) V[vy * W1 + vx] = z; }
    m.syncSlopes(x0 - 1, y0 - 1, x1 + 1, y1 + 1);
  }
  const soft = (d, r) => (d >= r ? 0 : 0.5 + 0.5 * Math.cos(PI * d / r));

  // ---------------------------------------------------------------- build: the Grey Wethers
  function buildWethers(up, down) {
    const m = new GameMap(WETHERS, TX.nameW, WW, WH, { outdoor: true, floor: 't_grass', floorTextures: FLOORS, fogDist: 44, fogColor: [66, 70, 64], music: 'wild', danger: 0, spawn: { x: WGN + 0.5, y: 1.6, dir: PI / 2 } });
    m.border('t_hedge');
    m.set(WGN, 0, DOOR({ tex: 't_p20_gate', portal: up, label: TX.upToDowns }));
    m.set(WGS, WH - 1, DOOR({ tex: 't_hedge', portal: down, label: TX.onToHollows }));
    for (const [x, y, rx, ry, hh] of WHILLS) m.hill(x, y, rx, ry, hh);
    const W = WW, roadD = distTo(WROAD), valD = distTo(VALLEY);
    // the dry valley: a long dip in the down, deepest at its mouth in the east, closing at its head beside the road
    carve(m, (vx, vy, z) => { const d = valD(vx, vy); if (d > 9) return null; const k = soft(d, 9) * Math.min(1, Math.max(0.25, (vx - 66) / 24)); return z - 1.6 * k; }, 60, 60, WW, 90);
    // the road: green and wide (the drove), with the ruts of the carts in the middle
    lineCells(m, WROAD, 6, (x, y) => m.setFloor(x, y, MEADOW));
    lineCells(m, WROAD, 2, (x, y) => m.setFloor(x, y, TRACK));
    // the dew-pond: chalk rim, water in the dish
    const [px, py, pr] = POND;
    for (let y = Math.floor(py - pr - 2); y <= py + pr + 2; y++) for (let x = Math.floor(px - pr - 2); x <= px + pr + 2; x++) { const d = Math.hypot(x + 0.5 - px, y + 0.5 - py); if (d < pr) m.setFloor(x, y, WATER); else if (d < pr + 1.3) m.setFloor(x, y, CHALK); }
    m.deco('sign', px - pr - 1.6, py + 0.5, { radius: 0.2, scale: 0.7, label: TX.pond });
    // the pinfold: low walls of flint and chalk, the gateway on its east side, the tally-stick in the north wall
    const [f0, g0, f1, g1] = PINFOLD;
    for (let y = g0; y <= g1; y++) for (let x = f0; x <= f1; x++) { const edge = x === f0 || x === f1 || y === g0 || y === g1; if (!edge || (x === f1 && (y === g0 + 2 || y === g0 + 3))) continue; m.block(x, y, 't_stone', m.groundAt(x + 0.5, y + 0.5) + 0.9, { capTex: 't_stone' }); }
    m.deco('sign', f1 + 1.4, g0 + 2.2, { radius: 0.2, scale: 0.7, label: TX.pinfold });
    m.deco('p83_tally', (f0 + f1) / 2 + 0.5, g0 + 1.25, { radius: 0.1, scale: 0.5, solid: false, label: TX.tally });
    // the Three Pines and the halt under them: the drover's cache under the middle one
    PINES.forEach(([x, y], i) => m.deco('p83_pine', x, y, { radius: 0.4, scale: 1.7 + i * 0.12, label: TX.pines }));
    m.add({ kind: 'item', item: 'cache', tier: 2, x: PINES[0][0] + 0.7, y: PINES[0][1] + 0.6, sprite: 'chest', scale: 0.45, yOff: 0, solid: false, label: TX.cache });
    m.deco('p83_cart', HALT[0] - 2.2, HALT[1] + 0.4, { radius: 0.5, scale: 0.9, label: TX.cart });
    m.deco('hearth', HALT[0], HALT[1], { radius: 0.3, scale: 0.6, solid: false, label: TX.camp, glow: 0.6, hidden: true, _p83d: 'camp' });
    // the furze, and the faggots cut from it
    FURZE.forEach(([x, y], i) => { for (let k = 0; k < 6; k++) { const a = h2(i * 7 + k, 11) * PI * 2, r = 1 + h2(i * 7 + k, 13) * 4; m.deco('p22_furze', x + Math.cos(a) * r, y + Math.sin(a) * r, { radius: 0.4, scale: 0.7 + h2(i, k) * 0.3, label: TX.furze }); } });
    m.deco('p22_hurdle', 92.5, 44.5, { radius: 0.3, scale: 0.6, label: TX.faggots });
    m.deco('sign', WGN - 2.4, 5.6, { radius: 0.2, scale: 0.8, label: TX.drove });
    m.deco('sign', 60.5, 72.5, { radius: 0.2, scale: 0.7, label: TX.valley });
    // the Grey Wethers: the flock of stones on the slope east of the road (and a few strays west of it); five are raddled
    const wethers = [];
    const freeW = (x, y, r) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 2 || cy < 2 || cx > WW - 3 || cy > WH - 3 || m.get(cx, cy)) return false; const f = m.floorCells[cy * W + cx]; if (f === WATER || f === TRACK || f === MEADOW || f === CHALK) return false; return !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r); };
    MARKED.forEach(([x, y], i) => { const e = m.deco('p83_wethm' + (i + 1), x, y, { radius: 0.55, scale: 1.0, label: TX.marked[i], use: 'p83_wether', _p83d: 'wether', _n: i }); wethers.push(e); });
    for (let i = 0, n = 0; i < 600 && n < 92; i++) {
      const a = h2(i, 21) * PI * 2, r = Math.sqrt(h2(i, 23)) * 26, x = 76 + Math.cos(a) * r * 1.1, y = 108 + Math.sin(a) * r * 0.8;
      if (roadD(x, y) < 4.5 || !freeW(x, y, 1.45)) continue;
      const e = m.deco('p83_weth' + (n % 3), x, y, { radius: 0.5, scale: 0.9 + h2(i, 29) * 0.55, label: TX.wether, use: 'p83_wether', _p83d: 'wether', _n: -1, _note: 98 + 98 * [0, 2, 4, 7, 9][n % 5] / 12 + (n % 3) * 3 }); wethers.push(e); n++;
    }
    for (let i = 0, n = 0; i < 80 && n < 8; i++) { const x = 20 + h2(i, 31) * 22, y = 62 + h2(i, 33) * 40; if (roadD(x, y) < 4.5 || !freeW(x, y, 2)) continue; m.deco('p83_weth' + (n % 3), x, y, { radius: 0.5, scale: 0.8, label: TX.wether, use: 'p83_wether', _p83d: 'wether', _n: -1, _note: 110 + n * 7 }); n++; }
    m.deco('sign', 63.5, 100.5, { radius: 0.2, scale: 0.75, label: TX.wethers });
    // hawthorn on the down here and there, never on the road
    for (let i = 0; i < 220; i++) { const x = 3 + h2(i, 41) * (WW - 6), y = 3 + h2(i, 43) * (WH - 6); if (roadD(x, y) < 5 || !freeW(x, y, 4)) continue; m.deco(h2(i, 47) < 0.8 ? 'p20_thorn' : 'p22_haw', x, y, { radius: 0.35, scale: 0.9 + h2(i, 49) * 0.5 }); }
    // where the fold-fires show from here, once they are lit (after dark)
    for (const [x, y, b] of FAR_W) m.deco('p22_beacon_lit', x, y, { radius: 0.1, solid: false, scale: 2.4, glow: 1, label: TX.farFire, hidden: true, _p83d: 'far', _b: b });
    m._p83d = { roadD };
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- build: the Hundred Hollows
  function terraceZ(y) { if (y <= TERRACE_Y) return DOWN_Z; const band = (HH - 2 - TERRACE_Y) / STEPS, k = (y - TERRACE_Y) / band, i = Math.floor(k), f = k - i, s = f < 0.72 ? 0 : (f - 0.72) / 0.28; return Math.max(0, DOWN_Z - DOWN_Z / STEPS * (i + s * s * (3 - 2 * s))); }
  function buildHollows(up, down) {
    const m = new GameMap(HOLLOWS, TX.nameH, HW, HH, { outdoor: true, floor: 't_grass', floorTextures: FLOORS, fogDist: 42, fogColor: [64, 68, 62], music: 'wild', danger: 1, spawn: { x: HGN + 0.5, y: 1.6, dir: PI / 2 } });
    m.border('t_hedge');
    m.set(HGN, 0, DOOR({ tex: 't_hedge', portal: up, label: TX.backToWethers }));
    m.set(HGS, HH - 1, DOOR({ tex: 't_p20_gate', portal: down, label: TX.downToCombe }));
    const W = HW, roadD = distTo(HROAD), laneD = distTo(HROAD.slice(0, 6));
    // the down: high and level, coming down to the combe by terraces at the south end
    const V = m.ensureVerts(), W1 = HW + 1;
    for (let vy = 0; vy <= HH; vy++) for (let vx = 0; vx <= HW; vx++) V[vy * W1 + vx] = vy < 3 ? DOWN_Z * vy / 3 : terraceZ(vy);
    for (let y = 0; y < HH; y++) for (let x = 0; x < HW; x++) m.smooth[y * HW + x] = 1;
    m.syncSlopes(0, 0, HW - 1, HH - 1);
    // a few rises on the edges of the down
    for (const [x, y, rx, ry, hh] of [[12, 30, 12, 16, 1.0], [98, 26, 12, 18, 1.2], [104, 120, 8, 10, 1.4], [5, 122, 6, 8, 1.3], [30, 4, 8, 4, 1.4]]) m.hill(x, y, rx, ry, hh, { base: DOWN_Z });
    // the holloway: the lane worn down between its banks, the hawthorn on the banks meeting overhead
    carve(m, (vx, vy, z) => { if (vy > HOLLOWAY_END + 4) return null; const d = laneD(vx, vy); if (d > 3.4) return null; const deep = vy < 4 ? vy / 4 : vy > HOLLOWAY_END ? Math.max(0, (HOLLOWAY_END + 4 - vy) / 4) : 1; return z - 1.5 * deep * soft(d, 3.4); }, 30, 0, 70, HOLLOWAY_END + 6);
    // the Hundred Hollows: grassed-over pits on the open down, on a loose grid, none on the road; one is open chalk
    const pits = [];
    for (let gy = 0; gy < 10; gy++) for (let gx = 0; gx < 15; gx++) {
      const x = 6 + gx * 7.0 + (gy % 2) * 3.5 + (h2(gx, gy * 3 + 1) - 0.5) * 3.2, y = 65 + gy * 6.4 + (h2(gx * 5 + 2, gy) - 0.5) * 3.0;
      if (x > HW - 5 || y > TERRACE_Y - 4 || roadD(x, y) < 5.6) continue;
      pits.push([x, y, 2.9 + h2(gx, gy + 40) * 0.8, 1.6 + h2(gx + 9, gy) * 0.5]);
    }
    const near = (p) => pits.reduce((b, q, i) => (Math.hypot(q[0] - p[0], q[1] - p[1]) < Math.hypot(pits[b][0] - p[0], pits[b][1] - p[1]) ? i : b), 0);
    const shaft = near(SHAFT_NEAR), dens = DENS_NEAR.map(near);
    const keep = pits.slice(0, 100); if (!keep.includes(pits[shaft])) keep[keep.length - 1] = pits[shaft]; for (const d of dens) if (!keep.includes(pits[d])) keep.splice(keep.length - 2, 1, pits[d]);
    for (const p of keep) { const [x, y, r] = p, dz = p === pits[shaft] ? 2.8 : p[3]; carve(m, (vx, vy, z) => { const d = Math.hypot(vx - x, vy - y); return d >= r ? null : z - dz * soft(d, r); }, Math.floor(x - r) - 1, Math.floor(y - r) - 1, Math.ceil(x + r) + 1, Math.ceil(y + r) + 1); }
    // the road: narrow through the holloway, a drove again across the down, a cart-track down the terraces
    lineCells(m, HROAD.slice(0, 6), 2, (x, y) => m.setFloor(x, y, TRACK));
    lineCells(m, HROAD.slice(5, 12), 4, (x, y) => m.setFloor(x, y, MEADOW));
    lineCells(m, HROAD.slice(5, 12), 2, (x, y) => m.setFloor(x, y, TRACK));
    lineCells(m, HROAD.slice(11), 2, (x, y) => m.setFloor(x, y, TRACK));
    // the open hollow: bare chalk, and a dark mouth at the bottom (Phase 85: the Antler Galleries; nothing opens yet)
    { const [x, y, r] = pits[shaft]; for (let yy = Math.floor(y - r); yy <= y + r; yy++) for (let xx = Math.floor(x - r); xx <= x + r; xx++) if (Math.hypot(xx + 0.5 - x, yy + 0.5 - y) < r - 0.9) m.setFloor(xx, yy, CHALK);
      m.deco('p83_shaft', x, y, { radius: 0.6, scale: 1.5, solid: true, label: TX.shaft, _p83d: 'shaft' }); }
    keep.forEach((p, i) => { if (i % 9 === 4 && p !== pits[shaft]) m.deco('p83_none', p[0], p[1], { radius: 0.1, scale: 0.3, solid: false, label: TX.hollow }); });
    const DENS = dens.map((d) => [pits[d][0], pits[d][1]]);
    DENS.forEach(([x, y]) => m.deco('p83_none', x, y, { radius: 0.1, scale: 0.3, solid: false, label: TX.den, _p83d: 'den' }));
    // the holloway's hawthorn: close on both banks, all the way, a tree every pace or so
    along(HROAD.slice(0, 6), 1.3, (x, y) => { for (const s of [-1, 1]) { const k = Math.floor(x * 13 + y * 7) + s, ox = x + s * (2.6 + h2(k, 3) * 0.6), oy = y + (h2(k, 5) - 0.5) * 0.8; if (oy < 3 || oy > HOLLOWAY_END + 2) continue; m.deco(h2(k, 7) < 0.6 ? 'p22_haw' : 'p20_thorn', ox, oy, { radius: 0.45, scale: 1.5 + h2(k, 9) * 0.5 }); } });
    m.deco('sign', HGN - 1.9, 7.5, { radius: 0.2, scale: 0.75, label: TX.holloway });
    m.deco('sign', 48.5, 66.5, { radius: 0.2, scale: 0.75, label: TX.hollows });
    m.deco('sign', 39.5, 129.5, { radius: 0.2, scale: 0.75, label: TX.terraces });
    // hawthorn and furze scattered on the down, never in a hollow or on the road
    const freeH = (x, y, r) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 2 || cy < 2 || cx > HW - 3 || cy > HH - 3 || m.get(cx, cy)) return false; if (m.floorCells[cy * W + cx] !== GRASS) return false; if (keep.some((p) => Math.hypot(p[0] - x, p[1] - y) < p[2] + 0.6)) return false; return !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r); };
    for (let i = 0; i < 300; i++) { const x = 3 + h2(i, 51) * (HW - 6), y = HOLLOWAY_END + 4 + h2(i, 53) * (HH - HOLLOWAY_END - 8); if (roadD(x, y) < 4 || !freeH(x, y, 4.5)) continue; m.deco(h2(i, 57) < 0.2 ? 'p22_haw' : 'p20_thorn', x, y, { radius: 0.4, scale: 0.8 + h2(i, 59) * 0.5 }); }
    for (let i = 0; i < 160; i++) { const x = 3 + h2(i, 61) * (HW - 6), y = 3 + h2(i, 63) * (HOLLOWAY_END - 3); if (laneD(x, y) < 5 || !freeH(x, y, 3.5)) continue; m.deco(h2(i, 67) < 0.7 ? 'oak' : 'p22_haw', x, y, { radius: 0.45, scale: 1.3 + h2(i, 69) * 0.5 }); }
    // the mist that fills the combe at dawn after a wet night: in the 3D view a white sea at one level over the terraces,
    // with the higher ground standing out of it (wire3d below); here, what it says when you look at it
    for (let i = 0; i < 6; i++) m.deco('p83_none', 10 + i * 18, TERRACE_Y + 18 + (i % 2) * 12, { radius: 0.05, solid: false, scale: 0.3, label: TX.mist, hidden: true, _p83d: 'mist' });
    for (const [x, y, b] of FAR_H) m.deco('p22_beacon_lit', x, y, { radius: 0.1, solid: false, scale: 2.4, glow: 1, label: TX.farFire, hidden: true, _p83d: 'far', _b: b });
    m._p83d = { roadD, DENS, shaft: pits[shaft], pits: keep.length };
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  const doorTo = (m, target) => { for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === target) return c; } return null; };
  function join(maps) {
    const downs = maps[DOWNS], combe = maps[COMBE]; if (!downs || !combe || maps[WETHERS]) return false;
    const out = doorTo(downs, COMBE), back = doorTo(combe, DOWNS); if (!out || !back) return false;
    const wN = { map: WETHERS, x: WGN + 0.5, y: 1.6, dir: PI / 2 }, wS = { map: WETHERS, x: WGS + 0.5, y: WH - 1.6, dir: -PI / 2 };
    const hN = { map: HOLLOWS, x: HGN + 0.5, y: 1.6, dir: PI / 2 }, hS = { map: HOLLOWS, x: HGS + 0.5, y: HH - 1.6, dir: -PI / 2 };
    maps[WETHERS] = buildWethers(Object.assign({}, back.portal), hN);
    maps[HOLLOWS] = buildHollows(wS, Object.assign({}, out.portal));
    out.portal = wN; back.portal = hS;
    return true;
  }

  // ---------------------------------------------------------------- the stones' notes
  let ctxWarn = false;
  function ring(freq, vol) {
    try {
      const A = typeof Audio_ !== 'undefined' ? Audio_ : null, ctx = A && A.ctx; if (!ctx) return;
      const out = A.sfxBus || A.master || ctx.destination, t = ctx.currentTime;
      for (const [mul, v, d] of [[1, 1, 2.6], [2.76, 0.32, 1.3], [5.4, 0.12, 0.6]]) {
        const o = ctx.createOscillator(), g = ctx.createGain(); o.type = 'sine'; o.frequency.value = freq * mul;
        g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol * v), t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
        o.connect(g).connect(out); o.start(t); o.stop(t + d + 0.05);
      }
    } catch (e) { if (!ctxWarn) { ctxWarn = true; warnOnce('ring', e); } }
  }

  const MIST_Z = 0.84;                                                       // the mist's level: the low terraces go under, the rest stands out
  function mistNow() { const h = hour(), day = typeof G !== 'undefined' ? Number(G.day) || 0 : 0; return !wet() && h >= 5 && h < 8.5 && day > 0 && typeof G !== 'undefined' && G.flags && Number(G.flags.p83d_wetnight) === day; }

  // ---------------------------------------------------------------- the hour, the weather, the task
  const f = () => G.flags, fint = (k, hi) => { const v = Number(f()['p83d_' + k]); return Number.isFinite(v) ? Math.max(0, Math.min(hi, Math.floor(v))) : 0; };
  const lit = (b) => !!(G.flags && Number(G.flags['p22w_b' + b]) === 1);
  let tick = 0, windI = 0;
  function sync() {
    if (typeof G === 'undefined' || !G.map || !G.flags) return;
    const h = hour(), day = Number(G.day) || 0;
    // a wet night, wherever you are: its dawn is the next morning's (or this morning's, after midnight)
    if (wet() && (h >= 20 || h < 5)) f().p83d_wetnight = h >= 20 ? day + 1 : day;
    const id = G.map.id; if (id !== WETHERS && id !== HOLLOWS) return;
    const nt = night(), dawnMist = mistNow();
    for (const e of G.ents) {
      if (!e || !e._p83d) continue;
      if (e._p83d === 'far') e.hidden = !(nt && lit(e._b));
      if (e._p83d === 'far') e.lightCol = e.hidden ? undefined : [110, 60, 16];
      if (e._p83d === 'camp') { e.hidden = !nt; e.lightCol = nt ? [90, 50, 14] : undefined; }
      if (e._p83d === 'mist') e.hidden = !dawnMist;
      if (e._p83d === 'wether' && e._n < 0) e.label = windy() ? TX.wetherWind : TX.wether;
    }
    if (id === WETHERS && windy()) { tick++; if (tick % 70 === 0) { const st = G.ents.filter((e) => e && e._p83d === 'wether'); const e = st[windI++ % Math.max(1, st.length)]; if (e) ring(e._n >= 0 ? NOTES[e._n] : e._note || 150, 0.02); } }
    if (id === HOLLOWS) dens(nt);
  }
  // hounds lie up in the Hollows after dark; by day the dens are empty (any hound not after you goes back to ground)
  function dens(nt) {
    const m = G.map, d = m._p83d; if (!d || !d.DENS) return;
    const mine = m.entities.filter((e) => e && e._p83den != null && !e.dead && !(e.hp <= 0));
    if (nt) {
      d.DENS.forEach(([x, y], i) => { if (mine.some((e) => e._p83den === i)) return; let h = null; try { h = hydrate({ kind: 'enemy', type: 'hound', x, y }); } catch (e) { h = { kind: 'enemy', type: 'hound', x, y, hp: 12 }; } m.entities.push(Object.assign(h, { transient: true, _p83den: i })); });
    } else {
      const c = typeof Engine !== 'undefined' ? Engine.cam : null;
      for (const e of mine) { const busy = e.state === 'chase' || e.state === 'attack' || e.aggro; if (!busy || !c || Math.hypot(e.x - c.x, e.y - c.y) > 14) { const i = m.entities.indexOf(e); if (i >= 0) m.entities.splice(i, 1); } }
    }
  }
  // knock a stone: the five raddled ones in the drovers' call (three, one, four, two, five) call the flock once more
  function strike(e) {
    if (!e || e._p83d !== 'wether') return false;
    if (e._n < 0) { ring(e._note || 150, 0.12); say(TX.knock, '', 4000); return true; }
    ring(NOTES[e._n], 0.18);
    const done = fint('call', 5) >= 5; if (done) { say(TX.marked[e._n], '', 4000); return true; }
    const at = fint('call', 5);
    if (CALL[at] !== e._n) { f().p83d_call = 0; G.noise = Math.max(Number(G.noise) || 0, 3.2); say(TX.callWrong, 'warn', 5000); return true; }
    f().p83d_call = at + 1;
    if (at + 1 < 5) { say(TX.callOk, 'good', 4000); return true; }
    say(TX.callDone, 'good', 8000);
    if (!fint('paid', 1)) { f().p83d_paid = 1; try { G.gold(6); questXp(35); journal('side', TX.journal); } catch (er) { /* no purse */ } setTimeout(() => say(TX.oldPaid, 'good', 7000), 2600); }
    return true;
  }
  function useOwn(e) { if (!e || e.use !== 'p83_wether') return false; return strike(e); }

  // ---------------------------------------------------------------- the people
  const st = (from, to, job, at) => ({ from, to, job, at });
  const H = (dx, dy) => [HALT[0] + dx, HALT[1] + dy];
  const ROSTERS = {
    [WETHERS]: [
      { key: 'dr_old', name: TX.oldName, sprite: 'p60_wom_c', home: H(1.4, 1.2), day: [st(6, 21, 'sit', H(1.4, 1.2)), { from: 21, to: 6, job: 'home', at: H(1.4, 1.2) }],
        greet: TX.oldGreet, work: TX.oldWork, place: TX.oldPlace, barks: [TX.oldBark] },
      { key: 'dr_man', name: TX.manName, sprite: 'p60_man_b', home: H(-2.6, 1.6), day: [st(6, 9, 'carry', H(-1.8, 0.8)), st(9, 12, 'carry', [26.5, 118.5]), st(12, 20, 'sit', H(-1.2, 2.2)), { from: 20, to: 6, job: 'home', at: H(-2.6, 1.6) }],
        greet: TX.manGreet, work: TX.manWork, place: TX.manPlace, barks: [TX.manBark] },
      { key: 'dr_wom', name: TX.womName, sprite: 'p60_wom_a', home: H(0.4, 2.6), day: [st(6, 10, 'sit', H(0.4, 2.6)), st(10, 14, 'reach', [44.5, 110.5]), st(14, 20, 'sit', H(0.2, 2.8)), { from: 20, to: 6, job: 'home', at: H(0.4, 2.6) }],
        greet: TX.womGreet, work: TX.womWork, place: TX.womPlace, barks: [TX.womBark] },
      { key: 'dr_boy', name: TX.boyName, sprite: 'p60_man_c', scale: 0.7, home: H(0.8, -1.2), day: [st(7, 12, 'play', [52.5, 104.5]), st(12, 13, 'sit', H(0.9, -1.0)), st(13, 19, 'play', [46.5, 116.5]), { from: 19, to: 7, job: 'home', at: H(0.8, -1.2) }],
        greet: TX.boyGreet, work: TX.boyWork, place: TX.boyPlace, barks: [TX.boyBark] },
      { key: 'dr_cut', name: TX.cutName, sprite: 'p60_man_a', home: [WGN + 0.5, 1.6], exit: [WGN + 0.5, 1.6], day: [st(8, 12, 'rake', [90.5, 42.5]), st(12, 13, 'sit', [93.5, 45.5]), st(13, 17, 'rake', [86.5, 48.5]), { from: 17, to: 8, job: 'home' }],
        greet: TX.cutGreet, work: TX.cutWork, place: TX.cutPlace, barks: [TX.cutBark] },
    ],
  };

  // ---------------------------------------------------------------- art (code only, no random numbers)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    const blob = (x, cx, cy, rx, ry, col) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, PI * 2); x.fill(); };
    add('p83_none', 2, 2, 0.1, () => {});
    // hawthorn overhead, seen from under it: dark leaves, the odd haw, and May blossom
    if (Engine.addTexture && !(typeof Engine.textures === 'object' && Engine.textures && Engine.textures.t_p83_haw)) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#1e3018'; x.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 150; i++) blob(x, h2(i, 81) * 64, h2(i, 83) * 64, 2 + h2(i, 85) * 2.6, 1.4 + h2(i, 87) * 1.6, ['#2c4422', '#36522a', '#24381c', '#40602e'][i % 4]);
      for (let i = 0; i < 14; i++) blob(x, h2(i, 89) * 64, h2(i, 91) * 64, 1, 1, i % 3 ? '#e8e4d8' : '#a82a1e');
      try { Engine.addTexture('t_p83_haw', new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('haw', e); }
    }
    // a grey wether: a sarsen lying in the grass, low and rounded like a sheep lying down; lichen on its back
    const wether = (x, w, h, v, strokes) => {
      blob(x, w / 2, h - 3, w * 0.46, 3, 'rgba(0,0,0,0.28)');
      const g = x.createLinearGradient(0, 6, 0, h); g.addColorStop(0, '#b4b0a4'); g.addColorStop(0.6, '#8a867a'); g.addColorStop(1, '#5e5a50');
      x.fillStyle = g; x.beginPath();
      const k = [[0.06, 1], [0.08, 0.55 - v * 0.05], [0.22, 0.22 + v * 0.04], [0.46, 0.12], [0.7, 0.2 - v * 0.03], [0.9, 0.42], [0.95, 1]];
      x.moveTo(k[0][0] * w, h - 3);
      for (let i = 1; i < k.length; i++) { const [a, b] = k[i - 1], [c, d] = k[i]; x.quadraticCurveTo(a * w, b * h, (a + c) / 2 * w, (b + d) / 2 * h); }
      x.lineTo(0.95 * w, h - 3); x.closePath(); x.fill();
      for (let i = 0; i < 16; i++) blob(x, w * (0.18 + h2(i, v + 3) * 0.64), h * (0.26 + h2(i, v + 7) * 0.5), 1.4 + h2(i, v) * 2.2, 1 + h2(i, v + 1), i % 3 ? 'rgba(150,160,110,0.55)' : 'rgba(200,196,150,0.5)');
      for (let i = 0; i < 5; i++) blob(x, w * (0.2 + h2(i, v + 11) * 0.6), h * (0.4 + h2(i, v + 13) * 0.4), 0.9, 0.6, 'rgba(50,48,42,0.5)');
      for (let s = 0; s < strokes; s++) { x.fillStyle = '#a83020'; x.fillRect(w * 0.34 + s * 4.4, h * 0.2 + (s % 2), 2.4, 7); x.fillStyle = 'rgba(120,30,20,0.6)'; x.fillRect(w * 0.34 + s * 4.4, h * 0.2 + 6 + (s % 2), 2.4, 2); }
    };
    for (let v = 0; v < 3; v++) add('p83_weth' + v, 64 + v * 8, 30 + v * 3, 0.56, (x, w, h) => wether(x, w, h, v, 0));
    for (let n = 1; n <= 5; n++) add('p83_wethm' + n, 70, 33, 0.6, (x, w, h) => wether(x, w, h, n % 3, n));
    // a Scots pine: a bare red trunk and dark flat-topped crowns
    add('p83_pine', 64, 128, 3.2, (x, w, h) => {
      x.fillStyle = '#7a4a2e'; x.fillRect(29, 34, 6, h - 34); x.fillStyle = '#9a6040'; x.fillRect(30, 40, 2, h - 44);
      x.strokeStyle = '#6a3e26'; x.lineWidth = 2; for (const [a, b, c, d] of [[32, 46, 14, 30], [32, 52, 52, 36], [32, 64, 18, 52], [32, 40, 46, 22]]) { x.beginPath(); x.moveTo(a, b); x.lineTo(c, d); x.stroke(); }
      for (const [cx, cy, rx, ry] of [[32, 18, 22, 11], [14, 30, 11, 6], [50, 34, 12, 6], [20, 50, 10, 5], [44, 22, 10, 6]]) { blob(x, cx, cy, rx, ry, '#24382a'); blob(x, cx - 2, cy - 2, rx * 0.7, ry * 0.6, '#30483a'); }
    });
    // a handcart under a roped blanket
    add('p83_cart', 72, 44, 0.6, (x) => {
      x.fillStyle = '#4a3a28'; x.fillRect(6, 22, 52, 6); x.fillRect(56, 20, 14, 3);
      blob(x, 30, 20, 24, 10, '#6a5440'); blob(x, 30, 16, 20, 7, '#7a6450'); x.strokeStyle = '#c8b890'; x.lineWidth = 1.2; for (const sx of [16, 30, 44]) { x.beginPath(); x.moveTo(sx, 10); x.lineTo(sx + 2, 28); x.stroke(); }
      for (const cx of [16, 46]) { x.strokeStyle = '#2a2016'; x.lineWidth = 3; x.beginPath(); x.arc(cx, 34, 8, 0, PI * 2); x.stroke(); x.lineWidth = 1; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(cx, 34); x.lineTo(cx + Math.cos(i) * 8, 34 + Math.sin(i) * 8); x.stroke(); } }
    });
    // a tally-stick in a crack of flint
    add('p83_tally', 24, 30, 0.35, (x) => { x.fillStyle = '#6a6458'; x.fillRect(0, 16, 24, 14); x.fillStyle = '#c8b48a'; x.fillRect(10, 2, 4, 20); x.fillStyle = '#3a2c1c'; for (let i = 0; i < 7; i++) x.fillRect(10, 4 + i * 2.4, i === 6 ? 4 : 2, 1); });
    // the open hollow's mouth: chalk lip and darkness
    add('p83_shaft', 64, 24, 0.3, (x) => { blob(x, 32, 13, 30, 10, '#d8d4c8'); blob(x, 32, 14, 22, 7, '#a8a498'); blob(x, 32, 15, 15, 5, '#141210'); blob(x, 32, 16, 9, 3, '#000'); });
    // dawn mist seen from above: white, with faint folds
    if (Engine.addTexture) {
      const c = document.createElement('canvas'); c.width = c.height = 64; const x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#e4e6e2'; x.fillRect(0, 0, 64, 64);
      for (let i = 0; i < 40; i++) for (const ox of [-64, 0, 64]) for (const oy of [-64, 0, 64]) blob(x, h2(i, 95) * 64 + ox, h2(i, 97) * 64 + oy, 6 + h2(i, 99) * 10, 2 + h2(i, 101) * 3, i % 2 ? 'rgba(255,255,255,0.45)' : 'rgba(214,218,220,0.3)');   // tiles without a seam
      try { Engine.addTexture('t_p83_mist', new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('mist', e); }
    }
  }

  // ---------------------------------------------------------------- the holloway's roof, in the 3D view
  function wire3d() {
    if (typeof EAVES78 === 'undefined' || !EAVES78.STYLES || !EAVES78.REGION) return;
    EAVES78.STYLES[HOLLOWS] = { builds: 'nothing built: a holloway under hawthorn', shutters: 'none', only: ['the hawthorn meeting over the holloway'], plan: () => ({ houses: [] }) };
    EAVES78.MAPS.add(HOLLOWS);
    EAVES78.REGION[HOLLOWS] = (m, T) => {
      // the hawthorn's roof: an arch of leaves resting on the crowns of the two banks' trees, lumpy on top and ragged at
      // its edges, cut in slices along the lane (each slice a curve across it, from one bank's crowns over to the other's)
      const Lh = T.L('t_p83_haw'), S = [];
      const S0 = []; along(HROAD.slice(1, 6), 0.75, (x, y) => { if (y >= 4 && y <= HOLLOWAY_END + 1) S0.push([x, y]); });
      // round the bends off (a roof three cells wide cannot turn as sharp as the lane does without folding over itself)
      for (let i = 0; i < S0.length; i++) { let sx = 0, sy = 0, n = 0; for (let j = Math.max(0, i - 8); j <= Math.min(S0.length - 1, i + 8); j++) { sx += S0[j][0]; sy += S0[j][1]; n++; } S.push([sx / n, sy / n]); }
      const K = 9, rows = [];                                                    // K points across each slice
      S.forEach(([x, y], i) => {
        const [ax, ay] = S[Math.max(0, i - 5)], [bx, by] = S[Math.min(S.length - 1, i + 5)], l = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / l, ny = (bx - ax) / l;
        const end = Math.min(1, i / 4, (S.length - 1 - i) / 4);                  // the roof thins and drops at either end of the holloway
        const zL = m.groundAt(x - nx * 2.9, y - ny * 2.9), zR = m.groundAt(x + nx * 2.9, y + ny * 2.9), base = Math.max(zL, zR) + 0.85;
        const lo = [], hi = [];
        for (let k = 0; k < K; k++) {
          const t = k / (K - 1) * 2 - 1, n1 = h2(i * 13 + k, 71), n2 = h2(i * 7 + k * 3, 73);
          const r = (3.0 + (n1 - 0.5) * 0.7) * (0.75 + 0.25 * end), o = t * r;
          const arch = (1 - t * t) * (0.75 + n2 * 0.3) * end, edge = Math.abs(t) > 0.99 ? (n2 - 0.5) * 0.35 : 0;
          const zb = base - 0.25 * (1 - end) + arch + edge, th = (0.18 + 0.4 * (1 - t * t) + n1 * 0.34 + (1 - t * t) * 0.18 * (1 + Math.sin(i * 0.45 + k))) * (0.4 + 0.6 * end);
          lo.push([x + nx * o, y + ny * o, zb]); hi.push([x + nx * o, y + ny * o, zb + th]);
        }
        rows.push({ lo, hi, d: i * 0.75 });
      });
      const nrm = (a, b, c, up) => { const ux = b[0] - a[0], uy = b[1] - a[1], uz = b[2] - a[2], vx = c[0] - a[0], vy = c[1] - a[1], vz = c[2] - a[2]; let X = uy * vz - uz * vy, Y = uz * vx - ux * vz, Z = ux * vy - uy * vx; const L = Math.hypot(X, Y, Z) || 1; X /= L; Y /= L; Z /= L; if ((Z > 0) !== up) { X = -X; Y = -Y; Z = -Z; } return [X, Y, Z]; };
      for (let i = 0; i + 1 < rows.length; i++) {
        const A = rows[i], B = rows[i + 1], u0 = A.d / 2.2, u1 = B.d / 2.2;
        for (let k = 0; k + 1 < K; k++) {
          const v0 = k / (K - 1) * 2.6, v1 = (k + 1) / (K - 1) * 2.6;
          // underneath, darker: what you see walking in the tunnel
          T.quad([A.lo[k], A.lo[k + 1], B.lo[k + 1], B.lo[k]], [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], Lh, T.MAT.wall, 0.55, nrm(A.lo[k], A.lo[k + 1], B.lo[k], false));
          // on top, lighter and lumpy: what you see from the down above it
          T.quad([A.hi[k], A.hi[k + 1], B.hi[k + 1], B.hi[k]], [[u0, v0], [u0, v1], [u1, v1], [u1, v0]], Lh, T.MAT.wall, 0.92, nrm(A.hi[k], A.hi[k + 1], B.hi[k], true));
        }
        // the ragged edges along both banks, where the roof comes down into the crowns
        for (const k of [0, K - 1]) T.quad([A.lo[k], B.lo[k], B.hi[k], A.hi[k]], [[u0, 0], [u1, 0], [u1, 0.4], [u0, 0.4]], Lh, T.MAT.wall, 0.7, k ? [rows[i].hi[k][0] - rows[i].hi[k - 1][0], rows[i].hi[k][1] - rows[i].hi[k - 1][1], 0] : [rows[i].hi[0][0] - rows[i].hi[1][0], rows[i].hi[0][1] - rows[i].hi[1][1], 0]);
      }
      // the two ends of the roof, closed
      for (const R of [rows[0], rows[rows.length - 1]]) if (R) for (let k = 0; k + 1 < K; k++) T.quad([R.lo[k], R.lo[k + 1], R.hi[k + 1], R.hi[k]], [[k / 4, 0], [(k + 1) / 4, 0], [(k + 1) / 4, 0.4], [k / 4, 0.4]], Lh, T.MAT.wall, 0.75, [0, R === rows[0] ? -1 : 1, 0]);
      if (mistNow()) {                                                         // the white sea over the combe end
        const Lm = T.L('t_p83_mist'), y0 = TERRACE_Y + 6;
        for (let y = y0; y < HH - 1; y += 8) for (let x = 1; x < HW - 1; x += 8) { const x1 = Math.min(HW - 1, x + 8), y1 = Math.min(HH - 1, y + 8);
          const u = (v) => v / 8; T.quad([[x, y1, MIST_Z], [x1, y1, MIST_Z], [x1, y, MIST_Z], [x, y, MIST_Z]], [[u(x), u(y1)], [u(x1), u(y1)], [u(x1), u(y)], [u(x), u(y)]], Lm, T.MAT.wall, 1.3, [0, 0, 1]); }
      }
    };
    // the mist comes and goes with the hour: rebuild the 3D view when it does
    if (typeof R3D !== 'undefined' && R3D.on && R3D.invalidate) { let was = null; R3D.on('frame', (F) => { const m = F && F.map; if (!m || m.id !== HOLLOWS) return; const now = mistNow(); if (was !== null && now !== was) R3D.invalidate(); was = now; }); }
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    art(); wire3d();
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () {
        const maps = _b.apply(this, arguments);
        try { art(); if (join(maps) && typeof FLORA !== 'undefined' && FLORA.place) FLORA.place({ [WETHERS]: maps[WETHERS], [HOLLOWS]: maps[HOLLOWS] }); } catch (e) { warnOnce('build', e); }
        return maps;
      };
    }
    try { if (typeof FLORA !== 'undefined' && FLORA.PLANS) { FLORA.PLANS[WETHERS] = FLORA.PLANS[WETHERS] || { grass: 1300 }; FLORA.PLANS[HOLLOWS] = FLORA.PLANS[HOLLOWS] || { grass: 1100 }; } } catch (e) { /* no grass */ }
    try { if (typeof LANDMARKS !== 'undefined') for (const id of [WETHERS, HOLLOWS]) if (!LANDMARKS[id]) LANDMARKS[id] = [
      { a: -2.4, aw: 1.4, h: 0.14, p: 1.1, ridge: 0.4, seed: 2.2, far: 0.7, c: [70, 76, 62] },
      { a: 0.9, aw: 1.6, h: 0.11, p: 1.0, ridge: 0.35, seed: 5.3, far: 0.6, c: [66, 72, 60] },
    ]; } catch (e) { /* the plain sky */ }
    try { if (typeof LIFE60 !== 'undefined' && LIFE60.add) LIFE60.add(WETHERS, ROSTERS[WETHERS], {}); } catch (e) { warnOnce('people', e); }
    if (typeof useDeco === 'function') { const _u = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (er) { /* fall through */ } return _u.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(); } catch (e) { warnOnce('sync', e); } return r; }; }
    if (typeof update === 'function') { const _u2 = update; update = function () { const r = _u2.apply(this, arguments); try { sync(); } catch (e) { /* next frame */ } return r; }; }
    // the finger-posts at the four new gates (js/bearings82b.js reads these lists)
    if (typeof window !== 'undefined') {
      window.P82B_REMAP = Object.assign(window.P82B_REMAP || {}, { [DOWNS]: { [COMBE]: WETHERS }, [COMBE]: { [DOWNS]: HOLLOWS } });
      window.P82B_POSTS = (window.P82B_POSTS || []).concat([
        { id: 'wethers_north', map: WETHERS, to: [DOWNS], text: S('A finger-post. THE WATCH DOWNS, up. The other arm: WETHERCOMBE, down the drove.') },
        { id: 'wethers_south', map: WETHERS, to: [HOLLOWS], text: S('A finger-post. THE HUNDRED HOLLOWS. Under it, cut small: keep to the road after dark.') },
        { id: 'hollows_north', map: HOLLOWS, to: [WETHERS], text: S('A finger-post. THE GREY WETHERS, back. Under it, smaller: THE WATCH DOWNS.') },
        { id: 'hollows_south', map: HOLLOWS, to: [COMBE], text: S('A finger-post. WETHERCOMBE, down. The Bellwether\'s ram is burned into it.') },
      ]);
    }
  }
  wire();

  return { mistNow, MIST_Z, WETHERS, HOLLOWS, TX, TEXTS, ROSTERS, WROAD, HROAD, MARKED, CALL, NOTES, POND, PINES, PINFOLD, HALT, terraceZ, buildWethers, buildHollows, join, sync, strike, useOwn, dens, h2 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DROVE83;
if (typeof window !== 'undefined') window.DROVE83 = DROVE83;
