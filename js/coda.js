// ============================================================
//  PART FOUR — CODA
//  Ten Heartbeats, the Deep Woods, the ring of lamps (Book One ch. 23), the Mausoleum of Chords, and the herald.
// ============================================================
'use strict';

// which "Where is…" list applies, and which map it is measured from
function placeSet() {
  const f = G.flags;
  if (f.part4) return { list: PLACES_DW, hub: 'deepwoods', name: 'the Deep Woods' };
  if (f.part3) return { list: PLACES_WG, hub: 'whispergrove', name: 'Whisper-Grove' };
  return null;
}

// ---------------------------------------------------------------- the passage: Ten Heartbeats
function startPart4() {
  const f = G.flags;
  if (f.part4) return;
  if (typeof CUTTER68 !== 'undefined' && CUTTER68.start()) return;   // Ten Heartbeats, played on the deck (js/cutter68.js); this card is the fallback
  hide('#event'); hide('#death'); closeModal();
  part4State();
  const L = [];
  L.push(`Eleven hundred pounds overloaded: a press, an archivist${f.sable_with ? '' : ' the Reach will not name'}, twenty-one survivors${f.aegis_follow ? ', and a nine-foot automaton coming up the mast-ladder with a red cloak held to its chest' : ''}. The Kestrel lifts off the water of Whisper-Grove like a cart going uphill.`);
  L.push('An hour out, an Office cutter comes out of the mist behind you, hunting by sound: a brass listening-horn on the bow, grey canopy, OC-742 on the hull. A courier-cutter: four hard little tanks and no envelope, too light to carry anything but paper and proctors. She does not need to see you. The Kestrel\'s own hold has four hundred and thirty-two people murmuring in it. Hetty packs blankets round every crate, and Vane flies the canopy at forty feet. The cutter puts a grapnel into the Kestrel\'s rail, and the line goes taut, and Vane\'s hand goes to the boarding axe.');
  L.push('<i>In 414 a tonal trench opened under the Wave-Cutter\'s tow, and he held the axe for ten heartbeats, looking at his first mate through the spray, before he cut the hawser. Forty-eight men.</i>');
  showEvent('Part Four — Coda: Ten Heartbeats', L.join('<br><br>'), [
    { t: 'Say nothing. Let him count.', f: () => part4Chase(false) },
    { t: '"Cut it, Vane."', f: () => part4Chase(true) },
  ]);
}
// the passage's state: Part Four begins (shared with js/cutter68.js, which plays the chase and then lands here)
function part4State() {
  const f = G.flags;
  f.part4 = true; f.sable_with = !!f.sable_joined;
  if (f.folder_given) f.lyra_voice = true;   // Kaelen already told her everything, back in the Malting
  G.day += 1; G.tod = 0.8; G.escapeTimer = 0; G.dead = false;
}
function part4Chase(toldCut) {
  const f = G.flags; f.vane_told_cut = toldCut;
  const L = [];
  L.push(toldCut ? 'He looks at you, and then at the line, and does not cut it. "Not this time," he says. "I counted last time. I\'m not counting again."' : 'You count with him. One. Two. At seven he takes his hand off the axe.');
  L.push(`He lets the proctors board${f.aegis_follow ? ', and the Aegis answers the only way its stencil allows: DEFEND THE SINGERS. The rail comes away with them on it' : ', and Mags meets them at the rail one-handed with a belaying pin'}. Then he puts the helm over and drives the Kestrel's willow-crown straight through the cutter's bow.`);
  L.push('Mid-chase a boy of seventeen, made of lightning, crosses the foredeck with an undelivered writ clamped in his fist. "Which way is east?" he asks, and Lyra points, and he is gone, leaving two scorched footprints in the deck and two words: <i>if you stop.</i>');
  L.push('Then the number-three lift-tank, holed. The Kestrel goes down through a hundred feet of silver willow, and the cutter goes down a mile to the east of her, and the woods close over both.');
  showEvent('Ten Heartbeats', L.join('<br><br>'), [{ t: 'Brace.', f: () => part4Land() }]);
}
function part4Land() {
  const p = G.player;
  p.hp = Math.max(1, Math.round(p.hpMax * 0.7)); p.voice = p.voiceMax; p.fat = p.fatMax;
  loadMap('deepwoods'); G.state = 'play'; G.noise = 1;
  journal('main', 'Part Four: Coda. The Kestrel came down in the Deep Woods of the Spectral Woods, by the Mausoleum of Chords, with her number-three lift-tank holed. The Office cutter that hunted us came down a mile to the east. Talk to Vane, and to Lyra, at the fire.');
  msg('You come to on the moss with the taste of lift-gas in your mouth. Silver willows, lilac mist, and somewhere north of the wreck a building made to be listened to, ringing very faintly.', 'voice', 9000);
  setTimeout(() => { if (G.mapId === 'deepwoods') msg('By the fire: Vane, Tobiah, Mags with her arm in a sling, Kaelen, and Lyra, who is listening north with her whole body.', '', 7000); }, 5000);
}

// ---------------------------------------------------------------- per-frame
function codaTick(dt) {
  const f = G.flags;
  if (f.part4 && G.mapId === 'deepwoods') { codaMourners(dt); ringTick(dt); }
  if (!f.part4 || !f.coda_fight || f.coda_sung || f.requiem_done) return;
  if (G.mapId !== 'mausoleum') return;
  f.coda_t = (f.coda_t || 0) - dt;
  const left = Math.ceil(f.coda_t);
  if (left > 0 && left % 10 === 0 && f.coda_said !== left) {
    f.coda_said = left;
    msg(`Lyra sings. ${left} more bars. It is singing with her, a third above, in harmony, and nothing you do touches it. Keep it off her.`, 'voice', 4500);
  }
  if (f.coda_t <= 0) {
    f.coda_sung = true;
    for (const e of G.ents) if (e.kind === 'enemy' && e.def && e.def.coda && !e.dead) { e.slowed = true; e.state = 'chase'; }
    codaClose();
    msg('Eight bars, in harmony with the thing that ate him. Then Lyra sings the two-voice coda alone, both lines, and it has nothing to answer with. It can be hurt now.', 'good', 9000);
  }
}

// the close of the office: "the long low close that goes under the floor" (MS 6044). One long low note, falling slowly;
// no melody (Phase 125b: it was a bright rising six-note phrase)
function codaClose() {
  try { Audio_.sfx.song(138, 3.2); setTimeout(() => { try { Audio_.sfx.song(116, 3.6); } catch (e) { /* silent */ } }, 2400); setTimeout(() => { try { Audio_.sfx.song(98, 4.4); } catch (e) { /* silent */ } }, 5200); } catch (e) { /* silent */ }
}

// ---------------------------------------------------------------- enemy behaviour (called from enemyExtra and enemyHitFx)
function codaExtra(e, dt, dist, canSee) {
  const d = e.def, c = Engine.cam, p = G.player;
  if (d.horn) {
    e.hornT = (e.hornT == null ? 0.5 : e.hornT) - dt;
    if (e.hornT <= 0) {
      e.hornT = 5;
      let n = 0;
      for (const o of G.ents) if (o.kind === 'enemy' && !o.dead && !o.hidden && o !== e && !o.def.cacophony && dist2(o.x, o.y, e.x, e.y) < 260) { if (o.state !== 'chase') n++; o.state = 'chase'; o.alertT = 10; o.guard = false; }
      Audio_.sfx.press(); addNoise(1);
      msg(n ? 'The listening-horn swings round to face you, and a dial on its tripod jumps. Every grey coat on the cutter turns your way.' : 'The listening-horn swings to follow you, ticking.', 'bad', 3500);
    }
  }
  if (d.grapnel && canSee && dist > 2.6 && dist < 7.5) {
    e.hookT = (e.hookT == null ? rnd(1.5, 4) : e.hookT) - dt;
    if (e.hookT <= 0) {
      e.hookT = rnd(6, 9);
      const a = Math.atan2(e.y - c.y, e.x - c.x);
      for (const k of [1.6, 1.1, 0.6]) { const nx = c.x + Math.cos(a) * k, ny = c.y + Math.sin(a) * k; if (!solidAt(nx, ny) && !solidAt(nx + 0.2, ny) && !solidAt(nx, ny + 0.2)) { c.x = nx; c.y = ny; break; } }
      damagePlayer(2, `${theName(d.name, true)}'s grapnel`); G.hurtT = 0.35;
      msg(`A grapnel line hisses out of the mist and bites into your coat. ${theName(d.name, true)} reels you in.`, 'bad', 3000);
    }
  }
  if (d.dirge && dist < 3.2 && !G.dead) {
    p.voice = Math.max(0, p.voice - dt * 2.4);
    e.dirgeT = (e.dirgeT || 0) - dt;
    if (e.dirgeT <= 0) { e.dirgeT = 9; msg('The Dirge sings a funeral office over you, and your voice runs out of you into the mourning.', 'warn', 3500); }
  }
}
function codaHitFx(e, d) {
  if (d.toll && Math.random() < 0.4) {
    const c = Engine.cam, a = Math.atan2(c.y - e.y, c.x - e.x);
    for (const k of [1.2, 0.8, 0.4]) { const nx = c.x + Math.cos(a) * k, ny = c.y + Math.sin(a) * k; if (!solidAt(nx, ny) && !solidAt(nx + 0.2, ny) && !solidAt(nx, ny + 0.2)) { c.x = nx; c.y = ny; break; } }
    G.hurtT = 0.45; addNoise(1.5); Audio_.sfx.bell();
    if (G.player.glassed) { G.glassLock = 3; msg('The Chord-Warden\'s marble mouth opens on a funeral bell. Your glass arm catches the note and locks rigid.', 'bad', 3500); }
    else msg('The Chord-Warden\'s marble mouth opens on a funeral bell, and it knocks you back a stride.', 'bad', 3000);
  }
}
// damage taken by a coda boss: nothing until the coda is sung
function codaShield(e, dmg) {
  if (e.ring) return ringShield(e, dmg);
  if (G.flags.coda_sung) return dmg;
  if (!e.shieldMsgT || performance.now() - e.shieldMsgT > 4000) { e.shieldMsgT = performance.now(); msg('It is singing in harmony with Lyra. Your blow goes through it like a hand through a voice. Keep it busy.', 'warn', 3000); }
  return 0;
}
function codaVoices(e) { return e.type === 'requiem' ? CODA_VOICES_REQUIEM : CODA_VOICES_WEARER; }

// ---------------------------------------------------------------- deaths
function codaBossDown(e) {
  const f = G.flags;
  if (e.type === 'bosun') {
    f.bosun_dead = true; G.give('holdkey'); questXp(30);
    msg('Bosun Teller goes down with his count unfinished. You take the hold key off its lanyard: TELLER — HOLD. On the back of the tag, scratched with a pin: 432. It is the count of the Kestrel\'s hold, taken by ear.', 'good', 7000);
    journal('side', 'Teller\'s Hold: I killed Bosun Teller at the wreck of the Office cutter and took the hold key off his neck. He had counted the Kestrel\'s hold by ear: 432. The cutter\'s own hold is in her split hull.');
  }
  if (e.type === 'broodmother') {
    f.brood_dead = true; questXp(60);
    msg('The Brood-Mother folds up on her glass legs and her egg-sac goes dark, face by small face. Nothing else comes down the webs.', 'good', 7000);
    journal('side', 'The Brood-Mother: I killed the queen of the weaverling nests in the south-west of the Deep Woods. Her egg-sac was full of small faces. The webs are quiet now.');
  }
  if (e.type === 'horn') { f.horn_dead = true; msg('The listening-horn goes over on its tripod with a sound like a dropped trumpet, and the dial spins down to nothing. Nobody else on the cutter can hear you now.', 'good', 6000); }
  if (e.type === 'wearer_coda' && e.ring) { ringKill(e); return; }
  if (e.type === 'requiem' || e.type === 'wearer_coda') {
    f.coda_fight = false; questXp(150);
    if (e.type === 'wearer_coda') { f.coda_done = true; f.wearer_dead = true; f.wearer_coda_dead = true; } else { f.requiem_done = true; if (!f.coda_done) f.coda_done = true; }
    const txt = e.type === 'wearer_coda' ? 'It bursts, and everything it ever ate comes out at once: a Cantor and four others, two years of a woman\'s nights, a boy whistling a falling fifth with too much air in it — and last of all Tobin Ashgrove, getting louder as they took him, so the house would be further away.' : 'It bursts, and eleven hundred years of funeral offices come out of it at once, every one of them for somebody, every one of them sung properly this time, and then the Mausoleum is only a building, and very quiet.';
    msg(txt, 'good', 12000);
    const pre = e.type === 'wearer_coda' ? 'Coda: ' : 'The Unended Office: ';   // (a variable, so the logbook's static scan sees the entry's own first words)
    journal('main', pre + 'in the choir of the Mausoleum of Chords ' + 'Lyra sang the two-voice coda alone' + ' and ' + (e.type === 'wearer_coda' ? 'the Wearer burst. Everything it ever ate came out at once, ending with Tobin Ashgrove.' : 'the Unended Office burst into eleven hundred years of funeral offices, and the House is only a building now.') + ' Back to the fire.' + (f.tank_patched ? '' : ' The Kestrel still needs her lift-tank patched.'));
    codaCheckHerald();
  }
}
function codaCheckHerald() {
  const f = G.flags;
  if (f.coda_done && f.tank_patched && !f.herald_come) {
    f.herald_come = true;
    if (G.mapId === 'deepwoods') for (const o of G.ents) if (o.id === 'herald') o.hidden = false;
    journal('main', 'Somebody is coming up the south road to the camp, on foot, alone, in white and gold. A Synod herald.');
    setTimeout(() => msg('From the south road, very faint: a man\'s voice, practising the opening of a formal document.', 'voice', 6000), 2500);
  }
}

// ---------------------------------------------------------------- things you can use
function codaUse(e) {
  const f = G.flags, p = G.player;
  if (e.use === 'kestrel') { msg(f.tank_patched ? 'The Kestrel, still on her side, but her number-three tank is closed and Tobiah keeps putting his ear to the seam.' : 'The Drift-Kestrel lies on her side in the willows. Her number-three lift-tank has a hole in it you could post a sheep through.', '', 5000); return true; }
  if (e.use === 'campfire') {
    if (G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && o.state === 'chase' && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 100)) { msg('Not with that in the trees.', 'warn', 2500); return true; }
    p.hp = Math.min(p.hpMax, p.hp + 20); p.fat = p.fatMax; msg('You sit by the fire for a while. Somebody passes you a dented cup of something hot. Nobody says who is holding the line tonight; Mags just gets up and goes.', 'good', 6000); return true;
  }
  if (e.use === 'footprints') { if (!f.jory_prints) { f.jory_prints = true; journal('side', 'A plank from the Kestrel\'s foredeck with two scorched footprints burned into it, where a boy made of lightning stood for one breath and asked the way east. "If you stop," he said.'); } msg('Two scorched footprints in a deck-plank, still crackling faintly. A boy of seventeen stood here for one breath, with a writ in his fist. If you stop.', 'voice', 6000); return true; }
  if (e.use === 'nan_grave') { msg(f.sexton_rest ? 'The grave is filled. The headstone says NAN now, in fresh chalk, in a gravedigger\'s hand.' : 'A grave, dug and filled and dug again. The new headstone has a bell carved on it and no name.', '', 5000); return true; }
  if (e.use === 'shrine') {
    if (f.shrine_used) { msg('The hush-lamp burns. The Hush came for its light, and you were there.', '', 4000); return true; }
    if (G.ents.some(o => o.kind === 'enemy' && o.type === 'quiet' && !o.dead && !o.hidden)) { msg('Something near the shrine is eating the sound out of the air. You cannot hear the lamp, which you should be able to.', 'warn', 4000); return true; }
    f.shrine_used = true; p.voiceMax += 5; p.voice = p.voiceMax; questXp(40);
    msg('A hush-lamp shrine for travellers, still burning after three years with no keeper. You sit inside its light, and for the first time since the Reach you can hear your own voice properly. (+5 maximum voice)', 'good', 7000);
    journal('side', 'I cleared the quiets from the hush-lamp shrine in the south-east of the Deep Woods, and sat in its light.');
    return true;
  }
  if (e.use === 'silk') {
    if (G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && (o.type === 'weaverling' || o.type === 'broodmother') && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 25)) { msg('The web is shaking. Something is coming down it toward you. Deal with it first.', 'warn', 3000); return true; }
    e.hidden = true; G.give('liftsilk'); questXp(10); Audio_.sfx.pickup();
    const n = G.count('liftsilk');
    msg(`You cut a bolt of lift-silk off the web, light as breath. (${n} of 3)`, 'good', 4000);
    if (n === 3) journal('main', 'The Lift-Tank: I have three bolts of lift-silk from the weaverling nests. ' + (G.has('valve') || f.tank_patched ? 'Back to Tobiah.' : 'Now the relief valve, off the Office cutter in the east.'));
    return true;
  }
  if (e.use === 'cutter') { codaCutter(e); return true; }
  if (e.use === 'tower_bell') { codaBell(e); return true; }
  if (e.use === 'maus_inscription') { showEvent('Over the inner door', '<i>Here lie the scribes of the Silent Veil, each in the stone of the note they kept. Sing them down as you would sing them home: from the highest, to the lowest. Then the choir will open, and you may say goodbye.</i>', [{ t: 'Step back.', f: null }]); return true; }
  if (e.use === 'tomb') { codaTomb(e); return true; }
  if (e.use === 'maus_register') {
    if (f.register_taken) { msg('The sexton\'s desk, with a gap on it where the register lay.', '', 3000); return true; }
    f.register_taken = true; G.give('register');
    showEvent('The register of interments', 'A sexton\'s register, three hundred years of it, in a dozen hands. The last hand is careful for a long time, and then less careful. The last entry reads: <i>Nan Fell, wife of the sexton, interred the 3rd of Memoryday 416, by A. Fell. Headstone to follow.</i><br><br>It is dated the day the Anchor went quiet. There is nothing after it.', [{ t: 'Take the register.', f: () => journal('side', 'The Sexton\'s Grave: in the Mausoleum\'s vestry, the register of interments. The last entry: Nan Fell, wife of the sexton, interred the day the Anchor went quiet, by A. Fell. The Hollow digging in the yard west of the Mausoleum is Amos Fell.') }]);
    return true;
  }
  return false;
}
function codaCutter(e) {
  const f = G.flags;
  const near = G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && !o.def.cacophony && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 49);
  if (near) { msg('Grey coats on the wreck, between you and the hull. Not yet.', 'warn', 3500); return; }
  const ch = [];
  if (!G.has('valve') && !f.tank_patched && !f.valve_taken) ch.push({ t: 'Take the relief valve off her lift-tank.', f: () => { f.valve_taken = true; G.give('valve'); questXp(30); msg('You get the relief valve off the cutter\'s tank with your knife and some swearing. OK-CATALOGUE, stamped on the brass.', 'good', 5000); journal('main', 'The Lift-Tank: I have the brass relief valve off the Office cutter. ' + (G.count('liftsilk') >= 3 ? 'Back to Tobiah.' : 'Now three bolts of lift-silk from the weaverling nests in the south-west.')); } });
  if (!f.bottles_done) {
    if (G.has('holdkey')) ch.push({ t: 'Unlock the hold.', f: () => codaHold() });
    else ch.push({ t: 'Try the hold hatch.', f: () => msg('The hold hatch is locked, and from under it comes a murmur, a few voices, none of them loud. TELLER, says the plate on the lock.', 'warn', 5000) });
  }
  if (!f.log_read) ch.push({ t: 'Read the cutter\'s log.', f: () => codaLog() });
  ch.push({ t: 'Leave the wreck.', f: null });
  showEvent('The Office cutter OC-742', 'Grey hull, grey canopy, split at the bow by a broken willow-crown with the leaves still on it. ' + (f.horn_dead ? 'The listening-horn lies on its side in the moss.' : 'Her listening-horn is still on its tripod.') + (f.bottles_done ? '' : ' Under the hold hatch, something murmurs in a few small voices.'), ch);
}
function codaHold() {
  const f = G.flags;
  showEvent('Teller\'s hold', 'A courier-cutter\'s hold: proctors\' hammocks, a press of blank forms, a crate of Office ink. No cargo; she could not lift any. At the back stands one iron-bound evidence chest, and in it twelve stoppered vox-bottles in felt sleeves, blue glass, each with an Office seizure tag: TAKEN AT PORT CANTABILE — RUST COAST TRADE — FOR THE HALL OF CARRIAGE. Black-market last words, seized off a smuggler. Every bottle is murmuring. Every one of them is somebody, said once, kept.' + (f.sable_with ? '<br><br>Sable, behind you: "Do not unstopper them in the dark. Quiets come through an open bottle like water through a sluice."' : ''), [
    { t: 'Carry them to the Kestrel. All twelve.', f: () => { f.bottles_done = true; f.bottles_kept = true; questXp(100); G.ledger.push({ name: 'Twelve voices in seized vox-bottles', where: 'the Office cutter OC-742', day: G.day }); journal('side', 'Teller\'s Hold: we carried the twelve seized vox-bottles from the cutter\'s evidence chest to the Kestrel. Twelve voices the Office took off a smuggler for the Hall of Carriage. They ride with the four hundred and thirty-two now. They have to go somewhere.'); msg('It takes one trip and a blanket. Tobiah weighs the chest in his arms and says nothing about the lift. Vane says twelve more is nothing, and then says it again, quieter. Twelve more people in a hold, who have to go somewhere.', 'good', 9000); } },
    { t: 'Unstopper them here. Let them go.', f: () => { f.bottles_done = true; f.bottles_freed = true; questXp(80); journal('side', 'Teller\'s Hold: I unstoppered the twelve seized vox-bottles from the cutter\'s evidence chest, in the woods. Twelve people said one sentence each, and the woods were very quiet, and then something else was.'); msg('You pull the first stopper and a woman\'s voice says "Tell Harl I paid the rent" and is gone into the willows. Then the next. It takes a few minutes. When it is done the woods are very quiet. Then something else is: the air beside the hold stops carrying sound.', 'voice', 9000); spawnQuietsAtHold(); } },
    { t: 'Close the hatch.', f: null },
  ]);
}
function spawnQuietsAtHold() {
  const c = Engine.cam;
  for (let i = 0; i < 2; i++) { for (let k = 0; k < 8; k++) { const a = rnd(0, 6.28), x = c.x + Math.cos(a) * 3, y = c.y + Math.sin(a) * 3; if (solidAt(x, y)) continue; const q = hydrate({ kind: 'enemy', type: 'quiet', x, y }); q.state = 'chase'; q.alertT = 10; G.ents.push(q); break; } }
}
function codaTomb(e) {
  const f = G.flags, [who, hz] = TOMB_NOTES[e.tomb];
  if (f.tombs_rung) { Audio_.sfx.song(hz, 0.8); msg(`${who}'s tomb rings ${hz}, softly. The choir door stands open.`, '', 3000); return; }
  if (G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && o.state === 'chase' && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 36)) { msg('Not with a Warden at your back.', 'warn', 2500); return; }
  const order = TOMB_NOTES.map((t, i) => i).sort((a, b) => TOMB_NOTES[b][1] - TOMB_NOTES[a][1]);
  f.tomb_seq = f.tomb_seq || [];
  Audio_.sfx.song(hz, 1.0);
  const want = order[f.tomb_seq.length];
  if (e.tomb === want) {
    f.tomb_seq.push(e.tomb);
    msg(`You knock on ${who}'s tomb and it rings ${hz}, long and clear. (${f.tomb_seq.length} of 4)`, 'good', 3500);
    if (f.tomb_seq.length === 4) {
      f.tombs_rung = true; questXp(60);
      setTimeout(() => { Audio_.sfx.bell(); msg('From the north, through the bronze door, four small bells answer in the same order, high to low. The felt falls out of them. The choir door is open.', 'good', 7000); }, 900);
      journal('main', 'Coda: I rang the four scribes\' tombs in the Mausoleum of Chords from the highest note to the lowest, and the bronze choir door opened.');
    }
  } else {
    f.tomb_seq = [];
    msg(`${who}'s tomb rings ${hz}, and it is wrong. The note sours, and the whole hall sours with it. Somewhere in the dark a marble mouth opens.`, 'bad', 5000);
    addNoise(3);
    for (const o of G.ents) if (o.kind === 'enemy' && o.type === 'warden' && !o.dead && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 200) { o.state = 'chase'; o.alertT = 8; o.guard = false; }
  }
}

// ---------------------------------------------------------------- triggers
function codaTrigger(t) {
  const f = G.flags;
  if (t.id === 'ring') { ringEnter(t); return true; }
  if (t.id !== 'coda_choir') return false;
  if (t.done || f.requiem_done) return true;
  if (!f.coda_done) { if (!t.said) { t.said = true; msg('The choir of the Mausoleum. Something at the far end of it is singing a funeral office, quietly, to itself, in a hundred voices. Not tonight. The thing in the woods wears her father, and it comes first.', 'warn', 7000); } return true; }
  if (!f.lyra_requiem) { if (!t.said) { t.said = true; msg('The choir of the Mausoleum. Something at the far end of it is singing a funeral office, quietly, to itself. You should not do this without Lyra; it is her father\'s office.', 'warn', 6000); } return true; }
  t.done = true;
  const boss = 'requiem';
  const begin = () => {
    f.coda_fight = true; f.coda_t = 45; f.coda_said = 0;
    for (const o of G.ents) if (o.id === 'lyra_dw') o.hidden = false;
    const b = hydrate({ kind: 'enemy', type: boss, x: 19.5, y: 4.6 }); b.state = 'chase'; b.alertT = 20; G.ents.push(b);
    Audio_.sfx.voice();
    msg('It stands up out of the First Cantor\'s tomb: a mourning veil, a broken bell for a head, a choir of small faces singing in its ribs. It sings her father\'s office — and Lyra answers it, eight bars, in harmony.', 'bad', 9000);
  };
  // the Unended Office begins only with Lyra's voice (Phase 125b: the traveller does not sing her father's office); an old
  // save without it waits at the door
  if (f.lyra_voice) { f.coda_go = true; begin(); return true; }
  t.done = false;
  showEvent('The coda', 'She writes: <b>NOT WITHOUT MY VOICE.</b>', [
    { t: 'Back out, and come back with her voice.', f: () => { f.coda_go = false; const c = Engine.cam; c.y = Math.min(c.y + 2.2, 16.5); msg('You back out through the bronze door. The singing stops, politely, and waits.', 'warn', 5000); } },
  ]);
  return true;
}

// ---------------------------------------------------------------- the ring of lamps (Book One ch. 23)
// Lyra sets a ring of hush-lamps at the edge of the clearing north of the camp, walks out past the last one, and sings her
// father's funeral office at full voice: five parts and a coda. The Wearer comes in on the harmony, circling closer, using
// voices to make her walk further out. Kaelen gets one strike, and the Aegis one second behind him (MS 6028, 6098).
// Phase 125b: the traveller walks into the ring and steps into Lyra's boots (js/boots125.js): she stays on her spot and
// keeps singing, and a step off it or a stopped song is a grey slip that changes nothing. Without js/boots125.js the night
// plays as the book's lines while the traveller waits inside the lamps. The ring cannot fail and send anyone back "in a
// week", and nobody but Kaelen and the Aegis strikes. Its text is the book's (RING_TX; the French is in the p125b TSV).
const RING = { cx: 27.5, cy: 25.2, r: 2.0, bx: 27.5, by: 23.6, lamps: 6, parts: 45, strike: 4 };
const RING_PARTS = [45, 31, 17];   // the office's parts as played: the first three lines; the harmony; the naming and the close
const RING_TX = {
  sang: 'She sang it in a voice like a torn sheet, in the dark, badly, at full volume.',
  line1: '<i>Tobin Ashgrove of the orchard rows. Son of Mara. Cantor of Oakhaven.</i>',
  quiet: 'The wood went quiet.',
  line2: '<i>He sang the births. He sang the burials. He hummed off-key on the fourth bar and he never once learned better.</i>',
  going: 'She could hear her own voice going out between the trunks and not coming back, the way sound goes in deep woods, and she kept singing, and her throat opened something it should not have opened and she tasted iron and kept going.',
  line3: '<i>He went out into the yard so the hounds would follow him and not the house. He was fifty-six years old. He was afraid of ladders and nothing else.</i>',
  second: 'And somewhere out in the dark, perfectly in tune, her father\'s voice began to sing the second part.',
  harmony: 'It came in on the harmony line the way Tobin Ashgrove had come in on it four hundred times at four hundred gravesides, a fifth below, warm and hoarse and a little late on the entries the way he always was, and for eight bars Lyra Ashgrove and the thing that had eaten her father sang his funeral together in the dark.',
  thirty: 'It came between the trunks at thirty feet: her father\'s height, her father\'s stoop, the long-backed forward lean of forty years over reed-rows, with the willow-dark showing straight through it and its edges crawling like heat off a road. It had no face. It had the place where a face was not, rippling, and the voice came out of that.',
  lark: '<i>"Lark,"</i> it said, between the phrases. <i>"Oh, lark. You never sang it for me."</i>',
  iknow: '"I know," said Lyra, and kept singing.',
  waited: '<i>"I waited."</i>',
  naming: 'Third part. The naming.',
  name: '<i>Tobin Ashgrove.</i>',
  nearer: 'Twenty feet. Fifteen.',
  come: '<i>"Come out of the lamps, lark,"</i> it said, in her own whole voice, gently. <i>"I can\'t come in there. Come out to me and I\'ll sing the rest with you. You can\'t do the close on your own, you know you can\'t, it\'s a two-voice part—"</i>',
  ten: 'Ten feet.',
  twoVoice: '"I know it\'s a two-voice part," said Lyra Ashgrove.',
  alone: 'And she sang the coda alone.',
  // the burst (MS 6096-6126)
  apart: 'It came apart four feet in front of her.',
  struck: 'Kaelen came out of the dark behind it at a dead run with his left arm bare and blazing and his ribs grinding and he hit it with everything he had left, and nine feet of bronze came out of the dark one second behind him and hit it from the other side, because DEFEND THE SINGERS is four words long and has no clause in it for what the thing in front of you is wearing.',
  struckAlone: 'Kaelen came out of the dark behind it at a dead run with his left arm bare and blazing and his ribs grinding and he hit it with everything he had left …',
  burst: 'The Wearer burst.',
  ate: 'It did not die like the hounds in the tavern, in a spray of bright falling notes. It had eaten a Cantor and four others and two years of a woman\'s nights, and when the glass went through it, all of that came out at once, in the space of about three seconds, in a wall of sound that knocked Tobiah Marsh off his feet at forty yards.',
  v1: 'Davin Hale, singing the fourth line of the harvest home.',
  v2: 'Old Tam, going up for the high note he never once reached.',
  v3: 'Ada Pellow, saying <i>oh, it\'s easy, come on, it\'s easy from this side</i> in the voice of a woman who has just discovered otherwise.',
  v4: 'A boy whistling a falling fifth with too much air in it.',
  v5: 'Lyra\'s own voice, whole and warm and twenty-nine years old, saying <i>I\'ve shown him how to hold his hands out stiff, Da, so they won\'t touch anything.</i>',
  under: 'And under all of it, rising up through it as the rest came apart, her father.',
  underneath: 'Not the voice it had worn. The one underneath. Tobin Ashgrove at the end, in a farmyard in the spring, singing the calling-song at the top of his lungs and walking away from a house with a sick child in it, and the song getting ragged as the thing came, and then not ragged — <i>louder</i> — because he had worked out, in the last four seconds of his life, that the louder he was the further away they would be from the door.',
  still: 'He was still singing when it took him.',
  stood: 'That is what came out of the Wearer in the clearing by the Mausoleum of Chords, and Lyra Ashgrove stood four feet away with her hands at her sides and let every bit of it go through her, and did not cover her ears.',
  lastWord: 'The last of it was one word, in her father\'s voice, from about the height of her shoulder, very close, almost surprised:',
  larkLast: '<i>"Lark—"</i>',
  nothing: 'And then the clearing was quiet, and there was nothing in the moss in front of her at all.',
  // after (MS 6130-6154)
  satDown: 'She sat down.',
  legs: 'Not gracefully; her legs stopped and she went down on them in the wet moss. Kaelen got to her and did not touch her and knelt a yard away with his arm ringing low and full — it had fed; she heard it feed; it was the fullest she had ever heard it — and said her name twice.',
  thatsIt: '"That\'s it," said Lyra.',
  lyraName: '"Lyra—"',
  endOfHim: '"That\'s it. That\'s the end of him." She was looking at the empty place in the moss. "That was the last of his voice in the world, and it was in <i>that</i>, and I\'ve just put it out." Her face did something she had no control over. "I\'ve been going out to the Hedge for forty-one nights to listen to a monster because it was the only place my father still existed, and I knew exactly what it was the whole time, and tonight I killed it on purpose, and now there\'s nowhere."',
  nothingAtAll: 'Kaelen said nothing at all, which was, for once, precisely right.',
  saySomething: '"Say something," she said.',
  no: '"No."',
  kaelenName: '"<i>Kaelen.</i>"',
  sitHere: '"You don\'t want something said," he said. "You want somebody to sit here. I can do that one."',
  sat: 'So he sat there, a yard away in the wet moss, with a nine-foot automaton standing over the pair of them holding a child\'s red cloak, and the lamps burning down, and the ship creaking in the dark, and four hundred and thirty-two people murmuring in her hold.',
  satAlone: 'So he sat there, a yard away in the wet moss, … and the lamps burning down, and the ship creaking in the dark, and four hundred and thirty-two people murmuring in her hold.',
  hand: 'And at some point before dawn Lyra Ashgrove put her hand out sideways, without looking, and found his good one, and did not let go of it, and did not forgive him either.',
  both: 'Both of those things were true at the same time, and would be for a long while yet.',
  burstTitle: 'It comes apart four feet in front of her',
  afterTitle: 'The moss',
  afterGo: '…',
  journal: 'Coda: the ring of lamps. Lyra will walk out past the last lamp in the clearing north of the camp and sing her father\'s office at full voice. The lamps are set. Kaelen gets one strike, when it is inside the lamps and not before.',
};
// the beats of the office: [ring_t at which it is said, RING_TX key, voice ids]
const RING_BEATS = [
  [45, 'sang'], [43, 'line1'], [41, 'quiet'], [39, 'line2'], [36, 'going'], [33, 'line3'],
  [31, 'second'], [28, 'harmony'], [25, 'thirty'], [22, 'lark', ['wearer.ring.lark']], [20, 'iknow', ['lyra_ruined.ring.iknow']], [19, 'waited', ['wearer.ring.waited']],
  [17, 'naming'], [15.5, 'name'], [14, 'name'], [12.5, 'name'], [11, 'name'], [10, 'nearer'], [7, 'come', ['wearer.ring.come']], [3, 'ten'],
];
function ringPos(i) { const a = -Math.PI / 2 + i / RING.lamps * Math.PI * 2; return [RING.cx + Math.cos(a) * RING.r, RING.cy + Math.sin(a) * RING.r]; }
const ringBoots = () => { try { return typeof BOOTS125 === 'object' && !!BOOTS125 && !!BOOTS125.coda && BOOTS125.active() === 'coda'; } catch (e) { return false; } };
// the camp's Lyra, the ring's Lyra and the lamps follow the flags (called on every Deep Woods load, and whenever they change)
function ringLyraHidden(e) {   // the Deep Woods' two Lyras: at the fire, or past the last lamp (js/party.js defers to this)
  const f = G.flags;
  if (e.ringLyra) return !(f.ring_go && !f.ring_back) || ringBoots();   // in her boots the player is her
  return !!(f.ring_go && !f.ring_back);
}
function ringSync() {
  const f = G.flags, m = G.maps && G.maps.deepwoods; if (!m || !f.part4) return;
  for (const e of m.entities) {
    if (e.ringLamp) e.hidden = !f.ring_set;
    else if (e.id === 'lyra_dw') e.hidden = ringLyraHidden(e) || !!(G.party && G.party.id === 'lyra');
  }
}
function ringPlan(g) {
  const f = g.flags;
  if (!f.lyra_voice) return '';   // her voice comes back at the fire before the coda (MS 5966-5970): no ring without it
  f.ring_set = true; f.ring_go = true; f.coda_go = true; f.ring_back = false; f.ring_night = (f.ring_night || 0) + 1;
  G.day += 1; G.tod = 2 / 24;
  ringSync();
  journal('main', RING_TX.journal);
  return `She sets it up like a procedure, because that is how you do a thing you cannot afford to feel.<br><br>"It won\'t come where people are. It never has. In two years it has never crossed the Hedge, or come through the culvert, or set foot in the Hollow, and at the Cloister it stood in the fog and would not come into the room. It wants me <i>alone</i>. That\'s the whole of its nature. So I am going to be alone, out there, at the edge of the trees, and all of you are going to be back here where it can see that you are."<br><br>"And when it comes?" says Vane.<br><br>"It won\'t come straight away. It\'ll circle, and it\'ll use voices, and it will do everything it can to make me walk further out." She looks at Kaelen. "You get one strike. You get it when it\'s inside the ring of lamps and not before, because if it sees you it will simply go away and come back in a week when I\'m asleep."${f.sable_with ? '<br><br>"Lyra," says Sable, "may I say the obvious thing."<br><br>"No."' : ''}<br><br>"I\'m not bait," says Lyra. "Bait doesn\'t sing."<br><br>Vane, Tobiah and Mags carry the camp\'s lamps out to the clearing north of the fire and set them in a ring at the edge of the trees. At the second hour she walks out past the last one.`;
}
function ringEnter(t) {
  const f = G.flags;
  if (!f.ring_set || f.ring_fight || f.coda_done || !f.lyra_voice) return;
  if (G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && !o.ring && o.state === 'chase' && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 100)) { msg('Not with that in the trees.', 'warn', 2500); t.inside = false; return; }
  f.ring_fight = true; f.ring_t = RING.parts; f.ring_said = 99; f.ring_sung = false; f.ring_w = 0; f.ring_clock = 0; f.ring_struck = null;
  // the wood goes quiet: nothing else in the clearing tonight
  for (const o of G.ents) if (o.kind === 'enemy' && !o.dead && !o.hidden && !o.def.boss && !o.ring && dist2(o.x, o.y, RING.cx, RING.cy) < 196) { o.dead = true; o.hidden = true; }
  G.noise = 0;
  Audio_.sfx.voice();
  if (typeof BOOTS125 === 'object' && BOOTS125 && BOOTS125.can && BOOTS125.can('coda')) { try { BOOTS125.enter('coda'); ringSync(); return; } catch (e) { console.warn('coda: boots failed', e); } }
  msg('Lyra walks out past the last lamp and stands in the moss between two silver willows with her hands at her sides. And she sings her father\'s funeral, in a voice like a torn sheet, in the dark, badly, at full volume.', 'voice', 8000);
}
// the ring set back to before the night, quietly: used by loads and the old-save migration only, never as a failure
function ringReset(keepSet) {
  const f = G.flags;
  f.ring_fight = false; f.ring_sung = false;
  if (!keepSet) { f.ring_set = false; f.ring_go = false; f.coda_go = false; }
  delete f.ring_t; delete f.ring_w;
  if (G.ents) for (let i = G.ents.length - 1; i >= 0; i--) if (G.ents[i].ring && G.ents[i].kind === 'enemy') { G.ents[i].dead = true; G.ents[i].hidden = true; G.ents.splice(i, 1); }
  ringSync();
}
// a blow on the ring's Wearer does nothing: the strike is Kaelen's and the Aegis's (MS 6028, 6098)
function ringShield() { return 0; }
function ringWearer() { return G.ents.find(o => o.ring && o.kind === 'enemy' && !o.dead); }
function ringSay(text, vo) {
  if (ringBoots()) { try { BOOTS125.coda.caption(text, vo); return; } catch (e) { /* the plain message below */ } }
  msg(text, 'voice', 7000);
}
function ringTick(dt) {
  const f = G.flags; if (!f.ring_fight) return;
  const B = ringBoots() ? BOOTS125.coda : null;
  f.ring_clock = (f.ring_clock || 0) + dt;
  if (!f.ring_sung) {
    if (!B || B.go()) f.ring_t -= dt;   // in Lyra's boots the office goes on only while she stands and sings it
    const t = f.ring_t;
    for (const [at, k, vo] of RING_BEATS) if (t <= at && f.ring_said > at) { f.ring_said = at; ringSay(RING_TX[k], vo); }
    if (t <= 31 && !ringWearer()) {
      const e = hydrate({ kind: 'enemy', type: 'wearer_coda', x: RING.bx, y: RING.by - 10 }); e.ring = true; e.transient = true; e.state = 'passive'; e.passive = true; e.alertT = 0; G.ents.push(e);
      Audio_.sfx.voice();
    }
    if (t <= 0) {
      f.ring_sung = true; f.ring_w = RING.strike;
      codaClose();
      ringSay(RING_TX.twoVoice, ['lyra_ruined.ring.twovoice']); ringSay(RING_TX.alone);
    }
  } else {
    f.ring_w -= dt;
    if (f.ring_w <= 0) { const e = ringWearer(); if (e) { f.ring_struck = 'kaelen'; killEnemy(e, true); } }
  }
  // the Wearer circles in from the dark, never where the people are
  const e = ringWearer();
  if (e) {
    const k = Math.max(0, Math.min(1, f.ring_t / 31));
    const r = 1.2 + 8.8 * k, a = -Math.PI / 2 + Math.sin(f.ring_clock * 0.35) * (0.3 + 0.9 * k);
    e.x = RING.bx + Math.cos(a) * r; e.y = RING.by + Math.sin(a) * r; e.facing = Math.atan2(RING.by - e.y, RING.bx - e.x); e.state = 'passive';
  }
}
// the part of the office a slip starts again (Lyra's boots): back to its first line
function ringRestartPart() {
  const f = G.flags; if (!f.ring_fight || f.ring_sung) return;
  const start = RING_PARTS.slice().reverse().find((p) => f.ring_t <= p) || RING_PARTS[0];
  f.ring_t = start; f.ring_said = start === RING_PARTS[0] ? 99 : start + 0.001;
}
function ringVoices() { return ['v1', 'v2', 'v3', 'v4', 'v5'].map((k) => RING_TX[k]); }
function ringKill(e) {
  const f = G.flags;
  f.ring_fight = false; f.coda_done = true; f.wearer_dead = true; f.wearer_coda_dead = true; f.coda_fight = false; f.ring_struck = 'kaelen'; questXp(150);
  const T = RING_TX, br = '<br><br>';
  showEvent(T.burstTitle, [T.apart, f.aegis_follow ? T.struck : T.struckAlone, T.burst, T.ate, ringVoices().join('<br>'), T.under, T.underneath, T.still, T.stood, T.lastWord, T.larkLast, T.nothing].join(br), [
    { t: T.afterGo, f: () => ringAfter() },
  ]);
  journal('main', 'Coda: in the clearing by the Mausoleum of Chords, inside the ring of lamps, Lyra sang her father\'s office at full voice past the last lamp, eight bars in harmony with the thing that ate him, and the coda alone, and Kaelen struck it inside the lamps, and the Aegis a second behind him, and the Wearer burst. Everything it ever ate came out at once, ending with Tobin, getting louder.' + (f.tank_patched ? '' : ' The Kestrel still needs her lift-tank patched.'));
  ringSync();
  codaCheckHerald();
}
function ringAfter() {
  const f = G.flags, T = RING_TX;
  const body = [T.satDown, T.legs, T.thatsIt, T.lyraName, T.endOfHim, T.nothingAtAll, T.saySomething, T.no, T.kaelenName, T.sitHere, f.aegis_follow ? T.sat : T.satAlone, T.hand, T.both].join('<br><br>');
  const inBoots = ringBoots();
  showEvent(T.afterTitle, body, [{ t: inBoots && BOOTS125.TX ? BOOTS125.TX.stepOut : T.afterGo, f: () => { if (inBoots) { try { BOOTS125.exit(); } catch (e) { /* none */ } } ringSync(); } }]);
}

// ---------------------------------------------------------------- the herald, and the end of Book One
function codaHerald() {
  const f = G.flags;
  if (f.herald_answered) return false;   // answered once; the writ is not read twice
  if (typeof HERALD66 !== 'undefined') return HERALD66.fromTalk();   // ch. 24 played (js/herald66.js); the card below is its fallback
  setTimeout(() => {
    closeModal();
    showEvent('The writ', 'He has walked nine miles alone to read it aloud, because the form requires it. In the name of the Iron Synod: the Chord, all of you, declared Dissonant. The Church\'s claim on the Cantor stayed, not refused. The Dread Arbiter nine days out on the Tramway with a column. And grace, offered once: the glass drawn, the Cantor amnestied, the Oakhaven survivors given transit, and the cores returned for <i>proper disposition</i>.' + (f.sable_with ? '<br><br>Sable, very quietly: "It is not a sentence. It is a succession."' : ''), [
      { t: 'Let Lyra answer him.', f: () => codaAnswer(true) },
      { t: 'Answer him yourself.', f: () => codaAnswer(false) },
    ]);
  }, 50);
}
function codaAnswer(lyra) {
  const f = G.flags; f.herald_answered = true; f.herald_by_lyra = lyra;
  const ans = lyra ? (f.lyra_voice ? 'Lyra stands up from the fire. "Tell him the Cantor says we heard the question too," she says, in her own ruined voice.' : 'Lyra stands up from the fire, writes on her slate, and holds it up to him: <b>TELL HIM THE CANTOR SAYS WE HEARD THE QUESTION TOO.</b>') : `You tell him: "${G.player.name.split(' ')[0]} of Oakhaven says no." Behind you Lyra adds${f.lyra_voice ? ', aloud' : ', on her slate'}: tell him the Cantor says we heard the question too.`;
  showEvent('Not yet', `${ans}<br><br>The herald bows, because the form requires that too, and walks the nine miles back alone.<br><br>Then Lyra tells Kaelen he does not get to pay; he gets to help. She takes the glass hand, not the easy one. The ship needs a whole lift-tank, and there is one coast where you can get one.`, [{ t: 'End Book One.', f: () => bookOneEnd() }]);
}
// Part Four's lines for the ending
function codaEndingLines() {
  const f = G.flags, L = [];
  if (!f.part4) return L;
  if (f.coda_done) L.push(f.ring_struck ? 'In the clearing by the Mausoleum of Chords, inside a ring of hush-lamps, Lyra walked out past the last lamp and sang her father\'s funeral office at full voice, badly, in a voice like a torn sheet, eight bars in harmony with the thing that ate him, and the coda alone. Kaelen came out of the dark behind it at a dead run with his arm blazing, and the Aegis one second behind him, and it burst. Everything it ever ate came out at once, ending with Tobin Ashgrove getting louder as they took him, so the house would be further away.' : 'In the choir of the Mausoleum of Chords Lyra sang the two-voice coda alone, and the Wearer burst.');
  if (f.requiem_done) L.push('Afterwards, in the choir of the Mausoleum of Chords, Lyra sang the two-voice coda against the Unended Office, and eleven hundred years of funeral offices came out of it at once, sung properly, and the House is only a building now.');
  if (f.kaelen_told_now) L.push('At the fire Kaelen told Lyra everything, out loud. Her voice came back at the worst possible moment, and the first thing she did with it was tell him she would have forgiven him on Rootday, and cannot now.');
  if (f.bottles_kept) L.push('Twelve seized vox-bottles ride in the Kestrel\'s hold beside the four hundred and thirty-two: black-market last words the Office took off a smuggler for the Hall of Carriage. Twelve more people in a hold, who have to go somewhere.');
  else if (f.bottles_freed) L.push('In the Deep Woods you unstoppered twelve seized voices and let them go into the willows. Something came through after them that ate the sound out of the air.');
  if (f.cloak_given) L.push('By the fire Sable told the Aegis what she knows and cannot read, and promised to find his name in the Organum, and it gave her the red cloak.');
  if (f.sexton_rest) L.push('Amos Fell, sexton of the Mausoleum of Chords, filled his wife\'s grave for the last time, and sits beside it.');
  if (f.bell_rung) L.push('For the first time in three years the great bell of the Mausoleum of Chords was rung for the dead, three times, with the sexton\'s own hammer. The mourners in the yard laid down their lilies.');
  if (f.brood_dead) L.push('The Brood-Mother is dead in her nest in the south-west of the Deep Woods, and the webs are quiet.');
  if (f.log_read) L.push('In your pack is the log of OC-742: follow DK by sound, report to the Arbiter on the Tramway, ninth day. The last line says <i>DK making for</i>, and stops. Nobody knew. It is the only reason you are alive.');
  if (f.vane_stays) L.push('At the fire Vane told you about Vesper, and put the axe down on the moss instead of across his knees.');
  else if (f.vane_vesper) L.push('At the fire Vane told you about Vesper: ten heartbeats, the hawser, forty-eight men. He did not cut the line this time.');
  if (f.vane_told_cut) L.push('You told Vane to cut the line. He did not. "Not this time," he said.');
  return L;
}

// ---------------------------------------------------------------- second pass: mourners, the tower bell, the cutter's log
function codaMourners(dt) {
  const f = G.flags;
  for (const e of G.ents) {
    if (e.kind !== 'npc' || e.id !== 'mourner' || !e.path) continue;
    let tx, ty;
    if (f.bell_rung) { if (e.knelt) continue; [tx, ty] = e.rest; }
    else { e.pi = e.pi || 0; [tx, ty] = e.path[e.pi]; }
    const dx = tx - e.x, dy = ty - e.y, d = Math.hypot(dx, dy);
    if (d < 0.25) {
      if (f.bell_rung) { e.knelt = true; e.facing = -Math.PI / 2; continue; }
      e.wait = (e.wait || 0) + dt; if (e.wait < 2.5) continue;
      e.wait = 0; e.pi = (e.pi + e.dirn + e.path.length) % e.path.length;
      if (e.pi === 0 || e.pi === e.path.length - 1) e.dirn = -e.dirn;
      continue;
    }
    const sp = 0.55 * dt, nx = e.x + dx / d * sp, ny = e.y + dy / d * sp;
    if (!G.map.isBlocked(nx | 0, ny | 0)) { e.x = nx; e.y = ny; e.facing = Math.atan2(dy, dx); }
  }
}
function codaBell(e) {
  const f = G.flags;
  if (f.bell_rung) { msg('The great bell hangs still. You can still feel it in your back teeth.', '', 3500); return; }
  if (G.ents.some(o => o.kind === 'enemy' && !o.dead && !o.hidden && dist2(o.x, o.y, Engine.cam.x, Engine.cam.y) < 36)) { msg('Not with things in the belfry with you.', 'warn', 3000); return; }
  if (!G.player.weapons.includes('tollhammer')) {
    showEvent('The bell of the Mausoleum', 'A funeral bell the size of a cart, green with age, the lip cracked where it was rung too hard once. The rope was cut long ago. Somebody has written along the yoke in chalk: <i>NOT WITH YOUR HANDS.</i><br><br>You put your palm on the bronze and strike it, and your fist makes no sound on it at all.', [{ t: 'Leave it.', f: null }]);
    return;
  }
  showEvent('The bell of the Mausoleum', 'A funeral bell the size of a cart, green with age. The sexton\'s toll-hammer is heavy in your hand, and the head of it is the same green bronze as the bell.', [
    { t: 'Ring it for the dead.', f: () => {
      f.bell_rung = true; questXp(120);
      [196, 196, 196].forEach((hz, i) => setTimeout(() => Audio_.sfx.song(hz, 1.4), i * 1400));
      let n = 0;
      for (const id in G.maps) for (const o of G.maps[id].entities) {
        if (o.kind !== 'enemy' || o.dead || o.type !== 'dirge') continue;
        n++;
        if (id === G.mapId) killEnemy(o, true); else { o.dead = true; o.hidden = true; }
      }
      for (const id in G.maps) for (const o of G.maps[id].entities) if (o.kind === 'enemy' && o.type === 'warden' && !o.dead) { o.passive = true; o.state = 'passive'; }
      msg('You ring it three times, the way a death is rung in the Reach. The sound goes out of the tower and down through the woods and does not come back. ' + (n ? 'Every Dirge in the Deep Woods hears its own funeral and comes apart in the air.' : 'The woods go still.') + (G.party && G.party.id === 'lyra' && G.party.order !== 'wait' ? ' Lyra sings the response after the third stroke, the way a Cantor should, and the woods answer.' : G.party && G.party.id === 'kaelen' && G.party.order !== 'wait' ? ' Kaelen flinches at the first stroke, and then stands very still, listening to his arm ring with it.' : ''), 'good', 9000);
      journal('side', 'The Tower Bell: with Amos Fell\'s toll-hammer I rang the great bell of the Mausoleum of Chords three times, the way a death is rung. The Dirges came apart, the Chord-Wardens stood down, and the Hollow mourners in the yard finally knelt at their graves and laid down their lilies.');
    } },
    { t: 'Not yet.', f: null },
  ]);
}
function codaLog() {
  const f = G.flags;
  f.log_read = true; G.give('cutterlog'); questXp(40);
  showEvent('The log of OC-742', 'An Office logbook, grey cloth, every page ruled. The hand is small and very tidy.<br><br><i>TASKED: follow DK by sound from Oakhaven. Do not board. Do not engage. Listen.<br>REPORT TO: the Arbiter\'s column, the Tramway, ninth day.<br>CARGO: none. Held: 12 vox-bottles, seized at Port Cantabile, for the Hall of Carriage.<br><br>Day 6. DK took on a press and an archivist at Whisper-Grove. Grapnel crew stood to. Horn has the Cantor\'s voice clear. Bosun counts DK\'s hold at 432 by ear: Consignment 19, Whisper-Grove stock.<br>Day 7. DK making for</i><br><br>The last line is not finished.', [{ t: 'Take the log.', f: null }]);
  journal('side', 'The Cutter\'s Log: the Office cutter OC-742 had orders to follow the Drift-Kestrel by sound from Oakhaven, listen and not board, and report to the Dread Arbiter\'s column on the Tramway on the ninth day. It carried no cargo, only twelve seized vox-bottles; its bosun had counted our hold by ear at 432 and called it Consignment 19. The last line says "DK making for" and stops. Kaelen and Sable should see this, and Vane.');
}
