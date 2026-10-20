// ============================================================
//  ceilings — painted Cloister vaults, tavern beams and cave rock.
//
//  PROCEDURAL STAND-INS: three 64x64 ceiling tiles painted from seeded noise
//  at load time, to be replaced by hand-made art later. The engine already
//  supports per-cell ceiling textures (map.ceilTextures + map.ceilCells); this
//  module only fills them in, leaving every map's cells, entities, ceilZ and
//  floor alone. GFX.ceilings switches it off (map.ceilCells = null gives back
//  each map's original single ceiling texture).
//
//  Texture memory: 3 tiles x 64x64x4 B = 49,152 B (counted by DECALS.budgetBytes()).
// ============================================================
'use strict';

if (GFX.ceilings === undefined) GFX.ceilings = true;
if (!GFX.FX.includes('ceilings')) GFX.FX.push('ceilings');

const CEILINGS = (() => {
  const T = 64;
  const textures = ['c_beams', 'c_vault', 'c_rock'];
  let generated = 0;

  const clamp8 = (v) => v < 0 ? 0 : v > 255 ? 255 : v | 0;
  const px = (r, g, b) => ((255 << 24) | (clamp8(b) << 16) | (clamp8(g) << 8) | clamp8(r)) >>> 0;
  function hash(ix, iy, seed) {
    let h = Math.imul(ix | 0, 374761393) ^ Math.imul(iy | 0, 668265263) ^ Math.imul(seed | 0, 2147483647);
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  // value noise that wraps every `per` lattice cells, so a tile joins its neighbours
  function tnoise(x, y, per, seed) {
    const x0 = Math.floor(x), y0 = Math.floor(y), fx = x - x0, fy = y - y0;
    const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
    const m = (v) => ((v % per) + per) % per;
    const a = hash(m(x0), m(y0), seed), b = hash(m(x0 + 1), m(y0), seed), c = hash(m(x0), m(y0 + 1), seed), d = hash(m(x0 + 1), m(y0 + 1), seed);
    return (a + (b - a) * sx) + ((c + (d - c) * sx) - (a + (b - a) * sx)) * sy;
  }
  // fractal noise across the whole 64px tile at `f` lattice cells, wrapping
  const tfbm = (x, y, f, seed) => tnoise(x / T * f, y / T * f, f, seed) * 0.55 + tnoise(x / T * f * 2, y / T * f * 2, f * 2, seed + 7) * 0.3 + tnoise(x / T * f * 4, y / T * f * 4, f * 4, seed + 13) * 0.15;
  function register(name, data) { Engine.addTexture(name, data); generated += data.length * 4; return data; }

  // ---- c_beams: dark timber beam over smoke-stained plaster ------------------
  function paintBeams() {
    const d = new Uint32Array(T * T), B0 = 21, B1 = 42;   // the beam runs along x through rows 21-42
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      if (y >= B0 && y <= B1) {
        const grain = tnoise(x / T * 4, y * 0.9, 4, 21) * 0.5 + tnoise(x / T * 16, y * 0.35, 16, 22) * 0.5;   // long fibres along the beam
        let k = 0.6 + grain * 0.7;
        const e = Math.min(y - B0, B1 - y);
        if (e < 2) k *= 0.62;               // shadowed edge
        else if (y - B0 < 5) k *= 1.12;      // light catching the underside near the top
        if (tnoise(x / T * 3, y / 6, 3, 25) > 0.84 && e > 3) k *= 0.5;   // a knot
        d[y * T + x] = px(78 * k, 50 * k, 28 * k);
      } else {
        const dist = Math.min(Math.abs(y - B0), Math.abs(y - B1)), halo = Math.max(0, 1 - dist / 12);   // soot gathers beside the beam
        const stain = tfbm(x, y, 5, 31), fleck = hash(x, y, 33);
        let k = 0.95 - halo * 0.38 - stain * 0.28;
        if (fleck > 0.95) k -= 0.1;
        d[y * T + x] = px(174 * k, 156 * k, 118 * k);
      }
    }
    return d;
  }

  // ---- c_vault: ribbed cross-vault with a faded lilac and gold fresco --------
  function paintVault() {
    const d = new Uint32Array(T * T), C = (T - 1) / 2;
    const stars = [[32, 12], [32, 52], [12, 32], [52, 32]];   // one gold star in each painted panel
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const dx = x - C, dy = y - C, ax = Math.abs(dx), ay = Math.abs(dy), r = Math.hypot(dx, dy);
      const ribD = Math.abs(ax - ay) / 1.414, border = Math.min(x, y, T - 1 - x, T - 1 - y);
      const nearRib = Math.min(ribD, border * 1.2);
      let rgb;
      if (r < 5.5) {   // gilded boss at the crossing
        const ring = r > 3.6 && r < 4.6;
        rgb = ring ? [120, 92, 40] : [214, 176, 84 + (r < 2 ? 40 : 0)];
      } else if (nearRib < 2.3) {   // stone rib, shadowed on its lower side
        const k = 0.82 + tfbm(x, y, 8, 41) * 0.3 - (dy > 0 || dx > 0 ? 0.08 : 0);
        rgb = [152 * k, 144 * k, 146 * k];
      } else {
        // painted panel: lilac, darker where the vault curves down into the ribs
        const curve = Math.min(1, nearRib / 14), fade = tfbm(x, y, 6, 43);
        let k = 0.62 + curve * 0.3 + (fade - 0.5) * 0.3;
        rgb = [150 * k, 118 * k, 168 * k];
        // gold: a small eight-point star in each panel plus scattered leaf-dots
        for (const [sx, sy] of stars) {
          const ux = Math.abs(x - sx), uy = Math.abs(y - sy);
          if ((Math.min(ux, uy) < 1.1 && Math.max(ux, uy) < 5) || (Math.abs(ux - uy) < 1.1 && ux < 3.6)) rgb = [208 * (0.7 + fade * 0.4), 172 * (0.7 + fade * 0.4), 84];
        }
        if (hash(x >> 2, y >> 2, 47) > 0.93 && ((x & 3) === 1) && ((y & 3) === 1)) rgb = [196, 160, 80];
        // flaked paint: the plaster shows through where the fresco has faded
        const flake = tfbm(x, y, 9, 49);
        if (flake > 0.7) { const f = (flake - 0.7) * 3.2; rgb = [rgb[0] + (190 - rgb[0]) * f, rgb[1] + (178 - rgb[1]) * f, rgb[2] + (160 - rgb[2]) * f]; }
      }
      d[y * T + x] = px(rgb[0], rgb[1], rgb[2]);
    }
    return d;
  }

  // ---- c_rock: rough cave rock with dark crevices and pale mineral flecks -----
  function paintRock() {
    const d = new Uint32Array(T * T);
    for (let y = 0; y < T; y++) for (let x = 0; x < T; x++) {
      const n = tfbm(x, y, 6, 61), ridge = Math.abs(tnoise(x / T * 8, y / T * 8, 8, 63) - 0.5) * 2;   // 0 on a crease
      let k = 0.5 + n * 0.8;
      if (ridge < 0.12) k *= 0.45 + ridge * 3;              // crevices
      k *= 0.88 + hash(x, y, 65) * 0.2;                      // grit
      let r = 96 * k, g = 88 * k, b = 80 * k;
      if (hash(x, y, 67) > 0.985) { r += 70; g += 66; b += 58; }   // mineral fleck
      d[y * T + x] = px(r, g, b);
    }
    return d;
  }

  // ---- assignment ------------------------------------------------------------
  const VAULT_MAPS = { cloister: 1, chapel: 1 };          // painted vaults
  const ROCK_MAPS = { quarry: 1, underhedge: 1, rootvault: 1, catacombs: 1 };
  // Which painted ceiling a map should get, or null to keep the original.
  function pick(m) {
    if (!m || !m.ceil) return null;
    if (VAULT_MAPS[m.id]) return 'c_vault';
    if (ROCK_MAPS[m.id] || m.rooms) return 'c_rock';   // m.rooms: a generated dungeon
    if (m.ceil === 't_wood') return 'c_beams';          // timber interiors: the tavern, houses, mill, malting, belfry
    return null;
  }
  // Another module may already own a map's per-cell ceilings: leave those alone.
  function assign(m) {
    if (!m || m._ceilAssigned) return;
    m._ceilAssigned = true;
    const name = pick(m);
    if (!name || m.ceilCells) return;
    m.ceilTextures = [m.ceil, name];
    m._ceilCellsAll = new Uint8Array(m.w * m.h).fill(1);
  }
  function sync(m) {
    if (!m) return;
    assign(m);
    if (m._ceilCellsAll) m.ceilCells = (typeof GFX !== 'undefined' && GFX.ceilings) ? m._ceilCellsAll : null;
  }
  function syncAll() { if (typeof G !== 'undefined' && G.maps) for (const id in G.maps) sync(G.maps[id]); }
  const budgetBytes = () => generated;

  register('c_beams', paintBeams());
  register('c_vault', paintVault());
  register('c_rock', paintRock());

  return { textures, pick, assign, sync, syncAll, budgetBytes };
})();

// Wrap the world build last, so it sees every finished map; loadMap re-syncs
// the current map in case it was rebuilt outside buildAllMaps.
(function () {
  const _build = buildAllMaps;
  buildAllMaps = function () { const maps = _build(); for (const id in maps) CEILINGS.sync(maps[id]); return maps; };
  const _loadMap = loadMap;
  loadMap = function (id, pos) { if (G.maps && G.maps[id]) CEILINGS.sync(G.maps[id]); return _loadMap(id, pos); };
  GFX.onChange(() => CEILINGS.syncAll());
  CEILINGS.syncAll();
})();
