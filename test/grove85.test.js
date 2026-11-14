// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/grove85.test.js
// Phase 85: the Deep Grove, the lost place off Greenroot Wood (js/grove85.js).
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
    const out = {}, GR = GROVE85, m = G.maps[GR.MAP], gap = GR.gap(), E = G.maps[ROAD79B.EAST];
    out.made = !!m && !!gap && m.danger === 0 && !m.entities.some((e) => e.kind === 'enemy' || e.kind === 'npc');
    const door = (mm, t) => { for (let i = 0; i < mm.cells.length; i++) { const c = mm.cells[i]; if (c && c.door && c.portal && c.portal.map === t) return c.portal; } return null; };
    const inP = door(E, GR.MAP), outP = door(m, ROAD79B.EAST); out.doors = !!inP && !!outP && !m.isBlocked(inP.x | 0, inP.y | 0) && !E.isBlocked(outP.x | 0, outP.y | 0);
    // the same hour and the same count give the same ways; another hour, or another visit, can give others
    G.tod = 0.40; G.flags.p85g_visits = 3; const a1 = [GR.gladeAt(1), GR.gladeAt(2), GR.lowWay(0), GR.lowWay(1), GR.lowWay(2)].join();
    const a2 = [GR.gladeAt(1), GR.gladeAt(2), GR.lowWay(0), GR.lowWay(1), GR.lowWay(2)].join(); out.same = a1 === a2;
    let differs = false; for (let v = 0; v < 8 && !differs; v++) for (let t = 0; t < 8 && !differs; t++) { G.flags.p85g_visits = v; G.tod = t / 8 + 0.01; if ([GR.gladeAt(1), GR.gladeAt(2), GR.lowWay(0), GR.lowWay(1), GR.lowWay(2)].join() !== a1) differs = true; } out.changes = differs;
    out.twoGlades = (() => { for (let v = 0; v < 12; v++) for (let t = 0; t < 8; t++) { G.flags.p85g_visits = v; G.tod = t / 8 + 0.01; if (GR.gladeAt(1) === GR.gladeAt(2) || GR.gladeAt(1) < 1 || GR.gladeAt(2) > 3) return false; } return true; })();
    // in by the gap, follow the low note three times: the Stool
    loadMap(ROAD79B.EAST, { x: gap.x, y: gap.y, dir: -Math.PI / 2 }); G.state = 'play'; G.tod = 0.4;
    loadMap(GR.MAP, { x: inP.x, y: inP.y, dir: inP.dir }); G.state = 'play'; update(0.016);
    const msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const visits = G.flags.p85g_visits; out.counted = visits >= 1 && G.flags.p85g_depth === 0;
    for (let d = 0; d < 3; d++) GR.takeWay(GR.gladeAt(d), GR.lowWay(d));
    out.stool = G.map.id === GR.MAP && Math.hypot(Engine.cam.x - GR.STOOL[0], Engine.cam.y - GR.STOOL[1]) < 8;
    Engine.cam.x = GR.STOOL[0] + 0.5; Engine.cam.y = GR.STOOL[1] + 1.8; update(0.016); out.stoolIn = G.flags.p85g_stool === 1 && msgs.some((t) => /not in any key/.test(t));
    out.bough = G.ents.some((e) => e && e.item === 'w_p85_bough') && WEAPONS.p85_bough.type === 'iron';
    // a wrong way: out at the gap
    loadMap(ROAD79B.EAST, { x: gap.x, y: gap.y, dir: -Math.PI / 2 }); loadMap(GR.MAP, { x: inP.x, y: inP.y, dir: inP.dir }); G.state = 'play'; update(0.016);
    const wrong = (GR.lowWay(0) + 1) % 3; GR.takeWay(0, wrong); out.lost = G.map.id === ROAD79B.EAST && Math.hypot(Engine.cam.x - gap.x, Engine.cam.y - gap.y) < 1;
    // the notes come with captions, the low one different from the high
    loadMap(GR.MAP, { x: inP.x, y: inP.y, dir: inP.dir }); G.state = 'play'; update(0.016); msgs.length = 0;
    const ways = G.ents.filter((e) => e && e._p85g === 'way' && e._g === 0); const low = ways.find((e) => e._k === GR.lowWay(0)), high = ways.find((e) => e._k !== GR.lowWay(0));
    Engine.cam.x = low.x; Engine.cam.y = low.y + (low._k === 1 ? 1.2 : 0); Engine.cam.x += low._k === 0 ? 1.2 : low._k === 2 ? -1.2 : 0; update(0.016); const capLow = msgs.slice();
    msgs.length = 0; Engine.cam.x = high.x + (high._k === 0 ? 1.2 : high._k === 2 ? -1.2 : 0); Engine.cam.y = high.y + (high._k === 1 ? 1.2 : 0); update(0.016);
    out.captions = capLow.some((t) => /low note/.test(t)) && msgs.some((t) => /thinner note/.test(t));
    // night: the circle closes, and something is waiting at the gap
    G.tod = 0.95; Engine.cam.x = GR.GLADES[0][0] + 0.5; Engine.cam.y = GR.GLADES[0][1] + 0.5; for (let i = 0; i < 25; i++) update(1);
    out.circle = G.flags.p85g_called === 1 && msgs.some((t) => /ring of quiet/.test(t));
    const n0 = G.maps[ROAD79B.EAST].entities.filter((e) => e && e._p85gCalled).length;
    loadMap(ROAD79B.EAST, { x: gap.x, y: gap.y, dir: Math.PI / 2 }); G.state = 'play';
    out.waiting = G.ents.filter((e) => e && e._p85gCalled).length > n0 && G.flags.p85g_called === 0;
    out.coat = ARMOR.a_p85_coat.slot === 'body' && m.entities.some((e) => e.item === 'a_p85_coat');
    msg = _m;
    return out;
  });
  check(r.made, 'the Deep Grove exists, with nobody in it and nothing to fight');
  check(r.doors, 'the gap in Greenroot Wood and the way out lead to each other, onto open ground');
  check(r.same && r.changes, 'the ways are the same for the same hour and the same visit, and change with either');
  check(r.twoGlades, 'each visit walks two different inner glades');
  check(r.counted, 'each time in is counted');
  check(r.stool && r.stoolIn, 'three low notes lead to the Stool; standing in it, you hear what is under the roots, and nothing opens');
  check(r.bough && r.coat, 'the fallen iron-bough lies at the Stool\'s foot, the carter\'s oilskin in a glade');
  check(r.lost, 'walk by eye, and the wood lets you out at the gap');
  check(r.captions, 'every note has a caption, and the low one reads differently');
  check(r.circle && r.waiting, 'after dark the silent circle closes, and something waits at the gap when you come out');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
