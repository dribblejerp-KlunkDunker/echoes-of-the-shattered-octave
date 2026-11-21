// node closeup107.js <type|sprite:name> [...]   env: MAP (default oakhaven), DIST (1.6), OUTDIR, FLAG (GFX flag to compare, default sharpSprites)
// Phase 107: each enemy type (or a sprite by name, "sprite:p22_beech") stood DIST in front of you in the 3D view, at
// midday, photographed with the flag off and on. Pictures: OUTDIR/<name>-off.png and -on.png (the view only).
const path = require('path'); const fs = require('fs'); const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const OUT = process.env.OUTDIR || path.join(__dirname, 'out', 'closeup'), MAP = process.env.MAP || 'oakhaven', DIST = +(process.env.DIST || 1.6), FLAG = process.env.FLAG || 'sharpSprites';
fs.mkdirSync(OUT, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] });
  const page = await (await browser.newContext({ viewport: { width: 1280, height: 800 } })).newPage();
  const errs = []; page.on('pageerror', (e) => errs.push(e.message.slice(0, 160)));
  await page.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
  await page.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4176') + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => { PRESETS.apply('medium'); window.requestAnimationFrame = () => 0; });
  for (const what of process.argv.slice(2)) {
    for (const v of [false, true]) {
      const ok = await page.evaluate(([what, MAP, DIST, FLAG, v]) => {
        closeModal(); G.tod = 0.5; const m = G.maps[MAP], sp = m.spawn; loadMap(MAP, { x: sp.x, y: sp.y, dir: sp.dir || 0 });
        G.state = 'play'; G.fadeT = 0; G.player.hp = G.player.hpMax = 9999; Engine.cam.pitch = 0; UPG.tutorial = false;
        for (const e of G.ents) if (e.kind === 'enemy' || e.kind === 'npc') e.hidden = true;
        const x = Engine.cam.x + Math.cos(Engine.cam.dir) * DIST, y = Engine.cam.y + Math.sin(Engine.cam.dir) * DIST;
        let e;
        if (what.startsWith('sprite:')) e = hydrate({ kind: 'deco', sprite: what.slice(7), x, y, solid: false });
        else { if (!ENEMIES[what]) return false; e = hydrate({ kind: 'enemy', type: what, x, y }); e.state = 'idle'; e.passive = true; }
        e.dir = Engine.cam.dir + Math.PI; G.ents.push(e);
        GFX[FLAG] = v; if (GFX.changed) GFX.changed();
        for (let i = 0; i < 12; i++) { advanceTime(1000 / 30); for (const n of ['#msgs']) { const q = document.querySelector(n); if (q) q.innerHTML = ''; } if (e.hp != null) e.state = 'idle'; }
        return true;
      }, [what, MAP, DIST, FLAG, v]);
      if (!ok) { console.log('no such type', what); break; }
      await page.waitForTimeout(500);
      await page.screenshot({ path: path.join(OUT, what.replace(/[:/]/g, '_') + '-' + (v ? 'on' : 'off') + '.png'), clip: { x: 0, y: 0, width: 1280, height: 600 } });
    }
    console.log('shot', what, errs.length ? 'ERRORS ' + JSON.stringify(errs.slice(0, 2)) : '');
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
