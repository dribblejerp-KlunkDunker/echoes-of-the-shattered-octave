// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/towns108.test.js
// Covers js/towns108.js (Phase 108, "every town raised": the other towns' houses stand as tall as Oakhaven's, 3D view).
//   - in each of the ten towns the houses are raised (counts per town), each as its town's table says: the ground storey
//     `ground` taller over its own ground, the door `doorH` high in its case, the ridge and the upper windows up with it,
//     the ground-floor windows where they were
//   - what is not raised is not raised for a stated reason: a church with a tower, the Salt Stair's fronts, a house
//     already taller than the map's ring; towers and spires still stand over every roof
//   - the 3D view's door leaves: every raised door has its taller leaf
//   - the maps themselves are not touched; Oakhaven and the Hollow are as Phase 97 left them (not raised twice)
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

// how many houses each town has raised (measured 21 Nov; a change to a town's map changes these on purpose)
const RAISED = { greenroot: 7, flume_lowrings: 8, clearing: 1, p22_combe: 1, flume_landing: 5, cantabile_cay: 1, cantabile_harbour: 5, whispergrove: 12, p31_bellyard: 3, p61_yard: 1 };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /towns108|eaves78 post/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof TOWNS108 !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Town Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(() => G.maps && G.maps.greenroot, null, { timeout: 600000, polling: 500 });

  try {
    // the maps' cells as they were built, before any plan is made from them
    const before = await page.evaluate(() => { const h = (m) => { let n = 0; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c) n = (n * 31 + i * 7 + (c.top == null ? 1 : Math.round(c.top * 100)) + (c.door ? 3 : 0) + (c.tex || '').length) >>> 0; } return n; }; const o = {}; for (const id of Object.keys(TOWNS108.TOWNS)) o[id] = h(G.maps[id]); window.__h = h; return o; });

    await step('the ten towns are raised, each as its own table says', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const [id, T] of Object.entries(TOWNS108.TOWNS)) {
          const m = G.maps[id], hs = EAVES78.planOf(m).houses.filter((b) => b.ground > 0), bad = [];
          for (const b of hs) {
            const g = T.ground * (TOWNS108.shed(b) ? 0.6 : 1);
            if (Math.abs(b.ground - g) > 1e-9 || Math.abs(b.top - (b.base + 1 + g)) > 1e-6 || b.ridge <= b.top || b.wallTop < b.top - 1e-9) bad.push('shape ' + b.label);
            if (Math.abs(b.doorH - Math.min(T.doorH, 1 + g - 0.08)) > 1e-9 || (b.doorH <= 1.1 && !TOWNS108.shed(b))) bad.push('door ' + b.label + ' ' + b.doorH);
            // a window is either in the map's own wall (below that wall cell's top) or above the band (the upper storey)
            for (const w of b.windows) {
              const X = Math.floor(w.cx - w.nx * 0.5), Y = Math.floor(w.cy - w.ny * 0.5), c = m.cells[Y * m.w + X];
              const wallTop = c ? (c.top != null ? c.top : (m.lvls ? m.lvls[Y * m.w + X] || 0 : 0) + 1) : b.base + 1;
              if (w.z1 > wallTop + 1e-6 && w.z0 < b.top - 0.05) bad.push('window in the band ' + b.label + ' ' + w.z0.toFixed(2) + '-' + w.z1.toFixed(2) + ' wall ' + wallTop.toFixed(2));
            }
          }
          out[id] = { n: hs.length, bad };
        }
        return out;
      });
      for (const [id, want] of Object.entries(RAISED)) {
        assert.ok(r[id] && r[id].n === want, id + ' raised ' + JSON.stringify(r[id]) + ', want ' + want);
        assert.deepStrictEqual(r[id].bad, [], id + ' ' + JSON.stringify(r[id].bad));
      }
    });
    await step('what is not raised has its reason; towers and spires still stand over every roof', async () => {
      const r = await page.evaluate(() => {
        const out = []; let spires = 0;
        for (const id of Object.keys(TOWNS108.TOWNS)) {
          const m = G.maps[id], hs = EAVES78.planOf(m).houses, W = m.w;
          const lv = (x, y) => (m.lvls ? m.lvls[y * W + x] || 0 : 0);
          for (const b of hs) {
            if (b.ground > 0) continue;
            const tower = b.church && b.towers && b.towers.length, d = (b.ring0 || b.doors || [])[0];
            const g0 = typeof b.base === 'number' ? b.base : d ? lv(d.x + d.nx, d.y + d.ny) : lv(b.x0, b.y0);
            const tall = b.top - (g0 + 1) > 0.08;
            if (!(tower || b.cliff || b.headframe || tall)) out.push(id + ': ' + (b.label || '(no name)'));
          }
          const tops = hs.filter((b) => b.church && b.towers && b.towers.length).map((b) => Math.min(...b.towers.map((t) => t.top)));
          const ridges = hs.filter((b) => !b.church).map((b) => b.ridge);
          for (const t of tops) { spires++; if (ridges.some((z) => z >= t)) out.push(id + ': a roof over the tower'); }
        }
        return { out, spires };
      });
      assert.deepStrictEqual(r.out, []);
      assert.ok(r.spires >= 1, JSON.stringify(r));
    });
    await step("every raised door has its taller leaf in the 3D view", async () => {
      const r = await page.evaluate(() => {
        EAVES78.textures();                                    // the 3D view paints the leaves before it asks for them
        const miss = []; let n = 0;
        for (const id of Object.keys(TOWNS108.TOWNS)) {
          const m = G.maps[id];
          for (const b of EAVES78.planOf(m).houses) if (b.ground > 0) for (const d of b.ring) { const L = EAVES78.door(m, d.x, d.y); n++; if (!L || Math.abs(L.h - b.doorH) > 1e-9 || !/^e97_door[0-3]$/.test(L.tex)) miss.push(id + '@' + d.x + ',' + d.y); }
        }
        return { n, miss };
      });
      assert.ok(r.n >= 40 && !r.miss.length, JSON.stringify(r));
    });
    await step('the maps are not touched; Oakhaven and the Hollow as Phase 97 left them', async () => {
      const r = await page.evaluate((before) => {
        const changed = Object.keys(before).filter((id) => window.__h(G.maps[id]) !== before[id]);
        const oak = EAVES78.planOf(G.maps.oakhaven).houses.filter((b) => b.ground > 0), hol = EAVES78.planOf(G.maps.p30_hollow).houses.filter((b) => b.ground > 0);
        const okOak = oak.length >= 25 && oak.every((b) => Math.abs(b.ground - 0.38 * (b.plain ? 0.6 : 1)) < 1e-9 && Math.abs(b.top - (b.base + 1 + b.ground)) < 1e-6);
        const okHol = hol.length >= 3 && hol.every((b) => Math.abs(b.ground - 0.3 * (b.plain ? 0.6 : 1)) < 1e-9);
        return { changed, okOak, okHol, oak: oak.length, hol: hol.length };
      }, before);
      assert.ok(!r.changed.length && r.okOak && r.okHol, JSON.stringify(r));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
