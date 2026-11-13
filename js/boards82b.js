// ============================================================
//  boards82b — Phase 82b, a notice board in every town. Owner, 13 Nov 2026: "Each town or city should have signposts for
//  notices and extra bits of lore and side quests." Brief: story/Game Layer/Phase 82b - The map, finger-posts and notice
//  boards (brief and text).md, section 4.
//
//  Six new boards, each with notices (what the place tells you), lore (what it lets slip) and tasks, taken from the board
//  the way the Oakhaven board's bounties are (js/upgrades.js, renderBountyBoard): a line on the board, taken, done in the
//  world, and paid at the board.
//    Stillwater Landing   the piling board, by LOCK DUES PAID IN ADVANCE: Three traps before light; Reed for the thatcher
//    Wethercombe          the Bellwether's board, on the inn's front wall: Twelve hurdles; The lead ewe's bell
//    Port Cantabile       the Harbour board, under "Dues, bench and bell": A bell for a bare hook; Three chimes
//    the Hollow           the Grafters' board, by the well: Three doors; Water for the end house
//    the Low Rings        the board at the gangway, on the first roof: The chandler's book
//    Greenroot            the board by the mill: no task (the hamlet is empty on purpose)
//  The three boards that were there (Oakhaven, the Sunken Court, the Deep Woods camp) each get two more lines of lore.
//  All the text is [PROPOSED] (the owner approved the brief's text as written for the build). The rewards, the few lines
//  that say what you have just done, and the looks of the things you handle are this file's, and [PROPOSED] too.
//  Flags: p82b_<task> (1 in hand, 2 done, 3 paid), p82b_<task>_n (how far), p82b_<task>_c (carried), p82b_<task>_b (which).
//  Nothing visual uses random numbers.
// ============================================================
'use strict';

const BOARDS82B = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('boards82b: ' + k, e); } };
  const hasG = () => typeof G !== 'undefined' && G && G.flags && G.player;
  const F = () => G.flags;
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5000); } catch (e) { /* cosmetic */ } };
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));
  const esc = (t) => String(t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  // ---------------------------------------------------------------- the words (the brief's, section 4)
  const TX = {
    notices: S('Notices'), lore: S('Lore'), tasks: S('To take'), close: S('Close'),
    take: S('Take it. Reward: {0} sovereigns.'), inHand: S('In hand: {0} of {1}.'), claim: S('Done. Claim {0} sovereigns.'), paid: S('Done and paid.'),
    taken: S('You take the notice down and put it in your pocket.'), doneBack: S('That is done. The board will pay for it.'), claimed: S('You claim {0} sovereigns.'),
    eels: S('And two eels from the trapper.'),
    // what you have just done (this file's)
    trapSpot: S('The pier end. A willow trap goes off here.'), trapSet: S('A willow trap, set off the pier.'),
    trapDone: S('You set a willow trap off the pier, quietly.'), trapDay: S('Not now. Before light: after dark, and before the dawn.'), trapLoud: S('Too much noise. Wait until you are quiet.'),
    reedSpot: S('Flume-Reed in the shallows by the gangway.'), reedCut: S('You cut a bundle of Flume-Reed, green. {0} of 6.'), reedFull: S('You have six bundles. They go to the cooperage door.'),
    coopSpot: S('The cooperage door. The reed is to be left here.'), coopLeft: S('You leave the reed at the cooperage door.'), coopShort: S('Six bundles. You have {0}.'),
    hurdleSpot: S('Hurdles, stacked by the barn.'), hurdleTake: S('You take two hurdles from the barn.'), hurdleFull: S('Your arms are full.'),
    foldSpot: S('The fold. Hurdles and the bell go here.'), foldHurdles: S('You set two hurdles at the fold. {0} of 12.'), foldBell: S('You hang the bell at the fold. It does not ring.'), foldEmpty: S('You have nothing for the fold.'),
    bellSpot: S('Something bronze in the grass by the dew-pond.'), bellFound: S('A wether-bell, bronze, the tongue tied with wool. It does not ring.'),
    shroudSpot: S('A shroud with no chime.'), shroudHung: S('A shroud with its chime again.'), chimeHang: S('You hang a chime on the shroud. The wind finds it at once.'), chimeNone: S('You have no chime. The chandler on the third landing sells them.'),
    chimeName: S('Bronze rigging-chime'), chimeDesc: S('A bar of small bronze tubes for a shroud-head, the kind every hull in the harbour carries.'),
    tonicSpot: S('Rooke\'s tonic, for the pencilled doors.'), tonicTake: S('You take three bottles of Rooke\'s tonic.'),
    doorSpot: S('A marked door. Knock once.'), doorLeft: S('Rooke\'s tonic, left on the step.'), doorKnock: S('You knock once and leave the tonic on the step. {0} of 3.'), doorNone: S('You have no tonic left. The surgery has it.'),
    pailSpot: S('Two pails by the well.'), pailTake: S('You draw two pails.'),
    stepSpot: S('The step of the end house.'), stepLeft: S('You leave the pails on the step of the end house.'), stepNone: S('You have no water. Draw it at the well.'),
    bookSpot: S('A day-book on the loft shelf.'), bookTake: S('The chandler\'s day-book. You bring it out of the loft.'),
  };

  // ---------------------------------------------------------------- the boards
  const BOARDS = {
    landing: { map: 'flume_landing', at: [13.0, 11.0], title: S('Stillwater Landing: the piling board'),
      notices: [S('THE LOWER LOCK IS SHUT BY ORDER. No name is given for whose order.'), S('TIMBER COMPACT. Strike fund paid out Stasisday, at the raft, to men on the roster. Men not on the roster: see the steward. Men not anywhere: we are asking.'), S('Rafts tied here longer than a month are the Landing\'s.')],
      lore: [S('A Cantabile broadsheet, pasted crooked, three weeks old. The headline has been torn off. What is left says the plazas of Whisper-Grove are full of people, standing.'), S('In pencil, low down, in a child\'s hand: the eels know where it goes.')],
      tasks: ['traps', 'reed'] },
    combe: { map: 'p22_combe', at: [28.6, 21.0], title: S('Wethercombe: the Bellwether\'s board'),
      notices: [S('A fair-day bill, brown with age. WETHERCOMBE FAIR. EIGHT HUNDRED HEAD. The year is 417. There has not been another.'), S('STRAYS TO THE PINFOLD. A penny a head to have them back. Nobody has crossed it out, though there is nothing to stray.'), S('In Gideon Thrale\'s hand: ROOMS, A SOVEREIGN. CIDER. NO CREDIT ON WOOL UNTIL THERE IS WOOL.')],
      lore: [S('The levy notice of the autumn of 417, the Moot\'s seal still on it: every fleece in the Reach, for the Hedge.'), S('The rhyme, in chalk: When the Ram is white and the fires burn, the barrow gives back.')],
      tasks: ['hurdles', 'bell'] },
    harbour: { map: 'cantabile_harbour', at: [42.4, 51.8], title: S('Port Cantabile: the Harbour board'),
      notices: [S('DUES AT SLACK WATER, TO THE HARBOUR-QUEEN\'S OWN HAND. Six sovereigns a hull, a day.'), S('ARTICLE THE SIXTEENTH. What lies below the tide-mark belongs to whoever brings it up. The Harbour takes a fifth.'), S('NOBODY SLEEPS ASHORE.')],
      lore: [S('Four broadsheets pinned one over another, each calling the others liars. One of them is right about something, and there is no telling which.'), S('A tide-table in a small neat hand, with the key the reef sings at each hour. The last column is headed WINTER, and every line of it is the same.')],
      tasks: ['hook', 'chimes'] },
    hollow: { map: 'p30_hollow', at: [16.2, 16.2], title: S('The Hollow: the Grafters\' board'),
      notices: [S('INSPECTION, ROOTDAY MORNING. Households to stand at their doors. Those who cannot stand are to be brought to the door.'), S('THIRTY-ONE HOUSEHOLDS. Under it, in pencil, somebody keeps the number of souls, and has rubbed it out and written it again many times.'), S('No singing above the tending note.')],
      lore: [S('A list of doors in Rooke\'s hand, each with a mark like a leaf. Some marks have a second stroke through them.'), S('A child\'s drawing of a wagon, with the horses given too many legs.')],
      tasks: ['doors', 'water'] },
    rings: { map: 'flume_lowrings', at: [35.4, 16.8], title: S('The Low Rings: the board at the gangway'),
      notices: [S('BY ORDER OF THE MOOT. THE LOW RINGS ARE CLOSED UNTIL THE WATER IS PUT RIGHT. The date has been scraped off.'), S('Under it, in pencil: LEAVE THE WATER ALONE.')],
      lore: [S('A row of notches down the board\'s edge, each with a year cut beside it, each a hand higher than the last.'), S('A scrap of ledger paper: "took only what was ours. Left the cashbox."')],
      tasks: ['book'] },
    greenroot: { map: 'greenroot', at: [15.2, 9.7], title: S('Greenroot: the board by the mill'),
      notices: [S('The chapel reed to be re-cut on Rootday next.'), S('In the physician\'s hand: THE WARD IS FULL. Do not bring them to me. Send, and I will come.'), S('Meal, by the peck. The prices have been chalked up, rubbed out and chalked lower.')],
      lore: [S('A notice begun in good ink, "To whoever comes after us," and nothing after it.')],
      tasks: [] },
  };
  // the three boards that were there: two more lines each, in the same hand
  const OLD_LORE = {
    oakhaven: [S('"The North Gate shuts at dusk. It does not open for a voice you know."'), S('"Lamp oil, four pence the pint. Five by the thaw."')],
    whispergrove: [S('"Do not speak to the residents. Do not finish their sentences."'), S('In Veil-grey ink: "Two hundred and four in the Plaza of the Willows. Counted."')],
    deepwoods: [S('"Fire small. Watch doubled. Nobody goes north alone."'), S('In Mags\'s hand: "Whoever took the good kettle, I know."')],
  };

  // ---------------------------------------------------------------- the tasks
  // reward: sovereigns at the level of the Oakhaven board's small bounties [PROPOSED]
  const TASKS = {
    traps: { board: 'landing', title: S('Three traps before light.'), notice: S('"Wanted: hands that can keep quiet. Ask at the pier end."'), what: S('Set three willow traps off the pier at night without raising your noise. The eel-trapper pays in eels and a little coin.'), need: 3, gold: 6, xp: 25, items: [['p12_flume_eel', 2]] },
    reed: { board: 'landing', title: S('Reed for the thatcher.'), notice: S('"Six bundles of Flume-Reed, cut green, to the cooperage door."'), what: S('Cut reed in the shallows by the gangway and leave it at the door.'), need: 6, gold: 6, xp: 20 },
    hurdles: { board: 'combe', title: S('Twelve hurdles.'), notice: S('"Hurdles wanted at the fold. Twelve. T. Farrant."'), what: S('Carry them from the barn, two at a time.'), need: 12, gold: 8, xp: 25 },
    bell: { board: 'combe', title: S('The lead ewe\'s bell.'), notice: S('"Lost on the Downs: a wether-bell, bronze, the tongue tied with wool. It will not ring. That is how you will know it."'), what: S('Find it by the dew-pond and bring it to the fold.'), need: 1, gold: 10, xp: 25 },
    hook: { board: 'harbour', title: S('A bell for a bare hook.'), notice: S('"There are hooks on the Cay with nothing on them. A bell is a copper."'), what: S('Buy a small bell at the chandler\'s on the third landing and hang it on a bare hook on Driftwood Cay.'), need: 1, gold: 3, xp: 15 },
    chimes: { board: 'harbour', title: S('Three chimes.'), notice: S('"Three shrouds on the second quay have lost their chimes. A harbour with a silent shroud is asking for it."'), what: S('Buy three at the chandler\'s and hang them.'), need: 3, gold: 8, xp: 20 },
    doors: { board: 'hollow', title: S('Three doors.'), notice: S('"Tonic for the pencilled doors, from the surgery. Knock once."'), what: S('Carry Rooke\'s tonic to three marked doors.'), need: 3, gold: 8, xp: 25 },
    water: { board: 'hollow', title: S('Water for the end house.'), notice: S('"The end house cannot come to the well."'), what: S('Draw two pails and leave them on the step.'), need: 1, gold: 4, xp: 15 },
    book: { board: 'rings', title: S('The chandler\'s book.'), notice: S('"My husband\'s day-book is in the loft over the shop. I am in the Ladder now and cannot fetch it. Mind the third board."'), what: S('Bring the book out of the chandler\'s loft.'), need: 1, gold: 10, xp: 25 },
  };
  const KEYS = Object.keys(TASKS);
  const st = (k) => { const v = Number(hasG() ? F()['p82b_' + k] : 0); return Number.isFinite(v) ? Math.max(0, Math.min(3, v | 0)) : 0; };
  const num = (k, s) => { const v = Number(F()['p82b_' + k + '_' + s]); return Number.isFinite(v) && v > 0 ? v | 0 : 0; };
  const setNum = (k, s, v) => { F()['p82b_' + k + '_' + s] = v; };

  // ---------------------------------------------------------------- the things you handle, and where they are
  // act: mark (once per spot, counts), gather (carried, up to cap), deliver (carried in, counts). when: a test before acting.
  const SPOTS = [
    { task: 'traps', map: 'flume_landing', at: [7.6, 20.3], sprite: 'p82b_trap', doneSprite: 'p82b_none', act: 'mark', label: TX.trapSpot, doneLabel: TX.trapSet },
    { task: 'traps', map: 'flume_landing', at: [14.6, 21.3], sprite: 'p82b_trap', doneSprite: 'p82b_none', act: 'mark', label: TX.trapSpot, doneLabel: TX.trapSet },
    { task: 'traps', map: 'flume_landing', at: [15.4, 18.4], sprite: 'p82b_trap', doneSprite: 'p82b_none', act: 'mark', label: TX.trapSpot, doneLabel: TX.trapSet },
    ...[1.5, 2.3, 3.1, 3.9, 4.7, 6.3].map((x) => ({ task: 'reed', map: 'flume_landing', at: [x, 15.25], sprite: 'p82b_reed', doneSprite: 'p82b_none', act: 'gather', cap: 6, label: TX.reedSpot })),
    { task: 'reed', map: 'flume_landing', at: [15.5, 9.6], sprite: 'p82b_none', act: 'deliver', amount: 6, label: TX.coopSpot },
    { task: 'hurdles', map: 'p22_combe', at: [42.2, 9.8], sprite: 'p82b_hurdles', act: 'gather', cap: 2, label: TX.hurdleSpot },
    { task: 'hurdles', map: 'p22_combe', at: [34.9, 31.0], sprite: 'p82b_none', act: 'deliver', amount: 2, label: TX.foldSpot, fold: true },
    { task: 'bell', map: 'p20_downs', at: [8.8, 35.2], sprite: 'p82b_bell', doneSprite: 'p82b_none', act: 'gather', cap: 1, label: TX.bellSpot },
    { task: 'bell', map: 'p22_combe', at: [34.9, 31.0], sprite: 'p82b_none', act: 'deliver', amount: 1, label: TX.foldSpot, fold: true, merged: 'hurdles' },
    ...[[60.5, 55.2], [67.0, 54.5], [63.5, 49.9]].map((at) => ({ task: 'chimes', map: 'cantabile_harbour', at, sprite: 'p82b_shroud', doneSprite: 'p82b_chime', act: 'mark', item: 'p82b_chime', label: TX.shroudSpot, doneLabel: TX.shroudHung, keepDone: true, keepAfter: true })),
    { task: 'doors', map: 'surgery', at: [5.5, 4.5], sprite: 'p82b_tonic', act: 'gather', cap: 3, once: true, label: TX.tonicSpot },
    // the doors task's marked doors are found in the Hollow when the maps are built (see addDoorSpots)
    { task: 'water', map: 'p30_hollow', at: [17.2, 17.8], sprite: 'p82b_pails', act: 'gather', cap: 2, hideCarried: true, label: TX.pailSpot },
    { task: 'water', map: 'p30_hollow', at: [25.4, 12.2], sprite: 'p82b_none', doneSprite: 'p82b_pails', act: 'deliver', amount: 2, label: TX.stepSpot, doneLabel: TX.stepLeft },
    { task: 'book', map: 'flume_lowrings', at: [7.6, 4.6], sprite: 'p82b_book', act: 'gather', cap: 1, finish: true, label: TX.bookSpot },
  ];
  const THIRD_BOARD = { map: 'flume_lowrings', x: 6, y: 5 };   // "Mind the third board": the third board in from the chandler's door creaks
  const NIGHT = (t) => t < 0.25 || t > 0.83, QUIET = 1.2;

  // ---------------------------------------------------------------- art (code only; no random numbers)
  function paint(w, h, fn) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h);
    return new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0));
  }
  const E = (x, cx, cy, rx, ry, fill) => { x.beginPath(); x.ellipse(cx, cy, Math.max(0.1, rx), Math.max(0.1, ry), 0, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); };
  const R = (x, x0, y0, w, h, fill) => { x.fillStyle = fill; x.fillRect(x0, y0, w, h); };
  const Ln = (x, x0, y0, x1, y1, col, lw) => { x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.strokeStyle = col; x.lineWidth = lw || 1; x.stroke(); };
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites && Engine.sprites[name]) return; try { Engine.addSprite(name, { w, h, data: paint(w, h, fn), hs, cx: 0.5, dy: 0 }); } catch (e) { warnOnce('art ' + name, e); } };
    add('p82b_none', 2, 2, 0.1, () => {});
    // a notice board: two posts, a little roof, a weathered board, papers of different ages pinned on it
    add('p82b_board', 64, 72, 1.25, (x) => {
      R(x, 8, 10, 4, 62, '#3e3022'); R(x, 52, 10, 4, 62, '#3e3022'); R(x, 9, 10, 1, 62, '#5a4632'); R(x, 53, 10, 1, 62, '#5a4632');
      x.beginPath(); x.moveTo(2, 12); x.lineTo(32, 2); x.lineTo(62, 12); x.lineTo(62, 15); x.lineTo(2, 15); x.closePath(); x.fillStyle = '#4a3828'; x.fill();
      Ln(x, 2, 12, 32, 2, '#6a523a', 1.2); Ln(x, 32, 2, 62, 12, '#2a2018', 1.2);
      R(x, 5, 16, 54, 34, '#6a5238'); for (let i = 0; i < 5; i++) R(x, 5, 17 + i * 7, 54, 1, 'rgba(30,20,12,0.5)');
      x.strokeStyle = '#2e2216'; x.lineWidth = 1.5; x.strokeRect(5, 16, 54, 34);
      const paper = (px, py, pw, ph, c) => { R(x, px + 1, py + 1, pw, ph, 'rgba(0,0,0,0.35)'); R(x, px, py, pw, ph, c); for (let k = 0; k < ph - 4; k += 3) R(x, px + 2, py + 3 + k, pw - 4 - ((k * 7) % 5), 1, 'rgba(40,30,20,0.55)'); R(x, px + pw / 2 - 1, py + 1, 2, 2, '#8a8a90'); };
      paper(8, 19, 14, 18, '#e4dcc4'); paper(25, 18, 12, 14, '#d8c89c'); paper(40, 20, 15, 12, '#ece6d4'); paper(27, 34, 13, 12, '#c8b88a'); paper(9, 39, 11, 9, '#e0d6b8'); paper(43, 35, 11, 12, '#d4c49c');
    });
    // a willow eel-trap: a cone of withies, the neck tied, on a line
    add('p82b_trap', 28, 24, 0.35, (x) => {
      x.beginPath(); x.moveTo(3, 12); x.lineTo(25, 5); x.lineTo(25, 19); x.closePath(); x.fillStyle = '#8a6a3a'; x.fill();
      for (let i = 0; i < 6; i++) Ln(x, 3, 12, 25, 5 + i * 2.8, i % 2 ? '#5a4220' : '#b08a50', 1);
      for (let i = 0; i < 4; i++) Ln(x, 7 + i * 5, 11 - i * 1.4, 7 + i * 5, 13 + i * 1.4, '#4a3418', 1);
      E(x, 25, 12, 2, 7, '#3a2a14'); Ln(x, 3, 12, 0, 2, '#c8b890', 1);
    });
    // a bundle of green Flume-Reed standing in the water
    add('p82b_reed', 20, 40, 0.75, (x) => {
      for (let i = 0; i < 9; i++) { const bx = 4 + i * 1.5, top = 2 + ((i * 7) % 6); Ln(x, bx, 38, bx + (i % 3 - 1) * 1.5, top, i % 2 ? '#6a9a4a' : '#88b860', 1.2); }
      R(x, 4, 26, 13, 2, '#c8b070');
    });
    // hurdles stacked against a post: woven hazel panels
    add('p82b_hurdles', 48, 36, 0.7, (x) => {
      for (let k = 0; k < 4; k++) { const ox = 2 + k * 3, oy = 4 + k * 2; R(x, ox, oy, 36, 26, k % 2 ? '#7a5e36' : '#8a6c40');
        for (let i = 0; i < 6; i++) R(x, ox, oy + 3 + i * 4, 36, 2, 'rgba(40,28,14,0.55)'); for (let i = 0; i < 6; i++) R(x, ox + 2 + i * 6.4, oy - 2, 2, 30, '#5a4226'); }
    });
    // a wether-bell, bronze, the tongue tied with wool
    add('p82b_bell', 24, 24, 0.3, (x) => {
      x.beginPath(); x.moveTo(8, 6); x.quadraticCurveTo(6, 16, 3, 19); x.lineTo(21, 19); x.quadraticCurveTo(18, 16, 16, 6); x.closePath(); x.fillStyle = '#b07a38'; x.fill();
      Ln(x, 9, 8, 7, 17, 'rgba(255,230,180,0.6)', 1.2); E(x, 12, 19, 9, 1.6, '#6a4820'); E(x, 12, 21, 2.6, 1.8, '#e8e2d0'); R(x, 10, 2, 4, 4, '#4a3a2a');
    });
    // a shroud without its chime (a stay and an empty hook), and with one (a bar of bronze tubes)
    add('p82b_shroud', 20, 64, 1.2, (x) => { Ln(x, 10, 0, 10, 64, '#5a4a36', 1.4); Ln(x, 10, 18, 7, 21, '#2e3034', 1.4); });
    add('p82b_chime', 20, 64, 1.2, (x) => {
      Ln(x, 10, 0, 10, 64, '#5a4a36', 1.4); R(x, 3, 18, 14, 2, '#6a4a20');
      for (let i = 0; i < 5; i++) { R(x, 4 + i * 2.6, 20, 1.6, 8 + (i % 3) * 3, '#d8a050'); R(x, 4 + i * 2.6, 20, 0.6, 8 + (i % 3) * 3, '#f4d8a0'); }
    });
    // three bottles of Rooke's tonic
    add('p82b_tonic', 24, 24, 0.3, (x) => { for (let i = 0; i < 3; i++) { R(x, 3 + i * 7, 9, 5, 13, '#2a5a44'); R(x, 4 + i * 7, 6, 3, 3, '#2a5a44'); R(x, 4 + i * 7, 4, 3, 2, '#8a6a4a'); R(x, 4 + i * 7, 11, 1, 8, 'rgba(200,240,220,0.5)'); } });
    // two wooden pails
    add('p82b_pails', 32, 22, 0.35, (x) => { for (const ox of [2, 17]) { x.beginPath(); x.moveTo(ox, 6); x.lineTo(ox + 13, 6); x.lineTo(ox + 11, 21); x.lineTo(ox + 2, 21); x.closePath(); x.fillStyle = '#8a6a42'; x.fill(); R(x, ox, 9, 13, 1.5, '#3a3a40'); R(x, ox + 1, 17, 11, 1.5, '#3a3a40'); E(x, ox + 6.5, 6, 6.5, 1.6, '#3c5a6a'); x.beginPath(); x.arc(ox + 6.5, 6, 6, Math.PI, 0); x.strokeStyle = '#3a3a40'; x.lineWidth = 1; x.stroke(); } });
    // a chandler's day-book: a fat ledger, its corners worn
    add('p82b_book', 22, 16, 0.25, (x) => { R(x, 2, 3, 18, 11, '#5a2e22'); R(x, 3, 4, 16, 2, '#e8dcc0'); R(x, 2, 3, 2, 11, '#3a1e16'); R(x, 9, 7, 6, 3, '#c8a050'); });
  }

  // ---------------------------------------------------------------- placing things on the maps
  function freeNear(m, x, y) {
    const ok = (px, py) => {
      const cx = Math.floor(px), cy = Math.floor(py); if (cx < 1 || cy < 1 || cx >= m.w - 1 || cy >= m.h - 1) return false;
      const c = m.get(cx, cy); if (c || m.isBlocked(cx, cy)) return false;
      for (const e of m.entities) if (e && !e.dead && Math.hypot(e.x - px, e.y - py) < (e.solid ? (e.radius || 0.3) + 0.45 : 0.7)) return false;
      return true;
    };
    if (ok(x, y)) return [x, y];
    for (let r = 0.4; r <= 3; r += 0.4) for (let a = 0; a < 12; a++) { const px = x + Math.cos(a / 12 * Math.PI * 2) * r, py = y + Math.sin(a / 12 * Math.PI * 2) * r; if (ok(px, py)) return [+px.toFixed(2), +py.toFixed(2)]; }
    return [x, y];
  }
  function addDoorSpots(maps) {
    const m = maps.p30_hollow; if (!m) return [];
    const marks = m.entities.filter((e) => e && (e.sprite === 'p30_sapmark' || e.sprite === 'p30_pencil')).sort((a, b) => a.y - b.y || a.x - b.x);
    return marks.map((e, i) => {
      const c = (cx, cy) => { const k = m.get(cx, cy); return k && k.door; };
      // the mark is drawn on the door's lane face: stand the spot a step out into the lane
      let at = [e.x, e.y];
      for (const [dx, dy] of [[0, 0.6], [0, -0.6], [0.6, 0], [-0.6, 0]]) { const px = e.x + dx, py = e.y + dy; if (!m.get(Math.floor(px), Math.floor(py)) && !c(Math.floor(px), Math.floor(py))) { at = [+px.toFixed(2), +py.toFixed(2)]; break; } }
      return { task: 'doors', map: 'p30_hollow', at, sprite: 'p82b_none', doneSprite: 'p82b_tonic', act: 'deliver', amount: 1, perSpot: true, bit: i, label: TX.doorSpot, doneLabel: TX.doorLeft, keepDone: true };
    });
  }
  let DOOR_SPOTS = [];
  function placeAll(maps) {
    for (const id in BOARDS) {
      const B = BOARDS[id], m = maps[B.map]; if (!m || m.entities.some((e) => e && e._p82bBoard === id)) continue;
      const at = freeNear(m, B.at[0], B.at[1]);
      m.deco(typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites.p82b_board ? 'p82b_board' : 'sign', at[0], at[1], { radius: 0.3, scale: 1.0, solid: true, use: 'p82b_board', label: B.title, _p82bBoard: id });
      m.baseCount = m.entities.length;
    }
    DOOR_SPOTS = addDoorSpots(maps);
    SPOTS.concat(DOOR_SPOTS).forEach((s, i) => {
      const m = maps[s.map]; if (!m) return;
      const key = s.task + ':' + (s.bit != null ? 'd' + s.bit : i);
      if (m.entities.some((e) => e && e._p82bSpot === key)) return;
      m.deco(s.sprite, s.at[0], s.at[1], { radius: 0.2, scale: 1.0, solid: false, use: 'p82b_spot', label: s.label, _p82bSpot: key, _p82bTask: s.task, _p82bI: i, hidden: true, transient: false });
      m.baseCount = m.entities.length;
    });
  }
  const allSpots = () => SPOTS.concat(DOOR_SPOTS);
  const spotOf = (e) => allSpots()[e._p82bI];

  // ---------------------------------------------------------------- state shown in the world
  function spotBit(s) { return s.bit != null ? s.bit : allSpots().filter((o) => o.task === s.task && o.act === s.act && o.doneSprite).indexOf(s); }
  function sync(ents) {
    if (!hasG()) return;
    for (const e of ents || []) {
      if (!e || !e._p82bSpot) continue;
      const s = spotOf(e); if (!s) continue;
      const k = st(s.task), bits = num(s.task, 'b'), done = s.doneSprite && (bits & (1 << spotBit(s)));
      const show = k === 1 || (s.keepDone && done && k >= 1 && (k < 3 || s.keepAfter));
      // a thing you have picked up is not there to pick up again
      const gone = (s.act === 'gather' && ((s.once && num(s.task, 'g')) || (s.hideCarried && num(s.task, 'c')) || (s.cap === 1 && (num(s.task, 'c') || num(s.task, 'n')))));
      e.hidden = !show || !!gone || (s.doneSprite === 'p82b_none' && !!done);
      e.sprite = done ? s.doneSprite : s.sprite;
      e.label = done && s.doneLabel ? s.doneLabel : s.label;
      e.use = done && s.act !== 'gather' ? undefined : 'p82b_spot';
    }
  }
  function finish(k) { if (st(k) !== 1) return; F()['p82b_' + k] = 2; setNum(k, 'c', 0); say(TX.doneBack, 'good', 5000); try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.pickup) Audio_.sfx.pickup(); } catch (e) { /* silent */ } }
  function bump(k, by) { const T = TASKS[k], n = Math.min(T.need, num(k, 'n') + by); setNum(k, 'n', n); if (n >= T.need) finish(k); return n; }

  // ---------------------------------------------------------------- doing things
  function useSpot(e) {
    const s = spotOf(e); if (!s) return false;
    const k = s.task, T = TASKS[k]; if (st(k) !== 1) return true;
    const quiet = () => (Number(G.noise) || 0) <= QUIET, tod = ((Number(G.tod) || 0) % 1 + 1) % 1;
    if (s.act === 'mark') {
      const bit = 1 << spotBit(s), bits = num(k, 'b'); if (bits & bit) return true;
      if (k === 'traps') { if (!NIGHT(tod)) { say(TX.trapDay, 'warn'); return true; } if (!quiet()) { say(TX.trapLoud, 'warn'); return true; } }
      if (s.item) { const slot = G.player.inv.find((o) => o.id === s.item); if (!slot || slot.n <= 0) { say(TX.chimeNone, 'warn'); return true; } G.take(s.item); }
      setNum(k, 'b', bits | bit);
      say(k === 'traps' ? TX.trapDone : TX.chimeHang, 'good');
      bump(k, 1);
    } else if (s.act === 'gather') {
      const c = num(k, 'c');
      if (s.once && num(k, 'g')) return true;
      if (c >= s.cap) { say(k === 'reed' ? TX.reedFull : TX.hurdleFull, 'warn'); return true; }
      if (k === 'reed') { const bit = 1 << spotBit(s), bits = num(k, 'b'); if (bits & bit) return true; setNum(k, 'b', bits | bit); setNum(k, 'c', c + 1); say(fmt(TX.reedCut, c + 1), 'good'); }
      else if (k === 'hurdles') { setNum(k, 'c', 2); say(TX.hurdleTake, 'good'); }
      else if (k === 'bell') { setNum(k, 'c', 1); say(TX.bellFound, 'good', 6500); }
      else if (k === 'doors') { setNum(k, 'c', 3); setNum(k, 'g', 1); say(TX.tonicTake, 'good'); }
      else if (k === 'water') { setNum(k, 'c', 2); say(TX.pailTake, 'good'); }
      else if (k === 'book') { setNum(k, 'c', 1); say(TX.bookTake, 'good', 6000); }
      if (s.finish) bump(k, 1);
    } else if (s.act === 'deliver') {
      // the fold takes hurdles and the bell, whichever you have in hand
      if (s.fold) {
        const hc = st('hurdles') === 1 ? num('hurdles', 'c') : 0, bc = st('bell') === 1 ? num('bell', 'c') : 0;
        if (!hc && !bc) { say(TX.foldEmpty, 'warn'); return true; }
        if (hc) { setNum('hurdles', 'c', 0); const n = bump('hurdles', 2); if (n < TASKS.hurdles.need) say(fmt(TX.foldHurdles, n), 'good'); }
        if (bc) { setNum('bell', 'c', 0); say(TX.foldBell, 'good', 6000); bump('bell', 1); }
      } else if (k === 'reed') { const c = num(k, 'c'); if (c < s.amount) { say(fmt(TX.coopShort, c), 'warn'); return true; } setNum(k, 'c', 0); say(TX.coopLeft, 'good'); bump(k, 6); }
      else if (k === 'doors') { const c = num(k, 'c'), bit = 1 << s.bit, bits = num(k, 'b'); if (bits & bit) return true; if (!c) { say(TX.doorNone, 'warn'); return true; } setNum(k, 'c', c - 1); setNum(k, 'b', bits | bit); const n = bump(k, 1); if (n < T.need) say(fmt(TX.doorKnock, n), 'good'); }
      else if (k === 'water') { const c = num(k, 'c'); if (c < 2) { say(TX.stepNone, 'warn'); return true; } setNum(k, 'c', 0); setNum(k, 'b', 1); say(TX.stepLeft, 'good'); bump(k, 1); }
    }
    sync(G.ents);
    return true;
  }
  // the grave-bell on the Cay is js/cantabile17.js's: the task is done when a hook is hung after you took it
  function watch() {
    if (!hasG()) return;
    if (st('hook') === 1) { const hung = Number(F().p17c_hung) | 0, at = num('hook', 'b'); if ((hung & ~at) !== 0) { setNum('hook', 'n', 1); finish('hook'); } }
    // the third board in from the chandler's door creaks
    if (G.mapId === THIRD_BOARD.map && typeof Engine !== 'undefined' && Engine.cam && Math.floor(Engine.cam.x) === THIRD_BOARD.x && Math.floor(Engine.cam.y) === THIRD_BOARD.y) {
      if (!watch.on) { watch.on = true; G.noise = Math.max(Number(G.noise) || 0, 2.2); try { if (Audio_.sfx.creak) Audio_.sfx.creak(); } catch (e) { /* silent */ } }
    } else watch.on = false;
  }

  // ---------------------------------------------------------------- the board, read
  function takeTask(k) {
    if (st(k) !== 0) return;
    F()['p82b_' + k] = 1; setNum(k, 'n', 0); setNum(k, 'c', 0); setNum(k, 'b', 0);
    if (k === 'hook') setNum(k, 'b', Number(F().p17c_hung) | 0);
    try { journal('side', TASKS[k].what); } catch (e) { /* no logbook */ }
    say(TX.taken, 'good', 3500);
    sync(G.ents);
  }
  function claimTask(k) {
    if (st(k) !== 2) return;
    const T = TASKS[k]; F()['p82b_' + k] = 3;
    G.gold(T.gold); if (T.items) for (const [id, n] of T.items) if (typeof ITEMS !== 'undefined' && ITEMS[id]) G.give(id, n);
    try { questXp(T.xp); } catch (e) { /* no xp */ }
    try { Audio_.sfx.pickup(); } catch (e) { /* silent */ }
    say(fmt(TX.claimed, T.gold), 'good', 3500);
    sync(G.ents);
  }
  function status(k) {
    const T = TASKS[k], s = st(k);
    return s === 0 ? fmt(TX.take, T.gold) : s === 1 ? fmt(TX.inHand, num(k, 'n'), T.need) : s === 2 ? fmt(TX.claim, T.gold) : TX.paid;
  }
  function openBoard(id) {
    const B = BOARDS[id]; if (!B || !hasG()) return;
    G.state = 'panel';
    const lines = (arr) => arr.map((t) => `<p>${esc(t)}</p>`).join('');
    const tasks = B.tasks.map((k) => {
      const T = TASKS[k], s = st(k);
      return `<button class="dfbtn" id="p82b-t-${k}" ${s === 3 || s === 1 ? 'disabled' : ''}><b>${esc(T.title)}</b> <span>${esc(T.notice)}</span> <span class="muted">${esc(T.what)}</span> <span>${esc(status(k))}</span>${T.items ? ` <span>${esc(TX.eels)}</span>` : ''}</button>`;
    }).join('');
    const html = `<h2>${esc(B.title)}</h2><button class="dfbtn small close" id="x">${esc(TX.close)}</button>
      <div class="p82b-board"><h3>${esc(TX.notices)}</h3>${lines(B.notices)}<h3>${esc(TX.lore)}</h3><div class="p82b-lore">${lines(B.lore)}</div>
      ${B.tasks.length ? `<h3>${esc(TX.tasks)}</h3><div class="list">${tasks}</div>` : ''}</div>`;
    openModal(html, 'p82b_board');
    const token = G.panelToken, valid = () => G.panelToken === token && G.openPanel === 'p82b_board';
    $('#x').onclick = () => { closeModal(); G.state = 'play'; };
    for (const k of B.tasks) { const b = $('#p82b-t-' + k); if (b) b.onclick = () => { if (!valid()) return; if (st(k) === 0) takeTask(k); else if (st(k) === 2) claimTask(k); openBoard(id); }; }
  }
  // the three old boards: their lore, in the same hand, under the board's own heading
  function addOldLore() {
    if (!hasG() || typeof document === 'undefined') return;
    const lines = OLD_LORE[G.mapId]; if (!lines) return;
    const p = document.getElementById('modal-panel'); if (!p || p.querySelector('.p82b-lore')) return;
    const div = document.createElement('div'); div.className = 'p82b-lore';
    for (const t of lines) { const e = document.createElement('p'); e.className = 'muted'; e.textContent = t; div.appendChild(e); }
    const after = p.querySelector('p.muted'); if (after && after.parentNode) after.parentNode.insertBefore(div, after.nextSibling); else p.appendChild(div);
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    if (typeof ITEMS !== 'undefined' && !ITEMS.p82b_chime) ITEMS.p82b_chime = { name: TX.chimeName, sprite: 'loot', value: 1, desc: TX.chimeDesc };
    // Fenwick Sloe sells the chimes beside the grave-bells, at a copper (one sovereign) each [PROPOSED]
    try { const d = typeof NPCS !== 'undefined' && NPCS.p17c_sloe; if (d && Array.isArray(d.shop) && !d.shop.some((s) => s.item === 'p82b_chime')) d.shop.push({ item: 'p82b_chime', price: 1 }); } catch (e) { warnOnce('shop', e); }
    try { art(); } catch (e) { warnOnce('art', e); }
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () { const maps = _b.apply(this, arguments); try { art(); placeAll(maps); } catch (e) { warnOnce('place', e); } return maps; };
    }
    if (typeof useDeco === 'function') {
      const _u = useDeco;
      useDeco = function (e) {
        try {
          if (e && e.use === 'p82b_board' && e._p82bBoard) { openBoard(e._p82bBoard); return undefined; }
          if (e && e.use === 'p82b_spot' && e._p82bSpot) { useSpot(e); return undefined; }
        } catch (err) { warnOnce('use', err); }
        return _u.apply(this, arguments);
      };
    }
    if (typeof renderBountyBoard === 'function') {
      const _r = renderBountyBoard;
      renderBountyBoard = function () { const r = _r.apply(this, arguments); try { addOldLore(); } catch (e) { warnOnce('oldlore', e); } return r; };
    }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(G.ents); } catch (e) { warnOnce('sync', e); } return r; }; }
    if (typeof update === 'function') { const _up = update; update = function () { const r = _up.apply(this, arguments); try { watch(); } catch (e) { warnOnce('watch', e); } return r; }; }
    if (typeof document !== 'undefined' && !document.getElementById('p82b-board-style')) {
      const s = document.createElement('style'); s.id = 'p82b-board-style';
      s.textContent = '.p82b-board h3{font-family:var(--font-sc);color:var(--gold);margin:.8cqh 0 .3cqh;font-size:2cqw;font-weight:500}'
        + '.p82b-board p{margin:.2cqh 0 .5cqh;line-height:1.3}.p82b-lore p{font-style:italic}'
        + '.p82b-board .list .dfbtn{text-align:left;white-space:normal}.p82b-board .list .dfbtn span{display:inline}';
      (document.head || document.documentElement).appendChild(s);
    }
  }
  wire();

  return { TEXTS, TX, BOARDS, OLD_LORE, TASKS, KEYS, SPOTS, THIRD_BOARD, st, num, allSpots, placeAll, openBoard, takeTask, claimTask, useSpot, sync, watch, status, addDoorSpots };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BOARDS82B;
if (typeof window !== 'undefined') window.BOARDS82B = BOARDS82B;
