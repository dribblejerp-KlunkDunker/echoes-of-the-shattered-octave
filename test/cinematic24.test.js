// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:3000 node test/cinematic24.test.js
// Phase 24 "The opening" (js/cinematic24.js): the camera sequence before the first step.
//  - a new game runs it: the intro screen hosts it, the HUD is off, the bars and captions show, the title card comes,
//    and it ends on loadMap('oakhaven') at the spawn with the clock back at dusk and nothing it staged left behind;
//  - every way out works at once: the Skip button, a click, Escape; the sky it held is let go;
//  - the setting turns it off and the old scrolling text comes back unchanged; the Options rows exist and persist;
//  - "Watch again" replays it from inside a game and puts you back where you stood;
//  - it runs under Reduce motion and on the CPU raycaster (no R3D) alike; no page errors anywhere.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = (process.env.PREVIEW_URL || 'http://127.0.0.1:3000') + '/index.html?nosw=1';
const pass = (m) => console.log('PASS ' + m);

async function boot(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || /cinematic24/.test(m.text())) errors.push(m.type() + ': ' + m.text()); });
  await page.addInitScript((o) => {
    try { localStorage.clear(); if (o.setting) localStorage.setItem('octave.cine24.v1', JSON.stringify(o.setting)); } catch (e) { /* none */ }
    if (o.r3d) window.__r3d21 = { automation: true };
    let a = 2424; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  }, { r3d: opts.r3d !== false, setting: opts.setting || null });
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof CINEMATIC24 !== 'undefined');
  await page.evaluate((o) => { try { if (o.r3d !== false) R3D.setMode('on'); else R3D.setMode('off'); } catch (e) { /* no R3D */ } if (typeof GFX !== 'undefined') { GFX.illustratedScreens = false; if (o.reduce) GFX.reduceMotion = true; } }, opts);
  return { page, errors };
}
// through character creation to the moment the intro (and the cinematic) starts
async function newGame(page, speed) {
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Opening Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.evaluate((s) => { CINEMATIC24.speed = s; }, speed || 1);
  await page.locator('#c-go').click();
  await page.waitForTimeout(300);
}
const snap = (page) => page.evaluate(() => ({
  on: CINEMATIC24.running(), shot: CINEMATIC24.shot(), state: G.state, map: G.mapId, staged: CINEMATIC24.staged(), stats: Object.assign({}, CINEMATIC24.stats),
  cam: [+Engine.cam.x.toFixed(2), +Engine.cam.y.toFixed(2), +Engine.cam.dir.toFixed(3), +Engine.cam.z.toFixed(2)], tod: G.tod,
  introCine: !!document.querySelector('#intro.cine'), skipText: (document.querySelector('#btn-intro-skip') || {}).textContent, ui: !!document.querySelector('#cine24'),
  bars: !!document.querySelector('#cine24.bars'), cap: (document.querySelector('#cine24 .cap') || {}).textContent || '', card: !!document.querySelector('#cine24 .card.on'),
  gameCls: document.getElementById('game').className, held: typeof Weather !== 'undefined' ? Weather.held : null, wstate: typeof Weather !== 'undefined' ? Weather.state : null,
  leftovers: Object.values(G.maps).reduce((n, m) => n + m.entities.filter((e) => e && e._cine).length, 0),
  introPs: document.querySelectorAll('#intro-text p').length,
}));
const untilDone = (page, ms) => page.waitForFunction(() => !CINEMATIC24.running(), null, { timeout: ms || 60000 });

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    // ---------------------------------------------------------------- the whole sequence, R3D, at 6x
    {
      const { page, errors } = await boot(browser, { r3d: true });
      await newGame(page, 1);
      const a = await snap(page);
      await page.evaluate(() => { CINEMATIC24.speed = 6; });
      assert.equal(a.on, true, 'the cinematic runs after creation'); assert.equal(a.state, 'intro', 'in the intro state');
      assert.equal(a.introCine, true, 'the intro screen hosts it'); assert.equal(a.skipText, 'Skip', 'the button says Skip');
      assert.equal(a.ui && a.bars, true, 'bars up'); assert.match(a.cap, /four hundred and nineteenth/, 'the first caption is the first intro line');
      assert.equal(a.map, 'p22_combe', 'the first shot is Wethercombe'); assert.ok(a.gameCls.includes('cine24'), 'the HUD is hidden');
      assert.equal(a.held, true, 'the sky is held'); assert.equal(a.wstate, 'clear', 'and clear');
      // the column shot stages its figures, and the card comes
      await page.waitForFunction(() => CINEMATIC24.shot() === 3, null, { timeout: 30000 });
      await page.waitForTimeout(400);
      const c = await snap(page);
      assert.equal(c.map, 'greenroot', 'the fourth shot is Greenroot'); assert.ok(c.staged >= 12, 'the Synod column is staged (' + c.staged + ')');
      assert.match(c.cap, /glass-fire/, 'its caption');
      await page.waitForFunction(() => CINEMATIC24.shot() === 5, null, { timeout: 30000 });
      await page.waitForTimeout(700);
      const d = await snap(page);
      assert.equal(d.card, true, 'the title card shows'); assert.equal(d.staged, 0, 'the column is gone before the card');
      await untilDone(page, 40000); await page.waitForTimeout(600);
      const e = await snap(page);
      assert.equal(e.state, 'play', 'play after the opening'); assert.equal(e.map, 'oakhaven', 'in Oakhaven');
      assert.deepEqual(e.cam.slice(0, 3), [23.5, 3.5, 1.571], 'at the North Gate spawn, facing the town');
      assert.ok(Math.abs(e.tod - 0.74) < 0.01, 'the clock is back at dusk (' + e.tod.toFixed(3) + ')');
      assert.equal(e.leftovers, 0, 'nothing staged is left in any map'); assert.equal(e.ui, false, 'the overlay is gone');
      assert.equal(e.introCine, false, 'the intro screen is itself again'); assert.equal(e.skipText, 'Continue', 'and its button');
      assert.ok(!e.gameCls.includes('cine24'), 'the HUD is back'); assert.equal(e.held, false, 'the sky is let go');
      assert.equal(e.stats.finished, 1, 'finished once'); assert.equal(e.stats.shots, 7, 'seven shots'); assert.equal(e.stats.errors, 0, 'no internal errors');
      const msgs = await page.evaluate(() => document.querySelector('#msgs').textContent);
      assert.match(msgs, /Nullday/, 'the game\'s own first message follows');
      assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
      pass('the whole opening, R3D: seven shots, the column, the card, and play at the gate');
      await page.close();
    }
    // ---------------------------------------------------------------- skipping: the button, a click, Escape; and a replay
    {
      const { page, errors } = await boot(browser, { r3d: true });
      await newGame(page, 1);
      await page.waitForTimeout(800);
      await page.locator('#btn-intro-skip').click(); await page.waitForTimeout(500);
      let s = await snap(page);
      assert.equal(s.on, false, 'skipped'); assert.equal(s.state, 'play', 'play at once'); assert.equal(s.map, 'oakhaven', 'in Oakhaven');
      assert.deepEqual(s.cam.slice(0, 2), [23.5, 3.5], 'at the spawn'); assert.equal(s.leftovers, 0, 'nothing staged left'); assert.equal(s.held, false, 'the sky let go');
      assert.equal(s.stats.skipped, 1, 'counted as skipped');
      // replay from inside the game: put back where you stood when skipped with Escape
      await page.evaluate(() => { G.state = 'play'; loadMap('oakhaven', { x: 30.5, y: 23.5, dir: 0.4 }); G.state = 'play'; G.fadeT = 0; });
      const ok = await page.evaluate(() => CINEMATIC24.replay());
      assert.equal(ok, true, 'replay starts'); await page.waitForTimeout(500);
      s = await snap(page);
      assert.equal(s.on && s.state === 'intro', true, 'replaying in the intro state'); assert.equal(s.map, 'p22_combe', 'from the first shot');
      await page.keyboard.press('Escape'); await page.waitForTimeout(500);
      s = await snap(page);
      assert.equal(s.on, false, 'Escape skips the replay'); assert.equal(s.state, 'play', 'back in play');
      assert.deepEqual(s.cam.slice(0, 3), [30.5, 23.5, 0.4], 'where you stood'); assert.equal(s.leftovers, 0, 'nothing left');
      // a click on the screen skips too
      await page.evaluate(() => CINEMATIC24.replay()); await page.waitForTimeout(400);
      await page.mouse.click(640, 300); await page.waitForTimeout(400);
      s = await snap(page);
      assert.equal(s.on, false, 'a click skips'); assert.equal(s.state, 'play', 'and plays on');
      assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
      pass('skip by button, Escape and click; replay returns you to where you stood');
      await page.close();
    }
    // ---------------------------------------------------------------- the setting off: the old intro, untouched
    {
      const { page, errors } = await boot(browser, { r3d: true, setting: { play: 0 } });
      await newGame(page, 1);
      const s = await snap(page);
      assert.equal(s.on, false, 'no cinematic'); assert.equal(s.state, 'intro', 'the old intro'); assert.equal(s.introCine, false, 'plain intro screen');
      assert.equal(s.introPs, 6, 'six paragraphs of the old text'); assert.equal(s.skipText, 'Continue', 'its own button'); assert.equal(s.ui, false, 'no overlay');
      await page.locator('#btn-intro-skip').click(); await page.waitForTimeout(400);
      const t = await snap(page);
      assert.equal(t.state, 'play', 'Continue plays'); assert.equal(t.map, 'oakhaven', 'in Oakhaven');
      // the Options rows: the switch persists; the replay row exists in a game
      const rows = await page.evaluate(() => {
        renderAccessibilityMenu();
        const b = document.getElementById('cine24-play'), r = document.getElementById('cine24-replay');
        const before = b && b.textContent; if (b) b.click();
        const after = b && b.textContent; const stored = localStorage.getItem('octave.cine24.v1');
        closeModal(); G.state = 'play';
        return { before, after, stored, replay: !!r };
      });
      assert.equal(rows.before, 'Off', 'the row shows Off'); assert.equal(rows.after, 'On', 'and toggles'); assert.equal(rows.stored, '{"play":1}', 'and persists');
      assert.equal(rows.replay, true, 'a replay row in a game');
      assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
      pass('setting off gives the old intro; the Options rows toggle and persist');
      await page.close();
    }
    // ---------------------------------------------------------------- Reduce motion, and the CPU raycaster, at 8x
    for (const o of [{ r3d: true, reduce: true, name: 'Reduce motion' }, { r3d: false, name: 'CPU raycaster (no R3D)' }]) {
      const { page, errors } = await boot(browser, o);
      await newGame(page, 8);
      await page.waitForTimeout(600);
      const a = await snap(page);
      assert.equal(a.on, true, 'runs');
      if (!o.r3d) assert.equal(a.cam[3], a.cam[3] && +(await page.evaluate(() => (G.map.groundAt ? G.map.groundAt(Engine.cam.x, Engine.cam.y) : 0) + 0.88)).toFixed(2), 'eye height on the raycaster');
      if (o.reduce) { const b = await snap(page); assert.deepEqual(b.cam.slice(0, 2), a.cam.slice(0, 2), 'the camera holds still under Reduce motion'); }
      await untilDone(page, 40000); await page.waitForTimeout(500);
      const e = await snap(page);
      assert.equal(e.state, 'play', 'play after'); assert.equal(e.map, 'oakhaven', 'in Oakhaven'); assert.equal(e.leftovers, 0, 'nothing left'); assert.equal(e.stats.errors, 0, 'no internal errors');
      assert.deepEqual(errors, [], 'page errors: ' + errors.join(' | '));
      pass('the opening under ' + o.name);
      await page.close();
    }
  } finally {
    await browser.close();
  }
})().catch((e) => { console.error('FAIL ' + (e && e.message ? e.message : e)); process.exitCode = 1; });
