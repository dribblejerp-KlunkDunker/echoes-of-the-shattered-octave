// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4182 node test/hands109p.test.js
// Covers js/hands109p.js (Phase 109, option P "Painted": the first-person hands and arms painted in code, for the owner's
// ruling; the game does not use it yet).
//   - every pose gives a 1152 x 500 canvas, clear where there is no hand or arm
//   - where the hands are: the fist and the sword on the right, the raised glass arm on the left, the Song on both sides;
//     the sword's bright blade above the hand, toward the upper left
//   - the same call twice gives the same pixels; Math.random is never called
//   - leather, bare and mail hands all render, and differ
//   - each pose renders in under 300 ms (after a warm-up call; the best of three, the machine being shared)
//   - no page errors
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4182';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /hands109/i.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof G !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.addScriptTag({ path: 'js/hands109p.js' });
  await page.evaluate(() => {
    window.LOOK = (pose, hands) => ({ hands: hands || (pose === 'fist' ? 'bare' : 'leather'), skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: pose !== 'fist', song: pose === 'song' ? [226, 196, 64] : null });
    window.DAY = { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null };
    // where the (mostly) opaque pixels are, and the blade's bright ones
    window.MAP = (c) => {
      const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data, W = c.width, H = c.height;
      let left = 0, right = 0, bright = [], low = [];
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const o = (y * W + x) * 4; if (d[o + 3] < 100) continue;              // the glass arm is see-through in its thin parts
        if (x < W / 2) left++; else right++;
        if (d[o + 3] < 200) continue;
        const lum = (d[o] + d[o + 1] + d[o + 2]) / 3;
        if (y < 200 && x > W / 2 && lum > 165) bright.push(x);
        if (y > 330 && x > W / 2) low.push(x);
      }
      const mean = (a) => a.reduce((s, v) => s + v, 0) / (a.length || 1);
      return { left, right, bright: bright.length, brightX: mean(bright), lowX: mean(low), corner: d[3] + d[(W - 1) * 4 + 3] };
    };
  });

  try {
    await step('every pose gives a 1152 x 500 canvas, clear where there is no hand', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map(p => { const c = HANDS109P.render(p, LOOK(p), DAY); return [p, c.width, c.height, MAP(c).corner]; }));
      for (const [p, w, h, corner] of r) assert.ok(w === 1152 && h === 500 && corner === 0, JSON.stringify(r));
    });
    await step('fist and sword on the right, the raised glass arm on the left, the Song on both sides', async () => {
      const r = await page.evaluate(() => Object.fromEntries(['sword', 'fist', 'glass', 'song'].map(p => [p, MAP(HANDS109P.render(p, LOOK(p), DAY))])));
      // the fist and the sword: the right hand is the raised one (the left rests low and smaller)
      assert.ok(r.fist.right > r.fist.left * 1.05, 'fist ' + JSON.stringify(r.fist));
      assert.ok(r.sword.right > r.sword.left * 0.6 && r.sword.right > 20000, 'sword ' + JSON.stringify(r.sword));
      assert.ok(r.glass.left > r.glass.right, 'glass ' + JSON.stringify(r.glass));
      const s = r.song, tot = s.left + s.right; assert.ok(s.left > tot * 0.3 && s.right > tot * 0.3, 'song ' + JSON.stringify(s));
    });
    await step("the sword's bright blade stands above the hand, toward the upper left", async () => {
      const r = await page.evaluate(() => MAP(HANDS109P.render('sword', LOOK('sword'), DAY)));
      assert.ok(r.bright > 400 && r.brightX < r.lowX, JSON.stringify(r));
    });
    await step('the same call twice gives the same pixels', async () => {
      const r = await page.evaluate(() => ['sword', 'fist', 'glass', 'song'].map(p => {
        const a = HANDS109P.render(p, LOOK(p), DAY).getContext('2d').getImageData(0, 0, 1152, 500).data;
        HANDS109P.render(p === 'song' ? 'fist' : 'song', LOOK('song'), DAY);           // something else in between
        const b = HANDS109P.render(p, LOOK(p), DAY).getContext('2d').getImageData(0, 0, 1152, 500).data;
        let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== b[i]) diff++;
        return diff;
      }));
      assert.deepStrictEqual(r, [0, 0, 0, 0]);
    });
    await step('Math.random is never called', async () => {
      const r = await page.evaluate(() => {
        const keep = Math.random; let called = 0;
        Math.random = () => { called++; throw new Error('Math.random called'); };
        try { for (const p of ['sword', 'fist', 'glass', 'song']) HANDS109P.render(p, LOOK(p), DAY); HANDS109P.render('fist', LOOK('fist', 'mail'), DAY); }
        finally { Math.random = keep; }
        return called;
      });
      assert.strictEqual(r, 0);
    });
    await step('leather, bare and mail hands all render, and differ', async () => {
      const r = await page.evaluate(() => {
        const px = (h) => HANDS109P.render('fist', Object.assign(LOOK('fist', h), { glassArm: false }), DAY).getContext('2d').getImageData(0, 0, 1152, 500).data;
        const A = { leather: px('leather'), bare: px('bare'), mail: px('mail') };
        const opaque = (d) => { let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 200) n++; return n; };
        const diff = (a, b) => { let n = 0; for (let i = 0; i < a.length; i += 4) if (Math.abs(a[i] - b[i]) + Math.abs(a[i + 1] - b[i + 1]) + Math.abs(a[i + 2] - b[i + 2]) > 60) n++; return n; };
        return { op: [opaque(A.leather), opaque(A.bare), opaque(A.mail)], lb: diff(A.leather, A.bare), lm: diff(A.leather, A.mail), bm: diff(A.bare, A.mail) };
      });
      assert.ok(r.op.every(n => n > 30000), JSON.stringify(r));
      assert.ok(r.lb > 20000 && r.lm > 20000 && r.bm > 20000, JSON.stringify(r));
    });
    await step('each pose renders in under 300 ms (after a warm-up; best of three)', async () => {
      const r = await page.evaluate(() => Object.fromEntries(['sword', 'fist', 'glass', 'song'].map(p => {
        HANDS109P.render(p, LOOK(p), DAY);
        const t = []; for (let k = 0; k < 3; k++) { const t0 = performance.now(); HANDS109P.render(p, LOOK(p), DAY); t.push(+(performance.now() - t0).toFixed(1)); }
        return [p, t];
      })));
      console.log('     times (ms): ' + JSON.stringify(r));
      for (const [p, t] of Object.entries(r)) assert.ok(Math.min(...t) < 300, p + ' ' + JSON.stringify(t));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
