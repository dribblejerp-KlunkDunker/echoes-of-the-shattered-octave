// Phase 124b: before / after pictures for the recoloured townsfolk keeping their skin. Writes figure PNGs (the maker's
// own pixels, and the kept skin) and two in-game frames each way to the folder given. Run through browser.sh.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const FIGS = ['p60_man_a', 'p17c_oona', 'p60_wom_c', 'p60_man_b', 'p61_clerk', 'p17c_sloe', 'p62_hollow_b', 'p22_gideon'];
(async () => {
  const OUT = process.argv[2] || '/home/claude/army124/F/shots/skin'; fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 960, height: 600 } })).newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4225') + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 240000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play', null, { timeout: 120000 });
  const figs = await page.evaluate((FIGS) => {
    closeModal(); hide('#event'); GFX.illustratedScreens = false; window.requestAnimationFrame = () => 0; GFX.keepSkin = true; FACES124.sync();
    const tryLoad = (id) => { try { loadMap(id, {}); } catch (e) { /* skip */ } };
    G.day = 4; G.tod = 0.5; tryLoad('oakhaven'); for (const id of ['cantabile_harbour', 'flume_landing', 'whispergrove', 'p22_combe', 'oakhaven']) tryLoad(id);
    G.day = 3; tryLoad('oakhaven'); const reg = FACES124.recolours(), png = (w, h, data) => { const c = document.createElement('canvas'); c.width = w; c.height = h; c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(data.buffer.slice(0)), w, h), 0, 0); return c.toDataURL('image/png'); };
    const out = {};
    for (const n of FIGS) { const sp = Engine.sprites[n]; if (!sp) continue; const e = reg.find((x) => x.data === sp.data); out[n] = { before: png(sp.w, sp.h, e.tinted), after: png(sp.w, sp.h, sp.data) }; }
    return out;
  }, FIGS);
  for (const [n, v] of Object.entries(figs)) for (const k of ['before', 'after']) fs.writeFileSync(path.join(OUT, n + '_' + k + '.png'), Buffer.from(v[k].split(',')[1], 'base64'));
  // in the world: stand in front of the person and look at them, switch off then on
  const scene = async (name, map, sprite, tod) => {
    const r = await page.evaluate(([map, sprite, tod]) => {
      for (const day of [0, 1, 2, 3]) {
        G.day = day; G.tod = tod; loadMap(map, {}); G.state = 'play'; G.fadeT = 0;
        for (let i = 0; i < 20; i++) window.advanceTime(250);
        const ents = (G.ents || G.map.entities || []).filter((e) => e && e.sprite === sprite);
        for (const e of ents) for (const a of [0, 1, 2, 3, 4, 5, 6, 7].map((k) => k * Math.PI / 4)) {
          const x = e.x + Math.cos(a) * 1.5, y = e.y + Math.sin(a) * 1.5; if (G.map.isBlocked && G.map.isBlocked(x | 0, y | 0)) continue;
          const d = Math.atan2(e.y - y, e.x - x); window.__hold = { e, x, y, d, sprite }; return { ok: true, at: [x, y, d], day };
        }
      }
      return { ok: false };
    }, [map, sprite, tod]);
    if (!r.ok) { console.log('not found: ' + sprite + ' on ' + map); return; }
    for (const v of [false, true]) {
      await page.evaluate((v) => { GFX.keepSkin = v; FACES124.sync(); const h = window.__hold; for (let i = 0; i < 8; i++) { const c = G.player; c.x = h.x; c.y = h.y; c.dir = h.d; Engine.cam.x = h.x; Engine.cam.y = h.y; Engine.cam.dir = h.d; h.e.sprite = h.sprite; window.advanceTime(1000 / 60); try { closeModal(); hide('#event'); } catch (er) { /* none */ } } for (const s of ['#msgs']) { const n = document.querySelector(s); if (n) n.innerHTML = ''; } }, v);
      await page.waitForTimeout(200);
      await page.screenshot({ path: path.join(OUT, name + (v ? '_after' : '_before') + '.png'), clip: { x: 0, y: 0, width: 960, height: 450 } });
    }
    console.log(name + ' ' + JSON.stringify(r));
  };
  await scene('road', 'p79_road_w', 'p60_man_a', 0.4);
  await scene('cantabile', 'cantabile_harbour', 'p17c_oona', 0.5);
  await browser.close();
})();
