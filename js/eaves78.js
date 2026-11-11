// ============================================================
//  eaves78 — Phase 78 pilot, "roofs and fronts": Oakhaven's houses get the shape of houses.
//
//  Owner, 11 Nov: the sharp-tiles pass changed almost nothing he could see ("I cant see much difference"), and he
//  agreed to start with building shapes. Until now a house was a ring of wall blocks one storey high with a stepped
//  flat lid. In the 3D renderer (js/r3d21.js) this module adds, over each house's own footprint and without touching
//  the map, its walls or anything the game reads:
//    - a pitched roof on the long axis: two slopes of the house's own roof tiles, overhanging the walls at the eaves
//      and past the gable ends, with a dark timber underside, eave boards and barge boards;
//    - gable ends: the end walls carried up to the ridge in the wall's own tile (timber frame, planks);
//    - windows on the faces that look onto open ground: a frame with four panes, a sill, a pair of shutters. After
//      dusk most of them are lit from inside (and glow, like the lamps); by day the glass is dark;
//    - the chimneys the smoke already rises from are lifted onto the new roof.
//  The classic renderer draws the houses exactly as before. Pilot: Oakhaven only (EAVES78.MAPS).
//
//  EAVES78.plan(map)          -> { houses: [{ x0, y0, x1, y1, axis, half, top, ridge, wallTex, roofTex, windows: [...] }] }
//  EAVES78.roofZ(house, x, y) the new roof's height over a point of the house
//  Switch GFX.eaves (Options -> Graphics & access, "Roofs, windows and eaves"). Nothing is saved; no random numbers.
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.eaves === undefined) GFX.eaves = true;
  if (!Array.isArray(GFX.ART)) GFX.ART = [];
  if (!GFX.ART.includes('eaves')) GFX.ART.push('eaves');
}

const EAVES78 = (() => {
  const MAPS = new Set(['oakhaven']);
  const PITCH = 0.85, OVER = 0.28, VERGE = 0.22, LIFT = 0.06;       // rise per unit run; eave and gable overhang; roof above the wall top
  const WALL = /^(t_house|t_wood$)/, max = Math.max, min = Math.min, abs = Math.abs;
  const on = () => typeof GFX === 'undefined' || GFX.eaves !== false;
  function h2(a, b) { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }

  // ---------------------------------------------------------------- which blocks are a house
  // A house: a full rectangle of blocks (and its doors), at least 3 x 3, walled in a house or plank tile, lidded with
  // roof-tile blocks no taller than a loft, with a door in its wall.
  function plan(m) {
    const W = m.w, H = m.h, g = m.cells, seen = new Uint8Array(W * H), houses = [];
    const cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : g[y * W + x];
    const part = (c) => !!c && (c.door ? true : (WALL.test(c.tex || '') || c.tex === 't_roof'));
    const open = (x, y) => { const c = cell(x, y); return x >= 0 && y >= 0 && x < W && y < H && !c; };
    for (let sy = 0; sy < H; sy++) for (let sx = 0; sx < W; sx++) {
      if (seen[sy * W + sx] || !part(cell(sx, sy)) || cell(sx, sy).door) continue;
      let x0 = sx, x1 = sx, y0 = sy, y1 = sy, n = 0; const st = [[sx, sy]]; seen[sy * W + sx] = 1;
      while (st.length) { const [x, y] = st.pop(); n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H || seen[Y * W + X] || !part(cell(X, Y))) continue; seen[Y * W + X] = 1; st.push([X, Y]); } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      if (w < 3 || h < 3 || n !== w * h) continue;                       // not a plain rectangle
      let doors = 0, lid = 0, tall = false, wallTex = null, roofTex = 't_roof', ok = true, inner = 0; const doorList = [], plinth = [];
      for (let y = y0; y <= y1 && ok; y++) for (let x = x0; x <= x1; x++) {
        const c = cell(x, y), edge = x === x0 || x === x1 || y === y0 || y === y1;
        if (edge) { if (c.door) { doors++; doorList.push({ x, y, nx: y === y0 || y === y1 ? 0 : (x === x0 ? -1 : 1), ny: y === y0 ? -1 : y === y1 ? 1 : 0 }); } else if (!WALL.test(c.tex || '')) { ok = false; break; } else { if (!wallTex) wallTex = c.tex; if (c.top != null && c.top > 1.01) tall = true; } }
        else { if (c.door) { ok = false; break; } if (c.tex === 't_roof' || c.capTex === 't_roof') lid++; if (c.capTex) roofTex = c.capTex; if (c.top != null && c.top > 2.2) tall = true; if (c.top != null && c.top > inner) inner = c.top; }
      }
      if (!ok || !doors || !lid || tall || !wallTex) continue;
      const axis = w >= h ? 'x' : 'y', half = (axis === 'x' ? h : w) / 2, pitch = min(PITCH, 2.1 / half), base = m.lvls ? m.lvls[y0 * W + x0] || 0 : 0;
      const top = base + 1, lift = max(LIFT, base + inner + 0.05 - top - pitch);          // the new roof always clears the old lid one cell in from the wall
      const hs = { x0, y0, x1, y1, axis, half, pitch, lift, top, ridge: top + lift + half * pitch, wallTex, roofTex, windows: [], doors: doorList.filter((d) => open(d.x + d.nx, d.y + d.ny)), plinth };
      // windows: on wall cells that look onto open ground; not corners, doors, cells beside a door or cells with a sign on them
      const sides = [[0, -1, 'x', y0], [0, 1, 'x', y1], [-1, 0, 'y', x0], [1, 0, 'y', x1]];
      for (const [nx, ny, along, fixed] of sides) {
        const a0 = along === 'x' ? x0 + 1 : y0 + 1, a1 = along === 'x' ? x1 - 1 : y1 - 1, len = a1 - a0 + 1;
        for (let a = a0 - 1; a <= a1 + 1; a++) { const qx = along === 'x' ? a : fixed, qy = along === 'x' ? fixed : a, qc = cell(qx, qy); if (qc && !qc.door && open(qx + nx, qy + ny)) plinth.push({ x: qx, y: qy, nx, ny }); }
        for (let a = a0; a <= a1; a++) {
          const x = along === 'x' ? a : fixed, y = along === 'x' ? fixed : a, c = cell(x, y), i = a - a0;
          if (!c || c.door || !open(x + nx, y + ny)) continue;
          const px = along === 'x' ? 1 : 0, py = along === 'x' ? 0 : 1, pa = cell(x - px, y - py), pb = cell(x + px, y + py);
          if ((pa && pa.door) || (pb && pb.door)) continue;
          if (m.decals && m.decals[y * W + x]) continue;
          if (len % 2 ? i % 2 !== 0 : i % 2 !== 1) continue;                 // every other cell, so the wall between them reads
          hs.windows.push({ x, y, nx, ny, lit: h2(x * 7 + 3, y * 13 + 1) < 0.72 });
        }
      }
      houses.push(hs);
    }
    return { houses };
  }
  // the roof's height over a point (game units)
  function roofZ(hs, x, y) {
    const c = hs.axis === 'x' ? (hs.y0 + hs.y1 + 1) / 2 : (hs.x0 + hs.x1 + 1) / 2, s = abs((hs.axis === 'x' ? y : x) - c);
    return hs.top + hs.lift + (hs.half - s) * hs.pitch;
  }
  const plans = new WeakMap();
  function planOf(m) { let p = plans.get(m); if (!p || p.cells !== m.cells) { p = plan(m); p.cells = m.cells; plans.set(m, p); } return p; }
  const night = () => { const t = typeof G !== 'undefined' && G && Number.isFinite(G.tod) ? G.tod : 0.5; return t < 0.27 || t > 0.76; };

  // ---------------------------------------------------------------- the small tiles this needs, made from the game's own planks
  let texDone = false;
  function textures() {
    if (texDone || typeof Engine === 'undefined' || !Engine.textures || !Engine.textures.t_wood) return texDone;
    const wood = Engine.textures.t_wood, px = (c, k, t) => { const r = min(255, (c & 255) * k * (t ? t[0] : 1)), g = min(255, ((c >>> 8) & 255) * k * (t ? t[1] : 1)), b = min(255, ((c >>> 16) & 255) * k * (t ? t[2] : 1)); return (255 << 24 | (b | 0) << 16 | (g | 0) << 8 | (r | 0)) >>> 0; };
    const rgb = (r, g, b) => (255 << 24 | (b | 0) << 16 | (g | 0) << 8 | (r | 0)) >>> 0;
    const dark = new Uint32Array(4096), shut = new Uint32Array(4096), win = new Uint32Array(4096), lit = new Uint32Array(4096);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const i = y * 64 + x, w = wood[i];
      dark[i] = px(w, 0.5);
      // a shutter: upright boards, two battens, a dark edge
      const batten = (y > 9 && y < 15) || (y > 48 && y < 54), edge = x < 2 || x > 61 || y < 2 || y > 61, gap = x % 16 === 0;
      shut[i] = px(w, edge ? 0.42 : batten ? 0.62 : gap ? 0.5 : 0.86, [0.78, 0.98, 0.82]);
      // a window: frame, four panes, glazing bars; a sill line at the foot
      const frame = x < 7 || x > 56 || y < 7 || y > 55, bar = abs(x - 31.5) < 2.2 || abs(y - 30.5) < 2.2, inner = x < 9 || x > 54 || y < 9 || y > 53;
      if (frame || bar) { const k = y > 55 ? 0.95 : frame ? 0.7 : 0.6; win[i] = px(w, k); lit[i] = px(w, k * 0.8); continue; }
      const n = h2(x >> 1, y >> 1) - 0.5, glint = abs((x - y * 0.8) - 6) < 3 || abs((x - y * 0.8) - 20) < 1.4, sh = inner ? 0.7 : 1;
      win[i] = rgb((38 + n * 10 + (glint ? 34 : 0) + (64 - y) * 0.35) * sh, (48 + n * 10 + (glint ? 38 : 0) + (64 - y) * 0.45) * sh, (62 + n * 12 + (glint ? 40 : 0) + (64 - y) * 0.5) * sh);
      const dx = (x - 32) / 26, dy = (y - 34) / 26, core = max(0, 1 - (dx * dx + dy * dy) * 0.55), curtain = (x < 18 || x > 45) && y < 40 ? 0.72 : 1;
      lit[i] = rgb(min(255, (176 + 79 * core + n * 14) * sh * curtain), min(255, (112 + 96 * core + n * 12) * sh * curtain), min(255, (38 + 70 * core) * sh * curtain));
    }
    Engine.addTexture('e78_dark', dark); Engine.addTexture('e78_shutter', shut); Engine.addTexture('e78_win', win); Engine.addTexture('e78_winlit', lit);
    return (texDone = true);
  }

  // ---------------------------------------------------------------- geometry, into the renderer's own mesh
  // h: { B (the mesh builder), tex(name) -> layer, MAT, ZK }. Returns the triangles added.
  function build(m, h) {
    if (!on() || !m || !MAPS.has(m.id) || !textures()) return 0;
    const B = h.B, MAT = h.MAT, ZK = h.ZK, lit = night(); let tris = 0;
    const nrm = (x, y, z) => { const zz = z, l = Math.hypot(x, y, zz) || 1; return [x / l, y / l, zz / l]; };
    const quad = (p, uv, L, mat, side, n) => { const v = p.map((q, i) => B.vert(q[0], q[1], q[2], uv[i][0], uv[i][1], L, -1, mat, side, n[0], n[1], n[2])); B.quad(v[0], v[1], v[2], v[3]); tris += 2; };
    const tri = (p, uv, L, mat, side, n) => { const v = p.map((q, i) => B.vert(q[0], q[1], q[2], uv[i][0], uv[i][1], L, -1, mat, side, n[0], n[1], n[2])); B.quad(v[0], v[1], v[2], v[2]); tris += 1; };
    const Ldark = h.tex('e78_dark'), Lshut = h.tex('e78_shutter'), Lwin = h.tex('e78_win'), Llit = h.tex('e78_winlit');
    for (const hs of planOf(m).houses) {
      const ax = hs.axis === 'x', Lroof = h.tex(hs.roofTex), Lwall = h.tex(hs.wallTex);
      // (a, s, z): a along the ridge, s across it from the house's middle
      const A0 = (ax ? hs.x0 : hs.y0), A1 = (ax ? hs.x1 : hs.y1) + 1, C = ax ? (hs.y0 + hs.y1 + 1) / 2 : (hs.x0 + hs.x1 + 1) / 2;
      const P = (a, s, z) => ax ? [a, C + s, z] : [C + s, a, z], N = (na, ns, nz) => ax ? nrm(na, ns, nz) : nrm(ns, na, nz);
      const half = hs.half, p = hs.pitch, zr = hs.ridge, LIFT = hs.lift, ze = hs.top + LIFT - OVER * p, se = half + OVER, sl = Math.hypot(se, se * p), a0 = A0 - VERGE, a1 = A1 + VERGE;
      for (const sg of [-1, 1]) {
        const up = N(0, sg * p * ZK, 1), dn = [-up[0], -up[1], -up[2]], side = sg < 0 ? 1 : 0.86;
        quad([P(a0, sg * se, ze), P(a1, sg * se, ze), P(a1, 0, zr), P(a0, 0, zr)], [[a0, sl], [a1, sl], [a1, 0], [a0, 0]], Lroof, MAT.wall, side, up);                 // the slope
        quad([P(a0, sg * se, ze - 0.012), P(a1, sg * se, ze - 0.012), P(a1, 0, zr - 0.012), P(a0, 0, zr - 0.012)], [[a0, sl], [a1, sl], [a1, 0], [a0, 0]], Ldark, MAT.wall, 0.6, dn);   // its underside
        quad([P(a0, sg * se, ze + 0.012), P(a1, sg * se, ze + 0.012), P(a1, sg * se, ze - 0.075), P(a0, sg * se, ze - 0.075)], [[a0, 0], [a1, 0], [a1, 0.09], [a0, 0.09]], Ldark, MAT.wall, 0.9, N(0, sg, 0));   // the eave board
        for (const [a, na] of [[a0, -1], [a1, 1]])                                                                                                   // barge boards at the gable
          quad([P(a, sg * se, ze + 0.014), P(a, 0, zr + 0.014), P(a, 0, zr - 0.1), P(a, sg * se, ze - 0.1)], [[0, 0], [sl, 0], [sl, 0.11], [0, 0.11]], Ldark, MAT.wall, 0.85, N(na, 0, 0));
      }
      // the ridge: a dark capping course, one strip down each slope
      for (const sg of [-1, 1]) quad([P(a0, sg * 0.07, zr - 0.07 * p + 0.016), P(a1, sg * 0.07, zr - 0.07 * p + 0.016), P(a1, 0, zr + 0.022), P(a0, 0, zr + 0.022)], [[a0, 0.1], [a1, 0.1], [a1, 0], [a0, 0]], Ldark, MAT.wall, sg < 0 ? 1.15 : 1, N(0, sg * p * ZK, 1));
      // the gable ends: the wall carried up to the ridge
      for (const [a, na] of [[A0, -1], [A1, 1]]) {
        const u = (s) => (ax ? (na > 0 ? C + s : -(C + s)) : (na > 0 ? -(C + s) : C + s));
        tri([P(a, -half, hs.top), P(a, half, hs.top), P(a, 0, zr - LIFT * 0.4)], [[u(-half), 0], [u(half), 0], [u(0), -(zr - LIFT * 0.4 - hs.top)]], Lwall, MAT.wall, ax ? 1 : 0.8, N(na, 0, 0));
      }
      // a stone footing along the foot of every wall that meets open ground
      const Lstone = h.tex('t_stone');
      for (const q of hs.plinth) {
        const tx = -q.ny, ty = q.nx, cx = q.x + 0.5 + q.nx * 0.5, cy = q.y + 0.5 + q.ny * 0.5, side = q.nx ? 1 : 0.8, zb = hs.top - 1, zt = zb + 0.15, o = 0.03;
        const at = (t, off, z) => [cx + tx * t + q.nx * off, cy + ty * t + q.ny * off, z], u0 = q.nx ? q.y : q.x;
        quad([at(-0.5 - o, o, zb), at(0.5 + o, o, zb), at(0.5 + o, o, zt), at(-0.5 - o, o, zt)], [[u0, 0.15], [u0 + 1, 0.15], [u0 + 1, 0], [u0, 0]], Lstone, MAT.wall, side * 0.92, [q.nx, q.ny, 0]);
        quad([at(-0.5 - o, 0, zt), at(0.5 + o, 0, zt), at(0.5 + o, o, zt), at(-0.5 - o, o, zt)], [[u0, 0], [u0 + 1, 0], [u0 + 1, 0.03], [u0, 0.03]], Lstone, MAT.wall, 1.2, [0, 0, 1]);
      }
      // a small tiled hood over a door in a gable end (the eaves already shelter the doors under them)
      for (const d of hs.doors) {
        if (ax ? d.nx === 0 : d.ny === 0) continue;
        const tx = -d.ny, ty = d.nx, cx = d.x + 0.5 + d.nx * 0.5, cy = d.y + 0.5 + d.ny * 0.5, side = d.nx ? 1 : 0.8, z1 = hs.top + 0.1, z0 = hs.top - 0.07, out = 0.36, hw = 0.6;
        const at = (t, off, z) => [cx + tx * t + d.nx * off, cy + ty * t + d.ny * off, z], up = nrm(d.nx * 0.47 * ZK, d.ny * 0.47 * ZK, 1);
        quad([at(-hw, out, z0), at(hw, out, z0), at(hw, 0.01, z1), at(-hw, 0.01, z1)], [[0, 0.4], [1.2, 0.4], [1.2, 0], [0, 0]], Lroof, MAT.wall, side, up);
        quad([at(-hw, out, z0 - 0.012), at(hw, out, z0 - 0.012), at(hw, 0.01, z1 - 0.012), at(-hw, 0.01, z1 - 0.012)], [[0, 0.4], [1.2, 0.4], [1.2, 0], [0, 0]], Ldark, MAT.wall, 0.6, [-up[0], -up[1], -up[2]]);
        quad([at(-hw, out, z0 + 0.012), at(hw, out, z0 + 0.012), at(hw, out, z0 - 0.06), at(-hw, out, z0 - 0.06)], [[0, 0], [1.2, 0], [1.2, 0.07], [0, 0.07]], Ldark, MAT.wall, side * 0.95, [d.nx, d.ny, 0]);
        for (const sgn of [-1, 1]) {                             // a bracket under each end
          const t = sgn * (hw - 0.05);
          quad([at(t, 0.01, z0 - 0.3), at(t, 0.3, z0 - 0.02), at(t, 0.3, z0 - 0.07), at(t, 0.01, z0 - 0.36)], [[0, 0], [0.4, 0], [0.4, 0.06], [0, 0.06]], Ldark, MAT.wall, 0.8, [tx * sgn, ty * sgn, 0]);
          quad([at(t, 0.01, z0 - 0.3), at(t, 0.3, z0 - 0.02), at(t, 0.3, z0 - 0.07), at(t, 0.01, z0 - 0.36)], [[0, 0], [0.4, 0], [0.4, 0.06], [0, 0.06]], Ldark, MAT.wall, 0.7, [-tx * sgn, -ty * sgn, 0]);
        }
      }
      // windows
      for (const w of hs.windows) {
        const tx = -w.ny, ty = w.nx, cx = w.x + 0.5 + w.nx * 0.5, cy = w.y + 0.5 + w.ny * 0.5, n = [w.nx, w.ny, 0], side = w.nx ? 1 : 0.8;
        const at = (t, off, z) => [cx + tx * t + w.nx * off, cy + ty * t + w.ny * off, z], z0 = hs.top - 0.63, z1 = hs.top - 0.2, hw = 0.21, glow = lit && w.lit;
        quad([at(-hw, 0.014, z0), at(hw, 0.014, z0), at(hw, 0.014, z1), at(-hw, 0.014, z1)], [[0, 1], [1, 1], [1, 0], [0, 0]], glow ? Llit : Lwin, glow ? MAT.glow : MAT.wall, side, n);
        // the sill: a front and a top
        quad([at(-hw - 0.04, 0.06, z0 - 0.045), at(hw + 0.04, 0.06, z0 - 0.045), at(hw + 0.04, 0.06, z0), at(-hw - 0.04, 0.06, z0)], [[0, 0.1], [0.6, 0.1], [0.6, 0], [0, 0]], Ldark, MAT.wall, side * 1.25, n);
        quad([at(-hw - 0.04, 0.012, z0), at(hw + 0.04, 0.012, z0), at(hw + 0.04, 0.06, z0), at(-hw - 0.04, 0.06, z0)], [[0, 0], [0.6, 0], [0.6, 0.1], [0, 0.1]], Ldark, MAT.wall, 1.5, [0, 0, 1]);
        // shutters, standing a little open
        for (const sgn of [-1, 1]) { const i0 = sgn * (hw + 0.012), i1 = sgn * (hw + 0.2);
          quad([at(i0, 0.02, z0 + 0.01), at(i1, 0.075, z0 + 0.01), at(i1, 0.075, z1 - 0.01), at(i0, 0.02, z1 - 0.01)], [[0, 1], [1, 1], [1, 0], [0, 0]], Lshut, MAT.wall, side, nrm(w.nx - tx * sgn * 0.28, w.ny - ty * sgn * 0.28, 0)); }
      }
    }
    return tris;
  }

  // ---------------------------------------------------------------- in the game
  let wasLit = null, wasOn = null;
  function lift(m, drawing) {                                    // the smoking chimneys stand on the new roof (only while the 3D renderer draws it)
    if (typeof G === 'undefined' || !G.ents || !m) return;
    const active = drawing && on() && MAPS.has(m.id);
    for (const e of G.ents) {
      if (e._fs !== 'chimney') continue;
      if (active && !e._e78) { const hs = planOf(m).houses.find((q) => e.x >= q.x0 && e.x <= q.x1 + 1 && e.y >= q.y0 && e.y <= q.y1 + 1); if (!hs) continue; const z = roofZ(hs, e.x, e.y); e._e78 = { yOff: e.yOff, top: e._fsTop }; e.yOff = -(z - 0.04); e._fsTop = z + 0.5; }
      else if (!active && e._e78) { e.yOff = e._e78.yOff; e._fsTop = e._e78.top; e._e78 = null; }
    }
  }
  if (typeof R3D !== 'undefined' && R3D.extendMesh) {
    R3D.extendMesh((m, h) => build(m, h));
    R3D.on('frame', (F) => {
      const m = F && F.map; if (!m) return;
      const l = night(), o = on();
      if (MAPS.has(m.id) && (l !== wasLit || o !== wasOn)) { if (wasLit !== null) R3D.invalidate(); wasLit = l; wasOn = o; }
      lift(m, true);
    });
    if (R3D.on) R3D.on('toggle', (shown) => { try { if (!shown && typeof G !== 'undefined' && G.map) lift(G.map, false); } catch (e) { /* chimneys stay where they were */ } });
  }
  return { MAPS, PITCH, OVER, plan, planOf, roofZ, build, on, night, textures };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = EAVES78;
if (typeof window !== 'undefined') window.EAVES78 = EAVES78;

// the Options row
if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') (() => {
  const _acc = renderAccessibilityMenu;
  renderAccessibilityMenu = function () {
    const r = _acc.apply(this, arguments);
    try {
      const grid = document.querySelector('#modal-panel .ctl-grid');
      if (grid && !document.getElementById('gfx-eaves')) {
        const label = document.createElement('span'); label.className = 'gfx-label'; label.appendChild(document.createTextNode('Roofs, windows and eaves '));
        const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = "Oakhaven's houses with pitched roofs, gable ends, shuttered windows lit after dusk (3D renderer only; pilot)"; label.appendChild(sm);
        const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'gfx-eaves'; b.type = 'button'; b.setAttribute('aria-label', 'Roofs, windows and eaves');
        const sync = () => { b.textContent = GFX.eaves !== false ? 'On' : 'Off'; b.setAttribute('aria-pressed', GFX.eaves !== false ? 'true' : 'false'); };
        b.onclick = () => { GFX.eaves = GFX.eaves === false; if (typeof GFX.changed === 'function') GFX.changed(); if (typeof R3D !== 'undefined' && R3D.invalidate) R3D.invalidate(); sync(); };
        sync(); grid.appendChild(label); grid.appendChild(b);
      }
    } catch (e) { /* the menu still opens without the row */ }
    return r;
  };
})();
