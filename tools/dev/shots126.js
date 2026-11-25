// Phase 126: the pictures of the callings' sights and acts (design §6.7), into screenshots/p126-*.jpg (JPEG, q 85).
// Medium preset, 1x. Each scene is staged as test/callings126.test.js stages it; the picture is the visible game canvas
// (the classic view, or the 3D view with its HUD layer), or the whole game panel for a card.
//   PREVIEW_URL=http://127.0.0.1:4229 tools/dev/browser.sh node tools/dev/shots126.js [OUTDIR] [name ...]
// Names: cores press vosk bell night lid choir hob mast scaffold air off (default: all).
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
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4229') + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    closeModal(); hide('#event'); G.state = 'play';
    window.__realEvent = window.showEvent;
    PRESETS.apply('medium'); GFX.callingSight = true; CALLINGS126.setMode('still');
    const pin = (fn) => { const rn = Math.random; let sd = 11; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; try { return fn(); } finally { Math.random = rn; } };
    window.SH = {
      view(v) { R3D.setMode(v === '3d' ? 'on' : 'off', { noSave: true }); },
      cls(id) { const p = G.player; p.cls = CLASSES.find((c) => c.id === id); p.glassed = id === 'blade'; if (id === 'cantor') { p.voiceMax = Math.max(p.voiceMax, 40); p.voice = 40; } G.glassLock = 0; },
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
  const shot = async (name, whole) => { const clip = whole ? await gameBox() : await canvasBox(); const f = path.join(OUT, 'p126-' + name + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 85, clip }); console.log('wrote ' + f); };
  const ev = (fn, arg) => page.evaluate(fn, arg);
  // under the 3D view the depth read-back is a frame late and waits on the GPU: a few real pauses between frames
  const settle3d = async () => { for (let i = 0; i < 5; i++) { await page.waitForTimeout(80); await ev(() => SH.frame()); } };
  const both = async (name, fn, views) => { for (const v of views || ['classic', '3d']) { console.log(name, v, JSON.stringify(await ev(fn, v))); if (v === '3d') { await settle3d(); console.log('  after', JSON.stringify(await ev(() => SH.drawn())), JSON.stringify(await ev(() => SH.probe()))); } await shot(name + '-' + v); } };

  // the quarry's barracks: two cores in view, one bell just behind the wall
  const cores = (v) => {
    SH.view(v); SH.cls('blade'); SH.at('quarry', 16.0, 21.5, 0, 0.45);
    const c = Engine.cam, m = G.map; let hid = null, dir0 = 0;
    for (let a = 0; a < 32 && !hid; a++) {
      const dir = a * Math.PI / 16, dx = Math.cos(dir), dy = Math.sin(dir); let wall = false;
      for (let s = 0.5; s < 5.5; s += 0.25) { const x = c.x + dx * s, y = c.y + dy * s; if (m.isSolidCell(x | 0, y | 0)) wall = true; else if (wall && s > 2.2) { hid = [x, y]; dir0 = dir; break; } }
    }
    SH.settle(16.0, 21.5, dir0 - 0.25, v === '3d' ? 4 : 0);
    if (hid && !G.ents.some((e) => e._p126shot)) { const h = SH.spawn('legionnaire', hid[0], hid[1], { name: 'Edda Quill', _p126shot: 1 }); h._p126shot = 1; }
    const ahead = (a, d) => [c.x + Math.cos(c.dir + a) * d, c.y + Math.sin(c.dir + a) * d];
    for (const [a, d, nm] of [[-0.32, 1.9, 'Mirren Salk'], [0.22, 2.6, 'Dunstan Pell']]) { const [x, y] = ahead(a, d); if (!m.isBlocked(x | 0, y | 0) && !G.ents.some((e) => e.name === nm)) { const e = SH.spawn('legionnaire', x, y, { name: nm }); e._p126shot = 1; } }
    SH.step(30); SH.clearMsgs(); SH.frame(); return { hid: !!hid, drawn: SH.drawn(), sense: CALLINGS126.sense() };
  };
  if (want('cores')) await both('glass-cores', cores);
  if (want('press')) await both('glass-press', (v) => {
    SH.view(v); SH.cls('blade'); SH.at('clearing', 26.8, 17.4, 0, 0.45);   // (the two are eight cells apart: one is within the sight's six)
    SH.settle(26.8, 17.4, -0.15, 0);
    SH.clearMsgs(); SH.frame(); return SH.drawn();
  });
  if (want('vosk')) await both('glass-vosk', (v) => {
    SH.view(v); SH.cls('blade'); SH.at('greenhall', 9.8, 5.5, 0, 0.45); SH.settle(9.8, 5.5, 0, 0);
    CALLINGS126.st.ringT = 40; SH.step(4); SH.clearMsgs(); SH.frame(); return SH.drawn();
  }, ['3d']);
  if (want('bell')) {
    console.log('bell', JSON.stringify(await ev(() => {
      SH.view('classic'); SH.cls('blade'); SH.at('quarry', 16.0, 21.5, 0, 0.45); SH.settle(16.0, 21.5, 0, 0);
      const c = Engine.cam, L = SH.spawn('legionnaire', c.x + 1.0, c.y, { name: 'Wenna Ffair' }); SH.frame();
      window.showEvent = window.__realEvent; interact(); return { state: G.state, title: (document.querySelector('#event-panel h2') || {}).textContent };
    })));
    await shot('glass-bell-card', true);
    await ev(() => { hide('#event'); G.state = 'play'; });
  }
  if (want('night')) await both('cantor-night', (v) => {
    SH.view(v); SH.cls('cantor'); SH.at('oakhaven', 19.2, 23.0, 0, 20 / 24); SH.step(6);
    const h = G.ents.find((e) => e.id === 'n28_hummer' && Math.hypot(e.x - 22.6, e.y - 24.4) < 0.6);
    const dir = h ? Math.atan2(h.y - 23.0, h.x - 19.2) : 0; SH.settle(19.2, 23.0, dir, v === '3d' ? 6 : 0);
    SH.clearMsgs(); SH.frame(); return SH.drawn();
  });
  if (want('lid')) await both('cantor-lid', (v) => {
    SH.view(v); SH.cls('cantor'); G.flags.church_come = true; G.flags.rite_started = false; G.flags.greening = false;
    SH.at('oakhaven', 24.5, 22.5, -Math.PI / 2, 0.5); SH.settle(24.5, 22.5, -Math.PI / 2, 0);
    try { R3D.camera.setAngle(14 * Math.PI / 180); } catch (e) { Engine.cam.pitch = 100; }
    SH.step(2); try { R3D.camera.setAngle(14 * Math.PI / 180); } catch (e) { /* none */ }
    SH.clearMsgs(); SH.frame(); const d = CALLINGS126.lastDrawn().find((r) => r.kind === 'lid'); return { drawn: SH.drawn(), lid: d && [d.y, d.n] };
  }, ['3d']);
  if (want('choir')) await both('cantor-choir', (v) => {
    SH.view(v); SH.cls('cantor');
    const C = CHURCH55; G.day = C.DAY; G.tod = (C.FROM + 0.4) / 24; G.flags.church_come = false;
    SH.at('oakhaven', C.ROAD_X, 8.5, -Math.PI / 2, (C.FROM + 0.4) / 24);
    G.flags.p55 = 1; G.flags.church_come = true; C.go(); SH.step(180);
    const ch = G.ents.filter((e) => e._p55 && /^ch\d\d$/.test(e._p55));
    window.showEvent = () => {}; hide('#event'); G.state = 'play';
    if (ch.length) {
      C.state().run = false;
      const mx = ch.reduce((a, e) => a + e.x, 0) / ch.length, my = ch.reduce((a, e) => a + e.y, 0) / ch.length;
      let best = [C.ROAD_X + 1.4, my + 5];
      for (const [dx, dy] of [[4.5, 1.5], [-4.5, 1.5], [3.5, 2.5], [-3.5, 2.5], [5.5, 0], [-5.5, 0], [2.5, 4.5], [-2.5, 4.5]]) { const x = mx + dx, y = my + dy; if (!G.map.isBlocked(x | 0, y | 0) && !G.map.isBlocked((x - Math.sign(dx) * 0.6) | 0, y | 0)) { best = [x, y]; break; } }
      SH.settle(best[0], best[1], Math.atan2(my - best[1], mx - best[0]), 0); C.state().run = false;
    }
    SH.clearMsgs(); SH.frame(); return { n: ch.length, drawn: SH.drawn() };
  }, ['classic']);
  if (want('hob')) {
    console.log('hob', JSON.stringify(await ev(() => {
      SH.view('classic'); SH.cls('cantor'); SH.at('p30_hollow', 7.5, 9.0, Math.PI / 2, 9 / 24); SH.frame();
      G.flags.p67 = 2; G.flags.p67_way = 'lyra'; window.showEvent = window.__realEvent; GRAFT67.hobCard();
      return [...document.querySelectorAll('#event-panel button')].map((b) => b.textContent);
    })));
    await shot('cantor-hob-card', true);
    await ev(() => { hide('#event'); G.state = 'play'; G.flags.p67 = 0; });
  }
  if (want('mast')) await both('corsair-mast', (v) => {
    SH.view(v); SH.cls('corsair'); SH.at('clearing', 13.0, 16.5, -Math.PI / 2, 0.45); SH.settle(13.0, 16.5, -Math.PI / 2 - 0.12, v === '3d' ? 0 : 100);
    if (v === '3d') { try { R3D.camera.setAngle(40 * Math.PI / 180); } catch (e) { /* none */ } }
    SH.step(2); if (v === '3d') { try { R3D.camera.setAngle(40 * Math.PI / 180); } catch (e) { /* none */ } } else Engine.cam.pitch = 100;
    SH.clearMsgs(); SH.frame(); return SH.drawn();
  });
  if (want('scaffold')) await both('corsair-scaffold', (v) => {
    SH.view(v); SH.cls('corsair'); SH.at('quarry', 16.2, 22.6, 0, 0.45);
    const dir = Math.atan2(19.4 - 22.6, 18.5 - 16.2); SH.settle(16.2, 22.6, dir, v === '3d' ? -10 : -8);
    SH.clearMsgs(); SH.frame(); return SH.drawn();
  });
  if (want('air')) await both('corsair-air93', (v) => {
    SH.view(v); SH.cls('corsair'); const A = AIR93, K = KESTREL16;
    G.flags.part4 = true; G.flags.coda_done = true; G.flags.p16k_up = 127; G.player.gold = 200;
    K.board(); A.setRoll(() => 0.1); A.setNext('courier'); A.start('home', 'whispergrove', 1, () => {}, true); window.showEvent = () => {};
    hide('#event'); G.state = 'play';
    A.hook(); for (const e of A.R.proctors) { e.stun = 1e6; e.state = 'idle'; e.hidden = true; }
    A.R.tanks[1].st = 'weep'; A.R.lashed = false;
    // (the deck runs east from the wheel: from here the bag's chain, the rail's, the cradle and the hold are all in view)
    const best = [K.OX + 4.5, K.OY + 5.5, -0.1];
    SH.settle(best[0], best[1], best[2], 6);
    for (const e of A.R.proctors) e.hidden = true;
    SH.clearMsgs(); SH.frame(); return SH.drawn();
  }, ['3d']);
  if (want('off')) {
    for (const v of ['classic', '3d']) {
      console.log('off', v, JSON.stringify(await ev(cores, v)));
      if (v === '3d') await settle3d();
      await shot('on-' + v);
      await ev(() => { GFX.callingSight = false; SH.frame(); });
      await shot('off-' + v);
      await ev(() => { GFX.callingSight = true; });
    }
  }
  await browser.close();
})().catch((e) => { console.log('FATAL', e && e.stack || e); process.exit(1); });
