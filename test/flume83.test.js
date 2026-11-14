// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/flume83.test.js
// Phase 83, road 1 of the world plan: the Flume down to Stillwater, in two stretches (the Stride, the Pound Stair).
// This keeps true:
//   - the lane off the Flume Road now opens on the Stride, the Stride on the Pound Stair, the Stair on Stillwater Landing,
//     and back the same way; you can walk each stretch from its north gate to its south gate;
//   - the Flume's channel shows green after dark, the brook takes its fords in rain, the Stair's low road goes under in
//     rain and the bottom pound stands empty for a while after, showing its grating;
//   - the lengthsman's task: hum the Root at the three stuck gates top to bottom; out of order the gates reset and a stake
//     rings; done, the raft goes down and he pays once; knocking a stake makes noise;
//   - the four new gates have their finger-posts, the old posts moved to the new doors, and the travel chart still agrees;
//   - every new line has French, and nothing uses random numbers.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- no browser: the words, the French, no random numbers
global.window = global.window || {};
const F = require(path.join(ROOT, 'js', 'flume83.js'));
{
  const pairs = new Map();
  for (const line of fs.readFileSync(path.join(ROOT, 'tools', 'i18n', 'p83-flume.tsv'), 'utf8').split('\n')) { if (!line.trim() || line[0] === '#') continue; const t = line.indexOf('\t'); if (t > 0) pairs.set(line.slice(0, t), line.slice(t + 1)); }
  const missing = F.TEXTS.filter((t) => !pairs.has(t));
  check(F.TEXTS.length >= 57 && !missing.length, 'every new line has French (' + F.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  check(Array.from(pairs.values()).every((fr) => fr.trim().length > 0), 'no French line is empty');
  const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'story', 'fr.json'), 'utf8')), flat = JSON.stringify(fr);
  check(flat.includes('Escalier des Biefs') && flat.includes('Enjambée'), 'the French is merged into the story locale');
  check(!/Math\.random/.test(fs.readFileSync(path.join(ROOT, 'js', 'flume83.js'), 'utf8')), 'nothing in the Flume road uses random numbers');
  check(F.LOCKS === 16 && F.TASK_GATES.length === 3, 'sixteen locks, three of them stuck');
  check(F.FLUME.length === 2 && F.FLUME[0][0] !== F.FLUME[1][0] && F.FLUME[0][1] === 0, 'the Flume is one straight line across the Stride');
}

(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP browser checks (no playwright)'); console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => { window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; });

  // ---- the road is joined in, and walkable gate to gate
  const r = await page.evaluate(() => {
    const out = {}, S = FLUME83.STRIDE, P = FLUME83.STAIR, doors = (m) => { const d = []; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal) d.push({ x: i % m.w, y: (i / m.w) | 0, to: c.portal.map }); } return d; };
    out.maps = !!G.maps[S] && !!G.maps[P] && G.maps[S].outdoor && G.maps[P].outdoor;
    out.road = doors(G.maps.flume_road).some((d) => d.to === S) && !doors(G.maps.flume_road).some((d) => d.to === 'flume_landing');
    out.land = doors(G.maps.flume_landing).some((d) => d.to === P) && !doors(G.maps.flume_landing).some((d) => d.to === 'flume_road');
    const ds = doors(G.maps[S]), dp = doors(G.maps[P]);
    out.sDoors = ds.map((d) => d.to).filter((t) => t !== 'p85_dryflume').sort().join(',');
    // the Dry Flume's arch (Phase 85) is a door off the road, not a gate
    out.pDoors = dp.map((d) => d.to).sort().join(',');
    // walk from the north gate to the south gate with the game's own rule for blocked and too-steep ground
    const walk = (m) => {
      const W = m.w, H = m.h, steep = (x, y) => !!m.smooth && typeof MAX_GRADE !== 'undefined' && m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE;
      const ok = (x, y, fx, fy) => !m.isBlocked(x, y) && !(steep(x, y) && m.groundAt(x + 0.5, y + 0.5) > m.groundAt(fx + 0.5, fy + 0.5) + 0.02);
      const sp = m.spawn, seen = new Uint8Array(W * H), q = [(sp.y | 0) * W + (sp.x | 0)]; seen[q[0]] = 1;
      for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H || seen[Y * W + X] || !ok(X, Y, x, y)) continue; seen[Y * W + X] = 1; q.push(Y * W + X); } }
      return doors(m).every((d) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => { const X = d.x + dx, Y = d.y + dy; return X >= 0 && Y >= 0 && X < W && Y < H && seen[Y * W + X]; }));
    };
    out.walkS = walk(G.maps[S]); out.walkP = walk(G.maps[P]);
    // through the doors, both ways
    const via = (from, to) => { const c = G.maps[from].cells.find((c) => c && c.door && c.portal && c.portal.map === to); return c && c.portal; };
    out.chain = !!via('flume_road', S) && !!via(S, P) && !!via(P, 'flume_landing') && !!via('flume_landing', P) && !!via(P, S) && !!via(S, 'flume_road');
    // the travel chart and the finger-posts agree with the new road
    const rep = BEARINGS82B.report();
    out.onChart = [S, P].every((id) => rep.regions.reach && rep.regions.reach.places.includes(id));
    const mine = rep.pairs.filter((p) => [p.a, p.b].some((id) => id === S || id === P));
    out.agree = mine.length >= 2 && mine.every((p) => p.agrees) && !rep.direction.some((d) => /p83_/.test(d)) && !rep.overlaps.some((d) => /p83_/.test(d));
    out.unposted = rep.noPost.filter((u) => /p83_|flume/.test(u));
    const posts = (id) => G.maps[id].entities.filter((e) => typeof e.label === 'string' && /^A finger-post/.test(e.label)).length;
    out.posts = [posts(S), posts(P)];
    out.oldPostsMoved = ['flume_road', 'flume_landing'].every((id) => G.maps[id].entities.some((e) => typeof e.label === 'string' && /^A finger-post/.test(e.label)));
    return out;
  });
  check(r.maps, 'the Stride and the Pound Stair exist, out of doors');
  check(r.road && r.land, 'the lane off the Flume Road opens on the Stride, and Stillwater Landing\'s way up on the Pound Stair');
  check(r.sDoors === 'flume_road,' + 'p83_poundstair' && r.pDoors === 'flume_landing,p83_stride', 'each stretch has its two gates (' + r.sDoors + ' / ' + r.pDoors + ')');
  check(r.chain, 'the road runs Flume Road > Stride > Pound Stair > Landing, and back');
  check(r.walkS && r.walkP, 'each stretch can be walked from gate to gate');
  check(r.onChart && r.agree, 'both stretches lie on the travel chart, and their gates agree with the sides they leave by');
  check(r.posts[0] >= 2 && r.posts[1] >= 2 && !r.unposted.length && r.oldPostsMoved, 'a finger-post at every gate of the new road, and the old posts by the new doors' + (r.unposted.length ? ': ' + r.unposted.join(', ') : ''));

  // ---- the hour and the weather
  const w = await page.evaluate(() => {
    const out = {}, S = FLUME83.STRIDE, P = FLUME83.STAIR, go = (id) => { closeModal(); loadMap(id, { x: G.maps[id].spawn.x, y: G.maps[id].spawn.y, dir: 0 }); G.state = 'play'; };
    const fl = (id, x, y) => { const m = G.maps[id]; return m.floorTextures[m.floorCells[y * m.w + x]]; };
    Weather.hold('clear'); G.tod = 0.5; go(S); FLUME83.sync();
    out.dayGreen = G.ents.filter((e) => e && e._p83 === 'green').every((e) => e.hidden);
    G.tod = 0.95; FLUME83.sync();
    out.nightGreen = G.ents.filter((e) => e && e._p83 === 'green').length > 10 && G.ents.filter((e) => e && e._p83 === 'green').every((e) => !e.hidden);
    out.pierNight = G.ents.some((e) => e && e._p83 === 'pier' && /green light/.test(e.label));
    const ford = (G.map._p83.FORD || [])[0]; out.hasFord = !!ford;
    Engine.cam.x = 2.5; Engine.cam.y = 2.5;
    out.fordDry = ford && fl(S, ford[0], ford[1]) === 't_shallows';
    Weather.hold('rain'); FLUME83.sync(); out.fordWet = ford && fl(S, ford[0], ford[1]) === 't_water';
    out.plank = G.map.floorCells.some((v) => G.map.floorTextures[v] === 'p17c_plank');
    Weather.hold('clear'); FLUME83.sync();
    // the Stair walks in rain; afterwards the bottom pound stands empty a while and shows its grating
    G.tod = 0.5; go(P); Engine.cam.x = 2.5; Engine.cam.y = 2.5; const low = G.map._p83.LOW;
    out.lowDry = low.length > 20 && low.every(([x, y]) => fl(P, x, y) !== 't_water');
    Weather.hold('rain'); FLUME83.sync(); out.lowWet = low.every(([x, y]) => fl(P, x, y) === 't_water');
    out.grateHid = G.ents.find((e) => e && e._p83 === 'grate').hidden === true;
    Weather.hold('clear'); FLUME83.sync();
    const [x0, y0] = FLUME83.POUND(FLUME83.LOCKS - 1);
    out.drained = !!G.flags.p83_drained && fl(P, x0, y0) !== 't_water' && G.ents.find((e) => e && e._p83 === 'grate').hidden === false;
    G.day = (Number(G.day) || 0) + 1; FLUME83.sync();
    out.refilled = fl(P, x0, y0) === 't_water' && G.ents.find((e) => e && e._p83 === 'grate').hidden === true;
    out.lowBack = low.every(([x, y]) => fl(P, x, y) !== 't_water');
    return out;
  });
  check(w.dayGreen && w.nightGreen && w.pierNight, 'the Flume\'s channel shows green after dark, and only then');
  check(w.hasFord && w.fordDry && w.fordWet && w.plank, 'the brook comes up over its fords in rain, and the footbridges stay');
  check(w.lowDry && w.lowWet && w.lowBack, 'the Stair walks in rain: the low road goes under, and comes back after');
  check(w.grateHid && w.drained && w.refilled, 'after the surge the bottom pound stands empty a while and shows its grating, then fills');

  // ---- the lengthsman's task
  const t = await page.evaluate(() => {
    const out = {}, P = FLUME83.STAIR, at = (i) => { const e = G.ents.find((e) => e && e._p83 === 'tgate' && e._i === i); Engine.cam.x = e.x + 0.6; Engine.cam.y = e.y + 0.3; };
    Weather.hold('clear'); G.tod = 0.5; closeModal(); loadMap(P, { x: G.maps[P].spawn.x, y: G.maps[P].spawn.y, dir: 0 }); G.state = 'play';
    G.flags.p83_gates = 0; G.flags.p83_raft = 0; G.noise = 0;
    out.stuck = G.ents.filter((e) => e && e._p83 === 'tgate').length === 3;
    out.far = FLUME83.hummed() === false;
    at(1); out.wrong = FLUME83.hummed() === true && G.flags.p83_gates === 0 && G.noise >= 3;
    G.noise = 0; at(0); FLUME83.hummed(); at(1); FLUME83.hummed(); out.two = G.flags.p83_gates === 3 && G.flags.p83_raft === 0;
    const gold = G.player.gold; at(2); FLUME83.hummed();
    out.done = G.flags.p83_raft === 1 && G.flags.p83_gates === 7 && G.player.gold === gold + 8;
    FLUME83.sync(); const raft = G.ents.find((e) => e && e._p83 === 'raft');
    out.raftDown = raft.y > FLUME83.bandY(FLUME83.LOCKS - 2) && G.ents.filter((e) => e && e._p83 === 'tgate').every((e) => /open/.test(e.label));
    out.once = FLUME83.hummed() === false && G.player.gold === gold + 8;
    // the hum goes through the real song when sung beside a gate
    G.flags.p83_gates = 0; G.flags.p83_raft = 0; at(0);
    try { G.player.voice = 100; if (G.song) G.song.t = 0; castSong('root'); } catch (e) { out.songErr = String(e); }
    out.viaSong = G.flags.p83_gates === 1;
    G.flags.p83_gates = 7; G.flags.p83_raft = 1;
    // knocking a stake
    G.noise = 0; const st = G.ents.find((e) => e && e._p83 === 'stake'); st._rang = false; Engine.cam.x = st.x + 0.3; Engine.cam.y = st.y; FLUME83.sync();
    out.stake = G.noise >= 3;
    out.journal = typeof G.journal === 'undefined' || JSON.stringify(G.journal || {}).includes('Pound Stair');
    return out;
  });
  check(t.stuck && t.far, 'three gates stick, and humming away from them does nothing');
  check(t.wrong, 'humming a gate out of order resets them, and something rings');
  check(t.two && t.done, 'top, second, third: the raft goes down and the lengthsman pays');
  check(t.raftDown && t.once, 'the raft lies at the foot of the Stair, the gates stand open, and he pays only once');
  check(t.viaSong, 'singing the Root beside the top gate counts' + (t.songErr ? ' (' + t.songErr + ')' : ''));
  check(t.stake, 'knocking a mooring stake rings it, and that is noise');

  // ---- the people on the road
  const p = await page.evaluate(() => {
    const S = FLUME83.STRIDE, P = FLUME83.STAIR, names = (id) => { closeModal(); loadMap(id, { x: G.maps[id].spawn.x, y: G.maps[id].spawn.y, dir: 0 }); G.state = 'play'; return G.ents.filter((e) => e && e.kind === 'npc' && e._life).map((e) => { const d = typeof NPCS !== 'undefined' && NPCS[e.id]; return (d && d.name) || e._life; }); };
    G.tod = 10 / 24; const day = names(S); G.tod = 17.5 / 24; const eve = names(P);
    const foes = (id) => G.maps[id].entities.filter((e) => e && e.kind === 'enemy');
    const bad = [S, P].flatMap((id) => foes(id).filter((e) => !(typeof ENEMIES !== 'undefined' && !!ENEMIES[e.type] && !G.maps[id].isBlocked(Math.floor(e.x), Math.floor(e.y)))).map((e) => id + ':' + e.type + '@' + e.x.toFixed(1) + ',' + e.y.toFixed(1) + (ENEMIES[e.type] ? '' : '?'))), known = !bad.length;
    return { bad, foes: [foes(S).map((e) => e.type).join(','), foes(P).map((e) => e.type).join(',')], known, day, eve, gauger: day.some((n) => /gauger/.test(n)), length: eve.some((n) => /lengthsman/i.test(n)), hands: eve.filter((n) => /raft-hand/.test(n)).length };
  });
  check(/briarsprite/.test(p.foes[0]) && /miredrone/.test(p.foes[1]) && /hound/.test(p.foes[1]) && p.known, 'danger 1: briar-sprites in the verge, mire-drones in the pounds, hounds above the Stair (' + p.foes.join(' / ') + ')' + (p.bad.length ? ' bad: ' + p.bad.join(' ') : ''));
  check(p.gauger, 'a Synod gauger on the Stride by day' + (p.gauger ? '' : ' (' + p.day.join(', ') + ')'));
  check(p.length && p.hands >= 1, 'the lengthsman on the Stair, and raft-hands walking home in the evening' + (p.length && p.hands ? '' : ' (' + p.eve.join(', ') + ')'));

  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
