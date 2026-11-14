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
  // node walk.js <name> <tod> <cells per frame> [<from pace> <to pace>] : walk ROAD79's road, looking where it goes
  const fs = require('fs'); const [name, tod, step, from, to] = a; const dir = path.join(OUT, 'fr-' + name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  const pts = await page.evaluate(([step, from, to]) => { const P = ROAD79.ROADPTS, out = []; let acc = 0, next = +from || 0;
    for (let i = 0; i + 1 < P.length; i++) { const L = Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); while (next <= acc + L) { const t = (next - acc) / L; out.push([P[i][0] + (P[i + 1][0] - P[i][0]) * t, P[i][1] + (P[i + 1][1] - P[i][1]) * t]); next += +step; if (to && next > +to) return out; } acc += L; } return out; }, [step, from, to]);
  await page.evaluate(([x, y, tod]) => { GO(ROAD79.MAP, x, y, 0, tod); }, [pts[0][0], pts[0][1], +tod]);
  for (let k = 0; k < 4; k++) { await page.evaluate(() => STEP(1000 / 30)); await page.waitForTimeout(400); }
  let d = null;
  for (let i = 0; i < pts.length; i++) { const a0 = pts[i], a1 = pts[Math.min(pts.length - 1, i + Math.max(2, Math.round(7 / step)))]; let want = Math.atan2(a1[1] - a0[1], a1[0] - a0[0]); if (i === pts.length - 1) want = d;
    if (d == null) d = want; else { let dd = want - d; while (dd > Math.PI) dd -= 2 * Math.PI; while (dd < -Math.PI) dd += 2 * Math.PI; d += dd * 0.45; }
    await page.evaluate(([x, y, d, tod, p]) => { const c = G.player; c.x = x; c.y = y; c.dir = d; c.feet = G.map.groundAt(x, y); c.fallV = 0; c.fallFrom = null; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = d; G.tod = tod; G.vel.x = G.vel.y = 0; STEP(1000 / 30); Engine.cam.pitch = p; }, [a0[0], a0[1], d, +tod, +(process.env.PITCH || 0)]);
    await page.waitForTimeout(+(process.env.WAIT || 260));
    await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png'), clip: { x: 0, y: 0, width: +(process.env.VW || 1280), height: Math.round(+(process.env.VH || 800) * 0.75) } });
  }
  console.log('walk', name, pts.length, 'frames', errs.length ? errs.slice(0, 3) : '');
  await browser.close();
})();
