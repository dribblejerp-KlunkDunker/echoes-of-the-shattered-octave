// ============================================================
//  antler85 — Phase 85: the Antler Galleries, the mine under the Hundred Hollows (world plan, big place 2, approved
//  13 Nov). Real country: Grime's Graves, where people sank hundreds of shafts through the chalk to a seam of black
//  flint and dug low galleries out from the foot of each with picks of red-deer antler, and left the picks where they
//  put them down. The wonder [PROPOSED, approved]: in the Reach the picks that were left grew. They took root in the
//  chalk and branched, and the deepest galleries are a white forest of antler, floor to roof, in white chalk walls.
//
//  The open hollow on the drove road (js/drove83.js) is the way down. Two levels:
//    the galleries   low passages of white chalk running out from the shaft's foot, branching; antler picks lying where
//                    they were put down, the further ones rooting and putting out tines. A mine is still, and
//                    stillness is the Hush's: the galleries are siphoned (stand still and it leans in). Light is the
//                    way through: your lamp burns down, and every niche has a tallow-cup to fill it from and light.
//                    Hush-moths come for the light; swarms in numbers in the dead ends.
//    the deep        down a second shaft by a ladder: the white forest, floor to roof, the floorstone (the seam of
//                    black flint) along the bottom, and in the deepest gallery the thing denned there: the Flint-Back,
//                    a fret-crawler grown white in the chalk with flint along its shell.
//  Special gear: the Antler Pick (it breaks armour) and the Floorstone Knife (black flint, very quiet, very sharp).
//  A strongbox of the best kind in the den, a lesser one in the old face.
//  Everything here is [PROPOSED] under the approved plan. Flags (small ints, validated on read): p85a_oil (seconds of
//  oil, 0 to 90), p85a_niches (a bit for each niche lit), p85a_seen (the den stood in). Nothing visual uses random numbers.
// ============================================================
'use strict';

const ANTLER85 = (function () {
  const UP = 'p85_galleries', DEEP = 'p85_antlerdeep', PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('antler85: ' + k, e); } };
  const TX = {
    nameUp: S('The Antler Galleries'), nameDeep: S('The Antler Galleries: the deep'),
    shaftUse: S('The open hollow\'s mouth. Notches cut in the chalk go down it like a ladder.'),
    climbDown: S('You go down the notches into the chalk.'),
    climbUp: S('Up the notches to the Hollows'),
    climbUpDeep: S('Up the ladder to the galleries'),
    ladderDown: S('A second shaft, and a ladder of lashed poles going down it'),
    foot: S('The shaft\'s foot. Galleries go out from it on every side, low, white, the walls marked all over with the strokes of picks.'),
    gallery: S('A gallery, cut low. You go stooping. Every stroke in the chalk is the width of a tine.'),
    pick: S('An antler pick, lying where it was put down. It has been lying here a very long time.'),
    rooting: S('An antler pick that has taken root. Its tines have gone into the floor, and new tines are coming up out of the old.'),
    niche: S('A niche cut in the wall, and a cup of chalk in it with tallow and a wick. Use it to fill your lamp and light it.'),
    nicheLit: S('A niche, its tallow-cup burning. Use it to fill your lamp.'),
    lit: S('You fill your lamp from the cup and light them both. The chalk throws the light a long way.'),
    filled: S('You fill your lamp from the cup.'),
    low: S('Your lamp is burning low. Find a niche.'),
    out: S('Your lamp goes out. The dark here is very still, and stillness is the Hush\'s.'),
    face: S('The old face, where the first of them stopped digging. The floor is a litter of chalk and broken tine.'),
    forest: S('The white forest. The picks they left grew, and kept growing: antler from the floor to the roof, branching, white on white, as far as the light goes.'),
    antler: S('Antler, grown from a pick. It is warm to the touch, and it is still growing.'),
    seam: S('The floorstone: the seam of black flint they dug all this to reach, a band of it along the foot of the wall like a line of ink.'),
    den: S('The deepest gallery. Something has lain here so long that the floor is worn to its shape.'),
    keeper: S('The Flint-Back'),
    keeperSeen: S('A fret-crawler grown white in the chalk, as long as a boat, flint grown into the ridges of its shell. It is lying in the deepest gallery as if it were part of the floor.'),
    pickName: S('Antler Pick'), pickDesc: S('A red-deer antler, the brow tine left long for a point and the rest cut away, the beam worn smooth by a hand that was gone before anyone wrote anything down. It breaks armour.'),
    knifeName: S('Floorstone Knife'), knifeDesc: S('Black flint from the floorstone, knapped to an edge you could shave with. It makes almost no sound, and it is very sharp.'),
    journal: S('The Antler Galleries: under the open hollow on the drove road, an old flint-mine. The antler picks they left grew. The deep galleries are a white forest, and something lies in the deepest.'),
  };
  const FLOOR = 0, CHALK = 1;
  const OIL_MAX = 90;

  // ---------------------------------------------------------------- the special gear
  const PICK = { name: TX.pickName, img: 'fp_mace', dmg: [6, 13], reach: 1.3, noise: 1.2, speed: 0.6, type: 'iron', blunt: true, value: 55, desc: TX.pickDesc };
  const KNIFE = { name: TX.knifeName, img: 'fp_knife', dmg: [3, 9], reach: 1.1, noise: 0.3, speed: 0.24, type: 'glass', value: 45, desc: TX.knifeDesc };
  function gear() {
    if (typeof WEAPONS !== 'undefined') { if (!WEAPONS.p85_pick) WEAPONS.p85_pick = Object.assign({}, PICK); if (!WEAPONS.p85_knife) WEAPONS.p85_knife = Object.assign({}, KNIFE); }
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p85_pick) ITEMS.w_p85_pick = { name: TX.pickName, sprite: 'gear', weapon: 'p85_pick', value: 55, desc: TX.pickDesc };
      if (!ITEMS.w_p85_knife) ITEMS.w_p85_knife = { name: TX.knifeName, sprite: 'gear', weapon: 'p85_knife', value: 45, desc: TX.knifeDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && ICONS.C_PX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p85_pick')) {
      const C = ICONS.C_PX;
      const pick = (d) => { d.tilt(12, 12); d.layer('#d8ccb4').rrect(-1.4, -6, 2.8, 18).rrect(-1, -12, 2, 7).rrect(1, -8, 5, 1.8); d.layer('#a8987c').rrect(-1.4, 8, 2.8, 4); d.mark('#fff8e8', 18, 3); };
      const knife = (d) => { d.tilt(12, 12); d.layer('#1c1c22', { shiny: 1 }).rrect(-1.6, -12, 3.2, 12); d.layer('#46464e').rrect(-0.6, -11, 1, 9); d.layer(C.dleather).rrect(-1.4, 0, 2.8, 8); d.mark('#e6ecee', 16, 2); };
      ICONS.PIX['weapon:p85_pick'] = pick; ICONS.PIX.w_p85_pick = pick; ICONS.PIX['weapon:p85_knife'] = knife; ICONS.PIX.w_p85_knife = knife;
    } } catch (e) { /* the pack shows them without a picture */ }
  }

  // ---------------------------------------------------------------- the pictures (code only, fixed patterns)
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn, glowTest) => {
      if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x);
      Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) });
      if (glowTest && Engine.setEmissive) { const px = x.getImageData(0, 0, w, h).data, mask = new Uint8Array(w * h); for (let i = 0; i < w * h; i++) mask[i] = glowTest(px[i * 4], px[i * 4 + 1], px[i * 4 + 2], px[i * 4 + 3]) ? 1 : 0; Engine.setEmissive(name, mask); }
    };
    // a tine: a tapering curved stroke, light on one side
    const tine = (x, ax, ay, bx, by, cx, cy, w0, col, lit) => {
      for (let i = 0; i < 12; i++) { const t0 = i / 12, t1 = (i + 1) / 12, P = (t) => [(1 - t) * (1 - t) * ax + 2 * (1 - t) * t * cx + t * t * bx, (1 - t) * (1 - t) * ay + 2 * (1 - t) * t * cy + t * t * by], [x0, y0] = P(t0), [x1, y1] = P(t1);
        x.strokeStyle = col; x.lineWidth = Math.max(1, w0 * (1 - t0 * 0.85)); x.lineCap = 'round'; x.beginPath(); x.moveTo(x0, y0); x.lineTo(x1, y1); x.stroke();
        x.strokeStyle = lit; x.lineWidth = Math.max(0.6, w0 * (1 - t0 * 0.85) * 0.35); x.beginPath(); x.moveTo(x0 - 1, y0); x.lineTo(x1 - 1, y1); x.stroke(); }
    };
    // a grown antler, floor to roof: a beam rising and forking, tines branching off it and off each other
    const grown = (x, w, h, seed, full) => {
      const COL = '#e8e2d2', LIT = '#fffdf6', SH = '#b8b09c';
      const grow = (ax, ay, ang, len, wd, depth) => {
        if (depth > (full ? 4 : 2) || len < 6) return;
        const bx = ax + Math.cos(ang) * len, by = ay + Math.sin(ang) * len, cx = (ax + bx) / 2 + Math.cos(ang + PI / 2) * len * 0.15 * (h2(seed, depth + ax) - 0.5) * 2, cy = (ay + by) / 2;
        tine(x, ax, ay, bx, by, cx, cy, wd, depth ? COL : SH, LIT);
        const n = depth === 0 ? 3 : 2;
        for (let k = 0; k < n; k++) { const t = 0.35 + 0.5 * h2(seed * 3 + k, depth * 7 + ax), sx = ax + (bx - ax) * t, sy = ay + (by - ay) * t, side = (k % 2 ? 1 : -1); grow(sx, sy, ang + side * (0.45 + 0.4 * h2(seed + k, depth)), len * (0.55 + 0.2 * h2(k, seed + depth)), wd * 0.6, depth + 1); }
        grow(bx, by, ang + (h2(seed, depth * 5) - 0.5) * 0.6, len * 0.6, wd * 0.7, depth + 1);
      };
      grow(w / 2, h - 2, -PI / 2 + (h2(seed, 1) - 0.5) * 0.3, h * (full ? 0.42 : 0.5), full ? 9 : 5, 0);
      // roots into the chalk
      x.strokeStyle = '#c8c0ac'; x.lineWidth = 2; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(w / 2, h - 3); x.quadraticCurveTo(w / 2 + (i - 2) * 6, h - 1, w / 2 + (i - 2) * 11, h); x.stroke(); }
    };
    // the antler is faintly warm and alive: its lit edges give a little light of their own, so the forest shows white
    const pale = (r, g, b, a) => a > 0 && r > 236 && g > 230;
    add('p85_antler', 96, 192, 2.0, (x) => grown(x, 96, 192, 3, true), pale);
    add('p85_antler2', 96, 192, 2.0, (x) => grown(x, 96, 192, 11, true), pale);
    add('p85_rooting', 48, 48, 0.5, (x) => grown(x, 48, 48, 7, false));
    // the Flint-Back: every pose of the fret-crawler, grown white in the chalk, its darks turned to black flint
    try { for (const k of Object.keys(Engine.sprites)) { if (!/^fretcrawler(_\w+)?$/.test(k)) continue; const name = 'p85_flintback' + k.slice(11); if (Engine.sprites[name]) continue;
      const sp = Engine.sprites[k], src = new Uint8Array(sp.data.buffer.slice(0)), out = new Uint8Array(src.length);
      for (let i = 0; i < src.length; i += 4) { const a = src[i + 3]; if (!a) continue; const l = (src[i] * 0.3 + src[i + 1] * 0.59 + src[i + 2] * 0.11) / 255;
        if (l < 0.2) { out[i] = 26; out[i + 1] = 26; out[i + 2] = 32; } else { const v = 150 + l * 120; out[i] = Math.min(255, v + 6); out[i + 1] = Math.min(255, v + 2); out[i + 2] = Math.min(255, v - 10); } out[i + 3] = a; }
      Engine.addSprite(name, Object.assign({}, sp, { data: new Uint32Array(out.buffer), emit: null })); }
      if (typeof ANIM !== 'undefined' && ANIM.quadruped) ANIM.quadruped.add('p85_flintback'); } catch (e) { warnOnce('flintback', e); }
    // a pick lying where it was put down
    add('p85_pick', 48, 16, 0.18, (x) => { tine(x, 4, 12, 44, 9, 24, 7, 4, '#d8ccb4', '#fff8e8'); tine(x, 14, 11, 10, 2, 13, 6, 2.5, '#d8ccb4', '#fff8e8'); x.fillStyle = 'rgba(0,0,0,0.25)'; x.fillRect(6, 14, 38, 2); });
    // a niche with its tallow-cup, dark and lit
    const niche = (x, lit) => {
      x.fillStyle = '#cfc8b6'; x.fillRect(0, 0, 32, 40); x.fillStyle = '#8a8270'; x.beginPath(); x.moveTo(6, 40); x.lineTo(6, 14); x.quadraticCurveTo(16, 4, 26, 14); x.lineTo(26, 40); x.closePath(); x.fill();
      x.fillStyle = lit ? '#5a4a30' : '#3a3428'; x.beginPath(); x.moveTo(8, 40); x.lineTo(8, 15); x.quadraticCurveTo(16, 7, 24, 15); x.lineTo(24, 40); x.closePath(); x.fill();
      x.fillStyle = '#e8e2d2'; x.fillRect(11, 30, 10, 5); x.fillStyle = '#f4ecd0'; x.fillRect(12, 29, 8, 2);
      if (lit) { x.fillStyle = '#ffd070'; x.beginPath(); x.ellipse(16, 25, 2.4, 4.4, 0, 0, PI * 2); x.fill(); x.fillStyle = '#fff4c0'; x.beginPath(); x.ellipse(16, 26, 1.1, 2.2, 0, 0, PI * 2); x.fill(); }
    };
    add('p85_niche', 32, 40, 0.55, (x) => niche(x, false));
    add('p85_nichelit', 32, 40, 0.55, (x) => niche(x, true), (r, g, b, a) => a > 0 && r > 230 && g > 180);
    // the floorstone texture: white chalk with a band of black flint nodules low down; and plain chalk with pick-marks
    if (Engine.addTexture && !(Engine.textures && Engine.textures.t_p85_flint)) {
      const tex = (name, flint) => { const c = document.createElement('canvas'); c.width = 64; c.height = 64; const x = c.getContext('2d', { willReadFrequently: true });
        x.fillStyle = '#ddd7c6'; x.fillRect(0, 0, 64, 64);
        for (let i = 0; i < 90; i++) { x.fillStyle = 'rgba(150,140,120,' + (0.15 + h2(i, 3) * 0.25).toFixed(2) + ')'; x.fillRect(h2(i, 5) * 64 | 0, h2(i, 7) * 64 | 0, 1 + (h2(i, 9) * 3 | 0), 1); }
        for (let i = 0; i < 26; i++) { const px = h2(i, 13) * 64, py = h2(i, 17) * 64; x.strokeStyle = 'rgba(120,110,92,0.45)'; x.lineWidth = 1; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 3 + h2(i, 19) * 4, py + 5 + h2(i, 23) * 4); x.stroke(); }   // pick strokes
        if (flint) for (let i = 0; i < 9; i++) { const px = 4 + i * 7 + (h2(i, 29) - 0.5) * 3, py = 46 + (h2(i, 31) - 0.5) * 5; x.fillStyle = '#16161a'; x.beginPath(); x.ellipse(px, py, 4 + h2(i, 37) * 2, 3 + h2(i, 41) * 1.5, h2(i, 43), 0, PI * 2); x.fill(); x.fillStyle = 'rgba(160,170,190,0.5)'; x.fillRect(px - 2, py - 2, 2, 1); x.fillStyle = '#f2eee2'; x.fillRect(px - 4, py + 3, 8, 1); }
        try { Engine.addTexture(name, new Uint32Array(x.getImageData(0, 0, 64, 64).data.buffer.slice(0))); } catch (e) { warnOnce('tex ' + name, e); } };
      tex('t_p85_chalk', false); tex('t_p85_flint', true);
    }
  }

  // ---------------------------------------------------------------- the galleries
  const UPR = {
    foot: [23, 2, 28, 6], west: [4, 4, 22, 5], westdown: [6, 6, 7, 30], face: [3, 30, 12, 36], south: [25, 7, 26, 20], southwest: [8, 18, 24, 19],
    southeast: [27, 12, 40, 13], east: [29, 4, 46, 5], eastdown: [45, 6, 46, 26], far: [40, 27, 48, 34], deadA: [33, 6, 34, 10], deadB: [14, 6, 15, 11], deadC: [36, 14, 37, 22],
  };
  const NICHES_UP = [[23.4, 2.4], [4.4, 4.6], [6.4, 17.0], [25.6, 20.4], [40.4, 12.6], [45.6, 15.0], [44.0, 33.6], [5.0, 35.4]];
  const NICHES_DEEP = [[20.5, 3.4], [7.4, 12.0], [32.6, 12.0], [12.4, 25.6]];
  function buildUp(top) {
    const m = new GameMap(UP, TX.nameUp, 52, 40, { floor: 't_p20_chalk', floorTextures: ['t_p20_chalk', 't_flag'], ceil: 't_p85_chalk', fogDist: 7, ambient: 0.05, fogColor: [6, 6, 8], music: 'root', danger: 1, spawn: { x: 25.5, y: 4.0, dir: PI / 2 }, siphoned: true });
    m.rect(0, 0, 51, 39, 't_p85_chalk');
    m.ceilZ = 1.3; m.block(0, 0, 't_p85_chalk', m.ceilZ);   // low, but not so low the roof sits on your eyes
    for (const k in UPR) m.clear(...UPR[k]);
    m.set(25, 1, DOOR({ tex: 'd18_up', portal: top, label: TX.climbUp }));
    m.set(44, 35, DOOR({ tex: 'd18_down', portal: { map: DEEP, x: 20.5, y: 2.6, dir: PI / 2 }, label: TX.ladderDown }));
    NICHES_UP.forEach(([x, y], i) => m.deco('p85_niche', x, y, { radius: 0.15, scale: 1, solid: false, label: TX.niche, use: 'p85a_niche', _p85a: 'niche', _i: i, lightCol: [110, 84, 48] }));
    m.deco('sign', 27.6, 5.6, { radius: 0.15, scale: 0.5, label: TX.foot });
    m.deco('sign', 12.0, 5.6, { radius: 0.15, scale: 0.5, label: TX.gallery });
    m.deco('sign', 10.6, 34.6, { radius: 0.15, scale: 0.5, label: TX.face });
    // picks where they were put down; the further from the shaft, the more of them have rooted
    const PICKS = [[20.0, 4.6], [9.5, 5.2], [6.6, 10.5], [25.4, 14.0], [16.0, 18.6], [32.0, 12.6], [38.6, 4.6], [45.4, 9.6], [33.6, 8.6], [14.6, 9.6], [36.6, 19.6], [7.0, 26.0], [45.6, 22.0], [42.6, 30.6], [8.6, 33.4], [10.6, 31.6]];
    PICKS.forEach(([x, y], i) => { const d = Math.hypot(x - 25.5, y - 4); const rooted = d > 18 || i % 4 === 3; m.deco(rooted ? 'p85_rooting' : 'p85_pick', x, y, { radius: rooted ? 0.25 : 0.1, scale: 1, solid: rooted, label: rooted ? TX.rooting : TX.pick }); });
    // swarms in numbers in the dead ends and the far gallery; moths about the niches
    for (const [x, y] of [[33.5, 9.0], [14.5, 10.4], [36.5, 21.0], [8.0, 34.0], [11.0, 31.0], [46.0, 31.0], [41.0, 33.0]]) m.enemy('mites', x, y);
    for (const [x, y] of [[6.6, 18.4], [40.0, 13.0], [45.0, 16.6]]) m.enemy('hushmoth', x, y);
    m.add({ kind: 'item', item: 'cache', tier: 2, x: 4.2, y: 35.4, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- the deep: the white forest, the floorstone, the den
  const DEEPR = { foot: [18, 2, 22, 4], forest: [4, 5, 35, 22], seam: [6, 23, 26, 27], den: [27, 23, 36, 31], face: [8, 28, 14, 30] };
  const DEN = [31.5, 28.0];
  function buildDeep() {
    const m = new GameMap(DEEP, TX.nameDeep, 40, 34, { floor: 't_p20_chalk', floorTextures: ['t_p20_chalk', 't_flag'], ceil: 't_p85_chalk', fogDist: 14, ambient: 0.32, fogColor: [92, 90, 84], music: 'root', danger: 1, spawn: { x: 20.5, y: 2.6, dir: PI / 2 }, siphoned: true });
    m.rect(0, 0, 39, 33, 't_p85_chalk');
    m.ceilZ = 2.1; m.block(0, 0, 't_p85_chalk', m.ceilZ);
    for (const k in DEEPR) m.clear(...DEEPR[k]);
    m.set(20, 1, DOOR({ tex: 'd18_up', portal: { map: UP, x: 44.5, y: 33.6, dir: -PI / 2 }, label: TX.climbUpDeep }));
    // the floorstone: black flint along the foot of the seam gallery's walls
    for (let x = 6; x <= 26; x++) if (x < 10 || x > 11) m.set(x, 28, WALL('t_p85_flint'));   // a gap where they dug through into the old face
    for (let y = 23; y <= 27; y++) m.set(5, y, WALL('t_p85_flint'));
    // the forest: antler on a staggered grid, a winding way kept open through it from the foot to the seam
    const WAY = [[20.5, 4.5], [20.5, 8.5], [12.5, 10.5], [10.5, 16.5], [18.5, 19.5], [26.5, 16.5], [30.5, 20.5], [28.5, 23.5]];
    const wayD = (x, y) => { let b = 1e9; for (let i = 0; i < WAY.length - 1; i++) { const [ax, ay] = WAY[i], [bx, by] = WAY[i + 1], dx = bx - ax, dy = by - ay, t = Math.max(0, Math.min(1, ((x - ax) * dx + (y - ay) * dy) / (dx * dx + dy * dy))); b = Math.min(b, Math.hypot(ax + dx * t - x, ay + dy * t - y)); } return b; };
    for (let gy = 0; gy < 9; gy++) for (let gx = 0; gx < 16; gx++) {
      const x = 4.8 + gx * 2.0 + (gy % 2) * 1.0 + (h2(gx, gy) - 0.5) * 0.8, y = 5.8 + gy * 2.0 + (h2(gy, gx + 5) - 0.5) * 0.8;
      if (x > 35.2 || y > 22.2 || wayD(x, y) < 1.6) continue;
      m.deco(h2(gx, gy + 9) < 0.5 ? 'p85_antler' : 'p85_antler2', x, y, { radius: 0.32, scale: 0.85 + h2(gx + 3, gy) * 0.2, label: TX.antler });
    }
    NICHES_DEEP.forEach(([x, y], i) => m.deco('p85_niche', x, y, { radius: 0.15, scale: 1, solid: false, label: TX.niche, use: 'p85a_niche', _p85a: 'niche', _i: 8 + i, lightCol: [110, 84, 48] }));
    m.deco('sign', 22.6, 5.4, { radius: 0.15, scale: 0.55, label: TX.forest });
    m.deco('sign', 9.0, 26.8, { radius: 0.15, scale: 0.5, label: TX.seam });
    m.deco('sign', 28.4, 24.0, { radius: 0.15, scale: 0.5, label: TX.den });
    // the gear: the pick where it was put down at the forest's heart, the knife by the floorstone
    m.add({ kind: 'item', item: 'w_p85_pick', x: 18.6, y: 19.4, sprite: 'gear', scale: 0.5, yOff: 0, solid: false, label: TX.pickName });
    m.add({ kind: 'item', item: 'w_p85_knife', x: 11.0, y: 29.4, sprite: 'gear', scale: 0.45, yOff: 0, solid: false, label: TX.knifeName });
    m.add({ kind: 'item', item: 'cache', tier: 3, x: 35.0, y: 30.4, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.enemy('hushmoth', 12.0, 11.0); m.enemy('hushmoth', 30.0, 13.0);
    m.enemy('mites', 16.0, 25.0); m.enemy('mites', 22.0, 26.0); m.enemy('mites', 12.0, 29.0);
    m.enemy('fretcrawler', DEN[0], DEN[1], { _p85a: 'keeper' });
    m.baseCount = m.entities.length;
    return m;
  }

  // the way down: the open hollow on the drove road
  let SHAFT_TOP = null;
  function join(maps) {
    const H = typeof DROVE83 !== 'undefined' && maps[DROVE83.HOLLOWS]; if (!H || maps[UP]) return;
    const sh = H.entities.find((e) => e && e._p83d === 'shaft'); if (!sh) { warnOnce('shaft', 'no open hollow'); return; }
    const fr = typeof travelFreeNear === 'function' ? travelFreeNear(H, sh.x + 1.6, sh.y + 0.4) : [sh.x + 1.6, sh.y + 0.4];
    SHAFT_TOP = { map: DROVE83.HOLLOWS, x: fr ? fr[0] : sh.x + 1.6, y: fr ? fr[1] : sh.y + 0.4, dir: PI };
    maps[UP] = buildUp(Object.assign({}, SHAFT_TOP));
    maps[DEEP] = buildDeep();
  }

  // ---------------------------------------------------------------- the lamp, the niches, the keeper
  const f = () => G.flags, fint = (k) => { const v = Number(f()['p85a_' + k]); return Number.isFinite(v) ? v : 0; };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  const here = () => typeof G !== 'undefined' && G.map && (G.map.id === UP || G.map.id === DEEP);
  let lampEnt = null, oil = 0, lowSaid = false;
  function lamp() {
    if (!here()) { lampEnt = null; return; }
    if (!lampEnt || !G.map.entities.includes(lampEnt)) { lampEnt = { kind: 'deco', sprite: 'p83_none', x: 0, y: 0, scale: 0.3, solid: false, radius: 0.01, transient: true, _decor: true, _p85lamp: true, glow: 0.5, lightCol: [92, 76, 54] }; G.map.entities.push(lampEnt); }
    const c = Engine.cam, on = oil > 0; lampEnt.x = c.x + Math.cos(c.dir) * 0.35; lampEnt.y = c.y + Math.sin(c.dir) * 0.35; lampEnt.hidden = !on; lampEnt.glow = on ? 0.3 + 0.2 * Math.min(1, oil / OIL_MAX) : 0;
  }
  function sync() {
    if (typeof G === 'undefined' || !G.map || !G.flags) return;
    if (typeof DROVE83 !== 'undefined' && G.map.id === DROVE83.HOLLOWS) { for (const e of G.ents) if (e && e._p83d === 'shaft' && maps0()) { e.use = 'p85a_down'; e.label = TX.shaftUse; } return; }
    if (!here()) return;
    const bits = fint('niches');
    for (const e of G.ents) { if (!e) continue;
      if (e._p85a === 'niche') { const on = !!(bits & (1 << e._i)); e.sprite = on ? 'p85_nichelit' : 'p85_niche'; e.glow = on ? 0.7 : 0; e.label = on ? TX.nicheLit : TX.niche; }
      else if (e._p85a === 'keeper' && e.def && e.def.name !== TX.keeper) { const fresh = e.hp === e.def.hp; e.def = Object.assign({}, e.def, { name: TX.keeper, dmg: [6, 12], xp: 160, speed: 1.6 }); e.hpMax = 130; if (fresh) e.hp = 130; e.scale = 1.9; e.name = TX.keeper; if (Engine.sprites.p85_flintback) { e.def.sprite = 'p85_flintback'; e.sprite = 'p85_flintback'; } } }
    if (G.map.id === DEEP && !fint('seen') && Math.hypot(Engine.cam.x - DEN[0], Engine.cam.y - DEN[1]) < 5.5) { f().p85a_seen = 1; say(TX.keeperSeen, 'bad', 9000); }
  }
  const maps0 = () => !!(G.maps && G.maps[UP]);
  function tick(dt) {
    if (!here()) return;
    const was = oil; oil = Math.max(0, oil - dt); f().p85a_oil = Math.round(oil);
    if (was > 15 && oil <= 15 && !lowSaid) { lowSaid = true; say(TX.low, 'warn', 4000); }
    if (was > 0 && oil <= 0) say(TX.out, 'bad', 6000);
    // a lit lamp holds the Hush off: stillness counts for half while it burns
    if (oil > 0 && G.stillT > 0) G.stillT = Math.max(0, G.stillT - dt * 0.5);
    lamp();
  }
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !/^p85a_/.test(e.use) || typeof G === 'undefined' || !G.map) return false;
    if (e.use === 'p85a_down') { say(TX.climbDown, '', 4000); loadMap(UP, { x: 25.5, y: 4.0, dir: PI / 2 }); if (!G.flags.p85a_journal) { G.flags.p85a_journal = 1; try { journal('side', TX.journal); } catch (err) { /* */ } } return true; }
    if (e.use === 'p85a_niche') {
      const bits = fint('niches'), on = !!(bits & (1 << e._i));
      f().p85a_niches = bits | (1 << e._i); oil = OIL_MAX; f().p85a_oil = OIL_MAX; lowSaid = false;
      say(on ? TX.filled : TX.lit, 'good', 4500); sync(); lamp(); return true;
    }
    return false;
  }

  function wire() {
    gear(); art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { gear(); art(); join(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { lampEnt = null; if (here()) { const v = fint('oil'); oil = Math.max(0, Math.min(OIL_MAX, v)); lamp(); } sync(); } catch (e) { warnOnce('load', e); } return r; }; }
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { if (G.state === 'play') tick(Number(dt) || 0); sync(); } catch (e) { /* next frame */ } return r; }; }
  }
  wire();

  return { UP, DEEP, TX, TEXTS, UPR, DEEPR, NICHES_UP, NICHES_DEEP, DEN, OIL_MAX, buildUp, buildDeep, join, sync, useOwn, tick, oil: () => oil, setOil: (v) => { oil = v; }, shaftTop: () => SHAFT_TOP, gear, art };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ANTLER85;
if (typeof window !== 'undefined') window.ANTLER85 = ANTLER85;
