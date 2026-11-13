// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/road79b.test.js
// Phase 79: the Greenroot road made three stretches long (js/road79b.js): the Long Common and Greenroot Wood, the
// travellers who walk all three, the old places off the road and what is in them, and the two small tasks.
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
    const out = {}, R = ROAD79, B = ROAD79B, cl = G.maps.clearing, gr = G.maps.greenroot, ids = [B.WEST, B.MID, B.EAST];
    const door = (mm, t) => { for (let i = 0; i < mm.cells.length; i++) { const c = mm.cells[i]; if (c && c.door && c.portal && c.portal.map === t) return { x: i % mm.w, y: (i / mm.w) | 0, p: c.portal }; } return null; };
    // the chain: Outside the Hedge, the Long Common, the middle, Greenroot Wood, Greenroot; and back
    const chain = ['clearing'].concat(ids, ['greenroot']);
    out.chain = chain.every((id, i) => (i === 0 || !!door(G.maps[id], chain[i - 1])) && (i === chain.length - 1 || !!door(G.maps[id], chain[i + 1])));
    out.lands = chain.every((id, i) => [chain[i - 1], chain[i + 1]].filter(Boolean).every((t) => { const d = door(G.maps[id], t), mm = G.maps[t]; return !mm.isBlocked(d.p.x | 0, d.p.y | 0); }));
    const sp = { [B.WEST]: B.SPW, [B.EAST]: B.SPE, [B.MID]: { gw: R.GW, ge: R.GE, road: R.ROADPTS } };
    const walkOf = (m) => { const W = m.w, H = m.h, g = (x, y) => m.groundAt(x + 0.5, y + 0.5), steep = (x, y) => m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE;
      return (from) => { const dist = new Int32Array(W * H).fill(-1), q = [from]; dist[from] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (dist[j] >= 0 || m.isBlocked(X, Y) || (steep(X, Y) && g(X, Y) > g(x, y) + 0.02)) continue; dist[j] = dist[i] + 1; q.push(j); } } return dist; }; };
    const near = (m, dist, x, y) => { let best = -1; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = dist[((y | 0) + dy) * m.w + (x | 0) + dx]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    out.st = {}; let total = 0;
    for (const id of ids) { const m = G.maps[id], S = sp[id], W = m.w, H = m.h, dist = walkOf(m)(S.gw * W + 1), o = {};
      o.steps = dist[S.ge * W + W - 2]; total += o.steps;
      const P = S.road, p0 = P[0], p1 = P[P.length - 1], cx = p1[0] - p0[0], cy = p1[1] - p0[1], chord = Math.hypot(cx, cy); let len = 0, turn = 0;
      for (let i = 0; i + 1 < P.length; i++) { len += Math.hypot(P[i + 1][0] - P[i][0], P[i + 1][1] - P[i][1]); if (i > 0) { let t = Math.atan2(P[i + 1][1] - P[i][1], P[i + 1][0] - P[i][0]) - Math.atan2(P[i][1] - P[i - 1][1], P[i][0] - P[i - 1][0]); while (t > Math.PI) t -= 2 * Math.PI; while (t < -Math.PI) t += 2 * Math.PI; turn += Math.abs(t); } }
      o.len = Math.round(len); o.chord = Math.round(chord); o.turn = Math.round(turn * 180 / Math.PI);
      let water = 0, cliff = 0, rolling = 0, tilted = 0, n = 0;
      for (let y = 1; y < H - 1; y++) for (let x = 1; x < W - 1; x++) { n++; const f = m.floorCells[y * W + x]; if (f === 2) { water++; if (m.gradeAt(x + 0.5, y + 0.5) > 0.02) tilted++; } if (m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE) cliff++; if (m.groundAt(x + 0.5, y + 0.5) > 0.3) rolling++; }
      o.water = water; o.cliff = cliff; o.rolling = Math.round(100 * rolling / n); o.tilted = tilted;
      const looks = m.entities.filter((e) => e.label && e.kind !== 'npc' && !e._flora); o.things = looks.length; o.reach = looks.every((e) => near(m, dist, e.x, e.y) >= 0);
      o.caches = m.entities.filter((e) => e.item === 'cache' && near(m, dist, e.x, e.y) >= 0).length;
      const foes = m.entities.filter((e) => e.kind === 'enemy'), rn = (x, y) => { let b = 1e9; for (let i = 0; i + 1 < P.length; i++) { const [ax, ay] = P[i], [bx, by] = P[i + 1], L2 = (bx - ax) ** 2 + (by - ay) ** 2, t = Math.max(0, Math.min(1, ((x - ax) * (bx - ax) + (y - ay) * (by - ay)) / L2)); b = Math.min(b, Math.hypot(x - ax - (bx - ax) * t, y - ay - (by - ay) * t)); } return b; };
      o.foes = foes.map((e) => e.type).sort().join(','); o.foesOff = foes.every((e) => rn(e.x, e.y) > 10 && near(m, dist, e.x, e.y) >= 0);
      o.traps = m.entities.filter((e) => e.use === 'trap').length; o.danger = m.danger;
      out.st[id] = o; }
    out.total = total; out.mid = out.st[B.MID].steps;
    // the travellers: who is on the road on which day, and that they keep to it
    const who = (id, day, h) => { G.day = day; G.tod = h / 24; loadMap(id, {}); G.state = 'play'; for (let i = 0; i < 4; i++) update(1 / 30); return G.ents.filter((e) => e.kind === 'npc' && e._life && !e.hidden).map((e) => e._life).sort().join(','); };
    out.who = { w0: who(B.WEST, 0, 8.5), w1: who(B.WEST, 1, 15.5), w2: who(B.WEST, 2, 8.5), m0: who(B.MID, 0, 12), m1: who(B.MID, 1, 12.5), e1: who(B.EAST, 1, 9.5), e2n: who(B.EAST, 2, 22) };
    G.day = 1; G.tod = 14.97 / 24; loadMap(B.WEST, { x: 150.5, y: 62.5, dir: 0 }); G.state = 'play';
    const m = G.map, band = () => G.ents.filter((e) => e._life && /^rd_band/.test(e._life)); let onRoad = true, wetFeet = false, moved = 0; const x0 = band().map((e) => e.x);
    for (let i = 0; i < 2400; i++) { update(1 / 30); G.tod = Math.min(G.tod, 15.9 / 24); if (i % 20 === 0) for (const e of band()) { if (e.hidden) continue; const ci = (e.y | 0) * m.w + (e.x | 0); if (!m._p79walk[ci]) onRoad = false; if (m.floorCells[ci] === 2) wetFeet = true; } }
    band().forEach((e, i) => { moved = Math.max(moved, Math.abs(e.x - x0[i])); }); out.band = { onRoad, wetFeet, moved: Math.round(moved), shown: band().filter((e) => !e.hidden).length };
    // the Long Common: the oil-can, the lamp, the Ringing Stand
    const ent = (k) => G.ents.find((e) => e._p79b === k), rnd = Math.random; let calls = 0;
    G.day = 2; G.tod = 0.45; Weather.hold('clear'); loadMap(B.WEST, { x: 60.5, y: 46.5, dir: 0 }); G.state = 'play'; G.flags.p79_lamp = 0; B.sync(0);
    const lamp = ent('lamp'), can = ent('can'), xp0 = G.player.xp + G.player.level * 1e6;
    out.lampDry = lamp.use === 'p79_lamp' && !lamp.glow && /dry/.test(lamp.label); useDeco(lamp); out.lampNeeds = !G.flags.p79_lamp;
    useDeco(can); out.canTaken = G.flags.p79_lamp === 1 && can.hidden === true; useDeco(lamp); out.lampFilled = G.flags.p79_lamp === 2 && !lamp.use && G.player.xp + G.player.level * 1e6 > xp0 && !lamp.glow;
    G.tod = 0.93; update(1 / 60); out.lampNight = lamp.glow > 0.05 && /burning/.test(lamp.label); G.tod = 0.45; update(1 / 60); out.lampDay = !lamp.glow;
    const counted = (fn) => { Math.random = function () { calls++; return rnd.call(Math); }; try { fn(); } finally { Math.random = rnd; } };
    const ring = ent('ring'); Engine.cam.x = G.player.x = B.STAND.x + 2; Engine.cam.y = G.player.y = B.STAND.y + 2; G.noise = 0; counted(() => { for (let i = 0; i < 30; i++) B.sync(1 / 30); }); out.standCalm = G.noise < 0.01 && !/tolling/.test(ring.label);
    Weather.hold('storm'); counted(() => { for (let i = 0; i < 30; i++) B.sync(1 / 30); }); out.standTolls = G.noise > 2.5 && /tolling/.test(ring.label);
    Engine.cam.x = 60.5; Engine.cam.y = 46.5; G.noise = 0; for (let i = 0; i < 30; i++) B.sync(1 / 30); out.standFar = G.noise < 0.01; Weather.hold('clear'); B.sync(0);
    // the fantasy element on each: glass in the Delph that lights at night, the Bell Oak, the old reed-row
    const gl = G.ents.filter((e) => /^p79_glass/.test(e.sprite || '')); G.tod = 0.45; B.sync(0); const dayLight = gl[0].lightCol[1];
    G.tod = 0.93; B.sync(0); out.glass = gl.length >= 8 && gl.every((e) => e.glow > 0.2 && e.lightCol[1] > dayLight) && /alight/.test(gl[0].label) && !!Engine.sprites.p79_glass0.emit; G.tod = 0.45; B.sync(0);
    out.bellOak = ring.scale >= 5 && G.ents.filter((e) => e.sprite === 'oak' && Math.hypot(e.x - B.STAND.x, e.y - B.STAND.y) < 9).length >= 10;
    out.reedrow = G.maps[B.EAST].entities.filter((e) => e.sprite === 'p79_reedrow').length;
    out.grown = B.K;
    // Greenroot Wood: the moths, the field-book
    loadMap(B.EAST, { x: B.CAMP.x, y: B.CAMP.y + 2, dir: 0 }); G.state = 'play'; G.tod = 0.45; B.sync(0);
    const moths = G.ents.filter((e) => e._p79b === 'moth'), book = ent('book'), gold0 = G.player.gold;
    out.mothsDay = moths.length === 5 && moths.every((e) => e.hidden); G.tod = 0.93; counted(() => { for (let i = 0; i < 10; i++) B.sync(1 / 30); }); out.mothsNight = moths.every((e) => !e.hidden) && /Hush-moths/.test(ent('lantern').label); G.tod = 0.45; B.sync(0);
    G.flags.p79_words = 0; useDeco(book); out.bookEmpty = !G.flags.p79_words; G.flags.p79_words = 1; useDeco(book); out.bookPaid = G.flags.p79_words === 2 && G.player.gold > gold0 && /LEAVE IT SHUT/.test(book.label); G.flags.p79_words = 0;
    counted(() => { B.buildStage(B.SPW, { map: 'clearing', x: 1, y: 1, dir: 0 }, { map: 'greenroot', x: 1, y: 1, dir: 0 }); B.buildStage(B.SPE, { map: 'clearing', x: 1, y: 1, dir: 0 }, { map: 'greenroot', x: 1, y: 1, dir: 0 }); HOWE79.build({ map: B.EAST, x: 1, y: 1, dir: 0 }); }); out.noRandom = calls === 0;
    // after the Greening the road is under the green: nobody is left standing on it
    G.flags.greening = 1; out.greened = B.MINE.map((id) => { loadMap(id, {}); return G.mapId; }).join(','); G.flags.greening = 0; loadMap(B.WEST, {}); out.back = G.mapId;
    G.state = 'play'; let tr = ''; try { tr = String(travelBlocked()); travelOpen(); tr += '|' + (TRAVEL.dests || []).length; closeModal(); } catch (e) { tr = 'ERR ' + e.message; } out.travel = tr;
    out.cards = [B.WEST, B.MID, B.EAST, B.HOWE].map((id) => SCREENS.familyFor(id)).join(',') + '|' + ['p79_common', 'p79_road', 'p79_wood'].filter((k) => { const c = SCREENS.caches.area[k]; return c && c.width === 320 && c.height === 200; }).length;
    out.texts = B.TEXTS.length;
    return out;
  });
  const G_W = (q) => q.st.p79_road_w.steps > 280 && q.st.p79_road_e.steps > 270;
  const W = r.st.p79_road_w, M = r.st.p79_greenroad, E = r.st.p79_road_e;
  check(r.chain && r.lands, 'three stretches end to end: Outside the Hedge, the Long Common, the middle, Greenroot Wood, Greenroot, and every gate leads somewhere you can stand');
  check(r.total >= r.mid * 2.8 && r.total > 600, 'the road is three times as long: ' + r.total + ' steps from the Hedge to Greenroot (' + W.steps + ' + ' + M.steps + ' + ' + E.steps + '), where the middle stretch alone was ' + r.mid);
  for (const [name, o] of [['the Long Common', W], ['Greenroot Wood', E]]) {
    check(o.len > o.chord * 1.15 && o.turn > 360, name + ': the road is not a straight line (' + o.len + ' paces for ' + o.chord + ' as the crow flies, ' + o.turn + ' degrees of turning)');
    check(o.water > 250 && o.cliff > 120 && o.rolling >= 35 && o.tilted === 0, name + ': lakes, running water, cliffs and no level country (' + o.water + ' cells of water, ' + o.cliff + ' of cliff, ' + o.rolling + '% off the flat, no water on a slope)');
    check(o.reach && o.caches >= 2 && o.things >= 9, name + ': ' + o.things + ' things to find, all reachable on foot, ' + o.caches + ' strongboxes');
    check(o.foes.length > 0 && o.foesOff && o.danger === 1, name + ': something dangerous off the road (' + o.foes + '), none of it within ten paces of the road itself' + (o.traps ? ', and ' + o.traps + ' traps' : ''));
  }
  check(/hound,hound/.test(W.foes) && /dirge/.test(E.foes) && E.traps === 2, 'old places with surprises in them: hounds bedded in the Delph; a Dirge, a swarm, hounds and two traps at the lych-house');
  check(/rd_cutter/.test(r.who.w0) && /rd_packman/.test(r.who.w0) && !/band/.test(r.who.w0) && /rd_packman/.test(r.who.m0), 'the packman, one day in three: on the Long Common in the morning and at the toll-house at noon (' + r.who.w0 + ' | ' + r.who.m0 + ')');
  check(/rd_band_a,rd_band_b,rd_band_c/.test(r.who.e1) && /rd_band_a/.test(r.who.m1) && /rd_band_a/.test(r.who.w1) && !/packman/.test(r.who.w1), 'the band who turned back from Greenroot, one day in three: Greenroot Wood in the morning, the middle at noon, the Long Common in the afternoon');
  check(!/packman|band/.test(r.who.w2) && /rd_cutter/.test(r.who.w2), 'and one day in three the road has only its own people (' + r.who.w2 + ')');
  check(/rd_antiq/.test(r.who.e1) && /rd_digger/.test(r.who.e1) && r.who.e2n === 'rd_antiq,rd_digger', 'the explorers: an antiquary and her digger at the lych-house by day and at their camp by night');
  check(r.band.shown === 3 && r.band.moved > 20 && r.band.onRoad && !r.band.wetFeet, 'travellers walk the road itself and cross water by the bridge (the band went ' + r.band.moved + ' paces, never off the road, never in the river) ' + JSON.stringify(r.band));
  check(r.lampDry && r.lampNeeds && r.canTaken && r.lampFilled, 'a small task on the Long Common: the hush-lamp at the well is dry, the oil-can is in the Delph, and filling it is remembered');
  check(r.lampNight && r.lampDay, 'only at night: once filled, the hush-lamp burns from dusk and is out by day');
  check(r.standCalm && r.standTolls && r.standFar, 'only in bad weather: in a storm the Ringing Stand tolls, and standing in it makes noise (which is what brings the hounds); not in fair weather, and not from the road');
  check(r.mothsDay && r.mothsNight, 'only at night in Greenroot Wood: hush-moths at the diggers\' lantern');
  check(r.bookEmpty && r.bookPaid, 'the antiquary\'s task: nothing to write until you have read the words below; then it is written, paid for, and remembered');
  check(r.glass && r.bellOak && r.reedrow >= 4, 'a fantasy element on each stretch: glass through the Delph\'s rock that gives its own light and burns brighter after dark; the Bell Oak, five men high, in its stand; an old reed-row of ' + r.reedrow + ' poles up to the lych-house');
  check(r.grown >= 1.3 && G_W(r) && true, 'room to breathe: each new stretch is its working plan grown ' + r.grown + ' times, with built things kept their own size');
  check(r.greened === 'clearing,clearing,clearing,clearing' && r.back === 'p79_road_w', 'after the Greening the road is under the green: a save made on any stretch or in the Howe comes back by the clearing\'s hedge (and before it, the road loads as itself)');
  check(/^null\|[1-9]/.test(r.travel), 'the world map opens on the road and offers the way home (' + r.travel + ')');
  check(r.cards === 'p79_common,p79_road,p79_wood,crypt|3', 'each stretch has its own arrival card, painted here, and the Howe arrives as a crypt (' + r.cards + ')');
  check(r.noRandom, "none of it draws on the game's random numbers (building both stretches and the Howe included)");
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
