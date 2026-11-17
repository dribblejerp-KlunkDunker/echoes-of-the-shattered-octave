// ============================================================
//  pilgrim95 — the Dawning Heights, part three: the Pilgrim Chain and the Altar (Phase 95; plan: Phase 89 and Phase 90,
//  approved 14 Nov 2026; built 16 Nov on the owner's "I accept all, merge and proceed").
//
//  WHAT THE BOOK MADE OF THE PLAN (Book Two ch. 13 and 14; the book wins):
//   * The chain's city end is the seventh anchor-house on the south-east rim: "A squat stone tower on the rim like the
//     others, but whole, with a slate roof, because the Church had kept it", with the winch and two Flambeaux "keeping the
//     winch for the Church". Phase 90's "pilgrims' hostel" is the old robing-room under it, in the frame [PROPOSED].
//   * "The cage is the shadow. It's the only roof on that whole chain." So there is no canopy-station half-way: the
//     half-way rest is the cage itself, standing on its cable with its brake set at the Lumina drum [PROPOSED rest].
//   * The cable runs "beside the walkway on iron rollers, a kilometre of it, to a second drum on Lumina", so the shortcut
//     is the cage on its cable, not a rope-slide.
//   * The Bleach parts round glass-fire: "each man in crimson came along the chain in a little moving bubble of ordinary
//     shade". On the chain a Flambeau's fire is shade. (Phase 92 had said the Bleach follows it; that is put right too.)
//   * Glass-fire burns on its bearer's faith (Crane's censer gutters as his goes; two dead men's censers burn on "because
//     their faith had not had time to go out"). So the keeper is not killed: his fire goes out.
//   * By day the white "was joined by a second light… and the two of them together were more than anything could stand
//     in". By night there is only the sourceless white. So the dead hour is the safe hour, as Phase 90 had it.
//   * The Altar: "a disc of white stone two hundred feet across"; "The great steps"; "The pillars round its rim, which had
//     been gilded, were white"; the old chapels above it, their people "still in them, at their prayers, seven years thin";
//     the Vessel's stone, "a step high and ten feet across"; the Eye, "Forty feet across. Bronze, once", white now but for
//     "a circle of bright bronze the size of a cartwheel", polished "every day for seven years with oil and ash".
//  The Rite is Book Two's, a month on (13 Ashfall 419). In Harvestmonth the Altar choir holds the note under one ring of
//  canopies [PROPOSED: the book's ten rings are the Rite's]; the player reaches the rim and never sets foot on the disc.
//
//  THE ROOMS (Phase 90's nine, each kept):
//    1 the chain's foot             the robing-room: white robes in rows, black canopies stacked; Perpetua Lisle [PROPOSED]
//    2 the hostel lamp              in the robing-room
//    3 the first span (hazard)      "Walk in the shade of the one ahead of you. If there is no one ahead of you, run."
//                                   Choir shifts go out and back under canopies; outside their shade the Bleach takes you
//    4 the half-way rest (a lamp)   the cage
//    5 the second span (hazard)     no canopies: the Flambeaux of the Chain walk it, each in the shade of his own fire
//    6 the Glass-Grown's slope      (a secret) down a ladder to Lumina's shoulder; they face the Eye; walk
//    7 the chain's far end          the keeper: Brother-Captain Aurel Sant [PROPOSED], on the lowest step, with glass-fire
//    8 the Altar's rim (a lamp)     under the black canopies
//    9 the Altar and the Eye        seen, not entered
//  Shortcut: the cage, between the half-way mark and the Lumina winch, once the Brother-Captain's fire is out.
//  THE SOULS RULES: three shade-lamps (group 'j'); the keeper's week (his fire is lit again); a Piece here rings at 528.
//  Flags (small ints): p95_robe (the robe is on: the mouth is open), p95_cage, p95_kdrop, p95_seen (bits).
// ============================================================
'use strict';

const PILGRIM95 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const MAP = 'p95_chain', HOUSE = 'p95_house', ANCH = 'p94_anchorage';
  const W = 64, H = 266, HW = 56, HH = 30, VOID_Z = -40, CX = 33;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('pilgrim95: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (x * 374761393 + y * 668265263) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65535; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5600); } catch (e) { /* cosmetic */ } };
  // the chain rises very gently to Lumina; the great steps rise from the shelf to the Altar
  const SHELF = 200, STEPS = 218, RIM = 226, RISE = 0.02, STEP_RISE = 0.4;
  const hv = (vy) => vy <= 5 ? 0 : vy <= SHELF ? (vy - 5) * RISE : vy <= STEPS ? (SHELF - 5) * RISE : vy <= RIM ? (SHELF - 5) * RISE + (vy - STEPS) * STEP_RISE : (SHELF - 5) * RISE + (RIM - STEPS) * STEP_RISE;
  const lvlAt = (j) => hv(j + 0.5);
  const SLOPE = [37, 178, 50, 198];   // the Glass-Grown's slope: x0, y0, x1, y1
  const slopeH = (vy) => hv(vy) - 6 + (vy - SLOPE[1]) * 0.12;

  // ================================================================ the words ([PROPOSED] unless the comment names a book)
  const TX = {
    name: S('Sol-Luminary: the Pilgrim Chain'),
    nameHouse: S('Sol-Luminary: the Seventh Anchor-House'),
    // the ways in and out
    doorAnch: S('An iron stair up through the frame. A plain disc on a stand is stamped on its door: the pilgrims\' sign. The robing-room'),
    doorBack: S('The iron stair, back down to the winch-room'),
    arriveHouse: S('The old robing-room, under the seventh anchor-house. Four hundred white robes hang in rows in the dark, and none but the choir\'s has been out in the light for seven years.'),
    robes: S('Pilgrims\' robes on their pegs: white linen, a number stitched at each neck. They have been washed. They have not been worn.'),
    canopies: S('Canopies, folded and stacked: black silk on black poles. The Church walks its choir up the chain under these.'),
    copper: S('A wash-copper, still warm.'),
    perpetua: S('Perpetua Lisle'),
    stairUp: S('The stair up, into the anchor-house'),
    arriveTower: S('The seventh anchor-house: a squat stone tower on the rim, whole, with a slate roof, because the Church has kept it. The chain comes in at the mouth out of the white, and goes down through the iron ring in the floor.'),
    ring: S('The iron ring, ten feet across, sunk in the stone. The Pilgrim Chain goes down through it into the city\'s frame.'),
    winch: S('The winch: an iron drum the height of a man, a brake-wheel like a ship\'s wheel, a lever as long as an oar. Its cable runs out beside the walkway on iron rollers, a kilometre of it, to a second drum on Lumina.'),
    warden: S('A Flambeau of the winch'),
    northDoor: S('The door to the ramp, and the white streets of the top tier'),
    northLock: S('It is barred on this side. White light stands in the crack under it like water.'),
    mouth: S('The mouth of the anchor-house: the walkway, and the white'),
    mouthLock: S('Two Flambeaux in crimson look at you over their censers. "Choir and bearers," says one. "Nobody else has walked it since the Fracture."'),
    mouthPass: S('"Bearer," says the Flambeau. He looks at the robe, not at you. "Your canopy has gone. Catch it."'),
    mouthBack: S('The mouth of the anchor-house, and its shadow'),
    smell: S('Glass-fire has a smell: hot metal and honey, and something sharp underneath, like a struck flint.'),
    // the chain
    arriveChain: S('The Pilgrim Chain. A kilometre of black link going out into the white, almost level, and on its back an iron deck with a rail at either hand, polished by four hundred years of feet. The Spire is on your right hand, shining. You cannot look at it.'),
    saying: S('Walk in the shade of the one ahead of you. If there is no one ahead of you, run.'),
    bleachOn: S('The light is on you. It is taking the colour out of your hands.'),
    shadeIn: S('Shade. The light goes on round you.'),
    party: S('A choir shift under its canopy: white robes, black silk on black poles, and nobody looking to either side.'),
    rail: S('The rail, at waist height. Beyond it, the gulf.'),
    roller: S('An iron roller, and the cable lying in it: the cage\'s cable.'),
    link: S('A link of the Pilgrim Chain: black adamantine, as long as a ship\'s boat.'),
    spire: S('The Dawning Spire, across the gulf. The crack in its flank is black: the only black thing for a mile, but the chains.'),
    peaks: S('The peaks, two thousand feet down, pale as teeth.'),
    rim0: S('The rim of the city: a curved parapet of white stone, and the top tier behind it, white.'),
    lost: S('the Bleach, on the Pilgrim Chain'),
    // the hours
    sunUp: S('The sun has cleared the peaks. Two lights now, the white and the sun, and the two together are more than anything can stand in.'),
    night: S('Night. Only the sourceless white, as it has lain here every night for seven years.'),
    deadHour: S('The dead hour. The sun is as far under Lumina as it goes, and the white lies thinnest now.'),
    cardName: S('The Bleach'), cardDay: S('sun up'), cardNight: S('night'), cardDead: S('the dead hour'), cardShade: S('in shade'), cardLight: S('in the light'),
    // the cage
    cage: S('The cage: a long low carriage of black iron under a canopy of black silk, on its cable. It is the only roof on the whole chain.'),
    cageRest: S('The cage stands at the half-way mark with its brake set at the Lumina drum. The Church rests it here between offices.'),
    cageGrip: S('The cage\'s grip, locked on the cable. The cable is braked from Lumina'),
    cageGripOpen: S('The cage\'s grip. Ride it up the chain to the Lumina winch'),
    cageShut: S('The grip will not come off the cable. The brake is on at the Lumina drum, a long way up the chain.'),
    cageUp: S('You let off the grip. The cage goes up the chain on its cable at a walking pace. You sit in the shade of the black silk and watch the gulf go by through the gap.'),
    cageDown: S('The cage takes you back down the chain to the half-way mark.'),
    cowlFound: S('A bearer\'s cowl, left on the bench of the cage.'),
    winchL: S('The Lumina winch-house: the second drum. The Church\'s winch-men stand to it, behind the Brother-Captain\'s fire'),
    winchLOpen: S('The Lumina drum. Wind the cage and ride it down'),
    winchShut: S('The winch-men will not let you near the drum while the Brother-Captain\'s fire stands.'),
    winchFree: S('The winch-men have gone up the steps. You take the brake off the Lumina drum, and half a kilometre away the cage shifts on its cable. It will carry you both ways now.'),
    // the second span
    second: S('Past the cage there are no more canopies. The Flambeaux walk this half, each in the light of his own censer. The white parts round glass-fire, and leaves a little moving round of ordinary shade.'),
    flambeau: S('A Flambeau of the Chain'),
    flambeauDesc: S('A brother of the Flambeaux, in crimson, his censer lit on its chain. The Bleach parts round glass-fire: he walks the chain in his own shade.'),
    flambeauDown: S('The Flambeau sits down against the rail with his censer in his lap. The fire in it has not yet heard. It burns on, white-gold, and the shade stays round it a while.'),
    censer: S('A censer on the deck, still burning. The shade round it will not last.'),
    censerOut: S('The censer gutters, climbs once, and goes out. The white comes back over the deck.'),
    whites: S('In the whites you are a bearer to them, until you are near enough for a face.'),
    // the slope
    ladder: S('A gap in the rail, and an iron ladder going down onto the mountain\'s shoulder'),
    ladderUp: S('The iron ladder, back up to the walkway'),
    slope: S('Lumina\'s shoulder, below the Altar. They stand all down the slope, facing the Eye, and every one of them is sounding. Walk.'),
    gg: S('One of the Glass-Grown, facing the Eye across the Altar. It sounds five hundred and twenty-eight, without a breath.'),
    ggTurn: S('You were not quiet. All down the slope they turn their heads, and the one note leans toward you.'),
    stripe: S('The stripe of the chain\'s shadow, lying down the slope. It falls the wrong way: away from the Spire.'),
    sandalsFound: S('A pair of sandals at the head of the slope, side by side, the way you leave shoes at a door.'),
    // the far end, the keeper
    farEnd: S('The chain\'s far end, made fast in the white rock of Lumina. A shelf of stone, the winch-house, and the great steps going up to the Altar. A man in crimson stands on the lowest step with a fire-stave, and the white parts round him.'),
    madeFast: S('The Pilgrim Chain, made fast in the mountain.'),
    keeperName: S('Brother-Captain Aurel Sant'),
    keeperDesc: S('Brother-Captain of the Flambeaux of the Chain. He holds the steps with glass-fire, and his faith is in good repair: the fire stands as high as his forearm.'),
    keeperSees: S('"No bearer walks alone," says the Brother-Captain. "And no pilgrim has walked at all in seven years. Stand in the Light, and be corrected."'),
    castFire: S('He swings the stave, and glass-fire falls where you stood. It burns. And round it, for a few steps, the white stands off.'),
    burn: S('glass-fire'),
    keeperDown: S('The fire in his stave sinks, climbs once with an effort you can almost see, and goes out. Brother-Captain Aurel Sant lays the dark stave down on the stone, and a folded paper beside it. Then he kneels, and does not look up.'),
    kneel: S('Brother-Captain Aurel Sant, kneeling by the lowest step with his hands open. His fire is out. He is waiting for it.'),
    // the Altar
    steps: S('The great steps, white, going up to the Altar.'),
    rim: S('The Altar\'s rim. Black silk on black poles, and under it, in the shade, the Altar choir holding the Pure Note in their shifts. It comes up off the stone like heat off a road: five hundred and twenty-eight.'),
    canopy: S('A canopy of the Altar: black silk on black poles.'),
    pillar: S('A pillar of the Altar\'s rim. It was gilded. It is white.'),
    line: S('A Flambeau of the line, his stave grounded. Nobody goes onto the Altar who is not choir.'),
    lineSay: S('The line of Flambeaux does not move and does not speak. The staves come down across the gap, all together, and the glass-fire stands up in the cages.'),
    altar: S('The Altar of Lumina: a disc of white stone two hundred feet across, cut into the shoulder of the mountain, facing the Spire across the gulf. It was white before. It is whiter now.'),
    vessel: S('The Vessel\'s stone, at the centre: a round dais a step high. There has always been a singer on it at the dawn office, a child, the best treble of the Basilica school. At this hour it is empty.'),
    eye: S('The Eye, on its frame of white iron, forty feet across. It was bronze, polished to a mirror: the only mirror the Altar permits in all the Heights. It has gone white as the inside of a shell, but for a circle at its centre the size of a cartwheel, bright bronze, facing the Spire.'),
    polisher: S('A cleric of the Altar on the frame, polishing the bright circle with oil and ash, as one of them has every day for seven years.'),
    choir: S('The Altar choir under its canopy, holding the one note. They are paler than their robes.'),
    chapel: S('An old pilgrims\' chapel, cut in the mountainside above the Altar. Somebody is still in it, at prayer, seven years thin. You do not look for long.'),
    // lamps (the Souls rules)
    lampRobing: S('The robing-room'), lampCage: S('The cage, at the half-way mark'), lampRim: S('The Altar\'s rim'),
    lampLabel: S('A shade-lamp on an iron post, unlit: a hood of black tin over the glass. Stand by it to light it.'),
    lampLit: S('A shade-lamp on an iron post, burning under its black hood. Use it to rest.'),
    // the gear
    robe: S('Pilgrim\'s Robe'), robeDesc: S('A pilgrim\'s robe of white linen, a number stitched at the neck. In the old days the whole city walked the chain in these every dawn, and sang.'),
    cowl: S('Bearer\'s Cowl'), cowlDesc: S('A canopy-bearer\'s cowl of black silk, cut from the same bolt as the canopies.'),
    sandals: S('Pilgrim\'s Sandals'), sandalsDesc: S('Rope-soled sandals, bleached white. Whoever left them at the head of the slope went on barefoot.'),
    stave: S('The Dark Stave'), staveDesc: S('A Flambeau\'s fire-stave: black iron as tall as a man, an iron cage at its head, and in the cage a fist of amber glass, cold. They say glass-fire burns on its bearer\'s faith. This one is waiting for somebody\'s.'),
    warrant: S('A Brother-Captain\'s Warrant'), warrantDesc: S('A warrant of the Altar under a white seal: to hold the Pilgrim Chain against all but choir and bearers, and to correct by fire.'),
    setName: S('The Pilgrim Chain'), setT: S('in the whites, the Flambeaux of the Chain take you for a bearer until you are close'), setF: S('leaving shade, the Bleach waits three breaths before it begins on you'),
  };
  const SAY = {
    perpetua: {
      greet: {
        polite: S('Light keep you true. Mind the hems, they are clean.'),
        normal: S('Seven years I have had nobody to robe. Stand still and let me see the length of you.'),
        blunt: S('You cast, I will say that for you. Do not drip on the linen.'),
      },
      topics: {
        [S('The robes')]: S('Four hundred. I wash every one each spring and hang it back on its peg, and nobody has put one on since the Fracture but the choir. In the old days the whole city went out at dawn in these. You walked out over the gulf with the Spire on your right hand, shining, and you sang.'),
        [S('The chain')]: S('A kilometre, almost level, and not a roof on it but the cage. The Tiers teach it to their children as soon as they can walk: walk in the shade of the one ahead of you. If there is no one ahead of you, run.'),
        [S('The canopies')]: S('Black silk on black poles. The Church walks its choir up under them in shifts, like a procession of black mushrooms. Keep under one and the light goes on round you. Step out, and it begins.'),
        [S('The Flambeaux')]: S('Two upstairs, keeping the winch. They let choir and bearers out of the mouth and nobody else. They look at the robe. They have never once looked at a face. Past the cage it is the Brother-Captain\'s half, Aurel Sant\'s. His men walk it in their own fire: the white parts round glass-fire.'),
        [S('The dead hour')]: S('The white never goes out. But when the sun is up there are two lights on the chain, and the two together are more than anything can stand in. Go by night. Go at the dead hour if you can: it lies thinnest then.'),
        [S('The Eye')]: S('Bronze, forty feet across, at the back of the Altar. The only mirror in the Heights that is not a crime. It has gone white like everything, all but the middle, where they polish it every day with oil and ash. I have not seen it in seven years. I can tell you exactly what it looks like.'),
      },
    },
    warden: {
      greet: { polite: S('Light keep you true.'), normal: S('State your office.'), blunt: S('Low-pitched. Speak up, or go back down the hole you came out of.') },
      topics: {
        [S('The winch')]: S('Choir and bearers. Nobody else has walked the chain since the Fracture, and nobody else will while this winch is kept.'),
        [S('The Brother-Captain')]: S('Brother-Captain Sant has the far end, and the steps. His fire has not dipped in seven years. Ask him what yours is doing.'),
        [S('The Light')]: S('There is one note. The second note is sin.'),
      },
    },
  };

  // ================================================================ the plan (cells; the deck is two wide, x 32 and 33)
  const P = {
    // the house: the robing-room (in the frame) and the seventh anchor-house (on the rim)
    hDoor: [5, 14], hArrive: [6.7, 14.5], anchDoor: [51, 9], anchOut: [50.3, 9.5],
    robing: [6, 8, 26, 22], lamp1: [9.5, 20.5], perpetua: [16.5, 13.5],
    stair: [27, 14, 37, 15], tower: [44.5, 14.5, 5.3], ringC: [44, 14], winch: [41.4, 12.3], wardens: [[42.6, 18.6], [46.4, 18.6]],
    northDoor: [44, 8], mouthDoor: [44, 20], mouthIn: [44.5, 18.9],
    // the chain
    arrive: [33, 6.4], span1: [9, 101], cage: [104, 107], lamp2: [32.3, 105.5], cowl: [33.5, 104.7], grip: [33.78, 107.4], cageRide: [33, 106.5],
    span2: [108, 199], ladderTop: [33.8, 190.5], ladderBot: [37.35, 190.5], slopeIn: [38.6, 190.5], sandals: [45.5, 197.4],
    shelf: [21, 200, 45, 217], winchL: [24.3, 204.5], winchRide: [26.6, 204.5], keeper: [33, 216.3], kneel: [31.1, 216.8],
    stepsX: [28, 38], rimWalk: [19, 226, 47, 229], lamp3: [22.5, 228.3], pillarRow: 230,
    altar: [33, 246, 15], eye: [33, 259.9], vessel: [32, 245, 33, 246],
  };
  const SENTRIES = [[120, 112, 132], [146, 136, 156], [170, 160, 180], [192, 183, 198]];   // y, lowest y, highest y
  const GG = [[41.5, 181.5], [44.6, 180.4], [47.5, 182.6], [42.4, 185.4], [46.2, 186.5], [49.0, 188.4], [41.2, 189.6], [44.4, 191.5], [47.6, 193.2], [42.6, 195.0], [48.6, 196.2]];
  const FLOORS = ['t_p95_deck', 't_p95_stone', 't_p95_white', 't_p95_step', 't_p95_altar', 't_p95_slope', 't_p95_shadow'];
  const DECK = 0, STONE = 1, BLOCKED = 2, STEP = 3, ALTAR = 4, SLOPEF = 5, SHADOW = 6;
  const HFLOORS = ['t_p95_flag', 't_p95_deck', 't_p95_white', 't_p95_ring0', 't_p95_ring1', 't_p95_ring2', 't_p95_ring3'];

  // ---------------------------------------------------------------- the choir shifts on the first span: the place's own clock
  const PARTIES = 8, PARTY_SPEED = 1.25, PARTY_SHADE = 1.5;
  let clock = 0;
  function partyAt(i, t) {
    const [y0, y1] = P.span1, len = y1 - y0, loop = len * 2;
    const s = (((t * PARTY_SPEED + i * loop / PARTIES) % loop) + loop) % loop;
    const out = s < len;
    return { x: out ? CX + 0.45 : CX - 0.45, y: out ? y0 + s : y1 - (s - len), out };
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
    const g = (v) => `rgb(${v},${v},${v + 3})`;
    const wh = (v, warm) => `rgb(${v},${v - (warm ? 2 : 0)},${v - (warm ? 10 : 2)})`;
    if (Engine.addTexture) {
      // the walkway: iron deck plates, polished bright down the middle by four hundred years of feet
      tex('t_p95_deck', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const worn = Math.max(0, 1 - Math.abs(i - 32) / 22); px(x, g(26 + (h2(i, j) * 10 | 0) + (worn * 34 | 0) - ((j % 32) === 0 ? 14 : 0)), i, j); }
        for (const j of [4, 36]) for (const i of [3, 60]) { px(x, g(70), i, j, 2, 2); px(x, g(12), i, j + 2, 2, 1); }
      });
      tex('t_p95_white', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(236 + (h2(i, j) * 6 | 0), 1), i, j); });
      // dressed white stone, bleached: the joints are the only thing left to see
      tex('t_p95_stone', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (j % 32) === 0 || ((i + ((j >> 5) & 1) * 16) % 32) === 0; px(x, wh((joint ? 206 : 228) + (h2(i, j) * 8 | 0), 1), i, j); } });
      tex('t_p95_step', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const e = j % 16; px(x, wh((e === 0 ? 190 : e < 3 ? 214 : 230) + (h2(i, j) * 6 | 0), 1), i, j); } });
      tex('t_p95_altar', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const ring = (Math.hypot(i - 32, j - 32) | 0) % 16 === 0; px(x, wh((ring ? 222 : 240) + (h2(i, j) * 5 | 0), 1), i, j); } });
      tex('t_p95_slope', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(212 + (h2(i >> 2, j >> 2) * 16 | 0) + (h2(i, j) * 8 | 0), 1), i, j); });
      tex('t_p95_shadow', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(96 + (h2(i >> 2, j >> 2) * 14 | 0) + (h2(i, j) * 8 | 0)), i, j); });
      // the city's rim, and the tower's face: white stone in courses
      tex('t_p95_rim', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 4, off = (row & 1) * 16, joint = (j % 16) === 0 || ((i + off) % 32) === 0; px(x, wh((joint ? 198 : 224) + (h2(i, j) * 8 | 0), 1), i, j); } });
      tex('t_p95_lumina', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 214 + (h2(i >> 3, j >> 2) * 18 | 0) + (h2(i, j) * 8 | 0) - (h2(i >> 4, j >> 4) < 0.2 ? 14 : 0); px(x, wh(v, 1), i, j); } });
      // a pillar of the rim: fluted, white, the last of the gilt in the flutes
      tex('t_p95_pillar', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const fl = i % 8; px(x, wh((fl === 0 ? 196 : fl < 3 ? 216 : 234) + (h2(i, j) * 5 | 0), 1), i, j); } for (let k = 0; k < 22; k++) px(x, '#d8c890', (h2(k, 4) * 8 | 0) * 8, (h2(k, 9) * 60) | 0, 1, 2); px(x, wh(204, 1), 0, 0, 64, 4); px(x, wh(204, 1), 0, 60, 64, 4); });
      // an old pilgrims' chapel, cut in the mountainside: a dark arch, and somebody still in it, kneeling, seven years thin
      tex('t_p95_chapel', (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(216 + (h2(i >> 3, j >> 2) * 16 | 0) + (h2(i, j) * 6 | 0), 1), i, j);
        x.fillStyle = '#8c8a86'; x.beginPath(); x.moveTo(18, 62); x.lineTo(18, 30); x.quadraticCurveTo(32, 8, 46, 30); x.lineTo(46, 62); x.closePath(); x.fill();
        x.fillStyle = '#b4b2ac'; x.beginPath(); x.moveTo(22, 62); x.lineTo(22, 32); x.quadraticCurveTo(32, 16, 42, 32); x.lineTo(42, 62); x.closePath(); x.fill();
        px(x, '#e4e2dc', 30, 40, 4, 5); px(x, '#e4e2dc', 29, 45, 6, 10); px(x, '#e4e2dc', 28, 55, 9, 5); px(x, '#e4e2dc', 34, 47, 4, 2);   // the kneeler, pale as the stone
      });
      tex('t_p95_vessel', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(226 + (h2(i, j) * 6 | 0) - (j < 3 || j > 60 ? 18 : 0), 1), i, j); });
      // the cage's side: black iron bars and a bench
      tex('t_p95_cageside', (x) => { px(x, g(10), 0, 0, 64, 64); for (let i = 2; i < 64; i += 10) { px(x, g(44), i, 0, 3, 64); px(x, g(70), i, 0, 1, 64); } px(x, g(52), 0, 2, 64, 3); px(x, g(52), 0, 30, 64, 3); px(x, '#2a2018', 0, 44, 64, 6); px(x, '#3a2c20', 0, 44, 64, 1); px(x, g(40), 0, 60, 64, 4); });
      // the mouth, from the chain: a dark doorway in white stone
      tex('t_p95_mouth', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(222 + (h2(i, j) * 8 | 0), 1), i, j); px(x, '#1a1816', 6, 4, 52, 60); px(x, '#2c2824', 6, 4, 52, 3); px(x, '#0c0a0a', 12, 10, 40, 54); });
      // the house: black stone flags, slates on rafters, the frame's stone, the tower's stone (white outside, grey within)
      tex('t_p95_flag', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (j % 32) === 0 || ((i + ((j >> 5) & 1) * 16) % 32) === 0; px(x, g((joint ? 14 : 30) + (h2(i, j) * 10 | 0)), i, j); } });
      tex('t_p95_slate', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 3, off = (row & 1) * 6; px(x, g(22 + (h2((i + off) / 12 | 0, row) * 10 | 0) + ((j % 8) === 0 ? -10 : 0) + (((i + off) % 12) === 0 ? -8 : 0)), i, j); } px(x, '#2a1c12', 0, 28, 64, 6); px(x, '#3a2a1c', 0, 28, 64, 1); });
      tex('t_p95_towerwall', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const row = j >> 4, off = (row & 1) * 16, joint = (j % 16) === 0 || ((i + off) % 32) === 0; px(x, g((joint ? 70 : 104) + (h2((i + off) >> 5, row) * 14 | 0) + (h2(i, j) * 8 | 0)), i, j); } });
      // the iron ring, ten feet across, sunk in the floor: four cells, a quarter of it in each, and the dark of the frame inside it
      [[64, 64], [0, 64], [64, 0], [0, 0]].forEach(([qx, qy], q) => tex('t_p95_ring' + q, (x) => {
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const d = Math.hypot(i - qx, j - qy); px(x, d < 40 ? g(3 + (h2(i, j) * 3 | 0)) : d < 52 ? g(88 + (h2(i, j) * 14 | 0) - (d > 49 || d < 42 ? 30 : 0)) : g(30 + (h2(i + q * 64, j) * 10 | 0)), i, j); }
      }));
      tex('t_p95_door', (x) => { px(x, g(30), 0, 0, 64, 64); px(x, g(52), 6, 4, 52, 60); for (let j = 8; j < 64; j += 12) for (const i of [10, 52]) px(x, g(96), i, j, 2, 2); x.strokeStyle = g(150); x.lineWidth = 3; x.beginPath(); x.arc(32, 26, 9, 0, PI * 2); x.stroke(); px(x, g(150), 31, 35, 3, 12); px(x, g(150), 24, 46, 17, 3); });   // the pilgrims' sign: a disc on a stand
      tex('t_p95_bar', (x) => { px(x, g(40), 0, 0, 64, 64); px(x, g(64), 6, 4, 52, 60); px(x, '#3a2a1c', 0, 28, 64, 8); px(x, '#5a4630', 0, 28, 64, 1); for (const i of [4, 56]) px(x, g(110), i, 26, 4, 12); px(x, '#f4f0e4', 6, 61, 52, 3); });
      tex('t_p95_archway', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(96 + (h2(i, j) * 10 | 0)), i, j); px(x, '#f6f2e6', 8, 6, 48, 58); px(x, '#1a1816', 8, 6, 48, 3); for (let j = 14; j < 64; j += 9) px(x, '#18181a', 8, j, 48, 1); });   // the mouth, from inside: the white
    }
    // ---- the chain's furniture
    add('p95_railpost', 24, 48, 0.62, (x) => { px(x, g(26), 10, 2, 4, 46); px(x, g(60), 10, 2, 1, 46); px(x, g(26), 0, 2, 24, 3); px(x, g(70), 0, 2, 24, 1); px(x, g(26), 0, 24, 24, 2); });
    add('p95_roller', 40, 20, 0.22, (x) => { px(x, g(40), 4, 12, 32, 6); px(x, g(22), 0, 8, 40, 3); px(x, g(90), 0, 8, 40, 1); x.fillStyle = g(64); x.beginPath(); x.arc(20, 13, 6, 0, PI * 2); x.fill(); px(x, g(20), 18, 11, 4, 4); });
    add('p95_link', 104, 40, 1.15, (x) => { x.strokeStyle = g(18); x.lineWidth = 10; x.beginPath(); x.ellipse(52, 20, 44, 13, 0, 0, PI * 2); x.stroke(); x.strokeStyle = g(58); x.lineWidth = 2; x.beginPath(); x.ellipse(52, 17, 44, 13, 0, PI, PI * 2); x.stroke(); });
    add('p95_silk', 112, 16, 0.3, (x) => { x.fillStyle = '#0c0b0e'; x.beginPath(); x.moveTo(0, 2); x.lineTo(112, 2); x.lineTo(112, 9); x.quadraticCurveTo(56, 17, 0, 9); x.closePath(); x.fill(); px(x, '#26242a', 0, 2, 112, 1); px(x, g(30), 0, 0, 4, 16); px(x, g(30), 108, 0, 4, 16); });
    add('p95_bench', 48, 20, 0.34, (x) => { px(x, '#2a2018', 2, 6, 44, 5); px(x, '#3e2e20', 2, 6, 44, 1); px(x, g(30), 4, 11, 3, 9); px(x, g(30), 41, 11, 3, 9); });
    add('p95_grip', 16, 48, 0.6, (x) => { px(x, g(40), 6, 8, 4, 40); px(x, g(80), 6, 8, 1, 40); px(x, '#6a1c12', 3, 0, 10, 10); px(x, '#9a2c1c', 4, 1, 3, 4); });
    // the Dawning Spire, far across the gulf: shining, and the crack in its flank black
    add('p95_spire', 96, 480, 70, (x) => {
      for (let j = 0; j < 480; j++) { const wdt = 6 + (j / 480) * 38, c0 = 48 - wdt / 2; for (let i = 0; i < wdt; i++) { const e = Math.abs(i - wdt / 2) / (wdt / 2); px(x, e < 0.35 ? '#ffffff' : e < 0.75 ? '#e8fbff' : '#bfeaf2', (c0 + i) | 0, j); } }
      let cx = 56; for (let j = 150; j < 300; j++) { cx += h2(j, 7) < 0.4 ? -1 : h2(j, 7) > 0.7 ? 1 : 0; px(x, '#08080a', cx, j, 2 + (h2(j, 3) * 2 | 0), 1); }
    }, (r, gg, b, a) => a > 0 && r > 100);
    add('p95_peak', 160, 96, 26, (x) => {
      for (const [bx, top, wd] of [[36, 30, 60], [84, 6, 76], [126, 40, 50]]) { x.fillStyle = '#d4d2cc'; x.beginPath(); x.moveTo(bx - wd / 2, 96); x.lineTo(bx, top); x.lineTo(bx + wd / 2, 96); x.closePath(); x.fill(); x.fillStyle = '#bab8b2'; x.beginPath(); x.moveTo(bx, top); x.lineTo(bx + wd / 2, 96); x.lineTo(bx + wd / 8, 96); x.closePath(); x.fill(); }
    });
    // a choir shift under its canopy (two steps), and a canopy standing by itself: "like a procession of black mushrooms"
    const robedSmall = (x, cx, top, step) => {
      x.fillStyle = '#eeeae0'; x.beginPath(); x.moveTo(cx - 9 + step, top + 84); x.lineTo(cx - 7, top + 22); x.lineTo(cx + 7, top + 22); x.lineTo(cx + 9 + step, top + 84); x.closePath(); x.fill();
      px(x, '#d6d2c6', cx - 1 + (step > 0 ? 1 : 0), top + 24, 1, 58); px(x, '#eeeae0', cx - 11, top + 26, 4, 30); px(x, '#eeeae0', cx + 7, top + 26, 4, 30);
      x.fillStyle = '#e4e0d4'; x.beginPath(); x.arc(cx, top + 14, 8, 0, PI * 2); x.fill(); px(x, '#c8b8a4', cx - 4, top + 12, 8, 8); px(x, '#2a2020', cx - 2, top + 17, 4, 2);   // the hood, the face, the mouth open on the note
    };
    const capOf = (x, w) => { x.fillStyle = '#0c0b0e'; x.beginPath(); x.moveTo(2, 22); x.quadraticCurveTo(w / 2, -12, w - 2, 22); x.lineTo(w - 2, 26); x.lineTo(2, 26); x.closePath(); x.fill(); px(x, '#2a282e', 4, 22, w - 8, 1); for (let i = 6; i < w - 4; i += 9) px(x, '#0c0b0e', i, 26, 5, 3 + ((i / 9) & 1)); };
    const party = (step) => (x) => {
      for (const i of [10, 85]) { px(x, '#141216', i, 20, 2, 110); }
      robedSmall(x, 30, 44, step); robedSmall(x, 66, 44, -step); robedSmall(x, 48, 38, step);
      capOf(x, 96);
    };
    add('p95_party', 96, 132, 1.5, party(2)); add('p95_party_b', 96, 132, 1.5, party(-2));
    add('p95_canopy', 96, 132, 1.5, (x) => { for (const i of [10, 85]) px(x, '#141216', i, 20, 2, 112); capOf(x, 96); });
    // a Flambeau of the Chain: crimson, hooded, a censer on its chain, the glass-fire in its cage white-gold (five poses)
    const robed = (x, cx, o) => {
      const step = o.step || 0, sway = (y) => Math.round(step * (y - 58) / 116);
      x.fillStyle = o.robe; x.beginPath(); x.moveTo(cx - 20 + step, 174); x.lineTo(cx - 14, 58); x.lineTo(cx + 14, 58); x.lineTo(cx + 20 + step, 174); x.closePath(); x.fill();
      for (let y = 58; y < 174; y += 6) px(x, o.fold, cx - 3 + ((y / 6) & 1) * 2 + sway(y), y, 2, 6);
      if (o.stole) { px(x, o.stole, cx - 9, 60, 4, 96); px(x, o.stole, cx + 5, 60, 4, 96); px(x, '#c8a44a', cx - 9, 150, 4, 3); px(x, '#c8a44a', cx + 5, 150, 4, 3); }
      px(x, o.shade, cx - 24, 64, 8, o.armL); px(x, o.shade, cx + 16, 64, 8, o.armR);
      px(x, '#2a1c18', cx - 23, 64 + o.armL - 2, 6, 6); px(x, '#2a1c18', cx + 17, 64 + o.armR - 2, 6, 6);
      x.fillStyle = o.hood; x.beginPath(); x.moveTo(cx - 14, 62); x.lineTo(cx - 13, 30); x.quadraticCurveTo(cx, 12, cx + 13, 30); x.lineTo(cx + 14, 62); x.closePath(); x.fill();
      x.fillStyle = '#0c0808'; x.beginPath(); x.moveTo(cx - 8, 56); x.lineTo(cx - 8, 36); x.quadraticCurveTo(cx, 26, cx + 8, 36); x.lineTo(cx + 8, 56); x.closePath(); x.fill();
    };
    const fireOf = (x, i, j, hgt) => { px(x, '#f6d47a', i - 4, j - hgt, 9, hgt); px(x, '#fff8e0', i - 2, j - hgt + 2, 5, hgt - 3); px(x, '#fff8e0', i - 1, j - hgt - 3, 3, 3); };
    const flambeau = (pose) => (x) => {
      const cx = 40, step = pose === '_w1' ? -3 : pose === '_w2' ? 3 : 0;
      const armR = pose === '_a1' ? 26 : pose === '_a2' ? 44 : 40;
      robed(x, cx, { step, robe: '#9c1a1c', fold: 'rgba(230,90,70,0.3)', shade: '#7e1416', hood: '#6c1012', armL: 54 + (step < 0 ? -4 : 0), armR });
      // the censer: hung from the right hand on its chain, swung out before a blow and across for one
      const hx = cx + 20, hy = 64 + armR, sw = pose === '_a1' ? 22 : pose === '_a2' ? -34 : step * 2, len = pose === '_a2' ? 30 : 38;
      const ex = hx + sw, ey = hy + len - Math.abs(sw) * 0.3;
      x.strokeStyle = '#3a3a40'; x.lineWidth = 1; x.beginPath(); x.moveTo(hx, hy); x.lineTo(ex, ey - 10); x.stroke();
      px(x, '#18181a', ex - 7, ey - 10, 15, 2); px(x, '#18181a', ex - 7, ey + 10, 15, 3); for (const d of [-7, -2, 3, 7]) px(x, '#18181a', ex + d, ey - 10, 1, 20);
      fireOf(x, ex, ey + 9, 15);
      if (pose === '_a2') for (let k = 0; k < 18; k++) px(x, k % 3 ? '#fff8e0' : '#f6d47a', 2 + ((h2(k, 21) * 34) | 0), 96 + ((h2(k, 23) * 60) | 0), 2, 3 + ((h2(k, 25) * 3) | 0));
    };
    for (const pose of ['', '_w1', '_w2', '_a1', '_a2']) add('p95_flambeau' + pose, 96, 176, undefined, flambeau(pose), (r, gg, b, a) => a > 200 && r > 240 && gg > 200);
    // the Brother-Captain: crimson, a white stole edged in gold, a fire-stave; the fire as high as his forearm (five poses)
    const sant = (pose) => (x) => {
      const cx = 40, step = pose === '_w1' ? -3 : pose === '_w2' ? 3 : 0;
      const armL = pose === '_a2' ? 44 : 56 + (step < 0 ? -4 : 0), armR = pose === '_a1' ? 40 : pose === '_a2' ? 46 : 50 + (step > 0 ? -4 : 0);
      robed(x, cx, { step, robe: '#a01a1e', fold: 'rgba(240,100,80,0.3)', shade: '#821418', hood: '#70100f', stole: '#ece6d6', armL, armR });
      const hy = 64 + armR, turn = pose === '_a1' ? 0.2 : pose === '_a2' ? -0.5 : 0, bob = step < 0 ? -3 : step > 0 ? -1 : 0;
      x.save(); x.translate(cx + 25, hy + bob); x.rotate(turn); x.translate(-(cx + 25), -114);
      px(x, '#18181a', cx + 23, 42, 3, 132); px(x, '#2c2c30', cx + 24, 44, 1, 128);
      px(x, '#18181a', cx + 16, 38, 17, 3); px(x, '#18181a', cx + 16, 12, 17, 3); for (const d of [0, 5, 10, 15]) px(x, '#18181a', cx + 16 + d, 12, 2, 28);
      fireOf(x, cx + 24, 37, 30);
      x.restore();
      if (pose === '_a2') for (let k = 0; k < 26; k++) px(x, k % 3 ? '#fff8e0' : '#f6d47a', 4 + ((h2(k, 7) * 30) | 0), 34 + ((h2(k, 11) * 60) | 0), 2, 3 + ((h2(k, 5) * 4) | 0));
    };
    for (const pose of ['', '_w1', '_w2', '_a1', '_a2']) add('p95_sant' + pose, 96, 176, 1.1, sant(pose), (r, gg, b, a) => a > 200 && r > 240 && gg > 200);
    // the Brother-Captain, his fire out: kneeling, head down, hands open; the dark stave is not with him
    add('p95_sant_kneel', 72, 112, 0.7, (x) => {
      const cx = 34;
      x.fillStyle = '#a01a1e'; x.beginPath(); x.moveTo(cx - 24, 110); x.lineTo(cx - 14, 44); x.lineTo(cx + 14, 44); x.lineTo(cx + 30, 110); x.closePath(); x.fill();
      px(x, '#ece6d6', cx - 9, 46, 4, 60); px(x, '#ece6d6', cx + 5, 46, 4, 60);
      px(x, '#821418', cx - 22, 52, 8, 34); px(x, '#821418', cx + 14, 52, 8, 34); px(x, '#c8b4a0', cx - 24, 86, 10, 4); px(x, '#c8b4a0', cx + 14, 86, 10, 4);   // the open hands
      x.fillStyle = '#70100f'; x.beginPath(); x.moveTo(cx - 13, 48); x.lineTo(cx - 12, 26); x.quadraticCurveTo(cx + 2, 10, cx + 13, 28); x.lineTo(cx + 13, 48); x.closePath(); x.fill();
      px(x, '#4a0a0a', cx - 8, 34, 16, 12);
    });
    // a censer on the deck, burning; and gone out
    const censer = (lit) => (x) => { px(x, '#18181a', 4, 12, 16, 2); px(x, '#18181a', 4, 28, 16, 4); for (const d of [4, 9, 14, 19]) px(x, '#18181a', d, 12, 1, 18); for (let k = 0; k < 6; k++) px(x, '#3a3a40', 12 + (k & 1), k * 2, 1, 2); if (lit) fireOf(x, 12, 27, 13); else px(x, '#5a4420', 9, 22, 6, 5); };
    add('p95_censer', 24, 32, 0.34, censer(true), (r, gg, b, a) => a > 200 && r > 240 && gg > 200); add('p95_censer_out', 24, 32, 0.34, censer(false));
    // Perpetua Lisle: sixty, upright, in the Tiers' black with her sleeves rolled, a white robe folded over her arm
    add('p95_perpetua', 64, 160, undefined, (x) => {
      const cx = 32;
      x.fillStyle = '#18161a'; x.beginPath(); x.moveTo(cx - 18, 158); x.lineTo(cx - 13, 52); x.lineTo(cx + 13, 52); x.lineTo(cx + 18, 158); x.closePath(); x.fill();
      px(x, '#18161a', cx - 21, 56, 8, 30); px(x, '#18161a', cx + 13, 56, 8, 30); px(x, '#cbb8a4', cx - 20, 86, 6, 22); px(x, '#cbb8a4', cx + 14, 86, 6, 14);
      px(x, '#f0ece2', cx + 8, 96, 18, 44); px(x, '#d8d4c8', cx + 8, 96, 18, 2); px(x, '#d8d4c8', cx + 16, 98, 1, 42);   // the robe over her arm
      px(x, '#d0bca8', cx - 7, 28, 14, 20); px(x, '#1a1416', cx - 4, 35, 2, 2); px(x, '#1a1416', cx + 2, 35, 2, 2); px(x, '#6a4a44', cx - 2, 43, 4, 1);
      px(x, '#b8b8b4', cx - 8, 22, 16, 8); px(x, '#d4d4d0', cx - 6, 21, 12, 3); px(x, '#b8b8b4', cx - 9, 28, 2, 10); px(x, '#b8b8b4', cx + 7, 28, 2, 10);
      px(x, '#0a0808', cx - 14, 152, 11, 6); px(x, '#0a0808', cx + 3, 152, 11, 6);
    });
    add('p95_robes', 128, 96, 1.5, (x) => {
      px(x, '#2a2018', 0, 6, 128, 4); px(x, '#3e2e20', 0, 6, 128, 1);
      for (let k = 0; k < 6; k++) { const cx = 12 + k * 21; px(x, '#1a1816', cx - 1, 8, 3, 5); x.fillStyle = '#eeeae0'; x.beginPath(); x.moveTo(cx - 9, 92); x.lineTo(cx - 7, 14); x.lineTo(cx + 7, 14); x.lineTo(cx + 9, 92); x.closePath(); x.fill(); px(x, '#d6d2c6', cx, 16, 1, 74); px(x, '#eeeae0', cx - 11, 18, 3, 34); px(x, '#eeeae0', cx + 9, 18, 3, 34); px(x, '#3a3632', cx - 2, 15, 4, 1); px(x, '#3a3632', cx - 1, 17, 2, 1); }
    });
    add('p95_canopies', 96, 72, 1.0, (x) => {
      for (let k = 0; k < 5; k++) { px(x, '#0c0b0e', 8, 62 - k * 9, 66, 8); px(x, '#28262c', 8, 62 - k * 9, 66, 1); px(x, '#1a181c', 8 + k * 3, 64 - k * 9, 2, 5); }
      for (let k = 0; k < 4; k++) { x.strokeStyle = '#141216'; x.lineWidth = 2; x.beginPath(); x.moveTo(78 + k * 4, 70); x.lineTo(70 + k * 5, 2); x.stroke(); }
    });
    add('p95_copper', 56, 44, 0.7, (x) => { x.fillStyle = '#7a5030'; x.beginPath(); x.moveTo(6, 10); x.lineTo(50, 10); x.lineTo(44, 40); x.lineTo(12, 40); x.closePath(); x.fill(); px(x, '#a87848', 6, 10, 44, 2); px(x, '#d8d8d4', 10, 6, 36, 4); px(x, '#f0f0ec', 14, 4, 10, 3); px(x, '#f0f0ec', 28, 3, 12, 4); px(x, g(30), 10, 40, 36, 4); });
    // the Eye, on its frame of white iron: white as the inside of a shell, but for the cartwheel of bright bronze at its centre
    add('p95_eye', 176, 184, 7.2, (x) => {
      x.strokeStyle = '#c4c2bc'; x.lineWidth = 5; x.beginPath(); x.moveTo(20, 182); x.lineTo(60, 60); x.moveTo(156, 182); x.lineTo(116, 60); x.moveTo(8, 182); x.lineTo(168, 182); x.moveTo(44, 130); x.lineTo(132, 130); x.stroke();
      x.fillStyle = '#b6b4ae'; x.beginPath(); x.ellipse(88, 84, 80, 80, 0, 0, PI * 2); x.fill();
      x.fillStyle = '#e6e2d8'; x.beginPath(); x.ellipse(88, 84, 76, 76, 0, 0, PI * 2); x.fill();
      for (let r = 20; r < 76; r += 14) { x.strokeStyle = '#d8d4c8'; x.lineWidth = 1; x.beginPath(); x.ellipse(88, 84, r, r, 0, 0, PI * 2); x.stroke(); }
      x.fillStyle = '#b8862e'; x.beginPath(); x.ellipse(88, 84, 13, 13, 0, 0, PI * 2); x.fill(); x.fillStyle = '#f2d27a'; x.beginPath(); x.ellipse(86, 82, 9, 9, 0, 0, PI * 2); x.fill(); px(x, '#fff6d0', 82, 78, 4, 4);
    }, (r, gg, b, a) => a > 0 && r > 180 && b < 140 && gg > 150);
    add('p95_polisher', 32, 96, 1.1, (x) => { px(x, '#c4c2bc', 4, 0, 2, 96); px(x, '#c4c2bc', 24, 0, 2, 96); for (let j = 8; j < 96; j += 12) px(x, '#c4c2bc', 4, j, 22, 2); x.fillStyle = '#eeeae0'; x.beginPath(); x.moveTo(8, 60); x.lineTo(10, 24); x.lineTo(22, 24); x.lineTo(24, 60); x.closePath(); x.fill(); x.fillStyle = '#e4e0d4'; x.beginPath(); x.arc(16, 17, 6, 0, PI * 2); x.fill(); px(x, '#eeeae0', 22, 20, 8, 3); px(x, '#3a3020', 28, 18, 4, 5); });
    add('p95_ladder', 24, 96, 1.6, (x) => { px(x, g(30), 3, 0, 3, 96); px(x, g(30), 18, 0, 3, 96); for (let j = 4; j < 96; j += 9) { px(x, g(30), 3, j, 18, 2); px(x, g(70), 3, j, 18, 1); } });
    add('p95_ringbolt', 64, 64, 1.2, (x) => { x.strokeStyle = g(22); x.lineWidth = 10; x.beginPath(); x.arc(32, 30, 22, 0, PI * 2); x.stroke(); x.strokeStyle = g(64); x.lineWidth = 2; x.beginPath(); x.arc(32, 28, 22, PI, PI * 2); x.stroke(); px(x, g(20), 20, 52, 24, 12); });
  }

  // ================================================================ the defs: the foes, the gear, the people
  const KEEPER_DEF = { name: TX.keeperName, sprite: 'p95_sant', hp: 200, dmg: [7, 13], speed: 1.3, reach: 1.7, scale: 1, xp: 300, desc: TX.keeperDesc };
  const FLAMBEAU_DEF = { name: TX.flambeau, sprite: 'p95_flambeau', hp: 46, dmg: [4, 9], speed: 1.5, reach: 1.3, scale: 1, xp: 42, desc: TX.flambeauDesc };
  const ARMOR_DEFS = {
    a_p95_robe: { name: TX.robe, slot: 'body', ar: 1, noise: 0, value: 30, desc: TX.robeDesc },
    a_p95_cowl: { name: TX.cowl, slot: 'head', ar: 1, noise: 0, value: 26, desc: TX.cowlDesc },
    a_p95_sandals: { name: TX.sandals, slot: 'feet', ar: 1, noise: 0, value: 18, desc: TX.sandalsDesc },
  };
  const STAVE_DEF = { name: TX.stave, img: 'fp_mace', dmg: [6, 12], reach: 2.0, noise: 1.0, speed: 0.66, type: 'iron', blunt: true, twoHanded: true, value: 60, desc: TX.staveDesc };
  function defs() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p95_stave) WEAPONS.p95_stave = Object.assign({}, STAVE_DEF);
    if (typeof ENEMIES !== 'undefined') { if (!ENEMIES.p95_sant) ENEMIES.p95_sant = Object.assign({}, KEEPER_DEF); if (!ENEMIES.p95_flambeau) ENEMIES.p95_flambeau = Object.assign({}, FLAMBEAU_DEF); }
    if (typeof ARMOR !== 'undefined') for (const k in ARMOR_DEFS) if (!ARMOR[k]) ARMOR[k] = Object.assign({}, ARMOR_DEFS[k]);
    if (typeof ITEMS !== 'undefined') {
      for (const k in ARMOR_DEFS) if (!ITEMS[k]) ITEMS[k] = Object.assign({ sprite: 'gear', armor: true }, ARMOR_DEFS[k]);
      if (!ITEMS.w_p95_stave) ITEMS.w_p95_stave = { name: TX.stave, sprite: 'gear', weapon: 'p95_stave', value: 60, desc: TX.staveDesc };
      if (!ITEMS.v_p95_warrant) ITEMS.v_p95_warrant = { name: TX.warrant, sprite: 'gear', valuable: true, value: 90, desc: TX.warrantDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'a_p95_robe')) {
      ICONS.PIX.a_p95_robe = (d) => { d.layer('#eeeae0').rrect(6, 3, 12, 18); d.layer('#eeeae0').rect(3, 5, 3, 9).rect(18, 5, 3, 9); d.layer('#d2cec2').rect(11.5, 5, 1, 15); d.layer('#3a3632').rect(10, 4, 4, 1); };
      ICONS.PIX.a_p95_cowl = (d) => { d.layer('#141216').rrect(5, 3, 14, 17); d.layer('#060608').rrect(8, 8, 8, 9); d.layer('#34323a').rect(6, 4, 1.2, 14); };
      ICONS.PIX.a_p95_sandals = (d) => { const sd = (x) => { d.layer('#d8d0bc').rrect(x, 6, 6, 14); d.layer('#f2eee2').rect(x, 9, 6, 1.4).rect(x, 14, 6, 1.4); d.layer('#a89c80').rect(x + 2.4, 6, 1.2, 9); }; sd(4); sd(14); };
      const stave = (d) => { d.tilt(12, 12); d.layer('#2a2a2e', { shiny: 1 }).rrect(-1.2, -6, 2.4, 17); d.layer('#18181a').rrect(-3.5, -12, 7, 7); d.layer('#5a4420').rect(-1.5, -10, 3, 3.5); d.layer('#4a4a50').rect(-3.5, -12, 7, 1); };
      ICONS.PIX['weapon:p95_stave'] = stave; ICONS.PIX.w_p95_stave = stave;
      ICONS.PIX.v_p95_warrant = (d) => { d.layer('#e6dcc2').rrect(5, 4, 14, 16); d.layer('#8a7c60').rect(7, 7, 10, 1).rect(7, 10, 10, 1).rect(7, 13, 7, 1); d.layer('#f6f4ee', { shiny: 1 }).rrect(13, 14, 5, 5); };
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined') {
      if (!NPCS.p95_perpetua) NPCS.p95_perpetua = { name: TX.perpetua, sprite: 'p95_perpetua', portrait: 'townswoman', tier: 'low', greet: SAY.perpetua.greet, topics: SAY.perpetua.topics,
        shop: [{ item: 'a_p95_robe' }, { item: 'bandage', price: 4 }, { item: 'tonic', price: 5 }], markup: 1.0,
        shopTalk: { hello: S('A robe, if you mean to go out of the mouth. They will not ask your name.'), broke: S('Then you go up as you are, and they turn you round.'), thanks: [S('Mind the hem.'), S('Walk in the shade.')] } };
      if (!NPCS.p95_warden) NPCS.p95_warden = { name: TX.warden, sprite: 'p95_flambeau', portrait: 'townsman', tier: 'high', greet: SAY.warden.greet, topics: SAY.warden.topics };
    }
  }

  // ================================================================ the lamps (the Souls rules: group 'j')
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return;
    const base = { sprite: 'p92_shadelamp', litSprite: 'p92_shadelamplit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [240, 186, 110] };
    LAMPS = SOULS91.register('j', { maps: [HOUSE, MAP], revive: [MAP], keeper: (e) => e._p95 === 'keeper', kflag: 'p95k', note: 528 }, [
      Object.assign({ map: HOUSE, x: P.lamp1[0], y: P.lamp1[1], wx: P.lamp1[0] + 1.3, wy: P.lamp1[1] - 0.9, dir: -PI / 2, name: TX.lampRobing }, base),
      Object.assign({ map: MAP, x: P.lamp2[0], y: P.lamp2[1], wx: P.lamp2[0] + 1.1, wy: P.lamp2[1] + 0.9, dir: PI / 2, name: TX.lampCage }, base),
      Object.assign({ map: MAP, x: P.lamp3[0], y: P.lamp3[1], wx: P.lamp3[0] + 1.4, wy: P.lamp3[1] - 0.7, dir: 0, name: TX.lampRim }, base),
    ]) || [];
  }

  // ================================================================ building: the house (the robing-room and the anchor-house)
  function buildHouse() {
    const m = new GameMap(HOUSE, TX.nameHouse, HW, HH, { floor: 't_p95_flag', ceil: 't_p95_slate', floorTextures: HFLOORS, fogDist: 14, fogColor: [8, 8, 10], ambient: 0.2, music: 'inside', danger: 0,
      spawn: { x: P.hArrive[0], y: P.hArrive[1], dir: 0 } });
    m.ceilZ = 2.2;
    m.rect(0, 0, HW - 1, HH - 1, 't_p94_rib');
    const [rx0, ry0, rx1, ry1] = P.robing; m.clear(rx0, ry0, rx1, ry1);
    const [sx0, sy0, sx1, sy1] = P.stair; m.clear(sx0, sy0, sx1, sy1);
    // the tower: round, of the rim's stone
    const [tx, ty, tr] = P.tower;
    for (let j = 0; j < HH; j++) for (let i = 36; i < HW; i++) m.set(i, j, WALL('t_p95_towerwall'));
    for (let j = 0; j < HH; j++) for (let i = 36; i < HW; i++) if (Math.hypot(i + 0.5 - tx, j + 0.5 - ty) <= tr) m.set(i, j, null);
    m.clear(36, sy0, 39, sy1);
    m.block(0, 0, 't_p94_rib', m.ceilZ);
    // the deck from the ring to the mouth, and the ring
    for (let j = P.ringC[1] + 2; j <= P.mouthDoor[1] - 1; j++) for (const i of [43, 44, 45]) if (!m.get(i, j)) m.setFloor(i, j, 1);
    for (let q = 0; q < 4; q++) m.setFloor(P.ringC[0] - 1 + (q & 1), P.ringC[1] - 1 + (q >> 1), 3 + q);
    m.block(P.ringC[0], P.ringC[1] + 1, 't_p94_chain', 0.55);   // the chain, bending down to the ring from the mouth
    // doors: down to the winch-room; the barred door to the top tier; the mouth
    m.set(P.hDoor[0], P.hDoor[1], DOOR({ tex: 't_p95_door', portal: { map: ANCH, x: P.anchOut[0], y: P.anchOut[1], dir: PI }, label: TX.doorBack }));
    m.set(P.northDoor[0], P.northDoor[1], DOOR({ tex: 't_p95_bar', label: TX.northDoor, locked: '__never', lockMsg: TX.northLock }));
    m.set(P.mouthDoor[0], P.mouthDoor[1], DOOR({ tex: 't_p95_archway', portal: { map: MAP, x: P.arrive[0], y: P.arrive[1], dir: PI / 2 }, label: TX.mouth, locked: 'p95_robe', lockMsg: TX.mouthLock }));
    // the robing-room: the robes in rows, the canopies stacked, the copper, the tallow lamps
    for (let i = rx0 + 2; i <= rx1 - 2; i += 3) { m.deco('p95_robes', i + 0.5, ry0 + 0.55, { radius: 0.3, scale: 1, solid: false, label: TX.robes }); m.deco('p95_robes', i + 0.5, ry1 + 0.45, { radius: 0.3, scale: 1, solid: false, label: TX.robes }); }
    for (const [x, y] of [[12.5, 11.5], [12.5, 18.5], [20.5, 11.5], [20.5, 18.5]]) m.deco('p95_robes', x, y, { radius: 0.5, scale: 1, solid: true, label: TX.robes });
    for (const [x, y] of [[24.5, 9.6], [25.4, 11.2]]) m.deco('p95_canopies', x, y, { radius: 0.45, scale: 1, solid: true, label: TX.canopies });
    m.deco('p95_copper', 8.5, 9.6, { radius: 0.4, scale: 1, solid: true, label: TX.copper });
    for (const [x, y] of [[7.5, 16.5], [16.5, 9.4], [16.5, 21.6], [25.5, 16.5], [31.5, 13.6]]) m.deco('p94_chainlamp', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.5, lightCol: [232, 170, 96] });
    // the anchor-house: the winch, and the white standing in the mouth
    m.deco('p94_winch', P.winch[0], P.winch[1], { radius: 0.8, scale: 1, solid: true, label: TX.winch });
    m.deco('sign', P.ringC[0] - 1.6, P.ringC[1] + 0.4, { radius: 0.1, scale: 0.01, solid: false, label: TX.ring });
    m.deco('sign', P.stair[0] + 0.5, P.stair[1] - 0.3, { radius: 0.1, scale: 0.01, solid: false, label: TX.stairUp });
    m.add({ kind: 'deco', sprite: 'p94_chainlamp', x: P.mouthIn[0], y: P.mouthDoor[1] - 0.7, scale: 0.01, solid: false, radius: 0.01, nopick: true, glow: 0.8, lightCol: [250, 246, 232], _p95: 'mouthlight' });
    for (const [x, y] of [[40.6, 16.4], [48.2, 12.4]]) m.deco('p94_chainlamp', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.4, lightCol: [232, 170, 96] });
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt && LAMPS[0]) m.add(SOULS91.lampEnt(LAMPS[0]));
    m.npc('p95_perpetua', P.perpetua[0], P.perpetua[1], { facing: PI });
    for (const [x, y] of P.wardens) m.npc('p95_warden', x, y, { facing: -PI / 2, _p95: 'warden' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ================================================================ building: the chain, Lumina's shelf, the Altar
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  function plan() {
    // 0 void (blocked), 1 deck, 2 rim wall, 3 white stone floor, 4 steps, 5 rim walk, 6 pillar, 7 altar (never reached), 8 Lumina's rock,
    // 9 slope, 10 slope in the chain's shadow, 11 the tower, 12 chapel rock, 13 the Vessel's stone, 14 cage side, 15 winch-house, 16 a gap between pillars (blocked)
    const N = W * H, kind = new Uint8Array(N), shade = new Uint8Array(N);
    const rect = (x0, y0, x1, y1, k) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const q = at(i, j); if (q >= 0) kind[q] = k; } };
    const shadeRect = (x0, y0, x1, y1) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const q = at(i, j); if (q >= 0) shade[q] = 1; } };
    rect(6, 1, 58, 3, 2); rect(29, 1, 36, 4, 11);
    rect(32, 5, 33, SHELF - 1, 1);
    shadeRect(32, 5, 33, 7);                                         // the tower's own shadow, in the mouth
    rect(31, P.cage[0], 31, P.cage[1], 14); rect(34, P.cage[0], 34, P.cage[1], 14); shadeRect(32, P.cage[0], 33, P.cage[1]);
    // the slope, and the stripe of the chain's shadow down it
    rect(SLOPE[0], SLOPE[1], SLOPE[2], SLOPE[3], 9); rect(SLOPE[0], SLOPE[1], SLOPE[0] + 2, SLOPE[3], 10); shadeRect(SLOPE[0], SLOPE[1], SLOPE[0] + 2, SLOPE[3]);
    rect(SLOPE[2] + 1, SLOPE[1] - 1, SLOPE[2] + 3, SLOPE[3] + 1, 8); rect(SLOPE[0], SLOPE[3] + 1, SLOPE[2], SLOPE[3] + 1, 8);
    // Lumina: the shelf, the winch-house, the flanks, the great steps, the rim walk
    rect(12, SHELF, 54, RIM + 3, 8);
    rect(P.shelf[0], P.shelf[1], P.shelf[2], P.shelf[3], 3);
    rect(21, 202, 23, 206, 15); rect(24, 202, 25, 202, 15); rect(24, 206, 25, 206, 15); shadeRect(24, 203, 25, 205);
    rect(P.stepsX[0], STEPS, P.stepsX[1], RIM - 1, 4);
    rect(P.rimWalk[0], P.rimWalk[1], P.rimWalk[2], P.rimWalk[3], 5); shadeRect(P.rimWalk[0], P.rimWalk[1], P.rimWalk[2], P.rimWalk[3]);
    // the Altar: the pillars of its rim, the disc, the mountain round it with the old chapels
    const [ax, ay, ar] = P.altar;
    rect(12, P.pillarRow, 54, H - 1, 8);
    for (let j = P.pillarRow + 1; j < H - 1; j++) for (let i = 13; i <= 53; i++) { const d = Math.hypot(i + 0.5 - ax, j + 0.5 - ay), apron = j < ay && Math.abs(i + 0.5 - ax) <= ar; if (d <= ar || apron) kind[at(i, j)] = 7; else if ((d <= ar + 1.6 && j >= ay) || (j < ay && Math.abs(i + 0.5 - ax) <= ar + 1.6)) kind[at(i, j)] = 12; }
    for (let i = P.rimWalk[0]; i <= P.rimWalk[2]; i++) kind[at(i, P.pillarRow)] = (i % 2 === 0) ? 6 : 16;
    rect(P.vessel[0], P.vessel[1], P.vessel[2], P.vessel[3], 13);
    return { kind, shade };
  }
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p95_deck', ceil: null, floorTextures: FLOORS, fogDist: 64, fogColor: [240, 238, 228], ambient: 1, music: 'inside', danger: 2,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: PI / 2 } });
    m.bright = true;   // lit by the Bleach: never darkened as a room is (js/lighting.js)
    const { kind, shade } = plan();
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) V[vy * W1 + vx] = (vx >= SLOPE[0] && vx <= SLOPE[2] + 1 && vy >= SLOPE[1] && vy <= SLOPE[3] + 1) ? slopeH(vy) : hv(vy);
    m.setSide(0, 0, W - 1, H - 1, 't_p95_white');
    const walk = { 1: DECK, 3: STONE, 4: STEP, 5: STONE, 7: ALTAR, 9: SLOPEF, 10: SHADOW };
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k], lv = lvlAt(j);
      if (walk[t] != null) { m.smooth[k] = 1; L[k] = (t === 9 || t === 10) ? slopeH(j + 0.5) : lv; m.setFloor(i, j, walk[t]); continue; }
      m.smooth[k] = 0;
      if (t === 0) { L[k] = VOID_Z; m.setFloor(i, j, BLOCKED); continue; }
      if (t === 16) { m.smooth[k] = 1; L[k] = lv; m.setFloor(i, j, BLOCKED); continue; }
      L[k] = lv;
      if (t === 2) m.block(i, j, 't_p95_rim', lv + 3.2);
      else if (t === 11) m.block(i, j, 't_p95_rim', lv + 5.4);
      else if (t === 6) m.block(i, j, 't_p95_pillar', lv + 3.6);
      else if (t === 8) m.block(i, j, 't_p95_lumina', lv + 2.6 + h2(i >> 1, j >> 1) * 3.4 + (j > P.pillarRow ? 3 : 0));
      else if (t === 12) m.block(i, j, 't_p95_chapel', lv + 4.4);
      else if (t === 13) m.block(i, j, 't_p95_vessel', lv + 0.22);
      else if (t === 14) m.block(i, j, 't_p95_cageside', lv + 0.95);
      else if (t === 15) m.block(i, j, 't_p95_rim', lv + 1.7);
    }
    m._p95 = { kind, shade };
    // ---- the mouth, back into the anchor-house
    for (const i of [32, 33]) m.set(i, 4, DOOR({ tex: 't_p95_mouth', portal: { map: HOUSE, x: P.mouthIn[0], y: P.mouthIn[1], dir: -PI / 2 }, label: TX.mouthBack }));
    // ---- the rail, the cable on its rollers, the links under the deck
    const inCage = (y) => y >= P.cage[0] && y <= P.cage[1] + 1;
    for (let y = 7; y < SHELF; y += 3) if (!inCage(y)) for (const x of [32.05, 33.95]) m.deco('p95_railpost', x, y + 0.5, { radius: 0.05, scale: 1, solid: false, label: TX.rail });
    for (let y = 10; y < SHELF; y += 9) if (!inCage(y)) m.deco('p95_roller', 32.16, y + 0.2, { radius: 0.05, scale: 1, solid: false, label: TX.roller });
    for (let y = 8; y < SHELF; y += 5) { const x = ((y / 5) & 1) ? 31.5 : 34.5; if (kind[at(x | 0, y)] === 0) m.add({ kind: 'deco', sprite: 'p95_link', x, y: y + 0.5, scale: 1, solid: false, radius: 0.05, yOff: VOID_Z - lvlAt(y) + 1.5, label: TX.link, _decor: true }); }
    // ---- what you see from it: the Spire on your right hand, the peaks below
    m.add({ kind: 'deco', sprite: 'p95_spire', x: 4.5, y: 112.5, scale: 1, solid: false, radius: 0.05, yOff: 0, glow: 1, label: TX.spire, _decor: true });
    for (const [x, y] of [[14.5, 58.5], [54.5, 92.5], [12.5, 168.5], [56.5, 146.5], [52.5, 30.5], [16.5, 128.5]]) m.add({ kind: 'deco', sprite: 'p95_peak', x, y, scale: 1, solid: false, radius: 0.05, yOff: 0, label: TX.peaks, _decor: true });
    m.deco('sign', 33.6, 5.4, { radius: 0.1, scale: 0.01, solid: false, label: TX.rim0 });
    // ---- the choir shifts
    for (let i = 0; i < PARTIES; i++) { const q = partyAt(i, 0); m.add({ kind: 'deco', sprite: 'p95_party', x: q.x, y: q.y, scale: 1, solid: false, radius: 0.3, label: TX.party, _p95: 'party', _i: i }); }
    // ---- the cage, at the half-way mark: its silk overhead, its benches, the grip
    for (let y = P.cage[0]; y <= P.cage[1]; y++) m.add({ kind: 'deco', sprite: 'p95_silk', x: CX, y: y + 0.5, scale: 1, solid: false, radius: 0.05, yOff: -1.02, nopick: true, _decor: true });
    for (const y of [P.cage[0] + 0.5, P.cage[1] + 0.5]) m.deco('p95_bench', 33.72, y, { radius: 0.1, scale: 1, solid: false, label: TX.cage });
    m.deco('sign', 32.2, P.cage[0] - 0.3, { radius: 0.1, scale: 0.01, solid: false, label: TX.cage });
    m.deco('p95_grip', P.grip[0], P.grip[1], { radius: 0.12, scale: 1, solid: false, use: 'p95_cage', _p95: 'grip', label: TX.cageGrip });
    m.item('a_p95_cowl', P.cowl[0], P.cowl[1]);
    m.deco('sign', P.cowl[0] + 0.2, P.cowl[1] + 0.25, { radius: 0.1, scale: 0.01, solid: false, label: TX.cowlFound });
    // ---- the ladder down to the slope; the Glass-Grown; the sandals
    m.deco('p95_ladder', P.ladderTop[0], P.ladderTop[1], { radius: 0.12, scale: 0.5, solid: false, use: 'p95_ladder', _p95: 'ladderTop', label: TX.ladder });
    m.deco('p95_ladder', P.ladderBot[0], P.ladderBot[1], { radius: 0.12, scale: 1, solid: false, use: 'p95_ladder', _p95: 'ladderBot', label: TX.ladderUp });
    for (const [x, y] of GG) m.deco('p94_glassgrown', x, y, { radius: 0.3, scale: 1, solid: true, label: TX.gg, _p95: 'gg' });
    m.deco('sign', SLOPE[0] + 1.5, SLOPE[1] + 2.5, { radius: 0.1, scale: 0.01, solid: false, label: TX.stripe });
    m.item('a_p95_sandals', P.sandals[0], P.sandals[1]);
    m.deco('sign', P.sandals[0] + 0.3, P.sandals[1] + 0.2, { radius: 0.1, scale: 0.01, solid: false, label: TX.sandalsFound });
    // ---- Lumina: the chain made fast, the winch-house, the keeper's place
    m.deco('p95_ringbolt', 34.6, SHELF + 0.6, { radius: 0.3, scale: 1, solid: true, label: TX.madeFast });
    m.deco('p94_winch', P.winchL[0], P.winchL[1], { radius: 0.7, scale: 1, solid: true, use: 'p95_winch', _p95: 'winchL', label: TX.winchL });
    for (const y of [203.5, 204.5, 205.5]) m.add({ kind: 'deco', sprite: 'p95_silk', x: 24.9, y, scale: 0.8, solid: false, radius: 0.05, yOff: -1.5, nopick: true, _decor: true });
    m.deco('p95_sant_kneel', P.kneel[0], P.kneel[1], { radius: 0.3, scale: 1, solid: false, hidden: true, label: TX.kneel, _p95: 'kneel' });
    // ---- the Altar's rim: the canopies, the line, and beyond them the choir, the Vessel's stone, the Eye
    for (let x = P.rimWalk[0] + 1.5; x < P.rimWalk[2]; x += 3) m.deco('p95_canopy', x, P.rimWalk[1] + 2.2, { radius: 0.1, scale: 1, solid: false, label: TX.canopy });
    for (let i = P.stepsX[0] - 1; i <= P.stepsX[1] + 1; i += 2) m.deco('p95_flambeau', i + 0.5, P.pillarRow + 0.5, { radius: 0.4, scale: 1, solid: true, label: TX.line, _p95: 'line', facing: -PI / 2 });
    const [ax, ay] = P.altar;
    for (const [x, y] of [[ax - 7, ay - 9.5], [ax, ay - 11.5], [ax + 7, ay - 9.5]]) m.deco('p95_party', x, y, { radius: 0.3, scale: 1, solid: false, label: TX.choir, _p95: 'choir' });
    m.deco('p95_eye', P.eye[0], P.eye[1], { radius: 0.5, scale: 1, solid: false, label: TX.eye, _p95: 'eye' });
    m.deco('p95_polisher', P.eye[0] + 0.3, P.eye[1] - 0.6, { radius: 0.2, scale: 1, solid: false, yOff: -1.4, label: TX.polisher });
    // ---- the lamps
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS.slice(1)) m.add(SOULS91.lampEnt(L0));
    // ---- the Flambeaux of the Chain, and the Brother-Captain
    for (const [y, lo, hi] of SENTRIES) m.enemy('p95_flambeau', CX, y + 0.5, { _p95: 'sentry', _lo: lo, _hi: hi, _dir: 1, facing: PI / 2 });
    m.enemy('p95_sant', P.keeper[0], P.keeper[1], { _p95: 'keeper', facing: -PI / 2 });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world: two maps, and the stair in the winch-room
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[HOUSE] = buildHouse();
    maps[MAP] = build();
    const am = maps[ANCH];
    if (am && typeof ANCHORAGE94 !== 'undefined') {
      const [i, j] = P.anchDoor;
      try { am.ensureLvls()[j * am.w + i] = ANCHORAGE94.lvlAt(j); } catch (e) { warnOnce('anchorage lvl', e); }
      am.set(i, j, DOOR({ tex: 't_p95_door', portal: { map: HOUSE, x: P.hArrive[0], y: P.hArrive[1], dir: 0 }, label: TX.doorAnch }));
    }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p95_seen', 0x3fffffff); if (s & (1 << bit)) return false; f().p95_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const onChain = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const inHouse = () => typeof G !== 'undefined' && G.map && G.mapId === HOUSE && G.map.id === HOUSE;
  const special = (n) => { try { return typeof GEAR87 === 'object' && GEAR87.special && GEAR87.special(n); } catch (e) { return false; } };
  const B = { DAY: 3.0, NIGHT: 1.5, DEAD: 0.6, GRACE: 3, FLAMBEAU_SHADE: 2.2, CENSER_SHADE: 2.0, CENSER_S: 45, SANT_SHADE: 2.8, FIRE_SHADE: 1.9, FIRE_BURN: 0.8, FIRE_HURT: 5, FIRE_S: 9, FIRE_EVERY: 5.5, FIRE_MAX: 4,
    PATROL: 0.85, WHITE_NEAR: 1.6, QUIET: 2.6 };
  // the hour: by day two lights; by night the sourceless white; thinnest in the dead hour (the first hour after midnight)
  const hour = () => { const t = ((Number(G.tod) % 1) + 1) % 1; return t < 1 / 24 ? 'dead' : (t < 0.25 || t >= 0.8) ? 'night' : 'day'; };
  const rateOf = (h) => (h === 'dead' ? B.DEAD : h === 'night' ? B.NIGHT : B.DAY) * (special('shade') ? 0.5 : 1);
  const fires = [];      // the Brother-Captain's glass-fire on the stone: { x, y, t, ent }
  const censers = [];    // censers left burning on the deck: { x, y, t, ent }
  const alive = typeof WeakSet !== 'undefined' ? new WeakSet() : null;
  let burnAcc = 0, fireAcc = 0, outT = 0, lastShade = true, fireCool = 0, turned = false, prev = null, lastHour = '', noteLevel = 0;
  function shadeAt(x, y) {
    const d = G.map._p95, k = at(x | 0, y | 0); if (d && k >= 0 && d.shade[k]) return 'roof';
    for (const e of G.ents) {
      if (!e || e.hidden) continue;
      if (e._p95 === 'party') { if (Math.abs(e.x - x) < PARTY_SHADE && Math.abs(e.y - y) < PARTY_SHADE) return 'canopy'; }
      else if (e._p95 === 'sentry') { if (!e.dead && Math.hypot(e.x - x, e.y - y) < B.FLAMBEAU_SHADE) return 'fire'; }
      else if (e._p95 === 'keeper') { if (!e.dead && Math.hypot(e.x - x, e.y - y) < B.SANT_SHADE) return 'fire'; }
    }
    for (const q of censers) if (Math.hypot(q.x - x, q.y - y) < B.CENSER_SHADE) return 'fire';
    for (const q of fires) if (Math.hypot(q.x - x, q.y - y) < B.FIRE_SHADE) return 'fire';
    return '';
  }
  const drop = (list, i) => { const q = list[i]; const j = G.ents.indexOf(q.ent); if (j >= 0) G.ents.splice(j, 1); list.splice(i, 1); };
  function clearFires() { while (fires.length) drop(fires, 0); while (censers.length) drop(censers, 0); }
  function addFire(x, y) {
    if (fires.length >= B.FIRE_MAX) drop(fires, 0);
    const ent = { kind: 'deco', sprite: 'p92_glassfire', x, y, scale: 1.2, solid: false, radius: 0.05, transient: true, _decor: true, nopick: true };
    G.ents.push(ent); fires.push({ x, y, t: B.FIRE_S, ent });
  }
  function leaveCenser(x, y) {
    const ent = { kind: 'deco', sprite: 'p95_censer', x, y, scale: 1, solid: false, radius: 0.1, transient: true, label: TX.censer };
    G.ents.push(ent); censers.push({ x, y, t: B.CENSER_S, ent });
  }

  // the card: the hour, and whether you are in shade
  let cardEl = null, cardKey = '';
  function drawCard() {
    if (typeof document === 'undefined') return;
    const game = document.getElementById('game'); if (!game) return;
    if (!onChain() || G.state !== 'play') { if (cardEl) { cardEl.remove(); cardEl = null; cardKey = ''; } return; }
    const h = hour(), key = h + (lastShade ? 's' : 'l'); if (cardEl && key === cardKey) return; cardKey = key;
    if (!document.getElementById('p95-style')) { const st = document.createElement('style'); st.id = 'p95-style';
      st.textContent = '#p95-card{position:absolute;left:50%;top:1.4cqh;transform:translateX(-50%);background:rgba(14,13,16,.86);border:1px solid #6a5a3c;color:#cfc6b2;font:1.25cqw/1.3 "Alegreya SC",serif;padding:.4cqw .9cqw;z-index:6;pointer-events:none;display:flex;gap:.7cqw;align-items:center}#p95-card .h{color:#e2c88c}#p95-card .s{border:1px solid #3a342c;padding:0 .5cqw}#p95-card .s.l{background:#f2eee2;color:#141216;border-color:#f2eee2}#fx.p95-white{background:rgba(255,252,236,.16)}';
      document.head.appendChild(st); }
    if (!cardEl) { cardEl = document.createElement('div'); cardEl.id = 'p95-card'; cardEl.setAttribute('role', 'status'); cardEl.setAttribute('aria-live', 'off'); game.appendChild(cardEl); }
    const mk = (cls, t) => { const e = document.createElement('span'); if (cls) e.className = cls; e.textContent = t; return e; };
    cardEl.replaceChildren(mk('', TX.cardName), mk('h', h === 'dead' ? TX.cardDead : h === 'night' ? TX.cardNight : TX.cardDay), mk('s' + (lastShade ? '' : ' l'), lastShade ? TX.cardShade : TX.cardLight));
  }

  function tickHouse() {
    const want = (typeof isWorn === 'function' && isWorn('a_p95_robe')) ? 1 : 0;
    if (fint('p95_robe', 1) !== want) f().p95_robe = want;
    const c = Engine.cam;
    once(0, TX.arriveHouse, '', 9000);
    if (Math.hypot(c.x - P.tower[0], c.y - P.tower[1]) < P.tower[2]) { once(1, TX.arriveTower, '', 9000); once(2, TX.smell, '', 7000); }
  }
  function tick(dt) {
    // the Pure Note, off the Altar, nearer as you come up the chain (and the Glass-Grown's, on the slope: the same note)
    try {
      if (typeof Audio_ !== 'undefined' && Audio_.hum) {
        let want = 0;
        if (onChain() && G.state === 'play') { const c = Engine.cam; want = 0.03 + 0.3 * Math.max(0, Math.min(1, (c.y - 120) / 110)); if (turned) want += 0.12; }
        if (want > 0 || noteLevel > 0) { Audio_.hum(want, 528, 'p95_note'); noteLevel = want; }
      }
    } catch (e) { warnOnce('note', e); }
    if (typeof G === 'undefined' || G.state !== 'play' || !G.player || G.dead) { prev = null; return; }
    if (inHouse()) { tickHouse(); return; }
    if (!onChain()) { prev = null; return; }
    const p = G.player, c = Engine.cam, m = G.map;
    clock += dt;
    once(3, TX.arriveChain, '', 10000);
    // the hour, and what the white is doing
    const h = hour();
    if (h !== lastHour) {
      if (lastHour) say(h === 'day' ? TX.sunUp : h === 'dead' ? TX.deadHour : TX.night, h === 'day' ? 'bad' : '', 7000); lastHour = h;
      m.fogColor = h === 'day' ? [250, 246, 232] : h === 'dead' ? [214, 220, 230] : [230, 232, 236];
      m.ambient = h === 'day' ? 1 : h === 'dead' ? 0.8 : 0.9;
    }
    if (c.y > 8.5) once(22, TX.saying, 'warn', 9000);
    // the choir shifts go out and back on the place's own clock
    for (const e of G.ents) if (e && e._p95 === 'party') { const q = partyAt(e._i | 0, clock); e.x = q.x; e.y = q.y; e.sprite = (Math.floor(clock * 2.2 + (e._i | 0)) & 1) ? 'p95_party_b' : 'p95_party'; }
    // the Flambeaux of the Chain: they walk their lengths; in the whites they take you for a bearer until you are close
    const white = special('white');
    let kp = null;
    for (const e of G.ents) {
      if (!e) continue;
      if (e._p95 === 'keeper') { kp = e; continue; }
      if (e._p95 !== 'sentry') continue;
      if (e.dead) { if (alive && alive.has(e)) { alive.delete(e); leaveCenser(e.x, e.y); once(8, TX.flambeauDown, '', 9000); } continue; }
      if (alive) alive.add(e);
      const d = Math.hypot(e.x - c.x, e.y - c.y);
      if (e.state !== 'chase') {
        const hide = white && d > B.WHITE_NEAR;
        if (hide) { e.passive = true; e.state = 'passive'; if (d < 6) once(9, TX.whites, '', 7000); }
        else if (e.state === 'passive') { e.passive = false; e.state = 'idle'; }
        const lo = Number(e._lo) || e.y, hi = Number(e._hi) || e.y; let dir = e._dir === -1 ? -1 : 1;
        let ny = e.y + dir * B.PATROL * dt; if (ny > hi) { ny = hi; dir = -1; } else if (ny < lo) { ny = lo; dir = 1; }
        if (Math.hypot(CX - c.x, ny - c.y) > 0.8) { e.y = ny; e.x = CX; }
        e._dir = dir; e.facing = dir > 0 ? PI / 2 : -PI / 2;
      } else if (e.passive) e.passive = false;
    }
    if (c.y > P.span2[0] + 1 && c.y < SHELF) once(7, TX.second, '', 10000);
    // censers left on the deck burn a while, and go out
    for (let i = censers.length - 1; i >= 0; i--) { const q = censers[i]; q.t -= dt; if (q.t <= 0) { const near = Math.hypot(q.x - c.x, q.y - c.y) < 6; drop(censers, i); if (near) say(TX.censerOut, 'warn', 5000); } }
    // the Brother-Captain: glass-fire at where you stand; it burns, and the white stands off it
    const onShelf = c.y >= SHELF - 2 && c.y < RIM;
    if (onShelf) once(10, TX.farEnd, '', 10000);
    if (kp && !kp.dead && kp.state === 'chase' && Math.hypot(kp.x - c.x, kp.y - c.y) < 12) {
      once(11, TX.keeperSees, 'bad', 9000);
      fireCool -= dt;
      if (fireCool <= 0) { fireCool = B.FIRE_EVERY; addFire(c.x, c.y); once(12, TX.castFire, 'bad', 8000); try { Audio_.sfx.swing(); } catch (e) { /* audio is optional */ } }
    } else fireCool = Math.min(fireCool, 2);
    for (let i = fires.length - 1; i >= 0; i--) { const q = fires[i]; q.t -= dt; q.ent.scale = 1.0 + 0.2 * Math.sin(clock * 9 + i); if (q.t <= 0) drop(fires, i); }
    let inFire = false; for (const q of fires) if (Math.hypot(q.x - c.x, q.y - c.y) < B.FIRE_BURN) inFire = true;
    if (inFire) { fireAcc += dt * B.FIRE_HURT; if (fireAcc >= 1) { const n = Math.floor(fireAcc); fireAcc -= n; p.hp -= n; G.hurtT = 0.12; if (p.hp <= 0) { prev = null; die(TX.burn); return; } } } else fireAcc = 0;
    // his fire out: the stave and the warrant, once; he kneels by the lowest step
    const kn = G.ents.find((e) => e && e._p95 === 'kneel');
    if (kn) kn.hidden = !(kp && kp.dead);
    if (kp && kp.dead && !fint('p95_kdrop', 1)) {
      f().p95_kdrop = 1; while (fires.length) drop(fires, 0);
      for (const [id, dx] of [['w_p95_stave', -0.5], ['v_p95_warrant', 0.5]]) { const it = ITEMS[id]; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: kp.x + dx, y: kp.y, scale: 0.35, yOff: 0, solid: false })); }
      say(TX.keeperDown, 'good', 11000); sync();
    }
    // the Bleach: outside every shade it takes you, by the hour
    const sh = shadeAt(c.x, c.y);
    if (sh) { if (!lastShade) once(5, TX.shadeIn, 'good', 4000); outT = 0; burnAcc = 0; }
    else {
      outT += dt;
      if (outT > (special('afterglow') ? B.GRACE : 0)) {
        burnAcc += dt * rateOf(h);
        if (burnAcc >= 1) { const n = Math.floor(burnAcc); burnAcc -= n; p.hp -= n; G.hurtT = 0.1; if (p.hp <= 0) { prev = null; die(TX.lost); return; } }
        once(4, TX.bleachOn, 'bad', 6000);
      }
      try { fx('p95-white', 220); } catch (e) { /* no overlay */ }
    }
    lastShade = !!sh;
    // the slope: walk; run or sing, and they turn
    const onSlope = c.x >= SLOPE[0] && c.x <= SLOPE[2] + 1 && c.y >= SLOPE[1] && c.y <= SLOPE[3] + 1;
    if (onSlope) {
      once(13, TX.slope, '', 9000);
      if (!turned && prev && dt > 0 && Math.hypot(c.x - prev.x, c.y - prev.y) / dt > B.QUIET && c.x > SLOPE[0] + 3) turn();
    }
    // the rim: what you can see from it
    if (c.y >= RIM) {
      once(14, TX.rim, '', 10000);
      if (c.y > RIM + 2.4 && Math.abs(c.x - CX) < 7) { if (once(15, TX.lineSay, 'warn', 8000)) { try { Audio_.sfx.door(); } catch (e) { /* */ } } }
      if (Math.abs(c.x - CX) < 5 && c.y > RIM + 1) once(16, TX.altar, '', 10000);
      if (c.x < CX - 6) once(17, TX.eye, '', 12000);
      if (c.x > CX + 6) once(18, TX.vessel, '', 10000);
      if (c.x > CX + 11 || c.x < CX - 11) once(19, TX.chapel, '', 9000);
    } else if (c.y >= STEPS) once(20, TX.steps, '', 5000);
    prev = { x: c.x, y: c.y };
  }
  function turn() {
    if (turned) return; turned = true; sync(); say(TX.ggTurn, 'warn', 9000);
  }
  function sung() {
    if (!onChain() || turned) return; const c = Engine.cam;
    if (c.x >= SLOPE[0] - 2 && c.y >= SLOPE[1] - 2 && c.y <= SLOPE[3] + 2) turn();
  }

  // ---------------------------------------------------------------- using things
  function put(x, y, dir) {
    const c = Engine.cam; c.x = x; c.y = y; if (dir != null) c.dir = dir; prev = null; outT = 0; burnAcc = 0;
    if (G.player) { G.player.feet = G.map.groundAt(c.x, c.y); G.player.fallFrom = null; G.player.fallV = 0; }
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p95_/.test(e.use) || !onChain()) return false;
    const kp = G.ents.find((q) => q && q._p95 === 'keeper'), down = !!(kp && kp.dead) || fint('p95_cage', 1) === 1;
    if (e.use === 'p95_ladder') { if (e._p95 === 'ladderTop') put(P.slopeIn[0], P.slopeIn[1], 0); else put(CX, P.ladderTop[1], PI / 2); return true; }
    if (e.use === 'p95_winch') {
      if (!down) { say(TX.winchShut, '', 6000); return true; }
      if (fint('p95_cage', 1) !== 1) { f().p95_cage = 1; say(TX.winchFree, 'good', 10000); try { Audio_.sfx.door(); } catch (er) { /* */ } sync(); return true; }
      put(P.cageRide[0], P.cageRide[1], -PI / 2); say(TX.cageDown, '', 5000); return true;
    }
    if (e.use === 'p95_cage') {
      if (fint('p95_cage', 1) !== 1) { say(TX.cageShut, '', 6000); once(6, TX.cageRest, '', 8000); return true; }
      put(P.winchRide[0], P.winchRide[1], 0); say(TX.cageUp, '', 9000); return true;
    }
    return false;
  }
  function sync() {
    if (!onChain()) return;
    const open = fint('p95_cage', 1) === 1, kp = G.ents.find((q) => q && q._p95 === 'keeper');
    for (const e of G.ents) { if (!e || !e._p95) continue;
      if (e._p95 === 'grip') e.label = open ? TX.cageGripOpen : TX.cageGrip;
      else if (e._p95 === 'winchL') e.label = (open || (kp && kp.dead)) ? TX.winchLOpen : TX.winchL;
      else if (e._p95 === 'gg') e.sprite = turned ? 'p94_glassgrown_turn' : 'p94_glassgrown';
      else if (e._p95 === 'kneel') e.hidden = !(kp && kp.dead); }
  }

  // ================================================================ wiring
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { fires.length = 0; censers.length = 0; prev = null; outT = 0; burnAcc = 0; fireAcc = 0; lastShade = true; turned = false; lastHour = ''; fireCool = 2; sync(); if (onChain() && fint('p95_robe', 1) === 1) once(21, TX.mouthPass, '', 7000); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { drawCard(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (typeof castSong === 'function') { const _cs = castSong; castSong = function () { const r = _cs.apply(this, arguments); try { sung(); } catch (e) { warnOnce('song', e); } return r; }; }
    // a man whose fire is out is not "destroyed": the game's own line is held back for the Church's men here
    if (typeof killEnemy === 'function') { const _k = killEnemy; killEnemy = function (e) {
      if (!e || !/^p95_/.test(String(e.type || ''))) return _k.apply(this, arguments);
      const _m = msg; msg = function (t) { if (/ is destroyed\.$/.test(String(t))) return undefined; return _m.apply(this, arguments); };
      try { return _k.apply(this, arguments); } finally { msg = _m; }
    }; }
  }
  wire();

  return { TX, SAY, TEXTS, MAP, HOUSE, W, H, P, B, SENTRIES, GG, SLOPE, PARTIES, PARTY_SPEED, PARTY_SHADE, KEEPER_DEF, FLAMBEAU_DEF, ARMOR_DEFS, STAVE_DEF, hv, lvlAt, slopeH, plan, build, buildHouse, join, tick, useOwn, sync, sung, turn, drawCard,
    partyAt, shadeAt, hour, rateOf, addFire, leaveCenser, clearFires, lamps: () => LAMPS, fires: () => fires, censers: () => censers, clock: () => clock, setClock: (v) => { clock = v; }, turned: () => turned };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = PILGRIM95;
if (typeof window !== 'undefined') window.PILGRIM95 = PILGRIM95;
