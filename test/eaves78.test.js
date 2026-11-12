// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/eaves78.test.js
// Phase 78, roofs and fronts: Oakhaven's buildings get pitched roofs, upper storeys, dormers, windows, the Greenhall's
// dome and the Chapel's open bell-frame (3D renderer), and the rain stops at the roofs. Port Cantabile builds its own
// way: slate, raised gables turned to the water, hoist beams, a bell-cote, iron shutters, pentices over the stair shops.
'use strict';
const path = require('path'), ROOT = path.join(__dirname, '..');
const E = require(path.join(ROOT, 'js', 'eaves78.js'));
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- the planner, on a map made by hand (no browser)
const W = 44, H = 24, cells = new Array(W * H).fill(null), set = (x, y, c) => { cells[y * W + x] = c; };
const house = (x0, y0, x1, y1, wall, door, label, o = {}) => {
  const along = (x1 - x0) >= (y1 - y0), ridge = along ? y0 + ((y1 - y0 + 1) >> 1) : x0 + ((x1 - x0 + 1) >> 1);
  for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const edge = x === x0 || x === x1 || y === y0 || y === y1; set(x, y, edge ? { tex: wall } : { tex: wall === 't_marble' ? 't_marble' : 't_roof', capTex: 't_roof', top: (along ? y === ridge : x === ridge) ? 1.7 : 1.35 }); }
  if (door) set(door[0], door[1], { door: true, tex: 't_door', label });
  for (const [x, y, top, cap] of (o.blocks || [])) set(x, y, { tex: wall, capTex: cap, top });
};
house(2, 2, 6, 5, 't_house', [4, 5], 'A shuttered house');                         // a cottage, 5 x 4
house(9, 2, 16, 6, 't_house', [12, 6], 'The Boar & Dulcimer');                      // the inn, 8 x 5
house(19, 2, 21, 8, 't_wood', [19, 5], 'A hay-barn');                               // a barn, 3 x 7
house(24, 2, 32, 6, 't_marble', [28, 6], 'The Greenhall', { blocks: [[28, 4, 2.1, 't_roof']] });
house(35, 2, 40, 7, 't_marble', [37, 7], 'The Chapel', { blocks: [[37, 3, 3.2, 't_stone'], [38, 3, 3.2, 't_stone'], [37, 4, 3.2, 't_stone'], [38, 4, 3.2, 't_stone']] });
house(2, 12, 6, 16, 't_house', null, '');                                           // no door: not a building
house(9, 12, 13, 16, 't_house', [11, 16], 'A house', { blocks: [[11, 14, 3.2, 't_stone']] });   // a tower in a timber house: left alone
const M = { id: 'oakhaven', w: W, h: H, cells }, p = E.plan(M), by = (re) => p.houses.find((b) => re.test(b.label));
const cot = by(/shuttered/), inn = by(/Boar/), barn = by(/barn/), hall = by(/Greenhall/), chap = by(/Chapel/);
check(p.houses.length === 5 && cot && inn && barn && hall && chap, 'five of the seven blocks are buildings (a doorless block and a timber house with a tower are left alone): ' + p.houses.length);
check(cot.storeys === 1 && cot.type === 'gable' && cot.axis === 'x' && !cot.plain && cot.dormers.length > 0, 'a cottage: one storey, a gabled roof along its long side, a dormer');
check(inn.storeys === 2 && inn.ridges === 2 && inn.jetty > 0 && inn.dormers.length >= 2 && inn.windows.some((w) => w.z0 > inn.top), 'the inn: a jettied upper storey with its own windows, a double-pile roof, dormers');
check(barn.plain && barn.storeys === 1 && barn.dormers.length === 0 && barn.windows.length > 0 && barn.windows.every((w) => w.style === 'hatch'), 'a barn stays plain: one storey, boarded hatches, no dormers, no attic window');
check(hall.stone && hall.type === 'hip' && hall.dome && hall.dome.x === 28 && hall.roofTex === 'e78_slate' && hall.windows.every((w) => w.style === 'hall'), 'the Greenhall: a hipped slate roof, tall windows, and its dome');
check(chap.church && chap.type === 'gable' && chap.axis === 'y' && chap.towers.length === 4 && chap.windows.some((w) => w.style === 'lancet'), 'the Chapel: a nave whose gable faces its door, lancet windows, its tower kept');
check(p.houses.filter((b) => !b.stone).every((b) => b.ridge < 2.8) && chap.ridge < 3.2 - 0.5 && hall.ridge < 2.8, 'the skyline: no ordinary ridge reaches the mooring mast (2.8), and the Chapel roof stays well under its tower (ridges ' + p.houses.map((b) => b.ridge.toFixed(2)).join(', ') + ')');
let poke = 0; for (const b of p.houses) for (let y = b.y0 + 1; y < b.y1; y++) for (let x = b.x0 + 1; x < b.x1; x++) { const c = cells[y * W + x]; if (c.top > 2) continue; for (let k = 0; k < 9; k++) { const z = E.roofZ(b, x + (k % 3) / 2, y + ((k / 3) | 0) / 2); if (z == null || z < c.top) poke++; } }
check(poke === 0, 'the whole of every old lid lies under its new roof');
check(Math.abs(E.roofZ(cot, 4.5, 4) - cot.ridge) < 1e-9 && E.roofZ(cot, 4.5, 2) >= cot.wallTop && E.roofZ(cot, 4.5, 0.5) === null, 'a roof is highest over the middle, clears the wall top at the wall, and ends at its eaves');
const ground = (b) => b.windows.filter((w) => w.z1 <= b.top + 0.3 && w.style !== 'attic');
const bad = p.houses.some((b) => ground(b).some((w) => { const x = Math.floor(w.cx - w.nx * 0.5), y = Math.floor(w.cy - w.ny * 0.5), c = cells[y * W + x]; return !c || c.door || [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => { const q = cells[(y + dy) * W + x + dx]; return q && q.door; }) || cells[Math.floor(w.cy + w.ny * 0.5) * W + Math.floor(w.cx + w.nx * 0.5)]; }));
check(!bad, 'ground-floor windows: none on a door, beside a door, or facing a wall');
check(JSON.stringify(E.plan(M)) === JSON.stringify(p), 'the same map always gives the same buildings and the same lit windows');
// the rain stops at the roofs
const s = E.shelter(M), at = (x, y) => s.data[Math.floor(y * s.k) * s.w + Math.floor(x * s.k)];
check(s && s.k === 4 && s.w === W * 4 && at(0.5, 0.5) < -5000, 'open ground is open to the rain');
check(Math.abs(at(4.6, 3.6) - E.roofZ(cot, 4.625, 3.625)) < 1e-6 && at(4.5, 1.85) > 0.5 && at(4.5, 1.4) < -5000, 'under a roof it does not rain, out to the edge of the eaves and no further');
check(at(2.5, 12.5) === 1 && E.shelter({ id: 'elsewhere', w: W, h: H, cells }) === null, 'nor inside a plain block; other regions are left to the old rule');

// ---- Port Cantabile has its own way of building (a region is told apart by its houses)
{
  const W2 = 32, H2 = 24, c2 = new Array(W2 * H2).fill(null), lv = new Float32Array(W2 * H2).fill(0.4), put = (x, y, c) => { c2[y * W2 + x] = c; };
  const quay = (x0, y0, x1, y1, wall, door, label, top) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const edge = x === x0 || x === x1 || y === y0 || y === y1; put(x, y, edge ? (top ? { tex: wall, top } : { tex: wall }) : { tex: 'p17c_slate', capTex: 'p17c_slate', top: (top || 1.4) + (x === ((x0 + x1) >> 1) ? 0.4 : 0.2) }); } put(door[0], door[1], { door: true, tex: 't_door', label }); };
  quay(2, 2, 6, 6, 'p17c_plaster', [4, 6], "One of Hesper's four houses. A row of small houses");
  quay(9, 2, 16, 7, 'p17c_plaster2', [12, 7], 'THE HARBOUR OFFICE. Dues, bench and bell.');
  quay(19, 2, 27, 8, 'p17c_ashlar', [23, 8], 'The counting-house door is shut', 4);
  for (const x of [3, 4, 5]) { put(x, 14, { tex: 'p17c_slate', capTex: 'p17c_slate', top: 5.4 + (x === 4 ? 0.2 : 0) }); put(x, 15, { tex: 'p17c_front' + (x === 3 ? '2' : ''), capTex: 'p17c_slate', top: 5.1 }); }
  put(9, 15, { tex: 'p17c_front3', capTex: 'p17c_slate', top: 5.1 });                         // a front with no slate behind it: left alone
  for (const x of [10, 11, 12]) put(x, 19, { tex: 'p17c_cliff', top: 3 });
  put(10, 20, { tex: 'p17c_plaster' }); put(11, 20, { door: true, tex: 't_door', label: "The chandler's" }); put(12, 20, { tex: 'p17c_plaster2' });
  const MC = { id: 'cantabile_harbour', w: W2, h: H2, cells: c2, lvls: lv, relief: true }, pc = E.plan(MC), hb = (re) => pc.houses.find((b) => re.test(b.label));
  const hes = hb(/Hesper/), off = hb(/OFFICE/), cnt = hb(/counting/), clf = pc.houses.find((b) => b.cliff);
  check(pc.houses.length === 4 && hes && off && cnt && clf, 'Port Cantabile: a quay house, the Harbour Office, the counting-house and a cliff house (' + pc.houses.length + ' buildings)');
  check(pc.houses.every((b) => b.type === 'gable' && b.roofTex === 'p17c_slate' && b.jetty === 0 && b.dormers.length === 0 && b.parapet > 0 && b.over < 0.1), 'every roof is slate, with raised stone-capped gables and clipped eaves: no thatch, no jetties, no dormers');
  check(hes.axis === 'y' && off.axis === 'y' && cnt.axis === 'y' && clf.axis === 'y', 'the gable is turned to the door and the water');
  check(hes.extras.some((e) => e.kind === 'hoist' && e.ny === 1) && hes.windows.some((w) => w.style === 'loft') && hes.windows.filter((w) => w.style === 'cottage').every((w) => w.shut === 'blue'), 'a quay house: a loft door and a hoist beam in the seaward gable, sea-blue shutters');
  check(off.extras.some((e) => e.kind === 'bellcote') && !off.extras.some((e) => e.kind === 'hoist'), 'the Harbour Office ("Dues, bench and bell") has a bell-cote, not a hoist');
  check(cnt.stone && cnt.pitch < hes.pitch && cnt.windows.length > 8 && cnt.windows.every((w) => w.style === 'iron' && !w.lit) && !cnt.stacks.length && !cnt.extras.length, 'the counting-house ("square stone, a slate roof, iron shutters"): shuttered in iron, never lit, no chimney, no hoist');
  check(clf.w === 3 && clf.h === 2 && clf.ext > 0 && clf.zBase > 5.6 && clf.wallTex === 'p17c_plaster2' && clf.windows.length === 1, 'a run of painted fronts is one cliff house: an upper wall clears its old lid, and a gable with one small window');
  let poke2 = 0; for (const b of pc.houses) for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const c = c2[y * W2 + x]; if (!c || c.door || c.top == null) continue; for (let k = 0; k < 9; k++) { const z = E.roofZ(b, x + (k % 3) / 2, y + ((k / 3) | 0) / 2); if (z == null || z < c.top) poke2++; } }
  check(poke2 === 0, 'on a cliff a wall top is where the map puts it, and every old lid still lies under its new roof');
  check(pc.shops.length === 1 && pc.shops[0].ny === 1 && Math.abs(pc.shops[0].z - 1.4) < 1e-6, 'a shop door let into a wall gets a slate pentice over the shop-front');
  check(JSON.stringify(E.plan(MC)) === JSON.stringify(pc), 'the same harbour always gives the same buildings');
  const sc = E.shelter(MC), a2 = (x, y) => sc.data[Math.floor(y * sc.k) * sc.w + Math.floor(x * sc.k)];
  check(a2(21.5, 5.5) > 4 && a2(21.5, 5.5) < 6, 'rain: the counting-house roof is at its own height on the cliff (' + a2(21.5, 5.5).toFixed(2) + '), not its height plus the ground');
  check(a2(11.5, 21.2) > 1.3 && a2(11.5, 22.5) < -5000 && a2(4.5, 15.5) > 5.6, 'nor does it rain under a pentice or a cliff house roof');
  check(E.STYLES.oakhaven && E.STYLES.cantabile_harbour && E.STYLES.cantabile_harbour.only.length >= 2 && E.MAPS.has('cantabile_harbour'), 'each region lists what only it has');
}

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
    const P = EAVES78.planOf(G.map).houses;
    out.off = off; out.on = onDay; out.n = P.length; out.windows = P.reduce((n, h) => n + h.windows.length, 0);
    out.two = P.filter((b) => b.storeys === 2).map((b) => b.label); out.plain = P.filter((b) => b.plain).length; out.dormers = P.reduce((n, b) => n + b.dormers.length, 0);
    out.hall = P.some((b) => /Greenhall/.test(b.label) && b.dome); out.chapel = P.some((b) => /Chapel/.test(b.label) && b.church && b.towers.length === 4);
    out.roofs = Array.from(new Set(P.map((b) => b.roofTex))).sort(); out.highest = Math.max(...P.filter((b) => !b.stone).map((b) => b.ridge));
    out.mapUntouched = JSON.stringify(G.maps.oakhaven.cells.map((c) => c && [c.tex, c.top, !!c.door])) === cellsBefore;
    out.ms = R3D.mesh().ms;
    // dusk: the mesh is rebuilt once so the windows light
    const builds0 = R3D.stats.meshBuilds; G.tod = 0.85; window.advanceTime(16); window.advanceTime(16); out.rebuiltAtDusk = R3D.stats.meshBuilds - builds0; window.advanceTime(16); out.thenSteady = R3D.stats.meshBuilds - builds0;
    // chimneys stand on the new stacks; switch off, they go back
    const ch = G.ents.filter((e) => e._fs === 'chimney'); out.chimneys = ch.length; out.lifted = ch.filter((e) => e._e78).length;
    GFX.eaves = false; window.advanceTime(16); out.restored = ch.every((e) => !e._e78 && e.scale === 0.55);
    GFX.eaves = true; window.advanceTime(16);
    // rain: the renderer is given the roof heights
    G.tod = 0.5; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('rain'); UPG.weather = 'rain'; for (let i = 0; i < 4; i++) window.advanceTime(16);
    out.rain = !!(LIGHT21.shelter && LIGHT21.shelter().tex && LIGHT21.shelter().src === EAVES78.shelter(G.map)); out.wx = Weather.state;
    if (Weather.hold) Weather.hold('clear'); UPG.weather = 'clear';
    // other maps are not touched
    const m2 = go('whispergrove', 0.5); GFX.eaves = false; R3D.invalidate(); const m2off = go('whispergrove', 0.5); out.elsewhere = m2.tris === m2off.tris; GFX.eaves = true;
    out.switch = GFX.ART.includes('eaves');
    // Port Cantabile
    const before2 = JSON.stringify(G.maps.cantabile_harbour ? G.maps.cantabile_harbour.cells.map((c) => c && [c.tex, c.top, !!c.door]) : 0);
    GFX.eaves = false; R3D.invalidate(); const cOff = go('cantabile_harbour', 0.5).tris; GFX.eaves = true; R3D.invalidate(); const cOn = go('cantabile_harbour', 0.5);
    const PC = EAVES78.planOf(G.map);
    out.c = { off: cOff, on: cOn.tris, ms: cOn.ms, quay: PC.houses.filter((b) => !b.cliff && !b.stone).length, stone: PC.houses.filter((b) => b.stone).map((b) => b.label.slice(0, 18)), cliff: PC.houses.filter((b) => b.cliff).length, shops: PC.shops.length,
      hoists: PC.houses.filter((b) => b.extras.some((e) => e.kind === 'hoist')).length, bell: PC.houses.filter((b) => b.extras.some((e) => e.kind === 'bellcote')).map((b) => b.label.slice(0, 18)),
      roofs: Array.from(new Set(PC.houses.map((b) => b.roofTex))), tex: !!(Engine.textures.e78_cope && Engine.textures.e78_lime && Engine.textures.e78_shutter_blue),
      untouched: JSON.stringify(G.map.cells.map((c) => c && [c.tex, c.top, !!c.door])) === before2 || before2 === '0', shelter: !!EAVES78.shelter(G.map) };
    return out;
  });
  check(r.active, 'the 3D renderer is drawing');
  check(r.n >= 31 && r.windows >= 150, 'Oakhaven: ' + r.n + ' buildings roofed, ' + r.windows + ' windows, ' + r.dormers + ' dormers');
  check(r.two.length >= 4 && r.two.some((l) => /Boar/.test(l)) && r.two.some((l) => /mill/.test(l)) && r.plain >= 5, 'upper storeys on the big houses (' + r.two.join('; ') + '); ' + r.plain + ' barns, sheds and stores stay plain');
  check(r.hall && r.chapel, 'the Greenhall has its dome and the Chapel its tower');
  check(r.roofs.includes('e78_slate') && r.roofs.includes('e78_thatch') && r.highest < 2.8, 'thatch and slate (' + r.roofs.join(', ') + '); the highest ordinary ridge is ' + r.highest.toFixed(2) + ', under the mast');
  check(r.on > r.off + r.n * 20, 'the switch adds the new shapes to the world (' + r.off + ' -> ' + r.on + ' triangles)');
  check(r.mapUntouched, 'the map itself is unchanged: walls, doors and heights are what the game still reads');
  check(r.ms < 400, 'building the town with its roofs takes ' + r.ms + ' ms, once');
  check(r.rebuiltAtDusk === 1 && r.thenSteady === 1, 'at dusk the windows light: one rebuild, then none');
  check(r.chimneys > 0 && r.lifted === r.chimneys && r.restored, 'the ' + r.chimneys + ' smoking chimneys stand on brick stacks, and go back when the switch is off (' + r.lifted + ' lifted)');
  check(r.rain, 'in the rain the renderer is given the roof heights (weather: ' + r.wx + ')');
  check(r.elsewhere, 'other regions are not touched');
  check(r.switch, 'Roofs, windows and eaves is an art switch');
  check(r.c.quay === 5 && r.c.hoists === 4 && r.c.bell.length === 1 && /HARBOUR OFFICE/.test(r.c.bell[0]) && r.c.stone.length === 1 && /counting/.test(r.c.stone[0]), "Port Cantabile's quay: Hesper's four houses each with a hoist, the Harbour Office with its bell-cote, the counting-house in stone");
  check(r.c.cliff >= 40 && r.c.shops === 5 && r.c.roofs.length === 1 && r.c.roofs[0] === 'p17c_slate', r.c.cliff + ' cliff houses gabled, ' + r.c.shops + ' stair shops under pentices, every roof slate');
  check(r.c.on > r.c.off + 2000 && r.c.untouched && r.c.tex && r.c.shelter && r.c.ms < 400, 'the harbour: ' + r.c.off + ' -> ' + r.c.on + ' triangles in ' + r.c.ms + ' ms, the map unchanged, rain stops at its roofs');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
