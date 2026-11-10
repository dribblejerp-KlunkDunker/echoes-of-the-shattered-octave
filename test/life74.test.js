// PREVIEW_URL=http://127.0.0.1:8837 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/life74.test.js
// The lived-in world, wave 4 (js/life74-smallplaces.js; ROADMAP R10 W4): the small places keep the hours. Stillwater
// Landing, the Low Rings, the Bell Yard, the Hollow and the clearing outside the Hedge. The life60 gate for each: every
// stop is open ground of the right kind and reachable, every hour covered once; nobody walks through a wall or into the
// water; the streets are empty at night; the Hollow goes indoors while the Grafters are in it; the clearing's people are
// in the town or down the quarry when they are not on the track; nothing is saved; nobody is there once the story empties
// the place; and every line has French.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
const frCheck = async (page, file, mod, label) => {
  const tsv = fs.readFileSync(path.join(ROOT, 'tools/i18n/' + file), 'utf8').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
  const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
  const texts = await page.evaluate((m) => window[m].TEXTS, mod);
  const noFr = texts.filter((t) => !pairs.get(t));
  check(!noFr.length && tsv.every((x) => x.length === 2), label + ': every new string has a French pair (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
};
const PLACES = ['flume_landing', 'flume_lowrings', 'p31_bellyard', 'p30_hollow', 'clearing'];

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /life60|life74/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8837');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof LIFE74 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Small Places Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; window.__msgs.length = 0; },
        at(id, h, day) { if (day != null) G.day = day; G.tod = h / 24; loadMap(id); G.state = 'play'; return G.map; },
        who(k) { return LIFE60.people(G.map).find((e) => e._life === k); },
        out() { return LIFE60.people(G.map).filter((e) => !e.hidden).map((e) => e._life); },
        open(x, y) { const m = G.map, g = LIFE60.grid(m); return !g[Math.floor(y) * m.w + Math.floor(x)]; },
        ground(x, y) { const w = LIFE74.WALK[G.mapId]; return !w || w(G.map, Math.floor(x), Math.floor(y)); },
        run(sec, fn) { for (let t = 0; t < sec; t += 0.1) { G.state = 'play'; LIFE60.tick(0.1); if (fn) fn(); } },
      };
    });

    // ---- the gate: every place has its people; every stop open, on its own ground, reachable; every hour covered once
    let r = await page.evaluate((ids) => {
      T.reset(); G.day = 2; const out = { bad: [], n: {}, staged: {} };
      for (const id of ids) {
        const m = T.at(id, 10), P = LIFE60.PLACES[id];
        if (!P) { out.bad.push(id + ' not registered'); continue; }
        out.n[id] = P.roster.length; out.staged[id] = LIFE60.people(m).length;
        for (const p of P.roster) {
          const pts = [p.home];
          for (const s of p.day) { for (const q of [s.at, s.to2]) if (q) pts.push(q); if (typeof s.face === 'string' && !P.byKey[s.face]) out.bad.push(p.key + ' faces ' + s.face); }
          for (const q of pts) {
            if (!T.open(q[0], q[1]) || !T.ground(q[0], q[1])) out.bad.push(id + ' ' + p.key + ' off its ground ' + q);
            else if (!LIFE60.path(m, p.home[0], p.home[1], q[0], q[1])) out.bad.push(id + ' ' + p.key + ' unreachable ' + q);
          }
          for (let h = 0; h < 24; h += 0.1) { const k = p.day.filter((s) => (s.from <= s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to)).length; if (k !== 1) { out.bad.push(p.key + ' hour ' + h.toFixed(1) + ' x' + k); break; } }
          if (!NPCS['p60_' + p.key] || !NPCS['p60_' + p.key].greet.normal) out.bad.push(p.key + ' no NPCS entry');
        }
      }
      return out;
    }, PLACES);
    check(PLACES.every((id) => r.n[id] >= 2 && r.staged[id] === r.n[id]), 'each of the five small places has its people, all staged (' + PLACES.map((id) => id + ' ' + r.n[id]).join(', ') + ')');
    check(!r.bad.length, 'every home and stop is open ground of the right kind and reachable, every hour covered once, everyone has lines (' + r.bad.slice(0, 3).join('; ') + ')');

    // ---- day and night
    r = await page.evaluate((ids) => {
      const out = { day: {}, night: {} };
      for (const id of ids) { T.at(id, 3, 2); out.night[id] = T.out(); T.at(id, id === 'clearing' ? 6.4 : 10, 2); out.day[id] = T.out(); }
      return out;
    }, PLACES);
    check(PLACES.every((id) => !r.night[id].length), 'at the dead hour every small place is empty of them (' + PLACES.map((id) => r.night[id].join(',')).filter(Boolean).join(' | ') + ')');
    check(r.day.p30_hollow.length >= 5 && r.day.p31_bellyard.length >= 6 && r.day.flume_landing.length >= 3 && r.day.flume_lowrings.length >= 1 && r.day.clearing.length >= 5,
      'by day they are about (' + PLACES.map((id) => id + ' ' + r.day[id].length).join(', ') + ')');

    // ---- walking: real routes, never through a wall, never into the water
    r = await page.evaluate((ids) => {
      const out = { wall: [], moved: {} };
      for (const id of ids) {
        T.at(id, id === 'clearing' ? 9 : 10, 2); const ps = LIFE60.people(G.map), p0 = ps.map((e) => [e.x, e.y]);
        for (let i = 0; i < 300; i++) { T.run(0.1); for (const e of ps) if (!e.hidden && (!T.open(e.x, e.y) || !T.ground(e.x, e.y))) out.wall.push(id + ' ' + e._life); }
        out.moved[id] = ps.filter((e, i) => Math.hypot(e.x - p0[i][0], e.y - p0[i][1]) > 1).length;
      }
      out.wall = [...new Set(out.wall)];
      return out;
    }, PLACES);
    check(!r.wall.length, 'thirty seconds in each: nobody walks through a wall, into the basin or the drowned street, or up into a room (' + r.wall.slice(0, 3).join('; ') + ')');
    check(PLACES.every((id) => r.moved[id] >= 1), 'and they come and go (' + PLACES.map((id) => id + ' ' + r.moved[id]).join(', ') + ')');

    // ---- the Hollow: indoors while the Grafters are in it, out again after
    r = await page.evaluate(() => {
      const out = {};
      T.at('p30_hollow', 9, 1); out.grafting = HOLLOW30.grafting(); out.rootday = T.out();
      T.at('p30_hollow', 9, 2); out.plain = T.out();
      T.at('p30_hollow', 7.9, 1); const w = T.who('hw_water'); out.before = !w.hidden;
      G.tod = 8.05 / 24; T.run(40); out.inAt8 = w.hidden && Math.hypot(w.x - LIFE60.PLACES.p30_hollow.byKey.hw_water.home[0], w.y - LIFE60.PLACES.p30_hollow.byKey.hw_water.home[1]) < 0.3;
      out.nobody = !T.out().length;
      G.tod = 14.05 / 24; T.run(3); out.after = T.out().length >= 4;
      // the round in progress holds them in too, whatever the clock says
      G.day = 2; G.tod = 10 / 24; G.flags.p67 = 3; out.round = LIFE74.down.p30_hollow(); delete G.flags.p67; out.noRound = !LIFE74.down.p30_hollow();
      return out;
    });
    check(r.grafting && !r.rootday.length && r.plain.length >= 5, 'on Rootday morning, while the white wagon is in, the Hollow\'s lanes are empty; any other morning they are not (' + r.rootday.join(',') + ')');
    check(r.before && r.inAt8 && r.nobody && r.after, 'when the wagon comes in they walk to their own doors and go in; at two they come out again');
    check(r.round && r.noRound, 'while the Grafters\' round is being walked (js/grafters67.js), they stay in');

    // ---- the clearing: the shifts on the track; the farmer's wife in the town by day; the gate
    r = await page.evaluate(() => {
      const out = {};
      T.at('clearing', 6.4, 2); out.shift = T.out().filter((k) => /^cl_(day|night)/.test(k)).length;
      T.at('clearing', 10, 2); out.dayIn = ['cl_dayA', 'cl_nightA', 'cl_farmwife'].every((k) => T.who(k).hidden);
      out.mender = T.out().includes('cl_hedge');
      T.at('oakhaven', 8, 2); const fw = LIFE60.people(G.map).find((e) => e._life === 'farmwife'); out.inTown = fw && !fw.hidden;
      T.at('clearing', 8, 2); out.notBoth = T.who('cl_farmwife').hidden;
      T.at('clearing', 6.5, 2); out.walkingIn = !T.who('cl_farmwife').hidden;
      T.at('clearing', 18, 2); out.nightOut = T.out().some((k) => /^cl_night/.test(k));
      T.at('clearing', 20, 2); out.dusk = !T.out().length;
      return out;
    });
    check(r.shift >= 4, 'at six the day shift goes up the track to the headframe as the night shift comes down (' + r.shift + ')');
    check(r.dayIn && r.mender, 'by day the shifts are down the quarry or home, and a Hedge-mender is at the thorn');
    check(r.inTown && r.notBoth && r.walkingIn, 'the farmer\'s wife comes in by the road at first light and is in Oakhaven (wave 1) while she is not on the track: never in both');
    check(r.nightOut && r.dusk, 'the night shift goes out before the gate is barred; after dusk the clearing is the hounds\'');
    r = await page.evaluate(() => {
      const out = {};
      G.flags.rite_started = true; T.at('clearing', 6.4, 2); out.rite = !LIFE60.people(G.map).length; delete G.flags.rite_started;
      // one still on the way in when the hour turns back to a job just turns round: no jump back to a door
      T.at('p30_hollow', 17.95, 2); const w = T.who('hw_air'); G.tod = 18.01 / 24; T.run(0.4); const a = [w.x, w.y], hid = w.hidden;
      G.tod = 17.5 / 24; T.run(0.1); out.turn = !hid && !w.hidden && Math.hypot(w.x - a[0], w.y - a[1]) < 0.3;
      return out;
    });
    check(r.rite, 'from the Rite on nobody is on the track: both shifts are kept on at the quarry');
    check(r.turn, 'someone still walking in when their next stop starts turns round where they are, and does not jump back to a door');

    // ---- the Bell Yard: the court at dusk, the loops by day
    r = await page.evaluate(() => {
      const out = {};
      T.at('p31_bellyard', 17.95, 2); const p = T.who('by_plank'); out.painted = !!Engine.sprites.p62_hollow_a; out.before = !p.hidden;
      G.tod = 18.05 / 24; T.run(45); out.gone = p.hidden && Math.hypot(p.x - 32.4, p.y - 11.5) < 0.3;
      T.at('p31_bellyard', 5.5, 2); out.back = T.out().length >= 6;
      out.book = ['p31_sweeper', 'p31_jugs', 'p31_shutters', 'p31_twice'].every((id) => G.map.entities.some((e) => e.id === id));
      return out;
    });
    check(r.painted && r.before && r.gone, 'at dusk the Bell Yard\'s Hollows walk out through the archway into the Sunken Court, the way leaves do');
    check(r.back && r.book, 'at five they are back at their loops, and the Yard\'s own (the sweeper, the jugs, the shutters, the man against the wall) are where they were');

    // ---- talking, overhearing, the contract
    r = await page.evaluate(() => {
      const out = {};
      T.at('flume_landing', 10, 2); const c = T.who('ld_rope'); talk(c); out.talk = G.state === 'dialogue' && /lashing/.test(document.body.innerHTML) && !!document.querySelector('[data-life]');
      try { document.getElementById('d-bye').click(); } catch (e) { /* none */ } G.state = 'play';
      window.__msgs.length = 0; T.at('flume_landing', 10, 2); const e = T.who('ld_rope'); Engine.cam.x = e.x + 1.0; Engine.cam.y = e.y - 1.0; T.run(14, () => { Engine.cam.x = e.x + 1.0; Engine.cam.y = e.y - 1.0; });
      out.bark = window.__msgs.some((t) => /^A wharf hand/.test(t) || /^An eel-catcher/.test(t));
      T.at('p30_hollow', 10, 2); out.unsaved = !/p60_/.test(JSON.stringify(snapshotGame()));
      G.flags.greening = true; out.gone = ['flume_landing', 'flume_lowrings', 'p30_hollow', 'clearing'].every((id) => { T.at(id, 10, 2); return !LIFE60.people(G.map).length; });
      T.at('p31_bellyard', 10, 2); out.yardStays = LIFE60.people(G.map).length > 0; delete G.flags.greening;
      T.at('clearing', 10, 2); out.back = LIFE60.people(G.map).length > 0;
      return out;
    });
    check(r.talk, 'you can speak to them, and they have a question of their own');
    check(r.bark, 'stand by the pier and you overhear them');
    check(r.unsaved, 'nothing of theirs is saved');
    check(r.gone && r.yardStays && r.back, 'after the Greening the Hedge-side places are empty of them; the Bell Yard\'s Hollows are not the Greening\'s to take');

    await frCheck(page, 'p74-smallplaces.tsv', 'LIFE74', 'the small places\' people');
    check(!errors.length, 'no errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
