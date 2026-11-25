// Phase 125b: the pictures of the six moments in their heroes' boots (design 5.8), plus the first-frame fix and the switch
// off. Medium preset, the 3D view, the sculpted hands. Each moment is staged as test/boots125.test.js stages it and
// stepped to its beat; the picture is the visible game canvas (the 3D view, the HUD and the captions) as a JPEG, q 85.
//   PREVIEW_URL=http://127.0.0.1:4228 tools/dev/browser.sh node tools/dev/shots125b.js [OUTDIR] [needle hold bolts rope names coda frame off]
// No Math.random: the game's own is pinned for each frame, as test/cover105.test.js pins it.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const OUT = process.argv[2] && !/^[a-z]+$/.test(process.argv[2]) ? process.argv[2] : path.join(__dirname, '..', '..', 'screenshots');
const ONLY = process.argv.slice(2).filter((a) => /^[a-z]+$/.test(a));
const want = (k) => !ONLY.length || ONLY.includes(k);
(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4228') + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForTimeout(600);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
    REEDS.forceManual = true;
    PRESETS.apply('medium'); GFX.sculptedHands = true; GFX.heroHands = true;
    const pin = (fn) => { const rn = Math.random; let sd = 11; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; try { return fn(); } finally { Math.random = rn; } };
    window.SH = {
      step(n) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; pin(() => update(0.05)); } },
      press() { const e = window.__ev[window.__ev.length - 1]; if (e && e.c[0]) e.c[0].f(); },
      beat(k, n) { for (let i = 0; i < (n || 4000) && BOOTS125.S.beat !== k; i++) SH.step(1); return BOOTS125.S.beat === k; },
      frame() { G.state = 'play'; pin(() => render()); pin(() => render()); },
      clearMsgs() { const m = document.querySelector('#msgs'); if (m) m.innerHTML = ''; },
      vault(stage) {
        const f = G.flags; f.rite_started = true; f.coil_done = true; f.r43 = stage; G.give('coil'); G.tod = 0.5;
        const cs = G.maps.rootvault.casingRoom; loadMap('rootvault', { x: cs.cx + 0.5, y: cs.cy + 1.9, dir: -Math.PI / 2 }); G.state = 'play'; RITE43.stageVault(G.map);
      },
    };
  });
  const canvasBox = async () => page.evaluate(() => { const c = [...document.querySelectorAll('canvas')].filter((x) => x.offsetWidth > 300).sort((a, b) => b.offsetWidth * b.offsetHeight - a.offsetWidth * a.offsetHeight)[0]; const r = c.getBoundingClientRect(); return { x: r.x, y: r.y, width: r.width, height: r.height }; });
  const shot = async (name) => { const clip = await canvasBox(); const f = path.join(OUT, 'p125b-' + name + '.jpg'); await page.screenshot({ path: f, type: 'jpeg', quality: 85, clip }); console.log('wrote ' + f); };
  const ev = (fn, arg) => page.evaluate(fn, arg);

  if (want('needle')) {   // Kaelen's glass hand and the needle at the pinch
    console.log(await ev(() => { BOOTS125.reset(); SH.vault(2); RITE43.startNeedle(); SH.press(); const ok = SH.beat('pinch'); BOOTS125.input('use', true); SH.step(6); SH.clearMsgs(); SH.frame(); return ok; }));
    await shot('needle');
    await ev(() => { BOOTS125.input('use', false); BOOTS125.reset(); });
  }
  if (want('hold')) {   // Lyra's hands on the stool, the collar ten feet off, the Hold the Pitch band
    console.log(await ev(async () => {
      BOOTS125.reset(); SH.vault(4); RITE43.afterNeedle(); SH.press(); SH.press(); const ok = SH.beat('sing');
      for (let i = 0; i < 40 && !REEDS.session; i++) await new Promise((r) => setTimeout(r, 25));
      const s = REEDS.session; if (s) for (let i = 0; i < 90; i++) { s.pitch = s.centsAt(Math.max(0, s.t)); s.step(0.05); }
      SH.clearMsgs(); SH.frame(); return ok && !!s;
    }));
    await shot('hold');
    await ev(() => { const s = REEDS.session; if (s) s.finish(true); BOOTS125.reset(); });
  }
  if (want('bolts')) {   // the spanner at the plate, Tobiah on the rail
    console.log(await ev(() => { BOOTS125.reset(); SH.vault(4); BOOTS125.enter('bolts', { seat: RITE43.seatCoil, done: RITE43.afterFifth }); SH.press(); SH.step(200); const v = RITE43.V; Engine.cam.x = v.kaelenDrum[0]; Engine.cam.y = v.kaelenDrum[1]; SH.step(4); BOOTS125.input('use', true); SH.step(1); BOOTS125.input('use', false); SH.step(300); SH.clearMsgs(); SH.frame(); return BOOTS125.S.beat; }));
    await shot('bolts');
    await ev(() => BOOTS125.reset());
  }
  if (want('rope')) {   // Vane's hands on the rail at Seven; the axe at Ten
    const setup = () => {
      BOOTS125.reset(); const f = G.flags; for (const k of Object.keys(f)) if (/^r45/.test(k)) delete f[k];
      Object.assign(f, { r43: 7, bore_broken: true, greening: true, g44: 5, r45: 4, r45_way: 'deck', r45_count: 18, r45_load: 6, r45_jitter: 'kaelen', r45_kaelen: true, escaped: false });
      hide('#ending'); G.state = 'play'; G.escapeTimer = 300; G.tod = 0.6; ROPE45.toDeck(4); G.state = 'play'; ROPE45.startCount(); SH.press();
    };
    console.log(await ev((src) => { (0, eval)('(' + src + ')')(); SH.beat('n5'); BOOTS125.input('use', true); SH.step(1); BOOTS125.input('use', false); BOOTS125.S.auto.n5 = false; const ok = SH.beat('n7'); SH.step(30); SH.frame(); return ok; }, setup.toString()));
    await shot('rope');
    console.log(await ev(() => { SH.beat('n10'); SH.step(4); SH.clearMsgs(); SH.frame(); return BOOTS125.S.beat; }));
    await shot('rope-ten');
    await ev(() => BOOTS125.reset());
  }
  if (want('names')) {   // the crate lid and Sable's good hand, Vane on his crate, eyes up; then the slip, looking down
    console.log(await ev(() => {
      BOOTS125.reset(); const f = G.flags; delete f.p53; delete f.part4; Object.assign(f, { escaped: true, part3: true, sable_joined: true }); G.tod = 0.9;
      loadMap(MANIFEST53.HOLD); G.state = 'play'; SH.press(); SH.press(); SH.press(); const ok = SH.beat('corwin'); BOOTS125.input('use', true); SH.step(1); BOOTS125.input('use', false); SH.step(40); SH.frame(); return ok;
    }));
    await shot('names');
    console.log(await ev(() => { Engine.cam.pitch = 242.42 * Math.tan(-24 * Math.PI / 180); SH.step(2); SH.frame(); return /An Echo/.test((window.__ev[window.__ev.length - 1] || {}).t || ''); }));
    await shot('names-slip');
    await ev(() => { Engine.cam.pitch = 0; BOOTS125.reset(); RITE43.grey(false); });
  }
  if (want('coda')) {   // Lyra's view between the willows at "Ten feet", the Wearer at the lamps
    console.log(await ev(() => {
      BOOTS125.reset(); const f = G.flags;
      for (const k of ['coda_done', 'coda_go', 'ring_set', 'ring_go', 'ring_fight', 'ring_sung', 'ring_struck', 'ring_back', 'lyra_dw_met', 'wearer_dead', 'wearer_coda_dead']) delete f[k];
      Object.assign(f, { part4: true, aegis_follow: true, lyra_voice: true, kaelen_told_now: true }); loadMap('deepwoods'); G.state = 'play';
      let q = NPCS.lyra_dw.quest(G); q = NPCS.lyra_dw.quest(G); q.choices[0].f(G); G.tod = 2 / 24;
      const t = G.map.triggers.find((o) => o.id === 'ring'); Engine.cam.x = RING.cx; Engine.cam.y = RING.cy + 0.5; t.inside = false; checkTriggers(); SH.press();
      Engine.cam.x = RING.bx; Engine.cam.y = RING.by; SH.step(4); BOOTS125.input('song', true);
      for (let i = 0; i < 4000 && G.flags.ring_t > 3.2; i++) SH.step(1);
      SH.frame(); return [BOOTS125.S.beat, G.flags.ring_t];
    }));
    await shot('coda');
    await ev(() => { BOOTS125.input('song', false); BOOTS125.reset(); });
  }
  if (want('frame')) {   // the first frame after staging the tavern, without the fix and with it (shots125b.sh puts them side by side)
    const stage = () => ev(() => { const st = (m, xx, yy, d, tod) => { G.state = 'paused'; G.tod = tod; loadMap(m, { x: xx, y: yy, dir: d }); G.fadeT = 0; Engine.cam.pitch = 0; Engine.cam.bob = 0; G.state = 'play'; }; BOOTS125.reset(); SH.clearMsgs(); st('oakhaven', 23.5, 20.5, -1.57, 0.5); SH.frame(); st('tavern', 8.5, 10.5, -1.57, 0.85); G.state = 'play'; render(); });
    await ev(() => { window.__real = BODY21.redrawNeeded; BODY21.redrawNeeded = () => false; }); await stage(); await shot('frame-before');
    await ev(() => { BODY21.redrawNeeded = window.__real; }); await stage(); await shot('frame-after');
  }
  if (want('off')) {   // the switch off: in Kaelen's boots at the needle, the traveller's own hands and no props
    console.log(await ev(() => { BOOTS125.reset(); GFX.heroHands = false; SH.vault(2); RITE43.startNeedle(); SH.press(); SH.beat('pinch'); BOOTS125.input('use', true); SH.step(6); SH.clearMsgs(); SH.frame(); return true; }));
    await shot('off');
    await ev(() => { BOOTS125.input('use', false); BOOTS125.reset(); GFX.heroHands = true; });
  }
  await browser.close();
})();
