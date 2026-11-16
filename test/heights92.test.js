// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/heights92.test.js
// Phase 92: the Dawning Heights, part one (js/heights92.js): the Umbral Tiers from the Keel Docks to the iron door.
'use strict';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP (no playwright)'); process.exit(0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.removeItem('octave.souls91.v1'); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');


  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold && Weather.hold('clear');
    const out = {}, H = HEIGHTS92, S = SOULS91, K = KESTREL16, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const m = G.maps[H.MAP];
    out.map = !!m && m.w === 160 && m.h === 226 && m.entities.length === m.baseCount;
    // walkable: a walkway cell (the drop is never a way), no solid cell, a door only when it opens
    const walkable = (i, j) => { const k = j * m.w + i; const c = m.get(i, j); if (c) return false; return !!m.smooth[k]; };
    const bfs = (sx, sy) => { const W = m.w, dist = new Int32Array(W * m.h).fill(-1), q = [(sy | 0) * W + (sx | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h) continue; const j = ny * W + nx; if (dist[j] >= 0 || !walkable(nx, ny)) continue; dist[j] = dist[i] + 1; q.push(j); } } return (x, y) => dist[(y | 0) * W + (x | 0)]; };
    const d = bfs(H.P.arrive[0], H.P.arrive[1]);
    const near = (x, y) => { let best = -1; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const v = d(x + dx, y + dy); if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    const L = H.lamps();
    out.reach = { lamps: L.map((l) => near(l.x, l.y)), keeper: near(H.P.keeper[0], H.P.keeper[1]), market: near(H.P.canvas[0], H.P.canvas[1]), cage: near(H.P.cageTop[0], H.P.cageTop[1]), door: near(H.P.ironDoor[0], H.P.ironDoor[1] + 1), cobbler: near(H.P.anselm[0], H.P.anselm[1]) };
    out.reachOk = Object.values(out.reach).every((v) => Array.isArray(v) ? v.every((x) => x >= 0) : v >= 0);
    out.climb = H.lvlAt(H.P.ironDoor[1] + 1) - H.lvlAt(H.P.arrive[1]) > 12;
    const door = m.get(H.P.ironDoor[0], H.P.ironDoor[1]); out.ironDoor = !!door && door.door && door.locked === 'p92_never';
    // the way there: the Kestrel's table, once the hop is allowed
    G.flags.part4 = true; G.flags.coda_done = true; G.flags.p16k_up = 127;
    const T0 = G.flags.p16k_far | 0; const fly = K.flyFar(H.MAP);
    out.fly = fly.ok && G.flags.p16k_far === 1 && K.mooring() === H.MAP && K.landing().map === H.MAP && T0 === 0;
    K.leaveShip(); update(0.016);
    out.landed = G.mapId === H.MAP && Math.hypot(Engine.cam.x - H.P.arrive[0], Engine.cam.y - H.P.arrive[1]) < 1.5 && m.smooth[(Engine.cam.y | 0) * m.w + (Engine.cam.x | 0)] === 1;
    const lad = G.ents.find((e) => e.use === 'p92_kestrel'); H.useOwn(lad); out.board = G.mapId === K.DECK; K.leaveShip(); update(0.016);
    const home = K.hop('whispergrove'); out.home = home.ok && !G.flags.p16k_far && K.mooring() === 'whispergrove';
    K.flyFar(H.MAP); K.leaveShip(); update(0.016);
    // the Souls lamps: the dock lamp lights when you stand by it
    Engine.cam.x = L[0].x + 0.9; Engine.cam.y = L[0].y + 0.6; update(0.016);
    out.lamp = S.isLit(L[0]) && G.flags.p91_lh === L[0].id + 1 && G.ents.some((e) => e._p91 === 'lamp' && e._i === L[0].id && e.sprite === 'p92_shadelamplit');
    // the Bleach: it eats while you stand in it
    const bk = m._p92.bleach; let bx = -1, by = -1; for (let k = 0; k < bk.length; k++) if (bk[k]) { bx = k % m.w; by = (k / m.w) | 0; break; }
    Engine.cam.x = bx + 0.5; Engine.cam.y = by + 0.5; p.hp = p.hpMax; p.feet = m.groundAt(Engine.cam.x, Engine.cam.y); p.fallFrom = null; for (let i = 0; i < 30; i++) update(1 / 30);
    out.bleach = p.hp < p.hpMax - 2 && said(/The light is on you/);
    // and does not in the shade
    Engine.cam.x = H.P.arrive[0]; Engine.cam.y = H.P.arrive[1]; p.hp = p.hpMax; p.feet = m.groundAt(Engine.cam.x, Engine.cam.y); for (let i = 0; i < 30; i++) update(1 / 30);
    out.shade = p.hp === p.hpMax;
    // the chain-walks jerk: walk on through it and it throws you; stand still and you hold
    const cw = [112.5, 124.5]; Engine.cam.x = cw[0]; Engine.cam.y = cw[1]; p.feet = m.groundAt(cw[0], cw[1]); p.fallFrom = null;
    H.setClock(H.JERK * 3 - H.CREAK + 0.05); G.keys = {}; update(0.016); H.setClock(H.JERK * 3 + 0.01); const y0 = Engine.cam.y; update(0.016);
    out.held = Math.abs(Engine.cam.y - y0) < 0.05 && said(/You hold still/);
    H.setClock(H.JERK * 4 - H.CREAK + 0.05); update(0.016); H.setClock(H.JERK * 4 + 0.01); G.keys = { w: true }; const y1 = Engine.cam.y; update(0.016); G.keys = {};
    out.thrown = Math.abs(Engine.cam.y - y1) > 0.3 && said(/throws you sideways/);
    // the gulf: off the chain-walk's side, a long way down; the Piece stays at the last place you stood
    Engine.cam.x = cw[0]; Engine.cam.y = cw[1]; p.feet = m.groundAt(cw[0], cw[1]); p.fallFrom = null; update(0.016);
    let fx0 = -1, fy0 = -1; for (let j = 120; j < 130 && fx0 < 0; j++) for (let i = 100; i < 125; i++) if (m.floorCells[j * m.w + i] === 3) { fx0 = i; fy0 = j; break; }
    p.gold = 33; p.xp = 7;
    for (let i = 0; i < 4; i++) update(1 / 30);
    Engine.cam.x = fx0 + 0.5; Engine.cam.y = fy0 + 0.5; for (let i = 0; i < 120 && !G.dead; i++) update(1 / 30);
    out.fell = G.dead && m.floorCells[fy0 * m.w + fx0] === 3;
    document.getElementById('btn-wake').onclick(); update(0.016);
    const q = S.piece();
    out.piece = !!q && q.m === H.MAP && m.smooth[(q.y | 0) * m.w + (q.x | 0)] === 1 && q.g === 33;
    out.note = S.noteOf(H.MAP) === 528 && S.noteOf('p85_galleries') === 174;
    out.wake = G.mapId === H.MAP && Math.hypot(Engine.cam.x - L[0].wx, Engine.cam.y - L[0].wy) < 0.3;
    p.p91piece = null;
    // the keeper: glass-fire where you stand
    const kp = G.ents.find((e) => e._p92 === 'keeper');
    Engine.cam.x = kp.x; Engine.cam.y = kp.y + 3; p.feet = m.groundAt(Engine.cam.x, Engine.cam.y); p.fallFrom = null; p.hp = p.hpMax;
    kp.state = 'chase'; H.tick(0.01); kp.state = 'chase'; H.tick(0.01);
    out.fire = H.patches().length >= 1 && said(/white fire splashes/) && H.inBleach(Engine.cam.x, Engine.cam.y) > 0;
    // put down: his hood and his amber, once; the Souls week begins
    killEnemy(kp); update(0.016); update(0.016);
    const drops = G.ents.filter((e) => e.kind === 'item' && (e.item === 'a_p92_lamphood' || e.item === 'v_p92_amber'));
    out.drops = drops.length === 2 && G.flags.p92_kdrop === 1 && H.patches().length === 0 && said(/Lamplighter goes down/) && (G.flags.p92k | 0) > 0;
    update(0.016); out.dropsOnce = G.ents.filter((e) => e.kind === 'item' && e.item === 'a_p92_lamphood').length === 1;
    // the goods-cage: out of reach from below; knocked loose from the top, then it rides
    const cb = G.ents.find((e) => e._p92 === 'cageBottom'), ct = G.ents.find((e) => e._p92 === 'cageTop');
    Engine.cam.x = H.P.cageBottom[0] - 1.3; Engine.cam.y = H.P.cageBottom[1] + 1; msgs.length = 0; H.useOwn(cb);
    out.cageShut = !G.flags.p92_cage && said(/winched up out of reach/) && Engine.cam.y > 200;
    Engine.cam.x = H.P.cageTop[0] - 1.3; Engine.cam.y = H.P.cageTop[1] + 1; H.useOwn(ct);
    out.cageDrop = G.flags.p92_cage === 1 && Engine.cam.y > 200 && said(/knock the pin out/) && m.smooth[(Engine.cam.y | 0) * m.w + (Engine.cam.x | 0)] === 1;
    H.useOwn(cb); out.cageUp = Engine.cam.y < 20 && m.smooth[(Engine.cam.y | 0) * m.w + (Engine.cam.x | 0)] === 1;
    // the iron door does not open
    out.doorShut = !G.flags.p92_never;
    // the people, their shops, the gear and its looks
    const npcs = G.ents.filter((e) => e.kind === 'npc').map((e) => e.id);
    out.people = ['p92_ysolde', 'p92_anselm', 'p92_canvas', 'p92_joss'].every((id) => npcs.includes(id) && NPCS[id] && NPCS[id].greet && Object.keys(NPCS[id].topics).length);
    out.shops = NPCS.p92_anselm.shop.some((s) => s.item === 'a_p92_chainboots') && NPCS.p92_canvas.shop.some((s) => s.item === 'a_p92_shadecloak') && NPCS.p92_canvas.shop.some((s) => s.item === 'v_p92_mirror');
    out.gear = ['a_p92_lamphood', 'a_p92_chainboots', 'a_p92_shadecloak'].every((id) => ARMOR[id] && ITEMS[id] && GEARLOOK21.ARMOR[id] && ICONS.PIX[id]) && ITEMS.v_p92_amber.valuable && ARMOR.a_p92_shadecloak.slot === 'cape' && WEAPONS.p92_clothpole && GEARLOOK21.WEAPONS.p92_clothpole && GEAR87.SET_OF.p92_clothpole === 'umbral' && GEAR87.SET_OF.a_p92_lamphood === 'umbral';
    out.foes = ENEMIES.p92_lamplighter && ENEMIES.p92_bleachhound && Engine.sprites.p92_bleachhound && Engine.sprites.p92_lamplighter && m.entities.filter((e) => e.kind === 'enemy' && e.type === 'p92_bleachhound').length >= 4;
    // the people and the foes stand on walkways, never over the drop
    out.standing = m.entities.filter((e) => e.kind === 'npc' || e.kind === 'enemy').every((e) => m.smooth[(e.y | 0) * m.w + (e.x | 0)] === 1);
    // Book Two ch. 9: eleven cradles, the Kestrel in the fourth from the end, a Church packet and two freighters; the veiled
    // harbourmaster with her two pole-men, who takes your mirror and gives it back when you leave the chains; Brenna Corliss
    const ents = m.entities, cr = ents.filter((e) => e.sprite === 'p92_cradle').sort((a, b) => a.x - b.x), ks = ents.find((e) => e._p92 === 'kestrel');
    out.cradles = cr.length === 11 && !!ks && Math.abs(ks.x - cr[3].x) < 0.6 && ents.filter((e) => e.sprite === 'p92_packet').length === 1 && ents.filter((e) => e.sprite === 'p92_freighter').length === 2;
    const ys = ents.find((e) => e.id === 'p92_ysolde');
    out.veil = NPCS.p92_ysolde.sprite === 'p92_veiled' && !!Engine.sprites.p92_veiled && ents.filter((e) => e.sprite === 'p92_poleman' && Math.hypot(e.x - ys.x, e.y - ys.y) < 2.5).length === 2;
    out.brenna = ents.some((e) => e.id === 'p92_brenna') && NPCS.p92_brenna.shop.some((s) => s.item === 'p92_blackcloth') && ents.some((e) => e.label === H.TX.rope) && Object.keys(NPCS.p92_brenna.topics).length === 3;
    G.flags.p92_bag = 0; while (G.has('v_p92_mirror')) G.take('v_p92_mirror'); G.give('v_p92_mirror');
    Engine.cam.x = H.P.ysolde[0] + 0.4; Engine.cam.y = H.P.ysolde[1] + 1.2; msgs.length = 0; H.tick(0.016);
    const taken = !G.has('v_p92_mirror') && G.flags.p92_bag === 1 && said(/velvet bag/);
    H.useOwn(G.ents.find((e) => e.use === 'p92_kestrel'));
    out.bag = taken && G.has('v_p92_mirror') && G.flags.p92_bag === 0; K.leaveShip(); update(0.016);
    msg = _m;
    return out;
  });
  if (process.env.DEBUG92) console.log(JSON.stringify(r));

  check(r.map, 'the Umbral Tiers: one map, 160 by 226 cells, cut from the 528 Hz plan');
  check(r.reachOk, 'from the Keel Docks you can walk to every lamp, the market, the cobbler, the keeper, the goods-cage and the iron door: ' + JSON.stringify(r.reach));
  check(r.climb, 'the walkways climb the mountain\'s face, more than twelve units from the docks to the wall');
  check(r.ironDoor && r.doorShut, 'the iron door in the black wall is seen, not entered');
  check(r.fly && r.landed, 'the Kestrel\'s table flies south to Sol-Luminary, and her ladder lands you on the Keel Docks');
  check(r.board && r.home, 'her ladder at the docks takes you aboard, and the table flies her home again');
  check(r.lamp, 'the dock lamp is a shade-lamp, lit by standing by it (the Souls rules, group h)');
  check(r.bleach && r.shade, 'the Bleach below the line eats at you; the shade does not');
  check(r.held && r.thrown, 'the chain-walks jerk: stand still and you hold, walk on and it throws you');
  check(r.fell, 'off the chain-walk\'s side is the gulf, and the fall kills');
  check(r.piece && r.wake, 'your Piece waits at the last place you stood, and you wake by the dock lamp');
  check(r.note, 'a Piece in the Heights rings the Heights\' note, 528 Hz (the Reach\'s stays 174)');
  check(r.fire, 'the Lamplighter splashes glass-fire where you stand, and the light comes in after it');
  check(r.drops && r.dropsOnce, 'put down, he leaves his hood and his amber glass, once, and the keeper\'s week begins');
  check(r.cageShut && r.cageDrop && r.cageUp, 'the goods-cage: out of reach from below, knocked loose from the top, then it rides both ways');
  check(r.people && r.shops, 'the Umbral folk: the harbour-master, the cobbler, the woman under the canvas, the chain-crewman; two of them sell');
  check(r.gear, 'the Heights gear: hood, boots and cloak each with its own look and picture, and the amber a valuable');
  check(r.cradles, 'the Keel Docks: eleven iron cradles on chains, the Kestrel in the fourth from the end, a Church packet and two freighters (Book Two ch. 9)');
  check(r.veil && r.bag, 'the harbourmaster comes veiled with two pole-men, takes your mirror into the velvet bag and gives it back when you leave the chains');
  check(r.brenna, 'Brenna Corliss keeps her chandlery under the ROPE sign and sells black cloth by the bolt');
  check(r.foes && r.standing, 'bleach-hounds and the Lamplighter are painted; everyone stands on a walkway');
  // every new line has its French (tools/i18n/p91-souls.tsv, merged into locales/story/fr.json)
  const texts = await page.evaluate(() => HEIGHTS92.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
