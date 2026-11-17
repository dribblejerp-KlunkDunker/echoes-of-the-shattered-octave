// Phase 96: the black square in front of the Basilica's west end (js/bellyard96.js, global BLACKSQUARE96).
// Run: PREVIEW_URL=http://127.0.0.1:4183 node test/bellyard96.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4183';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => {
    try { localStorage.removeItem('octave.souls91.v1'); localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ }
    window.__p96cRand = 0; const r = Math.random; window.__p96cWatch = () => { Math.random = function () { window.__p96cRand++; return r.apply(this, arguments); }; }; window.__p96cUnwatch = () => { Math.random = r; };
  });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /next|continue/i }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold && Weather.hold('clear');
    const out = {}, A = BLACKSQUARE96, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    out.alias = window.BELLYARD96 === A;
    // no chance in the building: build the square again, watching Math.random
    window.__p96cWatch(); const m2 = A.build(); window.__p96cUnwatch(); out.noRand = window.__p96cRand === 0 && m2.w === 26;
    const m = G.maps[A.MAP], tm = G.maps.p92_tiers;
    out.map = !!m && m.w === 26 && m.h === 24 && m.entities.length === m.baseCount;
    // the way in: a black arch in the Tiers' wall at (72, 5), not the school's cell or the iron door; and the way back
    const td = tm.get(72, 5), bd = m.get(A.P.arch[0], A.P.arch[1]), iron = tm.get(80, 5), school = tm.get(89, 5);
    out.doors = !!td && td.door && td.portal && td.portal.map === A.MAP && !!bd && bd.door && bd.portal && bd.portal.map === 'p92_tiers'
      && tm.smooth[(bd.portal.y | 0) * tm.w + (bd.portal.x | 0)] === 1 && !m.get(td.portal.x | 0, td.portal.y | 0)
      && !!iron && iron.locked === 'p92_never' && !(school && school.portal && school.portal.map === A.MAP) && A.P.tiersDoor[0] === 72 && A.P.tiersDoor[1] === 5;
    // every part can be walked to from the arrival (rises of a step at most)
    const W = m.w, dist = new Int32Array(W * m.h).fill(-1), q = [(A.P.arrive[1] | 0) * W + (A.P.arrive[0] | 0)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || dist[k] >= 0 || m.get(nx, ny) || m.isBlocked(nx, ny) || Math.abs(m.lvls[k] - m.lvls[i]) > STEP_UP) continue; dist[k] = dist[i] + 1; q.push(k); } }
    const at = (x, y) => dist[(y | 0) * W + (x | 0)];
    out.reach = { stepsTop: at(13, 3), towerDoorFront: at(A.P.towerDoor[0], A.P.towerDoor[1] + 1), board: at(18, 8), shutters: A.SHUTTERS.map(([x, y]) => at(x, y)) };
    out.reachOk = out.reach.stepsTop > 0 && out.reach.towerDoorFront > 0 && out.reach.board > 0 && out.reach.shutters.every((v) => v >= 0) && m.lvls[3 * W + 13] > m.lvls[5 * W + 13] && m.lvls[5 * W + 13] > m.lvls[6 * W + 13];
    // walk in through the arch
    G.flags.p96c_sq = 0; transfer(td.portal); closeModal(); hide('#event'); G.state = 'play'; update(0.016);
    out.arrived = G.mapId === A.MAP && said(/thick as wool/);
    const put = (x, y, dir) => { Engine.cam.x = x; Engine.cam.y = y; if (dir != null) Engine.cam.dir = dir; p.feet = G.map.groundAt(x, y); p.fallFrom = null; p.fallV = 0; G.keys = {}; G.state = 'play'; };
    // the great black doors and the tower door stay shut when used
    put(13.5, 3.5, -Math.PI / 2); msgs.length = 0; interact(); const dShut = said(/nobody here knocks/) && G.mapId === A.MAP;
    put(20.5, 7.6, -Math.PI / 2); msgs.length = 0; interact(); const tShut = said(/barred inside/) && G.mapId === A.MAP;
    out.locked = dShut && tShut && m.get(13, 2).locked === 'p96c_never' && m.get(20, 6).locked === 'p96c_never' && !G.flags.p96c_never;
    // the shutters: by day they sleep; by night three of six answer, each in turn; the rest do not
    const sh = G.ents.filter((e) => e._p96c === 'shutter');
    G.tod = 0.4; msgs.length = 0; A.useOwn(sh[0]); const day = said(/sleeps behind it/);
    G.tod = 0.9; msgs.length = 0; A.useOwn(sh[0]); A.useOwn(sh[0]); A.useOwn(sh[2]); A.useOwn(sh[5]); A.useOwn(sh[1]);
    out.shutters = sh.length === 6 && day && said(/Light keep you true\. Speak low\./) && said(/keep to the shade/) && said(/When the bell goes, we stop/) && said(/Nobody knocks at those doors/) && said(/Nobody answers/);
    // the bell: three strokes, six seconds apart; the silence goes down the Tiers level on level and lifts 40 s after the last
    put(13.5, 12.5); const s0 = A.strokes(), h0 = A.tollsHeard(); G.flags.p96c_tolls = 0; msgs.length = 0;
    A.toll(); A.tick(0.05);
    const near = A.silentAt(7), far0 = A.silentAt(200); let tFar = -1, t = 0.05;
    for (; t < 15; t += 0.05) { A.tick(0.05); if (tFar < 0 && A.silentAt(200)) tFar = t; }
    out.strokes = A.strokes() - s0 === 3 && A.tollsHeard() - h0 === 1 && G.flags.p96c_tolls === 1 && said(/deep slow bronze note/) && said(/stays still a long time after/);
    out.wave = near && !far0 && tFar > 9 && tFar < 11;
    // while silent, the watchers do not answer
    msgs.length = 0; A.useOwn(sh[2]); out.hush = said(/until the bell has done/) && !said(/We hear it in our sleep/);
    // 40 s after the last stroke (which fell at 12 s), both lift
    for (; t < 51.8; t += 0.1) A.tick(0.1);
    const still = A.silentAt(7) && A.silentAt(200);
    for (let k = 0; k < 6; k++) A.tick(0.1);
    out.lift = still && !A.silentAt(7) && !A.silentAt(200);
    msgs.length = 0; A.useOwn(sh[2]); out.answerAgain = said(/We hear it in our sleep/);
    // noon rings it once, by the hour crossing, while you are in the square
    const s1 = A.strokes(), hh = A.tollsHeard(); G.tod = 0.4996; update(0.016); update(0.016); G.tod = 0.5002; update(0.016);
    for (let k = 0; k < 140; k++) update(0.1);
    out.noon = A.strokes() - s1 === 3 && A.tollsHeard() - hh === 1 && G.flags.p96c_tolls === 2;
    // and the third hour
    const s2 = A.strokes(); G.tod = 0.1248; update(0.016); G.tod = 0.1252; update(0.016); for (let k = 0; k < 140; k++) update(0.1);
    out.third = A.strokes() - s2 === 3;
    // a long rest steps over noon without ringing; the count stops at nine
    const s3 = A.strokes(); G.tod = 0.40; update(0.016); G.tod = 0.60; update(0.016); out.rest = A.strokes() === s3;
    G.flags.p96c_tolls = 9; A.toll(); A.tick(0.05); out.cap = G.flags.p96c_tolls === 9; for (let k = 0; k < 600; k++) A.tick(0.1);
    // in the Tiers: the line once per toll, and the folk stand still where the silence has reached, and do not talk
    loadMap('p92_tiers', { x: 80.5, y: 120.5, dir: 0 }); closeModal(); hide('#event'); G.state = 'play'; G.tod = 0.9;
    const folk = G.ents.filter((e) => e.kind === 'npc' && e.id === 'p92_folk');
    msgs.length = 0; A.toll(); A.tick(0.05); for (let k = 0; k < 120; k++) A.tick(0.1);
    out.tiersLine = msgs.filter((x) => /Beneath it the Tiers go silent, level on level/.test(x)).length === 1;
    out.still = folk.length >= 5 && folk.every((e) => e.wander === false);
    msgs.length = 0; talk(folk[0]); out.noTalk = said(/until the bell has done/);
    for (let k = 0; k < 450; k++) A.tick(0.1);
    out.walkAgain = folk.every((e) => e.wander === true);
    // the pictures are made in code; the dome stays white
    out.art = ['p96c_sqlancet', 'p96c_bell', 'p96c_board', 'p96c_dome', 'p96c_shutter'].every((k) => Engine.sprites[k]) && ['t_p96c_arch', 't_p96c_sqfloor', 't_p96c_blackdoors', 't_p96c_tower', 't_p96c_towerdoor', 't_p96c_sqhouse'].every((k) => Engine.textures[k]);
    const dm = m.entities.find((e) => e._p96c === 'dome'), dsp = Engine.sprites.p96c_dome; let white = 0, all = 0;
    for (let i = 0; i < dsp.data.length; i++) { const v = dsp.data[i]; if ((v >>> 24) < 100) continue; all++; if ((v & 255) > 200 && ((v >> 8) & 255) > 200 && ((v >> 16) & 255) > 190) white++; }
    out.dome = !!dm && dm.glow === 1 && white / all > 0.8;
    msg = _m;
    return out;
  });
  if (process.env.DEBUG96) console.log(JSON.stringify(r));
  check(r.alias && r.map && r.noRand, 'the black square: one map, 26 by 24, built without chance; BELLYARD96 still names it');
  check(r.doors, 'a black arch in the Tiers\' wall at (72, 5) leads in (not the school\'s cell, not the iron door, which stays shut), and an arch leads back');
  check(r.reachOk && r.arrived, 'from the arrival you can walk to the top of the steps, the tower door, the board and every shutter, and the steps rise: ' + JSON.stringify(r.reach));
  check(r.locked, 'the great black doors and the tower door stay shut when used');
  check(r.shutters, 'the shutters: asleep by day; by night three of six answer, each its words in turn, and the rest do not');
  check(r.strokes, 'a toll is three strokes; heard, it counts once and says what it is');
  check(r.wave, 'the silence goes down level on level: row 7 at once, row 200 after about ten seconds');
  check(r.hush && r.answerAgain, 'while the silence holds the shutters do not answer; after it, they do');
  check(r.lift, 'the silence lifts forty seconds after the last stroke, everywhere');
  check(r.noon && r.third, 'noon and the third hour each ring it once, by the hour crossing');
  check(r.rest && r.cap, 'a long rest steps over the hour without ringing; the count stops at nine');
  check(r.tiersLine && r.still && r.noTalk && r.walkAgain, 'in the Tiers: one line a toll; the folk stand still under the silence and do not talk, then walk again');
  check(r.art && r.dome, 'the art is made in code, and the dome over the line is white');
  const texts = await page.evaluate(() => BLACKSQUARE96.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  const bad = texts.filter((t) => /Seraphina|Severin|Lyra|Kaelen|Ignatius|Solenne|Calloway|Under-Choir|Vane|herald|proclaim|Restoration|Rite|Vessel|angel|Cantor/i.test(t) || /—/.test(t));
  check(bad.length === 0, 'no book character is named; no herald, no proclamation, no Rite; no em dashes' + (bad.length ? ': ' + bad.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
