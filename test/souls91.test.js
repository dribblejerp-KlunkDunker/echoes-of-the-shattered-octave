// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/souls91.test.js
// Phase 91: the Souls rules in the Reach (js/souls91.js): lamps, the Piece, the hour-bead, the two shortcuts, the switch.
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
    const out = {}, S = SOULS91, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const go = (id, x, y, d) => { loadMap(id, { x, y, dir: d || 0 }); G.state = 'play'; update(0.016); };
    const bfs = (m, sx, sy) => { const W = m.w, Hh = m.h, dist = new Int32Array(W * Hh).fill(-1), q = [(sy | 0) * W + (sx | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= W || ny >= Hh) continue; const j = ny * W + nx; if (dist[j] >= 0) continue; const c = m.get(nx, ny); if (c && !(c.door && !c.portal && (!c.locked || G.flags[c.locked]))) continue; dist[j] = dist[i] + 1; q.push(j); } } return (x, y) => dist[(y | 0) * W + (x | 0)]; };
    out.on0 = S.on() === true;
    // every lamp stands where you can walk to it, and so does its waking place
    out.lamps = S.LAMPS.map((L) => { const m = G.maps[L.map]; const d = bfs(m, m.spawn.x, m.spawn.y); return !!m && L.x > 0 && d(L.x, L.y) >= 0 && d(L.wx, L.wy) >= 0 && m.entities.some((e) => e._p91 === 'lamp' && e._i === L.id); }).every(Boolean);
    out.sprites = ['p91_lamp', 'p91_lamplit', 'p91_piece'].every((s) => Engine.sprites[s]) && !!Engine.textures.t_p91_chimney && !!Engine.textures.t_p91_irondoor;
    // the Antler Galleries: standing by the lamp at the shaft's foot lights it
    const A = ANTLER85, L0 = S.LAMPS[0], L1 = S.LAMPS[1];
    go(A.UP, L0.wx, L0.wy); out.unlit0 = !S.isLit(L0) || true;
    Engine.cam.x = L0.x - 0.9; Engine.cam.y = L0.y + 0.3; update(0.016);
    const lampE = G.ents.find((e) => e._p91 === 'lamp' && e._i === 0);
    out.lit = S.isLit(L0) && G.flags.p91_la === 1 && lampE.sprite === 'p91_lamplit' && lampE.glow > 0.5 && said(/You light the lamp/);
    // the chimney: tied off from below, so not from the galleries the first time
    const cu = G.map.get(S.CHIMNEY_UP[0], S.CHIMNEY_UP[1]);
    out.chimneyShut = !!cu && cu.door && cu.locked === 'p91_sca' && !G.flags.p91_sca;
    // the deep: the seam lamp, the ordinary foes, the keeper
    go(A.DEEP, L1.wx, L1.wy); Engine.cam.x = L1.x - 0.8; Engine.cam.y = L1.y; update(0.016);
    out.lit1 = S.isLit(L1) && G.flags.p91_la === 2;
    const mites = G.ents.filter((e) => e.kind === 'enemy' && e.type === 'mites'), keeper = G.ents.find((e) => e._p85a === 'keeper');
    for (const e of mites) killEnemy(e); killEnemy(keeper); update(0.016);
    out.keeperDay = G.flags.p91k_a === (G.day || 1);
    // resting: whole again, the mites get up where they first stood, the Flint-Back stays down
    p.hp = 3; p.voice = 1; p.fat = 0; G.autosaveWhen = ''; if (typeof UPG === 'object') UPG.autosaveSlot = null;
    const lampD = G.ents.find((e) => e._p91 === 'lamp' && e._i === 1); A.setOil(3);
    for (const e of mites) e.state = 'idle';
    S.useOwn(lampD);
    out.rest = p.hp === p.hpMax && p.voice === p.voiceMax && p.fat > 0 && said(/You sit by the lamp/);
    out.refill = mites.every((e) => !e.dead && !e.hidden && e.x === e.homeX && e.y === e.homeY) && keeper.dead;
    out.saved = !!UPG.autosaveSlot && /^by the lamp/.test(UPG.autosaveWhen);
    out.oil = A.oil() === A.OIL_MAX;
    // a week on: the keeper gets up too
    G.day = (G.day || 1) + 8; for (const e of mites) e.state = 'idle'; S.useOwn(lampD);
    out.keeperBack = !keeper.dead && keeper.hp === keeper.hpMax && !G.flags.p91k_a;
    // not with something hunting you
    mites[0].state = 'chase'; mites[0].x = Engine.cam.x + 2; msgs.length = 0; p.hp = 5; S.useOwn(lampD);
    out.hunted = p.hp === 5 && said(/Not with something hunting you/); mites[0].state = 'idle'; mites[0].x = mites[0].homeX;
    // dying in the den: the Piece stays where you fell; you wake by the seam lamp, the last one lit here
    p.gold = 37; p.xp = 41; Engine.cam.x = 31.0; Engine.cam.y = 27.0; const fellAt = [Engine.cam.x, Engine.cam.y];
    die('A test'); out.deathLine = /wait where you fell/.test((document.getElementById('p91-death-line') || {}).textContent || '') && !/wait where you fell/.test(document.getElementById('death-text').textContent);
    document.getElementById('btn-wake').onclick();
    const q = S.piece();
    out.piece = !!q && q.m === A.DEEP && q.g === 37 && q.xp === 41 && Math.hypot(q.x - fellAt[0], q.y - fellAt[1]) < 0.01 && p.gold === 0 && p.xp === 0;
    out.woke = G.state === 'play' && !G.dead && G.mapId === A.DEEP && Math.hypot(Engine.cam.x - L1.wx, Engine.cam.y - L1.wy) < 0.2 && p.hp === Math.ceil(p.hpMax * 0.6) && said(/last lamp you lit/);
    // heard, not seen, from a way off; seen close; home when you stand there
    update(0.016); const sh = G.ents.find((e) => e._p91piece);
    out.farHidden = !!sh && sh.hidden && sh.transient;
    Engine.cam.x = q.x - 2.5; Engine.cam.y = q.y; update(0.016); out.nearShown = !sh.hidden;
    Engine.cam.x = q.x - 0.4; update(0.016);
    out.home = !S.piece() && p.gold === 37 && p.xp === 41 && !G.ents.some((e) => e._p91piece) && said(/your Piece comes home/);
    // die again before you reach it, and it is gone
    p.gold = 20; p.xp = 5; Engine.cam.x = 30.5; Engine.cam.y = 26.0; die('A test'); document.getElementById('btn-wake').onclick();
    const q1 = S.piece(); p.gold = 9; p.xp = 3; Engine.cam.x = 12.0; Engine.cam.y = 10.5; die('A test'); document.getElementById('btn-wake').onclick();
    const q2 = S.piece();
    out.lost = q1 && q1.g === 20 && q2 && q2.g === 9 && q2.xp === 3 && Math.abs(q2.x - 12.0) < 0.01;
    // a save carries it; a damaged save carries nothing
    const snap = snapshotGame(); out.snap = snap.player.p91piece && snap.player.p91piece.g === 9;
    p.p91piece = { m: 'nowhere', x: 3, y: 3, g: 5, xp: 5 }; const bad1 = S.piece();
    p.p91piece = { m: A.DEEP, x: 1e9, y: 3, g: 5, xp: 5 }; const bad2 = S.piece();
    p.p91piece = { m: '__proto__', x: 1, y: 1, g: 5, xp: 5 }; const bad3 = S.piece();
    p.p91piece = { m: A.DEEP, x: 3, y: 3, g: 'lots', xp: -4 }; const bad4 = S.piece();
    out.validate = !bad1 && !bad2 && !bad3 && !bad4;
    p.p91piece = null;
    // the chimney from the den: climb it, and it is tied off at the top
    const cd = G.map.get(S.CHIMNEY_DEEP[0], S.CHIMNEY_DEEP[1]);
    const dd = bfs(G.map, A.DEN[0], A.DEN[1]);
    out.chimneyDeep = !!cd && cd.door && cd.portal && cd.portal.map === A.UP && !cd.locked && dd(S.CHIMNEY_DEEP[0] - 1, S.CHIMNEY_DEEP[1]) >= 0;
    msgs.length = 0; transfer(cd.portal); update(0.016);
    out.climbed = G.mapId === A.UP && G.flags.p91_sca === 1 && said(/tie the rope off at the top/) && Math.hypot(Engine.cam.x - S.CHIMNEY_TOP.x, Engine.cam.y - S.CHIMNEY_TOP.y) < 0.3;
    const du = bfs(G.map, G.map.spawn.x, G.map.spawn.y); out.chimneyTop = du(S.CHIMNEY_TOP.x, S.CHIMNEY_TOP.y) >= 0 && !!G.flags[G.map.get(S.CHIMNEY_UP[0], S.CHIMNEY_UP[1]).locked];
    // the Dry Flume: the adit lamp, the iron door barred on the hall side
    const D = DRYFLUME85, L2 = S.LAMPS[2], L3 = S.LAMPS[3];
    go(D.MAP, D.ROOMS ? 5.5 : 5.5, 37.4); Engine.cam.x = L2.x + 0.9; Engine.cam.y = L2.y; update(0.016);
    out.lit2 = S.isLit(L2) && G.flags.p91_lf === 3;
    const door = G.map.get(S.BAR_DOOR[0], S.BAR_DOOR[1]), bar = G.ents.find((e) => e._p91 === 'bar');
    out.barShut = !!door && door.door && door.locked === 'p91_scf' && G.map.isBlocked(S.BAR_DOOR[0], S.BAR_DOOR[1]);
    // from the sump passage the bar is out of reach
    msgs.length = 0; Engine.cam.x = S.BAR_DOOR[0] - 0.6; Engine.cam.y = S.BAR_DOOR[1] + 0.5; S.useOwn(bar); out.barFar = !G.flags.p91_scf && said(/other side/);
    // from the hall: lift it out, and the door swings; the hall is a short walk from the sump passage now
    Engine.cam.x = S.BAR_DOOR[0] + 1.8; S.useOwn(bar); for (let i = 0; i < 90; i++) update(1 / 30);
    out.unbarred = G.flags.p91_scf === 1 && !G.map.isBlocked(S.BAR_DOOR[0], S.BAR_DOOR[1]) && said(/Nobody has to time the sump again/);
    const fd = bfs(G.map, 37.5, 9.5); out.shortcut = fd(45.5, 9.5) >= 0 && fd(45.5, 9.5) < 12;
    // die in the pump-hall with the stair lamp unlit: you wake by the adit's
    p.gold = 4; p.xp = 0; Engine.cam.x = 47.5; Engine.cam.y = 9.5; die('A test'); document.getElementById('btn-wake').onclick();
    out.wokeAdit = G.mapId === D.MAP && Math.hypot(Engine.cam.x - L2.wx, Engine.cam.y - L2.wy) < 0.2;
    p.p91piece = null;
    // the gap: its lamp in Greenroot, by the boulders
    const L4 = S.LAMPS[4], gp = GROVE85.gap(); out.gap = L4.map === 'p79_road_e' && Math.hypot(L4.x - gp.x, L4.y - gp.y) < 4.5;
    // the hour-bead: one at a time, 120 sovereigns
    p.gold = 100; const b0 = S.buyBead(); p.gold = 300; const b1 = S.buyBead(), b2 = S.buyBead();
    out.beadShop = !b0 && b1 && !b2 && S.beads() === 1 && p.gold === 180 && ITEMS.p91_bead.value === 120;
    // swallowed on the death screen: the death comes undone where it happened, and no Piece is left
    go(A.UP, 30.5, 4.5); p.gold = 50; p.xp = 12; die('A test');
    const beadBtn = document.getElementById('btn-p91-bead'); out.beadBtn = !!beadBtn && !beadBtn.hidden;
    beadBtn.onclick();
    out.beadUndo = !G.dead && G.state === 'play' && G.mapId === A.UP && Math.hypot(Engine.cam.x - 30.5, Engine.cam.y - 4.5) < 0.01 && p.gold === 50 && p.xp === 12 && !S.piece() && !G.has('p91_bead') && said(/hour-bead/) && document.getElementById('death').classList.contains('hidden');
    die('A test'); out.noBeadBtn = !document.getElementById('btn-p91-bead'); document.getElementById('btn-wake').onclick(); p.p91piece = null;
    // Off: the old cost exactly, and the lamps go dark
    S.setOn(false); p.gold = 30; p.xp = 7; go(A.DEEP, 20.5, 2.6); Engine.cam.x = 31.0; Engine.cam.y = 27.0; die('A test'); document.getElementById('btn-wake').onclick(); update(0.016);
    const ld = G.ents.find((e) => e._p91 === 'lamp');
    out.off = p.gold === 25 && p.xp === 7 && !S.piece() && Math.hypot(Engine.cam.x - G.map.spawn.x, Engine.cam.y - G.map.spawn.y) < 0.01 && ld.hidden && !ld.use;
    S.setOn(true); update(0.016); out.onAgain = !ld.hidden && ld.use === 'p91_lamp';
    // the Options row
    renderAccessibilityMenu(); const ob = document.getElementById('p91-souls'); out.opt = !!ob && ob.textContent === 'On'; ob.click(); out.optOff = !S.on() && ob.textContent === 'Off' && JSON.parse(localStorage.getItem('octave.souls91.v1')).on === false; ob.click(); closeModal();
    msg = _m;
    return out;
  });
  if (process.env.DEBUG91) console.log(JSON.stringify(r));

  check(r.on0, 'the Souls rules are on by default');
  check(r.lamps, 'five lamps, each where you can walk to it, with room to wake beside it');
  check(r.sprites, 'the lamp, lit and unlit, the Piece, the chimney and the iron door are painted');
  check(r.lit && r.lit1 && r.lit2, 'standing by a lamp lights it, once, and it is the last one lit in its place');
  check(r.rest, 'resting at a lamp: full health, voice and breath');
  check(r.refill, 'the place\'s ordinary foes get up where they first stood; the keeper stays down');
  check(r.keeperDay && r.keeperBack, 'the keeper stays down a week (eight days), then gets up too');
  check(r.saved, 'resting saves the game');
  check(r.oil, 'in the Galleries the lamp fills your own lamp too');
  check(r.hunted, 'no resting with something hunting you');
  check(r.deathLine, 'the death screen says what you carried will wait');
  check(r.piece, 'dying leaves your coin and your experience where you fell, as your Piece');
  check(r.woke, 'you wake by the last lamp you lit in that place, at six-tenths health');
  check(r.farHidden && r.nearShown, 'the Piece is not seen from a way off, only close');
  check(r.home, 'stand where you fell and the Piece comes home');
  check(r.lost, 'die again before you reach it, and it is gone');
  check(r.snap && r.validate, 'a save carries the Piece; a damaged one carries nothing');
  check(r.chimneyShut, 'the chimney is tied off from below at first');
  check(r.chimneyDeep && r.climbed && r.chimneyTop, 'climbed from the den, the chimney is a way between the den and the shaft\'s foot');
  check(r.barShut && r.barFar, 'the iron door is barred, and the bar cannot be reached from the sump side');
  check(r.unbarred && r.shortcut, 'unbarred from the hall, the door is a short way past the sump');
  check(r.wokeAdit, 'dying in the Flume with only the adit lamp lit wakes you there');
  check(r.gap, 'the Deep Grove\'s gap has its lamp in Greenroot');
  check(r.beadShop, 'the hour-bead: 120 sovereigns, one at a time');
  check(r.beadBtn && r.beadUndo && r.noBeadBtn, 'swallowed, the hour-bead undoes the death where it happened, and leaves no Piece');
  check(r.off && r.onAgain, 'Off: the old cost exactly (wake by the map\'s lamp, five coins), and the lamps go dark');
  check(r.opt && r.optOff, 'the Options row switches the rules and remembers');
  // every new line has its French (tools/i18n/p91-souls.tsv, merged into locales/story/fr.json)
  const texts = await page.evaluate(() => SOULS91.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
