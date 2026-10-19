// ============================================================
//  icons — Phase 5 (illustrated interface): painted item icons and the painted paper doll.
//  Every item, weapon and armour id gets a 48x48 icon painted on a canvas from a table of
//  (kind, parameters) and cached as a data URL. PROCEDURAL STAND-IN art: gradient fills, seeded
//  brush flecks, sheen and an ink outline, per-material palettes; final hand-painted sheets can
//  replace ICONS.url() later without touching the wrappers below.
//  The icons are added to the panels by DOM insertion after the original render functions run
//  (inventory rows, worn slots, weapon rows, shop/sell rows, house chest, forge/brewing), so the
//  original text, ids, buttons and click handlers are untouched.
//  Security: icons are chosen only by looking an id up in ITEMS / WEAPONS / ARMOR; an id that is
//  not an own key of those catalogs (e.g. from an imported save) gets no image. Save text is never
//  placed in markup by this module. The paper doll SVG is built only from catalog names/constants.
//  GFX.itemIcons = false restores the original panels and the original paper doll exactly.
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.itemIcons === undefined) GFX.itemIcons = true;
}

const ICONS = (function () {
  const S = 48, INK = '#17100b';
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---------------------------------------------------------------- colour + brush helpers
  function hex(c) { const n = parseInt(c.slice(1), 16); return [(n >> 16) & 255, (n >> 8) & 255, n & 255]; }
  function mix(a, b, t) { const A = hex(a), B = hex(b); return '#' + A.map((v, i) => Math.round(v + (B[i] - v) * t).toString(16).padStart(2, '0')).join(''); }
  const lite = (c, t) => mix(c, '#ffffff', t), dark = (c, t) => mix(c, '#000000', t);
  function hash(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return h >>> 0; }
  function seeded(seed) { let a = seed || 1; return () => { a = (a + 0x6D2B79F5) | 0; let t = Math.imul(a ^ (a >>> 15), 1 | a); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  let R = seeded(1);

  const MET = { iron: '#aab3b5', steel: '#c9d2d4', bronze: '#c08a43', bell: '#cf9d4c', glass: '#8fe6ee', brass: '#cfa63c', silver: '#d6dcdf', copper: '#b9693b', gold: '#e3bc4c', ivory: '#e6dcc0', rust: '#8d6a55' };
  const WOOD = '#7a5434', LEATHER = '#8a5a38', CLOTH = '#a48a62';

  function P(fn) { const p = new Path2D(); fn(p); return p; }
  function poly(p, a) { p.moveTo(a[0], a[1]); for (let i = 2; i < a.length; i += 2) p.lineTo(a[i], a[i + 1]); p.closePath(); }
  function rect(x, y, w, h, r) { return P(p => { if (r && p.roundRect) p.roundRect(x, y, w, h, r); else p.rect(x, y, w, h); }); }
  function circ(x, y, r) { return P(p => p.arc(x, y, r, 0, Math.PI * 2)); }

  // Painted fill: gradient, seeded brush flecks clipped to the shape, a soft sheen, then an ink outline.
  function paint(c, path, base, o) {
    o = o || {};
    const b = o.box || [4, 4, 44, 44], w = b[2] - b[0], h = b[3] - b[1];
    const g = c.createLinearGradient(b[0], b[1], b[2], b[3]);
    g.addColorStop(0, lite(base, 0.34)); g.addColorStop(0.5, base); g.addColorStop(1, dark(base, 0.48));
    c.fillStyle = g; c.fill(path);
    c.save(); c.clip(path); c.lineCap = 'round';
    const n = o.strokes == null ? 22 : o.strokes;
    for (let i = 0; i < n; i++) {
      const x = b[0] + R() * w, y = b[1] + R() * h, a = (o.ang == null ? -0.9 : o.ang) + (R() - 0.5) * 0.6, l = 2 + R() * 4;
      c.strokeStyle = R() < 0.5 ? 'rgba(255,255,255,.14)' : 'rgba(0,0,0,.17)'; c.lineWidth = 0.7 + R() * 1.2;
      c.beginPath(); c.moveTo(x, y); c.lineTo(x + Math.cos(a) * l, y + Math.sin(a) * l); c.stroke();
    }
    if (!o.flat) {
      const rg = c.createRadialGradient(b[0] + w * 0.3, b[1] + h * 0.25, 0, b[0] + w * 0.3, b[1] + h * 0.25, Math.max(w, h) * 0.7);
      rg.addColorStop(0, 'rgba(255,255,255,.30)'); rg.addColorStop(1, 'rgba(255,255,255,0)');
      c.fillStyle = rg; c.fillRect(0, 0, S, S);
    }
    c.restore();
    c.lineWidth = o.lw || 1.4; c.strokeStyle = o.line || INK; c.lineJoin = 'round'; c.stroke(path);
  }
  function line(c, pts, col, w, cap) {
    c.beginPath(); c.moveTo(pts[0], pts[1]); for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.strokeStyle = col; c.lineWidth = w || 1; c.lineCap = cap || 'round'; c.lineJoin = 'round'; c.stroke();
  }
  function dot(c, x, y, r, col) { c.beginPath(); c.arc(x, y, r, 0, Math.PI * 2); c.fillStyle = col; c.fill(); }
  function glow(c, x, y, r, col) {
    const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, col); g.addColorStop(1, 'rgba(0,0,0,0)');
    c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2);
  }
  function rivets(c, pts, col) { for (let i = 0; i < pts.length; i += 2) { dot(c, pts[i], pts[i + 1], 0.9, col || '#e8dcb0'); } }
  // tilts a vertical (tip-up) drawing 45 degrees so blades read as held weapons
  function tilt(c, o, fn) { c.save(); if (!o.upright) { c.translate(24, 24); c.rotate(Math.PI / 4); c.translate(-24, -24); } fn(); c.restore(); }

  // ---------------------------------------------------------------- weapon kinds
  function wGrip(c, o, y0, y1) {
    paint(c, rect(22.2, y0, 3.6, y1 - y0, 1), o.grip || LEATHER, { box: [22, y0, 26, y1], strokes: 5 });
    for (let y = y0 + 1.5; y < y1 - 0.5; y += 2.2) line(c, [22.4, y, 25.6, y + 0.9], 'rgba(0,0,0,.35)', 0.7);
  }
  const KIND = {};
  KIND.blade = function (c, o) {
    tilt(c, o, () => {
      const len = o.len || 24, w = o.w || 4.4, tip = 31 - len, m = o.m || MET.iron;
      wGrip(c, o, 33, 41);
      paint(c, circ(24, 43, 2.5), o.pom || MET.brass, { box: [21, 40, 27, 46], strokes: 3 });
      const bl = P(p => { if (o.curve) { p.moveTo(24 - w / 2, 31); p.quadraticCurveTo(24 - w / 2 - 1, tip + 8, 24 + 1, tip); p.quadraticCurveTo(24 + w / 2 + 1, tip + 8, 24 + w / 2, 31); p.closePath(); } else poly(p, [24 - w / 2, 31, 24 - w / 2, tip + 4, 24, tip, 24 + w / 2, tip + 4, 24 + w / 2, 31]); });
      paint(c, bl, m, { box: [20, tip, 28, 31], ang: -1.5, strokes: 12 });
      c.save(); c.clip(bl); c.fillStyle = 'rgba(0,0,0,.22)'; c.fillRect(24, tip, w, len); c.restore();
      if (o.fuller !== false) line(c, [24, tip + 7, 24, 28], 'rgba(0,0,0,.35)', 1);
      if (o.glow) { glow(c, 24, tip + 10, 9, o.glow); line(c, [24, tip + 4, 24, 25], o.glow2 || '#ffffff', 0.9); }
      if (o.runes) for (let y = tip + 9; y < 28; y += 4) line(c, [22.8, y, 25.2, y], o.runes, 0.8);
      paint(c, rect(24 - (o.g || 9) / 2, 30.5, o.g || 9, 3, 1), o.gc || MET.brass, { box: [16, 30, 32, 34], strokes: 3, lw: 1.2 });
      if (o.tip) paint(c, P(p => poly(p, [24 - w / 2 + 0.3, tip + 5.5, 24, tip, 24 + w / 2 - 0.3, tip + 5.5])), o.tip, { flat: true, strokes: 0, lw: 0.8 });
    });
  };
  KIND.axe = function (c, o) {
    tilt(c, o, () => {
      paint(c, rect(22.6, 6, 2.8, 38, 1), WOOD, { box: [22, 6, 26, 44], ang: -1.5, strokes: 10 });
      const hd = o.deck
        ? P(p => { p.moveTo(25.4, 8); p.quadraticCurveTo(40, 5, 41, 16); p.quadraticCurveTo(39, 28, 25.4, 24); p.closePath(); })
        : P(p => { p.moveTo(25.4, 7); p.lineTo(34, 5); p.quadraticCurveTo(43, 14, 37, 29); p.lineTo(25.4, 22); p.closePath(); });
      paint(c, hd, o.m || MET.iron, { box: [24, 5, 42, 28], strokes: 14 });
      line(c, o.deck ? [38, 10, 38, 22] : [38, 10, 35, 24], 'rgba(255,255,255,.55)', 1);
      paint(c, P(p => poly(p, [22.6, 12, 14, 14.5, 22.6, 17.5])), o.m || MET.iron, { box: [14, 12, 23, 18], strokes: 3, lw: 1.2 });
      if (o.cord) { line(c, [22, 26, 28, 28], o.cord, 1.6); line(c, [22, 29, 28, 31], o.cord, 1.6); }
      if (o.rim) line(c, [26, 8, 38, 6.5], o.rim, 1.1);
    });
  };
  KIND.mace = function (c, o) {
    tilt(c, o, () => {
      paint(c, rect(22.6, 14, 2.8, 30, 1), WOOD, { box: [22, 14, 26, 44], ang: -1.5, strokes: 8 });
      const n = o.flanges || 8, st = P(p => { for (let i = 0; i < n * 2; i++) { const a = i / (n * 2) * Math.PI * 2, r = i % 2 ? 6.2 : 10; const x = 24 + Math.cos(a) * r, y = 12 + Math.sin(a) * r; i ? p.lineTo(x, y) : p.moveTo(x, y); } p.closePath(); });
      paint(c, st, o.m || MET.bell, { box: [14, 2, 34, 22], strokes: 12 });
      paint(c, circ(24, 12, 3.4), lite(o.m || MET.bell, 0.2), { box: [20, 8, 28, 16], strokes: 2, lw: 1 });
    });
  };
  KIND.tollhammer = function (c, o) {
    tilt(c, o, () => {
      paint(c, rect(22.6, 22, 2.8, 22, 1), WOOD, { box: [22, 22, 26, 44], ang: -1.5, strokes: 6 });
      const bell = P(p => { p.moveTo(17, 22); p.quadraticCurveTo(16, 8, 24, 5); p.quadraticCurveTo(32, 8, 31, 22); p.quadraticCurveTo(24, 25, 17, 22); p.closePath(); });
      paint(c, bell, MET.bell, { box: [16, 5, 32, 24], strokes: 14 });
      line(c, [17.5, 20, 30.5, 20], 'rgba(0,0,0,.35)', 1); line(c, [20, 10, 19, 17], 'rgba(255,255,255,.45)', 1.2);
      dot(c, 24, 25, 1.7, '#5c3d1e');
      paint(c, rect(21, 3, 6, 3, 1), MET.iron, { box: [21, 3, 27, 6], strokes: 2, lw: 1 });
    });
  };
  KIND.maul = function (c, o) {
    tilt(c, o, () => {
      paint(c, rect(22.4, 12, 3.2, 32, 1), WOOD, { box: [22, 12, 26, 44], ang: -1.5, strokes: 8 });
      paint(c, rect(11, 4, 26, 13, 2), MET.iron, { box: [11, 4, 37, 17], strokes: 16 });
      paint(c, rect(11, 4, 5, 13, 1), dark(MET.iron, 0.25), { box: [11, 4, 16, 17], strokes: 2, lw: 1 });
      paint(c, rect(32, 4, 5, 13, 1), dark(MET.iron, 0.25), { box: [32, 4, 37, 17], strokes: 2, lw: 1 });
      paint(c, circ(24, 10.5, 4), MET.brass, { box: [20, 6, 28, 15], strokes: 2 });
      dot(c, 24, 10.5, 2.8, '#f1ead2'); line(c, [24, 10.5, 25.8, 9], '#a3261c', 0.9);
      rivets(c, [13, 6, 13, 15, 35, 6, 35, 15], '#e8dcb0');
      line(c, [20, 17, 28, 17], '#d9d9d9', 1);
    });
  };
  KIND.spear = function (c, o) {
    tilt(c, o, () => {
      paint(c, rect(22.7, 14, 2.6, 31, 1), '#8c6a43', { box: [22, 14, 26, 45], ang: -1.5, strokes: 8 });
      const fork = P(p => { p.moveTo(18.5, 19); p.lineTo(18.5, 3); p.lineTo(21.5, 3); p.lineTo(21.5, 13); p.quadraticCurveTo(24, 16, 26.5, 13); p.lineTo(26.5, 3); p.lineTo(29.5, 3); p.lineTo(29.5, 19); p.quadraticCurveTo(24, 24, 18.5, 19); p.closePath(); });
      paint(c, fork, o.m || MET.bronze, { box: [18, 3, 30, 24], strokes: 12 });
      paint(c, rect(20.5, 19, 7, 3, 1), MET.iron, { box: [20, 19, 28, 22], strokes: 2, lw: 1 });
      line(c, [19.8, 5, 19.8, 15], 'rgba(255,255,255,.5)', 0.9);
      c.save(); c.globalAlpha = 0.5; line(c, [31.5, 6, 33.5, 9], '#fff3c0', 0.8); line(c, [16.5, 6, 14.5, 9], '#fff3c0', 0.8); c.restore();
    });
  };
  KIND.crossbow = function (c) {
    paint(c, P(p => poly(p, [6, 25, 33, 23, 41, 24.5, 41, 27, 33, 27.5, 6, 29])), WOOD, { box: [6, 23, 41, 29], ang: -0.1, strokes: 10 });
    paint(c, P(p => { p.moveTo(33, 8); p.quadraticCurveTo(40, 26, 33, 44); p.lineTo(35.6, 44); p.quadraticCurveTo(44.5, 26, 35.6, 8); p.closePath(); }), MET.iron, { box: [32, 8, 44, 44], ang: 1.4, strokes: 10 });
    line(c, [34, 9, 24, 24, 34, 43], '#efe6c6', 0.9);
    line(c, [10, 26, 40, 26], '#cfd4d2', 1.2);
    paint(c, P(p => poly(p, [40, 26, 35, 23.5, 35, 28.5])), '#d6dcdf', { flat: true, strokes: 0, lw: 0.8 });
    paint(c, rect(5, 22, 6, 9, 2), '#5b3d25', { box: [5, 22, 11, 31], strokes: 3 });
    paint(c, rect(14, 25.5, 2.4, 5, 1), MET.iron, { box: [14, 25, 17, 31], strokes: 1, lw: 1 });
  };
  KIND.pistol = function (c) {
    paint(c, P(p => poly(p, [12, 21, 41, 21, 41, 26, 24, 26, 20, 41, 11, 41, 15, 26, 12, 26])), '#6a4a30', { box: [11, 21, 41, 41], strokes: 10 });
    paint(c, rect(14, 17, 28, 7, 2), MET.silver, { box: [14, 17, 42, 24], strokes: 8, ang: -0.1 });
    glow(c, 40, 20.5, 6, 'rgba(120,235,245,.85)'); dot(c, 41.5, 20.5, 2, '#bff7fb');
    paint(c, P(p => { p.moveTo(10, 17); p.quadraticCurveTo(7, 12, 13, 13); p.lineTo(17, 17); p.closePath(); }), MET.iron, { box: [8, 12, 17, 17], strokes: 2, lw: 1 });
    line(c, [23, 26, 25, 31, 29, 31], '#2a1c12', 1.1);
    line(c, [16, 19.5, 38, 19.5], 'rgba(255,255,255,.45)', 0.8);
  };
  KIND.tknives = function (c) {
    [[-0.5, 10, 6], [0, 24, 4], [0.5, 38, 6]].forEach(([a, x, y]) => {
      c.save(); c.translate(x, 24); c.rotate(a);
      paint(c, P(p => poly(p, [-2, 4, -2, -14, 0, -19, 2, -14, 2, 4])), MET.steel, { box: [-3, -19, 3, 4], strokes: 3, lw: 1.1 });
      paint(c, rect(-1.8, 4, 3.6, 10, 1), LEATHER, { box: [-2, 4, 2, 14], strokes: 2, lw: 1.1 });
      dot(c, 0, 15, 1.7, MET.brass); c.restore();
    });
  };
  KIND.fist = function (c) {
    paint(c, P(p => { p.moveTo(13, 40); p.lineTo(12, 24); p.quadraticCurveTo(12, 12, 24, 11); p.quadraticCurveTo(37, 11, 37, 24); p.lineTo(35, 40); p.closePath(); }), '#c39a78', { box: [12, 11, 37, 40], strokes: 12 });
    [[16, 12], [22, 11], [28, 11], [33, 13]].forEach(([x, y]) => paint(c, circ(x, y + 3, 3.6), '#c9a181', { box: [x - 4, y - 1, x + 4, y + 7], strokes: 2, lw: 1.1 }));
    line(c, [16, 22, 33, 22], 'rgba(0,0,0,.28)', 1); paint(c, rect(12, 38, 25, 6, 1), '#6b4a30', { box: [12, 38, 37, 44], strokes: 4 });
  };
  KIND.glassarm = function (c) {
    const arm = P(p => { p.moveTo(10, 38); p.lineTo(17, 14); p.quadraticCurveTo(20, 6, 28, 8); p.lineTo(38, 20); p.lineTo(31, 42); p.closePath(); });
    paint(c, arm, '#8fe0e8', { box: [10, 6, 38, 42], strokes: 6, line: '#0e3a44' });
    c.save(); c.clip(arm); line(c, [20, 12, 24, 22, 20, 30, 26, 40], '#e9ffff', 0.9); line(c, [28, 12, 26, 20, 33, 26], '#3aa7b5', 0.9); line(c, [14, 32, 20, 30], '#e9ffff', 0.8); c.restore();
    paint(c, rect(8, 34, 22, 8, 1), '#7a5a40', { box: [8, 34, 30, 42], strokes: 4 });
    glow(c, 26, 22, 12, 'rgba(160,250,255,.35)');
  };

  // ---------------------------------------------------------------- armour kinds
  KIND.helm = function (c, o) {
    const m = o.m || LEATHER, v = o.v;
    if (v === 'hood') {
      paint(c, P(p => { p.moveTo(10, 42); p.quadraticCurveTo(8, 8, 24, 5); p.quadraticCurveTo(40, 8, 38, 42); p.lineTo(31, 38); p.quadraticCurveTo(24, 32, 17, 38); p.closePath(); }), m, { box: [8, 5, 40, 42], strokes: 16 });
      paint(c, P(p => { p.ellipse(24, 24, 7, 9, 0, 0, Math.PI * 2); }), '#14100d', { flat: true, strokes: 0, lw: 1 });
      line(c, [14, 36, 18, 41], 'rgba(255,255,255,.18)', 1);
    } else if (v === 'cap') {
      paint(c, P(p => { p.moveTo(9, 34); p.quadraticCurveTo(8, 11, 24, 10); p.quadraticCurveTo(40, 11, 39, 34); p.quadraticCurveTo(24, 38, 9, 34); p.closePath(); }), m, { box: [8, 10, 40, 38], strokes: 14 });
      line(c, [10, 32, 38, 32], dark(m, 0.5), 1.2); line(c, [24, 11, 24, 32], dark(m, 0.35), 1); rivets(c, [14, 28, 34, 28], '#d8c690');
    } else if (v === 'kettle') {
      paint(c, P(p => { p.moveTo(3, 32); p.quadraticCurveTo(12, 26, 14, 24); p.quadraticCurveTo(15, 8, 24, 8); p.quadraticCurveTo(33, 8, 34, 24); p.quadraticCurveTo(36, 26, 45, 32); p.quadraticCurveTo(24, 38, 3, 32); p.closePath(); }), m, { box: [3, 8, 45, 38], strokes: 16 });
      line(c, [10, 31, 38, 31], 'rgba(0,0,0,.3)', 1.2); line(c, [19, 12, 18, 24], 'rgba(255,255,255,.5)', 1.3); rivets(c, [24, 12], '#e8dcb0');
    } else {
      paint(c, P(p => { p.moveTo(7, 40); p.quadraticCurveTo(5, 8, 24, 5); p.quadraticCurveTo(43, 8, 41, 40); p.quadraticCurveTo(24, 44, 7, 40); p.closePath(); }), m, { box: [5, 5, 43, 44], strokes: 20 });
      paint(c, P(p => poly(p, [14, 26, 34, 26, 34, 31, 14, 31])), '#17110c', { flat: true, strokes: 0, lw: 1 });
      line(c, [24, 8, 24, 26], 'rgba(0,0,0,.28)', 1.2); line(c, [10, 36, 38, 36], 'rgba(0,0,0,.3)', 1.2); line(c, [14, 12, 12, 30], 'rgba(255,255,255,.45)', 1.5);
      paint(c, circ(24, 5.5, 2.2), o.fin || MET.brass, { box: [21, 3, 27, 8], strokes: 2, lw: 1 });
    }
  };
  KIND.body = function (c, o) {
    const m = o.m || CLOTH, v = o.v;
    const torso = P(p => { p.moveTo(15, 8); p.lineTo(8, 14); p.lineTo(3, 29); p.lineTo(9, 32); p.lineTo(13, 22); p.lineTo(13, 43); p.lineTo(35, 43); p.lineTo(35, 22); p.lineTo(39, 32); p.lineTo(45, 29); p.lineTo(40, 14); p.lineTo(33, 8); p.quadraticCurveTo(24, 14, 15, 8); p.closePath(); });
    if (v === 'robe') {
      paint(c, P(p => { p.moveTo(15, 7); p.lineTo(7, 14); p.lineTo(3, 32); p.lineTo(9, 34); p.lineTo(12, 22); p.lineTo(8, 44); p.lineTo(40, 44); p.lineTo(36, 22); p.lineTo(39, 34); p.lineTo(45, 32); p.lineTo(41, 14); p.lineTo(33, 7); p.quadraticCurveTo(24, 13, 15, 7); p.closePath(); }), m, { box: [3, 7, 45, 44], strokes: 22, ang: 1.4 });
      paint(c, P(p => poly(p, [19, 8, 24, 14, 29, 8, 31, 8, 31, 44, 17, 44, 17, 8])), '#cfd2d0', { box: [17, 8, 31, 44], strokes: 6, lw: 1 }); // silver registry stole
      line(c, [24, 20, 24, 36], '#4d4a3a', 1); line(c, [20, 28, 28, 28], '#4d4a3a', 1);
    } else if (v === 'hushcoat') {
      paint(c, P(p => { p.moveTo(15, 7); p.lineTo(7, 14); p.lineTo(3, 33); p.lineTo(9, 35); p.lineTo(12, 22); p.lineTo(9, 45); p.lineTo(24, 42); p.lineTo(39, 45); p.lineTo(36, 22); p.lineTo(39, 35); p.lineTo(45, 33); p.lineTo(41, 14); p.lineTo(33, 7); p.quadraticCurveTo(24, 14, 15, 7); p.closePath(); }), m, { box: [3, 7, 45, 45], strokes: 24, ang: 1.4 });
      line(c, [24, 14, 24, 42], 'rgba(0,0,0,.4)', 1.2); [[21, 24], [21, 31], [21, 38], [27, 24], [27, 31], [27, 38]].forEach(([x, y]) => dot(c, x, y, 0.9, '#9fb6a6'));
    } else {
      paint(c, torso, m, { box: [3, 8, 45, 43], strokes: v === 'chain' ? 8 : 20 });
      c.save(); c.clip(torso);
      if (v === 'gambeson') { for (let x = 15; x < 36; x += 5) line(c, [x, 11, x, 43], 'rgba(0,0,0,.28)', 1); for (let y = 16; y < 43; y += 6) line(c, [13, y, 35, y], 'rgba(0,0,0,.2)', 1); }
      else if (v === 'jerkin') { line(c, [24, 12, 24, 43], 'rgba(0,0,0,.4)', 1.2); for (let y = 15; y < 40; y += 4) { line(c, [21, y, 27, y + 2], '#e0cfa0', 0.9); line(c, [27, y, 21, y + 2], '#e0cfa0', 0.9); } line(c, [13, 36, 35, 36], '#3d2616', 2); }
      else if (v === 'brig') { for (let y = 14; y < 42; y += 6) for (let x = 15; x < 35; x += 6) { c.fillStyle = 'rgba(190,198,196,.85)'; c.fillRect(x, y, 5, 5); c.strokeStyle = 'rgba(0,0,0,.5)'; c.lineWidth = .7; c.strokeRect(x, y, 5, 5); dot(c, x + 2.5, y + 2.5, .7, '#f0e4b0'); } }
      else if (v === 'chain') { for (let y = 10; y < 44; y += 3) for (let x = (y / 3) % 2 ? 4 : 6; x < 46; x += 4) { c.beginPath(); c.arc(x, y, 1.6, 0, Math.PI); c.strokeStyle = 'rgba(255,255,255,.55)'; c.lineWidth = .8; c.stroke(); } }
      else if (v === 'plate') { line(c, [24, 12, 24, 43], 'rgba(0,0,0,.35)', 1.4); line(c, [13, 24, 35, 24], 'rgba(0,0,0,.3)', 1.2); line(c, [13, 33, 35, 33], 'rgba(0,0,0,.3)', 1.2); line(c, [17, 12, 16, 40], 'rgba(255,255,255,.5)', 1.6); glow(c, 24, 22, 8, 'rgba(255,230,160,.35)'); }
      c.restore();
      if (v === 'plate') { rivets(c, [16, 14, 32, 14, 16, 41, 32, 41], '#fff0b8'); paint(c, circ(24, 24, 3), MET.brass, { box: [21, 21, 27, 27], strokes: 1, lw: 1 }); }
    }
  };
  KIND.gloves = function (c, o) {
    const m = o.m || LEATHER;
    const hand = (dx, flip) => {
      c.save(); c.translate(24, 0); c.scale(flip, 1); c.translate(dx - 24, 0);
      paint(c, P(p => { p.moveTo(6, 42); p.lineTo(5, 24); p.quadraticCurveTo(5, 18, 9, 18); p.lineTo(9, 9); p.quadraticCurveTo(12, 6, 14, 9); p.lineTo(14, 17); p.lineTo(15, 6); p.quadraticCurveTo(18, 3, 19, 7); p.lineTo(19, 18); p.lineTo(21, 9); p.quadraticCurveTo(24, 7, 24, 11); p.lineTo(23, 24); p.lineTo(21, 42); p.closePath(); }), m, { box: [5, 3, 24, 42], strokes: 12 });
      paint(c, rect(5, 36, 17, 7, 1), o.cuff || '#5b3d25', { box: [5, 36, 22, 43], strokes: 3, lw: 1.2 });
      if (o.mail) { for (let y = 20; y < 34; y += 3) for (let x = 7; x < 22; x += 3.4) { c.beginPath(); c.arc(x, y, 1.4, 0, Math.PI); c.strokeStyle = 'rgba(235,240,240,.85)'; c.lineWidth = .8; c.stroke(); } }
      c.restore();
    };
    hand(2, 1);
    c.save(); c.translate(24, 0); hand(0, 1); c.restore();
  };
  KIND.boots = function (c, o) {
    const m = o.m || '#6a4a30', v = o.v;
    paint(c, P(p => { p.moveTo(14, 5); p.lineTo(28, 5); p.lineTo(29, 28); p.quadraticCurveTo(44, 29, 45, 38); p.lineTo(45, 42); p.lineTo(8, 42); p.lineTo(8, 36); p.lineTo(14, 32); p.closePath(); }), m, { box: [8, 5, 45, 42], strokes: 16 });
    paint(c, rect(8, 39, 37, 4, 1), '#2a1c12', { box: [8, 39, 45, 43], strokes: 2, lw: 1.1 });
    if (v === 'soft') { line(c, [14, 9, 28, 9], dark(m, .3), 1.3); line(c, [18, 18, 26, 20], 'rgba(255,255,255,.2)', 1); }
    if (v === 'hob') { for (let x = 11; x < 44; x += 5) dot(c, x, 41, 1, '#d6d6c8'); line(c, [14, 12, 28, 14], '#e0cfa0', 1); line(c, [14, 17, 28, 19], '#e0cfa0', 1); line(c, [14, 22, 28, 24], '#e0cfa0', 1); }
    if (v === 'greaves') { paint(c, P(p => poly(p, [13, 4, 29, 4, 30, 30, 12, 32])), MET.iron, { box: [12, 4, 30, 32], strokes: 10 }); line(c, [15, 8, 15, 26], 'rgba(255,255,255,.5)', 1.3); line(c, [12, 18, 30, 18], 'rgba(0,0,0,.3)', 1); rivets(c, [16, 7, 26, 7, 16, 28, 27, 28], '#e8dcb0'); }
  };
  KIND.shield = function (c, o) {
    const m = o.m || '#6d5140';
    if (o.v === 'kite') {
      const sh = P(p => { p.moveTo(10, 5); p.lineTo(38, 5); p.quadraticCurveTo(40, 26, 24, 45); p.quadraticCurveTo(8, 26, 10, 5); p.closePath(); });
      paint(c, sh, m, { box: [8, 5, 40, 45], strokes: 18, ang: 1.4 });
      c.save(); c.clip(sh); c.strokeStyle = '#c9b57a'; c.lineWidth = 3; c.stroke(sh); c.restore();
      // the Synod's dead queen: a pale crowned face, painted small
      paint(c, P(p => p.ellipse(24, 19, 4, 5.2, 0, 0, Math.PI * 2)), '#e6d8c0', { box: [20, 14, 28, 24], strokes: 2, lw: 1 });
      paint(c, P(p => poly(p, [19, 13, 21, 9, 24, 12, 27, 9, 29, 13])), MET.gold, { flat: true, strokes: 0, lw: 1 });
      line(c, [24, 25, 24, 38], '#c9b57a', 1.4); line(c, [17, 31, 31, 31], '#c9b57a', 1.4);
    } else {
      paint(c, circ(24, 24, 18), m, { box: [6, 6, 42, 42], strokes: 18 });
      c.save(); c.beginPath(); c.arc(24, 24, 17, 0, Math.PI * 2); c.strokeStyle = '#b8a16b'; c.lineWidth = 2.4; c.stroke(); c.restore();
      for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; dot(c, 24 + Math.cos(a) * 14, 24 + Math.sin(a) * 14, 0.9, '#efe2b0'); }
      paint(c, circ(24, 24, 6), MET.iron, { box: [18, 18, 30, 30], strokes: 4 }); paint(c, circ(24, 24, 2.2), MET.brass, { flat: true, strokes: 0, lw: 1 });
    }
  };

  // ---------------------------------------------------------------- consumable kinds
  KIND.potion = function (c, o) {
    const liq = o.liq || '#c05a3a';
    const body = P(p => { p.moveTo(19, 16); p.lineTo(19, 11); p.lineTo(29, 11); p.lineTo(29, 16); p.quadraticCurveTo(40, 20, 38, 33); p.quadraticCurveTo(36, 44, 24, 44); p.quadraticCurveTo(12, 44, 10, 33); p.quadraticCurveTo(8, 20, 19, 16); p.closePath(); });
    paint(c, body, '#b9d4d6', { box: [8, 11, 40, 44], strokes: 0, flat: true, lw: 1.5 });
    c.save(); c.clip(body); const g = c.createLinearGradient(0, 22, 48, 44); g.addColorStop(0, lite(liq, .3)); g.addColorStop(1, dark(liq, .45)); c.fillStyle = g; c.fillRect(0, 24, 48, 24);
    for (let i = 0; i < 8; i++) { c.fillStyle = 'rgba(255,255,255,.18)'; c.beginPath(); c.arc(12 + R() * 24, 28 + R() * 14, .8 + R() * 1.2, 0, 7); c.fill(); }
    c.fillStyle = 'rgba(255,255,255,.35)'; c.fillRect(13, 20, 3, 18); c.restore();
    c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke(body);
    paint(c, rect(20, 6, 8, 6, 1.5), o.cork || '#9a7448', { box: [20, 6, 28, 12], strokes: 3, lw: 1.2 });
    if (o.label) paint(c, rect(17, 29, 14, 7, 1), o.label, { flat: true, strokes: 0, lw: 0.8 });
  };
  KIND.jar = function (c, o) {
    const jar = P(p => { p.moveTo(14, 12); p.lineTo(34, 12); p.quadraticCurveTo(40, 14, 40, 22); p.lineTo(40, 38); p.quadraticCurveTo(40, 44, 34, 44); p.lineTo(14, 44); p.quadraticCurveTo(8, 44, 8, 38); p.lineTo(8, 22); p.quadraticCurveTo(8, 14, 14, 12); p.closePath(); });
    paint(c, jar, o.liq || '#d79a2a', { box: [8, 12, 40, 44], strokes: 12 });
    c.save(); c.clip(jar); c.fillStyle = 'rgba(255,255,255,.3)'; c.fillRect(12, 16, 3.5, 24); c.restore();
    paint(c, rect(11, 7, 26, 6, 2), '#b9a78a', { box: [11, 7, 37, 13], strokes: 3, lw: 1.2 });
    paint(c, rect(14, 26, 20, 10, 1), '#e8dcb7', { flat: true, strokes: 0, lw: 0.9 }); line(c, [17, 31, 31, 31], '#7a5a2a', 1.4);
  };
  KIND.vox = function (c) {
    KIND.potion(c, { liq: '#8a5fd0', cork: '#4a3a2a' });
    for (let i = 0; i < 3; i++) { c.beginPath(); c.arc(24, 27, 5 + i * 4, -0.9, 0.9); c.strokeStyle = 'rgba(210,190,255,' + (0.8 - i * 0.22) + ')'; c.lineWidth = 1; c.stroke(); }
    line(c, [20, 4, 28, 10], '#d9c9a0', 1.2);
  };
  KIND.bottle = function (c) {
    const b = P(p => { p.moveTo(21, 6); p.lineTo(27, 6); p.lineTo(27, 18); p.quadraticCurveTo(37, 22, 36, 34); p.quadraticCurveTo(35, 44, 24, 44); p.quadraticCurveTo(13, 44, 12, 34); p.quadraticCurveTo(11, 22, 21, 18); p.closePath(); });
    paint(c, b, '#a9d1d4', { box: [11, 6, 37, 44], strokes: 4, flat: true, lw: 1.4 });
    c.save(); c.clip(b); c.fillStyle = 'rgba(20,60,66,.28)'; c.fillRect(24, 6, 14, 40); c.fillStyle = 'rgba(255,255,255,.5)'; c.fillRect(15, 24, 2.5, 14); c.restore();
    line(c, [21.5, 8, 26.5, 8], 'rgba(255,255,255,.7)', 1.4);
  };
  KIND.bandage = function (c) {
    paint(c, P(p => p.ellipse(24, 26, 16, 14, 0, 0, Math.PI * 2)), '#e8e0cc', { box: [8, 12, 40, 40], strokes: 12 });
    paint(c, P(p => p.ellipse(24, 26, 7, 6, 0, 0, Math.PI * 2)), '#3a2c20', { flat: true, strokes: 0, lw: 1 });
    for (let i = 0; i < 4; i++) { c.beginPath(); c.ellipse(24, 26, 16 - i * 2.2, 14 - i * 2, 0, 0.2, 2.6); c.strokeStyle = 'rgba(120,100,70,.35)'; c.lineWidth = .8; c.stroke(); }
    paint(c, P(p => poly(p, [30, 30, 44, 36, 42, 41, 28, 36])), '#efe8d4', { box: [28, 30, 44, 41], strokes: 3, lw: 1.2 });
    line(c, [14, 24, 20, 18], '#9a3a30', 1.2);
  };
  KIND.whistle = function (c) {
    paint(c, P(p => { p.moveTo(5, 24); p.lineTo(32, 18); p.lineTo(40, 21); p.lineTo(40, 31); p.lineTo(32, 33); p.lineTo(5, 29); p.closePath(); }), '#8fa86a', { box: [5, 18, 40, 33], strokes: 12, ang: -0.1 });
    for (let x = 12; x < 34; x += 5) line(c, [x, 20, x + 1, 31], 'rgba(0,0,0,.28)', 1);
    paint(c, P(p => p.ellipse(34, 26, 3, 4, 0, 0, 7)), '#1a140e', { flat: true, strokes: 0, lw: 0.9 });
    line(c, [6, 26.5, 2, 33, 7, 39], '#6a5030', 1.4);
  };
  KIND.pellets = function (c) {
    [[16, 30], [28, 30], [22, 20], [34, 20], [10, 21], [24, 37], [36, 36]].forEach(([x, y], i) => {
      glow(c, x, y, 6, 'rgba(120,235,245,.35)'); paint(c, circ(x, y, 3.6), i % 2 ? '#9cecf2' : '#7bd8e2', { box: [x - 4, y - 4, x + 4, y + 4], strokes: 0, lw: 1, line: '#0f4a55' });
      dot(c, x - 1.1, y - 1.2, 0.9, '#ffffff');
    });
  };
  KIND.bolts = function (c) {
    [-9, 0, 9].forEach((dx, i) => {
      c.save(); c.translate(24 + dx, 25); c.rotate(i * 0.16 - 0.16);
      line(c, [0, -18, 0, 17], '#7a5434', 2.2); paint(c, P(p => poly(p, [-3, -18, 0, -24, 3, -18])), MET.steel, { flat: true, strokes: 0, lw: 1 });
      paint(c, P(p => poly(p, [-3, 17, 0, 11, 3, 17, 0, 20])), '#d9d3c0', { flat: true, strokes: 0, lw: 0.9 }); c.restore();
    });
    line(c, [10, 36, 38, 36], '#5b3d25', 3);
  };
  KIND.coins = function (c) {
    const coin = (x, y, r, k) => { paint(c, P(p => p.ellipse(x, y, r, r * 0.55, 0, 0, 7)), MET.gold, { box: [x - r, y - r, x + r, y + r], strokes: 3, lw: 1.1 }); c.beginPath(); c.ellipse(x, y, r * 0.6, r * 0.32, 0, 0, 7); c.strokeStyle = 'rgba(120,80,10,.5)'; c.lineWidth = .8; c.stroke(); if (k) dot(c, x, y, 0.8, 'rgba(120,80,10,.6)'); };
    for (let i = 0; i < 4; i++) coin(24, 38 - i * 4, 11, 0);
    coin(24, 22, 11, 1); coin(36, 34, 8, 1);
  };
  KIND.pebble = function (c) {
    paint(c, P(p => { p.moveTo(8, 30); p.quadraticCurveTo(10, 16, 24, 15); p.quadraticCurveTo(40, 15, 41, 29); p.quadraticCurveTo(38, 40, 24, 40); p.quadraticCurveTo(10, 40, 8, 30); p.closePath(); }), '#8b8f8c', { box: [8, 15, 41, 40], strokes: 22 });
    line(c, [16, 22, 22, 20], 'rgba(255,255,255,.4)', 1.4); line(c, [26, 33, 34, 31], 'rgba(0,0,0,.25)', 1);
  };
  KIND.whetstone = function (c) {
    paint(c, P(p => poly(p, [6, 28, 36, 16, 43, 21, 13, 36])), '#9aa09a', { box: [6, 16, 43, 36], strokes: 26, ang: -0.4 });
    paint(c, P(p => poly(p, [13, 36, 43, 21, 43, 26, 13, 41])), '#6c726e', { box: [13, 21, 43, 41], strokes: 8, lw: 1.2 });
    for (let i = 0; i < 6; i++) line(c, [10 + i * 5, 29 - i * 2, 12 + i * 5, 31 - i * 2], 'rgba(255,255,255,.3)', .8);
    c.save(); c.globalAlpha = .8; line(c, [28, 14, 33, 8], '#ffd36a', 1.2); line(c, [32, 17, 38, 14], '#ffd36a', 1); c.restore();
  };
  KIND.shard = function (c, o) {
    const col = o.col || '#88d890';
    glow(c, 24, 25, 22, 'rgba(160,255,160,.28)');
    paint(c, P(p => poly(p, [24, 3, 33, 17, 31, 40, 24, 45, 15, 38, 14, 17])), col, { box: [14, 3, 33, 45], strokes: 8, ang: 1.2 });
    line(c, [24, 3, 24, 45], 'rgba(255,255,255,.4)', 1); line(c, [14, 17, 24, 22, 33, 17], 'rgba(255,255,255,.45)', 1); line(c, [24, 22, 31, 40], 'rgba(0,0,0,.25)', 1);
    glow(c, 20, 14, 6, 'rgba(255,240,170,.6)');
  };
  KIND.eel = function (c) {
    paint(c, P(p => { p.moveTo(5, 32); p.quadraticCurveTo(10, 14, 22, 24); p.quadraticCurveTo(32, 32, 38, 14); p.lineTo(44, 12); p.quadraticCurveTo(40, 34, 30, 38); p.quadraticCurveTo(16, 40, 5, 32); p.closePath(); }), '#a9743c', { box: [5, 12, 44, 40], strokes: 18, ang: -0.3 });
    line(c, [8, 31, 20, 29, 32, 33, 40, 20], 'rgba(255,230,160,.4)', 1.4); line(c, [8, 34, 20, 34, 32, 36], 'rgba(0,0,0,.25)', 1);
    dot(c, 41.5, 13.5, 1, '#1a1008');
    line(c, [12, 18, 12, 6, 36, 6, 36, 12], '#9a8a68', 1);
  };
  KIND.herb = function (c, o) {
    const v = o.v;
    if (v === 'bark') {
      paint(c, P(p => { p.moveTo(8, 12); p.quadraticCurveTo(24, 4, 40, 14); p.lineTo(42, 34); p.quadraticCurveTo(26, 44, 10, 36); p.closePath(); }), '#a7a99a', { box: [8, 4, 42, 44], strokes: 24, ang: -0.3 });
      line(c, [12, 16, 36, 20], 'rgba(0,0,0,.28)', 1); line(c, [12, 26, 38, 30], 'rgba(0,0,0,.25)', 1); line(c, [14, 36, 34, 38], 'rgba(255,255,255,.3)', 1);
      paint(c, P(p => poly(p, [34, 8, 44, 4, 40, 14])), '#7aa65c', { box: [34, 4, 44, 14], strokes: 1, lw: 1 });
    } else if (v === 'reed') {
      [[-9, 0.24], [-3, 0.09], [3, -0.06], [9, -0.2]].forEach(([dx, a]) => { c.save(); c.translate(24 + dx, 44); c.rotate(a); paint(c, rect(-1.6, -40, 3.2, 40, 1.5), '#c8d98a', { box: [-2, -40, 2, 0], ang: -1.5, strokes: 6, lw: 1.1 }); line(c, [-1.6, -26, 1.6, -26], 'rgba(0,0,0,.3)', 0.8); line(c, [-1.6, -14, 1.6, -14], 'rgba(0,0,0,.3)', 0.8); c.restore(); });
      paint(c, P(p => poly(p, [14, 33, 34, 33, 36, 38, 12, 38])), '#7a5a35', { box: [12, 33, 36, 38], strokes: 3, lw: 1.1 });
    } else {
      glow(c, 24, 26, 20, 'rgba(210,150,255,.28)');
      for (let i = 0; i < 9; i++) paint(c, circ(10 + R() * 28, 18 + R() * 22, 4 + R() * 4), i % 2 ? '#a78bd4' : '#8b6fc2', { box: [4, 12, 44, 44], strokes: 3, lw: 1 });
      for (let i = 0; i < 5; i++) dot(c, 12 + R() * 24, 20 + R() * 20, 1, '#f3e9ff');
    }
  };
  KIND.chest = function (c) {
    paint(c, rect(5, 20, 38, 22, 2), '#74492a', { box: [5, 20, 43, 42], strokes: 18, ang: 0 });
    paint(c, P(p => { p.moveTo(5, 21); p.quadraticCurveTo(24, 3, 43, 21); p.closePath(); }), '#85563a', { box: [5, 8, 43, 21], strokes: 10 });
    line(c, [5, 21, 43, 21], INK, 1.4); line(c, [14, 15, 14, 42], MET.iron, 2.6); line(c, [34, 15, 34, 42], MET.iron, 2.6);
    paint(c, rect(21, 18, 6, 8, 1.5), MET.brass, { box: [21, 18, 27, 26], strokes: 2, lw: 1.1 }); dot(c, 24, 22, 1, INK);
  };

  // ---------------------------------------------------------------- valuables
  KIND.scrap = function (c) {
    paint(c, P(p => poly(p, [6, 34, 14, 12, 26, 8, 40, 20, 42, 36, 28, 42])), MET.bell, { box: [6, 8, 42, 42], strokes: 22 });
    line(c, [14, 16, 24, 28, 38, 24], 'rgba(0,0,0,.3)', 1); line(c, [18, 14, 12, 28], 'rgba(255,255,255,.5)', 1.4);
    c.save(); c.globalAlpha = .5; c.beginPath(); c.arc(32, 36, 5, 0, 7); c.strokeStyle = '#4a7a5a'; c.lineWidth = 1.5; c.stroke(); c.restore();
  };
  KIND.mesh = function (c) {
    const sq = P(p => poly(p, [8, 10, 40, 6, 42, 38, 6, 42]));
    paint(c, sq, '#aeb8bd', { box: [6, 6, 42, 42], strokes: 4, flat: false });
    c.save(); c.clip(sq); for (let i = -48; i < 48; i += 4) { line(c, [i, 0, i + 48, 48], 'rgba(255,255,255,.65)', 0.8); line(c, [i + 48, 0, i, 48], 'rgba(40,50,56,.55)', 0.8); } c.restore();
    c.lineWidth = 1.5; c.strokeStyle = INK; c.stroke(sq);
  };
  KIND.cog = function (c) {
    const n = 10, g = P(p => { for (let i = 0; i < n * 4; i++) { const a = i / (n * 4) * Math.PI * 2 - 0.1; const r = (i % 4 === 1 || i % 4 === 2) ? 19 : 14.5; const x = 24 + Math.cos(a) * r, y = 24 + Math.sin(a) * r; i ? p.lineTo(x, y) : p.moveTo(x, y); } p.closePath(); });
    paint(c, g, MET.brass, { box: [5, 5, 43, 43], strokes: 18 });
    paint(c, circ(24, 24, 9), dark(MET.brass, .2), { box: [15, 15, 33, 33], strokes: 4, lw: 1.1 });
    paint(c, circ(24, 24, 3.4), '#2a2018', { flat: true, strokes: 0, lw: 1 });
    glow(c, 24, 24, 20, 'rgba(255,170,70,.22)');
  };
  KIND.signet = function (c) {
    c.save(); c.beginPath(); c.arc(24, 28, 12, 0, Math.PI * 2); c.strokeStyle = INK; c.lineWidth = 7; c.stroke(); c.strokeStyle = MET.gold; c.lineWidth = 4.6; c.stroke(); c.strokeStyle = 'rgba(255,255,255,.45)'; c.lineWidth = 1; c.beginPath(); c.arc(24, 28, 12, 3.6, 4.6); c.stroke(); c.restore();
    paint(c, P(p => poly(p, [15, 8, 33, 8, 36, 17, 24, 22, 12, 17])), MET.gold, { box: [12, 8, 36, 22], strokes: 4 });
    paint(c, P(p => poly(p, [19, 10, 29, 10, 31, 16, 24, 19, 17, 16])), '#2c4a7a', { flat: true, strokes: 0, lw: .9 }); line(c, [24, 11, 24, 17], '#e6d19a', 1);
  };
  KIND.fork = function (c) {
    paint(c, P(p => { p.moveTo(16, 4); p.lineTo(20, 4); p.lineTo(20, 24); p.quadraticCurveTo(24, 28, 28, 24); p.lineTo(28, 4); p.lineTo(32, 4); p.lineTo(32, 26); p.quadraticCurveTo(24, 34, 16, 26); p.closePath(); }), MET.silver, { box: [16, 4, 32, 34], strokes: 10, ang: 1.5 });
    paint(c, rect(22.4, 29, 3.2, 15, 1.4), MET.silver, { box: [22, 29, 26, 44], strokes: 3, lw: 1.1 });
    line(c, [18, 6, 18, 22], 'rgba(255,255,255,.7)', 1);
    c.save(); c.globalAlpha = .6; [[10, 10, 6, 7], [10, 16, 5, 16], [38, 10, 42, 7], [38, 16, 43, 16]].forEach(([a, b, d, e]) => line(c, [a, b, d, e], '#cfe9ff', 0.9)); c.restore();
  };

  // ---------------------------------------------------------------- quest-item kinds
  KIND.coil = function (c) {
    glow(c, 24, 24, 21, 'rgba(160,255,150,.25)');
    paint(c, P(p => poly(p, [24, 6, 31, 18, 29, 38, 24, 43, 19, 38, 17, 18])), '#8fd86f', { box: [17, 6, 31, 43], strokes: 6, ang: 1.2 });
    line(c, [24, 8, 24, 41], 'rgba(255,255,255,.4)', 1);
    for (let i = 0; i < 7; i++) { const y = 12 + i * 4.6; c.beginPath(); c.ellipse(24, y, 14, 3.2, 0, 0, Math.PI); c.strokeStyle = INK; c.lineWidth = 3.4; c.stroke(); c.strokeStyle = i % 2 ? MET.copper : MET.brass; c.lineWidth = 2; c.stroke(); }
    paint(c, rect(9, 41, 30, 4, 1), '#6a4a30', { box: [9, 41, 39, 45], strokes: 2, lw: 1.1 });
  };
  KIND.scroll = function (c, o) {
    paint(c, rect(8, 8, 32, 32, 1), o.paper || '#e5d7ae', { box: [8, 8, 40, 40], strokes: 22 });
    for (let i = 0; i < 6; i++) { line(c, [12, 14 + i * 4.6, 36, 14 + i * 4.6], 'rgba(60,80,110,.5)', .8); line(c, [12 + i * 4.6, 12, 12 + i * 4.6, 38], 'rgba(60,80,110,.38)', .8); }
    line(c, [12, 34, 20, 26, 26, 30, 36, 16], o.ink || '#8a2d22', 1.4);
    paint(c, P(p => { p.moveTo(5, 6); p.quadraticCurveTo(24, 1, 43, 6); p.lineTo(43, 9); p.quadraticCurveTo(24, 5, 5, 9); p.closePath(); }), '#c9b987', { box: [5, 2, 43, 9], strokes: 2, lw: 1.1 });
    paint(c, P(p => { p.moveTo(5, 40); p.quadraticCurveTo(24, 36, 43, 40); p.lineTo(43, 43); p.quadraticCurveTo(24, 40, 5, 43); p.closePath(); }), '#c9b987', { box: [5, 36, 43, 43], strokes: 2, lw: 1.1 });
    paint(c, circ(36, 33, 4), '#a8281e', { box: [32, 29, 40, 37], strokes: 2, lw: 1 });
  };
  KIND.card = function (c) {
    paint(c, rect(5, 12, 38, 26, 2), '#d8caa0', { box: [5, 12, 43, 38], strokes: 14 });
    paint(c, rect(8, 15, 32, 20, 1), '#c3b078', { flat: true, strokes: 4, lw: 0.9 });
    line(c, [11, 20, 27, 20], '#4a3a20', 1.2); line(c, [11, 24, 23, 24], '#4a3a20', 1); line(c, [11, 28, 25, 28], '#4a3a20', 1);
    paint(c, circ(34, 29, 5.5), '#9c2a20', { box: [28, 23, 40, 35], strokes: 4, lw: 1.1 }); dot(c, 34, 29, 2, '#e8c46a');
    paint(c, rect(36, 14, 4, 5, 1), MET.brass, { flat: true, strokes: 0, lw: 0.8 });
  };
  KIND.kboots = function (c) {
    c.save(); c.translate(-3, 0); c.scale(.8, .8); KIND.boots(c, { m: '#7a5a3c', v: 'soft' }); c.restore();
    c.save(); c.translate(15, 9); c.scale(.8, .8); KIND.boots(c, { m: '#6a4a30', v: 'soft' }); c.restore();
    line(c, [18, 22, 26, 20], '#d9c9a0', 1);
  };
  KIND.core = function (c) {
    glow(c, 24, 24, 22, 'rgba(190,140,255,.35)');
    const g = P(p => poly(p, [24, 4, 38, 14, 38, 32, 24, 44, 10, 32, 10, 14]));
    paint(c, g, '#b693e8', { box: [10, 4, 38, 44], strokes: 6, ang: 1.1 });
    line(c, [24, 4, 24, 44], 'rgba(255,255,255,.3)', 1); line(c, [10, 14, 24, 22, 38, 14], 'rgba(255,255,255,.4)', 1); line(c, [10, 32, 24, 22, 38, 32], 'rgba(255,255,255,.28)', 1);
    c.save(); c.clip(g); line(c, [26, 8, 22, 18, 28, 26, 22, 36, 25, 42], '#2a1448', 1.5); line(c, [22, 18, 14, 22], '#2a1448', 1); c.restore();
    glow(c, 19, 12, 6, 'rgba(255,255,255,.55)');
  };
  KIND.flask = function (c) {
    KIND.potion(c, { liq: '#e0b040', cork: '#6a4a2a' });
    c.save(); c.globalAlpha = .95; paint(c, P(p => { p.moveTo(24, 2); p.quadraticCurveTo(29, 8, 24, 11); p.quadraticCurveTo(19, 8, 24, 2); }), '#ffb030', { flat: true, strokes: 0, lw: .8 }); c.restore();
    glow(c, 24, 8, 8, 'rgba(255,190,60,.5)');
  };
  KIND.press = function (c) {
    paint(c, rect(8, 34, 32, 9, 2), '#5c6062', { box: [8, 34, 40, 43], strokes: 10 });
    paint(c, rect(18, 10, 12, 25, 1), '#767c7e', { box: [18, 10, 30, 35], strokes: 8 });
    paint(c, rect(12, 6, 24, 6, 2), MET.brass, { box: [12, 6, 36, 12], strokes: 4, lw: 1.2 });
    paint(c, circ(24, 22, 7), '#e9e2c8', { box: [17, 15, 31, 29], strokes: 2, lw: 1.2 }); line(c, [24, 22, 28, 18], '#9c2a20', 1.2); for (let i = 0; i < 8; i++) { const a = i * Math.PI / 4; line(c, [24 + Math.cos(a) * 5, 22 + Math.sin(a) * 5, 24 + Math.cos(a) * 6.2, 22 + Math.sin(a) * 6.2], '#3a342a', .8); }
    line(c, [36, 9, 44, 4], MET.iron, 2.4); dot(c, 44.5, 3.8, 2, '#8d4a2a');
    paint(c, rect(14, 38, 20, 3, 1), '#c7b98a', { flat: true, strokes: 0, lw: .8 });
  };
  KIND.book = function (c, o) {
    const cov = o.cov || '#3d5a8a';
    paint(c, rect(9, 5, 30, 38, 2), cov, { box: [9, 5, 39, 43], strokes: 20 });
    paint(c, rect(9, 5, 5, 38, 1), dark(cov, .3), { box: [9, 5, 14, 43], strokes: 3, lw: 1.1 });
    paint(c, rect(36, 8, 4, 32, 1), '#e6dcc0', { box: [36, 8, 40, 40], strokes: 3, lw: 1 });
    if (o.band) { paint(c, rect(9, 14, 30, 3, 0), o.band, { flat: true, strokes: 0, lw: .8 }); paint(c, rect(9, 31, 30, 3, 0), o.band, { flat: true, strokes: 0, lw: .8 }); }
    if (o.title) paint(c, rect(17, 19, 16, 9, 1), o.title, { flat: true, strokes: 0, lw: .9 });
    if (o.ribbon) { paint(c, P(p => poly(p, [28, 42, 31, 42, 31, 47, 29.5, 45, 28, 47])), o.ribbon, { flat: true, strokes: 0, lw: .9 }); }
    if (o.clasp) { paint(c, rect(33, 21, 6, 6, 1), MET.brass, { flat: true, strokes: 0, lw: .9 }); }
    if (o.ruled) for (let i = 0; i < 4; i++) line(c, [18, 21 + i * 2.4, 32, 21 + i * 2.4], 'rgba(40,30,20,.6)', .7);
  };
  KIND.ledger = function (c) {
    [[6, 30, '#c7ba92'], [3, 24, '#d8cca4'], [0, 18, '#e8dfbb']].forEach(([dx, dy, col], i) => { c.save(); c.translate(dx + 3, dy - 14); c.rotate(-0.06 + i * 0.05); paint(c, rect(7, 10, 28, 22, 1), col, { box: [7, 10, 35, 32], strokes: 6, lw: 1.2 }); for (let k = 0; k < 4; k++) line(c, [10, 15 + k * 4.5, 31, 15 + k * 4.5], 'rgba(60,50,40,.5)', .8); c.restore(); });
    paint(c, rect(30, 26, 12, 8, 1), '#a8281e', { flat: true, strokes: 0, lw: .9 }); line(c, [32, 30, 40, 30], '#f0e0c0', 1);
    line(c, [14, 44, 34, 44], 'rgba(0,0,0,.3)', 2);
  };
  KIND.folder = function (c) {
    paint(c, P(p => poly(p, [5, 12, 18, 12, 21, 16, 43, 16, 43, 42, 5, 42])), '#8e9ba0', { box: [5, 12, 43, 42], strokes: 16 });
    paint(c, rect(8, 20, 33, 22, 1), '#c9ccc4', { box: [8, 20, 41, 42], strokes: 4, lw: 1 });
    paint(c, rect(14, 25, 20, 9, 1), '#e4e0d0', { flat: true, strokes: 0, lw: .8 }); line(c, [17, 29, 31, 29], '#444', 1.2); line(c, [17, 32, 27, 32], '#444', .8);
    paint(c, P(p => poly(p, [34, 14, 40, 14, 40, 22, 37, 20, 34, 22])), '#7a2a24', { flat: true, strokes: 0, lw: .8 });
  };
  KIND.cloak = function (c) {
    paint(c, P(p => { p.moveTo(14, 7); p.quadraticCurveTo(24, 3, 34, 7); p.lineTo(43, 41); p.quadraticCurveTo(24, 47, 5, 41); p.closePath(); }), '#b32a2a', { box: [5, 3, 43, 47], strokes: 22, ang: 1.5 });
    line(c, [24, 9, 24, 44], 'rgba(0,0,0,.28)', 1.2); line(c, [16, 12, 11, 40], 'rgba(255,255,255,.2)', 1.4); line(c, [33, 12, 37, 40], 'rgba(0,0,0,.25)', 1.2);
    paint(c, P(p => { p.moveTo(14, 7); p.quadraticCurveTo(24, 12, 34, 7); p.quadraticCurveTo(24, 3, 14, 7); }), '#d6b64a', { flat: true, strokes: 0, lw: 1 });
    dot(c, 24, 10, 1.6, '#e8dcb0');
  };
  KIND.spool = function (c) {
    paint(c, rect(12, 6, 24, 5, 2), '#8a6a45', { box: [12, 6, 36, 11], strokes: 3, lw: 1.2 });
    paint(c, rect(12, 37, 24, 5, 2), '#8a6a45', { box: [12, 37, 36, 42], strokes: 3, lw: 1.2 });
    paint(c, rect(15, 11, 18, 26, 1), '#d9d2c2', { box: [15, 11, 33, 37], strokes: 10, ang: 0 });
    for (let y = 13; y < 36; y += 2.6) line(c, [15, y, 33, y + 1], 'rgba(120,110,90,.45)', .9);
    c.beginPath(); c.moveTo(33, 30); c.bezierCurveTo(44, 32, 36, 44, 44, 44); c.strokeStyle = '#d9d2c2'; c.lineWidth = 1.4; c.stroke();
  };
  KIND.letter = function (c) {
    paint(c, rect(5, 10, 38, 28, 1), '#e8dcc0', { box: [5, 10, 43, 38], strokes: 14 });
    line(c, [5, 10, 24, 26, 43, 10], 'rgba(90,70,40,.55)', 1.2); line(c, [5, 38, 18, 24], 'rgba(90,70,40,.35)', 1); line(c, [43, 38, 30, 24], 'rgba(90,70,40,.35)', 1);
    paint(c, circ(24, 26, 5), '#7a1f2a', { box: [19, 21, 29, 31], strokes: 3, lw: 1.1 }); line(c, [22, 26, 26, 26], '#c9606a', 1); line(c, [24, 24, 24, 28], '#c9606a', 1);
  };
  KIND.silkbolt = function (c) {
    paint(c, rect(8, 12, 32, 26, 3), '#e6e0f0', { box: [8, 12, 40, 38], strokes: 12, ang: 0 });
    paint(c, P(p => p.ellipse(10, 25, 4, 13, 0, 0, 7)), '#cfc7e0', { box: [6, 12, 14, 38], strokes: 4, lw: 1.2 });
    for (let x = 16; x < 40; x += 4) line(c, [x, 14, x + 1, 36], 'rgba(150,140,190,.4)', 1);
    line(c, [10, 14, 38, 14], 'rgba(255,255,255,.7)', 1.2); paint(c, rect(24, 12, 4, 26, 0), '#b32a2a', { flat: true, strokes: 0, lw: .8 });
    c.beginPath(); c.moveTo(40, 30); c.bezierCurveTo(46, 36, 42, 44, 36, 43); c.strokeStyle = '#e6e0f0'; c.lineWidth = 3; c.stroke();
  };
  KIND.valve = function (c) {
    paint(c, rect(20, 24, 8, 20, 1), MET.brass, { box: [20, 24, 28, 44], strokes: 6, lw: 1.2 });
    paint(c, rect(12, 38, 24, 6, 2), MET.copper, { box: [12, 38, 36, 44], strokes: 4, lw: 1.2 });
    c.beginPath(); c.arc(24, 15, 11, 0, 7); c.strokeStyle = INK; c.lineWidth = 5; c.stroke(); c.strokeStyle = '#a73a2c'; c.lineWidth = 3; c.stroke();
    line(c, [24, 4, 24, 26], '#a73a2c', 2.4); line(c, [13, 15, 35, 15], '#a73a2c', 2.4);
    paint(c, circ(24, 15, 3), MET.brass, { flat: true, strokes: 0, lw: 1 });
  };
  KIND.bigkey = function (c) {
    c.save(); c.translate(24, 24); c.rotate(-Math.PI / 4); c.translate(-24, -24);
    paint(c, rect(22, 16, 4, 30, 1), MET.iron, { box: [22, 16, 26, 46], strokes: 6, lw: 1.2 });
    paint(c, P(p => { p.arc(24, 9, 8, 0, Math.PI * 2); p.arc(24, 9, 3.4, 0, Math.PI * 2, true); }), MET.iron, { box: [16, 1, 32, 17], strokes: 6 });
    paint(c, rect(26, 36, 7, 3.5, 1), MET.iron, { box: [26, 36, 33, 40], strokes: 1, lw: 1.1 }); paint(c, rect(26, 42, 5, 3.5, 1), MET.iron, { box: [26, 42, 31, 46], strokes: 1, lw: 1.1 });
    c.restore();
  };
  KIND.bell = function (c) {
    paint(c, P(p => { p.moveTo(24, 5); p.quadraticCurveTo(34, 5, 34, 18); p.quadraticCurveTo(34, 30, 41, 36); p.lineTo(7, 36); p.quadraticCurveTo(14, 30, 14, 18); p.quadraticCurveTo(14, 5, 24, 5); p.closePath(); }), MET.bell, { box: [7, 5, 41, 36], strokes: 20, ang: 1.4 });
    line(c, [18, 10, 17, 28], 'rgba(255,255,255,.5)', 1.6); line(c, [10, 33, 38, 33], 'rgba(0,0,0,.28)', 1);
    paint(c, rect(22, 2, 4, 5, 1), MET.iron, { flat: true, strokes: 0, lw: 1 });
    // unrung: the clapper is bound with cloth so it cannot sound
    paint(c, circ(24, 41, 3.2), '#6d6a60', { box: [20, 38, 28, 45], strokes: 2, lw: 1 }); line(c, [24, 36, 24, 38], '#d9d2c2', 2);
    line(c, [21, 38, 27, 40], '#d9d2c2', 1.4);
  };
  KIND.cylinder = function (c) {
    paint(c, rect(10, 10, 28, 28, 5), '#d9c079', { box: [10, 10, 38, 38], strokes: 14, ang: 0.2 });
    for (let x = 14; x < 38; x += 3.2) line(c, [x, 11, x, 37], 'rgba(90,60,10,.4)', .9);
    paint(c, P(p => p.ellipse(24, 10, 14, 4, 0, 0, 7)), '#e6d390', { box: [10, 6, 38, 14], strokes: 2, lw: 1.2 });
    paint(c, P(p => p.ellipse(24, 10, 4.5, 1.6, 0, 0, 7)), '#2a1c10', { flat: true, strokes: 0, lw: .8 });
    paint(c, rect(8, 36, 32, 5, 2), '#6a4a30', { box: [8, 36, 40, 41], strokes: 3, lw: 1.2 });
  };
  KIND.dispatch = function (c) {
    paint(c, P(p => poly(p, [6, 14, 40, 8, 43, 36, 8, 42])), '#e4d8b4', { box: [6, 8, 43, 42], strokes: 14 });
    for (let i = 0; i < 4; i++) line(c, [11, 17 + i * 5, 36, 14 + i * 5], 'rgba(60,50,40,.5)', .9);
    paint(c, P(p => poly(p, [28, 8, 34, 7.5, 36, 36, 30, 36.6])), '#b32a2a', { flat: true, strokes: 0, lw: .9 });
    paint(c, circ(32, 22, 4), '#7a1f1f', { flat: true, strokes: 0, lw: .9 }); line(c, [30.5, 22, 33.5, 22], '#e8c070', 1);
    paint(c, P(p => poly(p, [6, 14, 14, 8, 20, 9, 8, 20])), '#cdbf92', { flat: true, strokes: 0, lw: .9 });
  };
  KIND.gem = function (c, o) { KIND.shard(c, { col: o.col || '#c8a0e0' }); };

  // ---------------------------------------------------------------- the icon table
  // Item ids map to [kind, params]. Weapon icons are keyed 'weapon:<WEAPONS id>'; the shop/inventory
  // w_<id> items share them. Anything not listed falls back by catalog flags (see plan()).
  const M = MET;
  const TABLE = {
    'weapon:sword': ['blade', { m: M.iron, len: 24, w: 4.6, g: 9 }],
    'weapon:longsword': ['blade', { m: M.steel, len: 29, w: 4.4, g: 11, gc: M.iron, pom: M.iron }],
    'weapon:knife': ['blade', { m: M.iron, len: 12, w: 4.6, g: 5, fuller: false, grip: '#8a6a45', curve: true }],
    'weapon:sable_dagger': ['blade', { m: M.steel, len: 13, w: 4, g: 5.5, fuller: false, grip: M.ivory, gc: M.silver, pom: M.ivory, tip: M.glass, glow: 'rgba(170,150,255,.5)' }],
    'weapon:tobin_blade': ['blade', { m: M.bronze, len: 28, w: 4.4, g: 11, gc: M.bronze, pom: M.bronze, glow: 'rgba(120,200,255,.55)', glow2: '#bfe6ff', runes: '#5b3b12' }],
    'weapon:axe': ['axe', { m: M.iron, cord: '#7a5a3a' }],
    'weapon:vesper_hook': ['axe', { m: M.steel, deck: true, rim: M.brass, cord: '#a8281e' }],
    'weapon:mace': ['mace', { m: M.bell }],
    'weapon:tollhammer': ['tollhammer', {}],
    'weapon:maul': ['maul', {}],
    'weapon:spear': ['spear', { m: M.bronze }],
    'weapon:crossbow': ['crossbow', {}],
    'weapon:pistol': ['pistol', {}],
    'weapon:throwknife': ['tknives', {}],
    'weapon:hands': ['fist', {}],
    'weapon:glass': ['glassarm', {}],

    'a_cap': ['helm', { v: 'cap', m: '#8a5a38' }],
    'a_hood': ['helm', { v: 'hood', m: '#35504a' }],
    'a_kettle': ['helm', { v: 'kettle', m: M.iron }],
    'a_bellhelm': ['helm', { v: 'bell', m: M.bell, fin: M.gold }],
    'a_synodrobe': ['body', { v: 'robe', m: '#8a9290' }],
    'a_gambeson': ['body', { v: 'gambeson', m: '#b49a6c' }],
    'a_jerkin': ['body', { v: 'jerkin', m: '#8a5530' }],
    'a_hushcoat': ['body', { v: 'hushcoat', m: '#3b5a52' }],
    'a_brig': ['body', { v: 'brig', m: '#5d6b4c' }],
    'a_chain': ['body', { v: 'chain', m: '#8e9a9e' }],
    'a_plate': ['body', { v: 'plate', m: M.bell }],
    'a_gloves': ['gloves', { m: '#8a5a38' }],
    'a_gauntlets': ['gloves', { m: '#6f5a46', mail: true, cuff: '#8e9a9e' }],
    'a_softboots': ['boots', { v: 'soft', m: '#8a8068' }],
    'a_hobnails': ['boots', { v: 'hob', m: '#5a3d26' }],
    'a_greaves': ['boots', { v: 'greaves', m: '#5a4630' }],
    'a_buckler': ['shield', { v: 'buckler', m: '#6d5140' }],
    'a_kite': ['shield', { v: 'kite', m: '#7a3a34' }],

    'pellets': ['pellets', {}], 'bolts': ['bolts', {}], 'tknives': ['tknives', {}],
    'tonic': ['potion', { liq: '#d98a30', label: '#e8dcb7' }],
    'honey': ['jar', { liq: '#d79a2a' }],
    'sovereigns': ['coins', {}],
    'bottle': ['vox', {}], 'empty_bottle': ['bottle', {}],
    'whistle': ['whistle', {}], 'bandage': ['bandage', {}], 'whetstone': ['whetstone', {}],
    'pebble': ['pebble', {}], 'shard': ['shard', { col: '#8fe08a' }], 'flume_eel': ['eel', {}],
    'cache': ['chest', {}],
    'herb_willow': ['herb', { v: 'bark' }], 'herb_reed': ['herb', { v: 'reed' }], 'herb_moss': ['herb', { v: 'moss' }],

    'v_scrap': ['scrap', {}], 'v_mesh': ['mesh', {}], 'v_gear': ['cog', {}], 'v_signet': ['signet', {}], 'v_fork': ['fork', {}],

    'coil': ['coil', {}],
    'charts': ['scroll', { paper: '#e5d7ae', ink: '#8a2d22' }],
    'pass': ['card', {}],
    'boots': ['kboots', {}],
    'core': ['core', {}],
    'oil': ['flask', {}],
    'press741': ['press', {}],
    'returns': ['ledger', {}],
    'folder': ['folder', {}],
    'redcloak': ['cloak', {}],
    'roundbook': ['book', { cov: '#3d5a8a', band: '#d6b64a', title: '#e6dcc0' }],
    'thread': ['spool', {}],
    'adaletter': ['letter', {}],
    'liftsilk': ['silkbolt', {}],
    'valve': ['valve', {}],
    'holdkey': ['bigkey', {}],
    'register': ['book', { cov: '#4a2f3a', ribbon: '#b32a2a', clasp: true, ruled: true }],
    'cutterlog': ['book', { cov: '#4f5b3c', band: '#2a2a22', title: '#c9b987', ruled: true }],
    'unrungbell': ['bell', {}],
    'hornwax': ['cylinder', {}],
    'dispatch': ['dispatch', {}],
  };
  // ---------------------------------------------------------------- what to draw for an id
  function catalogHas(kind, id) {
    try {
      if (kind === 'item') return typeof ITEMS !== 'undefined' && has(ITEMS, id);
      if (kind === 'weapon') return typeof WEAPONS !== 'undefined' && has(WEAPONS, id);
    } catch (e) { /* ignore */ }
    return false;
  }
  // Items added later that have no table row still get a category-appropriate icon, varied by id.
  function fallbackPlan(id) {
    const it = ITEMS[id], h = hash(id), pick = a => a[h % a.length];
    const cols = ['#d98a30', '#9c5fd0', '#5fb06a', '#c05a5a', '#5f8fd0'];
    if (it.weapon && has(WEAPONS, it.weapon)) return planFor('weapon:' + it.weapon) || ['blade', { m: M.iron }];
    if (it.armor) {
      const k = { head: 'helm', body: 'body', hands: 'gloves', feet: 'boots', shield: 'shield' }[it.slot] || 'body';
      return [k, { v: k === 'helm' ? 'kettle' : k === 'body' ? 'gambeson' : k === 'boots' ? 'soft' : 'buckler', m: pick(['#8a5a38', '#8e9a9e', '#3b5a52', '#a48a62']) }];
    }
    if (it.valuable) return ['gem', { col: pick(['#c8a0e0', '#e0c070', '#80c0e0']) }];
    if (it.herb) return ['herb', { v: pick(['bark', 'reed', 'moss']) }];
    if (it.use === 'ammo') return ['pellets', {}];
    if (it.use === 'cache') return ['chest', {}];
    if (it.key) return pick([['scroll', { paper: '#dccfa6', ink: '#355a8a' }], ['book', { cov: pick(cols), band: '#d6b64a' }], ['card', {}]]);
    if (it.use) return ['potion', { liq: pick(cols) }];
    return ['pebble', {}];
  }
  function planFor(key) { return has(TABLE, key) ? TABLE[key] : null; }
  function plan(id) {
    if (has(TABLE, id)) return TABLE[id];
    if (catalogHas('item', id)) {
      const it = ITEMS[id];
      if (it.weapon && has(TABLE, 'weapon:' + it.weapon)) return TABLE['weapon:' + it.weapon];
      return fallbackPlan(id);
    }
    return null;
  }
  function weaponPlan(wid) {
    if (!catalogHas('weapon', wid)) return null;
    if (has(TABLE, 'weapon:' + wid)) return TABLE['weapon:' + wid];
    const W = WEAPONS[wid]; // an unlisted weapon: pick by its catalog flags
    if (W.ranged) return W.ammo === 'bolts' ? TABLE['weapon:crossbow'] : TABLE['weapon:pistol'];
    if (W.blunt) return TABLE['weapon:mace'];
    if (W.twoHanded) return TABLE['weapon:spear'];
    return TABLE['weapon:sword'];
  }

  // ---------------------------------------------------------------- rendering + cache
  const PLATE = { weapon: ['#3a3027', '#17110c'], armor: ['#32363a', '#121416'], item: ['#3a2d32', '#150f12'], key: ['#3d3624', '#16130a'], valuable: ['#2c3a3a', '#0e1414'] };
  const cache = new Map();
  function makeCanvas() {
    if (typeof document === 'undefined' || !document.createElement) return null;
    const cv = document.createElement('canvas'); cv.width = S; cv.height = S;
    return cv.getContext && cv.getContext('2d') ? cv : null;
  }
  function paintIcon(key, pl, tone, upright) {
    const cv = makeCanvas(); if (!cv) return null;
    const c = cv.getContext('2d');
    R = seeded(hash(key));
    const t = PLATE[tone] || PLATE.item;
    const bg = c.createRadialGradient(18, 14, 2, 24, 24, 34); bg.addColorStop(0, t[0]); bg.addColorStop(1, t[1]);
    if (!upright) { c.fillStyle = bg; if (c.roundRect) { c.beginPath(); c.roundRect(1, 1, S - 2, S - 2, 6); c.fill(); } else c.fillRect(1, 1, S - 2, S - 2); c.strokeStyle = 'rgba(190,160,100,.35)'; c.lineWidth = 1; c.stroke(); }
    c.save(); if (upright) { /* doll layers sit on the figure, so no plate */ }
    c.shadowColor = 'rgba(0,0,0,.55)'; c.shadowBlur = 2; c.shadowOffsetY = 1;
    KIND[pl[0]](c, upright ? Object.assign({ upright: true }, pl[1]) : pl[1]);
    c.restore();
    return cv;
  }
  function toneOf(id, isWeapon) {
    if (isWeapon) return 'weapon';
    const it = typeof ITEMS !== 'undefined' && has(ITEMS, id) ? ITEMS[id] : null;
    if (!it) return 'item';
    return it.weapon ? 'weapon' : it.armor ? 'armor' : it.valuable ? 'valuable' : it.key ? 'key' : 'item';
  }
  function memo(key, make) {
    if (cache.has(key)) return cache.get(key);
    let url = null;
    try { const cv = make(); url = cv ? cv.toDataURL('image/png') : null; } catch (e) { console.warn('icon failed', key, e); }
    cache.set(key, url); return url;
  }
  // Data URL for an item id, or null when the id is not a catalog id.
  function url(id) {
    if (typeof id !== 'string') return null;
    const pl = plan(id); if (!pl) return null;
    return memo('i:' + id, () => paintIcon('i:' + id, pl, toneOf(id, false), false));
  }
  function weaponUrl(wid) {
    if (typeof wid !== 'string') return null;
    const pl = weaponPlan(wid); if (!pl) return null;
    return memo('w:' + wid, () => paintIcon('w:' + wid, pl, 'weapon', false));
  }
  // Upright, plate-less art for the paper doll (weapon in hand, shield on arm).
  function layerUrl(key, pl) { return memo('l:' + key, () => paintIcon('l:' + key, pl, 'weapon', true)); }
  function weaponLayerUrl(wid) { const pl = weaponPlan(wid); return pl ? layerUrl('w:' + wid, pl) : null; }
  function itemLayerUrl(id) { const pl = plan(id); return pl ? layerUrl('i:' + id, pl) : null; }

  // every id that should have an icon: items, weapons, armour
  function allIds() {
    const out = { items: [], weapons: [], armor: [] };
    try {
      for (const id in ITEMS) if (has(ITEMS, id)) out.items.push(id);
      for (const id in WEAPONS) if (has(WEAPONS, id)) out.weapons.push(id);
      for (const id in ARMOR) if (has(ARMOR, id)) out.armor.push(id);
    } catch (e) { /* ignore */ }
    return out;
  }

  // ---------------------------------------------------------------- DOM insertion
  const on = () => typeof GFX !== 'undefined' && GFX.itemIcons !== false;
  function img(src, cls) {
    const im = document.createElement('img');
    im.className = 'ico' + (cls ? ' ' + cls : ''); im.alt = ''; im.src = src; im.width = 24; im.height = 24;
    im.setAttribute('draggable', 'false');
    return im;
  }
  function put(host, src) {
    if (!host || !src || host.querySelector(':scope > img.ico')) return;
    host.insertBefore(img(src), host.firstChild);
  }
  const panel = () => document.querySelector('#modal-panel');
  function armorId(a) { if (!a) return null; for (const k in ARMOR) if (has(ARMOR, k) && ARMOR[k] === a) return k; return null; }

  function decorateInventory() {
    const pn = panel(); if (!pn) return;
    const p = G.player;
    pn.querySelectorAll('.carry tr').forEach((tr, i) => { const sl = p.inv[i]; if (sl) put(tr.querySelector('.nm'), url(sl.id)); });
    pn.querySelectorAll('.slots .slot').forEach((el, i) => {
      const slot = ARMOR_SLOTS[i]; if (!slot) return;
      const id = armorId(worn(slot[0])); if (id) put(el.querySelector('.nm b'), url(id));
    });
    pn.querySelectorAll('.weps .weprow').forEach((el, i) => { const w = p.weapons[i]; if (w) put(el.querySelector('b'), weaponUrl(w)); });
  }
  function decorateShop(mode) {
    const pn = panel(); if (!pn || typeof DLG === 'undefined' || !DLG.npc) return;
    const n = DLG.npc;
    if (mode === 'buy' && n.shop) pn.querySelectorAll('[data-buy]').forEach(b => { const e = n.shop[+b.dataset.buy]; if (e) put(b.querySelector('b'), url(e.item)); });
    if (mode === 'sell') { const L = sellables(n); pn.querySelectorAll('[data-sell]').forEach(b => { const e = L[+b.dataset.sell]; if (e) put(b.querySelector('b'), url(e.id)); }); }
  }
  function decorateChest() {
    const pn = panel(); if (!pn) return;
    const p = G.player, tabs = pn.querySelectorAll('table');
    const rowsOf = t => t ? Array.from(t.querySelectorAll('tr')).filter(tr => tr.querySelector('button')) : [];
    const store = p.houseStorage || [];
    rowsOf(tabs[0]).forEach((tr, i) => { if (store[i]) put(tr.querySelector('td b'), url(store[i].id)); });
    const carry = p.inv.filter(sl => has(ITEMS, sl.id) && !ITEMS[sl.id].key && !isWorn(sl.id));
    rowsOf(tabs[1]).forEach((tr, i) => { if (carry[i]) put(tr.querySelector('td b'), url(carry[i].id)); });
  }
  function decorateCrafting() {
    const pn = panel(); if (!pn) return;
    const wid = G.player.weapons[G.player.weapon] || 'sword';
    put(pn.querySelector('.slot b'), weaponUrl(wid));
    pn.querySelectorAll('[data-brew]').forEach(b => { const r = ALCHEMY_RECIPES[+b.dataset.brew]; if (r) put(b.querySelector('b'), url(r.out)); });
  }
  function guarded(fn, label) { try { fn(); } catch (e) { console.warn('item icons: ' + label + ' skipped', e); } }

  // ---------------------------------------------------------------- the painted paper doll
  // Same catalog-only SVG, same <title>, heading and figcaption as inventoryDoll; here the layers
  // carry gradients, shading and material textures, and the readied weapon and shield are the icons.
  function matOf(a) {
    if (!a) return null;
    if (a === ARMOR.a_synodrobe) return 'robe';
    if (/Hush/.test(a.name)) return 'hush';
    if (/Chain|Mail/.test(a.name)) return 'mail';
    if (/Bell-|Carillon/.test(a.name)) return 'bell';
    if (/Iron|Brigandine/.test(a.name)) return 'steel';
    if (/Leather/.test(a.name)) return 'leather';
    return 'cloth';
  }
  const MAT_COL = { robe: ['#a9b1af', '#5f6866'], hush: ['#4a6b62', '#223630'], mail: ['#a9b3b6', '#566064'], bell: ['#d8ab5a', '#7a5320'], steel: ['#b3bcbf', '#5a6366'], leather: ['#9a6642', '#4a2c18'], cloth: ['#b8a07a', '#6b5638'], skin: ['#c9a083', '#7b5842'], none: ['#7a6552', '#3a2d22'] };
  function dollSvg(p, origTitle) {
    const eq = slot => worn(slot, p), body = eq('body'), head = eq('head'), hands = eq('hands'), feet = eq('feet'), shield = eq('shield');
    const wid = p.weapons[p.weapon], weapon = WEAPONS[wid] || WEAPONS.sword, blocked = !!weapon.twoHanded;
    const mb = matOf(body), mh = matOf(head), mg = matOf(hands), mf = matOf(feet);
    const fill = m => 'url(#dl-' + (m || 'none') + ')';
    const defs = Object.keys(MAT_COL).map(k => '<linearGradient id="dl-' + k + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="' + MAT_COL[k][0] + '"/><stop offset="1" stop-color="' + MAT_COL[k][1] + '"/></linearGradient>').join('');
    const wUrl = weaponLayerUrl(wid), sUrl = shield && !blocked ? itemLayerUrl(armorId(shield)) : null;
    const metalBody = mb === 'mail' || mb === 'bell' || mb === 'steel';
    const plates = mb === 'bell' ? '<path d="M78 66L102 66L108 108L72 108Z" fill="url(#dl-bell)" opacity=".9"/><path d="M90 66V108M74 84H106" stroke="#5a3a12" stroke-width="1.2" opacity=".6"/><circle cx="90" cy="86" r="3.5" fill="#e8c46a" stroke="#5a3a12"/>'
      : mb === 'steel' ? '<path d="M74 66L105 66L111 109L70 109Z" fill="url(#dl-steel)"/><path d="M80 68V107M100 68V107" stroke="#e6e3c8" opacity=".6"/>' + [72, 80, 88, 96, 104].map(y => '<circle cx="' + (y - 20 + 12) + '" cy="72" r="1.1" fill="#f0e4b0"/>').join('')
      : mb === 'mail' ? '<path d="M74 65L105 65L111 109L70 109Z" fill="url(#dl-mail)"/><path d="M74 65L105 65L111 109L70 109Z" fill="url(#doll-mail)"/>' : '';
    const stitch = !body ? '<path d="M78 66L75 110M86 66V111M97 66L101 110" stroke="#af9469" opacity=".5"/>' : mb === 'leather' ? '<path d="M90 68V108" stroke="#2b1a0e" stroke-width="1.4"/>' + [72, 80, 88, 96, 104].map(y => '<path d="M86 ' + y + 'L94 ' + (y + 3) + 'M94 ' + y + 'L86 ' + (y + 3) + '" stroke="#e0cfa0" stroke-width=".9"/>').join('') : mb === 'cloth' ? '<path d="M76 66V110M84 66V110M92 66V110M100 66V110" stroke="#4b3a22" opacity=".28"/>' : mb === 'hush' ? '<path d="M90 66V112" stroke="#0f1d19" stroke-width="1.3" opacity=".6"/>' : '';
    const robe = mb === 'robe' ? '<path d="M67 109L113 109L123 166H58Z" fill="url(#dl-robe)"/><path d="M81 63V143L90 152L100 143V63" fill="none" stroke="#d8dad0" stroke-width="5"/><path d="M90 81V104M83 92H97" stroke="#514c39"/>' : '';
    const hushHem = mb === 'hush' ? '<path d="M66 118L114 118L120 150L60 150Z" fill="url(#dl-hush)" opacity=".92"/>' : '';
    const headPath = head ? '<path d="M73 40Q69 14 90 15Q112 15 107 41L101 47L101 30H79V47Z" fill="' + fill(mh) + '"/>'
      + (mh === 'bell' || mh === 'steel' || mh === 'mail' ? '<path d="M67 32Q90 24 113 32L110 37H70Z" fill="url(#dl-steel)"/><path d="M90 16V32" stroke="#4a3010" opacity=".5"/>' : '<path d="M76 24Q90 14 104 24" stroke="#fff" stroke-width="1.5" fill="none" opacity=".18"/>')
      : '<path d="M75 35Q69 14 90 17Q110 14 106 36L100 26L80 28Z" fill="#46352c"/>';
    const feetShade = feet ? '<path d="M72 152H85V176L65 178L65 170L72 168ZM96 152H109V168L117 171V178L96 176Z" fill="' + fill(mf) + '"/>' + (mf === 'steel' || mf === 'mail' ? '<path d="M75 155V170M100 155V170" stroke="#e6e6cf" opacity=".8"/>' : '') : '<path d="M72 152H85V176L65 178L65 170L72 168ZM96 152H109V168L117 171V178L96 176Z" fill="#67503c"/>';
    return '<svg viewBox="0 0 180 200" role="img" aria-label="Equipment paper doll">' + origTitle
      + '<defs><radialGradient id="doll-light"><stop stop-color="#6a5840"/><stop offset="1" stop-color="#211b17"/></radialGradient>'
      + '<pattern id="doll-mail" width="5" height="4" patternUnits="userSpaceOnUse"><path d="M0 1L2 3L5 1" fill="none" stroke="#e3e8e4" stroke-width=".8"/></pattern>'
      + defs + '<linearGradient id="dl-shade" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".55" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".38"/></linearGradient>'
      + '<radialGradient id="dl-floor"><stop stop-color="#000" stop-opacity=".7"/><stop offset="1" stop-color="#000" stop-opacity="0"/></radialGradient></defs>'
      + '<rect x="5" y="5" width="170" height="190" rx="70" fill="url(#doll-light)" stroke="#8d744a" stroke-width="1.5"/><path d="M90 12V186M15 100H165" stroke="#c0a36b" opacity=".12"/>'
      + '<ellipse cx="90" cy="180" rx="46" ry="8" fill="url(#dl-floor)"/>'
      + '<g stroke="#221c1a" stroke-width="2" stroke-linejoin="round">'
      + '<path d="M73 111L87 113L85 169L72 169ZM94 113L108 111L109 169L96 169Z" fill="#483e38"/>'
      + '<path d="M67 64L54 72L44 111L54 116L69 88M112 64L125 73L136 111L126 116L111 88" fill="' + fill(mb) + '"/>'
      + '<path d="M71 60L108 60L117 118L65 118Z" fill="' + fill(mb) + '"/>' + plates + stitch + robe + hushHem
      + '<path d="M67 110H115V118H67Z" fill="#322923"/><rect x="85" y="110" width="10" height="8" fill="#c5a866"/>'
      + '<path d="M83 51V63L90 68L98 61V50" fill="' + fill('skin') + '"/><ellipse cx="90" cy="39" rx="15" ry="20" fill="' + fill('skin') + '"/>'
      + headPath + '<path d="M81 39H85M96 39H100M86 50Q91 53 96 49" fill="none" stroke="#594438"/>'
      + '<path d="M45 107L55 111L54 125L44 122ZM126 111L136 107L138 122L128 125Z" fill="' + (hands ? fill(mg) : fill('skin')) + '"/>'
      + feetShade + '</g>'
      // shading pass over the figure: light from the upper left, soft rim on the right
      + '<g stroke="none" pointer-events="none"><path d="M71 60L108 60L117 118L65 118Z" fill="url(#dl-shade)"/><path d="M67 64L54 72L44 111L54 116L69 88Z" fill="url(#dl-shade)"/><ellipse cx="90" cy="39" rx="15" ry="20" fill="url(#dl-shade)"/><path d="M72 152H85V176L65 178L65 170L72 168Z" fill="url(#dl-shade)"/></g>'
      + (metalBody ? '<path d="M76 68L74 106" stroke="#fff" stroke-width="2" opacity=".35"/>' : '')
      + (wUrl ? '<image href="' + wUrl + '" x="18" y="56" width="60" height="60" preserveAspectRatio="xMidYMid meet"/>' : '')
      + (sUrl ? '<image href="' + sUrl + '" x="108" y="84" width="48" height="48" preserveAspectRatio="xMidYMid meet"/>' : '')
      + '</svg>';
  }

  // ---------------------------------------------------------------- stylesheet
  function injectStyle() {
    if (typeof document === 'undefined' || !document.head || document.getElementById('icons-style')) return;
    const st = document.createElement('style'); st.id = 'icons-style';
    // negative block margins keep the icon from making rows taller than their text
    st.textContent = 'img.ico{width:3.2cqw;height:3.2cqw;vertical-align:middle;margin:-.8cqw .7cqw -.8cqw 0;image-rendering:auto;border-radius:.5cqw;flex:none}'
      + '.carry .nm img.ico{width:3.6cqw;height:3.6cqw}.slots .slot img.ico{width:3.8cqw;height:3.8cqw;margin:-1cqw .7cqw -1cqw 0;float:left}.slots .slot .nm{overflow:hidden}'
      + '.shoprow b:has(> img.ico){display:flex;align-items:center;gap:.6cqw}.shoprow b img.ico{width:3.6cqw;height:3.6cqw;margin:-.6cqw 0}'
      + '.paper-doll svg image{filter:drop-shadow(0 .4cqw .3cqw rgba(0,0,0,.6))}';
    document.head.appendChild(st);
  }

  // ---------------------------------------------------------------- wrap the original renderers (global function bindings, as reading.js does)
  function install() {
    injectStyle();
    if (typeof renderInventory === 'function') {
      const _inv = renderInventory;
      renderInventory = function () { const r = _inv.apply(this, arguments); if (on()) guarded(decorateInventory, 'inventory'); return r; };
    }
    if (typeof renderDialogue === 'function') {
      const _dlg = renderDialogue;
      renderDialogue = function (mode) { const r = _dlg.apply(this, arguments); if (on()) guarded(() => decorateShop(mode), 'shop'); return r; };
    }
    if (typeof renderHouseChest === 'function') {
      const _ch = renderHouseChest;
      renderHouseChest = function () { const r = _ch.apply(this, arguments); if (on()) guarded(decorateChest, 'chest'); return r; };
    }
    if (typeof renderCrafting === 'function') {
      const _cr = renderCrafting;
      renderCrafting = function () { const r = _cr.apply(this, arguments); if (on()) guarded(decorateCrafting, 'forge'); return r; };
    }
    if (typeof inventoryDoll === 'function') {
      const _doll = inventoryDoll;
      inventoryDoll = function (p) {
        const html = _doll.apply(this, arguments);
        if (!on()) return html;
        try {
          const t = /<title>[^<]*<\/title>/.exec(html), a = html.indexOf('<svg'), b = html.indexOf('</svg>');
          if (!t || a < 0 || b < 0) return html;
          const svg = dollSvg(p || G.player, t[0]);
          return html.slice(0, a) + svg + html.slice(b + 6);
        } catch (e) { console.warn('painted doll skipped', e); return html; }
      };
    }
  }
  try { install(); } catch (e) { console.warn('icons install failed', e); }

  return {
    TABLE, KIND: Object.keys(KIND), SIZE: S, url, weaponUrl, itemLayerUrl, weaponLayerUrl, allIds, plan, weaponPlan, dollSvg,
    decorateInventory, decorateShop, decorateChest, decorateCrafting, armorId, cacheSize: () => cache.size,
  };
})();
