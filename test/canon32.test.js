// PREVIEW_URL=http://127.0.0.1:4074 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/canon32.test.js
// The canon pass (owner's ruling, 28 Oct: "match any inconsistency to the book"). Bettis Renn is Ivo's wife, as in Book One
// ch. 14 and 18, and the brainstorm's text-level contradictions (section 5) follow the manuscript.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

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
    await page.locator('#cname').fill('Canon Tester');
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
    });

    // ---- Bettis Renn: Ivo's wife, in the Malting yard with her basket; put back or carried to the Kestrel
    const bettis = await page.evaluate(() => {
      const out = {}, f = G.flags;
      loadMap('malting'); G.state = 'play';
      const e = G.ents.find((o) => o.id === 'bettis');
      out.npc = NPCS.bettis.portrait === 'townswoman' && /basket/.test(NPCS.bettis.name) && /go second/.test(NPCS.bettis.greet.normal);
      out.voice = VOICES.PEOPLE.bettis.f0 >= 180;
      f.sable_joined = false; window.__msgs.length = 0; talkBettis(e);
      out.hollow = window.__msgs.some((t) => /Hollow woman/.test(t) && /WG-40,102/.test(t) && !/PRESSED TWICE/.test(t));
      f.sable_joined = true; window.__ev.length = 0; talkBettis(e);
      const ev = window.__ev[0];
      out.first = !!ev && /A woman of about forty/.test(ev.b) && /coat over her arm/.test(ev.b) && /does not like to break a pair/.test(ev.b) && !/name, please|PRESSED TWICE|\bhis\b/.test(ev.b);
      ev.c[0].f();
      const wake = window.__ev[1];
      out.wake = !!wake && /Wife of Ivo Renn, cooper, of Ashlane/.test(wake.b) && /She asked to go second/.test(wake.b) && /put it back, put it back/.test(wake.b) && /third stack, he is whole/.test(wake.b);
      out.choices = wake.c.map((c) => c.t).join(' | ');
      wake.c[1].f();
      out.kept = f.bettis_kept_awake && e.hidden && G.journal.some((j) => /to her husband in the third stack/.test(j.text));
      loadMap('malting'); G.state = 'play';
      out.staysGone = G.ents.find((o) => o.id === 'bettis').hidden === true;
      delete f.bettis_kept_awake; delete f.bettis_awake;
      return out;
    });
    check(bettis.npc && bettis.voice && bettis.hollow, 'Bettis Renn is a Hollow woman with a basket, tag WG-40,102; "...I will go second..."; a woman\'s voice');
    check(bettis.first && bettis.wake, 'Sable puts her back as in ch. 18: the entry read aloud, the screaming, "put it back", "your husband is in the third stack" (' + bettis.choices + ')');
    check(bettis.kept && bettis.staysGone, 'kept awake, she is carried to the Kestrel, to Ivo in the third stack, and is not in the Malting after');

    // ---- the brainstorm's text-level contradictions, each to the book
    const text = await page.evaluate(() => {
      const out = {};
      const q = NPCS.quist.quest(G); const show = q && q.choices && q.choices.find((c) => /pressing/.test(c.t));
      out.form9 = !!show && /Name\. Age\. Trade\./.test(show.f(G)) ;
      out.tam = /Tammy/.test(NPCS.tam.topics['The Flume']) && /old king went into the glass/.test(NPCS.tam.topics['The Flume']) && !/sluice/.test(NPCS.tam.topics['The Flume']);
      out.hollow = /The Hollow behind the tannery is to be burned/.test(JSON.stringify(NPCS.ignatius.topics)) && !/Hollow in the quarry/.test(JSON.stringify(NPCS.ignatius.topics));
      out.herald = /shake the entire time/.test(NPCS.herald.greet.normal);
      out.camp = /twenty-six souls/.test(NPCS.sable_dw.greet.polite);
      out.linnet = NPCS.wren_dw.name === 'Linnet';
      out.pool = !NAMES_POOL.some((n) => ['Tamsin Reed', 'Corwin Aye', 'Mirren Salk'].includes(n));
      // the bells: Tamsin Reed alone speaks of the blue jug; every other bell keeps its own last things
      out.tamsin = /blue jug, Mam/.test(coreMurmur({ name: 'Tamsin Reed' }));
      out.others = NAMES_POOL.every((n) => !/blue jug/.test(coreMurmur({ name: n })) && coreMurmur({ name: n }).indexOf(n.split(' ')[0].toLowerCase()) >= 0);
      out.varied = new Set(NAMES_POOL.map((n) => coreMurmur({ name: n }).replace(/^\.\.\.[a-z]+\.\.\. /, ''))).size >= 4;
      return out;
    });
    check(text.form9, 'Quist\'s three questions are Form 9\'s: name, age, trade');
    check(text.tam, 'Tam\'s Essa died of the pox forty years ago, and called him Tammy');
    check(text.hollow, 'Ignatius\'s warrant burns the Hollow behind the tannery, not "the Hollow in the quarry"');
    check(text.herald && text.camp && text.linnet, 'the herald\'s hands shake; the Deep Woods camp is twenty-six souls; the hush-gift child is Linnet, not Wren');
    check(text.pool && text.tamsin && text.others && text.varied, 'the blue jug is Tamsin Reed\'s alone; Corwin Aye and Mirren Salk are not Legionnaires; each bell murmurs its own last things');

    const src2 = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
    const js = ['js/game.js', 'js/grove.js', 'js/data.js', 'js/sidequests.js', 'js/maps.js', 'js/dreams.js'].map(src2).join('\n');
    check(/Forty-one\. Forty\./.test(js) && !/three\. Two\. For Oakhaven/.test(js), 'Aldric counts sixty seconds, "Forty-one. Forty.", not "three, two, for Oakhaven"');
    check(/Emory Wain\. Twenty-six\. Of Cooper\\'s Rise/.test(js) && !/Ansel Grey/.test(js), 'Sable stops the proctor by reading Emory Wain\'s surrendered name');
    check(/Madders on Nullday/.test(js) && !/Madders on Massday/.test(js) && !/Essa, in the Cascade year/.test(js), 'the Madder girl is born on Nullday; the bees are told Essa died the year the old king went into the glass');
    check(/Nobody searches the supervising engineer/.test(js) && !/searches me at the casing/.test(js), 'Kaelen\'s coil goes in your bag by choice: nobody searches the supervising engineer\'s toolbag');
    check(!/Corwin Aye' \}\)/.test(js) && !/blue jug on the sill/.test(js), 'the quarry barracks Legionnaire is not Corwin Aye; the pump Hollow does not borrow the blue jug');

    // ---- the talking crates are in the Kestrel's hold, not Hetty's cellar (ch. 4, 8)
    const crates = await page.evaluate(() => {
      const out = {}, f = G.flags;
      const tav = G.maps.tavern.entities.filter((e) => e.use === 'crates');
      const oak = G.maps.oakhaven.entities.filter((e) => e.use === 'crates');
      out.where = tav.length === 0 && oak.length === 1 && /mast-ladder/.test(oak[0].label);
      out.hetty = /ship\'s hold, at the mast/.test(NPCS.hetty.topics['The Drift-Kestrel']);
      delete f.hetty_crates; const q = NPCS.hetty.quest(G); out.ask = /mast-ladder/.test(q.text) && /hold/.test(q.journal[1]);
      window.__ev.length = 0; delete f.crates_heard; useDeco(oak[0]);
      const ev = window.__ev[0]; out.event = !!ev && ev.t === 'The crates in the hold' && /twelve crates, lashed/.test(ev.b) && /Annet Sowerby/.test(ev.b);
      out.ledger = G.ledger.some((r) => r.name === 'Annet Sowerby' && r.where === 'the Kestrel\'s hold');
      f.greening = true; window.__ev.length = 0; window.__msgs.length = 0; useDeco(oak[0]); out.gone = window.__ev.length === 0 && window.__msgs.some((t) => /Not now/.test(t)); delete f.greening;
      return out;
    });
    check(crates.where && crates.hetty && crates.ask, 'the crates are in the Kestrel\'s hold at the mast; Hetty hears them taking his supper up the mast-ladder');
    check(crates.event && crates.ledger && crates.gone, 'you listen at them from the mast-ladder; the names go in the ledger "from the Kestrel\'s hold"; after the Greening the ladder is not for climbing');

    // ---- French for every new line
    const tsv = ['tools/i18n/p32-canon.tsv', 'tools/i18n/p33-crates.tsv'].map(src).join('\n').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const fr = JSON.parse(src('locales/story/fr.json'));
    const { hash, norm } = require(path.join(ROOT, 'tools/i18n/lib'));
    const pats = new Set((fr.p || []).map((p) => p[0]));
    const missing = tsv.filter(([en]) => !(fr.s[hash(norm(en))] || pats.has(norm(en))));
    check(tsv.length >= 78 && tsv.every((r) => r.length === 2) && !missing.length, 'every changed line has its French (' + missing.length + ' missing)');

    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally { await browser.close(); }
  console.log(fails ? fails + ' FAILED' : 'ALL CANON PASS TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
