// ============================================================
//  fp87 — Phase 87 (a): the first-person paintings, made in code, one per weapon (owner, 14 Nov: "the first person
//  view needs work also so that the hands and weapons look better", with a reference picture: a broad steel sword held
//  upright in a leather-gloved right hand, the blade bevelled and catching the light). Approved 14 Nov as question 5.
//
//  Every melee weapon's picture is painted here from its gear-look entry (js/gearlook21.js: kind, length, material,
//  colours) and a FORM of its own (blade shape, guard, pommel, head), with the glove you wear (or your bare hand) closed
//  round the grip and your sleeve running out of the bottom of the view. Twice the old pictures' detail: drawn at the
//  same place, at about 1.25 times the old size. BODY21 asks for these first and falls back to its re-toned shared
//  paintings for anything this module does not paint (the ranged weapons, the bare hands, the glass arm itself).
//  Nothing here uses random numbers: grain, wear and speckle come from a hash of the pixel.
// ============================================================
'use strict';

const FP87 = (function () {
  const PI = Math.PI, K = 2;               // K: painting pixels per pixel of the old paintings
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('fp87: ' + k, e); } };
  const hash = (x, y, s) => { const v = Math.sin(x * 127.1 + y * 311.7 + (s || 0) * 74.7) * 43758.5453; return v - Math.floor(v); };
  const cl = (v) => Math.max(0, Math.min(255, Math.round(v)));
  const mul = (c, k) => [cl(c[0] * k), cl(c[1] * k), cl(c[2] * k)];
  const mix = (a, b, t) => [cl(a[0] + (b[0] - a[0]) * t), cl(a[1] + (b[1] - a[1]) * t), cl(a[2] + (b[2] - a[2]) * t)];
  const css = (c, a) => a == null ? `rgb(${c[0]},${c[1]},${c[2]})` : `rgba(${c[0]},${c[1]},${c[2]},${a})`;
  const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
  const WARM = [255, 236, 200], COOL = [190, 210, 236];

  // ---------------------------------------------------------------- each weapon's own shape
  // blade: straight | taper | leaf | broad | curved; guard: cross | bar | disc | basket | ring | none; pommel: wheel | ball | disc | cap | ring | none
  const FORM = {
    sword: { blade: 'straight', w: 30, fuller: 0.62, guard: 'cross', gw: 104, pommel: 'wheel', wrap: 'leather' },
    longsword: { blade: 'taper', w: 32, fuller: 0.7, guard: 'cross', gw: 128, quillons: 'down', pommel: 'disc', wrap: 'wire' },
    tobin_blade: { blade: 'straight', w: 28, fuller: 0.55, guard: 'disc', gw: 70, pommel: 'ring', wrap: 'cord', notch: true },
    p22_leafblade: { blade: 'leaf', w: 34, fuller: 0, ridge: true, guard: 'bar', gw: 60, pommel: 'cap', wrap: 'bronze' },
    p12_glassblade: { blade: 'broad', w: 40, fuller: 0, ridge: true, guard: 'bar', gw: 96, pommel: 'ball', wrap: 'leather', glass: true },
    knife: { blade: 'taper', w: 34, back: true, guard: 'none', pommel: 'none', wrap: 'wood' },
    p22_shears: { blade: 'shears', w: 26, guard: 'none', pommel: 'none', wrap: 'bow' },
    sable_dagger: { blade: 'taper', w: 26, glassTip: true, guard: 'ring', gw: 26, pommel: 'ball', wrap: 'ivory' },
    p85_knife: { blade: 'flint', w: 38, guard: 'none', pommel: 'none', wrap: 'hide' },
    p100_spike: { blade: 'spike', w: 16, guard: 'none', pommel: 'ring', wrap: 'cord' },   // Phase 100: a cable-splicer's spike, round, no edge
    p12_dirk: { blade: 'taper', w: 30, fuller: 0.5, guard: 'basket', gw: 64, pommel: 'ball', wrap: 'wire' },
    throwknife: { blade: 'taper', w: 28, guard: 'none', pommel: 'ring', wrap: 'cord' },
    axe: { head: 'bearded', haft: 'ash', spike: true },
    vesper_hook: { head: 'bearded', haft: 'red', spike: true, notch: true },
    mace: { head: 'flanged', haft: 'iron' },
    p85_bough: { head: 'knot', haft: 'bough' },
    tollhammer: { head: 'bell', haft: 'ash' },
    p85_pick: { head: 'antler', haft: 'antler' },
    maul: { head: 'gauge', haft: 'iron' },
    p12_greatmaul: { head: 'sledge', haft: 'ash' },
    spear: { head: 'fork', haft: 'ash' },
    p12_bellglaive: { head: 'glaive', haft: 'ash' },
    p22_crook: { head: 'crook', haft: 'ash' },
    p79_staff: { head: 'shoe', haft: 'ash' },
    p85_pole: { head: 'shoe', haft: 'pale' },
    p85_hook: { head: 'boathook', haft: 'ash' },
    p92_clothpole: { head: 'cloth', haft: 'ash' },
    p94_lever: { head: 'lever', haft: 'iron' },
    p95_stave: { head: 'firecage', haft: 'iron' },
    p97_hook: { head: 'tallyhook', haft: 'bough' },
    p98_ridge: { head: 'ridgeflint', haft: 'shell', len: 0.3, hw: 40 },     // Phase 91 question 4: no haft, a lump of shell in the fist
    p98_beamkey: { head: 'beamkey', haft: 'iron', len: 0.4 },
    p100_mallet: { head: 'kegmallet', haft: 'ash', len: 0.42 },
    p113_sprag: { head: 'sprag', haft: 'ash', len: 0.36 },   // Phase 113 C: a billet of ash shod with iron; the handle is the billet's own end, polished
    p87_sledge: { head: 'nightsledge', haft: 'ash' },
  };
  const BLADE_KINDS = { sword: 1, longsword: 1, greatsword: 1, knife: 1, dirk: 1 };   // throwing knives stay with the ranged (a fan of three)
  const HEAD_KINDS = { axe: 1, mace: 1, hammer: 1, maul: 1, spear: 1, glaive: 1 };
  function formOf(wid, e) {
    if (FORM[wid]) return FORM[wid];
    if (!e) return null;
    if (e.kind === 'longsword' || e.kind === 'greatsword') return FORM.longsword;
    if (e.kind === 'sword') return FORM.sword;
    if (e.kind === 'knife' || e.kind === 'throwing') return FORM.knife;
    if (e.kind === 'dirk') return FORM.p12_dirk;
    if (e.kind === 'axe') return FORM.axe;
    if (e.kind === 'mace') return FORM.mace;
    if (e.kind === 'hammer') return FORM.tollhammer;
    if (e.kind === 'maul') return FORM.maul;
    if (e.kind === 'spear') return FORM.spear;
    if (e.kind === 'glaive') return FORM.p12_bellglaive;
    return null;
  }
  const entryOf = (wid) => { try { return GEARLOOK21.WEAPONS[wid] || null; } catch (e) { return null; } };
  function covers(wid) { const e = entryOf(wid); return !!(e && ((BLADE_KINDS[e.kind] || HEAD_KINDS[e.kind]) && formOf(wid, e) || RANGED_KINDS[e.kind])); }

  // ---------------------------------------------------------------- shading helpers
  function lin(x, x0, y0, x1, y1, stops) { const g = x.createLinearGradient(x0, y0, x1, y1); for (const [t, c] of stops) g.addColorStop(t, typeof c === 'string' ? c : css(c)); return g; }
  function rad(x, cx, cy, r0, r, stops) { const g = x.createRadialGradient(cx, cy, r0, cx, cy, r); for (const [t, c] of stops) g.addColorStop(t, typeof c === 'string' ? c : css(c)); return g; }
  function rrect(x, a, b, w, h, r) { x.beginPath(); x.moveTo(a + r, b); x.arcTo(a + w, b, a + w, b + h, r); x.arcTo(a + w, b + h, a, b + h, r); x.arcTo(a, b + h, a, b, r); x.arcTo(a, b, a + w, b, r); x.closePath(); }
  function ell(x, cx, cy, rx, ry, rot) { x.beginPath(); x.ellipse(cx, cy, Math.max(0.5, rx), Math.max(0.5, ry), rot || 0, 0, PI * 2); }
  // metal: a bright band where the sky catches it, falling off to the shadowed side (sh: 0 left lit .. 1 right dark)
  function metal(c, edge) { const L = edge || mix(c, [255, 255, 255], 0.55); return { hi: mix(mix(L, [255, 255, 255], 0.35), WARM, 0.12), lt: mix(c, L, 0.6), base: c, sh: mul(c, 0.55), dk: mul(c, 0.3) }; }
  // speckle: a pixel scatter for steel, wood and leather (grain), kept inside whatever is clipped
  function speckle(x, a, b, w, h, n, col, alpha, seed) {
    x.fillStyle = css(col, alpha);
    for (let i = 0; i < n; i++) { const u = hash(i, seed, 1), v = hash(seed, i, 2); x.fillRect(Math.floor(a + u * w), Math.floor(b + v * h), 1 + (hash(i, i, seed) > 0.8 ? 1 : 0), 1); }
  }

  // ---------------------------------------------------------------- blades (local frame: grip at 0,0; the blade up -y)
  function bladePath(x, f, L, w) {
    const half = w / 2;
    x.beginPath();
    if (f.blade === 'leaf') { x.moveTo(-half * 0.8, 0); x.bezierCurveTo(-half * 1.35, -L * 0.45, -half * 1.1, -L * 0.75, 0, -L); x.bezierCurveTo(half * 1.1, -L * 0.75, half * 1.35, -L * 0.45, half * 0.8, 0); }
    else if (f.blade === 'broad') { x.moveTo(-half, 0); x.lineTo(-half * 1.05, -L * 0.82); x.quadraticCurveTo(-half * 0.6, -L * 0.97, 0, -L); x.quadraticCurveTo(half * 0.5, -L * 0.93, half * 0.98, -L * 0.8); x.lineTo(half, 0); }
    else if (f.blade === 'spike') { x.moveTo(-half, 0); x.lineTo(-half * 0.92, -L * 0.12); x.lineTo(-half * 0.22, -L * 0.96); x.quadraticCurveTo(0, -L * 1.01, half * 0.22, -L * 0.96); x.lineTo(half * 0.92, -L * 0.12); x.lineTo(half, 0); }
    else if (f.blade === 'flint') { const pts = [[-half, 0], [-half * 1.15, -L * 0.2], [-half * 0.95, -L * 0.42], [-half * 1.05, -L * 0.6], [-half * 0.6, -L * 0.82], [0, -L], [half * 0.5, -L * 0.8], [half * 0.9, -L * 0.55], [half * 0.8, -L * 0.3], [half, 0]]; x.moveTo(...pts[0]); for (const p of pts.slice(1)) x.lineTo(...p); }
    else if (f.back) { x.moveTo(-half, 0); x.lineTo(-half * 0.9, -L * 0.7); x.quadraticCurveTo(-half * 0.4, -L * 0.94, 0, -L); x.lineTo(half, -L * 0.62); x.lineTo(half, 0); }
    else { const t = f.blade === 'taper' ? 0.62 : 0.86; x.moveTo(-half, 0); x.lineTo(-half * t, -L * 0.86); x.lineTo(0, -L); x.lineTo(half * t, -L * 0.86); x.lineTo(half, 0); }
    x.closePath();
  }
  function drawBlade(x, f, e, L, seed) {
    const C = e.col, M = metal(C.blade, C.edge), w = f.w * K * 0.72 + (e.kind === 'longsword' ? 2 : 0);
    if (f.blade === 'shears') { drawShears(x, e, L); return; }
    // a soft dark shape under it, for weight against bright skies
    x.save(); x.translate(3, 3); bladePath(x, f, L, w); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fill(); x.restore();
    bladePath(x, f, L, w); x.save(); x.clip();
    // across: the lit flat on the left, the ridge, the shadowed flat on the right
    x.fillStyle = lin(x, -w / 2, 0, w / 2, 0, [[0, M.hi], [0.18, M.lt], [0.48, M.base], [0.52, M.sh], [0.85, M.sh], [1, M.dk]]);
    x.fillRect(-w, -L - 2, w * 2, L + 4);
    // along: the sky in the upper blade, the hand's shadow near the guard
    x.fillStyle = lin(x, 0, -L, 0, 0, [[0, css(mix(COOL, [255, 255, 255], 0.4), 0.35)], [0.45, 'rgba(255,255,255,0.06)'], [0.85, 'rgba(0,0,0,0.0)'], [1, 'rgba(0,0,0,0.3)']]);
    x.fillRect(-w, -L - 2, w * 2, L + 4);
    if (f.fuller) { const fw = w * 0.2, fl = L * f.fuller; x.fillStyle = lin(x, -fw / 2, 0, fw / 2, 0, [[0, M.dk], [0.5, M.sh], [1, M.lt]]); rrect(x, -fw / 2, -fl, fw, fl - 4, fw / 2); x.fill(); x.fillStyle = css(M.hi, 0.6); x.fillRect(fw / 2 - 1, -fl + 4, 1, fl - 10); }
    else if (f.ridge || f.blade !== 'flint') { x.fillStyle = css(M.hi, 0.55); x.fillRect(-1.5, -L * 0.96, 1.2, L * 0.94); x.fillStyle = css(M.dk, 0.5); x.fillRect(0, -L * 0.96, 1.4, L * 0.94); }
    if (f.blade === 'flint') { // conchoidal flakes
      for (let i = 0; i < 14; i++) { const u = hash(i, seed, 3), v = hash(seed, i, 4); ell(x, (u - 0.5) * w * 0.9, -L * (0.08 + v * 0.8), w * 0.22, w * 0.12, u * 3); x.fillStyle = css(i % 2 ? M.lt : M.sh, 0.45); x.fill(); }
    }
    if (f.glass || f.glassTip) { // Aether-Glass: a cold inner light and facets
      const y0 = f.glassTip ? -L : -L, y1 = f.glassTip ? -L * 0.55 : 0;
      x.fillStyle = lin(x, 0, y0, 0, y1, [[0, 'rgba(220,250,255,0.55)'], [1, 'rgba(120,210,230,0.05)']]); x.fillRect(-w, y0, w * 2, y1 - y0);
      x.strokeStyle = 'rgba(230,255,255,0.35)'; x.lineWidth = 1; for (let i = 0; i < 6; i++) { const yy = y0 + (y1 - y0) * (i + 0.5) / 6; x.beginPath(); x.moveTo(-w / 2, yy + 8); x.lineTo(w / 2, yy - 6); x.stroke(); }
    }
    // the edges: a bright line down the lit edge, a thin one down the dark edge
    x.restore();
    x.save(); bladePath(x, f, L, w); x.lineWidth = 1.6; x.strokeStyle = css(M.dk, 0.9); x.stroke(); x.restore();
    x.save(); x.beginPath(); x.moveTo(-w / 2 + 2, -4); x.lineTo(-w * (f.blade === 'taper' ? 0.31 : 0.43) + 1.5, -L * 0.86); x.lineTo(0, -L + 3); x.lineWidth = 2.6; x.strokeStyle = css(M.hi, 0.85); x.stroke(); x.restore();
    // steel grain and the odd nick
    x.save(); bladePath(x, f, L, w); x.clip(); speckle(x, -w / 2, -L, w, L, Math.floor(L * w / 50), [255, 255, 255], 0.12, seed); speckle(x, -w / 2, -L, w, L, Math.floor(L * w / 70), [0, 0, 0], 0.16, seed + 9); x.restore();
    if (f.notch) { x.fillStyle = 'rgba(20,16,12,0.9)'; x.beginPath(); x.moveTo(w / 2 + 1, -L * 0.42); x.lineTo(w / 2 - 4, -L * 0.4); x.lineTo(w / 2 + 1, -L * 0.38); x.fill(); }
  }
  function drawShears(x, e, L) { // two spring-steel blades side by side, the bow below the hand
    const M = metal(e.col.blade, e.col.edge);
    for (const s of [-1, 1]) { x.save(); x.translate(s * 9, 0); x.rotate(s * 0.05); x.beginPath(); x.moveTo(-10, 0); x.lineTo(-7, -L * 0.8); x.lineTo(0, -L); x.lineTo(7, -L * 0.75); x.lineTo(10, 0); x.closePath(); x.fillStyle = lin(x, -10, 0, 10, 0, [[0, M.hi], [0.4, M.base], [1, M.dk]]); x.fill(); x.strokeStyle = css(M.dk); x.lineWidth = 1; x.stroke(); x.restore(); }
  }
  function drawGuard(x, f, e) {
    const C = e.col, G = metal(C.guard || [140, 132, 120]), gw = (f.gw || 80) * K * 0.7;
    if (f.guard === 'none') return;
    if (f.guard === 'cross' || f.guard === 'bar') {
      const h = f.guard === 'bar' ? 12 : 15;
      x.save(); if (f.quillons === 'down') { x.beginPath(); x.moveTo(-gw / 2, -h / 2 + 6); x.quadraticCurveTo(0, -h - 4, gw / 2, -h / 2 + 6); x.lineTo(gw / 2, h / 2 + 4); x.quadraticCurveTo(0, h / 2 - 6, -gw / 2, h / 2 + 4); x.closePath(); }
      else rrect(x, -gw / 2, -h / 2, gw, h, 4);
      x.fillStyle = lin(x, 0, -h / 2, 0, h / 2, [[0, G.hi], [0.35, G.lt], [0.7, G.base], [1, G.dk]]); x.fill(); x.lineWidth = 1.2; x.strokeStyle = css(G.dk); x.stroke(); x.restore();
      if (f.guard === 'cross') for (const s of [-1, 1]) { ell(x, s * gw / 2, f.quillons === 'down' ? 6 : 0, 6, 6.5); x.fillStyle = rad(x, s * gw / 2 - 2, -2, 1, 7, [[0, G.hi], [0.6, G.base], [1, G.dk]]); x.fill(); }
      x.fillStyle = css(G.dk, 0.8); ell(x, 0, 0, 7, 4); x.fill();   // the langet over the blade's root
    } else if (f.guard === 'disc' || f.guard === 'ring') {
      const r = gw / 2; ell(x, 0, 0, r, r * 0.34); x.fillStyle = lin(x, -r, 0, r, 0, [[0, G.hi], [0.5, G.base], [1, G.dk]]); x.fill(); x.strokeStyle = css(G.dk); x.lineWidth = 1.2; x.stroke();
      if (f.guard === 'ring') { ell(x, 0, 0, r * 0.55, r * 0.18); x.fillStyle = css(G.dk); x.fill(); }
    } else if (f.guard === 'basket') {
      x.save(); x.lineWidth = 3; x.strokeStyle = css(G.base); for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * 5, -4); x.quadraticCurveTo(gw * 0.55 + i * 3, 30, gw * 0.15, 78); x.stroke(); }
      x.lineWidth = 1; x.strokeStyle = css(G.hi, 0.7); for (let i = -2; i <= 2; i++) { x.beginPath(); x.moveTo(i * 5 - 1, -5); x.quadraticCurveTo(gw * 0.55 + i * 3 - 1, 29, gw * 0.15 - 1, 77); x.stroke(); }
      rrect(x, -gw * 0.35, -7, gw * 0.7, 9, 4); x.fillStyle = lin(x, 0, -7, 0, 2, [[0, G.hi], [1, G.dk]]); x.fill(); x.restore();
    }
  }
  function drawGripAndPommel(x, f, e, gripL) {
    const C = e.col, gc = C.grip || [90, 60, 40], P = metal(C.guard || C.blade || [140, 140, 140]);
    // the grip (mostly under the fingers): wrapped bands
    const gw = 18;
    rrect(x, -gw / 2, 2, gw, gripL, 4); x.fillStyle = lin(x, -gw / 2, 0, gw / 2, 0, [[0, mix(gc, [255, 255, 255], 0.25)], [0.5, gc], [1, mul(gc, 0.5)]]); x.fill();
    x.strokeStyle = css(mul(gc, f.wrap === 'wire' ? 1.6 : 0.55), 0.85); x.lineWidth = 1.2;
    for (let y = 6; y < gripL; y += f.wrap === 'wire' ? 3 : 5) { x.beginPath(); x.moveTo(-gw / 2, y); x.lineTo(gw / 2, y - 3); x.stroke(); }
    const py = gripL + 6;
    if (f.pommel === 'none') return;
    if (f.pommel === 'wheel' || f.pommel === 'disc') { const r = f.pommel === 'wheel' ? 11 : 13; ell(x, 0, py, r, r * (f.pommel === 'wheel' ? 0.9 : 0.55)); x.fillStyle = rad(x, -r * 0.35, py - r * 0.35, 1, r * 1.2, [[0, P.hi], [0.45, P.lt], [0.8, P.base], [1, P.dk]]); x.fill(); x.strokeStyle = css(P.dk); x.lineWidth = 1.2; x.stroke(); if (f.pommel === 'wheel') { ell(x, 0, py, r * 0.45, r * 0.4); x.strokeStyle = css(P.sh); x.stroke(); } }
    else if (f.pommel === 'ball' || f.pommel === 'cap') { const r = f.pommel === 'ball' ? 8 : 9; ell(x, 0, py - 2, r, f.pommel === 'cap' ? r * 0.6 : r); x.fillStyle = rad(x, -3, py - 5, 1, r * 1.1, [[0, P.hi], [0.5, P.base], [1, P.dk]]); x.fill(); }
    else if (f.pommel === 'ring') { ell(x, 0, py + 2, 9, 9); x.lineWidth = 3.4; x.strokeStyle = css(P.base); x.stroke(); x.lineWidth = 1; x.strokeStyle = css(P.hi); x.stroke(); }
  }

  // ---------------------------------------------------------------- hafted weapons (local frame: grip at 0,0; the head up -y)
  function haftCol(f, e) { const g = e.col.grip || [110, 76, 46]; return f.haft === 'red' ? [132, 46, 36] : f.haft === 'pale' ? [196, 172, 128] : f.haft === 'iron' ? [80, 84, 90] : f.haft === 'shell' ? [232, 226, 210] : f.haft === 'bough' ? [62, 60, 52] : g; }
  function drawHaft(x, f, e, top, bot, w, seed) {
    const c = haftCol(f, e);
    if (f.haft === 'bough' || f.haft === 'antler') { // a natural limb: bulges and a twist
      x.beginPath(); x.moveTo(-w / 2, bot); for (let y = bot; y > top; y -= 12) x.lineTo(-w / 2 - Math.sin(y * 0.05) * 2.5 - (hash(y, seed, 1) - 0.5) * 2, y); x.lineTo(w / 2 + 2, top); for (let y = top; y < bot; y += 12) x.lineTo(w / 2 + Math.cos(y * 0.04) * 2 + (hash(seed, y, 2) - 0.5) * 2, y); x.closePath();
    } else rrect(x, -w / 2, top, w, bot - top, w / 2);
    x.fillStyle = lin(x, -w / 2, 0, w / 2, 0, [[0, mix(c, [255, 240, 220], 0.35)], [0.35, c], [1, mul(c, 0.45)]]); x.fill();
    x.save(); x.clip();
    if (f.haft === 'iron') { x.fillStyle = 'rgba(255,255,255,0.35)'; x.fillRect(-w / 2 + 2, top, 1.5, bot - top); }
    else for (let i = 0; i < 9; i++) { const u = (hash(i, seed, 5) - 0.5) * w * 0.7; x.strokeStyle = css(mul(c, 0.6), 0.5); x.lineWidth = 0.8; x.beginPath(); x.moveTo(u, top); x.bezierCurveTo(u + 2, top + (bot - top) * 0.3, u - 2, top + (bot - top) * 0.7, u + 1, bot); x.stroke(); }
    if (f.haft === 'red') for (let y = top + 30; y < bot - 10; y += 26) { x.fillStyle = 'rgba(20,10,8,0.5)'; x.fillRect(-w / 2, y, w, 3); }
    x.restore();
    x.strokeStyle = css(mul(c, 0.3), 0.9); x.lineWidth = 1; rrect(x, -w / 2, top, w, bot - top, w / 2); if (f.haft !== 'bough' && f.haft !== 'antler') x.stroke();
  }
  function drawHead(x, f, e, L, seed) {
    const C = e.col, H = metal(C.head || C.blade, C.edge);
    const fillM = (x0, y0, x1, y1) => { x.fillStyle = lin(x, x0, y0, x1, y1, [[0, H.hi], [0.3, H.lt], [0.65, H.base], [1, H.dk]]); x.fill(); x.lineWidth = 1.2; x.strokeStyle = css(H.dk); x.stroke(); };
    const y = -L;
    switch (f.head) {
      case 'bearded': { // a bearded axe: the blade forward (left), a spike back
        x.beginPath(); x.moveTo(-6, y + 8); x.lineTo(-30, y - 4); x.quadraticCurveTo(-58, y + 14, -52, y + 52); x.quadraticCurveTo(-34, y + 44, -22, y + 66); x.quadraticCurveTo(-14, y + 44, -6, y + 34); x.closePath(); fillM(-58, y, -6, y + 40);
        x.beginPath(); x.moveTo(-52, y + 52); x.quadraticCurveTo(-58, y + 14, -30, y - 4); x.lineWidth = 2; x.strokeStyle = css(H.hi, 0.9); x.stroke();
        if (f.spike) { x.beginPath(); x.moveTo(6, y + 10); x.lineTo(30, y + 18); x.lineTo(6, y + 26); x.closePath(); fillM(6, y + 10, 30, y + 26); }
        rrect(x, -8, y + 2, 16, 36, 4); fillM(-8, y, 8, y + 36);
        if (f.notch) { x.fillStyle = 'rgba(20,14,10,0.9)'; x.beginPath(); x.moveTo(-50, y + 30); x.lineTo(-44, y + 33); x.lineTo(-51, y + 37); x.fill(); }
        break; }
      case 'flanged': { // a flanged bell-bronze head
        for (let i = 0; i < 5; i++) { const a = -0.9 + i * 0.45, ox = Math.sin(a) * 18; x.beginPath(); x.moveTo(ox * 0.3, y + 2); x.lineTo(ox * 1.25, y + 10); x.lineTo(ox * 1.25, y + 40); x.lineTo(ox * 0.3, y + 50); x.closePath(); x.fillStyle = lin(x, ox - 6, 0, ox + 6, 0, [[0, H.hi], [0.5, i < 2 ? H.lt : H.base], [1, H.dk]]); x.fill(); x.strokeStyle = css(H.dk); x.lineWidth = 1; x.stroke(); }
        ell(x, 0, y - 2, 9, 7); fillM(-9, y - 9, 9, y + 5); break; }
      case 'knot': { // the iron-bough's own knot: dark wood, mossed
        ell(x, 0, y + 22, 24, 30); x.fillStyle = rad(x, -8, y + 10, 2, 34, [[0, [96, 98, 84]], [0.6, [58, 60, 52]], [1, [26, 28, 24]]]); x.fill();
        for (let i = 0; i < 20; i++) { const u = hash(i, seed, 6), v = hash(seed, i, 7); ell(x, (u - 0.5) * 34, y + 6 + v * 34, 3, 2); x.fillStyle = css(i % 3 ? [86, 112, 58] : [120, 140, 70], 0.7); x.fill(); }
        break; }
      case 'bell': { // a bell-ringer's hammer: a bell-shaped head across the haft
        x.beginPath(); x.moveTo(-34, y + 4); x.quadraticCurveTo(-30, y - 6, -14, y - 6); x.lineTo(14, y - 6); x.quadraticCurveTo(30, y - 6, 26, y + 4); x.lineTo(24, y + 26); x.lineTo(-30, y + 26); x.closePath(); fillM(-34, y - 6, 26, y + 26);
        ell(x, -34, y + 15, 5, 13); fillM(-39, y, -29, y + 28); break; }
      case 'antler': { // the brow tine left long, the beam worn smooth
        x.beginPath(); x.moveTo(-6, y + 40); x.quadraticCurveTo(-12, y + 10, -40, y - 10); x.quadraticCurveTo(-34, y + 4, -12, y + 28); x.quadraticCurveTo(-4, y + 6, 6, y - 2); x.quadraticCurveTo(6, y + 20, 8, y + 40); x.closePath();
        x.fillStyle = lin(x, -40, y - 10, 8, y + 40, [[0, [246, 238, 216]], [0.5, [214, 198, 166]], [1, [150, 130, 100]]]); x.fill(); x.strokeStyle = 'rgba(90,72,50,0.8)'; x.lineWidth = 1; x.stroke(); break; }
      case 'gauge': case 'sledge': { // a foundry maul with its pressure gauge, or a quarry sledge
        const w2 = f.head === 'gauge' ? 36 : 44; rrect(x, -w2, y - 4, w2 * 2, 40, 6); fillM(-w2, y - 4, w2, y + 36);
        if (f.head === 'gauge') { ell(x, 0, y + 16, 11, 11); x.fillStyle = rad(x, -3, y + 12, 1, 12, [[0, [250, 240, 210]], [1, [196, 160, 80]]]); x.fill(); x.strokeStyle = 'rgba(40,30,20,0.9)'; x.lineWidth = 1.4; x.stroke(); x.beginPath(); x.moveTo(0, y + 16); x.lineTo(6, y + 9); x.stroke(); }
        else { x.fillStyle = 'rgba(60,64,70,0.6)'; x.fillRect(-w2 + 4, y + 2, 6, 28); x.fillRect(w2 - 10, y + 2, 6, 28); }
        break; }
      case 'fork': { // the tuning-fork spear: two bronze tines
        for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 4, y + 36); x.quadraticCurveTo(s * 16, y + 20, s * 10, y - 40); x.lineTo(s * 6, y - 40); x.quadraticCurveTo(s * 10, y + 18, 0, y + 30); x.closePath(); fillM(s * 4, y - 40, s * 16, y + 36); }
        rrect(x, -7, y + 30, 14, 18, 4); fillM(-7, y + 30, 7, y + 48); break; }
      case 'glaive': { // a curved bell-bronze blade
        x.beginPath(); x.moveTo(-4, y + 44); x.quadraticCurveTo(-22, y + 10, -14, y - 52); x.quadraticCurveTo(10, y - 14, 8, y + 44); x.closePath(); fillM(-22, y - 52, 8, y + 44);
        x.beginPath(); x.moveTo(-14, y - 52); x.quadraticCurveTo(-22, y + 10, -4, y + 44); x.strokeStyle = css(H.hi); x.lineWidth = 1.6; x.stroke(); break; }
      case 'crook': { // a shepherd's crook with a horn head
        x.beginPath(); x.arc(-16, y, 16, 0, PI * 1.25, true); x.lineWidth = 10; x.strokeStyle = css([206, 190, 150]); x.stroke(); x.lineWidth = 3; x.strokeStyle = 'rgba(255,250,230,0.6)'; x.beginPath(); x.arc(-16, y, 18, -0.2, PI * 1.1, true); x.stroke(); break; }
      case 'shoe': { // iron at the end of the staff or the pole
        rrect(x, -8, y - 6, 16, 26, 5); fillM(-8, y - 6, 8, y + 20); x.fillStyle = css(H.dk, 0.7); x.fillRect(-8, y + 12, 16, 2); break; }
      case 'cloth': { // the scavengers' cloth-pole (Phase 92): a crossbar at the head and a black cloth hung from it, ragged
        rrect(x, -26, y - 2, 52, 6, 3); fillM(-26, y - 2, 26, y + 4);
        x.beginPath(); x.moveTo(-24, y + 4); x.lineTo(24, y + 4); for (let i = 0; i <= 8; i++) x.lineTo(24 - i * 6, y + 58 + (hash(i, seed, 9) - 0.5) * 14 + Math.sin(i) * 4); x.closePath();
        x.fillStyle = lin(x, -24, y, 24, y, [[0, [30, 28, 34]], [0.5, [14, 13, 17]], [1, [26, 24, 30]]]); x.fill(); x.strokeStyle = 'rgba(70,66,74,0.7)'; x.lineWidth = 1; x.stroke();
        for (let i = 0; i < 5; i++) { x.strokeStyle = 'rgba(0,0,0,0.5)'; x.beginPath(); x.moveTo(-18 + i * 9, y + 8); x.lineTo(-20 + i * 9, y + 46); x.stroke(); }   // its folds
        rrect(x, -6, y - 12, 12, 14, 4); fillM(-6, y - 12, 6, y + 2); break; }
      case 'lever': { // the Brake-Lever (Phase 94): the square socket of an old winch's lever, a collar under it
        rrect(x, -11, y - 22, 22, 26, 3); fillM(-11, y - 22, 11, y + 4);
        x.fillStyle = css(H.dk, 0.95); x.fillRect(-6, y - 17, 12, 12);                    // the socket, square and dark
        rrect(x, -8, y + 4, 16, 8, 2); fillM(-8, y + 4, 8, y + 12);
        x.fillStyle = css(H.hi, 0.7); x.fillRect(-10, y - 21, 2, 22); break; }
      case 'firecage': { // the Dark Stave (Phase 95): a Flambeau's fire-stave, its cage of four iron bars, the amber lump in it cold
        rrect(x, -13, y - 30, 26, 4, 2); fillM(-13, y - 30, 13, y - 26); rrect(x, -13, y + 2, 26, 5, 2); fillM(-13, y + 2, 13, y + 7);
        for (const bx of [-12, -5, 2, 9]) { x.fillStyle = css(H.dk, 0.95); x.fillRect(bx, y - 28, 3, 32); x.fillStyle = css(H.hi, 0.5); x.fillRect(bx, y - 28, 1, 32); }
        x.fillStyle = 'rgb(96,72,34)'; x.fillRect(-6, y - 14, 12, 14); x.fillStyle = 'rgb(134,104,52)'; x.fillRect(-4, y - 12, 4, 6);   // the lump, unlit
        rrect(x, -6, y + 7, 12, 8, 2); fillM(-6, y + 7, 6, y + 15); break; }
      case 'ridgeflint': { // the Ridge-Flint (Phase 91 question 4): a ragged ridge of black flint that grew its own edge, standing out of white shell
        x.beginPath(); x.moveTo(-13, y + 30); x.lineTo(-17, y + 6); x.lineTo(-10, y - 8); x.lineTo(-13, y - 24); x.lineTo(-5, y - 40); x.lineTo(1, y - 30); x.lineTo(6, y - 46); x.lineTo(12, y - 28); x.lineTo(9, y - 10); x.lineTo(15, y + 4); x.lineTo(12, y + 30); x.closePath(); fillM(-17, y - 46, 15, y + 30);
        x.save(); x.clip(); x.lineWidth = 1;
        for (let k = 0; k < 7; k++) { x.strokeStyle = k % 3 ? 'rgba(0,0,0,0.45)' : 'rgba(170,174,190,0.5)'; x.beginPath(); x.arc(-18 + hash(k, seed, 1) * 10, y + 30 - k * 11, 14 + hash(k, seed, 2) * 12, -0.9, 0.5); x.stroke(); }   // the flake scars
        x.restore();
        x.beginPath(); x.moveTo(-13, y + 30); x.lineTo(-17, y + 6); x.lineTo(-10, y - 8); x.lineTo(-13, y - 24); x.lineTo(-5, y - 40); x.lineWidth = 1.6; x.strokeStyle = css(H.hi, 0.9); x.stroke();                             // the edge in the light
        ell(x, 0, y + 34, 19, 12); x.fillStyle = lin(x, -19, y + 22, 19, y + 46, [[0, 'rgb(250,246,236)'], [0.5, 'rgb(230,224,208)'], [1, 'rgb(164,156,138)']]); x.fill(); x.lineWidth = 1; x.strokeStyle = 'rgba(96,90,76,0.9)'; x.stroke();
        x.save(); x.clip(); speckle(x, -19, y + 22, 38, 24, 40, [90, 84, 70], 0.3, seed + 3); x.restore(); break; }
      case 'beamkey': { // the Beam-Key (Phase 91 question 4): an engine-man's key, an open jaw on a flat iron shank, the jaw's faces worn bright
        x.beginPath(); x.moveTo(-17, y + 22); x.lineTo(-19, y - 2); x.lineTo(-13, y - 16); x.lineTo(-6, y - 16); x.lineTo(-6, y + 2); x.lineTo(6, y + 2); x.lineTo(6, y - 16); x.lineTo(13, y - 16); x.lineTo(19, y - 2); x.lineTo(17, y + 22); x.lineTo(7, y + 34); x.lineTo(-7, y + 34); x.closePath(); fillM(-19, y - 16, 19, y + 34);
        x.fillStyle = css(mix(H.hi, [255, 255, 255], 0.4)); x.fillRect(-7.5, y - 15, 2, 17); x.fillRect(5.5, y - 15, 2, 17); x.fillRect(-6, y + 0.6, 12, 1.8);   // the jaw
        x.fillStyle = 'rgba(0,0,0,0.35)'; x.fillRect(-5.5, y - 16, 11, 16);
        for (let k = 0; k < 3; k++) { x.fillStyle = 'rgba(20,22,26,0.55)'; x.fillRect(-9 + k * 7, y + 12, 4, 1.4); }                                       // the maker's stamp, worn
        rrect(x, -6, y + 30, 12, 20, 2); fillM(-6, y + 30, 6, y + 50); break; }
      case 'kegmallet': { // the Magazine Mallet (Phase 100): a barrel of copper across an ash handle, the striking faces green, no iron anywhere
        rrect(x, -27, y - 13, 54, 28, 7); fillM(-27, y - 13, 27, y + 15);
        x.fillStyle = 'rgba(96,170,136,0.55)'; rrect(x, -27, y - 13, 9, 28, 5); x.fill(); rrect(x, 18, y - 13, 9, 28, 5); x.fill();   // verdigris on the faces
        x.fillStyle = 'rgba(0,0,0,0.3)'; x.fillRect(-17.5, y - 13, 1.4, 28); x.fillRect(16.1, y - 13, 1.4, 28);
        x.fillStyle = css(H.hi, 0.7); x.fillRect(-16, y - 10, 32, 1.6);
        x.fillStyle = 'rgba(40,24,14,0.6)'; ell(x, 0, y + 1, 5, 7); x.fill();                                                           // the handle's eye, wedged with oak
        break; }
      case 'sprag': { // Carter's Sprag (Phase 113): a billet of ash, squared and tapering to a wedge, shod with iron at the striking end; polished where a hand carries it
        x.beginPath(); x.moveTo(-14, y + 46); x.lineTo(-17, y - 8); x.lineTo(-13, y - 30); x.lineTo(13, y - 30); x.lineTo(17, y - 8); x.lineTo(14, y + 46); x.closePath();
        x.fillStyle = lin(x, -17, 0, 17, 0, [[0, [214, 190, 150]], [0.35, [186, 158, 116]], [0.75, [140, 112, 76]], [1, [92, 70, 46]]]); x.fill(); x.lineWidth = 1.2; x.strokeStyle = 'rgba(60,42,26,0.9)'; x.stroke();
        x.save(); x.clip(); for (let k = 0; k < 7; k++) { x.strokeStyle = 'rgba(96,70,40,0.45)'; x.lineWidth = 0.8; const u = -12 + k * 4 + (hash(k, seed, 3) - 0.5) * 2; x.beginPath(); x.moveTo(u, y - 30); x.bezierCurveTo(u + 2, y - 4, u - 2, y + 20, u + 1, y + 46); x.stroke(); }
        x.fillStyle = 'rgba(255,244,220,0.28)'; x.fillRect(-9, y + 8, 6, 38); x.restore();                                              // polished where the hand goes
        rrect(x, -14, y - 34, 28, 12, 2); fillM(-14, y - 34, 14, y - 22);                                                                  // the iron shoe
        x.fillStyle = css(H.dk, 0.8); x.fillRect(-14, y - 23, 28, 1.6); for (const sx of [-9, 0, 9]) { x.fillStyle = css(H.hi, 0.9); x.fillRect(sx - 1, y - 30, 2, 2); }   // its nails
        x.fillStyle = 'rgba(30,22,14,0.55)'; x.fillRect(-13, y - 2, 26, 1.4); x.fillRect(-13, y + 4, 26, 1);                             // where a wheel has bitten it
        break; }
      case 'tallyhook': { // the Tallyman's Hook (Phase 97): a flat crook of iron, no spike; a rag of black cloth knotted under it; tally-notches down the pole
        rrect(x, -3, y - 4, 6, 26, 2); fillM(-3, y - 4, 3, y + 22);
        x.beginPath(); x.moveTo(0, y - 2); x.quadraticCurveTo(-2, y - 30, -18, y - 26); x.quadraticCurveTo(-26, y - 22, -22, y - 10); x.lineWidth = 6; x.strokeStyle = css(H.base); x.stroke(); x.lineWidth = 1.5; x.strokeStyle = css(H.hi); x.stroke();
        x.fillStyle = 'rgb(10,10,13)'; x.beginPath(); x.moveTo(-7, y + 20); x.lineTo(7, y + 20); x.lineTo(11, y + 46); x.lineTo(3, y + 40); x.lineTo(-2, y + 50); x.lineTo(-9, y + 42); x.closePath(); x.fill();   // the rag
        x.fillStyle = 'rgba(40,38,44,0.9)'; x.fillRect(-7, y + 20, 14, 5);
        for (let k = 0; k < 5; k++) { x.fillStyle = 'rgba(196,184,160,0.85)'; x.fillRect(-4, y + 60 + k * 7, 8, 1.5); } break; }
      case 'boathook': { // a boat-hook: spike and a hook back
        x.beginPath(); x.moveTo(-3, y + 20); x.lineTo(0, y - 26); x.lineTo(3, y + 20); x.closePath(); fillM(-3, y - 26, 3, y + 20);
        x.beginPath(); x.moveTo(2, y + 4); x.quadraticCurveTo(26, y - 2, 20, y - 20); x.lineWidth = 5; x.strokeStyle = css(H.base); x.stroke(); x.lineWidth = 1.4; x.strokeStyle = css(H.hi); x.stroke();
        rrect(x, -7, y + 16, 14, 18, 4); fillM(-7, y + 16, 7, y + 34); break; }
      case 'nightsledge': { // the Night-Shift Sledge: a stone-splitter's head (a flat face, a wedge peen), chalk tallies on it,
        // a red rag knotted at the neck, a brass Consortium tag nailed to the haft
        x.beginPath(); x.moveTo(-26, y - 2); x.lineTo(10, y - 4); x.lineTo(30, y + 9); x.lineTo(10, y + 22); x.lineTo(-26, y + 20); x.closePath(); fillM(-26, y - 4, 30, y + 22);
        x.fillStyle = css(H.dk, 0.8); x.fillRect(-27, y - 2, 4, 22);                     // the striking face, battered dark
        x.fillStyle = 'rgba(236,232,220,0.85)'; for (let i = 0; i < 4; i++) x.fillRect(-16 + i * 5, y + 3, 1.6, 9); x.fillRect(-17, y + 7, 18, 1.4);   // four tallies and a stroke
        x.strokeStyle = css(H.hi, 0.8); x.lineWidth = 1.2; x.beginPath(); x.moveTo(10, y - 3); x.lineTo(29, y + 9); x.stroke();   // the peen's edge
        x.beginPath(); x.moveTo(-7, y + 22); x.quadraticCurveTo(-12, y + 34, -6, y + 40); x.lineTo(6, y + 38); x.quadraticCurveTo(10, y + 30, 6, y + 22); x.closePath(); x.fillStyle = lin(x, -8, 0, 8, 0, [[0, [196, 70, 52]], [1, [110, 30, 22]]]); x.fill();   // the rag
        x.beginPath(); x.moveTo(-6, y + 38); x.lineTo(-14, y + 50); x.lineTo(-8, y + 49); x.closePath(); x.fill();
        rrect(x, -6, y + 56, 12, 9, 1.5); x.fillStyle = lin(x, -6, 0, 6, 0, [[0, [236, 206, 120]], [1, [150, 112, 40]]]); x.fill(); x.fillStyle = 'rgba(60,40,10,0.8)'; x.fillRect(-3, y + 59, 6, 1); x.fillRect(-3, y + 62, 4, 1);   // the tag and its number
        break; }
      default: break;
    }
    x.save(); x.globalCompositeOperation = 'source-atop'; speckle(x, -60, y - 60, 120, 120, 120, [0, 0, 0], 0.18, seed); x.restore();
  }

  // ---------------------------------------------------------------- the hand round the grip (local frame, grip vertical)
  // the glass arm's planes (approved 14 Nov: "azure facets with dark seams and a few bright edges"): a hashed mesh of
  // triangles over whatever is clipped, each plane its own tone, lit from the left; nothing here is chance
  function glassFacets(x, a, b, w, h, cell, seed) {
    const cols = Math.ceil(w / cell) + 3, rows = Math.ceil(h / cell) + 3, P = [];
    for (let j = 0; j < rows; j++) { const row = []; for (let i = 0; i < cols; i++) row.push([a + (i - 1 + ((j & 1) ? 0.5 : 0) + (hash(i, j, seed) - 0.5) * 0.7) * cell, b + (j - 1 + (hash(i, j, seed + 3) - 0.5) * 0.7) * cell]); P.push(row); }
    let n = 0;
    const tri = (p, q, r) => { n++; const t = hash(n, seed, 11), side = 1 - Math.max(0, Math.min(1, ((p[0] + q[0] + r[0]) / 3 - a) / Math.max(1, w))), v = t * 0.8 + side * 0.28;
      x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.lineTo(r[0], r[1]); x.closePath();
      x.fillStyle = v > 0.93 ? 'rgba(176,226,250,0.5)' : v > 0.76 ? 'rgba(96,182,238,0.3)' : v > 0.56 ? 'rgba(62,150,214,0.05)' : v > 0.32 ? 'rgba(18,66,140,0.42)' : 'rgba(8,36,96,0.62)'; x.fill();
      x.lineWidth = 0.7; x.strokeStyle = 'rgba(8,30,66,0.34)'; x.stroke();
      if (hash(n, seed, 12) > 0.6) { x.beginPath(); x.moveTo(p[0], p[1]); x.lineTo(q[0], q[1]); x.lineWidth = 0.9; x.strokeStyle = 'rgba(204,238,255,0.55)'; x.stroke(); } };   // one bright edge, never a whole outline
    for (let j = 0; j < rows - 1; j++) for (let i = 0; i < cols - 1; i++) { const p00 = P[j][i], p10 = P[j][i + 1], p01 = P[j + 1][i], p11 = P[j + 1][i + 1]; if ((i + j) & 1) { tri(p00, p10, p11); tri(p00, p11, p01); } else { tri(p00, p10, p01); tri(p10, p11, p01); } }
  }
  // the current path, filled already, takes the glass's planes
  function glassOver(x, path, a, b, w, h, cell, seed, rim) { path(); x.save(); x.clip(); glassFacets(x, a, b, w, h, cell, seed); x.restore(); path(); x.lineWidth = rim || 1.4; x.strokeStyle = 'rgba(164,228,255,0.95)'; x.stroke(); }   // and a bright edge
  const GLASS_HL = { kind: 'glass', base: [52, 140, 212], lt: [128, 204, 244], sh: [22, 78, 152], dk: [10, 36, 76] };
  function handLook(look, side) {
    const H = look && look.hands, glass = side === 'left' && look && look.glassArm;
    if (glass) return GLASS_HL;
    if (!H || H.bare) { const s = (look && look.skin) || [214, 170, 136]; return { kind: 'skin', base: s, lt: mix(s, [255, 236, 220], 0.35), sh: mul(s, 0.72), dk: mul(s, 0.45) }; }
    const c = H.col || { base: [112, 74, 46], shade: [74, 46, 28], light: [150, 106, 70] };
    // Phase 87: fingerless kid and the barrow's coils leave the fingers bare (the coils and cuffs show on the forearm)
    if (H.form === 'cuffs' || H.form === 'coils') { const s = (look && look.skin) || [214, 170, 136]; return { kind: 'skin', base: s, lt: mix(s, [255, 236, 220], 0.35), sh: mul(s, 0.72), dk: mul(s, 0.45), cuff: H.col.base, form: H.form }; }
    const kind = H.form === 'coils' || H.form === 'vambrace' ? 'mail' : H.shape === 'gauntlets' || H.material === 'mail' || H.material === 'iron' || H.material === 'bellbronze' ? 'mail' : 'leather';
    return { kind, base: c.base, lt: c.light, sh: c.shade, dk: c.dark || mul(c.shade, 0.6), trim: c.trim };
  }
  function drawFist(x, hl, seed, mirror) {
    // drawn in a 60-pixel frame and scaled up: fingers to the front (left), the back of the hand to the right
    const S = mirror ? -1 : 1, Z = 1.85;
    x.save(); x.scale(S * Z, Z);
    const back = () => { x.beginPath(); x.moveTo(-6, -31); x.bezierCurveTo(18, -38, 40, -28, 42, -6); x.bezierCurveTo(44, 16, 38, 34, 26, 42); x.lineTo(-2, 44); x.closePath(); };
    // the back of the hand
    back(); x.fillStyle = lin(x, -4, -34, 40, 40, [[0, hl.lt], [0.45, hl.base], [1, hl.dk]]); x.fill(); x.lineWidth = 1.1; x.strokeStyle = css(hl.dk, 0.9); x.stroke();
    if (hl.kind === 'glass') glassOver(x, back, -8, -40, 54, 88, 17, seed + 20);
    // the palm's shadow where the fingers meet the grip
    x.fillStyle = lin(x, -6, 0, 6, 0, [[0, css(hl.dk, 0)], [1, css(hl.dk, 0.55)]]); x.fillRect(-6, -30, 10, 72);
    // four fingers wrapped round the grip, overlapping, the index on top; the tips curl back under
    for (let i = 3; i >= 0; i--) {
      const fy = -21 + i * 14.2, fw = 34 - i * 2.5, fh = 8.6 - i * 0.5;
      const fing = () => { x.beginPath(); x.moveTo(2, fy - fh); x.bezierCurveTo(-fw * 0.5, fy - fh * 1.25, -fw, fy - fh * 0.9, -fw, fy); x.bezierCurveTo(-fw, fy + fh * 0.95, -fw * 0.5, fy + fh * 1.15, 2, fy + fh); x.closePath(); }; fing();
      x.fillStyle = lin(x, -fw, fy - fh, -fw * 0.2, fy + fh, [[0, hl.lt], [0.4, hl.base], [1, hl.sh]]); x.fill(); x.lineWidth = 1; x.strokeStyle = css(hl.dk, 0.75); x.stroke();
      if (hl.kind === 'glass') glassOver(x, fing, -fw - 2, fy - fh * 1.3, fw + 6, fh * 2.6, 11, seed + 30 + i);
      x.fillStyle = css(mix(hl.lt, [255, 255, 255], 0.2), 0.55); ell(x, -fw * 0.72, fy - fh * 0.45, fw * 0.14, fh * 0.28); x.fill();   // the knuckle in the light
      x.strokeStyle = css(hl.dk, 0.45); x.lineWidth = 0.8; x.beginPath(); x.moveTo(-fw * 0.38, fy - fh * 0.9); x.quadraticCurveTo(-fw * 0.42, fy, -fw * 0.36, fy + fh * 0.9); x.stroke();   // the joint
      if (hl.kind === 'mail') { x.beginPath(); x.moveTo(-fw * 0.98, fy - fh * 0.7); x.lineTo(-fw * 0.5, fy - fh * 0.85); x.lineTo(-fw * 0.5, fy + fh * 0.85); x.lineTo(-fw * 0.98, fy + fh * 0.7); x.closePath(); x.fillStyle = lin(x, 0, fy - fh, 0, fy + fh, [[0, mix(hl.lt, [255, 255, 255], 0.45)], [0.5, hl.base], [1, hl.dk]]); x.fill(); x.strokeStyle = css(hl.dk); x.stroke(); }
    }
    // the thumb, down over the index finger
    const thumb = () => { x.beginPath(); x.moveTo(10, -32); x.bezierCurveTo(-4, -40, -22, -38, -30, -27); x.bezierCurveTo(-33, -22, -29, -17, -24, -18); x.bezierCurveTo(-12, -22, 0, -20, 8, -14); x.closePath(); }; thumb();
    x.fillStyle = lin(x, -30, -40, 8, -14, [[0, mix(hl.lt, [255, 255, 255], 0.18)], [0.55, hl.base], [1, hl.sh]]); x.fill(); x.lineWidth = 1.1; x.strokeStyle = css(hl.dk, 0.85); x.stroke();
    if (hl.kind === 'glass') glassOver(x, thumb, -34, -42, 46, 30, 12, seed + 40);
    ell(x, -25, -27, 4.5, 2.6, -0.4); x.fillStyle = css(hl.lt, 0.6); x.fill();
    // materials
    if (hl.kind === 'leather') { // seams, stitching, a little wear on the knuckles
      x.strokeStyle = css(hl.dk, 0.65); x.lineWidth = 0.8; x.setLineDash([1.6, 1.6]); x.beginPath(); x.moveTo(8, -30); x.bezierCurveTo(30, -30, 38, -14, 38, 8); x.stroke(); x.beginPath(); x.moveTo(14, -16); x.lineTo(30, 30); x.stroke(); x.setLineDash([]);
      x.save(); back(); x.clip(); speckle(x, -6, -38, 50, 84, 120, [0, 0, 0], 0.12, seed); speckle(x, -6, -38, 50, 84, 50, [255, 240, 220], 0.1, seed + 1); x.restore();
    } else if (hl.kind === 'mail') { // mail rings on the back of the hand
      x.save(); back(); x.clip();
      for (let yy = -38; yy < 46; yy += 3.4) for (let xx = -6 + ((Math.round(yy / 3.4)) & 1) * 1.7; xx < 46; xx += 3.4) { ell(x, xx, yy, 1.5, 1.2); x.strokeStyle = css(hl.dk, 0.5); x.lineWidth = 0.6; x.stroke(); x.fillStyle = css(mix(hl.lt, [255, 255, 255], 0.3), 0.35); x.fillRect(xx - 0.8, yy - 1, 0.8, 0.8); }
      x.restore();
    } else if (hl.kind === 'glass') { // its planes are laid on each part as it is drawn (glassOver)
    } else { // skin: the tendons on the back of the hand
      x.strokeStyle = css(hl.sh, 0.45); x.lineWidth = 0.9; for (let i = 0; i < 3; i++) { x.beginPath(); x.moveTo(8 + i * 8, -24); x.quadraticCurveTo(12 + i * 9, 0, 14 + i * 9, 28); x.stroke(); }
    }
    x.restore();
  }
  // the wrist, the cuff and the sleeve, from the hand out of the bottom of the view (canvas frame)
  function drawForearm(x, look, hl, wx, wy, ex, ey, wid0, wid1, seed, mirror) {
    const dx = ex - wx, dy = ey - wy, L = Math.hypot(dx, dy), ux = dx / L, uy = dy / L, nx = -uy, ny = ux;
    const B = look && look.body, sl = (B && B.sleeve) || {}, bareArm = sl.material === 'skin', rolled = !!sl.rolled && !bareArm, scol = bareArm ? ((look && look.skin) || [200, 160, 130]) : sl.col || (B && B.col && B.col.base) || [120, 100, 80];   // Phase 87: the hide tunic leaves the arms bare
    const glass = hl.kind === 'glass';
    const quad = (t0, t1, w0, w1) => { const a = [wx + ux * t0, wy + uy * t0], b = [wx + ux * t1, wy + uy * t1]; x.beginPath(); x.moveTo(a[0] + nx * w0, a[1] + ny * w0); x.lineTo(b[0] + nx * w1, b[1] + ny * w1); x.lineTo(b[0] - nx * w1, b[1] - ny * w1); x.lineTo(a[0] - nx * w0, a[1] - ny * w0); x.closePath(); };
    const across = (c) => lin(x, wx + nx * wid1, wy + ny * wid1, wx - nx * wid1, wy - ny * wid1, mirror ? [[0, mul(c, 0.5)], [0.6, c], [1, mix(c, [255, 240, 220], 0.3)]] : [[0, mix(c, [255, 240, 220], 0.3)], [0.4, c], [1, mul(c, 0.5)]]);
    // the forearm itself (glove, skin or glass) up to the cuff
    const armC = glass || (look && look.hands && !look.hands.bare) ? hl.base : ((look && look.skin) || hl.base);
    quad(-4, L * 0.32, wid0, wid0 * 1.12); x.fillStyle = across(glass ? mix(armC, hl.sh, 0.3) : armC); x.fill();
    const gb = glass ? [Math.min(wx, ex) - wid1 - 24, Math.min(wy, ey) - wid1 - 24, Math.abs(dx) + wid1 * 2 + 48, Math.abs(dy) + wid1 * 2 + 48] : null;
    if (glass) glassOver(x, () => quad(-4, L * 0.32, wid0, wid0 * 1.12), gb[0], gb[1], gb[2], gb[3], 44, seed + 50, 3);
    // a glove's cuff: flared, its edge stitched or riveted
    if (!glass && look && look.hands && !look.hands.bare) {
      const cc = hl.cuff || hl.base, cd = hl.cuff ? mul(hl.cuff, 0.5) : hl.dk;   // Phase 87: fingerless kid and the barrow's coils show their own colour here
      quad(L * 0.2, L * 0.36, wid0 * 1.16, wid0 * 1.32); x.fillStyle = across(mix(cc, cd, 0.2)); x.fill(); x.lineWidth = 1.3; x.strokeStyle = css(cd); x.stroke();
      if (hl.form === 'coils') for (let i = 0; i < 5; i++) { const t = L * (0.215 + i * 0.03); quad(t, t + L * 0.008, wid0 * (1.17 + i * 0.03), wid0 * (1.18 + i * 0.03)); x.fillStyle = css(i % 3 === 0 ? [92, 138, 112] : cd, 0.9); x.fill(); }
      if (hl.trim && hl.kind === 'mail') { quad(L * 0.33, L * 0.36, wid0 * 1.3, wid0 * 1.33); x.fillStyle = css(hl.trim); x.fill(); }
    }
    // the sleeve
    if (glass) { quad(L * 0.3, L + 20, wid0 * 1.1, wid1); x.fillStyle = across(mix(hl.base, hl.sh, 0.3)); x.fill(); glassOver(x, () => quad(L * 0.3, L + 20, wid0 * 1.1, wid1), gb[0], gb[1], gb[2], gb[3], 50, seed + 51, 3); return; }
    if (rolled) { quad(L * 0.36, L * 0.6, wid0 * 1.15, wid0 * 1.3); x.fillStyle = across((look && look.skin) || hl.base); x.fill(); quad(L * 0.58, L * 0.72, wid0 * 1.4, wid0 * 1.5); x.fillStyle = across(scol); x.fill(); x.strokeStyle = css(mul(scol, 0.5)); x.lineWidth = 1; x.stroke(); quad(L * 0.72, L + 20, wid0 * 1.5, wid1); x.fillStyle = across(scol); x.fill(); return; }
    quad(L * 0.34, L + 20, wid0 * 1.3, wid1); x.fillStyle = across(scol); x.fill();
    x.save(); x.clip();
    if (sl.material === 'mail') for (let t = L * 0.36; t < L + 20; t += 4) for (let s = -wid1; s < wid1; s += 4) { const px = wx + ux * t + nx * (s + ((t / 4) & 1) * 2), py = wy + uy * t + ny * (s + ((t / 4) & 1) * 2); ell(x, px, py, 1.7, 1.3); x.strokeStyle = css(mul(scol, 0.5), 0.6); x.lineWidth = 0.7; x.stroke(); }
    else { for (let i = 0; i < 5; i++) { const t = L * (0.42 + i * 0.12); x.beginPath(); x.moveTo(wx + ux * t + nx * wid1, wy + uy * t + ny * wid1); x.quadraticCurveTo(wx + ux * (t + 10), wy + uy * (t + 10), wx + ux * t - nx * wid1, wy + uy * t - ny * wid1); x.strokeStyle = css(mul(scol, 0.62), 0.55); x.lineWidth = 1.4; x.stroke(); } speckle(x, Math.min(wx, ex) - wid1, Math.min(wy, ey) - wid1, Math.abs(dx) + wid1 * 2, Math.abs(dy) + wid1 * 2, 260, [0, 0, 0], 0.08, seed + 3); }
    x.restore();
    if (sl.cuff) { quad(L * 0.34, L * 0.4, wid0 * 1.32, wid0 * 1.36); x.fillStyle = across(sl.cuff); x.fill(); }
  }

  // ---------------------------------------------------------------- one painting
  const cache = new Map();
  // Phase 110: paint(wid, look, { noHands: true }) and paintHands(look, pose, { noHands: true }) paint the picture
  // WITHOUT the hands, the forearms and the sleeves, and say where each hand would be instead: `grips`, a list of
  // { side, mirror, m, arm } where m = [a, b, c, d, e, f] is the canvas transform of the hand's own frame (the grip at its
  // origin, the business end up -y; for a raised fist the fist's frame, for an open hand the open hand's) and arm = [wx, wy, ex, ey] the forearm's line as drawForearm would have drawn it. js/pixelhands110.js
  // draws its own hands there. Without the option nothing here changes: the same pictures, byte for byte, the same cache.
  const gripAt = (x, side, mirror, ox, oy, arm) => { x.save(); if (ox || oy) x.translate(ox || 0, oy || 0); const t = x.getTransform(); x.restore(); return { side, mirror: !!mirror, m: [t.a, t.b, t.c, t.d, t.e, t.f], arm }; };
  // ---------------------------------------------------------------- Phase 87 (d): the ranged weapons, each its own
  // One-handed (the pistol, the slings, the Works hand-crossbow): held up in the right hand like a blade, the business end
  // to the upper left. Two-handed (the crossbow, the Office carbine, the harpoon gun, the hornbow): held out in front, seen
  // from behind, both hands from below; their pictures are centred where the old crossbow's was.
  const RANGED_KINDS = { pistol: 1, crossbow: 1, sling: 1, carbine: 1, handbow: 1, harpoon: 1, bow: 1 };
  const CENTRED = { crossbow: 1, carbine: 1, harpoon: 1, bow: 1 };
  function wood(x, c, a, b, w, h, r, seed) {   // a stock or a grip: lit from the left, grain lines along it
    rrect(x, a, b, w, h, r); x.fillStyle = lin(x, a, 0, a + w, 0, [[0, mix(c, [255, 236, 210], 0.3)], [0.4, c], [1, mul(c, 0.45)]]); x.fill();
    x.save(); x.clip(); for (let i = 0; i < 7; i++) { const u = a + hash(i, seed, 3) * w; x.strokeStyle = css(mul(c, 0.55), 0.45); x.lineWidth = 0.8; x.beginPath(); x.moveTo(u, b); x.bezierCurveTo(u + 3, b + h * 0.3, u - 3, b + h * 0.7, u + 1, b + h); x.stroke(); } x.restore();
    x.strokeStyle = css(mul(c, 0.3)); x.lineWidth = 1; rrect(x, a, b, w, h, r); x.stroke();
  }
  function iron(x, c, a, b, w, h, r, edge) {   // a barrel, a lock-plate, a band: a lit stripe down its left third
    const m = metal(c, edge); rrect(x, a, b, w, h, r);
    x.fillStyle = lin(x, a, 0, a + w, 0, [[0, m.sh], [0.22, m.hi], [0.38, m.lt], [0.7, m.base], [1, m.dk]]); x.fill();
    x.strokeStyle = css(m.dk); x.lineWidth = 1; x.stroke();
  }
  function band(x, c, a, b, w, h) { iron(x, c, a, b, w, h, 1.5); }
  function cord(x, pts, col, wid) {   // a cord or a string: a dark line under a lit one
    x.lineCap = 'round'; x.lineJoin = 'round';
    for (const [k, lw] of [[0.45, wid + 1.6], [1, wid], [1.35, wid * 0.4]]) { x.strokeStyle = css(mul(col, k)); x.lineWidth = lw; x.beginPath(); x.moveTo(pts[0], pts[1]); if (pts.length === 8) x.bezierCurveTo(pts[2], pts[3], pts[4], pts[5], pts[6], pts[7]); else for (let i = 2; i < pts.length; i += 2) x.lineTo(pts[i], pts[i + 1]); x.stroke(); }
  }
  function glowDot(x, cx, cy, r, col) { x.fillStyle = rad(x, cx, cy, 0, r * 2.4, [[0, css(col, 0.9)], [0.4, css(col, 0.35)], [1, css(col, 0)]]); x.fillRect(cx - r * 2.4, cy - r * 2.4, r * 4.8, r * 4.8); ell(x, cx, cy, r, r); x.fillStyle = css(mix(col, [255, 255, 255], 0.45)); x.fill(); }
  // one-handed: local frame, the grip at (0,0) under the fist, the weapon up -y
  function drawOneRanged(x, wid, e, L, seed) {
    const c = e.col || {}, g = c.grip || [104, 66, 40], b = c.blade || [70, 66, 64], br = c.guard || [190, 156, 84];
    if (e.kind === 'pistol') {
      wood(x, g, -18, -40, 36, 130, 12, seed); band(x, br, -20, 82, 40, 12);                     // the walnut grip, a brass butt-cap
      wood(x, g, -19, -L * 0.72, 38, L * 0.72 - 20, 10, seed + 1);                                // the forestock under the barrel
      iron(x, b, -14, -L, 28, L - 40, 6); band(x, br, -20, -L * 0.62, 40, 11); band(x, br, -20, -L + 14, 40, 13);   // the barrel and its bands
      iron(x, [96, 98, 102], -24, -88, 48, 44, 5); band(x, br, 18, -112, 12, 34); ell(x, 24, -114, 9, 7); x.fillStyle = css(br); x.fill();   // the lock, the brass striker
      ell(x, -10, 20, 18, 22); x.lineWidth = 4; x.strokeStyle = css(mul(br, 0.8)); x.stroke();      // the trigger guard
      glowDot(x, 0, -L - 4, 7, c.edge || [180, 236, 244]);                                        // a glass pellet at the muzzle
      return;
    }
    if (e.kind === 'sling') {
      // two cords from the fist up to the pouch, mid-whirl, a stone in it: felted Hedge wool or plaited Farrant fleece
      const felt = wid === 'p87_feltsling', cc = c.grip || [60, 86, 80], pc = c.blade || [60, 86, 80], st = c.edge || [150, 146, 140];
      const px = -L * 0.55, py = -L * 0.95;
      cord(x, [-4, -40, -40, -L * 0.45, px + 30, py + 60, px + 18, py + 10], cc, 4.6);
      cord(x, [6, -40, 10, -L * 0.5, px + 60, py + 40, px + 44, py + 22], cc, 4.6);
      if (!felt) for (let i = 0; i < 9; i++) { const t = i / 9; x.fillStyle = css(mul(cc, 0.6)); x.fillRect(-4 + (px + 18 + 4) * t * t - 1, -40 + (py + 10 + 40) * t - 1, 2, 2); }   // the plait
      ell(x, px + 30, py + 14, 44, 26, -0.5); x.fillStyle = lin(x, px, py, px + 60, py + 34, [[0, mix(pc, [255, 240, 220], 0.3)], [0.5, pc], [1, mul(pc, 0.5)]]); x.fill();
      x.strokeStyle = css(mul(pc, 0.35)); x.lineWidth = 1.2; x.stroke();
      ell(x, px + 26, py + 6, 19, 16, 0); x.fillStyle = rad(x, px + 20, py, 2, 18, [[0, mix(st, [255, 255, 255], 0.4)], [0.6, st], [1, mul(st, 0.45)]]); x.fill();
      if (felt) speckle(x, px, py - 4, 60, 34, 40, mul(pc, 0.7), 0.6, seed); else { x.strokeStyle = css(mul(pc, 0.4), 0.7); x.beginPath(); x.moveTo(px + 6, py + 20); x.lineTo(px + 54, py + 8); x.stroke(); }
      return;
    }
    if (e.kind === 'handbow') {
      // the Works hand-crossbow: a short stock, a steel prod across the top, a quarrel in the groove, a brass tag
      wood(x, g, -14, -L, 28, L + 90, 8, seed);
      const py = -L + 34, pw = 120;
      x.save(); x.translate(0, py);
      x.beginPath(); x.moveTo(-pw, 26); x.quadraticCurveTo(-pw * 0.5, -10, 0, -6); x.quadraticCurveTo(pw * 0.5, -10, pw, 26); x.lineWidth = 15; x.strokeStyle = css(mul(b, 0.5)); x.stroke(); x.lineWidth = 11; x.strokeStyle = css(b); x.stroke(); x.lineWidth = 2.5; x.strokeStyle = css(mix(b, [255, 255, 255], 0.5)); x.stroke();
      cord(x, [-pw, 26, 0, 74, pw, 26], [210, 200, 170], 1.4);
      x.restore();
      iron(x, [150, 154, 158], -3, -L - 34, 6, 120, 2); x.beginPath(); x.moveTo(-8, -L - 30); x.lineTo(0, -L - 50); x.lineTo(8, -L - 30); x.closePath(); x.fillStyle = css([200, 204, 206]); x.fill();
      band(x, br, -17, -L + 70, 34, 10);
      ell(x, 22, -L + 96, 9, 12); x.fillStyle = lin(x, 14, 0, 30, 0, [[0, mix(c.head || br, [255, 255, 255], 0.4)], [1, mul(c.head || br, 0.6)]]); x.fill();   // the brass tag on its ring
      x.fillStyle = css(mul(c.head || br, 0.4)); x.fillRect(19, -L + 92, 6, 2); x.fillRect(19, -L + 97, 6, 2);
      return;
    }
  }
  // two-handed: drawn in the whole canvas (W x H), held out in front, the near end at the bottom centre
  function drawTwoRanged(x, wid, e, W, H0, seed) {
    const c = e.col || {}, g = c.grip || [108, 70, 42], b = c.blade || [140, 146, 150], br = c.guard || [190, 156, 84], cx = W * 0.5;
    if (e.kind === 'bow') {
      // the Reach hornbow, held up in the left hand: horn and sinew recurves, an arrow on the string, a flint head
      const bx = W * 0.4, top = H0 * 0.04, bot = H0 * 1.02, mid = (top + bot) / 2, hc = c.head || [222, 210, 184];
      const limb = (y0, y1, s) => { x.beginPath(); x.moveTo(bx, mid + s * 30); x.bezierCurveTo(bx - 70, mid + s * (H0 * 0.25), bx + 10, y1 - s * 60, bx + 38, y1); x.lineWidth = 15; x.strokeStyle = css(mul(g, 0.5)); x.stroke(); x.lineWidth = 11; x.strokeStyle = css(g); x.stroke(); x.lineWidth = 4; x.strokeStyle = css(mix(hc, [255, 255, 255], 0.2)); x.stroke(); };
      limb(mid, top, -1); limb(mid, bot, 1);
      const tipT = [bx + 38, top], tipB = [bx + 38, bot], nock = [W * 0.86, H0 * 0.98];
      cord(x, [tipT[0], tipT[1], nock[0], nock[1], tipB[0], tipB[1]], [214, 204, 176], 1.6);
      // the arrow from the nock (by the right cheek, out of view) past the bow's grip
      cord(x, [nock[0], nock[1], bx - 50, mid - 70], [150, 120, 80], 3.2);
      x.beginPath(); x.moveTo(bx - 50, mid - 70); x.lineTo(bx - 82, mid - 100); x.lineTo(bx - 60, mid - 62); x.closePath(); x.fillStyle = css([46, 44, 50]); x.fill(); x.strokeStyle = css([120, 122, 132]); x.lineWidth = 1; x.stroke();
      for (const k of [0, 1]) { x.beginPath(); x.moveTo(nock[0] - 40, nock[1] - 34 + k * 12); x.lineTo(nock[0] - 4, nock[1] - 4 + k * 6); x.lineTo(nock[0] - 50, nock[1] - 24 + k * 14); x.closePath(); x.fillStyle = css(k ? [190, 70, 50] : [214, 200, 170]); x.fill(); }
      return { hold: [bx - 4, mid + 6], right: nock };
    }
    // a stock (or a barrel) running from the bottom centre up and away into the picture
    const near = H0 * 0.98, far = H0 * (e.kind === 'carbine' ? 0.06 : 0.22), wn = e.kind === 'harpoon' ? 58 : 48, wf = e.kind === 'harpoon' ? 34 : 22;
    const body = (col, w0, w1) => { x.beginPath(); x.moveTo(cx - w0 / 2, near); x.lineTo(cx - w1 / 2, far); x.lineTo(cx + w1 / 2, far); x.lineTo(cx + w0 / 2, near); x.closePath(); x.fillStyle = lin(x, cx - w0 / 2, 0, cx + w0 / 2, 0, [[0, mix(col, [255, 236, 210], 0.3)], [0.42, col], [1, mul(col, 0.45)]]); x.fill(); x.strokeStyle = css(mul(col, 0.3)); x.lineWidth = 1.2; x.stroke(); };
    if (e.kind === 'crossbow' || e.kind === 'handbow') {
      body(g, wn, wf);
      const py = far + 30, pw = W * 0.42;
      x.beginPath(); x.moveTo(cx - pw, py + 34); x.quadraticCurveTo(cx - pw * 0.4, py - 12, cx, py - 4); x.quadraticCurveTo(cx + pw * 0.4, py - 12, cx + pw, py + 34);
      x.lineWidth = 13; x.strokeStyle = css(mul(b, 0.45)); x.stroke(); x.lineWidth = 9; x.strokeStyle = css(b); x.stroke(); x.lineWidth = 2; x.strokeStyle = css(mix(b, [255, 255, 255], 0.55)); x.stroke();
      for (const s of [-1, 1]) { ell(x, cx + s * pw, py + 34, 8, 8); x.fillStyle = css(mul(b, 0.8)); x.fill(); }
      cord(x, [cx - pw, py + 34, cx, py + 110, cx + pw, py + 34], [210, 200, 170], 2);
      iron(x, [150, 154, 158], cx - 4, far - 40, 8, 160, 2); x.beginPath(); x.moveTo(cx - 10, far - 36); x.lineTo(cx, far - 62); x.lineTo(cx + 10, far - 36); x.closePath(); x.fillStyle = css([210, 212, 214]); x.fill();
      ell(x, cx, far - 10, 18, 10); x.lineWidth = 4; x.strokeStyle = css(mul(b, 0.7)); x.stroke();   // the stirrup
      return { hold: [cx - 6, H0 * 0.6], right: [cx + 20, H0 * 0.9] };
    }
    if (e.kind === 'carbine') {
      // the Office carbine: grey oilcloth wound on the stock, a long blued barrel, a brass fork for a front sight (741)
      body([92, 98, 102], wn + 8, 30);
      x.save(); x.beginPath(); x.rect(0, H0 * 0.55, W, H0); x.clip(); for (let y = H0 * 0.58; y < near; y += 14) { x.strokeStyle = 'rgba(30,34,38,0.45)'; x.lineWidth = 2; x.beginPath(); x.moveTo(cx - 34, y); x.lineTo(cx + 34, y - 8); x.stroke(); } x.restore();
      iron(x, b, cx - 9, far, 18, H0 * 0.6, 4);
      band(x, br, cx - 13, far + H0 * 0.18, 26, 9); band(x, br, cx - 13, far + H0 * 0.4, 26, 9);
      for (const s of [-1, 1]) iron(x, br, cx + s * 7 - 2.5, far - 26, 5, 30, 2);   // the fork's two tines
      iron(x, br, cx - 9, far + 2, 18, 6, 2);
      iron(x, [84, 88, 92], cx - 24, H0 * 0.6, 48, 40, 5); band(x, br, cx + 20, H0 * 0.56, 10, 22);   // the lock, the striker
      glowDot(x, cx, far + 8, 5, c.edge || [180, 236, 244]);
      cord(x, [cx - 40, H0 * 0.66, cx - 70, H0 * 0.3, cx - 20, far + 30], [196, 200, 204], 2);   // the silver-mesh sling
      return { hold: [cx - 4, H0 * 0.42], right: [cx + 18, H0 * 0.86] };
    }
    if (e.kind === 'harpoon') {
      // the Free Captains' harpoon gun: a fat bronze tube, a barbed iron head standing out of it, a rope coil on a drum
      body(c.head || [150, 120, 70], wn + 10, wf + 8);
      const hc = c.head || [150, 120, 70];
      band(x, br, cx - 26, H0 * 0.4, 52, 12); band(x, br, cx - 22, far + 30, 44, 10);
      iron(x, [96, 100, 104], cx - 5, far - 80, 10, 110, 3);
      x.beginPath(); x.moveTo(cx, far - 130); x.lineTo(cx - 16, far - 78); x.lineTo(cx - 5, far - 86); x.lineTo(cx - 5, far - 70); x.lineTo(cx + 5, far - 70); x.lineTo(cx + 5, far - 86); x.lineTo(cx + 16, far - 78); x.closePath();
      x.fillStyle = lin(x, cx - 16, 0, cx + 16, 0, [[0, [210, 214, 216]], [0.5, [150, 154, 158]], [1, [70, 74, 80]]]); x.fill(); x.strokeStyle = css([40, 42, 46]); x.lineWidth = 1; x.stroke();
      // the rope drum on the right, rope running up to the head
      ell(x, cx + 62, H0 * 0.62, 30, 34); x.fillStyle = lin(x, cx + 32, 0, cx + 92, 0, [[0, mix(hc, [255, 240, 210], 0.3)], [1, mul(hc, 0.5)]]); x.fill();
      for (let i = 0; i < 6; i++) { ell(x, cx + 62, H0 * 0.62, 26 - i * 0.5, 30 - i * 4.4); x.strokeStyle = css(i % 2 ? [176, 156, 112] : [140, 120, 84]); x.lineWidth = 2.4; x.stroke(); }
      cord(x, [cx + 50, H0 * 0.5, cx + 40, H0 * 0.2, cx + 14, far - 30, cx + 4, far - 72], [176, 156, 112], 2.2);
      ell(x, cx - 16, H0 * 0.74, 9, 6); x.fillStyle = css(mix(br, [92, 138, 112], 0.5)); x.fill();   // salt-green on the brass
      return { hold: [cx - 10, H0 * 0.46], right: [cx + 22, H0 * 0.9] };
    }
    return { hold: [cx, H0 * 0.6], right: [cx + 20, H0 * 0.9] };
  }
  function paintRanged(wid, e, look, opt) {
    const nh = !!(opt && opt.noHands), grips = nh ? [] : null;   // Phase 110: no hands, only where they go
    const ck = keyOf(wid, look) + (nh ? '|nh' : ''); let hit = cache.get(ck); if (hit) return hit;
    const seed = wid.length * 13 + wid.charCodeAt(0), hl = handLook(look, 'right'), hlL = handLook(look, 'left');
    const centred = !!CENTRED[e.kind] && !(e.kind === 'crossbow' && e.grip !== 'two');
    const BELOW = 40, RIGHT = centred ? 0 : 26, W0 = Math.round((centred ? 170 : 110) * K * 1.45), W = W0 + RIGHT * K * 2, H0 = Math.round((centred ? 160 : 190) * K * 1.45), H = H0 + BELOW * K * 2;
    const c = mk(W, H), x = c.getContext('2d'); x.imageSmoothingEnabled = true;
    if (!centred) {
      const gx = W0 * 0.56, gy = H0 * 0.74, lean = e.kind === 'sling' ? -0.1 : -0.3, L = e.kind === 'sling' ? H0 * 0.5 : e.kind === 'handbow' ? H0 * 0.42 : H0 * 0.5;
      if (!nh) drawForearm(x, look, hl, gx + 36, gy + 46, W + 30, H + 40, 46, 120, seed);
      x.save(); x.translate(gx, gy); x.rotate(lean); drawOneRanged(x, wid, e, L, seed);
      if (nh) grips.push(gripAt(x, 'right', false, 0, 0, [gx + 36, gy + 46, W + 30, H + 40])); else { x.save(); x.translate(6, 0); drawFist(x, hl, seed, false); x.restore(); } x.restore();
    } else {
      const P = drawTwoRanged(x, wid, e, W, H0, seed);
      // the right hand on the grip near you, the left under the fore-end (or round the bow), forearms from the bottom corners
      const [rx, ry] = P.right, [lx, ly] = P.hold;
      if (e.kind !== 'bow') { if (!nh) drawForearm(x, look, hl, rx + 30, ry + 40, W + 40, H + 60, 42, 110, seed); x.save(); x.translate(rx, ry); x.rotate(-0.25); x.scale(0.85, 0.85); if (nh) grips.push(gripAt(x, 'right', false, 0, 0, [rx + 30, ry + 40, W + 40, H + 60])); else drawFist(x, hl, seed, false); x.restore(); }
      if (!nh) drawForearm(x, look, hlL, lx - 30, ly + 44, -60, H + 80, 38, 96, seed + 5, true);
      x.save(); x.translate(lx, ly); x.rotate(e.kind === 'bow' ? 0.1 : 0.2); x.scale(0.82, 0.82); if (nh) grips.push(gripAt(x, 'left', true, 0, 0, [lx - 30, ly + 44, -60, H + 80])); else drawFist(x, hlL, seed + 2, true); x.restore();
    }
    let emis = null;
    if (!nh) try {
      const id = x.getImageData(0, 0, W, H), d = id.data; let any = false;
      for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15; if (d[i + 3] > 0 && l > 180) { const k = Math.min(1, (l - 180) / 60) * 0.2; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; any = true; } else { d[i] = d[i + 1] = d[i + 2] = 0; } }
      if (any) { emis = mk(W, H); emis.getContext('2d').putImageData(id, 0, 0); }
    } catch (er) { warnOnce('glint', er); }
    hit = { canvas: c, emis, k: K, below: BELOW, right: RIGHT, center: centred };
    if (nh) hit.grips = grips;
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit);
    return hit;
  }

  // ---------------------------------------------------------------- Phase 87, the last of (d): the hands themselves
  // An open hand seen from its back, fingers up (a Song is cast from the two of them, the light between). Drawn in the
  // fist's 60-pixel frame: the thumb on the inner side, to the left; mirrored for the left hand.
  function drawOpenHand(x, hl, seed, mirror) {
    const S = mirror ? -1 : 1, Z = 1.85, glass = hl.kind === 'glass';
    x.save(); x.scale(S * Z, Z);
    const part = (path, grad, lw, a, gb, cell, gs) => { path(); x.fillStyle = grad; x.fill(); x.lineWidth = lw; x.strokeStyle = css(hl.dk, a); x.stroke(); if (glass) glassOver(x, path, gb[0], gb[1], gb[2], gb[3], cell, seed + gs); };
    // the thumb, out to the inner side
    const thumb = () => { x.beginPath(); x.moveTo(-13, 16); x.bezierCurveTo(-22, 8, -30, -4, -33, -15); x.bezierCurveTo(-34, -21, -27, -23, -24, -17); x.bezierCurveTo(-21, -8, -17, -2, -12, 2); x.closePath(); };
    part(thumb, lin(x, -34, -20, -12, 14, [[0, mix(hl.lt, [255, 255, 255], 0.15)], [0.5, hl.base], [1, hl.sh]]), 1.1, 0.85, [-36, -24, 26, 42], 12, 60);
    // the back of the hand
    const back = () => { x.beginPath(); x.moveTo(-12, 33); x.bezierCurveTo(-19, 14, -20, -2, -17, -12); x.lineTo(17, -12); x.bezierCurveTo(20, -2, 19, 14, 12, 33); x.closePath(); };
    part(back, lin(x, -20, -12, 18, 34, [[0, hl.lt], [0.5, hl.base], [1, hl.dk]]), 1.1, 0.9, [-22, -14, 44, 50], 16, 61);
    // four fingers, a little fanned: index next to the thumb, the middle the longest
    const F = [[-12.5, 27, -0.13, 7.4], [-4.3, 32, -0.04, 7.8], [4.2, 29, 0.05, 7.4], [12.2, 22, 0.17, 6.6]];
    F.forEach(([fx, len, ang, wd], i) => {
      x.save(); x.translate(fx, -10); x.rotate(ang);
      const fing = () => { x.beginPath(); x.moveTo(-wd / 2, 3); x.lineTo(-wd / 2 + 0.4, -len + wd / 2); x.arc(0, -len + wd / 2, wd / 2 - 0.4, PI, 0); x.lineTo(wd / 2, 3); x.closePath(); };
      part(fing, lin(x, -wd / 2, 0, wd / 2, 0, [[0, hl.lt], [0.45, hl.base], [1, hl.sh]]), 1, 0.8, [-wd, -len - 2, wd * 2, len + 8], 10, 62 + i);
      x.strokeStyle = css(hl.dk, 0.45); x.lineWidth = 0.8;
      for (const t of [0.36, 0.68]) { x.beginPath(); x.moveTo(-wd / 2 + 0.8, -len * t); x.quadraticCurveTo(0, -len * t + 1.4, wd / 2 - 0.8, -len * t); x.stroke(); }   // the joints
      ell(x, -0.6, -1.5, wd * 0.32, 2); x.fillStyle = css(mix(hl.lt, [255, 255, 255], 0.2), 0.5); x.fill();                                          // the knuckle in the light
      if (hl.kind === 'skin') { rrect(x, -wd * 0.3, -len + 1.2, wd * 0.6, 4.2, 1.4); x.fillStyle = css(mix(hl.lt, [255, 240, 232], 0.5), 0.75); x.fill(); x.lineWidth = 0.5; x.strokeStyle = css(hl.sh, 0.6); x.stroke(); }   // the nail
      if (hl.kind === 'mail') { for (const t of [0.14, 0.5]) { rrect(x, -wd / 2 + 0.6, -len * (t + 0.2), wd - 1.2, len * 0.17, 1); x.fillStyle = lin(x, -wd / 2, 0, wd / 2, 0, [[0, mix(hl.lt, [255, 255, 255], 0.4)], [0.5, hl.base], [1, hl.dk]]); x.fill(); x.lineWidth = 0.6; x.strokeStyle = css(hl.dk); x.stroke(); } }
      if (hl.kind === 'leather') { x.strokeStyle = css(hl.dk, 0.55); x.lineWidth = 0.7; x.setLineDash([1.5, 1.5]); x.beginPath(); x.moveTo(wd / 2 - 1.3, 2); x.lineTo(wd / 2 - 1.3, -len + wd / 2); x.stroke(); x.setLineDash([]); }
      x.restore();
    });
    // materials on the back of the hand
    if (hl.kind === 'leather') { x.strokeStyle = css(hl.dk, 0.6); x.lineWidth = 0.8; x.setLineDash([1.6, 1.6]); x.beginPath(); x.moveTo(-15, -8); x.quadraticCurveTo(0, -3, 15, -8); x.stroke(); x.beginPath(); x.moveTo(-9, 30); x.quadraticCurveTo(-13, 10, -12, -6); x.stroke(); x.setLineDash([]);
      x.save(); back(); x.clip(); speckle(x, -22, -14, 44, 50, 110, [0, 0, 0], 0.12, seed + 7); speckle(x, -22, -14, 44, 50, 46, [255, 240, 220], 0.1, seed + 8); x.restore();
    } else if (hl.kind === 'mail') { x.save(); back(); x.clip();
      for (let yy = -14; yy < 36; yy += 3.4) for (let xx = -22 + ((Math.round(yy / 3.4)) & 1) * 1.7; xx < 22; xx += 3.4) { ell(x, xx, yy, 1.5, 1.2); x.strokeStyle = css(hl.dk, 0.5); x.lineWidth = 0.6; x.stroke(); x.fillStyle = css(mix(hl.lt, [255, 255, 255], 0.3), 0.35); x.fillRect(xx - 0.8, yy - 1, 0.8, 0.8); }
      x.restore();
    } else if (hl.kind === 'skin') { x.strokeStyle = css(hl.sh, 0.4); x.lineWidth = 0.9; for (let i = 0; i < 4; i++) { x.beginPath(); x.moveTo(-5 + i * 3.4, 28); x.quadraticCurveTo(-9 + i * 6.2, 8, -12.5 + i * 8.3, -9); x.stroke(); } }
    x.restore();
  }
  // the bare hands and the glass arm (`pose`): 'fist' the right fist raised, as it holds a blade but holding nothing;
  // 'glassfist' the same fist in glass (the body module draws it mirrored, on the left, where that arm is); 'open' both
  // hands open and raised, for a Song. Each wears what you wear.
  function paintHands(look, pose, opt) {
    const nh = !!(opt && opt.noHands), grips = nh ? [] : null;   // Phase 110: no hands, only where they go
    const ck = ['hands', pose, look && look.key, look && look.glassArm ? 1 : 0].join('|') + (nh ? '|nh' : ''); let hit = cache.get(ck); if (hit) return hit;
    const BELOW = 40, seed = 87 + pose.length;
    let c, x, W, H, RIGHT = 0, out;
    if (pose === 'open') {
      const H0 = Math.round(150 * K * 1.45); W = Math.round(200 * K * 1.45); H = H0 + BELOW * K * 2;
      c = mk(W, H); x = c.getContext('2d'); x.imageSmoothingEnabled = true;
      const hlR = handLook(look, 'right'), hlL = handLook(look, 'left'), HS = 1.5, cy = H0 * 0.38;
      for (const [hl, cx, mirror, rot, ex] of [[hlL, W * 0.21, true, 0.2, -40], [hlR, W * 0.79, false, -0.2, W + 40]]) {
        const wx = cx - Math.sin(rot) * 34 * 1.85 * HS, wy = cy + Math.cos(rot) * 34 * 1.85 * HS;
        if (!nh) drawForearm(x, look, hl, wx, wy - 14, ex, H + 50, 38, 104, seed + (mirror ? 5 : 0), mirror);
        x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(HS, HS); if (nh) grips.push(gripAt(x, mirror ? 'left' : 'right', mirror, 0, 0, [wx, wy - 14, ex, H + 50])); else drawOpenHand(x, hl, seed + (mirror ? 2 : 0), mirror); x.restore();
      }
      out = { center: true };
    } else {
      const W0 = Math.round(110 * K * 1.45), H0 = Math.round(190 * K * 1.45); RIGHT = 26; W = W0 + RIGHT * K * 2; H = H0 + BELOW * K * 2;
      c = mk(W, H); x = c.getContext('2d'); x.imageSmoothingEnabled = true;
      const hl = pose === 'glassfist' ? GLASS_HL : handLook(look, 'right'), FS = 1.3, gx = W0 * 0.56, gy = H0 * 0.655, lean = -0.1;
      const lk = pose === 'glassfist' ? Object.assign({}, look, { hands: null }) : look;
      if (!nh) drawForearm(x, lk, hl, gx + 40 * FS, gy + 50 * FS, W + 34, H + 44, 46 * FS * 0.96, 132, seed);
      x.save(); x.translate(gx, gy); x.rotate(lean); x.scale(FS, FS); x.translate(6, 0); if (nh) grips.push(gripAt(x, 'right', false, 0, 0, [gx + 40 * FS, gy + 50 * FS, W + 34, H + 44])); else drawFist(x, hl, seed, false); x.restore();
      out = { flip: pose === 'glassfist', shift: pose === 'fist', tip: [(gx - 58 * FS) / W, (gy - 6) / H], root: [(gx + 44 * FS) / W, (gy + 60 * FS) / H] };
    }
    // what glows of its own: the glass (a quarter of its old light, as approved), and the brightest glints of the rest
    let emis = null;
    if (!nh) try {
      const id = x.getImageData(0, 0, W, H), d = id.data, GL = 0.22; let any = false;
      const glassAt = pose === 'glassfist' ? () => true : pose === 'open' && look && look.glassArm ? (px) => px < W / 2 : () => false;
      for (let i = 0, p = 0; i < d.length; i += 4, p++) { if (!d[i + 3]) continue;
        if (glassAt(p % W)) { d[i] *= GL; d[i + 1] *= GL; d[i + 2] *= GL; any = true; continue; }
        const l = d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15; if (l > 180) { const k = Math.min(1, (l - 180) / 60) * 0.2; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; any = true; } else { d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = 0; } }
      if (any) { emis = mk(W, H); emis.getContext('2d').putImageData(id, 0, 0); }
    } catch (e) { warnOnce('hands glint', e); }
    hit = Object.assign({ canvas: c, emis, k: K, below: BELOW, right: RIGHT, pose }, out);
    if (nh) hit.grips = grips;
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit);
    return hit;
  }

  function keyOf(wid, look) { const h = look && look.hands; return [wid, look && look.key, look && look.glassArm ? 1 : 0].join('|'); }
  function paint(wid, look, opt) {
    const e = entryOf(wid); if (e && RANGED_KINDS[e.kind]) return paintRanged(wid, e, look, opt);
    const f = formOf(wid, e); if (!e || !f) return null;
    const nh = !!(opt && opt.noHands), grips = nh ? [] : null;   // Phase 110: no hands, only where they go
    const ck = keyOf(wid, look) + (nh ? '|nh' : ''); let hit = cache.get(ck); if (hit) return hit;
    const pole = e.kind === 'spear' || e.kind === 'glaive', two = e.grip === 'two', blade = !!BLADE_KINDS[e.kind];
    // the canvas: the old pictures were about 100 x 190; these are drawn 1.25 times as large at K times the detail
    // BELOW: the forearm runs on under the old picture's bottom edge, out of the bottom of the view (in view pixels: the
    // canvas has 2K painting pixels to a view pixel)
    const BELOW = 40, RIGHT = 26, W0 = Math.round((pole ? 150 : two ? 140 : 110) * K * 1.45), W = W0 + RIGHT * K * 2, H0 = Math.round(190 * K * 1.45), H = H0 + BELOW * K * 2;
    const c = mk(W, H), x = c.getContext('2d'); x.imageSmoothingEnabled = true;
    const seed = wid.length * 13 + wid.charCodeAt(0);
    const hl = handLook(look, 'right'), hlL = handLook(look, 'left');
    // where the right hand holds it, and the lean of it (the tip out to the upper left)
    const gx = W0 * (pole ? 0.62 : 0.56), gy = H0 * (pole ? 0.8 : 0.74), lean = pole ? -0.42 : two ? -0.2 : -0.16;
    const len = blade ? Math.min(H0 * 0.66, (e.len || 8) * 30 + 90) : pole ? H0 * 0.64 : two ? H0 * 0.56 : H0 * (f.len || 0.44);
    // the forearm first (it is behind the hand), out of the bottom-right
    if (!nh) drawForearm(x, look, hl, gx + 36, gy + 46, W + 30, H + 40, 46, 120, seed);
    x.save(); x.translate(gx, gy); x.rotate(lean);
    const gripL = blade ? (two ? 160 : 110) : 0;
    if (blade) {
      x.save(); x.translate(0, -gripL * 0.5 + 6);
      drawGripAndPommel(x, f, e, gripL);
      drawBlade(x, f, e, len, seed);
      drawGuard(x, f, e);
      x.restore();
    } else {
      // the heads are drawn in a small frame and scaled to the hand (HS), the haft as thick as a fist can close on
      const HS = pole ? 2.5 : 2.3, bot = pole ? 170 : two ? 150 : 90, w = f.hw || (pole ? 28 : two ? 30 : 24);
      drawHaft(x, f, e, -len + 20, bot, w, seed);
      x.save(); x.translate(0, -len + 20); x.scale(HS, HS); drawHead(x, f, e, 0, seed); x.restore();
    }
    // the right hand closes round the grip
    if (nh) grips.push(gripAt(x, 'right', false, 0, blade ? -gripL * 0.5 + 6 + gripL * 0.55 : 0, [gx + 36, gy + 46, W + 30, H + 40]));
    else { x.save(); x.translate(6, blade ? -gripL * 0.5 + 6 + gripL * 0.55 : 0); drawFist(x, hl, seed, false); x.restore(); }
    x.restore();
    // two hands: the left hand further up a pole, or just below the right on a long grip (glass if the arm is glass)
    if (two) {
      // up the shaft (or down the long grip) from the right hand: the shaft's own direction
      const up = pole ? 200 : -150, ax = gx + Math.sin(lean) * up, ay = gy - Math.cos(lean) * up, lx = 0, ly = 0;
      if (!nh) drawForearm(x, look, hlL, ax - 30, ay + 44, -70, H + 80, 38, 90, seed + 5, true);
      x.save(); x.translate(ax, ay); x.rotate(lean); if (nh) grips.push(gripAt(x, 'left', true, 0, 0, [ax - 30, ay + 44, -70, H + 80])); else drawFist(x, hlL, seed + 2, true); x.restore();
      void lx; void ly;
    }
    // the glint: the brightest parts (edges, the lit flat, glass) keep a little light of their own under the scene's shading
    let emis = null;
    if (!nh) try {
      const id = x.getImageData(0, 0, W, H), d = id.data; let any = false;
      for (let i = 0; i < d.length; i += 4) { const l = d[i] * 0.3 + d[i + 1] * 0.55 + d[i + 2] * 0.15; if (d[i + 3] > 0 && l > 180) { const k = Math.min(1, (l - 180) / 60) * 0.2; d[i] *= k; d[i + 1] *= k; d[i + 2] *= k; any = true; } else { d[i] = d[i + 1] = d[i + 2] = 0; d[i + 3] = 0; } }
      if (any) { emis = mk(W, H); emis.getContext('2d').putImageData(id, 0, 0); }
    } catch (e) { warnOnce('glint', e); }
    // Phase 88: where the business end is, as fractions of the canvas (the swing's smear follows it)
    const rot = (lx, ly) => [gx + lx * Math.cos(lean) - ly * Math.sin(lean), gy + lx * Math.sin(lean) + ly * Math.cos(lean)];
    const tipL = blade ? rot(0, -gripL * 0.5 + 6 - len) : rot(0, -len + 20), rootL = blade ? rot(0, -gripL * 0.5 + 6) : rot(0, -len * 0.45);
    hit = { canvas: c, emis, k: K, below: BELOW, right: RIGHT, tip: [tipL[0] / W, tipL[1] / H], root: [rootL[0] / W, rootL[1] / H] };
    if (nh) hit.grips = grips;   // the canvas is K times its place; it hangs BELOW view pixels lower   // the canvas is K times its place on the screen (which is 1.25 times the old pictures)
    if (cache.size > 40) cache.clear();
    cache.set(ck, hit);
    return hit;
  }

  return { K, FORM, covers, paint, paintHands, formOf, cache };
})();
if (typeof window !== 'undefined') window.FP87 = FP87;
