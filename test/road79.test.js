// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/road79.test.js
// Phase 79 pilot, the long road: the Greenroot road is a place between Outside the Hedge and Greenroot, with something
// to find, someone to meet (and a small task), and something that only happens at night or in bad weather; and the
// road is not a straight line, through country with lakes, streams and cliffs in it.
'use strict';
const path = require('path');
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
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event');
    const out = {}, R = ROAD79, m = G.maps[R.MAP], W = m.w, H = m.h, cl = G.maps.clearing, gr = G.maps.greenroot;
    const door = (mm, t) => { for (let i = 0; i < mm.cells.length; i++) { const c = mm.cells[i]; if (c && c.door && c.portal && c.portal.map === t) return { x: i % mm.w, y: (i / mm.w) | 0, p: c.portal, label: c.label }; } return null; };
    const land = (p) => { const mm = G.maps[p.map]; return !mm.isBlocked(p.x | 0, p.y | 0); };
    const a = door(cl, R.MAP), b = door(gr, R.MAP), c = door(m, 'clearing'), d = door(m, 'greenroot');
    out.joined = !!(a && b && c && d) && !door(cl, 'greenroot') && !door(gr, 'clearing') && land(a.p) && land(b.p) && land(c.p) && land(d.p);
    out.same = !!c && !!d && Math.hypot(c.p.x - (a.x - 0.6), c.p.y - (a.y + 0.5)) < 1.5 && Math.hypot(d.p.x - (b.x + 1.6), d.p.y - (b.y + 0.5)) < 1.5;   // you come out where you went in
    // a walk as the game allows it: no water, no blocks, and no ground too steep to climb
    const g = (x, y) => m.groundAt(x + 0.5, y + 0.5), steep = (x, y) => m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE;
    const A = R.GW * W + 1, B = R.GE * W + W - 2;
    const bfs = () => { const dist = new Int32Array(W * H).fill(-1), q = [A]; dist[A] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (dist[j] >= 0 || m.isBlocked(X, Y) || (steep(X, Y) && g(X, Y) > g(x, y) + 0.02)) continue; dist[j] = dist[i] + 1; q.push(j); } } return dist; };
    const near = (dist, x, y) => { let best = -1; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = dist[((y | 0) + dy) * W + (x | 0) + dx]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    let dist = bfs(); out.dry = dist[B];
    const looks = () => m.entities.filter((e) => e.label && e.kind !== 'npc' && !e._flora);
    out.reach = looks().every((e) => near(dist, e.x, e.y) >= 0); out.things = looks().length;
    out.caches = m.entities.filter((e) => e.kind === 'item' && e.item === 'cache' && near(dist, e.x, e.y) >= 0).length;
    // the road is not a straight line
    const P = R.ROADPTS, p0 = P[0], p1 = P[P.length - 1], cx = p1[0] - p0[0], cy = p1[1] - p0[1], chord = Math.hypot(cx, cy); let len = 0, turn = 0, lo = 0, hi = 0;
    for (let i = 0; i + 1 < P.length; i++) { len += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); const off = ((P[i][0] - p0[0]) * cy - (P[i][1] - p0[1]) * cx) / chord; lo = Math.min(lo, off); hi = Math.max(hi, off);
      if (i > 0) { let t = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]) - Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]); while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI; turn += Math.abs(t); } }
    out.wind = { len: Math.round(len), chord: Math.round(chord), turn: Math.round(turn * 180 / Math.PI), lo: Math.round(lo), hi: Math.round(hi) };
    // the land: lakes, streams, cliffs, and no level ground
    const inE = (e, x, y) => ((x + 0.5 - e.x) / e.rx) ** 2 + ((y + 0.5 - e.y) / e.ry) ** 2 < 1; let mere = 0, tarn = 0, stream = 0, beck = 0, cliff = 0, rolling = 0, tilted = 0, n = 0, top = 0;
    for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { n++; const f = m.floorCells[y * W + x];
      if (f === 2) { if (inE(R.MERE, x, y)) mere++; else if (inE(R.TARN, x, y)) tarn++; else stream++; if (m.gradeAt(x + 0.5, y + 0.5) > 0.02) tilted++; }
      if (f === 3) beck++; if (steep(x, y)) cliff++; if (g(x, y) > 0.3) rolling++; top = Math.max(top, g(x, y)); }
    out.land = { mere, tarn, stream, beck, cliff, rolling: Math.round(100 * rolling / n), tilted, top: Math.round(top * 10) / 10 };
    out.up = [R.HANG, R.LITTLE, R.SHELF[0], R.SHELF[2]].map((k) => dist[(k.y | 0) * W + (k.x | 0)] + '/' + g(k.x | 0, k.y | 0).toFixed(1)).join(' ');
    out.crags = [R.HANG, R.LITTLE, R.SHELF[0], R.SHELF[2]].every((k) => dist[(k.y | 0) * W + (k.x | 0)] < 0 && g(k.x | 0, k.y | 0) > 3);          // nothing goes up them
    out.rockArt = !!Engine.textures.t_p79_crag && m.floorTextures.indexOf('t_p79_crag') > 0 && ['p79_fall0', 'p79_fall2', 'p79_spate1', 'p79_rock0', 'p79_rock1', 'p79_cairn'].every((k) => !!Engine.sprites[k]);
    // the hour and the weather
    loadMap(R.MAP, { x: 60.5, y: 30.5, dir: 0 }); G.state = 'play';
    const F = R.fordCells(), ent = (k) => G.ents.find((e) => e._p79 === k), fordCell = () => G.map.floorCells[F[0][1] * W + F[0][0]];
    G.tod = 0.45; Weather.hold('clear'); R.sync(); out.day = ent('fire').hidden === true && fordCell() === 3 && F.length >= 4;
    G.tod = 0.93; R.sync(); out.night = ent('fire').hidden === false; G.tod = 0.45; R.sync();
    G.tod = 0.93; update(1 / 60); out.byUpdate = ent('fire').hidden === false; G.tod = 0.45; update(1 / 60); out.byUpdate = out.byUpdate && ent('fire').hidden === true;   // the game's own update runs it, whichever renderer draws
    const frames = new Set(); for (let i = 0; i < 12; i++) { G.time = i / 12; R.sync(); frames.add(ent('fall').sprite); } out.falls = frames.size === 3 && [...frames].every((k) => /^p79_fall\d$/.test(k)) && /in one piece/.test(ent('leap').label);
    Weather.hold('rain'); R.sync(); out.flood = fordCell() === 2 && /over its banks/.test(ent('post').label) && /ringing/.test(ent('oak').label);
    out.spate = /^p79_spate\d$/.test(ent('fall').sprite) && /in spate/.test(ent('leap').label);
    dist = bfs(); out.wetCross = dist[B]; out.wetAll = looks().every((e) => near(dist, e.x, e.y) >= 0); out.wetLost = looks().filter((e) => near(dist, e.x, e.y) < 0).map((e) => e.sprite + '@' + e.x.toFixed(1) + ',' + e.y.toFixed(1)).join(' ');
    Weather.hold('clear'); R.sync(); out.ebb = fordCell() === 3;
    Engine.cam.x = F[0][0] + 0.5; Engine.cam.y = F[0][1] + 0.5; Weather.hold('rain'); R.sync(); out.notRoundYou = fordCell() === 3;
    Engine.cam.x = 60.5; Engine.cam.y = 30.5; R.sync(); out.thenFloods = fordCell() === 2; Weather.hold('clear'); R.sync();
    // the small task
    const st = ent('stone'), xp0 = G.player.xp, rnd = Math.random; let calls = 0; Math.random = function () { calls++; return rnd.call(Math); };
    out.down = st.use === 'p79_stone' && !G.flags.p79_stone && /on its face/.test(st.label);
    useDeco(st); out.up = G.flags.p79_stone === 1 && !st.use && /upright again/.test(st.label) && G.player.xp + G.player.level * 1e6 > xp0;
    for (let i = 0; i < 20; i++) R.sync(); R.buildRoad({ map: 'clearing', x: 1, y: 1, dir: 0 }, { map: 'greenroot', x: 1, y: 1, dir: 0 }); Math.random = rnd; out.noRandom = calls === 0;
    // the people stand on ground a person can stand on
    out.roster = R.ROSTER.map((p) => p.name + ': ' + p.day.filter((s) => s.job !== 'home').map((s) => s.from + '-' + s.to).join(','));
    out.posts = R.ROSTER.every((p) => p.day.filter((s) => s.at).every((s) => near(dist, s.at[0], s.at[1]) >= 0 && !m.isBlocked(s.at[0] | 0, s.at[1] | 0)));
    out.texts = R.TEXTS.length;
    return out;
  });
  check(r.joined && r.same, 'the road stands between the two doors: Outside the Hedge opens on its west gate, Greenroot on its east, and each gate leads out where the old door did');
  check(r.dry > 200, 'it takes a while: ' + r.dry + ' steps from gate to gate, where the old door was one step');
  check(r.wind.len > r.wind.chord * 1.2 && r.wind.turn > 360 && r.wind.lo < -15 && r.wind.hi > 15, 'the road is not a straight line: ' + r.wind.len + ' paces of road for ' + r.wind.chord + ' as the crow flies, ' + r.wind.turn + ' degrees of turning, and it swings ' + (-r.wind.lo) + ' paces to one side of the straight way and ' + r.wind.hi + ' to the other');
  check(r.land.mere > 400 && r.land.tarn > 60 && r.land.stream > 80 && r.land.beck > 20, 'lakes and streams: a mere (' + r.land.mere + ' cells of water), a tarn (' + r.land.tarn + '), a stream down to the mere (' + r.land.stream + ') and a beck you can splash through (' + r.land.beck + ')');
  check(r.land.cliff > 200 && r.crags && r.land.top > 5, 'cliffs: ' + r.land.cliff + ' cells of rock face too steep to climb, the tops ' + r.land.top + ' high, and nothing goes up the Hang, the Little Hang or the Shelf (' + r.up + ')');
  check(r.land.rolling >= 35 && r.land.tilted === 0, 'no level country: ' + r.land.rolling + '% of the ground is off the flat, and no water lies on a slope');
  check(r.rockArt, 'the rock, the boulders, the cairn and the falling water are painted here and loaded');
  check(r.reach && r.caches === 2 && r.things >= 14, 'something to find: ' + r.things + ' things to look at, all of them reachable on foot, a strongbox in the ruin and another on the eyot');
  check(r.roster.length === 2 && /7-12/.test(r.roster[0]) && /20-24/.test(r.roster[1]) && r.posts, 'someone to meet: a road-mender by day, a drover by night, each standing where a person can stand (' + r.roster.join(' | ') + ')');
  check(r.down && r.up, 'a small task: the half-way stone lies on its face until you set it up, once, and it is remembered');
  check(r.day && r.night && r.byUpdate, "only at night: the watch-fire by the ruin, lit and put out by the game's own update (so under either renderer)");
  check(r.falls, 'the Leap falls: three frames, run by the game clock');
  check(r.flood && r.ebb && r.spate, 'only in bad weather: the ford floods in rain, the Leap comes down in spate, the ford-post and the great oak say so, and the water falls again when the rain stops');
  check(r.wetCross >= r.dry && r.wetAll, 'the plank bridge is always there: with the ford flooded the road can still be crossed (' + r.wetCross + ' steps) and nothing is cut off' + (r.wetLost ? ' (lost: ' + r.wetLost + ')' : ''));
  check(r.notRoundYou && r.thenFloods, 'the water never rises round somebody standing in the ford: it waits until they are out');
  check(r.noRandom, "none of it draws on the game's random numbers (building the land included)");
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
