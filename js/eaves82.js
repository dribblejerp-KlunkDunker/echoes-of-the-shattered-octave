// ============================================================
//  eaves82 — Phase 82, "the other six": the building style of each region Phase 78 did not reach. It adds itself to
//  EAVES78 (js/eaves78.js): an entry in STYLES with a planner, and drawers in EXTRA and REGION for what only each
//  place has. Like Phase 78 it is the 3D renderer only, it touches no map, wall or anything the game reads, it saves
//  nothing and it uses no random numbers. The switch is the same one (GFX.eaves, "Roofs, windows and eaves").
//
//  Owner, 11 Nov: "each region should have at least something unique about it even from a building and house
//  perspective. Nothing that's over the top but enough so that each new area and region is cool and unique enough to
//  want to explore." Every detail below that the books do not give is [PROPOSED].
//
//    Stillwater Landing   (Vol II: "River port at the Flume's lower lock. Smugglers' town"; the game: "a wharf of grown
//               planking on a basin of green water, and nobody who looks up"; the lockkeeper "does his business on the
//               porch, in the air, where he can see who is listening"; the cooperage; the Bonded Store.) Black-tarred
//               board under reed thatch. Blind backs: no window looks at the lane, every one looks at the water. The
//               lockkeeper's house has its porch; the Bonded Store a hoist-house over its door; the cooperage a
//               smoke-louvre along its ridge.
//    The Low Rings        (Vol II: Oakhaven's "flooded lower city, abandoned since the Flume began over-pumping"; the
//               game: "roofs and upper floors stand out of green water"; "a loft with a stove still warm".) Oakhaven's
//               own timber and plaster under slate and moss tile, with what the water did to it: a tide-line on every
//               wall, roofs holed to the rafters, every shutter closed, and no window lit but one loft's.
//    Wethercombe          (Phase 22: flint and thatch; the Bellwether, "a ram with a bell at his throat"; the Chalk
//               Ram.) Flint under deep straw thatch pulled low. Even the yard walls wear thatch (as the chalk-cob
//               walls of the real downs do), and a straw ram stands on the Bellwether's ridge (as thatchers put straw
//               birds and hares on theirs).
//    The Watch Downs      (ruled canon: the sheepfold, "dry stone with the gate gone".) Nothing on the Downs has a roof.
//               Dry stone with cock-and-hen coping: a row of stones set on edge along the top, tall and short by turns.
//    Driftwood Cay        (the game: Hesper's orphan-house, "low, square, a kitchen window with the light on and a row
//               of boots by the door"; "grey scrub, bent all one way"; "the wind is steady up here".) Lime-wash under
//               marram thatch, the roof roped down and weighted with stones against the wind; a porch of driftwood;
//               the kitchen window lit.
//    The Flume Road       (Vol I/II: the Flume is a living aqueduct; the game: "The channel wall is grown, not built.
//               Green light moves in it like sap"; it "leaves the Hedge by a grown-wood arch".) Nothing here was built.
//               The Flume has ribs: living hoops grown over the water, a bead of sap-light at each crown after dusk.
//
//  EAVES82.rects(map, part)     the rectangles of building in a map (solid, or a ring of wall round a yard)
//  EAVES82.house(map, rect, o)  a building for EAVES78 from a rectangle
// ============================================================
'use strict';

const EAVES82 = (() => {
  if (typeof EAVES78 === 'undefined' || !EAVES78.EXTRA) return {};
  const E = EAVES78, h2 = E.h2, LIFT = E.LIFT, roofZ = E.roofZ, min = Math.min, max = Math.max, abs = Math.abs, hyp = Math.hypot, PI = Math.PI;

  // ---------------------------------------------------------------- which blocks are a building
  // A building is a rectangle of `part` cells: solid, or a ring of wall round an open yard. Doors count as wall.
  function rects(m, part) {
    const W = m.w, H = m.h, g = m.cells, seen = new Uint8Array(W * H), out = [];
    const cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : g[y * W + x], is = (x, y) => { const c = cell(x, y); return !!c && part(c); }, open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !cell(x, y);
    for (let sy = 1; sy < H - 1; sy++) for (let sx = 1; sx < W - 1; sx++) {
      if (seen[sy * W + sx] || !is(sx, sy)) continue;
      let x0 = sx, x1 = sx, y0 = sy, y1 = sy, n = 0; const st = [[sx, sy]], cells = []; seen[sy * W + sx] = 1;
      while (st.length) { const [x, y] = st.pop(); n++; cells.push([x, y]); x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y);
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 1 || Y < 1 || X >= W - 1 || Y >= H - 1 || seen[Y * W + X] || !is(X, Y)) continue; seen[Y * W + X] = 1; st.push([X, Y]); } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1, hollow = n !== w * h;
      if (w < 2 || h < 2 || (hollow && (w < 3 || h < 3 || n !== 2 * w + 2 * h - 4))) continue;
      if (hollow && cells.some(([x, y]) => x !== x0 && x !== x1 && y !== y0 && y !== y1)) continue;
      const doors = []; let label = '', wallTex = null;
      for (const [x, y] of cells) { const c = cell(x, y);
        if (c.door) { const nx = x === x0 && open(x - 1, y) ? -1 : x === x1 && open(x + 1, y) ? 1 : 0, ny = nx ? 0 : y === y0 && open(x, y - 1) ? -1 : y === y1 && open(x, y + 1) ? 1 : 0; if (nx || ny) doors.push({ x, y, nx, ny }); if (c.label) label += c.label + ' '; }
        else if (!wallTex && (x === x0 || x === x1 || y === y0 || y === y1)) wallTex = c.tex; }
      if (wallTex) out.push({ x0, y0, x1, y1, w, h, n, hollow, cells, doors, label: label.trim(), wallTex });
    }
    return out;
  }

  // A building for EAVES78 from a rectangle. o: { axis, type, pitch, maxRidge, ext, over, verge, roofTex, gableTex, boardTex, ridgeTex,
  //   win (the window style, or null for none), faces(nx, ny) (which walls have windows), lit(x, y, nx, ny), shut, attic, plinth, plain }
  function house(m, r, o = {}) {
    const W = m.w, lv = (x, y) => (m.lvls ? m.lvls[y * W + x] || 0 : 0), cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= m.h) ? null : m.cells[y * W + x], open = (x, y) => x >= 0 && y >= 0 && x < W && y < m.h && !cell(x, y);
    const topOf = (c, x, y) => c.top != null ? c.top : lv(x, y) + 1, { x0, y0, x1, y1, w, h } = r, edge = (x, y) => x === x0 || x === x1 || y === y0 || y === y1;
    let top = 1e9; const lids = [];
    for (const [x, y] of r.cells) { const c = cell(x, y); if (c.door) continue; const t = topOf(c, x, y); lids.push({ x, y, top: t }); if (edge(x, y)) top = min(top, t); }
    // where the old lid stands well above the walls it is an upper floor: the wall is carried up round it (o.wrapLid)
    const lidTop = lids.reduce((a, c) => max(a, c.top), top), wrap = o.wrapLid && lidTop - top > 0.3 ? lidTop - top + 0.03 : 0;
    const ax = (o.axis || (w >= h ? 'x' : 'y')) === 'x', across = ax ? h : w, proud = 0.03, half = across / 2 + proud, ext = max(o.ext || 0, wrap), wallTop = top + ext, type = o.type || 'gable';
    const b = { x0, y0, x1, y1, w, h, axis: ax ? 'x' : 'y', stone: !!o.stone, church: false, plain: !!o.plain, storeys: ext > 0.4 ? 2 : 1, label: r.label, top, ext, jetty: 0, skin: ext > 0 ? proud : 0, wallTop, wallTex: r.wallTex,
      towers: [], dome: null, solid: !r.hollow, type, ridges: 1, half, span: half, C: ax ? (y0 + y1 + 1) / 2 : (x0 + x1 + 1) / 2, A0: (ax ? x0 : y0) - proud, A1: (ax ? x1 : y1) + 1 + proud,
      windows: [], doors: r.doors, plinth: [], dormers: [], stacks: [], extras: [], over: o.over, verge: o.verge, roofTex: o.roofTex || 'e78_thatch', gableTex: o.gableTex, boardTex: o.boardTex, ridgeTex: o.ridgeTex, e82: true };
    b.pitch = o.pitch || E.PITCH; if (o.maxRidge) b.pitch = min(b.pitch, (o.maxRidge - wallTop - LIFT) / half);
    // the whole of the old lid stays under the new roof
    b.zBase = wallTop + LIFT; let need = 0;
    if (!ext) for (const c of lids) for (let k = 0; k < 9; k++) { const z = roofZ(b, c.x + (k % 3) / 2, c.y + ((k / 3) | 0) / 2); if (z != null && c.top + 0.04 - z > need) need = c.top + 0.04 - z; }
    b.lift = LIFT + need; b.zBase = wallTop + b.lift; b.ridge = b.zBase + half * b.pitch;
    // windows, and a footing
    const style = o.win === undefined ? 'cottage' : o.win;
    for (const [nx, ny, along, fixed] of [[0, -1, 'x', y0], [0, 1, 'x', y1], [-1, 0, 'y', x0], [1, 0, 'y', x1]]) {
      const a0 = along === 'x' ? x0 : y0, a1 = along === 'x' ? x1 : y1, len = a1 - a0 - 1, faced = !o.faces || o.faces(nx, ny);
      for (let a = a0; a <= a1; a++) { const x = along === 'x' ? a : fixed, y = along === 'x' ? fixed : a, c = cell(x, y), i = a - a0 - 1;
        if (!c || c.door || !open(x + nx, y + ny)) continue;
        if (o.plinth) b.plinth.push({ x, y, nx, ny });
        const px = along === 'x' ? 1 : 0, py = along === 'x' ? 0 : 1, pa = cell(x - px, y - py), pb = cell(x + px, y + py);
        if (!style || !faced || a === a0 || a === a1 || (len % 2 ? i % 2 !== 0 : i % 2 !== 1) || (pa && pa.door) || (pb && pb.door) || (m.decals && m.decals[y * W + x])) continue;
        const cx = x + 0.5 + nx * 0.5, cy = y + 0.5 + ny * 0.5, gz = lv(x + nx, y + ny), t = topOf(c, x, y), z1 = min(t - 0.2, gz + 0.8), z0 = z1 - 0.43;
        const lit = o.lit ? !!o.lit(x, y, nx, ny) : h2(x * 7 + 3, y * 13 + 1) < 0.6;
        if (z0 >= gz + 0.25) b.windows.push({ cx, cy, nx, ny, z0, z1, hw: 0.21, style, lit, shut: o.shut });
        if (ext > 0.4) b.windows.push({ cx: cx + nx * proud, cy: cy + ny * proud, nx, ny, z0: top + 0.13, z1: top + ext - 0.1, hw: 0.18, style: o.upper || style, lit: lit && h2(x, y * 3) < 0.5, shut: o.shut });
      }
    }
    if (type === 'gable' && o.attic && half * b.pitch >= 0.75) for (const [a, na] of [[b.A0, -1], [b.A1, 1]]) {
      const wx = ax ? a : b.C, wy = ax ? b.C : a, nx = ax ? na : 0, ny = ax ? 0 : na; if (o.faces && !o.faces(nx, ny)) continue;
      b.windows.push({ cx: wx, cy: wy, nx, ny, z0: b.zBase + 0.1, z1: b.zBase + min(0.42, half * b.pitch * 0.42), hw: 0.14, style: 'attic', lit: !!(o.lit ? o.lit(wx | 0, wy | 0, nx, ny) : h2(wx * 11 | 0, wy * 17 | 0) < 0.4) });
    }
    return b;
  }
  const onPlane = (d) => ({ x: d.x + 0.5 + d.nx * 0.5, y: d.y + 0.5 + d.ny * 0.5, nx: d.nx, ny: d.ny });

  // ---------------------------------------------------------------- the six regions
  const WATERSIDE = (nx, ny) => ny === 1;                        // the Landing's wharf lies south of its houses
  function planLanding(m) {
    const houses = [], part = (c) => c.door || /^t_house|^t_wood$/.test(c.tex || '') || c.tex === 't_roof';
    for (const r of rects(m, part)) {
      const coop = /cooperage/i.test(r.label), keeper = /lockkeeper/i.test(r.label), store = /Bonded/i.test(r.label), small = min(r.w, r.h) < 3;
      const b = house(m, r, { pitch: small ? 0.8 : 0.95, maxRidge: store ? 3.1 : 2.55, ext: store ? 0.55 : 0, over: 0.3, verge: 0.2, roofTex: 'e82_reed', gableTex: 'e82_tar', ridgeTex: 'e82_sedge', boardTex: 'e82_tar',
        win: small ? null : (keeper ? 'cottage' : 'hatch'), upper: 'hatch', faces: WATERSIDE, lit: () => keeper, attic: keeper, plinth: true, plain: !keeper });
      const d = r.doors[0];
      if (keeper && d) { b.extras.push(Object.assign(onPlane(d), { kind: 'e82_porch', z: b.top - 0.1, zg: 0 })); b.stacks.push({ x: r.x1 + 0.45, y: b.C }); }
      if (store && d) b.extras.push(Object.assign(onPlane(d), { kind: 'e82_lucam', z: b.top + 0.08 }));
      if (coop) b.extras.push({ kind: 'e82_louvre', x: 0, y: 0, nx: 0, ny: 1 });
      houses.push(b);
    }
    return { houses };
  }
  function planRings(m) {
    const houses = [], part = (c) => c.door || /^t_house|^t_marble/.test(c.tex || '') || c.tex === 't_roof';
    for (const r of rects(m, part)) {
      if (min(r.w, r.h) < 3) continue;
      const loft = /^A loft/i.test(r.label), k = h2(r.x0 * 3 + 1, r.y0 * 5 + 2), stone = /^t_marble/.test(r.wallTex);
      let one = false;                                           // the hidden household's loft: one window, lit
      const b = house(m, r, { type: stone ? 'hip' : 'gable', pitch: stone ? 0.5 : 0.62 + k * 0.16, maxRidge: 3.3, over: 0.24, verge: 0.16, roofTex: stone || k < 0.5 ? 'e82_mossslate' : 't_roof', stone,
        win: stone ? null : 'hatch', lit: () => false, plain: true, wrapLid: true });
      if (loft) { const w = b.windows.find((q) => q.ny === 1) || b.windows[0]; if (w) { w.style = 'cottage'; w.lit = true; one = true; } }
      b.sunk = true; b.loft = one; houses.push(b);
    }
    return { houses };
  }
  function planCombe(m) {
    const houses = [], part = (c) => c.door || /^t_p22_(flint|thatch)|^t_wood$|^t_house/.test(c.tex || '');
    for (const r of rects(m, part)) {
      if (min(r.w, r.h) < 3 || r.hollow) continue;
      const barn = /^t_wood/.test(r.wallTex), inn = /Bellwether/i.test(r.label);
      const b = house(m, r, { pitch: 0.92, over: 0.36, verge: 0.3, roofTex: Engine.textures.t_p22_thatch ? 't_p22_thatch' : 'e78_thatch', ridgeTex: 'e82_sedge', boardTex: 'e82_sedge', win: barn ? 'hatch' : 'cottage', attic: !barn, plain: barn,
        lit: (x, y) => !barn && h2(x * 7 + 3, y * 13 + 1) < 0.7 });
      if (inn) b.extras.push({ kind: 'e82_strawram', x: 0, y: 0, nx: 0, ny: 1 });
      houses.push(b);
    }
    return { houses };
  }
  function planCay(m) {
    const houses = [], part = (c) => c.door || /^p17c_(plaster|slate)/.test(c.tex || '');
    for (const r of rects(m, part)) {
      if (min(r.w, r.h) < 3) continue;
      const d = r.doors[0], b = house(m, r, { pitch: 0.5, over: 0.2, verge: 0.12, roofTex: 'e82_marram', ridgeTex: 'e82_rope', boardTex: 'e78_cope', win: 'cottage', shut: 'blue', lit: (x, y, nx, ny) => !!d && nx === d.nx && ny === d.ny });
      b.extras.push({ kind: 'e82_roped', x: 0, y: 0, nx: 0, ny: 1 });
      if (d) b.extras.push(Object.assign(onPlane(d), { kind: 'e82_drift', z: b.top - 0.08, zg: 0 }));
      b.stacks.push(b.axis === 'x' ? { x: r.x1 + 0.5, y: b.C } : { x: b.C, y: r.y1 + 0.5 });
      houses.push(b);
    }
    return { houses };
  }
  const none = () => ({ houses: [] });
  Object.assign(E.STYLES, {
    flume_landing: { builds: 'black-tarred board under reed thatch', shutters: 'tarred board', only: ['blind backs: no window looks at the lane, every one looks at the water', "the lockkeeper's porch", "the Bonded Store's hoist-house", "the cooperage's smoke-louvre"], plan: planLanding },
    flume_lowrings: { builds: "Oakhaven's timber and plaster under slate and moss tile, as the water left it", shutters: 'closed', only: ['a tide-line on every wall', 'roofs holed to the rafters', "no window lit but one loft's"], plan: planRings },
    p22_combe: { builds: 'flint under deep straw thatch', shutters: 'green-grey', only: ['even the yard walls wear thatch', "a straw ram on the Bellwether's ridge"], plan: planCombe },
    p20_downs: { builds: 'dry stone', shutters: 'none', only: ['nothing on the Downs has a roof', 'cock-and-hen coping on every wall'], plan: none },
    cantabile_cay: { builds: 'lime-wash under marram thatch', shutters: 'sea-blue', only: ['the roof roped down and weighted with stones', 'a porch of driftwood', 'the kitchen window lit'], plan: planCay },
    flume_road: { builds: 'nothing built: grown wood', shutters: 'none', only: ['the ribs: living hoops grown over the water, a bead of sap-light at each crown after dusk'], plan: none },
  });
  const MINE = ['flume_landing', 'flume_lowrings', 'p22_combe', 'p20_downs', 'cantabile_cay', 'flume_road'];
  for (const id of MINE) E.MAPS.add(id);

  // ---------------------------------------------------------------- the tiles this needs
  let texDone = false;
  E.PREP.push(() => {
    if (texDone || typeof Engine === 'undefined' || !Engine.textures || !Engine.addTexture) return;
    const rgb = (r, g, b, a = 255) => ((a << 24) | (min(255, max(0, b)) | 0) << 16 | (min(255, max(0, g)) | 0) << 8 | (min(255, max(0, r)) | 0)) >>> 0;
    const N = 4096, tar = new Uint32Array(N), reed = new Uint32Array(N), sedge = new Uint32Array(N), marram = new Uint32Array(N), rope = new Uint32Array(N), hole = new Uint32Array(N), tide = new Uint32Array(N), moss = new Uint32Array(N), sap = new Uint32Array(N), louvre = new Uint32Array(N), cob = new Uint32Array(N);
    const slate = Engine.textures.e78_slate || Engine.textures.t_roof;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const i = y * 64 + x, n = h2(x >> 1, y >> 1) - 0.5;
      // tarred weatherboard: lapped boards, a lit edge on each, joints staggered, the odd nail
      { const row = y >> 3, e = y & 7, joint = ((x + ((h2(row, 3) * 40) | 0)) % 41) === 0, k = (e === 0 ? 1.7 : e === 7 ? 0.5 : 1) * (joint ? 0.55 : 1) * (0.9 + n * 0.3 + h2(x >> 3, row) * 0.2), nail = e === 3 && ((x + row * 9) % 20) === 4;
        tar[i] = nail ? rgb(74, 70, 68) : rgb(34 * k, 31 * k, 30 * k); }
      // reed thatch: fine, grey-brown, combed straight down, laid in courses
      { const st = h2(x, y >> 4) * 0.22 + h2(x, (y >> 2) + 9) * 0.1, band = (y % 16) < 2 ? 0.66 : (y % 16) < 4 ? 1.12 : 1, k = (0.74 + st) * band; reed[i] = rgb(126 * k, 114 * k, 90 * k); }
      // a sedge ridge: paler, cross-rodded
      { const dia = ((x + y) % 12 === 0) || ((x - y + 64) % 12 === 0), k = 0.86 + n * 0.25; sedge[i] = dia ? rgb(104 * k, 80 * k, 46 * k) : rgb(178 * k, 160 * k, 112 * k); }
      // marram: the grey-green grass of the dunes, coarse
      { const st = h2(x, y >> 3) * 0.3 + h2(x >> 1, (y >> 4) + 3) * 0.16, band = (y % 20) < 2 ? 0.7 : 1, k = (0.7 + st) * band; marram[i] = rgb(128 * k, 130 * k, 98 * k); }
      // rope: three strands laid up
      { const tw = ((x * 2 + y) % 9), k = (tw < 2 ? 0.6 : tw < 5 ? 1.05 : 0.85) + n * 0.15; rope[i] = rgb(150 * k, 124 * k, 82 * k); }
      // a hole in a roof: a ragged edge, and inside it the dark, rafters and battens
      { const dx = (x - 31.5) / 30, dy = (y - 31.5) / 26, rr = hyp(dx, dy) + (h2(x >> 2, y >> 2) - 0.5) * 0.34 + (h2(x >> 3, (y >> 3) + 5) - 0.5) * 0.3;
        if (rr > 1) hole[i] = 0; else if (rr > 0.86) hole[i] = rgb(46 + n * 20, 50 + n * 20, 52 + n * 20);
        else { const raft = (x % 20) < 4, batt = (y % 9) < 2; hole[i] = raft ? rgb(74 + n * 16, 56 + n * 12, 38) : batt ? rgb(50, 40, 30) : rgb(12, 11, 12); } }
      // the tide-line: weed and stain, ragged at the top, darkest at the water
      { const edge = 14 + h2(x >> 2, 3) * 12 + h2(x, 7) * 5; if (y < edge) tide[i] = 0; else { const t = (y - edge) / (64 - edge), k = 1 - t * 0.5 + n * 0.2; tide[i] = rgb(40 * k, 60 * k, 42 * k, y < edge + 3 ? 150 : 255); } }
      // slate gone green
      { const c = slate ? slate[i] : rgb(96, 104, 120), g = h2(x >> 3, y >> 3) + h2(x >> 1, y >> 1) * 0.35, m = g > 0.72 ? 0.75 : g > 0.55 ? 0.35 : 0;
        moss[i] = rgb((c & 255) * (1 - m) + 62 * m, ((c >>> 8) & 255) * (1 - m) + 92 * m, ((c >>> 16) & 255) * (1 - m) + 50 * m); }
      // a bead of sap-light
      { const rr = hyp(x - 31.5, y - 31.5) / 30; sap[i] = rr > 1 ? 0 : rr > 0.55 ? rgb(70, 190, 96, 255) : rgb(150 + 90 * (1 - rr), 255, 150 + 60 * (1 - rr)); }
      // louvre slats
      { const e = y % 9; louvre[i] = e < 5 ? rgb(60 + n * 16 - e * 5, 52 + n * 14 - e * 5, 44 + n * 12 - e * 4) : rgb(9, 9, 11); }
      // lime-washed cob for a thatched wall's cap board
      { const k = 0.9 + n * 0.2; cob[i] = rgb(206 * k, 198 * k, 176 * k); }
    }
    for (const [name, d] of [['e82_tar', tar], ['e82_reed', reed], ['e82_sedge', sedge], ['e82_marram', marram], ['e82_rope', rope], ['e82_hole', hole], ['e82_tide', tide], ['e82_mossslate', moss], ['e82_sap', sap], ['e82_louvre', louvre], ['e82_cob', cob]]) Engine.addTexture(name, d);
    texDone = true;
  });

  // ---------------------------------------------------------------- what only one building has
  const frame = (e) => { const tx = -e.ny, ty = e.nx; return (t, off, z) => [e.x + tx * t + e.nx * off, e.y + ty * t + e.ny * off, z]; };
  // a box given along-the-wall and out-from-the-wall extents
  const wbox = (e, T, t0, t1, o0, o1, z0, z1, L, Lt, k) => { const tx = -e.ny, ty = e.nx, xa = e.x + tx * t0 + e.nx * o0, xb = e.x + tx * t1 + e.nx * o1, ya = e.y + ty * t0 + e.ny * o0, yb = e.y + ty * t1 + e.ny * o1; T.box(min(xa, xb), min(ya, yb), max(xa, xb), max(ya, yb), z0, z1, L, Lt == null ? L : Lt, k); };
  const ridgeFrame = (b) => { const ax = b.axis === 'x'; return (a, s, z) => ax ? [a, b.C + s, z] : [b.C + s, a, z]; };

  // the lockkeeper's porch: a reed lean-to on two posts, a rail between them. "He does his business on the porch, in the air."
  E.EXTRA.e82_porch = (e, b, T) => {
    const at = frame(e), n = [e.nx, e.ny, 0], side = e.nx ? 1 : 0.8, hw = 1.25, out = 0.92, zo = e.z, zi = e.z + 0.34, Lr = T.L('e82_reed'), Ld = T.L('e78_dark'), Lt = T.L('e82_tar');
    const up = T.planeN(at(-hw, out, zo), at(hw, out, zo), at(hw, 0.01, zi), T.UP), sl = hyp(out, zi - zo);
    T.quad([at(-hw, out, zo), at(hw, out, zo), at(hw, 0.01, zi), at(-hw, 0.01, zi)], [[0, sl], [hw * 2, sl], [hw * 2, 0], [0, 0]], Lr, T.MAT.wall, side, up);
    T.quad([at(-hw, out, zo - 0.014), at(hw, out, zo - 0.014), at(hw, 0.01, zi - 0.014), at(-hw, 0.01, zi - 0.014)], [[0, sl], [hw * 2, sl], [hw * 2, 0], [0, 0]], Ld, T.MAT.wall, 0.6, [-up[0], -up[1], -up[2]]);
    T.quad([at(-hw, out, zo + 0.014), at(hw, out, zo + 0.014), at(hw, out, zo - 0.07), at(-hw, out, zo - 0.07)], [[0, 0], [hw * 2, 0], [hw * 2, 0.08], [0, 0.08]], Lt, T.MAT.wall, side * 1.05, n);
    for (const sg of [-1, 1]) {
      wbox(e, T, sg * (hw - 0.1) - 0.045, sg * (hw - 0.1) + 0.045, out - 0.14, out - 0.05, e.zg, zo, Lt, Lt, 1.05);                      // a post
      T.tri([at(sg * hw, out, zo), at(sg * hw, 0.01, zo), at(sg * hw, 0.01, zi)], [[0, 0.3], [out, 0.3], [out, 0]], Lt, T.MAT.wall, 0.85, [-e.ny * sg, e.nx * sg, 0]);   // the cheek
      wbox(e, T, sg * 0.62, sg * (hw - 0.1), out - 0.115, out - 0.075, e.zg + 0.42, e.zg + 0.47, Lt, Lt, 1.1);                          // the rail, open at the middle for the step
    }
  };
  // the Bonded Store's hoist-house: boarded out from the gable over the door, its own small roof, a rope and block under it
  E.EXTRA.e82_lucam = (e, b, T) => {
    const at = frame(e), hw = 0.44, out = 0.46, z0 = e.z, z1 = e.z + 0.5, zr = z1 + 0.26, Lt = T.L('e82_tar'), Lr = T.L('e82_reed'), Ld = T.L('e78_dark'), Lrope = T.L('e82_rope'), side = e.nx ? 1 : 0.8;
    wbox(e, T, -hw, hw, 0, out, z0, z1, Lt, Lt, 1);
    T.quad([at(-hw, 0, z0), at(hw, 0, z0), at(hw, out, z0), at(-hw, out, z0)], [[0, 0], [hw * 2, 0], [hw * 2, out], [0, out]], Ld, T.MAT.wall, 0.55, T.DN);
    T.tri([at(-hw, out, z1), at(hw, out, z1), at(0, out, zr)], [[0, 0.26], [hw * 2, 0.26], [hw, 0]], Lt, T.MAT.wall, side, [e.nx, e.ny, 0]);
    for (const sg of [-1, 1]) { const q = [at(sg * (hw + 0.07), out + 0.08, z1 - 0.04), at(0, out + 0.08, zr + 0.02), at(0, -0.02, zr + 0.02), at(sg * (hw + 0.07), -0.02, z1 - 0.04)];
      T.quad(q, [[0, 0.6], [0, 0], [0.56, 0], [0.56, 0.6]], Lr, T.MAT.wall, sg < 0 ? 1 : 0.86, T.planeN(q[0], q[1], q[2], T.UP)); }
    T.quad([at(-0.2, out + 0.012, z0 + 0.06), at(0.2, out + 0.012, z0 + 0.06), at(0.2, out + 0.012, z1 - 0.06), at(-0.2, out + 0.012, z1 - 0.06)], [[0, 1], [1, 1], [1, 0], [0, 0]], T.L('e78_shutter'), T.MAT.wall, side * 1.1, [e.nx, e.ny, 0]);   // the loading door, shut
    wbox(e, T, -0.035, 0.035, out - 0.02, out + 0.3, z1 - 0.02, z1 + 0.05, Ld, Ld, 1.05);                                             // the beam
    wbox(e, T, -0.014, 0.014, out + 0.22, out + 0.248, z0 - 0.42, z1 - 0.02, Lrope, Lrope, 1.2);                                      // the fall
    wbox(e, T, -0.04, 0.04, out + 0.19, out + 0.27, z0 - 0.5, z0 - 0.42, Ld, Ld, 1);                                                  // the block
  };
  // the cooperage's smoke-louvre: a slatted lantern along the ridge under its own narrow roof
  E.EXTRA.e82_louvre = (e, b, T) => {
    const P = ridgeFrame(b), a0 = b.A0 + 1.1, a1 = b.A1 - 1.1, s = 0.3, zl = b.ridge - s * b.pitch, zt = b.ridge + 0.24, zr = zt + 0.2, Ll = T.L('e82_louvre'), Lr = T.L(b.roofTex), Lt = T.L('e82_tar'), Nn = (na, ns) => b.axis === 'x' ? [na, ns, 0] : [ns, na, 0];
    if (a1 - a0 < 0.6) return;
    for (const sg of [-1, 1]) {
      T.quad([P(a0, sg * s, zl), P(a1, sg * s, zl), P(a1, sg * s, zt), P(a0, sg * s, zt)], [[a0 * 2, 1], [a1 * 2, 1], [a1 * 2, 0.25], [a0 * 2, 0.25]], Ll, T.MAT.wall, 0.95, Nn(0, sg));
      const q = [P(a0 - 0.1, sg * (s + 0.12), zt - 0.03), P(a1 + 0.1, sg * (s + 0.12), zt - 0.03), P(a1 + 0.1, 0, zr), P(a0 - 0.1, 0, zr)];
      T.quad(q, [[a0, 0.5], [a1, 0.5], [a1, 0], [a0, 0]], Lr, T.MAT.wall, sg < 0 ? 1 : 0.86, T.planeN(q[0], q[1], q[2], T.UP));
    }
    for (const [a, na] of [[a0, -1], [a1, 1]]) { T.quad([P(a, -s, zl), P(a, s, zl), P(a, s, zt), P(a, -s, zt)], [[0, 0.3], [0.6, 0.3], [0.6, 0], [0, 0]], Lt, T.MAT.wall, 0.9, Nn(na, 0));
      T.tri([P(a, -s, zt), P(a, s, zt), P(a, 0, zr)], [[0, 0.2], [0.6, 0.2], [0.3, 0]], Lt, T.MAT.wall, 0.9, Nn(na, 0)); }
  };
  // a straw ram on the Bellwether's ridge, facing down the drove road
  E.EXTRA.e82_strawram = (e, b, T) => {
    const P = ridgeFrame(b), Ls = T.L('e82_sedge'), a = (b.A0 + b.A1) / 2, z = b.ridge + 0.02, K = 1.7;
    const bx = (a0, a1, s0, s1, z0, z1, k) => { const p = P(a + a0 * K, s0 * K, 0), q = P(a + a1 * K, s1 * K, 0); T.box(min(p[0], q[0]), min(p[1], q[1]), max(p[0], q[0]), max(p[1], q[1]), z + z0 * K, z + z1 * K, Ls, Ls, k); };
    for (const da of [-0.13, 0.11]) for (const ds of [-0.055, 0.055]) bx(da - 0.02, da + 0.02, ds - 0.02, ds + 0.02, 0, 0.12, 0.85);     // legs
    bx(-0.19, 0.17, -0.085, 0.085, 0.1, 0.27, 1.05);                                                                                   // the fleece
    bx(0.14, 0.25, -0.05, 0.05, 0.21, 0.34, 1.12);                                                                                     // neck and head
    bx(0.22, 0.32, -0.04, 0.04, 0.2, 0.28, 1.0);                                                                                       // the nose
    for (const sg of [-1, 1]) { bx(0.13, 0.2, sg * 0.05, sg * 0.085, 0.25, 0.33, 0.8); bx(0.17, 0.22, sg * 0.06, sg * 0.095, 0.2, 0.26, 0.8); }   // the horns, curled
    bx(-0.215, -0.19, -0.02, 0.02, 0.18, 0.24, 0.9);                                                                                   // the tail
  };
  // Driftwood Cay: ropes over the thatch, a stone hung on each end; a second line along each slope ties them
  E.EXTRA.e82_roped = (e, b, T) => {
    const P = ridgeFrame(b), Lr = T.L('e82_rope'), Ls = T.L('t_stone'), over = b.over != null ? b.over : E.OVER, verge = b.verge != null ? b.verge : 0.22, p = b.pitch, se = b.span + over, ze = b.zBase - over * p, zr = b.ridge, w = 0.022, lift = 0.022;
    const L = b.A1 - b.A0, n = max(3, Math.round(L / 0.9));
    for (let i = 0; i <= n; i++) { const a = b.A0 - verge * 0.5 + (L + verge) * i / n;
      for (const sg of [-1, 1]) { const q = [P(a - w, sg * (se + 0.02), ze + lift - 0.02 * p), P(a + w, sg * (se + 0.02), ze + lift - 0.02 * p), P(a + w, 0, zr + lift + 0.01), P(a - w, 0, zr + lift + 0.01)];
        T.quad(q, [[0, 2], [0.08, 2], [0.08, 0], [0, 0]], Lr, T.MAT.wall, sg < 0 ? 1.2 : 1.05, T.planeN(q[0], q[1], q[2], T.UP));
        const s0 = sg * (se + 0.02), c = P(a, s0, 0), hs = 0.05 + h2(i * 7 + (sg > 0 ? 3 : 0), b.x0) * 0.025, drop = 0.1 + h2(i * 3, b.y0 + sg) * 0.1;
        T.box(c[0] - 0.008, c[1] - 0.008, c[0] + 0.008, c[1] + 0.008, ze - drop, ze + lift, Lr, Lr, 1.1);                              // the fall of the rope
        T.box(c[0] - hs, c[1] - hs, c[0] + hs, c[1] + hs, ze - drop - hs * 1.7, ze - drop, Ls, Ls, 0.9 + h2(i, 9) * 0.3); }           // its stone
    }
    for (const sg of [-1, 1]) for (const f of [0.38, 0.74]) { const s = sg * se * f, z = b.zBase + (b.span - abs(s)) * p + lift, dz = 0.026 * p, a0 = b.A0 - verge * 0.5, a1 = b.A1 + verge * 0.5;
      const q = [P(a0, s + sg * 0.026, z - dz), P(a1, s + sg * 0.026, z - dz), P(a1, s, z), P(a0, s, z)]; T.quad(q, [[0, 0.08], [L * 2, 0.08], [L * 2, 0], [0, 0]], Lr, T.MAT.wall, sg < 0 ? 1.2 : 1.05, T.planeN(q[0], q[1], q[2], T.UP)); }
  };
  // a porch of driftwood: two posts that were never straight, a plank lid, one plank still with its paint
  E.EXTRA.e82_drift = (e, b, T) => {
    const at = frame(e), Ld = T.L('e78_dark'), Lb = T.L('e78_shutter_blue'), Lw = T.L('t_wood'), hw = 0.62, out = 0.5, side = e.nx ? 1 : 0.8, n = [e.nx, e.ny, 0];
    for (const sg of [-1, 1]) { const t = sg * (hw - 0.07), lean = sg * 0.035;
      wbox(e, T, t - 0.04, t + 0.04, out - 0.11, out - 0.03, e.zg, e.zg + 0.5, Lw, Lw, 0.95); wbox(e, T, t - 0.035 + lean, t + 0.035 + lean, out - 0.12, out - 0.05, e.zg + 0.5, e.z, Lw, Lw, 1.05); }
    const q = [at(-hw - 0.08, out + 0.06, e.z - 0.02), at(hw + 0.05, out + 0.06, e.z + 0.03), at(hw + 0.05, 0.01, e.z + 0.2), at(-hw - 0.08, 0.01, e.z + 0.15)], up = T.planeN(q[0], q[1], q[2], T.UP);
    T.quad(q, [[0, 0.5], [1.3, 0.5], [1.3, 0], [0, 0]], Lw, T.MAT.wall, side * 1.05, up);
    T.quad(q.map((v) => [v[0], v[1], v[2] - 0.03]), [[0, 0.5], [1.3, 0.5], [1.3, 0], [0, 0]], Ld, T.MAT.wall, 0.6, [-up[0], -up[1], -up[2]]);
    T.quad([at(-hw - 0.08, out + 0.06, e.z - 0.02), at(hw + 0.05, out + 0.06, e.z + 0.03), at(hw + 0.05, out + 0.06, e.z - 0.04), at(-hw - 0.08, out + 0.06, e.z - 0.09)], [[0, 0.2], [1, 0.2], [1, 0.5], [0, 0.5]], Lb, T.MAT.wall, side, n);
  };

  // ---------------------------------------------------------------- what belongs to the place, not to one house
  // The Low Rings: the tide-line on every wall that meets the water, and the holes in the roofs.
  E.REGION.flume_lowrings = (m, T, plan) => {
    const W = m.w, cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= m.h) ? null : m.cells[y * W + x], Ltide = T.L('e82_tide'), Lhole = T.L('e82_hole');
    for (const b of plan.houses) {
      for (let y = b.y0; y <= b.y1; y++) for (let x = b.x0; x <= b.x1; x++) { const c = cell(x, y); if (!c) continue;
        for (const [nx, ny] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) { if (cell(x + nx, y + ny)) continue;
          const tx = -ny, ty = nx, cx = x + 0.5 + nx * 0.512, cy = y + 0.5 + ny * 0.512, u0 = (nx ? y : x) * 0.5, zt = 0.36 + h2(x * 3 + nx, y * 5 + ny) * 0.06;
          T.quad([[cx - tx * 0.5, cy - ty * 0.5, 0], [cx + tx * 0.5, cy + ty * 0.5, 0], [cx + tx * 0.5, cy + ty * 0.5, zt], [cx - tx * 0.5, cy - ty * 0.5, zt]], [[u0, 1], [u0 + 0.5, 1], [u0 + 0.5, 0], [u0, 0]], Ltide, T.MAT.wall, (nx ? 1 : 0.8) + 10, [nx, ny, 0]); } }
      if (b.type !== 'gable') continue;
      const P = (a, s, z) => b.axis === 'x' ? [a, b.C + s, z] : [b.C + s, a, z], L = b.A1 - b.A0, nh = 1 + ((h2(b.x0, b.y0 * 7) * 2.4) | 0);
      for (let k = 0; k < nh; k++) { const sg = h2(b.x0 + k * 5, b.y0) < 0.5 ? -1 : 1, a = b.A0 + 0.9 + h2(b.x0 * 3 + k, b.y0 * 11) * max(0.1, L - 1.8), hw = 0.34 + h2(k, b.x0) * 0.2, s0 = b.span * (0.2 + h2(k * 9, b.y0) * 0.2), s1 = min(b.span * 0.86, s0 + 0.55 + h2(k * 4, b.x0) * 0.3);
        const z = (s) => b.zBase + (b.span - s) * b.pitch + 0.02, q = [P(a - hw, sg * s1, z(s1)), P(a + hw, sg * s1, z(s1)), P(a + hw, sg * s0, z(s0)), P(a - hw, sg * s0, z(s0))];
        T.quad(q, [[0.02, 0.98], [0.98, 0.98], [0.98, 0.02], [0.02, 0.02]], Lhole, T.MAT.wall, (sg < 0 ? 1 : 0.86) + 10, T.planeN(q[0], q[1], q[2], T.UP)); }
    }
  };
  // low stone walls: where they run, and which way
  function lowWalls(m) {
    const W = m.w, out = [], cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= m.h) ? null : m.cells[y * W + x], lv = (x, y) => (m.lvls ? m.lvls[y * W + x] || 0 : 0);
    const low = (x, y) => { const c = cell(x, y); if (!c || c.door || !/^t_stone/.test(c.tex || '') || c.top == null) return null; const hgt = m.lvls ? c.top - lv(x, y) : c.top; return hgt > 0.12 && hgt < 0.75 ? c : null; };
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < W - 1; x++) { const c = low(x, y); if (!c) continue;
      out.push({ x, y, top: c.top, tex: c.tex, w: !!low(x - 1, y), e: !!low(x + 1, y), n: !!low(x, y - 1), s: !!low(x, y + 1) }); }
    return out;
  }
  // Wethercombe: the yard walls wear thatch, a little ridge of straw on a lime-washed cap
  E.REGION.p22_combe = (m, T) => {
    const Lt = T.L(Engine.textures.t_p22_thatch ? 't_p22_thatch' : 'e78_thatch'), Lc = T.L('e82_cob'), o = 0.1, rise = 0.2;
    for (const q of lowWalls(m)) {
      const z = q.top, alongX = (q.w || q.e) && !(q.n || q.s), alongY = (q.n || q.s) && !(q.w || q.e), x0 = q.x, x1 = q.x + 1, y0 = q.y, y1 = q.y + 1;
      T.box(x0 - 0.03, y0 - 0.03, x1 + 0.03, y1 + 0.03, z, z + 0.035, Lc, Lc, 1.1);
      const zb = z + 0.035, zr = zb + rise;
      if (alongX || alongY) {
        const P = (a, s, zz) => alongX ? [a, q.y + 0.5 + s, zz] : [q.x + 0.5 + s, a, zz], a0 = (alongX ? x0 : y0) - ((alongX ? q.w : q.n) ? 0 : o), a1 = (alongX ? x1 : y1) + ((alongX ? q.e : q.s) ? 0 : o);
        for (const sg of [-1, 1]) { const p = [P(a0, sg * (0.5 + o), zb - 0.03), P(a1, sg * (0.5 + o), zb - 0.03), P(a1, 0, zr), P(a0, 0, zr)]; T.quad(p, [[a0, 0.5], [a1, 0.5], [a1, 0], [a0, 0]], Lt, T.MAT.wall, sg < 0 ? 1.05 : 0.9, T.planeN(p[0], p[1], p[2], T.UP)); }
        for (const [a, na, shut] of [[a0, -1, alongX ? q.w : q.n], [a1, 1, alongX ? q.e : q.s]]) if (!shut) T.tri([P(a, -0.5 - o, zb - 0.03), P(a, 0.5 + o, zb - 0.03), P(a, 0, zr)], [[0, 0.3], [1.2, 0.3], [0.6, 0]], Lt, T.MAT.wall, 0.8, alongX ? [na, 0, 0] : [0, na, 0]);
      } else {                                                   // a corner or a lone pier: a small cap of four slopes
        const cx = q.x + 0.5, cy = q.y + 0.5, e = 0.5 + o, c = [[cx - e, cy - e], [cx + e, cy - e], [cx + e, cy + e], [cx - e, cy + e]];
        for (let k = 0; k < 4; k++) { const p0 = [c[k][0], c[k][1], zb - 0.03], p1 = [c[(k + 1) % 4][0], c[(k + 1) % 4][1], zb - 0.03], tip = [cx, cy, zr + 0.04]; T.tri([p0, p1, tip], [[0, 0.5], [1.2, 0.5], [0.6, 0]], Lt, T.MAT.wall, k % 2 ? 0.9 : 1.05, T.planeN(p0, p1, tip, T.UP)); }
      }
    }
  };
  // The Watch Downs: cock-and-hen coping, stones set on edge along the top of every wall, tall and short by turns
  E.REGION.p20_downs = (m, T) => {
    for (const q of lowWalls(m)) {
      const L = T.L(q.tex), alongY = (q.n || q.s) && !(q.w || q.e), n = 8;
      for (let i = 0; i < n; i++) { const r = h2(q.x * 5 + i, q.y * 3), hen = (i + q.x + q.y) % 2 === 0, hgt = hen ? 0.09 + r * 0.03 : 0.17 + r * 0.06, t0 = i / n + 0.014 + r * 0.01, t1 = (i + 1) / n - 0.014, in0 = 0.1 + r * 0.07, in1 = 0.1 + h2(i, q.x + q.y) * 0.07;
        if (alongY) T.box(q.x + in0, q.y + t0, q.x + 1 - in1, q.y + t1, q.top, q.top + hgt, L, L, 0.85 + r * 0.3);
        else T.box(q.x + t0, q.y + in0, q.x + t1, q.y + 1 - in1, q.top, q.top + hgt, L, L, 0.85 + r * 0.3); }
    }
  };
  // The Flume Road: the ribs. A living hoop grown from the channel wall over the water to the bank, every few paces.
  E.REGION.flume_road = (m, T) => {
    const W = m.w, cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= m.h) ? null : m.cells[y * W + x], lv = (x, y) => (m.lvls ? m.lvls[y * W + x] || 0 : 0);
    const wet = (x, y) => !cell(x, y) && m.floorCells && m.floorTextures && /water/.test(m.floorTextures[m.floorCells[y * W + x]] || ''), Lsap = T.L('e82_sap');
    for (let x = 2; x < W - 2; x += 3) {
      // the channel at this x: a grown wall, and the run of water south of it
      let yw = -1; for (let y = 1; y < m.h - 2; y++) { const c = cell(x, y); if (c && /^p16f_grown/.test(c.tex || '') && wet(x, y + 1)) { yw = y; break; } } if (yw < 0) continue;
      let ye = yw + 1; while (wet(x, ye + 1)) ye++;
      const c = cell(x, yw), Lb = T.L(c.tex), zA = (c.top != null ? c.top : lv(x, yw) + 1) - 0.02, zB = lv(x, ye) + 0.02, yA = yw + 0.72, yB = ye + 0.93, cx = x + 0.5 + (h2(x, 3) - 0.5) * 0.3, H = 1.0 + h2(x, 7) * 0.25, S = 9, r0 = 0.085, r1 = 0.05;
      const pt = (t) => [cx + Math.sin(t * PI) * (h2(x, 11) - 0.5) * 0.16, yA + (yB - yA) * t, zA + (zB - zA) * t + H * 4 * t * (1 - t)], rad = (t) => r0 + (r1 - r0) * Math.sin(t * PI);
      for (let i = 0; i < S; i++) { const t0 = i / S, t1 = (i + 1) / S, p = pt(t0), q = pt(t1), ra = rad(t0), rb = rad(t1), v0 = t0 * 3, v1 = t1 * 3;
        const ring = (c0, rr) => [[c0[0] - rr, c0[1], c0[2] + rr], [c0[0] + rr, c0[1], c0[2] + rr], [c0[0] + rr, c0[1], c0[2] - rr], [c0[0] - rr, c0[1], c0[2] - rr]], A = ring(p, ra), Bq = ring(q, rb);
        for (let k = 0; k < 4; k++) { const k2 = (k + 1) % 4, quad = [A[k], A[k2], Bq[k2], Bq[k]], nrm = k === 0 ? [0, 0, 1] : k === 1 ? [1, 0, 0] : k === 2 ? [0, 0, -1] : [-1, 0, 0];
          T.quad(quad, [[k * 0.25, v0], [k * 0.25 + 0.25, v0], [k * 0.25 + 0.25, v1], [k * 0.25, v1]], Lb, T.MAT.wall, k === 0 ? 1.15 : k === 2 ? 0.6 : 0.9, nrm); } }
      // the bead at the crown: dull by day, alight after dusk
      const top = pt(0.5), zb = top[2] - rad(0.5) - 0.02, s = 0.085, G = T.dusk ? T.MAT.glow : T.MAT.wall, k = T.dusk ? 1 : 0.55;
      T.quad([[top[0] - s, top[1], zb - 2 * s], [top[0] + s, top[1], zb - 2 * s], [top[0] + s, top[1], zb], [top[0] - s, top[1], zb]], [[0, 1], [1, 1], [1, 0], [0, 0]], Lsap, G, k + 10, [0, 1, 0]);
      T.quad([[top[0], top[1] - s, zb - 2 * s], [top[0], top[1] + s, zb - 2 * s], [top[0], top[1] + s, zb], [top[0], top[1] - s, zb]], [[0, 1], [1, 1], [1, 0], [0, 0]], Lsap, G, k + 10, [1, 0, 0]);
    }
  };

  return { MAPS: MINE, rects, house, lowWalls };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = EAVES82;
if (typeof window !== 'undefined') window.EAVES82 = EAVES82;
