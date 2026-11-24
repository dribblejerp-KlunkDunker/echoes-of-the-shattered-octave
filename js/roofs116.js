// ============================================================
//  roofs116 — Phase 116: roofs for the later places (Sun-Peak Vigil, Null-Watch, Cross Pool), then their houses raised
//  as Phase 108 raised the older towns'. 3D renderer only; part of the eaves art (GFX.ART 'eaves', Options -> "Roofs,
//  windows and eaves"), so it follows that switch, and the Original preset (which draws the classic view) never sees it.
//
//  Phase 108's first question to the owner: "The later places are not built as houses with roofs ... Raising them would
//  mean designing their buildings' roofs from the books first." The books (story/Game Layer/Phase 116 - Roofs for the
//  later places.md, first section) say nothing of any roof in any of the three, so every roof here is [PROPOSED]:
//    Sun-Peak Vigil   ("Mountain monastery", Vol II :91; "Peaks, white as bone ... snow on their summits", Book Two Part
//               Two :523; "Alabaster peaks in the south", Series Bible :205.) Pale stone. Steep roofs of heavy stone
//               slates on the two ranges of cells, the weather (west) pitch under snow and the other bare; a lean-to
//               pentice of the same slates over the cloister walk, its low edge on a beam laid over the white pillars;
//               a small gable over the gate; a low stone cap over the bell tower on four piers, the bell still plain to
//               see between them; one stone stack and one thin smoke (twelve people keep one fire). Nothing gilded,
//               nothing coloured.
//    Null-Watch       ("obsidian and lead mortar, four miles of it. Everything heavy. Everything cold", Vol VI §1; the
//               Watch's coats are lead-plated, Book Three Part One :783; the guns wear lead hoods, Part Three :1357.)
//               Low roofs of dull grey lead sheet with rolled seams, darker in the laps, on the Talking Halls and on the
//               few blockhouses that stand free in the Watch's blockwork. Black blockwork below. Nothing on the wall,
//               its towers, its batteries, the cart gate or the mooring-yard. No ornament, no chimney-pots; one iron
//               stove-pipe on the Halls. Nothing brighter than the wall's own lead; at night they go black with it.
//    Cross Pool       (Oakhaven is "roofed in slate", Vol II :26, and the Low Rings are one of its quarters; the game's
//               own text: "Lead off the garret roofs", "Lead flashing on a garret roof, half off already".) The old
//               town's roofs standing out of the water: slate gone green with moss, ridges that sag, a course or two of
//               slates slipped to show the battens and rafters, and a row of small weavers' windows under the eaves of
//               the garrets, with the salvagers' lead flashing half off four of them. The corn loft and the kerb house
//               are dry inside and you walk into them: they are raised, as Phase 108 raised the Low Rings. Every other
//               house stands in the water, keeps its drowned height and gets only its roof.
//  Raised, as Phase 108 did (PLACES below): the houses' own front doors stand taller than whoever opens them, in a case
//  with a head; the eaves are above head height. A tower, a wall, a gate or a postern is not a house and is not raised.
//
//  The maps are not touched: walls, doors, what can be walked through. No random numbers (hashed noise only).
//  ROOFS116.PLACES          each place's proportions and its own tiles and kinds of roof
//  ROOFS116.roofs(map)      -> [{ kind, place, x0, y0, x1, y1, tex, ... }]  every roof planned in a place
//  ROOFS116.enabled         true; false takes the three places out of the eaves art (the tests compare the frames)
// ============================================================
'use strict';

const ROOFS116 = (() => {
  if (typeof EAVES78 === 'undefined' || !EAVES78.EXTRA) return { PLACES: {}, roofs: () => [], replan: () => true, stats: () => ({}), enabled: false };
  const E = EAVES78, h2 = E.h2, LIFT = E.LIFT, min = Math.min, max = Math.max, abs = Math.abs, hyp = Math.hypot, PI = Math.PI;
  const warned = {}, warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('roofs116 ' + k, e); };
  const VIGIL = 'p96_vigil', WATCH = 'p100_wall', POOL = 'p85_crosspool', MINE = [VIGIL, WATCH, POOL];

  // ---------------------------------------------------------------- each place's proportions (Phase 108's table) [PROPOSED]
  // doorH: a house's front door's leaf (a person is 1); ground: how much taller its ground storey stands; ground0: the
  // ground its door-case stands on, under the door's own sill
  const PLACES = {
    [VIGIL]: { name: 'Sun-Peak Vigil', builds: 'pale stone under heavy stone slates, snow on the weather pitch', ground: 0, ground0: 0, doorH: 1.3,
      why: 'the ranges already stand three and a half high: only the cells\' doors are raised, a stone head over each, the wall made good above it',
      kinds: ['vigil-range', 'vigil-pentice', 'vigil-gate', 'vigil-cap'], tiles: ['r116_vslate', 'r116_snow', 'r116_vridge'] },
    [WATCH]: { name: 'Null-Watch', builds: 'black obsidian blockwork under grey lead', ground: 0, ground0: 0, doorH: 1.3,
      why: 'the Talking Halls already stand three and a half high: only its door is raised, an obsidian head dressed in lead over it',
      kinds: ['watch-halls', 'watch-block'], tiles: ['r116_lead', 'r116_leadroll'] },
    [POOL]: { name: 'Cross Pool', builds: 'Oakhaven\'s timber and slate, drowned', ground: 0.38, ground0: 0, doorH: 1.24,
      why: 'the corn loft and the kerb house, dry inside: the Low Rings\' own proportions (Phase 108), the same town',
      kinds: ['pool-drowned', 'pool-garret', 'pool-raised'], tiles: ['r116_moss', 'r116_slip', 'r116_weave'] },
  };
  let enabled = true;
  const api = { PLACES };
  Object.defineProperty(api, 'enabled', { get: () => enabled, set: (v) => { enabled = !!v; sync(); }, enumerable: true });
  const stats = { hookMs: 0, hookN: 0, smoke: 0, draw: {} };

  // ---------------------------------------------------------------- the tiles
  let texDone = false;
  function textures() {
    if (texDone || typeof Engine === 'undefined' || !Engine.textures || !Engine.addTexture) return;
    const rgb = (r, g, b, a = 255) => ((a << 24) | (min(255, max(0, b)) | 0) << 16 | (min(255, max(0, g)) | 0) << 8 | (min(255, max(0, r)) | 0)) >>> 0;
    const N = 4096, vslate = new Uint32Array(N), snow = new Uint32Array(N), vridge = new Uint32Array(N), lead = new Uint32Array(N), roll = new Uint32Array(N), moss = new Uint32Array(N), slip = new Uint32Array(N), weave = new Uint32Array(N);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const i = y * 64 + x, n = h2(x >> 1, y >> 1) - 0.5, n4 = h2(x >> 2, y >> 2) - 0.5;
      // heavy pale stone slates: four deep courses to the tile, the joints staggered, each slate its own shade, a thick
      // shadow under each course's lower edge (the slates are an inch thick)
      { const row = y >> 4, e = y & 15, off = ((h2(row, 17) * 24) | 0) + row * 11, sx = (x + off) % 64, slate = (sx / 21) | 0, joint = sx % 21 === 0;
        const tone = 0.9 + h2(slate + row * 7, 31) * 0.14, k = tone * (e >= 14 ? 0.56 : e === 13 ? 0.78 : e === 0 ? 1.08 : 1) * (joint ? 0.66 : 1) + n * 0.05 + (h2(x >> 3, y >> 3) - 0.5) * 0.04;
        vslate[i] = rgb(186 * k, 182 * k, 172 * k); }
      // snow lying on the weather pitch: white going blue in the hollows, the courses faintly under it, wind-ribbed
      { const rib = Math.sin((x * 0.21 + y * 0.09) + h2(x >> 3, 7) * 2) * 0.5 + 0.5, course = (y & 15) >= 14 ? 0.95 : 1, k = (0.93 + rib * 0.05 + n * 0.03) * course;
        snow[i] = rgb(226 * k, 232 * k, 240 * k + 4); }
      // the stone ridge: long dressed stones, darker
      { const k = (0.76 + n * 0.1) * (x % 32 === 0 ? 0.6 : 1) * (y < 3 ? 1.12 : 1); vridge[i] = rgb(168 * k, 164 * k, 154 * k); }
      // lead sheet: dull grey, a little oxide bloom, the laps (one sheet over the next) dark lines across, every sheet
      // between rolls three to the tile; no green (that is Whisper-Grove's)
      { const lap = y % 21, bloom = h2(x >> 3, (y >> 3) + 40) < 0.2 ? 0.07 : 0, k = (0.97 + n * 0.08 + n4 * 0.05 + bloom) * (lap === 0 ? 0.58 : lap === 1 ? 0.74 : lap === 20 ? 1.08 : 1);
        lead[i] = rgb(80 * k, 84 * k, 90 * k); }
      // a lead roll or flashing: rounded, the light on its crown
      { const c = Math.cos((x / 64) * PI * 2), k = 0.86 + c * 0.16 + n * 0.06; roll[i] = rgb(92 * k, 96 * k, 102 * k); }
      // slate gone green: the drowned town's, the moss in deep clumps along the courses, lichen, damp streaks down
      { const row = y >> 3, e = y & 7, sx = (x + ((h2(row, 3) * 13) | 0)) % 64, joint = sx % 13 === 0, k0 = (e === 7 ? 0.6 : e === 0 ? 1.1 : 1) * (joint ? 0.7 : 1) * (0.9 + h2((sx / 13) | 0, row) * 0.16);
        const g = h2(x >> 3, y >> 3) * 0.6 + h2(x >> 2, y >> 2) * 0.3 + h2(x >> 1, (y >> 1) + 9) * 0.25 + (e >= 5 ? 0.12 : 0), streak = h2(x >> 1, 77) < 0.12 ? 0.82 : 1;
        let r = 78 * k0, gg = 86 * k0, b = 98 * k0;
        if (g > 0.62) { const t = min(1, (g - 0.62) * 2.6), tuft = h2(x, y) < 0.18 ? 1.18 : 1; r = r * (1 - t) + 66 * tuft * t; gg = gg * (1 - t) + 98 * tuft * t; b = b * (1 - t) + 46 * tuft * t; }
        if (h2(x * 3 + 1, y * 5 + 2) < 0.025) { r = 150; gg = 156; b = 118; }
        moss[i] = rgb(r * streak, gg * streak, b * streak); }
      // a slipped course: ragged slate edges top and bottom (cut out), and between them the battens, the rafters and the
      // dark of the garret
      { const top = 6 + h2(x >> 2, 3) * 9, bot = 58 - h2(x >> 2, 8) * 9;
        if (y < top || y > bot) slip[i] = 0;
        else if (y < top + 2 || y > bot - 2) slip[i] = rgb(40, 46, 44);
        else { const raft = (x % 22) < 5, batt = (y % 10) < 2; slip[i] = raft ? rgb(70 + n * 18, 52 + n * 12, 36) : batt ? rgb(56 + n * 10, 44, 32) : rgb(10, 10, 11); } }
      // a weaver's window: a small casement, six leaded panes in a dark frame; one pane in five gone, one boarded
      { const fr = x < 6 || x > 57 || y < 6 || y > 57, bar = (abs(x - 31.5) < 1.6) || (abs(y - 21.5) < 1.3) || (abs(y - 42.5) < 1.3), pane = (x < 32 ? 0 : 1) + ((y / 21.3) | 0) * 2;
        if (fr) weave[i] = rgb(54 + n * 12, 42 + n * 10, 32 + n * 8);
        else if (bar) weave[i] = rgb(30, 30, 32);
        else if (pane === 3) weave[i] = rgb(6, 6, 8);                                                   // gone
        else if (pane === 4) { const k = 0.8 + h2(x >> 3, 5) * 0.2; weave[i] = rgb(84 * k, 66 * k, 46 * k); }   // boarded
        else { const sheen = abs((x - y * 0.7) % 23) < 2 ? 18 : 0; weave[i] = rgb(24 + sheen + n * 8, 32 + sheen + n * 8, 36 + sheen + n * 10); } }
    }
    for (const [name, d] of [['r116_vslate', vslate], ['r116_snow', snow], ['r116_vridge', vridge], ['r116_lead', lead], ['r116_leadroll', roll], ['r116_moss', moss], ['r116_slip', slip], ['r116_weave', weave]]) Engine.addTexture(name, d);
    texDone = true;
  }
  // PREP runs as each mesh is begun: the time this module's own drawing takes is counted afresh for it
  E.PREP.push(() => { stats.draw = {}; try { textures(); } catch (e) { warnOnce('tiles', e); } });
  const clock = () => (typeof performance !== 'undefined' ? performance.now() : 0);
  const timed = (fn, idOf) => function () { const t0 = clock(); try { return fn.apply(this, arguments); } finally { const id = idOf.apply(null, arguments); stats.draw[id] = (stats.draw[id] || 0) + clock() - t0; } };

  // ---------------------------------------------------------------- the planners
  const cellOf = (m, x, y) => (x < 0 || y < 0 || x >= m.w || y >= m.h) ? null : m.cells[y * m.w + x];
  const lvOf = (m, x, y) => (m.lvls && x >= 0 && y >= 0 && x < m.w && y < m.h ? m.lvls[y * m.w + x] || 0 : 0);
  // a building for EAVES78's gable drawer, from a rectangle and its wall's height
  function gable(m, r, o) {
    const ax = (o.axis || (r.x1 - r.x0 >= r.y1 - r.y0 ? 'x' : 'y')) === 'x', w = r.x1 - r.x0 + 1, h = r.y1 - r.y0 + 1, half = (ax ? h : w) / 2, top = o.top;
    const b = { x0: r.x0, y0: r.y0, x1: r.x1, y1: r.y1, w, h, axis: ax ? 'x' : 'y', stone: !!o.stone, church: false, plain: true, storeys: 1, label: o.label || '', top, ext: 0, jetty: 0, wallTop: top, wallTex: o.wallTex,
      towers: [], dome: null, solid: true, type: o.type || 'gable', ridges: 1, half, span: half, C: ax ? (r.y0 + r.y1 + 1) / 2 : (r.x0 + r.x1 + 1) / 2, A0: ax ? r.x0 : r.y0, A1: (ax ? r.x1 : r.y1) + 1,
      windows: [], doors: [], plinth: [], dormers: [], stacks: [], extras: [], over: o.over, verge: o.verge, parapet: 0, roofTex: o.roofTex, gableTex: o.gableTex, boardTex: o.boardTex, ridgeTex: o.ridgeTex,
      pitch: o.pitch, lift: LIFT, base: o.base || 0, ground: 0 };
    b.zBase = top + LIFT; b.ridge = b.zBase + half * b.pitch;
    return b;
  }
  // a door in a tall wall, raised: { x, y, nx, ny, base, h, tex, face (the wall's top over it) }
  const tallDoor = (m, x, y, T, tex, face) => {
    const nx = cellOf(m, x + 1, y) ? (cellOf(m, x - 1, y) ? 0 : -1) : 1, ny = nx ? 0 : (cellOf(m, x, y + 1) ? -1 : 1), base = lvOf(m, x, y);
    return { x, y, nx, ny, base, h: T.doorH, tex, face };
  };

  // Sun-Peak Vigil: the two ranges of cells (the precinct's west and east sides), the pentice round the cloister walk,
  // the gable over the gate, the cap on the tower
  function planVigil(m) {
    const out = { houses: [], r116: [], doors: [] };
    if (typeof VIGIL96 === 'undefined' || !VIGIL96.P) return out;
    const P = VIGIL96.P, T = PLACES[VIGIL], court = P.court;
    const isRange = (x, y) => { const c = cellOf(m, x, y); return !!c && (c.door || (c.tex === 't_p96v_stone' && abs((c.top || 0) - 3.6) < 0.01)); };
    for (const [x0, x1, side] of [[court[0] - 6, court[0] - 1, 'west'], [court[2] + 1, court[2] + 6, 'east']]) {
      let y0 = court[1], y1 = court[3]; while (y0 > 0 && isRange(x0, y0 - 1) && isRange(x1, y0 - 1)) y0--; while (y1 < m.h - 1 && isRange(x0, y1 + 1) && isRange(x1, y1 + 1)) y1++;
      let ok = true; for (let y = y0; y <= y1 && ok; y++) for (let x = x0; x <= x1; x++) if (!isRange(x, y)) { ok = false; break; }
      if (!ok) { warnOnce('range ' + side, 'not a range'); continue; }
      const b = gable(m, { x0, y0, x1, y1 }, { axis: 'y', top: 3.6, stone: true, wallTex: 't_p96v_stone', gableTex: 't_p96v_stone', boardTex: 't_p96v_stone', ridgeTex: 'r116_vridge', roofTex: 'r116_vslate', pitch: 0.92, over: 0.26, verge: 0.14, label: 'the ' + side + ' range' });
      b.r116 = { kind: 'vigil-range', snow: 'west', side };
      b.extras.push({ kind: 'r116_snow', x: 0, y: 0, nx: 0, ny: 1 });
      // the twelve keep one fire: one stack, on the west range's ridge, over the middle of the cells
      if (side === 'west') { const sy = (court[1] + court[3]) / 2 + 0.5; b.r116.stack = { x: b.C - 0.35, y: sy }; b.extras.push({ kind: 'r116_vstack', x: b.C - 0.35, y: sy, nx: 0, ny: 1 }); }
      // the cells' doors: raised, a stone head, the range made good above
      const dx = side === 'west' ? P.westDoors : P.eastDoors;
      for (const y of P.doorYs) { const c = cellOf(m, dx, y); if (c && c.door) out.doors.push(tallDoor(m, dx, y, T, 't_p96v_door', 3.6)); }
      out.houses.push(b);
    }
    if (out.doors.length) out.houses[0].extras.push({ kind: 'r116_doorways', x: 0, y: 0, nx: 0, ny: 1, list: out.doors, wall: 't_p96v_stone', head: 't_p96v_stone' });
    const g = P.garth;
    out.r116.push({ kind: 'vigil-pentice', place: VIGIL, x0: court[0], y0: court[1], x1: court[2], y1: court[3], tex: 'r116_vslate', inner: [g[0] + 0.2, g[1] + 0.2, g[2] + 0.8, g[3] + 0.8], snow: 'west' });
    out.r116.push({ kind: 'vigil-gate', place: VIGIL, x0: P.gate[0], y0: P.gate[1], x1: P.gate[0], y1: P.gate[1], tex: 'r116_vslate', snow: 'west' });
    out.r116.push({ kind: 'vigil-cap', place: VIGIL, x0: Math.floor(P.tower[0] - 2.5), y0: Math.floor(P.tower[1] - 2.5), x1: Math.floor(P.tower[0] + 2.5), y1: Math.floor(P.tower[1] + 2.5), tex: 'r116_vslate', snow: 'west' });
    return out;
  }

  // Null-Watch: the Talking Halls (the block round its door), and any block of the Watch's blockwork that stands free as
  // a house does: a full rectangle at least three by three, open ground all round, never the wall, a tower or the yard
  function planWatch(m) {
    const out = { houses: [], r116: [], doors: [] };
    if (typeof RIFT100 === 'undefined' || !m._p100) return out;
    const T = PLACES[WATCH], K = m._p100.kind, W = m.w, H = m.h, Pr = RIFT100.P;
    const BLOCK = /^t_p100_(obsidian|barrack)$/;
    const inR = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];
    const lead = (r, top, label, kind) => {
      const b = gable(m, r, { top, wallTex: 't_p100_obsidian', gableTex: 't_p100_obsidian', boardTex: 'r116_leadroll', ridgeTex: 'r116_leadroll', roofTex: 'r116_lead', pitch: 0.28, over: 0.1, verge: 0.06, label });
      const rolls = max(4, Math.round((b.A1 - b.A0) / 0.62) - 1);
      b.r116 = { kind, rolls, pipes: 0 };
      b.extras.push({ kind: 'r116_rolls', x: 0, y: 0, nx: 0, ny: 1, n: rolls });
      return b;
    };
    // the Halls
    const hd = Pr.hallsDoor, dc = hd && cellOf(m, hd[0], hd[1]);
    if (dc && dc.door) {
      const tall = (x, y) => { const c = cellOf(m, x, y); return !!c && ((x === hd[0] && y === hd[1]) || (!c.door && BLOCK.test(c.tex || '') && abs((c.top || 0) - 3.6) < 0.01)); };
      let x0 = hd[0], x1 = hd[0], y0 = hd[1], y1 = hd[1];
      while (tall(x0 - 1, hd[1])) x0--; while (tall(x1 + 1, hd[1])) x1++;
      const row = (y) => { for (let x = x0; x <= x1; x++) if (!tall(x, y)) return false; return true; };
      while (row(y0 - 1)) y0--; while (row(y1 + 1)) y1++;
      const b = lead({ x0, y0, x1, y1 }, 3.6, 'the Talking Halls', 'watch-halls');
      // one iron stove-pipe, on the rear pitch, standing over the ridge
      const a = b.A0 + (b.A1 - b.A0) * 0.64, s = -b.span * 0.42, px = b.axis === 'x' ? a : b.C + s, py = b.axis === 'x' ? b.C + s : a;
      b.extras.push({ kind: 'r116_pipe', x: px, y: py, nx: 0, ny: 1 }); b.r116.pipes = 1;
      out.doors.push(tallDoor(m, hd[0], hd[1], T, 't_p100_door', 3.6));
      b.extras.push({ kind: 'r116_doorways', x: 0, y: 0, nx: 0, ny: 1, list: out.doors, wall: 't_p100_obsidian', head: 'r116_leadroll' });
      out.houses.push(b);
    }
    // the blockhouses
    const free = (x, y) => { const k = y * W + x, c = m.cells[k]; return !!c && !c.door && (K[k] === 0 || K[k] === 2) && BLOCK.test(c.tex || '') && c.top >= 1.9 && c.top <= 3.5; };
    const seen = new Uint8Array(W * H), taken = (x, y) => out.houses.some((q) => x >= q.x0 - 1 && x <= q.x1 + 1 && y >= q.y0 - 1 && y <= q.y1 + 1);
    for (let sy = 1; sy < H - 1; sy++) for (let sx = 1; sx < W - 1; sx++) {
      if (seen[sy * W + sx] || !free(sx, sy)) continue;
      let x0 = sx, x1 = sx, y0 = sy, y1 = sy, n = 0; const st = [[sx, sy]]; seen[sy * W + sx] = 1;
      while (st.length) { const [x, y] = st.pop(); n++; x0 = min(x0, x); x1 = max(x1, x); y0 = min(y0, y); y1 = max(y1, y);
        for (const [ddx, ddy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + ddx, Y = y + ddy; if (X < 1 || Y < 1 || X >= W - 1 || Y >= H - 1 || seen[Y * W + X] || !free(X, Y)) continue; seen[Y * W + X] = 1; st.push([X, Y]); } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1; if (w < 3 || h < 3 || n !== w * h) continue;
      let ok = true, top = 0;
      for (let y = y0 - 1; y <= y1 + 1 && ok; y++) for (let x = x0 - 1; x <= x1 + 1; x++) {
        const inside = x >= x0 && x <= x1 && y >= y0 && y <= y1, k = y * W + x;
        if (inside) { top = max(top, m.cells[k].top); continue; }
        if (m.cells[k] || ![1, 6].includes(K[k]) || inR(Pr.yard, x, y)) { ok = false; break; }
      }
      if (!ok || taken(x0, y0)) continue;
      const b = lead({ x0, y0, x1, y1 }, top, 'a blockhouse', 'watch-block'), band = [];
      // the lower blocks' walls are carried up to the eaves, so the roof sits on one level
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const t = m.cells[y * W + x].top; if (t >= top - 0.01) continue;
        for (const [nx, ny] of [[0, -1], [0, 1], [-1, 0], [1, 0]]) if (x + nx < x0 || x + nx > x1 || y + ny < y0 || y + ny > y1) band.push({ x, y, nx, ny, z0: t, tex: m.cells[y * W + x].tex }); }
      if (band.length) b.extras.push({ kind: 'r116_band', x: 0, y: 0, nx: 0, ny: 1, list: band });
      out.houses.push(b);
    }
    return out;
  }

  // Cross Pool: every house of the old town, by the rectangles Phase 82's planner finds
  function planPool(m) {
    const out = { houses: [], r116: [], doors: [] };
    if (typeof EAVES82 === 'undefined' || !EAVES82.rects || typeof LANES85 === 'undefined') return out;
    const T = PLACES[POOL], TX = LANES85.TX;
    const leadAt = (m.entities || []).filter((e) => e && e._r86 && e._r86.lead != null).map((e) => e.x);
    for (const r of EAVES82.rects(m, (c) => c.door || /^t_house/.test(c.tex || ''))) {
      if (min(r.w, r.h) < 3) continue;
      const loft = r.doors.some((d) => { const c = cellOf(m, d.x, d.y); return c && (c.label === TX.loft || c.label === TX.kerbHouse); });
      const garret = r.doors.some((d) => { const c = cellOf(m, d.x, d.y); return c && c.label === TX.garretShut; });
      const k = h2(r.x0 * 3 + 7, r.y0 * 5 + 1);
      const o = { pitch: garret ? 0.78 : 0.66 + k * 0.14, over: garret ? 0.16 : 0.22, verge: 0.14, roofTex: 'r116_moss', win: loft ? 'hatch' : null, lit: () => false, plain: true, axis: garret ? 'x' : undefined, ext: garret ? 0.34 : 0 };
      const b = EAVES82.house(m, r, o);
      b.type = 'flat';                                                            // the roof is this module's own: it sags
      const kind = loft ? 'pool-raised' : garret ? 'pool-garret' : 'pool-drowned', L = b.A1 - b.A0;
      const R = b.r116 = { kind, pitch: b.pitch, over: o.over, verge: o.verge, sag: 0.07 + h2(r.x0, r.y0 * 3) * 0.12 + (L > 6 ? 0.05 : 0), slips: 0, slipList: [], weavers: 0 };
      if (loft) R.sag *= 0.5;
      // a course or two slipped, on the drowned houses and the garrets
      const ns = loft ? 0 : (h2(r.x0 * 7, r.y0 + 3) * 2.6) | 0;
      for (let i = 0; i < ns; i++) { const sg = h2(r.x0 + i * 5, r.y0 * 9) < 0.5 ? -1 : 1, a = b.A0 + 1 + h2(r.x0 * 11 + i, r.y0) * max(0.2, L - 2), hw = 0.3 + h2(i * 7, r.x0) * 0.35, s0 = b.span * (0.22 + h2(i * 3, r.y0 + 1) * 0.3), s1 = min(b.span * 0.92, s0 + 0.32 + h2(i, r.y0 * 7) * 0.22);
        R.slipList.push({ sg, a, hw, s0, s1 }); }
      R.slips = R.slipList.length;
      if (garret) {
        // a row of small weavers' windows under the eaves, on the side that looks over the board
        const d = r.doors[0], ny = d ? d.ny : -1, n = max(3, Math.floor((r.w - 1) / 0.78)); R.weavers = n;
        b.extras.push({ kind: 'r116_weave', x: 0, y: 0, nx: 0, ny, n });
        if (leadAt.some((x) => x >= r.x0 && x <= r.x1 + 1)) { R.lead = true; b.extras.push({ kind: 'r116_flashing', x: 0, y: 0, nx: 0, ny }); }
      }
      if (loft) {
        // raised as Phase 108 raised the Low Rings (js/towns108.js): the ground storey a band taller, the door a case
        const doors = r.doors.filter((q) => q.nx || q.ny), d0 = doors[0], g0 = d0 ? lvOf(m, d0.x + d0.nx, d0.y + d0.ny) : 0, old = b.top;
        if (abs(old - (g0 + 1)) <= 0.08) {
          const g = T.ground, up = (z) => (typeof z === 'number' && z >= old - 0.35 ? z + g : z);
          b.base = g0; b.ground = g; b.doorH = min(T.doorH, 1 + g - 0.08); b.ring = doors;
          b.top = old + g; b.wallTop += g; b.zBase += g; b.ridge += g;
          for (const w of b.windows) if (w.z0 >= old - 0.05) { w.z0 += g; w.z1 += g; }
          for (const e of b.extras) if ('z' in e) e.z = up(e.z);
          for (const q of doors) out.doors.push({ x: q.x, y: q.y, nx: q.nx, ny: q.ny, base: lvOf(m, q.x, q.y), h: g0 + b.doorH, tex: 'e97_door' + ((h2(q.x * 7 + 1, q.y * 11 + 3) * 3) | 0), abs: true });
        }
      }
      b.extras.push({ kind: 'r116_sag', x: 0, y: 0, nx: 0, ny: 1 });
      out.houses.push(b);
    }
    return out;
  }

  Object.assign(E.STYLES, {
    [VIGIL]: { builds: PLACES[VIGIL].builds, shutters: 'none', only: ['snow on the weather pitch of every roof, the other bare', 'a pentice round the cloister on the white pillars', 'a low stone cap over the bell', 'one thin smoke'], plan: planVigil },
    [WATCH]: { builds: PLACES[WATCH].builds, shutters: 'none', only: ['low lead roofs with rolled seams', 'one iron stove-pipe on the Talking Halls', 'nothing on the wall'], plan: planWatch },
    [POOL]: { builds: PLACES[POOL].builds, shutters: 'closed', only: ['ridges that sag', 'courses slipped to the rafters', 'a row of weavers\' windows under each garret\'s eaves'], plan: planPool },
  });
  function sync() { for (const id of MINE) { if (enabled) E.MAPS.add(id); else E.MAPS.delete(id); } }
  sync();

  // ---------------------------------------------------------------- the taller doors (js/r3d21.js asks EAVES78.door)
  const door0 = E.door;
  E.door = function (m, cx, cy) {
    if (m && PLACES[m.id]) {
      if (!api.enabled || !E.on() || !E.MAPS.has(m.id) || !Engine.textures) return null;
      const p = E.planOf(m);
      if (!p.r116At) { p.r116At = new Map(); for (const d of p.doors || []) { const g = lvOf(m, d.x, d.y); p.r116At.set(d.y * m.w + d.x, { h: (d.abs ? d.h : d.base + d.h) - g, tex: d.tex }); } }
      return p.r116At.get(cy * m.w + cx) || null;
    }
    return door0.apply(this, arguments);
  };

  // ---------------------------------------------------------------- drawing
  const ridgeFrame = (b) => { const ax = b.axis === 'x'; return { P: (a, s, z) => ax ? [a, b.C + s, z] : [b.C + s, a, z], N: (na, ns) => ax ? [na, ns, 0] : [ns, na, 0] }; };
  const frame = (e) => { const tx = -e.ny, ty = e.nx; return (t, off, z) => [e.x + tx * t + e.nx * off, e.y + ty * t + e.ny * off, z]; };
  // which pitch of a gable faces west: for a ridge along y it is s < 0; along x neither does (none for the snow)
  const westSign = (b) => b.axis === 'y' ? -1 : 0;
  // snow on one pitch of a plain gable roof drawn by EAVES78, and a lip of it along the eave
  function snowPitch(T, b, sg) {
    const { P, N } = ridgeFrame(b), p = b.pitch, span = b.span, over = b.over != null ? b.over : E.OVER, verge = b.verge != null ? b.verge : 0.22, zB = b.zBase, a0 = b.A0 - verge - 0.02, a1 = b.A1 + verge + 0.02;
    const se = span + over + 0.02, ze = zB - (over + 0.02) * p, sTop = 0.16, zt = zB + (span - sTop) * p, Ls = T.L('r116_snow'), th = 0.035, sl = hyp(se - sTop, ze - zt);
    const q = [P(a0, sg * se, ze + th), P(a1, sg * se, ze + th), P(a1, sg * sTop, zt + th), P(a0, sg * sTop, zt + th)], up = T.planeN(q[0], q[1], q[2], T.UP);
    T.quad(q, [[a0, sl], [a1, sl], [a1, 0], [a0, 0]], Ls, T.MAT.wall, sg < 0 ? 1 : 0.9, up);
    // the lip, over the fascia, and its ends over the barge boards
    T.quad([P(a0, sg * (se + 0.03), ze - 0.09), P(a1, sg * (se + 0.03), ze - 0.09), P(a1, sg * (se + 0.03), ze + th + 0.01), P(a0, sg * (se + 0.03), ze + th + 0.01)], [[a0, 0.15], [a1, 0.15], [a1, 0], [a0, 0]], Ls, T.MAT.wall, 0.95, N(0, sg));
    for (const [a, na] of [[a0, -1], [a1, 1]]) T.quad([P(a, sg * (se + 0.03), ze - 0.09), P(a, sg * sTop, zt - 0.04), P(a, sg * sTop, zt + th), P(a, sg * (se + 0.03), ze + th + 0.01)], [[0, 0.15], [sl, 0.15], [sl, 0], [0, 0]], Ls, T.MAT.wall, 0.85, N(na, 0));
  }
  E.EXTRA.r116_snow = (e, b, T) => { const sg = westSign(b); if (sg) snowPitch(T, b, sg); };
  // the Vigil's stack: dressed stone, a cap, the one smoke
  E.EXTRA.r116_vstack = (e, b, T) => {
    const z = E.roofZ(b, e.x, e.y); if (z == null) return;
    const zt = b.ridge + 0.85, Lv = T.L('t_p96v_stone'), Lc = T.L('r116_vridge');
    T.box(e.x - 0.26, e.y - 0.3, e.x + 0.26, e.y + 0.3, z - 0.3, zt, Lv, Lc, 0.95);
    T.box(e.x - 0.31, e.y - 0.35, e.x + 0.31, e.y + 0.35, zt, zt + 0.08, Lc, Lc, 1.1);
    T.box(e.x - 0.12, e.y - 0.12, e.x + 0.12, e.y + 0.12, zt + 0.08, zt + 0.1, T.L('e78_dark'), T.L('e78_dark'), 0.5);
    b.r116.stackTop = zt + 0.1;
  };
  // a door in a tall wall, raised: the wall made good over it, a soffit, a case with a head, a step
  E.EXTRA.r116_doorways = (e, b, T) => {
    const Lw = T.L(e.wall), Lh = T.L(e.head), Ld = T.L('e78_dark');
    for (const d of e.list) {
      const cx = d.x + 0.5 + d.nx * 0.5, cy = d.y + 0.5 + d.ny * 0.5, tx = -d.ny, ty = d.nx, n = [d.nx, d.ny, 0], sk = d.nx ? 1 : 0.8, dz = d.base + d.h;
      const at = (t, off, z) => [cx + tx * t + d.nx * off, cy + ty * t + d.ny * off, z];
      T.quad([at(-0.5, 0, dz), at(0.5, 0, dz), at(0.5, 0, d.face), at(-0.5, 0, d.face)], [[0, d.face - dz], [1, d.face - dz], [1, 0], [0, 0]], Lw, T.MAT.wall, sk, n);
      T.quad([at(-0.5, 0, dz), at(0.5, 0, dz), at(0.5, -1, dz), at(-0.5, -1, dz)], [[0, 0], [1, 0], [1, 1], [0, 1]], Ld, T.MAT.wall, 0.5, T.DN);
      const bx = (t0, t1, o0, o1, z0, z1, L, k) => { const p0 = at(t0, o0, 0), p1 = at(t1, o1, 0); T.box(min(p0[0], p1[0]), min(p0[1], p1[1]), max(p0[0], p1[0]), max(p0[1], p1[1]), z0, z1, L, L, k); };
      bx(-0.5, -0.36, -0.05, 0.045, d.base, dz, Lw, 1.05); bx(0.36, 0.5, -0.05, 0.045, d.base, dz, Lw, 1.05);   // the jambs
      bx(-0.62, 0.62, -0.05, 0.07, dz - 0.04, dz + 0.16, Lh, 1.12);                                            // the head
      bx(-0.55, 0.55, 0, 0.22, d.base, d.base + 0.05, Lw, 1.1);                                                   // the step
    }
  };
  // Null-Watch: the rolled seams, down both pitches, a roll at every joint of the sheets
  E.EXTRA.r116_rolls = (e, b, T) => {
    const { P } = ridgeFrame(b), p = b.pitch, span = b.span, over = b.over != null ? b.over : E.OVER, zB = b.zBase, se = span + over, Lr = T.L('r116_leadroll'), n = e.n, w = 0.035, hgt = 0.045;
    const z = (s) => zB + (span - abs(s)) * p;
    for (let i = 1; i <= n; i++) { const a = b.A0 + (b.A1 - b.A0) * i / (n + 1);
      for (const sg of [-1, 1]) { const e0 = sg * se, e1 = sg * 0.06;
        for (const k of [-1, 1]) { const q = [P(a + k * w, e0, z(e0) + 0.004), P(a, e0, z(e0) + hgt), P(a, e1, z(e1) + hgt), P(a + k * w, e1, z(e1) + 0.004)];
          T.quad(q, [[0, 0], [0.5, 0], [0.5, 1.5], [0, 1.5]], Lr, T.MAT.wall, k < 0 ? 1.05 : 0.88, T.planeN(q[0], q[1], q[2], [k * (b.axis === 'x' ? 1 : 0), k * (b.axis === 'x' ? 0 : 1), 1])); }
        const c = P(a, e0, 0); T.box(c[0] - (b.axis === 'x' ? w : 0.012), c[1] - (b.axis === 'x' ? 0.012 : w), c[0] + (b.axis === 'x' ? w : 0.012), c[1] + (b.axis === 'x' ? 0.012 : w), z(e0) - 0.02, z(e0) + hgt, Lr, Lr, 0.95); } }
  };
  // the Talking Halls' one iron stove-pipe, through a lead collar, under a cowl
  E.EXTRA.r116_pipe = (e, b, T) => {
    const z = E.roofZ(b, e.x, e.y); if (z == null) return;
    const Li = T.L('e78_iron'), Lr = T.L('r116_leadroll'), zt = b.ridge + 0.95, r = 0.06;
    T.box(e.x - 0.13, e.y - 0.13, e.x + 0.13, e.y + 0.13, z - 0.06, z + 0.07, Lr, Lr, 0.95);
    T.box(e.x - r, e.y - r, e.x + r, e.y + r, z - 0.1, zt, Li, Li, 0.9);
    T.box(e.x - 0.17, e.y - 0.17, e.x + 0.17, e.y + 0.17, zt + 0.1, zt + 0.13, Li, Li, 0.85);
    const tip = [e.x, e.y, zt + 0.26], q = [[e.x - 0.17, e.y - 0.17, zt + 0.13], [e.x + 0.17, e.y - 0.17, zt + 0.13], [e.x + 0.17, e.y + 0.17, zt + 0.13], [e.x - 0.17, e.y + 0.17, zt + 0.13]];
    for (let i = 0; i < 4; i++) T.tri([q[i], q[(i + 1) % 4], tip], [[0, 0.2], [0.3, 0.2], [0.15, 0]], Li, T.MAT.wall, i % 2 ? 1 : 0.8, T.planeN(q[i], q[(i + 1) % 4], tip, T.UP));
    for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) T.box(e.x + sx * 0.1 - 0.012, e.y + sy * 0.1 - 0.012, e.x + sx * 0.1 + 0.012, e.y + sy * 0.1 + 0.012, zt - 0.02, zt + 0.1, Li, Li, 0.8);
  };
  // a blockhouse's lower walls carried up to its eaves
  E.EXTRA.r116_band = (e, b, T) => {
    for (const q of e.list) { const tx = -q.ny, ty = q.nx, cx = q.x + 0.5 + q.nx * 0.5, cy = q.y + 0.5 + q.ny * 0.5, L = T.L(q.tex), hgt = b.wallTop - q.z0;
      T.quad([[cx - tx * 0.5, cy - ty * 0.5, q.z0], [cx + tx * 0.5, cy + ty * 0.5, q.z0], [cx + tx * 0.5, cy + ty * 0.5, b.wallTop], [cx - tx * 0.5, cy - ty * 0.5, b.wallTop]], [[0, hgt], [1, hgt], [1, 0], [0, 0]], L, T.MAT.wall, q.nx ? 1 : 0.8, [q.nx, q.ny, 0]); }
  };
  // Cross Pool: a roof whose ridge has sagged between its gables, mossed, with courses slipped
  E.EXTRA.r116_sag = (e, b, T) => {
    const R = b.r116, { P, N } = ridgeFrame(b), p = b.pitch, span = b.span, over = R.over, verge = R.verge, zB = b.zBase, wt = b.wallTop, se = span + over;
    const a0 = b.A0 - verge, a1 = b.A1 + verge, NS = max(4, Math.round((a1 - a0) / 0.7)), MS = 3, Lr = T.L(b.roofTex), Ld = T.L('e78_dark'), Lw = T.L(b.wallTex), up0 = T.UP;
    const sagAt = (a) => R.sag * Math.sin(PI * min(1, max(0, (a - b.A0) / (b.A1 - b.A0))));
    const zAt = (a, s) => zB + (span - abs(s)) * p - sagAt(a) * max(0, 1 - abs(s) / span);
    const vOf = (s) => (span + over - abs(s)) * hyp(1, p);
    for (const sg of [-1, 1]) {
      for (let i = 0; i < NS; i++) { const aA = a0 + (a1 - a0) * i / NS, aB = a0 + (a1 - a0) * (i + 1) / NS;
        for (let j = 0; j < MS; j++) { const s0 = sg * se * (1 - j / MS), s1 = sg * se * (1 - (j + 1) / MS);
          const q = [P(aA, s0, zAt(aA, s0)), P(aB, s0, zAt(aB, s0)), P(aB, s1, zAt(aB, s1)), P(aA, s1, zAt(aA, s1))], up = T.planeN(q[0], q[1], q[2], up0);
          T.quad(q, [[aA, vOf(s0)], [aB, vOf(s0)], [aB, vOf(s1)], [aA, vOf(s1)]], Lr, T.MAT.wall, sg < 0 ? 1 : 0.86, up);
          T.quad(q.map((v) => [v[0], v[1], v[2] - 0.014]), [[aA, 0], [aB, 0], [aB, 1], [aA, 1]], Ld, T.MAT.wall, 0.55, [-up[0], -up[1], -up[2]]); }
        // the fascia, and the ridge course along the sag
        T.quad([P(aA, sg * se, zAt(aA, sg * se) + 0.012), P(aB, sg * se, zAt(aB, sg * se) + 0.012), P(aB, sg * se, zAt(aB, sg * se) - 0.07), P(aA, sg * se, zAt(aA, sg * se) - 0.07)], [[aA, 0], [aB, 0], [aB, 0.08], [aA, 0.08]], Ld, T.MAT.wall, 0.9, N(0, sg));
        const rq = [P(aA, sg * 0.08, zAt(aA, sg * 0.08) + 0.018), P(aB, sg * 0.08, zAt(aB, sg * 0.08) + 0.018), P(aB, 0, zAt(aB, 0) + 0.03), P(aA, 0, zAt(aA, 0) + 0.03)];
        T.quad(rq, [[aA, 0.1], [aB, 0.1], [aB, 0], [aA, 0]], Ld, T.MAT.wall, sg < 0 ? 1.1 : 0.95, T.planeN(rq[0], rq[1], rq[2], up0));
      }
      // barge boards
      for (const [a, na] of [[a0, -1], [a1, 1]]) T.quad([P(a, sg * se, zAt(a, sg * se) + 0.014), P(a, 0, zAt(a, 0) + 0.014), P(a, 0, zAt(a, 0) - 0.09), P(a, sg * se, zAt(a, sg * se) - 0.09)], [[0, 0], [se, 0], [se, 0.1], [0, 0.1]], Ld, T.MAT.wall, 0.85, N(na, 0));
    }
    // the gable ends (the walls hold the ridge up here: no sag)
    const zr = zB + span * p, Lg = b.gableTex ? T.L(b.gableTex) : Lw;
    for (const [a, na] of [[b.A0, -1], [b.A1, 1]]) {
      if (zB > wt + 1e-4) T.quad([P(a, -span, wt), P(a, span, wt), P(a, span, zB), P(a, -span, zB)], [[0, zB - wt], [2 * span, zB - wt], [2 * span, 0], [0, 0]], Lg, T.MAT.wall, b.axis === 'x' ? 1 : 0.8, N(na, 0));
      T.tri([P(a, -span, zB), P(a, span, zB), P(a, 0, zr - 0.02)], [[0, zr - zB], [2 * span, zr - zB], [span, 0]], Lg, T.MAT.wall, b.axis === 'x' ? 1 : 0.8, N(na, 0));
    }
    // the slipped courses: the slates gone, the battens and rafters showing
    const Ls = T.L('r116_slip');
    for (const q of R.slipList) { const c = [[q.a - q.hw, q.s1], [q.a + q.hw, q.s1], [q.a + q.hw, q.s0], [q.a - q.hw, q.s0]].map(([a, s]) => P(a, q.sg * s, zAt(a, q.sg * s) + 0.016));
      T.quad(c, [[0.02, 0.02], [0.98, 0.02], [0.98, 0.98], [0.02, 0.98]], Ls, T.MAT.wall, (q.sg < 0 ? 1 : 0.86) + 10, T.planeN(c[0], c[1], c[2], up0)); }
    // a raised house that is a ring round a dry room: its band seen from inside
    if (b.ground > 0 && !b.solid) {
      const g0 = b.base + 1, X0 = b.x0 + 1, X1 = b.x1, Y0 = b.y0 + 1, Y1 = b.y1, hgt = b.top - g0;
      for (const [p0, p1, nn] of [[[X0, Y0], [X1, Y0], [0, 1, 0]], [[X1, Y1], [X0, Y1], [0, -1, 0]], [[X0, Y1], [X0, Y0], [1, 0, 0]], [[X1, Y0], [X1, Y1], [-1, 0, 0]]])
        T.quad([[p0[0], p0[1], g0], [p1[0], p1[1], g0], [p1[0], p1[1], b.top], [p0[0], p0[1], b.top]], [[0, hgt], [1, hgt], [1, 0], [0, 0]], Lw, T.MAT.wall, 0.7, nn);
    }
  };
  // the weavers' windows: a row of small casements in the garret's knee wall, under the eaves
  E.EXTRA.r116_weave = (e, b, T) => {
    const ny = e.ny || -1, y = ny < 0 ? b.y0 - (b.skin || 0) - 0.012 : b.y1 + 1 + (b.skin || 0) + 0.012, x0 = b.x0 + 0.5, x1 = b.x1 + 0.5, z0 = b.top + 0.07, z1 = b.wallTop - 0.08, Lw = T.L('r116_weave'), Ld = T.L('e78_dark');
    const n = e.n, step = (x1 - x0) / n, hw = min(0.24, step * 0.36);
    for (let i = 0; i < n; i++) { const cx = x0 + step * (i + 0.5);
      T.quad([[cx - hw, y, z0], [cx + hw, y, z0], [cx + hw, y, z1], [cx - hw, y, z1]], [[0, 1], [1, 1], [1, 0], [0, 0]], Lw, T.MAT.wall, 0.8, [0, ny, 0]);
      T.quad([[cx - hw - 0.03, y + ny * 0.04, z0 - 0.035], [cx + hw + 0.03, y + ny * 0.04, z0 - 0.035], [cx + hw + 0.03, y + ny * 0.04, z0], [cx - hw - 0.03, y + ny * 0.04, z0]], [[0, 0.05], [0.6, 0.05], [0.6, 0], [0, 0]], Ld, T.MAT.wall, 0.9, [0, ny, 0]);
      T.quad([[cx - hw - 0.03, y, z0], [cx + hw + 0.03, y, z0], [cx + hw + 0.03, y + ny * 0.04, z0], [cx - hw - 0.03, y + ny * 0.04, z0]], [[0, 0], [0.6, 0], [0.6, 0.04], [0, 0.04]], Ld, T.MAT.wall, 1.2, T.UP); }
  };
  // the salvagers' week: the lead flashing along the ridge, half of it off, one sheet peeled down over the eave
  E.EXTRA.r116_flashing = (e, b, T) => {
    const R = b.r116, { P } = ridgeFrame(b), p = b.pitch, span = b.span, zB = b.zBase, Ll = T.L(Engine.textures.e78_lead ? 'e78_lead' : 'r116_slip');
    const sagAt = (a) => R.sag * Math.sin(PI * min(1, max(0, (a - b.A0) / (b.A1 - b.A0)))), zAt = (a, s) => zB + (span - abs(s)) * p - sagAt(a) * max(0, 1 - abs(s) / span);
    const keep = b.A0 + (b.A1 - b.A0) * (0.35 + h2(b.x0, 41) * 0.25);
    for (const sg of [-1, 1]) { const q = [P(b.A0 - 0.05, sg * 0.24, zAt(b.A0, sg * 0.24) + 0.03), P(keep, sg * 0.24, zAt(keep, sg * 0.24) + 0.03), P(keep, 0, zAt(keep, 0) + 0.045), P(b.A0 - 0.05, 0, zAt(b.A0, 0) + 0.045)];
      T.quad(q, [[0, 0.24], [keep - b.A0, 0.24], [keep - b.A0, 0], [0, 0]], Ll, T.MAT.wall, sg < 0 ? 1 : 0.85, T.planeN(q[0], q[1], q[2], T.UP)); }
    // one sheet torn back and hanging over the eave on the board side
    const sg = (e.ny || -1) < 0 ? -1 : 1, a = keep + 0.6, se = span + R.over, ze = zAt(a, sg * se);
    const q = [P(a - 0.22, sg * (se - 0.35), zAt(a, sg * (se - 0.35)) + 0.02), P(a + 0.24, sg * (se - 0.35), zAt(a, sg * (se - 0.35)) + 0.02), P(a + 0.3, sg * (se + 0.06), ze - 0.34), P(a - 0.16, sg * (se + 0.08), ze - 0.3)];
    T.quad(q, [[0, 0], [0.46, 0], [0.46, 0.5], [0, 0.5]], Ll, T.MAT.wall, 0.9, T.planeN(q[0], q[1], q[2], [0, 0, 1]));
    T.quad(q.slice().reverse().map((v) => [v[0], v[1], v[2] - 0.01]), [[0, 0.5], [0.46, 0.5], [0.46, 0], [0, 0]], T.L('e78_dark'), T.MAT.wall, 0.6, T.planeN(q[2], q[1], q[0], [0, 0, -1]));
  };

  // the Vigil's own: the cloister's pentice, the gate's gable, the tower's cap
  E.REGION[VIGIL] = (m, T, plan) => {
    const Lsl = T.L('r116_vslate'), Ls = T.L('r116_snow'), Lv = T.L('t_p96v_stone'), Ld = T.L('e78_dark'), Lw = T.L('t_wood'), Lt = T.L(Engine.textures.t_p96v_tower ? 't_p96v_tower' : 't_p96v_stone'), parts = plan.r116 || [];
    const pent = parts.find((q) => q.kind === 'vigil-pentice');
    if (pent) {
      // the beam on the pillars, the slates rising from it to the ranges and walls; the north wall and the gate passage
      // given a coping to meet the pentice's head
      const X0 = pent.x0, X1 = pent.x1 + 1, Y0 = pent.y0, Y1 = pent.y1 + 1, [i0, j0, i1, j1] = pent.inner, zH = 3.3, zL = 2.72, o = 0.22, k = (zH - zL) / (i0 - X0), zE = zL - o * k;
      const e0 = i0 + o, e1 = i1 - o, f0 = j0 + o, f1 = j1 - o;
      const faces = [
        [[X0, Y0, zH], [X1, Y0, zH], [e1, f0, zE], [e0, f0, zE], 0.92, 'n'], [[X1, Y1, zH], [X0, Y1, zH], [e0, f1, zE], [e1, f1, zE], 0.8, 's'],
        [[X0, Y1, zH], [X0, Y0, zH], [e0, f0, zE], [e0, f1, zE], 1, 'w'], [[X1, Y0, zH], [X1, Y1, zH], [e1, f1, zE], [e1, f0, zE], 0.86, 'e']];
      for (const [p0, p1, p2, p3, sk, side] of faces) {
        const up = T.planeN(p0, p1, p2, T.UP), len = hyp(p1[0] - p0[0], p1[1] - p0[1]), dx = (p1[0] - p0[0]) / len, dy = (p1[1] - p0[1]) / len, dep = hyp(i0 - X0 + o, zH - zE);
        const u = (q) => (q[0] - p0[0]) * dx + (q[1] - p0[1]) * dy, uv = [[0, 0], [len, 0], [u(p2), dep], [u(p3), dep]];
        T.quad([p0, p1, p2, p3], uv, side === 'e' ? Ls : Lsl, T.MAT.wall, sk, up);
        T.quad([p0, p1, p2, p3].map((v) => [v[0], v[1], v[2] - 0.05]), uv, Lw, T.MAT.wall, 0.5, [-up[0], -up[1], -up[2]]);
      }
      // the fascia along the low edge
      for (const [pa, pb, nn] of [[[e0, f0], [e1, f0], [0, 1, 0]], [[e1, f1], [e0, f1], [0, -1, 0]], [[e0, f1], [e0, f0], [1, 0, 0]], [[e1, f0], [e1, f1], [-1, 0, 0]]])
        T.quad([[pa[0], pa[1], zE - 0.08], [pb[0], pb[1], zE - 0.08], [pb[0], pb[1], zE + 0.01], [pa[0], pa[1], zE + 0.01]], [[0, 0.1], [hyp(pb[0] - pa[0], pb[1] - pa[1]), 0.1], [hyp(pb[0] - pa[0], pb[1] - pa[1]), 0], [0, 0]], Lv, T.MAT.wall, nn[0] ? 1 : 0.85, nn);
      // the beam laid over the pillars' capitals
      const bw = 0.11; for (const [x0, y0, x1, y1] of [[i0 - bw, j0 - bw, i1 + bw, j0 + bw], [i0 - bw, j1 - bw, i1 + bw, j1 + bw], [i0 - bw, j0 + bw, i0 + bw, j1 - bw], [i1 - bw, j0 + bw, i1 + bw, j1 - bw]]) T.box(x0, y0, x1, y1, 2.6, zL - 0.01, Lv, Lv, 1.02);
      // the low north wall carried up to the pentice's head (over the arch it is the arch's lintel), and a lintel over the
      // gate passage where the walk meets it
      T.box(X0, Y0 - 1, X1, Y0, 3.0, zH + 0.04, Lv, Lv, 1);
      T.box(26, Y1, 31, Y1 + 0.42, 3.0, zH + 0.06, Lv, Lv, 1);
    }
    const gate = parts.find((q) => q.kind === 'vigil-gate');
    if (gate) {
      // a small gable over the gate, on the outer face, standing on two stone corbels; snow on its west pitch
      const gx = gate.x0 + 0.5, fy = gate.y0 + 1, hw = 0.86, out = 0.78, zE = 1.66, zR = 2.2, ov = 0.12;
      const W = [gx - hw - ov, fy, zE - ov * 0.62], Ef = [gx + hw + ov, fy, zE - ov * 0.62], Rb = [gx, fy, zR], Rf = [gx, fy + out, zR], Wf = [gx - hw - ov, fy + out, zE - ov * 0.62], Eb = [gx + hw + ov, fy + out, zE - ov * 0.62];
      const west = [Wf, W, Rb, Rf], east = [Ef, Eb, Rf, Rb];
      T.quad(west, [[0, 1], [out, 1], [out, 0], [0, 0]], Ls, T.MAT.wall, 1, T.planeN(west[0], west[1], west[2], T.UP));
      T.quad(east, [[0, 1], [out, 1], [out, 0], [0, 0]], Lsl, T.MAT.wall, 0.86, T.planeN(east[0], east[1], east[2], T.UP));
      for (const q of [west, east]) { const up = T.planeN(q[0], q[1], q[2], T.UP); T.quad(q.map((v) => [v[0], v[1], v[2] - 0.05]), [[0, 1], [out, 1], [out, 0], [0, 0]], Lw, T.MAT.wall, 0.5, [-up[0], -up[1], -up[2]]); }
      T.tri([[gx - hw, fy + out - 0.06, zE], [gx + hw, fy + out - 0.06, zE], [gx, fy + out - 0.06, zR - 0.05]], [[0, 0.55], [1.7, 0.55], [0.85, 0]], Lv, T.MAT.wall, 0.82, [0, 1, 0]);
      T.box(gx - 0.05, fy, gx + 0.05, fy + out + 0.02, zR - 0.02, zR + 0.06, T.L('r116_vridge'), T.L('r116_vridge'), 1.1);
      for (const sx of [-1, 1]) { T.box(gx + sx * hw - 0.09, fy, gx + sx * hw + 0.09, fy + out - 0.04, zE - 0.12, zE, Lv, Lv, 1.05); T.box(gx + sx * hw - 0.08, fy, gx + sx * hw + 0.08, fy + 0.3, zE - 0.42, zE - 0.12, Lv, Lv, 0.95); }
    }
    const cap = parts.find((q) => q.kind === 'vigil-cap');
    if (cap && typeof VIGIL96 !== 'undefined') {
      // a low stone cap over the bell on four piers at the tower's corners: the bell hangs plain to see between them
      const [cx, cy] = VIGIL96.P.tower, zt = VIGIL96.P.towerTop, d = 2.02, pw = 0.25, z1 = 11.0, r = 2.6, zA = 11.55;
      for (const [sx, sy] of [[-1, -1], [1, -1], [1, 1], [-1, 1]]) T.box(cx + sx * d - pw, cy + sy * d - pw, cx + sx * d + pw, cy + sy * d + pw, zt - 0.05, z1, Lt, Lt, 1);
      T.box(cx - r - 0.1, cy - r - 0.1, cx + r + 0.1, cy + r + 0.1, z1, z1 + 0.14, Lv, Lv, 1.08);
      const tip = [cx, cy, zA], q = [[cx - r, cy - r, z1 + 0.14], [cx + r, cy - r, z1 + 0.14], [cx + r, cy + r, z1 + 0.14], [cx - r, cy + r, z1 + 0.14]];
      for (let i = 0; i < 4; i++) { const west = i === 3; T.tri([q[i], q[(i + 1) % 4], tip], [[0, 2.6], [5.2, 2.6], [2.6, 0]], west ? Ls : Lsl, T.MAT.wall, west ? 1 : [0.9, 0.86, 0.8, 1][i], T.planeN(q[i], q[(i + 1) % 4], tip, T.UP)); }
      T.box(cx - 0.12, cy - 0.12, cx + 0.12, cy + 0.12, zA - 0.04, zA + 0.2, Lv, Lv, 1.1);
      // its underside, dark, seen from the garth
      T.quad([[cx - r - 0.1, cy - r - 0.1, z1], [cx + r + 0.1, cy - r - 0.1, z1], [cx + r + 0.1, cy + r + 0.1, z1], [cx - r - 0.1, cy + r + 0.1, z1]], [[0, 0], [1, 0], [1, 1], [0, 1]], Ld, T.MAT.wall, 0.55, T.DN);
    }
  };

  for (const k of Object.keys(E.EXTRA)) if (/^r116_/.test(k)) E.EXTRA[k] = timed(E.EXTRA[k], (e, b, T) => (T && T.m ? T.m.id : '?'));
  E.REGION[VIGIL] = timed(E.REGION[VIGIL], (m) => m.id);

  // ---------------------------------------------------------------- the one smoke (3D view only: the classic view never sees it)
  let smokeEnt = null;
  function smoke(m, on) {
    const vm = (typeof G !== 'undefined' && G.maps && G.maps[VIGIL]) || null;
    const drop = (mm) => { if (!mm || !smokeEnt) return; const i = mm.entities.indexOf(smokeEnt); if (i >= 0) mm.entities.splice(i, 1); if (mm._fs) { const j = mm._fs.chimneys.indexOf(smokeEnt); if (j >= 0) mm._fs.chimneys.splice(j, 1); } };
    if (!on || !m || m.id !== VIGIL || !m._fs || typeof GFX === 'undefined' || !GFX.smoke) { drop(vm); if (m && m !== vm) drop(m); return; }
    const b = E.planOf(m).houses.find((q) => q.r116 && q.r116.stack), s = b && b.r116.stack; if (!s) return;
    const top = b.ridge + 0.95;
    if (!smokeEnt) smokeEnt = { kind: 'deco', sprite: 'r116_none', x: s.x, y: s.y, scale: 0.01, yOff: -top, solid: false, nopick: true, transient: true, _decor: true, _fs: 'r116', _fsTop: top, _fsThin: 0.45, label: '' };
    smokeEnt.x = s.x; smokeEnt.y = s.y; smokeEnt._fsTop = top; smokeEnt.hidden = false;
    if (!m._fs.chimneys.includes(smokeEnt)) m._fs.chimneys.push(smokeEnt);
    if (!m.entities.includes(smokeEnt)) m.entities.push(smokeEnt);
    stats.smoke = 1;
  }
  if (typeof R3D !== 'undefined' && R3D.on) {
    R3D.on('frame', (F) => {
      const t0 = typeof performance !== 'undefined' ? performance.now() : 0;
      try { const m = F && F.map; smoke(m, !!m && api.enabled && E.on() && m.id === VIGIL); } catch (e) { warnOnce('smoke', e); }
      if (t0) { const ms = performance.now() - t0; stats.hookN++; stats.hookMs += (ms - stats.hookMs) / min(stats.hookN, 60); }
    });
    R3D.on('toggle', (shown) => { if (!shown) try { smoke(null, false); } catch (e) { /* the smoke stays where it was */ } });
  }

  // ---------------------------------------------------------------- what is planned, for the tests and the record
  function records(m, p) {
    const out = [];
    for (const b of p.houses) if (b.r116) { const R = b.r116;
      out.push({ kind: R.kind, place: m.id, x0: b.x0, y0: b.y0, x1: b.x1, y1: b.y1, tex: b.roofTex, pitch: +(R.pitch || b.pitch).toFixed(3), snow: R.snow || null, rolls: R.rolls || 0, pipes: R.pipes || 0,
        sag: +(R.sag || 0).toFixed(3), slips: R.slips || 0, weavers: R.weavers || 0, lead: !!R.lead, raised: b.ground > 0, ridge: +b.ridge.toFixed(3) }); }
    for (const q of p.r116 || []) out.push(Object.assign({}, q));
    return out;
  }
  const roofs = (m) => (m && PLACES[m.id] ? records(m, E.planOf(m)) : []);
  const replan = (m) => { const p = E.plan(m); for (const f of E.POST) f(m, p); return JSON.stringify(records(m, p)) === JSON.stringify(roofs(m)); };

  return Object.assign(api, { roofs, replan, textures, stats: () => Object.assign({}, stats, { draw: Object.assign({}, stats.draw) }), planVigil, planWatch, planPool, MINE });
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ROOFS116;
if (typeof window !== 'undefined') window.ROOFS116 = ROOFS116;
