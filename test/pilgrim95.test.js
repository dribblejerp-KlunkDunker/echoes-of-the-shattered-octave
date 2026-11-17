// Phase 95: the Pilgrim Chain and the Altar (js/pilgrim95.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/pilgrim95.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
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
    const out = {}, A = PILGRIM95, S = SOULS91, p = G.player, B = A.B, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const play = () => { closeModal(); hide('#event'); G.state = 'play'; };
    const m = G.maps[A.MAP], hm = G.maps[A.HOUSE], am = G.maps.p94_anchorage, W = m.w;
    out.maps = !!m && m.w === 64 && m.h === 266 && m.entities.length === m.baseCount && !!hm && hm.entities.length === hm.baseCount && m.bright === true;
    // the ways: a stair from the winch-room to the robing-room and back; the mouth; the barred door
    const ad = am.get(A.P.anchDoor[0], A.P.anchDoor[1]), hd = hm.get(A.P.hDoor[0], A.P.hDoor[1]), md = hm.get(A.P.mouthDoor[0], A.P.mouthDoor[1]), nd = hm.get(A.P.northDoor[0], A.P.northDoor[1]), cd = m.get(33, 4);
    out.doors = !!ad && ad.door && ad.portal.map === A.HOUSE && !hm.get(ad.portal.x | 0, ad.portal.y | 0) && !!hd && hd.portal.map === 'p94_anchorage' && am.smooth[(hd.portal.y | 0) * am.w + (hd.portal.x | 0)] === 1
      && !!md && md.locked === 'p95_robe' && md.portal.map === A.MAP && m.smooth[(md.portal.y | 0) * W + (md.portal.x | 0)] === 1 && !!nd && nd.locked === '__never' && !nd.portal
      && !!cd && cd.door && cd.portal.map === A.HOUSE && !hm.get(cd.portal.x | 0, cd.portal.y | 0);
    // the house can be walked: the door, the lamp, Perpetua, the stair, the ring, the mouth
    const flood = (mp, x0, y0, ok) => { const d = new Int32Array(mp.w * mp.h).fill(-1), q = [(y0 | 0) * mp.w + (x0 | 0)]; d[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % mp.w, y = (i / mp.w) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * mp.w + nx; if (nx < 0 || ny < 0 || nx >= mp.w || ny >= mp.h || d[k] >= 0 || !ok(nx, ny, k)) continue; d[k] = d[i] + 1; q.push(k); } } return (x, y) => d[(y | 0) * mp.w + (x | 0)]; };
    const hAt = flood(hm, A.P.hArrive[0], A.P.hArrive[1], (x, y) => !hm.get(x, y));
    const L = A.lamps();
    out.house = L.length === 3 && hAt(L[0].wx, L[0].wy) >= 0 && hAt(A.P.perpetua[0], A.P.perpetua[1] + 1) >= 0 && hAt(A.P.mouthIn[0], A.P.mouthIn[1]) >= 0 && hAt(A.P.winch[0] + 1.5, A.P.winch[1]) >= 0;
    // the chain can be walked from the mouth to the Altar's rim, and no further: the disc is never reached
    const cAt = flood(m, A.P.arrive[0], A.P.arrive[1], (x, y, k) => m.smooth[k] === 1 && !m.get(x, y) && !m.isBlocked(x, y));
    out.reach = { cage: cAt(L[1].wx, L[1].wy), far: cAt(A.P.keeper[0], A.P.keeper[1]), winch: cAt(A.P.winchRide[0], A.P.winchRide[1]), rim: cAt(L[2].wx, L[2].wy), altar: cAt(A.P.altar[0], A.P.altar[1] - 4), eye: cAt(A.P.eye[0], A.P.eye[1] - 1), slope: cAt(A.P.slopeIn[0], A.P.slopeIn[1]) };
    out.reachOk = out.reach.cage > 0 && out.reach.far > out.reach.cage && out.reach.winch > 0 && out.reach.rim > out.reach.far && out.reach.altar === -1 && out.reach.eye === -1 && out.reach.slope === -1
      && m.smooth[(A.P.slopeIn[1] | 0) * W + (A.P.slopeIn[0] | 0)] === 1 && A.lvlAt(228) > A.lvlAt(210) + 2.5 && A.lvlAt(190) > A.lvlAt(20) + 3;
    // the mouth: shut without the robe, open in it
    loadMap(A.HOUSE); play();
    const put = (x, y) => { Engine.cam.x = x; Engine.cam.y = y; p.feet = G.map.groundAt(x, y); p.fallFrom = null; p.fallV = 0; G.keys = {}; };
    put(A.P.mouthIn[0], A.P.mouthIn[1]); update(0.016); const shut = !G.flags.p95_robe;
    G.give('a_p95_robe'); p.armor.body = 'a_p95_robe'; update(0.016); const open = G.flags.p95_robe === 1;
    delete p.armor.body; update(0.016);
    out.mouth = shut && open && !G.flags.p95_robe && said(/under the seventh anchor-house/);
    out.people = G.ents.some((e) => e.kind === 'npc' && e.id === 'p95_perpetua') && G.ents.filter((e) => e.kind === 'npc' && e.id === 'p95_warden').length === 2 && Object.keys(NPCS.p95_perpetua.topics).length === 6 && NPCS.p95_perpetua.shop.some((s) => s.item === 'a_p95_robe')
      && /second note is sin/.test(Object.values(NPCS.p95_warden.topics).join(' '));
    // the chain
    p.armor.body = 'a_p95_robe'; update(0.016); loadMap(A.MAP); play(); msgs.length = 0;
    // the hours: by day two lights, by night the white, thinnest in the dead hour
    const hours = [0.5, 0.9, 0.23].map((t) => { G.tod = t; return A.hour(); });
    out.hours = hours.join() === 'day,night,dead' && A.rateOf('day') > A.rateOf('night') && A.rateOf('night') > A.rateOf('dead') && A.rateOf('dead') > 0;
    // the choir shifts: eight, on the place's own clock, each a moving shade; outside them the Bleach takes you by the hour
    const q0 = A.partyAt(0, 0), q1 = A.partyAt(0, 10), q2 = A.partyAt(0, 10);
    const parties = G.ents.filter((e) => e._p95 === 'party');
    out.parties = parties.length === A.PARTIES && q1.y === q2.y && Math.abs(q1.y - q0.y - 10 * A.PARTY_SPEED) < 1e-6 && [0, 37, 80, 149].every((t) => { const q = A.partyAt(3, t); return q.y >= A.P.span1[0] && q.y <= A.P.span1[1]; });
    G.tod = 0.9; p.hp = p.hpMax = 200; A.setClock(0);
    const drain = (x, y, s) => { put(x, y); A.tick(0.001); const h0 = p.hp; for (let i = 0; i < s * 10; i++) { Engine.cam.x = x; Engine.cam.y = y; A.tick(0.1); } return h0 - p.hp; };
    // find an open stretch of the first span with no party near at clock 0, and hold the clock there
    let openY = -1; for (let y = 12; y < 98 && openY < 0; y++) if (!A.shadeAt(33, y + 0.5)) { let clear = true; for (let i = 0; i < A.PARTIES; i++) { const q = A.partyAt(i, 0); if (Math.abs(q.y - (y + 0.5)) < 4) clear = false; } if (clear) openY = y + 0.5; }
    const hold = (fn) => { const c0 = A.clock(); const r0 = fn(); A.setClock(c0); return r0; };
    A.setClock(0); A.tick(0.001); A.setClock(0);
    const nightLoss = (() => { A.setClock(0); put(33, openY); A.tick(0.001); const h0 = p.hp; for (let i = 0; i < 10; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); } return h0 - p.hp; })();
    G.tod = 0.5; const dayLoss = (() => { A.setClock(0); put(33, openY); A.tick(0.001); const h0 = p.hp; for (let i = 0; i < 10; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); } return h0 - p.hp; })();
    G.tod = 0.23; const deadLoss = (() => { A.setClock(0); put(33, openY); A.tick(0.001); const h0 = p.hp; for (let i = 0; i < 20; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); } return h0 - p.hp; })();
    out.loss = [nightLoss, dayLoss, deadLoss, openY];
    out.bleach = openY > 0 && nightLoss >= 1 && nightLoss <= 2 && dayLoss >= 2 && dayLoss <= 4 && deadLoss >= 1 && deadLoss <= 2 && said(/taking the colour out of your hands/);
    // under a canopy: nothing
    G.tod = 0.5; A.setClock(0); A.tick(0.001); A.setClock(0); const pq = A.partyAt(2, 0); put(pq.x, pq.y); A.setClock(0); A.tick(0.001); const hp1 = p.hp; for (let i = 0; i < 10; i++) { A.setClock(0); Engine.cam.x = pq.x; Engine.cam.y = pq.y; A.tick(0.1); }
    out.canopy = p.hp === hp1 && A.shadeAt(pq.x, pq.y) === 'canopy';
    // the card
    drawHUD(); const card = document.getElementById('p95-card'); out.card = !!card && card.querySelectorAll('span').length === 3 && /sun up/.test(card.textContent);
    // the cage is the only roof on the chain: shade, and a lamp
    G.tod = 0.9; put(L[1].x + 0.9, L[1].y + 0.6); update(0.016);
    out.cage = A.shadeAt(33, 105.5) === 'roof' && A.shadeAt(33, 109.5) === '' && S.isLit(L[1]) && S.noteOf(A.MAP) === 528 && G.ents.some((e) => e.kind === 'item' && e.item === 'a_p95_cowl');
    // the second span: a Flambeau walks in his own shade; put down, his censer burns on a while, then goes out
    const sentries = G.ents.filter((e) => e._p95 === 'sentry'); const s0 = sentries[0];
    s0.state = 'idle'; s0._dir = 1; put(s0.x, s0.y - 1.5); const y0 = s0.y; A.tick(0.5); A.tick(0.5);
    const walked = Math.abs(s0.y - y0) > 0.5, fireShade = A.shadeAt(s0.x, s0.y + 1.2) === 'fire' && A.shadeAt(s0.x, s0.y + 4) === '';
    // in the whites (three pieces) he takes you for a bearer until you are close
    G.give('a_p95_cowl'); G.give('a_p95_sandals'); p.armor.body = 'a_p95_robe'; p.armor.head = 'a_p95_cowl'; p.armor.feet = 'a_p95_sandals';
    const white = GEAR87.special('white'); s0.state = 'idle'; s0.passive = false; put(s0.x, s0.y + 4); A.tick(0.01); const far = s0.state === 'passive';
    put(s0.x, s0.y + 1.2); A.tick(0.01); const near = s0.state === 'idle';
    out.sentry = sentries.length === 4 && walked && fireShade && white && far && near;
    msgs.length = 0; const sx = s0.x, sy = s0.y; killEnemy(s0); put(sx, sy + 1); A.tick(0.01);
    const left = A.censers().length === 1 && A.shadeAt(sx, sy + 1) === 'fire' && said(/sits down against the rail/) && !said(/is destroyed/);
    A.censers()[0].t = 0.01; A.tick(0.05);
    out.censer = left && A.censers().length === 0 && A.shadeAt(sx, sy + 1) === '' && said(/goes out/);
    // the slope: down the ladder; walk, and they stand; run, and they turn
    const lt = G.ents.find((e) => e._p95 === 'ladderTop'), lb = G.ents.find((e) => e._p95 === 'ladderBot');
    put(33, A.P.ladderTop[1]); A.useOwn(lt); const onSlope = Engine.cam.x > 37 && m.smooth[(Engine.cam.y | 0) * W + (Engine.cam.x | 0)] === 1 && A.shadeAt(Engine.cam.x, Engine.cam.y) === 'roof';
    const gg = G.ents.filter((e) => e._p95 === 'gg');
    put(42, 192); A.tick(0.1); Engine.cam.x = 42.1; A.tick(0.1); const quiet = !A.turned();
    Engine.cam.x = 43.2; A.tick(0.1); const ran = A.turned() && gg.every((e) => e.sprite === 'p94_glassgrown_turn' && e.kind === 'deco');
    A.useOwn(lb); const back = Math.abs(Engine.cam.x - 33) < 0.1;
    out.slope = onSlope && gg.length === 11 && quiet && ran && back && said(/turn their heads/) && G.ents.some((e) => e.kind === 'item' && e.item === 'a_p95_sandals');
    // the far end: the Brother-Captain throws glass-fire; it burns, and the white stands off it
    const kp = G.ents.find((e) => e._p95 === 'keeper'), wl = G.ents.find((e) => e._p95 === 'winchL'), grip = G.ents.find((e) => e._p95 === 'grip');
    msgs.length = 0; put(A.P.winchRide[0], A.P.winchRide[1]); A.useOwn(wl); const winchShut = said(/will not let you near the drum/) && !G.flags.p95_cage;
    put(A.P.cageRide[0], A.P.cageRide[1]); A.useOwn(grip); const gripShut = said(/will not come off the cable/) && Engine.cam.y < 120;
    G.tod = 0.9; p.hp = p.hpMax = 400; kp.state = 'chase'; kp.x = 33; kp.y = 214; put(33, 206); msgs.length = 0;
    for (let i = 0; i < 30 && !A.fires().length; i++) { kp.state = 'chase'; A.tick(0.1); }
    const f0 = A.fires()[0];
    const fire = !!f0 && said(/glass-fire falls where you stood/) && A.shadeAt(f0.x + 1.5, f0.y) === 'fire' && A.shadeAt(kp.x + 2, kp.y) === 'fire';
    kp.x = 40; kp.y = 202; put(f0.x, f0.y); const hb = p.hp; for (let i = 0; i < 10; i++) { kp.state = 'idle'; Engine.cam.x = f0.x; Engine.cam.y = f0.y; A.tick(0.1); }
    out.fire = fire && hb - p.hp >= 3 && hb - p.hp <= 6 && winchShut && gripShut;
    // his fire goes out: the stave and the warrant, once; he kneels; nobody is "destroyed"
    msgs.length = 0; killEnemy(kp); update(0.016); update(0.016);
    const kn = G.ents.find((e) => e._p95 === 'kneel');
    out.down = G.ents.filter((e) => e.kind === 'item' && (e.item === 'w_p95_stave' || e.item === 'v_p95_warrant')).length === 2 && G.flags.p95_kdrop === 1 && said(/goes out/) && said(/kneels/) && !said(/is destroyed/) && (G.flags.p95k | 0) > 0 && kn && kn.hidden === false && A.fires().length === 0;
    update(0.016); out.downOnce = G.ents.filter((e) => e.kind === 'item' && e.item === 'w_p95_stave').length === 1;
    // the shortcut: the Lumina brake freed, the cage rides both ways
    msgs.length = 0; put(A.P.winchRide[0], A.P.winchRide[1]); A.useOwn(wl); const freed = G.flags.p95_cage === 1 && said(/take the brake off the Lumina drum/);
    A.useOwn(wl); const rodeDown = Engine.cam.y < 110 && A.shadeAt(Engine.cam.x, Engine.cam.y) === 'roof';
    A.useOwn(grip); const rodeUp = Engine.cam.y > 200 && m.smooth[(Engine.cam.y | 0) * W + (Engine.cam.x | 0)] === 1;
    out.cageRide = freed && rodeDown && rodeUp && /Ride it up/.test(grip.label);
    // the rim: shade under the canopies, the lamp, the line; what is seen
    msgs.length = 0; put(L[2].x + 0.9, L[2].y - 0.5); update(0.016); const lamp3 = S.isLit(L[2]) && A.shadeAt(Engine.cam.x, Engine.cam.y) === 'roof';
    put(33, 229.6); A.tick(0.01); put(25, 228); A.tick(0.01); put(41, 228); A.tick(0.01);
    const lineEnts = G.ents.filter((e) => e._p95 === 'line');
    let rowShut = true; for (let i = 0; i < W; i++) { const k = A.P.pillarRow * W + i; if (m.smooth[k] === 1 && !m.get(i, A.P.pillarRow) && !m.isBlocked(i, A.P.pillarRow)) rowShut = false; }
    out.rim = lamp3 && rowShut && lineEnts.length === 7 && lineEnts.every((e) => e.kind === 'deco') && said(/staves come down across the gap/) && said(/Altar of Lumina/) && said(/size of a cartwheel/) && said(/Vessel's stone/)
      && G.ents.some((e) => e._p95 === 'eye') && G.ents.filter((e) => e._p95 === 'choir').length === 3;
    // the Altar choir stands under its canopies only at the dawn office (the hour after the dead hour)
    const choir = G.ents.filter((e) => e._p95 === 'choir'); G.tod = 0.9; A.tick(0.01); const away = choir.every((e) => e.hidden === true);
    msgs.length = 0; G.tod = 0.26; put(33, 228); A.tick(0.01); out.office = away && choir.every((e) => e.hidden === false) && A.dawnOffice() && said(/The dawn office/); G.tod = 0.9; A.tick(0.01);
    // the full set: leaving shade, the Bleach waits three breaths
    p.weapons = p.weapons || []; if (!p.weapons.includes('p95_stave')) p.weapons.push('p95_stave'); p.weapon = p.weapons.indexOf('p95_stave');
    const full = GEAR87.special('afterglow'); G.tod = 0.5; A.setClock(0); put(33, openY); A.tick(0.001); const hg = p.hp;
    for (let i = 0; i < 25; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); } const graceHeld = p.hp === hg;
    for (let i = 0; i < 15; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); }
    out.grace = full && graceHeld && p.hp < hg;
    // lost to the Bleach: you wake by the last lamp, and your Piece waits on the chain
    delete p.armor.body; delete p.armor.head; delete p.armor.feet; p.gold = 17; p.hp = 2; G.tod = 0.5; put(33, openY); for (let i = 0; i < 4; i++) update(1 / 30);
    for (let i = 0; i < 60 && !G.dead; i++) { A.setClock(0); Engine.cam.x = 33; Engine.cam.y = openY; A.tick(0.1); }
    out.died = G.dead;
    document.getElementById('btn-wake').onclick(); update(0.016); play();
    const pc = S.piece();
    out.piece = !!pc && pc.m === A.MAP && pc.g === 17 && G.mapId === A.MAP && Math.hypot(Engine.cam.x - L[2].wx, Engine.cam.y - L[2].wy) < 0.3;
    // the gear: each its own look and picture, in the seventeenth set
    out.gear = ['a_p95_robe', 'a_p95_cowl', 'a_p95_sandals'].every((id) => ARMOR[id] && ITEMS[id] && GEARLOOK21.ARMOR[id] && ICONS.PIX[id]) && WEAPONS.p95_stave && GEARLOOK21.WEAPONS.p95_stave && ICONS.PIX.w_p95_stave && ITEMS.v_p95_warrant.valuable && ICONS.PIX.v_p95_warrant
      && GEAR87.SET_OF && GEAR87.SET_OF.a_p95_robe === 'pilgrim' && GEAR87.SETS.length >= 17;
    out.standing = m.entities.filter((e) => e.kind === 'enemy').every((e) => m.smooth[(e.y | 0) * W + (e.x | 0)] === 1) && hm.entities.filter((e) => e.kind === 'npc').every((e) => !hm.get(e.x | 0, e.y | 0));
    out.art = ['p95_party', 'p95_party_b', 'p95_canopy', 'p95_eye', 'p95_spire', 'p95_peak', 'p95_perpetua', 'p95_robes', 'p95_sant_kneel', 'p95_censer', 'p95_railpost', 'p95_link'].every((k) => Engine.sprites[k])
      && ['p95_flambeau', 'p95_sant'].every((n) => ['', '_w1', '_w2', '_a1', '_a2'].every((s) => Engine.sprites[n + s]));
    msg = _m;
    return out;
  });
  if (process.env.DEBUG95) console.log(JSON.stringify(r));
  check(r.maps && r.doors, 'two maps (the seventh anchor-house with the robing-room under it, and the chain): a stair from the winch-room leads in and back; the door to the top tier never opens');
  check(r.house && r.people, 'the house can be walked; Perpetua Lisle robes you (six things to say, a robe to sell); two Flambeaux keep the winch');
  check(r.mouth, 'the mouth is shut to anyone not in a pilgrim\'s robe, and open in one');
  check(r.reachOk, 'from the mouth you can walk to the cage, the far end, the Lumina winch and the Altar\'s rim; never onto the Altar or to the Eye; the slope is reached only by the ladder: ' + JSON.stringify(r.reach));
  check(r.hours, 'the hours: two lights by day, the white by night, thinnest in the dead hour');
  check(r.parties && r.canopy, 'eight choir shifts go out and back on the place\'s own clock; under a canopy the Bleach does not touch you');
  check(r.bleach, 'in the open the Bleach takes you by the hour (a second at night, by day, and two in the dead hour): ' + JSON.stringify(r.loss));
  check(r.card, 'the card shows the hour, and shade or light');
  check(r.cage, 'the cage is the only roof on the chain: shade, the half-way lamp (the Souls rules, group j; 528), the bearer\'s cowl');
  check(r.sentry, 'the Flambeaux of the Chain walk their lengths in the shade of their own fire; in the whites they take you for a bearer until you are close');
  check(r.censer, 'put down, a Flambeau leaves his censer burning: shade for a while, then it goes out; nobody is "destroyed"');
  check(r.slope, 'the Glass-Grown\'s slope: down the ladder into the chain\'s shadow; eleven of them, not foes; walk and they stand, run and they turn; the sandals');
  check(r.fire, 'the Brother-Captain throws glass-fire: it burns where it lies and shades round it; his winch and the cage are shut while his fire stands');
  check(r.down && r.downOnce, 'his fire goes out: he kneels, and leaves the dark stave and the warrant, once; the keeper\'s week begins');
  check(r.cageRide, 'the shortcut: the Lumina brake freed, the cage rides between the half-way mark and the winch, both ways');
  check(r.rim, 'the Altar\'s rim: shade under the canopies, the third lamp, a line of Flambeaux across every gap; the Altar, the Vessel\'s stone and the Eye are seen');
  check(r.office, 'the Pure Note is sounded at the Altar at the dawn office only: the choir stands under its canopies then, and at no other hour');
  check(r.grace, 'the Pilgrim Chain set in full: leaving shade, the Bleach waits three breaths');
  check(r.died && r.piece, 'lost to the Bleach: you wake by the last lamp and your Piece waits on the chain');
  check(r.gear, 'the gear: robe, cowl, sandals and the Dark Stave, each with its own look and picture, the seventeenth set');
  check(r.standing && r.art, 'everyone stands on the floor; the canopies, the Flambeaux (five poses), the Brother-Captain (five poses), the Eye and the Spire are drawn in code');
  const texts = await page.evaluate(() => PILGRIM95.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ' (' + fr.length + ' missing): ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
