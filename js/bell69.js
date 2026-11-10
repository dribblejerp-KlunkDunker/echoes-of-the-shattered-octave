// ============================================================
//  bell69 — the Prologue, "The Cracked Bell", played as an extra (Book One, Prologue; ROADMAP R9 #23; Phase 69).
//
//  Reached only from the Extras menu (js/extras17.js): EXTRAS17.register({ id: 'crackedbell', tag, start }) below. It runs
//  in the extra's own session (its own G), so the Book One save is never touched and no Book One flag is ever written;
//  this module writes only G.flags under b69 in that session, and every wrapper is inert unless this extra is running.
//  The extras open when Book One is truly finished (the author's ruling, unchanged); its card and banner say "The
//  Prologue of Book One" instead of "after Book One" (the additive tag option in extras17).
//
//  WHERE (the book's own description): Sol-Luminary, the Siphon Foundry at the foot of the Dawning Spire, the three
//  hundredth sunrise of the Rite of Pure Unison, 412 SR. Two maps, built from this module only while the extra runs:
//    b69_loft     the choir-loft: forty pallets, thirty-eight girls asleep and humming, Ilse's pallet empty, your own.
//    b69_foundry  "a cathedral of black iron, ribbed and buttressed, thrown up against the Spire's flank": the Spire's white
//                 flank to the north with the seam the bore has cut, the Carrow Bore in it, the glass channels in the
//                 floor, the tanker bays and the drainage conduit, the gantry with the Tuning Men and the engineer at the
//                 calibration rail, the risers (three tiers, the top one nearest the Spire), the censer platform the choir
//                 faces, and above and behind it the gallery behind its gilded rail. Its roof is open.
//  [PROPOSED: the plan of the floor. The book names its parts and how they stand to each other ("above him ... was the
//  gallery"; "threw her backward, off the top tier, over the glass channels, into ... the wound"), not their distances.]
//
//  THE PLAYER IS SOLENNE AUBADE [PROPOSED: the traveller's part]. She cannot speak: the Song key only gives the note
//  (the first time, the book's paragraph on trying to speak). What she does is what the book has her do: listen, count,
//  look, and say with her hands, under the hem, "Look at me". Nothing she does changes what happens.
//    1  THE LOFT. The opening card (the Catechism, Sol-Luminary, "woke already singing"). Count the voices as you pass the
//       pallets: thirty-nine, and there were supposed to be forty [PROPOSED: thirty-nine with her own, as the Swell has
//       "Thirty-nine voices"]. Ilse's empty pallet: the line closing "the way water closes over a dropped stone".
//    2  THE FLOOR. The Foundry card; the sights, each in the book's words when you look at them (E, from across the floor):
//       the Spire ("It sounds tired."), the bore, the glass ("It came in pulses."), the choir's work and Ignatius's first
//       morning, the censer, the gallery and Seraphina (your hands: "Look at me." And every morning her sister did not),
//       the engineer and his hum (you hear it near the gantry). Then your place on the top tier, at Coralie's right hand.
//    3  THE SWELL. "Today ... the bore reaches the casing." "Three hundred sunrises." "One note." Creak. "One law." Creak.
//       "One hand." The Morning Swell. Then LISTEN [PROPOSED: the player's part]: stand still and the chord comes
//       closer; it asks; the fork falls; "Stop the bore." "Hold the note." And they held it. It let go.
//    4  THE LIGHT. The chord stops. The light comes down the Spire: the tankers go pale, the Tuning Man's hands; it comes for
//       the risers and the throats; the engineer at the conduit with the gantry boys and the glass over his arm;
//       "Dissonance!" and the Flambeaux lift their staves. Look up at the gallery [PROPOSED: turn to it, or it comes in
//       fifteen seconds]: Seraphina, untouched, her hands on the hilt. "Look at me", and the fire takes the risers.
//    5  THE WOUND. Thrown back into the seam; the fall in the dark with the wire singing; something opens far below and sings
//       her note back to her. The end of the Prologue: EXTRAS17.finish.
//  ECHO (GDD 4.9, RITE43.echo): no girl of the choir ever steps down off the risers in the book. Walking off the top tier
//  during the Swell or the light is an Echo, shown grey, and you are back in your place. Nothing else can be failed.
//
//  STATE: G.flags.b69 (stage 1-6), b69_beat (the step reached in a stage's timeline), b69_count, b69_ilse, b69_spoke,
//  b69_seen (a bitmask of the sights looked at), b69_signs, b69_echoes: small validated integers (FLAGS). The staged
//  people are transient (an _b69 key), restaged from the flags on every load. Text: TX, collected in TEXTS for the French
//  (tools/i18n/p69-bell.tsv). Every line of the scene is the book's; the buttons and hints are [PROPOSED].
// ============================================================
'use strict';

const BELL69 = (function () {
  const ID = 'crackedbell';
  const LOFT = 'b69_loft', FOUNDRY = 'b69_foundry', MAPS = [LOFT, FOUNDRY];
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('bell69: ' + k + ' failed', e); } };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const dist = (ax, ay, bx, by) => Math.hypot(ax - bx, ay - by);
  const extraId = () => { try { return typeof EXTRAS17 !== 'undefined' && EXTRAS17.inExtra ? EXTRAS17.inExtra() : null; } catch (e) { return null; } };
  const active = () => extraId() === ID;
  const here = () => active() && hasG() && G.map && MAPS.includes(G.mapId);

  // ================================================================ the words (the book's; buttons and hints [PROPOSED])
  const TX = {
    title: S('The Cracked Bell'),
    tag: S('The Prologue of Book One'),
    blurb: S('Sol-Luminary, 412 SR: the Siphon Foundry at the foot of the Dawning Spire, on the three hundredth sunrise of the Rite of Pure Unison. You are Solenne Aubade, on the risers, with the wire in your throat. The Prologue of Book One, in its own words.'),
    loftName: S('The choir-loft'),
    foundryName: S('The Siphon Foundry'),
    // 1 · the loft
    wakeTitle: S('Prologue · The Cracked Bell'),
    catechism: S('<i>Q. What is holiness?<br>A. One note, held without end.<br>Q. What is sin?<br>A. The second note.</i><br>— Catechism of the Pure Note'),
    place: S('<i>Sol-Luminary. The Siphon Foundry at the foot of the Dawning Spire.<br>The three hundredth sunrise of the Rite of Pure Unison. 412 SR.</i>'),
    woke: S('On the three hundredth morning of the Rite, Solenne Aubade woke already singing.'),
    wire: S('She had stopped noticing somewhere around the eightieth sunrise, when the wire took over. That was what the Tuning Men had promised the day they threaded it. <i>After a while, girl, you won\'t have to try. The copper remembers for you. You breathe; it sings.</i> They had said it kindly, the way a groom tells a horse the bit will stop hurting once the mouth goes numb.'),
    numb: S('The mouth had not gone numb. But she no longer had to try.'),
    pallet: S('She lay on her pallet in the choir-loft with her eyes shut and listened to herself: the note leaving her on every breath, thin and exact, five hundred and twenty-eight beats to the second, the holy number, the Light\'s own pitch.'),
    wakeGo: S('Open your eyes.'),
    loftHint: S('Count the voices: walk along the pallets. The stair at the end of the loft goes down to the Foundry floor.'),
    hudVoices: S('VOICES'),
    counted: S('She counted the voices around her in the dark. Thirty-nine. There were supposed to be forty.'),
    lookGirl: S('A sleeping girl, humming'),
    lookGirlText: S('Thirty-nine sleeping girls, humming.'),
    lookOwn: S('Your pallet'),
    lookIlse: S('Ilse\'s pallet'),
    ilseTitle: S('Ilse'),
    ilse: S('Ilse had died on the risers on the two hundred and eleventh morning, still singing, and the Inquisitor had had her carried out without the note so much as wavering, and the line had closed over the gap the way water closes over a dropped stone.'),
    hive: S('At night the loft sounded like a hive. Thirty-nine sleeping girls, humming. Solenne had lain awake through the early weeks listening to it, sick with it, and then one night she realized she could no longer remember what the loft had sounded like before, and after that she slept.'),
    speakTitle: S('Her mouth had said one'),
    speak: S('When she had tried to speak (she did not anymore, but in the first weeks she had tried) the words came out on the same pitch, every syllable pressed flat onto the one note like a flower in a book. You could say <i>I love you</i> or <i>I am dying</i> or <i>please</i>, and the wire made them all the same prayer. So the girls had built a hand-speech instead, small and quick, done under the hems of their white shifts where the Flambeaux could not see. Solenne\'s hands had said a great many things in three hundred days.'),
    speakOne: S('Her mouth had said one.'),
    note: S('The note, leaving her on every breath, thin and exact. Five hundred and twenty-eight.'),
    stair: S('The stair down to the Foundry floor'),
    noRest: S('Not on the three hundredth morning.'),
    noTravel: S('The Rite holds the Foundry, and you are its choir.'),
    // 2 · the floor
    foundryTitle: S('The Siphon Foundry'),
    scab: S('The Siphon Foundry had grown around the foot of the Dawning Spire the way a scab grows around a nail.'),
    cathedral: S('It was a cathedral of black iron, ribbed and buttressed, thrown up against the Spire\'s flank in a single summer by the Consortium of Bores: gantries, catwalks, cable-drums, the long channels in the floor where the glass ran, the tanker bays, the censer platform, the gallery for the nobility, and the risers where the choir stood. Its roof was open. It had to be. There was no roof in the world high enough to close over the thing it had been built against.'),
    floorGo: S('Go to your place on the risers.'),
    floorHint: S('Your place is on the top tier, at Coralie\'s right hand. Look at what you will on the way (E): the Foundry is in front of you.'),
    spireTitle: S('The Dawning Spire'),
    spire1: S('The Spire went up out of the mountain, out of the Foundry, out of the clouds, and past the place where the eye gave up. It was white, not the white of marble or of snow but the white of a clean bone, and it was seamless, and it was singing. It had always been singing. Solenne had grown up beneath it, in House Aubade\'s tall cold rooms on the Upper Tiers, and she had heard it every day of her life without hearing it, the way you do not hear your own blood.'),
    spire2: S('Only on the risers, with her own voice pinned to its pitch, had she begun to hear it properly.'),
    spire3: S('The Church taught that the Spire sang one note: the Pure Note, the Law of Light, five hundred and twenty-eight. The Church was wrong. Under the choir, under the grinding of the bore, under everything, the Spire sang a chord so wide you could only hear its edges, like standing inside a bell someone had struck before the world began and never stopped striking. And inside the chord, if you listened long enough, there was <i>grain</i>. Texture. Something like breath. Once, around the hundred and fortieth sunrise, she had heard something in it catch, the way a voice catches on a word it doesn\'t want to say, and for days afterward she could not stop thinking a thought she had no right to think.'),
    tired: S('<i>It sounds tired.</i>'),
    boreTitle: S('The Carrow Bore'),
    bore: S('The bore did not sound tired. The bore sounded like the end of the world being ground very slowly out of stone. The Carrow Bore was thirty storeys of black iron and runework, lowered down the Spire\'s flank on chains thicker than a man\'s body. It turned all day and all night like a mill-wheel, and at its tip a crown of glass teeth bit into the white stone and made it bleed.'),
    glassTitle: S('The blood was blue'),
    glass: S('The blood was blue. Not the blue of the sky, or of a vein, but the blue at the very bottom of a flame. Aether-Glass, running liquid out of the wound, down the cut channels in the Foundry floor and into iron tankers that men in leather aprons wheeled away every hour. The Synod said the glass was surplus: the Light\'s generosity, overflowing.'),
    pulses: S('Solenne had watched it come out of the Spire for three hundred days. It did not overflow. It came in pulses.'),
    heartbeat: S('Like something with a heartbeat.'),
    choirTitle: S('The choir\'s work'),
    choir1: S('The choir\'s work was to hold the note still.'),
    choir2: S('That was the Consortium\'s theory, and the Church\'s blessing on the theory, and the reason forty girls of the Sky Choirs had been brought down from the heights with copper in their throats. A Spire could not simply be drilled. It rang, and a ringing thing shatters under a bit. But if its note were held perfectly steady from outside, if a unison of human voices sang its own pitch back to it without a tremor, it would stand still for the bore the way a patient stands still for a surgeon.'),
    choir3: S('"You are the hand that steadies the patient," Inquisitor Ignatius had told them on the first morning, walking the line of risers with his hands folded. "Holy daughters. You hold the Light still so that it may be relieved of its excess."'),
    censerTitle: S('Inquisitor Ignatius'),
    censer: S('He stood on the censer platform above the choir every dawn, a tall man, young for his rank, with a face like a statue someone had loved too hard, in robes the red of a banked coal, and he swung the great brass censer on its chain, back and forth, back and forth. The chain creaked at the top of each arc, and that creak was the metronome of the Rite. Solenne had heard it in her sleep for three hundred nights. She would hear it, she suspected, for the rest of her life.'),
    believed: S('He believed. That was the worst thing she could say about him, and she\'d had three hundred days to find worse.'),
    galleryTitle: S('The gallery'),
    gallery: S('Above him, behind a rail of gilded iron, was the gallery, and in the gallery, every morning, in white, stood her sister.'),
    sister: S('Seraphina was sixteen. The Church had chosen them both on the same day, in the same hall, with their mother weeping proudly in the front pew: Seraphina for the Sun-Blade, Solenne for the wire. One daughter to carry the Light, one to hold it still. The Blade lay on a cushion of cloth-of-gold beside Seraphina\'s knee, waiting for the end of the Rite, a long pale sword the Church had carved from a splinter of the Spire itself. Every morning Seraphina stood beside it through the Morning Swell with her eyes lifted to the Spire and her face as clean and certain as a candle.'),
    everyHands: S('And every morning, under the hem of her shift, Solenne\'s hands said: <i>Look at me.</i>'),
    everyNot: S('And every morning her sister did not.'),
    lookAtMe: S('Look at me.'),
    engTitle: S('The engineer'),
    eng1: S('There was one other note in the Foundry.'),
    eng2: S('It belonged to the engineer.'),
    eng3: S('He came up the gantry every dawn with the Tuning Men to calibrate the bore: a young man, not yet thirty, sleeves rolled to the elbow, soot in the creases of his knuckles, a long steel tuning fork carried the way other men carry a knife. When he worked, when he thought no one could hear him under the roar, he hummed.'),
    eng4: S('Low. So low it was nearly under the floor. A note like wet earth, like a root drinking. A <i>Reach</i> note, her mother would have said, with a sniff; the Reach, where they still sang to their apple trees. It was nowhere near five hundred and twenty-eight. It was, strictly speaking, a second note, and in the Foundry of the Pure Unison a second note was very nearly a sin.'),
    eng5: S('Solenne had come to wait for it the way prisoners wait for the hour the sun touches their window.'),
    eng6: S('He had looked at her once. On the ninth morning, when the wire was still new and she was bleeding into the collar of her shift, he had come down from the gantry to check the resonance at the risers, and his eyes had gone to her throat, and he had flinched. Not looked away. <i>Flinched</i>, the way you flinch from a stove. Then he had gone back up the gantry and never looked at the risers again.'),
    eng7: S('In three hundred days, he was the only one who ever flinched.'),
    hum: S('Low. So low it was nearly under the floor. A note like wet earth, like a root drinking.'),
    go: S('Go on.'),
    // the people and things on the floor
    lookChoir: S('A girl of the choir'),
    lookChoirText: S('Copper in her throat, on the one pitch, in a white shift.'),
    lookCoralie: S('Coralie'),
    lookCoralieText: S('Little Coralie, fifteen, who had stood at Solenne\'s left shoulder for three hundred days and signed jokes to her under their hems.'),
    lookHesper: S('Hesper'),
    lookAude: S('Aude'),
    lookGlass: S('The glass channels'),
    lookCrane: S('Inquisitor Ignatius, on the censer platform'),
    lookSera: S('Seraphina, in the gallery'),
    lookBlade: S('The Sun-Blade, on its cushion'),
    lookBladeText: S('A long pale sword the Church had carved from a splinter of the Spire itself.'),
    lookCanon: S('The old Canon'),
    lookCanonText: S('The old Canon who had stood at Seraphina\'s side each morning with his hands folded over his belly.'),
    lookEng: S('The engineer, at the calibration rail'),
    lookTuning: S('A Tuning Man'),
    lookTuningText: S('On the gantry the Tuning Men were calling numbers to one another.'),
    lookBoy: S('A gantry boy'),
    lookBoyText: S('Soot-faced, none of them older than twelve.'),
    lookFlam: S('A Flambeau'),
    lookFlamText: S('Along the walls, where they had stood for three hundred days with their fire-staves grounded.'),
    lookTanker: S('An iron tanker'),
    lookTankerText: S('Iron tankers that men in leather aprons wheeled away every hour.'),
    lookApron: S('A man in a leather apron'),
    lookConduit: S('The drainage conduit'),
    lookConduitText: S('A black iron throat with a grate over it, under the tanker floor.'),
    lookNoble: S('The nobility, in the gallery'),
    lookNobleText: S('Behind a rail of gilded iron.'),
    wallSpire: S('The Spire: white, the white of a clean bone, and seamless, and singing.'),
    wallSeam: S('The seam the bore has opened in the Spire\'s flank: a black crack in the white.'),
    wallIron: S('Black iron, ribbed and buttressed.'),
    wallGilt: S('A rail of gilded iron.'),
    // 3 · the Swell
    dawnTitle: S('The three hundredth sunrise'),
    today: S('"Today," said Inquisitor Ignatius, "the bore reaches the casing."'),
    dawn: S('Dawn was coming up behind the Spire the way it always did in Sol-Luminary, not rising so much as <i>arriving</i>, the whole white length of the tower catching fire from the top down. The Foundry smelled of hot iron and rosin and the sweetish mineral stink of raw glass. On the gantry the Tuning Men were calling numbers to one another. The engineer stood at the calibration rail with his fork in his fist.'),
    sunrises: S('"Three hundred sunrises," said the Inquisitor. His voice was trained for cathedrals; it carried without seeming to try. "Three hundred sunrises you have held the Light for us, daughters, and today the Light will give us its heart. Sing as you have never sung." He lifted the censer. "One note."'),
    creaked: S('The chain creaked.'),
    oneLaw: S('"One law."'),
    creak: S('Creak.'),
    oneHand: S('"One hand."'),
    answered: S('And the Foundry answered him with the only word it had, which was the note.'),
    swellTitle: S('The Morning Swell'),
    swell: S('The Morning Swell began. Thirty-nine voices rose on the one pitch until the air on the risers went thick and bright with it, until Solenne could feel it in her teeth, in the bones behind her eyes, in the copper ring of the tuning collar around her throat. On the gantry the Tuning Men called the match, <i>five-twenty-eight, holding, five-twenty-eight, bore to five-twenty-eight</i>, and the Carrow Bore dropped the last span on its chains with a sound like a mountain clearing its throat, and the crown of glass teeth went into the Spire, and the Spire bled.'),
    chord: S('And underneath them, its chord changed.'),
    listen: S('Listen.'),
    listenHint: S('Stand still on the top tier and listen. The note holds by itself: the copper remembers for you.'),
    hudSpire: S('THE SPIRE'),
    hudCloser: S('closer'),
    hudStill: S('stand still'),
    closer: S('It did not grow louder. It grew <i>closer</i>. That was the only way she would ever find to say it, afterward, in the dark. The way a room changes when someone in it stops pretending to be asleep.'),
    narrowing: S('The vast chord that had been sounding since before there was a world to hear it drew in, and in, narrowing, until it was nearly a single note, until it was nearly <i>their</i> note, and Solenne understood with her whole body that it was listening.'),
    holdingFor: S('To thirty-nine girls holding its pitch. Holding it <i>for</i> it.'),
    askedTitle: S('And it asked'),
    asked: S('And it asked.'),
    words: S('Not in words. The Spire had no words; she would have sworn to that before this morning, and she would swear to it after. But you do not need words to know you have been asked a question. The whole Foundry <i>was</i> a question. The air was. The copper in her throat was. It went through her the way your own name goes through you when it is called across a crowded square, and it was so old, the question, so worn smooth with waiting, that it had calluses.'),
    isItTime: S('<i>Is it time?</i>'),
    knew: S('She did not know how she knew what it meant. She knew what it meant.'),
    singingIt: S('<i>Is it time? Have you come? Are you, at last, are you singing it for me?</i>'),
    forkTitle: S('The fork'),
    fork: S('On the gantry, the engineer\'s tuning fork fell out of his hand.'),
    forkHit: S('She heard it hit the iron, a clean, bright, useless note, and she saw his face, and she knew that he had heard it too.'),
    stop: S('"<i>Stop the bore.</i>" His voice cracked straight across the Swell. A Reach voice, too loud. "Stop — lift it, lift it <i>now</i>, it\'s not — Inquisitor, it\'s <i>letting go</i>—"'),
    noLook: S('Inquisitor Ignatius did not look at him.'),
    holdNote: S('"Hold the note," he said.'),
    held: S('And they held it.'),
    holdGo: S('Hold the note.'),
    letGoTitle: S('It let go'),
    gods: S('Gods help them all, they held it. Thirty-nine voices, perfect, pure, not a tremor, because three hundred days of copper had made it impossible to do anything else, and the Spire heard its own note sung back to it, steady as stone, by someone other than itself, for the first time in ten thousand years.'),
    mistake: S('It made the only mistake a thing that tired could make.'),
    believedThem: S('It believed them.'),
    letGo: S('It let go.'),
    // 4 · the light
    stoppedTitle: S('The chord stopped'),
    stopped: S('The chord stopped.'),
    silence: S('For the length of a heartbeat there was no sound in the Foundry but thirty-nine girls, and even that seemed small, because what had stopped was not a sound. It was the floor under all sound. Solenne had never heard silence before. No one in Aethelgard ever had. It was not quiet. Quiet is a sound. This was the absence of the thing that let sound exist, and she felt it in her inner ear as a falling, as if the whole Foundry had dropped an inch.'),
    lightCame: S('Then the light came down the Spire.'),
    dam: S('It came the way water comes when a dam goes, all at once and from everywhere, pouring off the white stone in sheets. It was the most beautiful thing she had ever seen for exactly as long as it took to reach the floor.'),
    took: S('Where it touched, it took.'),
    tankers: S('The iron tankers went first. They did not melt. They went <i>pale</i>, the black of the iron washing out to grey, to white, to the white of a dream you can\'t quite remember, and then they were simply less. Thinner. As if someone were erasing them from the edges in, until nothing was left where they had stood but a bright place on the floor.'),
    hands: S('A Tuning Man at the foot of the gantry put up his hands against it, and Solenne watched his hands go white, and then clear, and then she could see the bones in them, and then she could not see the bones.'),
    burnTitle: S('It took everything back'),
    burn: S('It did not burn. That was the thing she would never be able to make anyone understand. There was no heat, no smoke, and at first no screaming, because the people it touched were too busy being taken apart to scream. It was hungry. That was all. For ten thousand years, light had given. Now nothing was holding its law, and it did the only other thing it knew how to do.'),
    back: S('It took everything back.'),
    risersTitle: S('The throats first'),
    risers: S('It came for the risers last, and it came for the throats first, because the copper was bright and bright things called to it, and because, she understood later, the throats were where the song had been, and it was looking for the song. It went into Hesper\'s mouth like a hand into a glove. It went into Aude. It went into little Coralie, fifteen, who had stood at Solenne\'s left shoulder for three hundred days and signed jokes to her under their hems, and Solenne felt the wire in her own throat go hot with it—'),
    engSawTitle: S('The engineer'),
    engSaw: S('—and through the white she saw the engineer.'),
    conduit: S('He had not run. He had come down the gantry ladder in something closer to a fall than a climb, and he had the apprentices, three gantry boys, soot-faced, none of them older than twelve, by their collars, and he was throwing them one by one into the drainage conduit that ran under the tanker floor: a black iron throat with a grate over it, the one place in the Foundry the light had not yet found. Above the bore, the glass reservoir burst. A wall of liquid Aether-Glass came down the channel, blue as the bottom of a flame. He got the bulkhead door over the conduit half-shut and held it, shoulder and left arm braced against a door built to be closed by a winch, while the glass came over him.'),
    arm: S('She watched it pour over the arm, and she watched the arm stop being an arm. It went blue and still and clear to the shoulder, like something stopped in amber, and he screamed. Even screaming, he screamed on his note, the low one, the Reach one, the wet-earth note, and Solenne thought, stupidly, with the light in her mouth: <i>I\'ll never hear that again.</i>'),
    lookEngDoor: S('The engineer, at the bulkhead door'),
    lookEngDoorText: S('Shoulder and left arm braced against a door built to be closed by a winch. The arm is blue and still and clear to the shoulder.'),
    dissTitle: S('"Dissonance!"'),
    diss: S('"<i>Dissonance!</i>"'),
    knees: S('The Inquisitor was on his knees on the censer platform with the chain wrapped around his fist. The light had taken the platform\'s rail and was taking the hem of his robe, and his face was not afraid. It was sure.'),
    purify: S('"The choir has broken the unison — it is the <i>choir</i> — Flambeaux! Purify them! Purify the Rite!"'),
    staves: S('Along the walls, where they had stood for three hundred days with their fire-staves grounded, the Flambeaux lifted their staves.'),
    lastInstant: S('In the last instant before the fire reached her, Solenne looked up at the gallery.'),
    lookUpHint: S('Look up at the gallery.'),
    sisterTitle: S('Her sister was there'),
    sisterThere: S('Her sister was there.'),
    parted: S('The light had taken the gilded rail, and the carpets, and the old Canon who had stood at Seraphina\'s side each morning with his hands folded over his belly. It had not taken Seraphina. She stood in a small circle of untouched color in her white armor, both hands closed on the hilt of the Sun-Blade, and the light parted around her like a river around a stone. As if it knew her. As if it knew what she was holding.'),
    atLast: S('She was looking at the risers now. At last. At Solenne.'),
    noOpen: S('Her hands did not open.'),
    fireTook: S('<i>Look at me</i>, said Solenne\'s hands, and the fire took the risers.'),
    lookSeraBlade: S('Seraphina, in a circle of untouched color'),
    lookSeraBladeText: S('Both hands closed on the hilt of the Sun-Blade.'),
    // 5 · the wound
    woundTitle: S('The wound'),
    blast: S('The blast threw her backward, off the top tier, over the glass channels, into the only true dark left in the Foundry.'),
    wound: S('The wound.'),
    seam: S('The seam the bore had opened in the Spire\'s flank was a black crack in the white, and the light would not go into it, because the light had come out of it, and nothing goes back willingly into the place it has escaped from.'),
    fell: S('She fell.'),
    fellLong: S('She fell for a long time. Longer than the Spire was wide, longer than the mountain was deep. She fell out of the light and out of the heat and out of the sound of the Foundry dying, down into a dark that was not the dark of a room at night, or the dark behind closed eyes, or any dark that has another side to it.'),
    stillSinging: S('And in the dark, the wire in her throat went on singing.'),
    thin: S('Thin. Exact. Five hundred and twenty-eight beats to the second. The last note in the world.'),
    noHeart: S('She could not hear her heart. She could not hear her breath, or the rush of her own falling. There was nothing in the dark to carry a sound but her, and so there was nothing but the note—'),
    mouthTitle: S('Something opened'),
    opened: S('—until, far below her, patiently, something opened.'),
    mouth: S('She would never be able to say how she knew it was a mouth.'),
    tasted: S('It took her note in, the way the Spire had. Tasted it. Held it.'),
    back2: S('And then, carefully, perfectly, pitch for pitch, it sang her note back to her, the way a child repeats the first word it has ever been taught.'),
    endGo: S('The end of the Prologue.'),
    result: S('The note held, and the Spire let go. In the dark, something sang it back.'),
    // the Echo
    echoTitle: S('An Echo'),
    echoOff: S('No girl of the choir ever stepped down off the risers. That is a thread the Rite did not take. You are back on the top tier, at Coralie\'s right hand, and the note is still leaving you on every breath.'),
    echoGo: S('Again'),
  };
  // the recorded lines (voices/script.json), in the order the book has them
  const VO = {
    wire: ['tuningman.bell.copper'],
    choir3: ['ignatius.bell.patient', 'ignatius.bell.daughters'],
    today: ['ignatius.bell.today'],
    sunrises: ['ignatius.bell.sunrises', 'ignatius.bell.onenote'],
    oneLaw: ['ignatius.bell.onelaw'],
    oneHand: ['ignatius.bell.onehand'],
    swell: ['tuningman.bell.match'],
    stop: ['kaelen_foundry.bell.stop'],
    holdNote: ['ignatius.bell.hold'],
    diss: ['ignatius.bell.dissonance'],
    purify: ['ignatius.bell.purify'],
  };
  const voOf = (keys) => keys.reduce((a, k) => a.concat(VO[k] || []), []);
  const join = (keys) => keys.map((k) => TX[k]).join('<br><br>');

  // ================================================================ cards, messages, voices (the RITE43 helpers)
  const R = { t: 0, wait: false, ear: 0, earSaid: 0, white: 0, black: 0, drone: 0, humT: 0, lookT: 0, silentT: 0, counted: null, sparse: 0 };
  const plain = (t) => String(t).replace(/<br\s*\/?>(<br\s*\/?>)?/g, ' ').replace(/<[^>]+>/g, '');
  const seq = (ids) => { try { if (typeof RITE43 !== 'undefined' && RITE43.seq) RITE43.seq(ids); } catch (e) { warnOnce('seq', e); } };
  const hush = () => { try { if (typeof RITE43 !== 'undefined' && RITE43.hush) RITE43.hush(); } catch (e) { /* nothing playing */ } };
  function say(t, cls, ms, vo) { try { msg(plain(t), cls || '', ms || 6500); } catch (e) { /* cosmetic */ } if (vo && vo.length) seq(vo); }
  function card(title, keys, choices) {
    const hushed = choices.map((c) => Object.assign({}, c, { f: function () { hush(); return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(title, Array.isArray(keys) ? join(keys) : keys, hushed); } catch (e) { warnOnce('card', e); }
    if (Array.isArray(keys)) { const v = voOf(keys); if (v.length) seq(v); }
  }
  function echo(body, after) {
    if (typeof RITE43 !== 'undefined' && RITE43.echo) { try { RITE43.echo(body, after, TX.echoTitle, TX.echoGo); return; } catch (e) { warnOnce('echo', e); } }
    card(TX.echoTitle, body, [{ t: TX.echoGo, f: after }]);
  }
  const sfx = (name, ...a) => { try { Audio_.sfx[name](...a); } catch (e) { /* no audio yet */ } };
  function creakSfx() { sfx('song', 150, 0.4); }

  // ================================================================ flags (validated small integers)
  const FLAGS = { b69: [0, 6], b69_beat: [0, 40], b69_count: [0, 39], b69_ilse: [0, 1], b69_spoke: [0, 1], b69_seen: [0, 255], b69_signs: [0, 99], b69_echoes: [0, 99] };
  function fint(k) { const v = hasG() ? F()[k] : 0, r = FLAGS[k]; return (typeof v === 'number' && Number.isInteger(v) && v >= r[0] && v <= r[1]) ? v : 0; }
  function setf(k, v) { F()[k] = clamp(v | 0, FLAGS[k][0], FLAGS[k][1]); }
  function validate() { if (!hasG()) return; const f = F(); for (const k of Object.keys(f)) if (/^b69/.test(k) && (!FLAGS[k] || fint(k) !== f[k])) delete f[k]; }
  const stage = () => fint('b69');
  const beat = () => fint('b69_beat');
  function setStage(n) { setf('b69', n); setf('b69_beat', 0); R.t = 0; R.wait = false; }
  const SIGHTS = { spire: 1, bore: 2, glass: 4, choir: 8, censer: 16, gallery: 32, engineer: 64 };

  // ================================================================ art (procedural stand-ins, painted once) [PROPOSED looks]
  function makeTex(name, fn) {
    if (typeof Engine === 'undefined' || !Engine.addTexture || !Engine.textures || Engine.textures[name]) return;
    const d = new Uint32Array(64 * 64);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const o = fn(x, y); d[y * 64 + x] = (255 << 24) | ((clamp(o[2], 0, 255) | 0) << 16) | ((clamp(o[1], 0, 255) | 0) << 8) | (clamp(o[0], 0, 255) | 0); }
    Engine.addTexture(name, d);
  }
  const hsh = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 2246822519) >>> 0; h = Math.imul(h ^ (h >>> 13), 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  function paintTextures() {
    // the Spire: the white of a clean bone, seamless, with a faint vertical grain
    makeTex('b69_spire', (x, y) => { const g = Math.sin(x * 0.7 + hsh(x, 0, 3) * 2) * 4 + hsh(x, y >> 3, 4) * 6; return [226 + g, 222 + g, 210 + g]; });
    // the seam: black, with the blue of the glass at its lips
    makeTex('b69_seam', (x, y) => { const e = Math.abs(x - 32 - Math.sin(y * 0.3) * 6); if (e < 9) return [6, 6, 10]; if (e < 13) return [40, 90, 200]; return [222, 218, 206]; });
    // black iron, ribbed and buttressed, with rivets
    makeTex('b69_iron', (x, y) => { let c = 30 + hsh(x, y, 5) * 10; if (x % 16 < 3) c += 18; if (y % 32 < 2) c += 14; if (x % 16 === 8 && y % 8 === 4) c += 40; return [c, c * 0.96, c * 0.92]; });
    makeTex('b69_gilt', (x, y) => { const bar = x % 8 < 3 || y < 6 || y > 58; const c = bar ? 1 : 0.25; return [200 * c + hsh(x, y, 6) * 30, 160 * c, 70 * c]; });
    makeTex('b69_plate', (x, y) => { let c = 46 + hsh(x, y, 7) * 12; if (x % 32 === 0 || y % 32 === 0) c -= 20; if ((x % 32 === 3 || x % 32 === 29) && (y % 32 === 3 || y % 32 === 29)) c += 30; return [c, c * 0.95, c * 0.9]; });
    makeTex('b69_riser', (x, y) => { let c = 64 + hsh(x >> 1, y, 8) * 18; if (y % 16 === 0) c -= 26; return [c * 1.1, c * 0.86, c * 0.66]; });
    makeTex('b69_glass', (x, y) => { const w = Math.sin(x * 0.2 + y * 0.35) * 0.5 + 0.5; return [30 + w * 30, 90 + w * 60, 210 + w * 40]; });
    makeTex('b69_boards', (x, y) => { let c = 70 + hsh(x >> 2, y, 9) * 16; if (x % 16 === 0) c -= 24; return [c * 1.05, c * 0.9, c * 0.72]; });
  }
  function spriteCanvas(name) {
    const sp = typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites[name]; if (!sp) return null;
    const c = document.createElement('canvas'); c.width = sp.w; c.height = sp.h;
    c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(sp.data.buffer.slice(0)), sp.w, sp.h), 0, 0);
    return c;
  }
  function recolor(x, w, h, fn) {
    const id = x.getImageData(0, 0, w, h), d = id.data;
    for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 8) continue; const o = fn(d[i], d[i + 1], d[i + 2], (i >> 2) % w, ((i >> 2) / w) | 0); d[i] = o[0]; d[i + 1] = o[1]; d[i + 2] = o[2]; if (o.length > 3) d[i + 3] = o[3]; }
    x.putImageData(id, 0, 0);
  }
  const L = (x, x0, y0, x1, y1, col, lw) => { x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.strokeStyle = col; x.lineWidth = lw || 1; x.lineCap = 'round'; x.stroke(); };
  const Rc = (x, x0, y0, w, h, fill) => { x.fillStyle = fill; x.fillRect(x0, y0, w, h); };
  const El = (x, cx, cy, rx, ry, fill) => { x.beginPath(); x.ellipse(cx, cy, rx, ry, 0, 0, Math.PI * 2); x.fillStyle = fill; x.fill(); };
  function addSprite(name, w, h, draw) {
    if (typeof Engine === 'undefined' || !Engine.addSprite || (Engine.sprites && Engine.sprites[name])) return true;
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d', { willReadFrequently: true });
    if (draw(x) === false) return false;
    Engine.addSprite(name, { w, h, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)), hs: 1, cx: 0.5, dy: 0 });
    return true;
  }
  const lum = (r, g, b) => 0.3 * r + 0.59 * g + 0.11 * b;
  function paintPeople() {
    // a girl of the Sky Choirs: a white shift, the copper of the tuning collar at her throat
    addSprite('b69_girl', 55, 160, (x) => {
      const s = spriteCanvas('townswoman'); if (!s) return false; x.drawImage(s, 0, 0);
      recolor(x, 55, 160, (r, g, b, px, py) => { const l = lum(r, g, b); return py > 44 ? [150 + l * 0.42, 148 + l * 0.42, 146 + l * 0.44] : [r, g, b]; });
      Rc(x, 21, 40, 13, 4, '#b8743a'); Rc(x, 22, 41, 11, 1, '#e0a060');
    });
    // Seraphina in white armour (the Legion's plate turned white, the gold kept), and again with the Sun-Blade
    const sera = (blade) => (x) => {
      const s = spriteCanvas('legionnaire'); if (!s) return false; x.drawImage(s, 2, 0);
      recolor(x, 70, 160, (r, g, b, px) => { if (px < 13) return [0, 0, 0, 0]; const l = lum(r, g, b); if (r > g * 1.18 && r > 110) return [Math.min(255, r * 1.1), Math.min(255, g * 1.05), b * 0.8]; return [92 + l * 0.7, 92 + l * 0.68, 96 + l * 0.66]; });
      if (blade) { L(x, 36, 92, 36, 18, '#f2ecd0', 4); L(x, 36, 92, 36, 18, '#fffbe8', 2); Rc(x, 28, 90, 16, 4, '#c9a24a'); Rc(x, 33, 94, 6, 10, '#8a6a30'); }
    };
    addSprite('b69_seraphina', 70, 160, sera(false));
    addSprite('b69_seraphina_blade', 70, 160, sera(true));
    // the Sun-Blade on a cushion of cloth-of-gold
    addSprite('b69_blade', 80, 160, (x) => { El(x, 40, 150, 34, 8, '#b8902e'); El(x, 40, 147, 30, 6, '#e0c060'); L(x, 10, 143, 72, 140, '#f4eed6', 4); Rc(x, 8, 138, 4, 12, '#c9a24a'); });
    // the engineer: Kaelen's own figure, the arm still flesh (412), a long steel tuning fork in his fist
    addSprite('b69_engineer', 60, 160, (x) => {
      const s = spriteCanvas('kaelen'); if (!s) return false; x.drawImage(s, 0, 0);
      recolor(x, 60, 160, (r, g, b) => (b > r + 25 && g > r) ? [178, 132, 104] : [r, g, b]);
      L(x, 50, 100, 54, 66, '#c8ccd2', 2); L(x, 52, 66, 50, 58, '#c8ccd2', 1.5); L(x, 55, 66, 57, 58, '#c8ccd2', 1.5);
    });
    // the engineer at the bulkhead door, the arm gone blue and clear to the shoulder
    addSprite('b69_engineer_glass', 60, 160, (x) => {
      const s = spriteCanvas('kaelen'); if (!s) return false; x.drawImage(s, 0, 0);
      recolor(x, 60, 160, (r, g, b, px) => (px < 24 && (b > r + 25 && g > r)) ? [70, 150, 255] : [r, g, b]);
    });
    // pallets: a straw pallet on the boards, and one with a girl asleep under a white sheet
    const palletBase = (x) => { Rc(x, 2, 140, 76, 20, '#9a7a48'); Rc(x, 2, 138, 76, 5, '#c8a868'); };
    addSprite('b69_pallet', 80, 160, (x) => { palletBase(x); });
    // a pool of the glass in its channel, blue as the bottom of a flame
    addSprite('b69_pool', 80, 160, (x) => { El(x, 40, 152, 38, 7, '#2a5ad0'); El(x, 40, 151, 30, 5, '#5a9aff'); El(x, 34, 150, 12, 2, '#cfe4ff'); });
    addSprite('b69_pallet_girl', 80, 160, (x) => { palletBase(x); El(x, 44, 134, 30, 11, '#eeeae2'); El(x, 44, 130, 24, 6, '#fbf8f0'); El(x, 13, 134, 8, 7, '#e0c0a0'); El(x, 10, 130, 7, 6, '#5a3a22'); Rc(x, 18, 135, 5, 3, '#c88440'); });
    return !!(Engine.sprites && Engine.sprites.b69_girl && Engine.sprites.b69_engineer);
  }

  // ================================================================ the maps
  const SPOT = { x: 13.0, y: 6.5 };                    // her place: the top tier, at Coralie's right hand (Coralie at her left, east)
  const ARRIVE = { x: 2.2, y: 12.5, dir: 0 };          // the foot of the loft stair, on the west wall
  const GALLERY = { x: 13.0, y: 20.6 };                // Seraphina
  const RAIL = 3.55;                                   // the gilded rail's top: the gallery floor is at 3.2
  function buildLoft() {
    const m = new GameMap(LOFT, TX.loftName, 14, 12, { floor: 'b69_boards', ceil: 't_wood', fogDist: 9, fogColor: [6, 6, 10], ambient: 0.3, music: 'inside', danger: 0, spawn: { x: 6.5, y: 6.0, dir: 0 } });
    m.border('t_wood');
    m.set(13, 6, DOOR({ portal: { map: FOUNDRY, x: ARRIVE.x, y: ARRIVE.y, dir: ARRIVE.dir }, label: TX.stair }));
    m.baseCount = 0;
    return m;
  }
  function buildFoundry() {
    const W = 34, H = 32;
    const m = new GameMap(FOUNDRY, TX.foundryName, W, H, { outdoor: true, floor: 'b69_plate', floorTextures: ['b69_plate', 'b69_riser', 'b69_glass'], fogDist: 30, fogColor: [70, 64, 70], ambient: 0.36, music: 'cloister', danger: 0, spawn: ARRIVE });
    for (let x = 0; x < W; x++) { m.block(x, H - 1, 'b69_iron', 5); }
    for (let y = 0; y < H; y++) { m.block(0, y, 'b69_iron', 5); m.block(W - 1, y, 'b69_iron', 5); }
    for (let x = 0; x < W; x++) { m.block(x, 0, 'b69_spire', 16); m.block(x, 1, 'b69_spire', 16); }   // "past the place where the eye gave up"
    m.block(16, 1, 'b69_seam', 16); m.block(17, 1, 'b69_seam', 16);
    m.set(0, 12, DOOR({ portal: { map: LOFT, x: 12.2, y: 6.5, dir: Math.PI }, label: TX.stair }));
    // the glass channels: along the foot of the Spire, and south to the tanker bays
    for (let x = 3; x <= 30; x++) m.setFloor(x, 4, 2);
    for (let y = 5; y <= 24; y++) { m.setFloor(29, y, 2); m.setFloor(30, y, 2); }
    // the risers, three tiers, the top one nearest the Spire
    for (let x = 6; x <= 20; x++) for (let y = 6; y <= 11; y++) m.setFloor(x, y, 1);
    m.raise(6, 6, 20, 7, 0.6); m.raise(6, 8, 20, 9, 0.4); m.raise(6, 10, 20, 11, 0.2);
    // the censer platform the choir faces, the gantry, and above and behind the platform the gallery behind its gilded rail
    m.raise(11, 15, 15, 17, 1.6);
    m.raise(22, 6, 26, 9, 1.8);
    m.raise(8, 19, 18, 22, 3.2); m.setSide(8, 19, 18, 22, 'b69_iron');
    for (let x = 8; x <= 18; x++) m.block(x, 19, 'b69_gilt', RAIL);   // a rail on the gallery's edge, not a wall
    m.baseCount = 0;
    return m;
  }

  // ================================================================ the people (transient, restaged from the flags)
  const keyed = (m, k) => (m && m.entities || []).find((e) => e && e._b69 === k);
  function put(m, k, e) {
    let have = keyed(m, k); if (have) return have;
    have = Object.assign({ kind: 'deco', solid: true, radius: 0.3, scale: 1, use: 'b69_look' }, e, { transient: true, _b69: k });
    m.entities.push(have); return have;
  }
  function drop(m, pred) { if (!m) return; for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._b69 && pred(e)) m.entities.splice(i, 1); } }
  // the forty pallets of the loft: four rows of ten; Ilse's empty; your own empty (you are up)
  const PALLETS = []; for (const y of [2.2, 4.2, 7.8, 9.8]) for (let i = 0; i < 10; i++) PALLETS.push([2.0 + i * 1.05, y]);
  const OWN = 14, ILSE = 27;
  function stageLoft(m) {
    PALLETS.forEach(([x, y], i) => {
      const girl = i !== OWN && i !== ILSE;
      put(m, 'pallet' + i, { sprite: girl ? 'b69_pallet_girl' : 'b69_pallet', x, y, scale: 0.85, radius: 0.32, glow: 0.25, label: girl ? TX.lookGirl : (i === ILSE ? TX.lookIlse : TX.lookOwn), look: girl ? TX.lookGirlText : (i === OWN ? TX.pallet : null), _ilse: i === ILSE, _girl: girl, _far: false });
    });
  }
  // the choir: three rows of thirteen on the tiers, facing the censer platform; your place in the top row
  const NAMED = { 7: 'coralie', 5: 'hesper', 9: 'aude' };   // Coralie at her left shoulder (east, facing south)
  function stageFoundry(m) {
    const s = stage(), b = beat(), f = (k, sprite, x, y, o) => put(m, k, Object.assign({ sprite, x, y, _far: true }, o || {}));
    let n = 0;
    for (const [row, y] of [[0, 6.5], [1, 8.5], [2, 10.5]]) for (let i = 0; i < 13; i++) {
      const x = 7.0 + i, k = 'girl' + n++;
      if (row === 0 && Math.abs(x - SPOT.x) < 0.1) continue;   // hers
      const nm = NAMED[n - 1];
      f(k, 'b69_girl', x, y, { facing: Math.PI / 2, scale: 0.92, radius: 0.24, label: nm === 'coralie' ? TX.lookCoralie : nm === 'hesper' ? TX.lookHesper : nm === 'aude' ? TX.lookAude : TX.lookChoir, look: nm === 'coralie' ? TX.lookCoralieText : TX.lookChoirText, _sight: nm ? null : 'choir', _named: nm || null });
    }
    f('crane', 'flambeau', 13.0, 16.0, { facing: -Math.PI / 2, label: TX.lookCrane, _sight: 'censer', lightCol: [70, 40, 20] });
    f('censer', 'p12_censer', 13.6, 15.3, { scale: 0.55, solid: false, label: TX.lookCrane, _sight: 'censer', lightCol: [60, 40, 20] });
    f('sera', s >= 4 && b >= 11 ? 'b69_seraphina_blade' : 'b69_seraphina', GALLERY.x, GALLERY.y, { facing: -Math.PI / 2, label: TX.lookSera, _sight: 'gallery', lightCol: [60, 56, 48] });
    f('blade', 'b69_blade', GALLERY.x + 0.9, GALLERY.y + 0.1, { scale: 0.5, solid: false, label: TX.lookBlade, look: TX.lookBladeText });
    f('canon', 'deacon', GALLERY.x - 1.2, GALLERY.y, { facing: -Math.PI / 2, label: TX.lookCanon, look: TX.lookCanonText });
    [[9.5, 20.8], [10.5, 21.4], [16.4, 20.9], [17.3, 21.5]].forEach(([x, y], i) => f('noble' + i, i % 2 ? 'townswoman' : 'townsman', x, y, { facing: -Math.PI / 2, label: TX.lookNoble, look: TX.lookNobleText }));
    f('bore', 'bore', 16.95, 2.75, { scale: 3.2, radius: 1.0, glow: 0.4, label: TX.boreTitle, _sight: 'bore', lightCol: [20, 40, 120] });
    [[9.5, 4.5], [22.5, 4.5], [29.9, 15.5]].forEach(([x, y], i) => f('glass' + i, 'b69_pool', x, y, { scale: 0.7, solid: false, glow: 0.9, label: TX.lookGlass, _sight: 'glass', lightCol: [12, 34, 110] }));
    f('eng', 'b69_engineer', 22.6, 7.2, { facing: Math.PI, label: TX.lookEng, _sight: 'engineer' });
    f('tuning0', 'townsman', 24.2, 6.8, { facing: Math.PI, label: TX.lookTuning, look: TX.lookTuningText });
    f('tuning1', 'townsman', 25.4, 8.4, { facing: Math.PI, label: TX.lookTuning, look: TX.lookTuningText });
    f('tuning2', 'townsman', 21.2, 10.4, { facing: Math.PI, label: TX.lookTuning, look: TX.lookTuningText });   // at the foot of the gantry
    f('ladder', 'ladder', 21.6, 9.4, { scale: 1.2, solid: false, label: TX.lookTuning, look: TX.lookTuningText, nopick: true });
    [[23.5, 11.2], [24.4, 11.6], [25.3, 11.1]].forEach(([x, y], i) => f('boy' + i, 'pim', x, y, { scale: 0.72, facing: Math.PI, label: TX.lookBoy, look: TX.lookBoyText }));
    [[27.4, 13.0], [27.4, 17.0], [27.4, 21.0]].forEach(([x, y], i) => f('tanker' + i, 'lifttank', x, y, { scale: 0.9, radius: 0.5, label: TX.lookTanker, look: TX.lookTankerText, lightCol: [10, 24, 70] }));
    [[26.2, 14.6], [26.0, 19.4]].forEach(([x, y], i) => f('apron' + i, 'townsman', x, y, { facing: 0, label: TX.lookApron, look: TX.lookTankerText }));
    f('conduit', 'grate', 25.8, 25.6, { scale: 0.8, solid: false, label: TX.lookConduit, look: TX.lookConduitText });
    [[1.6, 6.5], [1.6, 18.5], [1.6, 26.0], [32.3, 12.0], [32.3, 27.0], [8.0, 29.6], [19.0, 29.6]].forEach(([x, y], i) => f('flam' + i, 'proctor', x, y, { facing: Math.atan2(SPOT.y - y, SPOT.x - x), label: TX.lookFlam, look: TX.lookFlamText }));
    applyState(m);
  }
  // what the light has taken, and where the engineer is, by the stage and step reached (idempotent)
  function applyState(m) {
    if (!m || m.id !== FOUNDRY) return;
    const s = stage(), b = beat(), at = (st, bt) => s > st || (s === st && b >= bt);
    const set = (k, fn) => { const e = keyed(m, k); if (e) fn(e); };
    for (let i = 0; i < 3; i++) set('tanker' + i, (e) => { e.hidden = at(4, 5); });
    set('tuning2', (e) => { e.hidden = at(4, 6); });
    for (const k of ['tuning0', 'tuning1', 'apron0', 'apron1', 'noble0', 'noble1', 'noble2', 'noble3']) set(k, (e) => { e.hidden = at(4, 7); });
    for (const e of m.entities) if (e && e._named) e.hidden = at(4, 8);
    const conduit = at(4, 8);
    set('eng', (e) => { e.x = conduit ? 25.0 : 22.6; e.y = conduit ? 25.0 : 7.2; e.sprite = conduit ? 'b69_engineer_glass' : 'b69_engineer'; e.label = conduit ? TX.lookEngDoor : TX.lookEng; e.look = conduit ? TX.lookEngDoorText : null; e._sight = conduit ? null : 'engineer'; });
    for (let i = 0; i < 3; i++) set('boy' + i, (e) => { e.hidden = conduit; });
    const staves = at(4, 10);
    for (const e of m.entities) if (e && /^flam/.test(e._b69 || '')) e.animSprite = staves && Engine.sprites && Engine.sprites.proctor_a1 ? 'proctor_a1' : null;
    const sister = at(4, 11);
    set('canon', (e) => { e.hidden = sister; });
    set('blade', (e) => { e.hidden = sister; });
    set('sera', (e) => { e.sprite = sister ? 'b69_seraphina_blade' : 'b69_seraphina'; e.label = sister ? TX.lookSeraBlade : TX.lookSera; e.look = sister ? TX.lookSeraBladeText : null; e._sight = sister ? null : 'gallery'; });
    let changed = false;
    for (let x = 8; x <= 18; x++) { const c = m.get(x, 19); if (sister && c && c.tex === 'b69_gilt') { m.set(x, 19, null); changed = true; } else if (!sister && !c) { m.block(x, 19, 'b69_gilt', RAIL); changed = true; } }
    if (changed && G.map === m) { const cam = Object.assign({}, Engine.cam); try { Engine.setMap(m); } catch (e) { /* the rail's relief */ } Object.assign(Engine.cam, cam); }
    for (const e of m.entities) if (e && e._b69 && /^girl/.test(e._b69) && s >= 5) e.hidden = true;
  }

  // ================================================================ 1 · the loft
  function tickLoft(dt) {
    if (G.mapId !== LOFT) return;
    if (!R.counted) R.counted = new Set();
    const c = Engine.cam;
    PALLETS.forEach(([x, y], i) => { if (i !== OWN && i !== ILSE && dist(c.x, c.y, x, y) < 1.6) R.counted.add(i); });
    const n = Math.min(39, R.counted.size + 1);
    if (n > fint('b69_count')) { setf('b69_count', n); if (n === 39) say(TX.counted, 'voice', 8000); }
    drone(dt);
  }
  function drone(dt) { R.drone += dt; if (R.drone > 2.4) { R.drone = 0; sfx('song', 528, 2.6); } }
  function lookIlse() {
    setf('b69_ilse', 1);
    card(TX.ilseTitle, ['ilse', 'hive'], [{ t: TX.go, f: null }]);
  }
  function trySpeak() {
    if (!fint('b69_spoke')) { setf('b69_spoke', 1); card(TX.speakTitle, ['speak', 'speakOne'], [{ t: TX.go, f: null }]); return; }
    say(TX.note, '', 4500); sfx('song', 528, 1.2);
  }

  // ================================================================ 2 · the floor
  function arriveFoundry() {
    const s = stage();
    if (s <= 1) {
      setStage(2);
      const show = () => card(TX.foundryTitle, ['scab', 'cathedral'], [{ t: TX.floorGo, f: () => say(TX.floorHint, 'warn', 9000) }]);
      if (!fint('b69_spoke')) { setf('b69_spoke', 1); card(TX.speakTitle, ['speak', 'speakOne'], [{ t: TX.go, f: show }]); } else show();
    }
  }
  function look(e) {
    const k = e._sight;
    if (k) {
      setf('b69_seen', fint('b69_seen') | SIGHTS[k]);
      if (k === 'spire') card(TX.spireTitle, ['spire1', 'spire2', 'spire3', 'tired'], [{ t: TX.go, f: null }]);
      else if (k === 'bore') card(TX.boreTitle, ['bore'], [{ t: TX.go, f: null }]);
      else if (k === 'glass') card(TX.glassTitle, ['glass', 'pulses', 'heartbeat'], [{ t: TX.go, f: null }]);
      else if (k === 'choir') card(TX.choirTitle, ['choir1', 'choir2', 'choir3'], [{ t: TX.go, f: null }]);
      else if (k === 'censer') card(TX.censerTitle, ['censer', 'believed'], [{ t: TX.go, f: null }]);
      else if (k === 'gallery') card(TX.galleryTitle, ['gallery', 'sister', 'everyHands'], [{ t: TX.lookAtMe, f: () => { setf('b69_signs', fint('b69_signs') + 1); say(TX.everyNot, '', 6000); } }]);
      else if (k === 'engineer') card(TX.engTitle, ['eng1', 'eng2', 'eng3', 'eng4', 'eng5', 'eng6', 'eng7'], [{ t: TX.go, f: null }]);
      return true;
    }
    if (e._ilse) { lookIlse(); return true; }
    say(e.look || e.label || '', '', 6000);
    return true;
  }
  function tickFloor(dt) {
    if (G.mapId !== FOUNDRY) return;
    drone(dt);
    const c = Engine.cam, eng = keyed(G.map, 'eng');
    if (eng && dist(c.x, c.y, eng.x, eng.y) < 6) {   // his hum, near the gantry
      R.humT -= dt;
      if (R.humT <= 0) { R.humT = 6; sfx('song', 87, 2.2); if (!R.humSaid) { R.humSaid = true; say(TX.hum, 'voice', 7000); } }
    }
    if (dist(c.x, c.y, SPOT.x, SPOT.y) < 0.75) { setStage(3); c.x = SPOT.x; c.y = SPOT.y; c.dir = Math.PI / 2; }
  }

  // ================================================================ the timelines (3 the Swell, 4 the light, 5 the wound)
  // each step: { w: seconds after the step before, do() } or { card() } (waits for its choice) or { gate() } (waits for it)
  const next = () => { setf('b69_beat', beat() + 1); R.t = 0; R.wait = false; applyState(G.maps && G.maps[FOUNDRY]); };
  const cardStep = (title, keys, choiceKey, then) => ({ card() { card(TX[title], keys, [{ t: TX[choiceKey || 'go'], f: () => { if (then) then(); next(); } }]); } });
  const SWELL = [
    cardStep('dawnTitle', ['today', 'dawn'], 'lookAtMe', () => { setf('b69_signs', fint('b69_signs') + 1); say(TX.everyNot, '', 5000); }),
    { w: 1.5, do: () => say(TX.sunrises, 'voice', 11000, voOf(['sunrises'])) },
    { w: 11, do: () => { say(TX.creaked, '', 2500); creakSfx(); } },
    { w: 2, do: () => say(TX.oneLaw, 'voice', 2500, VO.oneLaw) },
    { w: 2.5, do: () => { say(TX.creak, '', 2000); creakSfx(); } },
    { w: 1.5, do: () => say(TX.oneHand, 'voice', 2500, VO.oneHand) },
    { w: 2.5, do: () => say(TX.answered, '', 6000) },
    { w: 4, card() { sfx('crack'); card(TX.swellTitle, ['swell', 'chord'], [{ t: TX.listen, f: () => { R.ear = 0; R.earSaid = 0; say(TX.listenHint, 'warn', 8000); next(); } }]); } },
    { gate: (dt) => listen(dt) },
    cardStep('askedTitle', ['asked', 'words', 'isItTime', 'knew', 'singingIt']),
    { card() { sfx('glasshit'); card(TX.forkTitle, ['fork', 'forkHit', 'stop', 'noLook', 'holdNote', 'held'], [{ t: TX.holdGo, f: () => next() }]); } },
    { card() { card(TX.letGoTitle, ['gods', 'mistake', 'believedThem', 'letGo'], [{ t: TX.go, f: () => setStage(4) }]); } },
  ];
  const LIGHT = [
    { card() { R.silentT = 4; card(TX.stoppedTitle, ['stopped', 'silence'], [{ t: TX.go, f: () => next() }]); } },
    { w: 1, do: () => say(TX.lightCame, 'warn', 4000) },
    { w: 2.5, do: () => say(TX.dam, '', 7000) },
    { w: 7, do: () => say(TX.took, 'warn', 3500) },
    { w: 2.5, do: () => say(TX.tankers, '', 9000) },
    { w: 8, do: () => say(TX.hands, '', 8000) },
    cardStep('burnTitle', ['burn', 'back']),
    cardStep('risersTitle', ['risers']),
    cardStep('engSawTitle', ['engSaw', 'conduit', 'arm']),
    { card() { card(TX.dissTitle, ['diss', 'knees', 'purify', 'staves'], [{ t: TX.go, f: () => { next(); say(TX.lastInstant, '', 7000); say(TX.lookUpHint, 'warn', 7000); R.lookT = 0; } }]); } },
    { gate: (dt) => lookUp(dt) },
    { card() { card(TX.sisterTitle, ['sisterThere', 'parted', 'atLast', 'noOpen'], [{ t: TX.lookAtMe, f: () => { setf('b69_signs', fint('b69_signs') + 1); say(TX.fireTook, 'bad', 6000); try { fx('hurt', 900); } catch (e) { /* cosmetic */ } setStage(5); } }]); } },
  ];
  const WOUND = [
    { w: 2.5, card() { card(TX.woundTitle, ['blast', 'wound', 'seam', 'fell'], [{ t: TX.go, f: () => next() }]); } },
    { w: 1, do: () => say(TX.fellLong, '', 9000) },
    { w: 8.5, do: () => say(TX.stillSinging, 'voice', 4000) },
    { w: 3.5, do: () => say(TX.thin, 'voice', 6000) },
    { w: 5, do: () => say(TX.noHeart, '', 8000) },
    { w: 7.5, card() { sfx('song', 528, 3); setTimeout(() => sfx('song', 527, 3), 1400); card(TX.mouthTitle, ['opened', 'mouth', 'tasted', 'back2'], [{ t: TX.endGo, f: () => end() }]); } },
  ];
  const LINES = { 3: SWELL, 4: LIGHT, 5: WOUND };
  function runLine(dt) {
    const s = stage(), line = LINES[s]; if (!line || R.wait) return;
    const st = line[beat()]; if (!st) return;
    if (st.gate) { if (st.gate(dt)) next(); return; }
    R.t += dt; if (R.t < (st.w || 0)) return;
    if (st.card) { R.wait = true; st.card(); return; }
    st.do(); next();
  }
  // listening: standing still, the chord comes closer
  const EAR_SECS = 14;
  function listen(dt) {
    const c = Engine.cam, moved = R.lastPos ? dist(c.x, c.y, R.lastPos[0], R.lastPos[1]) > 0.002 : false;
    R.lastPos = [c.x, c.y]; R.still = !moved;
    if (!moved) R.ear = Math.min(1, R.ear + dt / EAR_SECS);
    if (R.ear >= 0.4 && R.earSaid < 1) { R.earSaid = 1; say(TX.closer, 'voice', 9000); }
    if (R.ear >= 0.75 && R.earSaid < 2) { R.earSaid = 2; say(TX.narrowing + ' ' + TX.holdingFor, 'voice', 10000); }
    return R.ear >= 1;
  }
  // looking up at the gallery: facing it, or after fifteen seconds (in the book she looks)
  function lookUp(dt) {
    const c = Engine.cam; R.lookT += dt;
    let a = Math.atan2(GALLERY.y - c.y, GALLERY.x - c.x) - c.dir; while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2;
    return Math.abs(a) < 0.5 || R.lookT >= 15;
  }
  function tickScene(dt) {
    if (G.mapId !== FOUNDRY) return;
    const s = stage(), c = Engine.cam;
    if (R.silentT > 0) R.silentT -= dt; else if (s < 5) drone(dt);
    if (s === 4 && beat() >= 1) R.white = Math.min(0.62, R.white + dt * 0.02);
    if (s >= 5) { R.black = Math.min(1, R.black + dt * 0.6); c.x = SPOT.x; c.y = SPOT.y; }
    // stepping down off the risers is a thread the book does not have: an Echo, and back in your place
    if ((s === 3 || s === 4) && !R.wait && dist(c.x, c.y, SPOT.x, SPOT.y) > 1.3) {
      setf('b69_echoes', fint('b69_echoes') + 1); R.wait = true;
      echo(TX.echoOff, () => { c.x = SPOT.x; c.y = SPOT.y; c.dir = Math.PI / 2; R.wait = false; R.lastPos = null; });
      return;
    }
    runLine(dt);
  }

  // ================================================================ start, end, the overlays
  function solenne(p) {
    p.name = 'Solenne Aubade'; p.face = 2; p.weapons = ['hands']; p.weapon = 0; p.voice = 0; p.gold = 0;
    return p;
  }
  function start() {
    paintTextures(); paintPeople();
    solenne(G.player);
    G.journal = []; G.tod = 0.21; G.noise = 1;
    for (const k of Object.keys(G.flags)) if (/^b69/.test(k)) delete G.flags[k];
    R.counted = new Set(); R.white = 0; R.black = 0; R.wait = false; R.t = 0;
    G.maps[LOFT] = buildLoft(); G.maps[FOUNDRY] = buildFoundry();
    setStage(1);
    loadMap(LOFT); G.state = 'play'; G.keys = {};
    journal('main', TX.woke);
    card(TX.wakeTitle, ['catechism', 'place', 'woke', 'wire', 'numb', 'pallet'], [{ t: TX.wakeGo, f: () => say(TX.loftHint, 'warn', 8000) }]);
    return true;
  }
  function end() {
    setStage(6);
    const result = { id: ID, text: TX.result, signs: fint('b69_signs'), echoes: fint('b69_echoes') };
    R.black = 0; R.white = 0;
    try { if (typeof RITE43 !== 'undefined') RITE43.grey(false); } catch (e) { /* cosmetic */ }
    try { if (typeof Weather !== 'undefined' && Weather.release) Weather.release(); } catch (e) { /* none */ }
    try { EXTRAS17.finish(result); } catch (e) { warnOnce('finish', e); }
    return result;
  }
  function onLoad() {
    if (!here()) return;
    validate();
    R.t = 0; R.wait = false; R.lastPos = null; R.lookT = 0; R.silentT = 0;
    const s = stage(), b = beat();
    R.white = s === 4 && b >= 1 ? Math.min(0.62, 0.02 * 8 * b) : 0; R.black = s >= 5 ? 1 : 0;
    if (s === 3 && b === 8) { R.ear = R.ear || 0; }
    paintPeople();
    if (G.mapId === LOFT) stageLoft(G.map);
    else { stageFoundry(G.map); arriveFoundry(); if (stage() >= 3) { const c = Engine.cam; c.x = SPOT.x; c.y = SPOT.y; } }
    G.tod = G.mapId === LOFT ? 0.21 : (stage() >= 3 ? 0.27 : 0.24);
    try { if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear'); } catch (e) { /* the sky is the engine's */ }
  }
  function post(Fr) {
    if (!here() || G.mapId !== FOUNDRY || !Fr || !Fr.fb) return;
    const a = R.black > 0 ? R.black : R.white; if (a <= 0.001) return;
    const fb = Fr.fb, N = Fr.w * Fr.h, k = (a * 256) | 0, to = R.black > 0 ? 0 : 255;
    for (let i = 0; i < N; i++) {
      const p = fb[i], r = p & 255, g = (p >> 8) & 255, b = (p >> 16) & 255;
      fb[i] = (p & 0xff000000) | ((b + (((to - b) * k) >> 8)) << 16) | ((g + (((to - g) * k) >> 8)) << 8) | (r + (((to - r) * k) >> 8));
    }
  }
  function drawOverlay() {
    if (!here() || G.state !== 'play') return;
    const ctx = Engine.ctx; if (!ctx) return;
    const s = stage();
    ctx.save(); ctx.font = '8px "Alegreya SC", serif'; ctx.textAlign = 'center';
    const Y = (typeof VIEW_H === 'number' ? VIEW_H : 150) - 30;
    const bar = (y, frac, col) => { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(110, y, 100, 5); ctx.fillStyle = col; ctx.fillRect(110, y, Math.max(0, Math.min(100, 100 * frac)), 5); };
    if (G.mapId === LOFT) { ctx.fillStyle = '#d9c8a0'; ctx.fillText(TX.hudVoices + ' · ' + Math.max(1, fint('b69_count')), 160, Y); }
    else if (s === 3 && beat() === 8) { ctx.fillStyle = R.still ? '#cfe0ff' : '#9aa0b0'; ctx.fillText(TX.hudSpire + ' · ' + (R.still ? TX.hudCloser : TX.hudStill), 160, Y); bar(Y + 4, R.ear, '#cfe0ff'); }
    ctx.restore();
  }

  // ================================================================ the wiring (inert unless this extra runs)
  function useOwn(e) {
    if (!e || !e._b69 || e.use !== 'b69_look') return false;
    return look(e);
  }
  function farPick() {
    if (!here() || G.mapId !== FOUNDRY || stage() < 2 || stage() > 4) return null;
    let e = null; try { e = Engine.pick(G.ents, 16); } catch (err) { e = null; }
    return e && e._b69 && e._far && e.use === 'b69_look' ? e : null;
  }
  function wire() {
    const has = (n) => typeof window[n] === 'function';
    if (has('buildAllMaps')) { const _f = buildAllMaps; buildAllMaps = function () { const maps = _f.apply(this, arguments); try { if (active()) { maps[LOFT] = buildLoft(); maps[FOUNDRY] = buildFoundry(); } } catch (e) { warnOnce('maps', e); } return maps; }; }
    if (has('loadMap')) { const _f = loadMap; loadMap = function () { if (active()) { try { paintTextures(); paintPeople(); } catch (e) { /* art retries */ } } const r = _f.apply(this, arguments); try { onLoad(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (has('update')) { const _f = update; update = function (dt) { const r = _f.apply(this, arguments); try { if (here() && G.state === 'play') { G.player.voice = 0; const s = stage(); if (s <= 1) tickLoft(dt || 0); else if (s === 2) tickFloor(dt || 0); else tickScene(dt || 0); } } catch (e) { warnOnce('update', e); } return r; }; }
    if (has('drawHUD')) { const _f = drawHUD; drawHUD = function () { const r = _f.apply(this, arguments); try { drawOverlay(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (has('useDeco')) { const _f = useDeco; useDeco = function (e) { try { if (here() && useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _f.apply(this, arguments); }; }
    if (has('interact')) { const _f = interact; interact = function () { try { const e = farPick(); if (e) { useOwn(e); return undefined; } } catch (err) { warnOnce('interact', err); } return _f.apply(this, arguments); }; }
    if (has('castSong')) { const _f = castSong; castSong = function () { if (here()) { try { trySpeak(); } catch (e) { warnOnce('speak', e); } return undefined; } return _f.apply(this, arguments); }; }
    if (has('renderRest')) { const _f = renderRest; renderRest = function () { if (here()) { G.state = 'play'; say(TX.noRest, 'warn', 3500); return undefined; } return _f.apply(this, arguments); }; }
    if (has('travelBlocked')) { const _f = travelBlocked; travelBlocked = function () { if (active()) return TX.noTravel; return _f.apply(this, arguments); }; }
    if (has('travelOpen')) { const _f = travelOpen; travelOpen = function () { if (active()) { G.state = 'play'; say(TX.noTravel, 'warn', 3500); return undefined; } return _f.apply(this, arguments); }; }
    if (has('wallLabel')) { const _f = wallLabel; wallLabel = function (cell) { try { if (here() && cell && WALLS[cell.tex]) return WALLS[cell.tex]; } catch (e) { /* fall through */ } return _f.apply(this, arguments); }; }
    // the Spire is a sight too: E at its white flank
    if (has('interact')) { const _i = interact; interact = function () { try { if (here() && G.mapId === FOUNDRY && stage() >= 2 && stage() <= 4) { const w = Engine.pickWall(14); if (w && w.cell && (w.cell.tex === 'b69_spire' || w.cell.tex === 'b69_seam') && !Engine.pick(G.ents, 16)) { look({ _sight: 'spire' }); return undefined; } } } catch (e) { warnOnce('spire', e); } return _i.apply(this, arguments); }; }
    try { if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook((Fr) => { try { post(Fr); } catch (e) { warnOnce('post', e); } }, 44); } catch (e) { warnOnce('hook', e); }
  }
  const WALLS = { b69_spire: TX.wallSpire, b69_seam: TX.wallSeam, b69_iron: TX.wallIron, b69_gilt: TX.wallGilt };
  function register() {
    try { if (typeof EXTRAS17 !== 'undefined' && EXTRAS17.register) EXTRAS17.register({ id: ID, title: TX.title, tag: TX.tag, blurb: TX.blurb, start, unlocked: () => true }); } catch (e) { warnOnce('register', e); }
  }
  try { wire(); register(); } catch (e) { console.warn('bell69 failed to wire', e); }

  return { ID, MAPS, TX, TEXTS, VO, R, FLAGS, SPOT, GALLERY, PALLETS, OWN, ILSE, SIGHTS, LINES, EAR_SECS, active, here, stage, beat, fint, validate, start, end, look, trySpeak, buildLoft, buildFoundry, applyState, keyed: (k) => keyed(G.map, k) };
})();
if (typeof window !== 'undefined') window.BELL69 = BELL69;
