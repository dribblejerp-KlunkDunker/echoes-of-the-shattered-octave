// PREVIEW_URL=http://127.0.0.1:4103 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/figures23.test.js
// Phase 23 (js/figures23.js): living figures. Checks: every pilot rig builds (parts, a jaw where there is a face, cards
// for what the body does not cover); on the true 3D renderer the pilots are drawn as figures (the figure pass draws them
// and their pictures are not drawn as billboards), their screen rects stay the pictures' so picking and talking work;
// the animator moves the right bones (walk swings legs, talking opens the jaw, a strike raises the weapon arm); puppets
// answer the sprite chooser on both renderers with cached frames; Original (the option or the preset) gives exactly the
// original pictures; the module never calls Math.random; no page errors. Never starts a server.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.PREVIEW_URL || 'http://127.0.0.1:4103';

async function boot(browser) {
  const page = await browser.newPage({ viewport: { width: 800, height: 500 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /figures23/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => {
    window.__r3d21 = { automation: true };
    let s = 424242; window.__rnd = 0;
    Math.random = () => { window.__rnd++; return (s = (s * 16807) % 2147483647) / 2147483647; };
  });
  await page.goto(URL_ + '/?nosw=1', { timeout: 180000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 180000 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Figure Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    G.state = 'play'; loadMap('oakhaven'); G.fadeT = 0; G.tod = 0.5;
    for (const e of G.ents) if (e.kind === 'enemy' || e.kind === 'npc') e.hidden = true;
    const c = Engine.cam; c.x = 23.5; c.y = 3.5; c.dir = Math.PI / 2; c.pitch = 0;
    const add = (o, x, y) => { const e = hydrate(Object.assign({ x, y }, o)); e.wanderT = 1e9; e.facing = -Math.PI / 2; G.ents.push(e); return e; };
    window.__pilot = [
      add({ kind: 'npc', id: 'f_k', name: 'Kaelen', sprite: 'kaelen', solid: true, radius: 0.3, lines: ['.'] }, 22.6, 5.9),
      add({ kind: 'npc', id: 'f_t', name: 'Townsman', sprite: 'townsman', solid: true, radius: 0.3, lines: ['.'] }, 23.5, 6.1),
      add({ kind: 'enemy', type: 'legionnaire', passive: true }, 24.4, 5.9),
    ];
    window.__step = (n) => { for (let i = 0; i < (n || 1); i++) { try { animFrame(); } catch (e) { /* fine */ } render(); } };
  });
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const { page, errors } = await boot(browser);

    // ---------------------------------------------------------------- rigs build
    const rigs = await page.evaluate(() => {
      const out = {};
      for (const n of ['kaelen', 'townsman', 'legionnaire']) {
        const m = FIGURES23.modelFor(n);
        out[n] = m && { parts: m.parts.length, kinds: [...new Set(m.parts.map((p) => p.kind))].sort(), verts: m.verts.length / 13, cards: m.parts.filter((p) => p.kind === 'card').length };
      }
      return out;
    });
    for (const n of ['kaelen', 'townsman', 'legionnaire']) assert.ok(rigs[n] && rigs[n].parts > 15, n + ' rig builds: ' + JSON.stringify(rigs[n]));
    assert.ok(rigs.townsman.kinds.includes('cavity') && rigs.townsman.kinds.includes('lid'), 'a face gets a jaw and eyelids');
    assert.ok(!rigs.legionnaire.kinds.includes('cavity'), 'a closed helm has no jaw');
    assert.ok(rigs.legionnaire.cards >= 1, 'the polearm becomes a card held by the hand');

    // ---------------------------------------------------------------- 3D figures on R3D
    const fig = await page.evaluate(() => {
      R3D.setMode('on'); FIGURES23.setMode('figures');
      __step(3);
      const scr = __pilot.map((e) => !!e._screen);
      // the crosshair on the townsman picks him (rects are the pictures')
      const t = __pilot[1]; const c = Engine.cam; c.dir = Math.atan2(t.y - c.y, t.x - c.x); __step(2);
      const picked = Engine.pick(G.ents, 6);
      return { shown: R3D.shown(), drawn: FIGURES23.st.drawn, queue: FIGURES23.queue.length, scr, picked: picked && picked.id };
    });
    assert.ok(fig.shown, 'R3D is shown');
    assert.equal(fig.queue, 3, 'all three pilots are figures: ' + JSON.stringify(fig));
    assert.equal(fig.drawn, 3, 'the figure pass draws them');
    assert.deepEqual(fig.scr, [true, true, true], 'screen rects are filled for overlays');
    assert.equal(fig.picked, 'f_t', 'picking still finds the townsman');

    // ---------------------------------------------------------------- the animator
    const anim = await page.evaluate(() => {
      const m = FIGURES23.modelFor('townsman');
      const base = { t: 1, seed: 0, walkPh: 0, walk: 0, atk: -1, hurt: 0, stun: false, talk: 0, blink: 0.08, yaw: 0, pitch: 0, heavy: false, weapon: 1 };
      const R = (s) => Array.from(FIGURES23.pose(m, s).R);
      const rest = R(base);
      const walk = R(Object.assign({}, base, { walk: 1, walkPh: Math.PI / 2 }));
      const talk = R(Object.assign({}, base, { talk: 1 }));
      const atk = R(Object.assign({}, base, { atk: 0.38 }));
      return { thigh: [walk[13 * 3] - rest[13 * 3], walk[16 * 3] - rest[16 * 3]], jaw: talk[4 * 3] - rest[4 * 3], arm: atk[10 * 3] - rest[10 * 3] };
    });
    assert.ok(anim.thigh[0] > 0.3 && anim.thigh[1] < -0.3, 'walking swings the legs opposite ways: ' + anim.thigh);
    assert.ok(anim.jaw < -0.2, 'talking drops the jaw: ' + anim.jaw);
    assert.ok(anim.arm > 1.5, 'a wind-up raises the weapon arm: ' + anim.arm);

    // ---------------------------------------------------------------- puppets, both renderers
    const pup = await page.evaluate(() => {
      const res = {};
      for (const r3d of ['on', 'off']) {
        R3D.setMode(r3d); FIGURES23.setMode('puppets');
        const f0 = FIGURES23.st.puppetFrames;
        __step(4);
        const pick = animDirectionalSprite(__pilot[1]);
        res[r3d] = { f23: !!(pick && pick.sprite && pick.sprite.f23), made: FIGURES23.st.puppetFrames - f0, queue: FIGURES23.queue.length };
      }
      // frames are cached: the same pose twice is one sprite
      const a = animDirectionalSprite(__pilot[1]).sprite, b = animDirectionalSprite(__pilot[1]).sprite;
      res.cached = a === b;
      // 3D figures on the classic renderer fall back to puppets
      FIGURES23.setMode('figures'); res.fallback = !!animDirectionalSprite(__pilot[1]).sprite.f23;
      return res;
    });
    assert.ok(pup.on.f23 && pup.off.f23, 'puppets answer on both renderers: ' + JSON.stringify(pup));
    assert.ok(pup.cached, 'puppet frames are cached');
    assert.ok(pup.fallback, '3D figures on Classic are shown as puppets');

    // ---------------------------------------------------------------- Original gives the pictures
    const orig = await page.evaluate(() => {
      FIGURES23.setMode('off'); R3D.setMode('on'); __step(2);
      const a = { queue: FIGURES23.queue.length && FIGURES23.G3.frameNo, sprite: animDirectionalSprite(__pilot[1]).sprite === Engine.sprites.townsman };
      FIGURES23.setMode('figures'); const keep = GFX.p23_figures; GFX.p23_figures = false; __step(2);
      a.flagOff = FIGURES23.mode() === 'off' && animDirectionalSprite(__pilot[1]).sprite === Engine.sprites.townsman;
      GFX.p23_figures = keep;
      return a;
    });
    assert.ok(orig.sprite, 'Original: the townsman is his picture');
    assert.ok(orig.flagOff, 'GFX.p23_figures off: the pictures');

    // ---------------------------------------------------------------- no game random numbers
    const rnd = await page.evaluate(() => {
      R3D.setMode('on'); FIGURES23.setMode('figures');
      FIGURES23.models.clear();
      const n0 = window.__rnd; for (const e of __pilot) e._f23 = null;
      FIGURES23.modelFor('townsman'); FIGURES23.modelFor('kaelen');
      const st = FIGURES23.stateFor(__pilot[1], 0.03, 2);
      return window.__rnd - n0;
    });
    assert.equal(rnd, 0, 'figures23 consumes no game random numbers');

    assert.deepEqual(errors.filter((e) => !/READ-usage buffer|GPU stall|performance warning/.test(e)), [], 'no page errors');
    console.log('figures23: ok');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
