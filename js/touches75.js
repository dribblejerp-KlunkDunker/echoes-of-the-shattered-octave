// ============================================================
//  touches75 — Small canon touches III (ROADMAP R9 #25, the third batch: c, d, e, f; Story Brainstorm §3 #25).
//
//  Four more small things the manuscript states outright. Each needed a small design decision, marked [PROPOSED]:
//    c  THE PURE NOTE AS A LID (Book One ch. 9, l. 2850). js/church55.js holds the note over Oakhaven from the Church's
//       coming until the Rite. This adds the town's response, in the book's days: on the second day "nobody was
//       sleeping"; by the third, wet cloth on the windows, wool in ears, and "children were crying in the lanes for no
//       reason they could name". Said once a day, in the town, while the note holds. And rests in Oakhaven and its rooms
//       (LAW_MAPS, and the bed in your own house on Cooper's Row, js/upgrades.js) are shorter under it: "It was not a loud
//       sound. It was worse than loud. It was a lid." [PROPOSED] Half the hours, and half of what the rest gives back
//       (health, voice, fatigue, sleep, hunger; night13's way of shortening a rest); from the first night of the note;
//       never outside the Hedge, nor once the Rite has begun or the Greening runs. A shorter rest only passes less time,
//       so no quest's day can be skipped by it.
//    d  EVERY MENDING BORROWS (ch. 1, ll. 396–402; ch. 3, l. 1089). After a large tending note (sung, or hummed into the
//       jar) a Cantor-calling player finds a root-hair in the crease of the right palm, pulls it, and the blood is very
//       slightly green. A message only. [PROPOSED] Large is ten health or more mended at once; at most once a game day.
//    e  THE PALM HELD FLAT (ch. 1, l. 258). "The way everyone in Oakhaven measured sound now (a hand's width of voice, no
//       more)". Inside the Hedge, when you are loud but not yet over js/narrow28.js's breach, a townsperson who can see
//       you lifts a hand toward you, palm flat. The ward-sign still comes at the breach. [PROPOSED] From noise 5 (the
//       HUD's LOUD) to the breach (6.5); narrow28's own witness; not in the Boar (narrow28 leaves it its own rules); at
//       most once a minute of play.
//    f  THE CANTOR'S CLAY JAR (ch. 1, ll. 248–250; ch. 6, l. 1937). A Cantor-calling player carries one (given once,
//       old saves included). Use it to hum the tending note into your own body, as Lyra tests herself at dawn with the
//       jar to her throat: the song itself (castSong, so every rule on songs still holds), but quieter and mending more.
//       [PROPOSED] The numbers: the same 8 voice; noise 0.9 (the murmur's) against the sung note's 1.8; mends 20 against
//       14; and not while anything is hunting you, since the jar wants a still body.
//  Nothing here gates a quest; missing any of it changes nothing. Nothing is voiced: no book character speaks these lines.
//  Flags: p75_lid (the day the note began), p75_said (the day the town's line was said), p75_hair (the day of the last
//  root-hair), p75_jar (the jar was given). An old save lacks them and simply starts them.
// ============================================================
'use strict';

const TOUCHES75 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const inExtra = () => { try { return typeof EXTRAS17 !== 'undefined' && !!EXTRAS17.inExtra(); } catch (e) { return false; } };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('touches75: ' + k + ' failed', e); } };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };
  const cantor = () => !!(G.player.cls && G.player.cls.id === 'cantor');
  const day = () => Number(G.day) || 0;

  const CHURCH_DAY = 5;                 // js/days35.js: the Church comes at sunrise on Dawnday (game day 5)
  const REST_FRAC = 0.5;                // c [PROPOSED]
  const HAIR_AT = 10;                   // d [PROPOSED]
  const PALM_AT = 5, PALM_EVERY = 60;   // e [PROPOSED]
  const JAR = { noise: 0.9, heal: 20, huntedR: 10 };   // f [PROPOSED]; the sung note: 8 voice, noise 1.8, mends 14 (js/data.js)
  const SUNG = 'You sing the tending note, low. Something knits.', SUNG_HEAL = 14;   // js/game.js castSong

  const TX = {
    // c · the lid (ch. 9, l. 2850)
    noSleep: S('Over the rooftops, day and night, the Pure Note goes on: thirty voices in the Chapel passing one note between them, breath by breath, forever. By the second day nobody is sleeping.'),
    wet: S('Over the rooftops the Pure Note goes on. People have begun to plaster their windows with wet cloth and stuff wool in their ears, and children are crying in the lanes for no reason they can name.'),
    lid: S('You lie awake under it. It is not a loud sound. It is worse than loud. It is a lid.'),
    short: S('You get half the rest out of it, no more.'),
    // d · every mending borrows (ch. 1, ll. 396–402)
    hair: S('Something in your right palm, like the prick of a splinter. Out of the crease of your palm, where the life-line crosses the heart-line, grows a single root-hair. White. A thumbnail long. You take it between finger and thumb and pull. It comes with a small wet tug, like a hair, and a bead of blood wells up after it, and the blood is very slightly green.'),
    borrows: S('Every mending borrows.'),
    // e · the palm held flat (ch. 1, l. 258)
    palmNamed: S('{0} lifts a hand toward you, palm flat, the way everyone in Oakhaven measures sound now. A hand\'s width of voice, no more.'),
    palmHe: S('A man near you lifts a hand toward you, palm flat, the way everyone in Oakhaven measures sound now. A hand\'s width of voice, no more.'),
    palmShe: S('A woman near you lifts a hand toward you, palm flat, the way everyone in Oakhaven measures sound now. A hand\'s width of voice, no more.'),
    // f · the clay jar (ch. 1, ll. 248–250)
    jarName: S('A Cantor\'s clay jar'),
    jarDesc: S('A clay jar with a narrow neck. A Cantor\'s trick from the orchard days, for when you want a sound to go into a body instead of into the air: the jar catches the note and gives it to the skin. Hum the tending note into it (8 voice): quieter than singing it aloud, and it mends more. Not while anything is hunting you.'),
    jarHum: S('You press the clay jar to your own throat and hum the tending note into it. Hummed into the open room, the tending note would have been a sound. Hummed into the jar, it is a warmth, a pressure, a hand laid flat where no hand can reach.'),
    jarHunted: S('Not with something hunting you. The jar wants a still body and a steady breath.'),
    jarNoNote: S('You have not the tending note to hum into it.'),
    jarBusy: S('Not yet. The jar wants a still body and a steady breath.'),
  };

  // ---------------------------------------------------------------- c · the Pure Note as a lid
  // church55's drone: from the Church's coming until the Rite (not while the town is going under)
  const noteHolds = () => { const f = F(); return !!f.church_come && !f.rite_started && !f.greening && !f.escaped && !f.part3 && !f.part4; };
  // the town and its rooms, and your own house on Cooper's Row (js/upgrades.js)
  const inTown = () => G.mapId === 'cooper_house' || (typeof LAW_MAPS !== 'undefined' && LAW_MAPS.has(G.mapId));
  // the day the note began, recorded by the tick on the day it is first held (wherever you are); an old save already
  // past it counts from Dawnday
  function markLid() {
    const f = F();
    if (typeof f.p75_lid !== 'number' && noteHolds()) f.p75_lid = Math.min(day(), CHURCH_DAY);
  }
  const noteDay = () => day() - F().p75_lid;
  function townLine() {
    if (!hasG() || guest() || inExtra() || G.state !== 'play' || G.mapId !== 'oakhaven' || !noteHolds()) return;
    markLid();
    const k = noteDay(), f = F();
    if (k < 1 || f.p75_said === day()) return;   // the first day is church55's own scene
    f.p75_said = day();
    say(k === 1 ? TX.noSleep : TX.wet, '', 8000);
  }
  const lidRest = () => hasG() && !guest() && !inExtra() && noteHolds() && inTown();
  // the rest's own words, no longer true: its count of the hours, and a deep, snoring sleep
  const DROPPED = /^You (rest four hours|sleep eight hours|sleep deeply, and snore)/;
  // doRest, or the bed in your own house: the original runs with the hours halved; what it gave back is halved too
  function restUnderLid(orig, self, args) {
    const p = G.player, b = { hp: p.hp, voice: p.voice, fat: p.fat, sleep: p.sleep, hunger: p.hunger };
    const _ph = passHours, _m = msg;
    passHours = function (h) { return _ph.call(this, h * REST_FRAC); };
    msg = function (t) { if (typeof t === 'string' && DROPPED.test(t)) return undefined; return _m.apply(this, arguments); };
    let r;
    try { r = orig.apply(self, args); } finally { passHours = _ph; msg = _m; }
    const part = (from, to, max) => Math.max(0, Math.min(max, from + (to - from) * REST_FRAC));
    p.hp = part(b.hp, p.hp, p.hpMax); p.voice = part(b.voice, p.voice, p.voiceMax); p.fat = part(b.fat, p.fat, p.fatMax);
    for (const k of ['sleep', 'hunger']) if (typeof p[k] === 'number' && typeof b[k] === 'number') p[k] = part(b[k], p[k], 100);
    say(TX.lid, 'voice', 7000); say(TX.short, '', 5000);
    return r;
  }

  // ---------------------------------------------------------------- d · every mending borrows
  let jarring = false;
  function mended(n) {
    if (!hasG() || !cantor() || !(n >= HAIR_AT) || F().p75_hair === day()) return;
    F().p75_hair = day();
    say(TX.hair, 'voice', 10000); say(TX.borrows, 'warn', 5000);
  }

  // ---------------------------------------------------------------- e · the palm held flat
  let palmAt = -1e9;
  function npcName(e) {
    const n = typeof NPCS !== 'undefined' ? NPCS[e.id] : null;
    if (!n || !n.name || e.id === 'townsman' || e.id === 'townswoman') return null;
    return String(n.name).split(',')[0];
  }
  function palm() {
    if (!hasG() || guest() || inExtra() || G.state !== 'play' || typeof NARROW28 === 'undefined') return;
    if (typeof lawActive !== 'function' || !lawActive() || G.mapId === 'tavern') return;
    try { const cs = crimeState(); if (cs.custody || cs.resisting) return; } catch (e) { /* no law state */ }   // narrow28's own guard
    const n = Number(G.noise) || 0, now = Number(G.time) || 0;
    if (n < PALM_AT || n >= NARROW28.BAL.breach || now - palmAt < PALM_EVERY || hunted()) return;
    const w = NARROW28.witness(); if (!w) return;
    palmAt = now;
    const nm = npcName(w);
    say(nm ? fmt(TX.palmNamed, nm) : (w.sprite === 'townswoman' || w.id === 'townswoman' ? TX.palmShe : TX.palmHe), '', 6000);
  }

  // ---------------------------------------------------------------- f · the Cantor's clay jar
  const JAR_ID = 'p75_jar';
  const knowsTending = () => Array.isArray(G.player.songs) && G.player.songs.includes('tending');
  function hunted() {
    const c = Engine.cam, r2 = JAR.huntedR * JAR.huntedR;
    return G.ents.some((e) => e && e.kind === 'enemy' && !e.dead && !e.hidden && e.state === 'chase' && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < r2);
  }
  function giveJar() {
    if (!hasG() || guest() || inExtra() || !cantor() || F().p75_jar) return;
    F().p75_jar = 1;
    if (!G.player.inv.some((s) => s && s.id === JAR_ID)) G.give(JAR_ID);
  }
  // its pixel icon (js/icons.js's PIX kit, as js/cargo56.js adds one): a clay jar with a narrow neck, a rag at the lip
  function addIcon() {
    if (typeof ICONS === 'undefined' || !ICONS.PIX || !ICONS.C_PX || Object.prototype.hasOwnProperty.call(ICONS.PIX, JAR_ID)) return;
    const C = ICONS.C_PX;
    ICONS.PIX[JAR_ID] = (d) => {
      d.layer(C.clay, { shiny: 1 }).ell(12, 15, 6.5, 6).rect(10, 6, 4, 4);   // the belly and the narrow neck
      d.layer(C.clay).rect(9, 5, 6, 2);                                      // the lip
      d.layer(C.linen, { shade: 'flat', sep: false }).rect(10, 3, 4, 2);     // a rag stopper
      d.mark('#7a4426', 8, 18, 10, 19, 12, 19, 14, 19);                      // a fired, darker foot
    };
  }
  function hum() {
    const p = G.player;
    if (!knowsTending()) { say(TX.jarNoNote, 'warn', 3500); return; }
    if (hunted()) { say(TX.jarHunted, 'warn', 3500); return; }
    if ((G.song && G.song.t > 0) || (G.attack && G.attack.t > 0)) { say(TX.jarBusy, 'warn', 2500); return; }   // castSong would not sing
    const s = SONGS.tending, n0 = s.noise, v0 = p.voice, hp0 = p.hp, _m = msg;
    let told = false;
    msg = function (t, cls, ms) { if (!told && t === SUNG) { told = true; t = TX.jarHum; ms = 7000; } return _m.call(this, t, cls, ms); };
    jarring = true; s.noise = JAR.noise;
    try { castSong('tending'); } finally { s.noise = n0; msg = _m; jarring = false; }
    if (!(p.voice < v0)) return;   // not sung (a quiet, a silence, no voice): nothing mended
    p.hp = Math.min(p.hpMax, p.hp + JAR.heal - SUNG_HEAL);   // on top of whatever the song itself did
    mended(p.hp - hp0);
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    if (typeof ITEMS !== 'undefined' && !ITEMS[JAR_ID]) ITEMS[JAR_ID] = { name: TX.jarName, sprite: 'loot', desc: TX.jarDesc, use: JAR_ID, key: true };
    try { addIcon(); } catch (e) { warnOnce('icon', e); }
    if (typeof doRest === 'function') {
      const _d = doRest;
      doRest = function () {
        let under = false; try { under = lidRest(); } catch (e) { warnOnce('rest', e); }
        return under ? restUnderLid(_d, this, arguments) : _d.apply(this, arguments);
      };
    }
    if (typeof castSong === 'function') {
      const _cs = castSong;
      castSong = function (id) {
        if (id !== 'tending' || jarring || !hasG()) return _cs.apply(this, arguments);
        const hp0 = G.player.hp, v0 = G.player.voice;
        const r = _cs.apply(this, arguments);
        try { if (G.player.voice < v0) mended(G.player.hp - hp0); } catch (e) { warnOnce('mend', e); }
        return r;
      };
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        let under = false; try { under = !!e && e.use === 'house_bed' && lidRest(); } catch (err) { warnOnce('bed', err); }
        return under ? restUnderLid(_ud, this, arguments) : _ud.apply(this, arguments);
      };
    }
    if (typeof useItem === 'function') {
      const _ui = useItem;
      useItem = function (slot) {
        if (!slot || slot.id !== JAR_ID || !hasG()) return _ui.apply(this, arguments);
        try { closeModal(); } catch (e) { /* not open */ }
        G.state = 'play';
        try { hum(); } catch (e) { warnOnce('jar', e); }
        return undefined;
      };
    }
    if (typeof updateNarrow === 'function') {
      const _un = updateNarrow;
      updateNarrow = function () {
        const r = _un.apply(this, arguments);
        try { if (hasG() && !inExtra()) markLid(); palm(); townLine(); } catch (e) { warnOnce('tick', e); }
        return r;
      };
    }
    for (const fn of ['loadMap', 'restoreGame']) {
      if (typeof window[fn] !== 'function') continue;
      const _f = window[fn];
      window[fn] = function () {
        const r = _f.apply(this, arguments);
        try { giveJar(); if (fn === 'loadMap') townLine(); } catch (e) { warnOnce(fn, e); }
        return r;
      };
    }
  }
  try { wire(); } catch (e) { console.warn('touches75 failed to wire', e); }

  return { TX, TEXTS, REST_FRAC, HAIR_AT, PALM_AT, PALM_EVERY, JAR, JAR_ID, noteHolds, noteDay, hum, mended, palm, giveJar };
})();
if (typeof window !== 'undefined') window.TOUCHES75 = TOUCHES75;
