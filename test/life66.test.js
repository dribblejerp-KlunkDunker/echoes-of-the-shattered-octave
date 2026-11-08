// PREVIEW_URL=http://127.0.0.1:4074 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/life66.test.js
// The lived-in world, wave 4 (js/life66-small.js; ROADMAP R10): the small places keep the hours. Stillwater Landing (smugglers
// after dark), the Low Rings (by day, by the gangway), the Bell Yard and Ashlane (the Hollows' loops, out to the Sunken Court
// at dusk), the Hollow (whispered, and indoors while the Grafters' wagon is in on Rootday morning), and the clearing (the
// quarry shift through the North Gate at dawn and back before it shuts). Every stop is open, dry, reachable; every hour is
// covered once; nobody walks into deep water or up the Watch-stone; the places' own people are where they were; they are
// gone when the story empties the place; every line has French.
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

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /life60/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4074');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof LIFE66_SMALL !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Harbour Tester');
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
        go(id, h, day) { if (day != null) G.day = day; G.tod = h / 24; loadMap(id); G.state = 'play'; return G.map; },
        who(k) { return LIFE60.people(G.map).find((e) => e._life === k); },
        vis() { return LIFE60.people(G.map).filter((e) => !e.hidden).map((e) => e._life); },
        open(x, y) { const m = G.map, g = LIFE60.grid(m); return !g[Math.floor(y) * m.w + Math.floor(x)]; },
        ok(x, y) { const P = LIFE60.PLACES[G.mapId]; return T.open(x, y) && (!P.opts.walk || P.opts.walk(G.map, Math.floor(x), Math.floor(y))); },
        run(sec, fn) { for (let t = 0; t < sec; t += 0.1) { G.state = 'play'; LIFE60.tick(0.1); if (fn) fn(); } },
      };
    });
    const PLACES = { flume_landing: [7, 'p16f_pellam'], flume_lowrings: [3, null], p31_bellyard: [6, 'p31_twice'], p30_hollow: [9, 'p30_lissa'], clearing: [6, 'kaelen'] };

    // ---- the rosters: open, dry, reachable; every hour once; the places' own people where they were
    let r = await page.evaluate((PL) => {
      T.reset(); const out = { bad: [], n: {} };
      for (const id in PL) {
        const m = T.go(id, 10, 2), P = LIFE60.PLACES[id];
        out.n[id] = P.roster.length + '/' + LIFE60.people(m).length;
        if (P.roster.length < PL[id][0] || LIFE60.people(m).length !== P.roster.length) out.bad.push(id + ' staged ' + out.n[id]);
        if (PL[id][1] && !m.entities.some((e) => e.id === PL[id][1])) out.bad.push(id + ' lost ' + PL[id][1]);
        for (const p of P.roster) {
          const pts = [p.home]; if (p.exit) pts.push(p.exit);
          for (const s of p.day) { for (const q of [s.at, s.to2]) if (q) pts.push(q); if (typeof s.face === 'string' && !P.byKey[s.face]) out.bad.push(p.key + ' faces ' + s.face); }
          for (const q of pts) { if (!T.ok(q[0], q[1])) out.bad.push(p.key + ' not open ground ' + q); else if (!LIFE60.path(m, p.home[0], p.home[1], q[0], q[1])) out.bad.push(p.key + ' unreachable ' + q); }
          for (let h = 0; h < 24; h += 0.25) { const k = p.day.filter((s) => (s.from <= s.to ? h >= s.from && h < s.to : h >= s.from || h < s.to)).length; if (k !== 1) { out.bad.push(p.key + ' hour ' + h + ' x' + k); break; } }
          if (!NPCS['p60_' + p.key] || !NPCS['p60_' + p.key].greet.normal) out.bad.push(p.key + ' no lines');
        }
      }
      return out;
    }, PLACES);
    check(!r.bad.length, 'five places, everyone staged, every stop open, dry and reachable, every hour covered once, everyone has lines, and the places\' own people are where they were (' + JSON.stringify(r.n) + ' ' + r.bad.slice(0, 3).join('; ') + ')');

    // ---- they walk and keep off the water and the Watch-stone
    r = await page.evaluate((PL) => {
      const out = { off: [], moved: {} };
      for (const [id, h] of [['flume_landing', 22], ['flume_lowrings', 10], ['p31_bellyard', 10], ['p30_hollow', 10], ['clearing', 13.5]]) {
        T.go(id, h, 2); const ps = LIFE60.people(G.map).filter((e) => !e.hidden), p0 = ps.map((e) => [e.x, e.y]), far = ps.map(() => 0);
        for (let i = 0; i < 300; i++) { T.run(0.1); ps.forEach((e, j) => { if (!e.hidden && !T.ok(e.x, e.y)) out.off.push(id + ':' + e._life); far[j] = Math.max(far[j], Math.hypot(e.x - p0[j][0], e.y - p0[j][1])); }); }
        out.moved[id] = far.filter((d) => d > 1).length;
      }
      return out;
    }, PLACES);
    check(!r.off.length && Object.values(r.moved).every((n) => n >= 1), 'thirty seconds in each place: people come and go (' + JSON.stringify(r.moved) + '), and nobody steps into deep water or up the Watch-stone (' + r.off.slice(0, 3).join(', ') + ')');

    // ---- the hours of each place
    r = await page.evaluate(() => {
      const out = {};
      T.go('flume_landing', 10, 2); const l10 = T.vis(); T.go('flume_landing', 23, 2); const l23 = T.vis();
      out.landing = l10.includes('l_eel') && l10.includes('l_boy') && !l10.includes('l_smugA') && l23.includes('l_smugA') && l23.includes('l_look') && !l23.includes('l_eel');
      T.go('flume_lowrings', 11, 2); const r11 = T.vis(); T.go('flume_lowrings', 17, 2); const r17 = T.vis();
      out.rings = r11.length === 3 && r17.length === 0;
      T.go('p31_bellyard', 10, 2); const y10 = T.vis(); T.go('p31_bellyard', 22, 2); const y22 = T.vis();
      out.yard = y10.length === 6 && y22.length === 0;
      // at dusk they go out under the archway
      T.go('p31_bellyard', 17.97, 2); const j = T.who('y_joiner'); G.tod = 18.02 / 24; T.run(40);
      out.arch = j.hidden && Math.hypot(j.x - 32.4, j.y - 11.5) < 0.3;
      T.go('clearing', 3, 2); const c3 = T.vis(); T.go('clearing', 10, 2); const c10 = T.vis(); T.go('clearing', 5.8, 2); const c58 = T.vis();
      out.clearing = c3.length === 0 && c10.includes('c_qC') && c10.includes('c_sawA') && !c10.includes('c_qA') && c58.includes('c_qA');
      return out;
    });
    check(r.landing, 'the Landing: eels and a line off the piers by day; after dark a lookout at the lane head and crates going off a boat');
    check(r.rings, 'the Low Rings: three people by day by the gangway, nobody by five');
    check(r.yard && r.arch, 'the Bell Yard: six loops by day; at dusk they go out under the archway to the Sunken Court');
    check(r.clearing, 'the clearing: nobody at night; the pump-man and the sawyers by day; the quarry hands at the headframe at first light');

    // ---- the shift: through the North Gate at dawn, back out before it shuts
    r = await page.evaluate(() => {
      const out = {};
      T.go('clearing', 5.55, 2); const q = T.who('c_qA'); out.before = q.hidden;
      G.tod = 5.65 / 24; T.run(0.2); out.atGate = !q.hidden && Math.hypot(q.x - 20.5, q.y - 33.8) < 0.6;
      T.run(40); out.up = q.y < 12;
      G.tod = 18.25 / 24; T.run(40); out.gone = q.hidden && Math.hypot(q.x - 20.5, q.y - 33.8) < 0.4;
      return out;
    });
    check(r.before && r.atGate && r.up && r.gone, 'a quarry hand comes in at the North Gate at first light, walks up to the headframe, and goes back out of the gate before it shuts');

    // ---- the Hollow: whispered; indoors while the Grafters are in
    r = await page.evaluate(() => {
      const out = {};
      const root = (G.day = 1, HOLLOW30.grafting); T.go('p30_hollow', 10, 1); out.grafting = HOLLOW30.grafting();
      out.inside = T.vis().length === 0 && G.map.entities.some((e) => e.sprite === 'p30_wagon');
      T.go('p30_hollow', 10, 2); const w = T.who('h_water'); out.out = T.vis().length >= 6;
      // the wagon comes while you watch: they go indoors; it goes, and they come out again
      T.go('p30_hollow', 7.9, 1); const n = T.who('h_nbr'), m = T.who('h_moss'); G.tod = 8.2 / 24; T.run(30);
      out.wentIn = T.vis().filter((k) => k !== 'h_tanner').length === 0;
      G.tod = 14.2 / 24; T.run(30); out.back = !n.hidden && !m.hidden;
      window.__msgs.length = 0; T.go('p30_hollow', 10, 2); const b = T.who('h_beans'); Engine.cam.x = b.x + 1.2; Engine.cam.y = b.y; T.run(14, () => { Engine.cam.x = b.x + 1.2; Engine.cam.y = b.y; });
      out.whisper = window.__msgs.some((t) => /whispering/.test(t));
      // the tanner's hand goes through the back door to work
      T.go('p30_hollow', 6.95, 2); const t = T.who('h_tanner'); G.tod = 7.05 / 24; T.run(30); out.work = t.hidden && Math.hypot(t.x - 13.5, t.y - 1.4) < 0.4;
      return out;
    });
    check(r.grafting && r.inside && r.out, 'the Hollow: out about the lanes on an ordinary morning; indoors while the Grafters\' wagon is in');
    check(r.wentIn && r.back, 'when the wagon comes in they go indoors, and when it has gone they come out again');
    check(r.whisper, 'under the Hush, what you overhear is whispered');
    check(r.work, 'the tanner\'s hand goes through the tannery\'s back door at seven');

    // ---- the contract
    r = await page.evaluate(() => {
      const out = {};
      T.go('flume_landing', 10, 2); const e = T.who('l_reed'); talk(e); out.talk = G.state === 'dialogue' && /Flume-Reed/.test(document.body.innerHTML) && !!document.querySelector('[data-life]');
      try { document.getElementById('d-bye').click(); } catch (x) { /* none */ } G.state = 'play';
      out.unsaved = !/p60_[lrych]_/.test(JSON.stringify(snapshotGame()));
      G.flags.greening = true; T.go('flume_landing', 10, 2); const a = LIFE60.people(G.map).length; T.go('p30_hollow', 10, 2); const b = LIFE60.people(G.map).length; T.go('clearing', 10, 2); const c = LIFE60.people(G.map).length;
      T.go('p31_bellyard', 10, 2); const d = LIFE60.people(G.map).length; delete G.flags.greening;
      G.flags.part4 = true; T.go('p31_bellyard', 10, 2); const y = LIFE60.people(G.map).length; delete G.flags.part4;
      out.gone = !a && !b && !c && d === 6 && !y;
      return out;
    });
    check(r.talk, 'you can speak to them, and they have a question of their own');
    check(r.unsaved, 'nothing of theirs is saved');
    check(r.gone, 'after the Greening the Landing, the Hollow and the clearing are empty of them; the Bell Yard keeps its loops until the Kestrel leaves Whisper-Grove');

    await frCheck(page, 'p66-small.tsv', 'LIFE66_SMALL', 'the small places\' people');
    check(!errors.length, 'no errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
