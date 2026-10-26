// ============================================================
//  cinematic24 — Phase 24 "The opening": a scripted camera sequence before the first step.
//
//  The game used to open on six paragraphs of text scrolling over black (INTRO, js/data.js). The same six lines now
//  run as captions under a camera that flies through the game's own maps, in the player's own renderer and preset:
//    1  "It is autumn, 419 SR. Seven years ago the Light let go."      Wethercombe from Hob's Knap, the sun on the ridge, a descent
//    2  "You have come up the Greenroot road to Oakhaven ... a hedge" the road outside the Hedge at dusk, the town behind it
//    3  "Too loud brings the hounds. Too still brings the Hush."      the Deep Woods at night: hounds; then the picture drains
//    4  "The Church is coming up the road behind you ..."             the Synod column marching through Greenroot under glass-fire
//    5  "Nobody has rung a bell in Oakhaven ..."                       a crane over the main street at dusk to the empty bell-tower
//    6  (black) the title card; then "Keep your voice in your chest." fading up on the North Gate: the first frame of play
//  Nothing in the world is changed by it: every figure it stages is transient and removed, the maps are the real maps,
//  the clock is put back to the dusk the game starts at, and the sequence ends on loadMap('oakhaven') exactly as the
//  old intro did. Skip at any time: Esc, Enter, Space, a click, the Skip button (the old intro's own handlers, so the
//  tests that click #btn-intro-skip still land in Oakhaven at once). A setting (Options -> Graphics & access,
//  "Opening cinematic") turns it off, which gives the old scrolling text back unchanged; "Watch again" replays it from
//  inside a game. Reduce motion holds every shot still and cross-fades; No flashes keeps the glass-fire steady.
//  The camera: R3D (js/r3d21.js) can look from above the walls, so the crane shots climb; on the CPU raycaster the same
//  shots run at eye height. Pitch goes through R3D.camera.setAngle, which clamps per renderer. The HUD is not drawn
//  (drawHUD is a no-op while it runs) and the fade, bars, captions and card are DOM over the view.
//  Music: the title cue keeps playing (musicDirector requests it in the intro state; with the Extended score that is the
//  main theme's first stage). The Pure Note under shot 4 and the hounds in shot 3 are the game's own sfx.
//  State: localStorage 'octave.cine24.v1' { play: 0|1 }. No saved fields, no flags, no Math.random.
// ============================================================
'use strict';

const CINEMATIC24 = (function () {
  const KEY = 'octave.cine24.v1';
  const $q = (s) => (typeof document !== 'undefined' ? document.querySelector(s) : null);
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const ease = (t) => (t <= 0 ? 0 : t >= 1 ? 1 : t * t * (3 - 2 * t));
  const lerp = (a, b, t) => a + (b - a) * t;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('cinematic24 ' + k, e); };
  const hasG = () => typeof G !== 'undefined' && G && typeof Engine !== 'undefined';
  const reduced = () => !!(typeof GFX !== 'undefined' && GFX.reduceMotion);
  const noFlash = () => !!(typeof GFX !== 'undefined' && GFX.noFlash);
  const r3dOn = () => { try { return typeof R3D !== 'undefined' && R3D.active(); } catch (e) { return false; } };
  const stats = { played: 0, skipped: 0, finished: 0, shots: 0, errors: 0 };

  // ---------------------------------------------------------------- the setting
  const set = { play: true };
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ play: set.play ? 1 : 0 })); } catch (e) { /* no storage */ } }
  function restore() { try { const d = JSON.parse(localStorage.getItem(KEY) || 'null'); if (d && typeof d === 'object') set.play = d.play !== 0; } catch (e) { /* ignore */ } }

  // ---------------------------------------------------------------- the shots
  // cam: x, y, dir (radians), pitch (radians, down is negative), h (eye height above the ground: R3D only; the CPU
  // raycaster keeps 0.88). from/to are eased over dur seconds (held at `from` under Reduce motion). cap is the INTRO line.
  const TOD = { gold: 0.715, dusk: 0.73, lateDusk: 0.76, night: 0.95 };   // the sun on the ridge; the Hedge at dusk; lamps lit; the woods at night
  const SHOTS = [
    { id: 'combe', map: 'p22_combe', tod: TOD.gold, dur: 8.5, cap: 0,
      from: { x: 54.8, y: 18.3, dir: 3.1, pitch: 0.0, h: 1.7 }, to: { x: 52.8, y: 18.1, dir: 3.07, pitch: -0.05, h: 0.95 } },
    { id: 'hedge', map: 'clearing', tod: TOD.dusk, dur: 9.5, cap: 1,
      from: { x: 20.5, y: 16.5, dir: Math.PI / 2, pitch: 0.0, h: 1.05 }, to: { x: 20.5, y: 31.2, dir: Math.PI / 2, pitch: 0.02, h: 0.92 } },
    { id: 'hounds', map: 'deepwoods', tod: TOD.night, dur: 9, cap: 2, hush: 0.62,
      from: { x: 27.5, y: 37.0, dir: -Math.PI / 2, pitch: 0, h: 0.88 }, to: { x: 27.5, y: 35.4, dir: -Math.PI / 2, pitch: 0, h: 0.88 }, stage: 'hounds' },
    { id: 'church', map: 'greenroot', tod: TOD.lateDusk, dur: 11.5, cap: 3,
      from: { x: 4.8, y: 13.5, dir: 0.02, pitch: 0.0, h: 0.95 }, to: { x: 2.6, y: 13.5, dir: -0.02, pitch: 0.0, h: 0.95 }, stage: 'column' },
    { id: 'town', map: 'oakhaven', tod: TOD.lateDusk, dur: 10.5, cap: 4,
      from: { x: 10.5, y: 23.5, dir: 0.0, pitch: 0.06, h: 0.95 }, to: { x: 18.5, y: 23.5, dir: -0.08, pitch: 0.0, h: 0.95 } },
    { id: 'card', card: true, dur: 6.0 },
    { id: 'gate', map: 'oakhaven', tod: 0.74, dur: 4.0, cap: 5, spawn: true, from: null, to: null },
  ];
  const FADE = 1.1;   // seconds, each cut

  // ---------------------------------------------------------------- the DOM
  const CSS = `
#cine24 { position: absolute; inset: 0; z-index: 6; pointer-events: none; overflow: hidden; font-family: var(--font-body, serif); }
#cine24 .bar { position: absolute; left: 0; right: 0; height: 11.5cqh; background: #000; transition: transform 900ms ease; }
#cine24 .bar.top { top: 0; transform: translateY(-100%); } #cine24 .bar.bot { bottom: 0; transform: translateY(100%); }
#cine24.bars .bar { transform: none; }
#cine24 .fade { position: absolute; inset: 0; background: #000; opacity: 1; transition: opacity ${FADE}s ease; }
#cine24 .fade.clear { opacity: 0; } #cine24 .fade.snap { transition: none; }
#cine24 .cap { position: absolute; left: 50%; bottom: 13.5cqh; transform: translateX(-50%); width: 72cqw; text-align: center; font-size: min(2.5cqw, 3cqh); line-height: 1.45; color: var(--parch, #e8dcc0); text-shadow: 0 0 3px #000, 0 1px 0 #000, 1px 0 0 #000, 0 0 14px rgba(0,0,0,.9); opacity: 0; transition: opacity 700ms ease; }
#cine24 .cap.on { opacity: 1; }
#cine24 .card { position: absolute; inset: 0; display: flex; flex-direction: column; align-items: center; justify-content: center; opacity: 0; transition: opacity 1.4s ease; background: #000; }
#cine24 .card.on { opacity: 1; }
#cine24 .card svg { width: 8cqw; height: 8cqw; color: var(--gold, #d4a24a); margin-bottom: 1.4cqh; }
#cine24 .card h1 { font-family: var(--font-display, serif); font-weight: 700; font-size: 6.2cqw; line-height: 1; margin: 0; color: var(--gold, #d4a24a); letter-spacing: .04em; text-align: center; text-shadow: 0 2px 0 #3a2a10, 0 0 24px rgba(0,0,0,.9); }
#cine24 .card .sub { font-family: var(--font-sc, serif); font-size: 2.6cqw; color: var(--parch, #e8dcc0); margin: 1.6cqh 0 0; letter-spacing: .12em; }
#intro.cine { background: transparent; }
#intro.cine #intro-text, #intro.cine .hint-key { display: none; }
#intro.cine #btn-intro-skip { position: absolute; right: 2.4cqw; bottom: 2.2cqh; z-index: 8; opacity: .85; }
#game.cine24 #msgs, #game.cine24 #hint, #game.cine24 #lockhint, #game.cine24 #cover-status, #game.cine24 #touchui, #game.cine24 #gpu18-hud, #game.cine24 #scr-card { visibility: hidden !important; }
#game.cine24 #view { transition: filter 2.6s ease; }
#game.cine24.hush #view { filter: saturate(0.2) contrast(0.86) brightness(0.93); }
html.ac-rm #cine24 .bar, html.ac-rm #cine24 .fade, html.ac-rm #cine24 .cap, html.ac-rm #cine24 .card { transition-duration: 400ms; }
`;
  const SIGIL = '<svg viewBox="0 0 64 64" aria-hidden="true" fill="none"><circle cx="32" cy="32" r="26" stroke="currentColor" stroke-width="2"/><path d="M32 8 L50 46 L14 46 Z" stroke="currentColor" stroke-width="2"/><path d="M14 46 L32 60 L50 46" stroke="currentColor" stroke-width="2"/></svg>';
  let ui = null;
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('cine24-style')) return;
    const st = document.createElement('style'); st.id = 'cine24-style'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function buildUI() {
    const game = document.getElementById('game'); if (!game) return null;
    const root = document.createElement('div'); root.id = 'cine24'; root.setAttribute('aria-hidden', 'true');
    const top = document.createElement('div'); top.className = 'bar top';
    const bot = document.createElement('div'); bot.className = 'bar bot';
    const fade = document.createElement('div'); fade.className = 'fade';
    const cap = document.createElement('p'); cap.className = 'cap';
    const card = document.createElement('div'); card.className = 'card';
    card.innerHTML = SIGIL;   // a constant: the title screen's own sigil
    const h1 = document.createElement('h1'); const t = $q('#title .title-inner h1'); h1.textContent = t ? Array.from(t.childNodes).map((n) => n.textContent.trim()).filter(Boolean).join(' ') : 'Echoes of the Shattered Octave';
    const sub = document.createElement('p'); sub.className = 'sub'; const s = $q('#title .title-inner .sub'); sub.textContent = s ? s.textContent : 'Book One · The Silenced Province';
    card.append(h1, sub);
    root.append(fade, top, bot, cap, card); game.appendChild(root);
    return { root, top, bot, fade, cap, card, game };
  }

  // ---------------------------------------------------------------- staging: figures that exist only for the shot
  const R = { ents: [] };
  function place(m, e) { e.transient = true; e._cine = true; e.nopick = true; e.solid = false; if (typeof hydrate === 'function') hydrate(e); m.entities.push(e); R.ents.push([m, e]); return e; }
  function unstage() {
    for (const [m, e] of R.ents) { const i = m.entities.indexOf(e); if (i >= 0) m.entities.splice(i, 1); }
    R.ents = []; R.column = null; R.hounds = null;
  }
  const walk = (e, t, rate) => { const ph = Math.floor(t * rate) & 3; e.animSprite = ph === 1 ? e.sprite + '_w1' : ph === 3 ? e.sprite + '_w2' : null; };
  // the Synod column: the Flambeau first with his lantern, the Herald, then the Proctors two abreast with censers of
  // glass-fire between the files. They walk west along the Greenroot road toward the camera.
  function stageColumn(m) {
    const col = { figs: [], cens: [] };
    const y0 = 13.5;
    col.figs.push(place(m, { kind: 'deco', sprite: 'flambeau', x: 24.0, y: y0, scale: 1.0, lightCol: [70, 95, 140], _row: 0, _off: 0 }));
    col.figs.push(place(m, { kind: 'deco', sprite: 'herald', x: 25.8, y: y0 - 0.7, scale: 1.0, _row: 1.6, _off: -0.7 }));
    for (let i = 0; i < 10; i++) {
      const row = 3.2 + i * 1.4, side = (i & 1) ? 0.8 : -0.8;
      col.figs.push(place(m, { kind: 'deco', sprite: 'proctor', x: 24.0 + row, y: y0 + side, scale: 1.0, _row: row, _off: side }));
      if (i % 2 === 1) col.cens.push(place(m, { kind: 'deco', sprite: 'p12_censer', x: 24.0 + row - 0.75, y: y0, scale: 0.55, yOff: 0.05, lightCol: [40, 95, 160], _row: row - 0.75, _off: 0 }));
    }
    col.t0 = null; R.column = col; return col;
  }
  function tickColumn(t) {
    const col = R.column; if (!col) return;
    const head = 17.6 - t * 1.2;                                    // a slow processional pace, 1.2 cells a second
    for (const e of col.figs) { e.x = head + e._row; e.y = 13.5 + e._off + Math.sin(t * 2.6 + e._row) * 0.03; e.animFlip = true; walk(e, t + e._row, 3.2); }
    for (const e of col.cens) { e.x = head + e._row; e.y = 13.5 + e._off; }
    const pulse = noFlash() ? 1 : 0.86 + 0.14 * Math.sin(t * 5.1);
    for (const e of col.cens) e.lightCol = [40 * pulse, 95 * pulse, 160 * pulse];
    if (!reduced() && Math.floor(t / 2.4) !== col.lastNote && t > 0.6) { col.lastNote = Math.floor(t / 2.4); try { Audio_.sfx.song(528, 2.6); } catch (e) { /* silent */ } }
  }
  // the hounds: three of them, low in the dark between the trunks, coming on and stopping short
  function stageHounds(m) {
    const H = [];
    place(m, { kind: 'deco', sprite: 'lamp', x: 25.9, y: 31.2, scale: 1.0, glow: 1 });   // a hush-lamp: the only light, and what they come into
    for (const [x, y, d] of [[26.3, 26.8, 0.4], [29.4, 25.9, 1.0], [28.1, 24.2, 1.6]]) H.push(place(m, { kind: 'deco', sprite: 'hound', x, y, scale: 1.0, _hx: x, _hy: y, _d: d }));
    R.hounds = H; R.howled = false; return H;
  }
  function tickHounds(t) {
    const H = R.hounds; if (!H) return;
    for (const e of H) { const k = clamp((t - e._d) / 4.2, 0, 1); e.x = e._hx + (e._hx < 27.5 ? 0.4 : -0.4) * ease(k); e.y = e._hy + ease(k) * 4.0; e.animFlip = false; if (k < 1 && k > 0) walk(e, t * 1.6 + e._d, 3.4); else e.animSprite = null; }
    if (!R.howled && t > 1.2) { R.howled = true; try { Audio_.sfx.hound(); } catch (e) { /* silent */ } }
  }

  // ---------------------------------------------------------------- the camera
  function camTo(m, c) {
    const cam = Engine.cam;
    cam.x = c.x; cam.y = c.y; cam.dir = c.dir; cam.bob = 0;
    const ground = (m.lvls || m.smooth) && typeof m.groundAt === 'function' ? m.groundAt(c.x, c.y) : 0;
    cam.z = ground + (r3dOn() ? clamp(c.h, 0.5, 6) : 0.88);
    try { if (typeof R3D !== 'undefined' && R3D.camera) R3D.camera.setAngle(c.pitch); else cam.pitch = clamp(c.pitch * 240, -40, 40); } catch (e) { cam.pitch = 0; }
  }
  function mix(a, b, t) { return { x: lerp(a.x, b.x, t), y: lerp(a.y, b.y, t), dir: lerp(a.dir, b.dir, t), pitch: lerp(a.pitch, b.pitch, t), h: lerp(a.h, b.h, t) }; }

  // ---------------------------------------------------------------- the run
  const S = { on: false, t: 0, t0: 0, speed: 1, shot: -1, raf: 0, last: 0, saved: null, handlers: null, phase: '', drawHUD: null };
  function capText(i) { const L = typeof INTRO !== 'undefined' && Array.isArray(INTRO) ? INTRO : []; return L[i] || ''; }
  function setShot(i) {
    const sh = SHOTS[i]; S.shot = i; S.t = 0; S.t0 = performance.now(); S.phase = 'in'; stats.shots++;
    ui.card.classList.toggle('on', !!sh.card);
    ui.game.classList.remove('hush');
    if (sh.card) { ui.cap.classList.remove('on'); ui.root.classList.remove('bars'); return; }
    ui.root.classList.add('bars');
    const m = G.maps[sh.map]; if (!m) { next(); return; }
    unstage();
    G.tod = sh.tod;
    try { Engine.setWeather({}); } catch (e) { /* no weather */ }
    const pos = sh.spawn ? undefined : { x: sh.from.x, y: sh.from.y, dir: sh.from.dir };
    loadMap(sh.map, pos);
    G.fadeT = 0;
    if (sh.stage === 'column') stageColumn(m);
    if (sh.stage === 'hounds') stageHounds(m);
    if (!sh.spawn) camTo(m, sh.from);
    ui.cap.textContent = capText(sh.cap); ui.cap.classList.add('on');
    ui.fade.classList.add('clear');
  }
  function next() {
    const i = S.shot + 1;
    if (i >= SHOTS.length) { end(false); return; }
    setShot(i);
  }
  function tick(now) {
    if (!S.on) return;
    S.raf = requestAnimationFrame(tick);
    if (!hasG() || G.state !== 'intro') { end(true); return; }   // something else took the screen
    const sh = SHOTS[S.shot]; if (!sh) return;
    S.t = Math.max(0, (now - S.t0) / 1000) * S.speed;   // the clock, not the frame: the sequence lasts the same on any machine
    const m = G.maps[sh.map];
    try {
      if (sh.card) {
        if (S.t > 0.5 && S.phase === 'in') { ui.card.classList.add('on'); S.phase = 'hold'; }
        if (S.t > sh.dur - 1.4 && S.phase === 'hold') { ui.card.classList.remove('on'); S.phase = 'out'; }
      } else if (m) {
        const k = reduced() ? 0 : ease(S.t / sh.dur);
        if (!sh.spawn) camTo(m, mix(sh.from, sh.to, k));
        if (sh.stage === 'column') tickColumn(S.t);
        if (sh.stage === 'hounds') tickHounds(S.t);
        if (sh.hush != null) ui.game.classList.toggle('hush', S.t > sh.dur * sh.hush);
        if (S.t > sh.dur - FADE && S.phase !== 'out') { S.phase = 'out'; ui.fade.classList.remove('clear'); ui.cap.classList.remove('on'); }
      }
    } catch (e) { stats.errors++; warnOnce('tick', e); }
    if (S.t >= sh.dur) next();
  }
  function start(handlers) {
    if (S.on || !hasG()) return false;
    injectStyle(); ui = buildUI(); if (!ui) return false;
    S.on = true; S.handlers = handlers; S.saved = { tod: G.tod, skipLabel: $q('#btn-intro-skip') ? $q('#btn-intro-skip').textContent : '', weather: null };
    // the sky is held clear for the run (hold pins it: no roll, no 'the weather clears' message) and let go after
    try { if (typeof Weather !== 'undefined' && Weather.hold) { S.saved.weather = { state: Weather.state }; Weather.hold('clear'); } } catch (e) { warnOnce('weather', e); }
    stats.played++;
    ui.game.classList.add('cine24');
    const intro = $q('#intro'); if (intro) intro.classList.add('cine');
    const btn = $q('#btn-intro-skip'); if (btn) btn.textContent = 'Skip';
    S.drawHUD = typeof drawHUD === 'function' ? drawHUD : null;
    if (S.drawHUD) drawHUD = function () { /* no HUD under the cinematic */ };
    S.shot = -1; S.last = performance.now();
    setShot(0);
    S.raf = requestAnimationFrame(tick);
    return true;
  }
  // skipped: the player cut it short. Either way the game goes on exactly as the old intro's Continue did.
  function end(skipped) {
    if (!S.on) return;
    S.on = false; cancelAnimationFrame(S.raf);
    if (skipped) stats.skipped++; else stats.finished++;
    try { unstage(); } catch (e) { warnOnce('unstage', e); }
    if (S.drawHUD) { drawHUD = S.drawHUD; S.drawHUD = null; }
    if (S.saved) { G.tod = S.saved.tod; try { const w = S.saved.weather; if (w && typeof Weather !== 'undefined' && Weather.hold) { Weather.hold(w.state); Weather.release(); } } catch (e) { warnOnce('weather', e); } }
    try { ui.game.classList.remove('cine24', 'hush'); if (ui.root.parentNode) ui.root.parentNode.removeChild(ui.root); } catch (e) { /* gone */ }
    const intro = $q('#intro'); if (intro) intro.classList.remove('cine');
    const btn = $q('#btn-intro-skip'); if (btn && S.saved) btn.textContent = S.saved.skipLabel || 'Continue';
    const msgs = $q('#msgs'); if (msgs) msgs.innerHTML = '';
    const h = S.handlers; S.handlers = null;
    if (!skipped && h && h.go) { try { h.go(); } catch (e) { warnOnce('go', e); } }
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    restore();
    if (typeof startGame === 'function') {
      const _s = startGame;
      startGame = function () {
        const r = _s.apply(this, arguments);
        try {
          if (!set.play || !hasG() || G.state !== 'intro') return r;
          const btn = $q('#btn-intro-skip'), intro = $q('#intro'); if (!btn || !intro) return r;
          const origBtn = btn.onclick, origIntro = intro.onclick;
          const go = () => { try { origBtn({ stopPropagation() { /* synthetic */ } }); } catch (e) { warnOnce('continue', e); } if (hasG()) G.fadeT = 0.5; };
          // the old handlers stay the way out: skipping tears the sequence down, then continues as before
          btn.onclick = (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); end(true); if (hasG()) G.fadeT = 0.5; return origBtn ? origBtn(ev || { stopPropagation() { /* synthetic */ } }) : undefined; };
          intro.onclick = (ev) => { end(true); return origIntro ? origIntro(ev) : undefined; };
          start({ go });
        } catch (e) { stats.errors++; warnOnce('start', e); }
        return r;
      };
    }
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRows(); } catch (e) { warnOnce('rows', e); } return r; };
    }
  }
  // Options -> Graphics & access: the switch, and a replay from inside a game
  function appendRows() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById('cine24-play')) return;
    const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.id = 'cine24-play-label'; lab.textContent = 'Opening cinematic ';
    const small = document.createElement('small'); small.className = 'muted'; small.textContent = 'the flight over the Reach before a new game'; lab.appendChild(small);
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'cine24-play'; b.type = 'button'; b.setAttribute('aria-label', 'Opening cinematic');
    const sync = () => { b.textContent = set.play ? 'On' : 'Off'; b.setAttribute('aria-pressed', set.play ? 'true' : 'false'); };
    b.onclick = () => { set.play = !set.play; save(); sync(); };
    sync(); grid.appendChild(lab); grid.appendChild(b);
    if (hasG() && G.player && G.map) {
      const lab2 = document.createElement('span'); lab2.className = 'gfx-label'; lab2.textContent = 'Watch the opening again ';
      const b2 = document.createElement('button'); b2.className = 'dfbtn small'; b2.id = 'cine24-replay'; b2.type = 'button'; b2.textContent = 'Play';
      b2.onclick = () => { try { closeModal(); } catch (e) { /* none */ } replay(); };
      grid.appendChild(lab2); grid.appendChild(b2);
    }
  }
  // replay from a running game: the intro screen hosts it again, and the end puts you back where you stood
  function replay() {
    if (S.on || !hasG() || !G.player || !G.map) return false;
    const back = { map: G.mapId, x: Engine.cam.x, y: Engine.cam.y, dir: Engine.cam.dir, state: 'play' };
    const intro = $q('#intro'), btn = $q('#btn-intro-skip'); if (!intro || !btn) return false;
    const it = $q('#intro-text'); if (it) it.innerHTML = '';
    G.state = 'intro'; show('#intro');
    const done = () => { if (G.state !== 'intro') return; hide('#intro'); G.state = 'paused'; loadMap(back.map, { x: back.x, y: back.y, dir: back.dir }); G.state = back.state; G.fadeT = 0.5; };
    btn.onclick = (ev) => { if (ev && ev.stopPropagation) ev.stopPropagation(); end(true); done(); };
    intro.onclick = () => { end(true); done(); };
    return start({ go: done });
  }
  wire();

  return { KEY, SHOTS, FADE, set, stats, start, end, replay, save, restore, running: () => S.on, shot: () => S.shot, time: () => S.t, staged: () => R.ents.length, injectStyle, get speed() { return S.speed; }, set speed(v) { S.speed = Math.max(0.1, +v || 1); } };
})();
if (typeof window !== 'undefined') window.CINEMATIC24 = CINEMATIC24;
