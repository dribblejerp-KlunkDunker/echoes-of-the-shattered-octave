// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/lanes85.test.js
// Phase 85: the Sunk Lanes, the punt and Cross Pool (js/lanes85.js).
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
    const out = {}, L = LANES85, ln = G.maps[L.LANES], pl = G.maps[L.POOL], land = G.maps.flume_landing, rings = G.maps.flume_lowrings;
    const doors = (m) => { const d = []; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal) d.push({ x: i % m.w, y: (i / m.w) | 0, to: c.portal.map, p: c.portal }); } return d; };
    out.joined = doors(land).some((d) => d.to === L.LANES) && !doors(land).some((d) => d.to === 'flume_lowrings') && doors(rings).some((d) => d.to === L.LANES) && doors(rings).some((d) => d.to === L.POOL);
    out.lanesDoors = doors(ln).map((d) => d.to).sort().join(','); out.poolDoors = doors(pl).map((d) => d.to).sort().join(',');
    out.arrive = doors(ln).concat(doors(pl), doors(land), doors(rings)).filter((d) => d.to === L.LANES || d.to === L.POOL || ((d.to === 'flume_landing' || d.to === 'flume_lowrings') && (doors(ln).includes(d) || doors(pl).includes(d)))).every((d) => !G.maps[d.to].isBlocked(d.p.x | 0, d.p.y | 0));
    const bfs = (m, sx, sy, ok) => { const W = m.w, H = m.h, dist = new Int32Array(W * H).fill(-1), q = [(sy | 0) * W + (sx | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= H || dist[j] >= 0 || !ok(nx, ny)) continue; if (Math.abs((m.lvls ? m.lvls[j] : 0) - (m.lvls ? m.lvls[i] : 0)) > 0.36) continue; dist[j] = dist[i] + 1; q.push(j); } } return (x, y) => dist[(y | 0) * W + (x | 0)]; };
    const foot = (m) => (x, y) => !m.isBlocked(x, y), boat = (m) => (x, y) => !m.isSolidCell(x, y) && (m.floorCells[y * m.w + x] === 2 || m.floorCells[y * m.w + x] === 0);
    // on foot, the whole way, gate to gate
    const lf = bfs(ln, ln.w - 2, 18, foot(ln)); out.lanesWalk = lf(1, 18) > 0;
    const pf = bfs(pl, pl.w - 2, 40, foot(pl)); out.poolWalk = ['corn loft door', [8, 12], 'garret board', [10, 43], 'ladder', [36, 3]].filter((v) => Array.isArray(v)).every(([x, y]) => pf(x, y) >= 0);
    // by punt only: the shop-front's box, the cashbox and the buckler; not on foot
    const shop = L.SHOP, lb = bfs(ln, 84, 22, boat(ln)); out.shopPunt = lb(shop[0], shop[1]) >= 0 && lf(shop[0], shop[1]) < 0;
    const pb = bfs(pl, 45, 33, boat(pl)); out.crossPunt = pb(L.CASH[0], L.CASH[1]) >= 0 && pb(L.BUCKLER[0], L.BUCKLER[1]) >= 0 && pf(L.CASH[0], L.CASH[1]) < 0;
    out.kerbShut = pf(55, 8) < 0;
    // the punt-woman: a sovereign, the reed; the punt; the hook; the pole
    loadMap(L.LANES, { x: 86.5, y: 19.0, dir: 0 }); G.state = 'play'; update(0.016);
    const msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const woman = G.ents.find((e) => e && e.use === 'p85l_woman'), punt = G.ents.find((e) => e && e._p85l === 'punt');
    G.player.gold = 0; useDeco(woman); out.poor = G.flags.p85l_punt !== 1;
    useDeco(punt); out.notYours = !L.inPunt() && msgs.some((t) => /punt-woman's/.test(t));
    G.player.gold = 5; useDeco(woman); out.hired = G.flags.p85l_punt === 1 && G.flags.p85l_reed === 1 && G.player.gold === 4;
    Engine.cam.x = 84.5; Engine.cam.y = 20.4; useDeco(punt); out.inPunt = L.inPunt() && G.map.floorCells[Math.floor(Engine.cam.y) * G.map.w + Math.floor(Engine.cam.x)] === 2 && document.getElementById('p85-bow').style.display === 'block';
    const y0 = Engine.cam.y; playerMove(Engine.cam, 0, 0.4); out.poles = Engine.cam.y > y0 + 0.2;
    L.getOut(); out.out = !L.inPunt() && !G.map.isBlocked(Math.floor(Engine.cam.x), Math.floor(Engine.cam.y));
    // the reed on the weavers' row
    loadMap(L.POOL, { x: 30.5, y: 43.5, dir: Math.PI / 2 }); G.state = 'play'; update(0.016);
    const hook = G.ents.find((e) => e && e._p85l === 'reed' && e._i === L.BARE); useDeco(hook); update(0.016);
    out.hung = G.flags.p85l_reed === 2 && hook.sprite === 'p9p_doorreed';
    loadMap(L.LANES, { x: 86.5, y: 19.0, dir: 0 }); G.state = 'play'; update(0.016); useDeco(G.ents.find((e) => e && e.use === 'p85l_woman'));
    out.pole = G.flags.p85l_reed === 3 && G.player.inv.some((i) => i.id === 'w_p85_pole') && WEAPONS.p85_pole.reach > WEAPONS.spear.reach;
    out.buckler = ARMOR.a_p85_buckler.slot === 'shield' && ITEMS.a_p85_buckler.armor;
    // night: still and clear, the kerbs come up; storm: the drones come out
    loadMap(L.POOL, { x: 40.5, y: 9.5, dir: 0 }); G.state = 'play'; G.tod = 0.95; Weather.hold && Weather.hold('clear'); update(0.016);
    out.kerbs = !G.map.isBlocked(45, 9) && !G.map.isBlocked(52, 9) && msgs.length >= 0;
    const sunk = G.ents.find((e) => e && e._p85l === 'sunk'); out.lit = sunk.glow >= 0.4;
    G.tod = 0.5; update(0.016); out.kerbsDown = G.map.isBlocked(45, 9);
    Weather.hold && Weather.hold('storm'); update(0.016); out.storm = G.map.danger === 2 && G.ents.some((e) => e && e._p85l === 'storm' && !e.hidden);
    Weather.hold && Weather.hold('clear'); update(0.016);
    msg = _m;
    return out;
  });
  check(r.joined, 'the Landing and the Low Rings now open onto the Sunk Lanes, and the Low Rings onto Cross Pool');
  check(r.lanesDoors === 'flume_landing,flume_lowrings' && r.poolDoors === 'flume_lowrings', 'each new place has its own gates (' + r.lanesDoors + ' / ' + r.poolDoors + ')');
  check(r.arrive, 'every gate lands you on open ground');
  check(r.lanesWalk, 'the Lanes can be walked gate to gate: causeway, boards and roof-ridges, bank');
  check(r.poolWalk, 'in Cross Pool the corn loft, the weavers\' board and the Ladder\'s Foot are reached on foot');
  check(r.shopPunt, 'the drowned shop-front\'s box is reached by punt and not on foot');
  check(r.crossPunt, 'the cashbox and the buckler on the cross are reached by punt and not on foot');
  check(r.kerbShut, 'the kerb house cannot be reached by day');
  check(r.poor && r.notYours, 'no punt without a sovereign, and the punt is hers until then');
  check(r.hired, 'a sovereign hires it, and she gives you the reed');
  check(r.inPunt && r.poles && r.out, 'you get in, pole across deep water, and step out on dry ground');
  check(r.hung, 'the reed goes on the bare hook');
  check(r.pole && r.buckler, 'she gives you the Punt-Pole, longer than a spear; the buckler is a shield');
  check(r.kerbs && r.lit && r.kerbsDown, 'on a clear night the kerbs come up and the street under the water is lit; by day they go under');
  check(r.storm, 'in storm the drones come out and the danger rises');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
