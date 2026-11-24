// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4223 node test/roofs116.test.js
// Covers js/roofs116.js (Phase 116: roofs for the later places, then their houses raised as Phase 108 did; 3D view).
//   - each of the three places has its roofs planned, and every kind of roof is that place's own: Sun-Peak Vigil (pale
//     stone slates, snow on the weather pitch, the cloister's pentice, the gate's gable, the bell tower's cap), Null-Watch
//     (grey lead with rolled seams), Cross Pool (mossed slate, sagging ridges, slipped courses, the weavers' windows); no
//     roof tile of theirs is used anywhere else in the game, and none of theirs is another place's
//   - Null-Watch: nothing on the wall, its towers, its batteries, the cart gate or the mooring-yard
//   - the doors: the houses' own doors stand taller (each place's table), a gate, a postern, a tower or a drowned garret
//     does not; and the maps are untouched: every cell, every door, everything that can or cannot be walked through
//   - the classic view's frame is byte for byte what it was; the Original preset draws the classic view
//   - no random numbers: none in the module, and a plan made twice is the same plan
//   - the cost: how long each mesh takes to build, how many triangles it adds, and the per-frame hook
//   - no page errors
'use strict';
const assert = require('node:assert');
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = (process.env.PREVIEW_URL || 'http://127.0.0.1:4223').replace(/\/$/, '');
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0] : e)); } }
const IDS = ['p96_vigil', 'p100_wall', 'p85_crosspool'];

(async () => {
  // the module itself: no random numbers in it at all
  await step('no Math.random anywhere in the module', async () => {
    const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'roofs116.js'), 'utf8');
    assert.ok(src.length > 4000, 'the module is a stub');
    assert.ok(!/Math\.random/.test(src), 'Math.random is used');
  });

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /roofs116|eaves78 post/.test(m.text()))) errors.push('console: ' + m.text()); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true }; });
  await page.goto(URL + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000, polling: 500 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Roof Tester'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play', null, { timeout: 600000 });

  try {
    const ready = await page.evaluate((ids) => typeof ROOFS116 !== 'undefined' && !!ROOFS116.PLACES && ids.every((id) => G.maps[id]), IDS);
    if (!ready) throw new Error('ROOFS116 is not there, or a place is missing');
    // the maps as they were built, before any roof is planned or any mesh made: every cell, and what can be walked
    // (each place visited once in the classic view first: a place's walls take their own variant tiles when it is first loaded)
    await page.evaluate((ids) => { window.requestAnimationFrame = () => 0; R3D.setMode('off'); for (const id of ids) { closeModal(); hide('#event'); loadMap(id, {}); G.state = 'play'; window.advanceTime(16); } }, IDS);
    await page.evaluate((ids) => {
      const snap = (m) => { const c = JSON.stringify(m.cells.map((q) => q && [q.tex, q.top, !!q.door, q.locked || null, q.label || null, q.capTex || null])); let b = ''; for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) b += m.isBlocked(x, y) ? '1' : '0'; return c + '|' + b + '|' + (m.lvls ? Array.from(m.lvls).join(',') : ''); };
      window.__snap = snap; window.__before = {}; for (const id of ids) window.__before[id] = snap(G.maps[id]);
    }, IDS);
    await page.evaluate(() => { window.requestAnimationFrame = () => 0; R3D.setMode('on'); GFX.eaves = true; });
    // each place in the 3D view: the mesh with and without the roofs, at noon
    const cost = await page.evaluate((ids) => {
      const out = {};
      const go = (id, tod) => { closeModal(); hide('#event'); loadMap(id, {}); G.state = 'play'; G.tod = tod; window.advanceTime(16); window.advanceTime(16); return R3D.mesh(); };
      for (const id of ids) {
        // the quickest of three builds each way (the machine is shared)
        const best = () => { let q = null; for (let i = 0; i < 3; i++) { R3D.invalidate(); const r = go(id, 0.5); if (!q || r.ms < q.ms) q = { tris: r.tris, ms: r.ms }; } return q; };
        ROOFS116.enabled = false; const o = best(), off = o.tris, offMs = o.ms;
        ROOFS116.enabled = true; const on = best(); const draw = ROOFS116.stats().draw[id] || 0;
        const t0 = performance.now(); for (let i = 0; i < 60; i++) window.advanceTime(16); const frame = (performance.now() - t0) / 60;
        out[id] = { off, on: on.tris, ms: on.ms - offMs, draw, frame, hook: ROOFS116.stats().hookMs };
      }
      return out;
    }, IDS);

    await step('each place has its roofs planned, and every kind is that place\'s own', async () => {
      const r = await page.evaluate((ids) => {
        const out = {};
        for (const id of ids) {
          const m = G.maps[id], R = ROOFS116.roofs(m), P = ROOFS116.PLACES[id];
          out[id] = { n: R.length, kinds: Array.from(new Set(R.map((q) => q.kind))), wrong: R.filter((q) => q.place !== id || !P.kinds.includes(q.kind)).map((q) => q.kind), tex: P.tiles, made: P.tiles.filter((t) => !Engine.textures[t]) };
        }
        // nobody else uses these tiles: no other place's houses are roofed or walled in them
        const mine = new Set(); for (const id of ids) for (const t of ROOFS116.PLACES[id].tiles) mine.add(t);
        const elsewhere = [];
        for (const id of EAVES78.MAPS) { if (ids.includes(id) || !G.maps[id]) continue; for (const b of EAVES78.planOf(G.maps[id]).houses) for (const t of [b.roofTex, b.gableTex, b.ridgeTex, b.boardTex]) if (t && mine.has(t)) elsewhere.push(id + ':' + t); }
        out.elsewhere = elsewhere;
        return out;
      }, IDS);
      const V = r.p96_vigil, N = r.p100_wall, C = r.p85_crosspool;
      for (const q of [V, N, C]) { assert.deepStrictEqual(q.wrong, [], 'a kind that is not the place\'s own: ' + q.wrong); assert.deepStrictEqual(q.made, [], 'tiles not made: ' + q.made); }
      for (const k of ['vigil-range', 'vigil-pentice', 'vigil-gate', 'vigil-cap']) assert.ok(V.kinds.includes(k), 'the Vigil has no ' + k + ': ' + V.kinds);
      assert.ok(V.kinds.filter((k) => k === 'vigil-range').length === 1 && V.n >= 5, 'the Vigil: ' + JSON.stringify(V));
      assert.ok(N.kinds.includes('watch-halls') && N.n >= 1, 'Null-Watch: ' + JSON.stringify(N));
      for (const k of ['pool-drowned', 'pool-garret', 'pool-raised']) assert.ok(C.kinds.includes(k), 'Cross Pool has no ' + k + ': ' + C.kinds);
      // each place's tiles are its own
      const all = [V.tex, N.tex, C.tex]; for (let i = 0; i < 3; i++) for (let j = i + 1; j < 3; j++) assert.ok(!all[i].some((t) => all[j].includes(t)), 'two places share a tile');
      assert.deepStrictEqual(r.elsewhere, []);
    });
    await step('the Vigil: two ranges under stone, snow on one pitch only; Null-Watch: lead, low, with rolls; Cross Pool: sagging, slipped, with the weavers\' windows', async () => {
      const r = await page.evaluate(() => {
        const V = ROOFS116.roofs(G.maps.p96_vigil), N = ROOFS116.roofs(G.maps.p100_wall), C = ROOFS116.roofs(G.maps.p85_crosspool);
        const ranges = V.filter((q) => q.kind === 'vigil-range');
        return {
          ranges: ranges.map((q) => ({ pitch: q.pitch, snow: q.snow, tex: q.tex, x0: q.x0, x1: q.x1 })),
          lead: N.map((q) => ({ pitch: q.pitch, rolls: q.rolls, tex: q.tex, pipes: q.pipes })),
          sag: C.filter((q) => q.kind === 'pool-drowned' || q.kind === 'pool-garret').map((q) => ({ sag: q.sag, slips: q.slips, tex: q.tex })),
          garrets: C.filter((q) => q.kind === 'pool-garret').map((q) => q.weavers),
        };
      });
      assert.strictEqual(r.ranges.length, 2, JSON.stringify(r.ranges));
      assert.ok(r.ranges.every((q) => q.pitch >= 0.8 && q.snow === 'west' && q.tex === 'r116_vslate'), 'the ranges: steep, pale stone, snow on the west pitch ' + JSON.stringify(r.ranges));
      assert.ok(r.lead.every((q) => q.pitch <= 0.35 && q.rolls >= 4 && q.tex === 'r116_lead' && q.pipes <= 1), 'the lead: low, rolled, at most one stove-pipe ' + JSON.stringify(r.lead));
      assert.ok(r.sag.length >= 14 && r.sag.every((q) => q.sag > 0.04 && q.tex === 'r116_moss') && r.sag.filter((q) => q.slips > 0).length >= 4, 'the drowned roofs sag and some have slipped courses ' + JSON.stringify(r.sag));
      assert.ok(r.garrets.length === 6 && r.garrets.every((n) => n >= 3), 'a row of weavers\' windows under each garret\'s eaves ' + JSON.stringify(r.garrets));
    });
    await step('Null-Watch: nothing on the wall, its towers, its batteries, the cart gate or the mooring-yard', async () => {
      const r = await page.evaluate(() => {
        const m = G.maps.p100_wall, K = m._p100.kind, W = m.w, P = RIFT100.P, bad = [];
        const inR = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
        const leaves = (typeof TIP113 !== 'undefined' && TIP113.P && TIP113.P.leaves) || [];
        for (const q of ROOFS116.roofs(m)) for (let y = Math.floor(q.y0 - 1); y <= Math.ceil(q.y1 + 1); y++) for (let x = Math.floor(q.x0 - 1); x <= Math.ceil(q.x1 + 1); x++) {
          if (x < 0 || y < 0 || x >= W || y >= m.h) continue; const k = K[y * W + x];
          if (x >= q.x0 && x <= q.x1 && y >= q.y0 && y <= q.y1 && ![0, 1, 2, 6].includes(k)) bad.push('wall ' + x + ',' + y + ' kind ' + k);
          if (inR(P.yard, x, y)) bad.push('yard ' + x + ',' + y);
          if (leaves.some((l) => l[0] === x && l[1] === y)) bad.push('cart gate ' + x + ',' + y);
        }
        for (const q of ROOFS116.roofs(m)) for (const t of RIFT100.TOWERS) if (Math.hypot((q.x0 + q.x1 + 1) / 2 - t.at[0], (q.y0 + q.y1 + 1) / 2 - t.at[1]) < 12) bad.push('tower ' + t.n);
        return { bad, n: ROOFS116.roofs(m).length };
      });
      assert.ok(r.n >= 1 && !r.bad.length, JSON.stringify(r));
    });
    await step('the houses\' doors stand taller, each as its place\'s table says; gates, posterns, towers and drowned garrets do not', async () => {
      const r = await page.evaluate(() => {
        EAVES78.textures();
        const out = {};
        for (const [id, T] of Object.entries(ROOFS116.PLACES)) {
          const m = G.maps[id], doors = [];
          for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (!c || !c.door) continue; const x = i % m.w, y = (i / m.w) | 0, L = EAVES78.door(m, x, y), g = m.lvls ? m.lvls[i] || 0 : 0; doors.push({ x, y, label: c.label || '', top: L ? +(g + L.h).toFixed(3) : null }); }
          out[id] = { T, doors };
        }
        return out;
      });
      const V = r.p96_vigil, N = r.p100_wall, C = r.p85_crosspool;
      const cells = V.doors.filter((d) => /cell|Abbess/i.test(d.label)), gateV = V.doors.filter((d) => !/cell|Abbess/i.test(d.label));
      assert.ok(cells.length === 12 && cells.every((d) => Math.abs(d.top - V.T.doorH) < 1e-6), 'the twelve cells: ' + JSON.stringify(cells));
      assert.ok(gateV.length >= 1 && gateV.every((d) => d.top == null), 'the Vigil\'s gate and postern are not raised ' + JSON.stringify(gateV));
      const halls = N.doors.filter((d) => /Talking Halls/i.test(d.label)), rest = N.doors.filter((d) => !/Talking Halls/i.test(d.label));
      assert.ok(halls.length === 1 && Math.abs(halls[0].top - N.T.doorH) < 1e-6, 'the Talking Halls: ' + JSON.stringify(halls));
      assert.ok(rest.length >= 4 && rest.every((d) => d.top == null), 'no gate, postern or tower door on the wall is raised ' + JSON.stringify(rest.filter((d) => d.top != null)));
      const loft = C.doors.filter((d) => /corn loft|middle of the pool/i.test(d.label)), garrets = C.doors.filter((d) => /garret/i.test(d.label));
      assert.ok(loft.length === 2 && loft.every((d) => Math.abs(d.top - C.T.ground0 - C.T.doorH) < 1e-6), 'the corn loft and the kerb house stand dry and are raised: ' + JSON.stringify(loft));
      assert.ok(garrets.length === 6 && garrets.every((d) => d.top == null), 'the garrets stand in the water and keep their height ' + JSON.stringify(garrets));
      for (const T of [V.T, N.T, C.T]) assert.ok(T.doorH >= 1.2 && T.doorH <= 1.35 && typeof T.why === 'string' && T.why.length > 10, 'a table row: ' + JSON.stringify(T));
    });
    await step('the maps are not touched: every cell, every door, what can and cannot be walked through', async () => {
      const changed = await page.evaluate((ids) => ids.filter((id) => window.__snap(G.maps[id]) !== window.__before[id]), IDS);
      assert.deepStrictEqual(changed, []);
    });
    await step('the classic view\'s frame is byte for byte what it was; the Original preset draws the classic view', async () => {
      const r = await page.evaluate((ids) => {
        const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
        let cap = null; Engine.addPostHook((F) => { cap = F.fb.slice(); }, 1e9);
        const hash = (d) => { let h = 2166136261; const u = new Uint8Array(d.buffer, d.byteOffset, d.byteLength); for (let i = 0; i < u.length; i += 4) { h ^= u[i] | (u[i + 1] << 8) | (u[i + 2] << 16); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
        const SPOTS = { p96_vigil: [33.5, 30.5, -2.5], p100_wall: [172.5, 114, -1.57], p85_crosspool: [30.5, 42.5, 2.5] };
        const frame = (id) => pin(() => {
          G.state = 'paused'; G.tod = 0.45; const s = SPOTS[id]; loadMap(id, { x: s[0], y: s[1], dir: s[2] }); G.fadeT = 0; G.tod = 0.45; Engine.cam.bob = 0; Engine.cam.pitch = 0; G.state = 'play';
          for (const e of G.ents) { if (e.kind === 'npc' || e.kind === 'enemy') { e.x = 1.5; e.y = 1.5; } for (const k of Object.keys(e)) if (k.startsWith('anim') && typeof e[k] === 'number') e[k] = (k === 'animSX' || k === 'animSY' || k === 'animAlpha') ? 1 : 0; e.animSprite = null; }
          if (typeof PARTICLES !== 'undefined') PARTICLES.mapId = null;
          ANIM.T = 5; ANIM.last = 123.456; Engine.setTime(5); Engine.setFlicker(1);
          render(); render(); return hash(cap);
        });
        R3D.setMode('off'); const out = { classic: {}, same: true };
        for (const id of ids) { frame(id); ROOFS116.enabled = true; const a = frame(id); ROOFS116.enabled = false; const b = frame(id); ROOFS116.enabled = true; const c = frame(id); out.classic[id] = [a, b, c]; if (a !== b || a !== c) out.same = false; }
        PRESETS.apply('original'); R3D.setMode('on'); loadMap('p96_vigil', {}); G.state = 'play'; window.advanceTime(16); window.advanceTime(16);
        out.original = R3D.active(); PRESETS.apply('medium'); R3D.setMode('on');
        return out;
      }, IDS);
      assert.ok(r.same, JSON.stringify(r.classic));
      assert.strictEqual(r.original, false, 'the Original preset draws in 3D');
    });
    await step('the switch: with Roofs, windows and eaves off the 3D view draws the places as before', async () => {
      const r = await page.evaluate((ids) => {
        const out = {}; R3D.setMode('on');
        for (const id of ids) { closeModal(); hide('#event'); loadMap(id, {}); G.state = 'play'; G.tod = 0.5;
          GFX.eaves = false; R3D.invalidate(); window.advanceTime(16); window.advanceTime(16); const offE = R3D.mesh().tris;
          GFX.eaves = true; ROOFS116.enabled = false; R3D.invalidate(); window.advanceTime(16); window.advanceTime(16); const offR = R3D.mesh().tris;
          ROOFS116.enabled = true; R3D.invalidate(); window.advanceTime(16); window.advanceTime(16); out[id] = { offE, offR, on: R3D.mesh().tris }; }
        return out;
      }, IDS);
      for (const id of IDS) assert.ok(r[id].offE === r[id].offR && r[id].on > r[id].offE + 200, id + ' ' + JSON.stringify(r[id]));
    });
    await step('a plan made twice is the same plan (no random numbers)', async () => {
      const same = await page.evaluate((ids) => ids.every((id) => { const a = JSON.stringify(ROOFS116.roofs(G.maps[id])); const p = ROOFS116.replan(G.maps[id]); return a === JSON.stringify(ROOFS116.roofs(G.maps[id])) && p; }), IDS);
      assert.ok(same);
    });
    await step('the cost: drawing the roofs takes under a tenth of a second of each mesh\'s build, and under 60000 triangles, the frame hook costs under 0.3 ms', async () => {
      console.log('   cost ' + JSON.stringify(cost));
      for (const id of IDS) { const q = cost[id]; assert.ok(q.draw > 0 && q.draw < 100 && q.on - q.off < 60000 && q.on > q.off && q.hook < 0.3, id + ' ' + JSON.stringify(q)); }
    });
    await step('no page errors', async () => { assert.deepStrictEqual(errors, []); });
  } catch (e) {
    failed++; console.log('FAIL ' + (e && e.message ? e.message : e));
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
