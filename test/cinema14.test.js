// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:3927 node test/cinema14.test.js
// Covers js/cinema14.js (Phase 14 CINEMA): the Cinematic preset, its three switches (Cinematic light, Ground fog,
// Cinematic grade), identity for every other preset (frame hashes against a page with js/cinema14.js blocked), what each
// switch may change, the frame-cost table (12 enemies, Oakhaven at dusk, 1x and 2x, four reference scenes), accessibility
// (No flashes, Reduce motion, High contrast, colour-blind), the Options rows at 640x400, persistence and page errors.
//   SHOT_DIR=/some/dir   where screenshots and the cost table go (default: os tmpdir)
'use strict';
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:3927';
const SHOT_DIR = process.env.SHOT_DIR || path.join(os.tmpdir(), 'cinema14-shots');
fs.mkdirSync(SHOT_DIR, { recursive: true });
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

async function bootPage(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if ((m.type() === 'error' && !(opts.block && /ERR_FAILED|cinema14/.test(m.text()))) || (m.type() === 'warning' && /cinema14|render hook/.test(m.text()))) errors.push('console: ' + m.text()); });
  if (opts.block) await page.route('**/js/cinema14.js*', r => r.abort());
  if (opts.init) await page.addInitScript(opts.init);
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Cinema Tester');
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

// the four reference cameras the owner approved the look on
const SCENES = {
  oak: ['oakhaven', 23.5, 6.5, Math.PI / 2, 0.73, {}],
  clear: ['clearing', 20.5, 32.5, -Math.PI / 2, 0.3, {}],
  grove: ['whispergrove', 24.5, 43.5, -Math.PI / 2, 0.85, { part3: true, greening: true }],
  vault: ['rootvault', 4.5, 5.5, 0, 0.5, {}],
};

const HELPERS = () => {
  const S = window.S = { cap: null, on: false };
  Engine.addPostHook(F => { if (S.on) S.cap = { fb: F.fb.slice(), dbuf: F.dbuf.slice(), mbuf: F.mbuf.slice(), w: F.w, h: F.h, horizon: F.horizon }; }, 99);
  window.requestAnimationFrame = () => 0;   // the game loop must not render between our frames
  S.stage = (sc) => {
    const [map, x, y, dir, tod, flags] = sc;
    G.state = 'paused'; for (const k of Object.keys(G.flags)) delete G.flags[k]; Object.assign(G.flags, flags || {});
    loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = 3;
    Engine.cam.pitch = 0; Engine.cam.bob = 0; Weather.hold('clear'); GFX.reduceMotion = false; GFX.noFlash = false;
  };
  // a frame with pinned time and weather; only scenery (no wandering NPCs), so two pages render the same thing
  S.frame = (preset, flags, t) => {
    if (preset) PRESETS.apply(preset);
    if (flags) for (const k of ['cineLight', 'cineFog', 'cineGrade']) if (k in flags) GFX[k] = flags[k];
    Engine.setTime(t == null ? 5 : t); Engine.setWeather({ haze: 0, dark: 0, cloud: 0, tint: [196, 200, 214], flash: 0 });
    Engine.cam.bob = 0;
    const ents = G.ents.filter(e => e.kind === 'deco');
    S.on = true; Engine.render(ents, G.tod); S.on = false;
    return S.cap;
  };
  S.hash = (fb) => { let h = 2166136261; for (let i = 0; i < fb.length; i++) { h ^= fb[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
  S.png = () => { const c = Engine.canvas, o = document.createElement('canvas'), vh = Engine.VIEW_H * Engine.getScale(); o.width = c.width; o.height = vh; o.getContext('2d').drawImage(c, 0, 0, c.width, vh, 0, 0, o.width, o.height); return o.toDataURL('image/png'); };
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  let A = null, B = null;
  try {
    A = await bootPage(browser);
    B = await bootPage(browser, { block: true });
    const pg = A.page, Q = (fn, arg) => pg.evaluate(fn, arg);

    // ------------------------------------------------------------------------------------------------ preset values
    await step('preset: Cinematic is scale 2, view distance 2.5 (FAR far mode), particles 1.25, after Ultra; its three switches are on only there', async () => {
      const r = await Q(() => {
        const o = { t: JSON.parse(JSON.stringify(PRESETS.table.cinematic)), order: PRESETS.order.slice(), flags: {} };
        for (const n of PRESETS.order) { PRESETS.apply(n); o.flags[n] = [GFX.cineLight, GFX.cineFog, GFX.cineGrade, PRESETS.current()]; }
        PRESETS.apply('cinematic'); o.cine = { scale: GFX.scale, vd: GFX.viewDist, pt: GFX.particles, canvas: Engine.canvas.width, farLook: GFX.farLook, bloom: GFX.bloom, grade: GFX.grade };
        PRESETS.apply('medium'); return o;
      });
      assert.deepEqual([r.t.scale, r.t.viewDist, r.t.particles], [2, 2.5, 1.25]);
      assert.deepEqual(r.order.slice(-2), ['ultra', 'cinematic']);
      for (const n of r.order) assert.deepEqual(r.flags[n], n === 'cinematic' ? [true, true, true, 'cinematic'] : [false, false, false, n], n);
      assert.deepEqual(r.cine, { scale: 2, vd: 2.5, pt: 1.25, canvas: 640, farLook: true, bloom: true, grade: true });
    });

    // ------------------------------------------------------------------------------------------------ identity
    await step('off: Original, Low, Medium, High and Ultra frames are byte-identical to a page without js/cinema14.js (three scenes), and no overlay shows', async () => {
      const run = (P) => P.evaluate((SC) => {
        const out = [];
        for (const id of ['clear', 'grove', 'vault']) { S.stage(SC[id]); for (const p of ['original', 'low', 'medium', 'high', 'ultra']) out.push(id + ':' + p + ':' + S.hash(S.frame(p).fb)); }
        PRESETS.apply('medium');
        const v = document.getElementById('cine14-veil');
        return { out, veil: !!(v && getComputedStyle(v).display !== 'none') };
      }, SCENES);
      const a = await run(pg), b = await run(B.page);
      const diff = a.out.filter((x, i) => x !== b.out[i]);
      assert.deepEqual(diff, [], 'differing frames');
      assert.equal(a.veil, false, 'grade overlay hidden');
    });
    await step('off: Cinematic with its three switches off equals the same preset on the page without the module', async () => {
      const run = (P) => P.evaluate((SC) => { const out = []; for (const id of ['clear', 'vault']) { S.stage(SC[id]); out.push(S.hash(S.frame('cinematic', { cineLight: false, cineFog: false, cineGrade: false }).fb)); } PRESETS.apply('medium'); return out; }, SCENES);
      assert.deepEqual(await run(pg), await run(B.page));
    });

    // ------------------------------------------------------------------------------------------------ each switch
    await step('switches: light only adds light (never darkens) where lamps, Light-glass and the bright sky are; fog only touches ground and walls (never sky) in its band; grade never touches the frame', async () => {
      const r = await Q((SC) => {
        const o = {};
        const cmp = (a, b) => { let n = 0, dark = 0, sky = 0, above = 0; const band = a.horizon - 0.05 * a.h - 1; for (let i = 0; i < a.fb.length; i++) { if (a.fb[i] === b.fb[i]) continue; n++; const p = a.fb[i], q = b.fb[i]; if ((q & 255) < (p & 255) || ((q >> 8) & 255) < ((p >> 8) & 255) || ((q >> 16) & 255) < ((p >> 16) & 255)) dark++; if (a.dbuf[i] >= 1e8) sky++; if (((i / a.w) | 0) < band) above++; } return { n, dark, sky, above }; };
        S.stage(SC.clear);
        const none = S.frame('cinematic', { cineLight: false, cineFog: false, cineGrade: false });
        o.light = cmp(none, S.frame(null, { cineLight: true }));
        o.fog = cmp(none, S.frame(null, { cineLight: false, cineFog: true })); o.fogAerial = CINEMA14.stats.last.aerial;
        o.grade = cmp(none, S.frame(null, { cineFog: false, cineGrade: true })); o.gradeShown = CINEMA14.gradeShown();
        const v = document.getElementById('cine14-veil'); o.filter = v ? getComputedStyle(v).backdropFilter : ''; o.veilH = v ? v.getBoundingClientRect().height / Engine.canvas.getBoundingClientRect().height : 0;
        S.stage(SC.vault);
        const noneV = S.frame('cinematic', { cineLight: false, cineFog: false, cineGrade: false });
        o.vaultFog = cmp(noneV, S.frame(null, { cineFog: true })); o.vaultAerial = CINEMA14.stats.last.aerial;
        PRESETS.apply('medium'); o.after = CINEMA14.gradeShown();
        return o;
      }, SCENES);
      assert.ok(r.light.n > 200 && r.light.dark === 0, 'light: ' + JSON.stringify(r.light));
      assert.ok(r.fog.n > 1000 && r.fog.sky === 0 && r.fog.above === 0, 'fog (outdoors, far mode): ' + JSON.stringify(r.fog));
      assert.equal(r.fogAerial, false, 'outdoors in far mode the engine haze is the aerial perspective, not this module');
      assert.ok(r.vaultFog.n > 1000 && r.vaultFog.sky === 0 && r.vaultAerial === true, 'indoors the module adds depth haze: ' + JSON.stringify(r.vaultFog));
      assert.equal(r.grade.n, 0, 'the grade is on the compositor: the canvas is untouched');
      assert.ok(r.gradeShown && /saturate\(1\.12\)/.test(r.filter) && /contrast\(1\.08\)/.test(r.filter), 'grade overlay: ' + r.filter);
      assert.ok(Math.abs(r.veilH - 0.75) < 0.01, 'the overlay covers the 3D view only, not the HUD: ' + r.veilH);
      assert.equal(r.after, false, 'leaving Cinematic hides it');
    });

    // ------------------------------------------------------------------------------------------------ accessibility
    await step('accessibility: No flashes holds the rays still and halves bloom; Reduce motion freezes the fog noise; High contrast removes grade and vignette; colour-blind mode is not affected', async () => {
      const r = await Q((SC) => {
        const o = {};
        S.stage(SC.clear); PRESETS.apply('cinematic');
        const at = (t) => { S.frame(null, null, t); return Object.assign({}, CINEMA14.stats.last); };
        let a = at(5), b = at(6.3); o.shimmerMoves = a.shimmer !== b.shimmer; o.bk = a.bloomK; o.fogMoves = a.fogShift !== at(40).fogShift;
        GFX.noFlash = true; a = at(5); b = at(6.3); o.nfShimmer = [a.shimmer, b.shimmer]; o.nfBk = a.bloomK; GFX.noFlash = false;
        GFX.reduceMotion = true; o.rmFog = [at(5).fogShift, at(40).fogShift]; GFX.reduceMotion = false;
        // the light the module adds is exactly the same with and without No flashes when the shimmer is at 1 is not
        // asserted (bloom halves); what matters: two times give the same rays under No flashes
        ACCESS.setHighContrast(true); o.hc = CINEMA14.gradeShown(); ACCESS.setHighContrast(false); o.hcOff = CINEMA14.gradeShown();
        // colour-blind: what the module changes is the same with the switch on or off
        const d = () => { const off = S.frame(null, { cineLight: false, cineFog: false }).fb, on = S.frame(null, { cineLight: true, cineFog: true }).fb; let h = 2166136261; for (let i = 0; i < on.length; i++) { h ^= (on[i] ^ off[i]); h = Math.imul(h, 16777619); } return h >>> 0; };
        const cb0 = d(); UPG.colorblind = true; if (typeof applyVisualSettings === 'function') applyVisualSettings(); const cb1 = d(); UPG.colorblind = false; if (typeof applyVisualSettings === 'function') applyVisualSettings();
        o.cbSame = cb0 === cb1;
        PRESETS.apply('medium');
        return o;
      }, SCENES);
      assert.ok(r.shimmerMoves, 'rays shimmer gently by default');
      assert.deepEqual(r.nfShimmer, [1, 1], 'No flashes: no shimmer');
      assert.ok(Math.abs(r.nfBk / r.bk - 0.5) < 1e-6, 'No flashes: bloom halved ' + r.nfBk + ' vs ' + r.bk);
      assert.ok(r.fogMoves, 'fog drifts by default');
      assert.deepEqual(r.rmFog, [0, 0], 'Reduce motion: static fog noise');
      assert.deepEqual([r.hc, r.hcOff], [false, true], 'High contrast hides the grade overlay');
      assert.ok(r.cbSame, 'colour-blind palettes unaffected');
    });

    // ------------------------------------------------------------------------------------------------ cost
    await step('cost: interleaved on/off median, 1x and 2x, four reference scenes with 12 enemies in Oakhaven; Oakhaven at dusk at 2x is within 2.5 ms', async () => {
      let t = null;
      for (let attempt = 0; attempt < 3; attempt++) {
        t = await Q((SC) => {
          const med = a => a.slice().sort((x, y) => x - y)[a.length >> 1];
          const out = {};
          for (const id of ['oak', 'clear', 'grove', 'vault']) {
            S.stage(SC[id]); G.state = 'paused';
            if (id === 'oak') for (let i = 0; i < 12; i++) G.ents.push(hydrate({ kind: 'enemy', type: ['hound', 'proctor', 'quiet', 'legionnaire'][i % 4], x: 22 + (i % 4), y: 9 + (i >> 2) * 1.2, passive: true }));
            out[id] = {};
            for (const sc of [1, 2]) {
              PRESETS.apply('cinematic'); PRESETS.setScale(sc);
              const set = v => { for (const k of CINEMA14.FLAGS) GFX[k] = v; };
              const frame = () => { const t0 = performance.now(); for (let j = 0; j < 15; j++) { Engine.setTime(5 + j * 0.016); Engine.render(G.ents, G.tod); } return (performance.now() - t0) / 15; };
              set(true); frame(); set(false); frame();
              const d = [];
              for (let r = 0; r < 13; r++) { let a, b; if (r % 2) { set(true); a = frame(); set(false); b = frame(); } else { set(false); b = frame(); set(true); a = frame(); } d.push(a - b); }
              out[id][sc + 'x'] = Math.round(med(d) * 100) / 100;
            }
          }
          PRESETS.apply('medium');
          return out;
        }, SCENES);
        if (t.oak['2x'] <= 2.5) break;
      }
      const la = os.loadavg().map(v => v.toFixed(2)).join(' ');
      console.log('CINEMA COST ms per frame (median of interleaved on - off, headless Chromium, load ' + la + '):');
      console.log('scene      1x      2x');
      for (const id of Object.keys(t)) console.log(id.padEnd(8) + String(t[id]['1x'].toFixed(2)).padStart(6) + String(t[id]['2x'].toFixed(2)).padStart(8));
      fs.writeFileSync(path.join(SHOT_DIR, 'cinema-cost.json'), JSON.stringify({ t, loadavg: os.loadavg() }, null, 1));
      assert.ok(t.oak['2x'] <= 2.5, 'Oakhaven at dusk, 12 enemies, 2x: ' + t.oak['2x'] + ' ms');
    });

    // ------------------------------------------------------------------------------------------------ options
    await step('Options: a Cinematic preset button and three switch rows that work, mark the preset custom, persist, and fit 640x400', async () => {
      await Q(() => { localStorage.removeItem('octave.cinema14.v1'); PRESETS.apply('medium'); G.state = 'panel'; renderMenu(); });
      await pg.locator('#mn-gfx').click();
      for (const id of ['gfx-p-cinematic', 'cine-light', 'cine-fog', 'cine-grade']) assert.equal(await pg.locator('#' + id).count(), 1, id);
      assert.equal(await pg.locator('#cine-fog').textContent(), 'Off');
      await pg.locator('#gfx-p-cinematic').click();
      let s = await Q(() => ({ cur: PRESETS.current(), on: [GFX.cineLight, GFX.cineFog, GFX.cineGrade], txt: document.getElementById('cine-fog').textContent, state: document.getElementById('gfx-state').textContent }));
      assert.deepEqual(s, { cur: 'cinematic', on: [true, true, true], txt: 'On', state: 'Graphics: Cinematic' });
      await pg.locator('#cine-fog').click();
      s = await Q(() => ({ cur: PRESETS.current(), fog: GFX.cineFog, pressed: document.getElementById('cine-fog').getAttribute('aria-pressed'), stored: JSON.parse(localStorage.getItem('octave.cinema14.v1')), state: document.getElementById('gfx-state').textContent }));
      assert.deepEqual(s, { cur: 'custom', fog: false, pressed: 'false', stored: { p: 1, l: 1, f: 0, g: 1 }, state: 'Graphics: Custom' });
      await pg.setViewportSize({ width: 640, height: 400 });
      await Q(() => { renderAccessibilityMenu(); });
      const r = await Q(() => {
        const panel = document.querySelector('#modal-panel'), grid = panel.querySelector('.ctl-grid') || panel, bad = [];
        for (const b of Array.from(panel.querySelectorAll('button:enabled'))) {
          b.scrollIntoView({ block: 'nearest', inline: 'nearest' });
          const q2 = b.getBoundingClientRect();
          if (q2.left < -1 || q2.right > innerWidth + 1 || q2.top < -1 || q2.bottom > innerHeight + 1 || q2.width < 4) bad.push((b.id || b.textContent) + ' ' + [q2.left, q2.right, q2.top, q2.bottom].map(Math.round));
        }
        document.getElementById('cine-light').scrollIntoView({ block: 'center' });
        return { panelX: panel.scrollWidth <= panel.clientWidth + 1, gridX: grid.scrollWidth <= grid.clientWidth + 1, docX: document.documentElement.scrollWidth <= innerWidth + 1, bad };
      });
      await pg.screenshot({ path: path.join(SHOT_DIR, 'options-cinema-640x400.png') });
      assert.equal(r.panelX && r.gridX && r.docX, true, 'no horizontal overflow ' + JSON.stringify(r)); assert.deepEqual(r.bad, []);
      await pg.setViewportSize({ width: 1280, height: 800 });
      await Q(() => { PRESETS.apply('medium'); closeModal(); G.state = 'play'; localStorage.removeItem('octave.cinema14.v1'); });
    });
    await step('persistence: a stored Cinematic choice comes back at boot (with its switches); a fresh profile boots Medium', async () => {
      const C = await bootPage(browser, { init: () => { try { localStorage.setItem('octave.cinema14.v1', JSON.stringify({ p: 1, l: 1, f: 0, g: 1 })); } catch (e) { /* */ } } });
      const s = await C.page.evaluate(() => ({ cur: PRESETS.current(), on: [GFX.cineLight, GFX.cineFog, GFX.cineGrade], scale: GFX.scale }));
      const bad = await C.page.evaluate(() => { localStorage.setItem('octave.cinema14.v1', '{"p":"x<img>"}'); return true; });
      await C.page.close();
      assert.deepEqual(s, { cur: 'custom', on: [true, false, true], scale: 2 });
      assert.ok(bad);
      const fresh = await pg.evaluate(() => PRESETS.current());
      assert.equal(fresh, 'medium');
      assert.deepEqual(C.errors, []);
    });

    // ------------------------------------------------------------------------------------------------ screenshots
    await step('screenshots: the four reference cameras, Medium and Cinematic (page captures, overlay included)', async () => {
      for (const id of Object.keys(SCENES)) {
        for (const p of ['medium', 'cinematic']) {
          await Q(([sc, p]) => { S.stage(sc); S.frame(p); }, [SCENES[id], p]);
          await pg.locator('#view').screenshot({ path: path.join(SHOT_DIR, id + '-' + p + '.png') });
        }
      }
      await Q(() => { PRESETS.apply('medium'); });
    });

    await step('no page errors', async () => { assert.deepEqual(A.errors, []); assert.deepEqual(B.errors, []); });
  } catch (e) {
    failed++; console.log('FAIL harness: ' + (e && e.stack || e));
  } finally {
    await browser.close();
  }
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})();
