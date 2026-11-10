// PREVIEW_URL=http://127.0.0.1:8831 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/cutter68.test.js
// Ten Heartbeats, played (Book One ch. 21; ROADMAP R9 item 20): the climb at Whisper-Grove hands startPart4 to the chase
// (the old card stays as the fallback); eleven minutes and Pennick's figures; water, canvas, tackle and chain over the
// side; like a wet sack; the cutter and its listening-horn, "We're a bell", the crates packed like glass in the hold; the
// canopy, and the ten heartbeats kept still while the cutter goes over (a sound is an Echo, then the count again); it
// comes back by the horn anyway; the gun, the grapnel, four proctors and the Aegis (or, without it, a fight at the rail,
// where dying is an Echo); "Don't cut it!" and four seconds (cutting is an Echo); the willow; the courier; the
// number-three tank and the clearing by the Mausoleum; then the Deep Woods. Variants without Bettis, Sable or the Aegis;
// a save mid-count; voices; French; no page errors.
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
    page.on('console', (m) => { if (m.type() === 'warning' && /cutter68|kestrel16|coda/.test(m.text())) errors.push(m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8831');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Cutter Tester');
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
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; update(dt || 0.05); } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        first() { const e = T.last(); if (e && e.c[0]) e.c[0].f(); },
        ent(k) { return G.ents.find((e) => e && e._c68 === k); },
        wait(ms) { return new Promise((r) => setTimeout(r, ms || 2600)); },   // a card's lines play one after another
        reset(o) {
          const f = G.flags;
          for (const k of Object.keys(f)) if (/^c68|^part4$|^sable_with$|^aegis_follow$|^bettis_kept_awake$|^sable_joined$/.test(k)) delete f[k];
          Object.assign(f, { part3: true, press_taken: true, wg_plan: true }, o || {});
          hide('#ending'); G.state = 'play'; G.escapeTimer = 0; G.dead = false; G.player.hp = G.player.hpMax;
          KESTREL16.cfg.on = true;
          loadMap('whispergrove', { x: 24.5, y: 43.4, dir: -Math.PI / 2 }); G.state = 'play';
          window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0;
        },
      };
      T.reset({ aegis_follow: true, bettis_kept_awake: true, sable_joined: true });
    });

    // ---- 1 · the climb hands off to the chase: eleven minutes, Pennick's figures, water over the side
    const load = await page.evaluate(async () => {
      const out = {};
      startPart4(); const c = T.last(); await T.wait();
      out.notOld = !window.__ev.some((e) => /Part Four — Coda/.test(e.t));
      out.card = !!c && /Eleven minutes/.test(c.t) && /They loaded in eleven minutes/.test(c.b) && /four hundred and thirty-two cores, twenty-one Oakhaven survivors, five crew, one archivist, one press at four hundredweight, one woman who could not stop screaming, and one thing that was walking up the mast-ladder/.test(c.b);
      out.talk = /Can she fly\?/.test(c.b) && /She can <i>sink slowly<\/i>/.test(c.b) && /Then she can fly/.test(c.b) && /climbing a hundred-foot ladder one-handed/.test(c.b) && /Bell Yard/.test(c.b);
      out.hetty = /Hetty Bram took it in hand/.test(c.b) && /about absolutely nothing, in the Narrow/.test(c.b);
      out.vo = ['engineer.cutter.lift', 'vane.cutter.fly', 'engineer.cutter.sink', 'vane.cutter.water', 'vane.cutter.breathe'].every((id) => window.__vo.includes(id));
      out.stage = CUTTER68.stage() === 1 && !G.flags.part4;
      T.first();
      out.deck = G.mapId === CUTTER68.DECK && CUTTER68.stage() === 2 && ['vane', 'pennick', 'tobiah', 'aegis', 'over0', 'over1', 'over2', 'over3'].every((k) => !!T.ent(k));
      out.oneVane = !G.ents.some((e) => e && e._p16k === 'crew_vane' && !e.hidden);
      const lad = G.ents.find((e) => e && e.use === 'p16k_exit'); if (lad) useDeco(lad); out.ladderShut = G.mapId === CUTTER68.DECK;
      return out;
    });
    if (process.env.DEBUG) console.log('load', JSON.stringify(load));
    check(load.notOld && load.card && load.talk && load.hetty && load.vo && load.stage, 'the climb plays ch. 21, not the old card: eleven minutes, Pennick\'s figures as the book has them, "Can she fly?", the Aegis on the ladder one-handed, Hetty with Bettis in the Narrow; voiced');
    check(load.deck && load.oneVane && load.ladderShut, 'on deck: Vane, Pennick, Tobiah, the Aegis, and the water, canvas, tackle and chain to go over the side; one Vane; the ladder is shut during the chase');

    // ---- 2 · over the side; like a wet sack; the cutter, the horn, "We're a bell"
    const over = await page.evaluate(async () => {
      const out = {};
      for (let i = 0; i < 4; i++) useDeco(T.ent('over' + i));
      out.gone = [0, 1, 2, 3].every((i) => !T.ent('over' + i) || T.ent('over' + i).hidden) && T.heard(/water goes over the side/i);
      const w = T.last(); out.sack = /went up like a wet sack/.test(w.b) && /eleven minutes past the hour/.test(w.b);
      T.first(); const c = T.last(); await T.wait();
      out.cutter = /lead-grey/.test(c.b) && /What's the trumpet for\?/.test(c.b) && /It's not a trumpet/.test(c.b) && /hear a cough on a deck/.test(c.b) && /and a woman screaming/.test(c.b) && /We're a bell/.test(c.b) && /Pack it like glass for a long haul/.test(c.b) && /"Lower\."/.test(c.b);
      out.vo = ['tobiah.cutter.trumpet', 'vane.cutter.nottrumpet', 'vane.cutter.mags', 'engineer.cutter.low', 'vane.cutter.lower'].every((id) => window.__vo.includes(id));
      T.first(); out.stage = CUTTER68.stage() === 3 && T.heard(/help Hetty pack the crates/);
      return out;
    });
    if (process.env.DEBUG) console.log('over', JSON.stringify(over));
    check(over.gone && over.sack, 'water, canvas, tackle and chain over the side; she comes off at eleven minutes past the hour and goes up like a wet sack');
    check(over.cutter && over.vo && over.stage, 'the cutter out of the south: lead-grey, the horn that is not a trumpet, a cough on a deck at a thousand yards, the woman screaming; "We\'re a bell"; pack it like glass; "Lower."');

    // ---- 3 · pack the crates in the hold, the horn's dial drops but never to nothing
    const pack = await page.evaluate(() => {
      const out = {};
      useDeco(G.ents.find((e) => e && e.use === 'p16k_down'));
      out.below = G.mapId === CUTTER68.BELOW && !!T.ent('pack0') && !!T.ent('pack1') && !!T.ent('pack2') && !!T.ent('hetty') && !!T.ent('bettis');
      const m0 = CUTTER68.murmur(); useDeco(T.ent('pack0')); out.drop = CUTTER68.murmur() < m0 && T.heard(/packed like glass/);
      useDeco(T.ent('pack1')); useDeco(T.ent('pack2'));
      out.floor = CUTTER68.murmur() > 0.2;
      const c = T.last(); out.canopy = /worst twenty minutes of Vane's professional life/.test(c.b) && /faceful of leaves twice/.test(c.b) && CUTTER68.stage() === 4;
      T.first(); out.deck = G.mapId === CUTTER68.DECK && T.heard(/went over the top of them at three hundred feet/) && T.heard(/Keep still/) && !!T.ent('willow0');
      return out;
    });
    if (process.env.DEBUG) console.log('pack', JSON.stringify(pack));
    check(pack.below && pack.drop && pack.floor, 'down the hatch with Hetty and Bettis: packing each crate drops the horn\'s dial, never to nothing (your cargo is not silent)');
    check(pack.canopy && pack.deck, 'the worst twenty minutes: down into the willow-tops at forty feet; back on deck the cutter goes over at three hundred feet: keep still');

    // ---- 4 · the ten heartbeats: a sound is an Echo; then still through ten, and it comes back by the horn anyway
    const count = await page.evaluate(() => {
      const out = {};
      window.__ev.length = 0;
      T.step(60, 0.05); out.mid = CUTTER68.R.ci >= 2 && CUTTER68.R.ci < 10;
      G.noise = 6; T.step(1, 0.05);
      const e = T.last(); out.echo = !!e && /An Echo/.test(e.t) && /hear a cough on a deck/.test(e.b) && document.querySelector('canvas').style.filter.includes('grayscale');
      e.c[0].f(); out.again = CUTTER68.R.ci === 0 && CUTTER68.stage() === 4 && !document.querySelector('canvas').style.filter.includes('grayscale');
      window.__ev.length = 0; let n = 0; while (n < 400 && !window.__ev.length) { T.step(1, 0.05); n++; }
      const c = T.last(); out.back = !!c && /lost them in the mist and came back/.test(c.b) && /the way you find a hive/.test(c.b);
      out.flag = G.flags.c68_echo_count === true;
      return out;
    });
    if (process.env.DEBUG) console.log('count', JSON.stringify(count));
    check(count.mid && count.echo && count.again, 'the ten heartbeats: make a sound and the Echo plays, grey (a man on that horn can hear a cough on a deck), then the count again from one');
    check(count.back && count.flag, 'still through ten, and it lost them in the mist and came back anyway: it found them the way you find a hive');

    // ---- 5 · the gun, the grapnel, the proctors and the Aegis; "Don't cut it!"; four seconds; the Echo of cutting
    const hook = await page.evaluate(async () => {
      const out = {};
      T.first(); const g = T.last();
      out.gun = /through the envelope's skirt/.test(g.b) && /splinter the length of a forearm through the meat of Pennick's thigh/.test(g.b) && /the grapnel came down/.test(g.b);
      T.first(); const b = T.last(); out.boarded = /Cape Dissonance in a crosswind, he had cut the hook and run/.test(b.b) && /Four proctors came down the grapnel-line/.test(b.b);
      T.first(); const a = T.last(); out.aegis = /picked him up off it and threw him over the side/.test(a.b) && /DEFEND THE SINGERS/.test(a.b) && /He had the wheel/.test(a.b);
      T.first(); const l = T.last(); await T.wait(); out.line = /"The line!"/.test(l.b) && /Don't cut it/.test(l.b) && /in four seconds/.test(l.b) && /watching his hands on the wheel for nine years/.test(l.b);
      out.vo = ['tobiah.cutter.line', 'vane.cutter.dontcut', 'vane.cutter.starboard'].every((id) => window.__vo.includes(id));
      T.first(); out.beat = CUTTER68.stage() === 6 && !!T.ent('line');
      useDeco(T.ent('line')); const e = T.last(); out.echo = /An Echo/.test(e.t) && /Vane said: don't cut it/.test(e.b);
      e.c[0].f(); out.again = /"The line!"/.test(T.last().b);
      T.first(); window.__ev.length = 0; T.step(100, 0.05);
      const w = T.last(); out.willow = !!w && /terrier tied to a cart-horse/.test(w.b) && /rose about eleven feet/.test(w.b) && /two ships falling and ours is falling slower/.test(w.b);
      return out;
    });
    if (process.env.DEBUG) console.log('hook', JSON.stringify(hook));
    check(hook.gun && hook.boarded && hook.aegis, 'the long gun (the skirt; the rail and Pennick\'s thigh), the grapnel, Cape Dissonance, four proctors down the line, and the Aegis: DEFEND THE SINGERS');
    check(hook.line && hook.vo && hook.beat && hook.echo && hook.again, '"Don\'t cut it!" and four seconds; cut the line yourself and it is an Echo, then the line again');
    check(hook.willow, 'four seconds held: the willow takes the cutter\'s bow, a terrier tied to a cart-horse; she rises eleven feet; "not a victory"');

    // ---- 6 · the courier; the number-three tank; the clearing; the Deep Woods
    const end = await page.evaluate(async () => {
      const out = {};
      T.first(); const q = T.last(); await T.wait(4000);
      out.courier = /And then the boy came/.test(q.b) && /whereistheroad/.test(q.b) && /"East," said Vane/.test(q.b) && /Don't stop/.test(q.b) && /courier Quill, J\., in transit/.test(q.b) && /the woman screaming in the hold/.test(q.b);
      out.feet = !!T.ent('feet');
      out.qvo = ['quill.cutter.road', 'vane.cutter.east', 'quill.cutter.dontstop', 'sable.cutter.file'].every((id) => window.__vo.includes(id));
      T.first(); const d = T.last();
      out.down = /number-three lift-tank/.test(d.b) && /The Mausoleum of Chords/.test(d.b) && /That one is only sad/.test(d.b) && /And one screaming/.test(d.b) && /nobody had coiled in six days/.test(d.b);
      T.first();
      out.land = G.flags.part4 === true && G.mapId === 'deepwoods' && CUTTER68.stage() === 8 && G.flags.sable_with === true;
      out.journal = G.journal.some((j) => /hunted us by sound/.test(j.text) && /willow/.test(j.text));
      out.ending = codaEndingLines().some((l) => /ten heartbeats/i.test(l) && /cutter/.test(l));
      return out;
    });
    if (process.env.DEBUG) console.log('end', JSON.stringify(end));
    check(end.courier && end.feet && end.qvo, 'the boy made of lightning: "whereistheroad", "East," said Vane, "Don\'t stop", two scorched footprints; Sable: courier Quill, J., in transit');
    check(end.down && end.land && end.journal && end.ending, 'the number-three tank weeps; down nine miles north-east by the Mausoleum of Chords ("only sad"); "And one screaming."; then the Deep Woods, and the ending remembers the chase');

    // ---- the other way: no Aegis, Bettis put back, Sable never joined; the fight at the rail, where dying is an Echo
    const alt = await page.evaluate(() => {
      const out = {};
      T.reset({ bettis_put_back: true });
      startPart4(); const c = T.last();
      out.lines = !/screaming/.test(c.b) && !/mast-ladder at that moment/.test(c.b) && /one archivist, one press at four hundredweight\./.test(c.b);
      T.first(); out.noAegis = !T.ent('aegis');
      CUTTER68.toBoarding(); T.first(); const b = T.last(); out.boarded = /Four proctors came down/.test(b.b) && /hit the deck in a crouch/.test(b.b);
      T.first(); out.fight = !!G.flags.c68_fight && G.ents.filter((e) => e && e._c68 && /^proctor/.test(e._c68) && !e.dead).length === 2;
      damagePlayer(G.player.hp + 5, 'A proctor'); const e = T.last();
      out.echo = /An Echo/.test(e.t) && G.state !== 'dead' && !G.dead && G.player.hp > 0;
      e.c[0].f(); out.again = !!G.flags.c68_fight && G.ents.filter((x) => x && x._c68 && /^proctor/.test(x._c68) && !x.dead && !x.hidden).length === 2;
      for (const x of G.ents) if (x && x._c68 && /^proctor/.test(x._c68)) { x.dead = true; x.hidden = true; }
      T.step(2, 0.05); const r = T.last(); out.rope = /go for the rope rather than the deck/.test(r.b) && !G.flags.c68_fight;
      const snap = JSON.parse(JSON.stringify(snapshotGame())); restoreGame(snap); G.state = 'play';
      out.resumed = /"The line!"/.test(T.last().b) && !G.ents.some((x) => x && x._c68 && /^proctor/.test(x._c68) && !x.hidden);
      T.first(); T.step(100, 0.05); T.first(); const q = T.last();
      out.noSable = /whereistheroad/.test(q.b) && !/courier Quill/.test(q.b) && !/screaming/.test(q.b);
      T.first(); const d = T.last(); out.down = /number-three lift-tank/.test(d.b) && !/one screaming/i.test(d.b) && !/only sad/.test(d.b);
      T.first(); out.land = G.mapId === 'deepwoods' && G.flags.part4 === true;
      return out;
    });
    if (process.env.DEBUG) console.log('alt', JSON.stringify(alt));
    check(alt.lines && alt.noAegis, 'without Bettis awake or the Aegis following, the lines change (no screaming, nothing on the mast-ladder) and nothing is missing from the scene');
    check(alt.boarded && alt.fight && alt.echo && alt.again && alt.rope && alt.resumed, 'no Aegis: two proctors on the deck to meet at the rail; dying there is an Echo, then the rail again; the third and fourth go for the rope; a load after the fight resumes at the line, not a second boarding');
    check(alt.noSable && alt.down && alt.land, 'without Sable the courier goes unexplained and the clearing has no Veil-house line; the Deep Woods as before');

    // ---- a save mid-count; the fallback card when the deck is switched off
    const save = await page.evaluate(() => {
      const out = {};
      T.reset({ aegis_follow: true });
      startPart4(); T.first(); CUTTER68.toCount();
      T.step(30, 0.05);
      const snap = JSON.parse(JSON.stringify(snapshotGame())); restoreGame(snap); G.state = 'play'; T.step(2, 0.05);
      out.saved = G.mapId === CUTTER68.DECK && CUTTER68.stage() === 4 && CUTTER68.R.ct >= 0 && CUTTER68.R.ci <= 1 && G.ents.filter((e) => e && e._c68 === 'vane').length === 1;
      G.player.hp = Math.ceil(G.player.hpMax * 0.2); window.__ev.length = 0; CUTTER68.toCount();
      let n = 0; while (n < 300 && !window.__ev.length) { T.step(1, 0.05); n++; }
      out.afraid = /came back/.test((T.last() || {}).b || ''); G.player.hp = G.player.hpMax;
      T.reset(); KESTREL16.cfg.on = false; startPart4(); const c = T.last();
      out.fallback = !!c && /Part Four — Coda: Ten Heartbeats/.test(c.t) && CUTTER68.stage() === 0;
      KESTREL16.cfg.on = true; hide('#event'); delete G.flags.part4; G.state = 'play';
      return out;
    });
    if (process.env.DEBUG) console.log('save', JSON.stringify(save));
    check(save.saved, 'a save mid-count comes back on the deck with the count started again, staged once');
    check(save.afraid, 'hurt past the fear line (your breath is loud) the count can still be kept: only what you add on top is heard');
    check(save.fallback, 'with the deck switched off the climb plays the old Ten Heartbeats card');

    // ---- voices and French
    const vo = await page.evaluate(() => ({ missing: Object.values(CUTTER68.VO).flat().filter((id) => !VOICE_ACT.LINES[id]) }));
    check(vo.missing.length === 0, 'Ten Heartbeats is voiced: every spoken book line has its recorded line (' + (vo.missing.slice(0, 3).join(', ') || 'all there') + ')');
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p68-cutter.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await page.evaluate(() => CUTTER68.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 60 && noFr.length === 0 && tsv.every((r) => r.length === 2), 'every registered string has a French pair in p68-cutter.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((r) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|the Narrow|Hearthday|Greening)\b/.test(r[1])) && texts.some((t) => /Pennick/.test(t)), 'the French follows the glossary; ch. 21 names the engineer Pennick, as the book does');

    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL CUTTER TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
