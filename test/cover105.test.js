// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/cover105.test.js
// Covers js/cover105.js (Phase 105, "Ground cover": #44's tufts, pebbles and leaves on Phase 77's ground).
//   - which tiles get cover (grass, turf, dirt, tracks; never stone, snow, water, boards), by name and by colour
//   - near the player outdoors in the 3D renderer: tufts on Oakhaven's green, leaves in the Deep Woods; the same every
//     time (no random numbers); nothing indoors; it changes the picture, and switching it off changes it back
//   - picks, depth and material read-back are the same with it on and off (it writes colour only)
//   - the Options row; off in Original and Low, on in Medium and above; Reduce motion stops the sway
//   - pictures to look at: $SHOT_DIR (default: the system temp folder)/cover105-*.png; no page errors
'use strict';
const path = require('node:path');
const fs = require('node:fs');
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const OUT = process.env.SHOT_DIR || path.join(require('node:os').tmpdir(), 'cover105'); fs.mkdirSync(OUT, { recursive: true });
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /cover105|r3d21/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Cover Tester');
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
    const S = window.S = {};
    window.requestAnimationFrame = () => 0;
    S.pin = (fn) => {
      const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now;
      let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000;
      try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; }
    };
    S.stage = (map, x, y, dir, tod) => S.pin(() => {
      G.state = 'paused'; G.day = 3; G.tod = tod; loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = 3;
      Engine.cam.pitch = 0; Engine.cam.bob = 0; try { Weather.hold('clear'); } catch (e) { /* none */ } G.state = 'play';
    });
    S.frame = () => S.pin(() => render());
    // the open cell on this map with the most grass, turf or dirt around it (5 x 5)
    S.patch = (map) => S.pin(() => {
      loadMap(map, { x: 2.5, y: 2.5, dir: 0 }); const m = G.map, W = m.w, H = m.h;
      const tex = (x, y) => { if (m.floorCells && m.floorTextures) { const i = m.floorCells[y * W + x]; if (i && m.floorTextures[i]) return m.floorTextures[i]; } return m.floor; };
      let best = null, bs = -1;
      for (let y = 3; y < H - 3; y++) for (let x = 3; x < W - 3; x++) {
        if (m.isBlocked && m.isBlocked(x, y)) continue;
        let sc = 0; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) if (!(m.isBlocked && m.isBlocked(x + dx, y + dy)) && COVER105.familyOf(tex(x + dx, y + dy))) sc++;
        if (sc > bs) { bs = sc; best = [x + 0.5, y + 0.5]; }
      }
      return best;
    });
    S.hash = () => { const p = R3D.readPixels(); if (!p) return 0; let h = 0x811c9dc5 | 0; const d = p.data; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) | 0; return h >>> 0; };
    S.shot = () => { const p = R3D.readPixels(); const c = document.createElement('canvas'); c.width = p.w; c.height = p.h; const x = c.getContext('2d'); const id = x.createImageData(p.w, p.h); for (let y = 0; y < p.h; y++) id.data.set(p.data.subarray((p.h - 1 - y) * p.w * 4, (p.h - y) * p.w * 4), y * p.w * 4); x.putImageData(id, 0, 0); return c.toDataURL('image/png'); };
  });
  const save = async (name, url) => fs.writeFileSync(path.join(OUT, 'cover105-' + name + '.png'), Buffer.from(url.split(',')[1], 'base64'));

  try {
    await step('which ground gets cover: grass, turf, dirt and tracks; never stone, snow, water or boards', async () => {
      const r = await page.evaluate(() => ['t_grass', 'p17c_turf', 't_moss', 't_p20_track', 't_grass_p20b_a', 't_grass_p20b_d', 't_moss_p20b_b', 't_cobble', 't_flag', 'p17p_snow', 't_water', 'p17c_plank', 't_p20_chalk'].map((n) => COVER105.familyOf(n)));
      assert.deepStrictEqual(r, ['grass', 'turf', 'dirt', 'track', 'grass', 'grass', 'dirt', '', '', '', '', '', '']);
      const guessed = await page.evaluate(() => Object.keys(Engine.textures).filter((n) => COVER105.familyOf(n)).length);
      assert.ok(guessed >= 5, 'only ' + guessed + ' textures get cover');
    });
    await step('Oakhaven\'s green and the Deep Woods: cover near the player, the same every time, drawn, and gone when off', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); const out = {};
        for (const [map, yaw] of [['oakhaven', -1.57], ['deepwoods', -1.57]]) {
          const [x, y] = S.patch(map);
          GFX.groundCover = true; S.stage(map, x, y, yaw, 0.5); R3D.camera.setAngle(-22 * Math.PI / 180); S.frame(); S.frame();
          const n = COVER105.cover.n, a = Array.from(COVER105.cover.buf.subarray(0, n * 12)).map((v) => v.toFixed(4)).join(',');
          const layers = new Set(); for (let i = 0; i < n; i++) layers.add(COVER105.cover.buf[i * 12 + 7]);
          COVER105.cover.cellKey = ''; S.frame();
          const b = Array.from(COVER105.cover.buf.subarray(0, COVER105.cover.n * 12)).map((v) => v.toFixed(4)).join(',');
          const hOn = S.hash(), shotOn = S.shot(); GFX.groundCover = false; S.frame(); const hOff = S.hash(), shotOff = S.shot(); GFX.groundCover = true;
          out[map] = { n, same: a === b, changed: hOn !== hOff, layers: [...layers].sort(), active: R3D.active(), shotOn, shotOff };
        }
        out.indoorDrew = R3D.passes ? R3D.passes().some((p) => p.name === 'cover105') : true;
        return out;
      });
      for (const m of ['oakhaven', 'deepwoods']) { await save(m + '-on', r[m].shotOn); await save(m + '-off', r[m].shotOff); }
      assert.ok(r.oakhaven.active, 'R3D not active');
      for (const m of ['oakhaven', 'deepwoods']) {
        assert.ok(r[m].n > 20, m + ': only ' + r[m].n + ' pieces');
        assert.ok(r[m].same, m + ': not the same twice');
        assert.ok(r[m].changed, m + ': drew nothing');
      }
      assert.ok(r.oakhaven.layers.some((l) => l <= 2), 'no tufts on Oakhaven\'s green ' + r.oakhaven.layers);
      assert.ok(r.deepwoods.layers.some((l) => l === 5 || l === 6), 'no fallen leaves in the Deep Woods ' + r.deepwoods.layers);
      assert.ok(r.indoorDrew, 'the pass is not registered');
    });
    await step('indoors nothing is drawn', async () => {
      const r = await page.evaluate(() => { S.stage('tavern', 8.5, 10.5, -1.57, 0.85); GFX.groundCover = true; S.frame(); S.frame(); /* two frames: the sculpted hands (the default since Phase 122) are first drawn on the second frame after arriving on a map (probed 23 Nov: frame 1 has no hands, frames 2 on are identical), which is not the cover's doing */ const a = S.hash(); GFX.groundCover = false; S.frame(); const b = S.hash(); GFX.groundCover = true; return { a, b }; });
      assert.strictEqual(r.a, r.b);
    });
    await step('picks and the depth and material read-back are the same with it on and off', async () => {
      const r = await page.evaluate(() => {
        const out = [];
        for (const v of [false, true]) {
          GFX.groundCover = v; const res = [];
          for (const [map, x, y, yaw, deg] of [['oakhaven', 23.5, 20.5, -1.57, 0], ['oakhaven', 23.5, 20.5, -1.2, -30], ['oakhaven', 23.5, 20.5, 0.4, -60], ['deepwoods', 27.5, 30.5, -1.57, -30], ['deepwoods', 27.5, 30.5, 0.6, -10]]) {
            S.stage(map, x, y, yaw, 0.5); R3D.camera.setAngle(deg * Math.PI / 180); S.frame(); S.frame();
            const p = Engine.pick(G.ents, 6); res.push([p ? (p.id || p.type || p.name || 'ent') : null, R3D.depthAt(160, 75).toFixed(3), R3D.materialAt(160, 120), R3D.materialAt(40, 140)]);
          }
          out.push(JSON.stringify(res));
        }
        GFX.groundCover = true; return out;
      });
      assert.strictEqual(r[1], r[0]);
    });
    await step('Reduce motion stops the sway', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); GFX.groundCover = true; S.stage('oakhaven', 23.5, 20.5, -1.57, 0.5); R3D.camera.setAngle(-35 * Math.PI / 180);
        const was = !!GFX.reduceMotion; GFX.reduceMotion = false; S.frame(); let sw0 = 0; for (let i = 0; i < COVER105.cover.n; i++) sw0 += COVER105.cover.buf[i * 12 + 11];
        GFX.reduceMotion = true; S.frame(); let sw1 = 0; for (let i = 0; i < COVER105.cover.n; i++) sw1 += COVER105.cover.buf[i * 12 + 11];
        GFX.reduceMotion = was; S.frame(); return { sw0, sw1 };
      });
      assert.ok(r.sw0 > 0 && r.sw1 === 0, JSON.stringify(r));
    });
    await step('Options: "Ground cover" switches it; Original and Low turn it off, Medium and above on', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); renderAccessibilityMenu();
        const b = document.getElementById('gfx-cover105'); if (!b) return { missing: true };
        const t0 = b.textContent; b.click(); const off = GFX.groundCover, t1 = b.textContent; b.click(); const on = GFX.groundCover;
        closeModal(); G.state = 'play';
        const pre = {}; for (const p of ['original', 'low', 'medium', 'high', 'ultra', 'cinematic']) { PRESETS.apply(p); pre[p] = GFX.groundCover; }
        PRESETS.apply('medium');
        return { t0, t1, off, on, pre };
      });
      assert.ok(!r.missing, 'row missing');
      assert.deepStrictEqual([r.t0, r.t1, r.off, r.on], ['On', 'Off', false, true]);
      assert.deepStrictEqual(r.pre, { original: false, low: false, medium: true, high: true, ultra: true, cinematic: true });
    });
    await step('cost: under 1.5 ms a frame on this software GPU, rebuilding the cover every frame (it is only rebuilt on a new cell)', async () => {
      const r = await page.evaluate(() => { GFX.groundCover = true; S.stage('oakhaven', 23.5, 20.5, -1.57, 0.5); R3D.camera.setAngle(-35 * Math.PI / 180); S.frame(); let t = 0; for (let i = 0; i < 6; i++) { COVER105.cover.cellKey = ''; render(); t += COVER105.cover.ms; } return { ms: t / 6, n: COVER105.cover.n }; });
      console.log('  cover: ' + r.n + ' pieces, ' + r.ms.toFixed(2) + ' ms');
      assert.ok(r.ms < 1.5, r.ms.toFixed(2) + ' ms');
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log('cover105: ' + passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
