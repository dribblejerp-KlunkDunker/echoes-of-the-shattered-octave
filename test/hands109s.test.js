// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4181 node test/hands109s.test.js
// Covers js/hands109s.js (Phase 109, option S for the first-person hands and arms: "Sculpted, lit by the world").
//   - each pose gives a 1152 x 500 canvas, transparent where there is no hand
//   - where the hands are: fist and sword mostly right of the middle, glass mostly left, song on both sides; the sword's
//     bright blade rises above the hand, a little to its left
//   - the same call twice gives the very same pixels; Math.random is never called
//   - leather, bare and mail each draw, and differ
//   - the world lights them: by night (the torch) the picture differs from the day's and is darker
//   - each pose renders in under 400 ms (headless, software GPU) after a first warm-up call
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4181';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  // WebGL in headless Chromium: SwiftShader
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /hands109s/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof G !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.addScriptTag({ path: 'js/hands109s.js' });
  await page.evaluate(() => {
    window.T109 = {
      LOOKS: {
        sword: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: null },
        fist: { hands: 'bare', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: false, song: null },
        glass: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: null },
        song: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: [226, 196, 64] },
      },
      DAY: { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null },
      NIGHT: { key: [70, 84, 120], dir: [0.2, 0.8, 0.4], amb: [26, 30, 44], torch: [255, 170, 90] },
      px: (c) => c.getContext('2d').getImageData(0, 0, c.width, c.height).data,
      sig: (c) => { const d = T109.px(c); let h = 0; for (let i = 0; i < d.length; i += 7) h = (Math.imul(h, 31) + d[i]) | 0; return h; },
    };
  });

  try {
    await step('the module is there; Math.random is never called while every pose and look is built and drawn', async () => {
      const r = await page.evaluate(() => {
        const keep = Math.random; let calls = 0;
        Math.random = () => { calls++; throw new Error('Math.random called'); };
        const out = [];
        try {
          for (const pose of ['sword', 'fist', 'glass', 'song']) for (const hands of ['leather', 'bare', 'mail']) {
            const c = HANDS109S.render(pose, Object.assign({}, T109.LOOKS[pose], { hands }), T109.DAY); out.push(!!c);
            HANDS109S.render(pose, Object.assign({}, T109.LOOKS[pose], { hands }), T109.NIGHT);
          }
        } catch (e) { return { err: String(e), calls }; } finally { Math.random = keep; }
        return { ok: out.every(Boolean), calls };
      });
      assert.ok(r.ok && r.calls === 0 && !r.err, JSON.stringify(r));
    });
    await step('each pose gives a 1152 x 500 canvas, transparent where there is no hand', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map((p) => {
        const c = HANDS109S.render(p, T109.LOOKS[p], T109.DAY), d = T109.px(c);
        return { p, w: c.width, h: c.height, corner: d[3], mid: d[(250 * 1152 + 576) * 4 + 3] };
      }));
      for (const x of r) assert.ok(x.w === 1152 && x.h === 500 && x.corner === 0, JSON.stringify(x));
    });
    await step('where the hands are: fist and sword right, glass left, song both sides; the blade rises above the hand to its left', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const p of ['sword', 'fist', 'glass', 'song']) {
          const d = T109.px(HANDS109S.render(p, T109.LOOKS[p], T109.DAY));
          let L = 0, R = 0, blade = 0, bx = 0, hand = 0, hx = 0;
          for (let y = 0; y < 500; y++) for (let x = 0; x < 1152; x++) {
            const i = (y * 1152 + x) * 4; if (d[i + 3] < 200) continue;
            if (x < 576) L++; else R++;
            const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
            if (x > 576 && y < 200 && lum > 165) { blade++; bx += x; }
            if (x > 576 && y > 300) { hand++; hx += x; }
          }
          out[p] = { L, R, blade, bladeX: blade ? bx / blade : 0, handX: hand ? hx / hand : 0 };
        }
        return out;
      });
      assert.ok(r.fist.R > r.fist.L * 1.15 && r.fist.R > 20000, 'fist ' + JSON.stringify(r.fist));
      assert.ok(r.sword.R > r.sword.L * 1.15 && r.sword.R > 20000, 'sword ' + JSON.stringify(r.sword));
      assert.ok(r.glass.L > r.glass.R * 1.15 && r.glass.L > 20000, 'glass ' + JSON.stringify(r.glass));
      assert.ok(r.song.L > 15000 && r.song.R > 15000, 'song ' + JSON.stringify(r.song));
      assert.ok(r.sword.blade > 2000 && r.sword.bladeX < r.sword.handX, 'blade ' + JSON.stringify(r.sword));
    });
    await step('the same call twice gives the very same pixels', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map((p) => {
        const a = T109.px(HANDS109S.render(p, T109.LOOKS[p], T109.NIGHT)), b = T109.px(HANDS109S.render(p, T109.LOOKS[p], T109.NIGHT));
        let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
        return diff;
      }));
      assert.deepStrictEqual(r, [0, 0, 0, 0]);
    });
    await step('leather, bare and mail each draw, and differ', async () => {
      const r = await page.evaluate(() => {
        const s = {}; for (const hands of ['leather', 'bare', 'mail']) s[hands] = T109.sig(HANDS109S.render('fist', Object.assign({}, T109.LOOKS.fist, { hands }), T109.DAY));
        const a = T109.px(HANDS109S.render('fist', Object.assign({}, T109.LOOKS.fist, { hands: 'mail' }), T109.DAY));
        let op = 0; for (let i = 3; i < a.length; i += 4) if (a[i] > 200) op++;
        return { s, op };
      });
      assert.ok(r.s.leather !== r.s.bare && r.s.bare !== r.s.mail && r.s.leather !== r.s.mail && r.op > 30000, JSON.stringify(r));
    });
    await step('the world lights them: by night the picture differs and is darker', async () => {
      const r = await page.evaluate(() => {
        const lum = (c) => { const d = T109.px(c); let s = 0, n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { s += d[i] + d[i + 1] + d[i + 2]; n++; } return s / n / 3; };
        return ['sword', 'fist'].map((p) => ({ day: lum(HANDS109S.render(p, T109.LOOKS[p], T109.DAY)), night: lum(HANDS109S.render(p, T109.LOOKS[p], T109.NIGHT)) }));
      });
      for (const x of r) assert.ok(x.night < x.day - 10, JSON.stringify(r));
    });
    await step('each pose renders in under 400 ms after a warm-up call (headless, software GPU)', async () => {
      const r = await page.evaluate(() => {
        const t = {};
        for (const p of ['sword', 'fist', 'glass', 'song']) {
          HANDS109S.render(p, T109.LOOKS[p], T109.DAY);
          let best = 1e9; for (let k = 0; k < 2; k++) { const t0 = performance.now(); HANDS109S.render(p, T109.LOOKS[p], T109.DAY); best = Math.min(best, performance.now() - t0); }
          t[p] = Math.round(best);
        }
        return t;
      });
      console.log('  render ms: ' + JSON.stringify(r));
      for (const [p, ms] of Object.entries(r)) assert.ok(ms < 400, p + ' ' + ms + ' ms');
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
