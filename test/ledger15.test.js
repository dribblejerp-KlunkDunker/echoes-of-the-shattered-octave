// PREVIEW_URL=http://127.0.0.1:3924 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/ledger15.test.js
// Phase 15 LEDGER: paid training with per-level limits, the Greenhall counting-house and its letters
// of credit, and the testing codes (off by default, and they mark the run for good).
// A second page with js/ledger15.js blocked proves "every switch off = the game exactly as it was".
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
  if (opts.block) await page.route('**/js/ledger15.js*', r => r.abort());
  await page.goto(URL);
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof NPCS === 'object');
  await page.locator('#btn-new').click(); await page.locator('#cname').fill('Ledger Tester');
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
  });
  return { page, errors };
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const { page, errors } = await boot(browser);

    // ------------------------------------------------------------------ 1. module, switches, the item
    const mod = await page.evaluate(() => {
      const o = {};
      o.have = typeof LEDGER15 === 'object';
      o.cfg = Object.keys(LEDGER15.cfg).sort().join(',');
      o.defaults = [LEDGER15.cfg.training, LEDGER15.cfg.bank, LEDGER15.cfg.codes];
      o.strings = LEDGER15.LIST.length;
      o.item = !!(ITEMS.p15_letter && ITEMS.p15_letter.key === true && ITEMS.p15_letter.value === 25);
      o.trainers = Object.keys(LEDGER15.TRAINERS).length;
      o.skills = [].concat(...Object.values(LEDGER15.TRAINERS).map(t => t.skills.map(s => s[0]))).sort().join();
      renderAccessibilityMenu();
      o.rows = ['p15l-training', 'p15l-bank', 'p15l-codes'].filter(id => document.getElementById(id)).length;
      const b = document.getElementById('p15l-codes');
      o.codesOffByDefault = b.getAttribute('aria-pressed') === 'false';
      if (typeof closeModal === 'function') closeModal();
      G.state = 'play';
      return o;
    });
    ok(mod.have && mod.cfg === 'bank,codes,training' && mod.defaults[0] && mod.defaults[1] && mod.defaults[2] === false,
      'module loads: training and the counting-house on, testing codes off by default');
    ok(mod.item && mod.trainers === 10 && mod.rows === 3 && mod.codesOffByDefault && mod.strings >= 50,
      '10 trainers covering ' + mod.skills.split(',').length + ' skills, the letter is a key item, three Options rows; ' + mod.strings + ' strings');

    // ------------------------------------------------------------------ 2. the fee, the ceiling, the per-level limit
    const fee = await page.evaluate(() => {
      const o = {};
      __stage('surgery', 2.0, 5.5, 0);
      G.player.level = 1; G.player.skills.Physician = 15; G.player.gold = 500;
      G.flags.p15l_tn = 0; G.flags.p15l_tlvl = 0; G.flags.p15l_paid = 0;
      o.cost1 = LEDGER15.sessionCost('Physician');
      G.player.skills.Physician = 60; o.costHigh = LEDGER15.sessionCost('Physician');
      G.player.level = 6; o.costLevel = LEDGER15.sessionCost('Physician');
      G.player.skills.Physician = 15; G.player.level = 1;
      o.left = LEDGER15.sessionsLeft();
      o.ok1 = LEDGER15.canTrain('rooke', 'Physician');
      o.wrongSkill = LEDGER15.canTrain('rooke', 'Blade');
      G.player.skills.Physician = 75; o.capped = LEDGER15.canTrain('rooke', 'Physician');
      G.player.skills.Physician = 15; G.player.gold = 2; o.poor = LEDGER15.canTrain('rooke', 'Physician');
      G.player.gold = 500;
      return o;
    });
    ok(fee.cost1 < fee.costHigh && fee.costHigh < fee.costLevel && fee.left === 3,
      'the fee rises with the skill and with your level (' + fee.cost1 + ' / ' + fee.costHigh + ' / ' + fee.costLevel + '), three sessions a level');
    ok(fee.ok1 === 'ok' && fee.wrongSkill === 'none' && fee.capped === 'capped' && fee.poor === 'poor',
      'a trainer teaches only their own skill, never past their ceiling, and never on credit');

    const train = await page.evaluate(() => {
      const o = {};
      G.player.level = 1; G.player.skills.Physician = 20; G.player.gold = 500;
      G.flags.p15l_tn = 0; G.flags.p15l_tlvl = 0; G.flags.p15l_paid = 0; G.flags.p15l_fees = 0;
      const g0 = G.player.gold, t0 = G.day * 24 + G.tod * 24, jl0 = G.journal.length;
      const cost = LEDGER15.sessionCost('Physician');
      o.took = LEDGER15.train('rooke', 'Physician');
      o.skill = G.player.skills.Physician; o.spent = g0 - G.player.gold; o.cost = cost;
      o.hours = Math.round((G.day * 24 + G.tod * 24 - t0) * 10) / 10;
      o.used = LEDGER15.sessionsUsed(); o.left = LEDGER15.sessionsLeft();
      o.journal = G.journal.length - jl0; o.fees = G.flags.p15l_fees;
      LEDGER15.train('rooke', 'Physician'); LEDGER15.train('rooke', 'Physician');
      o.after3 = [LEDGER15.sessionsLeft(), G.player.skills.Physician];
      o.fourth = LEDGER15.train('rooke', 'Physician');
      // coming up a level clears the tally
      G.player.level = 2;
      o.newLevel = LEDGER15.sessionsLeft();
      o.fifth = LEDGER15.train('rooke', 'Physician');
      return o;
    });
    ok(train.took && train.skill === 21 && train.spent === train.cost && train.hours === 2 && train.used === 1 && train.journal >= 1 && train.fees === train.cost,
      'a session: +1 skill, ' + train.cost + ' sovereigns, two hours of the day, a logbook line and a fee tally');
    ok(train.after3[0] === 0 && train.after3[1] === 23 && train.fourth === false && train.newLevel === 3 && train.fifth === true,
      'three sessions a level, the fourth is refused, and coming up a level clears the tally');

    // ------------------------------------------------------------------ 3. the dialogue button
    const dlg = await page.evaluate(() => {
      const o = {};
      __stage('surgery', 2.0, 5.5, 0);
      const rooke = G.ents.find(e => e.kind === 'npc' && e.id === 'rooke');
      talk(rooke);
      o.button = (document.getElementById('d-p15-train') || {}).textContent || '';
      o.notBank = !document.getElementById('d-p15-bank');
      document.getElementById('d-p15-train').click();
      o.panel = __panel();
      o.rows = __btns().filter(t => /Physician/.test(t)).length;
      o.closed = __click(/Leave it there/);
      o.state = G.state;
      // somebody who teaches nothing gets no button
      __stage('oakhaven', 23.5, 4.0, 0);
      const h = G.ents.find(e => e.kind === 'npc' && e.id === 'townsman') || G.ents.find(e => e.kind === 'npc');
      if (h) { talk(h); o.plain = !document.getElementById('d-p15-train'); if (typeof closeModal === 'function') closeModal(); }
      G.state = 'play';
      return o;
    });
    ok(/taught/.test(dlg.button) && dlg.notBank && /Physician/.test(dlg.panel) && dlg.rows === 1 && dlg.closed && dlg.state === 'play',
      'the trainer gets a dialogue button and a panel of what they teach: "' + dlg.button + '"');
    ok(dlg.plain !== false, 'somebody who teaches nothing gets no button');

    // ------------------------------------------------------------------ 4. the counting-house
    const bank = await page.evaluate(() => {
      const o = {};
      __stage('greenhall', 8.5, 9.5, -Math.PI / 2);
      o.grille = !!G.ents.find(e => e._p15l === 'grille');
      G.player.gold = 300; LEDGER15.setAccount(0);
      o.paidIn = LEDGER15.payIn(200); o.acct = LEDGER15.account(); o.hand = G.player.gold;
      o.tooMuch = LEDGER15.payIn(1000) === false;
      o.drew = LEDGER15.drawOut(50); o.acct2 = LEDGER15.account();
      o.overdraw = LEDGER15.drawOut(1000) === false;
      const a0 = LEDGER15.account();
      o.letter = LEDGER15.drawLetter();
      o.letters = LEDGER15.letters(); o.cost = a0 - LEDGER15.account();
      o.isKey = ITEMS.p15_letter.key === true;
      const g0 = G.player.gold;
      o.atHouse = LEDGER15.atHouse();
      o.cashHere = LEDGER15.cashLetter(); o.gain = G.player.gold - g0; o.lettersLeft = LEDGER15.letters();
      return o;
    });
    ok(bank.grille && bank.paidIn && bank.acct === 200 && bank.hand === 100 && bank.tooMuch && bank.drew && bank.acct2 === 150 && bank.overdraw,
      'the grille stands in the Greenhall; coin goes in and out of the account and never past what you have');
    ok(bank.letter && bank.letters === 1 && bank.cost === 26 && bank.isKey && bank.atHouse && bank.cashHere === 25 && bank.gain === 25 && bank.lettersLeft === 0,
      'a letter costs 25 off the account and a sovereign in stamp duty, and the issuing house honours it in full');

    const away = await page.evaluate(() => {
      const o = {};
      LEDGER15.setAccount(100); LEDGER15.drawLetter();
      __stage('clearing', 20.5, 32.5, 0);
      o.atHouse = LEDGER15.atHouse();
      const g0 = G.player.gold;
      o.paid = LEDGER15.cashLetter(); o.gain = G.player.gold - g0;
      // and from the pack, through the inventory
      LEDGER15.drawLetter();
      const g1 = G.player.gold;
      renderInventory();
      const slot = G.player.inv.find(s => s.id === 'p15_letter');
      useItem(slot);
      o.fromPack = G.player.gold - g1; o.left = LEDGER15.letters();
      o.noneToCash = LEDGER15.cashLetter();
      return o;
    });
    ok(!away.atHouse && away.paid === 23 && away.gain === 23 && away.fromPack === 23 && away.left === 0 && away.noneToCash === 0,
      'away from the issuing house a letter pays 23 of 25, and it can be cashed straight from the pack');

    // ------------------------------------------------------------------ 5. the account is beyond a fine
    const fine = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      G.player.gold = 40; LEDGER15.setAccount(300); LEDGER15.drawLetter();
      G.player.crime = null; normalizeCrime();
      reportCrime('a test', 40);
      confiscateGear();                                   // the watch takes what it may
      o.acct = LEDGER15.account();
      o.letters = LEDGER15.letters();
      o.escrow = (crimeState().evidence.inv || []).some(s => s.id === 'p15_letter');
      returnEvidence();
      return o;
    });
    ok(fine.acct === 274 && fine.letters === 1 && !fine.escrow, 'the account and the letters are beyond the watch: neither is held in evidence');

    // ------------------------------------------------------------------ 6. the testing codes: off by default
    const codesOff = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      o.cfg = LEDGER15.cfg.codes;
      o.refused = LEDGER15.useCode('fullpurse');
      o.cheated = LEDGER15.cheated();
      LEDGER15.openCodes();
      o.panel = G.openPanel;
      if (G.openPanel) { closeModal(); G.state = 'play'; }
      return o;
    });
    ok(codesOff.cfg === false && codesOff.refused === 'off' && !codesOff.cheated && codesOff.panel === null,
      'with the switch off no code works and no panel opens');

    const codes = await page.evaluate(() => {
      const o = {};
      LEDGER15.cfg.codes = true;
      __stage('oakhaven', 23.5, 23.5, 0);
      G.flags.p15l_cheat = 0; delete G.player.p15cheated;
      o.unknown = LEDGER15.useCode('xyzzy');
      o.stillClean = !LEDGER15.cheated();
      const p = G.player;
      p.hp = 1; p.voice = 1; p.fat = 1; p.injuries = ['a test'];
      o.mend = LEDGER15.useCode('mendme');
      o.healed = p.hp === p.hpMax && p.voice === p.voiceMax && p.injuries.length === 0;
      const g0 = p.gold; LEDGER15.useCode('fullpurse'); o.purse = p.gold - g0;
      LEDGER15.useCode('allsongs'); o.songs = p.songs.length >= Object.keys(SONGS).length;
      const t0 = G.day * 24 + G.tod * 24; LEDGER15.useCode('skipnight'); o.hours = Math.round(G.day * 24 + G.tod * 24 - t0);
      LEDGER15.useCode('thickskin'); const hp0 = p.hp; damagePlayer(20, 'test'); o.skin = p.hp === hp0;
      LEDGER15.useCode('thickskin'); damagePlayer(5, 'test'); o.skinOff = p.hp < hp0;
      LEDGER15.useCode('openhedge'); o.hedge = !!(G.flags.gate_open && G.flags.culvert_open);
      G.map.visited.fill(0); LEDGER15.useCode('showall'); o.walked = Array.from(G.map.visited).every(v => v === 1);
      LEDGER15.useCode('hushoff'); o.hush = G.p15hush === true && spawnHound() === undefined;
      LEDGER15.useCode('hushoff'); o.hushBack = G.p15hush === false;
      LEDGER15.useCode('tellall');
      o.count = G.flags.p15l_cheat; o.marked = LEDGER15.cheated(); o.flagOnPlayer = G.player.p15cheated === true;
      LEDGER15.useCode('nocodes'); o.switchOff = LEDGER15.cfg.codes === false && LEDGER15.cheated();
      LEDGER15.cfg.codes = true;
      return o;
    });
    ok(codes.unknown === 'unknown' && codes.stillClean, 'a word the Office has no record of changes nothing and marks nothing');
    ok(codes.healed && codes.purse === 250 && codes.songs && codes.hours === 8 && codes.skin && codes.skinOff && codes.hedge && codes.walked && codes.hush && codes.hushBack,
      'the ten testing codes all do their job (mend, purse, songs, clock, skin on and off, hedge, map, Narrow on and off)');
    ok(codes.count === 11 && codes.marked && codes.flagOnPlayer && codes.switchOff,
      'every use is counted (' + codes.count + ') and the run is marked; turning the switch off does not clear the mark');

    // ------------------------------------------------------------------ 7. the mark shows on the sheet and the statistics
    const marked = await page.evaluate(async () => {
      const o = {};
      renderCharacter();
      o.sheet = (document.querySelector('.p15l-tested') || {}).textContent || '';
      closeModal(); G.state = 'play';
      PLAYTOOLS.renderStats();
      await Promise.resolve();
      o.stats = (document.querySelector('.p15l-stat') || {}).textContent || '';
      closeModal(); G.state = 'play';
      return o;
    });
    ok(/Tested run/.test(marked.sheet) && /Testing codes used/.test(marked.stats),
      'the character sheet and the Statistics page both say the run has been tested');

    // ------------------------------------------------------------------ 8. a hardcore run refuses codes
    const hard = await page.evaluate(() => {
      const o = {};
      G.player.hardcore = true;
      o.refused = LEDGER15.useCode('fullpurse');
      LEDGER15.openCodes();
      o.panel = G.openPanel;
      if (G.openPanel === 'p15codes') { closeModal(); G.state = 'play'; }
      delete G.player.hardcore;
      return o;
    });
    ok(hard.refused === 'hardcore' && hard.panel !== 'p15codes', 'a hardcore run refuses the codes outright');

    // ------------------------------------------------------------------ 9. the F8 word-box
    const box = await page.evaluate(() => {
      const o = {};
      __stage('oakhaven', 23.5, 23.5, 0);
      window.dispatchEvent(new KeyboardEvent('keydown', { code: 'F8', key: 'F8', bubbles: true }));
      o.open = G.openPanel;
      o.input = !!document.getElementById('p15l-code');
      const g0 = G.player.gold;
      document.getElementById('p15l-code').value = 'fullpurse';
      document.getElementById('p15l-code-go').click();
      o.gain = G.player.gold - g0; o.closed = G.openPanel === null && G.state === 'play';
      return o;
    });
    ok(box.open === 'p15codes' && box.input && box.gain === 250 && box.closed, 'F8 opens the word-box, takes a word and hands the game back');

    // ------------------------------------------------------------------ 10. saves, and a hostile save
    const save = await page.evaluate(() => {
      const o = {};
      __stage('greenhall', 8.5, 9.5, -Math.PI / 2);
      LEDGER15.setAccount(140); G.flags.p15l_tn = 2; G.flags.p15l_tlvl = G.player.level;
      const d = snapshotGame();
      o.saved = [d.player.p15bank, d.player.p15cheated === true, d.flags.p15l_tn];
      restoreGame(JSON.parse(JSON.stringify(d)));
      o.back = [LEDGER15.account(), LEDGER15.cheated(), LEDGER15.sessionsUsed()];
      const bad = JSON.parse(JSON.stringify(d));
      bad.player.p15bank = 1e12; bad.player.p15skin = 'yes'; bad.player.p15cheated = 'no';
      Object.assign(bad.flags, { p15l_tn: 99, p15l_tlvl: 'x', p15l_cheat: -3, p15l_letters: {} });
      restoreGame(bad);
      o.safe = [LEDGER15.account(), G.player.p15skin, G.player.p15cheated, LEDGER15.sessionsUsed(), LEDGER15.sessionsLeft()];
      const hp0 = G.player.hp; damagePlayer(7, 'test');
      o.skinGone = G.player.hp < hp0;
      o.grille = !!(G.maps.greenhall.entities || []).find(e => e._p15l === 'grille');
      return o;
    });
    ok(save.saved[0] === 140 && save.saved[1] && save.back[0] === 140 && save.back[1] && save.back[2] === 2,
      'the account, the mark and the training tally ride in the save and come back');
    ok(save.safe[0] <= 99999 && save.safe[1] === undefined && save.safe[2] === undefined && save.safe[3] === 0 && save.skinGone && save.grille,
      'a hostile save cannot forge an account, a thick skin, a hidden mark or a training tally');

    // ------------------------------------------------------------------ 11. all three switches off
    const off = await page.evaluate(() => {
      const o = {};
      LEDGER15.cfg.training = false; LEDGER15.cfg.bank = false; LEDGER15.cfg.codes = false;
      __stage('greenhall', 8.5, 9.5, -Math.PI / 2);
      LEDGER15.ensureGrille(G.map);
      o.grille = !!G.ents.find(e => e._p15l === 'grille');
      const vosk = G.ents.find(e => e.kind === 'npc' && e.id === 'vosk');
      talk(vosk);
      o.buttons = !document.getElementById('d-p15-bank') && !document.getElementById('d-p15-train');
      closeModal(); G.state = 'play';
      o.train = LEDGER15.canTrain('rooke', 'Physician');
      const a0 = LEDGER15.account(), g0 = G.player.gold;
      o.payIn = LEDGER15.payIn(10) === false && LEDGER15.account() === a0 && G.player.gold === g0;
      o.code = LEDGER15.useCode('fullpurse');
      LEDGER15.cfg.training = true; LEDGER15.cfg.bank = true;
      return o;
    });
    ok(!off.grille && off.buttons && off.train === 'none' && off.payIn && off.code === 'off',
      'with the switches off there is no grille, no dialogue button, no training, no account movement and no code');

    // ------------------------------------------------------------------ 12. the module blocked
    const { page: pb, errors: eb } = await boot(browser, { block: true });
    const plain = await pb.evaluate(() => {
      loadMap('greenhall', { x: 8.5, y: 9.5, dir: -Math.PI / 2 }); G.state = 'play'; G.fadeT = 0;
      const o = { have: typeof LEDGER15 === 'undefined', item: !ITEMS.p15_letter, grille: !G.ents.find(e => e._p15l) };
      const vosk = G.ents.find(e => e.kind === 'npc' && e.id === 'vosk');
      talk(vosk);
      o.buttons = !document.getElementById('d-p15-bank');
      closeModal(); G.state = 'play';
      return o;
    });
    ok(plain.have && plain.item && plain.grille && plain.buttons && eb.length === 0, 'with the module blocked the Greenhall and Vosk are untouched');
    await pb.close();

    // ------------------------------------------------------------------ 13. compact screen
    const { page: pc, errors: ec } = await boot(browser, { viewport: { width: 640, height: 400 } });
    const compact = await pc.evaluate(() => {
      loadMap('greenhall', { x: 8.5, y: 9.5, dir: -Math.PI / 2 }); G.state = 'play'; G.fadeT = 0;
      G.player.gold = 300;
      LEDGER15.openBank();
      const p1 = document.querySelector('#modal-panel');
      const r = { bank: /counting-house/.test(p1.textContent), bankOver: p1.scrollWidth - p1.clientWidth };
      closeModal(); G.state = 'play';
      LEDGER15.openTraining('rooke');
      const p2 = document.querySelector('#modal-panel');
      r.train = /Physician/.test(p2.textContent); r.trainOver = p2.scrollWidth - p2.clientWidth;
      closeModal(); G.state = 'play';
      LEDGER15.cfg.codes = true;
      LEDGER15.openCodes();
      const p3 = document.querySelector('#modal-panel');
      r.codes = !!document.getElementById('p15l-code'); r.codesOver = p3.scrollWidth - p3.clientWidth;
      closeModal(); G.state = 'play';
      renderAccessibilityMenu();
      const p4 = document.querySelector('#modal-panel');
      r.rows = !!document.getElementById('p15l-codes'); r.optOver = p4.scrollWidth - p4.clientWidth;
      if (typeof closeModal === 'function') closeModal();
      return r;
    });
    ok(compact.bank && compact.train && compact.codes && compact.rows &&
      compact.bankOver <= 1 && compact.trainOver <= 1 && compact.codesOver <= 1 && compact.optOver <= 1 && ec.length === 0,
      'compact 640x400: the counting-house, the training panel, the word-box and the options rows all fit');
    await pc.close();

    ok(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } finally { await browser.close(); }
  console.log(fails ? 'FAILED: ' + fails : 'ledger15: ALL PASS');
  process.exit(fails ? 1 : 0);
})();
