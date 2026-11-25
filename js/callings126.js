// ============================================================
//  callings126 — Phase 126: the callings, part one (Glass-Hand, Cantor, Corsair). The design is
//  story/Game Layer/Phase 126 - The callings, part one (design, for the builder).md; the record is
//  story/Game Layer/Phase 126 - The callings, part one.md. Everything here is [PROPOSED] unless a line says it is the book's.
//
//  ONE MECHANISM, TWO PARTS.
//    * THE SIGHT. What your trade notices, drawn over the world on the HUD layer after the frame (Engine.ctx, the same
//      canvas in the classic view and under the 3D view's HUD layer), anchored to each thing's on-screen rect
//      (e._screen, which both renderers fill by contract) or, for a world point, through toView() (R3D.project under the
//      3D view; the raycaster's own projection, from a read-only post hook, in the classic view). Hidden behind walls by
//      depth probes (Engine.depthAt, as js/hud11.js does). The Options row "Your calling's sight" has three settings:
//      hidden / when you stand still (the default: it comes up after a moment standing still, and goes when you move) /
//      always. GFX.callingSight is the preset switch: off in Original and Low; off, nothing here touches the canvas.
//    * THE ACT. The use key (E, the pad's A, the touch Use button: all reach interact()) on the right thing does your
//      calling's verb, as a small card with a way back. The act is play, not a picture: it works with the sight hidden.
//  Phase 127 registers the other three callings in the same table (CALLINGS126.register).
//
//  Presentation reads only: no random numbers, never Engine.render, no clock moved from drawing code (the sight's fade and
//  the target list advance in update; drawing reads G.time). Flags (small integers, validated on every load):
//  p126_seen (bits: the first-sight line shown), p126_did (bits: the first act's journal line written), p126_bells,
//  p126_vosk, p126_slips. Not saved: the hand's ringing, the fade, the targets, a slip in progress.
// ============================================================
'use strict';

const CALLINGS126 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags && G.map;
  const F = () => G.flags;
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));
  const say = (t, cls, ms) => { try { msg(String(t).replace(/<\/?i>/g, ''), cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('callings126: ' + k + ' failed', e); } };
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const inExtra = () => { try { return typeof EXTRAS17 !== 'undefined' && !!EXTRAS17.inExtra(); } catch (e) { return false; } };
  const inBoots = () => { try { return typeof BOOTS125 === 'object' && !!BOOTS125.active(); } catch (e) { return false; } };
  const calling = () => { try { return G.player.cls && G.player.cls.id; } catch (e) { return null; } };
  const journalOnce = (t) => { try { journal('side', t); } catch (e) { /* none */ } };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ORDER = ['blade', 'cantor', 'corsair', 'archivist', 'penitent', 'quarry'];   // js/gearlook21.js CLASS_ORDER: the flags' bits
  const bitOf = (id) => { const i = ORDER.indexOf(id); return i >= 0 ? 1 << i : 0; };
  // hashed noise (no random numbers): phases and breath gaps per thing
  const h3 = (a, b, c) => { let h = Math.imul((a * 73856093) ^ (b * 19349663) ^ (c * 83492791), 2654435761) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  const hashStr = (s) => { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
  const keyOf = (e) => (e ? String(e.name || e.id || e.sprite || '') + ':' + Math.round(e.homeX != null ? e.homeX * 10 : e.x * 10) + ':' + Math.round(e.homeY != null ? e.homeY * 10 : e.y * 10) : '');

  // ================================================================ the words (§5 of the design)
  const TX = {
    // the Options row
    optLabel: S('Your calling\'s sight'),
    optHint: S('stand still, and see what your trade sees'),
    optOff: S('hidden'),
    optStill: S('when you stand still'),
    optAlways: S('always'),
    back: S('Step back'),
    // Glass-Hand
    bladeFirst: S('You stand still, and your wrapped hand starts to ring: faint and high, at every bell near you. Inside each one, somebody is talking.'),
    takeIt: S('Take it by the bell'),
    byBell: S('By the bell'),
    drink: S('You lay your glass hand flat against the side of the bronze, the way you lay a hand on a struck bell to stop it ringing, and feel the bell try to sound. The glass drinks it. The note goes into your hand and up your arm and is gone, and the arm rings low and full, like a mouth closing on something. The bell makes no sound at all.'),
    voiceIn: S('Through the glass, the voice inside is very clear: <i>{0}</i>'),
    voiceInPiece: S('Through the glass, the voice inside is very clear:'),
    fist: S('Put your fist through the grille'),
    cracks: S('Something smooth and cold the size of an apple cracks under your knuckles like ice under a boot.'),
    letGo: S('Let go'),
    letGoLine: S('You take your hand away. The bell stands where it is, ringing at nothing, for a breath or two.'),
    pressed: S('His hand is already at his belt. Brass, the size of a hand, two tines and a glass ampoule between them: a hand-press. He strikes it, and every piece of glass near you answers, your own with it. Your arm locks rigid, ringing flat.'),
    rings: S('Your hand rings on, low and full. Anyone who hears glass can hear it now.'),
    hint: S('E: Take it by the bell'),
    jBlade: S('My hand hears the bells. Laid flat on one, it drinks the alarm, and the voice inside comes out clear. The tideline climbs for it, and anyone who hears glass hears me afterward.'),
    lenses: S('The Factor\'s green lenses rest on your sleeve a moment longer than is comfortable. Through them, pitch is colour, and your hand must be burning like a lamp.'),
    locked: S('Your glass arm is locked rigid, ringing flat.'),
    // Cantor
    cantorFirst: S('You stand still and listen, the way you were taught: under the street, everyone who is humming, and how true.'),
    under: S('You hold the note under your breath, where the hounds cannot hear it and the Hush cannot find it.'),
    tendAct: S('Hum the tending note into their hands'),
    tendBody: S('They are hurt. Nothing is hunting you, and your hands are free.'),
    talkInstead: S('Talk instead'),
    tend: S('You take their hands in yours and hum the tending note into them, in the Narrow, so the sound goes into the hands and not the air.'),
    short: S('You have nothing left to hum with.'),
    hobHum: S('Hum the Root note into his hands, low'),
    hobDid: S('You take his big hands in yours and hum the Root note into them, low, in the Narrow: the note for wounds that need closing. Lyra, at his other ear, breathes it with you without a sound. He holds on. Afterward you have less voice than you came with. Every mending borrows.'),
    orla: S('You still have the voice she spent on Pim before dawn. You do not use it. It is not you Mother Hale is asking.'),
    jCantor: S('I hum under the Narrow, low enough that the hounds cannot hear it and the Hush cannot find me. Into someone\'s hands, it mends.'),
    // Corsair
    corsairFirst: S('You stand and look the way a hand looks at a deck: what is heavy, what is lashed, and which line is carrying more than it should.'),
    kestrel: S('She flies no colours, she is riding heavy for a ship with nothing to declare, and her line is bar-taut. Whatever is in her hold, it is not feathers.'),
    slipIt: S('Slip it by hand'),
    cutIt: S('Cut it'),
    slipping: S('You get your hands on the hook where it has bitten and work it, a link at a time. No axe, no noise. Stay with it.'),
    slipLeft: S('You let go of the hook, and it bites again.'),
    slipped: S('The hook comes free and goes up its line with nothing on it.'),
    sign: S('Sign it to Mags, behind his back'),
    signed: S('Your hands say it in Rust Coast cant while your mouth says something else. At the hatch Mags reads them, and does not nod, and the sail-locker door closes very softly.'),
    jCorsair: S('On a deck I can see what she is carrying and which line is about to part. A hook can be slipped by hand, slowly, without a sound.'),
  };
  const FIRST = { blade: TX.bladeFirst, cantor: TX.cantorFirst, corsair: TX.corsairFirst };

  // ================================================================ the flags
  const FLAGS = { p126_seen: 63, p126_did: 63, p126_bells: 99, p126_vosk: 1, p126_slips: 99 };
  function validate(f) {
    if (!f || typeof f !== 'object') return;
    for (const k in FLAGS) { const v = f[k]; if (!(typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= FLAGS[k])) f[k] = 0; }
  }
  const flagInt = (k) => { const v = Number(F()[k]); return Number.isInteger(v) && v >= 0 ? v : 0; };
  const bump = (k) => { F()[k] = Math.min(FLAGS[k], flagInt(k) + 1); };
  function firstAct(id, line) {
    const b = bitOf(id); if (!b || (flagInt('p126_did') & b)) return;
    F().p126_did = flagInt('p126_did') | b; journalOnce(line);
  }

  // ================================================================ the switch and the Options row
  const FLAG = 'callingSight', MODE_KEY = 'octave.callings126.mode';
  let mode = 'still';
  try { const m = localStorage.getItem(MODE_KEY); if (m === 'still' || m === 'always') mode = m; } catch (e) { /* no storage */ }
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = false;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const sightOn = () => typeof GFX !== 'undefined' && !!GFX[FLAG];
  function setMode(m) { if (m !== 'still' && m !== 'always') return mode; mode = m; try { localStorage.setItem(MODE_KEY, m); } catch (e) { /* none */ } syncRow(); return mode; }
  const setting = () => (!sightOn() ? 'off' : mode);
  const ROW = ['gfx-callingSight126', TX.optLabel, TX.optHint];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const s = setting();
    b.textContent = s === 'off' ? TX.optOff : s === 'always' ? TX.optAlways : TX.optStill;
    b.setAttribute('aria-pressed', s === 'off' ? 'false' : 'true'); b.classList.toggle('sel', s !== 'off');
  }
  function cycle() {
    const s = setting();
    if (s === 'off') { setMode('still'); GFX[FLAG] = true; }
    else if (s === 'still') setMode('always');
    else { GFX[FLAG] = false; }
    try { if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current(); } catch (e) { /* none */ }
    try { if (GFX.changed) GFX.changed(); } catch (e) { /* none */ }
    syncRow();
  }

  // ================================================================ the table
  const REG = new Map();
  function register(id, def) {
    if (!id || !def) return false;
    REG.set(String(id), { radius: Number(def.radius) || 6, targets: def.targets || (() => {}), draw: def.draw || {}, acts: def.acts || [], lines: def.lines || {}, tick: def.tick || null });
    return true;
  }
  function unregister(id) { return REG.delete(String(id)); }
  const ids = () => [...REG.keys()];
  const here = () => REG.get(calling());

  // ================================================================ when the sight shows
  const STILL_AFTER = 0.55, FADE_IN = 0.4, FADE_OUT = 0.2, GATHER_EVERY = 0.25, CAP = 16;
  const st = { sense: 0, stillT: 0, gatherT: 0, ringT: 0, hintMap: '', kestrelSaid: false, underSaid: false, slip: null, slipFlight: -1, slipChoice: null, ringEnt: null };
  const inPhoto = () => { try { const g = document.getElementById('game'); return !!(g && g.classList.contains('p7-photo')) || G.state === 'photo'; } catch (e) { return false; } };
  const allowed = () => hasG() && sightOn() && G.state === 'play' && !inBoots() && !guest() && !inPhoto();
  function tickSense(dt) {
    if (!allowed()) { st.sense = 0; st.stillT = 0; return; }
    if (mode === 'always') { st.sense = 1; return; }
    const sp = G.vel ? Math.hypot(G.vel.x, G.vel.y) : 0;
    if (sp < 0.35) st.stillT += dt; else st.stillT = 0;   // a murmur is not moving
    if (st.stillT >= STILL_AFTER) st.sense = Math.min(1, st.sense + dt / FADE_IN); else st.sense = Math.max(0, st.sense - dt / FADE_OUT);
  }

  // ================================================================ the targets (gathered in update, every quarter second)
  const targets = [];
  const pool = [];
  let poolN = 0;
  function gather() {
    targets.length = 0; poolN = 0;
    if (!hasG()) return targets;
    const reg = here(); if (!reg) return targets;
    const c = Engine.cam, r2 = reg.radius * reg.radius;
    const add = (o) => {
      if (!o) return;
      const t = pool[poolN] || (pool[poolN] = {}); poolN++;
      for (const k in t) t[k] = undefined;
      Object.assign(t, o);
      const x = o.e ? o.e.x : o.pt ? o.pt[0] : o.wx != null ? o.wx : c.x, y = o.e ? o.e.y : o.pt ? o.pt[1] : o.wy != null ? o.wy : c.y;
      t.d2 = (x - c.x) * (x - c.x) + (y - c.y) * (y - c.y);
      if (!o.any && t.d2 > r2) { poolN--; return; }
      targets.push(t);
    };
    try { reg.targets(add, { c, r2, radius: reg.radius }); } catch (e) { warnOnce('targets', e); }
    targets.sort((a, b) => a.d2 - b.d2);
    if (targets.length > CAP) targets.length = CAP;
    return targets;
  }

  // ================================================================ the view: projection, occlusion
  const fi = { ok: false, cx: 0, cy: 0, cz: 0.5, dirX: 1, dirY: 0, planeX: 0, planeY: 0.66, w: 320, h: 150, S: 1, horizon: 75 };
  const r3dOn = () => { try { return typeof R3D === 'object' && !!R3D && R3D.active(); } catch (e) { return false; } };
  const ZK = () => { try { return (typeof R3D === 'object' && R3D.ZK) || 0.61875; } catch (e) { return 0.61875; } };
  const out3 = { x: 0, y: 0, depth: 0 };
  function toView(x, y, z) {
    if (r3dOn()) { const p = R3D.project(x, y, z || 0); if (!p) return null; out3.x = p.x; out3.y = p.y; out3.depth = p.depth; return out3; }
    if (!fi.ok) return null;
    const sx = x - fi.cx, sy = y - fi.cy, inv = 1 / (fi.planeX * fi.dirY - fi.dirX * fi.planeY);
    const trX = inv * (fi.dirY * sx - fi.dirX * sy), trY = inv * (-fi.planeY * sx + fi.planeX * sy);
    if (trY <= 0.1) return null;
    out3.x = (fi.w / 2) * (1 + trX / trY) / fi.S; out3.y = (fi.horizon + (fi.cz - (z || 0)) * fi.h / trY) / fi.S; out3.depth = trY;
    return out3;
  }
  const VWl = () => (typeof VW === 'number' ? VW : 320), VHl = () => (typeof VIEW_H === 'number' ? VIEW_H : 150);
  const onView = (x, y) => x >= 0 && x < VWl() && y >= 0 && y < VHl();
  const NEAR_HANDS = 0.3;   // the player's own radius keeps every wall and body further off than this
  // the renderer wrote each body's depth into its depth buffer: three probes over the body, hidden only if all are covered
  function visible(e) {
    const s = e && e._screen; if (!s) return false;
    const z = s.z, W = s.x1 - s.x0, H = s.y1 - s.y0, cx = (s.x0 + s.x1) / 2;
    if (!(z > 0) || W < 0.5 || H < 0.5) return false;
    const P = [[cx, s.y0 + H * 0.2], [cx, s.y0 + H * 0.5], [cx, s.y1 - 1]];
    // (under the 3D view a thing's billboard sits a little nearer than its rect's depth, by about half its radius: measured
    // 0.12 to 0.13 for a Legionnaire, 0.22 for air93's tank-cradle; a wider margin there)
    const tol = r3dOn() ? 0.1 + 0.4 * (Number(e.radius) || 0.3) : 0.08;
    let probed = 0;
    for (let i = 0; i < 3; i++) {
      const px = P[i][0], py = P[i][1]; if (!onView(px, py)) continue;
      const d = Engine.depthAt(px, py);
      if (d < NEAR_HANDS) continue;   // the 3D view's first-person hands are in its depth buffer, nearer than any wall can be
      probed++;
      if (d >= z - tol) return true;
    }
    return probed === 0 && cx > -20 && cx < VWl() + 20;
  }
  function visiblePt(x, y, depth) { if (!onView(x, y)) return false; const d = Engine.depthAt(x, y); return d < NEAR_HANDS || d >= depth - 0.08; }
  const groundZ = (x, y) => { try { const m = G.map; return (m.lvls || m.smooth) ? m.groundAt(x, y) : 0; } catch (e) { return 0; } };

  // ================================================================ the glyph kit (code-drawn, logical pixels, 1-px rects, a 4x4 ordered dither)
  const BAYER = [0, 8, 2, 10, 12, 4, 14, 6, 3, 11, 1, 9, 15, 7, 13, 5];
  let ctx = null, aMax = 0.85, dim = 1;
  const reduced = () => !!(typeof GFX !== 'undefined' && GFX.reduceMotion);
  const noFlash = () => !!(typeof GFX !== 'undefined' && GFX.noFlash);
  const hcOn = () => { try { return document.documentElement.classList.contains('ac-hc'); } catch (e) { return false; } };
  const cbOn = () => { try { return typeof UPG !== 'undefined' && !!UPG && !!UPG.colorblind; } catch (e) { return false; } };
  const col = (c) => (hcOn() ? '#ffffff' : c);
  const now = () => (hasG() && typeof G.time === 'number' ? G.time : 0);
  // a slow pulse 0..1, hashed per thing; still under Reduce motion, at its mean under No flashes
  const pulse = (seed, rate) => (reduced() || noFlash() ? 0.5 : 0.5 + 0.5 * Math.sin(now() * (rate || 1.4) + seed * 6.283));
  const g = {
    a(v) { ctx.globalAlpha = clamp(v * dim, 0, aMax); },
    px(x, y, w, h, c, a) { if (a != null) g.a(a); ctx.fillStyle = col(c); ctx.fillRect(Math.round(x), Math.round(y), w || 1, h || 1); },
    dot(x, y, c, a, r) { r = r || 1; g.a(a == null ? 1 : a); ctx.fillStyle = col(c); for (let j = -r; j <= r; j++) { const w = Math.round(Math.sqrt(Math.max(0, r * r - j * j + 0.5))); ctx.fillRect(Math.round(x) - w, Math.round(y) + j, w * 2 + 1, 1); } },
    ring(x, y, r, c, a) {
      g.a(a == null ? 1 : a); ctx.fillStyle = col(c);
      const n = Math.max(8, Math.round(r * 6));
      for (let i = 0; i < n; i++) { const t = i / n * 6.2832; ctx.fillRect(Math.round(x + Math.cos(t) * r), Math.round(y + Math.sin(t) * r), 1, 1); }
    },
    // the hand-press: a squat two-tined brass fork, the ampoule glinting between the tines
    fork(x, y, s, glint, a) {
      x = Math.round(x); y = Math.round(y); s = Math.max(1, s | 0);
      g.px(x - 3 * s, y - 4 * s, 6 * s, 8 * s, '#0c0a08', a * 0.35);   // a dark ground under it
      g.px(x - 2 * s, y - 3 * s, s, 3 * s, '#c89a4a', a); g.px(x + s, y - 3 * s, s, 3 * s, '#c89a4a', a);
      g.px(x - 2 * s, y, 4 * s, s, '#a87a34', a); g.px(x - s / 2, y + s, s, 2 * s, '#8a6430', a);
      g.px(x - s / 2, y - 2 * s, s, s, '#96c8ff', a * (0.5 + 0.5 * glint));
      if (glint > 0.7) g.px(x - s / 2, y - 3 * s, s, s, '#e8f4ff', a * (glint - 0.5));
    },
    lens(x, y, r, c, a) { g.dot(x, y, c, a, r); g.px(x - r + 1, y - r + 1, 1, 1, '#f0fff0', a); },
    // a hum: a thin wavering vertical line; amplitude is how untrue, height is pitch
    thread(x, y, h, amp, ph, c, a) {
      for (let pass = 0; pass < 2; pass++) {   // a dark shadow a pixel to the right, so a thin line reads on any ground
        g.a(pass ? a : a * 0.45); ctx.fillStyle = pass ? col(c) : '#0c0a08';
        for (let i = 0; i < h; i++) { const w = reduced() ? 0 : Math.sin(i * 0.9 + ph) * amp * (0.4 + 0.6 * i / h); ctx.fillRect(Math.round(x + w) + (pass ? 0 : 1), Math.round(y - i), 1, 1); }
      }
    },
    // a rope or a chain: a line, with strain ticks across it (fray ticks where it will part)
    line(x0, y0, x1, y1, c, a, ticks, tc) {
      g.a(a); ctx.fillStyle = col(c);
      const n = Math.max(2, Math.min(220, Math.hypot(x1 - x0, y1 - y0) | 0));
      for (let i = 0; i <= n; i++) { const u = i / n; ctx.fillRect(Math.round(x0 + (x1 - x0) * u), Math.round(y0 + (y1 - y0) * u), 1, 1); }
      if (ticks > 0) {
        const L = Math.hypot(x1 - x0, y1 - y0) || 1, nx = -(y1 - y0) / L, ny = (x1 - x0) / L; ctx.fillStyle = col(tc || c);
        for (let k = 1; k <= ticks; k++) { const u = k / (ticks + 1), x = x0 + (x1 - x0) * u, y = y0 + (y1 - y0) * u; for (let j = -2; j <= 2; j++) if (j) ctx.fillRect(Math.round(x + nx * j), Math.round(y + ny * j), 1, 1); }
      }
    },
    // a weight: a plumb with 1 to 4 bars
    plumb(x, y, bars, c, a) {
      x = Math.round(x); y = Math.round(y);
      g.px(x, y, 1, 4, '#9a8a6a', a);
      for (let b = 0; b < bars; b++) g.px(x - 2, y + 5 + b * 2, 5, 1, c, a);
      g.px(x - 1, y + 5 + bars * 2, 3, 1, c, a);
    },
    // a fall patch on the floor: world points on a disc, projected, kept by the ordered dither
    patch(wx, wy, r, c, a) {
      const z = groundZ(wx, wy) + 0.02; let n = 0; g.a(a); ctx.fillStyle = col(c);
      const step = r / 6;
      for (let j = -6; j <= 6; j++) for (let i = -6; i <= 6; i++) {
        const dx = i * step, dy = j * step; if (dx * dx + dy * dy > r * r) continue;
        const p = toView(wx + dx, wy + dy, z); if (!p) continue;
        const x = Math.round(p.x), y = Math.round(p.y); if (!onView(x, y)) continue;
        const edge = Math.hypot(dx, dy) / r, th = edge > 0.82 ? 16 : 6;
        if (BAYER[(y & 3) * 4 + (x & 3)] >= th) continue;
        if (Engine.depthAt(x, y) < p.depth - 0.25) continue;
        ctx.fillRect(x, y, 1, 1); n++;
      }
      return n;
    },
    // a drift-glass tank: cobalt steady (sound), with a flicker (sour), a slow vapour drifting off (weeping)
    tank(x, y, state, seed, a) {
      x = Math.round(x); y = Math.round(y);
      const fl = state === 'sour' ? (pulse(seed, 9) > 0.5 ? 1 : 0.45) : 1;
      g.px(x - 1, y - 2, 3, 5, '#5c80e6', a * fl); g.px(x, y - 1, 1, 2, '#a8c4ff', a * fl);
      if (state === 'sour') g.px(x + 2, y - 2, 1, 1, '#c8c060', a);   // shape, not colour alone: a sour tank has a tick
      if (state === 'weep') for (let k = 0; k < 4; k++) { const t = reduced() ? k * 0.25 : ((now() * 0.6 + k * 0.25 + seed) % 1); g.px(x + Math.round(Math.sin(t * 6 + k) * 2), y - 3 - Math.round(t * 8), 1, 1, '#7c9cf0', a * (1 - t)); }
    },
    toView, visiblePt, pulse, now, groundZ, reduced, onView,
  };

  // ================================================================ drawing (once, after each frame)
  const drawn = [];
  const recs = [];
  const HANDS = { x0: 104, x1: 216, y0: 100 };
  const stats = { ms: 0, frames: 0, sum: 0, marks: 0, reset() { stats.ms = 0; stats.frames = 0; stats.sum = 0; stats.marks = 0; } };
  function draw() {
    if (!sightOn()) return;                       // off: nothing here touches the canvas
    drawn.length = 0;
    if (!(st.sense > 0) || !allowed()) return;
    const reg = here(); if (!reg || !targets.length) return;
    const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
    ctx = Engine.ctx; if (!ctx) return;
    ctx.save();
    let n = 0;
    try {
      ctx.beginPath(); ctx.rect(0, 0, VWl(), VHl()); ctx.clip();
      for (let i = 0; i < targets.length; i++) {
        const t = targets[i], fn = reg.draw[t.kind]; if (!fn) continue;
        if (t.e) {
          const e = t.e; if (e.dead || e.hidden) continue;
          if (!t.free) { if (!e._screen || !visible(e)) continue; t.s = e._screen; }
        } else if (t.pt && !t.free) {
          const p = toView(t.pt[0], t.pt[1], t.pt[2]); if (!p) continue;
          t.px = p.x; t.py = p.y; t.depth = p.depth;
          if (!t.noOcclude && !visiblePt(p.x, p.y, p.depth)) continue;
        }
        const ax = t.s ? (t.s.x0 + t.s.x1) / 2 : t.px, ay = t.s ? t.s.y0 + (t.s.y1 - t.s.y0) * 0.5 : t.py;
        dim = (ax > HANDS.x0 && ax < HANDS.x1 && ay > HANDS.y0) ? 0.4 / 0.85 : 1;
        const fade = st.sense * (t.d2 != null ? clamp(1.15 - Math.sqrt(t.d2) / (reg.radius * 1.4), 0.45, 1) : 1);
        const rec = recs[n] || (recs[n] = {}); for (const k in rec) rec[k] = undefined;
        rec.calling = calling(); rec.kind = t.kind; rec.k = t.k; rec.e = t.e || null;
        let r;
        try { r = fn(g, t, fade, rec); } catch (err) { warnOnce('draw ' + t.kind, err); r = false; }
        if (r !== false) { drawn.push(rec); n++; }
      }
    } finally { ctx.globalAlpha = 1; ctx.restore(); dim = 1; }
    stats.marks = n;
    if (typeof performance !== 'undefined') { stats.sum += performance.now() - t0; stats.frames++; stats.ms = stats.sum / stats.frames; }
  }
  const lastDrawn = () => drawn;

  // ================================================================ the act (the use key)
  function tryActs(e) {
    const reg = here(); if (!reg || !reg.acts.length) return false;
    for (const a of reg.acts) {
      let ok = false; try { ok = !!a.can(e); } catch (err) { warnOnce('can', err); }
      if (ok) { let r; try { r = a.run(e); } catch (err) { warnOnce('act', err); r = false; } if (r !== false) return true; }
    }
    return false;
  }
  const actsOn = () => hasG() && G.state === 'play' && !inBoots() && !guest() && !inExtra();
  const card = (title, body, choices) => { try { showEvent(title, body, choices); } catch (e) { warnOnce('card', e); } };
  const distTo = (e) => { const c = Engine.cam; return Math.hypot(e.x - c.x, e.y - c.y); };
  const BOSS_IDS = ['aegis', 'weaver', 'pressman', 'broodmother', 'bosun', 'horn', 'requiem', 'wearer_coda', 'wearer'];
  const bossLike = (e) => { const d = e.def || {}; return !!(d.boss || d.wildsBoss || BOSS_IDS.indexOf(e.type) >= 0); };
  const liveEnemy = (e) => !!(e && e.kind === 'enemy' && !e.dead && !e.hidden && !e.dying);

  // ================================================================ GLASS-HAND (blade): the bells
  const LILAC = '#c8acec', MILK = '#ece6f6', GREEN = '#b0e8b0', RING_S = 60, REACH = 1.3;
  const glassReady = () => { const p = G.player; return !!p.glassed && !inBoots(); };
  const isBell = (e) => liveEnemy(e) && e.type === 'legionnaire';
  const isPress = (e) => liveEnemy(e) && e.def && e.def.press && !bossLike(e);
  const losTo = (e) => { try { const c = Engine.cam; return typeof los !== 'function' || los(c.x, c.y, e.x, e.y); } catch (err) { return true; } };
  function bladeCan(e) {
    if (!glassReady() || !e || e.transient || bossLike(e) || distTo(e) > REACH) return false;
    return isBell(e) || isPress(e);
  }
  function bladeRun(e) {
    if (G.glassLock > 0) { say(TX.locked, 'bad', 1800); return true; }
    if (isBell(e) && e.name === 'Tamsin Reed') {   // Depot Three keeps js/tamsin52.js's own card
      try { if (typeof TAMSIN52 === 'object' && TAMSIN52.stage() === 0) { TAMSIN52.meet(e); return true; } } catch (err) { warnOnce('tamsin', err); }
      return false;
    }
    if (!isBell(e)) {   // a proctor: the press comes off his belt first (MS 4335-4345; SB 160)
      G.glassLock = 8; try { Audio_.sfx.press(); } catch (err) { /* silent */ }
      card(TX.byBell, TX.pressed, [{ t: TX.back, f: null }]);
      return true;
    }
    const p = G.player, n0 = Number(G.noise) || 0;
    p.glass = Math.min(99, (Number(p.glass) || 0) + 3);          // js/tamsin52.js's +3 and its cap: never Heartglass by this alone
    bump('p126_bells'); st.ringT = RING_S; st.ringEnt = e;
    const after = () => { G.noise = Math.min(Number(G.noise) || 0, n0); say(TX.rings, 'warn', 5000); firstAct('blade', TX.jBlade); };
    card(TX.byBell, TX.drink + '<br><br>' + fmt(TX.voiceIn, (typeof coreMurmur === 'function' ? coreMurmur(e) : '')), [
      { t: TX.fist, f: () => { try { killEnemy(e, false); } catch (err) { warnOnce('kill', err); e.dead = true; e.hidden = true; } say(TX.cracks, '', 6000); after(); } },
      { t: TX.letGo, f: () => { e.stun = Math.max(Number(e.stun) || 0, 3); say(TX.letGoLine, '', 5000); after(); } },
    ]);
    G.noise = n0;
    return true;
  }
  function bladeTick(dt) {
    if (st.ringT > 0) st.ringT = Math.max(0, st.ringT - dt);
  }
  // every quarter second, while the hand rings: the bells that hear it, and the Factor's lenses (heard in turn, MS 712, 765)
  function bladeHear() {
    if (!(st.ringT > 0) || !G.player.glassed) return;
    const c = Engine.cam;
    for (const e of G.ents) {
      if (!isBell(e) || e === st.ringEnt || Math.hypot(e.x - c.x, e.y - c.y) >= ((typeof AUDIT54 === 'object' && AUDIT54.EARSHOT) || 7) || !losTo(e)) continue;
      try { if (typeof AUDIT54 === 'object') AUDIT54.log('hand'); } catch (err) { warnOnce('audit', err); }
      break;
    }
    if (!flagInt('p126_vosk')) {
      const v = G.ents.find((o) => o && o.kind === 'npc' && o.id === 'vosk' && !o.hidden);
      if (v && Math.hypot(v.x - c.x, v.y - c.y) < 8 && losTo(v)) {
        let a = Math.atan2(v.y - c.y, v.x - c.x) - c.dir; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
        if (Math.abs(a) < 0.7) { F().p126_vosk = 1; say(TX.lenses, 'voice', 7000); }
      }
    }
  }
  // with the sight hidden, the act's prompt: once a map, the first time you aim at a bell you could take
  function bladeHint() {
    if (sightOn() || !glassReady() || G.glassLock > 0 || st.hintMap === G.mapId) return;
    const c = Engine.cam;
    if (!G.ents.some((e) => isBell(e) && !e.transient && e.name !== 'Tamsin Reed' && Math.hypot(e.x - c.x, e.y - c.y) < 1.6)) return;
    let e = null; try { e = Engine.pick(G.ents, typeof USE_RANGE === 'number' ? USE_RANGE : 2); } catch (err) { e = null; }
    if (e && bladeCan(e) && isBell(e) && e.name !== 'Tamsin Reed') { st.hintMap = G.mapId; say(TX.hint, 'warn', 4000); }
  }
  register('blade', {
    radius: 6,
    targets(add) {
      for (const e of G.ents) {
        if (isBell(e)) add({ e, kind: 'core' });
        else if (liveEnemy(e) && e.def && e.def.press) add({ e, kind: 'press' });
        else if (e && e.kind === 'npc' && e.id === 'vosk' && !e.hidden) add({ e, kind: 'lens' });
      }
    },
    draw: {
      // the pale lilac core seen through the bronze, at the bell: "a sphere of pale lilac glass" (MS 1875, 2694)
      core(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, x = (s.x0 + s.x1) / 2, y = s.y0 + (s.y1 - s.y0) * 0.14;
        const seed = hashStr(t.e.name || keyOf(t.e)), pu = g.pulse(seed, 1.1);
        const r = clamp(Math.round(w * 0.1), 1, 6), a = fade * (0.55 + 0.35 * pu);
        // "a low overlapping murmur": faint rings round it
        for (let k = 0; k < 2; k++) { const ph = g.reduced() ? 0.5 : ((g.now() * 0.35 + seed + k * 0.5) % 1); g.ring(x, y, r + 2 + ph * (r + 4), LILAC, a * 0.45 * (1 - ph)); }
        g.dot(x, y, LILAC, a, r); g.dot(x, y, MILK, a, Math.max(0, r - 2));
        if (cbOn() || hcOn()) g.px(x, y, 1, 1, '#000000', a);   // a ring with a dot: the shape carries it
        rec.x = x; rec.y = y; rec.r = r;
        return true;
      },
      // the brass hand-press at the belt; the ampoule glints, and quickens inside thirty feet (MS 4335-4339)
      press(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, x = (s.x0 + s.x1) / 2 + w * 0.18, y = s.y0 + (s.y1 - s.y0) * 0.58;
        const near = Math.sqrt(t.d2) < 3, gl = g.pulse(hashStr(keyOf(t.e)), near ? 6 : 1.6);
        g.fork(x, y, w > 60 ? 3 : w > 16 ? 2 : 1, gl, fade * 0.95);
        rec.near = near;
        return true;
      },
      // the Factor's green lenses, faintly luminous; brighter while your hand rings (MS 704, 712)
      lens(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, x = (s.x0 + s.x1) / 2, y = s.y0 + (s.y1 - s.y0) * 0.17, d = Math.max(1, Math.round(w * 0.09));
        const lit = st.ringT > 0, a = fade * (lit ? 0.9 : 0.5) * (0.8 + 0.2 * g.pulse(0.3, 0.9));
        const r = w > 50 ? 2 : 1;
        g.lens(x - d, y, r, GREEN, a); g.lens(x + d, y, r, GREEN, a);
        if (lit) { g.ring(x - d, y, r + 2, GREEN, a * 0.4); g.ring(x + d, y, r + 2, GREEN, a * 0.4); }
        rec.lit = lit;
        return true;
      },
    },
    acts: [{ verb: 'bell', can: bladeCan, run: bladeRun }],
    tick: bladeTick,
    lines: { first: TX.bladeFirst },
  });

  // ================================================================ CANTOR: who is humming, and how true
  const AMBER = '#d6a05c', SILVER = '#d2d6e2', WHITEGOLD = '#ffecb4';
  const isLit = (e) => e && e.kind === 'deco' && e.sprite === 'lamp' && !e.drylamp && !e._n28off && !e.dead && !e.hidden;
  // a person's hum: how true (1 is true) and how high (0 low .. 1 high); a reed's never breaks for breath
  function voiceOf(e) {
    const hs = hashStr(keyOf(e)), hs2 = h3(Math.round(hs * 1e6), 7, 11);
    if (e.kind === 'deco' && e.sprite === 'lamp') return { tr: 0.97, pitch: 1, col: SILVER, reed: true };
    if (e.kind === 'deco' && e.use === 'p59_youngest') return Number(F().p59_lesson) === 1 ? { tr: 0.85, pitch: 0.6, col: AMBER } : { tr: 0.4, pitch: 0.6, col: AMBER, stops: true };
    if (e.id === 'tam') return { tr: 0.95, pitch: 0, col: AMBER };                     // "could not reach any note above the middle of the stave" (MS 1989)
    if (e.id === 'bettany') return { tr: 0.35, pitch: 0.4, col: AMBER };               // "a voice like a saw in a knot … badly" (MS 3956)
    if (e.id === 'lyra') return { tr: 0.97, pitch: 0.5, col: AMBER };
    return { tr: 0.75 + 0.15 * hs, pitch: 0.4 + 0.3 * hs2, col: AMBER };               // the night-hummers (MS 412)
  }
  const isHummer = (e) => e && e.kind === 'npc' && !e.hidden && (e.id === 'n28_hummer' || e.id === 'tam' || e.id === 'bettany' || e.id === 'lyra');
  const pureNote = () => { const f = F(); return G.mapId === 'oakhaven' && !!f.church_come && !f.rite_started && !f.greening; };
  register('cantor', {
    radius: 9,
    targets(add) {
      let choir = false;
      for (const e of G.ents) {
        if (!e || e.dead) continue;
        if (isHummer(e)) add({ e, kind: e.id === 'lyra' && !F().lyra_voice ? 'breath' : 'thread' });
        else if (isLit(e)) add({ e, kind: 'whistle' });
        else if (e.kind === 'deco' && e.use === 'p59_youngest' && !e.hidden) add({ e, kind: 'thread' });
        else if (!choir && e._p55 && /^ch\d\d$/.test(e._p55) && !e.hidden) { choir = true; add({ e, kind: 'choir', free: true }); }
      }
      if (pureNote() && (G.map.outdoor || G.mapId === 'oakhaven')) add({ kind: 'lid', free: true, any: true });
    },
    draw: {
      thread(g, t, fade, rec) {
        const s = t.s, v = voiceOf(t.e), seed = hashStr(keyOf(t.e));
        const x = (s.x0 + s.x1) / 2, y = s.y0 + (s.y1 - s.y0) * 0.18;
        const amp = Math.max(0.3, 8 * (1 - v.tr)), h = Math.round(8 + 10 * v.pitch);
        const period = 4 + 3 * seed, ph = (g.now() + seed * 17) % period;
        const gap = !v.reed && (v.stops ? ph % 1.6 > 1.0 : ph > period - 0.7);   // a person breaks for breath; the youngest keeps stopping
        rec.amp = amp; rec.h = h; rec.col = v.col; rec.breath = gap;
        if (!gap) g.thread(x, y, h, amp, g.now() * 5 + seed * 6, v.col, fade * 0.95);
        return true;
      },
      whistle(g, t, fade, rec) {
        const s = t.s, x = (s.x0 + s.x1) / 2, y = s.y0 + (s.y1 - s.y0) * 0.1;
        g.thread(x, y, 18, 0.3, g.now() * 9, SILVER, fade * 0.75);
        rec.amp = 0.3; rec.h = 18;
        return true;
      },
      // Lyra with no voice: "only air in the shape of the note" (MS 977)
      breath(g, t, fade, rec) {
        const s = t.s, x = (s.x0 + s.x1) / 2 + 2, y = s.y0 + (s.y1 - s.y0) * 0.2, ph = g.reduced() ? 0.4 : (g.now() * 0.5) % 1;
        for (let k = 0; k < 3; k++) g.px(x + k + Math.round(ph * 3), y - k - Math.round(ph * 2), 1, 1, '#e8e4dc', fade * 0.5 * (1 - ph * 0.6));
        return true;
      },
      // the choir: one line joining the singers' mouths, never breaking (MS 2263)
      choir(g, t, fade, rec) {
        const pts = [];
        for (const e of G.ents) if (e && e._p55 && /^ch\d\d$/.test(e._p55) && !e.hidden && e._screen && visible(e)) { const s = e._screen; pts.push([(s.x0 + s.x1) / 2, s.y0 + (s.y1 - s.y0) * 0.18]); }
        if (pts.length < 2) return false;
        pts.sort((a, b) => a[0] - b[0]);
        for (let i = 1; i < pts.length; i++) g.line(pts[i - 1][0], pts[i - 1][1], pts[i][0], pts[i][1], WHITEGOLD, fade * 0.7, 0);
        rec.n = pts.length;
        return true;
      },
      // the Pure Note over Oakhaven "like a lid" (MS 2323): a flat band across the sky, only where the view shows sky
      lid(g, t, fade, rec) {
        const c = Engine.cam, d = 40, el = 25 * Math.PI / 180;
        const p = toView(c.x + Math.cos(c.dir) * d, c.y + Math.sin(c.dir) * d, (c.z || 0.5) + d * Math.tan(el) / ZK()); if (!p) return false;
        const y = Math.round(p.y); if (y < 0 || y >= VHl()) return false;
        const sky = typeof Engine.MAT === 'object' ? Engine.MAT.sky : 1;
        let n = 0; g.a(fade * 0.45); ctx.fillStyle = col(WHITEGOLD);
        for (let x = 0; x < VWl(); x += 2) { if (Engine.materialAt(x, y) !== sky) continue; ctx.fillRect(x, y, 2, 1); if (((x >> 1) & 3) === 0) ctx.fillRect(x, y + 2, 1, 1); n++; }
        rec.y = y; rec.n = n;
        return n > 0;
      },
    },
    acts: [{ verb: 'tend', can: (e) => tendCan(e), run: (e) => tendRun(e) }],
    lines: { first: TX.cantorFirst },
  });
  // the tending note into a companion's hands (MS 250, 366): 8 voice, noise 0.9, mends 14; not while anything hunts you
  const hunted = () => { const c = Engine.cam; return G.ents.some((e) => liveEnemy(e) && e.state === 'chase' && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < 100); };
  const partyMaxOf = (id) => { try { return typeof partyMax === 'function' ? partyMax(id) : 40; } catch (e) { return 40; } };
  function tendCan(e) {
    if (!e || !e.companion || e.hidden || calling() !== 'cantor' || !G.party || !G.party.id) return false;
    if (!(G.party.hp < partyMaxOf(G.party.id)) || hunted() || distTo(e) > 2.6) return false;
    return true;
  }
  function tendRun(e) {
    card((typeof COMPANIONS === 'object' && COMPANIONS[G.party.id] && COMPANIONS[G.party.id].name) || TX.tendAct, TX.tendBody, [
      { t: TX.tendAct, f: () => {
        const p = G.player;
        if (!(p.voice >= 8)) { say(TX.short, 'warn', 4000); return; }
        p.voice -= 8; G.party.hp = Math.min(partyMaxOf(G.party.id), G.party.hp + 14);
        try { addNoise(0.9); } catch (err) { G.noise = (Number(G.noise) || 0) + 0.9; }
        try { Audio_.sfx.song(174, 1.0); } catch (err) { /* silent */ }
        say(TX.tend, 'good', 5500); firstAct('cantor', TX.jCantor);
        try { if (typeof partyHud === 'function') partyHud(); } catch (err) { /* none */ }
      } },
      { t: TX.talkInstead, f: () => { try { talk(e); } catch (err) { warnOnce('talk', err); } } },
      { t: TX.back, f: null },
    ]);
    return true;
  }
  // under the Narrow: a Cantor's murmur keeps the noise at 1.7, above the Hush's 1.5 and below everything that listens,
  // except where a listening horn listens ("a man on that horn could hear a cough on a deck", js/cutter68.js)
  const UNDER = 1.7;
  function underOK() {
    if (!hasG() || calling() !== 'cantor') return false;
    try { if (typeof CUTTER68 === 'object' && CUTTER68.stage() === 4) return false; } catch (e) { /* none */ }
    try { if (typeof AIR93 === 'object' && AIR93.R && AIR93.R.live && !AIR93.R.ended && AIR93.R.threat === 'courier') return false; } catch (e) { /* none */ }
    return true;
  }
  const hobChoice = (w) => { try { return calling() === 'cantor' && (w === 'lyra' || w === 'grafters') && G.player.voice >= 8 && !guest() ? [['hum', TX.hobHum]] : []; } catch (e) { return []; } };
  function hobHum() { const p = G.player; p.voice = Math.max(0, (Number(p.voice) || 0) - 8); firstAct('cantor', TX.jCantor); }
  const orlaLine = () => { try { return calling() === 'cantor' ? '<br><br>' + TX.orla : ''; } catch (e) { return ''; } };

  // ================================================================ CORSAIR: loads and lines
  const HEMP = '#968a6c', STRAIN = '#e0a040', FRAY = '#e0583a', COBALT = '#5c80e6';
  const deckId = () => { try { return (typeof KESTREL16 === 'object' && KESTREL16.DECK) || 'p16k_kestrel_deck'; } catch (e) { return 'p16k_kestrel_deck'; } };
  const air = () => (typeof AIR93 === 'object' && AIR93 && AIR93.R && AIR93.R.live && !AIR93.R.ended && G.mapId === deckId()) ? AIR93.R : null;
  const SL = () => (typeof SMALLLIFE === 'object' && SMALLLIFE ? SMALLLIFE : null);
  const fallen = (e) => { try { const k = e._p12r.k; return !!e._p12r.fall || RIGGING.hasBit(k === 'chand' ? 'p12r_ch' : 'p12r_sc', e._p12r.i, 8); } catch (err) { return false; } };
  const RCFG = () => { try { return RIGGING.CFG || {}; } catch (e) { return {}; } };
  // where a ship sprite carries its drift-tanks: the rows of cobalt pixels, and the middle of each run of them (cached)
  const TANKS = {};
  function tankRow(name, sp) {
    if (TANKS[name] !== undefined) return TANKS[name];
    let out = null;
    try {
      if (sp && sp.data && sp.w && sp.h) {
        let best = -1, bn = 0, bot = 0;
        for (let y = 0; y < sp.h; y++) { let n = 0; for (let x = 0; x < sp.w; x++) { const p = sp.data[y * sp.w + x], r = p & 255, gg = (p >> 8) & 255, b = (p >> 16) & 255; if ((p >>> 24) && b > r + 40 && b > 120 && b > gg) n++; if (p >>> 24) bot = Math.max(bot, y); } if (n > bn) { bn = n; best = y; } }
        if (best >= 0) {
          const xs = []; let run = -1;
          for (let x = 0; x <= sp.w; x++) { const p = x < sp.w ? sp.data[best * sp.w + x] : 0, b = (p >> 16) & 255, r = p & 255; const on = x < sp.w && (p >>> 24) && b > r + 40 && b > 120; if (on && run < 0) run = x; else if (!on && run >= 0) { xs.push((run + x) / 2 / sp.w); run = -1; } }
          out = { row: (best + 0.5) / sp.h, bot: (bot + 1) / sp.h, xs: xs.slice(0, 4) };
        }
      }
    } catch (e) { out = null; }
    return (TANKS[name] = out);
  }
  register('corsair', {
    radius: 10,
    targets(add, x) {
      const sl = SL(), c = x.c;
      if (sl && sl.isMoored() && sl.ship && sl.ship.e && G.ents.includes(sl.ship.e) && Math.hypot(sl.MAST.x - c.x, sl.MAST.y - c.y) < 16) {
        add({ e: sl.ship.e, kind: 'mast', free: true, any: true }); add({ e: sl.ship.e, kind: 'keel', free: true, any: true });
      }
      for (const e of (G.map._p12r || [])) {
        if (!e || !e._p12r || !G.ents.includes(e) || fallen(e)) continue;
        if (e._p12r.k === 'scaff') { add({ e, kind: 'lashing' }); add({ e, kind: 'patch', free: true }); }
        else if (e._p12r.k === 'chand') { add({ e, kind: 'chain' }); add({ e, kind: 'patch', free: true }); }
      }
      const R = air();
      if (R) {
        for (const e of R.chains) add({ e, kind: 'grapnel', free: true });
        for (const e of G.ents) {
          if (!e || e.kind !== 'deco') continue;
          if (e.use === 'p93_hold') { if (!R.lashed) add({ e, kind: 'knock' }); add({ e, kind: 'weights' }); }
          else if (e.use === 'p93_cradle') add({ e, kind: 'tanks93' });
        }
      }
    },
    draw: {
      // the Kestrel's mooring line, bar-taut (MS 1321, 674): from the mast head to her bow cone (js/smalllife.js rope(): a
      // short line, the bow rides up against the mast), drawn with strain ticks either side of it
      mast(g, t, fade, rec) {
        const sl = SL(), e = t.e, M = sl.MAST, H = sl.SHIP;
        const h = Math.atan2(M.y - e.y, M.x - e.x);
        const top = toView(M.x, M.y, M.top - 0.05); const a = top ? { x: top.x, y: top.y } : null;
        const bow = toView(e.x + Math.cos(h) * H.half * 0.97, e.y + Math.sin(h) * H.half * 0.97, (e.animLift || H.lift) + H.scale * 0.43);
        if (!a || !bow || !onView(a.x, a.y)) return false;
        g.line(a.x, a.y, bow.x, bow.y, STRAIN, fade * 0.9, 0);
        g.line(a.x - 1, a.y, bow.x - 1, bow.y, HEMP, fade * 0.9, 0);
        for (let k = 0; k < 3; k++) { const y = Math.round(a.y + 2 + k * 2); g.px(a.x - 4 - k, y, 2, 1, STRAIN, fade * 0.9); g.px(a.x + 3 + k, y, 2, 1, STRAIN, fade * 0.9); }   // the strain: bar-taut
        if (!st.kestrelSaid && st.sense >= 1) { st.kestrelSaid = true; say(TX.kestrel, '', 6500); }
        rec.x0 = a.x; rec.y0 = a.y; rec.x1 = bow.x; rec.y1 = bow.y;
        return true;
      },
      // under her keel, a plumb: riding heavy until cargo night has put the long gun over the side; her four tanks marked
      // where the sprite has them (read from its own pixels)
      keel(g, t, fade, rec) {
        const e = t.e, s = e._screen; if (!s) return false;
        const sp = Engine.sprites[e.animSprite || e.sprite], tk = tankRow(e.animSprite || e.sprite, sp); if (!tk) return false;
        const W = s.x1 - s.x0, Hh = s.y1 - s.y0, fx = (u) => e.animFlip ? s.x1 - u * W : s.x0 + u * W;
        const ky = s.y0 + Hh * tk.bot, kx = (s.x0 + s.x1) / 2;
        if (!onView(kx, ky + 3)) return false;
        const bars = Number(F().p56) >= 2 && Number(F().p56) !== 9 ? 2 : 3;
        g.plumb(kx, ky + 1, bars, STRAIN, fade * 0.85);
        const sour = (Number(G.day) | 0) % 2 === 1 ? 1 : -1;
        tk.xs.forEach((u, i) => g.tank(fx(u), s.y0 + Hh * tk.row, i === sour ? 'sour' : 'sound', i * 0.21, fade * 0.85));
        rec.bars = bars; rec.tanks = tk.xs.length;
        return true;
      },
      // a scaffold's lashings, marked where they will part
      lashing(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, hh = s.y1 - s.y0;
        for (const [u, v] of [[0.18, 0.22], [0.82, 0.22], [0.18, 0.62], [0.82, 0.62]]) {
          const x = s.x0 + w * u, y = s.y0 + hh * v;
          g.px(x - 1, y - 1, 3, 1, FRAY, fade * 0.85); g.px(x - 1, y + 1, 3, 1, FRAY, fade * 0.85); g.px(x, y, 1, 1, STRAIN, fade * 0.85);
        }
        return true;
      },
      // a chandelier's chain up to the vault, with fray ticks
      chain(g, t, fade, rec) {
        const s = t.s, x = (s.x0 + s.x1) / 2;
        g.line(x, s.y0, x, Math.max(0, s.y0 - 40), HEMP, fade * 0.8, 4, FRAY);
        return true;
      },
      // where it will land: under a chandelier; for a scaffold, on the side away from you, as js/rigging12.js knockScaff falls
      patch(g, t, fade, rec) {
        const e = t.e, c = Engine.cam, cf = RCFG();
        let wx = e.x, wy = e.y, r = cf.chandR || 2.5;
        if (e._p12r.k === 'scaff') { let dx = e.x - c.x, dy = e.y - c.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l; wx = e.x + dx * (cf.scaffReach || 1.8); wy = e.y + dy * (cf.scaffReach || 1.8); r = cf.scaffR || 1.5; }
        const n = g.patch(wx, wy, r, FRAY, fade * 0.55);
        rec.wx = wx; rec.wy = wy; rec.r = r; rec.n = n;
        return n > 0;
      },
      // an air93 grapnel chain, taut up out of view; fray ticks on the one bitten deepest
      grapnel(g, t, fade, rec) {
        const e = t.e, R = air(); if (!R || !e._screen || !visible(e)) return false;
        const s = e._screen, x = (s.x0 + s.x1) / 2, deep = R.chains.reduce((m, o) => Math.max(m, o._blows | 0), 0);
        const worst = (e._blows | 0) === deep && deep > 0;
        g.line(x, s.y1 - (s.y1 - s.y0) * 0.1, x + 2, 0, '#8a8c94', fade * 0.85, worst ? 4 : 2, worst ? FRAY : STRAIN);
        rec.worst = worst;
        return true;
      },
      // an unlashed hold: small knock-rings on what rings
      knock(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, hh = s.y1 - s.y0, ph = g.reduced() ? 0.5 : (g.now() * 0.8) % 1;
        for (let k = 0; k < 3; k++) { const x = s.x0 + w * (0.25 + 0.25 * k), y = s.y0 + hh * 0.4; g.ring(x, y, 1 + ph * 3, STRAIN, fade * 0.7 * (1 - ph)); g.px(x, y, 1, 1, STRAIN, fade * 0.7); }
        return true;
      },
      // what can go over the side: a plumb each, bars by weight (js/air93.js WEIGHT: salvage 0.3, water 0.25, spares 0.15)
      weights(g, t, fade, rec) {
        const R = air(); if (!R) return false;
        const s = t.s, w = s.x1 - s.x0;
        const W = (typeof AIR93 === 'object' && AIR93.WEIGHT) || { salvage: 0.3, water: 0.25, spares: 0.15 };
        const list = ['salvage', 'water', 'spares'].filter((k) => R.have[k]);
        list.forEach((k, i) => g.plumb(s.x0 + w * (0.2 + 0.3 * i), s.y0 - 9, clamp(Math.round((W[k] || 0.15) * 10) - 1, 1, 3), STRAIN, fade * 0.85));
        rec.n = list.length;
        return list.length > 0;
      },
      // the four tanks at the cradle: sound, sour or weeping (MS 1321; js/air93.js R.tanks)
      tanks93(g, t, fade, rec) {
        const R = air(); if (!R) return false;
        const s = t.s, w = s.x1 - s.x0;
        R.tanks.forEach((k, i) => g.tank(s.x0 + w * (0.2 + 0.2 * i), s.y0 - 6, k.st, i * 0.3, fade * 0.9));
        rec.states = R.tanks.map((k) => k.st).join(',');
        return true;
      },
    },
    acts: [],
    tick: corsairTick,
    lines: { first: TX.corsairFirst },
  });
  // a hook slipped by hand on an air93 flight: 5 s standing at it, R.spike +0.1 once (each axe blow is +0.6)
  const SLIP_S = 5, SLIP_SPIKE = 0.1;
  const flightNo = () => { try { return Number(F().p93_met) | 0; } catch (e) { return 0; } };
  const slip = {
    offered(e) { return !!(e && e.kind === 'deco' && e.use === 'p93_chain' && calling() === 'corsair' && air() && !guest()); },
    reset() { st.slipChoice = null; st.slipFlight = -1; st.slip = null; },
    job: () => st.slip,
    start(e) {
      const c = Engine.cam; st.slip = { e, t: 0, x: c.x, y: c.y };
      say(TX.slipping, 'warn', 4000);
    },
  };
  function corsairUse(e, down) {
    const R = air(); if (!R) return false;
    if (st.slipFlight !== flightNo()) { st.slipFlight = flightNo(); st.slipChoice = null; }
    if (st.slipChoice === 'cut') return false;
    if (st.slipChoice === 'slip') { if (!st.slip || st.slip.e !== e) slip.start(e); return true; }
    card(e.label || TX.cutIt, '', [
      { t: TX.cutIt, f: () => { st.slipChoice = 'cut'; try { down(); } catch (err) { warnOnce('cut', err); } } },
      { t: TX.slipIt, f: () => { st.slipChoice = 'slip'; slip.start(e); } },
    ]);
    return true;
  }
  function corsairTick(dt) {
    const j = st.slip; if (!j) return;
    const R = air();
    if (!R || !R.chains.includes(j.e)) { st.slip = null; return; }
    const c = Engine.cam;
    if (Math.hypot(c.x - j.x, c.y - j.y) > 1.2) { st.slip = null; say(TX.slipLeft, 'warn'); return; }
    j.t += dt;
    if (j.t < SLIP_S) return;
    st.slip = null;
    R.chains = R.chains.filter((o) => o !== j.e);
    for (const L of [G.map.entities, G.ents]) { if (!Array.isArray(L)) continue; const i = L.indexOf(j.e); if (i >= 0) L.splice(i, 1); }
    R.spike = Math.min(1.2, (Number(R.spike) || 0) + SLIP_SPIKE);
    say(TX.slipped, 'good', 3500);
    if (!R.chains.length) { try { say(AIR93.TX.chainsCut, 'good', 6000); } catch (err) { /* none */ } }
    bump('p126_slips'); firstAct('corsair', TX.jCorsair);
  }
  // cargo night: hand-cant to Mags, once a night (MS 1327, 5588); js/cargo56.js asks for it in each round
  function cargoChoice(C, done) {
    if (!C || C.signed || calling() !== 'corsair' || guest()) return null;
    return { t: TX.sign, f: () => { C.signed = true; say(TX.signed, '', 4500); firstAct('corsair', TX.jCorsair); if (done) done(); } };
  }

  // ================================================================ the tick (in update: the clock of everything here)
  function tick(dt) {
    if (!hasG() || !(dt > 0)) return;
    tickSense(dt);
    const reg = here();
    if (reg && reg.tick && G.state === 'play') { try { reg.tick(dt); } catch (e) { warnOnce('calling tick', e); } }
    st.gatherT -= dt;
    if (st.gatherT > 0) return;
    st.gatherT = GATHER_EVERY;
    if (G.state !== 'play' || guest() || inExtra()) return;
    const id = calling();
    if (id === 'blade') { try { bladeHear(); bladeHint(); } catch (e) { warnOnce('hear', e); } }
    if (st.sense > 0 && reg) {
      gather();
      const b = bitOf(id);
      if (st.sense >= 1 && targets.length && b && !(flagInt('p126_seen') & b) && FIRST[id]) { F().p126_seen = flagInt('p126_seen') | b; say(FIRST[id], 'voice', 7000); }
    } else targets.length = 0;
  }
  function resetTransient() { st.sense = 0; st.stillT = 0; st.ringT = 0; st.ringEnt = null; st.slip = null; st.hintMap = ''; targets.length = 0; drawn.length = 0; }

  // ================================================================ the wiring
  function wire() {
    if (typeof Engine !== 'undefined' && Engine.addPostHook) {
      // read-only: the raycaster's camera, for toView() in the classic view (post hooks do not run under the 3D view)
      Engine.addPostHook((F_) => { fi.ok = true; fi.cx = F_.cam.x; fi.cy = F_.cam.y; fi.cz = F_.cam.z == null ? 0.5 : F_.cam.z; fi.dirX = F_.dirX; fi.dirY = F_.dirY; fi.planeX = F_.planeX; fi.planeY = F_.planeY; fi.w = F_.w; fi.h = F_.h; fi.S = F_.S || 1; fi.horizon = F_.horizon; }, 990);
    }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { tick(dt); } catch (e) { warnOnce('tick', e); } return r; }; }
    if (typeof render === 'function') { const _r = render; render = function () { const r = _r.apply(this, arguments); try { api.draw(); } catch (e) { warnOnce('draw', e); } return r; }; }
    if (typeof interact === 'function') {
      const _i = interact;
      interact = function () {
        try { if (actsOn()) { const e = Engine.pick(G.ents, typeof USE_RANGE === 'number' ? USE_RANGE : 2); if (e && !e.dead && tryActs(e)) return undefined; } } catch (err) { warnOnce('interact', err); }
        return _i.apply(this, arguments);
      };
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        const self = this, args = arguments;
        try { if (slip.offered(e) && actsOn() && corsairUse(e, () => _ud.apply(self, args))) return undefined; } catch (err) { warnOnce('use', err); }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof castSong === 'function') {
      const _cs = castSong;
      castSong = function (id) {
        if (id !== 'murmur' || !underOK() || typeof SONGS !== 'object' || !SONGS.murmur) return _cs.apply(this, arguments);
        const s = SONGS.murmur, was = s.noise, m0 = G.murmurT;
        s.noise = clamp(UNDER + 0.02 - (Number(G.noise) || 0), 0, 0.3);   // under: never lifts the noise past the hum's own floor
        let r; try { r = _cs.apply(this, arguments); } finally { s.noise = was; }
        try { if (G.murmurT > 0 && G.murmurT !== m0) { if (!st.underSaid) { st.underSaid = true; say(TX.under, 'good', 5000); } firstAct('cantor', TX.jCantor); } } catch (e) { /* none */ }
        return r;
      };
    }
    if (typeof updateNarrow === 'function') {
      const _un = updateNarrow;
      updateNarrow = function (dt) {
        if (!(G.murmurT > 0) || !underOK()) return _un.apply(this, arguments);
        G.noise = Math.max(Number(G.noise) || 0, UNDER);
        const m = G.murmurT; G.murmurT = 0;   // the original's floor is the stillness one; the Hush test sees 1.7 less a step's decay
        try { return _un.apply(this, arguments); } finally { G.murmurT = Math.max(0, m - (Number(dt) || 0)); }
      };
    }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { targets.length = 0; drawn.length = 0; st.slip = null; st.hintMap = ''; st.gatherT = 0; } catch (e) { /* none */ } return r; }; }
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () { try { resetTransient(); } catch (e) { /* none */ } const r = _rg.apply(this, arguments); try { if (hasG()) api.validate(G.flags); } catch (e) { warnOnce('validate', e); } return r; };
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
            b.onclick = () => cycle();
            grid.appendChild(lab); grid.appendChild(b); syncRow();
          }
        } catch (e) { warnOnce('row', e); }
        return r;
      };
    }
    try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(syncRow); } catch (e) { /* none */ }
  }

  const api = {
    register, unregister, ids, TEXTS, TX, FLAGS, validate, stats, sense: () => st.sense, lastDrawn, toView, visible, gather, draw,
    acts: tryActs, hobChoice, hobHum, orlaLine, cargoChoice, slip, ringing: () => st.ringT, mode: () => mode, setMode, setting, cycle, syncRow, ROW, FLAG,
    underOK, st,
  };
  try { wire(); } catch (e) { console.warn('callings126 failed to wire', e); }
  return api;
})();
if (typeof window !== 'undefined') window.CALLINGS126 = CALLINGS126;
