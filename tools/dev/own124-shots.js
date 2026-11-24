// Phase 124c: the talk window open on each person who has a face of their own (switch on), and one with the switch off,
// in the game, standing before them on their own map. Writes PNGs to the folder given. Run through tools/dev/browser.sh:
//   PREVIEW_URL=http://127.0.0.1:4227 tools/dev/browser.sh node tools/dev/own124-shots.js /tmp/own124
// No Math.random: the person is found on their map and the camera set a step in front of them.
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || '/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const SHOTS = [['marrable_on', 'p113f_marrable', 'p47_stones', true], ['marrable_off', 'p113f_marrable', 'p47_stones', false],
  ['watch132_on', 'p100_tr_b', 'p100_halls', true], ['tip_trooper_on', 'p113_trooper', 'p100_wall', true], ['tallyman_on', 'p97_tallyman', 'p97_mile', true]];
(async () => {
  const OUT = process.argv[2] || '/tmp/own124'; fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await (await browser.newContext({ viewport: { width: 960, height: 600 } })).newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4227') + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 240000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play', null, { timeout: 120000 });
  for (const [name, id, map, on] of SHOTS) {
    const r = await page.evaluate(([id, map, on]) => {
      try { closeModal(); hide('#event'); } catch (e) { /* none */ }
      GFX.ownFaces = on; G.tod = 0.5; G.state = 'play'; G.fadeT = 0; loadMap(map, {});
      for (let i = 0; i < 12; i++) window.advanceTime(250);
      const e = (G.map.entities || []).find((x) => x && x.kind === 'npc' && x.id === id); if (!e) return { ok: false };
      let at = null; for (const a of [0, 1, 2, 3, 4, 5, 6, 7].map((k) => k * Math.PI / 4)) { const x = e.x + Math.cos(a) * 1.4, y = e.y + Math.sin(a) * 1.4; if (G.map.isBlocked && G.map.isBlocked(x | 0, y | 0)) continue; at = [x, y, Math.atan2(e.y - y, e.x - x)]; break; }
      if (at) { const c = G.player; c.x = Engine.cam.x = at[0]; c.y = Engine.cam.y = at[1]; c.dir = Engine.cam.dir = at[2]; }
      for (let i = 0; i < 6; i++) window.advanceTime(1000 / 60);
      try { closeModal(); hide('#event'); } catch (er) { /* none */ } const m = document.querySelector('#msgs'); if (m) m.innerHTML = '';
      talk(e); const img = document.querySelector('#modal-panel .dlg .port img');
      return { ok: true, src: img ? img.getAttribute('src') : null, state: G.state };
    }, [id, map, on]);
    await page.waitForTimeout(700);
    await page.screenshot({ path: path.join(OUT, name + '.png') });
    console.log(name + ' ' + JSON.stringify(r));
  }
  await browser.close();
})();
