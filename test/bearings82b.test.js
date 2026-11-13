// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/bearings82b.test.js
// Phase 82b, the map agrees with the ground (owner, 13 Nov 2026: "make sure that each location is exactly where it is on
// the map with roads leading in the proper directions with signposts. Each town or city should have signposts for notices
// and extra bits of lore and side quests"). This keeps it true as later phases add roads and places:
//   - for every pair of gates, the side left by is the opposite of the side arrived at (the one recorded exception: the
//     water-meadow's culvert, which is a scene and not a pair of gates, waiting on the owner);
//   - the layout has no two places overlapping, and every place lies on the chart in the direction its road leaves;
//   - every way out between outdoor places has a finger-post within five cells (bar the ways the brief gives no words for,
//     which are named and wait on the owner), and every finger-post of the brief is up, beside its gate;
//   - every town of section 4 has its board, the three old boards their new lore, and every task can be taken, done and paid;
//   - the travel map lays every destination where the layout puts it, the chart is drawn the same every time, and the Synod's
//     wash still grows stage by stage on the new charts;
//   - every new line has French.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- no browser: the words, the French, no random numbers
const BR = require(path.join(ROOT, 'js', 'bearings82b.js')), BO = require(path.join(ROOT, 'js', 'boards82b.js'));
{
  const pairs = new Map();
  for (const f of fs.readdirSync(path.join(ROOT, 'tools', 'i18n')).filter((n) => /^p82b-.*\.tsv$/.test(n))) {
    for (const line of fs.readFileSync(path.join(ROOT, 'tools', 'i18n', f), 'utf8').split('\n')) { if (!line.trim() || line[0] === '#') continue; const t = line.indexOf('\t'); if (t > 0) pairs.set(line.slice(0, t), line.slice(t + 1)); }
  }
  const all = BR.TEXTS.concat(BO.TEXTS), missing = all.filter((t) => !pairs.has(t));
  check(all.length > 100 && !missing.length, 'every new line has French (' + all.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  check(Array.from(pairs.values()).every((fr) => fr.trim().length > 0), 'no French line is empty');
  const src = fs.readFileSync(path.join(ROOT, 'js', 'bearings82b.js'), 'utf8') + fs.readFileSync(path.join(ROOT, 'js', 'boards82b.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing in Phase 82b uses random numbers');
  check(BR.POSTS.length === 23 && new Set(BR.POSTS.map((p) => p.id)).size === 23, 'the brief\'s twenty-three finger-posts are all listed');
  check(['landing', 'combe', 'harbour', 'hollow', 'rings', 'greenroot'].every((k) => BO.BOARDS[k]) && Object.keys(BO.TASKS).length === 9 && BO.BOARDS.greenroot.tasks.length === 0, 'six new boards, nine tasks, and Greenroot\'s board gives none');
  // the pure layout rules on a made-up country: a road east, and a door in the middle of a map counting by its nearest edge
  const M = (id, w, h, gates) => { const cells = new Array(w * h).fill(null); for (const [x, y, to] of gates) cells[y * w + x] = { door: true, portal: { map: to, x: 1, y: 1 } }; return { id, w, h, outdoor: true, cells }; };
  const maps = { oakhaven: M('oakhaven', 10, 8, [[9, 4, 'b']]), b: M('b', 6, 6, [[0, 2, 'oakhaven'], [3, 1, 'c']]), c: M('c', 4, 4, [[1, 3, 'b']]) };
  const g = BR.gatesOf(maps), p = BR.pairsOf(g);
  check(p.length === 2 && p.every((q) => q.agrees) && g.find((x) => x.from === 'b' && x.to === 'c').side === 'N', 'gates: sides read from the edges, an inner door by its nearest edge');
  const L = BR.layoutRegion(maps, 'reach', null);
  check(L.places.b.x === 10 && L.places.b.y === 2 && L.places.c.x === 12 && L.places.c.y + 4 <= L.places.b.y, 'layout: where B stands = where A stands + A\'s gate - B\'s gate, one cell across');
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

  // ---- the map agrees with the ground
  const r = await page.evaluate(() => {
    const B = BEARINGS82B, rep = B.report(), out = { rep };
    out.recorded = JSON.stringify(rep.disagree) === JSON.stringify(['oakhaven>p49_meadow']) && JSON.stringify(rep.direction) === JSON.stringify(['p49_meadow W > oakhaven']);
    out.realAgree = rep.pairs.filter((p) => !p.pseudo).every((p) => p.agrees) && rep.pairs.filter((p) => !p.pseudo).length >= 14;
    out.reach = rep.regions.reach && ['oakhaven', 'clearing', 'p20_downs', 'p22_combe', 'p22_hanger', 'p47_stones', 'p49_meadow', 'p79_road_w', 'p79_greenroad', 'p79_road_e', 'greenroot', 'flume_road', 'flume_landing', 'flume_lowrings'].every((id) => rep.regions.reach.places.includes(id));
    out.woods = rep.regions.woods && ['whispergrove', 'p31_bellyard', 'p61_yard', 'deepwoods'].every((id) => rep.regions.woods.places.includes(id));
    // the travel map: every destination's rectangle is the layout's; the Reach is drawn wider than it is tall, as it is walked
    out.rects = ['reach', 'woods'].every((rid) => { const R = TRAVEL_REGIONS[rid], L = B.L.lay[rid]; return Object.keys(R.maps).every((id) => !L.places[id] || JSON.stringify(R.maps[id].rect) === JSON.stringify(L.frac(id))) && R.across === L.Wc; });
    out.wideReach = B.L.lay.reach.Wc > 900 && B.L.lay.reach.Wc > B.L.lay.reach.Hc * 3;
    // the Malting yard: the way back to the Court is on its south side now, and you come in there
    const y = G.maps.p61_yard, wg = G.maps.whispergrove.get(32, 5);
    out.yard = y.get(11, 17) && y.get(11, 17).portal && y.get(11, 17).portal.map === 'whispergrove' && !(y.get(0, 9) && y.get(0, 9).portal) && wg.portal.map === 'p61_yard' && Math.abs(wg.portal.y - 16.4) < 0.01 && y.spawn.y > 16;
    // the posts: every one of the brief's is up once, within five cells of each of its gates
    const gates = B.gatesOf(G.maps);
    out.posts = B.POSTS.every((P) => { const m = G.maps[P.map], es = m.entities.filter((e) => e._p82bPost === P.id); if (es.length !== 1) return false; const e = es[0];
      return e.sprite === 'sign' && (e.label === P.text || e.look === P.text) && P.to.every((t) => { const g = gates.find((q) => q.from === P.map && q.to === t && !q.pseudo); return g && Math.hypot(e.x - g.x - 0.5, e.y - g.y - 0.5) <= 5; }) && !m.isBlocked(Math.floor(e.x), Math.floor(e.y)); });
    // the ways out with no post are exactly the ones waiting on the owner
    const bare = B.wayOuts().filter((g) => !B.postsNear(g, 5).length).map((g) => g.from + '>' + g.to).sort();
    out.bare = bare; out.awaiting = JSON.stringify(bare) === JSON.stringify(B.AWAITING.map((a) => a.map + '>' + a.to).sort());
    // the chart is drawn the same every time (no random numbers), and only what has been found is on it
    for (const id of ['oakhaven', 'clearing']) G.maps[id].visited.fill(1);
    const f = B.foundSet('reach'), a = B.paintChart('reach', f).toDataURL(), b = B.paintChart('reach', f).toDataURL(), c = B.paintChart('reach', { oakhaven: true }).toDataURL();
    out.same = a === b && a !== c;
    const im = travelImg(TRAVEL_REGIONS.reach.img); out.image = im instanceof Image && im.naturalWidth === B.L.lay.reach.W && im.naturalHeight === B.L.lay.reach.H;
    // where you are, even where the travel list does not go
    loadMap('p22_combe', { x: 30, y: 24, dir: 0 }); G.state = 'play'; const h = travelHere('reach'), cr = B.L.lay.reach.frac('p22_combe');
    out.here = !!h && h[0] > cr[0] && h[0] < cr[2] && h[1] > cr[1] && h[1] < cr[3];
    // the destinations the game had are still there
    out.dests = ['oakhaven', 'clearing'].every((id) => travelDestinations('reach').some((d) => d.map === id));
    // the Synod's wash, carried onto the charts, still grows stage by stage
    out.wash = ['reach', 'woods'].every((v) => { const s = [0, 1, 2, 3].map((k) => SYNOD15.washArea(v, k, 400, 400)); return s[0] > 0 && s[1] > s[0] && s[2] > s[1]; });
    return out;
  });
  check(r.recorded, 'the only side that disagrees is the water-meadow\'s culvert, recorded for the owner: ' + JSON.stringify(r.rep.disagree));
  check(r.realAgree, 'every real pair of gates: the side left by is the opposite of the side arrived at (' + r.rep.pairs.length + ' pairs)');
  check(!r.rep.overlaps.length, 'no two places overlap in the layout');
  check(r.reach && r.woods, 'every outdoor place of the Reach and the Woods is laid');
  check(r.rects, 'the travel map lays every destination where the layout puts it, one minute a cell');
  check(r.wideReach, 'the Reach is laid as it is walked: about a thousand cells across');
  check(r.yard, 'the Malting yard\'s way back to the Court leaves by its south side, and the Court\'s door brings you in there');
  check(r.posts, 'all twenty-three finger-posts stand within five cells of their gates, in the brief\'s words, on open ground');
  check(r.awaiting && !r.rep.noPost.length, 'every other way out has a finger-post within five cells; waiting on the owner\'s words: ' + r.bare.join(', '));
  check(r.same, 'the chart is drawn the same every time, and a place not yet found is not on it');
  check(r.image, 'the travel map gets the chart as an Image of the chart\'s size');
  check(r.here, 'you are on the chart even where the travel list does not go (Wethercombe)');
  check(r.dests, 'the travel destinations the game had are still there');
  check(r.wash, 'the Synod\'s wash still grows stage by stage on both charts');

  // ---- the boards
  const b = await page.evaluate(() => {
    const B = BOARDS82B, out = {}, gold = () => G.player.gold, here = (id, x, y) => { closeModal(); loadMap(id, { x, y, dir: 0 }); G.state = 'play'; };
    const spots = (task) => G.ents.filter((e) => e._p82bTask === task);
    out.placed = Object.keys(B.BOARDS).every((k) => G.maps[B.BOARDS[k].map].entities.filter((e) => e._p82bBoard === k && e.use === 'p82b_board').length === 1);
    out.old = ['oakhaven', 'whispergrove', 'deepwoods'].every((id) => G.maps[id].entities.some((e) => e.use === 'bounty_board'));
    // the Oakhaven board shows its two new lines
    here('oakhaven', 25.2, 19.0); renderBountyBoard(); const ph = document.getElementById('modal-panel').innerText; out.oldLore = B.OLD_LORE.oakhaven.every((t) => ph.includes(t.replace(/^"|"$/g, '').slice(0, 20))); closeModal(); G.state = 'play';
    // a board, read: notices, lore, and the tasks to take
    here('flume_landing', 13, 13); const brd = G.ents.find((e) => e._p82bBoard === 'landing'); useDeco(brd);
    const txt = document.getElementById('modal-panel').innerText;
    out.read = G.openPanel === 'p82b_board' && B.BOARDS.landing.notices.every((t) => txt.includes(t.slice(0, 18))) && B.BOARDS.landing.lore.every((t) => txt.includes(t.slice(0, 18))) && document.querySelectorAll('[id^="p82b-t-"]').length === 2;
    // Three traps before light: taken from the board; not by day; not loud; three at night; paid at the board
    const j0 = G.journal.length; document.getElementById('p82b-t-traps').click(); out.taken = B.st('traps') === 1 && G.journal.length > j0;
    closeModal(); G.state = 'play'; here('flume_landing', 13, 13); out.trapsShown = spots('traps').filter((e) => !e.hidden).length === 3;
    G.tod = 0.5; G.noise = 0; useDeco(spots('traps')[0]); out.notByDay = B.num('traps', 'n') === 0;
    G.tod = 0.9; G.noise = 3; useDeco(spots('traps')[0]); out.notLoud = B.num('traps', 'n') === 0;
    G.noise = 0; for (const e of spots('traps')) useDeco(e); out.trapsDone = B.st('traps') === 2;
    const g0 = gold(), eel0 = (G.player.inv.find((s) => s.id === 'p12_flume_eel') || { n: 0 }).n; useDeco(brd); document.getElementById('p82b-t-traps').click();
    out.trapsPaid = B.st('traps') === 3 && gold() === g0 + B.TASKS.traps.gold && (G.player.inv.find((s) => s.id === 'p12_flume_eel') || { n: 0 }).n === eel0 + 2; closeModal(); G.state = 'play';
    // the rest, each start to finish, by their own things in the world
    const run = (k, steps) => { B.takeTask(k); steps(); const ok = B.st(k) === 2; const g = gold(); B.claimTask(k); return ok && B.st(k) === 3 && gold() === g + B.TASKS[k].gold; };
    out.reed = run('reed', () => { here('flume_landing', 13, 13); const s = spots('reed'), drop = s.find((e) => e.label === B.TX.coopSpot); useDeco(drop); const short = B.st('reed') === 1; for (const e of s) if (e !== drop) useDeco(e); useDeco(drop); if (!short) throw new Error('reed'); });
    out.hurdles = run('hurdles', () => { here('p22_combe', 30, 24); const s = spots('hurdles'), stack = s.find((e) => e.sprite === 'p82b_hurdles'), fold = s.find((e) => e !== stack); for (let i = 0; i < 6; i++) { useDeco(stack); useDeco(fold); } });
    out.bell = run('bell', () => { here('p20_downs', 10, 34); useDeco(spots('bell')[0]); here('p22_combe', 30, 24); useDeco(spots('bell').find((e) => !e.hidden)); });
    out.hook = run('hook', () => { here('cantabile_harbour', 40, 50); G.flags.p17c_hung = (Number(G.flags.p17c_hung) | 0) | 2; B.watch(); });
    out.chimes = run('chimes', () => { here('cantabile_harbour', 40, 50); useDeco(spots('chimes')[0]); const none = B.num('chimes', 'n') === 0; G.give('p82b_chime', 3); for (const e of spots('chimes')) useDeco(e); if (!none) throw new Error('chime without a chime'); });
    out.chimeShop = NPCS.p17c_sloe.shop.some((s) => s.item === 'p82b_chime') && !!ITEMS.p82b_chime;
    out.doors = run('doors', () => { here('surgery', 5, 5); useDeco(spots('doors')[0]); here('p30_hollow', 16, 16); const s = spots('doors'); for (const e of s.slice(0, 3)) useDeco(e); });
    out.water = run('water', () => { here('p30_hollow', 16, 16); const s = spots('water'); useDeco(s.find((e) => e.sprite === 'p82b_pails')); useDeco(s.find((e) => e.label === B.TX.stepSpot)); });
    out.book = run('book', () => { here('flume_lowrings', 6.5, 6.5); useDeco(spots('book')[0]); });
    // "Mind the third board": it creaks
    here('flume_lowrings', 6.5, 7.5); G.noise = 0; Engine.cam.x = 6.5; Engine.cam.y = 5.5; B.watch(); out.creak = G.noise >= 2;
    // Greenroot's board gives no task
    here('greenroot', 15, 12); useDeco(G.ents.find((e) => e._p82bBoard === 'greenroot')); out.greenroot = document.querySelectorAll('[id^="p82b-t-"]').length === 0 && /To whoever comes after us/.test(document.getElementById('modal-panel').innerText); closeModal(); G.state = 'play';
    // things put away when a task is done
    here('flume_landing', 13, 13); out.tidy = spots('traps').every((e) => e.hidden) && spots('reed').every((e) => e.hidden);
    return out;
  });
  check(b.placed && b.old, 'a board in each of the six towns, and the three old boards still there');
  check(b.oldLore, 'the Oakhaven board shows its two new lines of lore');
  check(b.read, 'a board shows its notices, its lore and its tasks');
  check(b.taken && b.trapsShown, 'a task is taken from the board the way a bounty is, into the logbook, and its things appear');
  check(b.notByDay && b.notLoud && b.trapsDone && b.trapsPaid, 'Three traps before light: not by day, not loud, three at night, paid at the board in coin and eels');
  check(b.reed && b.hurdles && b.bell, 'Reed for the thatcher, Twelve hurdles and The lead ewe\'s bell, start to finish');
  check(b.hook && b.chimes && b.chimeShop, 'A bell for a bare hook (the Cay\'s own grave-bell) and Three chimes (sold by the chandler), start to finish');
  check(b.doors && b.water && b.book, 'Three doors, Water for the end house and The chandler\'s book, start to finish');
  check(b.creak, 'the third board in the chandler\'s creaks');
  check(b.greenroot, 'Greenroot\'s board gives no task');
  check(b.tidy, 'what a finished task used is put away');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
