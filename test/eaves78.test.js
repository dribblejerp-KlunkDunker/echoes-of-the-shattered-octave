// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/eaves78.test.js
// Phase 78 pilot, roofs and fronts: Oakhaven's houses get pitched roofs, gable ends, shuttered windows (3D renderer).
'use strict';
const path = require('path'), ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'js', 'eaves78.js'));
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- the planner, on a map made by hand (no browser)
const W = 30, H = 14, cells = new Array(W * H).fill(null), set = (x, y, c) => { cells[y * W + x] = c; };
const house = (x0, y0, x1, y1, wall, door, o = {}) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const edge = x === x0 || x === x1 || y === y0 || y === y1; set(x, y, edge ? { tex: wall } : { tex: o.lid || 't_roof', capTex: o.lid || 't_roof', top: o.top || 1.7 }); } if (door) set(door[0], door[1], { door: true }); };
house(2, 2, 8, 5, 't_house', [5, 5]);                    // 7 x 4, door on the south
house(11, 2, 13, 8, 't_wood', [11, 5]);                  // 3 x 7, door on the west
house(16, 2, 20, 6, 't_marble', [18, 6]);                // stone hall: not a house
house(23, 2, 27, 6, 't_house', null);                    // no door: not a house
house(2, 9, 6, 12, 't_house_p20b_2', [4, 12], { top: 3.2 });   // a tower inside: left alone
const p = E.plan({ id: 'oakhaven', w: W, h: H, cells });
check(p.houses.length === 2, 'two of the five buildings are houses (a stone hall, a doorless block and a tower are left alone): ' + p.houses.length);
const a = p.houses.find((h) => h.x0 === 2), b = p.houses.find((h) => h.x0 === 11);
check(a && a.axis === 'x' && b && b.axis === 'y', 'the ridge runs along the long side');
check(a && Math.abs(E.roofZ(a, 5.5, 4) - a.ridge) < 1e-9 && E.roofZ(a, 5.5, 2) < a.ridge && E.roofZ(a, 5.5, 2) > a.top, 'the roof is highest over the middle and stands above the wall top at the eaves');
check(a && a.ridge - a.top <= 2.2 && b.ridge - b.top <= 2.2, 'no roof rises more than about two storeys');
const onDoor = (h) => h.windows.some((w) => { const c = cells[w.y * W + w.x]; const n = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const q = cells[(w.y + dy) * W + w.x + dx]; return q && q.door; }); return !c || c.door || n; });
const corner = (h) => h.windows.some((w) => (w.x === h.x0 || w.x === h.x1) && (w.y === h.y0 || w.y === h.y1));
check(a && a.windows.length >= 4 && !onDoor(a) && !corner(a) && b.windows.length >= 3 && !onDoor(b) && !corner(b), 'windows: several a house, none on a door, beside a door or on a corner (' + (a && a.windows.length) + ', ' + (b && b.windows.length) + ')');
check(a && a.windows.every((w) => !cells[(w.y + w.ny) * W + w.x + w.nx]), 'every window looks onto open ground');
check(JSON.stringify(E.plan({ id: 'oakhaven', w: W, h: H, cells })) === JSON.stringify(p), 'the same map always gives the same houses and the same lit windows');

// ---- in the game
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
  const r = await page.evaluate(async () => {
    const out = {};
    const go = (id, tod) => { closeModal(); hide('#event'); loadMap(id, {}); G.state = 'play'; G.tod = tod; window.advanceTime(16); window.advanceTime(16); return R3D.mesh(); };
    const cellsBefore = JSON.stringify(G.maps.oakhaven.cells.map((c) => c && [c.tex, c.top, !!c.door]));
    out.active = R3D.active();
    GFX.eaves = false; R3D.invalidate(); const off = go('oakhaven', 0.5).tris;
    GFX.eaves = true; R3D.invalidate(); const onDay = go('oakhaven', 0.5).tris;
    out.off = off; out.on = onDay; out.houses = EAVES78.planOf(G.map).houses.length; out.windows = EAVES78.planOf(G.map).houses.reduce((n, h) => n + h.windows.length, 0);
    out.mapUntouched = JSON.stringify(G.maps.oakhaven.cells.map((c) => c && [c.tex, c.top, !!c.door])) === cellsBefore;
    out.ms = R3D.mesh().ms;
    // dusk: the mesh is rebuilt once so the windows light
    const builds0 = R3D.stats ? R3D.stats.meshBuilds : null; G.tod = 0.85; window.advanceTime(16); window.advanceTime(16); out.rebuiltAtDusk = builds0 == null ? null : R3D.stats.meshBuilds - builds0; window.advanceTime(16); out.thenSteady = builds0 == null ? null : R3D.stats.meshBuilds - builds0;
    // chimneys stand on the new roof; switch off, they go back
    const ch = G.ents.filter((e) => e._fs === 'chimney'); out.chimneys = ch.length; out.lifted = ch.filter((e) => e._e78).length;
    GFX.eaves = false; window.advanceTime(16); out.restored = ch.every((e) => !e._e78);
    GFX.eaves = true;
    // other maps are not touched by the pilot
    const m2 = go('whispergrove', 0.5); GFX.eaves = false; R3D.invalidate(); const m2off = go('whispergrove', 0.5); out.elsewhere = m2.tris === m2off.tris; GFX.eaves = true;
    out.switch = GFX.ART.includes('eaves');
    return out;
  });
  check(r.active, 'the 3D renderer is drawing');
  check(r.houses >= 20 && r.windows >= 60, "Oakhaven: " + r.houses + ' houses roofed, ' + r.windows + ' windows');
  check(r.on > r.off + r.houses * 12, 'the switch adds the roofs, gables and windows to the world (' + r.off + ' -> ' + r.on + ' triangles)');
  check(r.mapUntouched, 'the map itself is unchanged: walls, doors and heights are what the game still reads');
  check(r.ms < 400, 'building the town with its roofs takes ' + r.ms + ' ms, once');
  check(r.rebuiltAtDusk === null || (r.rebuiltAtDusk === 1 && r.thenSteady === 1), 'at dusk the windows light: one rebuild, then none');
  check(r.chimneys > 0 && r.lifted === r.chimneys && r.restored, 'the ' + r.chimneys + ' smoking chimneys stand on the new roofs, and go back when the switch is off (' + r.lifted + ' lifted)');
  check(r.elsewhere, 'other regions are not touched by the pilot');
  check(r.switch, 'Roofs, windows and eaves is an art switch');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
