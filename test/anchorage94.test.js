// Phase 94: the Anchorage (js/anchorage94.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/anchorage94.test.js
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
    const out = {}, A = ANCHORAGE94, S = SOULS91, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const m = G.maps[A.MAP], tm = G.maps.p92_tiers;
    out.map = !!m && m.w === 80 && m.h === 136 && m.entities.length === m.baseCount;
    // the way in: a door in the Tiers by the goods-cage's top, and the door back
    const td = tm.get(A.P.tiersDoor[0], A.P.tiersDoor[1]), bd = m.get(A.P.door[0], A.P.door[1]);
    out.doors = !!td && td.door && td.portal.map === A.MAP && !!bd && bd.door && bd.portal.map === 'p92_tiers'
      && tm.smooth[(bd.portal.y | 0) * tm.w + (bd.portal.x | 0)] === 1 && m.smooth[(td.portal.y | 0) * m.w + (td.portal.x | 0)] === 1;
    // every room can be walked to from the door (links and pins are floor; the well is not)
    const W = m.w, dist = new Int32Array(W * m.h).fill(-1), q = [(A.P.arrive[1] | 0) * W + (A.P.arrive[0] | 0)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || dist[k] >= 0 || !m.smooth[k] || m.get(nx, ny)) continue; dist[k] = dist[i] + 1; q.push(k); } }
    const near = (x, y) => { let best = -1; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const k = ((y | 0) + dy) * W + (x | 0) + dx; const v = dist[k]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    const L = A.lamps();
    out.reach = { lamps: L.map((l) => near(l.x, l.y)), bardo: near(A.P.bardo[0], A.P.bardo[1]), gallery: near(40, 70), grown: near(10, 70), landing: near(56, 85), hall: near(44, 100), lever: near(A.P.leverItem[0], A.P.leverItem[1]), deep: near(A.P.keeper[0], A.P.keeper[1]), cage: near(A.P.cageBottom[0], A.P.cageBottom[1]) };
    out.reachOk = L.length === 3 && Object.values(out.reach).every((v) => Array.isArray(v) ? v.every((x) => x >= 0) : v >= 0);
    out.down = A.lvlAt(123) < A.lvlAt(10) - 7;
    // the change: a plain hunt on nine, every row all nine, one bone at a time, the same for everyone
    out.rows = A.ROWS.length === 18 && A.ROWS.every((r0) => r0.slice().sort((a, b) => a - b).join('') === '123456789') && new Set(A.ROWS.map((r0) => r0.join(''))).size === 18
      && A.bellAt(0) === 1 && A.bellAt(A.STROKE * 9 + 0.01) === 2 && A.bellAt(A.STROKE * 9 + 0.01) === A.bellAt(A.STROKE * 9 + 0.5);
    // when is the seventh's stroke? (the first row: seventh stroke)
    let t7 = -1; for (let n = 0; n < 40 && t7 < 0; n++) if (A.bellAt(n * A.STROKE + 0.01) === 7) t7 = n * A.STROKE;
    loadMap(A.MAP); play(); function play() { closeModal(); hide('#event'); G.state = 'play'; }
    const put = (x, y) => { Engine.cam.x = x; Engine.cam.y = y; p.feet = m.groundAt(x, y); p.fallFrom = null; p.fallV = 0; G.keys = {}; };
    // on a link when the seventh speaks: thrown down the chain
    put(39.9, 33.5); p.hp = p.hpMax; A.setClock(t7 - 0.05); update(0.016); const y0 = Engine.cam.y, hp0 = p.hp; update(0.1);
    out.thrown = p.hp === hp0 - A.consts.THROW && Engine.cam.y > y0 + 0.3 && said(/throws you down the chain/) && m.smooth[(Engine.cam.y | 0) * W + (Engine.cam.x | 0)] === 1;
    // on a pin: held
    put(39.9, 35.5); p.hp = p.hpMax; A.setClock(t7 + 18 * A.STROKE * 9 - 0.05); update(0.016); const y1 = Engine.cam.y; update(0.1);
    out.held = p.hp === p.hpMax && Math.abs(Engine.cam.y - y1) < 0.05 && said(/it only shakes you/);
    // another bone's stroke on a link: nothing
    put(39.9, 33.5); p.hp = p.hpMax; A.setClock(0); update(0.016); update(0.1); out.other = p.hp === p.hpMax;
    // the card shows the row, the seventh marked
    drawHUD(); const card = document.getElementById('p94-card'); out.card = !!card && card.querySelectorAll('.b').length === 9 && card.querySelectorAll('.b.s').length === 1 && card.querySelectorAll('.b.on').length === 1;
    // the lamps: the winch-room's lights when you stand by it; a Piece here rings at 528
    put(L[0].x + 0.9, L[0].y + 0.6); update(0.016);
    out.lamp = S.isLit(L[0]) && G.flags.p91_li === L[0].id + 1 && S.noteOf(A.MAP) === 528;
    // off the chain's side: the well; you wake by the winch-room's lamp and your Piece waits on the chain
    put(39.9, 33.5); update(0.016); p.gold = 21; for (let i = 0; i < 4; i++) update(1 / 30);
    A.setClock(0.2); Engine.cam.x = 36.5; Engine.cam.y = 33.5; for (let i = 0; i < 150 && !G.dead; i++) { A.setClock(0.2); update(1 / 30); }
    out.fell = G.dead;
    document.getElementById('btn-wake').onclick(); update(0.016); play();
    const pc = S.piece();
    out.piece = !!pc && pc.m === A.MAP && m.smooth[(pc.y | 0) * W + (pc.x | 0)] === 1 && pc.g === 21 && G.mapId === A.MAP && Math.hypot(Engine.cam.x - L[0].wx, Engine.cam.y - L[0].wy) < 0.3;
    p.p91piece = null; p.hp = p.hpMax;
    // Bardo (Vol II): alive, in his winch-room, with the tally and a harness to sell
    const ents = G.ents;
    out.bardo = ents.some((e) => e.kind === 'npc' && e.id === 'p94_bardo') && NPCS.p94_bardo.shop.some((s) => s.item === 'a_p94_harness') && Object.keys(NPCS.p94_bardo.topics).length === 5 && ents.some((e) => e._p94 === 'tally' && /Nineteen strokes/.test(e.label));
    // the Glass-Grown: seven, standing; sung to, they turn their heads, and nothing fights
    const gg = ents.filter((e) => e._p94 === 'gg');
    put(12.5, 70.5); msgs.length = 0; update(0.016); castSong('root'); A.sung();
    out.grown = gg.length === 7 && gg.every((e) => e.kind === 'deco' && e.sprite === 'p94_glassgrown_turn') && said(/turns its head toward you/) && ents.some((e) => e.kind === 'item' && e.item === 'a_p94_cap');
    // the Winch-Deep: the Nineteen keep to the capstan; they haul, and you weigh four times what you weigh
    const kp = ents.find((e) => e._p94 === 'keeper');
    kp.x = A.P.capstan[0] + 8; kp.y = A.P.capstan[1]; put(A.P.capstan[0], A.P.capstan[1] + 7.6); msgs.length = 0; A.tick(0.01);
    out.leash = Math.hypot(kp.x - A.P.capstan[0], kp.y - A.P.capstan[1]) <= A.consts.LEASH + 0.01;
    A.setHaul(A.consts.CREAK - 0.01); A.tick(0.01); const creak = said(/capstan creaks/); A.setHaul(0.005); A.tick(0.01);
    out.haul = creak && said(/They haul/) && A.heavy() > A.consts.HEAVY - 0.1;
    // heavy: a step is three tenths of a step
    kp.x = A.P.capstan[0]; kp.y = A.P.capstan[1] - 3; kp.state = 'idle';
    put(A.P.capstan[0] + 7, A.P.capstan[1] + 2); A.tick(0.001); const hx = Engine.cam.x; Engine.cam.x += 1; A.tick(0.001);
    out.heavy = Math.abs(Engine.cam.x - (hx + A.consts.HEAVY_MOVE)) < 0.02;
    // put down: the brake-gloves and the link, once; the Souls week begins
    killEnemy(kp); update(0.016); update(0.016);
    out.drops = G.ents.filter((e) => e.kind === 'item' && (e.item === 'a_p94_gloves' || e.item === 'v_p94_link')).length === 2 && G.flags.p94_kdrop === 1 && said(/stop hauling/) && (G.flags.p94k | 0) > 0 && A.heavy() <= 0;
    update(0.016); out.dropsOnce = G.ents.filter((e) => e.kind === 'item' && e.item === 'a_p94_gloves').length === 1;
    // the counterweight cage: its rope hangs slack at the top until the brake is freed below
    const ct = G.ents.find((e) => e._p94 === 'cageTop'), cb = G.ents.find((e) => e._p94 === 'cageBottom');
    msgs.length = 0; put(A.P.cageTop[0] + 1.2, A.P.cageTop[1]); A.useOwn(ct); out.cageShut = !G.flags.p94_cage && said(/brake is set from below/) && Engine.cam.y < 30;
    put(A.P.cageBottom[0] - 1.3, A.P.cageBottom[1]); A.useOwn(cb);
    out.cageFree = G.flags.p94_cage === 1 && Engine.cam.y < 30 && m.smooth[(Engine.cam.y | 0) * W + (Engine.cam.x | 0)] === 1 && said(/knock the brake off/);
    A.useOwn(ct); out.cageDown = Engine.cam.y > 115 && m.smooth[(Engine.cam.y | 0) * W + (Engine.cam.x | 0)] === 1;
    // Bardo and the link: one bar across the nineteen
    G.give('v_p94_link'); put(A.P.bardo[0] + 1, A.P.bardo[1] + 1); msgs.length = 0; update(0.016);
    out.link = G.flags.p94_link === 1 && said(/cuts one bar across all nineteen/) && G.has('v_p94_link') && G.ents.some((e) => e._p94 === 'tally' && /one long bar/.test(e.label));
    // the gear: each piece its own look and picture, in the sixteenth set
    out.gear = ['a_p94_cap', 'a_p94_gloves', 'a_p94_harness'].every((id) => ARMOR[id] && ITEMS[id] && GEARLOOK21.ARMOR[id] && ICONS.PIX[id]) && WEAPONS.p94_lever && GEARLOOK21.WEAPONS.p94_lever && ICONS.PIX.w_p94_lever && ITEMS.v_p94_link.valuable
      && GEAR87.SET_OF && GEAR87.SET_OF.a_p94_harness === 'chainyards' && GEAR87.SETS.length === 16;
    // everyone stands on the floor; the art is made in code
    out.standing = m.entities.filter((e) => e.kind === 'npc' || e.kind === 'enemy').every((e) => m.smooth[(e.y | 0) * W + (e.x | 0)] === 1);
    out.art = ['p94_winch', 'p94_bardo', 'p94_glassgrown', 'p94_glassgrown_turn', 'p94_nineteen', 'p94_capstan', 'p94_chainend', 'p94_chainlamp'].every((k) => Engine.sprites[k]);
    msg = _m;
    return out;
  });
  if (process.env.DEBUG94) console.log(JSON.stringify(r));
  check(r.map && r.doors, 'the Anchorage: one map inside the city\'s frame; a door in the Tiers by the goods-cage\'s top leads in, and a door leads back');
  check(r.reachOk && r.down, 'from the door you can walk to every lamp, Bardo, the gallery, the Glass-Grown, the landing, the weights, the Deep and the cage, and it goes down: ' + JSON.stringify(r.reach));
  check(r.rows, 'the change is a plain hunt on nine: eighteen rows, each all nine bones, one at a time, the same for everyone');
  check(r.thrown && r.held && r.other, 'when the seventh speaks a link throws you and a pin holds you; another bone\'s stroke does nothing');
  check(r.card, 'the card shows the row, the seventh marked, the stroke lit');
  check(r.lamp, 'the winch-room\'s lamp lights (the Souls rules, group i); a Piece here rings at 528');
  check(r.fell && r.piece, 'off the chain\'s side is the well: you wake by the last lamp and your Piece waits on the chain');
  check(r.bardo, 'Winchmaster Bardo (Vol II) is in his winch-room with the tally of nineteen, five things to say and a harness to sell');
  check(r.grown, 'the Glass-Grown: seven, not foes; sung to, they turn their heads; the winchman\'s cap lies before them');
  check(r.leash && r.haul && r.heavy, 'the Nineteen keep to the capstan\'s reach; the capstan creaks, they haul, and for six seconds a step is three tenths of a step');
  check(r.drops && r.dropsOnce, 'put down, they leave the brake-gloves and the notched link, once, and the keeper\'s week begins');
  check(r.cageShut && r.cageFree && r.cageDown, 'the counterweight cage: slack from the top, freed from below, then it rides both ways');
  check(r.link, 'shown the link, Bardo cuts one bar across the nineteen (he does not take it)');
  check(r.gear, 'the Chain-Yards gear: cap, gloves, harness and lever, each with its own look and picture, the sixteenth set');
  check(r.standing && r.art, 'everyone stands on the floor; the winch, Bardo, the Glass-Grown, the Nineteen and the capstan are drawn in code');
  const texts = await page.evaluate(() => ANCHORAGE94.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
