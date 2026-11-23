// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4176 node test/hands122.test.js
// Phase 122 (the sculpted hands finished, and the default): js/sculpted112.js. Run alone (it draws in WebGL).
//   - the default: a fresh profile in the 3D view sees the sculpted hands (Medium, the automation boot); the switch is on in
//     every preset above Low and off in Original and Low (it is in Low's list); the classic view keeps the pixel hands
//   - a player's own stored choice of the pixel hands is kept across a launch
//   - the bare fist is finished: more darker crease pixels across its knuckles and joints, and more paler nail pixels,
//     than Phase 112's fist (its figures, measured on the same picture, are written below)
//   - the sleeve in a climb is no wider on screen than the pixel arm's sleeve at the same moment, give or take a tenth,
//     and the fist is still round the rung
//   - when the hands' own WebGL canvas cannot be made, or its context is lost, the pixel hands are drawn, silently
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
// Phase 112's bare fist, measured by FIST() below on its own code (commit 635bb438), in three skin tones (faces 1, 2 and
// 5): darker-than-around and paler-than-around pixels on the fist, away from its outline
const P112 = { 1: { dark: 1566, pale: 1948 }, 2: { dark: 1680, pale: 2059 }, 5: { dark: 1542, pale: 1895 } };
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const open = async (init) => {
    const page = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
    page.setDefaultTimeout(900000);
    const errors = [];
    page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
    page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /sculpted112|pixelhands110|fp87|body21/.test(m.text()))) errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
    if (init) await page.addInitScript(init);
    await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof SCULPTED112 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
    return { page, errors };
  };
  const play = async (page) => {
    const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
    await hit('#btn-new'); await page.locator('#cname').fill('Hand Tester'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
    await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      GFX.illustratedScreens = false; if (R3D.setMode) R3D.setMode('on');
      window.requestAnimationFrame = () => 0;
      // stand in Oakhaven's street by day; draw one frame; say how the hands were drawn (pixel pictures, the sculpted canvas)
      // o.on: true / false sets the switch; left out, the switch is as the game has it
      window.SHOT = (o) => {
        closeModal(); hide('#event'); loadMap('oakhaven', { x: 22.5, y: 30.5, dir: -Math.PI / 2 });
        G.state = 'play'; G.tod = 0.45; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear');
        UPG.tutorial = false; G.player.hp = G.player.hpMax = 999; G.noise = 0; Engine.cam.pitch = 0; G.player.pitch = 0;
        for (const e of G.ents) if (e.kind === 'enemy') e.state = 'idle';
        const p = G.player, w = o.w || 'sword'; p.glassed = true; p.weapons = [w]; p.weapon = 0; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: null });
        G.glassLock = 0; G.attack.t = 0; G.song.t = 0; G.songFx = 0; FPHANDS.st.shown = w; FPHANDS.st.lower = 0; FPHANDS.st.cast = 0; FPHANDS.st.climb = 0;
        if (o.on !== undefined) GFX.sculptedHands = !!o.on; BODY21.clearCaches();
        for (let i = 0; i < 6; i++) window.advanceTime(1000 / 30);
        const pn = performance.now; performance.now = () => 5000;
        const upd = update; update = function () {}; BODY21.R3B.check = true; const s0 = Object.assign({}, SCULPTED112.stats);
        try { window.advanceTime(16); window.advanceTime(1); } finally { update = upd; performance.now = pn; }
        const list = (BODY21.R3B.last && BODY21.R3B.last.list) || [], gl = SCULPTED112._gl(), cv = gl && gl.cv;
        return { flag: GFX.sculptedHands, r3d: !!(R3D.shown && R3D.shown()), pix: list.filter((it) => it.pix).length, live: list.filter((it) => it.over > 0 && cv && it.img === cv).length, frames: SCULPTED112.stats.frames - s0.frames, hands: SCULPTED112.stats.hands - s0.hands, glErr: BODY21.R3B.glErr };
      };
      // the bare fist alone, large (a centimetre of hand is 36 canvas pixels), in a fixed light: on the fist, how many pixels
      // are darker than the 9 x 9 around them (by 14 or more: a crease, a fold) and how many paler (a nail's plate, its lit edge)
      window.FIST = (skin) => {
        const p = G.player; p.armor = Object.assign({}, p.armor, { hands: null }); if (skin) p.face = skin;
        const look = GEARLOOK21.of(p), P = PIXELHANDS110.poses('h', 'fist', look), h = P.hands[0], a = 10 / h.cm;
        const was = GFX.sculptedHands; GFX.sculptedHands = true;
        const t = [a, 0, 0, a, 160 - a * h.x, 75 - a * h.y];
        SCULPTED112.begin(); SCULPTED112.place('h', 'fist', look, t); SCULPTED112.flush(null);
        const px = SCULPTED112.read(); GFX.sculptedHands = was;
        const W = px.w, H = px.h, d = px.data, L = new Float32Array(W * H), A = new Uint8Array(W * H);
        for (let i = 0; i < W * H; i++) { A[i] = d[i * 4 + 3] > 230 ? 1 : 0; L[i] = d[i * 4] * 0.3 + d[i * 4 + 1] * 0.55 + d[i * 4 + 2] * 0.15; }
        let dark = 0, pale = 0, n = 0;
        for (let y = 5; y < H - 5; y++) for (let x = 5; x < W - 5; x++) {
          const i = y * W + x; if (!A[i]) continue;
          let s = 0, c = 0, all = true;
          for (let v = -4; v <= 4; v++) for (let u = -4; u <= 4; u++) { const j = i + v * W + u; if (!A[j]) { all = false; break; } s += L[j]; c++; }
          if (!all) continue;   // (away from the outline: the silhouette's own edge is not a crease)
          n++; const m = s / c;
          if (L[i] < m - 14) dark++; else if (L[i] > m + 14) pale++;
        }
        // the skin's mean colour (warm pixels) here, and on the pixel hands' own fist for the same look
        const warm = (r, g, b) => r > g + 18 && g > b - 4 && r > 60, lum = (c) => c[0] * 0.3 + c[1] * 0.55 + c[2] * 0.15;
        let s = [0, 0, 0, 0]; for (let i = 0; i < W * H; i++) if (A[i] && warm(d[i * 4], d[i * 4 + 1], d[i * 4 + 2])) { s[0] += d[i * 4]; s[1] += d[i * 4 + 1]; s[2] += d[i * 4 + 2]; s[3]++; }
        const was2 = GFX.pixelHands; GFX.pixelHands = true; FP87.cache.clear(); const pc = FP87.paintHands(look, 'fist'); GFX.pixelHands = was2; FP87.cache.clear();
        const c2 = pc.canvas || pc, q = c2.getContext('2d').getImageData(0, 0, c2.width, c2.height).data; let tt = [0, 0, 0, 0];
        for (let i = 0; i < q.length; i += 4) if (q[i + 3] > 250 && warm(q[i], q[i + 1], q[i + 2])) { tt[0] += q[i]; tt[1] += q[i + 1]; tt[2] += q[i + 2]; tt[3]++; }
        const scm = s.slice(0, 3).map((v) => v / s[3]), pxm = tt.slice(0, 3).map((v) => v / tt[3]);
        return { dark, pale, n, sc: Math.round(lum(scm)), px: Math.round(lum(pxm)) };
      };
      // the sleeve in a climb, right arm: the widest the arm is (view pixels) in the rows 40 to 120 view pixels below the rung,
      // as the pixel hands paint it and as the sculpted hands draw it at the same place; and whether the rung is in the fist
      window.CLIMB = (bare) => {
        const p = G.player; p.armor = Object.assign({}, p.armor, { hands: bare ? null : 'a_gloves' });
        const look = GEARLOOK21.of(p), CL = PIXELHANDS110.CL;
        const pic = PIXELHANDS110.climbArt(look, false).canvas, pc = pic.getContext('2d').getImageData(0, 0, pic.width, pic.height).data;
        const rows = []; for (let k = 40; k <= 120; k += 4) rows.push(k);
        let pxW = 0; for (const k of rows) { const y = (CL.gy + k) * 4; if (y >= pic.height) continue; let n = 0; for (let x = 0; x < pic.width; x++) if (pc[(y * pic.width + x) * 4 + 3] > 128) n++; pxW = Math.max(pxW, n / 4); }
        const was = GFX.sculptedHands; GFX.sculptedHands = true;
        const ex = 160 - CL.gx, ey = 0;
        SCULPTED112.begin(); SCULPTED112.place('c', 'R', look, [0.25, 0, 0, 0.25, ex, ey]); SCULPTED112.flush(null);
        const px = SCULPTED112.read(); GFX.sculptedHands = was;
        const k3 = px.w / 320; let scW = 0;
        for (const k of rows) { const y = Math.round((CL.gy + k) * k3); if (y >= px.h) continue; const r = px.h - 1 - y; let n = 0; for (let x = 0; x < px.w; x++) if (px.data[(r * px.w + x) * 4 + 3] > 128) n++; scW = Math.max(scW, n / k3); }
        // the rung's place in the fist (view 160, 18): covered
        const gy = px.h - 1 - Math.round(CL.gy * k3), gx = Math.round(160 * k3); let grip = 0; for (let v = -6; v <= 6; v += 3) for (let u = -6; u <= 6; u += 3) if (px.data[((gy + v) * px.w + gx + u) * 4 + 3] > 200) grip++;
        return { pxW: +pxW.toFixed(1), scW: +scW.toFixed(1), ratio: +(scW / pxW).toFixed(3), grip };
      };
    });
  };

  try {
    // ---------------------------------------------------------------- a fresh profile
    const A = await open(null);
    const boot = await A.page.evaluate(() => ({ flag: GFX.sculptedHands, preset: GFX.preset, fx: GFX.FX.includes('sculptedHands'), stored: localStorage.getItem('octave.switch.sculptedHands') }));
    await play(A.page);
    await step('a fresh profile: the sculpted hands are on at boot (Medium) and drawn in the 3D view', async () => {
      const r = await A.page.evaluate(() => SHOT({}));
      console.log('  boot ' + JSON.stringify(boot) + ' first view ' + JSON.stringify(r));
      assert.ok(boot.flag === true && boot.preset === 'medium' && boot.fx && boot.stored === null, JSON.stringify(boot));
      assert.ok(r.flag === true && r.r3d && r.pix === 0 && r.live === 1 && r.hands >= 2 && r.glErr === 0, JSON.stringify(r));
    });
    await step('on in every preset above Low, off in Original and Low (Low\'s list); the classic view keeps the pixel hands', async () => {
      const r = await A.page.evaluate(() => {
        const pre = {}; for (const p of PRESETS.order) { PRESETS.apply(p); pre[p] = GFX.sculptedHands; }
        PRESETS.apply('low'); const low = SHOT({}); PRESETS.apply('original'); const orig = SHOT({}); PRESETS.apply('medium');
        R3D.setMode('off'); GFX.sculptedHands = true; BODY21.clearCaches(); const f0 = SCULPTED112.stats.frames; for (let i = 0; i < 3; i++) window.advanceTime(1000 / 30);
        const classic = { frames: SCULPTED112.stats.frames - f0, arms: BODY21.stats.drawn.arms > 0 }; R3D.setMode('on');
        return { pre, low: [low.flag, low.pix, low.live], orig: [orig.flag, orig.live], classic };
      });
      console.log('  ' + JSON.stringify(r));
      assert.deepStrictEqual(r.pre, { original: false, low: false, medium: true, high: true, ultra: true, cinematic: true });
      assert.ok(r.low[0] === false && r.low[1] >= 2 && r.low[2] === 0 && r.orig[0] === false && r.orig[1] === 0, 'Low and Original draw the pixel hands ' + JSON.stringify(r));
      assert.ok(r.classic.frames === 0 && r.classic.arms, 'the classic view ' + JSON.stringify(r.classic));
    });
    await step('the bare fist: creases across the knuckles and joints, and nails that read as nails (against Phase 112\'s figures)', async () => {
      const r = await A.page.evaluate(() => ({ f1: FIST(1), f2: FIST(2), f5: FIST(5) }));
      console.log('  fist ' + JSON.stringify(r) + ' Phase 112 ' + JSON.stringify(P112));
      assert.ok(r.f1.n > 20000, 'the fist is drawn large ' + JSON.stringify(r.f1));
      for (const f of [1, 2, 5]) {
        const m = r['f' + f], b = P112[f];
        assert.ok(m.dark >= b.dark * 1.4, 'face ' + f + ': darker crease pixels ' + m.dark + ' against Phase 112\'s ' + b.dark);
        assert.ok(m.pale >= b.pale * 1.15, 'face ' + f + ': paler nail pixels ' + m.pale + ' against Phase 112\'s ' + b.pale);
      }
    });
    await step('the sculpted skin takes the chosen face\'s tone as the pixel hand does (three tones)', async () => {
      const r = await A.page.evaluate(() => ({ f4: FIST(4), f1: FIST(1), f5: FIST(5) }));
      console.log('  skin (sculpted, pixel) ' + JSON.stringify([[r.f4.sc, r.f4.px], [r.f1.sc, r.f1.px], [r.f5.sc, r.f5.px]]));
      assert.ok(r.f4.px > r.f1.px && r.f1.px > r.f5.px, 'the pixel hand\'s tones ' + JSON.stringify(r));
      assert.ok(r.f4.sc > r.f1.sc && r.f1.sc > r.f5.sc, 'the sculpted tones follow in the same order ' + JSON.stringify(r));
      assert.ok((r.f4.sc - r.f5.sc) >= 0.6 * (r.f4.px - r.f5.px), 'and as far apart (at least 0.6 of the pixel hand\'s spread) ' + JSON.stringify(r));
    });
    await step('the sleeve in a climb: no wider than the pixel arm\'s sleeve, give or take a tenth; the fist round the rung', async () => {
      const r = await A.page.evaluate(() => ({ gloved: CLIMB(false), bare: CLIMB(true) }));
      console.log('  climb ' + JSON.stringify(r));
      for (const k of ['gloved', 'bare']) assert.ok(r[k].ratio >= 0.9 && r[k].ratio <= 1.1 && r[k].grip >= 20, k + ' ' + JSON.stringify(r[k]));
    });
    await step('the context lost: the pixel hands are drawn, silently; restored, the sculpted hands again', async () => {
      const r = await A.page.evaluate(async () => {
        const before = SHOT({ on: true }), gl = SCULPTED112._gl().gl, ext = gl.getExtension('WEBGL_lose_context');
        ext.loseContext(); await new Promise((res) => setTimeout(res, 50));
        const lost = SHOT({ on: true });
        ext.restoreContext(); await new Promise((res) => setTimeout(res, 50));
        const back = SHOT({ on: true });
        return { before: [before.pix, before.live], lost: [lost.flag, lost.pix, lost.live, lost.glErr], back: [back.pix, back.live, back.hands] };
      });
      console.log('  ' + JSON.stringify(r));
      assert.ok(r.before[0] === 0 && r.before[1] === 1, 'sculpted before ' + JSON.stringify(r));
      assert.ok(r.lost[0] === true && r.lost[1] >= 2 && r.lost[2] === 0 && r.lost[3] === 0, 'lost: the pixel hands, the choice kept ' + JSON.stringify(r));
      assert.ok(r.back[0] === 0 && r.back[1] === 1 && r.back[2] >= 2, 'restored ' + JSON.stringify(r));
    });
    await step('no page errors, no warnings from the hands', async () => { assert.deepStrictEqual(A.errors, []); });

    // ---------------------------------------------------------------- no WebGL for the hands' own canvas
    const B = await open(() => {
      const gc = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function (type) { if (/webgl/.test(String(type)) && this.width === 1152 && this.height === 540) return null; return gc.apply(this, arguments); };
    });
    await play(B.page);
    await step('the hands\' canvas cannot be made: the pixel hands are drawn, silently, and the choice is kept', async () => {
      const r = await B.page.evaluate(() => { const a = SHOT({}), b = SHOT({ w: 'hands' }); return { a, b, gl: !!SCULPTED112._gl() }; });
      console.log('  ' + JSON.stringify(r));
      for (const k of ['a', 'b']) assert.ok(r[k].flag === true && r[k].r3d && r[k].pix >= 2 && r[k].live === 0 && r[k].frames === 0 && r[k].glErr === 0, k + ' ' + JSON.stringify(r[k]));
      assert.deepStrictEqual(B.errors, []);
    });

    // ---------------------------------------------------------------- a returning player who chose the pixel hands
    const C = await open(() => { try { if (!sessionStorage.getItem('p122')) { localStorage.setItem('octave.switch.sculptedHands', 'false'); sessionStorage.setItem('p122', '1'); } } catch (e) { /* none */ } });
    await step('a player\'s stored choice of the pixel hands is kept across a launch', async () => {
      const r = await C.page.evaluate(() => ({ flag: GFX.sculptedHands, preset: GFX.preset }));
      await C.page.reload(); await C.page.waitForFunction(() => typeof SCULPTED112 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000 });
      const r2 = await C.page.evaluate(() => ({ flag: GFX.sculptedHands, stored: localStorage.getItem('octave.switch.sculptedHands') }));
      assert.ok(r.flag === false && r2.flag === false && r2.stored === 'false', JSON.stringify([r, r2]));
      assert.deepStrictEqual(C.errors, []);
    });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
