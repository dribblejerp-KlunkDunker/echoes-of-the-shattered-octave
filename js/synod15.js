// ============================================================
//  synod15 — Phase 15 "The province moves", team SYNOD: what the Office does while you are busy.
//
//  Four world events, each behind its own switch (Options -> Graphics & access, stored in
//  localStorage 'octave.synod15.v1'). Every switch off = the game exactly as it was: nothing is
//  placed, no line is said, no mark is drawn on the world map, and no flag is written.
//
//   1. THE READING (cfg.sermons). Every Stasisday (G.day % 8 === 4), from 10:00 until 11:30, a Synod
//      herald reads the Office's lections from the chapel steps in Oakhaven while two proctors stand
//      by and whoever could not find a reason to be elsewhere listens. Six lections, one every quarter
//      hour. Stand near it (within 9) for three of them and stay to the blessing and you have attended:
//      Synod standing +4, the Hedge's own opinion -1, Law-Song practice, a logbook line the first time.
//      Or break it up, three ways, each resolved once a day:
//        * speak against the reading (a button in the herald's dialogue; a Personality / Law-Song check);
//        * sing anything within 10 of the steps (js/game.js castSong);
//        * put a stone or a bottle into the crowd (js/game.js distractionImpact).
//      A broken reading: Synod -6/-8, the Hedge +6/+8, the crowd goes home, and if a proctor or a
//      constable has clear sight of you when you do it the watch records it (25 bounty) — a passed
//      speech, which quotes the Rite's own text back at them, is lawful and is never charged.
//   2. THE ECLIPSE (cfg.eclipse). A new moon that crosses the sun: predictable, rare (one in five new
//      moons, so G.day 13, 53, 93...), and announced by the almanac the night before and at dawn.
//      From 15:35 the moon's disc walks onto the sun; totality is 16:06-16:26; it is over by 16:58.
//      The sky hook puts the dark disc (and, at totality, a thin corona) on the engine's own sun, the
//      post hook takes the light out of the frame, outdoors only. People stop and look up; the Hush
//      comes a little nearer (one nudge of Dissonance, if the Dread meter is on) and the hounds are as
//      bold as on a dark night while it lasts. Reduce motion keeps the disc and drops the corona;
//      no-flashes keeps the dimming smooth and never brightens the frame.
//   3. SYNOD TERRITORY (cfg.territory). The world map (T) shades the ground the Office holds, growing
//      by story stage: the Greenroot road, then Oakhaven's square, then the quarry head and the roads
//      outside the Hedge, then the drowned road and the Mausoleum road in the Woods. The stage is read
//      from the story's own flags (which only ever go forward); the flag p15s_terr keeps the high-water
//      mark as a record and can never raise it, so an imported save cannot forge the spread. A journey whose destination stands in Synod
//      ground is a little riskier and says so before you set out. js/roads15.js reads territoryAt()
//      for its checkpoints.
//   4. THE REPRISAL (cfg.reprisal). Once the Church has come up the Greenroot road (flag rite_ready),
//      the Office makes an example of the cooper's shed on the west lane, where a First Reed was found
//      hanging. The shed burns, smoulders for two days, is hoarded and worked on, and is rebuilt by the
//      parish on the sixth day — all keyed to the day the fire was set, so the state is right whenever
//      you come back. Bram Creel, the cooper, dies in it. That death is permanent for the run: he is
//      never placed again, his name goes into your Ledger (K), and the parish chalk-roll inside the
//      chapel keeps it. No quest, shop or story NPC is ever touched.
//
//  Saved state, all small integers in G.flags, clamped on every read (an imported save cannot make them
//  anything else):
//    p15s_serm  readings attended      p15s_dis   readings broken up
//    p15s_sday  day+1 of the reading already resolved (one a day)
//    p15s_ecl   eclipses seen          p15s_eday  day+1 of the eclipse already credited
//    p15s_fire  day+1 the fire was set (0: not yet)    p15s_lost  bitmask of the named dead
//    p15s_terr  the high-water mark of the Synod's spread (0-5)
//  Everything placed is transient: nothing new is written into a save's entity lists, and the props and
//  people are rebuilt from the flags and the clock on every map change.
//  Wrapped, never edited: loadMap, restoreGame, update, renderDialogue, castSong, distractionImpact,
//  spawnHound, travelDraw, travelRender, travelInfo, travelConfirm, travelRisk, useDeco,
//  renderAccessibilityMenu. Art is procedural stand-in work (existing sprites, canvas, sky and post
//  hooks). Every invented line is marked [PROPOSED] and listed in tools/i18n/p15-synod.tsv.
// ============================================================
'use strict';

const SYNOD15 = (() => {
  const KEY = 'octave.synod15.v1';
  const LIST = [];                                  // every player-visible string, for the translators
  const S = (t) => { LIST.push(t); return t; };
  const cfg = { sermons: true, eclipse: true, territory: true, reprisal: true };

  const clamp15 = (v, a, b) => (v < a ? a : v > b ? b : v);
  const num = (v, lo, hi, d) => { v = Number(v); return Number.isFinite(v) ? clamp15(v, lo, hi) : d; };
  const hasG = () => typeof G !== 'undefined' && !!G && !!G.flags && typeof G.flags === 'object';
  const flags = () => (hasG() ? G.flags : {});
  const fint = (name, hi) => Math.floor(num(flags()[name], 0, hi == null ? 9999 : hi, 0));
  const fset = (name, v, hi) => { if (hasG()) G.flags[name] = Math.floor(num(v, 0, hi == null ? 9999 : hi, 0)); };
  const dayNow = () => Math.floor(num(hasG() ? G.day : 0, 0, 99999, 0));
  const hourNow = () => num(hasG() ? G.tod : 0, 0, 0.999999, 0) * 24;
  const playing = () => hasG() && G.player && G.state === 'play' && !G.dead;
  const reduced = () => typeof GFX !== 'undefined' && !!GFX.reduceMotion;
  const inOak = () => hasG() && G.mapId === 'oakhaven';
  // Part One and Two only: after the Greening the town is another place and the Kestrel does not go back
  const oakOpen = () => { const f = flags(); return !f.greening && !f.part3 && !f.part4 && !f.escaped; };
  const camX = () => (typeof Engine !== 'undefined' ? Engine.cam.x : 0);
  const camY = () => (typeof Engine !== 'undefined' ? Engine.cam.y : 0);
  const near = (x, y, r) => { const dx = camX() - x, dy = camY() - y; return dx * dx + dy * dy < r * r; };
  const say = (t, c, ms) => { try { if (typeof msg === 'function') msg(t, c, ms); } catch (e) { /* never break a tick */ } };
  const warned = {};
  const warn = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('synod15: ' + k + ' failed', e); } };

  // ================================================================ text [PROPOSED]
  const TX = {
    serm: {
      notice: S('A reading is set for the chapel steps this morning. The Office requires the attendance of the parish. There will be no singing.'),
      gather: S('They are gathering at the chapel steps: a herald with a grey folder, two proctors, and whoever could not find a reason to be elsewhere.'),
      beats: [
        S('"Lection the first. Sound is property. What is sung is owed."'),
        S('"Lection the second. The Pure Note is held at the casing by a licensed throat. No other throat is licensed."'),
        S('"Lection the third. A bell is an instrument of assembly. The parish has no further need of assembly."'),
        S('"Lection the fourth. Grief is permitted. Grief at volume is not."'),
        S('"Lection the fifth. The Reach is tuned, and a tuned country does not argue."'),
        S('"The blessing. Keep your voices in your chests, and the Office will keep the rest."'),
      ],
      heraldName: S('A Synod herald, reading'),
      heraldGreet: S('Stand where you are and listen, traveller. It is shorter than you think.'),
      heraldBlunt: S('You will want to lower that voice on a chapel step.'),
      heraldPolite: S('Attendance is noted. Not by me. Keep still.'),
      heraldTopic: S('The lections are the Office\'s, the folder is the Office\'s, and the voice is mine on loan. Ask me nothing you would not put in writing.'),
      button: S('Speak against the reading'),
      spoke: S('You wait for the fourth lection and give them the Rite\'s own wording back, in order, at the volume the Office prints it in. The herald loses his place. Somebody at the back says the next line with you.'),
      spokeFail: S('You get four words out before the herald reads straight over you, and the parish studies its boots until you stop.'),
      brokeNoise: S('The reading stops. The herald closes the grey folder very slowly, and the parish is suddenly needed elsewhere.'),
      attended: S('The herald closes the folder. The parish goes back to work, carefully, one at a time.'),
      attendJournal: S('The Reading: I stood through a Synod reading on the chapel steps in Oakhaven. Sound is property. What is sung is owed. The Office noted the attendance; the town noted that I stood there.'),
      breakJournal: S('The Reading: I broke up a Synod reading on the chapel steps. The parish will say nothing about it and will not forget it either.'),
      crime: S('disturbing a Synod reading'),
      listener: S('A parishioner, attending'),
    },
    ecl: {
      almanacEve: S('The almanac has tomorrow marked: the new moon crosses the sun in the late afternoon. Tobin\'s hand in the margin says the Hush comes closer in a daytime dark, and to be indoors or be still.'),
      almanacDawn: S('The eclipse falls today, late in the afternoon. Nobody in Oakhaven intends to be out in it.'),
      start: S('The light goes thin, as if the day were being used up. The moon has the sun\'s edge.'),
      total: S('The sun goes out. A ring of cold light, a sky the colour of a bruise, and every bird in the Reach stops at once.'),
      end: S('The light comes back, wrong-coloured for a moment, and the Reach starts breathing again.'),
      folk: S('Somebody in the lane says, to nobody: "Not a sound now. Not a sound until it passes."'),
      journal: S('The Eclipse: the new moon crossed the sun late in the afternoon and the day went out for twenty minutes. The Hush came nearer while it lasted. The almanac has the next one marked forty days out.'),
      indoors: S('The window goes dark in the middle of the day, and stays dark a while.'),
    },
    terr: {
      legend: S('Synod writ'),
      none: S('No Synod ground on this map yet.'),
      line: S('Synod writ: {0}.'),
      travel: S('This road runs through Synod ground. Expect a post, a folder and a question.'),
      names: {
        road: S('the Greenroot road'),
        square: S('Oakhaven: the chapel and the square'),
        quarry: S('the quarry head'),
        outside: S('the road posts outside the Hedge'),
        drowned: S('the drowned road'),
        maus: S('the Mausoleum road'),
      },
    },
    rep: {
      cooperName: S('Bram Creel, cooper'),
      cooperGreet: S('Mind the shavings. I hoop barrels, I mend barrels, and I do not sing at work, whatever you have heard.'),
      cooperPolite: S('Kind of you. Here — it\'s nothing, it\'s a hoop. Take it and go careful.'),
      cooperBlunt: S('Shout somewhere else. There are three of us on this lane who still have reeds up.'),
      cooperTopic: S('My grandfather cut the First Reed over that door and my father hung it again when the frost split it. It is a stick of reed. It is also the only thing on this lane the Office has not catalogued.'),
      widowName: S('Sessa Creel'),
      widowGreet: S('They put the new lintel in yesterday. It is the wrong oak and I do not care.'),
      widowPolite: S('He went in for the reed. I want that said somewhere that keeps things.'),
      widowBlunt: S('Not today. Whoever you are, not today.'),
      widowTopic: S('The parish nailed the hoarding up the same night. Nobody asked the Office anything. We are good at not asking, and I am tired of being good at it.'),
      fire: S('Smoke on the west lane. The cooper\'s shed is burning, and two proctors are standing in the road to see that it is let burn.'),
      fireWhy: S('A First Reed was found hanging over the door. The folder calls it an unlicensed instrument.'),
      death: S('They carry Bram Creel out of the shed and lay him on the cobbles. He went back in for the reed over the door. The parish stands in a ring and makes no noise at all.'),
      deathJournal: S('The Reprisal: the Office fired the cooper\'s shed on the west lane for an unlicensed instrument — a First Reed over the door. Bram Creel went back in for it and did not come out. I have written his name in my ledger. He stays dead; this town does not get him back.'),
      ruin: S('The cooper\'s shed is a wet black shell. Somebody has set a cup of milk on the step.'),
      works: S('The parish has hoarded the burnt shed and two carpenters are working on it, quietly, without a permit.'),
      rebuilt: S('The cooper\'s shed stands again in the wrong oak, and there is a new First Reed over the door. Nobody says who hung it.'),
      doorBurning: S('The cooper\'s shed. It is burning, and the heat holds you off.'),
      doorRuin: S('The cooper\'s shed — burnt out. The door is a hole, and there is nothing inside but rain.'),
      doorWorks: S('The cooper\'s shed, hoarded and half-rebuilt. Somebody inside is planing, slowly, so it does not carry.'),
      doorRebuilt: S('The cooper\'s shed, rebuilt. A new First Reed hangs over the door, and the shutters are shut from within.'),
      notice: S('A parish notice, chalked on the hoarding'),
      noticeTitle: S('The hoarding on the west lane'),
      noticeBody: S('Chalked on a board in a careful, square hand:<br><br><i>This shed is being rebuilt by the parish, out of the parish\'s own timber, for the Creels, who have the lane\'s thanks. There is nothing to report and nobody to report it to.</i><br><br>Under it, in a different hand, very small: <i>the reed was his grandfather\'s</i>.'),
      rollLabel: S('The parish chalk-roll of the lost'),
      rollTitle: S('The chalk-roll'),
      rollIntro: S('A slate inside the chapel door, kept in chalk because chalk can be wiped if the Office asks. The parish writes down who the year took, and who took them.'),
      rollNone: S('The slate has been wiped clean. For now.'),
      rollEntry: S('Bram Creel, cooper of the west lane — the Office, for a reed over his door.'),
      rollClose: S('Leave the slate.'),
    },
    opts: {
      on: S('On'), off: S('Off'),
      sermons: S('Synod readings'), sermonsHint: S('the Stasisday reading on the chapel steps, to attend or break up'),
      eclipse: S('Eclipses'), eclipseHint: S('the new moon crosses the sun; the day goes out'),
      territory: S('Synod territory'), territoryHint: S('the ground the Office holds, shaded on the world map'),
      reprisal: S('Reprisals'), reprisalHint: S('the Office makes an example; a burnt shed, rebuilt, and a death that stays'),
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

  // ================================================================ 1. the reading
  const SERM_DAY = 4;                        // Stasisday, the Office's own day of order (js/calendar11.js WEEK)
  const SERM_FROM = 10, SERM_TO = 11.5;      // world hours
  const BEATS = TX.serm.beats.length;
  const STEP = (SERM_TO - SERM_FROM) / BEATS;
  const EAR = 14, NEAR = 9, CROWD_R = 7;     // hear it / count as attending / a throw lands in the crowd
  const STEPS = { x: 48.5, y: 12.6 };        // the chapel apron, in front of the door at (48, 9)
  const PROCTORS = [[46.9, 12.7], [50.1, 12.7]];
  const PEWS = [[47.2, 14.3], [48.5, 14.5], [49.8, 14.3], [47.8, 15.6], [49.3, 15.7]];
  // live, never saved: the state of today's reading
  const serm = { day: -1, beat: -1, heard: 0, broken: false, spoke: false, resolved: false, said: false };

  const sermonDay = (d) => (d == null ? dayNow() : d) % 8 === SERM_DAY;
  // the live state belongs to one day: a new day (a rest, a journey, a load) clears it, tick or no tick
  function syncSermonDay() { if (serm.day !== dayNow()) resetSermonDay(); }
  function sermonRunning() {
    if (!cfg.sermons || !hasG() || !oakOpen() || !sermonDay()) return false;
    const h = hourNow();
    return h >= SERM_FROM && h < SERM_TO;
  }
  const sermonLive = () => { syncSermonDay(); return sermonRunning() && !serm.broken && fint('p15s_sday') !== dayNow() + 1; };
  function sermonBeat() { const h = hourNow(); return clamp15(Math.floor((h - SERM_FROM) / STEP), 0, BEATS - 1); }
  function resetSermonDay() { serm.day = dayNow(); serm.beat = -1; serm.heard = 0; serm.broken = false; serm.spoke = false; serm.resolved = false; serm.said = false; }

  function attendReading() {
    if (serm.resolved) return;
    serm.resolved = true;
    fset('p15s_sday', dayNow() + 1, 99999);
    fset('p15s_serm', fint('p15s_serm') + 1, 9999);
    try {
      if (typeof changeRep === 'function') { changeRep('synod', 4); changeRep('hedge', -1); }
      if (typeof gainSkill === 'function') gainSkill('Law-Song', 2);
      if (typeof questXp === 'function') questXp(20);
      if (fint('p15s_serm') === 1 && typeof journal === 'function') journal('side', TX.serm.attendJournal);
    } catch (e) { warn('attend', e); }
    say(TX.serm.attended, 'warn', 7000);
  }
  // kind: 'speech' (lawful, a passed check), 'noise' (a Song or a thrown stone)
  // witness: who had clear sight at the moment of the act, worked out before it (a Song can fell the proctor who saw it)
  function breakReading(kind, witness) {
    if (serm.broken || serm.resolved) return false;
    serm.broken = true; serm.resolved = true;
    fset('p15s_sday', dayNow() + 1, 99999);
    fset('p15s_dis', fint('p15s_dis') + 1, 9999);
    try {
      if (typeof changeRep === 'function') {
        changeRep('synod', kind === 'speech' ? -6 : -8);
        changeRep('hedge', kind === 'speech' ? 8 : 6);
      }
      if (kind === 'speech' && typeof gainSkill === 'function') gainSkill('Law-Song', 3);
      if (typeof questXp === 'function') questXp(kind === 'speech' ? 35 : 25);
      if (fint('p15s_dis') === 1 && typeof journal === 'function') journal('side', TX.serm.breakJournal);
    } catch (e) { warn('break', e); }
    say(kind === 'speech' ? TX.serm.spoke : TX.serm.brokeNoise, 'good', 8000);
    if (kind !== 'speech') chargeDisruption(witness);
    try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.ui) Audio_.sfx.ui(); } catch (e) { /* mute is fine */ }
    syncCurrent();
    return true;
  }
  // a proctor on the steps or a constable in the square, with clear sight of you
  function disruptionWitness() {
    if (!hasG() || !Array.isArray(G.ents) || typeof los !== 'function') return null;
    const cx = camX(), cy = camY();
    return G.ents.find((e) => e && !e.dead && !e.hidden && !(e.stun > 0) &&
      (e.lawGuard || e._p15watch) &&
      (e.x - cx) * (e.x - cx) + (e.y - cy) * (e.y - cy) < 100 && los(e.x, e.y, cx, cy)) || null;
  }
  function chargeDisruption(witness) {
    try {
      if (typeof lawActive !== 'function' || !lawActive() || typeof reportCrime !== 'function') return;
      if (!(witness || disruptionWitness())) return;
      reportCrime(TX.serm.crime, 25);
    } catch (e) { warn('charge', e); }
  }
  function speechOdds() {
    const p = hasG() ? G.player : null;
    if (!p) return 0.3;
    const per = num(p.attrs && p.attrs.Personality, 0, 100, 40);
    const law = num(p.skills && p.skills['Law-Song'], 0, 100, 15);
    return clamp15(0.2 + (per - 40) / 120 + law / 400, 0.1, 0.9);
  }
  function speakAgainst() {
    if (!sermonLive() || serm.spoke) return false;
    serm.spoke = true;
    if (Math.random() < speechOdds()) return breakReading('speech');
    try {
      if (typeof changeRep === 'function') changeRep('synod', -2);
      if (typeof addNoise === 'function') addNoise(3);
    } catch (e) { warn('speak', e); }
    say(TX.serm.spokeFail, 'bad', 6500);
    return false;
  }

  function tickSermon() {
    if (!cfg.sermons || !playing()) return;
    syncSermonDay();
    if (!sermonRunning()) return;
    if (!inOak()) return;
    if (!serm.said && sermonLive()) { serm.said = true; say(TX.serm.gather, 'warn', 7000); }
    if (!sermonLive()) return;
    const b = sermonBeat();
    if (b <= serm.beat) return;
    serm.beat = b;
    const heardIt = near(STEPS.x, STEPS.y, EAR);
    if (heardIt) {
      say(TX.serm.beats[b], 'voice', 7000);
      try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.voice) Audio_.sfx.voice(); } catch (e) { /* mute is fine */ }
    }
    if (near(STEPS.x, STEPS.y, NEAR)) serm.heard++;
    if (b === BEATS - 1 && serm.heard >= 3) attendReading();
  }

  // ================================================================ 2. the eclipse
  // the moon's own eight-day round (js/calendar11.js): index (day + 3) % 8, 0 = new moon.
  const moonIdx = (d) => ((d == null ? dayNow() : d) + 3) % 8;
  const eclipseDay = (d) => { d = d == null ? dayNow() : d; return d >= 1 && moonIdx(d) === 0 && Math.floor((d + 3) / 8) % 5 === 2; };
  function nextEclipse(from) { from = from == null ? dayNow() : from; for (let d = from; d < from + 400; d++) if (eclipseDay(d)) return d; return -1; }
  const ECL = { t0: 15.58, t1: 16.10, t2: 16.44, t3: 16.96 };   // first contact, totality, last contact
  // 0 .. 1: how much of the sun is taken, by the clock. Always 0 off the eclipse day or with the switch off.
  function eclipseCover(h, d) {
    if (!cfg.eclipse || !eclipseDay(d)) return 0;
    h = h == null ? hourNow() : h;
    if (h <= ECL.t0 || h >= ECL.t3) return 0;
    if (h < ECL.t1) return (h - ECL.t0) / (ECL.t1 - ECL.t0);
    if (h <= ECL.t2) return 1;
    return (ECL.t3 - h) / (ECL.t3 - ECL.t2);
  }
  const eclipseTotal = () => eclipseCover() >= 0.999;
  const ecl = { said: 0, day: -1, eveSaid: -1 };   // live only: which lines have been said today
  function tickEclipse(dt) {
    if (!cfg.eclipse || !playing()) return;
    const d = dayNow(), c = eclipseCover();
    if (ecl.day !== d) { ecl.day = d; ecl.said = 0; }
    // the almanac: the evening before, and at dawn on the day
    const h = hourNow();
    if (eclipseDay(d + 1) && h >= 19 && ecl.eveSaid !== d) { ecl.eveSaid = d; say(TX.ecl.almanacEve, 'warn', 9000); }
    if (eclipseDay(d) && h >= 6 && h < ECL.t0 && ecl.said === 0) { ecl.said = 1; say(TX.ecl.almanacDawn, 'warn', 8000); }
    if (c <= 0) return;
    const outdoor = !!(G.map && G.map.outdoor);
    if (c > 0.08 && ecl.said < 2) { ecl.said = 2; say(outdoor ? TX.ecl.start : TX.ecl.indoors, 'warn', 7000); }
    if (c >= 0.999 && ecl.said < 3) {
      ecl.said = 3;
      say(outdoor ? TX.ecl.total : TX.ecl.indoors, 'bad', 9000);
      if (outdoor) setTimeout(() => { if (eclipseTotal()) say(TX.ecl.folk, '', 6000); }, 3200);
      if (fint('p15s_eday') !== d + 1) {
        fset('p15s_eday', d + 1, 99999);
        fset('p15s_ecl', fint('p15s_ecl') + 1, 999);
        try { if (fint('p15s_ecl') === 1 && typeof journal === 'function') journal('side', TX.ecl.journal); } catch (e) { warn('ecljournal', e); }
      }
      try { if (typeof DREAD !== 'undefined' && DREAD.addDissonance) DREAD.addDissonance(1.5); } catch (e) { /* the meter may be off */ }
    }
    if (c < 0.08 && ecl.said === 3) { ecl.said = 4; say(TX.ecl.end, 'warn', 6000); }
    // people stop and look up while the light is going
    if (c > 0.35) stillFolk();
  }
  function stillFolk() {
    if (!Array.isArray(G.ents)) return;
    for (const e of G.ents) {
      if (!e || e.kind !== 'npc' || e.dead || e.hidden || e.companion) continue;
      if (e._p15eW === undefined) e._p15eW = e.wanderT;
      e.wanderT = 1e9; e.moving = false;
    }
  }
  function releaseFolk() {
    if (!Array.isArray(G.ents)) return;
    for (const e of G.ents) if (e && e._p15eW !== undefined) { if (e.kind === 'npc' && !e.dead) e.wanderT = 0; delete e._p15eW; }
  }

  // the sun's own geometry, repeated from js/engine.js ("sun and moon") so the disc lands where it was drawn
  function skyHook(F) {
    const c = eclipseCover();
    stats.coverPx = 0;
    if (c <= 0 || !F || !F.outdoor || !F.fb) return;
    const { fb, w, h, horizon, dirX, dirY, planeX, planeY } = F;
    const sunA = (F.tod - 0.25) * Math.PI * 2;
    const elev = Math.cos((F.tod - 0.5) * Math.PI * 2);
    if (elev < 0.02) return;                                  // after sunset there is nothing to cover
    const bodyEl = Math.min(0.95, elev);
    const bodyCY = Math.max(2, Math.min(horizon - 1, horizon - bodyEl * h * 0.58));
    const rDisc = Math.max(2.5, h * 0.05), rAng = rDisc / (w * 0.55);
    // the moon walks on from the west: one disc-width at first contact, dead centre at totality
    const off = (1 - c) * rAng * 2.05;
    const corona = c >= 0.999 && !reduced() && !(typeof GFX !== 'undefined' && GFX.preset === 'original');
    for (let x = 0; x < w; x++) {
      const cx2 = 2 * x / w - 1;
      const ang = Math.atan2(dirY + planeY * cx2, dirX + planeX * cx2);
      let da = ang - (sunA + off); while (da > Math.PI) da -= Math.PI * 2; while (da < -Math.PI) da += Math.PI * 2;
      if (Math.abs(da) > rAng * 1.5) continue;
      const dx = da / rAng;
      for (let y = 0; y < horizon; y++) {
        const dy = (y - bodyCY) / rDisc, dd = Math.sqrt(dx * dx + dy * dy);
        if (dd > 1.32) continue;
        const i = y * w + x, px = fb[i];
        let r = px & 255, g = (px >> 8) & 255, b = (px >> 16) & 255;
        if (dd <= 1) {
          const k = 0.1;                                       // the moon's unlit disc
          r = (r * k) | 0; g = (g * k) | 0; b = (b * k) | 0;
          stats.coverPx++;
          if (corona && dd > 0.9) { r = Math.min(255, r + 120); g = Math.min(255, g + 128); b = Math.min(255, b + 150); }
        } else if (corona) {
          const a = (1.32 - dd) / 0.32 * 0.55;
          r = Math.min(255, r + (150 * a) | 0); g = Math.min(255, g + (158 * a) | 0); b = Math.min(255, b + (186 * a) | 0);
        } else continue;
        fb[i] = (255 << 24) | (b << 16) | (g << 8) | r;
      }
    }
  }
  // the light goes out of the world, outdoors only: a straight multiply plus a cold shift, never a brightening
  function postHook(F) {
    const c = eclipseCover();
    stats.dim = 0;
    if (c <= 0 || !F || !F.outdoor || !F.fb) return;
    const k = 1 - 0.68 * c * c;                                // totality keeps about a third of the light
    stats.dim = 1 - k;
    const { fb, w, h } = F, n = w * h;
    const kr = Math.round(k * 240), kg = Math.round(k * 248), kb = Math.round(k * 272);   // the shadow runs blue
    for (let i = 0; i < n; i++) {
      const px = fb[i];
      const r = ((px & 255) * kr) >> 8, g = (((px >> 8) & 255) * kg) >> 8, b = (((px >> 16) & 255) * kb) >> 8;
      fb[i] = (px & -16777216) | (Math.min(255, b) << 16) | (Math.min(255, g) << 8) | Math.min(255, r);
    }
  }
  const stats = { coverPx: 0, dim: 0 };

  // ================================================================ 3. Synod territory
  // rect fractions of each region painting (js/travel.js TRAVEL_REGIONS), with the stage they appear at
  const ZONES = {
    reach: [
      { id: 'road', stage: 1, name: TX.terr.names.road, r: [0.56, 0.60, 0.97, 0.82] },
      { id: 'square', stage: 2, name: TX.terr.names.square, r: [0.44, 0.50, 0.74, 0.72] },
      { id: 'quarry', stage: 3, name: TX.terr.names.quarry, r: [0.60, 0.13, 0.82, 0.33] },
      { id: 'outside', stage: 3, name: TX.terr.names.outside, r: [0.36, 0.33, 0.70, 0.52] },
    ],
    woods: [
      { id: 'drowned', stage: 4, name: TX.terr.names.drowned, r: [0.12, 0.58, 0.42, 0.86] },
      { id: 'maus', stage: 5, name: TX.terr.names.maus, r: [0.68, 0.03, 0.99, 0.36] },
    ],
  };
  function stageDerived() {
    const f = flags();
    if (f.part4) return 5;
    if (f.part3) return 4;
    if (f.greening || f.escaped) return 3;
    if (f.rite_started) return 2;
    if (f.rite_ready) return 1;
    return 0;
  }
  // The stage is read from the story flags, never from the save: an imported save cannot show Part Four's
  // territory in Part One. The flag keeps the high-water mark as a record (the story's own flags only ever
  // go forward, so the mark and the derived stage agree in any real run).
  function stageNow() {
    if (!cfg.territory) return 0;
    const st = stageDerived();
    if (st > fint('p15s_terr', 5)) fset('p15s_terr', st, 5);
    return st;
  }
  function zonesFor(region) {
    if (!cfg.territory) return [];
    const st = stageNow();
    return (ZONES[region] || []).filter((z) => z.stage <= st);
  }
  function territoryAt(region, fx, fy) {
    for (const z of zonesFor(region)) if (fx >= z.r[0] && fx <= z.r[2] && fy >= z.r[1] && fy <= z.r[3]) return z;
    return null;
  }
  function territoryLine(region) {
    const zs = zonesFor(region);
    if (!zs.length) return TX.terr.none;
    return TX.terr.line.replace('{0}', zs.map((z) => z.name).join(', '));
  }
  // a violet wash and a hatch over the painting, after the marks: light enough to read a gold mark through
  function drawZones() {
    if (!cfg.territory || typeof TRAVEL === 'undefined' || TRAVEL.view !== 'region') return;
    const cv = document.getElementById('tvmap'); if (!cv) return;
    const zs = zonesFor(TRAVEL.region); if (!zs.length) return;
    const x = cv.getContext('2d'), W = cv.width, H = cv.height;
    const u = Math.max(1, 0.62 * W / Math.max(1, cv.getBoundingClientRect().width || W));
    x.save();
    for (const z of zs) {
      const x0 = z.r[0] * W, y0 = z.r[1] * H, x1 = z.r[2] * W, y1 = z.r[3] * H;
      x.fillStyle = 'rgba(118,78,150,.17)'; x.fillRect(x0, y0, x1 - x0, y1 - y0);
      x.strokeStyle = 'rgba(190,150,220,.55)'; x.lineWidth = 2 * u; x.setLineDash([9 * u, 7 * u]);
      x.strokeRect(x0, y0, x1 - x0, y1 - y0); x.setLineDash([]);
      // the hatch: diagonals clipped to the zone, so the rule of the folder shows through the wash
      x.save();
      x.beginPath(); x.rect(x0, y0, x1 - x0, y1 - y0); x.clip();
      x.strokeStyle = 'rgba(150,110,185,.30)'; x.lineWidth = 1.4 * u;
      x.beginPath();
      const h = y1 - y0;
      for (let s = -h; s < x1 - x0; s += 16 * u) { x.moveTo(x0 + s, y1); x.lineTo(x0 + s + h, y0); }
      x.stroke();
      x.restore();
    }
    x.restore();
  }

  // ================================================================ 4. the reprisal
  const SHED = { x0: 4, y0: 14, x1: 6, y1: 19, door: [6, 16] };
  const FIRES = [[4.6, 15.1], [5.4, 17.3], [4.7, 18.6]];
  const WATCHERS = [[8.3, 14.9, 'townsman'], [8.5, 16.4, 'townswoman'], [8.2, 18.1, 'townsman']];
  const COOPER_AT = [7.9, 16.5];
  const fireDay = () => fint('p15s_fire', 99999) - 1;
  const fireArmed = () => fint('p15s_fire', 99999) > 0;
  function reprisalStage() {
    if (!cfg.reprisal || !fireArmed()) return 'none';
    const since = dayNow() - fireDay();
    if (since <= 0) return 'burning';
    if (since <= 2) return 'ruin';
    if (since <= 5) return 'works';
    return 'rebuilt';
  }
  function armReprisal() {
    if (!cfg.reprisal || !hasG() || fireArmed()) return false;
    if (!flags().rite_ready || !oakOpen()) return false;
    fset('p15s_fire', dayNow() + 1, 99999);
    if (!(fint('p15s_lost', 255) & 1)) {
      fset('p15s_lost', fint('p15s_lost', 255) | 1, 255);
      try {
        if (Array.isArray(G.ledger)) G.ledger.push({ name: TX.rep.cooperName, where: 'the cooper\'s shed, Oakhaven', day: dayNow() });
        if (typeof journal === 'function') journal('side', TX.rep.deathJournal);
      } catch (e) { warn('arm', e); }
    }
    return true;
  }
  const cooperDead = () => (fint('p15s_lost', 255) & 1) === 1;
  function sayReprisal(mapId) {
    if (!cfg.reprisal || mapId !== 'oakhaven') return;
    const st = reprisalStage();
    if (st === 'none') return;
    const key = 'r' + st + ':' + dayNow();
    if (said[key]) return; said[key] = true;
    const lines = st === 'burning' ? [[TX.rep.fire, 'bad'], [TX.rep.fireWhy, 'warn'], [TX.rep.death, 'bad']]
      : st === 'ruin' ? [[TX.rep.ruin, 'warn']] : st === 'works' ? [[TX.rep.works, '']] : [[TX.rep.rebuilt, 'good']];
    lines.forEach(([t, c], i) => setTimeout(() => say(t, c, 8000), 2200 + i * 2600));
  }
  const said = {};
  // the door's own label follows the stage; the original is kept and put back when the switch goes off
  function syncShedDoor(m) {
    if (!m || m.id !== 'oakhaven' || !Array.isArray(m.cells)) return;
    const c = m.cells[SHED.door[1] * m.w + SHED.door[0]];
    if (!c || !c.door) return;
    if (c._p15sLabel === undefined) { c._p15sLabel = c.label; c._p15sMsg = c.lockMsg; }
    const st = reprisalStage();
    const txt = st === 'burning' ? TX.rep.doorBurning : st === 'ruin' ? TX.rep.doorRuin : st === 'works' ? TX.rep.doorWorks : st === 'rebuilt' ? TX.rep.doorRebuilt : null;
    if (txt) { c.label = txt; c.lockMsg = txt; } else { c.label = c._p15sLabel; c.lockMsg = c._p15sMsg; }
  }
  function openRoll() {
    if (typeof showEvent !== 'function') return;
    const lost = fint('p15s_lost', 255);
    const rows = lost & 1 ? '<p>' + TX.rep.rollEntry + '</p>' : '<p class="muted">' + TX.rep.rollNone + '</p>';
    showEvent(TX.rep.rollTitle, '<p>' + TX.rep.rollIntro + '</p>' + rows, [{ t: TX.rep.rollClose, f: null }]);
  }
  function openNotice() {
    if (typeof showEvent !== 'function') return;
    showEvent(TX.rep.noticeTitle, TX.rep.noticeBody, [{ t: TX.rep.rollClose, f: null }]);
  }

  // ================================================================ people and props
  function registerNpcs() {
    if (typeof NPCS === 'undefined') return;
    if (!NPCS.p15_herald) {
      NPCS.p15_herald = {
        name: TX.serm.heraldName, sprite: 'herald', portrait: 'herald', tier: 'high',
        greet: { polite: TX.serm.heraldPolite, normal: TX.serm.heraldGreet, blunt: TX.serm.heraldBlunt },
        topics: { 'The Reading': TX.serm.heraldTopic }, quest: () => null,
      };
    }
    if (!NPCS.p15_cooper) {
      NPCS.p15_cooper = {
        name: TX.rep.cooperName, sprite: 'townsman', portrait: 'townsman', tier: 'low',
        greet: { polite: TX.rep.cooperPolite, normal: TX.rep.cooperGreet, blunt: TX.rep.cooperBlunt },
        topics: { 'The Hedge': TX.rep.cooperTopic }, quest: () => null,
      };
    }
    if (!NPCS.p15_widow) {
      NPCS.p15_widow = {
        name: TX.rep.widowName, sprite: 'townswoman', portrait: 'townswoman', tier: 'low',
        greet: { polite: TX.rep.widowPolite, normal: TX.rep.widowGreet, blunt: TX.rep.widowBlunt },
        topics: { 'The Reading': TX.rep.widowTopic }, quest: () => null,
      };
    }
    if (!NPCS.p15_listener) {
      NPCS.p15_listener = {
        name: TX.serm.listener, sprite: 'townsman', portrait: 'townsman', tier: 'low',
        greet: { polite: S('Not now. Afterwards, maybe, if there is an afterwards to this.'), normal: S('Shh. Four more and we can all go back to work.'), blunt: S('Do not make them look over here.') },
        topics: {}, quest: () => null,
      };
    }
  }
  const deco = (o) => Object.assign({ kind: 'deco', solid: false, radius: 0.1, nopick: true, transient: true, _decor: true }, o);
  const npc = (o) => Object.assign({ kind: 'npc', scale: 1, solid: true, radius: 0.35, transient: true, _decor: true }, o);
  // a proctor standing watch: passive exactly as the chapel's own legionnaires are, so nothing attacks on sight
  const still = (o) => Object.assign({ kind: 'enemy', passive: true, transient: true, _decor: true, _p15watch: true }, o);

  function oakSpecs() {
    const L = [], add = (key, when, make, upd) => L.push({ key, when, make, upd });
    // ---- the reading on the chapel steps
    const reading = () => sermonLive();
    add('herald', reading, () => npc({ id: 'p15_herald', sprite: 'herald', x: STEPS.x, y: STEPS.y, facing: Math.PI / 2 }));
    PROCTORS.forEach(([x, y], i) => add('proctor' + i, reading, () => still({ type: 'proctor', x, y, facing: Math.PI / 2 })));
    PEWS.forEach(([x, y], i) => add('pew' + i, reading, () => npc({ id: 'p15_listener', sprite: i % 2 ? 'townswoman' : 'townsman', x, y, facing: -Math.PI / 2 })));
    // ---- the cooper, while he is alive and at his bench by day
    const cooperUp = () => cfg.reprisal && oakOpen() && !fireArmed() && !cooperDead() && hourNow() >= 7 && hourNow() < 19;
    add('cooper', cooperUp, () => npc({ id: 'p15_cooper', sprite: 'townsman', x: COOPER_AT[0], y: COOPER_AT[1], facing: Math.PI }));
    // ---- the fire, the ruin, the works, the rebuilt shed
    const stageIs = (s) => () => cfg.reprisal && oakOpen() && reprisalStage() === s;
    FIRES.forEach(([x, y], i) => add('fire' + i, stageIs('burning'), () => deco({ sprite: 'campfire', x, y, scale: 0.8, glow: 1, lightCol: [92, 44, 12], label: TX.rep.doorBurning, _fs: 'campfire' })));
    WATCHERS.forEach(([x, y, spr], i) => add('watch' + i, stageIs('burning'), () => npc({ id: spr, sprite: spr, x, y, facing: Math.PI })));
    add('fireproctor', stageIs('burning'), () => still({ type: 'proctor', x: 8.9, y: 17.3, facing: Math.PI }));
    add('smoulder', stageIs('ruin'), () => deco({ sprite: 'brazier', x: 5.0, y: 16.7, scale: 0.5, glow: 0.3, lightCol: [70, 34, 10], label: TX.rep.doorRuin, _fs: 'brazier' }));
    add('charred', stageIs('ruin'), () => deco({ sprite: 'crates', x: 7.2, y: 15.4, scale: 0.5, label: TX.rep.doorRuin }));
    add('hoard', stageIs('works'), () => deco({ sprite: 'crates', x: 7.1, y: 17.6, scale: 0.55, label: TX.rep.doorWorks }));
    add('trestle', stageIs('works'), () => deco({ sprite: 'table', x: 7.3, y: 15.2, scale: 0.6, solid: true, radius: 0.4, nopick: false, label: TX.rep.doorWorks }));
    add('notice', () => cfg.reprisal && oakOpen() && (reprisalStage() === 'works' || reprisalStage() === 'rebuilt'),
      () => deco({ sprite: 'sign', x: 7.6, y: 16.5, scale: 0.85, solid: true, radius: 0.2, nopick: false, use: 'p15s_notice', label: TX.rep.notice }));
    const dayWork = () => cfg.reprisal && oakOpen() && reprisalStage() === 'works' && hourNow() >= 7 && hourNow() < 19;
    [[6.9, 14.6, 'townsman'], [6.9, 18.4, 'townswoman']].forEach(([x, y, spr], i) => add('wright' + i, dayWork, () => npc({ id: spr, sprite: spr, x, y, facing: Math.PI })));
    const widowUp = () => cfg.reprisal && oakOpen() && reprisalStage() === 'rebuilt' && hourNow() >= 8 && hourNow() < 20;
    add('widow', widowUp, () => npc({ id: 'p15_widow', sprite: 'townswoman', x: 7.7, y: 17.4, facing: Math.PI }));
    return L;
  }
  function chapelSpecs() {
    const L = [];
    L.push({
      key: 'roll',
      when: () => cfg.reprisal && fireArmed(),
      make: () => deco({ sprite: 'shelf', x: 11.4, y: 10.3, scale: 0.8, solid: true, radius: 0.2, nopick: false, use: 'p15s_roll', label: TX.rep.rollLabel }),
    });
    return L;
  }
  const SPECS = {};
  function specsFor(m) {
    if (!m) return [];
    if (m.id === 'oakhaven') return SPECS.oak || (SPECS.oak = oakSpecs());
    if (m.id === 'chapel') return SPECS.chapel || (SPECS.chapel = chapelSpecs());
    return [];
  }
  function removeMine(m, key) { for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._p15s === key) m.entities.splice(i, 1); } }
  function removeAll(m) { for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._p15s) m.entities.splice(i, 1); } }
  // idempotent: put this map's props and people where the flags and the clock say
  function ensureMap(m) {
    if (!m || !Array.isArray(m.entities)) return;
    syncShedDoor(m);
    const list = specsFor(m);
    if (!list.length) { removeAll(m); return; }
    for (const sp of list) {
      let want = false;
      try { want = !!sp.when(); } catch (e) { want = false; }
      const have = m.entities.find((e) => e && e._p15s === sp.key);
      if (!want) { if (have) removeMine(m, sp.key); continue; }
      let e = have;
      if (!e) {
        e = Object.assign(sp.make(), { _p15s: sp.key });
        if (typeof hydrate === 'function') hydrate(e);
        if (e.kind === 'npc') { e.wanderT = 1e9; if (e.facing != null) e.dir = e.facing; }
        if (e.kind === 'enemy') { e.state = 'passive'; e.wanderT = 1e9; if (e.facing != null) e.dir = e.facing; }
        m.entities.push(e);
      }
      if (sp.upd) sp.upd(e);
    }
  }
  function syncCurrent() { try { if (hasG() && G.map) ensureMap(G.map); } catch (e) { warn('sync', e); } }
  function syncAll() {
    try {
      if (!hasG() || !G.maps) return;
      for (const id of ['oakhaven', 'chapel']) if (G.maps[id]) ensureMap(G.maps[id]);
    } catch (e) { warn('syncAll', e); }
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
    const btns = document.querySelector('#modal-panel .dlg .btns'); if (!btns) return;
    if (DLG.npc !== NPCS.p15_herald || !sermonLive() || serm.spoke) return;
    if (btns.querySelector('#d-p15-speak')) return;
    const b = el('button', { class: 'dfbtn small', id: 'd-p15-speak', type: 'button' }, TX.serm.button);
    b.onclick = () => {
      try { if (typeof closeModal === 'function') closeModal(); G.state = 'play'; G.keys = {}; speakAgainst(); } catch (e) { warn('speak-btn', e); }
    };
    btns.insertBefore(b, btns.querySelector('#d-bye') || null);
  }
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('p15s-sermons')) return;
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
        if (!cfg[key]) releaseFolk();
        syncAll();
      };
      grid.appendChild(b);
    };
    row('p15s-sermons', 'sermons', TX.opts.sermons, TX.opts.sermonsHint);
    row('p15s-eclipse', 'eclipse', TX.opts.eclipse, TX.opts.eclipseHint);
    row('p15s-territory', 'territory', TX.opts.territory, TX.opts.territoryHint);
    row('p15s-reprisal', 'reprisal', TX.opts.reprisal, TX.opts.reprisalHint);
  }

  // ================================================================ install
  function install() {
    loadCfg();
    registerNpcs();
    if (typeof Engine !== 'undefined' && Engine.addSkyHook) Engine.addSkyHook((F) => { try { skyHook(F); } catch (e) { warn('sky', e); } }, 6);
    if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook((F) => { try { postHook(F); } catch (e) { warn('post', e); } }, 60);

    if (typeof loadMap === 'function') {
      const _load = loadMap;
      loadMap = function (id) {
        try { if (id === 'oakhaven') armReprisal(); if (G.maps && G.maps[id]) ensureMap(G.maps[id]); } catch (e) { warn('pre-load', e); }
        const r = _load.apply(this, arguments);
        try { releaseFolk(); syncCurrent(); sayReprisal(id); } catch (e) { warn('post-load', e); }
        return r;
      };
    }
    if (typeof restoreGame === 'function') {
      const _restore = restoreGame;
      restoreGame = function () {
        const r = _restore.apply(this, arguments);
        try { resetSermonDay(); ecl.day = -1; ecl.said = 0; syncAll(); } catch (e) { warn('restore', e); }
        return r;
      };
    }
    if (typeof update === 'function') {
      const _up = update;
      let acc = 0;
      update = function (dt) {
        const r = _up.apply(this, arguments);
        try {
          const d = Math.min(0.1, dt);
          tickSermon(); tickEclipse(d);
          if (!eclipseCover()) releaseFolk();
          acc += dt; if (acc >= 0.4) { acc = 0; syncCurrent(); }
        } catch (e) { warn('tick', e); }
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
    // a Song on the chapel steps breaks the reading
    if (typeof castSong === 'function') {
      const _cast = castSong;
      castSong = function () {
        let w = null, loud = false;
        try { loud = sermonLive() && inOak() && near(STEPS.x, STEPS.y, 10); if (loud) w = disruptionWitness(); } catch (e) { loud = false; }
        const r = _cast.apply(this, arguments);
        try { if (loud && sermonLive()) breakReading('noise', w); } catch (e) { warn('song', e); }
        return r;
      };
    }
    // so does a stone or a bottle landing in the crowd. The throw, not the aiming ray: distractionImpact()
    // is also used read-only for previews (js/kit12.js, js/ripples.js) and must stay without side effects.
    if (typeof throwDistraction === 'function') {
      const _throw = throwDistraction;
      throwDistraction = function (id) {
        let pt = null, w = null;
        try {
          if (sermonLive() && inOak() && typeof distractionImpact === 'function') { pt = distractionImpact(id); w = disruptionWitness(); }
        } catch (e) { pt = null; }
        const r = _throw.apply(this, arguments);
        try {
          if (r === true && pt && Number.isFinite(pt.x) && sermonLive() && inOak() &&
            (pt.x - STEPS.x) * (pt.x - STEPS.x) + (pt.y - STEPS.y) * (pt.y - STEPS.y) < CROWD_R * CROWD_R) breakReading('noise', w);
        } catch (e) { warn('throw', e); }
        return r;
      };
    }
    // the hounds are as bold in a daytime dark as on a moonless night
    if (typeof spawnHound === 'function') {
      const _sh = spawnHound;
      spawnHound = function () {
        const r = _sh.apply(this, arguments);
        try { if (eclipseCover() > 0.5 && Math.random() < 0.25) setTimeout(_sh, 2600); } catch (e) { warn('hound', e); }
        return r;
      };
    }
    if (typeof useDeco === 'function') {
      const _use = useDeco;
      useDeco = function (e) {
        try {
          if (e && e.use === 'p15s_roll') { openRoll(); return; }        // showEvent sets the state itself
          if (e && e.use === 'p15s_notice') { openNotice(); return; }
        } catch (err) { warn('use', err); }
        return _use.apply(this, arguments);
      };
    }
    // ---- the world map
    if (typeof travelDraw === 'function') {
      const _draw = travelDraw;
      travelDraw = function () { const r = _draw.apply(this, arguments); try { drawZones(); } catch (e) { warn('zones', e); } return r; };
    }
    if (typeof travelRender === 'function') {
      const _rend = travelRender;
      travelRender = function () {
        const r = _rend.apply(this, arguments);
        try {
          if (!cfg.territory || TRAVEL.view !== 'region' || !zonesFor(TRAVEL.region).length) return r;
          const lg = document.querySelector('#modal-panel .tv-legend');
          if (lg && !lg.querySelector('.p15s-sw')) {
            lg.appendChild(document.createTextNode('   '));
            const i = el('i', { class: 'tv-sw p15s-sw' }); i.style.cssText = 'background:rgba(118,78,150,.6);border-color:#b092d0';
            lg.appendChild(i); lg.appendChild(document.createTextNode(' ' + TX.terr.legend));
          }
        } catch (e) { warn('legend', e); }
        return r;
      };
    }
    if (typeof travelInfo === 'function') {
      const _info = travelInfo;
      travelInfo = function (item, sticky) {
        const r = _info.apply(this, arguments);
        try {
          if (!cfg.territory || TRAVEL.view !== 'region') return r;
          const el2 = document.getElementById('tvinfo'); if (!el2) return r;
          const h = item || TRAVEL.hover;
          const z = h && Number.isFinite(h.fx) ? territoryAt(TRAVEL.region, h.fx, h.fy) : null;
          const line = z ? TX.terr.line.replace('{0}', z.name) : territoryLine(TRAVEL.region);
          const p = el('p', { class: 'muted p15s-info' }, line);
          const old = el2.querySelector('.p15s-info'); if (old) old.remove();
          el2.appendChild(p);
        } catch (e) { warn('info', e); }
        return r;
      };
    }
    if (typeof travelConfirm === 'function') {
      const _conf = travelConfirm;
      travelConfirm = function (d) {
        const r = _conf.apply(this, arguments);
        try {
          if (!cfg.territory || !d || !territoryAt(TRAVEL.region, d.fx, d.fy)) return r;
          const box = document.getElementById('tvconfirm'); if (!box) return r;
          if (box.querySelector('.p15s-warn')) return r;
          box.insertBefore(el('p', { class: 'muted p15s-warn' }, TX.terr.travel), box.firstChild ? box.firstChild.nextSibling : null);
        } catch (e) { warn('confirm', e); }
        return r;
      };
    }
    if (typeof travelRisk === 'function') {
      const _risk = travelRisk;
      travelRisk = function (d, mins) {
        const base = _risk.apply(this, arguments);
        try {
          if (!cfg.territory || !d || !base) return base;
          return territoryAt(TRAVEL.region, d.fx, d.fy) ? Math.min(0.9, base + 0.06) : base;
        } catch (e) { warn('risk', e); return base; }
      };
    }
    if (hasG()) { try { syncAll(); } catch (e) { /* nothing built yet */ } }
  }
  try { install(); } catch (e) { console.warn('synod15: install failed', e); }

  return {
    TX, LIST, cfg, saveCfg, loadCfg, stats,
    // the reading
    SERM_DAY, SERM_FROM, SERM_TO, BEATS, STEPS, sermonDay, sermonRunning, sermonLive, sermonBeat,
    attendReading, breakReading, speakAgainst, speechOdds, disruptionWitness, get reading() { return serm; },
    // the eclipse
    ECL, moonIdx, eclipseDay, eclipseCover, eclipseTotal, nextEclipse, skyHook, postHook, releaseFolk,
    // territory
    ZONES, stageDerived, stageNow, zonesFor, territoryAt, territoryLine, drawZones,
    // the reprisal
    SHED, reprisalStage, armReprisal, fireArmed, fireDay, cooperDead, openRoll, openNotice, syncShedDoor,
    // staging
    ensureMap, syncCurrent, syncAll, specsFor, appendRows, addDialogueButtons,
  };
})();
if (typeof window !== 'undefined') window.SYNOD15 = SYNOD15;
