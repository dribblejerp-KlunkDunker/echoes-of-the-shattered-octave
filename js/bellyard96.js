// ============================================================
//  bellyard96 (BLACKSQUARE96): the Dawning Heights, part four: the black square in front of the Basilica's west end
//  (Phase 96; plan: Phase 89 and Phase 90, approved 14 Nov 2026; Team C's design, 16 Nov).
//
//  WHAT THE BOOK MADE OF THE PLAN. Phase 89 called this place "the Bell Yard", "the yard under the bell-gallery, where the
//  bell-ropes come down through a hole in the vault", and said the name was Book Two's. It is not: "the Bell Yard" is a
//  street of joiners and wheelwrights in Whisper-Grove (Book One; built in js/grove31.js). Book Two's bell-gallery is in the
//  Bleach, under the white dome, past the iron door; the bell is not in it but "in the black tower" ("Below them, in the
//  black tower, a bell began to ring the third hour"), below the line. The one open ground the book gives by the Basilica
//  on the shade side is the black square: "Through the black square in front of the Basilica's west end, where the shade lay
//  thick as wool and the great black doors stood shut under their black lancet windows." "Every shutter on the square was
//  open a crack." "He went up the black steps to the black doors". So that is what is built. (The file keeps the old word
//  until the Commander renames it; the global is BLACKSQUARE96, and BELLYARD96 points at it.)
//
//  THE PLACE (map p96_blacksquare, 26 x 24, open to the sky, deep in shade):
//    the arch       a black arch in the Tiers' black wall at (72, 5), west of the iron door; and its way back
//    the paving     black stone; the houses round it, west, south and east, each with a shutter open a crack (six)
//    the steps      three black steps up to the great black doors, under three black lancet windows (shut: p96c_never)
//    the tower      the black tower at the north-east corner; its bell high on its south face; its door barred inside
//    the dome       above the black roof, over the line: the great dome over the crossing, white, "like a bone"; seen only
//  THE WONDER: the bell. It rings at noon and at the third hour (Book Two: "At noon a bell rang"; "the third hour"), three
//  strokes [PROPOSED], a deep slow bronze note made in code, and under it the Tiers go silent, level on level, from the wall
//  down (Book Two: "she heard the Tiers go silent beneath it, level on level"), and stay silent a long time after. While the
//  silence holds, the watchers behind the shutters do not answer, and in the Tiers the folk stand still and do not talk.
//  No herald, no proclamation (that is Ashfall's). Nobody rings it that the player can see; the tower is never entered.
//  No foes, no gear, no lamps. Flags: p96c_sq (bits: what has been said once), p96c_tolls (tolls heard, 0 to 9).
//  Everything not in the books is [PROPOSED]. Nothing visual uses random numbers.
// ============================================================
'use strict';

const BLACKSQUARE96 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p96_blacksquare', TIERS = 'p92_tiers';
  const W = 26, H = 24;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('bellyard96: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('Sol-Luminary: the black square'),
    archTiers: S('A black arch in the wall. The way round to the Basilica\'s west end.'),
    archBack: S('The black arch, back down into the Tiers'),
    // Book Two: "the black square in front of the Basilica's west end, where the shade lay thick as wool"; "Every shutter on the square was open a crack."
    arrive: S('The black square in front of the Basilica\'s west end. The shade lies thick as wool. Every shutter on the square is open a crack, and you can feel them watching.'),
    // Book Two: "He went up the black steps to the black doors"
    steps: S('The black steps, up to the black doors.'),
    // Book Two: "black stone, black doors, black glass in the high lancet windows"; "the great black doors stood shut under their black lancet windows"
    doors: S('The great black doors of the Basilica\'s west end'),
    doorsShut: S('The great black doors. They stand shut, and nobody here knocks.'),
    lancet: S('Black glass in a high lancet window.'),
    // Book Two: "The great dome over the crossing had been gilded once ... It was white now ... it stood up into the overexposed sky like a bone."
    dome: S('Over the black roof, on the other side of the line: the great dome over the crossing. It was gilded once. It is white now, and it stands up into the sky like a bone.'),
    // Book Two: "from the Basilica's black tower, a deep slow bronze note"
    tower: S('The door of the black tower'),
    towerShut: S('The tower door. It is barred inside.'),
    bell: S('The Basilica\'s bell, high in the black tower. Its note is deep and slow, and bronze.'),
    board: S('A board on the tower\'s foot, the words cut in and blacked: "The Basilica\'s bell is rung at noon, and at the third hour. When it rings, be still."'),
    // the shutters (Book Two: "Every shutter on the square was open a crack. He could feel them watching."; "The Tiers slept in the morning; they lived at night.")
    shutter: S('A shutter, open a crack. Somebody is behind it.'),
    shutterDay: S('A shutter, open a crack. Somebody sleeps behind it.'),
    shutterMute: S('Nobody answers. The crack stays open, and somebody stays behind it.'),
    shutterHush: S('They do not answer until the bell has done.'),
    // the bell (Book Two: "At noon a bell rang. It rang down through the whole of the Umbral Tiers from the Basilica's black tower, a deep slow bronze note ... and she heard the Tiers go silent beneath it, level on level"; "And the Tiers stayed silent for a long time after.")
    tollSquare: S('Over you, in the black tower, the bell: a deep slow bronze note. Behind every shutter on the square the talk stops.'),
    tollTiers: S('From the Basilica\'s black tower, a bell: a deep slow bronze note. Beneath it the Tiers go silent, level on level.'),
    tollFirst: S('The whole of the Tiers goes still under it, and stays still a long time after.'),
  };
  // the three who answer, each its own words in turn (the first lines are the design's; the rest [PROPOSED])
  const WATCH = {
    0: [S('Light keep you true. Speak low.'), S('Up here we keep to the shade, and the shade keeps to us.'), S('Go back down quietly. Quiet is how we know each other.')],
    2: [S('When the bell goes, we stop. All of us. All the way down.'), S('It rings at noon, and at the third hour. We hear it in our sleep.'), S('After it has done, nobody is the first to speak. You wait for somebody else to.')],
    5: [S('Nobody knocks at those doors.'), S('The black steps are the Church\'s. We sweep up to the bottom one and no further.'), S('If the Church wants you, it will find you. You do not knock.')],
  };

  // ================================================================ the plan (cells)
  const P = {
    tiersDoor: [72, 5], tiersOut: [72.5, 6.6], arch: [13, 22], arrive: [13.5, 21.4],
    paving: [3, 6, 22, 21], steps: [9, 3, 16, 5], doors: [13, 2], leaf: [12, 2],
    tower: [19, 3, 21, 6], towerDoor: [20, 6], bell: [20.5, 7.06], board: [18.6, 7.7],
    dome: [13.5, -2.6], lancets: [10.5, 13.0, 15.5],
  };
  const SHUTTERS = [[3.06, 9.5], [3.06, 14.5], [3.06, 18.5], [7.5, 21.94], [18.5, 21.94], [22.94, 12.5]];
  const STEP_RISE = 0.25;
  const stepLvl = (j) => (j >= P.steps[1] && j <= P.steps[3]) ? (P.steps[3] + 1 - j) * STEP_RISE : 0;
  const FLOORS = ['t_p96c_sqfloor', 't_p96c_step', 't_p96c_sqfloor'];

  // ---------------------------------------------------------------- the bell, on the place's own clock
  const STROKES = 3, GAP = 6, SPEED = 20, HOLD = 40, BELL_HZ = 65, WALL_ROWS = 6;   // [PROPOSED] three strokes six seconds apart; 20 rows a second; 40 s after the last
  const HOURS = [0.125, 0.5];                                                     // the third hour (Vol VII: morning hours count from midnight), and noon
  const PARTIALS = [[0.5, 0.5, 6.0], [1, 0.6, 5.0], [1.19, 0.34, 4.0], [1.5, 0.2, 3.0], [2, 0.42, 3.4], [2.74, 0.14, 2.0], [3.76, 0.08, 1.4]];   // hum, prime, tierce, quint, nominal and two inharmonic
  let clock = 0, tollAt = -1e9, struck = STROKES, strokesAll = 0, heardThis = false, tiersSaid = false, lastTod = null, tollsHeard = 0;
  const span = () => (STROKES - 1) * GAP + HOLD;
  function toll() { tollAt = clock; struck = 0; heardThis = false; tiersSaid = false; return true; }
  function silentAt(y) { const t = clock - tollAt; if (t < 0 || t >= span()) return false; return WALL_ROWS + t * SPEED >= Number(y); }
  const tolling = () => { const t = clock - tollAt; return t >= 0 && t < span(); };

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
    const g = (v) => `rgb(${v | 0},${v | 0},${(v + 4) | 0})`;
    if (Engine.addTexture) {
      // black flagstones, big and square, worn smooth: a faint sheen where feet go
      tex('t_p96c_sqfloor', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const s = h2(i >> 5, j >> 5) * 8, joint = (i % 32 === 0 || j % 32 === 0) ? -12 : 0; px(x, g(24 + s + (h2(i, j) * 7 | 0) + joint), i, j); }
        for (let k = 0; k < 18; k++) px(x, g(44), (h2(k, 3) * 62) | 0, (h2(k, 7) * 62) | 0, 2, 1);
      });
      // a black step: the same stone, its nosing worn pale
      tex('t_p96c_step', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(28 + (h2(i, j) * 8 | 0) - (i % 32 === 0 ? 10 : 0)), i, j);
        for (let i = 0; i < 64; i++) { px(x, g(56 + (h2(i, 1) * 14 | 0)), i, 0, 1, 3); px(x, g(14), i, 3, 1, 1); }
      });
      // the Basilica's west end: big courses of black stone
      tex('t_p96c_facade', (x) => {
        px(x, '#0c0c10', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 16, b = 26 + (h2(r, k + 5) * 10 | 0); px(x, g(b), (k * 32 + o) % 64 + 1, r * 16 + 1, 30, 14); px(x, g(b + 9), (k * 32 + o) % 64 + 1, r * 16 + 1, 30, 1); }
        for (let i = 0; i < 12; i++) px(x, 'rgba(255,255,255,0.05)', (h2(i, 13) * 64) | 0, (h2(i, 17) * 64) | 0, 1, 6);
      });
      // the great black doors: tall leaves of black oak, iron-strapped, studded, a ring on each
      tex('t_p96c_blackdoors', (x) => {
        px(x, '#060608', 0, 0, 64, 64);
        for (let i = 3; i < 61; i += 6) px(x, g(18 + (h2(i, 2) * 6 | 0)), i, 2, 5, 62);
        for (const j of [10, 32, 54]) { px(x, g(40), 2, j, 60, 3); for (let i = 5; i < 62; i += 7) px(x, g(70), i, j + 1, 1, 1); }
        px(x, '#020203', 0, 0, 2, 64); px(x, '#020203', 62, 0, 2, 64);
        x.strokeStyle = g(66); x.lineWidth = 2; x.beginPath(); x.arc(50, 40, 4, 0, PI * 2); x.stroke();
      });
      // the black tower: narrow courses, a slit
      tex('t_p96c_tower', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 3, off = (row & 1) * 8, edge = ((i + off) % 16 === 0 || j % 8 === 0) ? -9 : 0; px(x, g(22 + (h2((i + off) >> 4, row) * 8 | 0) + (h2(i, j) * 5 | 0) + edge), i, j); }
        px(x, '#030304', 30, 18, 4, 26); px(x, g(38), 29, 17, 6, 1);
      });
      // the tower door: low, black, an iron bar across it
      tex('t_p96c_towerdoor', (x) => {
        px(x, '#0a0a0c', 0, 0, 64, 64); px(x, g(20), 10, 10, 44, 54); x.fillStyle = '#0a0a0c'; x.fillRect(10, 10, 44, 6);
        for (let i = 12; i < 54; i += 7) px(x, g(14), i, 12, 1, 52);
        px(x, g(52), 6, 34, 52, 5); px(x, g(72), 6, 34, 52, 1); for (const i of [8, 56]) px(x, g(30), i, 30, 3, 13);
      });
      // a house on the square: black stone, plain (its windows are the shutters)
      tex('t_p96c_sqhouse', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 4, off = (row & 1) * 10, edge = ((i + off) % 21 === 0 || j % 16 === 0) ? -8 : 0; px(x, g(20 + (h2((i + off) / 21 | 0, row + 40) * 8 | 0) + (h2(i, j + 64) * 4 | 0) + edge), i, j); }
        for (let k = 0; k < 6; k++) px(x, 'rgba(0,0,0,0.35)', (h2(k, 71) * 60) | 0, (h2(k, 73) * 60) | 0, 3, 2);   // old scars in the stone
      });
      // the arch through the Tiers' wall: black stone (as the wall), a pointed opening of dark, a worn sill
      tex('t_p96c_arch', (x) => {
        px(x, '#101014', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 16, b = 30 + (h2(r, k + 9) * 10 | 0); px(x, g(b), (k * 32 + o) % 64 + 1, r * 16 + 1, 30, 14); }
        for (let j = 8; j < 64; j++) { const half = j < 26 ? Math.max(0, 16 - Math.pow((26 - j) / 18, 1.6) * 16) : 16; if (half > 0) { px(x, g(46), 32 - half - 2, j, half * 2 + 4, 1); px(x, '#020203', 32 - half, j, half * 2, 1); } }
        px(x, g(52), 14, 62, 36, 2);
      });
    }
    // ---- sprites
    // a high lancet window of black glass, in a black stone frame (its edge just catches the dome's light)
    add('p96c_sqlancet', 32, 112, 2.4, (x) => {
      const frame = (w, c) => { x.fillStyle = c; x.beginPath(); x.moveTo(16 - w, 112); x.lineTo(16 - w, 34); x.quadraticCurveTo(16 - w, 8 - (14 - w), 16, 2 + (14 - w)); x.quadraticCurveTo(16 + w, 8 - (14 - w), 16 + w, 34); x.lineTo(16 + w, 112); x.closePath(); x.fill(); };
      frame(14, '#2c2c34'); frame(12, '#18181e'); frame(9, '#040406');
      for (let j = 30; j < 110; j += 12) px(x, '#16161c', 7, j, 18, 1);
      px(x, '#16161c', 15, 20, 2, 90);
      for (let j = 22; j < 108; j += 9) px(x, 'rgba(210,210,220,0.18)', 9 + ((j / 9) & 1) * 10, j, 2, 3);   // the dome's light, caught in the glass
    });
    // the bell in its opening high on the tower: a black-framed arch, the beam, and the bronze bell dark in it
    add('p96c_bell', 64, 84, 1.9, (x) => {
      x.fillStyle = '#1e1e24'; x.beginPath(); x.moveTo(2, 84); x.lineTo(2, 26); x.quadraticCurveTo(32, -8, 62, 26); x.lineTo(62, 84); x.closePath(); x.fill();
      x.fillStyle = '#030304'; x.beginPath(); x.moveTo(8, 84); x.lineTo(8, 28); x.quadraticCurveTo(32, 0, 56, 28); x.lineTo(56, 84); x.closePath(); x.fill();
      px(x, '#2a2420', 8, 18, 48, 4); px(x, '#3a3028', 30, 20, 4, 6);
      x.fillStyle = '#4e3c22'; x.beginPath(); x.moveTo(24, 28); x.quadraticCurveTo(20, 30, 20, 44); x.quadraticCurveTo(18, 58, 12, 66); x.lineTo(52, 66); x.quadraticCurveTo(46, 58, 44, 44); x.quadraticCurveTo(44, 30, 40, 28); x.closePath(); x.fill();
      px(x, '#7a5e34', 24, 30, 3, 34); px(x, '#8c6c3c', 25, 34, 1, 26); px(x, '#3a2c18', 12, 64, 40, 3); px(x, '#6a5430', 14, 62, 36, 1);
      px(x, '#2a2016', 30, 66, 4, 6); px(x, '#151515', 2, 80, 60, 4);
      for (let i = 10; i < 56; i += 6) px(x, '#141418', i, 72, 3, 10);   // the louvres below
    });
    // the board of hours: black wood on two posts, the words cut in and pale
    add('p96c_board', 44, 70, 1.0, (x) => {
      for (const i of [6, 35]) px(x, '#1a1612', i, 30, 4, 40);
      px(x, '#141214', 2, 4, 40, 30); px(x, '#2a2420', 2, 4, 40, 2); px(x, '#2a2420', 2, 32, 40, 2);
      for (let r = 0; r < 5; r++) { let i = 6; while (i < 38) { const w = 2 + ((h2(r, i) * 5) | 0); if (i + w > 38) break; px(x, '#b8b0a0', i, 9 + r * 5, w, 2); i += w + 2; } }
      px(x, '#c8a060', 20, 2, 4, 2);
    });
    // the white dome over the crossing, above the line: white, the shape of the old gold just showing in its ribs
    add('p96c_dome', 160, 100, 3.6, (x) => {
      px(x, '#f2f4f8', 30, 66, 100, 34);                                                 // the drum
      for (let i = 36; i < 128; i += 12) { px(x, '#d4d8e0', i, 72, 5, 18); px(x, '#ffffff', i + 1, 72, 1, 18); }   // its windows, white too
      x.fillStyle = '#fcfdff'; x.beginPath(); x.moveTo(24, 68); x.quadraticCurveTo(26, 6, 80, 4); x.quadraticCurveTo(134, 6, 136, 68); x.closePath(); x.fill();
      x.strokeStyle = '#e2dccb'; x.lineWidth = 1;
      for (let k = 1; k < 8; k++) { const bx = 24 + k * 14; x.beginPath(); x.moveTo(bx, 68); x.quadraticCurveTo(80 + (bx - 80) * 0.55, 18, 80, 4); x.stroke(); }   // the ribs, where the gold was
      px(x, '#ffffff', 76, 0, 8, 6); px(x, '#e6e2d4', 79, 0, 2, 4);                     // the lantern on its crown
      px(x, '#ffffff', 40, 26, 10, 30); px(x, '#ffffff', 46, 16, 8, 12);                // the light on it
      px(x, '#e6e8ee', 22, 66, 116, 3);
    }, (r, gg, b, a) => a > 0);
    // a shutter on the square, open a crack: two black leaves, a dark slit, and in the slit a faint glint
    add('p96c_shutter', 40, 50, 0.85, (x) => {
      px(x, '#1e1a18', 1, 1, 38, 48);
      for (const [x0, w] of [[3, 16], [21, 16]]) { px(x, '#0e0c0e', x0, 3, w, 44); for (let j = 6; j < 46; j += 5) px(x, '#1a1618', x0 + 1, j, w - 2, 1); }
      px(x, '#020203', 19, 3, 2, 44);
      px(x, '#c89a5a', 19, 20, 1, 2); px(x, '#5a4630', 20, 21, 1, 1);
      px(x, '#2a2420', 0, 47, 40, 3);
    }, (r, gg, b, a) => a > 200 && r > 180);
  }

  // ================================================================ building the square
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p96c_sqfloor', ceil: null, floorTextures: FLOORS, fogDist: 24, fogColor: [7, 7, 10], ambient: 0.13, music: 'inside', danger: 0,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 } });
    const L = m.ensureLvls();
    const [px0, py0, px1, py1] = P.paving;
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i;
      const inPave = i >= px0 && i <= px1 && j >= py0 && j <= py1;
      const inFront = j >= P.steps[1] && j < py0 && i >= px0 && i <= px1 && !(i >= P.tower[0] && i <= P.tower[2]);   // the rows by the steps
      if (inPave || inFront) { const st = i >= P.steps[0] && i <= P.steps[2] && j >= P.steps[1] && j <= P.steps[3]; L[k] = st ? stepLvl(j) : 0; m.setFloor(i, j, st ? 1 : 0); continue; }
      L[k] = 0;
      if (i >= P.tower[0] && i <= P.tower[2] && j >= P.tower[1] && j <= P.tower[3]) { m.block(i, j, 't_p96c_tower', 9.6); continue; }
      if (j <= 2 && i >= 3 && i <= 18) { m.block(i, j, 't_p96c_facade', 7.4); continue; }
      if (j <= 2) { m.block(i, j, 't_p96c_tower', 6.2); continue; }
      m.block(i, j, 't_p96c_sqhouse', 3.4 + h2(i >> 1, j >> 1) * 1.6);
    }
    // the great black doors at the top of the steps (two leaves; neither opens)
    const top = stepLvl(P.steps[1]);
    m.block(P.leaf[0], P.leaf[1], 't_p96c_blackdoors', top + 1);
    m.set(P.doors[0], P.doors[1], DOOR({ tex: 't_p96c_blackdoors', label: TX.doors, locked: 'p96c_never', lockMsg: TX.doorsShut }));
    m.setLvl(P.doors[0], P.doors[1], top); m.setLvl(P.leaf[0], P.leaf[1], top);
    // the tower door, barred inside
    m.set(P.towerDoor[0], P.towerDoor[1], DOOR({ tex: 't_p96c_towerdoor', label: TX.tower, locked: 'p96c_never', lockMsg: TX.towerShut }));
    // the way back
    m.set(P.arch[0], P.arch[1], DOOR({ tex: 't_p96c_arch', label: TX.archBack, portal: { map: TIERS, x: P.tiersOut[0], y: P.tiersOut[1], dir: PI / 2 } }));
    // the lancets over the doors, the dome over the line
    for (const lx of P.lancets) m.deco('p96c_sqlancet', lx, P.steps[1] + 0.04, { radius: 0.05, scale: 1, solid: false, yOff: -(top + 2.4), label: TX.lancet, _p96c: 'lancet' });
    m.add({ kind: 'deco', sprite: 'p96c_dome', x: P.dome[0], y: P.dome[1], scale: 1, solid: false, radius: 0.05, yOff: -8.3, glow: 1, label: TX.dome, _decor: true, _p96c: 'dome' });
    // the bell, the board of hours
    m.deco('p96c_bell', P.bell[0], P.bell[1], { radius: 0.05, scale: 1, solid: false, yOff: -7.0, label: TX.bell, _p96c: 'bell' });
    m.deco('p96c_board', P.board[0], P.board[1], { radius: 0.25, scale: 1, solid: true, label: TX.board, _p96c: 'board' });
    // the shutters round the square, each open a crack, and the faint light behind three of them
    SHUTTERS.forEach(([x, y], k) => {
      m.deco('p96c_shutter', x, y, { radius: 0.05, scale: 1, solid: false, yOff: -0.75, use: 'p96c_shutter', label: TX.shutter, _p96c: 'shutter', _k: k });
      if (WATCH[k]) { const dx = x < 4 ? 0.5 : x > 22 ? -0.5 : 0, dy = y > 21 ? -0.5 : 0; m.add({ kind: 'deco', sprite: 'p96c_shutter', x: x + dx, y: y + dy, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.2, lightCol: [10, 7, 3], _p96c: 'glint' }); }
    });
    // the faint white off the dome, on the steps
    m.add({ kind: 'deco', sprite: 'p96c_shutter', x: 13.5, y: 4.6, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.2, lightCol: [30, 30, 34], _p96c: 'domelight' });
    // and a little of it on the arch, so the way back can be found in the dark
    m.add({ kind: 'deco', sprite: 'p96c_shutter', x: 13.5, y: 21.2, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.2, lightCol: [22, 22, 26], _p96c: 'archlight' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world: the map, and its arch in the Tiers
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    art();
    maps[MAP] = build();
    const tm = maps[TIERS];
    if (tm && typeof HEIGHTS92 !== 'undefined') {
      const [i, j] = P.tiersDoor;
      try { tm.ensureLvls()[j * tm.w + i] = HEIGHTS92.lvlAt(j); } catch (e) { warnOnce('tiers lvl', e); }
      tm.set(i, j, DOOR({ tex: 't_p96c_arch', portal: { map: MAP, x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 }, label: TX.archTiers }));
    }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p96c_sq', 255); if (s & (1 << bit)) return false; f().p96c_sq = s | (1 << bit); say(t, cls, ms); return true; };
  const on = (id) => typeof G !== 'undefined' && G.map && G.mapId === id && G.map.id === id;
  const here = () => on(MAP);
  const tod01 = () => ((Number(G.tod) % 1) + 1) % 1;
  const asleep = () => { const t = tod01(); return t >= 0.25 && t < 0.6; };
  const said = {};   // each watcher's next line (by shutter)

  // the bell's note: a bronze tone made in code, a hum and inharmonic partials, a long decay
  function strike(gain) {
    try {
      if (typeof Audio_ === 'undefined' || !Audio_.ctx || !Audio_.sfxBus || Audio_.muted || !(gain > 0)) return;
      const ctx = Audio_.ctx, t0 = ctx.currentTime, out = ctx.createGain(); out.gain.value = Math.min(1, gain) * 0.55; out.connect(Audio_.sfxBus);
      for (const [r, a, dec] of PARTIALS) {
        const o = ctx.createOscillator(), gn = ctx.createGain(); o.type = 'sine'; o.frequency.value = BELL_HZ * r;
        gn.gain.setValueAtTime(0.0001, t0); gn.gain.exponentialRampToValueAtTime(a, t0 + 0.012); gn.gain.exponentialRampToValueAtTime(0.0001, t0 + dec);
        o.connect(gn); gn.connect(out); o.start(t0); o.stop(t0 + dec + 0.1);
      }
    } catch (e) { warnOnce('strike', e); }
  }
  const hearing = () => (here() || on(TIERS)) && G.state === 'play';
  function heardGain() { if (here()) return 1; if (on(TIERS)) { const y = Engine.cam.y; return Math.max(0.25, 0.95 - 0.6 * Math.max(0, y - WALL_ROWS) / 220); } return 0; }

  function tick(dt) {
    clock += Math.max(0, Number(dt) || 0);
    if (typeof G === 'undefined' || !G.map) return;
    const inSq = here(), inT = on(TIERS);
    // the hours: noon and the third hour ring it, while you are where it is heard (a long rest steps over it)
    if ((inSq || inT) && G.state === 'play') {
      const t = tod01();
      if (lastTod != null) { const d = t - lastTod; if (d > 0 && d < 0.02) for (const hr of HOURS) if (lastTod < hr && t >= hr) toll(); }
      lastTod = t;
    } else lastTod = null;
    // the strokes
    while (struck < STROKES && clock >= tollAt + struck * GAP) {
      struck++; strokesAll++;
      if (hearing()) {
        strike(heardGain());
        if (!heardThis) {
          heardThis = true; tollsHeard++; f().p96c_tolls = Math.min(9, fint('p96c_tolls', 9) + 1);
          say(inSq ? TX.tollSquare : TX.tollTiers, '', 8000);
          if (inT) tiersSaid = true;
          once(2, TX.tollFirst, '', 9000);
        } else if (inT && !tiersSaid) { tiersSaid = true; say(TX.tollTiers, '', 8000); }
      }
    }
    if (inSq && G.state === 'play') {
      once(0, TX.arrive, '', 9000);
      const c = Engine.cam, ci = c.x | 0, cj = c.y | 0;
      if (ci >= P.steps[0] && ci <= P.steps[2] && cj >= P.steps[1] && cj <= P.steps[3]) once(1, TX.steps, '', 4000);
      sync();
    }
    // the Tiers under the bell: the folk stand still where the silence has reached, and walk again when it lifts
    if (inT && G.ents) for (const e of G.ents) {
      if (!e || e.kind !== 'npc' || typeof e.id !== 'string' || !/^p92_/.test(e.id)) continue;
      if (silentAt(e.y)) { if (e.wander) { e._p96cW = 1; e.wander = false; e.moving = false; } }
      else if (e._p96cW) { e._p96cW = 0; e.wander = true; }
    }
  }

  // ---------------------------------------------------------------- the shutters
  function useOwn(e) {
    if (!e || e.use !== 'p96c_shutter' || !here()) return false;
    const k = e._k | 0;
    if (tolling() && silentAt(WALL_ROWS)) { say(TX.shutterHush, '', 4000); return true; }
    if (asleep()) { say(TX.shutterDay, '', 4000); return true; }
    const lines = WATCH[k];
    if (!lines) { say(TX.shutterMute, '', 4000); return true; }
    const n = said[k] | 0; said[k] = n + 1;
    say(lines[Math.min(n, lines.length - 1)], 'voice', 6000);
    return true;
  }
  let syncKey = '';
  function sync() {
    if (!here() || !G.ents) return;
    const key = asleep() ? 'd' : 'n'; if (key === syncKey) return; syncKey = key;
    for (const e of G.ents) if (e && e._p96c === 'shutter') e.label = key === 'd' ? TX.shutterDay : TX.shutter;
  }

  // ================================================================ wiring
  function wire() {
    art();
    // the square's colour grade: cold, not the candle-warm grade every interior gets by default (or the white dome reads as parchment)
    try { if (typeof POST !== 'undefined' && POST.config && POST.config.grade && !POST.config.grade[MAP]) POST.config.grade[MAP] = 'crypt'; } catch (e) { warnOnce('grade', e); }
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { lastTod = null; syncKey = ''; sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    // in the Tiers, while the silence holds where they stand, the folk do not talk
    if (typeof talk === 'function') { const _t = talk; talk = function (e) { try { if (e && e.kind === 'npc' && typeof e.id === 'string' && /^p92_/.test(e.id) && on(TIERS) && silentAt(e.y)) { say(TX.shutterHush, '', 4000); return undefined; } } catch (err) { warnOnce('talk', err); } return _t.apply(this, arguments); }; }
  }
  wire();

  return { TX, WATCH, TEXTS, MAP, W, H, P, SHUTTERS, HOURS, STROKES, GAP, SPEED, HOLD, BELL_HZ, PARTIALS, stepLvl, build, join, tick, useOwn, sync,
    toll, silentAt, tolling, tollsHeard: () => tollsHeard, strokes: () => strokesAll, clock: () => clock, setClock: (v) => { clock = Number(v) || 0; } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BLACKSQUARE96;
if (typeof window !== 'undefined') { window.BLACKSQUARE96 = BLACKSQUARE96; window.BELLYARD96 = BLACKSQUARE96; }
