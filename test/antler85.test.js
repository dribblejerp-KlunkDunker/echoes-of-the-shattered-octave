// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/antler85.test.js
// Phase 85: the Antler Galleries, the flint-mine under the Hundred Hollows (js/antler85.js).
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
    const out = {}, A = ANTLER85, up = G.maps[A.UP], dp = G.maps[A.DEEP], H = G.maps[DROVE83.HOLLOWS];
    const bfs = (m) => { const W = m.w, Hh = m.h, dist = new Int32Array(W * Hh).fill(-1), q = [(m.spawn.y | 0) * W + (m.spawn.x | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= Hh || dist[j] >= 0 || m.isBlocked(nx, ny)) continue; dist[j] = dist[i] + 1; q.push(j); } } return (x, y) => dist[(y | 0) * W + (x | 0)]; };
    out.maps = !!up && !!dp && !up.outdoor && !dp.outdoor && up.siphoned && dp.siphoned;
    const ru = bfs(up), rd = bfs(dp);
    out.upRooms = Object.keys(A.UPR).filter((k) => { const [x0, y0, x1, y1] = A.UPR[k]; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ru(x, y) >= 0) return false; return true; }).join(',');
    out.deepRooms = Object.keys(A.DEEPR).filter((k) => { const [x0, y0, x1, y1] = A.DEEPR[k]; for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (rd(x, y) >= 0) return false; return true; }).join(',');
    out.niches = A.NICHES_UP.every(([x, y]) => ru(x, y) >= 0) && A.NICHES_DEEP.every(([x, y]) => rd(x, y) >= 0);
    out.gear = ['w_p85_pick', 'w_p85_knife'].every((id) => { const e = dp.entities.find((q) => q.item === id); return e && rd(e.x, e.y) >= 0; }) && dp.entities.concat(up.entities).filter((e) => e.item === 'cache').length === 2;
    // the forest: antler between the foot and the seam, but a way through it among the antler too (entities count here)
    const ant = dp.entities.filter((e) => /^p85_antler/.test(e.sprite)); out.forest = ant.length;
    const W = dp.w, blocked = (x, y) => dp.isBlocked(x, y) || ant.some((e) => Math.hypot(e.x - x - 0.5, e.y - y - 0.5) < e.radius + 0.3);
    const seen = new Uint8Array(W * dp.h), q = [2 * W + 20]; seen[q[0]] = 1; let found = false; for (let h = 0; h < q.length && !found; h++) { const i = q[h], x = i % W, y = (i / W) | 0; if (y >= 24 && x >= 27) found = true; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (seen[j] || blocked(nx, ny)) continue; seen[j] = 1; q.push(j); } }
    out.way = found;
    out.sprites = ['p85_antler', 'p85_antler2', 'p85_rooting', 'p85_pick', 'p85_niche', 'p85_nichelit'].every((s) => Engine.sprites[s]) && !!(Engine.textures && Engine.textures.t_p85_flint);
    // in: the open hollow's mouth on the drove road
    loadMap(DROVE83.HOLLOWS, { x: A.shaftTop().x, y: A.shaftTop().y, dir: 0 }); G.state = 'play'; update(0.016);
    const sh = G.ents.find((e) => e && e._p83d === 'shaft'); out.shaftUse = !!sh && sh.use === 'p85a_down';
    useDeco(sh); out.down = G.map.id === A.UP;
    // the lamp: dark to start; a niche fills and lights it; it burns down and goes out
    const msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    out.dark0 = A.oil() === 0;
    const n0 = G.ents.find((e) => e && e._p85a === 'niche' && e._i === 0); Engine.cam.x = n0.x + 0.6; Engine.cam.y = n0.y + 0.6; useDeco(n0); update(0.016);
    const lampE = G.ents.find((e) => e && e._p85lamp);
    out.lit = A.oil() > 80 && (G.flags.p85a_niches & 1) === 1 && n0.sprite === 'p85_nichelit' && !!lampE && !lampE.hidden && lampE.glow > 0.3;
    // stillness: with the lamp it creeps in at half the rate
    G.stillT = 0; G.noise = 0.5; for (let i = 0; i < 60; i++) { G.noise = 0.5; update(1 / 30); } const withLamp = G.stillT;
    A.setOil(0.05); update(0.1); out.out = A.oil() === 0 && msgs.some((t) => /lamp goes out/.test(t)) && lampE.hidden;
    G.stillT = 0; for (let i = 0; i < 60; i++) { G.noise = 0.5; update(1 / 30); } const noLamp = G.stillT;
    out.hush = noLamp > 0.5 && withLamp < noLamp * 0.8;
    G.stillT = 0;
    // down the ladder into the deep, the keeper in the den
    loadMap(A.DEEP, { x: 20.5, y: 2.6, dir: Math.PI / 2 }); G.state = 'play'; update(0.016);
    const k = G.ents.find((e) => e && e._p85a === 'keeper'); out.keeper = !!k && k.name === A.TX.keeper && k.hpMax === 130;
    Engine.cam.x = A.DEN[0] - 3; Engine.cam.y = A.DEN[1]; update(0.016); out.seen = G.flags.p85a_seen === 1;
    out.gearDefs = WEAPONS.p85_pick.blunt && WEAPONS.p85_knife.noise < WEAPONS.knife.noise && ITEMS.w_p85_knife.weapon === 'p85_knife';
    // and back up
    loadMap(A.UP, { x: 44.5, y: 33.6, dir: 0 }); const upDoor = (() => { const m = G.map; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === DROVE83.HOLLOWS) return c.portal; } return null; })();
    out.back = !!upDoor && !H.isBlocked(upDoor.x | 0, upDoor.y | 0);
    msg = _m;
    return out;
  });
  check(r.maps, 'two levels under the Hollows, both still enough for the Hush');
  check(r.upRooms === '' && r.deepRooms === '', 'every gallery is reached on foot (' + (r.upRooms + ' ' + r.deepRooms).trim() + ')');
  check(r.niches, 'every niche can be walked to');
  check(r.gear, 'the pick, the knife and two strongboxes lie where you can walk to them');
  check(r.forest >= 40 && r.way, 'a forest of antler in the deep (' + r.forest + '), with a way through it to the seam and the den');
  check(r.sprites, 'the antler, the picks, the niches and the floorstone are painted');
  check(r.shaftUse && r.down, 'the open hollow\'s mouth takes you down');
  check(r.dark0 && r.lit, 'you come down in the dark; a niche fills your lamp and lights it');
  check(r.out, 'the lamp burns down and goes out');
  check(r.hush, 'with the lamp lit, stillness creeps in more slowly');
  check(r.keeper && r.seen, 'the Flint-Back lies in the deepest gallery, and is told when you come near');
  check(r.gearDefs, 'the Antler Pick breaks armour; the Floorstone Knife is quieter than a carder\'s knife');
  check(r.back, 'the notches lead back up onto open ground in the Hollows');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
