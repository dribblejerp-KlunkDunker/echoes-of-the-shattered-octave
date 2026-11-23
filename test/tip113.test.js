// Phase 113, Design C: the tip, and the Unfinished (js/tip113.js). Run:
//   PREVIEW_URL=http://127.0.0.1:4214 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/tip113.test.js
// The cart gate by Battery Eight, the sally-way under the wall, the stage at the lip, Tower Eight's postern (the
// shortcut), and a Throat-Wraith of three half-sentences that is finished, not fought. Writes no player saves.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4214';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
// the words that may not appear, written backwards so that this file does not hold them either
const rev = (w) => w.split('').reverse().join('');
const WORDS = ['flehs', 'egdel', 'teksab', 'deredner', 'wolloh', 'swolloh', 'epor', 'erif'].map(rev);
const FORBIDDEN = new RegExp('\\b(' + WORDS.join('|') + ')\\b', 'i');

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'tip113.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing at the tip is drawn or decided by chance (no Math.random in the source)');
  const M = require('../js/tip113.js');
  check(Array.isArray(M.TEXTS) && M.TEXTS.length >= 40, 'the module owns its lines (' + (M.TEXTS ? M.TEXTS.length : 0) + ')');
  const tsvPath = path.join(__dirname, '..', 'tools', 'i18n', 'p113-tip.tsv'), tsv = (fs.existsSync(tsvPath) ? fs.readFileSync(tsvPath, 'utf8') : '').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const en = new Set(tsv.map((l) => l[0]));
  const missing = (M.TEXTS || []).filter((t) => !en.has(t));
  check(tsv.length > 0 && !missing.length && tsv.every((l) => l.length === 2 && l[1] && l[1].trim()), 'every string has French' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  { const bad = (M.TEXTS || []).filter((t) => FORBIDDEN.test(t));
    check(!bad.length && FORBIDDEN.test('a ' + WORDS[0] + '.') && !FORBIDDEN.test('a ' + WORDS[0] + 'f'), 'what is under the lip is never named: none of the forbidden words is in any string the module owns (whole words)' + (bad.length ? ': ' + bad[0].slice(0, 80) : '')); }
  { const files = ['js/tip113.js', 'test/tip113.test.js', 'tools/i18n/p113-tip.tsv', 'story/Game Layer/Phase 113 - The Rift Wall, part C (the tip and the Unfinished).md'];
    const hits = []; for (const f of files) { const p = path.join(__dirname, '..', f); if (!fs.existsSync(p)) { hits.push(f + ' (missing)'); continue; } fs.readFileSync(p, 'utf8').split('\n').forEach((l, i) => { if (FORBIDDEN.test(l)) hits.push(f + ':' + (i + 1)); }); }
    check(!hits.length, 'and none is on any line of this phase\'s four files' + (hits.length ? ': ' + hits.slice(0, 3).join(', ') : '')); }
  { const all = (M.TEXTS || []).join(' \n ');
    check(!/Drift-Kestrel|Lyra\b|Kaelen|Vesper|Sable\b|Amalgam/.test(all), 'nobody from the books\' company is named, and nobody here has heard of the Drift-Kestrel');
    const counts = all.match(/\b(two|three|four|five|six|seven|eight|nine|ten|eleven|twelve|twenty|hundred|many|\d+)\s+(\w+\s+)?(wagons?|carts?|people|men|women|years?)\b/gi) || [];
    check(counts.every((c) => /^six years$/i.test(c)), 'no count of wagons, people or years beyond "six years" for the ruts (' + counts.join(' | ') + ')'); }
  const T0 = M.TX || {};
  check(T0.half && T0.half.length === 3 && T0.finished && T0.finished.every((f, i) => f.indexOf(T0.half[i].replace(/—"$/, '')) === 0 && f !== T0.half[i]), 'three half-sentences, each finished by its own ending');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning' && /tip113|rift100|souls91/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  await page.goto(URL0 + '/?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Tip Tester'); await page.locator('#c-next').click(); await page.locator('.classlist button').first().click(); await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const choice = page.locator('#create-panel .list button').first(); if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click(); }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click(); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    const T = TIP113, R = RIFT100, TX = T.TX, out = {};
    window.requestAnimationFrame = () => 0;
    const msgs = []; { const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); }; }
    const said = (t) => msgs.includes(t), clear = () => { msgs.length = 0; }, count = (t) => msgs.filter((m) => m === t).length;
    const go = (id, x, y, dir) => { closeModal(); hide('#event'); hide('#death'); loadMap(id, { x, y, dir: dir || 0 }); G.state = 'play'; G.dead = false; G.player.hp = G.player.hpMax; G.player.voice = G.player.voiceMax; G.fadeT = 0; G.player.feet = G.map.groundAt(x, y); G.murmurT = 0; clear(); };
    const tick = (dt) => { G.player.voice = Math.min(G.player.voiceMax, G.player.voice + dt * 0.08); R.tick(dt); T.tick(dt); };   // (the game's own voice comes back at 0.08 a second)
    const run = (s, step) => { for (let t = 0; t < s && !G.dead; t += step || 0.1) tick(step || 0.1); };
    const reset = () => { for (const k of ['p113_know', 'p113_jaw', 'p113_done', 'p113_tipk', 'p113_tdrop', 'p113_post8', 'p113_tbits']) G.flags[k] = 0; G.player.glassed = false; T.resetState(); };
    // ---- Math.random is counted while the places are built and while the keeper runs
    let rnd = 0; const _r = Math.random; Math.random = function () { rnd++; return _r.apply(Math, arguments); };
    const maps = {}; maps[R.HALLS] = R.buildHalls(); maps[R.MAP] = R.build(); rnd = 0; T.join(maps); const builtRnd = rnd;
    Math.random = _r;
    out.builtNoRandom = builtRnd === 0 && !!maps[T.SALLY] && !!maps[T.TIP];
    const wall = G.maps[R.MAP], sally = G.maps[T.SALLY], tip = G.maps[T.TIP];
    // ---- the maps: the sally-way indoors under its own ceiling, the stage open to the sky
    out.maps = !!sally && !!tip && !!sally.ceil && !tip.ceil && sally.w === T.SW && tip.w === T.TW;
    { let wide = 0, long = 0; for (let x = 1; x < sally.w - 1; x++) { let n = 0; for (let y = 1; y < sally.h - 1; y++) if (!sally.isBlocked(x, y)) n++; if (n >= 5) long++; if (n > 6) wide++; }
      out.sallyShape = long >= 25 && long <= 31 && wide >= 4; }
    // ---- the doors join up
    const cellAt = (m, p) => m.cells[(p[1] | 0) * m.w + (p[0] | 0)];
    const gate = cellAt(wall, T.P.gate), wicket = cellAt(sally, T.S.wicket), mouth = cellAt(sally, T.S.mouth), back = cellAt(tip, T.T.door), post = cellAt(wall, T.P.post8), postIn = cellAt(sally, T.S.post8);
    out.gate = !!gate && gate.door && gate.portal && gate.portal.map === T.SALLY && gate.label === TX.gate && !gate.locked;
    out.joins = !!wicket && wicket.portal && wicket.portal.map === R.MAP && !!mouth && mouth.portal && mouth.portal.map === T.TIP && !!back && back.portal && back.portal.map === T.SALLY;
    out.post = !!post && post.portal && post.portal.map === T.SALLY && post.locked === 'p113_post8' && post.lockMsg === TX.post8Barred && !!postIn && postIn.portal && postIn.portal.map === R.MAP && !postIn.locked;
    { const d = R.degOf(...T.P.gate), d8 = R.degOf(...T.P.post8); out.where = d > R.TOWERS[2].deg && d < R.TOWERS[3].deg && Math.abs(d8 - R.TOWERS[3].deg) < 2 && R.rOf(...T.P.gate) < R.RC - 4; }
    // ---- reachability
    const bfs = (mp, sx, sy) => { const Wm = mp.w, Hm = mp.h, dist = new Int32Array(Wm * Hm).fill(-1), q = [(sy | 0) * Wm + (sx | 0)]; dist[q[0]] = 0;
      for (let hh = 0; hh < q.length; hh++) { const i = q[hh], x = i % Wm, y = (i / Wm) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wm || ny >= Hm) continue; const n = ny * Wm + nx; if (dist[n] >= 0) continue; const c = mp.cells[n]; if (c && !(c.door && !c.locked)) continue; if (mp.isBlocked(nx, ny) && !(c && c.door)) continue; if (Math.abs(mp.groundAt(nx + 0.5, ny + 0.5) - mp.groundAt(x + 0.5, y + 0.5)) > 0.6) continue; dist[n] = dist[i] + 1; q.push(n); } }
      return (x, y) => dist[(y | 0) * Wm + (x | 0)]; };
    const dw = bfs(wall, wall.spawn.x, wall.spawn.y), ds = bfs(sally, sally.spawn.x, sally.spawn.y), dt0 = bfs(tip, tip.spawn.x, tip.spawn.y);
    out.reachWall = dw(...T.P.gateFront) > 0 && dw(...T.P.post8Front) > 0 && dw(...T.P.trooper) > 0;
    out.reachSally = ds(...T.S.mouthFront) > 0 && ds(...T.S.post8Front) > 0 && ds(...T.S.sleeve) > 0 && ds(T.S.post[0], T.S.post[1] + 1.2) > 0;
    out.reachTip = T.T.breaths.every((b) => dt0(b[0], b[1]) > 0) && dt0(...T.T.shoe) > 0 && dt0(...T.T.sprag) > 0;
    { let edge = 0, beyond = 0; for (let j = 0; j < tip.h; j++) for (let i = 0; i < tip.w; i++) { if (dt0(i, j) < 0) continue; if (i >= T.T.lip) edge++; if (j <= T.T.pen[0] || j >= T.T.pen[1]) beyond++; }
      out.penned = edge === 0 && beyond === 0 && dt0(...T.T.brother) < 0 && T.T.brother[0] < T.T.lip && Math.abs(T.T.brother[1] - 95) * 1.5 > 90; }
    // ---- the lamp: a talking-post just inside the wicket, under the Souls rules (group m)
    const L = SOULS91.LAMPS.find((l) => l.map === T.SALLY);
    out.lamp = !!L && L.g === 'm' && SOULS91.GROUPS.m.maps.includes(T.SALLY) && SOULS91.GROUPS.m.maps.includes(T.TIP) && L.id < 30 && Math.hypot(L.x - T.S.wicket[0], L.y - T.S.wicket[1]) < 4;
    reset(); go(T.SALLY, sally.spawn.x, sally.spawn.y, 0);
    { const e = G.ents.find((q) => q && q._p91 === 'lamp'); if (e) { G.player.hp = 1; useDeco(e); } out.note = !!e && said(TX.note) && G.player.hp === G.player.hpMax; closeModal(); G.state = 'play'; }
    // ---- the sally-way's things
    const ent = (k) => G.ents.find((e) => e && e._p113t === k);
    out.things = ['ruts', 'brackets', 'clerk', 'chalk', 'sleeve'].every((k) => { const e = ent(k); return !!e && e.label === TX.name[k]; }) && TX.name.clerk === 'The clerk\'s place';
    clear(); T.useOwn(ent('ruts')); out.ruts = said(TX.look.ruts);
    // the far mouth; the glass arm's line, only for a glassed player
    go(T.SALLY, T.S.mouthFront[0], T.S.mouthFront[1], 0); run(0.5); out.mouth = said(TX.mouthLine) && !said(TX.glass);
    reset(); G.player.glassed = true; go(T.SALLY, T.S.mouthFront[0], T.S.mouthFront[1], 0); run(0.5); out.glass = said(TX.glass); clear(); go(T.SALLY, T.S.mouthFront[0], T.S.mouthFront[1], 0); run(0.5); out.glassOnce = !said(TX.glass); G.player.glassed = false;
    // ---- the postern opens only from within, and stays open
    reset(); go(R.MAP, T.P.post8Front[0], T.P.post8Front[1], 0);
    out.barred = !G.flags.p113_post8 && cellAt(G.map, T.P.post8).locked === 'p113_post8';
    go(T.SALLY, T.S.post8Front[0], T.S.post8Front[1], -Math.PI / 2); transfer(cellAt(G.map, T.S.post8).portal);
    out.opened = G.mapId === R.MAP && G.flags.p113_post8 === 1 && Math.hypot(Engine.cam.x - T.P.post8Front[0], Engine.cam.y - T.P.post8Front[1]) < 1.5;
    // ---- each leaving sets its bit
    reset(); go(T.SALLY, T.S.sleeve[0], T.S.sleeve[1] + 1, -Math.PI / 2); clear(); T.useOwn(ent('sleeve'));
    out.letter = G.flags.p113_know === 1 && said(TX.look.sleeve) && said(TX.letter);
    go(T.TIP, T.T.shoe[0] - 1, T.T.shoe[1], 0); clear(); T.useOwn(ent('shoe')); T.useOwn(ent('card'));
    out.shoeCard = G.flags.p113_know === 7 && said(TX.look.shoe) && said(TX.look.card);
    out.tipThings = ['stage', 'edge', 'brother', 'shoe', 'card', 'sprag'].every((k) => !!ent(k)) && ent('brother').label === TX.name.brother;
    // ---- the breaths: code-made, at the height of a face, with nobody under them
    const br = [1, 2, 3].map((n) => ent('breath' + n));
    out.breaths = br.every((b) => b && !b.hidden && !b.solid && Engine.sprites[b.sprite] && (b.yOff || 0) < -0.3);
    // ---- a breath takes the jaw; the Murmur says its half-sentence, and so does every few seconds, N or not
    reset(); G.flags.p113_know = 0; const B1 = T.T.breaths[0];
    go(T.TIP, B1[0] - 3, B1[1], 0); run(0.3); out.notYet = G.flags.p113_jaw === 0;
    Engine.cam.x = B1[0] - 1.5; run(0.3);
    out.jaw = G.flags.p113_jaw === 1 && said(TX.takes) && said(TX.half[0]);
    clear(); castSong('murmur'); out.murmur = said(TX.half[0]) && G.flags.p113_jaw === 1 && R.state().talkT > 0;
    clear(); run(T.K.EVERY + 0.2); out.unbidden = count(TX.half[0]) >= 1 && G.flags.p113_jaw === 1;
    // it keeps the quiet off: you cannot be Relieved while it holds
    run(R.B.QUIET_S + 2); out.cannotGoQuiet = !R.state().relieved && G.flags.p113_jaw === 1;
    // said again without the ending: the line comes at most once every twenty seconds
    clear(); run(41); out.again = count(TX.again) >= 1 && count(TX.again) <= 3 && count(TX.half[0]) >= 8;
    // ---- with the leaving read, the next saying finishes it, and the breath is gone for good
    G.player.voice = G.player.voiceMax; G.flags.p113_know = 1; clear(); run(T.K.EVERY + 0.2);
    out.finished = said(TX.finished[0]) && said(TX.after[0]) && (G.flags.p113_done & 1) === 1 && G.flags.p113_jaw === 0 && br[0].hidden;
    run(2); out.gone = G.flags.p113_jaw === 0;   // the first does not take it again; the second is not near
    // ---- without the leaving, the voice runs down, it lets go, and you are Relieved
    const B2 = T.T.breaths[1]; go(T.TIP, B2[0] - 1.4, B2[1], 0); G.player.voice = G.player.voiceMax; run(0.3);
    out.jaw2 = G.flags.p113_jaw === 2 && said(TX.half[1]);
    let held = 0; while (G.flags.p113_jaw === 2 && held < 200 && !G.dead) { tick(0.1); held += 0.1; }
    out.voiceOut = said(TX.voiceOut) && G.flags.p113_jaw === 0 && (G.flags.p113_done & 2) === 0 && held > 70 && held < 115;
    tick(0.1); out.relieved = R.state().relieved && said(R.TX.relieved);
    { let g = 0; while (!G.dead && g++ < 900) tick(0.1); out.over = G.dead; }
    out.held = Math.round(held);
    // ---- the three, in order: the keeper is settled, and the leavings come once
    reset(); G.flags.p113_know = 7; G.flags.p113_done = 1;
    go(T.TIP, B2[0] - 1.4, B2[1], 0); run(0.3); out.order = G.flags.p113_jaw === 2;
    run(T.K.EVERY + 0.3); out.second = (G.flags.p113_done & 2) === 2 && said(TX.finished[1]) && said(TX.after[1]);
    // the sprag will not come before
    clear(); T.useOwn(ent('sprag')); out.spragNo = said(TX.spragNo) && !G.player.weapons.includes('p113_sprag');
    const items0 = G.ents.filter((e) => e && e.kind === 'item').length, B3 = T.T.breaths[2];
    Engine.cam.x = B3[0] - 1.2; Engine.cam.y = B3[1]; run(0.3); out.third = G.flags.p113_jaw === 3;
    run(T.K.EVERY + 0.3);
    out.settled = G.flags.p113_tipk === 1 && G.flags.p113_done === 7 && said(TX.finished[2]) && said(TX.settle[0]) && said(TX.settle[1]) && G.flags.p113_tdrop === 1;
    const items1 = G.ents.filter((e) => e && e.kind === 'item');
    out.leavings = items1.length === items0 + 1 && items1.some((e) => e.item === 'v_p113_leavings') && ITEMS.v_p113_leavings.value === 0 && ITEMS.v_p113_leavings.desc === TX.leavingsDesc;
    run(3); go(T.TIP, B3[0] - 1.2, B3[1], 0); run(1); out.once = G.ents.filter((e) => e && e.kind === 'item' && e.item === 'v_p113_leavings').length <= 1 && G.flags.p113_jaw === 0 && br.every((b) => b.hidden);
    // and after, it comes
    { const e = ent('sprag'); clear(); T.useOwn(e); out.spragYes = G.player.weapons.includes('p113_sprag') && e.hidden && !said(TX.spragNo); }
    // ---- the Watch's rule holds on the stage, and in the far half of the sally-way: no bell here
    go(T.TIP, 8.5, T.T.door[1] + 0.5, Math.PI); run(R.B.QUIET_S + 0.3); out.tipQuiet = R.state().relieved && said(R.TX.relieved) && !said(R.TX.bellSave);
    { const x0 = Engine.cam.x; run(1); out.walksEast = Engine.cam.x > x0 + 0.3; }
    go(T.SALLY, 6.5, 6.5, Math.PI); run(R.B.QUIET_S + 1); out.nearHalf = !R.state().relieved;
    go(T.SALLY, 22.5, 6.5, Math.PI); run(R.B.QUIET_S + 0.3); out.farHalf = R.state().relieved;
    { let g = 0; while (G.mapId === T.SALLY && g++ < 400 && !G.dead) tick(0.1); out.toTheTip = G.mapId === T.TIP && !G.dead; run(1); out.stillGoing = R.state().relieved; }
    go(T.TIP, 8.5, T.T.door[1] + 0.5, 0); run(R.B.WARN_S - 1); addNoise(0.5); out.noise = R.state().quiet === 0;
    // ---- the light: the wall's own curve on the stage; the sally-way dark always
    G.tod = 0.5; go(T.TIP, 3.5, T.T.door[1] + 0.5, 0); tick(0.1); out.dayTip = Math.abs(tip.ambient - R.wallAmbient(0.5)) < 0.01 && tip.fogColor.join() === R.LIGHT.FOG_DAY.join();
    G.tod = 0.95; tick(0.1); out.nightTip = Math.abs(tip.ambient - R.wallAmbient(0.95)) < 0.01 && tip.fogColor.every((c, i) => Math.abs(c - R.LIGHT.FOG_NIGHT[i]) <= 1) && tip.fogDist < 20;
    G.tod = 0.5; go(T.SALLY, 3.5, 6.5, 0); tick(0.1); const a1 = sally.ambient; G.tod = 0.95; tick(0.1); out.sallyDark = a1 < 0.3 && sally.ambient === a1; G.tod = 0.5;
    // ---- the trooper's subject
    out.trooper = !!NPCS.p113_trooper && NPCS.p113_trooper.topics[TX.cartGateTopic] === TX.cartGateLine && wall.entities.some((e) => e.kind === 'npc' && e.id === 'p113_trooper') && VOICES.resolveNpc('p113_trooper').authored;
    // ---- the sprag: its own look everywhere a weapon has one
    const A = GEARLOOK21.WEAPONS, sig = (o) => JSON.stringify(Object.assign({}, o, { id: 0, notes: 0 }));
    out.sprag = !!WEAPONS.p113_sprag && WEAPONS.p113_sprag.blunt && WEAPONS.p113_sprag.speed < WEAPONS.p100_mallet.speed && WEAPONS.p113_sprag.dmg[1] <= WEAPONS.p100_mallet.dmg[1] && ITEMS.w_p113_sprag.desc === TX.spragDesc
      && !!A.p113_sprag && Object.keys(A).filter((k) => sig(A[k]) === sig(A.p113_sprag)).length === 1
      && typeof ICONS.PIX.w_p113_sprag === 'function' && typeof ICONS.PIX['weapon:p113_sprag'] === 'function' && typeof ICONS.PIX.v_p113_leavings === 'function'
      && FP87.covers('p113_sprag') && GEAR87.SET_OF.p113_sprag === 'watch';
    // ---- the flags survive a save and a load
    { const want = { p113_know: 5, p113_jaw: 0, p113_done: 3, p113_tipk: 0, p113_tdrop: 0, p113_post8: 1, p113_tbits: 2 }; Object.assign(G.flags, want);
      const snap = JSON.parse(JSON.stringify(snapshotGame())); for (const k in want) G.flags[k] = 0; closeModal(); restoreGame(snap);
      out.saved = Object.keys(want).every((k) => G.flags[k] === want[k]) && !!G.maps[T.SALLY] && !!G.maps[T.TIP]; }
    // ---- Math.random while the keeper runs
    { reset(); G.flags.p113_know = 1; go(T.TIP, B1[0] - 1.5, B1[1], 0); let n = 0; const _r2 = Math.random; Math.random = function () { n++; return _r2.apply(Math, arguments); }; for (let i = 0; i < 80; i++) T.tick(0.1); Math.random = _r2; out.keeperNoRandom = n === 0 && (G.flags.p113_done & 1) === 1; }
    // ---- hostile flags do no harm
    try { for (const k of ['p113_know', 'p113_jaw', 'p113_done', 'p113_tipk', 'p113_tdrop', 'p113_post8', 'p113_tbits']) G.flags[k] = k.length % 2 ? '<img src=x onerror=1>' : 1e12;
      go(T.TIP, 3.5, T.T.door[1] + 0.5, 0); run(1); castSong('murmur'); go(T.SALLY, 3.5, 6.5, 0); run(1); T.sync(); out.hostile = true; } catch (e) { out.hostile = String(e); }
    // ---- away from the Rift none of it runs
    reset(); go('oakhaven', G.maps.oakhaven.spawn.x, G.maps.oakhaven.spawn.y, 0); run(T.K.EVERY * 3); out.elsewhere = msgs.length === 0 && G.flags.p113_jaw === 0;
    return out;
  });
  check(r.builtNoRandom, 'nothing is chosen by chance while the sally-way and the stage are built');
  check(r.maps && r.sallyShape, 'the sally-way is indoors under its own ceiling, five cells wide and twenty-five to thirty long with a wider turning-place; the stage is open');
  check(r.gate && r.where, 'the cart gate stands in the wall on the Watch\'s side between Towers Seven and Eight, and its wicket goes into the sally-way');
  check(r.joins && r.post, 'the doors join up: the wicket back to the wall, the far mouth to the stage and back; Tower Eight\'s postern barred on the Watch\'s side');
  check(r.reachWall && r.reachSally && r.reachTip, 'every place can be walked to: the gate and the postern from the wall; the mouth, the postern and the sleeve; the breaths, the shoe and the sprag');
  check(r.penned, 'nobody walks over the lip or along it: the cable fence pens the ground, and the Lead Brother stands out of reach, a hundred yards along');
  check(r.lamp && r.note, 'a talking-post just inside the wicket under the Souls rules (group m); resting there reads its note aloud');
  check(r.things && r.ruts, 'the sally-way\'s five things are there to look at (the clerk\'s place by that name)');
  check(r.mouth && r.glass && r.glassOnce, 'the far mouth has its line; the glass arm\'s line is said once, and only for a glassed player');
  check(r.barred && r.opened, 'Tower Eight\'s postern opens only from within, and stays open after');
  check(r.letter && r.shoeCard && r.tipThings, 'each leaving sets its bit: the letter, the shoe, the card');
  check(r.breaths, 'three breaths hang at the height of a face, not solid, drawn in code');
  check(r.notYet && r.jaw && r.murmur && r.unbidden, 'within two cells a breath takes the jaw; the Murmur says its half-sentence, and it is said every few seconds unbidden');
  check(r.cannotGoQuiet, 'while it holds you cannot go quiet, so you cannot be Relieved');
  check(r.again, 'said again without its ending, at most once every twenty seconds');
  check(r.finished && r.gone, 'with the leaving read the next saying finishes the sentence, and the breath is gone for good');
  check(r.jaw2 && r.voiceOut && r.relieved && r.over, 'without it the voice runs down in about ninety seconds (' + r.held + ' s), it lets go, and the Watch\'s rule takes you to the edge');
  check(r.order && r.second && r.third && r.settled, 'one at a time, in order: the third finished settles the keeper');
  check(r.leavings && r.once, 'the Three Leavings appear once, worth nothing to anybody');
  check(r.spragNo && r.spragYes, 'Carter\'s Sprag will not come before the keeper is settled, and comes after');
  check(r.tipQuiet && r.walksEast && r.noise, 'the Watch\'s rule holds on the stage: no bell, Relieved, walking for the edge; any sound of yours is talk');
  check(r.nearHalf && r.farHalf && r.toTheTip && r.stillGoing, 'in the far half of the sally-way too (not the near half), and a Relieved walker goes out of the mouth and on');
  check(r.dayTip && r.nightTip && r.sallyDark, 'the stage takes the wall\'s own light by the hour (grey by day, black by night); the sally-way is dark always');
  check(r.trooper, 'a trooper of the Watch by Battery Eight has the cart gate for a subject, in her own voice');
  check(r.sprag, 'the sprag is a blunt one-handed weapon a little heavier than the mallet and no better, with its own look, icon, painting and set');
  check(r.saved, 'the new flags survive a save and a load');
  check(r.keeperNoRandom, 'nothing is chosen by chance while the keeper runs');
  check(r.hostile === true, 'hostile flags do no harm' + (r.hostile === true ? '' : ': ' + r.hostile));
  check(r.elsewhere, 'away from the Rift none of it runs');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  if (fails) console.log(JSON.stringify(r));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
