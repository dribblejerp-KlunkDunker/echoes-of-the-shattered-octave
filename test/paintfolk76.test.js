// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/paintfolk76.test.js
// Phase 76 pilot, the paintings moving: the painted people keep their paintings (sharpened, twice the size) and are
// posed by the skeleton of js/pixelfolk75.js, from eight sides. Owner, 11 Nov: "give the paintings the same updated
// movement ... I just want the visuals to look more crisp in game".
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && Engine.sprites.lyra && typeof PAINTFOLK !== 'undefined', null, { timeout: 90000 });
  const r = await page.evaluate(() => {
    const out = { ids: PAINTFOLK.ids(), has: {}, per: {} };
    const same = (a, b) => a.w === b.w && a.h === b.h && a.data.every((v, i) => v === b.data[i]);
    for (const id of out.ids) {
      out.has[id] = PAINTFOLK.has(id); const src = Engine.sprites[id], o = {};
      const f0 = PAINTFOLK.frame(id, 'idle', 0, 0);
      o.size = [f0.w, f0.h, src.w, src.h]; o.hs = f0.hs; o.cx = f0.cx;
      // standing still, seen from the front, the picture is the painting: compare colour with the painting, 2x2 block by block
      let n = 0, diff = 0; const ox = Math.round(f0.cx * f0.w) - PAINTFOLK.model(id).rig.cx * 2, oy = f0.h - src.h * 2;
      for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const p = src.data[y * src.w + x]; if ((p >>> 24) < 128) continue; const X = x * 2 + ox, Y = y * 2 + oy; if (X < 0 || Y < 0 || X + 1 >= f0.w || Y + 1 >= f0.h) continue; let rr = 0, gg = 0, bb = 0, k = 0; for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) { const q = f0.data[(Y + j) * f0.w + X + i]; if (q >>> 24) { rr += q & 255; gg += (q >> 8) & 255; bb += (q >> 16) & 255; k++; } } if (!k) { diff += 255; n++; continue; } diff += (Math.abs(rr / k - (p & 255)) + Math.abs(gg / k - ((p >> 8) & 255)) + Math.abs(bb / k - ((p >> 16) & 255))) / 3; n++; }
      o.meanDiff = diff / n;
      const walk = []; for (let f = 0; f < 8; f++) walk.push(PAINTFOLK.frame(id, 'walk', f, 1));
      o.walkDistinct = walk.every((a, i) => walk.every((b, j) => i >= j || !same(a, b)));
      const sides = []; for (let q = 0; q < 8; q++) sides.push(PAINTFOLK.frame(id, 'idle', 0, q));
      o.sidesDistinct = sides.every((a, i) => sides.every((b, j) => i >= j || !same(a, b)));
      o.allDraw = ['idle', 'walk', 'talk', 'attack', 'hurt'].every((an) => { for (let q = 0; q < 8; q++) for (let f = 0; f < PAINTFOLK.COUNT[an]; f += 2) { const s = PAINTFOLK.frame(id, an, f, q); if (!s || s.w < 40 || s.h < 200 || s.w > 640) return false; let m = 0; for (let i = 0; i < s.data.length; i++) if (s.data[i] >>> 24) m++; if (m < 6000) return false; } return true; });
      o.emit = !!f0.emit && f0.emit.some((v) => v);
      const t0 = performance.now(); let k = 0; PAINTFOLK.cache.clear(); for (let q = 0; q < 8; q++) for (let f = 0; f < 8; f++) { PAINTFOLK.frame(id, 'walk', f, q); k++; } o.ms = (performance.now() - t0) / k;
      out.per[id] = o;
    }
    // everyone: every painting an NPC wears on any map, or in the cast list, is rigged (hand-laid, borrowed or measured)
    const use = new Set(); for (const id in G.maps) for (const e of (G.maps[id].entities || [])) if (e.kind === 'npc' && e.sprite) use.add(e.sprite); for (const k in NPCS) if (NPCS[k].sprite) use.add(NPCS[k].sprite);
    const all = { n: 0, rigged: 0, never: [], bad: [], kinds: {} };
    for (const id of use) { const sp = Engine.sprites[id]; if (!sp) continue; all.n++; const M = PAINTFOLK.model(id); if (!M) { all.never.push(id); continue; } all.rigged++;
      const kind = M.rig.auto || (M.rig.pose && M.rig.pose !== '_generic' ? 'borrowed' : 'hand'); all.kinds[kind] = (all.kinds[kind] || 0) + 1;
      const f0 = PAINTFOLK.render(id, 'idle', 0, 0), w1 = PAINTFOLK.render(id, 'walk', 0.25, 1), w2 = PAINTFOLK.render(id, 'walk', 0.75, 1), bk = PAINTFOLK.render(id, 'walk', 0.25, 4);
      let m = 0; if (f0) for (let i = 0; i < f0.data.length; i++) if (f0.data[i] >>> 24) m++; let src = 0; for (let i = 0; i < sp.data.length; i++) if ((sp.data[i] >>> 24) >= 128) src++;
      if (!f0 || !w1 || !w2 || !bk || same(w1, w2) || m < src * 3.2 || m > src * 4.8 || Math.abs(f0.hs - (sp.hs || 1) * f0.h / (sp.h * 2)) > 0.02) all.bad.push(id); }
    out.all = all;
    // in play a painting is rigged in a quiet moment: asked for, it is not ready at once, and nothing is drawn wrong meanwhile
    PAINTFOLK.source('townswoman', Engine.sprites.townswoman); out.lazy = PAINTFOLK.ready('townswoman') === false && PAINTFOLK.stats().waiting >= 1;
    // the chooser: on, a rigged person gets a moving-painting frame; off, the painting as before; an unrigged one is untouched
    const cam = Engine.cam, e = { kind: 'npc', sprite: 'townsman', x: cam.x + 2, y: cam.y, scale: 1 }, h = { kind: 'enemy', sprite: 'hound', x: cam.x + 2, y: cam.y, scale: 1 };
    GFX.paintfolk = true; out.on = !!animDirectionalSprite(e).sprite.paintfolk;
    GFX.paintfolk = false; out.off = !animDirectionalSprite(e).sprite.paintfolk;
    GFX.paintfolk = true; out.other = !animDirectionalSprite(h).sprite.paintfolk;
    out.switches = GFX.ART.includes('paintfolk') && GFX.pixelfolk === false;
    return out;
  });
  check(['kaelen', 'townsman', 'legionnaire', 'lyra'].every((id) => r.has[id]), 'the four hand-rigged paintings are loaded');
  for (const id of r.ids) {
    const o = r.per[id];
    check(o.size[1] >= o.size[3] * 2 - 2 && o.size[1] <= o.size[3] * 2 && Math.abs(o.hs - 1) < 0.01, id + ': twice the painting\'s pixels, the same height in the world (' + o.size.join(',') + ')');
    check(o.meanDiff < 14, id + ': standing still and seen from the front it is the painting (mean colour difference ' + o.meanDiff.toFixed(1) + ' of 255)');
    check(o.walkDistinct, id + ': eight different walk frames');
    check(o.sidesDistinct, id + ': eight different sides');
    check(o.allDraw, id + ': every animation draws a whole body from every side');
    check(o.ms < 60, id + ': a new frame costs ' + o.ms.toFixed(1) + ' ms (then it is cached)');
  }
  check(r.per.kaelen.emit && !r.per.townsman.emit, "Kaelen's glass arm still glows; nothing on the orchardman does");
  check(r.all.n >= 25 && r.all.rigged >= r.all.n - 4 && r.all.never.every((id) => ['orla', 'cat', 'p31_seated', 'p17p_solenne'].includes(id)), 'every NPC painting in the game is rigged: ' + r.all.rigged + ' of ' + r.all.n + ' (' + JSON.stringify(r.all.kinds) + '; left still: ' + (r.all.never.join(', ') || 'none') + ')');
  check(!r.all.bad.length, 'each of them stands as its painting and walks from the front, the side and the back' + (r.all.bad.length ? ' (not: ' + r.all.bad.join(', ') + ')' : ''));
  check(r.lazy, 'a painting first seen in play is rigged in a quiet moment, not in the middle of a frame');
  check(r.on && r.off && r.other, 'the switch: on draws the moving painting, off the still one, and unrigged creatures are untouched');
  check(r.switches, 'Moving paintings is an art switch, on by default; the drawn pixel figures are off by default');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
