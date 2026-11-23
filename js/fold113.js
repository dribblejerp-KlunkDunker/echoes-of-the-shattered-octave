// ============================================================
//  fold113 — Phase 113c (the owner, 22 Nov 2026; approved 6:14 pm, "excellent I approve"): the Fold, the faith of the
//  stars. "Add constellations with lore please ... monoliths and megaliths cleverly placed around the games map that
//  perfectly show the constellation or constellations. When looked through I want the constellations or planets zoomed
//  in on with a good explanation of what its called, why and the story or myth behind it."
//  Every line the player reads is the approved record's, word for word:
//    story/Game Layer/Phase 113c - The Fold, the faith of the stars (for review).md
//  and what was built is recorded in story/Game Layer/Phase 113c - The Fold's stones (built).md
//
//  1. THE SKY'S TABLE: window.STARLORE113 (read by js/deepsky113.js): the eight Keepers along the Chord, each built round
//     the note-star the sky already draws at chord((2k+1)/16) (same place, same hue); the Sparrow off the Chord by the
//     Badger, toward the horizon; the seven Signs evenly along the sun's road; the loose five on the sun's road, moving
//     with the game's day; the three far folds (the sky's own three galaxies, as frames: nothing laid over them). The sky
//     does not turn (approved), so every fixed figure has one place. The Lantern is the moon, where the game draws it.
//  2. THE STONES: the Weekstones (Phase 47, untouched) each with a cup-marked peg behind it; a small stone apart for the
//     Sparrow; seven needle-stones for the Signs; pegs at the five raddled Grey Wethers; a peg at Ewe Barrow's door;
//     three notch-stones for the far folds; a canted needle on the Rift's mooring-yard and a needle on the Chalk Cliffs,
//     both blind. Standing at a peg faces the figure through or past its stone: the peg is set back from the stone along
//     the figure's bearing, and a needle's eye (a notch's notch) is cut where that line of sight passes through it, so in
//     both views the figure's brightest star sits in the eye when the camera has turned.
//  3. THE VIEW: the camera turns (half a second) and a panel opens: the figure zoomed (DEEPSKY113.drawChart, its lines
//     coming in over a second), its name, its head line, its story. By day, under cloud, and when a wanderer is down, the
//     stone's own face instead: cup-marks pecked in the figure's pattern, a line scratched from one to the next.
//  4. OLD MARRABLE, a lamp-teller, by the fallen Nullday stone from full dark through the dead hour.
//  Flags: p113f_seen (25 bits), p113f_blind (1 the Rift's, 2 the Heights'), p113f_marr (1 met, 2 all eight, 4 the Rift).
//  No switch: the stones, the pegs and Marrable are part of the world (the design, section 6). Nothing here uses
//  the random stream; every picture is drawn in code from hashed noise.
// ============================================================
'use strict';

const FOLD113 = (function () {
  const TEXTS = [];
  const S = (t) => { if (!TEXTS.includes(t)) TEXTS.push(t); return t; };
  const PI = Math.PI, TAU = PI * 2, D2R = PI / 180, R2D = 180 / PI;
  const FXL = 160 / 0.66, ZK = 150 / FXL, EYE = 0.88;          // the logical focal length; one height unit on screen; the eye
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const smooth = (a, b, x) => { const t = clamp((x - a) / (b - a), 0, 1); return t * t * (3 - 2 * t); };
  const wrapA = (a) => { a = ((a + PI) % TAU + TAU) % TAU - PI; return a; };
  const angD = (a, b) => Math.abs(wrapA(a - b));
  const hasG = () => typeof G !== 'undefined' && G && G.player;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('fold113: ' + k + ': ' + (e && e.message ? e.message : e)); } catch (x) { /* none */ } };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function hh(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1442695041)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; h = Math.imul(h, 2246822519); h ^= h >>> 13;
    return (h >>> 0) / 4294967296;
  }
  function vn(x, y, s) {
    const xi = Math.floor(x), yi = Math.floor(y); let fx = x - xi, fy = y - yi; fx = fx * fx * (3 - 2 * fx); fy = fy * fy * (3 - 2 * fy);
    const a = hh(xi, yi, s), b = hh(xi + 1, yi, s), c = hh(xi, yi + 1, s), d = hh(xi + 1, yi + 1, s);
    return a + (b - a) * fx + (c - a) * fy + (a - b - c + d) * fx * fy;
  }
  const fbm = (x, y, s) => (vn(x, y, s) * 0.5 + vn(x * 2, y * 2, s + 7) * 0.3 + vn(x * 4, y * 4, s + 13) * 0.2);

  // ================================================================ the lines (the record's, word for word)
  const TX = {
    leave: S('Leave it.'),
    byDay: S('There is only sky in it by day. The stone keeps its own chart for the daytime: cup-marks pecked in its face, and a line scratched from one to the next.'),
    tooLight: S('Too much light here tonight. The lamps are there. You cannot have them.'),
    down: S('It is down tonight. The stone is patient.'),
    ownSign: S('This is the door you came in by.'),
    signHead: S('One of the seven Signs, on the sun\'s road.'),
    looseHead: S('One of the loose five.'),
    foldHead: S('One of the far folds.'),
    lanternHead: S('The Lantern.'),
    foldsSay: S('"Other folds, on hills too far off to walk to. They have their own shepherds. On a clear night you are being looked at."'),
    blindRift: S('A needle-stone, canted, its eye to the east. Whoever set it meant the Owl to sit in it. You look through. Black. The sky over the Rift has no lamps in it at all. Somebody has pecked a new cup-mark under the old ones, not long ago, and then tried to rub it out.'),
    blindHeights: S('Its eye looks for the Cockerel. Since the Spire broke there has been no night up here to see him by. The stone is warm.'),
    needle: S('A needle-stone'), notch: S('A notch-stone'), canted: S('A canted needle-stone'),
    sparrowStone: S('A small stone, set apart, where a traveller would stand'),
    wether: S('A raddled wether, and a peg at its foot'),
    barrow: S('Ewe Barrow\'s door-stone, and a peg in the turf'),
    jFirst: S('You looked through a stone of the Fold, and saw what it was set to.'),
    jAll: S('Every lamp the stones are set to, seen and said good night to.'),
    // Old Marrable
    mName: S('Old Marrable, a lamp-teller'),
    mGreet1: S('"You\'ll be wanting the lamps. Sit if you like. I\'m only counting."'),
    mGreet2: S('"Still here. Still counting."'),
    say1: S('"The Keepers are under the ground, and they are tired. We cannot go down to them. The stairs were shut before my grandmother\'s grandmother. So we look up, where their lamps are, and say good night to each by name. It is not much. It is what there is."'),
    say2: S('"Every lamp up there was lit for somebody. Nobody is lost who has been counted. That is the whole of it."'),
    say3: S('"They do not move. The sun goes over, and the Lantern goes over, and the five loose ones go where they like. The Fold stays where it was put. Set a stone to a lamp and it will be there for your children\'s children. Name me another thing you can say that of."'),
    say4: S('"Since the year the sky went grey the count comes up short, down toward the Spire of Decay. We count them anyway. You count the ones that are missing too. A shepherd knows that."'),
    say5: S('"The Church calls them sheep-stones and lets them stand. We call them sheep-stones too, when the Church is asking."'),
    saySigns: S('"It does not make you. It only says which door you came in by."'),
    mAll8: S('"That\'s all eight said good night to. You\'ll sleep. People do, after."'),
    mRift: S('"You\'ve been out east, then. There\'s nothing in that eye. There was, once. Don\'t tell me, I know."'),
    tFold: S('The Fold'), tLamps: S('The lamps'), tStones: S('The stones'), tCount: S('The count'), tChurch: 'The Church', tSigns: S('The signs'),
  };

  // ================================================================ the figures
  // shape: [X, Y, mag] in degrees on the tangent plane (X to the right as you face it, Y up); lines: pairs of indices
  const FIG = {};
  const ORDER = [];
  function fig(id, kind, o) { const f = Object.assign({ id, kind, bit: ORDER.length }, o); f.name = S(f.name); f.head = S(f.head); f.story = S(f.story); FIG[id] = f; ORDER.push(id); return f; }
  // the eight Keepers, the week's order; the lamp is index 0 of each shape
  fig('k_badger', 'keeper', { name: 'The Badger', head: 'Rootday. His lamp is the Sett-Lamp, green.', k: 0,
    story: 'A long low back, a blunt head, and one green lamp where the mouth of the sett would be. He is the first on the Chord and the lowest, because he is the one who says <i>down</i>. The hill people say every root in the Reach has heard him say it, and that is why roots go the way they do. He does not come out. You know he is in by the lamp. On Rootday you say good night to him first, and you say it toward the ground as well as the sky, in case.',
    shape: [[0, 0], [-1.3, 0.9, 0.45], [-3.0, 1.45, 0.4], [-5.0, 1.55, 0.36], [-7.0, 1.25, 0.38], [-8.2, 0.6, 0.3], [-2.6, -0.35, 0.27], [-6.5, -0.25, 0.27]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [2, 6], [4, 7]] });
  fig('k_salamander', 'keeper', { name: 'The Salamander', head: 'Hearthday. Her lamp is the Ember, red-gold.', k: 1,
    story: 'A bent line of six, like a poker left in the grate, with the Ember at the bend. She keeps the hearth of the world and may not let it out, so she is the only Keeper who is never cold and never asleep at once. Smiths\' wives on the Downs bank the kitchen fire toward her of a Hearthday. If the Ember looks dull, they say, somebody\'s fire has gone out that should not have, and you go round the neighbours.',
    shape: [[0, 0], [-1.3, -0.75, 0.42], [-2.6, -1.5, 0.38], [-3.9, -2.25, 0.34], [-5.2, -3.0, 0.3], [0.45, 1.5, 0.5]],
    lines: [[4, 3], [3, 2], [2, 1], [1, 0], [0, 5]] });
  fig('k_tortoise', 'keeper', { name: 'The Tortoise', head: 'Massday. His lamp is the Still Stone, slate-grey.', k: 2,
    story: 'A ring of five with one in the middle: the shell, and what is under the shell. He holds the weight of everything and has never once shifted his feet. Drovers say that is why a stone stays where you put it. His lamp is the dullest of the eight and the steadiest; nobody has seen it flicker. Children are told that if the Tortoise ever takes a step, they will feel it in their teeth.',
    shape: [[0, 0]].concat([0, 1, 2, 3, 4].map((i) => [2.5 * Math.cos(PI / 2 + i * TAU / 5), 2.5 * Math.sin(PI / 2 + i * TAU / 5), [0.5, 0.4, 0.36, 0.36, 0.4][i]])),
    lines: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 1]] });
  fig('k_heron', 'keeper', { name: 'The Heron', head: 'Stasisday. Her lamp is the Standing Eye, amber.', k: 3,
    story: 'Tall and thin: a long neck of four, a body, and one leg, because herons stand on one. The amber lamp is her eye. She keeps the hours by not moving through them. The longest night of the year is hers, and on it the hill people sit up with her, because it is a long watch for one bird. It is said the dial-men set the oldest stones to her eye. The stones are older than whoever said it.',
    shape: [[0, 0], [0.5, -1.2, 0.36], [0.25, -2.3, 0.34], [0.6, -3.4, 0.36], [1.1, -4.3, 0.4], [2.6, -5.0, 0.52], [2.3, -7.6, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6]] });
  fig('k_cockerel', 'keeper', { name: 'The Cockerel', head: 'Dawnday. His lamp is First Call, pale blue-green.', k: 4,
    story: 'A comb of three, a breast, a tail thrown up behind. He keeps the morning, and he is the only Keeper the Church has a use for: the sun-disc priests say his lamp is theirs. The hill people say he was crowing before there was a Church, and that he crows for the other seven as well, to tell them one more night is done. Since the sky went grey his lamp comes up pale. They say he is hoarse. They say you would be.',
    shape: [[0, 0], [-0.7, 2.4, 0.38], [0, 3.05, 0.42], [0.7, 2.5, 0.36], [2.1, 0.45, 0.32], [3.3, 1.9, 0.34], [3.8, 3.5, 0.44]],
    lines: [[1, 2], [2, 3], [1, 0], [0, 4], [4, 5], [5, 6], [3, 4]] });
  fig('k_hare', 'keeper', { name: 'The Hare', head: 'Driftday. Her lamp is the Scut, blue.', k: 5, along: true,
    story: 'Two long ears, a stretched back, and the blue lamp at the tail, which is all anybody ever sees of a hare. She keeps things going. She is drawn running along the Chord, and has been running along it for as long as there have been eyes, and has not got an inch further; and the hill people say that is what keeping is. Skyship men named their high wind for her day. They do not look up at her. They steer by ear.',
    shape: [[0, 0], [-2.0, 0.6, 0.36], [-4.0, 0.9, 0.38], [-5.8, 0.7, 0.4], [-6.8, 0.95, 0.46], [-6.9, 3.6, 0.3], [-6.0, 3.3, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [4, 6]] });
  fig('k_magpie', 'keeper', { name: 'The Magpie', head: 'Memoryday. Her lamp is the Bright Thing, violet.', k: 6,
    story: 'A black-and-white bird is hard to make of stars, so she is drawn by what she carries: a wing, a tail, and one violet lamp held in the beak. She keeps what is remembered. She took one shining thing from every person who ever lived, the story goes, and has them all, and can put her foot on any one of them. People leave a button on the stone for her on Memoryday. Nobody has ever seen a button go. Nobody leaves the good buttons.',
    shape: [[0, 0], [-0.9, 0.3, 0.42], [-2.4, -0.2, 0.48], [-2.0, 1.8, 0.34], [-3.4, 2.7, 0.3], [-4.6, -1.0, 0.36], [-6.2, -1.6, 0.3]],
    lines: [[0, 1], [1, 2], [2, 3], [3, 4], [2, 5], [5, 6]] });
  fig('k_owl', 'keeper', { name: 'The Owl', head: 'Nullday. His lamp is the Rest, grey-mauve.', k: 7,
    story: 'Two eyes, close together, and nothing else of him at all, because he keeps the rests: the quiet between one note and the next, which the hill people call <i>our</i> nothing. They are particular about the <i>our</i>. There is another quiet, they say, that belongs to nobody, and the Owl sits with his back to it so the rest of us need not look. Toward the Spire of Decay his lamp has been dim for seven years. Over the Rift it is not seen at all.',
    shape: [[0, 0], [3.0, 0, 0.5]], lines: [] });
  fig('k_sparrow', 'sparrow', { name: 'The Sparrow', head: 'Off the Chord. Three small stars, and you have to be told.',
    story: 'She is not a Keeper. She is the one who went along the Chord from gate to gate and asked each of them when they slept, and each said: <i>When somebody comes to say down for me.</i> She asked who was coming. The story does not have that part. The hill people say she is still asking, and that this is why her three stars sit a little off the road, on the side where a traveller would stand.',
    shape: [[3.2, -4.2, 0.28], [4.3, -4.9, 0.26], [3.7, -5.8, 0.25]], lines: [[0, 1], [1, 2]] });
  // the seven Signs, on the sun's road, the birth signs' order (js/calendar11.js p11c_sign 1..7)
  const arches = (() => { const s = [], l = []; for (let i = 0; i < 6; i++) s.push([-4 + i * 1.6, 0, 0.3]); for (let i = 0; i < 5; i++) { s.push([-3.2 + i * 1.6, 1.05, 0.34]); l.push([i, 6 + i], [6 + i, i + 1]); } s.push([0, 0.45, 0.8]); return { s, l }; })();
  fig('s_door', 'sign', { name: 'The Open Door', head: TX.signHead, sign: 1,
    story: 'Four stars for the frame, and nothing in it. It is the first sign a child is shown, because anybody can see a door. The story is short. Somebody left it open. The hill people have never agreed whether that was carelessness or kindness, and have noticed that the ones born under it do not much mind which.',
    shape: [[-1.5, -2.5, 0.42], [-1.5, 2.5, 0.6], [1.5, 2.5, 0.5], [1.5, -2.5, 0.38]], lines: [[0, 1], [1, 2], [2, 3]] });
  fig('s_cloister', 'sign', { name: 'The Cloister Walk', head: TX.signHead, sign: 2,
    story: 'A row of five arches, low on the road, with one bright star in the third. It is named for the walk at a house of sisters that nobody can now place, where one lamp was kept lit at the turn so the old ones would not fall. The lamp is the bright star. The rest is dark arches. Those born under it are said to be able to go a long way on one lamp.',
    shape: arches.s, lines: arches.l });
  fig('s_hound', 'sign', { name: 'The Hound\'s Step', head: TX.signHead, sign: 3,
    story: 'Four prints in a line, and a fifth set off to one side, where it stopped and turned its head. No hound; only where one has been. Hunters say it is the track of the first hound that ever came in from the sea, and that it was put in the sky so you would know the pattern when you saw it in mud. Those born under it hear the floor go quiet before other people do.',
    shape: [[-4.0, 0, 0.42], [-1.4, 0.35, 0.46], [1.2, 0, 0.55], [3.8, 0.35, 0.44], [4.6, 2.1, 0.38]], lines: [[0, 1], [1, 2], [2, 3], [3, 4]] });
  fig('s_light', 'sign', { name: 'The Floating Light', head: TX.signHead, sign: 4,
    story: 'One bright star with a small ring of faint ones under it, like a lantern with nobody holding it. On the marsh roads they say it is a wisp, and bad. On the Downs they say it is the lamp a mother leaves in the window, seen from so far off that you cannot see the house. Both agree it is always a little higher than it ought to be.',
    shape: [[0, 2.2, 0.8]].concat([0, 1, 2, 3, 4, 5].map((i) => [1.4 * Math.cos(i * TAU / 6), -1.0 + 1.0 * Math.sin(i * TAU / 6), 0.3])), lines: [[1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 1]] });
  fig('s_road', 'sign', { name: 'The Road-Song', head: TX.signHead, sign: 5, road: true,
    story: 'The longest sign: eleven stars in a wandering line that crosses a third of the sun\'s road and does not end in anything. Carters claim it. The song it is named for has a verse for every milestone between two towns nobody can name, and stops one verse short of home. You are meant to walk the last mile without it.',
    shape: [], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 10]] });
  fig('s_mourner', 'sign', { name: 'The Mourner\'s Hour', head: TX.signHead, sign: 6,
    story: 'A bowed figure of six stars, beside one alone. The one alone is not the dead; the dead are in the Fold. It is the candle. She sits the whole night with it, and the hour the sign is named for is the last one before dawn. The hill people say she is not sad. They say she is staying, and that these are different.',
    shape: [[0.9, 2.0, 0.4], [0, 1.5, 0.44], [-0.6, 0.4, 0.4], [-0.6, -0.8, 0.38], [0.6, -1.2, 0.34], [0.8, -2.3, 0.32], [2.7, -0.7, 0.58]], lines: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5]] });
  fig('s_fifth', 'sign', { name: 'The Broken Fifth', head: TX.signHead, sign: 7,
    story: 'Five places in a line, evenly spaced, and four stars. The fourth place is dark. Every child shown it says, without being told, that one is missing; and that is the whole of its teaching. Since the sky went grey there are tellers who count the dark place as a lamp put out. The older ones say no: it was always so, and the sign is there to teach the difference between a lamp that has gone out and a gap that was always there.',
    shape: [[-4, 0, 0.42], [-2, 0, 0.44], [0, 0, 0.6], [4, 0, 0.42]], lines: [[0, 1], [1, 2], [2, 3]] });
  // the loose five: [hue, mag]
  fig('w_yow', 'wanderer', { name: 'Yow', head: TX.looseHead, hue: [1, 1, 1], mag: 0.95,
    story: 'White, and the brightest thing in the sky after the Lantern. An old ewe who knows the way home and will not come. She is seen at dusk or before dawn and never in the deep of the night, like any ewe with sense.' });
  fig('w_lamb', 'wanderer', { name: 'The Lamb', head: TX.looseHead, hue: [0.96, 0.97, 1], mag: 0.4,
    story: 'Small and quick and never far from where the sun comes up. Most people have never seen it. The ones who have say it looks lost.' });
  fig('w_tup', 'wanderer', { name: 'Tup', head: TX.looseHead, hue: [1, 0.46, 0.36], mag: 0.62,
    story: 'Red. Slow to anger, and then not slow. When Tup stands in the Hound\'s Step the hill people bring the dogs in.' });
  fig('w_wether', 'wanderer', { name: 'Old Wether', head: TX.looseHead, hue: [1, 0.88, 0.52], mag: 0.66,
    story: 'Yellow and steady. He takes a man\'s whole working life to go once round the road. A child shown Old Wether in the Open Door is told: when he is back there, you will be old.' });
  fig('w_dog', 'wanderer', { name: 'The Dog', head: TX.looseHead, hue: [0.62, 0.76, 1], mag: 0.28,
    story: 'Faint and blue and always behind one of the others. Nobody has ever seen the Dog bring one in. It is the opinion of the Downs that he is not trying to; he is only seeing that none of them is out alone.' });
  // the three far folds: the sky's own galaxies (js/deepsky113.js GALAXIES: the tilted spiral, the small face-on spiral,
  // the pair of ragged clouds), framed in their own tangent planes; [az, el, frame centre X, Y, half-width, half-height]
  fig('g_farfold', 'fold', { name: 'The Far Fold', head: TX.foldHead, gal: [104, 20, 0, 0, 5.8, 1.0],
    story: 'The nearest of the other folds. On the clearest nights you can see that it leans, the way a flock leans on a hillside.' });
  fig('g_wheel', 'fold', { name: 'The Wheel', head: TX.foldHead, gal: [48, 22, 0, 0, 3.6, 0.8],
    story: 'A carter\'s wheel stood on its rim, as they stand one over a carter\'s grave. Whose, nobody says.' });
  fig('g_fleeces', 'fold', { name: 'The Two Fleeces', head: TX.foldHead, gal: [76, 10, 5.5, 1.75, 12, 1.5],
    story: 'Two fleeces left on a hedge to dry by somebody who meant to come back for them.' });
  fig('m_lantern', 'lantern', { name: 'The Lantern', head: TX.lanternHead,
    story: 'The shepherd\'s lantern: trimmed over four nights and let down over four, the same as the week. The hill people do not think that is chance. When the Lantern is full the Fold is hard to count, and they say the shepherd is doing it for them that night.' });
  const ALL_BITS = (1 << ORDER.length) - 1;
  const KEEPERS = ORDER.filter((id) => FIG[id].kind === 'keeper');
  const SIGNS = ORDER.filter((id) => FIG[id].kind === 'sign');
  const LOOSE = ORDER.filter((id) => FIG[id].kind === 'wanderer');

  // ================================================================ the sky's geometry (js/deepsky113.js's, repeated so the
  // table and the stones do not depend on the sky module being loaded; the test checks the two agree)
  const dirOfAE = (az, el) => [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)];
  const nrm = (v) => { const l = Math.hypot(v[0], v[1], v[2]) || 1; return [v[0] / l, v[1] / l, v[2] / l]; };
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const aeOf = (d) => ({ az: Math.atan2(d[1], d[0]), el: Math.asin(clamp(d[2], -1, 1)) });
  const N = nrm([0.35, 0.82, 0.45]);
  const ARC_T = nrm([-(N[2] * N[0]), -(N[2] * N[1]), 1 - N[2] * N[2]]);
  let ARC_H = nrm(cross([0, 0, 1], N)); if (Math.atan2(ARC_H[1], ARC_H[0]) < 0) ARC_H = [-ARC_H[0], -ARC_H[1], -ARC_H[2]];
  function chord(t) { const th = clamp(+t || 0, 0, 1) * PI, c = Math.cos(th), s2 = Math.sin(th); return aeOf([c * ARC_H[0] + s2 * ARC_T[0], c * ARC_H[1] + s2 * ARC_T[1], c * ARC_H[2] + s2 * ARC_T[2]]); }
  // the sun's road by its angle A from the rising point (0 east, PI west; PI..TAU under the horizon); sunRoad(t) is A = t PI
  const roadAE = (A) => ({ az: Math.atan2(Math.sin(A), Math.cos(A)), el: Math.asin(clamp(Math.sin(A), -1, 1)) * 0.74 });
  const NOTE_RGB = [[74, 156, 98], [180, 96, 62], [118, 128, 150], [186, 158, 86], [108, 196, 206], [100, 154, 206], [154, 112, 200], [124, 114, 134]];
  const noteRgb = (k) => { const c = NOTE_RGB[k], m = Math.max(c[0], c[1], c[2]); return [0.72 + 0.28 * c[0] / m, 0.72 + 0.28 * c[1] / m, 0.72 + 0.28 * c[2] / m]; };
  function frameOf(az, el) { const d = dirOfAE(az, el), e = nrm(cross([0, 0, 1], d)), n = cross(d, e); return { d, e, n }; }
  function fromT(F, X, Y) { const tx = Math.tan(X * D2R), ty = Math.tan(Y * D2R); return aeOf(nrm([F.d[0] + tx * F.e[0] + ty * F.n[0], F.d[1] + tx * F.e[1] + ty * F.n[1], F.d[2] + tx * F.e[2] + ty * F.n[2]])); }
  function toT(F, dir) { const z = dot(dir, F.d); return [Math.atan2(dot(dir, F.e), z) * R2D, Math.atan2(dot(dir, F.n), z) * R2D]; }
  function middle(C) { let v = [0, 0, 0]; for (const s of C.stars) { const d = dirOfAE(s.az, s.el); v = [v[0] + d[0], v[1] + d[1], v[2] + d[2]]; } return aeOf(nrm(v)); }
  const SIGN_T = (k) => 0.08 + k * (0.84 / 6);

  // the loose five on the road, by the day (deterministic: no chance, only the day count)
  const frac = (x) => x - Math.floor(x);
  function road(id, day) {
    const d = +day || 0;
    if (id === 'w_yow') { const p = frac(d / 224 + 0.3); return p < 0.5 ? PI - 45 * D2R * Math.sin(TAU * p) : 45 * D2R * Math.sin(TAU * (p - 0.5)); }   // the evening side, then the morning side
    if (id === 'w_lamb') return 25 * D2R * Math.sin(TAU * (d / 116 + 0.15));
    if (id === 'w_tup') return wrapA(TAU * (d / 400 + 0.13));
    if (id === 'w_wether') return wrapA(TAU * (d / 4320 + 0.37));   // twelve game years of 360 days
    if (id === 'w_dog') {
      const base = TAU * (d / 700 + 0.61); let best = null, bd = 9;
      for (const o of ['w_yow', 'w_lamb', 'w_tup', 'w_wether']) { const a = road(o, d), g = angD(a, base); if (g < bd) { bd = g; best = a; } }
      return wrapA(best - 4 * D2R);
    }
    return 0;
  }
  const road2 = (A) => ((A % TAU) + TAU) % TAU;
  // the loose five in the order they stand along the sun's road from its rising, now
  function wetherOrder(day) { return LOOSE.slice().sort((a, b) => road2(road(a, day)) - road2(road(b, day)) || (a < b ? -1 : 1)); }
  // the call: three, one, four, two, five (wethm1 rings the third, wethm2 the first ...)
  const CALL = [3, 1, 4, 2, 5];
  function wetherFig(i, day) { return wetherOrder(day)[CALL[clamp(i | 0, 1, 5) - 1] - 1]; }

  // ================================================================ the table
  function buildCons() {
    const cons = [];
    for (const id of KEEPERS) {
      const f = FIG[id], lamp = chord((2 * f.k + 1) / 16), F = frameOf(lamp.az, lamp.el);
      let rot = 0;
      if (f.along) { const p = toT(F, dirOfAE(chord((2 * f.k + 1) / 16 + 0.02).az, chord((2 * f.k + 1) / 16 + 0.02).el)); rot = Math.atan2(p[1], p[0]) + PI; }
      const cr = Math.cos(rot), sr = Math.sin(rot);
      const stars = f.shape.map(([X, Y, m], i) => {
        if (i === 0) return { az: lamp.az, el: lamp.el, mag: 0.6, hue: noteRgb(f.k) };
        const p = fromT(F, X * cr - Y * sr, X * sr + Y * cr); return { az: p.az, el: p.el, mag: m, hue: null };
      });
      cons.push({ id, stars, lines: f.lines.map((l) => l.slice()) });
    }
    { const f = FIG.k_sparrow, lamp = chord(1 / 16), F = frameOf(lamp.az, lamp.el);
      cons.push({ id: 'k_sparrow', stars: f.shape.map(([X, Y, m]) => { const p = fromT(F, X, Y); return { az: p.az, el: p.el, mag: m, hue: null }; }), lines: f.lines.map((l) => l.slice()) }); }
    SIGNS.forEach((id, k) => {
      const f = FIG[id], t = SIGN_T(k);
      let stars;
      if (f.road) {
        // eleven in a wandering line across a third of the road, a little above it, faint (the middle one the brightest)
        stars = [];
        for (let i = 0; i < 11; i++) {
          const ti = t - 1 / 6 + i / 30, c = roadAE(ti * PI), F = frameOf(c.az, c.el);
          const p = fromT(F, 0, 3.2 + 1.6 * Math.sin(i * 1.9 + 0.4) + 0.8 * Math.sin(i * 0.7));
          stars.push({ az: p.az, el: p.el, mag: i === 5 ? 0.45 : 0.3 + 0.08 * hh(i, 3, 113), hue: [0.94, 0.95, 1] });
        }
      } else {
        const c = roadAE(t * PI), F = frameOf(c.az, c.el);
        let mx = 0, my = 0; for (const s of f.shape) { mx += s[0]; my += s[1]; } mx /= f.shape.length; my /= f.shape.length;
        stars = f.shape.map(([X, Y, m]) => { const p = fromT(F, X - mx, Y - my); return { az: p.az, el: p.el, mag: m, hue: [0.95, 0.96, 1] }; });
      }
      cons.push({ id, stars, lines: f.lines.map((l) => l.slice()) });
    });
    for (const id of ORDER.filter((q) => FIG[q].kind === 'fold')) {
      const [az, el, cx, cy, hw, hhh] = FIG[id].gal, F = frameOf(az * D2R, el * D2R);
      const stars = [[cx - hw, cy], [cx + hw, cy], [cx, cy - hhh], [cx, cy + hhh]].map(([X, Y]) => { const p = fromT(F, X, Y); return { az: p.az, el: p.el, mag: 0.3, hue: null }; });
      cons.push({ id, stars, lines: [], frame: true });
    }
    return cons;
  }
  let CONS = null;
  function buildLore(day) {
    if (!CONS) CONS = buildCons();
    const d = Math.floor(+day || 0);
    const cons = CONS.map((c) => ({ id: c.id, stars: c.stars.map((s) => ({ az: s.az, el: s.el, mag: s.mag, hue: s.hue ? s.hue.slice() : null })), lines: c.lines.map((l) => l.slice()), frame: c.frame === true }));
    const wanderers = LOOSE.map((id) => { const p = roadAE(road(id, d)); return { id, az: p.az, el: p.el, mag: FIG[id].mag, hue: FIG[id].hue.slice() }; });
    return { cons, wanderers, day: d };
  }
  // the brightest star of each fixed figure (its lamp), or a frame's middle
  for (const id of ORDER) {
    const f = FIG[id];
    if (f.kind === 'keeper') f.aim = 0;
    else if (f.kind === 'sparrow' || f.kind === 'sign') { const L = buildLore(0).cons.find((c) => c.id === id); let bi = 0; L.stars.forEach((s, i) => { if (s.mag > L.stars[bi].mag) bi = i; }); f.aim = bi; }
  }
  const TABLE = { obj: null, day: null };
  function ensureTable(force) {
    try {
      if (typeof window === 'undefined') return;
      const day = hasG() ? G.day | 0 : 0;
      const cur = window.STARLORE113;
      if (!force && cur !== TABLE.obj && cur !== undefined) return;   // somebody else's table (a test's): leave it
      if (!force && cur === undefined && TABLE.obj) return;
      if (cur === TABLE.obj && TABLE.day === day && TABLE.obj) return;
      TABLE.obj = buildLore(day); TABLE.day = day; window.STARLORE113 = TABLE.obj;
    } catch (e) { warnOnce('table', e); }
  }
  function aimAt(id, day, tod) {
    const f = FIG[id]; if (!f) return { az: 0, el: 0 };
    if (f.kind === 'lantern') {
      const t = +tod || 0, elev = Math.cos((t - 0.5) * TAU);
      if (!(elev < 0.02)) return { az: wrapA((t - 0.25) * TAU + PI), el: -0.3 };   // by day the Lantern is down
      return { az: wrapA((t - 0.25) * TAU + PI), el: Math.max(0.12, Math.asin(clamp(-elev, -1, 1)) * 0.74) };
    }
    if (f.kind === 'wanderer') return roadAE(road(id, day));
    if (!CONS) CONS = buildCons();
    const C = CONS.find((c) => c.id === id);
    if (f.kind === 'fold') return middle(C);
    const s = C.stars[f.aim]; return { az: s.az, el: s.el };
  }
  const aim = (id) => aimAt(id, hasG() ? G.day : 0, hasG() ? G.tod : 0);

  // ================================================================ the stones: where they stand
  // kind: week (a peg behind a Weekstone), sparrow, needle, notch, wether, barrow; blind: the TX key of its line
  const SITES = [];
  for (let i = 0; i < 8; i++) SITES.push({ key: 'wk' + i, kind: 'week', map: 'p47_stones', fig: KEEPERS[i], stone: i });
  SITES.push({ key: 'sparrow', kind: 'sparrow', map: 'p47_stones', fig: 'k_sparrow' });
  for (const [key, map, x, y, f] of [['n_door', 'clearing', 7.5, 30.5, 's_door'], ['n_cloister', 'p83_stride', 39.5, 21.5, 's_cloister'], ['n_hound', 'p83_hollows', 54.5, 141.5, 's_hound'], ['n_light', 'p79_road_e', 84.5, 27.5, 's_light'], ['n_road', 'p79_road_w', 84.5, 42.5, 's_road'], ['n_mourner', 'p79_greenroad', 42.5, 48.5, 's_mourner'], ['n_fifth', 'p83_poundstair', 24.5, 15.5, 's_fifth']]) SITES.push({ key, kind: 'needle', map, at: [x, y], fig: f });
  for (let i = 1; i <= 5; i++) SITES.push({ key: 'we' + i, kind: 'wether', map: 'p83_wethers', wether: i });
  SITES.push({ key: 'barrow', kind: 'barrow', map: 'p22_combe', fig: 'm_lantern', near: [6.6, 50.4] });
  for (const [key, map, x, y, f] of [['t_far', 'p20_downs', 21.5, 15.5, 'g_farfold'], ['t_wheel', 'p79_greenroad', 132.5, 39.5, 'g_wheel'], ['t_fleece', 'p22_combe', 9.5, 18.5, 'g_fleeces']]) SITES.push({ key, kind: 'notch', map, at: [x, y], fig: f });
  SITES.push({ key: 'b_rift', kind: 'needle', map: 'p100_wall', yard: [296, 90, 318, 108], fig: 'k_owl', blind: 'blindRift', cant: true });
  SITES.push({ key: 'b_heights', kind: 'needle', map: 'p96_cliffs', at: [24.5, 65.5], fig: 'k_cockerel', blind: 'blindHeights' });
  const WEEKDAYS = ['Rootday', 'Hearthday', 'Massday', 'Stasisday', 'Dawnday', 'Driftday', 'Memoryday', 'Nullday'];
  const WEEK_LABEL = WEEKDAYS.map((d) => S(d + '\'s stone, and a cup-marked peg in the turf behind it'));
  const MARR = 'p113f_marrable';

  // the sprites' proportions (see paint): a needle's eye centre at NE_F of its height, radius NE_R of it; a notch's
  // sight line through NO_F of the tall stone's height
  const NE_W = 33, NE_H = 84, NE_HS = 2.6, NE_EY = 32, NE_F = 1 - (NE_EY + 0.5) / NE_H, NE_RPX = 4.5, NE_R = NE_RPX / NE_H;
  const NO_W = 30, NO_H = 60, NO_HS = 1.9, NO_F = 0.84;
  const TRACK_RE = /road|track|cobble|plank|^t_wood$|flag|sett\b|_walk|lane/i;
  const trackCache = new WeakMap();
  function trackCells(m) {
    let t = trackCache.get(m); if (t) return t;
    t = [];
    if (m.floorCells && m.floorTextures) {
      const ok = m.floorTextures.map((n) => typeof n === 'string' && TRACK_RE.test(n));
      for (let i = 0; i < m.floorCells.length; i++) if (ok[m.floorCells[i]]) t.push((i % m.w) + 0.5, Math.floor(i / m.w) + 0.5);
    }
    trackCache.set(m, t); return t;
  }
  function trackDist(m, x, y) { const t = trackCells(m); let best = 1e9; for (let i = 0; i < t.length; i += 2) { const d = (t[i] - x) * (t[i] - x) + (t[i + 1] - y) * (t[i + 1] - y); if (d < best) best = d; } return Math.sqrt(best); }
  const spriteH = (o) => { let hs = 1; try { const sp = typeof Engine !== 'undefined' && Engine.sprites ? Engine.sprites[o.sprite] : null; if (sp && sp.hs) hs = sp.hs; } catch (e) { /* none */ } return (o.scale || 1) * hs; };
  function openAt(m, x, y, rad, mine) {
    if (x < 1.5 || y < 1.5 || x > m.w - 1.5 || y > m.h - 1.5) return false;
    const cx = Math.floor(x), cy = Math.floor(y);
    if (m.isBlocked(cx, cy)) return false;
    for (let j = cy - 1; j <= cy + 1; j++) for (let i = cx - 1; i <= cx + 1; i++) { const c = m.get(i, j); if (c && (c.portal || c.door)) return false; }
    for (const o of m.entities) {
      if (!o || o.kind === 'item') continue;
      const d = Math.hypot(o.x - x, o.y - y);
      if (o.kind === 'npc' && d < 1.6) return false;
      if ((o.solid || o._p113f) && o.kind !== 'enemy' && d < (o.radius || 0.35) + rad) return false;
    }
    if (mine) for (const p of mine) if (Math.hypot(p[0] - x, p[1] - y) < p[2] + rad) return false;
    return true;
  }
  // the line of sight from the stand, along the figure's bearing, 12 cells: nothing standing above the line
  function sightClear(m, s) {
    const az = s.az, el = s.el, ca = Math.cos(az), sa = Math.sin(az), g0 = m.groundAt(s.sx, s.sy), k = Math.tan(Math.max(0, el)) / ZK;
    for (let t = 0.3; t <= 12; t += 0.25) {
      const x = s.sx + ca * t, y = s.sy + sa * t;
      if (x < 0 || y < 0 || x >= m.w || y >= m.h) return { ok: true };
      const zL = g0 + EYE + t * k;
      const c = m.get(Math.floor(x), Math.floor(y)), gx = m.groundAt(Math.floor(x) + 0.5, Math.floor(y) + 0.5);
      if (c && m.isSolidCell(Math.floor(x), Math.floor(y)) && gx + (c.top != null ? c.top : 1.6) > zL) return { ok: false, at: t.toFixed(2) + ' (wall)' };
      if (m.groundAt(x, y) > zL) return { ok: false, at: t.toFixed(2) + ' (ground)' };
      for (const o of m.entities) {
        if (!o || !o.solid || o.kind === 'enemy' || o.kind === 'item' || o._p113f === s.key) continue;
        if (Math.hypot(o.x - x, o.y - y) > (o.radius || 0.35)) continue;
        if (m.groundAt(o.x, o.y) + spriteH(o) > zL) return { ok: false, at: t.toFixed(2) + ' (' + (o.sprite || o.id) + ')' };
      }
    }
    return { ok: true };
  }
  function addBase(m, e) {
    if (m.baseCount == null) return e;
    const i = m.entities.lastIndexOf(e); if (i < 0) return e;
    m.entities.splice(i, 1); m.entities.splice(m.baseCount, 0, e); m.baseCount++;
    return e;
  }
  // the stand and the stone for a sighting along (az, el): the stone at P, the stand d back; a needle's eye or a notch's
  // notch is set where the line from the eye at the stand passes the stone
  function geometry(m, kind, P, a, blind) {
    const ca = Math.cos(a.az), sa = Math.sin(a.az), tn = Math.tan(Math.max(0.02, a.el));
    let d = 1.2;
    for (let it = 0; it < 3; it++) {
      const sx = P[0] - ca * d, sy = P[1] - sa * d, dG = m.groundAt(P[0], P[1]) - m.groundAt(sx, sy);
      if (kind === 'needle' && !blind) d = clamp((NE_F * NE_HS - EYE + dG) * ZK / tn, 0.5, 1.2);
    }
    const sx = P[0] - ca * d, sy = P[1] - sa * d;
    const zE = m.groundAt(sx, sy) + EYE + d * tn / ZK - m.groundAt(P[0], P[1]);
    let H;
    if (blind) H = NE_HS;
    else if (kind === 'needle') H = Math.max(1.6, zE / NE_F);
    else H = Math.max(1.2, zE / NO_F);
    return { d, sx, sy, H, zE };
  }
  const ringOrder = (r) => { const n = Math.max(1, Math.round(TAU * r / 0.5)), out = []; for (let k = 0; k < n; k++) out.push(k * TAU / n); return out; };
  function placeSite(maps, s, mine) {
    const m = maps[s.map]; if (!m || !m.entities) return null;
    const A = s.fig ? aimAt(s.fig, 0, 0) : null;
    const mk = (sprite, x, y, o) => { const e = addBase(m, m.deco(sprite, x, y, Object.assign({ _p113f: s.key, site: s.key }, o))); return e; };
    const R = { key: s.key, kind: s.kind, map: s.map, fig: s.fig || null, blind: s.blind || null, cant: !!s.cant, x: null, y: null, sx: null, sy: null, az: A ? A.az : 0, el: A ? A.el : 0, moved: 0, wether: s.wether || null };
    if (s.kind === 'week') {
      if (typeof STONES47 === 'undefined' || !STONES47.stoneAt) return null;
      const w = STONES47.stoneAt(s.stone); R.sx = w.x - 1.2 * Math.cos(A.az); R.sy = w.y - 1.2 * Math.sin(A.az); R.weekstone = s.stone;
      mk('p113f_peg', R.sx, R.sy, { solid: false, radius: 0.22, scale: 1, label: WEEK_LABEL[s.stone], use: 'p113f_sight', peg: true, _s: R });
      mine.push([R.sx, R.sy, 0.3]); return R;
    }
    if (s.kind === 'sparrow') {
      const c = typeof STONES47 !== 'undefined' ? STONES47.RING : { x: 18.5, y: 15.0, r: 5.6 };
      let P = null;
      for (let r = 7.3; r < 12 && !P; r += 0.4) for (const da of [0, -0.12, 0.12, -0.25, 0.25]) { const q = [c.x + r * Math.cos(A.az + da), c.y + r * Math.sin(A.az + da)]; if (openAt(m, q[0], q[1], 0.6, mine)) { P = q; R.moved = r - 7.3; break; } }
      if (!P) return null;
      R.sx = P[0]; R.sy = P[1];
      mk('p113f_sparrow', P[0], P[1], { solid: false, radius: 0.3, scale: 1, label: TX.sparrowStone, use: 'p113f_sight', peg: true, _s: R });
      mine.push([P[0], P[1], 0.4]); return R;
    }
    if (s.kind === 'wether') {
      const w = m.entities.find((o) => o && o.sprite === 'p83_wethm' + s.wether); if (!w) return null;
      // a peg at its foot, on the side away from the sun's road (north), or the nearest open side
      for (const da of [0, 0.5, -0.5, 1, -1, 1.5, -1.5, 2, -2, 2.6, -2.6, PI]) for (const r of [1.2, 1.5, 1.9]) {
        const a = -PI / 2 + da, q = [w.x + r * Math.cos(a), w.y + r * Math.sin(a)];
        if (openAt(m, q[0], q[1], 0.55, mine) && trackDist(m, q[0], q[1]) >= 3) {
          R.sx = q[0]; R.sy = q[1]; R.x = null; R.wetherAt = [w.x, w.y];
          mk('p113f_pegred', q[0], q[1], { solid: false, radius: 0.22, scale: 1, label: TX.wether, use: 'p113f_sight', peg: true, _s: R });
          mine.push([q[0], q[1], 0.3]); return R;
        }
      }
      return null;
    }
    if (s.kind === 'barrow') {
      const door = m.entities.find((o) => o && o.sprite === 'p22_sarsen') || { x: s.near[0], y: s.near[1] };
      for (const da of [0, -0.6, 0.6, -1.2, 1.2, -1.8, 1.8, PI]) for (const r of [1.3, 1.7, 2.2]) {
        const q = [door.x + r * Math.cos(da), door.y + r * Math.sin(da)];
        if (openAt(m, q[0], q[1], 0.55, mine) && trackDist(m, q[0], q[1]) >= 3) {
          R.sx = q[0]; R.sy = q[1];
          mk('p113f_peg', q[0], q[1], { solid: false, radius: 0.22, scale: 1, label: TX.barrow, use: 'p113f_sight', peg: true, _s: R });
          mine.push([q[0], q[1], 0.3]); return R;
        }
      }
      return null;
    }
    // a needle or a notch: from the surveyed cell, the least move that clears every rule
    let P0 = s.at, cands = [];
    if (s.yard) {
      // the Rift's mooring-yard: the open cell farthest from the stair, the mast, the doors and every person
      const [x0, y0, x1, y1] = s.yard, avoid = [];
      for (const o of m.entities) if (o && (o.kind === 'npc' || /mast|kestrel/.test(o.sprite || ''))) avoid.push([o.x, o.y]);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const c = m.get(x, y), f = m.floorCells && m.floorTextures ? m.floorTextures[m.floorCells[y * m.w + x]] : ''; if ((c && (c.portal || c.door)) || /step/.test(f || '')) avoid.push([x + 0.5, y + 0.5]); }
      let best = null, bd = -1;
      for (let y = y0 + 1; y < y1; y++) for (let x = x0 + 1; x < x1; x++) {
        const q = [x + 0.5, y + 0.5]; let md = 1e9; for (const a of avoid) md = Math.min(md, Math.hypot(a[0] - q[0], a[1] - q[1]));
        if (md > bd && md >= 3) { const g = geometry(m, 'needle', q, A, true); if (openAt(m, q[0], q[1], 0.7, mine) && openAt(m, g.sx, g.sy, 0.55, mine)) { bd = md; best = q; } }
      }
      if (best) cands = [best]; P0 = best || [s.yard[0], s.yard[1]];
    } else {
      for (let r = 0; r <= 12; r += 0.5) for (const a of ringOrder(r)) cands.push([P0[0] + r * Math.cos(a), P0[1] + r * Math.sin(a)]);
    }
    for (const P of cands) {
      const g = geometry(m, s.kind, P, A, !!s.blind);
      if (!openAt(m, P[0], P[1], 0.7, mine) || !openAt(m, g.sx, g.sy, 0.55, mine)) continue;
      if (!s.blind && (trackDist(m, P[0], P[1]) < 3 || trackDist(m, g.sx, g.sy) < 3)) continue;
      if (Math.abs(m.groundAt(P[0], P[1]) - m.groundAt(g.sx, g.sy)) > 0.6) continue;
      Object.assign(R, { x: P[0], y: P[1], sx: g.sx, sy: g.sy, d: g.d, H: g.H, zE: g.zE, moved: Math.hypot(P[0] - P0[0], P[1] - P0[1]) });
      if (!s.blind && !sightClear(m, R).ok) continue;
      const sprite = s.kind === 'notch' ? 'p113f_notch_' + s.fig : s.cant ? 'p113f_cant' : 'p113f_needle_' + s.fig;
      const lab = s.kind === 'notch' ? TX.notch : s.cant ? TX.canted : TX.needle;
      const hs = s.kind === 'notch' ? NO_HS : NE_HS;
      mk(sprite, P[0], P[1], { solid: true, radius: 0.3, scale: g.H / hs, label: lab, use: 'p113f_sight', stoneOf: true, _s: R });
      mk(s.kind === 'notch' ? 'p113f_notchlow' : 'p113f_peg', g.sx, g.sy, { solid: false, radius: 0.22, scale: 1, label: lab, use: 'p113f_sight', peg: true, _s: R });
      mine.push([P[0], P[1], 0.45], [g.sx, g.sy, 0.3]);
      return R;
    }
    warnOnce('site ' + s.key, 'no open ground');
    return null;
  }
  function placeMarrable(maps, mine) {
    const m = maps.p47_stones; if (!m || typeof STONES47 === 'undefined' || typeof NPCS === 'undefined' || !NPCS[MARR]) return;
    const f = STONES47.stoneAt(7), c = STONES47.RING, out = Math.atan2(f.y - c.y, f.x - c.x);
    for (const r of [1.1, 1.4, 1.8]) for (const da of [0.5, -0.5, 0.9, -0.9, 0, 1.4, -1.4]) {
      const q = [f.x + r * Math.cos(out + da), f.y + r * Math.sin(out + da)];
      if (!openAt(m, q[0], q[1], 0.5, mine)) continue;
      const e = addBase(m, m.npc(MARR, q[0], q[1], { facing: Math.atan2(f.y - q[1], f.x - q[0]), _p113f: 'marr', hidden: true }));
      void e; return;
    }
  }
  function place(maps) {
    if (!maps) return;
    // idempotent: a map that has its stones keeps them. What is placed is remembered per map (a spot on one map says
    // nothing about the same numbers on another)
    const mine = {};
    for (const s of SITES) {
      const m = maps[s.map]; if (!m || !m.entities) continue;
      if (m.entities.some((e) => e && e._p113f === s.key)) continue;
      try { placeSite(maps, s, mine[s.map] || (mine[s.map] = [])); } catch (e) { warnOnce('place ' + s.key, e); }
    }
    try { if (maps.p47_stones && !maps.p47_stones.entities.some((e) => e && e._p113f === 'marr')) placeMarrable(maps, mine.p47_stones || []); } catch (e) { warnOnce('marrable', e); }
  }
  function sites(maps) {
    maps = maps || (hasG() ? G.maps : null); if (!maps) return [];
    const out = [];
    for (const s of SITES) { const m = maps[s.map]; if (!m) continue; const e = m.entities.find((o) => o && o._p113f === s.key && o._s); if (e) out.push(e._s); }
    return out;
  }
  const siteOf = (key) => sites().find((s) => s.key === key) || null;

  // ================================================================ flags
  const LIMITS = { p113f_seen: ALL_BITS, p113f_blind: 3, p113f_marr: 7 };
  function flag(k) { if (!hasG() || !G.flags) return 0; const v = G.flags[k]; return Number.isInteger(v) && v >= 0 && v <= LIMITS[k] ? v : 0; }
  function setFlag(k, v) { if (hasG() && G.flags) G.flags[k] = clamp(v | 0, 0, LIMITS[k]); }
  function markSeen(id) {
    const f = FIG[id]; if (!f) return;
    const was = flag('p113f_seen'), now2 = was | (1 << f.bit); if (now2 === was) return;
    setFlag('p113f_seen', now2);
    try { if (!was) journal('side', TX.jFirst); } catch (e) { /* none */ }
    try { if (now2 === ALL_BITS) journal('side', TX.jAll); } catch (e) { /* none */ }
  }

  // ================================================================ the view
  const V = { open: false, fig: null, mode: null, site: null, timers: [] };
  const TURN = { on: false };
  const isDay = (tod) => !(Math.cos(((+tod || 0) - 0.5) * TAU) < 0.02);
  function moonVis() {
    try { const st = typeof Weather !== 'undefined' && Weather.STATES ? Weather.STATES[Weather.state] : null, cl = st ? st.cloud || 0 : 0; return clamp(1 - Math.max(0, cl - 0.08) * 1.4, 0, 1); } catch (e) { return 1; }
  }
  function visibleOf(id) {
    const f = FIG[id]; if (!f || !hasG() || !G.map || !G.map.outdoor) return 0;
    if (f.kind === 'lantern') return moonVis();
    ensureTable(true);
    try { return typeof DEEPSKY113 !== 'undefined' && DEEPSKY113.visible ? DEEPSKY113.visible(id) : 0; } catch (e) { return 0; }
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || e.use.indexOf('p113f_') !== 0) return false;
    const s = e._s || siteOf(e.site); if (!s) return true;
    sight(s); return true;
  }
  function camAngle() { try { return typeof R3D !== 'undefined' && R3D.camera ? R3D.camera.angle() : Math.atan((Engine.cam.pitch || 0) / FXL); } catch (e) { return 0; } }
  function setCamAngle(a) { try { if (typeof R3D !== 'undefined' && R3D.camera) R3D.camera.setAngle(a); else Engine.cam.pitch = clamp(FXL * Math.tan(a), -40, 40); } catch (e) { /* none */ } }
  function camLimit() { try { return typeof R3D !== 'undefined' && R3D.camera ? R3D.camera.limit() : Math.atan(40 / FXL); } catch (e) { return 0.16; } }
  function sight(s) {
    if (V.open || TURN.on || !hasG()) return;
    const id = s.kind === 'wether' ? wetherFig(s.wether, G.day) : s.fig;
    const a = aimAt(id, G.day, G.tod), c = Engine.cam, lim = camLimit();
    Object.assign(TURN, { on: true, t0: now(), dur: 500, s, id,
      from: { x: c.x, y: c.y, dir: c.dir, pa: camAngle() },
      to: { x: s.sx, y: s.sy, dir: a.az, pa: clamp(Math.max(0, a.el), -lim, lim) } });
    try { releaseMouse(); } catch (e) { /* not ready */ }
    G.state = 'event'; G.keys = {};
    const step = () => { if (!TURN.on) return; const k = clamp((now() - TURN.t0) / TURN.dur, 0, 1); poseAt(k); if (k >= 1) finishTurn(); else setTimeout(step, 16); };
    setTimeout(step, 16);
  }
  function poseAt(k) {
    const e = k * k * (3 - 2 * k), A = TURN.from, B = TURN.to, c = Engine.cam;
    c.x = A.x + (B.x - A.x) * e; c.y = A.y + (B.y - A.y) * e;
    c.dir = A.dir + wrapA(B.dir - A.dir) * e;
    setCamAngle(A.pa + (B.pa - A.pa) * e);
    try { if (G.player && G.map) { G.player.feet = G.map.groundAt(c.x, c.y); c.z = G.player.feet + EYE; } } catch (er) { /* none */ }
  }
  function finishTurn() {
    if (!TURN.on) return;
    poseAt(1); Engine.cam.dir = TURN.to.dir; TURN.on = false;
    openView(TURN.s, TURN.id);
  }
  const esc = (t) => String(t);
  let styled = false;
  function style() {
    if (styled || typeof document === 'undefined') return; styled = true;
    const st = document.createElement('style');
    // the chart keeps its size; the words under it scroll (a long story, or French, never shrinks the type)
    st.textContent = '#event-panel.p113f-view{width:84cqw;max-height:94cqh}' +
      '#event-panel.p113f-view canvas.p113f-chart{flex:none;display:block;width:100%;height:44cqh;image-rendering:pixelated;image-rendering:crisp-edges;margin:.4cqh 0 .8cqh;border:2px solid;border-color:var(--edge-d) var(--edge-l) var(--edge-l) var(--edge-d);background:#05060a}' +
      '#event-panel.p113f-view .p113f-text{flex:1 1 auto;min-height:0;overflow-y:auto;padding-right:.6cqw}' +
      '#event-panel.p113f-view > p.p113f-line{flex:none;overflow:visible;color:var(--parch-dim);font-style:italic;margin:.2cqh 0 .4cqh}' +
      '#event-panel.p113f-view .p113f-head{color:var(--gold);margin:.2cqh 0 .5cqh}' +
      '#event-panel.p113f-view .p113f-phase{color:var(--gold);font-variant:small-caps;letter-spacing:.06em;margin:-.3cqh 0 .5cqh}' +
      '#event-panel.p113f-view .p113f-say{color:var(--parch-dim);font-style:italic}' +
      '#event-panel.p113f-view .p113f-own{color:var(--gold);font-style:italic}';
    document.head.appendChild(st);
  }
  function openView(s, id) {
    if (!hasG()) return;
    const f = FIG[id] || null;
    let mode = 'sky', line = '';
    const a = f ? aimAt(id, G.day, G.tod) : null;
    if (s.blind) mode = 'blind';
    else if (isDay(G.tod)) { mode = 'face'; line = TX.byDay; }
    else if ((f.kind === 'wanderer' || f.kind === 'lantern') && a.el < 0.017) { mode = 'face'; line = TX.down; }
    else if (visibleOf(id) < 0.45) { mode = 'face'; line = TX.tooLight; }
    else if (f.kind === 'lantern') mode = 'moon';
    Object.assign(V, { open: true, fig: id, mode, site: s.key, line });
    style();
    const p = document.getElementById('event-panel'); if (!p) return;
    p.classList.add('p113f-view');
    let html;
    if (mode === 'blind') {
      html = '<h2>' + esc(s.cant ? TX.canted : TX.needle) + '</h2><canvas class="p113f-chart" data-kind="blind"></canvas><div class="p113f-text"><p>' + esc(TX[s.blind]) + '</p></div>';
    } else {
      html = '<h2>' + esc(f.name) + '</h2>' + (line ? '<p class="p113f-line">' + esc(line) + '</p>' : '') +
        '<canvas class="p113f-chart" data-kind="' + (mode === 'face' ? 'face' : mode) + '"></canvas><div class="p113f-text">' +
        '<p class="p113f-head"><i>' + esc(f.head) + '</i></p>' +
        (f.kind === 'lantern' ? '<p class="p113f-phase">' + esc(moonName()) + '</p>' : '') +
        '<p class="p113f-story">' + esc(f.story) + '</p>' +
        (f.kind === 'fold' ? '<p class="p113f-say">' + esc(TX.foldsSay) + '</p>' : '') +
        (f.kind === 'sign' && ownSign() === f.sign ? '<p class="p113f-own">' + esc(TX.ownSign) + '</p>' : '') + '</div>';
    }
    html += '<div class="list" style="margin-top:1cqh"><button class="dfbtn" data-p113f="leave">' + esc(TX.leave) + '</button></div>';
    p.innerHTML = html;
    try { show('#event'); } catch (e) { /* none */ }
    G.state = 'event';
    const b = p.querySelector('button[data-p113f="leave"]'); if (b) b.onclick = () => closeView();
    p.scrollTop = 0;
    if (mode === 'sky' || mode === 'moon') markSeen(id);
    if (mode === 'blind') setFlag('p113f_blind', flag('p113f_blind') | (s.blind === 'blindRift' ? 1 : 2));
    drawInto(p.querySelector('canvas.p113f-chart'), s, id, mode);
  }
  function moonName() { try { return typeof CALENDAR11 !== 'undefined' && CALENDAR11.moonName ? CALENDAR11.moonName() : ''; } catch (e) { return ''; } }
  function moonIdx() { try { return typeof CALENDAR11 !== 'undefined' && CALENDAR11.moonIndex ? CALENDAR11.moonIndex() : 4; } catch (e) { return 4; } }
  function ownSign() { const v = hasG() && G.flags ? G.flags.p11c_sign : 0; return Number.isInteger(v) && v >= 1 && v <= 7 ? v : 0; }
  function closeView() {
    for (const t of V.timers) clearTimeout(t); V.timers = [];
    TURN.on = false;
    if (!V.open) return;
    V.open = false;
    try { hide('#event'); } catch (e) { /* none */ }
    const p = typeof document !== 'undefined' ? document.getElementById('event-panel') : null; if (p) p.classList.remove('p113f-view');
    if (hasG()) { G.state = 'play'; G.keys = {}; }
  }
  function drawInto(cv, s, id, mode) {
    if (!cv) return;
    const cw = cv.clientWidth || 640, ch = cv.clientHeight || 300, dpr = clamp((typeof window !== 'undefined' && window.devicePixelRatio) || 1, 1, 2);
    const W = Math.max(200, Math.min(1280, Math.round(cw * dpr))), H = Math.max(100, Math.round(W * ch / cw));
    cv.width = W; cv.height = H;
    const ctx = cv.getContext('2d'); if (!ctx) return;
    const grain = Math.max(2, Math.round(2 * dpr));
    try {
      if (mode === 'sky') {
        ensureTable(true);
        const still = typeof GFX !== 'undefined' && GFX.reduceMotion;
        const chart = (c2, L) => typeof DEEPSKY113 !== 'undefined' && DEEPSKY113.drawChart && DEEPSKY113.drawChart(c2, id, 0, 0, W, H, { lines: L, lineK: 1.7, minExt: 0.5, galK: 7 });
        if (!chart(ctx, still ? 1 : 0)) { drawFace(ctx, W, H, id, grain); return; }
        if (still) return;
        // the lines come in over about a second: the sky without them and the sky with them, each drawn once, the second
        // laid over the first a fifth at a time (a chart costs tens of milliseconds; the fade costs nothing)
        const mk = () => { const c2 = document.createElement('canvas'); c2.width = W; c2.height = H; return c2; };
        const base = mk(); base.getContext('2d').drawImage(cv, 0, 0);
        V.timers.push(setTimeout(() => {
          if (!V.open || V.fig !== id) return;
          const full = mk(); if (!chart(full.getContext('2d'), 1)) return;
          for (let k = 1; k <= 5; k++) V.timers.push(setTimeout(() => { if (!V.open || V.fig !== id) return; ctx.globalAlpha = 1; ctx.drawImage(base, 0, 0); ctx.globalAlpha = k / 5; ctx.drawImage(full, 0, 0); ctx.globalAlpha = 1; }, k * 180));
        }, 30));
      } else if (mode === 'moon') drawMoon(ctx, W, H, moonIdx(), grain);
      else if (mode === 'blind') drawBlind(ctx, W, H, s.blind, grain);
      else drawFace(ctx, W, H, id, grain, !isDay(G.tod));
    } catch (e) { warnOnce('draw', e); }
  }

  // ---------------------------------------------------------------- the pictures (all code, hashed noise only)
  const BAY = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  function blit(ctx, W, H, P, buf, cw) {
    const img = ctx.createImageData(W, H), out = img.data, ch = Math.ceil(H / P);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const q = (j * cw + i) * 3, bt = (BAY[((j & 3) << 2) | (i & 3)] + 0.5) / 16;
      const r = clamp(Math.floor(buf[q] / 4 + bt) * 4, 0, 255), g = clamp(Math.floor(buf[q + 1] / 4 + bt) * 4, 0, 255), b = clamp(Math.floor(buf[q + 2] / 4 + bt) * 4, 0, 255);
      for (let dy = 0; dy < P; dy++) { const Y = j * P + dy; if (Y >= H) break; for (let dx = 0; dx < P; dx++) { const X = i * P + dx; if (X >= W) break; const o = (Y * W + X) * 4; out[o] = r; out[o + 1] = g; out[o + 2] = b; out[o + 3] = 255; } }
    }
    ctx.putImageData(img, 0, 0);
  }
  // the stone itself, close: weathered grey, lichen, the cup-marks of a figure (pts in art cells) and a scratched line
  function stoneBuf(cw, ch, seed, tint) {
    const buf = new Float32Array(cw * ch * 3), sc = 48 / Math.max(cw, ch);
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const x = i * sc, y = j * sc, n = fbm(x * 0.6, y * 0.6, seed), n2 = vn(x * 2.2, y * 2.2, seed + 5), q = (j * cw + i) * 3;
      const crack = 1 - Math.abs(2 * fbm(x * 0.35 + 9, y * 0.9, seed + 21) - 1);
      let v = 84 + 70 * n + 14 * (n2 - 0.5) - 30 * smooth(0.9, 0.98, crack);
      v *= 0.86 + 0.22 * (1 - j / ch) * (1 - 0.4 * i / cw);   // light from the upper left
      let r = v, g = v * 0.97, b = v * 0.9;
      const li = fbm(x * 0.9 + 40, y * 0.9, seed + 33), li2 = fbm(x * 1.3, y * 1.3 + 70, seed + 41);
      if (li > 0.7) { const k = smooth(0.7, 0.78, li) * (0.55 + 0.45 * n2); r += (132 - r) * k * 0.7; g += (136 - g) * k * 0.7; b += (88 - b) * k * 0.7; }
      if (li2 > 0.72) { const k = smooth(0.72, 0.8, li2); r += (180 - r) * k * 0.6; g += (178 - g) * k * 0.6; b += (164 - b) * k * 0.6; }
      if (hh(i, j, seed + 90) < 0.04) { r *= 0.8; g *= 0.8; b *= 0.8; }
      buf[q] = r * tint[0]; buf[q + 1] = g * tint[1] / 0.97; buf[q + 2] = b * tint[2] / 0.9;
    }
    return buf;
  }
  function cup(buf, cw, ch, cx, cy, rr, k) {
    for (let j = Math.floor(cy - rr * 1.4); j <= Math.ceil(cy + rr * 1.4); j++) for (let i = Math.floor(cx - rr * 1.4); i <= Math.ceil(cx + rr * 1.4); i++) {
      if (i < 0 || j < 0 || i >= cw || j >= ch) continue;
      const dx = i + 0.5 - cx, dy = j + 0.5 - cy, r = Math.hypot(dx, dy) / rr, q = (j * cw + i) * 3;
      let m = 1;
      if (r < 1) { m = 0.42 + 0.5 * r * r + 0.22 * ((dx + dy) / rr) * 0.7; if (hh(i, j, 77) < 0.25) m *= 0.9; }
      else if (r < 1.25) m = 1.12 - 0.3 * ((dx + dy) / rr) * 0.25;
      m = 1 + (m - 1) * (k == null ? 1 : k);
      buf[q] *= m; buf[q + 1] *= m; buf[q + 2] *= m;
    }
  }
  function scratch(buf, cw, ch, A, B, rA, rB, seed) {
    const L = Math.hypot(B[0] - A[0], B[1] - A[1]); if (L < 1) return;
    const nx = -(B[1] - A[1]) / L, ny = (B[0] - A[0]) / L;
    for (let s = rA * 1.3; s < L - rB * 1.3; s += 0.5) {
      const f = s / L, jit = (vn(s * 0.6, 0, seed) - 0.5) * 1.2, x = A[0] + (B[0] - A[0]) * f + nx * jit, y = A[1] + (B[1] - A[1]) * f + ny * jit;
      const i = Math.floor(x), j = Math.floor(y); if (i < 0 || j < 0 || i >= cw || j >= ch) continue;
      const q = (j * cw + i) * 3; buf[q] = buf[q] * 0.55 + 196 * 0.45; buf[q + 1] = buf[q + 1] * 0.55 + 190 * 0.45; buf[q + 2] = buf[q + 2] * 0.55 + 172 * 0.45;
      const j2 = j + 1; if (j2 < ch) { const q2 = (j2 * cw + i) * 3; buf[q2] *= 0.82; buf[q2 + 1] *= 0.82; buf[q2 + 2] *= 0.82; }
    }
  }
  // the figure's pattern in art cells, fitted to the face
  function pattern(id, cw, ch) {
    const f = FIG[id]; if (!f) return { pts: [[cw / 2, ch / 2, 0.6]], lines: [] };
    if (f.kind === 'wanderer' || f.kind === 'lantern' || f.kind === 'fold') return { pts: [[cw / 2, ch / 2, f.kind === 'lantern' ? 1 : 0.7]], lines: [] };
    if (!CONS) CONS = buildCons();
    const C = CONS.find((c) => c.id === id), mid = middle(C), F = frameOf(mid.az, mid.el);
    const t = C.stars.map((s) => toT(F, dirOfAE(s.az, s.el)));
    let ext = 1.5; for (const [X, Y] of t) ext = Math.max(ext, Math.abs(X) * ch / cw, Math.abs(Y));
    const sc = ch * 0.5 * 0.72 / ext;
    return { pts: t.map(([X, Y], i) => [cw / 2 + X * sc, ch / 2 - Y * sc, C.stars[i].mag]), lines: C.lines };
  }
  function drawFace(ctx, W, H, id, P, night) {
    // by night the face is seen by what light there is: darker, and bluer
    const cw = Math.ceil(W / P), ch = Math.ceil(H / P), buf = stoneBuf(cw, ch, 113 + (FIG[id] ? FIG[id].bit * 7 : 0), night ? [0.5, 0.54, 0.64] : [1.0, 0.97, 0.9]);
    const pt = pattern(id, cw, ch), u = Math.max(cw, ch) / 160;
    const rad = pt.pts.map((p) => (2.2 + 3.2 * p[2]) * u);
    pt.lines.forEach(([a, b], k) => scratch(buf, cw, ch, pt.pts[a], pt.pts[b], rad[a], rad[b], 300 + k));
    pt.pts.forEach((p, i) => cup(buf, cw, ch, p[0], p[1], rad[i]));
    blit(ctx, W, H, P, buf, cw);
  }
  function drawBlind(ctx, W, H, which, P) {
    const cw = Math.ceil(W / P), ch = Math.ceil(H / P), rift = which === 'blindRift';
    const buf = stoneBuf(cw, ch, rift ? 601 : 607, rift ? [0.92, 0.94, 0.98] : [1.08, 0.97, 0.84]);
    const ex = cw / 2, ey = ch * 0.46, er = ch * 0.3;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const r = Math.hypot(i + 0.5 - ex, (j + 0.5 - ey) * 1.0) / er, q = (j * cw + i) * 3;
      if (r < 1) {
        if (rift) { buf[q] = 0; buf[q + 1] = 0; buf[q + 2] = 0; }
        else { const k = 1 - r * 0.35, w = 0.5 + 0.5 * (1 - (j - (ey - er)) / (2 * er)); buf[q] = 236 * k * (0.9 + 0.1 * w); buf[q + 1] = 224 * k * (0.88 + 0.1 * w); buf[q + 2] = 196 * k * (0.84 + 0.1 * w); }
      } else if (r < 1.12) { const m = 0.55 + 0.4 * (r - 1) / 0.12; buf[q] *= m; buf[q + 1] *= m; buf[q + 2] *= m; }
    }
    const u = Math.max(cw, ch) / 160;
    if (rift) {
      cup(buf, cw, ch, ex - er * 0.9, ey - er * 1.25, 3.2 * u); cup(buf, cw, ch, ex + er * 0.9, ey - er * 1.25, 3.2 * u);   // the Owl's two
      const nx = ex + er * 0.15, ny = ey + er * 1.35;
      cup(buf, cw, ch, nx, ny, 2.6 * u, 0.55);                                                                                // the new one
      for (let j = Math.floor(ny - 5 * u); j < ny + 5 * u; j++) for (let i = Math.floor(nx - 9 * u); i < nx + 9 * u; i++) {   // and the rubbing
        if (i < 0 || j < 0 || i >= cw || j >= ch) continue; const d = Math.hypot((i - nx) / (9 * u), (j - ny) / (5 * u)); if (d > 1) continue;
        const q = (j * cw + i) * 3, k = (1 - d) * 0.35 * (0.6 + 0.4 * vn(i * 0.9, j * 3, 611)); buf[q] += (178 - buf[q]) * k; buf[q + 1] += (178 - buf[q + 1]) * k; buf[q + 2] += (174 - buf[q + 2]) * k;
      }
    } else {
      const pt = pattern('k_cockerel', cw, ch);
      const sx = 0.3, ox = cw * 0.8, oy = ch * 0.46;
      pt.pts.forEach((p) => cup(buf, cw, ch, ox + (p[0] - cw / 2) * sx, oy + (p[1] - ch / 2) * sx, 1.6 * u));
    }
    blit(ctx, W, H, P, buf, cw);
  }
  // the Lantern: the moon close, in tonight's phase (js/calendar11.js: index 0 new .. 4 full .. 7)
  function drawMoon(ctx, W, H, idx, P) {
    const cw = Math.ceil(W / P), ch = Math.ceil(H / P), buf = new Float32Array(cw * ch * 3);
    const cx = cw / 2, cy = ch / 2, R = ch * 0.34, th = idx * PI / 4, wax = idx < 4 ? 1 : -1;
    const L = [Math.sin(th) * wax, -0.12, -Math.cos(th)];
    const ill = (1 - Math.cos(th)) / 2;
    for (let j = 0; j < ch; j++) for (let i = 0; i < cw; i++) {
      const q = (j * cw + i) * 3, u = (i + 0.5 - cx) / R, v = (j + 0.5 - cy) / R, rr = u * u + v * v;
      let r = 5 + 6 * (j / ch), g = 7 + 7 * (j / ch), b = 18 + 12 * (j / ch);
      if (hh(i, j, 931) < 0.004) { const k = 30 + 80 * hh(i, j, 932); r += k * 0.85; g += k * 0.9; b += k; }
      const halo = Math.exp(-Math.max(0, Math.sqrt(rr) - 1) * 2.2) * (0.25 + 0.75 * ill) * 34;
      r += halo * 0.75; g += halo * 0.8; b += halo;
      if (rr < 1) {
        const z = Math.sqrt(1 - rr), n = [u, -v, z];
        const lit = smooth(-0.04, 0.1, n[0] * L[0] + n[1] * L[1] + n[2] * L[2]);
        const mare = fbm(u * 2.2 + 3, v * 2.2 + 1, 941), cr = vn(u * 9, v * 9, 947);
        let alb = 0.86 - 0.3 * smooth(0.52, 0.7, mare) - 0.08 * smooth(0.78, 0.9, cr) + 0.06 * (vn(u * 20, v * 20, 953) - 0.5);
        alb *= 0.7 + 0.3 * Math.pow(z, 0.4);                  // the limb a little darker
        const k = lit * alb, es = 0.05 * alb;                  // and earthshine on the dark part
        r = r * 0.2 + 238 * (k + es * 0.8); g = g * 0.2 + 236 * (k + es * 0.85); b = b * 0.2 + 226 * (k + es);
      }
      buf[q] = r; buf[q + 1] = g; buf[q + 2] = b;
    }
    blit(ctx, W, H, P, buf, cw);
  }

  // ================================================================ sprites (code only)
  function paint() {
    if (typeof Engine === 'undefined' || !Engine.addSprite) return;
    const mk = (name, w, h, hs, draw) => {
      if (Engine.sprites && Engine.sprites[name]) return;
      const d = new Uint32Array(w * h);
      const px = (x, y, r, g, b) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = (255 << 24) | ((clamp(b, 0, 255) | 0) << 16) | ((clamp(g, 0, 255) | 0) << 8) | (clamp(r, 0, 255) | 0); };
      const get = (x, y) => (x >= 0 && y >= 0 && x < w && y < h ? d[y * w + x] : 0);
      const clr = (x, y) => { if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = 0; };
      draw(px, w, h, get, clr); Engine.addSprite(name, { w, h, data: d, hs, cx: 0.5, dy: 0 });
    };
    // weathered stone: warm grey, lighter on the left, lichen (yellow-green, grey-white), a dark outline
    const stoneCol = (x, y, w, h, seed, left) => {
      const n = fbm(x * 0.35, y * 0.35, seed), sh = left ? 14 : -10;
      let r = 104 + 46 * n + sh, g = 102 + 44 * n + sh, b = 94 + 40 * n + sh;
      const li = fbm(x * 0.5 + 20, y * 0.5, seed + 3);
      if (li > 0.64 && y > h * 0.2) { r = 128 + 20 * n; g = 132 + 18 * n; b = 70; }
      else if (li < 0.22) { r = 166; g = 164; b = 150; }
      if (y > h - 3) { r *= 0.8; g *= 0.85; b *= 0.75; }
      return [r, g, b];
    };
    const outline = (px, w, h, get) => { const edge = []; for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { if (!get(x, y)) continue; if (!get(x - 1, y) || !get(x + 1, y) || !get(x, y - 1)) edge.push([x, y]); } for (const [x, y] of edge) px(x, y, 46, 44, 42); };
    // the cup-marks of a figure on a face box (x0, y0, x1, y1), joined by a scratched line
    const cups = (px, id, x0, y0, x1, y1) => {
      const bw = x1 - x0, bh = y1 - y0, p = pattern(id, bw, bh);
      for (const [a, b] of p.lines) { const A = p.pts[a], B = p.pts[b], L = Math.hypot(B[0] - A[0], B[1] - A[1]); for (let s = 0; s <= L; s += 0.5) { const f = L ? s / L : 0; px(x0 + A[0] + (B[0] - A[0]) * f, y0 + A[1] + (B[1] - A[1]) * f, 150, 146, 132); } }
      for (const q of p.pts) { px(x0 + q[0], y0 + q[1], 40, 38, 36); if (q[2] > 0.5) px(x0 + q[0] + 1, y0 + q[1], 54, 52, 48); }
    };
    // a needle-stone: tall, tapering, a little lean, the eye bored through at NE_EY
    const needle = (id, cant, seed) => (px, w, h, get, clr) => {
      for (let y = 1; y < h; y++) {
        // the lean pivots on the eye, so the eye stays on the stone's own line (the sprite's anchor)
        const k = y / h, ke = (NE_EY + 0.5) / h, half = 6.9 + k * 7.2 + (y < 8 ? -(8 - y) * 0.75 : 0) + (hh(y, 1, seed) - 0.5) * 0.8, lean = (ke - k) * (cant ? 13 : ((seed % 3) - 1) * 2.4);
        const cx = w / 2 + lean;
        for (let x = Math.round(cx - half); x < Math.round(cx + half); x++) { const c = stoneCol(x / 1.5, y / 1.5, w, h, seed, x < cx); px(x, y, c[0], c[1], c[2]); }
      }
      const ecx = w / 2;
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const r = Math.hypot(x + 0.5 - ecx, y + 0.5 - (NE_EY + 0.5)); if (r < NE_RPX) clr(x, y); }
      outline(px, w, h, get);
      for (let a = 0; a < TAU; a += 0.12) { const x = ecx + Math.cos(a) * (NE_RPX + 0.6), y = NE_EY + 0.5 + Math.sin(a) * (NE_RPX + 0.6); if (get(x | 0, y | 0)) px(x, y, 70, 68, 62); }
      if (id) cups(px, id, w / 2 - 9, NE_EY + 10, w / 2 + 9, h - 9);
    };
    for (const id of SIGNS.concat(['k_cockerel'])) mk('p113f_needle_' + id, NE_W, NE_H, NE_HS, needle(id, false, FIG[id].bit + 2));
    mk('p113f_cant', NE_W, NE_H, NE_HS, needle('k_owl', true, 5));
    // a notch-stone's tall stone: square-shouldered, a V cut in its head; the short one is the peg you stand at
    const notch = (id, seed) => (px, w, h, get, clr) => {
      for (let y = 0; y < h; y++) { const k = y / h, half = 9 + k * 4.5 + (hh(y, 2, seed) - 0.5) * 0.8; for (let x = Math.round(w / 2 - half); x < Math.round(w / 2 + half); x++) { const c = stoneCol(x / 1.5, y / 1.5, w, h, seed, x < w / 2); px(x, y, c[0], c[1], c[2]); } }
      const nd = Math.round(h * (1 - NO_F) * 2);   // the V: its middle at NO_F of the height
      for (let y = 0; y < nd; y++) { const half = (nd - y) * 0.42; for (let x = Math.round(w / 2 - half); x < Math.round(w / 2 + half); x++) clr(x, y); }
      outline(px, w, h, get);
      cups(px, id, w / 2 - 8, nd + 6, w / 2 + 8, h - 8);
    };
    for (const id of ['g_farfold', 'g_wheel', 'g_fleeces']) mk('p113f_notch_' + id, NO_W, NO_H, NO_HS, notch(id, FIG[id].bit));
    // the pegs: knee-high, a cup pecked in the top
    const peg = (red, low) => (px, w, h, get) => {
      for (let y = 2; y < h; y++) { const half = (low ? 6 : 4) + (y / h) * 1.5; for (let x = Math.round(w / 2 - half); x < Math.round(w / 2 + half); x++) { const c = stoneCol(x * 2, y * 2, w * 2, h * 2, red ? 17 : 11, x < w / 2); px(x, y, c[0], c[1], c[2]); } }
      for (let x = 2; x < w - 2; x++) { if (get(x, 2)) px(x, 2, 150, 146, 134); }
      px(w / 2 - 1, 2, 44, 42, 40); px(w / 2, 2, 44, 42, 40); px(w / 2, 3, 60, 58, 54);
      if (red) for (let y = 4; y < h - 3; y++) for (let x = Math.round(w / 2 - 3); x < Math.round(w / 2 + 2); x++) if (hh(x, y, 5) < 0.7 && get(x, y)) px(x, y, 168, 52 + 20 * hh(x, y, 6), 40);
      outline(px, w, h, get);
    };
    mk('p113f_peg', 12, 12, 0.42, peg(false, false));
    mk('p113f_pegred', 12, 12, 0.42, peg(true, false));
    mk('p113f_notchlow', 16, 14, 0.6, peg(false, true));
    // the Sparrow's stone: low and round, three small cups
    mk('p113f_sparrow', 18, 10, 0.36, (px, w, h, get) => {
      for (let y = 1; y < h; y++) for (let x = 1; x < w - 1; x++) { const dx = (x + 0.5 - w / 2) / (w / 2 - 1), dy = (y + 0.5 - h) / (h - 1); if (dx * dx + dy * dy < 1) { const c = stoneCol(x * 2, y * 3, w * 2, h * 3, 23, x < w / 2); px(x, y, c[0], c[1], c[2]); } }
      for (const [x, y] of [[7, 3], [10, 4], [8, 6]]) px(x, y, 44, 42, 40);
      outline(px, w, h, get);
    });
    // Old Marrable, sitting: a drover's coat, a shawl over it, a stick across her knees, white hair
    mk('p113f_marrable', 26, 30, 0.82, (px, w, h, get) => {
      const coat = (x, y) => { const n = hh(x, y, 61) * 10; return [92 + n, 70 + n, 48 + n]; };
      for (let y = 13; y < 27; y++) for (let x = 6; x < 20; x++) { const half = 5 + (y - 13) * 0.35; if (Math.abs(x + 0.5 - 13) < half) { const c = coat(x, y); px(x, y, c[0], c[1], c[2]); } }           // the coat
      for (let y = 22; y < 27; y++) for (let x = 3; x < 23; x++) { const c = coat(x, y); if (y > 23 || (x > 4 && x < 22)) px(x, y, c[0] * 0.92, c[1] * 0.92, c[2] * 0.92); }        // the knees
      for (let y = 27; y < 30; y++) { px(5, y, 40, 34, 28); px(6, y, 40, 34, 28); px(19, y, 40, 34, 28); px(20, y, 40, 34, 28); }                                             // boots
      for (let y = 10; y < 19; y++) for (let x = 5; x < 21; x++) { const tri = Math.abs(x + 0.5 - 13) < 8 - (y - 10) * 0.75; if (tri) { const n = hh(x, y, 63) * 12; px(x, y, 104 + n, 112 + n, 92 + n); } }  // the shawl
      for (let x = 7; x < 19; x++) if (x % 2) px(x, 18, 80, 90, 72);
      for (let y = 3; y < 10; y++) for (let x = 9; x < 17; x++) { const r = Math.hypot(x + 0.5 - 13, (y + 0.5 - 6.5) * 1.1); if (r < 3.8) px(x, y, 198, 164, 140); }                          // the face
      for (let x = 9; x < 17; x++) { px(x, 2, 226, 224, 216); if (x < 11 || x > 14) px(x, 3, 226, 224, 216); } px(9, 4, 216, 214, 206); px(16, 4, 216, 214, 206); px(9, 5, 206, 204, 196); px(16, 5, 206, 204, 196);   // white hair
      px(11, 6, 52, 40, 34); px(14, 6, 52, 40, 34); px(12, 8, 150, 112, 96); px(13, 8, 150, 112, 96);
      for (let x = 1; x < 25; x++) { const y = 21 + Math.round((x - 1) * 0.08); px(x, y, 64, 46, 30); }                                                                       // the stick
      for (const x of [8, 17]) { px(x, 20, 192, 158, 134); px(x + 1, 20, 192, 158, 134); }                                                                                     // her hands on it
      outline(px, w, h, get);
    });
  }

  // ================================================================ Old Marrable
  function marrQuest() {
    if (!hasG()) return null;
    const m = flag('p113f_marr');
    if (!(m & 1)) { setFlag('p113f_marr', m | 1); return { text: TX.mGreet1 }; }
    const seen = flag('p113f_seen'), all8 = KEEPERS.every((id) => seen & (1 << FIG[id].bit));
    if (all8 && !(m & 2)) { setFlag('p113f_marr', m | 2); return { text: TX.mAll8 }; }
    if ((flag('p113f_blind') & 1) && !(m & 4)) { setFlag('p113f_marr', m | 4); return { text: TX.mRift }; }
    return null;
  }
  function installPeople() {
    if (typeof NPCS === 'undefined') return;
    if (!NPCS[MARR]) NPCS[MARR] = {
      name: TX.mName, sprite: 'p113f_marrable', portrait: 'townswoman', tier: 'low', scale: 1,
      greet: { polite: TX.mGreet2, normal: TX.mGreet2, blunt: TX.mGreet2 },
      topics: { [TX.tFold]: TX.say1, [TX.tLamps]: TX.say2, [TX.tStones]: TX.say3, [TX.tCount]: TX.say4, [TX.tChurch]: TX.say5, [TX.tSigns]: TX.saySigns },
      quest: () => marrQuest(),
    };
    // her voice (js/voices.js): an old woman, a little breathy from the hill
    try { if (typeof VOICES !== 'undefined' && VOICES.PEOPLE) Object.assign(VOICES.PEOPLE, Object.assign({ [MARR]: { f0: 176, fs: 1.03, style: 'breathy' } }, VOICES.PEOPLE)); } catch (e) { /* the default voice */ }
  }
  // by night only: from full dark (the game's 'night', 20:00) through the dead hour (to 05:00)
  const marrHere = (tod) => { const h = (((+tod || 0) % 1) + 1) % 1 * 24; return h >= 20 || h < 5; };

  // ================================================================ tick, wiring
  let lastDay = null;
  function tick() {
    if (!hasG()) return;
    try {
      if (G.day !== lastDay) { lastDay = G.day; ensureTable(false); }
      if (G.mapId === 'p47_stones' && G.ents) { const here = marrHere(G.tod); for (const e of G.ents) if (e && e.kind === 'npc' && e.id === MARR) e.hidden = !here; }
      if (TURN.on && G.state !== 'event') TURN.on = false;
      if (V.open && G.state !== 'event') { V.open = false; for (const t of V.timers) clearTimeout(t); V.timers = []; const p = document.getElementById('event-panel'); if (p) p.classList.remove('p113f-view'); }
    } catch (e) { warnOnce('tick', e); }
  }
  // the eye's radius on screen, logical pixels, for a site seen from its stand (the 3D view's, under its pitch)
  function eyeScreenR(s) { if (!s || !s.H || !s.d) return 0; const r = NE_R * s.H; return FXL * r * ZK * Math.cos(Math.max(0, s.el)) / s.d; }
  function wire() {
    paint(); installPeople();
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () { const maps = _b.apply(this, arguments); try { place(maps); } catch (e) { warnOnce('build', e); } return maps; };
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); };
    }
    if (typeof updateNarrow === 'function') {
      const _un = updateNarrow;
      updateNarrow = function () { const r = _un.apply(this, arguments); tick(); return r; };
    }
    for (const fn of ['loadMap', 'restoreGame']) {
      if (typeof window === 'undefined' || typeof window[fn] !== 'function') continue;
      const _f = window[fn];
      window[fn] = function () { if (V.open || TURN.on) closeView(); const r = _f.apply(this, arguments); tick(); return r; };
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (ev) => { if (!V.open) return; const k = String(ev.key || '').toLowerCase(); if (k === 'escape' || k === 'esc') { ev.preventDefault(); ev.stopImmediatePropagation(); closeView(); } }, true);
      ensureTable(true);
    }
  }
  try { wire(); } catch (e) { warnOnce('wire', e); }

  return {
    TX, TEXTS, FIG, ORDER, ALL_BITS, KEEPERS, SIGNS, LOOSE, SITES, MARR, WEEK_LABEL,
    buildLore, middle, road, roadAE, chord, aimAt, aim, wetherOrder, wetherFig, place, sites, siteOf, trackDist, sightClear,
    view: V, closeView, finishTurn, visibleOf, tick, flag, eyeScreenR, useOwn, ensureTable, marrHere,
    draw: { face: drawFace, moon: drawMoon, blind: drawBlind },
  };
})();
if (typeof window !== 'undefined') window.FOLD113 = FOLD113;
