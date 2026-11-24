// PREVIEW_URL=http://127.0.0.1:4224 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/mast123.test.js
// Phase 123: the mooring mast where Book One has it. "A hundred and twenty feet of riveted iron on four splayed legs,
// sunk into the bedrock of the quarry rim" (l. 3598), seen from the square "above the roofs to the north" (l. 672) and
// from the North Gate (l. 2527). The mast is on the quarry's rim (the clearing's north edge, by the headframe), not in
// Oakhaven; it is iron and four-legged; its ladder boards the Kestrel's hold from there; from the square it is seen to
// the north, in the classic view and in the 3D view; every scene that was at the mast still runs to its end there; and
// saves made on the old map (at the old mast, with the gate shut, in the greened town, aboard) still load.
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4224';

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
const read = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };

// the lines whose words said where the mast stood, as they read now, each with its French
const CHANGED = [
  'The mast-ladder sways over the quarry rim. Not now.',
  'The oaks are doubling and ringing, and the cobbles are splitting from underneath. Get to the mooring mast on the quarry rim. The corsair takes children first, four to a line.',
  'GET OUT. Up the shaft, up the headframe, to the mooring mast on the quarry rim.',
  'UP. The service ladder, the headframe, the mooring mast.',
];

async function start(r3d) {
  const browser = await chromium.launch({ headless: true, args: r3d ? ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] : ['--no-sandbox'] });
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning' && /mast123|smalllife|horizon20/.test(m.text())) errors.push('console: ' + m.text()); });
  if (r3d) await page.addInitScript(() => { window.__r3d21 = { automation: true }; });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Mast Tester'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
    window.__ev = []; window.__showEvent = window.showEvent; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
    window.__base = JSON.parse(JSON.stringify(snapshotGame()));
    window.T = {
      reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; window.__ev.length = 0; window.__msgs.length = 0; },
      last() { return window.__ev[window.__ev.length - 1] || null; },
      ladder() { return G.ents.find((x) => x && x.use === 'crates' && x.sprite === 'ladder'); },
      rim(x, y) { loadMap('clearing', { x: x == null ? MAST123.FOOT.x : x, y: y == null ? MAST123.FOOT.y + 0.8 : y, dir: -Math.PI / 2 }); G.state = 'play'; },
    };
  });
  return { browser, page, errors };
}

(async () => {
  // ---------------------------------------------------------------- the sources
  const mod = read('js/mast123.js');
  check(mod.length > 0 && !/Math\.random/.test(mod), 'js/mast123.js exists and draws nothing from Math.random');
  const scripts = [...read('index.html').matchAll(/<script src="js\/([^"?]+)/g)].map((m) => m[1]);
  check(scripts[scripts.length - 1] === 'mast123.js', 'js/mast123.js is the last script, so what it adds to the maps comes after every older entity');
  const html = read('index.html');
  for (const f of ['mast123', 'maps', 'game', 'smalllife', 'engine', 'r3d21', 'sprites21']) check(new RegExp('js/' + f + '\\.js\\?v=\\d+').test(html), 'index.html loads js/' + f + '.js with a version');
  const tsvRaw = read('tools/i18n/p123-mast.tsv');
  const tsv = new Map(tsvRaw.split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t')));
  check(CHANGED.every((t) => tsv.get(t)), 'every changed line has French in tools/i18n/p123-mast.tsv (' + CHANGED.filter((t) => !tsv.get(t)).length + ' missing)');
  const fr = (() => { try { return JSON.parse(read('locales/story/fr.json')); } catch (e) { return { s: {} }; } })();
  const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib.js'));
  check(CHANGED.every((t) => fr.s[hash(norm(t))]), 'and they are merged into locales/story/fr.json');
  for (const [f, re, what] of [['js/game.js', /east side of the square|sways over the square|through the gate, to the mooring mast/, 'game.js'], ['js/rumours.js', /mooring mast on the east side/, 'rumours.js'], ['js/rite43.js', /the headframe, the gate, the mooring mast/, 'rite43.js']]) check(read(f) && !re.test(read(f)), what + ' no longer puts the mast by the square or past the gate');
  check(/Away to the north-east/.test(read('js/horizon20.js')) || /quarry rim/.test((read('js/horizon20.js').match(/knoll: '[^\n]*/) || [''])[0]), 'Hedge Knoll\'s sign puts the mast over the quarry, not among the town\'s roofs');
  const voiced = read('js/voice-lines.js');
  check(CHANGED.every((t) => !voiced.includes(JSON.stringify(t).slice(1, -1))) && !/east side of the square/.test(voiced), 'none of the changed lines had a recording, and none of the old ones is left in the voice table');

  // ---------------------------------------------------------------- the game (classic view)
  let S = await start(false);
  let r = await S.page.evaluate(() => {
    const out = {};
    const oak = G.maps.oakhaven, cl = G.maps.clearing, M = typeof MAST123 !== 'undefined' ? MAST123 : null;
    out.mod = !!M;
    // ---- not in Oakhaven
    const notTown = (m) => !m.entities.some((e) => e.use === 'crates') && !m.triggers.some((t) => t.id === 'mast') && [[36, 19], [37, 19], [36, 20], [37, 20]].every(([x, y]) => !m.isBlocked(x, y));
    out.town = notTown(oak) && notTown(buildOakhaven(true));
    out.cells = [[36, 19], [37, 19], [36, 20], [37, 20]].every(([x, y]) => { const c = oak.get(x, y); return !c || (c.top != null && c.top < 0.5); });
    // the carters' standing keeps the two old slots (saves keep entities by their place in the list)
    const at = (m, sp, x, y) => m.entities.find((e) => e.sprite === sp && Math.abs(e.x - x) < 0.01 && Math.abs(e.y - y) < 0.01);
    out.standing = !!at(oak, 'p123_block', 35.5, 21.5) && !!at(oak, 'p123_trough', 38.5, 21.5) && oak.entities.some((e) => e.sprite === 'p123_rail' && Math.hypot(e.x - 37, e.y - 21.5) < 2.5);
    out.labels = [at(oak, 'p123_block', 35.5, 21.5), at(oak, 'p123_trough', 38.5, 21.5)].every((e) => e && e.label && !e.use);
    // ---- on the quarry rim
    const mast = cl.entities.find((e) => e.sprite === 'p123_mast');
    out.rim = !!mast && M && Math.abs(mast.x - M.AT.x) < 0.01 && Math.abs(mast.y - M.AT.y) < 0.01 && mast.y < 8 && mast.farSee === true && mast.nopick === true && mast.solid;
    // north of the square, in Oakhaven's frame, past the North Gate
    if (M) { const p = M.inFrame('oakhaven'); out.north = p && p.y < -20 && Math.abs(p.x - 23.5) < 15; out.pos = p; }
    // the tallest thing for miles: taller than the Chapel's tower (4.1) and every tree on the rim's map
    const sp = Engine.sprites.p123_mast, hOf = (e) => (e.scale || 1) * ((Engine.sprites[e.sprite] && Engine.sprites[e.sprite].hs) || 1);
    out.tall = !!mast && hOf(mast) >= 11 && hOf(mast) > 4.1 * 2 && cl.entities.filter((e) => e !== mast && e.sprite).every((e) => hOf(e) < hOf(mast) * 0.6);
    out.h = mast && +hOf(mast).toFixed(2);
    // iron on four splayed legs: four runs of iron along the bottom row, wider apart at the foot than at the head
    if (sp) {
      const W = sp.w, H = sp.h, row = (y) => { const runs = []; let inRun = false; for (let x = 0; x < W; x++) { const a = (sp.data[y * W + x] >>> 24) > 100; if (a && !inRun) runs.push([x, x]); if (a) runs[runs.length - 1][1] = x; inRun = a; } return runs; };
      const foot = row(H - 2), head = row(Math.round(H * 0.12));
      out.legs = foot.length; out.splay = foot.length === 4 && head.length >= 1 && (foot[3][1] - foot[0][0]) > 2.5 * (head[head.length - 1][1] - head[0][0] + 1);
      let n = 0, sr = 0, sg = 0, sb = 0, rust = 0, grey = 0;
      for (let i = 0; i < sp.data.length; i++) { const p = sp.data[i]; if ((p >>> 24) <= 100) continue; const R = p & 255, Gc = (p >> 8) & 255, B = (p >> 16) & 255; n++; sr += R; sg += Gc; sb += B; if (R > Gc + 22 && R > B + 30) rust++; if (Math.max(R, Gc, B) - Math.min(R, Gc, B) < 26) grey++; }
      out.iron = n > 0 && (sr + sg + sb) / (3 * n) < 105 && grey / n > 0.55 && rust / n > 0.02 && rust / n < 0.3;
      out.ironNums = n && [((sr + sg + sb) / (3 * n)).toFixed(0), (grey / n).toFixed(2), (rust / n).toFixed(3)].join('/');
      out.rivets = M && M.ART && M.ART.rivets > 60 && M.ART.legs === 4;
    }
    const lad = cl.entities.find((e) => e.use === 'crates' && e.sprite === 'ladder');
    out.ladder = !!lad && !!mast && Math.hypot(lad.x - mast.x, lad.y - mast.y) < 1.4 && /mast-ladder, up to her hold/.test(lad.label);
    const tr = cl.triggers.find((t) => t.id === 'mast');
    out.trig = !!tr && !!lad && Math.hypot(tr.x - lad.x, tr.y - lad.y) < 2 && cl.triggers[0].id === 'hound_bed';
    // where the legs go into the rock: stone underfoot
    out.apron = !!mast && !!cl.floorCells && [[-1, 0], [1, 0], [0, 0], [0, 1]].every(([dx, dy]) => cl.floorTextures[cl.floorCells[((mast.y | 0) + dy) * cl.w + (mast.x | 0) + dx]] === 't_stone');
    out.oakMast = !!Engine.sprites.p123_mast_oak;
    return out;
  });
  check(r.mod, 'MAST123 is loaded');
  check(r.town && r.cells, 'Oakhaven, before and after the Greening, has no mast: no pylon cells, no mast-ladder, no mast trigger');
  check(r.standing && r.labels, 'the east side of the square is the carters\' standing: a mounting-block and a water trough in the old slots, and a hitching rail; nothing to use');
  check(r.rim, 'the mast stands on the quarry rim (the clearing\'s north edge, by the headframe), seen at any distance, solid, not picked (its ladder is)');
  check(r.north, 'in Oakhaven\'s frame the mast is north of the square, past the North Gate (' + JSON.stringify(r.pos) + ')');
  check(r.tall, 'it is the tallest thing for miles (' + r.h + ' high: the tower is 4.1, the tallest oak on the rim\'s map about 6)');
  check(r.legs === 4 && r.splay, 'it stands on four splayed legs (' + r.legs + ' runs at the foot)');
  check(r.iron && r.rivets, 'it is riveted iron, dark, rust at the joints (' + r.ironNums + ')');
  check(r.ladder && r.trig, 'the mast-ladder, up to her hold, is at its foot, and the mast\'s trigger beside it');
  check(r.apron, 'the legs go into stone at the rim');
  check(r.oakMast, 'there is a drawing of the mast with the young oak in it, for after the cut');

  // ---- every scene from its new place
  r = await S.page.evaluate(() => {
    const out = {};
    // the crates card by day, from the rim's ladder; the names in the ledger
    T.reset(); G.day = 3; G.tod = 14 / 24; T.rim(); delete G.flags.crates_heard; const n0 = G.ledger.length;
    useDeco(T.ladder()); let ev = T.last();
    out.card = !!ev && ev.t === 'The crates in the hold' && /Annet Sowerby/.test(ev.b) && G.ledger.length === n0 + 3 && G.ledger.some((l) => l.name === 'Annet Sowerby' && l.where === 'the Kestrel\'s hold');
    if (ev) { const c = ev.c[0]; if (c && c.f) c.f(); } out.logged = !!G.flags.crates_logged;
    // after the bit snaps the ladder is not for climbing
    T.reset(); T.rim(); G.flags.greening = true; window.__ev.length = 0; useDeco(T.ladder());
    out.notNow = !window.__ev.length && window.__msgs.some((t) => /The mast-ladder sways over the quarry rim\. Not now\./.test(t));
    // cargo night: the clerk comes up the ladder on Driftday night
    T.reset(); G.day = 6; G.tod = 20 / 24; T.rim(); useDeco(T.ladder()); ev = T.last();
    out.clerk = !!ev && ev.t === 'Driftday night, aboard';
    // the third crate at the dead hour
    T.reset(); G.day = 7; G.tod = 2 / 24; T.rim(); useDeco(T.ladder()); ev = T.last();
    out.crate = !!ev && ev.t === 'The third crate, at the dead hour';
    // "Forty-eight." at the bottom of the ladder at night
    T.reset(); G.day = 2; G.tod = 23 / 24; T.rim(); useDeco(T.ladder()); ev = T.last();
    out.fortyEight = !!ev && ev.t === 'The crates in the hold' && /"Forty-eight,"/.test(ev.b);
    // the trigger: before the Greening, the ship and nobody aboard to talk to
    const trig = () => G.map.triggers.find((t) => t.id === 'mast');
    const at = () => { const t = trig(); Engine.cam.x = t.x; Engine.cam.y = t.y; t.inside = false; t.said = false; checkTriggers(); };
    T.reset(); T.rim(13.0, 9); at(); out.before = window.__msgs.some((t) => /hangs from the mast, her lift-tanks murmuring/.test(t));
    // after the Greening, the Hedge answered, the Greening's scene not running: the voice and the hounds, then the ship
    window.__ended = 0; const _end = window.ending; window.ending = () => { window.__ended++; };
    T.reset(); T.rim(13.0, 9); Object.assign(G.flags, { greening: true, hedge_answered: true }); delete G.flags.mast_voice; G.escapeTimer = 0;
    const h0 = G.ents.filter((o) => o.kind === 'enemy' && o.type === 'hound' && !o.dead).length; window.__msgs.length = 0; at();
    // three hounds, as before, up to the game's own five-alive cap (spawnHound): the rim has hounds of its own
    out.voice = !!G.flags.mast_voice && G.ents.filter((o) => o.kind === 'enemy' && o.type === 'hound' && !o.dead).length === Math.min(5, h0 + 3) && h0 + 3 > 3 && window.__msgs.some((m) => /"Grab the line\." It followed your voice here/.test(m)) && window.__ended === 0;
    for (const o of G.ents) if (o.kind === 'enemy' && o.type === 'hound') o.dead = true;
    at(); out.end = window.__ended === 1;
    // while the Greening's scene runs (the town's lanes, the gate, Grab the Line) the mast ends nothing: the book's order
    window.__ended = 0; T.reset(); T.rim(13.0, 9); Object.assign(G.flags, { greening: true }); G.escapeTimer = 240; G.flags.g44 = 0; window.__msgs.length = 0; at();
    out.inOrder = window.__ended === 0 && (typeof GREEN44 === 'undefined' || GREEN44.live());
    window.__ended = 0; G.flags.g44 = 6; G.flags.r45 = 1; at(); out.inOrder2 = window.__ended === 0;
    // Part Three: nothing replays
    window.__ended = 0; T.reset(); T.rim(13.0, 9); Object.assign(G.flags, { greening: true, part3: true }); at(); out.p3 = window.__ended === 0;
    window.ending = _end;
    return out;
  });
  check(r.card && r.logged, 'the crates card by day, from the rim\'s ladder: Annet Sowerby, Corwin Aye, Mirren Salk in the ledger, the journal line');
  check(r.notNow, 'after the bit snaps: "The mast-ladder sways over the quarry rim. Not now."');
  check(r.clerk && r.crate, 'cargo night: the clerk on Driftday night and the third crate at the dead hour, from the rim\'s ladder');
  check(r.fortyEight, '"Forty-eight." to the hold at night, from the rim\'s ladder');
  check(r.before, 'the mast\'s trigger before the Greening: the Kestrel on her line, nobody aboard to talk to yet');
  check(r.voice && r.end, 'after the Greening with the Hedge answered: the voice and the hounds at the mast (three, up to the five-alive cap), then the ship once they are dead');
  check(r.inOrder && r.inOrder2, 'while the Greening and Grab the Line are running, the mast on the rim ends nothing (the ship comes to the North Gate, as the book has it)');
  check(r.p3, 'in Part Three the mast replays nothing');

  // ---- the moored Kestrel, the cut, the oak
  r = await S.page.evaluate(() => {
    const out = {}, M = MAST123, SL = SMALLLIFE;
    T.reset(); T.rim(); SL.syncShip();
    out.moored = SL.isMoored() && G.ents.some((e) => e._slShip) && SL.MAST.map === 'clearing' && Math.abs(SL.MAST.x - M.AT.x) < 0.01 && Math.abs(SL.MAST.y - M.AT.y) < 0.01;
    const p = SL.shipPose(10, 0.3); out.high = p.lift >= 9 && SL.MAST.top >= 11 && p.lift < SL.MAST.top;
    out.ship = G.ents.find((e) => e._slShip); out.shipFar = !!(out.ship && out.ship.farSee); delete out.ship;
    // through the Greening's lanes she still rides at the mast; the cable is cut when she comes down over the gate
    G.flags.greening = true; G.flags.g44 = 3; SL.syncShip(); out.stillThere = SL.isMoored() && M.state() === 'moored';
    G.flags.r45 = 1; SL.syncShip(); out.cut = !SL.isMoored() && !G.ents.some((e) => e._slShip) && M.state() === 'taken';
    const mast = G.map.entities.find((e) => e.sprite === 'p123_mast' || e.sprite === 'p123_mast_oak'); out.oak = mast && (mast.animSprite === 'p123_mast_oak' || mast.sprite === 'p123_mast_oak' || M.spriteNow() === 'p123_mast_oak');
    delete G.flags.r45; delete G.flags.g44; delete G.flags.greening; SL.syncShip(); out.back = SL.isMoored() && M.state() === 'moored';
    T.reset(); loadMap('oakhaven', { x: 23.5, y: 22, dir: -Math.PI / 2 }); G.state = 'play'; SL.syncShip(); out.notTown = !SL.isMoored() && !G.ents.some((e) => e._slShip);
    return out;
  });
  check(r.moored && r.high, 'the Kestrel is moored at the rim\'s mast, a hundred feet up, under the mast head');
  check(r.shipFar, 'she is seen at any distance too');
  check(r.stillThere && r.cut && r.oak && r.back, 'she rides there through the lanes; once she comes down over the North Gate the cable is cut and the young oak is in the mast (and the drawing follows the flags back)');
  check(r.notTown, 'nothing is moored in Oakhaven');

  // ---- seen from the town (classic view)
  r = await S.page.evaluate(() => {
    const out = {}, M = MAST123;
    T.reset(); GFX.kestrelMoored = true;
    const look = (map, x, y, dir, tod) => { loadMap(map, { x, y, dir }); G.state = 'play'; G.tod = tod; Engine.cam.pitch = 0; for (let i = 0; i < 3; i++) Engine.render(G.ents, G.tod); return M.farList(); };
    // from the square, looking north at noon
    let far = look('oakhaven', 23.5, 22.5, -Math.PI / 2, 0.5);
    const fm = far.find((e) => e._p123 === 'mast'), fs = far.find((e) => e._p123 === 'ship');
    out.list = !!fm && !!fs && fm.farSee && fs.farSee && !G.ents.includes(fm);
    out.screen = fm && fm._screen; const s = fm && fm._screen;
    out.north = !!s && (s.x0 + s.x1) / 2 > 100 && (s.x0 + s.x1) / 2 < 220 && s.y0 < 75 - 30;
    const grab = () => { Engine.render(G.ents, G.tod); return Array.from(Engine.ctx.getImageData(0, 0, Engine.ctx.canvas.width, (Engine.ctx.canvas.height * 0.5) | 0).data); };
    const a = grab(); M.setFar(false); const b = grab(); M.setFar(true);
    let diff = 0; for (let i = 0; i < a.length; i += 4) if (a[i] !== b[i] || a[i + 1] !== b[i + 1]) diff++; out.diff = diff;
    // its top stands above the roofline as seen from the square's centre: the highest thing in the town around its
    // bearing (0.2 rad either side), every house counted at its tallest ridge (3.45, js/eaves78.js) and the Chapel's tower at 4.1
    { const oak = G.maps.oakhaven, c = Engine.cam; let roof = -1;
      for (let y = 0; y < oak.h; y++) for (let x = 0; x < oak.w; x++) { const cell = oak.cells[y * oak.w + x]; if (!cell) continue;
        const dx = x + 0.5 - c.x, dy = y + 0.5 - c.y, d = Math.hypot(dx, dy); const bm = Math.atan2(fm._tx - c.x, -(fm._ty - c.y)); if (d < 1 || dy >= 0 || Math.abs(Math.atan2(dx, -dy) - bm) > 0.2) continue;   // the skyline on either side of the mast's own bearing
        const top = Math.max(cell.top == null ? 1 : cell.top, (cell.top == null || cell.top >= 1) && cell.tex !== 't_hedge' ? 3.45 : 0); roof = Math.max(roof, (top - (c.z == null ? 0.5 : c.z)) / d); }
      const mastTop = s ? (75 - s.y0) / 150 : -1; out.roofline = s && mastTop > roof + 0.05; out.rl = [mastTop.toFixed(3), roof.toFixed(3)]; }
    // over the roofs: nothing of it is drawn below the town's skyline in front of it (the Greenhall's front is nearer)
    out.behind = !!fm && fm._trueD > 40 && fm.y < 1 && fm.y > -0.1;   // drawn as from 50-odd cells off, stood in the Hedge's outer row
    // looking east from the square, it is not in the view
    far = look('oakhaven', 23.5, 21.5, 0, 0.5); out.eastOff = !far.find((e) => e._p123 === 'mast')._screen;
    // from the North Gate (inside it), the mast and her ladder fill the view to the north
    far = look('oakhaven', 23.5, 2.6, -Math.PI / 2, 0.6); const g = far.find((e) => e._p123 === 'mast')._screen;
    out.gate = !!g && (g.y1 - g.y0) > 45; out.gateH = g && (g.y1 - g.y0);
    // at night her lamps show
    far = look('oakhaven', 23.5, 21.5, -Math.PI / 2, 0.02); const ship = far.find((e) => e._p123 === 'ship');
    const spr = ship && Engine.sprites[ship.animSprite || ship.sprite];
    out.lamps = !!spr && /night/.test(ship.animSprite) && !!spr.emit && Array.prototype.filter.call(spr.emit, (v) => v > 0).length > 60;
    // from the Downs too
    far = look('p20_downs', 37.5, 31.5, -Math.PI / 4, 0.5); out.downs = far.some((e) => e._p123 === 'mast');
    // on the rim itself the mast is the map's own entity, not a far copy
    far = look('clearing', 20.5, 33.5, -Math.PI / 2, 0.5); out.rimOwn = far.length === 0;
    const own = G.ents.find((e) => e.sprite === 'p123_mast' || e.sprite === 'p123_mast_oak'); Engine.render(G.ents, G.tod); out.fromGateRoad = !!(own && own._screen);
    return out;
  });
  check(r.list, 'from Oakhaven the mast and the ship are drawn where they stand, as far copies outside the map\'s own list');
  check(r.north && r.diff > 150, 'from the square they are in the view to the north, high above the horizon (' + JSON.stringify(r.screen) + ', ' + r.diff + ' pixels)');
  check(r.roofline, 'from the square\'s centre its top stands above the roofline (tan of its top ' + (r.rl || []).join(' over the roofs\' ') + ')');
  check(r.behind && r.eastOff, 'behind everything in the town (seen as from its true distance, stood past every house), and not in the view looking east');
  check(r.gate, 'from the North Gate the mast stands a third of the view high, to the north (' + r.gateH + ' of 150 rows)');
  check(r.lamps, 'at night the ship\'s lamps show');
  check(r.downs, 'from the Downs too');
  check(r.rimOwn && r.fromGateRoad, 'on the rim\'s own map the mast is its own entity, seen from the North Gate road at thirty cells');

  // ---- the Kestrel herself (Book One l. 674, 1321): "brass-ribbed and oak-planked, with a patched grey envelope and four
  // lift-tanks slung beneath her keel glowing the faint cobalt of drift-glass"
  r = await S.page.evaluate(() => {
    const out = { size: true }, px = (sp, x, y) => sp.data[y * sp.w + x], rgbOf = (p) => [p & 255, (p >> 8) & 255, (p >> 16) & 255];
    for (let i = 0; i < 5; i++) { const sp = Engine.sprites['kestrel_m' + i]; if (!sp || sp.w !== 144 || sp.h !== 72) out.size = false; }
    const env = (sp) => { let n = 0, grey = 0, tan = 0; for (let y = 10; y <= 30; y++) for (let x = 0; x < sp.w; x++) { const p = px(sp, x, y); if ((p >>> 24) <= 100) continue; const [R, G2, B] = rgbOf(p); n++; if (Math.max(R, G2, B) - Math.min(R, G2, B) < 28) grey++; if (R > B + 30 && G2 > B + 15) tan++; } return { n, grey: n ? grey / n : 0, tan: n ? tan / n : 1 }; };
    const cobaltRuns = (sp) => { let best = 0; for (let y = 50; y < 72; y++) { let runs = 0, on = false; for (let x = 0; x < sp.w; x++) { const p = px(sp, x, y), [R, G2, B] = rgbOf(p); const c = (p >>> 24) > 100 && B > R + 40 && B > G2 + 10; if (c && !on) runs++; on = c; } best = Math.max(best, runs); } return best; };
    const b = Engine.sprites.kestrel_m2, f = Engine.sprites.kestrel_m0;
    out.env = b && env(b); out.tanks = b && cobaltRuns(b); out.tanks0 = f && cobaltRuns(f);
    // cloth, not blockwork: no seam drawn as a solid line. A seam pixel is a grey pixel darker than its neighbours across
    // the seam by more than 10; the longest run of them along a seam (across or down the envelope) is a stitch, not a line
    { const lum = (p) => { const [R, G2, B] = rgbOf(p); return (R + G2 + B) / 3; }, grey = (p) => { const [R, G2, B] = rgbOf(p); return (p >>> 24) > 100 && Math.max(R, G2, B) - Math.min(R, G2, B) < 28 && (R + G2 + B) / 3 > 60; };   // cloth, not the outline
      let longest = 0;
      for (let y = 9; y <= 31; y++) { let run = 0; for (let x = 1; x < b.w - 1; x++) { const p = px(b, x, y); const seam = grey(p) && grey(px(b, x, y - 1)) && grey(px(b, x, y + 1)) && lum(p) < lum(px(b, x, y - 1)) - 10 && lum(p) < lum(px(b, x, y + 1)) - 10; run = seam ? run + 1 : 0; longest = Math.max(longest, run); } }
      for (let x = 2; x < b.w - 2; x++) { let run = 0; for (let y = 8; y <= 32; y++) { const p = px(b, x, y); const seam = grey(p) && grey(px(b, x - 1, y)) && grey(px(b, x + 1, y)) && lum(p) < lum(px(b, x - 1, y)) - 10 && lum(p) < lum(px(b, x + 1, y)) - 10; run = seam ? run + 1 : 0; longest = Math.max(longest, run); } }
      out.seam = longest; }
    // the faint cobalt of drift-glass by day: the tanks dull glass, a faint light inside, never bright blue
    { let n = 0, sb = 0; for (let y = 57; y < 67; y++) for (let x = 0; x < b.w; x++) { const p = px(b, x, y); if ((p >>> 24) <= 100) continue; const [R, G2, B] = rgbOf(p); if (B > R + 20) { n++; sb += B; } } out.tankB = n ? Math.round(sb / n) : 0; }
    return out;
  });
  check(r.size, 'the five moored views keep their size (144 x 72)');
  check(r.env && r.env.grey > 0.7 && r.env.tan < 0.1, 'her envelope is grey sailcloth, not tan (' + JSON.stringify(r.env) + ')');
  check(r.seam <= 4, 'her envelope is cloth, not blockwork: its seams are stitches, no solid seam line (longest run ' + r.seam + ')');
  check(r.tankB > 0 && r.tankB < 150, 'her tanks are dull glass with a faint cobalt light by day (mean blue ' + r.tankB + ')');
  check(r.tanks === 4 && r.tanks0 === 2, 'four cobalt lift-tanks under her keel broadside, two bow-on (' + r.tanks + ', ' + r.tanks0 + ')');

  // ---- "Where is the mooring mast?"
  r = await S.page.evaluate(() => {
    T.reset(); loadMap('oakhaven', { x: 23.5, y: 22.5, dir: 0 }); G.state = 'play'; DLG.log = DLG.log || []; DLG.log.length = 0;
    askPlace('The mooring mast'); const a = DLG.log.filter((l) => l.who === 'them').pop();
    return a ? a.t : '';
  });
  check(/^North/.test(r) && /North Gate/.test(r) && /quarry rim/.test(r), '"Where is the mooring mast?" points north, out through the North Gate to the quarry rim: "' + r + '"');

  // ---------------------------------------------------------------- old saves
  const OLD = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures', 'p123-oldsaves.json.gz'))).toString('utf8'));
  r = await S.page.evaluate((OLD) => {
    const out = {}; window.__ev.length = 0;
    const load = (k) => { try { restoreGame(JSON.parse(JSON.stringify(OLD[k]))); G.state = 'play'; return true; } catch (e) { out['err_' + k] = e.message; return false; } };
    const free = () => !G.map.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0);
    // at the foot of the old mast-ladder, the gate open: the foot of the ladder on the rim
    out.a = load('atMast'); let lad = T.ladder();
    out.aRim = G.mapId === 'clearing' && !!lad && Math.hypot(Engine.cam.x - lad.x, Engine.cam.y - lad.y) < 2.2 && free();
    out.aOld = OLD.atMast.mapId === 'oakhaven' && Math.hypot(OLD.atMast.cam.x - 37, OLD.atMast.cam.y - 21.5) < 2;
    // the town's people kept their places (entities are saved by their place in the list)
    const sm = OLD.atMast.maps.oakhaven.ents, oak = G.maps.oakhaven;
    // a saved name belongs to the same person at the same place in the list; a saved health to something that lives
    out.aSame = sm.length <= oak.baseCount && sm.every((o, i) => { const e = oak.entities[i]; if (!o || !e) return !o; if (o.name !== undefined && e.name !== o.name) return false; if (o.hp !== undefined && e.kind !== 'npc' && e.kind !== 'enemy') return false; return true; });
    const cm = OLD.atMast.maps.clearing.ents, cl = G.maps.clearing; out.aRimSame = cm.length <= cl.baseCount && cm.every((o, i) => { const e = cl.entities[i]; return !!e && (o.name === undefined || e.name === o.name) && (o.hp === undefined || e.kind === 'npc' || e.kind === 'enemy'); });
    out.aHarrow = oak.entities.some((e) => e.id === 'harrow' && e.kind === 'npc');
    // saved again and loaded again, it stays where it is
    const again = snapshotGame(); restoreGame(JSON.parse(JSON.stringify(again))); out.aStays = G.mapId === 'clearing' && Math.hypot(Engine.cam.x - again.cam.x, Engine.cam.y - again.cam.y) < 1e-6;
    // the same with the gate still shut: Harrow's gate is not opened for you; you stand on the carters' standing
    out.b = load('gateShut'); out.bTown = G.mapId === 'oakhaven' && free() && !G.flags.gate_open;
    // the greened town, at the old mast: the greened town, on open cobbles, the scene's clock running
    out.c = load('greened'); out.cTown = G.mapId === 'oakhaven' && /Greening/.test(G.map.name) && free() && !G.map.triggers.some((t) => t.id === 'mast') && G.escapeTimer > 0;
    // aboard, in Grab the Line: aboard
    out.d = load('aboard'); out.dDeck = G.mapId === 'p16k_kestrel_deck' && G.flags.r45 === 2;
    return out;
  }, OLD);
  check(r.a && r.aOld && r.aRim, 'an old save at the old mast-ladder, the gate open, loads at the foot of the ladder on the quarry rim');
  check(r.aSame && r.aRimSame && r.aHarrow, 'and the people and things of the town and of the rim keep their places from it (saves keep them by their place in the list)');
  check(r.aStays, 'saved and loaded again, it stays where it is');
  check(r.b && r.bTown, 'an old save at the old mast with the North Gate still shut loads in the town, on open ground, the gate still shut');
  check(r.c && r.cTown, 'an old save in the greened town where the mast stood loads there, the Greening\'s clock running');
  check(r.d && r.dDeck, 'an old save aboard in Grab the Line loads aboard');
  check(!Object.keys(r).some((k) => /^err_/.test(k)), 'no old save is refused (' + Object.keys(r).filter((k) => /^err_/.test(k)).map((k) => k + ': ' + r[k]).join('; ') + ')');
  check(!S.errors.length, 'no page errors (' + S.errors.slice(0, 3).join(' | ') + ')');
  await S.browser.close();

  // ---------------------------------------------------------------- the 3D view
  S = await start(true);
  r = await S.page.evaluate(async () => {
    const out = {}; const wait = (ms) => new Promise((res) => setTimeout(res, ms));
    if (typeof R3D === 'undefined') return { none: true };
    R3D.setMode('on'); GFX.kestrelMoored = true;
    loadMap('oakhaven', { x: 23.5, y: 21.5, dir: -Math.PI / 2 }); G.state = 'play'; G.tod = 0.5; Engine.cam.pitch = 0;
    for (let i = 0; i < 6; i++) { render(); await wait(60); }
    out.active = R3D.active();
    const far = MAST123.farList(), fm = far.find((e) => e._p123 === 'mast'), fs = far.find((e) => e._p123 === 'ship');
    out.mast = !!(fm && fm._screen); out.ship = !!(fs && fs._screen); out.s = fm && fm._screen;
    loadMap('clearing', { x: 20.5, y: 33.5, dir: -Math.PI / 2 }); G.state = 'play';
    for (let i = 0; i < 4; i++) { render(); await wait(60); }
    const own = G.ents.find((e) => e.sprite === 'p123_mast' || e.sprite === 'p123_mast_oak'); out.rim = !!(own && own._screen);
    return out;
  });
  check(!r.none && r.active, 'the 3D view is running');
  check(r.mast && r.ship, 'in the 3D view the mast and the ship show from the square, to the north (' + JSON.stringify(r.s) + ')');
  check(r.rim, 'and on the rim\'s own map, seen from the North Gate road');
  {
    const rect = await S.page.evaluate(async () => {
      const wait = (ms) => new Promise((res) => setTimeout(res, ms));
      loadMap('clearing', { x: 27, y: 9.5, dir: Math.PI }); G.state = 'play'; G.tod = 0.5; G.fadeT = 0; UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; if (typeof Weather !== 'undefined' && Weather.hold) Weather.hold('clear'); Engine.cam.pitch = 95;   // a clear noon if (G.player) G.player.pitch = 95;
      closeModal(); hide('#event'); document.getElementById('msgs').innerHTML = '';
      for (let i = 0; i < 8; i++) { if (window.advanceTime) window.advanceTime(16); render(); await wait(80); }
      const e = G.ents.find((x) => x._slShip); return e && e._screen;
    });
    let env3d = null;
    if (rect) {
      const k = 4, x = Math.round(((rect.x0 + rect.x1) / 2 - (rect.x1 - rect.x0) * 0.2) * k), y = Math.round((rect.y0 + (rect.y1 - rect.y0) * 0.22) * k);
      const shot = await S.page.screenshot({ clip: { x, y, width: Math.max(4, Math.round((rect.x1 - rect.x0) * 0.4 * k)), height: Math.max(4, Math.round((rect.y1 - rect.y0) * 0.12 * k)) } });
      const { PNG } = (() => { try { return require('pngjs'); } catch (e) { return {}; } })();
      if (PNG) { const im = PNG.sync.read(shot); let r0 = 0, g0 = 0, b0 = 0, n = 0; for (let i = 0; i < im.data.length; i += 4) { r0 += im.data[i]; g0 += im.data[i + 1]; b0 += im.data[i + 2]; n++; } env3d = [r0 / n, g0 / n, b0 / n].map(Math.round); }
      else { const b64 = shot.toString('base64'); env3d = await S.page.evaluate(async (b64) => { const im = new Image(); im.src = 'data:image/png;base64,' + b64; await im.decode(); const c = document.createElement('canvas'); c.width = im.width; c.height = im.height; const x = c.getContext('2d'); x.drawImage(im, 0, 0); const d = x.getImageData(0, 0, c.width, c.height).data; let r0 = 0, g0 = 0, b0 = 0, n = 0; for (let i = 0; i < d.length; i += 4) { r0 += d[i]; g0 += d[i + 1]; b0 += d[i + 2]; n++; } return [r0 / n, g0 / n, b0 / n].map(Math.round); }, b64); }
    }
    const lumE = env3d ? (env3d[0] + env3d[1] + env3d[2]) / 3 : 0;
    check(!!env3d && lumE > 60 && Math.max(...env3d) - Math.min(...env3d) < 30, 'by day from the rim, in the 3D view, her envelope reads grey, not near black (' + JSON.stringify(env3d) + ')');
  }
  check(!S.errors.length, 'no page errors in the 3D view (' + S.errors.slice(0, 3).join(' | ') + ')');
  await S.browser.close();

  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
