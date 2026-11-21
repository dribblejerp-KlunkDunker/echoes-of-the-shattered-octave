// Phase 109: the review sheet for the hands-and-arms options.
//
//   PREVIEW_URL=http://127.0.0.1:4176 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright \
//     tools/dev/browser.sh node tools/dev/hands109.js OUTDIR [js/hands109s.js js/hands109p.js js/hands109x.js]
//
// Writes, in OUTDIR:
//   bg-day.png, bg-night.png      the 3D view in Oakhaven's street (by day; at night with the lamps lit), no HUD at all
//   today-<pose>.png              the game's own first-person picture today in that pose (Phase 98's painter), by day
//   <name>-<pose>[-night].png     each option module's picture over the same frame (name: the module's file name)
//   times.json                    how long each render took (ms)
//
// An option module defines one global named after its file in capitals (js/hands109s.js -> HANDS109S) with
//   render(pose, look, light) -> a 1152 x 500 canvas (the 3D view's own size in the review window), transparent where
//                                 there is no hand or arm; the harness lays it over the view at (64, 41)
//   pose:  'sword' | 'fist' | 'glass' | 'song'
//   look:  { hands: 'leather' | 'bare' | 'mail', skin: [r, g, b], sleeve: [r, g, b], glassArm: true | false, song: [r, g, b] | null }
//   light: { key: [r, g, b], dir: [x, y, z] (towards the light, view space: +x right, +y up, +z towards the viewer),
//            amb: [r, g, b], torch: [r, g, b] | null }    a lit option uses it; the others may ignore it
// Only modules whose name ends in S (the lit option) are also drawn by night.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const OUT = process.argv[2] || path.join(__dirname, 'out', 'hands109');
const MODS = process.argv.slice(3);
const POSES = ['sword', 'fist', 'glass', 'song'];
const LOOKS = {
  sword: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: null },
  fist: { hands: 'bare', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: false, song: null },
  glass: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: null },
  song: { hands: 'leather', skin: [214, 170, 136], sleeve: [92, 78, 62], glassArm: true, song: [226, 196, 64] },
};
const LIGHTS = {
  day: { key: [255, 244, 226], dir: [-0.45, 0.7, 0.55], amb: [120, 132, 150], torch: null },
  night: { key: [70, 84, 120], dir: [0.2, 0.8, 0.4], amb: [26, 30, 44], torch: [255, 170, 90] },
};
const TODAY = { sword: { w: 'sword', glassed: true }, fist: { w: 'hands', glassed: false }, glass: { w: 'glass', glassed: true }, song: { w: 'hands', glassed: true, song: true } };

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.log('pageerror: ' + e.message.slice(0, 200)));
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    GFX.illustratedScreens = false; if (typeof PRESETS !== 'undefined') PRESETS.apply('medium');
    if (typeof R3D !== 'undefined' && R3D.setMode) R3D.setMode('on');
    window.requestAnimationFrame = () => 0;
    window.__hud = drawHUD;
    window.CLEAN = () => { const n = document.querySelector('#msgs'); if (n) n.innerHTML = ''; const h = document.querySelector('#hint'); if (h) h.textContent = ''; };
    window.STAND = (tod, today) => {
      closeModal(); hide('#event');
      loadMap('oakhaven', { x: 22.5, y: 30.5, dir: -Math.PI / 2 });
      G.state = 'play'; G.tod = tod; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
      UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; G.player.pitch = 0;
      for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
      const p = G.player;
      if (today) {
        p.glassed = today.glassed; p.weapons = [today.w]; p.weapon = 0;
        if (typeof FPHANDS !== 'undefined') { FPHANDS.st.shown = today.w; FPHANDS.st.lower = 0; FPHANDS.st.cast = 0; }
        // only the first-person picture: the HUD's other parts are drawn by the same function, so they come too; the
        // review sheet is about the hands, and the bars sit at the edges
        drawHUD = window.__hud; GFX.body21 = true; GFX.fpHands = true;
      } else { drawHUD = function () {}; GFX.body21 = false; GFX.fpHands = false; }
      for (let i = 0; i < 10; i++) { window.advanceTime(1000 / 30); CLEAN(); }
      if (G.song) G.song.t = 0;
      if (today && today.song && typeof FPHANDS !== 'undefined') { G.song.t = 0.35; FPHANDS.st.cast = 0.6; FPHANDS.st.castDur = 0.9; FPHANDS.st.castCol = [226, 196, 64]; FPHANDS.st.castPower = 0.8; window.advanceTime(16); G.song.t = 0.35; FPHANDS.st.cast = 0.6; window.advanceTime(1); }
      return true;
    };
  });
  const shot = async (file) => { await page.waitForTimeout(500); await page.screenshot({ path: path.join(OUT, file), clip: { x: 0, y: 0, width: 1280, height: 720 } }); };
  await page.evaluate(() => STAND(0.45, null)); await shot('bg-day.png');
  await page.evaluate(() => STAND(0.95, null)); await shot('bg-night.png');
  for (const pose of POSES) { await page.evaluate((t) => STAND(0.45, t), TODAY[pose]); await shot('today-' + pose + '.png'); }

  // each option over the frames
  const bg = { day: 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, 'bg-day.png')).toString('base64'), night: 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, 'bg-night.png')).toString('base64') };
  const times = {};
  for (const mod of MODS) {
    await page.addScriptTag({ content: fs.readFileSync(mod, 'utf8') + '\n//# sourceURL=' + mod });
    const name = path.basename(mod, '.js').toUpperCase();
    for (const pose of POSES) for (const lt of ['day', 'night']) {
      if (lt === 'night' && !/S$/.test(name)) continue;
      const r = await page.evaluate(async ([name, pose, look, light, src]) => {
        const M = window[name]; if (!M || !M.render) return { err: name + ' has no render()' };
        try {
          const t0 = performance.now(), c = M.render(pose, look, light), ms = performance.now() - t0;
          const img = new Image(); await new Promise((res) => { img.onload = res; img.src = src; });
          const o = document.createElement('canvas'); o.width = 1280; o.height = 720; const x = o.getContext('2d');
          x.drawImage(img, 0, 0); x.save(); x.beginPath(); x.rect(64, 41, 1152, 500); x.clip(); x.drawImage(c, 64, 41, 1152, 500); x.restore();
          return { url: o.toDataURL('image/png'), ms };
        } catch (e) { return { err: String(e && e.stack || e).slice(0, 400) }; }
      }, [name, pose, LOOKS[pose], LIGHTS[lt], bg[lt]]);
      if (r.err) { console.log(name, pose, lt, 'FAILED', r.err); continue; }
      fs.writeFileSync(path.join(OUT, name.toLowerCase() + '-' + pose + (lt === 'night' ? '-night' : '') + '.png'), Buffer.from(r.url.split(',')[1], 'base64'));
      times[name + ' ' + pose + ' ' + lt] = +r.ms.toFixed(1);
      console.log(name, pose, lt, r.ms.toFixed(1) + ' ms');
    }
  }
  fs.writeFileSync(path.join(OUT, 'times.json'), JSON.stringify(times, null, 1));
  await browser.close();
})();
