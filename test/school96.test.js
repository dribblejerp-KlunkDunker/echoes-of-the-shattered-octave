// Phase 96: the Basilica school (js/school96.js). Run: PREVIEW_URL=http://127.0.0.1:4183 node test/school96.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4183';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.removeItem('octave.souls91.v1'); localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /next|continue/i }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold && Weather.hold('clear');
    const out = {}, A = SCHOOL96, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const play = () => { closeModal(); hide('#event'); G.state = 'play'; };
    const m = G.maps[A.MAP], tm = G.maps.p92_tiers;
    out.map = !!m && m.w === 18 && m.h === 14 && !!m.ceil && !m.outdoor && m.ceilZ > 2 && m.entities.length === m.baseCount;
    // the way in: a low black door in the Tiers' black wall at (89, 5); the iron door is still shut for ever
    const td = tm.get(89, 5), iron = tm.get(80, 5), bd = m.get(A.P.door[0], A.P.door[1]);
    out.doors = !!td && td.door && td.portal && td.portal.map === A.MAP && !!iron && iron.door && iron.locked === 'p92_never' && !iron.portal
      && !!bd && bd.door && bd.portal.map === 'p92_tiers' && tm.smooth[(bd.portal.y | 0) * tm.w + (bd.portal.x | 0)] === 1 && !tm.get(bd.portal.x | 0, bd.portal.y | 0)
      && !m.get(td.portal.x | 0, td.portal.y | 0);
    // the door both ways
    loadMap('p92_tiers'); play(); transfer(td.portal); play(); const inSchool = G.mapId === A.MAP && Math.hypot(Engine.cam.x - A.P.arrive[0], Engine.cam.y - A.P.arrive[1]) < 0.3;
    transfer(bd.portal); play(); const backOut = G.mapId === 'p92_tiers' && Math.abs(Engine.cam.x - 89.5) < 0.3 && Math.abs(Engine.cam.y - 6.6) < 0.3;
    out.bothWays = inSchool && backOut;
    // every room can be walked to from the arrival
    const W = m.w, dist = new Int32Array(W * m.h).fill(-1), q = [(A.P.arrive[1] | 0) * W + (A.P.arrive[0] | 0)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || dist[k] >= 0 || m.isBlocked(nx, ny)) continue; dist[k] = dist[i] + 1; q.push(k); } }
    const at = (x, y) => dist[(y | 0) * W + (x | 0)];
    out.reach = { passage: at(9, 11), room: at(7, 6), desk: at(7, 4), lectern: at(4, 5), notice: at(7, 9), practice: at(15, 4), step: at(A.P.step[0], A.P.step[1]) };
    out.reachOk = Object.values(out.reach).every((v) => v >= 0) && out.reach.practice > out.reach.room;
    // the rooms keep to their plan: the doorway into the practice-room is open and has no door
    out.doorway = !m.get(13, 5) && !!m.get(13, 4) && !!m.get(13, 6);
    // the hours: by day nobody; at dusk the treble and the Cantor, both in the practice-room; the rod goes with the Cantor
    loadMap(A.MAP); play();
    const people = () => G.ents.filter((e) => e.kind === 'npc' && !e.hidden);
    const rod = () => G.ents.find((e) => e._p96c === 'rod');
    const inPr = (e) => e.x >= A.P.practice[0] && e.x < A.P.practice[2] + 1 && e.y >= A.P.practice[1] && e.y < A.P.practice[3] + 1;
    G.tod = 0.5; update(0.016); const day = people().length, rodDay = !rod().hidden, hourDay = A.hour();
    G.tod = 0.2; update(0.016); const night = people().length;
    G.tod = 0.78; update(0.016); const dusk = people(), rodDusk = !rod().hidden, hourDusk = A.hour();
    out.hours = { day, night, dusk: dusk.length, hourDay, hourDusk };
    out.hoursOk = day === 0 && night === 0 && rodDay && hourDay === 'empty' && dusk.length === 2 && dusk.every(inPr) && !rodDusk && hourDusk === 'dusk'
      && dusk.some((e) => e.id === 'p96c_treble') && dusk.some((e) => e.id === 'p96c_cantor');
    // everyone stands on a floor, the treble a little raised onto the step
    out.standing = m.entities.filter((e) => e.kind === 'npc').every((e) => !m.isBlocked(e.x | 0, e.y | 0)) && m.entities.find((e) => e.id === 'p96c_treble').yOff < 0;
    // the held note: 528 at dusk, full in the practice-room, nothing at the door; a breath every nine seconds; nothing by day
    const [nx, ny] = A.P.note;
    out.note = A.NOTE === 528 && A.noteAt(nx, ny, 1, 0.78) > 0.2 && A.noteAt(15, 6, 1, 0.78) === A.noteAt(nx, ny, 1, 0.78)
      && A.noteAt(7, 6, 1, 0.78) > 0 && A.noteAt(7, 6, 1, 0.78) < A.noteAt(nx, ny, 1, 0.78)
      && A.noteAt(9.5, 12.9, 1, 0.78) === 0 && A.noteAt(nx, ny, 8, 0.78) === 0 && A.noteAt(nx, ny, 9.2, 0.78) > 0 && A.noteAt(nx, ny, 1, 0.5) === 0;
    Engine.cam.x = 15.2; Engine.cam.y = 5.2; A.setClock(2); G.tod = 0.78; update(0.016); const lvDusk = A.level();
    G.tod = 0.5; update(0.016); const lvDay = A.level();
    out.heard = lvDusk > 0.2 && lvDay === 0 && said(/holds one note/);
    // the roll: read, it gives its two numbers and is marked read
    msgs.length = 0; const roll = G.ents.find((e) => e._p96c === 'roll'); useDeco(roll);
    out.roll = G.flags.p96c_roll === 1 && said(/line through most of them/) && said(/three hundred and twelve/);
    // the notice tells of the east window; the bench itself is never placed
    msgs.length = 0; useDeco(G.ents.find((e) => e._p96c === 'notice'));
    out.notice = said(/dated 412/) && said(/other side of the iron wall/) && !G.ents.some((e) => /east window/i.test(e.label || '') && e._p96c === 'bench');
    // what is read: the slate (Book Three), the rod, the benches; no two benches drawn the same
    const lab = (k) => (G.ents.find((e) => e._p96c === k) || {}).label || '';
    const benches = G.ents.filter((e) => e._p96c === 'bench');
    out.read = /Grace is the note held/.test(lab('slate')) && /tuning-rod/.test(lab('rod')) && /worn pale/.test(lab('bench')) && G.ents.filter((e) => e._p96c === 'lancet').length === 2
      && benches.length === 8 && new Set(benches.map((e) => e.sprite)).size === 8;
    // the two people: the greeting, and nothing of the books' people
    out.people = NPCS.p96c_treble.greet.polite === 'Light keep you true.' && NPCS.p96c_cantor.greet.polite === 'Light keep you true.'
      && Object.keys(NPCS.p96c_treble.topics).length === 2 && Object.keys(NPCS.p96c_cantor.topics).length === 3;
    out.noNames = !A.TEXTS.some((t) => /Seraphina|Severin|Lyra|Kaelen|Ignatius|Solenne|Calloway|Under-Choir|Vessel's stone|chosen/i.test(t));
    // flags stay small and validated
    G.flags.p96c_seen = 'junk'; update(0.016); out.flags = Number.isInteger(G.flags.p96c_seen) && G.flags.p96c_seen >= 0 && G.flags.p96c_seen <= 255;
    // no foes, no items here; the art is made in code
    out.peace = !m.entities.some((e) => e.kind === 'enemy' || e.kind === 'item');
    out.art = ['p96c_bench', 'p96c_bench7', 'p96c_desk', 'p96c_tuningrod', 'p96c_slate', 'p96c_lancet', 'p96c_notice', 'p96c_roll', 'p96c_step', 'p96c_hushlamp', 'p96c_treble', 'p96c_cantor'].every((k) => Engine.sprites[k])
      && ['t_p96c_schooldoor', 't_p96c_blackstone', 't_p96c_schoolfloor'].every((k) => Engine.textures[k]);
    // building the school draws no chance
    const R = Math.random; let calls = 0; Math.random = function () { calls++; return R(); }; try { A.build(); } finally { Math.random = R; }
    out.noRandom = calls === 0;
    msg = _m;
    return out;
  });
  if (process.env.DEBUG96) console.log(JSON.stringify(r));
  check(r.map && r.doors, 'the school: its own dark map with a ceiling; a low black door at the Tiers\' (89, 5) leads in, a door leads back, and the iron door stays shut');
  check(r.bothWays, 'the door works both ways: in to the black passage, and back out onto the bell-gallery stair\'s planks');
  check(r.reachOk && r.doorway, 'from the arrival you can walk to the passage, the schoolroom, the desk, the lectern, the notice and the practice-room: ' + JSON.stringify(r.reach));
  check(r.hoursOk, 'the hours: nobody by day or night; at dusk the treble and the Cantor are in the practice-room, and the rod is in the Cantor\'s hands: ' + JSON.stringify(r.hours));
  check(r.standing, 'the people stand on the floor, the treble on the step');
  check(r.note && r.heard, 'at dusk one note is held at 528, full in the practice-room, fading through the schoolroom, silent at the door, with a breath every nine seconds; by day, none');
  check(r.roll, 'reading the roll gives its seven years and its two numbers, and marks it read');
  check(r.notice, 'the notice of 412 tells of the east window, and no bench is placed under it');
  check(r.read, 'the slate has the Cantor\'s lesson, the rod and the benches read, two black lancets; eight benches, no two alike');
  check(r.people && r.noNames, 'the treble and the Cantor greet you "Light keep you true."; no line names a book person or the Vessel\'s stone');
  check(r.flags && r.peace, 'flags stay small and validated; no foes and no items: a place to find');
  check(r.art && r.noRandom, 'the art is made in code, and building the school draws no chance');
  const texts = await page.evaluate(() => SCHOOL96.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
