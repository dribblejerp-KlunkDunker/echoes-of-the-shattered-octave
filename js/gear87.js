// ============================================================
//  gear87 — Phase 87 (b): the cape slot and the fourteen matching sets, with their bonuses. Approved by the owner on
//  14 Nov ("1 yes, 2 is a yes, yes, yes, 5 is a yes, ... 7 isa yes"); record: story/Game Layer/Phase 87 - Gear, sets and
//  the first-person view (design, for ruling).md.
//
//    cape     a sixth equipment slot after the shield (cape, cloak, plaid, mantle, pennon). Old saves load with it empty.
//    sets     every weapon and worn piece belongs to one set (SETS below). Three pieces of one set (the readied weapon
//             counts as one) give the set's small bonus; every armour piece the set lists, with one of its weapons
//             readied, gives the full bonus on top. Pieces not in the game yet (Phase 87 (c)) are listed by their ids and
//             simply do not count until they exist; a set's "full" is what exists of it.
//    bonuses  a few kinds, read by the game where they act: armour, noise, fatigue back, fatigue on the roads, swing
//             speed, voice cost of Songs. The set-special ones (the Office column passing you by, the pony faster, the
//             Deep Grove's low note...) come with each set's pieces in (c).
//  All names and numbers are [PROPOSED] under the approved design. No visual here uses random numbers.
// ============================================================
'use strict';

const GEAR87 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('gear87: ' + k, e); } };
  const TX = {
    cape: S('Cape'),
    sets: S('Matching sets'),
    of: S('{0}: {1} of {2}'),
    three: S('three pieces:'), full: S('the full set:'), none: S('Nothing worn of any set.'),
    partOf: S('of {0}'),
  };

  // ---------------------------------------------------------------- the fourteen sets (design table, ruled 14 Nov)
  // armour: every armour piece of the set (head, body, hands, feet, cape, shield); weapons: any one of them, readied
  // t: the three-piece bonus; f: the full-set bonus (on top). Kinds: ar (+armour), noise (+ armour noise, negative is
  // quieter), fatBack (fatigue comes back x faster), fatRoad (fatigue spent on the roads x less), swing (swings x faster),
  // voice (Songs cost x less), plus the set's own (special: done where it acts, from Phase 87 (c) on)
  const SETS = [
    { id: 'tanner', name: S('Tanner\'s Row'), home: 'Oakhaven',
      armor: ['a_cap', ['a_jerkin', 'a_gambeson'], 'a_gloves', 'a_hobnails', 'a_p87_tan_cape', 'a_p87_tan_shield'], weapons: ['sword', 'knife'],   // the jerkin or the gambeson: either counts
      t: { ar: 1 }, f: { fatBack: 0.2 }, tLine: S('+1 armour'), fLine: S('fatigue comes back 20% faster') },
    { id: 'hush', name: S('Hedge-weavers\' Hush'), home: 'the Hedge',
      armor: ['a_hood', 'a_hushcoat', 'a_p87_hush_mitts', 'a_softboots', 'a_p87_hush_cloak'], weapons: ['throwknife', 'p87_feltsling'],
      t: { noise: -0.25 }, f: { noise: -0.35, special: 'hush' }, tLine: S('footsteps 20% quieter'), fLine: S('enemies hear you at half the distance') },
    { id: 'registry', name: S('Synod Registry'), home: 'Fortis',
      armor: ['a_p87_reg_biretta', 'a_synodrobe', 'a_p87_reg_cuffs', 'a_p87_reg_shoes', 'a_p87_reg_cape'], weapons: ['sable_dagger'],
      t: { special: 'clerk' }, f: { special: 'registry' }, tLine: S('Synod patrols take you for a clerk, as the robes do'), fLine: S('an inspection takes twice as long') },
    { id: 'arsenal', name: S('Synod Arsenal'), home: 'Fortis',
      armor: ['a_p87_ars_sallet', 'a_chain', 'a_gauntlets', 'a_greaves', 'a_p87_ars_cape', 'a_kite'], weapons: ['longsword', 'p12_dirk'],
      t: { ar: 2 }, f: { special: 'kiteblock' }, tLine: S('+2 armour'), fLine: S('blocks with the kite shield cost no fatigue') },
    { id: 'legion', name: S('Carillon Legion'), home: 'the Legion\'s posts',
      armor: ['a_bellhelm', 'a_plate', 'a_p87_leg_vambraces', 'a_p87_leg_sabatons', 'a_p87_leg_pennon', 'a_p87_leg_shield'], weapons: ['mace', 'p12_bellglaive'],
      t: { ar: 2 }, f: { special: 'ring' }, tLine: S('+2 armour'), fLine: S('hits that land on you ring: the Cacophony near you takes 3') },
    { id: 'proctor', name: S('The Office\'s Proctors'), home: 'wherever the Office goes',
      armor: ['a_p87_pro_hood', 'a_p87_pro_coat', 'a_p87_pro_gloves', 'a_p87_pro_boots', 'a_p87_pro_cape'], weapons: ['spear', 'p87_carbine'],
      t: { special: 'proctor' }, f: { special: 'column' }, tLine: S('Proctors at a distance take you for one of their own'), fLine: S('inspections never begin: the Office column passes you by') },
    { id: 'cantor', name: S('The Cantors'), home: 'Oakhaven and the Howe',
      armor: ['a_p87_can_cowl', 'a_p87_can_cassock', 'a_p79_gloves', 'a_p87_can_sandals', 'a_p87_can_mantle'], weapons: ['p79_staff', 'tobin_blade', 'tollhammer'],
      t: { voice: 0.1 }, f: { special: 'songlong' }, tLine: S('Songs cost 10% less voice'), fLine: S('Songs last a third longer') },
    { id: 'siphon', name: S('The Siphon Corps'), home: 'Cinderhold',
      armor: ['a_p87_sip_goggles', 'a_p87_sip_apron', 'a_p87_sip_gauntlets', 'a_p87_sip_boots', 'a_p87_sip_cape'], weapons: ['maul', 'pistol'],
      t: { ar: 1, special: 'heat' }, f: { special: 'golem' }, tLine: S('+1 armour; fire and steam hurt you less'), fLine: S('your blows crack golems open faster') },
    { id: 'works', name: S('The Consortium Works'), home: 'Oakhaven\'s quarry',
      armor: ['a_kettle', 'a_brig', 'a_p87_wks_gauntlets', 'a_p87_wks_boots', 'a_p87_wks_cape', 'a_p87_wks_pavise'], weapons: ['p12_greatmaul', 'p87_sledge', 'p87_handbow'],
      t: { ar: 2 }, f: { fatRoad: 0.25 }, tLine: S('+2 armour'), fLine: S('heavy work tires you a quarter less') },
    { id: 'captains', name: S('The Free Captains'), home: 'Port Cantabile',
      armor: ['a_p87_cap_bandana', 'a_p87_cap_coat', 'a_p87_cap_gloves', 'a_p87_cap_boots', 'a_p87_cap_cape', 'a_buckler'], weapons: ['axe', 'vesper_hook', 'p12_glassblade', 'crossbow', 'p87_harpoon'],
      t: { swing: 0.1 }, f: { special: 'deck' }, tLine: S('swings 10% faster'), fLine: S('ranged weapons reload a third faster; no fall damage from a ship\'s height') },
    { id: 'drovers', name: S('The Drovers'), home: 'Wethercombe and the drove road',
      armor: ['a_p87_dro_hat', 'a_p22_mantle', 'a_p87_dro_mittens', 'a_p22_droverboots', 'a_p87_dro_plaid'], weapons: ['p22_crook', 'p22_shears', 'p87_sling'],
      t: { fatRoad: 0.15 }, f: { special: 'drove' }, tLine: S('fatigue 15% slower on the roads'), fLine: S('the pony rides 10% faster; hounds hear you at half the distance') },
    { id: 'barrow', name: S('The Barrow-Wardens'), home: 'Ewe Barrow',
      armor: ['a_p22_barrowhelm', 'a_p22_shroud', 'a_p87_bar_bracers', 'a_p87_bar_greaves', 'a_p87_bar_cloak', 'a_p87_bar_shield'], weapons: ['p22_leafblade'],
      t: { ar: 1, special: 'barrow' }, f: { special: 'wight' }, tLine: S('+1 armour; the barrow\'s dead are slower to wake'), fLine: S('woolwights and the barrow\'s dead do not follow you past its door') },
    { id: 'flume', name: S('The Flume and the Lanes'), home: 'the Flume road and the Low Rings',
      armor: ['a_p87_flu_cap', 'a_p85_coat', 'a_p87_flu_gloves', 'a_p85_boots', 'a_p87_flu_cape', 'a_p85_buckler'], weapons: ['p85_hook', 'p85_pole', 'p98_beamkey'],
      t: { noise: -0.2 }, f: { fatBack: 0.2, special: 'water' }, tLine: S('quieter on boards and in water'), fLine: S('the Dry Flume\'s surge does not sweep you off your feet; fatigue comes back 20% faster') },
    { id: 'oldreach', name: S('The Old Reach'), home: 'the Antler Galleries and the Deep Grove',
      armor: ['a_p87_old_crown', 'a_p87_old_hide', 'a_p87_old_wraps', 'a_p87_old_shoes', 'a_p87_old_pelt'], weapons: ['p85_pick', 'p85_knife', 'p85_bough', 'p87_hornbow', 'p98_ridge'],
      t: { special: 'flint' }, f: { special: 'grove' }, tLine: S('iron-bough and flint hit 15% harder'), fLine: S('the Deep Grove\'s ways are always the low note') },
    // Phase 92: the Dawning Heights' first set [PROPOSED]
    { id: 'umbral', name: S('The Umbral Tiers'), home: 'Sol-Luminary',
      armor: ['a_p92_lamphood', 'a_p92_chainboots', 'a_p92_shadecloak'], weapons: ['p92_clothpole'],
      t: { noise: -0.15 }, f: { special: 'shade' }, tLine: S('quieter on the planks'), fLine: S('the Bleach eats at you half as fast') },
    // Phase 94: the Chain-Yards, inside Sol-Luminary's frame [PROPOSED]
    { id: 'chainyards', name: S('The Chain-Yards'), home: 'the Anchorage, Sol-Luminary',
      armor: ['a_p94_cap', 'a_p94_gloves', 'a_p94_harness'], weapons: ['p94_lever'],
      t: { ar: 1 }, f: { special: 'weight' }, tLine: S('+1 armour'), fLine: S('a tether jerk weighs on you half as long') },
    // Phase 95: the Pilgrim Chain [PROPOSED]: the whites the city once walked the chain in, and a Flambeau's stave gone dark
    { id: 'pilgrim', name: S('The Pilgrim Chain'), home: 'the Pilgrim Chain, Sol-Luminary',
      armor: ['a_p95_robe', 'a_p95_cowl', 'a_p95_sandals'], weapons: ['p95_stave'],
      t: { special: 'white' }, f: { special: 'afterglow' }, tLine: S('in the whites, the Flambeaux of the Chain take you for a bearer until you are close'), fLine: S('leaving shade, the Bleach waits three breaths before it begins on you') },
    // Phase 97: the White Mile [PROPOSED]: what a scavenger of the line goes up in (Book Two: black cloth round the face, black gloves), and the Tallyman's second hook
    { id: 'blacks', name: S('The Scavenger\'s Blacks'), home: 'the White Mile, Sol-Luminary',
      armor: ['a_p97_wrap', 'a_p97_gloves', 'a_p97_coat'], weapons: ['p97_hook'],
      t: { noise: -0.2 }, f: { special: 'unheard' }, tLine: S('quieter on white stone'), fLine: S('the Unison must be a third nearer to hear you') },
    // Phase 100: Null-Watch [PROPOSED]: what a trooper of the Watch is issued (Book Three: long grey coats with lead plates sewn in), the
    // magazines' felt overshoes, a cable-splicer's spike and the copper mallet of Magazine Four
    { id: 'watch', name: S('The Watch\'s Issue'), home: 'Null-Watch, the Continental Rift',
      armor: ['a_p100_coat', 'a_p100_mitts', 'a_p100_felts'], weapons: ['p100_spike', 'p100_mallet', 'p113_sprag'],   // Phase 113 C: Carter's Sprag, from the stage at the lip
      t: { special: 'talk' }, f: { special: 'bell' }, tLine: S('on the wall, quiet takes half as long again to come on you'), fLine: S('a manned battery\'s bell reaches you from twice as far') },
  ];
  const BY_ID = {}; for (const s of SETS) BY_ID[s.id] = s;
  // which set a piece belongs to (the design puts every piece in exactly one)
  // an armour entry may be a list: any one of them fills that place in the set
  const SET_OF = {}; for (const s of SETS) { for (const a of s.armor) for (const id of [].concat(a)) SET_OF[id] = s.id; for (const w of s.weapons) SET_OF[w] = s.id; }

  // ---------------------------------------------------------------- each calling starts in its own clothes, with its own weapon
  // (owner, 14 Nov: "each new game should start with that characters weapon of choice as well as the clothing/armor they
  // normally wear"). A piece not made yet (Phase 87 (c)) is stood in for by the old kit's piece for that slot.
  const KITS = {
    blade: { set: 'siphon', armor: ['a_p87_sip_goggles', 'a_p87_sip_apron', 'a_p87_sip_gauntlets', 'a_p87_sip_boots'], weapons: ['sword', 'glass'] },
    cantor: { set: 'cantor', armor: ['a_p87_can_cowl', 'a_p87_can_cassock', 'a_p87_can_sandals', 'a_p87_can_mantle'], weapons: ['hands', 'pistol'] },
    corsair: { set: 'captains', armor: ['a_p87_cap_bandana', 'a_p87_cap_coat', 'a_p87_cap_gloves', 'a_p87_cap_boots', 'a_buckler'], weapons: ['axe', 'pistol'] },
    archivist: { set: 'hush', armor: ['a_hood', 'a_gambeson', 'a_p87_hush_mitts', 'a_softboots'], weapons: ['throwknife', 'pistol'], tknives: 6 },
    penitent: { set: null, armor: ['a_kettle', 'a_gambeson'], weapons: ['mace', 'hands'] },
    quarry: { set: 'works', armor: ['a_kettle', 'a_jerkin', 'a_p87_wks_gauntlets', 'a_p87_wks_boots'], weapons: ['p87_sledge'] },   // owner: "make a lighter quarry sledge"
  };
  const OLD_KIT = {};
  function applyKits() {
    if (typeof CLASS_KIT === 'undefined' || typeof ARMOR === 'undefined') return;
    for (const cid in KITS) {
      if (!OLD_KIT[cid]) OLD_KIT[cid] = (CLASS_KIT[cid] || []).slice();
      const K = KITS[cid], bySlot = {};
      for (const id of OLD_KIT[cid]) if (has(ARMOR, id)) bySlot[ARMOR[id].slot] = id;
      for (const id of K.armor) if (has(ARMOR, id)) bySlot[ARMOR[id].slot] = id;
      const list = Object.values(bySlot); CLASS_KIT[cid].length = 0; CLASS_KIT[cid].push(...list);
      if (typeof CLASSES !== 'undefined') { const c = CLASSES.find((q) => q.id === cid); const ws = K.weapons.filter((w) => typeof WEAPONS !== 'undefined' && has(WEAPONS, w)); if (c && ws.length) { c.weapons.length = 0; c.weapons.push(...ws); } }
    }
  }

  // ---------------------------------------------------------------- the cape slot
  function capeSlot() {
    if (typeof ARMOR_SLOTS === 'undefined' || ARMOR_SLOTS.some((x) => x[0] === 'cape')) return;
    ARMOR_SLOTS.push(['cape', TX.cape]);
  }

  // ---------------------------------------------------------------- how much of each set is worn, and what it gives
  const has = (o, k) => o && Object.prototype.hasOwnProperty.call(o, k);
  let memo = null, memoKey = '';   // read every frame by the specials: worked out again only when the gear changes
  function counts(p) {
    p = p || (typeof G !== 'undefined' && G.player); const out = {};
    if (!p || !p.armor) return out;
    const wid = p.weapons && p.weapons[p.weapon];
    const a = p.armor, key = [a.head, a.body, a.hands, a.feet, a.shield, a.cape, wid, typeof ARMOR !== 'undefined' ? Object.keys(ARMOR).length : 0].join('|');
    if (p === (typeof G !== 'undefined' && G.player) && memo && key === memoKey) return memo;
    const fresh = countsNow(p, wid);
    if (p === (typeof G !== 'undefined' && G.player)) { memo = fresh; memoKey = key; }
    return fresh;
  }
  function countsNow(p, wid) {
    const out = {};
    for (const s of SETS) {
      const exist = s.armor.map((a) => [].concat(a).filter((id) => typeof ARMOR !== 'undefined' && has(ARMOR, id))).filter((l) => l.length);
      const worn = exist.filter((l) => l.some((id) => p.armor[ARMOR[id].slot] === id)).length;
      const wpn = s.weapons.includes(wid) ? 1 : 0;
      const n = worn + wpn, of = exist.length + (s.weapons.some((w) => typeof WEAPONS !== 'undefined' && has(WEAPONS, w)) ? 1 : 0);
      if (n) out[s.id] = { n, of, three: n >= 3, full: exist.length > 0 && worn === exist.length && wpn === 1 };
    }
    return out;
  }
  // the sum of one kind of bonus over every set that gives it
  function bonus(kind, p) {
    const c = counts(p); let v = 0;
    for (const id in c) { const s = BY_ID[id], k = c[id];
      if (k.three && s.t[kind] != null && kind !== 'special') v += s.t[kind];
      if (k.full && s.f[kind] != null && kind !== 'special') v += s.f[kind]; }
    return v;
  }
  // a set-special bonus by name: is it on?
  function special(name, p) { const c = counts(p); for (const id in c) { const s = BY_ID[id], k = c[id]; if ((k.three && s.t.special === name) || (k.full && s.f.special === name)) return true; } return false; }

  // ---------------------------------------------------------------- where the bonuses act
  function wire() {
    capeSlot(); applyKits(); wireSpecials();
    if (typeof giveKit === 'function') { const _g = giveKit; giveKit = function (p) { try { applyKits(); } catch (e) { warnOnce('kits', e); } const r = _g.apply(this, arguments); try { const K = p && p.cls && KITS[p.cls.id]; if (K && K.tknives && !(p.tknives > 0)) p.tknives = K.tknives; } catch (e) { /* */ } return r; }; }
    if (typeof armorRating === 'function') { const _a = armorRating; armorRating = function (p) { const r = _a.apply(this, arguments); try { return r + bonus('ar', p || G.player); } catch (e) { return r; } }; }
    if (typeof armorNoise === 'function') { const _n = armorNoise; armorNoise = function (p) { const r = _n.apply(this, arguments); try { return Math.max(-0.8, r + bonus('noise', p || G.player)); } catch (e) { return r; } }; }
    if (typeof attack === 'function') { const _at = attack; attack = function () { const t0 = G.attack && G.attack.t; const r = _at.apply(this, arguments); try { const k = bonus('swing'); if (k && G.attack && !(t0 > 0) && G.attack.t > 0) { G.attack.t *= 1 - k; G.attack.dur *= 1 - k; } } catch (e) { warnOnce('swing', e); } return r; }; }
    if (typeof castSong === 'function') { const _c = castSong; castSong = function () { const v0 = G.player && G.player.voice; const r = _c.apply(this, arguments); try { const k = bonus('voice'); if (k && G.player && G.player.voice < v0) G.player.voice = Math.min(G.player.voiceMax, G.player.voice + (v0 - G.player.voice) * k); } catch (e) { warnOnce('voice', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function () {
      const p = G.player, f0 = p ? p.fat : 0; const r = _u.apply(this, arguments);
      try { if (p && Number.isFinite(f0) && p.fat !== f0) {
        if (p.fat > f0) { const k = bonus('fatBack', p); if (k) p.fat = Math.min(typeof fatCap === 'function' ? fatCap() : p.fatMax, f0 + (p.fat - f0) * (1 + k)); }
        else { const k = bonus('fatRoad', p); if (k && G.map && G.map.outdoor) p.fat = f0 - (f0 - p.fat) * (1 - k); }
      } } catch (e) { warnOnce('fatigue', e); }
      return r; }; }
    if (typeof renderInventory === 'function') { const _ri = renderInventory; renderInventory = function () { const r = _ri.apply(this, arguments); try { inventoryNote(); } catch (e) { warnOnce('inv', e); } return r; }; }
    if (typeof itemStats === 'function') { const _is = itemStats; itemStats = function (id) { const r = _is.apply(this, arguments); try { const key = typeof ITEMS !== 'undefined' && ITEMS[id] ? (ITEMS[id].weapon || id) : id, sid = SET_OF[key] || SET_OF[id]; if (sid) return (r ? r + ' · ' : '') + BY_ID[sid].name; } catch (e) { /* plain */ } return r; }; }
  }

  // ---------------------------------------------------------------- the set-specials, where they act (Phase 87 (c))
  // Each is read live (special(name)), so taking a piece off ends it at once. No random numbers; nothing saved.
  const FIRE = /steam|fire|flame|burn|scald|furnace|golem|cinder|ember/i;
  const FLINT = ['p85_pick', 'p85_knife', 'p85_bough', 'p87_hornbow', 'p98_ridge'];   // p98_ridge: the Flint-Back's leaving (Phase 91 question 4)
  let inEnemy = null;   // the enemy whose turn it is (its blows reach damagePlayer from inside enemyUpdate)
  function wireSpecials() {
    // who hears you: the Hush in full, and the drove's hounds, hear you at half the distance; the barrow's dead wake slower
    if (typeof enemyUpdate === 'function') {
      const _eu = enemyUpdate;
      enemyUpdate = function (e) {
        const was = inEnemy; inEnemy = e;
        let n0 = null;
        try {
          if (e && e.kind === 'enemy' && Number.isFinite(G.noise)) {
            const half = special('hush') || (e.type === 'hound' && special('drove')) || (/^p22_/.test(e.type || '') && special('barrow'));
            if (half) { n0 = G.noise; G.noise = Math.max(0, (G.noise - 1.9) * 0.5); }   // hearRange = 1.5 + noise x 0.8: about half
          }
        } catch (er) { warnOnce('hear', er); }
        try { return _eu.apply(this, arguments); } finally { if (n0 != null) G.noise = Math.max(G.noise, n0); inEnemy = was; }
      };
    }
    // blows that land on you: fire and steam (the Corps) and the ring (the Legion); the kite block, the ship's height and
    // the barrow's door are in js/rules88.js
    if (typeof damagePlayer === 'function') {
      const _dp = damagePlayer;
      damagePlayer = function (dmg, src) {
        try {
          if (Number.isFinite(dmg) && dmg > 0) {
            if (special('heat') && FIRE.test(String(src || (inEnemy && inEnemy.def && inEnemy.def.name) || ''))) dmg = Math.max(1, Math.round(dmg * 0.67));
          }
        } catch (er) { warnOnce('hurt', er); }
        const hp0 = G.player ? G.player.hp : 0;
        const r = _dp.call(this, dmg, src);
        try {
          if (G.player && G.player.hp < hp0 && special('ring')) {   // the bell-plate rings: the Cacophony near you takes 3
            const c = Engine.cam;
            for (const e of G.ents) if (e && e.kind === 'enemy' && !e.dead && !e.hidden && e.def && e.def.cacophony && Math.hypot(e.x - c.x, e.y - c.y) < 2.6) { e.hp -= 3; e.flash = true; if (e.hp <= 0 && typeof killEnemy === 'function') killEnemy(e, false); }
          }
        } catch (er) { warnOnce('ring', er); }
        return r;
      };
    }
    // blows you land: the Corps cracks golems open, the Old Reach's flint and iron-bough bite deeper; the Captains reload faster
    if (typeof attack === 'function') {
      const _at = attack;
      attack = function () {
        const before = new Map(); const t0 = G.attack && G.attack.t;
        try { for (const e of G.ents) if (e && e.kind === 'enemy' && !e.dead) before.set(e, e.hp); } catch (er) { /* none */ }
        const r = _at.apply(this, arguments);
        try {
          const wid = G.player.weapons[G.player.weapon], w = WEAPONS[wid] || {};
          for (const [e, hp] of before) {
            if (e.dead || !(e.hp < hp)) continue;
            let k = 0;
            if (e.type === 'golem' && special('golem')) k += 0.3;
            if (FLINT.includes(wid) && special('flint')) k += 0.15;
            if (k) { e.hp -= Math.max(1, Math.round((hp - e.hp) * k)); if (e.hp <= 0 && !e.dead && typeof killEnemy === 'function') killEnemy(e, false); }
          }
          if (w.ranged && special('deck') && G.attack && !(t0 > 0) && G.attack.t > 0) { G.attack.t *= 0.67; G.attack.dur = G.attack.t; }
        } catch (er) { warnOnce('strike', er); }
        return r;
      };
    }
    // Synod cover: three Registry pieces (or three of the Proctors') are taken for a clerk, as the robes are
    if (typeof wearingDisguise === 'function') {
      const _wd = wearingDisguise;
      wearingDisguise = function () { return _wd.apply(this, arguments) || special('clerk') || special('proctor'); };
    }
    if (typeof tickDisguise === 'function') {
      const _td = tickDisguise;
      tickDisguise = function (dt) {
        const s0 = G.coverSuspicion || 0, r = _td.apply(this, arguments);
        try {
          const s1 = G.coverSuspicion || 0;
          if (s1 > s0) { if (special('column')) G.coverSuspicion = s0; else if (special('registry')) G.coverSuspicion = s0 + (s1 - s0) * 0.5; }
        } catch (er) { warnOnce('cover', er); }
        return r;
      };
    }
    // Songs last a third longer (the Cantors in full): the Root ward and the falling fifth's hold
    if (typeof castSong === 'function') {
      const _cs = castSong;
      castSong = function () {
        const w0 = G.rootWard || 0, st = new Map();
        try { for (const e of G.ents) if (e && e.kind === 'enemy') st.set(e, e.stun || 0); } catch (er) { /* none */ }
        const r = _cs.apply(this, arguments);
        try {
          if (special('songlong')) {
            if ((G.rootWard || 0) > w0) G.rootWard = w0 + (G.rootWard - w0) * 1.34;
            for (const [e, s] of st) if ((e.stun || 0) > s) e.stun = s + (e.stun - s) * 1.34;
          }
        } catch (er) { warnOnce('song', er); }
        return r;
      };
    }
    // the drove: the pony goes a tenth faster under a drover
    if (typeof playerMove === 'function') {
      const _pm = playerMove;
      playerMove = function (o, dx, dy) {
        try { if (o === Engine.cam && typeof MOUNTS84 === 'object' && MOUNTS84.mounted && MOUNTS84.mounted() && special('drove')) { dx *= 1.1; dy *= 1.1; } } catch (er) { /* on foot */ }
        return _pm.call(this, o, dx, dy);
      };
    }
  }
  // the inventory says what is worn of which set, and what it gives
  function inventoryNote() {
    if (typeof document === 'undefined') return;
    const pn = document.getElementById('modal-panel'); if (!pn || pn.querySelector('.g87-sets')) return;
    const at = pn.querySelector('.slots'); if (!at) return;
    const c = counts(), div = document.createElement('div'); div.className = 'g87-sets';
    const h = document.createElement('h3'); h.textContent = TX.sets; div.appendChild(h);
    const ids = Object.keys(c).sort((a, b) => c[b].n - c[a].n);
    if (!ids.length) { const pp = document.createElement('p'); pp.className = 'muted'; pp.textContent = TX.none; div.appendChild(pp); }
    for (const id of ids) {
      const s = BY_ID[id], k = c[id], pp = document.createElement('p');
      const b = document.createElement('b'); b.textContent = TX.of.replace('{0}', s.name).replace('{1}', k.n).replace('{2}', k.of); pp.appendChild(b);
      const t1 = document.createElement('span'); t1.className = k.three ? 'on' : 'muted'; t1.textContent = ' · ' + TX.three + ' ' + s.tLine; pp.appendChild(t1);
      const t2 = document.createElement('span'); t2.className = k.full ? 'on' : 'muted'; t2.textContent = ' · ' + TX.full + ' ' + s.fLine; pp.appendChild(t2);
      div.appendChild(pp);
    }
    at.parentNode.insertBefore(div, at.nextSibling);
    if (!document.getElementById('g87-style')) { const st = document.createElement('style'); st.id = 'g87-style'; st.textContent = '.g87-sets{margin:.4em 0}.g87-sets h3{font-family:var(--font-sc);color:var(--gold);font-weight:500;margin:.3em 0 .2em}.g87-sets p{margin:.15em 0;font-size:.92em}.g87-sets .on{color:#a9e07a}'; document.head.appendChild(st); }
  }
  wire();

  return { TX, TEXTS, SETS, BY_ID, SET_OF, KITS, applyKits, counts, bonus, special };
})();
if (typeof window !== 'undefined') window.GEAR87 = GEAR87;
