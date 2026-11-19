// mutton101 — Phase 101: mutton on the menus built after Phase 22.
//  - Corvin Ash, Brenna Corliss and One-Oh-Six each list it, once, after what they already sold;
//  - running the installer again adds nothing;
//  - what the R2 canon sweep holds stays held: Hetty and Oakhaven's market salt only, the bakers none, Ambrose none;
//  - Phase 22's own lists are untouched;
//  - bought through the real trade window at the issue-hatch and at the Keel Docks, at the right price, and eaten.
// SHOT_DIR=<folder> also saves a picture of each trade window.
'use strict';
const assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = (process.env.PREVIEW_URL || 'http://127.0.0.1:3000') + '/index.html?nosw=1';
const SHOTS = process.env.SHOT_DIR || '';

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const pass = (m) => console.log('PASS ' + m);
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'error') errors.push('console: ' + m.text()); });
    await page.addInitScript(() => { try { localStorage.clear(); } catch (e) { /* none */ } window.__r3d21 = { automation: true }; let a = 101; Math.random = () => { a = (a + 0x6D2B79F5) >>> 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; });
    await page.goto(URL);
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 120000 });
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Mutton Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForTimeout(500);
    await page.evaluate(() => {
      window.__checks = [];
      window.check = (ok, label) => { window.__checks.push([!!ok, label]); };
      window.go = (id) => { loadMap(id); G.state = 'play'; G.fadeT = 0; try { closeModal(); } catch (e) { /* none */ } G.state = 'play'; };
      for (const m in G.maps) for (const e of G.maps[m].entities) if (e.kind === 'enemy') e.hidden = true;
    });
    const results = async (title) => {
      const r = await page.evaluate(() => { const c = window.__checks; window.__checks = []; return c; });
      const bad = r.filter((c) => !c[0]).map((c) => c[1]);
      assert.equal(r.length > 0, true, title + ': no checks ran');
      assert.deepEqual(bad, [], title + ': ' + bad.join('; '));
      pass(title + ' (' + r.length + ' checks)');
    };

    // ---------------------------------------------------------------- the lists
    await page.evaluate(() => {
      const M = MUTTON101, items = (id) => ((NPCS[id] && NPCS[id].shop) || []).map((s) => s && s.item);
      const mutton = (id) => items(id).filter((i) => /mutton/.test(i || ''));
      check(M && M.MENUS && Object.keys(M.MENUS).length === 3, 'three sellers in the table');
      check(ITEMS[M.SALT] && ITEMS[M.BROTH] && ITEMS[M.SALT].use === 'p22_food' && ITEMS[M.BROTH].use === 'p22_food', 'the two dishes are Phase 22\'s');
      check(mutton('p29_corvin').join() === M.SALT, 'Corvin Ash: salt mutton');
      check(mutton('p92_brenna').join() === [M.SALT, M.BROTH].join(), 'Brenna Corliss: salt mutton and broth');
      check(mutton('p100_issue').join() === [M.SALT, M.BROTH].join(), 'One-Oh-Six: salt mutton and broth');
      // after what they already sold, which is all still there and first
      check(items('p29_corvin').slice(0, 3).join() === 'flume_eel,whistle,bandage', 'Corvin\'s own goods first');
      check(items('p92_brenna').slice(0, 3).join() === 'p92_blackcloth,bandage,tonic', 'Brenna\'s own goods first');
      check(items('p100_issue').slice(0, 5).join() === 'a_p100_coat,a_p100_mitts,w_p100_spike,bandage,tonic', 'the Watch\'s Issue first');
      // once only
      const before = ['p29_corvin', 'p92_brenna', 'p100_issue'].map((id) => items(id).length).join();
      check(M.install() === 0 && ['p29_corvin', 'p92_brenna', 'p100_issue'].map((id) => items(id).length).join() === before, 'installing again adds nothing');
      check(['p29_corvin', 'p92_brenna', 'p100_issue'].every((id) => new Set(items(id)).size === items(id).length), 'no row twice');
      // the prices: the Heights fixed and dear; the others the seller's own markup
      const row = (id, it) => NPCS[id].shop.find((s) => s.item === it);
      check(row('p92_brenna', M.SALT).price === 6 && row('p92_brenna', M.BROTH).price === 7, 'dear in the Heights: 6 and 7');
      check(buyPrice(NPCS.p29_corvin, row('p29_corvin', M.SALT)) > buyPrice(NPCS.p22_gideon, NPCS.p22_gideon.shop.find((s) => s.item === M.SALT)), 'Corvin\'s is dearer than the Bellwether\'s');
      // what R2 holds stays held, and Phase 22's own lists are untouched
      check(mutton('hetty').join() === M.SALT, 'Hetty: salt mutton only (R2)');
      check(!NPCS.p12_baker || !mutton('p12_baker').length, 'Brenna Loft bakes no mutton pies');
      check(!mutton('p29_agnes').length && !mutton('p29_ambrose').length, 'Oakhaven\'s other baker and chandler sell none');
      check(mutton('p22_gideon').length === 6 && mutton('p22_tamar').length === 2, 'the Bellwether six ways, Tamar two');
      check(mutton('vane').join() === [M.SALT, M.BROTH].join() && mutton('p17c_sloe').join() === [M.SALT, M.BROTH].join(), 'Vane and Sloe as they were');
      const lard = CALENDAR11.VENDORS.find((v) => v.key === 'larder');
      check(lard.pool.filter((i) => /mutton/.test(i)).join() === M.SALT, 'Oakhaven\'s market: salt mutton only');
    });
    await results('mutton on the newer lists');

    // ---------------------------------------------------------------- bought at the issue-hatch, and eaten
    const buyAt = async (map, id, want, shot) => {
      await page.evaluate(([map, id]) => { go(map); G.player.gold = 100; G.state = 'play'; talk(G.ents.find((e) => e.id === id)); }, [map, id]);
      await page.locator('#d-buy').click();
      const rows = {};
      for (const name of ['Salt Mutton', 'Mutton Broth']) rows[name] = await page.locator('[data-buy]').filter({ hasText: name }).count();
      if (SHOTS) await page.screenshot({ path: SHOTS + '/' + shot + '.png' });
      await page.locator('[data-buy]').filter({ hasText: want }).first().click();
      return rows;
    };
    const issue = await buyAt('p100_halls', 'p100_issue', 'Mutton Broth', 'p101-issue');
    assert.deepEqual(issue, { 'Salt Mutton': 1, 'Mutton Broth': 1 }, 'the issue-hatch lists both, once each');
    await page.evaluate(() => {
      const slot = G.player.inv.find((s) => s.id === MUTTON101.BROTH);
      check(slot && G.player.gold === 100 - buyPrice(NPCS.p100_issue, NPCS.p100_issue.shop.find((s) => s.item === MUTTON101.BROTH)), 'bought from One-Oh-Six at the listed price');
      closeModal(); G.state = 'play';
      const v0 = G.player.voice = Math.max(0, (G.player.voiceMax || 100) - 40), hp0 = G.player.hp = Math.max(1, G.player.hpMax - 20), n0 = slot.n || 1;
      useItem(slot);
      const left = (G.player.inv.find((s) => s.id === MUTTON101.BROTH) || { n: 0 }).n || 0;
      check(G.player.voice > v0 && G.player.hp > hp0 && left === n0 - 1, 'the broth eaten: voice and health back (' + v0 + ' to ' + G.player.voice + ', ' + hp0 + ' to ' + G.player.hp + ')');
    });
    await results('bought at Null-Watch and eaten');

    const docks = await buyAt('p92_tiers', 'p92_brenna', 'Salt Mutton', 'p101-keeldocks');
    assert.deepEqual(docks, { 'Salt Mutton': 1, 'Mutton Broth': 1 }, 'the Keel Docks list both, once each');
    await page.evaluate(() => {
      check(G.player.inv.some((s) => s.id === MUTTON101.SALT) && G.player.gold === 94, 'bought from Brenna Corliss for 6');
      closeModal(); G.state = 'play';
    });
    await results('bought in Sol-Luminary');

    assert.deepEqual(errors, [], 'no page errors: ' + errors.slice(0, 3).join(' | '));
    pass('no page errors');
    console.log('ALL MUTTON101 TESTS PASSED');
  } finally { await browser.close(); }
})().catch((e) => { console.error(e); process.exit(1); });
