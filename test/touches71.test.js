// PREVIEW_URL=http://127.0.0.1:8834 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/touches71.test.js
// Small canon touches I (js/touches71.js; R9 #25 a, k, n, o, q; Book One): Hymn 9's real words when the Aegis is sung
// down; "Dissonant: self-inflicted. No further action." in the Gazette after Davin, Tam and Ada; the dead Queen's decree
// on the well-house, renewed each day; Vane's "Forty-eight." to the hold at night; OK-114 on the Kestrel's bow, up close.
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
    page.on('console', (m) => { if (m.type() === 'warning' && /touches71/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8834');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof TOUCHES71 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Touches Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0; },
        at(d, h) { G.day = d; G.tod = h / 24; },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        idx(s) { return window.__msgs.findIndex((t) => t.includes(s)); },
        stand(x, y) { Engine.cam.x = x; Engine.cam.y = y; },
        find(use) { return G.ents.find((e) => e && e.use === use && !e.hidden); },
      };
    });

    // ---- a. Hymn 9's real words
    let r = await page.evaluate(() => {
      const out = {};
      T.reset(); G.flags.aegis_awake = true; aegisCalm('sable');
      out.sable = T.heard(/^Sable sings it: "Hold us in the little light — hold us in the little light until the morning comes—"/) && T.heard(/flat and cracked and far too low, in the wrong key/);
      out.kept = T.heard(/The Aegis stops\. It kneels\./) && G.flags.aegis_calmed === true;
      out.order = T.idx('Sable sings it') >= 0 && T.idx('Sable sings it') < T.idx('The Aegis stops');
      out.vo = window.__vo.includes('sable.hymn9.sung');
      T.reset(); G.flags.aegis_awake = true; aegisCalm('you');
      out.you = T.heard(/^You sing it off the board: "Hold us in the little light — hold us in the little light until the morning comes—"/) && !window.__vo.includes('sable.hymn9.sung');
      out.lure = /Hold us in the little light/.test(String(porchVoice)) && /until the morning comes/.test(String(porchVoice));
      return out;
    });
    check(r.sable && r.kept && r.order, 'a. Hymn 9: Sable sings the book\'s words, flat and cracked and far too low, and the Aegis still kneels');
    check(r.vo, 'a. Sable\'s Hymn 9 is voiced');
    check(r.you, 'a. sung yourself off the board, the same words, and not in Sable\'s voice');
    check(r.lure, 'a. the Wearer\'s lure at the Cloister porch already sings the words (js/grove.js porchVoice)');

    // ---- k. "Dissonant: self-inflicted. No further action." in the Gazette
    r = await page.evaluate(() => {
      const out = {};
      const page = () => STORYRUM.issueHtml();
      T.reset(); out.none = !/self-inflicted/.test(page());
      G.flags.davin_gone = true; let h = page();
      out.davin = /Hale, D\. Carter\. Dissonant: self-inflicted\. No further action\./.test(h) && !/Pellow, A\./.test(h) && !/Tam, surname not recorded/.test(h);
      G.flags.p49_tam = true; h = page();
      out.tam = /Tam, surname not recorded\. Dissonant: self-inflicted\. No further action\./.test(h);
      G.flags.greening = true; G.flags.g44_gate = 2; loadMap('oakhaven'); out.notYet = !/Pellow, A\./.test(page()) && !G.flags.p71_ada;
      G.flags.g44_gate = 3; loadMap('oakhaven'); h = page();
      out.ada = /Pellow, A\. Dissonant: self-inflicted\. No further action\./.test(h) && G.flags.p71_ada === true && (h.match(/self-inflicted/g) || []).length === 3;
      G.flags.escaped = true; out.retired = !/self-inflicted/.test(page());
      out.once = (STORYRUM.ISSUES[0].items.filter((it) => it && it.t && /self-inflicted/.test(it.t)).length === 3);
      return out;
    });
    check(r.none && r.davin, 'k. the Gazette prints Davin\'s line, word for word, once he is gone (and nothing before)');
    check(r.tam, 'k. after Tam\'s walk in the meadow, Tam, with no surname');
    check(r.notYet && r.ada, 'k. after Ada Pellow goes into the Hedge, hers; three lines, each once');
    check(r.once, 'k. the lines are added to each issue once');
    check(r.retired, 'k. once you are away on the Kestrel, the reclassified district prints no register lines');

    // ---- n. the dead Queen's decree on the well-house
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); T.at(1, 9); loadMap('oakhaven');
      const d = T.find('p71_decree');
      out.placed = !!d && Math.hypot(d.x - 27.3, d.y - 22.6) < 2.5 && d.transient === true && !d.solid;
      if (!d) return out;
      window.__ev.length = 0; useDeco(d); let ev = T.last();
      out.read = ev && ev.t === TOUCHES71.TX.decreeTitle && /BY ROYAL ASSENT/.test(ev.b) && /Maelis, by the Grace of the Pure Note, Queen of the Reach\./.test(ev.b)
        && /Queen Maelis has been dead for a hundred and forty years\./.test(ev.b) && /Her signature is very steady\./.test(ev.b) && /People say a great many things, very quietly\./.test(ev.b);
      out.wet = /the paste still wet/.test(ev.b);
      out.doc = !!(READING.SOURCES[TOUCHES71.TX.decreeTitle] && READING.SOURCES[TOUCHES71.TX.decreeTitle].style === 'office');
      T.at(1, 15); useDeco(d); ev = T.last(); out.dry = !/the paste still wet/.test(ev.b) && /A new decree has gone up over the old ones\./.test(ev.b);
      T.at(2, 7); useDeco(d); ev = T.last(); out.renewed = /the paste still wet/.test(ev.b);
      // a save and a load keep it standing (it is transient, so restaged)
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      out.unsaved = !JSON.stringify(snap).includes('p71_decree');
      restoreGame(snap); G.state = 'play'; out.restaged = !!T.find('p71_decree');
      T.reset(); T.at(1, 9); loadMap('oakhaven'); const d2 = T.find('p71_decree'); G.flags.escaped = true; window.__ev.length = 0; useDeco(d2); out.actChanged = !window.__ev.length && !T.find('p71_decree');
      T.reset(); G.flags.greening = true; loadMap('oakhaven'); out.greening = !T.find('p71_decree');
      return out;
    });
    check(r.placed, 'n. the decree is pasted up at the corner of the well-house (transient, not solid)');
    check(r.read && r.doc, 'n. it reads like a document: BY ROYAL ASSENT, the seal, Maelis, the hundred and forty years, the very steady signature');
    check(r.wet && r.dry && r.renewed, 'n. renewed each day: the paste still wet in the morning, dry by the afternoon, wet again the next morning');
    check(r.unsaved && r.restaged, 'n. never saved, and restaged on load');
    check(r.greening && r.actChanged, 'n. not in the greened town, nor once Part One is over (even without a reload)');

    // ---- o. "Forty-eight." to the hold at night
    r = await page.evaluate(() => {
      const out = {};
      const ladder = () => G.ents.find((e) => e && e.use === 'crates' && e.sprite === 'ladder');
      T.reset(); T.at(2, 23); loadMap('oakhaven'); useDeco(ladder()); let ev = T.last();
      out.night = ev && ev.t === 'The crates in the hold' && /Annet Sowerby/.test(ev.b) && /"Forty-eight," he tells the dark, the way he does most nights\./.test(ev.b) && /The dark, as usual, has nothing to say to that\./.test(ev.b);
      out.vo = window.__vo.includes('vane.hold.fortyeight');
      T.reset(); T.at(2, 14); loadMap('oakhaven'); useDeco(ladder()); ev = T.last();
      out.day = ev && ev.t === 'The crates in the hold' && !/Forty-eight/.test(ev.b) && !window.__vo.includes('vane.hold.fortyeight');
      T.reset(); T.at(6, 23); loadMap('oakhaven'); useDeco(ladder()); ev = T.last();
      out.cargo = ev && ev.t !== 'The crates in the hold' && !/Forty-eight/.test(ev.b || '');
      out.restored = String(window.showEvent).includes('__ev');
      return out;
    });
    check(r.night && r.vo, 'o. up the mast-ladder at night: Vane at the bottom of the ladder, "Forty-eight," to the dark (voiced)');
    check(r.day, 'o. not by day');
    check(r.cargo && r.restored, 'o. cargo night keeps its own scene, and showEvent is left as it was');

    // ---- q. OK-114 on the Kestrel's bow
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); G.flags.part3 = true; G.flags.sable_joined = true; loadMap('p16k_kestrel_deck');
      const b = T.find('p71_bow');
      out.placed = !!b && b.transient === true;
      if (!b) return out;
      T.stand(b.x - 2.4, b.y); window.__ev.length = 0; window.__msgs.length = 0; useDeco(b);
      out.far = !window.__ev.length && T.heard(/the ghost of a registry mark/) && !T.heard(/OK-114/);
      T.stand(b.x - 1.0, b.y); useDeco(b); const ev = T.last();
      out.near = ev && /under two coats of paint that were put on to cover the last name and then the one before it/.test(ev.b) && /OK-114\./.test(ev.b);
      out.sable = /Sable knows that mark the way a clerk knows any mark she has read eleven times\./.test(ev.b);
      delete G.flags.sable_joined; useDeco(b); out.alone = !/Sable knows/.test(T.last().b);
      return out;
    });
    check(r.placed, 'q. a registry mark at the Kestrel\'s bow rail (transient)');
    check(r.far && r.near, 'q. OK-114 is legible only up close; from further off, only the ghost of a mark');
    check(r.sable && r.alone, 'q. with Sable aboard, she knows the mark; without her, no line');

    // ---- voices and French
    const vo = await page.evaluate(() => ({ missing: Object.values(TOUCHES71.VO).filter((id) => !VOICE_ACT.LINES[id]) }));
    check(vo.missing.length === 0, 'the spoken book lines are recorded (' + (vo.missing.join(', ') || 'all there') + ')');
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p71-touches.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
    const texts = await page.evaluate(() => TOUCHES71.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 15 && noFr.length === 0 && tsv.every((x) => x.length === 2), 'every new string has a French pair in p71-touches.tsv and fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((x) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|Hearthday|Greening|Kestrel)\b/.test(x[1])), 'the French follows the glossary (la Crécerelle, la Haie)');

    check(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
