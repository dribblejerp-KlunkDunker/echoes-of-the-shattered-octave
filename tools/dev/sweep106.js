// node sweep106.js <map> [<map> ...]   env: R3D=1 (the 3D renderer), VIEWS=day,back,night (default), OUTDIR
// Phase 106, the visual sweep: pictures of each place from where you arrive (its spawn), looking ahead and behind by
// day and ahead by night, the HUD and hands included (what the player sees). Pictures: OUTDIR/<map>-<view>.png.
// Each place is shot right after a fresh loadMap with the arrival message cleared, so nothing from the last place
// carries over. Prints one line per picture with the renderer, the map and any page error.
const path = require('path'); const fs = require('fs'); const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const r3d = !!process.env.R3D, OUT = process.env.OUTDIR || path.join(__dirname, 'out', 'sweep', r3d ? 'r3d' : 'classic');
const VIEWS = (process.env.VIEWS || 'day,back,night').split(','), PITCH = +(process.env.PITCH || 0);
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: r3d ? ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 160))); page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 160)); });
  await page.addInitScript((r3d) => { window.__r3d21 = { automation: true, force: r3d }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: r3d ? 'on' : 'off', cap: 80 })); } catch (e) { /* none */ } }, r3d);
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4175') + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate((r3d) => {
    GFX.illustratedScreens = false; if (typeof PRESETS !== 'undefined') PRESETS.apply('medium');
    if (typeof R3D !== 'undefined' && R3D.setMode) R3D.setMode(r3d ? 'on' : 'off');
    window.requestAnimationFrame = () => 0;
    window.CLEAN = () => { for (const s of ['#msgs']) { const n = document.querySelector(s); if (n) n.innerHTML = ''; } const h = document.querySelector('#hint'); if (h) h.textContent = ''; };
    window.GO = (id, back, tod) => {
      closeModal(); hide('#event'); const m = G.maps[id], sp = m.spawn || { x: 1.5, y: 1.5, dir: 0 };
      loadMap(id, { x: sp.x, y: sp.y, dir: (sp.dir || 0) + (back ? Math.PI : 0) });
      G.state = 'play'; G.tod = tod; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
      UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = window.__pitch || 0; if (G.player) G.player.pitch = Engine.cam.pitch; for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
      for (let i = 0; i < 8; i++) { window.advanceTime(1000 / 30); CLEAN(); }
      return { x: Engine.cam.x, y: Engine.cam.y };
    };
  }, r3d);
  await page.evaluate((p) => { window.__pitch = p; }, PITCH);
  for (const map of process.argv.slice(2)) {
    for (const v of VIEWS) {
      errs.length = 0;
      let at;
      try { at = await page.evaluate(([map, back, tod]) => GO(map, back, tod), [map, v === 'back', v === 'night' ? 0.95 : 0.45]); }
      catch (e) { console.log('FAIL', map, v, String(e.message).slice(0, 160)); continue; }
      for (let k = 0; k < 3; k++) { await page.evaluate(() => { for (let i = 0; i < 3; i++) { window.advanceTime(1000 / 60); CLEAN(); if (window.__pitch) Engine.cam.pitch = window.__pitch; } }); await page.waitForTimeout(r3d ? 400 : 120); }
      await page.screenshot({ path: path.join(OUT, map + '-' + v + '.png'), clip: { x: 0, y: 0, width: 1280, height: 600 } });
      const act = await page.evaluate(() => typeof R3D !== 'undefined' && R3D.active && R3D.active());
      console.log('shot', r3d ? 'r3d' : 'classic', act ? '3d' : 'cpu', map, v, at.x.toFixed(1) + ',' + at.y.toFixed(1), errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 3)) : '');
    }
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
