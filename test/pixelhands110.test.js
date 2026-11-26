// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4184 node test/pixelhands110.test.js
// Covers js/pixelhands110.js (Phase 110, the pixel-art hands in the game) and the small change in js/fp87.js.
//   - every weapon FP87 paints, and the three hands poses: the pixel picture builds, has FP87's canvas size and fields
//     (k, below, right, center, flip, shift, tip, root, pose), shows hand pixels where the hand grips, is the same on
//     two builds, is pixel art (3 x 3 blocks), never calls Math.random, and a cold build stays under 150 ms
//   - a glove's colours change the hand's pixels; the glass arm is azure; FP87's grip frames are given
//   - the switch off gives FP87's own output exactly (and FP87's default output is not changed by the hand-less option)
//   - the climb's fists; the Options row; Original off and the other presets on; French; no page errors
//   Phase 111 (the touch-ups): the arm runs on past its picture (ext) and reaches the view's edge mid-swing; the arm
//   behind a shield is pixel art, fingers over the rim; a Song's own light in steps, laid over; the glove not blotched,
//   the palm formed. (The 3D view's light on the pixel pictures: test/pixelhands111.test.js.)
'use strict';
const assert = require('node:assert');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4184';
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /pixelhands110|fp87/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.goto(URL + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof PIXELHANDS110 !== 'undefined' && G.state === 'title', null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Hand Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(() => G.state === 'play', null, { timeout: 600000, polling: 500 });
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; PRESETS.apply('medium');
    window.HSH = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13 + d[i + 3] * 17) >>> 0; return h; };
    window.FIELDS = (r) => ['k', 'below', 'right', 'center', 'flip', 'shift', 'pose'].map((k) => k + ':' + r[k]).join(',') + '|' + (r.tip ? r.tip.map((v) => v.toFixed(5)).join(',') : '-') + '|' + (r.root ? r.root.map((v) => v.toFixed(5)).join(',') : '-') + '|' + r.canvas.width + 'x' + r.canvas.height;
  });

  try {
    await step('every weapon and the hands poses: FP87 size and fields, hand pixels at the grip, the same twice, 3 x 3 blocks, fast, no Math.random', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves' }); p.glassed = true;
        const ids = Object.keys(WEAPONS).filter((w) => FP87.covers(w));
        const bad = [], slow = [];
        let rnd = 0; const R0 = Math.random; Math.random = function () { rnd++; return R0(); };
        let maxMs = 0;
        try {
          const one = (name, make, grips) => {
            GFX.pixelHands = false; FP87.cache.clear(); const o = make();
            GFX.pixelHands = true; FP87.cache.clear(); const t0 = performance.now(); const a = make(); const ms1 = performance.now() - t0;
            FP87.cache.clear(); const t1 = performance.now(); const b = make(); const ms2 = performance.now() - t1;
            // two cold builds, the faster counts (another browser job on this 2-core machine can stall either one)
            const ms = Math.min(ms1, ms2); maxMs = Math.max(maxMs, ms); if (ms > 150) slow.push(name + ' ' + ms.toFixed(0));
            if (!o || !a || !b) { bad.push(name + ' missing'); return; }
            if (FIELDS(a) !== FIELDS(o)) bad.push(name + ' fields ' + FIELDS(a) + ' vs ' + FIELDS(o));
            if (!a.pixel) bad.push(name + ' not pixel');
            if (HSH(a.canvas) !== HSH(b.canvas)) bad.push(name + ' differs on a second build');
            if (HSH(a.canvas) === HSH(o.canvas)) bad.push(name + ' same as the old');
            // pixel art: every 3 x 3 block of the picture is one colour
            const d = a.canvas.getContext('2d').getImageData(0, 0, a.canvas.width, a.canvas.height).data, W = a.canvas.width; let blocks = 0, mixed = 0;
            for (let y = 0; y + 3 <= a.canvas.height; y += 3) for (let x = 0; x + 3 <= W; x += 3) { const q = (y * W + x) * 4; if (!d[q + 3]) continue; blocks++; const q2 = ((y + 2) * W + x + 2) * 4; if (d[q] !== d[q2] || d[q + 1] !== d[q2 + 1] || d[q + 2] !== d[q2 + 2] || d[q + 3] !== d[q2 + 3]) mixed++; }
            if (blocks < 2000 || mixed) bad.push(name + ' blocks ' + blocks + ' mixed ' + mixed);
            // a hand where FP87 says it grips: opaque, not the weapon's own colours (skin, glove or glass) within the fist
            for (const g of grips ? (FP87._px110.paint(name, GEARLOOK21.of(p), { noHands: true }).grips || []) : []) {
              const x0 = Math.round(g.m[4]), y0 = Math.round(g.m[5]); let n = 0, op = 0;
              for (let yy = y0 - 30; yy <= y0 + 30; yy += 3) for (let xx = x0 - 30; xx <= x0 + 30; xx += 3) { if (xx < 0 || yy < 0 || xx >= W || yy >= a.canvas.height) continue; n++; if (d[(yy * W + xx) * 4 + 3] === 255) op++; }
              if (op < n * 0.5) bad.push(name + ' no hand at the grip ' + op + '/' + n);
            }
          };
          const look = GEARLOOK21.of(p);
          for (const w of ids) { p.weapons = [w]; p.weapon = 0; one(w, () => FP87.paint(w, GEARLOOK21.of(p)), true); }
          for (const pose of ['fist', 'glassfist', 'open']) one(pose, () => FP87.paintHands(look, pose), false);
        } finally { Math.random = R0; }
        GFX.pixelHands = true;
        return { n: ids.length, bad, slow, rnd, maxMs };
      });
      assert.ok(r.n >= 40, 'weapons ' + r.n);
      assert.ok(!r.bad.length, 'bad: ' + JSON.stringify(r.bad));
      assert.ok(!r.slow.length, 'slow (max ' + r.maxMs.toFixed(0) + ' ms): ' + JSON.stringify(r.slow));
      assert.strictEqual(r.rnd, 0, 'Math.random calls');
    });

    await step('a glove has its own colours and form in the hand; bare skin is warm; the glass arm is azure', async () => {
      const r = await page.evaluate(() => {
        const p = G.player, sums = {};
        const sum = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0, r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 255) continue; n++; r += d[i]; g += d[i + 1]; b += d[i + 2]; } return { n, r: r / n, g: g / n, b: b / n }; };
        p.weapons = ['sword']; p.weapon = 0; p.glassed = false;
        const hs = {};
        for (const h of [null, 'a_gloves', 'a_gauntlets', 'a_p87_reg_cuffs', 'a_p87_bar_bracers', 'a_p87_leg_vambraces', 'a_p87_dro_mittens', 'a_p97_gloves']) { p.armor = Object.assign({}, p.armor, { hands: h }); FP87.cache.clear(); hs[h || 'bare'] = HSH(FP87.paint('sword', GEARLOOK21.of(p)).canvas); }
        p.armor = Object.assign({}, p.armor, { hands: null }); FP87.cache.clear(); sums.fist = sum(FP87.paintHands(GEARLOOK21.of(p), 'fist').canvas);
        p.glassed = true; FP87.cache.clear(); const gl = FP87.paintHands(GEARLOOK21.of(p), 'glassfist'); sums.glass = sum(gl.canvas);
        return { unique: new Set(Object.values(hs)).size, of: Object.keys(hs).length, sums, glassEmis: !!gl.emis };
      });
      assert.strictEqual(r.unique, r.of, JSON.stringify(r));
      assert.ok(r.sums.fist.r > r.sums.fist.b + 20 && r.sums.fist.n > 20000, JSON.stringify(r.sums.fist));
      assert.ok(r.sums.glass.b > r.sums.glass.r + 70 && r.sums.glass.n > 20000 && r.glassEmis, JSON.stringify(r.sums.glass));
    });

    await step('switch off: FP87 own output exactly; the hand-less option leaves the default untouched and gives grip frames', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = true; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves' });
        const out = { same: [], diff: [] };
        const orig = FP87._px110;
        for (const w of ['sword', 'spear', 'p12_greatmaul', 'pistol', 'crossbow', 'p87_hornbow']) {
          p.weapons = [w]; p.weapon = 0; const look = GEARLOOK21.of(p);
          GFX.pixelHands = false; FP87.cache.clear(); const a = FP87.paint(w, look);
          FP87.cache.clear(); orig.paint(w, look, { noHands: true }); const b = orig.paint(w, look);
          FP87.cache.clear(); const c = orig.paint(w, look);
          (a === b || HSH(a.canvas) === HSH(c.canvas) && HSH(b.canvas) === HSH(c.canvas) && FIELDS(a) === FIELDS(c) ? out.same : out.diff).push(w);
        }
        const look = GEARLOOK21.of(p); GFX.pixelHands = false; FP87.cache.clear();
        const f0 = FP87.paintHands(look, 'fist'); FP87.cache.clear(); orig.paintHands(look, 'fist', { noHands: true }); const f1 = orig.paintHands(look, 'fist');
        out.hands = HSH(f0.canvas) === HSH(f1.canvas) && !!f0.emis === !!f1.emis && !f0.pixel;
        FP87.cache.clear(); const nh = orig.paint('spear', look, { noHands: true }), nr = orig.paint('crossbow', look, { noHands: true }), no = orig.paintHands(look, 'open', { noHands: true });
        out.grips = [nh.grips.length, nr.grips.length, no.grips.length].join(',') + ' ' + (nh.grips[1].side === 'left' && nh.grips[1].mirror && nh.grips[0].m.length === 6 && nh.grips[0].arm.length === 4);
        GFX.pixelHands = true; FP87.cache.clear();
        out.on = !!FP87.paint('sword', look).pixel;
        return out;
      });
      assert.deepStrictEqual(r.diff, [], JSON.stringify(r));
      assert.ok(r.hands && r.grips === '2,2,2 true' && r.on, JSON.stringify(r));
    });

    await step('the climb: a pixel fist on the rung, one per hand, the old one when the switch is off', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = true; const look = GEARLOOK21.of(p);
        const L = PIXELHANDS110.climbArt(look, true), R = PIXELHANDS110.climbArt(look, false);
        const c = document.createElement('canvas'); c.width = 320; c.height = 150; const x = c.getContext('2d');
        const okOn = PIXELHANDS110.climbHand(x, 1, 168, 40);
        const d = x.getImageData(150, 20, 70, 60).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 255) n++;
        GFX.pixelHands = false; const okOff = PIXELHANDS110.climbHand(x, 1, 168, 40); GFX.pixelHands = true;
        const sum = (cv) => { const dd = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let b = 0, r = 0, k = 0; for (let i = 0; i < dd.length; i += 4) if (dd[i + 3] === 255) { b += dd[i + 2]; r += dd[i]; k++; } return { b: b / k, r: r / k, k }; };
        return { okOn, okOff, n, L: sum(L.canvas), R: sum(R.canvas) };
      });
      assert.ok(r.okOn === true && r.okOff === false && r.n > 400, JSON.stringify(r));
      assert.ok(r.L.b > r.L.r + 40 && r.R.r > r.R.b, 'the glass left, the right as worn ' + JSON.stringify(r));
    });

    await step('a hand at rest: open and laid flat, its fingers apart; the same pose for the sculpted hands', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = true; const look = GEARLOOK21.of(p), RS = PIXELHANDS110.RS;
        const R = PIXELHANDS110.restArt(look, false), C = PIXELHANDS110.climbArt(look, false);
        // the most separate fingers any one row of the picture crosses: an open hand's fingers stand apart, a fist's do not
        const fingers = (cv, y0, y1) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let best = 0; for (let y = y0 * 4; y < y1 * 4; y++) { let runs = 0, inRun = false; for (let x = 0; x < cv.width; x++) { const o = d[(y * cv.width + x) * 4 + 3] === 255; if (o && !inRun) runs++; inRun = o; } best = Math.max(best, runs); } return best; };
        const c = document.createElement('canvas'); c.width = 320; c.height = 150; const x = c.getContext('2d');
        const okOn = PIXELHANDS110.restHand(x, 1, 160, 120);
        const d = x.getImageData(120, 80, 80, 70).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] === 255) n++;
        GFX.pixelHands = false; const okOff = PIXELHANDS110.restHand(x, 1, 160, 120); GFX.pixelHands = true;
        const P = PIXELHANDS110.poses('r', 'R', look);
        return { size: R.canvas.width + 'x' + R.canvas.height, want: RS.w * 4 + 'x' + RS.h * 4, fRest: fingers(R.canvas, 0, RS.py), fFist: fingers(C.canvas, 0, 40), okOn, okOff, n, pose: P && P.hands.length === 1 ? P.hands[0].curl + (P.hands[0].left ? ' L' : ' R') : String(P && P.hands.length) };
      });
      assert.ok(r.size === r.want && r.okOn === true && r.okOff === false && r.n > 400, JSON.stringify(r));
      assert.ok(r.fRest >= 4 && r.fFist <= 2, 'the open hand\'s fingers stand apart, the fist\'s do not ' + JSON.stringify(r));
      assert.ok(r.pose === 'open R', 'the sculpted hands are given the same open hand ' + JSON.stringify(r));
    });

    await step('Options row; Original off, every other preset on; a change rebuilds the pictures', async () => {
      const r = await page.evaluate(() => {
        PRESETS.apply('medium');
        renderAccessibilityMenu();
        const b = document.getElementById('gfx-pixelhands110'); const row = !!b, label = b ? b.previousElementSibling && b.previousElementSibling.textContent : '';
        const p = G.player; p.weapons = ['sword']; p.weapon = 0; const look = GEARLOOK21.of(p);
        const b1 = BODY21.build(WEAPONS.sword.img, look, 'sword', 'right'); const px1 = b1 && b1.main && BODY21.owned(b1.main) && FP87.paint('sword', look).canvas === b1.main;
        if (b) b.click(); const viaRow = GFX.pixelHands === false;
        const b2 = BODY21.build(WEAPONS.sword.img, look, 'sword', 'right'); const old2 = !!b2 && b2.main !== b1.main && !FP87.paint('sword', look).pixel;
        if (b) b.click(); const back = GFX.pixelHands === true; closeModal();
        const pre = {}; for (const pr of ['original', 'low', 'medium', 'high', 'ultra', 'cinematic']) { PRESETS.apply(pr); pre[pr] = GFX.pixelHands; }
        PRESETS.apply('medium');
        return { row, label, px1, viaRow, old2, back, pre, fx: GFX.FX.includes('pixelHands') };
      });
      assert.ok(r.row && /Pixel hands/.test(r.label) && r.viaRow && r.old2 && r.back && r.fx, JSON.stringify(r));
      assert.ok(r.pre.original === false && ['low', 'medium', 'high', 'ultra', 'cinematic'].every((p) => r.pre[p] === true), JSON.stringify(r));
    });

    await step('French for the new lines', async () => {
      const r = await page.evaluate(async () => {
        const fr = await (await fetch('locales/story/fr.json')).text();
        return { a: fr.includes('Mains en pixel art'), b: fr.includes('vos mains, vos bras et vos armes dessinés en pixel art') };
      });
      assert.ok(r.a && r.b, JSON.stringify(r));
    });

    await step('in play: the HUD draws the pixel pictures, and the game is the same with the switch off', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.weapons = ['sword']; p.weapon = 0; closeModal(); G.state = 'play';
        Engine.render = () => { Engine.ctx.fillStyle = '#334455'; Engine.ctx.fillRect(0, 0, VW, VIEW_H); };
        if (typeof FPHANDS !== 'undefined') { FPHANDS.st.lower = 0; FPHANDS.st.shown = 'sword'; }
        for (let i = 0; i < 20; i++) update(0.05);
        const grab = () => { render(); const d = Engine.ctx.getImageData(0, 0, Engine.canvas.width, Engine.canvas.height).data; let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; return h; };
        const pn = performance.now; performance.now = () => 5000;   // the idle sway follows the clock: hold it
        let a, b, c, arms;
        try { a = grab(); arms = BODY21.stats.drawn.arms; PIXELHANDS110.setOn(false); b = grab(); PIXELHANDS110.setOn(true); c = grab(); } finally { performance.now = pn; }
        return { differ: a !== b, again: a === c, arms: arms > 0 };
      });
      assert.ok(r.differ && r.again && r.arms, JSON.stringify(r));
    });

    // ---------------------------------------------------------------- Phase 111: the touch-ups
    await step('P111 the arm runs on past its picture: an ext for every weapon and pose, drawn through a swing to the edge of the view', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = true; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: null }); closeModal(); G.state = 'play';
        const out = { bad: [] };
        const far = (e, w, h) => { const d = e.canvas.getContext('2d').getImageData(0, 0, e.canvas.width, e.canvas.height).data; let n = 0; for (let y = 0; y < e.canvas.height; y += 3) for (let x = 0; x < e.canvas.width; x += 3) { const X = x + e.ox, Y = y + e.oy; if ((X < 0 || X >= w || Y >= h) && d[(y * e.canvas.width + x) * 4 + 3] === 255) n++; } return n; };
        for (const w of ['sword', 'spear', 'p12_greatmaul', 'pistol']) { p.weapons = [w]; p.weapon = 0; FP87.cache.clear(); const a = FP87.paint(w, GEARLOOK21.of(p)); if (!a.ext || !a.ext.canvas || a.ext.ox > 0 || a.ext.w <= a.canvas.width || far(a.ext, a.canvas.width, a.canvas.height) < 300) out.bad.push(w); }
        const look = GEARLOOK21.of(p);
        for (const pose of ['fist', 'glassfist', 'open']) { const a = FP87.paintHands(look, pose); if (!a.ext || far(a.ext, a.canvas.width, a.canvas.height) < 300) out.bad.push(pose); }
        p.weapons = ['sword']; p.weapon = 0;
        const b = BODY21.build(WEAPONS.sword.img, GEARLOOK21.of(p), 'sword', 'right'); out.build = !!(b && b.ext && b.pixel);
        // mid-swing, on a flat ground: the arm reaches the right edge of the view (it used to end in the air)
        Engine.render = () => { Engine.ctx.fillStyle = '#334455'; Engine.ctx.fillRect(0, 0, VW, VIEW_H); };
        if (typeof FPHANDS !== 'undefined') { FPHANDS.st.lower = 0; FPHANDS.st.shown = 'sword'; }
        const edge = (on) => {
          PIXELHANDS110.setOn(on); G.attack.dur = 0.4; G.attack.t = 0.4 * 0.52; G.attack.dirLabel = 'slash left'; render();
          const k = Engine.canvas.width / VW, d = Engine.ctx.getImageData(Engine.canvas.width - 1, 0, 1, Math.round(VIEW_H * k)).data; let n = 0;
          for (let i = 0; i < d.length; i += 4) if (!(d[i] === 0x33 && d[i + 1] === 0x44 && d[i + 2] === 0x55)) n++;
          return n / k;
        };
        out.edge = edge(true); G.attack.t = 0; PIXELHANDS110.setOn(true);
        return out;
      });
      assert.deepStrictEqual(r.bad, [], JSON.stringify(r));
      assert.ok(r.build && r.edge >= 8, JSON.stringify(r));
    });

    await step('P111 the arm behind a shield is pixel art: the arm under it, the hooked fingers over its rim; glass on the left; off with the switch', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.weapons = ['sword']; p.weapon = 0; closeModal(); G.state = 'play';
        const blocks = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, W = cv.width; let n = 0, mixed = 0, top = 1e9, bot = 0, b = 0, r = 0; for (let y = 0; y + 3 <= cv.height; y += 3) for (let x = 0; x + 3 <= W; x += 3) { const q = (y * W + x) * 4; if (d[q + 3] !== 255) continue; n++; top = Math.min(top, y); bot = Math.max(bot, y); r += d[q]; b += d[q + 2]; const q2 = ((y + 2) * W + x + 2) * 4; if (d[q] !== d[q2] || d[q + 1] !== d[q2 + 1] || d[q + 2] !== d[q2 + 2]) mixed++; } return { n, mixed, top, bot, r: r / n, b: b / n }; };
        const out = {};
        p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: 'a_buckler' });
        p.glassed = true; FP87.cache.clear(); const g = PIXELHANDS110.offArm(GEARLOOK21.of(p));
        out.glass = blocks(g.canvas); out.glassF = blocks(g.fingers); out.h = g.canvas.height; out.same = g === PIXELHANDS110.offArm(GEARLOOK21.of(p));
        p.glassed = false; FP87.cache.clear(); const w = PIXELHANDS110.offArm(GEARLOOK21.of(p)); out.worn = blocks(w.canvas); out.wornF = blocks(w.fingers);
        // in play: the shield is drawn with the pixel arm (the fingers after the shield's face), and with the switch off the old arm
        Engine.render = () => { Engine.ctx.fillStyle = '#334455'; Engine.ctx.fillRect(0, 0, VW, VIEW_H); };
        if (typeof FPHANDS !== 'undefined') { FPHANDS.st.lower = 0; FPHANDS.st.shown = 'sword'; }
        const pn = performance.now; performance.now = () => 5000; const l0 = BODY21.set.light; BODY21.setSwitch('light', false);   // (the body's light makes tinted copies of each picture: off, the pictures themselves are drawn)
        try {
          const seen = []; const dI = CanvasRenderingContext2D.prototype.drawImage;
          CanvasRenderingContext2D.prototype.drawImage = function (img) { if (this === Engine.ctx && img && (img === w.canvas || img === w.fingers)) seen.push(img === w.fingers ? 'f' : 'a'); return dI.apply(this, arguments); };
          const n0 = BODY21.stats.drawn.shield;
          try { render(); } finally { CanvasRenderingContext2D.prototype.drawImage = dI; }
          out.seen = seen.join(''); out.shield = BODY21.stats.drawn.shield - n0;
          const grab = () => { render(); const d = Engine.ctx.getImageData(0, 0, Engine.canvas.width, Engine.canvas.height).data; let h = 0; for (let i = 0; i < d.length; i += 4) h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; return h; };
          const a = grab(); PIXELHANDS110.setOn(false); out.offNull = PIXELHANDS110.offArm(GEARLOOK21.of(p)) === null; const b = grab(); PIXELHANDS110.setOn(true); const c = grab();
          out.differ = a !== b; out.again = a === c;
        } finally { performance.now = pn; BODY21.setSwitch('light', l0); }
        p.armor = Object.assign({}, p.armor, { shield: null }); p.glassed = true;
        return out;
      });
      assert.ok(r.glass.n > 1500 && !r.glass.mixed && !r.glassF.mixed && !r.worn.mixed && !r.wornF.mixed && r.same, JSON.stringify(r));
      assert.ok(r.glass.b > r.glass.r + 70 && r.glassF.b > r.glassF.r + 70 && r.worn.r > r.worn.b, 'glass on the left ' + JSON.stringify(r));
      assert.ok(r.glassF.n > 60 && r.glassF.n < r.glass.n * 0.25 && r.glassF.bot < r.h * 0.3 && r.glass.bot > r.h * 0.9, 'fingers at the rim, the arm out of the bottom ' + JSON.stringify(r));
      assert.ok(r.seen === 'af' && r.shield === 1 && r.offNull && r.differ && r.again, JSON.stringify(r));
    });

    await step('P111 a Song lights the pixel hands with a light of their own: in steps, on what faces it, laid over and not added', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = true; p.weapons = ['hands']; p.weapon = 0; p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: null }); closeModal(); G.state = 'play';
        FP87.cache.clear(); BODY21.clearCaches();
        const look = GEARLOOK21.of(p), a = FP87.paintHands(look, 'open'), out = {};
        const d = a.song.getContext('2d').getImageData(0, 0, a.song.width, a.song.height).data, h = a.canvas.getContext('2d').getImageData(0, 0, a.canvas.width, a.canvas.height).data;
        const steps = new Set(); let lit = 0, hands = 0, stray = 0, inner = 0, outer = 0; const W = a.canvas.width;
        for (let i = 0; i < d.length; i += 4) { if (h[i + 3] === 255) hands++; if (!d[i + 3]) continue; steps.add(d[i + 3]); lit++; if (h[i + 3] !== 255) stray++; const x = (i / 4) % W; if (Math.abs(x - W / 2) < W * 0.3) inner++; else outer++; }
        out.steps = [...steps].sort((x, y) => x - y); out.share = lit / hands; out.stray = stray; out.inner = inner / lit;
        const c1 = PIXELHANDS110.songCanvas(a.song, [226, 196, 64]), c2 = PIXELHANDS110.songCanvas(a.song, [96, 214, 112]);
        const mean = (cv) => { const q = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let r = 0, g = 0, b = 0, n = 0; for (let i = 0; i < q.length; i += 4) if (q[i + 3]) { r += q[i]; g += q[i + 1]; b += q[i + 2]; n++; } return [r / n, g / n, b / n]; };
        out.gold = mean(c1); out.green = mean(c2); out.cached = c1 === PIXELHANDS110.songCanvas(a.song, [226, 196, 64]);
        out.fist = !FP87.paintHands(look, 'fist').song;
        // in play: the light is drawn over the hands (source-over), the old whole-picture tint (lighter) is not
        Engine.render = () => { Engine.ctx.fillStyle = '#334455'; Engine.ctx.fillRect(0, 0, VW, VIEW_H); };
        const calls = (on) => {
          PIXELHANDS110.setOn(on);
          G.song.t = 0.35; FPHANDS.st.cast = 0.6; FPHANDS.st.castDur = 0.9; FPHANDS.st.castCol = [226, 196, 64]; FPHANDS.st.castPower = 0.8; FPHANDS.st.lower = 0; FPHANDS.st.shown = 'hands';
          const seen = []; const dI = CanvasRenderingContext2D.prototype.drawImage;
          CanvasRenderingContext2D.prototype.drawImage = function (img) { if (this === Engine.ctx && img && img.width > 200) seen.push((img.__px111song ? 'S' : 'x') + ':' + this.globalCompositeOperation); return dI.apply(this, arguments); };
          try { render(); } finally { CanvasRenderingContext2D.prototype.drawImage = dI; }
          return seen;
        };
        const on = calls(true), off = calls(false); PIXELHANDS110.setOn(true); G.song.t = 0; FPHANDS.st.cast = 0;
        out.on = on.filter((s) => s === 'S:source-over').length + '/' + on.filter((s) => s === 'x:lighter').length;
        out.off = off.filter((s) => s[0] === 'S').length + '/' + off.filter((s) => s === 'x:lighter').length;
        p.weapons = ['sword'];
        return out;
      });
      assert.ok(r.steps.length === 3 && r.share > 0.04 && r.share < 0.4 && r.stray === 0 && r.inner > 0.8, 'steps, on what faces the light ' + JSON.stringify(r));
      assert.ok(r.gold[0] > r.gold[2] + 40 && r.green[1] > r.green[0] + 30 && r.cached && r.fist, JSON.stringify(r));
      assert.ok(r.on === '1/0' && r.off === '0/1', 'laid over, not added ' + JSON.stringify(r));
    });

    await step('P111 the glove is not blotched, a cloth sleeve has drawn folds, the bare palm has its pads and creases', async () => {
      const r = await page.evaluate(() => {
        const p = G.player; p.glassed = false; p.weapons = ['hands']; p.weapon = 0; FP87.cache.clear();
        const tones = (cv, y0, y1) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data, W = cv.width, m = new Map(); let n = 0; for (let y = Math.floor(cv.height * y0); y < cv.height * y1; y += 3) for (let x = 0; x < W; x += 3) { const q = (y * W + x) * 4; if (d[q + 3] !== 255) continue; n++; const k = d[q] << 16 | d[q + 1] << 8 | d[q + 2]; m.set(k, (m.get(k) || 0) + 1); } return { n, m }; };
        const out = {};
        // leather: its lighter tone lay on the back of the gripping hand and the wrist in blots (17% of the warm pixels
        // of the sword's picture); it is now only where the leather faces the light squarely (8%). The tone is read by
        // its brightness (105 to 122), which also takes in a shadow tone of the bare forearm (5% either way)
        p.armor = Object.assign({}, p.armor, { hands: 'a_gloves', shield: null }); p.weapons = ['sword'];
        const lum = (k) => ((k >> 16) * 0.3 + ((k >> 8) & 255) * 0.55 + (k & 255) * 0.15);
        const g = tones(FP87.paint('sword', GEARLOOK21.of(p)).canvas, 0, 1); let warm = 0, lightTone = 0;
        for (const [k, v] of g.m) { const r = k >> 16, gg = (k >> 8) & 255, bb = k & 255; if (!(r > bb + 30 && r < 215 && gg < 150 && gg > bb)) continue; warm += v; const l = lum(k); if (l >= 105 && l <= 122) lightTone += v; }
        out.light = lightTone / warm; p.weapons = ['hands'];
        // bare: the palm half of the fist has more than four tones of skin, and creases (the darker tones among the light)
        p.armor = Object.assign({}, p.armor, { hands: null }); FP87.cache.clear();
        const b = tones(FP87.paintHands(GEARLOOK21.of(p), 'fist').canvas, 0.3, 0.62);
        out.skinTones = [...b.m.entries()].filter(([k, v]) => v >= 12 && (k >> 16) > (k & 255) + 20).length;
        p.glassed = true; p.weapons = ['sword'];
        return out;
      });
      console.log('  glove and palm ' + JSON.stringify(r));
      assert.ok(r.light < 0.18 && r.light > 0.03 && r.skinTones >= 6, JSON.stringify(r));
    });

    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
