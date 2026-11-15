// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/rules88.test.js
// Phase 88: blocks cost fatigue, the Captains land a ship's height free, enemies follow you through doors (js/rules88.js);
// the weapon's weight, the shield's knocks and swings that follow your drag (js/feel88.js).
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
    const out = {}, p = G.player, R = RULES88, F = FEEL88;
    // ---- blocking costs fatigue; a parry a little; none with the kite shield and the Arsenal in full
    const hit = (dmg, parry) => { UPG.blocking = true; UPG.parryCool = 0.4; UPG.parryWindow = parry ? 0.2 : 0; GUARD.state.inMelee = true; try { damagePlayer(dmg, 'A test foe'); } finally { GUARD.state.inMelee = false; UPG.blocking = false; UPG.parryCool = 0; UPG.parryWindow = 0; } };
    p.armor = {}; p.hp = p.hpMax; p.fat = 20; hit(8, false); out.block = 20 - p.fat;
    p.fat = 20; hit(8, true); out.parry = 20 - p.fat;
    const ars = GEAR87.BY_ID.arsenal; p.armor = {}; for (const a of ars.armor) { const id = [].concat(a)[0]; p.armor[ARMOR[id].slot] = id; } if (!p.weapons.includes('longsword')) p.weapons.push('longsword'); p.weapon = p.weapons.indexOf('longsword');
    p.fat = 20; hit(8, false); out.kite = 20 - p.fat; out.kiteFull = GEAR87.special('kiteblock');
    p.armor = {}; p.fat = 0; UPG.parryCool = 0; triggerBlock(); out.winded = !UPG.blocking; p.fat = 20; triggerBlock(); out.guard = UPG.blocking; UPG.blocking = false; UPG.parryCool = 0; UPG.parryWindow = 0; p.hp = p.hpMax;
    // ---- following: a chasing enemy close by comes through the door after you, by the door you came in at
    loadMap('oakhaven'); G.state = 'play';
    const c = Engine.cam, e = hydrate({ kind: 'enemy', type: 'legionnaire', x: c.x + 2, y: c.y, name: 'Tamsin Fell' }); e.state = 'chase'; G.ents.push(e);
    const far = hydrate({ kind: 'enemy', type: 'proctor', x: c.x + 30, y: c.y }); far.state = 'chase'; G.ents.push(far);
    const portal = { map: 'tavern', useSpawn: true }; transfer(portal); G.state = 'play';
    out.leftBehind = e.hidden === true && !far.hidden;
    for (let i = 0; i < 300 && R.pending.length; i++) update(1 / 30);
    const came = G.ents.filter((q) => q.followed && !q.dead);
    out.came = came.length === 1 && came[0].type === 'legionnaire' && came[0].name === 'Tamsin Fell' && came[0].state === 'chase' && Math.hypot(came[0].x - Engine.cam.x, came[0].y - Engine.cam.y) < 6;
    out.boss = !R.canFollow({ kind: 'enemy', state: 'chase', def: { boss: true, speed: 1 } }) && !R.canFollow({ kind: 'enemy', state: 'chase', def: { speed: 0 } });
    const bar = GEAR87.BY_ID.barrow; p.armor = {}; for (const a of bar.armor) { const id = [].concat(a)[0]; p.armor[ARMOR[id].slot] = id; } if (!p.weapons.includes('p22_leafblade')) p.weapons.push('p22_leafblade'); p.weapon = p.weapons.indexOf('p22_leafblade');
    const ww = { kind: 'enemy', type: 'p22_woolwight', state: 'chase', def: ENEMIES.p22_woolwight };
    out.barrow = GEAR87.special('wight') && !R.canFollow(ww); p.armor = {}; out.barrowOff = R.canFollow(ww);
    for (const q of came) q.dead = true;
    // ---- the weapon's weight: a maul lags when you turn and settles; a knife less; nothing with Reduce motion
    if (!p.weapons.includes('maul')) p.weapons.push('maul'); if (!p.weapons.includes('knife')) p.weapons.push('knife');
    const lag = (wid) => { p.weapon = p.weapons.indexOf(wid); F.W.x = F.W.y = F.W.vx = F.W.vy = 0; F.W.dir = Engine.cam.dir; for (let i = 0; i < 6; i++) { Engine.cam.dir += 0.06; F.tickWeight(1 / 30); } const peak = Math.abs(F.W.x); for (let i = 0; i < 120; i++) F.tickWeight(1 / 30); return [peak, Math.abs(F.W.x)]; };
    const lm = lag('maul'), lk = lag('knife'); out.weight = lm[0] > lk[0] && lk[0] > 0 && lm[1] < 0.1;
    F.W.x = 6; GFX.reduceMotion = true; out.reduce = F.weaponOffset().x === 0; GFX.reduceMotion = false; F.W.x = 0;
    // ---- the shield's knocks: a block jolts it and leaves a mark; marks change its picture; a night's rest cleans it
    p.armor = { shield: 'a_kite' }; p.knocks88 = {}; p.fat = 20;
    const art = BODY21.shieldArt(GEARLOOK21.of(p)), m0 = F.marked(art, 'a_kite');
    hit(6, false); hit(6, false); hit(6, false);
    const m3 = F.marked(art, 'a_kite');
    out.knocks = p.knocks88.a_kite === 3 && m0 === art.canvas && m3 !== art.canvas && (F.J.vy !== 0 || F.J.y !== 0);
    doRest('self'); out.rest = !(p.knocks88 && p.knocks88.a_kite);
    // ---- the swing follows the drag: the same sword thrusts, chops, cuts up and slashes both ways
    const sw = WEAPONS.sword, fam = (l) => animWeaponPose(sw, 0.5, l).family;
    out.arcs = fam('thrust') === 'thrust' && fam('chop down') === 'overhead' && fam('cut up') === 'rising' && fam('slash left') === 'sweep' && animWeaponPose(sw, 0.5, 'slash right').x === -animWeaponPose(sw, 0.5, 'slash left').x;
    out.maulThrust = animWeaponPose(WEAPONS.maul, 0.5, 'thrust').family === 'thrust';
    return out;
  });
  check(r.block >= 4 && r.parry === 1, 'a full block costs fatigue (' + r.block + '), a parry a little (' + r.parry + ')');
  check(r.kiteFull && r.kite === 0, 'the Synod Arsenal in full: blocks with the kite shield cost no fatigue');
  check(r.winded && r.guard, 'with no fatigue left you cannot raise your guard; with some, you can');
  check(r.leftBehind && r.came, 'a chasing enemy close by follows you through the door (named, still chasing); one far off does not');
  check(r.boss, 'bosses and things that cannot walk do not follow');
  check(r.barrow && r.barrowOff, 'the Barrow-Wardens in full: the barrow\'s dead do not follow you past its door');
  check(r.weight && r.reduce, 'a maul lags behind a turn more than a knife and settles; nothing with Reduce motion');
  check(r.knocks && r.rest, 'blocks jolt the shield and mark it; a night\'s rest cleans it');
  check(r.arcs && r.maulThrust, 'the swing follows your drag, whatever the weapon');
  // ---- falls: the Free Captains land a ship's height free; anyone else pays for a sheer drop
  const fall = await page.evaluate(() => {
    const p = G.player, ids = Object.keys(G.maps).filter((id) => G.maps[id].lvls || G.maps[id].smooth);
    // a flat map with a ground function made for the test: a 3.0 drop off a ledge at x = 10
    const m = G.map, keep = { lvls: m.lvls, smooth: m.smooth, groundAt: m.groundAt, gradeAt: m.gradeAt };
    m.lvls = new Uint8Array(m.w * m.h); m.smooth = null; m.groundAt = (x) => (x < 10 ? 3.0 : 0); m.gradeAt = () => 0;
    const drop = (captain) => {
      p.armor = {}; if (captain) { const S2 = GEAR87.BY_ID.captains; for (const a of S2.armor) { const id = [].concat(a)[0]; p.armor[ARMOR[id].slot] = id; } if (!p.weapons.includes('axe')) p.weapons.push('axe'); p.weapon = p.weapons.indexOf('axe'); }
      p.hp = p.hpMax; Engine.cam.x = 10.5; p.feet = 3.0; p.fallFrom = null; G.keys = {}; G.vel.x = G.vel.y = 0;
      for (let i = 0; i < 120 && (p.feet > 0.001 || p.fallFrom != null); i++) update(1 / 30);
      return p.hpMax - p.hp;
    };
    const plain = drop(false), capt = drop(true);
    Object.assign(m, keep); p.armor = {}; p.hp = p.hpMax;
    return { plain, capt, ok: ids.length > 0 };
  });
  check(fall.plain > 0, 'a sheer drop of 3 hurts (' + fall.plain + ')');
  check(fall.capt < fall.plain, 'the Free Captains in full: the first ship\'s height of it is free (' + fall.capt + ')');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
