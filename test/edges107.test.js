// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/edges107.test.js
// Covers js/edges107.js (Phase 107, "Natural edges") and the beech trunk (js/sheepwalk22.js, Phase 107).
//   - the ten places end in a hedgerow (or the Deep Grove in the wood's edge): every changed cell is still solid, uneven
//     in height (from chest height to over head height, never below the eye of 0.5 on a flat map), full height beside a
//     gate, and the same on every build (no random numbers)
//   - Oakhaven's Hedge and the places beside it are untouched; inspecting a hedgerow no longer says "The Hedge"
//   - the switch: off puts back the very same cell objects, on brings the edge back; the Options row; Original off
//   - the beech: a round smooth trunk (lit one side, dark the other, wider at the roots than above), no bark stripes
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /edges107/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof EDGES107 !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Edge Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(() => G.maps && G.maps.p20_downs, null, { timeout: 600000, polling: 500 });

  try {
    await step('the ten places end in a hedgerow or the wood: solid, uneven, never below the eye, full beside a gate', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const [id, [tex, lo, hi]] of Object.entries(EDGES107.PLACES)) {
          const m = G.maps[id]; if (!m) { out[id] = 'missing'; continue; }
          const L = m._edges107 || [];
          let min = 9, max = 0, bad = 0, gateLow = 0;
          for (const [i, orig, mine] of L) {
            const c = m.cells[i];
            if (!c || c !== mine || c.tex !== tex || orig.tex !== 't_hedge') bad++;
            const x = i % m.w, y = (i / m.w) | 0;
            // its height above the highest ground under it (a wall's top is a height in the world)
            let g = 0; if (m.groundAt) { g = -Infinity; for (const [fx, fy] of [[0.02, 0.02], [0.98, 0.02], [0.02, 0.98], [0.98, 0.98], [0.5, 0.5]]) g = Math.max(g, m.groundAt(x + fx, y + fy)); }
            const h = c.top - g; min = Math.min(min, h); max = Math.max(max, h);
            for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= m.w || Y >= m.h) continue; const n = m.cells[Y * m.w + X]; if (n && (n.door || n.tex === 't_p20_gate') && c.top - g < 1) gateLow++; }
          }
          out[id] = { n: L.length, bad, min, max, lo, hi, gateLow };
        }
        return out;
      });
      for (const [id, v] of Object.entries(r)) {
        assert.ok(typeof v === 'object' && v.n > 50 && v.bad === 0 && v.gateLow === 0, id + ' ' + JSON.stringify(v));
        assert.ok(v.min > 0.5 && v.min >= v.lo - 1e-9 && v.max <= Math.max(1, v.hi) + 1e-9, id + ' heights ' + JSON.stringify(v));
        assert.ok(v.max - v.min > 0.45, id + ' uneven ' + JSON.stringify(v));
      }
    });
    await step('the same on every build (no random numbers)', async () => {
      const r = await page.evaluate(() => {
        const sig = (maps) => Object.keys(EDGES107.PLACES).map(id => (maps[id]._edges107 || []).map(([i, , c]) => i + ':' + c.top).join(',')).join('|');
        const a = sig(G.maps), b = sig(buildAllMaps());
        return { same: a === b, len: a.length };
      });
      assert.ok(r.same && r.len > 1000, JSON.stringify(r));
    });
    await step("Oakhaven's Hedge and the places beside it are untouched; a hedgerow is not called the Hedge", async () => {
      const r = await page.evaluate(() => {
        const keep = ['oakhaven', 'clearing', 'greenroot', 'flume_road', 'flume_landing', 'flume_lowrings', 'ln17_orchard', 'p59_orchard', 'p61_yard'];
        const touched = keep.filter(id => G.maps[id] && (G.maps[id]._edges107 || G.maps[id].cells.some(c => c && c.edge107)));
        const oak = G.maps.oakhaven.cells.find(c => c && c.tex === 't_hedge');
        const hedge = G.maps.p20_downs.cells.find(c => c && c.edge107), wood = G.maps.p85_deepgrove.cells.find(c => c && c.edge107);
        return { touched, oak: wallLabel(oak), hedge: wallLabel(hedge), wood: wallLabel(wood) };
      });
      assert.deepStrictEqual(r.touched, []);
      assert.ok(/^The Hedge\./.test(r.oak) && /hedgerow/.test(r.hedge) && !/The Hedge/.test(r.hedge) && /edge of the wood/.test(r.wood), JSON.stringify(r));
    });
    await step('off puts back the very same cells, on brings the edge back; Options row; Original off, the rest on', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium');
        const m = G.maps.p20_downs, L = m._edges107;
        EDGES107.setOn(false); const offSame = L.every(([i, orig]) => m.cells[i] === orig);
        EDGES107.setOn(true); const onSame = L.every(([i, , mine]) => m.cells[i] === mine);
        renderAccessibilityMenu();
        const b = document.getElementById('gfx-edges107'); const row = !!b;
        if (b) { b.click(); } const viaRow = GFX.edges107 === false && L.every(([i, orig]) => m.cells[i] === orig);
        if (b) b.click(); closeModal();
        const pre = {}; for (const p of ['original', 'low', 'medium', 'high', 'ultra', 'cinematic']) { PRESETS.apply(p); pre[p] = GFX.edges107; }
        PRESETS.apply('medium');
        return { offSame, onSame, row, viaRow, back: GFX.edges107, pre };
      });
      assert.ok(r.offSame && r.onSame && r.row && r.viaRow && r.back === true, JSON.stringify(r));
      assert.ok(r.pre.original === false && ['low', 'medium', 'high', 'ultra', 'cinematic'].every(p => r.pre[p] === true), JSON.stringify(r));
    });
    await step('the beech: a round smooth grey trunk, lit on one side and dark on the other, flaring at the roots', async () => {
      const r = await page.evaluate(() => {
        const sp = Engine.sprites.p22_beech, W = sp.w, D = sp.data;
        const lum = (c) => ((c & 255) + ((c >> 8) & 255) + ((c >> 16) & 255)) / 3, opaque = (c) => (c >>> 24) > 200;
        const rowSpan = (y) => { let a = -1, b = -1; for (let x = 0; x < W; x++) if (opaque(D[y * W + x]) && ((D[y * W + x] & 255) > 0x30) && Math.abs(((D[y * W + x] >> 8) & 255) - (D[y * W + x] & 255)) < 14) { if (a < 0) a = x; b = x; } return [a, b]; };
        const mid = rowSpan(110), foot = rowSpan(146);
        const [a, b] = mid, w = b - a; const left = lum(D[110 * W + a + Math.round(w * 0.25)]), right = lum(D[110 * W + a + Math.round(w * 0.85)]);
        // no bark: down the lit side of the trunk, neighbouring pixels change by little
        let jumps = 0; const x = a + Math.round(w * 0.3); for (let y = 90; y < 130; y++) if (Math.abs(lum(D[y * W + x]) - lum(D[(y + 1) * W + x])) > 40) jumps++;
        return { mid, foot, left, right, jumps };
      });
      assert.ok(r.mid[0] > 0 && r.left > r.right + 25, JSON.stringify(r));
      assert.ok(r.foot[1] - r.foot[0] > (r.mid[1] - r.mid[0]) + 8, JSON.stringify(r));
      assert.ok(r.jumps <= 4, JSON.stringify(r));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
