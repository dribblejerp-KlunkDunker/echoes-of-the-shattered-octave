// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/keep110.test.js
// Covers PRESETS.keep (js/presets.js, Phase 110; the Codex review of PR #156): the late graphics switches keep the
// player's own choice across launches, as the older modules keep theirs (js/hud11.js, js/look10.js).
//   - a fresh player starts each switch as the preset in force wants (Medium: on)
//   - turning a switch off, then reloading: it is still off (Pixel hands, Natural edges, Sharp figures, Ground cover,
//     and Phase 21's sun shadows and clouds)
//   - choosing a preset afterwards stores the preset's values: after Medium and a reload, they are on again
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const FLAGS = ['pixelHands', 'edges107', 'sharpSprites', 'groundCover', 'p21_shadows', 'p21_clouds'];
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
  // the same automation settings on every load: the preset is Medium unless a stored choice says otherwise
  await page.addInitScript(() => { window.__max20 = { automation: true, fake: { hwgl2: true, cores: 8, mobile: false, memory: 8 } }; });
  const boot = async () => {
    await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof PIXELHANDS110 !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
    await page.waitForTimeout(800);
    return page.evaluate((F) => { const o = { preset: GFX.preset }; for (const k of F) o[k] = GFX[k]; return o; }, FLAGS);
  };

  try {
    let first;
    await step('a fresh player starts each switch as the preset wants', async () => {
      first = await boot();
      const want = await page.evaluate((F) => { const t = PRESETS.table[GFX.preset]; const o = {}; for (const k of F) o[k] = t ? PRESETS.fxWanted(t.fx, k) : true; return o; }, FLAGS);
      for (const k of FLAGS) assert.strictEqual(first[k], want[k], k + ' ' + JSON.stringify(first));
    });
    await step('turned off, each switch is still off after a reload', async () => {
      await page.evaluate((F) => { for (const k of F) GFX[k] = false; GFX.changed(); }, FLAGS);
      const r = await boot();
      for (const k of FLAGS) assert.strictEqual(r[k], false, k + ' ' + JSON.stringify(r));
    });
    await step('a preset chosen afterwards is what is kept (Medium: on again after a reload)', async () => {
      await page.evaluate(() => { PRESETS.apply('medium'); });
      const r = await boot();
      const want = await page.evaluate((F) => { const t = PRESETS.table.medium; const o = {}; for (const k of F) o[k] = PRESETS.fxWanted(t.fx, k); return o; }, FLAGS);
      for (const k of FLAGS) assert.strictEqual(r[k], want[k], k + ' ' + JSON.stringify(r));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
