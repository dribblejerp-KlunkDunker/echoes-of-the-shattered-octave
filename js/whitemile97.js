// ============================================================
//  whitemile97 — Phase 97: the Dawning Heights, part five: the White Mile.
//
//  Owner, 17 Nov: "Game phase 96 the White mile my ruling is A." Design (a) of the Phase 96 findings: the book's own mile,
//  the Glassmarket as its wonder, a keeper who owes nothing to mirrors (the Tallyman), no Mirror Walks, no Polisher.
//  Shown as of Harvestmonth 419, a month before Book Two's people cross the line.
//
//  THE PLACE (Book Two, Part Two, ch. 9 to 12). "The line was at the ninth tier. You came up the last ladder through a
//  hanging house that had been gutted and left ... and out through its roof onto a walkway." Above the line "every shadow
//  ... pointed away from the Spire"; they "went up through the Bleach from shadow to shadow, the way you cross a river on
//  stones". The light "did not hurt" and took "colour ... out of whatever it touched". By night it is "a flat sourceless
//  white glow"; by day the sun joins it and "the two of them together were more than anything could stand in".
//    map p97_gutted   the gutted house: black walls, a black-painted window, a ladder up through the roof
//    map p97_mile     the walkway under the line and the scavengers' shelf [PROPOSED]; the line and its offerings; four
//                     tiers of white streets going up toward the Spire (south): a street of broken things; the houses of
//                     Sancterre and Valmont-Lune [PROPOSED names] and Valmont-Lune's garden; the Unison's street and
//                     plaza; the old Glassmarket "on the fourth tier above the line"
//  THE LIGHT. Out of shade it takes you, by the hour and by the tier (worse nearer the Spire). Shade is a wall's or a
//  thing's shadow, lying north of it. The book's kit slows it: black cloth round the face, black gloves.
//  THE UNISON ("forty bodies, one mind", Vol III; "hunts by sound", the Series Bible). Forty in four ranks of ten walk
//  their street to the plaza and back, singing 528. They are not fought and cannot be harmed. They hear noise, not
//  words and not sight: loud, they stop and lean toward you; still loud, they come; quiet, they "could not hear" you and
//  go back. Found, they strike the note. They do not kill: "They did not want to kill."
//  THE GLASSMARKET. The Bleached stand where they stood, "seven years thin". "Don't touch them."
//  THE TALLYMAN [PROPOSED]. A half-white scavenger who comes up every night to count the Glassmarket's people. He is
//  there by night only ("The Tiers slept in the morning; they lived at night"), across the widest gap. No fight: he
//  gives the Scavenger's Blacks and his hook, and says his count.
//  THE DROP-LINE [PROPOSED]. From the parapet of Valmont-Lune's garden down to the shelf: let it down once, and it is
//  the way up and back after.
//
//  Never done here (the books do it later): the nest, the sixth chain and its anchor-house are out of reach; nobody is
//  met from the books; the lone Wired is not here; the Unison is never stopped, broken or harmed; the line never moves;
//  the offerings are never taken; the Bleached are never touched; the child on the woman's hip is not drawn.
//
//  Flags (small whole numbers, read through a clamp): p97_seen (bits), p97_tally (0/1), p97_line (0/1), p97_struck (0-99).
//  Nothing here draws from chance: every look is hashed from position. Souls group 'k': one shade-lamp, on the shelf.
// ============================================================
'use strict';

const WHITEMILE97 = (() => {
  const MAP = 'p97_mile', HOUSE = 'p97_gutted', TIERS = 'p92_tiers', W = 48, H = 112, HW = 9, HH = 9, PI = Math.PI;
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('whitemile97: ' + k + ' failed', e); } };
  const h2 = (x, y) => { let n = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263)) >>> 0; n = Math.imul(n ^ (n >>> 13), 1274126177) >>> 0; return ((n ^ (n >>> 16)) & 0xffff) / 65536; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };

  // ================================================================ the words ([PROPOSED] unless a book is named)
  const TX = {
    name: S('Sol-Luminary: the White Mile'), houseName: S('Sol-Luminary: a gutted house under the line'),
    doorTiers: S('A gutted house under the line. Black walls, and a ladder up through its roof.'),   // Book Two: "a hanging house that had been gutted and left"
    doorBack: S('The doorway, back out onto the Tiers'),
    house: S('A dark room with nothing in it. Black walls, a black-painted window, and a ladder going up through the roof.'),   // Book Two l.941
    window: S('A window, painted black on the inside.'),
    ladderUp: S('The ladder, up through the roof onto the walkway'), trapDown: S('The trapdoor, down into the gutted house'),
    arrive: S('A walkway of black planks under the wall of the tier above. Over your head the stone stops hanging and begins to stand. South of you, straight as a ruled line, the shade stops and the light begins.'),   // Book Two l.941
    shelf: S('The scavengers\' shelf: bedrolls, a water-jar, black cloth by the bolt. The only rest there is.'),
    bedroll: S('A bedroll, rolled and tied. Whoever sleeps here is down in the Tiers by day.'),
    cloth: S('A bolt of black cloth. The Tiers sell it by the bolt.'),   // Book Two l.953
    endLadder: S('The end-ladder: a few rungs up to the line.'),
    line: S('The line. On the stone where the shade ends, somebody has left things.'),
    offerBread: S('A loaf of bread, black on the crust, half wrapped in a cloth. A tin cup with water in it.'),   // Book Two l.955-957, as built in Phase 92
    offerCandle: S('A candle-end, unlit, in a saucer. Three pears.'),
    offerDrawing: S('A child\'s drawing on a scrap of paper, weighted with a pebble: a black shape with wings, and a sun crossed out.'),
    offerBlanket: S('A folded blanket, black.'),
    offerNo: S('They are not for you.'),
    first: S('The light comes onto you like hands. It does not hurt. The back of your hand is pale, and the hairs on it have gone white.'),   // Book Two l.975-985
    shadeIn: S('Shade. The colour stays where it is.'),
    lost: S('You stayed in the white too long. There is not enough of you left to stop the light.'),
    night: S('Night. A flat white glow with no sun in it lies on the streets, and it hums.'),   // Book Two l.947
    dead: S('The dead hour. The white is at its thinnest.'),
    sunUp: S('The sun is up. Two lights now. Nothing can stand in the two of them together for long.'),   // Book Two l.1905
    tier1: S('The first tier above the line. A white street, everything in it white, and every shadow pointing north, away from the Spire.'),   // Book Two l.947, 971
    wall: S('A broken wall. Its shadow lies out across the street like a black plank.'),   // Book Two l.985
    column: S('A fallen column across the street, in two pieces, and its long thin shadow.'),   // Book Two l.971
    basin: S('A fountain-basin, dry. Its rim throws a black crescent.'),   // Book Two l.985
    doorway: S('A doorway, deep enough to stand in.'),   // Book Two l.985
    tier2: S('The second tier. Two great houses, white to the bone. Their domes were gold once: you can tell from the shape of them.'),   // Book Two l.547
    sancterre: S('House Sancterre. The pennant-poles are bare. The doors stand open on a white hall.'),
    valmont: S('House Valmont-Lune. Gold leaf has peeled off the dome and lies in the gutters, white.'),   // Book Two l.1253 "scraps of gold leaf peeled off the dead domes"
    carriage: S('A carriage in the street with its shafts down. White wood, white leather, white brass.'),
    balcony: S('A balcony over the street. Under it, a strip of dark.'),
    garden: S('Valmont-Lune\'s garden: a terrace of white gravel, white statues in a row, a white vine on a pergola. At its far end, a parapet over the drop.'),
    statue: S('A statue, white. You cannot tell now who it was.'),
    parapet: S('The garden\'s parapet. Below it, a long way down, the black planks of the walkway.'),
    lineTop: S('A scavenger\'s drop-line, coiled on the parapet and made fast to an iron ring. Let it down'),
    lineTopDown: S('The drop-line. Go down to the shelf'),
    lineBot: S('A drop-line hangs down the wall from the garden above. Climb'),
    lineBotNone: S('An iron ring in the wall, high up. Nothing hangs from it.'),
    lineLet: S('You pay the line out over the parapet. It hangs down the wall to the shelf, black on white. It will be there now.'),
    lineDown: S('Hand under hand down the wall, out of the light.'), lineUp: S('Hand over hand up the wall, into the white.'),
    tier3: S('The third tier. A broad white street, and at its east end a plaza. Under everything, one high pure note, without a breath in it anywhere.'),   // Book Two l.929
    whitehouse: S('A white house with a white chimney. Its door stands open on a stair.'),   // Book Two l.1099
    plinth: S('A statue on a plinth, in the middle of the street, and its shadow.'),   // Book Two l.993
    plaza: S('The plaza. A dry fountain. The street comes into it like a nave.'),
    unison: S('Forty of them, in four ranks of ten, coming slowly down the white street the way a procession comes. Choir-robes gone the colour of the street. White faces, white hands, white eyes. In every throat, under the high stiff collar, a line of copper.'),   // Book Two l.1103-1105
    wired: S('One of the Unison. The mouth stands open. The chest is still: it is not this one\'s turn to breathe.'),   // Book Two l.1113
    lean: S('The procession stops. Forty heads turn at the same moment, to the same angle. The note does not change. It leans.'),   // Book Two l.1121-1127
    come: S('They are coming toward the sound you made. Slowly, steadily, without hurry.'),   // Book Two l.1961
    lostYou: S('They stand a long time, listening. They cannot hear you. All at once they turn, and go back.'),   // Book Two l.1163-1171
    strike: S('Forty throats take breath at once, and strike the note. Not held. Struck, like forty hammers on one anvil.'),   // Book Two l.1967
    notYou: S('You are on the stone with your ears ringing. They look through you. It is not you they want.'),   // Book Two l.1987
    past: S('They go past you on both sides. Not one of them turns.'),
    press: S('This near, the note stops being a sound. It is a pressure. It takes the voice out of your chest.'),   // Book Two l.1093
    noHarm: S('The blow does nothing you can see. The note does not change.'),
    noSong: S('Your note goes into theirs and is gone.'),
    tier4: S('The fourth tier above the line: the old Glassmarket. A long arcaded square under the shoulder of a dome. Stalls, awnings, trestles, baskets. All of it white.'),   // Book Two l.1013-1019
    people: S('Among the stalls, standing where they were standing when the Light let go: the people. They are white, and the light comes through them. They cast no shadows. Seven years thin.'),   // Book Two l.1019-1023
    dontTouch: S('Don\'t touch them.'),   // Book Two l.1015, 1027
    blStall: S('A woman at a stall with her hand out, as if to take a coin.'),   // Book Two l.1021
    blStallUse: S('Her outstretched fingers are trembling. Very slightly. As if something in her were still trying to finish it.'),   // Book Two l.1029-1031
    blBasket: S('A man with a basket on his shoulder, mid-stride.'),   // Book Two l.1021
    blBench: S('Two old men on a bench with their heads together.'),   // Book Two l.1021
    blFount: S('A woman by the fountain with her face turned south, toward the Spire.'),   // Book Two l.1021
    blPorter: S('A porter bent under a sack. The sack is white, and you can see the wall through both of them.'),
    blJug: S('A woman holding a jug to be filled. Nobody is filling it.'),
    blUp: S('A man with his head back, looking up.'),
    blStool: S('A stall-keeper on a stool, hands in his lap.'),
    stall: S('A stall. White baskets of white fruit on a white trestle under a white awning.'),   // Book Two l.1019
    fountain: S('The market fountain, dry. Its rim throws a black crescent on the north side.'),
    arcade: S('The arcade. Under its arches, the dark is ordinary.'),
    dome: S('Over the market, the shoulder of a dome. It was gilded once. It is white now.'),
    spire: S('The Dawning Spire, over the roofs to the south: a white bone, cracked down one side, and the crack is black. Black chains run up to it out of the white.'),   // Book Two l.529, 1247
    rubble: S('The street goes on up from here toward the rim, white on white. A fall of white stone has shut it. Past it, the light is stronger than anything you have stood in.'),
    tallyMarks: S('A pillar of the south arcade, tallied in black chalk from the floor to as high as a man can reach: five strokes and a bar, five strokes and a bar. Seven years of nights. The newest rows are shorter than the oldest.'),
    tallyGone: S('Nobody stands by the tallied pillar. He comes up at night.'),
    tallyName: S('The Tallyman'),
    tallyDesc: S('A scavenger wound in black cloth to the eyes. The left hand is bare, and white, and you can see the pillar through two of its fingers.'),
    tallyGift: S('You came across the wide one. Not many do, and none of them from below the Tiers. I count them, that is all I do. Somebody should. Nine tonight. There were fourteen the first winter I came up. Nobody takes them. They only get less. Here. Blacks, and my second hook. I have counted enough nights to know I will not need two.'),
    tallyTake: S('Take the bundle.'),
    tallyAfter: S('Wind the cloth to your eyes. Keep your hands in the gloves. And do not touch them. Not to help. There is nothing left to take hold of.'),
    jGift: S('The Tallyman: across the widest gap in the old Glassmarket, by night, a scavenger of the line who counts the market\'s people. Nine, where there were fourteen. He gave me his blacks and his second hook.'),
    scavName: S('A scavenger of the line'),
    lampLabel: S('A shade-lamp on a hook under the shelf, unlit. Stand by it to light it.'), lampLit: S('The shelf\'s shade-lamp, burning low. Use it to rest.'), lampName: S('the scavengers\' shelf'),
    cardName: S('The White Mile'), cardDay: S('two lights'), cardNight: S('night'), cardDead: S('the dead hour'), cardShade: S('in shade'), cardLight: S('in the light'),
    poleDay: S('the cloth is gone'), poleNight: S('the cloth is grey'), poleDead: S('the cloth holds'),
    wrap: S('Scavenger\'s Wrap'), wrapDesc: S('Black cloth from Brenna Corliss\'s chandlery, cut long, to be wound round the head and face until only the eyes show. The Bleach is slower on what it cannot find.'),   // Book Two l.953
    gloves: S('Scavenger\'s Gloves'), glovesDesc: S('Black gloves, the fingers darned with black thread. One finger of the left has been darned in white, and unpicked, and darned again.'),   // Book Two l.953
    coat: S('Scavenger\'s Coat'), coatDesc: S('A long black coat with a hood-collar. One whole side of it has gone the colour of bone and been dyed back, twice.'),   // Book Two l.2175
    hook: S('The Tallyman\'s Hook'), hookDesc: S('A scavenger\'s hook on a black ash pole, a rag of black cloth knotted under the iron. The pole is notched from end to end, five and a bar, five and a bar.'),
  };
  const SAY = {
    tally: {
      greet: { polite: S('Light keep you true. Keep your voice where mine is.'), normal: S('Light keep you true. Low. They are two streets down.'), blunt: S('Low. Or go and be loud somewhere I am not.') },
      topics: {
        [S('The count')]: S('Every night. I stand here and I count them, and I cut it on the pole, and I chalk it on the pillar. Fourteen. Thirteen. A long while at thirteen. Nine tonight. Nobody comes for them. They are only less, a little at a time, the way a gull goes in that light.'),   // Book Two l.581-583
        [S('The Glassmarket')]: S('It was a market on the morning it happened. You can see what they were doing. One was taking a coin. I do not know their names. I used to make names for them, and I stopped.'),
        [S('The Unison')]: S('They do not hear words. They hear noise. Run, and they hear you. Strike something, and they hear you. Sing, and they will come up a house to find the mouth it came out of. Walk, and keep your voice in your chest, and you are a wall to them.'),   // Book Two l.1051, 1137; the Series Bible
        [S('Crossing')]: S('Shadow to shadow, the way you cross a river on stones. Every shadow up here lies north. The dead hour is the kindest. By day I would not put my hand out of that arcade.'),   // Book Two l.985, 947
        [S('Further up')]: S('The street is shut above the market. I have not looked for a way round. Things live on the chains. I leave them be, and they leave the count be.'),
      },
    },
    scav: {
      greet: { polite: S('Light keep you true. You are a long way up for a stranger.'), normal: S('Light keep you true. Mind the line. It does not look like anything.'), blunt: S('Speak low or go down.') },
      topics: {
        [S('The line')]: S('There, where the dark stops. Things left on it are not ours and not yours. Past it you go from shadow to shadow and you do not dawdle between.'),
        [S('The Tallyman')]: S('He goes up every night, further than any of us, to the old market. He counts the ones who are still standing in it. Ask him why. He will tell you somebody should.'),
        [S('The white streets')]: S('Go at night. The dead hour if you can wait for it. Wrap your face and glove your hands. And keep quiet on the third tier: that street belongs to the choir.'),
        [S('The drop-line')]: S('There is a ring in the wall at the east end of the shelf. The line that goes on it is up in the garden, coiled on the parapet. Whoever gets up there by the streets can let it down, and after that it is one climb.'),
      },
    },
  };

  // ================================================================ the plan (cells; x east, y south; the Spire is south, so shadows lie north)
  const P = {
    hDoor: [4, 8], hIn: [4.5, 6.9], hLadder: [4.5, 3.4], tiersDoor: [76, 5], tiersOut: [76.5, 6.6],
    arrive: [24.5, 4.6], trap: [25.6, 3.6], lamp: [19.5, 4.5], scav: [17.5, 6.4], bedroll: [16.4, 3.7], cloth: [15.6, 6.8],
    lineBot: [43.5, 8.2], lineBotStand: [43.5, 7.4], lineTop: [43.5, 13.3], lineTopStand: [43.5, 13.9],
    offerings: [[22.4, 12.3], [24.6, 12.25], [26.2, 12.4], [21.2, 12.35]],
    ramps: [[9, 12, 0, 0.6], [30, 33, 0.6, 1.3], [53, 56, 1.3, 2.0], [78, 81, 2.0, 2.7]],
    street: [4, 60, 43, 71], plazaC: [36.5, 66.5], market: [8, 85, 40, 102],
    tally: [24.5, 104.4], tallyPillar: [22.6, 103.5], rubble: [39, 104],
    bleached: [['p97_bl_stall', 12.5, 94.4, 'blStall'], ['p97_bl_basket', 30.5, 91.6, 'blBasket'], ['p97_bl_bench', 33.5, 99.6, 'blBench'], ['p97_bl_fount', 26.6, 96.4, 'blFount'],
      ['p97_bl_porter', 17.5, 88.6, 'blPorter'], ['p97_bl_jug', 22.4, 99.2, 'blJug'], ['p97_bl_up', 28.5, 100.5, 'blUp'], ['p97_bl_stool', 35.5, 93.6, 'blStool']],
    stalls: [[21, 90], [12, 93], [30, 89], [33, 95], [14, 99]],
  };
  const COUNT = 9;                                             // the market's people tonight: eight figures, one of them two old men on a bench
  const hv = (vy) => { let z = 0; for (const [y0, y1, a, b] of P.ramps) { if (vy <= y0) return z; if (vy < y1) return a + (b - a) * (vy - y0) / (y1 - y0); z = b; } return z; };
  const lvlAt = (j) => hv(j + 0.5);
  const tierOf = (y) => y < 12 ? 0 : y < 33 ? 1 : y < 56 ? 2 : y < 81 ? 3 : 4;
  const TERRACE = [40, 13, 45, 36], TERRACE_Z = 1.3;
  const inTerrace = (i, j) => i >= TERRACE[0] && i <= TERRACE[2] && j >= TERRACE[1] && j <= TERRACE[3];
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  // kinds: 4 white mass (default), 1 planks, 2 white street, 3 stair, 5 black wall, 6 a low thing (a trestle, a basin, a plinth, a column), 14 a thing standing on the street (the carriage), 8 paving, 9 parapet, 10 garden, 11 pillar, 12 broken wall, 7 rubble, 13 a great house
  function plan() {
    const N = W * H, kind = new Uint8Array(N).fill(4), shade = new Uint8Array(N);
    const rect = (x0, y0, x1, y1, k) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const q = at(i, j); if (q >= 0) kind[q] = k; } };
    const sh = (x0, y0, x1, y1) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const q = at(i, j); if (q >= 0) shade[q] = 1; } };
    // the walkway under the line, and the end-ladder
    rect(0, 0, W - 1, 2, 5); rect(14, 3, 45, 8, 1); sh(14, 3, 45, 8); rect(23, 9, 24, 11, 3); sh(23, 9, 24, 11);
    // the first tier: a street of broken things
    rect(10, 12, 36, 29, 2);
    rect(21, 16, 25, 16, 12); sh(21, 14, 25, 15);
    rect(12, 19, 14, 19, 6); rect(17, 19, 19, 19, 6); sh(12, 18, 14, 18); sh(17, 18, 19, 18);
    rect(14, 23, 15, 24, 6); sh(14, 22, 15, 22);
    rect(9, 23, 9, 23, 2); sh(9, 23, 9, 23);
    sh(10, 27, 36, 29); rect(22, 30, 25, 32, 3); sh(22, 30, 25, 32);
    // the second tier: the two houses, the street between, the garden
    rect(8, 33, 39, 37, 2); rect(20, 38, 27, 48, 2); rect(8, 49, 39, 52, 2);
    rect(8, 38, 19, 48, 13); rect(28, 38, 39, 48, 13);
    sh(8, 35, 19, 37); sh(28, 35, 39, 37);
    rect(19, 41, 19, 41, 2); sh(19, 41, 19, 41); rect(28, 43, 28, 43, 2); sh(28, 43, 28, 43);
    rect(23, 43, 24, 43, 14); sh(23, 41, 24, 42); sh(26, 46, 27, 47);
    sh(8, 50, 39, 52); rect(22, 53, 25, 55, 3); sh(22, 53, 25, 55);
    rect(TERRACE[0], TERRACE[1], TERRACE[2], TERRACE[3], 10); rect(40, 12, 45, 12, 9); sh(40, 33, 41, 34);
    for (const y of [32, 28, 24, 20, 16]) { rect(43, y, 43, y, 6); sh(43, y - 2, 43, y - 1); }
    // the third tier: the Unison's street and plaza
    rect(22, 56, 25, 59, 2); sh(22, 56, 25, 59); rect(16, 59, 16, 59, 2); sh(16, 59, 16, 59);
    rect(P.street[0], P.street[1], P.street[2], P.street[3], 2); rect(30, 57, 43, 75, 8);
    rect(23, 69, 24, 69, 6); sh(23, 64, 24, 68); sh(4, 70, 29, 71);
    rect(36, 66, 37, 67, 6); sh(36, 64, 37, 65);
    rect(22, 72, 25, 77, 2); sh(22, 72, 25, 77); rect(22, 78, 25, 80, 3); sh(22, 78, 25, 80);
    // the fourth tier: the old Glassmarket
    rect(8, 81, 40, 105, 8); sh(8, 81, 40, 84); sh(8, 103, 40, 105);
    for (let i = 10; i <= 38; i += 4) { rect(i, 84, i, 84, 11); rect(i, 103, i, 103, 11); }
    for (const [x, y] of P.stalls) { rect(x, y, x + 1, y, 6); sh(x, y - 2, x + 1, y - 1); }
    rect(23, 97, 25, 98, 6); sh(23, 95, 25, 96);
    rect(38, 103, 40, 105, 7);
    return { kind, shade };
  }

  // ================================================================ art (drawn in code; hashed noise, never chance)
  const FLOORS = ['t_p97_planks', 't_p97_street', 't_p97_street', 't_p97_step', 't_p97_shadow', 't_p97_paving', 't_p97_gravel'];
  const PLANKS = 0, STREET = 1, BLOCKED = 2, STEP = 3, SHADOW = 4, PAVING = 5, GRAVEL = 6;
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || !Engine.sprites || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const x = canvas(w, h, fn); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    const wh = (v, a) => `rgba(${v},${v - 1},${v - 5},${a == null ? 1 : a})`, g = (v) => `rgb(${v},${v},${v + 3})`;
    if (Engine.addTexture) {
      tex('t_p97_planks', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(18 + (h2(i >> 1, j) * 9 | 0) - ((i % 16) === 0 ? 10 : 0) + ((j % 32) === 3 && (i % 16) === 8 ? 26 : 0)), i, j); });
      // white flags: the joints are nearly all that is left to see
      tex('t_p97_street', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (j % 16) === 0 || ((i + ((j >> 4) & 1) * 16) % 32) === 0; px(x, wh(240 + (h2(i, j) * 6 | 0) - (joint ? 12 : 0)), i, j); } });
      tex('t_p97_paving', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (i % 21) === 0 || (j % 21) === 0, dia = ((i + j) % 42) === 0; px(x, wh(238 + (h2(i, j) * 7 | 0) - (joint ? 14 : 0) - (dia ? 5 : 0)), i, j); } });
      tex('t_p97_gravel', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(232 + (h2(i * 3, j * 5) * 14 | 0)), i, j); });
      tex('t_p97_step', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(232 + (h2(i, j) * 5 | 0) - ((j % 16) < 2 ? 34 : 0)), i, j); });
      // a shadow on white stone: "a black plank" (Book Two), the joints just showing
      tex('t_p97_shadow', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (j % 16) === 0 || ((i + ((j >> 4) & 1) * 16) % 32) === 0; px(x, g(20 + (h2(i, j) * 6 | 0) + (joint ? 8 : 0)), i, j); } });
      // walls: dressed white stone in courses; a great house's front with blind windows; black-painted wall; a pillar
      tex('t_p97_wall', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const joint = (j % 16) === 0 || ((i + ((j >> 4) & 1) * 16) % 32) === 0; px(x, wh(234 + (h2(i, j) * 6 | 0) - (joint ? 16 : 0) - (j > 56 ? 6 : 0)), i, j); } });
      tex('t_p97_house', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(238 + (h2(i, j) * 5 | 0) - ((j % 32) === 0 ? 18 : 0)), i, j);
        for (const i0 of [10, 38]) { px(x, wh(206), i0, 12, 16, 34); px(x, wh(224), i0 + 2, 14, 12, 30); px(x, wh(206), i0 + 7, 14, 2, 30); px(x, wh(206), i0 + 2, 28, 12, 2); px(x, wh(196), i0 - 2, 46, 20, 3); }
        px(x, wh(214), 0, 0, 64, 4); });
      tex('t_p97_black', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, g(10 + (h2(i, j >> 1) * 8 | 0) + ((j % 21) === 0 ? 6 : 0)), i, j); });
      tex('t_p97_pillar', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(226 + (h2(i, j) * 5 | 0) - (Math.abs((i % 16) - 8) > 6 ? 22 : 0) - (j < 5 || j > 58 ? 14 : 0)), i, j); });
      tex('t_p97_low', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) px(x, wh(230 + (h2(i, j) * 7 | 0) - (j < 4 ? 20 : 0) - ((i % 32) === 0 ? 10 : 0)), i, j); });
      tex('t_p97_rubble', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const b = h2(i >> 3, j >> 3), e = (i % 8) === 0 || (j % 8) === 0; px(x, wh(214 + (b * 30 | 0) - (e ? 26 : 0)), i, j); } });
      tex('t_p97_door', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const frame = i < 7 || i > 56 || j < 6; px(x, frame ? g(26 + (h2(i, j) * 8 | 0)) : g(3 + (h2(i, j) * 3 | 0)), i, j); } px(x, g(34), 7, 6, 50, 1); });
    }
    // ---- one of the Unison: a choir-robe gone the colour of the street, girdled, a high stiff collar; white face, hands, eyes; copper in the throat
    const wired = (name, man, breath, turned) => add(name, 48, 128, 1.0, (x) => {
      const sh = man ? 3 : 0, cx = 24, top = man ? 6 : 10, lift = breath ? -1 : 0;
      for (let j = top + 26; j < 126; j++) { const t = (j - top - 26) / 100, hw = 9 + sh + t * 9; for (let i = cx - hw | 0; i <= cx + hw; i++) { const fold = ((i * 3 + (j >> 2)) % 7) === 0; px(x, wh(226 + (h2(i, j >> 2) * 8 | 0) - (fold ? 22 : 0) - (Math.abs(i - cx) > hw - 2 ? 26 : 0)), i, j); } }   // the robe
      px(x, wh(196), cx - 11 - sh, top + 58, 22 + sh * 2, 3);                                                   // the girdle
      for (const s of [-1, 1]) for (let j = top + 30 + lift; j < top + 78; j++) { const i0 = cx + s * (11 + sh) + (s < 0 ? -4 : 0); px(x, wh(222 - ((j % 9) === 0 ? 16 : 0)), i0, j, 5, 1); }   // the sleeves
      for (const s of [-1, 1]) px(x, wh(246), cx + s * (11 + sh) + (s < 0 ? -4 : 0), top + 78, 5, 5);            // white hands
      px(x, wh(204), cx - 7 - (sh >> 1), top + 18 + lift, 14 + sh, 9); px(x, wh(232), cx - 6 - (sh >> 1), top + 19 + lift, 12 + sh, 7);   // the collar
      px(x, 'rgb(206,128,62)', cx - 3, top + 22 + lift, 6, 1); px(x, 'rgb(246,178,96)', cx - 1, top + 22 + lift, 2, 1);   // the copper, glinting under it
      const hx = turned ? 3 : 0;
      for (let j = top; j < top + 19; j++) { const t = (j - top - 9) / 9.5, hw = Math.sqrt(Math.max(0, 1 - t * t)) * (7 + (sh >> 1)); for (let i = cx + hx - hw | 0; i <= cx + hx + hw; i++) px(x, wh(240 + (h2(i, j) * 6 | 0) - (i > cx + hx + hw - 2 ? 22 : 0)), i, j + lift); }   // the head, cropped
      px(x, wh(250), cx + hx - 4, top + 8 + lift, 3, 2); px(x, wh(250), cx + hx + 2, top + 8 + lift, 3, 2); px(x, wh(214), cx + hx - 4, top + 7 + lift, 3, 1); px(x, wh(214), cx + hx + 2, top + 7 + lift, 3, 1);   // white eyes
      px(x, 'rgb(84,70,66)', cx + hx - 2, top + 13 + lift, 5, 3);                                                // the mouth, open
    });
    for (const [n, man] of [['p97_wired', 0], ['p97_wiredm', 1]]) { wired(n, man, 0, 0); wired(n + '_b', man, 1, 0); wired(n + '_t', man, 0, 1); }
    // ---- the Bleached: white, the light coming through them, soft at the edge
    // drawn first as a shape, then thinned: a pale outline, and inside it white that the street shows through ("the light comes through them")
    const ghost = (name, w, h, hs, fn) => add(name, w, h, hs, (x) => {
      const mk = canvas(w, h, (M) => {
        const T = { d: 255,
          set(d) { T.d = d; return T; },
          ell(cx, cy, rx, ry) { M.fillStyle = `rgb(${T.d},0,0)`; M.beginPath(); M.ellipse(cx, cy, rx, ry, 0, 0, PI * 2); M.fill(); return T; },
          quad(pts) { M.fillStyle = `rgb(${T.d},0,0)`; M.beginPath(); pts.forEach((q, n) => n ? M.lineTo(q[0], q[1]) : M.moveTo(q[0], q[1])); M.closePath(); M.fill(); return T; },
          rect(i, j, ww, hh) { M.fillStyle = `rgb(${T.d},0,0)`; M.fillRect(i, j, ww, hh); return T; },
          limb(x0, y0, x1, y1, lw) { M.strokeStyle = `rgb(${T.d},0,0)`; M.lineWidth = lw; M.lineCap = 'round'; M.beginPath(); M.moveTo(x0, y0); M.lineTo(x1, y1); M.stroke(); return T; } };
        fn(T);
      });
      const md = mk.getImageData(0, 0, w, h).data, inAt = (i, j) => i >= 0 && j >= 0 && i < w && j < h && md[(j * w + i) * 4 + 3] > 120;
      for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { if (!inAt(i, j)) continue;
        const edge = !inAt(i - 1, j) || !inAt(i + 1, j) || !inAt(i, j - 1) || !inAt(i, j + 1), d = md[(j * w + i) * 4] / 255;
        if (edge) px(x, `rgba(${168 + (h2(i, j) * 14 | 0)},${170 + (h2(i, j) * 14 | 0)},${180},${0.5 + d * 0.16})`, i, j);
        else px(x, wh(247 + (h2(i, j) * 7 | 0), 0.2 + d * 0.24 + h2(i * 3, j >> 2) * 0.1 - (((j >> 1) + i) % 9 === 0 ? 0.1 : 0)), i, j); }
    });
    const woman = (T, cx, long) => { T.set(255).ell(cx, 13, 6, 7); if (long) T.ell(cx, 18, 6.5, 10); else T.ell(cx - 1, 7, 4, 3.4); T.rect(cx - 2, 19, 4, 5).ell(cx, 27, 9.5, 4.5).quad([[cx - 9, 26], [cx + 9, 26], [cx + 7, 57], [cx - 7, 57]]).quad([[cx - 7, 55], [cx + 7, 55], [cx + 14, 126], [cx - 14, 126]]); };
    ghost('p97_bl_stall', 60, 128, 1.0, (T) => { woman(T, 22, 0); T.limb(13, 29, 11, 58, 4).limb(31, 29, 38, 41, 4).limb(38, 41, 50, 39, 3.4).ell(53, 39, 2.6, 2).limb(54, 38, 58, 37, 1.2).limb(54, 39.5, 58, 39.5, 1.2).limb(54, 41, 57, 42, 1.2); });   // her hand out, for the coin
    ghost('p97_bl_basket', 60, 128, 1.0, (T) => { T.set(255).ell(26, 23, 6, 7).rect(24, 29, 4, 4).ell(26, 36, 9, 4.5).quad([[17, 35], [35, 35], [33, 72], [19, 72]]).limb(23, 72, 13, 122, 6.5).limb(29, 72, 39, 122, 6.5).limb(11, 124, 16, 124, 4).limb(38, 124, 44, 124, 4).limb(17, 37, 11, 62, 4).limb(35, 37, 40, 20, 4); T.set(150).ell(37, 11, 15, 7.5).rect(23, 3, 28, 3); });   // a basket on his shoulder, mid-stride
    ghost('p97_bl_bench', 96, 96, 0.75, (T) => { T.set(150).rect(8, 52, 80, 4).rect(12, 56, 4, 40).rect(80, 56, 4, 40); T.set(255);
      T.ell(41, 13, 6, 7).quad([[26, 25], [44, 21], [42, 53], [25, 53]]).rect(25, 50, 19, 7).limb(29, 57, 29, 93, 5).limb(39, 57, 39, 93, 5).limb(27, 27, 31, 50, 4);
      T.ell(54, 14, 6, 7).quad([[51, 22], [69, 26], [70, 53], [53, 53]]).rect(52, 50, 19, 7).limb(57, 57, 57, 93, 5).limb(67, 57, 67, 93, 5).limb(68, 28, 64, 50, 4); });   // two old men, heads together
    ghost('p97_bl_fount', 48, 128, 1.0, (T) => { woman(T, 24, 1); T.limb(15, 29, 13, 60, 4).limb(33, 29, 35, 60, 4); });                    // her back to you: her face is to the Spire
    ghost('p97_bl_porter', 64, 112, 0.875, (T) => { T.set(150).ell(27, 20, 21, 16).limb(12, 30, 9, 38, 3); T.set(255).limb(36, 62, 25, 37, 15).ell(15, 42, 6, 6.5).limb(34, 66, 28, 108, 6.5).limb(38, 66, 45, 108, 6.5).limb(26, 110, 31, 110, 4).limb(44, 110, 50, 110, 4).limb(25, 39, 14, 26, 4); });   // bent under a sack
    ghost('p97_bl_jug', 56, 128, 1.0, (T) => { woman(T, 20, 0); T.limb(12, 29, 22, 42, 4).limb(28, 29, 36, 42, 4).limb(22, 42, 38, 44, 3.4); T.set(150).ell(44, 46, 7, 9).rect(41, 33, 6, 6).rect(39, 31, 10, 2.5); });   // a jug held out to be filled
    ghost('p97_bl_up', 48, 128, 1.0, (T) => { T.set(255).ell(22, 11, 7, 6).rect(22, 15, 4, 6).ell(24, 23, 9.5, 4.5).quad([[15, 22], [33, 22], [31, 62], [17, 62]]).limb(15, 24, 12, 58, 4).limb(33, 24, 36, 58, 4).limb(20, 62, 19, 123, 6.5).limb(28, 62, 29, 123, 6.5).limb(17, 125, 21, 125, 4).limb(28, 125, 32, 125, 4); });   // his head back
    ghost('p97_bl_stool', 52, 92, 0.72, (T) => { T.set(150).rect(14, 60, 24, 4).rect(15, 64, 3, 28).rect(34, 64, 3, 28); T.set(255).ell(26, 10, 6, 7).rect(24, 16, 4, 5).ell(26, 23, 9, 4).quad([[17, 22], [35, 22], [34, 52], [18, 52]]).quad([[17, 48], [35, 48], [37, 60], [15, 60]]).limb(20, 60, 20, 89, 5.5).limb(32, 60, 32, 89, 5.5).limb(17, 24, 22, 47, 4).limb(35, 24, 30, 47, 4); });   // on his stool, hands in his lap
    // ---- the Tallyman, and a scavenger of the line: wound in black to the eyes; one hand bare, and white
    const scav = (name, hookPole, pale) => add(name, 64, 132, 1.03, (x) => {
      const cx = 28;
      for (let j = 30; j < 130; j++) { const t = (j - 30) / 100, hw = 10 + t * 7; for (let i = cx - hw | 0; i <= cx + hw; i++) { const bone = pale && i < cx - 2 && h2(i >> 1, j >> 2) < 0.55; px(x, bone ? `rgb(${58 + (h2(i, j) * 16 | 0)},${56 + (h2(i, j) * 14 | 0)},${60})` : g(14 + (h2(i, j >> 1) * 10 | 0)), i, j); } }
      for (let j = 6; j < 30; j++) { const t = (j - 18) / 12, hw = Math.sqrt(Math.max(0, 1 - t * t)) * 9; for (let i = cx - hw | 0; i <= cx + hw; i++) px(x, g(12 + (((j >> 1) + (i >> 3)) % 3) * 7), i, j); }   // the wrap, wound
      px(x, 'rgb(186,160,140)', cx - 5, 15, 10, 3); px(x, g(20), cx - 3, 16, 2, 1); px(x, g(20), cx + 2, 16, 2, 1);          // only the eyes show
      for (let j = 36; j < 84; j++) { px(x, g(16 + ((j % 8) === 0 ? 8 : 0)), cx - 16, j, 5, 1); px(x, g(16 + ((j % 8) === 0 ? 8 : 0)), cx + 12, j, 5, 1); }
      px(x, pale ? wh(244, 0.8) : g(12), cx - 16, 84, 5, 6); px(x, g(12), cx + 12, 84, 5, 6);                                // the left hand, bare and white
      if (hookPole) { px(x, 'rgb(30,26,24)', 54, 4, 3, 126); for (let j = 16; j < 124; j += 6) px(x, 'rgb(84,76,66)', 54, j, 3, 1); x.strokeStyle = 'rgb(96,100,108)'; x.lineWidth = 3; x.beginPath(); x.moveTo(55, 6); x.quadraticCurveTo(44, -2, 44, 12); x.stroke(); px(x, g(8), 52, 14, 7, 9); }
    });
    scav('p97_tallyman', 1, 1); scav('p97_scav', 0, 0);
    // ---- things
    add('p97_stall', 96, 96, 1.5, (x) => { for (let i = 8; i < 88; i++) for (let j = 6; j < 22; j++) px(x, wh(244 - (((i + (j >> 1)) % 14) < 7 ? 14 : 0), 0.82), i, j + ((i - 48) * (i - 48) / 900 | 0));   // the awning, gone thin
      px(x, wh(204), 10, 8, 3, 86); px(x, wh(204), 84, 8, 3, 86); px(x, wh(226), 12, 56, 72, 5); px(x, wh(206), 16, 61, 4, 34); px(x, wh(206), 76, 61, 4, 34);
      for (const i0 of [18, 38, 58]) { px(x, wh(236), i0, 44, 18, 12); px(x, wh(210), i0, 44, 18, 2); for (let k = 0; k < 4; k++) px(x, wh(250), i0 + 2 + k * 4, 41, 3, 3); } });
    add('p97_statue', 40, 120, 1.25, (x) => { for (let j = 0; j < 120; j++) { const t = j / 120, hw = j < 14 ? 6 : j < 24 ? 4 : 9 + t * 5; for (let i = 20 - hw | 0; i <= 20 + hw; i++) px(x, wh(232 + (h2(i, j) * 8 | 0) - (i > 20 + hw - 3 ? 26 : 0) - (h2(i >> 2, j >> 3) < 0.12 ? 14 : 0)), i, j); } });
    add('p97_carriage', 128, 80, 1.1, (x) => { px(x, wh(232), 24, 14, 72, 34); px(x, wh(212), 24, 14, 72, 3); px(x, wh(200), 34, 20, 20, 16); px(x, wh(200), 64, 20, 20, 16); px(x, wh(222), 96, 44, 30, 3);
      for (const cxw of [40, 82]) { x.strokeStyle = wh(214); x.lineWidth = 3; x.beginPath(); x.arc(cxw, 60, 17, 0, PI * 2); x.stroke(); x.lineWidth = 1; for (let k = 0; k < 8; k++) { x.beginPath(); x.moveTo(cxw, 60); x.lineTo(cxw + Math.cos(k * PI / 4) * 16, 60 + Math.sin(k * PI / 4) * 16); x.stroke(); } } });
    add('p97_dome', 160, 110, 3.4, (x) => { for (let j = 0; j < 110; j++) { const t = (110 - j) / 110, hw = Math.sqrt(Math.max(0, 1 - t * t)) * 76; for (let i = 80 - hw | 0; i <= 80 + hw; i++) { const rib = (Math.abs(i - 80) % 19) < 2; px(x, wh(238 + (h2(i >> 1, j >> 1) * 6 | 0) - (rib ? 20 : 0) - (i > 80 + hw - 8 ? 22 : 0)), i, j); } } px(x, wh(214), 77, 0, 6, 8); });   // "you could see the shape of the old gold in the ribs of it"
    add('p97_rope', 16, 200, 2.2, (x) => { for (let j = 0; j < 200; j++) { const i = 7 + (((j >> 3) & 1) ? 1 : 0); px(x, g(16 + ((j % 4) < 2 ? 10 : 0)), i, j, 3, 1); } px(x, g(60), 4, 0, 9, 5); });
    add('p97_coil', 40, 24, 0.3, (x) => { for (let k = 0; k < 4; k++) { x.strokeStyle = g(18 + k * 6); x.lineWidth = 3; x.beginPath(); x.ellipse(20, 14 - k * 2, 16 - k * 2, 7 - k, 0, 0, PI * 2); x.stroke(); } });
    add('p97_ring', 24, 24, 0.24, (x) => { x.strokeStyle = g(70); x.lineWidth = 3; x.beginPath(); x.arc(12, 13, 8, 0, PI * 2); x.stroke(); px(x, g(40), 9, 0, 6, 6); });
    add('p97_bedroll', 56, 22, 0.24, (x) => { px(x, g(26), 4, 6, 48, 14); for (let i = 8; i < 50; i += 9) px(x, g(54), i, 6, 2, 14); px(x, g(16), 4, 18, 48, 2); });
    add('p97_cloth', 36, 30, 0.34, (x) => { px(x, g(10), 6, 4, 24, 24); px(x, g(26), 6, 4, 24, 3); px(x, g(22), 28, 8, 5, 18); for (let j = 8; j < 26; j += 4) px(x, g(20), 7, j, 22, 1); });
    add('p97_tally', 28, 96, 0.9, (x) => { for (let r = 0; r < 14; r++) { const n = Math.max(1, 5 - (r > 9 ? r - 9 : 0)); for (let k = 0; k < n; k++) px(x, 'rgba(14,12,14,0.9)', 5 + k * 3, 4 + r * 6, 1, 4); if (n === 5) { x.strokeStyle = 'rgba(14,12,14,0.9)'; x.lineWidth = 1; x.beginPath(); x.moveTo(3, 7 + r * 6); x.lineTo(20, 5 + r * 6); x.stroke(); } } });
    add('p97_trap', 48, 20, 0.2, (x) => { px(x, g(8), 2, 2, 44, 16); px(x, g(40), 2, 2, 44, 2); px(x, g(40), 2, 16, 44, 2); px(x, g(70), 21, 8, 6, 4); });
  }

  // ================================================================ the defs: the gear, the people
  const ARMOR_DEFS = {
    a_p97_wrap: { name: TX.wrap, slot: 'head', ar: 1, noise: -0.1, value: 30, desc: TX.wrapDesc },
    a_p97_gloves: { name: TX.gloves, slot: 'hands', ar: 1, noise: 0, value: 22, desc: TX.glovesDesc },
    a_p97_coat: { name: TX.coat, slot: 'body', ar: 2, noise: -0.1, value: 54, desc: TX.coatDesc },
  };
  const HOOK_DEF = { name: TX.hook, img: 'fp_spear', dmg: [4, 9], reach: 2.3, noise: 0.5, speed: 0.75, type: 'iron', twoHanded: true, value: 48, desc: TX.hookDesc };
  function defs() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p97_hook) WEAPONS.p97_hook = Object.assign({}, HOOK_DEF);
    if (typeof ARMOR !== 'undefined') for (const k in ARMOR_DEFS) if (!ARMOR[k]) ARMOR[k] = Object.assign({}, ARMOR_DEFS[k]);
    if (typeof ITEMS !== 'undefined') {
      for (const k in ARMOR_DEFS) if (!ITEMS[k]) ITEMS[k] = Object.assign({ sprite: 'gear', armor: true }, ARMOR_DEFS[k]);
      if (!ITEMS.w_p97_hook) ITEMS.w_p97_hook = { name: TX.hook, sprite: 'gear', weapon: 'p97_hook', value: 48, desc: TX.hookDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'a_p97_wrap')) {
      ICONS.PIX.a_p97_wrap = (d) => { d.layer('#121014').rrect(6, 3, 12, 17); for (const y of [6, 9.5, 13, 16.5]) d.layer('#2a2830').rect(6, y, 12, 1.2); d.layer('#b8a08c').rect(8.5, 9.6, 7, 2.2); };
      ICONS.PIX.a_p97_gloves = (d) => { const gl = (x) => { d.layer('#141216').rrect(x, 8, 7, 12); d.layer('#141216').rect(x, 4, 1.6, 5).rect(x + 1.8, 3, 1.6, 6).rect(x + 3.6, 3, 1.6, 6).rect(x + 5.4, 4, 1.6, 5); }; gl(3); gl(14); d.layer('#f2eee2').rect(3, 4, 1.6, 2.4); };
      ICONS.PIX.a_p97_coat = (d) => { d.layer('#141216').rrect(6, 3, 12, 18); d.layer('#141216').rect(3, 5, 3, 10).rect(18, 5, 3, 10); d.layer('#5e5a5e').rect(6, 3, 5, 18); d.layer('#2a2830').rect(11.4, 4, 1.2, 16); };
      const hook = (d) => { d.tilt(12, 12); d.layer('#241e1a').rrect(-1, -7, 2, 18); for (const y of [-3, 1, 5, 9]) d.layer('#6a5e50').rect(-1, y, 2, 0.7); d.layer('#70747c', { shiny: 1 }).rect(-1, -11, 2, 4).rect(-5, -11, 4, 1.6).rect(-5, -11, 1.6, 4); d.layer('#0c0c0e').rect(-2, -7, 4, 3); };
      ICONS.PIX['weapon:p97_hook'] = hook; ICONS.PIX.w_p97_hook = hook;
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined') {
      if (!NPCS.p97_tallyman) NPCS.p97_tallyman = { name: TX.tallyName, sprite: 'p97_tallyman', portrait: 'townsman', tier: 'low', greet: SAY.tally.greet, topics: SAY.tally.topics, desc: TX.tallyDesc,
        quest: (g) => { try { if (fint('p97_tally', 1)) return null; return { text: TX.tallyGift, choices: [{ t: TX.tallyTake, f: () => { gift(); return TX.tallyAfter; } }] }; } catch (e) { warnOnce('quest', e); return null; } } };
      if (!NPCS.p97_scav) NPCS.p97_scav = { name: TX.scavName, sprite: 'p97_scav', portrait: 'townswoman', tier: 'low', greet: SAY.scav.greet, topics: SAY.scav.topics };
    }
  }
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return;
    LAMPS = SOULS91.register('k', { maps: [HOUSE, MAP], revive: [], keeper: () => false, kflag: null, note: 528 }, [
      { map: MAP, x: P.lamp[0], y: P.lamp[1], wx: P.lamp[0] + 1.2, wy: P.lamp[1] + 0.9, dir: PI / 2, name: TX.lampName, sprite: 'p92_shadelamp', litSprite: 'p92_shadelamplit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [200, 150, 90] },
    ]) || [];
  }

  // ================================================================ building
  function buildHouse() {
    const m = new GameMap(HOUSE, TX.houseName, HW, HH, { floor: 't_p97_planks', ceil: 't_p97_black', fogDist: 9, ambient: 0.22, fogColor: [0, 0, 0], music: 'inside', danger: 0, spawn: { x: P.hIn[0], y: P.hIn[1], dir: -PI / 2 } });
    m.rect(0, 0, HW - 1, HH - 1, 't_p97_black'); m.clear(1, 1, HW - 2, HH - 2);
    m.set(P.hDoor[0], P.hDoor[1], DOOR({ tex: 't_p97_door', portal: { map: TIERS, x: P.tiersOut[0], y: P.tiersOut[1], dir: PI / 2 }, label: TX.doorBack }));
    m.deco('p95_ladder', P.hLadder[0], P.hLadder[1], { radius: 0.14, scale: 1, solid: false, use: 'p97_up', label: TX.ladderUp });
    m.deco('sign', 4.5, 1.2, { radius: 0.1, scale: 0.01, solid: false, label: TX.window });
    m.deco('sign', 2.4, 5.4, { radius: 0.1, scale: 0.01, solid: false, label: TX.house });
    m.baseCount = m.entities.length;
    return m;
  }
  const wiredAt = (i, a) => { const col = i % 10, row = (i / 10) | 0, across = (col - 4.5) * 0.82, back = (1.5 - row) * 0.95, cs = Math.cos(a.dir), sn = Math.sin(a.dir); return { x: a.x + cs * back - sn * across, y: a.y + sn * back + cs * across }; };
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p97_planks', ceil: null, floorTextures: FLOORS, fogDist: 46, fogColor: [232, 234, 238], ambient: 0.92, music: 'inside', danger: 0, spawn: { x: P.arrive[0], y: P.arrive[1], dir: PI / 2 } });
    m.bright = true;                                           // lit by the Bleach: never darkened as a room is
    const { kind, shade } = plan();
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) V[vy * W1 + vx] = (vx >= TERRACE[0] && vx <= TERRACE[2] + 1 && vy >= TERRACE[1] - 1 && vy <= 32) ? TERRACE_Z : hv(vy);
    m.setSide(0, 0, W - 1, H - 1, 't_p97_wall');
    const floorOf = { 1: PLANKS, 2: STREET, 3: STEP, 8: PAVING, 10: GRAVEL };
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k], lv = inTerrace(i, j) || (t === 9) ? (j <= 32 ? TERRACE_Z : lvlAt(j)) : lvlAt(j);
      L[k] = lv;
      if (floorOf[t] != null) { m.smooth[k] = 1; m.setFloor(i, j, shade[k] && t !== 1 ? SHADOW : floorOf[t]); continue; }
      if (t === 14) { m.smooth[k] = 1; m.setFloor(i, j, BLOCKED); continue; }
      m.smooth[k] = 0;
      if (t === 5) m.block(i, j, 't_p97_black', lv + 3.4);
      else if (t === 6) m.block(i, j, 't_p97_low', lv + 0.52, { capTex: 't_p97_low' });
      else if (t === 9) m.block(i, j, 't_p97_low', lv + 0.5, { capTex: 't_p97_low' });
      else if (t === 11) m.block(i, j, 't_p97_pillar', lv + 2.6);
      else if (t === 12) m.block(i, j, 't_p97_wall', lv + 0.9 + h2(i, 3) * 0.9, { capTex: 't_p97_rubble' });
      else if (t === 7) m.block(i, j, 't_p97_rubble', lv + 1.1 + h2(i, j) * 1.3, { capTex: 't_p97_rubble' });
      else if (t === 13) m.block(i, j, 't_p97_house', lv + 4.6);
      else m.block(i, j, 't_p97_wall', lv + 2.4 + (h2(i >> 2, j >> 2) * 3 | 0) * 0.7 + (j > 105 ? 2.4 : 0));
    }
    m._p97 = { kind, shade };
    const lab = (x, y, t) => m.deco('sign', x, y, { radius: 0.1, scale: 0.01, solid: false, label: t });
    // ---- the walkway and the shelf
    m.deco('p97_trap', P.trap[0], P.trap[1], { radius: 0.14, scale: 1, solid: false, use: 'p97_down', label: TX.trapDown });
    m.deco('p97_bedroll', P.bedroll[0], P.bedroll[1], { radius: 0.1, scale: 1, solid: false, label: TX.bedroll });
    m.deco('p97_bedroll', P.bedroll[0] - 1.3, P.bedroll[1] + 0.2, { radius: 0.1, scale: 1, solid: false, label: TX.bedroll });
    m.deco('p97_cloth', P.cloth[0], P.cloth[1], { radius: 0.1, scale: 1, solid: false, label: TX.cloth });
    lab(15.4, 5.2, TX.shelf); lab(23.6, 8.6, TX.endLadder);
    m.npc('p97_scav', P.scav[0], P.scav[1], { _p97: 'scav', facing: PI / 2 });
    m.deco('p97_ring', P.lineBot[0], P.lineBot[1] + 0.5, { radius: 0.1, scale: 1, solid: false, yOff: -1.5, label: TX.lineBotNone, _p97: 'ring' });
    m.deco('p97_rope', P.lineBot[0], P.lineBot[1] + 0.45, { radius: 0.14, scale: 1, solid: false, hidden: true, use: 'p97_line', label: TX.lineBot, _p97: 'lineBot' });
    // ---- the line, and what is left on it
    lab(24.0, 12.6, TX.line);
    [['p92_offer_bread', TX.offerBread], ['p92_offer_candle', TX.offerCandle], ['p92_offer_drawing', TX.offerDrawing], ['p92_offer_blanket', TX.offerBlanket]].forEach(([sp, t], n) => m.deco(Engine.sprites && Engine.sprites[sp] ? sp : 'sign', P.offerings[n][0], P.offerings[n][1], { radius: 0.12, scale: 1, solid: false, use: 'p97_offer', label: t }));
    // ---- the first tier
    lab(23.5, 15.4, TX.wall); lab(15.5, 18.5, TX.column); lab(14.9, 22.5, TX.basin); lab(9.6, 23.5, TX.doorway);
    // ---- the second tier: the houses, their domes, the carriage, the garden
    lab(17.5, 36.6, TX.sancterre); lab(30.5, 36.6, TX.valmont); lab(24.0, 42.4, TX.carriage); lab(26.9, 46.6, TX.balcony); lab(19.6, 41.5, TX.doorway); lab(28.4, 43.5, TX.doorway);
    m.add({ kind: 'deco', sprite: 'p97_carriage', x: 24.0, y: 43.5, scale: 1, solid: false, radius: 0.05, yOff: 0, label: TX.carriage, _decor: true });
    for (const [x, y] of [[13.5, 43.5], [33.5, 43.5]]) m.add({ kind: 'deco', sprite: 'p97_dome', x, y, scale: 1, solid: false, radius: 0.05, yOff: -4.6, label: TX.dome, _decor: true });
    lab(41.6, 34.6, TX.garden);
    for (const y of [32, 28, 24, 20, 16]) m.add({ kind: 'deco', sprite: 'p97_statue', x: 43.5, y: y + 0.5, scale: 1, solid: false, radius: 0.05, yOff: -0.5, label: TX.statue, _decor: true });
    lab(42.2, 13.6, TX.parapet);
    m.deco('p97_coil', P.lineTop[0], P.lineTop[1], { radius: 0.14, scale: 1, solid: false, use: 'p97_line', label: TX.lineTop, _p97: 'lineTop' });
    // ---- the third tier: the white house, the plinth, the plaza; the Unison
    lab(16.5, 59.6, TX.whitehouse); lab(23.9, 66.5, TX.plinth); lab(36.9, 65.4, TX.plaza);
    m.add({ kind: 'deco', sprite: 'p97_statue', x: 24.0, y: 69.5, scale: 1, solid: false, radius: 0.05, yOff: -0.5, label: TX.plinth, _decor: true });
    for (let i = 0; i < 40; i++) { const q = wiredAt(i, { x: 9, y: 65.0, dir: 0 }), man = (i % 7) === 3; m.add({ kind: 'deco', sprite: man ? 'p97_wiredm' : 'p97_wired', x: q.x, y: q.y, scale: 1, solid: false, radius: 0.3, label: TX.wired, _p97: 'wired', _i: i, _man: man }); }
    // ---- the fourth tier: the Glassmarket, its people, the tallied pillar, the way on shut
    lab(24.0, 82.6, TX.arcade); lab(24.5, 105.4, TX.dome); lab(24.9, 96.5, TX.fountain); lab(P.rubble[0] - 1.4, P.rubble[1] + 0.5, TX.rubble);
    for (const [x, y] of P.stalls) m.add({ kind: 'deco', sprite: 'p97_stall', x: x + 1, y: y + 0.5, scale: 1, solid: false, radius: 0.05, yOff: 0, label: TX.stall, _decor: true });
    for (const [sp, x, y, key] of P.bleached) m.deco(sp, x, y, { radius: 0.36, scale: 1, solid: true, use: 'p97_bleached', label: TX[key], _p97: 'bleached', _key: key });
    m.deco('p97_tally', P.tallyPillar[0], P.tallyPillar[1], { radius: 0.12, scale: 1, solid: false, yOff: -0.3, label: TX.tallyMarks });
    m.add({ kind: 'deco', sprite: 'p97_dome', x: 24.5, y: 108.5, scale: 1.6, solid: false, radius: 0.05, yOff: -6.2, label: TX.dome, _decor: true });
    if (Engine.sprites && Engine.sprites.p95_spire) m.add({ kind: 'deco', sprite: 'p95_spire', x: 9.5, y: 110.5, scale: 1, solid: false, radius: 0.05, yOff: -3, glow: 1, label: TX.spire, _decor: true });
    m.npc('p97_tallyman', P.tally[0], P.tally[1], { _p97: 'tally', facing: -PI / 2 });
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) m.add(SOULS91.lampEnt(L0));
    m.baseCount = m.entities.length;
    return m;
  }
  function join(maps) {
    if (!maps || maps[MAP] || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[HOUSE] = buildHouse();
    maps[MAP] = build();
    const tm = maps[TIERS];
    if (tm) { const [i, j] = P.tiersDoor, c = tm.cells[j * tm.w + i], below = tm.cells[(j + 1) * tm.w + i];
      if (c && !c.door && !below) tm.set(i, j, DOOR({ tex: 't_p97_door', portal: { map: HOUSE, x: P.hIn[0], y: P.hIn[1], dir: -PI / 2 }, label: TX.doorTiers })); else warnOnce('tiers door', new Error('cell not free')); }
    // its own colour grade: "It did not show colour; there was no colour in it to show" (Book Two). The default indoor grade is candle-warm.
    try { if (typeof POST !== 'undefined' && POST.config && POST.config.grade && POST.config.gradePresets) { const gp = { gain: [1.0, 1.0, 1.01], lift: [8, 8, 9], sat: 0.55, con: 0.04 }; if (!POST.config.gradePresets.p97_bleach) POST.config.gradePresets.p97_bleach = { day: gp, night: gp }; if (!POST.config.grade[MAP]) POST.config.grade[MAP] = 'p97_bleach'; if (!POST.config.grade[HOUSE]) POST.config.grade[HOUSE] = 'crypt'; } } catch (e) { warnOnce('grade', e); }
    return true;
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const once = (bit, t, cls, ms) => { const s = fint('p97_seen', 0x3fffffff); if (s & (1 << bit)) return false; f().p97_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const onMile = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const special = (n) => { try { return typeof GEAR87 === 'object' && GEAR87.special && GEAR87.special(n); } catch (e) { return false; } };
  // by day two lights; by night the sourceless white; thinnest in the dead hour (Vol VII: the hour before dawn)
  const B = { DAY: 6.0, NIGHT: 1.6, DEAD: 0.8, TIER: 0.15, WRAP: 0.8, GLOVES: 0.8, HEAR: 15, HEAR_NOISE: 4.5, QUIET: 3.0, LEAN_S: 2.5, LISTEN_S: 6, COME: 1.2, WALK: 0.9, STAND_S: 25, STRIKE_R: 3.0, STRIKE_HP: 14, HOLD_S: 5, PRESS_R: 3.2, PRESS: 2.0, XP: 200 };
  const DAWN = 0.25, HOUR = 1 / 24;
  const tod01 = () => ((Number(G.tod) % 1) + 1) % 1;
  const hour = () => { const t = tod01(); return (t >= DAWN - HOUR && t < DAWN) ? 'dead' : (t < DAWN || t >= 0.8) ? 'night' : 'day'; };
  const isNight = () => hour() !== 'day';
  function rateAt(y) {
    const h = hour(), a = (G.player && G.player.armor) || {};
    let r = (h === 'dead' ? B.DEAD : h === 'night' ? B.NIGHT : B.DAY) * (1 + B.TIER * tierOf(y));
    if (a.head === 'a_p97_wrap') r *= B.WRAP; if (a.hands === 'a_p97_gloves') r *= B.GLOVES; if (special('shade')) r *= 0.5;
    return r;
  }
  const shadeAt = (x, y) => { const d = G.map && G.map._p97, k = at(x | 0, y | 0); return !!(d && k >= 0 && d.shade[k]); };
  // ---- the Unison's walk: stand at the west end, come down the street to the plaza, stand, go back (the place's own clock)
  const WEST = 9, EAST = 33, ROW = 65.0, WALK_S = (EAST - WEST) / B.WALK, CYCLE = 2 * (B.STAND_S + WALK_S);
  function walkAt(t) {
    const u = ((t % CYCLE) + CYCLE) % CYCLE;
    if (u < B.STAND_S) return { x: WEST, y: ROW, dir: 0, moving: false };
    if (u < B.STAND_S + WALK_S) return { x: WEST + (u - B.STAND_S) * B.WALK, y: ROW, dir: 0, moving: true };
    if (u < 2 * B.STAND_S + WALK_S) return { x: EAST, y: ROW, dir: 0, moving: false };
    return { x: EAST - (u - 2 * B.STAND_S - WALK_S) * B.WALK, y: ROW, dir: PI, moving: true };
  }
  const U = { clock: 0, state: 'walk', t: 0, x: WEST, y: ROW, dir: 0, heardX: 0, heardY: 0, quietT: 0 };   // state: walk | lean | come | listen | hold | back
  let burnAcc = 0, lastShade = true, lastHour = '', prev = null, noteLevel = 0, pressAcc = 0, passT = 0;
  const distToUnison = (x, y) => { const cs = Math.cos(U.dir), sn = Math.sin(U.dir), dx = x - U.x, dy = y - U.y, along = dx * cs + dy * sn, across = -dx * sn + dy * cs; return Math.hypot(Math.max(0, Math.abs(along) - 1.5 * 0.95), Math.max(0, Math.abs(across) - 4.5 * 0.82)); };
  function strike(p, c) {
    f().p97_struck = Math.min(99, fint('p97_struck', 99) + 1);
    say(TX.strike, 'bad', 9000);
    p.hp = Math.max(1, p.hp - B.STRIKE_HP); if (Number.isFinite(p.voice)) p.voice = 0; G.hurtT = 0.4;
    try { if (typeof UPG !== 'undefined' && UPG.status) UPG.status.deaf = Math.max(Number(UPG.status.deaf) || 0, 20); } catch (e) { /* no status */ }
    try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.bell) Audio_.sfx.bell(); } catch (e) { /* audio is optional */ }
    try { fx('p97-strike', 500); } catch (e) { /* no overlay */ }
    // thrown back from them, onto open stone
    const dx = c.x - U.x, dy = c.y - U.y, d = Math.hypot(dx, dy) || 1;
    for (const r of [2.2, 1.4, 0.7]) { const nx = c.x + dx / d * r, ny = c.y + dy / d * r, k = at(nx | 0, ny | 0); if (k >= 0 && G.map.smooth[k] && !G.map.cells[k]) { put(nx, ny); break; } }
    U.state = 'hold'; U.t = B.HOLD_S; once(9, TX.notYou, '', 9000);
  }
  function tickUnison(dt, p, c) {
    const noise = Number(G.noise) || 0, hearR = B.HEAR * (special('unheard') ? 0.67 : 1), d = distToUnison(c.x, c.y), loud = noise >= B.HEAR_NOISE && d < hearR && tierOf(c.y) >= 2;
    if (U.state === 'walk') {
      U.clock += dt; const q = walkAt(U.clock); U.x = q.x; U.y = q.y; if (q.moving || q.x === WEST) U.dir = q.dir;
      if (loud) { U.state = 'lean'; U.t = B.LEAN_S; U.heardX = c.x; U.heardY = c.y; once(6, TX.lean, 'bad', 9000) || say(TX.lean, 'bad', 5000); }
    } else if (U.state === 'lean') {
      U.t -= dt; if (loud) { U.heardX = c.x; U.heardY = c.y; }
      if (U.t <= 0) { if (noise >= B.QUIET && d < hearR) { U.state = 'come'; U.quietT = 0; say(TX.come, 'bad', 6000); } else { U.state = 'walk'; } }
    } else if (U.state === 'come') {
      if (noise >= B.QUIET && d < hearR * 1.3) { U.heardX = c.x; U.heardY = c.y; U.quietT = 0; } else U.quietT += dt;
      const dx = U.heardX - U.x, dy = U.heardY - U.y, dd = Math.hypot(dx, dy);
      if (dd > 0.6) { U.dir = Math.atan2(dy, dx); U.x += dx / dd * B.COME * dt; U.y += dy / dd * B.COME * dt; U.y = Math.max(58, Math.min(76, U.y)); U.x = Math.max(5, Math.min(42, U.x)); }
      if (d < B.STRIKE_R && noise >= B.QUIET) { strike(p, c); return; }
      if (U.quietT >= B.LISTEN_S || (dd <= 0.6 && U.quietT > 1)) { U.state = 'listen'; U.t = B.LISTEN_S; }
    } else if (U.state === 'listen') {
      U.t -= dt; if (noise >= B.HEAR_NOISE && d < hearR) { U.state = 'come'; U.quietT = 0; U.heardX = c.x; U.heardY = c.y; }
      else if (U.t <= 0) { U.state = 'back'; say(TX.lostYou, 'good', 8000); }
    } else if (U.state === 'hold') { U.t -= dt; if (U.t <= 0) U.state = 'back'; }
    else if (U.state === 'back') {
      const q = walkAt(U.clock), dx = q.x - U.x, dy = q.y - U.y, dd = Math.hypot(dx, dy);
      if (dd < 0.2) { U.state = 'walk'; U.dir = q.dir; } else { U.dir = Math.atan2(dy, dx); U.x += dx / dd * B.COME * dt; U.y += dy / dd * B.COME * dt; }
      if (loud) { U.state = 'lean'; U.t = B.LEAN_S; U.heardX = c.x; U.heardY = c.y; say(TX.lean, 'bad', 5000); }
    }
    // the forty, in their ranks; the breaths go round them, never two at once
    const turned = U.state === 'lean' || U.state === 'listen';
    for (const e of G.ents) { if (!e || e._p97 !== 'wired') continue; const q = wiredAt(e._i | 0, U); e.x = q.x; e.y = q.y; const br = ((U.clock * 0.9 + (e._i | 0) * 0.37) % 1) < 0.09; e.sprite = (e._man ? 'p97_wiredm' : 'p97_wired') + (turned ? '_t' : br ? '_b' : ''); }
    // this near, the note is a pressure
    if (d < B.PRESS_R) { once(7, TX.press, 'warn', 8000); if (Number.isFinite(p.voice) && p.voice > 0) { pressAcc += dt * B.PRESS; if (pressAcc >= 1) { const n = Math.floor(pressAcc); pressAcc -= n; p.voice = Math.max(0, p.voice - n); } } if (d < 0.6 && U.state === 'walk') { passT += dt; if (passT > 0.8) once(8, TX.past, '', 8000); } } else { pressAcc = 0; passT = 0; }
    if (d < 20 && tierOf(c.y) === 3) once(5, TX.unison, 'warn', 12000);
  }
  // the card: the hour, and whether you are in shade; with the cloth-pole in hand, what the cloth says
  let cardEl = null, cardKey = '';
  const holdingPole = () => { try { const p = G.player; return p.weapons[p.weapon] === 'p92_pole'; } catch (e) { return false; } };
  function drawCard() {
    if (typeof document === 'undefined') return;
    const game = document.getElementById('game'); if (!game) return;
    if (!onMile() || G.state !== 'play') { if (cardEl) { cardEl.remove(); cardEl = null; cardKey = ''; } return; }
    const h = hour(), pole = holdingPole(), key = h + (lastShade ? 's' : 'l') + (pole ? 'p' : ''); if (cardEl && key === cardKey) return; cardKey = key;
    if (!document.getElementById('p97-style')) { const st = document.createElement('style'); st.id = 'p97-style';
      st.textContent = '#p97-card{position:absolute;left:50%;top:1.4cqh;transform:translateX(-50%);background:rgba(14,13,16,.86);border:1px solid #6a5a3c;color:#cfc6b2;font:1.25cqw/1.3 "Alegreya SC",serif;padding:.4cqw .9cqw;z-index:6;pointer-events:none;display:flex;gap:.7cqw;align-items:center}#p97-card .h{color:#e2c88c}#p97-card .s{border:1px solid #3a342c;padding:0 .5cqw}#p97-card .s.l{background:#f2eee2;color:#141216;border-color:#f2eee2}#fx.p97-white{background:rgba(255,253,244,.2)}#fx.p97-strike{background:rgba(255,255,255,.7)}';
      document.head.appendChild(st); }
    if (!cardEl) { cardEl = document.createElement('div'); cardEl.id = 'p97-card'; cardEl.setAttribute('role', 'status'); cardEl.setAttribute('aria-live', 'off'); game.appendChild(cardEl); }
    const mk = (cls, t) => { const e = document.createElement('span'); if (cls) e.className = cls; e.textContent = t; return e; };
    const parts = [mk('', TX.cardName), mk('h', h === 'dead' ? TX.cardDead : h === 'night' ? TX.cardNight : TX.cardDay), mk('s' + (lastShade ? '' : ' l'), lastShade ? TX.cardShade : TX.cardLight)];
    if (pole) parts.push(mk('h', h === 'dead' ? TX.poleDead : h === 'night' ? TX.poleNight : TX.poleDay));
    cardEl.replaceChildren(...parts);
  }
  function put(x, y, dir) {
    const c = Engine.cam; c.x = x; c.y = y; if (dir != null) c.dir = dir; prev = null; burnAcc = 0;
    if (G.player) { G.player.x = x; G.player.y = y; if (dir != null) G.player.dir = dir; G.player.feet = G.map.groundAt(c.x, c.y); G.player.fallFrom = null; G.player.fallV = 0; }
    if (G.vel) G.vel.x = G.vel.y = 0;
  }
  function gift() {
    if (fint('p97_tally', 1)) return;
    f().p97_tally = 1;
    const t = G.ents.find((e) => e && e._p97 === 'tally'), bx = t ? t.x : P.tally[0], by = t ? t.y - 0.9 : P.tally[1] - 0.9;
    ['a_p97_wrap', 'a_p97_gloves', 'a_p97_coat', 'w_p97_hook'].forEach((id, n) => { const it = ITEMS[id]; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: bx - 0.9 + n * 0.6, y: by, scale: 0.35, yOff: 0, solid: false })); });
    try { if (typeof questXp === 'function') questXp(B.XP); } catch (e) { warnOnce('xp', e); }
    try { journal('side', TX.jGift); } catch (e) { warnOnce('journal', e); }
    sync();
  }
  function sync() {
    try { if (typeof LOGMAP !== 'undefined' && Array.isArray(LOGMAP.QUEST_GIVERS)) { const a = LOGMAP.QUEST_GIVERS, i = a.indexOf('p97_tallyman'), want = typeof G !== 'undefined' && G.flags && !fint('p97_tally', 1); if (want && i < 0) a.push('p97_tallyman'); else if (!want && i >= 0) a.splice(i, 1); } } catch (e) { /* the marker is a courtesy */ }
    if (!onMile()) return;
    const down = fint('p97_line', 1) === 1, night = isNight();
    for (const e of G.ents) { if (!e || !e._p97) continue;
      if (e._p97 === 'lineBot') e.hidden = !down; else if (e._p97 === 'ring') e.hidden = down;
      else if (e._p97 === 'lineTop') e.label = down ? TX.lineTopDown : TX.lineTop;
      else if (e._p97 === 'tally' || e._p97 === 'scav') e.hidden = !night; }
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p97_/.test(e.use)) return false;
    if (e.use === 'p97_up') { loadMap(MAP, { x: P.arrive[0], y: P.arrive[1], dir: PI / 2 }); return true; }
    if (!onMile()) return false;
    if (e.use === 'p97_down') { loadMap(HOUSE, { x: P.hLadder[0], y: P.hLadder[1] + 1.2, dir: PI / 2 }); return true; }
    if (e.use === 'p97_offer') { say(TX.offerNo, '', 4000); return true; }
    if (e.use === 'p97_bleached') { say(e._key === 'blStall' ? TX.blStallUse : TX.dontTouch, 'warn', 7000); return true; }
    if (e.use === 'p97_line') {
      if (fint('p97_line', 1) !== 1) { if (e._p97 !== 'lineTop') return true; f().p97_line = 1; say(TX.lineLet, 'good', 10000); try { Audio_.sfx.door(); } catch (er) { /* */ } sync(); return true; }
      if (e._p97 === 'lineTop') { put(P.lineBotStand[0], P.lineBotStand[1], -PI / 2); say(TX.lineDown, '', 5000); } else { put(P.lineTopStand[0], P.lineTopStand[1], PI / 2); say(TX.lineUp, '', 5000); }
      return true;
    }
    return false;
  }
  function tick(dt) {
    // the Unison's note: under everything, and the wall of it when they are near
    try { if (typeof Audio_ !== 'undefined' && Audio_.hum) { let want = 0; if (onMile() && G.state === 'play') { const c = Engine.cam, d = distToUnison(c.x, c.y); want = 0.03 + 0.34 * Math.max(0, 1 - d / 26); } if (want > 0 || noteLevel > 0) { Audio_.hum(want, 528, 'p97_note'); noteLevel = want; } } } catch (e) { warnOnce('note', e); }
    if (typeof G === 'undefined' || G.state !== 'play' || !G.player || G.dead || !onMile()) { prev = null; return; }
    const p = G.player, c = Engine.cam, m = G.map, h = hour();
    once(0, TX.arrive, '', 12000);
    if (h !== lastHour) { if (lastHour) say(h === 'day' ? TX.sunUp : h === 'dead' ? TX.dead : TX.night, h === 'day' ? 'bad' : '', 7000); lastHour = h; m.fogColor = h === 'day' ? [250, 247, 236] : h === 'dead' ? [206, 212, 224] : [226, 229, 236]; m.ambient = h === 'day' ? 1 : h === 'dead' ? 0.8 : 0.9; sync(); }
    const t = tierOf(c.y), terr = inTerrace(c.x | 0, c.y | 0);
    if (t === 1) once(1, TX.tier1, '', 10000); else if (t === 2 && !terr) once(2, TX.tier2, '', 10000); else if (t === 3) once(3, TX.tier3, 'warn', 10000); else if (t === 4) { once(4, TX.tier4, '', 12000); if (c.y > 86) once(10, TX.people, 'warn', 12000); }
    if (terr) once(11, TX.garden, '', 10000);
    tickUnison(dt, p, c);
    // the Bleach: outside every shadow it takes you, by the hour and the tier
    const sh = shadeAt(c.x, c.y);
    if (sh) { if (!lastShade) once(12, TX.shadeIn, 'good', 4000); burnAcc = 0; }
    else {
      once(13, TX.first, 'bad', 9000);
      burnAcc += dt * rateAt(c.y);
      if (burnAcc >= 1) { const n = Math.floor(burnAcc); burnAcc -= n; p.hp -= n; G.hurtT = 0.1; if (p.hp <= 0) { prev = null; die(TX.lost); return; } }
      try { fx('p97-white', 220); } catch (e) { /* no overlay */ }
    }
    lastShade = sh;
    prev = { x: c.x, y: c.y };
  }
  function struckAt() { if (!onMile()) return; const c = Engine.cam; if (distToUnison(c.x, c.y) < 3.2) say(TX.noHarm, '', 5000); }
  function sung() { if (!onMile()) return; const c = Engine.cam; if (distToUnison(c.x, c.y) < B.HEAR) say(TX.noSong, '', 5000); }

  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { prev = null; burnAcc = 0; lastShade = true; lastHour = ''; pressAcc = 0; passT = 0; if (U.state !== 'walk') { U.state = 'walk'; } sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { drawCard(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (typeof castSong === 'function') { const _cs = castSong; castSong = function () { const r = _cs.apply(this, arguments); try { sung(); } catch (e) { warnOnce('song', e); } return r; }; }
    if (typeof attack === 'function') { const _a = attack; attack = function () { const r = _a.apply(this, arguments); try { struckAt(); } catch (e) { warnOnce('attack', e); } return r; }; }
  }
  wire();

  return { TX, SAY, TEXTS, MAP, HOUSE, TIERS, W, H, P, B, COUNT, ARMOR_DEFS, HOOK_DEF, hv, lvlAt, tierOf, plan, build, buildHouse, join, tick, useOwn, sync, gift, drawCard,
    hour, isNight, rateAt, shadeAt, walkAt, wiredAt, distToUnison, unison: () => U, lamps: () => LAMPS, CYCLE, WEST, EAST, ROW };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = WHITEMILE97;
if (typeof window !== 'undefined') window.WHITEMILE97 = WHITEMILE97;
