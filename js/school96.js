// ============================================================
//  school96: the Dawning Heights, part four: the Basilica school (Phase 96; plan: Phase 89 and Phase 90, approved 14 Nov 2026;
//  design: Team C, 16 Nov).
//
//  WHAT THE BOOK MADE OF THE PLAN. Phase 89 put a child on "a bench under the great east window" and a treble rehearsing there at
//  dusk. Book Three gives the bench ("in the Basilica school at Sol-Luminary, on a bench under the great east window, by a
//  Cantor of the Pure Note with a tuning-rod and a voice like a bell"), and Book Two puts the Basilica's east end above the line:
//  "Above the line, its east end was white. Not painted. Taken." The altar end "has been sealed since the morning of the
//  Fracture ... Nobody goes into it. Except me." So in Harvestmonth 419 nobody sits on that bench. The game only tells of it.
//  The school itself lives on (Book Two: "the children's choirs of the Basilica school"), so it meets now in a room on the shade
//  side of the iron wall, where Book Two has small black-walled rooms with a hush-lamp on a hook ([PROPOSED]: where it meets).
//  No treble is said to be chosen this spring; the child here is only practising.
//
//  THE ROOMS: 1 the black passage (a hush-lamp on a hook)   2 the schoolroom: benches, the Cantor's desk and tuning-rod, the
//  slate, two high lancets of black glass, the notice   3 the roll's lectern   4 the treble's practice-room (a low step).
//  THE HOURS: only at dusk (tod 0.74 to 0.84) are the treble and the Cantor in the practice-room, and one note is held: 528
//  (Book Two: "Five hundred and twenty-eight."), with a breath in it every nine seconds. The rest of the day the school is empty
//  and only the hush-lamps whistle.
//  A place to find, not fight: no foes, no gear, no lamps. Flags (small ints): p96c_seen (bits), p96c_roll (the roll read).
// ============================================================
'use strict';

const SCHOOL96 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p96_school', TIERS = 'p92_tiers';
  const W = 18, H = 14;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('school96: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('Sol-Luminary: the Basilica school'),
    doorTiers: S('A low black door in the black wall. The Basilica school.'),
    doorBack: S('The low black door, back out to the bell-gallery stair'),
    // Book Two: "a hush-lamp on a hook whistling its small high note"
    arrive: S('A short passage, black, and a hush-lamp on a hook whistling its small high note. Beyond it, a schoolroom.'),
    hushlamp: S('A hush-lamp on a hook, whistling its small high note.'),
    room: S('The Basilica school. Benches in rows before a desk, a slate on the wall, and two high windows of black glass.'),
    bench: S('Benches worn pale where children sat. They are swept.'),
    desk: S('The Cantor\'s desk, of black wood, under the slate.'),
    // Book Three: "a Cantor of the Pure Note with a tuning-rod"
    rod: S('A Cantor\'s tuning-rod, laid on the desk. Struck, it gives one note.'),
    // Book Three: "Every soul, the Cantor had said, holds one true note. Sin is the note going flat. Grace is the note held."
    slate: S('Chalk on the slate, in a child\'s hand under the Cantor\'s: "Every soul holds one true note. Sin is the note going flat. Grace is the note held."'),
    // Book Two: "black glass in the high lancet windows"
    lancet: S('A high lancet window of black glass. Nothing comes through it.'),
    notice: S('A notice by the passage, dated 412: "Lessons are held in the west room until the nave is opened."'),
    noticeEast: S('The children were taught on a bench under the great east window. The east window is on the other side of the iron wall.'),
    lectern: S('The school\'s roll, on a lectern by the west wall. Read it'),
    roll: S('The school\'s roll. Seven years of names, and a line through most of them.'),
    rollCount: S('The year of the Fracture: three hundred and twelve names. This year: twenty-six.'),
    step: S('A practice step: a low stone step, worn hollow in the middle by small feet.'),
    practice: S('The practice-room. A low step, worn hollow, and nobody on it now.'),
    practiceDusk: S('A child in white stands on a low step and holds one note. A Cantor sits by, a tuning-rod across the knees.'),
    heard: S('From the little room off the schoolroom, one high note, held. Now and then it stops for a breath, and goes on.'),
    treble: S('The treble'),
    cantor: S('The Cantor'),
  };
  const SAY = {
    treble: {
      greet: {
        polite: S('Light keep you true.'),
        normal: S('Light keep you true. Speak low, please. I am practising.'),
        blunt: S('You are very loud. Out there they would call that low-pitched.'),
      },
      topics: {
        [S('The note')]: S('I am holding it. The Cantor says if I hold it every night it will hold itself.'),
        [S('Singing')]: S('We may sing here. Out there nobody speaks above the Narrow.'),
      },
    },
    cantor: {
      greet: {
        polite: S('Light keep you true.'),
        normal: S('Light keep you true. Sit, if you like, and keep the note company.'),
        blunt: S('Light keep you true. In this room we speak softly, and we listen.'),
      },
      topics: {
        // Book Three, the Cantor's lesson
        [S('The lesson')]: S('Every soul holds one true note. Sin is the note going flat. Grace is the note held.'),
        // Series Bible: "preaches unison as holiness and every second note as sin"
        [S('The second note')]: S('The Church teaches that the second note is sin.'),
        [S('The east window')]: S('We taught under the east window, before. We teach here now.'),
      },
    },
  };

  // ================================================================ the plan (cells)
  const P = {
    passage: [8, 10, 10, 12], room: [2, 3, 12, 9], practice: [14, 3, 16, 6], doorway: [13, 5],
    door: [9, 13], arrive: [9.5, 12.4], tiersDoor: [89, 5], tiersOut: [89.5, 6.6],
    lectern: [3.5, 5.5], desk: [7.5, 3.72], rod: [7.78, 3.98], slate: [7.5, 3.05], lancets: [[4.5, 3.05], [10.5, 3.05]], notice: [7.1, 9.93],
    step: [15.5, 4.5], treble: [15.5, 4.5], cantor: [16.15, 6.25], note: [15.5, 4.5],
  };
  const BENCHES = [];
  for (let r = 0; r < 4; r++) for (const x of [5.0, 10.0]) BENCHES.push([x + (h2(r, x | 0) - 0.5) * 0.3, 5.1 + r * 1.2]);
  // hush-lamps on hooks, and beside each a tiny deco that carries its light (never the people)
  const HUSH = [
    { at: [8.07, 11.2], light: [8.6, 11.2] },          // the passage
    { at: [2.07, 4.6], light: [2.7, 4.8] },            // by the lectern
    { at: [12.93, 7.6], light: [12.3, 7.4] },          // the schoolroom's east wall
    { at: [16.93, 6.5], light: [16.4, 6.6] },          // the practice-room, behind the Cantor (not on the child)
  ];
  const DUSK = [0.74, 0.84], NOTE = 528, BREATH = { every: 9, gap: 1.5 }, NOTE_GAIN = 0.28, NOTE_NEAR = 1.8, NOTE_FALL = 8.5;
  const FLOORS = ['t_p96c_schoolfloor', 't_p96c_blackstone'];

  // ================================================================ art (code-drawn; hashed, never chance)
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
    const g = (v) => `rgb(${v},${v},${v + 3})`;
    const wood = (v, k) => `rgb(${(v * 1.0) | 0},${(v * 0.82) | 0},${(v * 0.66 + (k || 0)) | 0})`;
    if (Engine.addTexture) {
      // the black stone of the west end, dressed in courses
      tex('t_p96c_blackstone', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 4, off = (row & 1) * 16, joint = ((i + off) % 32 === 0) || (j % 16 === 0); px(x, g(joint ? 5 : 12 + (h2((i + off) >> 5, row) * 6 | 0) + (h2(i, j) * 4 | 0)), i, j); }
      });
      // worn boards: dark, paler where feet have gone
      tex('t_p96c_schoolfloor', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const b = j >> 3, wear = h2(b, i >> 3) > 0.72 ? 10 : 0; px(x, wood(34 + wear + (h2(b, i >> 1) * 8 | 0) + (h2(i, j) * 4 | 0)), i, j); }
        for (let j = 0; j < 64; j += 8) px(x, wood(14), 0, j, 64, 1);
        for (let b = 0; b < 8; b++) { const k = (h2(b, 7) * 60) | 0; px(x, wood(18), k, b * 8, 1, 8); }
      });
      // the low black door: planks, iron straps, a stone frame worn a little pale at the jambs
      tex('t_p96c_schooldoor', (x) => {
        px(x, g(26), 0, 0, 64, 64);
        for (let j = 0; j < 64; j++) for (const i of [0, 1, 2, 3, 60, 61, 62, 63]) px(x, g(40 + (h2(i, j) * 10 | 0)), i, j);
        for (let i = 0; i < 64; i++) for (const j of [0, 1, 2]) px(x, g(40 + (h2(i, j) * 10 | 0)), i, j);
        for (let j = 3; j < 64; j++) for (let i = 4; i < 60; i++) px(x, `rgb(${12 + (h2(i >> 3, j) * 6 | 0)},${11 + (h2(i >> 3, j) * 5 | 0)},${12 + (h2(i >> 3, j) * 5 | 0)})`, i, j);
        for (let i = 12; i < 60; i += 8) px(x, '#050505', i, 3, 1, 61);
        for (const j of [14, 44]) { px(x, g(46), 4, j, 56, 4); for (let i = 8; i < 60; i += 10) px(x, g(84), i, j + 1, 2, 2); }
        px(x, g(70), 50, 30, 5, 5); px(x, g(20), 51, 31, 3, 3);   // the ring
      });
    }
    // ---- sprites
    // benches: one long seat on its legs, the top worn pale in patches; each one cut a little different (hashed)
    const bench = (seed) => (x) => {
      const len = 72 + ((h2(seed, 1) * 20) | 0), x0 = ((96 - len) / 2) | 0, legIn = 6 + ((h2(seed, 2) * 6) | 0);
      for (let i = x0; i < x0 + len; i++) { px(x, wood(40 + (h2(i, seed) * 6 | 0)), i, 8, 1, 3); px(x, wood(28 + (h2(i >> 2, seed) * 5 | 0)), i, 11, 1, 5); }
      for (let k = 0; k < 3 + ((h2(seed, 3) * 3) | 0); k++) { const at = x0 + 6 + ((h2(seed, 10 + k) * (len - 22)) | 0); px(x, wood(66 + (h2(seed, 20 + k) * 10 | 0)), at, 8, 9 + ((h2(seed, 30 + k) * 5) | 0), 3); }   // worn pale where children sat
      px(x, wood(18), x0, 15, len, 1);
      for (const lx of [x0 + legIn, x0 + len - legIn - 4]) px(x, wood(24), lx, 16, 4, 12);
      if (h2(seed, 4) > 0.5) px(x, wood(22), x0 + legIn + 2, 22, len - 2 * legIn - 4, 2);   // a stretcher
      if (h2(seed, 5) > 0.55) px(x, wood(12), x0 + ((h2(seed, 6) * len) | 0), 11, 1, 5);   // a crack
      if (h2(seed, 8) > 0.6) px(x, 'rgba(0,0,0,0)', x0 + len - 3, 8, 3, 2);              // a chipped corner
    };
    for (let k = 0; k < 8; k++) add(k ? 'p96c_bench' + k : 'p96c_bench', 96, 28, 0.42, bench(k + 3));
    // the Cantor's desk: black wood, a sloped top, a shelf under it
    add('p96c_desk', 64, 52, 0.78, (x) => {
      x.fillStyle = wood(30); x.beginPath(); x.moveTo(4, 14); x.lineTo(60, 10); x.lineTo(60, 16); x.lineTo(4, 20); x.closePath(); x.fill();
      px(x, wood(46), 4, 14, 56, 1);
      px(x, wood(20), 6, 20, 52, 12); px(x, wood(14), 8, 22, 48, 8);
      px(x, wood(22), 6, 32, 5, 20); px(x, wood(22), 53, 32, 5, 20); px(x, wood(18), 11, 42, 42, 3);
      px(x, '#b8ae94', 14, 23, 9, 6); px(x, '#a49a80', 25, 24, 7, 5);   // books, or the children's tablets, on the shelf
    });
    // the tuning-rod: a slender bright rod with a turned grip
    add('p96c_tuningrod', 40, 8, 0.06, (x) => { px(x, '#d8d0b4', 4, 3, 28, 2); px(x, '#fff6dc', 6, 3, 22, 1); px(x, '#5a4a30', 32, 2, 6, 4); px(x, '#8a7448', 33, 2, 2, 1); });
    // the slate: black slate in a wood frame, chalk lines in a child's hand
    add('p96c_slate', 72, 44, 0.6, (x) => {
      px(x, wood(40), 0, 0, 72, 44); px(x, '#16181c', 3, 3, 66, 38);
      for (let r = 0; r < 4; r++) { let i = 7; while (i < 64) { const w = 3 + ((h2(i, r) * 7) | 0); for (let k = 0; k < w; k++) px(x, h2(i + k, r * 9) > 0.25 ? '#d6d6ce' : '#8a8c88', i + k, 9 + r * 8 + ((h2(i + k, r) * 3) | 0), 1, 1); i += w + 2 + ((h2(r, i) * 2) | 0); } }
      px(x, '#e8e8e0', 58, 38, 6, 2);   // a stub of chalk on the ledge
    });
    // a high lancet window of black glass: leaded, a faint grey sheen on the panes, a stone surround
    add('p96c_lancet', 28, 90, 1.25, (x) => {
      x.fillStyle = g(34); x.beginPath(); x.moveTo(1, 90); x.lineTo(1, 22); x.quadraticCurveTo(1, 2, 14, 0); x.quadraticCurveTo(27, 2, 27, 22); x.lineTo(27, 90); x.closePath(); x.fill();
      x.fillStyle = '#07080b'; x.beginPath(); x.moveTo(5, 86); x.lineTo(5, 23); x.quadraticCurveTo(5, 6, 14, 4); x.quadraticCurveTo(23, 6, 23, 23); x.lineTo(23, 86); x.closePath(); x.fill();
      for (let j = 14; j < 86; j += 10) px(x, '#2a2c32', 5, j, 18, 1);
      px(x, '#2a2c32', 14, 5, 1, 81);
      for (let j = 16; j < 84; j += 10) { px(x, '#1a1c24', 7, j + 2, 2, 5); px(x, '#1a1c24', 17, j + 4, 2, 4); }
    });
    // the notice: a sheet, browned, four pins
    add('p96c_notice', 28, 36, 0.36, (x) => {
      px(x, '#a89c80', 2, 2, 24, 32); px(x, '#8a7e64', 2, 33, 24, 1);
      for (let r = 0; r < 7; r++) { const w = 12 + ((h2(r, 4) * 8) | 0); px(x, '#3a3428', 5, 6 + r * 4, w, 1); }
      px(x, '#2a2a2a', 5, 31, 6, 1); for (const [i, j] of [[3, 3], [24, 3], [3, 32], [24, 32]]) px(x, '#6a6e74', i, j, 1, 1);
    });
    // the roll on its lectern: black wood, and the long roll hanging down it, names in columns, most of them struck through
    add('p96c_roll', 44, 80, 1.15, (x) => {
      px(x, wood(24), 19, 30, 6, 44); px(x, wood(22), 8, 74, 28, 6);
      x.fillStyle = wood(30); x.beginPath(); x.moveTo(4, 16); x.lineTo(40, 12); x.lineTo(40, 30); x.lineTo(4, 32); x.closePath(); x.fill();
      px(x, '#c8bc9c', 8, 6, 28, 20); px(x, '#b4a888', 8, 4, 28, 3); px(x, '#b4a888', 8, 25, 28, 3);
      px(x, '#c8bc9c', 10, 30, 24, 26); px(x, '#a89c7e', 9, 55, 26, 3);
      for (let r = 0; r < 11; r++) for (const c of [0, 1]) { const y = 8 + r * 4 + (r > 4 ? 6 : 0), i0 = 11 + c * 12, w = 6 + ((h2(r, c) * 4) | 0); if (y > 54) continue; px(x, '#4a4232', i0, y, w, 1); if (h2(r + 3, c + 5) < 0.88) px(x, '#6a2a20', i0 - 1, y, w + 2, 1); }
    });
    // the practice step: a low stone step, grey, hollowed in the middle
    add('p96c_step', 64, 16, 0.14, (x) => {
      for (let j = 3; j < 16; j++) for (let i = 2; i < 62; i++) px(x, g(70 + (h2(i, j) * 16 | 0) - (j < 6 ? -12 : 0)), i, j);
      for (let i = 20; i < 44; i++) { const d = 1 - Math.abs(i - 32) / 12; px(x, g(62 + (d * 6 | 0)), i, 3, 1, 2); }
      px(x, g(40), 2, 15, 60, 1);
    });
    // a hush-lamp on a hook: an iron hook, a small lamp, and its reed
    add('p96c_hushlamp', 20, 44, 0.42, (x) => {
      px(x, g(44), 2, 0, 12, 2); px(x, g(44), 12, 0, 2, 10); px(x, g(44), 9, 9, 5, 2);
      px(x, g(36), 6, 12, 8, 3); px(x, g(30), 5, 15, 10, 2);
      px(x, '#e8b060', 7, 18, 6, 9); px(x, '#fff0c4', 8, 20, 4, 5);
      px(x, g(34), 6, 27, 8, 3); px(x, g(52), 9, 30, 2, 12); px(x, g(80), 9, 41, 2, 2);   // the reed
    }, (r, gg, b, a) => a > 0 && r > 220);
    // the treble: a child of about ten, a white surplice over a black cassock, hands folded, mouth open on the note
    add('p96c_treble', 40, 100, 0.72, (x) => {
      const cx = 20;
      x.fillStyle = '#16141a'; x.beginPath(); x.moveTo(cx - 8, 98); x.lineTo(cx - 7, 60); x.lineTo(cx + 7, 60); x.lineTo(cx + 8, 98); x.closePath(); x.fill();
      x.fillStyle = '#f2f0ea'; x.beginPath(); x.moveTo(cx - 13, 76); x.lineTo(cx - 9, 32); x.lineTo(cx + 9, 32); x.lineTo(cx + 13, 76); x.closePath(); x.fill();
      px(x, '#dcd8ce', cx - 13, 74, 26, 2); for (let i = cx - 11; i < cx + 11; i += 4) px(x, '#d8d4ca', i, 40, 1, 34);
      px(x, '#e8e6de', cx - 16, 36, 6, 30); px(x, '#e8e6de', cx + 10, 36, 6, 30);   // the wide sleeves
      px(x, '#d8c0a8', cx - 4, 52, 8, 5); px(x, '#c8b098', cx - 4, 55, 8, 1);       // hands folded
      px(x, '#16141a', cx - 4, 30, 8, 4);                                            // the cassock's collar
      px(x, '#d8c0a8', cx - 6, 12, 12, 18); px(x, '#3a2a1e', cx - 7, 8, 14, 7); px(x, '#3a2a1e', cx - 7, 12, 2, 7); px(x, '#3a2a1e', cx + 5, 12, 2, 7);
      px(x, '#1a1416', cx - 4, 19, 2, 1); px(x, '#1a1416', cx + 2, 19, 2, 1); px(x, '#4a2a26', cx - 1, 24, 3, 3);   // the mouth, open on the note
      px(x, '#0c0a0a', cx - 7, 97, 6, 3); px(x, '#0c0a0a', cx + 1, 97, 6, 3);
    });
    // the Cantor: seated on a stool, in white, grey-haired, the tuning-rod across the knees
    add('p96c_cantor', 64, 108, 0.9, (x) => {
      const cx = 32;
      px(x, wood(26), cx - 12, 84, 24, 4); px(x, wood(20), cx - 11, 88, 3, 20); px(x, wood(20), cx + 8, 88, 3, 20);   // the stool
      x.fillStyle = '#ece9e0'; x.beginPath(); x.moveTo(cx - 14, 86); x.lineTo(cx - 12, 30); x.lineTo(cx + 12, 30); x.lineTo(cx + 14, 70); x.lineTo(cx + 26, 72); x.lineTo(cx + 26, 104); x.lineTo(cx + 14, 104); x.lineTo(cx + 12, 86); x.closePath(); x.fill();   // body, the lap, the robe falling to the floor
      px(x, '#d6d2c6', cx + 14, 72, 12, 2); px(x, '#d6d2c6', cx - 4, 34, 1, 50); px(x, '#d6d2c6', cx + 18, 76, 1, 28);
      px(x, '#e4e0d6', cx - 18, 34, 7, 30); px(x, '#e4e0d6', cx + 11, 34, 7, 24); px(x, '#e4e0d6', cx + 14, 56, 10, 7);   // sleeves, the forearm to the knees
      px(x, '#d2bca6', cx + 22, 62, 5, 5); px(x, '#d2bca6', cx - 16, 64, 5, 5);
      px(x, '#d8d0b4', cx - 14, 66, 42, 2); px(x, '#fff6dc', cx - 10, 66, 30, 1); px(x, '#5a4a30', cx + 24, 65, 5, 4);   // the rod across the knees
      px(x, '#d2bca6', cx - 7, 8, 14, 20); px(x, '#9a9890', cx - 8, 4, 16, 6); px(x, '#9a9890', cx - 8, 8, 3, 10); px(x, '#9a9890', cx + 5, 8, 3, 10);
      px(x, '#1a1416', cx - 4, 16, 2, 1); px(x, '#1a1416', cx + 2, 16, 2, 1); px(x, '#8a6a5a', cx - 2, 22, 4, 1);
      px(x, '#0c0a0a', cx + 14, 104, 12, 4);
    });
  }

  // ================================================================ the defs: the two people
  function defs() {
    if (typeof NPCS === 'undefined') return;
    if (!NPCS.p96c_treble) NPCS.p96c_treble = { name: TX.treble, sprite: 'p96c_treble', portrait: 'townsman', tier: 'high', greet: SAY.treble.greet, topics: SAY.treble.topics };
    if (!NPCS.p96c_cantor) NPCS.p96c_cantor = { name: TX.cantor, sprite: 'p96c_cantor', portrait: 'townsman', tier: 'high', greet: SAY.cantor.greet, topics: SAY.cantor.topics };
  }

  // ================================================================ building the school (its own map, with a ceiling)
  const inRect = (r, x, y) => x >= r[0] && x < r[2] + 1 && y >= r[1] && y < r[3] + 1;
  const settle = (e, dir) => { e._h = true; e.homeX = e.x; e.homeY = e.y; e.wanderT = 1e9; e.dir = dir; e.facing = dir; return e; };   // as kestrel16: hydrate() would draw Math.random
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p96c_schoolfloor', ceil: 't_p96c_blackstone', floorTextures: FLOORS, fogDist: 12, fogColor: [8, 8, 11], ambient: 0.16, music: 'inside', danger: 0,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 } });
    m.ceilZ = 2.4;
    m.rect(0, 0, W - 1, H - 1, 't_p96c_blackstone');
    m.block(0, 0, 't_p96c_blackstone', m.ceilZ);   // as pilgrim95's house: a wall with its own top makes this a relief map, so the walls reach the ceiling
    for (const r of [P.room, P.practice, P.passage]) m.clear(r[0], r[1], r[2], r[3]);
    m.clear(P.doorway[0], P.doorway[1], P.doorway[0], P.doorway[1]);
    for (let j = P.passage[1]; j <= P.passage[3]; j++) for (let i = P.passage[0]; i <= P.passage[2]; i++) m.setFloor(i, j, 1);
    // the door back to the Tiers
    m.set(P.door[0], P.door[1], DOOR({ tex: 't_p96c_schooldoor', portal: { map: TIERS, x: P.tiersOut[0], y: P.tiersOut[1], dir: PI / 2 }, label: TX.doorBack }));
    // the hush-lamps, each with its light beside it
    for (const L of HUSH) {
      m.deco('p96c_hushlamp', L.at[0], L.at[1], { radius: 0.05, scale: 1, solid: false, yOff: -1.3, label: TX.hushlamp, _p96c: 'hush' });
      m.add({ kind: 'deco', sprite: 'p96c_hushlamp', x: L.light[0], y: L.light[1], scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.3, lightCol: [58, 54, 44], _p96c: 'light' });
    }
    // the schoolroom
    BENCHES.forEach(([x, y], k) => m.deco(k ? 'p96c_bench' + k : 'p96c_bench', x, y, { radius: 0.55, scale: 1, solid: true, label: TX.bench, _p96c: 'bench' }));
    m.deco('p96c_desk', P.desk[0], P.desk[1], { radius: 0.5, scale: 1, solid: true, label: TX.desk, _p96c: 'desk' });
    m.deco('p96c_tuningrod', P.rod[0], P.rod[1], { radius: 0.05, scale: 1, solid: false, yOff: -0.6, label: TX.rod, _p96c: 'rod' });
    m.deco('p96c_slate', P.slate[0], P.slate[1], { radius: 0.05, scale: 1, solid: false, yOff: -0.95, label: TX.slate, _p96c: 'slate' });
    for (const [x, y] of P.lancets) m.deco('p96c_lancet', x, y, { radius: 0.05, scale: 1, solid: false, yOff: -1.0, label: TX.lancet, _p96c: 'lancet' });
    m.deco('p96c_notice', P.notice[0], P.notice[1], { radius: 0.05, scale: 1, solid: false, yOff: -0.95, use: 'p96c_notice', label: TX.notice, _p96c: 'notice' });
    m.deco('p96c_roll', P.lectern[0], P.lectern[1], { radius: 0.4, scale: 1, solid: true, use: 'p96c_roll', label: TX.lectern, _p96c: 'roll' });
    // the treble's practice-room
    m.deco('p96c_step', P.step[0], P.step[1], { radius: 0.35, scale: 1, solid: false, label: TX.step, _p96c: 'step' });
    settle(m.npc('p96c_treble', P.treble[0], P.treble[1], { facing: PI, yOff: -0.09, _p96c: 'person', hidden: true }), PI);
    settle(m.npc('p96c_cantor', P.cantor[0], P.cantor[1], { facing: -PI * 0.75, _p96c: 'person', hidden: true }), -PI * 0.75);
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world: the map, and its door in the Tiers
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[MAP] = build();
    const tm = maps[TIERS];
    if (tm && typeof HEIGHTS92 !== 'undefined') {
      const [i, j] = P.tiersDoor;
      try { tm.ensureLvls()[j * tm.w + i] = HEIGHTS92.lvlAt(j); } catch (e) { warnOnce('tiers lvl', e); }
      tm.set(i, j, DOOR({ tex: 't_p96c_schooldoor', portal: { map: MAP, x: P.arrive[0], y: P.arrive[1], dir: -PI / 2 }, label: TX.doorTiers }));
    }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p96c_seen', 255); if (s & (1 << bit)) return false; f().p96c_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const here = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const tod01 = () => ((Number(G.tod) % 1) + 1) % 1;
  const dusk = (t) => { const v = t == null ? tod01() : ((t % 1) + 1) % 1; return v >= DUSK[0] && v < DUSK[1]; };
  const hour = () => (dusk() ? 'dusk' : 'empty');
  // the held note: full in the practice-room, falling away with distance, a breath every nine seconds; only at dusk
  function noteAt(x, y, t, tv) {
    if (!dusk(tv)) return 0;
    const ph = ((t % BREATH.every) + BREATH.every) % BREATH.every; if (ph >= BREATH.every - BREATH.gap) return 0;
    const d = Math.hypot(x - P.note[0], y - P.note[1]);
    return NOTE_GAIN * (d <= NOTE_NEAR ? 1 : Math.max(0, 1 - (d - NOTE_NEAR) / NOTE_FALL));
  }
  let clock = 0, noteLevel = 0;
  function tick(dt) {
    clock += dt;
    let want = 0;
    if (here() && G.state === 'play') want = noteAt(Engine.cam.x, Engine.cam.y, clock);
    try { if (typeof Audio_ !== 'undefined' && Audio_.hum && (want > 0 || noteLevel > 0)) Audio_.hum(want, NOTE, 'p96c_treble'); } catch (e) { warnOnce('note', e); }
    noteLevel = want;
    if (!here() || G.state !== 'play' || !G.player || G.dead) return;
    sync();
    const c = Engine.cam;
    once(0, TX.arrive, '', 8000);
    if (inRect(P.room, c.x, c.y)) { once(1, TX.room, '', 8000); if (dusk() && noteLevel > 0) once(4, TX.heard, '', 8000); }
    if (inRect(P.practice, c.x, c.y)) { if (dusk()) once(2, TX.practiceDusk, '', 9000); else once(3, TX.practice, '', 6000); }
  }
  // the hours: the treble and the Cantor are there only at dusk; then the rod is in the Cantor's hands, not on the desk
  function sync() {
    if (!here()) return;
    const d = dusk();
    for (const e of G.ents) { if (!e || !e._p96c) continue;
      if (e._p96c === 'person') e.hidden = !d;
      else if (e._p96c === 'rod') e.hidden = d; }
  }
  function useOwn(e) {
    if (!e || !here()) return false;
    if (e.use === 'p96c_roll') { say(TX.roll, '', 8000); say(TX.rollCount, '', 9000); f().p96c_roll = 1; return true; }
    if (e.use === 'p96c_notice') { say(TX.notice, '', 8000); say(TX.noticeEast, '', 9000); return true; }
    return false;
  }

  // ================================================================ wiring
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
  }
  wire();

  return { TX, SAY, TEXTS, MAP, W, H, P, BENCHES, HUSH, DUSK, NOTE, BREATH, build, join, tick, sync, useOwn, hour, dusk, noteAt,
    clock: () => clock, setClock: (v) => { clock = v; }, level: () => noteLevel };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SCHOOL96;
if (typeof window !== 'undefined') window.SCHOOL96 = SCHOOL96;
