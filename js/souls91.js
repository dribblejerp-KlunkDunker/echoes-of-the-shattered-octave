// ============================================================
//  souls91 — Phase 91: the Souls rules, built first in the Reach's great places (Phase 89 plan, approved 14 Nov;
//  Phase 90's six numbers, approved 14 Nov: "you have my approval for all now you may proceed").
//
//  Lamps (the rest points). A hush-lamp on an iron post, as the Reach's lamps are. Stand by one and it is lit, once.
//  Use a lit lamp to rest: full health, voice and breath, the place's ordinary foes get up again where they first
//  stood, its keeper too if it has been down a week (eight days), and the game is saved (the autosave slot, never in a
//  hardcore run). Five in the Reach:
//    the Antler Galleries   the shaft's foot; the floorstone seam, the last light before the den
//    the Dry Flume          the adit's foot; the foot of the stair up to the Pound Stair
//    the Deep Grove's gap   in Greenroot Wood, by the boulders (the Grove itself has none: nothing opens there)
//  Waking. Die in a place that has a lit lamp and you wake by the last of its lamps you lit, at six-tenths health, as
//  the game always woke you. Die anywhere else and you wake where you always did.
//  The Piece. What you carried in coin, and what you had learned toward your next level (never a level), stays where
//  you fell. It sounds your note, low, from a little way off, and shows only close, as a lilac shimmer. Stand where you
//  fell and it comes home. Die again before you reach it and it is gone; nothing says where. Gear is never lost.
//  The hour-bead. Swallowed, it undoes one death on the spot, and leaves no Piece. 120 sovereigns, one carried at a
//  time. The hour-merchants sell them (Veridia, in the Dunes: not built yet), so in the Reach there is none to buy.
//  Shortcuts, opened from the far side:
//    the Antler Galleries   a chimney from the Flint-Back's den straight up to the shaft's foot; its rope is tied off
//                           at the bottom, so it can only be climbed from below the first time
//    the Dry Flume          an iron door between the sump passage and the pump-hall, barred on the hall side: once
//                           unbarred, nobody has to time the sump again (the grating up to the Pound Stair, built in
//                           Phase 85, is the Flume's other way out and stays as it was)
//  Options: "Souls rules" (default On). Off keeps the old cost of dying (wake by the map's lamp, lose five coins), and
//  the lamps go dark and cannot be used; the two shortcut doors stay, barred until opened, as walls you cannot pass.
//  Everything here that the books do not say is [PROPOSED] under the approved plan.
//  Flags (small ints, validated on read): p91_lit (a bit per lamp), p91_la / p91_lf / p91_lg (the last lamp lit in
//  the Galleries, the Flume, at the gap: its number plus one), p91_sca (the chimney's rope tied off at the top),
//  p91_scf (the iron door unbarred), p91k_a / p91k_f (the day the Flint-Back / the Standing Note was put down).
//  The Piece lives on the player (G.player.p91piece), validated on every read. Nothing visual uses random numbers.
// ============================================================
'use strict';

const SOULS91 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('souls91: ' + k, e); } };
  const TX = {
    lamp: S('A hush-lamp on an iron post, unlit. Its reed-whistle is stopped with wax.'),
    lampLit: S('A hush-lamp on an iron post, burning. Use it to rest.'),
    lit: S('You light the lamp. Its reed-whistle takes up its thin note. It will be here when you need it.'),
    rest: S('You sit by the lamp a while. Your wounds close, and your breath comes back. Behind you, in the dark, the place fills up again.'),
    restOil: S('You fill your own lamp from it.'),
    restSaved: S('The game is saved.'),
    keeperBack: S('Somewhere below, something that lay a long time in the dark has got up again.'),
    hunted: S('Not with something hunting you.'),
    wake: S('You wake by the last lamp you lit. What you carried is where you fell.'),
    wakeNoLamp: S('What you carried is where you fell.'),
    deathLine: S('What you carried will wait where you fell, sounding your note.'),
    pieceLabel: S('A lilac shimmer, low down, humming your note.'),
    pieceHome: S('You stand where you fell, and your Piece comes home.'),
    pieceHomeN: S('You stand where you fell, and your Piece comes home, with {0} sovereigns.'),
    autoLamp: S('Load the save from the lamp'),
    bead: S('Swallow the hour-bead'),
    beadUsed: S('You swallow the hour-bead. The last few heartbeats come undone, and you are standing where you fell, with everything you carried.'),
    beadName: S('Hour-bead'),
    beadDesc: S('A sealed glass bead with an hour of somebody\'s life in it, certified by the Collegium. Swallowed, it undoes one death on the spot. Keep it until you need it.'),
    beadKeep: S('Keep it until you need it. It undoes a death, and nothing else.'),
    beadOne: S('You can only carry one hour-bead.'),
    beadDear: S('An hour-bead costs 120 sovereigns.'),
    beadBought: S('You buy an hour-bead.'),
    // the shortcuts
    chimneyUp: S('A chimney in the chalk, going down. A rope hangs in it, tied off far below, out of reach.'),
    chimneyUpOpen: S('Down the chimney on the rope, to the deepest gallery'),
    chimneyDeep: S('A chimney in the chalk, going up, and a rope down it. Climb it'),
    chimneyClimbed: S('You climb the chimney on the rope and come out at the shaft\'s foot. You tie the rope off at the top: it is a way down now, too.'),
    barDoor: S('An iron door in the gallery wall. It does not move: it is barred on the far side.'),
    barDoorOpen: S('The iron door between the sump passage and the pump-hall'),
    bar: S('An iron bar across the door, in two brackets. Use it to lift it out.'),
    barFar: S('The bar is on the other side.'),
    unbarred: S('You lift the bar out of its brackets and set it against the wall. The door swings. Nobody has to time the sump again.'),
    barGone: S('The bar, set against the wall where you left it.'),
    // the lamps' places
    lampFoot: S('The shaft\'s foot'), lampSeam: S('The floorstone seam'), lampAdit: S('The adit\'s foot'), lampStair: S('The foot of the stair'), lampGap: S('The Deep Grove\'s gap'),
    // the Options row
    optLabel: S('Souls rules '),
    optSmall: S('lamps to rest at, and the Piece: what you carried waits where you fell (Off: wake by the lamp and lose five coins, as before)'),
  };
  const NOTE = 174;                  // the Piece sounds the Reach's note, Growth and Root (Phase 89) [PROPOSED]
  const BEAD_PRICE = 120, WEEK = 8, WAKE_HP = 0.6;
  const UP = 'p85_galleries', DEEP = 'p85_antlerdeep', FLUME = 'p85_dryflume', GROVE = 'p85_deepgrove', ROAD_E = 'p79_road_e';
  // the lamps: where they stand, where you wake beside them, which place they belong to
  const LAMPS = [
    { id: 0, g: 'a', map: UP, x: 27.6, y: 2.6, wx: 26.6, wy: 3.4, dir: PI / 2, name: TX.lampFoot },
    { id: 1, g: 'a', map: DEEP, x: 24.6, y: 25.4, wx: 23.4, wy: 25.5, dir: 0, name: TX.lampSeam },
    { id: 2, g: 'f', map: FLUME, x: 3.7, y: 35.6, wx: 4.8, wy: 35.8, dir: -PI / 2, name: TX.lampAdit },
    { id: 3, g: 'f', map: FLUME, x: 57.6, y: 23.6, wx: 56.4, wy: 24.2, dir: PI, name: TX.lampStair },
    { id: 4, g: 'g', map: ROAD_E, x: 0, y: 0, wx: 0, wy: 0, dir: PI / 2, name: TX.lampGap },   // placed at the gap when the maps are built
  ];
  // the places: the maps you wake in from, the maps whose ordinary foes get up again, the keeper
  const GROUPS = {
    a: { maps: [UP, DEEP], revive: [UP, DEEP], keeper: (e) => e._p85a === 'keeper', kflag: 'p91k_a' },
    f: { maps: [FLUME], revive: [FLUME], keeper: (e) => e._p85 === 'keeper', kflag: 'p91k_f' },
    g: { maps: [GROVE, ROAD_E], revive: [], keeper: () => false, kflag: null },
  };
  const groupOf = (mapId) => { for (const k in GROUPS) if (GROUPS[k].maps.includes(mapId)) return k; return null; };
  const CHIMNEY_UP = [23, 7], CHIMNEY_DEEP = [37, 27], BAR_DOOR = [39, 9];
  const CHIMNEY_TOP = { x: 23.5, y: 6.2, dir: -PI / 2 }, CHIMNEY_FOOT = { x: 35.8, y: 27.5, dir: PI };

  // ---------------------------------------------------------------- the switch
  const KEY = 'octave.souls91.v1';
  const cfg = { on: true };
  function loadCfg() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o === 'object') cfg.on = o.on !== false; } catch (e) { /* defaults */ } }
  function saveCfg() { try { localStorage.setItem(KEY, JSON.stringify({ on: cfg.on })); } catch (e) { /* session only */ } }
  const on = () => cfg.on !== false;
  function setOn(v) { cfg.on = !!v; saveCfg(); try { sync(); } catch (e) { /* not started */ } }

  // ---------------------------------------------------------------- flags, read safely
  const f = () => G.flags;
  const fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(0, Math.min(max, Math.floor(v))) : 0; };
  const day = () => Math.max(0, Math.floor(Number(G.day) || 0));
  const litBits = () => fint('p91_lit', 31);
  const isLit = (L) => !!(litBits() & (1 << L.id));
  const lastOf = (g) => { const n = fint('p91_l' + g, LAMPS.length); return n > 0 && LAMPS[n - 1].g === g && isLit(LAMPS[n - 1]) ? LAMPS[n - 1] : null; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const hc = () => typeof hardcoreOn === 'function' && hardcoreOn();

  // the Piece, read from an untrusted save: a real map, a place inside it, sane numbers, or nothing
  function piece() {
    const p = G.player, q = p && p.p91piece; if (!q || typeof q !== 'object') return null;
    const m = G.maps && typeof q.m === 'string' && Object.prototype.hasOwnProperty.call(G.maps, q.m) ? G.maps[q.m] : null; if (!m) return null;
    const x = Number(q.x), y = Number(q.y); if (!Number.isFinite(x) || !Number.isFinite(y) || x < 0 || y < 0 || x > m.w || y > m.h) return null;
    const g = Math.max(0, Math.min(999999, Math.floor(Number(q.g) || 0))), xp = Math.max(0, Math.min(9999999, Math.floor(Number(q.xp) || 0)));
    if (!g && !xp) return null;
    return { m: q.m, x, y, g, xp };
  }

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn, glowTest) => {
      if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x);
      Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) });
      if (glowTest && Engine.setEmissive) { const px = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    // a hush-lamp on an iron post: a square iron cage with horn panes, a reed-whistle on its cap, hung from a bracket
    const lamp = (x, lit) => {
      const W = 40, H = 120;
      x.fillStyle = '#1e1c1a'; x.fillRect(18, 34, 4, H - 34);                       // the post
      x.fillStyle = '#3a3632'; x.fillRect(19, 34, 1, H - 36);
      x.fillStyle = '#1e1c1a'; x.fillRect(12, H - 6, 16, 6); x.fillRect(14, H - 9, 12, 3);   // its foot
      x.fillStyle = '#26231f'; x.fillRect(20, 34, 12, 3); x.fillRect(29, 34, 3, 6);  // the bracket
      // the cage, hung below the bracket's end
      const cx = 30, top = 40;
      x.fillStyle = '#2a2622'; x.fillRect(cx - 8, top, 16, 3); x.fillRect(cx - 7, top + 22, 14, 3);
      x.fillStyle = lit ? '#f6c66a' : '#4a4236'; x.fillRect(cx - 6, top + 3, 12, 19);
      if (lit) { x.fillStyle = '#ffe6a8'; x.fillRect(cx - 3, top + 7, 6, 12); x.fillStyle = '#fff6d8'; x.beginPath(); x.ellipse(cx, top + 14, 1.6, 3.6, 0, 0, PI * 2); x.fill(); }
      else { x.fillStyle = '#2e2a24'; x.fillRect(cx - 1, top + 12, 2, 7); }
      x.fillStyle = '#1a1816'; for (const dx of [-7, -1, 5]) x.fillRect(cx + dx, top + 2, 2, 21);   // the cage bars
      // the cap and its reed-whistle
      x.fillStyle = '#2a2622'; x.beginPath(); x.moveTo(cx - 9, top + 1); x.lineTo(cx, top - 6); x.lineTo(cx + 9, top + 1); x.closePath(); x.fill();
      x.fillStyle = '#8a7a52'; x.fillRect(cx - 1, top - 14, 2, 9); x.fillStyle = '#5a4e34'; x.fillRect(cx - 1, top - 10, 2, 1);
      if (!lit) { x.fillStyle = '#b8a070'; x.fillRect(cx - 1, top - 15, 2, 2); }   // the wax stopping it
      // a little rust, from fixed noise
      for (let i = 0; i < 14; i++) { x.fillStyle = 'rgba(120,60,30,0.35)'; x.fillRect(18 + (h2(i, 3) * 4 | 0), 40 + (h2(i, 5) * 70 | 0), 1, 2); }
      void W;
    };
    add('p91_lamp', 40, 120, 1.55, (x) => lamp(x, false));
    add('p91_lamplit', 40, 120, 1.55, (x) => lamp(x, true), (r, g, b, a) => a > 0 && r > 230 && g > 180);
    // the Piece: a low lilac shimmer, rings of motes about a pale core
    // (the renderer draws a pixel or it does not, so the shimmer is a dither of whole motes, thinning out from a pale
    // core low down and rising in a wisp, from fixed noise)
    add('p91_piece', 48, 64, 0.8, (x) => {
      for (let y = 0; y < 64; y++) for (let px = 0; px < 48; px++) {
        const dx = (px - 24) / 14, dy = (y - 54) / 7, ground = dx * dx + dy * dy;          // the pool on the floor
        const wx = (px - 24 - Math.sin(y * 0.18) * 3) / (2 + (64 - y) * 0.06), wisp = y < 54 ? wx * wx + Math.pow((54 - y) / 50, 2) * 0.6 : 9;
        const d = Math.min(ground, wisp), n = h2(px, y);
        if (d < 0.18) { x.fillStyle = n < 0.5 ? '#fbf6ff' : '#eadcff'; x.fillRect(px, y, 1, 1); }
        else if (d < 1 && n > 0.35 + d * 0.6) { x.fillStyle = n > 0.8 ? '#e2ccff' : n > 0.6 ? '#b996ee' : '#9672d6'; x.fillRect(px, y, 1, 1); }
      }
    }, (r, g, b, a) => a > 0 && b > 200 && r > 170);
    // the textures: a chalk wall with a chimney's dark mouth and a rope down it; an iron door in brick with its bar
    if (Engine.addTexture && !(Engine.textures && Engine.textures.t_p91_chimney)) {
      const tex = (name, fn) => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d', { willReadFrequently: true }); fn(x); try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
      tex('t_p91_chimney', (x) => {
        x.fillStyle = '#ddd7c6'; x.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 70; i++) { x.fillStyle = 'rgba(150,140,120,' + (0.15 + h2(i, 3) * 0.25).toFixed(2) + ')'; x.fillRect(h2(i, 5) * 64 | 0, h2(i, 7) * 64 | 0, 1 + (h2(i, 9) * 3 | 0), 1); }
        x.fillStyle = '#2a2620'; x.beginPath(); x.moveTo(18, 64); x.lineTo(16, 18); x.quadraticCurveTo(32, 4, 48, 18); x.lineTo(46, 64); x.closePath(); x.fill();
        x.fillStyle = '#14120e'; x.beginPath(); x.moveTo(22, 64); x.lineTo(21, 22); x.quadraticCurveTo(32, 11, 43, 22); x.lineTo(42, 64); x.closePath(); x.fill();
        for (let y = 12; y < 64; y += 3) { x.fillStyle = (y / 3) % 2 ? '#9a8458' : '#7a6640'; x.fillRect(31 + Math.round(Math.sin(y * 0.2)), y, 3, 3); }   // the rope, laid
        for (let i = 0; i < 8; i++) { x.fillStyle = 'rgba(120,110,92,0.5)'; x.fillRect(8 + (i % 2) * 44 + (h2(i, 17) * 4 | 0), 20 + i * 5, 4, 1); }   // notches either side
      });
      tex('t_p91_irondoor', (x) => {
        x.fillStyle = '#5a3a2c'; x.fillRect(0, 0, 64, 64);
        for (let r = 0; r < 8; r++) for (let k = 0; k < 4; k++) { const ox = (r % 2) * 8; x.fillStyle = 'rgba(30,18,12,0.6)'; x.fillRect((k * 16 + ox) % 64, r * 8, 1, 8); x.fillRect(0, r * 8, 64, 1); }
        x.fillStyle = '#26282a'; x.fillRect(10, 6, 44, 58); x.fillStyle = '#34373a'; x.fillRect(12, 8, 40, 56);
        for (const y of [12, 30, 48]) { x.fillStyle = '#1c1e20'; x.fillRect(12, y, 40, 3); for (let i = 0; i < 6; i++) { x.fillStyle = '#4a4e52'; x.fillRect(15 + i * 7, y + 1, 2, 1); } }
        for (let i = 0; i < 20; i++) { x.fillStyle = 'rgba(140,70,30,' + (0.2 + h2(i, 21) * 0.3).toFixed(2) + ')'; x.fillRect(12 + (h2(i, 23) * 38 | 0), 8 + (h2(i, 29) * 54 | 0), 2, 1 + (h2(i, 31) * 3 | 0)); }
        x.fillStyle = '#1a1a1c'; x.fillRect(8, 36, 48, 5); x.fillStyle = '#5a5e62'; x.fillRect(8, 36, 48, 1);   // the bar
        x.fillStyle = '#141416'; x.fillRect(10, 33, 4, 11); x.fillRect(50, 33, 4, 11);                             // its brackets
      });
    }
  }

  // ---------------------------------------------------------------- the hour-bead (an item; the merchants come with the Dunes)
  function items() {
    if (typeof ITEMS !== 'undefined' && !ITEMS.p91_bead) ITEMS.p91_bead = { name: TX.beadName, sprite: 'gear', value: BEAD_PRICE, use: 'p91_bead', desc: TX.beadDesc };
  }
  function buyBead() {
    const p = G.player; if (!p) return false;
    if (G.has('p91_bead')) { say(TX.beadOne, 'warn', 4000); return false; }
    if ((p.gold | 0) < BEAD_PRICE) { say(TX.beadDear, 'warn', 4000); return false; }
    p.gold -= BEAD_PRICE; G.give('p91_bead', 1); say(TX.beadBought, 'good', 4000); return true;
  }
  const beads = () => { const s = G.player && G.player.inv.find((q) => q && q.id === 'p91_bead'); return s ? s.n | 0 : 0; };

  // ---------------------------------------------------------------- the lamps and the shortcuts, put into the built maps
  function addBase(m, ent) { const at = m.baseCount == null ? m.entities.length : m.baseCount; m.entities.splice(at, 0, ent); if (m.baseCount != null) m.baseCount++; return ent; }
  function lampEnt(L) { return { kind: 'deco', sprite: 'p91_lamp', x: L.x, y: L.y, scale: 1, solid: true, radius: 0.22, label: TX.lamp, use: 'p91_lamp', _p91: 'lamp', _i: L.id, glow: 0, lightCol: [255, 196, 120] }; }
  function join(maps) {
    const up = maps[UP], deep = maps[DEEP], fl = maps[FLUME], road = maps[ROAD_E];
    if (up && !up._p91) {
      up._p91 = true; addBase(up, lampEnt(LAMPS[0]));
      up.set(CHIMNEY_UP[0], CHIMNEY_UP[1], DOOR({ tex: 't_p91_chimney', portal: { map: DEEP, x: CHIMNEY_FOOT.x, y: CHIMNEY_FOOT.y, dir: CHIMNEY_FOOT.dir }, label: TX.chimneyUpOpen, locked: 'p91_sca', lockMsg: TX.chimneyUp }));
    }
    if (deep && !deep._p91) {
      deep._p91 = true; addBase(deep, lampEnt(LAMPS[1]));
      deep.set(CHIMNEY_DEEP[0], CHIMNEY_DEEP[1], DOOR({ tex: 't_p91_chimney', portal: { map: UP, x: CHIMNEY_TOP.x, y: CHIMNEY_TOP.y, dir: CHIMNEY_TOP.dir }, label: TX.chimneyDeep }));
    }
    if (fl && !fl._p91) {
      fl._p91 = true; addBase(fl, lampEnt(LAMPS[2])); addBase(fl, lampEnt(LAMPS[3]));
      fl.set(BAR_DOOR[0], BAR_DOOR[1], DOOR({ tex: 't_p91_irondoor', label: TX.barDoorOpen, locked: 'p91_scf', lockMsg: TX.barDoor }));
      addBase(fl, { kind: 'deco', sprite: 'p83_none', x: BAR_DOOR[0] + 1.35, y: BAR_DOOR[1] + 0.5, scale: 0.4, solid: false, radius: 0.15, label: TX.bar, use: 'p91_bar', _p91: 'bar' });
    }
    if (road && maps[GROVE] && !road._p91 && typeof GROVE85 !== 'undefined' && GROVE85.gap && GROVE85.gap()) {
      road._p91 = true; const gp = GROVE85.gap();
      const fr = typeof travelFreeNear === 'function' ? travelFreeNear(road, gp.x - 2.4, gp.y + 0.9) : null, L = LAMPS[4];
      L.x = fr ? fr[0] : gp.x - 2.4; L.y = fr ? fr[1] : gp.y + 0.9;
      const wf = typeof travelFreeNear === 'function' ? travelFreeNear(road, L.x + 0.9, L.y + 0.5) : null; L.wx = wf ? wf[0] : L.x + 0.9; L.wy = wf ? wf[1] : L.y + 0.5;
      addBase(road, lampEnt(L));
    }
  }

  // ---------------------------------------------------------------- what the lamps and the doors show, from the flags
  function sync() {
    if (typeof G === 'undefined' || !G.map || !G.flags || !Array.isArray(G.ents)) return;
    const bits = litBits(), live = on();
    for (const e of G.ents) {
      if (!e || !e._p91) continue;
      if (e._p91 === 'lamp') { const lit = live && !!(bits & (1 << e._i)); e.sprite = lit ? 'p91_lamplit' : 'p91_lamp'; e.glow = lit ? 0.95 : 0; e.label = lit ? TX.lampLit : TX.lamp; e.hidden = !live; e.solid = live; e.use = live ? 'p91_lamp' : undefined; }
      else if (e._p91 === 'bar') { const done = fint('p91_scf', 1) === 1; e.label = done ? TX.barGone : TX.bar; }
    }
  }

  // ---------------------------------------------------------------- lighting by standing, resting by using
  function light(L) {
    f().p91_lit = litBits() | (1 << L.id); f()['p91_l' + L.g] = L.id + 1; sync(); say(TX.lit, 'good', 6000);
    try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.song) Audio_.sfx.song(1760, 0.3); } catch (e) { /* audio is optional */ }
  }
  function hunted() { const c = Engine.cam; return G.ents.some((e) => e && e.kind === 'enemy' && !e.dead && e.state === 'chase' && Math.hypot(e.x - c.x, e.y - c.y) < 12); }
  function revive(e) {
    e.dead = false; e.hidden = false; e.solid = true; e.hp = e.hpMax || (e.def && e.def.hp) || 1; e.x = e.homeX; e.y = e.homeY;
    e.state = e.passive ? 'passive' : 'idle'; e.alertT = 0; e.cool = 0; e.stun = 0; e.wanderT = 0;
    if (e.investigation) e.investigation = null;
  }
  // the place's ordinary foes get up where they first stood; the keeper only once it has been down a week
  function refill(g) {
    const G0 = GROUPS[g]; let n = 0, keeper = false;
    for (const id of G0.revive) {
      const m = G.maps && G.maps[id]; if (!m) continue;
      const base = m.baseCount != null ? m.baseCount : m.entities.length, ents = id === G.mapId ? G.ents : m.entities;
      for (const e of ents) {
        if (!e || e.kind !== 'enemy' || !e.dead || !e.def || e.def.core || e.def.boss || e.def.wildsBoss || e.lawGuard) continue;
        if (m.entities.indexOf(e) < 0 || m.entities.indexOf(e) >= base) continue;   // only what the place was built with
        if (G0.keeper(e)) { const d = fint(G0.kflag, 1e6); if (d > 0 && day() - d >= WEEK) { revive(e); f()[G0.kflag] = 0; keeper = true; } continue; }
        revive(e); n++;
      }
    }
    return { n, keeper };
  }
  function rest(L) {
    if (hunted()) { say(TX.hunted, 'warn', 3500); return; }
    const p = G.player; if (!isLit(L)) light(L);
    f()['p91_l' + L.g] = L.id + 1;
    try { if (typeof passHours === 'function') passHours(1); } catch (e) { /* the clock is optional */ }
    p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = typeof fatCap === 'function' ? fatCap() : p.fatMax; G.stillT = 0; G.noise = 2;
    const r = refill(L.g);
    say(TX.rest, 'good', 7000);
    if (L.g === 'a' && typeof ANTLER85 !== 'undefined' && ANTLER85.setOil) { ANTLER85.setOil(ANTLER85.OIL_MAX); f().p85a_oil = ANTLER85.OIL_MAX; say(TX.restOil, 'good', 5000); }
    if (!hc() && typeof UPG === 'object' && UPG && typeof snapshotGame === 'function') { try { UPG.autosaveSlot = snapshotGame(); UPG.autosaveWhen = 'by the lamp, ' + G.map.name + ' (day ' + day() + ')'; say(TX.restSaved, '', 4000); } catch (e) { warnOnce('save', e); } }
    if (r.keeper) setTimeout(() => say(TX.keeperBack, 'bad', 6000), 1200);
    sync();
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p91_/.test(e.use) || typeof G === 'undefined' || !G.map) return false;
    if (e.use === 'p91_lamp') { if (!on()) return true; const L = LAMPS[e._i]; if (L) rest(L); return true; }
    if (e.use === 'p91_bar') {
      if (fint('p91_scf', 1) === 1) { say(TX.barGone, '', 3000); return true; }
      if (Engine.cam.x < BAR_DOOR[0] + 0.5) { say(TX.barFar, 'warn', 3500); return true; }
      f().p91_scf = 1; const k = BAR_DOOR[1] * G.map.w + BAR_DOOR[0]; if (G.map.doors[k]) G.map.doors[k].target = 1;
      try { Audio_.sfx.door(); } catch (err) { /* */ } say(TX.unbarred, 'good', 7000); sync(); return true;
    }
    return false;
  }

  // ---------------------------------------------------------------- dying: the Piece, waking by the lamp, the hour-bead
  let fell = null;   // where the last death happened, until the wake
  function placePiece() {
    if (!G.map || !Array.isArray(G.ents)) return;
    // the list is the map's own (G.ents is G.map.entities): take the old shimmer out in place, never a new array
    for (const list of [G.ents, G.map.entities]) if (Array.isArray(list)) for (let i = list.length - 1; i >= 0; i--) if (list[i] && list[i]._p91piece) list.splice(i, 1);
    const q = on() ? piece() : null; if (!q || q.m !== G.mapId) return;
    const ent = { kind: 'deco', sprite: 'p91_piece', x: q.x, y: q.y, scale: 1, solid: false, radius: 0.05, transient: true, _decor: true, _p91piece: true, label: TX.pieceLabel, glow: 0.6, lightCol: [170, 130, 230], hidden: true };
    G.ents.push(ent);
  }
  function takePiece(q) {
    const p = G.player; p.p91piece = null;
    p.gold = (p.gold | 0) + q.g; p.xp = (Number(p.xp) || 0) + q.xp;
    say(q.g ? TX.pieceHomeN.replace('{0}', String(q.g)) : TX.pieceHome, 'good', 6000);
    try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.song) Audio_.sfx.song(NOTE * 4, 0.5); } catch (e) { /* audio is optional */ }
    try { checkLevel(); } catch (e) { warnOnce('level', e); }
    placePiece(); hum(0, 0);
  }
  function wakeAt(L) {
    const pos = { x: L.wx, y: L.wy, dir: L.dir };
    if (G.mapId !== L.map) { loadMap(L.map, pos); G.state = 'play'; }
    else { Engine.cam.x = pos.x; Engine.cam.y = pos.y; Engine.cam.dir = pos.dir; }
    if (G.player) { G.player.x = Engine.cam.x; G.player.y = Engine.cam.y; }
  }
  function wireDeath() {
    if (typeof die !== 'function' || typeof document === 'undefined') return;
    const _die = die;
    die = function (src) {
      const was = G.dead;
      if (!was && G.player && Engine && Engine.cam) fell = { m: G.mapId, x: Engine.cam.x, y: Engine.cam.y };
      const r = _die.apply(this, arguments);
      if (was) return r;
      try {
        let b = document.getElementById('btn-p91-bead'); if (b) b.remove();
        const ol = document.getElementById('p91-death-line'); if (ol) ol.remove();
        if (hc()) return r;
        const p = G.player, wake = document.getElementById('btn-wake');
        // its own line under the death's text, so the death's own words stay whole (they are translated as one)
        let line = document.getElementById('p91-death-line'); if (line) line.remove();
        if (on() && ((p.gold | 0) > 0 || (Number(p.xp) || 0) > 0)) { const x = document.getElementById('death-text'); if (x && x.parentNode) { line = document.createElement('p'); line.id = 'p91-death-line'; line.className = x.className; line.textContent = TX.deathLine; x.parentNode.insertBefore(line, x.nextSibling); } }
        if (G.has('p91_bead') && wake && wake.parentNode) {
          b = document.createElement('button'); b.className = 'dfbtn'; b.id = 'btn-p91-bead'; b.type = 'button'; b.textContent = TX.bead;
          b.onclick = () => undo(); wake.parentNode.insertBefore(b, wake);
        }
        const auto = document.getElementById('btn-auto-load');
        if (auto && typeof UPG === 'object' && UPG && /^by the lamp/.test(UPG.autosaveWhen || '')) auto.textContent = TX.autoLamp;
      } catch (e) { warnOnce('die', e); }
      return r;
    };
    const wake = document.getElementById('btn-wake'); if (!wake) return;
    const orig = wake.onclick;
    wake.onclick = function () {
      if (!on() || hc() || !G.dead || !G.player) return orig ? orig.apply(this, arguments) : undefined;
      const p = G.player, at = fell || { m: G.mapId, x: Engine.cam.x, y: Engine.cam.y };
      const g = Math.max(0, p.gold | 0), xp = Math.max(0, Math.floor(Number(p.xp) || 0));
      p.p91piece = g || xp ? { m: at.m, x: at.x, y: at.y, g, xp } : null;   // a Piece not reached before this death is gone
      p.gold = 0; p.xp = 0;
      const r = orig ? orig.apply(this, arguments) : undefined;
      p.gold = 0;
      const grp = groupOf(at.m), L = grp ? lastOf(grp) : null;
      try { if (L) wakeAt(L); } catch (e) { warnOnce('wake', e); }
      say(L ? TX.wake : TX.wakeNoLamp, 'warn', 6500);
      fell = null; placePiece(); sync();
      return r;
    };
  }
  // the hour-bead: the death comes undone where it happened, and no Piece is left
  function undo() {
    if (!G.dead || hc() || !G.has('p91_bead')) return false;
    G.take('p91_bead'); hide('#death'); G.dead = false; G.state = 'play'; G.keys = {};
    const p = G.player; p.hp = Math.max(1, Math.ceil(p.hpMax * WAKE_HP)); if (p.glass >= 100) p.glass = 85;
    if (fell && fell.m === G.mapId) { Engine.cam.x = fell.x; Engine.cam.y = fell.y; }
    const c = Engine.cam; for (const e of G.ents) if (e && e.kind === 'enemy' && !e.dead && Math.hypot(e.x - c.x, e.y - c.y) < 6) e.stun = Math.max(e.stun || 0, 2);
    fell = null; G.stillT = 0;
    const b = document.getElementById('btn-p91-bead'); if (b) b.remove();
    say(TX.beadUsed, 'good', 7000);
    return true;
  }

  // the Piece's note: one sine and its octave, panned to where it lies, heard from fourteen steps, seen from four
  let humNode = null;
  function hum(level, pan) {
    try {
      const A = typeof Audio_ !== 'undefined' ? Audio_ : null, ctx = A && A.ctx; if (!ctx || !A.sfxBus) return;
      if (!humNode) { if (level <= 0) return;
        const o = ctx.createOscillator(), o2 = ctx.createOscillator(), g = ctx.createGain(), g2 = ctx.createGain(), pn = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
        o.type = 'sine'; o.frequency.value = NOTE; o2.type = 'sine'; o2.frequency.value = NOTE * 2.003; g2.gain.value = 0.25; g.gain.value = 0.0001;
        o.connect(g); o2.connect(g2).connect(g); if (pn) { g.connect(pn); pn.connect(A.sfxBus); } else g.connect(A.sfxBus); o.start(); o2.start();
        humNode = { o, o2, g, pn, level: 0 };
      }
      const want = A.muted ? 0 : Math.max(0, Math.min(1, level));
      if (Math.abs(want - humNode.level) > 0.004) { humNode.level = want; humNode.g.gain.setTargetAtTime(Math.max(0.0001, want * 0.05), ctx.currentTime, 0.2); }
      if (humNode.pn) humNode.pn.pan.setTargetAtTime(Math.max(-1, Math.min(1, pan || 0)), ctx.currentTime, 0.1);
    } catch (e) { warnOnce('hum', e); }
  }

  // ---------------------------------------------------------------- every frame
  let clock = 0;
  function tick(dt) {
    if (typeof G === 'undefined' || !G.map || G.state !== 'play' || !G.player) { hum(0, 0); return; }
    clock += dt;
    const c = Engine.cam;
    if (on()) for (const L of LAMPS) if (L.map === G.mapId && !isLit(L) && L.x && Math.hypot(c.x - L.x, c.y - L.y) < 1.6) light(L);
    // a keeper put down: the day goes on the flag, so it stays down a week
    const grp = groupOf(G.mapId), G0 = grp && GROUPS[grp];
    if (G0 && G0.kflag && !fint(G0.kflag, 1e6)) for (const e of G.ents) if (e && e.kind === 'enemy' && e.dead && G0.keeper(e)) { f()[G0.kflag] = day() || 1; break; }
    // the Piece
    const q = on() ? piece() : null;
    if (q && q.m === G.mapId) {
      const d = Math.hypot(c.x - q.x, c.y - q.y);
      const ent = G.ents.find((e) => e && e._p91piece); if (!ent) placePiece();
      else { ent.hidden = d > 4; ent.glow = 0.45 + 0.2 * Math.sin(clock * 2.1); ent.x = q.x; ent.y = q.y; }
      if (d < 1.0) { takePiece(q); return; }
      const rel = Math.atan2(q.y - c.y, q.x - c.x) - c.dir;
      hum(d < 14 ? Math.pow(1 - d / 14, 2) : 0, Math.sin(rel));
    } else hum(0, 0);
  }

  // ---------------------------------------------------------------- the Options row
  function wireOptions() {
    if (typeof renderAccessibilityMenu !== 'function' || typeof document === 'undefined') return;
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () {
      const r = _acc.apply(this, arguments);
      try {
        const grid = document.querySelector('#modal-panel .ctl-grid');
        if (grid && !document.getElementById('p91-souls')) {
          const label = document.createElement('span'); label.className = 'gfx-label'; label.appendChild(document.createTextNode(TX.optLabel));
          const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = TX.optSmall; label.appendChild(sm);
          const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'p91-souls'; b.type = 'button'; b.setAttribute('aria-label', TX.optLabel.trim());
          const s = () => { b.textContent = on() ? 'On' : 'Off'; b.setAttribute('aria-pressed', on() ? 'true' : 'false'); };
          b.onclick = () => { setOn(!on()); s(); }; s(); grid.appendChild(label); grid.appendChild(b);
        }
      } catch (e) { /* the menu still opens without the row */ }
      return r;
    };
  }

  // ---------------------------------------------------------------- wiring
  let prevMap = null;
  function wire() {
    loadCfg(); items(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { items(); art(); join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof useItem === 'function') { const _ui = useItem; useItem = function (slot) { if (slot && slot.id === 'p91_bead') { say(TX.beadKeep, '', 4000); return undefined; } return _ui.apply(this, arguments); }; }
    if (typeof loadMap === 'function') {
      const _l = loadMap;
      loadMap = function (id, pos) {
        const from = typeof G !== 'undefined' ? G.mapId : null;
        const r = _l.apply(this, arguments);
        try {
          // up the chimney from the den: the rope is tied off at the top from now on
          if (from === DEEP && G.mapId === UP && pos && Math.hypot(pos.x - CHIMNEY_TOP.x, pos.y - CHIMNEY_TOP.y) < 0.8 && fint('p91_sca', 1) !== 1) { f().p91_sca = 1; say(TX.chimneyClimbed, 'good', 7000); }
          prevMap = from; placePiece(); sync();
        } catch (e) { warnOnce('load', e); }
        return r;
      };
    }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(Number(dt) || 0); sync(); } catch (e) { warnOnce('tick', e); } return r; }; }
    wireDeath(); wireOptions();
  }
  wire();

  return { TX, TEXTS, LAMPS, GROUPS, NOTE, BEAD_PRICE, WEEK, CHIMNEY_UP, CHIMNEY_DEEP, BAR_DOOR, CHIMNEY_TOP, CHIMNEY_FOOT,
    on, setOn, cfg, join, sync, useOwn, rest, refill, light, piece, placePiece, undo, buyBead, beads, groupOf, lastOf, isLit, tick, art, items,
    prevMap: () => prevMap, fell: () => fell };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = SOULS91;
if (typeof window !== 'undefined') window.SOULS91 = SOULS91;
