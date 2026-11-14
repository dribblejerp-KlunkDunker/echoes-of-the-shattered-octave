// ============================================================
//  dryflume85 — Phase 85: the Dry Flume, the dungeon under the Stride (world plan, big place 1, approved 13 Nov:
//  "before the Flume was grown, it was built").
//
//  An arch in the bank under the Flume's trunks, on the Stride's valley floor, opens on the old stone conduit that carried
//  the water before the Flume was grown. Dry for two hundred years. Seven rooms, walked in order:
//    the adit          stone steps down from the arch, and an iron rail
//    the conduit       the stone channel, brick-lined, dry; the living Flume's root comes down through the roof and hangs
//                      in the dark, lit green from inside. Hush-moths come to it.
//    the settling tanks  three, stepped; wet silt, and fret-crawlers lying flat in it
//    the wheel-pit     an iron wheel stopped in a flooded pit, a ledge round it, a sluice-gate over the ledge on a worn
//                      chain (a trap of the place: wedge it, or it comes down on you)
//    the sump          black water and a causeway through it. The wonder: when the Flume above draws breath, the sump
//                      fills from the floor to the roof and drains again, so the crossing has to be timed.
//    the pump-hall     iron galleries on iron columns round the engine's beam, the root's great fall lighting it, and
//                      under the beam the keeper: the Standing Note, a mire-drone grown two hundred years in the dark,
//                      whose one note is the note the engine made when it ran.
//    the stair up      to the grating in the Pound Stair's bottom pound, bolted from below. Slide the bolts and it is a
//                      way in and out, when the pound stands empty after a surge.
//  Special gear, in a different line from the Howe's: the Lengthsman's Hook (it reaches, and what it reaches it pulls)
//  and Sluice-Boots (silent in water). A strongbox of the best kind on the engine-man's bench, a lesser one in the pit.
//  The Dry Flume, its rooms, its keeper, its gear and every line here are [PROPOSED] under the approved world plan.
//
//  Flags (small ints, validated on read): p85_wedged (the sluice), p85_dropped (it came down once), p85_unbolted (the
//  grating), p85_seen (the keeper's chamber stood in). Nothing visual uses random numbers.
// ============================================================
'use strict';

const DRYFLUME85 = (function () {
  const MAP = 'p85_dryflume', W = 60, H = 40, PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('dryflume85: ' + k, e); } };
  const TX = {
    name: S('The Dry Flume'),
    arch: S('An arch in the bank under the Flume, built of dressed stone, with a wheel cut in the keystone. Steps go down into the dark, and the air that comes up is dry.'),
    archDoor: S('The Dry Flume'),
    up: S('Up to the Stride'),
    adit: S('The adit. Stone steps worn hollow, and an iron rail sunk in lead beside them. Somebody built this, and built it to last.'),
    conduit: S('The conduit: a channel of stone as high as a man, lined with brick, bone dry. Before the Flume was grown, it was built, and this is what carried the water.'),
    root: S('The living Flume\'s root, come down through the roof. It hangs in the dark like a vein, and it is lit from inside, green.'),
    tanks: S('The settling tanks, three of them, stepped down. The silt in the bottom is still wet. There is a tide-mark on the walls at the height of your chin.'),
    wheel: S('The wheel-pit. The wheel is iron and twice the height of a house, and it stopped with one bucket at the top.'),
    sluice: S('A sluice-gate hung in its frame over the walk, on a chain worn thin. Use it to wedge the frame.'),
    sluiceDrop: S('The chain goes. The sluice-gate comes down on the walk and catches your shoulder on the way.'),
    sluiceWedge: S('You drive a wedge of old oak into the frame. The gate will not come down now.'),
    sluiceDone: S('The sluice-gate, wedged in its frame.'),
    sluiceDown: S('The sluice-gate, lying across the walk where it fell.'),
    sump: S('The sump. The water is black and very still, and the walls are wet all the way to the roof.'),
    causeway: S('A causeway through the sump, a stride wide. Wait on the steps until the water has gone down, then cross before it comes again.'),
    warn: S('Somewhere above, the Flume draws a breath. The water in the sump begins to climb.'),
    flood: S('The sump fills from the floor to the roof.'),
    swept: S('The water takes your feet and throws you onto the steps.'),
    ebb: S('The water goes back down the walls, and the causeway comes up out of it, streaming.'),
    hall: S('The pump-hall. Iron galleries on iron columns, three tiers of them, and in the middle the engine\'s beam, as long as a barn and still.'),
    beam: S('The engine\'s beam, iron, on its column. It stopped at the top of a stroke and has stood there for two hundred years.'),
    gallery: S('An iron gallery, rusted lace. The steps up to it are gone.'),
    keeper: S('The Standing Note'),
    keeperSeen: S('Under the beam lies a mire-drone grown two hundred years in the dark, the size of a cart. Its one note is the note the engine made when it ran, and the iron galleries ring with it.'),
    bench: S('The engine-man\'s bench, and what he left on it.'),
    hook: S('Lengthsman\'s Hook'),
    hookDesc: S('A boat-hook on an ash pole, iron at the working end. It reaches further than a sword, and what it reaches it pulls towards you.'),
    boots: S('Sluice-Boots'),
    bootsDesc: S('Thigh-high and tarred, with felt soles under the leather. In water they make no sound at all.'),
    stair: S('The stair up. A draught comes down it that smells of open air and wet stone.'),
    bolts: S('The grating overhead, bolted from below with two iron bolts. Use them to slide them back.'),
    unbolt: S('You slide the bolts back. The grating lifts an inch and settles. Above it is the bottom pound of the Stair.'),
    climb: S('Climb up through the grating'),
    underWater: S('Water stands on the grating. It will not lift until the pound is empty.'),
    grateOpen: S('The grating in the empty pound. You unbolted it from below. Steps go down into the Dry Flume.'),
    goDown: S('You lift the grating and go down the steps into the Dry Flume.'),
    journal: S('The Dry Flume: under the Stride is the old stone conduit that carried the water before the Flume was grown. The grating in the Pound Stair\'s bottom pound is its back door, and I have unbolted it.'),
  };
  const FLOOR = 0, SHALLOW = 1, WATER = 2;

  // ---------------------------------------------------------------- the special gear
  const WEAPON_DEF = { name: TX.hook, img: 'fp_spear', dmg: [4, 10], reach: 2.3, noise: 1.1, speed: 0.6, type: 'iron', value: 60, desc: TX.hookDesc, p85pull: true };
  const BOOTS_DEF = { name: TX.boots, slot: 'feet', ar: 2, noise: -0.2, value: 44, desc: TX.bootsDesc };
  function gear() {
    if (typeof WEAPONS !== 'undefined' && !WEAPONS.p85_hook) WEAPONS.p85_hook = Object.assign({}, WEAPON_DEF);
    if (typeof ARMOR !== 'undefined' && !ARMOR.a_p85_boots) ARMOR.a_p85_boots = Object.assign({}, BOOTS_DEF);
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p85_hook) ITEMS.w_p85_hook = { name: TX.hook, sprite: 'gear', weapon: 'p85_hook', value: 60, desc: TX.hookDesc };
      if (!ITEMS.a_p85_boots) ITEMS.a_p85_boots = Object.assign({ sprite: 'gear', armor: true }, BOOTS_DEF);
      // the Howe's gloves were never wearable (they had no armour entry): give them one, as the Howe meant
      if (ITEMS.a_p79_gloves && typeof ARMOR !== 'undefined' && !ARMOR.a_p79_gloves) { const g = ITEMS.a_p79_gloves; ARMOR.a_p79_gloves = { name: g.name, slot: g.slot, ar: g.ar, noise: g.noise, value: g.value, desc: g.desc }; g.armor = true; }
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && ICONS.C_PX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p85_hook')) {
      const C = ICONS.C_PX;
      const hook = (d) => {   // the Lengthsman's Hook: an ash pole, an iron spike and a curved hook
        d.tilt(12, 12);
        d.layer(C.ash).rrect(-1, -9, 2, 22);
        d.layer(C.iron, { shiny: 1 }).rrect(-1.2, -14, 2.4, 6).rrect(1, -11, 3.6, 1.6).rrect(3.4, -12.8, 1.4, 3);
        d.layer(C.dleather).rrect(-1.3, 4, 2.6, 4);
        d.mark('#e6ecee', 19, 3);
      };
      ICONS.PIX['weapon:p85_hook'] = hook; ICONS.PIX.w_p85_hook = hook;
      ICONS.PIX.a_p85_boots = (d) => {   // Sluice-Boots: tall, tarred, felt at the sole
        const b = (x) => { d.layer('#2a2622', { shiny: 1 }).rect(x, 2, 5, 15).rect(x, 15, 8, 4); d.layer('#5a5248').rect(x, 18, 8, 2); d.layer('#3e3832').rect(x, 2, 5, 1); };
        b(3); b(13);
      };
    } } catch (e) { /* the pack shows them without a picture */ }
  }

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn, glowTest) => {
      if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x);
      const data = new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0));
      Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data });
      if (glowTest && Engine.setEmissive) { const px = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    const E = (x, cx, cy, rx, ry, col, r) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); x.fill(); };
    const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
    // the root: a vein from the roof to the floor, thick at the top, splitting into rootlets that feel along the floor; lit green from inside
    const rootPaint = (x, w, h, n) => {
      for (let k = 0; k < n; k++) {
        const x0 = w / 2 + (k - (n - 1) / 2) * 5, th = k === Math.floor(n / 2) ? 9 : 4;
        x.strokeStyle = '#1e3a22'; x.lineWidth = th + 3; x.lineCap = 'round'; x.beginPath(); x.moveTo(w / 2, 0);
        for (let y = 0; y <= h; y += 8) x.lineTo(x0 + Math.sin(y * 0.05 + k * 1.7) * (3 + y * 0.04), y); x.stroke();
        x.strokeStyle = '#4aa860'; x.lineWidth = th; x.beginPath(); x.moveTo(w / 2, 0);
        for (let y = 0; y <= h; y += 8) x.lineTo(x0 + Math.sin(y * 0.05 + k * 1.7) * (3 + y * 0.04), y); x.stroke();
        x.strokeStyle = '#b8ffb0'; x.lineWidth = Math.max(1, th / 3); x.beginPath(); x.moveTo(w / 2, 0);
        for (let y = 0; y <= h * 0.9; y += 8) x.lineTo(x0 + Math.sin(y * 0.05 + k * 1.7) * (3 + y * 0.04), y); x.stroke();
      }
      for (let i = 0; i < 14; i++) { const y = h * (0.15 + 0.8 * h2(i, n)), xx = w / 2 + (h2(i, 3) - 0.5) * w * 0.7; E(x, xx, y, 1.6, 1.6, '#d8ffd0'); }   // beads of light along it
      // rootlets along the floor
      x.strokeStyle = '#3a8a4c'; x.lineWidth = 2; for (let i = 0; i < 6; i++) { x.beginPath(); x.moveTo(w / 2, h - 6); x.quadraticCurveTo(w / 2 + (i - 2.5) * 6, h - 2, w / 2 + (i - 2.5) * 12, h - 1); x.stroke(); }
    };
    const glowGreen = (r, g, b, a) => a > 0 && g > 150 && g > r + 20;
    add('p85_root', 48, 128, 2.2, (x) => rootPaint(x, 48, 128, 3), glowGreen);
    add('p85_rootfall', 96, 128, 2.2, (x) => rootPaint(x, 96, 128, 7), glowGreen);
    // the wheel: iron, spoked, buckets round the rim, one at the top; it stands in the pit's water
    add('p85_wheel', 128, 128, 2.1, (x) => {
      const cx = 64, cy = 66, R = 56;
      x.strokeStyle = '#3e3c3a'; x.lineWidth = 7; x.beginPath(); x.arc(cx, cy, R, 0, PI * 2); x.stroke();
      x.strokeStyle = '#8a847a'; x.lineWidth = 3; x.beginPath(); x.arc(cx, cy, R, 0, PI * 2); x.stroke();
      for (let i = 0; i < 12; i++) { const a = i * PI / 6; x.strokeStyle = '#5e5a54'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx, cy); x.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R); x.stroke(); }
      for (let i = 0; i < 16; i++) { const a = -PI / 2 + i * PI / 8; x.save(); x.translate(cx + Math.cos(a) * (R + 2), cy + Math.sin(a) * (R + 2)); x.rotate(a + PI / 2); x.fillStyle = i % 5 === 3 ? '#4a3a2a' : '#6a4a32'; x.fillRect(-6, -4, 12, 8); x.fillStyle = 'rgba(0,0,0,0.4)'; x.fillRect(-6, 2, 12, 2); x.restore(); }
      E(x, cx, cy, 9, 9, '#3a3836'); E(x, cx, cy, 4, 4, '#7a7670');
      x.fillStyle = 'rgba(120,60,30,0.35)'; for (let i = 0; i < 40; i++) E(x, cx + (h2(i, 9) - 0.5) * 2 * R, cy + (h2(i, 11) - 0.5) * 2 * R, 2, 1.4, 'rgba(140,70,30,0.35)');   // rust
    });
    // the beam engine: a column, the beam rocking on it, a rod down at each end
    add('p85_beam', 160, 112, 1.9, (x) => {
      x.fillStyle = '#2e2c2a'; x.fillRect(72, 30, 16, 82); x.fillStyle = '#4a4642'; x.fillRect(74, 30, 4, 82);
      for (let y = 40; y < 110; y += 14) { x.fillStyle = '#3a3836'; x.fillRect(70, y, 20, 3); }
      x.save(); x.translate(80, 26); x.rotate(-0.12);
      x.fillStyle = '#2a2826'; x.fillRect(-76, -8, 152, 16); x.fillStyle = '#5a5650'; x.fillRect(-76, -8, 152, 3);
      for (let i = -64; i <= 64; i += 16) E(x, i, 0, 3, 3, '#1a1918');
      x.fillStyle = '#3a3836'; x.fillRect(-74, 6, 5, 70); x.fillRect(69, 6, 5, 40);
      x.restore(); E(x, 80, 26, 8, 8, '#6a6660'); E(x, 80, 26, 3, 3, '#1a1918');
      E(x, 80, 110, 40, 3, 'rgba(0,0,0,0.35)');
    });
    // an iron gallery: rusted lace on two columns
    add('p85_gallery', 128, 96, 2.0, (x) => {
      x.fillStyle = '#2a2826'; x.fillRect(4, 0, 6, 96); x.fillRect(118, 0, 6, 96);
      for (const y of [6, 40]) { x.fillStyle = '#34312e'; x.fillRect(0, y, 128, 6); x.fillStyle = '#5a5248'; x.fillRect(0, y, 128, 1);
        x.strokeStyle = '#3a3632'; x.lineWidth = 1.5; for (let i = 0; i < 16; i++) { x.beginPath(); x.arc(4 + i * 8, y + 16, 5, PI, 0); x.stroke(); x.beginPath(); x.moveTo(4 + i * 8, y + 6); x.lineTo(4 + i * 8, y + 22); x.stroke(); } }
      for (let i = 0; i < 30; i++) E(x, h2(i, 5) * 128, h2(i, 7) * 60, 1.6, 1, 'rgba(150,70,30,0.45)');
    });
    // the sluice-gate in its frame, up (hung) and down (fallen)
    const frame = (x) => { x.fillStyle = '#3a2e22'; x.fillRect(4, 0, 8, 96); x.fillRect(52, 0, 8, 96); x.fillRect(4, 0, 56, 7); x.fillStyle = '#5a4a36'; x.fillRect(6, 0, 2, 96); x.fillRect(54, 0, 2, 96); };
    add('p85_sluice', 64, 96, 1.5, (x) => { frame(x); x.fillStyle = '#4a3a28'; x.fillRect(12, 8, 40, 38); x.fillStyle = '#2a2018'; for (let i = 0; i < 4; i++) x.fillRect(12, 12 + i * 9, 40, 2); x.strokeStyle = '#6a6660'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(32, 0); x.lineTo(32, 8); x.stroke(); });
    add('p85_sluicedown', 64, 96, 1.5, (x) => { frame(x); x.fillStyle = '#4a3a28'; x.fillRect(12, 70, 40, 26); x.fillStyle = '#2a2018'; for (let i = 0; i < 3; i++) x.fillRect(12, 74 + i * 8, 40, 2); });
    // the arch's face: dressed stone, a round-headed opening going down into the dark, a wheel on the keystone
    if (Engine.addTexture && !(Engine.textures && Engine.textures.t_p85_arch)) {
      const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d', { willReadFrequently: true });
      x.fillStyle = '#8a857a'; x.fillRect(0, 0, 64, 64);
      for (let row = 0; row < 8; row++) for (let col = -1; col < 5; col++) { const bx = col * 16 + (row % 2) * 8, by = row * 8, t = h2(row, col + 9); x.fillStyle = 'rgb(' + (118 + t * 30 | 0) + ',' + (113 + t * 28 | 0) + ',' + (102 + t * 24 | 0) + ')'; x.fillRect(bx + 1, by + 1, 14, 6); }
      x.fillStyle = '#5a564e'; for (let row = 0; row <= 8; row++) x.fillRect(0, row * 8, 64, 1);
      // voussoirs round the opening, the keystone, the opening itself with steps going down into the dark
      x.fillStyle = '#9c968a'; x.beginPath(); x.arc(32, 30, 20, PI, 0); x.lineTo(52, 64); x.lineTo(12, 64); x.closePath(); x.fill();
      x.strokeStyle = '#5a564e'; x.lineWidth = 1; for (let i = 0; i <= 8; i++) { const a = PI + i * PI / 8; x.beginPath(); x.moveTo(32 + Math.cos(a) * 14, 30 + Math.sin(a) * 14); x.lineTo(32 + Math.cos(a) * 20, 30 + Math.sin(a) * 20); x.stroke(); }
      const g = x.createLinearGradient(0, 18, 0, 64); g.addColorStop(0, '#060605'); g.addColorStop(0.7, '#141310'); g.addColorStop(1, '#2a2620');
      x.fillStyle = g; x.beginPath(); x.arc(32, 30, 14, PI, 0); x.lineTo(46, 64); x.lineTo(18, 64); x.closePath(); x.fill();
      for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(120,112,98,' + (0.5 - i * 0.11) + ')'; x.fillRect(18 + i, 62 - i * 5, 28 - i * 2, 2); }
      x.fillStyle = '#a8a294'; x.fillRect(28, 8, 8, 9); x.strokeStyle = '#4a463e'; x.beginPath(); x.arc(32, 12.5, 3, 0, PI * 2); x.moveTo(32, 9.5); x.lineTo(32, 15.5); x.moveTo(29, 12.5); x.lineTo(35, 12.5); x.stroke();
      x.fillStyle = 'rgba(70,90,50,0.5)'; for (let i = 0; i < 18; i++) x.fillRect(h2(i, 21) * 64 | 0, 40 + h2(i, 23) * 24 | 0, 2, 1);   // moss low down
      try { Engine.addTexture('t_p85_arch', new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('arch tex', e); }
    }
    // a slender iron column with a cast capital
    add('p85_column', 24, 128, 2.2, (x) => { x.fillStyle = '#26241f'; x.fillRect(8, 8, 8, 112); x.fillStyle = '#4a4640'; x.fillRect(9, 8, 2, 112); x.fillStyle = '#2e2b27'; x.fillRect(3, 0, 18, 9); x.fillRect(4, 118, 16, 10); for (let i = 0; i < 6; i++) E(x, 12, 24 + i * 18, 1.5, 1, 'rgba(140,70,30,0.5)'); });
    // the bench: a plank on trestles
    add('p85_bench', 96, 48, 0.45, (x) => { x.fillStyle = '#4a3a28'; x.fillRect(4, 10, 88, 8); x.fillStyle = '#2e241a'; x.fillRect(10, 18, 6, 30); x.fillRect(80, 18, 6, 30); x.fillRect(4, 16, 88, 2); });
  }

  // ---------------------------------------------------------------- the place
  const ROOMS = {
    adit: [3, 33, 7, 38], conduit: [4, 6, 6, 32], tanks: [7, 3, 22, 12], pass1: [23, 7, 23, 8], pit: [24, 2, 33, 13],
    pass2: [34, 2, 37, 4], pass3: [37, 5, 38, 17], sump: [35, 18, 48, 31], pass4: [49, 16, 50, 29], hall: [40, 2, 57, 15], pass5: [56, 16, 57, 22], foot: [54, 23, 58, 26],
  };
  const LAND_W = [35, 18, 38, 20], LAND_E = [45, 28, 48, 31];
  const CAUSEWAY = [[37, 21], [37, 24], [42, 24], [42, 28], [45, 28]];
  const SLUICE = [29.5, 3.5], STAIR_TOP = [56.5, 26.5], DOWN_SPOT = { x: 56.5, y: 25.2, dir: PI };
  const inRect = (r, x, y) => x >= r[0] && x <= r[2] && y >= r[1] && y <= r[3];

  function build(up) {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_flag', floorTextures: ['t_flag', 't_shallows', 't_water'], ceil: 't_stone', fogDist: 11, ambient: 0.07, fogColor: [10, 14, 12], music: 'root', danger: 1, spawn: { x: 5.5, y: 37.4, dir: -PI / 2 } });
    m.rect(0, 0, W - 1, H - 1, 't_brick');
    m.ceilZ = 2.2;   // room for the wheel and the beam; one cell at that height so the renderer's tallest-point scan never stops early
    for (const k in ROOMS) m.clear(...ROOMS[k]);
    m.block(0, 0, 't_brick', m.ceilZ);
    m.set(5, 39, DOOR({ tex: 't_stone', portal: up, label: TX.up }));
    // the settling tanks: three sunk bays of wet silt, a walk along their north side, brick piers between
    for (const [x0, x1] of [[9, 12], [14, 17], [19, 22]]) for (let y = 6; y <= 12; y++) for (let x = x0; x <= x1; x++) m.setFloor(x, y, SHALLOW);
    for (const x of [13, 18]) for (let y = 7; y <= 12; y++) m.set(x, y, WALL('t_brick'));
    // the wheel-pit: the pit full of black water; a ledge north (the walk) and west (to the lesser strongbox)
    for (let y = 5; y <= 13; y++) for (let x = 26; x <= 33; x++) m.setFloor(x, y, WATER);
    // the sump: water everywhere but the two landings and the causeway
    const [sx0, sy0, sx1, sy1] = ROOMS.sump;
    for (let y = sy0; y <= sy1; y++) for (let x = sx0; x <= sx1; x++) if (!inRect(LAND_W, x, y) && !inRect(LAND_E, x, y)) m.setFloor(x, y, WATER);
    const CW = [];
    for (let i = 0; i < CAUSEWAY.length - 1; i++) { const [ax, ay] = CAUSEWAY[i], [bx, by] = CAUSEWAY[i + 1]; for (let x = Math.min(ax, bx); x <= Math.max(ax, bx); x++) for (let y = Math.min(ay, by); y <= Math.max(ay, by); y++) for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const cx = x + dx, cy = y + dy; if (inRect(ROOMS.sump, cx, cy) && !inRect(LAND_W, cx, cy) && !inRect(LAND_E, cx, cy) && !CW.some((c) => c[0] === cx && c[1] === cy)) { CW.push([cx, cy]); m.setFloor(cx, cy, SHALLOW); } } }
    m._p85 = { CW };
    // the pump-hall's iron columns
    for (const x of [43, 47, 51, 55]) for (const y of [5, 12]) m.deco('p85_column', x + 0.5, y + 0.5, { radius: 0.25, scale: 1, label: TX.gallery });
    // the stair up: a wall with the steps in it
    m.set(56, 27, WALL('d18_up'));
    // light: none but the root's, and a little grey daylight at the foot of the adit and down the stair
    m.deco('lamp', 5.5, 36.2, { radius: 0.1, scale: 0.4, glow: 0.25, solid: false, yOff: 0.6, hidden: true });
    for (const [x, y] of [[5.5, 27.5], [5.5, 18.5], [5.5, 10.5], [15.5, 4.5]]) m.deco('p85_root', x, y, { radius: 0.2, scale: 1, solid: false, glow: 0.8, lightCol: [60, 170, 90], label: TX.root });
    m.deco('p85_root', 44.6, 13.0, { radius: 0.2, scale: 1, solid: false, glow: 0.7, lightCol: [60, 170, 90], label: TX.root });
    m.deco('p85_root', 54.4, 4.0, { radius: 0.2, scale: 1, solid: false, glow: 0.7, lightCol: [60, 170, 90], label: TX.root });
    m.deco('p85_root', 52.0, 7.6, { radius: 0.2, scale: 1, solid: false, glow: 0.8, lightCol: [60, 170, 90], label: TX.root });
    m.deco('p85_rootfall', 46.4, 9.6, { radius: 0.5, scale: 1, solid: false, glow: 1, lightCol: [60, 180, 90], label: TX.root });
    m.deco('p85_root', 31.8, 7.0, { radius: 0.2, scale: 1, solid: false, glow: 0.8, lightCol: [60, 170, 90], label: TX.root });
    m.deco('p85_root', 42.5, 22.5, { radius: 0.2, scale: 1, solid: false, glow: 0.7, lightCol: [50, 150, 80], label: TX.root });
    // what the rooms are
    m.deco('sign', 6.6, 34.4, { radius: 0.2, scale: 0.6, label: TX.adit });
    m.deco('sign', 6.6, 30.0, { radius: 0.2, scale: 0.6, label: TX.conduit });
    m.deco('sign', 8.4, 3.6, { radius: 0.2, scale: 0.6, label: TX.tanks });
    m.deco('sign', 24.4, 2.6, { radius: 0.2, scale: 0.6, label: TX.wheel });
    m.deco('p85_wheel', 30.0, 9.0, { radius: 0.2, scale: 1, solid: false, label: TX.wheel });
    m.deco('p85_sluice', SLUICE[0], SLUICE[1], { radius: 0.1, scale: 1, solid: false, label: TX.sluice, use: 'p85_sluice', _p85: 'sluice' });
    m.deco('sign', 38.4, 18.6, { radius: 0.2, scale: 0.6, label: TX.sump });
    m.deco('sign', 37.6, 20.4, { radius: 0.15, scale: 0.5, label: TX.causeway });
    m.deco('sign', 48.6, 15.4, { radius: 0.2, scale: 0.6, label: TX.hall });
    m.deco('p85_beam', 49.0, 8.5, { radius: 1.1, scale: 1, label: TX.beam });
    for (const [x, y] of [[44.5, 2.7], [52.5, 2.7], [44.5, 14.3], [52.5, 14.3]]) m.deco('p85_gallery', x, y, { radius: 0.2, scale: 1, solid: false, label: TX.gallery });
    m.deco('p85_bench', 55.6, 2.8, { radius: 0.3, scale: 1, label: TX.bench });
    m.deco('sign', 55.0, 23.6, { radius: 0.2, scale: 0.6, label: TX.stair });
    m.deco('p83_none', STAIR_TOP[0], STAIR_TOP[1], { radius: 0.2, scale: 0.5, solid: false, label: TX.bolts, use: 'p85_up', _p85: 'bolts' });
    m.deco('bones', 22.0, 3.6, { radius: 0.3, scale: 0.5 }); m.deco('bones', 36.4, 3.6, { radius: 0.3, scale: 0.5 });
    // what lives here now: moths at the root-light, crawlers flat in the silt, drones on the landings, the keeper under the beam
    m.enemy('hushmoth', 5.0, 18.0); m.enemy('hushmoth', 6.0, 19.2);
    m.enemy('hushmoth', 15.0, 5.0);
    m.enemy('fretcrawler', 15.5, 10.5); m.enemy('fretcrawler', 20.5, 9.5);
    m.enemy('mites', 24.8, 8.5);
    m.enemy('miredrone', 35.6, 18.6, { passive: true, facing: 0 }); m.enemy('miredrone', 47.6, 30.6, { passive: true, facing: PI });
    m.enemy('hushmoth', 45.0, 7.6); m.enemy('hushmoth', 44.4, 11.0);
    m.enemy('miredrone', 49.0, 11.2, { _p85: 'keeper' });
    // the gear and the strongboxes
    m.add({ kind: 'item', item: 'cache', tier: 2, x: 24.8, y: 12.6, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.add({ kind: 'item', item: 'w_p85_hook', x: 54.9, y: 2.9, sprite: 'gear', scale: 0.5, yOff: 0, solid: false, label: TX.hook });
    m.add({ kind: 'item', item: 'a_p85_boots', x: 56.3, y: 2.9, sprite: 'gear', scale: 0.45, yOff: 0, solid: false, label: TX.boots });
    m.add({ kind: 'item', item: 'cache', tier: 3, x: 57.2, y: 4.4, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.baseCount = m.entities.length;
    return m;
  }

  // the arch on the Stride's valley floor, under the Flume's line, clear of the road and the brook
  function placeArch(stride) {
    const F = FLUME83, [fa, fb] = F.FLUME, W2 = stride.w, fl = (x, y) => stride.floorTextures[stride.floorCells[y * W2 + x]] || '';
    const roadD = (x, y) => { let b = 1e9; for (let i = 0; i < F.SROAD.length - 1; i++) { const [ax, ay] = F.SROAD[i], [bx, by] = F.SROAD[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy || 1))); b = Math.min(b, Math.hypot(ax + dx * t - x, ay + dy * t - y)); } return b; };
    const ok = (x, y) => x > 4 && y > 4 && [-2, -1].every((dy) => [-2, -1, 0, 1, 2].every((dx) => !stride.get(x + dx, y + dy) && !/water|plank/.test(fl(x + dx, y + dy)))) && x < W2 - 4 && y < stride.h - 4 && [-1, 0, 1].every((dx) => !stride.get(x + dx, y) && !/water|plank/.test(fl(x + dx, y))) && [1, 2, 3].every((dy) => !stride.get(x, y + dy) && !/water|plank/.test(fl(x, y + dy))) && roadD(x + 0.5, y + 0.5) > 5 && !stride.entities.some((e) => e && Math.hypot(e.x - x - 0.5, e.y - y - 0.5) < 1.6);
    for (let k = 0; k <= 40; k++) {
      const t = 0.44 + (k % 2 ? 1 : -1) * Math.ceil(k / 2) * 0.01, px = fa[0] + (fb[0] - fa[0]) * t, py = fa[1] + (fb[1] - fa[1]) * t;
      for (const ox of [3, -3, 5, -5]) { const x = Math.floor(px + ox), y = Math.floor(py); if (ok(x, y)) return [x, y]; }
    }
    return null;
  }
  function join(maps) {
    const st = typeof FLUME83 !== 'undefined' && maps[FLUME83.STRIDE]; if (!st || maps[MAP]) return;
    const at = placeArch(st); if (!at) { warnOnce('arch', 'no place for the arch'); return; }
    const [x, y] = at, z = st.groundAt ? st.groundAt(x + 0.5, y + 1.5) : 0;
    // a stone face set into a grassed bank: the bank behind and on either side, the arch in the middle
    for (let dy = -2; dy <= 0; dy++) for (let dx = -2; dx <= 2; dx++) { if (dy === 0 && dx === 0) continue; const cx = x + dx, cy = y + dy; if (st.get(cx, cy)) continue; const edge = Math.abs(dx) === 2 || dy === -2;
      st.block(cx, cy, dy === 0 ? 't_stone' : 't_p22_meadow', z + (edge ? 0.7 : 1.15), { capTex: 't_p22_meadow' }); }
    st.set(x, y, DOOR({ tex: 't_p85_arch', portal: { map: MAP, x: 5.5, y: 37.4, dir: -PI / 2 }, label: TX.archDoor }));
    const ins = st.baseCount == null ? st.entities.length : st.baseCount;
    st.entities.splice(ins, 0, { kind: 'deco', sprite: 'sign', x: x - 1.6, y: y + 1.5, scale: 0.7, solid: false, radius: 0.2, label: TX.arch });
    if (st.baseCount != null) st.baseCount++;
    maps[MAP] = build({ map: FLUME83.STRIDE, x: x + 0.5, y: y + 1.6, dir: PI / 2 });
    maps[MAP]._p85arch = [x, y];
  }

  // ---------------------------------------------------------------- the surge: the sump fills from the floor to the roof, and drains
  const f = () => G.flags, fint = (k) => { const v = Number(f()['p85_' + k]); return Number.isFinite(v) ? v : 0; };
  const wet = () => typeof Weather !== 'undefined' && (Weather.state === 'rain' || Weather.state === 'storm');
  const CYCLE = () => (wet() ? { dry: 18, warn: 5, flood: 16 } : { dry: 30, warn: 5, flood: 14 });
  const surge = { t: 0, phase: 'dry' };
  function phaseAt(t) { const c = CYCLE(), n = c.dry + c.warn + c.flood, p = ((t % n) + n) % n; return p < c.dry ? 'dry' : p < c.dry + c.warn ? 'warn' : 'flood'; }
  const near = () => { const c = Engine.cam; return c.x >= 33 && c.y >= 16 && c.x <= 52 && c.y <= 33; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  function setSump(phase) {
    const m = G.map, d = m._p85; if (!d) return;
    const want = phase === 'flood' ? WATER : SHALLOW;
    for (const [x, y] of d.CW) m.floorCells[y * m.w + x] = want;
  }
  function tickSurge(dt) {
    surge.t += dt; const ph = phaseAt(surge.t);
    if (ph === surge.phase) { if (ph === 'flood') sweep(); return; }
    surge.phase = ph; setSump(ph);
    if (ph === 'warn' && near()) say(TX.warn, 'warn', 5000);
    if (ph === 'flood') { if (near()) say(TX.flood, 'bad', 4000); sweep(); }
    if (ph === 'dry' && near()) say(TX.ebb, '', 4500);
    try { if (typeof R3D !== 'undefined' && R3D.invalidate) R3D.invalidate(); } catch (e) { /* next frame */ }
  }
  // anyone on the causeway when it fills is thrown onto the nearer steps
  function sweep() {
    const c = Engine.cam, m = G.map, cx = Math.floor(c.x), cy = Math.floor(c.y);
    if (m.floorCells[cy * m.w + cx] !== WATER || !inRect(ROOMS.sump, cx, cy)) return;
    const land = Math.hypot(c.x - 37, c.y - 19.5) < Math.hypot(c.x - 46.5, c.y - 29.5) ? [37.0, 19.0] : [46.5, 29.5];
    c.x = land[0]; c.y = land[1];
    try { damagePlayer(6); } catch (e) { /* no harm done */ }
    say(TX.swept, 'bad', 5000);
  }

  // ---------------------------------------------------------------- the rest of the hour
  let lastSeen = 0;
  function sync() {
    if (typeof G === 'undefined' || !G.map || !G.flags) return;
    if (G.map.id === MAP) {
      const c = Engine.cam;
      for (const e of G.ents) { if (!e || !e._p85) continue;
        if (e._p85 === 'sluice') { const wedged = fint('wedged') === 1, dropped = fint('dropped') === 1; e.sprite = dropped ? 'p85_sluicedown' : 'p85_sluice'; e.label = wedged ? TX.sluiceDone : dropped ? TX.sluiceDown : TX.sluice; e.use = wedged || dropped ? undefined : 'p85_sluice';
          if (!wedged && !dropped && Math.hypot(c.x - e.x, c.y - e.y) < 0.55) { f().p85_dropped = 1; try { damagePlayer(8); } catch (err) { /* */ } G.noise = Math.max(Number(G.noise) || 0, 4.5); say(TX.sluiceDrop, 'bad', 6000); try { Audio_.sfx.door && Audio_.sfx.door(); } catch (err) { /* quiet */ } } }
        else if (e._p85 === 'bolts') e.label = fint('unbolted') === 1 ? TX.climb : TX.bolts;
        else if (e._p85 === 'keeper' && e.def && e.def.name !== TX.keeper) { const fresh = e.hp === e.def.hp; e.def = Object.assign({}, e.def, { name: TX.keeper, dmg: [7, 14], xp: 170, speed: 0.85 }); e.hpMax = 150; if (fresh) e.hp = 150; e.scale = 2.0; e.name = TX.keeper; e.passive = false; } }
      if (!fint('seen') && c.x > 40 && c.x < 58 && c.y < 15.5 && c.y > 1) { f().p85_seen = 1; say(TX.keeperSeen, 'bad', 9000); }
    } else if (typeof FLUME83 !== 'undefined' && G.map.id === FLUME83.STAIR && fint('unbolted') === 1) {
      for (const e of G.ents) if (e && e._p83 === 'grate') { e.label = TX.grateOpen; e.use = 'p85_down'; }
    }
  }
  function poundEmpty() {
    const fl = Number(G.flags.p83_drained), h = ((((Number(G.tod) || 0) % 1) + 1) % 1) * 24, now = (Number(G.day) || 0) * 24 + h;
    return !wet() && Number.isFinite(fl) && fl > 0 && now - fl < 6;
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p85_/.test(e.use) || typeof G === 'undefined' || !G.map) return false;
    if (e.use === 'p85_sluice') { if (!fint('wedged') && !fint('dropped')) { f().p85_wedged = 1; say(TX.sluiceWedge, 'good'); } sync(); return true; }
    if (e.use === 'p85_up') {
      if (fint('unbolted') !== 1) { f().p85_unbolted = 1; say(TX.unbolt, 'good', 7000); try { questXp(30); journal('side', TX.journal); } catch (err) { /* */ } sync(); return true; }
      if (!poundEmpty()) { say(TX.underWater, 'warn', 5000); return true; }
      const F = FLUME83, [x0, y0, x1, y1] = F.POUND(F.LOCKS - 1), st = G.maps[F.STAIR], fr = typeof travelFreeNear === 'function' && st ? travelFreeNear(st, (x0 + x1) / 2 + 0.5, (y0 + y1) / 2 + 0.5) : null;
      loadMap(F.STAIR, { x: fr ? fr[0] : (x0 + x1) / 2 + 0.5, y: fr ? fr[1] : (y0 + y1) / 2 + 0.5, dir: 0 }); return true;
    }
    if (e.use === 'p85_down') { say(TX.goDown, '', 4000); loadMap(MAP, Object.assign({}, DOWN_SPOT)); return true; }
    return false;
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    gear(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { gear(); art(); join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { if (G.map && G.map.id === MAP) { surge.t = 0; surge.phase = 'dry'; setSump('dry'); } sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { if (G.map && G.map.id === MAP && G.state === 'play') tickSurge(Number(dt) || 0); sync(); } catch (e) { /* next frame */ } return r; }; }
    // Sluice-Boots: no sound at all in water
    if (typeof armorNoise === 'function') { const _n = armorNoise; armorNoise = function (p) { let n = _n.apply(this, arguments); try { const pp = p || G.player; if (pp.armor && pp.armor.feet === 'a_p85_boots' && G.map && Engine.cam) { const m = G.map, t = m.floorTextures && m.floorTextures[m.floorCells[Math.floor(Engine.cam.y) * m.w + Math.floor(Engine.cam.x)]]; if (/water|shallow/.test(t || '')) n = Math.max(-0.8, n - 0.6); } } catch (e) { /* as worn */ } return n; }; }
    // the hook: what it reaches, it pulls towards you
    if (typeof attack === 'function') { const _a = attack; attack = function () {
      let before = null; try { if (typeof currentWeapon === 'function' && currentWeapon() && currentWeapon().p85pull) before = new Map(G.ents.filter((e) => e && e.kind === 'enemy' && !e.dead).map((e) => [e, e.hp])); } catch (e) { before = null; }
      const r = _a.apply(this, arguments);
      try { if (before) { const c = Engine.cam; for (const [e, hp] of before) { if (e.dead || e.hp >= hp || (e.def && e.def.boss)) continue; const d = Math.hypot(e.x - c.x, e.y - c.y); if (d < 1.3) continue; const k = Math.min(0.9, d - 1.1), nx = e.x - (e.x - c.x) / d * k, ny = e.y - (e.y - c.y) / d * k; if (!G.map.isBlocked(Math.floor(nx), Math.floor(ny))) { e.x = nx; e.y = ny; } } } } catch (e) { /* a plain blow */ }
      return r; }; }
  }
  wire();

  return { MAP, W, H, TX, TEXTS, ROOMS, LAND_W, LAND_E, CAUSEWAY, SLUICE, STAIR_TOP, build, join, placeArch, sync, useOwn, surge, phaseAt, CYCLE, tickSurge, poundEmpty, gear, art };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = DRYFLUME85;
if (typeof window !== 'undefined') window.DRYFLUME85 = DRYFLUME85;
