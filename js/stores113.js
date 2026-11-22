// ============================================================
//  stores113 — Phase 113, Design A (ruled by the owner 22 Nov 2026, "A then C"): the wall keeps its secret. The
//  old garrison's store at Tower Nine's foot (the Quartermaster's since 406; not the Watch's stores), his errands, and a night on the wall-walk. See
//  story/Game Layer/Phase 113 - The Rift Wall, part A (the stores and the night on the wall).md
//
//  THE ONE RULE. The traveller never goes past the lip, never goes out by the postern, and is never told what is down
//  there. The postern at Tower Nine's foot stays barred exactly as Phase 100 has it (RIFT100.TX.posternMsg). Seven words
//  are in none of this module's strings (the test lists them).
//
//  CANON (the books; copied from the design). The Quartermaster, Halvard Greer of Greystairs in the Peaks:
//  "Quartermaster of the old garrison at Null-Watch from 406. Penal legion from the spring of 413" (Book Three, Part Two,
//  line 289); "kept on at the Watch because nobody else knew where anything was" (347); sixty, in a lead coat (109);
//  cannot read, can write his name and two words more (Vol VI, 147). His sister keeps a bakery in Greystairs and knits;
//  Two-Eleven writes his letters; things come "on the cart" (75). He goes out "at the third hour, as he had every night
//  for six years" (65), from the postern at Tower Nine's foot, with something on his back and a lantern (67). He can hear
//  glass (Part One, 931). The wind off the Rift has no pitch and carries no sound more than a few feet. The Watch talks,
//  always, about nothing. Hours of the night are counted from full dark and given bare (Vol VII §5). Harvestmonth 419;
//  nobody here has heard of the Drift-Kestrel.
//  [PROPOSED]: the stores' place and furniture, the cart, the errands, the letter, "Hal".
//
//  THE PLACE. p113_stores: a narrow, crowded vault, sixteen by seven, racks floor to roof, behind a door in the obsidian at Tower Nine's foot, next to the
//  Quartermaster (added to RIFT100's wall from here, by wrapping buildAllMaps after RIFT100 does: no hook in rift100.js was
//  needed). Two dim lamps; nine things to look at; knotted strings on everything (they are the stores' ledger). A cart at
//  the west gate.
//  THE ERRANDS. The Quartermaster's own subject, Work. Flags (small ints, read through fint): p113_qm (0 nothing yet, 1 the
//  crate asked, 2 brought, 3 oil asked, 4 brought, 5 blanket asked, 6 brought, 7 letter asked, 8 letter read), p113_carry
//  (0 nothing, 1 the crate, 2 the oil, 3 the blanket: no items, only the flag), p113_seen (the night seen), p113_bits
//  (said-once lines: 1 the glass arm heard, 2 after the night). A glassed traveller is never asked to read the letter and
//  is never given the hour.
//  THE NIGHT. On the wall-walk between Towers Five and Six, in the third hour of the night, once, for anyone standing
//  there: a lantern from the foot of Tower Nine, a gold point going over the lip and down, a second light answering it,
//  and eight lines of narration. The Watch's rule (keep talking) runs on underneath: nothing here pauses it.
//  ON THIS MAP the wall is an arc: from the stretch between Five and Six, Tower Nine's buttress lies north along the wall,
//  not east, with Towers Six and Seven and the wall's own parapet in the line, and the gold point goes down behind the rock
//  of the lip, which nobody on the wall can see past. The lights are drawn where they truly are and only where they could
//  be seen (place()). From the stretch itself the book wins (Book Three Part One, 859 to 913): the night is drawn as far
//  lights, placed by eye (farFrame(), farAt()). The night over the Rift is starless by the book; the sky is not this
//  module's. Nothing visual uses random numbers.
// ============================================================
'use strict';

const STORES113 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('stores113: ' + k, e); } };
  const THINGS = ['onions', 'eyes', 'plates', 'oil', 'tally', 'bread', 'hook', 'cot', 'shot'];
  const TX = {
    door: S('The old garrison\'s store'),   // not the Watch's stores (Phase 100: "Stores are the other side of the Watch"): the old garrison's, his since 406
    work: S('Work'),
    name: { onions: S('Onions'), eyes: S('Cable-eyes'), plates: S('Lead plates'), oil: S('Lamp-oil'), tally: S('The tally-board'), bread: S('The bread-racks'), hook: S('The hook'), cot: S('The cot'), shot: S('Old shot') },
    look: {
      onions: S('Onions, in nets, to the roof. The Watch eats them and then talks about them.'),
      eyes: S('Crates of iron cable-eyes, greased. No crate has a number on it. Each has a string nailed to the lid, and the string has knots in it.'),
      plates: S('Lead plates for the coats, stacked like slates.'),
      oil: S('Lamp-oil in tins, each tin with its string.'),
      tally: S('A board of nails by the door, a string on every nail, every string knotted. It is the whole ledger of the stores. He could tell you what each knot is. Nobody else on the Watch could, which is why he is still here.'),
      bread: S('Bread-racks, floor to roof. More goes out of this room than comes back as crumbs. Nobody has asked where.'),
      hook: S('A hook by the door, at the height of a big man\'s shoulder. The wood under it is worn pale in the shape of something round.'),
      cot: S('A cot behind the shot-racks, with a dent in it the size of a lead coat. He has slept in this room since before the crack.'),
      shot: S('Lead shot for the old guns, in pyramids. Nobody has fired the old guns in six years. Nobody has moved the shot either.'),
    },
    // the errands
    glass: S('"You ring, traveller. Left side, under the sleeve. I have carried crates that rang like that, and heard them from the next table. There is work, if you want it. I will not tell you what it is for, and that is not rudeness."'),
    ask1: S('"You have two hands and no number. That is rare here. There is a crate come on the cart at the west gate, chalked Q. Bring it down to Nine. I would go myself, but the wall is four miles and I have walked it."'),
    trolley: S('"The trolley is chocked at this end. Knock the chock out and it will save your legs."'),
    cart: S('The cart'),
    cartLook: S('A carter\'s wagon, unhitched, with the Watch\'s crates on it. The carter has gone for his dinner.'),
    cartTake: S('The crate chalked Q is not heavy. Something in it shifts like cloth. You do not open it.'),
    brought1: S('"Set it there. Mind the onions. That is the right crate. You would be surprised how often it is not."'),
    ask2: S('"Now a pint of lamp-oil from One-Oh-Six at the hatch. Tell her it is for my lantern. She will count it out by the gill and talk the whole time. Let her."'),
    oil106: S('"For the old man\'s lantern? He burns a pint a week in one lantern and I have never asked. Nobody has asked. Here."'),
    brought2: S('"That is a week of light. Now a blanket. Not from stores: stores is counted this month. Ask in the Halls. Somebody will have one to spare, and they will not ask you why. That is the Watch."'),
    blanket: S('"For the Quartermaster? Take mine. I sleep in the coat anyway."'),
    brought3: S('He folds it small, and then smaller. "That will do. That will do very well."'),
    end: S('"That is all I have for you. Go and talk to somebody about onions."'),
    done: S('"That is the work done. The third hour, if you are awake. Between Five and Six."'),
    ask4: S('"The cart brought a letter, and Two-Eleven is on the wall till the dead hour. I never had the reading. Would you? Out loud. Everything is out loud here."'),
    letter: S('Hal. The wool came dear and I have got the grey after all, it will not show the dirt. You do not say how big. Two-Eleven writes a fair hand but he does not say how big, so I am making it for a small one and it can be grown into. Whose it is you do not say either, and I have stopped asking. The oven is drawing badly since the wet. I have a new girl for the mornings who cannot be taught to leave a loaf alone. Keep your feet dry. Your sister.'),
    after1: S('He is quiet for a moment, which for a man of the Watch is a long time. "She always did make them to be grown into."'),
    after2: S('"If you are not asleep at the third hour, the wall is a fair place to stand. Between Five and Six. Look east, and do not look long. I will not say more, and you will not ask me after."'),
    // the night on the wall (narration, one at a time as it happens)
    night: [
      S('Far along the wall, at the foot of Tower Nine, a lantern comes out of the wall, by a door you were not let through.'),
      S('It goes out across the grey ground at a steady walk. One lantern. One man, with something on his back.'),
      S('Out on the end of the buttress a wheel turns. You cannot hear it. The wind here carries nothing three feet.'),
      S('A gold point goes over the lip and down. Past where the rock goes black. Still down. It gets small, and does not go out.'),
      S('A long way down it stops. Then it moves sideways, slowly, as if something had taken hold of it.'),
      S('And near it, very small and yellow, a second light. Answering.'),
      S('Beside you a trooper is on the price of onions. She does not stop, and she does not look east. Nobody on this wall looks east at the third hour. You notice that now.'),
      S('You do not know what you saw. You know that nobody is going to tell you.'),
    ],
    afterNight: S('"You were on the wall." He does not ask it. "Then say nothing, here or anywhere. Things get said. They get said, and then they have been said." He hitches his coat. "Keep talking, traveller."'),
    afterNightGlass: S('"Keep talking, traveller."'),
  };

  // ---------------------------------------------------------------- the places
  const MAP = 'p113_stores', WALLMAP = 'p100_wall', HALLS = 'p100_halls';
  const W = 18, H = 9;                         // inside: sixteen cells by seven, racks both sides, an aisle three wide
  const DOOR_AT = [301, 21];                      // in the obsidian at Tower Nine's foot, east side, beside the Quartermaster (RIFT100.P.qm)
  const OUTSIDE = [300.3, 21.5];               // where you stand on the wall map coming out
  const SPAWN = [1.6, 4.5];                    // inside, by the door, facing down the aisle
  const CART = [17.5, 105.6];                  // at the west gate (RIFT100.P.gate)
  const TROOPERS = ['p100_tr_a', 'p100_tr_b', 'p100_tr_c', 'p100_tr_d', 'p100_51', 'p100_207'];   // troopers of the Watch who already stand in the Halls or the squad's barrack
  // the hour. Full dark: the engine's sky (engine.js buildSky) has no day left in it once cos(2π(tod − 0.5)) ≤ −0.3, which
  // is from tod 0.7985, about the twentieth hour less fifty minutes by the clock. Hours of the night count from full dark and
  // are given bare (Vol VII §5): the first hour of the night is the hour after it, so the third runs from two hours after
  // full dark to three, about 21:10 to 22:10 by the clock.
  const THIRD_HOUR = { from: 0.7985 + 2 / 24, to: 0.7985 + 3 / 24 };
  // the night's timeline, in seconds: when each line is said, and when it is all over (the lights are gone)
  const LINES_AT = [0, 7, 14, 21, 29, 37, 45, 53], NIGHT_S = 62;

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn, glowTest, meta) => {
      if (Engine.sprites[name]) return; const x = canvas(w, h, fn);
      Engine.addSprite(name, Object.assign({ w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }, meta || {}));
      if (glowTest && Engine.setEmissive) { const d = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    // a knotted string: pale hemp hanging from a nail, with knots along it (how many, and where, by a fixed hash)
    const knots = (x, i, j, len, seed, nail) => {
      if (nail !== false) { px(x, '#16181c', i - 1, j - 1, 4, 3); px(x, '#9a9ea6', i - 1, j - 1, 1, 1); }
      const sway = (k) => Math.round(Math.sin(k * 0.21 + seed) * 0.7);
      for (let k = 0; k < len; k++) { px(x, '#f0e4c0', i + sway(k), j + 1 + k, 2, 1); px(x, '#9c8862', i + sway(k) + 2, j + 1 + k, 1, 1); }
      const n = 2 + ((h2(seed, 3.3) * 3) | 0);
      for (let q = 0; q < n; q++) { const k = Math.min(len - 2, 2 + (((q + h2(seed, q) * 0.6) / n) * (len - 3) | 0)); px(x, '#24160a', i + sway(k) - 1, j + k, 4, 3); px(x, '#5c4228', i + sway(k), j + k, 2, 1); }
    };
    const obs = (x, i0, j0, w, h, s) => { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const v = 13 + h2((i0 + i) >> 2, (j0 + j) >> 2 + s) * 9 + h2(i0 + i, j0 + j + s) * 3 + (1 - j / h) * 5; px(x, `rgb(${v | 0},${(v + 1) | 0},${(v + 6) | 0})`, i0 + i, j0 + j); } px(x, 'rgba(150,160,190,0.22)', i0, j0, w, 1); };
    if (Engine.addTexture) {
      // the vault's walls: low obsidian blocks with lead between, and on every block a nail with its knotted string
      tex('t_p113_wall', (x) => {
        px(x, '#6e7278', 0, 0, 64, 64);
        for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 16, bx = (k * 32 + o) % 64, by = r * 21 + 1; obs(x, bx + 1, by, 30, 19, r * 2 + k); if (bx + 31 > 64) obs(x, 0, by, bx + 31 - 64, 19, r * 2 + k); }
        for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const i = 6 + k * 21 + (r % 2) * 9, j = 3 + r * 21; if (i < 62) knots(x, i, j, 9 + ((h2(r, k) * 7) | 0), r * 3 + k); }
      });
      tex('t_p113_ceil', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 11 + h2(i >> 3, j >> 3) * 7; px(x, `rgb(${v | 0},${v | 0},${(v + 4) | 0})`, i, j); } for (let k = 0; k < 64; k += 21) px(x, '#4a4c54', 0, k, 64, 2); for (let k = 0; k < 4; k++) px(x, '#c4b08a', 8 + k * 15, 24 + ((h2(k, 9) * 30) | 0), 1, 1); });
      tex('t_p113_floor', (x) => {
        px(x, '#2a2a2e', 0, 0, 64, 64);
        for (const [fx, fy, fw, fh] of [[1, 1, 30, 22], [33, 1, 30, 22], [1, 25, 20, 38], [23, 25, 40, 18], [23, 45, 40, 18]]) { const b = 52 + (h2(fx, fy) * 12 | 0); px(x, `rgb(${b},${b + 1},${b + 4})`, fx, fy, fw, fh); px(x, `rgb(${b + 8},${b + 9},${b + 12})`, fx, fy, fw, 1); }
        for (let i = 0; i < 10; i++) px(x, 'rgba(200,170,120,0.35)', (h2(i, 17) * 60) | 0, (h2(i, 19) * 60) | 0, 2, 1);   // onion-skin
      });
      // the racks, floor to roof: three shelves of dark wood, what is kept on each, and from every board's edge a pale
      // string with dark knots hanging down (the stores' ledger is on everything)
      // a rack's cord: thicker and paler than a sprite's string, with big dark knots, so that it reads from across the aisle
      const cord = (x, i, j, len, seed) => {
        px(x, '#0c0a08', i - 1, j, 5, 2);
        for (let k = 0; k < len; k++) px(x, '#fff4d8', i, j + 1 + k, 3, 1);
        for (let q = 0; q < 3; q++) { const k = 4 + (((q + h2(seed, q) * 0.4) / 3) * (len - 6) | 0); px(x, '#1a0e06', i - 1, j + k, 5, 2); }
      };
      const rack = (name, goods) => tex(name, (x) => {
        px(x, '#120f0c', 0, 0, 64, 64);
        for (let r = 0; r < 3; r++) { const j = r * 21; goods(x, j, r); px(x, '#5a4630', 0, j + 18, 64, 3); px(x, '#7a6244', 0, j + 18, 64, 1); }
        for (let r = 0; r < 3; r++) for (let k = 0; k < 2; k++) { const j = r * 21 - 2; cord(x, 14 + k * 30 + ((h2(r, k + 2) * 6) | 0), j, 16 + ((h2(r * 3, k) * 3) | 0), r * 5 + k + name.length); }   // drawn last, over the goods
        px(x, '#3a2c1e', 0, 0, 3, 64); px(x, '#3a2c1e', 61, 0, 3, 64);
      });
      const ell = (x, c, cx, cy, rx, ry) => { x.fillStyle = c; x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, PI * 2); x.fill(); };
      rack('t_p113_r_onions', (x, j, r) => { for (let k = 0; k < 9; k++) { const cx = 6 + k * 6.5, cy = j + 13 - ((k + r) % 2) * 3; ell(x, h2(k, r) > 0.5 ? '#b8803a' : '#9c6428', cx, cy, 3.6, 4); px(x, '#e8c080', cx - 1, cy - 3, 1, 2); } for (let k = 0; k < 64; k += 5) px(x, 'rgba(120,100,70,0.6)', k, j + 4, 1, 14); });
      rack('t_p113_r_crates', (x, j, r) => { for (let k = 0; k < 2; k++) { const i = 4 + k * 29; px(x, '#4e3c28', i, j + 2, 26, 16); px(x, '#64503a', i, j + 2, 26, 2); for (let q = 6; q < 16; q += 5) px(x, '#3a2c1e', i, j + q, 26, 1); x.strokeStyle = '#2a2c30'; x.lineWidth = 2; x.beginPath(); x.arc(i + 13, j + 10, 3.5, 0, PI * 2); x.stroke(); px(x, '#b0b4bc', i + 11, j + 6, 3, 1); } });
      rack('t_p113_r_plates', (x, j, r) => { for (let q = 0; q < 5; q++) { const o = (q % 2) * 2; px(x, '#7c8088', 5 + o, j + 15 - q * 3, 24, 3); px(x, '#a8acb6', 5 + o, j + 15 - q * 3, 24, 1); px(x, '#7c8088', 35 - o, j + 15 - q * 3, 24, 3); px(x, '#a8acb6', 35 - o, j + 15 - q * 3, 24, 1); } });
      rack('t_p113_r_tins', (x, j, r) => { for (let k = 0; k < 5; k++) { const i = 4 + k * 12; px(x, '#5a5e62', i, j + 4, 9, 14); px(x, '#8e9298', i, j + 4, 9, 2); px(x, '#3a3e42', i + 7, j + 6, 2, 12); px(x, '#a88a40', i + 2, j + 9, 4, 4); } });
      rack('t_p113_r_bread', (x, j, r) => { for (let k = 0; k < 5; k++) { const cx = 8 + k * 12; ell(x, '#94663a', cx, j + 13, 5.5, 4); px(x, '#c48e50', cx - 4, j + 10, 8, 1); px(x, '#6e4a28', cx - 2, j + 12, 1, 2); px(x, '#6e4a28', cx + 2, j + 12, 1, 2); } });
      rack('t_p113_r_shot', (x, j, r) => { for (const [ci, n] of [[16, 3], [46, 3]]) for (let q = 0; q < n; q++) for (let k = 0; k <= q; k++) { const cx = ci - q * 3 + k * 6, cy = j + 16 - (n - 1 - q) * 5; ell(x, '#5c6066', cx, cy, 2.8, 2.8); px(x, '#a4a8b0', cx - 1, cy - 2, 1, 1); } });
      // the door in the obsidian: a low door of black oak, iron-strapped, with a knotted string nailed beside the latch
      tex('t_p113_door', (x) => {
        obs(x, 0, 0, 64, 64, 4); px(x, '#6e7278', 0, 30, 64, 1);
        px(x, '#3c4048', 15, 12, 34, 52); px(x, '#1e1a16', 18, 15, 28, 49);
        for (let i = 0; i < 4; i++) px(x, '#2c2620', 18 + i * 7, 15, 1, 49);
        for (const j of [22, 50]) { px(x, '#4e525a', 18, j, 28, 3); px(x, '#8a8e96', 20, j + 1, 1, 1); px(x, '#8a8e96', 43, j + 1, 1, 1); }
        px(x, '#6a6e76', 40, 36, 3, 5);
        knots(x, 52, 30, 16, 11); knots(x, 9, 26, 12, 13);
      });
    }
    // ---- sprites (each with its strings)
    add('p113_onions', 48, 128, 1.02, (x) => {
      px(x, '#3a2e22', 2, 0, 44, 3);
      for (let c = 0; c < 3; c++) { const cx = 8 + c * 16, top = 3, len = 108 - c * 6;
        px(x, '#c4b08a', cx, top, 1, 6);
        for (let k = 0; k < len; k += 7) for (let q = -1; q <= 1; q++) { const ox = cx + q * 4 + ((k / 7) & 1) * 2 - 1, oy = top + 6 + k; x.fillStyle = h2(ox, oy) > 0.5 ? '#b8803a' : '#a86e2e'; x.beginPath(); x.ellipse(ox, oy + 3, 3.2, 3.6, 0, 0, PI * 2); x.fill(); px(x, '#e8c080', ox - 1, oy + 1, 1, 2); }
        for (let k = 0; k < len; k += 4) { px(x, 'rgba(120,100,70,0.7)', cx - 6, top + 6 + k, 13, 1); }
        knots(x, cx + 5, top + len + 4, 10, c * 5, false);
      }
    });
    add('p113_crates', 72, 64, 0.7, (x) => {
      const crate = (i, j, w, h, s) => { px(x, '#4a3a28', i, j, w, h); px(x, '#5e4a34', i + 1, j + 1, w - 2, 3); for (let k = 3; k < h; k += 6) px(x, '#3a2c1e', i, j + k, w, 1); px(x, '#2a201a', i, j, 1, h); px(x, '#2a201a', i + w - 1, j, 1, h);
        for (let k = 0; k < 3; k++) { const ex = i + 5 + k * ((w - 10) / 2 | 0); x.strokeStyle = '#3a3c42'; x.lineWidth = 2; x.beginPath(); x.arc(ex, j + h * 0.55, 3, 0, PI * 2); x.stroke(); px(x, '#a8acb4', ex - 2, j + h * 0.55 - 3, 2, 1); }   // greased eyes, through the slats
        px(x, '#8a8e96', i + w / 2 - 1, j + 1, 2, 2); knots(x, i + w / 2, j + 2, 14, s, false); };
      crate(2, 30, 34, 32, 1); crate(36, 30, 34, 32, 2); crate(12, 4, 40, 26, 3);
    });
    add('p113_plates', 56, 44, 0.46, (x) => {
      for (let r = 0; r < 9; r++) { const o = (r % 3) - 1; px(x, '#7c8088', 6 + o, 40 - r * 4, 44, 4); px(x, '#a4a8b2', 6 + o, 40 - r * 4, 44, 1); px(x, '#4a4e56', 6 + o, 43 - r * 4, 44, 1); }
      px(x, '#c4b08a', 27, 3, 1, 40); knots(x, 27, 2, 18, 4);
    });
    add('p113_tins', 60, 44, 0.46, (x) => {
      for (let r = 0; r < 2; r++) for (let k = 0; k < 4; k++) { const i = 4 + k * 13 + r * 6, j = 22 - r * 18; px(x, '#5a5e62', i, j, 11, 18); px(x, '#8a8e94', i, j, 11, 2); px(x, '#3a3e42', i + 9, j + 2, 2, 16); px(x, '#a88a40', i + 3, j + 6, 5, 5); knots(x, i + 5, j - 1, 10 + ((h2(r, k) * 6) | 0), r * 4 + k, false); }
    });
    add('p113_tally', 64, 64, 0.8, (x) => {
      px(x, '#3a3026', 0, 0, 64, 64); px(x, '#4e4034', 2, 2, 60, 60); for (let k = 0; k < 64; k += 9) px(x, '#433628', 2, k, 60, 1);
      for (let r = 0; r < 3; r++) for (let k = 0; k < 7; k++) { const i = 6 + k * 8 + (r % 2) * 2, j = 5 + r * 20; knots(x, i, j, 14 + ((h2(r * 7 + k, 2) * 4) | 0), r * 7 + k); }
    }, undefined, { dy: -0.18 });
    add('p113_racks', 64, 132, 1.04, (x) => {
      px(x, '#3a3026', 3, 0, 4, 132); px(x, '#3a3026', 57, 0, 4, 132);
      for (let r = 0; r < 7; r++) { const j = 10 + r * 18; px(x, '#5a4a38', 3, j + 10, 58, 3);
        for (let k = 0; k < 4 - (r % 3 === 2 ? 2 : 0); k++) { const i = 9 + k * 12; x.fillStyle = '#9a6c38'; x.beginPath(); x.ellipse(i + 5, j + 6, 6, 4, 0, 0, PI * 2); x.fill(); px(x, '#c48e50', i + 1, j + 3, 8, 1); }
        knots(x, 55, j + 12, 8, r); }
    });
    add('p113_hook', 28, 48, 0.5, (x) => {
      x.fillStyle = '#7a6a52'; x.beginPath(); x.ellipse(14, 28, 11, 12, 0, 0, PI * 2); x.fill();   // the wood worn pale, round
      x.fillStyle = '#96846a'; x.beginPath(); x.ellipse(14, 29, 8, 9, 0, 0, PI * 2); x.fill();
      px(x, '#2a2c30', 12, 6, 5, 5); x.strokeStyle = '#3a3c42'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(14, 10); x.lineTo(14, 18); x.quadraticCurveTo(14, 24, 19, 22); x.stroke();
      knots(x, 22, 6, 12, 21);
    }, undefined, { dy: -0.62 });
    add('p113_cot', 100, 44, 0.42, (x) => {
      px(x, '#2a2420', 4, 26, 4, 18); px(x, '#2a2420', 92, 26, 4, 18); px(x, '#3a322a', 4, 30, 92, 4);
      px(x, '#6a5e50', 8, 20, 84, 10); px(x, '#7a6e60', 8, 20, 84, 2);
      x.fillStyle = '#4e443a'; x.beginPath(); x.ellipse(52, 23, 30, 4, 0, 0, PI * 2); x.fill();   // the dent
      px(x, '#8a8c92', 10, 16, 16, 6); knots(x, 90, 14, 14, 31);
    });
    const shot = (x, i, j, n) => { for (let r = 0; r < n; r++) for (let k = 0; k <= r; k++) { const cx = i - r * 3 + k * 6, cy = j - (n - 1 - r) * 5; x.fillStyle = '#5c6066'; x.beginPath(); x.arc(cx, cy, 2.8, 0, PI * 2); x.fill(); px(x, '#9ca0a8', cx - 1, cy - 2, 1, 1); } };
    add('p113_shot', 64, 40, 0.4, (x) => { shot(x, 16, 36, 5); shot(x, 46, 36, 4); px(x, '#2a2420', 30, 8, 2, 30); knots(x, 31, 8, 20, 41, false); });
    add('p113_shotrack', 64, 104, 1.0, (x) => { px(x, '#3a3026', 3, 0, 4, 104); px(x, '#3a3026', 57, 0, 4, 104); for (let r = 0; r < 4; r++) { const j = 24 + r * 24; px(x, '#5a4a38', 3, j, 58, 3); shot(x, 20, j - 2, 3); shot(x, 44, j - 2, 3); knots(x, 58, j + 3, 9, 50 + r, false); } });
    add('p113_strings', 32, 100, 1.0, (x) => { px(x, '#3a3026', 0, 0, 32, 3); for (let k = 0; k < 4; k++) knots(x, 4 + k * 8, 3, 26 + ((h2(k, 61) * 30) | 0), 60 + k); });
    add('p113_lamp', 24, 72, 0.7, (x) => {
      px(x, '#1e2024', 11, 0, 2, 34);
      px(x, '#1e2024', 5, 34, 14, 3); px(x, '#1e2024', 6, 37, 2, 18); px(x, '#1e2024', 16, 37, 2, 18); px(x, '#1e2024', 5, 55, 14, 3);
      px(x, '#b8843e', 8, 37, 8, 18); px(x, '#e8b868', 10, 42, 4, 9);
      knots(x, 20, 36, 14, 71, false);
    }, (r, g, b, a) => a > 200 && r > 200 && g > 150);
    const cart = (taken) => (x) => {
      px(x, '#2a221a', 6, 40, 110, 8); px(x, '#3a2e22', 6, 40, 110, 2);   // the bed
      for (const wx of [24, 96]) { x.strokeStyle = '#2a221a'; x.lineWidth = 3; x.beginPath(); x.arc(wx, 60, 14, 0, PI * 2); x.stroke(); for (let k = 0; k < 6; k++) { x.lineWidth = 1.4; x.beginPath(); x.moveTo(wx, 60); x.lineTo(wx + Math.cos(k * PI / 3) * 13, 60 + Math.sin(k * PI / 3) * 13); x.stroke(); } px(x, '#5a5e66', wx - 2, 58, 4, 4); }
      x.strokeStyle = '#3a2e22'; x.lineWidth = 3; x.beginPath(); x.moveTo(116, 46); x.lineTo(127, 76); x.stroke();   // the shafts, down
      const crate = (i, j, w, h, q) => { px(x, '#5a4630', i, j, w, h); px(x, '#6e5840', i, j, w, 2); for (let k = 4; k < h; k += 6) px(x, '#4a3a28', i, j + k, w, 1); px(x, '#3a2c1e', i, j, 1, h); px(x, '#3a2c1e', i + w - 1, j, 1, h);
        if (q) { x.strokeStyle = '#e8e4d8'; x.lineWidth = 1.8; x.beginPath(); x.arc(i + w / 2, j + h / 2, 5, 0, PI * 2); x.stroke(); x.beginPath(); x.moveTo(i + w / 2 + 2, j + h / 2 + 2); x.lineTo(i + w / 2 + 6, j + h / 2 + 6); x.stroke(); }   // chalked Q
        else knots(x, i + w / 2, j + 1, 10, i + j, false); };
      crate(10, 16, 26, 24, false); crate(38, 20, 22, 20, false); crate(64, 12, 24, 28, false); crate(20, 0, 22, 16, false);
      if (!taken) crate(88, 22, 20, 18, true);
    };
    add('p113_cart', 128, 80, 1.15, cart(false)); add('p113_cart_taken', 128, 80, 1.15, cart(true));
    // the night's lights: small discs, no halo (the renderers draw a pixel or they do not)
    const disc = (core, mid, rim) => (x) => { x.fillStyle = rim; x.beginPath(); x.arc(8, 8, 7.5, 0, PI * 2); x.fill(); x.fillStyle = mid; x.beginPath(); x.arc(8, 8, 5, 0, PI * 2); x.fill(); x.fillStyle = core; x.beginPath(); x.arc(8, 8, 2.6, 0, PI * 2); x.fill(); };
    const bright = (r, g, b, a) => a > 200 && r > 180;
    add('p113_lightL', 16, 16, 1.0, disc('#fff4d8', '#f2c070', '#c88838'), bright);
    add('p113_lightG', 16, 16, 1.0, disc('#fff8e0', '#f6d27a', '#d8a640'), bright);
    add('p113_lightA', 16, 16, 1.0, disc('#ffffc0', '#f4ec60', '#d4c830'), bright);
  }

  // ---------------------------------------------------------------- building
  function look(m, sprite, x, y, key, opts, also) {
    return m.deco(sprite, x, y, Object.assign({ radius: 0.35, scale: 1, solid: true, use: 'p113_look', label: TX.name[key] }, also ? { _p113also: key } : { _p113look: key }, opts || {}));
  }
  function build() {
    const m = new GameMap(MAP, TX.door, W, H, { floor: 't_p113_floor', ceil: 't_p113_ceil', floorTextures: ['t_p113_floor'], fogDist: 14, fogColor: [16, 13, 10], ambient: 0.55, music: 'inside', danger: 0,
      spawn: { x: SPAWN[0], y: SPAWN[1], dir: 0 } });
    m.rect(0, 0, W - 1, H - 1, 't_p113_wall');
    m.clear(1, 3, W - 4, 5);   // the aisle, three wide, from the door to the end racks
    // racks floor to roof down both sides (two deep) and across the end; the shot-racks stand across the aisle near the
    // end, with a gap, and the cot is in the nook behind them
    const north = ['t_p113_wall', 'r_onions', 'r_onions', 'r_plates', 'r_plates', 'r_tins', 'r_tins', 'r_bread', 'r_bread', 'r_bread', 'r_crates', 'r_crates', 'r_bread', 'r_bread', 'r_onions', 'r_onions'];
    const south = ['t_p113_wall', 'r_crates', 'r_crates', 'r_bread', 'r_bread', 'r_bread', 'r_onions', 'r_onions', 'r_tins', 'r_tins', 'r_plates', 'r_plates', 'r_shot', 'r_shot', 'r_crates', 'r_crates'];
    const tx = (t) => (t[0] === 'r' ? 't_p113_' + t : t);
    for (let i = 0; i < 16; i++) { for (const y of [1, 2]) m.set(i + 1, y, WALL(tx(north[i]))); for (const y of [6, 7]) m.set(i + 1, y, WALL(tx(south[i]))); }
    for (const y of [3, 4, 5]) { m.set(W - 3, y, WALL('t_p113_r_crates')); m.set(W - 2, y, WALL('t_p113_r_crates')); }
    m.set(12, 3, WALL('t_p113_r_shot')); m.set(12, 4, WALL('t_p113_r_shot'));
    m.set(0, 4, DOOR({ tex: 't_p113_door', portal: { map: WALLMAP, x: OUTSIDE[0], y: OUTSIDE[1], dir: PI }, label: TX.door }));
    // by the door: the tally-board and the hook
    look(m, 'p113_tally', 1.5, 3.06, 'tally', { solid: false, radius: 0.1 });
    look(m, 'p113_hook', 1.4, 5.94, 'hook', { solid: false, radius: 0.1 });
    // the things in front of their racks
    look(m, 'p113_onions', 2.6, 3.22, 'onions', { solid: false, radius: 0.2, scale: 0.9 });
    look(m, 'p113_plates', 4.5, 3.3, 'plates', { radius: 0.3 });
    look(m, 'p113_tins', 6.4, 3.3, 'oil', { radius: 0.3 });
    look(m, 'p113_racks', 8.5, 3.22, 'bread', { solid: false, radius: 0.2, scale: 0.9 });
    look(m, 'p113_crates', 2.6, 5.62, 'eyes', { radius: 0.3, scale: 0.8 });
    look(m, 'p113_shot', 11.4, 5.55, 'shot', { radius: 0.3 });
    look(m, 'p113_shotrack', 12.0, 5.2, 'shot', { solid: false, radius: 0.1, scale: 0.9 }, true);
    look(m, 'p113_cot', 13.9, 3.75, 'cot', { radius: 0.4, scale: 0.85 });
    // strings hanging from the vault, near the racks
    for (const [x, y] of [[3.6, 3.12], [5.4, 5.88], [7.5, 3.12], [9.4, 5.88], [10.6, 3.12], [14.4, 5.5]]) m.deco('p113_strings', x, y, { radius: 0.05, scale: 1, solid: false, nopick: true, _decor: true, _p113: 'strings' });
    // two lamps, low and warm, hung close over the racks
    for (const [x, y] of [[4.0, 3.5], [9.8, 5.5]]) m.deco('p113_lamp', x, y, { radius: 0.05, scale: 1, solid: false, glow: 0.55, lightCol: [120, 86, 46], nopick: true, _decor: true, _p113: 'lamp' });
    m.baseCount = m.entities.length;
    return m;
  }
  // onto Phase 100's wall: the door at Tower Nine's foot, and the cart at the west gate
  function onWall(w) {
    if (!w || w._p113) return; w._p113 = true;
    w.set(DOOR_AT[0], DOOR_AT[1], DOOR({ tex: 't_p113_door', portal: { map: MAP, x: SPAWN[0], y: SPAWN[1], dir: 0 }, label: TX.door })); w.setLvl(DOOR_AT[0], DOOR_AT[1], 0);
    const base = w.baseCount != null ? w.baseCount : w.entities.length;
    const cart = { kind: 'deco', sprite: 'p113_cart', x: CART[0], y: CART[1], radius: 0.9, scale: 1, solid: true, use: 'p113_cart', label: TX.cart, _p113: 'cart', facing: 0 };
    w.entities.splice(base, 0, cart); w.baseCount = base + 1;
  }
  function join(maps) {
    if (!maps || maps[MAP] || !maps[WALLMAP] || typeof GameMap === 'undefined') return false;
    art();
    maps[MAP] = build();
    onWall(maps[WALLMAP]);
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const bit = (b) => (fint('p113_bits', 255) & b) !== 0, setBit = (b) => { f().p113_bits = fint('p113_bits', 255) | b; };
  const here = (id) => typeof G !== 'undefined' && G.map && G.mapId === id && G.map.id === id;
  const glassed = () => !!(G.player && G.player.glassed);
  // ---- the night's stretch and hour
  const inHour = (tod) => { const t = Number(tod); return Number.isFinite(t) && t >= THIRD_HOUR.from && t < THIRD_HOUR.to; };
  function onStretch(x, y) {
    if (typeof RIFT100 === 'undefined') return false;
    const w = (typeof G !== 'undefined' && G.maps && G.maps[WALLMAP]) || null, kind = w && w._p100 ? w._p100.kind : null;
    if (!kind) return false;
    const i = x | 0, j = y | 0; if (i < 0 || j < 0 || i >= RIFT100.W || j >= RIFT100.H) return false;
    const d = RIFT100.degOf(x, y), t5 = RIFT100.TOWERS[0].deg, t6 = RIFT100.TOWERS[1].deg;
    return kind[j * RIFT100.W + i] === 4 && d > t5 && d < t6;
  }
  // ---- the lights: where they truly are at time t (cells, and height in the game's units), and how big
  function lightsAt(t) {
    if (typeof RIFT100 === 'undefined') return {};
    const R = RIFT100, P = R.pol, RC = R.RC;
    const ease = (a, b, u) => a + (b - a) * Math.max(0, Math.min(1, u)), u = (a, b) => (t - a) / (b - a);
    const out = {}, fade = t > NIGHT_S - 4 ? Math.max(0, (NIGHT_S - t) / 4) : 1;
    if (t < 0 || t >= NIGHT_S) return out;
    // 1. the lantern: out of the wall at Nine's foot, across the grey ground to the buttress's end, and it stays there
    { const a = P(RC + 1.6, 34.2), b = P(RC + 19.6, 35.8), k = Math.max(0, Math.min(1, u(3, 14))), s = k * k * (3 - 2 * k);
      out.lantern = { x: ease(a[0], b[0], s), y: ease(a[1], b[1], s), z: 1.05, size: 0.7 * Math.min(1, t / 1.5) * fade }; }
    // 2-3. the gold point: over the lip and down, smaller, never out; stops; moves sideways
    if (t >= 21) {
      const k = Math.min(1, u(21, 29)), dz = k * (2 - k), side = Math.max(0, Math.min(1, u(33, 45)));
      const r0 = RC + 21.3, dg = 36.0 + side * 1.1, at = P(r0 + k * 0.8, dg);
      out.gold = { x: at[0], y: at[1], z: 0.6 - dz * 36.4, size: (0.8 - k * 0.45) * fade };
    }
    // 4. a second light near it, smaller and yellower: answering
    if (t >= 37) { const at = P(RC + 22.6, 37.6); out.answer = { x: at[0], y: at[1], z: -37.6, size: (0.24 + 0.04 * Math.sin(t * 1.7)) * Math.min(1, u(37, 38.5)) * fade }; }
    return out;
  }
  // ---- drawing them where they truly are. A light is shown only when nothing stands between your eye and it (a tower, a
  // parapet, the rock of the lip); then, because the renderers leave out anything past the fog, it is drawn as a small
  // sprite on the same line of sight inside the fog, scaled so that it sits where, and looks the size, the true light would.
  const SPRITE = { lantern: 'p113_lightL', gold: 'p113_lightG', answer: 'p113_lightA' };
  function heightAt(m, x, y) {
    const i = x | 0, j = y | 0; if (i < 0 || j < 0 || i >= m.w || j >= m.h) return -1e9;
    const c = m.cells[j * m.w + i];
    if (c) return c.top != null ? c.top : 1e9;
    if (m.isBlocked(i, j)) return m.groundAt(x, y) + 0.05;
    return m.groundAt(x, y);
  }
  function place(e, L0) {
    const m = G.map, c = Engine.cam, ez = Number.isFinite(c.z) ? c.z : ((G.player && G.player.feet) || 0) + 0.88;
    const dx = L0.x - c.x, dy = L0.y - c.y, D = Math.hypot(dx, dy) || 1e-6;
    let seen = L0.size > 0.01;
    for (let s = 0.3; seen && s < D - 0.6; s += 0.25) { const t = s / D; if (heightAt(m, c.x + dx * t, c.y + dy * t) > ez + (L0.z - ez) * t) seen = false; }
    const k = Math.min(D, (m.fogDist || 40) * 0.92) / D;
    const x = c.x + dx * k, y = c.y + dy * k, z = ez + (L0.z - ez) * k, sc = Math.max(0.001, L0.size * k);
    e.x = x; e.y = y; e.scale = sc; e.yOff = m.groundAt(x, y) - (z - sc / 2); e.hidden = !seen;
  }
  // ---- the far lights, from the stretch between Five and Six. The book has it seen from exactly there ("Far off along
  // the wall, at the foot of Tower Nine, he could see a knot of lanterns", Book Three Part One, 859 to 913); the game's
  // wall is drawn short and curved, so from that stretch Tower Nine's buttress is hidden. Far sights on this wall are
  // therefore placed by eye: at the true compass bearing of the buttress's end, turned outward (toward the Rift) by the
  // least angle that clears the wall and the towers, far off inside the fog, just above the parapet line (the highest
  // line of anything nearer along that bearing). The renderers' own depth test still hides them behind anything nearer.
  const FAR = { MARGIN: 1.5 * PI / 180, STEP: 0.25 * PI / 180, CLEAR: 5.65, SLIDE: 0.7 * PI / 180, WALK: 1.2 * PI / 180, BESIDE: 0.3 * PI / 180 };
  function farFrame() {
    if (typeof RIFT100 === 'undefined' || !G.map) return null;
    const R = RIFT100, m = G.map, c = Engine.cam, ez = Number.isFinite(c.z) ? c.z : ((G.player && G.player.feet) || 0) + 0.88;
    const B = R.pol(R.RC + 19.6, 35.8), a0 = Math.atan2(B[1] - c.y, B[0] - c.x), out = Math.atan2(c.y - R.CY, c.x - R.CX);
    const turn = Math.atan2(Math.sin(out - a0), Math.cos(out - a0)), sgn = turn < 0 ? -1 : 1, d = (m.fogDist || 40) * 0.9;
    for (let k = 0; k * FAR.STEP <= Math.abs(turn) + 1e-9; k++) {
      const a = a0 + sgn * k * FAR.STEP; let ok = true, line = -1e9;
      for (let s = 0.3; s < d; s += 0.25) { const h = heightAt(m, c.x + Math.cos(a) * s, c.y + Math.sin(a) * s); if (h > FAR.CLEAR) { ok = false; break; } line = Math.max(line, (h - ez) / s); }
      if (ok) {   // clear: step on by a small margin (still clear) so that the lights do not sit on a tower's edge
        const a1 = a + sgn * FAR.MARGIN; let ok1 = true, line1 = -1e9;
        for (let s = 0.3; s < d; s += 0.25) { const h = heightAt(m, c.x + Math.cos(a1) * s, c.y + Math.sin(a1) * s); if (h > FAR.CLEAR) { ok1 = false; break; } line1 = Math.max(line1, (h - ez) / s); }
        return ok1 && k * FAR.STEP + FAR.MARGIN <= Math.abs(turn) ? { a: a1, sgn, d, ez, line: Math.min(line1, -0.01), turn: k * FAR.STEP + FAR.MARGIN } : { a, sgn, d, ez, line: Math.min(line, -0.01), turn: k * FAR.STEP };
      }
    }
    return null;
  }
  function farAt(t, F) {
    if (!F) return {};
    const k01 = (a, b) => Math.max(0, Math.min(1, (t - a) / (b - a))), band = -F.line, fade = t > NIGHT_S - 4 ? Math.max(0, (NIGHT_S - t) / 4) : 1, o = {};
    const top = F.line + band * 0.6;
    { const k = k01(3, 14); o.lantern = { a: F.a - F.sgn * FAR.WALK * (1 - k * k * (3 - 2 * k)), el: top, size: 1.5 * Math.min(1, t / 1.5) * fade }; }
    if (t >= 21) { const k = k01(21, 29), dz = k * (2 - k), side = k01(33, 45);
      o.gold = { a: F.a + F.sgn * FAR.SLIDE * side, el: top - (top - (F.line + band * 0.06)) * dz, size: (1.5 - k * 0.85) * fade }; }
    if (t >= 37) o.answer = { a: F.a + F.sgn * (FAR.SLIDE + FAR.BESIDE), el: F.line + band * 0.035, size: (0.5 + 0.07 * Math.sin(t * 1.7)) * Math.min(1, k01(37, 38.5)) * fade };
    return o;
  }
  let farLast = {};
  function placeFar(e, L0, F) {
    const m = G.map, c = Engine.cam, x = c.x + Math.cos(L0.a) * F.d, y = c.y + Math.sin(L0.a) * F.d, z = F.ez + L0.el * F.d, sc = Math.max(0.001, L0.size);
    e.x = x; e.y = y; e.scale = sc; e.yOff = m.groundAt(x, y) - (z - sc / 2); e.hidden = !(L0.size > 0.01);
    L0.hidden = e.hidden;
  }
  // ---- the night itself
  const NT = { on: false, t: 0, said: -1, ents: {} };
  function clearLights() { if (typeof G === 'undefined' || !G.ents) { NT.ents = {}; return; } for (const k in NT.ents) { const e = NT.ents[k], i = G.ents.indexOf(e); if (i >= 0) G.ents.splice(i, 1); else if (G.maps && G.maps[WALLMAP]) { const j = G.maps[WALLMAP].entities.indexOf(e); if (j >= 0) G.maps[WALLMAP].entities.splice(j, 1); } } NT.ents = {}; }
  function stopNight() { clearLights(); NT.on = false; NT.t = 0; NT.said = -1; farLast = {}; }
  function tickNight(dt) {
    if (!NT.on) {
      if (fint('p113_seen', 1) || !inHour(G.tod) || !onStretch(Engine.cam.x, Engine.cam.y)) return;
      NT.on = true; NT.t = 0; NT.said = -1; f().p113_seen = 1;
    } else NT.t += dt;
    while (NT.said + 1 < LINES_AT.length && NT.t >= LINES_AT[NT.said + 1]) { NT.said++; say(TX.night[NT.said], '', 7800); }
    if (NT.t >= NIGHT_S) { stopNight(); return; }
    const L = lightsAt(NT.t), fromStretch = onStretch(Engine.cam.x, Engine.cam.y), F = fromStretch ? farFrame() : null, FL = F ? farAt(NT.t, F) : {};
    const ent = (key, k, tag) => { let e = NT.ents[key]; if (!e) { e = NT.ents[key] = { kind: 'deco', sprite: SPRITE[k], x: Engine.cam.x, y: Engine.cam.y, scale: 0.1, solid: false, radius: 0.01, glow: 1, nopick: true, transient: true, _decor: true, _p113: tag }; G.ents.push(e); } return e; };
    for (const k of ['lantern', 'gold', 'answer']) {
      // the lights where they truly are, seen only where they could be seen (from the stretch they cannot)
      if (!L[k]) { if (NT.ents[k]) NT.ents[k].hidden = true; } else { const e = ent(k, k, 'light'); place(e, L[k]); if (fromStretch) e.hidden = true; }
      // and from the stretch, the far lights
      if (!FL[k]) { if (NT.ents['far_' + k]) NT.ents['far_' + k].hidden = true; } else placeFar(ent('far_' + k, k, 'far'), FL[k], F);
    }
    farLast = FL;
  }
  function tick(dt) {
    if (typeof G === 'undefined' || G.state !== 'play' || !G.player || G.dead) return;
    if (here(WALLMAP)) tickNight(Number(dt) || 0);
    else if (NT.on) stopNight();
  }

  // ---------------------------------------------------------------- Work
  let pendingChoice = false;
  function letterChoice() {
    DLG.choices = [{ t: TX.letter, f: () => { if (fint('p113_qm', 8) === 7 && !glassed()) { f().p113_qm = 8; DLG.log.push({ who: 'them', t: TX.after1 }); DLG.log.push({ who: 'them', t: TX.after2 }); } return null; } }];
    pendingChoice = true;
  }
  function workLines() {
    const out = [], q = fint('p113_qm', 8), c = fint('p113_carry', 3), g = glassed(), set = (n) => { f().p113_qm = n; };
    if (fint('p113_seen', 1) && !bit(2)) { setBit(2); return [g ? TX.afterNightGlass : TX.afterNight]; }
    if (g && !bit(1)) { setBit(1); out.push(TX.glass); }
    const ask1 = () => { out.push(TX.ask1); if (typeof G.flags.p100_rail === 'undefined' || fint('p100_rail', 1) === 0) out.push(TX.trolley); };
    if (q === 0) { set(1); ask1(); }
    else if (q === 1) { if (c === 1) { f().p113_carry = 0; set(3); out.push(TX.brought1, TX.ask2); } else ask1(); }
    else if (q === 2) { set(3); out.push(TX.ask2); }
    else if (q === 3) { if (c === 2) { f().p113_carry = 0; set(5); out.push(TX.brought2); } else out.push(TX.ask2); }
    else if (q === 4) { set(5); out.push(TX.brought2); }
    else if (q === 5) { if (c === 3) { f().p113_carry = 0; set(6); out.push(TX.brought3); } else out.push(TX.brought2); }
    else if ((q === 6 || q === 7) && !g) { set(7); out.push(TX.ask4); letterChoice(); }
    else if (q === 8 && !g) out.push(TX.done);
    else out.push(TX.end);
    return out;
  }
  function askWork(t) {
    DLG.log.push({ who: 'you', t: `Tell me about ${t}.` });
    for (const line of workLines()) DLG.log.push({ who: 'them', t: line });
  }
  // what the others say, when you come to them on an errand
  function afterTalk(e) {
    if (!e || typeof DLG === 'undefined' || G.state !== 'dialogue' || !DLG.npc || DLG.ent !== e || !here(HALLS)) return;
    const q = fint('p113_qm', 8), c = fint('p113_carry', 3);
    let line = null;
    if (e.id === 'p100_issue' && q === 3 && c !== 2) { f().p113_carry = 2; line = TX.oil106; }
    else if (TROOPERS.includes(e.id) && q === 5 && c !== 3) { f().p113_carry = 3; line = TX.blanket; }
    if (line) { DLG.log.push({ who: 'them', t: line }); renderDialogue(DLG.choices ? 'choice' : null); }
  }

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p113_/.test(e.use)) return false;
    if (e.use === 'p113_look') { const k = e._p113look || e._p113also; if (TX.look[k]) say(TX.look[k], '', 7000); return true; }
    if (e.use === 'p113_cart') {
      if (fint('p113_qm', 8) === 1 && fint('p113_carry', 3) === 0) { f().p113_carry = 1; say(TX.cartTake, '', 7000); try { Audio_.sfx.pickup(); } catch (er) { /* no sound */ } }
      else say(TX.cartLook, '', 6000);
      sync(); return true;
    }
    return false;
  }
  function sync() {
    if (typeof G === 'undefined' || !G.map || !here(WALLMAP)) return;
    const taken = fint('p113_qm', 8) >= 2 || fint('p113_carry', 3) === 1;
    for (const e of G.ents) if (e && e._p113 === 'cart') e.sprite = taken ? 'p113_cart_taken' : 'p113_cart';
  }
  function resetNight() { stopNight(); }

  // ---------------------------------------------------------------- wiring
  function wire() {
    art();
    if (typeof NPCS !== 'undefined' && NPCS.p100_qm && NPCS.p100_qm.topics && !(TX.work in NPCS.p100_qm.topics)) NPCS.p100_qm.topics[TX.work] = TX.ask1;   // (the answer is given by askWork; this is what puts the button up)
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { try { stopNight(); } catch (e) { warnOnce('stop', e); } const r = _l.apply(this, arguments); try { sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof askTopic === 'function') { const _at = askTopic; askTopic = function (t) { try { if (t === TX.work && typeof DLG !== 'undefined' && DLG.npc && typeof NPCS !== 'undefined' && DLG.npc === NPCS.p100_qm) { askWork(t); return undefined; } } catch (e) { warnOnce('work', e); } return _at.apply(this, arguments); }; }
    if (typeof talk === 'function') { const _t = talk; talk = function (e) { const r = _t.apply(this, arguments); try { afterTalk(e); } catch (er) { warnOnce('talk', er); } return r; }; }
    if (typeof renderDialogue === 'function') { const _rd = renderDialogue; renderDialogue = function (mode) { if (pendingChoice) { pendingChoice = false; if (typeof DLG !== 'undefined' && DLG.choices) return _rd.call(this, 'choice'); } return _rd.apply(this, arguments); }; }
  }
  wire();

  return { TX, TEXTS, THINGS, MAP, W, H, DOOR: DOOR_AT, OUTSIDE, SPAWN, CART, TROOPERS, THIRD_HOUR, LINES_AT, NIGHT_S, build, join, tick, useOwn, sync, inHour, onStretch, lightsAt, resetNight, workLines,
    lights: () => (NT.on ? lightsAt(NT.t) : {}), farLights: () => (NT.on ? farLast : {}), farFrame, night: () => ({ on: NT.on, t: NT.t, said: NT.said }) };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = STORES113;
if (typeof window !== 'undefined') window.STORES113 = STORES113;
