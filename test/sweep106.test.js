// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/sweep106.test.js
// Phase 106, the visual sweep (tools/dev/sweep106.js photographed every place): what it found, fixed and kept fixed.
//   1. the 3D view with the eye exactly on a cell line: the near ceiling was black (the surgery, the mill, the tannery,
//      the carders, the bakery... wherever a map's arrival point is a whole number). Now drawn as from a hair beside it.
//   2. past the edge of a hilly map the 3D view showed a flat pale void (Poundstair, the Hollows): now ground.
//   3. the Long Night orchard's frost stood up as pale cards: it lies flat now, as rime in the snow.
//   4. a road-walker stepping out of the gate where you arrive walked out through you: they wait while you stand there.
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
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Sweep Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; PRESETS.apply('medium');
    window.GO = (id, x, y, dir, tod) => { closeModal(); G.tod = tod; loadMap(id, { x, y, dir }); G.state = 'play'; G.tod = tod; G.fadeT = 0; Engine.cam.pitch = 0; for (let i = 0; i < 6; i++) advanceTime(33); render(); };
    // PX(fx, fy): the frame's colour there; GL rows count from the bottom, so fy 0.9 is near the top
    window.PX = (fx, fy) => { const p = R3D.readPixels(); const x = Math.floor(p.w * fx), y = Math.floor(p.h * fy); const o = (y * p.w + x) * 4; return [p.data[o], p.data[o + 1], p.data[o + 2]]; };
  });

  try {
    await step('the 3D view on a cell line draws the near ceiling (the surgery from its door, x = 2.0)', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const [k, x, y, d] of [['on', 2.0, 5.5, 0], ['beside', 2.01, 5.5, 0], ['y', 4.5, 3.0, Math.PI / 2]]) { GO('surgery', x, y, d, 0.45); const a = PX(0.5, 0.92), b = PX(0.3, 0.85); out[k] = a[0] + a[1] + a[2] + b[0] + b[1] + b[2]; }
        out.active = R3D.active(); return out;
      });
      assert.ok(r.active, 'R3D not active');
      assert.ok(r.on > 120 && r.y > 120, 'the near ceiling is black: ' + JSON.stringify(r));
      assert.ok(Math.abs(r.on - r.beside) < r.beside * 0.35, 'on the line it differs from a hair beside it: ' + JSON.stringify(r));
    });
    await step('past the edge of a hilly map there is ground, not a pale void (Poundstair, looking out of the gate)', async () => {
      const r = await page.evaluate(() => {
        const s = G.maps.p83_poundstair.spawn; GO('p83_poundstair', s.x, s.y, s.dir + Math.PI, 0.45);
        const low = PX(0.5, 0.12), hz = PX(0.5, 0.55);
        return { low, hz, relief: !!G.map.relief };
      });
      const lum = (c) => c[0] + c[1] + c[2];
      assert.ok(r.relief, 'Poundstair is no longer a hilly map: pick another');
      assert.ok(lum(r.low) < lum(r.hz) - 60, 'the ground below is as pale as the haze: ' + JSON.stringify(r));
    });
    await step('the orchard\'s frost lies flat: no upright frost cards, rimed snow in their cells', async () => {
      const r = await page.evaluate(() => {
        const m = G.maps.ln17_orchard; const cards = m.entities.filter((e) => e.sprite === 'ln17_frost').length;
        const k = m.floorTextures.indexOf('ln17_rime'); let rime = 0; if (k > 0) for (let i = 0; i < m.floorCells.length; i++) if (m.floorCells[i] === k) rime++;
        return { cards, rime, tex: !!Engine.textures.ln17_rime };
      });
      assert.deepStrictEqual([r.cards, r.tex], [0, true]); assert.ok(r.rime >= 4 && r.rime <= 6, 'rime cells ' + r.rime);
    });
    await step('a walker coming out of the gate waits while you stand in it, and comes out when you step away', async () => {
      const r = await page.evaluate(() => {
        const s = G.maps.p83_stride.spawn; GO('p83_stride', s.x, s.y, s.dir, 6 / 24);   // 6 o'clock: the gauger is at home (16 to 9)
        const g = () => G.ents.find((e) => e.id === 'p60_fl_gauger');
        if (!g()) return { none: true };
        const was = g().hidden; G.tod = 9.2 / 24;   // 9: he sets out for the reach, from the gate you stand in
        for (let i = 0; i < 20; i++) { G.player.x = s.x; G.player.y = s.y; Engine.cam.x = s.x; Engine.cam.y = s.y; advanceTime(50); }
        const waiting = g().hidden, near = Math.hypot(g().x - s.x, g().y - s.y);
        G.player.x = s.x; G.player.y = s.y + 4; Engine.cam.x = G.player.x; Engine.cam.y = G.player.y;
        for (let i = 0; i < 20; i++) advanceTime(50);
        return { was, waiting, out: !g().hidden, near };
      });
      assert.ok(!r.none, 'no gauger on the Stride');
      assert.deepStrictEqual([r.was, r.waiting, r.out], [true, true, true], JSON.stringify(r));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log('sweep106: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
