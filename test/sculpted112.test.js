// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/sculpted112.test.js
// Phase 112 (the sculpted hands, lit by the world): js/sculpted112.js in the game. Run alone (it draws in WebGL).
//   - the choice is off in every preset, and off the 3D view draws the pixel hands exactly as before
//   - on, in the 3D view: no first-person picture is drawn; one canvas of sculpted hands is laid over the view, and it has
//     hands on it (the right hand at the right, the resting glass fist at the left, the glass blue)
//   - the hands are placed where the pixel hands are: each hand's middle on the sculpted canvas is near where the pixel
//     hands' pose puts it
//   - every weapon kind is held (a card for the weapon, a hand or two closed on it), the fists, the glass arm, a Song
//   - behind a shield the arm is sculpted and the shield's face is a card before it; a climb's two fists are sculpted
//   - moving joints: the wrist turns through a swing and a Song; an open hand's fingers open as a Song gathers
//   - the game's light: by night the canvas is darker than by day; a Song's colour lights the open hands
//   - the same state draws the same pixels; nothing uses Math.random
//   - the Options row ("Hands": In pixels / Sculpted) and its French; the classic view is not touched; no page errors
'use strict';
const assert = require('node:assert');
const fs = require('fs'), path = require('path');
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
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /sculpted112|pixelhands110|fp87|body21/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } window.__rand = 0; const r = Math.random; Math.random = function () { window.__rand++; return r.call(Math); }; });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof SCULPTED112 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Hand Tester'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    GFX.illustratedScreens = false; window.__presetDefault = {}; for (const p of ['original', 'low', 'medium', 'high', 'cinematic']) { try { PRESETS.apply(p); window.__presetDefault[p] = GFX.sculptedHands; } catch (e) { /* no such preset */ } }
    PRESETS.apply('medium'); if (R3D.setMode) R3D.setMode('on');
    window.requestAnimationFrame = () => 0;
    // stand in Oakhaven's street at an hour with a weapon; draw; say what the body pass was given and what is on the
    // sculpted canvas: how much of it is covered, left and right, the middle colour of the blue (glass) pixels, a hash
    window.SHOT = (o) => {
      closeModal(); hide('#event'); loadMap('oakhaven', { x: 22.5, y: 30.5, dir: -Math.PI / 2 });
      G.state = 'play'; G.tod = o.tod == null ? 0.45 : o.tod; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
      UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; G.player.pitch = 0;
      for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
      const p = G.player, w = o.w || 'sword'; p.glassed = o.g !== 0; p.weapons = [w]; p.weapon = 0; p.armor = Object.assign({}, p.armor, { hands: o.h === undefined ? 'a_gloves' : o.h, shield: o.s || null });
      G.glassLock = o.lock ? 5 : 0; G.attack.t = 0; G.song.t = 0; G.songFx = 0; FPHANDS.st.shown = w; FPHANDS.st.lower = 0; FPHANDS.st.cast = 0; FPHANDS.st.climb = 0;
      GFX.sculptedHands = !!o.on; BODY21.clearCaches();
      for (let i = 0; i < 6; i++) window.advanceTime(1000 / 30);
      const hold = () => { if (o.climb != null) FPHANDS.st.climb = FPHANDS.CLIMB_T * (1 - o.climb); if (o.song) { G.song.t = 0.35; FPHANDS.st.cast = 0.6; FPHANDS.st.castDur = 0.9; FPHANDS.st.castCol = o.song; FPHANDS.st.castPower = 0.8; } if (o.atk != null) { G.attack.dur = 0.4; G.attack.t = 0.4 * (1 - o.atk); G.attack.dirLabel = 'slash left'; } };
      const pn = performance.now; performance.now = () => 5000;   // (the idle sway reads the clock)
      const upd = update; update = function () {}; BODY21.R3B.check = true; const s0 = Object.assign({}, SCULPTED112.stats);
      // (a climb's pixel fists are counted as they are painted)
      let pixClimb = 0; const ch = PIXELHANDS110.climbHand; PIXELHANDS110.climbHand = function () { const r = ch.apply(this, arguments); if (r) pixClimb++; return r; };
      try { hold(); window.advanceTime(16); hold(); pixClimb = 0; window.advanceTime(1); } finally { update = upd; performance.now = pn; PIXELHANDS110.climbHand = ch; }
      const list = (BODY21.R3B.last && BODY21.R3B.last.list) || [], cv = SCULPTED112._gl() && SCULPTED112._gl().cv;
      const out = { pix: list.filter((it) => it.pix).length, live: list.filter((it) => it.over > 0 && it.img === cv).length, hands: SCULPTED112.stats.hands - s0.hands, cards: SCULPTED112.stats.cards - s0.cards, frames: SCULPTED112.stats.frames - s0.frames, glErr: BODY21.R3B.glErr };
      out.pixClimb = pixClimb; out.shieldQuads = list.filter((it) => !it.over && !it.pix && it.img && it.img.width > 40 && it.img !== cv).length;
      // the HUD's own canvas where the left fist holds its rung half way up a climb (view pixel 136, 60)
      try { const t = Engine.ctx.getTransform(); out.hudA = Engine.ctx.getImageData(Math.round(136 * t.a), Math.round(60 * t.d), 1, 1).data[3]; } catch (e) { out.hudA = -1; }
      if (o.on && cv) {
        const px = SCULPTED112.read(), W = px.w, H = px.h, d = px.data; let n = 0, left = 0, right = 0, hash = 0, lum = 0; const R = [], Gc = [], B = [];
        for (let y = 0; y < H; y += 2) for (let x = 0; x < W; x += 2) { const q = (y * W + x) * 4; if (d[q + 3] < 200) continue; n++; if (x < W / 2) left++; else right++; lum += d[q] * 0.3 + d[q + 1] * 0.55 + d[q + 2] * 0.15; hash = (hash * 31 + d[q] + d[q + 1] * 7 + d[q + 2] * 13) >>> 0; if (d[q + 2] > d[q] + 40 && d[q + 2] > 90) { R.push(d[q]); Gc.push(d[q + 1]); B.push(d[q + 2]); } }
        const m = (a) => { a.sort((u, v) => u - v); return a.length ? a[a.length >> 1] : -1; };
        Object.assign(out, { cover: n / (W * H / 4), left: left / (n || 1), right: right / (n || 1), lum: lum / (n || 1), hash, blue: [m(R), m(Gc), m(B)], blueN: R.length });
      }
      return out;
    };
  });

  try {
    await step('the choice is off in every preset; off, the 3D view draws the pixel hands as before', async () => {
      const r = await page.evaluate(() => ({ d: window.__presetDefault, off: SHOT({ on: false }), on: SCULPTED112.on() }));
      assert.ok(Object.keys(r.d).length >= 4 && Object.values(r.d).every((v) => v === false), JSON.stringify(r.d));
      assert.ok(r.off.pix >= 2 && r.off.live === 0 && r.off.frames === 0 && r.off.glErr === 0, JSON.stringify(r.off));
    });
    let day = null;
    await step('on, in the 3D view: no first-person picture is drawn; the sculpted canvas is laid over the view with both hands on it, the glass blue', async () => {
      day = await page.evaluate(() => SHOT({ on: true }));
      console.log('  day ' + JSON.stringify(day));
      assert.ok(day.pix === 0 && day.live === 1 && day.frames >= 1 && day.hands >= 2 && day.cards >= 1 && day.glErr === 0, JSON.stringify(day));
      assert.ok(day.cover > 0.03 && day.cover < 0.5 && day.left > 0.15 && day.right > 0.3, 'a hand each side ' + JSON.stringify(day));
      assert.ok(day.blueN > 500 && day.blue[2] > day.blue[0] + 70, 'the glass is blue ' + JSON.stringify(day.blue));
    });
    await step('the same state draws the same pixels', async () => {
      const again = await page.evaluate(() => SHOT({ on: true }));
      assert.strictEqual(again.hash, day.hash, JSON.stringify({ a: day.hash, b: again.hash }));
    });
    await step('the hands stand where the pixel hands are', async () => {
      const r = await page.evaluate(() => {
        const look = GEARLOOK21.of(G.player), P = PIXELHANDS110.poses('w', 'sword', look), b = BODY21.build(WEAPONS.sword.img, look, 'sword', 'right');
        return { hands: P.hands.length, x: P.hands[0].x / P.w, y: P.hands[0].y / P.h, cm: P.hands[0].cm, w: P.w === b.main.width && P.h === b.main.height, card: !!P.weapon && P.weapon.width === P.w, fist: PIXELHANDS110.poses('h', 'fist', look).hands.length, open: PIXELHANDS110.poses('h', 'open', look).hands.length, glass: PIXELHANDS110.poses('h', 'glassfist', look).hands[0].glass };
      });
      assert.ok(r.hands === 1 && r.w && r.card && r.x > 0.2 && r.x < 0.9 && r.y > 0.4 && r.cm > 8 && r.cm < 30 && r.fist === 1 && r.open === 2 && r.glass === true, JSON.stringify(r));
    });
    await step('every weapon kind is held, and the fists, the glass arm and a mid-swing', async () => {
      const r = await page.evaluate(() => {
        const out = {};
        for (const w of ['knife', 'longsword', 'axe', 'mace', 'spear', 'maul', 'pistol', 'crossbow', 'p87_hornbow', 'p12_glassblade']) { const s = SHOT({ on: true, w }); out[w] = [s.hands, s.cards, s.pix, +s.cover.toFixed(3), s.glErr]; }
        const f = SHOT({ on: true, w: 'hands', g: 0, h: null }); out.fists = [f.hands, f.cards, f.pix, +f.cover.toFixed(3), f.glErr];
        const g = SHOT({ on: true, w: 'glass' }); out.glass = [g.hands, g.cards, g.pix, +g.cover.toFixed(3), g.glErr];
        const s = SHOT({ on: true, atk: 0.5 }); out.swing = [s.hands, s.cards, s.pix, +s.cover.toFixed(3), s.glErr];
        return out;
      });
      console.log('  kinds ' + JSON.stringify(r));
      for (const [k, v] of Object.entries(r)) assert.ok(v[0] >= 2 && v[2] === 0 && v[3] > 0.02 && v[4] === 0 && (k === 'fists' || k === 'glass' ? v[1] === 0 : v[1] >= 1), k + ' ' + JSON.stringify(v));
      for (const k of ['spear', 'maul', 'crossbow', 'p12_glassblade']) assert.ok(r[k][0] >= 2, k + ' is held in both hands ' + JSON.stringify(r[k]));
    });
    await step('the game\'s light: darker by night; a Song\'s colour on the open hands; the locked glass arm washed pale', async () => {
      const r = await page.evaluate(() => ({ night: SHOT({ on: true, tod: 0.95 }), plain: SHOT({ on: true, w: 'hands' }), song: SHOT({ on: true, w: 'hands', song: [96, 214, 112] }), L: [BODY21.sculptLight().night],
        glass: SHOT({ on: true, w: 'glass' }), locked: SHOT({ on: true, w: 'glass', lock: 1 }), after: SHOT({ on: true, w: 'glass' }) }));
      console.log('  night ' + r.night.lum.toFixed(1) + ' day ' + day.lum.toFixed(1) + ' song ' + JSON.stringify([r.song.hands, r.song.pix, r.song.live]));
      assert.ok(r.night.lum < day.lum * 0.75 && r.night.lum > day.lum * 0.12 && r.night.glErr === 0, JSON.stringify([r.night.lum, day.lum]));
      assert.ok(r.song.hands >= 2 && r.song.pix === 0 && r.song.live === 1 && r.song.hash !== r.plain.hash, 'the open hands under a Song ' + JSON.stringify(r.song));
      assert.ok(r.locked.blue[0] > r.glass.blue[0] + 12 && r.after.hash === r.glass.hash, 'the locked glass arm is washed pale, and only while it is locked ' + JSON.stringify([r.glass.blue, r.locked.blue]));
    });
    await step('behind a shield the arm is sculpted too, the shield\'s face a card before it; a climb\'s two fists are sculpted, laid on the HUD over the ladder', async () => {
      const r = await page.evaluate(() => ({ off: SHOT({ on: false, s: 'a_kite' }), on: SHOT({ on: true, s: 'a_kite' }), bare: SHOT({ on: true, s: 'a_buckler', g: 0, h: null }),
        cOff: SHOT({ on: false, climb: 0.5 }), cOn: SHOT({ on: true, climb: 0.5 }) }));
      console.log('  shield ' + JSON.stringify([r.off.pix, r.on.pix, r.on.hands, r.on.cards, r.on.left.toFixed(2), r.bare.hands, r.bare.cards]) + ' climb ' + JSON.stringify([r.cOff.pixClimb, r.cOn.pixClimb, r.cOn.hands, r.cOn.live, r.cOn.hudA]));
      assert.ok(r.off.pix >= 3, 'the pixel arm and its fingers, with the pixel hands ' + JSON.stringify(r.off));
      for (const k of ['on', 'bare']) assert.ok(r[k].pix === 0 && r[k].live === 1 && r[k].frames >= 1 && r[k].hands === 2 * r[k].frames && r[k].cards === 2 * r[k].frames && r[k].left > 0.15 && r[k].glErr === 0, k + ' ' + JSON.stringify(r[k]));
      assert.ok(r.on.blueN > 300, 'the glass arm behind the shield ' + r.on.blueN);
      assert.ok(r.cOff.pixClimb === 2 && r.cOn.pixClimb === 0 && r.cOn.hands >= 2 && r.cOn.live === 0 && r.cOn.hudA > 200 && r.cOn.glErr === 0, JSON.stringify([r.cOff, r.cOn]));
    });
    await step('moving joints: the wrist turns through a swing and a Song (the hand stays on the weapon, the forearm moves), an open hand\'s fingers open as a Song gathers', async () => {
      const r = await page.evaluate(() => {
        GFX.sculptedHands = true; const look = GEARLOOK21.of(G.player), L = BODY21.sculptLight(), t = [0.25, 0, 0, 0.25, 180, 20];
        // the picture drawn with a wrist's turn: how many of its pixels differ from the wrist at rest, near the grip and along the arm
        const pic = (k, id, anim) => { SCULPTED112.begin(); SCULPTED112.place(k, id, look, t, anim); SCULPTED112.flush(L); SCULPTED112.begin(); SCULPTED112.place(k, id, look, t, anim); SCULPTED112.flush(L); return SCULPTED112.read(); };
        const P = PIXELHANDS110.poses('w', 'sword', look), h = P.hands[0], gx = Math.round((0.25 * h.x + 180) * 3.6), gy = Math.round(540 - (0.25 * h.y + 20) * 3.6);
        const diff = (a, b) => { let near = 0, far = 0, all = 0; for (let y = 0; y < a.h; y += 2) for (let x = 0; x < a.w; x += 2) { const q = (y * a.w + x) * 4; if (Math.abs(a.data[q] - b.data[q]) + Math.abs(a.data[q + 1] - b.data[q + 1]) + Math.abs(a.data[q + 2] - b.data[q + 2]) + Math.abs(a.data[q + 3] - b.data[q + 3]) > 24) { all++; if (Math.hypot(x - gx, y - gy) < 36) near++; else if (Math.hypot(x - gx, y - gy) > 110) far++; } } return { near, far, all }; };
        const rest = pic('w', 'sword', null), zero = pic('w', 'sword', { dev: 0, flex: 0 }), cock = pic('w', 'sword', { dev: 13, flex: 0 }), snap = pic('w', 'sword', { dev: -13, flex: 0 }), bend = pic('w', 'sword', { dev: 0, flex: 10 });
        const open = pic('h', 'open', { spread: 2 }), half = pic('h', 'open', { spread: 0 }), part = pic('h', 'open', { spread: 1 });
        // what the game asks for: through a slash, a thrust, a Song
        const A = (u, dir) => { G.attack.dur = 0.4; G.attack.t = 0.4 * (1 - u); G.attack.dirLabel = dir; const o = BODY21.sculptAnim({ side: 'right' }); G.attack.t = 0; return o; };
        const C = (c) => { FPHANDS.st.cast = 0.9 * (1 - c); FPHANDS.st.castDur = 0.9; const o = BODY21.sculptAnim({ side: 'right', pose: 'open' }); FPHANDS.st.cast = 0; return o; };
        const out = { zero: diff(rest, zero), cock: diff(rest, cock), snap: diff(rest, snap), both: diff(cock, snap), bend: diff(rest, bend), half: diff(open, half), part: diff(open, part), halfPart: diff(half, part),
          still: BODY21.sculptAnim({ side: 'right' }), s18: A(0.18, 'slash left'), s60: A(0.6, 'slash left'), s100: A(0.999, 'slash left'), r18: A(0.18, 'slash right'), th: A(0.18, 'thrust'), ch: A(0.18, 'chop down'),
          c05: C(0.05), c18: C(0.18), c50: C(0.5), c92: C(0.92) };
        GFX.sculptedHands = false; return out;
      });
      console.log('  wrist ' + JSON.stringify([r.cock, r.snap, r.bend]) + ' fingers ' + JSON.stringify([r.half, r.part]) + ' asked ' + JSON.stringify([r.s18, r.s60, r.th, r.c05, r.c50]));
      assert.ok(r.zero.all === 0, 'a wrist at rest is the picture as it was ' + JSON.stringify(r.zero));
      for (const k of ['cock', 'snap', 'bend']) assert.ok(r[k].far > 400 && r[k].near < r[k].far * 0.25, k + ': the forearm moves, the hand on the grip all but stays ' + JSON.stringify(r[k]));
      assert.ok(r.both.far > r.cock.far, 'cocked and snapped are further apart than either from rest ' + JSON.stringify(r.both));
      assert.ok(r.half.all > 300 && r.part.all > 100 && r.halfPart.all > 100, 'three stands of the fingers ' + JSON.stringify([r.half, r.part, r.halfPart]));
      assert.ok(r.still.dev === 0 && r.still.flex === 0 && r.s18.dev > 11 && r.s60.dev < -11 && Math.abs(r.s100.dev) < 1 && r.r18.dev < -11 && r.th.dev === 0 && Math.abs(r.th.flex) > 6 && Math.abs(r.ch.flex) > 8, 'a swing: ' + JSON.stringify([r.still, r.s18, r.s60, r.s100, r.r18, r.th, r.ch]));
      assert.ok(r.c05.spread === 0 && r.c18.spread === 1 && r.c50.spread === 2 && r.c92.spread === 1 && Math.abs(r.c50.flex) > 6 && Math.abs(r.c05.flex) < Math.abs(r.c50.flex), 'a Song: ' + JSON.stringify([r.c05, r.c18, r.c50, r.c92]));
    });
    await step('the Options row: "Hands", In pixels / Sculpted, with French; the classic view is not touched', async () => {
      const r = await page.evaluate(() => {
        GFX.sculptedHands = false; renderAccessibilityMenu();
        const b = document.getElementById('gfx-sculpted112'), t0 = b && b.textContent; if (b) b.click(); const t1 = b && document.getElementById('gfx-sculpted112').textContent, on1 = GFX.sculptedHands; if (b) document.getElementById('gfx-sculpted112').click();
        const out = { t0, t1, on1, on2: GFX.sculptedHands, after: !!(b && b.previousElementSibling) }; closeModal();
        // the classic view: with the choice on, the pixel pictures are still drawn there
        R3D.setMode('off'); GFX.sculptedHands = true; BODY21.clearCaches(); const f0 = SCULPTED112.stats.frames;
        for (let i = 0; i < 3; i++) window.advanceTime(1000 / 30);
        out.classic = SCULPTED112.stats.frames - f0; out.classicArms = BODY21.stats.drawn.arms > 0;
        GFX.sculptedHands = false; R3D.setMode('on');
        return out;
      });
      assert.ok(r.t0 === 'In pixels' && r.t1 === 'Sculpted' && r.on1 === true && r.on2 === false && r.classic === 0 && r.classicArms, JSON.stringify(r));
      const fr = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')), flat = JSON.stringify(fr);
      for (const s of ['Sculptées', 'En pixels', 'sculptées et éclairées par le monde']) assert.ok(flat.includes(s), 'French: ' + s);
    });
    await step('nothing here uses Math.random; no page errors', async () => {
      const n = await page.evaluate(() => {
        GFX.sculptedHands = true; SCULPTED112.clear(); const look = GEARLOOK21.of(G.player), a = window.__rand; let hands = 0;
        for (const [k, id] of [['w', 'sword'], ['w', 'spear'], ['h', 'fist'], ['h', 'glassfist'], ['h', 'open']]) { SCULPTED112.begin(); if (SCULPTED112.place(k, id, look, [0.25, 0, 0, 0.25, 180, 20])) hands++; SCULPTED112.flush(BODY21.sculptLight()); }
        const used = window.__rand - a; GFX.sculptedHands = false; return { used, hands };
      });
      assert.ok(n.used === 0 && n.hands === 5, 'posing, building and drawing the hands draws no random number ' + JSON.stringify(n));
      assert.deepStrictEqual(errors, []);
    });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
