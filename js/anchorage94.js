// ============================================================
//  anchorage94 — the Dawning Heights, part two: the Anchorage (Phase 94; plan: Phase 89 and Phase 90, approved 14 Nov 2026).
//
//  WHAT THE BOOK MADE OF THE PLAN. Phase 89 drew the Anchorage as shafts in Mount Lumina with a cavern under the city. Book
//  Two says otherwise, and the book wins: Sol-Luminary is "a great inverted cone" hung from the Spire's flank over a gulf of
//  nothing; "The nine were the city's bones. They came down from rings in the Spire's flank at their long slants and took
//  hold of the city's rim"; each chain comes through the iron ring in its anchor-house floor "and going on down through the
//  floor into the city's frame"; the anchor-houses stand on the rim, at the top, in the Bleach. There is no rock under the
//  city. So the Anchorage is the inside of the city's frame: the Chain-Yards (Vol II: "where the sky-chains are maintained
//  by crews on three-month contracts and a 1-in-9 mortality rate"), worked from underneath since the Fracture took the rim.
//  The player never goes above the line.
//
//  THE ROOMS (Phase 90's nine, each kept, each moved into the frame):
//    1 the Chain-Yard door          a low iron door by the goods-cage's top, under the bell-gallery stair (the Tiers)
//    2 the winch-room (a lamp)      the Sky-Dock winch; Winchmaster Bardo (Vol II: "Runs the tether-chains. Swears beautifully.
//                                   Has lost nineteen men to jerking gravity tethers and keeps their tally cut into his winch
//                                   housing"), alive, and selling a harness
//    3 the seventh bone             down the chain itself, link by link, in its well; the change tolls, and a link under a
//                                   speaking chain throws you: stand on a pin when the seventh speaks
//    4 the tolling gallery          all nine bones pass through it; nine notes, never together
//    5 the Glass-Grown (a secret)   Vol II: "Human-shaped bells. They sound the pitch of whatever Anchor claimed them,
//                                   continuously, and they are conscious … standing, facing the light". Not fought.
//    6 the third bone's landing (a lamp)
//    7 the keel-weights             Phase 90's "bed-weights": blocks of Lumina's white stone as big as churches, hung on the
//                                   bones' ends in the keel [PROPOSED: to keep the cone's point down]
//    8 the Winch-Deep (the keeper)  where the nine are made fast, in the keel; the old capstan turns
//    9 the counterweight cage       rides a bone straight up to the winch-room: the shortcut, freed from below
//
//  THE WONDER: the chains toll. The city sways, the bones take it one after another, and inside the frame that is a sound:
//  a slow bell-change on nine, a plain hunt, one note at a time, worked out from the place's own clock (never chance). The
//  card shows the row; the seventh is marked.
//
//  THE KEEPER: the Nineteen (Phase 89's "Bardo's Nineteen" [PROPOSED]): Vol II's Static Remnant, "human-shaped voltage",
//  cohered from the nineteen men Bardo lost. They haul on a chain that is already made fast. They are tied to the capstan and
//  cannot leave its reach; on a beat they haul, and Vol II's tether jerk follows: "Everything on the walkway weighs four
//  times normal for six seconds." Put down, they leave the brake-gloves and a link with nineteen notches, once.
//
//  THE SOULS RULES: three shade-lamps (group 'i'); the keeper's week; a Piece here rings at 528.
//  Flags (small ints): p94_cage (the counterweight cage freed), p94_kdrop (the keeper's gear given), p94_seen (bits),
//  p94_link (Bardo has seen the link).
// ============================================================
'use strict';

const ANCHORAGE94 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p94_anchorage', TIERS = 'p92_tiers';
  const W = 80, H = 136, TOP = 8, DROP = 0.07, VOID_Z = -40;
  const hv = (vy) => -Math.max(0, vy - TOP) * DROP;
  const lvlAt = (j) => hv(j + 0.5);
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('anchorage94: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('Sol-Luminary: the Anchorage'),
    doorTiers: S('A low iron door in the city\'s frame, a notched link stamped on its plate. The Chain-Yards'),
    doorBack: S('The iron door, back out to the bell-gallery stair'),
    arrive: S('Inside the city\'s frame. Iron ribs, black stone, and the nine chains coming down through it all like the bones they are. Somewhere below you, one of them speaks, and then another.'),
    // the winch-room
    winch: S('The Sky-Dock winch: a great iron drum the height of a man, a brake-wheel on its side like a ship\'s wheel, and a lever as long as an oar.'),
    tally: S('Nineteen strokes cut into the winch housing, in fours with a bar across each four. They are cut where the man at the brake has to look at them.'),
    tallyBar: S('Nineteen strokes cut into the winch housing, and now one long bar cut across all of them.'),
    bardo: S('Winchmaster Bardo'),
    harness: S('Chain-Crew Harness'), harnessDesc: S('A harness of black leather and iron rings, to clip a man to a link while he works on it. The rings are worn bright on the inside.'),
    gloves: S('Brake-Gloves'), glovesDesc: S('A winchman\'s gloves, the palms faced with iron scale for the brake-wheel. Whoever wore them last gripped very hard.'),
    cap: S('Winchman\'s Cap'), capDesc: S('A padded leather cap with an iron plate over the crown, for a place where the ceiling moves.'),
    lever: S('Brake-Lever'), leverDesc: S('The spare lever of an old winch: black iron, as long as an oar, with a square socket at one end. It was made to stop a city moving.'),
    link: S('A Link with Nineteen Notches'), linkDesc: S('A chain-crew\'s mark: an iron link small enough for a belt, with a notch filed in it for each crewmate lost. This one has nineteen.'),
    setName: S('The Chain-Yards'), setT: S('+1 armour'), setF: S('a tether jerk weighs on you half as long'),
    // the bone, the change
    pin: S('A pin of the seventh bone: the iron boss between two links. It does not jump when the chain speaks.'),
    chainlamp: S('A tallow lamp in an iron cage, hung on the pin.'),
    change: S('The change'),
    thrown: S('The seventh speaks, and the link under you jumps. It throws you down the chain.'),
    held: S('The seventh speaks. You are on a pin, and it only shakes you.'),
    hint: S('The nine chains toll one after another. When the seventh speaks, be standing on a pin, not a link.'),
    fell: S('the chain\'s well'),
    // the gallery
    gallery: S('The tolling gallery. All nine bones come down through this one floor, and each speaks in its turn: nine notes, never two together.'),
    bone: S('One of the nine, coming down through the roof and going on through the floor. Each link is as long as a ship\'s boat.'),
    gap: S('A gap between two ribs of the frame, wide enough for one person, turned sideways.'),
    // the Glass-Grown (Vol II)
    gg: S('One of the Glass-Grown: a person gone to glass, standing, face turned up through the whole of the city toward the Spire. It sounds five hundred and twenty-eight, without a breath.'),
    ggRoom: S('They stand in the dark between the ribs, seven of them, facing up. Each one sounds the same high note. None of them has moved in a long time, and all of them are awake.'),
    ggTurn: S('Every one of them turns its head toward you. The note does not change. There is nothing else they can do.'),
    capFound: S('A winchman\'s cap, set down on the plate in front of one of them, the way you set a thing down for somebody.'),
    // the landing, the weights
    landing: S('The third bone\'s landing: a shelf of iron plate round the chain, and a lamp.'),
    weight: S('A keel-weight: a block of Lumina\'s own white stone as big as a church, hung on the end of a bone to keep the city\'s point down. It turns, very slowly.'),
    weights: S('The keel-weights. White stone in the dark, hanging, each on its own bone. The floor between them is iron plate over nothing.'),
    leverFound: S('An iron lever as long as an oar, leaning in the angle of a rib where somebody stood it and did not come back for it.'),
    // the Winch-Deep
    deep: S('The Winch-Deep. The nine bones come down into one iron ring in the keel, and beside it stands the old capstan, turning, with nobody at the bars.'),
    capstan: S('The old capstan. Its bars go round. The chain it hauls on was made fast four hundred years ago.'),
    chainend: S('A bone\'s end, made fast in the keel-ring.'),
    keeperName: S('The Nineteen'),
    keeperDesc: S('Nineteen men lost to jerking tethers, cohered into one working shape of voltage. They haul on a chain that is already made fast, and they do not stop.'),
    creak: S('The capstan creaks. Get clear of its reach.'),
    haul: S('They haul. For a few seconds you weigh what four of you weigh.'),
    keeperDown: S('The Nineteen stop hauling. The bars go round once more by themselves, and are still. On the nearest bar hang a pair of gloves and a notched link.'),
    // the cage
    cageBottom: S('The counterweight cage, its brake set. Free the brake and ride it up'),
    cageBottomOpen: S('The counterweight cage. Ride it up to the winch-room'),
    cageTop: S('The counterweight cage\'s rope, hanging slack. The cage is down, and its brake is set from below.'),
    cageTopOpen: S('The counterweight cage. Ride it down to the Winch-Deep'),
    cageFree: S('You knock the brake off. A keel-weight goes down past you in the dark, and the cage goes up the bone like a bucket up a well, to the winch-room. It will ride both ways now.'),
    cageUp: S('The cage takes you up the bone to the winch-room.'),
    cageDown: S('The cage takes you down the bone to the Winch-Deep.'),
    // lamps
    lampWinch: S('The winch-room'), lampLanding: S('The third bone\'s landing'), lampDeep: S('The Winch-Deep\'s door'),
    lampLabel: S('A shade-lamp on an iron post, unlit: a hood of black tin over the glass. Stand by it to light it.'),
    lampLit: S('A shade-lamp on an iron post, burning under its black hood. Use it to rest.'),
    bardoLink: S('Bardo looks at the link in your hand for a long time, and for once says nothing at all. Then he reaches up with his knife and cuts one bar across all nineteen strokes.'),
  };
  const SAY = {
    bardo: {
      greet: {
        polite: S('Light keep you true, and keep your boots off my brake.'),
        normal: S('Whose are you? Never mind. Touch nothing that has a handle.'),
        blunt: S('Low-pitched, loud-footed, lamp-blind son of a slack link. Speak in the Narrow, or go up and shout at the Bleach.'),
      },
      topics: {
        [S('The nineteen')]: S('Nineteen men, to jerking tethers. I cut each one in the housing, where I have to look at it. I do not say their names in here. The chains know them.'),
        [S('The bones')]: S('The nine come down out of the sky to the rim, through the rings, and on down through the frame to the keel. The city\'s bones. Since the light took the rim we cannot get at them from on top, so we keep them from underneath.'),
        [S('The change')]: S('The city sways, and the bones take it one after another, never two together. Count the row. When the seventh speaks, be standing on a pin. A link under a speaking chain will throw a man, and it does not care which.'),
        [S('The goods-cage')]: S('The seventh\'s goods-cage. I pinned it up top myself, after the nineteenth, and may whoever knocks that pin out come back as a link on the wet side.'),
        [S('The deep')]: S('Below the weights, in the keel, where the nine are made fast. The old capstan. Nobody has worked it since before my time, and it turns. I have nineteen strokes up here, and I have stood at the top of that stair and heard nineteen men hauling. I do not go down.'),
      },
    },
  };

  // ================================================================ the plan
  const P = {
    door: [40, 4], arrive: [40.5, 6.6], tiersDoor: [94, 13], tiersOut: [93.3, 13.5],
    winch: [45.5, 11.5], tally: [45.5, 13.2], bardo: [43.4, 14.6], lamp1: [34.5, 10.5], cageTop: [33.5, 19.0],
    bone: [39, 40, 23, 61], gallery: [22, 62, 58, 77],
    gg: [5, 64, 15, 76], gap: [21, 70], capItem: [8.5, 70.5],
    landing: [50, 81, 62, 88], lamp2: [59.5, 84.5],
    hall: [26, 90, 62, 110], leverItem: [59.5, 107.5],
    lamp3: [37.7, 112.3], deep: [40.5, 123.5, 9.2], capstan: [40.5, 123.5], keeper: [40.5, 120.4],
    cageBottom: [59.5, 123.5],
  };
  const WEIGHTS = [[32, 94], [42, 95], [52, 96], [36, 102], [47, 103], [57, 102], [31, 107], [42, 108], [52, 108]];
  const BONES = [0, 1, 2, 3, 4, 5, 6, 7, 8].map((i) => [25 + i * 4, i % 2 ? 72 : 67]);   // the nine, through the gallery
  const GG = [[7.5, 66.5], [10.5, 68.2], [13.2, 66.2], [8.2, 72.8], [12.4, 71.6], [6.8, 75.2], [11.6, 75.0]];
  const FLOORS = ['t_p94_plate', 't_p94_plank', 't_p94_dark', 't_p94_dark', 't_p94_link', 't_p94_pin'];
  const PLATE = 0, PLANK = 1, VOID = 2, FALL = 3, LINK = 4, PIN = 5;

  // ---------------------------------------------------------------- the change: a plain hunt on nine, from the place's own clock
  const STROKE = 2.0;
  const ROWS = (() => {
    const rows = []; let r = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    for (let n = 0; n < 18; n++) { rows.push(r.slice()); const s = r.slice(); for (let i = n % 2 ? 1 : 0; i + 1 < 9; i += 2) { const t = s[i]; s[i] = s[i + 1]; s[i + 1] = t; } r = s; }
    return rows;
  })();
  const NOTES = [264, 247.5, 220, 198, 176, 165, 148.5, 132, 123.75];   // the nine, treble to tenor
  let clock = 0, lastStroke = -1;
  const strokeAt = (t) => { const n = Math.floor(Math.max(0, t) / STROKE); return { n, row: ROWS[Math.floor(n / 9) % ROWS.length], pos: n % 9 }; };
  const bellAt = (t) => { const s = strokeAt(t); return s.row[s.pos]; };

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
    const g = (v) => `rgb(${v},${v},${v + 3})`;
    if (Engine.addTexture) {
      // riveted iron plate
      tex('t_p94_plate', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(34 + (h2(i, j) * 12 | 0) - ((i % 32 === 0 || j % 32 === 0) ? 16 : 0)), i, j);
        for (const [i, j] of [[4, 4], [28, 4], [4, 28], [28, 28], [36, 36], [60, 36], [36, 60], [60, 60], [36, 4], [60, 28], [4, 60], [28, 36]]) { px(x, g(64), i, j, 2, 2); px(x, g(16), i + 1, j + 2, 2, 1); }
      });
      // tarred planks
      tex('t_p94_plank', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const b = (i >> 4); px(x, `rgb(${30 + (h2(b, j >> 2) * 14 | 0)},${24 + (h2(b, j) * 8 | 0)},${20 + (h2(i, b) * 6 | 0)})`, i, j); } for (let i = 0; i < 64; i += 16) px(x, '#0a0808', i, 0, 1, 64); });
      tex('t_p94_dark', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(4 + (h2(i, j) * 3 | 0)), i, j); });
      // a link of the chain, walked along: two iron bars and the dark between
      tex('t_p94_link', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const bar = i < 22 || i >= 42; px(x, bar ? g(46 + (h2(i, j) * 16 | 0) - (i === 21 || i === 42 ? 18 : 0)) : g(10 + (h2(i, j) * 5 | 0)), i, j); }
        for (let j = 6; j < 64; j += 16) { px(x, g(70), 6, j, 3, 3); px(x, g(70), 54, j, 3, 3); }
        for (let j = 0; j < 64; j += 8) px(x, '#2a2018', 22, j, 20, 5);   // the crew's plank treads across the gap
      });
      tex('t_p94_pin', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const d = Math.hypot(i - 32, j - 32); px(x, d < 22 ? g(66 + (h2(i, j) * 14 | 0) - (d > 19 ? 20 : 0)) : g(40 + (h2(i, j) * 10 | 0)), i, j); }
        px(x, g(20), 28, 28, 8, 8);
      });
      // a rib of the frame: black stone strapped with iron
      tex('t_p94_rib', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 4, off = (row & 1) * 16; px(x, g(20 + (h2((i + off) >> 5, row) * 10 | 0) + (h2(i, j) * 6 | 0) - (((i + off) % 32 === 0 || j % 16 === 0) ? 10 : 0)), i, j); }
        px(x, g(48), 0, 30, 64, 4); for (let i = 4; i < 64; i += 12) px(x, g(76), i, 31, 2, 2);
      });
      // one of the nine, as a pillar: links end on and side on, alternating
      tex('t_p94_chain', (x) => {
        px(x, g(8), 0, 0, 64, 64);
        for (let k = 0; k < 2; k++) { const y0 = k * 32; x.strokeStyle = g(74); x.lineWidth = 7; x.beginPath(); x.ellipse(32, y0 + 16, 16, 20, 0, 0, PI * 2); x.stroke(); x.strokeStyle = g(110); x.lineWidth = 2; x.beginPath(); x.ellipse(30, y0 + 15, 16, 20, 0, 0, PI * 2); x.stroke(); px(x, g(60), 28, y0 + 26, 8, 12); px(x, g(96), 29, y0 + 26, 2, 12); }
      });
      // Lumina's white stone, dressed, with an iron band
      tex('t_p94_weight', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 5, off = (row & 1) * 32, n = h2((i + off) >> 6, row) * 10 + h2(i, j) * 12; px(x, `rgb(${196 + n | 0},${194 + n | 0},${186 + n | 0})`, i, j); }
        px(x, '#8c8a84', 0, 31, 64, 1); px(x, '#8c8a84', 32, 0, 1, 32); px(x, '#8c8a84', 0, 32, 1, 32);
        px(x, g(40), 0, 44, 64, 6); for (let i = 3; i < 64; i += 10) px(x, g(84), i, 46, 2, 2);
      });
      tex('t_p94_door', (x) => {
        px(x, g(30), 0, 0, 64, 64); px(x, g(52), 6, 4, 52, 60); for (let j = 8; j < 64; j += 12) for (const i of [10, 52]) px(x, g(96), i, j, 2, 2);
        x.strokeStyle = g(120); x.lineWidth = 3; x.beginPath(); x.ellipse(32, 30, 8, 12, 0, 0, PI * 2); x.stroke(); px(x, g(52), 38, 24, 4, 3);   // the notched link
      });
    }
    // ---- sprites
    // the Sky-Dock winch: an iron drum the height of a man, a brake-wheel like a ship's wheel, a lever as long as an oar
    add('p94_winch', 128, 128, 1.9, (x) => {
      px(x, g(30), 14, 108, 100, 14); px(x, g(52), 14, 106, 100, 3);
      for (let j = 34; j < 108; j++) { const k = Math.abs((j - 71) / 37), v = 60 - k * 34; px(x, g(v | 0), 30, j, 62, 1); }
      for (let j = 38; j < 106; j += 5) px(x, g(22), 32, j, 58, 1);   // the cable, turn on turn
      px(x, g(40), 24, 30, 8, 80); px(x, g(40), 90, 30, 8, 80);
      x.strokeStyle = g(84); x.lineWidth = 4; x.beginPath(); x.arc(104, 62, 20, 0, PI * 2); x.stroke();
      for (let a = 0; a < 8; a++) { x.beginPath(); x.moveTo(104, 62); x.lineTo(104 + Math.cos(a * PI / 4) * 25, 62 + Math.sin(a * PI / 4) * 25); x.lineWidth = 2; x.stroke(); }
      px(x, g(110), 101, 59, 6, 6);
      x.strokeStyle = g(70); x.lineWidth = 5; x.beginPath(); x.moveTo(30, 84); x.lineTo(2, 4); x.stroke(); px(x, g(100), 0, 2, 6, 6);   // the lever
      // the tally, cut in the housing: fours with a bar, nineteen
      for (let n = 0; n < 19; n++) { const grp = (n / 5) | 0, i = n % 5; if (i < 4) px(x, '#c8c4b8', 36 + grp * 13 + i * 2, 112, 1, 7); else { x.strokeStyle = '#c8c4b8'; x.lineWidth = 1; x.beginPath(); x.moveTo(35 + grp * 13, 119); x.lineTo(44 + grp * 13, 112); x.stroke(); } }
    });
    add('p94_tally', 40, 16, 0.25, (x) => { for (let n = 0; n < 19; n++) { const grp = (n / 5) | 0, i = n % 5; if (i < 4) px(x, '#c8c4b8', 2 + grp * 10 + i * 2, 4, 1, 9); else { x.strokeStyle = '#c8c4b8'; x.lineWidth = 1; x.beginPath(); x.moveTo(1 + grp * 10, 13); x.lineTo(9 + grp * 10, 4); x.stroke(); } } });
    // Bardo: fifties, broad, bare-headed and grey, a harness over a black coat, the notched link at his belt
    add('p94_bardo', 64, 160, undefined, (x) => {
      const cx = 32;
      x.fillStyle = '#211e1c'; x.beginPath(); x.moveTo(cx - 18, 158); x.lineTo(cx - 15, 52); x.lineTo(cx + 15, 52); x.lineTo(cx + 18, 158); x.closePath(); x.fill();
      px(x, '#211e1c', cx - 23, 56, 8, 56); px(x, '#211e1c', cx + 15, 56, 8, 56);
      px(x, '#3a3632', cx - 22, 108, 7, 8); px(x, '#3a3632', cx + 15, 108, 7, 8);   // brake-gloves
      x.strokeStyle = '#6a5a40'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - 14, 54); x.lineTo(cx + 12, 96); x.moveTo(cx + 14, 54); x.lineTo(cx - 12, 96); x.stroke();
      px(x, '#6a5a40', cx - 16, 94, 32, 4); for (const d of [-10, 0, 10]) { px(x, '#9a9ea4', cx + d - 2, 93, 4, 6); px(x, '#211e1c', cx + d - 1, 95, 2, 2); }
      px(x, '#9a9ea4', cx + 4, 100, 7, 9); px(x, '#211e1c', cx + 6, 102, 3, 5); for (let k = 0; k < 6; k++) px(x, '#211e1c', cx + 4 + k, 100, 1, 1);   // the link
      px(x, '#d2c2b2', cx - 8, 26, 16, 22); px(x, '#1a1416', cx - 5, 34, 2, 2); px(x, '#1a1416', cx + 3, 34, 2, 2);
      px(x, '#8a8a88', cx - 8, 40, 16, 10); px(x, '#a8a8a4', cx - 6, 42, 12, 6); px(x, '#5a4040', cx - 2, 41, 4, 1);   // the beard
      px(x, '#8a8a88', cx - 9, 22, 18, 6); px(x, '#a8a8a4', cx - 7, 21, 14, 3);
      px(x, '#0a0808', cx - 15, 152, 12, 6); px(x, '#0a0808', cx + 3, 152, 12, 6);
    });
    // one of the Glass-Grown: a person gone to pale amber glass, face turned up; and the same, turned to you
    const grown = (x, turn) => {
      const cx = 32, body = '#d8c48c', hi = '#fff4d0', dk = '#a88c50';
      x.fillStyle = body; x.beginPath(); x.moveTo(cx - 13, 158); x.lineTo(cx - 11, 56); x.lineTo(cx + 11, 56); x.lineTo(cx + 13, 158); x.closePath(); x.fill();
      px(x, body, cx - 18, 60, 6, 52); px(x, body, cx + 12, 60, 6, 52);
      px(x, dk, cx - 13, 100, 26, 1); px(x, dk, cx - 1, 60, 1, 98); px(x, dk, cx - 18, 110, 6, 2); px(x, dk, cx + 12, 110, 6, 2);
      for (let j = 60; j < 156; j += 9) px(x, hi, cx - 9 + ((j / 9) & 1) * 3, j, 2, 6);
      if (turn) { px(x, body, cx - 7, 30, 14, 20); px(x, dk, cx - 4, 37, 2, 2); px(x, dk, cx + 2, 37, 2, 2); px(x, dk, cx - 2, 44, 4, 1); px(x, hi, cx - 6, 31, 3, 8); }
      else { x.fillStyle = body; x.beginPath(); x.moveTo(cx - 8, 50); x.lineTo(cx - 9, 30); x.lineTo(cx + 5, 24); x.lineTo(cx + 9, 44); x.lineTo(cx + 6, 50); x.closePath(); x.fill(); px(x, dk, cx - 6, 29, 3, 1); px(x, dk, cx + 1, 27, 3, 1); px(x, dk, cx - 1, 33, 3, 1); px(x, hi, cx - 7, 36, 2, 10); }
      px(x, dk, cx - 12, 154, 10, 4); px(x, dk, cx + 2, 154, 10, 4);
    };
    add('p94_glassgrown', 64, 160, undefined, (x) => grown(x, false), (r, gg, b, a) => a > 0 && r > 240);
    add('p94_glassgrown_turn', 64, 160, undefined, (x) => grown(x, true), (r, gg, b, a) => a > 0 && r > 240);
    // the Nineteen: men of blue-white voltage, leaning into one bar (whole pixels: the far ones thinner, a dither, not a fade)
    add('p94_nineteen', 150, 170, undefined, (x) => {
      const man = (cx, top, lean, thin) => {
        const dot = (c, i, j2) => { if (thin && ((i + j2) % thin) !== 0) return; px(x, c, i, j2); };
        for (let j2 = top + 30; j2 < top + 150; j2++) { const sh = (lean * (top + 150 - j2) / 120) | 0; for (let i = cx - 12 + sh; i < cx + 12 + sh; i++) dot((i - cx - sh) * (i - cx - sh) < 30 ? '#dff0ff' : '#5a9cf0', i, j2); }
        for (let j2 = top + 6; j2 < top + 30; j2++) for (let i = cx - 9; i < cx + 9; i++) { const ox = i - cx, oy = j2 - top - 18; if (ox * ox / 81 + oy * oy / 121 <= 1) dot(ox * ox + oy * oy < 20 ? '#f4fbff' : '#6aa8f4', i + ((lean * 1.3) | 0), j2); }
        for (let i = cx + lean + 10; i < cx + lean + 36; i++) for (let j2 = top + 44; j2 < top + 50; j2++) dot('#6aa8f4', i, j2);   // arms to the bar
        for (let j2 = top + 34; j2 < top + 148; j2 += 7) { const o = ((h2(cx, j2) * 15) | 0) - 7; px(x, '#ffffff', cx + o + ((lean * (top + 150 - j2) / 120) | 0), j2, 2, 5); }   // the crackle
      };
      man(28, 16, 10, 3); man(88, 12, 11, 3); man(58, 8, 12, 2); man(44, 2, 12, 0); man(74, 0, 13, 0);
      px(x, '#9cc8ff', 20, 50, 126, 5); px(x, '#f4fbff', 20, 51, 126, 2);   // the bar
    }, (r, gg, b, a) => a > 0 && b > 200);   // self-lit, with no light of their own on top of them (that washes them warm): the cold light stands by the capstan
    add('p94_capstan', 110, 120, 1.5, (x) => {
      for (let j = 30; j < 112; j++) { const k = Math.abs((j - 70) / 42), w = 22 + (k > 0.7 ? 8 : 0); px(x, g((58 - k * 26) | 0), 55 - w, j, w * 2, 1); }
      px(x, g(30), 20, 112, 70, 8); px(x, g(84), 30, 28, 50, 5);
      for (const [x0, y0, x1, y1] of [[55, 38, 4, 30], [55, 38, 106, 30], [55, 42, 16, 56], [55, 42, 94, 56]]) { x.strokeStyle = '#4a3a28'; x.lineWidth = 5; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke(); }
      for (let j = 60; j < 108; j += 6) px(x, g(22), 35, j, 40, 2);
    });
    add('p94_chainend', 40, 150, 3.0, (x) => {
      for (let j = 0; j < 126; j += 14) { x.strokeStyle = g(80); x.lineWidth = 5; x.beginPath(); x.ellipse(20, j + 8, 7, 10, 0, 0, PI * 2); x.stroke(); px(x, g(60), 17, j + 16, 6, 6); }
      x.strokeStyle = g(100); x.lineWidth = 6; x.beginPath(); x.ellipse(20, 138, 16, 7, 0, 0, PI * 2); x.stroke();
    });
    add('p94_chainlamp', 24, 60, 0.6, (x) => {
      px(x, g(40), 11, 0, 2, 22); px(x, g(40), 5, 22, 14, 2); px(x, g(40), 5, 44, 14, 2); for (const i of [5, 11, 17]) px(x, g(40), i, 22, 2, 24);
      px(x, '#e8b060', 8, 30, 8, 12); px(x, '#fff0c0', 10, 33, 4, 7);
    }, (r, gg, b, a) => a > 0 && r > 220);
    add('p94_levergear', 40, 100, 1.2, (x) => { x.strokeStyle = g(74); x.lineWidth = 5; x.beginPath(); x.moveTo(30, 96); x.lineTo(10, 4); x.stroke(); px(x, g(110), 6, 0, 8, 8); px(x, g(30), 8, 2, 4, 4); });
  }

  // ================================================================ the defs: the keeper, the gear, Bardo
  const KEEPER_DEF = { name: TX.keeperName, sprite: 'p94_nineteen', hp: 190, dmg: [7, 13], speed: 1.15, reach: 1.5, scale: 1.35, xp: 280, desc: TX.keeperDesc };
  const ARMOR_DEFS = {
    a_p94_cap: { name: TX.cap, slot: 'head', ar: 2, noise: 0, value: 34, desc: TX.capDesc },
    a_p94_gloves: { name: TX.gloves, slot: 'hands', ar: 2, noise: 0.05, value: 52, desc: TX.glovesDesc },
    a_p94_harness: { name: TX.harness, slot: 'body', ar: 4, noise: 0.1, value: 58, desc: TX.harnessDesc },
  };
  const LEVER_DEF = { name: TX.lever, img: 'fp_mace', dmg: [5, 11], reach: 1.9, noise: 1.1, speed: 0.62, type: 'iron', blunt: true, twoHanded: true, value: 44, desc: TX.leverDesc };
  function defs() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p94_lever) WEAPONS.p94_lever = Object.assign({}, LEVER_DEF);
    if (typeof ENEMIES !== 'undefined' && !ENEMIES.p94_nineteen) ENEMIES.p94_nineteen = Object.assign({}, KEEPER_DEF);
    if (typeof ARMOR !== 'undefined') for (const k in ARMOR_DEFS) if (!ARMOR[k]) ARMOR[k] = Object.assign({}, ARMOR_DEFS[k]);
    if (typeof ITEMS !== 'undefined') {
      for (const k in ARMOR_DEFS) if (!ITEMS[k]) ITEMS[k] = Object.assign({ sprite: 'gear', armor: true }, ARMOR_DEFS[k]);
      if (!ITEMS.w_p94_lever) ITEMS.w_p94_lever = { name: TX.lever, sprite: 'gear', weapon: 'p94_lever', value: 44, desc: TX.leverDesc };
      if (!ITEMS.v_p94_link) ITEMS.v_p94_link = { name: TX.link, sprite: 'gear', valuable: true, value: 80, desc: TX.linkDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'a_p94_cap')) {
      ICONS.PIX.a_p94_cap = (d) => { d.layer('#4a3a2a').rrect(5, 7, 14, 11); d.layer('#7a7e84', { shiny: 1 }).rrect(7, 5, 10, 5); d.layer('#2a2018').rect(5, 16, 14, 2); d.mark('#c8ccd0', 10, 6); };
      ICONS.PIX.a_p94_gloves = (d) => { const gl = (x) => { d.layer('#2e2a26').rrect(x, 5, 7, 14); d.layer('#8a8e94', { shiny: 1 }).rect(x + 1, 11, 5, 6); for (let i = 0; i < 3; i++) d.layer('#4a4e54').rect(x + 1, 12 + i * 2, 5, 0.6); }; gl(3); gl(14); };
      ICONS.PIX.a_p94_harness = (d) => { d.layer('#1c1a18').rrect(5, 3, 14, 18); d.layer('#6a5a40').rect(6, 4, 2, 16).rect(16, 4, 2, 16).rect(6, 12, 12, 2); d.layer('#b8bcc2', { shiny: 1 }).rrect(10, 10, 4, 5); d.layer('#1c1a18').rect(11, 11.5, 2, 2); };
      const lever = (d) => { d.tilt(12, 12); d.layer('#5a5e64', { shiny: 1 }).rrect(-1.5, -11, 3, 22); d.layer('#8a8e94', { shiny: 1 }).rrect(-3, -12, 6, 5); d.layer('#1a1a1c').rect(-1.2, -11, 2.4, 2.4); };
      ICONS.PIX['weapon:p94_lever'] = lever; ICONS.PIX.w_p94_lever = lever;
      ICONS.PIX.v_p94_link = (d) => { d.layer('#8a8e94', { shiny: 1 }).rrect(6, 4, 12, 16); d.layer('#141416').rrect(9, 7, 6, 10); for (let i = 0; i < 7; i++) d.layer('#141416').rect(6, 5 + i * 2, 1.2, 0.8); };
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined' && !NPCS.p94_bardo) NPCS.p94_bardo = { name: TX.bardo, sprite: 'p94_bardo', portrait: 'townsman', tier: 'low', greet: SAY.bardo.greet, topics: SAY.bardo.topics,
      shop: [{ item: 'a_p94_harness' }, { item: 'bandage', price: 4 }, { item: 'tonic', price: 5 }], markup: 1.0,
      shopTalk: { hello: S('A harness, if you mean to go down the bone. Clip on at the pins.'), broke: S('Then you go down unclipped, like a fool, like I did at your age.'), thanks: [S('Count the row.'), S('Mind the seventh.')] } };
  }

  // ================================================================ the lamps (the Souls rules: group 'i')
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return;
    const base = { sprite: 'p92_shadelamp', litSprite: 'p92_shadelamplit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [240, 186, 110] };
    LAMPS = SOULS91.register('i', { maps: [MAP], revive: [MAP], keeper: (e) => e._p94 === 'keeper', kflag: 'p94k', note: 528 }, [
      Object.assign({ map: MAP, x: P.lamp1[0], y: P.lamp1[1], wx: P.lamp1[0] + 1.3, wy: P.lamp1[1] + 1.2, dir: PI / 2, name: TX.lampWinch }, base),
      Object.assign({ map: MAP, x: P.lamp2[0], y: P.lamp2[1], wx: P.lamp2[0] - 1.4, wy: P.lamp2[1] + 0.6, dir: PI / 2, name: TX.lampLanding }, base),
      Object.assign({ map: MAP, x: P.lamp3[0], y: P.lamp3[1], wx: P.lamp3[0] + 1.6, wy: P.lamp3[1], dir: PI / 2, name: TX.lampDeep }, base),
    ]) || [];
  }

  // ================================================================ building the frame
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  const snap = (m, x, y) => {
    const ok = (qx, qy) => { const i = qx | 0, j = qy | 0; if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) return false; const k = j * m.w + i; if (!m.smooth || !m.smooth[k] || m.get(i, j)) return false; return !m.entities.some((e) => e.solid && Math.hypot(e.x - qx, e.y - qy) < 0.7); };
    if (ok(x, y)) return [x, y];
    for (let r = 0.5; r <= 6; r += 0.5) for (let a = 0; a < 16; a++) { const qx = x + Math.cos(a / 16 * PI * 2) * r, qy = y + Math.sin(a / 16 * PI * 2) * r; if (ok(qx, qy)) return [qx, qy]; }
    return [x, y];
  };
  function plan() {
    const N = W * H, kind = new Uint8Array(N), open = new Uint8Array(N);   // 0 void, 1 floor, 2 rib, 3 weight, 4 link, 5 pin, 6 bone (pillar), 7 plank floor
    const rect = (x0, y0, x1, y1, k) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) kind[at(i, j)] = k; };
    rect(30, 5, 50, 22, 1);                                                 // the winch-room
    const [bx0, bx1, by0, by1] = P.bone;
    for (let j = by0; j <= by1; j++) { const pin = (j - by0) % 6 < 2; for (let i = pin ? bx0 - 1 : bx0; i <= (pin ? bx1 + 1 : bx1); i++) kind[at(i, j)] = pin ? 5 : 4; }
    for (let j = by0 + 2; j <= by1 - 2; j++) for (let i = 33; i <= 46; i++) if (!kind[at(i, j)]) open[at(i, j)] = 1;   // the chain's well: open either side
    rect(...[P.gallery[0], P.gallery[1], P.gallery[2], P.gallery[3]], 7);    // the tolling gallery
    rect(16, 70, 21, 70, 1); rect(P.gg[0], P.gg[1], P.gg[2], P.gg[3], 1);    // the gap, and the Glass-Grown
    rect(55, 78, 56, 80, 1); rect(P.landing[0], P.landing[1], P.landing[2], P.landing[3], 1);   // the third bone's landing
    rect(54, 89, 55, 89, 1); rect(P.hall[0], P.hall[1], P.hall[2], P.hall[3], 1);              // the keel-weights
    rect(37, 111, 44, 113, 1);                                              // the Deep's door
    const [dx, dy, dr] = P.deep;
    for (let j = Math.floor(dy - dr - 1); j <= Math.ceil(dy + dr); j++) for (let i = Math.floor(dx - dr - 1); i <= Math.ceil(dx + dr); i++) if (Math.hypot(i + 0.5 - dx, j + 0.5 - dy) <= dr) kind[at(i, j)] = 1;
    rect(50, 123, 55, 124, 1); rect(56, 121, 61, 126, 1);                   // to the counterweight cage
    for (const [cx, cy] of WEIGHTS) rect(cx - 1, cy - 1, cx + 1, cy + 1, 3);
    for (const [cx, cy] of BONES) kind[at(cx, cy)] = 6;
    kind[at(53, 84)] = 6;                                                   // the third, through its landing
    // ribs: every void cell that touches a floor, but for the chain's well
    const out = kind.slice();
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) {
      const k = at(i, j); if (kind[k] || open[k]) continue;
      let touch = false; for (let b = -1; b <= 1 && !touch; b++) for (let a = -1; a <= 1; a++) { const t = kind[at(i + a, j + b)]; if (t === 1 || t === 4 || t === 5 || t === 7) { touch = true; break; } }
      if (touch) out[k] = 2;
    }
    return { kind: out, open };
  }
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p94_plate', ceil: null, floorTextures: FLOORS, fogDist: 16, fogColor: [7, 7, 9], ambient: 0.11, music: 'inside', danger: 2,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: PI / 2 } });
    const { kind, open } = plan();
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) V[vy * W1 + vx] = hv(vy);
    m.setSide(0, 0, W - 1, H - 1, 't_p94_dark');
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k], lv = lvlAt(j);
      if (t === 1 || t === 4 || t === 5 || t === 7) { m.smooth[k] = 1; L[k] = lv; m.setFloor(i, j, t === 4 ? LINK : t === 5 ? PIN : t === 7 ? PLANK : PLATE); continue; }
      m.smooth[k] = 0;
      if (t === 2) { L[k] = lv; m.block(i, j, 't_p94_rib', lv + 3.4); continue; }
      if (t === 3) { L[k] = lv; m.block(i, j, 't_p94_weight', lv + 4.6); continue; }
      if (t === 6) { L[k] = lv; m.block(i, j, 't_p94_chain', lv + 7); continue; }
      L[k] = VOID_Z; m.setFloor(i, j, open[k] ? FALL : VOID);
    }
    m._p94 = { kind, open };
    // ---- the door back to the Tiers
    m.set(P.door[0], P.door[1], DOOR({ tex: 't_p94_door', portal: { map: TIERS, x: P.tiersOut[0], y: P.tiersOut[1], dir: PI }, label: TX.doorBack }));
    // ---- the winch-room
    m.deco('p94_winch', P.winch[0], P.winch[1], { radius: 0.9, scale: 1, solid: true, label: TX.winch });
    m.deco('p94_tally', P.winch[0] - 0.3, P.winch[1] + 0.95, { radius: 0.2, scale: 1, solid: false, label: TX.tally, _p94: 'tally' });   // on the housing's foot
    for (const [x, y] of [[43.5, 9.5], [47.6, 14.4], [32.5, 16.5], [38.5, 20.5]]) m.deco('p94_chainlamp', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.5, lightCol: [232, 170, 96], label: TX.chainlamp });
    m.deco('p92_cage', P.cageTop[0], P.cageTop[1], { radius: 0.4, scale: 1, solid: true, use: 'p94_cage', _p94: 'cageTop', label: TX.cageTop });
    // ---- the seventh bone: a tallow lamp on every pin
    const [, , by0, by1] = P.bone;
    for (let j = by0; j <= by1; j += 6) m.deco('p94_chainlamp', P.bone[0] - 0.55, j + 0.9, { radius: 0.1, scale: 1, solid: false, glow: 0.5, lightCol: [232, 170, 96], label: TX.chainlamp, _p94: 'pinlamp' });
    // ---- the gallery: the gap behind the first bone
    m.deco('sign', P.gap[0] + 1.1, P.gap[1] + 0.5, { radius: 0.1, scale: 0.01, solid: false, label: TX.gap, _p94: 'gap' });
    for (const [x, y] of [[30.5, 64.5], [50.5, 64.5], [40.5, 75.5]]) m.deco('p94_chainlamp', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.45, lightCol: [232, 170, 96], label: TX.chainlamp });
    // ---- the Glass-Grown: seven, facing up, each its own faint light
    for (const [x, y] of GG) m.deco('p94_glassgrown', x, y, { radius: 0.3, scale: 1, solid: true, glow: 0.05, label: TX.gg, _p94: 'gg' });
    for (const [x, y] of [[9.5, 67.5], [10.5, 73.5]]) m.add({ kind: 'deco', sprite: 'p94_chainlamp', x, y, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.3, lightCol: [200, 176, 120], _p94: 'gglight' });   // their own faint light
    m.item('a_p94_cap', P.capItem[0], P.capItem[1]);
    // ---- the landing, the weights
    for (const [x, y] of [[34.5, 98.5], [50.5, 100.5], [44.5, 106.5], [28.5, 92.5], [60.5, 96.5]]) m.deco('p94_chainlamp', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.4, lightCol: [232, 170, 96], label: TX.chainlamp });
    m.item('w_p94_lever', P.leverItem[0], P.leverItem[1]);
    // ---- the Winch-Deep: the capstan, the nine made fast round it
    m.deco('p94_capstan', P.capstan[0], P.capstan[1], { radius: 0.8, scale: 1, solid: true, label: TX.capstan, _p94: 'capstan' });
    for (let i = 0; i < 9; i++) { const a = i / 9 * PI * 2 + 0.35; m.deco('p94_chainend', P.capstan[0] + Math.cos(a) * 8.1, P.capstan[1] + Math.sin(a) * 8.1, { radius: 0.3, scale: 1, solid: true, label: TX.chainend }); }
    m.deco('p92_cage', P.cageBottom[0], P.cageBottom[1], { radius: 0.4, scale: 1, solid: true, use: 'p94_cage', _p94: 'cageBottom', label: TX.cageBottom });
    // ---- the lamps
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) m.add(SOULS91.lampEnt(L0));
    // ---- Bardo
    { const [x, y] = snap(m, P.bardo[0], P.bardo[1]); m.npc('p94_bardo', x, y, { facing: PI }); }
    // ---- what lives there: shriek-motes on the tolling links, fret-crawlers on the walls, and the Nineteen
    const foe = (type, x, y, o) => { const [qx, qy] = snap(m, x, y); return m.enemy(type, qx, qy, o); };
    for (const [x, y] of [[39.9, 33.4], [40.1, 51.4], [44.5, 100.5], [33.5, 105.5]]) foe('mites', x, y);
    if (typeof ENEMIES !== 'undefined' && ENEMIES.fretcrawler) for (const [x, y] of [[30.5, 74.5], [52.5, 70.5], [56.5, 99.5]]) foe('fretcrawler', x, y);
    foe('p94_nineteen', P.keeper[0], P.keeper[1], { _p94: 'keeper', facing: PI / 2 });
    m.add({ kind: 'deco', sprite: 'p94_chainlamp', x: P.capstan[0], y: P.capstan[1] + 2.4, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.3, lightCol: [150, 200, 255], _p94: 'klight' });   // their cold light, about the capstan
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
      tm.set(i, j, DOOR({ tex: 't_p94_door', portal: { map: MAP, x: P.arrive[0], y: P.arrive[1], dir: PI / 2 }, label: TX.doorTiers }));
    }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p94_seen', 1023); if (s & (1 << bit)) return false; f().p94_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const here = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const kindAt = (x, y) => { const d = G.map._p94; const k = at(x | 0, y | 0); return d && k >= 0 ? d.kind[k] : 0; };
  const inRect = (r, x, y) => x >= r[0] && x < r[2] + 1 && y >= r[1] && y < r[3] + 1;
  const HAUL = 11, CREAK = 1.8, HEAVY = 6, LEASH = 5.6, HEAVY_MOVE = 0.3, THROW = 5;
  let lastSafe = null, prev = null, haulT = HAUL, heavyT = 0, creaked = false, turned = false, ggLevel = 0;
  const heavyFor = () => (typeof GEAR87 === 'object' && GEAR87.special && GEAR87.special('weight') ? HEAVY / 2 : HEAVY);

  // the card: the row, and where the change has got to
  let cardEl = null, cardN = -2;
  function drawCard() {
    if (typeof document === 'undefined') return;
    const game = document.getElementById('game'); if (!game) return;
    if (!here() || G.state !== 'play') { if (cardEl) { cardEl.remove(); cardEl = null; cardN = -2; } return; }
    const s = strokeAt(clock); if (cardEl && s.n === cardN) return; cardN = s.n;
    if (!document.getElementById('p94-style')) { const st = document.createElement('style'); st.id = 'p94-style';
      st.textContent = '#p94-card{position:absolute;left:50%;top:1.4cqh;transform:translateX(-50%);background:rgba(14,13,16,.84);border:1px solid #6a5a3c;color:#cfc6b2;font:1.25cqw/1.3 "Alegreya SC",serif;padding:.4cqw .9cqw;z-index:6;pointer-events:none;display:flex;gap:.5cqw;align-items:center}#p94-card .b{width:1.7cqw;text-align:center;border:1px solid #3a342c}#p94-card .b.s{border-color:#c4964a;color:#e2c88c}#p94-card .b.on{background:#cfc6b2;color:#141216}#p94-card .b.s.on{background:#c4964a}#fx.p94-heavy{background:rgba(150,200,255,.14)}';
      document.head.appendChild(st); }
    if (!cardEl) { cardEl = document.createElement('div'); cardEl.id = 'p94-card'; cardEl.setAttribute('role', 'status'); cardEl.setAttribute('aria-live', 'off'); game.appendChild(cardEl); }
    const d = document.createDocumentFragment(), lab = document.createElement('span'); lab.appendChild(document.createTextNode(TX.change)); d.appendChild(lab);
    s.row.forEach((b, i) => { const e = document.createElement('span'); e.className = 'b' + (b === 7 ? ' s' : '') + (i === s.pos ? ' on' : ''); e.textContent = String(b); d.appendChild(e); });
    cardEl.replaceChildren(d);
  }

  function tick(dt) {
    // the Glass-Grown's note, nearer as you come to them
    try {
      if (typeof Audio_ !== 'undefined' && Audio_.hum) {
        let want = 0;
        if (here() && G.state === 'play') { const c = Engine.cam, d = Math.hypot(c.x - 10.5, c.y - 70.5); want = d < 16 ? (1 - d / 16) * 0.3 : 0; }
        if (want > 0 || ggLevel > 0) { Audio_.hum(want, 528, 'p94_gg'); ggLevel = want; }
      }
    } catch (e) { warnOnce('gg hum', e); }
    if (!here() || G.state !== 'play' || !G.player || G.dead) { prev = null; return; }
    const p = G.player, c = Engine.cam;
    // heavy: a tether jerk (Vol II): you weigh four times what you weigh, and move like it
    if (heavyT > 0) { heavyT -= dt; if (prev) { c.x = prev.x + (c.x - prev.x) * HEAVY_MOVE; c.y = prev.y + (c.y - prev.y) * HEAVY_MOVE; } try { fx('p94-heavy', 200); } catch (e) { /* no overlay */ } }
    clock += dt;
    once(0, TX.arrive, '', 9000);
    const k = at(c.x | 0, c.y | 0), kd = kindAt(c.x, c.y), standing = p.fallFrom == null && G.map.smooth && G.map.smooth[k];
    if (standing) lastSafe = { x: c.x, y: c.y, dir: c.dir };
    // the chain's well: you fell
    if (!(G.map.smooth && G.map.smooth[k]) && kd === 0 && typeof p.feet === 'number' && p.feet < lvlAt(c.y | 0) - 2.5) {
      if (lastSafe) { c.x = lastSafe.x; c.y = lastSafe.y; }
      p.hp = 0; prev = null; die(TX.fell); return;
    }
    // the change: one bone speaks on every stroke; a link under the seventh throws you
    const s = strokeAt(clock);
    if (s.n !== lastStroke) {
      lastStroke = s.n; const bell = s.row[s.pos];
      try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.song) Audio_.sfx.song(NOTES[bell - 1], 1.5); } catch (e) { /* audio is optional */ }
      if (bell === 7 && c.y >= P.bone[2] && c.y < P.bone[3] + 1) {
        if (kd === 4) {
          p.hp -= THROW; G.hurtT = 0.2;
          for (let d = 1.6; d > 0; d -= 0.4) { const t = kindAt(c.x, c.y + d); if (t === 4 || t === 5) { c.y += d; break; } }
          say(TX.thrown, 'bad', 5000); try { Audio_.sfx.hurt(); } catch (e) { /* */ }
          if (p.hp <= 0) { prev = null; die(TX.fell); return; }
        } else if (kd === 5) once(2, TX.held, 'good', 4500);
      }
    }
    if (kd === 4 || kd === 5) once(1, TX.hint, 'warn', 8000);
    if (inRect(P.gallery, c.x, c.y)) once(3, TX.gallery, '', 8000);
    if (inRect(P.gg, c.x, c.y)) once(4, TX.ggRoom, '', 9000);
    if (inRect(P.landing, c.x, c.y)) once(5, TX.landing, '', 6000);
    if (inRect(P.hall, c.x, c.y)) once(6, TX.weights, '', 8000);
    // the Winch-Deep: the Nineteen keep to the capstan's reach, and haul on a beat
    const kp = G.ents.find((e) => e && e._p94 === 'keeper');
    const inDeep = Math.hypot(c.x - P.deep[0], c.y - P.deep[1]) <= P.deep[2] + 0.5;
    if (inDeep) once(7, TX.deep, '', 8000);
    const kl = G.ents.find((e) => e && e._p94 === 'klight'); if (kl && kp) { kl.hidden = !!(kp.dead || kp.hidden); kl.glow = kl.hidden ? 0 : 0.3; }
    if (kp && !kp.dead && !kp.hidden) {
      const d = Math.hypot(kp.x - P.capstan[0], kp.y - P.capstan[1]);
      if (d > LEASH) { kp.x = P.capstan[0] + (kp.x - P.capstan[0]) * LEASH / d; kp.y = P.capstan[1] + (kp.y - P.capstan[1]) * LEASH / d; }
      if (inDeep) {
        haulT -= dt;
        if (!creaked && haulT <= CREAK) { creaked = true; say(TX.creak, 'warn', 2500); try { Audio_.sfx.door(); } catch (e) { /* */ } }
        if (haulT <= 0) { haulT = HAUL; creaked = false; heavyT = heavyFor(); say(TX.haul, 'bad', 3500); try { Audio_.sfx.golem(); } catch (e) { /* */ } }
      } else { haulT = HAUL; creaked = false; }
    }
    // put down: what they were hauling with, once
    if (kp && kp.dead && !fint('p94_kdrop', 1)) {
      f().p94_kdrop = 1; heavyT = 0;
      for (const [id, dx] of [['a_p94_gloves', -0.5], ['v_p94_link', 0.5]]) { const it = ITEMS[id]; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: kp.x + dx, y: kp.y, scale: 0.35, yOff: 0, solid: false })); }
      say(TX.keeperDown, 'good', 8000);
    }
    // Bardo and the link
    if (!fint('p94_link', 1) && G.has && G.has('v_p94_link') && Math.hypot(c.x - P.bardo[0], c.y - P.bardo[1]) < 2.6) { f().p94_link = 1; say(TX.bardoLink, '', 10000); sync(); }
    prev = { x: c.x, y: c.y };
  }

  // ---------------------------------------------------------------- using things
  function rideTo(end) {
    const c = Engine.cam, t = end === 'top' ? [P.cageTop[0] + 1.3, P.cageTop[1] - 0.6, 0] : [P.cageBottom[0] - 1.4, P.cageBottom[1], PI];
    c.x = t[0]; c.y = t[1]; c.dir = t[2]; prev = null; if (G.player) { G.player.feet = G.map.groundAt(c.x, c.y); G.player.fallFrom = null; G.player.fallV = 0; }
  }
  function useOwn(e) {
    if (!e || e.use !== 'p94_cage' || !here()) return false;
    const openC = fint('p94_cage', 1) === 1;
    if (e._p94 === 'cageBottom') {
      if (!openC) { f().p94_cage = 1; rideTo('top'); say(TX.cageFree, 'good', 9000); try { Audio_.sfx.door(); } catch (er) { /* */ } }
      else { rideTo('top'); say(TX.cageUp, '', 4000); }
    } else if (!openC) say(TX.cageTop, '', 5000);
    else { rideTo('bottom'); say(TX.cageDown, '', 4000); }
    sync(); return true;
  }
  function sync() {
    if (!here()) return;
    const openC = fint('p94_cage', 1) === 1, bar = fint('p94_link', 1) === 1;
    for (const e of G.ents) { if (!e || !e._p94) continue;
      if (e._p94 === 'cageTop') e.label = openC ? TX.cageTopOpen : TX.cageTop;
      else if (e._p94 === 'cageBottom') e.label = openC ? TX.cageBottomOpen : TX.cageBottom;
      else if (e._p94 === 'tally') e.label = bar ? TX.tallyBar : TX.tally;
      else if (e._p94 === 'gg') e.sprite = turned ? 'p94_glassgrown_turn' : 'p94_glassgrown'; }
  }
  // sung to, the Glass-Grown turn their heads; that is all they can do
  function sung() {
    if (!here() || turned) return;
    const c = Engine.cam; if (!inRect([P.gg[0] - 1, P.gg[1] - 1, P.gg[2] + 7, P.gg[3] + 1], c.x, c.y)) return;
    turned = true; sync(); say(TX.ggTurn, '', 8000);
  }

  // ================================================================ wiring
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { lastSafe = null; prev = null; heavyT = 0; haulT = HAUL; creaked = false; turned = false; sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { drawCard(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (typeof castSong === 'function') { const _cs = castSong; castSong = function () { const r = _cs.apply(this, arguments); try { sung(); } catch (e) { warnOnce('song', e); } return r; }; }
  }
  wire();

  return { TX, SAY, TEXTS, MAP, W, H, P, WEIGHTS, BONES, GG, ROWS, NOTES, STROKE, KEEPER_DEF, ARMOR_DEFS, LEVER_DEF, hv, lvlAt, plan, build, join, tick, useOwn, sync, sung, drawCard,
    strokeAt, bellAt, lamps: () => LAMPS, clock: () => clock, setClock: (v) => { clock = v; lastStroke = -1; }, heavy: () => heavyT, setHaul: (v) => { haulT = v; }, consts: { HAUL, CREAK, HEAVY, LEASH, HEAVY_MOVE, THROW } };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ANCHORAGE94;
if (typeof window !== 'undefined') window.ANCHORAGE94 = ANCHORAGE94;
