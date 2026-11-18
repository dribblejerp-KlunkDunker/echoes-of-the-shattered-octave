// ============================================================
//  rift100 — Phase 100: the Continental Rift, part one. Null-Watch's heart: the Wall and the Talking Halls (Phase 89
//  plan and Phase 90 layout, approved by the owner 14 Nov; the building order approved with them: the Heights, then the
//  Rift). Built with the Souls rules from the start (js/souls91.js).
//
//  CANON (Book Three ch. 2; Vol VI §1; Phase 89 "VIII. The Continental Rift"). As of Harvestmonth 419, a season before
//  the book: the Quartermaster is alive and lowers his basket most nights, Ninety-Four is the General's voice, and
//  nobody here has heard of the Drift-Kestrel.
//   - The wall: obsidian in blocks the size of wagons, the mortar lead, the whole of it laced with thick grey tungsten
//     cable strung from iron eyes. Every two hundred yards a squat round tower, forty on four miles, and on every tower
//     under a lead hood a gun: a flared brass mouth like the bell of a horn, nine feet across. The dampening batteries.
//     Beyond the wall, bare grey rock for thirty yards, and then the land stops: the not-colour, which cannot be looked at.
//   - Standing Order Nine: keep talking. Within about thirty yards of the lip anyone who goes silent begins to go: not
//     pulled, relieved. So the Watch talks, in pairs, about nothing: onions, the days of the week, cable-eyes, the price
//     of lamp-oil. "You go quiet on the Watch and somebody sounds the bell. They don't look first." A hundred and eighty
//     have "gone to listen" since the year of the crack. Paired watchers sit by the bunks and talk to the sleepers.
//   - Men and women in grey, in long coats with lead plates sewn into them, a rota-number stitched on the breast instead
//     of a name. Names come back at discharge.
//   - General Theresa Ward: fifty, short, broad, grey hair cropped; a lead coat, a dented breastplate of plain dark iron,
//     a faded sash. Mute since the first night (spring 413), when she laid the batteries by voice for thirty-one hours.
//     She commands in iron-cant, knuckles on the iron over her heart (the Fortis sappers' old code); her voice says it
//     after her: "The General says ...". 94 (Elric Orrel of Fenwick; penal legion from 416 for debt; lamp-oil).
//   - Two-Eleven (big, slow, from the Peaks; a dog called Rufus that could open a gate). Nineteen (grey, a scarred
//     eyebrow, fifty). Eighty-Eight (Davey Pruett of Coldharrow, who is learning the whole of iron-cant). The
//     Quartermaster, Halvard Greer of Greystairs (condemned in spring 413 for striking an officer who struck a boy; cannot
//     read; can write his name and two words more).
//   - The Watch's mooring-mast and mooring-yard; a stair from the yard up to the wall-walk between Towers Five and Six.
//     Tower stairs go round inside the obsidian; a door with STANDING ORDER NINE painted over it at the height of a man's
//     eyes; posterns at the towers' feet. From the foot of Tower Nine a buttress of rock runs out toward the Rift like a
//     pier, and on its end a crane: a gallows-shape of black oak with a wheel on top, and a rope.
//   - The Lead Brothers: hooded, faces sealed in hammered lead, standing along the lip a hundred yards apart. The only
//     men on the Watch allowed to be silent. They do not fetch back anyone who is not theirs.
//
//  THE PLACE (two maps). p100_wall, 372 x 133 cells, a cell a step and a half, cut by tools/maps/wall100.py from the
//  Cymatic City Engine's own 852 Hz plan of Null-Watch (js/rift100_grid.js): east is the Rift. p100_halls: the Talking
//  Halls, the squad's barrack and Magazine Four, indoors. Rooms, as Phase 90 drew them:
//    1 the west gate (shut: the plain is a later phase)      2 the gate lamp (a talking-post)
//    3 the Talking Halls (so loud your own sounds are lost)  4 a talking-post in the Halls (a lamp), and the talk-roster
//    5 the squad's barrack (a secret, behind a hung blanket): the lullaby's words in a footlocker
//    6 Magazine Four (the keeper): the Stray says its lullaby among the powder
//    7 the wall (the hazard): battery to battery; keep talking
//    8 Tower Nine's foot (a lamp): the postern to the buttress, the crane and the rope (barred: a later phase)
//    9 the battery rail (the shortcut: an ammunition trolley, chocked at Tower Nine's end)
//  MOVED FOR THE BOOK: Phase 90 drew the way in at the west gate. Book Three has the Watch's mooring-yard under the wall,
//  with a stair from it to the wall-walk between Towers Five and Six, so the Kestrel moors there and the west gate is the
//  far end. The battery rail has a third stop for it, at the mooring-yard [PROPOSED].
//  THE DANGER: quiet. On the wall, a traveller who stops talking is Relieved and walks to the parapet and over it. Talk
//  (the Murmur, N) says the next line of your subject; a manned battery rings its bell and fetches you back; an unmanned
//  stretch does not. In Magazine Four: powder. A shot fired there is the end of the magazine.
//  THE KEEPER: the Stray in Magazine Four [PROPOSED, Phase 89]: a Carillon Legionnaire left with the Watch to guard the
//  powder, whose core has begun remembering (Vol II: the Legion-Stray). It stopped mid-patrol nine days ago and says a
//  lullaby, three lines of four, over and over. It cannot be put down by blows. Say the fourth line and it stands down.
//  Flags (small ints): p100_subj (your subject: 0 none, 1 the days, 2 cable-eyes, 3 onions, 4 the road), p100_line (the
//  next line of it), p100_eyes (cable-eyes counted), p100_words (the footlocker read), p100_stray (stood down),
//  p100_kdrop (its leavings given), p100_rail (the trolley freed), p100_seen (bits: said once). Lamps: SOULS91 group 'm'.
//  Everything not in the books is [PROPOSED]. Nothing visual uses random numbers.
// ============================================================
'use strict';

const RIFT100 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('rift100: ' + k, e); } };
  const TX = {
    name: S('Null-Watch: the Wall'), nameHalls: S('Null-Watch: the Talking Halls'),
    // the Kestrel
    fly: S('Fly east to Null-Watch, on the Continental Rift.'),
    arrive: S('Two days east the land goes flat and grey, and the wind loses its voice. Then a line of black walls on the edge of the land: obsidian in blocks the size of wagons, mortared with lead and netted with cable, and on every squat tower a brass mouth nine feet across under a lead hood. Before you can see a face you can hear them. Everybody on that wall is talking.'),
    down: S('You come down the mast-ladder into the mooring-yard. A short broad woman in a dented iron breastplate stands at the foot of it with her hands behind her back, and beside her a young man with 94 stitched on his coat, who does not stop talking.'),
    toLabel: S('the mooring-yard, Null-Watch'),
    ladder: S('The Kestrel\'s ladder, at the Watch\'s mooring-mast. Climb aboard'),
    mast: S('The Watch\'s mooring-mast. Three mast-crews stand to the windlass, and all three are talking.'),
    // the places
    yard: S('The mooring-yard. A stair goes up from it to the wall-walk between Towers Five and Six.'),
    obsidian: S('Obsidian: black volcanic glass in blocks the size of wagons. The mortar between them is dull grey, and it is lead.'),
    cable: S('Tungsten cable, thick as a wrist, strung from iron eyes in slack loops and tight diagonals, like a net thrown over the wall to hold it down.'),
    barrack: S('A barrack block. Somebody inside is talking. Somebody inside is always talking.'),
    chain: S('A chain across the foot of the wall stair, with a talk-roster nailed up beside it.'),
    chainMsg: S('Two-Eleven puts a hand like a shovel on the chain. "Not without a subject. Nobody goes on the wall without one. See the roster in the Halls, pick something you can keep up, and come back. I\'ll be here. I\'m always here."'),
    order9: S('A door in the foot of the tower. Painted over it, at the height of a man\'s eyes: STANDING ORDER NINE.'),
    order9Label: S('STANDING ORDER NINE'),
    order9Msg: S('The tower stair, round and round inside the obsidian. A trooper on the first landing shakes her head at you and goes on telling her partner about a cousin\'s wedding. Not this stair.'),
    walk: S('The wall-walk. The wind comes over the obsidian off the edge of the world with no sound in it.'),
    parapet: S('The parapet. Beyond it, thirty yards of bare grey rock, and then the land stops.'),
    battery: S('A dampening battery: a flared brass mouth like the bell of a horn, nine feet across, under a lead hood, pointing out over the edge of the land. It does not throw shot. It throws noise.'),
    bell: S('The battery\'s bell, with a rope worn black. They ring it when somebody goes quiet, and they do not look first.'),
    unmanned: S('Tower Eight. The hood is down over the gun and nobody is standing to it. From here to Nine, the only voice on the wall is yours.'),
    rock: S('Bare grey rock, flat, with nothing growing on it and nothing lying on it.'),
    notColour: S('The not-colour.'),
    brothers: S('A Lead Brother: tall, hooded, in a robe of dull grey that hangs to the ground without a fold. He faces the edge. He does not turn round.'),
    crane: S('Out on the end of the buttress, a crane: a gallows-shape of black oak with a wheel on top, and a rope.'),
    buttress: S('A buttress of rock runs out from the foot of Tower Nine toward the Rift, like a pier into a sea.'),
    postern: S('A postern in the obsidian, at the foot of Tower Nine'),
    posternMsg: S('The postern is barred with a balk of black oak, and the bar is worn pale in the middle where a pair of hands lifts it most nights. Not yours. Not tonight.'),
    northWalk: S('The wall-walk goes on north, battery after battery, for three miles more. A corporal\'s rope is across it here, and a talk-roster nailed to the post.'),
    southWalk: S('The wall-walk goes on south toward Tower Four and the yard of the Discharge. A rope is across it here.'),
    gate: S('The west gate of Null-Watch'),
    gateMsg: S('The west gate is shut and the bar is down. Beyond it is the plain, the mooring-field four miles out, and the road to the Redoubt with its ninety posts. The gate-guard talks to you about the price of boot-grease until you go away.'),
    gateSign: S('The west gate. The plain is on the other side of it.'),
    hallsDoor: S('The Talking Halls'), hallsOut: S('Out to the street'),
    magPostern: S('Magazine Four\'s postern'),
    magPosternMsg: S('Magazine Four\'s postern is barred from inside. Somebody in there is talking, low, the same few words, over and over. It does not sound like a trooper.'),
    magPosternOut: S('Out to the magazine lane'),
    lane: S('The magazine lane. Four low doors in the obsidian, each with a numeral cut over it and a felt mat on the step.'),
    towerFoot: S('Tower Nine\'s foot. The buttress, the crane and the rope are on the other side of that postern.'),
    lookAway: S('You find you are looking at your own boots, and cannot remember lowering your eyes.'),
    // the Souls lamps: talking-posts
    lampLabel: S('A talking-post, dark: a lantern on an iron post, and under it a tin with a note in it. Stand by it to light it.'),
    lampLit: S('A talking-post, lit. Use it to rest, and read aloud what the last trooper left.'),
    lampGate: S('The gate lamp'), lampHalls: S('A talking-post in the Halls'), lampNine: S('Tower Nine\'s foot'),
    note0: S('The note in the tin says, in pencil: "Read this out. Then put one back." You read it out.'),
    note1: S('The note in the tin is a list of every dog the writer ever owned, with their faults. You read it aloud, all of it, as you are meant to.'),
    note2: S('The note in the tin says: "Sixth hour. Nothing. Wind from nowhere. Onions for supper, I am told. Read this out." You read it out.'),
    // the talk-roster and your subject
    roster: S('The talk-roster: a board the length of the wall, chalked with rota-numbers, hours and subjects. Read it'),
    rosterTitle: S('The talk-roster'),
    rosterBody: S('Every number on the Watch has an hour and a subject against it, so that nobody runs out. <i>94: lamp-oil. 211: a dog. 19: hens.</i> Running out of your subject is a disgrace here, and borrowing another\'s is theft. At the bottom, in a different chalk: <i>VISITORS. Pick one and keep to it.</i>'),
    subjDays: S('The days of the week, in order, and round again.'),
    subjEyes: S('Counting cable-eyes. Somebody has to.'),
    subjOnions: S('Onions, and what to do with them.'),
    subjRoad: S('The road you came by.'),
    subjTaken: S('The roster-corporal chalks it up against VISITOR without looking round. "That\'s yours, then. Nobody else may have it. Say a bit of it whenever you can\'t think of anything. On the wall, say it anyway." You have a subject (Murmur, N).'),
    talkNone: S('You talk, low, about nothing in particular. It is harder than it sounds.'),
    days0: S('"Rootday, Hearthday, Massday, Stasisday,"'), days1: S('"Dawnday, Driftday, Memoryday, Nullday,"'),
    eyes: S('"{0}, {1}, {2}." Cable-eyes, north face.'),
    onions0: S('"You take your onions, and you want them sliced thin. Not chopped. Thin."'),
    onions1: S('"And you want a heavy pan, and the fat hot before they go in, or they stew."'),
    onions2: S('"And you leave them alone. That is the whole of it. People will not leave an onion alone."'),
    onions3: S('"Salt at the end. My mother said the beginning. My mother was wrong about a number of things."'),
    road0: S('"Two days east, and the land going grey under us the whole of the second."'),
    road1: S('"The wind stopped having a sound in it at about the fourth hour. I kept waiting for it to start again."'),
    road2: S('"And then the wall, and all of you on it, and I could hear you before I could see you."'),
    hallsLoud: S('The Talking Halls. A hundred people are talking at once, flat and steady and about nothing, and it does not stop. You cannot hear your own feet. Nobody could hear anything you did in here.'),
    // the quiet
    quietWarn: S('You have gone quiet. Keep talking (Murmur, N).'),
    relieved: S('Something is lifted off you, like a pack at the end of a long march. There is nothing you have to do. Your feet know the way.'),
    bellSave: S('A bell, close and flat. A hand takes you by the collar and a voice that does not stop for breath says, "—Rootday, Hearthday, come on, Massday, say it with me, Stasisday—" and you are standing on the wall-walk again, and your mouth is dry.'),
    talkSave: S('You hear your own voice, and it is like being called by name. You stop walking.'),
    overEdge: S('the edge'),
    // Magazine Four and the Stray
    blanket: S('A grey blanket weighted with lead, hung across an arch. Somebody has hung it to look like a wall'),
    passage: S('The powder passage. A lantern burns behind thick glass let into the wall, so that the light comes in and the flame stays out.'),
    feltSign: S('Chalked on the wall: NO FLAME. NO SHOT. NO IRON ON STONE. FELTS ON.'),
    feltRack: S('A rack of felt overshoes for the magazines, grey with powder. Take a pair'),
    feltTake: S('You take a pair of the felts off the rack.'),
    feltHave: S('A rack of felt overshoes for the magazines, grey with powder.'),
    kegs: S('Powder, in kegs hooped with copper, stacked to the vault. For the wall\'s own guns, the old ones, that throw shot.'),
    magDoor: S('Magazine Four'),
    magDoorMsg: S('Magazine Four. The door is barred from inside. Through it, low and level, a voice that is not a trooper\'s, saying something that scans.'),
    magDoorOpen: S('Magazine Four'),
    locker: S('A footlocker with 51 burned into the lid. Open it'),
    lockerTitle: S('Fifty-One\'s footlocker'),
    lockerBody: S('On top, the Sermon of the Chaplain, which is in every footlocker on the Watch, gone soft with reading aloud. Under it, a talk-roster sheet, and on the back of the sheet in pencil, in a careful hand:<br><br><i>The lamp is low, the bread is put away,<br>The hens are shut, the dog is on the stair,<br>Your father\'s boots are drying by the grate,<br>And nothing\'s wanted of you anywhere.</i><br><br>The last line is underlined twice. Beside it: <i>it never gets this far.</i>'),
    lockerClose: S('Put it back as you found it.'),
    jWords: S('In a footlocker in the Talking Halls I found a cradle-song written out, four lines. The thing in Magazine Four says three of them. Nobody has said the fourth to it.'),
    strayName: S('The Stray in Magazine Four'),
    strayDesc: S('A Carillon Legionnaire, left with the Watch to guard the powder. Nine days ago it stopped in the middle of its patrol. It lets nobody into the magazine, and it says a cradle-song, three lines of it, over and over.'),
    strayWake: S('It turns its brass skull toward you, and grounds the butt of its halberd on the stone, very gently, because of the powder. It does not stop saying the words.'),
    line1: S('The Stray: "The lamp is low, the bread is put away."'),
    line2: S('The Stray: "The hens are shut, the dog is on the stair."'),
    line3: S('The Stray: "Your father\'s boots are drying by the grate."'),
    lineGap: S('The Stray stops. It waits, with its head a little on one side. Nothing comes. (If you know what comes next, say it: Murmur, N.)'),
    lineAgain: S('It begins again.'),
    notNow: S('It does not hear you. It is saying the words.'),
    noWords: S('You do not know what comes next. Somebody on this Watch does: somebody wrote it down.'),
    sayTitle: S('What comes next'),
    sayBody: S('<i>"Your father\'s boots are drying by the grate,"</i> it says, and stops, and waits. What do you say?'),
    sayRight: S('"And nothing\'s wanted of you anywhere."'),
    sayWrong1: S('"And all the doors are barred against the night."'),
    sayWrong2: S('"So hush now, hush, and be as quiet as a mouse."'),
    sayNothing: S('Say nothing.'),
    wrong: S('It is the wrong line. The Stray\'s head comes up, and the halberd comes round, and it begins again from the beginning, louder.'),
    hushed: S('You say <i>hush</i> and <i>quiet</i>, on the Watch, to a thing that has been saying the same three lines for nine days. Its halberd comes round flat and hard.'),
    stoodDown: S('You say it. The Stray does not move for the length of the line. Then it says the whole of it through, once, all four lines, in a voice that was never a soldier\'s, and steps back from the powder, and grounds its halberd, and stands as a sentry stands when the relief has come.'),
    rings: S('Your blow rings on the bell-plate. It does not stop saying the words.'),
    shot: S('Not in here. A shot in a powder magazine is the last thing anybody does. You lower it.'),
    strayStood: S('The Stray, stood down. It stands at ease beside the kegs with its halberd grounded. Now and then, very low, it says four lines, and stops.'),
    tape: S('Nine days of brass tape, where the Stray\'s tally has been running out of its breastplate onto the floor'),
    // the battery rail
    railChocked: S('The battery rail: an ammunition trolley on an iron track that runs the foot of the wall. Its wheels are chocked with a wedge of black oak. Knock the chock out'),
    railFree: S('You knock the chock out. The trolley shifts on its rail, and a trooper two towers off looks round without stopping talking. It will run to the mooring-yard and the west gate now, and back.'),
    railStop: S('The battery rail. Ride the trolley'),
    railDead: S('The battery rail. The track runs off along the foot of the wall, but no trolley is standing on it. It must be chocked somewhere up the line.'),
    railTitle: S('The battery rail'),
    railBody: S('The trolley is a flat iron bed on four small wheels, with a brake-lever like a pump-handle. It has carried shot for the old guns and bread for the new ones. Where to?'),
    railToNine: S('Tower Nine\'s foot.'), railToYard: S('The mooring-yard.'), railToGate: S('The west gate.'), railStay: S('Stay here.'),
    railRide: S('You pump the lever. The trolley runs the foot of the wall, under the cable, past door after door with somebody talking behind it.'),
    // the keeper's leavings and the gear
    tapeItem: S('Nine Days of Brass Tape'), tapeDesc: S('A coil of punched brass tape, a yard for every patrol the Stray in Magazine Four made. The last nine days of it are the same three rows of holes, over and over. An Arbiterium armourer would pay for it, and would ask where you got it.'),
    mallet: S('Magazine Mallet'), malletDesc: S('A mallet for starting the bungs of powder kegs: a head of green copper on an ash handle, because copper strikes no spark. The squad of Magazine Four gave it to you. It has 4 cut into the handle.'),
    coat: S('Watch Coat'), coatDesc: S('A long grey coat with lead plates sewn into it, and a square of cloth on the breast where a rota-number goes. You walk in it like somebody wading.'),
    mitts: S('Wall Mitts'), mittsDesc: S('Grey wool mitts with a palm of lead foil quilted in, for holding cable in the wind off the edge. The thumbs are darned.'),
    felts: S('Powder-Felts'), feltsDesc: S('Felt overshoes from the magazines, grey with powder. No nails, no iron. You make no sound in them and strike no spark.'),
    spike: S('Cable-Spike'), spikeDesc: S('A splicing spike for tungsten cable: a foot of iron tapering to a blunt point, a ring at the head, the grip bound with tarred cord. Every trooper who has counted cable-eyes has one.'),
    setTalk: S('quiet takes half as long again to come on you'), setBell: S('a manned battery\'s bell reaches you from twice as far'),
    // the people
    ward: S('General Theresa Ward'), n94: S('Ninety-Four, the General\'s voice'), n211: S('Two-Eleven'), n19: S('Nineteen'), n88: S('Eighty-Eight'),
    qm: S('The Quartermaster'), trooper: S('A trooper of the Watch'), rosterCorp: S('The roster-corporal'), issue: S('One-Oh-Six, at the issue-hatch'),
    corp: S('Corporal One-Forty-Two'), n51: S('Fifty-One'), n207: S('Two-Oh-Seven'), watcher: S('A watcher by the bunks'), mastCrew: S('One of the mast-crew'),
    sleeper: S('A trooper asleep. Somebody is sitting by the bunk, talking to keep the sleeper\'s breathing company.'),
    bunk: S('A bunk, made up tight.'), table: S('A mess table, scrubbed white.'), hatch: S('The issue-hatch.'),
    jStray: S('I said the fourth line to the Stray in Magazine Four, and it stood down. Its squad have not reported it. They say they will see.'),
  };
  // what they say [PROPOSED where the books do not say it]. A trooper's greeting is whatever he was in the middle of.
  const SAY = {
    ward: {
      greet: { polite: S('(She strikes her breastplate with her knuckles: twice, sharp; a long flat blow; three quick taps.) "The General says, welcome to Null-Watch. The General says, keep talking."'),
        normal: S('(Two short blows, a pause, one long.) "The General says, state your ship and your business, and say it aloud, and go on saying something after."'),
        blunt: S('(She does not strike the iron at all. Ninety-Four fills the gap.) "The General is waiting for you to say that again, in another way."') },
      topics: {
        [S('The Watch')]: S('(Four flat heavy blows.) "The General says, the Watch holds the wall. The General says, the Watch holds the wall and nothing else."'),
        [S('The Synod')]: S('"The General says the Watch obeys the Synod when the Synod is not mad. The General says the Synod has been mad since the spring of 413."'),
        [S('The first night')]: S('"The General says nothing about that." (Ninety-Four goes on, in the same voice.) "Spring of 413. The batteries were new and nobody knew how to lay them. She laid them by voice, tower to tower in the dark, for thirty-one hours. At dawn on the second day she opened her mouth to say cease firing, and nothing came out."'),
        [S('Standing Order Nine')]: S('(One blow, struck hard enough to ring.) "The General says, keep talking. On the wall, in the yards, on the stairs. The General says, if you go quiet somebody will ring a bell, and they will not look first."'),
      },
    },
    n94: {
      greet: { polite: S('"—and that is a traveller, General, off the Coast skyship, and civil with it— Ninety-Four. I say what the General says."'), normal: S('"—and the bag is patched on the starboard side, General, a good deal— Yes? Ninety-Four."'), blunt: S('"—and that one has a mouth on them, General. I would not, if I were you. She can hear tone."') },
      topics: {
        [S('Iron-cant')]: S('It was the Fortis sappers\' code, tapped on pipes in the deep galleries where a voice does not carry. She strikes it on the iron over her heart. Everybody on the Watch learns the battery calls. Almost nobody learns the whole of it. I have enough to say it after her.'),
        [S('Lamp-oil')]: S('That is my subject. Three sovereigns the cask at the Fenwick chandler\'s when I left, and four here, and the sutler says five by Frostmonth, and the wicks are extra. Nobody else may have lamp-oil. Ask on the roster.'),
        [S('Fenwick')]: S('In the Reach. I owed money there. You get the wall for a debt of that size. Three years, so far.'),
        [S('The General\'s voice')]: S('It is not an appointment. It is come by. The one before me talked about rope. When I stop, somebody will come up a stair and offer.'),
      },
    },
    n211: {
      greet: { polite: S('"—he could open a gate, that dog. Not push it. Open it. Evening. You\'re quiet. You want to watch that, here."'), normal: S('"—and the food, which is always worse. You\'re quiet. You want to watch that, here."'), blunt: S('"Shout if you like. It all counts. It\'s the quiet ones we ring the bell for."') },
      topics: {
        [S('Standing Order Nine')]: S('You go quiet on the Watch and somebody sounds the bell. Standing order. Nine. They don\'t look first. They don\'t ask. They just ring it. It\'s not a punishment. It\'s because the ones that go quiet are the ones that go.'),
        [S('Gone to listen')]: S('Over. To listen. Near enough a hundred and eighty since the year of the crack, and every one of them went quiet first. So we talk.'),
        [S('What to talk about')]: S('Nothing that matters. Nobody on the Watch does. That\'s what talk is for. That\'s the whole trick of it. Onions. Days of the week. Counting cable-eyes. My dog.'),
        [S('The dog')]: S('Rufus. I had him as a boy in the Peaks. He\'d lift the latch with his nose and walk the gate back, and then he\'d sit down in the gap and look at you, as if you\'d asked him to.'),
        [S('The wall stair')]: S('Up to the walk between Five and Six. Keep to the manned batteries till you\'ve got the way of it. Eight\'s hooded this week. From Seven to Nine there\'s nobody but you.'),
      },
    },
    n19: {
      greet: { polite: S('"—so I numbered them instead. Nineteen. Keep talking."'), normal: S('"—and the grey one went broody in the spring— What."'), blunt: S('"That\'s it. Loud is fine. Loud is alive."') },
      topics: {
        [S('Hens')]: S('I kept eleven. You name a hen and it dies, so I numbered them. Then I came here, and they numbered me.'),
        [S('The batteries')]: S('Brass, nine feet across the mouth, under a lead hood. They don\'t throw shot. They throw noise. Forty of them, at dawn, out over the edge of the world, every day since the crack. We call it the Refusal.'),
        [S('The edge')]: S('Thirty yards of bare rock, and then the land stops. Don\'t look at it long. You can\'t, anyway. You\'ll find you\'re looking at your boots.'),
        [S('The Lead Brothers')]: S('The only men on the Watch allowed to be silent. Lead over the face, hammered to fit, no holes in it. They stand along the lip and listen for us. When one of theirs starts to walk, the two beside him fetch him back. They don\'t fetch us.'),
      },
    },
    n88: {
      greet: { polite: S('"—two short, a pause, one long: that is yes. Sorry. Eighty-Eight. I was listening to her knuckles."'), normal: S('"—four flat: the Watch holds the wall. Everybody knows that one."'), blunt: S('"If you are going to shout, shout something with a rhythm. I can use that."') },
      topics: {
        [S('Iron-cant')]: S('Everybody learns the battery calls. I am learning the rest. There is nothing to do on the wall but talk and listen, so I talk with my mouth and listen with everything else.'),
        [S('Coldharrow')]: S('In the Peaks. You would not know it. I would not know it now.'),
      },
    },
    qm: {
      greet: { polite: S('Keep talking. Stores are the other side of the Watch. This is Nine. Nothing here is for issue.'), normal: S('Keep talking.'), blunt: S('Keep talking. Somewhere else.') },
      topics: {
        [S('Greystairs')]: S('In the Peaks. I hit an officer who had hit a boy. Spring of \'13. They sent me to the end of the world for it. It had only just become the end.'),
        [S('The postern')]: S('Barred. It goes out onto the rock, to the buttress and the crane. Nobody goes out there without my leave, and you have not got it.'),
        [S('Reading')]: S('I can\'t. I can write my name and two words more. It has been enough.'),
      },
    },
    tr_a: { greet: { polite: S('"—and then you take your onions, and you want them sliced thin, not chopped, thin, and you want a heavy pan—"'), normal: S('"—thin, I said, and a heavy pan—"'), blunt: S('"—that\'s the way, good and loud, now the pan—"') },
      topics: { [S('Keep talking')]: S('Standing Order Nine. You get used to it. The new ones can\'t sleep for a month, and after that they can\'t sleep anywhere else.') } },
    tr_b: { greet: { polite: S('"—forty-one, forty-two, forty-three, and that\'s the cable-eyes on the north face of Six done, now the south face, forty-four—"'), normal: S('"—forty-four, forty-five— don\'t make me lose my place— forty-six—"'), blunt: S('"—forty-seven! Forty-eight! See, I can do it loud as well—"') },
      topics: { [S('Cable-eyes')]: S('The iron eyes the cable runs through. Somebody counts them every watch. If the count comes out different, either an eye has gone or the counter has, and both are worth knowing.') } },
    tr_c: { greet: { polite: S('"—told her, I said, you can have the blue or you can have the green, but you can\'t have both and expect your mother not to say something—"'), normal: S('"—the blue, in the end. Obviously the blue—"'), blunt: S('"—and she had a voice on her like yours, as it happens—"') },
      topics: { [S('The General')]: S('She shouted her voice to rags that first night. Shouted it to bits, and the bits went over the edge, and she\'s never had it back. Now, the thing with gravy—') } },
    tr_d: { greet: { polite: S('"—Rootday, Hearthday, Massday, Stasisday, Dawnday, Driftday, Memoryday, Nullday, Rootday, Hearthday—"'), normal: S('"—Massday, Stasisday, Dawnday—"'), blunt: S('"—Driftday! Memoryday! Nullday! Go on, you take the next round—"') },
      topics: { [S('The days')]: S('It\'s the easiest subject there is. You can\'t run out. You get to Nullday and there\'s Rootday again, waiting for you.') } },
    mastcrew: { greet: { polite: S('"—and that\'s her lines made fast, and that\'s the windlass pawled— Mind the ladder."'), normal: S('"—Coast-built, by the cut of her, and knocked about—"'), blunt: S('"—and that one shouts. Good. Shout on the wall and you\'ll live."') },
      topics: { [S('The mooring-mast')]: S('Not many ships come. The Synod\'s packets, with the condemned, four times a year. A sutler\'s barge when the wind allows. You.') } },
    roster: {
      greet: { polite: S('Subject?'), normal: S('Number and subject. No number? Visitor, then. Subject.'), blunt: S('Subject. I have four hundred of these to chalk before the hour.') },
      topics: {
        [S('A subject')]: S('Read the board. Pick one of the visitors\' four. Keep to it. If you dry up on the wall, say the days: nobody has ever run out of days.'),
        [S('The talking-post')]: S('A lantern and a tin. Whoever sat there last leaves a note for whoever sits there next, and you read it out. It does not matter what it says. It matters that it gets said.'),
        [S('The sleepers')]: S('Somebody sits by every bunk and talks, to keep the sleeper\'s breathing company. Two hours on. It is the kindest duty on the roster and the dullest.'),
      },
    },
    issue: {
      greet: { polite: S('Issue. Coat, mitts, spike. You sign with a mark if you can\'t sign.'), normal: S('Issue. What.'), blunt: S('Issue. Mind your tone, or you can go on the wall in what you stand up in.') },
      topics: {
        [S('The coat')]: S('Lead plates, sewn in. It will not stop the quiet. Nothing stops the quiet but your own mouth. But it is the Watch\'s coat, and the Watch knows its own.'),
        [S('Felts')]: S('Not from me. The magazines keep their own, on a rack. You do not walk on powder in nails.'),
      },
    },
    corp: {
      greet: { polite: S('Nothing through there. Blankets. Keep talking and keep moving.'), normal: S('Move along. Keep talking.'), blunt: S('Say that louder and I will have you counting cable-eyes till Frostmonth.') },
      topics: { [S('Magazine Four')]: S('Shut for the damp. Nine days. It is routine, and it is on the sheet as routine.') },
    },
    corpAfter: { [S('Magazine Four')]: S('You finished it. None of us would. We did not know what it would do when it got to the end.'),
      [S('The report')]: S('A Legionnaire that stops is to be reported, and it goes back to the Arbiterium to be melted. That is the order. It has stood its watch for six years. We will see about the report.') },
    n51: {
      greet: { polite: S('"—my nan sang it. Every night. I\'d know it in my sleep. I do know it in my sleep."'), normal: S('"—four lines. It only ever does three."'), blunt: S('"Not so loud. Not about that."') },
      topics: {
        [S('The song')]: S('A cradle-song. It is from where I am from, and I am not saying where. I wrote it out so I would stop hearing the gap at the end. It is in my locker, under the Sermon.'),
        [S('Why nobody has said it')]: S('Because it stops at the third line, and waits, and then it starts again, and while it is doing that it is still here. Nobody knows what it does when it gets to the end.'),
      },
    },
    n207: {
      greet: { polite: S('"—and it grounds the halberd soft, every time. Because of the powder. It still knows about the powder."'), normal: S('"—nine days. Ten tomorrow."'), blunt: S('"Shh— no. Not that. Sorry. Keep talking. Just not about that."') },
      topics: {
        [S('The Legionnaire')]: S('The Arbiterium left it with us when the old guns went out of use, to mind the powder. Six years it has walked the same nine paces. Nine days ago it stopped in the middle of them and said something about bread.'),
        [S('The powder passage')]: S('Through the barrack and down. Felts on. No flame, no shot, no iron on stone. It will not open the big door to anybody, but it has never thought to bar ours.'),
      },
    },
    watcher: { greet: { polite: S('"—and then your sister wrote, and the calf was a heifer after all— I can do both. Go on."'), normal: S('"—in, and out, that\'s it, and the calf—"'), blunt: S('"Wake him and you take the next two hours."') },
      topics: { [S('The sleepers')]: S('You talk to their breathing. In, and out. If it changes, you talk closer. It has never failed yet in this hall, and nobody wants to be the one it fails for.') } },
  };

  // ---------------------------------------------------------------- the place: the wall
  const MAP = 'p100_wall', HALLS = 'p100_halls';
  const G0 = typeof RIFT100_GRID !== 'undefined' ? RIFT100_GRID : null;
  const W = G0 ? G0.w : 372, H = G0 ? G0.h : 133;
  const RC = G0 ? G0.rc : 166.6667, CX = G0 ? -G0.x0 * RC : 171.667, CY = G0 ? -G0.y0 * RC : 110;   // the city's centre and radius, in cells
  const WH = 5.0, PARA = 0.55, COPE_H = 0.2, TOWER_TOP = 7.6, VOID_Z = -40;
  const pol = (r, deg) => [CX + r * Math.cos(deg * PI / 180), CY - r * Math.sin(deg * PI / 180)];
  const rOf = (x, y) => Math.hypot(x - CX, y - CY), degOf = (x, y) => Math.atan2(CY - y, x - CX) * 180 / PI;
  const TOWERS = [5, 6, 7, 8, 9].map((n) => ({ n, deg: (n - 5) * 9, at: pol(RC + 0.4, (n - 5) * 9), manned: n !== 8 }));
  const STAIRS = [{ deg: 4.5, r0: RC - 19, r1: RC - 5 }, { deg: 32.5, r0: RC - 18, r1: RC - 5 }];   // the stair from the mooring-yard; the stair down to Tower Nine's foot
  const ARC0 = -9, ARC1 = 52;                           // the wall facing the Rift, in degrees (the rest of the rim is the inner wall toward the plain)
  // floors (index 2 is the engine's "you cannot walk here")
  const SETT = 0, FLAG = 1, ROCK = 2, WALK = 3, NOTC = 4, YARD = 5, STEP = 6, COPE = 7;
  const FLOORS = ['t_p100_sett', 't_p100_flag', 't_p100_rock', 't_p100_walk', 't_p100_not', 't_p100_yard', 't_p100_step', 't_p100_cope'];
  const P = {
    yard: [296, 90, 318, 108], mast: [304.5, 99.5], kestrel: [304.5, 98.6], arrive: [305.6, 101.4], ward: [308.4, 100.4], n94: [309.2, 101.6],
    chain: [319.5, 98.5], n211: [317.2, 96.4], stairTop: [334.2, 97.6], order9: [319, 93],
    square: [164, 105, 179, 115], hallsDoor: [171, 104], hallsOut: [171.5, 106.4],
    lane: [225, 81, 236, 89], magDoor: [230, 80], magOut: [230.5, 82.6],
    gate: [8, 103, 22, 117], gateDoor: [6, 110], gateLamp: [12.5, 106.5],
    nine: [288, 15, 300, 26], nineLamp: [292.5, 18.5], qm: [297.4, 22.4],
    railNine: [290.5, 24.4], railYard: [299.5, 106.4], railGate: [18.5, 114.6],
  };
  const ROUTES = {   // carved ways (cells): the main street from the west gate to the mooring-yard, and the spur to the magazine lane
    main: [[20, 110], [60, 110], [118, 110], [164, 110], [180, 110], [204, 102], [236, 93], [268, 96], [296, 99]],
    lane: [[230, 89], [231, 95]],
  };
  // ---- the Halls (indoors)
  const HW = 70, HH = 37;
  const Q = {
    in: [24.5, 21.4], door: [24, 23], post: [24.5, 4.6], board: [27.6, 3.4], rosterCorp: [21.5, 5.6], issue: [38.5, 9.4],
    blanket: [49, 11], corp: [47.5, 13.6], magDoor: [49, 19], locker: [56.5, 4.4], n51: [53.5, 6.6], n207: [47.6, 8.4],
    bDoor: [59, 6], rack: [61.5, 7.4], sign: [60.4, 9.5], stray: [56.5, 28.5], tape: [55.2, 29.6], east: [67, 28], eastIn: [65.5, 28.5], bigIn: [49.5, 21.6],
    hall: [3, 8, 44, 22], niche: [20, 3, 28, 7], landing: [46, 12, 52, 18], barrack: [46, 3, 58, 10], passage: [60, 5, 62, 20], mag: [48, 21, 66, 34],
  };

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const canvas = (w, h, fn) => { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h); return x; };
    const add = (name, w, h, hs, fn, glowTest, meta) => {
      if (Engine.sprites[name]) return; const x = canvas(w, h, fn);
      Engine.addSprite(name, Object.assign({ w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }, meta || {}));
      if (glowTest && Engine.setEmissive) { const d = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(d[i * 4], d[i * 4 + 1], d[i * 4 + 2], d[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    const tex = (name, fn) => { if (Engine.textures && Engine.textures[name]) return; const x = canvas(64, 64, fn); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    const line = (x, c, w, pts) => { x.strokeStyle = c; x.lineWidth = w; x.beginPath(); x.moveTo(pts[0], pts[1]); for (let k = 2; k < pts.length; k += 2) x.lineTo(pts[k], pts[k + 1]); x.stroke(); };
    if (Engine.addTexture) {
      // obsidian in great blocks, the joints lead: black glass with a cold sheen along each block's upper edge, a few
      // conchoidal flake-scars, and the dull grey of the lead standing proud in the joints
      const obsidian = (x, cable) => {
        px(x, '#7c8088', 0, 0, 64, 64);   // the lead
        for (const [bx, by, bw, bh, s] of [[1, 1, 62, 30, 1], [1, 33, 30, 30, 2], [33, 33, 30, 30, 3]]) {
          for (let j = 0; j < bh; j++) for (let i = 0; i < bw; i++) { const n = h2((bx + i) >> 2, (by + j) >> 2 + s) * 10 + h2(bx + i, by + j + s) * 4, k = 1 - j / bh; const v = 12 + n + k * 8; px(x, `rgb(${v | 0},${(v + 1) | 0},${(v + 6) | 0})`, bx + i, by + j); }
          px(x, 'rgba(150,160,190,0.30)', bx, by, bw, 1); px(x, 'rgba(110,118,150,0.16)', bx, by + 1, bw, 1);   // the sheen
          for (let k = 0; k < 3; k++) { const fx = bx + 4 + ((h2(s, k) * (bw - 12)) | 0), fy = by + 6 + ((h2(k, s + 5) * (bh - 12)) | 0); x.strokeStyle = 'rgba(96,104,134,0.35)'; x.lineWidth = 1; x.beginPath(); x.arc(fx, fy + 6, 6, PI * 1.15, PI * 1.85); x.stroke(); x.beginPath(); x.arc(fx, fy + 8, 9, PI * 1.25, PI * 1.75); x.stroke(); }
        }
        px(x, '#5c6068', 0, 31, 64, 1); px(x, '#5c6068', 31, 33, 1, 31);   // the joint's shadow side
        if (cable) {   // tungsten cable from iron eyes: a slack loop and a tight diagonal
          for (const [ex, ey] of [[6, 8], [58, 8], [32, 40]]) { px(x, '#2a2c30', ex - 3, ey - 3, 6, 6); px(x, '#0c0c0e', ex - 1, ey - 1, 2, 2); px(x, '#5a5e66', ex - 3, ey - 3, 6, 1); }
          x.strokeStyle = '#6e7480'; x.lineWidth = 2.4; x.beginPath(); x.moveTo(6, 9); x.quadraticCurveTo(32, 34, 58, 9); x.stroke();
          x.strokeStyle = '#9aa0ac'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(6, 8); x.quadraticCurveTo(32, 33, 58, 8); x.stroke();
          line(x, '#6e7480', 2.2, [58, 9, 32, 40]); line(x, '#6e7480', 2.2, [32, 40, 0, 62]); line(x, '#9aa0ac', 0.7, [58, 8, 32, 39]);
        }
      };
      tex('t_p100_obsidian', (x) => obsidian(x, false));
      tex('t_p100_cable', (x) => obsidian(x, true));
      // a barrack block's face: obsidian, a narrow shuttered window with a slit of lantern-light, a rota-board by it
      tex('t_p100_barrack', (x) => {
        obsidian(x, false);
        px(x, '#4a4e56', 24, 12, 16, 22); px(x, '#17181c', 26, 14, 12, 18); for (let j = 16; j < 32; j += 4) px(x, '#2a2c32', 26, j, 12, 1);
        px(x, '#d8a860', 31, 15, 2, 16); px(x, '#f6dc9c', 31, 20, 2, 6);
        px(x, '#3a3228', 46, 16, 10, 14); for (let j = 18; j < 29; j += 3) px(x, '#c8c4b4', 47, j, 8, 1);
      });
      tex('t_p100_door', (x) => {
        obsidian(x, false);
        px(x, '#3c4048', 14, 6, 36, 58); px(x, '#22201e', 17, 9, 30, 55);
        for (let i = 0; i < 5; i++) px(x, '#2e2a26', 17 + i * 6, 9, 1, 55);
        for (const j of [16, 38, 58]) { px(x, '#4e525a', 17, j, 30, 3); for (let i = 0; i < 5; i++) px(x, '#8a8e96', 19 + i * 6, j + 1, 1, 1); }
        px(x, '#6a6e76', 42, 36, 3, 6);
      });
      // the door in the tower's foot: STANDING ORDER NINE painted over it at the height of a man's eyes (Book Three ch. 2)
      tex('t_p100_order9', (x) => {
        obsidian(x, false);
        px(x, '#3c4048', 16, 20, 32, 44); px(x, '#1c1b1a', 19, 23, 26, 41); for (let i = 0; i < 4; i++) px(x, '#2a2826', 19 + i * 7, 23, 1, 41);
        px(x, '#d8d4c8', 6, 6, 52, 11);   // the painted band
        const word = (s0, ox, oy) => { for (let k = 0; k < s0.length; k++) { const c = s0.charCodeAt(k); if (c === 32) continue; for (let b = 0; b < 3; b++) for (let r = 0; r < 4; r++) if (h2(c * 3 + b, r + (c % 5)) > 0.34 || r === 0 || b === 0) px(x, '#141416', ox + k * 4 + b, oy + r); } };
        word('STANDING', 8, 7); word('ORDER', 8, 12); word('NINE', 34, 12);
      });
      tex('t_p100_sett', (x) => {   // grey setts, lead-dark in the joints, worn smooth down the middle by a great many boots
        px(x, '#3a3c42', 0, 0, 64, 64);
        for (let r = 0; r < 8; r++) for (let k = 0; k < 5; k++) { const o = (r % 2) * 6, b = 74 + (h2(r, k) * 18 | 0) + (k === 2 ? 8 : 0); px(x, `rgb(${b},${b + 1},${b + 5})`, (k * 13 + o) % 64 + 1, r * 8 + 1, 11, 6); }
        for (let i = 0; i < 24; i++) px(x, 'rgba(0,0,0,0.25)', (h2(i, 3) * 64) | 0, (h2(i, 5) * 64) | 0, 2, 1);
      });
      tex('t_p100_flag', (x) => {   // big flags of dressed grey stone, for the yards and squares
        px(x, '#30323a', 0, 0, 64, 64);
        for (const [fx, fy, fw, fh] of [[1, 1, 30, 30], [33, 1, 30, 30], [1, 33, 30, 30], [33, 33, 30, 30]]) { const b = 86 + (h2(fx, fy) * 14 | 0); px(x, `rgb(${b},${b + 2},${b + 7})`, fx, fy, fw, fh); px(x, `rgb(${b + 10},${b + 12},${b + 18})`, fx, fy, fw, 1); }
        for (let i = 0; i < 30; i++) px(x, 'rgba(20,22,28,0.22)', (h2(i, 9) * 62) | 0, (h2(i, 13) * 62) | 0, 3, 1);
      });
      tex('t_p100_yard', (x) => {   // the mooring-yard: flags, with the windlass's rope-wear across them
        px(x, '#30323a', 0, 0, 64, 64);
        for (const [fx, fy, fw, fh] of [[1, 1, 30, 30], [33, 1, 30, 30], [1, 33, 30, 30], [33, 33, 30, 30]]) { const b = 80 + (h2(fx + 3, fy) * 14 | 0); px(x, `rgb(${b},${b + 2},${b + 6})`, fx, fy, fw, fh); }
        for (let k = 0; k < 5; k++) { x.strokeStyle = 'rgba(190,180,150,0.20)'; x.lineWidth = 2; x.beginPath(); x.moveTo(0, 8 + k * 12); x.quadraticCurveTo(32, 2 + k * 12 + (k % 2) * 8, 64, 10 + k * 12); x.stroke(); }
      });
      tex('t_p100_walk', (x) => {   // the wall-walk: the tops of the great blocks, leaded, a cable lying along it in eyes
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 26 + h2(i >> 3, j >> 3) * 12 + h2(i, j) * 5; px(x, `rgb(${v | 0},${(v + 1) | 0},${(v + 6) | 0})`, i, j); }
        px(x, '#7c8088', 0, 0, 64, 2); px(x, '#7c8088', 0, 0, 2, 64); px(x, '#5c6068', 0, 2, 64, 1);
        for (let i = 0; i < 20; i++) px(x, 'rgba(160,170,200,0.18)', (h2(i, 21) * 60) | 0, (h2(i, 23) * 60) | 0, 4, 1);
      });
      tex('t_p100_step', (x) => {   // stair treads: obsidian, each nosing leaded and worn bright
        for (let s = 0; s < 4; s++) { const b = 22 + s * 3; px(x, `rgb(${b},${b + 1},${b + 6})`, 0, s * 16, 64, 16); px(x, '#8a8e98', 0, s * 16, 64, 2); px(x, '#b4b8c2', 14, s * 16, 36, 1); px(x, '#0a0a0e', 0, s * 16 + 14, 64, 2); }
      });
      tex('t_p100_cope', (x) => {   // the coping on the Rift side: sheet lead dressed over the block, an iron eye and the cable through it
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 74 + h2(i >> 2, j >> 2) * 10 + h2(i, j) * 4; px(x, `rgb(${v | 0},${(v + 2) | 0},${(v + 8) | 0})`, i, j); }
        px(x, '#3c3e46', 0, 0, 64, 1); px(x, '#3c3e46', 0, 0, 1, 64); px(x, '#9498a2', 1, 1, 63, 1);
        px(x, '#55575e', 0, 30, 64, 4); px(x, '#888c94', 0, 30, 64, 1);                    // the cable
        px(x, '#22242a', 28, 26, 8, 12); px(x, '#55575e', 30, 29, 4, 6);                  // an iron eye
      });
      tex('t_p100_rock', (x) => {   // bare grey rock: flat, nothing growing, nothing lying on it
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 96 + h2(i >> 3, j >> 3) * 10 + h2(i >> 1, j >> 1) * 6; px(x, `rgb(${v | 0},${v | 0},${(v + 3) | 0})`, i, j); }
        for (let k = 0; k < 4; k++) { x.strokeStyle = 'rgba(60,62,70,0.25)'; x.lineWidth = 1; x.beginPath(); x.moveTo(h2(k, 1) * 64, 0); x.lineTo(h2(k, 2) * 64, 64); x.stroke(); }
      });
      // the not-colour: nothing in it at all, not even grain; it is the colour the air is, so the land simply stops
      tex('t_p100_not', (x) => { px(x, 'rgb(118,120,126)', 0, 0, 64, 64); });
      // indoors: obsidian in smaller blocks, limewashed to the height of a shoulder so a lantern goes further
      tex('t_p100_hall', (x) => {
        px(x, '#7c8088', 0, 0, 64, 64);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 2; k++) { const o = (r % 2) * 16, bx = (k * 32 + o) % 64; for (let j = 1; j < 15; j++) for (let i = 1; i < 31; i++) { const v = 16 + h2((bx + i) >> 2, (r * 16 + j) >> 2) * 10; px(x, `rgb(${v | 0},${(v + 1) | 0},${(v + 6) | 0})`, (bx + i) % 64, r * 16 + j); } }
        for (let j = 30; j < 64; j++) for (let i = 0; i < 64; i++) if (h2(i, j) < 0.82) px(x, `rgba(214,212,202,${(0.62 + h2(i >> 2, j >> 2) * 0.2).toFixed(2)})`, i, j);
        px(x, 'rgba(60,60,66,0.5)', 0, 29, 64, 1);
      });
      tex('t_p100_vault', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 14 + h2(i >> 3, j >> 3) * 8; px(x, `rgb(${v | 0},${v | 0},${(v + 4) | 0})`, i, j); } for (let k = 0; k < 64; k += 16) px(x, '#3a3c44', k, 0, 2, 64); });
      tex('t_p100_boards', (x) => { for (let c = 0; c < 8; c++) { const b = 70 + (h2(c, 4) * 14 | 0); px(x, `rgb(${b + 8},${b},${b - 10})`, c * 8, 0, 8, 64); px(x, '#1e1a16', c * 8, 0, 1, 64); px(x, '#2a241e', c * 8 + 3, ((h2(c, 9) * 50) | 0), 2, 1); } });
      tex('t_p100_felt', (x) => { for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const v = 92 + h2(i, j) * 14 + h2(i >> 2, j >> 2) * 8; px(x, `rgb(${v | 0},${(v - 2) | 0},${(v - 8) | 0})`, i, j); } });   // felt laid on the magazine floor
      // a grey blanket weighted with lead, hung to look like a wall: the same blocks, but they sag
      tex('t_p100_blanket', (x) => {
        px(x, '#5a5c62', 0, 0, 64, 64);
        for (let j = 0; j < 64; j++) for (let i = 0; i < 64; i++) { const sag = Math.sin(i / 64 * PI) * 3, v = 70 + h2(i >> 1, (j - sag) >> 1) * 12 + Math.sin(i * 0.5) * 6; px(x, `rgb(${v | 0},${v | 0},${(v + 4) | 0})`, i, j); }
        for (let i = 4; i < 64; i += 12) px(x, '#3a3c42', i, 58, 4, 5);   // the lead weights along the hem
        px(x, '#2a2a2e', 0, 0, 64, 3); for (let i = 3; i < 64; i += 9) px(x, '#8a8e96', i, 1, 2, 2);
      });
      tex('t_p100_kegs', (x) => {   // powder kegs, hooped with copper, stacked to the vault
        px(x, '#141416', 0, 0, 64, 64);
        for (let r = 0; r < 3; r++) for (let k = 0; k < 3; k++) { const kx = k * 21 + (r % 2) * 4, ky = r * 21 + 1; px(x, '#5e4a34', kx + 1, ky, 19, 20); px(x, '#4a3a28', kx + 1, ky, 2, 20); px(x, '#74603e', kx + 9, ky, 3, 20); for (const hy of [3, 15]) { px(x, '#3e8a6a', kx + 1, ky + hy, 19, 2); px(x, '#7ac8a4', kx + 5, ky + hy, 4, 1); } }
      });
    }
    // ---- sprites
    // a talking-post: a lantern on an iron post, and under it a tin with a note in it
    const post = (x, lit) => {
      px(x, '#1e2024', 22, 30, 4, 90); px(x, '#3a3e46', 23, 32, 1, 86); px(x, '#1e2024', 16, 115, 16, 5);
      px(x, '#1e2024', 15, 8, 18, 3); px(x, '#1e2024', 17, 11, 2, 18); px(x, '#1e2024', 29, 11, 2, 18); px(x, '#1e2024', 15, 28, 18, 3);
      px(x, lit ? '#f2c878' : '#34322e', 19, 11, 10, 17); if (lit) px(x, '#fff2cc', 22, 14, 4, 10);
      px(x, '#1e2024', 20, 4, 8, 4); px(x, '#1e2024', 23, 1, 2, 3);
      px(x, '#8a8e96', 27, 62, 12, 12); px(x, '#b8bcc4', 27, 62, 12, 2); px(x, '#5a5e66', 27, 72, 12, 2); px(x, '#e8e2cc', 30, 59, 6, 4);   // the tin, and the corner of a note
      if (lit) for (let k = 0; k < 8; k++) px(x, `rgba(240,196,120,${(0.2 - k * 0.022).toFixed(3)})`, 12 - k, 30 + k * 3, 24 + k * 2, 3);
    };
    add('p100_post', 48, 120, 1.55, (x) => post(x, false));
    add('p100_postlit', 48, 120, 1.55, (x) => post(x, true), (r, g, b, a) => a > 200 && r > 230 && g > 180);
    // a street lantern on a bracket: the Watch's light is lanterns
    add('p100_lantern', 28, 90, 1.25, (x) => {
      px(x, '#1e2024', 12, 20, 3, 70); px(x, '#1e2024', 12, 20, 12, 2); px(x, '#1e2024', 20, 22, 2, 5);
      px(x, '#1e2024', 16, 27, 10, 2); px(x, '#eab868', 17, 29, 8, 10); px(x, '#fff0c8', 19, 31, 4, 6); px(x, '#1e2024', 16, 39, 10, 2);
    }, (r, g, b, a) => a > 200 && r > 225 && g > 170);
    // a trooper of the Watch: grey, a long coat with lead plates sewn in, a rota-number on the breast (Book Three ch. 2)
    const trooper = (x, o) => {
      const cx = 32, skin = o.skin || '#c8b29c', coat = o.coat || '#6c7078', dark = o.dark || '#4c5058', hair = o.hair || '#3a3430';
      px(x, '#24262a', cx - 9, 148, 8, 10); px(x, '#24262a', cx + 1, 148, 8, 10);   // boots
      x.fillStyle = coat; x.beginPath(); x.moveTo(cx - 15, 150); x.lineTo(cx - 12, 54); x.lineTo(cx + 12, 54); x.lineTo(cx + 15, 150); x.closePath(); x.fill();
      for (let j = 62; j < 146; j += 14) for (let i = -10; i <= 6; i += 8) { px(x, '#8a8e98', cx + i + ((j / 14) & 1) * 2, j, 6, 10); px(x, '#a8acb6', cx + i + ((j / 14) & 1) * 2, j, 6, 1); px(x, '#5a5e68', cx + i + ((j / 14) & 1) * 2, j + 9, 6, 1); }   // the lead plates
      px(x, dark, cx - 1, 54, 2, 96);
      px(x, coat, cx - 20, 56, 8, o.armL || 54); px(x, coat, cx + 12, 56, 8, o.armR || 54);
      px(x, skin, cx - 19, 56 + (o.armL || 54), 6, 6); px(x, skin, cx + 13, 56 + (o.armR || 54), 6, 6);
      px(x, '#e4e0d2', cx + 3, 62, 8, 6); if (o.num) { const s0 = String(o.num); for (let k = 0; k < s0.length; k++) { const d = +s0[k]; px(x, '#1a1a1c', cx + 4 + k * 2.4, 63, 1.6, 4); if (d % 2) px(x, '#e4e0d2', cx + 4.4 + k * 2.4, 64, 0.8, 1); } }   // the rota-number
      px(x, dark, cx - 12, 50, 24, 6);   // collar
      px(x, skin, cx - 8, 28, 16, 22); px(x, '#00000030', cx - 8, 44, 16, 2);
      px(x, hair, cx - 9, 24, 18, o.crop ? 6 : 9); if (!o.crop) { px(x, hair, cx - 10, 28, 3, 12); px(x, hair, cx + 7, 28, 3, 12); }
      px(x, '#1c1a18', cx - 5, 36, 2, 2); px(x, '#1c1a18', cx + 3, 36, 2, 2);
      px(x, o.mouth === 0 ? '#7a5a4c' : '#3a2420', cx - 2, 44, 5, o.mouth === 0 ? 1 : 3);   // every mouth on the Watch is open
      if (o.fn) o.fn(x, cx);
    };
    const T = (name, o, hgt) => add(name, 64, hgt || 160, undefined, (x) => trooper(x, o));
    T('p100_tr_a', { num: 57, hair: '#5a4630' }); T('p100_tr_b', { num: 132, skin: '#b0907a', hair: '#1e1a18' }); T('p100_tr_c', { num: 208, hair: '#8a7250', coat: '#666a74' }); T('p100_tr_d', { num: 9, skin: '#d2bca8', hair: '#6a6660', crop: true });
    T('p100_94', { num: 94, hair: '#4a3a28', skin: '#d0b8a0' });
    T('p100_211', { num: 211, hair: '#3a3028', coat: '#70747c', fn: (x, cx) => { px(x, '#70747c', cx - 22, 56, 6, 56); px(x, '#70747c', cx + 16, 56, 6, 56); px(x, '#c8b29c', cx - 22, 112, 9, 9); px(x, '#c8b29c', cx + 15, 112, 9, 9); } }, 172);   // big, slow, enormous hands
    T('p100_19', { num: 19, hair: '#9a9a98', crop: true, skin: '#bca692', fn: (x, cx) => { px(x, '#e8dcd0', cx + 2, 33, 5, 1); px(x, '#bca692', cx + 4, 32, 1, 3); } });   // grey, a scarred eyebrow
    T('p100_88', { num: 88, hair: '#6a4a2a', skin: '#d6c0aa', fn: (x, cx) => { px(x, '#d6c0aa', cx + 13, 92, 6, 6); px(x, '#6c7078', cx + 12, 56, 8, 36); } });   // one hand up, by his ear
    T('p100_roster', { num: 302, hair: '#2a2622', fn: (x, cx) => { px(x, '#e8e4d8', cx + 15, 104, 5, 9); px(x, '#3a3228', cx - 24, 96, 10, 14); px(x, '#c8c4b4', cx - 23, 98, 8, 1); px(x, '#c8c4b4', cx - 23, 102, 8, 1); } });   // chalk, and a slate
    T('p100_issue', { num: 106, hair: '#7a6a58', crop: true, skin: '#c2a890' });
    T('p100_corp', { num: 142, hair: '#2e2a26', fn: (x, cx) => { for (const j of [58, 62]) px(x, '#d8d4c4', cx - 19, j, 6, 2); } });   // a corporal's two bars
    T('p100_51', { num: 51, hair: '#7a3a20', skin: '#d8c0a8' }); T('p100_207', { num: 207, hair: '#1c1a1a', skin: '#a88870' });
    T('p100_watcher', { num: 73, hair: '#5a5248' }); T('p100_mastcrew', { num: 164, hair: '#4a4038', coat: '#62666e' });
    // the Quartermaster: a big old man in a lead coat, with something on his back like a pedlar's pack: a wicker creel with a lid
    add('p100_qm', 72, 172, undefined, (x) => {
      px(x, '#8a6e44', 6, 60, 24, 44); for (let j = 62; j < 104; j += 4) px(x, '#6a5230', 6, j, 24, 1); for (let i = 8; i < 30; i += 5) px(x, '#a48654', i, 60, 1, 44); px(x, '#6a5230', 6, 60, 24, 4);
      x.save(); x.translate(4, 12); trooper(x, { hair: '#d8d6d0', crop: true, skin: '#b89c86', coat: '#686c74', mouth: 0 }); x.restore();
      px(x, '#5a4a30', 26, 68, 3, 30); px(x, '#5a4a30', 46, 68, 3, 30);   // the pack's straps
      px(x, '#d8d6d0', 30, 60, 12, 5);   // a white beard, cut short
    });
    // General Theresa Ward: fifty, short, broad, grey hair cropped; a lead coat, a breastplate of plain dark iron, dented;
    // a general's sash, faded. Her right hand is raised to the iron over her heart.
    add('p100_ward', 68, 150, undefined, (x) => {
      const cx = 34;
      px(x, '#24262a', cx - 11, 138, 10, 10); px(x, '#24262a', cx + 1, 138, 10, 10);
      x.fillStyle = '#666a72'; x.beginPath(); x.moveTo(cx - 19, 140); x.lineTo(cx - 16, 50); x.lineTo(cx + 16, 50); x.lineTo(cx + 19, 140); x.closePath(); x.fill();
      for (let j = 96; j < 136; j += 13) for (let i = -13; i <= 7; i += 10) { px(x, '#8a8e98', cx + i, j, 7, 9); px(x, '#a8acb6', cx + i, j, 7, 1); }
      px(x, '#2e3036', cx - 14, 54, 28, 38); px(x, '#3c3e46', cx - 12, 56, 24, 4); px(x, '#1c1e22', cx - 14, 88, 28, 4);   // the breastplate
      px(x, '#4a4c54', cx - 6, 66, 5, 4); px(x, '#1a1b1e', cx + 4, 74, 6, 5); px(x, '#4a4c54', cx - 9, 80, 4, 3);   // its dents and scratches
      x.fillStyle = '#8a5a4a'; x.beginPath(); x.moveTo(cx - 14, 54); x.lineTo(cx - 8, 54); x.lineTo(cx + 16, 92); x.lineTo(cx + 10, 92); x.closePath(); x.fill();   // the sash, faded
      px(x, '#666a72', cx - 25, 52, 9, 50); px(x, '#c0a890', cx - 24, 102, 7, 7);   // her left arm, behind her
      px(x, '#666a72', cx + 16, 52, 9, 22); px(x, '#666a72', cx + 4, 68, 16, 8); px(x, '#c0a890', cx - 1, 67, 8, 8);   // her right, the knuckles on the iron
      px(x, '#4c5058', cx - 14, 46, 28, 6);
      px(x, '#c0a890', cx - 9, 24, 18, 22); px(x, '#8a8a88', cx - 10, 21, 20, 6); px(x, '#8a8a88', cx - 10, 25, 2, 6); px(x, '#8a8a88', cx + 8, 25, 2, 6);
      px(x, '#1c1a18', cx - 6, 33, 3, 2); px(x, '#1c1a18', cx + 3, 33, 3, 2); px(x, '#7a5a4c', cx - 3, 41, 7, 1);   // the one shut mouth in the yard
      px(x, '#a08a74', cx - 9, 37, 2, 4); px(x, '#a08a74', cx + 7, 37, 2, 4);
    });
    // a Lead Brother: tall, hooded, a robe of dull grey lead hanging straight; under the hood a sheet of hammered lead
    // pressed to the shape of a face, with no holes in it. Seen from the wall he has his back to you.
    add('p100_brother', 48, 190, undefined, (x) => {
      x.fillStyle = '#7e8088'; x.beginPath(); x.moveTo(8, 188); x.lineTo(13, 44); x.lineTo(35, 44); x.lineTo(40, 188); x.closePath(); x.fill();
      for (let i = 12; i < 38; i += 5) px(x, 'rgba(60,62,70,0.35)', i, 50, 1, 136); px(x, 'rgba(180,184,196,0.3)', 14, 46, 2, 140);
      x.fillStyle = '#70727a'; x.beginPath(); x.moveTo(11, 50); x.lineTo(13, 18); x.quadraticCurveTo(24, 2, 35, 18); x.lineTo(37, 50); x.closePath(); x.fill();
      px(x, 'rgba(180,184,196,0.25)', 15, 16, 2, 30); px(x, '#5c5e66', 22, 8, 4, 40);
    });
    // a dampening battery: a flared brass mouth like the bell of a horn, nine feet across, under a lead hood
    const gun = (hooded) => (x) => {
      px(x, '#3a3c44', 44, 96, 40, 30); px(x, '#5a5e68', 44, 96, 40, 3); px(x, '#2a2c32', 56, 80, 16, 18);   // the carriage
      if (hooded) { x.fillStyle = '#7c8088'; x.beginPath(); x.moveTo(6, 96); x.lineTo(22, 20); x.lineTo(106, 20); x.lineTo(122, 96); x.closePath(); x.fill(); for (let i = 26; i < 106; i += 14) px(x, '#5c6068', i, 22, 2, 72); px(x, '#a4a8b2', 22, 20, 84, 2); return; }
      x.fillStyle = '#7c8088'; x.beginPath(); x.moveTo(2, 34); x.lineTo(30, 6); x.lineTo(98, 6); x.lineTo(126, 34); x.lineTo(118, 40); x.lineTo(10, 40); x.closePath(); x.fill(); px(x, '#a4a8b2', 30, 6, 68, 2); px(x, '#5c6068', 10, 38, 108, 2);   // the lead hood
      x.fillStyle = '#b08a3a'; x.beginPath(); x.ellipse(64, 66, 50, 30, 0, 0, PI * 2); x.fill();
      x.fillStyle = '#d8b45a'; x.beginPath(); x.ellipse(64, 64, 46, 26, 0, 0, PI * 2); x.fill();
      x.fillStyle = '#7a5a20'; x.beginPath(); x.ellipse(64, 66, 34, 18, 0, 0, PI * 2); x.fill();
      x.fillStyle = '#2a1c0c'; x.beginPath(); x.ellipse(64, 68, 20, 10, 0, 0, PI * 2); x.fill();
      x.strokeStyle = '#f0d890'; x.lineWidth = 2; x.beginPath(); x.ellipse(64, 64, 46, 26, 0, PI * 1.1, PI * 1.7); x.stroke();
    };
    add('p100_battery', 128, 128, 2.6, gun(false)); add('p100_batteryhood', 128, 128, 2.6, gun(true));
    // the battery's bell, on a bracket, its rope worn black
    add('p100_bell', 32, 96, 1.3, (x) => { px(x, '#1e2024', 14, 24, 4, 72); px(x, '#1e2024', 6, 22, 20, 3); x.fillStyle = '#b08a3a'; x.beginPath(); x.moveTo(8, 44); x.quadraticCurveTo(10, 26, 16, 25); x.quadraticCurveTo(22, 26, 24, 44); x.closePath(); x.fill(); px(x, '#d8b45a', 12, 30, 2, 10); px(x, '#1a1816', 15, 44, 2, 30); });
    // the Watch's mooring-mast: riveted iron, a ladder up it, and the windlass at its foot
    add('p100_mast', 64, 320, 6.4, (x) => {
      px(x, '#3a3e46', 28, 0, 8, 320); px(x, '#5a5e68', 29, 0, 2, 320); for (let j = 6; j < 320; j += 14) { px(x, '#22242a', 28, j, 8, 2); px(x, '#8a8e96', 30, j - 3, 1, 1); px(x, '#8a8e96', 33, j - 3, 1, 1); }
      for (let j = 20; j < 300; j += 9) px(x, '#6a5a44', 38, j, 10, 2); px(x, '#6a5a44', 38, 16, 2, 290); px(x, '#6a5a44', 46, 16, 2, 290);   // the mast-ladder
      px(x, '#2a2c32', 8, 286, 48, 34); px(x, '#5a4a34', 14, 292, 36, 14); for (let i = 16; i < 50; i += 5) px(x, '#3a2e20', i, 292, 1, 14); px(x, '#8a8e96', 4, 296, 6, 6); px(x, '#8a8e96', 54, 296, 6, 6);   // the windlass
      px(x, '#3a3e46', 14, 0, 36, 5);
    });
    // the crane on the buttress: a gallows-shape of black oak with a wheel on top, and a rope
    add('p100_crane', 96, 150, 2.6, (x) => {
      px(x, '#1a1612', 20, 14, 8, 136); px(x, '#2e2620', 21, 14, 2, 136); px(x, '#1a1612', 20, 14, 62, 8); px(x, '#2e2620', 20, 14, 62, 2);
      line(x, '#1a1612', 6, [26, 54, 52, 20]);
      x.strokeStyle = '#1a1612'; x.lineWidth = 4; x.beginPath(); x.arc(74, 12, 10, 0, PI * 2); x.stroke(); for (let k = 0; k < 4; k++) line(x, '#1a1612', 2, [74 - Math.cos(k * PI / 4) * 10, 12 - Math.sin(k * PI / 4) * 10, 74 + Math.cos(k * PI / 4) * 10, 12 + Math.sin(k * PI / 4) * 10]);
      px(x, '#b8a47a', 83, 12, 2, 112); for (let j = 22; j < 122; j += 10) px(x, '#8a7850', 82, j, 4, 3);   // the rope, and its knots
      px(x, '#1a1612', 8, 144, 34, 6);
    });
    // the battery rail's trolley: a flat iron bed on four small wheels, a brake-lever like a pump-handle
    add('p100_trolley', 96, 60, 0.7, (x) => {
      px(x, '#2a2c32', 0, 52, 96, 3); px(x, '#5a5e68', 0, 52, 96, 1);   // the rail
      px(x, '#3a3e46', 10, 30, 76, 12); px(x, '#5a5e68', 10, 30, 76, 2); px(x, '#22242a', 10, 40, 76, 2);
      for (const wx of [20, 76]) { x.fillStyle = '#1c1e22'; x.beginPath(); x.arc(wx, 46, 7, 0, PI * 2); x.fill(); x.fillStyle = '#6a6e76'; x.beginPath(); x.arc(wx, 46, 2.5, 0, PI * 2); x.fill(); }
      line(x, '#2a2c32', 4, [48, 30, 60, 6]); px(x, '#6a5a44', 54, 2, 16, 5);
    });
    add('p100_chock', 28, 20, 0.25, (x) => { x.fillStyle = '#1a1612'; x.beginPath(); x.moveTo(2, 18); x.lineTo(26, 18); x.lineTo(26, 4); x.closePath(); x.fill(); px(x, '#3a322a', 8, 15, 16, 1); });
    // indoors: a bunk (made up tight, or with a sleeper in it), a mess table, a footlocker, the roster board, the rack of felts
    const bunk = (sleeper) => (x) => {
      px(x, '#2a2420', 2, 30, 4, 34); px(x, '#2a2420', 90, 30, 4, 34); px(x, '#3a322a', 2, 40, 92, 5);
      px(x, '#8a8c92', 6, 32, 84, 9); px(x, '#a4a6ac', 6, 32, 84, 2); px(x, '#d8d4c8', 8, 28, 16, 6);
      if (sleeper) { px(x, '#7c8088', 22, 24, 62, 10); px(x, '#9a9ea6', 22, 24, 62, 2); px(x, '#c8b29c', 10, 22, 11, 9); px(x, '#3a3430', 9, 20, 10, 4); }
    };
    add('p100_bunk', 96, 64, 0.7, bunk(false)); add('p100_bunkasleep', 96, 64, 0.7, bunk(true));
    add('p100_table', 96, 56, 0.62, (x) => { px(x, '#d8d0bc', 2, 16, 92, 6); px(x, '#b8ae98', 2, 21, 92, 2); for (const lx of [8, 84]) px(x, '#6a5a44', lx, 23, 4, 33); px(x, '#8a8e96', 30, 10, 8, 6); px(x, '#8a8e96', 58, 11, 7, 5); px(x, '#3a3228', 44, 8, 6, 8); });
    add('p100_locker', 44, 30, 0.34, (x) => { px(x, '#3a322a', 2, 8, 40, 22); px(x, '#52463a', 2, 8, 40, 5); px(x, '#22201c', 2, 13, 40, 1); px(x, '#8a8e96', 19, 12, 6, 6); px(x, '#1a1816', 8, 18, 3, 6); px(x, '#1a1816', 13, 18, 4, 6); });   // 51 burned into the lid
    add('p100_board', 128, 96, 1.5, (x) => {
      px(x, '#3a322a', 0, 6, 128, 84); px(x, '#1c1e20', 4, 10, 120, 76);
      for (let r = 0; r < 9; r++) { px(x, 'rgba(232,228,214,0.85)', 8, 15 + r * 8, 10 + ((h2(r, 1) * 6) | 0), 2); px(x, 'rgba(232,228,214,0.6)', 28, 15 + r * 8, 14, 2); px(x, 'rgba(232,228,214,0.6)', 50, 15 + r * 8, 22 + ((h2(r, 3) * 40) | 0), 2); }
      px(x, 'rgba(240,214,150,0.9)', 8, 80, 40, 2);
    });
    add('p100_rack', 64, 80, 1.0, (x) => { px(x, '#3a322a', 4, 6, 4, 74); px(x, '#3a322a', 56, 6, 4, 74); for (const j of [20, 44, 68]) { px(x, '#52463a', 4, j, 56, 4); for (let i = 10; i < 52; i += 11) { px(x, '#9a968c', i, j - 10, 9, 10); px(x, '#b4b0a6', i, j - 10, 9, 2); } } });
    add('p100_feltsign', 64, 40, 0.5, (x) => { for (let r = 0; r < 4; r++) for (let i = 4; i < 58; i += 4) if (h2(i, r) > 0.25) px(x, 'rgba(232,228,214,0.8)', i, 6 + r * 8, 3, 4); }, undefined, { dy: -0.6 });
    add('p100_window', 40, 48, 0.6, (x) => { px(x, '#3c4048', 4, 4, 32, 36); px(x, '#e8c078', 8, 8, 24, 28); px(x, '#fff0c8', 14, 14, 12, 16); px(x, '#3c4048', 19, 8, 2, 28); }, (r, g, b, a) => a > 200 && r > 220 && g > 180, { dy: -0.55 });
    add('p100_hatch', 96, 110, 1.3, (x) => { px(x, '#3a322a', 0, 0, 96, 110); px(x, '#17181c', 8, 8, 80, 50); px(x, '#52463a', 0, 58, 96, 8); px(x, '#6a5a44', 0, 58, 96, 2); for (let i = 12; i < 84; i += 18) px(x, '#666a72', i, 14, 12, 40); });
    add('p100_tape', 44, 22, 0.3, (x) => { x.strokeStyle = '#c8a850'; x.lineWidth = 3; x.beginPath(); x.moveTo(2, 18); x.bezierCurveTo(12, 2, 20, 22, 30, 10); x.bezierCurveTo(36, 4, 40, 16, 42, 12); x.stroke(); for (let k = 0; k < 9; k++) px(x, '#3a2c10', 5 + k * 4, 12 + ((k % 3) - 1) * 2, 1, 1); });
    // the Stray: a Carillon Legionnaire (its own picture, the same pixels), six years in a powder magazine: the brass gone
    // dull and grey with powder, felt bound round its feet
    try {
      for (const pose of ['', '_w1', '_w2', '_a1', '_a2']) {
        const src = Engine.sprites['legionnaire' + pose];
        if (src && !Engine.sprites['p100_stray' + pose]) {
          const d = new Uint32Array(src.data.length);
          for (let i = 0; i < d.length; i++) { const v = src.data[i], a = v >>> 24; if (!a) continue; const r = v & 255, g = (v >> 8) & 255, b = (v >> 16) & 255, yy = (i / src.w) | 0, l = r * 0.3 + g * 0.59 + b * 0.11;
            let nr = r * 0.45 + l * 0.5 + 6, ng = g * 0.45 + l * 0.5 + 8, nb = b * 0.45 + l * 0.5 + 14;
            if (yy > src.h * 0.9) { nr = 150 + l * 0.2; ng = 146 + l * 0.2; nb = 136 + l * 0.2; }   // the felts
            d[i] = (a << 24) | (Math.min(255, nb | 0) << 16) | (Math.min(255, ng | 0) << 8) | Math.min(255, nr | 0); }
          Engine.addSprite('p100_stray' + pose, Object.assign({}, src, { data: d }));
        }
      }
    } catch (e) { warnOnce('stray', e); }
  }

  // ---------------------------------------------------------------- the defs: the keeper, the gear, the people
  const STRAY_DEF = { name: TX.strayName, sprite: 'p100_stray', hp: 900, dmg: [5, 11], speed: 1.0, reach: 1.3, scale: 1.05, xp: 0, desc: TX.strayDesc };
  const ARMOR_DEFS = {
    a_p100_coat: { name: TX.coat, slot: 'body', ar: 5, noise: 0.5, value: 54, desc: TX.coatDesc },
    a_p100_mitts: { name: TX.mitts, slot: 'hands', ar: 1, noise: 0, value: 16, desc: TX.mittsDesc },
    a_p100_felts: { name: TX.felts, slot: 'feet', ar: 0, noise: -0.4, value: 14, desc: TX.feltsDesc },
  };
  const SPIKE_DEF = { name: TX.spike, img: 'fp_knife', dmg: [3, 7], reach: 1.2, noise: 0.9, speed: 1.25, type: 'iron', value: 18, desc: TX.spikeDesc };
  const MALLET_DEF = { name: TX.mallet, img: 'fp_mace', dmg: [4, 10], reach: 1.3, noise: 0.9, speed: 0.95, type: 'bronze', blunt: true, value: 46, desc: TX.malletDesc };
  function defs() {
    if (typeof WEAPONS !== 'undefined') { if (!WEAPONS.p100_spike) WEAPONS.p100_spike = Object.assign({}, SPIKE_DEF); if (!WEAPONS.p100_mallet) WEAPONS.p100_mallet = Object.assign({}, MALLET_DEF); }
    if (typeof ENEMIES !== 'undefined' && !ENEMIES.p100_stray) ENEMIES.p100_stray = Object.assign({}, STRAY_DEF);
    if (typeof ARMOR !== 'undefined') for (const k in ARMOR_DEFS) if (!ARMOR[k]) ARMOR[k] = Object.assign({}, ARMOR_DEFS[k]);
    if (typeof ITEMS !== 'undefined') {
      for (const k in ARMOR_DEFS) if (!ITEMS[k]) ITEMS[k] = Object.assign({ sprite: 'gear', armor: true }, ARMOR_DEFS[k]);
      if (!ITEMS.w_p100_spike) ITEMS.w_p100_spike = { name: TX.spike, sprite: 'gear', weapon: 'p100_spike', value: 18, desc: TX.spikeDesc };
      if (!ITEMS.w_p100_mallet) ITEMS.w_p100_mallet = { name: TX.mallet, sprite: 'gear', weapon: 'p100_mallet', value: 46, desc: TX.malletDesc };
      if (!ITEMS.v_p100_tape) ITEMS.v_p100_tape = { name: TX.tapeItem, sprite: 'gear', valuable: true, value: 80, desc: TX.tapeDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'a_p100_coat')) {
      ICONS.PIX.a_p100_coat = (d) => {   // a long grey coat, lead plates in rows, the white square for a rota-number
        d.layer('#6c7078').rrect(6, 2, 12, 20); d.layer('#4c5058').rect(11.5, 2, 1, 20);
        for (let j = 0; j < 4; j++) for (const i of [7, 14]) d.layer('#9a9ea8').rect(i, 8 + j * 3.4, 3, 2.2);
        d.layer('#e4e0d2').rect(14, 4, 3, 2.4);
      };
      ICONS.PIX.a_p100_mitts = (d) => { const mt = (x) => { d.layer('#7a7e86').rrect(x, 6, 7, 12); d.layer('#7a7e86').rrect(x - 2, 10, 3, 5); d.layer('#b4b8c0').rect(x + 1, 9, 5, 6); d.layer('#5a5e66').rect(x, 16, 7, 2); }; mt(4); mt(14); };
      ICONS.PIX.a_p100_felts = (d) => { const b = (x) => { d.layer('#9a968c').rrect(x, 8, 6, 9); d.layer('#9a968c').rrect(x, 14, 9, 5); d.layer('#b8b4aa').rect(x, 8, 6, 1.4); d.layer('#7a766c').rect(x, 18, 9, 1); }; b(3); b(13); };
      ICONS.PIX.v_p100_tape = (d) => { d.layer('#c8a850', { shiny: 1 }).rrect(5, 6, 14, 12); d.layer('#8a7030').rrect(9, 10, 6, 4); for (let i = 0; i < 4; i++) d.mark('#3a2c10', 7 + i * 3.4, 8); d.layer('#c8a850', { shiny: 1 }).rect(17, 15, 5, 2); };
      const spike = (d) => { d.tilt(12, 12); d.layer('#7a7e88', { shiny: 1 }).rect(-0.9, -10, 1.8, 12); d.layer('#9a9ea8', { shiny: 1 }).rect(-0.4, -11.5, 0.8, 2); d.layer('#2a2420').rect(-1.4, 2, 2.8, 6); d.layer('#5a5e68').rrect(-2.2, 8, 4.4, 3.4); d.layer('#14161a').rect(-0.8, 9, 1.6, 1.4); };
      ICONS.PIX['weapon:p100_spike'] = spike; ICONS.PIX.w_p100_spike = spike;
      const mallet = (d) => { d.tilt(12, 12); d.layer('#b89868').rrect(-1, -6, 2, 17); d.layer('#3e8a6a', { shiny: 1 }).rrect(-6, -11, 12, 6); d.layer('#7ac8a4', { shiny: 1 }).rect(-5, -10.4, 10, 1.2); d.layer('#2a6a50').rect(-6, -6.2, 12, 1); };
      ICONS.PIX['weapon:p100_mallet'] = mallet; ICONS.PIX.w_p100_mallet = mallet;
    } } catch (e) { warnOnce('icons', e); }
    if (typeof NPCS !== 'undefined') {
      const npc = (id, key, name, sprite, portrait, extra) => { if (!NPCS[id]) NPCS[id] = Object.assign({ name, sprite, portrait, tier: 'low', greet: SAY[key].greet, topics: Object.assign({}, SAY[key].topics) }, extra || {}); };
      npc('p100_ward', 'ward', TX.ward, 'p100_ward', 'townswoman'); npc('p100_94', 'n94', TX.n94, 'p100_94', 'townsman');
      npc('p100_211', 'n211', TX.n211, 'p100_211', 'hob'); npc('p100_19', 'n19', TX.n19, 'p100_19', 'townsman'); npc('p100_88', 'n88', TX.n88, 'p100_88', 'townsman');
      npc('p100_qm', 'qm', TX.qm, 'p100_qm', 'hob');
      for (const k of ['a', 'b', 'c', 'd']) npc('p100_tr_' + k, 'tr_' + k, TX.trooper, 'p100_tr_' + k, k === 'b' || k === 'c' ? 'townswoman' : 'townsman');
      npc('p100_mastcrew', 'mastcrew', TX.mastCrew, 'p100_mastcrew', 'townsman');
      npc('p100_roster', 'roster', TX.rosterCorp, 'p100_roster', 'townsman');
      npc('p100_issue', 'issue', TX.issue, 'p100_issue', 'townsman', { shop: [{ item: 'a_p100_coat' }, { item: 'a_p100_mitts' }, { item: 'w_p100_spike' }, { item: 'bandage', price: 4 }, { item: 'tonic', price: 5 }], markup: 1.0,
        shopTalk: { hello: S('Coat, mitts, spike, and what the sutler left. Sign here. A mark will do.'), broke: S('Then you go on the wall in what you stand up in.'), thanks: [S('Keep talking.'), S('It will not stop the quiet. Nothing does but your mouth.')] } });
      npc('p100_corp', 'corp', TX.corp, 'p100_corp', 'townsman'); npc('p100_51', 'n51', TX.n51, 'p100_51', 'townswoman'); npc('p100_207', 'n207', TX.n207, 'p100_207', 'townsman');
      npc('p100_watcher', 'watcher', TX.watcher, 'p100_watcher', 'townsman');
    }
  }

  // ---------------------------------------------------------------- the lamps (the Souls rules: group 'm'): talking-posts
  let LAMPS = [];
  function lamps() {
    if (LAMPS.length || typeof SOULS91 === 'undefined' || !SOULS91.register) return;
    const base = { sprite: 'p100_post', litSprite: 'p100_postlit', label: TX.lampLabel, litLabel: TX.lampLit, lightCol: [240, 196, 120] };
    LAMPS = SOULS91.register('m', { maps: [MAP, HALLS], revive: [], keeper: () => false, kflag: null, note: 852 }, [
      Object.assign({ map: HALLS, x: Q.post[0], y: Q.post[1], wx: Q.post[0], wy: Q.post[1] + 1.6, dir: -PI / 2, name: TX.lampHalls }, base),
      Object.assign({ map: MAP, x: P.nineLamp[0], y: P.nineLamp[1], wx: P.nineLamp[0] + 1.4, wy: P.nineLamp[1] + 1.4, dir: -PI / 2, name: TX.lampNine }, base),
      Object.assign({ map: MAP, x: P.gateLamp[0], y: P.gateLamp[1], wx: P.gateLamp[0] + 1.4, wy: P.gateLamp[1] + 1.4, dir: PI, name: TX.lampGate }, base),
    ]);
  }

  // ---------------------------------------------------------------- building the wall
  function decode() {
    const out = new Array(H);
    for (let j = 0; j < H; j++) {
      const r = G0 && G0.rows[j] ? G0.rows[j] : ''; let s = '';
      for (let i = 0; i < r.length;) { let n = 0; while (i < r.length && r[i] >= '0' && r[i] <= '9') n = n * 10 + (r.charCodeAt(i++) - 48); s += r[i++].repeat(n || 1); }
      out[j] = (s + '.'.repeat(W)).slice(0, W);
    }
    return out;
  }
  function polyCells(pts, half, fn) {
    for (let k = 0; k + 1 < pts.length; k++) {
      const [ax, ay] = pts[k], [bx, by] = pts[k + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) * 2);
      for (let t = 0; t <= n; t++) { const x = ax + (bx - ax) * t / n, y = ay + (by - ay) * t / n;
        for (let dy = -half; dy <= half; dy++) for (let dx = -half; dx <= half; dx++) fn(Math.round(x + dx), Math.round(y + dy)); }
    }
  }
  const at = (i, j) => (i < 0 || j < 0 || i >= W || j >= H) ? -1 : j * W + i;
  // where a point is on a stair: 0 off it; 1 on its treads; 2 in its side walls. And the stair's height at a radius.
  function stairAt(x, y) {
    const r = rOf(x, y);
    for (let s = 0; s < STAIRS.length; s++) {
      const st = STAIRS[s]; if (r < st.r0 - 0.5 || r > st.r1 + 0.5) continue;
      const ux = Math.cos(st.deg * PI / 180), uy = -Math.sin(st.deg * PI / 180), perp = Math.abs((x - CX) * uy - (y - CY) * ux);
      if (perp <= 1.5) return { k: 1, s }; if (perp <= 2.7) return { k: 2, s };
    }
    return null;
  }
  const stairH = (s, r) => WH * Math.max(0, Math.min(1, (r - STAIRS[s].r0) / (STAIRS[s].r1 - STAIRS[s].r0)));
  // kinds: 0 built up; 1 street; 2 barrack block; 3 the wall's mass and parapets; 4 the wall-walk; 5 a stair; 6 a yard or
  // square; 7 bare rock beyond the wall; 8 the not-colour; 9 the rim toward the plain; 10 a tower
  function plan() {
    const grid = decode(), N = W * H, kind = new Uint8Array(N), top = new Float32Array(N), stair = new Int8Array(N).fill(-1);
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, c = grid[j][i], x = i + 0.5, y = j + 0.5, r = rOf(x, y), dg = degOf(x, y), rift = dg >= ARC0 && dg <= ARC1;
      let t = c === ',' || c === '=' || c === '#' ? 1 : c === 'H' ? 2 : 0;
      if (rift) {
        if (r >= RC + 21) t = 8; else if (r >= RC + 0.4) t = 7; else if (r >= RC - 1) t = 11; else if (r >= RC - 5) t = 4; else if (r >= RC - 7) t = 3;
      } else if (r >= RC - 2) t = 9;
      kind[k] = t;
    }
    // the towers: squat and round, standing out of the wall toward the Rift
    for (const tw of TOWERS) for (let j = Math.floor(tw.at[1] - 5); j <= Math.ceil(tw.at[1] + 5); j++) for (let i = Math.floor(tw.at[0] - 5); i <= Math.ceil(tw.at[0] + 5); i++) {
      const k = at(i, j); if (k < 0) continue; const d = Math.hypot(i + 0.5 - tw.at[0], j + 0.5 - tw.at[1]);
      if (d <= 3.5 && kind[k] !== 4) kind[k] = 10; else if (d <= 3.5 && rOf(i + 0.5, j + 0.5) > RC - 2.6) kind[k] = 10;
    }
    // the yards and squares, the carved ways
    const open = (x0, y0, x1, y1, t) => { for (let j = y0; j <= y1; j++) for (let i = x0; i <= x1; i++) { const k = at(i, j); if (k >= 0 && kind[k] <= 2) kind[k] = t || 6; } };
    const ring = (x0, y0, x1, y1) => { for (let j = y0 - 1; j <= y1 + 1; j++) for (let i = x0 - 1; i <= x1 + 1; i++) { const k = at(i, j); if (k >= 0 && (i < x0 || i > x1 || j < y0 || j > y1) && kind[k] <= 2) kind[k] = 2; } };
    polyCells(ROUTES.main, 1, (x, y) => { const k = at(x, y); if (k >= 0 && kind[k] <= 2) kind[k] = 1; });
    polyCells(ROUTES.lane, 1, (x, y) => { const k = at(x, y); if (k >= 0 && kind[k] <= 2) kind[k] = 1; });
    open(...P.yard); open(...P.square); open(...P.lane); open(...P.gate);
    ring(...P.nine); open(...P.nine);   // Tower Nine's foot is shut in: the wall is the way to it
    // the stairs (their treads, and a wall either side so nobody steps off one)
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, st = stairAt(i + 0.5, j + 0.5); if (!st) continue;
      if (st.k === 1) { kind[k] = 5; stair[k] = st.s; } else if (kind[k] !== 4 && kind[k] !== 5 && kind[k] !== 6) { kind[k] = 3; stair[k] = st.s; }
    }
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (kind[k] === 5) { const r = rOf(i + 0.5, j + 0.5); if (r > RC - 5) kind[k] = 4; } }
    // the map's own edges are shut
    for (let i = 0; i < W; i++) for (const j of [0, H - 1]) { const k = at(i, j); if (kind[k] === 1 || kind[k] === 4 || kind[k] === 5 || kind[k] === 6) kind[k] = kind[k] === 4 ? 3 : 2; }
    for (let j = 0; j < H; j++) for (const i of [0, W - 1]) { const k = at(i, j); if (kind[k] === 1 || kind[k] === 6) kind[k] = 2; }
    // heights of what stands
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k];
      top[k] = t === 0 ? 2.0 + h2(i >> 2, j >> 2) * 0.8 : t === 2 ? 2.5 + h2(i >> 1, j >> 1) * 0.9 : t === 3 ? (stair[k] >= 0 && rOf(i + 0.5, j + 0.5) < RC - 7 ? stairH(stair[k], rOf(i + 0.5, j + 0.5)) + 1.0 : WH + PARA) : t === 9 ? 4.2 : t === 10 ? TOWER_TOP : 0;
    }
    return { kind, top, stair };
  }
  const snap = (m, x, y) => {
    const ok = (px, py) => { const i = px | 0, j = py | 0; if (i < 1 || j < 1 || i >= m.w - 1 || j >= m.h - 1) return false; if (m.isBlocked(i, j)) return false; return !m.entities.some((e) => e.solid && Math.hypot(e.x - px, e.y - py) < 0.7); };
    if (ok(x, y)) return [x, y];
    for (let r = 0.5; r <= 6; r += 0.5) for (let a = 0; a < 16; a++) { const px = x + Math.cos(a / 16 * PI * 2) * r, py = y + Math.sin(a / 16 * PI * 2) * r; if (ok(px, py) && Math.abs(m.groundAt(px, py) - m.groundAt(x, y)) < 0.6) return [px, py]; }
    return [x, y];
  };
  function build() {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_p100_sett', ceil: null, floorTextures: FLOORS, fogDist: 46, fogColor: [118, 120, 126], ambient: 0.95, music: 'inside', danger: 0,
      spawn: { x: P.arrive[0], y: P.arrive[1], dir: 0 } });
    m.bright = true;   // lit by the sky it has: "grey from above", the same at every hour (and at night, no stars)
    const { kind, top, stair } = plan();
    const V = m.ensureVerts(), L = m.ensureLvls(), W1 = W + 1;
    // corner heights: the wall-walk is level; a stair rises with its radius; everything else is the ground
    for (let vy = 0; vy <= H; vy++) for (let vx = 0; vx <= W; vx++) {
      let z = 0, walk = false, st = -1;
      for (const [di, dj] of [[-1, -1], [0, -1], [-1, 0], [0, 0]]) { const k = at(vx + di, vy + dj); if (k < 0) continue; if (kind[k] === 4) walk = true; else if (kind[k] === 5) st = stair[k]; }
      if (walk) z = WH; else if (st >= 0) z = stairH(st, rOf(vx, vy));
      V[vy * W1 + vx] = z;
    }
    m.setSide(0, 0, W - 1, H - 1, 't_p100_obsidian');
    const cope = new Uint8Array(W * H);
    m.isBlocked = function (x, y) { if (GameMap.prototype.isBlocked.call(this, x, y)) return true; return x >= 0 && y >= 0 && x < W && y < H && cope[y * W + x] === 1; };
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) {
      const k = j * W + i, t = kind[k];
      if (t === 1 || t === 4 || t === 5 || t === 6) {
        m.smooth[k] = 1; L[k] = (V[j * W1 + i] + V[j * W1 + i + 1] + V[(j + 1) * W1 + i] + V[(j + 1) * W1 + i + 1]) / 4;
        m.setFloor(i, j, t === 4 ? WALK : t === 5 ? STEP : t === 6 ? (i > 290 && j > 60 ? YARD : FLAG) : SETT); continue;
      }
      m.smooth[k] = 0;
      // the Rift-side parapet is a lead coping the height of a shin: you see over it, and nobody steps onto it
      if (t === 11) { L[k] = WH + COPE_H; m.setFloor(i, j, COPE); cope[k] = 1; if ((i + j) % 3 === 0) m.setSide(i, j, i, j, 't_p100_cable'); continue; }
      if (t === 7) { L[k] = 0; m.setFloor(i, j, ROCK); continue; }
      if (t === 8) { L[k] = VOID_Z; m.setFloor(i, j, ROCK); continue; }
      L[k] = 0;
      const tx = t === 2 ? ((i * 5 + j * 3) % 4 === 0 ? 't_p100_barrack' : 't_p100_obsidian') : t === 3 || t === 10 ? ((i + j) % 3 === 0 ? 't_p100_cable' : 't_p100_obsidian') : 't_p100_obsidian';
      m.block(i, j, tx, top[k], { capTex: 't_p100_walk' });
    }
    // the not-colour: its own floor, far below, beyond rock nobody can walk on
    for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (kind[j * W + i] === 8) m.floorCells[j * W + i] = NOTC;
    m._p100 = { kind, stair };
    const nearestOfKind = (x, y, want, maxR) => { let best = null, bd = 1e9; for (let j = Math.floor(y - maxR); j <= y + maxR; j++) for (let i = Math.floor(x - maxR); i <= x + maxR; i++) { const k = at(i, j); if (k < 0 || !want(kind[k], i, j)) continue; const d = Math.hypot(i + 0.5 - x, j + 0.5 - y); if (d < bd) { bd = d; best = [i, j]; } } return best; };
    // ---- the mooring-yard: the mast, the Kestrel, the ladder, the General and her voice, the mast-crew
    m.add({ kind: 'deco', sprite: 'p100_mast', x: P.mast[0], y: P.mast[1], scale: 1, solid: true, radius: 0.5, label: TX.mast, _decor: true });
    m.add({ kind: 'deco', sprite: 'kestrel_m2', x: P.kestrel[0], y: P.kestrel[1], scale: 5.0, solid: false, radius: 0.05, yOff: -5.4, label: TX.ladder, _decor: true, _p100: 'kestrel' });
    m.deco('ladder', P.arrive[0] - 0.9, P.arrive[1] - 0.6, { radius: 0.2, scale: 1.5, solid: false, use: 'p100_kestrel', label: TX.ladder });
    m.deco('sign', P.yard[0] + 2.5, P.yard[1] + 1.4, { radius: 0.15, scale: 0.8, solid: false, label: TX.yard });
    // ---- the wall stair: a chain across its foot, and Two-Eleven
    // (the chain is a thing to read, not a door: Two-Eleven turns you back by hand until you have a subject; see tickWall)
    m.deco('sign', P.chain[0] - 0.9, P.chain[1] - 1.3, { radius: 0.15, scale: 0.8, solid: false, label: TX.chain });
    // the yard's east wall, and in it the door with the order painted over it (Book Three ch. 2)
    for (let j = P.yard[1]; j <= P.yard[3]; j++) { const k = at(319, j); if (k >= 0 && kind[k] <= 2) { m.smooth[k] = 0; L[k] = 0; m.block(319, j, 't_p100_obsidian', 3.4, { capTex: 't_p100_walk' }); } }
    m.set(P.order9[0], P.order9[1], DOOR({ tex: 't_p100_order9', label: TX.order9Label, locked: '__never', lockMsg: TX.order9Msg })); m.setLvl(P.order9[0], P.order9[1], 0);
    // ---- the towers: a gun under its hood on each, a bell, a door in its foot with STANDING ORDER NINE over it
    for (const tw of TOWERS) {
      const wk = nearestOfKind(tw.at[0], tw.at[1], (t) => t === 4, 7);
      if (wk) m.add({ kind: 'deco', sprite: tw.manned ? 'p100_battery' : 'p100_batteryhood', x: wk[0] + 0.5 + (tw.at[0] - wk[0] - 0.5) * 0.25, y: wk[1] + 0.5 + (tw.at[1] - wk[1] - 0.5) * 0.25, scale: 1, solid: false, radius: 0.05, yOff: -(TOWER_TOP - WH), label: tw.manned ? TX.battery : TX.unmanned, _decor: true, _p100: 'gun' });
      if (wk) { const [bi, bj] = nearestOfKind(wk[0] - Math.cos(tw.deg * PI / 180) * 1.6, wk[1] + Math.sin(tw.deg * PI / 180) * 1.6, (t) => t === 4, 3) || wk; wk[0] = bi; wk[1] = bj; m.deco('p100_bell', wk[0] + 0.5, wk[1] + 0.5, { radius: 0.12, scale: 1, solid: false, label: tw.manned ? TX.bell : TX.unmanned, _p100: tw.manned ? 'bell' : 'nobell' }); tw.bell = [wk[0] + 0.5, wk[1] + 0.5]; }
    }
    // ---- the wall-walk's ends: a rope across it north of Nine and south of Five
    const walkCells = []; for (let j = 0; j < H; j++) for (let i = 0; i < W; i++) if (kind[j * W + i] === 4) walkCells.push([i, j, degOf(i + 0.5, j + 0.5)]);
    for (const [i, j, dg] of walkCells) if (dg > 40.5 || dg < -4.5) { m.smooth[j * W + i] = 0; m.block(i, j, 't_p100_cable', WH + 1.3, { capTex: 't_p100_walk' }); }
    { const n = pol(RC - 3, 39.6), s = pol(RC - 3, -3.8); m.deco('sign', n[0], n[1], { radius: 0.15, scale: 0.8, solid: false, label: TX.northWalk }); m.deco('sign', s[0], s[1], { radius: 0.15, scale: 0.8, solid: false, label: TX.southWalk }); }
    // ---- beyond the wall: the Lead Brothers along the lip, the buttress and the crane
    for (let dg = -2; dg <= 44; dg += 6.5) { const [x, y] = pol(RC + 17, dg); if (at(x | 0, y | 0) >= 0 && kind[at(x | 0, y | 0)] === 7) m.add({ kind: 'deco', sprite: 'p100_brother', x, y, scale: 1, solid: false, radius: 0.05, label: TX.brothers, _decor: true, facing: -dg * PI / 180 }); }
    { const [bx, by] = pol(RC + 20.4, 36); m.add({ kind: 'deco', sprite: 'p100_crane', x: bx, y: by, scale: 1, solid: false, radius: 0.05, label: TX.crane, _decor: true }); }
    // ---- Tower Nine's foot: the lamp, the postern, the Quartermaster, the trolley
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) if (L0.map === MAP) m.add(SOULS91.lampEnt(L0));
    { const pc = nearestOfKind(P.nine[2] + 2, P.nine[1] + 2, (t, i, j) => (t === 3 || t === 2) && i > P.nine[2] && j <= P.nine[1] + 4, 6) || [P.nine[2] + 1, P.nine[1] + 2];
      m.set(pc[0], pc[1], DOOR({ tex: 't_p100_door', label: TX.postern, locked: '__never', lockMsg: TX.posternMsg })); m.setLvl(pc[0], pc[1], 0); P.postern = pc; }
    m.deco('sign', P.nine[0] + 5.5, P.nine[1] + 1.4, { radius: 0.15, scale: 0.8, solid: false, label: TX.towerFoot });
    for (const [key, pt] of [['nine', P.railNine], ['yard', P.railYard], ['gate', P.railGate]]) m.deco('p100_trolley', pt[0], pt[1], { radius: 0.5, scale: 1, solid: true, use: 'p100_rail', _p100: 'rail_' + key, label: TX.railDead });
    m.deco('p100_chock', P.railNine[0] + 1.0, P.railNine[1] + 0.4, { radius: 0.1, scale: 1, solid: false, label: TX.railChocked, _p100: 'chock' });
    // ---- the Halls' door, the magazine lane, the west gate
    { const [i, j] = P.hallsDoor; for (let dj = -6; dj <= 0; dj++) for (let di = -9; di <= 9; di++) { const k = at(i + di, j + dj); if (k >= 0) { m.smooth[k] = 0; L[k] = 0; m.block(i + di, j + dj, (di + 40) % 4 === 0 ? 't_p100_barrack' : 't_p100_obsidian', 3.6, { capTex: 't_p100_walk' }); } }
      m.set(i, j, DOOR({ tex: 't_p100_door', portal: { map: HALLS, x: Q.in[0], y: Q.in[1], dir: -PI / 2 }, label: TX.hallsDoor })); m.setLvl(i, j, 0); }
    { const [i, j] = P.magDoor; for (let di = -5; di <= 5; di++) { const k = at(i + di, j); if (k >= 0) { m.smooth[k] = 0; L[k] = 0; m.block(i + di, j, 't_p100_obsidian', 2.2, { capTex: 't_p100_walk' }); } }
      m.set(i, j, DOOR({ tex: 't_p100_door', portal: { map: HALLS, x: Q.eastIn[0], y: Q.eastIn[1], dir: PI }, label: TX.magPostern, locked: 'p100_stray', lockMsg: TX.magPosternMsg })); m.setLvl(i, j, 0);
      m.deco('sign', i + 2.5, j + 1.5, { radius: 0.15, scale: 0.8, solid: false, label: TX.lane }); }
    { const [i, j] = P.gateDoor; m.set(i, j, DOOR({ tex: 't_p100_door', label: TX.gate, locked: '__never', lockMsg: TX.gateMsg })); m.setLvl(i, j, 0);
      for (let di = 1; di <= 2; di++) { const k = at(i + di, j); if (k >= 0) { m.set(i + di, j, null); m.smooth[k] = 1; L[k] = 0; m.setFloor(i + di, j, FLAG); } }
      m.deco('sign', P.gate[0] + 2.5, P.gate[1] + 6.4, { radius: 0.15, scale: 0.8, solid: false, label: TX.gateSign }); }
    // ---- lanterns along the main street and in the yards (every so many cells, fixed)
    const lanternAt = (x, y) => { const k = at(x | 0, y | 0); if (k < 0 || m.isBlocked(x | 0, y | 0) || (kind[k] !== 1 && kind[k] !== 6)) return; if (m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < 5)) return; m.deco('p100_lantern', x, y, { radius: 0.12, scale: 1, solid: false, glow: 0.7, lightCol: [235, 180, 110], label: TX.barrack, _p100: 'lantern' }); };
    { const pts = ROUTES.main; for (let k = 0; k + 1 < pts.length; k++) { const n = Math.max(1, Math.round(Math.hypot(pts[k + 1][0] - pts[k][0], pts[k + 1][1] - pts[k][1]) / 9)); for (let t = 0; t < n; t++) lanternAt(pts[k][0] + (pts[k + 1][0] - pts[k][0]) * (t + 0.5) / n + 0.5, pts[k][1] + (pts[k + 1][1] - pts[k][1]) * (t + 0.5) / n + 1.9); } }
    for (const [x, y] of [[P.yard[0] + 1.5, P.yard[1] + 1.5], [P.yard[2] - 1.5, P.yard[3] - 1.5], [P.square[0] + 1.5, P.square[3] - 1.5], [P.square[2] - 1.5, P.square[1] + 2.5], [P.lane[0] + 1.5, P.lane[3] - 1.5], [P.gate[2] - 1.5, P.gate[1] + 1.5], [P.nine[2] - 1.5, P.nine[3] - 1.5]]) lanternAt(x, y);
    // ---- the people
    const who = (id, x, y, face, extra) => { const [px, py] = snap(m, x, y); return m.npc(id, px, py, Object.assign({ facing: face || 0 }, extra || {})); };
    who('p100_ward', P.ward[0], P.ward[1], PI); who('p100_94', P.n94[0], P.n94[1], PI);
    for (const [dx, dy] of [[-3.4, -2.2], [-2.6, 2.6], [1.2, -3.0]]) who('p100_mastcrew', P.mast[0] + dx, P.mast[1] + dy, 0);
    who('p100_211', P.n211[0], P.n211[1], PI);
    // a pair at every manned battery (the bell is theirs to ring); Nineteen at Seven, Eighty-Eight at Six
    const pairs = { 5: ['p100_tr_b', 'p100_tr_c'], 6: ['p100_88', 'p100_tr_a'], 7: ['p100_19', 'p100_tr_d'], 9: ['p100_tr_c', 'p100_tr_b'] };
    for (const tw of TOWERS) if (tw.manned && tw.bell) { const ids = pairs[tw.n], tx = -Math.sin(tw.deg * PI / 180), ty = -Math.cos(tw.deg * PI / 180);
      who(ids[0], tw.bell[0] + tx * 1.3, tw.bell[1] + ty * 1.3, -tw.deg * PI / 180); who(ids[1], tw.bell[0] - tx * 1.3, tw.bell[1] - ty * 1.3, -tw.deg * PI / 180); }
    who('p100_qm', P.qm[0], P.qm[1], PI);
    for (const [x, y, id, f] of [[100.5, 111.5, 'p100_tr_a', 0], [102.0, 111.5, 'p100_tr_d', PI], [246.5, 95.5, 'p100_tr_b', 0], [248.0, 95.6, 'p100_tr_c', PI], [P.gate[0] + 3.5, P.gate[1] + 8.5, 'p100_tr_d', 0], [P.gate[0] + 3.6, P.gate[1] + 10.0, 'p100_tr_a', 0], [P.square[0] + 3.5, P.square[1] + 4.5, 'p100_tr_c', PI / 2], [P.square[0] + 5.0, P.square[1] + 4.6, 'p100_tr_b', PI / 2]]) who(id, x, y, f);
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- building the Halls
  function buildHalls() {
    const m = new GameMap(HALLS, TX.nameHalls, HW, HH, { floor: 't_p100_boards', ceil: 't_p100_vault', floorTextures: ['t_p100_boards', 't_p100_flag', 't_p100_rock', 't_p100_felt'], fogDist: 30, fogColor: [30, 27, 24], ambient: 0.8, music: 'inside', danger: 0,
      spawn: { x: Q.in[0], y: Q.in[1], dir: -PI / 2 } });
    m.rect(0, 0, HW - 1, HH - 1, 't_p100_hall');
    const room = (r, floor) => { m.clear(r[0], r[1], r[2], r[3]); if (floor != null) for (let j = r[1]; j <= r[3]; j++) for (let i = r[0]; i <= r[2]; i++) m.setFloor(i, j, floor); };
    room(Q.hall, 0); room(Q.niche, 1); room(Q.landing, 1); room(Q.barrack, 0); room(Q.passage, 3); room(Q.mag, 3);
    m.clear(45, 15, 45, 15); m.setFloor(45, 15, 1);   // the hall's east door, open
    for (let i = Q.mag[0]; i <= Q.mag[2]; i++) { if (i < 59 || i > 63) m.set(i, Q.mag[1] - 1, WALL('t_p100_kegs')); m.set(i, Q.mag[3] + 1, WALL('t_p100_kegs')); }
    for (let j = Q.mag[1]; j <= Q.mag[3]; j++) { m.set(Q.mag[0] - 1, j, WALL('t_p100_kegs')); if (j !== Q.east[1]) m.set(Q.mag[2] + 1, j, WALL('t_p100_kegs')); }
    for (const [i, j] of [[52, 25], [52, 26], [52, 30], [52, 31], [60, 25], [60, 26], [60, 30], [60, 31]]) m.set(i, j, WALL('t_p100_kegs'));   // stacks standing free in the vault
    // the doors
    m.set(Q.door[0], Q.door[1], DOOR({ tex: 't_p100_door', portal: { map: MAP, x: P.hallsOut[0], y: P.hallsOut[1], dir: PI / 2 }, label: TX.hallsOut }));
    m.set(Q.blanket[0], Q.blanket[1], DOOR({ tex: 't_p100_blanket', label: TX.blanket }));
    m.set(Q.magDoor[0], Q.magDoor[1], DOOR({ tex: 't_p100_door', label: TX.magDoor, locked: 'p100_stray', lockMsg: TX.magDoorMsg }));
    m.clear(Q.magDoor[0], Q.magDoor[1] + 1, Q.magDoor[0], Q.mag[1] - 1);
    m.set(Q.bDoor[0], Q.bDoor[1], DOOR({ tex: 't_p100_door', label: TX.passage }));
    m.set(Q.east[0], Q.east[1], DOOR({ tex: 't_p100_door', portal: { map: MAP, x: P.magOut[0], y: P.magOut[1], dir: PI / 2 }, label: TX.magPosternOut, locked: 'p100_stray', lockMsg: TX.magPosternMsg }));
    // the Hall: bunks down both walls, some with a sleeper and a watcher; mess tables; lanterns; the issue-hatch
    const lantern = (x, y) => m.deco('p100_window', x, y, { radius: 0.05, scale: 1, solid: false, glow: 0.8, lightCol: [240, 196, 120], label: TX.passage, nopick: true, _decor: true });
    let b = 0;
    for (const y of [8.7, 22.3]) for (let x = 5.5; x <= 42; x += 3.4) { if (y > 20 && Math.abs(x - 24.5) < 3) continue; if (y < 10 && x > 18 && x < 30) continue; if (y < 10 && x > 35) continue;
      const asleep = (b++ % 3) === 1; m.deco(asleep ? 'p100_bunkasleep' : 'p100_bunk', x, y, { radius: 0.6, scale: 1, solid: true, label: asleep ? TX.sleeper : TX.bunk });
      if (asleep) m.npc('p100_watcher', x + 0.2, y + (y < 10 ? 1.3 : -1.3), { facing: y < 10 ? -PI / 2 : PI / 2 }); }
    for (const [x, y] of [[31.5, 14.5], [36.5, 14.5], [40.5, 17.5], [10.5, 15.5]]) m.deco('p100_table', x, y, { radius: 0.7, scale: 1, solid: true, label: TX.table });
    for (const [x, y] of [[8.5, 8.2], [16.5, 22.8], [33.5, 22.8], [43.6, 12.5], [24.5, 3.2], [49.5, 12.2], [52.5, 3.2], [61.5, 5.2], [61.5, 14.5], [50.5, 21.2], [64.5, 21.2], [57.5, 34.8]]) lantern(x, y);
    for (let x = 6.5; x <= 42; x += 5) for (const y of [12.5, 18.5]) m.deco('p100_lantern', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.8, lightCol: [240, 196, 120], label: TX.passage, nopick: true, _decor: true });   // lanterns on posts down the hall
    for (const [x, y] of [[49.5, 15.5], [52.5, 6.5], [57.5, 27.5], [50.5, 31.5], [63.5, 31.5]]) m.deco('p100_lantern', x, y, { radius: 0.1, scale: 1, solid: false, glow: 0.8, lightCol: [240, 196, 120], label: TX.passage, nopick: true, _decor: true });
    m.deco('p100_hatch', Q.issue[0], 8.25, { radius: 0.4, scale: 1, solid: false, label: TX.hatch, nopick: true, _decor: true });
    m.npc('p100_issue', Q.issue[0], Q.issue[1], { facing: PI / 2 });
    // pairs, talking
    for (const [x, y, id, f] of [[14.5, 13.5, 'p100_tr_a', 0], [16.0, 13.6, 'p100_tr_c', PI], [28.5, 18.5, 'p100_tr_d', 0], [30.0, 18.4, 'p100_tr_b', PI], [35.5, 12.9, 'p100_tr_b', PI / 2], [37.5, 12.9, 'p100_tr_a', PI / 2], [8.5, 19.0, 'p100_tr_c', 0], [10.0, 19.1, 'p100_tr_d', PI]]) m.npc(id, x, y, { facing: f });
    // the talking-post, the roster
    lamps();
    if (typeof SOULS91 !== 'undefined' && SOULS91.lampEnt) for (const L0 of LAMPS) if (L0.map === HALLS) m.add(SOULS91.lampEnt(L0));
    m.deco('p100_board', Q.board[0], Q.board[1], { radius: 0.3, scale: 1, solid: false, use: 'p100_roster', label: TX.roster });
    m.npc('p100_roster', Q.rosterCorp[0], Q.rosterCorp[1], { facing: 0 });
    // the landing, the squad's barrack, the powder passage
    m.npc('p100_corp', Q.corp[0], Q.corp[1], { facing: 0 });
    for (const [x, y] of [[47.5, 3.7], [51.0, 3.7], [47.5, 9.7], [51.0, 9.7], [54.5, 9.7]]) m.deco('p100_bunk', x, y, { radius: 0.6, scale: 1, solid: true, label: TX.bunk });
    m.deco('p100_locker', Q.locker[0], Q.locker[1], { radius: 0.3, scale: 1, solid: true, use: 'p100_locker', label: TX.locker });
    m.deco('p100_locker', 49.2, 5.0, { radius: 0.3, scale: 1, solid: true, label: TX.bunk }); m.deco('p100_locker', 52.6, 8.6, { radius: 0.3, scale: 1, solid: true, label: TX.bunk });
    m.npc('p100_51', Q.n51[0], Q.n51[1], { facing: PI / 2 }); m.npc('p100_207', Q.n207[0], Q.n207[1], { facing: 0 });
    m.deco('p100_rack', Q.rack[0], Q.rack[1], { radius: 0.3, scale: 1, solid: false, use: 'p100_felts', label: TX.feltRack, _p100: 'rack' });
    m.deco('p100_feltsign', Q.sign[0], Q.sign[1], { radius: 0.05, scale: 1, solid: false, label: TX.feltSign });
    // Magazine Four: the Stray, its nine days of tape, and the Stray stood down (shown when it has been)
    m.enemy('p100_stray', Q.stray[0], Q.stray[1], { _p100: 'stray', facing: -PI / 2 });
    m.deco('p100_stray', Q.stray[0] + 3.2, Q.stray[1] - 3.0, { radius: 0.4, scale: 1.05, solid: true, label: TX.strayStood, hidden: true, _p100: 'stood' });
    m.deco('p100_tape', Q.tape[0], Q.tape[1], { radius: 0.1, scale: 1, solid: false, label: TX.tape, nopick: true, _p100: 'tapedeco' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  function join(maps) {
    if (!maps || maps[MAP] || !G0 || typeof GameMap === 'undefined') return false;
    defs(); art();
    maps[HALLS] = buildHalls();
    maps[MAP] = build();
    try { if (typeof POST !== 'undefined' && POST.config && POST.config.grade && POST.config.gradePresets) { const gp = { gain: [0.98, 0.99, 1.03], lift: [4, 4, 6], sat: 0.7, con: 0.05 }; if (!POST.config.gradePresets.p100_grey) POST.config.gradePresets.p100_grey = { day: gp, night: gp }; if (!POST.config.grade[MAP]) POST.config.grade[MAP] = 'p100_grey'; } } catch (e) { warnOnce('grade', e); }
    return true;
  }
  function wireKestrel() {
    if (typeof KESTREL16 === 'undefined' || !KESTREL16.addFar) return;
    KESTREL16.addFar({ id: MAP, name: TX.fly, arrive: TX.arrive, down: TX.down, toLabel: TX.toLabel, hours: 48,
      landing: () => ({ map: MAP, x: P.arrive[0], y: P.arrive[1], dir: 0 }) });
  }

  // ================================================================ play
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const fmt = (s, ...a) => String(s).replace(/\{(\d)\}/g, (_, i) => String(a[+i]));
  const once = (bit, t, cls, ms) => { const s = fint('p100_seen', 0xfffff); if (s & (1 << bit)) return false; f().p100_seen = s | (1 << bit); say(t, cls, ms); return true; };
  const special = (n) => { try { return typeof GEAR87 === 'object' && GEAR87.special && GEAR87.special(n); } catch (e) { return false; } };
  const onWall = () => typeof G !== 'undefined' && G.map && G.mapId === MAP && G.map.id === MAP;
  const inHalls = () => typeof G !== 'undefined' && G.map && G.mapId === HALLS && G.map.id === HALLS;
  const inRect = (r, x, y) => x >= r[0] && x < r[2] + 1 && y >= r[1] && y < r[3] + 1;
  const B = { WARN_S: 4.5, QUIET_S: 8.0, WALK: 0.85, OVER_S: 2.6, BELL_R: 7, TALK_S: 4.0, LOOK_S: 3.5, CYCLE: 16, GAP0: 11.5, GAP1: 15.6, XP: 240 };
  // ---- talk: the Murmur, on the Watch, is the next line of your subject
  let quiet = 0, relieved = false, atParapet = 0, talkT = 0, lookT = 0, lastSafe = null, warnedQuiet = false;
  function subjectLine() {
    const s = fint('p100_subj', 4), n = fint('p100_line', 9999); f().p100_line = (n + 1) % 9600;
    if (s === 1) return n % 2 ? TX.days1 : TX.days0;
    if (s === 2) { const c = fint('p100_eyes', 9000); f().p100_eyes = c + 3 > 8990 ? 0 : c + 3; return fmt(TX.eyes, c + 1, c + 2, c + 3); }
    if (s === 3) return [TX.onions0, TX.onions1, TX.onions2, TX.onions3][n % 4];
    if (s === 4) return [TX.road0, TX.road1, TX.road2][n % 3];
    return TX.talkNone;
  }
  function talk() {
    talkT = B.TALK_S; quiet = 0; warnedQuiet = false;
    if (relieved) { relieved = false; atParapet = 0; try { document.getElementById('view').classList.remove('unwrite'); } catch (e) { /* no view */ } say(TX.talkSave, 'good', 5000); }
  }
  function murmur() {
    if (strayActive() && inRect(Q.mag, Engine.cam.x, Engine.cam.y)) { answer(); return; }
    G.murmurT = 4; try { ORIG.addNoise.call(null, 0.9); } catch (e) { /* no gauge */ } try { Audio_.sfx.murmur(); } catch (e) { /* no sound */ }
    say(subjectLine(), '', 2600); talk();
  }
  // ---- the quiet, on the wall
  const onLip = (x, y) => { const d = G.map._p100; if (!d) return false; const k = d.kind[at(x | 0, y | 0)]; return k === 4 || (k === 5 && rOf(x, y) > RC - 9); };
  function mannedNear(x, y) { const R = B.BELL_R * (special('bell') ? 2 : 1); return TOWERS.some((tw) => tw.manned && tw.bell && Math.hypot(tw.bell[0] - x, tw.bell[1] - y) <= R); }
  function tickWall(dt) {
    const p = G.player, c = Engine.cam;
    // nobody goes up the wall stair without a subject: Two-Eleven turns you back at the chain
    { const d = G.map._p100, k = at(c.x | 0, c.y | 0); if (d && k >= 0 && d.kind[k] === 5 && d.stair[k] === 0 && !fint('p100_subj', 4) && rOf(c.x, c.y) > STAIRS[0].r0 + 1.4) { c.x = P.chain[0] - 1.6; c.y = P.chain[1]; c.dir = 0; p.feet = G.map.groundAt(c.x, c.y); say(TX.chainMsg, 'warn', 9000); return; } }
    if (!onLip(c.x, c.y)) { quiet = Math.max(0, quiet - dt * 2); if (relieved) { relieved = false; try { document.getElementById('view').classList.remove('unwrite'); } catch (e) { /* */ } } lookT = 0; if (G.map.smooth && G.map.smooth[at(c.x | 0, c.y | 0)]) lastSafe = { x: c.x, y: c.y, dir: c.dir }; return; }
    once(1, TX.walk, '', 7000);
    if (!relieved) lastSafe = { x: c.x, y: c.y, dir: c.dir };
    // the not-colour cannot be looked at (Book Three): your eyes go down
    const out = Math.cos(c.dir) * (c.x - CX) + Math.sin(c.dir) * (c.y - CY);
    if (out / Math.max(1, rOf(c.x, c.y)) > 0.8 && (c.pitch || 0) > -18) { lookT += dt; if (lookT > B.LOOK_S) { c.pitch = Math.max(-34, (c.pitch || 0) - dt * 60); once(2, TX.lookAway, '', 6000); } } else if (lookT > 0) lookT = Math.max(0, lookT - dt * 2);
    // talk keeps it off; so does a Song, or a blow struck (anything that makes a sound of yours)
    if (talkT > 0 || (G.murmurT || 0) > 0) { talkT = Math.max(0, talkT - dt); quiet = 0; return; }
    quiet += dt / (special('talk') ? 1.5 : 1);
    if (quiet > B.WARN_S && !warnedQuiet && !relieved) { warnedQuiet = true; say(TX.quietWarn, 'bad', 4000); }
    if (quiet > B.QUIET_S && !relieved) {
      if (mannedNear(c.x, c.y)) { quiet = 0; warnedQuiet = false; talkT = B.TALK_S * 2; say(TX.bellSave, 'warn', 9000); try { Audio_.sfx.bell(); } catch (e) { /* no bell */ } return; }
      relieved = true; atParapet = 0; say(TX.relieved, 'bad', 7000); try { document.getElementById('view').classList.add('unwrite'); } catch (e) { /* no view */ }
    }
    if (relieved) {
      G.keys = {};
      const r = Math.max(1, rOf(c.x, c.y)), ux = (c.x - CX) / r, uy = (c.y - CY) / r, x0 = c.x, y0 = c.y;
      c.dir = Math.atan2(uy, ux);
      try { if (typeof playerMove === 'function') playerMove(c, ux * B.WALK * dt, uy * B.WALK * dt); } catch (e) { warnOnce('walk', e); }
      if (Math.hypot(c.x - x0, c.y - y0) < B.WALK * dt * 0.4) atParapet += dt; else atParapet = 0;
      if (atParapet > B.OVER_S) { relieved = false; try { document.getElementById('view').classList.remove('unwrite'); } catch (e) { /* */ } if (lastSafe) { c.x = lastSafe.x; c.y = lastSafe.y; } p.hp = 0; die(TX.overEdge); }
    }
  }
  // ---- the Stray in Magazine Four
  const strayEnt = () => G.ents.find((e) => e && e._p100 === 'stray');
  const strayActive = () => inHalls() && fint('p100_stray', 1) === 0 && !!strayEnt();
  let sClock = 0, sStage = -1, rang = false;
  function answer() {
    const u = sClock % B.CYCLE;
    if (u < B.GAP0 || u > B.GAP1) { say(TX.notNow, '', 2500); return; }
    if (!fint('p100_words', 1)) { say(TX.noWords, 'warn', 6000); return; }
    const wrongWay = (t) => () => { say(t, 'bad', 7000); sClock = 0; sStage = -1; const p = G.player; p.hp -= 8; G.hurtT = 0.2; try { Audio_.sfx.hurt(); } catch (e) { /* */ } if (p.hp <= 0) die(TX.strayName); };
    showEvent(TX.sayTitle, TX.sayBody, [
      { t: TX.sayWrong1, f: wrongWay(TX.wrong) }, { t: TX.sayRight, f: standDown }, { t: TX.sayWrong2, f: wrongWay(TX.hushed) }, { t: TX.sayNothing, f: () => { sClock = B.GAP1; } },
    ]);
  }
  function standDown() {
    f().p100_stray = 1; sync();
    say(TX.stoodDown, 'good', 12000);
    try { if (typeof questXp === 'function') questXp(B.XP); } catch (e) { warnOnce('xp', e); }
    try { journal('side', TX.jStray); } catch (e) { warnOnce('journal', e); }
    leavings();
  }
  function leavings() {
    if (fint('p100_kdrop', 1) || !inHalls()) return;
    f().p100_kdrop = 1;
    for (const [id, dx] of [['w_p100_mallet', -0.5], ['v_p100_tape', 0.5]]) { const it = ITEMS[id]; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: Q.tape[0] + dx, y: Q.tape[1] + 0.6, scale: 0.35, yOff: 0, solid: false })); }
  }
  function tickHalls(dt) {
    const c = Engine.cam, p = G.player;
    if (inRect(Q.hall, c.x, c.y)) once(3, TX.hallsLoud, '', 9000);
    const e = strayEnt();
    if (fint('p100_stray', 1) === 1) { if (inRect(Q.mag, c.x, c.y)) leavings(); return; }
    if (!e) return;
    if (e.dead || e.hp < 400) { e.dead = false; e.hp = 900; e.hidden = false; if (!rang) { rang = true; say(TX.rings, '', 5000); } }   // it cannot be put down by blows
    if (!inRect(Q.mag, e.x, e.y)) { e.x = Q.stray[0]; e.y = Q.stray[1]; }   // it does not leave the powder
    if (!inRect(Q.mag, c.x, c.y)) { sClock = 0; sStage = -1; rang = false; e.state = 'idle'; e.alertT = 0; e.x = Q.stray[0]; e.y = Q.stray[1]; return; }
    once(4, TX.strayWake, 'warn', 8000);
    const u0 = sClock % B.CYCLE; sClock += dt; const u = sClock % B.CYCLE;
    const stage = u < 4 ? 0 : u < 8 ? 1 : u < B.GAP0 ? 2 : u < B.GAP1 ? 3 : 4;
    if (stage !== sStage || u < u0) { sStage = stage; say([TX.line1, TX.line2, TX.line3, TX.lineGap, TX.lineAgain][stage], stage === 3 ? 'warn' : '', stage === 3 ? 4000 : 3600); }
    // while it waits for the line it does not strike
    if (stage === 3) e.cool = Math.max(e.cool || 0, 1.2);
    void p;
  }
  function tick(dt) {
    if (typeof G === 'undefined' || G.state !== 'play' || !G.player || G.dead) return;
    if (onWall()) tickWall(dt); else if (inHalls()) tickHalls(dt); else if (relieved) { relieved = false; quiet = 0; }
  }

  // ---------------------------------------------------------------- using things
  function rideTo(pt, dir) { const c = Engine.cam; c.x = pt[0] - 1.3; c.y = pt[1] - 0.2; c.dir = dir; if (G.player) { G.player.feet = G.map.groundAt(c.x, c.y); G.player.fallFrom = null; G.player.fallV = 0; } const [sx, sy] = snap(G.map, c.x, c.y); c.x = sx; c.y = sy; say(TX.railRide, '', 5000); }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p100_/.test(e.use)) return false;
    if (e.use === 'p100_kestrel' && onWall()) { if (typeof KESTREL16 !== 'undefined' && KESTREL16.board) KESTREL16.board(); return true; }
    if (e.use === 'p100_rail' && onWall()) {
      const free = fint('p100_rail', 1) === 1, here = String(e._p100 || '').slice(5);
      if (!free && here === 'nine') { f().p100_rail = 1; say(TX.railFree, 'good', 8000); try { Audio_.sfx.door(); } catch (er) { /* */ } sync(); return true; }
      if (!free) { say(TX.railDead, '', 5000); return true; }
      const stops = [['nine', TX.railToNine, P.railNine, PI], ['yard', TX.railToYard, P.railYard, -PI / 2], ['gate', TX.railToGate, P.railGate, -PI / 2]];
      showEvent(TX.railTitle, TX.railBody, stops.filter((s0) => s0[0] !== here).map((s0) => ({ t: s0[1], f: () => rideTo(s0[2], s0[3]) })).concat([{ t: TX.railStay, f: null }]));
      return true;
    }
    if (e.use === 'p100_roster' && inHalls()) {
      const pick = (n) => () => { f().p100_subj = n; f().p100_line = 0; say(TX.subjTaken, 'good', 9000); };
      showEvent(TX.rosterTitle, TX.rosterBody, [{ t: TX.subjDays, f: pick(1) }, { t: TX.subjEyes, f: pick(2) }, { t: TX.subjOnions, f: pick(3) }, { t: TX.subjRoad, f: pick(4) }]);
      return true;
    }
    if (e.use === 'p100_locker' && inHalls()) {
      const first = !fint('p100_words', 1);
      showEvent(TX.lockerTitle, TX.lockerBody, [{ t: TX.lockerClose, f: () => { if (first) { f().p100_words = 1; try { journal('side', TX.jWords); } catch (er) { warnOnce('journal', er); } } } }]);
      return true;
    }
    if (e.use === 'p100_felts' && inHalls()) {
      if (G.has && (G.has('a_p100_felts') || (G.player.armor && G.player.armor.feet === 'a_p100_felts'))) { say(TX.feltHave, '', 3000); return true; }
      G.give('a_p100_felts', 1); say(TX.feltTake, 'good', 4000); return true;
    }
    return false;
  }
  function sync() {
    if (typeof G === 'undefined' || !G.map) return;
    if (onWall()) {
      const free = fint('p100_rail', 1) === 1;
      for (const e of G.ents) { if (!e) continue; if (String(e._p100 || '').indexOf('rail_') === 0) e.label = free ? TX.railStop : e._p100 === 'rail_nine' ? TX.railChocked : TX.railDead; else if (e._p100 === 'chock') e.hidden = free; }
    }
    if (inHalls()) {
      const stood = fint('p100_stray', 1) === 1;
      for (const e of G.ents) { if (!e) continue; if (e._p100 === 'stray') { e.hidden = stood; e.dead = stood; if (stood) e.solid = false; } else if (e._p100 === 'stood') { e.hidden = !stood; e.solid = stood; } else if (e._p100 === 'tapedeco') e.hidden = stood; }
      try { const md = G.map.cells[Q.magDoor[1] * HW + Q.magDoor[0]]; if (md) md.label = stood ? TX.magDoorOpen : TX.magDoor; } catch (e) { /* no door */ }
    }
    try { if (typeof NPCS !== 'undefined' && NPCS.p100_corp) NPCS.p100_corp.topics = Object.assign({}, fint('p100_stray', 1) ? SAY.corpAfter : SAY.corp.topics); } catch (e) { warnOnce('corp', e); }
  }

  // ---------------------------------------------------------------- wiring
  const ORIG = {};
  function wire() {
    defs(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { quiet = 0; relieved = false; atParapet = 0; talkT = 0; lookT = 0; lastSafe = null; warnedQuiet = false; sClock = 0; sStage = -1; rang = false; try { document.getElementById('view').classList.remove('unwrite'); } catch (e2) { /* */ } sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); } catch (e) { warnOnce('tick', e); } return r; }; }
    // the Murmur is talk here; and any sound of yours counts as talk on the wall, while in the Halls nothing of yours is heard
    if (typeof castSong === 'function') { const _c = castSong; castSong = function (id) { try { if (id === 'murmur' && (onWall() || inHalls()) && G.state === 'play' && !G.dead) { murmur(); return undefined; } } catch (e) { warnOnce('murmur', e); } return _c.apply(this, arguments); }; }
    if (typeof addNoise === 'function') { ORIG.addNoise = addNoise; addNoise = function (n) { try { if (Number(n) > 0 && typeof G !== 'undefined' && G.map) { if (onWall()) talk(); if (inHalls() && inRect(Q.hall, Engine.cam.x, Engine.cam.y)) return undefined; } } catch (e) { warnOnce('noise', e); } return ORIG.addNoise.apply(this, arguments); }; }
    else ORIG.addNoise = () => {};
    if (typeof attack === 'function') { const _a = attack; attack = function () { try { if (inHalls() && G.state === 'play' && (inRect(Q.mag, Engine.cam.x, Engine.cam.y) || inRect(Q.passage, Engine.cam.x, Engine.cam.y)) && typeof currentWeapon === 'function' && currentWeapon().type === 'shot') { say(TX.shot, 'warn', 4000); return undefined; } } catch (e) { warnOnce('shot', e); } return _a.apply(this, arguments); }; }
    wireKestrel();
  }
  wire();

  return { TX, SAY, TEXTS, MAP, HALLS, W, H, HW, HH, P, Q, ROUTES, FLOORS, TOWERS, STAIRS, RC, CX, CY, WH, B, STRAY_DEF, ARMOR_DEFS, SPIKE_DEF, MALLET_DEF, pol, rOf, degOf, plan, build, buildHalls, join, decode, tick, useOwn, sync, murmur, talk, standDown, answer,
    lamps: () => LAMPS, state: () => ({ quiet, relieved, atParapet, talkT, sClock, sStage }), setQuiet: (v) => { quiet = v; }, setStray: (v) => { sClock = v; }, onLip: (x, y) => onLip(x, y), mannedNear };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = RIFT100;
if (typeof window !== 'undefined') window.RIFT100 = RIFT100;
