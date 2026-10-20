// ============================================================
//  hearth15 — Phase 15 "The province moves", team HEARTH: a fire, a card table and a wall of trophies.
//
//  Three switches (Options -> Graphics & access, stored in localStorage 'octave.hearth15.v1').
//  All off = the game exactly as it was: no panel opens at a fire, nobody sits at the east table of
//  the Boar, no trophy hangs in the house and no flag is written.
//
//   1. CAMP COOKING (cfg.cooking). Any fire you can reach - a camp fire, a hearth, a brazier - opens a
//      cooking panel. Three ingredients (sweet-root, hedge-cap, barley) are sold at Bettany's stall and
//      can be foraged once a day on any outdoor map (Lore decides how much you find). Four dishes, each
//      half an hour at the fire:
//        Hedge broth  (root + cap)      health and a full belly
//        Eel stew     (eel + root)      the most health, and you set out rested in the morning
//        Hearth-cake  (barley + honey)  voice, and it keeps
//        Willow tea   (cap + honey)     stops bleeding and puts you to sleep properly
//      A Physician hand sometimes makes a dish well: half again on everything it gives. The journey
//      warmth of the stew is spent on the next world-map journey, which costs you no wind at all.
//   2. THE CARD TABLE (cfg.cards). Nessa Quill, out of the wool-factor's office, sits at the east table
//      of the Boar & Dulcimer in the evening with a greasy 32-card Reach deck (Reeds, Bells, Glass,
//      Stones, eight to a suit) and plays Eights: two cards each, hers one down, draw as you like, the
//      target is eight, over eight is a bust, she draws while she is under six. Closest to eight takes
//      the stake; level totals push; a two-card eight - a true octave - pays three for two. Stakes 1-20
//      with a daily net-loss cap, never below your last sovereign, and the cards come from the module's
//      own seeded stream, so the game's own rolls are never drawn.
//   3. BOSS TROPHIES (cfg.trophies). Put down one of Book One's nine great enemies and you take
//      something off it. The trophy rack in your house on Cooper's Row hangs what you have taken, names
//      where each came from, and keeps the count; the full nine earns a title. Taking a trophy is a line
//      and a logbook entry, never a change to the fight or the loot.
//
//  Saved state, all clamped on every read:
//    G.flags.p15h_cook   dishes cooked        p15h_fed    day+1 the stew's warmth was eaten
//    G.flags.p15h_well   dishes made well     p15h_f:<map>  day+1 that map was last foraged
//    G.flags.p15h_cards  hands of Eights      p15h_cwin   hands won     p15h_hands  hands dealt (the card seed)
//    G.flags.p15h_cday / p15h_closs  the day (+1) and the net loss of the day's tally
//    G.flags.p15h_tro    a bitmask of the trophies taken (nine bosses)
//  Seven items are registered at load, before any save is restored, so an ingredient or a dish in an
//  old save validates like any other item.
//
//  Wrapped, never edited: useDeco, useItem, killEnemy, travelGo, loadMap, restoreGame, renderDialogue,
//  renderAccessibilityMenu. Art is procedural stand-in work (DOM and the game's own frames). Every
//  invented line is marked [PROPOSED] and listed in tools/i18n/p15-hearth.tsv.
// ============================================================
'use strict';

const HEARTH15 = (() => {
  const KEY = 'octave.hearth15.v1';
  const LIST = [];
  const S = (t) => { LIST.push(t); return t; };
  const cfg = { cooking: true, cards: true, trophies: true };

  const FIRES = new Set(['campfire', 'hearth', 'brazier']);
  const FIRE_RANGE = 3.2;
  const COOK_HOURS = 0.5;
  const STAKE_MIN = 1, STAKE_MAX = 20, LOSS_CAP = 40, TARGET = 8, DEALER_STANDS = 6;
  const SUITS = ['Reeds', 'Bells', 'Glass', 'Stones'];

  const clampH = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? clampH(v, lo, hi) : d; };
  const hasG = () => typeof G !== 'undefined' && !!G && !!G.flags && typeof G.flags === 'object';
  const fint = (k, hi) => Math.floor(num(hasG() ? G.flags[k] : 0, 0, hi == null ? 99999 : hi, 0));
  const fset = (k, v, hi) => { if (hasG()) G.flags[k] = Math.floor(num(v, 0, hi == null ? 99999 : hi, 0)); };
  const P = () => (hasG() ? G.player : null);
  const gold = () => num(P() ? P().gold : 0, 0, 1e9, 0);
  const dayNow = () => Math.floor(num(hasG() ? G.day : 0, 0, 99999, 0));
  const hourNow = () => num(hasG() ? G.tod : 0, 0, 0.999999, 0) * 24;
  const skill = (k, d) => num(P() && P().skills ? P().skills[k] : d, 0, 100, d);
  const say = (t, c, ms) => { try { if (typeof msg === 'function') msg(t, c, ms); } catch (e) { /* never break a tick */ } };
  const sfx = (k) => { try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx[k]) Audio_.sfx[k](); } catch (e) { /* mute is fine */ } };
  const warned = {};
  const warn = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('hearth15: ' + k + ' failed', e); } };
  const count = (id) => { try { return hasG() ? G.count(id) : 0; } catch (e) { return 0; } };

  // ================================================================ text [PROPOSED]
  const TX = {
    cook: {
      title: S('At the fire'),
      intro: S('Half an hour at a fire and the right two things in your pack. Nobody in the Reach cooks loudly.'),
      state: S('Sweet-root {0} · hedge-cap {1} · barley {2} · honey {3} · eel {4}'),
      sit: S('Sit by the fire'),
      forage: S('Look about for roots and caps'),
      foragedNone: S('You go round the edge of the firelight and find nothing but stems and a beetle that does not want discussing.'),
      foraged: S('You come back with {0}. The Reach feeds anyone who is quiet about it.'),
      foragedDone: S('You have been over this ground today. Give it until tomorrow.'),
      indoors: S('There is nothing to forage in here.'),
      close: S('Bank the fire'),
      need: S('You have not the makings of that.'),
      made: S('{0}. Half an hour, and the fire does the rest.'),
      madeWell: S('{0}, and made well — you have a Physician\'s hand with a pot, whatever else you are.'),
      journal: S('Cooking: a fire, half an hour and two things out of the pack. Sweet-root and hedge-cap make a broth; eel and root a stew that sets you up for the road; barley and honey a hearth-cake; cap and honey a willow tea that stops a bleed. Bettany sells the makings, and the ground outside the firelight gives them up if you are quiet about looking.'),
      warm: S('You set out on yesterday\'s stew and arrive with your wind unbroken.'),
      ate: S('{0}.'),
      items: {
        root: S('Sweet-root'), rootDesc: S('A pale root out of the hedge-bottom, sweet when it is cooked and bitter when it is not.'),
        cap: S('Hedge-cap'), capDesc: S('A flat brown mushroom that grows in the thorn\'s shade. Safe. The one with the lilac gill is not.'),
        barley: S('A measure of barley'), barleyDesc: S('Carders\' barley, winnowed. It keeps, which is most of what anyone asks of food now.'),
        broth: S('Hedge broth'), brothDesc: S('Root and cap, cooked down. It tastes of the hedge-bottom and it puts you back together.'),
        stew: S('Eel stew'), stewDesc: S('Flume-eel and sweet-root. A hot meal before the road is worth an hour of the road.'),
        cake: S('Hearth-cake'), cakeDesc: S('Barley and honey on a flat stone at the fire\'s edge. It eases the throat and it keeps for days.'),
        tea: S('Willow tea'), teaDesc: S('Hedge-cap and honey in hot water. It stops a bleed and it puts you down properly for the night.'),
      },
      dishes: {
        broth: S('Hedge broth (sweet-root + hedge-cap)'),
        stew: S('Eel stew (flume-eel + sweet-root)'),
        cake: S('Hearth-cake (barley + honey)'),
        tea: S('Willow tea (hedge-cap + honey)'),
      },
      eat: {
        broth: S('The broth goes down hot and the ache goes out of you'),
        stew: S('The stew is better than it has any right to be, and you will feel it on the road tomorrow'),
        cake: S('The cake eases your throat and sits in you like ballast'),
        tea: S('The tea stops the bleeding and takes the edge off the night'),
      },
    },
    cards: {
      name: S('Nessa Quill, out of the wool-factor\'s office'),
      greetNormal: S('Eights? A sovereign a hand and no singing about it either way.'),
      greetPolite: S('Sit down. I will deal you in and I will not explain the rules twice, so listen once.'),
      greetBlunt: S('Keep your voice down or keep your coin. Both, preferably.'),
      topic: S('Thirty-two cards: Reeds, Bells, Glass, Stones, eight to a suit, because eight is all anybody is allowed to count to now. We play to eight. The joke is not a good one but it is ours.'),
      button: S('Play Eights'),
      title: S('Eights, at the east table'),
      rules: S('Two cards each, mine one face down. Draw as many as you like. Eight is the target, over eight is a bust, and I draw while I am under six. Closest to eight takes the stake; level totals push; two cards to eight is a true octave and pays three for two.'),
      purse: S('You have {0} sovereigns. Stake: {1}. Lost today: {2} of a {3} cap.'),
      yours: S('Yours'), hers: S('Hers'), down: S('face down'),
      draw: S('Draw'), stand: S('Stand'), deal: S('Deal'), leave: S('Leave the table'),
      more: S('Raise the stake'), less: S('Lower the stake'),
      bust: S('Over eight. She does not even look up.'),
      octave: S('A true octave, two cards to eight. She pays three for two and says a word she learned at the quarry.'),
      won: S('Eight {0} to her {1}. You take {2} sovereigns.'),
      lost: S('Her {0} to your {1}. She takes {2} sovereigns and writes it down, which is somehow worse.'),
      push: S('Level at {0}. Nobody takes anything and she deals again.'),
      capped: S('"You have lost what I am willing to take off you today," she says, and squares the deck. "Come back tomorrow and lose it fresh."'),
      poor: S('You have not the stake.'),
      closed: S('The table is empty. She works days and plays evenings, and not at all once the town has other things to think about.'),
      journal: S('Eights: Nessa Quill plays cards at the east table of the Boar in the evenings. Thirty-two cards, four suits, eight to a suit, and eight to play for, because eight is all anyone is allowed to count to now.'),
    },
    tro: {
      label: S('Your wall pegs and trophy rack'),
      title: S('The trophy rack on Cooper\'s Row'),
      intro: S('Four oak pegs and a shelf. What you have carried home off the great enemies of Book One hangs here, and the house is quieter for each of them.'),
      count: S('{0} of {1} taken. {2} foes put down, {3} names kept.'),
      none: S('The pegs are empty. Nothing in this book has gone down to you yet that was worth carrying home.'),
      close: S('Leave the rack'),
      took: S('You take {0} off it, and carry it home.'),
      journal: S('Trophies: I have begun hanging what I take off the great enemies on the pegs in the house on Cooper\'s Row. The house is quieter for each of them, which is not the same as being easier to sleep in.'),
      full: S('Every peg on the wall is full. Nine of them, and nothing in Book One left standing that you have not put down.'),
      title_award: S('Keeper of the Nine Pegs'),
      list: {
        wearer: S('A tuning-fork of blackened bronze'),
        aegis: S('A cracked chord-plate, still warm'),
        pressman: S('A type-case out of the Office hand-press'),
        weaver: S('A hank of thread that has not stopped moving'),
        broodmother: S('A dried egg-sac, light as paper'),
        requiem: S('A shard of the Requiem that still rings when the door shuts'),
        wearer_coda: S('The second fork, from the coda'),
        deacon: S('The clapper of the Unrung Bell'),
        captain: S('An outrider-captain\'s whistle, bent'),
      },
      from: {
        wearer: S('the Wearer, at the Hedge'),
        aegis: S('the Aegis Sentinel'),
        pressman: S('Pressman Mallow'),
        weaver: S('the Phantom Weaver'),
        broodmother: S('the Brood-Mother'),
        requiem: S('the Requiem'),
        wearer_coda: S('the Wearer, at the coda'),
        deacon: S('the Deacon of the Unrung Bell'),
        captain: S('Outrider-Captain Hal Brennick'),
      },
    },
    opts: {
      on: S('On'), off: S('Off'),
      cooking: S('Camp cooking'), cookingHint: S('cook four dishes at any fire, and forage for the makings'),
      cards: S('The card table'), cardsHint: S('Eights, at the east table of the Boar in the evening'),
      trophies: S('Boss trophies'), trophiesHint: S('what you take off the great enemies hangs in your house'),
    },
  };

  // ================================================================ settings
  function loadCfg() {
    try {
      const o = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (o && typeof o === 'object') for (const k of Object.keys(cfg)) if (typeof o[k] === 'boolean') cfg[k] = o[k];
    } catch (e) { /* no storage: the defaults stand */ }
  }
  function saveCfg() { try { localStorage.setItem(KEY, JSON.stringify(cfg)); } catch (e) { /* optional */ } }

  // ================================================================ items
  const ING = { root: 'p15_root', cap: 'p15_cap', barley: 'p15_barley' };
  const DISH = { broth: 'p15_broth', stew: 'p15_stew', cake: 'p15_cake', tea: 'p15_tea' };
  function registerItems() {
    if (typeof ITEMS === 'undefined' || ITEMS[ING.root]) return;
    const T = TX.cook.items;
    ITEMS[ING.root] = { name: T.root, sprite: 'loot', desc: T.rootDesc, value: 3 };
    ITEMS[ING.cap] = { name: T.cap, sprite: 'loot', desc: T.capDesc, value: 3 };
    ITEMS[ING.barley] = { name: T.barley, sprite: 'loot', desc: T.barleyDesc, value: 2 };
    ITEMS[DISH.broth] = { name: T.broth, sprite: 'loot', desc: T.brothDesc, value: 7, use: 'p15_dish' };
    ITEMS[DISH.stew] = { name: T.stew, sprite: 'loot', desc: T.stewDesc, value: 10, use: 'p15_dish' };
    ITEMS[DISH.cake] = { name: T.cake, sprite: 'loot', desc: T.cakeDesc, value: 8, use: 'p15_dish' };
    ITEMS[DISH.tea] = { name: T.tea, sprite: 'loot', desc: T.teaDesc, value: 8, use: 'p15_dish' };
    // Bettany's stall carries the makings
    try {
      if (typeof NPCS !== 'undefined' && NPCS.bettany && Array.isArray(NPCS.bettany.shop) && !NPCS.bettany.shop.some((r) => r.item === ING.root)) {
        NPCS.bettany.shop.push({ item: ING.root, price: 3 }, { item: ING.cap, price: 3 }, { item: ING.barley, price: 2 });
      }
    } catch (e) { warn('shop', e); }
  }

  // ================================================================ 1. cooking
  // [PROPOSED] two things out of the pack, and what the dish gives
  const RECIPES = {
    broth: { needs: [[ING.root, 1], [ING.cap, 1]], make: DISH.broth },
    stew: { needs: [['flume_eel', 1], [ING.root, 1]], make: DISH.stew },
    cake: { needs: [[ING.barley, 1], ['honey', 1]], make: DISH.cake },
    tea: { needs: [[ING.cap, 1], ['honey', 1]], make: DISH.tea },
  };
  const EFFECTS = {
    broth: { hp: 20, hunger: 40, sleep: 0, voice: 0, fat: 0.15, bleed: false, road: false },
    stew: { hp: 30, hunger: 55, sleep: 5, voice: 0, fat: 0.25, bleed: false, road: true },
    cake: { hp: 6, hunger: 30, sleep: 0, voice: 18, fat: 0.1, bleed: false, road: false },
    tea: { hp: 10, hunger: 15, sleep: 35, voice: 6, fat: 0.1, bleed: true, road: false },
  };
  const dishKey = (id) => Object.keys(DISH).find((k) => DISH[k] === id) || null;
  function haveFor(key) {
    const r = RECIPES[key]; if (!r) return false;
    return r.needs.every(([id, n]) => count(id) >= n);
  }
  function nearFire() {
    if (!hasG() || !Array.isArray(G.ents) || typeof Engine === 'undefined') return null;
    const c = Engine.cam;
    let best = null, bd = FIRE_RANGE * FIRE_RANGE;
    for (const e of G.ents) {
      if (!e || e.hidden || e.dead || e.kind !== 'deco' || !FIRES.has(e.sprite)) continue;
      const d = (e.x - c.x) * (e.x - c.x) + (e.y - c.y) * (e.y - c.y);
      if (d < bd) { bd = d; best = e; }
    }
    return best;
  }
  function cook(key) {
    if (!cfg.cooking || !haveFor(key) || !P()) { say(TX.cook.need, 'warn', 4000); return false; }
    const r = RECIPES[key];
    for (const [id, n] of r.needs) for (let i = 0; i < n; i++) G.take(id);
    const well = Math.random() * 100 < 8 + skill('Physician', 15) * 0.5;
    G.give(r.make, 1);
    if (well) { fset('p15h_well', fint('p15h_well') + 1, 9999); if (P()) P().p15well = true; }
    fset('p15h_cook', fint('p15h_cook') + 1, 9999);
    try { if (typeof passHours === 'function') passHours(COOK_HOURS); } catch (e) { warn('hours', e); }
    sfx('pickup');
    const name = ITEMS[r.make] ? ITEMS[r.make].name : key;
    say((well ? TX.cook.madeWell : TX.cook.made).replace('{0}', name), 'good', 6000);
    if (fint('p15h_cook') === 1) { try { if (typeof journal === 'function') journal('side', TX.cook.journal); } catch (e) { warn('journal', e); } }
    return true;
  }
  // a dish is eaten from the pack: useItem hands it here
  function eat(id) {
    const key = dishKey(id), p = P();
    if (!key || !p) return false;
    const e = EFFECTS[key], well = p.p15well === true;
    const k = well ? 1.5 : 1;
    p.hp = Math.min(p.hpMax, p.hp + Math.round(e.hp * k));
    if (e.voice) p.voice = Math.min(p.voiceMax, p.voice + Math.round(e.voice * k));
    if (e.fat) p.fat = Math.min(typeof fatCap === 'function' ? fatCap() : p.fatMax, p.fat + p.fatMax * e.fat * k);
    const needsOnNow = typeof needsOn === 'function' ? needsOn() : p.needs === true;
    if (needsOnNow) {
      if (e.hunger) p.hunger = clampH(num(p.hunger, 0, 100, 0) + e.hunger * k, 0, 100);
      if (e.sleep) p.sleep = clampH(num(p.sleep, 0, 100, 0) + e.sleep * k, 0, 100);
    }
    if (e.bleed) { try { if (typeof UPG !== 'undefined' && UPG.status) UPG.status.bleed = 0; } catch (err) { /* optional */ } }
    if (e.road) fset('p15h_fed', dayNow() + 1, 99999);
    G.take(id);
    if (well) delete p.p15well;
    sfx('pickup');
    say(TX.cook.ate.replace('{0}', TX.cook.eat[key]), 'good', 5200);
    return true;
  }
  const foragedKey = () => 'p15h_f:' + (hasG() ? String(G.mapId) : '');
  function canForage() {
    if (!cfg.cooking || !hasG() || !G.map) return 'no';
    if (!G.map.outdoor) return 'indoors';
    return fint(foragedKey(), 99999) === dayNow() + 1 ? 'done' : 'ok';
  }
  function forage() {
    const state = canForage();
    if (state !== 'ok') { say(state === 'indoors' ? TX.cook.indoors : TX.cook.foragedDone, 'warn', 4500); return 0; }
    fset(foragedKey(), dayNow() + 1, 99999);
    const lore = skill('Lore', 15);
    let n = 1 + (lore >= 40 ? 1 : 0) + (Math.random() * 100 < lore ? 1 : 0);
    const got = [];
    for (let i = 0; i < n; i++) {
      const id = Math.random() < 0.45 ? ING.root : Math.random() < 0.72 ? ING.cap : ING.barley;
      G.give(id, 1);
      got.push(ITEMS[id] ? ITEMS[id].name : id);
    }
    if (!got.length) { say(TX.cook.foragedNone, '', 4500); return 0; }
    try { if (typeof gainSkill === 'function') gainSkill('Lore', 1); } catch (e) { /* optional */ }
    sfx('ui');
    say(TX.cook.foraged.replace('{0}', got.join(', ')), 'good', 5500);
    return got.length;
  }
  function openCooking(fire, original) {
    if (!cfg.cooking || !hasG()) return;
    const map = G.map;
    G.state = 'panel';
    const rows = Object.keys(RECIPES).map((key) =>
      `<button class="dfbtn" data-cook="${key}"${haveFor(key) ? '' : ' disabled'}>${TX.cook.dishes[key]}</button>`).join('');
    const sit = fire && fire.use === 'campfire' && typeof original === 'function'
      ? `<button class="dfbtn" id="p15h-sit">${TX.cook.sit}</button>` : '';
    const forageState = canForage();
    openModal('<h2>' + TX.cook.title + '</h2><p>' + TX.cook.intro + '</p>' +
      '<p class="muted">' + TX.cook.state
        .replace('{0}', String(count(ING.root))).replace('{1}', String(count(ING.cap)))
        .replace('{2}', String(count(ING.barley))).replace('{3}', String(count('honey')))
        .replace('{4}', String(count('flume_eel'))) + '</p>' +
      '<div class="list">' + sit + rows +
      `<button class="dfbtn" id="p15h-forage"${forageState === 'ok' ? '' : ' disabled'}>${TX.cook.forage}</button>` +
      '</div><div class="btns"><button class="dfbtn" id="p15h-cook-close">' + TX.cook.close + '</button></div>', 'p15cook');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15cook' && G.map === map && !G.dead;
    const leave = () => { closeModal(); G.state = 'play'; G.keys = {}; };
    document.getElementById('p15h-cook-close').onclick = () => { if (valid()) leave(); };
    document.getElementById('p15h-forage').onclick = () => { if (valid()) { leave(); forage(); } };
    if (sit) document.getElementById('p15h-sit').onclick = () => { if (valid()) { leave(); try { original(fire); } catch (e) { warn('sit', e); } } };
    for (const b of document.querySelectorAll('[data-cook]')) {
      b.onclick = () => { if (!valid()) return; const key = b.dataset.cook; leave(); cook(key); };
    }
  }

  // ================================================================ 2. Eights, at the east table
  const NESSA = { x: 12.5, y: 3.6, facing: Math.PI / 2 };
  // the module's own stream: mulberry32 of the day and the hands dealt, so the game's rolls are never drawn
  function mulberry32(a) {
    return function () {
      a |= 0; a = (a + 0x6D2B79F5) | 0;
      let t = Math.imul(a ^ (a >>> 15), 1 | a);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }
  const cardsOpen = () => {
    if (!cfg.cards || !hasG()) return false;
    const f = G.flags;
    if (f.greening || f.part3 || f.part4 || f.escaped) return false;
    const h = hourNow();
    return h >= 17 || h < 1;
  };
  const lostToday = () => (fint('p15h_cday', 99999) === dayNow() + 1 ? fint('p15h_closs', 9999) : 0);
  function noteLoss(n) {
    const was = lostToday();
    fset('p15h_cday', dayNow() + 1, 99999);
    fset('p15h_closs', clampH(was + n, 0, 9999), 9999);
  }
  const maxStake = () => clampH(Math.min(STAKE_MAX, gold(), LOSS_CAP - lostToday()), 0, STAKE_MAX);
  function deckFor(hand) {
    const rng = mulberry32(dayNow() * 977 + hand * 7919 + 13);
    const d = [];
    for (let s = 0; s < 4; s++) for (let r = 1; r <= 8; r++) d.push({ s, r });
    for (let i = d.length - 1; i > 0; i--) { const j = Math.floor(rng() * (i + 1)); const t = d[i]; d[i] = d[j]; d[j] = t; }
    return d;
  }
  const cardName = (c) => SUITS[c.s] + ' ' + c.r;
  const total = (hand) => hand.reduce((a, c) => a + c.r, 0);
  let game = null;        // live only: the hand on the table
  function newHand(stake) {
    const hands = fint('p15h_hands', 99999) + 1;
    fset('p15h_hands', hands, 99999);
    const deck = deckFor(hands);
    game = { deck, i: 0, you: [], her: [], stake: clampH(stake, STAKE_MIN, STAKE_MAX), done: false, result: null, hand: hands };
    game.you.push(deck[game.i++], deck[game.i++]);
    game.her.push(deck[game.i++], deck[game.i++]);
    return game;
  }
  function hit() {
    if (!game || game.done) return null;
    const c = game.deck[game.i++];
    game.you.push(c);
    if (total(game.you) > TARGET) settle('bust');
    return c;
  }
  function stand() {
    if (!game || game.done) return null;
    while (total(game.her) < DEALER_STANDS && game.i < game.deck.length) game.her.push(game.deck[game.i++]);
    const you = total(game.you), her = total(game.her);
    if (her > TARGET) settle('won');
    else if (you > her) settle('won');
    else if (her > you) settle('lost');
    else settle('push');
    return game.result;
  }
  function settle(result) {
    if (!game || game.done) return;
    game.done = true; game.result = result;
    const p = P(), stake = game.stake;
    const octave = result === 'won' && game.you.length === 2 && total(game.you) === TARGET;
    fset('p15h_cards', fint('p15h_cards') + 1, 99999);
    if (result === 'won') {
      const pay = octave ? Math.round(stake * 1.5) : stake;
      if (p) p.gold = gold() + pay;
      fset('p15h_cwin', fint('p15h_cwin') + 1, 99999);
      game.paid = pay;
      try { if (typeof PLAYTOOLS !== 'undefined' && PLAYTOOLS.inc) PLAYTOOLS.inc('p7s_earned', pay); } catch (e) { /* optional */ }
      say(octave ? TX.cards.octave : TX.cards.won.replace('{0}', String(total(game.you))).replace('{1}', String(total(game.her))).replace('{2}', String(pay)), 'good', 6000);
      sfx('pickup');
    } else if (result === 'lost' || result === 'bust') {
      const lose = Math.min(stake, gold());
      if (p) p.gold = gold() - lose;
      noteLoss(lose);
      game.paid = -lose;
      try { if (typeof PLAYTOOLS !== 'undefined' && PLAYTOOLS.inc) PLAYTOOLS.inc('p7s_spent', lose); } catch (e) { /* optional */ }
      say(result === 'bust' ? TX.cards.bust : TX.cards.lost.replace('{0}', String(total(game.her))).replace('{1}', String(total(game.you))).replace('{2}', String(lose)), 'bad', 6000);
    } else {
      game.paid = 0;
      say(TX.cards.push.replace('{0}', String(total(game.you))), '', 5000);
    }
    if (fint('p15h_cards') === 1) { try { if (typeof journal === 'function') journal('side', TX.cards.journal); } catch (e) { warn('journal', e); } }
  }
  let stake = 5;
  function openCards() {
    if (!cfg.cards || !hasG()) return;
    if (!cardsOpen()) { say(TX.cards.closed, 'warn', 5000); return; }
    const map = G.map;
    G.state = 'panel';
    renderCards(map);
  }
  function renderCards(map) {
    const cap = maxStake();
    stake = clampH(stake, STAKE_MIN, Math.max(STAKE_MIN, cap));
    const you = game ? game.you.map(cardName).join(' · ') : '—';
    const her = game ? (game.done ? game.her.map(cardName).join(' · ') : cardName(game.her[0]) + ' · ' + TX.cards.down) : '—';
    const yourTotal = game ? total(game.you) : 0;
    const herTotal = game && game.done ? total(game.her) : null;
    const live = !!game && !game.done;
    const html = '<h2>' + TX.cards.title + '</h2><p class="muted">' + TX.cards.rules + '</p>' +
      '<p class="muted">' + TX.cards.purse.replace('{0}', String(gold())).replace('{1}', String(stake)).replace('{2}', String(lostToday())).replace('{3}', String(LOSS_CAP)) + '</p>' +
      '<p><b>' + TX.cards.yours + ':</b> ' + you + (game ? ' <b>(' + yourTotal + ')</b>' : '') + '</p>' +
      '<p><b>' + TX.cards.hers + ':</b> ' + her + (herTotal != null ? ' <b>(' + herTotal + ')</b>' : '') + '</p>' +
      '<div class="btns">' +
      (live ? `<button class="dfbtn" id="p15h-hit">${TX.cards.draw}</button><button class="dfbtn" id="p15h-stand">${TX.cards.stand}</button>`
        : `<button class="dfbtn" id="p15h-deal"${cap >= STAKE_MIN ? '' : ' disabled'}>${TX.cards.deal}</button>` +
          `<button class="dfbtn small" id="p15h-less"${stake > STAKE_MIN ? '' : ' disabled'}>${TX.cards.less}</button>` +
          `<button class="dfbtn small" id="p15h-more"${stake < cap ? '' : ' disabled'}>${TX.cards.more}</button>`) +
      `<button class="dfbtn" id="p15h-cards-close">${TX.cards.leave}</button></div>` +
      (cap < STAKE_MIN ? '<p class="muted">' + (gold() < STAKE_MIN ? TX.cards.poor : TX.cards.capped) + '</p>' : '');
    openModal(html, 'p15cards');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15cards' && G.map === map && !G.dead;
    const again = () => { if (valid()) { closeModal(); renderCards(map); } };
    const leave = () => { game = null; closeModal(); G.state = 'play'; G.keys = {}; };
    document.getElementById('p15h-cards-close').onclick = () => { if (valid()) leave(); };
    const by = (id, fn) => { const b = document.getElementById(id); if (b) b.onclick = () => { if (!valid()) return; fn(); again(); }; };
    by('p15h-deal', () => { newHand(stake); });
    by('p15h-hit', () => { hit(); });
    by('p15h-stand', () => { stand(); });
    by('p15h-less', () => { stake = clampH(stake - 1, STAKE_MIN, STAKE_MAX); });
    by('p15h-more', () => { stake = clampH(stake + 1, STAKE_MIN, maxStake()); });
  }
  function registerNpc() {
    if (typeof NPCS === 'undefined' || NPCS.p15_dealer) return;
    NPCS.p15_dealer = {
      name: TX.cards.name, sprite: 'townswoman', portrait: 'townswoman', tier: 'low',
      greet: { polite: TX.cards.greetPolite, normal: TX.cards.greetNormal, blunt: TX.cards.greetBlunt },
      topics: { 'Oakhaven': TX.cards.topic }, quest: () => null,
    };
  }
  function ensureNessa(m) {
    if (!m || m.id !== 'tavern' || !Array.isArray(m.entities)) return;
    const have = m.entities.find((e) => e && e._p15h === 'nessa');
    if (!cardsOpen()) { if (have) m.entities.splice(m.entities.indexOf(have), 1); return; }
    if (have) return;
    const e = {
      kind: 'npc', id: 'p15_dealer', sprite: 'townswoman', x: NESSA.x, y: NESSA.y, scale: 1, solid: true,
      radius: 0.35, facing: NESSA.facing, transient: true, _decor: true, _p15h: 'nessa',
    };
    if (typeof hydrate === 'function') hydrate(e);
    e.wanderT = 1e9; e.dir = NESSA.facing;
    m.entities.push(e);
  }

  // ================================================================ 3. boss trophies
  // [PROPOSED] the nine great enemies of Book One, in a fixed order: the bit is the index
  const BOSSES = ['wearer', 'aegis', 'pressman', 'weaver', 'broodmother', 'requiem', 'wearer_coda', 'deacon', 'captain'];
  const PEGS = [[10.2, 5.2], [10.4, 5.5], [10.6, 5.8], [10.0, 5.9], [10.8, 5.3], [10.1, 5.6], [10.7, 5.6], [10.3, 5.9], [10.5, 5.2]];
  const troBits = () => fint('p15h_tro', (1 << BOSSES.length) - 1);
  const hasTrophy = (type) => { const i = BOSSES.indexOf(type); return i >= 0 && (troBits() & (1 << i)) !== 0; };
  const trophyCount = () => BOSSES.reduce((n, t) => n + (hasTrophy(t) ? 1 : 0), 0);
  function takeTrophy(type) {
    if (!cfg.trophies) return false;
    const i = BOSSES.indexOf(type);
    if (i < 0 || hasTrophy(type)) return false;
    fset('p15h_tro', troBits() | (1 << i), (1 << BOSSES.length) - 1);
    say(TX.tro.took.replace('{0}', TX.tro.list[type]), 'good', 6500);
    if (trophyCount() === 1) { try { if (typeof journal === 'function') journal('side', TX.tro.journal); } catch (e) { warn('journal', e); } }
    if (trophyCount() === BOSSES.length) {
      say(TX.tro.full, 'good', 8000);
      try { if (typeof earnTitle === 'function') earnTitle(TX.tro.title_award); } catch (e) { /* optional */ }
    }
    return true;
  }
  function openRack(original, deco) {
    if (!hasG()) return;
    const map = G.map;
    G.state = 'panel';
    const taken = BOSSES.filter(hasTrophy);
    const rows = taken.length
      ? '<table>' + taken.map((t) => `<tr><td><b>${TX.tro.list[t]}</b></td><td class="muted">${TX.tro.from[t]}</td></tr>`).join('') + '</table>'
      : '<p class="muted">' + TX.tro.none + '</p>';
    const kills = num(P() ? P().kills : 0, 0, 1e9, 0);
    const names = hasG() && Array.isArray(G.ledger) ? G.ledger.length : 0;
    openModal('<h2>' + TX.tro.title + '</h2><p>' + TX.tro.intro + '</p>' +
      '<p class="muted">' + TX.tro.count.replace('{0}', String(trophyCount())).replace('{1}', String(BOSSES.length))
        .replace('{2}', String(kills)).replace('{3}', String(names)) + '</p>' + rows +
      '<div class="btns"><button class="dfbtn" id="p15h-rack-close">' + TX.tro.close + '</button></div>', 'p15rack');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15rack' && G.map === map && !G.dead;
    document.getElementById('p15h-rack-close').onclick = () => { if (valid()) { closeModal(); G.state = 'play'; G.keys = {}; } };
    void original; void deco;
  }
  // the trophies themselves, hanging on the pegs in the house
  function ensureTrophies(m) {
    if (!m || m.id !== 'cooper_house' || !Array.isArray(m.entities)) return;
    for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && typeof e._p15h === 'string' && e._p15h.startsWith('tro')) m.entities.splice(i, 1); }
    if (!cfg.trophies) return;
    BOSSES.forEach((t, i) => {
      if (!hasTrophy(t)) return;
      const at = PEGS[i % PEGS.length];
      const e = {
        kind: 'deco', sprite: 'loot', x: at[0], y: at[1], scale: 0.22, yOff: -0.35, solid: false,
        radius: 0.1, nopick: false, transient: true, _decor: true, _p15h: 'tro' + i,
        use: 'p15h_rack', label: TX.tro.list[t] + ' — ' + TX.tro.from[t],
      };
      if (typeof hydrate === 'function') hydrate(e);
      m.entities.push(e);
    });
  }

  // ================================================================ dialogue, options
  function el(tag, props, text) {
    const e = document.createElement(tag);
    if (props) for (const k in props) { if (k === 'class') e.className = props[k]; else e.setAttribute(k, props[k]); }
    if (text != null) e.textContent = text;
    return e;
  }
  function addDialogueButtons() {
    if (!hasG() || typeof DLG === 'undefined' || !DLG.npc || typeof NPCS === 'undefined') return;
    if (DLG.npc !== NPCS.p15_dealer || !cfg.cards) return;
    const btns = document.querySelector('#modal-panel .dlg .btns'); if (!btns) return;
    if (btns.querySelector('#d-p15-cards')) return;
    const b = el('button', { class: 'dfbtn small', id: 'd-p15-cards', type: 'button' }, TX.cards.button);
    b.onclick = () => { try { closeModal(); G.state = 'play'; openCards(); } catch (e) { warn('cards-btn', e); } };
    btns.insertBefore(b, btns.querySelector('#d-bye') || null);
  }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('p15h-cooking')) return;
    const label = (t, hint) => { const s = el('span', { class: 'gfx-label' }, t + ' '); s.appendChild(el('small', { class: 'muted' }, hint)); return s; };
    const row = (rid, key, name, hint) => {
      grid.appendChild(label(name, hint));
      const b = el('button', { class: 'dfbtn small', id: rid, type: 'button', 'aria-pressed': cfg[key] ? 'true' : 'false' }, cfg[key] ? TX.opts.on : TX.opts.off);
      b.classList.toggle('sel', cfg[key]);
      b.onclick = () => {
        cfg[key] = !cfg[key]; saveCfg();
        b.textContent = cfg[key] ? TX.opts.on : TX.opts.off;
        b.setAttribute('aria-pressed', cfg[key] ? 'true' : 'false');
        b.classList.toggle('sel', cfg[key]);
        sync();
      };
      grid.appendChild(b);
    };
    row('p15h-cooking', 'cooking', TX.opts.cooking, TX.opts.cookingHint);
    row('p15h-cards', 'cards', TX.opts.cards, TX.opts.cardsHint);
    row('p15h-trophies', 'trophies', TX.opts.trophies, TX.opts.trophiesHint);
  }
  function sync() {
    try {
      if (!hasG() || !G.maps) return;
      if (G.maps.tavern) ensureNessa(G.maps.tavern);
      if (G.maps.cooper_house) ensureTrophies(G.maps.cooper_house);
    } catch (e) { warn('sync', e); }
  }

  // ================================================================ install
  function install() {
    loadCfg();
    registerItems();
    registerNpc();
    if (typeof useDeco === 'function') {
      const _use = useDeco;
      useDeco = function (e) {
        try {
          if (e && cfg.trophies && (e.use === 'p15h_rack' || e.use === 'house_trophy')) { openRack(_use, e); return; }
          if (e && cfg.cooking && e.kind === 'deco' && FIRES.has(e.sprite) && (!e.use || e.use === 'campfire')) { openCooking(e, _use); return; }
        } catch (err) { warn('use', err); }
        return _use.apply(this, arguments);
      };
    }
    if (typeof useItem === 'function') {
      const _item = useItem;
      useItem = function (slot) {
        try {
          if (cfg.cooking && slot && dishKey(slot.id)) {
            const ok = eat(slot.id);
            if (ok) { if (typeof renderInventory === 'function' && G.openPanel === 'inventory') renderInventory(); return; }
          }
        } catch (e) { warn('useItem', e); }
        return _item.apply(this, arguments);
      };
    }
    if (typeof killEnemy === 'function') {
      const _kill = killEnemy;
      killEnemy = function (e) {
        const type = e && typeof e.type === 'string' ? e.type : null;
        const was = e && e.dead;
        const r = _kill.apply(this, arguments);
        try { if (cfg.trophies && type && !was && e && e.dead) takeTrophy(type); } catch (err) { warn('trophy', err); }
        return r;
      };
    }
    // the stew's warmth is spent on the next journey
    if (typeof travelGo === 'function') {
      const _go = travelGo;
      travelGo = function () {
        const fed = cfg.cooking && fint('p15h_fed', 99999) > 0 && fint('p15h_fed', 99999) >= dayNow();
        const r = _go.apply(this, arguments);
        try {
          if (fed && P()) {
            fset('p15h_fed', 0, 99999);
            P().fat = typeof fatCap === 'function' ? fatCap() : P().fatMax;
            say(TX.cook.warm, 'good', 5500);
          }
        } catch (e) { warn('warm', e); }
        return r;
      };
    }
    if (typeof loadMap === 'function') {
      const _load = loadMap;
      loadMap = function (id) {
        try { if (hasG() && G.maps && G.maps[id]) { ensureNessa(G.maps[id]); ensureTrophies(G.maps[id]); } } catch (e) { warn('pre-load', e); }
        const r = _load.apply(this, arguments);
        try { if (hasG() && G.map) { ensureNessa(G.map); ensureTrophies(G.map); } } catch (e) { warn('post-load', e); }
        return r;
      };
    }
    if (typeof restoreGame === 'function') {
      const _restore = restoreGame;
      restoreGame = function () {
        game = null;
        const r = _restore.apply(this, arguments);
        try { if (P() && P().p15well !== true) delete P().p15well; sync(); } catch (e) { warn('restore', e); }
        return r;
      };
    }
    if (typeof renderDialogue === 'function') {
      const _rd = renderDialogue;
      renderDialogue = function () { const r = _rd.apply(this, arguments); try { addDialogueButtons(); } catch (e) { warn('dialogue', e); } return r; };
    }
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRows(); } catch (e) { warn('options', e); } return r; };
    }
    if (typeof update === 'function') {
      const _up = update;
      let acc = 0;
      update = function (dt) {
        const r = _up.apply(this, arguments);
        try { acc += dt; if (acc >= 2) { acc = 0; if (hasG() && G.map && (G.mapId === 'tavern' || G.mapId === 'cooper_house')) sync(); } } catch (e) { warn('tick', e); }
        return r;
      };
    }
    try { sync(); } catch (e) { /* nothing built yet */ }
  }
  try { install(); } catch (e) { console.warn('hearth15: install failed', e); }

  return {
    TX, LIST, cfg, saveCfg, loadCfg,
    FIRES, FIRE_RANGE, COOK_HOURS, ING, DISH, RECIPES, EFFECTS, registerItems,
    nearFire, haveFor, cook, eat, forage, canForage, openCooking, dishKey,
    SUITS, STAKE_MIN, STAKE_MAX, LOSS_CAP, TARGET, DEALER_STANDS, mulberry32, deckFor, cardName, total,
    cardsOpen, maxStake, lostToday, newHand, hit, stand, settle, openCards, renderCards, ensureNessa,
    get game() { return game; }, get stake() { return stake; }, set stake(v) { stake = clampH(v, STAKE_MIN, STAKE_MAX); },
    BOSSES, troBits, hasTrophy, trophyCount, takeTrophy, openRack, ensureTrophies,
    sync, appendRows, addDialogueButtons,
  };
})();
if (typeof window !== 'undefined') window.HEARTH15 = HEARTH15;
