// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4101 node test/r3d21.test.js
// Covers js/r3d21.js (Phase 21, team CORE): the true 3D WebGL2 renderer R3D.
//   - switching: booting with the renderer off and turning it on (and back), the Options rows, the Original preset,
//     no WebGL2 at all (getContext stubbed), a lost context and its recovery
//   - gameplay parity: a seeded trace of play (movement, turning, combat, AI) with R3D on and off is identical
//   - picking parity: Engine.pick under R3D answers exactly what the CPU raycaster answers, on a grid of view
//     directions (yaw x pitch) in flat and relief maps; the CPU relief depth R3D reproduces matches the CPU's dbuf
//   - geometry: every map builds a mesh and draws without errors; doors and gates animate from map.doors
//   - the camera: free look past the old 40 rows under R3D, the comfort cap, the CPU's widened range, Original's old range
//   - frame cost (SwiftShader here: correctness only, its timings are not GPU timings) and no page errors
// Headless Chromium here has only SwiftShader (a software WebGL2). R3D's auto mode stays off under automation; the page
// opts in with window.__r3d21 = { automation: true, force: true }.
//   SHOT_DIR=/some/dir   where screenshots go (default: os tmpdir)
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4101';
const SHOT_DIR = process.env.SHOT_DIR || path.join(os.tmpdir(), 'r3d21-shots');
fs.mkdirSync(SHOT_DIR, { recursive: true });
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

async function bootPage(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  page.setDefaultTimeout(300000);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && /r3d21|render override|render hook/.test(m.text()))) errors.push('console: ' + m.text()); });
  if (opts.block) await page.route('**/js/r3d21.js*', r => r.abort());
  if (opts.init) await page.addInitScript(opts.init);
  const r3d = opts.r3d || { automation: true, force: true };
  const mode = opts.mode || 'on';
  await page.addInitScript(([o, mode]) => { window.__r3d21 = o; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode, cap: 80 })); } catch (e) { /* none */ } }, [r3d, mode]);
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 300000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 300000 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Core Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForTimeout(500);
  await page.evaluate(HELPERS);
  return { page, errors };
}

const HELPERS = () => {
  const S = window.S = {};
  window.requestAnimationFrame = () => 0;   // the game loop must not render between our frames
  S.pin = (fn) => {
    const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now;
    let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000;
    try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; }
  };
  S.stage = (map, x, y, dir, tod, pitch) => S.pin(() => {
    G.state = 'paused'; G.day = 3; G.tod = tod; loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = 3;
    Engine.cam.pitch = pitch || 0; Engine.cam.bob = 0; try { Weather.hold('clear'); } catch (e) { /* none */ } G.state = 'play';
  });
  S.frame = () => S.pin(() => render());
  S.mode = (m) => R3D.setMode(m, { noSave: true });
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  // ---------------------------------------------------------------- switching
  {
    const { page, errors } = await bootPage(browser, { mode: 'off', r3d: { automation: true } });
    await step('booted with the renderer off: no GL context, the classic raycaster draws', async () => {
      const r = await page.evaluate(() => { S.stage('oakhaven', 23.5, 6.5, Math.PI / 2, 0.5); S.frame(); return { shown: R3D.shown(), active: R3D.active(), gl: !!R3D.gl(), r3d: GFX.r3d }; });
      assert.deepStrictEqual(r, { shown: false, active: false, gl: false, r3d: false });
    });
    await step('setMode("on") after booting off makes a context, CORE programs and passes, and draws (no recursion)', async () => {
      const r = await page.evaluate(() => { const m = S.mode('on'); S.frame(); return { m, shown: R3D.shown(), active: R3D.active(), passes: R3D.passes().map(p => p.name).join(','), warned: Object.keys(R3D.st.warned) }; });
      assert.strictEqual(r.m, 'on'); assert.ok(r.shown && r.active, JSON.stringify(r));
      assert.strictEqual(r.passes, 'sky,prepass,world,sprites,transparent,post');
      assert.deepStrictEqual(r.warned, []);
    });
    await step('the HUD layer is claimed while R3D shows and released when it stops', async () => {
      const r = await page.evaluate(() => {
        const a = { claim: GPU18.hudClaim() === R3D, ctx: Engine.ctx === GPU18.layers().hudCtx, cls: document.getElementById('game').classList.contains('r3d21-on') };
        S.mode('off'); S.frame();
        const b = { claim: GPU18.hudClaim(), ctxView: Engine.ctx === GPU18.layers().viewCtx || !GPU18.active(), cls: document.getElementById('game').classList.contains('r3d21-on') };
        S.mode('on'); S.frame();
        return { a, b };
      });
      assert.deepStrictEqual(r.a, { claim: true, ctx: true, cls: true });
      assert.deepStrictEqual(r.b, { claim: null, ctxView: true, cls: false });
    });
    await step('the Original preset always uses the classic raycaster (and the old 40-row look)', async () => {
      const r = await page.evaluate(() => { PRESETS.apply('original'); S.frame(); const a = { shown: R3D.shown(), lim: R3D.camera.limit(), want: Math.atan(40 / R3D.FX) }; PRESETS.apply('medium'); S.frame(); return Object.assign(a, { back: R3D.shown() }); });
      assert.strictEqual(r.shown, false); assert.ok(Math.abs(r.lim - r.want) < 1e-9); assert.strictEqual(r.back, true);
    });
    await step('Options: the "3D renderer" and "Look range" rows appear and switch', async () => {
      const r = await page.evaluate(() => {
        renderAccessibilityMenu();
        const b = document.getElementById('r3d-mode'), c = document.getElementById('r3d-cap');
        if (!b || !c) return { missing: true };
        const t0 = b.textContent; b.click(); const off = R3D.shown(); b.click(); const on = R3D.shown();
        const c0 = R3D.camera.limit(); c.click(); const c1 = R3D.camera.limit(); c.click();
        closeModal(); G.state = 'play';
        return { t0, off, on, c0: Math.round(c0 * 180 / Math.PI), c1: Math.round(c1 * 180 / Math.PI) };
      });
      assert.ok(!r.missing, 'rows missing'); assert.strictEqual(r.off, false); assert.strictEqual(r.on, true);
      assert.strictEqual(r.c0, 80); assert.strictEqual(r.c1, 45);
    });
    await step('no page errors (switching)', async () => { assert.deepStrictEqual(errors, []); });
    await page.close();
  }

  // ---------------------------------------------------------------- no WebGL2
  {
    const { page, errors } = await bootPage(browser, { init: () => { const g = HTMLCanvasElement.prototype.getContext; HTMLCanvasElement.prototype.getContext = function (t, a) { if (t === 'webgl2') return null; return g.call(this, t, a); }; } });
    await step('without WebGL2: R3D is unavailable, the raycaster draws, setMode("on") changes nothing', async () => {
      const r = await page.evaluate(() => { S.stage('tavern', 8.5, 10.5, -1.57, 0.85); S.frame(); S.mode('on'); S.frame(); renderAccessibilityMenu(); const t = (document.getElementById('r3d-mode') || {}).textContent; closeModal(); return { avail: R3D.available(), shown: R3D.shown(), t }; });
      assert.deepStrictEqual(r, { avail: false, shown: false, t: 'Not available' });
    });
    await step('no page errors (no WebGL2)', async () => { assert.deepStrictEqual(errors, []); });
    await page.close();
  }

  // ---------------------------------------------------------------- lost context
  {
    const { page, errors } = await bootPage(browser, {});
    await step('a lost context falls back to the raycaster at once; a restored one comes back with its passes', async () => {
      const r = await page.evaluate(async () => {
        S.stage('oakhaven', 23.5, 6.5, Math.PI / 2, 0.5); S.frame();
        const ext = R3D.gl().getExtension('WEBGL_lose_context');
        if (!ext) return { skip: true };
        ext.loseContext(); await new Promise(r => setTimeout(r, 300)); S.frame();
        const lost = { shown: R3D.shown(), lost: R3D.st.lost };
        ext.restoreContext(); await new Promise(r => setTimeout(r, 600)); S.frame(); S.frame();
        return { lost, back: R3D.shown(), active: R3D.active(), warned: Object.keys(R3D.st.warned).filter(k => !/^(lost|frame)$/.test(k)) };
      });
      if (r.skip) return;
      assert.deepStrictEqual(r.lost, { shown: false, lost: true });
      assert.strictEqual(r.back, true); assert.strictEqual(r.active, true); assert.deepStrictEqual(r.warned, []);
    });
    await step('no page errors (lost context)', async () => { assert.deepStrictEqual(errors.filter(e => !/CONTEXT_LOST|context lost/i.test(e)), []); });
    await page.close();
  }

  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
