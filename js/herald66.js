// ============================================================
//  herald66 — The herald and the temptation, played (Book One ch. 24, "Heartglass"; ROADMAP R9 #21).
//
//  Part Four's last morning. The coda is done and the tank is closed, and a herald has come up the south road to the camp
//  in the Deep Woods (js/coda.js codaCheckHerald). It replaces the old two-choice card ("Let Lyra answer him" / "Answer
//  him yourself") with the chapter, in the book's words:
//    0  THE COLUMN (optional). Kaelen on the keel-block in the grey light with the string and the knots: four fingers and
//       a half. Hold the end of the string for him, or (glassed) measure your own with it [PROPOSED]. He writes the number
//       on the deck-beam under the nine names: 1 · 2½ · 3 · 4 · 4½. Sable at the hatch: "Engineer." Missing it changes
//       nothing but the deck-beam and one line of the end card.
//    1  THE WRIT. The herald reads it aloud in the middle of the clearing, the crew round him in a loose and extremely
//       unfriendly ring (staged figures stand in for the camp): Dissonant, the Justiciar nine days out, grace offered
//       once; the glass drawn; amnesty; registration waived; proper disposition. "There it is," said Vane.
//    2  TWENTY YARDS INTO THE TREES. Kaelen and Lyra go into the trees east of the camp. Walk after them, or stay in the
//       ring and hear it anyway (Mags reads lips; the rest can hear perfectly well).
//    3  "I'M TAKING IT." Lyra: "only Kaelen goes into the dark"; "Proper disposition. Say what it means." Near enough,
//       the traveller may answer [PROPOSED]: tell him to take it, tell him she is right, or say nothing. Telling him to
//       take it is an Echo (GDD 4.9; RITE43.echo): grey, the Tide-Weaver ("a thread that was not taken"), the thread where
//       he does, built from the writ's own terms and Lyra's words [PROPOSED], then the moment again.
//    4  THE OTHERS COME UP. Vane's bad trade; Sable's succession (only when Sable came aboard; otherwise the wood is
//       very quiet).
//    5  THE ANSWER. Lyra answers the herald, because Kaelen found that he could not (canon, always). Walk out with her and
//       stand a yard behind her shoulder, or stay in the ring [PROPOSED]. "We heard the question too."
//    6  BY THE BOW. Walk round to the bow, or watch from the fire (after 45 s it plays anyway): "You don't get to pay. You
//       get to help." "Work." The glass hand, because the right one was easy.
//    7  NOON. Mags up the envelope; Pennick and the tank; "Port Cantabile." "Right," said Vane.
//    8  THE HOLD. Vane at the crates with his hand flat on the third one (walk up and see it, or it is told at the beam).
//       That night, Kaelen's list on the deck-beam, and under it: Not yet. Then Book One's end card.
//  Without her voice (no lyra_voice), Lyra writes it on her slate [PROPOSED; her lines are the book's] and her
//  recordings are not played. Halder Wick is left off the beam if the traveller kept him alive. Progress is G.flags.h66
//  (0–10) plus h66_column, h66_trees, h66_echoes, h66_beside, h66_bow, h66_noon, h66_vane; herald_answered and
//  herald_by_lyra are set as before. Figures are transient and staged again on load; a card that a save interrupted is
//  shown again on restore.
// ============================================================
'use strict';

const HERALD66 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('herald66: ' + k + ' failed', e); } };
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => a[+i] != null ? a[+i] : m);
  const voice = () => !!(hasG() && F().lyra_voice);
  const say = (t, cls, ms) => { try { msg(String(t).replace(/<\/?i>/g, ''), cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const voiced = () => typeof VOICE_ACT !== 'undefined' && !!VOICE_ACT.LINES && (typeof VOICES === 'undefined' || ['acted', 'spoken'].includes(VOICES.mode));
  let voTok = 0;
  function hush() { voTok++; try { const st = VOICE_ACT.state; if (!st) return; st.pending = null; if (st.current) { st.current.stop(); st.current = null; } } catch (e) { /* nothing playing */ } }
  // the recorded lines, one after another; a newer card cuts the one before, a choice hushes it. Lyra's ruined voice is
  // only heard while she has it (the same rule as voice-acting.js mayspeak).
  function seq(ids) {
    if (!voiced()) return;
    ids = ids || [];
    const tok = ++voTok; let i = 0;
    const next = () => {
      while (tok === voTok && i < ids.length) {
        const id = ids[i++], l = VOICE_ACT.LINES[id];
        if (!l || (l.speaker === 'lyra_ruined' && !voice())) continue;
        let d = 0; try { d = VOICE_ACT.playLine(Object.assign({ id }, l), { interrupt: true }) || 0; } catch (e) { warnOnce('line', e); }
        if (d > 0 && i < ids.length) setTimeout(next, (d + 0.3) * 1000);
        return;
      }
    };
    next();
  }
  const card = (title, body, choices, ids) => {
    const hushed = (choices || []).map((c) => Object.assign({}, c, { f: function () { hush(); return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(title, body, hushed); } catch (e) { warnOnce('card', e); }
    if (ids) seq(ids);
  };
  const P = (...parts) => parts.filter(Boolean).join('<br><br>');

  // ================================================================ the words (Book One ch. 24, ll. 6159–6371)
  const TX = {
    // 0 the column
    kaelenKeel: S('He is sitting on the keel-block in the grey light with the string and the knots.'),
    colTitle: S('Four fingers and a half'),
    col: S('Four fingers and a half.<br><br>He measured it sitting on the keel-block in the grey light with the string and the knots, and then he measured it again because the first answer was wrong, and the second answer was the same.'),
    colHist: S('At midsummer it had been one finger from the point of the shoulder. On Rootday, in his father\'s hall, two and a half. On Massday, after he drank a Legionnaire\'s bell in a depot at the quarry, three. Four at the casing, after a Steam Golem and a boiler\'s worth of working noise.'),
    colLast: S('And now four and a half, because last night he had put his fist through a thing that had eaten five people and two years of sound, and the glass had taken all of it, and he had felt it go in like a man drinking in a doorway.'),
    colLastNo: S('And now four and a half.'),
    colThroat: S('Four and a half fingers from the point of the shoulder puts the tideline past the collarbone, across the top of the chest, and three inches from the notch of the throat.<br><br>The heart is deeper than that and further over. He had worked out the distance in the second winter with a piece of chalk on the hut wall, and had then not looked at the sum for seven years, which was its own kind of arithmetic.'),
    colHold: S('Hold the end of the string for him'),
    colOwn: S('Measure your own tideline with his string'),
    colLeave: S('Leave him to it'),
    colHeld: S('You hold the end of the string at the point of his shoulder while he counts the knots, and he counts them twice. Four and a half.'),
    colOwnText: S('He hands you the string without a word, and you lay it from the point of your own shoulder and count the knots. {0} fingers.'),
    colBeam: S('He wrote the number on the deck-beam under the nine names, in charcoal, and sat looking at the column.<br><br><i>1 · 2½ · 3 · 4 · 4½</i><br><br>Six weeks, he thought. Perhaps eight, if nothing came at them. Nothing had failed to come at them in nineteen days.'),
    sableHatch: S('"Engineer."<br><br>Sable was at the hatch with the Ledger at her elbow and her arm out of its sling, which Bettany had forbidden.<br><br>"There is a man in the clearing," she said, "in white, under a parley flag, and he says he has a writ for Kaelen Vance, and he is going to read it aloud whether or not anyone comes, because the form requires it to be read aloud and witnessed."'),
    noSable: S('There is a man in the clearing, in white, under a parley flag, with a writ for Kaelen Vance, and he is going to read it aloud whether or not anyone comes, because the form requires it to be read aloud and witnessed.'),
    colGo: S('Out to the clearing'),
    jColumn: S('At dawn Kaelen measured his tideline on the keel-block with the string and the knots: four and a half fingers from the point of the shoulder, three inches from the notch of the throat. He wrote it on the deck-beam under the nine names: 1 · 2½ · 3 · 4 · 4½. Six weeks, perhaps eight.'),
    lookBeam: S('The deck-beam'),
    lookBeamBefore: S('Charcoal on the deck-beam, under the nine names: 1 · 2½ · 3 · 4.'),
    lookBeamText: S('Charcoal on the deck-beam, under the nine names: 1 · 2½ · 3 · 4 · 4½.'),
    // 1 the writ
    writTitle: S('The writ'),
    w1: S('He was about twenty-five, and he had walked nine miles through the Spectral Woods at night alone to do this, which told you something about the Arbiterium\'s training or about what they had on him.'),
    w1ring: S('He stood in the middle of the clearing in a white herald\'s tabard with the scales on the breast, holding a staff with a white rag knotted to it, with a nine-foot Office automaton eleven feet away and a skyship crew around him in a loose and extremely unfriendly ring, and he read from a sealed sheet with a black ribbon in a clear carrying voice, and his hands shook the entire time and he did not let it get into his reading, and Kaelen found that he respected him enormously.'),
    w1ringNo: S('He stood in the middle of the clearing in a white herald\'s tabard with the scales on the breast, holding a staff with a white rag knotted to it, with a skyship crew around him in a loose and extremely unfriendly ring, and he read from a sealed sheet with a black ribbon in a clear carrying voice, and his hands shook the entire time and he did not let it get into his reading, and Kaelen found that he respected him enormously.'),
    writ1: S('<i>"By the Arbiterium of the Iron Synod, under the hand of the Supreme Arbiter, at the Organum, the seventeenth day of Leaffall, 419.</i>'),
    writ2: S('<i>"Be it known: the persons styled Kaelen Vance, late Chief Resonant Engineer, badge four-oh-eight-A; Lyra Ashgrove, Cantor, of Oakhaven; the carrier styled Vane, of registry OK-114; and the scribe styled Sable, formerly of the Office of the Catalogue — are declared Dissonant. Their goods are forfeit. Their testimony is void in any court of the Synod. The Church of the Pure Note has entered a claim upon the Cantor, which claim the Arbiterium has stayed, for now."</i>'),
    hetty: S('Hetty Bram said something short under her breath. The herald did not look up.'),
    writ3: S('<i>"Be it further known that the Justiciar Aurelian Vaelen, Dread Arbiter, is upon the Iron Tramway with a column of the Carillon Legions and the authority of the Scales, and will be at the Mausoleum of Chords within nine days.</i>'),
    writ4: S('<i>"And be it known that grace is offered, once."</i>'),
    turned: S('He turned the sheet.'),
    writ5: S('<i>"To Kaelen Vance: surrender of his person at the Organum, upon these terms. The glass shall be drawn. The Supreme Arbiter attests, upon his own body, that it can be drawn, and that he has carried eighty years of it and will show the engineer how."</i>'),
    pennick: S('Pennick, on his crutch, made a small noise.'),
    writ6: S('<i>"To the Cantor Lyra Ashgrove: amnesty, full and recorded, and the Church\'s claim extinguished, and transit to any province she names.</i>'),
    writ7: S('<i>"To the persons of Oakhaven aboard the said vessel: relief, transit, and registration waived."</i>'),
    waived: S('"Waived," said Sable, very quietly. "He knows what we saw at the Malting."'),
    writ8: S('<i>"And to the consignment of engram cores presently aboard the said vessel: proper disposition by the Office of the Catalogue, under the Registrar-General\'s hand."</i>'),
    nobody: S('Nobody said anything for a moment.<br><br>"There it is," said Vane.'),
    listen: S('Listen'),
    goOn: S('...'),
    jWrit: S('The herald read the writ aloud in the clearing: all of us declared Dissonant, the Justiciar nine days out on the Iron Tramway, and grace offered, once. For Kaelen, the glass drawn at the Organum. For Lyra, amnesty. For the persons of Oakhaven, transit, and registration waived. For the cores, "proper disposition".'),
    heraldWaits: S('He waits in the middle of the clearing with the sheet held against his chest. The form allows a reasonable time.'),
    // 2–3 twenty yards into the trees
    treesHint: S('Kaelen and Lyra have gone twenty yards into the trees, east of the camp, to have it out. It fools nobody.'),
    treesTitle: S('Twenty yards into the trees'),
    treesFar: S('You stay in the ring by the herald, and hear all of it from there.'),
    t1a: S('"I\'m taking it," said Kaelen.<br><br>They had gone twenty yards into the trees to have it, which fooled nobody, because Mags could read lips at that distance and the rest of them could hear perfectly well.<br><br>"Of course you are," said Lyra.<br><br>"Listen to me—"'),
    t1b: S('"No, it\'s wonderful. It\'s the best one yet."'),
    t1voice: S('Her voice was still a ruin; it made everything she said sound as though it had been dragged over gravel, which suited her this morning.'),
    t1slate: S('She had no voice for it; she wrote it on her slate, fast, and held it up to him, and the chalk squealed, which suited her this morning.'),
    t1c: S('"Nineteen days ago you were going to go down a shaft on your own and break a bore with your hands. Then you were going to sign a paper so the Hollow wouldn\'t burn. Now you\'re going to walk into the Organum and lie down on a table for the man who used you, and every single time, Kaelen, every single time, the plan is <i>only Kaelen goes into the dark</i>."'),
    t1d: S('"It\'s twenty-one people off this ship and out of a war."<br><br>"It\'s four hundred and thirty-two people into a furnace!" She pointed back through the trees. "<i>Proper disposition.</i> You heard it. Say what it means."<br><br>He said it, because she was right and because she had earned it. "It means they go back into Legionnaires."'),
    annet: S('"And Annet Sowerby is in the third crate," said Lyra.'),
    chTake: S('"Take it, Kaelen."'),
    chLyra: S('"She\'s right."'),
    chNothing: S('Say nothing.'),
    lyraRight: S('You say it. Neither of them looks round at you.'),
    // the Echo
    echoTitle: S('An Echo'),
    echoThread: S('Somewhere outside the colour of it, the Tide-Weaver: "I am going to show you a thread that was not taken."'),
    echoPanel: S('In this thread nobody answers the herald but Kaelen, and he says yes. He walks the nine miles back with the young man in white. At the Organum he lies down on a table for the man who used him, and the glass is drawn, as the Supreme Arbiter attested upon his own body that it can be. The consignment goes to the Office of the Catalogue for proper disposition, under the Registrar-General\'s hand: four hundred and thirty-two people into a furnace, and back into Legionnaires. Annet Sowerby is in the third crate.'),
    echoUnhappen: S('"This did not happen. It also did not unhappen; nothing does."'),
    echoGo: S('Again'),
    echoBack: S('You are back under the trees, twenty yards from the clearing, and nobody has answered the herald yet.'),
    // 4 the others
    othersTitle: S('A bad trade'),
    o1: S('The others came up, because of course they did.<br><br>"I\'d like to put one thing in," said Vane. He had his hands in his pockets. "I\'ve been thinking about it since the herald started, which is longer than I usually think about anything. Nine days, he said. That\'s a column on the Tramway with a Justiciar at the head of it, and they\'ll be at this clearing on Driftday, and the Kestrel can\'t fly on three tanks."<br><br>"I know."<br><br>"Which means the choice isn\'t <i>Kaelen goes in or nobody goes in</i>. It\'s <i>Kaelen goes in and buys us nine days we\'d have had anyway</i>, because that writ already told us where they are and how fast." He shrugged. "It\'s a bad trade, that\'s all I\'m saying. I\'ve made a career of bad trades and that one\'s bad."'),
    o2: S('"He also told us something else," said Sable.<br><br>She had the Ledger open and she was looking at it the way she looked at a page that had something wrong with the ruling.<br><br>"Think about the terms. Amnesty for the Cantor, transit for twenty-one farmers, registration waived — the Registrar-General would never waive registration; it is the only thing he has — and the cores returned, which the Catalogue would demand anyway. All of that is small." She looked up. "And the thing he is buying with it is one man with a Dawning-glass arm who can hear the Choristers."<br><br>"Sable—"<br><br>"He does not want you punished, Engineer. He wants you <i>at the Organum</i>." Her voice did not rise. "He has eight Anchors to ask a question of, and a Planetary Engine thirty years in the building, and exactly two people alive who have heard a god answer. He is one of them. He is a hundred and forty years old and eighty percent glass and he will not last another twenty years, and he has just offered you a cure, a desk, and an education.<br><br>"That is not a sentence. That is a <i>succession</i>."'),
    o3: S('The wood was very quiet.'),
    o4: S('"He told me the Cantor was the most important person alive," said Kaelen slowly.<br><br>"Then he will come for her next," said Sable, "and he will be polite about that too."'),
    // 5 the answer
    answerTitle: S('We heard the question too'),
    a0: S('In the end it was Lyra who answered the herald, because Kaelen found that he could not.'),
    chWalk: S('Walk out into the clearing with her'),
    chStay: S('Stay in the ring'),
    walked: S('You walk out with her as far as the edge of the ring, and stop a yard behind her shoulder, and say nothing.'),
    a1voice: S('She walked out into the middle of the clearing in a borrowed coat with her hair unbrushed and the mark of a wire under her jaw, and stood in front of a young man in white with a staff, and said, in that torn and carrying voice:'),
    a1slate: S('She walked out into the middle of the clearing in a borrowed coat with her hair unbrushed and the mark of a wire under her jaw, and stood in front of a young man in white with a staff, and wrote on her slate, a line at a time, and held each one up to him:'),
    a2: S('"Write this down, and get it exactly right, because he\'ll ask you.<br><br>"The Cantor of Oakhaven thanks the Supreme Arbiter for the amnesty and declines it.<br><br>"The persons of Oakhaven aboard this ship are not goods and are not in his gift, and they will go where they choose, and if he wants to do something useful for them he can put the Reach back.<br><br>"The consignment is not a consignment. It is four hundred and thirty-two people out of Whisper-Grove, and we know all of their numbers and some of their names, and we are taking them home.<br><br>"And Engineer Vance declines grace."<br><br>The herald\'s pen had stopped.<br><br>"He will ask me why," he said.<br><br>Lyra thought about that for a moment.<br><br>"Tell him the Cantor says: <i>we heard the question too.</i>"'),
    jAnswer: S('Lyra answered the herald herself, in the middle of the clearing: the Cantor declines the amnesty; the persons of Oakhaven are not goods; the consignment is four hundred and thirty-two people, and we are taking them home; and Engineer Vance declines grace. "Tell him the Cantor says: we heard the question too."'),
    // 6–7 by the bow
    bowHint: S('Afterward Kaelen goes round to the bow of the Kestrel, and Lyra goes after him.'),
    bowTitle: S('By the bow'),
    bowFar: S('From the fire you can see the two of them by the bow, and the rest of you can hear perfectly well.'),
    b1: S('"You didn\'t ask me," said Kaelen afterward, by the bow.<br><br>"No."<br><br>"Lyra—"<br><br>"I\'m not doing this because I\'ve forgiven you," said Lyra Ashgrove. "I want to be extremely clear, because I know exactly what you\'ll make of it if I leave a gap. I have not forgiven you. I\'m not sure I\'m going to. Last night I killed the last place my father\'s voice existed, and the day before that a thing in a fog told me what you did, kindly, and let me sit down, and both of those are in me now and they are not coming out."<br><br>She turned round and faced him.'),
    b2: S('"But I have watched you try to pay for seven years," she said, "and the arithmetic is wrong, and I\'m the only person here who can say so, because everybody else on this ship wants something from you. You can\'t pay. There isn\'t enough of you. Eleven thousand and forty people and a sky — there is no amount of Kaelen Vance that buys that back, and you have been trying to settle it one limb at a time since the year it happened, and the Supreme Arbiter has just offered you the biggest instalment yet and you lit up like a lamp."<br><br>He did not deny it. He had felt it light.'),
    b3: S('"So: no," she said. "You don\'t get to pay. You get to <i>help</i>. You get to get up tomorrow and do the next useful thing and then the one after that, for as long as it takes, with people who know exactly what you are, which is the worst sentence I can think of and the only one that\'s any use to anybody." Her mouth twisted. "That\'s not mercy. Don\'t write it down as mercy."<br><br>"What should I write it down as?"<br><br>"Work," said Lyra.<br><br>And she put her hand in his — the glass one, the left, the cold one with the ringing in it, because the right one was easy and she had never once in her life taken the easy one — and stood beside him looking east, and did not say anything else.'),
    bowGo: S('Leave them the bow'),
    // 7 noon
    noonTitle: S('Port Cantabile'),
    n1: S('They buried nothing and marked nothing, because there was nothing to bury.<br><br>Mags went up the envelope at noon with a palm and a needle. Pennick drew the number-three tank down and sealed the clip and pronounced it good for perhaps forty miles, and then said the thing he had been not saying for a day and a half.<br><br>"We need a tank, Captain. A whole one. And a yard with a drift-bench and somebody who knows how to tune one, and there is one place on this continent inside forty miles of where we can get to."<br><br>Vane stood at the wheel for a while.<br><br>"Say it," he said.<br><br>"Port Cantabile," said Pennick.<br><br>The Rust Coast. Oona Salt, and four hundred and eighty sovereigns, and a debt called in. The Salt Stair, and a dealer who had sold him a bottle with a name on the label. And somewhere on that coast, or off it, a woman with eyes gone violet who had come in off the water in the evening, which nobody does, and asked very politely which captain it was who had cut his tow over the trench.<br><br>"Right," said Vane.'),
    noonGo: S('He goes below'),
    // 8 the hold, and the beam
    holdHint: S('Vane has gone to the crates, alone.'),
    vaneHold: S('He said it in a perfectly ordinary voice, and went below, and stood in the hold among the crates in the dark for a while with his hand flat on the third one.'),
    vaneCourse: S('Then he came up and set a course west-south-west, for the coast, which he had sworn for five years he would never do.'),
    beamHint: S('That night Kaelen goes down to the deck-beam with a lantern and a nub of charcoal.'),
    lookVane: S('Captain Vane'),
    listTitle: S('Not yet'),
    l1: S('That night Kaelen went down into the hold with a lantern and a nub of charcoal and read his own list on the beam, which had got longer.'),
    l3: S('He had added the eight from the carriage file, which had been exactly where Vaelen said it would be, and he had thought about that for a long time afterward and had still written them down.'),
    l4: S('He sat with his back against the third crate with the murmur going on around him, four hundred and thirty-two people talking in their sleep, and through the glass — faint, a week and a hundred miles behind them, with a hole in it, still going — he could hear the Chorister of Growth losing the tune of a five-note lullaby and starting again from the beginning.<br><br><i>Somebody has to hold it.</i><br><br>He had been pushing the thought away for a week, the way you push a dog off a bed.<br><br>He stopped pushing it, and looked at it, and found it looking back.<br><br>Then Kaelen Vance picked up the charcoal, and under the last name on the list, in the hold of a stolen skyship flying west toward a coast he had never seen, he wrote two words that were not a name and were not a number, and that he could not have explained to anybody aboard:<br><br><i>Not yet.</i>'),
    endGo: S('End Book One.'),
    // the people in the ring
    nKaelen: S('Kaelen Vance'), nLyra: S('Lyra Ashgrove'), nHetty: S('Hetty Bram'), nPennick: S('Pennick, on his crutch'), nMags: S('Mags Tennant'),
    nTobiah: S('Tobiah Marsh'), nSable: S('Sable'), nAegis: S('The Aegis Sentinel'),
    // the end card
    endColumn: S('At dawn Kaelen measured his tideline on the keel-block: four and a half fingers, three inches from the notch of the throat.'),
    endEcho: S('Under the trees you told him to take it, once, and were shown the thread where he did. Then you were back under the trees.'),
    endBeside: S('When Lyra walked out to answer the herald, you stood a yard behind her shoulder and said nothing.'),
  };
  // Kaelen's list on the beam (l. 6347), one name to a line; Halder Wick is not on it if he is alive
  const NAMES = [
    S('Tamsin Reed'), S('Aldric Vance'), S('Davin Hale'), S('Tam — (no surname. ASK.)'), S('Orla Hale'), S('Hob Wendle'), S('Ada Pellow'),
    S('8 men at the pumps — Edders. Ruhl. Caine. Ott. Sennet. Vey. Marrow. Hale, B. (no relation)'), S('Halder Wick'), S('Coralie — (no surname. There is no one to ask.)'),
  ];
  const HALDER = NAMES[8];

  // ================================================================ the voices (voices/script.json, source herald66.js)
  const VO = {
    sableHatch: ['sable.h66.engineer', 'sable.h66.parley', 'sable.h66.parley2'],
    w1: ['herald.h66.writ1', 'herald.h66.writ2', 'herald.h66.writ2b'],
    w2: ['herald.h66.writ3', 'herald.h66.writ4'],
    w3: ['herald.h66.writ5', 'herald.h66.writ6', 'herald.h66.writ7', 'sable.h66.waived', 'herald.h66.writ8', 'vane.h66.thereitis'],
    t1: ['kaelen.h66.taking', 'lyra.h66.ofcourse', 'kaelen.h66.listen', 'lyra.h66.wonderful', 'lyra.h66.nineteen', 'lyra.h66.nineteen2', 'kaelen.h66.war', 'lyra.h66.furnace', 'kaelen.h66.legion', 'lyra.h66.annet'],
    annet: ['lyra.h66.annet'],
    echo: ['weaver.h66.thread', 'weaver.h66.unhappen'],
    o1: ['vane.h66.putin', 'vane.h66.ninedays', 'kaelen.h66.iknow', 'vane.h66.trade'],
    o2: ['sable.h66.else', 'sable.h66.terms', 'sable.h66.terms2', 'sable.h66.buying', 'kaelen.h66.sable', 'sable.h66.punished', 'sable.h66.anchors', 'sable.h66.cure', 'sable.h66.succession', 'kaelen.h66.cantor', 'sable.h66.polite'],
    a2: ['lyra.h66.write', 'lyra.h66.declines', 'lyra.h66.goods', 'lyra.h66.consignment', 'lyra.h66.grace', 'herald.h66.why', 'lyra.h66.question'],
    bow: ['kaelen.h66.didnt', 'lyra.h66.no', 'kaelen.h66.lyra', 'lyra.h66.forgiven', 'lyra.h66.lastnight', 'lyra.h66.pay', 'lyra.h66.pay2', 'lyra.h66.pay3', 'lyra.h66.help', 'lyra.h66.help2', 'kaelen.h66.writeas', 'lyra.h66.work'],
    n1: ['engineer.h66.tank', 'vane.h66.sayit', 'engineer.h66.port', 'vane.h66.right'],
  };

  // ================================================================ where everyone stands (the Deep Woods, js/maps.js)
  const MAP = 'deepwoods';
  const HERALD = [27.5, 50.6];
  const RING = {
    lyra: [26.4, 48.9], kaelen: [28.5, 48.8], vane: [25.0, 49.8], mags: [24.9, 51.6], hetty: [26.0, 52.9],
    sable: [30.0, 49.6], pennick: [30.2, 51.7], tobiah: [29.0, 53.0], aegis: [31.6, 53.4],
  };
  const TREES = { at: [34.8, 43.0], kaelen: [34.4, 43.5], lyra: [35.3, 42.7], vane: [33.5, 44.3], sable: [34.2, 44.9] };
  const ANSWER = [27.5, 49.5];
  const BOW = { at: [21.3, 46.6], kaelen: [21.0, 46.3], lyra: [21.5, 46.95] };
  const CRATES = [30.5, 47.6], BEAM = [25.0, 47.0];
  const NEAR_TREES = 3.4, NEAR_BOW = 3.2, NEAR_VANE = 2.6, FAR_TREES = 40, FAR_BOW = 45;
  const CAMP = ['vane_dw', 'tobiah_dw', 'mags_dw', 'lyra_dw', 'kaelen_dw', 'sable_dw', 'aegis_dw'];
  const WHO = {
    kaelen: ['kaelen', TX.nKaelen], lyra: ['lyra', TX.nLyra], vane: ['vane', TX.lookVane], mags: ['mags', TX.nMags], hetty: ['hetty', TX.nHetty],
    sable: ['sable', TX.nSable], pennick: ['townsman', TX.nPennick], tobiah: ['tobiah', TX.nTobiah], aegis: ['aegis', TX.nAegis],
  };

  const stage = () => (hasG() && F().h66) | 0;
  const setStage = (n) => { F().h66 = n; };
  const active = () => hasG() && stage() >= 1 && stage() <= 9;
  const R = { t: 0, map: null };   // map: the Deep Woods object last staged, so the tick need not search for the beam

  const keyed = (m, k) => (m && m.entities || []).find((e) => e && e._h66 === k);
  function put(m, k, e) {
    const have = keyed(m, k); if (have) return have;
    e = Object.assign({ nopick: true }, e, { transient: true, _decor: true, _h66: k });
    m.entities.push(e); return e;
  }
  function drop(m, pred) { if (!m || !Array.isArray(m.entities)) return; for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._h66 && pred(e)) m.entities.splice(i, 1); } }
  const face = (from, to) => Math.atan2(to[1] - from[1], to[0] - from[0]);

  // who stands where, at each stage
  function layout(s) {
    const f = F(), out = {}, hide = new Set();
    if (s >= 1 && s <= 5) {
      for (const k of Object.keys(RING)) {
        if (k === 'sable' && !f.sable_with) continue;
        if (k === 'aegis' && !f.aegis_follow) continue;
        out[k] = [RING[k], face(RING[k], HERALD)];
      }
      if (s >= 2 && s <= 4) { out.kaelen = [TREES.kaelen, face(TREES.kaelen, TREES.lyra)]; out.lyra = [TREES.lyra, face(TREES.lyra, TREES.kaelen)]; }
      if (s === 4) { out.vane = [TREES.vane, face(TREES.vane, TREES.kaelen)]; if (out.sable) out.sable = [TREES.sable, face(TREES.sable, TREES.kaelen)]; }
      if (s === 5) out.lyra = [ANSWER, face(ANSWER, HERALD)];
      CAMP.forEach((id) => hide.add(id));
    } else if (s >= 6 && s <= 9) {
      out.kaelen = [BOW.kaelen, 0]; out.lyra = [BOW.lyra, 0];
      hide.add('kaelen_dw'); hide.add('lyra_dw');
      if (s >= 8) { out.vane = [CRATES, face(CRATES, [29.8, 47.0])]; hide.add('vane_dw'); }
    }
    return { out, hide };
  }
  function restoreCamp(m, keepHidden) {
    let n = 0;
    for (const e of m.entities) {
      if (!e || !CAMP.includes(e.id) || keepHidden.has(e.id) || !e._h66hid) continue;
      e._h66hid = false; e.hidden = e.requires ? !F()[e.requires] : false; n++;
    }
    if (n) try { if (typeof partyCampNpcs === 'function') partyCampNpcs(); else if (typeof ringSync === 'function') ringSync(); } catch (e) { warnOnce('camp', e); }
  }
  function stageMap(m) {
    if (!m || m.id !== MAP || !hasG() || !F().part4) return;
    const f = F(), s = stage();
    if (f.herald_come) { R.map = m; put(m, 'beam', { kind: 'deco', sprite: 'sign', x: BEAM[0], y: BEAM[1], scale: 0.7, solid: true, radius: 0.25, facing: Math.PI, use: 'h66_beam', nopick: false, label: TX.lookBeam }); }
    const beam = keyed(m, 'beam'); if (beam) beam.look = f.h66_column || s >= 1 ? TX.lookBeamText : TX.lookBeamBefore;
    const { out, hide } = layout(s);
    for (const k of Object.keys(out)) {
      const [pos, fc] = out[k], [sprite, label] = WHO[k];
      const e = put(m, k, { kind: 'deco', sprite, x: pos[0], y: pos[1], scale: k === 'aegis' ? 1.2 : k === 'tobiah' ? 0.94 : 1.0, solid: true, radius: 0.3, use: 'h66_look', nopick: false, label });
      e.x = pos[0]; e.y = pos[1]; e.facing = fc; e.hidden = false;
      if (k === 'vane') e.look = s >= 8 ? TX.vaneHold : null;
    }
    drop(m, (e) => e._h66 !== 'beam' && !out[e._h66]);
    restoreCamp(m, hide);
    for (const e of m.entities) if (e && CAMP.includes(e.id) && hide.has(e.id)) { e.hidden = true; e._h66hid = true; }
    for (const e of m.entities) if (e && e.id === 'herald') e.hidden = s >= 6 || !f.herald_come;
  }
  const restage = () => { if (G.mapId === MAP) stageMap(G.map); };

  // ================================================================ 0 · the column
  function fingers() {
    const n = Math.max(0.5, Math.round((G.player.glass || 0) / 100 * 7 * 2) / 2), w = Math.floor(n);
    return (w ? String(w) : '') + (n > w ? '½' : '');
  }
  function columnFromTalk() {
    setTimeout(() => { try { if (G.state === 'dialogue') closeModal(); } catch (e) { /* none */ } column(); }, 50);
    return { text: TX.kaelenKeel };
  }
  function column() {
    const f = F(), p = G.player;
    const body = P(TX.col, TX.colHist + ' <span>' + (f.ring_struck ? TX.colLast : TX.colLastNo) + '</span>', TX.colThroat);
    const choices = [{ t: TX.colHold, f: () => beamCard(TX.colHeld) }];
    if (p.glassed) choices.push({ t: TX.colOwn, f: () => beamCard(fmt(TX.colOwnText, fingers())) });
    choices.push({ t: TX.colLeave, f: () => beamCard('') });
    card(TX.colTitle, body, choices);
  }
  function beamCard(pre) {
    const f = F(); f.h66_column = true;
    journal('main', TX.jColumn);
    restage();
    card(TX.colTitle, P(pre, TX.colBeam, f.sable_with ? TX.sableHatch : TX.noSable), [{ t: TX.colGo, f: null }], f.sable_with ? VO.sableHatch : null);
  }

  // ================================================================ 1 · the writ
  function fromTalk() { setTimeout(() => { try { closeModal(); } catch (e) { /* none */ } begin(); }, 50); return true; }
  function begin() {
    if (!hasG() || stage() !== 0 || F().herald_answered) return false;
    setStage(1);
    try { if (G.party && G.party.id && typeof partyDismiss === 'function') partyDismiss(true); } catch (e) { warnOnce('party', e); }
    restage(); writ1(); return true;
  }
  function writ1() { card(TX.writTitle, P(TX.w1, F().aegis_follow ? TX.w1ring : TX.w1ringNo, TX.writ1, TX.writ2), [{ t: TX.listen, f: writ2 }], VO.w1); }
  function writ2() { card(TX.writTitle, P(TX.hetty, TX.writ3, TX.writ4, TX.turned), [{ t: TX.listen, f: writ3 }], VO.w2); }
  function writ3() {
    const sab = F().sable_with;
    card(TX.writTitle, P(TX.writ5, TX.pennick, TX.writ6, TX.writ7, sab && TX.waived, TX.writ8, TX.nobody), [{ t: TX.goOn, f: toTrees }], VO.w3.filter((id) => sab || !/^sable\./.test(id)));
  }
  function toTrees() {
    setStage(2); R.t = 0; journal('main', TX.jWrit); restage();
    say(TX.treesHint, 'warn', 8000);
  }

  // ================================================================ 2–3 · twenty yards into the trees
  function trees(near) {
    const f = F(); setStage(3); f.h66_trees = near ? 'near' : 'far';
    showTrees();
  }
  function showTrees() {
    const f = F(), near = f.h66_trees === 'near';
    const body = P(near ? '' : TX.treesFar, TX.t1a, TX.t1b + ' <span>' + (voice() ? TX.t1voice : TX.t1slate) + '</span> ' + TX.t1c, TX.t1d, TX.annet);
    card(TX.treesTitle, body, near ? answers() : [{ t: TX.goOn, f: others }], VO.t1);
  }
  function answers() {
    const f = F();
    return [
      { t: TX.chTake, f: () => echo() },
      { t: TX.chLyra, f: () => { say(TX.lyraRight, '', 4500); others(); } },
      { t: TX.chNothing, f: () => others() },
    ];
  }
  function echo() {
    const f = F(); f.h66_echoes = (f.h66_echoes | 0) + 1;
    const body = P(TX.echoThread, TX.echoPanel, TX.echoUnhappen), back = () => card(TX.treesTitle, P(TX.echoBack, TX.annet), answers(), VO.annet);
    if (typeof RITE43 !== 'undefined' && RITE43.echo) RITE43.echo(body, back, TX.echoTitle, TX.echoGo);
    else card(TX.echoTitle, body, [{ t: TX.echoGo, f: back }]);
    seq(VO.echo);
  }

  // ================================================================ 4 · the others come up
  function others() {
    setStage(4); restage();
    const sab = F().sable_with;
    card(TX.othersTitle, P(TX.o1, sab && TX.o2, TX.o3, sab && TX.o4), [{ t: TX.goOn, f: answer }], sab ? VO.o1.concat(VO.o2) : VO.o1);
  }

  // ================================================================ 5 · the answer
  function answer() {
    setStage(5); restage();
    card(TX.answerTitle, TX.a0, [
      { t: TX.chWalk, f: () => answered(true) },
      { t: TX.chStay, f: () => answered(false) },
    ]);
  }
  function answered(beside) {
    const f = F();
    if (!f.herald_answered) { f.herald_answered = true; f.herald_by_lyra = true; f.h66_beside = !!beside; journal('main', TX.jAnswer); }
    showAnswered();
  }
  function showAnswered() {
    card(TX.answerTitle, P(F().h66_beside && TX.walked, voice() ? TX.a1voice : TX.a1slate, TX.a2), [{ t: TX.goOn, f: toBow }], VO.a2);
  }

  // ================================================================ 6–7 · by the bow, and noon
  function toBow() { setStage(6); R.t = 0; restage(); say(TX.bowHint, 'warn', 7000); }
  function bow(near) { const f = F(); setStage(7); f.h66_bow = near ? 'near' : 'far'; showBow(); }
  function showBow() {
    card(TX.bowTitle, P(F().h66_bow === 'far' && TX.bowFar, TX.b1, TX.b2, TX.b3), [{ t: TX.bowGo, f: noon }], VO.bow);
  }
  function noon() { F().h66_noon = true; card(TX.noonTitle, TX.n1, [{ t: TX.noonGo, f: toHold }], VO.n1); }
  function toHold() { setStage(8); restage(); say(TX.holdHint, 'warn', 7000); }

  // ================================================================ 8–9 · the hold, the beam, and Not yet
  function vaneSeen() {
    const f = F(); if (f.h66_vane) return;
    f.h66_vane = true; say(TX.vaneHold, 'voice', 8000);
    setTimeout(() => { try { say(TX.vaneCourse, '', 7000); say(TX.beamHint, 'warn', 7000); } catch (e) { /* cosmetic */ } }, 5000);
  }
  function list() {
    if (stage() !== 8) return false;
    const f = F();
    if (!f.h66_vane) { f.h66_vane = 'told'; say(TX.vaneHold, 'voice', 7000); say(TX.vaneCourse, '', 7000); }
    setStage(9); showList(); return true;
  }
  function showList() {
    const names = NAMES.filter((n) => n !== HALDER || !F().halder_safe).map((n) => '<i>' + n + '</i>').join('<br>');
    card(TX.listTitle, P(TX.l1, names, TX.l3, TX.l4), [{ t: TX.endGo, f: finish }]);
  }
  function finish() {
    if (stage() !== 9) return;
    setStage(10);
    const m = G.maps && G.maps[MAP];
    if (m) { drop(m, (e) => e._h66 !== 'beam'); restoreCamp(m, new Set()); }
    try { bookOneEnd(); } catch (e) { warnOnce('end', e); }
  }
  function endLines() {
    if (!hasG()) return [];
    const f = F(), out = [];
    if (f.h66_column) out.push(TX.endColumn);
    if (f.h66_echoes) out.push(TX.endEcho);
    if (f.h66_beside) out.push(TX.endBeside);
    return out;
  }
  // a card a save interrupted is shown again
  function resume() {
    const s = stage();
    if (s === 1) writ1(); else if (s === 3) showTrees(); else if (s === 4) others(); else if (s === 5) (F().herald_answered ? showAnswered() : answer()); else if (s === 7) (F().h66_noon ? noon() : showBow()); else if (s === 9) showList();
  }

  // ================================================================ the tick and the wiring
  function tick(dt) {
    if (!hasG() || G.state !== 'play' || G.mapId !== MAP || !F().part4) return;
    const s = stage(), f = F(), c = Engine.cam;
    if (f.herald_come && R.map !== G.map) stageMap(G.map);
    if (s === 2) {
      R.t += dt;
      if (dist(c.x, c.y, TREES.at[0], TREES.at[1]) < NEAR_TREES) trees(true); else if (R.t > FAR_TREES) trees(false);
    } else if (s === 6) {
      R.t += dt;
      if (dist(c.x, c.y, BOW.at[0], BOW.at[1]) < NEAR_BOW) bow(true); else if (R.t > FAR_BOW) bow(false);
    } else if (s === 8 && !f.h66_vane && dist(c.x, c.y, CRATES[0], CRATES[1]) < NEAR_VANE) vaneSeen();
  }
  function useOwn(e) {
    if (!e || !e._h66) return false;
    if (e.use === 'h66_beam') { if (list()) return true; say(e.look || e.label, '', 6000); return true; }
    if (e.use === 'h66_look') { if (e._h66 === 'vane' && stage() === 8) { vaneSeen(); return true; } say(e.look || e.label, '', 4000); return true; }
    return false;
  }
  function wire() {
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(dt); } catch (e) { warnOnce('update', e); } return r; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { restage(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof restoreGame === 'function') { const _rg = restoreGame; restoreGame = function () { const r = _rg.apply(this, arguments); try { R.t = 0; restage(); if (active()) setTimeout(() => { try { resume(); } catch (e) { warnOnce('resume', e); } }, 0); } catch (e) { warnOnce('restore', e); } return r; }; }
    if (typeof codaCheckHerald === 'function') { const _ch = codaCheckHerald; codaCheckHerald = function () { const r = _ch.apply(this, arguments); try { restage(); } catch (e) { warnOnce('come', e); } return r; }; }
    if (typeof codaEndingLines === 'function') { const _el = codaEndingLines; codaEndingLines = function () { const L = _el.apply(this, arguments); try { if (hasG() && F().part4) L.push(...endLines()); } catch (e) { warnOnce('lines', e); } return L; }; }
    if (typeof NPCS !== 'undefined' && NPCS.kaelen_dw) {
      const own = NPCS.kaelen_dw.quest;
      NPCS.kaelen_dw.quest = function (g) {
        try { const f = g.flags; if (f.part4 && f.herald_come && !f.herald_answered && !f.h66_column && stage() === 0) return columnFromTalk(); } catch (e) { warnOnce('kaelen', e); }
        return own ? own.apply(this, arguments) : null;
      };
    }
    if (typeof NPCS !== 'undefined' && NPCS.herald) {
      const own = NPCS.herald.quest;
      NPCS.herald.quest = function () {
        try { if (active()) return { text: TX.heraldWaits }; } catch (e) { warnOnce('herald', e); }
        return own ? own.apply(this, arguments) : null;
      };
    }
  }
  try { wire(); } catch (e) { console.warn('herald66 failed to wire', e); }

  return { TX, TEXTS, VO, NAMES, R, RING, TREES, BOW, CRATES, BEAM, MAP, stage, active, begin, fromTalk, column, trees, echo, others, answer, answered, bow, noon, list, finish, endLines, resume, tick, seq, hush, stageMap,
    consts: { NEAR_TREES, NEAR_BOW, NEAR_VANE, FAR_TREES, FAR_BOW } };
})();
if (typeof window !== 'undefined') window.HERALD66 = HERALD66;
