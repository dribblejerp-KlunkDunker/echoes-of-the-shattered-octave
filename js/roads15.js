// ============================================================
//  roads15 — Phase 15 "The province moves", team ROADS: what happens between two places.
//
//  Two switches (Options -> Graphics & access, stored in localStorage 'octave.roads15.v1').
//  Both off = the game exactly as it was: no panel opens on arrival, no mark is drawn on the
//  automap, and no flag is written.
//
//   1. ROADSIDE EVENTS (cfg.events). A world-map journey (T) can come on something a mile short of
//      where it was going. The journey itself is untouched — js/travel.js travelGo() still decides
//      the hours, the fatigue, the arrival and the ambush roll — and the encounter is handed to the
//      game's own showEvent() panel once you are standing in the world again, so the animated
//      journey (js/motion10.js) plays first and a fight on arrival is finished first.
//        * A carter with a split wheel: put your shoulder to it (Strength), walk on, or, if the load
//          is the Office's glass, cut the lashings.
//        * People off the Greenroot road with what they could carry: food, coin, or ask what they saw
//          (what they say follows how far the Synod has spread — js/synod15.js territory).
//        * A Synod checkpoint, only on ground the Office holds: answer the questions, pay the toll,
//          show the clerk's robes if you are wearing them, go round through the fields (it costs
//          three quarters of an hour), or walk through and be remembered for it.
//        * A milestone with something chalked on it: the Reach's own quiet record-keeping.
//        * A packman on the Reach roads with a tonic, glass shot and honey at road prices.
//      One encounter a journey at most, never two within six world hours, never on the heels of an
//      ambush, and never while a story lock holds the road (travelBlocked already refuses those). A
//      scheduled encounter belongs to that arrival: it is dropped once you leave the map you arrived on,
//      or two world hours after the journey ended, so it can never open on top of something else.
//   2. "WHERE IS...?" MAP MARKS (cfg.marks). Asking an NPC "Where is...?" now also puts the place on
//      your automap (M): a chalk cross and ring where it stands, and a line under the map giving the
//      bearing and the paces, in the same words the directions used. Walk within two paces of a
//      marked place and the mark comes off. Twelve marks at most; asking again refreshes one.
//
//  Saved state: G.player.p15marks (an array of {k, d}: the place's name as the game's own catalogue
//  spells it, and the day it was asked) and four small integers in G.flags —
//    p15r_ev   encounters resolved     p15r_last  the last encounter's index + 1 (never twice running)
//    p15r_hour the world hour of the last encounter    p15r_toll  tolls paid at a checkpoint
//    p15r_grudge  the world hour a checkpoint folder got your description (outriders: +0.1 road risk for two days)
//  Every one of them is clamped on every read, and a mark's name is only ever used after it has been
//  matched against the live catalogue (PLACES / PLACES_WG / PLACES_DW), so an imported save can never
//  put text of its own on the map: the position and the name come from the game's tables, not the save.
//  Marks are drawn with canvas calls and DOM textContent, never innerHTML.
//
//  Wrapped, never edited: travelGo, travelRisk, askPlace, renderMap, update, restoreGame,
//  renderAccessibilityMenu. Every invented line is marked [PROPOSED] and listed in
//  tools/i18n/p15-roads.tsv.
// ============================================================
'use strict';

const ROADS15 = (() => {
  const KEY = 'octave.roads15.v1';
  const LIST = [];
  const S = (t) => { LIST.push(t); return t; };
  const cfg = { events: true, marks: true };
  const MAX_MARKS = 12, FOUND_AT = 2.0, GAP_HOURS = 6, EV_BASE = 0.42, PENDING_HOURS = 2;

  const clampR = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? clampR(v, lo, hi) : d; };
  const hasG = () => typeof G !== 'undefined' && !!G && !!G.flags && typeof G.flags === 'object';
  const fint = (k, hi) => Math.floor(num(hasG() ? G.flags[k] : 0, 0, hi == null ? 99999 : hi, 0));
  const fset = (k, v, hi) => { if (hasG()) G.flags[k] = Math.floor(num(v, 0, hi == null ? 99999 : hi, 0)); };
  const dayNow = () => Math.floor(num(hasG() ? G.day : 0, 0, 99999, 0));
  const clock = () => dayNow() * 24 + num(hasG() ? G.tod : 0, 0, 0.999999, 0) * 24;
  const playing = () => hasG() && G.player && G.state === 'play' && !G.dead;
  const say = (t, c, ms) => { try { if (typeof msg === 'function') msg(t, c, ms); } catch (e) { /* never break a tick */ } };
  const warned = {};
  const warn = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('roads15: ' + k + ' failed', e); } };
  const skill = (k, d) => num(hasG() && G.player && G.player.skills ? G.player.skills[k] : d, 0, 100, d);
  const attr = (k, d) => num(hasG() && G.player && G.player.attrs ? G.player.attrs[k] : d, 0, 100, d);
  const gold = () => num(hasG() && G.player ? G.player.gold : 0, 0, 1e9, 0);

  // ================================================================ text [PROPOSED]
  const TX = {
    marks: {
      noted: S('You put it on your map: {0}.'),
      found: S('You have found {0}. The mark comes off your map.'),
      head: S('Asked after:'),
      line: S('{0} — about {1} paces {2}'),
      here: S('{0} — you are standing at it'),
      elsewhere: S('{0} — not on this map'),
      full: S('Your map has as many chalk crosses as it will hold. The oldest comes off.'),
      dirs: [S('east'), S('south-east'), S('south'), S('south-west'), S('west'), S('north-west'), S('north'), S('north-east')],
    },
    cart: {
      title: S('A cart on the road'),
      body: S('A mile short of {0} there is a cart across the ruts with its near wheel split to the hub, and a carter sitting on the bank with his hat in his hands. The load is {1}.'),
      loadHay: S('hay, roped badly'),
      loadGlass: S('Consortium crates, lilac light leaking out of the straw, and an Office chalk-mark on every lid'),
      help: S('Put your shoulder to the axle.'),
      helped: S('You lift, he turns the wheel on, and the two of you get the pin home. He gives you what is in his pocket and tells you which lane the outriders use.'),
      failed: S('The axle comes up an inch and goes down again, and takes the skin off your palms. The carter says a kind thing about trying, which is worse.'),
      walk: S('Walk on.'),
      walked: S('You walk on. He does not ask.'),
      cut: S('Cut the lashings and take a crate.'),
      cutDone: S('You cut three ropes, take the lightest crate and are a field away before he has his hat back on. The chalk-mark on the lid is a number, and the number is now yours.'),
      journal: S('The road: a carter with a split wheel, a mile short of the gate. The Office chalks a number on every crate it sends down the Greenroot road, and the carters are not told what the numbers mean.'),
    },
    folk: {
      title: S('People on the road'),
      body: S('Four of them, coming the other way with what they could carry: a handcart, a birdcage with nothing in it, and a boy asleep on the bundles. They stop when they see you, the way people do when stopping is cheaper than explaining.'),
      food: S('Give them something to eat.'),
      foodDone: S('You hand over what you have. The woman divides it four ways in front of you, so you can see it is done fairly, and gives the last share to the boy.'),
      coin: S('Give them five sovereigns.'),
      coinDone: S('She takes the coin, counts it, and puts it somewhere in the cart you do not see. "We will say it was found," she says. "If anyone asks."'),
      ask: S('Ask what they saw.'),
      walk: S('Nod, and go on.'),
      walked: S('You nod. They stand aside for you, which is the wrong way round, and nobody says so.'),
      saw: [
        S('"Nothing worth a story. A notice on our own door and a man in grey to read it to us, in case we could not."'),
        S('"They have the Greenroot road. Posts at the mile-stones and a folder at every post. We came over the fields."'),
        S('"They have the square at Oakhaven now and the chapel steps with it. They read to us on Stasisdays. We did not stay for the blessing."'),
        S('"The quarry head, the road out past the Hedge, all of it. They are not even quick about it. That is the part I cannot get used to."'),
        S('"The drowned road is theirs. You can hear the lanterns on the water before you see them, and the lanterns are not ours."'),
        S('"The Mausoleum road. They have put a post where the willows start, and the willows do not like it."'),
      ],
      journal: S('The road: people off the Greenroot road with a handcart and an empty birdcage, going the other way. The Office posts a notice on the door and sends a man in grey to read it aloud, in case you cannot.'),
    },
    gate: {
      title: S('A Synod checkpoint'),
      body: S('A pole across the road on two trestles, a brazier, a clerk with a folder and two proctors who have been standing in one place long enough to have opinions about it. The folder is open at a page of names.'),
      answer: S('Show your hands and answer the questions.'),
      answered: S('You answer. The clerk writes down more than you said and less than he heard, turns the pole up, and does not look at you again.'),
      logged: S('You have no coin for the toll, so the clerk writes your name in the folder instead, slowly, and asks you to spell it. The pole goes up. The page stays.'),
      pay: S('Pay the toll ({0} sovereigns).'),
      paid: S('You pay. The clerk gives you a chalked tally you will never need again, and the proctors lift the pole without being asked.'),
      robes: S('Show the clerk\'s robes.'),
      robed: S('The clerk looks at the robes, looks at his folder, and decides that a colleague is a colleague. The pole goes up early. One of the proctors salutes, which is the worst part of it.'),
      round: S('Go round through the fields (three quarters of an hour).'),
      rounded: S('You go round by the headlands and the wet corner, and come out beyond the pole with your boots ruined and your name nowhere.'),
      refuse: S('Walk through.'),
      refused: S('You walk at the pole and the proctors let you, because the folder is slower than a fight and keeps longer. The clerk writes without hurrying. Somebody will be along.'),
      journal: S('The road: a Synod checkpoint on a road the Office now holds — a pole, a brazier and a page of names. They prefer the page to the fight; the page keeps.'),
      grudge: S('Outriders have your description from a checkpoint folder. The roads are worse for it until it goes stale.'),
    },
    stone: {
      title: S('A milestone'),
      body: S('A milestone, leaning, with the Synod\'s mileage cut into the face of it and something chalked under that in a small square hand.'),
      read: S('Read the chalk.'),
      lines: [
        S('"Nine from the gate. Four of us went down this road in Sheafmonth and three came back. Chalk is not a grave but it is what we have."'),
        S('"Keep left of the ford after rain. Keep quiet past the thorn. Keep your reeds up, whatever the folder says."'),
        S('"They counted the oaks on this mile. We have counted the posts. It is the same number. Make of that what you like."'),
        S('"If you are reading this and you are from the Office: we know you read it. We chalk it again."'),
      ],
      walk: S('Leave it be.'),
      journal: S('The road: the Reach keeps its own record in chalk on the milestones, rewrites it when it is wiped, and signs nothing.'),
    },
    pack: {
      title: S('A packman'),
      body: S('A man with a frame on his back and a dog that has no intention of coming any closer. He walks the Reach roads because the Office has not got round to licensing walking. Road prices, he says, which means his prices.'),
      tonic: S('A tonic, {0} sovereigns.'),
      shot: S('Glass shot, {0} sovereigns.'),
      honey: S('Oiled honey, {0} sovereigns.'),
      none: S('Nothing today.'),
      bought: S('He hands it over, the dog watches you do it, and the whole transaction is over in eleven seconds.'),
      poor: S('You have not the coin, and he has heard that one before.'),
      left: S('He is walking before you have finished saying it.'),
    },
    opts: {
      on: S('On'), off: S('Off'),
      events: S('Roadside events'), eventsHint: S('carts, people on the move, checkpoints, milestones and a packman on world-map journeys'),
      marks: S('"Where is" map marks'), marksHint: S('asking after a place puts a chalk cross on your automap'),
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

  // ================================================================ 1. "Where is...?" marks
  // Every place the game can give directions to, with the map it stands on. Read live: the Woods
  // lists grow as the story opens them (js/data.js). A mark is only ever matched against this.
  function catalogue() {
    const out = {};
    try {
      if (typeof PLACES === 'object' && typeof PLACE_POS === 'object') {
        for (const k in PLACES) { const p = PLACE_POS[PLACES[k]]; if (p) out[k] = { map: 'oakhaven', x: p[0], y: p[1] }; }
      }
      if (typeof PLACES_WG === 'object') for (const k in PLACES_WG) { const p = PLACES_WG[k]; if (p) out[k] = { map: 'whispergrove', x: p[0], y: p[1] }; }
      if (typeof PLACES_DW === 'object') for (const k in PLACES_DW) { const p = PLACES_DW[k]; if (p) out[k] = { map: 'deepwoods', x: p[0], y: p[1] }; }
    } catch (e) { warn('catalogue', e); }
    return out;
  }
  // the saved list, validated: anything the catalogue does not know is dropped
  function marks() {
    if (!hasG() || !G.player) return [];
    const cat = catalogue(), raw = Array.isArray(G.player.p15marks) ? G.player.p15marks : [];
    const out = [], seen = new Set();
    for (const m of raw) {
      if (!m || typeof m.k !== 'string' || !cat[m.k] || seen.has(m.k)) continue;
      seen.add(m.k);
      out.push({ k: m.k, d: Math.floor(num(m.d, 0, 99999, 0)) });
      if (out.length >= MAX_MARKS) break;
    }
    if (out.length !== raw.length) G.player.p15marks = out;
    return out;
  }
  function addMark(name) {
    if (!cfg.marks || !hasG() || !G.player) return false;
    const cat = catalogue();
    if (typeof name !== 'string' || !cat[name]) return false;
    const list = marks().filter((m) => m.k !== name);
    list.push({ k: name, d: dayNow() });
    let full = false;
    while (list.length > MAX_MARKS) { list.shift(); full = true; }
    G.player.p15marks = list;
    say(TX.marks.noted.replace('{0}', name), '', 3200);
    if (full) say(TX.marks.full, 'warn', 4000);
    return true;
  }
  function dropMark(name) {
    if (!hasG() || !G.player) return false;
    const before = marks().length;
    G.player.p15marks = marks().filter((m) => m.k !== name);
    return G.player.p15marks.length !== before;
  }
  function clearMarks() { if (hasG() && G.player) G.player.p15marks = []; }
  // marks on the map you are standing on, with where they are and how far
  function marksHere(mapId) {
    const cat = catalogue(), id = mapId || (hasG() ? G.mapId : null);
    return marks().map((m) => Object.assign({}, m, cat[m.k])).filter((m) => m.map === id);
  }
  function bearing(dx, dy) { return TX.marks.dirs[((Math.round(Math.atan2(dy, dx) / (Math.PI / 4)) % 8) + 8) % 8]; }
  function markLines() {
    if (!cfg.marks || !hasG() || typeof Engine === 'undefined') return [];
    const cat = catalogue(), cx = Engine.cam.x, cy = Engine.cam.y;
    return marks().map((m) => {
      const c = cat[m.k];
      if (!c) return null;
      if (c.map !== G.mapId) return TX.marks.elsewhere.replace('{0}', m.k);
      const dx = c.x - cx, dy = c.y - cy, d = Math.hypot(dx, dy);
      if (d < 2) return TX.marks.here.replace('{0}', m.k);
      return TX.marks.line.replace('{0}', m.k).replace('{1}', String(Math.round(d * 6))).replace('{2}', bearing(dx, dy));
    }).filter(Boolean);
  }
  // walk up to a marked place and the chalk comes off
  function tickMarks() {
    if (!cfg.marks || !playing()) return;
    for (const m of marksHere()) {
      if (Math.hypot(m.x - Engine.cam.x, m.y - Engine.cam.y) > FOUND_AT) continue;
      if (dropMark(m.k)) { say(TX.marks.found.replace('{0}', m.k), 'good', 4200); try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.ui) Audio_.sfx.ui(); } catch (e) { /* mute is fine */ } }
    }
  }
  // a chalk cross in a ring on the automap, and the bearing lines under it
  function drawMarks() {
    if (!cfg.marks || !hasG()) return 0;
    const cv = document.getElementById('amap');
    if (!cv || cv.dataset.p15marks) return 0;
    const here = marksHere();
    cv.dataset.p15marks = '1';
    const x = cv.getContext('2d'), cw = 4;
    for (const m of here) {
      const px = m.x * cw, py = m.y * cw;
      x.save();
      x.strokeStyle = '#f6e7a8'; x.lineWidth = 1.6;
      x.beginPath(); x.arc(px, py, 5.5, 0, Math.PI * 2); x.stroke();
      x.strokeStyle = '#fffbe8'; x.lineWidth = 1.4;
      x.beginPath(); x.moveTo(px - 3.4, py - 3.4); x.lineTo(px + 3.4, py + 3.4); x.moveTo(px + 3.4, py - 3.4); x.lineTo(px - 3.4, py + 3.4); x.stroke();
      x.restore();
    }
    const lines = markLines();
    if (lines.length) {
      const box = document.createElement('div');
      box.id = 'p15r-marks'; box.className = 'muted'; box.style.cssText = 'margin-top:.6cqh;font-size:1.5cqw';
      const h = document.createElement('b'); h.textContent = TX.marks.head + ' '; box.appendChild(h);
      box.appendChild(document.createTextNode(lines.join(' · ')));
      const legend = document.getElementById('lm-legend');
      const after = legend || cv;
      if (after.parentNode) after.parentNode.insertBefore(box, after.nextSibling);
    }
    return here.length;
  }

  // ================================================================ 2. roadside events
  const inSynod = (region, d) => {
    try { return !!(typeof SYNOD15 !== 'undefined' && SYNOD15.territoryAt && d && SYNOD15.territoryAt(region, d.fx, d.fy)); } catch (e) { return false; }
  };
  const synodStage = () => { try { return typeof SYNOD15 !== 'undefined' && SYNOD15.stageNow ? SYNOD15.stageNow() : 0; } catch (e) { return 0; } };
  const robed = () => { try { return typeof wearingDisguise === 'function' && wearingDisguise(); } catch (e) { return false; } };
  const give = (id, n) => { try { if (hasG() && typeof ITEMS === 'object' && ITEMS[id]) G.give(id, n || 1); } catch (e) { warn('give', e); } };
  const rep = (f, n) => { try { if (typeof changeRep === 'function') changeRep(f, n); } catch (e) { warn('rep', e); } };
  const xp = (n) => { try { if (typeof questXp === 'function') questXp(n); } catch (e) { warn('xp', e); } };
  const note = (t) => { try { if (typeof journal === 'function') journal('side', t); } catch (e) { warn('note', e); } };
  const firstNote = (key, t) => { if (fint(key, 1)) return; fset(key, 1, 1); note(t); };
  const sfx = (k) => { try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx[k]) Audio_.sfx[k](); } catch (e) { /* mute is fine */ } };

  const TOLL = 8, GRUDGE_HOURS = 48;
  const tollFor = () => Math.max(3, Math.round(TOLL * (1 - skill('Mercantile', 15) / 250)));
  // the folder with your description in it: kept as the world hour it was written, and it goes stale
  const setGrudge = () => { if (hasG()) G.flags.p15r_grudge = clock() + 1; };
  const grudgeOn = () => { const v = num(hasG() ? G.flags.p15r_grudge : 0, 0, 1e9, 0); return v > 0 && clock() - (v - 1) < GRUDGE_HOURS; };

  // Each: when(ctx) may it happen, weight(ctx), and the panel. All resolved through showEvent().
  const EVENTS = [
    {
      id: 'cart',
      when: () => true,
      weight: (c) => (c.region === 'reach' ? 3 : 2),
      open(c) {
        const glass = synodStage() >= 1 && (c.day % 2 === 0);
        const body = TX.cart.body.replace('{0}', c.name).replace('{1}', glass ? TX.cart.loadGlass : TX.cart.loadHay);
        const ch = [];
        ch.push({
          t: TX.cart.help, f: () => {
            const str = attr('Strength', 40);
            if (Math.random() * 100 < str + 25) {
              say(TX.cart.helped, 'good', 8000); rep('hedge', 3); xp(20);
              G.gold(6 + Math.floor(Math.random() * 7)); give('honey');
              if (typeof gainSkill === 'function') gainSkill('Mercantile', 1);
            } else {
              say(TX.cart.failed, 'warn', 7000);
              if (G.player) G.player.fat = Math.max(0, G.player.fat - G.player.fatMax * 0.12);
            }
            firstNote('p15r_jcart', TX.cart.journal);
          },
        });
        if (glass) ch.push({
          t: TX.cart.cut, f: () => {
            say(TX.cart.cutDone, 'warn', 9000); rep('office', -4); rep('hedge', 1); xp(25);
            give('v_mesh'); G.gold(4 + Math.floor(Math.random() * 6));
            setGrudge();
            firstNote('p15r_jcart', TX.cart.journal);
          },
        });
        ch.push({ t: TX.cart.walk, f: () => say(TX.cart.walked, '', 4500) });
        return { title: TX.cart.title, body, choices: ch };
      },
    },
    {
      id: 'folk',
      when: () => true,
      weight: (c) => 2 + (c.stage >= 1 ? 2 : 0),
      open(c) {
        const ch = [];
        const food = ['honey', 'tonic'].find((id) => hasG() && G.has(id));
        if (food) ch.push({
          t: TX.folk.food, f: () => { G.take(food); say(TX.folk.foodDone, 'good', 8000); rep('hedge', 4); xp(20); firstNote('p15r_jfolk', TX.folk.journal); },
        });
        if (gold() >= 5) ch.push({
          t: TX.folk.coin, f: () => { G.gold(-5); say(TX.folk.coinDone, 'good', 8000); rep('hedge', 3); xp(15); firstNote('p15r_jfolk', TX.folk.journal); },
        });
        ch.push({
          t: TX.folk.ask, f: () => {
            say(TX.folk.saw[clampR(c.stage, 0, TX.folk.saw.length - 1)], 'voice', 9000);
            if (typeof gainSkill === 'function') gainSkill('Lore', 1);
            firstNote('p15r_jfolk', TX.folk.journal);
          },
        });
        ch.push({ t: TX.folk.walk, f: () => say(TX.folk.walked, '', 5000) });
        return { title: TX.folk.title, body: TX.folk.body, choices: ch };
      },
    },
    {
      id: 'gate',
      when: (c) => c.inSynod,
      weight: () => 4,
      open() {
        const cost = tollFor(), ch = [];
        ch.push({
          t: TX.gate.answer, f: () => {
            if (gold() >= cost) { G.gold(-cost); fset('p15r_toll', fint('p15r_toll') + 1, 999); say(TX.gate.answered, '', 7000); }
            else { say(TX.gate.logged, 'warn', 8000); rep('office', -3); }
            firstNote('p15r_jgate', TX.gate.journal);
          },
        });
        if (gold() >= cost) ch.push({
          t: TX.gate.pay.replace('{0}', String(cost)), f: () => {
            G.gold(-cost); fset('p15r_toll', fint('p15r_toll') + 1, 999);
            say(TX.gate.paid, '', 6500); sfx('ui'); firstNote('p15r_jgate', TX.gate.journal);
          },
        });
        if (robed()) ch.push({
          t: TX.gate.robes, f: () => { say(TX.gate.robed, 'good', 8000); rep('synod', 1); xp(15); firstNote('p15r_jgate', TX.gate.journal); },
        });
        ch.push({
          t: TX.gate.round, f: () => {
            try { if (typeof passHours === 'function') passHours(0.75); } catch (e) { warn('round', e); }
            say(TX.gate.rounded, '', 7000); rep('hedge', 1); firstNote('p15r_jgate', TX.gate.journal);
          },
        });
        ch.push({
          t: TX.gate.refuse, f: () => {
            say(TX.gate.refused, 'bad', 8000); rep('synod', -5); rep('office', -3);
            setGrudge(); say(TX.gate.grudge, 'warn', 6000);
            firstNote('p15r_jgate', TX.gate.journal);
          },
        });
        return { title: TX.gate.title, body: TX.gate.body, choices: ch };
      },
    },
    {
      id: 'stone',
      when: () => true,
      weight: () => 2,
      open(c) {
        const i = (c.day + fint('p15r_ev')) % TX.stone.lines.length;
        return {
          title: TX.stone.title, body: TX.stone.body,
          choices: [
            { t: TX.stone.read, f: () => { say(TX.stone.lines[i], 'voice', 9500); if (typeof gainSkill === 'function') gainSkill('Lore', 2); xp(10); firstNote('p15r_jstone', TX.stone.journal); } },
            { t: TX.stone.walk, f: null },
          ],
        };
      },
    },
    {
      id: 'pack',
      when: (c) => c.region === 'reach' && !c.inSynod,
      weight: () => 2,
      open() {
        const buy = (id, cost) => () => {
          if (gold() < cost) { say(TX.pack.poor, 'warn', 4500); return; }
          G.gold(-cost); give(id); say(TX.pack.bought, '', 5000); sfx('pickup');
          if (typeof gainSkill === 'function') gainSkill('Mercantile', 1);
        };
        return {
          title: TX.pack.title, body: TX.pack.body,
          choices: [
            { t: TX.pack.tonic.replace('{0}', '6'), f: buy('tonic', 6) },
            { t: TX.pack.shot.replace('{0}', '9'), f: buy('pellets', 9) },
            { t: TX.pack.honey.replace('{0}', '7'), f: buy('honey', 7) },
            { t: TX.pack.none, f: () => say(TX.pack.left, '', 4000) },
          ],
        };
      },
    },
  ];

  // pending: worked out when the journey is taken, shown once you are in the world again
  let pending = null;
  const pick = (ctx, roll) => {
    const last = fint('p15r_last', EVENTS.length) - 1;
    const pool = EVENTS.filter((e, i) => i !== last && (() => { try { return !!e.when(ctx); } catch (err) { return false; } })());
    const use = pool.length ? pool : EVENTS.filter((e) => { try { return !!e.when(ctx); } catch (err) { return false; } });
    if (!use.length) return null;
    let total = 0;
    const w = use.map((e) => { let v = 1; try { v = Math.max(0.1, e.weight(ctx)); } catch (err) { v = 1; } total += v; return v; });
    let r = (roll == null ? Math.random() : roll) * total;
    for (let i = 0; i < use.length; i++) { r -= w[i]; if (r <= 0) return use[i]; }
    return use[use.length - 1];
  };
  function eventChance(mins) { return EV_BASE * clampR(num(mins, 0, 9999, 30) / 45, 0.5, 1.4); }
  function readyForEvent() { return cfg.events && clock() - num(hasG() ? G.flags.p15r_hour : 0, 0, 1e9, -1e9) >= GAP_HOURS; }
  // called from the travelGo wrapper, with the destination the panel will name
  function schedule(d, mins, roll) {
    if (!cfg.events || !hasG() || !d) return null;
    if (!readyForEvent()) return null;
    if ((roll == null ? Math.random() : roll) >= eventChance(mins)) return null;
    const region = typeof TRAVEL !== 'undefined' ? TRAVEL.region : 'reach';
    const ctx = { name: String(d.name || ''), mapId: d.map, region, mins, day: dayNow(), stage: synodStage(), inSynod: inSynod(region, d) };
    const ev = pick(ctx);
    if (!ev) return null;
    pending = { id: ev.id, ctx, at: clock(), tries: 0 };
    return pending;
  }
  const hostileNear = () => {
    try {
      if (!hasG() || !Array.isArray(G.ents)) return false;
      const c = Engine.cam;
      return G.ents.some((e) => e && e.kind === 'enemy' && !e.dead && !e.hidden && !e.passive && e.state !== 'passive' &&
        (e.x - c.x) * (e.x - c.x) + (e.y - c.y) * (e.y - c.y) < 225);
    } catch (e) { return false; }
  };
  function tickPending() {
    if (!pending || !cfg.events) return;
    // the encounter belongs to the arrival, not to whatever you do half a day later: it is dropped once
    // you have gone somewhere else, or two world hours after the journey ended
    if (hasG() && pending.ctx && pending.ctx.mapId && G.mapId !== pending.ctx.mapId) { pending = null; return; }
    if (clock() - pending.at > PENDING_HOURS) { pending = null; return; }
    if (!playing() || G.openPanel || G.state !== 'play' || (G.fadeT || 0) > 0.25) return;
    if (hostileNear()) return;                            // an ambush first: the road waits, up to its two hours
    const ev = EVENTS.find((e) => e.id === pending.id), ctx = pending.ctx;
    pending = null;
    if (!ev) return;
    fire(ev, ctx);
  }
  function fire(ev, ctx) {
    if (typeof showEvent !== 'function') return;
    let panel = null;
    try { panel = ev.open(ctx); } catch (e) { warn('open', e); return; }
    if (!panel || !panel.choices || !panel.choices.length) return;
    fset('p15r_ev', fint('p15r_ev') + 1, 9999);
    fset('p15r_last', EVENTS.indexOf(ev) + 1, EVENTS.length);
    if (hasG()) G.flags.p15r_hour = clock();
    const choices = panel.choices.map((c) => ({ t: c.t, f: c.f ? () => { try { c.f(); } catch (e) { warn('choice', e); } } : null }));
    showEvent(panel.title, panel.body, choices);
  }
  // test hook: run an encounter by id, as if the road had just produced it
  function force(id, ctx) {
    const ev = EVENTS.find((e) => e.id === id);
    if (!ev) return false;
    const region = typeof TRAVEL !== 'undefined' ? TRAVEL.region : 'reach';
    fire(ev, Object.assign({ name: 'the gate', mapId: hasG() ? G.mapId : 'oakhaven', region, mins: 45, day: dayNow(), stage: synodStage(), inSynod: true }, ctx || {}));
    return true;
  }

  // ================================================================ options
  function el(tag, props, text) {
    const e = document.createElement(tag);
    if (props) for (const k in props) { if (k === 'class') e.className = props[k]; else e.setAttribute(k, props[k]); }
    if (text != null) e.textContent = text;
    return e;
  }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('p15r-events')) return;
    const label = (t, hint) => { const s = el('span', { class: 'gfx-label' }, t + ' '); s.appendChild(el('small', { class: 'muted' }, hint)); return s; };
    const row = (id, key, name, hint) => {
      grid.appendChild(label(name, hint));
      const b = el('button', { class: 'dfbtn small', id, type: 'button', 'aria-pressed': cfg[key] ? 'true' : 'false' }, cfg[key] ? TX.opts.on : TX.opts.off);
      b.classList.toggle('sel', cfg[key]);
      b.onclick = () => {
        cfg[key] = !cfg[key]; saveCfg();
        b.textContent = cfg[key] ? TX.opts.on : TX.opts.off;
        b.setAttribute('aria-pressed', cfg[key] ? 'true' : 'false');
        b.classList.toggle('sel', cfg[key]);
        if (!cfg.events) pending = null;
      };
      grid.appendChild(b);
    };
    row('p15r-events', 'events', TX.opts.events, TX.opts.eventsHint);
    row('p15r-marks', 'marks', TX.opts.marks, TX.opts.marksHint);
  }

  // ================================================================ install
  function install() {
    loadCfg();
    if (typeof travelGo === 'function') {
      const _go = travelGo;
      travelGo = function (d) {
        let mins = 45, blocked = false;
        try {
          if (typeof travelMinutes === 'function') mins = travelMinutes(d);
          blocked = typeof travelBlocked === 'function' ? !!travelBlocked() : false;   // a story lock refuses the road
        } catch (e) { mins = 45; }
        const r = _go.apply(this, arguments);
        try { if (!blocked) schedule(d, mins); } catch (e) { warn('schedule', e); }
        return r;
      };
    }
    // a checkpoint folder with your description in it makes every road worse for a while
    if (typeof travelRisk === 'function') {
      const _risk = travelRisk;
      travelRisk = function () {
        const base = _risk.apply(this, arguments);
        try { return cfg.events && base > 0 && grudgeOn() ? Math.min(0.9, base + 0.1) : base; } catch (e) { return base; }
      };
    }
    if (typeof askPlace === 'function') {
      const _ask = askPlace;
      askPlace = function (place) {
        const r = _ask.apply(this, arguments);
        try { if (cfg.marks) addMark(place); } catch (e) { warn('mark', e); }
        return r;
      };
    }
    if (typeof renderMap === 'function') {
      const _map = renderMap;
      renderMap = function () {
        const r = _map.apply(this, arguments);
        try { drawMarks(); } catch (e) { warn('draw', e); }
        return r;
      };
    }
    if (typeof restoreGame === 'function') {
      const _restore = restoreGame;
      restoreGame = function () {
        pending = null;
        const r = _restore.apply(this, arguments);
        try { marks(); } catch (e) { warn('restore', e); }      // validate the loaded list at once
        return r;
      };
    }
    if (typeof update === 'function') {
      const _up = update;
      let acc = 0;
      update = function (dt) {
        const r = _up.apply(this, arguments);
        try {
          acc += dt;
          if (acc >= 0.3) { acc = 0; tickMarks(); tickPending(); }
        } catch (e) { warn('tick', e); }
        return r;
      };
    }
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRows(); } catch (e) { warn('options', e); } return r; };
    }
  }
  try { install(); } catch (e) { console.warn('roads15: install failed', e); }

  return {
    TX, LIST, cfg, saveCfg, loadCfg, MAX_MARKS, FOUND_AT, GAP_HOURS, EV_BASE, TOLL,
    catalogue, marks, addMark, dropMark, clearMarks, marksHere, markLines, drawMarks, tickMarks, bearing,
    EVENTS, pick, schedule, fire, force, tickPending, eventChance, readyForEvent, tollFor, inSynod, synodStage, PENDING_HOURS,
    setGrudge, grudgeOn, GRUDGE_HOURS,
    get pending() { return pending; }, set pending(v) { pending = v; },
    appendRows,
  };
})();
if (typeof window !== 'undefined') window.ROADS15 = ROADS15;
