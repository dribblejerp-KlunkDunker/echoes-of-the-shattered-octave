// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4183 node test/hands109x.test.js
// Covers tools/hands109/hands109x.js (Phase 109, option X: the hands and arms in pixel art). Not used by the game yet.
//   - each pose gives a 1152 x 500 canvas, transparent where there is no hand
//   - where the hands are: fist and sword mostly right of centre, glass mostly left, song on both sides; the sword has
//     bright blade pixels above the hand toward the upper left
//   - it is pixel art: every 3 x 3 block is one colour (nearest-neighbour from a third of the view), few colours
//   - the same call twice gives the same pixels; Math.random is never called
//   - leather, bare and mail each render and differ
//   - render time per pose under 300 ms after a warm-up call (a fresh look each time, so the cache does not help)
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4183';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' && /hands109/i.test(m.text())) errors.push('console: ' + m.text()); });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.addScriptTag({ path: 'tools/hands109/hands109x.js' });
  await page.evaluate(() => {
    window.LOOK = (pose, hands) => ({
      hands: hands || (pose === 'fist' ? 'bare' : 'leather'), skin: [214, 170, 136], sleeve: [92, 78, 62],
      glassArm: pose !== 'fist', song: pose === 'song' ? [226, 196, 64] : null,
    });
    window.LIGHT = { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null };
    window.PIX = (c) => c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
  });

  try {
    await step('each pose gives a 1152 x 500 canvas, transparent where there is no hand', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map((p) => {
        const c = HANDS109X.render(p, LOOK(p), LIGHT), d = PIX(c);
        let op = 0, clear = 0; for (let i = 3; i < d.length; i += 4) { if (d[i] > 200) op++; else if (d[i] === 0) clear++; }
        return { p, w: c.width, h: c.height, op, clear };
      }));
      for (const v of r) assert.ok(v.w === 1152 && v.h === 500 && v.op > 20000 && v.clear > 250000, JSON.stringify(v));
    });

    await step('where the hands are: fist and sword right, glass left, song both; the blade rises bright to the upper left', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const p of ['sword', 'fist', 'glass', 'song']) {
          const d = PIX(HANDS109X.render(p, LOOK(p), LIGHT));
          let L = 0, R = 0; for (let y = 0; y < 500; y++) for (let x = 0; x < 1152; x++) if (d[(y * 1152 + x) * 4 + 3] > 200) { if (x < 576) L++; else R++; }
          out[p] = { L, R };
          if (p === 'sword') {
            // bright, cool pixels (the steel) above the hand's top, in the upper half
            let bright = 0, bx = 0, top = 500;
            for (let y = 0; y < 250; y++) for (let x = 576; x < 1152; x++) {
              const i = (y * 1152 + x) * 4; if (d[i + 3] < 200) continue;
              const lum = (d[i] + d[i + 1] + d[i + 2]) / 3;
              if (lum > 170 && d[i + 2] >= d[i]) { bright++; bx += x; top = Math.min(top, y); }
            }
            // the hand: the leather's centre
            let hx = 0, hn = 0; for (let y = 250; y < 500; y++) for (let x = 576; x < 1152; x++) { const i = (y * 1152 + x) * 4; if (d[i + 3] > 200 && d[i] > d[i + 2] + 30) { hx += x; hn++; } }
            out.blade = { bright, bx: bright ? bx / bright : 0, top, hx: hn ? hx / hn : 0 };
          }
        }
        return out;
      });
      assert.ok(r.fist.R > r.fist.L * 1.3 && r.sword.R > r.sword.L * 1.5, JSON.stringify(r));
      assert.ok(r.glass.L > r.glass.R * 1.3, JSON.stringify(r.glass));
      assert.ok(r.song.L > 20000 && r.song.R > 20000, JSON.stringify(r.song));
      assert.ok(r.blade.bright > 2000 && r.blade.top < 60 && r.blade.bx < r.blade.hx, JSON.stringify(r.blade));
    });

    await step('pixel art: every 3 x 3 block is one colour, and each pose uses a small palette', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map((p) => {
        const d = PIX(HANDS109X.render(p, LOOK(p), LIGHT));
        let bad = 0; const cols = new Set();
        for (let by = 0; by < 166; by++) for (let bx = 0; bx < 384; bx++) {
          const i0 = ((by * 3) * 1152 + bx * 3) * 4;
          for (let k = 0; k < 9; k++) { const i = ((by * 3 + ((k / 3) | 0)) * 1152 + bx * 3 + (k % 3)) * 4; if (d[i] !== d[i0] || d[i + 1] !== d[i0 + 1] || d[i + 2] !== d[i0 + 2] || d[i + 3] !== d[i0 + 3]) { bad++; break; } }
          if (d[i0 + 3] === 255) cols.add(d[i0] + ',' + d[i0 + 1] + ',' + d[i0 + 2]);
        }
        return { p, bad, cols: cols.size };
      }));
      for (const v of r) assert.ok(v.bad === 0 && v.cols < 90, JSON.stringify(v));
    });

    await step('the same call twice gives the same pixels; Math.random is never called', async () => {
      const r = await page.evaluate(() => {
        const keep = Math.random; let called = 0;
        Math.random = () => { called++; throw new Error('Math.random called'); };
        const res = {};
        try {
          for (const p of ['sword', 'fist', 'glass', 'song']) {
            const lk = LOOK(p); lk.sleeve = [90, 80, 64]; // a fresh look, so nothing is cached
            const a = PIX(HANDS109X.render(p, lk, LIGHT)), b = PIX(HANDS109X.render(p, JSON.parse(JSON.stringify(lk)), LIGHT));
            let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
            res[p] = diff;
          }
        } catch (e) { res.err = String(e); } finally { Math.random = keep; }
        res.called = called; return res;
      });
      assert.ok(!r.err && r.called === 0 && r.sword === 0 && r.fist === 0 && r.glass === 0 && r.song === 0, JSON.stringify(r));
    });

    await step('leather, bare and mail each render and differ', async () => {
      const r = await page.evaluate(() => {
        const sig = {};
        for (const h of ['leather', 'bare', 'mail']) {
          const d = PIX(HANDS109X.render('fist', Object.assign(LOOK('fist'), { hands: h }), LIGHT));
          let op = 0, sum = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] > 200) { op++; sum += d[i] * 3 + d[i + 1] * 5 + d[i + 2] * 7; }
          sig[h] = { op, mean: op ? sum / op : 0 };
        }
        return sig;
      });
      const m = ['leather', 'bare', 'mail'].map((h) => r[h].mean);
      assert.ok(r.leather.op > 20000 && r.bare.op > 20000 && r.mail.op > 20000, JSON.stringify(r));
      assert.ok(Math.abs(m[0] - m[1]) > 40 && Math.abs(m[0] - m[2]) > 40 && Math.abs(m[1] - m[2]) > 40, JSON.stringify(r));
    });

    await step('render time per pose under 300 ms after a warm-up (no cache: a fresh look each time)', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const p of ['sword', 'fist', 'glass', 'song']) {
          HANDS109X.render(p, Object.assign(LOOK(p), { skin: [210, 168, 134] }), LIGHT);
          const t0 = performance.now(); HANDS109X.render(p, Object.assign(LOOK(p), { skin: [212, 169, 135] }), LIGHT); out[p] = +(performance.now() - t0).toFixed(1);
        }
        return out;
      });
      console.log('  render ms: ' + JSON.stringify(r));
      for (const p of Object.keys(r)) assert.ok(r[p] < 300, JSON.stringify(r));
    });

    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
