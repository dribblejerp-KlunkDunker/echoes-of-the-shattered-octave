// ============================================================================
//  boots125 — Phase 125b: in their boots.
//
//  Six moments of Book One are played in the hero's own boots: Kaelen at the needle and the eight bolts, Lyra at the Hold
//  and the coda, Vane at One to Ten, Sable at the three names. In a hero's boots the player can do only what the hero did,
//  well or badly. A slip is the grey Echo (RITE43.echo): its card says "That is not how it went." and the book's own line,
//  "Again" starts the beat over, and after two slips on one beat it plays itself. A slip never changes what happens.
//  The captions are the book's narration, verbatim, past tense, third person (CAPS, each with its manuscript lines).
//
//    needle  js/rite43.js startNeedle -> Kaelen: the pinch with the glass thumb, the four pegs, still under Crane's look
//    hold    js/rite43.js startHold   -> Lyra: 174 from "Head at one span!" until "The lullaby stopped."
//    bolts   (chained)                -> Kaelen: the collar walk, the plate, fifty-one seconds, the one sentence, the coil
//    hold    (part two)               -> Lyra: through the lock on 174, "SING IT DOWN", the falling fifth
//    rope    js/rope45.js startCount  -> Vane: One to Ten; the axe at Five, the cut at Ten
//    names   js/manifest53.js         -> Sable: the three entries read, eyes on him and never on the Ledger
//    coda    js/coda.js ringEnter     -> Lyra: on her spot past the last lamp, singing, until the coda is sung alone
//
//  Also here: the flags p125b_* (validated on every load), the old-save migration of the traveller-sings coda (ruling b),
//  the calling lines (ruling g, unvoiced), and the hero's own hands behind GFX.heroHands ("Hands in a hero's boots").
//  Design: story/Game Layer/Phase 125b - In their boots (design, for the builder).md. Record: Phase 125b - In their boots.md.
//  No random numbers here (hashed noise only). Loaded after js/faces124.js and before js/mast123.js, which stays last.
// ============================================================================
'use strict';

const BOOTS125 = (function () {
  const TEXTS = [];
  const S_ = (t) => { if (!TEXTS.includes(t)) TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('boots125: ' + k + ' failed', e); } catch (x) { /* none */ } };
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const inExtra = () => { try { return typeof EXTRAS17 !== 'undefined' && !!EXTRAS17.inExtra(); } catch (e) { return false; } };
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const plain = (t) => String(t).replace(/<\/?(i|b|em)>/gi, '');
  const hash = (n) => { let h = (n | 0) * 374761393 + 668265263; h = (h ^ (h >>> 13)) * 1274126177; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ---------------------------------------------------------------- the switch: the hero's own hands, or yours
  const FLAG = 'heroHands';
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = true;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const handsOn = () => typeof GFX === 'undefined' || GFX[FLAG] !== false;

  // ---------------------------------------------------------------- the words
  const TX = {
    hisBoots: S_('In his boots'),
    herBoots: S_('In her boots'),
    notHow: S_('That is not how it went.'),
    stepOut: S_('Step back into your own boots.'),
    kneel: S_('Kneel.'),
    pinchHint: S_('Hold to pinch. Let go to drive the needle.'),
    pegsHint: S_('The pegs: one, two, three, four.'),
    sing: S_('Sing.'),
    holdHint: S_('Hold one hundred and seventy-four.'),
    toolbag: S_('Pick up the toolbag.'),
    plateHint: S_('Kneel at the plate.'),
    rail: S_('The rail.'),
    takeAxe: S_('Take the axe.'),
    cut: S_('Cut.'),
    read: S_('Read.'),
    eyes: S_('Keep your eyes on him.'),
    walkOut: S_('Walk out to the willows, and stand.'),
    stay: S_('Stay where you are. Keep singing.'),
    optLabel: S_('Hands in a hero\'s boots'),
    optHero: S_('the hero\'s own'),
    optYours: S_('yours'),
    optHint: S_('in a hero\'s boots, the hands you see are theirs, or your own'),
  };

  // the book's lines: key -> { t, ms: manuscript lines (Book One, the full manuscript), vo: recorded voices }
  const CAPS = {};
  const C = (k, t, ms, vo) => { CAPS[k] = { t: S_(t), ms: ms || null, vo: vo || null }; const p = plain(t); if (p !== t) S_(p); return k; };
  // ---- the needle (MS 3044-3110)
  C('n_kneel', 'And Kaelen Vance came across the platform and knelt down on the boards in front of her stool and picked up the needle, and Lyra looked at his hands. They were shaking.', [3044, 3046]);
  C('n_turn', 'She turned her head a little to the side, and lifted her chin, and offered him her throat. <i>Get on with it.</i> He got on with it.', [3068, 3070, 3072]);
  C('n_closer', '"Closer, Engineer," said Ignatius Crane, from the catwalk. "I must be able to see."', [3074], ['ignatius.rite.closer']);
  C('n_glass', 'He held it flat against the side of her neck, thumb along the line of the muscle, the way the Tuning Men had done it. The glass was cold. She flinched and made herself still.', [3076]);
  C('n_collar', 'He drew it to the second notch, which was one notch looser than it should have been, and buckled it there.', [3078]);
  C('n_needle', 'Kaelen put the needle in a fold of skin.', [3084]);
  C('n_rigid', 'Lyra\'s whole body went rigid. Her hands closed on the edges of the stool until the knuckles went white.', [3086]);
  C('n_blood', 'Blood came at once.', [3088]);
  C('n_good', '<i>Good</i>, Kaelen thought, with the sick clarity of a man doing arithmetic. <i>It has to bleed.</i>', [3090]);
  C('n_pegs', 'He took the tuning key from the case and set the pegs — one, two, three, four — turning each a half-turn, and with every turn the wire tightened against the skin, and Lyra\'s eyes watered and did not close.', [3092]);
  C('n_down', 'The Inquisitor came down the ladder from the catwalk.', [3094]);
  C('n_still', 'Kaelen did not move. He could hear his own arm ringing under the felt, high and fast.', [3096]);
  C('n_speak', '"Blood," said Ignatius. He sounded satisfied. "Good. It should bleed a little at the seating. The Foundry girls used to bleed for days." He straightened. "Speak, daughter."', [3098], ['ignatius.rite.blood', 'ignatius.rite.speak']);
  C('n_fort', '"I. Am. Fortunate."', [3104], ['lyra_fortunate.rite.fortunate']);
  C('n_note', 'One hundred and seventy-four, all the way through. Not a hair off.', [3106]);
  C('n_heel', 'Kaelen had to put the heel of his right hand against the boards for a moment.', [3108]);
  C('n_sheis', '"She is," said Ignatius Crane, pleased, and blessed her with two fingers, and went back up the ladder.', [3110], ['ignatius.rite.sheis']);
  C('n_fast', 'He did it fast, because slow would look wrong.', [3086]);
  C('n_moved', 'Kaelen did not move.', [3096]);
  // ---- the Hold, part one (MS 3114-3136) and part two (3208-3240)
  C('h_sing', 'And Lyra Ashgrove, sitting on a stool on a platform four hundred feet under Oakhaven in a white shift with blood on the collar, began to sing.', [3122]);
  C('h_span', '"Head at one span! One span and holding!"', [3116], ['tobiah.rite.span']);
  C('h_onenote', '"One note," he said. "One law. One hand."', [3118], ['ignatius.open.onenote']);
  C('h_chain', 'The chain creaked.', [3120]);
  C('h_steady', 'One hundred and seventy-four. Clear, and hoarse, and absolutely steady.', [3124]);
  C('h_heard', 'The Root heard her in the first minute.', [3128]);
  C('h_matching', '"Pitch coming up," said Tobiah, at the gauges, delighted. "It\'s coming up to her, sir. It\'s — gods, look at it — it\'s matching."', [3132], ['tobiah.rite.matching']);
  C('h_markit', '"Mark it," said the Factor from the rail, and wrote in her own book.', [3134], ['vosk.rite.markit']);
  C('h_stopped', 'The lullaby stopped.', [3136]);
  C('h_lock', 'The lock threw.', [3208]);
  C('h_catwalk', 'On the catwalk, the Inquisitor was on his knees with the chain wrapped round his fist.', [3216]);
  C('h_holdnote', '"<i>The hold!</i>" he was shouting. "<i>Hold the note! Daughter — hold the note!</i>"', [3218], ['ignatius.rite.holdnote']);
  C('h_singitdown', '"LYRA! <i>SING IT DOWN!</i>"', [3228], ['kaelen.rite.singitdown']);
  C('h_result', 'She let it fall.<br><br>He heard the moment the note bent: the Root note sliding down a whole fifth, slow as a leaf coming off a branch, in a torn hoarse voice with blood on the collar of her shift — and then climbing, and falling again, the small patient village trick out of the margin of a dead man\'s notebook. <i>Down. Go back where you came from.</i><br><br>And then, very slowly, like a man who has stood up too fast and sits down again, it let go of the question.', [3232, 3234, 3240]);
  C('h_stop', 'Because the note <i>was</i> still going … because she was a Cantor and the last thing a Cantor does is stop.', [3220]);
  // ---- the eight bolts (MS 3126, 3156-3204)
  C('b_rail', 'Kaelen stood at the calibration rail with his toolbag at his feet and listened to her do it, and understood two things at once: that she was very good … and that she had four hours of it ahead of her with a torn throat and a wire through her skin, and that she would not stop, and that this was somehow worse.', [3126]);
  C('b_fuse1', 'If the hold failed, the Sequence would not stop. The slippage — the whole shuddering harmonic recoil of a bore in a living casing — would go into the source. Into her.', [3156]);
  C('b_fuse2', 'She was not the hand that steadied the patient.', [3158]);
  C('b_fuse3', 'She was the fuse.', [3160]);
  C('b_walk', 'Kaelen picked up his toolbag and walked along the collar walk to the drum.', [3172]);
  C('b_sir', '"Sir?" Tobiah, trotting after him. "Sir, the readings are perfect, they\'ve never been—"', [3176]);
  C('b_slippage', '"Slippage on the lock," said Kaelen. "I can hear it."', [3178], ['kaelen.rite.slippage']);
  C('b_could', 'He could not, and the boy would know that he could not; the lock was singing like a bell in tune.', [3180]);
  C('b_yes', '"Yes, sir," said Tobiah. "What do you want?"', [3182]);
  C('b_spanner', '"Spanner. Sit on the rail there and call the pitch to me every ten seconds."', [3184], ['kaelen.rite.spanner']);
  C('b_bolts', 'The plate over the phase port had eight bolts. He had promised himself forty seconds and he took fifty-one … and nobody stopped him, because he was the supervising engineer, and he was doing what supervising engineers do.', [3186]);
  C('b_plate', 'The plate came off. He laid it down quietly.', [3188]);
  C('b_coil', 'He put his hand into his toolbag and took out the reverse-phase coil.', [3192]);
  C('b_what', '"Sir," said Tobiah. His voice had changed. "Sir, what\'s that?"', [3194], ['tobiah.rite.whatsthat']);
  C('b_seconds', 'He had perhaps two seconds and one sentence.', [3200]);
  C('b_holdOn', 'You\'ll want to hold onto something.', [3202], ['kaelen.rite.holdon']);
  C('b_seat', 'And he seated the coil in the port.', [3204]);
  // ---- One to Ten (MS 3716-3810)
  C('r_up', '"<i>Take her up</i>," Vane said. … She went sideways.', [3716, 3720], ['vane.rope.takeup']);
  C('r_heart', 'It happened the way it always happens: slowly, and then in about ten heartbeats.', [3724]);
  C('r_snag', 'The rope went into the branches. Then the rope snagged.', [3728]);
  C('r_arith', 'Everything after that was arithmetic.', [3730]);
  C('r_pennick', 'Pennick was howling. "The drum — Captain, the drum\'s coming out of the <i>deck</i>—"', [3732], ['engineer.rope.drum']);
  C('r_n1', '<i>One.</i> Twenty-one people on the deck. Nine of them children. A boy in the hold with his ear against a crate.', [3734, 3736], ['vane.rope.n1']);
  C('r_n2', '<i>Two.</i> The old woman on the line had got her feet onto the branches and was trying to get one of the carters off the rope and into the tree, which would have been clever if the tree had been a tree and not the thing that was eating the town.', [3738, 3740], ['vane.rope.n2']);
  C('r_n3', '<i>Three.</i> Mags, at the winch, with the axe already in her fist because she had been at sea for thirty years and knew exactly what came next, and she was looking at him, and she was not going to swing it without an order, because she never had.', [3742, 3744], ['vane.rope.n3']);
  C('r_n4', '<i>Four.</i> The deck-beam under the drum went off like a musket.', [3746, 3748], ['vane.rope.n4']);
  C('r_n5', '<i>Five.</i>', [3750], ['vane.rope.n5']);
  C('r_took', 'Vane took the axe out of Mags\'s hands, because if it was going to be anyone it was going to be him.', [3752]);
  C('r_n6', '<i>Six.</i> And Kaelen Vance came up beside him at the rail and looked down the line at his father.', [3754, 3756], ['vane.rope.n6']);
  C('r_n7', '<i>Seven.</i> Aldric Vance looked up.', [3758, 3760], ['vane.rope.n7']);
  C('r_n7b', 'It was forty feet. Vane could see his face perfectly well. He was a big old man with a jaw like a gate-post and grey hair combed long over one temple, and he looked up past four people at a ship that was coming down onto a tree, and he understood the arithmetic faster than Vane had, because he had been a Governor for thirty years and it is all any of them ever do.', [3762]);
  C('r_n8', '<i>Eight.</i> He let go of the rope with one hand, and raised it, palm out, the way a man waves a cart on past a hole in the road.', [3764, 3766], ['vane.rope.n8']);
  C('r_n9', '<i>Nine.</i> "Do it," said Kaelen.', [3768, 3770], ['vane.rope.n9', 'kaelen.rope.doit']);
  C('r_n10', '<i>Ten.</i>', [3772], ['vane.rope.n10']);
  C('r_cut', 'Vane cut the line.', [3774]);
  C('r_nothing', 'Nothing came up at all.', [3804]);
  C('r_after', 'She came up like a cork.<br><br>Vane kept his feet, because he had the rail.<br><br>So he was the only one who saw it, except Kaelen, who did not look away either: five people falling forty feet into a canopy that had not existed that morning, and the canopy closing over them, and a sound that the wind took most of.<br><br>Then there was nothing down there but leaves.<br><br>He stood at the rail with the axe still in his hand until Mags came and took it off him, gently, the way you take a cup off a drunk.<br><br>There was six feet of rope hanging from the winch drum, cut clean, swinging.<br><br>Nobody coiled it. It hung there for six days.', [3778, 3782, 3784, 3786, 3798, 3808, 3810]);
  C('r_early', '<i>Ten.</i> Vane cut the line.', [3772, 3774]);
  C('r_late', '"Do it," said Kaelen.', [3770]);
  // ---- the three names (MS 4548-4572)
  C('s_vane', 'Vane sat on a crate in his own hold with an empty bottle in his hand and looked at a woman with a broken nose in the lantern-light.', [4548]);
  C('s_goon', '"Go on, then," he said.', [4550], ['vane.manifest.goon']);
  C('s_ledger', 'The Bound Ledger came round in front of her and opened itself, and she did not look at it.', [4554]);
  C('s_corwin', '"Entry thirty-nine thousand, eight hundred and two," said Sable. "Corwin Aye. Fifty-three. Cooper of the Ashlane, and a good one; there is a barrel in the Moot-house cellar with his mark burned into the head and it has not leaked in nineteen years. Taken on the fourth day of the harvest, in the ninth hour. He was pressed in the second room because the first room had a queue. What he said at the door was: <i>will I be able to keep my hands?</i>" She paused exactly long enough. "He carried in the second consignment, Captain. Your sixteen crates. He was in your hold for eleven days."', [4556], ['sable.manifest.corwin', 'sable.manifest.corwin2', 'sable.manifest.corwin3']);
  C('s_still', 'Vane did not move.', [4558]);
  C('s_mirren', '"Entry forty thousand, nine hundred and ninety-one. Mirren Salk. Twenty-six. Wheelwright\'s widow, of the Bell Yard, four months a widow when the drills came. Taken on the ninth day. She was carrying her husband\'s coat over her arm and she asked whether she might keep it, and the clerk said that she might, and it was taken off her at the door of the pressing room and put in a bin with eleven hundred other coats." Sable\'s voice stayed perfectly flat. "She is in the stack behind you. Fourth consignment."', [4560], ['sable.manifest.mirren', 'sable.manifest.mirren2', 'sable.manifest.mirren2b', 'sable.manifest.mirren3']);
  C('s_lantern', 'The lantern hissed.', [4562]);
  C('s_annet', '"Entry forty-one thousand and six," said Sable. "Annet Sowerby. Six years old. Daughter of Hesper and Tam Sowerby of the Cloister road. Taken on the eleventh day, in the hour after noon, with the rest of the little ones from the Cloister of the Lost Choir, because the Office had a requisition for small clear voices and the Cloister had forty-one of them in a choir under one roof." A beat. "She was third in the line. She would not let go of the hand of the boy in front of her, and rather than make a scene in front of forty children, the proctors took the two of them into the room together and pressed them in the same hour. I wrote both entries. Hers is legible. His is not, because my hand had begun to shake by then, and I have never been able to read the surname since, and there is no one left in this city to ask."', [4564], ['sable.manifest.annet', 'sable.manifest.annet2', 'sable.manifest.annet2b', 'sable.manifest.annet3', 'sable.manifest.annet3b', 'sable.manifest.annet4']);
  C('s_breath', 'Vane heard, from somewhere very close by, the sound of a man\'s breath going out of him and not coming back in. It was his own.', [4566, 4568]);
  C('s_third', '"She\'s in the third crate," he said. "Second row, corner. She talks to a boy. He\'s seven. He\'s asleep against that crate right now."', [4570], ['vane.manifest.third']);
  C('s_iknow', '"I know," said Sable. "Your engineer told me. It is why I came up the ladder."', [4572], ['sable.manifest.iknow']);
  // ---- the coda (MS 6040-6154): the ring's own lines are RING_TX in js/coda.js; these are the step in and the slips
  C('c_walk', 'She walked out past the last lamp at the second hour and stood in the moss between two silver willows with her hands at her sides.<br><br>And she sang her father\'s funeral.', [6040, 6042]);
  C('c_further', '"… It\'ll circle, and it\'ll use voices, and it will do everything it can to make me walk further out."', [6028]);
  C('c_iknow', '"I know," said Lyra, and kept singing.', [6076], ['lyra_ruined.ring.iknow']);
  const RING_MS = { sang: [6048], line1: [6050], quiet: [6052], line2: [6054], going: [6056], line3: [6058], second: [6060], harmony: [6066], thirty: [6072], lark: [6074], iknow: [6076], waited: [6078], naming: [6080], nearer: [6082], come: [6084], ten: [6088], twoVoice: [6090], alone: [6092],
    apart: [6096], struck: [6098], struckAlone: [6098], burst: [6100], ate: [6102], v1: [6104], v2: [6106], v3: [6108], v4: [6110], v5: [6112], under: [6114], underneath: [6116], still: [6118], stood: [6120], lastWord: [6122], larkLast: [6124], nothing: [6126],
    satDown: [6130], legs: [6132], thatsIt: [6134], lyraName: [6136], endOfHim: [6138], nothingAtAll: [6140], saySomething: [6142], no: [6144], kaelenName: [6146], sitHere: [6148], sat: [6150], satAlone: [6150], hand: [6152], both: [6154] };
  try { if (typeof RING_TX === 'object') for (const k in RING_TX) { if (RING_MS[k]) C('ring_' + k, RING_TX[k], RING_MS[k]); else S_(RING_TX[k]); } } catch (e) { warnOnce('ring text', e); }

  // ---------------------------------------------------------------- the calling lines (ruling g): [before, after], unvoiced
  const CALLING = {
    blade: {
      needle: [S_('Near the glass channels your own wrapped hand rings, very faintly, the way it rang the night it took the seam. You keep it in your coat.'), S_('You saw which thumb did the pinching. A glass hand is no good for fine work, and that one did the finest thing in the room.')],
      bolts: [S_('Through your wrapped hand the lock sounds clean to you: a bell in tune. You would not have called it slipping.'), S_('The lock is out of tune now. Your hand tells you before your ears do, and then it will not stop telling you.')],
    },
    cantor: {
      hold: [S_('One hundred and seventy-four. You have held it yourself at a bedside, for as long as a breath would let you. You listen for the place where hers will waver.'), S_('It never wavered. Then down a whole fifth and back, in a torn voice. You could not have done it with a whole one.')],
      coda: [S_('You were taught the office as every cantor is: five parts and one coda, and the close is two voices. You have never heard it sung without the second.'), S_('She did the close alone. You did not know it could be done.')],
    },
    corsair: { rope: [S_('You start counting, the way a hand counts on a deck in a blow. Not because it helps.'), S_('Ten. You counted it with him. There are six feet of rope on the drum, and nobody coils it, and on any deck you ever worked nobody would ask why.')] },
    archivist: { names: [S_('You know the form for this: the entry, the name, the age, the trade, the day and the hour, and the last thing said at the door. She has no pen out.'), S_('Three entries, and not one word of them written down. The Office has no form for reading an entry back to the man who carried it.')] },
    penitent: { needle: [S_('You know the rubric before he reads it. Blessed is the single note. Blessed is the throat that holds it. You do not move your lips.'), S_('He blessed her with two fingers, as the rubric has it. You have seen it done before, in a far parish, and the words were the same.')] },
    quarry: { bolts: [S_('The chains come down a notch and the grinding changes its note. You know what a bore sounds like when it is biting well. This is it biting well.'), S_('You heard the crown go: the teeth snapping inside the wood like a bell breaking. Nobody who has worked a face forgets that sound.')] },
  };
  function callingLines(cls, m) { const c = CALLING[cls]; return c && c[m] ? c[m].slice() : null; }
  const callingOf = () => { try { return G.player.cls && G.player.cls.id; } catch (e) { return null; } };

  // ---------------------------------------------------------------- the heroes: their looks [PROPOSED where the book is silent]
  // skin: each hero's portrait tone (img/p_kaelen.jpg and the rest, sampled and lifted to the hands' light)
  const HEROES = {
    kaelen: { glass: true, skin: [176, 147, 123], sleeve: { material: 'felt', col: [96, 84, 70], cuff: [66, 56, 46] } },   // the felt sleeve (MS 3096, 646)
    lyra: { glass: false, skin: [197, 148, 106], sleeve: { material: 'linen', col: [226, 220, 204], cuff: [196, 188, 170] } },   // the white wool shift (3088, 3122)
    vane: { glass: false, skin: [172, 133, 99], sleeve: { material: 'leather', col: [72, 56, 44], cuff: [48, 36, 28] } },   // his coat (1361, 1538)
    sable: { glass: false, skin: [188, 164, 146], sleeve: { material: 'linen', col: [64, 62, 66], cuff: [44, 42, 46] } },
  };
  function heroLook(own, hero) {
    const GL = GEARLOOK21, H = HEROES[hero]; if (!H || !GL) return null;
    const mul = (c, k) => c.map((v) => Math.max(0, Math.min(255, Math.round(v * k))));
    const sleeve = Object.freeze(Object.assign({ rolled: false }, H.sleeve));
    const body = Object.freeze(Object.assign({}, own.body, { bare: false, sleeve }));
    const wid = S.weapon || 'hands', wE = (GL.WEAPONS && GL.WEAPONS[wid]) || own.weapon;
    return Object.freeze(Object.assign({}, own, {
      skin: H.skin, skinShade: mul(H.skin, 0.72), glassArm: H.glass, hands: GL.BARE.hands, body, shield: null, shieldStowed: false, cape: null,
      weapon: wE, offhand: null, twoHanded: false, key: own.key + '|b125:' + hero + ':' + wid,
    }));
  }

  // ---------------------------------------------------------------- state
  const MOMENTS = { needle: 1, hold: 2, bolts: 3, rope: 4, names: 5, coda: 6 };
  const BIT = { needle: 1, hold: 2, bolts: 4, rope: 8, names: 16, coda: 32 };
  const S = { at: null, part: 1, beat: null, bi: -1, t: 0, clock: 0, home: null, anchor: null, opts: null, def: null, card: false, wait: false, slips: {}, auto: {}, log: [], input: { use: false, song: false }, press: 0, held: 0, weapon: null, x: {} };
  const stats = { props: 0, slips: 0 };
  const active = () => S.at;

  const msgMs = (t) => Math.max(3200, Math.min(14000, 2200 + plain(t).length * 45));
  function vo(ids) { if (!ids || !ids.length) return; try { if (typeof RITE43 === 'object' && RITE43.seq) RITE43.seq(ids); } catch (e) { warnOnce('voice', e); } }
  function caption(k) {
    const c = CAPS[k]; if (!c) return;
    try { msg(plain(c.t), 'voice', msgMs(c.t)); } catch (e) { /* cosmetic */ }
    S.log.push({ m: S.at, k, ms: c.ms }); if (S.log.length > 400) S.log.splice(0, 100);
    vo(c.vo);
  }
  function captionText(t, ids) {   // a line from elsewhere (the ring's own RING_TX): shown and logged the same way
    try { msg(plain(t), 'voice', msgMs(t)); } catch (e) { /* cosmetic */ }
    const k = Object.keys(CAPS).find((x) => CAPS[x].t === t);
    S.log.push({ m: S.at, k: k || null, ms: k ? CAPS[k].ms : null }); vo(ids);
  }
  const hint = (t) => { try { msg(t, 'warn', 6000); } catch (e) { /* cosmetic */ } };
  function card(title, body, choices) {
    S.card = true;
    const hushed = (choices || []).map((c) => ({ t: c.t, f: function () { S.card = false; try { if (typeof RITE43 === 'object' && RITE43.hush) RITE43.hush(); } catch (e) { /* none */ } return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(title, body, hushed); } catch (e) { S.card = false; warnOnce('card', e); }
  }
  const title = () => (S.def && S.def.she ? TX.herBoots : TX.hisBoots);

  // the scenes' own figures and places
  const R43 = () => (typeof RITE43 === 'object' ? RITE43 : null);
  const ent43 = (k) => { try { return G.ents.find((e) => e && e._r43 === k) || null; } catch (e) { return null; } };
  const ent45 = (k) => { try { return G.ents.find((e) => e && e._r45 === k) || null; } catch (e) { return null; } };
  const V = () => (R43() ? R43().V : {});
  const lookDeg = () => Math.atan2(Engine.cam.pitch || 0, 160 / 0.66) * 180 / Math.PI;   // the look angle (js/r3d21.js: FX = 242.42)

  // ================================================================ the moments
  const DEF = {};
  // ---- 1 · the needle: Kaelen
  DEF.needle = {
    hero: 'kaelen', she: false, map: 'rootvault',
    place() { const v = V(); return { x: v.kaelenStool[0], y: v.kaelenStool[1], dir: Math.atan2(v.stool[1] - v.kaelenStool[1], v.stool[0] - v.kaelenStool[0]), pitch: -28 }; },
    hide: () => [ent43('kaelen')],
    card: 'n_kneel', go: TX.kneel,
    beats: [
      { k: 'turn', cap: ['n_turn'], dur: 5 },
      { k: 'closer', cap: ['n_closer'], dur: 4 },
      { k: 'glass', cap: ['n_glass'], dur: 5 },
      { k: 'collar', cap: ['n_collar'], dur: 4 },
      { k: 'pinch', hint: TX.pinchHint, prop: 'needle',
        tick(dt) { if (S.input.use) S.held += dt; if (S.held > 1.6) return slip('n_fast'); },
        until: () => S.x.released, onInput(n, down) { if (n === 'use' && !down && S.held > 0) S.x.released = true; } },
      { k: 'needle', cap: ['n_needle', 'n_rigid'], dur: 5, prop: 'needle' },
      { k: 'blood', cap: ['n_blood', 'n_good'], dur: 5, prop: 'needle' },
      { k: 'pegs', cap: ['n_pegs'], hint: TX.pegsHint, prop: 'key', until: () => S.press >= 4, autoDur: 2 },
      { k: 'down', cap: ['n_down'], dur: 3.5, tick: () => craneTo('crouch') },
      { k: 'look', cap: ['n_still'], dur: 4, still: 'n_moved', tick: () => craneTo('crouch') },
      { k: 'speak', cap: ['n_speak'], dur: 6, still: 'n_moved', tick: () => craneTo('crouch') },
      { k: 'fortunate', cap: ['n_fort', 'n_note'], dur: 5, still: 'n_moved', tick: () => craneTo('crouch') },
      { k: 'heel', cap: ['n_heel'], dur: 3, tick: () => craneTo('crouch') },
      { k: 'sheis', cap: ['n_sheis'], dur: 4, tick: () => craneTo('catwalk') },
    ],
    leave() { craneTo('catwalk', true); },
  };
  function craneTo(where, now) {
    const cr = ent43('crane'), v = V(); if (!cr || !v.crane) return;
    const goal = where === 'crouch' ? [v.stool[0] - 0.55, v.stool[1] - 0.75] : v.crane[0];
    const dx = goal[0] - cr.x, dy = goal[1] - cr.y, d = Math.hypot(dx, dy), step = now ? d : Math.min(d, 0.05);
    if (d > 1e-3) { cr.x += dx / d * step; cr.y += dy / d * step; }
    cr.facing = Math.atan2(v.stool[1] - cr.y, v.stool[0] - cr.x);
  }
  // ---- 2 · the Hold: Lyra (part one, then part two after the bolts)
  const FLAT = (secs) => [[0, 174], [secs, 174]];
  DEF.hold = {
    hero: 'lyra', she: true, map: 'rootvault', pose: 'stool',
    place() { const v = V(); return { x: v.stool[0], y: v.stool[1] + 0.05, dir: Math.atan2(v.drum[1] - v.stool[1], v.drum[0] - v.stool[0]), pitch: -16 }; },
    hide: () => [ent43('lyra')],
    card: () => (S.part === 2 ? 'h_lock' : 'h_sing'), go: TX.sing,
    beats: () => (S.part === 2 ? HOLD2 : HOLD1),
    next: () => (S.part === 2 ? null : 'bolts'),
  };
  const HOLD1 = [
    { k: 'span', cap: ['h_span'], dur: 3.5 },
    { k: 'onenote', cap: ['h_onenote'], dur: 3 },
    { k: 'chain', cap: ['h_chain'], dur: 2 },
    { k: 'sing', cap: ['h_steady'], hint: TX.holdHint, pitch: { curve: FLAT(22), duration: 22 }, slipLine: 'h_stop' },
    { k: 'heard', cap: ['h_heard'], dur: 3 },
    { k: 'matching', cap: ['h_matching'], dur: 4 },
    { k: 'markit', cap: ['h_markit'], dur: 3 },
    { k: 'stopped', cap: ['h_stopped'], dur: 2.5 },
  ];
  const HOLD2 = [
    { k: 'catwalk', cap: ['h_catwalk'], dur: 3 },
    { k: 'holdnote', cap: ['h_holdnote'], dur: 3 },
    { k: 'through', hint: TX.holdHint, pitch: { curve: FLAT(6), duration: 6 }, slipLine: 'h_stop' },
    { k: 'singitdown', cap: ['h_singitdown'], dur: 2 },
    { k: 'fifth', pitch: { curve: null, duration: 9, fifth: true } },
    { k: 'result', result: true },
  ];
  // ---- 3 · the eight bolts: Kaelen
  DEF.bolts = {
    hero: 'kaelen', she: false, map: 'rootvault',
    place() { const v = V(); return { x: v.cx - 1.4, y: v.cy - 1.2, dir: Math.atan2(v.kaelenDrum[1] - (v.cy - 1.2), v.kaelenDrum[0] - (v.cx - 1.4)), pitch: -6 }; },
    hide: () => [ent43('kaelen')],
    card: () => ['b_rail', 'b_fuse1', 'b_fuse2', 'b_fuse3'], go: TX.toolbag,
    beats: [
      { k: 'walk', cap: ['b_walk'], walk: true, timed: [[1.5, 'b_sir'], [3.5, 'b_slippage'], [5.5, 'b_could'], [7.5, 'b_yes'], [9.0, 'b_spanner']],
        tick() { tobiahTo(); }, until: () => S.t >= 9.2 && atDrum(), autoDur: 9.2, autoDo: () => toDrum() },
      { k: 'kneel', hint: TX.plateHint, prop: 'spanner', enter: () => toDrum(), until: () => S.press >= 1, autoDur: 1.5 },
      { k: 'bolts', cap: ['b_bolts'], dur: (typeof RITE43 === 'object' && RITE43.consts && RITE43.consts.BOLT_SECS) || 51, prop: 'spanner',
        tick() { const n = Math.floor(S.t / 10); if (n >= 1 && n <= 5 && (S.x.calls | 0) < n) { S.x.calls = n; pitchCall(n); } } },
      { k: 'plate', cap: ['b_plate'], dur: 3, prop: 'spanner' },
      { k: 'coil', cap: ['b_coil'], dur: 3, prop: 'coil' },
      { k: 'choice', prop: 'coil', choice: { body: ['b_what', 'b_seconds'], go: 'b_holdOn' } },
      { k: 'seat', cap: ['b_seat'], dur: 2.5, prop: 'coil', enter: () => { try { if (S.opts && S.opts.seat) S.opts.seat(); } catch (e) { warnOnce('seat', e); } } },
    ],
    next: () => 'hold2',
  };
  const atDrum = () => { const v = V(); return !!v.kaelenDrum && dist(Engine.cam.x, Engine.cam.y, v.kaelenDrum[0], v.kaelenDrum[1]) < 1.3; };
  function toDrum() { const v = V(); if (!v.kaelenDrum) return; Engine.cam.x = v.kaelenDrum[0]; Engine.cam.y = v.kaelenDrum[1]; Engine.cam.dir = Math.atan2(v.drum[1] - v.kaelenDrum[1], v.drum[0] - v.kaelenDrum[0]); Engine.cam.pitch = 242.42 * Math.tan(-30 * Math.PI / 180); S.anchor = { x: Engine.cam.x, y: Engine.cam.y }; }
  function tobiahTo() { const tb = ent43('tobiah'), v = V(); if (!tb || !v.tobiahDrum) return; const dx = v.tobiahDrum[0] - tb.x, dy = v.tobiahDrum[1] - tb.y, d = Math.hypot(dx, dy); if (d > 0.02) { const s = Math.min(d, 0.04); tb.x += dx / d * s; tb.y += dy / d * s; } }
  function pitchCall(n) {
    const R = R43(); if (!R) return;
    const k = n === 2 ? 'pitchCall2' : 'pitchCall';
    try { msg(R.TX[k], 'voice', 5000); } catch (e) { /* cosmetic */ }
    vo(R.VO && R.VO[k]);
  }
  // ---- 4 · One to Ten: Vane
  const TICK = 2.4;
  const num = (n, extra) => Object.assign({ k: 'n' + n, cap: ['r_n' + n], dur: TICK }, extra || {});
  const takeAxe = () => { if (!S.x.took) { S.x.took = true; S.weapon = 'axe'; caption('r_took'); } };
  DEF.rope = {
    hero: 'vane', she: false, map: () => (typeof ROPE45 === 'object' ? ROPE45.DECK : null), pose: 'rail',
    place() { const R = ROPE45, a = R.AT.vaneCut, l = R.AT.line; return { x: a[0], y: a[1], dir: Math.atan2(l[1] - a[1], l[0] - a[0]), pitch: -14 }; },   // at the rail, looking down the line
    hide: () => [ent45('vane')],
    card: 'r_up', go: TX.rail,
    beats: [
      { k: 'heart', cap: ['r_heart'], dur: 2.5 },
      { k: 'snag', cap: ['r_snag'], dur: 2.5 },
      { k: 'arith', cap: ['r_arith'], dur: 2 },
      { k: 'pennick', cap: ['r_pennick'], dur: 2.5 },
      num(1), num(2), num(3), num(4),
      num(5, { hint: TX.takeAxe, onPress: takeAxe, end: () => (S.x.took ? true : slip('r_took') && false), autoDur: TICK, autoDo: takeAxe }),
      num(6, { onPress: () => slip('r_early') }), num(7, { timed: [[1.2, 'r_n7b']], dur: 4, onPress: () => slip('r_early') }), num(8, { onPress: () => slip('r_early') }), num(9, { onPress: () => slip('r_early') }),
      { k: 'n10', cap: ['r_n10'], hint: TX.cut, onPress() { S.x.cut = true; }, until: () => !!S.x.cut, tick() { if (S.t > 2.5 && !S.x.cut) return slip('r_late', 'n9'); }, autoDur: 1.0, autoDo: () => { S.x.cut = true; } },
      { k: 'after', enter: () => cutLine(), dur: 3.5, onSong: () => { try { msg(plain(CAPS.r_nothing.t), 'voice', 4000); } catch (e) { /* cosmetic */ } S.log.push({ m: S.at, k: 'r_nothing', ms: CAPS.r_nothing.ms }); } },
      { k: 'card', result: 'r_after' },
    ],
  };
  function cutLine() {
    caption('r_cut');
    try { if (typeof ROPE45 === 'object' && ROPE45.cut) ROPE45.cut({ boots: true }); } catch (e) { warnOnce('cut', e); }
  }
  // ---- 5 · the three names: Sable
  // an entry lasts as long as Sable takes to read it (its recordings, when there are any, and a breath after)
  const spoken = (k, min) => { let d = 0; try { for (const id of CAPS[k].vo || []) { const l = VOICE_ACT.LINES[id]; if (l && l.d) d += l.d + 0.3; } } catch (e) { d = 0; } return Math.max(min, d + 1.2); };
  const ENTRY = (k, min) => {
    const read = () => { if (!S.x.read) { S.x.read = true; S.x.readT = S.t; caption('s_' + k); } };
    return { k, until: () => !!S.x.read && S.t - S.x.readT >= spoken('s_' + k, min), autoDur: min, onPress: read, autoDo: read,
      tick() { if (S.x.read && lookDeg() < -12) return slip('s_ledger'); } };
  };
  DEF.names = {
    hero: 'sable', she: true, map: () => (typeof MANIFEST53 === 'object' ? MANIFEST53.HOLD : null), pose: 'lid',
    place() { return { x: 22.65, y: 9.95, dir: Math.atan2(11.2 - 9.95, 23.9 - 22.65), pitch: 0 }; },
    stage() { stageVane(true); },
    unstage() { stageVane(false); },
    hide: () => (G.ents || []).filter((e) => e && e.kind === 'npc' && /^sable/.test(e.id || '')),
    card: () => ['s_vane', 's_goon'], go: TX.read,
    beats: [
      { k: 'ledger', cap: ['s_ledger'], hint: TX.eyes, dur: 4 },
      ENTRY('corwin', 13),
      { k: 'still', cap: ['s_still'], dur: 2.5 },
      ENTRY('mirren', 12),
      { k: 'lantern', cap: ['s_lantern'], dur: 2.5 },
      ENTRY('annet', 15),
      { k: 'breath', cap: ['s_breath'], dur: 4 },
      { k: 'third', cap: ['s_third'], dur: 5 },
      { k: 'iknow', cap: ['s_iknow'], dur: 4 },
    ],
  };
  function stageVane(on) {
    const m = G.map; if (!m) return;
    const have = m.entities.find((e) => e && e._b125 === 'vane');
    if (on && !have) m.entities.push({ kind: 'deco', sprite: 'vane', x: 23.9, y: 11.2, facing: Math.atan2(9.95 - 11.2, 22.65 - 23.9), scale: 0.92, solid: true, radius: 0.3, transient: true, _decor: true, nopick: true, _b125: 'vane', yOff: 0.06 });
    if (!on && have) m.entities.splice(m.entities.indexOf(have), 1);
  }
  // ---- 6 · the coda: Lyra
  const SPOT = () => ({ x: RING.bx, y: RING.by });
  DEF.coda = {
    hero: 'lyra', she: true, map: 'deepwoods', pose: 'none',
    place() { return { x: RING.bx, y: RING.by + 1.2, dir: -Math.PI / 2, pitch: 0 }; },
    home() { return { x: RING.cx, y: RING.cy + RING.r + 1.0, dir: -Math.PI / 2, pitch: 0 }; },   // the camp side of the ring [PROPOSED]
    hide: () => [],
    card: 'c_walk', go: TX.sing,
    beats: [
      { k: 'walk', hint: TX.walkOut, walk: true, until: () => dist(Engine.cam.x, Engine.cam.y, SPOT().x, SPOT().y) < 0.45, autoDur: 0.5,
        leave() { Engine.cam.x = SPOT().x; Engine.cam.y = SPOT().y; } },
      { k: 'sing', hint: TX.stay, walk: true, enter: () => { S.anchor = SPOT(); },
        tick() {
          if (S.auto.sing) { Engine.cam.x = SPOT().x; Engine.cam.y = SPOT().y; return; }
          if (S.input.song) S.x.started = true;
          if (dist(Engine.cam.x, Engine.cam.y, SPOT().x, SPOT().y) > 1.3) return slip('c_further');
          if (S.x.started && !S.input.song && !G.flags.ring_sung) return slip('c_iknow');
        },
        again() { Engine.cam.x = SPOT().x; Engine.cam.y = SPOT().y; try { ringRestartPart(); } catch (e) { warnOnce('part', e); } S.x.started = !!S.input.song; },
        until: () => !!G.flags.ring_sung },
      { k: 'burst' },   // ringKill's card, then ringAfter's, whose button steps out
    ],
  };
  const coda = {
    go() { return S.at === 'coda' && S.beat === 'sing' && !S.card && (!!S.auto.sing || (!!S.x.started && S.input.song && dist(Engine.cam.x, Engine.cam.y, SPOT().x, SPOT().y) <= 1.3)); },
    caption: (t, ids) => captionText(t, ids),
  };

  // ================================================================ the engine
  const can = (id) => !!DEF[id === 'hold2' ? 'hold' : id] && hasG() && !guest() && !inExtra();
  const defBeats = () => { const b = S.def.beats; return typeof b === 'function' ? b() : b; };
  function enter(id, opts) {
    if (!can(id)) return false;
    const chained = !!(opts && opts.chained);
    if (S.at) leave(true);
    const part = id === 'hold2' ? 2 : (opts && opts.part) || 1;
    if (id === 'hold2') id = 'hold';
    const d = DEF[id];
    S.at = id; S.part = part; S.def = d; S.opts = Object.assign({}, opts || {}); S.slips = {}; S.auto = {}; S.x = {}; S.bi = -1; S.beat = 'card'; S.card = false; S.wait = false; S.press = 0; S.held = 0;
    S.input.use = false; S.input.song = false;
    if (!chained || !S.home) { S.weapon = 'hands'; S.home = d.home ? d.home() : { x: Engine.cam.x, y: Engine.cam.y, dir: Engine.cam.dir, pitch: Engine.cam.pitch || 0 }; }
    F().p125b_at = MOMENTS[id];
    if (d.stage) try { d.stage(); } catch (e) { warnOnce('stage', e); }
    S.hidden = (d.hide ? d.hide() : []).filter(Boolean); for (const e of S.hidden) e.hidden = true;
    const p = d.place(); Engine.cam.x = p.x; Engine.cam.y = p.y; Engine.cam.dir = p.dir; Engine.cam.pitch = 242.42 * Math.tan((p.pitch || 0) * Math.PI / 180); S.anchor = { x: p.x, y: p.y };
    try { if (typeof BODY21 === 'object' && BODY21.invalidate) BODY21.invalidate(); } catch (e) { /* none */ }
    if (part === 1) { const cl = callingLines(callingOf(), id); if (cl) say(cl[0]); }
    const ck = typeof d.card === 'function' ? d.card() : d.card, ks = Array.isArray(ck) ? ck : [ck];
    for (const k of ks) { S.log.push({ m: id, k, ms: CAPS[k].ms }); vo(CAPS[k].vo); }
    card(title(), ks.map((k) => CAPS[k].t).join('<br><br>'), [{ t: d.go, f: () => startBeat(0) }]);
    return true;
  }
  const say = (t) => { try { msg(t, 'voice', 6000); } catch (e) { /* cosmetic */ } };
  function startBeat(i) {
    const beats = defBeats(), b = beats[i];
    if (!b) { finish(); return; }
    S.bi = i; S.beat = b.k; S.t = 0; S.press = 0; S.held = 0; S.wait = false;
    S.x = { took: S.x.took };
    if (!b.walk) S.anchor = { x: Engine.cam.x, y: Engine.cam.y };
    if (b.enter) try { b.enter(); } catch (e) { warnOnce('enter ' + b.k, e); }
    if (b.cap) for (const k of b.cap) caption(k);
    if (b.hint) hint(b.hint);
    if (b.pitch) runPitch(b);
    if (b.choice) {
      const ks = b.choice.body, go = CAPS[b.choice.go];
      for (const k of ks) { S.log.push({ m: S.at, k, ms: CAPS[k].ms }); vo(CAPS[k].vo); }
      card(title(), ks.map((k) => CAPS[k].t).join('<br><br>'), [{ t: go.t, f: () => { vo(go.vo); S.log.push({ m: S.at, k: b.choice.go, ms: go.ms }); nextBeat(); } }]);
    }
    if (b.result) {
      const k = typeof b.result === 'string' ? b.result : 'h_result';
      const t = S.at === 'hold' && R43() ? R43().TX.fifthTitle : S.at === 'rope' && typeof ROPE45 === 'object' ? ROPE45.TX.afterTitle : title();
      S.log.push({ m: S.at, k, ms: CAPS[k].ms });
      card(t, CAPS[k].t, [{ t: TX.stepOut, f: () => finish() }]);
    }
  }
  function nextBeat() {
    const b = defBeats()[S.bi];
    if (b && b.leave) try { b.leave(); } catch (e) { warnOnce('leave ' + b.k, e); }
    startBeat(S.bi + 1);
  }
  async function runPitch(b) {
    S.wait = true;
    const Rd = (typeof REEDS !== 'undefined' && REEDS && typeof REEDS.holdPitch === 'function') ? REEDS : null;
    const tok = S.at + ':' + S.bi + ':' + (S.slips[b.k] | 0);
    let ok = true;
    if (Rd && !S.auto[b.k]) {
      try {
        const fifth = !!b.pitch.fifth && !!R43();
        const res = await Rd.holdPitch({ curve: fifth ? R43().FIFTH : b.pitch.curve, width: Rd.bandFor ? Rd.bandFor(0) : 105, duration: b.pitch.duration, title: fifth ? R43().TX.fifthTitle : title(), hint: fifth ? R43().TX.fifthHint : TX.holdHint, noScore: true });
        ok = !!res && !res.aborted && (res.score == null || res.score >= 0.5);
        if (b.pitch.fifth) ok = true;   // after the cue the fifth has no slip in the book's terms (design 2.2)
      } catch (e) { warnOnce('pitch', e); ok = true; }
    }
    if (tok !== S.at + ':' + S.bi + ':' + (S.slips[b.k] | 0)) return;   // left meanwhile
    S.clock += b.pitch.duration; S.wait = false;
    if (b.pitch.fifth) { try { Audio_.sfx.fifth(); } catch (e) { /* silent */ } }
    if (!ok && b.slipLine) { slip(b.slipLine); return; }
    nextBeat();
  }
  // a slip: the grey Echo with the book's line; "Again" starts the beat (or the one named) over; after two, it plays itself
  function slip(line, back) {
    if (S.card || !S.at) return true;
    const b = defBeats()[S.bi], k = b.k;
    S.slips[k] = (S.slips[k] | 0) + 1; stats.slips++;
    F().p125b_slips = Math.min(99, (F().p125b_slips | 0) + 1);
    const twice = S.slips[k] >= 2;
    S.card = true; S.input.use = false;
    const again = () => {
      S.card = false;
      if (twice) S.auto[k] = true;
      if (b.again) { try { b.again(); } catch (e) { warnOnce('again', e); } S.t = 0; S.x = { took: S.x.took, started: S.x.started }; S.press = 0; S.held = 0; S.beat = k; return; }
      const beats = defBeats(), j = back ? beats.findIndex((x) => x.k === back) : S.bi;
      if (S.anchor && !b.walk) { Engine.cam.x = S.anchor.x; Engine.cam.y = S.anchor.y; }
      startBeat(j < 0 ? S.bi : j);
    };
    const body = TX.notHow + '<br><br>' + CAPS[line].t;
    try {
      if (R43() && R43().echo) R43().echo(body, again);
      else showEvent('An Echo', body, [{ t: 'Again', f: again }]);
    } catch (e) { warnOnce('echo', e); again(); }
    return true;
  }
  function finish() {
    const id = S.at, d = S.def; if (!id) return;
    const nx = d.next ? d.next() : null;
    F().p125b_seen = (F().p125b_seen | 0) | BIT[id];
    if (nx === 'bolts') { enter('bolts', Object.assign({}, S.opts, { chained: true })); return; }
    if (nx === 'hold2') {
      F().p125b_seen = (F().p125b_seen | 0) | BIT.bolts;
      const cl = callingLines(callingOf(), 'bolts'); if (cl) say(cl[1]);
      enter('hold2', Object.assign({}, S.opts, { chained: true, part: 2 })); return;
    }
    exit();
  }
  // step out: the traveller's camera back, the hero's figure back, the scene's own next step
  function exit() {
    const id = S.at; if (!id) return;
    const opts = S.opts || {}, cl = callingLines(callingOf(), id);
    leave(false);
    if (cl) say(cl[1]);
    if (opts.done) { try { opts.done(); } catch (e) { warnOnce('done', e); } }
    else if (id === 'rope') { try { ROPE45.finish(); } catch (e) { warnOnce('finish', e); } }
    else if (id === 'names') { try { MANIFEST53.filed(); } catch (e) { warnOnce('filed', e); } }
  }
  function leave(quiet) {
    const d = S.def;
    if (d && d.leave) try { d.leave(); } catch (e) { warnOnce('leave', e); }
    if (d && d.unstage) try { d.unstage(); } catch (e) { warnOnce('unstage', e); }
    for (const e of S.hidden || []) if (e) e.hidden = false;
    S.hidden = [];
    if (S.home && !quiet) { Engine.cam.x = S.home.x; Engine.cam.y = S.home.y; Engine.cam.dir = S.home.dir; Engine.cam.pitch = S.home.pitch || 0; }
    const was = S.at;
    S.at = null; S.def = null; S.beat = null; S.bi = -1; S.card = false; S.wait = false; S.weapon = null; S.input.use = false; S.input.song = false;
    if (hasG()) F().p125b_at = 0;
    if (!quiet) S.home = null;
    try { if (typeof BODY21 === 'object' && BODY21.invalidate) BODY21.invalidate(); } catch (e) { /* none */ }
    try { if (was === 'coda' && typeof ringSync === 'function') ringSync(); } catch (e) { /* none */ }
    try { if (typeof RITE43 === 'object' && RITE43.grey) RITE43.grey(false); } catch (e) { /* none */ }
  }
  // a hard stop (loads, tests): nothing of the moment's own next step runs
  function reset() { if (S.at) leave(true); S.home = null; S.opts = null; S.log = []; }

  // the tick: after the game's own update
  function tick(dt) {
    if (!S.at || !hasG() || S.card || S.wait || S.bi < 0 || G.state !== 'play') return;
    const b = defBeats()[S.bi]; if (!b) return;
    S.t += dt; S.clock += dt;
    const auto = !!S.auto[b.k];
    if (b.timed) for (const [at, k] of b.timed) if (S.t >= at && !S.x['tm' + at]) { S.x['tm' + at] = true; caption(k); }
    if (!auto && b.still && dist(Engine.cam.x, Engine.cam.y, S.anchor.x, S.anchor.y) > 0.15) { slip(b.still); return; }
    if (!b.walk && S.anchor) { Engine.cam.x = S.anchor.x; Engine.cam.y = S.anchor.y; }
    if (b.tick && (!auto || b.k === 'sing' || !/^(pinch|n10|corwin|mirren|annet)$/.test(b.k))) { if (b.tick(dt) === true) return; }
    if (S.card || !S.at) return;
    let done;
    if (auto && b.autoDur != null) { done = S.t >= b.autoDur; if (done && b.autoDo) b.autoDo(); }
    else if (b.until) done = !!b.until();
    else if (b.dur != null) done = S.t >= b.dur;
    else done = false;
    if (done && b.end && !auto) { if (b.end() !== true || S.card) return; }
    if (done) nextBeat();
  }
  // the moment's two keys: use (E, Space) and the Song key (N, F1-F9)
  function input(name, down) {
    if (!S.at) return;
    const b = S.bi >= 0 ? defBeats()[S.bi] : null;
    if (name === 'use') {
      const was = S.input.use; S.input.use = !!down;
      if (down && !was && b && !S.card && !S.wait) { S.press++; if (b.onPress && !S.auto[b.k]) b.onPress(); }
      if (b && b.onInput && !S.card) b.onInput('use', !!down);
    } else if (name === 'song') {
      const was = S.input.song; S.input.song = !!down;
      if (down && !was && b && b.onSong && !S.card) b.onSong();
    }
  }

  // ================================================================ the hands, the props, the tremor (behind GFX.heroHands)
  const lookFor = (own) => { if (!S.at || !handsOn() || !S.def) return null; return heroLook(own, S.def.hero); };
  try { if (typeof GEARLOOK21 === 'object' && GEARLOOK21.setLookHook) GEARLOOK21.setLookHook((own) => lookFor(own)); } catch (e) { warnOnce('look hook', e); }
  const lowered = () => !!S.at && handsOn() && !!S.def && (S.def.pose === 'stool' || S.def.pose === 'none' || S.def.pose === 'lid' || (S.def.pose === 'rail' && S.weapon !== 'axe'));
  const propNow = () => { if (!S.at || !handsOn() || S.bi < 0) return null; const b = defBeats()[S.bi]; if (S.at === 'names' && lookDeg() < -12) return 'ledger'; return (b && b.prop) || null; };
  // the two fists, through the climbing hands of js/fp-hands.js (pixel or sculpted), set on the stool's edges or the rail
  function extraHands(ctx) {
    if (!S.at || !handsOn() || !S.def || S.bi < 0) return;
    const pose = S.def.pose === 'rail' && S.weapon === 'axe' ? null : S.def.pose;
    if (pose !== 'stool' && pose !== 'rail' && pose !== 'lid') return;
    const VH = typeof VIEW_H === 'number' ? VIEW_H : 150, y = pose === 'rail' ? VH - 44 : VH - 34;
    const at = pose === 'lid' ? [[1, 150, VH - 30]] : [[0, 96, y], [1, 194, y]];
    let drew = false;
    for (const [i, x, yy] of at) {
      let ok = false;
      try { ok = typeof BODY21 === 'object' && !!BODY21.sculptClimb && !!BODY21.sculptClimb(ctx, i, x, yy); } catch (e) { ok = false; }
      if (!ok) try { ok = typeof PIXELHANDS110 === 'object' && !!PIXELHANDS110.climbHand(ctx, i, x, yy); } catch (e) { ok = false; }
      drew = drew || ok;
    }
    try { if (typeof BODY21 === 'object' && BODY21.sculptClimbEnd) BODY21.sculptClimbEnd(ctx); } catch (e) { /* none */ }
    if (drew) stats.props++;
  }
  try { if (typeof BODY21 === 'object' && BODY21.setExtra) BODY21.setExtra(extraHands); } catch (e) { warnOnce('extra hook', e); }
  // the props, in code, on the HUD layer: pixel grain, hashed shapes only
  function px(ctx, col, x, y, w, h) { ctx.fillStyle = col; ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h))); }
  function drawProp(ctx, which, jx, jy) {
    const VH = typeof VIEW_H === 'number' ? VIEW_H : 150;
    ctx.save(); ctx.translate(jx, jy);
    if (which === 'needle') {   // the long silver needle curved like a new moon, and the copper wire after it (MS 3040)
      for (let i = 0; i < 26; i++) { const a = i / 25, x = 176 + a * 34, y = VH - 58 - Math.sin(a * Math.PI) * 9; px(ctx, i % 5 === 0 ? '#e8eef2' : '#b8c2c8', x, y, 2, 1); }
      for (let i = 0; i < 30; i++) { const x = 210 + i * 1.6, y = VH - 58 + i * 0.9 + (hash(i * 7) - 0.5); px(ctx, i % 3 ? '#b8743c' : '#d9925a', x, y, 1, 1); }
    } else if (which === 'key') {   // the tuning key (MS 3092)
      px(ctx, '#6a5230', 182, VH - 62, 16, 4); px(ctx, '#c9a050', 196, VH - 63, 3, 6); px(ctx, '#e0be70', 197, VH - 62, 1, 2); px(ctx, '#3a2a18', 182, VH - 58, 16, 1);
    } else if (which === 'spanner') {   // a spanner, its jaw on a bolt (MS 3184)
      px(ctx, '#5c6066', 196, VH - 70, 5, 26); px(ctx, '#8a9098', 197, VH - 70, 2, 26);
      px(ctx, '#5c6066', 191, VH - 78, 15, 8); px(ctx, '#1e1c1a', 196, VH - 76, 5, 4); px(ctx, '#a0a6ae', 192, VH - 78, 13, 1);
    } else if (which === 'coil') {   // the reverse-phase coil: brass, glass and hair-fine wire
      px(ctx, '#7a5a28', 186, VH - 70, 22, 14); for (let i = 0; i < 7; i++) px(ctx, i % 2 ? '#c89a4a' : '#e2b866', 187 + i * 3, VH - 70, 2, 14);
      px(ctx, '#7fe0c8', 194, VH - 74, 6, 4); px(ctx, '#d0fff0', 196, VH - 73, 2, 1);
    } else if (which === 'ledger') {   // the Bound Ledger, open, at writing-desk height: seen only by looking down (MS 4554)
      const x0 = 104, y0 = VH - 64;
      px(ctx, '#2a1e16', x0 - 3, y0 - 3, 118, 50); px(ctx, '#d8ccb0', x0, y0, 54, 44); px(ctx, '#e2d8be', x0 + 58, y0, 54, 44); px(ctx, '#4a3424', x0 + 54, y0 - 2, 4, 48);
      for (let r = 0; r < 9; r++) for (let side = 0; side < 2; side++) { const w = 30 + Math.floor(hash(r * 13 + side * 101) * 18); px(ctx, '#5a4a3a', x0 + 5 + side * 58, y0 + 5 + r * 4.4, w, 1); }
    }
    ctx.restore();
    stats.props++;
  }
  function drawOverlay() {
    if (!S.at || !handsOn() || !hasG() || G.state !== 'play') return;
    const ctx = Engine.ctx, w = propNow(); if (!ctx || !w) return;
    let jx = 0, jy = 0;
    if (S.at === 'needle') { const n = Math.floor(S.t * 9 + S.bi * 31); jx = Math.round(hash(n) * 2 - 1); jy = Math.round(hash(n + 977) * 2 - 1); }   // his hands shake, and nothing steadies them (MS 3046)
    drawProp(ctx, w, jx, jy);
  }

  // ---------------------------------------------------------------- the flags (small ints, validated on every load)
  const FLAGS = { p125b_seen: 63, p125b_slips: 99, p125b_at: 6, p125b_m: 1, p125b_cv: 1 };
  function validate(f) {
    for (const k in FLAGS) { const v = f[k]; if (!(typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= FLAGS[k])) f[k] = 0; }
  }

  // ---------------------------------------------------------------- the old saves (ruling b, design 4b and 5.5)
  // The traveller no longer sings the coda (coda_by_you), strikes the ring's Wearer (ring_struck 'you') or says Kaelen's
  // "No." in the moss (ring_sat_no, ring_sat_kind). A finished coda reads the book's way; an unfinished one starts again.
  function migrateCoda(f) {
    const reset_ = (keep) => { try { if (typeof ringReset === 'function') ringReset(keep); } catch (e) { warnOnce('ring reset', e); } };
    if (f.coda_by_you && f.coda_done) {   // the book's order (MS 5930-5970): Kaelen told her, and her voice came back
      delete f.coda_by_you;
      if (!f.lyra_voice) f.lyra_voice = true;
      if (!f.kaelen_dw_done) f.kaelen_dw_done = true;
      if (!f.kaelen_told_now) f.kaelen_told_now = true;
      f.p125b_cv = 1;
    } else if (f.coda_by_you) {   // mid-ring, or the lamps set for the traveller: Lyra is at the fire again, and needs her voice
      delete f.coda_by_you;
      reset_(false);
    }
    if (f.ring_struck === 'you' && f.coda_done) f.ring_struck = 'kaelen';
    delete f.ring_sat_no; delete f.ring_sat_kind;
  }
  // a save at a moment (old, or made inside a boot) goes back to the moment's start
  function resume(at) {
    const f = F(), map = G.mapId, r43 = f.r43 | 0, r45 = f.r45 | 0;
    if (map === 'rootvault' && R43()) {
      if (r43 === 3) { R43().startNeedle(); return; }
      if (r43 === 4) { R43().startHold(); return; }
      if (r43 === 5 && at === MOMENTS.hold && !f.r43_fifth) { enter('hold2', { part: 2, done: R43().afterFifth }); return; }
    }
    if (typeof ROPE45 === 'object' && map === ROPE45.DECK && r45 === 5) { ROPE45.startCount(); return; }
    if (typeof MANIFEST53 === 'object' && map === MANIFEST53.HOLD && f.p53 === 9) { enter('names'); return; }
  }
  function onRestore() {
    if (!hasG()) return;
    const f = F();
    validate(f);
    if (!f.p125b_m) migrateCoda(f);
    if (f.ring_fight && !f.coda_done) { try { if (typeof ringReset === 'function') ringReset(true); } catch (e) { warnOnce('ring reset', e); } }   // the boots start again at the ring trigger
    f.p125b_m = 1;
    const at = f.p125b_at; f.p125b_at = 0;
    if (!guest() && !inExtra()) resume(at);
  }

  // ---------------------------------------------------------------- the Options row
  const ROW = ['gfx-heroHands125', TX.optLabel, TX.optHint];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = handsOn(); b.textContent = v ? TX.optHero : TX.optYours; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setHands(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
    syncRow();
  }

  // ---------------------------------------------------------------- the wiring
  const blocked = () => !!S.at;
  function wire() {
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(dt); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof drawHUD === 'function') {
      const _d = drawHUD;
      drawHUD = function () {
        const c = typeof Engine !== 'undefined' ? Engine.cam : null, bob0 = c ? c.bob : 0;
        let lw = null;
        try {
          if (S.at === 'needle' && handsOn() && c) { const n = Math.floor(S.t * 9 + S.bi * 31); c.bob = (c.bob || 0) + (Math.round(hash(n + 5) * 2 - 1)) / 1.5; }   // the tremor: one view pixel, hashed
          if (lowered() && typeof FPHANDS === 'object' && FPHANDS.st) { lw = FPHANDS.st.lower; FPHANDS.st.lower = 1; }
        } catch (e) { /* cosmetic */ }
        let r;
        try { r = _d.apply(this, arguments); } finally { if (c) c.bob = bob0; if (lw != null) try { FPHANDS.st.lower = lw; } catch (e) { /* none */ } }
        try { drawOverlay(); } catch (e) { warnOnce('overlay', e); }
        return r;
      };
    }
    if (typeof currentWeapon === 'function') {
      const _cw = currentWeapon;
      currentWeapon = function () { try { if (S.at && handsOn() && S.weapon && typeof WEAPONS === 'object' && WEAPONS[S.weapon]) return WEAPONS[S.weapon]; } catch (e) { /* the traveller's own */ } return _cw.apply(this, arguments); };
    }
    for (const fn of ['attack', 'castSong', 'transfer', 'damagePlayer']) {
      if (typeof window[fn] !== 'function') continue;
      const _f = window[fn];
      window[fn] = function () { if (blocked()) return undefined; return _f.apply(this, arguments); };
    }
    if (typeof window !== 'undefined' && window.addEventListener) {
      const key = (ev) => { try { return typeof keyOf === 'function' ? keyOf(ev) : String(ev.key || '').toLowerCase(); } catch (e) { return ''; } };
      const on = (down) => (ev) => {
        if (!S.at || !hasG() || G.state !== 'play') return;
        if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
        const k = key(ev);
        let name = null;
        if (k === 'e' || k === ' ') name = 'use';
        else if (k === 'n' || /^f[1-9]$/.test(k)) name = 'song';
        else if (k === 'tab') name = 'none';
        if (!name) return;
        ev.preventDefault(); ev.stopImmediatePropagation();
        if (name !== 'none' && !(down && ev.repeat)) input(name, down);
      };
      window.addEventListener('keydown', on(true), true);
      window.addEventListener('keyup', on(false), true);
    }
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () {
        try { reset(); } catch (e) { warnOnce('reset', e); }
        const r = _rg.apply(this, arguments);
        try { onRestore(); } catch (e) { warnOnce('restore', e); }
        return r;
      };
    }
    if (typeof snapshotGame === 'function') {
      const _s = snapshotGame;
      snapshotGame = function () {
        try { if (hasG()) G.flags.p125b_m = 1; } catch (e) { /* none */ }
        const snap = _s.apply(this, arguments);
        try {
          if (snap && snap.flags) snap.flags.p125b_at = S.at ? MOMENTS[S.at] : 0;
          if (snap && S.at && S.home) snap.cam = { x: S.home.x, y: S.home.y, dir: S.home.dir };   // the traveller's own place, not the hero's
        } catch (e) { warnOnce('snapshot', e); }
        return snap;
      };
    }
    if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () {
        const r = _acc.apply(this, arguments);
        try {
          const grid = document.querySelector('#modal-panel .ctl-grid');
          if (grid && !document.getElementById(ROW[0])) {
            const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(ROW[1] + ' '));
            const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = ROW[2]; lab.appendChild(sm);
            const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
            b.onclick = () => setHands(!handsOn());
            grid.appendChild(lab); grid.appendChild(b); syncRow();
          }
        } catch (e) { warnOnce('row', e); }
        return r;
      };
    }
    try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(syncRow); } catch (e) { /* none */ }
  }
  try { wire(); } catch (e) { console.warn('boots125 failed to wire', e); }

  const voiceIds = () => {
    const out = new Set();
    for (const k in CAPS) for (const id of CAPS[k].vo || []) out.add(id);
    try { for (const b of RING_BEATS) for (const id of b[2] || []) out.add(id); out.add('lyra_ruined.ring.twovoice'); } catch (e) { /* none */ }
    return [...out];
  };
  const FIFTH = (() => { try { return RITE43.FIFTH; } catch (e) { return []; } })();

  return { TX, TEXTS, CAPS, CALLING, HEROES, FLAGS, MOMENTS, S, stats, FIFTH, coda, can, active, enter, exit, input, reset, slip, tick, callingLines, voiceIds, validate, migrateCoda, heroLook, handsOn, lookDeg, FLAG, ROW };
})();
if (typeof window !== 'undefined') window.BOOTS125 = BOOTS125;
