// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4215 node test/deepsky113.test.js
// Phase 113b, the deep night sky (js/deepsky113.js): the Chord as a river of stars, eight faint note-stars along it, three
// far galaxies, a deeper star field, where the night is truly dark. Run it alone: it compares frames in both views.
//   - the switch off: night frames in the classic view and the 3D view are byte for byte the frames of the code before
//     this phase (a second page is served js/light21.js, js/sky.js, js/presets.js and js/deepsky113.js as they were at
//     BASE, from git); the Rift's starless night is the one change not behind the switch, and is not in these scenes
//   - the map: built in slices (none bigger than a few milliseconds), the same map when built twice, no Math.random
//   - open country, clear, no moon: darkness() above 0.9; the band is brighter than with the switch off and than the sky
//     away from it; a dust lane inside it is darker than the band beside it; each far galaxy is found where it is; the
//     brightest diffuse light is under the limits (the owner, 22 Nov, "a little over the top is actually ok": the core
//     about 0.32 of white, the band on average about 0.16, a galaxy's core about 0.18)
//   - a lamp-lit town street at the same hour: darkness() lower, the far galaxies not drawn; a full moon high: lower
//   - by day, indoors and underground: nothing drawn
//   - on p100_wall at night there is not one star, switch on or off, in both views (and what the code before drew there)
//   - the same view twice gives the same pixels; the Spire of Decay's quarter on the Reach's maps does not twinkle
//   - shooting stars: a few a night on a fixed schedule (no random numbers), only where the night is dark
//   - the stones' constellations (window.STARLORE113, a fixture table here): their stars drawn in both views at their
//     places, dirOf / visible / drawChart; with no table nothing changes and nothing throws
//   - for the stones: chord(t) along the Chord's visible arc, sunRoad(t) along the sun's; the eight notes at chord((2k+1)/16)
//   - the Options row and its French; Original and Low have it off; the classic view's cost at 1x
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { execFileSync } = require('node:child_process');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4215';
const ROOT = path.join(__dirname, '..');
// the code before this phase: the commit that carried the module's stub and its script tag
const BASE = '02686bd3';
const BEFORE = ['js/light21.js', 'js/sky.js', 'js/presets.js', 'js/deepsky113.js'];
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

function beforeFiles() {
  const out = {};
  try { for (const f of BEFORE) out[f] = execFileSync('git', ['show', BASE + ':' + f], { cwd: ROOT, maxBuffer: 64 << 20 }).toString('utf8'); return out; }
  catch (e) {
    // no git history here: the nearest honest stand-in is the module disabled (its stub), with the other files as they are
    console.log('  (no git history: comparing against the page with the module disabled)');
    return { 'js/deepsky113.js': "'use strict';\nconst DEEPSKY113 = (function () { return {}; })();\n" };
  }
}

async function boot(browser, before) {
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(900000);
  const errors = [];
  page.on('pageerror', (e) => errors.push('pageerror: ' + e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /deepsky113|light21|r3d21|shader|render override/.test(m.text()))) errors.push(m.type() + ': ' + m.text()); });
  if (before) for (const f in before) await page.route('**/' + f + '*', (r) => r.fulfill({ status: 200, contentType: 'application/javascript', body: before[f] }));
  await page.addInitScript(() => {
    window.__r3d21 = { automation: true, force: true };
    try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); localStorage.removeItem('octave.switch.deepSky'); } catch (e) { /* none */ }
    // a seeded Math.random that counts its calls (the deep sky must draw none)
    let s = 424242; window.__rand = 0; Math.random = () => { window.__rand++; return (s = (s * 16807) % 2147483647) / 2147483647; };
  });
  await page.goto(URL + '/?nosw=1', { waitUntil: 'domcontentloaded' });
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Sky Watcher');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForTimeout(500);
  await page.evaluate(() => {
    window.requestAnimationFrame = () => 0;
    try { closeModal(); } catch (e) { /* none open */ }
    const T = window.T113 = {};
    T.pin = (fn, now) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => (now == null ? 123456 : now); Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
    Engine.addPostHook((F) => { T.cap = { fb: F.fb.slice(), w: F.w, h: F.h }; }, 1e9);   // the classic frame as the CPU leaves it
    // a place and an hour; angle: how far up the look is (radians), as R3D.camera.setAngle; day picks the moon
    T.stage = (m, x, y, dir, tod, day, angle, wx) => T.pin(() => {
      G.state = 'paused'; G.day = day; G.tod = tod;
      loadMap(m, x == null ? undefined : { x, y, dir }); G.fadeT = 0; G.tod = tod; G.day = day;
      if (dir != null) Engine.cam.dir = dir;
      Engine.cam.bob = 0; Engine.cam.pitch = (160 / 0.66) * Math.tan(angle || 0);
      Weather.hold(wx || 'clear'); Weather.apply(); G.state = 'play';
      for (const k of ['coldBreath', 'windSigns', 'dyingLights']) GFX[k] = false;
      if (typeof FLORA !== 'undefined') { FLORA.hold(true); FLORA.T = 5; }
      const ms = document.getElementById('msgs'); if (ms) ms.textContent = '';
    });
    T.view = (v) => { R3D.setMode(v === '3d' ? 'on' : 'off'); };
    // one frame of the view in use, every clock pinned (anim: the animation clock, for the twinkle)
    T.frame = (anim, now) => T.pin(() => {
      for (const k of ['coldBreath', 'windSigns', 'dyingLights']) GFX[k] = false;
      const ents = G.ents.filter((e) => e.kind === 'deco');
      for (const e of ents) { for (const k of Object.keys(e)) if (k.startsWith('anim') && typeof e[k] === 'number') e[k] = (k === 'animSX' || k === 'animSY' || k === 'animAlpha') ? 1 : 0; e.animSprite = null; e.animFlip = false; e._fb = 0; }
      PARTICLES.mapId = null; ANIM.dirLast = Engine.cam.dir;
      // the animation clock: js/anim.js sets the engine's from ANIM.T each frame, with a step from the (pinned) wall clock
      ANIM.T = anim == null ? 5 : anim; ANIM.last = (now == null ? 123456 : now) / 1000;
      Engine.setTime(ANIM.T); Engine.setFlicker(1); Engine.cam.bob = 0;
      render(); render();
    }, now);
    // the presented picture as rows of RGBA bytes, top row first, with the view's own size
    T.grab = () => {
      if (R3D.active()) {
        const P = R3D.readPixels(), F = R3D.frame, w = P.w, y0 = F.vpY, h = F.vpH, out = new Uint8Array(w * h * 4);
        for (let y = 0; y < h; y++) out.set(P.data.subarray((y0 + h - 1 - y) * w * 4, (y0 + h - y) * w * 4), y * w * 4);
        return { w, h, d: out, k: w / 320 };
      }
      const c = T.cap, out = new Uint8Array(c.fb.length * 4); out.set(new Uint8Array(c.fb.buffer, c.fb.byteOffset, c.fb.byteLength));
      return { w: c.w, h: c.h, d: out, k: c.w / 320 };
    };
    T.hash = (g) => { let h = 2166136261; for (let i = 0; i < g.d.length; i += 4) { h ^= g.d[i] | (g.d[i + 1] << 8) | (g.d[i + 2] << 16); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); };
    // mean luma of a square of logical pixels (half-size r) at the centre of the view, of one picture or of a - b
    T.patch = (a, b, r, ox, oy) => {
      const k = a.k, cx = Math.round(a.w / 2 + (ox || 0) * k), cy = Math.round(a.h / 2 + (oy || 0) * k), R = Math.max(1, Math.round(r * k));
      let s = 0, n = 0, mx = 0;
      for (let y = cy - R; y <= cy + R; y++) for (let x = cx - R; x <= cx + R; x++) {
        const o = (y * a.w + x) * 4; let v = a.d[o] * 0.3 + a.d[o + 1] * 0.59 + a.d[o + 2] * 0.11;
        if (b) v -= b.d[o] * 0.3 + b.d[o + 1] * 0.59 + b.d[o + 2] * 0.11;
        s += v; n++; if (v > mx) mx = v;
      }
      return { mean: s / n, max: mx };
    };
    // a ring around the centre (between r0 and r1 logical px), of a - b
    T.ring = (a, b, r0, r1) => {
      const k = a.k, cx = Math.round(a.w / 2), cy = Math.round(a.h / 2); let s = 0, n = 0;
      for (let y = cy - r1 * k; y <= cy + r1 * k; y++) for (let x = cx - r1 * k; x <= cx + r1 * k; x++) {
        const d = Math.max(Math.abs(x - cx), Math.abs(y - cy)) / k; if (d < r0) continue;
        const o = (y * a.w + x) * 4; s += (a.d[o] - b.d[o]) * 0.3 + (a.d[o + 1] - b.d[o + 1]) * 0.59 + (a.d[o + 2] - b.d[o + 2]) * 0.11; n++;
      }
      return s / n;
    };
    T.same = (a, b) => { let n = 0; for (let i = 0; i < a.d.length; i++) if (a.d[i] !== b.d[i]) n++; return n; };
  });
  return { page, ctx, errors };
}

// the scenes: [map, x, y, dir, tod, day]. Day 5 is a new moon, day 1 a full one (js/calendar11.js: (day + 3) % 8).
const OPEN = ['p20_downs', null, null];   // the Watch Downs: open chalk country, no lamps
const TOWN = ['oakhaven', 23.5, 6.5];     // an Oakhaven street with its lamps
const MIDNIGHT = 0.0, NEW = 5, FULL = 1;

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  try {
    const before = beforeFiles();
    const A = await boot(browser, before), B = await boot(browser, null);
    const EA = (fn, a) => A.page.evaluate(fn, a), EB = (fn, a) => B.page.evaluate(fn, a);
    const sky = await EB(() => DEEPSKY113 && DEEPSKY113.CORE ? { core: DEEPSKY113.CORE, gal: DEEPSKY113.GALAXIES.map((g) => ({ name: g.name, az: g.az, el: g.el })), lane: DEEPSKY113.LANE } : null);

    // ------------------------------------------------------------------------------------------------ off = before
    // (the hashes are printed: the page served the code before this phase gives the same ones in the same run)
    await step('switch off: night frames in the classic view and the 3D view are the code before this phase, byte for byte', async () => {
      const core = sky ? sky.core : { az: -0.63, el: 0.38 };
      const scenes = [[...OPEN, core.az, MIDNIGHT, NEW, core.el], [...TOWN, core.az, MIDNIGHT, NEW, 0.2], [...OPEN, 1.8, MIDNIGHT, FULL, 0.3], [...OPEN, core.az, 0.5, NEW, 0.1]];
      const take = (E, off) => E(([scenes, off]) => {
        const out = [];
        if (off && 'deepSky' in GFX) GFX.deepSky = false;
        for (const v of ['classic', '3d']) { T113.view(v); for (const s of scenes) { PRESETS.apply('medium'); if (off && 'deepSky' in GFX) GFX.deepSky = false; T113.stage(...s); T113.frame(); out.push(v + ':' + s[0] + ':' + s[4] + ':' + T113.hash(T113.grab())); } }
        T113.view('3d'); return out;
      }, [scenes, off]);
      const a = await take(EA, false), b = await take(EB, true);
      console.log('  before ' + a.join(' ')); console.log('  off    ' + b.join(' '));
      assert.deepStrictEqual(b, a);
    });

    // ------------------------------------------------------------------------------------------------ the map
    await step('the map: built in slices of a few milliseconds at most, the same map twice, no Math.random', async () => {
      const r = await EB(() => {
        const r0 = window.__rand;
        // a cold build first (the first one also pays for compiling the code, and catches whatever garbage collection the
        // page has owed since it loaded: its longest slice is printed, not judged); then the build measured
        DEEPSKY113.reset(); let cold = 0; while (!DEEPSKY113.ready()) { const t = performance.now(); DEEPSKY113.slice(); cold = Math.max(cold, performance.now() - t); }
        DEEPSKY113.reset(); let n = 0; const t0 = performance.now(); let worst = 0;
        while (!DEEPSKY113.ready() && n < 5000) { const t = performance.now(); DEEPSKY113.slice(); worst = Math.max(worst, performance.now() - t); n++; }
        const h1 = DEEPSKY113.hash(), all = performance.now() - t0;
        DEEPSKY113.reset(); DEEPSKY113.build(); const h2 = DEEPSKY113.hash();
        return { n, worst, cold, all, h1, h2, rand: window.__rand - r0, W: DEEPSKY113.W, H: DEEPSKY113.H, st: DEEPSKY113.stats };
      });
      console.log('  ' + r.W + ' x ' + r.H + ' built in ' + r.n + ' slices, ' + r.all.toFixed(0) + ' ms in all, the longest slice ' + r.worst.toFixed(1) + ' ms (the cold first build ' + r.cold.toFixed(1) + ' ms); map ' + r.h1 + '; ' + JSON.stringify(r.st.map));
      assert.ok(r.n > 8 && r.worst < 12, 'slices ' + r.n + ', longest ' + r.worst.toFixed(1) + ' ms');
      assert.strictEqual(r.h1, r.h2, 'the same map twice');
      assert.strictEqual(r.rand, 0, 'Math.random while building');
      // the limits, on the map itself (raised by the owner, 22 Nov): the core about 0.32 of white, the band about 0.16 on average, a galaxy's core 0.18
      assert.ok(r.st.map.coreMax <= 0.32 && r.st.map.bandMean <= 0.17 && r.st.map.bandMean >= 0.06 && r.st.map.galaxyMax <= 0.18, JSON.stringify(r.st.map));
    });

    // ------------------------------------------------------------------------------------------------ open country
    const pair = (E, scene, view) => E(([s, v]) => {
      T113.view(v); PRESETS.apply('medium');
      DEEPSKY113.build(); GFX.deepSky = false; T113.stage(...s); T113.frame(); const off = T113.grab();
      GFX.deepSky = true; T113.frame(); const on = T113.grab();
      const d = DEEPSKY113.darkness(), st = Object.assign({}, DEEPSKY113.last);
      return { d, st, centre: T113.patch(on, off, 3), centreOn: T113.patch(on, null, 3), ring: T113.ring(on, off, 10, 18), same: T113.same(on, off) };
    }, [scene, view]);
    await step('open country, clear, no moon: darkness() above 0.9', async () => {
      const d = await EB((s) => { GFX.deepSky = true; T113.view('classic'); T113.stage(...s); T113.frame(); return DEEPSKY113.darkness(); }, [...OPEN, 0, MIDNIGHT, NEW, 0.2]);
      console.log('  darkness ' + d.toFixed(3));
      assert.ok(d > 0.9, 'darkness ' + d);
    });
    for (const view of ['classic', '3d']) {
      await step(view + ': the river: the band is brighter than with the switch off and than the sky away from it; a dust lane is darker than the band beside it; under the limits', async () => {
        const c = sky.core, L = sky.lane;
        const core = await pair(EB, [...OPEN, c.az, MIDNIGHT, NEW, c.el], view);
        const band = await pair(EB, [...OPEN, L.beside.az, MIDNIGHT, NEW, L.beside.el], view);
        const lane = await pair(EB, [...OPEN, L.lane.az, MIDNIGHT, NEW, L.lane.el], view);
        const away = await pair(EB, [...OPEN, L.away.az, MIDNIGHT, NEW, L.away.el], view);
        console.log('  core +' + core.centre.mean.toFixed(1) + ' (max ' + core.centre.max.toFixed(0) + '), band +' + band.centre.mean.toFixed(1) + ', lane +' + lane.centre.mean.toFixed(1) + ', away +' + away.centre.mean.toFixed(1) + ' (luma, of 255)');
        assert.ok(core.centre.mean > 8 && band.centre.mean > 5, 'the band is brighter than with the switch off ' + JSON.stringify([core.centre, band.centre]));
        assert.ok(band.centre.mean > away.centre.mean + 4, 'the band is brighter than the sky away from it ' + JSON.stringify([band.centre, away.centre]));
        assert.ok(lane.centre.mean < band.centre.mean * 0.55, 'the lane is darker than the band beside it ' + JSON.stringify([lane.centre, band.centre]));
        assert.ok(core.centre.mean <= 0.32 * 255 + 4, 'the core no brighter than about a third of white ' + core.centre.mean);
      });
      await step(view + ': each of the three far galaxies is found at its place, faint', async () => {
        const out = [];
        for (const g of sky.gal) {
          const r = await pair(EB, [...OPEN, g.az, MIDNIGHT, NEW, g.el], view);
          out.push(g.name + ' +' + r.centre.mean.toFixed(1) + ' (ring +' + r.ring.toFixed(1) + ', max ' + r.centre.max.toFixed(0) + ')');
          assert.ok(r.centre.mean > 2 && r.centre.mean > r.ring + 1.5, g.name + ' found ' + JSON.stringify([r.centre, r.ring]));
          assert.ok(r.centre.mean < 0.18 * 255, g.name + ' not too bright ' + JSON.stringify(r.centre));
        }
        console.log('  ' + out.join('; '));
      });
    }

    // ------------------------------------------------------------------------------------------------ light and moon
    await step('a lamp-lit town street at the same hour: darkness() lower, the far galaxies not drawn (both views)', async () => {
      const g = sky.gal[0];
      const open = await pair(EB, [...OPEN, g.az, MIDNIGHT, NEW, g.el], 'classic');
      for (const view of ['classic', '3d']) {
        const town = await pair(EB, [...TOWN, g.az, MIDNIGHT, NEW, g.el], view);
        console.log('  ' + view + ': open ' + open.d.toFixed(3) + ', town ' + town.d.toFixed(3) + ' (deep ' + town.st.deep.toFixed(2) + ', galaxy patch +' + town.centre.mean.toFixed(2) + ')');
        assert.ok(town.d < open.d - 0.3, 'town ' + town.d + ' open ' + open.d);
        assert.ok(town.st.deep === 0 && town.centre.mean < 0.5, 'no galaxy in town ' + JSON.stringify([town.st, town.centre]));
      }
    });
    await step('a full moon high takes darkness() down from a moonless night', async () => {
      const r = await EB(([o, t, a, b]) => { GFX.deepSky = true; T113.view('classic'); T113.stage(o[0], o[1], o[2], 0, t, a, 0.2); T113.frame(); const none = DEEPSKY113.darkness(); T113.stage(o[0], o[1], o[2], 0, t, b, 0.2); T113.frame(); return { none, full: DEEPSKY113.darkness() }; }, [OPEN, MIDNIGHT, NEW, FULL]);
      console.log('  no moon ' + r.none.toFixed(3) + ', full moon high ' + r.full.toFixed(3));
      assert.ok(r.full < r.none - 0.2 && r.full > r.none * 0.55, JSON.stringify(r));
    });
    await step('by day, indoors and underground nothing is drawn (both views)', async () => {
      const c = sky.core;
      for (const view of ['classic', '3d']) {
        for (const s of [[...OPEN, c.az, 0.5, NEW, c.el], ['tavern', 8.5, 10.5, -1.57, MIDNIGHT, NEW, 0.1], ['rootvault', 4.5, 5.5, 0, MIDNIGHT, NEW, 0.1]]) {
          const r = await pair(EB, s, view);
          assert.ok(r.d === 0 && r.same === 0 && r.st.px === 0, view + ' ' + s[0] + '@' + s[4] + ': ' + JSON.stringify({ d: r.d, same: r.same, st: r.st }));
        }
      }
    });

    // ------------------------------------------------------------------------------------------------ the Rift
    await step('p100_wall at night: not one star, switch on or off, in both views', async () => {
      const probe = (E, mine) => E((mine) => {
        const out = {};
        for (const v of ['classic', '3d']) {
          T113.view(v);
          for (const on of [false, true]) {
            PRESETS.apply('medium'); if (mine) GFX.deepSky = on;
            const go = (stars) => { GFX.stars = stars; T113.stage('p100_wall', null, null, 0.3, 0.0, 5, 0.35); T113.frame(); return T113.grab(); };
            const a = go(true), n = v === 'classic' ? SKY.stats.stars : (LIGHT21.P.sky2[0] > 0 ? 1 : 0), b = go(false);
            out[v + (mine ? (on ? ':on' : ':off') : '')] = { stars: n, diff: T113.same(a, b), deep: mine ? DEEPSKY113.last.px : 0 };
            GFX.stars = true;
            if (!mine) break;
          }
        }
        T113.view('3d'); return out;
      }, mine);
      const was = await probe(EA, false), now = await probe(EB, true);
      console.log('  before this phase: ' + JSON.stringify(was)); console.log('  now: ' + JSON.stringify(now));
      for (const k in now) assert.ok(now[k].stars === 0 && now[k].diff === 0 && now[k].deep === 0, k + ' ' + JSON.stringify(now[k]));
    });

    // ------------------------------------------------------------------------------------------------ the same pixels
    await step('the same view twice gives the same pixels; drawing it uses no Math.random (both views)', async () => {
      const r = await EB((c) => {
        const out = {};
        for (const v of ['classic', '3d']) {
          T113.view(v); PRESETS.apply('medium'); GFX.deepSky = true; DEEPSKY113.build();
          T113.stage('p20_downs', null, null, c.az, 0.0, 5, c.el); const r0 = window.__rand;
          // the deep sky's own draw, alone, with the real Math.random
          const F = DEEPSKY113.drawCount(); T113.frame(); const a = T113.grab(); T113.frame(); const b = T113.grab();
          out[v] = { diff: T113.same(a, b), drawn: DEEPSKY113.drawCount() - F, px: DEEPSKY113.last.px };
          // the classic hook by itself: no Math.random
          const rr = window.__rand; DEEPSKY113.hooks.classic(Object.assign({}, DEEPSKY113.lastFrame || {})); out[v].rand = window.__rand - rr;
        }
        T113.view('3d'); return out;
      }, sky.core);
      console.log('  ' + JSON.stringify(r));
      for (const v in r) assert.ok(r[v].diff === 0 && r[v].drawn > 0 && r[v].rand === 0, v + ' ' + JSON.stringify(r[v]));
    });
    await step('the Spire of Decay\'s quarter: on a Reach map its stars hold still while the rest twinkle (classic view)', async () => {
      const r = await EB(() => {
        T113.view('classic'); PRESETS.apply('medium'); GFX.deepSky = true; DEEPSKY113.build();
        const sp = DEEPSKY113.spire('p20_downs');
        T113.stage('p20_downs', null, null, sp.az, 0.0, 5, sp.el); T113.frame(5); const a = T113.grab(); T113.frame(7.3); const b = T113.grab();
        // inside: forty pixels by twenty-eight about the middle of the quarter (twenty degrees wide, fifteen high); outside: the same, turned away
        const k = a.k, w = a.w, x0 = Math.round(w / 2 - 20 * k), x1 = Math.round(w / 2 + 20 * k), y0 = Math.round(a.h / 2 - 14 * k), y1 = Math.round(a.h / 2 + 14 * k);
        let inD = 0, n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const o = (y * w + x) * 4; if (a.d[o] !== b.d[o] || a.d[o + 1] !== b.d[o + 1] || a.d[o + 2] !== b.d[o + 2]) inD++; n++; }
        const inside = DEEPSKY113.last.spirePx;
        T113.stage('p20_downs', null, null, sp.az + 1.2, 0.0, 5, sp.el); T113.frame(5); const c = T113.grab(); T113.frame(7.3); const d = T113.grab();
        let outD = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const o = (y * w + x) * 4; if (c.d[o] !== d.d[o] || c.d[o + 1] !== d.d[o + 1] || c.d[o + 2] !== d.d[o + 2]) outD++; }
        // and not on a map outside the Reach
        const elsewhere = DEEPSKY113.spire('p96_cliffs');
        return { sp, inD, outD, n, inside, elsewhere };
      });
      console.log('  ' + JSON.stringify(r));
      assert.ok(r.sp && r.inside > 0 && r.inD === 0 && r.outD > 0 && !r.elsewhere, JSON.stringify(r));
    });


    // ------------------------------------------------------------------------------------------------ shooting stars
    await step('shooting stars: a few a night on a fixed schedule, drawn only where the night is dark (both views)', async () => {
      const r = await EB(() => {
        const a = DEEPSKY113.meteors(0, 3600), b = DEEPSKY113.meteors(0, 3600);
        const out = { n: a.length, same: JSON.stringify(a) === JSON.stringify(b), seen: {}, town: {} };
        const m = a.find((x) => { const q = DEEPSKY113.meteorAt(x.t0 + x.dur * 0.5); return q && q.el > 0.12 && q.el < 0.4; }) || a[0];
        for (const v of ['classic', '3d']) {
          T113.view(v); PRESETS.apply('medium'); GFX.deepSky = true; DEEPSKY113.build();
          const at = DEEPSKY113.meteorAt(m.t0 + m.dur * 0.5);
          T113.stage('p20_downs', null, null, at.az, 0.0, 5, at.el); T113.frame(m.t0 + m.dur * 0.5); out.seen[v] = DEEPSKY113.last.meteor;
          T113.stage('oakhaven', 23.5, 6.5, at.az, 0.0, 5, at.el); T113.frame(m.t0 + m.dur * 0.5); out.town[v] = DEEPSKY113.last.meteor;
        }
        out.none = DEEPSKY113.meteorAt(m.t0 - 0.01) === null || DEEPSKY113.meteorAt(m.t0 - 0.01).t0 !== m.t0;
        T113.view('3d'); return out;
      });
      console.log('  ' + r.n + ' in an hour of play; drawn ' + JSON.stringify(r.seen) + ', in town ' + JSON.stringify(r.town));
      assert.ok(r.n >= 3 && r.n <= 40 && r.same && r.none, JSON.stringify(r));
      assert.ok(r.seen.classic > 0 && r.seen['3d'] > 0 && r.town.classic === 0 && r.town['3d'] === 0, JSON.stringify(r));
    });

    // ------------------------------------------------------------------------------------------------ the stones' stars
    await step('constellations (a fixture table): drawn in both views at their places; dirOf, visible, drawChart; none without a table', async () => {
      const r = await EB(() => {
        const out = {};
        // the game's own table (js/fold113.js, Phase 113c) is taken away first: this check brings its own fixture
        window.STARLORE113 = undefined;
        PRESETS.apply('medium'); GFX.deepSky = true; DEEPSKY113.build();
        T113.view('classic'); T113.stage('p20_downs', null, null, 2.4, 0.0, 5, 0.33); T113.frame(); const bare = T113.hash(T113.grab());
        out.noTable = { dir: DEEPSKY113.dirOf('fixA'), vis: DEEPSKY113.visible('fixA'), chart: DEEPSKY113.drawChart(document.createElement('canvas').getContext('2d'), 'fixA', 0, 0, 64, 40) };
        window.STARLORE113 = {
          cons: [
            { id: 'fixA', stars: [{ az: 2.30, el: 0.30, mag: 0.9, hue: null }, { az: 2.40, el: 0.36, mag: 0.6, hue: [0.7, 0.8, 1] }, { az: 2.50, el: 0.31, mag: 0.7, hue: [1, 0.8, 0.6] }, { az: 2.44, el: 0.24, mag: 0.4, hue: null }], lines: [[0, 1], [1, 2], [2, 3]] },
            { id: 'fixLow', stars: [{ az: -2.0, el: -0.20, mag: 0.8, hue: null }, { az: -1.9, el: -0.15, mag: 0.8, hue: null }], lines: [[0, 1]] },
          ],
          wanderers: [{ id: 'fixW', az: 1.0, el: 0.3, mag: 0.85, hue: [1, 0.86, 0.62] }],
        };
        out.dir = DEEPSKY113.dirOf('fixA'); out.dirW = DEEPSKY113.dirOf('fixW'); out.dirNone = DEEPSKY113.dirOf('nope');
        out.vis = DEEPSKY113.visible('fixA'); out.visW = DEEPSKY113.visible('fixW'); out.visLow = DEEPSKY113.visible('fixLow');
        for (const v of ['classic', '3d']) {
          T113.view(v);
          GFX.deepSky = true; T113.stage('p20_downs', null, null, 2.30, 0.0, 5, 0.30); delete window.STARLORE113.off;
          const tab = window.STARLORE113; window.STARLORE113 = undefined; T113.frame(); const off = T113.grab();
          window.STARLORE113 = tab; T113.frame(); const on = T113.grab();
          const w0 = T113.patch(on, off, 2);
          T113.stage('p20_downs', null, null, 1.0, 0.0, 5, 0.3); T113.frame(5); const a = T113.grab(); T113.frame(7.3); const b = T113.grab();
          window.STARLORE113 = undefined; T113.frame(5); const c = T113.grab(); window.STARLORE113 = tab;
          out[v] = { star: w0, wander: T113.patch(a, c, 2), steady: T113.patch(a, b, 2) };
        }
        T113.view('classic');
        // visible(): 0 by day, indoors, on the Rift, under cloud
        T113.stage('p20_downs', null, null, 0, 0.5, 5, 0); out.day = DEEPSKY113.visible('fixA');
        T113.stage('tavern', 8.5, 10.5, 0, 0.0, 5, 0); out.indoors = DEEPSKY113.visible('fixA');
        T113.stage('p100_wall', null, null, 0, 0.0, 5, 0); out.rift = DEEPSKY113.visible('fixA');
        T113.stage('p20_downs', null, null, 0, 0.0, 5, 0, 'overcast'); out.cloud = DEEPSKY113.visible('fixA');
        T113.stage('oakhaven', 23.5, 6.5, 0, 0.0, 5, 0); out.town = DEEPSKY113.visible('fixA');
        T113.stage('p20_downs', null, null, 0, 0.0, 5, 0);
        // the chart
        const cv = document.createElement('canvas'); cv.width = 640; cv.height = 400; const x = cv.getContext('2d');
        const r0 = window.__rand;
        out.chart = DEEPSKY113.drawChart(x, 'fixA', 0, 0, 640, 400, { lines: 1 }); const d1 = x.getImageData(0, 0, 640, 400).data.slice();
        DEEPSKY113.drawChart(x, 'fixA', 0, 0, 640, 400, { lines: 1 }); const d2 = x.getImageData(0, 0, 640, 400).data;
        let diff = 0, lit = 0; for (let i = 0; i < d1.length; i += 4) { if (d1[i] !== d2[i] || d1[i + 1] !== d2[i + 1] || d1[i + 2] !== d2[i + 2]) diff++; if (d1[i] + d1[i + 1] + d1[i + 2] > 60) lit++; }
        DEEPSKY113.drawChart(x, 'fixA', 0, 0, 640, 400, { lines: 0 }); const d0 = x.getImageData(0, 0, 640, 400).data; let lines = 0; for (let i = 0; i < d1.length; i += 4) if (d1[i] !== d0[i] || d1[i + 1] !== d0[i + 1]) lines++;
        out.chartStat = { diff, lit, lines, rand: window.__rand - r0, unknown: DEEPSKY113.drawChart(x, 'nope', 0, 0, 640, 400) };
        // with the table taken away, the frame is the bare frame again
        window.STARLORE113 = undefined; T113.stage('p20_downs', null, null, 2.4, 0.0, 5, 0.33); T113.frame(); out.back = T113.hash(T113.grab()) === bare;
        window.STARLORE113 = { cons: 'nonsense', wanderers: [{}] }; T113.frame(); out.junk = DEEPSKY113.dirOf('fixA') === null; delete window.STARLORE113;
        T113.view('3d'); return out;
      });
      console.log('  ' + JSON.stringify(r));
      assert.ok(r.noTable.dir === null && r.noTable.vis === 0 && r.noTable.chart === false, 'no table ' + JSON.stringify(r.noTable));
      assert.ok(r.dir && Math.abs(r.dir.az - 2.41) < 0.05 && Math.abs(r.dir.el - 0.3) < 0.05 && r.dirW && Math.abs(r.dirW.az - 1) < 1e-6 && r.dirNone === null, 'dirOf ' + JSON.stringify([r.dir, r.dirW]));
      assert.ok(r.vis > 0.6 && r.visW > 0.6 && r.visLow === 0 && r.day === 0 && r.indoors === 0 && r.rift === 0 && r.cloud === 0 && r.town > 0 && r.town < r.vis, 'visible ' + JSON.stringify(r));
      for (const v of ['classic', '3d']) assert.ok(r[v].star.max > 25 && r[v].wander.max > 25 && r[v].steady.max === 0 && r[v].steady.mean === 0, v + ' ' + JSON.stringify(r[v]));
      assert.ok(r.chart === true && r.chartStat.diff === 0 && r.chartStat.lit > 500 && r.chartStat.lines > 100 && r.chartStat.rand === 0 && r.chartStat.unknown === false, 'chart ' + JSON.stringify(r.chartStat));
      assert.ok(r.back && r.junk, 'without a table, or with a broken one, nothing changes ' + JSON.stringify([r.back, r.junk]));
    });

    // ------------------------------------------------------------------------------------------------ the stones' roads
    await step('the stones\' roads: chord(t) along the visible arc, sunRoad(t) as the sun is drawn; the eight notes at chord((2k + 1) / 16)', async () => {
      const r = await EB(() => {
        DEEPSKY113.build();
        const c = [0, 0.25, 0.5, 0.75, 1].map((t) => DEEPSKY113.chord(t)), sun = [0, 0.5, 1].map((t) => DEEPSKY113.sunRoad(t));
        // evenly by angle: the angle between successive points of a fine walk is the same everywhere
        const dir = (p) => [Math.cos(p.az) * Math.cos(p.el), Math.sin(p.az) * Math.cos(p.el), Math.sin(p.el)];
        const steps = []; for (let k = 0; k < 16; k++) { const a = dir(DEEPSKY113.chord(k / 16)), b = dir(DEEPSKY113.chord((k + 1) / 16)); steps.push(Math.acos(Math.min(1, a[0] * b[0] + a[1] * b[1] + a[2] * b[2]))); }
        // on the Chord: perpendicular to light21's bandN
        const N = DEEPSKY113.N, off = Math.max(...c.map((p) => { const d = dir(p); return Math.abs(d[0] * N[0] + d[1] * N[1] + d[2] * N[2]); }));
        // the sun as js/light21.js draws it at an hour of the day
        const tod = 0.4, a = (tod - 0.25) * Math.PI * 2, want = { az: Math.atan2(Math.sin(a), Math.cos(a)), el: Math.asin(Math.cos((tod - 0.5) * Math.PI * 2)) * 0.74 }, got = DEEPSKY113.sunRoad((tod - 0.25) / 0.5);
        const notes = DEEPSKY113.NOTES.map((n, k) => { const p = DEEPSKY113.chord((2 * k + 1) / 16), s = DEEPSKY113.sample(n.az, n.el); return { at: Math.abs(p.az - n.az) + Math.abs(p.el - n.el), star: s.star, gate: s.gate }; });
        return { c, sun, steps, off, sunErr: Math.abs(got.az - want.az) + Math.abs(got.el - want.el), notes };
      });
      console.log('  chord: t = 0 at az ' + (r.c[0].az * 180 / Math.PI).toFixed(1) + ', top ' + (r.c[2].el * 180 / Math.PI).toFixed(1) + ' deg, t = 1 at az ' + (r.c[4].az * 180 / Math.PI).toFixed(1));
      assert.ok(Math.abs(r.c[0].el) < 1e-6 && Math.abs(r.c[4].el) < 1e-6 && r.c[2].el > r.c[1].el && r.c[2].el > r.c[3].el && r.off < 1e-9, 'the visible arc ' + JSON.stringify(r.c));
      assert.ok(Math.cos(r.c[0].az) < 0 && Math.cos(r.c[4].az) > 0, 't = 0 the western end, t = 1 the eastern');
      assert.ok(Math.max(...r.steps) - Math.min(...r.steps) < 1e-9, 'evenly by angle ' + JSON.stringify(r.steps));
      assert.ok(Math.abs(r.sun[0].az) < 1e-9 && Math.abs(r.sun[0].el) < 1e-9 && Math.abs(r.sun[1].az - Math.PI / 2) < 1e-9 && Math.abs(Math.abs(r.sun[2].az) - Math.PI) < 1e-9 && Math.abs(r.sun[2].el) < 1e-9 && r.sunErr < 1e-9, 'the sun\'s road ' + JSON.stringify(r.sun));
      const HUE = [[74, 156, 98], [180, 96, 62], [118, 128, 150], [186, 158, 86], [108, 196, 206], [100, 154, 206], [154, 112, 200], [124, 114, 134]];
      r.notes.forEach((n, k) => {
        assert.ok(n.at < 1e-9 && n.gate === 1 && Math.max(...n.star) > 0.25, 'note ' + k + ' ' + JSON.stringify(n));
        const h = HUE[k], top = h.indexOf(Math.max(...h)), st = n.star.indexOf(Math.max(...n.star));
        assert.strictEqual(st, top, 'note ' + k + ' carries its own hue ' + JSON.stringify(n.star));
      });
    });

    // ------------------------------------------------------------------------------------------------ the switch
    await step('the Options row "Deep night sky" with its hint and French; Original and Low have it off, Medium on', async () => {
      const r = await EB(() => {
        const out = {};
        for (const p of ['original', 'low', 'medium', 'high', 'cinematic']) { PRESETS.apply(p); out[p] = GFX.deepSky; }
        PRESETS.apply('medium'); GFX.deepSky = false; renderAccessibilityMenu();
        const b = document.getElementById('gfx-deepsky113'), lab = b && b.previousElementSibling;
        out.label = lab ? lab.textContent : null; out.t0 = b && b.textContent; if (b) b.click();
        out.on1 = GFX.deepSky; out.t1 = document.getElementById('gfx-deepsky113').textContent;
        document.getElementById('gfx-deepsky113').click(); out.on2 = GFX.deepSky;
        out.stored = localStorage.getItem('octave.switch.deepSky'); closeModal();
        out.inFX = GFX.FX.includes('deepSky');
        return out;
      });
      console.log('  ' + JSON.stringify(r));
      assert.ok(r.original === false && r.low === false && r.medium === true && r.inFX, 'presets ' + JSON.stringify(r));
      assert.ok(/^Deep night sky/.test(r.label) && /the band of star-dust as a river of stars, and far galaxies, where the night is truly dark/.test(r.label), 'label ' + r.label);
      assert.ok(r.t0 === 'Off' && r.t1 === 'On' && r.on1 === true && r.on2 === false && r.stored === 'false', JSON.stringify(r));
      const fr = JSON.stringify(JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'story', 'fr.json'), 'utf8')));
      for (const s of ['Ciel nocturne profond', 'galaxies lointaines']) assert.ok(fr.includes(s), 'French: ' + s);
    });
    await step('cost: the classic view\'s deep sky is under a millisecond a frame at 1x (the median of 40)', async () => {
      const r = await EB((c) => {
        T113.view('classic'); PRESETS.apply('medium'); PRESETS.setScale(1); GFX.deepSky = true; DEEPSKY113.build();
        T113.stage('p20_downs', null, null, c.az, 0.0, 5, c.el); T113.frame();
        const F = DEEPSKY113.lastFrame, ts = [];
        const fb0 = F.fb.slice(); let px = 0;
        for (let i = 0; i < 40; i++) { F.fb.set(fb0); const t = performance.now(); DEEPSKY113.hooks.classic(F); ts.push(performance.now() - t); px = DEEPSKY113.last.px; }
        ts.sort((a, b) => a - b); return { med: ts[20], px, w: F.w };
      }, sky.core);
      console.log('  ' + r.med.toFixed(3) + ' ms a frame, ' + r.px + ' sky pixels, ' + r.w + ' wide');
      assert.ok(r.med < 1 && r.px > 1000, JSON.stringify(r));
    });
    await step('no page errors', async () => {
      assert.deepStrictEqual(A.errors.concat(B.errors).filter((e) => !/performance warning/i.test(e)), []);
    });
    await A.ctx.close(); await B.ctx.close();
  } catch (e) {
    failed++; console.log('FAIL the run -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e));
  } finally {
    await browser.close();
  }
  console.log(passed + ' passed, ' + failed + ' failed');
  process.exit(failed ? 1 : 0);
})();
