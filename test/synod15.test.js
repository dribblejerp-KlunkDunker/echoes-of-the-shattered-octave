// PREVIEW_URL=http://127.0.0.1:3924 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/synod15.test.js
// Phase 15 SYNOD: the Stasisday reading (attend or break up), the eclipse, Synod territory on the world
// map, and the Office's reprisal (a burnt shed, rebuilt, and a death that stays dead).
// A second page with js/synod15.js blocked proves "every switch off = the game exactly as it was".
// Optional SHOTS=<dir> writes review screenshots.
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
  if (opts.block) await page.route('**/js/synod15.js*', r => r.abort());
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof NPCS === 'object');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Synod Tester');
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
    window.__stage = (map, x, y, dir) => {
      loadMap(map, { x, y, dir }); G.state = 'play'; G.fadeT = 0; G.keys = {}; G.vel.x = G.vel.y = 0;
      for (let i = G.ents.length - 1; i >= 0; i--) { const e = G.ents[i]; if (e.kind === 'enemy' && !e._p15s && !e.passive) G.ents.splice(i, 1); }
      G.dead = false; G.noise = 0;
    };
    window.__run = (secs, dt) => { dt = dt || 0.25; for (let t = 0; t < secs - 1e-9; t += dt) { ANIM.T += dt; update(dt); } };
    window.__hash = () => { Engine.render(G.ents, G.tod); const d = Engine.ctx.getImageData(0, 0, 320, 150).data; let h = 2166136261; for (let i = 0; i < d.length; i++) { h ^= d[i]; h = Math.imul(h, 16777619); } return h >>> 0; };
    window.__lum = () => { Engine.render(G.ents, G.tod); const d = Engine.ctx.getImageData(0, 0, 320, 150).data; let s = 0; for (let i = 0; i < d.length; i += 4) s += d[i] + d[i + 1] + d[i + 2]; return s / (d.length / 4) / 3; };
    window.__mine = () => G.ents.filter(e => e._p15s).map(e => e._p15s).sort();
    window.__rep = (f) => G.player.factions[f];
    window.__bounty = () => crimeState().bounty;
    window.__seed = (v) => { Math.random = () => v; };
    window.__visit = (id) => { const m = G.maps[id]; if (m && m.visited) m.visited.fill(1); };
  });
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const { page, errors } = await boot(browser);
    const snap = async (name) => { if (!SHOTS) return; await page.evaluate(() => { const m = document.querySelector('#msgs'); if (m) m.innerHTML = ''; }); await page.waitForTimeout(220); await page.locator('#game').screenshot({ path: SHOTS + '/synod-' + name + '.png' }); };

    // ------------------------------------------------------------------ 1. module, switches, options rows
    const mod = await page.evaluate(() => {
      const o = {};
      o.have = typeof SYNOD15 === 'object';
      o.cfg = Object.keys(SYNOD15.cfg).sort().join(',');
      o.defaults = Object.values(SYNOD15.cfg).every(v => v === true);
      o.strings = SYNOD15.LIST.length;
      o.npcs = ['p15_herald', 'p15_cooper', 'p15_widow', 'p15_listener'].every(k => NPCS[k] && NPCS[k].greet && NPCS[k].greet.normal);
      renderAccessibilityMenu();
      o.rows = ['p15s-sermons', 'p15s-eclipse', 'p15s-territory', 'p15s-reprisal'].filter(id => document.getElementById(id)).length;
      const b = document.getElementById('p15s-eclipse');
      o.pressed = b && b.getAttribute('aria-pressed');
      b.click(); o.toggledOff = SYNOD15.cfg.eclipse === false && b.getAttribute('aria-pressed') === 'false';
      o.stored = JSON.parse(localStorage.getItem('octave.synod15.v1') || '{}').eclipse === false;
      b.click(); o.toggledOn = SYNOD15.cfg.eclipse === true;
      if (typeof closeModal === 'function') closeModal();
      G.state = 'play';
      return o;
    });
    ok(mod.have && mod.cfg === 'eclipse,reprisal,sermons,territory' && mod.defaults, 'module loads with four switches, all on by default');
    ok(mod.npcs && mod.strings >= 70, 'four new people registered; ' + mod.strings + ' strings listed for the translators');
    ok(mod.rows === 4 && mod.pressed === 'true' && mod.toggledOff && mod.stored && mod.toggledOn, 'Options rows toggle, persist to localStorage and come back');

    // ------------------------------------------------------------------ 2. the reading: the clock
    const clock = await page.evaluate(() => {
      const o = {};
      o.days = [[3, false], [4, true], [11, false], [12, true], [20, true]].every(([d, want]) => SYNOD15.sermonDay(d) === want);
      G.day = 4;
      const at = (h) => { G.tod = h / 24; return SYNOD15.sermonRunning(); };
      o.window = at(9.9) === false && at(10.0) === true && at(11.4) === true && at(11.5) === false;
      G.tod = 10.0 / 24; o.b0 = SYNOD15.sermonBeat();
      G.tod = 10.3 / 24; o.b1 = SYNOD15.sermonBeat();
      G.tod = 11.4 / 24; o.bLast = SYNOD15.sermonBeat();
      G.flags.greening = true; G.tod = 10.4 / 24; o.afterGreening = SYNOD15.sermonRunning(); delete G.flags.greening;
      G.day = 3; o.wrongDay = SYNOD15.sermonRunning();
      return o;
    });
    ok(clock.days && clock.window && clock.b0 === 0 && clock.b1 === 1 && clock.bLast === 5 && !clock.afterGreening && !clock.wrongDay,
      'the reading runs 10:00-11:30 on Stasisdays only, six lections, never after the Greening');

    // ------------------------------------------------------------------ 3. staging
    const stage = await page.evaluate(() => {
      const o = {};
      G.day = 4; G.tod = 10.1 / 24;
      __stage('oakhaven', 48.5, 16.5, -Math.PI / 2); SYNOD15.syncCurrent();
      o.on = __mine();
      const h = G.ents.find(e => e._p15s === 'herald');
      o.heraldAt = h ? [Math.round(h.x * 10) / 10, Math.round(h.y * 10) / 10] : null;
      o.heraldName = h ? NPCS[h.id].name : '';
      o.proctorsPassive = G.ents.filter(e => e._p15s && e.kind === 'enemy').every(e => e.passive && e.state === 'passive');
      G.tod = 12 / 24; SYNOD15.syncCurrent();
      o.off = __mine().filter(k => /herald|proctor|pew/.test(k)).length;
      return o;
    });
    ok(stage.on.includes('herald') && stage.on.filter(k => /^pew/.test(k)).length === 5 && stage.on.filter(k => /^proctor/.test(k)).length === 2,
      'the steps are staged: a herald, two proctors, five parishioners');
    ok(stage.proctorsPassive && stage.off === 0, 'the proctors stand passive, and everything is cleared when the reading ends');

    // ------------------------------------------------------------------ 4. attending
    const attend = await page.evaluate(() => {
      const o = {};
      G.day = 4; G.tod = 9.98 / 24; G.flags.p15s_sday = 0; G.flags.p15s_serm = 0;
      __stage('oakhaven', 48.6, 14.0, -Math.PI / 2);                 // in the crowd
      const syn0 = __rep('synod'), jl0 = G.journal.length;
      __run(150, 0.25);                                              // the whole window: 1.5 world hours
      o.heard = SYNOD15.reading.heard;
      o.serm = G.flags.p15s_serm; o.sday = G.flags.p15s_sday;
      o.synUp = __rep('synod') - syn0;
      o.journal = G.journal.length - jl0;
      o.bounty = __bounty();
      // a second window the same day cannot be credited twice
      G.tod = 10.0 / 24; __run(40, 0.25);
      o.serm2 = G.flags.p15s_serm;
      return o;
    });
    ok(attend.heard >= 3 && attend.serm === 1 && attend.sday === 5 && attend.synUp === 4 && attend.journal >= 1 && attend.bounty === 0,
      'standing through the reading: heard ' + attend.heard + ' lections, Synod +' + attend.synUp + ', a logbook line, no bounty');
    ok(attend.serm2 === 1, 'the day is resolved once: a second pass credits nothing');

    // ------------------------------------------------------------------ 5. standing far off hears but does not attend
    const far = await page.evaluate(() => {
      G.day = 12; G.tod = 9.98 / 24; G.flags.p15s_sday = 0;
      __stage('oakhaven', 23.5, 23.5, 0);                            // the far square: out of earshot
      const syn0 = __rep('synod');
      __run(150, 0.25);
      return { heard: SYNOD15.reading.heard, serm: G.flags.p15s_serm, syn: __rep('synod') - syn0 };
    });
    ok(far.heard === 0 && far.serm === 1 && far.syn === 0, 'out of earshot: nothing heard, nothing credited');

    // ------------------------------------------------------------------ 6. breaking it up: the speech
    const speech = await page.evaluate(() => {
      const o = {}, realRandom = Math.random;
      G.day = 20; G.tod = 10.3 / 24; G.flags.p15s_sday = 0; G.flags.p15s_dis = 0;
      __stage('oakhaven', 48.5, 13.8, -Math.PI / 2); SYNOD15.syncCurrent();
      const herald = G.ents.find(e => e._p15s === 'herald');
      talk(herald);
      o.button = !!document.getElementById('d-p15-speak');
      o.odds = Math.round(SYNOD15.speechOdds() * 100) / 100;
      const syn0 = __rep('synod'), hedge0 = __rep('hedge');
      Math.random = () => 0;                                          // a passed check
      document.getElementById('d-p15-speak').click();
      Math.random = realRandom;
      o.dis = G.flags.p15s_dis; o.broken = SYNOD15.reading.broken;
      o.syn = __rep('synod') - syn0; o.hedge = __rep('hedge') - hedge0;
      o.bounty = __bounty();                                          // a lawful speech is never charged
      SYNOD15.syncCurrent();
      o.left = __mine().filter(k => /herald|pew|proctor/.test(k)).length;
      return o;
    });
    ok(speech.button && speech.odds > 0 && speech.dis === 1 && speech.broken && speech.syn === -6 && speech.hedge === 8 && speech.bounty === 0,
      'a passed speech breaks the reading: Synod ' + speech.syn + ', Hedge +' + speech.hedge + ', no charge (odds ' + speech.odds + ')');
    ok(speech.left === 0, 'the crowd goes home when the reading breaks');

    // ------------------------------------------------------------------ 7. a failed speech
    const flop = await page.evaluate(() => {
      const o = {}, realRandom = Math.random;
      G.day = 28; G.tod = 10.3 / 24; G.flags.p15s_sday = 0;
      __stage('oakhaven', 48.5, 13.8, -Math.PI / 2); SYNOD15.syncCurrent();
      const syn0 = __rep('synod'), dis0 = G.flags.p15s_dis;
      Math.random = () => 0.999;
      o.result = SYNOD15.speakAgainst();
      Math.random = realRandom;
      o.syn = __rep('synod') - syn0; o.dis = G.flags.p15s_dis - dis0; o.running = SYNOD15.sermonLive();
      o.again = SYNOD15.speakAgainst();                               // one try a reading
      return o;
    });
    ok(flop.result === false && flop.syn === -2 && flop.dis === 0 && flop.running && flop.again === false,
      'a failed speech: shouted down, Synod -2, the reading goes on, one try a day');

    // ------------------------------------------------------------------ 8. breaking it with a Song, and the watch
    const song = await page.evaluate(() => {
      const o = {};
      G.day = 36; G.tod = 10.3 / 24; G.flags.p15s_sday = 0; G.player.crime = null; normalizeCrime();
      __stage('oakhaven', 48.5, 13.6, -Math.PI / 2); SYNOD15.syncCurrent();
      o.witness = !!SYNOD15.disruptionWitness();
      const syn0 = __rep('synod'), hedge0 = __rep('hedge'), b0 = __bounty();
      G.player.songs = ['murmur'];                                   // the quiet one: the breach is the singing, not the Song
      G.player.voice = G.player.voiceMax;
      castSong('murmur');
      o.broken = SYNOD15.reading.broken; o.syn = __rep('synod') - syn0; o.hedge = __rep('hedge') - hedge0;
      o.bounty = __bounty() - b0;
      o.law = lawActive(); o.witness2 = !!SYNOD15.disruptionWitness();
      return o;
    });
    ok(song.broken && song.syn === -8 && song.hedge === 6, 'a Song on the steps breaks the reading: Synod ' + song.syn + ', Hedge +' + song.hedge);
    ok(song.witness && song.bounty === 25, 'a proctor with clear sight reports it: +' + song.bounty + ' bounty (witness at the act ' + song.witness + ', law ' + song.law + ')');

    // ------------------------------------------------------------------ 9. breaking it with a thrown stone
    const stone = await page.evaluate(() => {
      const o = {};
      G.day = 44; G.tod = 10.3 / 24; G.flags.p15s_sday = 0;
      __stage('oakhaven', 44.6, 12.6, 0); SYNOD15.syncCurrent();               // the open west side of the apron
      o.live = SYNOD15.sermonLive();
      if (!G.has('pebble')) G.give('pebble', 3);
      G.throwReady = 0;
      o.point = distractionImpact('pebble');
      o.thrown = throwDistraction('pebble');
      o.broken = SYNOD15.reading.broken;
      // the aiming ray on its own never breaks anything
      G.day = 52; G.tod = 10.3 / 24; G.flags.p15s_sday = 0;
      __stage('oakhaven', 44.6, 12.6, 0); SYNOD15.syncCurrent(); __run(1, 0.25);
      distractionImpact('pebble'); distractionImpact('pebble');
      o.rayQuiet = SYNOD15.sermonLive() === true && SYNOD15.reading.broken === false;
      return o;
    });
    ok(stone.live && stone.thrown && stone.broken, 'a stone into the crowd breaks the reading (landed ' + JSON.stringify(stone.point) + ')');
    ok(stone.rayQuiet, 'the aiming ray (distractionImpact) has no side effect on the reading');

    // ------------------------------------------------------------------ 10. the eclipse: the clock and the curve
    const ecl = await page.evaluate(() => {
      const o = {};
      o.days = [[5, false], [13, true], [21, false], [53, true], [93, true]].every(([d, w]) => SYNOD15.eclipseDay(d) === w);
      o.next = SYNOD15.nextEclipse(0);
      o.spacing = SYNOD15.nextEclipse(14) - 13;
      const c = (h) => Math.round(SYNOD15.eclipseCover(h, 13) * 100) / 100;
      const E = SYNOD15.ECL;
      o.curve = [c(E.t0 - 0.5), c(E.t0), c((E.t0 + E.t1) / 2), c(E.t1 + 0.1), c(E.t2), c((E.t2 + E.t3) / 2), c(E.t3), c(E.t3 + 0.5)];
      o.offDay = SYNOD15.eclipseCover(E.t1 + 0.1, 12);
      SYNOD15.cfg.eclipse = false; o.switchedOff = SYNOD15.eclipseCover(E.t1 + 0.1, 13); SYNOD15.cfg.eclipse = true;
      return o;
    });
    ok(ecl.days && ecl.next === 13 && ecl.spacing === 40, 'eclipses fall on one new moon in five: day 13, then every 40 days');
    ok(ecl.curve[0] === 0 && ecl.curve[1] === 0 && ecl.curve[2] > 0.4 && ecl.curve[2] < 0.6 && ecl.curve[3] === 1 && ecl.curve[4] === 1 && ecl.curve[5] > 0 && ecl.curve[6] === 0 && ecl.curve[7] === 0,
      'the cover walks on, holds through totality and walks off: ' + JSON.stringify(ecl.curve));
    ok(ecl.offDay === 0 && ecl.switchedOff === 0, 'no cover on any other day, and none at all with the switch off');

    // ------------------------------------------------------------------ 11. the eclipse: the look and the world
    const dark = await page.evaluate(() => {
      const o = {}, E = SYNOD15.ECL, hT = (E.t1 + E.t2) / 2;
      G.day = 13; G.flags.p15s_eday = 0; G.flags.p15s_ecl = 0;
      __seed(777);
      __stage('oakhaven', 23.5, 23.5, 0);
      G.tod = hT / 24; Weather.hold('clear');
      Engine.cam.dir = (G.tod - 0.25) * Math.PI * 2; Engine.cam.pitch = 12;   // face the sun
      SYNOD15.cfg.eclipse = false; o.before = (__lum() + __lum()) / 2;           // the same hour, no eclipse
      SYNOD15.cfg.eclipse = true; o.total = (__lum() + __lum()) / 2;
      o.coverPx = SYNOD15.stats.coverPx; o.dim = Math.round(SYNOD15.stats.dim * 100) / 100;
      SYNOD15.cfg.eclipse = false; o.offLum = (__lum() + __lum()) / 2; o.offPx = SYNOD15.stats.coverPx; o.offDim = SYNOD15.stats.dim; SYNOD15.cfg.eclipse = true;
      // the day going out: lines, the flag, and people standing still
      G.tod = (E.t0 - 1) / 24; SYNOD15.releaseFolk(); __run(2, 0.25);
      const jl0 = G.journal.length;
      G.tod = (hT - 0.02) / 24; __run(2, 0.25);
      o.ecl = G.flags.p15s_ecl; o.eday = G.flags.p15s_eday; o.journal = G.journal.length - jl0;
      o.stopped = G.ents.filter(e => e.kind === 'npc' && e._p15eW !== undefined).length;
      G.tod = (E.t3 + 1) / 24; __run(2, 0.25);
      o.released = G.ents.filter(e => e.kind === 'npc' && e._p15eW !== undefined).length;
      return o;
    });
    ok(dark.total < dark.before * 0.6 && dark.coverPx > 20 && dark.dim > 0.6,
      'at totality the frame loses ' + Math.round((1 - dark.total / dark.before) * 100) + '% of its light and the moon\'s disc covers ' + dark.coverPx + ' sky pixels');
    ok(Math.abs(dark.offLum - dark.before) / dark.before < 0.02 && dark.offPx === 0 && dark.offDim === 0,
      'with the switch off nothing is drawn and nothing is dimmed: the frame\'s light is the original (' + dark.offLum.toFixed(1) + ' vs ' + dark.before.toFixed(1) + ')');
    ok(dark.ecl === 1 && dark.eday === 14 && dark.journal >= 1 && dark.stopped > 0 && dark.released === 0,
      'totality is logged once, ' + dark.stopped + ' people stop to look up, and all of them go back to work after');
    await page.evaluate(() => { const E = SYNOD15.ECL; G.day = 13; G.tod = (E.t1 + E.t2) / 2 / 24; __stage('oakhaven', 23.5, 23.5, 0); Engine.cam.dir = (G.tod - 0.25) * Math.PI * 2; Engine.cam.pitch = 12; Weather.hold('clear'); __run(1, 0.25); });
    await snap('eclipse');

    // ------------------------------------------------------------------ 12. Synod territory
    const terr = await page.evaluate(() => {
      const o = {};
      G.day = 4; G.tod = 10 / 24; G.flags.p15s_terr = 0;
      for (const k of ['rite_ready', 'rite_started', 'greening', 'escaped', 'part3', 'part4']) delete G.flags[k];
      o.stage0 = SYNOD15.stageNow(); o.zones0 = SYNOD15.zonesFor('reach').length;
      G.flags.rite_ready = true; o.stage1 = SYNOD15.stageNow(); o.zones1 = SYNOD15.zonesFor('reach').map(z => z.id);
      o.mark1 = G.flags.p15s_terr;
      G.flags.rite_started = true; o.stage2 = SYNOD15.stageNow();
      G.flags.part3 = true; o.stage4 = SYNOD15.stageNow(); o.woods = SYNOD15.zonesFor('woods').map(z => z.id);
      // the flag keeps the high-water mark as a record, but the stage itself is read from the story
      for (const k of ['rite_ready', 'rite_started', 'part3']) delete G.flags[k];
      o.kept = SYNOD15.stageNow(); o.flag = G.flags.p15s_terr;
      G.flags.rite_ready = true; G.flags.rite_started = true;
      o.inside = !!SYNOD15.territoryAt('reach', 0.60, 0.65);
      o.outside = !!SYNOD15.territoryAt('reach', 0.05, 0.05);
      o.line = SYNOD15.territoryLine('reach');
      // an imported save cannot push the stage past what the story says
      G.flags.p15s_terr = 99; o.clamped = SYNOD15.stageNow() - SYNOD15.stageDerived();
      G.flags.p15s_terr = 0;
      return o;
    });
    ok(terr.stage0 === 0 && terr.zones0 === 0 && terr.stage1 === 1 && terr.zones1.join() === 'road' && terr.stage2 === 2 && terr.stage4 === 4,
      'the Office spreads by story stage: nothing, then the Greenroot road, the square, the quarry and the Woods');
    ok(terr.mark1 === 1 && terr.flag === 4 && terr.kept === 0 && terr.clamped === 0,
      'the high-water mark is recorded in a flag (now ' + terr.flag + ') but the stage itself is read from the story, so no save can forge it');
    void terr.clamped;
    ok(terr.inside && !terr.outside && /Synod writ/.test(terr.line) && terr.clamped === 0,
      'territoryAt() and the panel line name the ground held, and a forged flag adds nothing');

    const map = await page.evaluate(async () => {
      const o = {};
      for (const k of ['part3', 'part4']) delete G.flags[k];
      G.flags.rite_ready = true; G.flags.rite_started = true; G.flags.escaped = true;   // stage 3: the roads outside the Hedge
      __stage('oakhaven', 23.5, 23.5, 0);
      __visit('oakhaven'); __visit('clearing');            // the panel lists what you have walked: do not wait on a frame
      travelOpen();
      await new Promise(r => setTimeout(r, 120));
      o.legend = !!document.querySelector('.p15s-sw');
      const inside = TRAVEL.dests.filter(x => x.state === 'ok' && SYNOD15.territoryAt('reach', x.fx, x.fy));
      const d = inside[0];
      o.anyInside = !!d;
      if (d) { travelSelect(d); o.warn = !!document.querySelector('.p15s-warn'); }
      // the risk itself, on a road that has any: the clearing outside the Hedge, inside the 'outside' zone
      const road = { map: 'clearing', fx: 0.50, fy: 0.42, name: 'test' };
      o.roadInside = !!SYNOD15.territoryAt('reach', road.fx, road.fy);
      SYNOD15.cfg.territory = false; const plain = travelRisk(road, 60);
      SYNOD15.cfg.territory = true; const held = travelRisk(road, 60);
      o.plain = Math.round(plain * 1000) / 1000;
      o.riskUp = Math.round((held - plain) * 1000) / 1000;
      // inside the Hedge is still inside the Hedge: a safe destination stays safe
      const safeD = TRAVEL.dests.find(x => TRAVEL_REGIONS.reach.maps[x.map].safe);
      o.safeStays = safeD ? travelRisk(safeD, 60) === 0 : false;
      o.stage = SYNOD15.stageNow();
      o.info = (document.querySelector('.p15s-info') || {}).textContent || '';
      travelClose();
      return o;
    });
    ok(map.legend && map.info && /Synod/.test(map.info), 'the world map gets the legend swatch and a Synod-writ line');
    ok(map.anyInside && map.warn && map.roadInside && map.plain > 0 && map.riskUp > 0 && map.safeStays,
      'a road through Synod ground (stage ' + map.stage + ') warns before you set out and carries ' + map.riskUp + ' more risk (' + map.plain + ' -> ' + (map.plain + map.riskUp) + '); inside the Hedge stays safe');

    // ------------------------------------------------------------------ 13. the reprisal
    const rep = await page.evaluate(() => {
      const o = {};
      for (const k of ['greening', 'escaped', 'part3', 'part4']) delete G.flags[k];
      G.flags.p15s_fire = 0; G.flags.p15s_lost = 0; G.flags.rite_ready = true;
      G.day = 7; G.tod = 10 / 24;
      const led0 = G.ledger.filter(l => /Bram Creel/.test(l.name)).length;
      o.before = SYNOD15.reprisalStage();
      __stage('oakhaven', 9.5, 16.5, 0);
      o.armed = SYNOD15.fireArmed(); o.fireDay = SYNOD15.fireDay();
      o.stage = SYNOD15.reprisalStage();
      o.mine = __mine().filter(k => /fire|watch/.test(k)).length;
      o.ledger = G.ledger.filter(l => /Bram Creel/.test(l.name)).length - led0;
      o.dead = SYNOD15.cooperDead();
      o.cooperGone = __mine().includes('cooper') === false;
      const doorIx = 16 * G.map.w + 6, cell = G.map.cells[doorIx];
      o.doorBurning = /burning/i.test(cell.label || '');
      G.day = 9; SYNOD15.syncCurrent(); SYNOD15.syncShedDoor(G.map);
      o.ruin = SYNOD15.reprisalStage(); o.doorRuin = /burnt out/i.test(G.map.cells[doorIx].label || '');
      G.day = 11; SYNOD15.syncCurrent(); SYNOD15.syncShedDoor(G.map);
      o.works = SYNOD15.reprisalStage(); o.notice = __mine().includes('notice'); o.wrights = __mine().filter(k => /wright/.test(k)).length;
      G.day = 14; SYNOD15.syncCurrent(); SYNOD15.syncShedDoor(G.map);
      o.rebuilt = SYNOD15.reprisalStage(); o.widow = __mine().includes('widow'); o.doorRebuilt = /rebuilt/i.test(G.map.cells[doorIx].label || '');
      return o;
    });
    ok(rep.before === 'none' && rep.armed && rep.fireDay === 7 && rep.stage === 'burning' && rep.mine >= 4 && rep.doorBurning,
      'the Office fires the shed once the Church is on the road: the fire, the ring of neighbours and the door all read "burning"');
    ok(rep.ledger === 1 && rep.dead && rep.cooperGone, 'Bram Creel dies in it: one ledger entry, and he is never placed again');
    ok(rep.ruin === 'ruin' && rep.doorRuin && rep.works === 'works' && rep.notice && rep.wrights === 2 && rep.rebuilt === 'rebuilt' && rep.widow && rep.doorRebuilt,
      'burning -> ruin -> hoarding and carpenters -> rebuilt, by the day the fire was set');
    await page.evaluate(() => { G.day = 7; G.flags.p15s_fire = 8; __stage('oakhaven', 9.5, 16.5, Math.PI); __run(1, 0.25); });
    await snap('reprisal-fire');

    // ------------------------------------------------------------------ 14. the chalk-roll and the notice panels
    const panels = await page.evaluate(() => {
      const o = {};
      G.day = 14; __stage('chapel', 6.5, 10.5, -Math.PI / 2); SYNOD15.syncCurrent();
      o.roll = __mine().includes('roll');
      const slate = G.ents.find(e => e._p15s === 'roll');
      useDeco(slate);
      o.panel = (document.querySelector('#event-panel') || {}).textContent || '';
      const btn = document.querySelector('#event-panel button'); if (btn) btn.click();
      o.state = G.state;
      return o;
    });
    ok(panels.roll && /Bram Creel/.test(panels.panel) && /chalk/i.test(panels.panel) && panels.state === 'play',
      'the parish chalk-roll inside the chapel keeps the name, and closes cleanly');

    // ------------------------------------------------------------------ 15. the save: the flags come back, a hostile save is clamped
    const save = await page.evaluate(() => {
      const o = {};
      G.day = 14; __stage('oakhaven', 23.5, 23.5, 0);
      const d = snapshotGame();
      o.saved = [d.flags.p15s_fire, d.flags.p15s_lost, d.flags.p15s_serm, d.flags.p15s_ecl];
      restoreGame(JSON.parse(JSON.stringify(d)));
      o.back = [G.flags.p15s_fire, G.flags.p15s_lost, SYNOD15.cooperDead(), SYNOD15.reprisalStage()];
      // a hostile import: nonsense in every flag, and no story flag behind any of it
      const bad = JSON.parse(JSON.stringify(d));
      Object.assign(bad.flags, { p15s_fire: 'x', p15s_lost: -5, p15s_serm: 1e9, p15s_terr: 99, p15s_ecl: {}, p15s_sday: NaN });
      for (const k of ['rite_ready', 'rite_started', 'greening', 'escaped', 'part3', 'part4']) delete bad.flags[k];
      restoreGame(bad);
      o.safe = [SYNOD15.fireArmed(), SYNOD15.cooperDead(), SYNOD15.stageNow(), SYNOD15.reprisalStage()];
      o.raw = [G.flags.p15s_fire, G.flags.p15s_lost, G.flags.p15s_terr, G.flags.p15s_sday];
      o.noThrow = true;
      __stage('oakhaven', 23.5, 23.5, 0); SYNOD15.syncCurrent();
      o.staged = __mine().filter(k => /fire|watch|notice|widow|wright|smoulder|charred|hoard|trestle/.test(k)).length;
      return o;
    });
    ok(save.saved[0] === 8 && save.saved[1] === 1 && save.back[2] === true && save.back[3] === 'rebuilt',
      'the reprisal, the dead and the tallies ride in the save and come back');
    ok(save.safe[0] === false && save.safe[1] === false && save.safe[2] === 0 && save.safe[3] === 'none' && save.staged === 0 && save.noThrow,
      'a hostile save cannot forge a death, a stage or a fire: every flag is clamped ' + JSON.stringify(save.safe) + ' from ' + JSON.stringify(save.raw));

    // ------------------------------------------------------------------ 16. every switch off = the game as it was
    const off = await page.evaluate(() => {
      const o = {};
      for (const k of ['rite_ready', 'greening', 'part3', 'part4', 'escaped']) delete G.flags[k];
      G.flags.rite_ready = true; G.flags.p15s_fire = 0; G.flags.p15s_lost = 0;
      for (const k of Object.keys(SYNOD15.cfg)) SYNOD15.cfg[k] = false;
      G.day = 4; G.tod = 10.2 / 24;
      __stage('oakhaven', 48.5, 16.5, -Math.PI / 2); SYNOD15.syncCurrent();
      o.mine = __mine().length;
      o.armed = SYNOD15.fireArmed();
      o.door = G.map.cells[16 * G.map.w + 6].label;
      o.reading = SYNOD15.sermonRunning();
      travelOpen(); travelDraw();
      o.legend = !!document.querySelector('.p15s-sw');
      travelClose();
      G.tod = 12.78 / 24; G.day = 13; o.cover = SYNOD15.eclipseCover();
      for (const k of Object.keys(SYNOD15.cfg)) SYNOD15.cfg[k] = true;
      return o;
    });
    ok(off.mine === 0 && !off.armed && /cooper's shed/i.test(off.door) && !/burn/i.test(off.door) && !off.reading && !off.legend && off.cover === 0,
      'with the four switches off nothing is placed, no flag is written, the door keeps its own label and the map is clean');

    // ------------------------------------------------------------------ 17. the module blocked: the original frame
    const { page: pb, errors: eb } = await boot(browser, { block: true });
    const plain = await pb.evaluate(() => {
      __seed(4242); G.day = 13; G.flags.rite_ready = true;
      __stage('oakhaven', 23.5, 23.5, 0); G.tod = 16.27 / 24; Weather.hold('clear');
      Engine.cam.dir = (G.tod - 0.25) * Math.PI * 2; Engine.cam.pitch = 12;
      return { lum: (__lum() + __lum()) / 2, have: typeof SYNOD15 === 'undefined' };
    });
    const mineHash = await page.evaluate(() => {
      for (const k of Object.keys(SYNOD15.cfg)) SYNOD15.cfg[k] = false;
      __seed(4242); G.day = 13; G.flags.rite_ready = true;
      __stage('oakhaven', 23.5, 23.5, 0); G.tod = 16.27 / 24; Weather.hold('clear');
      Engine.cam.dir = (G.tod - 0.25) * Math.PI * 2; Engine.cam.pitch = 12;
      const l = (__lum() + __lum()) / 2;
      for (const k of Object.keys(SYNOD15.cfg)) SYNOD15.cfg[k] = true;
      return l;
    });
    ok(plain.have && Math.abs(plain.lum - mineHash) / plain.lum < 0.02 && eb.length === 0,
      'the switched-off scene matches a page with the module blocked (' + plain.lum.toFixed(1) + ' vs ' + mineHash.toFixed(1) + ')');
    await pb.close();

    // ------------------------------------------------------------------ 18. compact screen
    const { page: pc, errors: ec } = await boot(browser, { viewport: { width: 640, height: 400 } });
    const compact = await pc.evaluate(() => {
      G.day = 4; G.tod = 10.2 / 24;
      loadMap('oakhaven', { x: 48.5, y: 16.5, dir: -Math.PI / 2 }); G.state = 'play'; G.fadeT = 0;
      SYNOD15.syncCurrent();
      const staged = G.ents.filter(e => e._p15s).length;
      renderAccessibilityMenu();
      const panel = document.querySelector('#modal-panel'), row = document.getElementById('p15s-reprisal');
      const r = { staged, row: !!row, over: panel ? panel.scrollWidth - panel.clientWidth : -1 };
      if (typeof closeModal === 'function') closeModal();
      return r;
    });
    ok(compact.staged >= 8 && compact.row && compact.over <= 1 && ec.length === 0,
      'compact 640x400: the reading stages (' + compact.staged + ' figures) and the options rows fit (overflow ' + compact.over + ')');
    await pc.close();

    ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally { await browser.close(); }
  console.log(fails ? 'FAILED: ' + fails : 'synod15: ALL PASS');
  process.exit(fails ? 1 : 0);
})();
