// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/mounts84.test.js
// Phase 84, mounts and fast travel (js/mounts84.js; approved by the owner, 14 Nov 2026). This keeps true:
//   - three stables hire a pony; she is brought out where you hired her; X gets you up and down;
//   - riding is faster, higher and less tiring; she will not go onto planks, down the Pound Stair or indoors (she waits);
//     no shooting from the saddle; every third hard blow throws you; left alone she goes home after six hours; hounds
//     at night send her home and the ostler charges for the fright; when the hire ends she is gone;
//   - a milestone by every finger-post; walking past one marks it; the world map sends you to the ones you have marked;
//   - journeys go gate to gate along the roads, half the time riding; a journey that would run past dusk stops the night
//     about halfway; an ambush comes on the stretch where it happens;
//   - every new line has French.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
global.window = global.window || {};
const M = require(path.join(ROOT, 'js', 'mounts84.js'));
{
  const pairs = new Map();
  for (const line of fs.readFileSync(path.join(ROOT, 'tools', 'i18n', 'p84-mounts.tsv'), 'utf8').split('\n')) { if (!line.trim() || line[0] === '#') continue; const t = line.indexOf('\t'); if (t > 0) pairs.set(line.slice(0, t), line.slice(t + 1)); }
  const missing = M.TEXTS.filter((t) => !pairs.has(t));
  check(M.TEXTS.length >= 30 && !missing.length, 'every new line has French (' + M.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
}

(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP browser checks (no playwright)'); process.exit(fails ? 1 : 0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold('clear'); });

  // ---- the pony
  const a = await page.evaluate(() => {
    const out = {}, X = MOUNTS84, go = (id, x, y) => { closeModal(); loadMap(id, { x, y, dir: 0 }); G.state = 'play'; };
    out.stables = ['oakhaven', 'p22_combe', 'p79_road_w'].every((id) => G.maps[id].entities.some((e) => e && e.use === 'stable'));
    // hire at the Bellwether's yard
    G.tod = 0.4; G.player.gold = 100; const st = G.maps.p22_combe.entities.find((e) => e && e.use === 'stable'); go('p22_combe', st.x, st.y + 1.2);
    openStable(); out.title = document.querySelector('#modal-panel h2').textContent; document.getElementById('stable-rent').click();
    const p = X.pony(); out.hired = X.hired() && !!p && p.map === 'p22_combe' && p.home === 'p22_combe' && G.player.gold === 75;
    out.shown = G.ents.some((e) => e && e._p84pony);
    // up, and how she goes
    Engine.cam.x = p.x + 0.8; Engine.cam.y = p.y; X.getUp(); out.up = X.mounted() && !G.ents.some((e) => e && e._p84pony) && document.getElementById('p84-head').style.display === 'block';
    const fr = travelFreeNear(G.map, 30.5, 40.5); Engine.cam.x = fr[0]; Engine.cam.y = fr[1]; const x0 = Engine.cam.x; playerMove(Engine.cam, 0.1, 0); out.fast = Engine.cam.x - x0;
    G.state = 'play'; update(0.016); out.eye = Engine.cam.z - ((Number(G.player.feet) || 0) + 0.88);
    // no shooting from the saddle
    const cw = window.currentWeapon; window.currentWeapon = () => ({ ranged: true, ammo: 'bolts' }); G.player.bolts = 3; G.attack.t = 0; attack('shot'); out.noShot = G.player.bolts === 3; window.currentWeapon = cw;
    // thrown at the third hard blow
    G.player.hp = 500; damagePlayer(8); damagePlayer(8); out.stillUp = X.mounted(); damagePlayer(8); out.thrown = !X.mounted() && !!X.pony() && X.pony().map === 'p22_combe';
    // indoors: she waits at the door
    Engine.cam.x = X.pony().x; Engine.cam.y = X.pony().y; X.getUp(); out.reUp = X.mounted();
    go('p22_bellwether', 6.5, 8.4); out.door = !X.mounted() && X.pony().map === 'p22_combe';
    // planks, and the Pound Stair
    go('p22_combe', X.pony().x + 0.5, X.pony().y); X.getUp();
    go('p83_stride', G.maps.p83_stride.spawn.x, G.maps.p83_stride.spawn.y); out.rideOn = X.mounted() && X.pony().map === 'p83_stride';
    const m = G.maps.p83_stride, pl = m.floorTextures.indexOf('p17c_plank'); let pc = -1; for (let i = 0; i < m.floorCells.length; i++) if (m.floorCells[i] === pl) { pc = i; break; }
    const px = pc % m.w, py = (pc / m.w) | 0; Engine.cam.x = px + 0.5; Engine.cam.y = py - 0.6; const y0 = Engine.cam.y; const r = playerMove(Engine.cam, 0, 0.6); out.planks = Engine.cam.y === y0 && r.by;
    go('p83_poundstair', G.maps.p83_poundstair.spawn.x, G.maps.p83_poundstair.spawn.y); out.stair = !X.mounted() && X.pony().map === 'p83_stride';
    // left alone six hours: home
    G.tod += 7 / 24; X.tick(); out.home = X.pony().map === 'p22_combe' && X.pony().atHome;
    // hounds at night: she bolts, and the ostler charges
    go('p83_stride', G.maps.p83_stride.spawn.x, G.maps.p83_stride.spawn.y); G.tod = 0.95; const pp = X.pony(); pp.map = 'p83_hollows'; pp.x = 50; pp.y = 80; pp.atHome = false; pp.left = (Number(G.day) || 0) * 24 + G.tod * 24;
    X.tick(); out.fright = X.pony().fright === 1 && X.pony().map === 'p22_combe';
    G.tod = 0.4; go('p22_combe', st.x, st.y + 1.2); const g0 = G.player.gold; openStable(); out.charged = G.player.gold === g0 - 5; closeModal(); G.state = 'play';
    // the day ends
    G.player.horseUntil = 0; X.tick(); out.gone = !X.pony() && !G.ents.some((e) => e && e._p84pony);
    return out;
  });
  check(a.stables, 'three stables: the North Gate, the Bellwether\'s yard, the Long Common\'s pen');
  check(a.hired && a.shown && /Bellwether/.test(a.title), 'hired at the Bellwether\'s yard, the dun is brought out there (' + a.title + ')');
  check(a.up, 'X gets you up: she is under you, her head at the bottom of the view');
  check(a.fast > 0.16 && a.fast < 0.19 && Math.abs(a.eye - M.EYE) < 0.01, 'riding is about one and three-quarter times as fast, and a little higher (' + a.fast.toFixed(3) + ', +' + a.eye.toFixed(2) + ')');
  check(a.noShot, 'no shooting from the saddle');
  check(a.stillUp && a.thrown, 'the third hard blow throws you, and she stands where you fell');
  check(a.reUp && a.door, 'going indoors you leave her at the door');
  check(a.rideOn && a.planks && a.stair, 'she goes through the gates, but not onto planks or down the Pound Stair');
  check(a.home, 'left alone six hours, she goes home');
  check(a.fright && a.charged, 'hounds at night send her home, and the ostler charges 5 for the fright');
  check(a.gone, 'when the hire ends she is gone');

  // ---- milestones and the roads
  const b = await page.evaluate(() => {
    const out = {}, X = MOUNTS84, go = (id, x, y) => { closeModal(); loadMap(id, { x, y, dir: 0 }); G.state = 'play'; };
    let posts = 0, near = 0;
    for (const id in G.maps) { const m = G.maps[id]; if (!m.outdoor) continue; for (const e of m.entities) if (e && e._p82bPost) { posts++; if (m.entities.some((q) => q && q._p84mile === e._p82bPost && Math.hypot(q.x - e.x, q.y - e.y) < 1.6)) near++; } }
    out.miles = [posts, near];
    // walking past one marks it
    const hm = G.maps.p83_hollows.entities.find((e) => e && e._p84mile); go('p83_hollows', hm.x + 0.5, hm.y); G.map.visited[(hm.y | 0) * G.map.w + (hm.x | 0)] = 1; X.tick(); out.touched = X.touched(hm._p84mile);
    // the map sends you to it, along the roads
    go('flume_road', 3.5, 12.5); TRAVEL.region = 'reach'; TRAVEL.pace = 'cautious';
    const ds = travelDestinations('reach'), dm = ds.find((d) => d.mile === hm._p84mile); out.dest = !!dm && dm.state === 'ok';
    const sm = G.maps.p83_poundstair.entities.find((e) => e && e._p84mile); G.flags['p84m_' + sm._p84mile] = 1; G.maps.p83_poundstair.visited[0] = 1;
    const d2 = travelDestinations('reach').find((d) => d.mile === sm._p84mile); const r2 = X.route(d2);
    out.way = r2 ? r2.maps.filter((v, i, a) => a[i - 1] !== v).join('>') : 'none';
    const straight = Math.hypot(...['x', 'y'].map((k) => 0)); void straight;
    out.mins = travelMinutes(d2);
    G.player.horseUntil = (Number(G.day) || 0) * 24 + G.tod * 24 + 20; G.player.horseFrom = 'oakhaven'; G.player.p84 = { map: 'flume_road', x: Engine.cam.x, y: Engine.cam.y, mounted: true, left: 0, home: 'oakhaven' };
    out.minsRiding = travelMinutes(d2); G.player.horseUntil = 0; X.tick();
    // past dusk: the night halt about halfway
    go('oakhaven', G.maps.oakhaven.spawn.x, G.maps.oakhaven.spawn.y); const dh = travelDestinations('reach').find((d) => d.mile === hm._p84mile);
    const rh = X.route(dh); out.longWay = rh ? rh.maps.filter((v, i, a) => a[i - 1] !== v).join('>') : 'none';
    G.tod = 17.5 / 24; const mr = Math.random; Math.random = () => 0.999; G.state = 'play';
    travelGo(dh); out.halt = G.mapId !== 'p83_hollows' && rh.maps.includes(G.mapId);
    out.haltMap = G.mapId;
    // an ambush on the stretch where it happens
    go('oakhaven', G.maps.oakhaven.spawn.x, G.maps.oakhaven.spawn.y); G.tod = 0.35; G.state = 'play'; Math.random = () => 0.0001; TRAVEL.pace = 'reckless';
    const n0 = G.ents.filter((e) => e && e.kind === 'enemy').length; travelGo(dh); Math.random = mr;
    out.ambush = G.mapId !== 'p83_hollows' && G.map.outdoor && G.ents.filter((e) => e && e.kind === 'enemy' && e.state === 'chase').length >= 1;
    out.ambushMap = G.mapId; void n0;
    return out;
  });
  check(b.miles && b.miles[0] > 20 && b.miles[0] === b.miles[1], 'a milestone by every finger-post (' + b.miles.join(' of ') + ')');
  check(b.touched && b.dest, 'walking past a milestone marks it, and the world map can send you there');
  check(/flume_road>p83_stride>p83_poundstair/.test(b.way), 'the way goes along the roads, gate to gate (' + b.way + ')');
  check(b.minsRiding > 0 && b.minsRiding <= Math.ceil(b.mins * 0.55), 'riding, the road takes about half the time (' + b.mins + ' on foot, ' + b.minsRiding + ' riding)');
  check(/p83_wethers/.test(b.longWay) && b.halt, 'a journey that would run past dusk stops the night about halfway (' + b.longWay + '; stopped at ' + b.haltMap + ')');
  check(b.ambush, 'an ambush comes on the stretch where it happens (' + b.ambushMap + ')');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
