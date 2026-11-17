// Phase 96: the Chalk Cliffs (js/cliffs96.js). Run: PREVIEW_URL=http://127.0.0.1:4182 node test/cliffs96.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4182';
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
    const out = {}, C = CLIFFS96, S = SOULS91, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const m = G.maps[C.MAP], W = C.W;
    out.map = !!m && m.w === 36 && m.h === 150 && m.entities.length === m.baseCount && m.outdoor && Math.abs(C.lvlAt(146) - C.lvlAt(3)) > 15;
    // the postern, both ways: into the Vigil when the Vigil is built, barred when it is not
    const vm = G.maps[C.VIGIL], d0 = m.get(C.P.door[0], C.P.door[1]);
    if (vm) {
      let back = null; for (let k = 0; k < vm.w * vm.h && !back; k++) { const c = vm.cells[k]; if (c && c.door && c.portal && c.portal.map === C.MAP) back = c; }
      out.door = !!d0 && d0.door && d0.portal && d0.portal.map === C.VIGIL && !!vm.smooth === !!vm.smooth && (!back || m.smooth[(back.portal.y | 0) * W + (back.portal.x | 0)] === 1);
      out.doorNote = 'vigil built; its postern ' + (back ? 'leads here' : 'not set yet');
    } else { out.door = !!d0 && d0.door && d0.locked === '__never'; out.doorNote = 'vigil not built: barred'; }
    const withV = C.build(); const fake = { [C.VIGIL]: {} }; C.join(fake); const bare = {}; C.join(bare);
    const pd = withV.get(C.P.door[0], C.P.door[1]), fd = fake[C.MAP].get(C.P.door[0], C.P.door[1]), bd = bare[C.MAP].get(C.P.door[0], C.P.door[1]);
    out.doorBoth = pd.portal && pd.portal.map === C.VIGIL && Math.abs(pd.portal.x - 34.5) < 0.01 && fd.portal && !fd.locked && bd.locked === '__never' && !!bd.lockMsg;
    // every place can be walked to from the way in
    const dist = new Int32Array(W * m.h).fill(-1), q = [(C.P.arrive[1] | 0) * W + (C.P.arrive[0] | 0)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || dist[k] >= 0 || !m.smooth[k] || m.get(nx, ny) || m.isBlocked(nx, ny)) continue; dist[k] = dist[i] + 1; q.push(k); } }
    const near = (x, y) => { let best = -1; for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const k = ((y | 0) + dy) * W + (x | 0) + dx; const v = dist[k]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    const mid = (r) => [(r[0] + r[2]) / 2 + 0.5, (r[1] + r[3]) / 2 + 0.5];
    const L = C.lamps();
    out.reach = { yard: near(...mid(C.P.yard)), lamp: L.length ? near(L[0].x, L[0].y) : -1, ledge1: near(...mid(C.P.ledge1)), ledge2: near(...mid(C.P.ledge2)), ledge3: near(...mid(C.P.ledge3)), foot: near(...mid(C.P.foot)), cairn: near(C.P.cairn[0], C.P.cairn[1]), rest: near(...C.P.reststone), overhang: near(...C.P.overhang), ring: near(...C.P.ring) };
    out.reachOk = L.length === 1 && Object.values(out.reach).every((v) => v >= 0);
    // the climb: the path from the foot to the postern, in cells and in walking time
    const fd2 = new Int32Array(W * m.h).fill(-1), q2 = [143 * W + 18]; fd2[q2[0]] = 0;
    for (let h = 0; h < q2.length; h++) { const i = q2[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || fd2[k] >= 0 || !m.smooth[k] || m.get(nx, ny) || m.isBlocked(nx, ny)) continue; fd2[k] = fd2[i] + 1; q2.push(k); } }
    out.cells = fd2[2 * W + 18];
    // the walk: the centre line from the cairn to the postern, corner to corner
    const pts = [[18.5, 143.5]]; for (let s = C.WAY.length - 1; s >= 0; s--) for (let n = C.WAY[s].length - 1; n >= 0; n--) pts.push([C.WAY[s][n][0] + 1, C.WAY[s][n][1] + 1]); pts.push([18.5, 2.5]);
    let len = 0; for (let n = 1; n < pts.length; n++) len += Math.hypot(pts[n][0] - pts[n - 1][0], pts[n][1] - pts[n - 1][1]);
    const spd = 2.6 + p.attrs.Speed / 60; out.walk = { units: Math.round(len), speed: +spd.toFixed(2), seconds: +(len / spd).toFixed(1) };
    out.climb = out.cells >= 150 && out.cells <= 200 && len >= 165 && len <= 195;
    // the bell: the contract (VIGIL96.bell when it is built; this module's safe copy otherwise)
    const TODS = [0.2, 0.5, 0.749, 0.75, 0.7528, 0.78, 0.79, 0.99, 0.25, 0.7833];
    const B = (t) => C.localBell(t);
    out.bellPhases = B(0.2).phase === 'dark' && B(0.5).phase === 'day' && B(0.749).phase === 'day' && B(0.75).phase === 'ringing' && B(0.75).stroke === 1 && B(0.7528).stroke === 2
      && B(0.78).phase === 'ringing' && B(0.78).stroke === 11 && B(0.7825).stroke === 12 && B(0.79).phase === 'dark' && B(0.79).stroke === 12 && B(0.99).phase === 'dark' && B(0.5).stroke === 0 && B(0.5).left === 12 && B(0.79).toDark === 0 && B(0.76).toDark > 0;
    const vb = typeof VIGIL96 !== 'undefined' && typeof VIGIL96.bell === 'function';
    out.vigilBell = vb ? 'compared with VIGIL96.bell' : 'VIGIL96.bell not built yet: bell() falls back to localBell';
    out.bellSame = TODS.every((t) => { const a = C.localBell(t), b = vb ? VIGIL96.bell(t) : C.bell(t); return a.phase === b.phase && a.stroke === b.stroke && a.left === b.left && Math.abs(a.toDark - b.toDark) < 1e-9; });
    // with no VIGIL96 at all the module still builds and still keeps the bell
    { const keep = window.VIGIL96; let ok = false; try { delete window.VIGIL96; const mm = C.build(); ok = !!mm && mm.w === 36 && C.bell(0.76).phase === 'ringing'; } catch (e) { ok = false; } finally { window.VIGIL96 = keep; } out.noVigil = ok; }

    loadMap(C.MAP); play(); function play() { closeModal(); hide('#event'); G.state = 'play'; }
    const put = (x, y) => { Engine.cam.x = x; Engine.cam.y = y; p.feet = m.groundAt(x, y); p.fallFrom = null; p.fallV = 0; G.keys = {}; };
    const live = () => C.remnants();
    // by day: no remnants
    C.setTod(0.5); C.reenter(); put(18.5, 81.5); update(0.016); out.day = live().length === 0 && C.all().length === 8;
    // the lamp lights by the postern (the Souls rules, group l)
    put(L[0].x + 1.0, L[0].y + 0.4); update(0.016); out.lamp = S.isLit(L[0]) && G.flags.p91_ll === L[0].id + 1;
    // the first stroke: eight at the foot, held below
    put(18.5, 81.5); C.setTod(0.7495); update(0.016); msgs.length = 0; C.setTod(0.7501); update(0.016);
    out.first = live().length === 8 && live().every((e) => e.y >= 146) && said(/The dusk bell\. 1 of twelve/);
    // they stir between strokes, and each stroke they let go
    for (let i = 0; i < 20; i++) update(0.2); const stirred = live().every((e) => e.y < 146.4);
    C.setTod(0.75 + C.BELL.gap * 1.02); update(0.016);
    out.letGo = stirred && live().every((e) => Math.abs(e.y - C.FOOT_Y) < 0.05) && said(/let go of the rock/) && said(/2 of twelve/);
    // the last stroke: dark, and you are on the face
    const dark0 = G.flags.p96b_dark | 0; C.setTod(0.7832); update(0.016); C.setTod(0.7835); update(0.016);
    out.dark = said(/The last stroke\. Dark\./) && (G.flags.p96b_dark | 0) === dark0 + 1;
    // dark: they come up the path toward you
    const mean = () => live().reduce((s, e) => s + Math.hypot(e.x - Engine.cam.x, e.y - Engine.cam.y), 0) / Math.max(1, live().length);
    const d0m = mean(); for (let i = 0; i < 40; i++) { put(18.5, 81.5); p.hp = p.hpMax; update(0.1); } const d1m = mean();
    out.hunt = d1m < d0m - 3 && live().every((e) => C.walkable(e.x | 0, e.y | 0));
    out.huntNums = [+d0m.toFixed(1), +d1m.toFixed(1)];
    // come back later in the dark: they are where the hour puts them (never chance), and never in the yard
    C.setTod(0.79); C.reenter(); put(18.5, 81.5); C.tick(0.0001); const a1 = live().map((e) => e.x.toFixed(3) + ',' + e.y.toFixed(3)).join(' ');
    C.setTod(0.79); C.reenter(); C.tick(0.0001); const a2 = live().map((e) => e.x.toFixed(3) + ',' + e.y.toFixed(3)).join(' ');
    const lead = Math.min(...live().map((e) => e.y));
    C.setTod(0.95); C.reenter(); put(18.5, 5.5); update(0.016);
    out.rebuild = a1 === a2 && lead < 146.5 - 5 && lead > 100 && live().every((e) => e.y >= C.P.lip) && Math.min(...live().map((e) => e.y)) < 14;
    // the yard is safe: they wait at the lip
    const hpY = p.hp; for (let i = 0; i < 20; i++) { put(18.5, 5.5); update(0.1); } out.yard = p.hp === hpY && live().every((e) => e.y >= C.P.lip);
    // the cold: within reach, it hurts, once a second
    put(19.5, 60.5); p.hp = p.hpMax; const one = live()[0]; one.x = 19.5; one.y = 61.1; one._cool = 0; msgs.length = 0;
    for (const e of live()) if (e !== one) { e.x = 12.5; e.y = 140.5; }
    update(0.05); const hp1 = p.hp; update(0.3); const hp2 = p.hp;
    out.cold = p.hpMax - hp1 >= 4 && p.hpMax - hp1 <= 7 && hp2 === hp1 && said(/cold where it holds you/);
    // nothing else works: a blow, a killing, a song
    p.hp = p.hpMax; Engine.cam.dir = Math.PI / 2; one.x = 19.5; one.y = 61.0; let swung = 0;
    for (let i = 0; i < 25; i++) { G.attack.t = 0; G.song.t = 0; attack(); swung++; update(0.016); }
    const hit1 = one.hp === one.hpMax && !one.dead && !one.hidden;
    one.hp -= 5000; update(0.016); const hit2 = one.hp === one.hpMax && said(/out of the rock behind\. Nothing\./);
    killEnemy(one); update(0.016); const hit3 = !one.dead && !one.hidden && one.hp === one.hpMax;
    p.voice = p.voiceMax; G.song.t = 0; G.attack.t = 0; const n0 = live().length; castSong('tending');
    out.nothing = hit1 && hit2 && hit3 && said(/It does not listen\./) && live().length === n0 && ENEMIES.p96c_remnant.xp === 0;
    // dawn: gone; the next dusk's stroke puts them back at the foot
    C.setTod(0.3); update(0.016); const gone = live().length === 0;
    C.setTod(0.7499); update(0.016); C.setTod(0.7502); update(0.016);
    out.nextDusk = gone && live().length === 8 && live().every((e) => e.y >= 146);
    // the top before dark: up from the foot while the bell still rings, once
    // not without the foot: a fresh dusk, straight into the yard, nothing
    G.flags.p96b_top = 0; G.day = (G.day | 0) + 1; C.setTod(0.7499); put(18.5, 60.5); update(0.016); C.setTod(0.76); put(18.5, 5.5); update(0.016); out.noFoot = !G.flags.p96b_top;
    G.flags.p96b_top = 0; C.setTod(0.7); put(18.5, 142.5); update(0.016); C.setTod(0.76); put(18.5, 5.5); let qx = 0; const _q = questXp; questXp = function (n) { qx += n; return _q.apply(this, arguments); }; msgs.length = 0; update(0.016);
    const qx1 = qx; update(0.016); questXp = _q;
    out.top = out.noFoot && G.flags.p96b_top === 1 && qx1 === C.consts.XP_TOP && qx === qx1 && said(/Up before the last stroke/);
    // the cairn: twenty-five and a tonic, once
    C.setTod(0.5); update(0.016);
    const cairn = G.ents.find((e) => e._p96c === 'cairn'); put(C.P.cairn[0], C.P.cairn[1] - 1.2); const g0 = p.gold, t0 = G.has('tonic') ? (p.inv.find((s) => s.id === 'tonic') || {}).n || 1 : 0; msgs.length = 0;
    C.useOwn(cairn); const g1 = p.gold, t1 = (p.inv.find((s) => s.id === 'tonic') || {}).n || 0; C.useOwn(cairn);
    out.cairn = g1 === g0 + 25 && t1 === t0 + 1 && p.gold === g1 && G.flags.p96b_foot === 1 && said(/twenty-five sovereigns/) && said(/The names\. Nothing else\./);
    // the remnant: an ENEMIES entry with all five frames, still to the engine, drawn in code
    out.def = ENEMIES.p96c_remnant && ENEMIES.p96c_remnant.hp === 99999 && ['', '_w1', '_w2', '_a1', '_a2'].every((k) => Engine.sprites['p96c_remnant' + k])
      && ['p96c_cairn', 'p96c_reststone', 'p96c_overhang', 'p96c_ring'].every((k) => Engine.sprites[k]) && ['t_p96c_chalk', 't_p96c_path', 't_p96c_ledge', 't_p96c_drop', 't_p96c_postern'].every((k) => Engine.textures[k]);
    out.flags = ['p96b_foot', 'p96b_top', 'p96b_dark', 'p96b_cseen'].every((k) => Number.isInteger(G.flags[k]) && G.flags[k] >= 0 && G.flags[k] <= 65535);
    msg = _m;
    return out;
  });
  if (process.env.DEBUG96) console.log(JSON.stringify(r));
  check(r.map && r.door, 'the Chalk Cliffs: one map down the white face; the postern at the top (' + r.doorNote + ')');
  check(r.doorBoth, 'the postern both ways: a door into the Vigil when the Vigil is built, barred when it is not');
  check(r.reachOk, 'from the postern you can walk to the yard, the lamp, each ledge and its thing, the foot and the cairn: ' + JSON.stringify(r.reach));
  check(r.climb, 'the climb from the foot to the postern: ' + r.cells + ' cells; ' + JSON.stringify(r.walk));
  check(r.bellPhases && r.bellSame && r.noVigil, 'the dusk bell: day, twelve strokes from tod 0.75, then dark; the same answer as the Vigil\'s (' + r.vigilBell + '); it works with no VIGIL96');
  check(r.day && r.lamp, 'by day there are no remnants; the postern lamp lights (the Souls rules, group l)');
  check(r.first, 'at the first stroke, eight remnants lie at the foot');
  check(r.letGo, 'while it rings they stir, and at each stroke they let go of the rock');
  check(r.dark, 'the last stroke on the face: "Dark.", and it is counted');
  check(r.hunt, 'in the dark they come up the path toward you, on the path: ' + JSON.stringify(r.huntNums));
  check(r.rebuild && r.yard, 'come back in the dark and they are where the hour puts them; they never come into the yard, and it is safe');
  check(r.cold, 'within reach it is cold: 4 to 7, once a second');
  check(r.nothing, 'a blow, a killing and a song do nothing to them; they give no xp');
  check(r.nextDusk, 'at dawn they are gone; the next dusk\'s stroke puts them back at the foot');
  check(r.top, 'up from the foot to the yard while the bell still rings: 150 xp and the line, once');
  check(r.cairn, 'the cairn gives twenty-five sovereigns and a tonic, once; then the names, nothing else');
  check(r.def && r.flags, 'the remnant has its five frames; the cairn, the stones, the overhang, the ring and the textures are drawn in code; flags are small ints');
  const texts = await page.evaluate(() => CLIFFS96.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ': ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
