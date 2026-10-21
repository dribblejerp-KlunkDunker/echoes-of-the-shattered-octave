// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4102 node test/light21.test.js
// Phase 21 team LIGHT.
// Part 1 (the hotfix for "the sky was not loading properly"): the Phase 18 GPU compositor's on-device self-check, the
// lost-context path and the drawing-buffer placement, booted as a real player would (navigator.webdriver hidden, so
// js/max20.js makes its first-launch pick) with the compositor forced on (headless Chromium has only SwiftShader).
//   - no false alarm: the self-check runs and passes in the reference scenes (every hour, Medium and Cinematic)
//   - a composite that comes out black is caught: the compositor turns itself off and the canvas path shows the sky
//   - a lost context hands the frame to the canvas at once (no "present failed", no latch) and the compositor comes
//     back when the context is restored
//   - no page errors
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4102';
const SHOT_DIR = process.env.SHOT_DIR || path.join(os.tmpdir(), 'light21-shots');
fs.mkdirSync(SHOT_DIR, { recursive: true });
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

async function bootPage(browser, opts) {
  opts = opts || {};
  const ctx = await browser.newContext({ viewport: opts.viewport || { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(240000);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && /gpu18|light21|render hook/.test(m.text()))) errors.push(m.type() + ': ' + m.text()); });
  await page.addInitScript((o) => {
    // a real player: js/max20.js only runs its first-launch pick when navigator.webdriver is false
    try { Object.defineProperty(Navigator.prototype, 'webdriver', { get: () => false, configurable: true }); } catch (e) { /* fine */ }
    window.__max20 = { fake: { hwgl2: true, cores: 8, mobile: false, memory: 8 } };   // the owner's desktop: Cinematic
    try { localStorage.setItem('octave.gpu18.v1', JSON.stringify({ on: 1 })); } catch (e) { /* fine */ }
    if (o.preset) try { localStorage.setItem('octave.max20.v1', JSON.stringify({ v: 1, user: o.preset, base: o.preset, auto: null, settled: true })); } catch (e) { /* fine */ }
  }, { preset: opts.preset || 'cinematic' });
  await page.goto(URL + '/?nosw=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Light Tester');
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
    window.requestAnimationFrame = () => 0;   // our frames only
    window.L21 = {
      stage(map, x, y, dir, tod, wx) { G.state = 'play'; loadMap(map, x == null ? undefined : { x, y, dir }); G.fadeT = 0; G.tod = tod; Weather.hold(wx || 'clear'); Engine.cam.pitch = 0; },
      frames(n) { for (let i = 0; i < n; i++) render(); return GPU18.st.check; },
      skyLuma() {   // the presented 3D view (GPU layer when shown, else the canvas), mean luma of the top tenth
        const g = GPU18.active() ? GPU18.readFrame() : null;
        const F = g || { fb: new Uint32Array(Engine.ctx.getImageData(0, 0, Engine.canvas.width, Engine.canvas.height * 0.75).data.buffer), w: Engine.canvas.width };
        const w = F.w, rows = Math.max(1, (F.fb.length / w / 10) | 0); let s = 0;
        for (let i = 0; i < rows * w; i++) { const p = F.fb[i]; s += ((p & 255) * 77 + ((p >> 8) & 255) * 150 + ((p >> 16) & 255) * 29) >> 8; }
        return s / (rows * w);
      },
    };
  });
  return { page, ctx, errors };
}

const SCENES = [
  ['oakhaven', 23.5, 6.5, Math.PI / 2], ['clearing', 20.5, 32.5, -Math.PI / 2], ['deepwoods', null, null, null], ['whispergrove', null, null, null],
];

(async () => {
  const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    for (const preset of ['cinematic', 'medium']) {
      const { page, ctx, errors } = await bootPage(browser, { preset });
      await step(`${preset}: booted as a player, compositor on, preset ${preset}`, async () => {
        const s = await page.evaluate(() => ({ cur: PRESETS.current(), gpu: GPU18.active(), auto: MAX20.live }));
        assert.strictEqual(s.gpu, true); assert.strictEqual(s.cur, preset); assert.strictEqual(s.auto, true);
      });
      await step(`${preset}: the self-check runs and passes in every reference scene and hour (no false alarm)`, async () => {
        const out = [];
        for (const [m, x, y, d] of SCENES) for (const t of [0.5, 0.73, 0.96, 0.27]) {
          const c = await page.evaluate(([m, x, y, d, t]) => { L21.stage(m, x, y, d, t); GPU18.checkSoon(); return L21.frames(GPU18.CHECK.first + 2); }, [m, x, y, d, t]);
          out.push(`${m}@${t}:${c.last && c.last.ok}`);
          assert.ok(c.last && c.last.ok, `${m} ${t}: ${JSON.stringify(c.last)}`);
        }
        const st = await page.evaluate(() => ({ gpu: GPU18.active(), failed: GPU18.st.failed, runs: GPU18.st.check.runs, bad: GPU18.st.check.bad }));
        assert.strictEqual(st.gpu, true); assert.strictEqual(st.failed, false); assert.ok(st.runs >= 16, 'runs ' + st.runs); assert.strictEqual(st.bad, 0);
      });
      await step(`${preset}: storms, mist and snow at night and dusk pass too`, async () => {
        for (const wx of ['storm', 'mist', 'snow', 'rain']) for (const t of [0.73, 0.96]) {
          const c = await page.evaluate(([wx, t]) => { L21.stage('oakhaven', 23.5, 6.5, Math.PI / 2, t, wx); GPU18.checkSoon(); return L21.frames(GPU18.CHECK.first + 2); }, [wx, t]);
          assert.ok(c.last && c.last.ok, `${wx} ${t}: ${JSON.stringify(c.last)}`);
        }
        assert.strictEqual(await page.evaluate(() => GPU18.active()), true);
      });
      await step(`${preset}: a lost context goes to the canvas the same frame, no latch, and comes back on restore`, async () => {
        const a = await page.evaluate(() => {
          L21.stage('oakhaven', 23.5, 6.5, Math.PI / 2, 0.5);
          const lose = GPU18.gl().getExtension('WEBGL_lose_context'); window.__lose = lose; lose.loseContext();
          render();
          return { gpu: GPU18.active(), failed: GPU18.st.failed, lost: GPU18.st.lost };
        });
        assert.deepStrictEqual(a, { gpu: false, failed: false, lost: true });
        await page.evaluate(() => window.__lose.restoreContext());
        await page.waitForFunction(() => !GPU18.st.lost, null, { timeout: 30000 });
        const b = await page.evaluate(() => { L21.frames(GPU18.CHECK.first + 2); return { gpu: GPU18.active(), failed: GPU18.st.failed, ok: GPU18.st.check.last && GPU18.st.check.last.ok }; });
        assert.deepStrictEqual(b, { gpu: true, failed: false, ok: true });
      });
      await step(`${preset}: a composite that comes out black is caught and the canvas path shows the sky`, async () => {
        const r = await page.evaluate(() => {
          L21.stage('oakhaven', 23.5, 6.5, Math.PI / 2, 0.5); L21.frames(2);
          const before = L21.skyLuma();
          // a driver fault: every draw into the render-resolution composite target writes black instead
          const g = GPU18.gl(), draw = g.drawArrays.bind(g);
          g.drawArrays = function (m, f, c) {
            const vp = g.getParameter(g.VIEWPORT);
            if (g.getParameter(g.FRAMEBUFFER_BINDING) && vp[2] === Engine.canvas.width) { g.clearColor(0, 0, 0, 1); g.clear(g.COLOR_BUFFER_BIT); return; }
            return draw(m, f, c);
          };
          GPU18.checkSoon(); L21.frames(GPU18.CHECK.first + 6);
          g.drawArrays = draw;
          const after = L21.skyLuma();
          return { before, after, gpu: GPU18.active(), failed: GPU18.st.failed, why: GPU18.st.check.failedBy };
        });
        assert.ok(r.before > 60, 'sky before ' + r.before);
        assert.strictEqual(r.gpu, false); assert.strictEqual(r.failed, true); assert.ok(/black picture/.test(r.why), r.why);
        assert.ok(r.after > 60, 'sky after fallback ' + r.after);
        await page.locator('#game').screenshot({ path: path.join(SHOT_DIR, `selfcheck-fallback-${preset}.png`) });
      });
      await step(`${preset}: no page errors (the one self-check warning aside)`, async () => {
        const bad = errors.filter(e => !/self-check: black picture/.test(e));
        assert.deepStrictEqual(bad, []);
      });
      await ctx.close();
    }
  } finally { await browser.close(); }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
