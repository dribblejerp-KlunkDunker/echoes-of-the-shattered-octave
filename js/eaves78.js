// ============================================================
//  eaves78 — Phase 78, "roofs and fronts": Oakhaven's buildings get the shape of buildings.
//
//  Owner, 11 Nov: the sharp-tiles pass changed almost nothing he could see, and he agreed to start with building
//  shapes; on seeing the first roofs: "this looks great ... fix the rain through the buildings and houses. I like the
//  invented details keep them, yes I want the upper storeys and dormers. I want this entire region fleshed out before
//  we move anywhere". Until now a building was a ring of wall blocks one storey high with a stepped flat lid. In the
//  3D renderer (js/r3d21.js) this module adds, over each building's own footprint and without touching the map, its
//  walls or anything the game reads:
//    houses     a pitched roof on the long axis (thatch, slate or the old moss tile: the bibles give Oakhaven "timber
//               and plaster under thatch and slate"), eaves and barge boards, gable ends with an attic window, shuttered
//               windows lit after dusk, a stone footing, door hoods, a brick stack under every smoking chimney;
//    big houses a jettied upper storey with its own windows (the inn, the mill, the dyer's, the tannery, the
//               wool-factor's), a double-pile roof where the house is deep, and dormers;
//    sheds      barns, stores, sheds, the granary and the washhouse stay plain: one storey, boarded hatches, no dormers;
//    the Greenhall   a hipped slate roof and its dome (Vol VIII: "the Greenhall dome");
//    the Chapel      a slate roof round the bell-tower, lancet windows, and on the tower an open, empty bell-frame
//               (Vol VIII: "its belfry open to the weather", "Nothing hangs in the tower. You can see daylight
//               through the frame").
//  Nothing ordinary rises above the mooring mast or the tower: from Hedge Knoll the dome, the mast and the tower still
//  stand over the roofs. Rain and snow stop at the roofs (EAVES78.shelter, read by js/light21.js). The classic
//  renderer draws the old boxes exactly as before. Region: Oakhaven (EAVES78.MAPS).
//
//  EAVES78.plan(map)          -> { houses: [building, ...] }   (every roofed building; .stone, .plain, .storeys tell them apart)
//  EAVES78.roofZ(b, x, y)     the new roof's height over a point, or null outside its eaves
//  EAVES78.shelter(map)       -> { sig, k, w, h, data } heights the rain stops at (game units; -1e4 = open sky), or null
//  Switch GFX.eaves (Options -> Graphics & access, "Roofs, windows and eaves"). Nothing is saved; no random numbers.
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.eaves === undefined) GFX.eaves = true;
  if (!Array.isArray(GFX.ART)) GFX.ART = [];
  if (!GFX.ART.includes('eaves')) GFX.ART.push('eaves');
}

const EAVES78 = (() => {
  // Every region builds in its own way (owner, 11 Nov: "each region should have at least something unique about it even
  // from a building and house perspective. Nothing that's over the top but enough so that each new area and region is cool
  // and unique enough to want to explore"). A region is an entry here: what it builds with, and the one or two things only
  // it has. Oakhaven is the first; the next region adds an entry and its own rules, it does not borrow Oakhaven's.
  const STYLES = {
    oakhaven: { builds: 'timber and plaster under thatch and slate (the bibles)', shutters: 'green-grey', only: ['jettied upper storeys and double-pile roofs', "the Greenhall's dome", "the Chapel's open bell-frame"] },
  };
  const MAPS = new Set(Object.keys(STYLES));
  const PITCH = 0.85, OVER = 0.28, VERGE = 0.22, LIFT = 0.06, STOREY = 0.6, JETTY = 0.11;
  const RIDGE1 = 2.45, RIDGE2 = 2.7;                             // the highest ridge of a one- and a two-storey house (the mast is 2.8, the tower 3.2)
  const WALL = /^(t_house|t_wood$|t_marble)/, PLAIN = /barn|shed|store|granary|washhouse/i;
  const max = Math.max, min = Math.min, abs = Math.abs, hyp = Math.hypot, PI = Math.PI;
  const on = () => typeof GFX === 'undefined' || GFX.eaves !== false;
  function h2(a, b) { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }

  // ---------------------------------------------------------------- the roof's height
  // local frame: a runs along the ridge, s across it from the building's middle (b.C)
  function roofZ(b, x, y) {
    const ax = b.axis === 'x', a = ax ? x : y, s = (ax ? y : x) - b.C, as = abs(s);
    if (b.type === 'hip') {
      if (a < b.A0 - OVER || a > b.A1 + OVER || as > b.half + OVER) return null;
      return b.zBase + b.pitch * min(a - b.A0, b.A1 - a, b.half - as);
    }
    if (a < b.A0 - VERGE || a > b.A1 + VERGE || as > b.half + OVER) return null;
    return b.zBase + (b.span - (b.ridges === 2 ? abs(as - b.span) : as)) * b.pitch;
  }

  // ---------------------------------------------------------------- which blocks are a building, and what kind
  function plan(m) {
    const W = m.w, H = m.h, g = m.cells, seen = new Uint8Array(W * H), houses = [];
    const cell = (x, y) => (x < 0 || y < 0 || x >= W || y >= H) ? null : g[y * W + x];
    const part = (c) => !!c && (c.door ? true : (WALL.test(c.tex || '') || c.tex === 't_roof'));
    const open = (x, y) => x >= 0 && y >= 0 && x < W && y < H && !cell(x, y);
    for (let sy = 0; sy < H; sy++) for (let sx = 0; sx < W; sx++) {
      if (seen[sy * W + sx] || !part(cell(sx, sy)) || cell(sx, sy).door) continue;
      let x0 = sx, x1 = sx, y0 = sy, y1 = sy, n = 0; const st = [[sx, sy]]; seen[sy * W + sx] = 1;
      while (st.length) { const [x, y] = st.pop(); n++; if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H || seen[Y * W + X] || !part(cell(X, Y))) continue; seen[Y * W + X] = 1; st.push([X, Y]); } }
      const w = x1 - x0 + 1, h = y1 - y0 + 1;
      if (w < 3 || h < 3 || n !== w * h) continue;                       // not a plain rectangle
      let lid = 0, wallTex = null, ok = true, label = ''; const doorList = [], towers = [], inner = []; let dome = null;
      for (let y = y0; y <= y1 && ok; y++) for (let x = x0; x <= x1; x++) {
        const c = cell(x, y), edge = x === x0 || x === x1 || y === y0 || y === y1;
        if (edge) {
          if (c.door) { doorList.push({ x, y, nx: y === y0 || y === y1 ? 0 : (x === x0 ? -1 : 1), ny: y === y0 ? -1 : y === y1 ? 1 : 0 }); if (c.label) label += c.label + ' '; }
          else if (!WALL.test(c.tex || '') || (c.top != null && c.top > 1.01)) { ok = false; break; } else if (!wallTex) wallTex = c.tex;
        } else {
          if (c.door) { ok = false; break; }
          if (c.tex === 't_roof' || c.capTex === 't_roof') lid++;
          const t = c.top != null ? c.top : 1;
          if (t > 2.2) towers.push({ x, y, top: t }); else if (t >= 2 && c.capTex === 't_roof') dome = { x, y, top: t }; else inner.push({ x, y, top: t });
        }
      }
      if (!ok || !doorList.length || !lid || !wallTex) continue;
      const stone = /^t_marble/.test(wallTex), plain = !stone && PLAIN.test(label);
      if (!stone && towers.length) continue;                               // a tower in a timber house: not one of ours
      const church = stone && towers.length > 0;                                 // a towered stone hall: a nave, its gable over the door
      const ax = church ? doorList[0].nx !== 0 : w >= h, acrossN = ax ? h : w, storeys = (!stone && !plain && w * h >= 25) ? 2 : 1;
      const base = m.lvls ? m.lvls[y0 * W + x0] || 0 : 0, top = base + 1;
      const ext = stone ? 0.3 : (storeys === 2 ? STOREY : 0), jetty = storeys === 2 ? JETTY : 0, wallTop = top + ext;
      const b = { x0, y0, x1, y1, w, h, axis: ax ? 'x' : 'y', stone, church, plain, storeys, label: label.trim(), top, ext, jetty, wallTop, wallTex, towers, dome,
        type: stone && !church ? 'hip' : 'gable', half: acrossN / 2 + jetty, C: ax ? (y0 + y1 + 1) / 2 : (x0 + x1 + 1) / 2, A0: (ax ? x0 : y0) - jetty, A1: (ax ? x1 : y1) + 1 + jetty,
        windows: [], doors: doorList.filter((d) => open(d.x + d.nx, d.y + d.ny)), plinth: [], dormers: [] };
      b.ridges = (b.type === 'gable' && storeys === 2 && acrossN >= 5) ? 2 : 1; b.span = b.half / b.ridges;
      // the pitch: as steep as the skyline allows, and the whole of the old lid stays under the new roof
      const maxRidge = base + (stone ? (towers.length ? min(...towers.map((t) => t.top)) - 0.6 : 2.3) : (storeys === 2 ? RIDGE2 : RIDGE1));
      b.pitch = min(stone ? 0.6 : PITCH, (maxRidge - wallTop - LIFT) / b.span); b.lift = LIFT;
      for (let it = 0; it < 14; it++) {
        b.zBase = wallTop + LIFT; let need = 0;
        for (const c of inner) for (let k = 0; k < 9; k++) { const fx = (k % 3) / 2, fy = ((k / 3) | 0) / 2, z = roofZ(b, c.x + fx, c.y + fy); if (z != null && base + c.top + 0.04 - z > need) need = base + c.top + 0.04 - z; }
        b.lift = LIFT + need; if (wallTop + b.lift + b.span * b.pitch <= maxRidge + 1e-6 || b.pitch < 0.12) break; b.pitch *= 0.92;
      }
      b.zBase = wallTop + b.lift; b.ridge = b.zBase + b.span * b.pitch;
      const r = h2(x0 * 3 + 1, y0 * 5 + 2);
      b.roofTex = stone ? 'e78_slate' : storeys === 2 ? (r < 0.55 ? 'e78_slate' : 't_roof') : plain ? (r < 0.5 ? 'e78_thatch' : 't_roof') : (r < 0.42 ? 'e78_thatch' : r < 0.7 ? 'e78_slate' : 't_roof');
      // ---- windows: a list of openings on wall planes { cx, cy, nx, ny, z0, z1, hw, style, lit }
      const style0 = stone ? (towers.length ? 'lancet' : 'hall') : plain ? 'hatch' : 'cottage';
      const sides = [[0, -1, 'x', y0], [0, 1, 'x', y1], [-1, 0, 'y', x0], [1, 0, 'y', x1]];
      for (const [nx, ny, along, fixed] of sides) {
        const a0 = along === 'x' ? x0 + 1 : y0 + 1, a1 = along === 'x' ? x1 - 1 : y1 - 1, len = a1 - a0 + 1;
        for (let a = a0 - 1; a <= a1 + 1; a++) { const qx = along === 'x' ? a : fixed, qy = along === 'x' ? fixed : a, qc = cell(qx, qy); if (!stone && qc && !qc.door && open(qx + nx, qy + ny)) b.plinth.push({ x: qx, y: qy, nx, ny }); }
        for (let a = a0; a <= a1; a++) {
          const x = along === 'x' ? a : fixed, y = along === 'x' ? fixed : a, c = cell(x, y), i = a - a0;
          if (len % 2 ? i % 2 !== 0 : i % 2 !== 1) continue;                 // every other cell, so the wall between them reads
          const cx = x + 0.5 + nx * 0.5, cy = y + 0.5 + ny * 0.5, lit = h2(x * 7 + 3, y * 13 + 1);
          if (storeys === 2) b.windows.push({ cx: cx + nx * jetty, cy: cy + ny * jetty, nx, ny, z0: top + 0.17, z1: top + 0.5, hw: 0.19, style: 'cottage', lit: h2(x * 5 + 9, y * 3 + 4) < 0.6 });
          if (!c || c.door || !open(x + nx, y + ny)) continue;
          const px = along === 'x' ? 1 : 0, py = along === 'x' ? 0 : 1, pa = cell(x - px, y - py), pb = cell(x + px, y + py);
          if ((pa && pa.door) || (pb && pb.door) || (m.decals && m.decals[y * W + x])) continue;
          if (plain && i % 4 > 1) continue;
          if (style0 === 'lancet') b.windows.push({ cx, cy, nx, ny, z0: top - 0.74, z1: top + 0.2, hw: 0.17, style: 'lancet', lit: true });
          else if (style0 === 'hall') b.windows.push({ cx, cy, nx, ny, z0: top - 0.7, z1: top + 0.06, hw: 0.2, style: 'hall', lit: lit < 0.3 });
          else b.windows.push({ cx, cy, nx, ny, z0: top - 0.63, z1: top - 0.2, hw: 0.21, style: style0, lit: lit < 0.72 });
        }
      }
      if (b.type === 'gable') {
        const rise = b.span * b.pitch, ends = [[b.A0, -1], [b.A1, 1]], centres = b.ridges === 2 ? [-b.span, b.span] : [0];
        // an attic window in each gable
        if (!plain && rise >= 0.75) for (const [a, na] of ends) for (const cs of centres) {
          const wx = ax ? a : b.C + cs, wy = ax ? b.C + cs : a;
          if (church) b.windows.push({ cx: wx, cy: wy, nx: ax ? na : 0, ny: ax ? 0 : na, z0: b.zBase + 0.06, z1: b.zBase + min(0.8, rise * 0.62), hw: 0.16, style: 'lancet', lit: true });
          else b.windows.push({ cx: wx, cy: wy, nx: ax ? na : 0, ny: ax ? 0 : na, z0: b.zBase + 0.1, z1: b.zBase + min(0.42, rise * 0.42), hw: 0.14, style: 'attic', lit: h2(wx * 11 | 0, wy * 17 | 0) < 0.4 });
        }
        // dormers on the outer slopes
        const L = b.A1 - b.A0, nd = (plain || stone || rise < 0.8 || L < 4.9) ? 0 : L >= 7.4 ? 2 : 1;
        for (let k = 0; k < nd; k++) for (const sg of [-1, 1]) b.dormers.push({ a: b.A0 + L * (k + 1) / (nd + 1) + (sg * 0.35 * (nd === 1 ? 1 : 0)), cs: b.ridges === 2 ? sg * b.span : 0, sg, f: rise >= 1 ? 0.55 : 0.72, lit: h2(x0 * 31 + k * 7 + sg, y0 * 19) < 0.55 });
      }
      houses.push(b);
    }
    return { houses };
  }
  const plans = new WeakMap();
  function planOf(m) { let p = plans.get(m); if (!p || p.cells !== m.cells) { p = plan(m); p.cells = m.cells; plans.set(m, p); } return p; }
  const night = () => { const t = typeof G !== 'undefined' && G && Number.isFinite(G.tod) ? G.tod : 0.5; return t < 0.27 || t > 0.76; };
  const chimneysOf = (m) => (m && m._fs && m._fs.chimneys) || [];
  function stackTop(b, x, y) { const z = roofZ(b, x, y); return z == null ? null : max(z + 0.45, b.ridge + 0.2); }

  // ---------------------------------------------------------------- where the rain stops
  let shel = null;
  function shelter(m) {
    if (!m || !MAPS.has(m.id) || !on()) return null;
    const p = planOf(m), sig = m.id + '|' + p.houses.length;
    if (shel && shel.map === m && shel.plan === p) return shel;
    const K = 4, W = m.w * K, H = m.h * K, d = new Float32Array(W * H).fill(-1e4);
    for (let cy = 0; cy < m.h; cy++) for (let cx = 0; cx < m.w; cx++) {             // inside any block it does not rain
      const c = m.cells[cy * m.w + cx]; if (!c || c.door) continue; const t = (m.lvls ? m.lvls[cy * m.w + cx] || 0 : 0) + (c.top != null ? c.top : 1);
      for (let j = 0; j < K; j++) for (let i = 0; i < K; i++) d[(cy * K + j) * W + cx * K + i] = t;
    }
    for (const b of p.houses) {                                                      // nor under a roof, out to the edge of its eaves
      const o = OVER + 0.05, X0 = max(0, Math.floor((b.x0 - b.jetty - o) * K)), X1 = min(W - 1, Math.ceil((b.x1 + 1 + b.jetty + o) * K)), Y0 = max(0, Math.floor((b.y0 - b.jetty - o) * K)), Y1 = min(H - 1, Math.ceil((b.y1 + 1 + b.jetty + o) * K));
      for (let y = Y0; y <= Y1; y++) for (let x = X0; x <= X1; x++) { const z = roofZ(b, (x + 0.5) / K, (y + 0.5) / K); if (z != null && z > d[y * W + x]) d[y * W + x] = z; }
      if (b.dome) { const r = 1.0 * K; for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) if (x * x + y * y <= r * r) { const i = (Math.floor((b.dome.y + 0.5) * K) + y) * W + Math.floor((b.dome.x + 0.5) * K) + x; if (d[i] < b.ridge + 0.4) d[i] = b.ridge + 0.4; } }
    }
    return (shel = { map: m, plan: p, sig, k: K, w: W, h: H, data: d });
  }

  // ---------------------------------------------------------------- the tiles this needs, made from the game's own
  let texDone = false;
  function textures() {
    if (texDone || typeof Engine === 'undefined' || !Engine.textures || !Engine.textures.t_wood || !Engine.textures.t_roof) return texDone;
    const wood = Engine.textures.t_wood, roof = Engine.textures.t_roof, rgb = (r, g, b, a = 255) => ((a << 24) | (min(255, max(0, b)) | 0) << 16 | (min(255, max(0, g)) | 0) << 8 | (min(255, max(0, r)) | 0)) >>> 0;
    const px = (c, k, t) => rgb((c & 255) * k * (t ? t[0] : 1), ((c >>> 8) & 255) * k * (t ? t[1] : 1), ((c >>> 16) & 255) * k * (t ? t[2] : 1));
    const dark = new Uint32Array(4096), shut = new Uint32Array(4096), win = new Uint32Array(4096), lit = new Uint32Array(4096), slate = new Uint32Array(4096), thatch = new Uint32Array(4096), lan = new Uint32Array(4096), lanLit = new Uint32Array(4096);
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const i = y * 64 + x, w = wood[i], n = h2(x >> 1, y >> 1) - 0.5;
      dark[i] = px(w, 0.5);
      // slate: the roof tile's own courses, in cold blue-grey
      { const c = roof[i], l = 0.3 * (c & 255) + 0.59 * ((c >>> 8) & 255) + 0.11 * ((c >>> 16) & 255), k = (l - 70) * 1.25 + 74 + (h2(x >> 3, y >> 4) - 0.5) * 16; slate[i] = rgb(k * 0.74, k * 0.8, k * 0.93); }
      // thatch: straw combed down the slope, in layers
      { const st = h2(x, y >> 3) * 0.26 + h2(x >> 1, (y >> 4) + 7) * 0.2, band = ((y + ((h2(x >> 3, 11) * 5) | 0)) % 21) < 2 ? 0.68 : ((y + 3) % 21) < 3 ? 1.08 : 1, k = (0.68 + st) * band * (h2(x * 3, y * 5) < 0.04 ? 0.7 : 1); thatch[i] = rgb(156 * k, 132 * k, 86 * k); }
      // a shutter: upright boards, two battens, a dark edge
      const batten = (y > 9 && y < 15) || (y > 48 && y < 54), edge = x < 2 || x > 61 || y < 2 || y > 61, gap = x % 16 === 0;
      shut[i] = px(w, edge ? 0.42 : batten ? 0.62 : gap ? 0.5 : 0.86, [0.78, 0.98, 0.82]);
      // a lancet: a pointed arch in a stone surround, leaded glass
      { const t = y < 24 ? (24 - y) / 24 : 0, hw = 19 * (1 - Math.pow(t, 1.7)), dx = abs(x - 31.5);
        if (dx > hw || y < 1) { lan[i] = 0; lanLit[i] = 0; }
        else if (dx > hw - 3.2 || y > 60) { const k = 148 + n * 22; lan[i] = rgb(k, k * 0.98, k * 0.93); lanLit[i] = rgb(k * 0.8, k * 0.76, k * 0.68); }
        else { const lead = ((x + y) % 9 === 0) || ((x - y + 64) % 9 === 0) || abs(dx) < 0.8;
          lan[i] = lead ? rgb(22, 24, 30) : rgb(40 + n * 12 + (64 - y) * 0.3, 52 + n * 12 + (64 - y) * 0.4, 70 + n * 14 + (64 - y) * 0.5);
          const core = max(0, 1 - (dx / 19) * (dx / 19) * 0.6 - abs(y - 38) / 70), tint = ((x >> 3) + (y >> 3)) % 3;
          lanLit[i] = lead ? rgb(70, 40, 16) : rgb(188 + 67 * core + (tint === 0 ? 20 : 0), 112 + 90 * core + (tint === 1 ? 14 : 0), 40 + 60 * core + (tint === 2 ? 30 : 0)); }
      }
      // a window: frame, four panes, glazing bars; a sill line at the foot
      const frame = x < 7 || x > 56 || y < 7 || y > 55, bar = abs(x - 31.5) < 2.2 || abs(y - 30.5) < 2.2, innr = x < 9 || x > 54 || y < 9 || y > 53;
      if (frame || bar) { const k = y > 55 ? 0.95 : frame ? 0.7 : 0.6; win[i] = px(w, k); lit[i] = px(w, k * 0.8); continue; }
      const glint = abs((x - y * 0.8) - 6) < 3 || abs((x - y * 0.8) - 20) < 1.4, sh = innr ? 0.7 : 1;
      win[i] = rgb((38 + n * 10 + (glint ? 34 : 0) + (64 - y) * 0.35) * sh, (48 + n * 10 + (glint ? 38 : 0) + (64 - y) * 0.45) * sh, (62 + n * 12 + (glint ? 40 : 0) + (64 - y) * 0.5) * sh);
      const ex = (x - 32) / 26, ey = (y - 34) / 26, core = max(0, 1 - (ex * ex + ey * ey) * 0.55), curtain = (x < 18 || x > 45) && y < 40 ? 0.72 : 1;
      lit[i] = rgb((176 + 79 * core + n * 14) * sh * curtain, (112 + 96 * core + n * 12) * sh * curtain, (38 + 70 * core) * sh * curtain);
    }
    for (const [name, d] of [['e78_dark', dark], ['e78_shutter', shut], ['e78_win', win], ['e78_winlit', lit], ['e78_slate', slate], ['e78_thatch', thatch], ['e78_lancet', lan], ['e78_lancetlit', lanLit]]) Engine.addTexture(name, d);
    return (texDone = true);
  }

  // ---------------------------------------------------------------- geometry, into the renderer's own mesh
  // h: { B (the mesh builder), tex(name) -> layer, MAT, ZK }. Returns the triangles added.
  function build(m, h) {
    if (!on() || !m || !MAPS.has(m.id) || !textures()) return 0;
    const B = h.B, MAT = h.MAT, ZK = h.ZK, dusk = night(); let tris = 0;
    const unit = (x, y, z) => { const l = hyp(x, y, z) || 1; return [x / l, y / l, z / l]; };
    // the normal of a plane through three points (in the renderer's space, where heights are scaled), turned to face `toward`
    const planeN = (p, q, r, toward) => { const ux = q[0] - p[0], uy = q[1] - p[1], uz = (q[2] - p[2]) * ZK, vx = r[0] - p[0], vy = r[1] - p[1], vz = (r[2] - p[2]) * ZK; let n = unit(uy * vz - uz * vy, uz * vx - ux * vz, ux * vy - uy * vx); if (n[0] * toward[0] + n[1] * toward[1] + n[2] * toward[2] < 0) n = [-n[0], -n[1], -n[2]]; return n; };
    const quad = (p, uv, L, mat, side, n) => { const v = p.map((q, i) => B.vert(q[0], q[1], q[2], uv[i][0], uv[i][1], L, -1, mat, side, n[0], n[1], n[2])); B.quad(v[0], v[1], v[2], v[3]); tris += 2; };
    const tri = (p, uv, L, mat, side, n) => { const v = p.map((q, i) => B.vert(q[0], q[1], q[2], uv[i][0], uv[i][1], L, -1, mat, side, n[0], n[1], n[2])); B.quad(v[0], v[1], v[2], v[2]); tris += 1; };
    const UP = [0, 0, 1], DN = [0, 0, -1];
    const L_ = (n) => h.tex(Engine.textures[n] ? n : 't_stone');
    const Ldark = L_('e78_dark'), Lshut = L_('e78_shutter'), Lwin = L_('e78_win'), Llit = L_('e78_winlit'), Lstone = L_('t_stone'), Llan = L_('e78_lancet'), LlanLit = L_('e78_lancetlit'), Lbrick = L_('t_house_p20b_2');
    // a box standing on z0 (four sides and a top)
    const box = (x0, y0, x1, y1, z0, z1, L, Ltop, sideK = 1) => {
      quad([[x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1]], [[x0, z1 - z0], [x1, z1 - z0], [x1, 0], [x0, 0]], L, MAT.wall, 0.8 * sideK, [0, -1, 0]);
      quad([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], [[x0, z1 - z0], [x1, z1 - z0], [x1, 0], [x0, 0]], L, MAT.wall, 0.8 * sideK, [0, 1, 0]);
      quad([[x0, y0, z0], [x0, y1, z0], [x0, y1, z1], [x0, y0, z1]], [[y0, z1 - z0], [y1, z1 - z0], [y1, 0], [y0, 0]], L, MAT.wall, sideK, [-1, 0, 0]);
      quad([[x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [x1, y0, z1]], [[y0, z1 - z0], [y1, z1 - z0], [y1, 0], [y0, 0]], L, MAT.wall, sideK, [1, 0, 0]);
      quad([[x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1]], [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], Ltop, MAT.wall, 1.1 * sideK, UP);
    };
    // an opening on a wall plane
    const opening = (w) => {
      const tx = -w.ny, ty = w.nx, n = [w.nx, w.ny, 0], side = w.nx ? 1 : 0.8, hw = w.hw, z0 = w.z0, z1 = w.z1, glow = dusk && w.lit, stoneSill = w.style === 'hall' || w.style === 'lancet', small = w.style === 'attic' || w.style === 'dormer';
      const at = (t, off, z) => [w.cx + tx * t + w.nx * off, w.cy + ty * t + w.ny * off, z];
      const sill = (d, th) => { quad([at(-hw - 0.04, d, z0 - th), at(hw + 0.04, d, z0 - th), at(hw + 0.04, d, z0), at(-hw - 0.04, d, z0)], [[0, 0.1], [0.6, 0.1], [0.6, 0], [0, 0]], stoneSill ? Lstone : Ldark, MAT.wall, side * 1.25, n);
        quad([at(-hw - 0.04, 0.012, z0), at(hw + 0.04, 0.012, z0), at(hw + 0.04, d, z0), at(-hw - 0.04, d, z0)], [[0, 0], [0.6, 0], [0.6, 0.1], [0, 0.1]], stoneSill ? Lstone : Ldark, MAT.wall, 1.5, UP); };
      if (w.style === 'hatch') {                                 // a boarded hatch: two shutters closed over the opening
        for (const sgn of [-1, 1]) quad([at(sgn * 0.005, 0.016, z0), at(sgn * hw, 0.016, z0), at(sgn * hw, 0.016, z1), at(sgn * 0.005, 0.016, z1)], [[0, 1], [1, 1], [1, 0], [0, 0]], Lshut, MAT.wall, side * 0.92, n);
        sill(0.05, 0.04); return;
      }
      if (w.style === 'lancet') { quad([at(-hw, 0.014, z0), at(hw, 0.014, z0), at(hw, 0.014, z1), at(-hw, 0.014, z1)], [[0.02, 1], [0.98, 1], [0.98, 0], [0.02, 0]], glow ? LlanLit : Llan, glow ? MAT.glow : MAT.wall, side + 10, n); sill(0.05, 0.05); return; }
      const v1 = w.style === 'hall' ? 2 : 1;
      quad([at(-hw, 0.014, z0), at(hw, 0.014, z0), at(hw, 0.014, z1), at(-hw, 0.014, z1)], [[0, v1], [1, v1], [1, 0], [0, 0]], glow ? Llit : Lwin, glow ? MAT.glow : MAT.wall, side, n);
      sill(small ? 0.035 : 0.06, small ? 0.03 : 0.045);
      if (w.style === 'cottage') for (const sgn of [-1, 1]) { const i0 = sgn * (hw + 0.012), i1 = sgn * (hw + 0.2);      // shutters, standing a little open
        quad([at(i0, 0.02, z0 + 0.01), at(i1, 0.075, z0 + 0.01), at(i1, 0.075, z1 - 0.01), at(i0, 0.02, z1 - 0.01)], [[0, 1], [1, 1], [1, 0], [0, 0]], Lshut, MAT.wall, side, unit(w.nx - tx * sgn * 0.28, w.ny - ty * sgn * 0.28, 0)); }
    };

    for (const b of planOf(m).houses) {
      const ax = b.axis === 'x', Lroof = L_(b.roofTex), Lwall = L_(b.wallTex), Lboard = b.stone ? Lstone : Ldark, p = b.pitch, C = b.C, A0 = b.A0, A1 = b.A1, zB = b.zBase, top = b.top, wt = b.wallTop;
      const P = (a, s, z) => ax ? [a, C + s, z] : [C + s, a, z], N = (na, ns) => ax ? [na, ns, 0] : [ns, na, 0];
      // ---- the upper wall: a jettied storey, or a stone hall's cornice
      if (b.ext > 0) {
        const j = b.jetty, X0 = b.x0 - j, X1 = b.x1 + 1 + j, Y0 = b.y0 - j, Y1 = b.y1 + 1 + j, e = b.ext;
        quad([[X0, Y0, top], [X1, Y0, top], [X1, Y0, wt], [X0, Y0, wt]], [[X1, e], [X0, e], [X0, 0], [X1, 0]], Lwall, MAT.wall, 0.8, [0, -1, 0]);
        quad([[X0, Y1, top], [X1, Y1, top], [X1, Y1, wt], [X0, Y1, wt]], [[X0, e], [X1, e], [X1, 0], [X0, 0]], Lwall, MAT.wall, 0.8, [0, 1, 0]);
        quad([[X0, Y0, top], [X0, Y1, top], [X0, Y1, wt], [X0, Y0, wt]], [[Y0, e], [Y1, e], [Y1, 0], [Y0, 0]], Lwall, MAT.wall, 1, [-1, 0, 0]);
        quad([[X1, Y0, top], [X1, Y1, top], [X1, Y1, wt], [X1, Y0, wt]], [[Y1, e], [Y0, e], [Y0, 0], [Y1, 0]], Lwall, MAT.wall, 1, [1, 0, 0]);
        const band = (z0, z1, o, L, k) => { quad([[X0 - o, Y0 - o, z0], [X1 + o, Y0 - o, z0], [X1 + o, Y0 - o, z1], [X0 - o, Y0 - o, z1]], [[X0, 0.1], [X1, 0.1], [X1, 0], [X0, 0]], L, MAT.wall, 0.8 * k, [0, -1, 0]);
          quad([[X0 - o, Y1 + o, z0], [X1 + o, Y1 + o, z0], [X1 + o, Y1 + o, z1], [X0 - o, Y1 + o, z1]], [[X0, 0.1], [X1, 0.1], [X1, 0], [X0, 0]], L, MAT.wall, 0.8 * k, [0, 1, 0]);
          quad([[X0 - o, Y0 - o, z0], [X0 - o, Y1 + o, z0], [X0 - o, Y1 + o, z1], [X0 - o, Y0 - o, z1]], [[Y0, 0.1], [Y1, 0.1], [Y1, 0], [Y0, 0]], L, MAT.wall, k, [-1, 0, 0]);
          quad([[X1 + o, Y0 - o, z0], [X1 + o, Y1 + o, z0], [X1 + o, Y1 + o, z1], [X1 + o, Y0 - o, z1]], [[Y0, 0.1], [Y1, 0.1], [Y1, 0], [Y0, 0]], L, MAT.wall, k, [1, 0, 0]); };
        if (j > 0) {                                             // the jetty: its underside and the beam it sits on
          quad([[X0, Y0, top - 0.05], [X1, Y0, top - 0.05], [X1, Y1, top - 0.05], [X0, Y1, top - 0.05]], [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], Ldark, MAT.wall, 0.55, DN);
          band(top - 0.05, top + 0.055, 0.012, Ldark, 0.95);
        } else { band(wt - 0.07, wt + 0.03, 0.03, Lstone, 1.12); quad([[X0 - 0.03, Y0 - 0.03, wt + 0.03], [X1 + 0.03, Y0 - 0.03, wt + 0.03], [X1 + 0.03, Y1 + 0.03, wt + 0.03], [X0 - 0.03, Y1 + 0.03, wt + 0.03]], [[X0, Y0], [X1, Y0], [X1, Y1], [X0, Y1]], Lstone, MAT.wall, 1.2, UP); }
      }
      // ---- the roof
      if (b.type === 'gable') {
        const a0 = A0 - VERGE, a1 = A1 + VERGE, span = b.span, centres = b.ridges === 2 ? [-span, span] : [0];
        for (const cs of centres) {
          const zr = zB + span * p;
          for (const sg of [-1, 1]) {
            const inner = b.ridges === 2 && sg * cs < 0, over = inner ? 0 : OVER, se = span + over, ze = zB - over * p, sl = hyp(se, se * p), up = planeN(P(a0, cs + sg * se, ze), P(a1, cs + sg * se, ze), P(a1, cs, zr), UP), side = sg < 0 ? 1 : 0.86;
            quad([P(a0, cs + sg * se, ze), P(a1, cs + sg * se, ze), P(a1, cs, zr), P(a0, cs, zr)], [[a0, sl], [a1, sl], [a1, 0], [a0, 0]], Lroof, MAT.wall, side, up);
            quad([P(a0, cs + sg * se, ze - 0.012), P(a1, cs + sg * se, ze - 0.012), P(a1, cs, zr - 0.012), P(a0, cs, zr - 0.012)], [[a0, sl], [a1, sl], [a1, 0], [a0, 0]], Ldark, MAT.wall, 0.6, [-up[0], -up[1], -up[2]]);
            if (!inner) quad([P(a0, cs + sg * se, ze + 0.012), P(a1, cs + sg * se, ze + 0.012), P(a1, cs + sg * se, ze - 0.075), P(a0, cs + sg * se, ze - 0.075)], [[a0, 0], [a1, 0], [a1, 0.09], [a0, 0.09]], Lboard, MAT.wall, 0.9, N(0, sg));
            for (const [a, na] of [[a0, -1], [a1, 1]]) quad([P(a, cs + sg * se, ze + 0.014), P(a, cs, zr + 0.014), P(a, cs, zr - 0.1), P(a, cs + sg * se, ze - 0.1)], [[0, 0], [sl, 0], [sl, 0.11], [0, 0.11]], Lboard, MAT.wall, 0.85, N(na, 0));
            quad([P(a0, cs + sg * 0.07, zr - 0.07 * p + 0.016), P(a1, cs + sg * 0.07, zr - 0.07 * p + 0.016), P(a1, cs, zr + 0.022), P(a0, cs, zr + 0.022)], [[a0, 0.1], [a1, 0.1], [a1, 0], [a0, 0]], Ldark, MAT.wall, sg < 0 ? 1.15 : 1, up);   // the ridge course
          }
          // the gable ends: the wall carried up to the ridge
          for (const [a, na] of [[A0, -1], [A1, 1]]) {
            const u = (s) => (ax ? (na > 0 ? C + s : -(C + s)) : (na > 0 ? -(C + s) : C + s)), sk = ax ? 1 : 0.8;
            if (zB > wt + 1e-4) quad([P(a, cs - span, wt), P(a, cs + span, wt), P(a, cs + span, zB), P(a, cs - span, zB)], [[u(cs - span), 0], [u(cs + span), 0], [u(cs + span), -(zB - wt)], [u(cs - span), -(zB - wt)]], Lwall, MAT.wall, sk, N(na, 0));
            tri([P(a, cs - span, zB), P(a, cs + span, zB), P(a, cs, zr - 0.02)], [[u(cs - span), -(zB - wt)], [u(cs + span), -(zB - wt)], [u(cs), -(zr - 0.02 - wt)]], Lwall, MAT.wall, sk, N(na, 0));
          }
        }
        if (b.ridges === 2) quad([P(a0, -0.06, zB + 0.06 * p + 0.01), P(a1, -0.06, zB + 0.06 * p + 0.01), P(a1, 0.06, zB + 0.06 * p + 0.01), P(a0, 0.06, zB + 0.06 * p + 0.01)], [[a0, 0], [a1, 0], [a1, 0.1], [a0, 0.1]], Ldark, MAT.wall, 0.7, UP);   // the lead of the valley
        // dormers
        for (const d of b.dormers) {
          const sA = (dd) => d.cs + d.sg * dd, zR = (dd) => zB + (span - dd) * p, f = (d.f || 0.55) * span, zf = zR(f), dw = 0.27, ze = zf + 0.32, zd = ze + 0.17, de = span - (ze - zB) / p, dr = max(0.03, span - (zd - zB) / p), a = d.a, out = N(0, d.sg);
          quad([P(a - dw, sA(f), zf), P(a + dw, sA(f), zf), P(a + dw, sA(f), ze), P(a - dw, sA(f), ze)], [[0, 0.32], [0.54, 0.32], [0.54, 0], [0, 0]], Lwall, MAT.wall, 0.95, out);
          tri([P(a - dw, sA(f), ze), P(a + dw, sA(f), ze), P(a, sA(f), zd)], [[0, 0], [0.54, 0], [0.27, -0.17]], Lwall, MAT.wall, 0.95, out);
          for (const k of [-1, 1]) {
            tri([P(a + k * dw, sA(f), zf), P(a + k * dw, sA(f), ze), P(a + k * dw, sA(de), ze)], [[0, 0.32], [0, 0], [f - de, 0]], Lwall, MAT.wall, 0.8, N(k, 0));
            const e0 = P(a + k * (dw + 0.07), sA(f + 0.08), ze - 0.04), r0 = P(a, sA(f + 0.08), zd), r1 = P(a, sA(dr), zd), e1 = P(a + k * (dw + 0.07), sA(span - (ze - 0.04 - zB) / p), ze - 0.04);
            quad([e0, r0, r1, e1], [[0, 0.36], [0, 0], [f - dr, 0], [f - de, 0.36]], Lroof, MAT.wall, k < 0 ? 1 : 0.86, planeN(e0, r0, r1, UP));
          }
          const wx = ax ? a : C + sA(f), wy = ax ? C + sA(f) : a;
          opening({ cx: wx, cy: wy, nx: out[0], ny: out[1], z0: zf + 0.07, z1: ze - 0.03, hw: 0.17, style: 'dormer', lit: d.lit });
        }
      } else {
        // a hipped roof: two long slopes and two ends, eaves all round
        const hf = b.half, o = OVER, ze = zB - o * p, zr = zB + hf * p, r0 = A0 + hf, r1 = A1 - hf, sl = hyp(hf + o, (hf + o) * p);
        const E = [P(A0 - o, -hf - o, ze), P(A1 + o, -hf - o, ze), P(A1 + o, hf + o, ze), P(A0 - o, hf + o, ze)], R0 = P(r0, 0, zr), R1 = P(r1, 0, zr), lo = (q) => [q[0], q[1], q[2] - 0.012];
        const faces = [[E[0], E[1], R1, R0, 1, [[A0 - o, sl], [A1 + o, sl], [r1, 0], [r0, 0]]], [E[3], E[2], R1, R0, 0.86, [[A0 - o, sl], [A1 + o, sl], [r1, 0], [r0, 0]]], [E[0], E[3], R0, R0, 0.92, [[-hf - o, sl], [hf + o, sl], [0, 0], [0, 0]]], [E[1], E[2], R1, R1, 0.92, [[-hf - o, sl], [hf + o, sl], [0, 0], [0, 0]]]];
        for (const [q0, q1, q2, q3, sk, uv] of faces) { const up = planeN(q0, q1, q2, UP);
          quad([q0, q1, q2, q3], uv, Lroof, MAT.wall, sk, up); quad([lo(q0), lo(q1), lo(q2), lo(q3)], uv, Ldark, MAT.wall, 0.6, [-up[0], -up[1], -up[2]]); }
        const mx = ax ? (A0 + A1) / 2 : C, my = ax ? C : (A0 + A1) / 2;
        for (let k = 0; k < 4; k++) { const q0 = E[k], q1 = E[(k + 1) % 4], dx = (q0[0] + q1[0]) / 2 - mx, dy = (q0[1] + q1[1]) / 2 - my, nn = abs(q1[0] - q0[0]) < 1e-6 ? [Math.sign(dx), 0, 0] : [0, Math.sign(dy), 0], len = hyp(q1[0] - q0[0], q1[1] - q0[1]);
          quad([[q0[0], q0[1], ze + 0.012], [q1[0], q1[1], ze + 0.012], [q1[0], q1[1], ze - 0.08], [q0[0], q0[1], ze - 0.08]], [[0, 0], [len, 0], [len, 0.09], [0, 0.09]], Lstone, MAT.wall, 0.95, nn); }
        // the Greenhall's dome: a drum and a low dome in the old moss tile, a small finial
        if (b.dome) {
          const cx = b.dome.x + 0.5, cy = b.dome.y + 0.5, rad = 0.92, zb = zr + 0.1, hD = 0.62, S = 14, Rn = 5, Ld = L_('t_roof');
          for (let i = 0; i < S; i++) {
            const t0 = i / S * 2 * PI, t1 = (i + 1) / S * 2 * PI, c0 = Math.cos(t0), s0 = Math.sin(t0), c1 = Math.cos(t1), s1 = Math.sin(t1), nm = unit(c0 + c1, s0 + s1, 0), sk = 0.8 + 0.2 * abs(nm[0]);
            quad([[cx + c0 * rad, cy + s0 * rad, zr - 0.5], [cx + c1 * rad, cy + s1 * rad, zr - 0.5], [cx + c1 * rad, cy + s1 * rad, zb], [cx + c0 * rad, cy + s0 * rad, zb]], [[i * 0.4, 0.6], [(i + 1) * 0.4, 0.6], [(i + 1) * 0.4, 0], [i * 0.4, 0]], Lwall, MAT.wall, sk, nm);
            for (let j = 0; j < Rn; j++) {
              const f0 = j / Rn * PI / 2, f1 = (j + 1) / Rn * PI / 2, ra = rad * 1.04 * Math.cos(f0), rb = rad * 1.04 * Math.cos(f1), za = zb + hD * Math.sin(f0), zc = zb + hD * Math.sin(f1);
              const q = [[cx + c0 * ra, cy + s0 * ra, za], [cx + c1 * ra, cy + s1 * ra, za], [cx + c1 * rb, cy + s1 * rb, zc], [cx + c0 * rb, cy + s0 * rb, zc]];
              quad(q, [[i * 0.3, j * 0.24 + 0.24], [(i + 1) * 0.3, j * 0.24 + 0.24], [(i + 1) * 0.3, j * 0.24], [i * 0.3, j * 0.24]], Ld, MAT.wall, sk, planeN(q[0], q[1], j === Rn - 1 ? q[3] : q[2], [nm[0], nm[1], 0.4]));
            }
          }
          box(cx - 0.04, cy - 0.04, cx + 0.04, cy + 0.04, zb + hD - 0.02, zb + hD + 0.22, Ldark, Ldark);
        }
      }
      // ---- the Chapel's tower: an open, empty bell-frame ("Nothing hangs in the tower. You can see daylight through the frame.")
      if (b.towers.length) {
        let X0 = 1e9, X1 = -1e9, Y0 = 1e9, Y1 = -1e9, T = 0; for (const t of b.towers) { X0 = min(X0, t.x); X1 = max(X1, t.x + 1); Y0 = min(Y0, t.y); Y1 = max(Y1, t.y + 1); T = max(T, t.top); }
        const pw = 0.16, hgt = 0.62, bm = 0.13;
        for (const [px, py] of [[X0, Y0], [X1 - pw, Y0], [X0, Y1 - pw], [X1 - pw, Y1 - pw]]) box(px, py, px + pw, py + pw, T, T + hgt, Ldark, Ldark);
        for (const [x0, y0, x1, y1] of [[X0, Y0, X1, Y0 + pw], [X0, Y1 - pw, X1, Y1], [X0, Y0, X0 + pw, Y1], [X1 - pw, Y0, X1, Y1]]) { box(x0, y0, x1, y1, T + hgt, T + hgt + bm, Ldark, Ldark);
          quad([[x0, y0, T + hgt], [x1, y0, T + hgt], [x1, y1, T + hgt], [x0, y1, T + hgt]], [[x0, y0], [x1, y0], [x1, y1], [x0, y1]], Ldark, MAT.wall, 0.5, DN); }
      }
      // ---- a stone footing along the foot of every timber wall that meets open ground
      for (const q of b.plinth) {
        const tx = -q.ny, ty = q.nx, cx = q.x + 0.5 + q.nx * 0.5, cy = q.y + 0.5 + q.ny * 0.5, side = q.nx ? 1 : 0.8, zb = top - 1, zt = zb + 0.15, o = 0.03;
        const at = (t, off, z) => [cx + tx * t + q.nx * off, cy + ty * t + q.ny * off, z], u0 = q.nx ? q.y : q.x;
        quad([at(-0.5 - o, o, zb), at(0.5 + o, o, zb), at(0.5 + o, o, zt), at(-0.5 - o, o, zt)], [[u0, 0.15], [u0 + 1, 0.15], [u0 + 1, 0], [u0, 0]], Lstone, MAT.wall, side * 0.92, [q.nx, q.ny, 0]);
        quad([at(-0.5 - o, 0, zt), at(0.5 + o, 0, zt), at(0.5 + o, o, zt), at(-0.5 - o, o, zt)], [[u0, 0], [u0 + 1, 0], [u0 + 1, 0.03], [u0, 0.03]], Lstone, MAT.wall, 1.2, UP);
      }
      // ---- a small tiled hood over a door in a gable end (eaves and jetties already shelter the others)
      if (b.type === 'gable' && b.storeys === 1) for (const d of b.doors) {
        if (ax ? d.nx === 0 : d.ny === 0) continue;
        const tx = -d.ny, ty = d.nx, cx = d.x + 0.5 + d.nx * 0.5, cy = d.y + 0.5 + d.ny * 0.5, side = d.nx ? 1 : 0.8, z1 = top + 0.1, z0 = top - 0.07, out = 0.36, hw = 0.6;
        const at = (t, off, z) => [cx + tx * t + d.nx * off, cy + ty * t + d.ny * off, z], up = planeN(at(-hw, out, z0), at(hw, out, z0), at(hw, 0.01, z1), UP);
        quad([at(-hw, out, z0), at(hw, out, z0), at(hw, 0.01, z1), at(-hw, 0.01, z1)], [[0, 0.4], [1.2, 0.4], [1.2, 0], [0, 0]], Lroof, MAT.wall, side, up);
        quad([at(-hw, out, z0 - 0.012), at(hw, out, z0 - 0.012), at(hw, 0.01, z1 - 0.012), at(-hw, 0.01, z1 - 0.012)], [[0, 0.4], [1.2, 0.4], [1.2, 0], [0, 0]], Ldark, MAT.wall, 0.6, [-up[0], -up[1], -up[2]]);
        quad([at(-hw, out, z0 + 0.012), at(hw, out, z0 + 0.012), at(hw, out, z0 - 0.06), at(-hw, out, z0 - 0.06)], [[0, 0], [1.2, 0], [1.2, 0.07], [0, 0.07]], Ldark, MAT.wall, side * 0.95, [d.nx, d.ny, 0]);
        for (const sgn of [-1, 1]) { const t = sgn * (hw - 0.05);                                                  // a bracket under each end
          for (const k of [1, -1]) quad([at(t, 0.01, z0 - 0.3), at(t, 0.3, z0 - 0.02), at(t, 0.3, z0 - 0.07), at(t, 0.01, z0 - 0.36)], [[0, 0], [0.4, 0], [0.4, 0.06], [0, 0.06]], Ldark, MAT.wall, 0.75, [tx * sgn * k, ty * sgn * k, 0]); }
      }
      // ---- windows
      for (const w of b.windows) opening(w);
      // ---- a brick stack under every smoking chimney
      for (const e of chimneysOf(m)) {
        if (e.x < b.x0 || e.x > b.x1 + 1 || e.y < b.y0 || e.y > b.y1 + 1) continue;
        const z = roofZ(b, e.x, e.y), zt = stackTop(b, e.x, e.y); if (z == null) continue;
        box(e.x - 0.17, e.y - 0.17, e.x + 0.17, e.y + 0.17, z - 0.25, zt, Lbrick, Ldark, 0.95);
        box(e.x - 0.2, e.y - 0.2, e.x + 0.2, e.y + 0.2, zt - 0.07, zt, Lstone, Ldark, 1.05);
      }
    }
    return tris;
  }

  // ---------------------------------------------------------------- in the game
  let wasLit = null, wasOn = null, wasCh = -1;
  function lift(m, drawing) {                                    // the smoking chimneys stand on the new stacks (only while the 3D renderer draws them)
    if (typeof G === 'undefined' || !G.ents || !m) return;
    const active = drawing && on() && MAPS.has(m.id);
    for (const e of G.ents) {
      if (e._fs !== 'chimney') continue;
      if (active && !e._e78) { const b = planOf(m).houses.find((q) => e.x >= q.x0 && e.x <= q.x1 + 1 && e.y >= q.y0 && e.y <= q.y1 + 1); if (!b) continue; const z = stackTop(b, e.x, e.y); if (z == null) continue; e._e78 = { yOff: e.yOff, top: e._fsTop, scale: e.scale }; e.yOff = -(z - 0.03); e._fsTop = z + 0.28; e.scale = 0.36; }
      else if (!active && e._e78) { e.yOff = e._e78.yOff; e._fsTop = e._e78.top; e.scale = e._e78.scale; e._e78 = null; }
    }
  }
  if (typeof R3D !== 'undefined' && R3D.extendMesh) {
    R3D.extendMesh((m, h) => build(m, h));
    R3D.on('frame', (F) => {
      const m = F && F.map; if (!m) return;
      const l = night(), o = on(), ch = chimneysOf(m).length;
      if (MAPS.has(m.id) && (l !== wasLit || o !== wasOn || ch !== wasCh)) { if (wasLit !== null) R3D.invalidate(); wasLit = l; wasOn = o; wasCh = ch; }
      lift(m, true);
    });
    R3D.on('toggle', (shown) => { try { if (!shown && typeof G !== 'undefined' && G.map) lift(G.map, false); } catch (e) { /* chimneys stay where they were */ } });
  }
  return { MAPS, STYLES, PITCH, OVER, RIDGE1, RIDGE2, plan, planOf, roofZ, shelter, build, on, night, textures };
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
        const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = "Oakhaven's buildings with pitched roofs, upper storeys, dormers, windows lit after dusk, the Greenhall's dome and the Chapel's bell-frame (3D renderer only)"; label.appendChild(sm);
        const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'gfx-eaves'; b.type = 'button'; b.setAttribute('aria-label', 'Roofs, windows and eaves');
        const sync = () => { b.textContent = GFX.eaves !== false ? 'On' : 'Off'; b.setAttribute('aria-pressed', GFX.eaves !== false ? 'true' : 'false'); };
        b.onclick = () => { GFX.eaves = GFX.eaves === false; if (typeof GFX.changed === 'function') GFX.changed(); if (typeof R3D !== 'undefined' && R3D.invalidate) R3D.invalidate(); sync(); };
        sync(); grid.appendChild(label); grid.appendChild(b);
      }
    } catch (e) { /* the menu still opens without the row */ }
    return r;
  };
})();
