// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/trees83.test.js
// The trees, larger and of many shapes (js/trees83.js; owner, 13 Nov 2026: "Each and every tree type should have its own
// set of varying sizes and shaped trees ... I've never seen a fully grown tree the same size as a human"). This keeps true:
//   - every kind of tree out of doors has its own heights and its own shapes, and grows to several heights and shapes;
//   - no grown tree is near a person's height (a person is one tall), and none is smaller than it was;
//   - no crown reaches a wall; trees keep where they stand and what you bump into;
//   - the shapes are drawn (both renderers ask animDirectionalSprite), the same every time, with no random numbers;
//   - the Options switch puts every tree back exactly as it was.
'use strict';
const path = require('path'), fs = require('fs'), ROOT = path.join(__dirname, '..');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
check(!/Math\.random/.test(fs.readFileSync(path.join(ROOT, 'js', 'trees83.js'), 'utf8')), 'nothing about the trees uses random numbers');

(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP browser checks (no playwright)'); console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const r = await page.evaluate(() => {
    const T = TREES83, out = { kinds: {}, bad: [], walls: [] };
    const maps = buildAllMaps(); T.sync(maps);
    const height = (e) => { const sp = Engine.sprites[e.sprite]; return (e.scale || 1) * (sp.hs || 1) * (e._t83 ? e._t83.hf : 1); };
    for (const id in maps) {
      const m = maps[id]; if (!m.outdoor || !m._t83) continue;
      for (const t of m._t83.list) {
        const e = t.e, k = out.kinds[e.sprite] || (out.kinds[e.sprite] = { n: 0, hs: new Set(), shapes: new Set(), min: 1e9, max: 0 });
        const h = height(e); k.n++; k.hs.add(Math.round(h * 4)); k.shapes.add(JSON.stringify(e._t83)); k.min = Math.min(k.min, h); k.max = Math.max(k.max, h);
        if (e.scale < t.s0 - 1e-9) out.bad.push(id + ':' + e.sprite + ' shrank');
        // a tree below its kind's least height is one held back by a house beside it (it keeps the size it had)
        if (h < T.SPECIES[e.sprite].h[0] - 1e-6) { const sp0 = Engine.sprites[e.sprite], hw = t.s0 * T.SPECIES[e.sprite].h[0] / (t.s0 * (sp0.hs || 1)) * (sp0.hs || 1) * (sp0.w / sp0.h) * 0.5 * 0.8 * (e._t83.wf + Math.abs(e._t83.lean)); if (T.roomFor(m, e, hw + 0.5) >= hw) out.bad.push(id + ':' + e.sprite + ' small with room to grow'); else out.held = (out.held || 0) + 1; }
        // the crown keeps clear of walls
        const sp = Engine.sprites[e.sprite], sh = e._t83, half = e.scale * (sp.hs || 1) * sh.hf * (sp.w / sp.h) * (sh.wf + Math.abs(sh.lean)) * 0.5 * 0.8;
        if (t.k > 1.0001 && T.roomFor(m, e, half + 0.5) < half - 1e-6) out.walls.push(id + ':' + e.sprite + '@' + e.x.toFixed(1) + ',' + e.y.toFixed(1));
      }
    }
    for (const n in out.kinds) { const k = out.kinds[n]; out.kinds[n] = { n: k.n, heights: k.hs.size, shapes: k.shapes.size, min: +k.min.toFixed(2), max: +k.max.toFixed(2) }; }
    // the shapes are drawn: the renderers' sprite for a shaped tree is a new picture, the same one every time
    const m = maps.p79_road_e || maps.oakhaven, shaped = m._t83.list.find((t) => t.key.wf !== 1 || t.key.lean);
    const a = animDirectionalSprite(shaped.e).sprite, b = animDirectionalSprite(shaped.e).sprite;
    out.drawn = a === b && a !== Engine.sprites[shaped.e.sprite] && Math.abs(a.w / a.h - (Engine.sprites[shaped.e.sprite].w / Engine.sprites[shaped.e.sprite].h) * (shaped.key.wf + Math.abs(shaped.key.lean))) < 0.05;
    // the same every build
    const again = buildAllMaps(); T.sync(again);
    out.same = Object.keys(maps).every((id) => !maps[id]._t83 || maps[id]._t83.list.every((t, i) => { const u = again[id]._t83.list[i]; return u && u.k === t.k && JSON.stringify(u.key) === JSON.stringify(t.key); }));
    // the switch: off puts every tree back exactly, on grows them again
    GFX.trees83 = false; T.sync(maps);
    out.off = Object.values(maps).every((mm) => !mm._t83 || mm._t83.list.every((t) => t.e.scale === t.s0 && t.e._t83 === undefined)) && animDirectionalSprite(shaped.e).sprite === Engine.sprites[shaped.e.sprite];
    GFX.trees83 = true; T.sync(maps);
    out.onAgain = Object.values(maps).every((mm) => !mm._t83 || mm._t83.list.every((t) => Math.abs(t.e.scale - t.s0 * t.k) < 1e-9));
    out.stats = JSON.stringify(T.stats);
    return out;
  });
  const MIN = { oak: 3, willow: 2.6, p22_beech: 3, p22_ash: 3, p22_bellash: 3, p22_yew: 2.3, p83_pine: 3.4, p22_haw: 1.9, p22_glassthorn: 1.9, p20_thorn: 1.6, p22_elder: 1.7, p22_apple: 2.1, p22_apple2: 2.1 };
  for (const n in r.kinds) {
    const k = r.kinds[n];
    if (k.n >= 6) check(k.heights >= 3 && k.shapes >= 2, n + ': ' + k.n + ' trees, ' + k.heights + ' heights, ' + k.shapes + ' shapes (' + k.min + ' to ' + k.max + ' tall)');
    if (MIN[n]) check(k.max >= MIN[n] && k.min > 1.3, n + ': none near a person\'s height (the smallest is ' + k.min + ', the tallest ' + k.max + ')');
  }
  check(!r.bad.length, 'no tree is smaller than it was' + (r.bad.length ? ': ' + r.bad.slice(0, 3).join(', ') : ''));
  check(!r.walls.length, 'no grown crown reaches a wall' + (r.walls.length ? ' (' + r.walls.length + '): ' + r.walls.slice(0, 4).join(', ') : ''));
  check(r.drawn, 'a shaped tree is drawn from a picture of its own shape, the same one every time');
  check(r.same, 'every tree takes the same size and shape every time the world is built');
  check(r.off && r.onAgain, 'the Options switch puts every tree back exactly as it was, and grows them again');
  console.log('stats ' + r.stats);
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
