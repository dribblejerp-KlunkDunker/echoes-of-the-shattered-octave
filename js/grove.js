// ============================================================
//  PART THREE — THE FORGETTING
//  Whisper-Grove, the Cloister of the Lost Choir, and the Malting.
// ============================================================
'use strict';

// ---------------------------------------------------------------- the passage
function startPart3() {
  const f = G.flags, p = G.player;
  hide('#ending'); hide('#death'); closeModal();
  f.part3 = true; if (f.sable_returned || f.sable_kept) f.sable_aboard = true;
  G.day += 3; G.tod = 0.74; G.escapeTimer = 0; G.boreHold = 0; G.dead = false; G.noise = 2;
  p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = p.fatMax;
  loadMap('whispergrove');
  const L = [];
  L.push('Twenty-one survivors and no room. Lyra has no voice at all. She writes on a slate, and turns it to Kaelen: <b>YOU SAID DO IT.</b> Through the glass he can still hear the Root singing with a hole in it, still holding, and he files the thought.');
  L.push(f.vane_told ? 'In the hold Captain Vane gives his confession, because you made him hear what was in it: thirteen hundred crates in two years, and a file at the Office that calls him reliable.' : 'Captain Vane will not go down into his own hold. On the second night Kaelen makes him say the number aloud, and he does, and then he goes up and changes course.');
  L.push(f.sable_aboard ? 'He sets the course for Whisper-Grove, because the scribe who came up the rope with the Bound Ledger asked him to, in the voice of someone reading a form aloud.' : 'He sets the course for Whisper-Grove, and the scribe the Reach says can read a Hollow its name.');
  if (G.has('charts')) L.push('Kaelen reads Tobiah\'s charts by the binnacle lamp, and the margin of Revision Seven twice. That night he starts a list of names on a deck-beam, and understands that everyone who ever kept one before him was the Catalogue.');
  else L.push('That night Kaelen starts a list of names on a deck-beam, and understands that everyone who ever kept one before him was the Catalogue.');
  L.push('On the third day the Spectral Woods come up out of the mist: silver willows, phosphorescent pools, lilac air. Under them is a marble city that never fell down, sunk a foot under its own lit water. Whisper-Grove, at dusk. The Kestrel holds at mast-height over the south landing and lets down a hundred feet of ladder.');
  showEvent('Part Three — The Forgetting', L.join('<br><br>'), [{ t: 'Climb down into the water.', f: () => {
    journal('main', 'Part Three: The Forgetting. The Kestrel has put down over Whisper-Grove, the drowned capital of the Spectral Woods, where seventy-four thousand people forgot themselves in one night in 416. ' + (f.sable_aboard ? 'Sable came with us. She wants the Office\'s harvest-house on the Cloister road. Talk to her at the landing.' : 'Find the Veil scribe the Reach talks about: she will be in the Sunken Court, north up the causeway, where the names are thickest.'));
    msg('A foot of warm, lit water. The Hollows walk their loops through it, and do not look up.', 'voice', 7000);
  } }]);
}

// ---------------------------------------------------------------- per-frame: the fight in the Sunken Court
function wgTick(dt) {
  const f = G.flags; if (G.mapId !== 'whispergrove' || !f.wg_ambush || f.wg_ambush_over) return;
  f.wg_ambush_t = (f.wg_ambush_t || 0) - dt;
  const amb = G.ents.filter(e => e.ambush);
  // Sable stops a proctor dead by reading him his own surrendered name
  if (!f.sable_aboard && !f.wg_sable_read && f.wg_ambush_t < 31) {
    const t = amb.find(e => !e.dead && !e.hidden);
    if (t) { f.wg_sable_read = true; killEnemy(t, false); msg(`At the fountain Sable stands, opens the Ledger, and reads a proctor his own name — "${t.name || 'Ansel Grey'}" — the one he surrendered when he took the oilcloth. He stops dead in the water, like a man who has walked into a door.`, 'voice', 8000); }
  }
  // Halder Wick walks his loop straight through the middle of it
  if (!f.halder_dead && f.wg_ambush_t <= 0) {
    f.halder_dead = true;
    for (const e of G.ents) if (e.id === 'halder') e.hidden = true;
    msg('Halder Wick walks his loop through the middle of the fight with a plate in each hand, and a felted rod meant for you takes him across the temple. He goes down in the lit water without a sound, still holding the blue plate.', 'bad', 9000);
    journal('side', 'Halder Wick was killed in the Sunken Court, walking his loop through the middle of the proctors\' attack. He was setting a table for four. I was not quick enough.');
  }
  if (amb.length && amb.every(e => e.dead)) {
    f.wg_ambush_over = true; questXp(30);
    if (!f.halder_dead) { f.halder_safe = true; msg('The last proctor goes down in the water. Behind you, untouched, Halder Wick sets the blue plate down at his table, lifts it, and sets it again.', 'good', 7000); }
    journal('main', 'The Office came out of the mist in the Sunken Court: grey oilcloth, silver mesh, hand-presses tuned to 741. ' + (f.sable_aboard ? 'They are dead in the water; a fourth got away north with the Kestrel\'s registry.' : 'Sable read one of them his own surrendered name, and he stopped like a clock. A fourth got away north with the Kestrel\'s registry. I should talk to her again.'));
  }
}

// ---------------------------------------------------------------- triggers
function wgTrigger(t) {
  const f = G.flags, c = Engine.cam;
  if (t.id === 'wg_ambush') {
    if (!t.done) {
      t.done = true; f.wg_ambush = true; f.wg_ambush_t = 40;
      for (const e of G.ents) if (e.ambush && !e.dead) { e.hidden = false; e.state = 'chase'; e.alertT = 8; }
      Audio_.sfx.press(); addNoise(2);
      msg('Out of the mist: grey oilcloth, silver mesh, felted rods. The Office of the Catalogue has come for the scribe, and now for you.', 'bad', 7000);
      setTimeout(() => { if (!f.halder_dead && !f.wg_ambush_over) msg('Halder Wick has started his loop, straight through the middle of it, with a plate in each hand. Be quick.', 'warn', 7000); }, 3500);
    }
    return true;
  }
  if (t.id === 'wearer_porch') {
    if (f.aegis_done && !f.wearer_dead && !f.wearer_porch) {
      f.wearer_porch = true; Audio_.sfx.voice();
      let wx = c.x, wy = c.y;
      for (const [dd, da] of [[3, 0], [2.5, 0.6], [2.5, -0.6], [2, 1.2], [2, -1.2], [1.6, 3.14]]) { const tx = c.x + Math.cos(c.dir + da) * dd, ty = c.y + Math.sin(c.dir + da) * dd; if (!solidAt(tx, ty) && !solidAt(tx + 0.2, ty) && !solidAt(tx, ty + 0.2)) { wx = tx; wy = ty; break; } }
      const e = hydrate({ kind: 'enemy', type: 'wearer', x: wx, y: wy }); e.state = 'chase'; G.ents.push(e);
      msg('At the Cloister porch something comes out of the willows wearing Tobin Ashgrove, and tells you, in Kaelen\'s exact voice, the whole confession: the calibration, line ninety-four, the girl bleeding into her collar on the ninth morning. It only knows what was said aloud in its hearing. Every word of it came out of Kaelen\'s own mouth, alone, in an empty hut.', 'bad', 12000);
    }
    return true;
  }
  if (t.id === 'aegis_wake') { if (!f.aegis_awake && !f.aegis_done) aegisWake(); return true; }
  if (t.id === 'chorister_floor') {
    if (!t.done) { t.done = true; msg('Under the floor, very far down, something is reciting a list. Names. It reaches the bottom of a page and starts the page again. The Chorister of Memory, beneath the Office\'s archive, trying to finish.', 'voice', 9000); }
    return true;
  }
  return false;
}

// ---------------------------------------------------------------- the Aegis Sentinel
function aegisWake() {
  const f = G.flags; f.aegis_awake = true;
  for (const e of G.ents) {
    if (e.kind === 'deco' && e.sprite === 'aegis') e.hidden = true;
    if (e.kind === 'enemy' && e.type === 'aegis' && !e.dead) { e.hidden = false; e.state = 'chase'; e.alertT = 8; }
  }
  Audio_.sfx.press();
  msg('The Aegis stands up out of its alcove. Nine feet. DEFEND THE SINGERS, stencilled. Its torso-plates part, and something inside it begins to hum a chord.', 'bad', 8000);
  setTimeout(() => msg(f.sable_joined ? 'From the doorway, very quietly, Sable says: "The board. Look at the board."' : 'Behind it, on the board by the risers, someone chalked HYMN 9 three years ago and nobody ever rubbed it out.', 'voice', 7000), 3200);
  if (!f.aegis_journal) { f.aegis_journal = true; journal('main', 'The Aegis Sentinel of the Cloister stood up out of its alcove: DEFEND THE SINGERS. It is iron and bell-bronze; blades do little. The hymn board behind the risers still reads HYMN 9.'); }
}
function chordBlast(e) {
  const c = Engine.cam, a = Math.atan2(c.y - e.y, c.x - e.x);
  for (const k of [1.3, 0.9, 0.5]) { const nx = c.x + Math.cos(a) * k, ny = c.y + Math.sin(a) * k; if (!solidAt(nx, ny) && !solidAt(nx + 0.2, ny) && !solidAt(nx, ny + 0.2)) { c.x = nx; c.y = ny; break; } }
  G.hurtT = 0.5; addNoise(1.5); Audio_.sfx.press();
  if (G.player.glassed) { G.glassLock = 4; msg('Its torso opens and a bronze chord puts you on the floor. Your glass arm catches the chord and locks rigid, ringing.', 'bad', 4000); }
  else msg('Its torso opens and a bronze chord puts you on the floor.', 'bad', 3000);
}
function aegisCalm(how) {
  const f = G.flags; f.aegis_calmed = true; f.aegis_done = true; f.aegis_how = how;
  for (const e of G.ents) {
    if (e.kind === 'enemy' && e.type === 'aegis') { e.hidden = true; e.state = 'passive'; e.solid = false; }
    if (e.id === 'aegis_wg') e.hidden = false;
  }
  [587, 659, 698, 784, 698, 659, 587].forEach((hz, i) => setTimeout(() => Audio_.sfx.song(hz, 0.5), i * 420));
  questXp(100);
  const how_t = how === 'sable' ? 'You point at the board. Sable, who stood in that doorway counting children while they sang it, has to sing Hymn 9, and she does, in a thin dry voice that has not sung in three years.' : 'You sing Hymn 9 off the board, badly, all four lines, in a voice that carries.';
  msg(how_t + ' The Aegis stops. It kneels. Out of its open chest comes the alto line.', 'good', 10000);
  journal('main', (how === 'sable' ? 'Sable sang Hymn 9 off the board' : 'I sang Hymn 9 off the board') + ', and the Aegis Sentinel knelt by the empty risers and chimed the alto line. Now: the Malting, the Office\'s harvest-house on the Cloister road, north-east of the Cloister. Take a press.');
  if (how === 'you') addNoise(3);
}
function aegisDestroyed(e) {
  const f = G.flags; f.aegis_destroyed = true; f.aegis_done = true;
  G.ledger.push({ name: 'WG-41,005, a boy of the Cloister choir', where: G.map.name, day: G.day });
  for (const o of G.ents) if (o.item === 'redcloak' && !o.dead) o.hidden = false;
  setTimeout(() => msg('As the bronze goes still a boy\'s voice inside it says a number, three times: "Forty-one thousand and five." Then nothing. Its hand has fallen from the eleventh peg.', 'voice', 9000), 1500);
  journal('main', 'I destroyed the Aegis Sentinel. Inside it a boy said his intake number three times. The Malting, the Office\'s harvest-house, is on the Cloister road, north-east of the Cloister. Take a press.');
}

// ---------------------------------------------------------------- things you can use
const POOLS = [
  'A woman\'s hands kneading dough in a kitchen with a blue door. She is humming. There is flour on a small child\'s nose, and she leans down and blows it off. You do not know her. For the length of a breath you miss her more than anyone you have ever lost.',
  'A man on the steps of this court, in the year 416, waiting for someone who is late, checking a pocket-watch. Then a single long note, everywhere at once. He forgets what he was waiting for. He goes on waiting. He is waiting still; you passed him on the way in.',
  'A boy in a grey choir cloak, singing Hymn 9 off the board and looking sideways at the girl in red beside him, who has the alto line and is getting it wrong on purpose to make him laugh. In the doorway a young woman in a Veil coat is counting them. Eleven.',
];
const POOL_SABLE = 'Cold stone, ink, beeswax and old vellum: the smell of the Veil\'s scriptorium at the hour before matins, and the scratch of forty nibs. It is not your memory. It is not anyone\'s any longer. It is floating here because a woman paid it out of herself to give a pump-man his name.';
const POOL_QUIST = 'Rows of desks under a high window. A girl of fourteen in a Veil coat, ruling a page, and a tall clerk standing over her: "Again. Straighter. A crooked line is a lie about the next one." She does it again. It is very straight.';
function wgUse(e) {
  const f = G.flags, p = G.player;
  if (e.use === 'fountain') { msg(f.sable_joined || f.sable_aboard ? 'The fountain of the Sunken Court, brimming with lit water. Sable read twenty names a night here, for nobody.' : 'The fountain of the Sunken Court, brimming with lit water. Somebody has worn a seat in its rim.', '', 5000); return true; }
  if (e.use === 'pool') {
    const i = e.pool, txt = i === 3 ? (f.sable_returned ? POOL_SABLE : POOL_QUIST) : POOLS[i];
    f['pool_' + i] = true;
    showEvent('A reflecting pool', 'You lean over the water. The light in it moves, and is not your face.<br><br>' + txt, [{ t: 'Step back from the water.', f: () => {
      if (!f.pools_all && [0, 1, 2, 3].every(k => f['pool_' + k])) { f.pools_all = true; questXp(40); journal('side', 'I have looked into all four reflecting pools of the Sunken Court and carried four strangers\' memories out of them' + (f.sable_returned ? '. One of them, I am nearly sure, was Sable\'s.' : '.')); msg('Four strangers\' memories. You will carry them now, since nobody else can.', 'good', 5000); }
    } }]);
    return true;
  }
  if (e.use === 'hymn') {
    if (f.aegis_done) { msg(f.aegis_calmed ? 'HYMN 9. When you touch the board the Aegis chimes the alto line, softly, from the risers.' : 'HYMN 9, still chalked. Nobody will sing it here again.', '', 5000); return true; }
    if (!f.aegis_awake) { f.hymn_read = true; msg('HYMN 9, chalked on the board in a grown-up hand, with a child\'s careful 9 underneath. Nobody has rubbed it out in three years.', '', 6000); return true; }
    const ch = [];
    if (f.sable_joined) ch.push({ t: 'Point at the board. Make Sable sing it.', f: () => aegisCalm('sable') });
    if (p.voice >= 10) ch.push({ t: 'Sing Hymn 9 yourself, off the board. (10 voice; it will carry)', f: () => { p.voice -= 10; aegisCalm('you'); } });
    else ch.push({ t: 'Try to sing it.', f: () => msg('You open your mouth and nothing comes but breath. Your voice is spent. The bronze chord comes instead.', 'bad', 5000) });
    ch.push({ t: 'Not now.', f: null });
    showEvent('HYMN 9', 'The Aegis is between you and the risers with its chest-plates open and a chord building in it. The board is still chalked HYMN 9: four lines, a children\'s tune, the one they were singing when the Anchor went quiet. Something like that does not forget the last thing it was told to guard. It might remember what it was guarding them <i>for</i>.', ch);
    return true;
  }
  if (e.use === 'cloaks') {
    if (!f.cloak_names) {
      f.cloak_names = true; CLOISTER_NAMES.forEach(n => G.ledger.push({ name: n, where: 'the Cloister of the Lost Choir', day: G.day })); questXp(40);
      showEvent('Eleven small cloaks', 'You take the cloaks down off the pegs one at a time. Undyed grey wool, a child\'s size, and in every collar a name-tape stitched in red thread by somebody\'s mother: <i>' + CLOISTER_NAMES.join(', ') + '.</i> Ten names, eleven pegs. The eleventh cloak is red, and has no tape, and hangs on the peg nearest the alcove. There is one shoe on the floor, and you leave it where it is.', [{ t: 'Write the ten names in your ledger.', f: () => { msg('Ten names, in the ledger. The eleventh peg, you leave.', 'good', 4000); journal('side', 'I took the name-tapes from ten children\'s choir cloaks in the Cloister of the Lost Choir and wrote them in my ledger. Eleven pegs; the eleventh cloak is red and has no name in it.'); } }]);
    } else msg('Eleven pegs, ten empty collars, one shoe on the floor.', '', 4000);
    return true;
  }
  if (e.use === 'reg_sign') { showEvent('WELCOME TO RELIEF', 'A printed pamphlet, in a very straight hand someone has had set in type: <i>You have walked a long way. Sit down; the bench is clean. There is water in the butt and a cup on the chain. A clerk will call your name. When he does, give him your coat at the door — you will not need it where you are going — and he will ask you three short questions. Most people find it a great relief.</i><br><br>At the bottom, very small: <i>Prepared for the Office by S., Veil Archives, 415.</i>', [{ t: 'Put it back on its pin.', f: null }]); return true; }
  if (e.use === 'press') { wgPress(e); return true; }
  if (e.use === 'wg_ladder') { wgLadder(); return true; }
  return false;
}
function wgPress(e) {
  const f = G.flags;
  if (G.ents.some(o => o.kind === 'enemy' && o.room === 'press' && !o.dead)) { msg('Two proctors stand between you and the press, felted rods up. They are not going to let you look at it.', 'warn', 4500); return; }
  showEvent('An Office hand-press', 'Forty pounds of iron and brass on a bolted bench: a screw-wheel, a felted die, a dial that reads in Hertz with the needle parked at 741. A pad on the bench is worn to the shape of the back of a head. Ninety seconds. Three questions. Eight seconds of seven forty-one.', [
    { t: 'Unbolt it and take it.', f: () => {
      f.press_taken = true; G.give('press741'); e.hidden = true; questXp(80); Audio_.sfx.pickup();
      journal('main', 'I have an Office hand-press, tuned to 741, out of the Malting. Now back to the Kestrel\'s mast-ladder at the south landing of Whisper-Grove.');
      f.malting_alarm = true;
      for (const o of G.ents) if (o.requires === 'malting_alarm' && !o.dead) { o.hidden = false; o.state = 'chase'; o.alertT = 8; }
      msg('You get the press off its bolts and onto your back. Somewhere in the clerks\' hall a bell rings: a real bell, the first you have heard since the Reach. The reserve is coming.', 'bad', 7000);
      Audio_.sfx.bellDie();
    } },
    { t: 'Leave it for now.', f: null },
  ]);
}
function wgLadder() {
  const f = G.flags;
  if (!f.press_taken) { msg(f.wg_plan ? 'Vane leans over the rail a hundred feet up: "Not without the press! The Malting, on the Cloister road!"' : 'Vane leans over the rail a hundred feet up: "Not yet! Find the scribe!"', 'warn', 5000); return; }
  const left = [];
  if (!f.aegis_done) left.push('the Aegis still stands in the Cloister');
  if (!f.bettis_awake && G.maps.malting) left.push('the Hollow on the bench in the Malting is still saying "name, please"');
  if (!f.lamps_lit) left.push('the lamps of the Sunken Court are still dry');
  if (!G.has('folder') && !f.folder_given) left.push('something in the Malting\'s Tuning Room has not been read');
  showEvent('The mast-ladder', 'A hundred feet of rope up into the lilac mist, and the Kestrel\'s keel above it, lift-tanks murmuring. Vane is shouting something about weight.' + (left.length ? '<br><br>Behind you, ' + left.join('; ') + '.' : '') + '<br><br><span class="muted">Climbing ends Book One.</span>', [
    { t: 'Climb. Tell Vane to cut the line.', f: () => bookOneEnd() },
    { t: 'Not yet.', f: null },
  ]);
}

// ---------------------------------------------------------------- people who are not quite people
function talkCat() {
  const L = ['The cat looks at you, and then at the water, and decides the water is more interesting.', 'The cat does not care.', 'The cat permits you to scratch behind its ears, for exactly as long as it permits it, and not one breath longer.', 'The cat is not a Hollow. It remembers everything that happened here, and none of it impressed it.', 'The cat yawns at the Office of the Catalogue.'];
  G.flags.cat_met = true; msg(L[rndi(0, L.length - 1)], '', 4500);
}
function talkLamplighter(e) {
  const f = G.flags;
  if (f.lamps_lit) { msg('The lamplighter stands under the last lamp with his pole raised, and looks at the flame, and does not light it again.', 'voice', 6000); return; }
  if (!G.has('oil')) {
    msg('A Hollow with a long brass pole lights a lamp that has no oil in it. The wick takes for a moment and goes out. He moves to the next. "...the lamps are late tonight..."', 'voice', 7000);
    if (!f.lamp_met) { f.lamp_met = true; journal('side', 'A Hollow lamplighter in the Sunken Court lights the dry lamps over and over. They have had no oil for three years. If I found some, somewhere in the city...'); }
    return;
  }
  showEvent('The lamplighter', 'He reaches the next dry lamp and raises his pole, the way he has a thousand times. You have a flask of oil from the Cloister vestry.', [
    { t: 'Fill the lamps for him, one by one, ahead of his pole.', f: () => {
      G.take('oil'); f.lamps_lit = true; questXp(60);
      for (const o of G.ents) if (o.drylamp) o.glow = 0.65;
      msg('You go round the ring of the court ahead of him, filling each lamp. Behind you, one after another, they take. For the first time in three years the Sunken Court is lit, and two hundred Hollows walk their loops through their own reflections.', 'good', 9000);
      journal('side', 'I filled the dry lamps of the Sunken Court with oil from the Cloister vestry, and the lamplighter lit them. He stood under the last one afterward and did not light it again.');
    } },
    { t: 'Leave him to it.', f: null },
  ]);
}
function talkBettis(e) {
  const f = G.flags;
  if (f.bettis_put_back) { msg('"...name, please... name, please..." He is very peaceful about it.', 'voice', 5000); return; }
  if (f.bettis_kept_awake) { msg('Bettis Renn sits on his bench by the press with his face in his hands, remembering. Every so often he says a date.', 'voice', 6000); return; }
  if (!f.sable_joined) { msg('A Hollow on a bench by the press, his hands on his knees, says "...name, please... name, please..." in somebody else\'s intonation. The tag on his wrist reads BETTIS RENN — PRESSED TWICE.', 'voice', 7000); return; }
  const fr = sableFragments(G);
  showEvent('A Hollow on the bench', `A man of about forty sits by the press with his hands on his knees, saying "...name, please... name, please..." in the Registrar's own intonation. The tag on his wrist reads BETTIS RENN — PRESSED TWICE. Sable looks at it for a long time. "Second pressing," she says. "They did it to find out whether I had spoken to him. I had." She has ${fr} fragment${fr === 1 ? '' : 's'} left. "I can reverse it," she says. "Nobody in the Office ever has. Nobody ever put one back."`, [
    { t: 'Ask her to reverse it. (It will cost her a fragment.)', f: () => {
      f.bettis_awake = true; e.name = 'Bettis Renn'; questXp(60);
      showEvent('Bettis Renn', 'She kneels by the bench and reads the name to him out of the Ledger, and something leaves her that she will never be able to identify. Bettis Renn looks up. And you learn what the Office never learned, because the Office never put one back: <b>the Hollow was awake the whole time.</b> He remembers all three years. Every loop. Every "name, please." He takes your sleeve in both hands. "Put me back," he says. "Please. You have a press. Put me back."', [
        { t: 'Put him back.', f: () => { f.bettis_put_back = true; e.name = 'A Hollow on the bench'; journal('side', 'Sable reversed Bettis Renn\'s pressing in the Malting, and it cost her a fragment. He had been awake the whole time, for three years, and he begged to be put back. I put him back.'); msg('Ninety seconds. Three questions. Eight seconds of seven forty-one. He looks relieved at six. Sable writes it down.', 'voice', 8000); } },
        { t: '"No. I am sorry. Sit with me until it passes."', f: () => { f.bettis_kept_awake = true; journal('side', 'Sable reversed Bettis Renn\'s pressing in the Malting, and it cost her a fragment. He had been awake the whole time, for three years, and he begged to be put back. I would not do it.'); msg('You sit with him on the clean bench. It does not pass. After a while he stops asking, which is not the same thing.', 'bad', 8000); } },
      ]);
    } },
    { t: 'Leave him on his bench.', f: null },
  ]);
}

// ---------------------------------------------------------------- papers
function wgPickUp(e) {
  const f = G.flags;
  if (e.item === 'oil' && f.lamp_met) msg('Lamp-oil, still good. Somebody in the Sunken Court has been lighting dry lamps for three years.', 'warn', 5000);
  if (e.item === 'returns') journal('side', 'In the Malting\'s Tuning Room: Kaelen\'s own calibration returns from the Dawning, with his initials against line ninety-four. The Office keeps everything, including the Consortium\'s cross-files.');
  if (e.item === 'redcloak') msg('A child\'s red choir cloak. There is no name-tape in the collar. You fold it, the way you would fold something for someone.', 'voice', 6000);
  if (e.item === 'folder') {
    journal('main', 'Under Kaelen\'s returns in the Tuning Room: a grey Arbiterium folder dated eight months before the Fracture. "The object of Stage 9 is not extraction. An Anchor will yield without limit if it believes it has been relieved." And a note: Engineer V. is not to be told, because his ear is more accurate when his conscience is not engaged.');
    showEvent('The grey folder', 'Arbiterium grey, dated eight months before the Fracture. <i>The object of Stage 9 is not extraction. An Anchor will yield without limit if it believes it has been relieved.</i> And, in a different hand: <i>Engineer V. is not to be told. His ear is more accurate when his conscience is not engaged.</i>' + (G.player.glassed ? '<br><br>Then, very close, out of the glass in your own arm, a voice that is not yours: <i>"Two pieces of one Spire are one thing in two places. I keep a list too."</i> And nothing more.' : ''), [{ t: 'Put it in your shirt.', f: null }]);
  }
}

// ---------------------------------------------------------------- the end of Book One
function bookOneEnd() {
  if (G.state === 'ending') return;
  G.state = 'ending'; G.runs = (G.runs || 0) + 1; G.flags.book_one_done = true; hide('#event'); hide('#death'); closeModal();
  const f = G.flags, p = G.player, names = G.ledger.length, fr = sableFragments(G);
  const L = [];
  L.push(`Eleven hundred pounds overloaded: a press, an archivist${f.aegis_follow ? ', and a nine-foot automaton coming up the mast-ladder with a red cloak held to its chest' : ''}. An Office cutter comes out of the mist hunting by sound, a listening horn on its bow and four hundred and thirty-two voices in its hold. Vane flies the canopy at forty feet${f.aegis_follow ? ', lets the proctors board, and the Aegis answers them the only way its stencil allows' : ', takes a grapnel, and will not cut the line'}. Then he puts the willow-crown through the cutter's bow.`);
  L.push('Mid-chase a boy of seventeen, made of lightning, crosses the foredeck with an undelivered writ clamped in his fist, asks the way east, and is gone, leaving two scorched footprints and two words: <i>if you stop.</i> A holed lift-tank puts you down in the deep woods by the Mausoleum of Chords.');
  if (f.aegis_calmed && f.aegis_follow) L.push('Sable tells the Aegis what she knows and cannot read, and promises to find his name in the Organum, and it gives her the red cloak.');
  else if (f.aegis_calmed) L.push('In the Cloister of the Lost Choir an automaton kneels by eleven empty pegs, chiming the alto line of Hymn 9 to nobody. You left it with its risers. Sable does not ask you why.');
  else if (f.aegis_destroyed) L.push(`WG-41,005 is in your ledger: the boy inside the Aegis, who said his number three times as the bronze went still. ${G.has('redcloak') ? 'The red cloak is folded in your pack. You have not decided whose it is.' : 'The red cloak is still on its peg.'}`);
  else L.push('The Aegis still stands in its alcove in the Cloister, guarding eleven empty places. Nobody sang to it.');
  if (f.cloak_names) L.push(`Ten children of the Cloister choir are in your ledger by the name-tapes in their collars: ${CLOISTER_NAMES.slice(0, 2).join(', ')}, and eight more. The eleventh peg had no tape.`);
  if (f.bettis_put_back) L.push('Bettis Renn remembered all three years and begged to be put back, and you put him back. Sable paid a fragment for that, and she will never be able to say which one.');
  else if (f.bettis_kept_awake) L.push('Bettis Renn is awake on a clean bench in the Malting, remembering three years of being walked in a loop. He begged to be put back. You would not. You are not sure, either way, who that was for.');
  else L.push('On a bench in the Malting a Hollow is still saying "name, please" in somebody else\'s voice.');
  if (f.folder_given) L.push('Kaelen tells Lyra everything out loud, including the grey folder, and that his first feeling on reading it was relief, and that he decided he was not entitled to it. Her voice comes back at the worst possible moment, and the first thing she does with it is tell him she would have forgiven him on Rootday, and cannot now.');
  else if (G.has('folder')) L.push('The grey Arbiterium folder is in your shirt. <i>Engineer V. is not to be told.</i> He has not been told. That is your decision now, and it weighs exactly as much as paper.');
  if (G.has('returns')) L.push('Kaelen\'s calibration returns travel in the hold beside the press. The only record that he ever tried to stop it is the Inquisitor\'s charge against him.');
  if (f.halder_dead) L.push('Halder Wick was killed walking his loop through the middle of the fight in the Sunken Court, with the blue plate in his hand.');
  else if (f.halder_safe) L.push(`Halder Wick is still setting his table for four in the Sunken Court. The proctors never reached him.${f.halder_sat ? ' The blue plate is in front of the fourth chair, where you sat.' : ''}`);
  if (f.lamps_lit) L.push('In the Sunken Court the lamps are lit for the first time in three years, and the lamplighter stands under the last of them with his pole, and does not light it again.');
  if (f.pools_all) L.push(`You looked into all four reflecting pools and carried four strangers' memories out of Whisper-Grove${f.sable_returned ? '. One of them, you are nearly sure, was Sable\'s' : ''}.`);
  if (f.wearer_porch_dead) L.push('At the Cloister porch the thing that wore Tobin Ashgrove told you Kaelen\'s whole confession in his own voice, and you burst it. Everything it ever ate came out at once, ending with Tobin getting louder as they took him, so the house would be further away.');
  L.push(`Sable has ${fr} fragment${fr === 1 ? '' : 's'} left. She recites ${fr === 1 ? 'it' : 'them'} nightly, so that she will know which one goes. The missing ones do not feel like gaps, she says. They feel like shelves.`);
  if (p.glassed) L.push(`Your tideline is ${p.glass >= 70 ? 'past the collarbone, three inches from the throat' : 'four and a half fingers from the shoulder'}. ${p.glass >= 70 ? 'Six weeks, at the current rate.' : 'Eight weeks of slack, perhaps.'}`);
  L.push('A herald walks nine miles alone to read the writ aloud, because the form requires it: all of you declared Dissonant, the Dread Arbiter nine days out on the Tramway, and grace offered once. Lyra answers him herself. <i>Tell him the Cantor says we heard the question too.</i> The ship needs a whole lift-tank, and there is one coast where you can get one.');
  L.push(`Kaelen adds the names to the beam${names ? `, all ${names} of yours among them` : ''}, and under them he writes: <i>Not yet.</i>`);
  L.push(`<span class="muted">Here ends Book One: The Silenced Province. ${G.runs > 1 ? 'The Tide-Weaver has watched this thread before. "It is still kind," he says.' : 'The Tide-Weaver has watched this thread before. He does not say so.'}</span>`);
  $('#ending-title').textContent = 'Not Yet';
  $('#ending-text').innerHTML = L.map(l => `<p>${l}</p>`).join('');
  $('#btn-part3').classList.add('hidden');
  show('#ending'); Audio_.setScene('inside');
}
