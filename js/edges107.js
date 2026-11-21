// ============================================================
//  edges107 — Phase 107, "natural edges": the chalk country and the drove roads end in a hedgerow on its bank, or in
//  the wood itself, not in a wall.
//
//  The owner, 20 Nov: "Change some of the edges so that it looks more natural of a barrier". The Phase 106 sweep found
//  that most open places end in a tall, level, stone-grey wall standing all round the horizon, like the edge of a stage.
//  That wall is the tile of the Hedge, Oakhaven's own ("The Hedge was grey", "three men deep of thorn and packed wool",
//  "planted to swallow sound"), borrowed as a plain border by places far from Oakhaven, where inspecting it even said
//  "The Hedge". Oakhaven's Hedge and the places beside it (Outside the Hedge, Greenroot, the Flume landings, the
//  orchards and yards) are left exactly as they are: there, the grey wall is the Hedge.
//
//  In the places below, the border (every Hedge-tile cell within two cells of the map's edge, with nothing else on it)
//  becomes:
//    * a field hedgerow (thorn and hazel, haws, old man's beard), its top
//      rising and falling along each side, from about chest height to a little over head height, so the skyline is
//      uneven and the downs beyond show over the low places (the ground past the edge runs on, Phase 106);
//    * in the Deep Grove, the wood's edge (holly and hazel under the trees, trunks in the shade) at the height of trees.
//  Next to a gate or a door the hedge keeps its full height, so the gate posts still have something to stand in.
//  Heights are above the highest ground under each cell (on a scarp the hedge stands on the scarp), and come from
//  hashed smooth noise along each side (no random numbers): the same every time. Nothing changes what
//  you can walk through: a cell that was solid is solid.
//
//  Switch: GFX.edges107 (in GFX.FX: off in Original, on in every other preset); Options row "Natural edges". Off puts
//  every cell object back as it was. EDGES107.apply(m) / restore(m); EDGES107.PLACES; EDGES107.stats().
// ============================================================
'use strict';

const EDGES107 = (() => {
  const FLAG = 'edges107', TEX = 'e107_hedgerow', TEX_WOOD = 'e107_woodedge';
  if (typeof GFX !== 'undefined') {
    if (GFX[FLAG] === undefined) GFX[FLAG] = (typeof PRESETS !== 'undefined' && PRESETS.startValue) ? PRESETS.startValue(FLAG) : true;
    if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
  }
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('edges107 ' + k, e); };

  // which places, and what their edge becomes: [texture, lowest top, highest top]
  const HEDGEROW = [TEX, 0.55, 1.6], WOOD = [TEX_WOOD, 1.4, 2.8];
  const PLACES = {
    p20_downs: HEDGEROW, p22_combe: HEDGEROW, p49_meadow: HEDGEROW,
    p83_stride: HEDGEROW, p83_poundstair: HEDGEROW, p83_wethers: HEDGEROW, p83_hollows: HEDGEROW,
    p85_sunklanes: HEDGEROW, p85_crosspool: HEDGEROW, p85_deepgrove: WOOD,
  };

  // ---------------------------------------------------------------- the hedgerow tile (64 x 64, wraps left to right)
  const T = 64;
  const hash = (a, b, c) => { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263) + Math.imul(c | 0, 1442695041)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const rgb = (h) => { const n = parseInt(h.slice(1), 16); return (255 << 24 | (n & 255) << 16 | (n >> 8 & 255) << 8 | n >> 16) >>> 0; };
  const ramp = (...h) => h.map(rgb);
  const band = (P, t) => P[Math.max(0, Math.min(P.length - 1, Math.floor(t * P.length)))];
  // all leaf, top to bottom: a wall tile repeats up a tall wall, so anything banded across it (a bank, a lip) would
  // show as a stripe halfway up the hedge. kind 0: the hedgerow; kind 1: the wood's edge (darker, trunks in the shade)
  function paintLeaves(kind) {
    const d = new Uint32Array(T * T), K = 20 + kind * 40;
    const LEAF = kind ? ramp('#0c140a', '#121d0e', '#1a2a13', '#233819', '#2e4820', '#3c5a28', '#4c6c30')
                      : ramp('#1f3015', '#2a3f1b', '#365022', '#44622a', '#567534', '#6a8a40', '#7e9c4a');
    for (let i = 0; i < T * T; i++) d[i] = LEAF[1];
    if (kind) for (const [x0, w] of [[9, 3], [30, 4], [51, 2]]) for (let y = 0; y < T; y++) for (let x = 0; x < w; x++) d[y * T + x0 + x] = rgb(x === 0 ? '#2a2620' : '#1a1814');   // trunks in the shade
    // clumps on a grid that wraps both ways, each lit from the upper left
    for (let gy = 0; gy < 6; gy++) for (let gx = 0; gx < 6; gx++) {
      const cx = gx * 10.67 + hash(gx, gy, K + 1) * 7, cy = gy * 10.67 + hash(gx, gy, K + 2) * 7, r = 5 + hash(gx, gy, K + 3) * (kind ? 3 : 4);
      for (let y = Math.floor(cy - r); y <= Math.ceil(cy + r); y++) for (let xx = Math.floor(cx - r); xx <= Math.ceil(cx + r); xx++) {
        const dx = xx - cx, dy = y - cy, q = (dx * dx + dy * dy) / (r * r); if (q > 1) continue;
        const lit = 0.5 + 0.5 * Math.max(-1, Math.min(1, (-dx - dy * 1.2) / r)), leaf = hash(xx & 63, y & 63, K + 4) < 0.22 ? -0.18 : 0;
        d[(y & 63) * T + (xx & 63)] = band(LEAF, 0.15 + (1 - q) * 0.35 + lit * 0.42 + leaf);
      }
    }
    for (let k = 0; k < 9; k++) { const x0 = Math.floor(hash(k, 0, K + 5) * T), y0 = Math.floor(hash(k, 1, K + 5) * T); for (let y = 0; y < 3; y++) for (let x = 0; x < 4 + (k & 3); x++) d[((y0 + y) & 63) * T + ((x0 + x - y) & 63)] = LEAF[0]; }   // hollows
    if (!kind) {
      for (let k = 0; k < 26; k++) { const x = Math.floor(hash(k, 0, 6) * T), y = Math.floor(hash(k, 1, 6) * T); d[y * T + x] = rgb(hash(k, 2, 6) < 0.5 ? '#9a2018' : '#b8301e'); }                       // haws
      for (let k = 0; k < 7; k++) { const x0 = Math.floor(hash(k, 0, 7) * T), y0 = Math.floor(hash(k, 1, 7) * T); for (let s = 0; s < 6; s++) d[((y0 + s) & 63) * T + ((x0 + (s >> 1)) & 63)] = rgb(s & 1 ? '#a8a898' : '#c4c2b2'); }   // old man's beard
    } else {
      for (let k = 0; k < 14; k++) { const x = Math.floor(hash(k, 0, 66) * T), y = Math.floor(hash(k, 1, 66) * T); d[y * T + x] = rgb('#5a7a30'); d[y * T + ((x + 1) & 63)] = rgb('#6e8e3a'); }      // a few lit leaves
    }
    return d;
  }
  const paintHedgerow = () => paintLeaves(0);
  try { if (typeof Engine !== 'undefined' && Engine.addTexture) { if (!Engine.textures[TEX]) Engine.addTexture(TEX, paintLeaves(0)); if (!Engine.textures[TEX_WOOD]) Engine.addTexture(TEX_WOOD, paintLeaves(1)); } } catch (e) { warnOnce('texture', e); }

  // ---------------------------------------------------------------- the edge
  // smooth value noise along one side, wavelength about seven cells
  const noise1 = (t, seed) => { const i = Math.floor(t), f = t - i, s = f * f * (3 - 2 * f); return hash(i, seed, 13) * (1 - s) + hash(i + 1, seed, 13) * s; };
  const seedOf = (id) => { let n = 2166136261; for (let i = 0; i < id.length; i++) { n ^= id.charCodeAt(i); n = Math.imul(n, 16777619); } return n | 0; };
  let changed = 0;
  function groundUnder(m, x, y) {
    if (typeof m.groundAt !== 'function') return 0;
    let g = -Infinity;
    for (const [fx, fy] of [[0.02, 0.02], [0.98, 0.02], [0.02, 0.98], [0.98, 0.98], [0.5, 0.5]]) { const v = +m.groundAt(x + fx, y + fy); if (Number.isFinite(v)) g = Math.max(g, v); }
    return Number.isFinite(g) ? g : 0;
  }
  function isPlain(c) { if (!c || c.tex !== 't_hedge') return false; for (const k in c) if (k !== 'tex') return false; return true; }
  function apply(m) {
    if (!m || !m.cells || m._edges107 || !PLACES[m.id]) return;
    const [tex, lo, hi] = PLACES[m.id];
    if (!(typeof Engine !== 'undefined' && Engine.textures && Engine.textures[tex])) return;
    const W = m.w, H = m.h, S = seedOf(m.id), list = [];
    const gateNear = (x, y) => { for (let dy = -2; dy <= 2; dy++) for (let dx = -2; dx <= 2; dx++) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const c = m.cells[Y * W + X]; if (c && (c.door || (c.tex && c.tex !== 't_hedge'))) return true; } return false; };
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
      const dEdge = Math.min(x, y, W - 1 - x, H - 1 - y); if (dEdge > 1) continue;
      const i = y * W + x, c = m.cells[i]; if (!isPlain(c)) continue;
      // which side it belongs to (the nearer one), and its place along that side
      const side = dEdge === y ? 0 : dEdge === H - 1 - y ? 1 : dEdge === x ? 2 : 3, along = side < 2 ? x : y;
      // long swells (about seven cells), shorter ones (two or three), and each cell's own bush: the swells are stretched
      // so the hedge really does run from low to high, and the cell's own part keeps a long run from reading as a wall
      const sw = Math.max(0, Math.min(1, (noise1(along / 7, S + side * 101) - 0.5) * 2.2 + 0.5));
      const n = Math.max(0, Math.min(1, sw * 0.7 + noise1(along / 2.3, S + side * 101 + 7) * 0.2 + hash(along, side, S) * 0.1));
      // a wall's top is a height in the world, not above its own ground: on a scarp or a hill the hedge stands on the
      // highest ground under its cell (Codex review, PR #153)
      const g = groundUnder(m, x, y);
      const top = Math.round((g + (gateNear(x, y) ? Math.max(1, hi * 0.5 + 0.5) : lo + (hi - lo) * n)) * 100) / 100;
      const mine = { tex, top, edge107: true };
      list.push([i, c, mine]);
    }
    m._edges107 = list;
    changed += list.length;
    sync(m);
  }
  function sync(m) {
    if (!m || !m._edges107) return;
    const want = on(); let any = false;
    for (const [i, orig, mine] of m._edges107) { const c = want ? mine : orig; if (m.cells[i] !== c) { m.cells[i] = c; any = true; } }
    if (any && typeof G !== 'undefined' && G.map === m && typeof R3D !== 'undefined' && R3D.invalidate) { try { R3D.invalidate(); } catch (e) { warnOnce('invalidate', e); } }
  }
  function restore(m) { if (m && m._edges107) for (const [i, orig] of m._edges107) m.cells[i] = orig; }
  function syncAll() { if (typeof G !== 'undefined' && G.maps) for (const id in G.maps) { apply(G.maps[id]); sync(G.maps[id]); } try { syncRow(); } catch (e) { /* menu closed */ } }

  // ---------------------------------------------------------------- what it is called
  const LABEL = { [TEX]: 'A hedgerow: thorn and hazel, haws, and old man\'s beard over all. Too thick to push through.', [TEX_WOOD]: 'The edge of the wood: holly and hazel under the trees, too thick to push through.' };

  // ---------------------------------------------------------------- the Options row
  const ROW = ['gfx-edges107', 'Natural edges', 'the downs and drove roads end in hedgerows and woods, not a wall'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = on(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    syncAll(); if (GFX.changed) GFX.changed();
    syncRow();
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
          const after = document.getElementById('gfx-sharp107') || document.getElementById('gfx-cover105') || document.getElementById('gfx-hdtex');
          if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
          else { grid.appendChild(lab); grid.appendChild(b); }
          syncRow();
        }
      } catch (e) { warnOnce('row', e); }
      return r;
    };
  }
  try { wireRow(); } catch (e) { warnOnce('wire', e); }

  return { FLAG, TEX, TEX_WOOD, PLACES, apply, sync, restore, syncAll, on, setOn, LABEL, ROW, paintHedgerow, stats: () => ({ cells: changed }) };
})();

// Wrap the world build last (as js/ceilings.js does), so every finished map gets its edge; loadMap re-syncs.
(function () {
  try {
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); for (const id in maps) { EDGES107.apply(maps[id]); EDGES107.sync(maps[id]); } return maps; }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function (id, pos) { if (G.maps && G.maps[id]) { EDGES107.apply(G.maps[id]); EDGES107.sync(G.maps[id]); } return _l.apply(this, arguments); }; }
    if (typeof wallLabel === 'function') { const _w = wallLabel; wallLabel = function (cell) { return (cell && EDGES107.LABEL[cell.tex]) || _w.apply(this, arguments); }; }
    if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { EDGES107.syncAll(); });
    EDGES107.syncAll();
  } catch (e) { console.warn('edges107 wrap', e); }
})();
