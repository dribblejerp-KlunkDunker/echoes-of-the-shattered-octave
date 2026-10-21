// PREVIEW_URL=http://127.0.0.1:4104 PLAYWRIGHT_MODULE=/path/to/playwright node test/body21.test.js
// Phase 21 BODY: the shared gear table (js/gearlook21.js) covers every piece; every armour, glove, boot, helm, weapon and
// shield changes what the player sees of themselves; arms, shield, legs and headwear are drawn in play; combat timing is
// unchanged (a seeded fight trace, drawn every step, matches a page with the module blocked); the Original preset and
// the switch off give the original frame; hostile saves cannot break it; frame cost; Options rows; no page errors.
// Uses the managed preview; never starts a server.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = (process.env.PREVIEW_URL || 'http://127.0.0.1:3000') + '/?nosw=1';
let passed = 0;
async function step(name, fn) { await fn(); passed++; console.log('PASS ' + name); }

async function boot(ctx, opts) {
  opts = opts || {};
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => {
    const t = m.text();
    if (m.type() === 'error' && !(opts.block && /ERR_FAILED|body21|gearlook21/.test(t))) errors.push('console: ' + t);
    if (m.type() === 'warning' && /body21|gearlook21/.test(t)) errors.push('console: ' + t);
  });
  if (opts.r3d) await page.addInitScript(() => { window.__r3d21 = { automation: true }; });
  if (opts.block) await page.route(/js\/(body21|gearlook21)\.js/, (r) => r.abort());
  await page.addInitScript(() => { let s = 424242; Math.random = () => (s = (s * 16807) % 2147483647) / 2147483647; });
  await page.goto(URL_);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 120000 });
  await page.evaluate(() => { GFX.illustratedScreens = false; });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill(opts.name || 'Body Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').nth(opts.cls || 0).click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(() => G.state === 'play');
  await page.waitForTimeout(300);
  await page.evaluate(HELPERS);
  return { page, errors };
}

const HELPERS = () => {
  window.requestAnimationFrame = () => 0;   // the game loop must not run between our steps
  window.__seed = (n) => { let s = ((Math.imul(n || 777, 2654435761) >>> 0) % 2147483646) + 1; window.__rc = 0; Math.random = () => { window.__rc++; return (s = (s * 16807) % 2147483647) / 2147483647; }; };
  window.__stage = (map, x, y, dir) => {
    loadMap(map || 'clearing', { x: x == null ? 12.5 : x, y: y == null ? 11.5 : y, dir: dir == null ? -Math.PI / 2 : dir });
    G.state = 'play'; G.fadeT = 0; G.keys = {}; G.vel.x = G.vel.y = 0; G.dead = false; G.noise = 2;
    for (let i = G.ents.length - 1; i >= 0; i--) if (G.ents[i].kind === 'enemy') G.ents.splice(i, 1);
    try { closeModal(); hide('#event'); hide('#death'); } catch (e) { /* none */ }
    G.player.hp = G.player.hpMax;
  };
  window.__spawn = (type, x, y, chase) => { const e = hydrate({ kind: 'enemy', type, x, y }); if (chase) { e.state = 'chase'; e.alertT = 99; } G.ents.push(e); return e; };
  window.__hashCanvas = (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 1) { h ^= d[i]; h = Math.imul(h, 16777619); } return (h >>> 0).toString(16) + ':' + c.width + 'x' + c.height; };
  window.__pin = (fn) => { const pn = performance.now.bind(performance), dn = Date.now; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { performance.now = pn; Date.now = dn; } };
  window.__gear = (o) => { const p = G.player; p.armor = {}; for (const k in o.armor || {}) { p.armor[k] = o.armor[k]; if (!G.has(o.armor[k])) p.inv.push({ id: o.armor[k], n: 1 }); } if (o.w) { if (!p.weapons.includes(o.w)) p.weapons.push(o.w); p.weapon = p.weapons.indexOf(o.w); } };
};

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const pages = [];
  try {
    const A = await boot(await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true }), { name: 'Body Tester' }); pages.push(A);
    const page = A.page, Q = (fn, arg) => page.evaluate(fn, arg);

    await step('contract: GEARLOOK21 covers every armour piece and weapon in the game; LOOK/key/ghostLook are sane; BODY21 is loaded after it', async () => {
      const r = await Q(() => {
        const all = GEARLOOK21.all();
        const missA = Object.keys(ARMOR).filter((k) => !all.armor.includes(k)), missW = Object.keys(WEAPONS).filter((k) => !all.weapons.includes(k));
        const slotsOk = Object.keys(ARMOR).every((k) => GEARLOOK21.ARMOR[k].slot === ARMOR[k].slot);
        const L = GEARLOOK21.of(G.player);
        const scripts = [...document.scripts].map((s) => s.src.replace(/.*\/js\//, '').replace(/\?.*/, ''));
        return { missA, missW, slotsOk, v: GEARLOOK21.VERSION, hasKey: typeof L.key === 'string', gl: GEARLOOK21.ghostLook(G.player), frozen: Object.isFrozen(GEARLOOK21.ARMOR.a_kite),
          order: [scripts.indexOf('max20.js'), scripts.indexOf('gearlook21.js'), scripts.indexOf('body21.js')], body: typeof BODY21 === 'object' };
      });
      assert.deepEqual(r.missA, []); assert.deepEqual(r.missW, []); assert.ok(r.slotsOk); assert.equal(r.v, 1); assert.ok(r.hasKey && r.frozen && r.body);
      assert.ok(r.order[0] >= 0 && r.order[0] < r.order[1] && r.order[1] < r.order[2], 'script order ' + r.order);
      assert.ok(r.gl.face >= 1 && r.gl.wpn >= 0 && r.gl.wpn <= 9 && r.gl.arm >= 0 && r.gl.arm <= 63, JSON.stringify(r.gl));
    });

    await step('hostile saves: junk armour ids, a bad face, a non-array weapon list and a poisoned prototype never throw and fall back to catalog entries', async () => {
      const r = await Q(() => {
        const out = [];
        const bad = [{ armor: { body: '__proto__', head: '<img src=x>', feet: 'a_kite', shield: 'a_plate' }, face: 99, weapons: 'sword', weapon: 7, cls: { id: 'nope' } },
          { armor: null, face: -1, weapons: [{}], weapon: 0, cls: null, glassed: 'yes' }, null, {}];
        for (const p of bad) { const L = GEARLOOK21.of(p); out.push([L.face, L.body.shape, L.head.shape, L.feet.shape, !!L.shield, L.weapon.kind, typeof L.key]); }
        // the module itself with a hostile player in play
        const keep = G.player.armor, kw = G.player.weapons, kf = G.player.face;
        G.player.armor = { body: 'constructor', hands: 'toString', feet: 'a_hood' }; G.player.face = '1<script>';
        let ok = true; try { render(); } catch (e) { ok = false; }
        G.player.armor = keep; G.player.weapons = kw; G.player.face = kf;
        return { out, ok, warn: Object.keys(BODY21.stats.warn) };
      });
      for (const row of r.out) { assert.ok(row[0] >= 1 && row[0] <= 6); assert.equal(row[6], 'string'); }
      assert.equal(r.out[0][3], 'shoes', 'a shield id in the feet slot is ignored');
      assert.equal(r.out[0][4], false, 'body armour in the shield slot is ignored');
      assert.ok(r.ok); assert.deepEqual(r.warn, []);
    });

    await step('every body armour, glove and the bare arm change the weapon arm; every weapon looks like itself (shared paintings re-toned); two-handers get a second hand', async () => {
      const r = await Q(() => {
        const h = (b) => __hashCanvas(b.main) + (b.over.length ? '+' + b.over.map((o) => __hashCanvas(o.canvas)).join('+') : '');
        const p = G.player, keep = Object.assign({}, p.armor), out = { body: {}, hands: {}, weapons: {}, second: [] };
        for (const id of [null, ...Object.keys(ARMOR).filter((k) => ARMOR[k].slot === 'body')]) { p.armor = {}; if (id) p.armor.body = id; out.body[id || 'none'] = h(BODY21.build('fp_sword', GEARLOOK21.of(p), 'sword', 'right')); }
        for (const id of [null, ...Object.keys(ARMOR).filter((k) => ARMOR[k].slot === 'hands')]) { p.armor = { body: 'a_gambeson' }; if (id) p.armor.hands = id; out.hands[id || 'none'] = h(BODY21.build('fp_sword', GEARLOOK21.of(p), 'sword', 'right')); }
        p.armor = { body: 'a_jerkin', hands: 'a_gloves' };
        for (const w of Object.keys(WEAPONS)) { const b = BODY21.build(WEAPONS[w].img, GEARLOOK21.of(p), w, 'right'); out.weapons[w] = b ? h(b) : null; if (b && b.over.length) out.second.push(w); }
        p.armor = keep;
        return out;
      });
      const uniq = (o) => new Set(Object.values(o)).size === Object.keys(o).length;
      assert.ok(uniq(r.body), 'every body armour differs: ' + JSON.stringify(r.body));
      assert.ok(uniq(r.hands), 'every glove differs');
      assert.ok(Object.values(r.weapons).every(Boolean), 'every weapon has a picture');
      assert.ok(uniq(r.weapons), 'every weapon differs: ' + JSON.stringify(r.weapons));
      for (const w of ['spear', 'p12_bellglaive', 'p12_glassblade']) assert.ok(r.second.includes(w), w + ' has a second hand');
    });

    await step('every boot pair, body hem, helm, hood and shield has its own picture; walking frames differ from standing', async () => {
      const r = await Q(() => {
        const p = G.player, keep = Object.assign({}, p.armor), out = { feet: {}, hem: {}, head: {}, shield: {}, walk: null };
        const ids = (slot) => Object.keys(ARMOR).filter((k) => ARMOR[k].slot === slot);
        for (const id of [null, ...ids('feet')]) { p.armor = {}; if (id) p.armor.feet = id; out.feet[id || 'none'] = __hashCanvas(BODY21.legArt(GEARLOOK21.of(p), -1).canvas); }
        for (const id of [null, ...ids('body')]) { p.armor = { feet: 'a_hobnails' }; if (id) p.armor.body = id; out.hem[id || 'none'] = __hashCanvas(BODY21.legArt(GEARLOOK21.of(p), -1).canvas); }
        for (const id of ids('head')) { p.armor = { head: id }; out.head[id] = __hashCanvas(BODY21.headArt(GEARLOOK21.of(p)).canvas); }
        for (const id of ids('shield')) { p.armor = { shield: id }; out.shield[id] = __hashCanvas(BODY21.shieldArt(GEARLOOK21.of(p)).canvas); }
        p.armor = { feet: 'a_softboots' }; const L = GEARLOOK21.of(p);
        out.walk = new Set([-1, 0, 2, 4, 6].map((f) => __hashCanvas(BODY21.legArt(L, f).canvas))).size;
        p.armor = keep; return out;
      });
      const uniq = (o) => new Set(Object.values(o)).size === Object.keys(o).length;
      for (const k of ['feet', 'hem', 'head', 'shield']) assert.ok(uniq(r[k]), k + ' differ: ' + JSON.stringify(r[k]));
      assert.equal(r.walk, 5, 'standing + four walk phases all differ');
    });

    await step('in play: arms with sleeves are drawn every frame, the shield rides the off arm (and goes when a two-hander takes both hands), legs show looking down, headwear looking up, and the view changes with the gear', async () => {
      const r = await Q(() => {
        __stage('clearing', 12.5, 11.5, -Math.PI / 2); G.tod = 0.5;
        const S = BODY21.stats.drawn, snap = () => Object.assign({}, S), d = (a, b) => { const o = {}; for (const k in b) o[k] = b[k] - (a[k] || 0); return o; };
        const frame = (n) => { for (let i = 0; i < (n || 1); i++) render(); return __hashCanvas(Engine.ctx.canvas); };
        const out = {};
        __gear({ w: 'sword', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } });
        Engine.cam.pitch = 0; let s0 = snap(); const f0 = frame(3); out.level = d(s0, snap());
        Engine.cam.pitch = -40; s0 = snap(); frame(2); out.down = d(s0, snap());
        Engine.cam.pitch = 40; s0 = snap(); frame(2); out.up = d(s0, snap());
        Engine.cam.pitch = 0;
        __gear({ w: 'spear', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite' } }); s0 = snap(); frame(2); out.two = d(s0, snap());
        __gear({ w: 'sword', armor: { body: 'a_gambeson', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } }); const f1 = frame(3);
        __gear({ w: 'sword', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } }); const f2 = frame(3);
        out.changed = f0 !== f1; out.back = f0 === f2;
        return out;
      });
      assert.ok(r.level.arms >= 3 && r.level.ext >= 3, 'arm and sleeve each frame ' + JSON.stringify(r.level));
      assert.ok(r.level.shield >= 3, 'shield each frame'); assert.equal(r.level.feet, 0, 'no legs at a level look'); assert.ok(!r.level.head, 'no brim at a level look');
      assert.ok(r.down.feet >= 2, 'legs when looking down'); assert.ok(r.up.head >= 2, 'the helm brim when looking up');
      assert.equal(r.two.shield, 0, 'a two-hander leaves no hand for the shield'); assert.ok(r.two.extra >= 2, 'the second hand on the haft');
      assert.ok(r.changed, 'the view changes with the body armour');
    });

    await step('Options: the three rows are in Graphics & access and switch the body off (the original weapon picture comes back)', async () => {
      const r = await Q(() => {
        __stage('clearing', 12.5, 11.5, -Math.PI / 2);
        renderAccessibilityMenu();
        const ids = ['b21-on', 'b21-feet', 'b21-light'].map((id) => !!document.getElementById(id));
        const before = BODY21.stats.drawn.arms; document.getElementById('b21-on').click(); render(); render();
        const off = BODY21.stats.drawn.arms - before, isOff = BODY21.set.on === false;
        document.getElementById('b21-on').click(); closeModal(); G.state = 'play';
        return { ids, off, isOff, back: BODY21.set.on };
      });
      assert.deepEqual(r.ids, [true, true, true]); assert.equal(r.off, 0); assert.ok(r.isOff && r.back);
    });

    // ---------------------------------------------------------------- the module blocked: timing, Original, switch off
    const ctxB = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
    const ctxC = await browser.newContext({ viewport: { width: 1280, height: 800 }, hasTouch: true });
    const Bp = await boot(ctxB, { block: true }), Cp = await boot(ctxC, { block: true }); pages.push(Bp, Cp);
    const base = await Bp.page.evaluate(() => { const s = snapshotGame(); s.when = 0; return JSON.stringify(s); });

    await step('combat timing unchanged: a seeded fight (swings, a guard, a shield bash, a Song), DRAWN every step, matches a page with the module blocked', async () => {
      const trace = (P) => P.page.evaluate((base) => __pin(() => {
        __seed(5); restoreGame(JSON.parse(base));
        __stage('clearing', 12.5, 11.5, -Math.PI / 2); G.tod = 0.4; G.day = 3; G.player.hpMax = G.player.hp = 400; G.player.xp = 0; G.player.fat = G.player.fatMax = 200;
        __gear({ w: 'spear' }); __gear({ w: 'sword', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } });
        const es = [__spawn('legionnaire', 12.5, 9.0, true), __spawn('hound', 14.5, 9.5, true), __spawn('proctor', 10.5, 9.5, true)];
        const rows = [];
        for (let i = 0; i < 300; i++) {
          __seed(7000 + i);
          G.keys = i % 90 < 30 ? { w: true } : i % 90 < 50 ? { a: true } : {};
          Engine.cam.pitch = Math.round(Math.sin(i / 20) * 40);
          // drawn every step; the frame's own draws (windbells' leaves) use Math.random from a separate stream, so __rc counts
          // only the simulation's rolls (render-time particles carry state between pages and are not part of the fight)
          update(1 / 30); { const rr = Math.random; let s2 = 99; Math.random = () => (s2 = (s2 * 16807) % 2147483647) / 2147483647; try { render(); } finally { Math.random = rr; } }
          if (i % 12 === 0) { Engine.cam.dir = -Math.PI / 2 + Math.sin(i / 30) * 0.4; attack('slash right'); }
          if (i % 45 === 20 && typeof triggerBlock === 'function') triggerBlock();
          if (i % 60 === 30 && typeof ARMS12 === 'object') ARMS12.bash(true);
          if (i === 150) { G.player.weapon = G.player.weapons.indexOf('spear') >= 0 ? G.player.weapons.indexOf('spear') : G.player.weapon; }
          if (i % 10 === 0) rows.push([Engine.cam.x.toFixed(4), Engine.cam.y.toFixed(4), G.player.hp, G.player.xp, G.player.fat.toFixed(3), G.attack.t.toFixed(4), __rc].concat(es.map((e) => [e.hp, e.dead ? 1 : 0, e.state, e.x.toFixed(3), e.y.toFixed(3)].join(','))).join('|'));
        }
        G.keys = {}; Engine.cam.pitch = 0;
        const s = snapshotGame(); s.when = 0;
        return { has: typeof BODY21 !== 'undefined', rows, save: JSON.stringify(s) };
      }), base);
      const a = await trace(A), b = await trace(Bp);
      assert.equal(a.has, true); assert.equal(b.has, false);
      assert.deepEqual(a.rows, b.rows, 'seeded trace (positions, health, fatigue, swing timer, RNG calls, enemies)');
      assert.equal(a.save, b.save, 'the save is byte-identical');
    });

    const frameOf = (P, preset, off) => P.page.evaluate(({ base, preset, off }) => __pin(() => {
      __seed(9); restoreGame(JSON.parse(base));
      __stage('clearing', 12.5, 11.5, -Math.PI / 2); G.tod = 0.5;
      __gear({ w: 'sword', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves' } });
      if (preset) PRESETS.apply(preset);
      if (off && typeof BODY21 === 'object') BODY21.setSwitch('on', false);
      for (const k of ['coldBreath', 'windSigns', 'dyingLights']) GFX[k] = false;
      Engine.setTime(5); Engine.cam.bob = 0; Engine.cam.pitch = -30;
      __seed(1); render();
      // the world frame carries particle state between pages; the body is drawn by drawHUD, so the comparison is the
      // whole HUD pass (weapon, arms, shield, legs, bar, text) drawn over a black view with every clock pinned
      const ctx = Engine.ctx; ctx.save(); ctx.fillStyle = '#000'; ctx.fillRect(0, 0, 320, 200); ctx.restore();
      __seed(1); drawHUD();
      const h = __hashCanvas(Engine.ctx.canvas);
      if (off && typeof BODY21 === 'object') BODY21.setSwitch('on', true);
      return h;
    }), { base, preset, off });

    await step('Original preset: the frame (world + HUD) is the original game\'s, pixel for pixel; with the switch off in Medium too', async () => {
      const ao = await frameOf(A, 'original'), bo = await frameOf(Bp, 'original'), co = await frameOf(Cp, 'original');
      assert.equal(bo, co, 'the reference is stable'); assert.equal(ao, bo, 'Original frame identical to the blocked page');
      const am = await frameOf(A, 'medium', true), bm = await frameOf(Bp, 'medium'), cm = await frameOf(Cp, 'medium');
      assert.equal(bm, cm, 'the reference is stable'); assert.equal(am, bm, 'switch off = blocked page');
      const on = await frameOf(A, 'medium');
      assert.notEqual(on, bm, 'with the body on the frame differs');
    });

    await step('frame cost: the body adds little to a drawn frame (gear pictures cached; a light change re-tints only)', async () => {
      const r = await Q(() => {
        __stage('clearing', 12.5, 11.5, -Math.PI / 2); G.tod = 0.5; PRESETS.apply('medium');
        __gear({ w: 'sword', armor: { body: 'a_plate', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } });
        Engine.cam.pitch = -36; for (let i = 0; i < 10; i++) drawHUD();
        const t = (fn) => { const t0 = performance.now(); for (let i = 0; i < 120; i++) fn(); return (performance.now() - t0) / 120; };
        const on = t(() => drawHUD()); BODY21.setSwitch('on', false); const off = t(() => drawHUD()); BODY21.setSwitch('on', true);
        Engine.cam.pitch = 0;
        return { on, off, extra: on - off };
      });
      console.log('  drawHUD ms: body on ' + r.on.toFixed(3) + ', off ' + r.off.toFixed(3) + ', extra ' + r.extra.toFixed(3));
      assert.ok(r.extra < 2.5, 'extra per frame ' + r.extra);
    });

    await step('R3D: the body pass is registered at order 40; under R3D the pictures go into the 3D scene (screen quads + a world quad for the legs), nothing is painted on the HUD canvas, and switching R3D off brings the raycaster overlay back', async () => {
      const Rp = await boot(await browser.newContext({ viewport: { width: 960, height: 600 }, hasTouch: true }), { r3d: true }); pages.push(Rp);
      const r = await Rp.page.evaluate(async () => {
        const out = { has: typeof R3D === 'object' };
        if (!out.has) return out;
        R3D.setMode('on'); out.shown = R3D.shown();
        out.pass = (R3D.passes().find((p) => p.name === 'body') || {}).order;
        if (!out.shown) return out;
        __stage('clearing', 12.5, 11.5, -Math.PI / 2); G.tod = 0.5;
        __gear({ w: 'sword', armor: { body: 'a_chain', hands: 'a_gauntlets', shield: 'a_kite', feet: 'a_greaves', head: 'a_kettle' } });
        R3D.camera.setAngle(-50 * Math.PI / 180);
        const d0 = BODY21.R3B.drawn, q0 = BODY21.R3B.quads, l0 = BODY21.R3B.legs;
        for (let i = 0; i < 4; i++) render();
        out.drawn = BODY21.R3B.drawn - d0; out.quads = BODY21.R3B.quads - q0; out.legs = BODY21.R3B.legs - l0; out.rec = BODY21.r3dOn(); out.err = BODY21.R3B.err;
        out.active = R3D.active();
        // nothing of the body on the HUD layer: the HUD canvas pixels at the shield's rest place are transparent
        const hud = Engine.ctx.canvas, x = hud.getContext('2d'); const sx = Math.round(hud.width * 48 / 320), sy = Math.round(hud.height * 115 / 200);
        out.hudAlpha = x.getImageData(sx, sy, 1, 1).data[3];
        R3D.setMode('off'); R3D.camera.setAngle(0); for (let i = 0; i < 2; i++) render();
        out.offRec = BODY21.r3dOn(); const a0 = BODY21.stats.drawn.shield; render(); out.offShield = BODY21.stats.drawn.shield - a0;
        return out;
      });
      console.log('  r3d: ' + JSON.stringify(r));
      assert.ok(r.has); assert.equal(r.pass, 40);
      if (!r.shown) { console.log('  (R3D not available in this browser: pass registration only)'); return; }
      assert.ok(r.active && r.rec, 'R3D frames recorded'); assert.ok(r.drawn >= 3, 'the body pass drew'); assert.ok(r.quads >= 3 * 4, 'arm, sleeve, shield, off arm, legs as quads'); assert.ok(r.legs >= 3, 'legs in the world');
      assert.equal(r.hudAlpha, 0, 'the shield is not on the HUD canvas under R3D'); assert.equal(r.err, '');
      assert.equal(r.offRec, false); assert.ok(r.offShield >= 1, 'raycaster overlay is back');
    });

    await step('no page errors on any page', async () => {
      assert.deepEqual(pages.flatMap((p) => p.errors), []);
    });
    console.log('OK body21: ' + passed + ' checks passed');
  } catch (e) {
    console.error('FAIL', e && e.stack || e);
    process.exitCode = 1;
  } finally {
    await browser.close();
  }
})();
