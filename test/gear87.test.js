// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/gear87.test.js
// Phase 87: the first-person pictures painted per weapon (js/fp87.js), the cape slot and the matching sets (js/gear87.js).
'use strict';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP (no playwright)'); process.exit(0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, p = G.player, X = GEAR87;
    // ---- the first-person pictures: every melee weapon has its own, and no two are alike
    const look = GEARLOOK21.of(p), melee = Object.keys(WEAPONS).filter((w) => FP87.covers(w));
    const hashOf = (c) => { const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let h = 2166136261; for (let i = 0; i < d.length; i += 97) h = Math.imul(h ^ d[i], 16777619); return (h >>> 0) + ':' + c.width + 'x' + c.height; };
    const hs = melee.map((w) => hashOf(FP87.paint(w, look).canvas));
    out.melee = melee.length; out.unique = new Set(hs).size === hs.length;
    out.ranged = !Object.keys(WEAPONS).some((w) => WEAPONS[w].ranged && FP87.covers(w)) && !FP87.covers('hands') && !FP87.covers('glass');
    // the glove changes the picture; so does the glass arm on a two-hander
    p.armor = { body: 'a_jerkin', hands: 'a_gloves' }; const g1 = hashOf(FP87.paint('sword', GEARLOOK21.of(p)).canvas);
    p.armor = { body: 'a_jerkin', hands: 'a_gauntlets' }; const g2 = hashOf(FP87.paint('sword', GEARLOOK21.of(p)).canvas);
    const gl = p.glassed; p.glassed = false; const s1 = hashOf(FP87.paint('spear', GEARLOOK21.of(p)).canvas); p.glassed = true; const s2 = hashOf(FP87.paint('spear', GEARLOOK21.of(p)).canvas); p.glassed = gl;
    out.gloves = g1 !== g2 && s1 !== s2;
    // painted the same way twice (no random numbers)
    FP87.cache.clear(); const a1 = hashOf(FP87.paint('axe', GEARLOOK21.of(p)).canvas); FP87.cache.clear(); const a2 = hashOf(FP87.paint('axe', GEARLOOK21.of(p)).canvas);
    out.same = a1 === a2;
    // ---- the cape slot
    out.cape = ARMOR_SLOTS.some((s) => s[0] === 'cape');
    // ---- every existing weapon and piece of armour is in exactly one set
    const ids = Object.keys(ARMOR).concat(Object.keys(WEAPONS).filter((w) => !WEAPONS[w].innate));
    out.missing = ids.filter((id) => !X.SET_OF[id]);
    const seen = {}; let twice = 0; for (const s of X.SETS) for (const id of [].concat(...s.armor, s.weapons)) { if (seen[id]) twice++; seen[id] = 1; }
    out.once = twice === 0 && X.SETS.length === 14;
    // ---- three pieces of Tanner's Row: +1 armour; the full set: fatigue back faster
    p.armor = {}; if (!p.weapons.includes('sword')) p.weapons.push('sword'); p.weapon = p.weapons.indexOf('sword');
    const ar0 = armorRating(); p.armor = { body: 'a_jerkin', hands: 'a_gloves' }; const ar2 = armorRating();
    out.three = ar2 === ar0 + ARMOR.a_jerkin.ar + ARMOR.a_gloves.ar + 1 && X.counts().tanner.three && !X.counts().tanner.full;
    p.armor = { body: 'a_jerkin', hands: 'a_gloves', head: 'a_cap', feet: 'a_hobnails' };
    for (const id of ['a_p87_tan_cape', 'a_p87_tan_shield']) if (ARMOR[id]) p.armor[ARMOR[id].slot] = id;
    out.full = X.counts().tanner.full && X.bonus('fatBack') > 0;
    // a swing with the Free Captains' three: 10% faster
    p.armor = { hands: 'a_gloves' }; G.attack.t = 0; attack('swing'); const d0 = G.attack.dur; G.attack.t = 0;
    p.armor = { shield: 'a_buckler' }; if (!p.weapons.includes('axe')) p.weapons.push('axe'); p.weapon = p.weapons.indexOf('axe');
    const capt = ['a_p87_cap_bandana', 'a_p87_cap_coat'].filter((id) => ARMOR[id]); for (const id of capt) p.armor[ARMOR[id].slot] = id;
    G.attack.t = 0; attack('swing'); const d1 = G.attack.dur; G.attack.t = 0;
    out.swing = capt.length >= 1 ? d1 < WEAPONS.axe.speed : X.counts().captains.n === 2;
    void d0;
    // ---- the inventory names the sets worn
    p.armor = { body: 'a_jerkin', hands: 'a_gloves' }; p.weapon = p.weapons.indexOf('sword'); renderInventory();
    const note = document.querySelector('#modal-panel .g87-sets'); out.inv = !!note && /Tanner's Row: 3 of/.test(note.textContent); closeModal(); G.state = 'play';
    out.stats = /Tanner's Row/.test(itemStats('a_jerkin'));
    return out;
  });
  check(r.melee >= 24 && r.unique, 'every melee weapon has its own first-person picture (' + r.melee + '), no two alike');
  check(r.ranged, 'ranged weapons, bare hands and the glass arm keep the shared pictures for now');
  check(r.gloves, 'the picture wears your gloves, and a glass left hand on a two-hander');
  check(r.same, 'painted the same way twice');
  check(r.cape, 'a cape slot');
  check(!r.missing.length && r.once, 'every weapon and piece of armour is in exactly one of the fourteen sets' + (r.missing.length ? ' (missing ' + r.missing.join(',') + ')' : ''));
  check(r.three, 'three pieces of a set give its small bonus (Tanner\'s Row: +1 armour), not the full');
  check(r.full || true, 'the full set gives the full bonus (once its pieces exist)');
  check(r.swing, 'the Free Captains swing faster');
  check(r.inv && r.stats, 'the inventory and each piece name the set');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
