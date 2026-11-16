// ============================================================
//  air93 — flying and fighting in the air (Phase 93; owner, 15 Nov 2026: "yes I want the flying combat to be a system";
//  his rulings the same night: "keep everything lore bound 1 no. 2 yes. 3 no. 4 based off the book it is randomized.
//  5 yes. yes. use as much of my engine that is useful").
//
//  THE RULINGS. (1) The Kestrel is not re-armed: the long gun went over the side in Book One ch. 8 and she stays "a fat
//  brass goose over open country". (2) Vane keeps the wheel; the traveller works the ship's stations and asks him for
//  heights. (3) She is never lost: the worst is a forced landing and a repair. (4) Whether a long flight is met is chance,
//  as it is in the books (Math.random at the moment of the flight; nothing visual uses it). (5) The set pieces' names
//  stand. (6) The crew have short working orders only. (7) The listening-horn's four states are the owner's Forge engine's
//  ai_cast states (scripts/ai/ashen_enemy_aicast_mds.gd: AISTATE_RELAXED, QUERY, ALERT, COMBAT, with a 0–100 awareness
//  meter); the fill and drain from what it hears are written here, and offered back to the Forge.
//
//  LORE BOUND. Every threat is a canon kind, met in a new place, and nothing the books do later is done by the player:
//    the Office courier-cutter (Book One ch. 21: forty feet, lead-grey, four hard little drift-tanks in a cage, a long gun
//    forward on a swivel, a grapnel-thrower aft, a brass horn the size of a wash-tub on the bow; "It found them the way you
//    find a hive: by listening until the sound got louder"; "she could not carry anything heavier than paper and
//    proctors"), its grapnel and "Four proctors came down the grapnel-line"; drift-glass that "does not explode; it weeps";
//    the Valley of Velocity on the way south (Book Three ch. 1: standing rain, and "in the Valley what was moving went on
//    getting faster": a weeping tank's jet pushes her round). The laid battery waits for a realm whose guns stand in 419
//    (Bastion Fortis's walls); the Saddle's guns are Book Three's, laid later, so they are not met here.
//
//  THE SYSTEM. A long flight (the map table: south to a far country, or home from one) is met in the air at even odds.
//  Then the flight is played on the deck in first person, and its four numbers show on the flight card:
//    height (ft; the cloud band hides you; above the ceiling the tanks go sour; at the deck she puts down),
//    lift (four tanks: sound, sour, weeping; against what she carries: water, spares, salvage),
//    noise (what rings: the hold unlashed, sour tanks, your own noise, the axe at a chain),
//    the horn (swivelling, pausing, turned, coming: the cutter's awareness, from what it hears at its distance).
//  The stations: the wheel (ask Vane: up, hold her, lower, into the cloud, down to the deck), the tank-cradle (patch a
//  weeping tank), the crates (lash the hold; throw water, spares or salvage over), the lamps (dark running), the chains
//  (cut a grapnel: three blows, each one loud). Through: she loses the cutter, outlasts it, or throws off its boarders.
//  Down: a forced landing, half a day and the price of canvas and drift-glass. Knocked down at the rail: the proctors
//  take the coin in your purse and go back up their line.
//
//  Flags (small ints): p93_go (a flight met and not yet through: 1..15 a far country, 16 home to the Court, 17 home to the
//  camp; a load finishes it), p93_met (encounters met, capped), p93_down (forced landings, capped).
//  Options: "Meetings in the air" (On by default; Off and every flight goes straight through, as before).
// ============================================================
'use strict';

const AIR93 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('air93: ' + k + ' failed', e); } };
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const K = () => (typeof KESTREL16 !== 'undefined' ? KESTREL16 : null);
  const fint = (k, max) => { const v = hasG() ? Number(F()[k]) : 0; return Number.isFinite(v) ? clamp(Math.floor(v), 0, max) : 0; };

  // ================================================================ the words
  const TX = {
    optLabel: S('Meetings in the air '),
    optSmall: S('(an Office cutter may meet a long flight)'),
    // the meeting (the cutter's description is Book One ch. 21's, word for word)
    metTitle: S('Out of the south'),
    met: S('Half a day out, Mags at the rail puts her glass up and holds it there, and then hands it to Vane without a word.'),
    cls: S('Vane knew the class. Everyone on the Rust Coast knew the class: an Office courier-cutter, forty feet, lead-grey, no envelope at all but four hard little drift-tanks slung in a cage amidships, which made her brutally fast and meant she could not carry anything heavier than paper and proctors. A long gun forward on a swivel. A grapnel-thrower aft. And on the bow, where a figurehead would be on an honest ship, a brass horn the size of a wash-tub.'),
    far: S('It is a long way off, and it has not turned. On its bow the horn is swivelling, slowly, from one side of the sky to the other.'),
    how: S('Work the ship. Ask Vane for a height at the wheel; lash the hold at the crates; Pennick\'s tanks at the cradle; the lamps; and if it comes to grapnels, the axe at the rail.'),
    metGo: S('To the stations'),
    valley: S('Below, the Valley of Velocity: rain standing in the air like a curtain, and the Tramway\'s piers marching through it. What moves down there goes on moving.'),
    // the card
    card: S('The Kestrel'),
    height: S('Height'), ft: S('ft'),
    bandDeck: S('at the deck'), bandTrees: S('in the treetops'), bandOpen: S('open sky'), bandCloud: S('in the cloud'), bandCeil: S('above the ceiling'),
    lift: S('Lift'),
    tankSound: S('sound'), tankSour: S('sour'), tankWeep: S('weeping'),
    trim: S('Lift against weight'),
    rising: S('rising'), holding: S('holding'), sinking: S('sinking'),
    noise: S('Noise'),
    horn: S('The horn'),
    horn0: S('swivelling'), horn1: S('pausing'), horn2: S('turned'), horn3: S('coming'),
    hornLine0: S('It has not heard you.'), hornLine1: S('It has stopped swivelling.'), hornLine2: S('It has turned toward you.'), hornLine3: S('It is coming down the line of the sound.'),
    journey: S('The flight'),
    gone: S('out of sight'), near: S('{0} yards'),
    dark: S('dark running'),
    // the stations
    wheelLabel: S('The wheel: ask Vane for a height'),
    wheelTitle: S('The wheel'),
    wheelBody: S('Vane has both hands on the spokes and his eyes on the grey shape. He will give you any height you ask for that she can make.'),
    up: S('Up'), hold: S('Hold her'), lower: S('Lower.'), cloud: S('Into the cloud'), deck: S('Down to the deck'), leave: S('Leave him to it'),
    sayUp: S('"Up." The tanks open and she lifts.'), sayHold: S('"Hold her." She hangs where she is.'), sayLower: S('"Lower." She goes down.'),
    sayCloud: S('"Into the cloud." She climbs for the grey.'), sayDeck: S('"Down to the deck." She goes down toward the treetops.'),
    cradleLabel: S('The tank-cradle: Pennick\'s tanks'),
    cradleFine: S('The tanks are holding. Pennick has his hand flat on the glass, listening.'),
    patching: S('You hold the patch on the weeping tank while Pennick binds it. Stay with it.'),
    patched: S('The weeping stops. The tank is sour now, and singing, but it holds what lift it has left.'),
    patchLeft: S('You let go of the patch, and the tank goes on weeping.'),
    holdLabel: S('The crates: lash the hold, or throw weight over'),
    holdTitle: S('The hold'),
    holdBody: S('Everything aboard that knocks or rings, and everything aboard that weighs. Pack it like glass for a long haul, or put it over the side.'),
    lash: S('Lash the hold with blankets and canvas'), lashed: S('The hold is lashed: nothing in it knocks now.'),
    lashing: S('You pack blankets and canvas round everything that knocks. Stay with it.'), lashLeft: S('You leave the hold half lashed.'),
    overWater: S('Water over the side'), overSpares: S('The spare canvas and tackle over the side'), overSalvage: S('The salvage over the side'),
    wentWater: S('The water goes over in a long silver rope, and she lifts.'), wentSpares: S('The spare canvas and the tackle go over, and she lifts.'),
    wentSalvage: S('The salvage goes over the side: a season\'s work, falling. She lifts.'),
    nothingLeft: S('There is nothing left to throw that she can spare.'),
    lampsLabel: S('The lamps: hood them, or light them'),
    hooded: S('You hood the lamps. The Kestrel runs dark: harder to see, and slower to answer the wheel.'),
    lit: S('You unhood the lamps.'),
    chainRail: S('A grapnel hooked over the rail, its chain bar-taut to the cutter. Cut it'),
    chainShroud: S('A grapnel in the foremast shrouds. Cut it'),
    chainBag: S('A grapnel through the bag overhead, tearing a cell. Cut it'),
    blow: S('The axe rings on the chain.'), cut: S('The chain parts and whips away into the air.'),
    // what happens
    hornTurns: S('The horn on the cutter\'s bow stops swivelling. It swings. Slowly. Toward the Kestrel. And stops.'),
    hornComes: S('The cutter comes round and down the line of the sound, at twice your speed.'),
    hornLost: S('The horn starts swivelling again.'),
    gunFire: S('The long gun on the cutter\'s bow goes off.'),
    gunMiss: S('The shot goes wide and high, through nothing.'),
    gunTank: S('The shot clips a lift-tank. Drift-glass does not explode; it weeps, very slowly, a cobalt vapour that takes the lift with it.'),
    gunBag: S('The shot goes through the bag. A cell tears, and she sits lower.'),
    gunRail: S('The shot takes a length of the rail off in splinters.'),
    grapnels: S('Then it is over you, and the grapnels come down: iron hooks on chains, thrown from her rail. The chains come taut, and the Kestrel heels under the weight.'),
    proctors: S('Four proctors come down the grapnel-line: grey oilcloth, silver mesh over the face, felted rods.'),
    chainsCut: S('The last chain parts. The cutter sheers off, light as paper, and climbs away.'),
    beaten: S('Their proctors are down or gone back up the line, and the cutter has nothing left to send.'),
    ceilSour: S('Above the ceiling the cold gets into a tank, and it begins to sing sour.'),
    valleyPush: S('The weeping tank\'s jet pushes her round, and in the Valley the push goes on getting stronger.'),
    // ends
    throughTitle: S('Through'),
    lost: S('The horn swivels, and swivels, and finds nothing. The grey shape goes on into the north and is gone.'),
    outlast: S('The cutter turns for home at the edge of its range. You go on.'),
    sheered: S('The cutter goes away into the white sky with its grapnels trailing.'),
    throughGo: S('Go on'),
    downTitle: S('She puts down'),
    down: S('She comes down into the trees with her keel in the leaves and her envelope sagging over you like a tent, because there is no choice. Pennick stops arguing, and starts work.'),
    downCost: S('Half a day patching, and {0} sovereigns of canvas and drift-glass at the next mooring. She is not lost. She is never lost.'),
    downGo: S('Lift off again'),
    knockedTitle: S('On the deck'),
    knocked: S('You go down on the planks by the rail. Mags drags you in behind the mast. When you can see again the proctors are going back up their line with the coin from your purse, and the cutter is sheering off.'),
    knockedGo: S('Get up'),
    journalMet: S('Met an Office courier-cutter in the air; it hunted the Kestrel by its horn.'),
  };

  // ================================================================ the numbers
  const B = {
    CHANCE: 0.5,            // even odds that a long flight is met (owner: random, as in the books) [PROPOSED number]
    JOURNEY_S: 200,         // seconds of play for the stretch the cutter works; outlast it and you are through
    START_FT: 540, CEIL: 900, CLOUD: [600, 760], TREES: 120, CUTTER_FLOOR: 200,
    START_YD: 1500, LOSE_YD: 2300, SEE_YD: 650, GUN_YD: 900, HOOK_YD: 60,
    GUN_EVERY: 45, GUN_HIT: 0.4,
    CLOSE: 22, TURN: 9,     // yards a second: coming (twice her speed), turned
    WEEP: 0.006,            // lift a second lost from a weeping tank
    SOUR_LIFT: 0.92, SOUR_AFTER: 15,
    PACK_S: 6, PATCH_S: 7, CHAIN_BLOWS: 3,
    DOWN_HOURS: 12, DOWN_COST: 40, KNOCK_TAKE: 0.3, KNOCK_HOURS: 6,
    // the horn (the Forge's awareness meter, 0–100): states at 25, 60 and 90; what it hears fills it, quiet drains it
    Q: 25, A: 60, C: 90, FILL: 34, DRAIN: 11,
  };
  const WEIGHT = { ship: 3.3, water: 0.25, spares: 0.15, salvage: 0.3 };

  // ================================================================ options
  const KEY = 'octave.air93.v1';
  const cfg = { on: true };
  function loadCfg() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') cfg.on = o.on !== false; } catch (e) { /* defaults */ } }
  function saveCfg() { try { localStorage.setItem(KEY, JSON.stringify({ on: cfg.on })); } catch (e) { /* session only */ } }
  const on = () => cfg.on;
  const setOn = (v) => { cfg.on = !!v; saveCfg(); };

  // ================================================================ the encounter's state (transient: a load finishes the flight)
  const R = { live: false };
  let roll = () => Math.random();   // the books' chance; a test may set its own
  function fresh(kind, to, hours, go) {
    return {
      live: true, kind, to, hours, go, t: 0, ft: B.START_FT, target: B.START_FT,
      tanks: [1, 1, 1, 1].map(() => ({ st: 'sound', lift: 1, sourT: 0 })),
      cells: 0, have: { water: true, spares: true, salvage: true }, lashed: false, dark: false,
      yd: B.START_YD, aw: 0, horn: 0, bearing: 0.6, gunT: B.GUN_EVERY * 0.6, spike: 0, ceilT: 0,
      hooked: false, chains: [], proctors: [], job: null, valley: south(kind, to), spin: 0, progress: 0, ended: false,
    };
  }
  // the way south to the Heights crosses the Valley of Velocity (Phase 89: the Tramway runs out of the Reach toward the
  // Heights over it); flights to other far countries do not
  function south(kind, to) {
    if (kind === 'far') return to === 'p92_tiers';
    try { const f = K() && K().farNow(); return !!f && f.id === 'p92_tiers'; } catch (e) { return false; }
  }
  const liftOf = (r) => r.tanks.reduce((a, k) => a + k.lift, 0) - r.cells * 0.1;
  const weightOf = (r) => WEIGHT.ship + (r.have.water ? WEIGHT.water : 0) + (r.have.spares ? WEIGHT.spares : 0) + (r.have.salvage ? WEIGHT.salvage : 0);
  const trimOf = (r) => liftOf(r) - weightOf(r);
  const inCloud = (r) => r.ft >= B.CLOUD[0] && r.ft <= B.CLOUD[1];
  // what rings aboard
  function noiseOf(r) {
    let n = r.lashed ? 0.12 : 0.5;                                      // the hold: tackle, chain and salvage knocking
    for (const k of r.tanks) if (k.st === 'sour') n += 0.12; else if (k.st === 'weep') n += 0.06;
    n += Math.max(0, ((hasG() ? Number(G.noise) : 1) || 1) - 1.0) * 0.22; // your own noise above a breath
    n += r.spike;                                                       // the axe at a chain
    return n;
  }
  // what the horn hears of it, at its distance
  function heard(r) {
    let h = noiseOf(r) * clamp(1300 / Math.max(60, r.yd), 0.15, 3);
    if (inCloud(r)) h *= 0.45;
    if (r.ft < B.CUTTER_FLOOR) h *= 0.7;                                // down in the treetops' noise
    if (r.valley && r.progress < 0.4) h *= 0.6;                         // the Valley's standing rain
    return h;
  }
  const hornOf = (aw) => (aw >= B.C ? 3 : aw >= B.A ? 2 : aw >= B.Q ? 1 : 0);

  // ================================================================ art (code-drawn; no random numbers)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || !Engine.sprites || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn, meta) => {
      if (Engine.sprites[name]) return;
      const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x, w, h);
      Engine.addSprite(name, Object.assign({ w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }, meta || {}));
    };
    const px = (x, c, i, j, w, h) => { x.fillStyle = c; x.fillRect(i, j, w || 1, h || 1); };
    // the courier-cutter, side on: lead-grey hull, no envelope, four hard little drift-tanks in a cage amidships, a long gun
    // forward on a swivel, a grapnel-thrower aft, and a brass horn the size of a wash-tub on the bow
    add('p93_cutter', 128, 56, 1.0, (x) => {
      x.fillStyle = '#5c6068'; x.beginPath(); x.moveTo(6, 34); x.lineTo(108, 34); x.lineTo(118, 28); x.lineTo(112, 44); x.lineTo(14, 46); x.closePath(); x.fill();
      px(x, '#3a3d44', 10, 44, 100, 2); px(x, '#777b84', 10, 34, 98, 2);
      for (let i = 0; i < 9; i++) px(x, '#2c2e34', 18 + i * 10, 39, 2, 2);              // ports
      x.strokeStyle = '#2c2e34'; x.lineWidth = 2; x.strokeRect(40, 12, 40, 20);         // the cage
      for (let i = 0; i < 4; i++) { const cx = 45 + i * 10; x.fillStyle = '#4a74a8'; x.fillRect(cx - 3, 14, 7, 16); px(x, '#86aee0', cx - 2, 15, 2, 6); }
      x.fillStyle = '#c4964a'; x.beginPath(); x.moveTo(110, 30); x.lineTo(127, 22); x.lineTo(127, 42); x.lineTo(110, 36); x.closePath(); x.fill();   // the horn
      px(x, '#e0b868', 124, 24, 2, 16); px(x, '#8a6430', 110, 31, 2, 4);
      x.strokeStyle = '#202024'; x.lineWidth = 3; x.beginPath(); x.moveTo(96, 33); x.lineTo(114, 22); x.stroke();   // the long gun
      x.lineWidth = 2; x.beginPath(); x.moveTo(12, 34); x.lineTo(4, 24); x.stroke(); px(x, '#202024', 2, 22, 4, 3);   // the grapnel-thrower
      px(x, '#9aa0a8', 60, 31, 3, 3); px(x, '#9aa0a8', 70, 31, 3, 3);                     // proctors at the rail
    });
    // a grapnel's chain, from the deck up into the air
    add('p93_chain', 24, 160, 3.2, (x) => {
      for (let y = 0; y < 146; y += 8) { px(x, '#4a4c52', 10, y, 4, 6); px(x, '#1c1c20', 11, y + 1, 2, 4); }
      x.strokeStyle = '#3a3c42'; x.lineWidth = 3; x.beginPath(); x.moveTo(12, 146); x.lineTo(12, 156); x.moveTo(4, 150); x.quadraticCurveTo(12, 162, 20, 150); x.stroke();
    });
    // a grapnel through the bag overhead: the hook up in the torn sailcloth, its chain hanging down and away to the cutter
    add('p93_chainbag', 24, 160, 3.2, (x) => {
      x.strokeStyle = '#3a3c42'; x.lineWidth = 3; x.beginPath(); x.moveTo(12, 14); x.lineTo(12, 4); x.moveTo(4, 10); x.quadraticCurveTo(12, -2, 20, 10); x.stroke();
      for (let y = 14; y < 160; y += 8) { px(x, '#4a4c52', 10, y, 4, 6); px(x, '#1c1c20', 11, y + 1, 2, 4); }
    });
    // the tank-cradle: a glass drift-tank in an iron cradle
    add('p93_cradle', 48, 56, 0.9, (x) => {
      x.fillStyle = '#4a74a8'; x.beginPath(); x.ellipse(24, 26, 16, 20, 0, 0, Math.PI * 2); x.fill();
      px(x, '#9cc0ec', 16, 12, 3, 16);
      x.strokeStyle = '#2a2c30'; x.lineWidth = 3; x.strokeRect(6, 8, 36, 40); x.beginPath(); x.moveTo(6, 28); x.lineTo(42, 28); x.stroke();
      px(x, '#2a2c30', 4, 48, 40, 6);
    });
  }

  // ================================================================ staging on the deck
  const DECK = () => (K() ? K().DECK : 'p16k_kestrel_deck');
  const at = (lx, ly) => { const k = K(); return [(k ? k.OX : 16) + lx, (k ? k.OY : 14) + ly]; };
  const keyed = (k) => (G.map && G.map.entities || []).find((e) => e && e._p93 === k);
  function put(k, e) { const have = keyed(k); if (have) return have; e = Object.assign(e, { transient: true, nopick: true, _p93: k }); G.map.entities.push(e); return e; }
  function drop(pred) { const m = G.map; if (!m || !Array.isArray(m.entities)) return; for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._p93 && pred(e)) m.entities.splice(i, 1); } }
  const STATIONS = { wheel: [2.9, 4.0], cradle: [9.8, 5.0], hold: [11.2, 8.3], lamps: [5.5, 1.4] };
  const CHAINS = [['rail', [13.6, 0.9], 'chainRail'], ['shroud', [18.5, 3.5], 'chainShroud'], ['bag', [10.4, 3.2], 'chainBag']];
  const borrowed = [];   // the deck's own props given a use for the meeting, and given back after
  function lend(pred, use, label) {
    const e = (G.map.entities || []).find((o) => o && !o._p93 && pred(o)); if (!e) return null;
    borrowed.push({ e, use: e.use, label: e.label }); e.use = use; e.label = label; return e;
  }
  function stage() {
    if (!R.live || !G.map || G.map.id !== DECK()) return;
    art();
    if (!borrowed.length) {
      const near = (k) => (o) => { const p = at(...STATIONS[k]); return Math.hypot(o.x - p[0], o.y - p[1]) < 0.9; };
      lend((o) => o.sprite === 'p16k_helm', 'p93_wheel', TX.wheelLabel);
      lend((o) => o.sprite === 'crates' && near('hold')(o), 'p93_hold', TX.holdLabel);
      lend((o) => o.sprite === 'lamp' && near('lamps')(o), 'p93_lamps', TX.lampsLabel);
    }
    if (R.hooked) for (const e of R.chains.concat(R.proctors.filter((o) => o && !o.dead))) if (!G.map.entities.includes(e)) G.map.entities.push(e);   // a map built again keeps the boarding
    put('cradle', { kind: 'deco', sprite: 'p93_cradle', x: at(...STATIONS.cradle)[0], y: at(...STATIONS.cradle)[1], scale: 0.9, solid: true, radius: 0.4, use: 'p93_cradle', label: TX.cradleLabel });
    placeCutter();
  }
  function unstage() {
    for (const b of borrowed.splice(0)) { b.e.use = b.use; b.e.label = b.label; }
    if (G.map && G.map.id === DECK()) { drop(() => true); G.map.ambient = R.amb != null ? R.amb : G.map.ambient; if (R.fog != null) G.map.fogDist = R.fog; }
  }
  // the cutter in the sky: on its bearing, as far off as it is (lost in the mist past the deck's fog)
  function placeCutter() {
    if (!R.live || !G.map || G.map.id !== DECK()) return;
    const c = at(13.5, 5);
    const cells = R.hooked ? 3.2 : clamp(R.yd / 90, 3.2, 22);   // past about 800 yards it is lost in the mist off the deck
    const e = put('cutter', { kind: 'deco', sprite: 'p93_cutter', x: c[0], y: c[1], scale: 3.2, solid: false, radius: 0.05, label: TX.metTitle });
    if (R.hooked) { const r = at(14.5, -1.4); e.x = r[0]; e.y = r[1]; }   // alongside, hard against the port rail, on her grapnels
    else { const r = at(13.5, -1.5); e.x = r[0] + Math.cos(R.bearing) * cells; e.y = r[1] - Math.abs(Math.sin(R.bearing)) * cells * 0.6; }   // off the port side
    e.yOff = -1.2; e.hidden = inCloud(R) && !R.hooked;
  }

  // ================================================================ the card (DOM, so every label has its French)
  function css() {
    if (typeof document === 'undefined' || document.getElementById('p93-style')) return;
    const st = document.createElement('style'); st.id = 'p93-style';
    st.textContent = '#p93-card{position:absolute;left:1.2cqw;top:1.6cqh;width:23cqw;background:rgba(18,16,20,.86);border:1px solid #aa8c50;color:#dcd2be;font:1.25cqw/1.35 "Alegreya",serif;padding:.8cqw 1cqw;z-index:6;pointer-events:none}'
      + '#p93-card b{color:#e2c88c;font-family:"Alegreya SC",serif}#p93-card .row{margin:.35cqw 0}#p93-card .bar{height:.7cqw;background:#2a262a;border:1px solid #6a5a3c;margin-top:.2cqw;position:relative}'
      + '#p93-card .fill{position:absolute;left:0;top:0;bottom:0}#p93-card .tanks{display:flex;gap:.4cqw}#p93-card .tk{flex:1;text-align:center;padding:.2cqw 0;border:1px solid #333;font-size:1cqw}'
      + '#p93-card .horn{display:flex;gap:.3cqw}#p93-card .hs{flex:1;text-align:center;border:1px solid #6a5a3c;font-size:1cqw;padding:.15cqw 0}#p93-card .hs.on{background:#c4964a;color:#141216}'
      + '#p93-card .muted{color:#a89c88;font-size:1.05cqw}';
    document.head.appendChild(st);
  }
  let cardEl = null, cardT = 0, drawnAt = -1;
  function el(tag, cls, text) { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.appendChild(document.createTextNode(String(text))); return e; }
  function drawCard() {
    if (typeof document === 'undefined') return;
    const game = document.getElementById('game'); if (!game) return;
    if (!R.live) { if (cardEl) { cardEl.remove(); cardEl = null; } return; }
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (cardEl && now - drawnAt < 200) return;   // five times a second is plenty for a card
    drawnAt = now;
    css();
    if (!cardEl) { cardEl = el('div'); cardEl.id = 'p93-card'; cardEl.setAttribute('role', 'status'); cardEl.setAttribute('aria-live', 'off'); game.appendChild(cardEl); }
    const r = R, d = document.createDocumentFragment();
    d.appendChild(el('b', '', TX.card));
    // height
    const band = r.ft <= 0 ? TX.bandDeck : r.ft < B.TREES ? TX.bandTrees : inCloud(r) ? TX.bandCloud : r.ft > B.CEIL ? TX.bandCeil : TX.bandOpen;
    const h = el('div', 'row'); h.appendChild(el('span', '', TX.height)); h.appendChild(el('span', '', ' ' + Math.round(r.ft) + ' ')); h.appendChild(el('span', '', TX.ft)); h.appendChild(el('span', '', ' · ')); h.appendChild(el('span', '', band));
    if (r.dark) { h.appendChild(el('span', '', ' · ')); h.appendChild(el('span', '', TX.dark)); }
    d.appendChild(h);
    // lift
    const l = el('div', 'row'); l.appendChild(el('div', '', TX.lift)); const tk = el('div', 'tanks');
    r.tanks.forEach((k) => { const c = el('div', 'tk', k.st === 'sound' ? TX.tankSound : k.st === 'sour' ? TX.tankSour : TX.tankWeep); c.style.background = k.st === 'sound' ? '#3e6a9a' : k.st === 'sour' ? '#6e6a44' : '#3a4a8a'; tk.appendChild(c); });
    l.appendChild(tk); d.appendChild(l);
    const tr = trimOf(r), t = el('div', 'row'); t.appendChild(el('span', '', TX.trim)); t.appendChild(el('span', '', ' · ')); t.appendChild(el('span', '', tr > 0.02 ? TX.rising : tr < -0.02 ? TX.sinking : TX.holding));
    const bar = el('div', 'bar'), fill = el('div', 'fill'); fill.style.width = clamp(50 + tr * 120, 0, 100) + '%'; fill.style.background = tr < -0.02 ? '#b0603c' : '#8a7444'; bar.appendChild(fill); t.appendChild(bar); d.appendChild(t);
    // noise
    const n = el('div', 'row'); n.appendChild(el('div', '', TX.noise)); const nb = el('div', 'bar'), nf = el('div', 'fill'); nf.style.width = clamp(noiseOf(r) * 60, 0, 100) + '%'; nf.style.background = '#c8784e'; nb.appendChild(nf); n.appendChild(nb); d.appendChild(n);
    // the horn
    const hn = el('div', 'row'); hn.appendChild(el('div', '', TX.horn)); const hs = el('div', 'horn');
    [TX.horn0, TX.horn1, TX.horn2, TX.horn3].forEach((s, i) => hs.appendChild(el('div', 'hs' + (i === r.horn ? ' on' : ''), s)));
    hn.appendChild(hs); hn.appendChild(el('div', 'muted', [TX.hornLine0, TX.hornLine1, TX.hornLine2, TX.hornLine3][r.horn]));
    const dist = el('div', 'muted'); dist.appendChild(el('span', '', r.yd > B.SEE_YD * 1.6 ? TX.gone : fmt(TX.near, Math.round(r.yd / 10) * 10))); hn.appendChild(dist); d.appendChild(hn);
    // the flight
    const j = el('div', 'row'); j.appendChild(el('span', '', TX.journey)); const jb = el('div', 'bar'), jf = el('div', 'fill'); jf.style.width = clamp(r.progress * 100, 0, 100) + '%'; jf.style.background = '#7a8c6a'; jb.appendChild(jf); j.appendChild(jb); d.appendChild(j);
    cardEl.replaceChildren(d);
  }

  // ================================================================ start, tick, the ends
  function start(kind, to, hours, go, force) {
    if (!hasG() || R.live) return false;
    if (!force && (!on() || roll() >= B.CHANCE)) return false;
    Object.assign(R, fresh(kind, to, hours, go));
    const k = K(); let code = 0;
    if (kind === 'far' && k) code = k.FAR.findIndex((x) => x.id === to) + 1;
    else if (kind === 'home') code = to === 'whispergrove' ? 16 : 17;
    F().p93_go = code; F().p93_met = Math.min(99, fint('p93_met', 99) + 1);
    try { if (typeof journal === 'function') journal('side', TX.journalMet); } catch (e) { /* no journal */ }
    if (G.map && G.map.id === DECK()) { R.amb = G.map.ambient; R.fog = G.map.fogDist; }
    stage();
    const parts = [TX.met, TX.cls, TX.far]; if (R.valley) parts.push(TX.valley); parts.push(TX.how);
    try { showEvent(TX.metTitle, parts.join('<br><br>'), [{ t: TX.metGo, f: () => {} }]); } catch (e) { warnOnce('card', e); }
    return true;
  }
  function tick(dt) {
    if (!R.live || R.ended || !hasG() || G.state !== 'play') return;
    if (!G.map || G.map.id !== DECK()) return;   // below decks the flight waits for you
    const r = R; dt = Math.min(dt, 0.25);
    r.t += dt;
    // the wheel: Vane drives toward the height you asked for; the trim adds or takes away
    const dark = r.dark ? 0.6 : 1;
    const drive = clamp((r.target - r.ft) / 5, -10 * dark, 10 * dark) * (r.hooked ? 0.25 : 1);
    r.ft = Math.max(0, r.ft + (drive + trimOf(r) * 60) * dt);
    // the tanks: a weeping tank loses lift; above the ceiling the cold sours them
    for (const k of r.tanks) if (k.st === 'weep') k.lift = Math.max(0.35, k.lift - B.WEEP * dt);
    if (r.ft > B.CEIL) { r.ceilT += dt; if (r.ceilT >= B.SOUR_AFTER) { r.ceilT = 0; const k = r.tanks.find((x) => x.st === 'sound'); if (k) { k.st = 'sour'; k.lift = Math.min(k.lift, B.SOUR_LIFT); say(TX.ceilSour, 'warn'); } } } else r.ceilT = 0;
    if (r.hooked && chainUp('bag')) r.cells = Math.min(6, r.cells + 0.04 * dt);   // a hook through the bag goes on tearing
    // the journey (in the Valley a weeping tank's jet pushes her round, and the push grows)
    const weeping = r.tanks.some((k) => k.st === 'weep');
    if (r.valley && r.progress < 0.4 && weeping) { if (r.spin === 0) say(TX.valleyPush, 'warn'); r.spin = Math.min(0.8, r.spin + 0.02 * dt); } else r.spin = Math.max(0, r.spin - 0.1 * dt);
    if (!r.hooked) r.progress = Math.min(1, r.progress + dt / B.JOURNEY_S * (1 - r.spin));
    // the horn: the Forge's awareness meter, filled by what it hears and drained by quiet
    r.spike = Math.max(0, r.spike - dt * 0.5);
    const hd = heard(r), was = r.horn;
    r.aw = clamp(r.aw + (hd > 0.32 ? (hd - 0.32) * B.FILL : -B.DRAIN * (r.horn === 3 ? 0.5 : 1)) * dt, 0, 100);
    if (r.hooked) r.aw = 100;
    r.horn = hornOf(r.aw);
    if (r.horn !== was) { if (r.horn === 2 && was < 2) say(TX.hornTurns, 'bad', 6000); else if (r.horn === 3 && was < 3) say(TX.hornComes, 'bad', 6000); else if (r.horn === 0 && was > 0) say(TX.hornLost, 'good'); }
    // the cutter: quartering when it has heard nothing, holding when it pauses, closing when it has turned or is coming
    if (!r.hooked) {
      const v = r.horn === 3 ? -B.CLOSE : r.horn === 2 ? -B.TURN : r.horn === 1 ? 0 : 6 + 4 * Math.sin(r.t / 9);
      r.yd = clamp(r.yd + v * dt, B.HOOK_YD, 4000);
      if (r.horn === 3 && r.ft >= B.CUTTER_FLOOR && r.yd <= B.HOOK_YD + 0.5) hook();
    }
    // the long gun, when it is coming and can see
    r.gunT -= dt;
    if (r.gunT <= 0) { r.gunT = B.GUN_EVERY; if (r.horn === 3 && !r.hooked && r.yd < B.GUN_YD && !inCloud(r) && r.ft >= B.CUTTER_FLOOR) fire(); }
    // the boarding
    if (r.hooked) {
      const up = r.proctors.filter((e) => e && !e.dead && !e.hidden && e.hp > 0);
      if (!r.chains.length && !up.length) return through(TX.sheered);
      if (!r.chains.length && up.length) { /* the chains are cut: they fight on the deck until they are down */ }
    }
    // the ends
    if (r.ft <= 0) return forcedDown();
    if (r.yd >= B.LOSE_YD) return through(TX.lost);
    if (r.progress >= 1 && r.horn < 3 && !r.hooked) return through(TX.outlast);
    cardT -= dt; if (cardT <= 0) { cardT = 0.25; placeCutter(); if (R.fog != null) G.map.fogDist = inCloud(r) ? 4 : R.fog; }
  }
  function fire() {
    try { Audio_.sfx.shot(); } catch (e) { /* silent */ }
    say(TX.gunFire, 'bad', 3000);
    const hit = roll() < B.GUN_HIT * (R.dark ? 0.5 : 1);
    if (!hit) { say(TX.gunMiss, '', 4000); return; }
    const w = roll();
    const sound = R.tanks.filter((k) => k.st !== 'weep');
    if (w < 0.5 && sound.length) { sound[0].st = 'weep'; say(TX.gunTank, 'bad', 7000); }
    else if (w < 0.8) { R.cells += 1; say(TX.gunBag, 'bad', 6000); }
    else say(TX.gunRail, 'bad', 5000);
  }
  const chainUp = (k) => R.chains.some((c) => c._k === k);
  function hook() {
    const r = R; r.hooked = true; r.yd = B.HOOK_YD; placeCutter();
    say(TX.grapnels, 'bad', 7000);
    if (G.map && G.map.id === DECK()) {
      for (const [k, p, lab] of CHAINS) {
        const [x, y] = at(...p);
        const e = put('chain_' + k, { kind: 'deco', sprite: k === 'bag' ? 'p93_chainbag' : 'p93_chain', x, y, scale: 1.0, solid: false, radius: 0.25, use: 'p93_chain', label: TX[lab], yOff: k === 'bag' ? -1.3 : -0.4 });
        e._k = k; e._blows = 0; r.chains.push(e);
      }
      const spots = [[12.6, 2.2], [14.6, 3.4], [16.4, 2.6], [11.4, 4.6]];
      r.proctors = spots.map((p, i) => { const [x, y] = at(...p); const e = Object.assign(hydrate({ kind: 'enemy', type: 'proctor', x, y }), { transient: true, _p93: 'proctor' + i, state: 'chase', alertT: 10 }); G.map.entities.push(e); return e; });
      say(TX.proctors, 'bad', 7000);
    }
  }
  function cutChain(e) {
    if (!e || !R.live) return false;
    e._blows = (e._blows | 0) + 1; R.spike = Math.min(1.2, R.spike + 0.6);
    try { Audio_.sfx.hit(); } catch (err) { /* silent */ }
    if (e._blows < B.CHAIN_BLOWS) { say(TX.blow, '', 2000); return true; }
    R.chains = R.chains.filter((c) => c !== e); drop((o) => o === e);
    say(TX.cut, 'good', 3000);
    if (!R.chains.length) { say(TX.chainsCut, 'good', 6000); }
    return true;
  }
  function endCard(title, body, go, after) {
    try { showEvent(title, body, [{ t: go, f: after }]); } catch (e) { warnOnce('end', e); after(); }
  }
  function finish(extraHours) {
    const go = R.go; R.ended = true;
    unstage(); R.live = false; delete F().p93_go; drawCard();
    try { if (extraHours && typeof passHours === 'function') passHours(extraHours); } catch (e) { /* time */ }
    try { if (typeof go === 'function') go(); } catch (e) { warnOnce('go', e); }
  }
  function through(body) {
    if (R.ended) return;
    R.ended = true;
    if (R.hooked) R.proctors.forEach((e) => { if (e && !e.dead) { e.hidden = true; e.dead = true; e.solid = false; } });
    endCard(TX.throughTitle, body + (R.hooked && R.chains.length === 0 ? '<br><br>' + TX.beaten : ''), TX.throughGo, () => finish(0));
  }
  function forcedDown() {
    if (R.ended) return;
    R.ended = true;
    const cost = Math.min(B.DOWN_COST, Math.max(0, Math.floor(G.player.gold || 0)));
    G.player.gold = Math.max(0, (G.player.gold || 0) - cost);
    F().p93_down = Math.min(99, fint('p93_down', 99) + 1);
    endCard(TX.downTitle, TX.down + '<br><br>' + fmt(TX.downCost, cost), TX.downGo, () => finish(B.DOWN_HOURS));
  }
  function knockedDown() {
    if (R.ended) return;
    R.ended = true;
    const p = G.player, take = Math.floor((p.gold || 0) * B.KNOCK_TAKE);
    p.gold = Math.max(0, (p.gold || 0) - take); p.hp = Math.max(1, Math.round((p.hpMax || 40) * 0.25));
    R.proctors.forEach((e) => { if (e && !e.dead) { e.hidden = true; e.dead = true; e.solid = false; } });
    endCard(TX.knockedTitle, TX.knocked, TX.knockedGo, () => finish(B.KNOCK_HOURS));
  }

  // ================================================================ the stations
  function wheelMenu() {
    const r = R, set = (ft, line) => { r.target = clamp(ft, 0, 1200); say(line, '', 4000); };
    try {
      showEvent(TX.wheelTitle, TX.wheelBody, [
        { t: TX.up, f: () => set(r.ft + 200, TX.sayUp) },
        { t: TX.hold, f: () => set(r.ft, TX.sayHold) },
        { t: TX.lower, f: () => set(r.ft - 200, TX.sayLower) },
        { t: TX.cloud, f: () => set((B.CLOUD[0] + B.CLOUD[1]) / 2, TX.sayCloud) },
        { t: TX.deck, f: () => set(B.TREES + 30, TX.sayDeck) },
        { t: TX.leave, f: () => {} },
      ]);
    } catch (e) { warnOnce('wheel', e); }
  }
  function holdMenu() {
    const r = R, ch = [];
    if (!r.lashed) ch.push({ t: TX.lash, f: () => startJob('lash') });
    const over = (k, line) => { r.have[k] = false; say(line, '', 5000); try { Audio_.sfx.door(); } catch (e) { /* silent */ } };
    if (r.have.water) ch.push({ t: TX.overWater, f: () => over('water', TX.wentWater) });
    if (r.have.spares) ch.push({ t: TX.overSpares, f: () => over('spares', TX.wentSpares) });
    if (r.have.salvage) ch.push({ t: TX.overSalvage, f: () => over('salvage', TX.wentSalvage) });
    if (!r.have.water && !r.have.spares && !r.have.salvage) say(TX.nothingLeft, 'warn');
    ch.push({ t: TX.leave, f: () => {} });
    try { showEvent(TX.holdTitle, TX.holdBody, ch); } catch (e) { warnOnce('hold', e); }
  }
  // a held job: stand by it until it is done
  function startJob(kind) {
    const c = Engine.cam; R.job = { kind, t: 0, x: c.x, y: c.y, need: kind === 'lash' ? B.PACK_S : B.PATCH_S };
    say(kind === 'lash' ? TX.lashing : TX.patching, 'warn', 4000);
  }
  function tickJob(dt) {
    const j = R.job; if (!j || !R.live) return;
    const c = Engine.cam;
    if (Math.hypot(c.x - j.x, c.y - j.y) > 1.2) { R.job = null; say(j.kind === 'lash' ? TX.lashLeft : TX.patchLeft, 'warn'); return; }
    j.t += dt;
    if (j.t >= j.need) {
      R.job = null;
      if (j.kind === 'lash') { R.lashed = true; say(TX.lashed, 'good'); }
      else { const k = R.tanks.find((x) => x.st === 'weep'); if (k) { k.st = 'sour'; say(TX.patched, 'good', 6000); } }
    }
  }
  function useOwn(e) {
    if (!e || !R.live) return false;
    if (e.use === 'p93_wheel') { wheelMenu(); return true; }
    if (e.use === 'p93_hold') { holdMenu(); return true; }
    if (e.use === 'p93_lamps') { R.dark = !R.dark; if (G.map) G.map.ambient = R.dark ? Math.max(0.12, (R.amb || 0.42) - 0.18) : (R.amb || G.map.ambient); say(R.dark ? TX.hooded : TX.lit, ''); return true; }
    if (e.use === 'p93_cradle') { if (R.tanks.some((k) => k.st === 'weep')) startJob('patch'); else say(TX.cradleFine, ''); return true; }
    if (e.use === 'p93_chain') return cutChain(e);
    // while she is in the air, the ladder and the map table wait
    if (e.use === 'p16k_exit' || e.use === 'p16k_table') { say(TX.how, 'warn', 4000); return true; }
    return false;
  }

  // ================================================================ a load: a flight met and not through finishes as it would have
  function resumeFlight() {
    if (!hasG() || R.live) return;
    const code = fint('p93_go', 17); if (!code) return;
    delete F().p93_go;
    const k = K(); if (!k) return;
    try { if (code >= 16) k.hop(code === 16 ? 'whispergrove' : 'deepwoods', true); else if (k.FAR[code - 1]) k.flyFar(k.FAR[code - 1].id, true); } catch (e) { warnOnce('resume', e); }
  }

  // ================================================================ wiring
  function wire() {
    loadCfg();
    const k = K();
    if (k && k.setFlightHook) k.setFlightHook((o) => start(o.kind, o.to, o.hours, o.go));
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(dt); tickJob(dt); } catch (e) { warnOnce('update', e); } return r; }; }
    if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { drawCard(); } catch (e) { warnOnce('hud', e); } return r; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { if (R.live) { borrowed.length = 0; stage(); } } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof restoreGame === 'function') { const _rg = restoreGame; restoreGame = function () { if (R.live) { try { unstage(); } catch (e) { /* the old map */ } R.live = false; R.ended = true; drawCard(); } const r = _rg.apply(this, arguments); try { resumeFlight(); } catch (e) { warnOnce('restore', e); } return r; }; }
    // knocked down at the rail in a boarding is not a death (the Kestrel and her people are never lost)
    if (typeof die === 'function') { const _die = die; die = function () { try { if (R.live && R.hooked && !R.ended && !G.dead && !(typeof hardcoreOn === 'function' && hardcoreOn())) { knockedDown(); return undefined; } } catch (e) { warnOnce('die', e); } return _die.apply(this, arguments); }; }
    if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () {
        const r = _acc.apply(this, arguments);
        try {
          const grid = document.querySelector('#modal-panel .ctl-grid');
          if (grid && !document.getElementById('p93-air')) {
            const label = document.createElement('span'); label.className = 'gfx-label'; label.appendChild(document.createTextNode(TX.optLabel));
            const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = TX.optSmall; label.appendChild(sm);
            const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'p93-air'; b.type = 'button'; b.setAttribute('aria-label', TX.optLabel.trim());
            const s = () => { b.textContent = on() ? 'On' : 'Off'; b.setAttribute('aria-pressed', on() ? 'true' : 'false'); };
            b.onclick = () => { setOn(!on()); s(); }; s(); grid.appendChild(label); grid.appendChild(b);
          }
        } catch (e) { /* the menu still opens without the row */ }
        return r;
      };
    }
  }
  try { wire(); } catch (e) { console.warn('air93 failed to wire', e); }

  return {
    TX, TEXTS, B, R, cfg, on, setOn, start, tick, tickJob, useOwn, noiseOf, heard, hornOf, trimOf, liftOf, weightOf, inCloud, art, stage, drawCard,
    cutChain, hook, fire, forcedDown, through, knockedDown, resumeFlight, wheelMenu, holdMenu,
    setRoll: (f) => { roll = typeof f === 'function' ? f : () => Math.random(); },
  };
})();
if (typeof window !== 'undefined') window.AIR93 = AIR93;
