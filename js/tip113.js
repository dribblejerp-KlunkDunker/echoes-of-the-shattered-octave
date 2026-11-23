// ============================================================
//  tip113 — Phase 113, Design C (ruled by the owner 22 Nov 2026; every proposal approved 22 Nov): the tip, and the
//  Unfinished. The cart gate by Battery Eight, the sally-way under the wall, the stage at the lip, and a Throat-Wraith of
//  three sentences that is finished, not fought. See
//  story/Game Layer/Phase 113 - The Rift Wall, part C (the tip and the Unfinished).md
//
//  THE RULES ABOVE ALL. What is under the lip is never seen, named or hinted (eight words are in none of these strings;
//  the test lists them). Nobody is tipped and no wagon comes while the traveller is there: the place is shown empty,
//  between wagons. No count is given of wagons, of people or of years, beyond "six years" for the ruts. The traveller
//  never goes over, never goes down, never reaches the buttress or the crane.
//
//  CANON (copied from the design). The Office's docket: "SCHEDULE F. Incomplete draw. Residual to be conveyed under
//  escort to Null-Watch and disposed of at the lip." (Book Three, Part Two, 601). People come "in a cart"; "They tipped the
//  cart" (Part One, 1319). No book shows the place; what falls from it lands under Batteries Eight, Nine and Ten (Part One,
//  2066, 2102), so the tip is on the lip by Battery Eight. "Nothing does [rot], here." (Part One, 1319). Within about thirty
//  yards of the lip anyone who goes silent begins to go: "Not pulled; relieved." (Vol VI, 118); the glass goes silent
//  there too (Vol VI, 141; Part One, 1011). The Lead Brothers stand along the lip, hooded, faces sealed in lead, the only
//  men allowed to be silent. The not-colour cannot be looked at. The pamphlet: "It says Registration on the front, in nice
//  letters." (Part One, 1411); grey Office smocks (1247). Throat-Wraiths (Vol II, 482 to 483): formed where a person died
//  mid-sentence, the unfinished half looking for a mouth; resolved by completing the sentence correctly.
//  Approved 22 Nov (the design's proposals): the cart gate, the sally-way, the stage, the three people and their
//  sentences, the leavings, the trooper's line, the sprag, the talking-post's note, Tower Eight's postern as the shortcut.
//
//  THE PLACE. On p100_wall a small cart yard is cut at the inner foot of the wall between Towers Seven and Eight, with the
//  cart gate (its wicket into the sally-way) and Tower Eight's postern (barred on this side). p113_sally: a wagon-road
//  cut under the wall, five cells wide and twenty-nine long, a turning-place half way, its own ceiling, dark always.
//  p113_tip: the far mouth, twenty cells (thirty yards, RIFT100's scale) of bare rock, the stage at the lip; a cable
//  fence pens the ground either side. Its light is the wall's own curve by the hour (RIFT100.wallDay, wallAmbient).
//  THE DANGER. Standing Order Nine, by RIFT100's own rule (RIFT100.addZone): on the whole stage and the far half of the
//  sally-way a traveller who goes quiet is Relieved and walks to the edge. No battery's bell reaches here.
//  THE KEEPER: the Unfinished. Three breaths hang over the stage at the height of a face. Within two cells the next one
//  takes the jaw, and the Murmur says its half-sentence, and it is said every few seconds unbidden, spending voice. Read
//  the leaving that ends it and the next saying finishes it. Spend the voice and it lets go, and the quiet takes you.
//  Flags (small ints, read through fint): p113_know (bits: 1 the letter, 2 the shoe, 4 the card), p113_jaw (0 to 3),
//  p113_done (bits 1, 2, 4), p113_tipk (the keeper settled), p113_tdrop (its leavings given), p113_post8 (Tower Eight's
//  postern opened from within), p113_tbits (bits: 1 the glass line said, 2 the sprag taken).
//  Nothing visual uses random numbers.
// ============================================================
'use strict';

const TIP113 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('tip113: ' + k, e); } };
  const TX = {
    gate: S('The cart gate'),
    cartGateTopic: S('The cart gate'),
    cartGateLine: S('"We have no subject for it." She says it in the middle of cable-eyes, as if it were a cable-eye. "There is something on the stage out there that finishes nobody\'s sentences. It has had three of ours by the jaw, over the years, and brought every one of them back in talking. That is more than the bell does. So nobody has reported it." She goes back to cable-eyes.'),
    sallyName: S('The sally-way'),
    name: {
      ruts: S('The ruts'), brackets: S('The brackets'), clerk: S('The clerk\'s place'), chalk: S('The chalk'), sleeve: S('The sleeve'),
      stage: S('The stage'), edge: S('The edge'), brother: S('A Lead Brother'), shoe: S('The shoe'), card: S('The card'), sprag: S('Carter\'s Sprag'),
    },
    look: {
      ruts: S('Wheel-ruts in obsidian. Obsidian does not rut. It has been cut for the wheels, both sides, the width of an Office wagon.'),
      brackets: S('Brackets for lamps, and no lamps. Whoever drives here does not want to see the walls, or does not come by night.'),
      clerk: S('A flat place cut in the wall at the height of a standing clerk. A dry inkwell. A rule, chained. The stone under it is polished by the toes of boots. Somebody signed for every wagon here.'),
      chalk: S('Chalk, in fives. Somebody kept count on the wall, and somebody else rubbed it out with a sleeve, not well. You do not count what is left.'),
      sleeve: S('A sleeve of grey Office stuff, torn off at the shoulder and caught on a cable-eye at the height of a wagon\'s side. The cloth is as sound as the day it tore. Nothing rots here. There is paper in the cuff.'),
      stage: S('A ramp of sleepers, laid to the very edge, and a baulk of oak across the end of it to stop a wagon\'s wheels. The baulk is worn in two places, a wagon\'s width apart. The bed tips. The wheels do not go over.'),
      edge: S('You do not look over. The not-colour is there, and it cannot be looked at. You look at your boots, and keep talking.'),
      brother: S('A Lead Brother, a hundred yards along the lip, hooded, his face sealed in lead. He does not turn. He is the only man here allowed to say nothing.'),
      shoe: S('One shoe, a woman\'s, the heel worn on the outside. In the toe, folded small, a cobbler\'s ticket: DUNN. One pair, resoled, paid. To be called for. Stott.'),
      card: S('A card, soft with handling, pushed into a crack of the baulk. REGISTRATION, in nice letters. Under it a number, stamped: 41. Somebody held this the whole way here.'),
    },
    note: S('IF YOU HAVE COME IN BY MISTAKE, GO OUT TALKING.'),
    letter: S('Marget. They say it is a registration and no more, and a man is not kept for a registration. I have the pamphlet. I will be home by Hearthday. Do not sell the loom.'),
    post8: S('Tower Eight\'s postern'),
    post8Barred: S('Tower Eight\'s postern. Barred from the other side, and the bar has not been lifted in a long time.'),
    mouthLine: S('The sally-way ends in daylight, grey from above. Thirty yards of bare rock. Then nothing you can look at.'),
    glass: S('Your arm has stopped. Nothing in it. Nothing in the bone. You had forgotten what your own blood sounds like.'),
    // the Unfinished
    takes: S('Something that was waiting for a mouth has found yours. Your jaw is not your own. You hear yourself say, in a voice that is nearly yours:'),
    half: [S('"—and tell Marget I\'ll be home by—"'), S('"Somebody fetch my good shoes from Dunn\'s. They\'re paid for. They\'re under the name of—"'), S('"They said hold your number and wait to be called. I\'ve held it. Mine\'s—"')],
    finished: [S('"—and tell Marget I\'ll be home by Hearthday."'), S('"Somebody fetch my good shoes from Dunn\'s. They\'re paid for. They\'re under the name of Stott."'), S('"They said hold your number and wait to be called. I\'ve held it. Mine\'s forty-one."')],
    after: [S('Your mouth closes. Somewhere a long way off, or nowhere, a man has stopped worrying about a loom.'), S('It lets go. You find you know the name of a cobbler in a town you have never seen.'), S('It lets go. Nobody calls the number.')],
    again: S('You say it again. You cannot not. It stops where it stopped the first time.'),
    voiceOut: S('Your voice gives out. It lets go of you, because you are no more use to it. It is very quiet. It is a relief.'),
    settle: [S('It is quiet on the stage. Then you remember where you are, and start talking.'), S('There are more. You can feel them in the timber, like a hum in a rail. But the three that had hold of you are finished, and the others have learned to wait.')],
    // the leavings
    leavings: S('Three Leavings'),
    leavingsDesc: S('A letter, a cobbler\'s ticket and a card numbered forty-one, tied together with a boot-lace. None of them has faded. Nothing does, here. Nobody will buy them, and you will find you cannot throw them away.'),
    spragDesc: S('A sprag for chocking a wagon\'s wheel on a slope: a billet of ash shod with iron, polished where a hand has carried it. It was left under the last wheel at the top of the stage. It has stopped a great many wheels, and never the one that mattered.'),
    spragNo: S('It will not come. Something on this stage is not finished with it.'),
  };

  // ---------------------------------------------------------------- the places
  const MAP = 'p100_wall', SALLY = 'p113_sally', TIP = 'p113_tip';
  const SW = 32, SH = 13, TW = 26, TH = 200;
  // the sally-way (cells): the corridor x 1 to 29, y 4 to 8; the turning-place x 12 to 18, y 2 to 10; the far half east of x 15
  const S0 = {
    wicket: [0, 6], mouth: [30, 6], post8: [15, 1], spawn: [1.6, 6.5], mouthFront: [28.9, 6.5], post8Front: [15.5, 2.6], half: 15,
    post: [2.6, 4.45], wake: [2.6, 5.9], sleeve: [13.5, 2.4], clerk: [4.5, 8.62], chalk: [20.5, 4.38],
    brackets: [[7.5, 4.36], [22.5, 4.36], [10.5, 8.64], [25.5, 8.64]], ruts: [8.5, 6.5],
  };
  // the stage (cells): the mouth in the wall's foot at x 0; bare rock to the lip at x 21; the pen between the fences
  const T0 = {
    door: [0, 95], spawn: [1.6, 95.5], lip: 21, pen: [85, 105], stage: [14, 94, 19, 96], baulk: 20, rise: 0.45,
    breaths: [[15.2, 95.5], [17.3, 94.8], [19.1, 96.1]], shoe: [12.4, 97.3], card: [19.55, 94.3], sprag: [18.9, 96.85], leavings: [18.2, 94.35],
    edge: [[20.55, 88.5], [20.55, 92.0], [20.55, 99.0], [20.55, 102.5]], stageMark: [15.0, 97.0], brother: [19.4, 161.5],
  };
  const P = {};   // on the wall: worked out from RIFT100's own plan when the yard is cut (gate, gateFront, post8, post8Front, trooper)
  const K = { EVERY: 3.5, LAST: 90, AGAIN_S: 20, REACH: 2, REGEN: 0.08 };   // the saying's period, how long a full voice lasts, the "again" line's gap

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
    if (Engine.addTexture) {
      // the sally-way's floor: obsidian, dull with the dust of the road
      const glass = (x, s) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 22 + h2((i >> 3) + s, j >> 3) * 9 + h2(i, j + s) * 4; px(x, `rgb(${v | 0},${(v + 1) | 0},${(v + 5) | 0})`, i, j); } };
      tex('t_p113t_sfloor', (x) => { glass(x, 0); for (let k = 0; k < 8; k++) px(x, 'rgba(130,136,160,0.16)', (h2(k, 3) * 58) | 0, (h2(k, 5) * 62) | 0, 6, 1); });
      // a rut cut for a wheel: a straight channel down the cell, its floor worn bright by the iron tyres, its lips chipped
      tex('t_p113t_ruts', (x) => {
        glass(x, 2);
        px(x, '#0c0c10', 0, 24, 64, 16); px(x, '#1a1b22', 0, 26, 64, 12);
        for (let i = 0; i < 64; i++) { px(x, `rgba(150,156,180,${(0.30 + h2(i, 9) * 0.25).toFixed(2)})`, i, 31 + ((h2(i >> 2, 4) * 2) | 0), 1, 2); }   // the bright track
        for (let i = 0; i < 64; i += 3) { px(x, 'rgba(160,166,190,0.32)', i, 23, 2, 1); px(x, 'rgba(160,166,190,0.22)', i + 1, 40, 2, 1); if (h2(i, 7) > 0.7) px(x, '#0a0a0c', i, 22, 2, 2); }
      });
      tex('t_p113t_ceil', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 10 + h2(i >> 3, j >> 3) * 6; px(x, `rgb(${v | 0},${v | 0},${(v + 4) | 0})`, i, j); } for (let k = 0; k < 64; k += 21) px(x, '#26282e', 0, k, 64, 1); });
      // the cart gate: two leaves of black oak, iron-bound, and a wicket in the left one
      tex('t_p113t_gate', (x) => {
        px(x, '#141210', 0, 0, 64, 64);
        for (let c = 0; c < 8; c++) { const b = 24 + (h2(c, 4) * 5 | 0); px(x, `rgb(${b},${b - 3},${b - 5})`, c * 8, 0, 8, 64); px(x, '#151311', c * 8, 0, 1, 64); for (let j = 0; j < 64; j += 2) if (h2(c * 8 + (j & 7), j) > 0.86) px(x, 'rgba(60,54,46,0.6)', c * 8 + 2 + ((h2(j, c) * 4) | 0), j, 1, 3); }
        px(x, '#060606', 31, 0, 2, 64);
        for (const j of [6, 30, 56]) { px(x, '#3c3e44', 0, j, 64, 4); px(x, '#5c6068', 0, j, 64, 1); for (let i = 3; i < 64; i += 8) px(x, '#7a7e86', i, j + 1, 2, 2); }
        px(x, '#2a2420', 8, 30, 16, 30); px(x, '#5c6068', 8, 30, 16, 1); px(x, '#5c6068', 8, 30, 1, 30); px(x, '#5c6068', 23, 30, 1, 30); px(x, '#6a6e76', 20, 44, 2, 4);   // the wicket
      });
      // the far mouth from inside: grey daylight, and the rock under it
      tex('t_p113t_mouth', (x) => { for (let j = 0; j < 64; j++) { const v = Math.round(132 + j * 0.6); px(x, `rgb(${v},${v + 1},${v + 6})`, 0, j, 64, 1); } px(x, 'rgba(96,98,104,0.9)', 0, 52, 64, 12); for (let i = 0; i < 64; i += 4) px(x, 'rgba(70,72,78,0.5)', i, 52 + ((h2(i, 2) * 4) | 0), 3, 1); px(x, '#1c1d22', 0, 0, 3, 64); px(x, '#1c1d22', 61, 0, 3, 64); });
      // the mouth seen from the rock: the dark of the cut under the wall, ruts running into it
      tex('t_p113t_mouthout', (x) => { px(x, '#2c2e34', 0, 0, 64, 64); px(x, '#08080a', 6, 8, 52, 56); for (let j = 8; j < 64; j++) px(x, `rgba(40,42,50,${(j / 64 * 0.5).toFixed(2)})`, 6, j, 52, 1); px(x, '#3a3c44', 6, 8, 52, 2); px(x, 'rgba(120,124,136,0.5)', 18, 60, 6, 4); px(x, 'rgba(120,124,136,0.5)', 40, 60, 6, 4); });
      // bare grey rock (walkable here, as the Watch never walks the wall's own rock), with a rut cut for a wheel
      const rock = (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 96 + h2(i >> 3, j >> 3) * 10 + h2(i >> 1, j >> 1) * 6; px(x, `rgb(${v | 0},${v | 0},${(v + 3) | 0})`, i, j); } };
      tex('t_p113t_rock', (x) => { rock(x); for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(60,62,70,0.25)'; x.lineWidth = 1; x.beginPath(); x.moveTo(h2(k, 1) * 64, 0); x.lineTo(h2(k, 2) * 64, 64); x.stroke(); } });
      tex('t_p113t_rockrut', (x) => { rock(x); px(x, 'rgba(40,42,48,0.55)', 0, 25, 64, 14); px(x, 'rgba(30,32,36,0.5)', 0, 28, 64, 8); for (let i = 0; i < 64; i++) px(x, `rgba(170,172,180,${(0.25 + h2(i, 3) * 0.2).toFixed(2)})`, i, 31, 1, 2); });
      tex('t_p113t_rockface', (x) => { rock(x); for (let j = 4; j < 64; j += 9) px(x, 'rgba(50,52,58,0.35)', 0, j + ((h2(j, 1) * 3) | 0), 64, 1); });
      // the stage's sleepers: oak laid across the ramp, black with use, the middles worn pale where the wheels run
      tex('t_p113t_sleepers', (x) => {
        for (let r = 0; r < 4; r++) { const b = 46 + (h2(r, 2) * 10 | 0); px(x, `rgb(${b},${b - 6},${b - 12})`, 0, r * 16, 64, 14); px(x, '#141210', 0, r * 16 + 14, 64, 2); px(x, `rgb(${b + 14},${b + 6},${b - 2})`, 0, r * 16, 64, 1);
          for (let i = 0; i < 64; i++) if (h2(i, r) > 0.82) px(x, 'rgba(20,16,12,0.5)', i, r * 16 + 2 + ((h2(r, i) * 10) | 0), 2, 1); }
        for (const c of [8, 40]) for (let j = 0; j < 64; j++) if ((j % 16) < 14) px(x, `rgba(150,136,112,${(0.22 + h2(c, j) * 0.15).toFixed(2)})`, c + ((h2(j, c) * 3) | 0), j, 14, 1);
      });
      // the baulk of oak: a squared beam, iron-strapped, and (on the two worn ones) a bite worn where the wheels stop
      const baulk = (x, worn) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 44 + h2(i >> 2, j >> 4) * 8 + Math.sin(j * 0.9 + i * 0.05) * 3; px(x, `rgb(${v | 0},${(v - 6) | 0},${(v - 12) | 0})`, i, j); }
        px(x, '#3a3c42', 0, 10, 64, 3); px(x, '#3a3c42', 0, 50, 64, 3); px(x, '#6a6e76', 0, 10, 64, 1);
        if (worn) { x.fillStyle = 'rgb(112,98,78)'; x.beginPath(); x.ellipse(32, 0, 20, 16, 0, 0, PI); x.fill(); x.fillStyle = 'rgb(140,126,102)'; x.beginPath(); x.ellipse(32, 0, 14, 9, 0, 0, PI); x.fill(); }
      };
      tex('t_p113t_baulk', (x) => baulk(x, false)); tex('t_p113t_baulkw', (x) => baulk(x, true));
    }
    // ---- sprites
    add('p113t_none', 4, 4, 0.3, () => {});
    // a breath, hanging as a breath hangs on a cold morning: a soft cloud of pale motes, densest a little below its middle,
    // thinning upward and to the sides (whole motes from fixed noise, so it reads in the classic view and in the 3D one)
    const breath = (seed) => (x) => {
      for (let y = 0; y < 40; y++) for (let i = 0; i < 48; i++) {
        const dx = (i - 24 - Math.sin(y * 0.21 + seed) * 2.5) / 19, dy = (y - 24) / 13, d = dx * dx + dy * dy * (y < 24 ? 0.8 : 1.6), n = h2(i + seed * 7, y);
        if (d < 0.16 && n > 0.25) px(x, n > 0.7 ? 'rgba(244,246,250,0.95)' : 'rgba(222,226,234,0.9)', i, y);
        else if (d < 1 && n > 0.42 + d * 0.5) px(x, n > 0.85 ? 'rgba(236,238,244,0.85)' : 'rgba(196,202,214,0.75)', i, y);
      }
    };
    for (let k = 1; k <= 3; k++) add('p113t_breath' + k, 48, 40, 0.42, breath(k * 1.7), (r, g, b, a) => a > 200 && r > 230);
    // an empty lamp bracket of iron, set in the obsidian
    add('p113t_bracket', 24, 28, 0.32, (x) => { px(x, '#1a1b1e', 9, 0, 6, 6); px(x, '#3a3c42', 9, 0, 6, 1); px(x, '#1a1b1e', 11, 6, 2, 12); px(x, '#1a1b1e', 6, 16, 12, 2); px(x, '#1a1b1e', 6, 18, 2, 8); px(x, '#1a1b1e', 16, 18, 2, 8); px(x, '#4a4c54', 7, 18, 1, 6); }, null, { dy: -1.05 });
    // the clerk's place: a flat cut in the obsidian at a clerk's height, a dry inkwell, a rule on a chain; the floor under
    // it worn bright by boots
    add('p113t_clerk', 56, 72, 0.95, (x) => {
      px(x, '#0c0c10', 4, 18, 48, 10); px(x, '#3a3c46', 4, 18, 48, 2); px(x, '#5a5e6a', 4, 17, 48, 1);
      px(x, '#2a2a2e', 12, 12, 7, 7); px(x, '#46464c', 12, 12, 7, 1); px(x, '#050505', 14, 12, 3, 2);   // the inkwell, dry
      px(x, '#7a6a50', 26, 15, 20, 2); px(x, '#a89a7a', 26, 15, 20, 1); for (let k = 0; k < 7; k++) px(x, '#3a3c42', 46 - k * 2, 17 + k * 2, 2, 1);   // the rule, and its chain
      for (let i = 6; i < 50; i++) px(x, `rgba(140,146,170,${(0.12 + h2(i, 1) * 0.12).toFixed(2)})`, i, 68 + ((h2(i, 4) * 3) | 0), 1, 2);
    });
    // chalk, in fives, rubbed out with a sleeve, not well
    add('p113t_chalk', 64, 36, 0.48, (x) => {
      for (let g = 0; g < 9; g++) { const gx = 2 + (g % 5) * 12, gy = 3 + ((g / 5) | 0) * 16;
        for (let k = 0; k < 4; k++) px(x, 'rgba(226,224,214,0.8)', gx + k * 2.4, gy, 1, 10); x.strokeStyle = 'rgba(226,224,214,0.8)'; x.lineWidth = 1; x.beginPath(); x.moveTo(gx - 1, gy + 8); x.lineTo(gx + 9, gy + 2); x.stroke(); }
      for (let i = 0; i < 64; i++) for (let j = 0; j < 36; j++) if (Math.abs(j - 14 - Math.sin(i * 0.08) * 6) < 6 && h2(i, j) > 0.25) px(x, 'rgba(32,33,38,0.8)', i, j);   // the sleeve's smear
      for (let i = 0; i < 40; i++) px(x, 'rgba(200,198,188,0.25)', (h2(i, 3) * 62) | 0, 8 + ((h2(i, 5) * 14) | 0), 2, 1);
    }, null, { dy: -0.75 });
    // the sleeve: grey Office cloth, torn off at the shoulder, caught on an iron cable-eye; paper in the cuff
    add('p113t_sleeve', 32, 64, 0.62, (x) => {
      px(x, '#2a2c30', 12, 0, 8, 8); px(x, '#0c0c0e', 14, 2, 4, 4); px(x, '#5a5e66', 12, 0, 8, 1);
      x.fillStyle = '#7c7e84'; x.beginPath(); x.moveTo(11, 6); x.lineTo(22, 5); x.lineTo(24, 50); x.lineTo(10, 52); x.closePath(); x.fill();
      for (let j = 8; j < 50; j += 5) px(x, 'rgba(60,62,68,0.5)', 11, j, 12, 1); px(x, '#9a9ca2', 12, 7, 2, 40);
      for (let i = 10; i < 23; i += 2) px(x, '#5c5e64', i, 4 + (i % 3), 2, 3);   // the torn shoulder
      px(x, '#66686e', 9, 50, 16, 6); px(x, '#e2dcc8', 13, 54, 6, 4); px(x, '#c8c0a8', 13, 57, 6, 1);   // the cuff, and the paper
    }, null, { dy: -0.32 });
    // one shoe, a woman's, the heel worn on the outside; a ticket in the toe
    add('p113t_shoe', 32, 16, 0.16, (x) => { x.fillStyle = '#3a2a1e'; x.beginPath(); x.moveTo(2, 14); x.lineTo(4, 7); x.quadraticCurveTo(10, 3, 16, 7); x.lineTo(28, 9); x.quadraticCurveTo(31, 11, 29, 14); x.closePath(); x.fill(); px(x, '#1a120c', 2, 13, 6, 2); px(x, '#5a4430', 6, 6, 8, 1); px(x, '#e2dcc8', 22, 8, 4, 2); px(x, '#24180e', 3, 14, 3, 1); });
    // a card, soft with handling, pushed into a crack of the baulk
    add('p113t_card', 12, 16, 0.14, (x) => { px(x, '#d8d0b8', 1, 1, 10, 14); px(x, '#b8b098', 1, 14, 10, 1); px(x, '#5a4e3a', 3, 4, 6, 1); px(x, '#5a4e3a', 3, 6, 4, 1); px(x, '#2a2418', 4, 10, 2, 3); px(x, '#2a2418', 7, 10, 1, 3); }, null, { dy: -0.32 });
    // the sprag, lying: a billet of ash shod with iron, polished where a hand has carried it
    add('p113t_sprag', 40, 16, 0.16, (x) => { px(x, '#8a7050', 4, 5, 26, 8); px(x, '#b89c74', 4, 5, 26, 2); px(x, '#5a4630', 4, 12, 26, 1); px(x, '#c8b08a', 8, 7, 10, 2); px(x, '#4a4c52', 30, 4, 7, 10); px(x, '#8a8e96', 30, 4, 7, 1); px(x, '#2a2c30', 30, 13, 7, 1); for (let i = 6; i < 28; i += 5) px(x, 'rgba(60,44,28,0.45)', i, 9, 3, 1); });
    // a Lead Brother a hundred yards off, as the wall draws them (RIFT100's picture) but in the lead's own dark, so that he
    // reads against the grey at that distance
    try { const src = Engine.sprites.p100_brother; if (src && !Engine.sprites.p113t_brother) { const d = new Uint32Array(src.data.length);
      for (let i = 0; i < d.length; i++) { const v = src.data[i], a = v >>> 24; if (!a) continue; const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255; d[i] = (a << 24) | (((b * 0.42) | 0) << 16) | (((g * 0.4) | 0) << 8) | ((r * 0.4) | 0); }
      Engine.addSprite('p113t_brother', { w: src.w, h: src.h, hs: src.hs || 1, cx: src.cx == null ? 0.5 : src.cx, dy: src.dy || 0, data: d });   /* only the picture, not the original's cached smaller copies */ } } catch (e) { warnOnce('brother', e); }
    // a fence post: an iron eye on an oak post, tungsten cable strung through it either way
    add('p113t_fence', 32, 48, 0.72, (x) => {
      px(x, '#2a241e', 14, 4, 4, 44); px(x, '#3e362c', 14, 4, 1, 44);
      for (const j of [10, 26]) { px(x, '#22242a', 12, j - 2, 8, 6); px(x, '#0c0c0e', 14, j, 4, 2); px(x, '#6e7480', 0, j, 32, 2); px(x, '#9aa0ac', 0, j, 32, 1); }
    });
  }

  // ---------------------------------------------------------------- the defs: the leavings, the sprag, the trooper
  const SPRAG_DEF = { name: TX.name.sprag, img: 'fp_mace', dmg: [4, 10], reach: 1.3, noise: 1.0, speed: 0.88, type: 'iron', blunt: true, value: 40, desc: TX.spragDesc };   // the mallet's numbers, a little heavier (slower) and no better
  function defs() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p113_sprag) WEAPONS.p113_sprag = Object.assign({}, SPRAG_DEF);
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p113_sprag) ITEMS.w_p113_sprag = { name: TX.name.sprag, sprite: 'gear', weapon: 'p113_sprag', value: 40, desc: TX.spragDesc };
      if (!ITEMS.v_p113_leavings) ITEMS.v_p113_leavings = { name: TX.leavings, sprite: 'gear', valuable: true, value: 0, desc: TX.leavingsDesc };   // value 0: no merchant will buy them
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'w_p113_sprag')) {
      const sprag = (d) => { d.tilt(12, 12); d.layer('#b89c74').rrect(-3, -4, 6, 15); d.layer('#d8c4a0').rect(-2.2, 2, 1.4, 8); d.layer('#5a5e66', { shiny: 1 }).rrect(-3.6, -9, 7.2, 5.4); d.layer('#9aa0aa', { shiny: 1 }).rect(-3, -8.6, 6, 1); d.layer('#2a2c30').rect(-3.6, -4.2, 7.2, 0.8); };
      ICONS.PIX['weapon:p113_sprag'] = sprag; ICONS.PIX.w_p113_sprag = sprag;
      // a letter, a ticket and a card, tied with a boot-lace
      ICONS.PIX.v_p113_leavings = (d) => { d.layer('#e2dcc8').rrect(4, 7, 15, 10); d.layer('#c8b890').rect(7, 5, 10, 6); d.layer('#d8d0b8').rect(10, 12, 9, 7); d.layer('#2a2418').rect(13, 14, 3, 3); d.layer('#3a2a1e').rect(3, 11, 18, 1.4); d.layer('#3a2a1e').rect(11, 5, 1.4, 14); };
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined' && !NPCS.p113_trooper && typeof RIFT100 !== 'undefined' && RIFT100.SAY && RIFT100.SAY.tr_b) {
      // a trooper of the Watch by Battery Eight: the one counting cable-eyes (her greeting is Phase 100's), with the cart gate for a subject of her own
      NPCS.p113_trooper = { name: RIFT100.TX.trooper, sprite: 'p100_tr_b', portrait: 'townswoman', tier: 'low', greet: RIFT100.SAY.tr_b.greet,
        topics: Object.assign({}, RIFT100.SAY.tr_b.topics, { [TX.cartGateTopic]: TX.cartGateLine }) };
    }
  }

  // ---------------------------------------------------------------- the lamp: a talking-post just inside the wicket (SOULS91 group m, as RIFT100's)
  let LAMP = null;
  function lamp() {
    if (LAMP || typeof SOULS91 === 'undefined' || !SOULS91.GROUPS || !SOULS91.GROUPS.m || !Array.isArray(SOULS91.LAMPS)) return LAMP;
    const g = SOULS91.GROUPS.m; for (const id of [SALLY, TIP]) if (!g.maps.includes(id)) g.maps.push(id);
    const R = RIFT100.TX;
    LAMP = { map: SALLY, x: S0.post[0], y: S0.post[1], wx: S0.wake[0], wy: S0.wake[1], dir: 0, name: TX.sallyName, sprite: 'p100_post', litSprite: 'p100_postlit', label: R.lampLabel, litLabel: R.lampLit, lightCol: [240, 196, 120], id: SOULS91.LAMPS.length, g: 'm' };
    SOULS91.LAMPS.push(LAMP);
    return LAMP;
  }

  // ---------------------------------------------------------------- on the wall: the cart yard, the cart gate, Tower Eight's postern, the trooper
  function onWall(w) {
    if (!w || w._p113t || !w._p100 || typeof RIFT100 === 'undefined') return false; w._p113t = true;
    const R = RIFT100, kind = w._p100.kind, Wm = w.w, L = w.ensureLvls(), RC = R.RC;
    const yard = new Uint8Array(Wm * w.h);
    const c0 = R.pol(RC - 10, 24.5);
    for (let j = Math.floor(c0[1] - 12); j <= c0[1] + 12; j++) for (let i = Math.floor(c0[0] - 12); i <= c0[0] + 12; i++) {
      if (i < 1 || j < 1 || i >= Wm - 1 || j >= w.h - 1) continue;
      const k = j * Wm + i, r = R.rOf(i + 0.5, j + 0.5), d = R.degOf(i + 0.5, j + 0.5);
      if (r < RC - 14 || r >= RC - 7.2 || d < 21.2 || d > 28.2 || kind[k] > 2 && kind[k] !== 6) continue;
      w.set(i, j, null); if (w.smooth) w.smooth[k] = 0; L[k] = 0; w.setFloor(i, j, 1); kind[k] = 6; yard[k] = 1;
    }
    // a door in the wall's inner face on a ray: the first wall cell beside the yard
    const doorOn = (deg) => {
      for (let r = RC - 7.6; r < RC - 4.5; r += 0.25) {
        const [x, y] = R.pol(r, deg), i = x | 0, j = y | 0, k = j * Wm + i; if (kind[k] !== 3) continue;
        for (const [di, dj] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) { const n = (j + dj) * Wm + i + di; if (yard[n]) return { at: [i, j], front: [i + di + 0.5, j + dj + 0.5], dir: Math.atan2(dj, di) }; }
      }
      return null;
    };
    const g = doorOn(23.6), p8 = doorOn(27.3);
    if (!g || !p8) { warnOnce('yard', 'no door place'); return false; }
    P.gate = g.at; P.gateFront = g.front; P.post8 = p8.at; P.post8Front = p8.front;
    w.set(g.at[0], g.at[1], DOOR({ tex: 't_p113t_gate', portal: { map: SALLY, x: S0.spawn[0], y: S0.spawn[1], dir: 0 }, label: TX.gate })); w.setLvl(g.at[0], g.at[1], 0);
    w.set(p8.at[0], p8.at[1], DOOR({ tex: 't_p100_door', portal: { map: SALLY, x: S0.post8Front[0], y: S0.post8Front[1], dir: PI / 2 }, label: TX.post8, locked: 'p113_post8', lockMsg: TX.post8Barred })); w.setLvl(p8.at[0], p8.at[1], 0);
    P.gateDir = g.dir; P.post8Dir = p8.dir;
    // the trooper, near Battery Eight, on the Watch's side, a little off the gate
    const t = R.pol(RC - 10.5, 25.4); P.trooper = [t[0], t[1]];
    const base = w.baseCount != null ? w.baseCount : w.entities.length;
    if (typeof NPCS !== 'undefined' && NPCS.p113_trooper) { const e = { kind: 'npc', id: 'p113_trooper', x: t[0], y: t[1], sprite: NPCS.p113_trooper.sprite, scale: 1, solid: true, radius: 0.35, facing: P.gateDir }; w.entities.splice(base, 0, e); w.baseCount = base + 1; }
    return true;
  }

  // ---------------------------------------------------------------- building the sally-way
  function buildSally() {
    const m = new GameMap(SALLY, TX.sallyName, SW, SH, { floor: 't_p113t_sfloor', ceil: 't_p113t_ceil', floorTextures: ['t_p113t_sfloor', 't_p113t_ruts'], fogDist: 18, fogColor: [4, 4, 6], ambient: 0.26, music: 'inside', danger: 0,
      spawn: { x: S0.spawn[0], y: S0.spawn[1], dir: 0 } });
    m.rect(0, 0, SW - 1, SH - 1, 't_p100_obsidian');
    m.clear(1, 4, 29, 8); m.clear(12, 2, 18, 10);
    for (let i = 1; i <= 29; i++) for (const j of [3, 9]) if (i % 3 === 1 && m.get(i, j)) m.set(i, j, WALL('t_p100_cable'));   // the cable strung from iron eyes down the walls
    for (let i = 1; i <= 29; i++) for (const j of [5, 7]) m.setFloor(i, j, 1);   // the ruts, the width of an Office wagon
    m.set(S0.wicket[0], S0.wicket[1], DOOR({ tex: 't_p113t_gate', portal: { map: MAP, x: P.gateFront ? P.gateFront[0] : 0, y: P.gateFront ? P.gateFront[1] : 0, dir: (P.gateDir || 0) }, label: TX.gate }));
    m.set(S0.mouth[0], S0.mouth[1], DOOR({ tex: 't_p113t_mouth', portal: { map: TIP, x: T0.spawn[0], y: T0.spawn[1], dir: 0 }, label: TX.mouthLine }));
    m.set(S0.post8[0], S0.post8[1], DOOR({ tex: 't_p100_door', portal: { map: MAP, x: P.post8Front ? P.post8Front[0] : 0, y: P.post8Front ? P.post8Front[1] : 0, dir: (P.post8Dir || 0), _p113post8: true }, label: TX.post8 }));
    const look = (k, sprite, at, extra) => m.deco(sprite, at[0], at[1], Object.assign({ radius: 0.1, scale: 1, solid: false, label: TX.name[k], use: 'p113t', _p113t: k }, extra || {}));
    look('ruts', 'p113t_none', S0.ruts); look('clerk', 'p113t_clerk', S0.clerk); look('chalk', 'p113t_chalk', S0.chalk); look('sleeve', 'p113t_sleeve', S0.sleeve);
    for (const b of S0.brackets) look('brackets', 'p113t_bracket', b);
    m.deco('p113t_none', S0.mouthFront[0] + 0.5, S0.mouthFront[1], { radius: 0.05, scale: 1, solid: false, nopick: true, _decor: true, glow: 0.8, lightCol: [150, 152, 162] });   // grey daylight coming in at the far mouth
    lamp(); if (LAMP && typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) m.add(SOULS91.lampEnt(LAMP));
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- building the stage
  function buildTip() {
    const m = new GameMap(TIP, TX.name.stage, TW, TH, { floor: 't_p113t_rock', ceil: null, floorTextures: ['t_p113t_rock', 't_p113t_rockrut', 't_p100_not', 't_p113t_sleepers'], fogDist: 150, fogColor: [118, 120, 126], ambient: 0.95, music: 'inside', danger: 0,
      spawn: { x: T0.spawn[0], y: T0.spawn[1], dir: 0 } });
    m.bright = true;
    const L = m.ensureLvls();
    m.ensureVerts();
    m.setSide(0, 0, TW - 1, TH - 1, 't_p113t_rockface');
    for (let j = 0; j < TH; j++) {
      m.block(0, j, (j % 3) ? 't_p100_obsidian' : 't_p100_cable', 9.0, { capTex: 't_p100_walk' });   // the wall's outer foot
      for (let i = T0.lip; i < TW; i++) { L[j * TW + i] = -40; m.setFloor(i, j, 2); }                // the not-colour: nobody steps onto it
    }
    m.set(T0.door[0], T0.door[1], DOOR({ tex: 't_p113t_mouthout', portal: { map: SALLY, x: S0.mouthFront[0], y: S0.mouthFront[1], dir: PI }, label: TX.sallyName }));
    // the ruts, out from the mouth to the stage; the stage, rising to the edge; the baulk across its end
    const [sx0, sy0, sx1, sy1] = T0.stage;
    for (let i = 1; i < sx0; i++) for (const j of [sy0, sy1]) m.setFloor(i, j, 1);
    m.ramp(sx0, sy0, sx1, sy1, 0, T0.rise, 'x');
    for (let j = sy0; j <= sy1; j++) for (let i = sx0; i <= sx1; i++) m.setFloor(i, j, 3);
    for (let j = sy0; j <= sy1; j++) m.block(T0.baulk, j, j === sy0 || j === sy1 ? 't_p113t_baulkw' : 't_p113t_baulk', T0.rise + 0.42, { capTex: 't_p113t_baulkw' });
    // the cable fence pens the ground either side, so there is no way along the lip
    const pen = new Uint8Array(TW * TH);
    for (const j of T0.pen) for (let i = 1; i < T0.lip; i++) { pen[j * TW + i] = 1; m.deco('p113t_fence', i + 0.5, j + 0.5, { radius: 0.05, scale: 1, solid: false, nopick: true, _decor: true }); }
    m.isBlocked = function (x, y) { if (GameMap.prototype.isBlocked.call(this, x, y)) return true; return x >= 0 && y >= 0 && x < TW && y < TH && pen[y * TW + x] === 1; };
    m._p113pen = pen;
    // the things on the stage
    const look = (k, sprite, at, extra) => m.deco(sprite, at[0], at[1], Object.assign({ radius: 0.1, scale: 1, solid: false, label: TX.name[k], use: 'p113t', _p113t: k }, extra || {}));
    look('stage', 'p113t_none', T0.stageMark); look('shoe', 'p113t_shoe', T0.shoe); look('card', 'p113t_card', T0.card); look('sprag', 'p113t_sprag', T0.sprag);
    for (const e of T0.edge) look('edge', 'p113t_none', e);
    m.add({ kind: 'deco', sprite: 'p113t_brother', x: T0.brother[0], y: T0.brother[1], scale: 1, solid: false, radius: 0.05, label: TX.name.brother, _decor: true, _p113t: 'brother', facing: 0 });
    // the Unfinished: three breaths at the height of a face, with nobody under them
    T0.breaths.forEach((b, n) => m.add({ kind: 'deco', sprite: 'p113t_breath' + (n + 1), x: b[0], y: b[1], scale: 1, solid: false, radius: 0.05, yOff: -0.72, nopick: true, _decor: true, glow: 0.25, _p113t: 'breath' + (n + 1) }));
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  function join(maps) {
    if (!maps || maps[SALLY] || !maps[MAP] || typeof GameMap === 'undefined' || typeof RIFT100 === 'undefined') return false;
    defs(); art();
    if (!onWall(maps[MAP])) return false;
    maps[SALLY] = buildSally();
    maps[TIP] = buildTip();
    try { if (typeof POST !== 'undefined' && POST.config && POST.config.grade && POST.config.gradePresets && POST.config.gradePresets.p100_grey && !POST.config.grade[TIP]) POST.config.grade[TIP] = 'p100_grey'; } catch (e) { warnOnce('grade', e); }
    if (typeof RIFT100.addZone === 'function') {
      RIFT100.addZone({ map: TIP, on: () => true, out: () => [1, 0] });
      RIFT100.addZone({ map: SALLY, on: (x) => x > S0.half, out: () => [1, 0] });
    }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const here = (id) => typeof G !== 'undefined' && G.map && G.mapId === id && G.map.id === id;
  const know = () => fint('p113_know', 7), done = () => fint('p113_done', 7), jaw = () => fint('p113_jaw', 3);
  const tbit = (b) => (fint('p113_tbits', 255) & b) !== 0, setTbit = (b) => { f().p113_tbits = fint('p113_tbits', 255) | b; };
  const ent = (k) => (G.ents || []).find((e) => e && e._p113t === k);
  let clock = 0, sayT = 0, repeats = 0, againAt = -1e9, spent = false, mouthSaid = false;
  function resetState() { sayT = 0; repeats = 0; againAt = -1e9; spent = false; mouthSaid = false; }
  // ---- the light: the stage takes the wall's own curve by the hour; the sally-way is dark always
  function tipLight(force) {
    const m = G.maps && G.maps[TIP], R = typeof RIFT100 !== 'undefined' ? RIFT100 : null; if (!m || !R || !R.wallDay || !R.LIGHT) return;
    if (!m._p113day) m._p113day = { dist: m.fogDist };
    const LT = R.LIGHT, k = R.wallDay(G.tod), a = R.wallAmbient(G.tod), lerp = (n, d) => n + (d - n) * k;
    if (!force && Math.abs(a - (m.ambient || 0)) < 0.005 && !(k === 1 && m.ambient !== LT.DAY)) return;
    m.ambient = a;
    m.fogColor = k === 1 ? LT.FOG_DAY.slice() : LT.FOG_DAY.map((c, i) => Math.round(lerp(LT.FOG_NIGHT[i], c)));
    m.fogDist = k === 1 ? m._p113day.dist : lerp(LT.DIST_NIGHT, m._p113day.dist);
    m.bright = a >= LT.BRIGHT_UNDER;
    if (here(TIP) && Engine.setMap) { const cam = Object.assign({}, Engine.cam); Engine.setMap(m); Object.assign(Engine.cam, cam); }
  }
  // ---- the Unfinished
  const voiceCost = () => { const p = G.player; return K.EVERY * ((Number(p.voiceMax) || 10) / K.LAST + K.REGEN); };
  function talkNow() { try { if (typeof RIFT100 !== 'undefined') RIFT100.talk(); } catch (e) { warnOnce('talk', e); } }   // (no murmur sound: the game's own one is pitched by chance)
  function take(j) {
    f().p113_jaw = j; repeats = 0; againAt = -1e9;
    say(TX.takes, 'bad', 7000);
    saying(true);
  }
  // one saying of the breath's half-sentence (by N, or unbidden every few seconds)
  // (the first saying, as it takes you, is always the half: the ending comes with the next)
  function saying(first) {
    const j = jaw(); if (!j) return false;
    sayT = K.EVERY;
    if (!first && (know() & (1 << (j - 1)))) { finish(j); return true; }
    say(TX.half[j - 1], 'voice', 3600);
    if (repeats++ > 0 && clock - againAt >= K.AGAIN_S) { againAt = clock; say(TX.again, 'warn', 5000); }
    talkNow();
    const p = G.player; p.voice = (Number(p.voice) || 0) - voiceCost();
    if (p.voice <= 0) { p.voice = 0; voiceOut(); }
    return true;
  }
  function voiceOut() {
    f().p113_jaw = 0; spent = true; say(TX.voiceOut, 'bad', 8000);
    try { if (typeof RIFT100 !== 'undefined' && RIFT100.relieveNow) RIFT100.relieveNow(); } catch (e) { warnOnce('relieve', e); }
  }
  function finish(j) {
    f().p113_jaw = 0; f().p113_done = done() | (1 << (j - 1));
    say(TX.finished[j - 1], 'voice', 6000); say(TX.after[j - 1], 'good', 8000);
    talkNow(); sync();
    if (done() === 7 && !fint('p113_tipk', 1)) { f().p113_tipk = 1; say(TX.settle[0], 'good', 9000); say(TX.settle[1], '', 12000); leavings(); }
  }
  function leavings() {
    if (fint('p113_tdrop', 1) || !fint('p113_tipk', 1) || !here(TIP)) return;
    f().p113_tdrop = 1;
    const it = ITEMS.v_p113_leavings; G.ents.push(hydrate({ kind: 'item', item: 'v_p113_leavings', sprite: it.sprite || 'gear', x: T0.leavings[0], y: T0.leavings[1], scale: 0.35, yOff: 0, solid: false }));
  }
  function relieved() { try { return typeof RIFT100 !== 'undefined' && RIFT100.state().relieved; } catch (e) { return false; } }
  function tick(dt) {
    if (typeof G === 'undefined' || G.state !== 'play' || !G.player || G.dead || !G.flags) return;
    clock += dt;
    const c = Engine.cam;
    // while a breath has the jaw, it is said every few seconds, wherever you are
    if (jaw()) { sayT -= dt; if (sayT <= 0) saying(false); }
    if (here(TIP)) {
      tipLight(false);
      const d = done();
      if (!jaw() && !spent && !relieved() && d !== 7) {
        let next = 0; for (let n = 1; n <= 3; n++) if (!(d & (1 << (n - 1)))) { next = n; break; }
        const b = T0.breaths[next - 1]; if (next && Math.hypot(c.x - b[0], c.y - b[1]) <= K.REACH) take(next);
      }
      if (fint('p113_tipk', 1) && !fint('p113_tdrop', 1)) leavings();
      for (let n = 1; n <= 3; n++) { const e = ent('breath' + n); if (e && !e.hidden) e.yOff = -0.72 + Math.sin(clock * 0.9 + n * 2.1) * 0.03; }
    } else if (here(SALLY)) {
      if (c.x > S0.mouthFront[0] - 2.9 && !mouthSaid) { mouthSaid = true; say(TX.mouthLine, '', 7000); if (G.player.glassed && !tbit(1)) { setTbit(1); say(TX.glass, 'warn', 8000); } }
      // a Relieved walker goes on out of the mouth, and on toward the edge
      if (relieved() && c.x > S0.mouthFront[0] + 0.1) { loadMap(TIP, { x: T0.spawn[0], y: T0.spawn[1], dir: 0 }); G.state = 'play'; try { RIFT100.relieveNow(); } catch (e) { warnOnce('relieve', e); } }
    }
  }

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || e.use !== 'p113t' || typeof G === 'undefined' || !G.map) return false;
    const k = e._p113t;
    if (k === 'sleeve') { say(TX.look.sleeve, '', 8000); say(TX.letter, 'voice', 10000); f().p113_know = know() | 1; return true; }
    if (k === 'shoe') { say(TX.look.shoe, '', 9000); f().p113_know = know() | 2; return true; }
    if (k === 'card') { say(TX.look.card, '', 9000); f().p113_know = know() | 4; return true; }
    if (k === 'sprag') {
      if (!fint('p113_tipk', 1)) { say(TX.spragDesc, '', 8000); say(TX.spragNo, 'warn', 6000); return true; }
      e.hidden = true; e.dead = true; setTbit(2); try { Audio_.sfx.pickup(); } catch (er) { /* */ }
      try { msg(`You take ${gainItem('w_p113_sprag')}.`, 'good', 4000); } catch (er) { warnOnce('take', er); }
      return true;
    }
    if (TX.look[k]) { say(TX.look[k], '', 8000); return true; }
    return false;
  }
  function sync() {
    if (typeof G === 'undefined' || !G.map || !Array.isArray(G.ents)) return;
    if (here(TIP)) {
      const d = done();
      for (let n = 1; n <= 3; n++) { const e = ent('breath' + n); if (e) e.hidden = !!(d & (1 << (n - 1))); }
      const s = ent('sprag'); if (s && tbit(2)) { s.hidden = true; s.dead = true; }
    }
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) {
      try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); }
      const r = _ud.apply(this, arguments);
      try { if (e && e._p91 === 'lamp' && LAMP && e._i === LAMP.id && here(SALLY)) { say(TX.note, 'voice', 6000); talkNow(); } } catch (err) { warnOnce('note', err); }
      return r; }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function (id) {
      try { if (id === TIP && G.maps && G.maps[TIP]) tipLight(true); } catch (e) { warnOnce('light', e); }
      const r = _l.apply(this, arguments);
      try {
        mouthSaid = false; if (id !== TIP) spent = false;
        sync();
      } catch (e) { warnOnce('load', e); }
      return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    // Tower Eight's postern, opened from within (through its own door on the sally-way's side): it stays open after
    if (typeof transfer === 'function') { const _t = transfer; transfer = function (portal) { try { if (portal && portal._p113post8 && here(SALLY) && !fint('p113_post8', 1)) f().p113_post8 = 1; } catch (e) { warnOnce('postern', e); } return _t.apply(this, arguments); }; }
    // while a breath has the jaw, the Murmur says its half-sentence and not your own subject
    if (typeof castSong === 'function') { const _c = castSong; castSong = function (id) { try { if (id === 'murmur' && typeof G !== 'undefined' && G.state === 'play' && !G.dead && G.flags && jaw()) { saying(); return undefined; } } catch (e) { warnOnce('murmur', e); } return _c.apply(this, arguments); }; }
  }
  wire();

  return { TX, TEXTS, MAP, SALLY, TIP, SW, SH, TW, TH, S: S0, T: T0, P, K, SPRAG_DEF, join, onWall, buildSally, buildTip, tick, useOwn, sync, saying, tipLight, resetState, lamp: () => LAMP, state: () => ({ sayT, repeats, spent, clock }) };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TIP113;
if (typeof window !== 'undefined') window.TIP113 = TIP113;
