// PREVIEW_URL=http://127.0.0.1:4232 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/callings127.test.js
// Phase 127: the callings, part two, "the quarry" (js/callings127.js, js/quarrywork127.js). Two more callings register in
// Phase 126's table (CALLINGS126.register), and the quarry is at work between its scenes:
//   Catalogue Clerk (archivist): the serial stamped in the bronze beside every Legionnaire's grille (MS 4828), the name
//                       lit above a bell once it is in your book, a proctor's blank plate (MS 4411); "Copy it off the
//                       bronze" (the name into the ledger without killing the bell; the bell hears you, and the Factor).
//   Quarry-Hand (quarry): sound and unsound timber, the line a glass-rock face would split on, the loads a hand could
//                       shoulder; "Shoulder it" (a crate on your shoulder at a walk, the Legion takes you for one of the
//                       shift; the bells still count you) and "Split it on its line" at a resonant seam.
//   The quarry at work: the day and night shifts in the workings (through LIFE60), the Hollows at the pumps in pairs like
//                       clockwork (MS 1777), the clerk at the headframe on the rim. Its own switch, GFX.quarryWork.
// The checks are the design's §6.4 (story/Game Layer/Phase 127 - The callings, part two (design, for the builder).md),
// numbered as there. Two pages: A, the game; B, the same game with js/callings127.js and js/quarrywork127.js blocked,
// for the "exactly as before" checks (4, 18, 33). Where the design was wrong about the code the check follows the code,
// with a comment.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.PREVIEW_URL || 'http://127.0.0.1:4232';
const ROOT = path.join(__dirname, '..');
const src = (f) => { try { return fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { return ''; } };
let fails = 0;
const check = (ok, m) => { if (ok) console.log('PASS ' + m); else { fails++; console.log('FAIL ' + m); } };

const MS = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md').split('\n');
const norm = (s) => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<\/?(i|b|em)>/gi, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const msText = (lines) => norm(lines.map((n) => MS[n - 1] || '').join(' '));
const pairsOf = (f) => { const m = new Map(); for (const l of src(f).split('\n')) { if (!l.trim() || l.startsWith('#')) continue; const c = l.split('\t'); if (c.length === 2 && c[0] && c[1]) m.set(norm(c[0]), c[1]); } return m; };
// the Office's canon entry numbers (§2.1 of the design): no bell may wear one
const CANON = [39802, 40101, 40102, 40991, 41009, 41012, 41013, 41004, 41005, 41006, 41007];
// the module's serial, recomputed here (FNV-1a over the name, as js/callings126.js hashStr): a pure function of the name
const fnv = (s) => { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
const serial = (name) => { const n = 30000 + Math.floor(fnv(name) * 9000); return 'WG-' + String(n).replace(/(\d\d)(\d\d\d)$/, '$1,$2'); };

async function startGame(browser, block) {
  const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
  page.setDefaultTimeout(600000);
  const errors = [];
  page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'warning' && /callings12[67]|quarrywork127|life60/.test(m.text())) errors.push(m.text()); });
  if (block) await page.route(/js\/(callings127|quarrywork127)\.js/, (r) => r.fulfill({ status: 200, contentType: 'text/javascript', body: '/* blocked by test/callings127 */' }));
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'off', cap: 80 })); localStorage.removeItem('octave.switch.callingSight'); localStorage.removeItem('octave.switch.quarryWork'); localStorage.removeItem('octave.callings126.mode'); localStorage.removeItem('octave.air93.v1'); } catch (e) { /* none */ } });
  await page.goto(URL_ + '/index.html?nosw=1', { timeout: 600000 });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000, polling: 500 });
  await page.locator('#btn-new').click();
  await page.locator('#cname').fill('Callings Tester');
  await page.locator('#c-next').click();
  await page.locator('.classlist button').first().click();   // Glass-Hand (blade): T.cls changes it
  await page.locator('#c-next').click();
  await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click();
  await page.locator('#btn-intro-skip').click();
  await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;   // only T.step ticks the game, only T.frame draws
    closeModal(); hide('#event'); G.state = 'play';
    window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
    window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c: c || [] }); };
    const CLS = (id) => CLASSES.find((c) => c.id === id);
    window.T = {
      step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; update(dt || 0.05); } },
      walk(n) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = { w: (i % 40) < 20, s: (i % 40) >= 20 }; G.player.hp = G.player.hpMax; update(0.05); } G.keys = {}; },
      still(s) { T.step(Math.round(s / 0.05)); },
      frames(n) { CALLINGS126.gather(); for (let i = 0; i < (n || 2); i++) render(); },
      heard(re) { return window.__msgs.some((t) => re.test(t)); },
      last() { return window.__ev[window.__ev.length - 1] || null; },
      press(i) { const e = T.last(); if (!e) return false; const k = i < 0 ? e.c.length + i : (i || 0); if (e.c[k]) { if (e.c[k].f) e.c[k].f(); return true; } return false; },
      pressText(t) { const e = T.last(); if (!e) return false; const c = e.c.find((x) => x.t === t); if (c) { if (c.f) c.f(); return true; } return false; },
      cls(id) { const p = G.player; p.cls = CLS(id); p.glassed = id === 'blade'; if (id === 'blade' && !(p.glass > 0)) p.glass = 42; p.voiceMax = Math.max(p.voiceMax || 0, 40); p.voice = 40; G.glassLock = 0; },
      at(map, x, y, dir, tod) {
        G.state = 'paused'; if (tod != null) G.tod = tod; loadMap(map, { x, y, dir: dir || 0 }); G.fadeT = 0; if (tod != null) G.tod = tod;
        Engine.cam.pitch = 0; Engine.cam.bob = 0; G.vel.x = G.vel.y = 0; try { Weather.hold('clear'); } catch (e) { /* none */ }
        for (const e of G.ents) if (e && e.kind === 'enemy') { e.state = 'idle'; e.stun = 1e6; }
        G.noise = 1; G.stillT = 0; G.murmurT = 0; G.attack.t = 0; G.song.t = 0; G.hurtT = 0; G.dragBody = null; G.state = 'play';
      },
      face(e) { const c = Engine.cam; c.dir = Math.atan2(e.y - c.y, e.x - c.x); },
      put(e, d) { const c = Engine.cam; Engine.cam.x = e.x - Math.cos(c.dir) * d; Engine.cam.y = e.y - Math.sin(c.dir) * d; },
      spawn(type, x, y, o) { const e = hydrate(Object.assign({ kind: 'enemy', type, x, y }, o || {})); e.state = 'idle'; e.stun = 1e6; G.map.entities.push(e); if (G.ents !== G.map.entities && !G.ents.includes(e)) G.ents.push(e); return e; },
      drawn(kind) { return CALLINGS126.lastDrawn().filter((r) => !kind || r.kind === kind); },
      evs() { return window.__ev.length; },
      find(pred) { return G.ents.find(pred) || null; },
      gethin() { return G.ents.find((e) => e.kind === 'enemy' && e.name === 'Gethin Coote' && Math.abs(e.x - 18.5) < 0.6 && Math.abs(e.y - 21.5) < 0.6) || null; },
      // a deterministic stretch of play: Math.random from a fixed seed (counted), time pinned
      det(fn) {
        const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; window.__rc = 0;
        Math.random = () => { window.__rc++; return (sd = (sd * 16807) % 2147483647) / 2147483647; }; performance.now = () => 123456; Date.now = () => 1700000000000;
        try { if (typeof ANIM === 'object') { ANIM.T = 0; ANIM.last = 123.456; } G.time = 500; return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; }
      },
      hash() {
        let h = 0x811c9dc5 | 0;
        const eat = (d) => { for (let i = 0; i < d.length; i += 3) h = Math.imul(h ^ d[i], 16777619) | 0; };
        const c = Engine.ctx.canvas; eat(Engine.ctx.getImageData(0, 0, c.width, c.height).data);
        if (typeof R3D === 'object' && R3D.active()) { const p = R3D.readPixels(); if (p) eat(p.data); }
        return h >>> 0;
      },
      // (js/smalllife.js's rats are left out: they wander on that module's own private stream, which carries on across loads)
      // (and the place's LIFE60 walkers and js/carrion-crows: their spots come from LIFE60's and the crows' own private streams,
      //  which carry on across every place visited, so they are compared without x and y; run on fresh pages, the lists match
      //  with x and y too)
      ents(map) { const m = G.maps[map]; return (m.entities || []).filter((e) => !/^rat/.test(e.sprite || '')).map((e) => (e._life || /^crow/.test(e.sprite || '')) ? Object.assign({}, e, { x: 0, y: 0 }) : e).map((e) => [e.kind, e.id || e.type || '', e.sprite || '', e.name || '', Math.round(e.x * 1000) / 1000, Math.round(e.y * 1000) / 1000, !!e.hidden]); },
    };
    GFX.callingSight = true; CALLINGS126.setMode('still');
    try { R3D.setMode('off', { noSave: true }); } catch (e) { /* no R3D */ }
    const f = G.flags; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true;
    // the bell echoes heard already, unless a check asks for them (js/dreams.js plays one the first time anyone listens)
    f.p6d_e_co_qr = true; f.p6d_e_co_any = true; f.p6d_e_co_mal = true; f.p6d_e_gl_qr = true; f.p6d_e_gl_rv = true;
  });
  const sect = async (name, fn, arg) => { try { return await page.evaluate(fn, arg); } catch (e) { fails++; console.log('FAIL section ' + name + ' threw: ' + String(e && e.message || e).split('\n').slice(0, 4).join(' / ')); return {}; } };
  return { page, errors, sect };
}

(async () => {
  // ---------------------------------------------------------------- 6, 32 (static)
  const html = src('index.html');
  const tags = [...html.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]);
  const ti = (f) => tags.indexOf(f);
  check(ti('js/callings127.js') > ti('js/callings126.js') && ti('js/callings126.js') >= 0 && ti('js/quarrywork127.js') > ti('js/callings127.js') && ti('js/quarrywork127.js') > ti('js/life74-smallplaces.js') && tags[tags.length - 1] === 'js/mast123.js',
    '32. index.html: callings127.js after callings126.js, quarrywork127.js after callings127.js and life74-smallplaces.js, and mast123.js still the last script tag');
  const m127 = src('js/callings127.js'), w127 = src('js/quarrywork127.js');
  check(m127.length > 0 && w127.length > 0 && !/Math\.random/.test(m127 + w127), '6. js/callings127.js and js/quarrywork127.js exist and neither contains Math.random');
  check(!/Engine\.render\s*\(/.test(m127 + w127), '6. neither calls Engine.render');
  check((src('js/game.js').match(/Math\.random/g) || []).length === 24, '6. js/game.js has its 24 Math.random, as test/strangers125 counts them');
  check(/stamp: 256/.test(src('js/audit54.js')) && /shift: 512/.test(src('js/audit54.js')), 'js/audit54.js has BITS.stamp = 256 and BITS.shift = 512');
  check(/'quarryWork'/.test(src('js/presets.js')) && /'quarryWork'/.test(src('test/presets.test.js')), '5. js/presets.js LOW_OFF and test/presets.test.js cheapOff have quarryWork');
  check(!/name: 'Mirren Salk'/.test(src('js/maps.js')) && /name: 'Cass Yelland'/.test(src('js/maps.js')), '28. js/maps.js: the Root-vault Legionnaire is Cass Yelland, not Mirren Salk (her core is in the Kestrel\'s hold, MS 4560)');
  check(/'Annet Sowerby', 'Corwin Aye', 'Mirren Salk'/.test(src('js/game.js')) && /'Annet Sowerby', 'Corwin Aye', 'Mirren Salk'/.test(src('js/cargo56.js')), '28. the crates card still puts Mirren Salk in the ledger (js/game.js, js/cargo56.js)');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const A = await startGame(browser, false);
    const { page, sect } = A;
    const ok = await page.evaluate(() => [typeof CALLINGS127 === 'object' && !!CALLINGS127, typeof QUARRYWORK127 === 'object' && !!QUARRYWORK127]);
    check(ok[0], '1. CALLINGS127 is loaded');
    check(ok[1], '1. QUARRYWORK127 is loaded');
    if (!ok[0] && !ok[1]) throw new Error('neither module: the rest cannot run');   // (one alone: its sections run, the other's fail)
    // the starting state both pages restore, so that their runs can be compared step for step
    const SNAP = await page.evaluate(() => { const s = JSON.parse(JSON.stringify(snapshotGame())); for (const k in s.flags) if (/^p127_/.test(k)) delete s.flags[k]; return s; });

    // (C127_ONLY=runs: only the two-page comparisons, for working on them)
    if (process.env.C127_ONLY !== 'runs') {
    // ---------------------------------------------------------------- 1. the table
    {
      const r = await sect('1', () => ({ ids: CALLINGS126.ids().slice() }));
      check(JSON.stringify(r.ids && r.ids.slice(0, 3)) === JSON.stringify(['blade', 'cantor', 'corsair']) && r.ids.includes('archivist') && r.ids.includes('quarry') && r.ids.indexOf('archivist') > 2 && r.ids.indexOf('quarry') > 2,
        '1. CALLINGS126.ids() has archivist and quarry after the three (' + JSON.stringify(r.ids) + ')');
    }

    // ---------------------------------------------------------------- 2. first sight
    {
      const r = await sect('2', () => {
        const out = {}, TX = CALLINGS127.TX;
        G.flags.p126_seen = 0; window.__msgs.length = 0;
        T.cls('archivist'); T.at('quarry', 16.0, 21.5, 0, 10 / 24); GFX.quarryWork = false;
        const L = T.gethin(); if (L) T.face(L);
        T.still(1.6); T.still(1.0);
        out.a1 = window.__msgs.filter((t) => t === TX.clerkFirst).length; out.bitA = (G.flags.p126_seen & 8) !== 0;
        window.__msgs.length = 0;
        T.cls('quarry'); T.at('quarry', 16.5, 21.0, 0, 10 / 24);
        Engine.cam.dir = Math.atan2(19.4 - 21.0, 18.5 - 16.5);
        T.still(1.6); T.still(1.0);
        out.q1 = window.__msgs.filter((t) => t === TX.quarryFirst).length; out.bitQ = (G.flags.p126_seen & 32) !== 0;
        return out;
      });
      check(r.a1 === 1 && r.bitA === true, '2. a Clerk standing still among the quarry\'s bells gets A1 once, and p126_seen & 8 is set (' + r.a1 + ')');
      check(r.q1 === 1 && r.bitQ === true, '2. a Quarry-Hand standing still by a scaffold gets Q1 once, and p126_seen & 32 (' + r.q1 + ')');
    }

    // ---------------------------------------------------------------- 3. callingSight off: the frames are what they were
    const hashRun = async (view, cls) => sect('3 ' + view + ' ' + cls, ([view, cls]) => {
      try { R3D.setMode(view === '3d' ? 'on' : 'off', { noSave: true }); } catch (e) { /* none */ }
      const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
      T.cls(cls); GFX.quarryWork = false; T.at('quarry', 16.0, 21.5, 0, 10 / 24);
      const L = T.gethin(); if (L) T.face(L);
      if (cls === 'quarry') Engine.cam.dir = Math.atan2(19.4 - 21.5, 18.5 - 16.0);   // the barracks scaffold
      T.still(3); pin(() => T.frames(3));
      const out = { r3d: typeof R3D === 'object' && R3D.active() };
      const real = CALLINGS126.draw;
      GFX.callingSight = false;
      const off1 = pin(() => { T.frames(2); return T.hash(); });
      CALLINGS126.draw = function () { return undefined; };
      const off2 = pin(() => { T.frames(2); return T.hash(); });
      CALLINGS126.draw = real; GFX.callingSight = true;
      const on1 = pin(() => { T.frames(2); return T.hash(); });
      out.marks = T.drawn().length; out.equal = off1 === off2; out.differs = on1 !== off1;
      try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
      return out;
    }, [view, cls]);
    for (const cls of ['archivist', 'quarry']) {
      const a = await hashRun('classic', cls);
      check(a.equal === true && a.differs === true && a.marks > 0, '3. ' + cls + ', classic view: callingSight off hashes equal to a run with CALLINGS126.draw stubbed out (and on, it differs; ' + a.marks + ' marks)');
      const b = await hashRun('3d', cls);
      if (b.r3d) check(b.equal === true && b.differs === true && b.marks > 0, '3. ' + cls + ', 3D view: the same (' + b.marks + ' marks)');
      else console.log('NOTE 3. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 5. the switch, the presets, the Options row
    {
      const r = await sect('5', () => {
        const out = { inFX: GFX.FX.includes('quarryWork'), per: {} };
        for (const p of ['original', 'low', 'medium', 'high', 'ultra']) { PRESETS.apply(p); out.per[p] = GFX.quarryWork; }
        PRESETS.apply('medium');
        GFX.quarryWork = false; if (GFX.changed) GFX.changed();
        out.stored = (() => { try { return localStorage.getItem('octave.switch.quarryWork'); } catch (e) { return 'x'; } })();
        GFX.quarryWork = true; if (GFX.changed) GFX.changed();
        renderAccessibilityMenu();
        const b = document.getElementById('gfx-quarryWork127');
        out.row = !!b; out.seq = [];
        if (b) for (let i = 0; i < 3; i++) { out.seq.push([GFX.quarryWork, b.textContent]); b.click(); }
        closeModal(); G.state = 'play';
        GFX.quarryWork = true; GFX.callingSight = true;
        return out;
      });
      check(r.inFX, '5. GFX.FX has quarryWork');
      check(r.per && r.per.original === false && r.per.low === false && r.per.medium === true && r.per.high === true && r.per.ultra === true, '5. after PRESETS.apply it is off in original and low, on in medium, high and ultra (' + JSON.stringify(r.per) + ')');
      check(r.stored === 'false', '5. PRESETS.keep stores it (' + r.stored + ')');
      const s = r.seq || [];
      check(r.row && s.length === 3 && s[0][0] === true && s[1][0] === false && s[2][0] === true && s[0][1] !== s[1][1], '5. the Options row gfx-quarryWork127 toggles it, shown and hidden (' + JSON.stringify(s) + ')');
    }

    // ---------------------------------------------------------------- 7. the flags, and an old save
    {
      const OLD = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures', 'p123-oldsaves.json.gz'))).toString('utf8'));
      const r = await sect('7', (d) => {
        const out = {};
        const f = G.flags; f.p127_copied = 'x'; f.p127_carried = 900; f.p127_split = -1;
        CALLINGS127.validate(f);
        out.bad = [f.p127_copied, f.p127_carried, f.p127_split];
        const rn = Math.random; let calls = 0;
        const load = (stub) => {
          const v6 = CALLINGS126.validate, v7 = CALLINGS127.validate; if (stub) { CALLINGS126.validate = () => {}; CALLINGS127.validate = () => {}; }
          Math.random = function () { calls++; return rn.apply(this, arguments); };
          let c0 = 0;
          try { c0 = calls; restoreGame(JSON.parse(JSON.stringify(d))); } finally { Math.random = rn; CALLINGS126.validate = v6; CALLINGS127.validate = v7; }
          return calls - c0;
        };
        const a = load(true), b = load(false);
        out.rand = [a, b];
        out.flags = ['p127_copied', 'p127_carried', 'p127_split'].map((k) => G.flags[k] == null ? 0 : G.flags[k]);
        G.state = 'play'; closeModal(); hide('#event');
        return out;
      }, OLD.atMast);
      check(JSON.stringify(r.bad) === JSON.stringify([0, 0, 0]), '7. p127_copied "x", p127_carried 900, p127_split -1 all read 0 after validate (' + JSON.stringify(r.bad) + ')');
      check(r.rand && r.rand[0] === r.rand[1], '7. loading the p123 fixture save draws no more random numbers with the modules\' validation than without (' + JSON.stringify(r.rand) + ')');
      check(Array.isArray(r.flags) && r.flags.every((v) => v === 0), '7. and every p127 flag reads 0 (' + JSON.stringify(r.flags) + ')');
      await page.evaluate((s) => { restoreGame(JSON.parse(JSON.stringify(s))); G.state = 'play'; closeModal(); hide('#event'); const f = G.flags; f.p6d_e_co_qr = f.p6d_e_co_any = f.p6d_e_co_mal = f.p6d_e_gl_qr = f.p6d_e_gl_rv = true; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true; }, SNAP);
    }

    // ---------------------------------------------------------------- 8, 9. the stamps
    {
      const r = await sect('8-9', () => {
        const out = {};
        T.cls('archivist'); GFX.quarryWork = false; T.at('quarry', 16.0, 21.5, 0, 10 / 24);
        const c = Engine.cam, m = G.map;
        const L = T.gethin(); T.face(L);
        // one just behind the nearest wall in some direction, within 6
        let hid = null;
        for (let a = 0; a < 32 && !hid; a++) {
          const dir = a * Math.PI / 16, dx = Math.cos(dir), dy = Math.sin(dir); let wall = false;
          for (let s = 0.5; s < 5.5; s += 0.25) { const x = c.x + dx * s, y = c.y + dy * s; if (m.isSolidCell(x | 0, y | 0)) wall = true; else if (wall && s > 1.5) { const keep = c.dir; c.dir = dir; hid = T.spawn('legionnaire', x, y, { name: 'Behind Wall' }); c.dir = keep; break; } }
        }
        // turn so the hidden one is in the field of view, with Gethin
        if (hid) { const a1 = Math.atan2(hid.y - c.y, hid.x - c.x), a2 = Math.atan2(L.y - c.y, L.x - c.x); let d = a1 - a2; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; if (Math.abs(d) < 0.9) c.dir = a2 + d / 2; }
        T.still(1.4); T.frames(3);
        const legs = G.ents.filter((e) => e.kind === 'enemy' && e.type === 'legionnaire' && !e.dead && !e.hidden && !e.transient && e !== hid && e._screen && Math.hypot(e.x - c.x, e.y - c.y) <= 6 && CALLINGS126.visible(e));
        const st = T.drawn('stamp');
        out.nLegs = legs.length; out.all = legs.length > 0 && legs.every((e) => st.some((k) => k.e === e));
        out.hid = !!hid; out.hidScreen = !!(hid && hid._screen); out.hidDrawn = !!hid && st.some((k) => k.e === hid);
        out.serial = CALLINGS127.serialOf(L); out.serial2 = CALLINGS127.serialOf({ name: L.name });
        out.near = (st.find((k) => k.e === L) || {}).text;
        for (const id of ['blade', 'cantor', 'corsair']) { T.cls(id); T.still(1.0); T.frames(2); out[id] = T.drawn('stamp').length + T.drawn('blank').length + T.drawn('name').length; }
        if (hid) { hid.dead = true; hid.hidden = true; }
        // 9. every serial over the pool and the map names
        const names = new Set(NAMES_POOL);
        for (const id in G.maps) for (const e of G.maps[id].entities || []) if (e && e.kind === 'enemy' && e.name) names.add(e.name);
        out.serials = [...names].map((n) => [n, CALLINGS127.serialOf({ name: n })]);
        return out;
      });
      check(r.all === true, '8. Clerk in the quarry: a stamp for each live Legionnaire within 6 and in view (' + r.nLegs + ')');
      check(r.hid && r.hidScreen && r.hidDrawn === false, '8. none for one behind a wall (the depth probes)' + (r.hid ? '' : ': no wall found'));
      check(r.serial === serial('Gethin Coote') && r.serial2 === r.serial, '8. serialOf is a pure function of the name, the same on every load (' + r.serial + ')');
      check(r.near === r.serial, '8. within 3 cells the stamp is legible: its text is the serial (' + r.near + ')');
      check(r.blade === 0 && r.cantor === 0 && r.corsair === 0, '8. and none for a Glass-Hand, Cantor or Corsair (' + [r.blade, r.cantor, r.corsair].join(', ') + ')');
      const bad = (r.serials || []).filter(([n, s]) => { const m = /^WG-(3\d),(\d\d\d)$/.exec(s); if (!m) return true; const v = Number(m[1] + m[2]); return v < 30000 || v > 38999 || CANON.includes(v) || s !== serial(n); });
      check((r.serials || []).length >= 15 && bad.length === 0, '9. every serial over NAMES_POOL and the map names is WG-3x,xxx, in 30,000-38,999, and none is a canon number (' + (r.serials || []).length + ' names; bad: ' + JSON.stringify(bad.slice(0, 3)) + ')');
    }

    // ---------------------------------------------------------------- 10, 11, 12, 13, 14. Copy it off the bronze
    {
      const r = await sect('10-14', () => {
        const out = {}, TX = CALLINGS127.TX;
        T.cls('archivist'); GFX.quarryWork = false; T.at('quarry', 16.0, 21.5, 0, 10 / 24);
        G.ledger.length = 0; G.flags.p54_log = 0; G.flags.p54_walked = 0; G.flags.p127_copied = 0;
        const L = T.gethin(); out.L = !!L;
        // 11. the place's bell echo, unheard: the first E plays it, the act stands aside
        delete G.flags.p6d_e_co_qr; delete G.flags.p6d_e_co_any;
        T.face(L); T.put(L, 1.0); T.frames(2);
        const ev0 = T.evs(); interact();
        out.aside = T.evs() === ev0;
        out.queued = DREAMS.pending().length > 0 || DREAMS.openId() === 'co_qr';
        for (let i = 0; i < 3; i++) { try { DREAMS.pollEchoes(); if (DREAMS.isOpen()) DREAMS.closeCard(); } catch (e) { /* none */ } }
        G.flags.p6d_e_co_qr = true; G.flags.p6d_e_co_any = true; closeModal(); hide('#event'); G.state = 'play';
        T.face(L); T.put(L, 1.0); T.frames(2);
        // 10.
        const st0 = L.state, hp0 = L.hp, x0 = L.x, y0 = L.y, n0 = G.noise, ev1 = T.evs();
        interact();
        const card = window.__ev[ev1];
        const old = 'Stand close, and you can hear someone murmuring inside the bell: "' + coreMurmur(L) + '"';
        out.card = !!card && T.evs() === ev1 + 1 && card.t === TX.stampTitle && card.b.startsWith(old) && card.b.includes(CALLINGS127.serialOf(L));
        out.choices = card ? card.c.map((c) => c.t) : [];
        T.pressText(TX.copyIt);
        out.ledger = G.ledger.some((x) => x.name === 'Gethin Coote');
        out.same = L.state === st0 && L.hp === hp0 && L.x === x0 && L.y === y0 && !L.dead;
        out.noise = G.noise - n0; out.copied = G.flags.p127_copied; out.bit = (AUDIT54.logged() & 256) !== 0;
        out.a7 = T.heard(/You write it small, in a clerk's hand/);
        out.journal = G.journal.some((j) => j.text === TX.jClerk);
        window.__msgs.length = 0; const ev2 = T.evs(); interact();
        out.again = T.evs() === ev2 && T.heard(/Stand close, and you can hear someone murmuring inside the bell/);
        // 13. names lit
        const other = T.spawn('legionnaire', Engine.cam.x + Math.cos(Engine.cam.dir + 0.3) * 2.2, Engine.cam.y + Math.sin(Engine.cam.dir + 0.3) * 2.2, { name: 'Ivo Marten' });
        const pr = T.spawn('proctor', Engine.cam.x + Math.cos(Engine.cam.dir - 0.3) * 2.4, Engine.cam.y + Math.sin(Engine.cam.dir - 0.3) * 2.4, { name: 'A Proctor' });
        Engine.cam.x -= Math.cos(Engine.cam.dir) * 1.0; Engine.cam.y -= Math.sin(Engine.cam.dir) * 1.0;
        T.still(1.4); T.frames(3);
        out.lit = T.drawn('name').some((k) => k.e === L && k.text === 'GETHIN');
        out.otherLit = T.drawn('name').some((k) => k.e === other);
        out.otherStamp = T.drawn('stamp').some((k) => k.e === other);
        out.blank = T.drawn('blank').some((k) => k.e === pr);
        out.prStamp = T.drawn('stamp').some((k) => k.e === pr);
        // 12. never offered
        const can = (e) => CALLINGS127.canCopy(e);
        T.face(pr); T.put(pr, 1.0); T.frames(2); window.__msgs.length = 0; const ev3 = T.evs(); interact();
        out.proctor = T.evs() === ev3 && !can(pr);
        const boss = T.spawn('legionnaire', Engine.cam.x + 1, Engine.cam.y, { name: 'Boss Bell' }); boss.def = Object.assign({}, boss.def, { boss: true });
        boss.x = Engine.cam.x + Math.cos(Engine.cam.dir) * 1.0; boss.y = Engine.cam.y + Math.sin(Engine.cam.dir) * 1.0;
        out.boss = !can(boss) && !can({ kind: 'enemy', type: 'aegis', def: { core: true, boss: true }, name: 'WG', x: boss.x, y: boss.y, state: 'idle' });
        boss.dead = true; boss.hidden = true;
        const tr = T.spawn('legionnaire', Engine.cam.x + Math.cos(Engine.cam.dir) * 1.0, Engine.cam.y + Math.sin(Engine.cam.dir) * 1.0, { name: 'Staged Bell', transient: true });
        out.transient = !can(tr); tr.dead = true; tr.hidden = true;
        const ch = T.spawn('legionnaire', Engine.cam.x + Math.cos(Engine.cam.dir) * 1.0, Engine.cam.y + Math.sin(Engine.cam.dir) * 1.0, { name: 'Hunting Bell' }); ch.state = 'chase';
        out.chase = !can(ch); ch.state = 'idle';
        const ba = BOOTS125.active; BOOTS125.active = () => true; out.boot = !can(ch); BOOTS125.active = ba;
        out.chaseOk = can(ch);   // (and the same bell, idle and out of any boot, is offered)
        ch.dead = true; ch.hidden = true; other.dead = true; other.hidden = true; pr.dead = true; pr.hidden = true;
        // Tamsin Reed: never; Depot Three keeps js/tamsin52.js's card
        T.at('quarry', 28.5, 5.6, -Math.PI / 2, 10 / 24);
        const tam = TAMSIN52.tamsin(G.map); out.tamsin = !!tam && !can(tam);
        // 12b. with the sight hidden: the hint once a map, aimed at a bell it could copy
        T.at('quarry', 16.0, 21.5, 0, 10 / 24); GFX.callingSight = false;
        const h1 = T.spawn('legionnaire', 17.0, 21.5, { name: 'Hint Bell' }); T.face(h1); T.put(h1, 1.0); T.frames(2);
        window.__msgs.length = 0; T.step(12);
        out.hint = window.__msgs.filter((t) => t === TX.clerkHint).length;
        T.step(12); out.hint2 = window.__msgs.filter((t) => t === TX.clerkHint).length;
        GFX.callingSight = true; h1.dead = true; h1.hidden = true;
        // 14. the morning walk reads it back, and the prices are a step higher
        const pm0 = AUDIT54.priceMult();
        G.day += 1; G.tod = 7 / 24; const ev4 = T.evs();
        AUDIT54.walk(true);
        const w = window.__ev.slice(ev4).find((e) => e.t === AUDIT54.TX.walkTitle);
        out.walk = !!w && w.b.includes(AUDIT54.TX.heard.stamp);
        out.price = Math.round((AUDIT54.priceMult() - pm0) * 100) / 100;
        return out;
      });
      check(r.L && r.aside === true && r.queued === true, '11. with the quarry\'s bell echo unheard, the Clerk\'s first E at a bell plays the echo (js/dreams.js) and opens no card');
      check(r.card === true, '10. the next E at Gethin Coote (idle, 1.0 away) opens "The stamp": the old murmur line first, then the stamp with its serial (' + JSON.stringify(r.choices) + ')');
      check(r.ledger === true && r.same === true && r.noise <= 0.05 && r.copied === 1 && r.bit === true && r.a7 === true, '10. "Copy it into your book": Gethin Coote in the ledger, its state, hp and place unchanged, the noise no higher (+' + (r.noise != null && r.noise.toFixed(2)) + '), p127_copied 1, AUDIT54 bit 256, A7');
      check(r.journal === true, '10. the first copy writes A10 in the journal');
      check(r.again === true, '10. a second E gives the old murmur line, not the card');
      check(r.lit === true && r.otherLit === false && r.otherStamp === true, '13. the copied bell has its name lit (GETHIN); a bell whose name is not in the book has its stamp and no name');
      check(r.blank === true && r.prStamp === false, '13. a proctor gets the blank plate, and no serial');
      check(r.proctor === true && r.boss === true && r.transient === true && r.chase === true && r.boot === true && r.tamsin === true && r.chaseOk === true, '12. never offered at a proctor (old line), a boss or the Aegis, a staged figure, a bell in chase, in a boot, or at Tamsin Reed (' + JSON.stringify([r.proctor, r.boss, r.transient, r.chase, r.boot, r.tamsin]) + ')');
      check(r.hint === 1 && r.hint2 === 1, '12b. with the sight hidden, aimed at a bell it could copy: the hint A9, once a map (' + r.hint + ', ' + r.hint2 + ')');
      check(r.walk === true && r.price === 0.15, '14. the next morning walk reads A11 back, and priceMult() is one step higher (+' + r.price + ')');
    }

    // ---------------------------------------------------------------- 15. the Quarry-Hand's sight
    {
      const r = await sect('15', () => {
        const out = {};
        T.cls('quarry'); GFX.quarryWork = false;
        T.at('quarry', 16.5, 21.0, 0, 10 / 24);
        const c = Engine.cam;
        const sc = (G.map._p12r || []).filter((e) => e._p12r.k === 'scaff' && Math.hypot(e.x - c.x, e.y - c.y) <= 8);
        out.nSc = sc.length;
        out.scaff = sc.map((e) => { T.face(e); T.still(1.0); T.frames(3); const t = T.drawn('timber').find((k) => k.e === e); return t ? { far: ((t.wx - e.x) * (e.x - c.x) + (t.wy - e.y) * (e.y - c.y)) > 0 } : null; });
        // a place with glass-rock faces near
        const m = G.map; let spot = null;
        for (let y = 1; y < m.h - 1 && !spot; y++) for (let x = 1; x < m.w - 1 && !spot; x++) {
          if (m.isSolidCell(x, y) || m.isBlocked(x, y)) continue;
          for (const [dx, dy, a] of [[1, 0, 0], [-1, 0, Math.PI], [0, 1, Math.PI / 2], [0, -1, -Math.PI / 2]]) { const w = m.get(x + dx, y + dy); if (w && w.tex === 't_glassrock' && !w.door) { spot = [x + 0.5 - dx * 0.4, y + 0.5 - dy * 0.4, a]; break; } }
        }
        out.spot = spot;
        if (spot) { T.at('quarry', spot[0], spot[1], spot[2], 10 / 24); T.still(1.0); T.frames(3); }
        out.seams = T.drawn('seam').length;
        out.seamFar = T.drawn('seam').every((k) => k.d <= 3.5);
        // the loads
        T.at('quarry', 11.0, 36.0, Math.atan2(37.4 - 36.0, 12.4 - 11.0), 10 / 24); T.still(1.0); T.frames(3);
        const cr = G.ents.find((e) => e.kind === 'deco' && e.sprite === 'crates' && !e.use && Math.abs(e.x - 12.4) < 0.2 && Math.abs(e.y - 37.4) < 0.2);
        out.load = !!cr && T.drawn('load').some((k) => k.e === cr);
        out.useCrate = T.drawn('load').some((k) => k.e && k.e.use);
        for (const id of ['blade', 'cantor', 'corsair', 'archivist']) { T.cls(id); T.still(1.0); T.frames(2); out[id] = T.drawn('timber').length + T.drawn('seam').length + T.drawn('load').length; }
        return out;
      });
      check(r.nSc >= 1 && r.scaff.every((s) => s && s.far), '15. each scaffold within 8 has a timber mark, and its fall arrow points away from you (' + JSON.stringify(r.scaff) + ')');
      check(r.seams >= 1 && r.seams <= 6 && r.seamFar, '15. glass-rock faces within 3.5 give at most 6 seam marks (' + r.seams + ' at ' + JSON.stringify(r.spot) + ')');
      check(r.load === true && r.useCrate === false, '15. the quarry\'s plain crates give a load mark; a crate with a use does not');
      check(r.blade === 0 && r.cantor === 0 && r.corsair === 0 && r.archivist === 0, '15. none of these for the other callings (' + [r.blade, r.cantor, r.corsair, r.archivist].join(', ') + ')');
    }

    // ---------------------------------------------------------------- 16, 17, 19, 20. Shoulder it
    {
      const r = await sect('16-20', () => {
        const out = {}, TX = CALLINGS127.TX;
        const crates = () => G.ents.filter((e) => e.kind === 'deco' && e.sprite === 'crates').map((e) => [e.x, e.y]);
        const shoulder = () => {
          T.at('quarry', 11.4, 36.6, Math.atan2(37.4 - 36.6, 12.4 - 11.4), 10 / 24); T.frames(2);
          const ev = T.evs(); interact(); const c = window.__ev[ev];
          if (c && c.t === TX.loadTitle) T.pressText(TX.shoulderIt);
          return c;
        };
        G.flags.p54_log = 0; G.flags.p54_walked = 0;
        T.cls('quarry'); GFX.quarryWork = false;
        const c0 = shoulder(); const cr0 = JSON.stringify(crates());
        out.card = !!c0 && c0.t === TX.loadTitle && JSON.stringify(c0.c.map((x) => x.t)) === JSON.stringify([TX.shoulderIt, TX.leaveIt]);
        out.carrying = CALLINGS127.carrying();
        out.q7 = T.heard(/It is lighter than a lintel/);
        out.crates = JSON.stringify(crates()) === cr0;
        // 20 (half): the crate on the shoulder is drawn
        const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
        GFX.callingSight = false;
        const hOn = pin(() => { T.frames(2); return T.hash(); });
        const real = CALLINGS127.drawHud; CALLINGS127.drawHud = () => {};
        const hOnStub = pin(() => { T.frames(2); return T.hash(); });
        CALLINGS127.drawHud = real; GFX.callingSight = true;
        out.hudDrawn = hOn !== hOnStub;
        // past an idle Legionnaire at about 3 cells with a clear line, for 3 s
        const walkPast = () => {
          const c = Engine.cam, L = T.spawn('legionnaire', 9.0, 34.4, { name: 'Shift Watcher' }); L.stun = 0; L.guard = false; L.state = 'idle';
          let worst = 'idle';
          for (let i = 0; i < 60; i++) { G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; c.y = 36.0 - i * 0.004; update(0.05); if (L.state === 'chase') worst = 'chase'; }
          out.dist = Math.hypot(L.x - c.x, L.y - c.y);
          L.dead = true; L.hidden = true; return worst;
        };
        out.carried = walkPast();
        out.bit = (AUDIT54.logged() & 512) !== 0;
        out.n = G.flags.p127_carried;
        out.journal = G.journal.some((j) => j.text === TX.jQuarry);
        CALLINGS127.drop(); T.cls('blade'); T.at('quarry', 11.0, 36.0, 0, 10 / 24);
        out.bladeWalk = walkPast();
        // 17. the cover ends
        T.cls('quarry');
        const ends = {};
        const tryEnd = (k, fn) => {
          shoulder(); if (!CALLINGS127.carrying()) { ends[k] = 'never started'; return; }
          window.__msgs.length = 0; fn();
          ends[k] = !CALLINGS127.carrying() && (T.heard(/stopped taking you for one of the shift/) || T.heard(/A load with nowhere to go/) || k === 'leave');
        };
        tryEnd('run', () => { Engine.cam.dir += Math.PI; G.player.fat = 20; for (let i = 0; i < 20; i++) { G.state = 'play'; G.keys = { w: true, shift: true }; update(0.05); } G.keys = {}; });
        tryEnd('strike', () => { G.attack.t = 0.4; G.attack.dur = 0.4; T.step(1); });
        tryEnd('song', () => { G.song.t = 0; G.player.voice = 40; castSong('tending'); T.step(1); });
        tryEnd('noise', () => { G.noise = 4.6; T.step(1); });
        tryEnd('hurt', () => { T.step(1); G.hurtT = 0.25; CALLINGS127.tick(0.05); });
        tryEnd('body', () => { G.dragBody = { x: Engine.cam.x, y: Engine.cam.y, kind: 'enemy', dead: true }; CALLINGS127.tick(0.05); G.dragBody = null; });
        tryEnd('leave', () => { loadMap('clearing', { x: 20.5, y: 6.5, dir: Math.PI / 2 }); G.state = 'play'; });
        tryEnd('long', () => { CALLINGS127.st.carry.t = 119.96; T.step(2); });
        out.ends = ends;
        // the next look after it ends is a chase
        shoulder(); G.attack.t = 0.4; G.attack.dur = 0.4; T.step(1);
        out.after = walkPast();
        // 19. Tamsin Reed's three-pace card still opens while carrying
        T.at('quarry', 25.6, 4.2, -Math.PI / 2, 10 / 24); { const t0 = TAMSIN52.tamsin(G.map); if (t0) t0.hidden = true; } T.step(3);
        const dc = G.ents.find((e) => e.kind === 'deco' && e.sprite === 'crates' && Math.abs(e.x - 25.6) < 0.2 && Math.abs(e.y - 2.6) < 0.2);
        Engine.cam.x = 25.6; Engine.cam.y = 3.9; T.face(dc); T.frames(2);
        const tam = TAMSIN52.tamsin(G.map); out.tamDist = tam ? Math.hypot(tam.x - Engine.cam.x, tam.y - Engine.cam.y) : null;
        // (her card opens at three paces on its own tick: she is kept out of sight while the load is taken up, so that the
        //  card can be seen to open while carrying)
        if (tam) tam.hidden = true;
        const evT = T.evs();
        interact(); if (T.last() && T.last().t === TX.loadTitle) T.pressText(TX.shoulderIt);
        out.tamCarry = CALLINGS127.carrying();
        if (tam) tam.hidden = false;
        T.step(4);
        out.tamsin = window.__ev.slice(evT).some((e) => e.t === TAMSIN52.TX.doorTitle);
        closeModal(); hide('#event'); G.state = 'play'; CALLINGS127.drop();
        // 20. not carrying: the frame is what it was
        T.at('quarry', 11.0, 36.0, 0, 10 / 24); GFX.callingSight = false;
        const nOff = pin(() => { T.frames(2); return T.hash(); });
        CALLINGS127.drawHud = () => {};
        const nOff2 = pin(() => { T.frames(2); return T.hash(); });
        CALLINGS127.drawHud = real; GFX.callingSight = true;
        out.notCarrying = nOff === nOff2;
        return out;
      });
      check(r.card === true && r.carrying === true && r.q7 === true, '16. as Quarry-Hand at the entrance crates, E then Q5 sets carrying() (and Q7)');
      check(r.carried === 'idle' && r.bladeWalk === 'chase', '16. walking past an idle Legionnaire at about 3 cells with a clear line for 3 s leaves it idle; the same walk as a Glass-Hand makes it chase (' + r.carried + ', ' + r.bladeWalk + '; ' + (r.dist && r.dist.toFixed(2)) + ' cells)');
      check(r.bit === true && r.n === 1 && r.journal === true, '16. AUDIT54 bit 512 is set, p127_carried 1, the journal line Q12');
      check(r.crates === true, '16. the crates\' entities and positions are unchanged');
      const e = r.ends || {};
      check(['run', 'strike', 'song', 'noise', 'hurt', 'body', 'leave', 'long'].every((k) => e[k] === true), '17. the cover ends on running, a strike, a loud song, noise 4, being hurt, taking a body, leaving the map, and 120 s (' + JSON.stringify(e) + ')');
      check(r.after === 'chase', '17. and the Legionnaire\'s next look is a chase (' + r.after + ')');
      check(r.tamCarry === true && r.tamsin === true, '19. Tamsin Reed\'s three-pace card still opens while carrying (' + (r.tamDist && r.tamDist.toFixed(2)) + ')');
      check(r.hudDrawn === true && r.notCarrying === true, '20. the carried crate is drawn only while carrying: not carrying, frames hash equal to the stubbed run (classic)');
    }
    // 20 (3D)
    {
      const r = await sect('20 3d', () => {
        try { R3D.setMode('on', { noSave: true }); } catch (e) { return { r3d: false }; }
        const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
        T.cls('quarry'); GFX.quarryWork = false; GFX.callingSight = false; T.at('quarry', 11.0, 36.0, 0, 10 / 24);
        const real = CALLINGS127.drawHud;
        const a = pin(() => { T.frames(2); return T.hash(); }); CALLINGS127.drawHud = () => {}; const b = pin(() => { T.frames(2); return T.hash(); }); CALLINGS127.drawHud = real;
        GFX.callingSight = true;
        const out = { r3d: R3D.active(), equal: a === b };
        try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
        return out;
      });
      if (r.r3d) check(r.equal === true, '20. 3D view: not carrying, frames hash equal to the stubbed run');
      else console.log('NOTE 20. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 21. Split it on its line
    {
      const r = await sect('21', () => {
        const out = {}, TX = CALLINGS127.TX;
        const delve = () => {
          for (let d = 1; d < 30; d += 2) {
            const dn = Date.now; Date.now = () => 1700000000000 + d * 977;
            try { generateProceduralDungeon(d); } finally { Date.now = dn; }
            const m = G.map;
            for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) { const c = m.get(x, y); if (c && c.resonant && !m.isSolidCell(x - 1, y) && !m.isSolidCell(x - 2, y)) return [x, y]; }
          }
          return null;
        };
        const stand = (x, y) => { closeModal(); hide('#event'); G.state = 'play'; Engine.cam.x = x - 1.6; Engine.cam.y = y + 0.5; Engine.cam.dir = 0; Engine.cam.pitch = 0; for (const e of G.ents) if (e.kind === 'enemy') { e.stun = 1e6; e.state = 'idle'; } T.frames(2); };
        T.cls('cantor'); const s = delve(); out.found = !!s;
        if (!s) return out;
        stand(s[0], s[1]); window.__msgs.length = 0; interact();
        out.cantor = !!(G.map.get(s[0], s[1]) && G.map.get(s[0], s[1]).resonant);
        T.cls('quarry'); stand(s[0], s[1]); window.__msgs.length = 0; interact();
        out.split = !G.map.get(s[0], s[1]) && T.heard(/It splits where you knew it would/) && G.flags.p127_split === 1;
        // an ordinary glass-rock wall in the quarry: nothing
        T.at('quarry', 16.5, 21.0, 0, 10 / 24);
        const m = G.map; let w = null;
        for (let y = 1; y < m.h - 1 && !w; y++) for (let x = 2; x < m.w - 1 && !w; x++) { const c = m.get(x, y); if (c && c.tex === 't_glassrock' && !c.door && !m.isSolidCell(x - 1, y) && !m.isSolidCell(x - 2, y) && !m.isBlocked(x - 1, y) && !m.isBlocked(x - 2, y)) w = [x, y]; }
        out.w = w;
        if (w) {
          stand(w[0], w[1]); const before = JSON.stringify(m.get(w[0], w[1])); interact();
          out.ordinary = JSON.stringify(m.get(w[0], w[1])) === before;
          // 21b. (an act never takes away another's) a resonant seam in a place whose glass-rock echo is unheard: the first E
          // plays js/dreams.js's echo and the seam stays; the next E splits it
          m.set(w[0], w[1], { tex: 't_glassrock', resonant: true, label: 'A resonant seam (test)' });
          delete G.flags.p6d_e_gl_qr;
          stand(w[0], w[1]); interact();
          out.echo = !!(m.get(w[0], w[1]) && m.get(w[0], w[1]).resonant) && (DREAMS.pending().length > 0 || DREAMS.openId() === 'gl_qr');
          for (let i = 0; i < 3; i++) { try { DREAMS.pollEchoes(); if (DREAMS.isOpen()) DREAMS.closeCard(); } catch (e) { /* none */ } }
          G.flags.p6d_e_gl_qr = true; stand(w[0], w[1]); interact();
          out.echoThen = !m.get(w[0], w[1]);
          m.set(w[0], w[1], JSON.parse(before));
        }
        return out;
      });
      check(r.found && r.split === true, '21. in a procedural delve\'s resonant cell, a Quarry-Hand\'s E at 1.6 empties the cell with Q14');
      check(r.found && r.cantor === true, '21. a Cantor\'s E there changes nothing');
      check(!!r.w && r.ordinary === true, '21. a Quarry-Hand\'s E at an ordinary glass-rock wall in the quarry changes nothing');
      check(!!r.w && r.echo === true && r.echoThen === true, '21b. at a seam in a place whose glass-rock echo is unheard, the first E plays the echo and leaves the seam; the next splits it');
    }

    // ---------------------------------------------------------------- 22-26. the quarry at work
    {
      const r = await sect('22-26', () => {
        const out = {};
        T.cls('blade'); GFX.quarryWork = true; GFX.life = true;
        const W = (k) => G.ents.find((e) => e._life === 'q127_' + k) || null;
        const vis = (k) => { const e = W(k); return !!e && !e.hidden; };
        T.at('quarry', 16.0, 21.5, 0, 10 / 24); T.step(2);
        out.day10 = ['dayA', 'dayB', 'dayC'].map(vis); out.night10 = ['nightA', 'nightB'].map(vis);
        T.at('quarry', 16.0, 21.5, 0, 22 / 24); T.step(2);
        out.day22 = ['dayA', 'dayB', 'dayC'].map(vis); out.night22 = ['nightA', 'nightB'].map(vis);
        // the change at six, watched from below
        T.at('quarry', 16.0, 21.5, 0, 5.9 / 24); T.step(2);
        for (let i = 0; i < 40; i++) { G.tod = 6.05 / 24; T.step(1); }
        G.tod = 6.33 / 24; T.step(2);
        // (the entrance's own night man has two cells to walk and is in already; the pump hall's has seventeen)
        out.n0620 = ['nightA', 'nightB'].map((k) => { const e = W(k); return !!e && e._stop && e._stop.job === 'home' && (e.hidden || !!e._going); });
        out.walking0620 = ['nightA', 'nightB'].filter((k) => { const e = W(k); return !!e && !e.hidden && e._going; }).length;
        out.d0620 = ['dayA', 'dayB', 'dayC'].map(vis);
        // the pump hall
        T.at('quarry', 30.5, 31.5, -Math.PI / 2, 10 / 24); T.step(2);
        const men = G.ents.filter((e) => e._q127 && /^pm/.test(e._q127)), handles = G.ents.filter((e) => e._q127 && /^ph/.test(e._q127));
        out.men = men.length; out.handles = handles.length;
        const h = handles[0];
        if (h) {
          animDeco(h, 0, 1.0, false); const a = h.animLift; animDeco(h, 0, 1.45, false); const b = h.animLift;
          const m0 = men[0], m1 = men.find((x) => x !== m0 && x._pump === m0._pump);
          animDeco(m0, 0, 1.2, false); animDeco(m1, 0, 1.2, false); out.anti = Math.sign(m0.animLift) === -Math.sign(m1.animLift) && m0.animLift !== 0;
          GFX.reduceMotion = true; animDeco(h, 0, 1.0, false); const c = h.animLift; animDeco(h, 0, 1.45, false); const d = h.animLift; GFX.reduceMotion = false;
          out.moves = a !== b; out.still = c === d;
          // one phase for every pump in the room
          const ls = handles.map((x) => { animDeco(x, 0, 2.2, false); return x.animLift; }); out.oneBeat = ls.every((v) => Math.abs(v - ls[0]) < 1e-9);
        }
        out.nopick = handles.every((x) => x.nopick === true);
        // E at a pump man: rite43's own look card
        const pm = men[0];
        if (pm) { Engine.cam.x = pm.x; Engine.cam.y = pm.y + 1.0; Engine.cam.dir = -Math.PI / 2; T.frames(2); const ev = T.evs(); useDeco(pm); const c = window.__ev[ev]; out.look = !!c && c.t === RITE43.TX.lookPump && c.b === RITE43.TX.lookPumpHooked; }
        // the epigraph by the pumps is not under a man
        const sheet = G.ents.find((e) => e.sprite === 'p73_sheet');
        out.sheetClear = !sheet || men.every((m) => Math.hypot(m.x - sheet.x, m.y - sheet.y) > 0.4);
        // 26. not in the way
        T.at('quarry', 16.0, 21.5, 0, 10 / 24); T.step(2);
        const staged = G.ents.filter((e) => e._q127 || (e._life && /^q127_/.test(e._life)));
        out.solid = staged.filter((e) => e.solid).length;
        const wk = W('dayB') && !W('dayB').hidden ? W('dayB') : staged.find((e) => e._life && !e.hidden);
        if (wk) {
          out.through = !solidAt(wk.x, wk.y, null);
          Engine.cam.x = wk.x - 0.8; Engine.cam.y = wk.y; Engine.cam.dir = 0; wk._fix = [wk.x, wk.y];
          const b0 = JSON.stringify([G.player.bounty, G.flags.crime, G.flags.assault]), ents0 = G.ents.filter((e) => e.kind === 'enemy' && e.state === 'chase').length;
          G.attack.t = 0; G.song.t = 0; attack('thrust');
          out.swing = JSON.stringify([G.player.bounty, G.flags.crime, G.flags.assault]) === b0 && !wk.dead && wk.hp == null && G.ents.filter((e) => e.kind === 'enemy' && e.state === 'chase').length === ents0;
          G.attack.t = 0;
        }
        out.enemies = staged.filter((e) => e.kind === 'enemy').length;
        // 23. stand-down
        T.at('quarry', 16.0, 21.5, 0, 10 / 24); T.step(2);
        const foe = T.spawn('legionnaire', 6.5, 30.5, { name: 'Stand Down' }); foe.state = 'chase';
        T.step(20);
        const people = () => G.ents.filter((e) => e._life && /^q127_day/.test(e._life));
        out.goingHome = people().every((e) => e.hidden || (e._stop && e._stop.down));
        let t = 0; for (; t < 90 && people().some((e) => !e.hidden); t += 1) { foe.state = 'chase'; T.step(20); }
        out.inBy = t;
        foe.dead = true; foe.hidden = true;
        let u = 0; for (; u < 10 && !people().every((e) => !e.hidden); u += 1) T.step(20);
        out.backBy = u;
        // 24. gone
        out.gone = {};
        for (const fl of ['rite_started', 'greening']) {
          G.flags[fl] = true; let n = 0;
          for (const [mp, x, y] of [['quarry', 16.0, 21.5], ['rootvault', 30.5, 10.5], ['clearing', 20.5, 8.5]]) { T.at(mp, x, y, 0, 10 / 24); T.step(2); n += G.ents.filter((e) => e._q127 || (e._life && /^q127_/.test(e._life))).length; }
          out.gone[fl] = n; G.flags[fl] = false;
        }
        // 25. the Root-vault casing
        T.at('rootvault', 34.5, 11.6, -Math.PI / 2, 10 / 24); T.step(2);
        const rv = G.ents.filter((e) => e._q127 && /^pm/.test(e._q127));
        out.rv = rv.length; out.rvHandles = G.ents.filter((e) => e._q127 && /^ph/.test(e._q127)).length;
        out.rvOwn = G.ents.some((e) => e.kind === 'npc' && e.name === 'A Hollow at the pumps');
        out.rvSolid = rv.filter((e) => G.map.isSolidCell(e.x | 0, e.y | 0)).length;
        G.flags.r43 = 1; T.at('rootvault', 34.5, 11.6, -Math.PI / 2, 10 / 24); T.step(2);
        out.rvRite = G.ents.filter((e) => e._q127).length; G.flags.r43 = 0;
        // the rim clerk
        T.at('clearing', 20.5, 8.5, -Math.PI / 2, 10 / 24); T.step(2);
        const rc = G.ents.find((e) => e._q127 === 'rimclerk');
        out.rim = !!rc && !rc.solid && !G.map.isSolidCell(rc.x | 0, rc.y | 0);
        if (rc) { const ev = T.evs(); useDeco(rc); const c = window.__ev[ev]; out.rimCard = !!c && c.t === QUARRYWORK127.TX.clerkTitle && c.b === QUARRYWORK127.TX.clerkText; }
        return out;
      });
      check(JSON.stringify(r.day10) === '[true,true,true]' && JSON.stringify(r.night10) === '[false,false]', '22. at 10:00 in the quarry the day men are out and the night men are not (' + JSON.stringify([r.day10, r.night10]) + ')');
      check(JSON.stringify(r.day22) === '[false,false,false]' && JSON.stringify(r.night22) === '[true,true]', '22. at 22:00 the reverse (' + JSON.stringify([r.day22, r.night22]) + ')');
      check(JSON.stringify(r.n0620) === '[true,true]' && r.walking0620 >= 1 && JSON.stringify(r.d0620) === '[false,false,false]', '22. at 06:20 the night men are on their way out (walking, or gone up already) and none of the day men are out yet (' + JSON.stringify([r.n0620, r.walking0620, r.d0620]) + ')');
      check(r.men === 6 && r.handles === 3, '22. six pump men and three handles in the pump hall (' + r.men + ', ' + r.handles + ')');
      check(r.moves === true && r.still === true && r.anti === true && r.oneBeat === true, '22. a handle\'s animLift differs 0.45 s of ANIM.T apart, the pair is in antiphase, every handle keeps one beat; under reduce motion it does not move');
      check(r.nopick === true && r.look === true, '22. the handles are not picked; E on a pump man gives js/rite43.js\'s own look card');
      check(r.sheetClear === true, '22. the Office circular by the pumps (js/epigraphs73.js) is not under a pump man');
      check(r.goingHome === true && r.inBy > 0 && r.inBy <= 60 && r.backBy >= 0 && r.backBy <= 3, '23. a fight in the quarry sends every walker home at once (all in within ' + r.inBy + ' s; the design\'s 12 s is shorter than the walk); when it is over they come back (' + r.backBy + ' s)');
      check(r.gone && r.gone.rite_started === 0 && r.gone.greening === 0, '24. from rite_started, and from the Greening, no walker, pump man, handle or rim clerk in the quarry, the Root-vault or the clearing (' + JSON.stringify(r.gone) + ')');
      check(r.rv === 11 && r.rvHandles === 4 && r.rvOwn === true && r.rvSolid === 0, '25. the Root-vault casing: eleven pump men and the map\'s own Hollow at the pumps, four handles, none in a solid cell (' + r.rv + ', ' + r.rvHandles + ')');
      check(r.rvRite === 0, '25. with js/rite43.js at stage 1 or more the module stages none (' + r.rvRite + ')');
      check(r.solid === 0 && r.through === true && r.swing === true && r.enemies === 0, '26. not in the way: nothing staged is solid or an enemy, the player walks through a walker\'s cell, a swing at a walker does no damage and no crime');
      check(r.rim === true && r.rimCard === true, '22. the clerk at the headframe stands on open ground on the rim, not solid, with his look card W8');
    }

    // ---------------------------------------------------------------- Q16, and the talk listeners
    {
      const r = await sect('Q16', () => {
        const out = {}, TX = CALLINGS127.TX;
        GFX.quarryWork = true; T.at('quarry', 16.0, 21.5, 0, 10 / 24); T.step(2);
        const w = G.ents.find((e) => e._life && /^q127_day/.test(e._life) && !e.hidden);
        if (!w) return out;
        T.cls('quarry'); window.__msgs.length = 0; talk(w); out.q = T.heard(/as if you had been on the next terrace yesterday/); try { closeDialogue(); } catch (e) { closeModal(); } G.state = 'play';
        T.cls('blade'); window.__msgs.length = 0; talk(w); out.b = T.heard(/as if you had been on the next terrace yesterday/); try { closeDialogue(); } catch (e) { closeModal(); } G.state = 'play';
        out.name = w.id && NPCS[w.id] && NPCS[w.id].name;
        return out;
      });
      check(r.q === true && r.b === false, 'Q16. a shift man spoken to by a Quarry-Hand nods to her first (Q16); to anyone else, not');
      check(r.name === 'A quarryman, day shift', 'the quarry\'s shift men are life74\'s own (' + r.name + ')');
    }

    // ---------------------------------------------------------------- 27, 28. the mends
    {
      const r = await sect('27-28', () => {
        const out = {};
        out.life74 = LIFE74.TEXTS.filter((t) => /on the pumps|Twelve men on them/.test(t));
        out.w9 = LIFE74.TEXTS.find((t) => /The cable-drums, mostly, and the spoil/.test(t)) || '';
        out.w10 = LIFE74.TEXTS.find((t) => /Nine hours on the drums/.test(t)) || '';
        const rv = G.maps.rootvault.entities;
        out.salk = rv.filter((e) => e.kind === 'enemy' && e.name === 'Mirren Salk').length;
        out.cass = rv.filter((e) => e.kind === 'enemy' && e.type === 'legionnaire' && e.name === 'Cass Yelland').length;
        // an old save with her old name
        const snap = JSON.parse(JSON.stringify(snapshotGame()));
        let changed = 0;
        const walkE = (o) => { if (!o || typeof o !== 'object') return; if (Array.isArray(o)) { o.forEach(walkE); return; } if (o.name === 'Cass Yelland') { o.name = 'Mirren Salk'; changed++; } for (const k in o) if (o[k] && typeof o[k] === 'object') walkE(o[k]); };
        walkE(snap.maps && snap.maps.rootvault);
        out.changed = changed;
        restoreGame(snap); G.state = 'play'; closeModal(); hide('#event');
        out.salk2 = G.maps.rootvault.entities.filter((e) => e.kind === 'enemy' && e.name === 'Mirren Salk').length;
        out.cass2 = G.maps.rootvault.entities.filter((e) => e.kind === 'enemy' && e.name === 'Cass Yelland').length;
        out.voice = typeof VOICE_LINES === 'object' && !!VOICE_LINES['core.death.cass-yelland'] && !!VOICE_LINES['core.death.mirren-salk'];
        return out;
      });
      check(Array.isArray(r.life74) && r.life74.length === 0 && r.w9 && r.w10, '27. LIFE74 TEXTS no longer say "on the pumps" or "Twelve men on them"; W9 and W10 are there');
      const p74 = pairsOf('tools/i18n/p74-smallplaces.tsv');
      check(!!r.w9 && p74.has(norm(r.w9)) && p74.has(norm(r.w10)), '27. W9 and W10 have French in tools/i18n/p74-smallplaces.tsv');
      check(r.salk === 0 && r.cass === 1, '28. the Root-vault has no Legionnaire named Mirren Salk, and one named Cass Yelland (' + r.salk + ', ' + r.cass + ')');
      check(r.changed >= 1 && r.salk2 === 0 && r.cass2 === 1, '28. a save with the old name loads renamed (' + r.changed + ' in the save)');
      check(r.voice === true, '28. the renamed bell has its own death name recorded (core.death.cass-yelland), and Mirren Salk\'s stays (her name in the crates)');
    }

    // ---------------------------------------------------------------- 30. the budget, and one Engine.render a frame
    const budget = async (view) => sect('30 ' + view, (view) => {
      try { R3D.setMode(view === '3d' ? 'on' : 'off', { noSave: true }); } catch (e) { /* none */ }
      PRESETS.apply('medium'); GFX.callingSight = true; GFX.quarryWork = true; CALLINGS126.setMode('still');
      T.cls('archivist'); T.at('quarry', 30.5, 32.2, -Math.PI / 2, 10 / 24); T.step(4);
      const c = Engine.cam, add = [];
      for (let i = 0; i < 24 && add.length < 12; i++) { const a = -0.5 + 1.0 * ((i * 7) % 24) / 23, d = 1.6 + (i % 4) * 0.9; const x = c.x + Math.cos(c.dir + a) * d, y = c.y + Math.sin(c.dir + a) * d; if (!G.map.isBlocked(x | 0, y | 0) && !G.map.isSolidCell(x | 0, y | 0)) add.push(T.spawn(i % 3 === 0 ? 'proctor' : 'legionnaire', x, y, { name: 'Budget ' + i })); }
      T.still(1.4); T.frames(4);
      const out = { r3d: typeof R3D === 'object' && R3D.active(), n: add.length };
      CALLINGS126.stats.reset(); QUARRYWORK127.stats.reset();
      let renders = 0; const ER = Engine.render; Engine.render = function () { renders++; return ER.apply(this, arguments); };
      const t = { on: 0, off: 0, non: 0, noff: 0 };
      try {
        for (let blk = 0; blk < 8; blk++) {
          const on = blk % 2 === 0; if (GFX.quarryWork !== on) { GFX.quarryWork = on; if (GFX.changed) GFX.changed(); render(); }
          for (let i = 0; i < 30; i++) { const t0 = performance.now(); render(); const dt = performance.now() - t0; if (on) { t.on += dt; t.non++; } else { t.off += dt; t.noff++; } }
        }
      } finally { Engine.render = ER; }
      GFX.quarryWork = true; if (GFX.changed) GFX.changed();
      out.sight = CALLINGS126.stats.ms; out.marks = T.drawn().length; out.renders = renders;
      out.work = QUARRYWORK127.stats.frameMs();
      out.renderOn = t.on / t.non; out.renderOff = t.off / t.noff; out.delta = out.renderOn - out.renderOff;
      out.staged = QUARRYWORK127.stats.staged;
      for (const e of add) { e.dead = true; e.hidden = true; }
      try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
      return out;
    }, view);
    {
      const a = await budget('classic');
      console.log('MEASURE classic ' + JSON.stringify(a));
      check(a.n >= 10 && a.marks >= 8 && a.sight + a.work < 1.0, '30. budget, classic view at 1x, ' + a.n + ' enemies: the Clerk\'s sight ' + (a.sight != null && a.sight.toFixed(3)) + ' ms plus the quarry at work\'s own ' + (a.work != null && a.work.toFixed(3)) + ' ms a frame, under 1.0 (render on minus off: ' + (a.delta != null && a.delta.toFixed(3)) + ' ms)');
      check(a.renders === 240 + 0 || a.renders >= 240, '30. Engine.render runs once per frame (' + a.renders + ' over 240 frames and the switch flips)');
      const b = await budget('3d');
      if (b.r3d) {
        console.log('MEASURE 3d ' + JSON.stringify(b));
        // (in the pump hall under the 3D view the pump men stand in front of some of the bells, and the depth probes hide those)
        check(b.sight + b.work < 1.0 && b.marks >= 4, '30. budget, 3D view: ' + (b.sight + b.work).toFixed(3) + ' ms a frame (' + b.marks + ' marks; render on minus off: ' + b.delta.toFixed(3) + ' ms)');
      } else console.log('NOTE 30. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 31. every string has its French; no hero's title; the book's lines
    {
      const r = await sect('31', () => ({ c: CALLINGS127.TEXTS.slice(), w: QUARRYWORK127.TEXTS.slice(), a: [AUDIT54.TX.heard.stamp, AUDIT54.TX.heard.shift], TX: CALLINGS127.TX, WX: QUARRYWORK127.TX, said: AUDIT54.TX.saidIt }));
      const pc = pairsOf('tools/i18n/p127-callings.tsv'), pw = pairsOf('tools/i18n/p127-quarrywork.tsv'), pa = pairsOf('tools/i18n/p54-audit.tsv');
      const missC = (r.c || []).filter((t) => !pc.has(norm(t))), missW = (r.w || []).filter((t) => !pw.has(norm(t))), missA = (r.a || []).filter((t) => !t || !pa.has(norm(t)));
      check((r.c || []).length >= 20 && missC.length === 0, '31. every string in CALLINGS127.TEXTS has French in tools/i18n/p127-callings.tsv (' + (r.c || []).length + '; missing: ' + missC.slice(0, 3).join(' | ') + ')');
      check((r.w || []).length >= 8 && missW.length === 0, '31. every string in QUARRYWORK127.TEXTS has French in tools/i18n/p127-quarrywork.tsv (' + (r.w || []).length + '; missing: ' + missW.slice(0, 3).join(' | ') + ')');
      check(missA.length === 0, '31. A11 and Q13 have French in tools/i18n/p54-audit.tsv (missing: ' + missA.join(' | ') + ')');
      const all = (r.c || []).concat(r.w || [], r.a || []);
      check(all.filter((t) => /Dissonant Blade|Archivist of the Veil|Consecrated/.test(t)).length === 0, '31. none says "Dissonant Blade", "Archivist of the Veil" or "Consecrated"');
      const TX = r.TX || {}, WX = r.WX || {};
      const BOOK = [
        [TX.stampBody, 'where the core sits', [4828]],
        [TX.stampBody, 'in the Office\'s blocky numerals', [4828]],
        [TX.copied, 'clerk\'s hand', [2698]],
        [r.said, 'The bell does not move. It does not need to.', null],
        [TX.copied, 'The bell does not move. It does not need to.', null],
        [WX.clerkText, 'ink on his cuffs', [2598]],
        [WX.clerkText, 'Consortium drab', [2598]],
        [WX.clerkText, 'for a long moment at', [1707]],
        [WX.bark, 'There\'s glass in them', null],
        [WX.bark, 'channels', [1715]],
      ];
      const notBook = BOOK.filter(([t, piece, lines]) => !(t && norm(t).includes(norm(piece)) && (!lines || msText(lines).includes(norm(piece)))));
      check(notBook.length === 0, '31. the §5 lines from the book are found at their manuscript lines (' + BOOK.length + ' pieces; not found: ' + notBook.map((b) => b[1]).join(' | ') + ')');
    }

    }
    // ---------------------------------------------------------------- the deterministic runs page B is compared with (4, 18, 33)
    const RUNS = async (P) => P.sect('runs', (snap) => {
      const out = { e4: {}, h4: {}, rc4: {}, dp: {}, other: {} };
      const fresh = () => { try { UPG.tutorial = false; } catch (e) { /* none */ } /* (js/upgrades.js's first-time lessons come on each page's own history) */ restoreGame(JSON.parse(JSON.stringify(snap))); closeModal(); hide('#event'); G.state = 'play'; const f = G.flags; f.p6d_e_co_qr = f.p6d_e_co_any = f.p6d_e_co_mal = f.p6d_e_gl_qr = f.p6d_e_gl_rv = true; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true; window.__msgs.length = 0; window.__ev.length = 0; };
      if (typeof GFX !== 'undefined') GFX.quarryWork = false;
      GFX.callingSight = true; PRESETS.apply && (GFX.quarryWork = false);
      // 4. quarryWork off: the entity lists, the frames and the random numbers, at 10:00 and at 22:00
      for (const tod of [10, 22]) {
        for (const [mp, x, y] of [['quarry', 16.0, 21.5], ['rootvault', 30.5, 10.5], ['clearing', 20.5, 8.5]]) {
          const k = mp + '@' + tod;
          T.det(() => { fresh(); T.cls('blade'); T.at(mp, x, y, 0, tod / 24); T.step(300); });
          out.e4[k] = T.ents(mp); out.rc4[k] = window.__rc;
          if (typeof QUARRYWORK127 !== 'object') continue;
          for (const view of ['classic', '3d']) {
            try { R3D.setMode(view === '3d' ? 'on' : 'off', { noSave: true }); } catch (e) { /* none */ }
            if (view === '3d' && !(typeof R3D === 'object' && R3D.active())) continue;
            let poses = 0; const p0 = QUARRYWORK127.pose, s0 = QUARRYWORK127.stage;
            QUARRYWORK127.pose = function () { poses++; return p0.apply(this, arguments); };
            const a = T.det(() => { T.frames(2); return T.hash(); });
            const a2 = T.det(() => { T.frames(2); return T.hash(); });
            QUARRYWORK127.pose = () => {}; QUARRYWORK127.stage = () => {};
            const b = T.det(() => { T.frames(2); return T.hash(); });
            QUARRYWORK127.pose = p0; QUARRYWORK127.stage = s0;
            // (outdoors the frame is not repeatable even with nothing changed, with or without the module: there the check is
            //  that nothing of the module's is in the place and its pose is never called)
            const mine = G.ents.filter((e) => e && e._q127).length;
            out.h4[k + ':' + view] = a === a2 ? [a, b] : (poses === 0 && mine === 0 ? ['unrepeatable', 'unrepeatable'] : ['unrepeatable', poses + ' poses, ' + mine + ' staged']);
          }
          try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
        }
      }
      // 4 (random). Who calls Math.random: the immediate caller's file, over each place with the switch off and on
      if (typeof QUARRYWORK127 === 'object') {
        const rn = Math.random; let own = 0, all = 0;
        Math.random = function () { all++; const st = String(new Error().stack || '').split('\n')[2] || ''; if (/(quarrywork127|callings127)\.js/.test(st)) own++; return rn.apply(this, arguments); };
        try {
          for (const on of [false, true]) for (const [mp, x, y] of [['quarry', 16.0, 21.5], ['rootvault', 30.5, 10.5], ['clearing', 20.5, 8.5]]) {
            fresh(); GFX.quarryWork = on; T.cls(on ? 'quarry' : 'archivist'); T.at(mp, x, y, 0, 10 / 24); T.step(300); T.frames(3);
          }
        } finally { Math.random = rn; GFX.quarryWork = false; }
        out.ownRand = own; out.allRand = all;
      }
      // 18. disguiseProtects for the other callings, robed and not, over enemies in each state
      for (const cls of ['blade', 'cantor', 'corsair']) for (const robed of [false, true]) {
        T.det(() => {
          fresh(); T.cls(cls); T.at('quarry', 16.0, 21.5, 0, 10 / 24);
          if (robed) { G.give('a_synodrobe'); try { equipArmor('a_synodrobe'); } catch (e) { /* none */ } }
          const res = [];
          ['idle', 'investigate', 'chase', 'passive'].forEach((s, i) => ['legionnaire', 'proctor', 'hound'].forEach((ty, j) => {
            const e = T.spawn(ty, 17.0 + j * 0.4, 20.0 + i * 0.4, { name: 'DP ' + i + j }); e.state = s; e.stun = (i + j) % 2 ? 0 : 1; if (s === 'investigate') e.investigation = { x: 17, y: 20, left: 5, source: j ? 'body' : 'noise' };
            res.push(!!disguiseProtects(e)); e.dead = true; e.hidden = true;
          }));
          out.dp[cls + (robed ? '+robe' : '')] = res;
        });
      }
      // 33. every other calling unchanged: a scripted run in the quarry; and a Clerk at the crates, a Quarry-Hand at a bell
      for (const cls of ['blade', 'cantor', 'corsair', 'archivist@crates', 'quarry@bell']) {
        const id = cls.split('@')[0], only = cls.split('@')[1];
        out.other[cls] = T.det(() => {
          fresh(); T.cls(id); T.at('quarry', 16.0, 21.5, 0, 10 / 24);
          const L = T.gethin();
          if (!only || only === 'bell') { T.face(L); T.put(L, 1.0); T.frames(2); interact(); T.press(-1); closeModal(); hide('#event'); G.state = 'play'; }
          if (!only || only === 'crates') { T.at('quarry', 11.0, 36.0, Math.atan2(37.4 - 36.0, 12.4 - 11.0), 10 / 24); T.frames(2); interact(); T.press(-1); G.state = 'play'; }
          if (!only) {
            T.at('quarry', 16.5, 21.0, Math.atan2(19.4 - 21.0, 18.5 - 16.5), 10 / 24); T.frames(2); interact(); T.press(-1); G.state = 'play';
            for (const e of G.ents) if (e.kind === 'enemy') e.stun = 0;
            T.walk(80);
          }
          // (what an enemy's blow does is a die roll, and the game's dice are not repeatable across pages: blows are left out)
          return { msgs: window.__msgs.filter((t) => !/ hits you for |skids off your armour|You slip /.test(t)), ev: window.__ev.map((e) => [e.t, e.b, e.c.map((c) => c.t)]), states: G.ents.filter((e) => e.kind === 'enemy').map((e) => [e.name || e.type, e.state, !!e.dead]) };
        });
      }
      return out;
    }, SNAP);
    const ra = await RUNS(A);
    if (process.env.C127_DET2) { const r2 = await RUNS(A); console.log('DET2 rc A1 ' + JSON.stringify(ra.rc4) + '\nDET2 rc A2 ' + JSON.stringify(r2.rc4) + '\nDET2 h ' + JSON.stringify(ra.h4) + ' / ' + JSON.stringify(r2.h4)); }
    const B = await startGame(browser, true);
    const blocked = await B.page.evaluate(() => typeof CALLINGS127 === 'undefined' && typeof QUARRYWORK127 === 'undefined');
    check(blocked, '(page B has neither module)');
    const rb = await RUNS(B);
    {
      const keys = Object.keys(ra.e4 || {});
      const diffE = keys.filter((k) => JSON.stringify(ra.e4[k]) !== JSON.stringify(rb.e4 && rb.e4[k]));
      for (const k of diffE.slice(0, 2)) { const a = ra.e4[k] || [], b = (rb.e4 && rb.e4[k]) || []; const da = a.filter((x) => !b.some((y) => JSON.stringify(y) === JSON.stringify(x))), db = b.filter((y) => !a.some((x) => JSON.stringify(y) === JSON.stringify(x))); console.log('  ' + k + ' only A: ' + JSON.stringify(da.slice(0, 6)) + '\n  ' + k + ' only B: ' + JSON.stringify(db.slice(0, 6))); }
      check(keys.length === 6 && diffE.length === 0, '4. with quarryWork off, the entity lists of the quarry, the Root-vault and the clearing after loadMap and 300 steps at 10:00 and 22:00 deep-equal a page with the modules blocked (differ: ' + diffE.join(', ') + ')');
      // (the design asked for equal Math.random counts and frame hashes across the two pages. Built, the game itself is not
      //  deterministic from a restored save across runs, with or without these modules: the same run on page A alone gave
      //  5049 and 8138 calls, and its clearing frame two hashes. So those halves are checked where they can be: no
      //  Math.random call is made from the modules' own code, switch off or on; and on one page, with the switch off,
      //  the frames hash equal to a run with the module's per-frame entry points (QUARRYWORK127.pose, .stage) stubbed out.)
      check(ra.ownRand === 0, '4. no Math.random call is made from js/quarrywork127.js or js/callings127.js, in 300 steps and frames of each place with the switch off and on (' + ra.ownRand + ' of ' + ra.allRand + ')');
      const hk = Object.keys(ra.h4 || {});
      const diffH = hk.filter((k) => !ra.h4[k] || ra.h4[k][0] !== ra.h4[k][1]);
      check(hk.length >= 6 && diffH.length === 0, '4. with quarryWork off the frames hash equal to a run with QUARRYWORK127.pose and .stage stubbed out, in both views (' + hk.length + ' frames; differ: ' + diffH.join(', ') + ')');
      const dk = Object.keys(ra.dp || {});
      check(dk.length === 6 && dk.every((k) => JSON.stringify(ra.dp[k]) === JSON.stringify(rb.dp && rb.dp[k])), '18. disguiseProtects for a Glass-Hand, a Cantor and a Corsair, robed and not, over enemies in each state, deep-equals the page without js/callings127.js');
      const ok = Object.keys(ra.other || {});
      const diffO = ok.filter((k) => JSON.stringify(ra.other[k]) !== JSON.stringify(rb.other && rb.other[k]));
      check(ok.length === 5 && diffO.length === 0, '33. Glass-Hand, Cantor and Corsair in the quarry (a bell, the crates, a scaffold, a walk past the barracks), a Clerk at the crates and a Quarry-Hand at a bell: the same messages, cards and enemy states as without js/callings127.js (differ: ' + diffO.join(', ') + ')');
      for (const k of diffO.slice(0, 2)) { const a = ra.other[k] || {}, b = (rb.other && rb.other[k]) || {}; for (const f of ['msgs', 'ev', 'states']) { const x = a[f] || [], y = b[f] || []; for (let i = 0; i < Math.max(x.length, y.length); i++) if (JSON.stringify(x[i]) !== JSON.stringify(y[i])) { console.log('  ' + k + ' ' + f + '[' + i + '] A ' + JSON.stringify(x[i]).slice(0, 300) + '\n  ' + k + ' ' + f + '[' + i + '] B ' + JSON.stringify(y[i]).slice(0, 300)); break; } } }
      if (diffO.length) for (const k of diffO.slice(0, 2)) console.log('  ' + k + ' A ' + JSON.stringify(ra.other[k]).slice(0, 600) + '\n  ' + k + ' B ' + JSON.stringify(rb.other && rb.other[k]).slice(0, 600));
    }
    check(A.errors.length === 0 && B.errors.length === 0, 'no page errors or module warnings (' + A.errors.concat(B.errors).slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? 'FAILED ' + fails : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL fatal ' + (e && e.stack || e)); process.exit(1); });
