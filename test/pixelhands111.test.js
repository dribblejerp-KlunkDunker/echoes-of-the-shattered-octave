// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/pixelhands111.test.js
// Phase 111 (the pixel hands, touched up): what the 3D view does with the pixel pictures. Run alone (it draws in WebGL).
//   - by day the glass arm on the screen is its painted deep azure (the 3D view's daylight and bloom used to turn it pale)
//     and the glove its painted brown; no picture is brighter than it was painted
//   - by night the hands are darker, and still readable (never below about a third)
//   - a Song's light is laid over the hands (the body pass's 'over' quads), and the glass stays blue under it
//   - every picture drew (no WebGL error), and no page errors
// The classic view's checks are in test/pixelhands110.test.js.
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /pixelhands110|fp87|body21/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof PIXELHANDS110 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Hand Tester'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    GFX.illustratedScreens = false; PRESETS.apply('medium'); if (R3D.setMode) R3D.setMode('on');
    window.requestAnimationFrame = () => 0;
    // stand in Oakhaven's street at an hour, a sword in the right hand, the glass fist resting on the left; draw; read the screen
    window.SHOT = (tod, song) => {
      closeModal(); hide('#event'); loadMap('oakhaven', { x: 22.5, y: 30.5, dir: -Math.PI / 2 });
      G.state = 'play'; G.tod = tod; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
      UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; G.player.pitch = 0;
      for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
      const p = G.player; p.glassed = true; p.weapons = [song ? 'hands' : 'sword']; p.weapon = 0; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: null });
      G.attack.t = 0; G.song.t = 0; G.songFx = 0; FPHANDS.st.shown = p.weapons[0]; FPHANDS.st.lower = 0; FPHANDS.st.cast = 0; FPHANDS.st.climb = 0;
      for (let i = 0; i < 10; i++) window.advanceTime(1000 / 30);
      const hold = () => { if (song) { G.song.t = 0.35; FPHANDS.st.cast = 0.6; FPHANDS.st.castDur = 0.9; FPHANDS.st.castCol = [226, 196, 64]; FPHANDS.st.castPower = 0.8; } };
      const upd = update; update = function () {}; BODY21.R3B.check = true;
      try { hold(); window.advanceTime(16); hold(); window.advanceTime(1); } finally { update = upd; }
      const px = R3D.readPixels(), W = px.w, H = px.h, d = px.data, LH = Math.round(320 * H / W);   // rows come bottom first; the canvas is 320 logical pixels wide, and as tall as its shape says (the view is its top 150)
      // each first-person picture the body pass drew is a quad on the screen: read the screen where the picture's own
      // glass pixels and leather pixels fell (flat places only, three pixels clear of any other colour), beside what was painted
      const list = (BODY21.R3B.last && BODY21.R3B.last.list) || [];
      const acc = { glass: { n: 0, p: [0, 0, 0], s: [0, 0, 0] }, glove: { n: 0, p: [0, 0, 0], s: [0, 0, 0] } };
      for (const it of list) {
        if (it.add || it.over || !it.img || it.img.width < 200 || !it.img.getContext) continue;
        const cw = it.img.width, ch = it.img.height, q = it.img.getContext('2d').getImageData(0, 0, cw, ch).data, [TL, TR, , BL] = it.pts;
        for (let y = 4; y < ch - 4; y += 3) for (let x = 4; x < cw - 4; x += 3) {
          const i = (y * cw + x) * 4; if (q[i + 3] !== 255) continue;
          const r = q[i], g = q[i + 1], bl = q[i + 2], cls = bl > r + 40 && bl > 90 ? 'glass' : r > bl + 30 && r < 200 && g < 140 ? 'glove' : null; if (!cls) continue;
          let flat = true; for (const o of [-3 * 4, 3 * 4, -3 * cw * 4, 3 * cw * 4]) if (q[i + o] !== r || q[i + o + 1] !== g || q[i + o + 2] !== bl || q[i + o + 3] !== 255) { flat = false; break; }
          if (!flat) continue;
          const u = (x + 0.5) / cw, v = (y + 0.5) / ch, lx = TL[0] + u * (TR[0] - TL[0]) + v * (BL[0] - TL[0]), ly = TL[1] + u * (TR[1] - TL[1]) + v * (BL[1] - TL[1]);
          if (lx < 2 || ly < 2 || lx > 318 || ly > 148) continue;
          const sx = Math.floor(lx / 320 * W), sy = H - 1 - Math.floor(ly / LH * H), k = (sy * W + sx) * 4, A = acc[cls];
          A.n++; A.p[0] += r; A.p[1] += g; A.p[2] += bl; A.s[0] += d[k]; A.s[1] += d[k + 1]; A.s[2] += d[k + 2];
        }
      }
      const fin = (A) => ({ n: A.n, painted: A.p.map((v) => Math.round(v / (A.n || 1))), screen: A.s.map((v) => Math.round(v / (A.n || 1))) });
      return { glass: fin(acc.glass), glove: fin(acc.glove), over: list.filter((it) => it.over > 0).length, add: list.filter((it) => it.add > 0 && it.img && it.img.width > 200).length, pix: list.filter((it) => it.pix).length, glErr: BODY21.R3B.glErr, shown: R3D.shown(), size: W + 'x' + H };
    };
  });

  try {
    let day = null, night = null;
    const lum = (c) => c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
    await step('by day in the 3D view: the glass is its painted deep azure, not pale; the glove its painted brown', async () => {
      day = await page.evaluate(() => SHOT(0.45, false));
      console.log('  day ' + JSON.stringify(day));
      assert.ok(day.shown && day.glass.n > 300 && day.glove.n > 300 && day.pix >= 2 && day.glErr === 0, JSON.stringify(day));
      // the glass on the screen against the glass as painted (the daylight and the bloom had it 35 and more over in red and green)
      const g = day.glass;
      assert.ok(g.screen[0] <= g.painted[0] + 24 && g.screen[1] <= g.painted[1] + 24 && g.screen[2] >= g.painted[2] - 30, 'the glass ' + JSON.stringify(g));
      assert.ok(g.screen[2] > g.screen[0] + 95, 'deep azure ' + JSON.stringify(g.screen));
      const k = lum(day.glove.screen) / lum(day.glove.painted);
      assert.ok(k > 0.82 && k < 1.14, 'the glove is as bright as it was painted, no brighter: ' + k.toFixed(2) + ' ' + JSON.stringify(day.glove));
    });
    await step('by night: the hands are darker, and never below a third', async () => {
      night = await page.evaluate(() => SHOT(0.95, false));
      console.log('  night ' + JSON.stringify(night));
      const k = lum(night.glove.screen) / lum(night.glove.painted), kg = lum(night.glass.screen) / lum(night.glass.painted);
      assert.ok(night.glErr === 0 && night.glove.n > 300 && k < 0.8 && k > 0.3, 'glove night against painted ' + k.toFixed(2) + ' ' + JSON.stringify(night.glove));
      assert.ok(kg < 0.95 && kg > 0.3 && night.glass.screen[2] > night.glass.screen[0] + 50, 'the glass by night ' + kg.toFixed(2) + ' ' + JSON.stringify(night.glass));
    });
    await step('a Song in the 3D view: its light is laid over the pixel hands, the old tint is not added, the glass stays blue', async () => {
      const s = await page.evaluate(() => SHOT(0.45, true));
      console.log('  song ' + JSON.stringify(s));
      assert.ok(s.over >= 1 && s.add === 0 && s.glErr === 0, JSON.stringify(s));
      assert.ok(s.glass.n > 300 && s.glass.screen[2] > s.glass.screen[0] + 85 && s.glass.screen[0] < s.glass.painted[0] + 45, 'the glass under the Song ' + JSON.stringify(s.glass));
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
