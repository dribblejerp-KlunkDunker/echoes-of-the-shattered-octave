// ============================================================
//  thread70 — Echo I, "The Thread Where She Answered", played as an extra (Book One, Echo I; ROADMAP R9 #24; Phase 70).
//
//  Reached only from the Extras menu (js/extras17.js): EXTRAS17.register({ id: 'echoone', tag, start }) below. It runs in
//  the extra's own session (its own G), so the Book One save is never touched and no Book One flag is ever written; this
//  module writes only G.flags under t70 in that session, and every wrapper is inert unless this extra is running. Its
//  card and banner say "Echo I of Book One" (the additive tag option in extras17, from bell69).
//
//  THE FRAME (the book's): Echo I is told by Ilias Marren, the Tide-Weaver, to "you": "I am going to show you a thread
//  that was not taken." So the whole extra is an Echo, and it is grey, the way the game shows its Echoes: the world is
//  drawn grey for as long as the extra runs (a frame post-hook, so it ends with the extra; RITE43.grey, a filter on the
//  canvas, would outlive a "Leave the extra" from the menu), and the Weaver's words are the cards. Every line in the
//  scene is the book's; the buttons, hints and labels are [PROPOSED].
//
//  WHERE [PROPOSED: the plan; the book names the places, not their distances]: two small maps built from this module only
//  while the extra runs:
//    t70_house  Lyra Ashgrove's house: the kitchen table, the hearth, her bed; the door onto Cooper's Row.
//    t70_row    Cooper's Row, from her door down to the old cooperage, and behind it the foot of the Hedge: the flat stone
//               where she sits with her back to the thorn, and "the cooperage drain, where the water goes under".
//
//  THE PLAYER IS LYRA ASHGROVE IN THAT THREAD [PROPOSED: the player's part; the book is silent on it]. Nothing she does
//  changes what happens.
//    1  THE WEAVER. The epigraph; "You will want to know who is talking."; "I am going to show you a thread that was not
//       taken."; the forty-first night and the forty-second; "That is the whole of the difference. One night." "Here is
//       the thread where she went."
//    2  OUT. "She goes out at the dead hour, because she always does": down Cooper's Row to the stone behind the cooperage.
//    3  THE STONE. She sits with her back to the thorn: "there's my lark", "hello, Da", it asks about her day. Then it asks
//       her something it has not asked before: "Come through". And she says no. She says no eleven times over the next
//       three hours: you answer it (E) each time it asks again [PROPOSED: the book gives only its first asking; it asks
//       again in its own first words, "Come through."]. On the twelfth time: "All right, lark. Then I'll come through to
//       you." The thorn moves. "Don't. I'm coming." (the only choice).
//    4  THE DRAIN. "I have watched that moment four hundred and eleven times." Then the drain, on her hands and knees:
//       eleven seconds, the view sinking and going dark. "I am not going to describe what is waiting." Four minutes, black.
//       What comes back walks up Cooper's Row in Lyra Ashgrove's boots.
//    5  HER BOOTS. You walk it home [PROPOSED: the player keeps the body], let it into her house, and lie down in her bed.
//       "And it is very good." It cannot sing the Root note into a clay jar.
//    6  THE FORTY-SECOND NIGHT. "Here is the rest of it, quickly." Kaelen Vance at her door with a bore plan under his arm;
//       the thing wearing her face lets him in; he sits at her table and tells it everything; at the door he hums his note
//       and it does not recognize it. He goes away believing he has a plan and an ally.
//       [PROPOSED: the book has her go out at the dead hour of the forty-second night and Kaelen come to her door on it,
//       and does not say which came first in the hours; the game plays the Weaver's telling in his order and puts no
//       clock on that night.]
//    7  THE REST, the Weaver's cards: Hearthday and the Hold; the Root relieved, and it lets go; the Greening in that
//       thread; Kaelen, Vane, Sable; the thing goes on walking around inside the Greening. "Four hundred and eleven
//       times." The whole margin. "One more thing" ... "— the Tide-Weaver". Then EXTRAS17.finish.
//  ANOTHER THREAD (an Echo inside the Echo, RITE43.echo): in this thread she stays on the stone for the three hours, and
//  then she goes through the drain. Getting up from the stone while it asks, or going back up the row before the drain,
//  is a thread the Weaver is not showing: shown grey ("Another thread"), and you are back where she is. Nothing can fail.
//  The book's own counts are kept as the book has them, though they do not add up (206 + 195 is not 411).
//
//  STATE: G.flags.t70 (stage 1-8), t70_beat (the step reached in a stage's timeline), t70_no (her noes, 0-11),
//  t70_echoes: small validated integers (FLAGS). Kaelen is staged transient (an _t70 key), restaged from the flags on
//  every load. Text: TX, collected in TEXTS for the French (tools/i18n/p70-thread.tsv); PROPOSED lists the keys that are
//  not the book's words.
// ============================================================
'use strict';

const THREAD70 = (function () {
  const ID = 'echoone';
  const HOUSE = 't70_house', ROW = 't70_row', MAPS = [HOUSE, ROW];
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('thread70: ' + k + ' failed', e); } };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const extraId = () => { try { return typeof EXTRAS17 !== 'undefined' && EXTRAS17.inExtra ? EXTRAS17.inExtra() : null; } catch (e) { return null; } };
  const active = () => extraId() === ID;
  const here = () => active() && hasG() && G.map && MAPS.includes(G.mapId);

  // ================================================================ the words (the book's, except the PROPOSED keys)
  const TX = {
    title: S('The Thread Where She Answered'),
    tag: S('Echo I of Book One'),
    blurb: S('The Tide-Weaver shows you a thread that was not taken: the forty-second night, when Lyra Ashgrove went out to the stone behind the cooperage after all. Echo I of Book One, in its own words, and grey, as an Echo is.'),
    houseName: S('Lyra Ashgrove\'s house'),
    rowName: S('Cooper\'s Row'),
    journal: S('Echo I: the thread where she answered. The Tide-Weaver is showing it to me.'),
    // 1 · the Weaver
    openTitle: S('Echo I · The Thread Where She Answered'),
    epigraph: S('<i>A loom has no opinion about the cloth. That is the first thing they teach you at the Sandglass, and it is a lie told to children, and they know it is a lie, and they teach it anyway, because the alternative is to tell a nineteen-year-old that he is going to spend his life watching.</i><br>— Ilias Marren, exile of the Loom-Wardens'),
    who: S('You will want to know who is talking.'),
    marren: S('My name is Ilias Marren and I was a Warden of the Loom at the Sandglass Bazaar until they put me out of it, and I am not in this story yet. I will come into it in the second book, in a glass city that is living the same twenty-four seconds over and over, and you will like me, I think, for a while.'),
    listen: S('Listen.'),
    threadTitle: S('A thread that was not taken'),
    thread: S('I am going to show you a thread that was not taken.'),
    unhappenTitle: S('This did not happen'),
    understand: S('Understand what that means before you go any further.'),
    unhappen: S('This did not happen. It also did not <i>un</i>happen; nothing does.'),
    roads: S('Every road not taken is still standing out there in the dark with the lamps lit and people walking up and down it, and the only difference between that road and this one is that you are on this one, and the thing that decides which road you are on is almost always small, and almost always a Hearthday.'),
    oneNightTitle: S('One night'),
    thread41: S('In the thread you have just read, Lyra Ashgrove went out to the cooperage wall on the forty-first night, and sat on her stone, and told a monster about a child\'s hands.'),
    night42: S('On the forty-second night — the night Kaelen Vance came to her door and hummed his note in her kitchen and she recognized it — she did not go.'),
    oneNight: S('That is the whole of the difference. One night.'),
    went: S('Here is the thread where she went.'),
    goOut: S('Go out.'),
    outHint: S('Down Cooper\'s Row to the old cooperage, and the flat stone behind it at the foot of the Hedge.'),
    // 2-3 · the stone
    deadHour: S('She goes out at the dead hour, because she always does,'),
    sits: S('and she sits down with her back to the thorn,'),
    lark: S('and it says <i>there\'s my lark</i>,'),
    hello: S('and she says <i>hello, Da</i>,'),
    day: S('and it asks about her day.'),
    furtherTitle: S('One night further along'),
    further: S('And on this night — because the difference between the threads is one night, and this thread is one night further along than the one you know — it asks her something it has not asked before.'),
    come: S('<i>Come through,</i> it says. <i>Lark. There\'s a gap down by the cooperage drain, where the water goes under. It\'s not even a squeeze. Come through and sit with me a bit. It\'s cold out here and I\'ve been on my own two years.</i>'),
    saysNo: S('And she says no.'),
    no: S('No.'),
    again: S('<i>Come through.</i>'),
    noHint: S('It asks again. Answer it (E), and stay on the stone with your back to the thorn.'),
    hudNo: S('NO'),
    elevenTitle: S('Eleven times'),
    eleven: S('She says no eleven times over the next three hours, which I want you to know, because it matters later and nobody in that thread ever finds out. She is not weak and she is not a fool; she is a thirty-three-year-old woman who has been doing triage for two years with nothing in the account, and the thing on the other side of the thorn has her father\'s voice and has been practising for seven hundred and thirty nights.'),
    twelfthTitle: S('The twelfth time'),
    twelfth: S('On the twelfth time, it says: <i>All right, lark. Then I\'ll come through to you.</i>'),
    thornMoves: S('And she hears the thorn move.'),
    frightened: S('And she is so frightened — not of dying; of <i>that</i>, of the shape of it coming through the hedge into Oakhaven where the Carders are, where Bettany is, where ninety-one children are asleep — that she stands up and says the only thing she can think of that will keep it out there.'),
    coming: S('<i>Don\'t. I\'m coming.</i>'),
    // 4 · the drain
    watchedTitle: S('Four hundred and eleven times'),
    watched: S('I have watched that moment four hundred and eleven times.'),
    precise: S('I want to be precise with you, because precision is the only decency available to me: in two hundred and six of those threads she stays on her side of the thorn. In a hundred and ninety-five she does not. The variable is not courage. It is whether she slept the night before, and whether the Carder boy\'s roots came back that afternoon, and whether old Tam was humming at the Weavers\' Cross as she passed, which is a thing that depends on the state of his knees, which depends on the weather in a week that is now three years gone.'),
    soup: S('That is what a thread is. You are a soup, and a thing in the dark is patient, and some nights you have had enough sleep.'),
    go: S('Go on.'),
    drainHint: S('The cooperage drain, where the water goes under the Hedge, along the thorn from the stone.'),
    crawl: S('She goes through the drain on her hands and knees.'),
    elevenSecsTitle: S('Eleven seconds'),
    elevenSecs: S('It takes eleven seconds. I am not going to describe what is waiting, because you have met it now, and because there is a difference between dread and cruelty and I am trying to stay on the right side of it.'),
    matters: S('I will tell you the part that matters.'),
    hudFour: S('FOUR MINUTES'),
    backTitle: S('What comes back'),
    back: S('It does not kill her. It does not, in any sense you would recognize, <i>hurt</i> her. It takes four minutes, and what comes back through the drain into Oakhaven at the end of those four minutes walks up Cooper\'s Row in Lyra Ashgrove\'s boots and lets itself into Lyra Ashgrove\'s house and lies down in her bed, and in the morning it gets up and goes to look at Pim Carder\'s hands.'),
    walkUp: S('Walk up Cooper\'s Row.'),
    // 5 · her boots
    boots: S('walks up Cooper\'s Row in Lyra Ashgrove\'s boots'),
    letsIn: S('and lets itself into Lyra Ashgrove\'s house'),
    liesDown: S('and lies down in her bed,'),
    bootsHint: S('Her house is at the top of the row, and her bed is inside it.'),
    goodTitle: S('And it is very good'),
    good: S('And it is very good.'),
    nobody: S('That is the thing nobody in that thread ever works out, and I have watched them not work it out four hundred and eleven times. It has her whole voice. It has two years of her nights — every patient, every fear, every small stupid thing she told it on a stone behind a cooperage. It knows the falling fifth. It knows that Nell Carder takes two sugars and that Bettany\'s hip hurts in the wet and that the Tanner cousins are not speaking. It is kind, because kindness is a sound and it has heard a great deal of it.'),
    jar: S('It cannot sing the Root note into a clay jar and make a baby breathe. But in a town where the Cantor has been running on empty for two years, nobody notices for nine days that the mending has stopped working, and by then it does not matter.'),
    // 6 · the forty-second night
    quicklyTitle: S('The forty-second night'),
    quickly: S('Here is the rest of it, quickly, because you have a book to finish.'),
    door: S('Kaelen Vance comes to her door on the forty-second night with a bore plan under his arm and a Stage Nine to tell her about, and the thing wearing her face lets him in,'),
    letIn: S('Let him in.'),
    table: S('and he sits at her table and tells it everything — the Sequence, the coil, the phase port, the eight bolts, the forty seconds — and it listens with her eyes, and asks the questions she would have asked,'),
    seeHim: S('See him to the door.'),
    hum: S('and at the door he hums his note and it does not recognize it, because there is nothing in there that was ever eight years old on a stile.'),
    ally: S('He goes away believing he has a plan and an ally.'),
    // 7 · the rest
    hearthTitle: S('Hearthday'),
    hearth: S('On Hearthday they take her down four hundred feet in a white shift and put a brass collar round her throat, and Kaelen Vance kneels in front of her and threads a wire through a fold of skin instead of the fold of her voice, and his hands do not shake at all, because the woman on the stool is perfectly calm and that steadies him.'),
    holdBegins: S('Then the Hold begins, and the thing in the stone draws in and listens.'),
    holdTitle: S('It holds the note'),
    stool: S('And the thing on the stool, which eats voices and has never in its existence had the slightest reason to care what a dying god does with its law, holds the note.'),
    beautifully: S('It holds it beautifully. It holds it for four hours and nineteen minutes with blood on its collar, and nobody shouts <i>sing it down</i>, because the engineer at the collar walk is waiting for a signal from an ally who is not there, and when he finally understands — at four hours and eleven minutes, by her face, by something behind her eyes that is not fear — he goes for the drum anyway, and gets five bolts out of eight before Factor Vosk\'s Legionnaires put him on the boards.'),
    letGoTitle: S('It lets go'),
    relieved: S('The Root is relieved.'),
    lullaby: S('It has been singing a five-note lullaby for ten thousand years and a voice outside it holds its note steady for four hours and nineteen minutes, and it believes — the way the Light believed — that the thing it was promised has come.'),
    letsGo: S('It lets go.'),
    greenTitle: S('The Greening in that thread'),
    green: S('The Greening in that thread is not four miles across. It is the whole Resonant Reach, from the Flume to the Greenroot road to the edge of the Shifting Dunes, in eleven days: the second Fracture, Growth following Light, and the Arbiterium\'s grey folder vindicated at a scale that makes a Supreme Arbiter weep with relief in a locked room at the Organum, which I have also watched, and which I would not have believed if I had only heard about it.'),
    restTitle: S('And the thing wearing Lyra Ashgrove'),
    kdies: S('Kaelen Vance dies under the purge, in the vault, with his father\'s voice coming out of the speaking-tube counting down from sixty.'),
    vane: S('Vane cuts the mast-line at the quarry and runs, because there is nobody at the North Gate worth going back for, and lives another nine years, and drinks, and dies on the Rust Coast of something ordinary.'),
    sable: S('Sable reads twenty names a night in a drowned plaza until the Office finds her in the spring.'),
    eat: S('And the thing wearing Lyra Ashgrove goes on walking around inside the Greening, singing, for a very long time, because there is a great deal to eat.'),
    // 8 · the margin
    times: S('Four hundred and eleven times.'),
    reason: S('I have a reason for showing you this one, and it is not the one you think. It is not <i>look how lucky they are</i>. Luck is not a thing I have ever been able to find in the cloth; I have looked.'),
    itIs: S('It is this.'),
    reading: S('In the thread you are reading — the one where she did not go out on the forty-second night — she is alive at the end of Book One, and so are four hundred and thirty-two people in a hold, and so is a child in a crate who is frightened of the dark. And every single one of those outcomes rests on a woman recognizing a low note with a ring in its heart, in her own kitchen, at the end of a day in which she had already spent everything she had.'),
    margin: S('That is all. That is the whole margin. A tired woman heard something, and did not go out.'),
    fresh: S('I have watched a great many threads, and I can tell you with some authority that the world is never saved by the people who are fresh.'),
    moreTitle: S('One more thing'),
    more: S('One more thing, and then I will leave you to the second book.'),
    useful: S('You should know that I am going to be in this story, and that I am going to be useful, and that I am going to like them — the Cantor especially, who reminds me of somebody, and the archivist, who does what I do and has not yet discovered what it costs.'),
    hushEnd: S('And you should know that in every thread where I say nothing at the right moment, they reach the Organum together and all of them are taken into the Hush, and are a very long time being digested, and the world ends in the way that does not have a sound.'),
    gate: S('In one thread, somebody sells them at the gate.'),
    some: S('Some of them live.'),
    looking: S('I have looked at four hundred and eleven of these, and I have not yet found a third option, and I am still looking, and I would like you to remember, when we get there, that I was looking.'),
    sign: S('<i>— the Tide-Weaver</i>'),
    endGo: S('The end of Book One.'),
    result: S('She went out on the forty-second night. In the thread you read, a tired woman heard something, and did not go out.'),
    // labels and refusals
    stoneLabel: S('The flat stone at the foot of the Hedge'),
    drainLabel: S('The cooperage drain'),
    bedLabel: S('Her bed'),
    tableLabel: S('Her table'),
    hearthLabel: S('Her hearth'),
    kaelenLabel: S('Kaelen Vance, with a bore plan under his arm'),
    lampLabel: S('A lamp on Cooper\'s Row, lit'),
    wallHedge: S('The Hedge: thorn, and packed wool, and behind the cooperage the wadding gone rotten.'),
    wallCooperage: S('The old cooperage wall.'),
    wallHouse: S('A house on Cooper\'s Row, asleep.'),
    noSong: S('You do not sing here. This thread is only being shown to you.'),
    noRest: S('Not in this thread.'),
    noTravel: S('This thread does not go further than Cooper\'s Row.'),
    // another thread (an Echo inside the Echo)
    echoTitle: S('Another thread'),
    echoStone: S('Not this thread. In this one she stays on the stone with her back to the thorn for the whole three hours, and says no. You are on the stone again.'),
    echoHome: S('Not this thread. In this one she does not go back up Cooper\'s Row tonight. You are at the foot of the thorn again, behind the cooperage.'),
    echoGo: S('Again'),
  };
  // the keys whose words are not the book's (the player's part, the plan, and the game's own labels)
  const PROPOSED = ['tag', 'blurb', 'journal', 'openTitle', 'listen', 'threadTitle', 'oneNightTitle', 'goOut', 'outHint', 'furtherTitle', 'no', 'again', 'noHint', 'hudNo',
    'elevenTitle', 'twelfthTitle', 'go', 'drainHint', 'elevenSecsTitle', 'hudFour', 'backTitle', 'walkUp', 'bootsHint', 'quicklyTitle', 'letIn', 'seeHim', 'holdTitle',
    'endGo', 'result', 'stoneLabel', 'drainLabel', 'bedLabel', 'tableLabel', 'hearthLabel', 'kaelenLabel', 'lampLabel', 'wallHedge', 'wallCooperage', 'wallHouse',
    'noSong', 'noRest', 'noTravel', 'echoTitle', 'echoStone', 'echoHome', 'echoGo'];
  // the recorded lines (voices/script.json), in the order the book has them; the Weaver's two from herald66 are shared
  const VO = {
    who: ['weaver.t70.who'], thread: ['weaver.h66.thread'], unhappen: ['weaver.h66.unhappen'], oneNight: ['weaver.t70.night'], went: ['weaver.t70.went'],
    lark: ['wearer.t70.lark'], hello: ['lyra.t70.hello'], come: ['wearer.t70.come'], again: ['wearer.t70.again'], no: ['lyra.t70.no'],
    twelfth: ['wearer.t70.twelfth'], coming: ['lyra.t70.coming'],
    watched: ['weaver.t70.watched'], soup: ['weaver.t70.soup'], matters: ['weaver.t70.matters'], good: ['weaver.t70.good'], quickly: ['weaver.t70.quickly'],
    times: ['weaver.t70.times'], margin: ['weaver.t70.margin'], fresh: ['weaver.t70.fresh'], looking: ['weaver.t70.looking'],
  };
  // a card body: paragraphs of keys; a paragraph that is an array runs its sentences on in one paragraph
  const flat = (paras) => paras.reduce((a, p) => a.concat(p), []);
  const voOf = (keys) => keys.reduce((a, k) => a.concat(VO[k] || []), []);
  const body = (paras) => paras.map((p) => (Array.isArray(p) ? p : [p]).map((k) => TX[k]).join(' ')).join('<br><br>');

  // ================================================================ cards, messages, voices (the RITE43 helpers)
  const R = {};   // transient run state, never saved (resetRun)
  const plain = (t) => String(t).replace(/<br\s*\/?>(<br\s*\/?>)?/g, ' ').replace(/<[^>]+>/g, '');
  const seq = (ids) => { try { if (typeof RITE43 !== 'undefined' && RITE43.seq) RITE43.seq(ids); } catch (e) { warnOnce('seq', e); } };
  const hush = () => { try { if (typeof RITE43 !== 'undefined' && RITE43.hush) RITE43.hush(); } catch (e) { /* nothing playing */ } };
  function say(k, cls, ms) { try { msg(plain(TX[k]), cls || '', ms || 6500); } catch (e) { /* cosmetic */ } if (VO[k]) seq(VO[k]); }
  function card(titleKey, paras, choices) {
    const hushed = choices.map((c) => Object.assign({}, c, { t: TX[c.k], f: function () { hush(); if (VO[c.k]) seq(VO[c.k]); return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(TX[titleKey], body(paras), hushed); } catch (e) { warnOnce('card', e); }
    const v = voOf(flat(paras)); if (v.length) seq(v);
  }
  let greyLeft = false;   // RITE43.echo greys the canvas until its card is answered; leaving the extra from the menu would leave it grey
  function echo(bodyKey, after) {
    if (typeof RITE43 !== 'undefined' && RITE43.echo) { try { greyLeft = true; RITE43.echo(TX[bodyKey], after, TX.echoTitle, TX.echoGo); return; } catch (e) { warnOnce('echo', e); } }
    card('echoTitle', [bodyKey], [{ k: 'echoGo', f: after }]);
  }
  const sfx = (name, ...a) => { try { Audio_.sfx[name](...a); } catch (e) { /* no audio yet */ } };

  // ================================================================ flags (validated small integers)
  const FLAGS = { t70: [0, 8], t70_beat: [0, 20], t70_no: [0, 11], t70_echoes: [0, 99] };
  function fint(k) { const v = hasG() ? F()[k] : 0, r = FLAGS[k]; return (typeof v === 'number' && Number.isInteger(v) && v >= r[0] && v <= r[1]) ? v : 0; }
  function setf(k, v) { F()[k] = clamp(v | 0, FLAGS[k][0], FLAGS[k][1]); }
  function validate() { if (!hasG()) return; const f = F(); for (const k of Object.keys(f)) if (/^t70/.test(k) && (!FLAGS[k] || fint(k) !== f[k])) delete f[k]; }
  const stage = () => fint('t70');
  const beat = () => fint('t70_beat');
  function setStage(n) { setf('t70', n); setf('t70_beat', 0); R.t = 0; R.wait = false; restage(); }

  // ================================================================ the maps [PROPOSED plan]
  const DOOR_OUT = { x: 7.5, y: 2.6, dir: Math.PI / 2 };       // on the Row, outside her door, facing down it
  const DOOR_IN = { x: 6.5, y: 6.5, dir: -Math.PI / 2 };       // inside her door
  const STONE = { x: 9.5, y: 23.95 };                          // behind the cooperage, at the foot of the thorn
  const SEAT_DIR = -Math.PI / 2;                               // her back to the thorn (the Hedge is the south edge)
  const DRAIN = { x: 13.5, y: 24.2 };                          // where the water goes under
  const DRAIN_OUT = { x: 13.5, y: 23.5, dir: -Math.PI / 2 };   // what comes back through it, facing up the Row
  const BED = { x: 9.5, y: 2.0 }, TABLE = { x: 6.5, y: 4.0 }, KDOOR = { x: 6.5, y: 7.3 }, KSEAT = { x: 5.6, y: 4.0 };   // her house as maps.js has it
  const UP_ROW = 15.5;                                         // north of here is back up Cooper's Row
  const EYE = 0.88;                                            // the standing eye (engine.js setMap)
  function buildHouse() {
    // the game's own Lyra Ashgrove's house (maps.js interior lyra_house): the same room, hearth, bed, shelf, table and lamp
    const m = new GameMap(HOUSE, TX.houseName, 12, 9, { floor: 't_wood', ceil: 't_wood', fogDist: 18, fogColor: [0, 0, 0], ambient: 0.3, music: 'inside', danger: 0, spawn: DOOR_IN });
    m.border('t_house');
    m.set(6, 8, DOOR({ portal: { map: ROW, x: DOOR_OUT.x, y: DOOR_OUT.y, dir: DOOR_OUT.dir }, label: TX.rowName }));
    m.deco('hearth', 1.2, 4.5, { radius: 0.3, scale: 0.9, glow: 0.7, use: 't70_look', label: TX.hearthLabel, _t70: 'hearth' });
    m.deco('bed', BED.x, BED.y, { radius: 0.5, scale: 0.6, use: 't70_bed', label: TX.bedLabel, _t70: 'bed' });
    m.deco('shelf', 4.5, 1.3, { radius: 0.2, scale: 0.9, _t70: 'shelf' });
    m.deco('table', TABLE.x, TABLE.y, { radius: 0.5, scale: 0.7, use: 't70_look', label: TX.tableLabel, _t70: 'table' });
    m.deco('lamp', 3.5, 6.5, { radius: 0.12, scale: 0.7, glow: 0.6, _t70: 'lamp' });
    m.baseCount = m.entities.length;   // the fixtures are the map's own (rebuilt with it, never saved): anim.js tidies away transient figures on every door
    return m;
  }
  function buildRow() {
    const W = 16, H = 26;
    const m = new GameMap(ROW, TX.rowName, W, H, { outdoor: true, floor: 't_cobble', floorTextures: ['t_cobble', 't_grass', 't_water', 't_moss', 't_shallows'], fogDist: 16, fogColor: [10, 12, 16], ambient: 0.4, music: 'town', danger: 0, spawn: DOOR_OUT });
    for (let x = 0; x < W; x++) { m.block(x, 0, 't_house', 1.6); m.block(x, H - 1, 't_hedge', 2.4); }
    for (let y = 0; y < H; y++) { m.block(0, y, 't_house', 1.6); m.block(W - 1, y, 't_house', 1.6); }
    for (let x = 1; x < W - 1; x++) m.block(x, 1, 't_house', 1.6);           // her house and her neighbours' along the top
    m.set(7, 1, DOOR({ portal: { map: HOUSE, x: DOOR_IN.x, y: DOOR_IN.y, dir: DOOR_IN.dir }, label: TX.houseName }));
    for (let y = 3; y <= 14; y++) { if (y === 8) continue; for (const x of [1, 2, 3, 12, 13, 14]) m.block(x, y, 't_house', 1.6); }   // the Row's houses, a lane between them
    for (let y = 16; y <= 19; y++) for (let x = 6; x <= 12; x++) m.block(x, y, 't_wood', 1.8);   // the old cooperage
    // the strip at the foot of the Hedge, walkable to the thorn (floor index 2 is impassable water in GameMap.isBlocked: not used here)
    for (let y = 20; y <= 24; y++) for (let x = 1; x <= 14; x++) m.setFloor(x, y, y === 24 ? 3 : 1);
    for (let y = 17; y <= 24; y++) m.setFloor(13, y, 4);                      // the water from the cooperage, to the drain
    m.deco('p51_stone', STONE.x, STONE.y, { solid: false, scale: 0.9, use: 't70_look', label: TX.stoneLabel, _t70: 'stone' });
    m.deco('p51_wadding', STONE.x + 0.2, 24.7, { solid: false, scale: 0.8, label: TX.wallHedge, _t70: 'wadding' });
    m.deco('grate', DRAIN.x, DRAIN.y + 0.3, { solid: false, scale: 0.8, use: 't70_drain', label: TX.drainLabel, _t70: 'drain' });
    for (const [x, y] of [[5.0, 4.5], [10.5, 9.5], [5.0, 14.5], [5.2, 19.6]]) m.deco('lamp', x, y, { solid: false, radius: 0.15, scale: 0.9, glow: 0.55, label: TX.lampLabel, _t70: 'lamp' + x });
    m.baseCount = m.entities.length;   // the fixtures are the map's own (rebuilt with it, never saved): anim.js tidies away transient figures on every door
    return m;
  }

  // ================================================================ Kaelen (transient, restaged from the flags)
  const keyed = (m, k) => (m && m.entities || []).find((e) => e && e._t70 === k);
  function kaelen(m) {
    let k = keyed(m, 'kaelen'); if (k) return k;
    k = { kind: 'deco', sprite: 'kaelen', x: KDOOR.x, y: KDOOR.y, solid: true, radius: 0.28, facing: -Math.PI / 2, label: TX.kaelenLabel, use: 't70_look', transient: true, _t70: 'kaelen', hidden: true };
    m.entities.push(k); return k;
  }
  // where Kaelen is, by the stage and step reached (idempotent)
  function restage() {
    const m = hasG() && G.maps && G.maps[HOUSE]; if (!m) return;
    const k = kaelen(m), s = stage(), b = beat();
    k.hidden = !(s === 6 && b <= 5);
    const seated = s === 6 && b >= 1 && b <= 2;   // from "Let him in." until he gets up to go
    k.x = seated ? KSEAT.x : KDOOR.x; k.y = seated ? KSEAT.y : KDOOR.y; k.facing = seated ? 0 : -Math.PI / 2;
  }

  // ================================================================ the timelines
  // each step: { w: seconds after the step before, do() } or { card() } (waits for its choice) or { gate(dt) } (waits for it)
  const next = () => { setf('t70_beat', beat() + 1); R.t = 0; R.wait = false; restage(); };
  const cardStep = (w, title, paras, choiceKey, then) => ({ w, card() { card(title, paras, [{ k: choiceKey || 'go', f: () => { if (then) then(); else next(); } }]); } });
  const ASK_GAP = 5;   // seconds between its asking again and again
  const STONE_LINE = [
    { w: 0.6, do: () => say('sits', '', 5000) },
    { w: 2.5, do: () => say('lark', 'voice', 5000) },
    { w: 3, do: () => say('hello', 'voice', 4500) },
    { w: 3, do: () => say('day', '', 5000) },
    cardStep(4, 'furtherTitle', ['further', 'come', 'saysNo'], 'no', () => { sayNo(true); next(); say('noHint', 'warn', 9000); }),
    { gate: (dt) => asking(dt) },
    cardStep(3, 'elevenTitle', ['eleven']),
    { w: 1, card() { sfx('step'); sfx('murmur'); card('twelfthTitle', ['twelfth', 'thornMoves', 'frightened'], [{ k: 'coming', f: () => setStage(4) }]); } },
  ];
  const DRAIN_LINE = [
    cardStep(2.5, 'watchedTitle', ['watched', 'precise', 'soup'], 'go', () => { next(); say('drainHint', 'warn', 9000); }),
    { gate: () => atDrain() },
    { gate: (dt) => crawling(dt) },
    cardStep(0.5, 'elevenSecsTitle', ['elevenSecs', 'matters']),
    { gate: (dt) => { R.four += dt; return R.four >= FOUR_SECS; } },
    cardStep(0, 'backTitle', ['back'], 'walkUp', () => { setStage(5); emerge(); }),
  ];
  const BOOTS_LINE = [
    { gate: () => !!R.bed },
    { w: 3, card() { card('goodTitle', ['good', 'nobody', 'jar'], [{ k: 'go', f: () => setStage(6) }]); } },
  ];
  const NIGHT_LINE = [
    { w: 1.5, card() { sfx('door'); card('quicklyTitle', ['quickly', 'door'], [{ k: 'letIn', f: () => next() }]); } },
    { w: 0.5, do: () => say('table', '', 12000) },
    { w: 10, do: () => say('seeHim', 'warn', 6000) },
    { gate: (dt) => { R.kaelenT += dt; const c = Engine.cam; return dist(c.x, c.y, KDOOR.x, KDOOR.y) < 1.8 || R.kaelenT >= 15; } },
    { w: 0.5, do: () => { sfx('song', 87, 2.6); say('hum', 'voice', 9000); } },
    { w: 8, do: () => { sfx('door'); say('ally', '', 6000); } },
    { w: 6, do: () => setStage(7) },
  ];
  const REST_LINE = [
    cardStep(0.6, 'hearthTitle', ['hearth', 'holdBegins']),
    cardStep(0.6, 'holdTitle', ['stool', 'beautifully']),
    cardStep(0.6, 'letGoTitle', ['relieved', 'lullaby', 'letsGo']),
    cardStep(0.6, 'greenTitle', ['green']),
    cardStep(0.6, 'restTitle', ['kdies', 'vane', 'sable', 'eat']),
    cardStep(0.6, 'watchedTitle', ['times', 'reason', 'itIs', 'reading', 'margin', 'fresh']),
    cardStep(0.6, 'moreTitle', ['more', 'useful', 'hushEnd', 'gate', 'some', 'looking', 'sign'], 'endGo', () => end()),
  ];
  const LINES = { 3: STONE_LINE, 4: DRAIN_LINE, 5: BOOTS_LINE, 6: NIGHT_LINE, 7: REST_LINE };
  function runLine(dt) {
    const s = stage(), line = LINES[s]; if (!line || R.wait) return;
    const st = line[beat()]; if (!st) return;
    if (st.gate) { if (st.gate(dt)) next(); return; }
    R.t += dt; if (R.t < (st.w || 0)) return;
    if (st.card) { R.wait = true; st.card(); return; }
    st.do(); if (stage() === s) next();   // a step that moved the stage on has started the next line at its first step
  }
  // the asking: it asks again, and you say no, until she has said it eleven times
  function sayNo(onCard) { setf('t70_no', fint('t70_no') + 1); R.asked = false; R.askT = 0; if (!onCard) say('no', 'voice', 2500); }   // a card's choice plays its own voice
  function asking(dt) {
    if (fint('t70_no') >= 11) return true;
    if (!R.asked) { R.askT += dt; if (R.askT >= ASK_GAP) { R.asked = true; say('again', 'voice', 4000); } }
    return false;
  }
  function answer() { if (stage() !== 3 || beat() !== 5 || !R.asked) return false; sayNo(); return true; }
  // the drain: walk to it (or use it); then eleven seconds on her hands and knees, the view sinking and going dark
  const CRAWL_SECS = 11, FOUR_SECS = 6;
  const atDrain = () => { const c = Engine.cam; return !!R.drain || dist(c.x, c.y, DRAIN.x, DRAIN.y) < 1.0; };
  function crawling(dt) {
    if (!R.crawlOn) { R.crawlOn = true; R.sink = 0; say('crawl', '', 9000); }
    R.sink = Math.min(1, R.sink + dt / CRAWL_SECS); R.black = R.sink;
    const c = Engine.cam; c.z = EYE - 0.55 * R.sink;   // down on her hands and knees
    c.x = DRAIN.x; c.y = DRAIN.y - 0.4 + 0.3 * R.sink; c.dir = Math.PI / 2; c.pitch = -6;
    return R.sink >= 1;
  }
  // what comes back through the drain, standing up on the Oakhaven side
  function emerge() {
    const c = Engine.cam; c.x = DRAIN_OUT.x; c.y = DRAIN_OUT.y; c.dir = DRAIN_OUT.dir; c.pitch = 0; c.z = EYE; R.black = 0; R.sink = 0;
    say('boots', '', 6000); setTimeout(() => { if (here() && stage() === 5) say('bootsHint', 'warn', 8000); }, 2500);
  }

  // ================================================================ per frame
  function tick(dt) {
    const s = stage(), c = Engine.cam;
    G.tod = 0.08;   // the dead hour, throughout [PROPOSED: the clock; the book puts none on the forty-second night]
    if (s === 2 && G.mapId === ROW && dist(c.x, c.y, STONE.x, STONE.y) < 0.8) { setStage(3); seat(); return; }
    // getting up from the stone while it asks, or going back up the Row before the drain, is another thread
    if (G.mapId === ROW && !R.wait) {
      if (s === 3 && dist(c.x, c.y, STONE.x, STONE.y) > 0.9) { another('echoStone', seat); return; }
      if (s === 4 && beat() <= 1 && c.y < UP_ROW) { another('echoHome', () => { c.x = STONE.x; c.y = STONE.y - 1.2; c.dir = 0; c.pitch = 0; }); return; }
    }
    if (s === 4 && beat() >= 3) { R.black = 1; c.x = DRAIN.x; c.y = DRAIN.y - 0.1; }
    if (s === 5) R.black = beat() >= 1 ? Math.min(1, R.black + dt / 2.5) : 0;
    if (s >= 6) R.black = 0;
    if ((s >= 6 || (s === 5 && beat() >= 1)) && G.mapId !== HOUSE) return;   // her bed and Kaelen's visit are in her house: out of it, they wait
    runLine(dt);
  }
  function another(bodyKey, back) { setf('t70_echoes', fint('t70_echoes') + 1); R.wait = true; echo(bodyKey, () => { back(); R.wait = false; }); }
  function seat() { const c = Engine.cam; c.x = STONE.x; c.y = STONE.y; c.dir = SEAT_DIR; c.pitch = 0; }
  function arrive() {
    // a map loaded (a door, a save, the start): say what the book says happens here, once
    const s = stage();
    if (s === 1 && G.mapId === HOUSE && !starting) say('outHint', 'warn', 9000);
    if (s === 1 && G.mapId === ROW) { setStage(2); say('deadHour', '', 6000); }
    if (s === 5 && beat() === 0 && G.mapId === HOUSE) say('letsIn', '', 5000);
  }

  // ================================================================ start, end, the overlays
  let starting = false;
  function start() {
    const p = G.player;
    p.name = 'Lyra Ashgrove'; p.face = 2; p.weapons = ['hands']; p.weapon = 0; p.gold = 0;
    G.journal = []; G.day = 2; G.tod = 0.08; G.noise = 0;   // [PROPOSED] the dead hour after Rootday, the forty-second night as js/lyra51.js counts it
    for (const k of Object.keys(G.flags)) if (/^t70/.test(k)) delete G.flags[k];
    resetRun();
    G.maps[HOUSE] = buildHouse(); G.maps[ROW] = buildRow();
    setStage(1);
    starting = true; try { loadMap(HOUSE); } finally { starting = false; }
    G.state = 'play'; G.keys = {};
    journal('main', TX.journal);
    // the Weaver's opening, four cards
    const four = () => card('oneNightTitle', ['thread41', 'night42', 'oneNight', 'went'], [{ k: 'goOut', f: () => say('outHint', 'warn', 9000) }]);
    const three = () => card('unhappenTitle', [['understand', 'unhappen', 'roads']], [{ k: 'go', f: four }]);
    const two = () => card('threadTitle', ['marren', 'thread'], [{ k: 'go', f: three }]);
    card('openTitle', ['epigraph', 'who'], [{ k: 'listen', f: two }]);
    return true;
  }
  function resetRun() { Object.assign(R, { t: 0, wait: false, black: 0, sink: 0, askT: 0, asked: false, kaelenT: 0, four: 0, crawlOn: false, drain: false, bed: false }); }
  resetRun();
  function end() {
    setStage(8);
    const result = { id: ID, text: TX.result, noes: fint('t70_no'), echoes: fint('t70_echoes') };
    R.black = 0;
    try { if (typeof RITE43 !== 'undefined') RITE43.grey(false); } catch (e) { /* cosmetic */ }
    greyLeft = false;
    try { if (typeof Weather !== 'undefined' && Weather.release) Weather.release(); } catch (e) { /* none */ }
    try { EXTRAS17.finish(result); } catch (e) { warnOnce('finish', e); }
    return result;
  }
  function onLoad() {
    if (!here()) return;
    validate();
    const s = stage(), b = beat();
    resetRun();
    R.black = (s === 4 && b >= 3) ? 1 : 0;
    if (s === 4 && b === 2) setf('t70_beat', 1);       // a load mid-crawl: back at the mouth of the drain
    if (s === 5 && b >= 1) setf('t70_beat', 0);        // a load as she lies down: up, by the bed
    restage();
    if (G.mapId === ROW) { if (s === 3) seat(); if (s === 4 && b >= 3) { const c = Engine.cam; c.x = DRAIN.x; c.y = DRAIN.y - 0.1; } }
    arrive();
    try { if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear'); } catch (e) { /* the sky is the engine's */ }
  }
  // the Echo's grey (the whole extra), and the dark of the drain
  // a grey with the shadows lifted a little (a gamma of 0.8), so the dead hour still reads
  const GREY = new Uint8Array(256); for (let i = 0; i < 256; i++) GREY[i] = Math.round(255 * Math.pow(i / 255, 0.8));
  function post(Fr) {
    if (!here() || !Fr || !Fr.fb) return;
    const fb = Fr.fb, N = Fr.w * Fr.h, k = ((1 - R.black) * 256) | 0;
    if (k <= 0) { fb.fill(0xff000000, 0, N); return; }
    for (let i = 0; i < N; i++) {
      const p = fb[i], L = (GREY[((p & 255) * 77 + ((p >> 8) & 255) * 150 + ((p >> 16) & 255) * 29) >> 8] * k) >> 8;
      fb[i] = (p & 0xff000000) | (L << 16) | (L << 8) | L;
    }
  }
  function drawOverlay() {
    if (!here() || G.state !== 'play') return;
    const ctx = Engine.ctx; if (!ctx) return;
    const s = stage(), b = beat();
    ctx.save(); ctx.font = '8px "Alegreya SC", serif'; ctx.textAlign = 'center'; ctx.fillStyle = '#c8c8c8';
    const Y = 24;   // high, clear of the hands
    if (s === 3 && b === 5) ctx.fillText(TX.hudNo + ' · ' + fint('t70_no'), 160, Y);
    else if (s === 4 && b === 4) ctx.fillText(TX.hudFour, 160, Y);
    ctx.restore();
  }

  // ================================================================ the wiring (inert unless this extra runs)
  function useOwn(e) {
    if (!e || !e._t70) return false;
    if (e.use === 't70_drain') { if (stage() === 4 && beat() === 1) R.drain = true; else say('drainLabel', '', 3000); return true; }
    if (e.use === 't70_bed') { if (stage() === 5 && beat() === 0 && !R.bed) { R.bed = true; say('liesDown', '', 5000); } else say('bedLabel', '', 3000); return true; }
    if (e.use === 't70_look') { try { msg(plain(e.label || ''), '', 3500); } catch (err) { /* cosmetic */ } return true; }
    return false;
  }
  function wire() {
    const has = (n) => typeof window[n] === 'function';
    if (has('buildAllMaps')) { const _f = buildAllMaps; buildAllMaps = function () { const maps = _f.apply(this, arguments); try { if (active()) { maps[HOUSE] = buildHouse(); maps[ROW] = buildRow(); } } catch (e) { warnOnce('maps', e); } return maps; }; }
    if (has('loadMap')) { const _f = loadMap; loadMap = function () { const r = _f.apply(this, arguments); try { onLoad(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (has('update')) { const _f = update; update = function (dt) { const r = _f.apply(this, arguments); try { if (here() && G.state === 'play') tick(dt || 0); } catch (e) { warnOnce('update', e); } return r; }; }
    // the HUD too is drawn grey while the Echo runs (RITE43.grey greys the whole canvas the same way); the filter is reset every frame
    if (has('drawHUD')) {
      const _f = drawHUD;
      drawHUD = function () {
        if (greyLeft && !active()) { greyLeft = false; try { RITE43.grey(false); } catch (e) { /* cosmetic */ } }
        const ctx = here() && typeof Engine !== 'undefined' ? Engine.ctx : null;
        if (ctx) ctx.filter = 'grayscale(1)';
        let r; try { r = _f.apply(this, arguments); } finally { if (ctx) ctx.filter = 'none'; }
        try { drawOverlay(); } catch (e) { warnOnce('hud', e); }
        return r;
      };
    }
    if (has('useDeco')) { const _f = useDeco; useDeco = function (e) { try { if (here() && useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _f.apply(this, arguments); }; }
    if (has('interact')) { const _f = interact; interact = function () { try { if (here() && answer()) return undefined; } catch (err) { warnOnce('interact', err); } return _f.apply(this, arguments); }; }
    if (has('castSong')) { const _f = castSong; castSong = function () { if (here()) { say('noSong', 'warn', 3500); return undefined; } return _f.apply(this, arguments); }; }
    if (has('renderRest')) { const _f = renderRest; renderRest = function () { if (here()) { G.state = 'play'; say('noRest', 'warn', 3500); return undefined; } return _f.apply(this, arguments); }; }
    if (has('travelBlocked')) { const _f = travelBlocked; travelBlocked = function () { if (active()) return TX.noTravel; return _f.apply(this, arguments); }; }
    if (has('travelOpen')) { const _f = travelOpen; travelOpen = function () { if (active()) { G.state = 'play'; say('noTravel', 'warn', 3500); return undefined; } return _f.apply(this, arguments); }; }
    if (has('wallLabel')) { const _f = wallLabel; wallLabel = function (cell) { try { if (here() && cell && WALLS[cell.tex]) return WALLS[cell.tex]; } catch (e) { /* fall through */ } return _f.apply(this, arguments); }; }
    try { if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook((Fr) => { try { post(Fr); } catch (e) { warnOnce('post', e); } }, 45); } catch (e) { warnOnce('hook', e); }
  }
  const WALLS = { t_hedge: TX.wallHedge, t_wood: TX.wallCooperage, t_house: TX.wallHouse };
  function register() {
    try { if (typeof EXTRAS17 !== 'undefined' && EXTRAS17.register) EXTRAS17.register({ id: ID, title: TX.title, tag: TX.tag, blurb: TX.blurb, start, unlocked: () => true }); } catch (e) { warnOnce('register', e); }
  }
  try { wire(); register(); } catch (e) { console.warn('thread70 failed to wire', e); }

  return { ID, MAPS, TX, TEXTS, PROPOSED, VO, R, FLAGS, STONE, DRAIN, BED, KDOOR, KSEAT, LINES, CRAWL_SECS, ASK_GAP, active, here, stage, beat, fint, validate, start, end, answer, buildHouse, buildRow, restage, keyed: (k) => keyed(G.map, k) };
})();
if (typeof window !== 'undefined') window.THREAD70 = THREAD70;
