// Phase 113, Design A: the wall keeps its secret (js/stores113.js). Run:
//   PREVIEW_URL=http://127.0.0.1:4213 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/stores113.test.js
// The Quartermaster's stores at Tower Nine's foot, his four errands (Work), and a night on the wall-walk between Towers
// Five and Six at the third hour. Nobody goes past the lip and nobody is told what is down there. Writes no player saves.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4213';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
// the seven words that may not appear, written backwards so that this file does not hold them either
const rev = (w) => w.split('').reverse().join('');
const SEVEN = ['flehs', 'egdel', 'teksab', 'woleb', 'deredner', 'wolloh', 'epor'].map(rev);
const FORBIDDEN = new RegExp('\\b(' + SEVEN.join('|') + ')\\b', 'i');

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'stores113.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing in the stores or the night is drawn or decided by chance (no Math.random in the source)');
  const M = require('../js/stores113.js');
  check(Array.isArray(M.TEXTS) && M.TEXTS.length >= 45, 'the module owns its lines (' + (M.TEXTS ? M.TEXTS.length : 0) + ')');
  const tsv = fs.readFileSync(path.join(__dirname, '..', 'tools', 'i18n', 'p113-stores.tsv'), 'utf8').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const en = new Set(tsv.map((l) => l[0]));
  const missing = M.TEXTS.filter((t) => !en.has(t));
  check(!missing.length && tsv.every((l) => l.length === 2 && l[1] && l[1].trim()), 'every line has French' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  { const bad = M.TEXTS.concat(tsv.map((l) => l[1] || '')).filter((t) => FORBIDDEN.test(t));
    check(!bad.length && FORBIDDEN.test('the ' + SEVEN[1]) && !FORBIDDEN.test('the ' + SEVEN[1] + 'r'), 'none of the forbidden words is in any string the module owns (word boundaries: ledger is allowed)' + (bad.length ? ': ' + bad[0].slice(0, 80) : '')); }
  { const files = ['js/stores113.js', 'test/stores113.test.js', 'tools/i18n/p113-stores.tsv', 'story/Game Layer/Phase 113 - The Rift Wall, part A (the stores and the night on the wall).md'];
    const hits = []; for (const f of files) fs.readFileSync(path.join(__dirname, '..', f), 'utf8').split('\n').forEach((l, i) => { if (FORBIDDEN.test(l)) hits.push(f + ':' + (i + 1)); });
    check(!hits.length, 'and none is on any line of this phase\'s four files' + (hits.length ? ': ' + hits.slice(0, 3).join(', ') : '')); }
  check(!/Drift-Kestrel|Lyra\b|Kaelen|Vane\b|Bridie|Fen\b/.test(M.TEXTS.join(' \n ')), 'nobody here has heard of the Drift-Kestrel, and nobody from the book is named');
  { const T = M.THIRD_HOUR; check(T && T.from > 0.85 && T.to < 0.95 && Math.abs((T.to - T.from) * 24 - 1) < 0.01, 'the third hour of the night is one hour long, two hours after full dark (' + (T ? (T.from * 24).toFixed(2) + 'h to ' + (T.to * 24).toFixed(2) + 'h' : 'none') + ')'); }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning' && /stores113|rift100/.test(m.text())) errors.push(m.text().slice(0, 200)); });
  await page.goto(URL0 + '/?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Stores Tester'); await page.locator('#c-next').click(); await page.locator('.classlist button').first().click(); await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const choice = page.locator('#create-panel .list button').first(); if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click(); }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click(); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    const S = STORES113, R = RIFT100, TX = S.TX, out = {};
    window.requestAnimationFrame = () => 0;
    const msgs = []; { const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); }; }
    const said = (t) => msgs.includes(t), clear = () => { msgs.length = 0; };
    const go = (id, x, y, dir) => { closeModal(); hide('#event'); loadMap(id, { x, y, dir: dir || 0 }); G.state = 'play'; G.dead = false; G.player.hp = G.player.hpMax; G.fadeT = 0; G.player.feet = G.map.groundAt(x, y); G.murmurT = 0; clear(); };
    const reset = (glassed) => { for (const k of ['p113_qm', 'p113_carry', 'p113_seen', 'p113_bits']) G.flags[k] = 0; G.player.glassed = !!glassed; S.resetNight(); };
    // ---- Math.random is counted while the place is built and while the night plays
    let rnd = 0; const _r = Math.random; Math.random = function () { rnd++; return _r.apply(Math, arguments); };   // (RIFT100's own wall is built first, outside the count)
    const maps = {}; maps[R.MAP] = R.build(); rnd = 0; S.join(maps); const builtRnd = rnd;
    Math.random = _r;
    out.builtNoRandom = builtRnd === 0 && !!maps[S.MAP] && maps[S.MAP] !== G.maps[S.MAP];
    // ---- the map and the door
    const wall = G.maps[R.MAP], st = G.maps[S.MAP];
    out.map = !!st && !!st.ceil && st.w === S.W && st.h === S.H && st.name === TX.door && TX.door === 'The old garrison\'s store';
    // narrow and crowded: about seven cells by sixteen inside, an aisle no more than three wide, racks on both sides and across the end
    { let wide = 0, racks = 0; for (let x = 1; x < st.w - 1; x++) { let n = 0; for (let y = 1; y < st.h - 1; y++) if (!st.isBlocked(x, y)) n++; if (n > 3) wide++; }
      for (const c of st.cells) if (c && /^t_p113_r/.test(c.tex || '')) racks++;
      const endRack = [3, 4, 5].every((y) => /^t_p113_r/.test((st.cells[y * st.w + st.w - 2] || {}).tex || ''));
      out.narrow = st.w - 2 === 16 && st.h - 2 === 7 && wide === 0 && racks >= 30 && endRack; }
    const dc = wall.cells[S.DOOR[1] * wall.w + S.DOOR[0]];
    out.door = !!dc && !!dc.door && !dc.locked && !!dc.portal && dc.portal.map === S.MAP && dc.label === TX.door;
    out.doorNear = Math.hypot(S.DOOR[0] + 0.5 - R.P.qm[0], S.DOOR[1] + 0.5 - R.P.qm[1]) < 6 && R.P.nine[0] <= S.DOOR[0] + 1 && S.DOOR[0] - 1 <= R.P.nine[2] && R.P.nine[1] <= S.DOOR[1] && S.DOOR[1] <= R.P.nine[3];
    // ---- the postern stays barred, with Phase 100's own line
    { const pc = wall.cells[R.P.postern[1] * wall.w + R.P.postern[0]]; out.postern = !!pc && pc.door && pc.locked === '__never' && pc.lockMsg === R.TX.posternMsg && /Not yours\. Not tonight\.$/.test(pc.lockMsg) && !pc.portal; }
    // ---- in, and out again
    go(R.MAP, S.DOOR[0] - 0.7, S.DOOR[1] + 0.5, 0); transfer(dc.portal);
    out.inside = G.mapId === S.MAP && !G.map.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0);
    { const bfs = (mp, sx, sy) => { const Wm = mp.w, Hm = mp.h, dist = new Int32Array(Wm * Hm).fill(-1), q = [(sy | 0) * Wm + (sx | 0)]; dist[q[0]] = 0;
        for (let hh = 0; hh < q.length; hh++) { const i = q[hh], x = i % Wm, y = (i / Wm) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy; if (nx < 0 || ny < 0 || nx >= Wm || ny >= Hm) continue; const n = ny * Wm + nx; if (dist[n] >= 0 || mp.isBlocked(nx, ny)) continue; dist[n] = dist[i] + 1; q.push(n); } }
        return (x, y) => { let best = -1; for (const [dx, dy] of [[0, 0], [1, 0], [-1, 0], [0, 1], [0, -1]]) { const v = dist[((y + dy) | 0) * Wm + ((x + dx) | 0)]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; }; };
      const d = bfs(G.map, Engine.cam.x, Engine.cam.y);
      const things = G.ents.filter((e) => e && e._p113look);
      out.things = things.length === 9 && S.THINGS.every((k) => things.some((e) => e._p113look === k)) && things.every((e) => d(e.x, e.y) >= 0);
      clear(); for (const e of things) useDeco(e);
      out.looks = S.THINGS.every((k) => said(TX.look[k])) && things.every((e) => e.label === TX.name[e._p113look]);
      out.strings = G.ents.filter((e) => e && e._p113 === 'strings').length >= 6;
      out.lamps = G.ents.filter((e) => e && e._p113 === 'lamp' && e.lightCol && e.glow > 0 && e.glow < 0.8).length === 2;
      const exit = G.map.cells.find((c) => c && c.door && c.portal && c.portal.map === R.MAP);
      out.exit = !!exit && exit.label === TX.door && exit.portal.x != null; if (exit) transfer(exit.portal);
      out.left = G.mapId === R.MAP && Math.hypot(Engine.cam.x - S.DOOR[0] - 0.5, Engine.cam.y - S.DOOR[1] - 0.5) < 2 && !G.map.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0); }

    // ================= the errands
    const qmEnt = () => G.ents.find((e) => e && e.kind === 'npc' && e.id === 'p100_qm');
    const log = () => DLG.log.map((l) => l.t);
    const work = () => { const before = DLG.log.length; askTopic(TX.work); renderDialogue('tell'); return DLG.log.slice(before).filter((l) => l.who === 'them').map((l) => l.t); };
    const talkTo = (e) => { talk(e); return log(); };
    const hasLine = (lines, t) => lines.includes(t);
    reset(false); G.flags.p100_rail = 0;
    go(R.MAP, R.P.qm[0] - 1.2, R.P.qm[1], 0);
    talk(qmEnt());
    renderDialogue('tell'); out.workButton = Array.from(document.querySelectorAll('#d-topics button')).some((b) => (b.getAttribute('data-topic') || b.textContent) === TX.work);
    // the cart, before any errand
    const cart = () => G.ents.find((e) => e && e._p113 === 'cart');
    { closeModal(); G.state = 'play'; const c = cart(); out.cartThere = !!c && c.label === TX.cart && Math.hypot(c.x - R.P.gate[0], c.y - R.P.gate[1]) < 20;
      clear(); useDeco(c); out.cartLook = said(TX.cartLook) && G.flags.p113_carry === 0; }
    // errand one, asked (0 to 1); the trolley is still chocked, so he says so
    talk(qmEnt()); let L = work();
    out.ask1 = hasLine(L, TX.ask1) && hasLine(L, TX.trolley) && G.flags.p113_qm === 1 && !hasLine(L, TX.glass);
    L = work(); out.ask1again = hasLine(L, TX.ask1) && G.flags.p113_qm === 1;
    G.flags.p100_rail = 1; L = work(); out.noTrolley = hasLine(L, TX.ask1) && !hasLine(L, TX.trolley);
    // the cart, during errand one
    closeModal(); G.state = 'play'; clear(); useDeco(cart()); out.cartTake = said(TX.cartTake) && G.flags.p113_carry === 1;
    clear(); useDeco(cart()); out.cartOnce = !said(TX.cartTake) && G.flags.p113_carry === 1;
    // errand one brought (1 to 2), errand two asked at once (2 to 3)
    talk(qmEnt()); L = work(); out.brought1 = hasLine(L, TX.brought1) && hasLine(L, TX.ask2) && L.indexOf(TX.brought1) < L.indexOf(TX.ask2) && G.flags.p113_qm === 3 && G.flags.p113_carry === 0;
    // One-Oh-Six at the hatch
    closeModal(); go(R.HALLS, R.Q.issue[0], R.Q.issue[1] + 1.2, -Math.PI / 2);
    const inHalls = (id) => G.ents.find((e) => e && e.kind === 'npc' && e.id === id);
    out.oil = hasLine(talkTo(inHalls('p100_issue')), TX.oil106) && G.flags.p113_carry === 2;
    closeModal(); G.state = 'play'; out.oilOnce = !hasLine(talkTo(inHalls('p100_issue')), TX.oil106) && G.flags.p113_carry === 2;
    // a trooper in the Halls does not give a blanket before it is asked for
    closeModal(); G.state = 'play'; out.noEarlyBlanket = !hasLine(talkTo(inHalls('p100_tr_a')), TX.blanket) && G.flags.p113_carry === 2;
    // errand two brought (3 to 4), errand three asked (4 to 5)
    closeModal(); go(R.MAP, R.P.qm[0] - 1.2, R.P.qm[1], 0); talk(qmEnt()); L = work();
    out.brought2 = hasLine(L, TX.brought2) && G.flags.p113_qm === 5 && G.flags.p113_carry === 0;
    // a trooper in the Halls (or the squad's barrack) gives one
    closeModal(); go(R.HALLS, 14.5, 12.4, Math.PI / 2);
    out.blanket = hasLine(talkTo(inHalls('p100_tr_a')), TX.blanket) && G.flags.p113_carry === 3;
    // errand three brought (5 to 6)
    closeModal(); go(R.MAP, R.P.qm[0] - 1.2, R.P.qm[1], 0); talk(qmEnt()); L = work();
    out.brought3 = hasLine(L, TX.brought3) && G.flags.p113_qm === 6 && G.flags.p113_carry === 0 && !hasLine(L, TX.ask4);
    // no glass arm: the next Work asks the letter (6 to 7), read aloud in his hearing (7 to 8)
    L = work(); out.ask4 = hasLine(L, TX.ask4) && G.flags.p113_qm === 7 && !!DLG.choices && DLG.choices.length === 1 && DLG.choices[0].t === TX.letter;
    out.letterShown = !!Array.from(document.querySelectorAll('#d-topics button')).find((b) => b.textContent === TX.letter.replace(/<[^>]+>/g, ''));
    { const b = document.querySelector('#d-topics [data-choice="0"]'); if (b) b.click(); }
    L = log(); out.letter = hasLine(L, TX.letter) && hasLine(L, TX.after1) && hasLine(L, TX.after2) && L.indexOf(TX.after1) < L.indexOf(TX.after2) && G.flags.p113_qm === 8;
    L = work(); out.afterLetter = hasLine(L, TX.done) && !hasLine(L, TX.end) && G.flags.p113_qm === 8 && TX.done === '"That is the work done. The third hour, if you are awake. Between Five and Six."';
    // flags survive a save and a load
    { G.flags.p113_seen = 0; G.flags.p113_bits = 1; const snap = JSON.parse(JSON.stringify(snapshotGame())); closeModal(); restoreGame(snap); out.saved = G.flags.p113_qm === 8 && G.flags.p113_carry === 0 && G.flags.p113_bits === 1 && !!G.maps[S.MAP]; }

    // ================= the glass arm: told something else, never the letter, never the hour
    reset(true); go(R.MAP, R.P.qm[0] - 1.2, R.P.qm[1], 0); talk(qmEnt());
    const all = [];
    L = work(); all.push(...L); out.glass = L[0] === TX.glass && hasLine(L, TX.ask1) && G.flags.p113_qm === 1;
    L = work(); all.push(...L); out.glassOnce = !hasLine(L, TX.glass);
    G.flags.p113_carry = 1; all.push(...work()); out.g2 = G.flags.p113_qm === 3; G.flags.p113_carry = 2; all.push(...work()); out.g3 = G.flags.p113_qm === 5; G.flags.p113_carry = 3;
    L = work(); all.push(...L); out.gFold = hasLine(L, TX.brought3) && G.flags.p113_qm === 6;
    for (let i = 0; i < 3; i++) { L = work(); all.push(...L); }
    out.glassEnd = hasLine(L, TX.end) && G.flags.p113_qm === 6 && !DLG.choices;
    out.glassNever = !all.includes(TX.ask4) && !all.includes(TX.letter) && !all.includes(TX.after2) && !all.some((t) => /third hour|Between Five and Six/.test(t));
    closeModal(); G.state = 'play';

    // ================= the night on the wall
    const T = S.THIRD_HOUR, mid = (T.from + T.to) / 2;
    const at = (deg, rr) => R.pol(R.RC - (rr || 3), deg);
    const five6 = at(4.2), seven8 = at(22.5), qmFoot = [R.P.qm[0] - 1.2, R.P.qm[1]];
    const stepNight = (s) => { for (let t = 0; t < s; t += 0.1) { S.tick(0.1); R.tick(0.1); G.murmurT = 1; } };
    reset(false); G.flags.p113_qm = 8;
    out.stretch = S.onStretch(...five6) && !S.onStretch(...seven8) && !S.onStretch(...at(4.2, 12)) && S.inHour(mid) && !S.inHour(T.from - 0.01) && !S.inHour(T.to + 0.01) && !S.inHour(0.5);
    // the wrong hour on the right stretch: nothing
    go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = T.from - 0.02; stepNight(3); out.wrongHour = !said(TX.night[0]) && G.flags.p113_seen === 0 && !G.ents.some((e) => e && e._p113 === 'far' && !e.hidden);
    // the right hour on the wrong stretch: nothing
    go(R.MAP, seven8[0], seven8[1], -Math.PI / 2); G.tod = mid; stepNight(3); out.wrongPlace = !said(TX.night[0]) && G.flags.p113_seen === 0;
    go(R.MAP, ...qmFoot, 0); G.tod = mid; stepNight(3); out.notAtFoot = !said(TX.night[0]) && G.flags.p113_seen === 0;
    // the right stretch, the right hour: the eight lines in order, and the lights
    go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = mid;
    let nr = 0; Math.random = function () { nr++; return _r.apply(Math, arguments); };
    const seenLights = { lantern: 0, gold: 0, answer: 0, goldDown: 0, goldSmaller: 0 };
    let gold0 = null;
    // the far lights, as drawn from the stretch: bearing (radians) and elevation (slope from the eye) of each, over time
    const far = { n: 0, L: [], G: [], A: [] };
    for (let t = 0; t < S.NIGHT_S + 5; t += 0.1) {
      S.tick(0.1); G.tod = mid;
      const L0 = S.lights();
      if (L0.lantern) seenLights.lantern++;
      if (L0.gold) { seenLights.gold++; if (!gold0) gold0 = L0.gold; else { if (L0.gold.z < gold0.z - 20) seenLights.goldDown = 1; if (L0.gold.size < gold0.size) seenLights.goldSmaller = 1; } }
      if (L0.answer) seenLights.answer++;
      const vis = G.ents.filter((e) => e && e._p113 === 'far' && !e.hidden); far.n = Math.max(far.n, vis.length);
      const F = S.farLights(), tt = S.night().t;
      if (F.lantern && !F.lantern.hidden) far.L.push([tt, F.lantern.a, F.lantern.el]); if (F.gold && !F.gold.hidden) far.G.push([tt, F.gold.a, F.gold.el, F.gold.size]); if (F.answer && !F.answer.hidden) far.A.push([tt, F.answer.a, F.answer.el]);
    }
    { const at = (arr, t) => arr.find((v) => v[0] >= t), dA = (a, b) => Math.abs(Math.atan2(Math.sin(a - b), Math.cos(a - b)));
      const l0 = at(far.L, 2), l1 = at(far.L, 16), g0 = at(far.G, 21.2), g1 = at(far.G, 29.5), g2 = at(far.G, 32.5), g3 = at(far.G, 46), a0 = at(far.A, 39);
      out.farDrawn = far.n === 3 && far.L.length > 100 && far.G.length > 100 && far.A.length > 50;
      out.farMoves = !!(l0 && l1 && g0 && g1 && g2 && g3 && a0) && dA(l0[1], l1[1]) > 0.005 && g1[2] < g0[2] - 0.02 && g1[3] < g0[3] && Math.abs(g2[2] - g1[2]) < 1e-3 && dA(g2[1], g1[1]) < 1e-3 && dA(g3[1], g2[1]) > 0.004 && a0[3 - 1] <= g3[2] + 0.02 && dA(a0[1], g3[1]) < 0.03;
      out.farAboveParapet = far.G.every((v) => v[2] > S.farFrame().line); }
    Math.random = _r;
    out.nightNoRandom = nr === 0;
    const idx = TX.night.map((t) => msgs.indexOf(t));
    out.line1 = TX.night[0] === 'Far along the wall, at the foot of Tower Nine, a lantern comes out of the wall, by a door you were not let through.';
    out.night = out.line1 && idx.every((i) => i >= 0) && idx.every((v, i) => !i || v > idx[i - 1]) && G.flags.p113_seen === 1;
    out.lights = seenLights.lantern > 20 && seenLights.gold > 20 && seenLights.answer > 10 && seenLights.goldDown && seenLights.goldSmaller;
    out.lightEnts = G.ents.filter((e) => e && (e._p113 === 'light' || e._p113 === 'far')).length === 0;   // all gone once it is over
    // the lights are where they are: from the stretch Towers Six and Seven and the lip stand between you and Tower Nine's
    // buttress, so nothing is drawn there; from the wall-walk past Tower Nine the lantern out on the buttress is in sight
    { G.flags.p113_seen = 0; go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = mid; for (let t = 0; t < 12; t += 0.1) { S.tick(0.1); G.tod = mid; }
      const lit = (k) => G.ents.find((e) => e && e._p113 === 'light' && e.sprite === 'p113_light' + k);
      out.hiddenFromStretch = !!lit('L') && lit('L').hidden;
      const v = R.pol(R.RC - 2.2, 39.0); Engine.cam.x = v[0]; Engine.cam.y = v[1]; G.player.feet = G.map.groundAt(v[0], v[1]); Engine.cam.z = G.player.feet + 0.88; for (let t = 0; t < 4; t += 0.1) { S.tick(0.1); G.tod = mid; }
      const e = lit('L'); out.seenPastNine = !!e && !e.hidden && Math.hypot(e.x - v[0], e.y - v[1]) <= G.map.fogDist && e.scale > 0;
      S.resetNight(); G.flags.p113_seen = 1; }
    // ---- the wall's own light by the hour (RIFT100): grey from above by day, exactly as Phase 100 had it; dark by night
    { const A = R.wallAmbient, ok = typeof A === 'function';
      let maxStep = 0; if (ok) for (let i = 1; i <= 1440; i++) maxStep = Math.max(maxStep, Math.abs(A(i / 1440) - A((i - 1) / 1440)));
      out.lightCurve = ok && A(0.5) === 0.95 && A(7.01 / 24) === 0.95 && A(16.99 / 24) === 0.95 && A(mid) >= 0.16 && A(mid) <= 0.2 && A(0.7985) <= 0.2 && A(4.9 / 24) <= 0.2 && A(18 / 24) > 0.2 && A(18 / 24) < 0.95 && A(6 / 24) > 0.2 && A(6 / 24) < 0.95 && maxStep < 0.01;
      const view = () => { const c = Engine.canvas, sx = c.width / 320, d = c.getContext('2d').getImageData(0, 0, c.width, Math.round(150 * sx)).data; return { d, w: c.width, sx }; };
      const lumAt = (v, x, y) => { const i = ((y | 0) * v.w + (x | 0)) * 4; return 0.3 * v.d[i] + 0.59 * v.d[i + 1] + 0.11 * v.d[i + 2]; };
      const patch = (v) => { let s = 0, n = 0; for (let y = 86; y < 94; y++) for (let x = 150; x < 170; x++) { s += lumAt(v, x * v.sx, y * v.sx); n++; } return s / n; };
      // noon: the same frame before and after the wall's light is ticked
      G.flags.p113_seen = 1; const along = at(2.0); go(R.MAP, along[0], along[1], -Math.PI / 2); G.tod = 0.5; R.tick(0.1);
      Engine.cam.dir = -Math.PI / 2 - 0.06; Engine.cam.pitch = 0; Engine.render(G.ents, 0.5); const v0 = view(), f0 = Array.from(v0.d.slice(0, 40000));
      R.tick(0.1); R.tick(0.1); Engine.render(G.ents, 0.5); const v1 = view();
      out.noonSame = G.map.ambient === 0.95 && G.map.bright === true && f0.every((b, i) => b === v1.d[i]);
      const noon = patch(v1);
      // the third hour: dark, away from any lamp
      G.tod = mid; R.tick(0.1); Engine.render(G.ents, mid); const night = patch(view());
      out.nightDark = G.map.ambient >= 0.16 && G.map.ambient <= 0.2 && night < noon * 0.5;
      out.lightNums = [noon.toFixed(1), night.toFixed(1), G.map.ambient];
      // the far lights are the brightest things in the frame
      G.flags.p113_seen = 0; go(R.MAP, five6[0], five6[1], 0); G.tod = mid;
      for (let t = 0; t < 26; t += 0.1) { S.tick(0.1); R.tick(0.1); G.murmurT = 2; G.tod = mid; }
      Engine.cam.dir = S.farLights().gold.a; Engine.cam.pitch = 0; S.tick(0.01); Engine.render(G.ents, mid);
      const v = view(), g = G.ents.find((e) => e && e._p113 === 'far' && e.sprite === 'p113_lightG' && !e.hidden);
      let gl = 0, mx = 0; for (let y = 0; y < 150 * v.sx; y++) for (let x = 0; x < v.w; x++) mx = Math.max(mx, lumAt(v, x, y));
      if (g && g._screen) for (let y = Math.max(0, g._screen.y0 * v.sx); y <= g._screen.y1 * v.sx; y++) for (let x = Math.max(0, g._screen.x0 * v.sx); x <= g._screen.x1 * v.sx; x++) gl = Math.max(gl, lumAt(v, x, y));
      out.farBrightest = !!g && gl > 0 && gl >= mx * 0.98 && gl > 200;
      S.resetNight(); G.flags.p113_seen = 1; }
    // once
    clear(); go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = mid; stepNight(10); out.once = !said(TX.night[0]) && G.flags.p113_seen === 1;
    // the Watch's rule still holds while it plays: say nothing and the quiet comes on
    reset(false); go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = mid; G.murmurT = 0;
    for (let t = 0; t < R.B.WARN_S + 0.6; t += 0.1) { S.tick(0.1); R.tick(0.1); G.tod = mid; }
    out.stillTalk = said(TX.night[0]) && said(R.TX.quietWarn);
    // the night is seen by anyone standing there: a glassed traveller too, who was never told
    reset(true); go(R.MAP, five6[0], five6[1], -Math.PI / 2); G.tod = mid; stepNight(2); out.glassSees = said(TX.night[0]) && G.flags.p113_seen === 1;
    // afterwards, Work gives once: the glassed get three words
    go(R.MAP, ...qmFoot, 0); talk(qmEnt()); L = work(); out.afterGlass = L[0] === TX.afterNightGlass || L.includes(TX.afterNightGlass);
    L = work(); out.afterGlassOnce = !L.includes(TX.afterNightGlass);
    closeModal(); G.state = 'play';
    reset(false); G.flags.p113_qm = 8; G.flags.p113_seen = 1; talk(qmEnt()); L = work(); out.afterNight = L.includes(TX.afterNight) && !L.includes(TX.afterNightGlass);
    L = work(); out.afterNightOnce = !L.includes(TX.afterNight);
    closeModal(); G.state = 'play';

    // ---- hostile flags do no harm
    try { for (const k of ['p113_qm', 'p113_carry', 'p113_seen', 'p113_bits']) G.flags[k] = k.length % 2 ? '<img src=x onerror=1>' : 1e12;
      go(R.MAP, five6[0], five6[1], 0); G.tod = mid; stepNight(1); talk(qmEnt()); work(); closeModal(); G.state = 'play'; useDeco(cart()); go(S.MAP, S.SPAWN[0], S.SPAWN[1], 0); S.tick(0.5); out.hostile = true; } catch (e) { out.hostile = String(e); }
    for (const k of ['p113_qm', 'p113_carry', 'p113_seen', 'p113_bits']) G.flags[k] = 0;
    // ---- away from the Watch nothing of this runs
    go('oakhaven', G.maps.oakhaven.spawn.x, G.maps.oakhaven.spawn.y, 0); G.tod = mid; S.tick(2); out.elsewhere = !said(TX.night[0]) && G.flags.p113_seen === 0;
    return out;
  });
  check(r.builtNoRandom, 'the stores, the door and the cart are built without Math.random');
  check(r.map && r.door && r.doorNear, 'a door in the obsidian at Tower Nine\'s foot, by the Quartermaster: "The old garrison\'s store", an indoor map with its own ceiling');
  check(r.narrow, 'the store is narrow and crowded: sixteen by seven, an aisle no wider than three, racks both sides and across the end');
  check(r.postern, 'the postern at Tower Nine\'s foot is still barred, with Phase 100\'s line ("... Not yours. Not tonight.")');
  check(r.inside && r.exit && r.left, 'the stores can be entered from the wall, and left again by the same door');
  check(r.things && r.looks, 'nine things to look at, each reached on foot, each with its name and its line');
  check(r.strings && r.lamps, 'knotted strings everywhere; two dim lamps');
  check(r.workButton, 'the Quartermaster has a subject of his own: Work');
  check(r.cartThere && r.cartLook, 'the cart at the west gate, looked at before the errand');
  check(r.ask1 && r.ask1again && r.noTrolley, 'errand one asked (0 to 1); the chocked trolley is mentioned only while it is chocked');
  check(r.cartTake && r.cartOnce, 'the crate chalked Q is taken from the cart, once');
  check(r.brought1, 'errand one brought (1 to 2) and errand two asked at once (2 to 3)');
  check(r.oil && r.oilOnce, 'One-Oh-Six counts out the oil');
  check(r.noEarlyBlanket && r.brought2 && r.blanket, 'errand two brought (3 to 5); a trooper in the Halls gives a blanket, and only when it is asked for');
  check(r.brought3, 'errand three brought (5 to 6)');
  check(r.ask4 && r.letterShown && r.letter, 'no glass arm: the letter is asked (6 to 7) and read aloud in his hearing (7 to 8), and he tells you the hour');
  check(r.afterLetter, 'after the letter, Work gives its own last line');
  check(r.saved, 'the p113_ flags survive a save and a load');
  check(r.glass && r.glassOnce && r.g2 && r.g3 && r.gFold, 'the glass arm: he hears it ring first, once; the three errands go the same');
  check(r.glassEnd && r.glassNever, 'the glass arm: Work ends after the blanket; never the letter, never the hour');
  check(r.stretch, 'the stretch between Towers Five and Six, and the third hour of the night, are what they say');
  check(r.wrongHour && r.wrongPlace && r.notAtFoot, 'the night does not fire at the wrong hour, on the wrong stretch, or at Tower Nine\'s foot');
  check(r.night, 'the night fires on that stretch in that hour: eight lines, in order');
  check(r.farDrawn && r.farMoves && r.farAboveParapet, 'from the stretch the night is drawn as far lights: the lantern moves a short way; the gold point sinks toward the parapet line, smaller, stops, slides sideways; the second light beside it');
  check(r.lights && r.lightEnts, 'a lantern, a gold point going down and getting smaller, and a second light near it; then gone');
  check(r.hiddenFromStretch && r.seenPastNine, 'the lights are drawn where they truly are: hidden from the stretch by the towers and the parapet, the lantern in sight from the walk past Tower Nine');
  check(r.lightCurve, 'the wall\'s light by the hour: 0.95 from seven to five, falling smoothly through dusk to dark at full dark, dark to the dead hour, rising at dawn');
  check(r.noonSame, 'at noon the wall is lit exactly as Phase 100 lit it, and the frame is unchanged');
  check(r.nightDark, 'at the third hour the wall is dark: open floor away from any lamp is much darker than at noon (' + (r.lightNums || []).join(', ') + ')');
  check(r.farBrightest, 'at night the far lights are the brightest things in the frame');
  check(r.once, 'and it fires once');
  check(r.nightNoRandom, 'the night plays without Math.random');
  check(r.stillTalk, 'the Watch\'s rule still holds while it plays: say nothing and the quiet comes on');
  check(r.glassSees, 'a glassed traveller, never told, may still see it');
  check(r.afterGlass && r.afterGlassOnce && r.afterNight && r.afterNightOnce, 'afterwards Work gives its line once (the glassed: "Keep talking, traveller.")');
  check(r.hostile === true, 'hostile flags do no harm' + (r.hostile === true ? '' : ': ' + r.hostile));
  check(r.elsewhere, 'away from the Watch none of it runs');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  if (fails) console.log(JSON.stringify(r));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
