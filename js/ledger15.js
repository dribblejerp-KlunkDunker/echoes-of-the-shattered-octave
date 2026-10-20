// ============================================================
//  ledger15 — Phase 15 "The province moves", team LEDGER: the Office's own machinery, turned to use.
//
//  Three switches (Options -> Graphics & access, stored in localStorage 'octave.ledger15.v1').
//  All off = the game exactly as it was: no dialogue button is added, no grille stands in the
//  Greenhall, no key opens a panel and no flag is written.
//
//   1. PAID TRAINING (cfg.training, on). Ten people in Book One will teach what they know, for coin:
//      Harrow (Blunt), Hob (Stealth), Rooke (Physician), Vane (Blade and Firearms), Vosk (Mercantile),
//      Lyra (Law-Song), Kaelen (Glasswork), Sable (Lockpicking), Tam (Lore) and Tobiah (Climbing).
//      A session is one point of the skill, two hours of the day and a fee that rises with your own
//      level and with the skill you are buying (a Mercantile hand knocks a little off). Two limits, as
//      the old games had them: nobody teaches past their own ceiling, and you may take at most three
//      sessions in any one character level. Levelling up clears the tally.
//   2. LETTERS OF CREDIT (cfg.bank, on). The counting-house grille in the Greenhall (and Vosk's own
//      dialogue) keeps an account: pay coin in, draw coin out, and draw letters of credit against it
//      at 25 sovereigns a letter with a sovereign's stamp duty. A letter is a key item, so no fine,
//      bribe or evidence escrow can reach it, and any house will honour one anywhere in the province —
//      a house that is not the issuing house keeps a tenth for its trouble. The account itself is out
//      of the watch's reach: a fine is paid in coin in hand, and the grille does not care who is wanted.
//   3. TESTING CODES (cfg.codes, OFF by default). With the switch on, F8 opens a word-box. Ten words
//      do ten testing jobs (mend, purse, songs, clock, skin, hedge, map, state, hush, off). The run is
//      marked the moment one is used: the count rides in the save, the Statistics panel and the
//      character sheet say so, and nothing clears the mark. A hardcore run refuses codes outright.
//
//  Saved state:
//    G.player.p15bank    sovereigns in the account (a clamped integer, 0 .. 99,999)
//    G.player.p15cheated true once a testing code has been used in this run
//    G.flags.p15l_tn     training sessions used at the level in p15l_tlvl (0-3)
//    G.flags.p15l_tlvl   the character level that tally belongs to
//    G.flags.p15l_paid   sessions taken in all        G.flags.p15l_fees   sovereigns paid in fees
//    G.flags.p15l_letters letters drawn               G.flags.p15l_cheat  testing codes used
//  Every one is clamped on every read, so an imported save can neither forge an account nor hide a
//  mark; ITEMS.p15_letter is registered at load, before any save is restored, so a letter in an old
//  save validates like any other item.
//
//  Wrapped, never edited: renderDialogue, useDeco, renderCharacter, checkLevel, restoreGame,
//  PLAYTOOLS.renderStats, renderAccessibilityMenu. Every invented line is marked [PROPOSED] and
//  listed in tools/i18n/p15-ledger.tsv.
// ============================================================
'use strict';

const LEDGER15 = (() => {
  const KEY = 'octave.ledger15.v1';
  const LIST = [];
  const S = (t) => { LIST.push(t); return t; };
  const cfg = { training: true, bank: true, codes: false };

  const PER_LEVEL = 3;              // training sessions allowed in one character level
  const SESSION_HOURS = 2;
  const LETTER = 25;                // the face value of one letter of credit
  const STAMP = 1;                  // stamp duty on drawing one
  const AWAY_CUT = 0.1;             // a house that did not issue it keeps a tenth
  const BANK_CAP = 99999;

  const clampL = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? clampL(v, lo, hi) : d; };
  const hasG = () => typeof G !== 'undefined' && !!G && !!G.flags && typeof G.flags === 'object';
  const fint = (k, hi) => Math.floor(num(hasG() ? G.flags[k] : 0, 0, hi == null ? 99999 : hi, 0));
  const fset = (k, v, hi) => { if (hasG()) G.flags[k] = Math.floor(num(v, 0, hi == null ? 99999 : hi, 0)); };
  const P = () => (hasG() ? G.player : null);
  const gold = () => num(P() ? P().gold : 0, 0, 1e9, 0);
  const level = () => Math.max(1, Math.floor(num(P() ? P().level : 1, 1, 999, 1)));
  const skillOf = (k) => num(P() && P().skills ? P().skills[k] : 15, 0, 100, 15);
  const say = (t, c, ms) => { try { if (typeof msg === 'function') msg(t, c, ms); } catch (e) { /* never break a tick */ } };
  const sfx = (k) => { try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx[k]) Audio_.sfx[k](); } catch (e) { /* mute is fine */ } };
  const warned = {};
  const warn = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('ledger15: ' + k + ' failed', e); } };
  const hardcore = () => { try { return typeof hardcoreOn === 'function' && hardcoreOn(); } catch (e) { return false; } };

  // ================================================================ text [PROPOSED]
  const TX = {
    train: {
      button: S('Ask to be taught'),
      buttonLeft: S('Ask to be taught ({0} left this level)'),
      title: S('What they can teach'),
      intro: S('A session is two hours of the day and a fee in coin. Nobody teaches past their own ceiling, and three sessions in one level of your own is as much as anybody will take money for.'),
      purse: S('You have {0} sovereigns. Sessions left at this level: {1} of {2}.'),
      row: S('{0}: {1} now, {2} is as far as they go — {3} sovereigns'),
      at: S('{0}: {1} now, and that is as far as they go'),
      take: S('Take the session'),
      close: S('Leave it there'),
      done: S('Two hours of it, and your {0} is {1}. Your purse is {2} sovereigns lighter and you have learned the thing they could not say in words.'),
      poor: S('You have not the fee, and nobody here teaches on credit.'),
      spent: S('You have had three sessions since you last came up a level. Go and use them.'),
      capped: S('"That is the whole of what I know," they say, and they are not being modest. "Find somebody worse-tempered and better travelled."'),
      journal: S('Training: people in this town will teach what they know for coin — two hours and a fee, three sessions to a level, and never past their own ceiling. Harrow has a gate-warden\'s cudgel work; Hob walks quietly; Rooke mends; Vane sells both ends of a fight; Vosk counts; Lyra sings the law; Kaelen knows the glass; Sable knows locks; Tam knows the Reach; Tobiah knows how to get up a rock face.'),
      lines: {
        harrow: S('"A cudgel is not a sword. You do not swing it, you let it fall and you are somewhere else when it lands."'),
        hob: S('"Oil the leather. Walk on the whole foot. Breathe out on the step, not in. That is the lot, and it took me nine years."'),
        rooke: S('"You will not learn anatomy in two hours. You will learn which bleeding kills you in four minutes, which is better value."'),
        vane: S('"Keep the point between you and the trouble. If you are going to shoot, shoot early. If you are going to board, board laughing."'),
        vosk: S('"Price is what a thing costs. Value is what you can be persuaded to pay. The Consortium made a very great deal of money out of the gap."'),
        lyra: S('"The law is a key signature. Learn it, and you can sing almost anything inside it and nobody can write you up for it."'),
        kaelen: S('"Glass does what it was tuned to do. Stop asking it to be kind. Hold it at the node, there, and it will not take your hand."'),
        sable: S('"A lock is a little argument about who is allowed. Listen to it. The third pin is where they get proud."'),
        tam: S('"You want to know the Reach? Then learn its bad corners first. I will do you a list, and I will tell you why for each one."'),
        tobiah: S('"Three points on the rock at all times. Look for the crack, not the hold. And do not go up anything you cannot come down in the dark."'),
      },
    },
    bank: {
      grille: S('The counting-house grille'),
      button: S('The counting-house'),
      title: S('The counting-house of the Greenhall'),
      intro: S('A brass grille, a ledger the size of a door and a clerk who writes down everything you say and some of what you do not. The Office keeps accounts because the Office keeps everything.'),
      state: S('In hand: {0} sovereigns. On account: {1}. Letters of credit carried: {2}.'),
      terms: S('A letter is {0} sovereigns off the account and a sovereign in stamp duty. Any house in the province will honour one; a house that did not issue it keeps a tenth. What is on account is not coin in hand, so no fine, bribe or evidence escrow can reach it.'),
      inLabel: S('Pay in {0} sovereigns'),
      outLabel: S('Draw out {0} sovereigns'),
      letterLabel: S('Draw a letter of credit ({0} + {1} stamp)'),
      cashLabel: S('Cash a letter here ({0} sovereigns)'),
      cashAwayLabel: S('Cash a letter ({0} sovereigns, a tenth kept)'),
      close: S('Close the grille'),
      paidIn: S('The clerk counts it twice, writes it once, and the account is {0}.'),
      drewOut: S('He counts it out in fives, and the account is {0}.'),
      drewLetter: S('He stamps a half-sheet, writes the sum in words and in figures, and holds it under the grille until you have read it. One letter of credit, {0} sovereigns.'),
      cashed: S('A letter of credit, honoured: {0} sovereigns.'),
      noLetter: S('You have no letter of credit to cash.'),
      noCoin: S('You have not that much in hand.'),
      noAccount: S('There is not that much on the account.'),
      journal: S('The counting-house: the Greenhall keeps an account for anyone with coin, and will write a letter of credit at twenty-five sovereigns a sheet. Any house in the province honours one; what is on the account is beyond a fine.'),
      item: S('Letter of Credit'),
      itemDesc: S('A stamped half-sheet on the Greenhall counting-house, for twenty-five sovereigns, payable to the bearer at any house in the province. The Office honours its own paper. It has to.'),
    },
    codes: {
      title: S('Testing codes'),
      intro: S('A word-box for testing. Anything you do here is written into the run: the count rides in the save and the character sheet and Statistics both say so. Nothing clears it.'),
      prompt: S('The word'),
      submit: S('Use it'),
      close: S('Close the box'),
      unknown: S('The Office has no record of that word.'),
      hardcore: S('Not in a hardcore run. That is the whole point of a hardcore run.'),
      marked: S('This run is marked as tested ({0} codes used).'),
      sheet: S('Tested run: {0} testing codes used.'),
      stat: S('Testing codes used'),
      hint: S('F8 opens the word-box while the switch is on.'),
      list: S('mendme · fullpurse · allsongs · skipnight · thickskin · openhedge · showall · tellall · hushoff · nocodes'),
      did: {
        mendme: S('Mended: health, voice and wind full, injuries cleared.'),
        fullpurse: S('The purse is 250 sovereigns heavier.'),
        allsongs: S('Every Song in the book is in your throat.'),
        skipnight: S('Eight hours pass.'),
        thickskinOn: S('Thick skin: nothing can hurt you.'),
        thickskinOff: S('Thick skin off: the world can reach you again.'),
        openhedge: S('The North Gate is unbarred and the culvert grate is open.'),
        showall: S('This map is all walked.'),
        hushoff: S('The Narrow is held open: no hounds, no unwriting.'),
        hushon: S('The Narrow is live again.'),
        nocodes: S('The word-box is closed and the switch is off. The mark stays.'),
      },
    },
    opts: {
      on: S('On'), off: S('Off'),
      training: S('Paid training'), trainingHint: S('ten people will teach a skill for coin: two hours, a fee, three sessions a level'),
      bank: S('Letters of credit'), bankHint: S('an account and letters of credit at the Greenhall counting-house'),
      codes: S('Testing codes'), codesHint: S('F8 opens a word-box; using one marks the run for good'),
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

  // ================================================================ 1. paid training
  // [PROPOSED] who teaches what, and how far they can take you
  const TRAINERS = {
    harrow: { skills: [['Blunt', 55]] },
    hob: { skills: [['Stealth', 70]] },
    rooke: { skills: [['Physician', 75]] },
    vane: { skills: [['Blade', 65], ['Firearms', 70]] },
    vosk: { skills: [['Mercantile', 70]] },
    lyra: { skills: [['Law-Song', 85]] },
    kaelen: { skills: [['Glasswork', 85]] },
    sable: { skills: [['Lockpicking', 75]] },
    tam: { skills: [['Lore', 60]] },
    tobiah: { skills: [['Climbing', 60]] },
  };
  const trainerIdOf = (npcDef) => {
    if (typeof NPCS === 'undefined' || !npcDef) return null;
    for (const id in TRAINERS) if (NPCS[id] === npcDef) return id;
    return null;
  };
  function sessionCost(skillName) {
    const cur = skillOf(skillName);
    const merc = skillOf('Mercantile');
    return Math.max(8, Math.round((12 + level() * 4 + cur * 1.1) * (1 - merc / 300)));
  }
  // the tally belongs to one character level: coming up a level clears it
  function sessionsUsed() {
    if (fint('p15l_tlvl', 999) !== level()) return 0;
    return clampL(fint('p15l_tn', PER_LEVEL), 0, PER_LEVEL);
  }
  const sessionsLeft = () => PER_LEVEL - sessionsUsed();
  function noteSession() {
    fset('p15l_tlvl', level(), 999);
    fset('p15l_tn', sessionsUsed() + 1, PER_LEVEL);
    fset('p15l_paid', fint('p15l_paid') + 1, 9999);
  }
  function canTrain(id, skillName) {
    const t = TRAINERS[id]; if (!cfg.training || !t || !P()) return 'none';
    const row = t.skills.find((s) => s[0] === skillName); if (!row) return 'none';
    if (skillOf(skillName) >= row[1]) return 'capped';
    if (sessionsLeft() <= 0) return 'spent';
    if (gold() < sessionCost(skillName)) return 'poor';
    return 'ok';
  }
  function train(id, skillName) {
    const state = canTrain(id, skillName);
    if (state !== 'ok') {
      say(state === 'capped' ? TX.train.capped : state === 'spent' ? TX.train.spent : TX.train.poor, 'warn', 6000);
      return false;
    }
    const cost = sessionCost(skillName), p = P();
    p.gold = gold() - cost;
    if (!p.skills || typeof p.skills !== 'object') p.skills = {};
    p.skills[skillName] = clampL(skillOf(skillName) + 1, 0, 100);
    noteSession();
    fset('p15l_fees', fint('p15l_fees') + cost, 999999);
    try { if (typeof passHours === 'function') passHours(SESSION_HOURS); } catch (e) { warn('hours', e); }
    if (p.fat != null) p.fat = Math.max(0, p.fat - (p.fatMax || 100) * 0.08);
    try { if (typeof PLAYTOOLS !== 'undefined' && PLAYTOOLS.inc) PLAYTOOLS.inc('p7s_spent', cost); } catch (e) { /* statistics are optional */ }
    sfx('pickup');
    say(TX.train.done.replace('{0}', skillName).replace('{1}', String(p.skills[skillName])).replace('{2}', String(cost)), 'good', 7000);
    if (TX.train.lines[id]) say(TX.train.lines[id], 'voice', 8000);
    if (fint('p15l_paid') === 1) { try { if (typeof journal === 'function') journal('side', TX.train.journal); } catch (e) { warn('journal', e); } }
    return true;
  }
  function openTraining(id) {
    if (!cfg.training || !TRAINERS[id] || !hasG()) return;
    const map = G.map;
    G.state = 'panel';
    const rows = TRAINERS[id].skills.map(([name, cap]) => {
      const cur = skillOf(name), cost = sessionCost(name);
      const label = cur >= cap ? TX.train.at.replace('{0}', name).replace('{1}', String(cur))
        : TX.train.row.replace('{0}', name).replace('{1}', String(cur)).replace('{2}', String(cap)).replace('{3}', String(cost));
      const state = canTrain(id, name);
      return `<button class="dfbtn" data-skill="${name}"${state === 'ok' ? '' : ' disabled'}>${label}</button>`;
    }).join('');
    openModal('<h2>' + TX.train.title + '</h2><p>' + TX.train.intro + '</p>' +
      '<p class="muted">' + TX.train.purse.replace('{0}', String(gold())).replace('{1}', String(sessionsLeft())).replace('{2}', String(PER_LEVEL)) + '</p>' +
      '<div class="list">' + rows + '</div>' +
      '<div class="btns"><button class="dfbtn" id="p15l-train-close">' + TX.train.close + '</button></div>', 'p15training');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15training' && G.map === map && !G.dead;
    const leave = () => { closeModal(); G.state = 'play'; G.keys = {}; };
    document.getElementById('p15l-train-close').onclick = () => { if (valid()) leave(); };
    for (const b of document.querySelectorAll('[data-skill]')) {
      b.onclick = () => {
        if (!valid()) return;
        const name = b.dataset.skill;
        leave();
        train(id, name);
      };
    }
  }

  // ================================================================ 2. the counting-house
  function registerItem() {
    if (typeof ITEMS === 'undefined' || ITEMS.p15_letter) return;
    ITEMS.p15_letter = { name: TX.bank.item, sprite: 'loot', desc: TX.bank.itemDesc, key: true, value: LETTER, use: 'p15_letter' };
  }
  const account = () => num(P() ? P().p15bank : 0, 0, BANK_CAP, 0);
  function setAccount(v) { if (P()) P().p15bank = Math.floor(num(v, 0, BANK_CAP, 0)); }
  const letters = () => { try { return hasG() ? G.count('p15_letter') : 0; } catch (e) { return 0; } };
  const atHouse = () => hasG() && (G.mapId === 'greenhall' || G.mapId === 'quarry');

  function payIn(n) {
    n = Math.floor(num(n, 1, BANK_CAP, 0));
    if (!cfg.bank || !P() || n <= 0) return false;
    if (gold() < n) { say(TX.bank.noCoin, 'warn', 4500); return false; }
    P().gold = gold() - n; setAccount(account() + n);
    sfx('ui'); say(TX.bank.paidIn.replace('{0}', String(account())), '', 5000);
    firstJournal();
    return true;
  }
  function drawOut(n) {
    n = Math.floor(num(n, 1, BANK_CAP, 0));
    if (!cfg.bank || !P() || n <= 0) return false;
    if (account() < n) { say(TX.bank.noAccount, 'warn', 4500); return false; }
    setAccount(account() - n); P().gold = gold() + n;
    sfx('pickup'); say(TX.bank.drewOut.replace('{0}', String(account())), '', 5000);
    firstJournal();
    return true;
  }
  function drawLetter() {
    if (!cfg.bank || !P()) return false;
    if (account() < LETTER + STAMP) { say(TX.bank.noAccount, 'warn', 4500); return false; }
    setAccount(account() - LETTER - STAMP);
    try { G.give('p15_letter', 1); } catch (e) { warn('give', e); return false; }
    fset('p15l_letters', fint('p15l_letters') + 1, 9999);
    sfx('ui'); say(TX.bank.drewLetter.replace('{0}', String(LETTER)), 'good', 6500);
    firstJournal();
    return true;
  }
  function cashLetter() {
    if (!cfg.bank || !P() || letters() <= 0) { say(TX.bank.noLetter, 'warn', 4000); return 0; }
    const paid = atHouse() ? LETTER : Math.round(LETTER * (1 - AWAY_CUT));
    try { G.take('p15_letter'); } catch (e) { warn('take', e); return 0; }
    P().gold = gold() + paid;
    try { if (typeof PLAYTOOLS !== 'undefined' && PLAYTOOLS.inc) PLAYTOOLS.inc('p7s_earned', paid); } catch (e) { /* optional */ }
    sfx('pickup'); say(TX.bank.cashed.replace('{0}', String(paid)), 'good', 5500);
    firstJournal();
    return paid;
  }
  function firstJournal() {
    if (fint('p15l_bankj', 1)) return;
    fset('p15l_bankj', 1, 1);
    try { if (typeof journal === 'function') journal('side', TX.bank.journal); } catch (e) { warn('journal', e); }
  }
  function openBank() {
    if (!cfg.bank || !hasG()) return;
    const map = G.map;
    G.state = 'panel';
    const paid = atHouse() ? LETTER : Math.round(LETTER * (1 - AWAY_CUT));
    const html = '<h2>' + TX.bank.title + '</h2><p>' + TX.bank.intro + '</p>' +
      '<p class="muted">' + TX.bank.state.replace('{0}', String(gold())).replace('{1}', String(account())).replace('{2}', String(letters())) + '</p>' +
      '<p class="muted">' + TX.bank.terms.replace('{0}', String(LETTER)) + '</p>' +
      '<div class="list">' +
      [10, 50, 200].map((n) => `<button class="dfbtn" data-in="${n}"${gold() >= n ? '' : ' disabled'}>${TX.bank.inLabel.replace('{0}', String(n))}</button>`).join('') +
      [10, 50, 200].map((n) => `<button class="dfbtn" data-out="${n}"${account() >= n ? '' : ' disabled'}>${TX.bank.outLabel.replace('{0}', String(n))}</button>`).join('') +
      `<button class="dfbtn" id="p15l-letter"${account() >= LETTER + STAMP ? '' : ' disabled'}>${TX.bank.letterLabel.replace('{0}', String(LETTER)).replace('{1}', String(STAMP))}</button>` +
      `<button class="dfbtn" id="p15l-cash"${letters() > 0 ? '' : ' disabled'}>${(atHouse() ? TX.bank.cashLabel : TX.bank.cashAwayLabel).replace('{0}', String(paid))}</button>` +
      '</div><div class="btns"><button class="dfbtn" id="p15l-bank-close">' + TX.bank.close + '</button></div>';
    openModal(html, 'p15bank');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15bank' && G.map === map && !G.dead;
    const leave = () => { closeModal(); G.state = 'play'; G.keys = {}; };
    const again = () => { if (valid()) { closeModal(); openBank(); } };
    document.getElementById('p15l-bank-close').onclick = () => { if (valid()) leave(); };
    for (const b of document.querySelectorAll('[data-in]')) b.onclick = () => { if (valid() && payIn(+b.dataset.in)) again(); };
    for (const b of document.querySelectorAll('[data-out]')) b.onclick = () => { if (valid() && drawOut(+b.dataset.out)) again(); };
    document.getElementById('p15l-letter').onclick = () => { if (valid() && drawLetter()) again(); };
    document.getElementById('p15l-cash').onclick = () => { if (valid() && cashLetter()) again(); };
  }
  // the grille itself, so the counting-house is there whether or not Vosk feels like talking
  function ensureGrille(m) {
    if (!m || m.id !== 'greenhall' || !Array.isArray(m.entities)) return;
    const have = m.entities.find((e) => e && e._p15l === 'grille');
    if (!cfg.bank) { if (have) m.entities.splice(m.entities.indexOf(have), 1); return; }
    if (have) return;
    const e = {
      kind: 'deco', sprite: 'sign', x: 15.4, y: 6.6, scale: 0.9, solid: true, radius: 0.2,
      nopick: false, transient: true, _decor: true, _p15l: 'grille', use: 'p15l_bank', label: TX.bank.grille,
    };
    if (typeof hydrate === 'function') hydrate(e);
    m.entities.push(e);
  }

  // ================================================================ 3. testing codes
  const cheated = () => !!(P() && P().p15cheated === true) || fint('p15l_cheat') > 0;
  const CODES = {
    mendme: () => {
      const p = P(); if (!p) return null;
      p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = p.fatMax;
      if (p.needs === true) { p.hunger = 100; p.sleep = 100; }
      p.injuries = [];
      try { if (typeof UPG !== 'undefined' && UPG.status) { UPG.status.bleed = 0; UPG.status.deaf = 0; UPG.status.hushed = 0; UPG.status.fear = 0; } } catch (e) { /* optional */ }
      return TX.codes.did.mendme;
    },
    fullpurse: () => { const p = P(); if (!p) return null; p.gold = gold() + 250; return TX.codes.did.fullpurse; },
    allsongs: () => {
      const p = P(); if (!p || typeof SONGS === 'undefined') return null;
      p.songs = Object.keys(SONGS);
      return TX.codes.did.allsongs;
    },
    skipnight: () => { try { if (typeof passHours === 'function') passHours(8); } catch (e) { warn('skip', e); } return TX.codes.did.skipnight; },
    thickskin: () => {
      const p = P(); if (!p) return null;
      p.p15skin = !p.p15skin;
      return p.p15skin ? TX.codes.did.thickskinOn : TX.codes.did.thickskinOff;
    },
    openhedge: () => { if (!hasG()) return null; G.flags.gate_open = true; G.flags.culvert_open = true; return TX.codes.did.openhedge; },
    showall: () => { if (!hasG() || !G.map || !G.map.visited) return null; G.map.visited.fill(1); return TX.codes.did.showall; },
    tellall: () => {
      if (!hasG()) return null;
      const c = typeof Engine !== 'undefined' ? Engine.cam : { x: 0, y: 0 };
      return 'Day ' + Math.floor(num(G.day, 0, 99999, 0)) + ', ' + (num(G.tod, 0, 1, 0) * 24).toFixed(2) + 'h · ' + String(G.mapId) +
        ' ' + c.x.toFixed(1) + ',' + c.y.toFixed(1) + ' · level ' + level() + ' · ' + Object.keys(G.flags).length + ' flags · account ' + account();
    },
    hushoff: () => {
      if (!hasG()) return null;
      G.p15hush = !G.p15hush;
      return G.p15hush ? TX.codes.did.hushoff : TX.codes.did.hushon;
    },
    nocodes: () => { cfg.codes = false; saveCfg(); return TX.codes.did.nocodes; },
  };
  function useCode(word) {
    if (!cfg.codes) return 'off';
    if (hardcore()) { say(TX.codes.hardcore, 'bad', 6000); return 'hardcore'; }
    const key = String(word == null ? '' : word).trim().toLowerCase();
    const fn = Object.prototype.hasOwnProperty.call(CODES, key) ? CODES[key] : null;
    if (!fn) { say(TX.codes.unknown, 'warn', 4500); return 'unknown'; }
    let line = null;
    try { line = fn(); } catch (e) { warn('code', e); return 'failed'; }
    if (line == null) return 'failed';
    markRun();
    say(line, 'good', 6000);
    say(TX.codes.marked.replace('{0}', String(fint('p15l_cheat'))), 'warn', 5000);
    sfx('ui');
    return 'ok';
  }
  function markRun() {
    if (P()) P().p15cheated = true;
    fset('p15l_cheat', fint('p15l_cheat') + 1, 9999);
  }
  function openCodes() {
    if (!cfg.codes || !hasG() || G.state !== 'play' || G.dead) return;
    if (hardcore()) { say(TX.codes.hardcore, 'bad', 6000); return; }
    const map = G.map;
    G.state = 'panel';
    openModal('<h2>' + TX.codes.title + '</h2><p>' + TX.codes.intro + '</p>' +
      '<p class="muted">' + TX.codes.list + '</p>' +
      '<p><label for="p15l-code">' + TX.codes.prompt + '</label> <input id="p15l-code" maxlength="24" autocomplete="off" spellcheck="false"></p>' +
      '<div class="btns"><button class="dfbtn" id="p15l-code-go">' + TX.codes.submit + '</button><button class="dfbtn" id="p15l-code-close">' + TX.codes.close + '</button></div>' +
      (cheated() ? '<p class="muted">' + TX.codes.marked.replace('{0}', String(fint('p15l_cheat'))) + '</p>' : ''), 'p15codes');
    const token = G.panelToken;
    const valid = () => G.panelToken === token && G.openPanel === 'p15codes' && G.map === map && !G.dead;
    const leave = () => { closeModal(); G.state = 'play'; G.keys = {}; };
    const input = document.getElementById('p15l-code');
    const go = () => {
      if (!valid()) return;
      const word = input ? input.value : '';
      const r = useCode(word);
      if (r === 'unknown') { if (input) { input.value = ''; input.focus(); } return; }
      leave();
    };
    document.getElementById('p15l-code-go').onclick = go;
    document.getElementById('p15l-code-close').onclick = () => { if (valid()) leave(); };
    if (input) {
      input.focus();
      input.onkeydown = (ev) => { if (ev.key === 'Enter') { ev.preventDefault(); go(); } else if (ev.key === 'Escape') { ev.preventDefault(); if (valid()) leave(); } };
    }
  }

  // ================================================================ dialogue, panels, options
  function el(tag, props, text) {
    const e = document.createElement(tag);
    if (props) for (const k in props) { if (k === 'class') e.className = props[k]; else e.setAttribute(k, props[k]); }
    if (text != null) e.textContent = text;
    return e;
  }
  function addDialogueButtons() {
    if (!hasG() || typeof DLG === 'undefined' || !DLG.npc || typeof NPCS === 'undefined') return;
    const btns = document.querySelector('#modal-panel .dlg .btns'); if (!btns) return;
    const bye = btns.querySelector('#d-bye');
    const add = (id, label, fn) => {
      if (btns.querySelector('#' + id)) return;
      const b = el('button', { class: 'dfbtn small', id, type: 'button' }, label);
      b.onclick = () => { try { fn(); } catch (e) { warn('button', e); } };
      btns.insertBefore(b, bye || null);
    };
    const id = trainerIdOf(DLG.npc);
    if (cfg.training && id) {
      const left = sessionsLeft();
      add('d-p15-train', left > 0 ? TX.train.buttonLeft.replace('{0}', String(left)) : TX.train.button,
        () => { closeModal(); G.state = 'play'; openTraining(id); });
    }
    if (cfg.bank && DLG.npc === NPCS.vosk) {
      add('d-p15-bank', TX.bank.button, () => { closeModal(); G.state = 'play'; openBank(); });
    }
  }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('p15l-training')) return;
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
        if (key === 'bank') { try { if (hasG() && G.maps && G.maps.greenhall) ensureGrille(G.maps.greenhall); } catch (e) { warn('grille', e); } }
      };
      grid.appendChild(b);
    };
    row('p15l-training', 'training', TX.opts.training, TX.opts.trainingHint);
    row('p15l-bank', 'bank', TX.opts.bank, TX.opts.bankHint);
    row('p15l-codes', 'codes', TX.opts.codes, TX.opts.codesHint);
  }

  // the tested-run row on the Statistics page
  function statRow() {
    try {
      const root = document.getElementById('p7-stats');
      if (!root || !cheated() || root.querySelector('.p15l-stat')) return false;
      const row = el('div', { class: 'p7-srow p15l-stat' });
      row.appendChild(el('span', null, TX.codes.stat));
      row.appendChild(el('b', null, String(fint('p15l_cheat'))));
      root.appendChild(row);
      return true;
    } catch (e) { warn('stats', e); return false; }
  }

  // ================================================================ install
  function install() {
    loadCfg();
    registerItem();
    if (typeof renderDialogue === 'function') {
      const _rd = renderDialogue;
      renderDialogue = function () { const r = _rd.apply(this, arguments); try { addDialogueButtons(); } catch (e) { warn('dialogue', e); } return r; };
    }
    if (typeof useItem === 'function') {
      const _item = useItem;
      useItem = function (slot) {
        try {
          if (cfg.bank && slot && slot.id === 'p15_letter') {
            closeModal(); G.state = 'play'; G.keys = {};
            cashLetter();
            return;
          }
        } catch (e) { warn('useItem', e); }
        return _item.apply(this, arguments);
      };
    }
    if (typeof useDeco === 'function') {
      const _use = useDeco;
      useDeco = function (e) {
        try { if (e && e.use === 'p15l_bank' && cfg.bank) { openBank(); return; } } catch (err) { warn('use', err); }
        return _use.apply(this, arguments);
      };
    }
    if (typeof loadMap === 'function') {
      const _load = loadMap;
      loadMap = function (id) {
        try { if (hasG() && G.maps && G.maps[id]) ensureGrille(G.maps[id]); } catch (e) { warn('pre-grille', e); }
        const r = _load.apply(this, arguments);
        try { if (hasG() && G.map) ensureGrille(G.map); } catch (e) { warn('grille', e); }
        return r;
      };
    }
    if (typeof restoreGame === 'function') {
      const _restore = restoreGame;
      restoreGame = function () {
        const r = _restore.apply(this, arguments);
        try {
          if (P()) {
            setAccount(account());
            if (P().p15cheated !== true) delete P().p15cheated;
            if (P().p15skin !== true) delete P().p15skin;
          }
          if (hasG() && G.maps && G.maps.greenhall) ensureGrille(G.maps.greenhall);
        } catch (e) { warn('restore', e); }
        return r;
      };
    }
    // the character sheet and the statistics page both say a run has been tested
    if (typeof renderCharacter === 'function') {
      const _char = renderCharacter;
      renderCharacter = function () {
        const r = _char.apply(this, arguments);
        try {
          if (!cheated()) return r;
          const panel = document.getElementById('modal-panel');
          if (!panel || panel.querySelector('.p15l-tested')) return r;
          panel.appendChild(el('p', { class: 'muted p15l-tested' }, TX.codes.sheet.replace('{0}', String(fint('p15l_cheat')))));
        } catch (e) { warn('sheet', e); }
        return r;
      };
    }
    if (typeof openModal === 'function') {
      const _modal = openModal;
      openModal = function (html, name) {
        const r = _modal.apply(this, arguments);
        // the Statistics page fills #p7-stats after openModal returns, so the row is added once it has
        if (name === 'stats' && typeof queueMicrotask === 'function') queueMicrotask(statRow);
        return r;
      };
    }
    // thick skin and a held-open Narrow, for testing only
    if (typeof damagePlayer === 'function') {
      const _dmg = damagePlayer;
      damagePlayer = function () {
        try { if (P() && P().p15skin === true) return undefined; } catch (e) { /* fall through */ }
        return _dmg.apply(this, arguments);
      };
    }
    if (typeof spawnHound === 'function') {
      const _sh = spawnHound;
      spawnHound = function () {
        try { if (hasG() && G.p15hush === true) return undefined; } catch (e) { /* fall through */ }
        return _sh.apply(this, arguments);
      };
    }
    if (typeof updateNarrow === 'function') {
      const _nar = updateNarrow;
      updateNarrow = function () {
        try { if (hasG() && G.p15hush === true) { G.stillT = 0; G.unwriting = false; return undefined; } } catch (e) { /* fall through */ }
        return _nar.apply(this, arguments);
      };
    }
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRows(); } catch (e) { warn('options', e); } return r; };
    }
    if (typeof window !== 'undefined') {
      window.addEventListener('keydown', (ev) => {
        if (!cfg.codes || ev.repeat) return;
        if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
        if (ev.code !== 'F8' && ev.key !== 'F8') return;
        ev.preventDefault();
        if (!hasG()) return;
        if (G.state === 'play') openCodes();
        else if (G.openPanel === 'p15codes') { closeModal(); G.state = 'play'; }
      });
    }
    try { if (hasG() && G.maps && G.maps.greenhall) ensureGrille(G.maps.greenhall); } catch (e) { /* nothing built yet */ }
  }
  try { install(); } catch (e) { console.warn('ledger15: install failed', e); }

  return {
    TX, LIST, cfg, saveCfg, loadCfg,
    PER_LEVEL, SESSION_HOURS, LETTER, STAMP, AWAY_CUT, TRAINERS,
    trainerIdOf, sessionCost, sessionsUsed, sessionsLeft, canTrain, train, openTraining,
    account, setAccount, letters, atHouse, payIn, drawOut, drawLetter, cashLetter, openBank, ensureGrille, registerItem,
    CODES, useCode, openCodes, cheated, markRun, statRow,
    appendRows, addDialogueButtons,
  };
})();
if (typeof window !== 'undefined') window.LEDGER15 = LEDGER15;
