// PREVIEW_URL=http://127.0.0.1:8836 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/epigraphs73.test.js
// The epigraphs (js/epigraphs73.js; ROADMAP R6; Book One): the chapter epigraphs the game did not yet use, each a document
// in the held-document reader, placed where the book says it comes from (or where such a paper would sit), word for word
// from the manuscript, and never readable before the story reaches its chapter.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- the manuscript, read here and not copied: every chapter heading's block quote and its attribution
const BOOK = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md').split('\n');
const NUM = ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN', 'ELEVEN', 'TWELVE', 'THIRTEEN', 'FOURTEEN',
  'FIFTEEN', 'SIXTEEN', 'SEVENTEEN', 'EIGHTEEN', 'NINETEEN', 'TWENTY', 'TWENTY-ONE', 'TWENTY-TWO', 'TWENTY-THREE', 'TWENTY-FOUR'];
const EPI = {};
for (let i = 0; i < BOOK.length; i++) {
  const m = /^## CHAPTER (.+)$/.exec(BOOK[i]); if (!m) continue;
  const ch = NUM.indexOf(m[1].trim()) + 1;
  let j = i + 2; while (BOOK[j] === '') j++;
  const lines = []; let attr = null;
  for (; BOOK[j] && BOOK[j].startsWith('>'); j++) {
    const t = BOOK[j].replace(/^> ?/, '');
    if (t.startsWith('— ')) attr = t.slice(2); else if (t) lines.push(t.replace(/^\*|\*$/g, ''));
  }
  EPI[ch] = { lines, attr: attr && attr.replace(/\*/g, ''), line: i + 1 };
}
const plain = (h) => String(h).replace(/<[^>]+>/g, '').replace(/&amp;/g, '&');
// Already in the game, word for word (so not placed again): ch. 1 the skipping rhyme (js/upgrades.js "Rhymes of the
// Hedge-Nursery"), ch. 3 the Grafting Office handbook (the library's copy in Rooke's surgery), ch. 7 the Warrant's line
// (the first line of the library's sermon "The Only Song" in the chapel), ch. 15 the Veil's precept (Sable says it,
// js/grove31.js, and the library's "Rule of the House"), ch. 22 Quist's precept (the library's Bistre commonplace book).
const SKIPPED = [1, 3, 7, 15, 22];
const PLACED = [2, 4, 5, 6, 8, 9, 10, 11, 12, 13, 14, 16, 17, 18, 19, 20, 21, 23, 24];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /epigraphs73/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8836');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Epigraph Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    const ok = await page.evaluate(() => typeof EPI73 !== 'undefined');
    check(ok, 'js/epigraphs73.js is loaded (EPI73)');
    if (!ok) throw new Error('no module');
    await page.evaluate(() => {
      window.__ev = []; window.__realShow = window.showEvent;
      window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset(flags) { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; Object.assign(G.flags, flags || {}); window.__ev.length = 0; },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        spotsHere() { return G.ents.filter((e) => e && e.use === 'p73_read' && !e.hidden); },
        // open a document the way a player does: go to its map, use the paper, choose it from the menu if there are several
        open(id, flags) {
          const d = EPI73.DOC[id];
          T.reset(flags); loadMap(d.map); window.__ev.length = 0;
          const e = T.spotsHere().find((x) => x._p73 === d.spot);
          if (!e) return { placed: false };
          useDeco(e);
          let ev = T.last();
          if (ev && ev.c && ev.c.length > 1 && ev.t !== d.title) { const c = ev.c.find((x) => x.t.replace(/^✓ /, '') === d.title); if (c) c.f(); ev = T.last(); }
          return { placed: true, x: e.x, y: e.y, solid: !!e.solid, transient: !!e.transient, t: ev && ev.t, b: ev && ev.b, n: ev && ev.c ? ev.c.length : 0 };
        },
      };
    });

    // ---- which chapters: every chapter has an epigraph; the ones already in the game are skipped, the rest placed
    check(Object.keys(EPI).length === 24 && Object.values(EPI).every((e) => e.lines.length && e.attr), 'the manuscript has 24 chapter epigraphs, each with an attribution');
    const docs = await page.evaluate(() => EPI73.DOCS.map((d) => ({ id: d.id, ch: d.ch, lines: d.lines.slice(), attr: d.attr, map: d.map, spot: d.spot, title: d.title })));
    check(docs.map((d) => d.ch).join() === PLACED.join(), 'the module places chapters ' + PLACED.join(', ') + ' (skips ' + SKIPPED.join(', ') + ', already in the game word for word)');

    // ---- the text is the manuscript's, word for word, with the attribution as the book gives it
    const wrong = docs.filter((d) => { const e = EPI[d.ch]; return !e || d.lines.join('\n') !== e.lines.join('\n') || plain(d.attr) !== e.attr; });
    check(docs.length && !wrong.length, 'every document is the epigraph word for word, attribution included (' + (wrong.map((d) => d.id).join(', ') || 'all match') + ')');

    // ---- each document exists in the world and opens in the held-document reader, once its chapter is reached
    const LATE = { church_come: true, part3: true, sable_joined: true, press_taken: true, part4: true, c68: 9, herald_come: true, h66: 3 };
    // (Tobiah's copy in the quarry is a Part One paper: it goes aboard with him)
    const opened = await page.evaluate((LATE) => EPI73.DOCS.map((d) => Object.assign({ id: d.id, title: d.title, src: READING.SOURCES[d.title] || null }, T.open(d.id, d.id === 'e02' ? {} : LATE))), LATE);
    const notOpen = opened.filter((o) => !o.placed || o.t !== o.title || !o.src);
    check(!notOpen.length, 'every document is placed in its map and opens as a held document (' + (notOpen.map((o) => o.id + (o.placed ? ':' + o.t : ':not placed')).join(', ') || 'all') + ')');
    const bodyBad = opened.filter((o) => { const d = docs.find((x) => x.id === o.id); const b = plain(o.b || ''); return !d.lines.every((l) => b.includes(l)) || !b.includes('— ' + plain(d.attr)); });
    check(!bodyBad.length, 'each reads as the quoted lines, then "— " and the attribution (' + (bodyBad.map((o) => o.id).join(', ') || 'all') + ')');
    check(opened.every((o) => o.transient && !o.solid), 'the papers are transient props, never solid');

    if (process.env.DEBUG) console.log(JSON.stringify(opened.map((o) => [o.id, o.x, o.y])));

    // ---- spoiler gates: a late chapter's paper is not there, and will not open, before the story reaches it
    const gates = await page.evaluate(() => {
      const shut = (id, flags) => { const o = T.open(id, flags); return !o.placed && !EPI73.read(id) && !EPI73.available(id); };
      const opens = (id, flags) => { const o = T.open(id, flags); return o.placed && o.t === EPI73.DOC[id].title; };
      return {
        rubric: shut('e09', {}) && opens('e09', { church_come: true }) && opens('e09', { rite_ready: true }),
        carriage: shut('e16', { part3: true }) && opens('e16', { part3: true, sable_joined: true }),
        requisition: shut('e17', { part3: true }) && opens('e17', { part3: true, aegis_awake: true }) && opens('e17', { part3: true, sable_joined: true }),
        notes: shut('e18', { part3: true }) && opens('e18', { part3: true, p61: 1 }) && opens('e18', { part3: true, press_taken: true }),
        primer: shut('e20', { part3: true, sable_joined: true }) && opens('e20', { part3: true, press_taken: true }) && opens('e20', { part3: true, porch_answered: true }),
        handbill: shut('e21', { part3: true }) && opens('e21', { part3: true, c68: 1 }) && opens('e21', { part4: true }),
        writ: shut('e24', { part4: true, herald_come: true, h66: 1 }) && opens('e24', { part4: true, herald_come: true, h66: 2 }) && shut('e24', { part4: true, herald_come: true, h66: 6 }),
        // Tobiah's copy leaves the quarry with him; aboard, it is on his bench
        quarryBook: shut('e02', { escaped: true }) && opens('e13', { part3: true }),
        // Revision Seven with the margin is Tobiah's charts ("the only copy"): read from your pack once he has given them
        // to you and the Rite has begun; on his bench aboard only while he keeps them
        charts: (() => {
          T.reset(); G.give('charts'); window.__ev.length = 0; useItem({ id: 'charts' }); const before = !window.__ev.some((e) => e.t === EPI73.DOC.e10.title);
          G.flags.rite_started = true; useItem({ id: 'charts' }); const ev = T.last(); const reads = ev && ev.t === EPI73.DOC.e10.title && /Slippage is to be absorbed by the source\./.test(ev.b);
          G.flags.part3 = true; const notOnBench = !EPI73.available('e10');
          return before && reads && notOnBench && opens('e10', { part3: true });
        })(),
        // the Part One papers are there from the first day: the notebooks were written long before the book begins
        early: ['e02', 'e04', 'e05', 'e06', 'e11', 'e23'].every((id) => opens(id, {})),
        // a menu at Lyra's shelf, with the three notebooks in it, and a tick once read
        menu: (() => { T.reset(); loadMap('lyra_house'); window.__ev.length = 0; const e = T.spotsHere()[0]; useDeco(e); const ev = T.last();
          const titles = ev.c.map((c) => c.t); ev.c[0].f(); const read = EPI73.isRead('e06'); window.__ev.length = 0; useDeco(e);
          return ev.t === EPI73.SPOTS.lyra_notebooks.title && titles.length === 4 && read && T.last().c[0].t.startsWith('✓ '); })(),
        // the herald's sheet appears while you stand in the clearing, without a reload
        live: (() => { T.reset({ part4: true, herald_come: true, h66: 1 }); loadMap('deepwoods'); const before = T.spotsHere().length;
          G.flags.h66 = 2; G.state = 'play'; update(0.6); const during = T.spotsHere().length; G.flags.h66 = 6; update(0.6);
          return before === 0 && during === 1 && T.spotsHere().length === 0; })(),
      };
    });
    check(gates.rubric, 'ch. 9: the Rubric is in the chapel only once the Church has come');
    check(gates.carriage, 'ch. 16: the carriage note for OK-114 waits until Sable has joined (Manifest)');
    check(gates.requisition, 'ch. 17: Requisition 44 waits for the Cloister (its Aegis) or Sable');
    check(gates.notes, 'ch. 18: S.\'s notes wait for the Malting\'s front door (or the press taken)');
    check(gates.primer, 'ch. 20: the Null-Watch primer at the Cloister waits until after the Malting, or the porch');
    check(gates.handbill, 'ch. 21: the Free Captains\' handbill on the mast waits for the cutter chase');
    check(gates.writ, 'ch. 24: the herald\'s sheet only once he has read it, and only while he is in the clearing');
    check(gates.live, 'ch. 24: it comes and goes with him while you stand there, without a reload');
    check(gates.quarryBook, 'Tobiah\'s K. Vance is in the quarry until the escape, then aboard with his papers');
    check(gates.charts, 'ch. 10: Revision Seven\'s margin reads from Tobiah\'s charts in your pack once the Rite has begun (never before), and is on his bench only while he keeps them');
    check(gates.early,'the Part One papers (K. Vance, the vox label, Circular 12, Tobin\'s notebooks) are there from the start');
    check(gates.menu, 'Lyra\'s shelf offers the three notebooks by title, and ticks the one you have read');

    // ---- the real reader, a save, and old saves
    const real = await page.evaluate(() => {
      const out = {};
      T.reset({ part3: true }); loadMap('malting');
      window.showEvent = window.__realShow;
      useDeco(T.spotsHere().find((e) => e._p73 === 'malting_form'));
      const ev = document.querySelector('#event');
      out.held = !!(ev && ev.classList.contains('hd-on') && document.querySelector('.hd-sheet.hd-office'));
      out.kicker = (document.querySelector('.hd-kicker') || {}).textContent === 'Standing form';
      out.title = (document.querySelector('.hd-title') || {}).textContent === 'Form 9: Intake';
      READING.choose(0);
      out.closed = G.state === 'play' && ev.classList.contains('hidden');
      window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      out.noProps = !/"use":"p73_read"|"_p73"/.test(JSON.stringify(snap));
      out.mask = G.flags.p73_read === (1 << EPI73.DOC.e14.bit);
      restoreGame(snap); G.state = 'play';
      out.restaged = G.mapId === 'malting' && T.spotsHere().length >= 2 && EPI73.isRead('e14');
      // an old save has no p73_read at all
      delete snap.flags.p73_read; restoreGame(snap); G.state = 'play'; out.old = !EPI73.isRead('e14') && T.spotsHere().length >= 2;
      return out;
    });
    check(real.held && real.kicker && real.title && real.closed, 'it opens in the held-document reader on Office paper, kind and title shown, and puts down');
    check(real.noProps && real.restaged && real.mask, 'the papers are never saved and are restaged on load; what you have read is kept');
    check(real.old, 'an old save loads, with nothing read');

    // ---- French for every string
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p73-epigraphs.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
    const texts = await page.evaluate(() => EPI73.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 60 && noFr.length === 0 && tsv.every((x) => x.length === 2), 'every string has a French pair in p73-epigraphs.tsv and fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((x) => /\b(Cantor|the Hedge|Kestrel|Hush|Office of the Catalogue)\b/.test(x[1])) && tsv.filter((x) => /Cantor/.test(x[0])).every((x) => /Chantre/.test(x[1])) && tsv.filter((x) => / SR\b/.test(x[0])).every((x) => / CS\b/.test(x[1])), 'the French follows the glossary (Chantre, l\'Office du Catalogue, CS dates)');
    check(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL EPIGRAPHS TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
