// ============================================================
//  mast123 — Phase 123: the Consortium's mooring mast, where Book One has it.
//
//  "The Consortium's mooring mast was a hundred and twenty feet of riveted iron on four splayed legs, sunk into the
//  bedrock of the quarry rim." (Book One, l. 3598.) "Above the roofs to the north, where the Consortium's mooring mast
//  stood over the quarry like a gallows, a skyship was riding at anchor." (l. 672, from the square.)
//
//  The game had a timber pylon on the east side of Oakhaven's square. The owner, 23 Nov: "match the book and change the
//  map." So:
//    THE RIM. The mast stands on the quarry's rim: the north edge of the clearing ("Outside the Hedge"), beside the
//      headframe, at AT. The game's `quarry` map is the workings under the headframe, with a stone ceiling: the rim is
//      the open ground above them. Riveted iron on four splayed legs, twelve units high (the Chapel's tower is 4.1), the
//      mast-ladder up the middle of its face, the legs into stone. Its ladder (use 'crates', the old label) boards the
//      Kestrel's hold; its trigger ('mast') is js/game.js's. Added after every older entity and trigger of the clearing
//      (saves keep both by their place in the list): this file is the last script, so its buildAllMaps wrapper is the
//      outermost.
//    THE SHIP rides at it a hundred feet up, turning slowly on her line (js/smalllife.js, MAST). Her lamps show at night.
//    THE CUT. Once the Kestrel has come down over the North Gate for Grab the Line (js/rope45.js stage 1 on, or the
//      Greening's scene past it, or Part Three), the mast is drawn as the book leaves it: a young oak up between the legs,
//      the north leg bent, the cable cut (l. 3598-3604). Nothing the player does brings that on sooner.
//    SEEN FROM OUTSIDE ITS MAP. From Oakhaven and from the Watch Downs the mast and the ship are drawn where they stand
//      (js/horizon20.js's world frame: the North Gate ties the clearing to the town), as far copies handed to the
//      renderer with the frame's entities (never put in a map's list, never saved, never picked). The mast and the
//      ship carry `farSee`: js/engine.js, js/r3d21.js and js/sprites21.js do not drop them past the fog, so they are
//      seen hazed at any distance, the tallest thing for miles, in the classic view and the 3D view alike.
//    THE EAST SIDE OF THE SQUARE (js/maps.js) is the carters' standing [PROPOSED]: cobbles, a mounting-block and a water
//      trough in the two old slots, and a hitching rail added here.
//    OLD SAVES. A save made at the foot of the old mast-ladder, with the North Gate open and before the Greening, loads
//      at the foot of the ladder on the rim; with the gate still shut it loads where it was (the carters' standing), so
//      Harrow's gate is not opened for anyone. Every save made from now on carries flags.p123 and is never moved.
//
//  Art: drawn in code, pixel by pixel; the rust and the oak's leaves come from a hash, never from a random draw.
//  Switch: GFX.kestrelMoored (as before) hides the ship, here and on the rim. Text: TX (French: tools/i18n/p123-mast.tsv).
// ============================================================
'use strict';

const MAST123 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('mast123: ' + k + ' failed', e); } };

  const TX = {
    where: S('Out through the North Gate, and up to the quarry rim. You cannot miss it.'),
    block: S('A mounting-block of three worn steps, where the carters stand their horses.'),
    trough: S('A stone water trough. The water in it is very still.'),
    rail: S('A hitching rail, the bar polished by a great many reins.'),
  };

  // ---------------------------------------------------------------- where it stands
  const MAP = 'clearing';
  const AT = { x: 13.0, y: 3.6 };              // the foot, on the rim, west of the headframe (the clearing's north edge)
  const H = 12;                                 // a hundred and twenty feet; the Chapel's tower is 4.1, an oak about 2
  const LADDER = { x: 13.0, y: 4.45 };          // the foot of the mast-ladder, on the town's side
  const TRIG = { x: 13.0, y: 5.3, r: 2.2 };
  const FOOT = { x: 13.0, y: 5.6, dir: -Math.PI / 2 };   // where an old save at the old mast is put down
  const OLD = { x: 37, y: 21, r: 3 };          // the old pylon on the east side of Oakhaven's square
  // the rim's frame in other maps (js/horizon20.js OFF: oak = clearing + (3, -35); the Downs: clearing = downs - 43, -2)
  const FRAMES = { oakhaven: [3, -35], p20_downs: [43, 2] };
  const RAIL = { x: 37.0, y: 19.6 };           // the carters' standing (Oakhaven)

  // ---------------------------------------------------------------- the story's clock
  const F = () => (hasG() ? G.flags : {});
  // the cable is cut once she has come down over the North Gate (Book One l. 3604-3644), and stays cut
  function cut() {
    const f = F();
    return !!(f.part3 || f.part4 || f.escaped || (f.greening && ((f.r45 | 0) >= 1 || (f.g44 | 0) >= 6)));
  }
  const state = () => (cut() ? 'taken' : 'moored');
  const spriteNow = () => (cut() ? 'p123_mast_oak' : 'p123_mast');

  // ---------------------------------------------------------------- the art (pixel by pixel, no randomness)
  const rgb = (r, g, b) => ((255 << 24) | ((b & 255) << 16) | ((g & 255) << 8) | (r & 255)) >>> 0;
  function hash(x, y, s) { let h = Math.imul(x | 0, 374761393) ^ Math.imul(y | 0, 668265263) ^ Math.imul(s | 0, 1442695041); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function canvas(w, h) {
    const d = new Uint32Array(w * h);
    const P = { w, h, d,
      set(x, y, c) { x = Math.round(x); y = Math.round(y); if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = c; },
      get(x, y) { x = Math.round(x); y = Math.round(y); return x >= 0 && y >= 0 && x < w && y < h ? d[y * w + x] : 0; },
      rect(x0, y0, rw, rh, c) { for (let y = y0; y < y0 + rh; y++) for (let x = x0; x < x0 + rw; x++) P.set(x, y, c); },
      // a line `wd` pixels across; col(i, t) picks the colour for the i-th pixel across (0 = left/top edge) at t along
      line(x0, y0, x1, y1, wd, col) {
        const n = Math.max(1, Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0))));
        const steep = Math.abs(y1 - y0) >= Math.abs(x1 - x0);
        for (let k = 0; k <= n; k++) {
          const t = k / n, x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
          for (let i = 0; i < wd; i++) { const o = i - (wd - 1) / 2; if (steep) P.set(x + o, y, col(i, t)); else P.set(x, y + o, col(i, t)); }
        }
      },
    };
    return P;
  }
  const IRON = rgb(59, 63, 70), IRON_LIT = rgb(92, 96, 104), IRON_DK = rgb(36, 38, 43), BACK = rgb(44, 47, 53), BACK_DK = rgb(32, 34, 39);
  const RIVET = rgb(150, 154, 162), RUST = [rgb(124, 74, 44), rgb(147, 87, 47), rgb(94, 58, 36)], STONE = rgb(110, 106, 98), STONE_DK = rgb(84, 80, 74);
  const LADDER_C = rgb(70, 74, 82), RUNG = rgb(88, 92, 100);
  const ART = { legs: 4, rivets: 0, W: 144, Hp: 384 };

  // the four legs, foot to head (sprite px): the front pair outermost, the back pair inside them and darker
  const W0 = 144, H0 = 384, HEAD = 26;
  const LEGS = [
    { x0: 9, x1: 63, front: true }, { x0: 135, x1: 81, front: true },    // front left, front right
    { x0: 37, x1: 66, front: false }, { x0: 107, x1: 78, front: false },  // back left, back right (the north leg)
  ];
  const legX = (L, y) => L.x0 + (L.x1 - L.x0) * (H0 - 1 - y) / (H0 - 1 - HEAD);
  // the girder levels: panels shorten as the legs come together
  const LEVELS = (() => { const out = []; const q = 0.84, n = 10, tot = (1 - Math.pow(q, n)) / (1 - q); let acc = 0; for (let k = 0; k <= n; k++) { out.push(Math.round(H0 - 1 - (H0 - 1 - HEAD) * acc / tot)); acc += Math.pow(q, k); } return out; })();

  function paintMast(withOak) {
    const P = canvas(W0, H0), joints = [];
    let rivets = 0;
    const bend = (L, y) => {   // the north leg goes from straight to not-straight above the oak (l. 3598)
      if (!withOak || L !== LEGS[3] || y > 300 || y < 150) return legX(L, y);
      const t = (300 - y) / 150; return legX(L, y) + 16 * Math.sin(Math.PI * t) * (1 - 0.3 * t);
    };
    const lean = (y) => (withOak ? Math.round(7 * Math.pow((H0 - y) / H0, 2)) : 0);   // "and then the mast leaned"
    const leg = (L) => {
      for (let y = HEAD; y < H0 - 3; y++) {
        const x = bend(L, y) + lean(y), wd = L.front ? 5 : 4;
        for (let i = 0; i < wd; i++) P.set(x - (wd - 1) / 2 + i, y, L.front ? (i === 0 ? IRON_LIT : i === wd - 1 ? IRON_DK : IRON) : (i === wd - 1 ? BACK_DK : BACK));
      }
    };
    // back face first (behind), then the front face over it
    const brace = (A, B, front) => {
      for (let k = 1; k < LEVELS.length - 1; k++) {
        const ya = LEVELS[k], yb = LEVELS[k + 1];
        const ax = bend(A, ya) + lean(ya), bx = bend(B, ya) + lean(ya), ax2 = bend(A, yb) + lean(yb), bx2 = bend(B, yb) + lean(yb);
        const c = front ? IRON : BACK, c2 = front ? IRON_DK : BACK_DK;
        P.line(ax, ya, bx, ya, front ? 3 : 2, (i) => (i === 0 ? (front ? IRON_LIT : BACK) : i === (front ? 2 : 1) ? c2 : c));   // the girder
        P.line(ax, ya, bx2, yb, 2, (i) => (i ? c2 : c)); P.line(bx, ya, ax2, yb, 2, (i) => (i ? c2 : c));                      // the cross
        if (front) joints.push([ax, ya], [bx, ya], [(ax + bx2) / 2, (ya + yb) / 2]);
      }
    };
    leg(LEGS[2]); leg(LEGS[3]); brace(LEGS[2], LEGS[3], false);
    // the side faces, seen edge-on: a zig-zag between each front leg and the back leg beside it
    for (const [A, B] of [[LEGS[0], LEGS[2]], [LEGS[1], LEGS[3]]]) for (let k = 1; k < LEVELS.length - 1; k++) {
      const ya = LEVELS[k], yb = LEVELS[k + 1];
      P.line(bend(A, ya) + lean(ya), ya, bend(B, yb) + lean(yb), yb, 1, () => BACK);
    }
    // the mast-ladder up the middle of the face, from a man's height off the ground to the head
    const mid = (y) => (legX(LEGS[0], y) + legX(LEGS[1], y)) / 2 + lean(y);
    for (let y = HEAD + 2; y < H0 - 16; y++) { P.set(mid(y) - 4, y, LADDER_C); P.set(mid(y) + 4, y, LADDER_C); if ((y % 6) === 0) for (let x = -3; x <= 3; x++) P.set(mid(y) + x, y, RUNG); }
    leg(LEGS[0]); leg(LEGS[1]); brace(LEGS[0], LEGS[1], true);
    // rivets: down the middle of each front leg, and two at every joint of the face
    for (const L of [LEGS[0], LEGS[1]]) for (let y = HEAD + 4; y < H0 - 8; y += 9) { P.set(bend(L, y) + lean(y), y, RIVET); rivets++; }
    for (const [x, y] of joints) { P.set(x - 1, y - 1, RIVET); P.set(x + 1, y + 1, RIVET); rivets += 2; }
    // rust at the joints, and running down from them
    for (const [jx, jy] of joints) for (let dy = -3; dy <= 9; dy++) for (let dx = -3; dx <= 3; dx++) {
      if (dy < 0 && dx * dx + dy * dy > 9) continue;
      const x = Math.round(jx + dx), y = Math.round(jy + dy), o = y * W0 + x; if (x < 0 || y < 0 || x >= W0 || y >= H0) continue;
      const c = P.d[o]; if (!c || c === RIVET) continue;
      const k = hash(x, y, 123), keep = dy <= 2 ? 0.42 : 0.42 - dy * 0.04;
      if (k < keep) P.d[o] = RUST[(k * 97 | 0) % 3];
    }
    // the head: a platform with a rail, the mooring sheave, and where the cable goes
    const hx = mid(HEAD);
    P.rect(Math.round(hx - 22), HEAD - 6, 45, 4, IRON_DK); P.rect(Math.round(hx - 22), HEAD - 6, 45, 1, IRON_LIT);
    for (let x = -22; x <= 22; x += 5) P.rect(Math.round(hx + x), HEAD - 14, 1, 8, IRON);
    P.rect(Math.round(hx - 22), HEAD - 14, 45, 1, IRON);
    for (let y = 2; y < HEAD - 6; y++) { const r = y < 8 ? 2 : 3; for (let x = -r; x <= r; x++) P.set(hx + x, y, x === -r ? IRON_LIT : IRON); }
    for (let a = 0; a < 40; a++) { const t = a / 40 * Math.PI * 2; P.set(hx + 6 + Math.cos(t) * 4, 10 + Math.sin(t) * 4, IRON_DK); }
    // the legs go into stone: a footing at each, no wider than the leg's spread allows
    for (const L of LEGS) { const x = Math.round(legX(L, H0 - 4)); P.rect(x - 5, H0 - 5, 11, 5, STONE); P.rect(x - 5, H0 - 1, 11, 1, STONE_DK); }
    if (withOak) {
      // the young oak up between the legs: a trunk out of the rock, a crown pushing through the lattice
      for (let y = 200; y < H0 - 1; y++) { const wd = 6 + ((H0 - y) < 40 ? 4 : 0); for (let i = 0; i < wd; i++) P.set(72 - wd / 2 + i + Math.round(3 * Math.sin(y / 23)), y, i === 0 ? rgb(92, 70, 44) : rgb(66, 50, 32)); }
      for (const [bx, by, ex, ey] of [[72, 260, 40, 214], [73, 240, 106, 196], [72, 220, 56, 170], [72, 214, 92, 150]]) P.line(bx, by, ex, ey, 3, () => rgb(70, 52, 34));
      const LEAF = [rgb(52, 92, 46), rgb(72, 118, 58), rgb(38, 70, 36), rgb(96, 140, 70)];
      for (const [cx, cy, r] of [[72, 190, 44], [48, 210, 26], [100, 196, 28], [70, 150, 30], [86, 230, 22]]) for (let y = cy - r; y <= cy + r; y++) for (let x = cx - r; x <= cx + r; x++) {
        const q = ((x - cx) * (x - cx) + (y - cy) * (y - cy)) / (r * r), k = hash(x, y, 7);
        if (q < 1 - 0.35 * k) P.set(x, y, LEAF[(k * 31 | 0) % 4]);
      }
      // the cable, cut, hanging from the head
      for (let y = HEAD - 2; y < 120; y++) P.set(hx + 7 + Math.round(2 * Math.sin(y / 17)), y, rgb(138, 134, 120));
    }
    if (!withOak) ART.rivets = rivets;
    return { w: W0, h: H0, data: P.d, cx: 0.5 };
  }

  // the carters' standing: a mounting-block, a trough, a hitching rail
  function paintBlock() {
    const P = canvas(48, 36);
    const st = [rgb(128, 122, 112), rgb(108, 103, 95), rgb(90, 86, 80)];
    for (let s = 0; s < 3; s++) { const x0 = 4 + s * 12, y0 = 8 + s * 9; P.rect(x0, y0, 40 - s * 12, 36 - y0, st[s]); P.rect(x0, y0, 40 - s * 12, 1, rgb(150, 144, 134)); }
    for (let i = 0; i < 40; i++) { const x = 4 + (hash(i, 1, 9) * 40 | 0), y = 9 + (hash(i, 2, 9) * 26 | 0); if (P.get(x, y)) P.set(x, y, rgb(96, 92, 84)); }
    return { w: 48, h: 36, data: P.d };
  }
  function paintTrough() {
    const P = canvas(64, 32);
    P.rect(2, 8, 60, 24, rgb(112, 108, 100)); P.rect(2, 8, 60, 2, rgb(146, 140, 130)); P.rect(6, 10, 52, 6, rgb(58, 74, 82)); P.rect(8, 11, 30, 1, rgb(110, 132, 138));
    P.rect(2, 30, 60, 2, rgb(84, 80, 74)); for (let i = 0; i < 30; i++) { const x = 3 + (hash(i, 3, 11) * 58 | 0), y = 17 + (hash(i, 4, 11) * 12 | 0); P.set(x, y, rgb(94, 98, 78)); }
    return { w: 64, h: 32, data: P.d };
  }
  function paintRail() {
    const P = canvas(80, 40);
    const wood = rgb(98, 70, 42), dk = rgb(66, 46, 28), lit = rgb(132, 98, 60);
    for (const x of [6, 70]) { P.rect(x, 8, 5, 32, wood); P.rect(x, 8, 1, 32, lit); P.rect(x + 4, 8, 1, 32, dk); }
    P.rect(4, 10, 72, 4, wood); P.rect(4, 10, 72, 1, lit); P.rect(4, 13, 72, 1, dk);
    for (const x of [26, 50]) { for (let a = 0; a < 20; a++) { const t = a / 20 * Math.PI * 2; P.set(x + Math.cos(t) * 2.5, 17 + Math.sin(t) * 2.5, rgb(70, 72, 76)); } }
    return { w: 80, h: 40, data: P.d };
  }

  // the foot of the mast-ladder: iron rails and rungs, as on the mast (its deco keeps the sprite name 'ladder' it always had)
  function paintLadderFoot() {
    const P = canvas(32, 96);
    for (let y = 0; y < 94; y++) { P.set(9, y, LADDER_C); P.set(10, y, IRON_LIT); P.set(22, y, LADDER_C); P.set(21, y, IRON_DK); if (y % 8 === 3) for (let x = 11; x <= 20; x++) P.set(x, y, RUNG); }
    for (const [x, y] of [[9, 20], [22, 52], [10, 70]]) { P.set(x, y, RUST[0]); P.set(x, y + 1, RUST[2]); }
    P.rect(6, 92, 20, 4, STONE); P.rect(6, 95, 20, 1, STONE_DK);
    return { w: 32, h: 96, data: P.d };
  }
  // the Kestrel at night: her lanterns, bow and stern and the one in her hold (l. 1715), big enough to show from the town
  const NIGHT = (h) => h < 6.5 || h >= 19.5;
  function lampsOf(sp) {
    const d = new Uint32Array(sp.data), m = new Uint8Array(sp.w * sp.h), W = sp.w, row = 44;
    let x0 = -1, x1 = -1; for (let x = 0; x < W; x++) if ((d[row * W + x] >>> 24) > 100) { if (x0 < 0) x0 = x; x1 = x; }
    if (x0 < 0) return null;
    const LAMP = rgb(255, 214, 130), CORE = rgb(255, 244, 214);
    for (const [cx, cy, r] of [[x0 + 5, row, 4], [x1 - 5, row, 4], [(x0 + x1) / 2, 52, 5]]) for (let y = -r; y <= r; y++) for (let x = -r; x <= r; x++) {
      if (x * x + y * y > r * r) continue; const X = Math.round(cx + x), Y = Math.round(cy + y); if (X < 0 || Y < 0 || X >= W || Y >= sp.h) continue;
      d[Y * W + X] = x * x + y * y <= 2 ? CORE : LAMP; m[Y * W + X] = 1;
    }
    for (let k = 0; k < m.length; k++) if (sp.emit && sp.emit[k]) m[k] = 1;
    return { sp: { w: W, h: sp.h, data: d, hs: sp.hs, cx: sp.cx, dy: sp.dy }, m };
  }
  function installArt() {
    if (typeof Engine === 'undefined' || !Engine.addSprite) return;
    Engine.addSprite('p123_mast', paintMast(false));
    Engine.addSprite('p123_mast_oak', paintMast(true));
    Engine.addSprite('p123_block', paintBlock());
    Engine.addSprite('p123_trough', paintTrough());
    Engine.addSprite('p123_rail', paintRail());
    Engine.addSprite('p123_ladderfoot', paintLadderFoot());
    // the Kestrel's lift-tanks glow the faint cobalt of drift-glass (Book One l. 674): their bright cores give their own light
    for (let i = 0; i < 5; i++) {
      const sp = Engine.sprites['kestrel_m' + i]; if (!sp || sp.emit) continue;
      const m = new Uint8Array(sp.w * sp.h); let n = 0;
      for (let k = 0; k < m.length; k++) { const p = sp.data[k]; if ((p >>> 24) < 100) continue; const r = p & 255, g = (p >> 8) & 255, b = (p >> 16) & 255; if (b > 200 && b > r + 60) { m[k] = 1; n++; } }   // the cobalt of her drift-glass tanks (js/smalllife.js)
      if (n && Engine.setEmissive) Engine.setEmissive('kestrel_m' + i, m);
      const L = lampsOf(Engine.sprites['kestrel_m' + i]);
      if (L) { Engine.addSprite('p123_kestrel_night' + i, L.sp); if (Engine.setEmissive) Engine.setEmissive('p123_kestrel_night' + i, L.m); }
    }
  }
  try { installArt(); } catch (e) { warnOnce('art', e); }

  // ---------------------------------------------------------------- the maps
  // a standing thing joins a map's base entities (the ones saves keep by place), after every older one
  function addBase(m, e) {
    if (m.baseCount == null) return e;
    const i = m.entities.lastIndexOf(e); if (i < 0) return e;
    m.entities.splice(i, 1); m.entities.splice(m.baseCount, 0, e); m.baseCount++;
    return e;
  }
  function buildRim(cl) {
    if (!cl || cl.id !== MAP || cl._p123) return;
    cl._p123 = true;
    addBase(cl, cl.deco('p123_mast', AT.x, AT.y, { radius: 0.6, scale: H, nopick: true, farSee: true, glow: 0.3, _p123: 'mast' }));
    addBase(cl, cl.deco('ladder', LADDER.x, LADDER.y, { radius: 0.2, scale: 1.6, use: 'crates', label: 'The Drift-Kestrel\'s mast-ladder, up to her hold', animSprite: 'p123_ladderfoot', _p123: 'ladder' }));
    cl.trigger(TRIG.x, TRIG.y, TRIG.r, 'mast');
    layStone(cl);
  }
  // where the legs go into the bedrock of the rim. The painted ground (js/painted20.js) lays a map's floor afresh from its
  // own copy whenever its switches change, and that copy was taken before this stone was laid; so the stone is laid again
  // after every such change (the listener below is registered after painted20's, so it runs after it).
  function layStone(cl) {
    if (!cl || cl.id !== MAP || !cl._p123 || !cl.floorCells) return;
    const st = cl.floorTextures ? cl.floorTextures.indexOf('t_stone') : -1;
    if (st >= 0) for (let y = 2; y <= 4; y++) for (let x = 12; x <= 14; x++) cl.setFloor(x, y, st);
  }
  if (typeof GFX !== 'undefined' && typeof GFX.onChange === 'function') GFX.onChange(() => { try { if (typeof G !== 'undefined' && G && G.maps) layStone(G.maps[MAP]); } catch (e) { /* the stone is dressing; never break a settings change */ } });
  function buildStanding(oak) {
    if (!oak || oak.id !== 'oakhaven' || oak._p123) return;
    oak._p123 = true;
    addBase(oak, oak.deco('p123_rail', RAIL.x, RAIL.y, { radius: 0.3, scale: 0.7, label: TX.rail, _p123: 'rail' }));
  }
  function syncMast(m) {
    if (!m || m.id !== MAP) return;
    const s = spriteNow(); for (const e of m.entities) if (e && e._p123 === 'mast' && e.sprite !== s) e.sprite = s;
  }

  // ---------------------------------------------------------------- far copies (Oakhaven, the Downs)
  let farOn = true;
  const far = { mast: { kind: 'deco', sprite: 'p123_mast', x: 0, y: 0, scale: H, solid: false, nopick: true, transient: true, _decor: true, farSee: true, glow: 0.3, yOff: 0, _p123: 'mast' },
    ship: { kind: 'deco', sprite: 'kestrel_m2', x: 0, y: 0, scale: 1, solid: false, nopick: true, transient: true, _decor: true, farSee: true, glow: 0.3, yOff: 0, _p123: 'ship' } };
  let lastList = [];
  function inFrame(id) { const o = FRAMES[id]; if (id === MAP) return { x: AT.x, y: AT.y }; return o ? { x: AT.x + o[0], y: AT.y + o[1] } : null; }
  // the ground the renderers will stand a sprite on, out past a map's edge (they take the nearest cell's)
  function floorAt(m, x, y) { try { return m.groundAt ? m.groundAt(Math.min(m.w - 0.01, Math.max(0, x)), Math.min(m.h - 0.01, Math.max(0, y))) : 0; } catch (e) { return 0; } }
  // Each far copy is drawn as the true thing seen from this eye: scaled about the eye (a homothety), so it covers the same
  // pixels at every pitch in both renderers, but stood just inside the map's edge along the line of sight. Everything the
  // map holds is nearer than that (so it hides the copy where it hides the mast), and the haze is a near thing's haze: at
  // its true distance the renderers' fog would leave a pale ghost of the tallest thing for miles.
  function eyeK(m, cx, cy, tx, ty) {
    const dx = tx - cx, dy = ty - cy, D = Math.hypot(dx, dy); if (D < 1e-6) return 1;
    let t1 = Infinity;
    if (dx > 0) t1 = Math.min(t1, (m.w - cx) / dx); else if (dx < 0) t1 = Math.min(t1, (0 - cx) / dx);
    if (dy > 0) t1 = Math.min(t1, (m.h - cy) / dy); else if (dy < 0) t1 = Math.min(t1, (0 - cy) / dy);
    const exitD = t1 * D;   // how far along the sight-line the map's edge is
    return Math.max(0.02, Math.min(1, (exitD - 0.6) / D));
  }
  function place(e, m, k, cam, tx, ty, zb, scale) {
    e.x = cam.x + k * (tx - cam.x); e.y = cam.y + k * (ty - cam.y); e.scale = scale * k;
    const cz = cam.z == null ? 0.5 : cam.z, z = cz + k * (zb - cz);
    e.animLift = 0; e.yOff = floorAt(m, e.x, e.y) - z;
    e._trueD = Math.hypot(tx - cam.x, ty - cam.y); e._tx = tx; e._ty = ty;
  }
  const night = () => hasG() && typeof G.tod === 'number' && NIGHT(G.tod * 24);
  // the moored ship on the rim's own map (js/smalllife.js poses her): her lanterns after dark
  function nightShip() {
    const SL = typeof SMALLLIFE !== 'undefined' ? SMALLLIFE : null, e = SL && SL.ship && SL.ship.e; if (!e || !e.animSprite) return;
    const m = /(\d)$/.exec(e.animSprite); if (!m) return;
    const want = (night() ? 'p123_kestrel_night' : 'kestrel_m') + m[1]; if (e.animSprite !== want && Engine.sprites[want]) e.animSprite = want;
  }
  // The far view draws it at the height the book's line needs ("above the roofs to the north ... like a gallows",
  // l. 672), as the horizon's other landmarks are drawn: the copy grows with distance, smoothly, from its true size at
  // the North Gate (about 33 cells off) to 1.8 times it 58 cells off and beyond, so it never pops as you walk.
  const FAR_FROM = 33, FAR_TO = 58, FAR_MAX = 1.8;
  const grow = (D) => 1 + (FAR_MAX - 1) * Math.max(0, Math.min(1, (D - FAR_FROM) / (FAR_TO - FAR_FROM)));
  function farList() {
    lastList = [];
    if (!farOn || !hasG() || !G.map || !G.map.outdoor || typeof Engine === 'undefined') return lastList;
    const o = FRAMES[G.mapId]; if (!o) return lastList;
    const m = G.map, cam = Engine.cam, fm = far.mast, tx = AT.x + o[0], ty = AT.y + o[1];
    const g = grow(Math.hypot(tx - cam.x, ty - cam.y));
    fm.sprite = spriteNow(); place(fm, m, eyeK(m, cam.x, cam.y, tx, ty), cam, tx, ty, 0, H * g); fm._grow = g;
    lastList.push(fm);
    const SL = typeof SMALLLIFE !== 'undefined' ? SMALLLIFE : null;
    if (SL && SL.shipPose && !cut() && typeof GFX !== 'undefined' && GFX.kestrelMoored) {
      const T = typeof ANIM !== 'undefined' && ANIM.T ? ANIM.T : 0, p = SL.shipPose(T), fs = far.ship;
      const sx = tx + (p.x - AT.x) * g, sy = ty + (p.y - AT.y) * g;   // she rides at the head of the grown mast
      place(fs, m, eyeK(m, cam.x, cam.y, sx, sy), cam, sx, sy, p.lift * g, (SL.SHIP ? SL.SHIP.scale : 3.4) * g);
      fs.animSkew = p.skew;
      const v = SL.shipView(p.h, sx, sy); fs.animSprite = (night() ? 'p123_kestrel_night' : 'kestrel_m') + v.view; fs.animFlip = v.flip;
      lastList.push(fs);
    }
    return lastList;
  }

  // ---------------------------------------------------------------- old saves
  function migrate(old) {
    if (!hasG()) return;
    const f = G.flags;
    if (old && G.mapId === 'oakhaven' && !f.greening && !f.escaped && !f.part3 && !f.part4 && f.gate_open && typeof Engine !== 'undefined'
      && Math.hypot(Engine.cam.x - OLD.x, Engine.cam.y - OLD.y) < OLD.r && G.maps && G.maps[MAP] && typeof loadMap === 'function') {
      loadMap(MAP, { x: FOOT.x, y: FOOT.y, dir: FOOT.dir });
    }
    f.p123 = 1;
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () { const maps = _b.apply(this, arguments); try { buildRim(maps[MAP]); buildStanding(maps.oakhaven); } catch (e) { warnOnce('maps', e); } return maps; };
    }
    if (typeof Engine !== 'undefined' && Engine.render) {
      const _r = Engine.render;
      Engine.render = function (ents, tod, opts) {
        let list = ents;
        try { if (hasG() && G.map) { syncMast(G.map); nightShip(); const l = farList(); if (l.length && Array.isArray(ents)) list = ents.concat(l); } } catch (e) { warnOnce('far', e); }
        return _r.call(this, list, tod, opts);
      };
    }
    if (typeof snapshotGame === 'function') {
      const _s = snapshotGame;
      snapshotGame = function () { try { if (hasG()) G.flags.p123 = 1; } catch (e) { /* none */ } return _s.apply(this, arguments); };
    }
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function (d) {
        const old = !(d && d.flags && d.flags.p123);
        const r = _rg.apply(this, arguments);
        try { migrate(old); } catch (e) { warnOnce('migrate', e); }
        return r;
      };
    }
  }
  try { wire(); } catch (e) { console.warn('mast123 failed to wire', e); }

  return { TX, TEXTS, MAP, AT, H, LADDER, TRIG, FOOT, OLD, FRAMES, RAIL, ART, LEVELS, cut, state, spriteNow, inFrame, farList: () => lastList, buildFar: farList,
    setFar(on) { farOn = !!on; }, migrate, buildRim, buildStanding, paintMast };
})();
if (typeof window !== 'undefined') window.MAST123 = MAST123;
