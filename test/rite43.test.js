// PREVIEW_URL=http://127.0.0.1:4074 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/rite43.test.js
// The Rite of Pure Unison, from procession to pumps (Book One ch. 9–10; ROADMAP R9 item 3): the point of no return at Lyra's
// door, the column up the main road under the Pure Note with the town humming 174, the cage, the needle and the Inquisitor's
// eyeline, the Hold and the Factor's lenses while Kaelen undoes eight bolts, the falling fifth, four Golems (two come, two
// are stopped), Aldric's sixty seconds, twelve men on the pumps (four go up, eight are left, their names for the ledger),
// forty thousand gallons, and the Greening as game.js has it. Also: saves mid-Rite, every line's French, no page errors.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4074');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Rite Tester');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click();
    await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click();
    await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;   // freeze the page's own loop: only T.step ticks the game from here
      window.T = {
        go(id, x, y, dir, tod) { if (tod != null) G.tod = tod; loadMap(id, x == null ? undefined : { x, y, dir: dir || 0 }); G.state = 'play'; G.keys = {}; },
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; update(dt || 0.05); } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        at(x, y) { Engine.cam.x = x; Engine.cam.y = y; },
        ent(k) { return G.ents.find((e) => e && e._r43 === k); },
      };
      const f = G.flags; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true; f.coil_done = f.rite_ready = f.church_come = true; f.hob_told = true;
      G.give('pass'); G.give('coil');
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };   // record the voices, play nothing
      // (Phase 125b) the needle and the Hold are played in their heroes' boots (js/boots125.js): this plays one through as the
      // book has it (the pinch released at once, the four pegs, the walk to the drum, the plate, the one sentence, the notes held)
      REEDS.forceManual = true;
      T.boots = async (until) => {
        for (let n = 0; n < 6000 && BOOTS125.active() && !(until && until()); n++) {
          const S = BOOTS125.S;
          if (S.card) { T.last().c[0].f(); continue; }
          if (S.wait) { const ss = REEDS.session; if (ss) { while (!ss.done) { ss.pitch = ss.centsAt(Math.max(0, ss.t)); ss.step(0.05); } } await new Promise((r) => setTimeout(r, 30)); continue; }
          if (S.beat === 'pinch' || S.beat === 'pegs' || S.beat === 'kneel') { BOOTS125.input('use', true); T.step(1, 0.05); BOOTS125.input('use', false); }
          if (S.beat === 'walk') { Engine.cam.x = RITE43.V.kaelenDrum[0]; Engine.cam.y = RITE43.V.kaelenDrum[1]; }
          T.step(1, 0.1);
        }
      };
    });

    // ---- before the Rite: the gate is sealed, Lyra's and Kaelen's lines point at her door, the palm message for Rooke
    const before = await page.evaluate(() => {
      const out = {}, f = G.flags;
      out.ready = RITE43.ready() && RITE43.stage() === 0;
      T.go('quarry', null, null, 0, 0.42);
      let gc = null; for (const c of G.map.cells) if (c && c.portal && c.portal.map === 'rootvault') gc = c;
      window.__msgs.length = 0; transfer(gc.portal); out.sealed = G.mapId === 'quarry' && T.heard(/sealed under the Factor/) && !f.rite_started;
      out.lyraLine = (NPCS.lyra.quest(G) || {}).text || ''; out.lyraLineChoices = ((NPCS.lyra.quest(G) || {}).choices || []).map((c) => c.t).join('|');
      const q = NPCS.lyra.quest(G); if (q && q.choices) q.choices[0].f();
      out.palm = f.r43_palm === 1 && G.journal.some((j) => /Orla Hale, the long drops/.test(j.text));
      out.lyraAfter = (NPCS.lyra.quest(G) || {}).text || '';
      out.kaelenLine = (NPCS.kaelen.quest(G) || {}).text || '';
      window.__ev.length = 0; talk({ id: 'rooke', kind: 'npc', x: 0, y: 0 }); const rk = T.last();
      out.rooke = !!rk && /surgeon's hands/i.test(rk.t) && /a thumb and a nod|thumb pressed/.test(rk.b); if (rk) rk.c[0].f();
      out.drops = f.r43_palm === 2 && f.rooke_drops === true && G.journal.some((j) => /A thumb and a nod/.test(j.text));
      return out;
    });
    check(before.ready && before.sealed, 'before the Rite the shaft gate is sealed: "The column forms at the Cantor\'s door on Hearthday"');
    check(/writes on it with her finger/.test(before.lyraLine) && /Carry it to Rooke/.test(before.lyraLineChoices) && before.palm, 'in custody Lyra writes the palm message on your hand: ORLA HALE, THE LONG DROPS (ch. 9, Nullday)');
    check(/Be at my door when they come for me/.test(before.lyraAfter) && /Hearthday\. Be at her door/.test(before.kaelenLine), 'Lyra\'s and Kaelen\'s lines send you to her door, not the shaft');
    check(before.rooke && before.drops, 'Rooke takes the instruction with a thumb and a nod, nothing said (rooke_drops)');

    // ---- the door: the point of no return, with the open threads
    const door = await page.evaluate(() => {
      const out = {}, f = G.flags; f.tam_met = true;   // one open thread, to see it listed
      T.go('oakhaven', RITE43.DOOR.x, RITE43.DOOR.y, 0, 0.42); window.__ev.length = 0; T.step(3);
      const d = T.last(); out.card = !!d && /column at the Cantor/.test(d.t) && /Still open:/.test(d.b) && /Old Tam is still waiting/.test(d.b);
      out.choices = d ? d.c.map((c) => c.t).join('|') : '';
      d.c[1].f(); T.step(3); out.notYet = !f.rite_started && window.__ev.length === 1;
      T.step(200, 0.05); out.again = window.__ev.length >= 2;   // after the cooldown, still standing there, it asks again (the stub never blocks play, so it may ask more than once)
      T.last().c[0].f();
      out.started = f.rite_started && f.r43 === 1 && G.day === 10 && G.mapId === 'oakhaven' && !G.has('coil') && G.has('pass');
      out.journal = G.journal.some((j) => /coil is in Kaelen's toolbag/.test(j.text));
      const ly = T.ent('lyra'), leg = T.ent('leg0'), head = T.ent('choir0');
      out.column = !!ly && !!leg && !!head && ly.y > head.y && leg.y > ly.y && Math.abs(ly.x - 23.5) < 0.1 && ly.y < Engine.cam.y;
      out.kerb = G.ents.filter((e) => e._r43 && /^kerb/.test(e._r43)).length;
      out.hum = f.r43_hum;
      out.hob = G.ents.some((e) => e._r43 && /^kerb/.test(e._r43) && e._name === 'Jabez Barker' && e._hums);
      out.rookeHums = G.ents.some((e) => e._r43 && /^kerb/.test(e._r43) && e._name === 'Surgeon-Grafter Rooke' && e._hums);   // he has her instruction
      delete f.tam_met;
      return out;
    });
    check(door.card && /Walk with them\.\|Not yet\./.test(door.choices) && door.notYet && door.again, 'at Lyra\'s door the column forms: the point of no return lists the open threads, "Not yet." waits and asks again');
    check(door.started && door.journal, 'walking with them starts the Rite: Hearthday, day 10, the coil in Kaelen\'s toolbag, the pass kept');
    check(door.column && door.kerb === 21 && door.hum === 18 && door.hob && door.rookeHums, 'the column stands on the road ahead of you, Lyra behind the choir, the Legionnaires at her shoulders; the kerbs hum (16 of the book\'s, plus Jabez Barker whom you helped and Rooke who has her instruction)');

    // ---- the procession: it waits for you, N hums with the town, a loud Song turns a stave, the beats fire in order
    const walk = await page.evaluate(() => {
      const out = {}, f = G.flags; const ly = () => T.ent('lyra');
      const d0 = f.r43_d; T.at(23.5, 45.0); window.__msgs.length = 0; T.step(20, 0.1);
      out.waits = f.r43_d === d0 && T.heard(/column slows at the crossing/);
      T.at(ly().x + 0.3, ly().y + 1.0); T.step(20, 0.1); out.moves = f.r43_d > d0;
      T.at(ly().x + 0.3, ly().y + 1.0); castSong('murmur'); out.hum = f.r43_you_hum === true && T.heard(/You hum the Root note under the Pure Note/);
      G.player.voiceMax = 99; G.player.voice = 99; G.song.t = 0; T.step(20, 0.1); T.at(ly().x + 0.3, ly().y + 1.0); castSong('root'); out.strike1 = f.r43_strikes === 1 && T.heard(/stave of glass-fire turns toward you/);
      G.song.t = 0; T.step(20, 0.1); T.at(ly().x + 0.3, ly().y + 1.0); castSong('root'); out.marched = f.r43_strikes === 2 && f.r43_marched === true && T.heard(/walks you to the back of the column/);
      let n = 0; const seq = [];
      const lines = [/old woman begins to hum/, /dye-works women take it up/, /Hetty Bram in the doorway/, /Flambeaux turn their staves/, /Lissa Merrow stands/];
      while (f.r43 === 1 && n < 900) { T.at(ly().x + 0.3, ly().y + 1.0); T.step(1, 0.1); n++; }
      for (const t of window.__msgs) { const i = lines.findIndex((re) => re.test(t)); if (i >= 0 && !seq.includes(i)) seq.push(i); }
      out.beats = f.r43_beats === 5 && seq.join(',') === '0,1,2,3,4';
      out.helped = T.heard(/Jabez Barker, Surgeon-Grafter Rooke are at the kerb, and hum/); out.wept = T.heard(/weeps without making a sound/);
      const a = T.last(); out.arrive = !!a && /headframe/.test(a.t) && /Tobiah Marsh/.test(a.b) && new RegExp('counted ' + (f.r43_hum + 1) + ' voices').test(a.b) && /Yours was one of them/.test(a.b) && /back of the column/.test(a.b);
      a.c[0].f(); out.stage = f.r43; out.map = G.mapId; out.gone = !G.maps.oakhaven.entities.some((e) => e._r43);
      const c1 = T.last(); out.cage = /Four hundred feet/.test(c1.t); c1.c[0].f(); const c2 = T.last(); out.pumps = /The pumps/.test(c2.t) && /gracious to a tool/.test(c2.b); c2.c[0].f();
      const c3 = T.last(); out.lullaby = /casing platform/.test(c3.t) && /Five notes/.test(c3.b) && /Kaelen kneels\. His hands are shaking/.test(c3.b);
      c3.c[0].f();
      out.needle = f.r43 === 3 && BOOTS125.active() === 'needle';   // (Phase 125b, taught) the needle is Kaelen's, in his boots; no eyeline window
      return out;
    });
    check(walk.waits && walk.moves, 'the column waits when you fall behind and walks on when you are near');
    check(walk.hum && walk.strike1 && walk.marched, 'N hums with the town; a loud Song turns a stave; the second time a Legionnaire walks you at the back');
    check(walk.beats && walk.helped && walk.wept, 'the kerbs in the book\'s order: the old woman by the well-house, the takers, Bettany and Hetty, the Tanner cousins and the Flambeaux, Lissa; the helped named; Lyra weeps');
    check(walk.arrive && walk.stage === 2 && walk.map === 'rootvault' && walk.gone, 'at the headframe: Tobiah carries the case, the count of voices, and the cage down to the Root-vault; the column leaves Oakhaven');
    check(walk.cage && walk.pumps && walk.lullaby && walk.needle, 'the cage, the pumps ("Interesting." / "a Cantor be gracious to a tool"), the lullaby and the case; then the needle, in Kaelen\'s boots');

    // ---- the vault's staging and the needle (Phase 125b, taught: the needle is played in Kaelen's boots, js/boots125.js;
    // the eyeline the traveller stood in is gone, because the book's Inquisitor never sees: "satisfied", "pleased", MS 3098, 3110)
    const needle = await page.evaluate(async () => {
      const out = {}, f = G.flags, V = RITE43.V, cs = G.map.casingRoom;
      const ks = ['stool', 'lyra', 'kaelen', 'crane', 'vosk', 'sis0', 'sis1', 'tobiah', 'drum', 'tube', 'cage', 'guard0', 'guard1'];
      out.figures = ks.every((k) => !!T.ent(k));
      const pumps = G.ents.filter((e) => e._r43 && /^pump\d+$/.test(e._r43)); out.pumps = pumps.length === 12 && pumps.filter((e) => e._name).length === 8 && pumps.find((e) => e._pump === 7)._name === 'Hale B.';
      out.guards = ['guard0', 'guard1'].every((k) => { const g = T.ent(k); return g.kind === 'enemy' && g.type === 'legionnaire' && (g.passive || g.state === 'passive'); });
      const inRoom = (e) => e.x > cs.x && e.x < cs.x + cs.w && e.y > cs.y && e.y < cs.y + cs.h;
      out.inRoom = ks.every((k) => inRoom(T.ent(k))) && pumps.every(inRoom);
      out.hollowAside = !G.ents.some((e) => e.kind === 'npc' && e.id === 'hollow' && !e.hidden && inRoom(e));
      window.__msgs.length = 0;
      await T.boots();
      out.fortunate = T.heard(/^"I\. Am\. Fortunate\."$/) && T.heard(/Not a hair off/) && T.heard(/Speak, daughter/) && !T.heard(/Inquisitor sees/);
      const h = T.last(); out.hold = /The Hold/.test(h.t) && /The Hold began at noon\./.test(h.b);
      out.stage4 = f.r43 === 4 && !f.r43_echoes; const k = T.ent('kaelen'); out.kaelenAtDrum = Math.abs(k.x - V.kaelenDrum[0]) < 0.05 && Math.abs(k.y - V.kaelenDrum[1]) < 0.05;
      out.lyraLabel = /with the wire in/.test(T.ent('lyra').label);
      return out;
    });
    check(needle.figures && needle.pumps && needle.guards && needle.inRoom && needle.hollowAside, 'the vault is staged in the casing room: Lyra on the stool, Kaelen, Crane on the catwalk, Vosk, two sisters, Tobiah, the drum, the tube, the cage, two bell-helms, twelve men at the pumps (eight named; Hale B. has the ring and the scar)');
    check(needle.fortunate, 'the needle, in Kaelen\'s boots: "Speak, daughter." "I. Am. Fortunate." not a hair off; nobody sees');
    check(needle.hold && needle.stage4 && needle.kaelenAtDrum && needle.lyraLabel, '"The Hold began at noon.": the Hold; Kaelen goes to the drum; Lyra sings with the wire in');

    // ---- the Hold (Phase 125b, taught: in Lyra's boots, then Kaelen's at the bolts, then hers for the lock and the fifth;
    // the lenses Echo is gone, because nobody stopped him, MS 3186)
    const hold = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      window.__msgs.length = 0; T.last().c[0].f();
      await T.boots(() => !!f.bore_seated);
      out.won = !f.r43_echoes && T.heard(/and nobody stopped him/) && f.bore_seated === true && f.r43 === 5;
      out.calls = T.heard(/Pitch, one-seventy-four\. Holding/) && T.heard(/It's matching her, sir/); out.fuse = window.__ev.some((e) => /She was the fuse\./.test(e.b));
      await T.boots();
      out.lock = T.heard(/SING IT DOWN!/) && window.__ev.some((e) => /The lock threw\./.test(e.b));
      return out;
    });
    check(hold.won && hold.calls && hold.fuse, 'the Hold: Tobiah calls the pitch, Kaelen reads the margin ("She was the fuse."), eight bolts in fifty-one seconds, and nobody stopped him');
    check(hold.lock, '"You\'ll want to hold onto something." The lock threw; "LYRA! SING IT DOWN!"');

    // ---- the falling fifth was sung in her boots; then four Golems, two of them stopped by "Enough."
    const fifth = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      out.score = f.r43_fifth; const g = T.last(); out.golemsCard = /The Golems/.test(g.t) && /kept four at the casing/.test(g.b) && /Two stand at the rail/.test(g.b); g.c[0].f();
      const golems = G.ents.filter((e) => e.kind === 'enemy' && e.type === 'golem' && !e.dead);
      const V = RITE43.V, near = golems.filter((e) => Math.hypot(e.x - V.cx, e.y - V.cy) < 7);
      out.four = near.length === 4 && near.filter((e) => e.state === 'chase').length === 2 && near.filter((e) => e.passive || e.state === 'passive').length === 2;
      out.hold = G.boreHold === 75 && G.boreGolems === 2 && G.journal.some((j) => /Two are coming; two stand at the rail/.test(j.text));
      const boiler = golems.find((e) => Math.hypot(e.x - V.cx, e.y - V.cy) >= 7); out.boilerIdle = !!boiler && boiler.state === 'idle';
      for (const e of near) if (e.state === 'chase') { e.hp = 0; e.dead = true; if (e.onDeath) e.onDeath(); }
      out.stage6 = f.r43 === 6 && G.boreHold === 0;
      const e = T.last(); out.enough = /"Enough\."/.test(e.t) && /knee-joint/.test(e.b) && /drinks/.test(e.b) && /purge alarm goes\. Three notes/.test(e.b) && /that is what a stranger could do/.test(e.b);
      out.stopped = near.filter((x) => !x.dead).every((x) => x.passive || x.state === 'passive') && !!boiler && boiler.state === 'idle';
      e.c[0].f(); const t = T.last(); out.tube = /speaking-tube/.test(t.t) && /"Da," says Kaelen/.test(t.b) && /Forty-one\. Forty\./.test(t.b) && /"The pumps\."/.test(t.b) && !/For Oakhaven/.test(t.b);
      t.c[0].f(); out.count = RITE43.R.count === 60 && T.heard(/Twelve men on the pumps\. The cage holds eight/);
      return out;
    });
    check(fifth.score === 1, 'SING IT DOWN: the falling fifth was hers, in her boots, and the Root let go');
    check(fifth.golemsCard && fifth.four && fifth.hold && fifth.boilerIdle, 'the Factor turns all four: two come, two stand at the rail; the boiler-room Golem is not at the casing');
    check(fifth.stage6 && fifth.enough && fifth.stopped, 'when the two fall: Kaelen kneed one and drank the other; "Enough." stops the other two where they stand; the purge alarm');
    check(fifth.tube && fifth.count, 'the speaking-tube as the book has it ("Da." … "Forty-one. Forty."; no "For Oakhaven"); Lyra: "The pumps."; sixty seconds');

    // ---- sixty seconds: Lyra takes four, the cage goes up once, your hand on a wrist buys a name, then the pour
    const count = await page.evaluate(() => {
      const out = {}, f = G.flags, R = RITE43.R, V = RITE43.V, hp0 = G.player.hp;
      const p0 = T.ent('pump0'), p7 = T.ent('pump7'), p3 = T.ent('pump3');
      window.__msgs.length = 0;
      T.at(p0.x + 0.5, p0.y + 0.5); useDeco(p0); out.start = T.heard(/You take his wrist off the handle/) && !!R.unhook;
      T.step(15, 0.1); T.at(p0.x + 3, p0.y + 3); T.step(2, 0.1); out.lost = !R.unhook && T.heard(/the handle takes it back/) && !f.r43_names;
      T.at(p0.x + 0.5, p0.y + 0.5); useDeco(p0); T.step(40, 0.1); out.name1 = f.r43_names === 1 && f.r43_named[0] === 'Edders' && T.heard(/"Edders," he says, to you, as if you had asked/) && G.ledger.some((l) => l.name === 'Edders' && /Root-vault, at the pumps/.test(l.where));
      useDeco(p0); out.again = T.heard(/Say it was Edders/) && f.r43_names === 1;
      T.at(p7.x + 0.5, p7.y + 0.5); useDeco(p7); T.step(40, 0.1); out.ring = f.r43_names === 2 && T.heard(/wedding ring and the scar through his eyebrow looks at your hand on his wrist/) && T.heard(/"Hale B\." That is all/);
      T.at(p3.x + 0.5, p3.y + 0.5); useDeco(p3); T.step(40, 0.1); out.three = f.r43_names === 3 && G.ledger.filter((l) => /at the pumps/.test(l.where)).length === 3;
      out.t = R.count; while (R.count > 19) T.step(1, 0.1);   // let the Governor count down past twenty
      out.aldric = T.heard(/Aldric, from the tube: "Forty-one\. Forty\."/) && T.heard(/Aldric: "Thirty\."/) && T.heard(/Twenty\. Get to the cage, boy/);
      out.taken = f.r43_taken === 4 && [8, 9, 10, 11].every((i) => T.ent('pump' + i).hidden) && T.heard(/Lyra takes a man off the handles by the wrist/);
      out.cage = f.r43_cage === true && T.heard(/The cage goes up: four of them, with Tobiah/) && T.ent('tobiah').hidden && T.ent('sis0').hidden;
      out.crane = !T.ent('crane') && T.heard(/Crane comes down the ladder three rungs at a time/);
      out.hpSteady = G.player.hp === hp0; out.hp = [hp0, G.player.hp, G.player.hpMax];   // the Narrow's stillness never bites during the sixty seconds
      T.at(V.cx + 1, V.cy + 1); T.step(400, 0.1);
      out.pour = f.r43 === 7 && f.greening === true && f.bore_broken === true && G.escapeTimer > 240 && G.escapeTimer <= 300;
      out.caught = G.player.hp < hp0 && G.player.hp >= 1;
      const d = T.last(); out.card = !!d && /Forty thousand gallons/.test(d.t) && /largest bell in the world being poured full of sand/.test(d.b) && /And the Root drinks/.test(d.b) && /still on the platform when it comes/.test(d.b);
      d.c[0].f(); out.journal = G.journal.some((j) => /I took 3 of them off the handles/.test(j.text)) && G.journal.some((j) => /Four hundred feet of service ladder/.test(j.text)) && T.heard(/^UP\. The service ladder/);
      out.left = Array.isArray(f.r43_left) && f.r43_left.length === 8 && f.r43_left[7] === 'Hale B.';
      out.oak = G.maps.oakhaven && /Greening/.test(G.maps.oakhaven.name);
      out.cleared = !G.ents.some((e) => e._r43 && /^(pump|guard|golem|vosk|tobiah|sis)/.test(e._r43));
      return out;
    });
    if (process.env.DEBUG) console.log('count', JSON.stringify(count));
    check(count.start && count.lost && count.name1 && count.again, 'a hand on a wrist: stepping away loses him; held for a breath he gives a name, into the ledger; asked again he only repeats it');
    check(count.ring && count.three && count.t > 0, 'the man with the ring and the scar is Hale B.; three names bought with the seconds');
    check(count.aldric && count.taken && count.cage && count.crane && count.hpSteady, 'Aldric counts; Lyra takes four by the wrist; the cage goes up once with Tobiah and the sisters; Crane comes down burning; the stillness never bites');
    check(count.pour && count.caught && count.card && count.journal && count.left && count.oak && count.cleared, 'forty thousand gallons: the Greening as game.js has it (flags, the escape clock, Oakhaven rebuilt); caught on the platform costs health; the eight left are named; the room is cleared');

    // ---- a second traveller (Phase 125b, taught): a slip at the needle is grey and the beat again, and changes nothing;
    // if the Hold runs out before the Golems fall, "Enough." comes just the same; going straight for the ladder, no names
    const soft = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      for (const k of Object.keys(f)) if (/^r43|^rite_|^bore_|^greening$|^lyra_voice_worse$|^church_come$|^rooke_drops$/.test(k)) delete f[k];
      f.coil_done = f.rite_ready = f.church_come = true; G.escapeTimer = 0; G.boreHold = 0; G.player.hp = G.player.hpMax; G.maps.oakhaven = buildOakhaven(false);
      RITE43.begin(); const ly = () => T.ent('lyra');
      let n = 0; while (f.r43 === 1 && n < 900) { T.at(ly().x + 0.3, ly().y + 1.0); T.step(1, 0.1); n++; }
      out.arrive2 = /counted 17 voices/.test(T.last().b) && /kept yours in your chest/.test(T.last().b);
      T.last().c[0].f(); T.last().c[0].f(); T.last().c[0].f(); T.last().c[0].f(); T.last().c[0].f();
      n = 0; while (BOOTS125.S.beat !== 'pinch' && n < 400) { T.step(1, 0.1); n++; }
      BOOTS125.input('use', true); T.step(30, 0.1);
      const e1 = T.last(); out.seen = /An Echo/.test(e1.t) && /slow would look wrong/.test(e1.b) && f.r43 === 3 && document.querySelector('canvas').style.filter.includes('grayscale');
      BOOTS125.input('use', false); e1.c[0].f(); out.again = f.r43 === 3 && BOOTS125.S.beat === 'pinch' && !document.querySelector('canvas').style.filter;
      await T.boots();
      out.canon = T.heard(/Am\. Fortunate\./) && f.r43 === 4;
      T.last().c[0].f(); await T.boots(); T.last().c[0].f();
      G.boreHold = 0.05; T.step(3, 0.05); out.timerEnough = f.r43 === 6 && /"Enough\."/.test(T.last().t) && !/stranger could do/.test(T.last().b);
      T.last().c[0].f(); T.last().c[0].f();
      const V = RITE43.V; T.at(V.cx + 6.5, V.cy + 3); T.step(650, 0.1);
      out.noNames = f.r43 === 7 && !f.r43_names && G.journal.some((j) => /I went for the ladder\. Eight men were left pumping/.test(j.text)) && !/still on the platform/.test(T.last().b);
      return out;
    });
    if (process.env.DEBUG) console.log('soft', JSON.stringify(soft));
    check(soft.arrive2 && soft.seen && soft.again && soft.canon, 'a slip at the needle is an Echo, shown grey, and the beat again; the book\'s needle goes through skin and "I. Am. Fortunate." holds');
    check(soft.timerEnough && soft.noNames, 'if the Hold runs out before the Golems fall, "Enough." comes just the same; going straight for the ladder: no names, eight left');

    // ---- saves mid-Rite: the stage and the staging survive a restore
    const saved = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      for (const k of Object.keys(f)) if (/^r43|^rite_|^bore_|^greening$|^lyra_voice_worse$/.test(k)) delete f[k];
      f.coil_done = f.rite_ready = f.church_come = true; G.escapeTimer = 0; G.maps.oakhaven = buildOakhaven(false);
      RITE43.begin(); const ly = () => T.ent('lyra');
      let n = 0; while (f.r43 === 1 && n < 900) { T.at(ly().x + 0.3, ly().y + 1.0); T.step(1, 0.1); n++; }
      T.last().c[0].f(); T.last().c[0].f(); T.last().c[0].f(); T.last().c[0].f();
      T.last && (() => {})();
      // through the needle to the Hold, then save and restore
      const V = RITE43.V; T.last().c[0].f(); await T.boots();   // (Phase 125b, taught) through the needle in Kaelen's boots to the Hold card
      const snap = JSON.parse(JSON.stringify(snapshotGame())); out.snapStage = snap.flags.r43 === 4;
      out.transientOut = !(snap.maps.rootvault.extra || []).some((e) => e && e.id === 'kaelen');
      restoreGame(snap); G.state = 'play'; T.step(2, 0.05);
      out.restored = f.r43 === 4 && G.mapId === 'rootvault' && !!T.ent('kaelen') && !!T.ent('lyra') && G.ents.filter((e) => e._r43 && /^pump\d+$/.test(e._r43)).length === 12 && Math.abs(T.ent('kaelen').x - V.kaelenDrum[0]) < 0.05;
      out.once = G.ents.filter((e) => e._r43 === 'kaelen').length === 1;
      return out;
    });
    check(saved.snapStage && saved.transientOut && saved.restored && saved.once, 'a save mid-Hold keeps the stage; the figures are not saved, and are staged again, once, on restore');

    // ---- the voices: every card and spoken message plays its recorded lines, in the book's order
    const vo = await page.evaluate(async () => {
      const out = {}, heard = new Set(window.__vo), wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const all = Object.values(RITE43.VO).flat().concat(RITE43.LEFT.map((n) => 'pumpman.rite.name.' + RITE43.slug(n)));
      out.missing = all.filter((id) => !VOICE_ACT.LINES[id]);
      out.unheard = ['tobiah.rite.honour', 'sister.rite.daughter', 'ignatius.rite.rubric', 'ignatius.rite.closer', 'ignatius.rite.blood', 'tobiah.rite.span',   // (Phase 125b: no ignatius.rite.notch; Crane never sees)
        'tobiah.rite.call1', 'tobiah.rite.call2', 'vosk.rite.stepaway', 'tobiah.rite.whatsthat', 'vosk.rite.enough', 'aldric_tube.rite.seal',
        'aldric_tube.rite.c41', 'aldric_tube.rite.c30', 'aldric_tube.rite.c20', 'aldric_tube.rite.c10', 'aldric_tube.rite.c5', 'aldric_tube.rite.c2', 'kaelen.rite.up',
        'pumpman.rite.name.hale-b'].filter((id) => !heard.has(id));
      out.names = [...heard].filter((id) => id.startsWith('pumpman.rite.name.')).length;
      window.__vo.length = 0; RITE43.seq(RITE43.VO.needleGood); await wait(2200); out.order = window.__vo.join(',');
      window.__vo.length = 0; RITE43.seq(RITE43.VO.tube); await wait(100); RITE43.hush(); await wait(900); out.hushed = window.__vo.length;
      const m = VOICES.mode; VOICES.setMode('off'); window.__vo.length = 0; RITE43.seq(RITE43.VO.frame); out.off = window.__vo.length; VOICES.setMode(m);
      out.fortunate = (VOICE_ACT.LINES['lyra_fortunate.rite.fortunate'] || {}).d || 0;
      return out;
    });
    check(vo.missing.length === 0 && vo.unheard.length === 0 && vo.names >= 3, 'the Rite is voiced: every card and spoken message plays its recorded lines (' + (vo.missing.concat(vo.unheard).slice(0, 3).join(', ') || 'all heard') + '); the pump-men say their names');
    check(vo.order === 'ignatius.rite.closer,ignatius.rite.blood,ignatius.rite.speak,lyra_fortunate.rite.fortunate,ignatius.rite.sheis' && vo.fortunate > 3, '"Speak, daughter." "I. Am. Fortunate." (three words held apart) "She is." in the book\'s order');   // (Phase 125b) the fallback card now opens with "Closer, Engineer" (MS 3074)
    check(vo.hushed === 1 && vo.off === 0, 'a choice hushes the lines still to come; with the Voices off nothing plays');

    // ---- French for every line
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p43-rite.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await page.evaluate(() => RITE43.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 130 && noFr.length === 0   /* (Phase 125b) fewer: the eyeline and lens strings went */ && tsv.every((r) => r.length === 2), 'every registered string has a French pair in p43-rite.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((r) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|the Narrow|Hearthday|Greening)\b/.test(r[1])), 'the French follows the glossary (le Silence, les Creux, Chantre, la Haie, Âtredi, le Verdissement)');

    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL RITE TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();

