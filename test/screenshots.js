// PLAYWRIGHT_MODULE=/path/to/playwright node test/screenshots.js
// Uses the managed preview; never starts a server. Stages illustrative scenes
// in authored maps using real feature logic/UI, not painted or synthetic UI.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const output = path.join(__dirname, '..', 'screenshots');

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3000');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title');
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Rowan');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click();
    await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click();
    await page.locator('#btn-intro-skip').click();
    await page.evaluate(() => {
      G.state = 'panel';
      window.gallerySave = JSON.parse(JSON.stringify(snapshotGame()));
      // Freeze only this disposable capture page; step/render scenes explicitly
      // so UI and simulation timers cannot race the screenshot.
      window.requestAnimationFrame = () => 0;
    });
    await page.waitForTimeout(100); // drain the single already-queued frame
    await page.evaluate(() => {
      window.galleryScene = id => {
        restoreGame(JSON.parse(JSON.stringify(gallerySave)));
        loadMap(id); closeModal(); G.state = 'play';
        G.opts.touch = 'off'; setTouchMode(false); controlsTick();
        UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 };
        UPG.tutorial = false; G.fadeT = 0; G.noise = 1; G.tod = 0.5;
        G.keys = {}; G.vel.x = G.vel.y = 0; G.touch.fx = G.touch.fy = 0;
        document.querySelector('#msgs').innerHTML = '';
        document.querySelector('#hint').textContent = '';
        document.querySelector('#cover-status').hidden = true;
        document.querySelector('#lockhint').classList.remove('on');
        for (const e of G.ents) if (e.kind === 'enemy' || e.kind === 'npc') e.hidden = true;
      };
    });
    const capture = async (name, expectedPanel, heading, scrollable = false) => {
      if (expectedPanel) {
        assert.equal(await page.evaluate(() => G.openPanel), expectedPanel);
        await page.locator('#modal-panel h2').filter({ hasText: heading }).waitFor({ state: 'visible' });
        assert.equal(await page.locator('#modal-panel').evaluate(el => el.scrollWidth <= el.clientWidth + 1), true, name + ' has no horizontal overflow');
        if (!scrollable) assert.equal(await page.locator('#modal-panel button:enabled').evaluateAll(buttons => buttons.every(b => {
          const r = b.getBoundingClientRect(); return r.top >= 0 && r.bottom <= innerHeight;
        })), true, name + ' actions are visible');
      }
      const file = path.join(output, name + '.png');
      await page.locator('#game').screenshot({ path: file });
      const bytes = fs.readFileSync(file);
      assert.equal(bytes.toString('hex', 0, 8), '89504e470d0a1a0a');
      assert.equal(bytes.readUInt32BE(16), 1280);
      assert.equal(bytes.readUInt32BE(20), 800);
      assert(bytes.length > 5000, name + ' contains rendered content');
      console.log('PASS ' + path.relative(process.cwd(), file) + ' (1280x800, ' + bytes.length + ' bytes)');
    };

    await page.evaluate(() => {
      galleryScene('oakhaven');
      Object.assign(Engine.cam, { x: 23.5, y: 22.25, dir: Math.PI / 2, pitch: 0, bob: 0 });
      const e = G.ents.find(e => e.id === 'bettany');
      Object.assign(e, { x: 23.5, y: 23.5, facing: Math.PI / 2, hidden: false });
      G.player.skills.Stealth = 35; render(); openPickpocket();
    });
    await capture('stealth-pickpocket', 'pickpocket', 'A hand near the purse');

    await page.evaluate(() => {
      galleryScene('oakhaven');
      Object.assign(Engine.cam, { x: 23.5, y: 22.5, dir: Math.PI / 2, pitch: 0, bob: 0 });
      const guard = G.ents.find(e => e.lawGuard);
      Object.assign(guard, { x: 26.5, y: 27.5, hidden: false });
      render(); openDistractions();
    });
    await capture('stealth-distractions', 'distractions', 'A noise elsewhere');

    await page.evaluate(() => {
      galleryScene('oakhaven');
      const recess = G.ents.find(e => e.bodyCover);
      Object.assign(Engine.cam, { x: recess.x - 1, y: recess.y, dir: 0, pitch: 0, bob: 0 });
      if (solidAt(Engine.cam.x, Engine.cam.y, null)) throw new Error('Body scene camera must be on clear floor');
      const source = hydrate({ kind: 'enemy', type: 'proctor', x: recess.x - 0.2, y: recess.y });
      const body = animSpawnDeath(source); animDying(body, 2); G.dragBody = body;
      render(); openBody();
      if (document.querySelector('#body-hide').disabled) throw new Error('Concealment must be available in the screenshot');
    });
    await capture('stealth-body-hiding', 'body', 'What the patrol will find');

    await page.evaluate(() => {
      galleryScene('quarry');
      G.give('a_synodrobe'); equipArmor('a_synodrobe');
      document.querySelector('#msgs').innerHTML = ''; render(); openDisguise();
    });
    await capture('stealth-disguise', 'disguise', 'The borrowed registry');

    await page.evaluate(() => {
      closeModal(); G.state = 'panel'; renderInventory();
    });
    assert((await page.locator('.paper-doll svg title').textContent()).includes('Synod Clerk Robes'));
    // Inventory may scroll by design; verify the robe and paper doll, rather
    // than requiring every inventory action on one screen.
    await page.locator('.paper-doll').waitFor({ state: 'visible' });
    await capture('stealth-robes', 'inv', 'Inventory', true);

    await page.evaluate(() => {
      galleryScene('quarry'); G.give('a_synodrobe'); equipArmor('a_synodrobe');
      // Find a clear lane in an authored room, keeping walls/scenery intact.
      let scene = null;
      for (const room of G.map.rooms) {
        for (let y = room.y + 1; y < room.y + room.h - 1 && !scene; y++) {
          for (let x = room.x + 1; x < room.x + room.w - 3 && !scene; x++) {
            if ([0, 1, 2, 3].every(d => !solidAt(x + d + 0.5, y + 0.5, null))) scene = { x: x + 0.5, y: y + 0.5 };
          }
        }
        if (scene) break;
      }
      if (!scene) throw new Error('No clear inspection lane');
      Object.assign(Engine.cam, { ...scene, dir: 0, pitch: 0, bob: 0 });
      const guard = hydrate({ kind: 'enemy', type: 'proctor', x: scene.x + 2.2, y: scene.y, guard: true });
      G.ents.push(guard); G.coverSuspicion = 1.5; G.player.crime = {}; update(0);
      document.querySelector('#msgs').innerHTML = ''; render(); G.state = 'panel';
      if (!document.querySelector('#cover-status').textContent.includes('INSPECTION 50%')) throw new Error('Inspection screenshot must show live suspicion');
      if (!guard._screen) throw new Error('Inspection patrol must be rendered');
    });
    await page.locator('#cover-status').waitFor({ state: 'visible' });
    await capture('stealth-inspection');
    assert.deepEqual(errors, [], 'capture has no browser runtime errors');
    console.log('PASS six feature screenshots captured from the managed preview');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
