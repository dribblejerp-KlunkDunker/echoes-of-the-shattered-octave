// PREVIEW_URL=http://127.0.0.1:4229 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/callings126.test.js
// Phase 126: the callings, part one (js/callings126.js). One mechanism, two parts: a SIGHT drawn over the world on the
// HUD layer, anchored to each thing's on-screen rect (e._screen, filled by both renderers), that comes up when you stand
// still (or always, or never: the Options row has three settings); and an ACT on the use key. Three callings register:
//   Glass-Hand (blade): the cores in the Legionnaires' bells, the proctors' hand-presses, the Factor's lenses; "Take it
//                       by the bell" (the tideline +3, at most 99; the hand rings, and the bells that hear it tell Vosk).
//   Cantor:             who is humming and how true; the murmur held under the Narrow (above the Hush, below the rest);
//                       the tending note hummed into a companion's hands; one more choice at Hob Wendle's step.
//   Corsair:            loads and lines (the Kestrel at her mast, the scaffolds and chandeliers, an air93 deck); a hook
//                       slipped by hand on an air93 flight; hand-cant to Mags on cargo night.
// The checks are the design's §6.4 (story/Game Layer/Phase 126 - The callings, part one (design, for the builder).md),
// numbered as there. Where the design was wrong about the code the check follows the code, with a comment.
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.PREVIEW_URL || 'http://127.0.0.1:4229';
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0;
const check = (ok, m) => { if (ok) console.log('PASS ' + m); else { fails++; console.log('FAIL ' + m); } };

// the manuscript, by line (1-based, as the design cites it)
const MS = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md').split('\n');
const norm = (s) => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<\/?(i|b|em)>/gi, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const msText = (lines) => norm(lines.map((n) => MS[n - 1] || '').join(' '));

(async () => {
  // ---------------------------------------------------------------- 24, 25 (static half)
  const html = src('index.html');
  const tags = [...html.matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]);
  check(tags[tags.length - 1] === 'js/mast123.js' && tags.indexOf('js/callings126.js') > tags.indexOf('js/boots125.js') && tags.indexOf('js/boots125.js') >= 0,
    '24. index.html: js/callings126.js comes after js/boots125.js, and js/mast123.js is still the last script tag');
  let mod = ''; try { mod = src('js/callings126.js'); } catch (e) { mod = ''; }
  check(mod.length > 0 && !/Math\.random/.test(mod), '4. js/callings126.js exists and has no Math.random in it');
  check(!/Engine\.render\s*\(/.test(mod), '23. js/callings126.js never calls Engine.render');
  const tsvPairs = new Map();
  let tsv = ''; try { tsv = src('tools/i18n/p126-callings.tsv'); } catch (e) { tsv = ''; }
  for (const l of tsv.split('\n')) { if (!l.trim() || l.startsWith('#')) continue; const c = l.split('\t'); if (c.length === 2 && c[0] && c[1]) tsvPairs.set(norm(c[0]), c[1]); }
  check(tsv.length > 0 && tsv.split('\n').filter((l) => l.trim() && !l.startsWith('#')).every((l) => l.split('\t').length === 2), '25. tools/i18n/p126-callings.tsv exists, two columns a row');
  check(/hand: 128/.test(src('js/audit54.js')) && /'callingSight'/.test(src('js/presets.js')) && /'callingSight'/.test(src('test/presets.test.js')), '2, 10. js/audit54.js has BITS.hand = 128; js/presets.js LOW_OFF and test/presets.test.js cheapOff have callingSight');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    page.setDefaultTimeout(600000);
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /callings126/.test(m.text())) errors.push(m.text()); });
    await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'off', cap: 80 })); localStorage.removeItem('octave.switch.callingSight'); localStorage.removeItem('octave.callings126.mode'); localStorage.removeItem('octave.air93.v1'); } catch (e) { /* none */ } });
    await page.goto(URL_ + '/index.html?nosw=1', { timeout: 600000 });
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 600000, polling: 500 });
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Callings Tester');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();   // Glass-Hand (blade)
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
    const ok = await page.evaluate(() => typeof CALLINGS126 === 'object' && !!CALLINGS126);
    check(ok, '1. CALLINGS126 is loaded');
    if (!ok) throw new Error('no CALLINGS126: the rest cannot run');

    await page.evaluate(() => {
      window.requestAnimationFrame = () => 0;   // only T.step ticks the game, only T.frame draws
      closeModal(); hide('#event'); G.state = 'play';
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      const CLS = (id) => CLASSES.find((c) => c.id === id);
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; update(dt || 0.05); } },
        walk(n) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = { w: (i % 40) < 20, s: (i % 40) >= 20 }; G.player.hp = G.player.hpMax; update(0.05); } G.keys = {}; },
        still(s) { T.step(Math.round(s / 0.05)); },
        frame() { render(); },
        frames(n) { CALLINGS126.gather(); for (let i = 0; i < (n || 2); i++) render(); },   // (the sight gathers its targets every quarter second in update; a test frame gathers first)
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        press(i) { const e = T.last(); if (!e) return false; const k = i < 0 ? e.c.length + i : (i || 0); if (e.c[k]) { if (e.c[k].f) e.c[k].f(); return true; } return false; },
        pressText(t) { const e = T.last(); if (!e) return false; const c = e.c.find((x) => x.t === t); if (c) { if (c.f) c.f(); return true; } return false; },
        cls(id) { const p = G.player; p.cls = CLS(id); p.glassed = id === 'blade'; if (id === 'blade' && !(p.glass > 0)) p.glass = 42; if (id === 'cantor') { p.voiceMax = Math.max(p.voiceMax || 0, 40); p.voice = 40; } G.glassLock = 0; },
        at(map, x, y, dir, tod) {
          G.state = 'paused'; if (tod != null) G.tod = tod; loadMap(map, { x, y, dir: dir || 0 }); G.fadeT = 0; if (tod != null) G.tod = tod;
          Engine.cam.pitch = 0; Engine.cam.bob = 0; G.vel.x = G.vel.y = 0; try { Weather.hold('clear'); } catch (e) { /* none */ }
          for (const e of G.ents) if (e && e.kind === 'enemy') { e.state = 'idle'; e.stun = 1e6; }
          G.noise = 1; G.stillT = 0; G.murmurT = 0; G.state = 'play';
        },
        face(e) { const c = Engine.cam; c.dir = Math.atan2(e.y - c.y, e.x - c.x); },
        put(e, d) { const c = Engine.cam; Engine.cam.x = e.x - Math.cos(c.dir) * d; Engine.cam.y = e.y - Math.sin(c.dir) * d; },
        spawn(type, x, y, o) { const e = hydrate(Object.assign({ kind: 'enemy', type, x, y }, o || {})); e.state = 'idle'; e.stun = 1e6; G.map.entities.push(e); if (G.ents !== G.map.entities && !G.ents.includes(e)) G.ents.push(e); return e; },
        drawn(kind) { return CALLINGS126.lastDrawn().filter((r) => !kind || r.kind === kind); },
        evs() { return window.__ev.length; },
      };
      // the sight on, "when you stand still"; the classic view to begin with
      GFX.callingSight = true; CALLINGS126.setMode('still');
      try { R3D.setMode('off', { noSave: true }); } catch (e) { /* no R3D */ }
      const f = G.flags; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true;
    });
    const sect = async (name, fn, arg) => { try { return await page.evaluate(fn, arg); } catch (e) { fails++; console.log('FAIL section ' + name + ' threw: ' + String(e && e.message || e).split('\n').slice(0, 4).join(' / ')); return {}; } };

    // ---------------------------------------------------------------- 1. the table, and Phase 127's door
    {
      const r = await sect('1', () => {
        const out = { ids: CALLINGS126.ids().slice() };
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        CALLINGS126.register('dummy', {
          radius: 6,
          targets(add) { const c = Engine.cam; add({ pt: [c.x + Math.cos(c.dir) * 2, c.y + Math.sin(c.dir) * 2, 0.5], kind: 'dot', k: 'ahead' }); },
          draw: { dot(g, t, fade, rec) { g.dot(t.px, t.py, '#ffffff', fade); rec.k = t.k; return true; } },
          acts: [], lines: {},
        });
        out.ids2 = CALLINGS126.ids().slice();
        const was = G.player.cls; G.player.cls = { id: 'dummy', name: 'Dummy' };
        T.still(1.4); T.frames(2);
        out.dummy = T.drawn('dot').filter((d) => d.calling === 'dummy').length;
        G.player.cls = was; CALLINGS126.unregister('dummy');
        out.ids3 = CALLINGS126.ids().slice();
        // the first-sight line comes from the registered lines.first (bit 16, penitent, if nothing has registered it yet)
        if (CALLINGS126.ids().includes('penitent')) out.firstSkip = true;
        else {
          const LINE = 'A test calling\'s first sight.';
          CALLINGS126.register('penitent', {
            radius: 6,
            targets(add) { const c = Engine.cam; add({ pt: [c.x + Math.cos(c.dir) * 2, c.y + Math.sin(c.dir) * 2, 0.5], kind: 'dot', k: 'ahead' }); },
            draw: { dot(g, t, fade) { g.dot(t.px, t.py, '#ffffff', fade); return true; } }, acts: [], lines: { first: LINE },
          });
          const seen0 = G.flags.p126_seen; G.flags.p126_seen = (Number(seen0) | 0) & ~16;
          const was2 = G.player.cls; G.player.cls = { id: 'penitent', name: 'Test' };
          const _m = window.__msgs.length; T.still(1.6); T.still(1.0);
          out.first = window.__msgs.slice(_m).filter((t) => t === LINE).length;
          G.player.cls = was2; CALLINGS126.unregister('penitent'); G.flags.p126_seen = seen0;
        }
        return out;
      });
      // (taught in Phase 127: js/callings127.js registers the Catalogue Clerk and the Quarry-Hand in this table, so the list
      //  begins with the three of Phase 126 and goes on; the dummy is added last and taking it away gives back the list before)
      check(JSON.stringify((r.ids || []).slice(0, 3)) === JSON.stringify(['blade', 'cantor', 'corsair']), '1. ids() begins [blade, cantor, corsair] (' + JSON.stringify(r.ids) + ')');
      check(r.ids2 && r.ids2.length === r.ids.length + 1 && r.ids2[r.ids2.length - 1] === 'dummy' && r.dummy >= 1, '1. register("dummy") adds a calling last, and the sight draws its marks (' + r.dummy + ')');
      check(JSON.stringify(r.ids3) === JSON.stringify(r.ids), '1. and it can be taken away again');
      // (Phase 127) a calling's first-sight line is its registered lines.first, not a table of Phase 126's three
      if (r.firstSkip) console.log('NOTE 1. penitent is registered: the first-sight door was checked by test/callings127 instead');
      else check(r.first === 1, '1. a calling registered with lines.first says that line the first time its sight comes up (' + r.first + ')');
    }

    // ---------------------------------------------------------------- 2. the switch, the presets, the Options row
    {
      const r = await sect('2', () => {
        const out = {};
        out.inFX = GFX.FX.includes('callingSight');
        out.per = {};
        for (const p of ['original', 'low', 'medium', 'high', 'ultra']) { PRESETS.apply(p); out.per[p] = GFX.callingSight; }
        PRESETS.apply('medium');
        GFX.callingSight = false; if (GFX.changed) GFX.changed();
        out.stored = (() => { try { return localStorage.getItem('octave.switch.callingSight'); } catch (e) { return 'x'; } })();
        GFX.callingSight = true; if (GFX.changed) GFX.changed();
        renderAccessibilityMenu();
        const b = document.getElementById('gfx-callingSight126');
        out.row = !!b;
        out.seq = [];
        if (b) {
          CALLINGS126.setMode('still'); GFX.callingSight = false; if (GFX.changed) GFX.changed(); CALLINGS126.syncRow();
          for (let i = 0; i < 4; i++) { out.seq.push([GFX.callingSight, CALLINGS126.mode(), b.textContent]); b.click(); }
        }
        closeModal(); G.state = 'play';
        GFX.callingSight = true; CALLINGS126.setMode('still');
        return out;
      });
      check(r.inFX, '2. GFX.FX has callingSight');
      check(r.per && r.per.original === false && r.per.low === false && r.per.medium === true && r.per.high === true && r.per.ultra === true, '2. after PRESETS.apply it is off in original and low, on in medium, high and ultra (' + JSON.stringify(r.per) + ')');
      check(r.stored === 'false', '2. PRESETS.keep stores it (' + r.stored + ')');
      const s = r.seq || [];
      check(r.row && s.length === 4 && s[0][0] === false && s[1][0] === true && s[1][1] === 'still' && s[2][0] === true && s[2][1] === 'always' && s[3][0] === false && s[0][2] !== s[1][2] && s[1][2] !== s[2][2],
        '2. the Options row gfx-callingSight126 has three settings, in turn: off, when you stand still, always (' + JSON.stringify(s) + ')');
    }

    // ---------------------------------------------------------------- 3. off draws exactly what it drew before (classic, then 3D)
    const hashRun = async (view) => sect('3 ' + view, (view) => {
      const want = view === '3d';
      try { R3D.setMode(want ? 'on' : 'off', { noSave: true }); } catch (e) { /* none */ }
      const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
      const hashOf = () => {
        let h = 0x811c9dc5 | 0;
        const eat = (d) => { for (let i = 0; i < d.length; i += 3) h = Math.imul(h ^ d[i], 16777619) | 0; };
        const c = Engine.ctx.canvas; eat(Engine.ctx.getImageData(0, 0, c.width, c.height).data);
        if (want && typeof R3D === 'object' && R3D.active()) { const p = R3D.readPixels(); if (p) eat(p.data); }
        return h >>> 0;
      };
      T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
      T.still(3); pin(() => T.frames(3));
      const out = { r3d: typeof R3D === 'object' && R3D.active(), view };
      const real = CALLINGS126.draw;
      GFX.callingSight = false;
      const off1 = pin(() => { T.frames(2); return hashOf(); });
      CALLINGS126.draw = function () { return undefined; };
      const off2 = pin(() => { T.frames(2); return hashOf(); });
      CALLINGS126.draw = real;
      GFX.callingSight = true;
      const on1 = pin(() => { T.frames(2); return hashOf(); });
      out.marks = T.drawn().length;
      out.equal = off1 === off2; out.differs = on1 !== off1;
      try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
      return out;
    }, view);
    {
      const a = await hashRun('classic');
      check(a.equal === true && a.r3d === false, '3. classic view: with the switch off the frames hash equal to a run with CALLINGS126.draw stubbed out');
      check(a.differs === true && a.marks > 0, '3. (and the hash can tell: with it on, the same frame differs; ' + a.marks + ' marks)');
      const b = await hashRun('3d');
      if (b.r3d) {
        check(b.equal === true, '3. 3D view: with the switch off the frames hash equal to a run with CALLINGS126.draw stubbed out');
        check(b.differs === true && b.marks > 0, '3. (3D: with it on, the same frame differs; ' + b.marks + ' marks)');
      } else console.log('NOTE 3. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 4. stillness, and no random numbers
    {
      const r = await sect('4', () => {
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        const out = {};
        T.walk(40); out.walking = CALLINGS126.sense();
        let t = 0; G.keys = {};
        for (; t < 3 && CALLINGS126.sense() < 1; t += 0.05) T.step(1, 0.05);
        out.toOne = t;
        let m = 0;
        for (; m < 2 && CALLINGS126.sense() > 0; m += 0.05) { G.state = 'play'; G.keys = { w: true }; update(0.05); }
        G.keys = {};
        out.toZero = m;
        // 300 frames of the sight on, and 300 gathers: the module draws no random number
        T.still(1.5);
        const rn = Math.random; let calls = 0; Math.random = function () { calls++; return rn.apply(this, arguments); };
        try { for (let i = 0; i < 300; i++) { CALLINGS126.gather(); CALLINGS126.draw(); } } finally { Math.random = rn; }
        out.calls = calls; out.sense = CALLINGS126.sense();
        // always: no wait
        CALLINGS126.setMode('always'); T.walk(10); out.always = CALLINGS126.sense(); CALLINGS126.setMode('still');
        return out;
      });
      check(r.walking === 0, '4. sense() is 0 while walking (' + r.walking + ')');
      check(r.toOne > 0 && r.toOne <= 1.1, '4. it reaches 1 within 1.1 s of standing still (' + (r.toOne && r.toOne.toFixed(2)) + ' s)');
      check(r.toZero > 0 && r.toZero <= 0.3, '4. and is back to 0 within 0.3 s of moving (' + (r.toZero && r.toZero.toFixed(2)) + ' s)');
      check(r.calls === 0 && r.sense === 1, '4. Math.random is called zero times by the module over 300 frames of the sight on (' + r.calls + ')');
      check(r.always === 1, '4. set to always, the sight is up while walking (' + r.always + ')');
    }

    // ---------------------------------------------------------------- 5. the cores, and walls
    {
      const r = await sect('5', () => {
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        const c = Engine.cam, m = G.map;
        // a second Legionnaire just behind the nearest wall in some direction, within 6
        let hid = null;
        for (let a = 0; a < 16 && !hid; a++) {
          const dir = a * Math.PI / 8, dx = Math.cos(dir), dy = Math.sin(dir); let wall = false;
          for (let s = 0.5; s < 5.5; s += 0.25) {
            const x = c.x + dx * s, y = c.y + dy * s; if (x < 1 || y < 1 || x >= m.w - 1 || y >= m.h - 1) break;
            const solid = m.isSolidCell(x | 0, y | 0);
            if (solid) wall = true;
            else if (wall && s > 1.5) { c.dir = dir; hid = T.spawn('legionnaire', x, y, { name: 'Behind Wall' }); break; }
          }
        }
        T.still(1.4); T.frames(3);
        const cores = T.drawn('core');
        const legs = G.ents.filter((e) => e.kind === 'enemy' && e.type === 'legionnaire' && !e.dead && !e.hidden && e._screen && Math.hypot(e.x - c.x, e.y - c.y) <= 6);
        const out = { hid: !!hid, nLegs: legs.length, nCores: cores.length };
        out.visibleAll = legs.filter((e) => e !== hid && CALLINGS126.visible(e)).every((e) => cores.some((k) => k.e === e));
        out.visCount = legs.filter((e) => e !== hid && CALLINGS126.visible(e)).length;
        out.hidDrawn = !!hid && cores.some((k) => k.e === hid);
        out.hidScreen = !!(hid && hid._screen);
        // a clear one in front, to be sure there is something to see
        const front = T.spawn('legionnaire', c.x + Math.cos(c.dir + Math.PI) * 2.0, c.y + Math.sin(c.dir + Math.PI) * 2.0, { name: 'Clear Ahead' });
        c.dir += Math.PI; T.frames(3);
        out.front = T.drawn('core').some((k) => k.e === front);
        for (const id of ['cantor', 'corsair']) { T.cls(id); T.still(1.0); T.frames(2); out[id] = T.drawn('core').length; }
        front.dead = true; front.hidden = true; if (hid) { hid.dead = true; hid.hidden = true; }
        T.cls('blade');
        return out;
      });
      check(r.front === true && r.visibleAll === true, '5. Glass-Hand in the quarry: a core for each live Legionnaire within 6 and in view (' + r.visCount + ' in view)');
      check(r.hid && r.hidScreen && r.hidDrawn === false, '5. none for one behind a wall (the depth probes)' + (r.hid ? '' : ': no wall found to hide one behind'));
      check(r.cantor === 0 && r.corsair === 0, '5. and none for any other calling (cantor ' + r.cantor + ', corsair ' + r.corsair + ')');
    }

    // ---------------------------------------------------------------- 5b. the same under the 3D view (its depth read-back is a frame late and
    // waits on the GPU, so the frames are drawn with real pauses between; its billboards sit a little nearer than their rects)
    {
      const st0 = await sect('5b stage', () => {
        try { R3D.setMode('on', { noSave: true }); } catch (e) { return { r3d: false }; }
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        const c = Engine.cam, m = G.map; let hid = null, dir0 = 0;
        for (let a = 0; a < 32 && !hid; a++) {
          const dir = a * Math.PI / 16, dx = Math.cos(dir), dy = Math.sin(dir); let wall = false;
          for (let s = 0.5; s < 5.5; s += 0.25) { const x = c.x + dx * s, y = c.y + dy * s; if (m.isSolidCell(x | 0, y | 0)) wall = true; else if (wall && s > 2.2) { hid = [x, y]; dir0 = dir; break; } }
        }
        c.dir = dir0 - 0.25;
        window.__h5 = hid ? T.spawn('legionnaire', hid[0], hid[1], { name: 'Behind Wall Three' }) : null;
        const x = c.x + Math.cos(c.dir + 0.22) * 2.6, y = c.y + Math.sin(c.dir + 0.22) * 2.6;
        window.__f5 = !m.isBlocked(x | 0, y | 0) ? T.spawn('legionnaire', x, y, { name: 'Clear Three' }) : null;
        T.still(1.4); T.frames(2);
        return { r3d: R3D.active(), hid: !!window.__h5, front: !!window.__f5 };
      });
      if (st0.r3d) {
        for (let i = 0; i < 6; i++) { await page.waitForTimeout(80); await page.evaluate(() => T.frames(1)); }
        const r = await sect('5b', () => {
          const out = { hidScreen: !!(window.__h5 && window.__h5._screen) };
          out.front = !!window.__f5 && T.drawn('core').some((k) => k.e === window.__f5);
          out.hid = !!window.__h5 && T.drawn('core').some((k) => k.e === window.__h5);
          for (const e of [window.__h5, window.__f5]) if (e) { e.dead = true; e.hidden = true; }
          try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
          return out;
        });
        check(st0.hid && st0.front && r.front === true && r.hidScreen && r.hid === false, '5b. 3D view: a core on a Legionnaire in view, none on one behind a wall (' + JSON.stringify(r) + ')');
      } else console.log('NOTE 5b. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 6. the presses and the lenses
    {
      const r = await sect('6', () => {
        T.cls('blade'); const out = {};
        T.at('clearing', 27.5, 16.5, 0, 0.45);
        const pr = G.ents.find((e) => e.type === 'proctor' && Math.abs(e.x - 30.5) < 0.2 && Math.abs(e.y - 16.5) < 0.2);
        const leg = T.spawn('legionnaire', 29.5, 17.6, { name: 'Press Test' });
        T.still(1.4); T.frames(3);
        out.pr = !!pr; out.press = !!pr && T.drawn('press').some((k) => k.e === pr);
        out.legPress = T.drawn('press').some((k) => k.e === leg);
        leg.dead = true; leg.hidden = true;
        T.at('greenhall', 9.5, 5.5, 0, 0.45);
        const vosk = G.ents.find((e) => e.kind === 'npc' && e.id === 'vosk');
        T.still(1.4); T.frames(3);
        out.lens = !!vosk && T.drawn('lens').some((k) => k.e === vosk);
        return out;
      });
      check(r.pr && r.press === true, '6. a proctor in the clearing at (30.5, 16.5) gets a press mark');
      check(r.legPress === false, '6. a Legionnaire does not');
      check(r.lens === true, '6. Vosk in the Greenhall gets a lens');
    }

    // ---------------------------------------------------------------- 7, 8, 9, 10. Take it by the bell
    {
      const r = await sect('7-10', () => {
        const out = {}, TX = CALLINGS126.TX;
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        const L = T.spawn('legionnaire', 17.2, 21.5, { name: 'Wenna Ffair' });
        T.face(L); T.put(L, 1.0); T.frames(2);
        // 7a (integration, found by test/dreams): the first time anyone listens at a bell in the quarry, js/dreams.js
        // plays the quarry's echo, "The name it was made from". A Glass-Hand hears it too: the act stands aside for
        // that one use, and is there from the next.
        delete G.flags.p6d_e_co_qr; delete G.flags.p6d_e_co_any;
        out.dreamsOn = typeof DREAMS === 'object' && DREAMS.on();
        const evA = T.evs(), gA = G.player.glass;
        interact();
        out.aside = T.evs() === evA && G.player.glass === gA && !L.dead;
        out.echoQueued = DREAMS.pending().length > 0 || DREAMS.openId() === 'co_qr';
        for (let i = 0; i < 3; i++) { try { DREAMS.pollEchoes(); if (DREAMS.isOpen()) DREAMS.closeCard(); } catch (e) { /* none */ } }
        G.flags.p6d_e_co_qr = true; G.flags.p6d_e_co_any = true; closeModal(); hide('#event'); G.state = 'play'; T.face(L); T.put(L, 1.0); T.frames(2);
        const others = G.ents.filter((e) => e.kind === 'enemy' && e !== L).map((e) => [e, e.state]);
        const g0 = G.player.glass, n0 = G.noise, ev0 = T.evs();
        interact();
        const card = T.last();
        out.card = T.evs() === ev0 + 1 && card.t === TX.byBell && card.b.includes(TX.drink) && card.b.includes(coreMurmur(L));
        out.choices = card ? card.c.map((c) => c.t) : [];
        T.pressText(TX.fist);
        out.dead = !!L.dead && G.ledger.some((x) => x.name === 'Wenna Ffair');
        out.glass = G.player.glass - g0; out.bells = G.flags.p126_bells; out.noise = G.noise - n0;
        out.others = others.every(([e, s]) => e.state === s);
        out.g7 = T.heard(/smooth and cold the size of an apple/);
        out.ringing = CALLINGS126.ringing() > 0;
        // 8. never past 99
        G.player.glass = 98;
        const L2 = T.spawn('legionnaire', Engine.cam.x + Math.cos(Engine.cam.dir) * 1.0, Engine.cam.y + Math.sin(Engine.cam.dir) * 1.0, { name: 'Ivo Marten' });
        T.frames(2); interact(); T.pressText(TX.letGo);
        out.at99 = G.player.glass; out.alive = !G.dead && G.player.hp > 0; out.letGo = L2.stun >= 3 && !L2.dead && T.heard(/You take your hand away/);
        L2.dead = true; L2.hidden = true;
        // 10. heard in turn: a second Legionnaire within 7 with a clear line, inside the minute
        const bits0 = AUDIT54.logged(), pm0 = AUDIT54.priceMult();
        const W = T.spawn('legionnaire', Engine.cam.x - Math.cos(Engine.cam.dir) * 3, Engine.cam.y - Math.sin(Engine.cam.dir) * 3, { name: 'Ears Open' });
        T.step(12, 0.05);
        out.logged = (AUDIT54.logged() & 128) !== 0 && !(bits0 & 128);
        G.day += 1; G.tod = 7 / 24; const ev1 = T.evs();
        AUDIT54.walk(true);
        const w = window.__ev.slice(ev1).find((e) => e.t === AUDIT54.TX.walkTitle);
        out.walkA1 = !!w && w.b.includes(AUDIT54.TX.heard.hand);
        out.price = Math.round((AUDIT54.priceMult() - pm0) * 100) / 100;
        W.dead = true; W.hidden = true;
        // 9. a proctor: the press comes off his belt first
        T.at('clearing', 27.5, 16.5, 0, 0.45);
        const pr = G.ents.find((e) => e.type === 'proctor' && Math.abs(e.x - 30.5) < 0.2);
        pr.stun = 0; T.face(pr); T.put(pr, 1.0); T.frames(2);
        const ev2 = T.evs(); interact();
        const pc = T.last();
        out.press = T.evs() === ev2 + 1 && pc.b.includes(TX.pressed) && G.glassLock === 8 && !pr.dead && !(pr.stun > 0);
        T.press(0);
        // locked: not offered, and E says so
        T.at('quarry', 16.0, 21.5, 0, 0.45); G.glassLock = 5;
        const L3 = T.spawn('legionnaire', 17.2, 21.5, { name: 'Locked Out' }); T.face(L3); T.put(L3, 1.0); T.frames(2);
        const ev3 = T.evs(); window.__msgs.length = 0; interact();
        out.locked = T.evs() === ev3 && T.heard(/Your glass arm is locked rigid, ringing flat\./);
        G.glassLock = 0; L3.dead = true; L3.hidden = true;
        // Tamsin Reed: her own card
        T.at('quarry', 28.5, 5.6, -Math.PI / 2, 0.45);
        const tam = TAMSIN52.tamsin(G.map); tam.stun = 1e6;
        for (let k = 0; k < 16; k++) {   // from where she can be reached at her own level (the depot's floor is not the terrace's)
          const a = k * Math.PI / 8; Engine.cam.x = tam.x - Math.cos(a) * 1.1; Engine.cam.y = tam.y - Math.sin(a) * 1.1; Engine.cam.dir = a;
          if (G.map.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0)) continue;
          T.step(3); Engine.cam.x = tam.x - Math.cos(a) * 1.1; Engine.cam.y = tam.y - Math.sin(a) * 1.1; Engine.cam.dir = a;   // (the eye settles to the floor's height in update)
          T.frames(2); if (Engine.pick(G.ents, USE_RANGE) === tam) break;
        }
        const ev4 = T.evs(); interact();
        out.tamsin = !!tam && T.evs() === ev4 + 1 && T.last().t === TAMSIN52.TX.doorTitle;
        // the Cantor: the old murmur line
        T.cls('cantor'); T.at('quarry', 16.0, 21.5, 0, 0.45);
        const L4 = T.spawn('legionnaire', 17.2, 21.5, { name: 'Not For You' }); T.face(L4); T.put(L4, 1.0); T.frames(2);
        const ev5 = T.evs(); window.__msgs.length = 0; interact();
        out.cantor = T.evs() === ev5 && T.heard(/Stand close, and you can hear someone murmuring inside the bell/);
        L4.dead = true; L4.hidden = true; T.cls('blade');
        return out;
      });
      check(r.dreamsOn && r.aside && r.echoQueued, '7a. with the quarry\'s bell echo not yet heard, the first E plays the echo and the act stands aside (dreams ' + r.dreamsOn + ', aside ' + r.aside + ', queued ' + r.echoQueued + ')');
      check(r.card === true, '7. E at a quarry Legionnaire (not Tamsin) opens the By the bell card: the drink, then the voice inside');
      check(r.dead === true && r.glass === 3 && r.bells === 1 && r.noise <= 0.05 && r.others === true, '7. "Put your fist…" leaves it dead, its name in the ledger, the tideline +3 (' + r.glass + '), p126_bells 1 (' + r.bells + '), the noise no higher (+' + (r.noise != null && r.noise.toFixed(2)) + '), every other enemy\'s state unchanged (' + r.others + ')');
      check(r.g7 === true && r.ringing === true, '7. the core cracks under your knuckles, and the hand rings afterward');
      check(r.at99 === 99 && r.alive === true, '8. at a tideline of 98 the act leaves it at 99, not 101; the player is alive (' + r.at99 + ')');
      check(r.letGo === true, '8. "Let go" stuns it for 3 s and leaves it standing');
      check(r.press === true, '9. on a proctor the same E gives the hand-press: G.glassLock 8, the proctor alive and not stunned');
      check(r.locked === true, '9. with the arm locked the card is not offered, and E says the arm is locked');
      check(r.tamsin === true, '9. at Tamsin Reed, js/tamsin52.js\'s own card opens instead');
      check(r.cantor === true, '9. as Cantor, E on a Legionnaire gives the old murmur line');
      check(r.logged === true, '10. heard in turn: a second Legionnaire within 7 with a clear line, inside the minute, logs AUDIT54 bit 128');
      check(r.walkA1 === true && r.price === 0.15, '10. the next morning walk\'s card reads it back (A1), and her prices are one step higher (+' + r.price + ')');
    }

    // ---------------------------------------------------------------- 7b (Phase 127, the design's check 29). js/dreams.js's coreEcho fires for
    // any core enemy not chasing, and proctors are core: a Glass-Hand's first E at a proctor, with the place's echo unheard,
    // must queue the echo and not lock the arm; the next E brings the press off his belt
    {
      const r = await sect('7b', () => {
        const out = {}, TX = CALLINGS126.TX;
        T.cls('blade'); T.at('clearing', 27.5, 16.5, 0, 0.45);
        const pr = G.ents.find((e) => e.type === 'proctor' && Math.abs(e.x - 30.5) < 0.2 && Math.abs(e.y - 16.5) < 0.2);
        if (!pr) return out;
        pr.stun = 0; T.face(pr); T.put(pr, 1.0); T.frames(2);
        const seenAny = G.flags.p6d_e_co_any; delete G.flags.p6d_e_co_any; G.glassLock = 0;
        const ev0 = T.evs(); interact();
        out.aside = T.evs() === ev0 && !(G.glassLock > 0);
        out.queued = DREAMS.pending().length > 0 || DREAMS.openId() === 'co_any';
        for (let i = 0; i < 3; i++) { try { DREAMS.pollEchoes(); if (DREAMS.isOpen()) DREAMS.closeCard(); } catch (e) { /* none */ } }
        G.flags.p6d_e_co_any = true; closeModal(); hide('#event'); G.state = 'play';
        pr.stun = 0; T.face(pr); T.put(pr, 1.0); T.frames(2);
        const ev1 = T.evs(); interact();
        out.locked = T.evs() === ev1 + 1 && T.last().b.includes(TX.pressed) && G.glassLock === 8;
        T.press(0); G.glassLock = 0; if (seenAny == null) G.flags.p6d_e_co_any = true;
        return out;
      });
      check(r.aside === true && r.queued === true, '7b. a Glass-Hand\'s first E at a proctor, with the place\'s echo unheard, queues the echo and does not lock the arm');
      check(r.locked === true, '7b. the second E locks it (the hand-press)');
    }

    // ---------------------------------------------------------------- 11. who is humming, and how true
    {
      const r = await sect('11', () => {
        T.cls('cantor'); const out = { hum: [] };
        const crossings = [[22.6, 24.4], [23.0, 44.6], [50.6, 22.6]];
        T.at('oakhaven', 20.5, 24.4, 0, 20 / 24); T.step(4);
        for (const [x, y] of crossings) {
          T.at('oakhaven', x - 3, y, 0, 20 / 24); T.step(4);
          const h = G.ents.find((e) => e.kind === 'npc' && e.id === 'n28_hummer' && Math.hypot(e.x - x, e.y - y) < 0.6);
          if (h) { T.face(h); }
          T.still(1.4); T.frames(3);
          const th = h ? T.drawn('thread').find((k) => k.e === h) : null;
          out.hum.push(th ? { amp: th.amp, h: th.h, col: th.col } : null);
        }
        const one = (id, x, y) => {
          T.at('oakhaven', x, y - 2.5, Math.PI / 2, 14 / 24); T.step(2);
          const e = G.ents.find((o) => o.kind === 'npc' && o.id === id); if (!e) return null;
          Engine.cam.x = e.x; Engine.cam.y = e.y - 2.5; Engine.cam.dir = Math.PI / 2;   // (they keep their own hours about the town)
          for (let k = 0; k < 16 && G.map.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0); k++) { const a = k * Math.PI / 8; Engine.cam.x = e.x - Math.cos(a) * 2.5; Engine.cam.y = e.y - Math.sin(a) * 2.5; }
          T.face(e); T.still(1.4); T.frames(3);
          const th = T.drawn('thread').find((k) => k.e === e); return th ? { amp: th.amp, h: th.h } : null;
        };
        out.bettany = one('bettany', 51.5, 17.6);
        out.tam = one('tam', 54.2, 47.6);
        // Lyra, with no voice: a breath, no thread
        G.flags.lyra_voice = false;
        let lm = null; for (const id in G.maps) { const e = (G.maps[id].entities || []).find((o) => o && o.kind === 'npc' && o.id === 'lyra' && !o.until); if (e) { lm = [id, e.x, e.y]; break; } }
        if (!lm) for (const id in G.maps) { const e = (G.maps[id].entities || []).find((o) => o && o.kind === 'npc' && o.id === 'lyra'); if (e) { lm = [id, e.x, e.y]; break; } }
        if (lm) {
          T.at(lm[0], lm[1] - 2, lm[2], 0, 14 / 24);
          const ly = G.ents.find((o) => o.kind === 'npc' && o.id === 'lyra');
          if (ly && !ly.hidden) {
            T.face(ly); T.put(ly, 2); T.still(1.4); T.frames(3);
            out.lyraBreath = T.drawn('breath').some((k) => k.e === ly); out.lyraThread = T.drawn('thread').some((k) => k.e === ly);
          } else out.lyraHidden = true;
        }
        out.lyraMap = lm && lm[0];
        // lamps: a lit one has a whistle, a dark one has none. (Which are lit is a pure function of the hour: js/narrow28.js
        // relights them on every Engine.render, so the lamplighter's half-done round gives a lit one and a dark one.)
        const B = NARROW28.BAL, tod = (B.dusk + B.lampHours * 0.5) / 24;
        T.at('oakhaven', 20.5, 24.4, 0, tod); T.step(2); G.tod = tod; T.frames(1);
        const lamps = G.ents.filter((e) => e.kind === 'deco' && e.sprite === 'lamp' && !e.drylamp && !e.dead);
        const lit = lamps.filter((e) => !e._n28off), dark = lamps.filter((e) => e._n28off);
        out.nLit = lit.length; out.nDark = dark.length;
        let pair = null;
        let pd = 1e9;
        for (const a of lit) for (const b of dark) { const d = Math.hypot(a.x - b.x, a.y - b.y); if (d > 1.2 && d < pd) { pd = d; pair = [a, b]; } }
        out.pd = pd;
        if (pair) {   // each in turn, looked at from three paces
          const look = (e) => { const c = Engine.cam; for (let k = 0; k < 16; k++) { const ang = k * Math.PI / 8; c.x = e.x - Math.cos(ang) * 3; c.y = e.y - Math.sin(ang) * 3; c.dir = ang; if (G.map.isBlocked(c.x | 0, c.y | 0)) continue; T.frames(2); if (e._screen && CALLINGS126.visible(e)) break; } T.frames(2); return !!e._screen; };
          const [a, b] = pair;
          const sa = look(a); out.lit = T.drawn('whistle').some((k) => k.e === a);
          const sb = look(b); out.dark = T.drawn('whistle').some((k) => k.e === b);
          out.litScreen = sa && sb;
        }
        return out;
      });
      const hum = (r.hum || []).filter(Boolean);
      check(hum.length === 3, '11. Cantor at 20:00 in Oakhaven: a thread on each of the three night-hummers (' + hum.length + ')');
      check(!!r.bettany && hum.length > 0 && hum.every((h) => r.bettany.amp > 2 * h.amp), '11. Bettany\'s amplitude is more than twice a hummer\'s (' + JSON.stringify(r.bettany) + ' vs ' + JSON.stringify(hum.map((h) => h.amp)) + ')');
      check(!!r.tam && hum.length > 0 && hum.every((h) => r.tam.h < h.h), '11. Old Tam\'s height is under every hummer\'s (' + JSON.stringify(r.tam) + ')');
      check(r.lyraBreath === true && r.lyraThread === false, '11. Lyra with lyra_voice false has a breath mark and no thread (' + r.lyraMap + (r.lyraHidden ? ', hidden' : '') + ')');
      check(r.lit === true && r.dark === false, '11. a dark hush-lamp has no whistle, a lit one has one (' + r.nLit + ' lit, ' + r.nDark + ' dark, ' + (r.pd && r.pd.toFixed(1)) + ' apart; both on screen: ' + r.litScreen + ')');
    }

    // ---------------------------------------------------------------- 12. the hum under the Narrow
    {
      const r = await sect('12', () => {
        const out = {}, hold = (n) => { let maxN = 0, maxS = 0, seen = 0; for (let i = 0; i < n; i++) { if (G.murmurT < 0.6) castSong('murmur'); G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; update(0.05); maxN = Math.max(maxN, G.noise); maxS = Math.max(maxS, G.stillT); if (G.murmurT > 0) seen++; } return { maxN, maxS, seen, n }; };
        GFX.stillTint = true;
        T.cls('cantor'); T.at('quarry', 16.0, 21.5, 0, 0.45); G.noise = 1;
        const a = hold(400); out.cantor = a; out.hud = HUD11.stillSeconds;
        T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45); G.noise = 1;
        const b = hold(100); out.blade = b;
        T.cls('cantor'); T.at('quarry', 16.0, 21.5, 0, 0.45); G.noise = 1; G.flags.c68 = 4;
        const c = hold(100); out.cutter = c; G.flags.c68 = 0;
        GFX.stillTint = false;
        return out;
      });
      check(!!r.cantor && r.cantor.maxS === 0 && r.cantor.maxN <= 1.75, '12. a Cantor murmuring while still for 20 s in the quarry keeps G.stillT at 0 and G.noise at most 1.75 (' + JSON.stringify(r.cantor) + ')');
      check(!!r.cantor && r.cantor.seen === r.cantor.n && r.hud === 0, '12. and G.murmurT > 0 is still what js/hud11.js sees (its stillness clock stays at ' + r.hud + ')');
      check(!!r.blade && r.blade.maxN >= 2.5, '12. a Glass-Hand doing the same gets the old 2.6 (' + (r.blade && r.blade.maxN.toFixed(2)) + ')');
      check(!!r.cutter && r.cutter.maxN >= 2.5, '12. in js/cutter68.js stage 4 the Cantor\'s murmur is the ordinary one (' + (r.cutter && r.cutter.maxN.toFixed(2)) + ')');
    }

    // ---------------------------------------------------------------- 13, 14. Hob Wendle's step, Orla Hale's chair
    {
      const r = await sect('13-14', () => {
        const out = {}, TX = CALLINGS126.TX, GT = GRAFT67.TX;
        const hob = (cls, voice, way) => {
          T.cls(cls); if (voice != null) G.player.voice = voice;
          G.flags.p67 = 2; G.flags.p67_way = way || 'lyra'; delete G.flags.p67_hob;
          const ev0 = T.evs(); GRAFT67.hobCard(); const e = window.__ev[ev0]; return e ? e.c.map((c) => c.t) : null;
        };
        out.old = [GT.hobHand, GT.hobBreath];
        out.cantor = hob('cantor', 40);
        const v0 = G.player.voice, ev1 = T.evs();
        T.press(-1);
        const after = window.__ev[ev1];
        out.hum = { cost: v0 - G.player.voice, flag: G.flags.p67_hob, body: !!after && after.b.includes(GT.hobDidHum) && after.b.includes(GT.hobEnd) };
        out.corsair = hob('corsair');
        out.low = hob('cantor', 5);
        out.watch = hob('cantor', 40, 'watch');
        out.oldWatch = [GT.hobWatch, GT.hobAway];
        // Orla
        const orla = (cls) => { T.cls(cls); G.flags.p67 = 4; G.flags.p67_way = 'lyra'; const ev0 = T.evs(); GRAFT67.orlaCard(); T.press(0); const e = window.__ev[ev0 + 1]; return e ? e.b : null; };
        out.orlaC = orla('cantor'); out.orlaB = orla('blade'); out.orlaK = orla('corsair');
        out.orla2 = GT.orla2; out.c8 = TX.orla;
        G.flags.p67 = 0;
        return out;
      });
      // (the design counted "six choices" and "the old five": HOB_CHOICES has one or two choices for each way, five in all;
      //  a Cantor at Hob's step gets the old choices for the way she is walking, and the hum last)
      check(!!r.cantor && JSON.stringify(r.cantor.slice(0, -1)) === JSON.stringify(r.old) && r.cantor[r.cantor.length - 1] === 'Hum the Root note into his hands, low', '13. Hob, way lyra, as Cantor with voice 40: the old choices and C6 last (' + JSON.stringify(r.cantor) + ')');
      check(!!r.hum && r.hum.cost === 8 && r.hum.flag === 'hum' && r.hum.body === true, '13. taking it costs 8 voice, sets p67_hob to hum, and shows C7 then the book\'s end (' + JSON.stringify(r.hum) + ')');
      check(JSON.stringify(r.corsair) === JSON.stringify(r.old), '13. as Corsair the list deep-equals the old one');
      check(JSON.stringify(r.low) === JSON.stringify(r.old), '13. as Cantor with voice 5 it is the old one');
      check(JSON.stringify(r.watch) === JSON.stringify(r.oldWatch), '13. keeping to the lane and watching, the Cantor has nobody\'s hands to hold: the old two');
      check(typeof r.orlaC === 'string' && r.orlaC.includes(r.c8) && r.orlaC.startsWith(r.orla2), '14. Orla: as Cantor the second card\'s body has C8 after the book\'s');
      check(r.orlaB === r.orla2 && r.orlaK === r.orla2, '14. as any other calling it is byte for byte the old body');
    }

    // ---------------------------------------------------------------- 15. the tending note, into a companion's hands
    {
      const r = await sect('15', () => {
        const out = {}, TX = CALLINGS126.TX;
        T.cls('cantor'); G.flags.part4 = true; T.at('deepwoods', 27.5, 30.5, 0, 0.45);
        partyJoin('kaelen');
        const comp = G.ents.find((e) => e.companion);
        out.comp = !!comp;
        if (!comp) return out;
        comp.x = Engine.cam.x + 1.0; comp.y = Engine.cam.y; Engine.cam.dir = 0; T.frames(2);
        G.party.hp = 10; const hp0 = G.party.hp, v0 = G.player.voice; G.noise = 1; const n0 = G.noise;
        const ev0 = T.evs(); interact();
        const card = window.__ev[ev0];
        out.offered = !!card && card.c.some((c) => c.t === TX.tendAct);
        if (out.offered) T.pressText(TX.tendAct);
        out.hp = G.party.hp - hp0; out.voice = v0 - G.player.voice; out.noise = Math.round((G.noise - n0) * 100) / 100;
        out.c4 = T.heard(/hum the tending note into them/);
        // a hound hunting within 10: not offered
        G.party.hp = 10;
        const hd = T.spawn('hound', Engine.cam.x - 5, Engine.cam.y); hd.state = 'chase'; hd.stun = 1e6;
        T.frames(2); const ev1 = T.evs(); interact();
        const c2 = window.__ev[ev1];
        out.hunted = !(c2 && c2.c && c2.c.some((c) => c.t === TX.tendAct));
        hd.dead = true; hd.hidden = true;
        // short of voice
        G.player.voice = 3; T.frames(2); const ev2 = T.evs(); interact(); const c3 = window.__ev[ev2]; window.__msgs.length = 0;
        if (c3 && c3.c.some((c) => c.t === TX.tendAct)) T.pressText(TX.tendAct);
        out.short = T.heard(/You have nothing left to hum with\./);
        // another calling: the old talk
        T.cls('blade'); G.party.hp = 10; T.frames(2); const ev3 = T.evs(); interact(); const c4 = window.__ev[ev3];
        out.blade = !(c4 && c4.c && c4.c.some((c) => c.t === TX.tendAct));
        try { partyDismiss(true); } catch (e) { /* none */ }
        G.flags.part4 = false;
        return out;
      });
      check(r.comp && r.offered === true, '15. the Kaelen companion hurt, the Cantor at reach, nothing hunting: E offers C3');
      check(r.hp === 14 && r.voice === 8 && Math.abs(r.noise - 0.9) <= 0.05 && r.c4 === true, '15. taking it mends him 14, costs 8 voice, noise +0.9 (' + [r.hp, r.voice, r.noise].join(', ') + ')');
      check(r.hunted === true, '15. with a hound in chase within 10 it is not offered');
      check(r.short === true, '15. short of voice: "You have nothing left to hum with."');
      check(r.blade === true, '15. another calling is not offered it');
    }

    // ---------------------------------------------------------------- 16, 17. the Corsair's sight
    {
      const r = await sect('16-17', () => {
        const out = {};
        T.cls('corsair');
        T.at('clearing', 13.0, 15.5, -Math.PI / 2, 0.45); Engine.cam.pitch = 100; T.step(2);
        T.still(1.4); T.frames(3);
        out.moored = SMALLLIFE.isMoored();
        out.line = T.drawn('mast').length; out.plumb = T.drawn('keel').length;
        G.flags.part3 = true; T.step(2); T.frames(3);
        out.cut = typeof MAST123 === 'object' && MAST123.cut();
        out.line2 = T.drawn('mast').length; out.plumb2 = T.drawn('keel').length;
        G.flags.part3 = false; T.step(2);
        // the quarry's scaffolds
        T.at('quarry', 16.5, 21.5, -Math.PI / 2, 0.45); Engine.cam.pitch = 0;
        T.still(1.4);
        const c = Engine.cam;
        const sc = (G.map._p12r || []).filter((e) => e._p12r.k === 'scaff' && Math.hypot(e.x - c.x, e.y - c.y) <= 10);
        out.nSc = sc.length;
        out.scaff = sc.map((e) => {
          T.face(e); T.frames(3);   // each in turn, in view
          const l = T.drawn('lashing').find((k) => k.e === e), p = T.drawn('patch').find((k) => k.e === e);
          const far = p ? ((p.wx - e.x) * (e.x - c.x) + (p.wy - e.y) * (e.y - c.y)) > 0 : false;
          return { line: !!l, patch: !!p, far };
        });
        return out;
      });
      check(r.moored === true && r.line >= 1 && r.plumb >= 1, '16. Corsair at the rim: with the Kestrel moored, lastDrawn() has the mast line and the keel plumb (' + r.line + ', ' + r.plumb + ')');
      check(r.cut === true && r.line2 === 0 && r.plumb2 === 0, '16. with MAST123.cut() true it has neither');
      check(r.nSc >= 1 && r.scaff.every((s) => s.line && s.patch && s.far), '17. Corsair in the quarry: each scaffold within 10 has its lashings and a fall patch, and the patch is on the far side from you (' + JSON.stringify(r.scaff) + ')');
    }

    // ---------------------------------------------------------------- 18. cargo night
    {
      const r = await sect('18', () => {
        const out = {}, TX = CALLINGS126.TX;
        const night = (cls) => {
          T.cls(cls); delete G.flags.p56; delete G.flags.p56_clerk;
          const ev0 = T.evs(); CARGO56.clerk(); T.press(0);
          const rounds = [];
          const r1 = window.__ev[ev0 + 1]; rounds.push(r1 ? r1.c.map((c) => c.t) : null);
          return rounds;
        };
        const k = night('corsair');
        out.k1 = k[0];
        const c0 = CARGO56.state().count; window.__msgs.length = 0;
        const ev1 = T.evs(); T.pressText(TX.sign);
        out.count = CARGO56.state().count - c0; out.k9 = T.heard(/Mags reads them/);
        const r2 = window.__ev[ev1]; out.k2 = r2 ? r2.c.map((c) => c.t) : null;
        const b = night('blade');
        out.b1 = b[0];
        const ev2 = T.evs(); T.press(0); const r3 = window.__ev[ev2]; out.b2 = r3 ? r3.c.length : null;
        out.step = 7;
        delete G.flags.p56; delete G.flags.p56_clerk; delete G.flags.p56_boot;
        return out;
      });
      check(!!r.k1 && r.k1.length === 4 && r.k1[3] === 'Sign it to Mags, behind his back', '18. cargo night as Corsair: round one has four choices, the fourth K8 (' + JSON.stringify(r.k1) + ')');
      check(r.count === r.step && r.k9 === true, '18. taking it raises Mags\'s count by STEP and shows K9 (' + r.count + ')');
      check(!!r.k2 && r.k2.length === 3, '18. it is not offered again that night (' + (r.k2 && r.k2.length) + ')');
      check(!!r.b1 && r.b1.length === 3 && r.b2 === 3, '18. as Glass-Hand each round has three');
    }

    // ---------------------------------------------------------------- 19. a hook slipped by hand
    {
      const r = await sect('19', () => {
        const out = {}, TX = CALLINGS126.TX, A = AIR93, K = KESTREL16, H = HEIGHTS92;
        T.cls('corsair');
        G.flags.part4 = true; G.flags.coda_done = true; G.flags.p16k_up = 127; G.player.gold = 200;
        K.board(); A.setRoll(() => 0.1); A.setNext('courier');
        out.met = A.start('home', 'whispergrove', 1, () => {}, true) && A.R.live && G.mapId === K.DECK;   // (a hop is met only coming home from far: start it as air93 would)
        closeModal(); hide('#event'); G.state = 'play';
        A.hook(); for (const e of A.R.proctors) { e.stun = 1e6; e.state = 'idle'; }
        out.chains = A.R.chains.length;
        const ch = A.R.chains[0];
        Engine.cam.x = ch.x - 0.8; Engine.cam.y = ch.y; Engine.cam.dir = 0; G.vel.x = G.vel.y = 0;
        const ev0 = T.evs(); useDeco(ch);
        const card = window.__ev[ev0];
        out.card = card ? card.c.map((c) => c.t) : null;
        A.R.spike = 0; let pre = 0;
        T.pressText(TX.slipIt);
        const hold = (s) => { for (let t = 0; t < s; t += 0.05) { pre = A.R.spike; G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; for (const e of A.R.proctors) { e.stun = 1e6; e.state = 'idle'; } update(0.05); if (!A.R.chains.includes(ch)) break; } };
        hold(5.3);
        out.gone = !A.R.chains.includes(ch) && !G.map.entities.includes(ch);
        out.spike = Math.round((A.R.spike - pre) * 1000) / 1000;
        out.k7 = T.heard(/goes up its line with nothing on it/);
        out.slips = G.flags.p126_slips;
        // walking off at 3 s
        const ch2 = A.R.chains[0];
        Engine.cam.x = ch2.x - 0.8; Engine.cam.y = ch2.y;
        const ev1 = T.evs(); useDeco(ch2); out.noCard = T.evs() === ev1;   // the choice holds for the flight
        for (let t = 0; t < 3; t += 0.05) { G.state = 'play'; G.keys = {}; G.player.hp = G.player.hpMax; update(0.05); }
        Engine.cam.x -= 2.0; window.__msgs.length = 0; T.step(2);
        out.k6 = T.heard(/You let go of the hook, and it bites again\./); out.stays = A.R.chains.includes(ch2);
        // cut: the old three blows
        CALLINGS126.slip.reset();
        Engine.cam.x = ch2.x - 0.8; Engine.cam.y = ch2.y;
        const ev2 = T.evs(); useDeco(ch2); T.pressText(TX.cutIt);
        const b1 = ch2._blows | 0; useDeco(ch2); const b2 = ch2._blows | 0; const still = A.R.chains.includes(ch2); useDeco(ch2);
        out.cut = T.evs() === ev2 + 1 && b1 === 1 && b2 === 2 && still && !A.R.chains.includes(ch2);
        out.offeredLine = CALLINGS126.slip.offered({ kind: 'deco', use: 'c68_line' });
        // another calling: the axe, as before
        T.cls('blade'); const ch3 = A.R.chains[0];
        if (ch3) { CALLINGS126.slip.reset(); const ev3 = T.evs(); useDeco(ch3); out.blade = T.evs() === ev3 && (ch3._blows | 0) === 1; }
        try { A.through('done'); T.press(0); } catch (e) { /* none */ }
        closeModal(); hide('#event'); G.state = 'play';
        G.flags.part4 = false; G.flags.coda_done = false;
        return out;
      });
      check(r.met && r.chains === 3 && JSON.stringify(r.card) === JSON.stringify(['Cut it', 'Slip it by hand']), '19. air93 as Corsair, hooked: E on a chain offers Cut it / Slip it by hand (' + JSON.stringify(r.card) + ')');
      check(r.gone === true && Math.abs(r.spike - 0.1) < 0.03 && r.k7 === true && r.slips === 1, '19. a slip, standing 5 s, takes the chain off with R.spike up by 0.1 in all (' + r.spike + ')');
      check(r.noCard === true && r.k6 === true && r.stays === true, '19. the choice holds for the flight; walking off at 3 s gives K6 and the chain stays');
      check(r.cut === true, '19. Cut keeps the three blows');
      check(r.offeredLine === false, '19. no slip is offered on js/cutter68.js\'s stage-6 line');
      check(r.blade === true, '19. a Glass-Hand at a chain swings the axe, as before');
    }

    // ---------------------------------------------------------------- 20. the flags, and an old save
    {
      const OLD = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures', 'p123-oldsaves.json.gz'))).toString('utf8'));
      const old = OLD.atMast;
      const r = await sect('20', (d) => {
        const out = {};
        const f = G.flags; f.p126_bells = 'x'; f.p126_seen = 900; f.p126_vosk = -1; f.p126_slips = 2.5; f.p126_did = 3;
        CALLINGS126.validate(f);
        out.bad = [f.p126_bells, f.p126_seen, f.p126_vosk, f.p126_slips, f.p126_did];
        const rn = Math.random; let calls = 0;
        const load = (stub) => {
          const real = CALLINGS126.validate; if (stub) CALLINGS126.validate = () => {};
          Math.random = function () { calls++; return rn.apply(this, arguments); };
          let c0 = 0;
          try { c0 = calls; restoreGame(JSON.parse(JSON.stringify(d))); } finally { Math.random = rn; CALLINGS126.validate = real; }
          return { flags: JSON.parse(JSON.stringify(G.flags)), callsAfterBase: calls - c0 };
        };
        const a = load(true), b = load(false);
        const keys = new Set(Object.keys(a.flags).concat(Object.keys(b.flags)));
        out.diff = [...keys].filter((k) => JSON.stringify(a.flags[k]) !== JSON.stringify(b.flags[k])).sort();
        out.vals = out.diff.map((k) => b.flags[k]);
        G.state = 'play'; closeModal(); hide('#event');
        T.cls('blade'); T.step(60, 0.05);
        const snap = snapshotGame();
        out.saved = ['p126_seen', 'p126_did', 'p126_bells', 'p126_vosk', 'p126_slips'].map((k) => snap.flags[k]);
        out.randDiff = a.callsAfterBase === b.callsAfterBase;
        return out;
      }, old);
      check(JSON.stringify(r.bad) === JSON.stringify([0, 0, 0, 0, 3]), '20. p126_bells "x", p126_seen 900, p126_vosk -1, p126_slips 2.5 all read 0 after validate (' + JSON.stringify(r.bad) + ')');
      check(JSON.stringify(r.diff) === JSON.stringify(['p126_bells', 'p126_did', 'p126_seen', 'p126_slips', 'p126_vosk']) && r.vals.every((v) => v === 0), '20. the p123 fixture save loads with nothing changed but the five flags at 0 (' + JSON.stringify(r.diff) + ')');
      check(r.randDiff === true, '20. and the load draws no more random numbers with the module than without');
      check(Array.isArray(r.saved) && r.saved.every((v) => v === 0 || (typeof v === 'number' && Number.isInteger(v))), '20. it plays a minute and saves with the five flags as small integers (' + JSON.stringify(r.saved) + ')');
    }

    // ---------------------------------------------------------------- 21. the Arbiter, not in the traveller's seam glass
    {
      const r = await sect('21', () => {
        const out = {}, P = PUMPS58.TX;
        const run = (cls) => { T.cls(cls); delete G.flags.p58; const ev0 = T.evs(); PUMPS58.voice(); const e = window.__ev[ev0]; delete G.flags.p58; return e ? e.b : ''; };
        const b = run('blade'), c = run('cantor');
        out.blade = b.includes(P.voiceGlass) && /It is not your glass anything is speaking through/.test(b) && !/a voice speaks in it, very gently/.test(b);
        out.other = c.startsWith(P.voiceKaelen) && c === P.voiceKaelen + '<br><br>' + P.voice;
        out.src = !/a voice speaks in it/.test(P.voiceGlass);
        return out;
      });
      check(r.blade === true && r.src === true, '21. the Arbiter in the archive (js/pumps58.js) as Glass-Hand: P1, and not the old voiceGlass');
      check(r.other === true, '21. as anyone else it is unchanged');
    }

    // ---------------------------------------------------------------- 22, 23. the budget, and one Engine.render a frame
    const budget = async (view) => sect('22 ' + view, (view) => {
      const want = view === '3d';
      try { R3D.setMode(want ? 'on' : 'off', { noSave: true }); } catch (e) { /* none */ }
      PRESETS.apply('medium'); GFX.callingSight = true; CALLINGS126.setMode('still');
      T.cls('blade'); T.at('quarry', 16.0, 21.5, 0, 0.45);
      const c = Engine.cam, add = [];
      for (let i = 0; i < 12; i++) { const a = -0.45 + 0.9 * (i / 11), d = 2.5 + (i % 4) * 0.8; const x = c.x + Math.cos(c.dir + a) * d, y = c.y + Math.sin(c.dir + a) * d; if (!G.map.isBlocked(x | 0, y | 0)) add.push(T.spawn(i % 3 === 0 ? 'proctor' : 'legionnaire', x, y, { name: 'Budget ' + i })); }
      T.still(1.4); T.frames(4);
      const out = { r3d: typeof R3D === 'object' && R3D.active(), n: add.length };
      CALLINGS126.stats.reset();
      let renders = 0; const ER = Engine.render; Engine.render = function () { renders++; return ER.apply(this, arguments); };
      try { for (let i = 0; i < 120; i++) render(); } finally { Engine.render = ER; }
      out.ms = CALLINGS126.stats.ms; out.frames = CALLINGS126.stats.frames; out.marks = T.drawn().length; out.renders = renders;
      for (const e of add) { e.dead = true; e.hidden = true; }
      try { R3D.setMode('off', { noSave: true }); } catch (e) { /* none */ }
      return out;
    }, view);
    {
      const a = await budget('classic');
      check(a.n >= 10 && a.marks >= 8 && a.ms < 1.0, '22. budget, classic view at 1x, ' + a.n + ' enemies in view: the sight costs ' + (a.ms != null && a.ms.toFixed(3)) + ' ms a frame (under 1.0; ' + a.marks + ' marks)');
      check(a.renders === 120, '23. with the sight on, Engine.render runs once per frame (' + a.renders + ' over 120)');
      console.log('MEASURE classic ' + JSON.stringify(a));
      const b = await budget('3d');
      if (b.r3d) {
        check(b.ms < 1.0 && b.marks >= 8, '22. budget, 3D view: ' + (b.ms != null && b.ms.toFixed(3)) + ' ms a frame (' + b.marks + ' marks)');
        check(b.renders === 120, '23. 3D view: Engine.render runs once per frame (' + b.renders + ')');
        console.log('MEASURE 3d ' + JSON.stringify(b));
      } else console.log('NOTE 22. no WebGL2 here: the 3D half did not run');
    }

    // ---------------------------------------------------------------- 25. every string has its French; no hero's title; the book's lines
    {
      const r = await sect('25', () => ({
        texts: CALLINGS126.TEXTS.slice(),
        scene: [GRAFT67.TX.hobDidHum, PUMPS58.TX.voiceGlass, AUDIT54.TX.heard.hand],
        TX: CALLINGS126.TX,
      }));
      const all = (r.texts || []).concat(r.scene || []).filter(Boolean);
      const missing = all.filter((t) => !tsvPairs.has(norm(t)));
      check(all.length >= 40 && missing.length === 0, '25. every string in CALLINGS126.TEXTS and the new scene strings has a French line in tools/i18n/p126-callings.tsv (' + all.length + ' strings; missing: ' + missing.slice(0, 4).join(' | ') + ')');
      const bad = all.filter((t) => /Dissonant Blade|Archivist of the Veil|Consecrated/.test(t));
      check(bad.length === 0, '25. none says "Dissonant Blade", "Archivist of the Veil" or "Consecrated" (' + bad.join(' | ') + ')');
      const heroYou = all.filter((t) => /\byou are (Kaelen|Lyra|Vane|Sable)\b|\bYou, Kaelen\b/i.test(t));
      check(heroYou.length === 0, '25. none names a hero as "you"');
      // the lines §5 marks as from the book: each piece is in the book at the lines it names (person and tense as §5 says)
      const TX = r.TX || {};
      const BOOK = [
        ['drink', 'the way you lay a hand on a struck bell to stop it ringing', [1855]],
        ['drink', 'like a mouth closing on something', [1855]],
        ['drink', 'no sound at all', [1857]],
        ['drink', 'and up your arm and is gone', [1855], 'and up his arm and was gone'],
        ['cracks', 'Something smooth and cold the size of an apple', [1875], 'the size of an apple'],
        ['pressed', 'hand-press', [4337]],
        ['pressed', 'two tines and a glass ampoule between them', [4335], 'two-tined fork with a glass ampoule seated between the tines'],
        ['pressed', 'Your arm locks rigid', [4345], 'locked rigid'],
        ['lenses', 'a moment longer than is comfortable', [765], 'a moment longer than was comfortable'],
        ['lenses', 'pitch is colour', [712], 'pitch was color'],
        ['lenses', 'burning like a lamp', [712]],
        ['short', 'nothing left to hum with', [977, 1037], 'nothing to hum with'],
        ['tend', 'so the sound goes into the hands and not the air', [366, 250], 'so the sound would go into his'],   // (the design said 368; the line is 366)
        ['hobDid', 'Every mending borrows.', [1039]],
        ['hobDid', 'the note for wounds that need closing', [364], 'wounds that needed closing'],
      ];
      const notBook = BOOK.filter(([k, piece, lines, bookPiece]) => !(TX[k] && norm(TX[k]).includes(norm(piece)) && msText(lines).includes(norm(bookPiece || piece))));
      check(notBook.length === 0, '25. the §5 lines from the book are found at their manuscript lines (' + BOOK.length + ' pieces; not found: ' + notBook.map((b) => b[0] + ':' + b[1]).join(' | ') + ')');
    }

    // ---------------------------------------------------------------- 26 (6b, the owner's ruling of 25 Nov: "it may go"). Cargo night: the
    // traveller no longer says Vane's line. The book (MS 2808-2814): Pim says "You should tell her … Annet. She'd like to know.", and
    // it is Vane who gets down on the boards of his own hold and says "Annet. You're going home." An old save that holds the
    // traveller's saying of it (p56_say 2) reads as Vane's (1); nothing else differed between the two (the gun, the journal, the xp).
    {
      const c56 = src('js/cargo56.js');
      check(!/Say it yourself/.test(c56) && !/"Annet," you say/.test(c56), '26. js/cargo56.js has no "Say it yourself" and no "Annet," you say');
      const r = await sect('26', () => {
        const out = {};
        const night = (cls) => {
          T.cls(cls); for (const k of ['p56', 'p56_clerk', 'p56_boot', 'p56_say', 'p56_gun']) delete G.flags[k];
          G.take && G.has(CARGO56.ITEM) && G.take(CARGO56.ITEM);
          const ev0 = T.evs(); CARGO56.clerk(); T.press(0);
          if (cls === 'corsair') T.pressText(CALLINGS126.TX.sign);
          for (let i = 0; i < 6 && window.__ev.length && /count/.test(T.last().b || '') && T.last().c.length >= 3; i++) T.press(0);
          const ev1 = T.evs(); CARGO56.crate(); T.press(0); T.press(0);
          const card = window.__ev[window.__ev.length - 1];
          const o = { choices: card ? card.c.map((c) => c.t) : null };
          T.press(0);
          const end = T.last(); o.body = end ? end.b : ''; o.say = G.flags.p56_say; o.p56 = G.flags.p56; o.gun = G.flags.p56_gun;
          o.vane = o.body.includes('"Annet," says Vane, to the wood. "You\'re going home."') && !/you say, to the wood/.test(o.body);
          o.signedCount = ev1 > ev0;
          return o;
        };
        out.blade = night('blade'); out.corsair = night('corsair');
        // an old save in which the traveller said it
        const snap = snapshotGame(); snap.flags.p56 = 2; snap.flags.p56_say = 2; snap.flags.p56_gun = 1;
        restoreGame(JSON.parse(JSON.stringify(snap))); G.state = 'play'; closeModal(); hide('#event');
        out.migrated = [G.flags.p56, G.flags.p56_say, G.flags.p56_gun];
        for (const k of ['p56', 'p56_clerk', 'p56_boot', 'p56_say', 'p56_gun']) delete G.flags[k];
        return out;
      });
      for (const k of ['blade', 'corsair']) {
        const o = r[k] || {};
        check(JSON.stringify(o.choices) === JSON.stringify(['Let him say it']) && o.vane === true && o.say === 1 && o.p56 === 2 && o.gun === 1, '26. cargo night as ' + k + ': at Annet no choice lets the traveller say the line; Vane says it, as the book has it (' + JSON.stringify(o.choices) + ', p56_say ' + o.say + ')');
      }
      check(JSON.stringify(r.migrated) === JSON.stringify([2, 1, 1]), '26. an old save with p56_say 2 loads as Vane\'s (1), the crate opened and the gun still owed (' + JSON.stringify(r.migrated) + ')');
    }

    check(errors.length === 0, 'no page errors or callings126 warnings (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? 'FAILED ' + fails : 'ALL PASSED');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL fatal ' + (e && e.stack || e)); process.exit(1); });
