// Phase 93: flying and fighting in the air (js/air93.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/air93.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.removeItem('octave.air93.v1'); localStorage.removeItem('octave.souls91.v1'); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /next|continue/i }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, A = AIR93, K = KESTREL16, H = HEIGHTS92, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const play = () => { closeModal(); hide('#event'); G.state = 'play'; };
    const run = (secs, step) => { for (let t = 0; t < secs; t += (step || 0.25)) { A.tick(step || 0.25); A.tickJob(step || 0.25); } };
    G.flags.part4 = true; G.flags.coda_done = true; G.flags.p16k_up = 127; G.player.gold = 200;
    K.board();
    // (4) chance, as in the books: a roll at or over the odds goes straight through; under it, the flight is met
    A.setRoll(() => 0.99); let f = K.flyFar(H.MAP);
    out.straight = f.ok && !f.met && !A.R.live && K.farNow() && K.farNow().id === H.MAP;
    K.board(); A.setRoll(() => 0.1); A.setNext('courier'); const day0 = G.day * 24 + G.tod * 24;
    f = K.hop('whispergrove');
    out.met = f.ok && f.met && A.R.live && G.flags.p93_go === 16 && K.farNow() && K.farNow().id === H.MAP && G.mapId === K.DECK;
    out.notYet = Math.abs((G.day * 24 + G.tod * 24) - day0) < 0.01;   // the 30 hours wait until she is through
    out.valley = A.R.valley === true;
    play();
    // the stations are lent for the meeting: the wheel, the crates, the lamps, and Pennick's cradle
    const ents = G.map.entities;
    out.stations = ['p93_wheel', 'p93_hold', 'p93_lamps', 'p93_cradle'].every((u) => ents.some((e) => e.use === u));
    out.card = !!document.getElementById('p93-card') || (drawHUD(), !!document.getElementById('p93-card'));
    // (7) the horn: the Forge's four states from the awareness meter, filled by what it hears
    out.states = A.hornOf(0) === 0 && A.hornOf(30) === 1 && A.hornOf(65) === 2 && A.hornOf(95) === 3;
    const n0 = A.noiseOf(A.R); A.R.lashed = true; const n1 = A.noiseOf(A.R); A.R.lashed = false;
    const h0 = A.heard(A.R); A.R.ft = 680; const hc = A.heard(A.R); A.R.ft = A.B.START_FT;
    out.muffle = n1 < n0 && hc < h0;
    // a loud ship near the cutter: it turns, and it comes
    G.noise = 5; A.R.yd = 600; A.R.target = A.R.ft; run(6); out.turned = A.R.horn >= 2 && said(/stops swivelling/);
    // the long gun: a hit weeps a tank, and drift-glass never explodes
    A.setRoll(() => 0.1); A.fire(); out.weep = A.R.tanks.some((k) => k.st === 'weep') && said(/weeps, very slowly/);
    // the cradle: stand by it while Pennick binds it, and the weeping stops (the tank is sour after)
    const cr = ents.find((e) => e.use === 'p93_cradle'); Engine.cam.x = cr.x - 0.8; Engine.cam.y = cr.y; A.useOwn(cr); run(A.B.PATCH_S + 0.5);
    out.patch = !A.R.tanks.some((k) => k.st === 'weep') && A.R.tanks.some((k) => k.st === 'sour');
    // the hold: throw weight over and she lifts
    const t0 = A.trimOf(A.R); A.R.have.water = false; out.lighter = A.trimOf(A.R) > t0;
    // the grapnels: three chains, four proctors; three blows cut a chain
    A.hook(); out.hooked = A.R.hooked && A.R.chains.length === 3 && A.R.proctors.length === 4 && said(/Four proctors/);
    const ch = A.R.chains[0]; A.cutChain(ch); A.cutChain(ch); const still = A.R.chains.includes(ch); A.cutChain(ch);
    out.cut = still && !A.R.chains.includes(ch) && A.R.chains.length === 2;
    // (3) knocked down at the rail is not a death: the proctors take a part of your purse and the flight goes on
    const g0 = G.player.gold; G.player.hp = 0; die('proctor'); out.knocked = !G.dead && G.player.hp > 0 && G.player.gold < g0 && A.R.ended;
    const ev = document.querySelector('#event button, #event .dfbtn'); if (ev) ev.click();
    out.through = !A.R.live && K.mooring() === 'whispergrove' && !G.flags.p93_go && (G.day * 24 + G.tod * 24) - day0 > 30;
    out.unlent = !G.map.entities.some((e) => /^p93_/.test(e.use || ''));
    play();
    // (3) a forced landing: she is never lost; half a day and the price of canvas and drift-glass
    A.setRoll(() => 0.1); A.setNext('courier'); K.flyFar(H.MAP); play(); const g1 = G.player.gold; const d1 = G.day * 24 + G.tod * 24;
    A.R.ft = 3; A.R.target = 0; A.R.tanks.forEach((k) => { k.st = 'weep'; k.lift = 0.4; }); run(2);
    out.downCard = A.R.ended && said !== null; const ev2 = document.querySelector('#event button, #event .dfbtn'); if (ev2) ev2.click();
    out.down = !A.R.live && K.farNow() && K.farNow().id === H.MAP && G.player.gold === Math.max(0, g1 - A.B.DOWN_COST) && (G.day * 24 + G.tod * 24) - d1 >= 30 + A.B.DOWN_HOURS - 0.01 && G.flags.p93_down === 1;
    play();
    // lost in the air: far enough off and it is through
    A.setRoll(() => 0.1); A.setNext('courier'); K.hop('deepwoods'); play(); A.R.yd = A.B.LOSE_YD + 10; run(0.5); const ev3 = document.querySelector('#event button, #event .dfbtn'); if (ev3) ev3.click();
    out.lostIt = !A.R.live && K.mooring() === 'deepwoods';
    play();
    // a save made mid-meeting finishes the flight on load
    K.board(); A.setRoll(() => 0.1); A.setNext('courier'); K.flyFar(H.MAP); const code = G.flags.p93_go; A.R.live = false; A.resumeFlight();
    out.resume = code === 1 && !G.flags.p93_go && K.farNow() && K.farNow().id === H.MAP;
    // the Church packet: it crosses her course and looks; kept in the cloud it passes and sees nothing
    K.board(); A.setRoll(() => 0.1); A.setNext('packet'); K.hop('whispergrove'); play();
    out.packetMet = A.R.live && A.R.threat === 'packet' && G.map.entities.some((e) => e._p93 === 'cutter' && /packet|kestrel_m2/.test(e.sprite));
    A.R.ft = 680; A.R.target = 680; run(A.B.PACKET_S + 2); let ev4 = document.querySelector('#event button, #event .dfbtn'); if (ev4) ev4.click();
    out.packetPassed = !A.R.live && !G.flags.p93_told && K.mooring() === 'whispergrove';
    play();
    // in open sky with the lamps lit it sees her, and the word meets her at the Keel Docks
    K.board(); A.setRoll(() => 0.1); A.setNext('packet'); K.flyFar(H.MAP); play();
    A.R.ft = 450; A.R.target = 450; G.tod = 0.9; msgs.length = 0; run(A.B.PACKET_S + 2); ev4 = document.querySelector('#event button, #event .dfbtn'); if (ev4) ev4.click();
    out.packetSaw = G.flags.p93_told === 1 && said(/She has seen the Kestrel/);
    play(); K.leaveShip(); update(0.016);
    out.told = G.mapId === H.MAP && G.flags.p93_told === 2 && said(/Word came up the chains/);
    // the squall: gusts throw her about, and an unlashed hold makes them worse; ridden out, she is through
    K.board(); A.setRoll(() => 0.1); A.setNext('squall'); K.hop('deepwoods'); play();
    A.setRoll(() => 0.9); A.R.gustT = 0; const f0 = A.R.ft; A.tickSquall(A.R, 0.25); const loose = Math.abs(A.R.gustV);
    A.R.lashed = true; A.R.gustT = 0; A.tickSquall(A.R, 0.25); const tight = Math.abs(A.R.gustV);
    out.gusts = A.R.threat === 'squall' && loose > tight && A.R.ft !== f0 && !G.map.entities.some((e) => e._p93 === 'cutter');
    A.R.gustT = 999; A.R.ft = 500; A.R.target = 500; run(A.B.SQUALL_S + 2); ev4 = document.querySelector('#event button, #event .dfbtn'); if (ev4) ev4.click();
    out.squallPast = !A.R.live && K.mooring() === 'deepwoods';
    play();
    // the switch: off, and every flight goes straight through
    A.setOn(false); K.board(); A.setRoll(() => 0); const g = K.flyFar(H.MAP); out.off = g.ok && !g.met && !A.R.live; K.hop('whispergrove'); A.setOn(true);
    // short hops inside the Reach are never met
    K.board(); A.setRoll(() => 0); const s = K.hop('deepwoods'); out.short = s.ok && !s.met;
    // art made in code
    out.art = ['p93_cutter', 'p93_chain', 'p93_chainbag', 'p93_cradle'].every((k) => Engine.sprites[k]);
    msg = _m;
    return out;
  });
  if (process.env.DEBUG93) console.log(JSON.stringify(r));
  check(r.straight, 'a long flight that the roll passes goes straight through, as before');
  check(r.met && r.notYet && r.valley, 'a long flight that the roll catches is met in the air on the deck; the hours wait; the way to or from the Heights crosses the Valley');
  check(r.stations && r.card, 'the stations are lent for the meeting (the wheel, the crates, the lamps, the cradle) and the flight card shows');
  check(r.states && r.muffle, 'the horn has the Forge\'s four states; lashing the hold and the cloud muffle what it hears');
  check(r.turned, 'a loud ship near the cutter: the horn stops swivelling and turns');
  check(r.weep && r.patch, 'the long gun weeps a tank (never an explosion); Pennick\'s patch stops it, and the tank is sour after');
  check(r.lighter, 'weight over the side gives her lift');
  check(r.hooked && r.cut, 'the grapnels: three chains and four proctors; three blows of the axe part a chain');
  check(r.knocked && r.through && r.unlent, 'knocked down at the rail is not a death: the proctors take part of your purse, she flies on, and the deck is given back');
  check(r.down, 'a forced landing: never lost; half a day and the price of canvas and drift-glass, then on to where she was going');
  check(r.lostIt, 'far enough off and the cutter has lost you');
  check(r.resume, 'a save made mid-meeting finishes the flight on load');
  check(r.packetMet && r.packetPassed, 'a Church packet crosses her course; kept in the cloud, she passes unseen');
  check(r.packetSaw && r.told, 'in open sky with the lamps lit the packet sees her, and the word is at the Keel Docks before her');
  check(r.gusts && r.squallPast, 'a squall line throws her about (worse with the hold unlashed), and ridden out she is through');
  check(r.off && r.short, 'switched off, or a short hop inside the Reach: no meeting');
  check(r.art, 'the cutter, the chain and the cradle are drawn in code');
  const texts = await page.evaluate(() => AIR93.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
