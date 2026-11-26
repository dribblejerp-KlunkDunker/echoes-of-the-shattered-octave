// ============================================================
//  quarrywork127 — Phase 127: the quarry at work, between its scenes. The design is
//  story/Game Layer/Phase 127 - The callings, part two (design, for the builder).md (§4); the record is
//  story/Game Layer/Phase 127 - The callings, part two.md. Everything here is [PROPOSED] unless a line says it is the book's.
//
//  WHO, WHERE, WHEN
//    * The workings (the quarry map): five men of the two shifts, through js/life60.js (LIFE60.add('quarry', …)), the same
//      men life74 walks up and down the track on the rim (js/life74-smallplaces.js): they come down the headframe ladder
//      and go to the depot, the drums, the spoil; the night shift has the store and the pump hall door. The book gives two
//      shifts and no clock hours; the change at six is life74's own (kept).
//    * The pumps: "There were men at the pumps. A dozen of them, in grey smocks, working the long iron handles in pairs, up
//      and down, with a rhythm so perfect it looked like clockwork" (MS 1777). They are Hollows, "Catalogue labor" (MS 1779),
//      never quarrymen. Six in the quarry's pump hall (a pair at each of its three pumps), and in the Root-vault casing the
//      book's dozen: a pair at each of the four pumps, a third standing ready at three of them, and the map's own "Hollow at
//      the pumps" makes twelve. One long iron handle a pump, drawn in code, rocking on one beat for the whole room.
//    * The rim: the clerk at the headframe (MS 1707, 2598), a figure of this module's own, so LIFE60's clearing roster
//      (life74's) is never replaced.
//  CONTRACT
//    * Everything staged is transient, non-solid, never saved, never an enemy (kind npc or deco). Positions come from the
//      maps' own named rooms; the seeded dungeons are not touched.
//    * Gone from the Rite on (rite_started, or js/rite43.js at stage 1 or more), the Greening, the escape, Parts 3 and 4: both
//      shifts are on the rails (MS 2944), and js/rite43.js stages its own twelve.
//    * A fight in the workings (a live enemy in chase; js/tamsin52.js's stage 1) stands the shift down: they walk to the ladder
//      and go up. The pump men keep working: nobody stops them (MS 1779).
//    * The switch GFX.quarryWork: off in Original and Low. Off, nothing is staged and nothing drawn, so every map's entity
//      list is what it was. No random numbers here (LIFE60's own private stream is not the game's random source), never Engine.render,
//      and the poses are presentation only (inside animDeco, from ANIM.T).
// ============================================================
'use strict';

const QUARRYWORK127 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags && G.map;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('quarrywork127: ' + k + ' failed', e); } };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const PI = Math.PI;

  // ================================================================ the words (§5 of the design)
  const TX = {
    optLabel: S('The quarry at work'),
    optHint: S('the shifts, the pumps and the men at them, between the scenes'),
    optOn: S('shown'),
    dayGreet: S('"Down at six, up at the Listening Hour. In between, the drums and the spoil, and the bore in your teeth."'),
    bark: S('A quarryman, low: "Mind the channels. There\'s glass in them."'),
    barkNight: S('A quarryman of the night shift, low: "Lit all night. It\'s never dark down here."'),
    clerkTitle: S('The clerk at the headframe'),
    clerkText: S('Consortium drab, ink on his cuffs, a tally-book on the trestle and a lever at his hand. He looks at everyone who comes up the track, at their disc, and for a long moment at their hands. Nobody up here looks at the mast.'),
  };
  const optOff = () => { try { return CALLINGS126.TX.optOff; } catch (e) { return 'hidden'; } };
  const back = () => { try { return CALLINGS126.TX.back; } catch (e) { return 'Step back'; } };

  // ================================================================ the switch
  const FLAG = 'quarryWork';
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = false;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const sw = () => typeof GFX !== 'undefined' && !!GFX[FLAG];
  const rite = () => { try { return typeof RITE43 === 'object' && RITE43.stage() >= 1; } catch (e) { return false; } };
  function gone() {
    if (!hasG()) return true;
    const f = F();
    return !!(f.rite_started || f.greening || f.escaped || f.part3 || f.part4) || rite();
  }
  const on = () => sw() && !gone();
  const MAPS = ['quarry', 'rootvault', 'clearing'];

  // ================================================================ the art (code-drawn, once)
  function paint() {
    if (typeof Engine === 'undefined' || !Engine.sprites) return;
    try {
      if (typeof LIFE60 === 'object' && Engine.sprites.townsman) {
        LIFE60.variant('townsman', 'p60_man_drab', 75, 0.35, 0.78);    // Consortium drab, a dull olive-grey (MS 1723, 2598) [PROPOSED colour]
        LIFE60.variant('townsman', 'p60_man_drab2', 60, 0.28, 0.7);
      }
      if (!Engine.sprites.p127_handle) {
        // a long iron handle: a bar with a lighter top edge, a pivot boss in the middle (24x5)
        const w = 24, h = 5, d = new Uint32Array(w * h);
        const px = (x, y, r, g, b) => { d[y * w + x] = (255 << 24) | (b << 16) | (g << 8) | r; };
        for (let x = 0; x < w; x++) { px(x, 1, 122, 122, 130); px(x, 2, 90, 90, 96); px(x, 3, 66, 66, 72); }
        for (const x of [0, w - 1]) for (let y = 1; y < 4; y++) px(x, y, 58, 58, 64);
        for (let y = 0; y < 5; y++) for (let x = 10; x < 14; x++) px(x, y, y === 0 ? 110 : 50, y === 0 ? 110 : 50, y === 0 ? 118 : 56);
        Engine.addSprite('p127_handle', { w, h, data: d, hs: 0.19, cx: 0.5, dy: 0 });
      }
    } catch (e) { warnOnce('paint', e); }
  }

  // ================================================================ the workings' roster (from the map's own rooms)
  const PLACE = {};   // the roster as built, for the record and the test
  function life74(key) { try { return (LIFE74.ROSTERS.clearing || []).find((p) => p.key === key) || {}; } catch (e) { return {}; } }
  function doorOf(m, r) {   // the first opening in a room's wall, scanning its edge: a cell just inside it, and the way in
    for (let x = r.x; x < r.x + r.w; x++) { if (!m.isSolidCell(x, r.y - 1)) return [x + 0.5, r.y + 0.6, PI / 2]; if (!m.isSolidCell(x, r.y + r.h)) return [x + 0.5, r.y + r.h - 0.6, -PI / 2]; }
    for (let y = r.y; y < r.y + r.h; y++) { if (!m.isSolidCell(r.x - 1, y)) return [r.x + 0.6, y + 0.5, 0]; if (!m.isSolidCell(r.x + r.w, y)) return [r.x + r.w - 0.6, y + 0.5, PI]; }
    return [r.cx + 0.5, r.cy + 0.5, 0];
  }
  // (found building it) The quarry's rooms are joined by closed doors (js/maps.js genDungeon), and LIFE60 walks only open
  // ground. A walker never opens a door: that would change what the Legion can see (js/game.js los). So a man whose work
  // is beyond a door comes and goes at the door nearest the ladder on his way (the cell just through it), as LIFE60's
  // people go in at their own doors; the men of the entrance's own galleries come and go at the ladder itself.
  function cellOpen(m, x, y, doors) {
    if (x < 0 || y < 0 || x >= m.w || y >= m.h) return false;
    const c = m.get(x, y); if (c && !(doors && c.door)) return false;
    for (const e of m.entities || []) if (e && !e.transient && e.kind === 'deco' && e.solid !== false && e.radius >= 0.3 && Math.floor(e.x) === x && Math.floor(e.y) === y) return false;
    return true;
  }
  function viaDoor(m, a, b) {   // walking a to b with doors passable: the open cell just past the last door, or null
    const W = m.w, H = m.h, prev = new Int32Array(W * H).fill(-1), q = [];
    const s = Math.floor(a[1]) * W + Math.floor(a[0]), t = Math.floor(b[1]) * W + Math.floor(b[0]);
    prev[s] = s; q.push(s);
    for (let qi = 0; qi < q.length; qi++) {
      const c = q[qi]; if (c === t) break;
      const cx = c % W, cy = (c / W) | 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = cx + dx, ny = cy + dy, n = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= H || prev[n] !== -1 || !cellOpen(m, nx, ny, true)) continue; prev[n] = c; q.push(n); }
    }
    if (prev[t] === -1) return null;
    const cells = []; for (let c = t; c !== s; c = prev[c]) cells.push(c); cells.reverse();
    let after = -1;
    for (let i = 0; i < cells.length - 1; i++) { const c = m.get(cells[i] % W, (cells[i] / W) | 0); if (c && c.door) after = cells[i + 1]; }
    return after < 0 ? null : [(after % W) + 0.5, ((after / W) | 0) + 0.5];
  }
  function rosterFor(m) {
    const e = m.entrance, N = m.named || {}, dp = N.depot, sh = N.shaft, st = N.store, ph = N.pumphall, br = N.barracks;
    if (!e || !dp || !sh || !st || !ph || !br || !m.spawn) return null;
    const LADDER = [m.spawn.x, m.spawn.y];
    const ENT = [e.x + e.w - 1.3, e.y + e.h - 1.3];                  // by the entrance's crates
    // the entrance's own gallery: the first other room the ladder reaches without a door
    let GAL = null;
    for (const r of m.rooms || []) {
      if (r === e || GAL) continue;
      const p = [r.x + 1.5, r.y + 1.5];
      if (cellOpen(m, p[0] | 0, p[1] | 0, false) && !viaDoor(m, LADDER, p) && LIFE60.path(m, LADDER[0], LADDER[1], p[0], p[1])) GAL = p;
    }
    GAL = GAL || [e.x + 1.5, e.y + 1.5];
    const LEVER = [sh.x + 1.3, sh.cy + 0.5];                          // at the shaft room's lever, facing it
    const SCAFF = [18.5, 20.3];                                       // under the barracks scaffold (js/rigging12.js SCAFFS, 18.5, 19.4)
    const STORE = [st.x + 1.5, st.y + 1.5];
    const [dx, dy, dface] = doorOf(m, ph);
    const DOOR = [dx, dy];
    const DEPOT = [dp.x + 1.5, dp.y + dp.h - 2.5];                    // the floor at the foot of the loading terrace
    const door = (p) => viaDoor(m, LADDER, p) || LADDER;
    const a = life74('cl_dayA'), b = life74('cl_dayB'), na = life74('cl_nightA'), nb = life74('cl_nightB');
    const dayName = a.name || 'A quarryman, day shift', nightName = na.name || 'A quarryman, night shift';
    const H = (from, to) => ({ from, to, job: 'home' });
    const W9 = (a.work) || null;
    const R = [
      // down the ladder at the change, and between the entrance's crates and its gallery
      { key: 'q127_dayA', name: dayName, sprite: 'p60_man_drab', home: LADDER,
        day: [H(17.4, 6.7), { from: 6.7, to: 17.4, job: 'carry', at: ENT, to2: GAL }],
        greet: TX.dayGreet, work: W9, barks: [TX.bark] },
      // the cable-drums and the gantries: the shaft room's lever, and the barracks scaffold at midday
      { key: 'q127_dayB', name: dayName, sprite: 'p60_man_drab2', home: door(LEVER),
        day: [H(17.4, 6.8), { from: 6.8, to: 11, job: 'reach', at: LEVER, face: PI }, { from: 11, to: 13, job: 'hammer', at: SCAFF, face: -PI / 2 }, { from: 13, to: 17.4, job: 'reach', at: LEVER, face: PI }],
        greet: b.greet || TX.dayGreet, barks: (b.barks || []).slice(0, 1) },
      // the spoil in the store
      { key: 'q127_dayC', name: dayName, sprite: 'p60_man_drab', home: door(STORE),
        day: [H(17.5, 6.9), { from: 6.9, to: 17.5, job: 'rake', at: STORE, area: 1.2 }],
        greet: W9 || TX.dayGreet, barks: [TX.bark] },
      { key: 'q127_nightA', name: nightName, sprite: 'p60_man_drab2', home: LADDER,
        day: [H(6.0, 18.4), { from: 18.4, to: 6.0, job: 'carry', at: ENT, to2: GAL }],
        greet: na.greet || TX.barkNight, barks: (na.barks || []).slice(0, 1) },
      // the night-shift man at the pump hall door, watching the pumps
      { key: 'q127_nightB', name: nightName, sprite: 'p60_man_drab', home: door(DOOR),
        day: [H(6.0, 18.5), { from: 18.5, to: 6.0, job: 'watch', at: DOOR, face: dface }],
        greet: nb.greet || TX.barkNight, barks: [TX.barkNight] },
    ];
    PLACE.quarry = { LADDER, ENT, GAL, DEPOT, LEVER, SCAFF, STORE, DOOR, homes: R.map((p) => [p.key, p.home]) };
    return R;
  }
  const fight = () => {
    try {
      if (!hasG() || G.mapId !== 'quarry') return false;
      if (typeof TAMSIN52 === 'object' && TAMSIN52.stage() === 1) return true;
      for (const e of G.ents) if (e && e.kind === 'enemy' && !e.dead && !e.hidden && !e.dying && e.state === 'chase') return true;
    } catch (e) { /* none */ }
    return false;
  };
  let registered = false;
  function register(maps) {
    if (registered || typeof LIFE60 !== 'object') return;
    const m = maps && maps.quarry; if (!m) return;
    const R = rosterFor(m); if (!R) return;
    registered = true;
    LIFE60.add('quarry', R, { gone: () => !on(), down: fight });
  }

  // ================================================================ the pumps and the rim: decos of the module's own
  const RITE = () => { try { return RITE43.TX; } catch (e) { return { lookPump: 'A man at the pumps', lookPumpHooked: 'Grey smock, both hands on the handle, up and down. You do not look at a pump.' }; } };
  const inRoom = (r, e) => !!r && e.x >= r.x && e.x <= r.x + r.w && e.y >= r.y && e.y <= r.y + r.h;
  function plan(m) {
    const out = [];
    const rt = RITE();
    const man = (k, x, y, pi, side, facing) => out.push({ kind: 'deco', sprite: 'hollow', x, y, scale: 0.95, solid: false, radius: 0.28, use: 'q127_pump', label: rt.lookPump, facing, _q127: k, _pump: pi, _side: side });
    const handle = (k, x, y, pi) => out.push({ kind: 'deco', sprite: 'p127_handle', x, y, yOff: -0.42, scale: 1, solid: false, radius: 0.1, nopick: true, label: rt.lookPump, _q127: k, _pump: pi, _handle: true });
    if (m.id === 'quarry') {
      const ph = m.named && m.named.pumphall; if (!ph) return out;
      const pumps = (m.entities || []).filter((e) => e && !e.transient && e.kind === 'deco' && e.sprite === 'pump' && inRoom(ph, e));
      let n = 0;
      pumps.forEach((p, pi) => {
        man('pm' + n++, p.x - 0.55, p.y + 0.45, pi, 1, 0); man('pm' + n++, p.x + 0.55, p.y + 0.45, pi, -1, PI);
        handle('ph' + pi, p.x, p.y + 0.45, pi);
      });
    } else if (m.id === 'rootvault') {
      const cs = m.casingRoom || (m.named && m.named.casing); if (!cs) return out;
      const pumps = (m.entities || []).filter((e) => e && !e.transient && e.kind === 'deco' && e.sprite === 'pump' && inRoom(cs, e));
      let n = 0;
      pumps.forEach((p, pi) => {   // js/rite43.js's own places at a pump: a pair either side, a third behind at [0, 0.8]
        man('pm' + n++, p.x - 0.75, p.y + 0.15, pi, 1, 0); man('pm' + n++, p.x + 0.75, p.y + 0.15, pi, -1, PI);
        if (pi < 3) man('pm' + n++, p.x, p.y + 0.8, pi, 0, -PI / 2);
        handle('ph' + pi, p.x, p.y + 0.15, pi);
      });
    } else if (m.id === 'clearing') {
      out.push({ kind: 'deco', sprite: 'p60_man_drab', x: 22.3, y: 5.4, scale: 1, solid: false, radius: 0.25, use: 'q127_clerk', label: TX.clerkTitle, facing: PI * 0.85, _q127: 'rimclerk' });
    }
    return out;
  }
  const stats = { staged: 0, animMs: 0, tickMs: 0, frames: 0, sumA: 0, sumT: 0, reset() { stats.animMs = 0; stats.tickMs = 0; stats.frames = 0; stats.sumA = 0; stats.sumT = 0; }, frameMs() { return stats.frames ? (stats.sumA + stats.sumT) / stats.frames : 0; } };
  function unstage(m) {
    if (!m || !Array.isArray(m.entities)) return;
    for (let i = m.entities.length - 1; i >= 0; i--) if (m.entities[i] && m.entities[i]._q127) m.entities.splice(i, 1);
    if (hasG() && G.map === m && G.ents !== m.entities) for (let i = G.ents.length - 1; i >= 0; i--) if (G.ents[i] && G.ents[i]._q127) G.ents.splice(i, 1);
  }
  function stage(m) {
    if (!m || MAPS.indexOf(m.id) < 0 || !Array.isArray(m.entities)) return;
    if (!on()) { unstage(m); stats.staged = 0; return; }
    paint();
    let n = 0;
    for (const d of plan(m)) {
      if (m.entities.some((e) => e && e._q127 === d._q127)) { n++; continue; }
      const e = Object.assign(d, { transient: true, _decor: true });
      m.entities.push(e); n++;
      if (hasG() && G.map === m && G.ents !== m.entities && !G.ents.includes(e)) G.ents.push(e);
    }
    stats.staged = n;
  }
  function resync() {
    if (!hasG()) return;
    try { stage(G.map); } catch (e) { warnOnce('stage', e); }
    try { if (typeof LIFE60 === 'object' && G.mapId === 'quarry') LIFE60.stage(G.map); } catch (e) { warnOnce('life', e); }
  }

  // ================================================================ the clockwork (presentation only, inside animDeco)
  const STROKE = 1.8;   // seconds a stroke, up and down: one beat for every pump in the room ("like clockwork", MS 1777)
  const reduced = () => !!(typeof GFX !== 'undefined' && GFX.reduceMotion);
  function pose(e, T) {
    if (reduced()) return;   // at rest
    if (e._q127 === 'rimclerk') { e.animSkew = 0.01 * Math.sin(T * 0.4 + 1.7); return; }
    const s = Math.sin(2 * PI * T / STROKE);
    if (e._handle) { e.animLift = 0.06 * s; return; }
    if (e._side) { const k = e._side * s; e.animSY = 1 + 0.035 * k; e.animLift = 0.02 * k; }   // a pair, one up and one down
  }

  // ================================================================ the wiring
  const ROW = ['gfx-quarryWork127', TX.optLabel, TX.optHint];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    b.textContent = sw() ? TX.optOn : optOff(); b.setAttribute('aria-pressed', sw() ? 'true' : 'false'); b.classList.toggle('sel', sw());
  }
  function toggle() {
    GFX[FLAG] = !sw();
    try { if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current(); } catch (e) { /* none */ }
    try { if (GFX.changed) GFX.changed(); } catch (e) { /* none */ }
    syncRow();
  }
  const card = (t, b) => { try { showEvent(t, b, [{ t: back(), f: null }]); } catch (e) { warnOnce('card', e); } };
  function wire() {
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { register(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    for (const fn of ['loadMap', 'restoreGame', 'passHours']) {
      if (typeof window === 'undefined' || typeof window[fn] !== 'function') continue;
      const _f = window[fn];
      window[fn] = function () {
        if (fn !== 'loadMap') { try { if (hasG() && G.maps) register(G.maps); } catch (e) { /* none */ } }
        const r = _f.apply(this, arguments);
        try { if (hasG()) { if (!registered && G.maps) { register(G.maps); if (G.mapId === 'quarry') LIFE60.stage(G.map); } api.stage(G.map); } } catch (e) { warnOnce(fn, e); }
        return r;
      };
    }
    if (typeof animDeco === 'function') {
      const _ad = animDeco;
      animDeco = function (e, dt, T) {
        const r = _ad.apply(this, arguments);
        if (e && e._q127) { const t0 = now(); try { api.pose(e, T); } catch (err) { warnOnce('pose', err); } stats.sumA += now() - t0; }
        return r;
      };
    }
    if (typeof render === 'function') { const _r = render; render = function () { if (sw() && hasG() && MAPS.indexOf(G.mapId) >= 0) stats.frames++; return _r.apply(this, arguments); }; }
    if (typeof update === 'function') {
      const _u = update;
      update = function () {
        const r = _u.apply(this, arguments);
        // a place that has gone (the Rite began while you stood in it): take everything down
        try { if (hasG() && MAPS.indexOf(G.mapId) >= 0) { const t0 = now(); if (!on() && G.ents.some((e) => e && e._q127)) unstage(G.map); stats.sumT += now() - t0; } } catch (e) { warnOnce('update', e); }
        return r;
      };
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        try {
          if (e && e._q127 && e.use === 'q127_pump') { const rt = RITE(); card(rt.lookPump, rt.lookPumpHooked); return undefined; }
          if (e && e._q127 && e.use === 'q127_clerk') { card(TX.clerkTitle, TX.clerkText); return undefined; }
        } catch (err) { warnOnce('use', err); }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () {
        const r = _acc.apply(this, arguments);
        try {
          const grid = document.querySelector('#modal-panel .ctl-grid');
          if (grid && !document.getElementById(ROW[0])) {
            const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(ROW[1] + ' '));
            const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = ROW[2]; lab.appendChild(sm);
            const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
            b.onclick = () => toggle();
            grid.appendChild(lab); grid.appendChild(b); syncRow();
          }
        } catch (e) { warnOnce('row', e); }
        return r;
      };
    }
    try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { syncRow(); resync(); }); } catch (e) { /* none */ }
    try { if (hasG() && G.maps) register(G.maps); } catch (e) { /* none */ }
  }
  try { wire(); } catch (e) { console.warn('quarrywork127 failed to wire', e); }

  const roster = () => { try { return LIFE60.PLACES.quarry ? LIFE60.PLACES.quarry.roster : null; } catch (e) { return null; } };
  const staged = () => (hasG() ? G.ents.filter((e) => e && (e._q127 || (e._life && /^q127_/.test(e._life)))) : []);
  const api = { TEXTS, TX, FLAG, on, gone, fight, roster, staged, stats, stage, pose, plan, PLACE, ROW, syncRow, toggle, STROKE };
  return api;
})();
if (typeof window !== 'undefined') window.QUARRYWORK127 = QUARRYWORK127;
