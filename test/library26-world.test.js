// PREVIEW_URL=http://127.0.0.1:4074 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/library26-world.test.js
// Phase 26 in the real game: every shelved map gets its pile once every module has built its maps; the pile is on open
// floor, off doors and furniture, and reading from it works; the logbook offers the library; French covers it.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ok = (m) => console.log('PASS ' + m);
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3304');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof LIBRARY !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Reader');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const c = page.locator('#create-panel .list button').first();
      if (await c.count()) await c.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');

    const r = await page.evaluate(() => {
      const out = { maps: 0, bad: [], missing: [] };
      for (const id of [...new Set(LIBRARY.BOOKS.map(b => b.where))]) {
        const m = G.maps[id];
        if (!m) { out.missing.push(id); continue; }
        loadMap(id);
        const piles = G.map.entities.filter(e => e.libPile);
        if (piles.length !== 1) { out.bad.push(id + ': ' + piles.length + ' piles'); continue; }
        const p = piles[0];
        if (G.map.isBlocked(Math.floor(p.x), Math.floor(p.y))) out.bad.push(id + ': in a wall');
        for (const k in G.map.doors) { const dx = (k % G.map.w) + 0.5 - p.x, dy = Math.floor(k / G.map.w) + 0.5 - p.y; if (dx * dx + dy * dy < 4) out.bad.push(id + ': by a door'); }
        for (const o of G.map.entities) if (o !== p && o.solid && (o.x - p.x) ** 2 + (o.y - p.y) ** 2 < 0.5) out.bad.push(id + ': on ' + (o.sprite || o.kind));
        out.maps++;
      }
      return out;
    });
    assert.deepEqual(r.missing, [], 'shelved on maps the game does not build: ' + r.missing);
    assert.deepEqual(r.bad, []);
    ok('a pile on each of ' + r.maps + ' shelved maps in the real game, on open floor, off doors and furniture');

    const read = await page.evaluate(() => {
      loadMap('tavern');
      const p = G.map.entities.find(e => e.libPile); useDeco(p);
      const t = document.querySelector('#event-title, #event h2')?.textContent || '';
      const b = LIBRARY.booksAt('tavern')[0]; LIBRARY.read(b.id);
      const n = LIBRARY.count(); closeModal(); G.state = 'play';
      renderLog(); const sec = !!document.querySelector('#lib-log'); closeModal(); G.state = 'play';
      return { t, n, sec };
    });
    assert.equal(read.n, 1); assert(read.sec, 'logbook section');
    ok('reading from the tavern pile adds the book to the library; the logbook shows the library');
    assert.deepEqual(errors, []);
    ok('no page errors');
  } finally { await browser.close(); }
})().catch(e => { console.error('FAIL', e); process.exit(1); });
