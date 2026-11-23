// Phase 122: the sculpted hands alone, large, straight off their own canvas (no view behind them), for the finishing pass.
//
//   PREVIEW_URL=http://127.0.0.1:4176 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright \
//     tools/dev/browser.sh node tools/dev/fist122.js OUTDIR [scene ...]
//
// A scene is name=key:value,... Keys: k the kind ('h' the hands alone, 'w' a weapon, 'c' a climb's fist), id ('fist',
// 'glassfist', 'open', a weapon id, 'L' / 'R'), h what the hands wear (an ARMOR id or 'bare'), face 1..6 (the skin),
// cm canvas pixels to a centimetre of hand (default 36), g 1 the left arm is glass, tod the hour (0.45 day).
// Each scene is one PNG (the sculpted canvas, 1152 x 540, over a mid grey) and one line on stdout: the fist's crease and
// nail figures as test/hands122.test.js counts them.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const OUT = process.argv[2] || '/tmp/fist122';
const scenes = process.argv.slice(3).map((s) => {
  const i = s.indexOf('='), name = i < 0 ? s : s.slice(0, i), o = { name };
  for (const kv of (i < 0 ? '' : s.slice(i + 1)).split(',')) { if (!kv) continue; const j = kv.indexOf(':'); o[kv.slice(0, j)] = kv.slice(j + 1); }
  return o;
});
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.log('pageerror: ' + e.message.slice(0, 300)));
  page.on('console', (m) => { if (m.type() === 'warning' && /sculpted|pixelhands|body21/.test(m.text())) console.log('warn: ' + m.text().slice(0, 300)); });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof SCULPTED112 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  for (const sc of scenes) {
    const r = await page.evaluate((o) => {
      window.requestAnimationFrame = () => 0;
      const p = G.player; p.glassed = o.g === '1'; p.armor = Object.assign({}, p.armor, { hands: !o.h || o.h === 'bare' ? null : o.h }); p.face = +(o.face || 1);
      G.tod = o.tod == null ? 0.45 : +o.tod;
      const look = GEARLOOK21.of(p), k = o.k || 'h', id = o.id || 'fist', P = PIXELHANDS110.poses(k, id, look), h = P.hands[P.hands.length - 1];
      const a = (+(o.cm || 36) / 3.6) / h.cm, t = [a, 0, 0, a, 160 - a * h.x, 75 - a * h.y];
      GFX.sculptedHands = true; SCULPTED112.clear();
      SCULPTED112.begin(); SCULPTED112.place(k, id, look, t); const t0 = performance.now(); SCULPTED112.flush(o.tod ? BODY21.sculptLight() : null); const ms = performance.now() - t0;
      const px = SCULPTED112.read(), W = px.w, H = px.h, d = px.data;
      const L = new Float32Array(W * H), A = new Uint8Array(W * H);
      for (let i = 0; i < W * H; i++) { A[i] = d[i * 4 + 3] > 230 ? 1 : 0; L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.55 + d[i * 4 + 2] * 0.15; }
      let dark = 0, pale = 0, n = 0;
      for (let y = 5; y < H - 5; y++) for (let x = 5; x < W - 5; x++) {
        const i = y * W + x; if (!A[i]) continue; let s = 0, c = 0, all = true;
        for (let v = -4; v <= 4; v++) for (let u = -4; u <= 4; u++) { const j = i + v * W + u; if (!A[j]) { all = false; break; } s += L[j]; c++; }
        if (!all) continue; n++; const m = s / c; if (L[i] < m - 14) dark++; else if (L[i] > m + 14) pale++;
      }
      // the picture over grey, top row first
      const cv = document.createElement('canvas'); cv.width = W; cv.height = H; const cx = cv.getContext('2d'), im = cx.createImageData(W, H);
      for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
        const q = ((H - 1 - y) * W + x) * 4, o2 = (y * W + x) * 4, al = d[q + 3] / 255;
        for (let c = 0; c < 3; c++) im.data[o2 + c] = Math.round(d[q + c] + 96 * (1 - al)); im.data[o2 + 3] = 255;
      }
      cx.putImageData(im, 0, 0);
      return { png: cv.toDataURL('image/png'), dark, pale, n, ms: Math.round(ms) };
    }, sc);
    fs.writeFileSync(path.join(OUT, sc.name + '.png'), Buffer.from(r.png.split(',')[1], 'base64'));
    console.log(sc.name + ' ' + JSON.stringify({ dark: r.dark, pale: r.pale, n: r.n, ms: r.ms }));
  }
  await browser.close();
})();
