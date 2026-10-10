// ============================================================
//  MAPS — Oakhaven, its interiors, the clearing, the Quarry, the Root-vault
// ============================================================
'use strict';

function mulberry32(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }

const WALL = (tex) => ({ tex });
const DOOR = (opts) => Object.assign({ tex: 't_door', door: true }, opts || {});

class GameMap {
  constructor(id, name, w, h, opts) {
    this.id = id; this.name = name; this.w = w; this.h = h;
    this.cells = new Array(w * h).fill(null);
    this.doors = {};
    this.floor = opts.floor || 't_flag'; this.ceil = opts.ceil || null; this.outdoor = !!opts.outdoor;
    this.fogDist = opts.fogDist || 12; this.fogColor = opts.fogColor || [0, 0, 0];
    this.floorTextures = opts.floorTextures || null; this.floorCells = opts.floorTextures ? new Uint8Array(w * h) : null;
    this.entities = []; this.spawn = opts.spawn || { x: 2.5, y: 2.5, dir: 0 };
    this.siphoned = !!opts.siphoned; this.danger = opts.danger || 0; this.music = opts.music || 'town';
    this.visited = new Uint8Array(w * h);
    this.triggers = [];
  }
  set(x, y, c) { if (x >= 0 && y >= 0 && x < this.w && y < this.h) { this.cells[y * this.w + x] = c; if (c && c.door) this.doors[y * this.w + x] = { open: 0, target: 0 }; } }
  get(x, y) { return (x < 0 || y < 0 || x >= this.w || y >= this.h) ? WALL('t_stone') : this.cells[y * this.w + x]; }
  setFloor(x, y, idx) { if (this.floorCells && x >= 0 && y >= 0 && x < this.w && y < this.h) this.floorCells[y * this.w + x] = idx; }
  rect(x0, y0, x1, y1, tex) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, WALL(tex)); }
  clear(x0, y0, x1, y1) { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) this.set(x, y, null); }
  border(tex) { for (let x = 0; x < this.w; x++) { this.set(x, 0, WALL(tex)); this.set(x, this.h - 1, WALL(tex)); } for (let y = 0; y < this.h; y++) { this.set(0, y, WALL(tex)); this.set(this.w - 1, y, WALL(tex)); } }
  isSolidCell(x, y) { const c = this.get(x, y); if (!c) return false; if (c.door) { const d = this.doors[y * this.w + x]; return !(d && d.open > 0.7); } return true; }
  add(e) { this.entities.push(e); return e; }
  deco(sprite, x, y, opts) { return this.add(Object.assign({ kind: 'deco', sprite, x, y, solid: true, radius: 0.35 }, opts || {})); }
  npc(id, x, y, opts) { return this.add(Object.assign({ kind: 'npc', id, x, y, sprite: NPCS[id].sprite, scale: NPCS[id].scale || 1, solid: true, radius: 0.35 }, opts || {})); }
  item(item, x, y) { return this.add({ kind: 'item', item, x, y, sprite: ITEMS[item].sprite, scale: 0.35, yOff: 0.0, solid: false }); }
  enemy(type, x, y, opts) { return this.add(Object.assign({ kind: 'enemy', type, x, y }, opts || {})); }
  trigger(x, y, r, id, opts) { this.triggers.push(Object.assign({ x, y, r, id, done: false }, opts || {})); }
}

// -------------------------------------------------------------------------
//  OAKHAVEN
// -------------------------------------------------------------------------
function buildOakhaven(greening) {
  const W = 46, H = 46;
  const m = new GameMap('oakhaven', greening ? 'Oakhaven — the Greening' : 'Oakhaven', W, H, {
    outdoor: true, floor: 't_grass', floorTextures: ['t_grass', 't_cobble'], fogDist: greening ? 14 : 22, fogColor: greening ? [40, 70, 30] : [70, 72, 80], music: 'town', danger: greening ? 2 : 0,
    spawn: { x: 23.5, y: 3.5, dir: Math.PI / 2 },
  });
  // Hedge — thick
  for (let i = 0; i < 2; i++) { m.rect(i, i, W - 1 - i, i, 't_hedge'); m.rect(i, H - 1 - i, W - 1 - i, H - 1 - i, 't_hedge'); m.rect(i, i, i, H - 1 - i, 't_hedge'); m.rect(W - 1 - i, i, W - 1 - i, H - 1 - i, 't_hedge'); }
  // Roads (cobbles): main N-S road, E-W road, square
  const road = (x0, y0, x1, y1) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) m.setFloor(x, y, 1); };
  road(22, 2, 24, 43); road(3, 22, 42, 24); road(17, 17, 29, 29); road(8, 10, 10, 36); road(36, 8, 38, 36); road(10, 10, 36, 11); road(10, 35, 36, 36);
  // North gate
  m.set(23, 0, DOOR({ portal: { map: 'clearing', x: 20.5, y: 32.5, dir: -Math.PI / 2 }, label: 'The North Gate', locked: 'gate_open', lockMsg: 'The gate is barred. Old Harrow keeps the key, and he keeps it on the Cantor\'s word.' }));
  m.set(23, 1, null); m.set(22, 1, WALL('t_hedge')); m.set(24, 1, WALL('t_hedge'));

  // Buildings: [x,y,w,h, tex, doorX, doorY, portal spec]
  const buildings = [
    { x: 26, y: 12, w: 8, h: 5, tex: 't_house', door: [29, 16], portal: { map: 'tavern', x: 8.5, y: 10.5, dir: -Math.PI / 2 }, label: 'The Boar & Dulcimer' },
    { x: 19, y: 30, w: 6, h: 4, tex: 't_house', door: [21, 30], portal: { map: 'lyra_house', x: 6.5, y: 7.5, dir: -Math.PI / 2 }, label: 'Lyra Ashgrove\'s house' },
    { x: 18, y: 5, w: 10, h: 5, tex: 't_marble', door: [23, 9], portal: { map: 'greenhall', x: 8.5, y: 10.5, dir: -Math.PI / 2 }, label: 'The Greenhall' },
    { x: 12, y: 13, w: 5, h: 4, tex: 't_wood', door: [16, 15], portal: { map: 'surgery', x: 1.5, y: 5.5, dir: 0 }, label: 'Rooke\'s surgery' },
    { x: 30, y: 38, w: 5, h: 4, tex: 't_wood', door: [30, 40], portal: { map: 'orla_house', x: 8.5, y: 5.5, dir: Math.PI }, label: 'Orla Hale\'s house' },
    // non-enterable houses
    { x: 4, y: 4, w: 5, h: 4, tex: 't_house', door: [6, 7], barred: true, label: 'A shuttered house' },
    { x: 12, y: 4, w: 5, h: 4, tex: 't_house', door: [14, 7], barred: true, label: 'The baker\'s' },
    { x: 31, y: 4, w: 4, h: 4, tex: 't_house', door: [32, 7], barred: true, label: 'The Carders\' house' },
    { x: 40, y: 4, w: 4, h: 5, tex: 't_wood', door: [40, 6], barred: true, label: 'A granary' },
    { x: 4, y: 14, w: 3, h: 6, tex: 't_wood', door: [6, 16], barred: true, label: 'A cooper\'s shed' },
    { x: 4, y: 27, w: 3, h: 6, tex: 't_house', door: [6, 29], barred: true, label: 'The Madders\' house' },
    { x: 12, y: 27, w: 4, h: 6, tex: 't_house', door: [15, 29], barred: true, label: 'Cooper\'s Row' },
    { x: 12, y: 38, w: 8, h: 4, tex: 't_wood', door: [16, 38], barred: true, label: 'The tannery' },
    { x: 26, y: 30, w: 6, h: 4, tex: 't_house', door: [28, 30], barred: true, label: 'Bettany\'s' },
    { x: 40, y: 14, w: 3, h: 6, tex: 't_house', door: [40, 16], barred: true, label: 'A shuttered house' },
    { x: 40, y: 27, w: 3, h: 6, tex: 't_wood', door: [40, 29], barred: true, label: 'The chandler\'s' },
    { x: 4, y: 38, w: 5, h: 4, tex: 't_house', door: [8, 40], barred: true, label: 'Hob Wendle\'s' },
    { x: 38, y: 38, w: 5, h: 4, tex: 't_house', door: [38, 40], barred: true, label: 'A shuttered house' },
  ];
  for (const b of buildings) {
    m.rect(b.x, b.y, b.x + b.w - 1, b.y + b.h - 1, b.tex);
    const d = DOOR({ portal: b.portal, label: b.label });
    if (b.barred) { d.locked = '__never'; d.lockMsg = `${b.label}. The door is barred from within, and somebody inside is humming.`; }
    m.set(b.door[0], b.door[1], d);
    // cobble apron in front of each door
    for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) m.setFloor(b.door[0] + dx, b.door[1] + dy, 1);
  }
  // Mooring mast (east): a wooden pylon with crates
  m.rect(36, 19, 37, 20, 't_wood');
  m.deco('crates', 35.5, 21.5); m.deco('sign', 38.5, 21.5, { radius: 0.2 });
  m.trigger(36.5, 22.5, 2.2, 'mast');
  // Tannery culvert at the SE hedge — the Wearer's spot
  m.deco('grate', 23.5, 43.4, { radius: 0.3, scale: 0.8 });
  m.trigger(23.5, 41.5, 2.5, 'hedge_voice');
  // Oaks
  const rnd = mulberry32(7);
  const oakSpots = [[14.5, 20.5], [31.5, 20.5], [9.5, 8.5], [36.5, 30.5], [14.5, 25.5], [31.5, 26.5], [19.5, 42.5], [6.5, 11.5], [38.5, 11.5], [27.5, 42.5], [6.5, 24.5], [40.5, 24.5], [29.5, 37.5], [16.5, 32.5]];
  for (const [x, y] of oakSpots) m.deco('oak', x, y, { scale: 1.6 + rnd() * 0.5, radius: 0.45, yOff: -0.02 });
  if (greening) {
    const extra = [[23.5, 14.5], [20.5, 22.5], [26.5, 22.5], [23.5, 33.5], [10.5, 22.5], [34.5, 23.5], [23.5, 6.5], [15.5, 11.5]];
    for (const [x, y] of extra) m.deco('oak', x, y, { scale: 2.4 + rnd() * 0.8, radius: 0.5 });
    for (let i = 0; i < 8; i++) m.enemy('hound', 6 + rnd() * 34, 6 + rnd() * 34);
    m.enemy('hound', 23.5, 12.5); m.enemy('hound', 30.5, 23.5); m.enemy('hound', 23.5, 27.5);
    for (let i = 0; i < 6; i++) m.add({ kind: 'deco', sprite: 'burlsick', x: 8 + rnd() * 30, y: 8 + rnd() * 30, solid: true, radius: 0.3, wander: true, scale: 1 });
  } else {
    // Hush-lamps along the main road and square
    for (const [x, y] of [[21.5, 12.5], [25.5, 12.5], [21.5, 19.5], [25.5, 27.5], [21.5, 35.5], [25.5, 35.5], [16.5, 23.5], [30.5, 23.5], [9.5, 23.5], [37.5, 23.5], [23.5, 40.5]]) m.deco('lamp', x, y, { radius: 0.15, scale: 0.9, glow: 0.55 });
    // NPCs
    m.npc('harrow', 23.5, 4.5, { facing: Math.PI / 2 });
    m.npc('pim', 27.5, 36.5, { wander: true });
    m.npc('townsman', 19.5, 23.5, { wander: true }); m.npc('townsman', 36.5, 25.5, { wander: true }); m.npc('townsman', 10.5, 30.5, { wander: true });
    m.npc('townswoman', 27.5, 19.5, { wander: true }); m.npc('townswoman', 9.5, 14.5, { wander: true }); m.npc('townswoman', 34.5, 34.5, { wander: true });
    m.item('tonic', 7.5, 36.5); m.item('pellets', 42.5, 12.5); m.item('sovereigns', 42.5, 35.5);
  }
  return m;
}

// -------------------------------------------------------------------------
//  INTERIORS
// -------------------------------------------------------------------------
function interior(id, name, w, h, wallTex, exit, fill) {
  const m = new GameMap(id, name, w, h, { floor: 't_wood', ceil: 't_wood', fogDist: 11, fogColor: [0, 0, 0], music: 'inside', spawn: { x: exit.sx, y: exit.sy, dir: exit.sdir } });
  m.border(wallTex);
  m.set(exit.x, exit.y, DOOR({ portal: { map: 'oakhaven', x: exit.ox, y: exit.oy, dir: exit.odir }, label: 'Out to the street' }));
  fill(m);
  return m;
}

function buildInteriors() {
  const maps = {};
  maps.tavern = interior('tavern', 'The Boar & Dulcimer', 17, 12, 't_wood', { x: 8, y: 11, sx: 8.5, sy: 9.5, sdir: -Math.PI / 2, ox: 29.5, oy: 17.5, odir: Math.PI / 2 }, (m) => {
    m.rect(2, 2, 6, 2, 't_wood'); // bar counter
    m.deco('table', 11.5, 4.5, { radius: 0.5, scale: 0.7 }); m.deco('table', 11.5, 8.5, { radius: 0.5, scale: 0.7 }); m.deco('table', 4.5, 7.5, { radius: 0.5, scale: 0.7 });
    m.deco('hearth', 14.9, 6.5, { radius: 0.3, scale: 0.9, glow: 0.7 }); m.deco('shelf', 1.4, 5.5, { radius: 0.2, scale: 0.9 });
    m.deco('lamp', 8.5, 6.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
    m.npc('hetty', 4.5, 3.6, { facing: Math.PI / 2 }); m.npc('vane', 13.5, 9.5, { facing: Math.PI });
    m.npc('townsman', 10.5, 3.5, { facing: 0 });
    // cellar
    m.rect(1, 9, 5, 9, 't_wood'); m.set(6, 10, WALL('t_wood')); m.set(3, 9, DOOR({ label: 'Cellar door' }));
    m.add({ kind: 'deco', sprite: 'cores', x: 2.0, y: 10.4, solid: true, radius: 0.3, scale: 0.6, use: 'crates', label: 'Twelve crates for the quarry garrison' });
    m.add({ kind: 'deco', sprite: 'crates', x: 4.4, y: 10.5, solid: true, radius: 0.3, scale: 0.7 });
  });
  maps.lyra_house = interior('lyra_house', 'Lyra Ashgrove\'s house', 12, 9, 't_house', { x: 6, y: 8, sx: 6.5, sy: 6.5, sdir: -Math.PI / 2, ox: 21.5, oy: 29.5, odir: -Math.PI / 2 }, (m) => {
    m.deco('hearth', 1.2, 4.5, { radius: 0.3, scale: 0.9, glow: 0.7 }); m.deco('bed', 9.5, 2.0, { radius: 0.5, scale: 0.6 }); m.deco('shelf', 4.5, 1.3, { radius: 0.2, scale: 0.9 });
    m.deco('table', 6.5, 4.0, { radius: 0.5, scale: 0.7 }); m.deco('lamp', 3.5, 6.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
    m.npc('lyra', 8.5, 5.5, { facing: Math.PI });
  });
  maps.greenhall = interior('greenhall', 'The Greenhall', 17, 12, 't_marble', { x: 8, y: 11, sx: 8.5, sy: 9.5, sdir: -Math.PI / 2, ox: 23.5, oy: 10.5, odir: Math.PI / 2 }, (m) => {
    m.rect(6, 2, 10, 2, 't_wood');
    m.deco('shelf', 1.4, 3.5, { radius: 0.2, scale: 0.9 }); m.deco('shelf', 1.4, 6.5, { radius: 0.2, scale: 0.9 }); m.deco('shelf', 15.6, 3.5, { radius: 0.2, scale: 0.9 });
    m.deco('table', 8.5, 6.0, { radius: 0.5, scale: 0.7 }); m.deco('lamp', 4.5, 8.5, { radius: 0.12, scale: 0.7, glow: 0.6 }); m.deco('lamp', 12.5, 8.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
    m.npc('aldric', 8.5, 3.6, { facing: Math.PI / 2 }); m.npc('vosk', 12.5, 5.5, { facing: Math.PI });
    m.enemy('legionnaire', 3.5, 9.5, { passive: true, facing: 0 });
  });
  maps.surgery = interior('surgery', 'Rooke\'s surgery', 11, 9, 't_wood', { x: 0, y: 5, sx: 2.0, sy: 5.5, sdir: 0, ox: 17.5, oy: 15.5, odir: 0 }, (m) => {
    m.deco('chair', 5.5, 2.0, { radius: 0.3, scale: 0.6 }); m.deco('bed', 8.5, 2.0, { radius: 0.5, scale: 0.6 }); m.deco('shelf', 9.6, 6.5, { radius: 0.2, scale: 0.9 });
    m.deco('table', 5.5, 6.5, { radius: 0.5, scale: 0.7 }); m.deco('lamp', 3.5, 3.0, { radius: 0.12, scale: 0.7, glow: 0.6 });
    m.npc('rooke', 7.5, 4.5, { facing: Math.PI });
  });
  maps.orla_house = interior('orla_house', 'Orla Hale\'s house', 10, 8, 't_wood', { x: 9, y: 5, sx: 7.5, sy: 5.5, sdir: Math.PI, ox: 29.5, oy: 40.5, odir: Math.PI }, (m) => {
    m.deco('hearth', 1.2, 2.5, { radius: 0.3, scale: 0.9, glow: 0.6 }); m.deco('bed', 7.5, 1.8, { radius: 0.5, scale: 0.6 }); m.deco('lamp', 5.5, 6.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
    m.npc('orla', 4.5, 3.0, { facing: Math.PI / 2 });
  });
  return maps;
}

// -------------------------------------------------------------------------
//  THE CLEARING (outside the Hedge)
// -------------------------------------------------------------------------
function buildClearing() {
  const W = 40, H = 36;
  const m = new GameMap('clearing', 'Outside the Hedge', W, H, { outdoor: true, floor: 't_grass', fogDist: 16, fogColor: [50, 55, 50], music: 'wild', danger: 1, spawn: { x: 20.5, y: 32.5, dir: -Math.PI / 2 } });
  m.border('t_hedge');
  m.set(20, H - 1, DOOR({ portal: { map: 'oakhaven', x: 23.5, y: 2.5, dir: Math.PI / 2 }, label: 'The North Gate of Oakhaven' }));
  // Kaelen's hut
  m.rect(8, 14, 11, 17, 't_wood'); m.set(11, 16, DOOR({ locked: '__never', lockMsg: 'A charcoal-burner\'s hut. Inside, somebody is humming one low note, over and over, like a man in pain.' , label: 'Kaelen\'s hut'}));
  m.npc('kaelen', 13.5, 16.5, { facing: 0 });
  m.deco('hearth', 13.5, 19.0, { radius: 0.3, scale: 0.8, glow: 0.8 });
  // hound-bed
  m.deco('bones', 17.5, 24.5, { radius: 0.3, scale: 0.5, solid: false }); m.trigger(17.5, 24.5, 1.8, 'hound_bed');
  // quarry headframe (north)
  m.rect(16, 1, 24, 4, 't_stone'); m.set(20, 4, DOOR({ portal: { map: 'quarry', x: 0, y: 0, dir: 0, useSpawn: true }, label: 'The quarry headframe' }));
  m.deco('pump', 15.0, 5.5, { radius: 0.4, scale: 1.0 }); m.deco('crates', 25.0, 5.5, { radius: 0.4 }); m.deco('sign', 22.5, 7.5, { radius: 0.2 });
  // forest
  const rnd = mulberry32(99);
  for (let i = 0; i < 46; i++) {
    const x = 2 + rnd() * (W - 4), y = 2 + rnd() * (H - 4);
    if (Math.abs(x - 20) < 2.5 && y > 4) continue;           // keep the path clear
    if (x > 7 && x < 15 && y > 13 && y < 21) continue;       // hut
    if (y < 8 && x > 13 && x < 27) continue;
    m.deco('oak', x, y, { scale: 1.5 + rnd() * 0.9, radius: 0.45 });
  }
  m.enemy('hound', 30.5, 12.5); m.enemy('hound', 6.5, 28.5); m.enemy('hound', 33.5, 28.5);
  m.enemy('mites', 28.5, 20.5);
  m.item('pellets', 4.5, 4.5); m.item('whistle', 34.5, 4.5); m.item('tonic', 30.5, 31.5);
  m.deco('lamp', 20.5, 30.5, { radius: 0.15, scale: 0.9, glow: 0.5 });
  return m;
}

// -------------------------------------------------------------------------
//  DUNGEON GENERATOR (rooms + corridors)
// -------------------------------------------------------------------------
function genDungeon(id, name, seed, opts) {
  const W = opts.w || 44, H = opts.h || 44;
  const rnd = mulberry32(seed);
  const m = new GameMap(id, name, W, H, { floor: opts.floor, ceil: opts.ceil, fogDist: opts.fogDist || 9, fogColor: opts.fogColor || [0, 0, 0], music: opts.music || 'dungeon', siphoned: true, danger: opts.danger || 1 });
  // fill solid
  for (let i = 0; i < W * H; i++) m.cells[i] = WALL(rnd() < (opts.altChance || 0.2) ? opts.altWall : opts.wall);
  const rooms = [];
  const tryRoom = (rw, rh, forceX, forceY) => {
    for (let attempt = 0; attempt < 200; attempt++) {
      const x = forceX != null ? forceX : 2 + ((rnd() * (W - rw - 4)) | 0), y = forceY != null ? forceY : 2 + ((rnd() * (H - rh - 4)) | 0);
      let ok = true;
      for (const r of rooms) if (x < r.x + r.w + 2 && x + rw + 2 > r.x && y < r.y + r.h + 2 && y + rh + 2 > r.y) { ok = false; break; }
      if (!ok) continue;
      const r = { x, y, w: rw, h: rh, cx: x + (rw >> 1), cy: y + (rh >> 1) };
      rooms.push(r); m.clear(x, y, x + rw - 1, y + rh - 1);
      return r;
    }
    return null;
  };
  const carveCorridor = (ax, ay, bx, by) => {
    let x = ax, y = ay;
    const horizFirst = rnd() < 0.5;
    const cells = [];
    const stepX = () => { while (x !== bx) { x += Math.sign(bx - x); cells.push([x, y]); } };
    const stepY = () => { while (y !== by) { y += Math.sign(by - y); cells.push([x, y]); } };
    if (horizFirst) { stepX(); stepY(); } else { stepY(); stepX(); }
    for (const [cx, cy] of cells) if (cx > 0 && cy > 0 && cx < W - 1 && cy < H - 1) m.set(cx, cy, null);
    return cells;
  };
  // rooms
  const entrance = tryRoom(5, 5, opts.entranceX, opts.entranceY);
  const specs = opts.rooms;
  const named = {};
  for (const s of specs) { const r = tryRoom(s.w, s.h); if (r) { r.name = s.name; named[s.name] = r; } }
  for (let i = 0; i < (opts.fillerRooms || 6); i++) tryRoom(3 + ((rnd() * 4) | 0), 3 + ((rnd() * 4) | 0));
  // connect sequentially (nearest-unconnected) + a couple of loops
  const connected = [entrance]; const remaining = rooms.filter(r => r !== entrance);
  const corridorCells = [];
  while (remaining.length) {
    let best = null, bi = -1, bd = 1e9, from = null;
    for (const c of connected) for (let i = 0; i < remaining.length; i++) { const r = remaining[i]; const d = Math.abs(r.cx - c.cx) + Math.abs(r.cy - c.cy); if (d < bd) { bd = d; best = r; bi = i; from = c; } }
    corridorCells.push(...carveCorridor(from.cx, from.cy, best.cx, best.cy));
    connected.push(best); remaining.splice(bi, 1);
  }
  for (let i = 0; i < 2; i++) { const a = rooms[(rnd() * rooms.length) | 0], b = rooms[(rnd() * rooms.length) | 0]; if (a !== b) corridorCells.push(...carveCorridor(a.cx, a.cy, b.cx, b.cy)); }
  // doors: corridor cells that have walls on exactly two opposite sides and open on the other two
  let doorsPlaced = 0;
  for (const [x, y] of corridorCells) {
    if (doorsPlaced > 14 || rnd() > 0.18) continue;
    if (m.get(x, y)) continue;
    const n = !!m.get(x, y - 1), s = !!m.get(x, y + 1), e = !!m.get(x + 1, y), w = !!m.get(x - 1, y);
    if ((n && s && !e && !w) || (e && w && !n && !s)) {
      // avoid adjacent doors
      let near = false; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const c = m.get(x + dx, y + dy); if (c && c.door) near = true; }
      if (near) continue;
      m.set(x, y, DOOR({})); doorsPlaced++;
    }
  }
  m.spawn = { x: entrance.cx + 0.5, y: entrance.cy + 0.5, dir: 0 };
  m.rooms = rooms; m.named = named; m.entrance = entrance; m.rnd = rnd;
  return m;
}

function buildQuarry() {
  const m = genDungeon('quarry', 'The Oakhaven Quarry', 4127, {
    wall: 't_stone', altWall: 't_glassrock', altChance: 0.18, floor: 't_flag', ceil: 't_stone', fogDist: 9, fogColor: [0, 0, 0], music: 'dungeon', danger: 1,
    rooms: [{ name: 'pumphall', w: 9, h: 7 }, { name: 'depot', w: 7, h: 6 }, { name: 'shaft', w: 5, h: 5 }, { name: 'store', w: 5, h: 4 }, { name: 'barracks', w: 6, h: 5 }], fillerRooms: 7,
  });
  const e = m.entrance, rnd = m.rnd;
  // exit door back to the clearing: on the entrance room's wall
  m.set(e.x - 1, e.cy, DOOR({ portal: { map: 'clearing', x: 20.5, y: 6.5, dir: Math.PI / 2 }, label: 'Up the headframe ladder' }));
  m.spawn = { x: e.x + 0.6, y: e.cy + 0.5, dir: 0 };
  m.deco('lamp', e.cx + 0.5, e.y + 0.5, { radius: 0.12, scale: 0.7, glow: 0.6 }); m.deco('crates', e.x + e.w - 0.6, e.y + e.h - 0.6, { radius: 0.35 });
  const ph = m.named.pumphall;
  if (ph) {
    m.deco('pump', ph.x + 1.0, ph.y + 1.0, { radius: 0.4 }); m.deco('pump', ph.x + ph.w - 1.0, ph.y + 1.0, { radius: 0.4 }); m.deco('pump', ph.x + 1.0, ph.y + ph.h - 1.0, { radius: 0.4 });
    m.add({ kind: 'npc', id: 'hollow', name: 'A Hollow', sprite: 'hollow', x: ph.cx + 0.5, y: ph.cy + 0.5, solid: true, radius: 0.3, loop: true, lines: ['...pressure nominal... pressure nominal...', '...told Mags I\'d be home by Dawnday...'] });
    m.add({ kind: 'npc', id: 'hollow', name: 'A Hollow', sprite: 'hollow', x: ph.cx - 1.5, y: ph.cy + 1.5, solid: true, radius: 0.3, loop: true, lines: ['...blue jug on the sill... blue jug...', '...number four... number four... number four...'] });
    m.npc('tobiah', ph.x + ph.w - 1.5, ph.cy + 0.5, { facing: Math.PI });
    m.deco('lamp', ph.cx + 0.5, ph.y + ph.h - 0.6, { radius: 0.12, scale: 0.7, glow: 0.6 });
  }
  const dp = m.named.depot;
  if (dp) {
    m.item('coil', dp.cx + 0.5, dp.cy + 0.5);
    m.enemy('legionnaire', dp.cx + 0.5, dp.cy - 1.2, { guard: true, name: 'Tamsin Reed' });
    m.deco('crates', dp.x + 0.6, dp.y + 0.6, { radius: 0.35 }); m.deco('crates', dp.x + dp.w - 0.6, dp.y + 0.6, { radius: 0.35 }); m.deco('shelf', dp.x + 0.5, dp.y + dp.h - 0.5, { radius: 0.2 });
    m.item('pellets', dp.x + dp.w - 0.7, dp.y + dp.h - 0.7);
  }
  const sh = m.named.shaft;
  if (sh) {
    m.set(sh.cx, sh.y - 1, DOOR({ portal: { map: 'rootvault', useSpawn: true }, label: 'The shaft gate to the Root-vault', locked: 'pass', lockMsg: 'An iron gate over a green-lit shaft. A Consortium seal-lock. You have no pass.' }));
    m.deco('lever', sh.x + 0.5, sh.cy + 0.5, { radius: 0.3, scale: 0.8 }); m.deco('lamp', sh.x + sh.w - 0.6, sh.cy + 0.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
  }
  const st = m.named.store; if (st) { m.item('tonic', st.cx + 0.5, st.cy + 0.5); m.item('honey', st.x + 0.6, st.y + 0.6); m.deco('crates', st.x + st.w - 0.6, st.y + st.h - 0.6, { radius: 0.35 }); m.enemy('mites', st.cx + 1.5, st.cy + 0.5); }
  const br = m.named.barracks; if (br) { m.enemy('legionnaire', br.cx + 0.5, br.cy + 0.5, { name: 'Corwin Aye' }); m.deco('bed', br.x + 0.8, br.y + 0.8, { radius: 0.4, scale: 0.6 }); m.deco('bed', br.x + br.w - 0.8, br.y + 0.8, { radius: 0.4, scale: 0.6 }); m.item('sovereigns', br.cx + 0.5, br.y + br.h - 0.6); }
  // filler encounters
  for (const r of m.rooms) {
    if (r === e || r.name) continue;
    const roll = rnd();
    if (roll < 0.35) m.enemy('legionnaire', r.cx + 0.5, r.cy + 0.5, { name: NAMES_POOL[(rnd() * NAMES_POOL.length) | 0] });
    else if (roll < 0.6) m.enemy('mites', r.cx + 0.5, r.cy + 0.5);
    else if (roll < 0.8) m.add({ kind: 'npc', id: 'hollow', name: 'A Hollow', sprite: 'hollow', x: r.cx + 0.5, y: r.cy + 0.5, solid: true, radius: 0.3, loop: true, lines: ['...I punched it down... I punched it down...', '...coming, Mam... coming...'] });
    if (rnd() < 0.5) m.item(rnd() < 0.5 ? 'sovereigns' : 'tonic', r.x + 0.6, r.y + 0.6);
    if (rnd() < 0.4) m.deco('bones', r.x + r.w - 0.7, r.y + r.h - 0.7, { solid: false, scale: 0.5 });
    if (rnd() < 0.5) m.deco('lamp', r.cx + 0.5, r.y + 0.5, { radius: 0.12, scale: 0.7, glow: 0.6 });
  }
  m.item('bottle', e.x + e.w - 0.7, e.y + 0.6);
  return m;
}

function buildRootVault() {
  const m = genDungeon('rootvault', 'The Root-vault', 8812, {
    wall: 't_glassrock', altWall: 't_brass', altChance: 0.12, floor: 't_flag', ceil: 't_glassrock', fogDist: 8, fogColor: [4, 12, 4], music: 'root', danger: 1,
    rooms: [{ name: 'casing', w: 11, h: 9 }, { name: 'boiler', w: 7, h: 6 }, { name: 'gallery', w: 8, h: 4 }, { name: 'cistern', w: 5, h: 5 }], fillerRooms: 6,
  });
  const e = m.entrance, rnd = m.rnd;
  m.set(e.x - 1, e.cy, DOOR({ portal: { map: 'quarry', useSpawn: 'shaft' }, label: 'The shaft gate, up to the quarry' }));
  m.spawn = { x: e.x + 0.6, y: e.cy + 0.5, dir: 0 };
  const cs = m.named.casing;
  if (cs) {
    m.add({ kind: 'deco', sprite: 'bore', x: cs.cx + 0.5, y: cs.cy + 0.5, solid: true, radius: 0.9, scale: 2.2, use: 'bore', label: 'The Siphon Casing — the bore\'s lock', glow: 0.5 });
    for (const [dx, dy] of [[-3, -2], [3, -2], [-3, 2], [3, 2]]) m.deco('pump', cs.cx + 0.5 + dx, cs.cy + 0.5 + dy, { radius: 0.4, glow: 0.3 });
    m.deco('lever', cs.x + 0.6, cs.y + 0.6, { radius: 0.3, scale: 0.8 });
    m.add({ kind: 'npc', id: 'hollow', name: 'A Hollow at the pumps', sprite: 'hollow', x: cs.x + 1.5, y: cs.cy + 0.5, solid: true, radius: 0.3, loop: true, lines: ['...seven... eight... eight at the pumps...', '...hold... hold... hold...'] });
    m.casingRoom = cs;
  }
  const bl = m.named.boiler; if (bl) { m.enemy('golem', bl.cx + 0.5, bl.cy + 0.5); m.deco('pump', bl.x + 0.7, bl.y + 0.7, { radius: 0.4 }); m.item('tonic', bl.x + bl.w - 0.7, bl.y + bl.h - 0.7); }
  const ga = m.named.gallery; if (ga) { m.enemy('legionnaire', ga.cx + 0.5, ga.cy + 0.5, { name: 'Mirren Salk' }); m.enemy('legionnaire', ga.x + 1.5, ga.cy + 0.5, { name: 'Dunstan Pell' }); m.item('pellets', ga.x + ga.w - 0.7, ga.y + 0.6); }
  const ci = m.named.cistern; if (ci) { m.enemy('quiet', ci.cx + 0.5, ci.cy + 0.5); m.item('honey', ci.x + 0.6, ci.y + 0.6); m.item('sovereigns', ci.x + ci.w - 0.7, ci.y + ci.h - 0.7); }
  for (const r of m.rooms) {
    if (r === e || r.name) continue;
    const roll = rnd();
    if (roll < 0.4) m.enemy('legionnaire', r.cx + 0.5, r.cy + 0.5, { name: NAMES_POOL[(rnd() * NAMES_POOL.length) | 0] });
    else if (roll < 0.65) m.enemy('mites', r.cx + 0.5, r.cy + 0.5);
    else if (roll < 0.8) m.enemy('proctor', r.cx + 0.5, r.cy + 0.5, { name: NAMES_POOL[(rnd() * NAMES_POOL.length) | 0] });
    if (rnd() < 0.5) m.item(rnd() < 0.5 ? 'sovereigns' : 'tonic', r.x + 0.6, r.y + 0.6);
    if (rnd() < 0.4) m.deco('bones', r.x + r.w - 0.7, r.y + r.h - 0.7, { solid: false, scale: 0.5 });
  }
  return m;
}

function buildAllMaps() {
  const maps = buildInteriors();
  maps.oakhaven = buildOakhaven(false);
  maps.clearing = buildClearing();
  maps.quarry = buildQuarry();
  maps.rootvault = buildRootVault();
  return maps;
}
