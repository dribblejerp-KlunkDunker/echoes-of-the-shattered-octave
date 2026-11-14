// ============================================================
//  bearings82b — Phase 82b, the map agrees with the ground, and finger-posts at every way out.
//  Owner, 13 Nov 2026: "make sure that each location is exactly where it is on the map with roads leading in the proper
//  directions with signposts." Brief: story/Game Layer/Phase 82b - The map, finger-posts and notice boards (brief and text).md
//
//  1  ONE LAYOUT, WORKED OUT, NOT TYPED. Every outdoor place is placed from its gates: Oakhaven stands at a fixed point,
//     and where B stands = where A stands + A's gate - B's arriving gate, one cell across the shared edge. The roads are
//     followed outward until every place has a position. Where that one cell would lay a place over one already laid
//     (six places in the Reach, because the clearing's east hedge sends two roads east past Oakhaven's corner), B is moved
//     further out along the same road, never sideways: the direction and the line of the gate stay exact, and the extra
//     cells are road, drawn on the chart. A door inside a map (the Court's door to the Malting) counts by its nearest edge.
//  2  THE CHART. Each region's travel painting is drawn here, in code, from the places themselves: their ground, water,
//     walls, trees and hills, laid where the layout puts them, with the roads drawn between the gates. A place you have not
//     found is not drawn. The journey's minutes keep the old rule, one minute a cell. The Synod's wash (js/synod15.js) is
//     carried across onto the new chart, place by place, so it still covers what it covered.
//  3  FINGER-POSTS (section 3 of the brief): one at every way out between outdoor places, standing beside the road inside
//     the gate, each worded as the brief has it. All of them draw the existing `sign` sprite, in both renderers.
//  Recorded, not changed: the water-meadow's way back (js/meadow49.js) leaves the meadow by its west side and comes out at
//  Oakhaven's south wall, at the tannery culvert's mouth; it is not a pair of gates (you go out through the culvert in a
//  scene), so the meadow is laid outside Oakhaven's south wall, where the culvert goes. It is listed for the owner.
//  Oakhaven's own two gates have no words in the brief, so they wait for the owner's (AWAITING below).
//  Nothing here uses random numbers: the chart's grain is a hash of the cell.
// ============================================================
'use strict';

const BEARINGS82B = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('bearings82b: ' + k, e); } };
  const hasMaps = () => typeof G !== 'undefined' && G && G.maps && G.maps.oakhaven;

  // ---------------------------------------------------------------- the finger-posts (brief, section 3)
  // map: where the post stands; to: the way(s) out it stands by. All [PROPOSED] text, approved as written for the build.
  const POSTS = [
    { id: 'clearing_gate', map: 'clearing', to: ['oakhaven'], text: S('A finger-post. OAKHAVEN. Under it, smaller: THE NORTH GATE SHUTS AT DUSK.') },
    // the brief says this hedge already had the Greenroot road's post and asks for an arm to be added; it had none, so the
    // post is built with both arms, the second in the words the brief gives the Long Common's post for the same road
    { id: 'clearing_east', map: 'clearing', to: ['p47_stones', 'p79_road_w'], text: S('A finger-post. THE STONES, a little way. The other arm: GREENROOT, two days.') },
    { id: 'common_west', map: 'p79_road_w', to: ['clearing'], text: S('A finger-post. OAKHAVEN, by the Hedge. The other arm: GREENROOT, two days.') },
    { id: 'common_east', map: 'p79_road_w', to: ['p79_greenroad'], text: S('A finger-post. THE LEAP. Under it, smaller: GREENROOT, a day and a half.') },
    { id: 'middle_west', map: 'p79_greenroad', to: ['p79_road_w'], text: S('A finger-post. THE LONG COMMON. Under it, smaller: OAKHAVEN, half a day.') },
    { id: 'middle_east', map: 'p79_greenroad', to: ['p79_road_e'], text: S('A finger-post. GREENROOT WOOD. Under it, smaller: GREENROOT, a day.') },
    { id: 'wood_west', map: 'p79_road_e', to: ['p79_greenroad'], text: S('A finger-post. THE LEAP. Under it, smaller: OAKHAVEN, a day.') },
    { id: 'wood_east', map: 'p79_road_e', to: ['greenroot'], text: S('A finger-post. GREENROOT HAMLET. Somebody has chalked under it: nobody.') },
    { id: 'greenroot_west', map: 'greenroot', to: ['p79_road_e'], text: S('A finger-post. OAKHAVEN, two days. The paint is fresh. Nobody is left to have painted it.') },
    { id: 'stones', map: 'p47_stones', to: ['clearing'], text: S('A finger-post with one arm, pointing back the way you came. THE HEDGE.') },
    { id: 'flume_west', map: 'flume_road', to: ['oakhaven'], text: S('A finger-post. OAKHAVEN, by the sluice-arch.') },
    { id: 'flume_lane', map: 'flume_road', to: ['flume_landing'], text: S('A finger-post. STILLWATER LANDING, down. A second arm has been sawn off short.') },
    { id: 'landing_lane', map: 'flume_landing', to: ['flume_road'], text: S('A finger-post. THE FLUME ROAD, up. Under it, smaller: OAKHAVEN. Nobody has ever been seen to read it.') },
    { id: 'landing_gangway', map: 'flume_landing', to: ['flume_lowrings'], text: S('A plank on a post. THE LOW RINGS. Under it, in tar: at your own asking.') },
    { id: 'rings_gangway', map: 'flume_lowrings', to: ['flume_landing'], text: S('A plank on a post. STILLWATER. The post stands in water to its knees.') },
    // the brief: "(has its post; add) WETHERCOMBE, down the drove". The Downs' one finger-post stands by the east gate, thirty
    // cells from the stile, so the arm is given a post of its own at the stile, in the brief's pattern
    { id: 'downs_stile', map: 'p20_downs', to: ['p22_combe'], text: S('A finger-post. WETHERCOMBE, down the drove.') },
    { id: 'combe_south', map: 'p22_combe', to: ['p22_hanger'], text: S('A finger-post. THE HANGER. Under it, cut small with a knife: not after dark.') },
    { id: 'hanger_gap', map: 'p22_hanger', to: ['p22_combe'], text: S('A finger-post, green with moss. WETHERCOMBE. The Bellwether\'s ram is burned into the wood under it.') },
    { id: 'meadow', map: 'p49_meadow', to: ['oakhaven'], text: S('A post with no arm. Somebody has tied a hush-lamp\'s reed to it, and it whistles.') },
    { id: 'court_north', map: 'whispergrove', to: ['p61_yard'], text: S('A way-post in marble. THE MALTING. Under it, in new Office paint: RELIEF STATION NINETEEN.') },
    { id: 'court_west', map: 'whispergrove', to: ['p31_bellyard'], text: S('A way-post in marble. THE BELL YARD AND ASHLANE. Nobody has cleaned the weed off it.') },
    { id: 'bellyard', map: 'p31_bellyard', to: ['whispergrove'], text: S('A way-post in marble. THE COURT.') },
    { id: 'yard', map: 'p61_yard', to: ['whispergrove'], text: S('A painted Office board on a stake. TO THE COURT. QUEUE THIS SIDE.') },
    // the three ways out the brief gave no words for, worded in its pattern from what the books and the brief already say
    // (Greenroot two days; Stillwater down the Flume; Wethercombe down the drove) [PROPOSED, for the owner]
    { id: 'oak_north', map: 'oakhaven', to: ['clearing'], text: S('A finger-post. THE NORTH GATE. Under it, smaller: GREENROOT, two days.'), extra: true },
    { id: 'oak_sluice', map: 'oakhaven', to: ['flume_road'], text: S('A finger-post. THE SLUICE-ARCH. Under it, smaller: STILLWATER LANDING.'), extra: true },
    { id: 'clearing_west', map: 'clearing', to: ['p20_downs'], text: S('A finger-post. THE WATCH DOWNS. Under it, smaller: WETHERCOMBE, down the drove.'), extra: true },
  ];
  const POST_SHORT = S('A finger-post');
  // ways out with no words yet (none since the three above were worded)
  const AWAITING = [];
  // what the meadow's culvert does, recorded (see the header)
  const RECORDED = [{ map: 'p49_meadow', to: 'oakhaven', leaves: 'W', arrives: 'S', why: 'the tannery culvert, a scene, not a pair of gates' }];
  // a finger-post, by its words: the brief's and the ones the game had already
  const POST_RE = /^(A finger-post|A way-post|A plank on a post|A post with no arm|A painted Office board)/;

  // ---------------------------------------------------------------- regions
  // old: the painting each region had before (its width in cells and its aspect), for carrying the wash across
  const REGIONS = {
    reach: { root: 'oakhaven', old: { across: 240, ar: 933 / 1400 } },
    woods: { root: 'whispergrove', old: { across: 300, ar: 1440 / 960 } },
  };
  const MARGIN = 14;
  const VEC = { N: [0, -1], S: [0, 1], W: [-1, 0], E: [1, 0] };
  const OPP = { N: 'S', S: 'N', W: 'E', E: 'W' };

  // ---------------------------------------------------------------- gates
  function sideOf(m, x, y) {
    const d = [['N', y], ['S', m.h - 1 - y], ['W', x], ['E', m.w - 1 - x]];
    let b = d[0]; for (const e of d) if (e[1] < b[1]) b = e;
    return b[0];
  }
  function edgeOf(m, x, y, side) { return side === 'N' ? [x, 0] : side === 'S' ? [x, m.h - 1] : side === 'W' ? [0, y] : [m.w - 1, y]; }
  // every way between two outdoor places: { from, to, x, y, side, ex, ey, arrive (where you stand in `from` on coming back), pseudo }
  function gatesOf(maps) {
    const out = [];
    for (const id in maps) {
      const m = maps[id]; if (!m || !m.outdoor || !m.cells) continue;
      for (let i = 0; i < m.cells.length; i++) {
        const c = m.cells[i]; if (!c || !c.portal) continue;
        const t = maps[c.portal.map]; if (!t || !t.outdoor || t === m) continue;
        const x = i % m.w, y = (i / m.w) | 0, side = sideOf(m, x, y), [ex, ey] = edgeOf(m, x, y, side);
        out.push({ from: id, to: c.portal.map, x, y, side, ex, ey, arrive: null, pseudo: false, tx: c.portal.x, ty: c.portal.y });
      }
    }
    // where you stand on coming back in by each gate; and the ways with a door on one side only (the meadow's culvert)
    for (const g of out.slice()) {
      const back = out.find((h) => h.from === g.to && h.to === g.from);
      if (back) { g.arrive = [back.tx, back.ty]; continue; }
      const m = maps[g.to], x = Math.max(0, Math.min(m.w - 1, Math.floor(g.tx))), y = Math.max(0, Math.min(m.h - 1, Math.floor(g.ty))), side = sideOf(m, x, y), [ex, ey] = edgeOf(m, x, y, side);
      out.push({ from: g.to, to: g.from, x, y, side, ex, ey, arrive: [g.tx, g.ty], pseudo: true, tx: null, ty: null });
      const fm = maps[g.from]; g.arrive = fm.spawn && Math.hypot(fm.spawn.x - g.x - 0.5, fm.spawn.y - g.y - 0.5) < 3 ? [fm.spawn.x, fm.spawn.y] : null;
    }
    out.sort((a, b) => (a.from < b.from ? -1 : a.from > b.from ? 1 : a.y - b.y || a.x - b.x));
    return out;
  }
  // every pair of ways, with whether the side left by is the opposite of the side arrived at
  function pairsOf(gates) {
    const out = [];
    for (const g of gates) {
      const h = gates.find((k) => k.from === g.to && k.to === g.from); if (!h || g.from > g.to) continue;
      out.push({ a: g.from, b: g.to, leaves: g.side, arrives: h.side, agrees: OPP[g.side] === h.side, pseudo: g.pseudo || h.pseudo });
    }
    return out;
  }

  // ---------------------------------------------------------------- the layout
  const overlaps = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
  function layoutRegion(maps, regionId, R) {
    const def = REGIONS[regionId]; if (!def || !maps[def.root]) return null;
    const gates = gatesOf(maps), places = {}, links = [];
    places[def.root] = { x: 0, y: 0, w: maps[def.root].w, h: maps[def.root].h };
    // real gates first, everywhere; a way with a door on one side only (the meadow's culvert) after, where there is room
    for (const pass of [false, true]) {
    const q = Object.keys(places);
    while (q.length) {
      const a = q.shift(), A = places[a];
      for (const g of gates) {
        if (g.from !== a || places[g.to] || (g.pseudo && !pass)) continue;
        const back = gates.find((k) => k.from === g.to && k.to === a); if (!back) continue;
        const B = maps[g.to], d = VEC[g.side];
        let k = 1, p;
        for (; k < 2000; k++) {
          p = { x: A.x + g.ex - back.ex + d[0] * k, y: A.y + g.ey - back.ey + d[1] * k, w: B.w, h: B.h };
          if (!Object.keys(places).some((id) => overlaps(p, places[id]))) break;
        }
        p.gap = k; places[g.to] = p; q.push(g.to);
      }
    }
    }
    // places the region's travel map knows that no road reaches (the Deep Woods: the Kestrel goes there): kept where the old
    // painting had them from the region's first place, then moved out of the way if they would sit on anything
    const old = R && R.__p82bOld;
    if (R && old) for (const id in R.maps) {
      if (places[id] || !maps[id] || !old[id] || !old[def.root]) continue;
      const o = def.old, cx = (r) => (r[0] + r[2]) / 2 * o.across, cy = (r) => (r[1] + r[3]) / 2 * o.across / o.ar;
      const R0 = places[def.root], M = maps[id];
      const dx = cx(old[id]) - cx(old[def.root]), dy = cy(old[id]) - cy(old[def.root]), len = Math.hypot(dx, dy) || 1;
      let p = null;
      for (let k = 0; k < 2000; k++) {
        const s = 1 + k / len;
        p = { x: Math.round(R0.x + R0.w / 2 + dx * s - M.w / 2), y: Math.round(R0.y + R0.h / 2 + dy * s - M.h / 2), w: M.w, h: M.h, free: true };
        if (!Object.keys(places).some((j) => overlaps(p, places[j]))) break;
      }
      places[id] = p;
    }
    for (const g of gates) {
      if (!places[g.from] || !places[g.to] || g.from > g.to) continue;
      const back = gates.find((k) => k.from === g.to && k.to === g.from); if (!back) continue;
      links.push({ pseudo: g.pseudo || back.pseudo, a: g.from, b: g.to, ax: places[g.from].x + g.ex + 0.5, ay: places[g.from].y + g.ey + 0.5, bx: places[g.to].x + back.ex + 0.5, by: places[g.to].y + back.ey + 0.5 });
    }
    let x0 = 1e9, y0 = 1e9, x1 = -1e9, y1 = -1e9;
    for (const id in places) { const p = places[id]; x0 = Math.min(x0, p.x); y0 = Math.min(y0, p.y); x1 = Math.max(x1, p.x + p.w); y1 = Math.max(y1, p.y + p.h); }
    x0 -= MARGIN; y0 -= MARGIN; x1 += MARGIN; y1 += MARGIN;
    const Wc = x1 - x0, Hc = y1 - y0, P = Math.max(2, Math.min(8, Math.floor(2000 / Wc)));
    const frac = (id) => { const p = places[id]; return [(p.x - x0) / Wc, (p.y - y0) / Hc, (p.x + p.w - x0) / Wc, (p.y + p.h - y0) / Hc]; };
    return { region: regionId, places, links, gates: gates.filter((g) => places[g.from] && places[g.to]), x0, y0, Wc, Hc, P, W: Wc * P, H: Hc * P, frac };
  }

  // ---------------------------------------------------------------- applying it to the travel map
  const L = { key: null, lay: {}, chart: {}, washDone: {} };
  function mapsKey() { if (!hasMaps()) return null; let n = 0; for (const id in G.maps) if (G.maps[id] && G.maps[id].outdoor) n++; return n + ':' + G.maps.oakhaven.w; }
  function apply() {
    if (!hasMaps() || typeof TRAVEL_REGIONS === 'undefined') return false;
    const key = mapsKey();
    for (const rid in REGIONS) {
      const R = TRAVEL_REGIONS[rid]; if (!R) continue;
      const rk = key + '|' + Object.keys(R.maps).join(',');
      if (L.lay[rid] && L.lay[rid].__key === rk) continue;
      // the painting's rectangles as they were, kept once, for the wash and for places no road reaches
      if (!R.__p82bOld) { R.__p82bOld = {}; for (const id in R.maps) R.__p82bOld[id] = R.maps[id].rect.slice(); R.__p82bOldAt = Object.assign({}, R.at || {}); }
      else for (const id in R.maps) if (!R.__p82bOld[id] && R.maps[id].rect) R.__p82bOld[id] = R.maps[id].rect.slice();
      const lay = layoutRegion(G.maps, rid, R); if (!lay) continue;
      lay.__key = rk; L.lay[rid] = lay;
      for (const id in R.maps) if (lay.places[id]) R.maps[id].rect = lay.frac(id);
      R.across = lay.Wc;                       // one minute a cell, as the old painting had it (240 minutes across 240 cells)
      R.at = {};                               // doors are where their cells are now: no hand-set spots
      for (const ex of R.extra) if (ex.at) { ex.__p82bAt = ex.at; delete ex.at; }
      // R.img keeps its old name as the key the rest of the game looks the painting up by; what is under it is the chart
      try { carryWash(rid, R, lay); } catch (e) { warnOnce('wash', e); }
    }
    return true;
  }
  // where a point of any laid place is on its region's chart (travelPlace only knows the destinations)
  function placeOnChart(rid, mapId, x, y) {
    const lay = L.lay[rid]; if (!lay || !lay.places[mapId]) return null;
    const p = lay.places[mapId];
    return [(p.x + x - lay.x0) / lay.Wc, (p.y + y - lay.y0) / lay.Hc];
  }

  // ---------------------------------------------------------------- the chart, painted in code
  function h2(a, b) { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; }
  const PARCH = [214, 196, 158];
  function groundCol(t) {
    t = String(t || '');
    if (/water/.test(t)) return [58, 86, 104];
    if (/shallow/.test(t)) return [104, 134, 136];
    if (/mist/.test(t)) return [150, 150, 146];
    if (/road|track|cobble|flag|mole|stlo|sthi|plank|deck|reach/.test(t)) return [176, 146, 98];
    if (/chalk|snow/.test(t)) return [222, 214, 190];
    if (/crag|stone|marble/.test(t)) return [150, 140, 122];
    if (/wood/.test(t)) return [140, 104, 66];
    if (/moss|litter/.test(t)) return [104, 120, 70];
    if (/meadow|turf|ramo|grass/.test(t)) return [126, 140, 82];
    return [128, 132, 90];
  }
  function wallCol(c) {
    const t = String(c.tex || '');
    if (c.door) return [196, 156, 70];
    if (/hedge|woods|deepwood|p17p/.test(t)) return [50, 72, 44];
    if (/cliff/.test(t)) return [110, 102, 92];
    if (/brick/.test(t)) return [136, 70, 52];
    if (/roof|thatch|slate/.test(t)) return [104, 70, 52];
    if (/marble|mausoleum/.test(t)) return [188, 184, 174];
    if (/grown/.test(t)) return [70, 92, 54];
    return [92, 84, 74];
  }
  const TREE = /^(oak|willow|beech|p22_ash|p20_thorn|p79_|p17p_|p22_apple|p9p_tree|pine|birch|yew|alder)/;
  function paintChart(rid, found) {
    const lay = L.lay[rid]; if (!lay || typeof document === 'undefined') return null;
    const P = lay.P, W = lay.W, H = lay.H;
    const cv = document.createElement('canvas'); cv.width = W; cv.height = H;
    const x = cv.getContext('2d'), img = x.createImageData(W, H), d = img.data;
    // the parchment: a grain from a hash of the pixel, and a darker rim
    for (let py = 0; py < H; py++) for (let px = 0; px < W; px++) {
      const i = (py * W + px) * 4, g = h2(px >> 1, py >> 1) * 14 - 7 + h2((px >> 4) + 91, (py >> 4) + 17) * 18 - 9;
      const ex = Math.min(px, W - 1 - px, py, H - 1 - py) / Math.max(1, Math.min(W, H) * 0.12), rim = ex < 1 ? (1 - ex) * 34 : 0;
      d[i] = PARCH[0] + g - rim; d[i + 1] = PARCH[1] + g - rim; d[i + 2] = PARCH[2] + g * 0.8 - rim * 1.1; d[i + 3] = 255;
    }
    // the places you have found, cell by cell: ground, water, walls, a little light on the slopes from the north-west
    for (const id in lay.places) {
      if (!found[id]) continue;
      const m = G.maps[id], p = lay.places[id]; if (!m) continue;
      const gx0 = (p.x - lay.x0) * P, gy0 = (p.y - lay.y0) * P;
      for (let cy = 0; cy < m.h; cy++) for (let cx = 0; cx < m.w; cx++) {
        const i = cy * m.w + cx, c = m.cells[i];
        let col = c ? wallCol(c) : groundCol(m.floorTextures && m.floorCells ? m.floorTextures[m.floorCells[i]] : m.floor);
        let sh = 0;
        if (!c && typeof m.groundAt === 'function') { try { sh = (m.groundAt(cx, cy + 0.5) - m.groundAt(cx + 1, cy + 0.5) + m.groundAt(cx + 0.5, cy) - m.groundAt(cx + 0.5, cy + 1)) * 60; } catch (e) { sh = 0; } }
        const n = h2(cx + p.x * 7, cy + p.y * 13) * 10 - 5 + Math.max(-22, Math.min(22, sh));
        for (let yy = 0; yy < P; yy++) for (let xx = 0; xx < P; xx++) {
          const k = ((gy0 + cy * P + yy) * W + gx0 + cx * P + xx) * 4; if (k < 0 || k >= d.length) continue;
          d[k] = Math.max(0, Math.min(255, col[0] + n)); d[k + 1] = Math.max(0, Math.min(255, col[1] + n)); d[k + 2] = Math.max(0, Math.min(255, col[2] + n * 0.8));
        }
      }
    }
    x.putImageData(img, 0, 0);
    // trees as dots of dark ink, and the edge of each place as a fine line
    for (const id in lay.places) {
      if (!found[id]) continue;
      const m = G.maps[id], p = lay.places[id]; if (!m) continue;
      const ox = (p.x - lay.x0) * P, oy = (p.y - lay.y0) * P;
      x.fillStyle = 'rgba(30,48,26,0.75)';
      for (const e of m.entities) { if (!e || e.kind !== 'deco' || !TREE.test(String(e.sprite || ''))) continue; x.beginPath(); x.arc(ox + e.x * P, oy + e.y * P, Math.max(1.2, P * 0.7 * (e.scale || 1)), 0, Math.PI * 2); x.fill(); }
      x.strokeStyle = 'rgba(52,34,18,0.55)'; x.lineWidth = Math.max(1, P * 0.5); x.strokeRect(ox + 0.5, oy + 0.5, m.w * P - 1, m.h * P - 1);
    }
    // the roads between the gates: a brown way with a gentle bend, never ruled straight, and a tick at each gate
    for (const k of lay.links) {
      if (!found[k.a] || !found[k.b]) continue;
      const ax = (k.ax - lay.x0) * P, ay = (k.ay - lay.y0) * P, bx = (k.bx - lay.x0) * P, by = (k.by - lay.y0) * P, len = Math.hypot(bx - ax, by - ay);
      const s = (h2(ax | 0, by | 0) < 0.5 ? -1 : 1) * Math.min(len * 0.12, 18 * P), nx = -(by - ay) / (len || 1), ny = (bx - ax) / (len || 1);
      // a way with a door on one side only (the meadow's culvert) is not a road: a dotted line of ink
      if (k.pseudo) { x.strokeStyle = 'rgba(58,36,16,0.8)'; x.lineWidth = Math.max(1, P * 0.6); x.setLineDash([P, P * 1.5]); x.beginPath(); x.moveTo(ax, ay); x.lineTo(bx, by); x.stroke(); x.setLineDash([]); continue; }
      x.strokeStyle = 'rgba(122,84,42,0.95)'; x.lineWidth = Math.max(2, P * 1.6); x.lineCap = 'round'; x.setLineDash([]);
      x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo((ax + bx) / 2 + nx * s, (ay + by) / 2 + ny * s, bx, by); x.stroke();
      x.strokeStyle = 'rgba(232,206,150,0.9)'; x.lineWidth = Math.max(1, P * 0.5); x.setLineDash([P * 2, P * 2]);
      x.beginPath(); x.moveTo(ax, ay); x.quadraticCurveTo((ax + bx) / 2 + nx * s, (ay + by) / 2 + ny * s, bx, by); x.stroke(); x.setLineDash([]);
      x.fillStyle = '#3a2410'; for (const [qx, qy] of [[ax, ay], [bx, by]]) x.fillRect(qx - P, qy - P, P * 2, P * 2);
    }
    // the names, in ink: the biggest places first, each name above its place, or inside its top edge, or under it,
    // wherever it does not run into a name already written
    const fs = Math.max(13, Math.round(W / (W / H > 2.2 ? 66 : 40))), boxes = [];   // the Woods chart is shown much smaller than it is drawn
    const hit = (b) => boxes.some((o) => b[0] < o[2] && o[0] < b[2] && b[1] < o[3] && o[1] < b[3]);
    const ids = Object.keys(lay.places).filter((id) => found[id] && G.maps[id]).sort((a, b) => lay.places[b].w * lay.places[b].h - lay.places[a].w * lay.places[a].h || (a < b ? -1 : 1));
    x.textAlign = 'center'; x.textBaseline = 'bottom';
    for (const id of ids) {
      const m = G.maps[id], p = lay.places[id], nm = tr(chartName(m));
      const px0 = (p.x - lay.x0) * P, py0 = (p.y - lay.y0) * P, pw = p.w * P, ph = p.h * P;
      let size = pw >= fs * 9 ? fs : Math.round(fs * 0.78), done = false;
      for (let tries = 0; tries < 2 && !done; tries++, size = Math.round(size * 0.8)) {
        x.font = `700 ${size}px "Alegreya SC", serif`;
        const tw = x.measureText(nm).width, cxm = Math.max(tw / 2 + 4, Math.min(W - tw / 2 - 4, px0 + pw / 2));
        for (const ty of [py0 - 3, py0 + size + 4, py0 + ph + size + 3, py0 + ph - 4]) {
          if (ty < size + 2 || ty > H - 2) continue;
          const b = [cxm - tw / 2 - 3, ty - size - 1, cxm + tw / 2 + 3, ty + 2]; if (hit(b)) continue;
          boxes.push(b); done = true;
          x.lineWidth = Math.max(2, size / 5); x.strokeStyle = 'rgba(232,214,176,0.92)'; x.strokeText(nm, cxm, ty);
          x.fillStyle = '#3a2410'; x.fillText(nm, cxm, ty); break;
        }
      }
    }
    // the compass: north is up
    const cr = Math.max(14, fs * 1.3), ccx = W - cr * 2, ccy = cr * 2;
    x.strokeStyle = '#3a2410'; x.fillStyle = '#3a2410'; x.lineWidth = 2;
    x.beginPath(); x.moveTo(ccx, ccy - cr); x.lineTo(ccx + cr * 0.3, ccy); x.lineTo(ccx, ccy + cr); x.lineTo(ccx - cr * 0.3, ccy); x.closePath(); x.stroke();
    x.beginPath(); x.moveTo(ccx, ccy - cr); x.lineTo(ccx + cr * 0.3, ccy); x.lineTo(ccx - cr * 0.3, ccy); x.closePath(); x.fill();
    x.textBaseline = 'bottom'; x.font = `700 ${Math.round(fs * 0.9)}px "Alegreya SC", serif`; x.fillText('N', ccx, ccy - cr - 2);   // N for north, and for Nord
    return cv;
  }
  // a place's name as the chart writes it: the part after a colon is the stretch of road, which is what the chart wants
  // the chart's own names for the Greenroot road's stretches and the Court (the rest are the places' own names)
  const CHART_NAMES = [S('The Long Common'), S('The Greenroot Road'), S('Greenroot Wood'), S('The Sunken Court'), S('The Stride'), S('The Pound Stair')];
  const tr = (t) => { try { const f = typeof STORY_I18N !== 'undefined' && STORY_I18N.translate(t); return f || t; } catch (e) { return t; } };
  const locale = () => { try { return typeof STORY_I18N !== 'undefined' ? STORY_I18N.locale : 'en'; } catch (e) { return 'en'; } };
  function chartName(m) {
    let n = String(m.name || m.id); const i = n.indexOf(': ');
    if (i > 0 && /Greenroot Road|Flume Road/.test(n)) n = n.slice(i + 2);
    n = n.replace(/^Whisper-Grove — /, '');
    return n.charAt(0).toUpperCase() + n.slice(1);
  }
  function foundSet(rid) {
    const lay = L.lay[rid], out = {}; if (!lay) return out;
    for (const id in lay.places) { const m = G.maps[id]; if (m && (typeof travelMapVisited === 'function' ? travelMapVisited(m) : false)) out[id] = true; }
    return out;
  }
  // the chart as the travel map wants it: one Image per region (js/synod15.js checks for an Image), its size known at
  // once, repainted when you find a place (its __p82bVer counts the repaints, so the wash's cache knows)
  function chartImage(rid) {
    if (!apply() || !L.lay[rid] || typeof TRAVEL_REGIONS === 'undefined') return null;
    const lay = L.lay[rid], found = foundSet(rid), key = locale() + '|' + Object.keys(found).sort().join(',');
    let c = L.chart[rid];
    if (c && c.key === key && c.lay === lay) return c.img;
    const cv = paintChart(rid, found); if (!cv) return null;
    let img = c && c.img;
    if (!img) {
      img = new Image(); img.__p82bVer = 0;
      img.onload = () => { try { if (typeof G !== 'undefined' && G.openPanel === 'travel' && typeof travelDraw === 'function') travelDraw(); } catch (e) { /* drawn next frame */ } };
    }
    Object.defineProperty(img, 'naturalWidth', { configurable: true, get: () => lay.W });
    Object.defineProperty(img, 'naturalHeight', { configurable: true, get: () => lay.H });
    img.__p82bVer = (img.__p82bVer || 0) + 1;
    img.src = cv.toDataURL('image/jpeg', 0.9);
    L.chart[rid] = c = { key, lay, img, cv };
    if (typeof TRAVEL !== 'undefined') TRAVEL.img[TRAVEL_REGIONS[rid].img] = img;
    return img;
  }
  const regionOfImg = (src) => { if (typeof TRAVEL_REGIONS === 'undefined') return null; for (const rid in REGIONS) if (TRAVEL_REGIONS[rid] && TRAVEL_REGIONS[rid].img === src) return rid; return null; };

  // ---------------------------------------------------------------- the Synod's wash, carried across place by place
  function carryWash(rid, R, lay) {
    if (L.washDone[rid] || typeof SYNOD15 === 'undefined' || !SYNOD15.WASH || !SYNOD15.WASH[rid]) return;
    const o = REGIONS[rid].old, old = R.__p82bOld || {}, oldAt = R.__p82bOldAt || {}, anchors = [];
    const toOld = (fx, fy) => [fx * o.across, fy * o.across / o.ar];
    for (const id in old) { const p = lay.places[id]; if (!p) continue; const r = old[id]; anchors.push([toOld((r[0] + r[2]) / 2, (r[1] + r[3]) / 2), [p.x + p.w / 2, p.y + p.h / 2]]); }
    for (const door in oldAt) {
      for (const id in lay.places) { const m = G.maps[id]; const i = m && m.cells ? m.cells.findIndex((c) => c && c.portal && c.portal.map === door) : -1; if (i < 0) continue; anchors.push([toOld(oldAt[door][0], oldAt[door][1]), [lay.places[id].x + (i % m.w) + 0.5, lay.places[id].y + ((i / m.w) | 0) + 0.5]]); break; }
    }
    if (!anchors.length) return;
    const move = (b) => {
      const [ox, oy] = toOld(b[0], b[1]); let sw = 0, sx = 0, sy = 0;
      for (const [a, n] of anchors) { const w = 1 / (Math.pow(Math.hypot(ox - a[0], oy - a[1]), 2) + 25); sw += w; sx += w * (n[0] - a[0]); sy += w * (n[1] - a[1]); }
      const nx = ox + sx / sw, ny = oy + sy / sw;
      return [(nx - lay.x0) / lay.Wc, (ny - lay.y0) / lay.Hc, b[2] * o.across / lay.Wc];
    };
    const T = SYNOD15.WASH[rid];
    T.add = T.add.map((st) => st.map(move));
    T.holes = T.holes.map((st) => st.map(move));
    L.washDone[rid] = true;
  }

  // ---------------------------------------------------------------- the finger-posts, placed
  const free = (m, x, y) => {
    const cx = Math.floor(x), cy = Math.floor(y);
    if (cx < 1 || cy < 1 || cx >= m.w - 1 || cy >= m.h - 1) return false;
    for (const [dx, dy] of [[0, 0], [-0.3, -0.3], [0.3, -0.3], [-0.3, 0.3], [0.3, 0.3]]) { const c = m.get(Math.floor(x + dx), Math.floor(y + dy)); if (c || m.isBlocked(Math.floor(x + dx), Math.floor(y + dy))) return false; }
    for (const e of m.entities) { if (!e || e.dead) continue; if (Math.hypot(e.x - x, e.y - y) < (e.solid ? (e.radius || 0.3) + 0.55 : 0.5)) return false; }
    return true;
  };
  function gateTo(maps, m, to) {
    const gates = gatesOf(maps);
    return gates.find((g) => g.from === m.id && g.to === to) || null;
  }
  function postSpot(maps, m, gs) {
    // stand inside the gate, beside the way in: from where you arrive, a little further in, a little to one side
    let bx = 0, by = 0, nx = 0, ny = 0;
    for (const g of gs) {
      const v = VEC[g.side], gx = g.x + 0.5, gy = g.y + 0.5, a = g.arrive || [gx - v[0], gy - v[1]];
      bx += a[0]; by += a[1]; nx -= v[0]; ny -= v[1];
    }
    bx /= gs.length; by /= gs.length; const nl = Math.hypot(nx, ny) || 1; nx /= nl; ny /= nl;
    const tx = -ny, ty = nx;
    for (const dd of [0.6, 1.2, 1.8, 0.2, 2.4, 3.0]) for (const s of [1.1, -1.1, 1.6, -1.6, 0.7, -0.7, 2.2, -2.2, 2.8, -2.8]) {
      const px = bx + nx * dd + tx * s, py = by + ny * dd + ty * s;
      if (!gs.every((g) => Math.hypot(px - g.x - 0.5, py - g.y - 0.5) <= 4.6)) continue;
      if (free(m, px, py)) return [+px.toFixed(2), +py.toFixed(2)];
    }
    return null;
  }
  // a new standing thing joins the map's base entities (the ones a save keeps by place), ahead of anything transient that
  // another module has already put after them (the scenery's props): never by moving baseCount over those
  function addBase(m, e) {
    if (m.baseCount == null) return e;
    const i = m.entities.lastIndexOf(e); if (i < 0) return e;
    m.entities.splice(i, 1); m.entities.splice(m.baseCount, 0, e); m.baseCount++;
    return e;
  }
  // later roads add their own posts (window.P82B_POSTS), and say which posts now stand by a door onto them (window.P82B_REMAP)
  const allPosts = () => POSTS.concat((typeof window !== 'undefined' && window.P82B_POSTS) || []);
  const targets = (P) => { const R = (typeof window !== 'undefined' && window.P82B_REMAP && window.P82B_REMAP[P.map]) || {}; return P.to.map((t) => R[t] || t); };
  function placePosts(maps) {
    const placed = [];
    for (const P of allPosts()) {
      const m = maps[P.map]; if (!m || !m.entities) continue;
      if (m.entities.some((e) => e && e._p82bPost === P.id)) continue;
      const to = targets(P), gs = to.map((t) => gateTo(maps, m, t)).filter(Boolean); if (gs.length !== to.length) continue;
      const at = postSpot(maps, m, gs);
      if (!at) { warnOnce('no room for ' + P.id, P); continue; }
      // Greenroot's own rule (js/parish.js): a hint is one short line, and the long words are read with `look`
      const short = typeof PARISH !== 'undefined' && PARISH.MAPS && PARISH.MAPS.indexOf(P.map) >= 0;
      addBase(m, m.deco('sign', at[0], at[1], Object.assign({ radius: 0.18, scale: 0.85, solid: false, label: P.text, _p82bPost: P.id }, short ? { label: POST_SHORT, look: P.text, use: 'p9p_look' } : {})));
      placed.push(P.id);
    }
    return placed;
  }

  // ---------------------------------------------------------------- the checks the test asks for (also usable from the console)
  function wayOuts() { return hasMaps() ? gatesOf(G.maps).filter((g) => !g.pseudo) : []; }
  function postsNear(g, r) {
    const m = G.maps[g.from]; r = r || 5;
    return m.entities.filter((e) => e && e.kind === 'deco' && (e._p82bPost || POST_RE.test(String(e.label || ''))) && Math.hypot(e.x - g.x - 0.5, e.y - g.y - 0.5) <= r);
  }
  function report() {
    apply();
    const gates = hasMaps() ? gatesOf(G.maps) : [], pairs = pairsOf(gates), out = { pairs, disagree: pairs.filter((p) => !p.agrees).map((p) => p.a + '>' + p.b), overlaps: [], direction: [], noPost: [], regions: {} };
    for (const rid in L.lay) {
      const lay = L.lay[rid], ids = Object.keys(lay.places);
      out.regions[rid] = { places: ids.slice().sort(), W: lay.W, H: lay.H, Wc: lay.Wc, Hc: lay.Hc };
      for (let i = 0; i < ids.length; i++) for (let j = i + 1; j < ids.length; j++) if (overlaps(lay.places[ids[i]], lay.places[ids[j]])) out.overlaps.push(ids[i] + '/' + ids[j]);
      for (const g of lay.gates) {
        const A = lay.places[g.from], B = lay.places[g.to];
        const ok = g.side === 'E' ? B.x >= A.x + A.w : g.side === 'W' ? B.x + B.w <= A.x : g.side === 'S' ? B.y >= A.y + A.h : B.y + B.h <= A.y;
        if (!ok) out.direction.push(g.from + ' ' + g.side + ' > ' + g.to);
      }
    }
    for (const g of wayOuts()) if (!postsNear(g, 5).length && !AWAITING.some((a) => a.map === g.from && a.to === g.to)) out.noPost.push(g.from + '>' + g.to);
    return out;
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () {
        const maps = _b.apply(this, arguments);
        try { placePosts(maps); } catch (e) { warnOnce('posts', e); }
        L.key = null; L.lay = {}; L.chart = {};
        return maps;
      };
    }
    if (typeof travelImg === 'function') {
      const _i = travelImg;
      travelImg = function (src) {
        const rid = regionOfImg(src);
        // (repaints only when a place has been found since; otherwise what is filed under the name is returned as before,
        // which while js/synod15.js is drawing is its washed copy)
        // (the found places are read again when the travel map opens, not on every frame it draws)
        if (rid && hasMaps() && (!L.chart[rid] || L.chart[rid].lay !== L.lay[rid])) { try { chartImage(rid); } catch (e) { warnOnce('chart', e); } }
        return _i.apply(this, arguments);
      };
    }
    // these are global function declarations: replacing them by assignment is what every later phase does
    if (typeof travelDestinations === 'function') { const _d = travelDestinations; travelDestinations = function () { try { apply(); } catch (e) { warnOnce('dest', e); } return _d.apply(this, arguments); }; }
    if (typeof travelMinutes === 'function') { const _m = travelMinutes; travelMinutes = function () { try { apply(); } catch (e) { warnOnce('mins', e); } return _m.apply(this, arguments); }; }
    if (typeof travelPlace === 'function') { const _p = travelPlace; travelPlace = function () { try { apply(); } catch (e) { warnOnce('place', e); } return _p.apply(this, arguments); }; }
    if (typeof travelHere === 'function') {
      const _h = travelHere;
      travelHere = function (rid) {
        try { apply(); } catch (e) { warnOnce('here', e); }
        const r = _h.apply(this, arguments);
        if (r) return r;
        // anywhere the chart has drawn, even off the travel list: the Downs, Wethercombe, the Low Rings, the Bell Yard
        try { if (typeof G !== 'undefined' && G.mapId && typeof Engine !== 'undefined') return placeOnChart(rid, G.mapId, Engine.cam.x, Engine.cam.y); } catch (e) { warnOnce('here2', e); }
        return null;
      };
    }
    if (typeof travelRender === 'function') {
      const _r = travelRender;
      travelRender = function () {
        try { apply(); if (typeof TRAVEL !== 'undefined' && TRAVEL.view !== 'continent') chartImage(TRAVEL.region); } catch (e) { warnOnce('render', e); }
        const r = _r.apply(this, arguments);
        try {
          const p = typeof document !== 'undefined' && document.getElementById('modal-panel'), lay = L.lay[TRAVEL.region];
          if (p) p.classList.toggle('p82b-wide', TRAVEL.view !== 'continent' && !!lay && lay.W / lay.H > 2.2);
        } catch (e) { warnOnce('wide', e); }
        return r;
      };
    }
    if (typeof travelClose === 'function') { const _c = travelClose; travelClose = function () { try { const p = document.getElementById('modal-panel'); if (p) p.classList.remove('p82b-wide'); } catch (e) { /* closed */ } return _c.apply(this, arguments); }; }
    if (typeof document !== 'undefined' && !document.getElementById('p82b-style')) {
      const st = document.createElement('style'); st.id = 'p82b-style';
      st.textContent = '.panel.travel.p82b-wide .tv-body{flex-direction:column;align-items:stretch}'
        + '.panel.travel.p82b-wide #tvmap{max-width:80cqw;max-height:40cqh;width:100%;height:auto}'
        + '.panel.travel.p82b-wide .tv-side{width:100%}'
        + '.panel.travel.p82b-wide .tv-list{flex-direction:row;flex-wrap:wrap;max-height:16cqh}';
      (document.head || document.documentElement).appendChild(st);
    }
  }
  wire();

  return { TEXTS, CHART_NAMES, POSTS, allPosts, targets, AWAITING, RECORDED, REGIONS, POST_RE, sideOf, edgeOf, gatesOf, pairsOf, layoutRegion, apply, placeOnChart, paintChart, chartImage, chartName, foundSet, placePosts, postSpot, postsNear, wayOuts, report, L };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = BEARINGS82B;
if (typeof window !== 'undefined') window.BEARINGS82B = BEARINGS82B;
