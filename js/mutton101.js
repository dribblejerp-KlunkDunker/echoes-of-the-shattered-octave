// ============================================================
//  mutton101 — Phase 101: mutton on the menus built after Phase 22.
//
//    Phase 22 (js/sheepwalk22.js) put mutton on every inn's and food-seller's list there was in October: the Bellwether
//    six ways, Tamar Farrant, Captain Vane's ship's stores, Fenwick Sloe the chandler, and (after the R2 canon sweep)
//    Hetty and Oakhaven's market with dear salt mutton only, because the town ate its flocks in the two shut years.
//    Every seller built since then had none. This adds it to the three whose own trade and own words take it:
//
//    * CORVIN ASH, Stillwater's smuggler (js/thin29.js): salt mutton. His own lines: "Timber goes down to Fortis ... and
//      some of what is in the barrels is neither." Fortis is the salt-mutton town (Vol I §III.4: "Root stew, salt mutton,
//      black bread"). Dear, at his own markup.
//    * BRENNA CORLISS, the Free Captains' woman in the Keel Docks (js/heights92.js; Book Two names her): salt mutton and
//      mutton broth, the ship's-stores pair Vane sells. Her own line: "Rope, cloth, tar, and what the Free Captains leave
//      with me." Dearer than in the Reach [PROPOSED]: Sol-Luminary is "seven years thin" (Book Two) and grows nothing.
//    * ONE-OH-SIX at Null-Watch's issue-hatch (js/rift100.js): salt mutton and mutton broth. Its own line: "Coat, mitts,
//      spike, and what the sutler left." A sutler is the trader who victuals soldiers.
//
//    Left as they are, on purpose: Hetty and the market (R2: salt only; test/r2canon27.test.js holds it); the two Oakhaven
//    bakers (no mutton pies in a starving town; test/sheepwalk22.test.js); Ambrose Vettle (he sells what keeps a light lit);
//    the specialists (armour, the cobbler, the winchmaster, the robing-room, the fence, the book-runner, the beekeeper).
//
//    No new text, art or French: the two dishes, their names, pictures and translations are Phase 22's. Each list is
//    appended to, never replaced, once; nothing draws on the random stream.
// ============================================================
'use strict';

const MUTTON101 = (function () {
  const SALT = 'p22_salt_mutton', BROTH = 'p22_mutton_broth';

  // who gets what; a price here is fixed (the Heights), otherwise the seller's own markup sets it
  const MENUS = {
    p29_corvin: [{ item: SALT }],
    p92_brenna: [{ item: SALT, price: 6 }, { item: BROTH, price: 7 }],
    p100_issue: [{ item: SALT }, { item: BROTH }],
  };

  function install() {
    if (typeof NPCS === 'undefined' || typeof ITEMS === 'undefined') return 0;
    let added = 0;
    for (const id in MENUS) {
      const n = NPCS[id]; if (!n) continue;
      if (!Array.isArray(n.shop)) n.shop = [];
      for (const row of MENUS[id]) {
        if (!ITEMS[row.item] || n.shop.some((s) => s && s.item === row.item)) continue;
        n.shop.push(Object.assign({}, row)); added++;
      }
    }
    return added;
  }

  try { install(); } catch (e) { console.warn('mutton101 failed to install', e); }
  return { MENUS, install, SALT, BROTH };
})();
