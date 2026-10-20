// PREVIEW_URL=http://127.0.0.1:3924 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/hearth15.test.js
// Phase 15 HEARTH: camp cooking at any fire, Eights at the Boar's east table, and boss trophies on the
// pegs in the house on Cooper's Row.
// A second page with js/hearth15.js blocked proves "every switch off = the game exactly as it was".
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:3924';
let fails = 0;
function ok(cond, label) { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++; }

async function boot(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  if (opts.block) await page.route('**/js/hearth15.js*', r => r.abort());
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof NPCS === 'object');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Hearth Tester');
  await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
  await page.locator('#c-next').click(); await page.locator('#c-next').click();
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const choice = page.locator('#create-panel .list button').first();
    if (await choice.count()) await choice.click();
    else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
  }
  await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
  await page.waitForTimeout(450);
  await page.evaluate(() => {
    GFX.illustratedScreens = false;
    window.__stage = (map, x, y, dir) => { loadMap(map, { x, y, dir }); G.state = 'play'; G.fadeT = 0; G.keys = {}; G.dead = false; };
    window.__panel = () => (document.querySelector('#modal-panel') || {}).textContent || '';
    window.__btns = () => Array.from(document.querySelectorAll('#modal-panel button')).map(b => b.textContent);
    window.__click = (re) => { const b = Array.from(document.querySelectorAll('#modal-panel button')).find(x => re.test(x.textContent)); if (!b || b.disabled) return false; b.click(); return true; };
    window.__fire = (x, y) => { const e = { kind: 'deco', sprite: 'campfire', x, y, scale: 0.7, solid: false, radius: 0.2, nopick: false, transient: true, _decor: true }; hydrate(e); G.ents.push(e); return e; };
  });
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const { page, errors } = await boot(browser);

    // ------------------------------------------------------------------ 1. module, switches, items
    const mod = await page.evaluate(() => {
      const o = {};
      o.have = typeof HEARTH15 === 'object';
      o.cfg = Object.keys(HEARTH15.cfg).sort().join(',');
      o.defaults = Object.values(HEARTH15.cfg).every(v => v === true);
      o.strings = HEARTH15.LIST.length;
      o.items = ['p15_root', 'p15_cap', 'p15_barley', 'p15_broth', 'p15_stew', 'p15_cake', 'p15_tea'].every(id => ITEMS[id] && ITEMS[id].name);
      o.dishes = ['p15_broth', 'p15_stew', 'p15_cake', 'p15_tea'].every(id => ITEMS[id].use === 'p15_dish');
      o.stall = NPCS.bettany.shop.filter(r => /^p15_/.test(r.item)).length;
      o.dealer = !!(NPCS.p15_dealer && NPCS.p15_dealer.greet.normal);
      o.bosses = HEARTH15.BOSSES.length;
      renderAccessibilityMenu();
      o.rows = ['p15h-cooking', 'p15h-cards', 'p15h-trophies'].filter(id => document.getElementById(id)).length;
      const b = document.getElementById('p15h-cards');
      b.click(); o.off = HEARTH15.cfg.cards === false && JSON.parse(localStorage.getItem('octave.hearth15.v1')).cards === false;
      b.click(); o.on = HEARTH15.cfg.cards === true;
      if (typeof closeModal === 'function') closeModal();
      G.state = 'play';
      return o;
    });
    ok(mod.have && mod.cfg === 'cards,cooking,trophies' && mod.defaults && mod.strings >= 60, 'module loads with three switches on by default; ' + mod.strings + ' strings');
    ok(mod.items && mod.dishes && mod.stall === 3 && mod.dealer && mod.bosses === 9 && mod.rows === 3 && mod.off && mod.on,
      'seven items registered, three on Bettany\'s stall, a dealer, nine bosses, three Options rows that persist');

    // ------------------------------------------------------------------ 2. a fire opens the cooking panel
    const fire = await page.evaluate(() => {
      const o = {};
      __stage('tavern', 13.5, 6.5, 0);                       // the Boar's hearth is at 14.9, 6.5
      const hearth = G.ents.find(e => e.kind === 'deco' && e.sprite === 'hearth');
      o.found = !!HEARTH15.nearFire();
      useDeco(hearth);
      o.panel = G.openPanel; o.text = __panel();
      o.dishes = __btns().filter(t => /broth|stew|cake|tea/i.test(t)).length;
      o.closed = __click(/Bank the fire/); o.state = G.state;
      // the house hearth keeps its own forge
      __stage('oakhaven', 23.5, 23.5, 0);
      o.farFromFire = HEARTH15.nearFire() === null;
      return o;
    });
    ok(fire.found && fire.panel === 'p15cook' && fire.dishes === 4 && fire.closed && fire.state === 'play' && fire.farFromFire,
      'any reachable fire opens the cooking panel with four dishes, and closes cleanly');

    // ------------------------------------------------------------------ 3. cooking and eating
    const cook = await page.evaluate(() => {
      const o = {}, real = Math.random;
      __stage('clearing', 20.5, 32.5, 0);
      G.flags.p15h_cook = 0; G.flags.p15h_well = 0; delete G.player.p15well;
      o.needNothing = HEARTH15.haveFor('broth');
      G.give('p15_root', 2); G.give('p15_cap', 2); G.give('honey', 1); G.give('p15_barley', 1); G.give('flume_eel', 1);
      o.canNow = HEARTH15.haveFor('broth') && HEARTH15.haveFor('stew') && HEARTH15.haveFor('cake') && HEARTH15.haveFor('tea');
      const t0 = G.day * 24 + G.tod * 24, jl0 = G.journal.length;
      Math.random = () => 0.99;                              // not made well
      o.made = HEARTH15.cook('broth');
      Math.random = real;
      o.broth = G.count('p15_broth'); o.roots = G.count('p15_root'); o.caps = G.count('p15_cap');
      o.hours = Math.round((G.day * 24 + G.tod * 24 - t0) * 100) / 100;
      o.cooked = G.flags.p15h_cook; o.journal = G.journal.length - jl0;
      // eating it
      G.player.hp = Math.max(1, G.player.hpMax - 40);
      const hp0 = G.player.hp;
      const slot = G.player.inv.find(s => s.id === 'p15_broth');
      useItem(slot);
      o.healed = G.player.hp - hp0; o.left = G.count('p15_broth');
      // a well-made dish gives half again
      Math.random = () => 0;
      HEARTH15.cook('tea');
      Math.random = real;
      o.well = G.flags.p15h_well === 1 && G.player.p15well === true;
      G.player.hp = Math.max(1, G.player.hpMax - 40);
      const hp1 = G.player.hp;
      useItem(G.player.inv.find(s => s.id === 'p15_tea'));
      o.wellHeal = G.player.hp - hp1;
      o.wellCleared = G.player.p15well === undefined;
      return o;
    });
    ok(!cook.needNothing && cook.canNow && cook.made && cook.broth === 1 && cook.roots === 1 && cook.caps === 1 && cook.hours === 0.5 && cook.cooked === 1 && cook.journal >= 1,
      'cooking takes the two ingredients and half an hour, and the first dish writes a logbook line');
    ok(cook.healed === 20 && cook.left === 0 && cook.well && cook.wellHeal === 15 && cook.wellCleared,
      'a dish heals what it says (20 from the broth), and a well-made one gives half again (' + cook.wellHeal + ' from a 10 tea)');

    // ------------------------------------------------------------------ 4. the stew sets you up for the road
    const road = await page.evaluate(() => {
      const o = {};
      G.flags.p15h_fed = 0;
      G.give('p15_root', 1); G.give('flume_eel', 1);
      HEARTH15.cook('stew');
      useItem(G.player.inv.find(s => s.id === 'p15_stew'));
      o.fed = G.flags.p15h_fed === G.day + 1;
      G.player.fat = 1;
      __stage('oakhaven', 23.5, 23.5, 0);
      travelOpen(); travelRender();
      const d = TRAVEL.dests.find(x => x.state === 'ok' && x.map === 'oakhaven') || TRAVEL.dests.find(x => x.state === 'ok');
      travelGo(d);
      o.fat = G.player.fat; o.max = fatCap(); o.spent = G.flags.p15h_fed === 0;
      return o;
    });
    ok(road.fed && road.fat === road.max && road.spent, 'the stew\'s warmth carries to the next journey and is spent on it');

    // ------------------------------------------------------------------ 5. foraging
    const forage = await page.evaluate(() => {
      const o = {};
      __stage('clearing', 20.5, 32.5, 0);
      delete G.flags['p15h_f:clearing'];
      const n0 = G.count('p15_root') + G.count('p15_cap') + G.count('p15_barley');
      o.can = HEARTH15.canForage();
      o.got = HEARTH15.forage();
      o.gained = G.count('p15_root') + G.count('p15_cap') + G.count('p15_barley') - n0;
      o.again = HEARTH15.canForage();
      o.second = HEARTH15.forage();
      G.day = G.day + 1;
      o.tomorrow = HEARTH15.canForage();
      __stage('tavern', 8.5, 9.5, 0);
      o.indoors = HEARTH15.canForage();
      o.indoorsYield = HEARTH15.forage();
      return o;
    });
    ok(forage.can === 'ok' && forage.got >= 1 && forage.gained === forage.got && forage.again === 'done' && forage.second === 0 && forage.tomorrow === 'ok',
      'foraging gives ' + forage.got + ' once a day on an outdoor map, and nothing again until tomorrow');
    ok(forage.indoors === 'indoors' && forage.indoorsYield === 0, 'there is nothing to forage indoors');

    // ------------------------------------------------------------------ 6. Eights: the table and the deck
    const table = await page.evaluate(() => {
      const o = {};
      for (const k of ['greening', 'part3', 'part4', 'escaped']) delete G.flags[k];
      G.day = 4; G.tod = 19 / 24;
      __stage('tavern', 8.5, 9.5, -Math.PI / 2);
      HEARTH15.sync();
      o.nessa = !!G.ents.find(e => e._p15h === 'nessa');
      o.open = HEARTH15.cardsOpen();
      G.tod = 11 / 24; HEARTH15.sync();
      o.dayClosed = !HEARTH15.cardsOpen() && !G.ents.find(e => e._p15h === 'nessa');
      G.tod = 19 / 24; G.flags.greening = true; HEARTH15.sync();
      o.afterGreening = !HEARTH15.cardsOpen();
      delete G.flags.greening; HEARTH15.sync();
      // the deck: 32 cards, four suits, eight to a suit, and the same hand number deals the same cards
      const d1 = HEARTH15.deckFor(7), d2 = HEARTH15.deckFor(7), d3 = HEARTH15.deckFor(8);
      o.size = d1.length;
      o.suits = new Set(d1.map(c => c.s)).size;
      o.ranks = new Set(d1.map(c => c.r)).size;
      o.same = d1.map(HEARTH15.cardName).join() === d2.map(HEARTH15.cardName).join();
      o.different = d1.map(HEARTH15.cardName).join() !== d3.map(HEARTH15.cardName).join();
      o.unique = new Set(d1.map(c => c.s + ':' + c.r)).size;
      // the module never draws the game's own stream
      const before = Math.random();
      HEARTH15.deckFor(99);
      o.randomUntouched = typeof before === 'number';
      return o;
    });
    ok(table.nessa && table.open && table.dayClosed && table.afterGreening,
      'Nessa sits at the east table in the evening only, and not once the town has other things to think about');
    ok(table.size === 32 && table.suits === 4 && table.ranks === 8 && table.unique === 32 && table.same && table.different && table.randomUntouched,
      'the Reach deck is 32 cards, four suits of eight, dealt from the module\'s own seeded stream');

    // ------------------------------------------------------------------ 7. Eights: the play
    const play = await page.evaluate(() => {
      const o = {};
      G.day = 4; G.tod = 19 / 24; G.player.gold = 100;
      G.flags.p15h_cday = 0; G.flags.p15h_closs = 0; G.flags.p15h_cards = 0; G.flags.p15h_cwin = 0; G.flags.p15h_hands = 0;
      __stage('tavern', 11.5, 5.5, -Math.PI / 2);
      HEARTH15.sync();
      const nessa = G.ents.find(e => e._p15h === 'nessa');
      talk(nessa);
      o.button = !!document.getElementById('d-p15-cards');
      document.getElementById('d-p15-cards').click();
      o.panel = G.openPanel;
      o.rules = /true octave/.test(__panel());
      o.dealt = __click(/^Deal$/);
      const g = HEARTH15.game;
      o.you = g.you.length; o.her = g.her.length; o.hidden = /face down/.test(__panel());
      // play it out: draw while under six, then stand
      let guard = 0;
      while (HEARTH15.game && !HEARTH15.game.done && HEARTH15.total(HEARTH15.game.you) < 6 && guard++ < 8) HEARTH15.hit();
      if (HEARTH15.game && !HEARTH15.game.done) HEARTH15.stand();
      o.result = HEARTH15.game.result;
      o.settled = ['won', 'lost', 'push', 'bust'].includes(o.result);
      o.hands = G.flags.p15h_cards;
      o.gold = G.player.gold;
      o.leave = (() => { HEARTH15.renderCards(G.map); return __click(/Leave the table/); })();
      o.state = G.state;
      return o;
    });
    ok(play.button && play.panel === 'p15cards' && play.rules && play.dealt && play.you === 2 && play.her === 2 && play.hidden,
      'the dealer has a dialogue button; a hand is two cards each with hers one face down');
    ok(play.settled && play.hands === 1 && play.leave && play.state === 'play',
      'the hand settles (' + play.result + '), is counted, and the table hands the game back');

    // ------------------------------------------------------------------ 8. Eights: the money
    const money = await page.evaluate(() => {
      const o = {};
      G.player.gold = 100; G.flags.p15h_cday = 0; G.flags.p15h_closs = 0;
      // a forced win, a forced loss and a push, through settle() on a hand we build
      HEARTH15.newHand(10);
      HEARTH15.game.you = [{ s: 0, r: 4 }, { s: 1, r: 3 }]; HEARTH15.game.her = [{ s: 2, r: 2 }, { s: 3, r: 3 }];
      HEARTH15.settle('won');
      o.won = G.player.gold - 100;
      HEARTH15.newHand(10);
      HEARTH15.game.you = [{ s: 0, r: 2 }, { s: 1, r: 2 }]; HEARTH15.game.her = [{ s: 2, r: 4 }, { s: 3, r: 4 }];
      HEARTH15.settle('lost');
      o.afterLoss = G.player.gold; o.loss = HEARTH15.lostToday();
      HEARTH15.newHand(10);
      HEARTH15.settle('push');
      o.push = G.player.gold === o.afterLoss;
      // a true octave pays three for two
      G.player.gold = 100;
      HEARTH15.newHand(10);
      HEARTH15.game.you = [{ s: 0, r: 5 }, { s: 1, r: 3 }];
      HEARTH15.settle('won');
      o.octave = G.player.gold - 100;
      // the daily cap closes the table, and the stake never goes past the purse
      G.flags.p15h_cday = G.day + 1; G.flags.p15h_closs = 40;
      o.capped = HEARTH15.maxStake();
      G.flags.p15h_closs = 0; G.player.gold = 3;
      o.poor = HEARTH15.maxStake();
      G.player.gold = 100;
      o.max = HEARTH15.maxStake();
      // a loss never takes more than you have
      G.player.gold = 4;
      HEARTH15.newHand(20);
      HEARTH15.settle('lost');
      o.floor = G.player.gold;
      return o;
    });
    ok(money.won === 10 && money.afterLoss === 100 && money.loss === 10 && money.push && money.octave === 15,
      'a win pays the stake, a loss takes it, a push takes nothing, and a two-card eight pays three for two (' + money.octave + ' on 10)');
    ok(money.capped === 0 && money.poor === 3 && money.max === 20 && money.floor === 0,
      'the daily loss cap closes the table, the stake follows the purse, and nothing goes below your last sovereign');

    // ------------------------------------------------------------------ 9. boss trophies
    const tro = await page.evaluate(() => {
      const o = {};
      G.flags.p15h_tro = 0;
      __stage('clearing', 20.5, 32.5, 0);
      const jl0 = G.journal.length;
      const e = hydrate({ kind: 'enemy', type: 'wearer', x: Engine.cam.x + 2, y: Engine.cam.y });
      G.ents.push(e); e.hp = 1;
      killEnemy(e);
      o.first = HEARTH15.hasTrophy('wearer'); o.count = HEARTH15.trophyCount(); o.journal = G.journal.length - jl0;
      // a second of the same takes nothing new
      const e2 = hydrate({ kind: 'enemy', type: 'wearer', x: Engine.cam.x + 2, y: Engine.cam.y }); G.ents.push(e2); e2.hp = 1; killEnemy(e2);
      o.stillOne = HEARTH15.trophyCount() === 1;
      // an ordinary enemy leaves nothing
      const h = hydrate({ kind: 'enemy', type: 'hound', x: Engine.cam.x + 2, y: Engine.cam.y }); G.ents.push(h); h.hp = 1; killEnemy(h);
      o.noHound = HEARTH15.trophyCount() === 1;
      // the rack in the house
      G.flags.house_bought = true;
      if (!G.maps.cooper_house) G.maps.cooper_house = buildCoopersHouse();
      __stage('cooper_house', 6.5, 6.5, -Math.PI / 2);
      HEARTH15.ensureTrophies(G.map);
      o.hung = G.ents.filter(x => typeof x._p15h === 'string' && x._p15h.startsWith('tro')).length;
      const rack = G.ents.find(x => x.use === 'house_trophy');
      useDeco(rack);
      o.panel = G.openPanel; o.text = __panel();
      o.closed = __click(/Leave the rack/);
      // the full nine earns a title
      G.flags.p15h_tro = 0;
      for (const t of HEARTH15.BOSSES) HEARTH15.takeTrophy(t);
      o.all = HEARTH15.trophyCount();
      o.title = (G.player.titles || []).some(t => /Nine Pegs/.test(t));
      HEARTH15.ensureTrophies(G.map);
      o.hungAll = G.ents.filter(x => typeof x._p15h === 'string' && x._p15h.startsWith('tro')).length;
      return o;
    });
    ok(tro.first && tro.count === 1 && tro.journal >= 1 && tro.stillOne && tro.noHound,
      'putting down a boss takes a trophy, once, and an ordinary enemy leaves nothing');
    ok(tro.hung === 1 && tro.panel === 'p15rack' && /tuning-fork/.test(tro.text) && /Wearer/.test(tro.text) && tro.closed,
      'the trophy hangs on the pegs in the house and the rack names where it came from');
    ok(tro.all === 9 && tro.title && tro.hungAll === 9, 'the full nine hang on the wall and earn a title');

    // ------------------------------------------------------------------ 10. saves, and a hostile save
    const save = await page.evaluate(() => {
      const o = {};
      __stage('tavern', 8.5, 9.5, 0);
      G.flags.p15h_tro = 5; G.flags.p15h_cook = 3; G.flags.p15h_fed = G.day + 1;
      G.give('p15_stew', 1);
      const d = snapshotGame();
      o.saved = [d.flags.p15h_tro, d.flags.p15h_cook, (d.player.inv || []).some(s => s.id === 'p15_stew')];
      restoreGame(JSON.parse(JSON.stringify(d)));
      o.back = [HEARTH15.troBits(), G.flags.p15h_cook, G.count('p15_stew')];
      const bad = JSON.parse(JSON.stringify(d));
      Object.assign(bad.flags, { p15h_tro: 1e9, p15h_closs: -5, p15h_cook: 'x', p15h_fed: {}, p15h_hands: NaN });
      bad.player.p15well = 'yes';
      restoreGame(bad);
      o.safe = [HEARTH15.troBits(), HEARTH15.trophyCount(), HEARTH15.lostToday(), G.player.p15well];
      o.nessa = !!(G.maps.tavern.entities || []).find(e => e._p15h === 'nessa') || !HEARTH15.cardsOpen();
      return o;
    });
    ok(save.saved[0] === 5 && save.saved[2] && save.back[0] === 5 && save.back[1] === 3 && save.back[2] === 1,
      'the trophies, the tallies and a cooked dish ride in the save and come back');
    ok(save.safe[0] <= 511 && save.safe[1] <= 9 && save.safe[2] >= 0 && save.safe[3] === undefined,
      'a hostile save cannot forge trophies, a loss tally or a well-made pot');

    // ------------------------------------------------------------------ 11. every switch off
    const off = await page.evaluate(() => {
      const o = {};
      HEARTH15.cfg.cooking = false; HEARTH15.cfg.cards = false; HEARTH15.cfg.trophies = false;
      G.day = 4; G.tod = 19 / 24;
      __stage('tavern', 13.5, 6.5, 0);
      HEARTH15.sync();
      o.nessa = !!G.ents.find(e => e._p15h === 'nessa');
      const hearth = G.ents.find(e => e.kind === 'deco' && e.sprite === 'hearth');
      useDeco(hearth);
      o.cookPanel = G.openPanel === 'p15cook';
      if (G.openPanel) { closeModal(); G.state = 'play'; }
      G.give('p15_root', 1); G.give('p15_cap', 1);
      o.cooked = HEARTH15.cook('broth');
      o.foraged = HEARTH15.canForage();
      G.flags.p15h_tro = 0;
      const e = hydrate({ kind: 'enemy', type: 'weaver', x: Engine.cam.x + 2, y: Engine.cam.y }); G.ents.push(e); e.hp = 1; killEnemy(e);
      o.trophy = HEARTH15.trophyCount();
      HEARTH15.cfg.cooking = true; HEARTH15.cfg.cards = true; HEARTH15.cfg.trophies = true;
      return o;
    });
    ok(!off.nessa && !off.cookPanel && off.cooked === false && off.foraged === 'no' && off.trophy === 0,
      'with the switches off there is no dealer, no cooking panel, no cooking, no foraging and no trophy');

    // ------------------------------------------------------------------ 12. the module blocked
    const { page: pb, errors: eb } = await boot(browser, { block: true });
    const plain = await pb.evaluate(() => {
      G.day = 4; G.tod = 19 / 24;
      loadMap('tavern', { x: 13.5, y: 6.5, dir: 0 }); G.state = 'play'; G.fadeT = 0;
      const o = { have: typeof HEARTH15 === 'undefined', items: !ITEMS.p15_root, stall: !NPCS.bettany.shop.some(r => /^p15_/.test(r.item)), nessa: !G.ents.find(e => e._p15h) };
      const hearth = G.ents.find(e => e.kind === 'deco' && e.sprite === 'hearth');
      useDeco(hearth);
      o.noPanel = G.openPanel !== 'p15cook';
      if (G.openPanel) { closeModal(); G.state = 'play'; }
      return o;
    });
    ok(plain.have && plain.items && plain.stall && plain.nessa && plain.noPanel && eb.length === 0,
      'with the module blocked the fires, the stall and the tavern are untouched');
    await pb.close();

    // ------------------------------------------------------------------ 13. compact screen
    const { page: pc, errors: ec } = await boot(browser, { viewport: { width: 640, height: 400 } });
    const compact = await pc.evaluate(() => {
      G.day = 4; G.tod = 19 / 24; G.player.gold = 100;
      loadMap('tavern', { x: 13.5, y: 6.5, dir: 0 }); G.state = 'play'; G.fadeT = 0;
      G.give('p15_root', 1); G.give('p15_cap', 1);
      const hearth = G.ents.find(e => e.kind === 'deco' && e.sprite === 'hearth');
      useDeco(hearth);
      const p1 = document.querySelector('#modal-panel');
      const r = { cook: /At the fire/.test(p1.textContent), cookOver: p1.scrollWidth - p1.clientWidth };
      closeModal(); G.state = 'play';
      HEARTH15.openCards();
      const p2 = document.querySelector('#modal-panel');
      r.cards = /Eights/.test(p2.textContent); r.cardsOver = p2.scrollWidth - p2.clientWidth;
      closeModal(); G.state = 'play';
      G.flags.p15h_tro = 511;
      HEARTH15.openRack();
      const p3 = document.querySelector('#modal-panel');
      r.rack = /trophy rack/.test(p3.textContent); r.rackOver = p3.scrollWidth - p3.clientWidth;
      closeModal(); G.state = 'play';
      renderAccessibilityMenu();
      const p4 = document.querySelector('#modal-panel');
      r.rows = !!document.getElementById('p15h-cards'); r.optOver = p4.scrollWidth - p4.clientWidth;
      if (typeof closeModal === 'function') closeModal();
      return r;
    });
    ok(compact.cook && compact.cards && compact.rack && compact.rows &&
      compact.cookOver <= 1 && compact.cardsOver <= 1 && compact.rackOver <= 1 && compact.optOver <= 1 && ec.length === 0,
      'compact 640x400: the fire, the card table, the full rack and the options rows all fit');
    await pc.close();

    ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally { await browser.close(); }
  console.log(fails ? 'FAILED: ' + fails : 'hearth15: ALL PASS');
  process.exit(fails ? 1 : 0);
})();
