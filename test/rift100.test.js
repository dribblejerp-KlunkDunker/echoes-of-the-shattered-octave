// Phase 100: the Continental Rift, part one (js/rift100.js). Run: PREVIEW_URL=http://127.0.0.1:4176 node test/rift100.test.js
// Null-Watch's Wall and Talking Halls: the plan, the lamps, the chain, the talk rule, the bell, the Relieved, the Stray,
// the rail, the Watch's Issue. Uses the managed preview; writes no player saves.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4176';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'rift100.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing on the Watch is drawn or decided by chance');
  const M = require('../js/rift100.js');
  const tsv = fs.readFileSync(path.join(__dirname, '..', 'tools', 'i18n', 'p100-rift.tsv'), 'utf8').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const en = new Set(tsv.map((l) => l[0]));
  const missing = M.TEXTS.filter((t) => !en.has(t));
  check(M.TEXTS.length > 250 && !missing.length && tsv.every((l) => l.length === 2 && l[1] && l[1].trim()), 'every new line has French (' + M.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  // what the books do later is never done here, and nobody from the books' company is named
  const words = M.TEXTS.join(' \n ');
  check(!/Lyra\b|Kaelen|Vesper|Sable\b|Mags\b|Seraphina|Solenne|Drift-Kestrel|Unfinished|Amalgam|\bbasket\b/i.test(words), 'nobody from the books\' company is named, and the basket, the Unfinished and the Amalgam are left for the book');
  check(/Ward/.test(M.TX.ward) && /Ninety-Four/.test(M.TX.n94) && !/Orrel|Pruett|Greer/.test(words), 'troopers go by rota-number; their names come back at discharge');

  // ---- the plan (no browser needed)
  const plan = M.plan(), W = M.W, H = M.H, kind = plan.kind;
  const count = {}; for (const k of kind) count[k] = (count[k] || 0) + 1;
  check(W === 372 && H === 133 && count[4] > 400 && count[11] > 100 && count[7] > 2000 && count[8] > 2000, 'the wall map is cut from the city\'s own plan: a wall-walk, a coping, a rock lip and what is beyond it');
  { // nobody can step off the Rift side: every walk cell's neighbours are walk, stair, coping, tower or wall
    let off = 0, copeAlone = 0;
    for (let j = 1; j < H - 1; j++) for (let i = 1; i < W - 1; i++) { const k = j * W + i;
      if (kind[k] === 4 || kind[k] === 5) for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const t = kind[(j + dy) * W + i + dx]; if (t === 7 || t === 8) off++; }
      if (kind[k] === 11) { let near = false; for (let dy = -2; dy <= 2 && !near; dy++) for (let dx = -2; dx <= 2; dx++) { const t = kind[(j + dy) * W + i + dx]; if (t === 4 || t === 10) { near = true; break; } } if (!near) copeAlone++; } }
    check(off === 0 && copeAlone === 0, 'the wall-walk never touches the rock or the edge: a lead coping runs the whole Rift side');
  }
  check(M.TOWERS.length === 5 && M.TOWERS.map((t) => t.n).join() === '5,6,7,8,9' && M.TOWERS.filter((t) => !t.manned).map((t) => t.n).join() === '8', 'five batteries, Five to Nine; Tower Eight is hooded and unmanned');
  { const r = M.rOf(...M.P.stairTop), d = M.degOf(...M.P.stairTop); check(r > M.RC - 5 && r < M.RC - 1 && d > 0 && d < 9, 'the wall stair comes up between Towers Five and Six (Book Three)'); }
  check(M.B.QUIET_S > M.B.WARN_S && M.B.TALK_S > 0 && M.B.GAP1 > M.B.GAP0 && M.B.GAP1 < M.B.CYCLE, 'the numbers hold together: a warning before the quiet, a gap inside the Stray\'s round');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning' && /rift100/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  await page.goto(URL0 + '/?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Rift Tester'); await page.locator('#c-next').click(); await page.locator('.classlist button').first().click(); await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const choice = page.locator('#create-panel .list button').first(); if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click(); }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click(); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    const R = RIFT100, out = {}, B = R.B, TX = R.TX;
    window.requestAnimationFrame = () => 0;
    const msgs = []; { const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); }; }
    const said = (t) => msgs.includes(t), clear = () => { msgs.length = 0; };
    const go = (id, x, y, dir) => { closeModal(); hide('#event'); loadMap(id, { x, y, dir: dir || 0 }); G.state = 'play'; G.dead = false; G.player.hp = G.player.hpMax; G.fadeT = 0; G.player.feet = G.map.groundAt(x, y); G.murmurT = 0; clear(); };   // (the game's own clock runs the Murmur down; here the frames are stepped by hand)
    const run = (s, step) => { for (let t = 0; t < s && !G.dead; t += step || 0.1) R.tick(step || 0.1); };
    const pick = (i) => { const b = document.querySelectorAll('#event-panel button')[i]; if (b) b.click(); return !!b; };
    const nChoices = () => (G.state === 'event' ? document.querySelectorAll('#event-panel button').length : 0);
    const m = G.maps[R.MAP], h = G.maps[R.HALLS];
    out.maps = !!m && !!h && m.w === R.W && h.w === R.HW && m.bright === true;
    // ---- reachability (doors that are locked do not count as ways)
    const bfs = (mp, sx, sy) => { const Wm = mp.w, Hm = mp.h, dist = new Int32Array(Wm * Hm).fill(-1), q = [(sy | 0) * Wm + (sx | 0)]; dist[q[0]] = 0;
      for (let hh = 0; hh < q.length; hh++) { const i = q[hh], x = i % Wm, y = (i / Wm) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wm || ny >= Hm) continue; const n = ny * Wm + nx; if (dist[n] >= 0) continue; const c = mp.cells[n]; if (c && !(c.door && !c.locked)) continue; if (mp.isBlocked(nx, ny) && !(c && c.door)) continue; if (Math.abs(mp.groundAt(nx + 0.5, ny + 0.5) - mp.groundAt(x + 0.5, y + 0.5)) > 0.6) continue; dist[n] = dist[i] + 1; q.push(n); } }
      return (x, y) => dist[(y | 0) * Wm + (x | 0)]; };
    const d = bfs(m, m.spawn.x, m.spawn.y), dh = bfs(h, h.spawn.x, h.spawn.y);
    out.reach = d(...R.P.stairTop) > 0 && d(R.P.nineLamp[0] + 1.4, R.P.nineLamp[1] + 1.4) > 0 && d(R.P.gateLamp[0] + 1.4, R.P.gateLamp[1] + 1.4) > 0 && d(...R.P.hallsOut) > 0 && d(...R.P.magOut) > 0;
    out.hreach = dh(R.Q.post[0], R.Q.post[1] + 1.6) > 0 && dh(R.Q.locker[0], R.Q.locker[1] + 1) > 0 && dh(...R.Q.stray) > 0;
    { let rock = 0; const k = m._p100.kind; for (let j = 0; j < m.h; j++) for (let i = 0; i < m.w; i++) if ((k[j * m.w + i] === 7 || k[j * m.w + i] === 8) && d(i, j) >= 0) rock++; out.rockShut = rock === 0; }
    { const g = m.cells[R.P.gateDoor[1] * m.w + R.P.gateDoor[0]]; out.gateShut = !!g && !!g.door && g.locked === '__never'; }
    // ---- the lamps: the Souls rules, group m
    const L = R.lamps(); out.lamps = L.length === 3 && L.filter((l) => l.map === R.MAP).length === 2 && L.filter((l) => l.map === R.HALLS).length === 1 && typeof SOULS91 !== 'undefined';
    // ---- the Kestrel flies here
    out.far = typeof KESTREL16 !== 'undefined' && !KESTREL16.addFar({ id: R.MAP, name: 'x', hours: 1 });   // refused: already there
    // ---- the chain: nobody goes up the wall stair without a subject
    const st = R.STAIRS[0], onStair = R.pol((st.r0 + st.r1) / 2, st.deg);
    G.flags.p100_subj = 0; go(R.MAP, onStair[0], onStair[1], 0); R.tick(0.1);
    out.chain = said(TX.chainMsg) && Math.hypot(Engine.cam.x - (R.P.chain[0] - 1.6), Engine.cam.y - R.P.chain[1]) < 0.01;
    G.flags.p100_subj = 1; G.flags.p100_line = 0; go(R.MAP, onStair[0], onStair[1], 0); R.tick(0.1);
    out.chainPass = !said(TX.chainMsg) && Math.hypot(Engine.cam.x - onStair[0], Engine.cam.y - onStair[1]) < 0.01;
    // ---- talk: the Murmur says the next line of your subject, and makes your sound
    const walkAt = (deg) => R.pol(R.RC - 3, deg);
    const five = walkAt(1.5), eight = walkAt(31);   // by Tower Five's bell; between Eight and Nine, where no bell reaches
    go(R.MAP, five[0], five[1], Math.PI); const n0 = G.noise; castSong('murmur');
    out.murmur = said(TX.days0) && G.flags.p100_line === 1 && R.state().talkT > 0 && G.noise > n0; castSong('murmur'); out.murmur2 = said(TX.days1);
    G.flags.p100_subj = 2; G.flags.p100_eyes = 0; clear(); castSong('murmur'); out.eyes = msgs.some((t) => /1, 2, 3/.test(t)) && G.flags.p100_eyes === 3; G.flags.p100_subj = 1;
    // ---- quiet near a manned battery: a warning, then the bell fetches you back
    go(R.MAP, five[0], five[1], Math.PI); out.onLip = R.onLip(five[0], five[1]) && R.mannedNear(five[0], five[1]) && !R.mannedNear(eight[0], eight[1]);
    run(B.WARN_S + 0.3); out.warn = said(TX.quietWarn) && !R.state().relieved;
    run(B.QUIET_S - B.WARN_S + 0.2); out.bell = said(TX.bellSave) && !R.state().relieved && !G.dead;
    // any sound of yours is talk
    go(R.MAP, five[0], five[1], Math.PI); run(B.WARN_S - 1); addNoise(0.5); out.noiseTalks = R.state().quiet === 0 && R.state().talkT > 0;
    // ---- the unmanned stretch: Relieved; your own voice stops you
    go(R.MAP, eight[0], eight[1], Math.PI); run(B.QUIET_S + 0.3);
    out.relieved = R.state().relieved && said(TX.relieved) && !G.dead;
    const x1 = Engine.cam.x, y1 = Engine.cam.y; run(1.0); out.walks = R.rOf(Engine.cam.x, Engine.cam.y) > R.rOf(x1, y1) + 0.3;
    castSong('murmur'); out.saved = !R.state().relieved && said(TX.talkSave);
    // ---- and if nobody speaks: to the coping, and over
    go(R.MAP, eight[0], eight[1], Math.PI); run(B.QUIET_S + 0.3); let guard = 0; while (!G.dead && guard++ < 400) R.tick(0.1);
    out.over = G.dead && G.state === 'dead' && guard < 400;
    // ---- the Watch's Issue: three pieces, then all five
    go(R.MAP, five[0], five[1], Math.PI);
    const p = G.player; const keepArmor = Object.assign({}, p.armor), keepW = p.weapons.slice(), keepWi = p.weapon;
    p.armor.body = 'a_p100_coat'; p.armor.hands = 'a_p100_mitts'; p.armor.feet = 'a_p100_felts'; out.setTalk = GEAR87.special('talk') && !GEAR87.special('bell');
    G.murmurT = 0; R.talk(); run(B.TALK_S + 0.05); R.setQuiet(0); run(3, 0.1); out.slowQuiet = Math.abs(R.state().quiet - 2) < 0.11;
    out.sets = GEAR87.SETS.length === 19 && GEAR87.SETS[18].id === 'watch';
    Object.assign(p.armor, { body: keepArmor.body, hands: keepArmor.hands, feet: keepArmor.feet }); p.weapons = keepW; p.weapon = keepWi;
    // ---- the battery rail: dead until the chock is knocked out at Nine's end; then three stops
    const rail = (which) => G.ents.find((e) => e && e._p100 === 'rail_' + which);
    G.flags.p100_rail = 0; go(R.MAP, R.P.railYard[0] - 1.3, R.P.railYard[1], 0); R.sync();
    out.railEnts = !!rail('yard') && !!rail('nine') && !!rail('gate');
    R.useOwn(rail('yard')); out.railDead = said(TX.railDead) && G.flags.p100_rail === 0;
    R.useOwn(rail('nine')); out.railFree = said(TX.railFree) && G.flags.p100_rail === 1;
    R.useOwn(rail('yard')); out.railChoices = nChoices() === 3; pick(0);
    out.railRode = said(TX.railRide) && Math.hypot(Engine.cam.x - R.P.railNine[0], Engine.cam.y - R.P.railNine[1]) < 8 && G.state === 'play';

    // ================= the Talking Halls
    go(R.HALLS, R.Q.in[0], R.Q.in[1], -Math.PI / 2);
    { const hx = (R.Q.hall[0] + R.Q.hall[2]) / 2, hy = (R.Q.hall[1] + R.Q.hall[3]) / 2; Engine.cam.x = hx; Engine.cam.y = hy; const n1 = G.noise = 1; addNoise(2); out.hallSwallows = G.noise === n1;
      Engine.cam.x = R.Q.locker[0]; Engine.cam.y = R.Q.locker[1] + 1; addNoise(2); out.barrackHears = G.noise === 3; G.noise = 0; }
    // the talk-roster gives a visitor a subject
    G.flags.p100_subj = 0; const roster = G.ents.find((e) => e && e.use === 'p100_roster'), locker = G.ents.find((e) => e && e.use === 'p100_locker'), rack = G.ents.find((e) => e && e.use === 'p100_felts');
    out.things = !!roster && !!locker && !!rack;
    R.useOwn(roster); out.rosterChoices = nChoices() === 4; pick(2); out.subject = G.flags.p100_subj === 3 && said(TX.subjTaken);
    // the felt rack: one pair
    const had = G.has('a_p100_felts'); R.useOwn(rack); const got = G.has('a_p100_felts'); const n2 = G.player.inv.filter((s) => s.id === 'a_p100_felts').reduce((a, s) => a + s.n, 0); R.useOwn(rack);
    out.felts = !had && got && G.player.inv.filter((s) => s.id === 'a_p100_felts').reduce((a, s) => a + s.n, 0) === n2 && said(TX.feltHave);
    // ---- the Stray
    G.flags.p100_stray = 0; G.flags.p100_words = 0; G.flags.p100_kdrop = 0;
    go(R.HALLS, R.Q.stray[0], R.Q.stray[1] + 3, -Math.PI / 2); R.sync();
    const stray = G.ents.find((e) => e && e._p100 === 'stray');
    out.stray = !!stray && !stray.hidden;
    run(1); out.line1 = said(TX.line1); run(4); out.line2 = said(TX.line2); run(4); out.line3 = said(TX.line3); run(3.5); out.gap = said(TX.lineGap); run(4.6); out.again = said(TX.lineAgain); run(2); out.round = msgs.filter((t) => t === TX.line1).length === 2;
    // blows do not put it down
    stray.hp = 0; stray.dead = true; R.tick(0.1); out.rings = stray.hp === 900 && !stray.dead && said(TX.rings);
    // outside the gap it does not hear you; in the gap, without the words, you do not know them
    R.setStray(1); clear(); castSong('murmur'); out.notNow = said(TX.notNow) && G.state === 'play';
    R.setStray(B.GAP0 + 1); clear(); castSong('murmur'); out.noWords = said(TX.noWords) && G.state === 'play';
    // the footlocker has them
    R.useOwn(locker); out.lockerEvent = nChoices() === 1 && /nothing's wanted of you anywhere/.test(document.querySelector('#event-panel').textContent); pick(0); out.words = G.flags.p100_words === 1;
    // a wrong line costs you, and it begins again
    Engine.cam.x = R.Q.stray[0]; Engine.cam.y = R.Q.stray[1] + 3;
    R.setStray(B.GAP0 + 1); clear(); const hp0 = G.player.hp; castSong('murmur'); out.sayChoices = nChoices() === 4; pick(0);
    out.wrong = said(TX.wrong) && G.player.hp === hp0 - 8 && R.state().sClock === 0 && G.flags.p100_stray === 0;
    // the right line stands it down, once
    R.setStray(B.GAP0 + 1); clear(); const xp0 = G.player.xp, lvl0 = G.player.level, items0 = G.ents.filter((e) => e && e.kind === 'item').length; castSong('murmur'); pick(1);
    const stood = G.ents.find((e) => e && e._p100 === 'stood');
    out.right = G.flags.p100_stray === 1 && said(TX.stoodDown) && stray.hidden && !!stood && !stood.hidden && (G.player.xp !== xp0 || G.player.level !== lvl0);
    const items1 = G.ents.filter((e) => e && e.kind === 'item'); out.leavings = items1.length === items0 + 2 && items1.some((e) => e.item === 'w_p100_mallet') && items1.some((e) => e.item === 'v_p100_tape') && G.flags.p100_kdrop === 1;
    run(2); R.standDown && 0; out.once = G.ents.filter((e) => e && e.kind === 'item').length === items0 + 2;
    clear(); castSong('murmur'); out.afterMurmur = nChoices() === 0;   // the Murmur is talk again
    // ---- no shot is fired among the powder
    { const kw = p.weapons.slice(), ki = p.weapon; p.weapons = ['pistol']; p.weapon = 0; clear(); attack(); out.shot = said(TX.shot); p.weapons = kw; p.weapon = ki; }
    // ---- things: looks, icons, voices
    const A = GEARLOOK21.ARMOR, WL = GEARLOOK21.WEAPONS, sig = (o) => JSON.stringify(Object.assign({}, o, { id: 0, notes: 0 }));
    const uniq = (tab, ids) => ids.every((id) => tab[id] && Object.keys(tab).filter((k) => sig(tab[k]) === sig(tab[id])).length === 1);
    out.looks = uniq(A, ['a_p100_coat', 'a_p100_mitts', 'a_p100_felts']) && uniq(WL, ['p100_spike', 'p100_mallet']);
    out.icons = ['a_p100_coat', 'a_p100_mitts', 'a_p100_felts', 'w_p100_spike', 'w_p100_mallet', 'v_p100_tape'].every((k) => typeof ICONS.PIX[k] === 'function');
    const ids = Object.keys(NPCS).filter((k) => /^p100_/.test(k));
    out.voices = ids.length >= 17 && ids.every((id) => VOICES.resolveNpc(id).authored) && VOICES.resolveNpc('p100_ward').silent && VOICES.resolveEnemy('p100_stray').authored;
    // ---- hostile flags do no harm
    try { for (const k of ['p100_subj', 'p100_line', 'p100_eyes', 'p100_words', 'p100_stray', 'p100_kdrop', 'p100_rail', 'p100_seen']) G.flags[k] = k.length % 2 ? '<img src=x onerror=1>' : 1e12;
      go(R.MAP, five[0], five[1], 0); run(1); castSong('murmur'); go(R.HALLS, R.Q.in[0], R.Q.in[1], 0); run(1); R.sync(); out.hostile = true; } catch (e) { out.hostile = String(e); }
    // ---- away from the Watch nothing of this runs
    for (const k of ['p100_subj', 'p100_line', 'p100_eyes', 'p100_words', 'p100_stray', 'p100_kdrop', 'p100_rail', 'p100_seen']) G.flags[k] = 0;
    go('oakhaven', G.maps.oakhaven.spawn.x, G.maps.oakhaven.spawn.y, 0); const nz = G.noise = 0; run(B.QUIET_S + 2); addNoise(1);
    out.elsewhere = !R.state().relieved && R.state().quiet === 0 && G.noise === nz + 1 && msgs.length === 0;
    return out;
  });
  check(r.maps, 'both maps are built; the wall is lit by the sky it has');
  check(r.reach && r.hreach, 'every room can be walked to: the stair top, both wall lamps, the Halls\' door, the magazine lane; the post, the footlocker, the Stray');
  check(r.rockShut && r.gateShut, 'nobody walks on the rock lip, and the west gate does not open (a later phase)');
  check(r.lamps && r.far, 'three talking-posts under the Souls rules (group m); the Kestrel flies to the mooring-yard');
  check(r.chain && r.chainPass, 'Two-Eleven turns you back at the chain without a subject, and lets you up with one');
  check(r.murmur && r.murmur2 && r.eyes, 'the Murmur on the Watch says the next line of your subject (the days; the cable-eyes count on)');
  check(r.onLip && r.warn && r.bell, 'go quiet by a manned battery: a warning, then the bell, and you are fetched back');
  check(r.noiseTalks, 'any sound of yours counts as talk on the wall');
  check(r.relieved && r.walks && r.saved, 'from Seven to Nine nobody rings: you are Relieved and walk for the edge, until you hear your own voice');
  check(r.over, 'and if you say nothing, you go to the coping and over it');
  check(r.setTalk && r.slowQuiet && r.sets, 'the Watch\'s Issue is the nineteenth set: three pieces and the quiet comes on half as slow again');
  check(r.railEnts && r.railDead && r.railFree && r.railChoices && r.railRode, 'the battery rail: dead until the chock is knocked out at Tower Nine; then three stops');
  check(r.hallSwallows && r.barrackHears, 'the Talking Halls swallow every sound you make; the barrack does not');
  check(r.things && r.rosterChoices && r.subject, 'the talk-roster gives a visitor one of four subjects');
  check(r.felts, 'one pair of powder-felts from the rack');
  check(r.stray && r.line1 && r.line2 && r.line3 && r.gap && r.again && r.round, 'the Stray says three lines, waits for the fourth, and begins again');
  check(r.rings, 'blows ring on it and do not put it down');
  check(r.notNow && r.noWords, 'it hears you only in the gap; and you cannot say a line you have not read');
  check(r.lockerEvent && r.words, 'Fifty-One\'s footlocker has the four lines');
  check(r.sayChoices && r.wrong, 'a wrong line costs you, and it begins again from the beginning');
  check(r.right && r.leavings && r.once && r.afterMurmur, 'the fourth line stands it down: its leavings once (the mallet and the tape), and it is not fought again');
  check(r.shot, 'no shot is fired among the powder');
  check(r.looks && r.icons && r.voices, 'every piece has a look of its own, an icon, and every voice is written (the General has none)');
  check(r.hostile === true, 'hostile flags do no harm' + (r.hostile === true ? '' : ': ' + r.hostile));
  check(r.elsewhere, 'away from the Watch none of it runs');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  if (fails) console.log(JSON.stringify(r));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
