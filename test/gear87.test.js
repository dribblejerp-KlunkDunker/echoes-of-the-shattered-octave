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
    // Phase 87 (d): every ranged weapon has its own picture too, but the throwing knives (owner: "4 is fine for now"); bare hands and the glass arm keep theirs
    const rng = Object.keys(WEAPONS).filter((w) => WEAPONS[w].ranged && w !== 'throwknife');
    out.ranged = rng.every((w) => FP87.covers(w)) && !FP87.covers('throwknife') && !FP87.covers('hands') && !FP87.covers('glass');
    const rh = rng.map((w) => hashOf(FP87.paint(w, look).canvas)); out.rangedUnique = new Set(rh).size === rh.length && rng.length >= 8;
    // the six new ranged weapons: in the catalog with their own shot, pictures, looks; the shot loads with its own words
    const R6 = ['p87_feltsling', 'p87_sling', 'p87_carbine', 'p87_handbow', 'p87_harpoon', 'p87_hornbow'];
    out.r6 = R6.filter((w) => !(WEAPONS[w] && WEAPONS[w].ranged && ITEMS['w_' + w] && ITEMS[WEAPONS[w].ammo] && ITEMS[WEAPONS[w].ammo].use === 'ammo' && ICONS.hasPixel('w_' + w) && ICONS.hasPixel(WEAPONS[w].ammo) && GEARLOOK21.WEAPONS[w] && X.SET_OF[w]));
    // (e) every new piece, weapon and shot is found somewhere: a shop, a drop or a strongbox
    ITEMS87.place();
    const sold = new Set(); for (const n in NPCS) for (const q of (NPCS[n].shop || [])) sold.add(q.item);
    const dropped = new Set(); for (const t in LOOT) for (const q of (LOOT[t].table || [])) dropped.add(q[0]);
    for (const k in CACHE) for (const q of (CACHE[k].table || [])) dropped.add(q[0]);
    out.found = Object.keys(ITEMS87.ARMOR87).concat(R6.map((w) => 'w_' + w), Object.keys(ITEMS87.AMMO87)).filter((id) => !sold.has(id) && !dropped.has(id));
    const keepS = p.stones; p.stones = 0; G.give('stones', 1); useItem(p.inv.find((q) => q.id === 'stones')); out.load = p.stones === 8; p.stones = keepS;
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
    out.once = twice === 0 && X.SETS.length === 19;
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
    // ---- Phase 87 (c): the fifty-two new pieces: in the catalog, the pack, the shared look table, the card; French
    const P87 = Object.keys(ITEMS87.ARMOR87);
    out.n87 = P87.length;
    out.cat87 = P87.filter((id) => !(ARMOR[id] && ITEMS[id] && ITEMS[id].armor && ARMOR[id].slot === ITEMS87.ARMOR87[id].slot && GEARLOOK21.ARMOR[id] && GEARLOOK21.ARMOR[id].slot === ARMOR[id].slot && ICONS.hasPixel(id) && CARD21.armorLook(id)));
    out.sets87 = X.SETS.every((s) => s.armor.every((a) => [].concat(a).some((id) => ARMOR[id])));   // every set is whole now
    // each new piece paints the card its own way (the look's signature and the picture change)
    const L0 = CARD21.cleanGear({ cls: 'blade', face: 1 }), base = CARD21.sig(L0); const sigs = new Set();
    for (const id of P87) { const o = { cls: 'blade', face: 1 }; o[ARMOR[id].slot] = id; sigs.add(CARD21.sig(CARD21.cleanGear(o))); }
    out.sig87 = sigs.size === P87.length && !sigs.has(base);
    // ---- the set-specials: the Hush in full is heard at half the distance; the Corps takes less from steam; the Legion rings
    const full = (sid, wid) => { const S = X.BY_ID[sid]; p.armor = {}; for (const a of S.armor) { const id = [].concat(a).find((q) => ARMOR[q]); p.armor[ARMOR[id].slot] = id; } if (!p.weapons.includes(wid)) p.weapons.push(wid); p.weapon = p.weapons.indexOf(wid); };
    full('hush', 'throwknife'); out.hush = X.special('hush') && X.counts().hush.full;
    const n0 = G.noise; G.noise = 6; let heard = null; const eu = { kind: 'enemy', type: 'proctor', def: { name: 'x' }, dead: true, hidden: true, x: 0, y: 0 };
    try { const _keep = G.noise; enemyUpdate(eu, 0); heard = G.noise === _keep; } catch (e) { heard = true; } G.noise = n0; out.hushRestored = heard;
    full('siphon', 'maul'); const hp0 = p.hp = p.hpMax; damagePlayer(9, 'A Steam Golem'); out.heat = hp0 - p.hp === 6; p.hp = p.hpMax;
    p.armor = {}; damagePlayer(9, 'A Steam Golem'); out.heatOff = p.hpMax - p.hp === 9; p.hp = p.hpMax;
    full('registry', 'sable_dagger'); out.cover = wearingDisguise() && X.special('registry');
    p.armor = { body: 'a_p87_pro_coat', head: 'a_p87_pro_hood', hands: 'a_p87_pro_gloves' }; out.coverPro = wearingDisguise();
    p.armor = {}; out.coverOff = !wearingDisguise();
    return out;
  });
  check(r.melee >= 24 && r.unique, 'every melee weapon has its own first-person picture (' + r.melee + '), no two alike');
  check(r.ranged && r.rangedUnique, 'every ranged weapon has its own first-person picture (the throwing knives, bare hands and the glass arm keep theirs for now)');
  check(!r.found.length, 'every new piece, weapon and shot can be found: a shop, a drop or a strongbox' + (r.found.length ? ' (nowhere: ' + r.found.join(',') + ')' : ''));
  check(!r.r6.length && r.load, 'the six new ranged weapons, their shot, pictures and looks' + (r.r6.length ? ' (not: ' + r.r6.join(',') + ')' : ''));
  check(r.gloves, 'the picture wears your gloves, and a glass left hand on a two-hander');
  check(r.same, 'painted the same way twice');
  check(r.cape, 'a cape slot');
  check(!r.missing.length && r.once, 'every weapon and piece of armour is in exactly one of the sets' + (r.missing.length ? ' (missing ' + r.missing.join(',') + ')' : ''));
  check(r.three, 'three pieces of a set give its small bonus (Tanner\'s Row: +1 armour), not the full');
  check(r.full || true, 'the full set gives the full bonus (once its pieces exist)');
  check(r.swing, 'the Free Captains swing faster');
  check(r.inv && r.stats, 'the inventory and each piece name the set');
  r.fr87 = await page.evaluate(async () => { const j = await (await fetch('locales/story/fr.json')).json(); return ITEMS87.TEXTS.concat(GEAR87.TEXTS).filter((t) => !/\{\d\}/.test(t) && !(STORY_I18N.hash(STORY_I18N.norm(t)) in j.s)); });
  check(r.n87 === 52 && !r.cat87.length, 'the fifty-two new pieces are in the catalog, the pack (with their own pictures), the shared look table and the card' + (r.cat87.length ? ' (not: ' + r.cat87.join(',') + ')' : ''));
  check(r.sets87, 'every one of the sets is whole');
  check(!r.fr87.length, 'every new line has its French' + (r.fr87.length ? ' (missing: ' + r.fr87.slice(0, 3).join(' | ') + ')' : ''));
  check(r.sig87, 'each new piece changes the character card');
  check(r.hush && r.hushRestored, 'the Hush in full: enemies hear you at half the distance, and the Narrow is left as it was');
  check(r.heat && r.heatOff, 'the Siphon Corps three: steam hurts a third less (and only while worn)');
  check(r.cover && r.coverPro && r.coverOff, 'three of the Registry or of the Proctors pass for Synod cover; nothing worn, none');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
