// PREVIEW_URL=http://127.0.0.1:8832 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/bell69.test.js
// The Prologue, "The Cracked Bell", played as an extra (js/bell69.js; Book One, Prologue; ROADMAP R9 #23).
//   registration with EXTRAS17 (its own tag, not "after Book One"); the start (Solenne Aubade in the choir-loft, the
//   Catechism, the three hundredth sunrise); the loft (thirty-nine voices, Ilse's pallet, trying to speak); the Foundry
//   floor and its sights in the book's words; her place on the top tier; the Morning Swell ("One note." "One law." "One
//   hand."); listening while the chord comes closer; the question; "Hold the note."; stepping off the risers is an Echo;
//   the light; the engineer at the conduit; "Dissonance!"; the gallery and "Look at me"; the wound; the mouth that sings
//   her note back; finish. A save mid-scene; the voices; French; the Book One game byte-identical after; no page errors.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));
const SHOT = process.env.SHOT || '';

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: SHOT ? 2 : 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /bell69|extras17/.test(m.text())) errors.push(m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8832');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && !document.querySelector('#loading')?.classList.contains('on'));
    const E = (f, a) => page.evaluate(f, a);

    // ---- registration, before any game
    const reg = await E(() => { const x = EXTRAS17.list().find((r) => r.id === 'crackedbell'); return x ? { title: x.title, tag: x.tag, blurb: x.blurb, start: typeof x.start } : null; });
    check(reg && reg.title === 'The Cracked Bell' && reg.tag === 'The Prologue of Book One' && reg.start === 'function', 'registered with EXTRAS17 as "The Cracked Bell", tagged "The Prologue of Book One"');
    check(await E(() => typeof BELL69 !== 'undefined' && !BELL69.active() && !Object.keys(buildAllMaps()).some((k) => /^b69_/.test(k))), 'inert at the title: not active, and buildAllMaps() builds no Foundry');
    const menu = await E(() => {
      EXTRAS17.state.ack = 1; EXTRAS17.state.done = 1; EXTRAS17.render();
      const c = document.querySelector('#modal-panel .x17-card[data-extra="crackedbell"]');
      const r = c ? { tag: c.querySelector('.x17-tag').textContent, play: !!c.querySelector('#x17-play-crackedbell') } : null;
      closeModal(); EXTRAS17.state.done = 0; return r;
    });
    check(menu && menu.tag === 'The Prologue of Book One' && menu.play, 'its card in the Extras menu carries its own tag, not "An extra — after Book One"');

    // ---- a Book One game, and its saves, before the extra
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Bell Tester');
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
    const before = await E(() => {
      G.flags.kaelen_met = true; G.state = 'panel';
      SLOTS[0] = JSON.parse(JSON.stringify(snapshotGame()));
      const keep = (k, v) => (/^p7t_[gr]ms$/.test(k) ? undefined : v);
      window.__book = () => JSON.stringify({ slots: SLOTS, flags: G.flags, journal: G.journal, ledger: G.ledger, map: G.mapId, name: G.player.name, day: G.day }, keep);
      return window.__book();
    });

    await E(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { if (G.state !== 'play') break; G.keys = {}; update(dt || 0.05); } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        idx(re) { return window.__msgs.findIndex((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        pick(re) { const e = T.last(); const c = e && e.c.find((x) => re.test(x.t)); if (c) { window.__ev.push({ t: '(picked)', b: '', c: [] }); c.f(); } return !!c; },
        first() { const e = T.last(); if (e && e.c[0]) { window.__ev.push({ t: '(picked)', b: '', c: [] }); e.c[0].f(); } },
        at(x, y, dir) { const c = Engine.cam; c.x = x; c.y = y; if (dir != null) c.dir = dir; },
        ent(k) { return G.ents.find((e) => e && e._b69 === k); },
        walk(x, y, n) { const c = Engine.cam, x0 = c.x, y0 = c.y; n = n || 30; for (let i = 1; i <= n; i++) { if (G.state !== 'play') break; c.x = x0 + (x - x0) * i / n; c.y = y0 + (y - y0) * i / n; c.dir = Math.atan2(y - y0, x - x0); G.keys = {}; update(0.05); } },
      };
    });

    // ---- the start: Solenne Aubade, in the choir-loft, the three hundredth morning
    const st = await E(() => {
      EXTRAS17.state.done = 1;
      const r = EXTRAS17.start('crackedbell');
      const ban = document.getElementById('x17-banner'), c = T.last();
      return { r, inx: EXTRAS17.inExtra(), x17: G.flags.p17x_on, slots: SLOTS.every((x) => x === null), banner: ban && !ban.hidden ? ban.textContent : '',
        name: G.player.name, map: G.mapId, voice: G.player.voice, card: c && { t: c.t, b: c.b, n: c.c.length }, journal: G.journal.map((j) => j.text), active: BELL69.active(), stage: BELL69.stage() };
    });
    if (process.env.DEBUG) console.log('start', JSON.stringify(st).slice(0, 900));
    check(st.r === true && st.inx === 'crackedbell' && st.x17 === 1 && st.slots && st.active, 'EXTRAS17.start(\'crackedbell\') runs the Prologue in its own session (Book One slots put aside)');
    check(/The Prologue of Book One/.test(st.banner) && /The Cracked Bell/.test(st.banner) && !/after Book One/.test(st.banner), 'the banner says "The Prologue of Book One · The Cracked Bell", not "after Book One"');
    check(st.name === 'Solenne Aubade' && st.map === 'b69_loft' && st.stage === 1 && st.voice === 0, 'you are Solenne Aubade, in the choir-loft [PROPOSED: the player is Solenne]');
    check(st.card && /The Cracked Bell/.test(st.card.t) && /What is sin\?/.test(st.card.b) && /The second note\./.test(st.card.b) && /Siphon Foundry at the foot of the Dawning Spire/.test(st.card.b) && /412 SR/.test(st.card.b) && /woke already singing/.test(st.card.b) && /the way a groom tells a horse the bit will stop hurting/.test(st.card.b) && /But she no longer had to try\./.test(st.card.b), 'the opening card is the book\'s: the Catechism, Sol-Luminary, 412 SR, "woke already singing", the groom and the bit');
    check(st.journal.length === 1, 'a fresh logbook with one line');

    // ---- 1 · the loft: thirty-nine voices, Ilse's pallet, trying to speak
    const loft = await E(() => {
      const out = {};
      T.first(); out.hint = T.heard(/Count the voices/);
      const P = BELL69.PALLETS;
      out.girls = G.ents.filter((e) => e._b69 && e.sprite === 'b69_pallet_girl').length;
      out.empty = G.ents.filter((e) => e._b69 && e.sprite === 'b69_pallet').length;
      for (let i = 0; i < P.length; i++) { T.at(P[i][0], P[i][1] + (P[i][1] < 6 ? 1.0 : -1.0)); T.step(1); }
      out.count = BELL69.fint('b69_count'); out.counted = T.heard(/Thirty-nine\. There were supposed to be forty\./);
      window.__ev.length = 0; useDeco(T.ent('pallet' + BELL69.ILSE)); const c = T.last();
      out.ilse = !!c && /Ilse/.test(c.t) && /two hundred and eleventh morning/.test(c.b) && /closes over a dropped stone/.test(c.b) && /sounded like a hive/.test(c.b) && BELL69.fint('b69_ilse') === 1;
      T.first();
      window.__ev.length = 0; window.__msgs.length = 0; castSong('root'); const sp = T.last();
      out.speak = !!sp && /like a flower in a book/.test(sp.b) && /I love you/.test(sp.b) && /Her mouth had said one\./.test(sp.b) && G.player.voice === 0;
      T.first(); window.__ev.length = 0; castSong('root'); out.again = window.__ev.length === 0 && T.heard(/Five hundred and twenty-eight/);
      G.state = 'panel'; renderRest(); out.rest = G.state === 'play' && T.heard(/three hundredth morning/);
      return out;
    });
    if (process.env.DEBUG) console.log('loft', JSON.stringify(loft));
    check(loft.hint && loft.girls === 38 && loft.empty === 2, 'the loft: forty pallets, thirty-eight girls asleep and humming, Ilse\'s pallet and your own empty');
    check(loft.count === 39 && loft.counted, 'walk the pallets and count: "Thirty-nine. There were supposed to be forty."');
    check(loft.ilse, 'Ilse\'s pallet: "the line had closed over the gap the way water closes over a dropped stone"; the loft like a hive');
    check(loft.speak && loft.again && loft.rest, 'the Song key is trying to speak: the book\'s paragraph ("Her mouth had said one."), then only the note; no resting');

    // ---- 2 · the Foundry floor and its sights
    const floor = await E(() => {
      const out = {};
      window.__ev.length = 0; transfer(G.map.get(13, 6).portal);
      const c = T.last(); out.map = G.mapId === 'b69_foundry' && BELL69.stage() === 2;
      out.card = !!c && /The Siphon Foundry/.test(c.t) && /the way a scab grows around a nail/.test(c.b) && /There was no roof in the world high enough/.test(c.b);
      T.first(); out.hint = T.heard(/top tier, at Coralie's right hand/);
      const lookAt = (k, re, choice) => { window.__ev.length = 0; useDeco(T.ent(k)); const e = T.last(); const ok = !!e && re.every((r) => r.test(e.b)); if (choice) T.pick(choice); else T.first(); return ok; };
      window.__vo.length = 0;
      out.spire = (() => { window.__ev.length = 0; BELL69.look({ _sight: 'spire' }); const e = T.last(); T.first(); return !!e && /white of a clean bone/.test(e.b) && /It sounds tired\./.test(e.b); })();
      out.bore = lookAt('bore', [/thirty storeys of black iron and runework/, /crown of glass teeth/]);
      out.glass = lookAt('glass0', [/the blue at the very bottom of a flame/, /It came in pulses\./, /Like something with a heartbeat\./]);
      out.choir = lookAt('girl0', [/hold the note still/, /the way a patient stands still for a surgeon/, /You are the hand that steadies the patient/]);
      out.choirVo = window.__vo.includes('ignatius.bell.patient');
      out.censer = lookAt('crane', [/a face like a statue someone had loved too hard/, /He believed\./]);
      out.gallery = lookAt('sera', [/Seraphina was sixteen/, /Look at me\./], /Look at me/) && T.heard(/^And every morning her sister did not\.$/) && BELL69.fint('b69_signs') === 1;
      out.eng = lookAt('eng', [/There was one other note in the Foundry/, /A note like wet earth/, /only one who ever flinched/]);
      out.seen = BELL69.fint('b69_seen');
      out.coralie = (() => { const e = T.ent('girl7'); return !!e && e.label === 'Coralie' && Math.abs(e.x - (BELL69.SPOT.x + 1)) < 0.01 && Math.abs(e.y - BELL69.SPOT.y) < 0.01; })();
      window.__msgs.length = 0; const eng = T.ent('eng'); T.at(eng.x - 2, eng.y + 3); T.step(3); out.hum = T.heard(/So low it was nearly under the floor/);
      // the far look: E at something across the floor
      window.__ev.length = 0; T.at(13.0, 13.5, -Math.PI / 2); Engine.render(G.ents, G.tod); interact(); const far = T.last(); out.far = !!far; if (far) T.first();
      return out;
    });
    if (process.env.DEBUG) console.log('floor', JSON.stringify(floor));
    check(floor.map && floor.card && floor.hint, 'down the stair to the Foundry floor: "the way a scab grows around a nail", the open roof');
    check(floor.spire && floor.bore && floor.glass && floor.choir && floor.choirVo, 'the sights in the book\'s words: the Spire ("It sounds tired."), the Carrow Bore, the glass ("It came in pulses."), the choir\'s work and Ignatius\'s first morning (voiced)');
    check(floor.censer && floor.gallery && floor.eng && floor.seen === 127, 'the censer, the gallery and Seraphina (your hands: "Look at me." And every morning her sister did not), the engineer and his note');
    check(floor.coralie && floor.hum && floor.far, 'Coralie at your left shoulder; his hum near the gantry; E looks across the floor');

    // ---- 3 · her place, and the Morning Swell
    const swell = await E(() => {
      const out = {};
      window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0;
      T.walk(BELL69.SPOT.x, BELL69.SPOT.y + 0.4, 20); T.step(2);
      const c = T.last(); out.stage = BELL69.stage() === 3;
      out.dawn = !!c && /The three hundredth sunrise/.test(c.t) && /"Today," said Inquisitor Ignatius, "the bore reaches the casing\."/.test(c.b) && /with his fork in his fist/.test(c.b) && window.__vo.includes('ignatius.bell.today');
      T.pick(/Look at me/); out.hands = T.heard(/her sister did not/) && BELL69.fint('b69_signs') === 2;
      let n = 0; while (n++ < 600 && !T.last().t.includes('Morning Swell')) T.step(1, 0.1);
      out.order = [/Three hundred sunrises/, /^The chain creaked\.$/, /^"One law\."$/, /^Creak\.$/, /^"One hand\."$/, /the only word it had, which was the note/].map((r) => T.idx(r));
      out.vo = ['ignatius.bell.sunrises', 'ignatius.bell.onelaw', 'ignatius.bell.onehand'].every((id) => window.__vo.includes(id));
      const sw = T.last(); out.swell = /Thirty-nine voices rose on the one pitch/.test(sw.b) && /and the Spire bled/.test(sw.b) && /its chord changed/.test(sw.b) && window.__vo.includes('tuningman.bell.match');
      T.pick(/Listen/); out.hint = T.heard(/Stand still/);
      // moving does not bring it closer; standing still does
      const c0 = Engine.cam; for (let i = 0; i < 40; i++) { c0.x = BELL69.SPOT.x + (i % 2 ? 0.3 : -0.3); T.step(1, 0.1); }
      out.moved = BELL69.R.ear < 0.05; c0.x = BELL69.SPOT.x;
      n = 0; while (n++ < 400 && !/And it asked/.test(T.last().t)) T.step(1, 0.1);
      out.closer = T.heard(/It grew closer/) && T.heard(/it was listening/) && T.heard(/Holding it for it/);
      const a = T.last(); out.asked = /Is it time\?/.test(a.b) && /are you singing it for me\?/.test(a.b) && /it had calluses/.test(a.b);
      return out;
    });
    if (process.env.DEBUG) console.log('swell', JSON.stringify(swell));
    check(swell.stage && swell.dawn && swell.hands, 'your place on the top tier: "Today ... the bore reaches the casing." Under the hem, "Look at me", and every morning her sister did not');
    check(swell.order.every((i, k, a) => i >= 0 && (k === 0 || i > a[k - 1])) && swell.vo, '"Three hundred sunrises ... One note." The chain creaked. "One law." Creak. "One hand." And the Foundry answered, in the book\'s order, voiced');
    check(swell.swell && swell.hint && swell.moved && swell.closer && swell.asked, 'the Morning Swell; listen, standing still (moving does not bring it closer): it grew closer, it was listening; "Is it time?"');

    // ---- a save mid-Swell, restored: the same beat, staged once
    const saved = await E(() => {
      const b = BELL69.beat(), snap = JSON.parse(JSON.stringify(snapshotGame()));
      restoreGame(snap); G.state = 'play'; T.step(2);
      const girls = G.ents.filter((e) => e._b69 === 'girl0').length;
      return { b, b2: BELL69.beat(), stage: BELL69.stage(), map: G.mapId, girls, at: Math.hypot(Engine.cam.x - BELL69.SPOT.x, Engine.cam.y - BELL69.SPOT.y), card: /And it asked/.test(T.last().t), inx: EXTRAS17.inExtra() };
    });
    if (process.env.DEBUG) console.log('saved', JSON.stringify(saved));
    check(saved.stage === 3 && saved.b2 === saved.b && saved.map === 'b69_foundry' && saved.girls === 1 && saved.at < 0.01 && saved.card && saved.inx === 'crackedbell', 'a save mid-Swell restores to the same beat, in your place, the choir staged once, still inside the extra');

    // ---- step off the risers: an Echo, and back in your place
    const echo = await E(() => {
      const out = {};
      T.first(); T.step(1); const f = T.last(); out.fork = /tuning fork fell out of his hand/.test(f.b) && /a clean, bright, useless note/.test(f.b) && /Stop the bore\./.test(f.b) && /"Hold the note," he said\./.test(f.b) && /And they held it\./.test(f.b);
      out.forkVo = window.__vo.includes('kaelen_foundry.bell.stop');
      T.pick(/Hold the note/);
      window.__ev.length = 0; T.at(BELL69.SPOT.x - 3, BELL69.SPOT.y + 3); T.step(1);
      const e = T.last(); out.echo = !!e && /An Echo/.test(e.t) && /No girl of the choir ever stepped down off the risers/.test(e.b) && document.querySelector('canvas').style.filter.includes('grayscale') && BELL69.fint('b69_echoes') === 1;
      T.first(); out.back = Math.hypot(Engine.cam.x - BELL69.SPOT.x, Engine.cam.y - BELL69.SPOT.y) < 0.01 && !document.querySelector('canvas').style.filter.includes('grayscale');
      T.step(1); const l = T.last(); out.again = !!l && /It let go/.test(l.t); out.letgo = /It let go/.test(l.t) && /for the first time in ten thousand years/.test(l.b) && /It believed them\./.test(l.b);
      T.first(); T.step(1); out.stage4 = BELL69.stage() === 4;
      return out;
    });
    if (process.env.DEBUG) console.log('echo', JSON.stringify(echo));
    check(echo.fork && echo.forkVo, 'the fork falls; "Stop the bore." "Hold the note," he said. And they held it (voiced; your only choice is the one the wire gives)');
    check(echo.echo && echo.back && echo.again, 'stepping down off the risers is an Echo, grey ("No girl of the choir ever stepped down off the risers"), and you are back in your place, and it goes on from the same moment');
    check(echo.letgo && echo.stage4, '"It believed them. It let go."');

    // ---- 4 · the light
    const light = await E(() => {
      const out = {};
      const s = T.last(); out.silence = /The chord stopped/.test(s.t) && /Solenne had never heard silence before/.test(s.b);
      T.first();
      let n = 0; while (n++ < 600 && !/It took everything back/.test(T.last().t)) T.step(1, 0.1);
      out.order = [/^Then the light came down the Spire\.$/, /the way water comes when a dam goes/, /^Where it touched, it took\.$/, /The iron tankers went first/, /his hands go white/].map((r) => T.idx(r));
      out.white = BELL69.R.white > 0.2;
      out.tankers = [0, 1, 2].every((i) => T.ent('tanker' + i).hidden) && T.ent('tuning2').hidden;
      T.first(); T.step(1); const r = T.last(); out.risers = /It went into Hesper's mouth like a hand into a glove/.test(r.b) && /little Coralie, fifteen/.test(r.b);
      T.first(); T.step(1); const e = T.last(); out.eng = /through the white she saw the engineer/.test(e.b) && /three gantry boys/.test(e.b) && /like something stopped in amber/.test(e.b) && /I'll never hear that again/.test(e.b);
      out.named = ['girl5', 'girl7', 'girl9'].every((k) => T.ent(k).hidden);
      T.first(); T.step(1); const eg = T.ent('eng'); out.conduit = eg.sprite === 'b69_engineer_glass' && Math.hypot(eg.x - 25, eg.y - 25) < 0.1 && [0, 1, 2].every((i) => T.ent('boy' + i).hidden);
      const d = T.last(); out.diss = /Dissonance!/.test(d.b) && /Purify them! Purify the Rite!/.test(d.b) && /the Flambeaux lifted their staves/.test(d.b) && window.__vo.includes('ignatius.bell.dissonance');
      window.__msgs.length = 0; T.first(); out.lookHint = T.heard(/looked up at the gallery/);
      // turn to face the gallery
      const c = Engine.cam; c.dir = Math.atan2(BELL69.GALLERY.y - c.y, BELL69.GALLERY.x - c.x); T.step(2);
      const g = T.last(); out.sister = /Her sister was there/.test(g.t) && /parted around her like a river around a stone/.test(g.b) && /Her hands did not open\./.test(g.b);
      out.rail = !G.map.get(13, 19) && T.ent('canon').hidden && T.ent('sera').sprite === 'b69_seraphina_blade';
      T.pick(/Look at me/); out.fire = T.heard(/said Solenne's hands, and the fire took the risers/) && BELL69.stage() === 5 && BELL69.fint('b69_signs') === 3;
      return out;
    });
    if (process.env.DEBUG) console.log('light', JSON.stringify(light));
    check(light.silence && light.order.every((i, k, a) => i >= 0 && (k === 0 || i > a[k - 1])) && light.white && light.tankers, 'the chord stops; the light comes down the Spire; where it touched, it took: the tankers go, and the Tuning Man\'s hands');
    check(light.risers && light.eng && light.named && light.conduit, 'it comes for the throats first (Hesper, Aude, Coralie); the engineer at the conduit with the three gantry boys, the arm in the glass');
    check(light.diss && light.lookHint && light.sister && light.rail && light.fire, '"Dissonance!"; look up at the gallery: her sister there, the rail and the Canon taken, her hands on the hilt; "Look at me", and the fire took the risers');

    // ---- 5 · the wound, and the mouth
    const wound = await E(() => {
      const out = {};
      let n = 0; while (n++ < 100 && !/The wound/.test(T.last().t)) T.step(1, 0.1);
      const w = T.last(); out.wound = /off the top tier, over the glass channels/.test(w.b) && /nothing goes back willingly/.test(w.b) && /She fell\./.test(w.b) && BELL69.R.black > 0.9;
      T.first(); n = 0; while (n++ < 600 && !/Something opened/.test(T.last().t)) T.step(1, 0.1);
      out.order = [/She fell for a long time/, /the wire in her throat went on singing/, /The last note in the world\./, /nothing but the note/].map((r) => T.idx(r));
      const m = T.last(); out.mouth = /far below her, patiently, something opened/.test(m.b) && /the way a child repeats the first word it has ever been taught/.test(m.b);
      return out;
    });
    if (process.env.DEBUG) console.log('wound', JSON.stringify(wound));
    check(wound.wound && wound.order.every((i, k, a) => i >= 0 && (k === 0 || i > a[k - 1])) && wound.mouth, 'thrown back into the wound; the fall, the wire singing, "The last note in the world."; something opened, and sang her note back');

    // ---- finish: back to the Extras menu, the Book One game exactly as it was
    const fin = await E(() => {
      T.pick(/end of the Prologue/);
      return { inx: EXTRAS17.inExtra(), state: G.state, res: EXTRAS17.state.res.crackedbell || '', active: BELL69.active(), book: window.__book(), maps: Object.keys(G.maps).filter((k) => /^b69_/.test(k)).length, filter: document.querySelector('canvas').style.filter };
    });
    if (process.env.DEBUG) console.log('fin', JSON.stringify(fin).slice(0, 400));
    check(fin.inx === null && fin.state === 'title' && /sang it back/.test(fin.res) && !fin.active && fin.maps === 0 && !/grayscale/.test(fin.filter), 'the end of the Prologue: EXTRAS17.finish, back on the title with its result on the card');
    check(fin.book === before, 'the Book One game (slots, flags, logbook, ledger, place, name) is byte-identical after the extra: no Book One flag was written');
    const inert = await E(() => {
      restoreGame(JSON.parse(JSON.stringify(SLOTS[0]))); G.state = 'play';
      const p = G.player; p.voice = p.voiceMax; G.song.t = 0; window.__ev.length = 0; castSong('root'); const spent = p.voiceMax - p.voice; G.song.t = 0;
      return { spent, ev: window.__ev.length, maps: Object.keys(buildAllMaps()).some((k) => /^b69_/.test(k)), map: G.mapId, flags: Object.keys(G.flags).filter((k) => /^b69/.test(k)) };
    });
    check(inert.spent > 0 && inert.ev === 0 && !inert.maps && inert.map === 'oakhaven' && inert.flags.length === 0, 'after the extra the Book One slot loads and every wrapper is inert: Songs are sung, no Foundry is built');
    // the modules that stand down in an extra see this one too
    check(['boar48', 'meadow49', 'days35'].every((f) => /\^\(cantabile\|p17\|b69_\)/.test(src('js/' + f + '.js'))) && ['lyra51', 'church55', 'tamsin52', 'audit54', 'manifest53'].every((f) => /EXTRAS17\.inExtra\(\)/.test(src('js/' + f + '.js'))), 'the Book One modules that stand down in an extra stand down in this one (inExtra(), and the map-id fallback names b69_)');

    // ---- voices and French
    const vo = await E(() => ({ missing: Object.values(BELL69.VO).flat().filter((id) => !VOICE_ACT.LINES[id]), speakers: [...new Set(Object.values(BELL69.VO).flat().map((id) => VOICE_ACT.LINES[id] && VOICE_ACT.LINES[id].speaker))] }));
    const cast = src('tools/voices/cast.py');
    check(vo.missing.length === 0 && vo.speakers.every((s) => s && new RegExp("'" + s + "'\\s*:").test(cast)), 'every spoken line of the Prologue is recorded, by a speaker in cast.py (' + (vo.missing.slice(0, 3).join(', ') || vo.speakers.join(', ')) + ')');
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p69-bell.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await E(() => BELL69.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 150 && noFr.length === 0 && tsv.every((r) => r.length === 2 && r[1].trim()), 'every registered string has a French pair in p69-bell.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((r) => /\b(Le Hush|les Hollows|Cantor\b|the Reach|the Light|Pure Note)\b/.test(r[1])) && tsv.some((r) => /la Note pure/.test(r[1])) && tsv.some((r) => /les Confins/.test(r[1])), 'the French follows the glossary (la Note pure, les Confins)');

    console.log('errors', JSON.stringify(errors.slice(0, 3)));
    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
    void before; void src; void hash; void norm;
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL BELL TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
