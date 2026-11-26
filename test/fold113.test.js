// Phase 113c, the Fold's stones (js/fold113.js). Run:
//   PREVIEW_URL=http://127.0.0.1:4216 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/fold113.test.js
// The faith of the stars in the game: the sky's table (window.STARLORE113: the eight Keepers on the Chord, the Sparrow, the
// seven Signs on the sun's road, the loose five moving with the day, the three far folds, the Lantern), the standing
// stones and their sighting pegs (the Weekstones, the needle-stones, the notch-stones, the Grey Wethers' pegs, Ewe Barrow's
// door, the two blind stones), the VIEW through them (the sky zoomed, the name, the head line, the story; the stone's face
// by day, under cloud and when a wanderer is down), Old Marrable the lamp-teller by night, the flags and logbook lines.
// Writes no player saves.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4216';
let fails = 0, passes = 0;
const check = (cond, label) => { if (cond) { passes++; console.log('PASS ' + label); } else { fails++; console.log('FAIL ' + label); } };
// the four words of the Rift's secret, written backwards so that this file does not hold them either
const rev = (w) => w.split('').reverse().join('');
const FORBIDDEN = new RegExp('\\b(' + ['flehs', 'egdel', 'teksab', 'deredner'].map(rev).join('|') + ')', 'i');

(async () => {
  const src = fs.readFileSync(path.join(ROOT, 'js', 'fold113.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing in the Fold is decided by chance (no Math.random in the source)');
  {
    const files = ['js/fold113.js', 'test/fold113.test.js', 'tools/i18n/p113-fold.tsv', "story/Game Layer/Phase 113c - The Fold's stones (built).md"];
    const hits = [];
    for (const f of files) { let t = ''; try { t = fs.readFileSync(path.join(ROOT, f), 'utf8'); } catch (e) { hits.push(f + ' (missing)'); continue; } t.split('\n').forEach((l, i) => { if (FORBIDDEN.test(l)) hits.push(f + ':' + (i + 1)); }); }
    check(!hits.length, 'none of the Rift\'s four words is on any line of this phase\'s files' + (hits.length ? ': ' + hits.slice(0, 4).join(', ') : ''));
  }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await ctx.newPage();
  page.setDefaultTimeout(600000);
  const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  page.on('console', (m) => { if (m.type() === 'error' || (m.type() === 'warning' && /fold113|deepsky113/.test(m.text()))) errors.push(m.text().slice(0, 200)); });
  await page.addInitScript(() => {
    window.__r3d21 = { automation: true, force: true };
    try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'off', cap: 80 })); } catch (e) { /* none */ }
    // Math.random, counted (the Fold must draw none while maps are built, the table is built or a view is opened)
    let s = 99991; window.__rand = 0; Math.random = () => { window.__rand++; return (s = (s * 16807) % 2147483647) / 2147483647; };
  });
  await page.goto(URL0 + '/?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Fold Tester'); await page.locator('#c-next').click(); await page.locator('.classlist button').first().click(); await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const choice = page.locator('#create-panel .list button').first(); if (await choice.count()) await choice.click(); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click(); }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click(); await page.waitForFunction(() => G.state === 'play');

  // ------------------------------------------------------------------ the table, the places, the views (one page)
  const r = await page.evaluate(() => {
    const F = FOLD113, D = DEEPSKY113, out = {}, R2D = 180 / Math.PI, D2R = Math.PI / 180;
    window.requestAnimationFrame = () => 0;
    const ang = (a, b) => { let d = a - b; while (d > Math.PI) d -= 2 * Math.PI; while (d < -Math.PI) d += 2 * Math.PI; return Math.abs(d); };
    const dirOfAE = (az, el) => [Math.cos(az) * Math.cos(el), Math.sin(az) * Math.cos(el), Math.sin(el)];
    const sep = (a, b) => { const p = dirOfAE(a.az, a.el), q = dirOfAE(b.az, b.el); return Math.acos(Math.max(-1, Math.min(1, p[0] * q[0] + p[1] * q[1] + p[2] * q[2]))); };
    const spread = (stars) => { let m = 0; for (const a of stars) for (const b of stars) m = Math.max(m, sep(a, b)); return m * R2D; };
    // ---- the table
    window.__rand = 0;
    const A = JSON.stringify(F.buildLore(17)), B = JSON.stringify(F.buildLore(17));
    out.tableSame = A === B && A.length > 2000;
    out.tableRand = window.__rand;
    const T = F.buildLore(17), byId = {}; for (const c of T.cons) byId[c.id] = c; for (const w of T.wanderers) byId[w.id] = w;
    const KEEP = ['k_badger', 'k_salamander', 'k_tortoise', 'k_heron', 'k_cockerel', 'k_hare', 'k_magpie', 'k_owl'];
    out.keepers = KEEP.map((id, k) => {
      const c = byId[id]; if (!c) return id + ' missing';
      const N = D.NOTES[k], lamp = c.stars[F.FIG[id].aim];
      if (ang(lamp.az, N.az) > 1e-9 || Math.abs(lamp.el - N.el) > 1e-9) return id + ' lamp not on its note';
      if (!lamp.hue || lamp.hue.some((v, i) => Math.abs(v - N.rgb[i]) > 1e-9)) return id + ' lamp not its note\'s hue';
      if (c.stars.some((s) => s !== lamp && s.mag > lamp.mag)) return id + ' has a star brighter than its lamp';
      const sp = spread(c.stars); if (id !== 'k_owl' && (sp < 2.9 || sp > 9.1)) return id + ' spread ' + sp.toFixed(1);
      if (c.stars.some((s) => s !== lamp && (s.mag < 0.25 || s.mag > 0.55))) return id + ' star mags';
      return 'ok';
    });
    { const c = byId.k_sparrow, b = byId.k_badger; out.sparrow = !!c && c.stars.length === 3 && c.stars.every((s) => s.mag <= 0.3 && s.el > 0.02 && s.el < b.stars[F.FIG.k_badger.aim].el + 2 * D2R) && sep(c.stars[0], b.stars[F.FIG.k_badger.aim]) < 12 * D2R; }
    { const c = byId.k_owl; out.owl = !!c && c.stars.length === 2 && c.lines.length === 0; }
    const SIGNS = ['s_door', 's_cloister', 's_hound', 's_light', 's_road', 's_mourner', 's_fifth'];
    out.signs = SIGNS.map((id, k) => {
      const c = byId[id]; if (!c) return id + ' missing';
      const t = 0.08 + k * (0.84 / 6), road = D.sunRoad(t), mid = D.dirOf(id) || F.middle(c);
      if (id !== 's_road' && sep(mid, road) > 1.5 * D2R) return id + ' not on the sun\'s road (' + (sep(mid, road) * R2D).toFixed(2) + ')';
      const sp = spread(c.stars); if (id === 's_road' ? sp < 25 : (sp < 3.9 || sp > 10.1)) return id + ' spread ' + sp.toFixed(1);
      return 'ok';
    });
    out.signCounts = [byId.s_door.stars.length === 4, byId.s_hound.stars.length === 5, byId.s_road.stars.length === 11, byId.s_mourner.stars.length === 7, byId.s_fifth.stars.length === 4].every(Boolean);
    { const G2 = D.GALAXIES; const want = { g_farfold: G2[0], g_wheel: G2[1] };
      out.folds = ['g_farfold', 'g_wheel'].every((id) => { const d = D.dirOf(id); return d && sep(d, want[id]) < 0.6 * D2R; }) && !!D.dirOf('g_fleeces') && sep(D.dirOf('g_fleeces'), G2[2]) < 8 * D2R; }
    // the loose five with the day
    { const bad = [];
      for (let d = 0; d < 1500; d += 7) {
        const P = {}; for (const id of ['w_yow', 'w_lamb', 'w_tup', 'w_wether', 'w_dog']) P[id] = F.road(id, d);
        const fromRS = (a) => Math.min(ang(a, 0), ang(a, Math.PI));
        if (fromRS(P.w_yow) > 46 * D2R) bad.push('yow ' + d);
        if (ang(P.w_lamb, 0) > 26 * D2R) bad.push('lamb ' + d);
        let near = null, nd = 9; for (const id of ['w_yow', 'w_lamb', 'w_tup', 'w_wether']) { const g = ang(P[id], P.w_dog + 4 * D2R); if (g < nd) { nd = g; near = id; } }
        const behind = P[near] - P.w_dog; const bh = ((behind % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        if (!(bh > 1.5 * D2R && bh < 7 * D2R)) bad.push('dog ' + d);
      }
      if (ang(F.road('w_tup', 10), F.road('w_tup', 410)) > 0.3 * D2R || ang(F.road('w_tup', 10), F.road('w_tup', 210)) < 170 * D2R) bad.push('tup period');
      if (ang(F.road('w_wether', 10), F.road('w_wether', 10 + 12 * 360)) > 0.3 * D2R || ang(F.road('w_wether', 10), F.road('w_wether', 10 + 6 * 360)) < 170 * D2R) bad.push('wether period');
      if (ang(F.road('w_tup', 10), F.road('w_tup', 11)) < 0.5 * D2R) bad.push('tup still');
      out.wander = bad.slice(0, 4);
      const T5 = F.buildLore(40), mags = T5.cons.flatMap((c) => c.stars.map((s) => s.mag)).concat(T5.wanderers.filter((w) => w.id !== 'w_yow').map((w) => w.mag));
      out.yowBright = T5.wanderers.find((w) => w.id === 'w_yow').mag > Math.max(...mags);
    }
    // ---- the places: every stone and peg on its map, on open ground and off the tracks; nothing drawn by chance
    {
      const maps = buildAllMaps();
      for (const id in maps) { const m = maps[id]; const keep = m.entities.filter((e) => !(e && e._p113f)); const nb = m.entities.slice(0, m.baseCount == null ? m.entities.length : m.baseCount).filter((e) => e && e._p113f).length; m.entities = keep; if (m.baseCount != null) m.baseCount -= nb; delete m._p113fPlaced; }
      window.__rand = 0; F.place(maps); out.placeRand = window.__rand;
      out.placedTwice = (() => { const n = Object.values(maps).reduce((s, m) => s + m.entities.filter((e) => e && e._p113f).length, 0); F.place(maps); return n > 0 && n === Object.values(maps).reduce((s, m) => s + m.entities.filter((e) => e && e._p113f).length, 0); })();
    }
    const S = F.sites();
    out.siteCount = S.length;
    out.siteBad = [];
    for (const s of S) {
      const m = G.maps[s.map]; if (!m) { out.siteBad.push(s.key + ' no map'); continue; }
      const mine = m.entities.filter((e) => e && e._p113f === s.key);
      if (!mine.length) { out.siteBad.push(s.key + ' not built'); continue; }
      if (m.baseCount == null || mine.some((e) => m.entities.indexOf(e) >= m.baseCount)) out.siteBad.push(s.key + ' not in the map\'s base');
      for (const [x, y, what] of [[s.x, s.y, 'stone'], [s.sx, s.sy, 'peg']]) {
        if (x == null) continue;
        if (m.isBlocked(Math.floor(x), Math.floor(y))) out.siteBad.push(s.key + ' ' + what + ' on a blocked cell');
        const crowd = m.entities.find((o) => o && !o._p113f && o.solid && o.kind !== 'enemy' && Math.hypot(o.x - x, o.y - y) < (o.radius || 0.35) + 0.45);
        if (crowd) out.siteBad.push(s.key + ' ' + what + ' crowded by ' + (crowd.sprite || crowd.id));
        if (!s.blind && F.trackDist(m, x, y) < 3) out.siteBad.push(s.key + ' ' + what + ' within three cells of a track (' + F.trackDist(m, x, y).toFixed(1) + ')');
      }
      if ((s.kind === 'needle' || s.kind === 'notch' || s.kind === 'sparrow') && !s.blind) { const sl = F.sightClear(m, s); if (!sl.ok) out.siteBad.push(s.key + ' sight line shut at ' + sl.at); }
      if (s.moved > 0.01) out.siteMoved = (out.siteMoved || []).concat(s.key + ' ' + s.moved.toFixed(2));
    }
    // the Weekstones: a peg behind each, 1.2 back along its Keeper's bearing; the ring itself untouched
    { const st = G.maps.p47_stones, wk = S.filter((s) => s.kind === 'week');
      out.week = wk.length === 8 && wk.every((s, i) => { const w = STONES47.stoneAt(i), a = byId[KEEP[i]].stars[F.FIG[KEEP[i]].aim].az; return Math.hypot(s.sx - (w.x - 1.2 * Math.cos(a)), s.sy - (w.y - 1.2 * Math.sin(a))) < 0.05 && s.fig === KEEP[i]; });
      const ring = st.entities.filter((e) => e.use === 'p47_stone');
      out.ringKept = ring.length === 8 && ring.every((e, i) => Math.hypot(e.x - STONES47.stoneAt(e.stone).x, e.y - STONES47.stoneAt(e.stone).y) < 1e-6) && STONES47.STONES.length === 8;
      out.weekLabels = wk.every((s, i) => { const e = st.entities.find((o) => o._p113f === s.key && o.use); return e && e.label === STONES47.STONES[i][0] + '\'s stone, and a cup-marked peg in the turf behind it'; });
    }
    // ---- a view through each stone, on a clear moonless night
    const msgs = []; { const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); }; }
    const go = (s, tod, day, wx) => { closeModal(); hide('#event'); F.closeView(); G.day = day; loadMap(s.map, { x: s.sx, y: s.sy, dir: 0 }); G.tod = tod; G.day = day; G.state = 'play'; G.dead = false; G.player.hp = G.player.hpMax; G.fadeT = 0; G.player.feet = G.map.groundAt(s.sx, s.sy); Weather.hold(wx || 'clear'); Weather.apply(); };
    const peg = (s) => G.ents.find((e) => e._p113f === s.key && e.use && e.peg) || G.ents.find((e) => e._p113f === s.key && e.use);
    const panel = () => document.getElementById('event-panel');
    const viewText = () => (panel() ? panel().innerText : '');
    out.views = [];
    G.flags.p113f_seen = 0; G.flags.p113f_blind = 0; G.flags.p113f_marr = 0; G.flags.p11c_sign = 1;
    const j0 = G.journal.length;
    let viewRand = 0;
    DEEPSKY113.build();   // the sky laid, as it is once a night has been walked under it: a view then draws its chart at once (the unlaid case has its own check below)
    for (const s of S) {
      go(s, 0.0, 5);
      const e = peg(s); if (!e) { out.views.push(s.key + ' no peg'); continue; }
      window.__rand = 0; useDeco(e); F.finishTurn(); viewRand += window.__rand;
      const V = F.view, fig = F.FIG[V.fig], c = Engine.cam, txt = viewText();
      let bad = '';
      if (!V.open) bad = 'no view';
      else if (s.blind) {
        if (V.mode !== 'blind' || txt.indexOf(F.TX[s.blind]) < 0 || document.querySelector('#event-panel canvas[data-kind="sky"]')) bad = 'blind view wrong';
      } else {
        const fid = s.kind === 'wether' ? V.fig : s.fig, aim = F.aim(fid), isDown = F.aimAt(fid, G.day, G.tod).el < 0;
        if (Math.hypot(c.x - s.sx, c.y - s.sy) > 0.01) bad = 'not stood at the peg';
        else if (ang(c.dir, aim.az) > D2R) bad = 'yaw ' + ((c.dir - aim.az) * R2D).toFixed(2);
        else if (aim.el < R3D.camera.limit() - 0.01 && Math.abs(R3D.camera.angle() - aim.el) > D2R) bad = 'pitch';
        else if (V.fig !== s.fig && s.kind !== 'wether') bad = 'shows ' + V.fig;
        else if (isDown ? (V.mode !== 'face' || txt.indexOf(F.TX.down) < 0) : (V.mode !== 'sky' && V.mode !== 'moon')) bad = 'mode ' + V.mode + ' (' + F.visibleOf(V.fig).toFixed(2) + ')';
        else if (txt.indexOf(fig.name) < 0 || txt.indexOf(fig.head) < 0 || txt.indexOf(fig.story.replace(/<[^>]+>/g, '')) < 0) bad = 'text';
        else if (s.fig === 's_door' && txt.indexOf(F.TX.ownSign) < 0) bad = 'no own-sign line';
        else if (s.fig === 's_cloister' && txt.indexOf(F.TX.ownSign) >= 0) bad = 'own-sign line on another sign';
        else { const cv = document.querySelector('#event-panel canvas[data-kind]'); if (!cv || cv.width < 200) bad = 'no chart'; else if (isDown) { /* the face */ } else { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let lit = 0; for (let i = 0; i < d.length; i += 16) if (d[i] + d[i + 1] + d[i + 2] > 240) lit++; if (lit < 3) bad = 'chart dark'; } }
      }
      out.views.push(s.key + (bad ? ' ' + bad : ' ok'));
    }
    out.viewRand = viewRand;
    // the Grey Wethers ring the five in the call's order: three, one, four, two, five
    { const order = F.wetherOrder(G.day); const wets = S.filter((s) => s.kind === 'wether');
      out.wethers = wets.length === 5 && wets.every((s, i) => s.wether === i + 1 && F.wetherFig(i + 1, G.day) === order[[3, 1, 4, 2, 5][i] - 1]); }
    out.seenAfter = G.flags.p113f_seen;
    out.firstLog = G.journal.filter((j) => j.text === F.TX.jFirst).length;
    out.blindBits = G.flags.p113f_blind;
    // by day: the face, its line, the name, head line and story; nothing counted as seen
    { const s = S.find((q) => q.fig === 's_hound'); G.flags.p113f_seen = 0; go(s, 0.5, 5); useDeco(peg(s)); F.finishTurn();
      const txt = viewText(); out.day = F.view.mode === 'face' && txt.indexOf(F.TX.byDay) >= 0 && txt.indexOf(F.FIG.s_hound.story) >= 0 && !!document.querySelector('#event-panel canvas[data-kind="face"]') && !G.flags.p113f_seen; }
    // heavy cloud at night
    { const s = S.find((q) => q.fig === 'k_heron'); go(s, 0.0, 5, 'storm'); useDeco(peg(s)); F.finishTurn();
      const txt = viewText(); out.cloud = F.view.mode === 'face' && txt.indexOf(F.TX.tooLight) >= 0 && txt.indexOf(F.FIG.k_heron.name) >= 0 && !!document.querySelector('#event-panel canvas[data-kind="face"]'); }
    // a wanderer down: a night when the one a wether sights is under the horizon
    { let dd = -1, wi = -1; for (let d = 0; d < 400 && dd < 0; d++) for (let i = 1; i <= 5; i++) { const id = F.wetherFig(i, d); if (F.aimAt(id, d, 0.0).el < 0) { dd = d; wi = i; break; } }
      const s = S.find((q) => q.kind === 'wether' && q.wether === wi); go(s, 0.0, dd); useDeco(peg(s)); F.finishTurn();
      out.down = dd >= 0 && F.view.mode === 'face' && viewText().indexOf(F.TX.down) >= 0; }
    // the Lantern by day is down; at midnight of a full moon it is the moon, with the phase in the game's words
    { const s = S.find((q) => q.fig === 'm_lantern'); go(s, 0.0, 1); useDeco(peg(s)); F.finishTurn();
      const txt = viewText(); out.lantern = F.view.mode === 'moon' && txt.indexOf(F.TX.lanternHead) >= 0 && txt.toLowerCase().indexOf(CALENDAR11.moonName(1)) >= 0 && ang(Engine.cam.dir, (0.0 - 0.25) * 2 * Math.PI + Math.PI) < D2R; }
    // with the deep night sky off the view still draws the figure
    { const was = GFX.deepSky; GFX.deepSky = false; const s = S.find((q) => q.fig === 'k_badger'); go(s, 0.0, 5); useDeco(peg(s)); F.finishTurn();
      const cv = document.querySelector('#event-panel canvas[data-kind="sky"]'); out.offSky = F.view.mode === 'sky' && !!cv; GFX.deepSky = was; }
    // the logbook: once for the first; once for all twenty-five
    { const before = G.journal.filter((j) => j.text === F.TX.jAll).length; G.flags.p113f_seen = F.ALL_BITS ^ (1 << F.FIG.k_badger.bit); const s = S.find((q) => q.fig === 'k_badger'); go(s, 0.0, 5); useDeco(peg(s)); F.finishTurn(); F.closeView(); useDeco(peg(s)); F.finishTurn();
      out.allLog = G.journal.filter((j) => j.text === F.TX.jAll).length - before; out.allBits = G.flags.p113f_seen === F.ALL_BITS; }
    // Escape and the button close the view
    { const s = S.find((q) => q.fig === 'k_hare'); go(s, 0.0, 5); useDeco(peg(s)); F.finishTurn();
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true })); const a = !F.view.open && G.state === 'play';
      useDeco(peg(s)); F.finishTurn(); const b = Array.from(document.querySelectorAll('#event-panel button')).find((q) => q.textContent === F.TX.leave); if (b) b.click();
      out.closes = a && !!b && !F.view.open && G.state === 'play'; }
    // the Weekstones' own use is unchanged
    { const s = S.find((q) => q.kind === 'week'); go(s, 0.5, 5); window.__ev = []; const _se = showEvent; showEvent = function (t, b, c) { window.__ev.push({ t, b, c }); return _se.apply(this, arguments); };
      const ws = G.ents.find((e) => e.use === 'p47_stone' && e.stone === 2); useDeco(ws); showEvent = _se; F.closeView();
      out.weekUse = window.__ev.length === 1 && window.__ev[0].b === STONES47.STONES[2][2]; closeModal(); hide('#event'); G.state = 'play'; }
    out.journalAdded = G.journal.length - j0;
    return out;
  });
  check(r.tableSame && r.tableRand === 0, 'STARLORE113 is built the same twice, and without a random number (' + r.tableRand + ')');
  check(r.keepers.every((k) => k === 'ok'), 'the eight Keepers: each lamp on its note-star (same place, same hue) and the brightest of its figure, 3 to 9 degrees across, the rest 0.25 to 0.55: ' + r.keepers.filter((k) => k !== 'ok').join('; '));
  check(r.sparrow, 'the Sparrow: three small faint stars, near the Badger, on the side toward the horizon');
  check(r.owl, 'the Owl: two eyes and nothing else');
  check(r.signs.every((k) => k === 'ok'), 'the seven Signs along the sun\'s road, evenly from 0.08 to 0.92, 4 to 10 degrees across (the Road-Song a third of the road): ' + r.signs.filter((k) => k !== 'ok').join('; '));
  check(r.signCounts, 'the Signs\' shapes: the Door four, the Hound five, the Road-Song eleven, the Mourner six and one, the Fifth four');
  check(r.folds, 'the three far folds are the sky\'s own three galaxies (dirOf)');
  check(!r.wander.length, 'the loose five move with the day: Yow within 45 degrees of the rising or setting, the Lamb within 25 of the rising, Tup round in 400 days, Old Wether in twelve years, the Dog a few degrees behind the nearest' + (r.wander.length ? ': ' + r.wander.join(', ') : ''));
  check(r.yowBright, 'Yow is the brightest point in the table');
  check(r.placeRand === 0 && r.placedTwice, 'the stones are placed with no random number (' + r.placeRand + '), and placing twice adds nothing');
  check(r.siteCount === 27, 'twenty-seven sightings stand: eight Weekstone pegs, the Sparrow, seven needles, five wethers, the barrow, three notches, two blind (' + r.siteCount + ')');
  check(!r.siteBad.length, 'every stone and peg on open ground, uncrowded, off the tracks, in its map\'s base, its sight line open' + (r.siteBad.length ? ': ' + r.siteBad.slice(0, 6).join('; ') : ''));
  if (r.siteMoved) console.log('  moved: ' + r.siteMoved.join('; '));
  check(r.week && r.ringKept && r.weekLabels, 'each Weekstone has its peg 1.2 back along its Keeper\'s bearing, with its label; the ring is untouched');
  const vb = r.views.filter((v) => !/ ok$/.test(v));
  check(!vb.length && r.views.length === 27, 'every peg turns the camera to its figure (yaw and pitch within a degree) and opens its view: name, head line, story, the chart; the blind stones their lines and no sky' + (vb.length ? ': ' + vb.slice(0, 6).join('; ') : ''));
  check(r.viewRand === 0, 'no random number while a view is opened (' + r.viewRand + ')');
  check(r.wethers, 'the Grey Wethers sight the loose five in the call\'s order: three, one, four, two, five');
  check(r.firstLog === 1 && r.blindBits === 3, 'the first sighting under a clear sky writes its logbook line once; both blind stones are remembered (' + r.firstLog + ', ' + r.blindBits + ')');
  check(r.day, 'by day: the stone\'s face, the day line, the name and the story, and nothing counted');
  check(r.cloud, 'under heavy cloud at night: the face and "Too much light here tonight"');
  check(r.down, 'a wanderer under the horizon: "It is down tonight. The stone is patient."');
  check(r.lantern, 'Ewe Barrow\'s peg: the Lantern, where the moon stands, with tonight\'s phase in the game\'s words');
  check(r.offSky, 'with "Deep night sky" off the view still shows the sky and the figure');
  check(r.allLog === 1 && r.allBits, 'all twenty-five seen: the last logbook line, once');
  check(r.closes, '"Leave it." and Escape close the view');
  check(r.weekUse, 'a Weekstone used as before still says its own face (Counted in Eights untouched)');

  // ------------------------------------------------------------------ the 3D view: the lamp in the stone's eye
  const eye = await page.evaluate(async () => {
    const F = FOLD113, out = { rows: [] };
    const frames = async (n) => { for (let i = 0; i < n; i++) { Engine.cam.bob = 0; render(); await new Promise((q) => setTimeout(q, 50)); } };   // the 3D view reads its materials back a frame late
    R3D.setMode('on');
    const T = { stage: (s) => { closeModal(); hide('#event'); F.closeView(); G.day = 5; loadMap(s.map, { x: s.sx, y: s.sy, dir: 0 }); G.tod = 0.0; G.day = 5; G.state = 'play'; G.fadeT = 0; G.player.feet = G.map.groundAt(s.sx, s.sy); Weather.hold('clear'); Weather.apply(); } };
    out.active = false;
    for (const s of F.sites().filter((q) => q.kind === 'needle' && !q.blind)) {
      T.stage(s); const e = G.ents.find((q) => q._p113f === s.key && q.use); useDeco(e); F.finishTurn(); F.closeView(); G.state = 'play';
      out.active = R3D.active();
      const m = (x, y) => Engine.materialAt(x, y), M = Engine.MAT || { sky: 1, sprite: 6 };
      const st = G.ents.find((q) => q._p113f === s.key && q.stoneOf);
      const rpx = Math.max(2, Math.round(F.eyeScreenR(s)));
      // the read-back lags a frame or more behind: draw until two reads in a row agree
      let centre = -1, left = -1, right = -1, prev = '';
      for (let i = 0; i < 16; i++) { await frames(1); centre = m(160, 75); left = m(160 - Math.round(rpx * 1.7), 75); right = m(160 + Math.round(rpx * 1.7), 75); const k = centre + '/' + left + '/' + right; if (i >= 3 && k === prev) break; prev = k; }
      out.rows.push({ key: s.key, fig: s.fig, centre, left, right, rpx, ok: centre === M.sky && left === M.sprite && right === M.sprite, st: !!st });
    }
    R3D.setMode('off');
    // the classic view, where its look reaches
    for (const s of F.sites().filter((q) => q.kind === 'needle' && !q.blind && F.aim(q.fig).el < R3D.camera.limit() - 0.02)) {
      T.stage(s); const e = G.ents.find((q) => q._p113f === s.key && q.use); useDeco(e); F.finishTurn(); F.closeView(); G.state = 'play';
      await frames(2);
      const m = (x, y) => Engine.materialAt(x, y), M = Engine.MAT || { sky: 1, sprite: 6 }, rpx = Math.max(2, Math.round(F.eyeScreenR(s)));
      const left = m(160 - Math.round(rpx * 1.7), 75), right = m(160 + Math.round(rpx * 1.7), 75);
      out.rows.push({ key: s.key + ' (classic)', centre: m(160, 75), left, right, rpx, ok: m(160, 75) === M.sky && left === M.sprite && right === M.sprite });
    }
    return out;
  });
  check(eye.active, 'the 3D view is drawing');
  { const bad = eye.rows.filter((q) => !q.ok); check(eye.rows.length >= 8 && !bad.length, 'in the 3D view (and the classic, where it can look so high) each needle-stone\'s eye frames its figure\'s brightest star at the centre of the view, stone either side' + (bad.length ? ': ' + bad.map((q) => q.key + ' ' + q.centre + '/' + q.left + '/' + q.right + ' r' + q.rpx).join('; ') : '')); }

  // ------------------------------------------------------------------ Old Marrable
  const mr = await page.evaluate(() => {
    const F = FOLD113, out = {};
    closeModal(); hide('#event'); F.closeView();
    loadMap('p47_stones', { x: 12.5, y: 9.5, dir: 0 }); G.state = 'play';
    const her = () => G.ents.find((e) => e.kind === 'npc' && e.id === F.MARR);
    G.tod = 0.5; F.tick(); out.day = !!her() && her().hidden === true;
    G.tod = 22 / 24; F.tick(); out.night = !!her() && !her().hidden;
    G.tod = 3 / 24; F.tick(); out.dead = !her().hidden;
    G.tod = 6 / 24; F.tick(); out.dawn = her().hidden === true;
    G.tod = 22 / 24; F.tick();
    const w = her(), fallen = G.ents.find((e) => e.use === 'p47_stone' && e.stone === 7);
    out.byFallen = Math.hypot(w.x - fallen.x, w.y - fallen.y) < 2.2;
    out.voice = VOICES.resolveNpc(F.MARR).authored === true;
    out.noFight = !lawActive() && !w.faction && !w.lawGuard && !NPCS[F.MARR].faction && !NPCS[F.MARR].shop;
    G.flags.p113f_marr = 0; G.flags.p113f_seen = 0; G.flags.p113f_blind = 0;
    const lastThem = () => { const l = DLG.log.filter((q) => q.who === 'them'); return l.length ? l[l.length - 1].t : ''; };
    talk(w); out.first = lastThem() === F.TX.mGreet1; closeModal(); G.state = 'play';
    talk(w); out.after = lastThem() === F.TX.mGreet2; closeModal(); G.state = 'play';
    renderDialogue('tell');
    const own = Array.from(document.querySelectorAll('#d-topics button[data-own]')).map((b) => b.getAttribute('data-topic'));
    out.own = ['The Fold', 'The lamps', 'The stones', 'The count', 'The signs'].every((t) => own.includes(t));
    const ans = {}; for (const t of ['The Fold', 'The lamps', 'The stones', 'The count', 'The Church', 'The signs']) { DLG.tone = 'normal'; askTopic(t); ans[t] = lastThem(); }
    out.sayings = ans['The Fold'] === F.TX.say1 && ans['The lamps'] === F.TX.say2 && ans['The stones'] === F.TX.say3 && ans['The count'] === F.TX.say4 && ans['The Church'] === F.TX.say5 && ans['The signs'] === F.TX.saySigns;
    closeModal(); G.state = 'play';
    // all eight, once, only after; the Rift, once, only after
    G.flags.p113f_seen = 0x7f; talk(w); out.notYet8 = lastThem() !== F.TX.mAll8; closeModal(); G.state = 'play';
    G.flags.p113f_seen = 0xff; talk(w); out.all8 = lastThem() === F.TX.mAll8; closeModal(); G.state = 'play';
    talk(w); out.all8once = lastThem() === F.TX.mGreet2; closeModal(); G.state = 'play';
    G.flags.p113f_blind = 2; talk(w); out.notRift = lastThem() === F.TX.mGreet2; closeModal(); G.state = 'play';
    G.flags.p113f_blind = 3; talk(w); out.rift = lastThem() === F.TX.mRift; closeModal(); G.state = 'play';
    talk(w); out.riftOnce = lastThem() === F.TX.mGreet2; closeModal(); G.state = 'play';
    // kept through a save and a load
    const marr = G.flags.p113f_marr, seen = G.flags.p113f_seen, blind = G.flags.p113f_blind, jn = G.journal.length;
    const snap = snapshotGame(); G.flags.p113f_marr = 0; G.flags.p113f_seen = 0; restoreGame(JSON.parse(JSON.stringify(snap)));
    out.saved = G.flags.p113f_marr === marr && G.flags.p113f_seen === seen && G.flags.p113f_blind === blind && G.journal.length === jn && marr === 7;
    // hostile values are made safe
    G.flags.p113f_seen = 'lots'; G.flags.p113f_marr = -4; G.flags.p113f_blind = 1e12;
    out.hostile = F.flag('p113f_seen') === 0 && F.flag('p113f_marr') === 0 && F.flag('p113f_blind') === 0;
    G.flags.p113f_seen = seen; G.flags.p113f_marr = marr; G.flags.p113f_blind = blind;
    return out;
  });
  check(mr.day && mr.night && mr.dead && mr.dawn, 'Old Marrable is at the Weekstones by night only: from full dark through the dead hour, not by day or at dawn');
  check(mr.byFallen, 'she sits by the fallen Nullday stone');
  // (Phase 128a) drawn again at twice the size: she was 26 by 30, the smallest person in the game. The same size in the
  // world (the sprite's height setting), four times the pixels; white hair over a face with two eyes, a shawl, a coat,
  // a stick across her knees with both hands on it
  const art = await page.evaluate(() => {
    const sp = Engine.sprites[FOLD113.MARR]; if (!sp) return null;
    const D = sp.data, W = sp.w, H = sp.h, at = (x, y) => { const v = D[y * W + x]; return v >>> 24 ? [v & 255, (v >> 8) & 255, (v >> 16) & 255] : null; };
    let hair = 0, skin = 0, shawl = 0, coat = 0, eyes = [], hands = 0, stickRow = -1;
    for (let y = 0; y < H; y++) { let run = 0, best = 0;
      for (let x = 0; x < W; x++) { const c = at(x, y); if (!c) { run = 0; continue; }
        const [r, g, b] = c;
        if (r > 200 && g > 200 && b > 190 && y < H * 0.3) hair++;
        if (r > 170 && g > 130 && g < 185 && b > 100 && b < 160 && r - b > 35) { skin++; if (y > H * 0.55) hands++; }
        if (g > r && g > b && g > 80 && g < 150) shawl++;
        if (r > g + 12 && g > b + 12 && r > 70 && r < 130) coat++;
        if (r < 70 && g < 55 && b < 50 && r > 30 && y > H * 0.15 && y < H * 0.32) eyes.push(x);
        if (r > 50 && r < 90 && g > 34 && g < 62 && b < 44) { run++; best = Math.max(best, run); } else run = 0; }
      if (best > W * 0.7 && stickRow < 0) stickRow = y; }
    return { w: W, h: H, hs: sp.hs, hair, skin, shawl, coat, eyesL: eyes.filter((x) => x < W / 2).length, eyesR: eyes.filter((x) => x >= W / 2).length, hands, stickRow };
  });
  check(!!art && art.w >= 52 && art.h >= 60 && art.hs === 0.82, '128a. Old Marrable is drawn at twice the size, and is the same size in the world (' + JSON.stringify(art) + ')');
  check(!!art && art.hair > 30 && art.skin > 60 && art.shawl > 150 && art.coat > 200 && art.eyesL >= 2 && art.eyesR >= 2 && art.hands >= 8 && art.stickRow > art.h * 0.55, '128a. white hair, a face with two eyes, the shawl, the coat, both hands on the stick across her knees');
  check(mr.voice, 'she has her own voice');
  check(mr.noFight, 'nobody can strike her: no law on this ground, no faction, nothing for sale');
  check(mr.first && mr.after, 'her greetings: the first time, and after');
  check(mr.own && mr.sayings, 'her subjects as buttons (the Church is the shared one), and her five sayings and the line about the signs as their answers');
  check(mr.notYet8 && mr.all8 && mr.all8once, 'all eight Keepers said good night to: her line once, and only after all eight');
  check(mr.notRift && mr.rift && mr.riftOnce, 'the Rift\'s blind stone looked through: her line once, and only after');
  check(mr.saved, 'the flags and the logbook survive a save and a load');
  check(mr.hostile, 'hostile flag values read as nothing');

  // ------------------------------------------------------------------ every line has French
  {
    const tsv = (() => { try { return fs.readFileSync(path.join(ROOT, 'tools', 'i18n', 'p113-fold.tsv'), 'utf8'); } catch (e) { return ''; } })().split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
    const en = new Set(tsv.map((l) => l[0]));
    const texts = await page.evaluate(() => FOLD113.TEXTS);
    const missing = texts.filter((t) => !en.has(t));
    check(texts.length >= 80 && !missing.length && tsv.every((l) => l.length === 2 && l[1] && l[1].trim()), 'every line the Fold owns has French (' + texts.length + ' lines' + (missing.length ? '; missing: ' + missing.slice(0, 3).join(' | ') : '') + ')');
    const lib = require('../tools/i18n/lib');
    const fr = JSON.parse(fs.readFileSync(path.join(ROOT, 'locales', 'story', 'fr.json'), 'utf8'));
    const notMerged = texts.filter((t) => !/\{\d/.test(t) && fr.s[lib.hash(lib.norm(t))] == null);
    check(!notMerged.length, 'and it is merged into the catalogue' + (notMerged.length ? ': ' + notMerged.slice(0, 2).join(' | ') : ''));
    check(/\ble Parc\b/i.test(tsv.map((l) => l[1]).join('\n')) && /\bla Lanterne\b/i.test(tsv.map((l) => l[1]).join('\n')) && /\ble Blaireau\b/i.test(tsv.map((l) => l[1]).join('\n')), 'the faith\'s French names (le Parc, la Lanterne, le Blaireau)');
  }
  // Codex, P2 on #160: a stone opened before the sky's map is built (Deep night sky off, or a stone used at once) must
  // not build the whole map in one go. The view lays it a slice at a time and draws the chart when it is laid.
  {
    const r = await page.evaluate(async () => {
      const F = FOLD113, s = F.sites().find((q) => q.fig === 'k_badger');
      closeModal(); hide('#event'); F.closeView(); G.day = 5; loadMap(s.map, { x: s.sx, y: s.sy, dir: 0 }); G.tod = 0.0; G.day = 5; G.state = 'play'; G.dead = false;
      G.player.hp = G.player.hpMax; G.fadeT = 0; G.player.feet = G.map.groundAt(s.sx, s.sy); Weather.hold('clear'); Weather.apply();
      const e = G.ents.find((q) => q._p113f === s.key && q.use && q.peg) || G.ents.find((q) => q._p113f === s.key && q.use);
      DEEPSKY113.reset();
      let builds = 0; const _b = DEEPSKY113.build; DEEPSKY113.build = function () { builds++; return _b.apply(this, arguments); };
      useDeco(e); F.finishTurn();
      const readyAtOnce = DEEPSKY113.ready(), openAtOnce = F.view.open;
      const t0 = performance.now(); while (!DEEPSKY113.ready() && performance.now() - t0 < 8000) await new Promise((res) => setTimeout(res, 20));
      await new Promise((res) => setTimeout(res, 200));
      const cv = document.querySelector('#event-panel canvas.p113f-chart'); let lit = 0;
      if (cv) { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; for (let i = 0; i < d.length; i += 4) if (d[i] + d[i + 1] + d[i + 2] > 150) lit++; }
      DEEPSKY113.build = _b; const out = { builds, readyAtOnce, openAtOnce, readyAfter: DEEPSKY113.ready(), lit, ms: Math.round(performance.now() - t0) };
      F.closeView(); G.state = 'play'; return out;
    });
    check(r.openAtOnce && !r.readyAtOnce && r.builds === 0, 'a stone opened before the sky is laid opens at once and does not lay the whole sky in one go (builds ' + r.builds + ', ready at once ' + r.readyAtOnce + ')');
    check(r.readyAfter && r.lit > 20, 'and the chart is drawn when the sky is laid (' + r.ms + ' ms, ' + r.lit + ' lit pixels)');
  }
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(`${passes} passed, ${fails} failed`);
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.log('FAIL the test crashed: ' + (e && e.stack ? e.stack.split('\n').slice(0, 3).join(' ') : e)); process.exit(1); });
