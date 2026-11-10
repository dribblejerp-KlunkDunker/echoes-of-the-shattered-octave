// ============================================================
//  cutter68 — Ten Heartbeats, played (Book One ch. 21; ROADMAP R9 item 20).
//
//  The climb at Whisper-Grove (grove.js wgLadder, or kestrel16's "Climb, and go on") calls startPart4 (js/coda.js), which
//  hands the passage to this module when the deck can be played (kestrel16 on); its old text card stays as the fallback.
//  The chapter is Vane's, on his own deck, from the sky-dock to the clearing; every card is the book's words:
//    1  ELEVEN MINUTES (on the ground). The load under the Malting's smoke, Pennick's figures from the ladder, "Can she
//       fly?" / "She can sink slowly—", the Aegis on the ladder one-handed, water over the side, the Bell Yard; Bettis
//       screaming in the hold and Hetty taking it in hand, in the Narrow.
//    2  OVER THE SIDE (deck) [PROPOSED as play]: heave the water, the spare envelope canvas, the tackle and that chain over
//       the rail (the crew do it without you). She comes off the Cloister road and goes up like a wet sack.
//    3  THE CUTTER. Out of the south: lead-grey, four hard little tanks, the long gun, the grapnel-thrower and the horn
//       ("It's not a trumpet"). "We're a bell." "Pack it like glass for a long haul." "Lower." [PROPOSED as play] Down the
//       hatch and pack the crates in the hold with Hetty: the horn's dial drops, never to nothing (your cargo is not silent).
//    4  THE TEN HEARTBEATS [PROPOSED: the count is the chapter's title, played]. Down into the willow-tops at forty feet;
//       the cutter goes over at three hundred feet; keep still and make no sound for ten heartbeats (G.noise, the game's
//       Narrow, under QUIET). A sound is an Echo (RITE43.echo): the horn hears a cough on a deck. Then it loses them in the
//       mist and comes back anyway, by the horn: "the way you find a hive" (canon, whatever you do).
//    5  THE GUN AND THE HOOK. The skirt; the port rail and the splinter through Pennick's thigh; Cape Dissonance; four
//       proctors down the grapnel-line; the Aegis (DEFEND THE SINGERS). Without the Aegis following [PROPOSED]: two of them
//       on the deck to meet at the rail, with Mags and a belaying pin; dying there is an Echo; the third and fourth go for
//       the rope rather than the deck.
//    6  "DON'T CUT IT!" Tobiah with the axe; "I want that cutter's bow where we are now in four seconds". Four seconds to
//       hold on [PROPOSED]; cutting the line yourself is an Echo (the book's Vane does not cut).
//    7  THE WILLOW, THE COURIER, THE DEEP WOODS. A terrier tied to a cart-horse; "not a victory"; the boy made of light
//       ("which way"; "East"; "Don't stop"), two scorched footprints on the foredeck; Sable's "courier Quill, J., in
//       transit"; the number-three tank weeping; the clearing by the Mausoleum of Chords ("only sad"); "Twenty-one". Then
//       coda.js's own landing (part4State, part4Land) puts you in the Deep Woods.
//    8  done.
//  Lines change with what you did earlier (Bettis awake or not, the Aegis following or not, Sable with you or not); the
//  chase never fails a quest. Progress is G.flags.c68 (+ c68_packed, c68_fight, c68_echo_*); figures are transient and
//  staged again on load; a save mid-count starts the count again. The engineer is Pennick here, as ch. 21 names him.
// ============================================================
'use strict';

const CUTTER68 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('cutter68: ' + k + ' failed', e); } };
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => a[+i] != null ? a[+i] : m);
  // the voices play through the Rite's sequencer (js/rite43.js): one token, so any card's choice hushes any scene's lines
  const seq = (ids) => { try { if (ids && ids.length && typeof RITE43 !== 'undefined' && RITE43.seq) RITE43.seq(ids); } catch (e) { warnOnce('seq', e); } };
  const hush = () => { try { if (typeof RITE43 !== 'undefined' && RITE43.hush) RITE43.hush(); } catch (e) { /* nothing playing */ } };
  const say = (t, cls, ms, ids) => { try { msg(String(t).replace(/<\/?i>/g, ''), cls || '', ms || 5200); } catch (e) { /* cosmetic */ } if (ids) seq(ids); };
  // a card: the book's paragraphs joined by breaks (each one its own French text node), and its spoken lines in order
  const card = (title, parts, choices, ids) => {
    const hushed = (choices || []).map((c) => Object.assign({}, c, { f: function () { hush(); return c.f && c.f.apply(this, arguments); } }));
    try { showEvent(title, parts.filter(Boolean).join('<br><br>'), hushed); } catch (e) { warnOnce('card', e); }
    seq(ids);
  };
  function echo(body, after, go) {
    if (typeof RITE43 !== 'undefined' && RITE43.echo) RITE43.echo(body, after, TX.echoTitle, go);
    else card(TX.echoTitle, [body], [{ t: go, f: after }]);
  }

  // ================================================================ the words (Book One ch. 21, ll. 5481–5658)
  const TX = {
    // 1 eleven minutes
    loadTitle: S('Eleven minutes'),
    load: S('They loaded in eleven minutes with a column of smoke standing over the Malting and every bird in the Spectral Woods going up out of the willows at once.'),
    figBA: S('Pennick did his figures on the ladder, shouting them upward, which was how Vane learned that his ship was now carrying four hundred and thirty-two cores, twenty-one Oakhaven survivors, five crew, one archivist, one press at four hundredweight, one woman who could not stop screaming, and one thing that was walking up the mast-ladder at that moment and putting a hundred and sixty pounds on each rung.'),
    figB: S('Pennick did his figures on the ladder, shouting them upward, which was how Vane learned that his ship was now carrying four hundred and thirty-two cores, twenty-one Oakhaven survivors, five crew, one archivist, one press at four hundredweight, and one woman who could not stop screaming.'),
    figA: S('Pennick did his figures on the ladder, shouting them upward, which was how Vane learned that his ship was now carrying four hundred and thirty-two cores, twenty-one Oakhaven survivors, five crew, one archivist, one press at four hundredweight, and one thing that was walking up the mast-ladder at that moment and putting a hundred and sixty pounds on each rung.'),
    fig0: S('Pennick did his figures on the ladder, shouting them upward, which was how Vane learned that his ship was now carrying four hundred and thirty-two cores, twenty-one Oakhaven survivors, five crew, one archivist, one press at four hundredweight.'),
    lift: S('"Captain. <i>Captain.</i> The lift\'s gone — we are eleven hundred pounds over what I told you yesterday and yesterday I was lying to make you feel better—"<br><br>"Can she fly?"<br><br>"She can <i>sink slowly</i>—"'),
    flyA: S('"Then she can fly." Vane leaned over the rail. The Aegis Sentinel was two-thirds of the way up the ladder, climbing hand over hand with a red cloak still folded in its left fist, which meant it was climbing a hundred-foot ladder one-handed. "Water over the side. All of it. And the spare envelope canvas, and the tackle, and that chain."'),
    fly0: S('"Then she can fly." Vane leaned over the rail. "Water over the side. All of it. And the spare envelope canvas, and the tackle, and that chain."'),
    drink: S('"We\'ll have nothing to drink—"<br><br>"We\'ll have nothing to <i>breathe</i> if the Office puts us in the Bell Yard. Over the side."'),
    bettis: S('Bettis Renn was screaming in the hold. They had got her down the ladder in a canvas sling with Bettany holding her head, and she had not stopped since the pressing room, and the sound came up out of the hatch and across the sky-dock and into the trees, and every single person on that deck knew exactly what sound carried in these woods and what came to it.'),
    hettyB: S('Hetty Bram took it in hand, because somebody had to. She put the nine children in the sail-locker with the door shut and Nell Carder in with them, and then she went down into the hold and sat on the floor by the sling and held the woman\'s hand and talked to her, steadily, about absolutely nothing, in the Narrow, for the next two hours.'),
    hetty0: S('Hetty Bram put the nine children in the sail-locker with the door shut and Nell Carder in with them.'),
    loadGo: S('Over the side'),
    jStart: S('The Kestrel is off the Cloister road, eleven hundred pounds over, with the Office behind us. Vane wants the water over the side, all of it.'),
    // 2 over the side
    overHint: S('Water over the side, all of it, and the spare envelope canvas, and the tackle, and that chain: use them at the rail.'),
    overWater: S('The water casks'), overCanvas: S('The spare envelope canvas'), overTackle: S('The tackle'), overChain: S('That chain'),
    overWaterGo: S('The water goes over the side, all of it.'),
    overCanvasGo: S('The spare envelope canvas goes over the side.'),
    overTackleGo: S('The tackle goes over the side.'),
    overChainGo: S('That chain goes over the side, and the deck comes up under your boots an inch.'),
    overCrew: S('The crew put the rest over the side.'),
    hudOver: S('OVER THE SIDE'),
    sackTitle: S('Like a wet sack'),
    sack: S('The Drift-Kestrel came off the Cloister road at eleven minutes past the hour with her envelope straining and her tanks singing sour, and she went up like a wet sack.'),
    sackGo: S('Six hundred feet'),
    // 3 the cutter
    cutterTitle: S('The cutter'),
    cutter: S('The cutter came out of the south before they had six hundred feet.'),
    cls: S('Vane knew the class. Everyone on the Rust Coast knew the class: an Office courier-cutter, forty feet, lead-grey, no envelope at all but four hard little drift-tanks slung in a cage amidships, which made her brutally fast and meant she could not carry anything heavier than paper and proctors. A long gun forward on a swivel. A grapnel-thrower aft. And on the bow, where a figurehead would be on an honest ship, a brass horn the size of a wash-tub.'),
    trumpet: S('"What\'s the trumpet for?" Tobiah said.<br><br>"It\'s not a trumpet," said Vane.'),
    horn: S('It was a listening horn. A sounding-cone with a proctor\'s ear at the small end of it, the same kit the Office used to walk a street in a dead town and find the one house with somebody breathing in it. In clear air at a thousand yards, a man on that horn could hear a cough on a deck.'),
    holdB: S('And the Kestrel\'s hold had four hundred and thirty-two people murmuring in it, and a woman screaming.'),
    hold0: S('And the Kestrel\'s hold had four hundred and thirty-two people murmuring in it.'),
    bell: S('<i>They don\'t need to see us at all</i>, Vane thought, with great clarity. <i>We\'re a bell. We\'ve been a bell for two years and I\'ve been the one ringing it.</i>'),
    magsDown: S('"Mags." He did not look away from the grey shape coming up out of the mist. "Down, and tell Hetty: everything they can stuff into the straw, round every crate. Blankets, coats, the canvas, the sail-locker spares. Pack it like glass for a long haul."<br><br>She read his lips and was gone down the hatch.'),
    lower: S('"Pennick, how low can you put her?"<br><br>Pennick looked at the canopy going past underneath — silver willow-tops, a hundred feet of them, with the drowned marble of Whisper-Grove showing through in patches.<br><br>"Captain, we\'re already low."<br><br>"Lower."'),
    cutterGo: S('Pack the crates'),
    packHint: S('Go down the hatch and help Hetty pack the crates in the hold: blankets, coats, the canvas, the sail-locker spares.'),
    packLabel: S('A crate in the straw'),
    packLook: S('A crate in the straw, murmuring. Stuff blankets and coats round it.'),
    packGood: S('You stuff blankets and coats into the straw round the crate, packed like glass for a long haul. The murmur under them goes duller.'),
    packedLook: S('Packed like glass for a long haul. It still murmurs, under the wool.'),
    packCrew: S('Hetty and Mags pack the last of the crates.'),
    lookHettyB: S('Hetty Bram, on the floor of the hold by the sling, holding the woman\'s hand and talking to her, steadily, about absolutely nothing, in the Narrow.'),
    lookHetty: S('Hetty Bram'), lookHetty0: S('Hetty Bram, stuffing the straw round the crates with both hands.'),
    lookBettis: S('Bettis Renn, in a canvas sling, screaming.'),
    lookMags: S('Mags, one-armed, packing straw round a crate with her good hand.'),
    lookVane: S('Captain Vane'), lookVaneText: S('Vane at the wheel. He does not look away from the grey shape in the mist.'),
    lookPennick: S('Pennick'), lookPennickText: S('Pennick, the engineer, doing figures he does not like out loud.'),
    lookTobiah: S('Tobiah Marsh'), lookTobiahText: S('Tobiah at the forward shrouds.'),
    lookAegis: S('The Aegis Sentinel'), lookAegisText: S('Nine feet of bronze at the bow, a red cloak folded in its left fist.'),
    hudHorn: S('THE HORN'),
    // 4 the ten heartbeats
    canopyTitle: S('Lower'),
    canopy: S('What followed was the worst twenty minutes of Vane\'s professional life, which was a field with serious competition in it.'),
    canopy2: S('He took the Drift-Kestrel down into the canopy of the Spectral Woods at forty feet with eleven hundred pounds too much aboard, and flew her up the line of the Cloister road because a road is the only straight thing in a forest, and the willow-tops came past the rail close enough that Tobiah, holding the forward shrouds, got a faceful of leaves twice.'),
    canopyGo: S('Keep still'),
    overhead: S('The cutter went over the top of them at three hundred feet.'),
    countHint: S('Ten heartbeats. Keep still, and make no sound.'),
    hudCount: S('TEN HEARTBEATS'),
    echoTitle: S('An Echo'),
    echoCount: S('A board gives under your boot, and that is all it takes. In clear air at a thousand yards, a man on that horn could hear a cough on a deck. The cutter does not lose you in the mist. It stands over the willow-tops and listens, and the long gun comes round on its swivel, and it does not have to guess.<br><br>That is not what happened.<br><br>You are back in the willow-tops, and the cutter is going over at three hundred feet.'),
    echoCountGo: S('Keep still'),
    backTitle: S('By the horn'),
    back: S('The cutter went over the top of them at three hundred feet and lost them in the mist and came back.'),
    hive: S('It came back because of the horn. It found them the way you find a hive: by listening until the sound got louder.'),
    backGo: S('The long gun'),
    // 5 the gun and the hook
    gunTitle: S('The long gun'),
    gun: S('It came down the road behind them at twice their speed and the long gun on its bow went off, and the first shot went through the envelope\'s skirt and out the other side, which does nothing to a skyship, and the second took four feet of the port rail off and sent a splinter the length of a forearm through the meat of Pennick\'s thigh.'),
    grapnel: S('Then it was over them, and the grapnel came down.'),
    gunGo: S('The hook'),
    boarded: S('Vane had been boarded three times in twenty-five years. Twice he had let them. Once, off Cape Dissonance in a crosswind, he had cut the hook and run, and been very lucky, and promised himself never again.'),
    bit: S('The hook came through the envelope\'s rigging and bit, and the cutter above began to haul, and the Kestrel came up by the nose and slewed sideways out of the road-line into the willows with branches raking down the starboard side like fingers on a drum.'),
    four: S('Four proctors came down the grapnel-line.'),
    plaza: S('They came the way they had come through the plaza — grey oilcloth, silver mesh, felted rods, no shouting at all — and they came down a rope at forty feet over a moving ship, which told Vane something he would have preferred not to know about the Office\'s training.'),
    crouch: S('The first one hit the deck in a crouch, perfectly balanced.'),
    aegis: S('The Aegis Sentinel picked him up off it and threw him over the side.'),
    aegis2: S('It was not a fight. There was no exchange. Nine feet of Office ironwork took an Office proctor by the arm and the belt and threw him out over the rail into four hundred feet of nothing without breaking stride, and the man made no sound going down, because he had been trained not to.'),
    aegis3: S('The second one it caught mid-drop and put through the deckhouse wall.'),
    aegis4: S('The third and fourth had the sense to go for the rope rather than the deck, and one of them got his rod into the back of the Aegis\'s knee-strut hard enough to bend something, and the machine turned round with the deliberation of a man noticing weather and caught him by the mesh of his mask.'),
    aegis5: S('<i>DEFEND THE SINGERS</i>, said the stencil on its chest, four feet from the proctor\'s face.'),
    aegis6: S('Vane looked away. He had the wheel. That was his excuse, and he kept it.'),
    aegisGo: S('The line'),
    fightGo: S('Meet them at the rail'),
    fightHint: S('The second one is coming down the line behind him. Meet them at the rail.'),
    magsPin: S('Mags comes across the deck one-armed with a belaying pin, and one of them goes down.'),
    fightRope: S('The third and fourth had the sense to go for the rope rather than the deck.'),
    echoFight: S('The felted rod comes down, and the deck comes up, and the grey oilcloth goes over you without a sound, because they have been trained not to make one.<br><br>That is not what happened.<br><br>You are back at the rail, and the first of them is on the deck.'),
    echoFightGo: S('The rail'),
    // 6 don't cut it
    lineTitle: S('Don\'t cut it'),
    line: S('"The line!" Tobiah was at the shrouds with an axe he had no idea how to use. "Captain, the hook — if we cut it we drop—"<br><br>"Don\'t cut it."<br><br>"<i>What?</i>"'),
    line2: S('"<i>Don\'t cut it!</i>" Vane put the wheel hard over. "Mags! Starboard! Take her <i>starboard</i> — into the trees — I want that cutter\'s bow where we are now in four seconds—"'),
    line3: S('Mags could not hear him and did not need to. She had been watching his hands on the wheel for nine years.'),
    lineGo: S('Hold on'),
    lineHint: S('Four seconds. Hold on.'),
    hudFour: S('FOUR SECONDS'),
    lineLabel: S('The grapnel line'),
    echoLine: S('You take the axe off Tobiah and cut the hook, and the line goes up into the grey like a whip. The Kestrel drops into the willows with eleven hundred pounds too much aboard, and the cutter, light and free, comes round over her, and the long gun has all the time in the world.<br><br>That is not what happened. Vane said: don\'t cut it.<br><br>You are back at the line, with four seconds.'),
    echoLineGo: S('The line'),
    // 7 the willow
    willowTitle: S('The willow'),
    willow: S('The Drift-Kestrel, overloaded, holed, with a grapnel in her rigging and a forty-foot Office cutter tethered above her, put her nose down and went sideways into the crown of a two-hundred-year-old silver willow.'),
    willow2: S('The Kestrel weighed a great deal. That was the whole of Vane\'s plan and the whole of his argument with Pennick for the previous nine days: she was fat, she was slow, she was carrying eleven hundred pounds too much, and a light fast courier-cutter tied to her by forty feet of rope was a terrier tied to a cart-horse.'),
    willow3: S('The willow took the cutter\'s bow.'),
    willow4: S('Vane heard it happen rather than saw it: a long tearing crunch of wet wood and brass, the horn going over the side, the cutter\'s drift-cage shrieking as it tried to climb with its nose full of tree, and then the grapnel-line parting somewhere above with a crack like a whip.'),
    willow5: S('The cutter went into the canopy forty yards to starboard and kept going down through it, shedding pieces, and did not come up.'),
    willow6: S('The Kestrel, relieved of it, rose about eleven feet.'),
    victory: S('"That\'s not a victory," Pennick said from the deck, grey-faced, with a hand clamped around a splinter in his leg. "Captain, I want to be clear, that was not a victory, that was two ships falling and ours is falling slower—"'),
    willowGo: S('And then the boy came'),
    // the courier
    courierTitle: S('The courier'),
    boyS: S('And then the boy came.<br><br>Afterward, nobody on that deck agreed about how long it lasted. Tobiah said four seconds. Sable, who counted things for a living, said closer to two.'),
    boy0: S('And then the boy came.<br><br>Afterward, nobody on that deck agreed about how long it lasted. Tobiah said four seconds.'),
    light: S('There was a sound like a sheet of tin being struck — not loud, but <i>wrong</i>, arriving from the wrong direction — and a smell of hot metal and summer storms, and a line of blue-white light came up the Cloister road underneath them, going the other way, at a speed nothing in the world goes.<br><br>It stopped on the foredeck.'),
    seventeen: S('He was perhaps seventeen. That was the thing Vane kept. He was a boy in a Synod courier\'s leather tabard, and he was made of light the colour of a lightning-strike afterimage, and he was not standing still — he could not stand still; every part of him was moving, vibrating, his edges smearing and reforming so that looking at him was like looking at a struck bell — and in his right hand, clamped so hard the knuckles of it had gone white-blue, was a sealed packet of paper with a black ribbon and the Arbiterium\'s scales in wax.'),
    road: S('"—whereistheroad," he said. "TheOrganumroad. TheTramway. Whichway— <i>which way</i> —"<br><br>Every lamp on the deck went out. The lift-tanks shrieked up an octave.<br><br>"East," said Vane, because it was the only word he had time for.'),
    eastBS: S('"EastEastEast — thankyou — thank you—" The boy\'s head turned, and for a fraction of a second the smearing stopped and there was a face in there, a young, frightened, ordinary face, and his eyes went across the deck: the children at the sail-locker door, the woman screaming in the hold, the press under canvas, Sable. "<i>Don\'t stop,</i>" he said. "Whateveryoudo. Ifyoustop—"'),
    eastB: S('"EastEastEast — thankyou — thank you—" The boy\'s head turned, and for a fraction of a second the smearing stopped and there was a face in there, a young, frightened, ordinary face, and his eyes went across the deck: the children at the sail-locker door, the woman screaming in the hold, the press under canvas. "<i>Don\'t stop,</i>" he said. "Whateveryoudo. Ifyoustop—"'),
    eastS: S('"EastEastEast — thankyou — thank you—" The boy\'s head turned, and for a fraction of a second the smearing stopped and there was a face in there, a young, frightened, ordinary face, and his eyes went across the deck: the children at the sail-locker door, the press under canvas, Sable. "<i>Don\'t stop,</i>" he said. "Whateveryoudo. Ifyoustop—"'),
    east0: S('"EastEastEast — thankyou — thank you—" The boy\'s head turned, and for a fraction of a second the smearing stopped and there was a face in there, a young, frightened, ordinary face, and his eyes went across the deck: the children at the sail-locker door, the press under canvas. "<i>Don\'t stop,</i>" he said. "Whateveryoudo. Ifyoustop—"'),
    gone: S('And he was gone, off the bow, down the road, a blue-white line going east through the willows at a speed that left a crack of thunder behind it and a long scorched stripe along four planks of Vane\'s foredeck in the shape of two running feet.<br><br>The lamps came back. The tanks came down an octave and stayed sour.<br><br>"What," said Pennick, carefully, "was that."'),
    sableCourier: S('"That was a courier," said Sable. She had come up out of the hatch at the noise and was standing at the rail looking east with the Ledger hanging open beside her. "Arbiterium seal, black ribbon. That is a standing writ, which means it must be delivered into a named hand and read aloud and witnessed." She paused. "He has been running since a Velocity flare caught him, which was five years ago, and he has not delivered it."<br><br>"How do you know that?"<br><br>"Because the Office has a file on him," said Sable, "and the file is one line long, and it says: <i>courier Quill, J., in transit.</i>"'),
    courierGo: S('Nine miles north-east'),
    feetLabel: S('A long scorched stripe along four planks of the foredeck, in the shape of two running feet.'),
    // the deep woods
    downTitle: S('The deep woods'),
    down: S('They put her down in the deep woods nine miles north-east, because they had no choice.'),
    tank: S('The second shot from the cutter\'s long gun had not missed. It had gone in through the skirt and clipped the number-three lift-tank, and drift-glass does not explode; it <i>weeps</i>, very slowly, a cobalt vapour that takes the lift with it, and by the fourth mile the Kestrel was flying nose-high and crabbing and Pennick had stopped arguing, which frightened Vane more than the gun had.'),
    clearing: S('They came down in a clearing of silver willows with the keel in the moss and the envelope sagging over them like a tent, four hundred yards from a long black building that had once had a roof.'),
    mausoleum: S('Sable looked at it for a while in the last of the light.<br><br>"The Mausoleum of Chords," she said. "The old Veil-house. Eleven hundred years of records." A pause. "I learned to rule a page in there."<br><br>"Is it dangerous?"<br><br>"Everything here is dangerous, Captain. That one is only sad."'),
    walkBA: S('They got Pennick\'s leg bound and Bettis dosed and the children fed, and Mags went up the envelope with a needle in her teeth and one working arm, and Vane walked his ruined deck in the dark: four feet of rail gone, two scorched footprints, a hole in the deckhouse the size and shape of a man, a cracked knee-strut on a nine-foot automaton that was standing at the bow facing the way they had come, and six feet of cut rope still hanging from the winch drum, which nobody had coiled in six days.'),
    walkB: S('They got Pennick\'s leg bound and Bettis dosed and the children fed, and Mags went up the envelope with a needle in her teeth and one working arm, and Vane walked his ruined deck in the dark: four feet of rail gone, two scorched footprints, and six feet of cut rope still hanging from the winch drum, which nobody had coiled in six days.'),
    walkA: S('They got Pennick\'s leg bound and the children fed, and Mags went up the envelope with a needle in her teeth and one working arm, and Vane walked his ruined deck in the dark: four feet of rail gone, two scorched footprints, a hole in the deckhouse the size and shape of a man, a cracked knee-strut on a nine-foot automaton that was standing at the bow facing the way they had come, and six feet of cut rope still hanging from the winch drum, which nobody had coiled in six days.'),
    walk0: S('They got Pennick\'s leg bound and the children fed, and Mags went up the envelope with a needle in her teeth and one working arm, and Vane walked his ruined deck in the dark: four feet of rail gone, two scorched footprints, and six feet of cut rope still hanging from the winch drum, which nobody had coiled in six days.'),
    stern: S('He stood at the stern for a long time looking back toward the Cloister road.'),
    twentyOneB: S('"Twenty-one," he said, to the dark. He had got into the habit of saying it out loud, lately. "And four hundred and thirty-two. And one screaming."'),
    twentyOne0: S('"Twenty-one," he said, to the dark. He had got into the habit of saying it out loud, lately. "And four hundred and thirty-two."'),
    sleep: S('In the hold beneath him, patiently, four hundred and thirty-two people went on talking in their sleep.'),
    downGo: S('The Deep Woods'),
    jDone: S('An Office cutter hunted us by sound out of the south, by the four hundred and thirty-two murmuring in our own hold. Vane flew the willow-tops at forty feet, would not cut the hook, and put the cutter into the crown of a silver willow. A courier made of light asked the way east. The number-three tank is weeping; we came down nine miles north-east, by the Mausoleum of Chords.'),
    // the end card
    endLine: S('Out of Whisper-Grove an Office cutter hunted the Kestrel by sound. {0} You kept still for ten heartbeats while it went over at three hundred feet, and it came back by the horn anyway. Vane would not cut the hook, and put the cutter into the crown of a silver willow.'),
    endPacked: S('You packed the crates in the hold like glass for a long haul.'),
    endShared: S('You and Hetty packed the crates in the hold like glass for a long haul.'),
    endLeft: S('Hetty packed the crates in the hold like glass for a long haul.'),
    endEcho: S('Once or twice you saw it go another way, and were back where you started.'),
  };
  const BOTH = (b, a, ba, bo, ao, no) => (b ? (a ? ba : bo) : (a ? ao : no));

  // ================================================================ the voices (the book's spoken lines, voices/script.json)
  const VO = {
    load: ['engineer.cutter.lift', 'vane.cutter.fly', 'engineer.cutter.sink', 'vane.cutter.thenfly', 'vane.cutter.water', 'engineer.cutter.drink', 'vane.cutter.breathe'],
    cutter: ['tobiah.cutter.trumpet', 'vane.cutter.nottrumpet', 'vane.cutter.mags', 'vane.cutter.howlow', 'engineer.cutter.low', 'vane.cutter.lower'],
    line: ['tobiah.cutter.line', 'vane.cutter.dontcut', 'tobiah.cutter.what', 'vane.cutter.starboard'],
    willow: ['engineer.cutter.victory'],
    courier: ['quill.cutter.road', 'vane.cutter.east', 'quill.cutter.thanks', 'quill.cutter.dontstop', 'engineer.cutter.what'],
    courierS: ['sable.cutter.courier', 'sable.cutter.running', 'vane.cutter.how', 'sable.cutter.file'],
    downS: ['sable.cutter.mausoleum', 'sable.cutter.rule', 'vane.cutter.dangerous', 'sable.cutter.sad'],
    twentyOneB: ['vane.cutter.twentyone'], twentyOne0: ['vane.cutter.twentyone2'],
  };

  // ================================================================ the deck (js/kestrel16.js) and the hold
  const DECK = 'p16k_kestrel_deck', BELOW = 'p16k_kestrel_below', OX = 16, OY = 14;
  const L = (lx, ly) => [OX + lx, OY + ly];          // ship-local to map
  const AT = {
    you: L(12.0, 4.6), vane: L(3.2, 6.7), pennick: L(6.0, 6.6), tobiah: L(19.6, 3.0), aegis: L(23.5, 5.0), mags: L(10.5, 3.6),
    over: [L(7.8, 7.6), L(16.0, 7.6), L(16.0, 1.6), L(20.5, 1.9)], line: L(13.6, 3.0), proctors: [L(13.0, 2.4), L(14.6, 3.4)], feet: L(24.6, 4.6),
    // the willow-tops close outside the rail (the deck's fog is 9 cells: anything further is lost in the mist)
    willows: [L(2, -1.3), L(8, -1.5), L(14, -1.4), L(20, -1.3), L(25, 0.4), L(29.5, 4.5), L(25, 8.6), L(20, 10.3), L(14, 10.4), L(8, 10.5), L(2, 10.3)],
    cutterShip: L(13.5, -5.5),
    pack: [[22.4, 10.7], [23.9, 10.9], [23.0, 9.1]], hetty: [26.4, 10.6], bettis: [27.2, 10.0], magsBelow: [24.6, 9.9],
  };
  const OVER = [['overWater', 'basin', 0.7], ['overCanvas', 'loot', 0.6], ['overTackle', 'coil', 0.6], ['overChain', 'coil', 0.5]];
  const OVER_SECS = 30, PACK_STEP = 16, TICK = 0.9, QUIET = 1.9, FOUR = 4, FIGHT_SECS = 25, PIN_AT = 12;

  const stage = () => (hasG() && F().c68) | 0;
  const setStage = (n) => { F().c68 = n; };
  const active = () => hasG() && stage() >= 1 && stage() <= 7;
  const aboard = () => active() && stage() >= 2;
  const R = { t: 0, packT: 0, ct: -1, ci: 0, fightT: -1, cutT: -1, pinned: false };
  const bits = (n) => { let c = 0; for (n |= 0; n; n &= n - 1) c++; return c; };
  const packedN = () => bits(F().c68_packed), overN = () => bits(F().c68_over);
  const murmur = () => 1 - 0.22 * packedN();            // the horn's dial: never to nothing ("Your cargo is not silent")
  // how loud you may be through the count: a packed hold leaves your own breath a little more room (a walk, 2.4, is always
  // heard); hurt past NARROW28's fear line your breath is loud whatever you do, so only what you add on top of it counts
  const quiet = () => {
    let afraid = 0;
    try { const p = G.player, B = NARROW28.BAL; if (p.hp > 0 && p.hp < p.hpMax * B.fearAt) afraid = B.fearNoise + 0.5; } catch (e) { /* no fear rule */ }
    return Math.max(QUIET + 0.15 * packedN(), afraid);
  };
  const resetR = () => Object.assign(R, { t: 0, packT: 0, ct: -1, ci: 0, fightT: -1, cutT: -1, pinned: false });
  const bet = () => !!F().bettis_kept_awake, aeg = () => !!F().aegis_follow, sab = () => !!F().sable_joined;

  const keyed = (m, k) => (m && m.entities || []).find((e) => e && e._c68 === k);
  function put(m, k, e) {
    const have = keyed(m, k); if (have) return have;
    e = Object.assign(e, { transient: true, _decor: true, nopick: true, _c68: k });
    m.entities.push(e); return e;
  }
  function drop(m, pred) { if (!m || !Array.isArray(m.entities)) return; for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._c68 && pred(e)) m.entities.splice(i, 1); } }
  const fig = (m, k, sprite, pos, o) => put(m, k, Object.assign({ kind: 'deco', sprite, x: pos[0], y: pos[1], scale: 1.0, solid: true, radius: 0.3, facing: Math.PI / 2 }, o || {}));
  const sprite = (want, alt) => (typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites[want] ? want : alt);

  // ================================================================ staging
  function stageDeck(m) {
    if (!m || m.id !== DECK || !aboard()) return;
    const s = stage(), f = F();
    for (const e of m.entities) if (e && /^(crew_vane|crew_mags|mags_away)$/.test(e._p16k || '')) e.hidden = true;   // kestrel16's crew: the scene has its own
    fig(m, 'vane', 'vane', AT.vane, { facing: 0, use: 'c68_look', label: TX.lookVane, look: TX.lookVaneText });
    fig(m, 'pennick', sprite('p16k_pennick', 'townsman'), AT.pennick, { facing: Math.PI, use: 'c68_look', label: TX.lookPennick, look: TX.lookPennickText });
    fig(m, 'tobiah', 'tobiah', AT.tobiah, { facing: 0, use: 'c68_look', label: TX.lookTobiah, look: TX.lookTobiahText });
    if (aeg()) fig(m, 'aegis', 'aegis', AT.aegis, { facing: Math.PI, scale: 1.25, radius: 0.5, use: 'c68_look', label: TX.lookAegis, look: TX.lookAegisText });
    const mg = fig(m, 'mags', 'mags', AT.mags, { facing: Math.PI / 2 }); mg.hidden = s === 3;
    OVER.forEach(([k, spr, sc], i) => {
      const gone = s > 2 || ((f.c68_over | 0) & (1 << i));
      if (gone) { drop(m, (e) => e._c68 === 'over' + i); return; }
      fig(m, 'over' + i, spr, AT.over[i], { scale: sc, radius: 0.3, solid: false, use: 'c68_over', label: TX[k], _i: i });
    });
    if (s >= 4) AT.willows.forEach((p, i) => fig(m, 'willow' + i, 'willow', p, { scale: 2.2 + (i % 3) * 0.3, solid: false, radius: 0.4 }));
    if (s >= 5 && s <= 6) fig(m, 'cutterShip', 'cutter', AT.cutterShip, { scale: 2.4, solid: false, radius: 1 });
    else drop(m, (e) => e._c68 === 'cutterShip');
    if (s === 6) fig(m, 'line', 'ladder', AT.line, { scale: 1.8, solid: false, radius: 0.15, use: 'c68_line', label: TX.lineLabel });
    else drop(m, (e) => e._c68 === 'line');
    if (s >= 7) fig(m, 'feet', 'footprints', AT.feet, { scale: 0.6, solid: false, radius: 0.2, glow: 0.3, label: TX.feetLabel });
  }
  function stageBelow(m) {
    if (!m || m.id !== BELOW || stage() !== 3) return;
    for (const e of m.entities) if (e && /^(crew_|pim)/.test(e._p16k || '')) e.hidden = true;   // kestrel16's crew below: the chase stages its own
    const b = F().c68_packed | 0;
    AT.pack.forEach((p, i) => fig(m, 'pack' + i, 'loot', p, { scale: 0.45, solid: false, radius: 0.25, use: 'c68_pack', _i: i, label: TX.packLabel, look: TX.packLook }));
    AT.pack.forEach((p, i) => { const e = keyed(m, 'pack' + i); if (e && (b & (1 << i))) { e.use = 'c68_look'; e.look = TX.packedLook; e.scale = 0.65; } });
    fig(m, 'hetty', 'hetty', AT.hetty, { facing: Math.PI, use: 'c68_look', label: TX.lookHetty, look: bet() ? TX.lookHettyB : TX.lookHetty0 });
    if (bet()) fig(m, 'bettis', 'townswoman', AT.bettis, { facing: Math.PI, scale: 0.95, use: 'c68_look', label: TX.lookBettis, look: TX.lookBettis });
    fig(m, 'magsBelow', 'mags', AT.magsBelow, { facing: -Math.PI / 2, use: 'c68_look', label: TX.lookMags, look: TX.lookMags });
  }
  function restage() { if (G.mapId === DECK) stageDeck(G.map); else if (G.mapId === BELOW) stageBelow(G.map); }
  function toDeck() { try { loadMap(DECK, { x: AT.you[0], y: AT.you[1], dir: 0 }); } catch (e) { warnOnce('deck', e); } }

  // ================================================================ 1 · eleven minutes
  const deckReady = () => typeof KESTREL16 !== 'undefined' && !!KESTREL16.cfg && KESTREL16.cfg.on && !!(G.maps && G.maps[DECK]) && KESTREL16.shipExists();
  // called from coda.js startPart4: true when the chase takes the passage
  function start() {
    if (!hasG() || F().part4 || !deckReady()) return false;
    const s = stage(); if (s >= 8) return false;
    try { hide('#event'); hide('#death'); closeModal(); } catch (e) { /* no panel */ }
    G.escapeTimer = 0; G.dead = false;
    resetR();
    if (s === 0) { setStage(1); try { journal('main', TX.jStart); } catch (e) { /* no journal */ } }
    if (stage() === 1) loadCard(); else { toDeck(); resume(); }
    return true;
  }
  function loadCard() {
    card(TX.loadTitle, [TX.load, BOTH(bet(), aeg(), TX.figBA, TX.figB, TX.figA, TX.fig0), TX.lift, aeg() ? TX.flyA : TX.fly0, TX.drink,
      bet() ? TX.bettis : '', bet() ? TX.hettyB : TX.hetty0], [{ t: TX.loadGo, f: () => { setStage(2); toDeck(); say(TX.overHint, 'warn', 8000); } }], VO.load);
  }

  // ================================================================ 2 · over the side
  const OVER_GO = ['overWaterGo', 'overCanvasGo', 'overTackleGo', 'overChainGo'];
  function heave(e) {
    if (stage() !== 2 || !e) return false;
    const i = e._i | 0, f = F();
    if (!((f.c68_over | 0) & (1 << i))) { f.c68_over = (f.c68_over | 0) | (1 << i); say(TX[OVER_GO[i]], '', 3500); try { Audio_.sfx.step('wood'); } catch (err) { /* silent */ } }
    restage();
    if (overN() >= 4) liftOff();
    return true;
  }
  function liftOff() {
    if (stage() !== 2 || F().c68_up) return;
    F().c68_up = true;
    card(TX.sackTitle, [TX.sack], [{ t: TX.sackGo, f: () => cutterCard() }]);
  }
  function cutterCard() {
    card(TX.cutterTitle, [TX.cutter, TX.cls, TX.trumpet, TX.horn, bet() ? TX.holdB : TX.hold0, TX.bell, TX.magsDown, TX.lower],
      [{ t: TX.cutterGo, f: () => { setStage(3); R.packT = 0; restage(); say(TX.packHint, 'warn', 8000); } }], VO.cutter);
  }

  // ================================================================ 3 · pack it like glass
  function pack(e) {
    if (stage() !== 3 || !e) return false;
    const i = e._i | 0, f = F();
    if (!((f.c68_packed | 0) & (1 << i))) { f.c68_packed = (f.c68_packed | 0) | (1 << i); f.c68_mine = (f.c68_mine | 0) | (1 << i); say(TX.packGood, 'good', 4500); }
    restage();
    if (packedN() >= 3) canopyCard();
    return true;
  }
  function tickPack(dt) {
    R.packT += dt;
    if (R.packT < PACK_STEP) return;
    R.packT = 0;
    const f = F(), b = f.c68_packed | 0, i = [0, 1, 2].find((k) => !(b & (1 << k)));
    if (i == null) return;
    f.c68_packed = b | (1 << i); restage();
    if (packedN() >= 3) { say(TX.packCrew, '', 4500); canopyCard(); }
  }
  function canopyCard() {
    if (stage() !== 3) return;
    setStage(4);
    card(TX.canopyTitle, [TX.canopy, TX.canopy2], [{ t: TX.canopyGo, f: () => { if (G.mapId !== DECK) toDeck(); else restage(); startCount(); } }]);
  }

  // ================================================================ 4 · the ten heartbeats
  function startCount() {
    if (stage() !== 4) return;
    R.ct = 0; R.ci = 0;
    try { G.noise = Math.min(Number(G.noise) || 0, 1.4); G.stillT = 0; } catch (e) { /* noise */ }
    say(TX.overhead, 'bad', 5000); say(TX.countHint, 'warn', 6000);
  }
  function tickCount(dt) {
    if (R.ct < 0) return;
    G.stillT = 0;                                       // the hold murmurs: the Hush does not lean in here
    if ((Number(G.noise) || 0) > quiet()) {
      R.ct = -1; F().c68_echo_count = true;
      echo(TX.echoCount, () => { restage(); startCount(); }, TX.echoCountGo);
      return;
    }
    R.ct += dt;
    while (R.ci < 10 && R.ct >= (R.ci + 1) * TICK) { R.ci++; try { Audio_.sfx.step('wood'); } catch (e) { /* silent */ } }
    if (R.ci >= 10) { R.ct = -1; card(TX.backTitle, [TX.back, TX.hive], [{ t: TX.backGo, f: () => gunCard() }]); }
  }

  // ================================================================ 5 · the gun, the hook, the proctors
  function gunCard() {
    setStage(5); restage();
    try { Audio_.sfx.shot(); } catch (e) { /* silent */ }
    card(TX.gunTitle, [TX.gun, TX.grapnel], [{ t: TX.gunGo, f: () => boardedCard() }]);
  }
  function boardedCard() {
    card(TX.gunTitle, [TX.boarded, TX.bit, TX.four, TX.plaza, TX.crouch],
      [aeg() ? { t: TX.aegisGo, f: () => { F().c68_fought = true; card(TX.gunTitle, [TX.aegis, TX.aegis2, TX.aegis3, TX.aegis4, TX.aegis5, TX.aegis6], [{ t: TX.aegisGo, f: () => lineCard() }]); } }
        : { t: TX.fightGo, f: () => startFight() }]);
  }
  const proctors = () => (G.map && G.map.entities || []).filter((e) => e && e._c68 && /^proctor/.test(e._c68));
  function startFight() {
    if (stage() !== 5) return;
    const f = F(); f.c68_fight = true; R.fightT = FIGHT_SECS; R.pinned = false;
    if (G.mapId !== DECK) toDeck();
    drop(G.map, (e) => /^proctor/.test(e._c68));
    if (G.mapId === DECK) AT.proctors.forEach((p, i) => G.map.entities.push(Object.assign(hydrate({ kind: 'enemy', type: 'proctor', x: p[0], y: p[1] }), { transient: true, _c68: 'proctor' + i, state: 'chase', alertT: 10 })));
    say(TX.fightHint, 'bad', 5000);
  }
  function tickFight(dt) {
    if (!F().c68_fight || R.fightT < 0) return;
    R.fightT -= dt;
    const up = proctors().filter((e) => !e.dead && !e.hidden && e.hp > 0);
    if (!R.pinned && up.length && FIGHT_SECS - R.fightT >= PIN_AT) { R.pinned = true; const e = up[0]; e.dead = true; e.hidden = true; e.solid = false; say(TX.magsPin, 'good', 4500); }
    if (!up.length || R.fightT <= 0) endFight();
  }
  function endFight() {
    const f = F(); f.c68_fight = false; f.c68_fought = true; R.fightT = -1;
    for (const e of proctors()) { e.hidden = true; e.dead = true; e.solid = false; }   // the rest go back up the rope
    card(TX.gunTitle, [TX.fightRope], [{ t: TX.aegisGo, f: () => lineCard() }]);
  }
  // dying at the rail is not in the book: an Echo, then the rail again
  function fightDeath() {
    const p = G.player; p.hp = Math.max(1, Math.round(p.hpMax * 0.6)); G.dead = false; R.fightT = -1;
    drop(G.map, (e) => /^proctor/.test(e._c68));
    echo(TX.echoFight, () => startFight(), TX.echoFightGo);
  }

  // ================================================================ 6 · "Don't cut it!"
  function lineCard() {
    setStage(6); R.cutT = -1; restage();
    card(TX.lineTitle, [TX.line, TX.line2, TX.line3], [{ t: TX.lineGo, f: () => { R.cutT = FOUR; restage(); say(TX.lineHint, 'warn', 4000); } }], VO.line);
  }
  function cutLine() {
    if (stage() !== 6 || R.cutT < 0) return false;
    R.cutT = -1; F().c68_echo_cut = true;
    echo(TX.echoLine, () => lineCard(), TX.echoLineGo);
    return true;
  }
  function tickFour(dt) {
    if (R.cutT < 0) return;
    R.cutT -= dt;
    if (R.cutT <= 0) { R.cutT = -1; willowCard(); }
  }

  // ================================================================ 7 · the willow, the courier, the deep woods
  function willowCard() {
    setStage(7); restage();
    try { Audio_.sfx.crack(); } catch (e) { /* silent */ }
    card(TX.willowTitle, [TX.willow, TX.willow2, TX.willow3, TX.willow4, TX.willow5, TX.willow6, TX.victory], [{ t: TX.willowGo, f: () => courierCard() }], VO.willow);
  }
  function courierCard() {
    restage();
    card(TX.courierTitle, [sab() ? TX.boyS : TX.boy0, TX.light, TX.seventeen, TX.road, BOTH(bet(), sab(), TX.eastBS, TX.eastB, TX.eastS, TX.east0), TX.gone, sab() ? TX.sableCourier : ''],
      [{ t: TX.courierGo, f: () => downCard() }], VO.courier.concat(sab() ? VO.courierS : []));
  }
  function downCard() {
    card(TX.downTitle, [TX.down, TX.tank, TX.clearing, sab() ? TX.mausoleum : '', BOTH(bet(), aeg(), TX.walkBA, TX.walkB, TX.walkA, TX.walk0), TX.stern,
      bet() ? TX.twentyOneB : TX.twentyOne0, TX.sleep], [{ t: TX.downGo, f: () => finish() }], (sab() ? VO.downS : []).concat(bet() ? VO.twentyOneB : VO.twentyOne0));
  }
  function finish() {
    if (stage() !== 7) return;
    setStage(8);
    try { journal('main', TX.jDone); } catch (e) { /* no journal */ }
    try { hide('#event'); closeModal(); } catch (e) { /* no panel */ }
    try { part4State(); part4Land(); } catch (e) { warnOnce('land', e); }
  }
  function endLines() {
    if (!hasG() || stage() < 8) return [];
    const f = F(), mine = bits(f.c68_mine), out = [fmt(TX.endLine, mine >= 3 ? TX.endPacked : mine ? TX.endShared : TX.endLeft)];
    if (f.c68_echo_count || f.c68_echo_cut || f.c68_echo_fight) out.push(TX.endEcho);
    return out;
  }

  // ================================================================ the HUD, the tick, the wiring
  function drawOverlay() {
    if (!aboard() || G.state !== 'play') return;
    const ctx = Engine.ctx; if (!ctx) return;
    const s = stage();
    ctx.save(); ctx.font = '8px "Alegreya SC", serif'; ctx.textAlign = 'center';
    const Y = (typeof VIEW_H === 'number' ? VIEW_H : 150) - 30;
    const bar = (y, frac, col) => { ctx.fillStyle = 'rgba(0,0,0,0.45)'; ctx.fillRect(110, y, 100, 5); ctx.fillStyle = col; ctx.fillRect(110, y, Math.max(0, Math.min(100, 100 * frac)), 5); };
    if (s === 2) { ctx.fillStyle = '#d9a441'; ctx.fillText(TX.hudOver + ' · ' + overN() + '/4', 160, Y); bar(Y + 4, R.t / OVER_SECS, '#9aa0b0'); }
    else if (s === 3 || (s === 4 && R.ct >= 0)) { ctx.fillStyle = '#9aa0b0'; ctx.fillText(TX.hudHorn, 160, Y + 10); bar(Y + 12, murmur(), '#ff6a40'); }
    if (s === 4 && R.ct >= 0) { ctx.fillStyle = (Number(G.noise) || 0) > quiet() * 0.8 ? '#ff6a40' : '#d9a441'; ctx.font = '12px "Alegreya SC", serif'; ctx.fillText(TX.hudCount + ' · ' + R.ci, 160, Y - 4); }
    if (s === 6 && R.cutT >= 0) { ctx.fillStyle = '#ff6a40'; ctx.font = '12px "Alegreya SC", serif'; ctx.fillText(TX.hudFour + ' · ' + Math.max(1, Math.ceil(R.cutT)), 160, Y); }
    ctx.restore();
  }
  function tick(dt) {
    if (!hasG() || G.state !== 'play') return;
    const s = stage(); if (s < 2 || s > 7) return;
    try {
      if (G.mapId === DECK && !keyed(G.map, 'vane')) stageDeck(G.map);
      if (G.mapId === BELOW && s === 3 && !keyed(G.map, 'hetty')) stageBelow(G.map);
      if (s === 2) { R.t += dt; if (R.t >= OVER_SECS && overN() < 4) { F().c68_over = 15; restage(); say(TX.overCrew, '', 4000); liftOff(); } }
      else if (s === 3) tickPack(dt);
      else if (s === 4) tickCount(dt);
      else if (s === 5) tickFight(dt);
      else if (s === 6) tickFour(dt);
    } catch (e) { warnOnce('tick' + s, e); }
  }
  function onLoad() {
    if (!hasG() || !aboard()) return;
    restage();
  }
  // a load mid-scene: the beat in hand starts again (cards are not saved)
  function resume() {
    const s = stage();
    if (s === 2 && F().c68_up) cutterCard();
    else if (s === 4) startCount();
    else if (s === 5) { if (F().c68_fought) lineCard(); else if (F().c68_fight) startFight(); else gunCard(); }
    else if (s === 6) lineCard();
    else if (s === 7) willowCard();
  }
  const BLOCK = ['p16k_exit', 'p16k_table', 'p16k_bed'], HINT = { 2: 'overHint', 3: 'packHint', 4: 'countHint', 6: 'lineHint' };
  function useOwn(e) {
    if (!e || !aboard()) return false;
    if (BLOCK.includes(e.use) || (e.use === 'p16k_down' && stage() !== 3)) { const h = HINT[stage()]; if (h) say(TX[h], 'warn', 3000); return true; }
    if (!e._c68) return false;
    if (e.use === 'c68_over') return heave(e);
    if (e.use === 'c68_pack') return pack(e);
    if (e.use === 'c68_line') return cutLine();
    if (e.use === 'c68_look') { say(e.look || e.label || '', '', 6000); return true; }
    return false;
  }
  function wire() {
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(dt); } catch (e) { warnOnce('update', e); } return r; }; }
    if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { drawOverlay(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { onLoad(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof restoreGame === 'function') { const _rg = restoreGame; restoreGame = function () { const r = _rg.apply(this, arguments); try { resetR(); if (aboard() && !deckReady()) { for (const k of Object.keys(F())) if (/^c68/.test(k)) delete F()[k]; } onLoad(); if (aboard()) resume(); } catch (e) { warnOnce('restore', e); } return r; }; }
    if (typeof die === 'function') { const _die = die; die = function () { try { if (stage() === 5 && F().c68_fight && !G.dead && !/^(heartglass|unwrite)$/.test(String(arguments[0])) && !(typeof hardcoreOn === 'function' && hardcoreOn())) { fightDeath(); return undefined; } } catch (e) { warnOnce('die', e); } return _die.apply(this, arguments); }; }
    if (typeof codaEndingLines === 'function') { const _cl = codaEndingLines; codaEndingLines = function () { const r = _cl.apply(this, arguments); try { return endLines().concat(r); } catch (e) { warnOnce('ending', e); return r; } }; }
  }
  try { wire(); } catch (e) { console.warn('cutter68 failed to wire', e); }

  // test and debug entry points: jump to a beat with the deck staged
  const toBoarding = () => { if (stage() < 2) { setStage(2); toDeck(); } gunCard(); };
  const toCount = () => { if (stage() < 2) toDeck(); setStage(4); restage(); startCount(); };

  return { TX, TEXTS, VO, R, AT, murmur, DECK, BELOW, stage, active, aboard, start, heave, pack, startCount, cutLine, finish, endLines, tick, toBoarding, toCount, seq, hush,
    consts: { OVER_SECS, PACK_STEP, TICK, QUIET, FOUR, FIGHT_SECS, PIN_AT } };
})();
if (typeof window !== 'undefined') window.CUTTER68 = CUTTER68;
