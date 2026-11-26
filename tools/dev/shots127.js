// Phase 127: the pictures of the quarry at work and the two callings' sights and acts (design §6.6), into screenshots/p127-*.jpg (JPEG, q 85).
// Medium preset, 1x. Each scene is staged as test/callings127.test.js stages it; the picture is the visible game canvas
// (the classic view, or the 3D view with its HUD layer), or the whole game panel for a card.
//   PREVIEW_URL=http://127.0.0.1:4232 tools/dev/browser.sh node tools/dev/shots127.js [OUTDIR] [name ...]
// Names: workday worknight pumps rootvault rim off stamps card name timber seams shoulder (default: all).
// No Math.random: the game's own is pinned for each frame, as test/cover105.test.js pins it.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] && !/^[a-z]+$/.test(process.argv[2]) ? process.argv[2] : path.join(__dirname, '..', '..', 'screenshots');
const ONLY = process.argv.slice(2).filter((a) => /^[a-z]+$/.test(a));
const want = (k) => !ONLY.length || ONLY.includes(k);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'off', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4232') + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    closeModal(); hide('#event'); G.state = 'play';
    window.__realEvent = window.showEvent;
    PRESETS.apply('medium'); GFX.callingSight = true; GFX.quarryWork = true; const f0 = G.flags; f0.p6d_e_co_qr = f0.p6d_e_co_any = f0.p6d_e_gl_qr = f0.p6d_e_gl_rv = true; CALLINGS126.setMode('still');
    const pin = (fn) => { const rn = Math.random; let sd = 11; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; try { return fn(); } finally { Math.random = rn; } };
    window.SH = {
      view(v) { R3D.setMode(v === '3d' ? 'on' : 'off', { noSave: true }); },
      cls(id) { const p = G.player; p.cls = CLASSES.find((c) => c.id === id); p.glassed = id === 'blade'; p.voiceMax = Math.max(p.voiceMax, 40); p.voice = 40; G.glassLock = 0; },
      at(map, x, y, dir, tod) {
        G.state = 'paused'; G.tod = tod; loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = Math.max(G.day, 1);
        Engine.cam.pitch = 0; Engine.cam.bob = 0; G.vel.x = G.vel.y = 0; try { Weather.hold('clear'); } catch (e) { /* none */ }
        for (const e of G.ents) if (e && e.kind === 'enemy') { e.state = 'idle'; e.stun = 1e6; }
        G.state = 'play';
      },
      step(n) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; pin(() => update(0.05)); } },
      settle(x, y, dir, pitch) { SH.step(8); const c = Engine.cam; c.x = x; c.y = y; c.dir = dir; c.pitch = pitch || 0; G.vel.x = G.vel.y = 0; SH.step(26); c.x = x; c.y = y; c.dir = dir; c.pitch = pitch || 0; },
      spawn(type, x, y, o) { const e = hydrate(Object.assign({ kind: 'enemy', type, x, y }, o || {})); e.state = 'idle'; e.stun = 1e6; G.map.entities.push(e); return e; },
      // (the staged foes are held with a long stun, whose strobe (e.flash) the classic view draws white: drawn unstunned)
      frame() { G.state = 'play'; CALLINGS126.gather(); const held = G.ents.filter((e) => e && e.kind === 'enemy' && e.stun > 1e5); for (const e of held) { e.stun = 0; e.flash = false; } try { pin(() => render()); pin(() => render()); pin(() => render()); } finally { for (const e of held) e.stun = 1e6; } },
      clearMsgs() { const m = document.querySelector('#msgs'); if (m) m.innerHTML = ''; },
      drawn() { return CALLINGS126.lastDrawn().map((r) => r.kind + (r.e && r.e.name ? ':' + r.e.name : '')); },
      probe() { return G.ents.filter((e) => (e.type === 'legionnaire' || /^p93_(cradle|hold)/.test(e.use || '')) && e._screen).map((e) => { const s = e._screen, cx = (s.x0 + s.x1) / 2; return [e.name || e.use, +s.z.toFixed(2), +s.y0.toFixed(0), +s.y1.toFixed(0), [0.2, 0.5, 0.99].map((f) => +Engine.depthAt(cx, s.y0 + (s.y1 - s.y0) * f).toFixed(2))]; }); },
    };
  });
  const canvasBox = async () => page.evaluate(() => { const c = [...document.querySelectorAll('canvas')].filter((x) => x.offsetWidth > 300).sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight)[0]; const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const gameBox = async () => page.evaluate(() => { const r = document.getElementById('game').getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const shot = async (name, whole) => { const clip = whole ? await gameBox() : await canvasBox(); const f = path.join(OUT, 'p127-' + name + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 85, clip }); console.log('wrote ' + f); };
  const ev = (fn, arg) => page.evaluate(fn, arg);
  // under the 3D view the depth read-back is a frame late and waits on the GPU: a few real pauses between frames
  const settle3d = async () => { for (let i = 0; i < 5; i++) { await page.waitForTimeout(80); await ev(() => SH.frame()); } };
  const both = async (name, fn, views) => { for (const v of views || ['classic', '3d']) { console.log(name, v, JSON.stringify(await ev(fn, v))); if (v === '3d') { await settle3d(); console.log('  after', JSON.stringify(await ev(() => SH.drawn())), JSON.stringify(await ev(() => SH.probe()))); } await shot(name + '-' + v); } };

  // ---------------------------------------------------------------- the quarry at work
  await ev(() => {
    SH.work = (v, map, x, y, dir, tod, pitch, off) => {
      SH.view(v); SH.cls('blade'); GFX.quarryWork = !off; if (GFX.changed) GFX.changed();
      SH.at(map, x, y, dir, tod); SH.settle(x, y, dir, pitch || 0); SH.step(40);
      const c = Engine.cam; c.x = x; c.y = y; c.dir = dir; c.pitch = pitch || 0;
      SH.clearMsgs(); SH.frame();
      return G.ents.filter((e) => (e._q127 || (e._life && /^q127_|^cl_/.test(e._life))) && !e.hidden && e._screen).map((e) => (e._q127 || e._life) + ':' + (e._stop ? e._stop.job : ''));
    };
  });
  const bothA = async (name, args, views) => { for (const v of views || ['classic', '3d']) { console.log(name, v, JSON.stringify(await ev(([v, a]) => SH.work(v, ...a), [v, args]))); if (v === '3d') await settle3d(); await shot(name + '-' + v); } };
  const DAY = ['quarry', 21.6, 12.2, Math.atan2(11.5 - 12.2, 19.3 - 21.6), 10 / 24, 0];
  // 10:00: the day man at the shaft room's lever (the drums), from the shaft room's door
  if (want('workday')) await bothA('work-day', DAY);
  // 22:00: the night man at the pump hall door, the pumps beyond
  if (want('worknight')) await bothA('work-night', ['quarry', 30.5, 28.2, Math.PI / 2 + 0.25, 22 / 24, 0]);
  if (want('pumps')) await bothA('work-pumps', ['quarry', 29.6, 29.2, Math.atan2(27.6 - 29.2, 27.0 - 29.6), 10 / 24, 0], ['3d']);
  if (want('rootvault')) await bothA('work-rootvault', ['rootvault', 33.6, 11.9, Math.atan2(9.0 - 11.9, 31.5 - 33.6), 10 / 24, 0], ['3d']);
  if (want('rim')) await bothA('work-rim-0620', ['clearing', 25.6, 11.2, Math.atan2(4.6 - 11.2, 18.6 - 25.6), 6.33 / 24, 14], ['3d']);
  if (want('off')) { await bothA('on', DAY); await bothA('off', DAY.concat([true])); }
  await browser.close();
})();
