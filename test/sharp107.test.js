// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/sharp107.test.js
// Covers js/sharp107.js (Phase 107, "Sharp figures": every sprite close to the eye in the 3D view drawn from a sharp
// enlargement, as the moving paintings of Phase 76 are).
//   - a creature's picture is enlarged twice over, keeps its height setting, foot point and centre (so its world size
//     and place do not change), and is the same every time (no random numbers; cached by the picture)
//   - glowing pixels stay glowing (the mask is carried over); the moving paintings are never enlarged again
//   - pick(): near gives the enlargement, far and switched off give the original; at most BUDGET new ones a tick
//   - the Options row; off in Original, on in every other preset; no page errors
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
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /sharp107/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof SHARP107 !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });

  try {
    await step('a creature is enlarged twice over, keeping its height, foot point and centre; the same every time', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const name of ['wolf', 'proctor', 'brood_mother', 'hound', 'mite']) {
          const sp = Engine.sprites[name]; if (!sp || sp.paintfolk) continue;
          const a = SHARP107.of(sp), b = SHARP107.of(sp);
          if (!a) { out[name] = 'none'; continue; }
          let h = 0; for (let i = 0; i < a.data.length; i++) h = (h * 31 + a.data[i]) >>> 0;
          out[name] = { k: a.w / sp.w, kh: a.h / sp.h, hs: a.hs === sp.hs, cx: a.cx === sp.cx, dy: a.dy === sp.dy, same: a === b, h };
        }
        return out;
      });
      const got = Object.values(r).filter(v => typeof v === 'object');
      assert.ok(got.length >= 2, JSON.stringify(r));
      for (const v of got) assert.ok(v.k === 2 && v.kh === 2 && v.hs && v.cx && v.dy && v.same, JSON.stringify(r));
    });
    await step('glowing pixels stay glowing; the moving paintings are not enlarged again', async () => {
      const r = await page.evaluate(() => {
        let glow = null, folk = null;
        for (const [k, sp] of Object.entries(Engine.sprites)) {
          if (!sp || !sp.data) continue;
          if (!glow && !sp.paintfolk && (sp._mask || sp.emit) && sp.w * sp.h <= 320 * 320) {
            const e = SHARP107.of(sp), m0 = sp._mask || sp.emit; let n0 = 0, n1 = 0;
            for (const v of m0) if (v) n0++;
            if (e && e.emit) for (const v of e.emit) if (v) n1++;
            if (n0) glow = { k, n0, n1 };
          }
          if (!folk && sp.paintfolk) folk = { k, of: SHARP107.of(sp) === null, pick: SHARP107.pick(sp, 0) === sp };
          if (glow && folk) break;
        }
        return { glow, folk };
      });
      assert.ok(r.glow && r.glow.n1 === r.glow.n0 * 4, JSON.stringify(r));
      assert.ok(!r.folk || (r.folk.of && r.folk.pick), JSON.stringify(r));
    });
    await step('pick: near gives the enlargement, far and switched off give the original; a budget a tick', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium');
        const sp = Engine.sprites.wolf || Engine.sprites.proctor;
        const near = SHARP107.pick(sp, 1), far = SHARP107.pick(sp, (SHARP107.NEAR + 1) ** 2);
        GFX.sharpSprites = false; const off = SHARP107.pick(sp, 1); GFX.sharpSprites = true;
        // fresh pictures in one tick: only BUDGET are enlarged, the rest drawn as they are until their turn
        if (typeof ANIM !== 'undefined') ANIM.T += 1000;
        let fresh = 0;
        for (let i = 0; i < 8; i++) { const p = { w: 16, h: 16, hs: 1, data: new Uint32Array(256).fill(0xff336699 + i) }; if (SHARP107.pick(p, 1) !== p) fresh++; }
        return { near: near !== sp && near.sharp107 === true, far: far === sp, off: off === sp, fresh, budget: SHARP107.BUDGET };
      });
      assert.ok(r.near && r.far && r.off && r.fresh === r.budget, JSON.stringify(r));
    });
    await step('Options: "Sharp figures" switches it; Original turns it off, every other preset on', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); renderAccessibilityMenu();
        const b = document.getElementById('gfx-sharp107'); if (!b) return { missing: true };
        b.click(); const off = GFX.sharpSprites; b.click(); const on = GFX.sharpSprites;
        closeModal();
        const pre = {}; for (const p of ['original', 'low', 'medium', 'high', 'ultra', 'cinematic']) { PRESETS.apply(p); pre[p] = GFX.sharpSprites; }
        PRESETS.apply('medium');
        return { off, on, pre };
      });
      assert.ok(!r.missing && r.off === false && r.on === true, JSON.stringify(r));
      assert.ok(r.pre.original === false && ['low', 'medium', 'high', 'ultra', 'cinematic'].every(p => r.pre[p] === true), JSON.stringify(r));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
