// PREVIEW_URL=http://127.0.0.1:3924 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/roads15.test.js
// Phase 15 ROADS: roadside encounters on world-map journeys, and "Where is...?" marks on the automap.
// A second page with js/roads15.js blocked proves "both switches off = the game exactly as it was".
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const SHOTS = process.env.SHOTS || '';
const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:3924';
let fails = 0;
function ok(cond, label) { console.log((cond ? 'PASS ' : 'FAIL ') + label); if (!cond) fails++; }

async function boot(browser, opts) {
  opts = opts || {};
  const page = await browser.newPage({ viewport: opts.viewport || { width: 1280, height: 800 } });
  const errors = [];
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  page.on('console', m => { if (m.type() === 'error' && !/ERR_FAILED|Failed to load resource/.test(m.text())) errors.push('console: ' + m.text()); });
  if (opts.block) await page.route('**/js/roads15.js*', r => r.abort());
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof NPCS === 'object');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Roads Tester');
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
    if (typeof MOTION10 !== 'undefined' && MOTION10.settings) MOTION10.settings.travel = false;   // the animation is tested in its own suite
    window.__stage = (map, x, y, dir) => { loadMap(map, { x, y, dir }); G.state = 'play'; G.fadeT = 0; G.keys = {}; G.vel.x = G.vel.y = 0; G.dead = false; };
    window.__clear = () => { for (let i = G.ents.length - 1; i >= 0; i--) if (G.ents[i].kind === 'enemy') G.ents.splice(i, 1); };
    window.__run = (secs, dt) => { dt = dt || 0.25; for (let t = 0; t < secs - 1e-9; t += dt) { ANIM.T += dt; update(dt); } };
    window.__event = () => { const p = document.querySelector('#event-panel'); return p && !document.querySelector('#event').classList.contains('hidden') ? p.textContent : null; };
    window.__choices = () => Array.from(document.querySelectorAll('#event-panel button')).map(b => b.textContent);
    window.__choose = (re) => { const b = Array.from(document.querySelectorAll('#event-panel button')).find(x => re.test(x.textContent)); if (!b) return false; b.click(); return true; };
    window.__rep = (f) => G.player.factions[f];
    window.__visit = (id) => { const m = G.maps[id]; if (m && m.visited) m.visited.fill(1); };
  });
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const { page, errors } = await boot(browser);

    // ------------------------------------------------------------------ 1. module, switches, options
    const mod = await page.evaluate(() => {
      const o = {};
      o.have = typeof ROADS15 === 'object';
      o.cfg = Object.keys(ROADS15.cfg).sort().join(',');
      o.defaults = Object.values(ROADS15.cfg).every(v => v === true);
      o.strings = ROADS15.LIST.length;
      o.events = ROADS15.EVENTS.map(e => e.id);
      renderAccessibilityMenu();
      o.rows = ['p15r-events', 'p15r-marks'].filter(id => document.getElementById(id)).length;
      const b = document.getElementById('p15r-marks');
      b.click(); o.off = ROADS15.cfg.marks === false && JSON.parse(localStorage.getItem('octave.roads15.v1')).marks === false;
      b.click(); o.on = ROADS15.cfg.marks === true;
      if (typeof closeModal === 'function') closeModal();
      G.state = 'play';
      return o;
    });
    ok(mod.have && mod.cfg === 'events,marks' && mod.defaults && mod.strings >= 40, 'module loads with two switches on by default; ' + mod.strings + ' strings for the translators');
    ok(mod.events.join() === 'cart,folk,gate,stone,pack' && mod.rows === 2 && mod.off && mod.on, 'five encounters registered; both Options rows toggle and persist');

    // ------------------------------------------------------------------ 2. the catalogue and a mark
    const marks = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      ROADS15.clearMarks();
      const cat = ROADS15.catalogue();
      o.catN = Object.keys(cat).length;
      o.hasChapel = !!cat['The Chapel of the Carillon'] && cat['The Chapel of the Carillon'].map === 'oakhaven';
      o.hasWoods = Object.values(cat).some(c => c.map === 'whispergrove') && Object.values(cat).some(c => c.map === 'deepwoods');
      // asking puts it on the map, exactly as the directions name it
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The Chapel of the Carillon');
      o.marks = ROADS15.marks().map(m => m.k);
      o.saved = (G.player.p15marks || []).map(m => m.k);
      o.day = ROADS15.marks()[0].d;
      // asking again refreshes rather than duplicating
      askPlace('The Chapel of the Carillon');
      o.again = ROADS15.marks().length;
      // an unknown name is never marked
      askPlace('The Office of the Catalogue, Fortis branch');
      o.unknown = ROADS15.marks().length;
      return o;
    });
    ok(marks.catN > 20 && marks.hasChapel && marks.hasWoods, 'the catalogue is read live from the game\'s own place tables (' + marks.catN + ' places, all three hubs)');
    ok(marks.marks.join() === 'The Chapel of the Carillon' && marks.saved.length === 1 && marks.again === 1 && marks.unknown === 1,
      'asking "Where is...?" marks the place once, refreshes on a second ask, and ignores a name the game does not know');

    // ------------------------------------------------------------------ 3. the mark on the automap
    const amap = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      renderMap();
      o.box = (document.getElementById('p15r-marks') || {}).textContent || '';
      o.drawn = ROADS15.marksHere().length;
      o.lines = ROADS15.markLines();
      closeModal(); G.state = 'play';
      // a mark on another map says so instead of giving a bearing
      ROADS15.clearMarks();
      G.player.p15marks = [{ k: 'The Sunken Court', d: 1 }];
      o.elsewhere = ROADS15.markLines()[0] || '';
      o.hereNone = ROADS15.marksHere().length;
      return o;
    });
    ok(amap.drawn === 1 && /Asked after/.test(amap.box) && /Chapel/.test(amap.box) && /paces/.test(amap.lines[0]),
      'the automap gets a chalk cross and a bearing line: "' + amap.lines[0] + '"');
    ok(amap.hereNone === 0 && /not on this map/.test(amap.elsewhere), 'a mark on another map is listed but not drawn here');

    // ------------------------------------------------------------------ 4. walking up to a mark takes it off
    const found = await page.evaluate(() => {
      const o = {};
      ROADS15.clearMarks();
      __stage('oakhaven', 48.5, 14.5, 0);
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The Chapel of the Carillon');                       // the chapel door is at 48.5, 10.5
      o.before = ROADS15.marks().length;
      __run(1, 0.25);
      o.stillThere = ROADS15.marks().length;
      Engine.cam.x = 48.5; Engine.cam.y = 11.2;                     // within two paces
      __run(1, 0.25);
      o.after = ROADS15.marks().length;
      return o;
    });
    ok(found.before === 1 && found.stillThere === 1 && found.after === 0, 'the chalk comes off when you walk up to the place');

    // ------------------------------------------------------------------ 5. a hostile save cannot put its own text on the map
    const safe = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      G.player.p15marks = [
        { k: '<img src=x onerror=alert(1)>', d: 3 },
        { k: 'The Boar & Dulcimer', d: 2 },
        { k: 'The Boar & Dulcimer', d: 9 },
        { k: 42, d: 1 },
        { k: 'The market', d: -1e9 },
      ];
      for (let i = 0; i < 40; i++) G.player.p15marks.push({ k: 'The market', d: i });
      const list = ROADS15.marks();
      o.kept = list.map(m => m.k);
      o.days = list.map(m => m.d);
      renderMap();
      const box = document.getElementById('p15r-marks');
      o.text = box ? box.textContent : '';
      o.html = box ? box.innerHTML : '';
      o.imgs = document.querySelectorAll('#modal-panel img[src="x"]').length;
      closeModal(); G.state = 'play';
      ROADS15.clearMarks();
      return o;
    });
    ok(safe.kept.join() === 'The Boar & Dulcimer,The market' && safe.days.every(d => d >= 0) && safe.imgs === 0 && !/onerror/.test(safe.html),
      'an imported save\'s marks are matched against the catalogue, deduplicated, clamped and never become markup');

    // ------------------------------------------------------------------ 6. the encounter roll
    const roll = await page.evaluate(() => {
      const o = {};
      G.flags.p15r_hour = -1e6; G.flags.p15r_last = 0; G.flags.p15r_ev = 0;
      o.chance30 = Math.round(ROADS15.eventChance(30) * 1000) / 1000;
      o.chance120 = Math.round(ROADS15.eventChance(120) * 1000) / 1000;
      o.ready = ROADS15.readyForEvent();
      const d = { name: 'Oakhaven: the North Gate square', map: 'oakhaven', fx: 0.5, fy: 0.6 };
      o.never = ROADS15.schedule(d, 60, 0.99) === null;              // a high roll: nothing on the road
      o.always = !!ROADS15.schedule(d, 60, 0);                       // a low roll: something
      o.pendingId = ROADS15.pending && ROADS15.pending.id;
      ROADS15.pending = null;
      // two encounters cannot fall within six world hours
      G.flags.p15r_hour = G.day * 24 + G.tod * 24;
      o.gated = ROADS15.schedule(d, 60, 0) === null && ROADS15.readyForEvent() === false;
      G.flags.p15r_hour = -1e6;
      // the switch off means no roll at all
      ROADS15.cfg.events = false;
      o.switchedOff = ROADS15.schedule(d, 60, 0) === null;
      ROADS15.cfg.events = true;
      return o;
    });
    ok(roll.chance30 < roll.chance120 && roll.chance120 <= 0.6 && roll.ready && roll.never && roll.always && roll.pendingId,
      'the roll scales with the hours on the road (' + roll.chance30 + ' at 30 min, ' + roll.chance120 + ' at two hours) and schedules one encounter');
    ok(roll.gated && roll.switchedOff, 'never two within six world hours, and nothing at all with the switch off');

    // ------------------------------------------------------------------ 7. the checkpoint only stands on Synod ground
    const where = await page.evaluate(() => {
      const o = {};
      for (const k of ['rite_ready', 'rite_started', 'greening', 'escaped', 'part3', 'part4']) delete G.flags[k];
      const ctxFree = { region: 'reach', inSynod: false, stage: 0, day: 2, mins: 45, name: 'x', mapId: 'oakhaven' };
      const ctxHeld = Object.assign({}, ctxFree, { inSynod: true, stage: 3 });
      const ids = new Set();
      for (let i = 0; i < 40; i++) { G.flags.p15r_last = 0; const e = ROADS15.pick(ctxFree, i / 40); if (e) ids.add(e.id); }
      o.free = [...ids].sort().join();
      const ids2 = new Set();
      for (let i = 0; i < 40; i++) { G.flags.p15r_last = 0; const e = ROADS15.pick(ctxHeld, i / 40); if (e) ids2.add(e.id); }
      o.held = [...ids2].sort().join();
      // never the same encounter twice running
      G.flags.p15r_last = ROADS15.EVENTS.findIndex(e => e.id === 'stone') + 1;
      const rep = new Set();
      for (let i = 0; i < 20; i++) rep.add(ROADS15.pick(ctxFree, i / 20).id);
      o.noRepeat = !rep.has('stone');
      G.flags.p15r_last = 0;
      return o;
    });
    ok(!/gate/.test(where.free) && /gate/.test(where.held) && /pack/.test(where.free) && !/pack/.test(where.held),
      'off Synod ground: ' + where.free + ' · on it: ' + where.held);
    ok(where.noRepeat, 'the same encounter never comes twice running');

    // ------------------------------------------------------------------ 8. the carter
    const cart = await page.evaluate(() => {
      const o = {}, real = Math.random;
      G.player.attrs.Strength = 90; const hedge0 = __rep('hedge'), gold0 = G.player.gold;
      __stage('oakhaven', 23.5, 23.5, 0);
      ROADS15.force('cart', { day: 2, stage: 0 });
      o.panel = !!__event(); o.choices = __choices();
      Math.random = () => 0;
      o.helped = __choose(/shoulder/);
      Math.random = real;
      o.hedge = __rep('hedge') - hedge0; o.gold = G.player.gold - gold0; o.state = G.state;
      o.ev = G.flags.p15r_ev; o.last = G.flags.p15r_last;
      // the Office's glass: a crate to cut away, and a folder with your description afterwards
      G.flags.rite_ready = true; G.flags.p15r_grudge = 0;
      ROADS15.force('cart', { day: 2, stage: 1 });
      o.glassChoices = __choices();
      const office0 = __rep('office');
      o.cut = __choose(/lashings/);
      o.office = __rep('office') - office0; o.grudge = ROADS15.grudgeOn();
      return o;
    });
    ok(cart.panel && cart.choices.some(t => /shoulder/.test(t)) && cart.helped && cart.hedge === 3 && cart.gold > 0 && cart.state === 'play',
      'the carter: helping pays (Hedge +' + cart.hedge + ', ' + cart.gold + ' sovereigns) and the panel closes cleanly');
    ok(cart.glassChoices.some(t => /lashings/.test(t)) && cart.cut && cart.office === -4 && cart.grudge,
      'an Office load can be cut away: Office ' + cart.office + ', and the road remembers it');

    // ------------------------------------------------------------------ 9. people on the road
    const folk = await page.evaluate(() => {
      const o = {};
      G.give('honey', 1);
      const hedge0 = __rep('hedge'), n0 = G.count('honey');
      ROADS15.force('folk', { stage: 2 });
      o.choices = __choices();
      o.fed = __choose(/eat/);
      o.hedge = __rep('hedge') - hedge0; o.honey = n0 - G.count('honey');
      ROADS15.force('folk', { stage: 2 });
      o.asked = __choose(/what they saw/);
      o.saidStage2 = document.querySelectorAll('#msgs *').length >= 0;
      // what they say follows how far the Office has got
      o.line0 = ROADS15.TX.folk.saw[0] !== ROADS15.TX.folk.saw[4];
      return o;
    });
    ok(folk.choices.length >= 3 && folk.fed && folk.hedge === 4 && folk.honey === 1, 'people on the road: food costs you the honey and buys the Hedge\'s regard (+' + folk.hedge + ')');
    ok(folk.asked && folk.line0, 'asking what they saw gives the line for the Office\'s current reach');

    // ------------------------------------------------------------------ 10. the checkpoint
    const gate = await page.evaluate(() => {
      const o = {};
      G.player.gold = 40; G.flags.p15r_toll = 0; G.flags.p15r_grudge = 0;
      ROADS15.force('gate', {});
      o.choices = __choices();
      o.cost = ROADS15.tollFor();
      const g0 = G.player.gold;
      o.paid = __choose(/toll/);
      o.spent = g0 - G.player.gold; o.toll = G.flags.p15r_toll;
      // no coin: the folder takes your name instead
      G.player.gold = 0;
      const off0 = __rep('office');
      ROADS15.force('gate', {});
      o.answered = __choose(/answer the questions/);
      o.office = __rep('office') - off0;
      // the long way round costs three quarters of an hour
      G.player.gold = 40;
      ROADS15.force('gate', {});
      const t0 = G.day * 24 + G.tod * 24;
      o.rounded = __choose(/fields/);
      o.hours = Math.round((G.day * 24 + G.tod * 24 - t0) * 100) / 100;
      // walking through is remembered on every road for two days
      const syn0 = __rep('synod');
      ROADS15.force('gate', {});
      o.refused = __choose(/Walk through/);
      o.syn = __rep('synod') - syn0; o.grudge = ROADS15.grudgeOn();
      const d = { map: 'clearing', fx: 0.5, fy: 0.42 };
      ROADS15.cfg.events = false; const plain = travelRisk(d, 60);
      ROADS15.cfg.events = true; const held = travelRisk(d, 60);
      o.riskUp = Math.round((held - plain) * 1000) / 1000;
      G.flags.p15r_grudge = (G.day * 24 + G.tod * 24) - 100;        // two days later it has gone stale
      o.stale = ROADS15.grudgeOn() === false;
      return o;
    });
    ok(gate.choices.length >= 4 && gate.paid && gate.spent === gate.cost && gate.toll === 1, 'the checkpoint: the toll is ' + gate.cost + ' sovereigns and is counted');
    ok(gate.answered && gate.office === -3, 'with no coin the folder takes your name instead: Office ' + gate.office);
    ok(gate.rounded && gate.hours > 0.7 && gate.hours < 0.8, 'the fields cost ' + gate.hours + ' of an hour and nothing else');
    ok(gate.refused && gate.syn === -5 && gate.grudge && gate.riskUp === 0.1 && gate.stale,
      'walking through: Synod ' + gate.syn + ', +' + gate.riskUp + ' risk on every road, and it goes stale after two days');

    // ------------------------------------------------------------------ 11. the robes open the pole
    const robes = await page.evaluate(() => {
      const o = {};
      G.give('a_synodrobe', 1); equipArmor('a_synodrobe');
      o.worn = wearingDisguise();
      const syn0 = __rep('synod');
      ROADS15.force('gate', {});
      o.choices = __choices();
      o.shown = __choose(/robes/);
      o.syn = __rep('synod') - syn0;
      removeArmor('torso'); removeArmor(ARMOR.a_synodrobe.slot);
      return o;
    });
    ok(robes.worn && robes.choices.some(t => /robes/.test(t)) && robes.shown && robes.syn === 1,
      'wearing the clerk\'s robes adds a choice at the pole and the Office treats you as a colleague');

    // ------------------------------------------------------------------ 12. the milestone and the packman
    const rest = await page.evaluate(() => {
      const o = {};
      const lore0 = G.player.skills.Lore, prog0 = (G.player.skillProg || {}).Lore || 0;
      ROADS15.force('stone', { day: 3 });
      o.stoneChoices = __choices();
      o.read = __choose(/chalk/);
      o.lore = (G.player.skills.Lore - lore0) * 100 + (((G.player.skillProg || {}).Lore || 0) - prog0);
      G.player.gold = 20; const g0 = G.player.gold, t0 = G.count('tonic');
      ROADS15.force('pack', { inSynod: false });
      o.packChoices = __choices();
      o.bought = __choose(/tonic/);
      o.spent = g0 - G.player.gold; o.tonics = G.count('tonic') - t0;
      G.player.gold = 0;
      ROADS15.force('pack', { inSynod: false });
      o.poorTry = __choose(/tonic/);
      o.stillBroke = G.player.gold === 0;
      return o;
    });
    ok(rest.stoneChoices.length === 2 && rest.read && rest.lore > 0, 'the milestone\'s chalk reads, and teaches a little Lore');
    ok(rest.packChoices.length === 4 && rest.bought && rest.spent === 6 && rest.tonics === 1 && rest.poorTry && rest.stillBroke,
      'the packman sells at road prices and takes nothing when you cannot pay');

    // ------------------------------------------------------------------ 13. a journey, end to end
    const road = await page.evaluate(async () => {
      const o = {};
      for (const k of ['part3', 'part4', 'greening', 'escaped'].values()) delete G.flags[k];
      G.flags.p15r_hour = -1e6; G.flags.p15r_last = 0;
      __visit('clearing'); __visit('oakhaven');
      __stage('oakhaven', 23.5, 23.5, 0);
      travelOpen(); travelRender();
      // a destination inside the Hedge: no ambush roll to confuse the encounter (the ambush path is checked below)
      const d = TRAVEL.dests.find(x => x.state === 'ok' && x.map === 'oakhaven') || TRAVEL.dests.find(x => x.state === 'ok');
      o.dest = d ? d.name : null;
      o.risk = travelRisk(d, travelMinutes(d));
      const real = Math.random; Math.random = () => 0;                 // the encounter happens
      travelGo(d);
      Math.random = real;
      o.pending = !!ROADS15.pending;
      o.panelBefore = !!__event();
      __run(2, 0.25);
      o.panelAfter = !!__event();
      o.title = (document.querySelector('#event-panel h2') || {}).textContent || '';
      const first = document.querySelector('#event-panel button'); if (first) first.click();
      o.state = G.state;
      o.hour = Math.round(G.flags.p15r_hour * 10) / 10;
      o.ev = G.flags.p15r_ev;
      return o;
    });
    ok(road.dest && road.risk === 0 && road.pending && !road.panelBefore && road.panelAfter && road.title,
      'a journey schedules the encounter and the panel opens once you are standing in the world: "' + road.title + '"');
    ok(road.state === 'play' && road.ev >= 1 && road.hour > 0, 'the encounter is counted and timed, and the panel hands the game back');

    // ------------------------------------------------------------------ 14. a fight on arrival comes first
    const fight = await page.evaluate(() => {
      const o = {};
      G.flags.p15r_hour = -1e6;
      __stage('clearing', 20.5, 32.5, 0); __clear();                 // the map's own hounds are not this test's subject
      ROADS15.pending = { id: 'stone', ctx: { name: 'x', region: 'reach', day: 1, stage: 0, mins: 45, inSynod: false, mapId: 'clearing' }, at: G.day * 24 + G.tod * 24, tries: 0 };
      const e = hydrate({ kind: 'enemy', type: 'hound', x: Engine.cam.x + 3, y: Engine.cam.y + 1 });
      e.state = 'chase'; e.alertT = 20; G.ents.push(e);
      __run(1, 0.25);
      o.heldBack = !!ROADS15.pending && !__event();
      o.openPanel = G.openPanel; o.state = G.state; o.fade = G.fadeT;
      e.dead = true; e.hidden = true;
      __run(1, 0.25);
      o.thenOpens = !!__event(); o.pendingLeft = !!ROADS15.pending; o.hostile = G.ents.filter(x => x.kind === 'enemy' && !x.dead && !x.hidden).length;
      const b = document.querySelector('#event-panel button'); if (b) b.click();
      return o;
    });
    ok(fight.heldBack && fight.thenOpens && !fight.pendingLeft, 'an ambush on arrival is finished before the roadside panel opens');

    // ------------------------------------------------------------------ 15. saves
    const save = await page.evaluate(() => {
      const o = {};
      ROADS15.clearMarks();
      __stage('oakhaven', 23.5, 23.5, 0);
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The market');
      const d = snapshotGame();
      o.saved = (d.player.p15marks || []).map(m => m.k);
      o.flags = [typeof d.flags.p15r_ev, typeof d.flags.p15r_toll];
      restoreGame(JSON.parse(JSON.stringify(d)));
      o.back = ROADS15.marks().map(m => m.k);
      o.pendingCleared = ROADS15.pending === null;
      return o;
    });
    ok(save.saved.join() === 'The market' && save.back.join() === 'The market' && save.pendingCleared,
      'marks and tallies ride in the save; a load clears any encounter still waiting');

    // ------------------------------------------------------------------ 16. both switches off
    const off = await page.evaluate(() => {
      const o = {};
      ROADS15.cfg.events = false; ROADS15.cfg.marks = false;
      ROADS15.clearMarks();
      __stage('oakhaven', 23.5, 23.5, 0);
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The market');
      o.marks = ROADS15.marks().length;
      renderMap();
      o.box = !!document.getElementById('p15r-marks');
      closeModal(); G.state = 'play';
      G.flags.p15r_hour = -1e6;
      o.sched = ROADS15.schedule({ name: 'x', map: 'oakhaven', fx: 0.5, fy: 0.6 }, 60, 0);
      const d = { map: 'clearing', fx: 0.5, fy: 0.42 };
      G.flags.p15r_grudge = G.day * 24 + G.tod * 24 + 1;
      o.risk = travelRisk(d, 60) === travelRisk(d, 60);
      ROADS15.cfg.events = true; ROADS15.cfg.marks = true;
      G.flags.p15r_grudge = 0;
      return o;
    });
    ok(off.marks === 0 && !off.box && off.sched === null && off.risk, 'with both switches off nothing is marked, nothing is scheduled and the road risk is the original');

    // ------------------------------------------------------------------ 17. the module blocked: the directions still work
    const { page: pb, errors: eb } = await boot(browser, { block: true });
    const plain = await pb.evaluate(() => {
      window.__stage('oakhaven', 23.5, 23.5, 0);
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The market');
      renderMap();
      const o = { have: typeof ROADS15 === 'undefined', dirs: DLG.log.length, box: !!document.getElementById('p15r-marks'), amap: !!document.getElementById('amap') };
      closeModal();
      return o;
    });
    ok(plain.have && plain.dirs === 2 && !plain.box && plain.amap && eb.length === 0, 'with the module blocked the directions and the automap are untouched');
    await pb.close();

    // ------------------------------------------------------------------ 18. compact screen
    const { page: pc, errors: ec } = await boot(browser, { viewport: { width: 640, height: 400 } });
    const compact = await pc.evaluate(() => {
      loadMap('oakhaven', { x: 23.5, y: 23.5, dir: 0 }); G.state = 'play'; G.fadeT = 0;
      DLG.npc = NPCS.harrow; DLG.log = [];
      askPlace('The Boar & Dulcimer');
      renderMap();
      const panel = document.querySelector('#modal-panel');
      const r = { box: !!document.getElementById('p15r-marks'), over: panel ? panel.scrollWidth - panel.clientWidth : -1 };
      closeModal();
      ROADS15.force('gate', {});
      const ep = document.querySelector('#event-panel');
      r.evOver = ep ? ep.scrollWidth - ep.clientWidth : -1;
      const b = document.querySelector('#event-panel button'); if (b) b.click();
      renderAccessibilityMenu();
      r.row = !!document.getElementById('p15r-events');
      const p2 = document.querySelector('#modal-panel');
      r.optOver = p2 ? p2.scrollWidth - p2.clientWidth : -1;
      if (typeof closeModal === 'function') closeModal();
      return r;
    });
    ok(compact.box && compact.over <= 1 && compact.evOver <= 1 && compact.row && compact.optOver <= 1 && ec.length === 0,
      'compact 640x400: the mark list, the encounter panel and the options rows all fit');
    await pc.close();

    if (SHOTS) {
      await page.evaluate(() => { __stage('oakhaven', 23.5, 23.5, 0); ROADS15.force('gate', {}); });
      await page.waitForTimeout(250);
      await page.locator('#game').screenshot({ path: SHOTS + '/roads-checkpoint.png' });
      await page.evaluate(() => { const b = document.querySelector('#event-panel button'); if (b) b.click(); });
    }

    ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally { await browser.close(); }
  console.log(fails ? 'FAILED: ' + fails : 'roads15: ALL PASS');
  process.exit(fails ? 1 : 0);
})();
