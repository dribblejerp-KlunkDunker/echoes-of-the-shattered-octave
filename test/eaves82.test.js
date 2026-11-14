// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/eaves82.test.js
// Phase 82, the other six regions' building styles: Stillwater Landing (tarred board under reed, blind backs, the
// lockkeeper's porch, the Bonded Store's hoist-house, the cooperage's louvre), the Low Rings (a tide-line, holed roofs,
// one lit loft), Wethercombe (flint under deep thatch, thatched yard walls, a straw ram on the Bellwether), the Watch
// Downs (cock-and-hen coping, no roof), Driftwood Cay (marram thatch roped down, a driftwood porch, the kitchen window
// lit) and the Flume Road (the ribs over the water, a bead of sap-light on each after dusk).
'use strict';
const path = require('path'), ROOT = path.join(__dirname, '..');
global.EAVES78 = require(path.join(ROOT, 'js', 'eaves78.js'));
const E = global.EAVES78, X = require(path.join(ROOT, 'js', 'eaves82.js'));
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- the planner's two helpers, on a map made by hand (no browser)
{
  const W = 30, H = 14, cells = new Array(W * H).fill(null), set = (x, y, c) => { cells[y * W + x] = c; };
  const block = (x0, y0, x1, y1, wall, door, label, lid, hollow) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const edge = x === x0 || x === x1 || y === y0 || y === y1; if (edge) set(x, y, { tex: wall }); else if (!hollow) set(x, y, { tex: 't_roof', capTex: 't_roof', top: lid }); } if (door) set(door[0], door[1], { door: true, tex: 't_door', label }); };
  block(2, 2, 7, 5, 't_house', [4, 5], 'A house', 1.3);            // solid, a low lid
  block(10, 2, 15, 6, 't_house', [12, 6], 'A yard', 0, true);      // a ring of wall round a yard
  block(18, 2, 22, 6, 't_house', [20, 6], 'A tall house', 2.2);    // a lid that is an upper floor
  set(25, 3, { tex: 't_stone', top: 0.42 }); set(26, 3, { tex: 't_stone', top: 0.42 }); set(27, 3, { tex: 't_stone', top: 0.42 }); set(27, 4, { tex: 't_stone', top: 0.42 });
  const M = { id: 'made', w: W, h: H, cells }, part = (c) => c.door || /^t_house/.test(c.tex) || c.tex === 't_roof', rs = X.rects(M, part);
  check(rs.length === 3 && rs.filter((r) => r.hollow).length === 1 && rs.every((r) => r.doors.length === 1 && r.doors[0].ny === 1), 'rects: two solid blocks and a ring round a yard are buildings, each with its door facing out');
  const a = X.house(M, rs.find((r) => /A house/.test(r.label)), {}), y = X.house(M, rs.find((r) => /yard/.test(r.label)), {}), t = X.house(M, rs.find((r) => /tall/.test(r.label)), { wrapLid: true });
  let poke = 0; for (const [b, lid] of [[a, 1.3], [t, 2.2]]) for (let yy = b.y0 + 1; yy < b.y1; yy++) for (let x = b.x0 + 1; x < b.x1; x++) for (let k = 0; k < 9; k++) { const z = E.roofZ(b, x + (k % 3) / 2, yy + ((k / 3) | 0) / 2); if (z == null || z < lid) poke++; }
  check(poke === 0 && a.ext === 0 && a.type === 'gable' && a.axis === 'x', 'house: a roof along the long side, the whole of the old lid under it');
  check(t.ext > 1.1 && t.storeys === 2 && t.windows.some((w) => w.z0 > t.top) && Math.abs(t.wallTop - 2.23) < 1e-6, 'house: a lid standing well above the walls is an upper floor, walled round and given windows');
  check(!y.solid && E.roofZ(y, 12.5, 4.5) > 1 && y.windows.length > 0, 'house: a yard is roofed over like any other building');
  const blind = X.house(M, rs[0], { faces: (nx, ny) => ny === 1 });
  check(blind.windows.length > 0 && blind.windows.every((w) => w.ny === 1), 'house: windows only on the faces asked for');
  const lw = X.lowWalls(M); check(lw.length === 4 && lw.filter((q) => q.e || q.w).length === 3 && lw.some((q) => q.n) && lw.some((q) => q.s && q.w), 'lowWalls: a low stone wall is found cell by cell, with which way it runs');
  check(['flume_landing', 'flume_lowrings', 'p22_combe', 'p20_downs', 'cantabile_cay', 'flume_road'].every((id) => E.MAPS.has(id) && E.STYLES[id] && E.STYLES[id].only.length >= 1 && typeof E.STYLES[id].plan === 'function'), 'each of the six regions has a style of its own: what it builds with, and what only it has');
  check(['e82_porch', 'e82_lucam', 'e82_louvre', 'e82_strawram', 'e82_roped', 'e82_drift'].every((k) => typeof E.EXTRA[k] === 'function') && ['flume_lowrings', 'p22_combe', 'p20_downs', 'flume_road'].every((k) => typeof E.REGION[k] === 'function'), 'every thing only one place has is drawn by its own drawer');
}

(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP browser checks (no playwright)'); console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { window.__r3d21 = { automation: true }; });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; R3D.setMode('on'); closeModal(); hide('#event'); loadMap('oakhaven', {}); G.state = 'play'; });
  for (let k = 0; k < 8; k++) { await page.evaluate(() => window.advanceTime(16)); await page.waitForTimeout(300); }
  const r = await page.evaluate(() => {
    const out = {}, snap = (id) => JSON.stringify(G.maps[id].cells.map((c) => c && [c.tex, c.top, !!c.door]));
    const go = (id, tod) => { closeModal(); hide('#event'); loadMap(id, {}); G.state = 'play'; G.tod = tod; window.advanceTime(16); window.advanceTime(16); return R3D.mesh(); };
    for (const id of EAVES82.MAPS) {
      const before = snap(id);
      GFX.eaves = false; R3D.invalidate(); const off = go(id, 0.5).tris; GFX.eaves = true; R3D.invalidate(); const on = go(id, 0.5);
      const P = EAVES78.planOf(G.map).houses, b0 = R3D.stats.meshBuilds; G.tod = 0.86; window.advanceTime(16); window.advanceTime(16); const dusk = R3D.stats.meshBuilds - b0;
      out[id] = { off, on: on.tris, ms: on.ms, n: P.length, dusk, untouched: snap(id) === before, shelter: !!EAVES78.shelter(G.map), roofs: Array.from(new Set(P.map((b) => b.roofTex))),
        kinds: P.reduce((a, b) => a.concat(b.extras.map((e) => e.kind + ':' + b.label.slice(0, 14))), []), lit: P.reduce((n, b) => n + b.windows.filter((w) => w.lit).length, 0), litWho: P.filter((b) => b.windows.some((w) => w.lit)).map((b) => b.label.slice(0, 22)),
        faces: Array.from(new Set(P.reduce((a, b) => a.concat(b.windows.filter((w) => w.style !== 'attic').map((w) => w.nx + ',' + w.ny)), []))), tall: P.filter((b) => b.ext > 0.4).length, styles: Array.from(new Set(P.reduce((a, b) => a.concat(b.windows.map((w) => w.style)), []))),
        walls: EAVES82.lowWalls(G.map).length, high: Math.max(0, ...P.map((b) => b.ridge)) };
    }
    out.tex = ['e82_tar', 'e82_reed', 'e82_sedge', 'e82_marram', 'e82_rope', 'e82_hole', 'e82_tide', 'e82_mossslate', 'e82_sap', 'e82_louvre', 'e82_cob'].filter((n) => !Engine.textures[n]);
    // the classic renderer draws the old boxes: nothing of this reaches it
    out.classic = typeof Engine.render === 'function';
    return out;
  });
  const L = r.flume_landing, R = r.flume_lowrings, C = r.p22_combe, D = r.p20_downs, K = r.cantabile_cay, F = r.flume_road;
  check(!r.tex.length, 'the tiles are made: tar, reed, sedge, marram, rope, a roof-hole, a tide-line, mossed slate, sap-light, louvre, cob' + (r.tex.length ? ' (missing ' + r.tex + ')' : ''));
  check(L.n === 5 && L.roofs.join() === 'e82_reed' && L.faces.join() === '0,1' && L.tall === 1, 'Stillwater Landing: ' + L.n + ' buildings under reed thatch, every window on the water side, the Bonded Store a storey taller');
  check(L.kinds.some((k) => /e82_porch:The lockkeeper/.test(k)) && L.kinds.some((k) => /e82_lucam:The Bonded/.test(k)) && L.kinds.some((k) => /e82_louvre:A cooperage/.test(k)) && L.litWho.length === 1 && /lockkeeper/.test(L.litWho[0]), 'the lockkeeper has his porch and the only lit windows, the Bonded Store its hoist-house, the cooperage its louvre');
  check(R.n === 8 && R.lit === 1 && /A loft/.test(R.litWho[0]) && R.tall >= 4 && R.styles.includes('hatch'), 'the Low Rings: ' + R.n + ' buildings, ' + R.tall + ' with an upper floor standing out of the water, every shutter closed and one window lit (' + R.litWho[0] + ')');
  check(C.n === 4 && C.kinds.length === 1 && /e82_strawram:The Bellwether/.test(C.kinds[0]) && C.walls > 20 && C.roofs.length === 1 && C.lit > 3, 'Wethercombe: ' + C.n + ' buildings under deep thatch, ' + C.walls + ' cells of yard wall that wear it too, a straw ram on the Bellwether');
  check(D.n === 0 && D.walls > 20 && D.on >= D.off + D.walls * 8 * 10, 'the Watch Downs: nothing roofed, and coping stones on ' + D.walls + ' cells of wall (' + D.off + ' -> ' + D.on + ' triangles)');
  check(K.n === 1 && K.roofs.join() === 'e82_marram' && K.kinds.some((k) => /e82_roped/.test(k)) && K.kinds.some((k) => /e82_drift/.test(k)) && K.lit >= 1 && K.faces.length >= 2, 'Driftwood Cay: Hesper\'s house under marram, roped down, a driftwood porch, the kitchen window lit');
  check(F.n === 0 && F.on > F.off + 1000 && F.dusk === 1, 'the Flume Road: the ribs (' + F.off + ' -> ' + F.on + ' triangles), and their beads light at dusk (one rebuild)');
  const all = [L, R, C, D, K, F];
  check(all.every((q) => q.untouched), 'no map is touched: every wall, lid and door is as it was');
  check([L, R, C, K].every((q) => q.shelter && q.on > q.off + 300 && q.dusk === 1) && all.every((q) => q.ms < 500), 'the rain stops at the new roofs, windows light at dusk with one rebuild, and every mesh builds in under half a second (' + all.map((q) => q.ms | 0).join(', ') + ' ms)');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
