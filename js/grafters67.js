// ============================================================
//  grafters67 — The Grafters' Rootday round (ROADMAP R9 #22; Story Brainstorm #22; Book One ch. 3, "Burl", ll. 939–1081).
//
//  js/hollow30.js already brings the white wagon into the Hollow on Rootday morning (game day 1, 08:00–14:00): the felted
//  horses, the brazier in its cage, three masked Grafters and a Legionnaire. This module plays the round the book walks
//  on that morning, door to door, in the book's order and with the book's outcome. The lead of hollow30's three Grafters
//  (its 'g0') becomes Rooke, with his mask off; nothing new is added to the wagon.
//    1  THE WAGON. The first time you come into the Hollow that morning: the wagon, the masks, and Rooke unbuckling his for
//       Lyra at the mouth of the Hollow. "Cantor." / "Ah. You went ahead of me." / "Well. Let's see what you've left me."
//       [PROPOSED] How the traveller goes round: beside Lyra, with the Grafters behind the sawboys, or keeping to the lane.
//    2  HOB WENDLE FIRST, on his step: the brass lens, the brown bottle, three mute-drops and a quarter hour, the hush-saw
//       ("shh" into a pillow), the sap-iron, the only true sound of the morning; Lyra breathing the Root note into his
//       hair. "Good. Clean. He'll walk." [PROPOSED] the traveller's hands: Hob's hand, the Root note with her, the foot
//       held still for the saw, or watching (or not) from the step. None of it changes the cut.
//    3  THE CARDERS, behind the blue door: Pim on the hearth-rug with his hands on a hot brick in flannel; the lens, one
//       finger at a time. "Early. Very early." "And receding, I'd have said. If I didn't know better." "Unusual. Recheck
//       next month. Keep him out of the damp." Always, as the book has it: Lyra sang him down before dawn. [PROPOSED] In the
//       game the Carders live at the mill; for the inspection Nell and Pim are at home, as the book has them.
//    4  ORLA HALE in her chair. [PROPOSED] The game keeps her house where it stands on the town side (the book has it two
//       doors from the Carders'); the round goes up to it from the blue door. "I'm afraid I've put down roots." The
//       ear-trumpet, the barley, the green chalk; Lyra's falling fifth and nothing comes; "Don't, lovey."; "It's like being
//       held."; "sing me down ... Proper. Not in a jar."; "Good girl."; the green circle with a line struck through.
//    5  THE LANE. The sap-mark: past cutting; the Inquisitor four days out with a warrant that names the marked houses;
//       "Someone less careful."; "My saws leave people alive." The mark stays on Orla's door from now until the Greening.
//       [PROPOSED] Rub it off and the Echo plays (RITE43.echo): next month someone less careful comes to make the marks.
//    6  LISSA MERROW on the red-shutter step with her tin cup, watching them go by. Lyra looks at her until they have
//       passed, and walks home.
//    7  done. 8: left partway (the round goes on without you). 9: missed (Rootday morning went by elsewhere).
//  Nobody's fate turns on the traveller: Hob is cut and walks, Pim is "Recheck next month", Orla is marked. Missing the
//  round, or leaving it, changes the logbook and what you know of the mark on Orla's door; it never fails a quest. The
//  figures are transient and restaged on load. Flags: p67 (stage), p67_way, p67_hob, p67_lane (heard in the lane), p67_echo, p67_left.
// ============================================================
'use strict';

const GRAFT67 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags && G.maps;
  const F = () => G.flags;
  const hour = () => { const t = Number(G.tod) || 0; return (((t % 1) + 1) % 1) * 24; };
  const day = () => Number(G.day) || 0;
  const partOne = () => { const f = F(); return !(f.greening || f.escaped || f.part3 || f.part4 || f.rite_started); };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('grafters67: ' + k + ' failed', e); } };
  // stands down in a co-op guest's game and inside a title-menu extra, like cargo56 and lyra51: neither writes Book One flags
  const inExtra = () => { try { return typeof EXTRAS17 !== 'undefined' && !!EXTRAS17.inExtra(); } catch (e) { return false; } };
  const guest = () => { try { if (typeof SYNC19 !== 'undefined' && SYNC19.isGuest()) return true; } catch (e) { /* none */ } return inExtra(); };
  const jr = (t) => { try { journal('side', t); } catch (e) { /* none */ } };
  // the voices play through the Rite's player (js/rite43.js), so a newer card from any set-piece cuts the one before
  const seq = (ids) => { try { if (typeof RITE43 !== 'undefined') RITE43.seq(ids); } catch (e) { warnOnce('seq', e); } };
  const hush = () => { try { if (typeof RITE43 !== 'undefined') RITE43.hush(); } catch (e) { warnOnce('hush', e); } };
  let CARD_VO = null;
  const say = (t, cls, ms) => { try { msg(String(t).replace(/<\/?i>/g, ''), cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const card = (title, body, choices) => {
    const hushed = (choices || []).map((c) => Object.assign({}, c, { f: function () { hush(); return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(title, body, hushed); } catch (e) { warnOnce('card', e); }
    const v = CARD_VO && CARD_VO.find(([t]) => String(body).startsWith(t)); if (v) seq(v[1]);
  };

  // ================================================================ the words (Book One ch. 3, ll. 939–1081)
  const TX = {
    goOn: S('Go on.'),
    // 1 the wagon
    wagonTitle: S('The white wagon'),
    wagon: S('The Grafters came up the quarry road at the second hour, in a long white wagon drawn by two grey horses whose harness has been wrapped in felt so that nothing on them jingles, and whose hooves are booted in leather. On the wagon-bed, a brazier of banked coals in an iron cage and a rack of instruments under oilcloth. Three Grafters in white: long aprons of white leather, gloves to the elbow, and masks of stiffened leather with round glass eyepieces and, over the mouth, a lattice of fine wire, so that their breathing comes through as a soft continuous hiss, exactly in the Narrow. A Carillon Legionnaire walks at the tailboard with its bell lifted to the sky.<br><br>Lyra Ashgrove is at the mouth of the Hollow, where the lane dips toward the tannery. She has watched them come every second Rootday for three years.<br><br>The lead Grafter, as he always does when he sees her, unbuckles his mask and takes it off. Surgeon-Grafter Anselm Rooke is fifty or near it, with a long clever face creased like old paper, ink on his cuffs, and eyes that have been tired for a very long time.<br><br>"Cantor," he says.<br><br>She nods.<br><br>He looks at her face a moment. Then at her throat. His mouth thins. "Ah," he says softly. "You went ahead of me."<br><br>She nods again. It is an arrangement they have, she and Rooke, which neither of them has ever said aloud. She goes ahead of him. He goes slowly.<br><br>"Well," he says. "Let\'s see what you\'ve left me."<br><br>He goes house by house down the Hollow with his sawboys behind him and his instruments under his arm, and she goes with him, because she always does, because somebody has to hold their heads.'),
    wayLyra: S('Walk the round beside Lyra'),
    wayGrafters: S('Walk with the Grafters, behind the sawboys'),
    wayWatch: S('Keep to the lane and watch'),
    goneLyra: S('You fall in beside Lyra. She looks at you once, and does not try to speak. Rooke goes to Hob Wendle\'s step first, across the lane from the red shutters.'),
    goneGrafters: S('A sawboy puts the instrument roll in your arms without asking who you are. Rooke goes to Hob Wendle\'s step first, across the lane from the red shutters.'),
    goneWatch: S('You keep to the lane. Rooke goes to Hob Wendle\'s step first, across the lane from the red shutters.'),
    jStart: S('Rootday: the Grafters\' white wagon came into the Hollow, and Rooke took his mask off for Lyra. "Ah. You went ahead of me." She has no voice this morning. They are going house by house.'),
    // 2 Hob Wendle
    hobTitle: S('Hob Wendle first'),
    hob: S('Hob Wendle first: a field-hand of forty, big-shouldered and sheepish, whose roots came out through the soles of his feet in the summer, so that for weeks he walked on them without knowing it and left little white threads in the dust of every lane. Three of his toes have gone to wood. Rooke studies them through a brass lens for a long time, and presses them with a gloved thumb, and listens to the pressing, and then nods to a sawboy, who brings the brown bottle.<br><br>The mute-drops. Three on the tongue, and a quarter hour. Hob\'s eyes go glassy and calm, and then his throat works, and works, and nothing comes out of it, not even the sound of breath. The drops do not take the pain. They take the voice. The Grafting Office is very clear about that.'),
    hobHand: S('Hold his hand'),
    hobBreath: S('Breathe the Root note with her, soundless'),
    hobFoot: S('Hold the foot still for the saw'),
    hobWatch: S('Watch'),
    hobAway: S('Look away'),
    hob2: S('Lyra holds his head against her shoulder while they do it. The hush-saw is a fine-toothed thing with a felted grip and a blade so thin it flexes, and it goes through the wooden toes with a sound like someone whispering <i>shh</i> into a pillow. The sap-iron comes after, from the brazier, and that is the only true sound of the morning: a small sharp hiss, and the smell, green and scorched. Hob\'s whole body goes rigid against her, his mouth wide open, perfectly silent, his fingers digging into her back.<br><br>She cannot hum to him. She has nothing to hum with. She presses her lips to his hair and breathes the Root note, soundless, only air in the shape of the note, and she does not know whether he can feel it.'),
    hobDidHand: S('You hold his hand. He grips it hard enough that you will find the marks tonight.'),
    hobDidBreath: S('You breathe it with her at his other ear, air in the shape of the note. Neither of you knows whether he can feel it.'),
    hobDidFoot: S('You hold the foot still on the block, the way the sawboy shows you. It does not move. Nothing of Hob moves but his fingers in Lyra\'s back.'),
    hobDidWatch: S('You watch all of it from the lane. Nobody asks you to look away.'),
    hobDidAway: S('You look away, up the lane, and hear the only true sound of the morning anyway.'),
    hobEnd: S('Afterward he weeps with his mouth open and no sound comes out, and his wife holds him.<br><br>"Good," Rooke says quietly, peeling off his gloves. "Clean. He\'ll walk."'),
    hintCarders: S('Then the Carders. Rooke goes in at the blue door, halfway down the lane.'),
    // 3 the Carders
    pimTitle: S('Then the Carders'),
    pim: S('Nell has Pim sitting on the hearth-rug with his hands resting on a hot brick wrapped in flannel. When the Grafters come in, he looks at the masks, and the glass eyepieces, and the hissing wire mouths, and his lip begins to shake, and he does not move.<br><br>Rooke kneels in front of him. He has not put his mask back on; he never wears it for the children. He takes Pim\'s hands very gently by the wrists and turns them to the window and bends over them with his brass lens, one finger at a time.<br><br>It takes a long time.<br><br>Lyra stands by the door with her fists in her shawl and does not breathe.'),
    pimLyra: S('You stand by the door beside her. You do not breathe either.'),
    pimGrafters: S('You stand behind Rooke with the instrument roll. Nobody needs anything out of it.'),
    pimWatch: S('You stand in the doorway behind the sawboys, where Pim cannot see you.'),
    pimWait: S('Wait'),
    pim2: S('"Early," Rooke says at last. He is looking at the faint pale lines beneath Pim\'s nails. "Very early." He turns the small left hand over, and back. "And receding, I\'d have said. If I didn\'t know better." He glances over his shoulder at Lyra by the door.<br><br>She looks back at him.<br><br>"Unusual," says Rooke, after a moment. He lets go of the boy\'s wrists and makes a mark in his book. "Recheck next month. Keep him out of the damp." He stands, his knees cracking, and pats Pim on the head in passing, a dry, awkward, fatherly pat, and goes out.<br><br>Nell makes a sound behind her hand that is very nearly above the Narrow, and catches it, and folds over it. Pim looks from his mother to Lyra and back again without understanding, and Lyra goes to him and kneels and puts her arms around him and holds on.'),
    toOrla: S('Then Orla Hale'),
    // 4 Orla Hale
    orlaTitle: S('Then Orla Hale'),
    orla: S('Mother Hale is seventy-three. She delivered half the Hollow before Bettany took over, and she has sung the harvest home every autumn for fifty years in a voice like a rusty gate that everyone in Oakhaven loves. She is in the chair still. She has grown into it. Her hands lie along its arms, and her fingers have split and put out roots, and the roots have gone into the oak of the arms and through them and down the legs and into the floorboards, a pale web of them, fine as lace, pinning her where she sits. And the chair, which was dead wood for forty years, has answered: small green shoots have broken through the varnish, and a few have put out leaves, tender and new, the color of spring.<br><br>"Here\'s my girl," says Orla Hale, and smiles with half her mouth. "And the sawbones. Come in, come in. I\'d get up, but." She lifts her eyebrows at her hands, which cannot lift. "I\'m afraid I\'ve put down roots."<br><br>She says it every time. Every time, Rooke smiles at it.<br><br>Not this time. He kneels by her chair and takes a brass ear-trumpet from his bag and sets its bell to her chest, below the collarbone, and listens, and his face goes still. Under Orla\'s breathing, which is slow and even and peaceful, there is another sound: a dry sound, a faint whispering rustle, in and out with every breath, like wind moving through a field of barley.<br><br>Roots. In the lungs.<br><br>Rooke takes the trumpet from her chest and sits back on his heels and says nothing. He reaches into his apron and takes out a stick of chalk.<br><br>Green chalk.'),
    orlaLyra: S('You are at Lyra\'s shoulder when she moves.'),
    orlaGrafters: S('You are behind Rooke with the roll, close enough to hear the barley yourself.'),
    orlaWatch: S('From the door you can hear it too, now that you know to listen.'),
    orla2: S('<i>Let me try.</i><br><br>Lyra is across the room before she knows it, kneeling at the other side of the chair with her hands on Orla\'s rooted hands and her face close to Orla\'s chest, and she opens her mouth and pulls up everything she has from the very bottom of herself for the falling fifth—<br><br>And nothing comes. A rasp. A dry, cracked scrape of air, like a bow drawn across a slack string. She tries again, and her throat seizes, and she tastes blood.<br><br>"Don\'t, lovey," says Orla Hale. She cannot lift her hands, so she leans her head sideways instead, until her grey cheek rests on the top of Lyra\'s head, and stays there.<br><br>"It doesn\'t hurt," she says, very softly. "I thought it would. It doesn\'t. It\'s like—" She searches for it. "It\'s like being held. From underneath. Like the whole of the ground\'s got its arms round me." A soft rustling breath. "I\'m not frightened. I was, in the spring. I\'m not now."<br><br>"But you\'ll sing me down," Orla says. "When it\'s time. Won\'t you? Proper, mind. Not in a jar. Not in the Narrow. Proper, the way I sang the harvest home." A breath. "You promise me."<br><br>Lyra cannot speak. She nods against the old woman\'s cheek.<br><br>"Good girl," says Orla Hale.<br><br>Behind them, quietly, the Surgeon-Grafter gets to his feet, and goes to the door, and draws a green circle on the outside of it with a line struck through.'),
    toLane: S('Out into the lane'),
    // 5 the lane
    laneTitle: S('The sap-mark'),
    lane: S('In the lane afterward, Lyra catches his sleeve. She cannot ask. She points at the door behind them, at the green mark, and looks at him.<br><br>Rooke looks at the mark too. He puts his gloves in his apron pocket and does not put his mask back on.<br><br>"The sap-mark," he says. "It means <i>past cutting</i>. That\'s all it has ever meant. It meant I would come back each month and keep her comfortable, and at the end, when it was time, I\'d give her the long drops and you would sing, and her son would bury her." He speaks very low, even for the Narrow. "The Inquisitor has asked for the list."<br><br>She stares at him.<br><br>"He\'s four days out," Rooke says. "He carries a warrant from the High Patriarch for the purification of the Hollow, and the warrant names the marked houses. My marks." He looks down at his hands, clean and white and very steady. "I have been told," he says, "that if I stop making them, someone will be sent to make them for me. Someone less careful."<br><br>She lets go of his sleeve.<br><br>"My saws leave people alive," says Surgeon-Grafter Rooke. "At least there\'s that. Most days there\'s that."'),
    laneLyra: S('You are at her shoulder in the lane. She does not look at you.'),
    laneGrafters: S('The sawboy takes the instrument roll back out of your arms without a word.'),
    laneWatch: S('You are near enough in the lane to hear it, low as he speaks.'),
    laneOn: S('He buckles his mask back on over his tired face, and the wire lattice takes his breath and makes it a hiss, and he walks on down the lane to the next house, and his sawboys follow with the brazier.'),
    follow: S('Follow them down the lane'),
    rub: S('Rub the mark off the door'),
    echoTitle: S('An Echo'),
    echo: S('You wet your thumb and rub at the green circle on Orla Hale\'s door until it is a smear. Nobody stops you.<br><br>Then it is the next month, and the white wagon comes up the quarry road with someone less careful in it, to make the marks for him.<br><br>You are back in the lane. The mark is on the door.'),
    echoGo: S('The lane'),
    // 6 Lissa
    lissaTitle: S('The house with the red shutters'),
    lissa: S('At the end of the lane, on the step of the house with the red shutters, Lissa Merrow sits in the sun. She is eleven. Her forearms end in neat white bandages a hand\'s width below the elbow, and she is holding a tin cup of water between them, pressed carefully from both sides, and drinking from it, slowly, without spilling a drop. She watches the Grafters go by with an expression of perfect, terrible calm.<br><br>Lyra makes herself look at her until the Grafters have passed. Then she walks home.'),
    lissaLyra: S('You make yourself look at her too, until the Grafters have passed.'),
    lissaGrafters: S('You go by her with the Grafters, and she watches you go by with the same calm.'),
    lissaWatch: S('You stay in the lane and look at her until the Grafters have passed.'),
    jDoneLyra: S('I walked the Grafters\' round of the Hollow beside Lyra. Hob Wendle lost three toes to the hush-saw, and Rooke says he\'ll walk. Pim Carder: "Unusual. Recheck next month." Orla Hale has roots in her lungs, and Rooke drew the sap-mark on her door: past cutting. The Inquisitor has asked him for the list of the marked houses.'),
    jDoneGrafters: S('I walked the Grafters\' round of the Hollow with the sawboys, carrying the instrument roll. Hob Wendle lost three toes to the hush-saw, and Rooke says he\'ll walk. Pim Carder: "Unusual. Recheck next month." Orla Hale has roots in her lungs, and Rooke drew the sap-mark on her door: past cutting. The Inquisitor has asked him for the list of the marked houses.'),
    jDoneWatch: S('I watched the Grafters\' round of the Hollow from the lane. Hob Wendle lost three toes to the hush-saw, and Rooke says he\'ll walk. Pim Carder: "Unusual. Recheck next month." Orla Hale has roots in her lungs, and Rooke drew the sap-mark on her door: past cutting. The Inquisitor has asked him for the list of the marked houses.'),
    // leaving, missing
    left: S('The round goes on down the Hollow without you.'),
    jLeft: S('I left the Grafters\' round before it was done. They went on down the Hollow without me, door to door, and Lyra went with them.'),
    jMissed: S('Rootday came and went. The Grafters made their round of the Hollow without me. There is a green circle on Orla Hale\'s door now, with a line struck through it.'),
    // the figures
    lookRooke: S('Surgeon-Grafter Anselm Rooke'),
    lookRookeText: S('Rooke, with his mask off: a long clever face creased like old paper, ink on his cuffs, and eyes that have been tired for a very long time.'),
    lookGrafter: S('A masked Grafter'),
    lookGrafterText: S('Rooke, with his mask buckled back on. The wire lattice takes his breath and makes it a hiss.'),
    lookLyra: S('Lyra Ashgrove'),
    lookLyraText: S('Lyra, with her fists in her shawl. When she tries to speak, nothing comes but air.'),
    lookSawboy: S('A sawboy'),
    lookSawboyText: S('One of Rooke\'s sawboys, in a white apron, with the brown bottle in its pocket.'),
    lookWife: S('Hob Wendle\'s wife'),
    lookWifeText: S('Hob Wendle\'s wife, on the step beside him, waiting to hold him.'),
    lookNell: S('Nell Carder'),
    lookNellText: S('Nell Carder by the hearth, with her hand at her mouth.'),
    lookPim: S('Pim Carder'),
    lookPimText: S('Pim on the hearth-rug, his hands resting on a hot brick wrapped in flannel, holding still.'),
    // the mark on Orla's door, from Rootday to the Greening
    mark: S('The sap-mark on Orla Hale\'s door'),
    markSeen: S('A green circle chalked on Orla Hale\'s door, with a line struck through it. Past cutting. You watched Rooke draw it on Rootday, quietly, while she had her cheek on Lyra\'s head.'),
    markNot: S('A green circle chalked on Orla Hale\'s door, with a line struck through it. Past cutting. The Grafters came round on Rootday.'),
  };
  const WAY_GONE = { lyra: TX.goneLyra, grafters: TX.goneGrafters, watch: TX.goneWatch };
  const HOB_CHOICES = { lyra: [['hand', TX.hobHand], ['breath', TX.hobBreath]], grafters: [['foot', TX.hobFoot]], watch: [['watch', TX.hobWatch], ['away', TX.hobAway]] };
  const HOB_DID = { hand: TX.hobDidHand, breath: TX.hobDidBreath, foot: TX.hobDidFoot, watch: TX.hobDidWatch, away: TX.hobDidAway };
  const WAY_LINE = {
    pim: { lyra: TX.pimLyra, grafters: TX.pimGrafters, watch: TX.pimWatch },
    orla: { lyra: TX.orlaLyra, grafters: TX.orlaGrafters, watch: TX.orlaWatch },
    lane: { lyra: TX.laneLyra, grafters: TX.laneGrafters, watch: TX.laneWatch },
    lissa: { lyra: TX.lissaLyra, grafters: TX.lissaGrafters, watch: TX.lissaWatch },
  };
  const J_DONE = { lyra: TX.jDoneLyra, grafters: TX.jDoneGrafters, watch: TX.jDoneWatch };

  // ================================================================ the voices (voices/script.json; every line is the book's)
  const VO = {
    wagon: ['rooke.graft.cantor', 'rooke.graft.ahead', 'rooke.graft.leftme'],
    hob2: ['rooke.graft.walk'],
    pim2: ['rooke.graft.early', 'rooke.graft.receding', 'rooke.graft.unusual'],
    orla: ['orla.graft.girl'],
    orla2: ['orla.graft.dont', 'orla.graft.hurt', 'orla.graft.singme', 'orla.graft.goodgirl'],
    lane: ['rooke.graft.sapmark', 'rooke.graft.list', 'rooke.graft.fourdays', 'rooke.graft.told', 'rooke.graft.saws'],
  };
  CARD_VO = Object.keys(VO).map((k) => [TX[k], VO[k]]);

  // ================================================================ where things stand
  const MAPS = { hollow: 'p30_hollow', carders: 'p30_carders', orla: 'orla_house', town: 'oakhaven' };
  const HOURS = (typeof HOLLOW30 !== 'undefined' && HOLLOW30.GRAFTERS) || { from: 8, to: 14 };   // the wagon's hours (js/hollow30.js)
  const WINDOW = { day: 1, from: HOURS.from, to: HOURS.to };
  const AT = {
    // the Hollow
    mouth: { rooke: [14.2, 2.4], lyra: [13.0, 2.6] },
    hob: { rooke: [8.4, 9.9], lyra: [6.6, 9.9], saw: [8.6, 10.8], saw2: [9.4, 10.4], wife: [6.4, 10.6], at: [7.5, 9.45] },
    blue: { rooke: [15.0, 3.6], lyra: [15.0, 5.0], saw: [14.0, 3.2], saw2: [13.6, 4.0] },
    lissa: { you: [9.2, 10.6, 2.33], rooke: [11.0, 10.8], saw: [12.0, 10.4], saw2: [12.4, 11.2], lyra: [8.6, 11.2] },
    // the Carders' house (js/hollow30.js)
    carders: { pim: [1.9, 2.4], nell: [1.2, 3.4], rooke: [2.6, 3.4], lyra: [4.4, 5.2], saw: [5.3, 4.6] },
    // Orla's house, and the street outside her door (js/maps.js: the door at [30, 40], facing west)
    orla: { you: [7.5, 5.5, Math.PI], rooke: [5.4, 3.7], lyra: [3.6, 3.7], saw: [6.4, 4.6] },
    street: { you: [27.6, 40.6, 0], rooke: [28.6, 40.0], lyra: [28.6, 41.1], saw: [27.4, 41.7], saw2: [26.8, 41.2], mark: [29.88, 41.12] },
  };
  const HOB_NEAR = 2.0;

  const stage = () => (hasG() && F().p67) | 0;
  const setStage = (n) => { F().p67 = n; };
  // the mark is on Orla's door once the round has reached her: with you (5–7), after you left it from her door on, or
  // once the morning is over
  const marked = () => { const s = stage(); return hasG() && ((s >= 5 && s <= 7) || (s === 8 && (F().p67_left | 0) >= 5) || (s >= 8 && pastWindow())); };
  const way = () => { const w = hasG() && F().p67_way; return w === 'lyra' || w === 'grafters' ? w : 'watch'; };
  const R = { restoring: false, carded: false };   // a restore shows its beat's card once

  // ================================================================ staging (transient figures, keyed _g67)
  const keyed = (m, k) => (m && m.entities || []).find((e) => e && e._g67 === k);
  function put(m, k, e) {
    let have = keyed(m, k); if (have) return have;
    e = Object.assign(e, { transient: true, _decor: true, nopick: true, _g67: k });
    m.entities.push(e); return e;
  }
  function drop(m, pred) { if (!m || !Array.isArray(m.entities)) return; for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._g67 && (!pred || pred(e))) m.entities.splice(i, 1); } }
  const fig = (m, k, sprite, pos, o) => {
    const e = put(m, k, Object.assign({ kind: 'deco', sprite, x: pos[0], y: pos[1], scale: 1.0, solid: false, radius: 0.3, facing: Math.PI / 2 }, o || {}));
    e.x = pos[0]; e.y = pos[1]; if (o && o.facing != null) e.facing = o.facing;
    return e;
  };
  const look = (label, text) => ({ use: 'p67_look', label, look: text });
  // Rooke is hollow30's lead Grafter (its 'g0'), unmasked; a figure of our own only if the wagon has gone
  function rooke(m, pos, facing, masked) {
    const lk = masked ? look(TX.lookGrafter, TX.lookGrafterText) : look(TX.lookRooke, TX.lookRookeText);
    const g0 = (m.entities || []).find((e) => e && e._p30 === 'g0');
    if (g0) { drop(m, (e) => e._g67 === 'rooke'); Object.assign(g0, { x: pos[0], y: pos[1], facing, solid: false, _g67rooke: true }, lk); return g0; }
    return fig(m, 'rooke', 'rooke', pos, Object.assign({ facing }, lk));
  }
  function freeG0(m) {
    const g0 = (m && m.entities || []).find((e) => e && e._p30 === 'g0' && e._g67rooke);
    if (!g0) return;
    const i = m.entities.indexOf(g0); m.entities.splice(i, 1);    // hollow30 puts its masked Grafter back where it stood
    try { if (typeof HOLLOW30 !== 'undefined') HOLLOW30.syncMap(m); } catch (e) { warnOnce('g0', e); }
  }
  const sawboys = (m, a, b, facing) => {
    fig(m, 'saw', 'townsman', a, Object.assign({ facing, scale: 0.86 }, look(TX.lookSawboy, TX.lookSawboyText)));
    if (b) fig(m, 'saw2', 'townsman', b, Object.assign({ facing, scale: 0.82 }, look(TX.lookSawboy, TX.lookSawboyText)));
  };
  const lyraFig = (m, pos, facing) => fig(m, 'lyra', 'lyra', pos, Object.assign({ facing, scale: 0.92 }, look(TX.lookLyra, TX.lookLyraText)));

  function stageHollow(m) {
    if (!m || m.id !== MAPS.hollow) return;
    const s = stage();
    if (s < 1 || s > 6) { drop(m); freeG0(m); return; }
    drop(m, (e) => e._g67 === 'wife' && s !== 2);
    if (s === 1) { rooke(m, AT.mouth.rooke, Math.PI, false); lyraFig(m, AT.mouth.lyra, 0); drop(m, (e) => /^saw/.test(e._g67)); }
    else if (s === 2) {
      rooke(m, AT.hob.rooke, Math.PI, false); lyraFig(m, AT.hob.lyra, 0); sawboys(m, AT.hob.saw, AT.hob.saw2, Math.PI);
      fig(m, 'wife', 'townswoman', AT.hob.wife, Object.assign({ facing: -Math.PI / 2 }, look(TX.lookWife, TX.lookWifeText)));
    } else if (s === 3) { rooke(m, AT.blue.rooke, 0, false); lyraFig(m, AT.blue.lyra, 0); sawboys(m, AT.blue.saw, AT.blue.saw2, 0); }
    else if (s === 6) { rooke(m, AT.lissa.rooke, 0, true); lyraFig(m, AT.lissa.lyra, Math.PI * 0.75); sawboys(m, AT.lissa.saw, AT.lissa.saw2, 0); }
    else { drop(m); freeG0(m); }   // 4 and 5: they are up at Orla Hale's
  }
  function stageCarders(m) {
    if (!m || m.id !== MAPS.carders) return;
    if (stage() !== 3) { drop(m); return; }
    const c = AT.carders;
    fig(m, 'pim', 'pim', c.pim, Object.assign({ facing: Math.PI / 2, scale: 0.6 }, look(TX.lookPim, TX.lookPimText)));
    fig(m, 'nell', 'nell', c.nell, Object.assign({ facing: 0 }, look(TX.lookNell, TX.lookNellText)));
    fig(m, 'rooke', 'rooke', c.rooke, Object.assign({ facing: -Math.PI * 0.75 }, look(TX.lookRooke, TX.lookRookeText)));
    lyraFig(m, c.lyra, -Math.PI * 0.75);
    sawboys(m, c.saw, null, Math.PI);
  }
  function stageOrla(m) {
    if (!m || m.id !== MAPS.orla) return;
    if (stage() !== 4) { drop(m); return; }
    const c = AT.orla;
    fig(m, 'rooke', 'rooke', c.rooke, Object.assign({ facing: Math.PI * 1.2 }, look(TX.lookRooke, TX.lookRookeText)));
    lyraFig(m, c.lyra, -Math.PI * 0.2);
    sawboys(m, c.saw, null, Math.PI);
  }
  function stageTown(m) {
    if (!m || m.id !== MAPS.town || !Array.isArray(m.entities)) return;
    const c = AT.street;
    if (marked() && partOne()) {
      const e = fig(m, 'mark', 'p30_sapmark', c.mark, { solid: false, scale: 0.8, radius: 0.1, facing: 0, use: 'p67_mark', label: TX.mark });
      e.look = F().p67_lane ? TX.markSeen : TX.markNot;
    } else drop(m, (e) => e._g67 === 'mark');
    if (stage() === 5) {
      fig(m, 'rooke', 'rooke', c.rooke, Object.assign({ facing: 0 }, look(TX.lookRooke, TX.lookRookeText)));
      lyraFig(m, c.lyra, 0);
      sawboys(m, c.saw, c.saw2, 0);
    } else drop(m, (e) => e._g67 !== 'mark');
  }
  const STAGERS = [[MAPS.hollow, stageHollow], [MAPS.carders, stageCarders], [MAPS.orla, stageOrla], [MAPS.town, stageTown]];
  function restage() {
    if (!hasG()) return;
    for (const [id, fn] of STAGERS) { const m = G.maps[id]; if (m) { try { fn(m); } catch (e) { warnOnce('stage ' + id, e); } } }
  }
  function go(id, at) {
    try { loadMap(id, { x: at[0], y: at[1], dir: at[2] || 0 }); } catch (e) { warnOnce('go ' + id, e); }
  }

  // ================================================================ 1 · the wagon
  const due = () => hasG() && stage() === 0 && partOne() && !guest() && day() === WINDOW.day && hour() >= WINDOW.from && hour() < WINDOW.to
    && G.mapId === MAPS.hollow && (typeof HOLLOW30 === 'undefined' || HOLLOW30.grafting());
  function begin() {
    if (stage() !== 0) return;
    setStage(1); jr(TX.jStart);
    stageHollow(G.map);
    wagonCard();
  }
  function wagonCard() {
    const pick = (w) => () => { F().p67_way = w; setStage(2); restage(); say(WAY_GONE[w], 'warn', 7000); };
    card(TX.wagonTitle, TX.wagon, [
      { t: TX.wayLyra, f: pick('lyra') },
      { t: TX.wayGrafters, f: pick('grafters') },
      { t: TX.wayWatch, f: pick('watch') },
    ]);
  }

  // ================================================================ 2 · Hob Wendle
  function hobCard() {
    if (stage() !== 2) return;
    const w = way();
    card(TX.hobTitle, TX.hob, HOB_CHOICES[w].map(([k, t]) => ({ t, f: () => {
      F().p67_hob = k;
      card(TX.hobTitle, TX.hob2 + '<br><br>' + HOB_DID[k] + '<br><br>' + TX.hobEnd, [{ t: TX.goOn, f: () => { setStage(3); restage(); say(TX.hintCarders, 'warn', 7000); } }]);
    } })));
  }
  function nearHob() {
    const r = keyed(G.map, 'lyra'); if (!r) return false;
    const c = Engine.cam, a = AT.hob.at;
    return Math.hypot(c.x - a[0], c.y - a[1]) <= HOB_NEAR;
  }

  // ================================================================ 3 · the Carders
  function pimCard() {
    if (stage() !== 3) return;
    card(TX.pimTitle, TX.pim + '<br><br>' + WAY_LINE.pim[way()], [{ t: TX.pimWait, f: () => {
      card(TX.pimTitle, TX.pim2, [{ t: TX.toOrla, f: () => { setStage(4); restage(); go(MAPS.orla, AT.orla.you); } }]);
    } }]);
  }

  // ================================================================ 4 · Orla Hale
  function orlaCard() {
    if (stage() !== 4) return;
    card(TX.orlaTitle, TX.orla + '<br><br>' + WAY_LINE.orla[way()], [{ t: TX.goOn, f: () => {
      card(TX.orlaTitle, TX.orla2, [{ t: TX.toLane, f: () => { setStage(5); restage(); go(MAPS.town, AT.street.you); } }]);
    } }]);
  }

  // ================================================================ 5 · the lane
  function laneCard() {
    if (stage() !== 5) return;
    F().p67_lane = 1;
    stageTown(G.map);
    card(TX.laneTitle, TX.lane + '<br><br>' + WAY_LINE.lane[way()] + '<br><br>' + TX.laneOn, [
      { t: TX.follow, f: () => toLissa() },
      { t: TX.rub, f: () => rubMark() },
    ]);
  }
  function rubMark() {
    F().p67_echo = true;
    const back = () => card(TX.laneTitle, TX.laneOn, [{ t: TX.follow, f: () => toLissa() }]);
    if (typeof RITE43 !== 'undefined' && RITE43.echo) RITE43.echo(TX.echo, back, TX.echoTitle, TX.echoGo);
    else card(TX.echoTitle, TX.echo, [{ t: TX.echoGo, f: back }]);
  }
  function toLissa() {
    setStage(6); restage(); go(MAPS.hollow, AT.lissa.you);
  }

  // ================================================================ 6 · Lissa, and home
  function lissaCard() {
    if (stage() !== 6) return;
    card(TX.lissaTitle, TX.lissa + '<br><br>' + WAY_LINE.lissa[way()], [{ t: TX.goOn, f: () => done() }]);
  }
  function done() {
    if (stage() !== 6) return;
    setStage(7); jr(J_DONE[way()]);
    try { questXp(25); } catch (e) { /* no xp */ }
    restage();
  }

  // ================================================================ leaving it, missing it
  const ALLOWED = { 1: [MAPS.hollow], 2: [MAPS.hollow], 3: [MAPS.hollow, MAPS.carders], 4: [MAPS.orla], 5: [MAPS.town, MAPS.orla], 6: [MAPS.hollow] };
  function leave() {
    const s = stage(); if (s < 1 || s > 6) return;
    const f = F(); f.p67_left = s; setStage(8);
    if (partOne()) { say(TX.left, 'warn', 6000); jr(TX.jLeft); }
    restage();
  }
  function miss() {
    if (stage() !== 0) return;
    setStage(9);
    if (partOne() && !guest()) jr(TX.jMissed);
    restage();
  }
  const pastWindow = () => day() > WINDOW.day || (day() === WINDOW.day && hour() >= WINDOW.to);

  // ================================================================ the tick, loading, uses
  function tick() {
    if (!hasG() || G.state !== 'play' || guest()) return;
    const s = stage();
    if (s === 0) { if (due()) begin(); else if (pastWindow()) miss(); return; }
    if (s > 6) return;
    if (pastWindow() || !partOne()) { leave(); return; }
    if (!ALLOWED[s].includes(G.mapId)) { leave(); return; }
    if (s === 2 && G.mapId === MAPS.hollow) { if (!keyed(G.map, 'lyra')) stageHollow(G.map); if (nearHob()) hobCard(); }
  }
  function onLoad() {
    if (!hasG()) return;
    try { restage(); } catch (e) { warnOnce('restage', e); }
    if (guest() || G.state === 'event') return;
    const s = stage(), id = G.mapId;
    const show = s === 1 && id === MAPS.hollow ? wagonCard : s === 3 && id === MAPS.carders ? pimCard : s === 4 && id === MAPS.orla ? orlaCard
      : s === 5 && id === MAPS.town ? laneCard : s === 6 && id === MAPS.hollow ? lissaCard : null;
    if (!show) return;
    if (R.restoring) R.carded = true;
    show();
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || e.use.indexOf('p67_') !== 0) return false;
    if (e.use === 'p67_look') {
      if (stage() === 2 && G.mapId === MAPS.hollow && (e._g67 === 'lyra' || e._g67rooke)) { hobCard(); return true; }
      say(e.look || e.label || '', '', 6000); return true;
    }
    if (e.use === 'p67_mark') { try { showEvent(e.label || TX.mark, e.look || TX.markNot, [{ t: TX.goOn, f: null }]); } catch (err) { warnOnce('mark', err); } return true; }
    return false;
  }
  function wire() {
    if (typeof update === 'function') { const _u = update; update = function () { const r = _u.apply(this, arguments); try { tick(); } catch (e) { warnOnce('update', e); } return r; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    // hollow30's figures (and its masked Grafter, who is Rooke here) are placed by its own loadMap wrapper first
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { onLoad(); } catch (e) { warnOnce('load', e); } return r; }; }
    // restoreGame loads the map (our loadMap wrapper may show the beat's card) and then sets G.state to 'play' under it
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () {
        R.restoring = true; R.carded = false;
        let r; try { r = _rg.apply(this, arguments); } finally { R.restoring = false; }
        try { if (R.carded) G.state = 'event'; else onLoad(); } catch (e) { warnOnce('restore', e); }
        return r;
      };
    }
    if (typeof passHours === 'function') { const _ph = passHours; passHours = function () { const r = _ph.apply(this, arguments); try { if (hasG()) restage(); } catch (e) { warnOnce('hours', e); } return r; }; }
  }
  try { wire(); } catch (e) { console.warn('grafters67 failed to wire', e); }

  return { TX, TEXTS, VO, AT, MAPS, WINDOW, stage, marked, way, begin, wagonCard, hobCard, pimCard, orlaCard, laneCard, rubMark, toLissa, lissaCard, done, leave, miss, tick, onLoad, restage };
})();
if (typeof window !== 'undefined') window.GRAFT67 = GRAFT67;
