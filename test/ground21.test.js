// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4106 node test/ground21.test.js
// Covers js/ground21-art.js and js/ground21.js (Phase 21, team GROUND): close-up pixel-art detail for R3D.
//   - every floor, ground, wall and ceiling texture of every map has a 256 x 256 detail texture (drawn in the Worker)
//   - each detail texture tiles seamlessly, its 16 x 16 block means agree with the base texture, and it is the same
//     picture in the browser's Worker, on the page's main thread and in node (deterministic)
//   - R3D uses it up close (the frame changes there) and not far away; picks and the read-back are unchanged
//   - Original is byte-identical (CPU frames hashed with the GROUND scripts blocked and loaded), and R3D with the switch
//     off draws the very same pixels as without the scripts
//   - the Options row and the preset rule (off in Original, on in every other preset)
//   - frame cost (reported; SwiftShader here, not a GPU) and no page errors
//   - test/r3d21.test.js still passes (run as a child; SKIP_R3D=1 skips it)
'use strict';
const path = require('node:path');
const assert = require('node:assert');
const { spawnSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ART = require(path.join(__dirname, '..', 'js', 'ground21-art.js'));

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4106';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

async function bootPage(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' || (m.type() === 'warning' && /ground21|r3d21|render override|render hook/.test(m.text()))) errors.push('console: ' + m.text()); });
  if (opts.block) await page.route('**/js/ground21*.js*', r => r.abort());
  if (opts.init) await page.addInitScript(opts.init);
  const mode = opts.mode || 'on';
  await page.addInitScript(([mode]) => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode, cap: 80 })); } catch (e) { /* none */ } }, [mode]);
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL + '/?nosw=1', { timeout: 300000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 300000 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Ground Tester');
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
    S.stage = (map, x, y, dir, tod, pitch) => S.pin(() => {
      G.state = 'paused'; G.day = 3; G.tod = tod; loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = 3;
      Engine.cam.pitch = pitch || 0; Engine.cam.bob = 0; try { Weather.hold('clear'); } catch (e) { /* none */ } G.state = 'play';
    });
    S.frame = () => S.pin(() => render());
    S.hash = () => { const p = R3D.readPixels(); if (!p) return 0; let h = 0x811c9dc5 | 0; const d = p.data; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) | 0; return h >>> 0; };
    S.mean = () => { const p = R3D.readPixels(); const d = p.data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; };
  });
  return { page, errors };
}
async function waitDrawn(page, names) {
  await page.evaluate((ns) => { GROUND21.prepare(ns); }, names);
  for (let i = 0; i < 1200; i++) {
    const left = await page.evaluate((ns) => ns.filter(n => GROUND21.ART.wants(n) && !GROUND21.detail(n)).length + GROUND21.pending(), names);
    if (!left) return true;
    await page.waitForTimeout(1000);
  }
  return false;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });

  // ---------------------------------------------------------------- the art
  {
    const { page, errors } = await bootPage(browser, {});
    const inv = await page.evaluate(() => {
      const all = new Set(), per = {};
      for (const id of Object.keys(G.maps)) { const m = G.maps[id]; S.stage(id, m.spawn.x, m.spawn.y, 0, 0.5, 0); S.frame(); const ns = GROUND21.mapNames(G.map); per[id] = ns.length; ns.forEach(n => all.add(n)); }
      return { names: Array.from(all).sort(), maps: Object.keys(per).length };
    });
    const wanted = inv.names.filter(n => ART.wants(n)), skipped = inv.names.filter(n => !ART.wants(n));
    console.log(`  ${inv.maps} maps use ${inv.names.length} textures: ${wanted.length} get detail, skipped (water, animated): ${skipped.join(' ')}`);
    await step('every floor, ground, wall and ceiling texture the maps use has a family (none guessed) and a detail texture', async () => {
      assert.ok(inv.maps >= 40 && wanted.length >= 50, JSON.stringify({ maps: inv.maps, wanted: wanted.length }));
      assert.deepStrictEqual(skipped.filter(n => !/^(t_water|t_shallows)$/.test(n)), []);
      assert.deepStrictEqual(wanted.filter(n => !ART.NAMES[n]), []);
      const t0 = Date.now(); const ok = await waitDrawn(page, wanted);
      console.log(`  drew ${wanted.length} detail textures in the Worker in ${((Date.now() - t0) / 1000).toFixed(1)} s (SwiftShader page, shared CPU)`);
      assert.ok(ok, 'timed out drawing the detail textures');
      const bad = await page.evaluate((ns) => ns.filter(n => { const d = GROUND21.detail(n); return !d || d.length !== 256 * 256 * 4; }), wanted);
      assert.deepStrictEqual(bad, []);
    });
    const q = await page.evaluate((ns) => {
      const A = GROUND21.ART, out = {};
      for (const n of ns) {
        const base = new Uint8Array(Engine.textures[n].buffer, Engine.textures[n].byteOffset, 64 * 64 * 4), det = GROUND21.detail(n);
        const up = new Uint8Array(256 * 256 * 4);   // the base at 4x (nearest), to compare its own wrap edge
        for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) for (let c = 0; c < 4; c++) up[(y * 256 + x) * 4 + c] = base[((y >> 2) * 64 + (x >> 2)) * 4 + c];
        const opaque = (() => { let n0 = 0; for (let i = 3; i < base.length; i += 4) if (base[i] > 100) n0++; return n0 / 4096; })();
        const be = A.blockMeanError(base, det);
        const cols = new Set(); for (let i = 0; i < det.length; i += 4) cols.add((det[i] << 16) | (det[i + 1] << 8) | det[i + 2]);
        out[n] = { seam: A.seamRatio(det), baseSeam: A.seamRatio(up), max: be.max, mean: be.mean, colors: cols.size, opaque, sum: A.texSum(det), base: Array.from(base) };
      }
      return out;
    }, wanted);
    await step('every detail texture tiles seamlessly (its wrap edge is no harsher than its inside, or than the base\'s own edge)', async () => {
      const bad = wanted.filter(n => !(q[n].seam <= Math.max(1.6, q[n].baseSeam * 1.5))).map(n => n + ' ' + q[n].seam.toFixed(2) + '/' + q[n].baseSeam.toFixed(2));
      assert.deepStrictEqual(bad, []);
    });
    await step('every detail texture agrees with its base: 16 x 16 block means within 4 levels (mean error under 0.6)', async () => {
      const bad = wanted.filter(n => q[n].opaque > 0.9 && !(q[n].max <= 4 && q[n].mean <= 0.6)).map(n => n + ' max ' + q[n].max.toFixed(2) + ' mean ' + q[n].mean.toFixed(2));
      const worst = wanted.slice().sort((a, b) => q[b].max - q[a].max).slice(0, 3).map(n => n + ' ' + q[n].max.toFixed(2));
      console.log('  block-mean error: worst ' + worst.join(', ') + '; average of means ' + (wanted.reduce((s, n) => s + q[n].mean, 0) / wanted.length).toFixed(3));
      assert.deepStrictEqual(bad, []);
    });
    await step('pixel art, not an upscale: a palette of at most 256 colours per texture, and far more distinct 4 x 4 cells than the base has texels', async () => {
      const bad = wanted.filter(n => !(q[n].colors <= 256 && q[n].colors >= 8)).map(n => n + ' ' + q[n].colors);
      assert.deepStrictEqual(bad, []);
      // an upscale repeats each texel as a flat 4 x 4 block: count blocks that are not flat
      const flat = await page.evaluate((ns) => ns.map(n => { const d = GROUND21.detail(n); let f = 0; for (let by = 0; by < 64; by++) for (let bx = 0; bx < 64; bx++) { const o = (by * 4 * 256 + bx * 4) * 4; let same = true; for (let j = 0; j < 4 && same; j++) for (let i = 0; i < 4; i++) { const k = ((by * 4 + j) * 256 + bx * 4 + i) * 4; if (d[k] !== d[o] || d[k + 1] !== d[o + 1] || d[k + 2] !== d[o + 2]) { same = false; break; } } if (same) f++; } return [n, f / 4096]; }), wanted);
      const tooFlat = flat.filter(([n, f]) => f > 0.85).map(([n, f]) => n + ' ' + f.toFixed(2));
      assert.deepStrictEqual(tooFlat, []);
    });
    await step('deterministic: the Worker, the page\'s main thread and node draw the same pixels (three textures)', async () => {
      for (const n of ['t_cobble', 't_grass', 't_wood'].filter(x => wanted.includes(x))) {
        const main = await page.evaluate((n) => { const b = new Uint8Array(Engine.textures[n].buffer, Engine.textures[n].byteOffset, 16384); return GROUND21.ART.texSum(GROUND21.ART.make(n, new Uint8Array(b)).data); }, n);
        const nodeSum = ART.texSum(ART.make(n, Uint8Array.from(q[n].base)).data);
        assert.strictEqual(main, q[n].sum, n + ' main thread vs worker'); assert.strictEqual(nodeSum, q[n].sum, n + ' node vs worker');
      }
    });
    await step('R3D draws the detail up close (75 degrees down the frame changes) and keeps the base far away (the mean colour holds)', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); S.stage('oakhaven', 23.5, 20.5, -1.57, 0.5); R3D.camera.setAngle(-75 * Math.PI / 180);
        GFX.p21_ground = false; S.frame(); const offH = S.hash(), offM = S.mean();
        GFX.p21_ground = true; S.frame(); S.frame(); const onH = S.hash(), onM = S.mean();
        R3D.camera.setAngle(0); GFX.p21_ground = false; S.frame(); const lvOff = S.mean(); GFX.p21_ground = true; S.frame(); const lvOn = S.mean();
        return { offH, onH, offM, onM, lvOff, lvOn, slot: GROUND21.slotOf(G.map.floor || 't_flag'), active: R3D.active() };
      });
      assert.ok(r.active, 'R3D not active'); assert.notStrictEqual(r.onH, r.offH, 'no change looking down');
      assert.ok(Math.abs(r.onM - r.offM) < 6, 'mean colour moved looking down: ' + r.offM.toFixed(1) + ' -> ' + r.onM.toFixed(1));
      assert.ok(Math.abs(r.lvOn - r.lvOff) < 3, 'mean colour moved looking level: ' + r.lvOff.toFixed(1) + ' -> ' + r.lvOn.toFixed(1));
    });
    await step('picks and the depth/material read-back are the same with the detail and ground cover on and off', async () => {
      const r = await page.evaluate(() => {
        const out = [];
        for (const on of [false, true]) {
          GFX.p21_ground = on; const res = [];
          for (const [map, x, y, yaw, deg] of [['oakhaven', 23.5, 20.5, -1.57, 0], ['oakhaven', 23.5, 20.5, -1.2, -30], ['oakhaven', 23.5, 20.5, 0.4, -60], ['oakhaven', 23.5, 20.5, 2.0, 20], ['deepwoods', 27.5, 30.5, -1.57, -30], ['deepwoods', 27.5, 30.5, 0.6, -10]]) {
            S.stage(map, x, y, yaw, 0.5); R3D.camera.setAngle(deg * Math.PI / 180); S.frame(); S.frame();
            const p = Engine.pick(G.ents, 6); res.push([p ? (p.id || p.type || p.name || 'ent') : null, R3D.depthAt(160, 75).toFixed(3), R3D.materialAt(160, 120), R3D.materialAt(40, 140)]);
          }
          out.push(JSON.stringify(res));
        }
        GFX.p21_ground = true;
        return out;
      });
      assert.strictEqual(r[1], r[0]);
    });
    await step('Options: "Close-up detail" appears and switches GFX.p21_ground; Original turns it off, every other preset on', async () => {
      const r = await page.evaluate(() => {
        renderAccessibilityMenu();
        const b = document.getElementById('p21-ground'); if (!b) return { missing: true };
        const t0 = b.textContent; b.click(); const off = GFX.p21_ground, t1 = b.textContent; b.click(); const on = GFX.p21_ground;
        closeModal(); G.state = 'play';
        const pre = {}; for (const p of ['original', 'low', 'medium', 'high', 'ultra', 'cinematic']) { PRESETS.apply(p); pre[p] = GFX.p21_ground; }
        PRESETS.apply('medium');
        return { t0, t1, off, on, pre };
      });
      assert.ok(!r.missing, 'row missing');
      assert.deepStrictEqual([r.t0, r.t1, r.off, r.on], ['On', 'Off', false, true]);
      assert.deepStrictEqual(r.pre, { original: false, low: true, medium: true, high: true, ultra: true, cinematic: true });
    });
    await step('ground cover: tufts, pebbles and leaves near the player outdoors, the same every build; its own row; off in Original', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium'); GFX.p21_ground = true; GFX.p21_groundCover = true;
        S.stage('deepwoods', 27.5, 30.5, -1.57, 0.5); R3D.camera.setAngle(-30 * Math.PI / 180); S.frame();
        const n1 = GROUND21.cover.n, a = Array.from(GROUND21.cover.buf.subarray(0, n1 * 12)).map(v => v.toFixed(4)).join(',');
        GROUND21.cover.cellKey = ''; S.frame();
        const b = Array.from(GROUND21.cover.buf.subarray(0, GROUND21.cover.n * 12)).map(v => v.toFixed(4)).join(',');
        const h1 = S.hash(); GFX.p21_groundCover = false; S.frame(); const h0 = S.hash(); GFX.p21_groundCover = true;
        S.stage('tavern', 8.5, 10.5, -1.57, 0.85); S.frame(); const indoorOn = R3D.passes().some(p => p.name === 'p21_cover');
        renderAccessibilityMenu(); const btn = document.getElementById('p21-cover'); const t0 = btn && btn.textContent; if (btn) btn.click(); const off = GFX.p21_groundCover; if (btn) btn.click(); const on = GFX.p21_groundCover; closeModal(); G.state = 'play';
        PRESETS.apply('original'); const orig = GFX.p21_groundCover; PRESETS.apply('medium');
        return { n1, same: a === b, changed: h1 !== h0, indoorOn, t0, off, on, orig };
      });
      assert.ok(r.n1 > 20, 'only ' + r.n1 + ' instances'); assert.ok(r.same, 'not deterministic'); assert.ok(r.changed, 'cover drew nothing');
      assert.ok(r.indoorOn, 'pass not registered');
      assert.deepStrictEqual([r.t0, r.off, r.on, r.orig], ['On', false, true, false]);
    });
    await step('frame cost with the detail on and off (reported; SwiftShader, not judged)', async () => {
      const r = await page.evaluate(() => {
        const t = (on, deg, map) => { GFX.p21_ground = on; if (map) S.stage(map, 27.5, 30.5, -1.57, 0.5); else S.stage('oakhaven', 23.5, 20.5, -1.57, 0.5); R3D.camera.setAngle(deg * Math.PI / 180); S.frame(); const a = performance.now(); for (let i = 0; i < 6; i++) render(); return (performance.now() - a) / 6; };
        const out = {};
        for (const preset of ['medium', 'cinematic']) { PRESETS.apply(preset); for (const deg of [0, -75]) { const off = t(false, deg), on = t(true, deg), off2 = t(false, deg), on2 = t(true, deg); out[preset + '/oakhaven/' + deg] = { off: +((off + off2) / 2).toFixed(1), on: +((on + on2) / 2).toFixed(1) }; } }
        PRESETS.apply('medium'); { const off = t(false, -30, 'deepwoods'), on = t(true, -30, 'deepwoods'), off2 = t(false, -30, 'deepwoods'), on2 = t(true, -30, 'deepwoods'); out['medium/deepwoods+cover/-30'] = { off: +((off + off2) / 2).toFixed(1), on: +((on + on2) / 2).toFixed(1) }; }
        PRESETS.apply('medium'); GFX.p21_ground = true;
        return { out, st: { coverN: GROUND21.cover.n, coverMs: +GROUND21.cover.ms.toFixed(2), slots: GROUND21.st.slots, uploads: GROUND21.st.uploads, made: GROUND21.st.made, genMsAvg: Math.round(GROUND21.st.genMs / Math.max(1, GROUND21.st.made)) } };
      });
      console.log('  frame cost, ms per frame (1280x800, R3D on SwiftShader): ' + JSON.stringify(r.out) + '; ' + JSON.stringify(r.st));
      for (const k in r.out) assert.ok(r.out[k].on > 0 && r.out[k].off > 0, k);
    });
    await step('no page errors (art and drawing)', async () => { assert.deepStrictEqual(errors, []); });
    await page.close();
  }

  // ---------------------------------------------------------------- Original and the switch are byte-identical
  {
    const det = () => { window.requestAnimationFrame = () => 0; let c = 1000; performance.now = () => (c += 0.25); Date.now = () => 1700000000000 + c; };
    const hashes = async (opts) => {
      const { page, errors } = await bootPage(browser, opts);
      const h = await page.evaluate(() => {
        const out = {};
        const cap = { fb: null }; Engine.addPostHook(F => { cap.fb = F.fb; }, 1e9);
        const hash = () => { let x = 0x811c9dc5 | 0; const f = cap.fb; for (let i = 0; i < f.length; i++) x = Math.imul(x ^ f[i], 16777619) | 0; return x >>> 0; };
        const scenes = [['oakhaven', 23.5, 6.5, Math.PI / 2, 0.5, 0], ['tavern', 8.5, 10.5, -1.57, 0.85, 12], ['deepwoods', 27.5, 30.5, -1.57, 0.95, -20]];
        // the CPU raycaster: Original, and Medium with the renderer set to Classic
        R3D.setMode('off', { noSave: true });
        for (const preset of ['original', 'medium']) {
          PRESETS.apply(preset);
          for (const [id, x, y, d, tod, pitch] of scenes) { S.stage(id, x, y, d, tod, pitch); S.pin(() => Engine.render(G.ents, G.tod)); out['cpu/' + preset + '/' + id] = hash(); }
        }
        // R3D with the switch off (or without the scripts at all)
        R3D.setMode('on', { noSave: true }); PRESETS.apply('medium'); GFX.p21_ground = false;
        for (const [id, x, y, d, tod] of scenes) { S.stage(id, x, y, d, tod, 0); R3D.camera.setAngle(-60 * Math.PI / 180); S.frame(); out['r3d/' + id] = S.hash(); }
        return out;
      });
      await page.close();
      return { h, errors };
    };
    const without = await hashes({ block: true, init: det }), withG = await hashes({ init: det });
    await step('Original (and the classic raycaster in any preset) draws byte-identical frames with the GROUND scripts loaded', async () => {
      const pick = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith('cpu/')));
      assert.deepStrictEqual(pick(withG.h), pick(without.h));
    });
    await step('R3D with "Close-up detail" off draws the very same pixels as without the GROUND scripts', async () => {
      const pick = (o) => Object.fromEntries(Object.entries(o).filter(([k]) => k.startsWith('r3d/')));
      assert.deepStrictEqual(pick(withG.h), pick(without.h));
    });
    await step('no page errors (identity)', async () => { assert.deepStrictEqual(withG.errors.concat(without.errors), []); });
  }
  await browser.close();

  // ---------------------------------------------------------------- R3D's own suite still passes
  if (process.env.SKIP_R3D !== '1') {
    await step('test/r3d21.test.js still passes (24/24, picks and the trace identical)', async () => {
      const r = spawnSync(process.execPath, [path.join(__dirname, 'r3d21.test.js')], { env: process.env, encoding: 'utf8', timeout: 3600000, maxBuffer: 1 << 26 });
      const out = (r.stdout || '') + (r.stderr || '');
      const pass = (out.match(/^PASS /mg) || []).length, fail = (out.match(/^FAIL .*/mg) || []);
      console.log('  r3d21: ' + pass + ' PASS, ' + fail.length + ' FAIL' + (fail.length ? ' -- ' + fail.join(' | ') : ''));
      assert.strictEqual(fail.length, 0); assert.ok(pass >= 24, 'only ' + pass + ' passes');
    });
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch(e => { console.error(e); process.exit(1); });
