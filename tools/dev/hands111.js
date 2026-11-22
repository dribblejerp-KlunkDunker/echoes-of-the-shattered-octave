// Phase 111: pictures of your own hands as the game itself draws them (the 3D view by default), for the touch-up pass.
//
//   PREVIEW_URL=http://127.0.0.1:4176 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright \
//     tools/dev/browser.sh node tools/dev/hands111.js OUTDIR [scene ...]
//
// A scene is name=key:value,key:value (no spaces). Keys:
//   w      the weapon id in the hand (default sword); 'hands' the fists, 'glass' the glass arm raised
//   g      1 the left arm is glass (default), 0 not
//   h      what the hands wear: an ARMOR id (a_gloves, a_gauntlets, ...) or 'bare' (default a_gloves)
//   s      a shield: an ARMOR id (a_buckler, a_kite, ...)
//   tod    the hour as the game counts it, 0..1 (0.45 day, 0.95 night; default 0.45)
//   song   1 a Song being sung (the open hands and their light); a number > 1 is the Song's root in Hz
//   cast   0..1 how far through the Song (default a third of the way)
//   atk    0..1 how far through a swing; dir the swing ('slash left', 'slash right', 'chop down', 'thrust')
//   low    0..1 how far lowered (putting away)
//   climb  0..1 how far through a climb
//   at     map@x@y@dir (dir in half-turns: 0 east, 0.5 south, -0.5 north); default oakhaven@22.5@30.5@-0.5
//   flags  a=0;b=1 GFX switches for this scene
// Env: EVAL='expression' prints its value in the page after each scene; R3D=0 the classic view; CROP=1 writes only the 3D view's own rectangle; MEASURE=1 prints each scene's mean colour
// of the glass and of the right hand as drawn on the screen (from the game's own picture masks).
// Every scene is one PNG in OUTDIR (1280 x 720, or 1152 x 500 with CROP=1) and one line on stdout.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
const OUT = process.argv[2] || path.join(__dirname, 'out', 'hands111');
const R3 = process.env.R3D !== '0', CROP = process.env.CROP === '1';
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
  page.on('console', (m) => { if (m.type() === 'warning' && /pixelhands|body21|fp87/.test(m.text())) console.log('warn: ' + m.text().slice(0, 300)); });
  if (R3) await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate((r3) => {
    GFX.illustratedScreens = false; if (typeof PRESETS !== 'undefined') PRESETS.apply('medium');
    if (typeof R3D !== 'undefined' && R3D.setMode) R3D.setMode(r3 ? 'on' : 'off');
    window.requestAnimationFrame = () => 0;
    window.__flags0 = {};
    window.CLEAN = () => { const n = document.querySelector('#msgs'); if (n) n.innerHTML = ''; const h = document.querySelector('#hint'); if (h) h.textContent = ''; };
    window.SCENE = (o) => {
      closeModal(); hide('#event');
      for (const k in window.__flags0) GFX[k] = window.__flags0[k];
      window.__flags0 = {};
      if (o.flags) for (const kv of o.flags.split(';')) { const [k, v] = kv.split('='); window.__flags0[k] = GFX[k]; GFX[k] = v === '1' ? true : v === '0' ? false : +v; }
      if (typeof BODY21 === 'object') BODY21.clearCaches(); if (typeof FP87 === 'object') FP87.cache.clear();
      const at = (o.at || 'oakhaven@22.5@30.5@-0.5').split('@');
      loadMap(at[0], { x: +at[1], y: +at[2], dir: +at[3] * Math.PI });
      const tod = o.tod == null ? 0.45 : +o.tod;
      G.state = 'play'; G.tod = tod; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
      UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; G.player.pitch = 0;
      for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
      const p = G.player, w = o.w || 'sword';
      p.glassed = o.g !== '0'; p.weapons = [w]; p.weapon = 0;
      p.armor = Object.assign({}, p.armor, { hands: o.h === 'bare' ? null : (o.h || 'a_gloves'), shield: o.s || null });
      G.attack.t = 0; if (G.song) G.song.t = 0; G.songFx = 0;
      if (typeof FPHANDS !== 'undefined') { FPHANDS.st.shown = w; FPHANDS.st.lower = 0; FPHANDS.st.cast = 0; FPHANDS.st.climb = 0; }
      GFX.body21 = true; GFX.fpHands = true;
      const hold = () => {
        if (o.atk != null) { G.attack.dur = 0.4; G.attack.t = 0.4 * (1 - +o.atk); G.attack.dirLabel = o.dir || 'slash left'; }
        if (o.song) { const hz = +o.song > 1 ? +o.song : 396; G.song.t = 0.35; FPHANDS.st.cast = o.cast != null ? Math.max(0.01, 0.9 * (1 - +o.cast)) : 0.6; FPHANDS.st.castDur = 0.9; FPHANDS.st.castCol = FPHANDS.colourFor(hz); FPHANDS.st.castPower = 0.8; }
        if (o.low != null) { FPHANDS.st.lower = +o.low; }
        if (o.climb != null) { FPHANDS.st.climb = FPHANDS.CLIMB_T * (1 - +o.climb); }
      };
      for (let i = 0; i < 10; i++) { window.advanceTime(1000 / 30); CLEAN(); }
      // hold the pose: the game's own clock would move it on, so it is set again and one more frame drawn
      const upd = update; update = function () {}; try { hold(); window.advanceTime(16); hold(); window.advanceTime(1); } finally { update = upd; }
      CLEAN();
      return { tier: typeof R3D !== 'undefined' && R3D.shown ? R3D.shown() : false, look: (GEARLOOK21.of(p) || {}).key };
    };
  }, R3);
  for (const sc of scenes) {
    const info = await page.evaluate((o) => SCENE(o), sc);
    await page.waitForTimeout(400);
    const file = path.join(OUT, sc.name + '.png');
    await page.screenshot({ path: file, clip: CROP ? { x: 64, y: 41, width: 1152, height: 500 } : { x: 0, y: 0, width: 1280, height: 720 } });
    console.log(sc.name + ' ' + JSON.stringify(info));
    if (process.env.EVAL) console.log('  ' + JSON.stringify(await page.evaluate((src) => { try { return (0, eval)(src); } catch (e) { return String(e); } }, process.env.EVAL)));
  }
  await browser.close();
})();
