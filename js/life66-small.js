// ============================================================
//  life66-small — the small places keep the hours (ROADMAP R10 wave 4; engine js/life60.js).
//
//  STILLWATER LANDING (js/flume16.js, itself [PROPOSED]): the smugglers' wharf at the Flume's lower lock. By day an
//    eel-trapper at the pier end and a boy fishing off the other, a reed-cutter carrying green Flume-Reed up from the
//    river, a woman at the washing line; after dark a lookout at the lane head and two men carrying crates off a boat to
//    the fence's lean-to, quietly. The Eel-Run and the eel-traps are the Festivals addendum's; Flume-Reed is reedcraft's.
//  THE LOW RINGS (js/flume16.js): Oakhaven's flooded lower quarter. Three people by day only, close to the Landing's
//    gangway and well away from the drones and the briar-sprites: an eel-trapper at a mooring post, a salvager wading
//    crates out along the street, a woman fishing things out of the water. Out by four.
//  THE BELL YARD AND ASHLANE (js/grove31.js, Book One ch. 14–15): Whisper-Grove's joiners' and coopers' streets. Canon,
//    as in wave 2: nobody lives a day there; its life is the Hollows' loops. Six more loops by day [PROPOSED]: a joiner
//    planing a board that is already smooth, a cooper driving a hoop, a carter at the carts with their shafts up, a woman
//    beating a rug with no dust in it, a boy running the length of the Bell Yard, a woman reading the name-boards on
//    Ashlane's doors. At dusk they go out under the archway to the Sunken Court, "the way leaves do", and come back at
//    dawn. The sweeper, the jugs, the shutters, the twice-taken man and the Office's proctors are unchanged.
//  THE HOLLOW (js/hollow30.js; MS:326, Book One ch. 3): "the lanes behind the tannery, where the town kept its burl-sick".
//    Thirty-one households, eighty-four souls, nineteen of them children (canon, ch. 8). Nine of them [PROPOSED], under
//    the Hush, so everything is whispered: water from the well, a step swept, beans shelled, a man with one arm gone to
//    burl carrying kindling, a girl carrying her little brother, a tanner's hand going through the back door to work, two
//    children playing at being quiet, and a man who cannot sleep for the ache, at the well at night. On Rootday morning,
//    when the Grafters' wagon comes in, every one of them goes indoors until it has gone.
//  THE CLEARING (js/maps.js, outside the Hedge): canon, the Consortium's quarry headframe, its roster and its night
//    shift; timber out of the clearing (Tomas, Phase 9); the gate shut at dusk. [PROPOSED]: three quarry hands who come
//    out through the North Gate at first light and go back in before it shuts (one works the headframe pump all day),
//    two sawyers working the iron-bough with Tomas, and a woman gathering in the oaks. They keep to the path and the
//    level ground, away from the hound-bed, and they are quiet, because "out here nothing eats anything".
//  Every person has a role, not a name; every line has French.
// ============================================================
'use strict';

const LIFE66_SMALL = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI, N = -PI / 2, SO = PI / 2, E = 0, W = PI;
  const F = () => { try { return (typeof G !== 'undefined' && G && G.flags) || {}; } catch (e) { return {}; } };
  const oakGone = () => { const f = F(); return !!(f.greening || f.escaped || f.part3 || f.part4); };
  const hour = () => { try { const t = Number(G.tod) || 0; return (((t % 1) + 1) % 1) * 24; } catch (e) { return 12; } };
  const grafting = () => { try { return typeof HOLLOW30 !== 'undefined' && !!HOLLOW30.grafting(); } catch (e) { return false; } };

  const st = (from, to, job, at, x) => Object.assign({ from, to, job, at }, x || {});
  const home = (from, to) => ({ from, to, job: 'home' });

  // ground: never deep water; in the clearing, never up the Watch-stone
  const tex = (m, x, y) => { try { const f = m.floorCells ? m.floorCells[y * m.w + x] : 0; return (m.floorTextures && m.floorTextures[f]) || m.floor; } catch (e) { return ''; } };
  const dry = (m, x, y) => tex(m, x, y) !== 't_water';
  const level = (m, x, y) => { try { return dry(m, x, y) && Math.abs(m.lvlAt(x + 0.5, y + 0.5)) < 0.05; } catch (e) { return dry(m, x, y); } };

  // ================================================================ Stillwater Landing [PROPOSED]
  const LANE = [16.5, 1.6], HOUSE = [30.5, 9.3];
  const LANDING = [
    { key: 'l_eel', name: S('An eel-trapper'), sprite: 'p16f_dockwoman', home: HOUSE,
      day: [home(17, 6), st(6, 12, 'reach', [7.5, 19.6], { face: SO }), st(12, 13, 'sit', [6.5, 14.3], { face: SO }), st(13, 17, 'scrub', [4.6, 13.6], { face: SO })],
      props: [['p60_basket', 5.2, 14.1, 1.0]],
      greet: S('"Mind the traps. Willow, not wire: wire sings in the current and they won\'t go in."'),
      work: S('"Setting the traps off the pier end and gutting what comes up. They run down the Flume in the dark, the eels. Nobody knows where to."'),
      barks: [S('An eel-trapper, to a trap: "Come on, then. In you go."'), S('An eel-trapper, gutting: "Head, tail, and the rest for the pot."')] },
    { key: 'l_boy', name: S('A boy with a line'), sprite: 'p17c_child', scale: 0.74, home: HOUSE,
      day: [home(18, 7), st(7, 16, 'sit', [14.5, 20.5], { face: SO }), st(16, 18, 'play', [20.5, 13.9], { area: 1.4 })],
      greet: S('"Shh. You\'ll put them off." He has a willow pole, a length of twine and no bait at all.'),
      work: S('"Fishing. Mam says the green water\'s got nothing in it but I\'ve seen things in it. I\'ve seen a boot."'),
      barks: [S('A boy on the pier, to the water: "Bite. Go on. Bite."')] },
    { key: 'l_reed', name: S('A reed-cutter'), sprite: 'p60_man_b', home: LANE,
      day: [home(17, 6), st(6, 14, 'carry', [27.5, 13.4], { to2: [16.5, 10.6] }), st(14, 17, 'knead', [2.6, 10.4], { face: E })],
      props: [['p9_log', 2.2, 11.4, 0.5]],
      greet: S('"Flume-Reed. Cut green this morning, dead by tomorrow. Holds any pitch you give it, while it lasts."'),
      work: S('"Cutting reed by the river and tying it in bundles for the town. It goes to sugar by the next day, so you cut it and you run."'),
      barks: [S('A reed-cutter, tying a bundle: "Twelve to a bundle. Twelve. Eleven. Where\'s the twelfth."')] },
    { key: 'l_wash', name: S('A washerwoman'), sprite: 'p60_wom_b', home: HOUSE,
      day: [home(18, 8), st(8, 12, 'hang', [4.6, 10.0], { face: N }), st(12, 15, 'scrub', [24.6, 14.4], { face: SO }), st(15, 18, 'hang', [4.6, 10.0], { face: N })],
      props: [['p60_line', 4.7, 9.4, 0.9]],
      greet: S('"If it\'s the keeper you want, he\'s at the wheel. If it\'s the other thing you want, you didn\'t hear it from me."'),
      work: S('"Washing in the Flume. It comes out green and smelling of cut grass, and they all want it, the town folk."'),
      barks: [S('A washerwoman, pegging out: "Dry, you. Dry."')] },
    { key: 'l_look', name: S('A man at the lane head'), sprite: 'p60_man_c', home: LANE,
      day: [st(20, 4, 'watch', [17.6, 2.4], { face: N }), home(4, 20)],
      greet: S('"Evening. Lovely evening. Nothing happening. Walk on."'),
      work: S('"Watching the road. For weather. A lot of weather on that road, after dark."'),
      barks: [S('A man at the lane head, softly, over his shoulder: "Clear."')] },
    { key: 'l_smugA', name: S('A man with a crate'), sprite: 'p16f_dockman', home: LANE,
      day: [st(21, 3, 'carry', [19.5, 14.4], { to2: [6.6, 9.6] }), home(3, 21)],
      greet: S('"It\'s fish." It is not fish.'),
      barks: [S('A man with a crate, under his breath: "Mind the step. Mind the step."')] },
    { key: 'l_smugB', name: S('A man with a crate'), sprite: 'p17c_hand', home: LANE,
      day: [st(22, 4, 'carry', [18.6, 14.5], { to2: [7.6, 9.7] }), home(4, 22)],
      greet: S('"Never seen you. You\'ve never seen me. That\'s the toll on this landing, and it\'s cheap."'),
      barks: [S('A man with a crate: "Quiet, it clinks."')] },
  ];

  // ================================================================ the Low Rings [PROPOSED]: by day, near the gangway
  const GANG = [36.4, 18.5];
  const RINGS = [
    { key: 'r_trap', name: S('An eel-trapper'), sprite: 'p60_man_a', home: GANG,
      day: [home(16, 7), st(7, 16, 'reach', [33.2, 18.5], { face: N })],
      greet: S('"The eels like the drowned streets. Warm under the roofs. Keep off the deep bits; there\'s no bottom to them."'),
      work: S('"Traps on the old mooring posts. Before the water came you tied boats to these. Now you tie traps."'),
      barks: [S('An eel-trapper, knee-deep: "Empty. Empty. Oh, hello."')] },
    { key: 'r_salv', name: S('A salvager'), sprite: 'p16f_rafter', home: GANG,
      day: [home(15, 8), st(8, 15, 'carry', [21.6, 19.1], { to2: [35.4, 19.0] })],
      greet: S('"Nobody\'s coming back for it. I asked. I asked the water, and the water said nothing, so."'),
      work: S('"Wading out what the flood left in the houses that still have floors. Pans, mostly. Everybody had pans."'),
      barks: [S('A salvager, wading: "Pan. Pan. Kettle. Pan."')] },
    { key: 'r_pick', name: S('A woman in the shallows'), sprite: 'p60_wom_c', home: GANG,
      day: [home(14, 9), st(9, 14, 'pick', [31.6, 19.4], { area: 1.3 })],
      greet: S('"Things float up. Buttons. A comb. Once a little wooden horse. I keep them on a shelf for whoever."'),
      barks: [S('A woman in the shallows, holding something up to the light: "Now, whose are you."')] },
  ];

  // ================================================================ the Bell Yard and Ashlane: the Hollows' loops [PROPOSED]
  const H = S('A Hollow');
  const ARCH = [32.4, 11.5];   // out under the archway to the Sunken Court at dusk, back at dawn
  const loop = (at, job, x) => [home(18, 5), st(5, 18, job, at, x)];
  const YARD = [
    { key: 'y_joiner', name: H, sprite: 'p62_hollow_a', home: ARCH, day: loop([4.6, 4.5], 'hammer', { face: N }),
      greet: S('A joiner at a bench by his door, planing a board that is already smooth, and has been smooth for three years. The shavings that do not come off it would fill the yard.'),
      barks: [S('A Hollow at a bench: "...true... it\'s nearly true..."')] },
    { key: 'y_cooper', name: H, sprite: 'p62_hollow_b', home: ARCH, day: loop([12.4, 15.2], 'hammer', { face: N }),
      greet: S('A cooper driving a hoop down onto a barrel that is not there, with a mallet that never quite lands.'),
      barks: [S('A Hollow in Ashlane, tapping: "...down... and down... and seat it..."')] },
    { key: 'y_carter', name: H, sprite: 'hollow', home: ARCH, day: loop([29.2, 17.3], 'reach', { face: E }),
      greet: S('A carter at the carts with their shafts up, running his hand down the neck of a horse that left when nobody fed it.'),
      barks: [S('A Hollow at the carts: "...easy... easy, girl..."')] },
    { key: 'y_rug', name: H, sprite: 'p62_hollow_c', home: ARCH, day: loop([19.5, 6.5], 'hang', { face: N }),
      greet: S('A woman beating a rug on a line. No dust comes out of it. She beats it anyway, with her whole arm, and stops to look, and beats it again.'),
      barks: [S('A Hollow with a rug-beater: "...spring clean... spring..."')] },
    { key: 'y_boy', name: H, sprite: 'p17c_child', scale: 0.72, home: ARCH, day: loop([3.6, 5.6], 'carry', { to2: [27.4, 5.6] }),
      greet: S('A boy running the length of the Bell Yard with a stick held out in front of him, and back, and again. Whatever he was chasing, he is still chasing it.'),
      barks: [S('A Hollow boy, running: "...wait for me... wait..."')] },
    { key: 'y_boards', name: H, sprite: 'p62_hollow_a', home: ARCH, day: loop([3.6, 15.5], 'carry', { to2: [24.4, 15.5] }),
      greet: S('A woman walking down Ashlane reading the name-board on every door aloud, and at the end of the lane turning round, and reading them again from the other end.'),
      barks: [S('A Hollow in Ashlane, reading: "...Aye... Renn... and the next... the next..."')] },
  ];

  // ================================================================ the Hollow [PROPOSED], under the Hush: everything whispered
  const WELL = [17.4, 17.3];
  const HOL = [
    { key: 'h_water', name: S('A woman of the Hollow'), sprite: 'p60_wom_a', home: [18.5, 9.4],
      day: [home(19, 6), st(6, 9, 'carry', WELL, { to2: [18.5, 9.8] }), st(9, 12, 'scrub', [18.5, 9.7], { face: N }), st(12, 16, 'chat', [21.4, 10.6], { face: 'h_nbr' }), st(16, 19, 'carry', WELL, { to2: [18.5, 9.8] })],
      props: [['p_barrel', 19.4, 9.5, 0.5]],
      greet: S('"Softly. He\'s sleeping, and he doesn\'t, much."'),
      work: S('"Water. The well, the step, the well. They tell you to keep the damp off them. You can\'t keep the damp off anything in the Hollow."'),
      barks: [S('A woman of the Hollow, whispering: "...two more buckets, and then the floor..."'), S('A woman of the Hollow, to her neighbour, whispering: "...pencil, not chalk. Rooke said pencil..."')] },
    { key: 'h_nbr', name: S('A neighbour'), sprite: 'p60_wom_c', home: [22.5, 9.4],
      day: [home(20, 8), st(8, 12, 'sweep', [22.5, 10.2], { area: 0.9 }), st(12, 16, 'chat', [22.4, 10.6], { face: 'h_water' }), st(16, 20, 'sit', [22.5, 9.7], { face: SO })],
      greet: S('"His door\'s in pencil. Early, Rooke says. Could go back. So I sweep." She does not stop sweeping.'),
      work: S('"Keeping the step swept. It\'s a thing you can do."'),
      barks: [S('A neighbour, whispering: "...could go back. That\'s what pencil means. Could..."')] },
    { key: 'h_arm', name: S('A man with a stiff arm'), sprite: 'p60_man_c', home: [10.5, 12.6],
      day: [home(17, 7), st(7, 11, 'carry', [13.5, 2.2], { to2: [10.5, 11.8] }), st(11, 13, 'sit', [10.5, 12.0], { face: N }), st(13, 17, 'hammer', [9.4, 11.6], { face: N })],
      greet: S('He carries the kindling in his right arm. His left hangs at his side, the fingers gone smooth and brown and joined, like a branch. "It doesn\'t hurt," he whispers. "That\'s the trouble."'),
      work: S('"Kindling from the tannery yard, and mending the stool, one-handed. Took me a week. It\'ll take me another."'),
      barks: [S('A man with a stiff arm, whispering, to the stool: "...hold still, you..."')] },
    { key: 'h_beans', name: S('An old woman on a stool'), sprite: 'p60_wom_b', scale: 0.95, home: [3.5, 12.6],
      day: [home(17, 9), st(9, 17, 'knead', [4.6, 11.8], { face: E })],
      props: [['p60_basket', 5.3, 12.0, 0.9]],
      greet: S('"Beans. Sit if you like. Shell if you\'re sitting."'),
      work: S('"Shelling. Eighty-four of us. Somebody has to shell."'),
      barks: [S('An old woman on a stool, whispering: "...one for the pot, one for the pot, one for me..."')] },
    { key: 'h_girl', name: S('A girl carrying her brother'), sprite: 'p17c_child', scale: 0.8, home: [23.5, 12.6],
      day: [home(18, 9), st(9, 15, 'carry', [23.5, 11.4], { to2: [16.6, 11.0] }), st(15, 18, 'sit', [23.5, 12.0], { face: N })],
      greet: S('A girl of about ten with a boy of about three on her hip, asleep. "Mam\'s inside with Da," she whispers. "I\'m to keep him out from under."'),
      barks: [S('A girl, jiggling her brother, whispering: "...shh, shh, the Hush is listening..."')] },
    { key: 'h_tanner', name: S('A tanner\'s hand'), sprite: 'p60_man_a', home: [12.4, 4.5], exit: [13.5, 1.4],
      away: () => grafting() || (hour() >= 7 && hour() < 18),
      day: [home(19, 6), st(6, 7, 'sit', [12.7, 5.6], { face: E }), home(7, 18), st(18, 19, 'sit', [19.2, 18.6], { face: N })],
      greet: S('He smells of the pits. "Through the back door at seven and out of it at six. The tannery doesn\'t mind the burl. It minds if you\'re late."'),
      work: S('"Bread before work. The pits don\'t wait."'),
      barks: [S('A tanner\'s hand, whispering, eating: "...lime, then the bate, then the bark..."')] },
    { key: 'h_night', name: S('A man who cannot sleep'), sprite: 'p60_man_b', home: [26.5, 9.4],
      day: [home(4, 22), st(22, 4, 'sit', [19.0, 17.7], { face: W })],
      greet: S('"It aches worse at night. Like roots in a frost." He rubs his knee, which is the wrong shape. "Sit, if you\'re not sleeping either."'),
      barks: [S('A man by the well, whispering: "...listen to it. It\'s growing. You can hear it if you listen..."')] },
    { key: 'h_moss', name: S('A man scraping his step'), sprite: 'townsman', home: [10.5, 9.4],
      day: [home(18, 8), st(8, 11, 'scrub', [10.5, 9.7], { face: N }), st(11, 16, 'rake', [6.4, 10.6], { area: 1.0 }), st(16, 18, 'sit', [10.5, 9.8], { face: SO })],
      greet: S('"Moss on the step by morning, every morning. The Hollow grows. Everything here grows."'),
      work: S('"Scraping the step, and raking the standing water off the lane. It comes back. I come back."'),
      barks: [S('A man with a scraper, whispering: "...every morning... every morning..."')] },
    { key: 'h_kidA', name: S('A child of the Hollow'), sprite: 'p17c_child', scale: 0.7, home: [12.4, 17.5],
      day: [home(17, 10), st(10, 12, 'play', [14.4, 15.4], { area: 1.4 }), st(12, 14, 'sit', [12.8, 17.4], { face: E }), st(14, 17, 'play', [14.4, 15.4], { area: 1.4 })],
      greet: S('"We\'re playing Quietest. You lose if you make a sound." A pause. "You lost."'),
      barks: [S('A child of the Hollow, whispering: "...you moved. You moved, you\'re out..."')] },
  ];
  // on Rootday morning, while the Grafters' wagon is in, they go indoors (the tanner's hand is at work)
  for (const p of HOL) if (!p.away) { p.away = grafting; p.exit = p.home; }

  // ================================================================ the clearing [PROPOSED]: day folk, quiet, and in by dusk
  const GATE = [20.5, 33.8], HEAD = [20.5, 5.4];
  const shiftOut = (a, b) => () => { const h = hour(); return h >= b || h < a; };   // through the North Gate at dawn, back before it shuts
  const QUARRY = (key, sprite, wait, workJob, workAt, x) => Object.assign({
    key, name: S2.quarry, sprite, home: HEAD, exit: GATE, away: shiftOut(5.6 + wait, 18.2 - wait),
    day: [home(18.2, 5.6), st(5.6, 6.5, 'chat', [21.4 + wait, 6.8], { face: N }), workJob ? st(6.5, 17.5, workJob, workAt, { face: W }) : home(6.5, 17.5), st(17.5, 18.2, 'sit', [19.2 + wait, 7.6], { face: SO })],
  }, x);
  const S2 = { quarry: S('A quarry hand') };
  const CLEAR = [
    QUARRY('c_qA', 'p60_man_a', 0, null, null, {
      greet: S('"Roster forty-one." He says it before he says hello. "In by six, out by six, and nobody asks what\'s in the middle."'),
      barks: [S('A quarry hand, quietly: "...forty-one, forty-two, forty-three, all present..."')] }),
    QUARRY('c_qB', 'p60_man_b', 0.3, null, null, {
      greet: S('"Don\'t stand in the path at shift-change. The hounds learn where people walk. We vary it."'),
      barks: [S('A quarry hand, under his breath: "...bore\'s running warm again..."')] }),
    QUARRY('c_qC', 'p16f_dockman', 0.15, 'reach', [15.8, 6.2], {
      greet: S('"Somebody has to work the pump. It keeps the lower terraces from flooding, and it squeals, and every hound in the clearing knows the squeal."'),
      work: S('"Pumping. All day. If it stops, the third terrace drowns. If it squeals, the hounds come. I oil it a lot."'),
      barks: [S('The pump-man, to the pump: "Hush, you. Hush."')] }),
    { key: 'c_sawA', name: S('A sawyer'), sprite: 'p60_man_c', home: GATE,
      day: [home(17, 7), st(7, 12, 'hammer', [25.6, 31.7], { face: N }), st(12, 13, 'sit', [23.0, 32.0], { face: N }), st(13, 17, 'carry', [26.4, 29.4], { to2: [24.0, 31.4] })],
      greet: S('"Wedges, not the saw. A saw sings. A wedge only knocks."'),
      work: S('"Splitting what Tomas fells. Quiet, mind. Out here nothing eats anything."'),
      barks: [S('A sawyer, very softly, tapping a wedge: "...and one... and wait... and one..."')] },
    { key: 'c_sawB', name: S('A sawyer'), sprite: 'p17c_hand', home: GATE,
      day: [home(17, 7), st(7, 12, 'carry', [26.4, 29.4], { to2: [24.0, 31.4] }), st(12, 13, 'sit', [22.4, 32.4], { face: N }), st(13, 17, 'hammer', [25.6, 31.7], { face: N })],
      greet: S('"Quota day\'s close. The Synod counts timber by the load. It doesn\'t count the man under it."'),
      barks: [S('A sawyer, carrying: "...don\'t drop it, don\'t drop it, it rings..."')] },
    { key: 'c_gather', name: S('A woman gathering'), sprite: 'p60_wom_a', home: GATE,
      day: [home(16, 8), st(8, 12, 'pick', [17.2, 26.4], { area: 1.1 }), st(12, 16, 'pick', [22.8, 23.6], { area: 1.1 })],
      props: [['p60_basket', 17.8, 27.2, 0.9]],
      greet: S('"Mushrooms. They come up where nothing\'s singing. So there\'s a lot of them, out here."'),
      work: S('"Gathering, with one eye on the trees. You learn to pick with your ears."'),
      barks: [S('A woman gathering, whispering: "...not that one... not that one... that one..."')] },
  ];

  const flumeGone = () => !!F().greening || oakGone();
  try {
    if (typeof LIFE60 !== 'undefined') {
      LIFE60.add('flume_landing', LANDING, { gone: flumeGone, walk: dry });
      LIFE60.add('flume_lowrings', RINGS, { gone: flumeGone, walk: dry });
      LIFE60.add('p31_bellyard', YARD, { gone: () => !!F().part4, walk: dry });
      LIFE60.add('p30_hollow', HOL, { gone: oakGone, walk: dry });
      LIFE60.add('clearing', CLEAR, { gone: oakGone, walk: level });
    }
  } catch (e) { console.warn('life66-small failed to register', e); }
  // the Hollows' colours are painted by js/life62-whispergrove.js; paint them for the Bell Yard too (only when it is loaded:
  // see js/malting61.js on the texture atlas)
  try {
    if (typeof window !== 'undefined' && typeof window.loadMap === 'function') {
      const _l = window.loadMap;
      window.loadMap = function (id) { try { if (id === 'p31_bellyard' && typeof LIFE62_WG !== 'undefined') LIFE62_WG.paint(); } catch (e) { /* plain */ } return _l.apply(this, arguments); };
    }
  } catch (e) { /* none */ }
  return { TEXTS, LANDING, RINGS, YARD, HOL, CLEAR, dry, level };
})();
if (typeof window !== 'undefined') window.LIFE66_SMALL = LIFE66_SMALL;
