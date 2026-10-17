// PLAYWRIGHT_MODULE=/path/to/playwright node test/visual.test.js
// Uses the managed preview; never starts a server. Screenshots go outside source.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', e => errors.push(e.message));
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3000');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Angle Tester');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click();
    await page.locator('#c-next').click();
    // Biography choices followed by the extra origin/class-trait selection.
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else {
        const next = page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first();
        if (!(await next.count())) throw new Error('Unknown creation step: ' + await page.locator('#create-panel').innerText());
        await next.click();
      }
    }
    await page.locator('#c-go').click();
    await page.locator('#btn-intro-skip').click();
    await page.keyboard.press('i');
    await page.locator('.paper-doll svg').waitFor({ state: 'visible' });
    assert(await page.locator('.paper-doll').innerText().then(t => t.includes('THE TRAVELLER')));
    console.log('PASS normal Begin → character creation → inventory keyboard flow');
    const result = await page.evaluate(() => {
      function check(ok, label) { if (!ok) throw new Error(label); }
      check(Object.values(G.maps).some(m => m.entities.some(e => e.glassLamp)), 'glass lamp placed in playable map');
      const e = { kind: 'enemy', sprite: 'proctor', x: 0, y: 0, facing: 0 };
      const expected = [0, 1, 2, 3, 4, 3, 2, 1];
      for (let i = 0; i < 8; i++) {
        const a = animViewAngle(e, { x: Math.cos(i * Math.PI / 4), y: Math.sin(i * Math.PI / 4) });
        check(a.view === expected[i] && a.flip === (i > 4), 'octant ' + i);
      }
      const cam = { ...Engine.cam };
      Object.assign(Engine.cam, { x: -2, y: 0, dir: 0 });
      const back = animDirectionalSprite(e).sprite;
      check(back !== Engine.sprites.proctor && back.data.some(p => p >>> 24), 'rear artwork exists');
      Engine.cam.dir = 2;
      check(animDirectionalSprite(e).sprite === back, 'camera yaw does not change enemy heading');
      e.animSprite = 'proctor_w1';
      check(animDirectionalSprite(e).sprite !== back, 'walk pose preserved');
      const hashes = new Set();
      for (let v = 1; v <= 4; v++) {
        const sp = animProctorView(v, ''); let hash = 0;
        for (const p of sp.data) hash = (Math.imul(hash, 31) + p) | 0;
        hashes.add(hash);
      }
      check(hashes.size === 4, 'four distinct non-front drawings');
      check(PROCTOR_VIEWS.size <= 24, 'bounded directional cache');
      check(animDirectionalSprite({ ...e, sprite: 'hound', animSprite: null }).sprite === Engine.sprites.hound, 'other species fallback');
      Object.assign(Engine.cam, cam);
      const p = G.player;
      p.inv.push({ id: 'a_plate', n: 1 }, { id: 'a_kite', n: 1 });
      p.armor = { head: 'a_bellhelm', body: 'a_plate', hands: 'a_gauntlets', feet: 'a_greaves', shield: 'a_kite' };
      p.weapons = ['sword', 'spear']; p.weapon = 0;
      const one = inventoryDoll();
      for (const id of Object.values(p.armor)) check(one.includes(ARMOR[id].name), 'slot ' + id);
      p.weapon = 1; check(inventoryDoll().includes('shield stowed'), 'two-handed shield suppressed');
      p.weapon = 0; renderInventory();
      // Rendering fixture: compare a real wall/floor framebuffer with/without
      // emitters, including removal when a shard is hidden or dead.
      const map = new GameMap('light-test', 'Test', 8, 8, { floor: 't_flag', ceil: 't_stone', fogDist: 8 });
      map.border('t_stone');
      // Use the fixture consistently for renderer and weather/particle wrappers;
      // the live Oakhaven rain/leaves are intentionally time-varying.
      const liveMap = G.map, liveId = G.mapId;
      G.map = map; G.mapId = map.id; Engine.setMap(map);
      Object.assign(Engine.cam, { x: 4, y: 4, dir: 0, pitch: 0, bob: 0 });
      function pixels(ents) {
        Engine.render(ents, 0, {});
        return Engine.ctx.getImageData(0, 0, VW, VIEW_H).data;
      }
      const dark = pixels([]);
      const shard = { kind: 'item', item: 'shard', x: 6, y: 4 };
      const lit = pixels([shard]);
      check(lit.some((v, i) => i % 4 !== 3 && v > dark[i]), 'shard lights wall/floor pixels');
      shard.hidden = true; check(pixels([shard]).every((v, i) => v === dark[i]), 'hidden shard emits nothing');
      shard.hidden = false; shard.dead = true; check(pixels([shard]).every((v, i) => v === dark[i]), 'dead shard emits nothing');
      check(pixels([{ sprite: 'kaelen', x: 6, y: 4 }]).some((v, i) => i % 4 !== 3 && v > dark[i]), 'Kaelen emits light');
      check(pixels([{ glassLamp: true, x: 6, y: 4 }]).some((v, i) => i % 4 !== 3 && v > dark[i]), 'glass lamp emits light');
      const target = { kind: 'enemy', sprite: 'proctor', x: 5.5, y: 4, facing: 0, scale: 1 };
      const rearPixels = pixels([target]);
      check(target._screen && Engine.pick([target], 3) === target, 'rear view remains pickable');
      target.facing = Math.PI;
      check(pixels([target]).some((v, i) => v !== rearPixels[i]), 'real renderer changes front/back output');
      G.map = liveMap; G.mapId = liveId; Engine.setMap(liveMap); Object.assign(Engine.cam, cam);
      return { octants: 8, views: hashes.size + 1, cache: PROCTOR_VIEWS.size };
    });
    console.log('PASS directional, gear and real framebuffer assertions', result);
    await page.screenshot({ path: '/tmp/octave-inventory.png' });
    await page.locator('[data-off="body"]').click();
    assert((await page.locator('.paper-doll svg title').textContent()).includes('Body: none'));
    await page.locator('[data-use]').filter({ hasText: 'Wear' }).first().click();
    assert(!(await page.locator('.paper-doll svg title').textContent()).includes('Body: none'));
    await page.locator('[data-w="1"]').click();
    await page.waitForFunction(() => document.querySelector('.paper-doll figcaption').textContent.includes('shield stowed'));
    console.log('PASS inventory remove/wear/weapon buttons update doll');
    const deaths = await page.evaluate(() => {
      function check(ok, label) { if (!ok) throw new Error(label); }
      // Freeze gameplay while exercising the real kill/render/map/save paths.
      G.state = 'panel'; closeModal();
      const map = G.map, id = G.mapId, cam = { ...Engine.cam };
      const p = G.player; p.level = 50; p.xp = 0;
      const enemy = hydrate({ kind: 'enemy', type: 'proctor', x: cam.x + 1, y: cam.y, name: 'Regression guard' });
      G.ents.push(enemy);
      const before = p.kills, xp = p.xp;
      killEnemy(enemy, false);
      const body = G.ents.find(e => e.deathArt && e.x === enemy.x && e.y === enemy.y);
      check(body && body.dieStyle === 'fall', 'kill spawns collapse visual');
      check(p.kills === before + 1 && p.xp === xp + ENEMIES.proctor.xp, 'kill reward exactly once');
      killEnemy(enemy, false);
      check(p.kills === before + 1 && p.xp === xp + ENEMIES.proctor.xp, 'repeat kill is inert');
      check(G.ents.filter(e => e.deathArt && e.x === enemy.x && e.y === enemy.y).length === 1, 'one body per kill');
      const frames = new Set();
      for (const t of [0, 0.4, 0.79]) {
        body.dieT = t; animDying(body, 0);
        let hash = 0; for (const px of animDeathSprite(body).data) hash = (Math.imul(hash, 31) + px) | 0;
        frames.add(hash);
      }
      check(frames.size === 3, 'three distinct collapse silhouettes');
      animDying(body, 2); animDeco(body, 0.1, 0, map.outdoor);
      check(body.corpse && !body.dead && !body.hidden && !body.dying && body.animAlpha === 1, 'body remains opaque after collapse');
      check(body.nopick && !body.solid, 'corpse cannot block or interact');
      Object.assign(Engine.cam, { dir: 0, pitch: 0, bob: 0 });
      Engine.render([body], 0.5, {});
      check(body._screen && Engine.pick([body], 3) === null, 'rendered body is unpickable');
      const saved = snapshotGame();
      check(!saved.maps[id].extra.some(e => e.kind === 'deco' && e.sprite === body.sprite && e.x === body.x && e.y === body.y), 'transient body excluded from save');
      check(saved.maps[id].extra.some(e => e.kind === 'enemy' && e.dead), 'enemy dead state still saved');
      const water = new GameMap('water-death', 'Water fixture', 8, 8, { floor: 't_water' });
      G.map = water;
      const hollow = animSpawnDeath(hydrate({ kind: 'enemy', type: 'drowned', x: 3, y: 3 }));
      check(hollow.dieStyle === 'sink', 'water Hollow sinks');
      animDying(hollow, 0.7);
      check(hollow.deathStage > 0 && hollow.animAlpha < 1, 'sinking advances clipping and fade');
      animDying(hollow, 2); check(hollow.dead && hollow.hidden && !hollow.corpse, 'sunken Hollow disappears');
      G.map = map;
      const dry = animSpawnDeath(hydrate({ kind: 'enemy', type: 'drowned', x: 23, y: 4 }));
      check(dry.dieStyle === 'fall', 'dry-land Hollow leaves a body');
      for (const type of ['mites', 'hushmoth']) {
        const cloud = animSpawnDeath(hydrate({ kind: 'enemy', type, x: 3, y: 3 }));
        check(cloud.dieStyle === 'scatter', type + ' scatters');
        const start = animDeathSprite(cloud); animDying(cloud, 0.4);
        check(animDeathSprite(cloud).data.some((px, i) => px !== start.data[i]), type + ' fragments move');
        animDying(cloud, 2); check(cloud.hidden && !cloud.corpse, type + ' leaves no body');
      }
      // All catalog species must produce valid, cached art without replacing
      // gameplay entities; this includes bosses and nonphysical dissolves.
      for (const type of Object.keys(ENEMIES)) {
        const ghost = animSpawnDeath(hydrate({ kind: 'enemy', type, x: 23, y: 4 }));
        check(ghost.deathArt && animDeathSprite(ghost).data.some(px => px >>> 24), type + ' death art');
        check(animDeathSprite(ghost) === animDeathSprite(ghost), type + ' cached pose');
        animDying(ghost, ghost.dieDur + 0.1);
        check(ghost.corpse || ghost.hidden, type + ' terminates');
      }
      const count = Object.keys(ENEMIES).length;
      const next = id === 'clearing' ? 'oakhaven' : 'clearing';
      loadMap(next);
      check(!map.entities.some(e => e.transient), 'departure clears all old-area corpses/effects');
      loadMap(id, cam);
      check(!G.ents.some(e => e.transient), 'revisit does not resurrect corpses');
      restoreGame(JSON.parse(JSON.stringify(saved)));
      check(G.ents.some(e => e.kind === 'enemy' && e.dead && e.name === 'Regression guard'), 'save/load preserves killed enemy');
      check(!G.ents.some(e => e.deathArt || e.corpse), 'save/load does not serialize corpse art');
      G.state = 'panel';
      return { species: count, collapsePoses: frames.size };
    });
    console.log('PASS deaths, rewards, corpses, save/load and departure cleanup', deaths);
    await page.evaluate(() => {
      closeModal(); hide('#title'); G.state = 'panel';
      const c = Engine.ctx; c.fillStyle = '#18141e'; c.fillRect(0, 0, VW, VH);
      for (let v = 0; v < 5; v++) {
        const sp = v === 0 ? Engine.sprites.proctor : animProctorView(v, '');
        const canvas = document.createElement('canvas'); canvas.width = sp.w; canvas.height = sp.h;
        const data = new ImageData(new Uint8ClampedArray(sp.data.buffer), sp.w, sp.h);
        canvas.getContext('2d').putImageData(data, 0, 0);
        c.drawImage(canvas, v * 64, 35, 64, 96);
        c.fillStyle = '#dcc69f'; c.font = '9px serif'; c.fillText(['Front', 'Front-side', 'Side', 'Back-side', 'Back'][v], v * 64 + 4, 150);
      }
    });
    await page.screenshot({ path: '/tmp/octave-directions.png' });
    assert.deepEqual(errors, [], 'no runtime errors');
    console.log('PASS browser runtime; screenshots: /tmp/octave-{inventory,directions}.png');
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
