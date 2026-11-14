// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/dryflume85.test.js
// Phase 85: the Dry Flume, the dungeon under the Stride (js/dryflume85.js).
'use strict';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP (no playwright)'); process.exit(0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold && Weather.hold('clear');
    const out = {}, D = DRYFLUME85, m = G.maps[D.MAP], W = m.w, H = m.h, st = G.maps[FLUME83.STRIDE];
    const door = (mm, t) => { for (let i = 0; i < mm.cells.length; i++) { const c = mm.cells[i]; if (c && c.door && c.portal && c.portal.map === t) return { x: i % mm.w, y: (i / mm.w) | 0, p: c.portal }; } return null; };
    const down = door(st, D.MAP), up = door(m, FLUME83.STRIDE);
    out.doors = !!m && !!down && !!up && !m.isBlocked(down.p.x | 0, down.p.y | 0) && !st.isBlocked(up.p.x | 0, up.p.y | 0);
    // every room is reached on foot from the adit with the causeway dry
    const bfs = () => { const dist = new Int32Array(W * H).fill(-1), q = [(m.spawn.y | 0) * W + (m.spawn.x | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= H || dist[j] >= 0 || m.isBlocked(nx, ny)) continue; dist[j] = dist[i] + 1; q.push(j); } } return dist; };
    const reach = bfs(), at = (x, y) => reach[(y | 0) * W + (x | 0)];
    out.rooms = Object.keys(D.ROOMS).filter((k) => { const [x0, y0, x1, y1] = D.ROOMS[k]; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (reach[y * W + x] >= 0) return false; return true; }).join(',');
    const ents = m.entities;
    out.gear = ['w_p85_hook', 'a_p85_boots'].every((id) => { const e = ents.find((q) => q.item === id); return e && at(e.x, e.y) >= 0; }) && ents.filter((e) => e.item === 'cache').length === 2;
    out.keeper = ents.filter((e) => e._p85 === 'keeper').length === 1;
    out.foes = ents.filter((e) => e.kind === 'enemy').map((e) => e.type).sort().join(',');
    out.dark = m.ambient <= 0.1 && !m.outdoor && ents.filter((e) => e.sprite === 'p85_root' || e.sprite === 'p85_rootfall').length >= 5;
    out.sprites = ['p85_root', 'p85_rootfall', 'p85_wheel', 'p85_beam', 'p85_gallery', 'p85_sluice', 'p85_sluicedown', 'p85_bench', 'p85_column'].every((s) => Engine.sprites[s]);
    // in: the arch
    loadMap(D.MAP, { x: 5.5, y: 37.4, dir: -Math.PI / 2 }); G.state = 'play'; update(0.016);
    const keeper = G.ents.find((e) => e && e._p85 === 'keeper'); out.keeperSet = !!keeper && keeper.name === D.TX.keeper && keeper.hpMax === 150;
    // the sluice: walk under it and it comes down; wedge it first and it does not
    const msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    G.player.hp = 100; G.flags.p85_dropped = 0; G.flags.p85_wedged = 0; Engine.cam.x = D.SLUICE[0]; Engine.cam.y = D.SLUICE[1]; update(0.016);
    out.dropped = G.flags.p85_dropped === 1 && G.player.hp < 100 && msgs.some((t) => /sluice-gate comes down/.test(t));
    G.flags.p85_dropped = 0; const sl = G.ents.find((e) => e && e._p85 === 'sluice'); Engine.cam.x = D.SLUICE[0] - 1.6; update(0.016); useDeco(sl); const hp0 = G.player.hp; Engine.cam.x = D.SLUICE[0]; update(0.016);
    out.wedged = G.flags.p85_wedged === 1 && !G.flags.p85_dropped && G.player.hp === hp0;
    // the surge: the causeway goes under, whoever is on it is thrown onto the steps, and it comes up again
    const cw = G.map._p85.CW, mid = cw[Math.floor(cw.length / 2)], C = D.CYCLE();
    D.surge.t = 0; D.surge.phase = 'dry'; Engine.cam.x = mid[0] + 0.5; Engine.cam.y = mid[1] + 0.5; update(0.016);
    out.dryCross = !G.map.isBlocked(mid[0], mid[1]);
    D.tickSurge(C.dry + C.warn - D.surge.t + 0.1);
    out.flooded = D.surge.phase === 'flood' && G.map.isBlocked(mid[0], mid[1]) && !G.map.isBlocked(Math.floor(Engine.cam.x), Math.floor(Engine.cam.y)) && msgs.some((t) => /throws you onto the steps/.test(t));
    D.tickSurge(C.flood + 0.2); out.ebbed = D.surge.phase === 'dry' && !G.map.isBlocked(mid[0], mid[1]);
    // the keeper's chamber
    Engine.cam.x = 48.5; Engine.cam.y = 13.5; update(0.016); out.seen = G.flags.p85_seen === 1 && msgs.some((t) => /Standing Note|mire-drone grown/.test(t));
    // the gear: the hook pulls, the boots are silent in water
    out.hook = WEAPONS.p85_hook && WEAPONS.p85_hook.reach > WEAPONS.sword.reach && ITEMS.w_p85_hook.weapon === 'p85_hook';
    G.player.inv.push({ id: 'a_p85_boots', n: 1 }); equipArmor('a_p85_boots'); out.wearing = G.player.armor.feet === 'a_p85_boots';
    Engine.cam.x = 40.5; Engine.cam.y = 22.5; const nWater = armorNoise(); Engine.cam.x = 37.0; Engine.cam.y = 19.0; const nDry = armorNoise(); out.silent = nWater < nDry;
    out.gloves = !!ARMOR.a_p79_gloves && ITEMS.a_p79_gloves.armor === true;
    // the stair: unbolt, then up through the grating only when the pound stands empty
    const bolts = G.ents.find((e) => e && e._p85 === 'bolts'); Engine.cam.x = D.STAIR_TOP[0]; Engine.cam.y = D.STAIR_TOP[1] - 0.6;
    G.flags.p85_unbolted = 0; useDeco(bolts); out.unbolted = G.flags.p85_unbolted === 1;
    G.flags.p83_drained = 0; useDeco(bolts); out.underWater = G.map.id === D.MAP && msgs.some((t) => /Water stands on the grating/.test(t));
    G.flags.p83_drained = (Number(G.day) || 0) * 24 + G.tod * 24 - 1; useDeco(bolts); out.upTo = G.map.id;
    update(0.016); const gr = G.ents.find((e) => e && e._p83 === 'grate'); out.grateUse = !!gr && gr.use === 'p85_down';
    if (gr) useDeco(gr); out.backDown = G.map.id === D.MAP;
    msg = _m;
    return out;
  });
  check(r.doors, 'the arch on the Stride and the adit\'s steps lead to each other, onto open ground');
  check(r.rooms === '', 'every room is reached on foot from the adit (' + (r.rooms || 'all') + ')');
  check(r.gear, 'the hook, the boots and two strongboxes lie where you can walk to them');
  check(r.keeper && r.keeperSet, 'one keeper under the beam: the Standing Note, a mire-drone grown large');
  check(/fretcrawler/.test(r.foes) && /hushmoth/.test(r.foes) && /miredrone/.test(r.foes), 'crawlers in the silt, moths at the root, drones in the sump (' + r.foes + ')');
  check(r.dark, 'no lamps: the root is the light');
  check(r.sprites, 'every picture is painted');
  check(r.dropped, 'the sluice-gate comes down on whoever walks under it');
  check(r.wedged, 'wedged first, it stays up');
  check(r.dryCross, 'between surges the causeway is dry to walk');
  check(r.flooded, 'when the Flume draws breath the causeway goes under, and you are thrown onto the steps');
  check(r.ebbed, 'and the water goes down again');
  check(r.seen, 'the first time in the pump-hall, the keeper is told');
  check(r.hook, 'the Lengthsman\'s Hook reaches further than a sword');
  check(r.wearing && r.silent, 'Sluice-Boots are worn, and quieter in water than out of it');
  check(r.gloves, 'the Howe\'s Bearer\'s Gloves can be worn now');
  check(r.unbolted && r.underWater, 'the bolts slide back; with water on the grating it will not lift');
  check(r.upTo === 'p83_poundstair' && r.grateUse && r.backDown, 'with the pound empty you climb out into it, and the grating takes you back down (' + r.upTo + ')');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
