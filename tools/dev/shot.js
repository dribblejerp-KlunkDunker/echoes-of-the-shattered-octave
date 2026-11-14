// node shot.js name map x y dir tod [name map x y dir tod ...]   env: R3D=1, PRE=code-to-eval-before-shots, SCALE
const path = require('path'); const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OUT = path.join(__dirname, 'out'), a = process.argv.slice(2), r3d = !!process.env.R3D, SC = +(process.env.SCALE || 2);
(async () => {
  const browser = await chromium.launch({ headless: true, args: r3d ? ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: +(process.env.VW || 1280), height: +(process.env.VH || 800) } })).newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message)); page.on('console', (m) => { if (m.type() === 'error') errs.push('console: ' + m.text().slice(0, 200)); });
  if (r3d) await page.addInitScript(() => { window.__r3d21 = { automation: true }; });
  await page.goto('http://127.0.0.1:4175/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(([sc, r3d, pre]) => {
    GFX.illustratedScreens = false; if (typeof PRESETS !== 'undefined' && window.__preset) PRESETS.apply(window.__preset);
    GFX.scale = sc; Engine.setScale(sc); if (r3d && typeof R3D !== 'undefined') R3D.setMode('on');
    window.requestAnimationFrame = () => 0;
    window.STEP = (ms) => { window.advanceTime(ms); for (const s of ['#msgs']) { const n = document.querySelector(s); if (n) n.innerHTML = ''; } const h = document.querySelector('#hint'); if (h) h.textContent = ''; };
    window.GO = (id, x, y, dir, tod) => { closeModal(); hide('#event'); loadMap(id, { x, y, dir }); G.state = 'play'; G.tod = tod; G.fadeT = 0; UPG.weather = window.__wx || 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (window.__wx && typeof Weather !== 'undefined' && Weather.hold) Weather.hold(window.__wx); UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle'; };
    if (pre) (0, eval)(pre);
    window.__wx = window.__wx || null;
  }, [SC, r3d, process.env.PRE || '']);
  for (let i = 0; i + 5 < a.length + 0; i += 6) {
    const [name, map, x, y, dir, tod] = a.slice(i, i + 6);
    await page.evaluate(([map, x, y, dir, tod, p]) => { GO(map, +x, +y, +dir * Math.PI, +tod); Engine.cam.pitch = p; if (G.player) G.player.pitch = p; }, [map, x, y, dir, tod, +(process.env.PITCH || 0)]);
    if (process.env.FWD) await page.evaluate(([x, y, d, ms]) => { for (let i = 0; i < ms / 250; i++) { const c = G.player; c.x = x; c.y = y; c.dir = d; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = d; G.vel.x = G.vel.y = 0; window.advanceTime(250); } const c = G.player; c.x = x; c.y = y; c.dir = d; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = d; }, [+x, +y, +dir * Math.PI, +process.env.FWD]);
    for (let k = 0; k < +(process.env.SETTLE || 0); k++) await page.evaluate(([x, y, d]) => { for (let i = 0; i < 30; i++) { const c = G.player; c.x = x; c.y = y; c.dir = d; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = d; G.vel.x = G.vel.y = 0; STEP(1000 / 30); } }, [+x, +y, +dir * Math.PI]);
    for (let k = 0; k < 5; k++) { await page.evaluate(() => { for (let i = 0; i < 4; i++) STEP(1000 / 60); }); await page.waitForTimeout(r3d ? 500 : 150); }
    await page.screenshot({ path: path.join(OUT, name + '.png'), clip: { x: 0, y: 0, width: +(process.env.VW || 1280), height: Math.round(+(process.env.VH || 800) * 0.75) } });
    console.log('shot', name, await page.evaluate(() => (typeof R3D !== 'undefined' && R3D.active && R3D.active()) + ' ' + G.map.id + ' ' + Engine.cam.x.toFixed(1) + ',' + Engine.cam.y.toFixed(1)));
  }
  if (process.env.PATHS) { const fs = require('fs');
    for (const [name, map, x0, y0, d0, x1, y1, d1, tod, n] of JSON.parse(process.env.PATHS)) {
      const dir = path.join(OUT, 'fr-' + name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
      await page.evaluate(([map, x, y, d, tod]) => { GO(map, x, y, d * Math.PI, tod); G.ents = G.ents.filter((e) => e.kind !== 'npc' && e.kind !== 'enemy' || Math.hypot(e.x - x, e.y - y) > 3); }, [map, x0, y0, d0, tod]);
      for (let k = 0; k < 4; k++) { await page.evaluate(() => STEP(1000 / 30)); await page.waitForTimeout(400); }
      for (let i = 0; i < n; i++) { const t = i / (n - 1), e = t * t * (3 - 2 * t);
        await page.evaluate(([x, y, d, tod, p]) => { const c = G.player; c.x = x; c.y = y; c.dir = d; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = d; G.tod = tod; G.vel.x = G.vel.y = 0; STEP(1000 / 30); Engine.cam.pitch = p; }, [x0 + (x1 - x0) * e, y0 + (y1 - y0) * e, (d0 + (d1 - d0) * e) * Math.PI, tod, +(process.env.PITCH || 0)]);
        await page.waitForTimeout(+(process.env.WAIT || 260));
        await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png'), clip: { x: 0, y: 0, width: +(process.env.VW || 1280), height: Math.round(+(process.env.VH || 800) * 0.75) } });
      }
      console.log('path', name, await page.evaluate(() => Engine.cam.x.toFixed(1) + ',' + Engine.cam.y.toFixed(1)));
    } }
  if (errs.length) console.log('ERRORS', errs.slice(0, 4));
  await browser.close();
})();
