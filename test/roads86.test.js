// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/roads86.test.js
// Phase 86: danger and reward on the roads (js/roads86.js): rosters by hour and weather, camps, fires, keepers,
// bounties, the Office column, the boards' road news.
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
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, R = ROADS86, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const wx = (w) => { Weather.hold && Weather.hold(w); try { Weather.set(w); } catch (e) { /* */ } };
    const go = (id, tod, w, day) => { if (day != null) G.day = day; G.tod = tod; wx(w); loadMap(id); G.state = 'play'; };
    const out86 = (pred) => G.ents.filter((e) => e && e._r86 && e.kind === 'enemy' && !e.hidden && !e.dead && (!pred || pred(e)));
    const plain = (e) => !e._r86.keeper && !e._r86.camp && !e._r86.column;
    // ---- rosters: worked out from the hour and the weather, the same every time
    go('p79_road_w', 0.5, 'clear', 1); const day1 = out86(plain).length;
    go('p79_road_w', 0.9, 'clear', 1); const night = out86(plain).map((e) => e.type + e.x + e.y).join();
    go('p79_road_w', 0.9, 'clear', 1); const night2 = out86(plain).map((e) => e.type + e.x + e.y).join();
    out.byHour = day1 === 0 && night.length > 0 && night === night2;
    go('p83_stride', 0.5, 'snow', 2); const snow = out86((e) => e.type === 'briarsprite' && plain(e)).length;
    go('p83_stride', 0.5, 'rain', 2); const rain = out86((e) => e.type === 'briarsprite' && plain(e)).length;
    const statics = () => G.ents.filter((e) => e && e._r86s && e.type === 'briarsprite' && !e.dead && !e.hidden).length;
    go('p83_stride', 0.5, 'snow', 2); const sSnow = statics(); go('p83_stride', 0.5, 'clear', 2);
    out.byWeather = snow === 0 && rain >= 5 && sSnow === 0 && statics() >= 5;
    go('p83_hollows', 0.5, 'mist', 2); const mist = out86((e) => e.type === 'hound' && plain(e)).length;
    go('p83_hollows', 0.5, 'clear', 2); out.mistHounds = mist >= 2 && out86((e) => e.type === 'hound' && plain(e)).length === 0;
    // no new enemy draws on Math.random when it is woken (named here, not by hydrate)
    let draws = 0; const _r = Math.random; Math.random = function () { draws++; return _r(); };
    for (const id of Object.keys(R.PLAN)) for (const e of G.maps[id].entities) if (e._r86 && e.kind === 'enemy' && !e._h) hydrate(e);
    Math.random = _r; out.noRandom = draws === 0;
    // ---- keepers: the Hiss on the Common at night in the wet; down for a week; a trophy
    go('p79_road_w', 0.9, 'rain', 3); const hiss = out86((e) => e._r86.keeper === 'hiss')[0];
    out.hissOut = !!hiss && hiss.def.name === 'The Hiss' && hiss.hpMax >= 100;
    go('p79_road_w', 0.5, 'rain', 3); out.hissDay = !out86((e) => e._r86.keeper === 'hiss').length;
    go('p79_road_w', 0.9, 'rain', 3); const h2 = out86((e) => e._r86.keeper === 'hiss')[0]; killEnemy(h2);
    out.trophy = G.player.inv.some((s) => s.id === 't_p86_collar') && G.flags.p86k_hiss === 3 && ITEMS.t_p86_collar.valuable;
    go('p79_road_w', 0.9, 'rain', 6); const back6 = out86((e) => e._r86.keeper === 'hiss').length;
    go('p79_road_w', 0.9, 'rain', 11); out.keeperWeek = back6 === 0 && out86((e) => e._r86.keeper === 'hiss').length === 1;
    go('p83_stride', 0.5, 'clear', 12); G.flags.p86_rain = 11; loadMap('p83_stride'); G.state = 'play'; out.queenAfter = out86((e) => e._r86.keeper === 'queen').length === 1;
    go('p85_sunklanes', 0.5, 'storm', 12); out.bell = out86((e) => e._r86.keeper === 'bell').length === 1;
    // ---- bounties: the turf-cutter wants the collar
    go('p79_road_w', 0.5, 'clear', 12); const cutter = G.ents.find((e) => e && e.id === 'p60_rd_cutter');
    talk(cutter); const q0 = DLG.log.map((l) => l.t).join(' '); const take = DLG.choices && DLG.choices[0]; const said = take ? take.f(G) : '';
    closeModal(); G.state = 'play';
    out.offer = /collar/.test(q0) && G.flags.p86b_cutter === 1 && !!said && G.journal.some((j) => /Hiss/.test(JSON.stringify(j)));
    const gold0 = G.player.gold; talk(cutter); const give = DLG.choices && DLG.choices.find((c) => /Here/.test(c.t)); if (give) give.f(G); closeModal(); G.state = 'play';
    out.paid = G.flags.p86b_cutter === 2 && G.player.gold === gold0 + 60 && !G.player.inv.some((s) => s.id === 't_p86_collar');
    // the week's work: six dogs on the Common
    talk(cutter); const wk = DLG.choices && DLG.choices[0]; if (wk) wk.f(G); closeModal(); G.state = 'play';
    go('p79_road_w', 0.9, 'clear', 12); let k = 0; for (let n = 0; n < 4 && k < 6; n++) { for (const e of out86((q) => q.type === 'hound' && plain(q))) { if (k < 6) { killEnemy(e); k++; } } if (k < 6) { G.day++; loadMap('p79_road_w'); G.state = 'play'; } }
    const gold1 = G.player.gold; G.tod = 0.5; talk(cutter); const pay = DLG.choices && DLG.choices[0]; if (pay) pay.f(G); closeModal(); G.state = 'play';
    out.week = k === 6 && G.player.gold === gold1 + 35 && G.flags.p86wd_cutter === Math.floor(G.day / 8) + 1;
    // ---- camps: the Office survey camp, held, cleared, cold for a week, a crate once
    let d = 30; while (((d + 0) % 6) >= 4) d++;
    go('p79_greenroad', 0.5, 'clear', d); const office = out86((e) => e._r86.camp === 'office'); const crate = G.ents.find((e) => e && e._r86 && e._r86.crate === 'office');
    msgs.length = 0; useDeco(crate); out.crateShut = msgs.some((t) => /Not while the camp is held/.test(t));
    for (const e of office) killEnemy(e);
    const g0 = G.player.gold; useDeco(crate); const g1 = G.player.gold; useDeco(crate);
    out.camp = office.length === 3 && G.flags.p86c_office === d && g1 > g0 && G.player.gold === g1;
    go('p79_greenroad', 0.5, 'clear', d + 3); const cold = out86((e) => e._r86.camp === 'office').length;
    let d2 = d + 8; while (((d2 + 0) % 6) >= 4) d2++; go('p79_greenroad', 0.5, 'clear', d2);
    out.campBack = cold === 0 && out86((e) => e._r86.camp === 'office').length === 3;
    // ---- a friendly fire: sit until morning, mended
    go('p83_stride', 0.85, 'clear', 40); for (const e of G.ents) if (e && e.kind === 'enemy') e.state = 'idle';
    const fire = G.ents.find((e) => e && e._r86 && e._r86.fire === 'rafthands'); G.player.hp = 3; const day40 = G.day;
    useDeco(fire); const h = G.tod * 24;
    out.fire = G.day === day40 + 1 && h >= 5.5 && h < 7 && G.player.hp === G.player.hpMax && G.ents.some((e) => e && e._r86 && e._r86.hands);
    // ---- the Office column: one road a day, and fighting it goes in the book
    const road = R.columnRoad(); go(road, 0.5, 'clear'); const col = out86((e) => e._r86.column);
    const others = R.COLUMN_ROADS.filter((x) => x !== road).every((id) => !G.maps[id].entities.some((e) => e._r86 && e._r86.column && !e.hidden && id !== road));
    const bounty0 = crimeState().bounty; killEnemy(col.find((e) => e._r86.column === 'assessor'));
    out.column = col.length === 5 && others && crimeState().bounty > bounty0 && msgs.some((t) => /Office's book/.test(t));
    for (const e of out86((q) => q._r86.column)) killEnemy(e); out.columnGone = G.flags.p86col === G.day && !R.columnOut();
    crimeState().bounty = 0;
    // ---- the boards say what is out
    loadMap('p22_combe'); G.state = 'play'; const bd = G.ents.find((e) => e && e.use === 'p82b_board'); useDeco(bd);
    const news = document.querySelector('#modal-panel .p86-roads'); out.board = !!news && /On the roads today/.test(news.textContent) && news.querySelectorAll('p').length >= 4;
    closeModal(); G.state = 'play';
    // ---- the salvagers take the bell job, and the lead off the roofs counts
    go('p85_crosspool', 0.5, 'clear', 48); const sv = G.ents.find((e) => e && e.id === 'p60_cp_salv2'); msgs.length = 0;
    talk(sv); const sq = DLG.log.map((l) => l.t).join(' '); const st = DLG.choices && DLG.choices[0]; if (st) st.f(G); closeModal(); G.state = 'play';
    out.salv = G.flags.p86b_salv === 1 && /clapper/.test(sq);
    const leads = G.ents.filter((e) => e && e._r86 && e._r86.lead != null); for (const e of leads) useDeco(e); useDeco(leads[0]);
    out.lead = leads.length === 4 && msgs.some((t) => /4 of 4/.test(t)) && msgs.some((t) => /lead is gone/.test(t));
    // ---- the map journey draws from the same rosters
    TRAVEL_FOES.p83_stride = TRAVEL_FOES.p83_stride || ['hound']; G.tod = 0.5; wx('snow'); R.travelFoes(); const s1 = TRAVEL_FOES.p83_stride.join();
    wx('rain'); R.travelFoes(); out.travel = s1 === 'miredrone' && TRAVEL_FOES.p83_stride.join() === 'briarsprite';
    msg = _m; wx('clear');
    return out;
  });
  check(r.byHour, 'what walks a road is set by the hour, and is the same for the same hour');
  check(r.byWeather, 'and by the weather: the briar sleeps in snow (the Stride\'s own as well) and is up in the rain');
  check(r.mistHounds, 'the Hollows\' dogs are out by day only in mist');
  check(r.noRandom, 'nothing new draws on Math.random when it is woken');
  check(r.hissOut && r.hissDay, 'the Hiss is out on the Common at night in the wet, and not by day');
  check(r.trophy && r.keeperWeek, 'put down, she leaves her collar and is gone for a week');
  check(r.queenAfter && r.bell, 'the Briar Queen comes up the day after rain; the Sunk Bell in a storm');
  check(r.offer && r.paid, 'the turf-cutter asks for the collar, journals it, and pays 60 for it');
  check(r.week, 'the week\'s work: six dogs on the Common pays 35');
  check(r.crateShut && r.camp, 'a held camp keeps its crate; cleared, the crate pays once');
  check(r.campBack, 'a cleared camp is cold for a week, then held again');
  check(r.fire, 'by the raft-hands\' fire you sit until morning, mended');
  check(r.column && r.columnGone, 'the Office column walks one road a day; fighting it goes in the book; broken, it is gone a week');
  check(r.board, 'the notice boards say what is on the roads today');
  check(r.salv && r.lead, 'the salvagers take on the bell job; four pieces of lead count, once each');
  check(r.travel, 'the map journey meets what the roster has out');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
