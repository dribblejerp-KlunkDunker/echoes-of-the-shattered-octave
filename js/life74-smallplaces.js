// ============================================================
//  life74-smallplaces — the small places keep the hours (ROADMAP R10 wave 4; engine js/life60.js).
//
//  Five places, each with the people the book or the game already puts there, as people of no name (roles only), and none
//  of the named ones moved. Streets empty at night, as canon says ("The Listening Hour came down on Oakhaven with lamplight
//  and the soft sound of doors", Book One ch. 6); outside the Hedge the night belongs to the hounds.
//
//    * STILLWATER LANDING (js/flume16.js, a [PROPOSED] smugglers' wharf at the lower lock). Its trades: barrels with the
//      hoops new, oiled lashings, run-eels "taken alive and quiet" (js/festivals12.js), and Tobit Dree's news, which he
//      sells "to the Church's man, the Compact's, a woman from Cantabile with a very small hat, the Reeve's clerk, a Bores
//      factor and a boy who did not say who he worked for". [PROPOSED] Two wharf hands, an eel-catcher, three of Tobit's
//      six buyers coming to his porch at their own hours, and a lamp-trimmer at dusk. They keep to the quay, never the
//      basin. They live up the lane, on the Flume Road side. Tobit, Madge, Barnaby, the raft-wife and the hand are as built.
//    * THE LOW RINGS ("flooded ... and left"; "Boards laid roof to roof across the lane by people who needed to go on living
//      here"). [PROPOSED] Two by day only: a salvager hooking what the surge gives back, and a woman who lived on the lane
//      walking its boards. Never the deep water or the rooms. Whoever lives in the loft stays out of sight, as built.
//    * THE BELL YARD AND ASHLANE (js/grove31.js; Book One ch. 14–15). Hollows, so (as js/life62-whispergrove.js) a loop
//      by day and the Sunken Court at dusk, "the way leaves do": they walk out through the archway at six and come back
//      at five. [PROPOSED] the loops, from the trades on the name-boards and ch. 15's "carts in the carters' yard with their
//      shafts up, and horses long since gone": a lad with a plank, a carter leading a horse that is not there, a man
//      greasing a hub, a woman shaking a clean rug, a man driving a hoop, a woman with an empty basket going to market, and
//      a young man knocking twice at the midwife's door. The sweeper, the jugs, the shutters and the man against the wall
//      are the module's own and stay as they are. The lamplighter is the game's, in the Sunken Court (js/grove.js).
//    * THE HOLLOW (js/hollow30.js; Book One ch. 1, 3, 6: "the lanes behind the tannery, where the ground dipped toward the
//      Flume and the damp came up through the floorboards"). [PROPOSED] Those who can still walk: water from the well-head in
//      their own pails (the tin cup on its nail, "nobody uses it"), blankets aired against the damp, dry turves carried
//      down from the tannery side, two children playing without a sound, a woman keeping the crossing lamps lit (the Hollow
//      "does not wait on the lamplighter"), and wave 1's woman from the Hollow going up to the town at ten and back at six.
//      In by half past six: at night the Hollow hums behind its barred doors, every house at once, and the lanes are empty.
//      STAND-DOWN: while the Grafters' wagon is in (Rootday 08:00–14:00, HOLLOW30.grafting()), while their round is being
//      walked (js/grafters67.js p67 1–6), and from the Rite on, everyone goes in at their own door. Lissa Merrow and Hob
//      Wendle keep their steps.
//    * THE CLEARING OUTSIDE THE HEDGE (Book One ch. 2, 5). The Consortium's shifts on the track between the North Gate and
//      the headframe: "the night shift and the day shift", changing at six; wave 1's farmer's wife coming in by the
//      Greenroot road at first light and going home after one, so she is never in two places; [PROPOSED] a Hedge-mender at
//      the thorn by the gate ("the thorn and wadding of the Hedge"; "A wet spring had rotted some of the wadding") and a
//      woman going out to the stone ring at first light (js/stones47.js's custom). Kaelen keeps his hut and his clamps.
//      Nobody stays out after dusk. From the Rite on nobody is on the track (both shifts were "kept on" at the quarry).
//  The Hedge-side places are empty of them after the Greening, like Oakhaven. The Bell Yard's Hollows are not the Greening's.
//  No book character speaks here, so nothing is voiced. Everything is transient (js/life60.js's contract).
// ============================================================
'use strict';

const LIFE74 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI, N = -PI / 2, SO = PI / 2, W = PI;
  const F = () => { try { return (typeof G !== 'undefined' && G && G.flags) || {}; } catch (e) { return {}; } };
  const left = () => { const f = F(); return !!(f.greening || f.escaped || f.part3 || f.part4); };   // the Hedge has closed behind them
  const oak = (k) => { try { return (typeof LIFE60_OAK !== 'undefined' && LIFE60_OAK.ROSTER.find((p) => p.key === k)) || {}; } catch (e) { return {}; } };
  const FARM = oak('farmwife'), HWIFE = oak('grafterwife');
  const st = (from, to, job, at, x) => Object.assign({ from, to, job, at }, x || {});
  const home = (from, to, at) => (at ? { from, to, job: 'home', at } : { from, to, job: 'home' });
  // the floor's texture by name, so a map that adds textures later does not move the water
  const texAt = (m, x, y) => { const i = m.floorCells ? m.floorCells[y * m.w + x] : 0; return (m.floorTextures && m.floorTextures[i]) || m.floor; };
  const lvlAt = (m, x, y) => { try { return m.lvlAt ? m.lvlAt(x + 0.5, y + 0.5) : 0; } catch (e) { return 0; } };

  // ================================================================ Stillwater Landing
  const LANE = [16.5, 1.4];   // the lane up to the Flume Road: home
  const LANDING = [
    { key: 'ld_barrel', name: S('A wharf hand'), sprite: 'p60_man_a', home: LANE,
      day: [home(17, 7), st(7, 12, 'carry', [15.5, 9.7], { to2: [13.5, 14.4] }), st(12, 13, 'sit', [18.5, 14.4], { face: SO }), st(13, 17, 'carry', [15.5, 9.7], { to2: [13.5, 14.4] })],
      greet: S('"Hoops new, lids nailed, and nobody asks what sloshes. That\'s the whole trade of the wharf, and I\'m the half of it that carries."'),
      barks: [S('A wharf hand, under a barrel: "Mind your feet. Mind the edge."')] },
    { key: 'ld_rope', name: S('A wharf hand'), sprite: 'p60_man_b', home: LANE,
      day: [home(16, 8), st(8, 16, 'reach', [7.5, 16.5], { face: SO })],
      greet: S('"Every lashing on this wharf is oiled, so nothing creaks. A creak carries over the basin like a shout."'),
      work: S('"Coiling, splicing, oiling. Every rope on this wharf, every day, whether anything moves on the water or not."'),
      barks: [S('A wharf hand, low: "Oil it, and it keeps its mouth shut."')] },
    { key: 'ld_eel', name: S('An eel-catcher'), sprite: 'p60_wom_b', home: LANE,
      day: [home(12, 5.5), st(5.5, 11, 'pick', [14.6, 19.6], { face: SO }), st(11, 12, 'carry', [16.5, 2.2])],
      props: [['p60_basket', 15.2, 19.1, 0.9]],
      greet: S('"Run-eels. You take them alive and quiet, a hand under the belly, and you never let one knock the pail. The Boar pays for a quiet eel."'),
      barks: [S('An eel-catcher, to the water: "Come on. Quiet, now. Quiet."')] },
    { key: 'ld_hat', name: S('A woman with a very small hat'), sprite: 'p60_wom_c', home: LANE,
      day: [home(10.8, 8.3), st(8.3, 9, 'carry', [23.6, 9.9]), st(9, 10, 'chat', [23.6, 9.9], { face: N }), st(10, 10.8, 'carry', [16.5, 2.2])],
      greet: S('"I write for a broadsheet in Cantabile. I buy his news every week, and then I buy it again, to see whether he has changed it."'),
      barks: [S('A woman with a very small hat, writing: "...the same news... to six parties..."')] },
    { key: 'ld_clerk', name: S('The Reeve\'s clerk'), sprite: 'p60_man_c', home: LANE,
      day: [home(14.8, 12.3), st(12.3, 13, 'carry', [23.8, 9.9]), st(13, 14, 'chat', [23.8, 9.9], { face: N }), st(14, 14.8, 'carry', [16.5, 2.2])],
      greet: S('"The Reeve-Moot likes to know what goes through the lock. So does everyone. I am the only buyer on this wharf who writes it in a ledger."'),
      barks: [S('The Reeve\'s clerk, writing: "Received of the lockkeeper... one item of news..."')] },
    { key: 'ld_boy', name: S('A boy who does not say who he works for'), sprite: 'p17c_child', scale: 0.8, home: LANE,
      day: [home(17.2, 14.8), st(14.8, 15.5, 'carry', [25.4, 9.9]), st(15.5, 16.5, 'chat', [25.4, 9.9], { face: N }), st(16.5, 17.2, 'carry', [16.5, 2.2])],
      greet: S('"Who wants to know?" He looks at you. "No. Who wants to know?"'),
      barks: [S('A boy, to the lockkeeper, very low: "Same as Massday. And the bit you didn\'t tell her."')] },
    { key: 'ld_lamp', name: S('A wharf hand with a taper'), sprite: 'p16f_dockman', home: LANE,
      day: [home(19, 17), st(17, 19, 'reach', [4.5, 13.5], { to2: [29.6, 13.5] })],
      greet: S('"Lamps lit before the light goes. Out here past the Hedge you want to see a thing coming, and you want it not to hear you."'),
      barks: [S('A wharf hand with a taper: "There. And the next."')] },
  ];
  // the quay, the piers, the lane: never the basin
  const walkLanding = (m, x, y) => { const t = texAt(m, x, y); return t !== 't_water' && t !== 't_shallows'; };

  // ================================================================ the Low Rings (by day only, and only two)
  const GANGWAY = [36.4, 18.5];
  const RINGS = [
    { key: 'lr_salvage', name: S('A salvager'), sprite: 'p60_man_c', home: GANGWAY,
      day: [home(16, 9), st(9, 16, 'reach', [22.5, 27.6], { face: SO })],
      greet: S('"Hooking what floats up. The Low Rings give a little back every time the Flume over-pumps: a spoon, a shoe, once a clock. Mind the brown lumps in the lanes. They aren\'t lumps."'),
      barks: [S('A salvager, low, to the water: "Come on. Come up."')] },
    { key: 'lr_boards', name: S('A woman on the boards'), sprite: 'p60_wom_a', home: GANGWAY,
      day: [home(15, 10), st(10, 15, 'carry', [3.5, 9.5], { to2: [11.5, 9.5] })],
      greet: S('"I lived on this lane. I come and look at it. The boards were my husband\'s doing, the winter it flooded. We went roof to roof for a month before we gave up."'),
      barks: [S('A woman on the boards, to herself: "That was ours. The one with the shutter."')] },
  ];
  const walkRings = (m, x, y) => texAt(m, x, y) !== 't_water' && lvlAt(m, x, y) < 0.1;   // knee-deep lanes and boards; not the sinkholes or the rooms

  // ================================================================ the Bell Yard and Ashlane (Hollows)
  const H = S('A Hollow');
  const ARCH = [32.4, 11.5];   // the archway to the Sunken Court
  const loop = (job, at, x) => [st(5, 18, job, at, x), home(18, 5)];
  const YARD = [
    { key: 'by_plank', name: H, sprite: 'p62_hollow_a', home: ARCH, day: loop('carry', [3.5, 5.5], { to2: [20.5, 5.5] }),
      greet: S('A young man carries a plank on his shoulder from the joiner\'s door to the far end of the Yard, turns, careful of a corner that is not there, and carries it back.'),
      barks: [S('A Hollow with a plank: "...mind your backs... mind your backs..."')] },
    { key: 'by_horse', name: H, sprite: 'p62_hollow_b', home: ARCH, day: loop('carry', [28.5, 13.5], { to2: [28.5, 19.5] }),
      greet: S('A carter walks a horse round the yard by its halter. The halter is in his hand. There is no horse. At the turn he clicks his tongue at it, softly.'),
      barks: [S('A Hollow in the carters\' yard: "...walk on... walk on, girl..."')] },
    { key: 'by_grease', name: H, sprite: 'p62_hollow_c', home: ARCH, day: loop('reach', [29.5, 15.4], { face: SO }),
      greet: S('A man greasing the hub of a cart with its shafts up, working it in with his thumb. His thumb is clean. There has been no grease for three years.') },
    { key: 'by_rug', name: H, sprite: 'p62_hollow_a', home: ARCH, day: loop('hang', [13.0, 4.5], { face: N }),
      greet: S('A woman at an open door shaking out a rug, and shaking it, and shaking it. Nothing comes out of it. It has been clean for three years.'),
      barks: [S('A Hollow with a rug: "...before he\'s home... before he\'s home..."')] },
    { key: 'by_hoop', name: H, sprite: 'p62_hollow_b', home: ARCH, day: loop('hammer', [17.5, 15.6], { face: SO }),
      greet: S('A man driving a hoop down onto a barrel that is not there: three blows and a turn, three blows and a turn.') },
    { key: 'by_basket', name: H, sprite: 'p62_hollow_c', home: ARCH, day: loop('carry', [2.5, 15.5], { to2: [25.5, 15.2] }),
      greet: S('A woman with an empty basket on her arm walks the length of Ashlane towards the market, turns at the end of the lane, and walks back towards it.'),
      barks: [S('A Hollow with a basket: "...eggs, and the thread, and something for his chest..."')] },
    { key: 'by_knock', name: H, sprite: 'hollow', home: ARCH, day: loop('watch', [19.5, 14.4], { face: N }),
      greet: S('A young man at the midwife\'s door. He knocks twice, and waits, and knocks twice, and waits. Whatever he came to fetch her for was three years ago.'),
      barks: [S('A Hollow at the midwife\'s door, knocking twice: "...she said knock twice... she said wait..."')] },
  ];
  const walkYard = (m, x, y) => texAt(m, x, y) !== 't_water';   // not down the yard's old drain

  // ================================================================ the Hollow
  const TANNERY = [13.5, 1.5];   // the way up to the tannery and the town
  const HOLLOW = [
    { key: 'hw_water', name: S('A woman with a pail'), sprite: 'p60_wom_b', home: [18.5, 9.4],
      day: [home(18, 7), st(7, 12, 'carry', [17.5, 15.4], { to2: [18.5, 10.0] }), st(12, 13, 'chat', [16.6, 11.0], { face: 'hw_air' }), st(13, 15, 'scrub', [18.5, 10.0], { face: N }), st(15, 18, 'carry', [17.5, 15.4], { to2: [18.5, 10.0] })],
      greet: S('"Bring your own cup, if you\'re thirsty. Nobody drinks after anybody down here. It isn\'t catching. Everybody knows it isn\'t. We bring our own."'),
      barks: [S('A woman at the well-head, low: "Fill it, and the next, and the next."')] },
    { key: 'hw_air', name: S('A woman airing blankets'), sprite: 'p60_wom_c', home: [10.5, 12.5],
      day: [home(18, 8), st(8, 12, 'hang', [5.6, 11.5], { face: N }), st(12, 13, 'chat', [17.6, 11.2], { face: 'hw_water' }), st(13, 17, 'hang', [5.6, 11.5], { face: N }), st(17, 18, 'carry', [5.6, 11.5], { to2: [10.5, 12.5] })],
      props: [['p60_line', 5.6, 10.7, 0.9, 0]],
      greet: S('"Out of the damp, Rooke says. So the blankets come out every morning the sun shows, and every evening they go in as damp as they came out. Water finds the Hollow. It always has."'),
      barks: [S('A woman at a line of blankets, softly: "If it holds off. If it only holds off."')] },
    { key: 'hw_turf', name: S('A man with a barrow of turves'), sprite: 'p60_man_b', home: [12.5, 4.5],
      day: [home(17, 7), st(7, 11, 'carry', [13.5, 2.2], { to2: [20.4, 18.2] }), st(11, 12, 'sit', [19.4, 18.4], { face: W }), st(12, 17, 'carry', [13.5, 2.2], { to2: [3.5, 12.4] })],
      props: [['p60_cart', 14.6, 2.9, 0.75, SO]],
      greet: S('"Dry turves for the hearths. A wet house is a growing house. You keep the fire in, and you keep still, and you hum."'),
      work: S('"Up to the tannery yard for the turves, down the lane with them, a barrow to every door that has nobody left to fetch its own. Most of them, now."'),
      barks: [S('A man with a barrow, a breath: "Turves. Dry ones. Mind the wheel."')] },
    { key: 'hw_kidA', name: S('A child of the Hollow'), sprite: 'p17c_child', scale: 0.7, home: [20.4, 17.5],
      day: [home(17.5, 9), st(9, 12, 'play', [17.8, 18.4], { area: 1.4 }), home(12, 13), st(13, 17.5, 'play', [17.8, 18.4], { area: 1.4 })],
      greet: S('"We\'re playing Stumps. You stand like a stump and the other one has to make you laugh without a sound. I always win. I never laugh."'),
      barks: [S('A child, in the Narrow, fierce: "You moved. You moved. You\'re it."')] },
    { key: 'hw_kidB', name: S('A child of the Hollow'), sprite: 'p17c_child', scale: 0.66, home: [12.5, 17.5],
      day: [home(17.5, 9), st(9, 12, 'play', [17.8, 18.4], { area: 1.4 }), home(12, 13), st(13, 17.5, 'play', [17.8, 18.4], { area: 1.4 })],
      greet: S('She sits down in front of you with her hands palm-up on her knees. "That\'s how you sit, so they don\'t touch anything. Everybody down here sits like that."'),
      barks: [S('A child, laughing without a sound, one hand over her mouth.')] },
    { key: 'hw_lamps', name: S('A woman who keeps the lamps'), sprite: 'p60_wom_a', home: [10.5, 9.4],
      day: [home(18, 7), st(7, 9, 'reach', [12.8, 9.6], { to2: [20.4, 12.6] }), home(9, 16), st(16, 18, 'reach', [2.0, 10.0], { to2: [27.0, 11.6] })],
      greet: S('"Every lamp in the Hollow burns all day and all night. Up in the town they wait for the lamplighter. Down here we don\'t wait for anybody."'),
      barks: [S('A woman at a hush-lamp, trimming it: "Burn. Burn steady."')] },
    { key: 'hw_wife', name: HWIFE.name || S('A woman from the Hollow'), sprite: 'p60_wom_c', home: [26.5, 9.4],
      day: [home(18.5, 9.5), st(9.5, 10, 'carry', TANNERY), home(10, 18, TANNERY), st(18, 18.5, 'carry', [26.5, 9.4])],
      greet: S('"Soft food, for him. Bettany has a way with a broth. I go up every day and bring back something he can manage, and every day he manages a little less of it."'),
      barks: [S('A woman from the Hollow, under her breath: "Up and back. Up and back."')] },
  ];

  // ================================================================ the clearing outside the Hedge
  const GATE = [20.5, 34.5], HEADFRAME = [20.5, 5.6], ROAD = [38.4, 33.5], RING = [38.4, 26.5];
  const dayShift = (k, dx, t) => ({ key: k, name: S('A quarryman, day shift'), sprite: ['p60_man_c', 'p60_man_a', 'p60_man_b'][dx], home: GATE,
    day: [home(18.5, 6 + t), st(6 + t, 6.7, 'carry', [20.5 + (dx - 1) * 0.5, 6.2]), home(6.7, 17.5, HEADFRAME), st(17.5, 18.5, 'carry', [20.5 + (dx - 1) * 0.5, 33.4])] });
  const nightShift = (k, dx, t) => ({ key: k, name: S('A quarryman, night shift'), sprite: ['p60_man_b', 'p60_man_c'][dx], home: GATE,
    day: [home(6.7, 17.5 + t), st(17.5 + t, 18.4, 'carry', [20.0 + dx, 6.2]), home(18.4, 6, HEADFRAME), st(6, 6.7, 'carry', [20.0 + dx, 33.4])] });
  const CLEARING = [
    Object.assign(dayShift('cl_dayA', 0, 0), {
      greet: S('"Day shift. Down at six, up at the Listening Hour, and nobody says a word on the track. Hounds."'),
      work: S('"The pumps, mostly. Twelve men on them and the bore in your teeth the whole nine hours. You get home and your supper tastes of glass."'),
      barks: [S('A quarryman, low: "Nine hours on the pumps."')] }),
    Object.assign(dayShift('cl_dayB', 1, 0.1), {
      greet: S('He looks at the Legion line at the headframe, then at you, and shakes his head very slightly, which is all the conversation the track allows.'),
      barks: [S('A quarryman, a breath: "Feel it? Deeper than yesterday."')] }),
    Object.assign(dayShift('cl_dayC', 2, 0.2), {
      greet: S('"Don\'t look at the glass man\'s hut. Nobody does. The hounds won\'t go near him. The Grafters say it\'s the glass."'),
      barks: [S('A quarryman, very low: "Walk. Don\'t talk. Walk."')] }),
    Object.assign(nightShift('cl_nightA', 0, 0), {
      greet: S('"Night shift. The quarry\'s lit all night, green-gold, so it\'s never dark down there. You come up in the morning and the sun looks wrong."'),
      barks: [S('A quarryman of the night shift, low: "There\'s the day lot. Poor sods."')] }),
    Object.assign(nightShift('cl_nightB', 1, 0.15), {
      greet: S('"Out before the gate\'s barred, in after it opens. Twelve hours past the Hedge, and every one of them listening."'),
      barks: [S('A quarryman of the night shift: "Gate\'s open. In we go."')] }),
    { key: 'cl_farmwife', name: FARM.name || S('A farmer\'s wife from the clearing'), sprite: FARM.sprite || 'p60_wom_a', home: ROAD,
      day: [home(13.5, 6.3), st(6.3, 7, 'carry', [20.5, 33.6]), home(7, 13, GATE), st(13, 13.5, 'carry', [37.6, 33.5])],
      greet: FARM.greet || S('"Eggs from the clearing for Bettany. Six dozen, and the hens laying again for the first time since spring."'),
      barks: FARM.barks || [S('A farmer\'s wife, low: "Eggs. Mind the eggs."')] },
    { key: 'cl_hedge', name: S('A Hedge-mender'), sprite: 'p60_man_a', home: GATE,
      day: [home(16, 8), st(8, 12, 'reach', [17.5, 34.3], { to2: [23.5, 34.3] }), st(12, 13, 'sit', [22.5, 33.4], { face: N }), st(13, 16, 'reach', [17.5, 34.3], { to2: [23.5, 34.3] })],
      greet: S('"Wadding. Wool and moss, packed into the thorn so it eats the sound. A wet spring rots it. You find the thin places before something else does."'),
      work: S('"I go along the outside of the Hedge with a sack and a stick and push it in where it\'s gone thin. Inside, they never see it done. That\'s the idea."'),
      barks: [S('A Hedge-mender, pushing wadding into the thorn: "There. Eat that."')] },
    { key: 'cl_stone', name: S('A woman going out to the ring'), sprite: 'p60_wom_c', home: GATE,
      day: [home(8.2, 6.05), st(6.05, 6.8, 'carry', RING), home(6.8, 7.4, RING), st(7.4, 8.2, 'carry', [20.5, 33.6])],
      greet: S('"My mother\'s stone is out at the ring, at the foot of the Root. I go out every morning the gate is open and see that it\'s still there. It always is."'),
      barks: [S('A woman on the path to the ring, softly: "Still there. Still there."')] },
  ];
  const walkClearing = (m, x, y) => texAt(m, x, y) !== 't_water' && lvlAt(m, x, y) < 0.05;   // the level ground: not the Watch-stone or the rise

  // ================================================================ stand-downs and registration
  const grafting = () => { try { return typeof HOLLOW30 !== 'undefined' && !!HOLLOW30.grafting(); } catch (e) { return false; } };
  const round = () => { const s = Number(F().p67) | 0; return s >= 1 && s <= 6; };
  const DOWN = {
    p30_hollow: () => grafting() || round() || !!F().rite_started,
  };
  const GONE = {   // the Bell Yard's Hollows are not the Greening's: never gone
    flume_landing: left,
    flume_lowrings: left,
    p30_hollow: left,
    clearing: () => left() || !!F().rite_started,   // from the Rite on both shifts are "kept on" at the quarry
  };
  const WALK = { flume_landing: walkLanding, flume_lowrings: walkRings, p31_bellyard: walkYard, clearing: walkClearing };   // the Hollow: all of it
  const ROSTERS = { flume_landing: LANDING, flume_lowrings: RINGS, p31_bellyard: YARD, p30_hollow: HOLLOW, clearing: CLEARING };

  try {
    if (typeof LIFE60 !== 'undefined') for (const id in ROSTERS) LIFE60.add(id, ROSTERS[id], { gone: GONE[id], down: DOWN[id], walk: WALK[id] });
  } catch (e) { console.warn('life74 failed to register', e); }
  // the Bell Yard's Hollows wear wave 2's colours, which js/life62-whispergrove.js paints when the city or the Yard is loaded
  return { TEXTS, ROSTERS, WALK, down: DOWN, gone: GONE };
})();
if (typeof window !== 'undefined') window.LIFE74 = LIFE74;
