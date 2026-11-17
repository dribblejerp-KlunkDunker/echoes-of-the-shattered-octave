// ============================================================
//  vigil96 — the Dawning Heights, part four: Sun-Peak Vigil (Phase 96; plan: Phase 89:205, 271 and Phase 90:130,
//  approved 14 Nov 2026; built from team B's design and lore brief, 16 Nov).
//
//  WHAT THE BOOKS MADE OF THE PLAN. No book names the Vigil. It stands in the Series Bible (its name, :204) and in Vol II:
//  "SUN-PEAK VIGIL — Mountain monastery ... Twelve clergy left" (:91); "THE CHALK CLIFFS ... Shadow remnants crawl up them
//  nightly. The Vigil rings a bell at dusk and the bell is the only thing that works" (:93); "Abbess Coriel of Sun-Peak
//  Vigil (f, 80s) ... Watched the Rite and did nothing. Will help the party, completely, instantly, at any cost to herself,
//  and will not accept thanks" (:100). Vol III re-labels the "old faith" as the Reach's Cantor craft (:22) and strikes the
//  Under-Choirs (:18), so Vol II's "what is under the Altar" and its "thirty-eight years" lose their ground, and the plan's
//  under-stair and lullaby lean on Book Four's keepers and Longest Night. All of that is cut. The Vigil here is a house of
//  twelve clergy who keep a bell, with no doctrine of its own. The Rite Coriel watched is the canon one: "three hundred
//  sunrises at the Dawning Spire" (Series Bible:184). No cloud deck: snow on the peaks (Book Two: "snow on their summits").
//  The place is in Harvestmonth 419: nobody here knows of the Restoration (Ashfall).
//
//  THE ROOMS: the landing shelf (the Kestrel sets you down); the gate and its gate-bell (ring it and Brother Fabian opens);
//  the cloister of twelve (twelve cell doors round a snow garth; eleven are not yours to open); the Abbess's cell (its own
//  dark map); the dusk-bell tower (Sister Ottavia and the rope); the tower yard and the postern to the Chalk Cliffs.
//
//  THE DUSK BELL: `bell(tod)` is the contract with js/cliffs96.js: twelve strokes from tod 0.75, one every 1/360 of a day,
//  worked out from G.tod alone. The player never rings it.
//
//  Flags (small ints, team B): p96b_gate (0/1, the gate opened), p96b_help (day+1 of Coriel's last help, 0..9999),
//  p96b_thank (0..99, thanks refused), p96b_seen (bits, the once lines). No lamp, no foes, no items.
// ============================================================
'use strict';

const VIGIL96 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p96_vigil', CELL = 'p96_cell';
  const W = 56, H = 48, CW = 12, CH = 10;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('vigil96: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('Sun-Peak Vigil'),
    nameCell: S('Sun-Peak Vigil: the Abbess\'s cell'),
    // the Kestrel's far entry
    fly: S('Fly to Sun-Peak Vigil, on the peaks of the Dawning Heights.'),
    arrive: S('Thirty hours south, over the white peaks, the Kestrel comes down on a shelf of snow below a white wall and a bell tower.'),
    down: S('You climb down onto the snow. It is very cold, and very quiet. Above you, a white wall, a gate, and a bell tower.'),
    toLabel: S('the snow shelf below Sun-Peak Vigil'),
    ladder: S('The Kestrel\'s ladder, hanging over the snow. Climb aboard'),
    kestrel: S('The Kestrel, moored on the shelf, her envelope stiff with frost.'),
    // the gate
    gate: S('The gate of Sun-Peak Vigil'),
    gateShut: S('Shut. There is a bell on a post by the gate.'),
    gatebell: S('A small bronze bell on a post by the gate, with a rope. Ring it'),
    gatebellOpen: S('The small bell on its post. The gate is open.'),
    gateOpenAlready: S('The gate stands open.'),
    firstSight: S('A white wall on the mountainside, a gate in it, and a bell tower above. A small bell hangs on a post by the gate.'),
    // the cloister
    cloister: S('The cloister. A walk round a square of snow, and twelve doors.'),
    cellDoor: S('A cell of the house'),
    cellShut: S('A cell of the house. It is not yours to open.'),
    abbessDoor: S('The Abbess\'s cell'),
    cellBack: S('The door, back out to the cloister'),
    pillar: S('A pillar of the walk, white stone, worn smooth at the height of a hand.'),
    // the cell
    cot: S('A cot with one grey blanket.'),
    desk: S('A plain desk. A book lies shut on it, and a tallow lamp burns beside it.'),
    lamp: S('A tallow lamp, burned low.'),
    window: S('A small window. Through it, the white peaks, and the sky over them.'),
    // the tower, the yard
    tower: S('The dusk-bell tower. The bell hangs at the top, dark bronze. A rope comes down inside.'),
    bell: S('The dusk bell, at the top of the tower. Dark bronze.'),
    rope: S('The bell rope, with a wool grip worn dark by hands.'),
    ropeLine: S('Sister Ottavia: That is ours to ring.'),
    yard: S('The tower yard. Past the parapet the mountain falls away.'),
    parapet: S('A low parapet. Below it the mountain falls away to the chalk cliffs.'),
    postern: S('The postern, down to the chalk cliffs'),
    posternBarred: S('Barred.'),
    // the dusk bell (Vol II:93)
    duskFirst: S('The dusk bell. Sister Ottavia rings it.'),
    // Coriel's help (Vol II:100: "completely, instantly, at any cost to herself")
    helped: S('She does not ask what is wrong. She sits you on the cot and sees to every hurt you have, and gives you her own bread and her own water. It is done before you can say no.'),
    helpNone: S('Tomorrow. I have nothing left today.'),
    // the people's names
    coriel: S('Abbess Coriel'),
    fabian: S('Brother Fabian'), ottavia: S('Sister Ottavia'), domitia: S('Sister Domitia'),
    albinus: S('Brother Albinus'), honoria: S('Sister Honoria'), marcellin: S('Brother Marcellin'), prisca: S('Sister Prisca'),
    quintin: S('Brother Quintin'), liviana: S('Sister Liviana'), clemence: S('Sister Clemence'), galen: S('Brother Galen'),
    // her topics, as buttons
    tHelp: S('Ask for her help'),
    tThank: S('Thank her'),
  };
  // what Fabian says when the gate-bell rings
  const GATE_SAY = S('Brother Fabian: Light keep you true. Come in.');
  // Coriel will not accept thanks (Vol II:100): three refusals, in turn
  const THANKS = [S('Do not thank me.'), S('There is nothing to thank me for. Go and do some good with it.'), S('No. Keep your thanks for someone who has earned them.')];
  const BLUNT = S('You are loud for a mountain. Light keep you true, all the same.');
  const SAY = {
    coriel: {
      greet: { polite: S('Light keep you true. Sit, if you like. There is only the cot.'), normal: S('Light keep you true. Come in, and shut the door. The cold gets into everything.'), blunt: S('Light keep you true, all the same.') },
      tired: S('Sit. I will sit too.'),
      topics: {
        [S('Who she is')]: S('Coriel. I am the Abbess of this house. There are twelve of us left. I am the oldest.'),
        [S('The Rite')]: S('I watched it. From the tower you can see the Spire, on a clear morning. Three hundred sunrises I stood up there and watched, and I did nothing. That is all there is to say about it.'),
        [S('The bell')]: S('We ring it at dusk. It is the only thing that works.'),
        [S('The cliffs')]: S('Something comes up the cliffs every night, out of the dark below. The bell holds it while it rings. If you go down by the postern, be up before the last stroke.'),
      },
    },
    fabian: { greet: S('Light keep you true. Mind the ice on the step.'), topics: {
      [S('The gate')]: S('Ring the bell on the post and somebody comes. Most of the winter nobody rings it at all.'),
      [S('Visitors')]: S('We do not get many. A ship on the shelf is a thing we talk about for a month.'),
    } },
    ottavia: { greet: S('Light keep you true. Do not touch the rope.'), topics: {
      [S('The dusk bell')]: S('Twelve strokes at dusk. While it rings, whatever comes up the cliffs lets go of the rock. When it stops, it does not.'),
      [S('The rope')]: S('It is mine to ring. My hands know the weight of it, and the bell knows my hands.'),
    } },
    domitia: { greet: S('Light keep you true. Are you hurt? Then go to the Abbess, not to me.'), topics: {
      [S('The infirmary')]: S('I keep the infirmary. Chilblains, mostly, and the old cough. Up here the cold is the only enemy you can see.'),
      [S('The Abbess')]: S('She gives away what she needs. I scold her for it, and she does it again the next day.'),
    } },
  };
  // the other eight: one greeting each, and topics from a small pool chosen by a hash of their place in the list
  const POOL = [
    [S('The snow'), S('It does not go off the peaks, not even at the end of summer. We melt it for water.')],
    [S('The twelve'), S('Twelve of us. There were more once. Nobody comes up the mountain to join now.')],
    [S('The bell'), S('Sister Ottavia rings it at dusk. Whatever comes up the cliffs stops while it rings.')],
    [S('The Spire'), S('On a clear morning you can see it from the tower, a white needle a long way off. You can see the crack in it. We do not look at it much.')],
    [S('The Abbess'), S('She was here before any of us. She does not sleep much, and she will not be thanked.')],
    [S('This house'), S('A house of clergy on a mountain, with a bell. That is all it has been, in my time.')],
  ];
  const OTHERS = [
    ['albinus', S('Light keep you true. You came up a long way to see snow.')],
    ['honoria', S('Light keep you true. Walk on the flags. The garth is deep.')],
    ['marcellin', S('Light keep you true. We are not used to new faces.')],
    ['prisca', S('Light keep you true. Shut the gate behind you, when you go.')],
    ['quintin', S('Light keep you true. The wind is from the south today.')],
    ['liviana', S('Light keep you true. Do not lean on the parapet.')],
    ['clemence', S('Light keep you true. Speak softly. The Abbess is resting.')],
    ['galen', S('Light keep you true. Watch the sky. It changes fast up here.')],
  ];
  const otherTopics = (i) => { const a = (h2(i + 3, 96) * POOL.length) | 0, b = (a + 1 + ((h2(96, i + 7) * (POOL.length - 1)) | 0)) % POOL.length, t = {}; t[POOL[a][0]] = POOL[a][1]; if (i % 2 === 0) t[POOL[b][0]] = POOL[b][1]; return t; };

  // ================================================================ the plan (cells; x east, y south)
  const P = {
    arrive: [28.5, 44.5], landing: [28.5, 44.0],
    gate: [28, 38], gatebell: [30.4, 39.5], fabian: [28.5, 35.6],
    court: [16, 14, 40, 33], garth: [18, 16, 38, 31],
    westDoors: 15, eastDoors: 41, doorYs: [16, 19, 22, 25, 28, 31], abbess: [15, 19], abbessOut: [16.6, 19.5],
    tower: [28.5, 8.5, 1.6, 3.3], towerTop: 8.4, rope: [28.6, 8.0], ottavia: [27.5, 9.4],
    yard: [16, 2, 40, 12], arch: [27, 29], postern: [34, 1], posternIn: [34.5, 2.6],
    shelf: [18, 39, 38, 45], kestrel: [35.2, 43.2], ladder: [33.6, 43.8],
    // the cell (its own map)
    cDoor: [6, 9], cArrive: [6.5, 8.3], coriel: [6.5, 4.8], cot: [5.42, 7.1], desk: [7.52, 5.4], window: [5.75, 4.04],
  };
  const PEOPLE = [   // [key, x, y, facing]: most face the way a visitor comes in
    ['fabian', 28.5, 35.6, PI / 2], ['ottavia', 27.5, 9.4, PI / 2], ['domitia', 16.9, 21.6, PI / 2],
    ['albinus', 24.5, 14.8, PI / 2], ['honoria', 39.8, 24.5, PI / 2], ['marcellin', 22.5, 32.9, PI / 2], ['prisca', 25.5, 22.5, PI / 2],
    ['quintin', 33.5, 26.5, PI / 2], ['liviana', 31.5, 4.5, PI / 2], ['clemence', 16.8, 28.5, PI / 2], ['galen', 20.5, 9.5, PI / 2],
  ];
  const FEMALE = { ottavia: 1, domitia: 1, honoria: 1, prisca: 1, liviana: 1, clemence: 1 };
  const FLOORS = ['t_p96v_snow', 't_p96v_flag', 't_p96v_snow'];
  const SNOW = 0, FLAG = 1, BLOCKED = 2;

  // ================================================================ the dusk bell: the contract with cliffs96
  const BELL = { at: 0.75, strokes: 12, gap: 1 / 360 };
  function bell(tod) {
    let t = tod === undefined ? (typeof G !== 'undefined' && G ? Number(G.tod) : NaN) : Number(tod);
    if (!Number.isFinite(t)) t = 0.5;
    t = ((t % 1) + 1) % 1;
    const end = BELL.at + BELL.strokes * BELL.gap;
    if (t >= 0.25 && t < BELL.at) return { phase: 'day', stroke: 0, left: BELL.strokes, toDark: end - t };
    if (t >= BELL.at && t < end) { const s = Math.min(BELL.strokes, Math.floor((t - BELL.at) / BELL.gap) + 1); return { phase: 'ringing', stroke: s, left: BELL.strokes - s, toDark: end - t }; }
    return { phase: 'dark', stroke: BELL.strokes, left: 0, toDark: 0 };
  }

  // ================================================================ art (code-drawn; hashed noise, never chance)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || !Engine.sprites || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn, glowTest) => {
      if (Engine.sprites[name]) return; const x = canvas(w, h, fn);
      Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) });
      if (glowTest && Engine.setEmissive) { const d = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    const rgb = (r, g, b) => `rgb(${r | 0},${g | 0},${b | 0})`;
    // white stone, warm and rough, coursed, with grey mortar. A wall's texture is one unit high and repeats down the face
    // from its top, so a texture is one unit of wall: four courses (ch = course height in pixels).
    const stone = (x, seed, ch, slits) => {
      for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) {
        const row = (j / ch) | 0, off = (row & 1) * 11 + ((h2(row, seed) * 9) | 0), bw = 14 + ((h2(row + seed, 3) * 10) | 0), bi = ((i + off) / bw) | 0;
        const n = h2(bi + seed, row) * 16 + h2(i + seed, j) * 10 - (h2((i + off) >> 2, j >> 1) < 0.1 ? 12 : 0);
        const mortar = ((i + off) % bw) === 0 || j % ch === 0;
        px(x, mortar ? rgb(152, 149, 142) : rgb(204 + n, 198 + n, 184 + n * 0.9), i, j);
      }
      for (const [sx, sy, sh] of slits || []) { px(x, rgb(40, 40, 46), sx, sy, 3, sh); px(x, rgb(152, 149, 142), sx - 1, sy - 1, 5, 1); }
    };
    if (Engine.addTexture) {
      tex('t_p96v_stone', (x) => stone(x, 0, 16));
      tex('t_p96v_low', (x) => stone(x, 4, 16));
      tex('t_p96v_tower', (x) => stone(x, 11, 16));
      // snow, blue-white, faint drift
      tex('t_p96v_snow', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const d = Math.sin((i + j * 0.6) * 0.18 + h2(i >> 4, j >> 4) * 3) * 2 + h2(i, j) * 4; px(x, rgb(214 + d, 221 + d, 232 + d * 0.6), i, j); } });
      // the flags: pale grey, with joints and a little snow in them
      tex('t_p96v_flag', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const bi = (i + ((j >> 5) & 1) * 16) >> 5, n = h2(bi, j >> 5) * 16 + h2(i, j) * 8; px(x, rgb(168 + n, 168 + n, 166 + n), i, j); }
        for (let i = 0; i < 64; i++) { px(x, rgb(214, 220, 228), i, 0); px(x, rgb(214, 220, 228), i, 32); }
        for (let j = 0; j < 64; j++) { px(x, rgb(214, 220, 228), (j < 32 ? 16 : 0), j); px(x, rgb(214, 220, 228), (j < 32 ? 48 : 32), j); }
      });
      // the gate: grey oak boards, iron straps
      tex('t_p96v_gate', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const b = (i / 16) | 0, n = h2(b, j >> 2) * 12 + h2(i, j) * 8; px(x, rgb(138 + n, 112 + n, 84 + n), i, j); }
        for (let i = 0; i < 64; i += 16) px(x, rgb(84, 66, 50), i, 0, 1, 64);
        for (const j of [12, 48]) { px(x, rgb(52, 50, 52), 0, j, 64, 4); for (let i = 6; i < 64; i += 16) px(x, rgb(120, 118, 116), i, j + 1, 2, 2); }
        px(x, rgb(66, 62, 60), 44, 30, 6, 5); px(x, rgb(110, 106, 100), 45, 31, 4, 1);
      });
      // a cell door: pale wood, one strap, a latch
      tex('t_p96v_door', (x) => {
        stone(x, 5, 16);
        for (let j = 6; j < 64; j++) for (let i = 14; i < 50; i++) { const n = h2(i >> 2, j) * 10; px(x, rgb(132 + n, 118 + n, 98 + n), i, j); }
        for (let i = 14; i < 50; i += 9) px(x, rgb(84, 74, 62), i, 6, 1, 58);
        px(x, rgb(60, 58, 60), 14, 28, 36, 3); px(x, rgb(70, 70, 74), 42, 34, 3, 6);
      });
      // the postern: a low door, iron-bound, in the wall
      tex('t_p96v_postern', (x) => {
        stone(x, 9, 16);
        for (let j = 12; j < 64; j++) for (let i = 16; i < 48; i++) { const n = h2(i >> 3, j) * 8; px(x, rgb(70 + n, 64 + n, 58 + n), i, j); }
        for (const j of [18, 34, 50]) px(x, rgb(36, 36, 40), 16, j, 32, 3);
        px(x, rgb(120, 118, 112), 46, 38, 2, 4);
      });
      // rock of the range, grey, with snow in its ledges
      tex('t_p96v_rock', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const n = h2(i >> 3, j >> 2) * 22 + h2(i, j) * 10, ledge = (j + ((h2(i >> 4, 1) * 8) | 0)) % 16 < 5; px(x, ledge ? rgb(214 + n * 0.3, 220 + n * 0.3, 230) : rgb(150 + n, 150 + n, 156 + n), i, j); } });
      // the cell: lime plaster, boards, a beamed ceiling
      tex('t_p96v_plaster', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const n = h2(i >> 2, j >> 2) * 10 + h2(i, j) * 6; px(x, rgb(196 + n, 188 + n, 172 + n), i, j); } });
      tex('t_p96v_board', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const b = j >> 4, n = h2(b, i >> 3) * 12 + h2(i, j) * 6; px(x, rgb(104 + n, 82 + n, 60 + n), i, j); } for (let j = 0; j < 64; j += 16) px(x, rgb(56, 44, 34), 0, j, 64, 1); });
      tex('t_p96v_ceil', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const n = h2(i >> 2, j >> 2) * 8 + h2(i, j) * 4; px(x, rgb(150 + n, 144 + n, 132 + n), i, j); } });
    }
    // ---- sprites
    // the stone over a door: the engine's doors are one unit high, so the wall above one is drawn as a sprite in the
    // door's own plane (it is clipped to what shows above the door)
    const lintel = (x, w, h) => {
      const t = canvas(64, 64, (y) => stone(y, 0, 16)).getImageData(0, 0, 64, 64).data, k = 0.8;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const q = (((h - 1 - j) % 64) * 64 + (i % 64)) * 4; px(x, rgb(t[q] * k, t[q + 1] * k, t[q + 2] * k), i, h - 1 - j); }
      px(x, rgb(120, 116, 110), 0, h - 3, w, 3);
    };
    add('p96v_lintel', 96, 166, 2.6, lintel);   // a sprite's width projects at two thirds of a wall's, so 96 wide covers one cell
    // the gate-bell: a post, an arm, a small bronze bell and its rope
    add('p96v_gatebell', 48, 120, 1.6, (x) => {
      px(x, rgb(92, 80, 66), 8, 10, 7, 110); px(x, rgb(120, 106, 88), 9, 10, 2, 110);
      px(x, rgb(92, 80, 66), 8, 10, 30, 5);
      x.fillStyle = rgb(110, 76, 40); x.beginPath(); x.moveTo(30, 16); x.quadraticCurveTo(24, 20, 23, 36); x.lineTo(43, 36); x.quadraticCurveTo(42, 20, 36, 16); x.closePath(); x.fill();
      px(x, rgb(150, 108, 60), 26, 20, 3, 14); px(x, rgb(70, 48, 26), 22, 35, 22, 3);
      px(x, rgb(200, 190, 170), 32, 38, 2, 50); px(x, rgb(150, 130, 100), 31, 84, 4, 8);
      px(x, rgb(186, 192, 202), 6, 8, 11, 3);   // snow on the post (grey enough not to blow out)
    });
    // a pillar of the walk: white stone, a plain capital
    add('p96v_pillar', 24, 120, 2.6, (x) => {
      for (let j = 10; j < 112; j++) for (let i = 5; i < 19; i++) { const n = h2(i, j >> 2) * 10 - (i > 15 ? 26 : i < 7 ? 14 : 0); px(x, rgb(206 + n, 200 + n, 188 + n), i, j); }
      px(x, rgb(196, 190, 178), 1, 2, 22, 9); px(x, rgb(222, 226, 232), 1, 0, 22, 3); px(x, rgb(150, 146, 138), 1, 10, 22, 1);
      px(x, rgb(190, 184, 172), 2, 110, 20, 10); px(x, rgb(150, 146, 138), 2, 110, 20, 1);
    });
    // the dusk bell in its bell-cote at the top of the tower; and the same, swinging
    const greatBell = (sw) => (x) => {
      px(x, rgb(196, 190, 178), 4, 6, 8, 74); px(x, rgb(196, 190, 178), 68, 6, 8, 74); px(x, rgb(176, 170, 158), 2, 2, 76, 8);
      px(x, rgb(228, 232, 238), 2, 0, 76, 3);
      x.save(); x.translate(40, 12); x.rotate(sw);
      x.fillStyle = rgb(60, 44, 28); x.beginPath(); x.moveTo(-9, 2); x.quadraticCurveTo(-18, 10, -20, 38); x.quadraticCurveTo(-24, 46, -27, 48); x.lineTo(27, 48); x.quadraticCurveTo(24, 46, 20, 38); x.quadraticCurveTo(18, 10, 9, 2); x.closePath(); x.fill();
      x.fillStyle = rgb(110, 84, 50); x.fillRect(-12, 8, 4, 32); x.fillStyle = rgb(40, 28, 18); x.fillRect(-27, 46, 54, 3);
      x.fillStyle = rgb(84, 62, 38); x.fillRect(-4, -2, 8, 5); x.fillStyle = rgb(36, 28, 20); x.fillRect(-3, 44, 6, 8);
      x.restore();
    };
    add('p96v_bell', 80, 80, 1.5, greatBell(0));
    add('p96v_bell2', 80, 80, 1.5, greatBell(0.32));
    // the bell rope, with its sally of striped wool
    add('p96v_rope', 12, 160, 2.6, (x) => { px(x, rgb(176, 160, 128), 5, 0, 2, 160); px(x, rgb(140, 124, 96), 6, 0, 1, 160); for (let j = 96; j < 124; j += 4) { px(x, j % 8 ? rgb(150, 40, 36) : rgb(210, 200, 176), 3, j, 6, 4); } });
    // the cell: cot, desk, tallow lamp, window
    add('p96v_cot', 96, 40, 0.42, (x) => { px(x, rgb(90, 72, 54), 2, 14, 92, 6); px(x, rgb(70, 56, 42), 4, 20, 4, 20); px(x, rgb(70, 56, 42), 88, 20, 4, 20); px(x, rgb(122, 120, 116), 6, 6, 84, 9); px(x, rgb(150, 148, 142), 6, 6, 84, 2); px(x, rgb(196, 190, 176), 8, 4, 18, 6); });
    add('p96v_desk', 80, 56, 0.8, (x) => { px(x, rgb(104, 82, 60), 2, 8, 76, 7); px(x, rgb(130, 104, 78), 2, 8, 76, 2); px(x, rgb(80, 62, 46), 6, 15, 5, 41); px(x, rgb(80, 62, 46), 69, 15, 5, 41); px(x, rgb(60, 40, 34), 14, 3, 20, 5); px(x, rgb(176, 166, 140), 15, 3, 18, 1); });
    add('p96v_lamp', 16, 24, 0.24, (x) => { px(x, rgb(150, 140, 120), 3, 16, 10, 7); px(x, rgb(220, 210, 180), 5, 8, 6, 8); px(x, rgb(255, 200, 110), 6, 2, 4, 6); px(x, rgb(255, 244, 200), 7, 4, 2, 3); }, (r, g, b, a) => a > 0 && r > 250 && g > 190);
    add('p96v_window', 48, 40, 0.6, (x) => {
      px(x, rgb(96, 76, 56), 0, 0, 48, 40);
      for (let j = 4; j < 36; j++) for (let i = 4; i < 44; i++) { const t = (j - 4) / 32; px(x, rgb(150 + 60 * t, 172 + 50 * t, 206 + 30 * t), i, j); }
      x.fillStyle = rgb(240, 244, 250); x.beginPath(); x.moveTo(4, 36); x.lineTo(14, 16); x.lineTo(20, 24); x.lineTo(30, 10); x.lineTo(44, 30); x.lineTo(44, 36); x.closePath(); x.fill();
      x.fillStyle = rgb(196, 204, 218); x.beginPath(); x.moveTo(30, 10); x.lineTo(36, 22); x.lineTo(32, 36); x.lineTo(44, 36); x.lineTo(44, 30); x.closePath(); x.fill();
      px(x, rgb(96, 76, 56), 23, 4, 2, 32); px(x, rgb(96, 76, 56), 4, 19, 40, 2);
    });
    // the clergy: undyed wool, oatmeal or grey; light, not white
    const habit = (x, o) => {
      const cx = 32, body = o.body, dk = o.dk, hi = o.hi;
      x.fillStyle = dk; x.beginPath(); x.moveTo(cx - 21, 158); x.lineTo(cx - 16, 52); x.lineTo(cx + 16, 52); x.lineTo(cx + 21, 158); x.closePath(); x.fill();
      x.fillStyle = body; x.beginPath(); x.moveTo(cx - 19, 158); x.lineTo(cx - 14, 54); x.lineTo(cx + 14, 54); x.lineTo(cx + 19, 158); x.closePath(); x.fill();
      for (let j = 60; j < 158; j += 2) { px(x, dk, cx - 9 + ((j * 3) % 2), j, 1, 2); px(x, dk, cx + 6, j, 1, 2); px(x, hi, cx - 4, j, 2, 2); }
      px(x, dk, cx - 24, 56, 10, 58); px(x, dk, cx + 14, 56, 10, 58); px(x, body, cx - 23, 57, 8, 56); px(x, body, cx + 15, 57, 8, 56);
      px(x, o.cord, cx - 13, 92, 26, 3); px(x, o.cord, cx + 2, 95, 2, 22);
      px(x, o.skin, cx - 22, 112, 6, 6); px(x, o.skin, cx + 16, 112, 6, 6);
      // the hood down on the shoulders, the face
      px(x, dk, cx - 14, 50, 28, 7); px(x, body, cx - 12, 50, 24, 4);
      px(x, o.skin, cx - 7, 28, 14, 22); px(x, '#2a2420', cx - 4, 36, 2, 2); px(x, '#2a2420', cx + 2, 36, 2, 2); px(x, '#7a5a50', cx - 2, 44, 4, 1);
      px(x, o.hair, cx - 8, 24, 16, 6); px(x, o.hair, cx - 8, 26, 2, 12); px(x, o.hair, cx + 6, 26, 2, 12);
      if (o.veil) { px(x, o.veil, cx - 10, 22, 20, 7); px(x, o.veil, cx - 10, 26, 3, 26); px(x, o.veil, cx + 7, 26, 3, 26); }
      px(x, '#2e2620', cx - 14, 154, 11, 4); px(x, '#2e2620', cx + 3, 154, 11, 4);
    };
    const OAT = { body: '#aa9b7d', dk: '#776b55', hi: '#bdae92', cord: '#4e4032', skin: '#c9a994' };
    const GREY = { body: '#9b9890', dk: '#6c6a65', hi: '#afada5', cord: '#433e3a', skin: '#c4a48e' };
    add('p96v_cleric_m', 64, 160, undefined, (x) => habit(x, Object.assign({ hair: '#6a5a48' }, OAT)));
    add('p96v_cleric_f', 64, 160, undefined, (x) => habit(x, Object.assign({ hair: '#5a4a3c', veil: '#8e8a80' }, GREY)));
    // Coriel: in her eighties, upright, white-haired, the plain habit, a staff
    add('p96v_coriel', 64, 160, undefined, (x) => {
      habit(x, { body: '#a39880', dk: '#72695a', hi: '#b8ad96', cord: '#463a30', skin: '#c2a694', hair: '#c4c2bc' });
      px(x, '#ccc9c2', 24, 22, 16, 5); px(x, '#a8907e', 26, 42, 12, 1); px(x, '#a8907e', 26, 32, 3, 1); px(x, '#a8907e', 35, 32, 3, 1);
      px(x, '#6a5440', 50, 18, 3, 140); px(x, '#86705a', 50, 18, 1, 140); px(x, '#6a5440', 47, 16, 9, 4);
    });
  }

  // ================================================================ the people
  const NPC_IDS = [];
  function defs() {
    if (typeof NPCS === 'undefined') return;
    const greetOf = (g) => ({ polite: g, normal: g, blunt: BLUNT });
    if (!NPCS.p96v_coriel) {
      NPCS.p96v_coriel = { name: TX.coriel, sprite: 'p96v_coriel', portrait: 'townswoman', tier: 'high', _p96v: 'coriel', topics: SAY.coriel.topics,
        greet: { get polite() { return helpedToday() ? SAY.coriel.tired : SAY.coriel.greet.polite; }, get normal() { return helpedToday() ? SAY.coriel.tired : SAY.coriel.greet.normal; }, get blunt() { return helpedToday() ? SAY.coriel.tired : SAY.coriel.greet.blunt; } } };
    }
    for (const k of ['fabian', 'ottavia', 'domitia']) if (!NPCS['p96v_' + k]) NPCS['p96v_' + k] = { name: TX[k], sprite: FEMALE[k] ? 'p96v_cleric_f' : 'p96v_cleric_m', portrait: FEMALE[k] ? 'townswoman' : 'townsman', tier: 'high', _p96v: k, greet: greetOf(SAY[k].greet), topics: SAY[k].topics };
    OTHERS.forEach(([k, g], i) => { if (!NPCS['p96v_' + k]) NPCS['p96v_' + k] = { name: TX[k], sprite: FEMALE[k] ? 'p96v_cleric_f' : 'p96v_cleric_m', portrait: FEMALE[k] ? 'townswoman' : 'townsman', tier: 'high', _p96v: k, greet: greetOf(g), topics: otherTopics(i) }; });
    if (!NPC_IDS.length) NPC_IDS.push('p96v_coriel', ...PEOPLE.map((p) => 'p96v_' + p[0]));
  }

  // ================================================================ building the Vigil
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  const inR = (r, i, j) => i >= r[0] && i <= r[2] && j >= r[1] && j <= r[3];
  // 0 snow, 1 flags, 2 rock, 3 range (stone, tall), 4 wall (stone), 5 tower, 6 parapet, 7 drop (beyond the parapet)
  function plan() {
    const kind = new Uint8Array(W * H).fill(2);
    const rect = (x0, y0, x1, y1, k) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) kind[at(i, j)] = k; };
    rect(P.shelf[0], P.shelf[1], P.shelf[2], P.shelf[3], 0);              // the landing shelf
    for (let j = 39; j <= 45; j++) for (let i = 14; i <= 42; i++) if (kind[at(i, j)] === 2 && h2(i, j) < (Math.abs(i - 28) < 14 ? 0.9 : 0.4)) kind[at(i, j)] = 0;   // the shelf's ragged ends
    rect(10, 1, 46, 38, 3);                                                // the precinct: the ranges first
    rect(P.court[0], P.court[1], P.court[2], P.court[3], 1);               // the cloister walk (the garth below)
    rect(P.garth[0], P.garth[1], P.garth[2], P.garth[3], 0);
    rect(P.yard[0], P.yard[1], P.yard[2], P.yard[3], 1);                   // the tower yard
    rect(16, 13, 40, 13, 4); rect(P.arch[0], 13, P.arch[1], 13, 1);        // the wall between, and its arch
    rect(26, 34, 30, 37, 1);                                               // the gate passage
    rect(16, 1, 40, 1, 6); rect(16, 0, 40, 0, 7);                          // the parapet and the drop beyond it
    const [tx, ty, ri, ro] = P.tower;
    for (let j = 3; j <= 13; j++) for (let i = 23; i <= 34; i++) { const d = Math.hypot(i + 0.5 - tx, j + 0.5 - ty); if (d <= ri) kind[at(i, j)] = 1; else if (d <= ro) kind[at(i, j)] = 5; }
    kind[at(28, 10)] = 1; kind[at(28, 11)] = 1;                            // the tower's door, on the south
    return kind;
  }
  const snap = (m, x, y) => {
    const ok = (qx, qy) => { const i = qx | 0, j = qy | 0; if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) return false; if (m.get(i, j) || m.isBlocked(i, j)) return false; return !m.entities.some((e) => e.solid && Math.hypot(e.x - qx, e.y - qy) < 0.7); };
    if (ok(x, y)) return [x, y];
    for (let r = 0.5; r <= 5; r += 0.5) for (let a = 0; a < 16; a++) { const qx = x + Math.cos(a / 16 * PI * 2) * r, qy = y + Math.sin(a / 16 * PI * 2) * r; if (ok(qx, qy)) return [qx, qy]; }
    return [x, y];
  };
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { outdoor: true, floor: 't_p96v_snow', floorTextures: FLOORS, fogDist: 46, fogColor: [196, 204, 214], ambient: 0.3, music: 'inside', danger: 0,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 } });
    const kind = plan(), L = m.ensureLvls();
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = at(i, j), t = kind[k];
      if (t === 0) { m.setFloor(i, j, SNOW); continue; }
      if (t === 1) { m.setFloor(i, j, FLAG); continue; }
      if (t === 2) { const edge = i < 2 || i > W - 3 || j > H - 3; m.block(i, j, 't_p96v_rock', (edge ? 3.5 : 1.6) + h2(i >> 1, j >> 1) * (edge ? 6 : 5)); continue; }
      if (t === 3) { m.block(i, j, 't_p96v_stone', 3.6); continue; }
      if (t === 4) { m.block(i, j, 't_p96v_stone', 3.0); continue; }
      if (t === 5) { m.block(i, j, 't_p96v_tower', P.towerTop); continue; }
      if (t === 6) { m.block(i, j, 't_p96v_low', 0.95); continue; }
      if (t === 7) { L[k] = -30; m.setFloor(i, j, BLOCKED); continue; }
    }
    m._p96v = { kind };
    // ---- the gate, locked until the gate-bell is rung
    m.set(P.gate[0], P.gate[1], DOOR({ tex: 't_p96v_gate', label: TX.gate, locked: 'p96b_gate', lockMsg: TX.gateShut, _gate: false }));   // a wooden gate, not js/gates.js's portcullis
    lintelOver(m, P.gate[0], P.gate[1]);
    m.deco('p96v_gatebell', P.gatebell[0], P.gatebell[1], { radius: 0.2, scale: 1, solid: true, use: 'p96v_gatebell', label: TX.gatebell, _p96v: 'gatebell' });
    // ---- the twelve cells: eleven not yours to open; the Abbess's
    // (each door is set into the range's face; above it the range stands back a cell, a deep reveal)
    for (const y of P.doorYs) for (const x of [P.westDoors, P.eastDoors]) {
      if (x === P.abbess[0] && y === P.abbess[1]) m.set(x, y, DOOR({ tex: 't_p96v_door', label: TX.abbessDoor, portal: { map: CELL, x: P.cArrive[0], y: P.cArrive[1], dir: -PI / 2 } }));
      else m.set(x, y, DOOR({ tex: 't_p96v_door', label: TX.cellDoor, locked: '__never', lockMsg: TX.cellShut }));
    }
    // ---- the garth's pillars, every three cells along its edge
    const [gx0, gy0, gx1, gy1] = P.garth;
    for (let x = gx0; x <= gx1 + 1; x += 3) { m.deco('p96v_pillar', x + 0.2, gy0 + 0.2, { radius: 0.22, scale: 1, solid: true, label: TX.pillar }); m.deco('p96v_pillar', x + 0.2, gy1 + 0.8, { radius: 0.22, scale: 1, solid: true, label: TX.pillar }); }
    for (let y = gy0 + 3; y <= gy1 - 2; y += 3) { m.deco('p96v_pillar', gx0 + 0.2, y + 0.2, { radius: 0.22, scale: 1, solid: true, label: TX.pillar }); m.deco('p96v_pillar', gx1 + 0.8, y + 0.2, { radius: 0.22, scale: 1, solid: true, label: TX.pillar }); }
    // ---- the tower: the rope inside, the bell at the top
    m.deco('p96v_rope', P.rope[0], P.rope[1], { radius: 0.12, scale: 1, solid: false, use: 'p96v_rope', label: TX.rope, _p96v: 'rope' });
    m.add({ kind: 'deco', sprite: 'p96v_bell', x: P.tower[0], y: P.tower[1], scale: 2.2, solid: false, radius: 0.05, yOff: -(P.towerTop - 0.9), label: TX.bell, _decor: true, _p96v: 'bell' });
    m.deco('sign', 28.5, 11.9, { radius: 0.1, scale: 0.01, solid: false, label: TX.tower });
    // ---- the parapet, the postern
    m.deco('sign', 22.5, 2.3, { radius: 0.1, scale: 0.01, solid: false, label: TX.parapet });
    // the postern is set in join(), once it is known whether the Chalk Cliffs are there
    // ---- the shelf: the Kestrel, her ladder
    m.deco('ladder', P.ladder[0], P.ladder[1], { radius: 0.2, scale: 1.5, solid: false, use: 'p96v_kestrel', label: TX.ladder });
    if (typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites.kestrel_m2) m.add({ kind: 'deco', sprite: 'kestrel_m2', x: P.kestrel[0], y: P.kestrel[1], scale: 2.6, solid: false, radius: 0.05, yOff: -0.5, label: TX.kestrel, _decor: true, _p96v: 'kestrel' });
    // ---- the people
    for (const [k, x, y, f] of PEOPLE) { const [qx, qy] = snap(m, x, y); m.npc('p96v_' + k, qx, qy, { facing: f, _p96v: k }); }
    m.baseCount = m.entities.length;
    return m;
  }
  // the Abbess's cell: plaster, boards, a cot, a desk, a lamp, a window on the peaks
  function buildCell() {
    const m = new GameMap(CELL, TX.nameCell, CW, CH, { floor: 't_p96v_board', ceil: 't_p96v_ceil', fogDist: 16, fogColor: [52, 44, 36], ambient: 0.52, music: 'inside', danger: 0,
      spawn: { x: P.cArrive[0], y: P.cArrive[1], dir: -PI / 2 } });
    m.ceilZ = 2.2;
    m.rect(0, 0, CW - 1, CH - 1, 't_p96v_plaster');
    m.clear(5, 4, 7, 8);   // a cell: three steps by five
    m.set(P.cDoor[0], P.cDoor[1], DOOR({ tex: 't_p96v_door', label: TX.cellBack, portal: { map: MAP, x: P.abbessOut[0], y: P.abbessOut[1], dir: 0 } }));
    m.deco('p96v_cot', P.cot[0], P.cot[1], { radius: 0.5, scale: 1, solid: true, label: TX.cot });
    m.deco('p96v_desk', P.desk[0], P.desk[1], { radius: 0.5, scale: 1, solid: true, label: TX.desk });
    m.deco('p96v_lamp', P.desk[0] + 0.1, P.desk[1] + 0.06, { radius: 0.05, scale: 1, solid: false, yOff: -0.68, label: TX.lamp });
    m.add({ kind: 'deco', sprite: 'p96v_lamp', x: P.desk[0] + 0.3, y: P.desk[1] - 0.2, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.12, lightCol: [96, 70, 42], _p96v: 'lamplight' });
    m.deco('p96v_window', P.window[0], P.window[1], { radius: 0.05, scale: 1, solid: false, yOff: -0.95, label: TX.window });
    m.npc('p96v_coriel', P.coriel[0], P.coriel[1], { facing: PI / 2, _p96v: 'coriel' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  function postern(m) {
    const cl = typeof CLIFFS96 !== 'undefined' && CLIFFS96 && CLIFFS96.MAP ? CLIFFS96 : null;
    const [i, j] = P.postern;
    if (cl) {
      const a = cl.P && Array.isArray(cl.P.arrive) ? cl.P.arrive : [18.5, 3.5];
      m.set(i, j, DOOR({ tex: 't_p96v_postern', label: TX.postern, portal: { map: cl.MAP, x: a[0], y: a[1], dir: PI / 2 } }));
    } else m.set(i, j, DOOR({ tex: 't_p96v_postern', label: TX.postern, locked: '__never', lockMsg: TX.posternBarred }));
    for (const x of [i - 1, i + 1]) m.block(x, j, 't_p96v_low', 2.0);
  }
  // set in the wall's outer face (the south face of the gate's row), so it is as wide as the opening it closes
  function lintelOver(m, i, j) { m.add({ kind: 'deco', sprite: 'p96v_lintel', x: i + 0.5, y: j + 0.985, scale: 1, solid: false, radius: 0.01, nopick: true, yOff: -1, _decor: true, _p96v: 'lintel' }); }
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[MAP] = build(); maps[CELL] = buildCell();
    postern(maps[MAP]);
    return true;
  }
  function wireKestrel() {
    if (typeof KESTREL16 === 'undefined' || !KESTREL16.addFar) return;
    KESTREL16.addFar({ id: MAP, name: TX.fly, arrive: TX.arrive, down: TX.down, toLabel: TX.toLabel, hours: 30,
      landing: () => ({ map: MAP, x: P.landing[0], y: P.landing[1], dir: -PI / 2 }) });
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p96b_seen', 65535); if (s & (1 << bit)) return false; f().p96b_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const here = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const day = () => (typeof G !== 'undefined' && Number.isFinite(+G.day) ? Math.max(0, Math.floor(+G.day)) : 0);
  const helpedToday = () => typeof G !== 'undefined' && G && G.flags && fint('p96b_help', 9999) === Math.min(9999, day() + 1);
  let lastStroke = -1;

  function tick() {
    if (!here() || G.state !== 'play' || !G.player) { lastStroke = -1; return; }
    const c = Engine.cam, b = bell();
    // the bell: a stroke is when the count goes up; the first of a dusk is said
    if (lastStroke < 0 || b.stroke < lastStroke) lastStroke = b.stroke;
    if (b.stroke > lastStroke) {
      const first = lastStroke === 0 && b.phase === 'ringing';
      lastStroke = b.stroke;
      if (b.phase === 'ringing') {
        try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.bell) Audio_.sfx.bell(); } catch (e) { /* audio is optional */ }
        if (first) { say(TX.duskFirst, '', 6000); const s = fint('p96b_seen', 65535); f().p96b_seen = s | 4; }
      }
    }
    const bl = G.ents.find((e) => e && e._p96v === 'bell'); if (bl) bl.sprite = b.phase === 'ringing' && (b.stroke & 1) ? 'p96v_bell2' : 'p96v_bell';
    // the once lines
    if (c.y > 38.5 && c.y < 46) once(0, TX.firstSight, '', 8000);
    if (inR(P.court, c.x | 0, c.y | 0)) once(1, TX.cloister, '', 6000);
    if (inR(P.yard, c.x | 0, c.y | 0)) once(3, TX.yard, '', 6000);
  }

  // ---------------------------------------------------------------- talk: their own topics, and Coriel's help
  function help() {
    const p = G.player;
    if (helpedToday()) return TX.helpNone;
    f().p96b_help = Math.min(9999, day() + 1);
    p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = typeof fatCap === 'function' ? fatCap() : p.fatMax;
    try { if (typeof UPG !== 'undefined' && UPG.status) { UPG.status.bleed = 0; UPG.status.deaf = 0; UPG.status.hushed = 0; UPG.status.fear = 0; } } catch (e) { /* no status */ }
    p.injuries = []; G.glassLock = 0;
    try { if (typeof needsOn === 'function' && needsOn()) { p.hunger = 100; } } catch (e) { /* needs are optional */ }
    try { Audio_.sfx.ui(); } catch (e) { /* silent */ }
    return TX.helped;
  }
  function thank() {
    const n = fint('p96b_thank', 99); f().p96b_thank = Math.min(99, n + 1);
    return THANKS[n % 3];
  }
  // the answer to one of this house's own topics; pushed into the dialogue's log when one is open
  function ask(id, t) {
    const n = typeof NPCS !== 'undefined' ? NPCS[id] : null; if (!n || !n._p96v) return null;
    let ans = null;
    if (id === 'p96v_coriel' && t === TX.tHelp) ans = help();
    else if (id === 'p96v_coriel' && t === TX.tThank) ans = thank();
    else if (n.topics && Object.prototype.hasOwnProperty.call(n.topics, t)) ans = n.topics[t];
    if (ans == null) return null;
    try { if (typeof DLG !== 'undefined' && DLG.npc === n) { DLG.log.push({ who: 'you', t }); DLG.log.push({ who: 'them', t: ans }); } } catch (e) { /* no dialogue open */ }
    return ans;
  }
  const ownTopics = (id) => { const n = NPCS[id]; const t = Object.keys(n.topics || {}); if (id === 'p96v_coriel') t.push(TX.tHelp, TX.tThank); return t; };

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p96v_/.test(e.use)) return false;
    if (e.use === 'p96v_kestrel') { if (typeof KESTREL16 !== 'undefined' && KESTREL16.board) KESTREL16.board(); return true; }
    if (e.use === 'p96v_rope') { say(TX.ropeLine, '', 4000); return true; }
    if (e.use === 'p96v_gatebell') {
      try { Audio_.sfx.bell(); } catch (er) { /* audio is optional */ }
      if (fint('p96b_gate', 1) === 1) { say(TX.gateOpenAlready, '', 3000); openGate(); return true; }
      f().p96b_gate = 1; say(GATE_SAY, '', 6000); openGate(); sync(); return true;
    }
    return false;
  }
  function openGate() {
    if (!here()) return;
    const k = P.gate[1] * G.map.w + P.gate[0], d = G.map.doors[k]; if (d) d.target = 1;
  }
  function sync() {
    if (!here()) return;
    const open = fint('p96b_gate', 1) === 1;
    for (const e of G.ents) if (e && e._p96v === 'gatebell') e.label = open ? TX.gatebellOpen : TX.gatebell;
  }

  // ================================================================ wiring
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { lastStroke = -1; sync(); if (here() && fint('p96b_gate', 1) === 1) { const k = P.gate[1] * G.map.w + P.gate[0]; if (G.map.doors[k]) G.map.doors[k].open = G.map.doors[k].target = 1; } } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    // this house's own topics sit right under what they say
    if (typeof renderDialogue === 'function') {
      const _rd = renderDialogue;
      renderDialogue = function (mode) {
        const r = _rd.apply(this, arguments);
        try {
          const n = typeof DLG !== 'undefined' && DLG.npc;
          if (n && n._p96v && (mode == null || mode === 'tell')) {
            const id = 'p96v_' + n._p96v, box = document.getElementById('d-topics');
            if (box) ownTopics(id).slice().reverse().forEach((t) => {
              const b = document.createElement('button'); b.className = 'dfbtn small'; b.setAttribute('data-p96v', t); b.textContent = t;
              b.onclick = () => { ask(id, t); renderDialogue(mode); };
              box.insertBefore(b, box.firstChild);
            });
          }
        } catch (e) { warnOnce('dialogue', e); }
        return r;
      };
    }
    wireKestrel();
  }
  wire();

  return { TX, SAY, TEXTS, MAP, CELL, W, H, P, PEOPLE, BELL, bell, plan, build, buildCell, join, tick, useOwn, sync, ask, help, thank, helpedToday, ownTopics, NPC_IDS,
    lastStroke: () => lastStroke };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = VIGIL96;
if (typeof window !== 'undefined') window.VIGIL96 = VIGIL96;
