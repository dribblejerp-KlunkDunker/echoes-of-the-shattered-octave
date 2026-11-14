// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/drove83.test.js
// Phase 83, road 3 of the world plan: the drove road, in two stretches (the Grey Wethers, the Hundred Hollows).
// This keeps true:
//   - the stile in the Downs' south hedge now opens on the Grey Wethers, the Wethers on the Hollows, the Hollows on
//     Wethercombe, and back the same way; each stretch can be walked from gate to gate; the first stays danger 0;
//   - the Grey Wethers: a flock of stones, five raddled; struck in the drovers' call (three, one, four, two, five) they pay
//     once; out of order they reset and make noise; in wind they sound and say so;
//   - the fold-fires show from the road at night once lit; the returners' fire at night; dawn mist after a wet night;
//   - the Hundred Hollows: about a hundred pits, one open; hounds den in them after dark and are gone by day;
//   - the four new gates have their finger-posts, the old posts moved to the new doors, and the chart agrees;
//   - every new line has French, and nothing uses random numbers.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

global.window = global.window || {};
const D = require(path.join(ROOT, 'js', 'drove83.js'));
{
  const pairs = new Map();
  for (const line of fs.readFileSync(path.join(ROOT, 'tools', 'i18n', 'p83-drove.tsv'), 'utf8').split('\n')) { if (!line.trim() || line[0] === '#') continue; const t = line.indexOf('\t'); if (t > 0) pairs.set(line.slice(0, t), line.slice(t + 1)); }
  const missing = D.TEXTS.filter((t) => !pairs.has(t));
  check(D.TEXTS.length >= 68 && !missing.length, 'every new line has French (' + D.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  check(Array.from(pairs.values()).every((fr) => fr.trim().length > 0), 'no French line is empty');
  const flat = fs.readFileSync(path.join(ROOT, 'locales', 'story', 'fr.json'), 'utf8');
  check(flat.includes('Moutons Gris') && flat.includes('Cent Creux'), 'the French is merged into the story locale');
  check(!/Math\.random/.test(fs.readFileSync(path.join(ROOT, 'js', 'drove83.js'), 'utf8')), 'nothing on the drove road uses random numbers');
  check(D.MARKED.length === 5 && JSON.stringify(D.CALL) === '[2,0,3,1,4]', 'five raddled stones, and the call is three, one, four, two, five');
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
    const out = {}, W = DROVE83.WETHERS, H = DROVE83.HOLLOWS, doors = (m) => { const d = []; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal) d.push({ x: i % m.w, y: (i / m.w) | 0, to: c.portal.map }); } return d; };
    out.maps = !!G.maps[W] && !!G.maps[H] && G.maps[W].outdoor && G.maps[H].outdoor;
    out.danger = [G.maps.p20_downs.danger, G.maps[W].danger, G.maps[H].danger].join(',');
    out.downs = doors(G.maps.p20_downs).some((d) => d.to === W) && !doors(G.maps.p20_downs).some((d) => d.to === 'p22_combe');
    out.combe = doors(G.maps.p22_combe).some((d) => d.to === H) && !doors(G.maps.p22_combe).some((d) => d.to === 'p20_downs');
    out.wDoors = doors(G.maps[W]).map((d) => d.to).sort().join(','); out.hDoors = doors(G.maps[H]).map((d) => d.to).sort().join(',');
    const walk = (m) => {
      const Wd = m.w, Hd = m.h, steep = (x, y) => !!m.smooth && typeof MAX_GRADE !== 'undefined' && m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE;
      const ok = (x, y, fx, fy) => !m.isBlocked(x, y) && !(steep(x, y) && m.groundAt(x + 0.5, y + 0.5) > m.groundAt(fx + 0.5, fy + 0.5) + 0.02);
      const sp = m.spawn, seen = new Uint8Array(Wd * Hd), q = [(sp.y | 0) * Wd + (sp.x | 0)]; seen[q[0]] = 1;
      for (let h = 0; h < q.length; h++) { const i = q[h], x = i % Wd, y = (i / Wd) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= Wd || Y >= Hd || seen[Y * Wd + X] || !ok(X, Y, x, y)) continue; seen[Y * Wd + X] = 1; q.push(Y * Wd + X); } }
      const at = (x, y) => [[0, 0], [0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => { const X = Math.floor(x) + dx, Y = Math.floor(y) + dy; return X >= 0 && Y >= 0 && X < Wd && Y < Hd && seen[Y * Wd + X]; });
      return { doors: doors(m).every((d) => [[0, 1], [0, -1], [1, 0], [-1, 0]].some(([dx, dy]) => { const X = d.x + dx, Y = d.y + dy; return X >= 0 && Y >= 0 && X < Wd && Y < Hd && seen[Y * Wd + X]; })), at };
    };
    const ww = walk(G.maps[W]); out.walkW = ww.doors; out.walkH = walk(G.maps[H]).doors;
    out.stonesReach = G.maps[W].entities.filter((e) => e && e._p83d === 'wether' && e._n >= 0).every((e) => [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => ww.at(e.x + dx, e.y + dy)));
    const via = (from, to) => { const c = G.maps[from].cells.find((c) => c && c.door && c.portal && c.portal.map === to); return c && c.portal; };
    out.chain = !!via('p20_downs', W) && !!via(W, H) && !!via(H, 'p22_combe') && !!via('p22_combe', H) && !!via(H, W) && !!via(W, 'p20_downs');
    const rep = BEARINGS82B.report();
    out.onChart = [W, H].every((id) => rep.regions.reach && rep.regions.reach.places.includes(id));
    const mine = rep.pairs.filter((p) => [p.a, p.b].some((id) => id === W || id === H));
    out.agree = mine.length >= 2 && mine.every((p) => p.agrees) && !rep.direction.some((d) => /p83_(wethers|hollows)/.test(d)) && !rep.overlaps.some((d) => /p83_(wethers|hollows)/.test(d));
    out.unposted = rep.noPost.filter((u) => /p83_(wethers|hollows)|p20_downs|p22_combe/.test(u));
    const posts = (id) => G.maps[id].entities.filter((e) => typeof e.label === 'string' && /^A finger-post/.test(e.label)).length;
    out.posts = [posts(W), posts(H)];
    out.wethers = G.maps[W].entities.filter((e) => e && e._p83d === 'wether').length;
    out.pits = G.maps[H]._p83d.pits; out.shaft = G.maps[H].entities.some((e) => e && e._p83d === 'shaft');
    return out;
  });
  check(r.maps && r.danger === '0,0,1', 'the Grey Wethers and the Hundred Hollows exist out of doors; the Downs and the first stretch are quiet, the Hollows danger 1 (' + r.danger + ')');
  check(r.downs && r.combe, 'the Downs\' south stile opens on the Grey Wethers, and Wethercombe\'s way up on the Hundred Hollows');
  check(r.wDoors === 'p20_downs,p83_hollows' && r.hDoors === 'p22_combe,p83_wethers', 'each stretch has its two gates (' + r.wDoors + ' / ' + r.hDoors + ')');
  check(r.chain, 'the road runs Downs > Wethers > Hollows > Wethercombe, and back');
  check(r.walkW && r.walkH && r.stonesReach, 'each stretch can be walked from gate to gate, and every raddled stone can be reached');
  check(r.onChart && r.agree, 'both stretches lie on the travel chart, and their gates agree with the sides they leave by');
  check(r.posts[0] >= 2 && r.posts[1] >= 2 && !r.unposted.length, 'a finger-post at every gate of the new road' + (r.unposted.length ? ': ' + r.unposted.join(', ') : ''));
  check(r.wethers >= 80, 'a flock of stones on the down (' + r.wethers + ')');
  check(r.pits >= 90 && r.shaft, 'about a hundred hollows (' + r.pits + '), and one not grassed over');

  // ---- the drovers' call
  const t = await page.evaluate(() => {
    const out = {}, W = DROVE83.WETHERS, go = () => { closeModal(); loadMap(W, { x: G.maps[W].spawn.x, y: G.maps[W].spawn.y, dir: 0 }); G.state = 'play'; };
    Weather.hold('clear'); G.tod = 0.5; go(); G.flags.p83d_call = 0; G.flags.p83d_paid = 0; G.noise = 0;
    const st = (n) => G.ents.find((e) => e && e._p83d === 'wether' && e._n === n), plain = G.ents.find((e) => e && e._p83d === 'wether' && e._n < 0);
    out.plain = DROVE83.strike(plain) === true && G.flags.p83d_call === 0 && G.noise < 1;
    DROVE83.strike(st(2)); DROVE83.strike(st(0)); out.two = G.flags.p83d_call === 2;
    DROVE83.strike(st(1)); out.wrong = G.flags.p83d_call === 0 && G.noise >= 3;
    const gold = G.player.gold; for (const n of [2, 0, 3, 1, 4]) useDeco(st(n));
    out.done = G.flags.p83d_call === 5 && G.flags.p83d_paid === 1 && G.player.gold === gold + 6;
    for (const n of [2, 0, 3, 1, 4]) DROVE83.strike(st(n));
    out.once = G.player.gold === gold + 6;
    out.journal = JSON.stringify(G.journal || []).includes('drovers\' call');
    Weather.hold('storm'); Weather.tick(1 / 60); DROVE83.sync(); out.wind = plain.label === DROVE83.TX.wetherWind;
    Weather.hold('clear'); Weather.tick(1 / 60); DROVE83.sync(); out.calm = plain.label === DROVE83.TX.wether;
    // the fold-fires from the road, and the returners' fire
    G.flags.p22w_b1 = 1; G.flags.p22w_b0 = 0; G.flags.p22w_b2 = 0; G.tod = 0.95; DROVE83.sync();
    const far = G.ents.filter((e) => e && e._p83d === 'far'); out.far = far.find((e) => e._b === 1).hidden === false && far.filter((e) => e._b !== 1).every((e) => e.hidden);
    out.camp = G.ents.find((e) => e && e._p83d === 'camp').hidden === false;
    G.tod = 0.5; DROVE83.sync(); out.farDay = far.every((e) => e.hidden) && G.ents.find((e) => e && e._p83d === 'camp').hidden;
    return out;
  });
  check(t.plain, 'any stone can be knocked for its note; that alone is not the call');
  check(t.two && t.wrong, 'struck out of order the call starts again, and it is noise');
  check(t.done && t.once && t.journal, 'three, one, four, two, five: the old woman pays once, and it goes in the journal');
  check(t.wind && t.calm, 'in a high wind the stones sound by themselves, and say so');
  check(t.far && t.farDay, 'a lit fold-fire shows from the road after dark, and only a lit one');
  check(t.camp, 'the returners\' fire under the pines at night');

  // ---- the Hollows: mist at dawn after a wet night; hounds in the dens after dark
  const h = await page.evaluate(() => {
    const out = {}, H = DROVE83.HOLLOWS, go = () => { closeModal(); loadMap(H, { x: G.maps[H].spawn.x, y: G.maps[H].spawn.y, dir: 0 }); G.state = 'play'; };
    G.day = 10; G.tod = 22 / 24; Weather.hold('rain'); go(); DROVE83.sync();
    out.flag = G.flags.p83d_wetnight === 11;
    const mist = () => G.ents.filter((e) => e && e._p83d === 'mist');
    out.notYet = mist().length >= 4 && mist().every((e) => e.hidden);
    G.day = 11; G.tod = 6.5 / 24; Weather.hold('clear'); DROVE83.sync(); out.dawn = mist().every((e) => !e.hidden);
    G.tod = 0.5; DROVE83.sync(); out.noon = mist().every((e) => e.hidden);
    G.day = 12; G.tod = 6.5 / 24; DROVE83.sync(); out.dry = mist().every((e) => e.hidden);
    const hounds = () => G.map.entities.filter((e) => e && e._p83den != null && !e.dead);
    G.tod = 0.95; DROVE83.sync(); out.night = hounds().length === 3 && hounds().every((e) => e.type === 'hound');
    DROVE83.sync(); out.noDouble = hounds().length === 3;
    Engine.cam.x = 2.5; Engine.cam.y = 2.5; for (const e of hounds()) { e.state = 'idle'; e.aggro = false; }
    G.tod = 0.5; DROVE83.sync(); out.day = hounds().length === 0;
    return out;
  });
  check(h.flag && h.notYet, 'a wet night is remembered for the dawn after it');
  check(h.dawn && h.noon && h.dry, 'at dawn after a wet night the combe below fills with mist; not at noon, not after a dry night');
  check(h.night && h.day, 'hounds lie up in the Hollows after dark, and are gone by day');

  // ---- the people
  const p = await page.evaluate(() => {
    const W = DROVE83.WETHERS; closeModal(); G.tod = 0.5; loadMap(W, { x: G.maps[W].spawn.x, y: G.maps[W].spawn.y, dir: 0 }); G.state = 'play';
    const keys = G.ents.filter((e) => e && e.kind === 'npc' && e._life).map((e) => e._life);
    return { keys, ok: ['dr_old', 'dr_man', 'dr_wom', 'dr_boy', 'dr_cut'].every((k) => keys.includes(k)) };
  });
  check(p.ok, 'the returners, the old woman and the furze-cutter are on the road by day (' + p.keys.join(', ') + ')');

  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
