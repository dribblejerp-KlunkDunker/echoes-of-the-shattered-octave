// ============================================================
//  feel88 — Phase 88 (part two): the first two Daggerfall Unity ideas the owner approved on 14 Nov ("I agree with
//  your recommendation"): weapons with weight in the hand and a shield that shows the knocks it takes; swings whose
//  picture follows the line you drag. Ideas only, written in our own code.
//
//    weight    the weapon in your right hand lags a little behind when you turn and settles when you stop, and dips when
//              you start or stop walking: more for a maul than a knife (from its speed, two hands count heavier).
//    knocks    a blow you block jolts the shield; it keeps the marks (scratches, then dents) until you rest. The marks
//              are only for show; at most twelve.
//    arcs      the swing you drag is the swing you see: a thrust is a thrust, a chop comes down, a cut comes up, a slash
//              goes the way you dragged, whatever the weapon (it used to be chosen by the weapon). The trail behind the
//              edge (js/flourish11.js) follows the painted blade's own tip.
//
//  Off with Reduce motion (the weight and the jolt; the arcs stay, they are the swing itself). Nothing here uses random
//  numbers: the marks fall where a hash of the shield and the count puts them.
// ============================================================
'use strict';

const FEEL88 = (function () {
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('feel88: ' + k, e); } };
  const hash = (a, b, s) => { const v = Math.sin(a * 127.1 + b * 311.7 + (s || 0) * 74.7) * 43758.5453; return v - Math.floor(v); };
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const reduced = () => { try { return typeof GFX !== 'undefined' && !!GFX.reduceMotion; } catch (e) { return false; } };
  const B = { TURN: 5.5, MAXX: 16, MAXY: 10, K: 70, DAMP: 10, DIP: 2.2, JOLT: 9, MARKS: 12 };

  // ---------------------------------------------------------------- the weapon's weight
  const W = { x: 0, y: 0, vx: 0, vy: 0, dir: null, speed: 0 };
  function massOf(wid) {
    try { const w = WEAPONS[wid]; if (!w || w.innate || w.img === 'fp_hands') return 0; return clamp(0.5 + (w.speed || 0.6) + (w.twoHanded ? 0.35 : 0), 0.7, 2.2); } catch (e) { return 1; }
  }
  function tickWeight(dt) {
    const c = Engine.cam; if (W.dir == null) W.dir = c.dir;
    let dd = c.dir - W.dir; dd = Math.atan2(Math.sin(dd), Math.cos(dd)); W.dir = c.dir;
    const turn = dt > 0 ? dd / dt : 0, sp = Math.hypot(G.vel ? G.vel.x : 0, G.vel ? G.vel.y : 0), acc = dt > 0 ? (sp - W.speed) / dt : 0; W.speed = sp;
    let m = 1; try { m = massOf(G.player.weapons[G.player.weapon]) || 0; } catch (e) { m = 1; }
    const tx = m ? clamp(-turn * B.TURN * m, -B.MAXX, B.MAXX) : 0, ty = m ? clamp(acc * B.DIP * m * 0.1, -B.MAXY, B.MAXY) : 0;
    const k = B.K / Math.max(0.7, m), damp = B.DAMP / Math.sqrt(Math.max(0.7, m)), h = Math.min(dt, 1 / 30);
    W.vx += ((tx - W.x) * k - W.vx * damp) * h; W.x += W.vx * h;
    W.vy += ((ty - W.y) * k - W.vy * damp) * h; W.y += W.vy * h;
    if (Math.abs(W.x) < 0.05 && Math.abs(W.vx) < 0.05) { W.x = 0; W.vx = 0; }
    if (Math.abs(W.y) < 0.05 && Math.abs(W.vy) < 0.05) { W.y = 0; W.vy = 0; }
  }
  // on the half-pixel grid, as the sway is (a picture sliding by hundredths of a pixel shimmers)
  function weaponOffset() {
    if (reduced()) return { x: 0, y: 0 };
    const k = G.attack && G.attack.t > 0 ? 0.5 : 1;
    return { x: Math.round(W.x * k * 2) / 2, y: Math.round(W.y * k * 2) / 2 };
  }

  // ---------------------------------------------------------------- the shield's knocks
  const J = { x: 0, y: 0, r: 0, vx: 0, vy: 0, vr: 0 };
  function knock(full) {
    if (!reduced()) { J.vx += full ? 70 : 40; J.vy += full ? 120 : 60; J.vr -= full ? 0.9 : 0.5; }
    try {
      const p = G.player, id = p && p.armor && p.armor.shield; if (!id) return;
      if (!p.knocks88 || typeof p.knocks88 !== 'object') p.knocks88 = {};
      p.knocks88[id] = Math.min(B.MARKS, (p.knocks88[id] | 0) + 1);
    } catch (e) { warnOnce('knock', e); }
  }
  function tickJolt(dt) {
    const h = Math.min(dt, 1 / 30), k = 160, d = 14;
    J.vx += (-J.x * k - J.vx * d) * h; J.x += J.vx * h;
    J.vy += (-J.y * k - J.vy * d) * h; J.y += J.vy * h;
    J.vr += (-J.r * k - J.vr * d) * h; J.r += J.vr * h;
    if (Math.abs(J.x) + Math.abs(J.y) < 0.05 && Math.abs(J.vx) + Math.abs(J.vy) < 0.1) { J.x = J.y = J.vx = J.vy = 0; }
    if (Math.abs(J.r) < 0.001 && Math.abs(J.vr) < 0.01) { J.r = J.vr = 0; }
  }
  function shieldJolt() { if (reduced()) return { x: 0, y: 0, r: 0 }; return { x: Math.round(J.x * 2) / 2, y: Math.round(J.y * 2) / 2, r: J.r }; }
  const markCache = new Map();
  // the shield's picture with its marks: pale scratches first, then dark dents with a lit lip, where the hash puts them
  function marked(art, id) {
    let n = 0; try { n = (G.player.knocks88 && G.player.knocks88[id]) | 0; } catch (e) { n = 0; }
    if (!n || !art || !art.canvas) return art ? art.canvas : null;
    const key = id + '|' + n + '|' + art.w + 'x' + art.h + '|' + (art.canvas.width);
    let c = markCache.get(key); if (c && c.src === art.canvas) return c.cv;
    const cv = document.createElement('canvas'); cv.width = art.canvas.width; cv.height = art.canvas.height;
    const x = cv.getContext('2d'); x.drawImage(art.canvas, 0, 0);
    const sx = cv.width / art.w, sy = cv.height / art.h, seed = id.length * 31 + id.charCodeAt(id.length - 1);
    x.save(); x.globalCompositeOperation = 'source-atop';
    for (let i = 0; i < n; i++) {
      let u = 0, v = 0, tries = 0;
      do { u = 0.18 + hash(i, seed, tries) * 0.64; v = 0.15 + hash(seed, i, tries + 7) * 0.7; tries++; } while (tries < 6 && x.getImageData(Math.floor(u * cv.width), Math.floor(v * cv.height), 1, 1).data[3] < 200);
      const px = u * cv.width, py = v * cv.height, a = hash(i, seed, 3) * Math.PI;
      if (i % 3 === 2) {   // a dent: dark in the hollow, the light on its lower lip
        const r = (2.2 + hash(i, seed, 5) * 2) * sx;
        x.fillStyle = 'rgba(20,14,10,0.6)'; x.beginPath(); x.ellipse(px, py, r, r * 0.7, a, 0, Math.PI * 2); x.fill();
        x.strokeStyle = 'rgba(255,240,210,0.35)'; x.lineWidth = Math.max(1, sx * 0.8); x.beginPath(); x.ellipse(px, py + r * 0.15, r, r * 0.7, a, 0.2, Math.PI - 0.2); x.stroke();
      } else {              // a scratch: a pale line with a dark shoulder
        const L = (6 + hash(i, seed, 9) * 10) * sx, dx = Math.cos(a) * L / 2, dy = Math.sin(a) * L / 2;
        x.lineCap = 'round';
        x.strokeStyle = 'rgba(16,12,10,0.5)'; x.lineWidth = Math.max(1, sx * 1.4); x.beginPath(); x.moveTo(px - dx, py - dy + sy); x.lineTo(px + dx, py + dy + sy); x.stroke();
        x.strokeStyle = 'rgba(255,246,226,0.8)'; x.lineWidth = Math.max(1, sx * 0.8); x.beginPath(); x.moveTo(px - dx, py - dy); x.lineTo(px + dx, py + dy); x.stroke();
      }
    }
    x.restore();
    if (markCache.size > 16) markCache.clear();
    markCache.set(key, { src: art.canvas, cv });
    return cv;
  }

  // ---------------------------------------------------------------- the swing follows your drag
  const RISING = [[0, 0, 0, 1], [-8, 22, -0.35, 0.97], [34, -42, 0.62, 1.08], [14, -18, 0.26, 1.03], [0, 0, 0, 1]];
  function wireArcs() {
    if (typeof animWeaponPose !== 'function') return;
    const _p = animWeaponPose;
    animWeaponPose = function (w, progress, direction) {
      try {
        if (w && !w.ranged && w.img !== 'fp_hands' && typeof direction === 'string') {
          const label = direction;
          if (label === 'cut up') {
            const f = clamp(progress, 0, 1), times = [0, 0.24, 0.48, 0.74, 1]; let i = 0; while (i < 3 && f > times[i + 1]) i++;
            const t = clamp((f - times[i]) / (times[i + 1] - times[i]), 0, 1), k = t * t * (3 - 2 * t), a = RISING[i], b = RISING[i + 1], mx = (n) => a[n] + (b[n] - a[n]) * k;
            return { x: mx(0), y: mx(1), rotation: mx(2), scale: mx(3), family: 'rising' };
          }
          // the label decides the family; the weapon only decides when there is no label (a key or a tap)
          const proxy = Object.assign({}, w);
          if (label === 'thrust') { proxy.img = 'fp_spear'; return _p.call(this, proxy, progress, 'thrust'); }
          if (label === 'chop down') { proxy.blunt = true; if (proxy.img === 'fp_glass') proxy.img = 'fp_mace'; return _p.call(this, proxy, progress, 'chop down'); }   // (a fist thrusts unless you drag it down)
          // (the glass arm's picture is mirrored on the screen, on the left: its slashes change hands so a drag still swings the way it goes)
          if (label === 'slash left' || label === 'slash right') { proxy.blunt = false; proxy.img = 'fp_sword'; return _p.call(this, proxy, progress, w.img === 'fp_glass' ? (label === 'slash left' ? 'slash right' : 'slash left') : label); }
        }
      } catch (e) { warnOnce('arc', e); }
      return _p.apply(this, arguments);
    };
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    wireArcs();
    if (typeof update === 'function') {
      const _u = update;
      update = function (dt) {
        const r = _u.apply(this, arguments);
        try { if (G.state === 'play' && dt > 0 && typeof Engine !== 'undefined') { tickWeight(dt); tickJolt(dt); } } catch (e) { warnOnce('tick', e); }
        return r;
      };
    }
    if (typeof damagePlayer === 'function') {
      const _dp = damagePlayer;
      damagePlayer = function () {
        const gs = typeof GUARD !== 'undefined' ? GUARD.state : null, b0 = gs ? gs.blocked : 0, q0 = gs ? gs.parried : 0;
        const r = _dp.apply(this, arguments);
        try { if (gs && G.player && G.player.armor && G.player.armor.shield && (gs.blocked > b0 || gs.parried > q0)) knock(gs.blocked > b0); } catch (e) { warnOnce('block', e); }
        return r;
      };
    }
    if (typeof doRest === 'function') {   // a night's rest: the shield is cleaned and beaten out
      const _r = doRest;
      doRest = function () { const r = _r.apply(this, arguments); try { if (G.player) G.player.knocks88 = {}; } catch (e) { /* */ } return r; };
    }
  }
  wire();
  return { B, W, J, weaponOffset, shieldJolt, marked, knock, massOf, tickWeight, tickJolt, RISING };
})();
if (typeof window !== 'undefined') window.FEEL88 = FEEL88;
