'use strict';
// ============================================================================
//  faces124 — Phase 124b: the recoloured townsfolk keep their skin.
//  Forty people in the world are recoloured copies of a painted figure (the townsman, the townswoman, Hob, the Hollow):
//  js/life60.js variant() (the road-walkers, the Office clerk, the Hollows of Whispergrove), js/cantabile17.js,
//  js/flume16.js and js/longnight17.js (their COATS), js/sheepwalk22.js tinted(), js/calendar11.js (the stall-keepers)
//  and js/kestrel16.js (Pennick). A tint over the whole painting turned faces blue, green or grey. Each maker now hands
//  its recoloured pixels to FACES124.skin(srcSprite, data) before adding the sprite: the head (face, hair and what is
//  worn on it) and the bare skin below it (hands, arms, legs: the painting's own flesh tones, measured from its face)
//  keep the source painting's colours (the face and the hair; a kerchief or cap is dyed with the cloth); the cloth keeps
//  its tint, whole. The townswoman's clay jar keeps its clay. The Hollows' recolours (a state of the whole figure, not
//  dyed cloth) are left exactly as made. The mask is measured once per source painting and reused by every recolour of it.
//  Switch: GFX.keepSkin, Options > Graphics "Recoloured people keep their skin", on by default, off in Original
//  (PRESETS.keep). Off, every sprite is byte for byte what its maker made: the maker's own pixels are kept, and the
//  switch swaps them back in place. Nothing here uses Math.random.
//  Phase 124c: FACES124.OWN and FACES124.portrait(npcOrId), faces of their own for the people who borrow the townsman's
//  or the townswoman's portrait (switch GFX.ownFaces, "Faces of their own"); see the section near the end.
//  Loaded before js/mast123.js, which must stay the last script (its map wrapper is the outermost: old saves).
// ============================================================================
const FACES124 = (function () {
  const FLAG = 'keepSkin';
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('faces124: ' + k + ': ' + (e && e.message ? e.message : e)); } catch (x) { /* none */ } };
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = true;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const on = () => typeof GFX === 'undefined' || GFX[FLAG] !== false;

  // ---------------------------------------------------------------- colour
  function hsl(r, g, b) {
    r /= 255; g /= 255; b /= 255; const mx = Math.max(r, g, b), mn = Math.min(r, g, b), l = (mx + mn) / 2;
    if (mx === mn) return [0, 0, l];
    const d = mx - mn, s = l > 0.5 ? d / (2 - mx - mn) : d / (mx + mn);
    let h = mx === r ? (g - b) / d + (g < b ? 6 : 0) : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    return [h * 60, s, l];
  }
  const hueDist = (a, b) => { const d = Math.abs(a - b) % 360; return d > 180 ? 360 - d : d; };
  const pct = (arr, p) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.max(0, Math.round(p * (s.length - 1))))]; };

  // ---------------------------------------------------------------- the figure's head and its flesh, measured once
  const MASKS = new WeakMap();
  // carried things that are plainly not cloth, by source painting: [x0, y0, x1, y1] in its pixels, and their tones
  // the face's oval, by source painting (centre and radii in its pixels): measured on the paintings, from the cap's brim or
  // the kerchief's edge to the chin; Hob is bald, so his is the whole head
  const FACE = { townsman: { c: [30, 20], r: [8.5, 7] }, townswoman: { c: [24.5, 16], r: [8.5, 10.5] }, hob: { c: [25.5, 12], r: [9, 13] } };
  const CARRIED = { townswoman: { box: [22, 32, 54, 78], hue: 22, hueR: 22, sMin: 0.26, lMin: 0.1, lMax: 0.72 } };   // her clay jar
  // a recolour of one of these is a state of the whole person (the Hollows: faded, grey-blue), not dyed cloth: left alone
  const STATE_SOURCES = ['hollow'];
  function nameOf(sp) { try { if (typeof Engine !== 'undefined' && Engine.sprites) for (const k of Object.keys(Engine.sprites)) { const o = Engine.sprites[k]; if (o && o.data === sp.data) return k; } } catch (e) { /* none */ } return null; }
  function measure(sp) {
    const name = nameOf(sp);
    const w = sp.w, h = sp.h, d = sp.data, A = (i) => d[i] >>> 24;
    let top = -1, bot = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (A(y * w + x) >= 128) { if (top < 0) top = y; bot = y; break; }
    if (top < 0) return null;
    const H = bot - top + 1;
    const run = (y) => { let best = null, s = -1; for (let x = 0; x <= w; x++) { const o = x < w && A(y * w + x) >= 128; if (o && s < 0) s = x; else if (!o && s >= 0) { if (!best || x - s > best[1] - best[0]) best = [s, x - 1]; s = -1; } } return best; };
    // the head: its width and centre over the top tenth; the neck: the narrowest row between 9% and 20% of the height
    let headW = 0, hx = 0, n = 0; for (let y = top; y < top + H * 0.1; y++) { const r = run(y); if (r) { headW = Math.max(headW, r[1] - r[0] + 1); hx += (r[0] + r[1]) / 2; n++; } } hx /= n || 1;
    let neckY = Math.round(top + H * 0.145), nw = 1e9;
    for (let y = Math.round(top + H * 0.09); y <= Math.round(top + H * 0.2); y++) { const r = run(y); if (r && r[1] - r[0] + 1 < nw) { nw = r[1] - r[0] + 1; neckY = y; } }
    if (nw > headW * 0.85) neckY = Math.round(top + H * 0.145);   // a kerchief or hair to the shoulders: the usual neck
    // the flesh: the middle of the face (the centre of the head, its lower two thirds, where hair and headwear are not)
    const hs = [], ss = [], ls = [], faceY0 = Math.round(top + (neckY - top) * 0.38), faceY1 = neckY;
    for (let y = faceY0; y < faceY1; y++) for (let x = Math.round(hx - headW * 0.28); x <= Math.round(hx + headW * 0.28); x++) {
      if (x < 0 || x >= w) continue; const v = d[y * w + x]; if ((v >>> 24) < 200) continue;
      const c = hsl(v & 255, (v >> 8) & 255, (v >> 16) & 255); if (c[2] < 0.12) continue; hs.push(c[0]); ss.push(c[1]); ls.push(c[2]);
    }
    if (hs.length < 6) return null;
    // the lit skin only: the darkest quarter of the face's middle is shadow, brow, beard or hair, not flesh to match
    const lCut = pct(ls, 0.25), keep = []; for (let i = 0; i < ls.length; i++) if (ls[i] >= lCut) keep.push(i);
    const H2 = keep.map((i) => hs[i]), S2 = keep.map((i) => ss[i]), L2 = keep.map((i) => ls[i]);
    // the hue's centre on the circle, then its spread around that centre
    let cx = 0, cy = 0; for (let i = 0; i < H2.length; i++) { const a = H2[i] * Math.PI / 180, k = S2[i]; cx += Math.cos(a) * k; cy += Math.sin(a) * k; }
    const hue = (Math.atan2(cy, cx) * 180 / Math.PI + 360) % 360, hd = H2.map((x) => hueDist(x, hue));
    const F = { hue, hueR: Math.max(8, pct(hd, 0.9) + 2), sLo: Math.max(0, pct(S2, 0.1) - 0.04), sHi: Math.min(1, pct(S2, 0.9) + 0.04), lLo: Math.max(0, pct(L2, 0.1) - 0.03), lHi: Math.min(1, pct(L2, 0.97) + 0.03), grey: pct(S2, 0.5) < 0.1, area: keep.length };
    const isFlesh = (v) => { const c = hsl(v & 255, (v >> 8) & 255, (v >> 16) & 255); return c[1] >= F.sLo && c[1] <= F.sHi && c[2] >= F.lLo && c[2] <= F.lHi && (F.grey || c[1] < 0.06 || hueDist(c[0], hue) <= F.hueR); };
    // the seed. The head above the neck: every pixel (face, hair and what is worn on it). Below it, colour alone cannot
    // tell these paintings' skin from their linen, brown wool and leather, so bare skin is looked for only where the
    // figure's own rig (js/paintfolk76.js autorig) puts it: the opening at the neck, and the forearms and hands (the
    // lower part of each elbow-to-hand line). Clumps of fewer than four pixels are dropped. A grey-skinned figure (the
    // Hollow) keeps its head and neck only: its maker already leaves grey alone, and its grey rags match grey skin.
    // (A held thing is not kept: tried, a rule for "warmer than skin, at the hands" kept the townsman's leather apron
    // in blotches and still missed the townswoman's jar, so the jar takes its owner's tint as before.)
    // the head keeps its face (flesh) and its hair, brows and beard (darker than the lit skin, and brown), below the
    // top third of the head where a cap sits; the kerchief or cap round them takes the dye with the rest of the cloth
    const hairY = top + (neckY - top) * 0.3;
    const isHair = (v) => { const c = hsl(v & 255, (v >> 8) & 255, (v >> 16) & 255); return c[2] < F.lLo + 0.02 && c[2] > 0.04 && c[1] >= 0.12 && hueDist(c[0], hue) <= 28; };   // brown: the cap's grey-green folds and the kerchief's grey shadows are not
    // In these paintings the kerchief and the cap share the skin's hue, saturation and lightness, so colour cannot part
    // them: where the face's oval has been measured on the painting (FACE), the oval is kept, every pixel of it (face,
    // brows, beard and the hair framing it), and the head-cloth round it is dyed. Elsewhere, flesh and brown hair by tone.
    const FO = name && Object.prototype.hasOwnProperty.call(FACE, name) ? FACE[name] : null;
    let rig = null; try { if (typeof PAINTFOLK !== 'undefined' && PAINTFOLK.autorig) rig = PAINTFOLK.autorig(sp); } catch (e) { rig = null; }
    const J = rig && rig.J ? rig.J : { elbowR: [hx - headW, top + H * 0.36], handR: [hx - headW, top + H * 0.52], elbowL: [hx + headW, top + H * 0.36], handL: [hx + headW, top + H * 0.52] };
    const segD = (px, py, a, b) => { const vx = b[0] - a[0], vy = b[1] - a[1], L2 = vx * vx + vy * vy || 1, t = Math.max(0, Math.min(1, ((px - a[0]) * vx + (py - a[1]) * vy) / L2)); return Math.hypot(px - a[0] - t * vx, py - a[1] - t * vy); };
    const armR = headW * 0.3, handR = headW * 0.5, yNeck = neckY + H * 0.1, holding = !!(rig && rig.armsFixed);
    const fore = (k) => [J['elbow' + k][0] + (J['hand' + k][0] - J['elbow' + k][0]) * 0.4, J['elbow' + k][1] + (J['hand' + k][1] - J['elbow' + k][1]) * 0.4], foreR = fore('R'), foreL = fore('L');
    const nearHand = (x, y) => Math.hypot(x - J.handR[0], y - J.handR[1]) <= handR || Math.hypot(x - J.handL[0], y - J.handL[1]) <= handR;
    const seed = new Uint8Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = y * w + x; if (A(i) < 128) continue;
      const v = d[i];
      if (FO) { const ex = (x - FO.c[0]) / FO.r[0], ey = (y - FO.c[1]) / FO.r[1]; if (ex * ex + ey * ey <= 1) { seed[i] = 1; continue; } if (y <= neckY) continue; }
      else if (y <= neckY) { if (isFlesh(v) || (y >= hairY && Math.abs(x - hx) <= headW * 0.6 && isHair(v))) seed[i] = 1; continue; }
      if (isFlesh(v) && ((y <= yNeck && Math.abs(x - hx) <= headW * 0.35) || (!F.grey && (nearHand(x, y) || segD(x, y, foreR, J.handR) <= armR || segD(x, y, foreL, J.handL) <= armR)))) seed[i] = 1;
    }
    const seen = new Uint8Array(w * h), stack = [];
    const comps = (mark, keep) => { seen.fill(0); for (let i = 0; i < w * h; i++) {
      if (!mark[i] || seen[i] || ((i / w) | 0) <= neckY) continue;
      const comp = []; stack.push(i); seen[i] = 1;   // (the fill stays below the neck: the head is always kept)
      while (stack.length) { const j = stack.pop(); comp.push(j); const x = j % w, y = (j / w) | 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const k = yy * w + xx; if (yy > neckY && mark[k] && !seen[k]) { seen[k] = 1; stack.push(k); } } }
      keep(comp);
    } };
    comps(seed, (comp) => { if (comp.length < 4) for (const j of comp) seed[j] = 0; });
    // a thing carried that is plainly not cloth keeps the painting's colour: its own tones inside the box where it sits,
    // the biggest clump there (CARRIED, measured on the painting)
    let carried = null; const C = name && Object.prototype.hasOwnProperty.call(CARRIED, name) ? CARRIED[name] : null;
    if (C) { carried = new Uint8Array(w * h); const mark = new Uint8Array(w * h);
      for (let y = C.box[1]; y <= C.box[3] && y < h; y++) for (let x = C.box[0]; x <= C.box[2] && x < w; x++) { const i = y * w + x; if (A(i) < 128) continue; const v = d[i], c = hsl(v & 255, (v >> 8) & 255, (v >> 16) & 255);
        if (hueDist(c[0], C.hue) <= C.hueR && c[1] >= C.sMin && c[2] >= C.lMin && c[2] <= C.lMax) mark[i] = 1; }
      let best = null; seen.fill(0);
      for (let i = 0; i < w * h; i++) { if (!mark[i] || seen[i]) continue; const comp = []; stack.push(i); seen[i] = 1;
        while (stack.length) { const j = stack.pop(); comp.push(j); const x = j % w, y = (j / w) | 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; const k = yy * w + xx; if (mark[k] && !seen[k]) { seen[k] = 1; stack.push(k); } } }
        if (!best || comp.length > best.length) best = comp; }
      if (best && best.length >= 60) for (const j of best) { carried[j] = 1; seed[j] = 1; } else carried = null;
    }
    // grown by one pixel and smoothed (3 by 3), so no fringe of tinted pixels is left round a face or at a cuff
    const grown = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let m = 0; for (let dy = -1; dy <= 1 && !m; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx >= 0 && yy >= 0 && xx < w && yy < h && seed[yy * w + xx]) { m = 1; break; } } grown[y * w + x] = m; }
    const wt = new Float32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { let s = 0, c = 0; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue; s += grown[yy * w + xx] * (dx || dy ? 1 : 2); c += dx || dy ? 1 : 2; } wt[y * w + x] = seed[y * w + x] ? 1 : Math.min(1, (s / c) * 1.5); }
    return { w, h, top, bot, neckY, hx, headW, flesh: F, isFlesh, isHair, seed, wt, carried, faceOval: FO, hands: [J.handR, J.handL], holding };
  }
  // keyed by the pixels, not the sprite: a painting that arrives later replaces a sprite's pixels, and is measured afresh
  function maskOf(sp) { if (!sp || !sp.data) return null; let m = MASKS.get(sp.data); if (m === undefined) { const t0 = now(); try { m = measure(sp); } catch (e) { warnOnce('measure', e); m = null; } stats.ms += now() - t0; stats.masks++; MASKS.set(sp.data, m); } return m; }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const stats = { masks: 0, ms: 0, recolours: 0, applyMs: 0 };

  // ---------------------------------------------------------------- the one call every maker makes
  // skin(src, data): src is the source sprite, data the maker's recoloured Uint32Array of the same size. Returns data
  // itself (changed in place when the switch is on). The maker's own pixels are kept, so the switch can swap them back.
  const REG = [];
  function keptOf(e) {
    if (e.kept) return e.kept;
    const m = maskOf(e.from), out = new Uint32Array(e.base);
    if (m && m.w === e.from.w && m.h === e.from.h) {
      const s = e.from.data;
      for (let i = 0; i < out.length; i++) { const k = m.wt[i]; if (k <= 0) continue; const a = out[i] >>> 24; if (!a) continue; const p = out[i], q = s[i];
        if (k >= 1) { out[i] = ((a << 24) | (q & 0xffffff)) >>> 0; continue; }
        const mixc = (sh) => Math.round(((p >>> sh) & 255) * (1 - k) + ((q >>> sh) & 255) * k);
        out[i] = ((a << 24) | (mixc(16) << 16) | (mixc(8) << 8) | mixc(0)) >>> 0; }
    }
    return (e.kept = out);
  }
  // whole (optional): the maker's tint with nothing spared by colour (js/life60.js spares flesh-coloured pixels by colour,
  // which left orange specks in the cloth); used as the cloth when the switch is on. data stays the maker's own when off.
  function skin(src, data, name, whole) {
    try {
      if (!src || !src.data || !data || data.length !== src.data.length) return data;
      if (typeof Engine !== 'undefined' && Engine.sprites && STATE_SOURCES.some((k) => Engine.sprites[k] === src)) return data;
      const t0 = now();
      const e = { src, from: { w: src.w, h: src.h, data: src.data }, data, tinted: new Uint32Array(data), kept: null, name: name || null };
      e.base = whole && whole.length === data.length ? new Uint32Array(whole) : e.tinted;   // the pixels the maker read
      REG.push(e); stats.recolours++;
      e.isKept = on(); if (e.isKept) data.set(keptOf(e));
      stats.applyMs += now() - t0;
    } catch (er) { warnOnce('skin', er); }
    return data;
  }
  // the switch: every recolour made so far is swapped in place (its array is the sprite's own), and a moving painting
  // made from it is measured again
  function sync() {
    const v = on(); let changed = false;
    for (const e of REG) { if (e.isKept === v) continue; try { e.data.set(v ? keptOf(e) : e.tinted); e.isKept = v; changed = true; } catch (er) { warnOnce('sync', er); } }
    if (!changed) return;
    try { if (typeof PAINTFOLK !== 'undefined' && typeof Engine !== 'undefined' && Engine.sprites) for (const k of Object.keys(Engine.sprites)) { const sp = Engine.sprites[k]; if (sp && REG.some((e) => e.data === sp.data) && PAINTFOLK.has && PAINTFOLK.has(k)) PAINTFOLK.source(k, sp); } } catch (er) { warnOnce('paintfolk', er); }
  }
  try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { sync(); syncRow(); }); } catch (e) { warnOnce('onChange', e); }

  // ---------------------------------------------------------------- the Options row
  const ROW = ['gfx-keepskin124', 'Recoloured people keep their skin', 'townsfolk dressed in other colours keep their own faces, hands and hair'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = on(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
    sync(); syncRow();
  }
  function wireRow() {
    if (typeof renderAccessibilityMenu !== 'function' || typeof document === 'undefined') return;
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () {
      const r = _acc.apply(this, arguments);
      try {
        const grid = document.querySelector('#modal-panel .ctl-grid');
        if (grid && !document.getElementById(ROW[0])) {
          const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(ROW[1] + ' '));
          const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = ROW[2]; lab.appendChild(sm);
          const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
          b.onclick = () => setOn(!on());
          const after = document.getElementById('gfx-curve');
          if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
          else { grid.appendChild(lab); grid.appendChild(b); }
          syncRow();
        }
      } catch (e) { warnOnce('row', e); }
      return r;
    };
  }
  try { wireRow(); } catch (e) { warnOnce('wire', e); }

  // ================================================================ Phase 124c: faces of their own
  // People who borrow the townsman's or the townswoman's portrait get a painted portrait of their own (the owner's
  // ruling of 24 Nov 2026: made with a picture-making tool in the style of the first twenty-eight, for portraits only).
  // OWN: the person's NPC id (or, where several NPC ids are one person, the figure's sprite id that they all wear) ->
  // the file stem of img/p_<stem>.jpg, 96 by 96. A later portrait is one file and one row here; test/own124.test.js
  // checks every row. Only someone who borrows one of the two faces is ever served: the twenty-eight painted
  // portraits and the people who have them are never touched. Mood faces (js/portraits.js) are for the story's
  // portraits only, so an own portrait has none, as any minor portrait.
  // Switch: GFX.ownFaces, Options > Graphics "Faces of their own", on by default, off in Original (PRESETS.keep). Off,
  // portrait() returns the entry's own portrait, so every talk window is what it was.
  const OWN = {
    p113f_marrable: 'own_marrable',   // Old Marrable, the Fold's lamp-teller (js/fold113.js)
    p100_tr_b: 'own_watch132',        // trooper 132 of the Null-Watch: the figure, worn by NPCS.p100_tr_b (js/rift100.js) and NPCS.p113_trooper at the tip (js/tip113.js)
    p97_tallyman: 'own_tallyman',     // the Tallyman of the White Mile (js/whitemile97.js)
  };
  const OWN_FLAG = 'ownFaces', BORROWED = ['townsman', 'townswoman'];
  try {
    if (typeof GFX !== 'undefined') {
      if (GFX.FX && !GFX.FX.includes(OWN_FLAG)) GFX.FX.push(OWN_FLAG);
      if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(OWN_FLAG); else if (GFX[OWN_FLAG] === undefined) GFX[OWN_FLAG] = true;
    }
  } catch (e) { /* no GFX: a tool's page */ }
  const ownOn = () => typeof GFX === 'undefined' || GFX[OWN_FLAG] !== false;
  const hasOwn = (k) => typeof k === 'string' && Object.prototype.hasOwnProperty.call(OWN, k);
  const IDS = new WeakMap();
  function idOf(n) {
    if (IDS.has(n)) return IDS.get(n);
    try { if (typeof NPCS !== 'undefined') for (const k of Object.keys(NPCS)) if (NPCS[k] === n) { IDS.set(n, k); return k; } } catch (e) { /* none */ }
    return null;   // not (yet) in the table: not remembered, so a person added later is found
  }
  // servedBy(npcOrId): the OWN row that serves this person (switch on or off), or null
  function servedBy(x) {
    try {
      const id = typeof x === 'string' ? x : x && typeof x === 'object' ? idOf(x) : null;
      const n = typeof x === 'string' ? (typeof NPCS !== 'undefined' ? NPCS[x] : null) : x;
      if (!n || typeof n !== 'object' || !BORROWED.includes(n.portrait) || BORROWED.includes(id)) return null;
      if (hasOwn(id)) return id;
      if (hasOwn(n.sprite)) return n.sprite;
    } catch (e) { warnOnce('servedBy', e); }
    return null;
  }
  // portrait(npcOrId): the portrait name to show (img/p_<name>.jpg): the person's own if the switch is on and OWN has
  // them, otherwise exactly the entry's own portrait, as before
  function portrait(x) {
    const n = typeof x === 'string' ? (typeof NPCS !== 'undefined' ? NPCS[x] : null) : x;
    const base = n && typeof n === 'object' ? n.portrait : undefined;
    if (!ownOn()) return base;
    const k = servedBy(x); return k ? OWN[k] : base;
  }
  const OWN_ROW = ['gfx-ownfaces124', 'Faces of their own', 'the people met since Book One have painted portraits of their own in the talk window'];
  function syncOwnRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(OWN_ROW[0]); if (!b) return;
    const v = ownOn(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOwn(v) {
    GFX[OWN_FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (GFX.changed) GFX.changed();
    syncOwnRow();
  }
  try { if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(syncOwnRow); } catch (e) { warnOnce('onChange own', e); }
  // the row sits right after "Recoloured people keep their skin" (this wrapper is outside that one, so it runs after it)
  function wireOwnRow() {
    if (typeof renderAccessibilityMenu !== 'function' || typeof document === 'undefined') return;
    const _acc = renderAccessibilityMenu;
    renderAccessibilityMenu = function () {
      const r = _acc.apply(this, arguments);
      try {
        const grid = document.querySelector('#modal-panel .ctl-grid');
        if (grid && !document.getElementById(OWN_ROW[0])) {
          const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(OWN_ROW[1] + ' '));
          const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = OWN_ROW[2]; lab.appendChild(sm);
          const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = OWN_ROW[0]; b.type = 'button'; b.setAttribute('aria-label', OWN_ROW[1]);
          b.onclick = () => setOwn(!ownOn());
          const after = document.getElementById(ROW[0]) || document.getElementById('gfx-curve');
          if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
          else { grid.appendChild(lab); grid.appendChild(b); }
          syncOwnRow();
        }
      } catch (e) { warnOnce('own row', e); }
      return r;
    };
  }
  try { wireOwnRow(); } catch (e) { warnOnce('wire own', e); }

  return { FLAG, ROW, OWN, OWN_FLAG, OWN_ROW, portrait, servedBy, skin, maskOf, hsl, hueDist, on, sync, recolours: () => REG.map((e) => ({ name: e.name, src: e.src, from: e.from, data: e.data, tinted: e.tinted, base: e.base })), stats: () => Object.assign({}, stats) };
})();
if (typeof window !== 'undefined') window.FACES124 = FACES124;
