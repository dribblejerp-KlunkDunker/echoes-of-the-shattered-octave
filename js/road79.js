// ============================================================
//  road79 — Phase 79 pilot, "the long road": the Greenroot road becomes a place.
//
//  Owner, 11 Nov: "it should take awhile to walk from place to place this is supposed to be a massive world not something
//  tiny", "Put three kinds of thing on each stretch: something to find (a ruin, a cache, a marker with a line of lore),
//  someone to meet (a traveller or keeper with a small task), and something that only happens at night or in bad
//  weather", and of the books' two days' walk from Greenroot Hamlet to Oakhaven: "yes they did walk for days so keep
//  that. We just have to be sure that there is stuff to do on that walk."
//
//  Until now the door marked "The Greenroot road" in the country Outside the Hedge opened straight onto Greenroot. This
//  module puts the road itself between them: one long map (ROAD79.MAP), its west gate where that door led from and its
//  east gate where Greenroot's door led from. Nothing else about either place changes. On it:
//    the land   the road is never straight for long (owner: "lakes, streams, cliffs and on and on"): it splashes through a
//               beck, swings past the toll-house, climbs Oak Hill, fords the stream, goes along a mere and turns up through
//               the Narrows between two crags. Off the road: the Shelf, a scarp the stream falls over (the Leap, with a
//               worn path up to it), a tarn, an eyot in the mere, copses, willows, scree, and no level ground;
//    to find    three milestones (one fallen); the ruin of a toll-house with a strongbox in it; a great oak; the Leap; a
//               cairn; a second strongbox on the eyot, for whoever finds the stones out to it;
//    to meet    a road-mender at the ford by day, who will tell you the half-way stone is down again (setting it up is the
//               small task, done at the stone); a drover at a watch-fire by the ruin by night;
//    by night or in bad weather    the watch-fire burns only at night; in rain or a storm the ford floods and cannot be
//               waded: the plank bridge upstream is the way over (it is always there: nobody can be shut in), and the
//               Leap comes down brown and twice its width.
//  Canon: the road and its iron-bark oaks ("it lay on the road and on the iron-bark oaks on either side"), which ring in
//  the wind; the two days' walk. Everything else here is [PROPOSED] and is in story/Game Layer/Phase 79.
//
//  ROAD79.MAP            'p79_greenroad'
//  ROAD79.sync()         sets the ford, the fire and the Leap for the weather and the hour (called every frame on the road)
//  Flags: p79_stone (1 once the half-way stone stands). No random numbers. The people are js/life60.js people (transient).
// ============================================================
'use strict';

const ROAD79 = (function () {
  const MAP = 'p79_greenroad', W = 168, H = 96, PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    name: S('The Greenroot Road'),
    toOak: S('The road back to Oakhaven'),
    toGreen: S('The road on to Greenroot'),
    stone1: S('A milestone, grey with lichen. OAKHAVEN, THE NORTH GATE, it says, and under that, smaller: GREENROOT, TWO DAYS.'),
    stoneDown: S('A milestone lies on its face in the nettles, a pace off the road.'),
    stoneUp: S('You get your fingers under it and heave. It goes over slowly and stands. You bed it with three stones from the ditch. HALF WAY, it says. Under that someone has scratched, long ago: and the worse half to come.'),
    stone2: S('The half-way stone, upright again. HALF WAY. Under that, scratched: and the worse half to come.'),
    stone3: S('A milestone. GREENROOT HAMLET. Under that: OAKHAVEN, TWO DAYS. The G has been cut again by a careful hand, not long ago.'),
    board: S('A toll-board on a post. The paint has gone, all but one line: FOOT, NOTHING. WHEELS, BY THE AXLE.'),
    ruin: S('Four walls to the height of your knee, and a hearth with no house round it. Somebody took the roof away a timber at a time.'),
    oak: S('An iron-bark oak, the biggest on the road. Carters have cut their marks in it as high as a man can reach. When the wind moves it, it rings like bronze.'),
    oakWet: S('The great oak is ringing in the weather: one low note, and the whole road seems to stand inside it.'),
    ford: S('The ford. A post in the bank is cut with rings to show the water\'s height. Today it stands at the lowest.'),
    fordWet: S('The ford is over its banks and the colour of tea. The top ring on the post is under. Nobody wades this.'),
    bridge: S('Three planks and a hand-rope. It is older than the rope.'),
    mere: S('The mere. The stream comes down into it and nothing comes out. Reed all round, a heron\'s patience on the far side, and a line of flat stones going out to the eyot, a hand under the water.'),
    tarn: S('A tarn, black and very still. The beck runs in at this end, and that is the last anyone sees of it.'),
    leap: S('The Leap. The stream comes off the Shelf in one piece and reaches the pool in a great many.'),
    leapWet: S('The Leap in spate: brown, twice its width, and loud enough to feel in your teeth.'),
    cairn: S('A cairn at the mouth of the Narrows. Every carter going up adds a stone. Nobody coming down takes one.'),
    hang: S('The Hang. The road goes round the foot of it, and through the Narrows behind, because nothing goes up it. Jackdaws have the top to themselves.'),
    fire: S('A watch-fire, kept small. Somebody has been burning the toll-house\'s last rafter an inch at a time.'),
    mender: S('A road-mender'),
    menderGreet: S('"Morning. Mind the ruts by the water. I fill them, the carts make them, and we\'ve neither of us ever won."'),
    menderWork: S('"I keep the road. Ditches, ruts, the ford-post, the stones. The half-way stone\'s down again. Frost heaves it. I\'ve not the back for it this year. If you\'ve a back, it lies in the nettles past the ford, north side."'),
    menderPlace: S('"Two days, Greenroot to the Gate, if you don\'t stop. Everybody stops. There\'s the ford, there\'s the old toll-house, there\'s the big oak, there\'s the Leap if you\'ve legs for the path. A road\'s only the places you stop on it."'),
    menderBark: S('A road-mender, to a rut: "Back again, are you."'),
    drover: S('A drover'),
    droverGreet: S('"Sit, if you\'re sitting. I don\'t ask names on a road at night and I don\'t give mine."'),
    droverWork: S('"Sheep, when there were sheep to drive. Now I walk the road because my feet know it. You keep a fire small on this road. A big one says come and look."'),
    droverPlace: S('"The toll-house? Nobody has taken a toll there since the spring of the forty wagons. Who stands in a road and asks the Consortium for a penny an axle? Then somebody wanted the slates, and then the timbers. A house goes down a road the same as anything else."'),
    droverBark: S('A drover, to the fire: "That\'s the last of the rafter."'),
  };

  // The lie of the land (owner, 11 Nov: "be sure to not make the road between each area be a straight line and add lakes,
  // streams, cliffs and on and on"). The road comes in low on the west, splashes through a beck, swings north past the
  // toll-house, climbs over Oak Hill, drops to the ford, goes along the north shore of the mere, and turns up through
  // the Narrows, between the Hang and the Little Hang, two crags it cannot climb. North of it all is the Shelf, a scarp
  // the stream comes over in one fall (the Leap). Nothing here is level for long.
  const GW = 72, GE = 16;                                                              // the rows of the west and east gates
  const ROADPTS = [[1, 72.5], [12, 72.5], [20, 70], [27, 64], [30, 56], [33, 49], [38, 42], [46, 36], [56, 31], [66, 30], [76, 33], [84, 39], [90, 46], [96, 50], [101, 50.5],
    [108, 48], [116, 50.5], [126, 54.5], [136, 54], [143, 47], [147, 39], [146, 31], [148, 24], [154, 18], [160, 16.5], [W - 2, 16.5]];
  const STREAMPTS = [[97, 1], [96.5, 9], [95.5, 16], [96, 22], [99, 30], [98, 40], [98, 50], [100, 58], [104, 61.5], [108, 63.5]];   // off the Shelf, down to the mere
  const BECKPTS = [[14, 53], [17, 60], [18, 66], [21, 70.5], [27, 75], [33, 78.5]];       // a spring under the west rise, down to the tarn
  const PATHPTS = [[95, 40], [95, 34], [95.5, 28], [93.5, 23.5], [91.5, 20.5]];          // worn by people who went to look at the Leap
  const MERE = { x: 124, y: 68, rx: 18, ry: 11 }, TARN = { x: 40, y: 80, rx: 7, ry: 4.5 }, POOL = { x: 96, y: 20.5, rx: 3.2, ry: 2.2 }, EYOT = { x: 128.5, y: 66.5, r: 2.7 };
  const HANG = { x: 131, y: 30, rx: 12, ry: 9, h: 5.6, steep: 0.13 }, LITTLE = { x: 158, y: 35, rx: 8, ry: 7, h: 3.8, steep: 0.17 }, OAKHILL = { x: 60, y: 31, rx: 17, ry: 12, h: 2.4 };
  const SHELF = [{ x: 80, y: 3, rx: 15, ry: 13, h: 4.6, steep: 0.12 }, { x: 97, y: 2, rx: 16, ry: 15, h: 4.6, steep: 0.11 }, { x: 114, y: 3, rx: 13, ry: 12, h: 4.6, steep: 0.13 }];
  const CRAGS = [HANG, LITTLE].concat(SHELF);
  const RISES = [[9, 50, 9, 8, 2.4], [36, 14, 14, 9, 2.8], [14, 20, 9, 7, 1.8], [70, 66, 11, 8, 2.0], [60, 88, 10, 5, 1.4], [90, 80, 9, 7, 1.8], [154, 76, 9, 9, 2.6], [152, 54, 6, 5, 1.3], [8, 88, 7, 5, 1.4], [44, 60, 8, 6, 1.2],
    [116, 28, 6, 8, 1.4], [130, 90, 12, 5, 1.4], [30, 34, 9, 7, 1.6], [84, 62, 7, 5, 1.2], [58, 50, 9, 6, 1.5], [162, 86, 5, 8, 1.3], [112, 40, 7, 4, 0.9], [20, 44, 6, 5, 1.0], [43, 45.5, 5, 5, 1.3], [88, 35.5, 5, 4, 1.2], [105, 54.5, 4.5, 3.5, 1.0], [24, 69, 4, 3, 0.8], [72, 28, 5, 4, 1.1]];
  const SADDLE = { x: 147, y: 32, rx: 4.5, ry: 9, h: 1.8 };                               // the road climbs through the Narrows
  const COPSES = [[44, 54], [76, 50], [18, 34], [110, 37], [72, 80], [140, 88], [114, 88], [26, 90], [84, 24], [50, 18], [160, 60], [8, 62]];
  const h2 = (a, b) => { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const TRACK = 1, WATER = 2, SHALLOW = 3, PLANK = 4, MOSS = 5, ROCK = 6, FALLS = 7, CRAG = 't_p79_crag', ROAD = 't_p79_road', FALLTEX = 't_p79_fall';
  const BRIDGE_Y = [41, 42];
  const STONE2 = { x: 112.5, y: 46.4 }, FIRE = { x: 25.5, y: 55.6 }, FALL = { x: 96.0, y: 17.2 };
  const inEll = (e, x, y, k) => ((x - e.x) / (e.rx * (k || 1))) ** 2 + ((y - e.y) / (e.ry * (k || 1))) ** 2 < 1;
  // where a line of points passes: a visit every `step` along it
  const along = (pts, step, fn) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.ceil(Math.hypot(bx - ax, by - ay) / step); for (let k = 0; k <= n; k++) fn(ax + (bx - ax) * k / n, ay + (by - ay) * k / n); } };
  const ROADLINE = []; along(ROADPTS, 0.5, (px, py) => ROADLINE.push(px, py));
  const roadNear = (x, y) => { let best = 1e9; for (let i = 0; i < ROADLINE.length; i += 2) { const d = Math.hypot(ROADLINE[i] - x, ROADLINE[i + 1] - y); if (d < best) best = d; } return best; };
  let FORDC = [], BANKS = [0, 0]; const RIM = [];

  // The Leap's spray, where the white water meets the pool (three frames to run through, and three more, bigger and
  // browner, for the stream in spate). The fall itself is on the rock: see FALLS in buildRoad.
  function paintFall(spate, phase) {
    const w = spate ? 56 : 44, h = spate ? 26 : 20, data = new Uint32Array(w * h), cx = (w - 1) / 2, px = (r, g, b) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
    for (let y = 0; y < h; y++) {
      const t = y / (h - 1), half = (0.28 + 0.72 * Math.sqrt(t)) * cx;               // a mound of spray, widest where it meets the pool
      for (let x = 0; x < w; x++) {
        const d = Math.abs(x - cx) / half; if (d > 1) continue;
        const n = h2(x * 3 + phase * 17, y * 5 + phase * 29 + 400), thick = (0.25 + 0.75 * t) * (1 - d * d * 0.8);
        if (n > thick) continue;                                                     // thin at the top and the edges, full at the foot
        let r = 240, g = 245, b = 247; if (n < thick * 0.35) { r = 206; g = 226; b = 236; }
        if (spate) { r = Math.round(r * 0.9); g = Math.round(g * 0.84); b = Math.round(b * 0.7); }
        data[y * w + x] = px(r, g, b);
      }
    }
    return { w, h, hs: 1, cx: 0.5, dy: 0, data };
  }
  // Living rock for the faces of the crags: uneven strata with a shadow under each ledge, cracks, and a little lichen.
  function paintCrag() {
    const d = new Uint32Array(64 * 64), C = [[52, 50, 50], [80, 76, 72], [106, 100, 92], [128, 121, 110], [150, 143, 128]], EDGE = [0, 7, 12, 21, 27, 36, 44, 49, 58];
    const px = (c) => (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const yy = (y + Math.round(2.2 * Math.sin(x / 64 * PI * 2) + 1.3 * Math.sin(x / 64 * PI * 6 + 1)) + 64) & 63;
      let band = 0; for (let i = 0; i < EDGE.length; i++) if (yy >= EDGE[i]) band = i;
      let t = 0.52 + (h2(band, 5) - 0.5) * 0.46 + (h2(x >> 2, (yy >> 1) + 40) - 0.5) * 0.22 + (h2(x, y + 99) - 0.5) * 0.1;
      if (yy === EDGE[band]) t -= 0.36; else if (yy === EDGE[band] + 1) t += 0.14;
      const crack = (Math.floor(h2(band, 17) * 20) + 5 + ((x >> 5) * 31)) & 63; if (x === crack || (x === ((crack + 23) & 63) && h2(band, 23) < 0.6)) t -= 0.3;
      const li = h2(x >> 1, (y >> 1) + 300);
      d[y * 64 + x] = li > 0.972 ? px([124, 128, 72]) : li < 0.012 ? px([170, 150, 96]) : px(C[Math.max(0, Math.min(4, Math.round(t * 4)))]);
    }
    return d;
  }
  // White water down a rock face: long streaks (the tile lies on ground that is nearly upright, which draws them out longer).
  function paintFallTile() {
    const d = new Uint32Array(64 * 64), px = (r, g, b) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const col = h2(x >> 1, 811), n = h2(x >> 1, (((y + Math.floor(col * 64)) & 63) >> 3) + 820), f = h2(x, y + 830), v = col * 0.5 + n * 0.35 + f * 0.15;
      d[y * 64 + x] = v > 0.6 ? px(238, 244, 246) : v > 0.42 ? px(204, 224, 234) : v > 0.26 ? px(164, 196, 214) : px(122, 160, 188);
    }
    return d;
  }
  // The road: packed earth and small stone, worn pale down the middle of every cell's worth of it.
  function paintRoad() {
    const d = new Uint32Array(64 * 64), C = [[86, 68, 46], [108, 87, 60], [128, 105, 74], [146, 123, 90], [164, 142, 108]];
    const px = (c) => (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0, sm = (x, y, k) => { const fx = x / k, fy = y / k, x0 = Math.floor(fx), y0 = Math.floor(fy), tx = fx - x0, ty = fy - y0, n = 64 / k, v = (a, b) => h2(((a % n) + n) % n + 600, ((b % n) + n) % n + k); return (v(x0, y0) * (1 - tx) + v(x0 + 1, y0) * tx) * (1 - ty) + (v(x0, y0 + 1) * (1 - tx) + v(x0 + 1, y0 + 1) * tx) * ty; };
    for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
      const t = 0.5 + (sm(x, y, 16) - 0.5) * 0.5 + (sm(x, y, 4) - 0.5) * 0.3 + (h2(x, y + 500) - 0.5) * 0.16;
      d[y * 64 + x] = px(C[Math.max(0, Math.min(4, Math.round(t * 4)))]);
    }
    for (let i = 0; i < 46; i++) { const x = Math.floor(h2(i, 701) * 64), y = Math.floor(h2(i, 709) * 64), big = h2(i, 713) < 0.35;      // small stones, each with its shadow
      for (let dy = 0; dy < (big ? 2 : 1); dy++) for (let dx = 0; dx < (big ? 3 : 2); dx++) d[((y + dy) & 63) * 64 + ((x + dx) & 63)] = px(h2(i, 719) < 0.5 ? [176, 170, 156] : [150, 146, 138]);
      for (let dx = 0; dx < (big ? 3 : 2); dx++) d[((y + (big ? 2 : 1)) & 63) * 64 + ((x + dx) & 63)] = px([70, 56, 40]); }
    for (let i = 0; i < 14; i++) { const x = Math.floor(h2(i, 727) * 64), y = Math.floor(h2(i, 733) * 64); d[y * 64 + x] = px([92, 112, 58]); d[((y + 63) & 63) * 64 + x] = px([112, 132, 66]); }   // a blade of grass that got in
    return d;
  }
  // A boulder (two shapes), and a plain cairn: a heap of road-stones.
  function blob(set, cx, by, rx, ry, seed, C, moss) {
    for (let y = Math.floor(by - ry * 1.3); y <= by; y++) for (let x = Math.floor(cx - rx * 1.3); x <= cx + rx * 1.3; x++) {
      const u = (x - cx) / rx, v = (y - by) / ry, th = Math.atan2(v, u), r = 1 + 0.13 * Math.sin(3 * th + seed) + 0.07 * Math.sin(7 * th + seed * 2.3), q = Math.hypot(u, v) / r;
      if (q > 1) continue;
      let t = 0.5 - u * 0.26 - v * 0.42 + (h2(x >> 1, (y >> 1) + (seed * 13 | 0)) - 0.5) * 0.24; if (q > 0.86) t = 0.02;
      const c = moss && v < -0.62 && h2(x, y + 7) < 0.5 ? [98, 116, 62] : C[Math.max(0, Math.min(C.length - 1, Math.round(t * (C.length - 1))))];
      set(x, y, (0xff000000 | (c[2] << 16) | (c[1] << 8) | c[0]) >>> 0);
    }
  }
  const GREY = [[40, 40, 44], [74, 72, 70], [104, 100, 94], [132, 127, 116], [160, 154, 140]];
  function canvas(w, h, fn) { const data = new Uint32Array(w * h); fn((x, y, c) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) data[y * w + x] = c; }); return { w, h, hs: 1, cx: 0.5, dy: 0, data }; }
  const paintRock = (v) => canvas(34, 24, (set) => { if (v) { blob(set, 12, 23, 10, 15, 1.7, GREY, true); blob(set, 24, 23, 8, 9, 4.1, GREY, false); } else { blob(set, 17, 23, 14, 19, 0.6, GREY, true); blob(set, 7, 23, 5, 6, 2.9, GREY, false); } });
  const paintCairn = () => canvas(40, 28, (set) => { let n = 0; for (let row = 0; row < 5; row++) for (let i = 0; i < 5 - row; i++) { n++; blob(set, 6.5 + row * 3.4 + i * 6.8 + (h2(n, 3) - 0.5) * 1.6, 27 - row * 4.6, 4.3 + h2(n, 5) * 1.2, 5.6, n * 1.9, GREY, false); } });
  function installArt() {
    if (typeof Engine === 'undefined' || !Engine.addSprite) return;
    for (let i = 0; i < 3; i++) { if (!Engine.sprites['p79_fall' + i]) Engine.addSprite('p79_fall' + i, paintFall(false, i)); if (!Engine.sprites['p79_spate' + i]) Engine.addSprite('p79_spate' + i, paintFall(true, i)); }
    if (!Engine.sprites.p79_rock0) { Engine.addSprite('p79_rock0', paintRock(0)); Engine.addSprite('p79_rock1', paintRock(1)); Engine.addSprite('p79_cairn', paintCairn()); }
    if (Engine.addTexture && !Engine.textures[CRAG]) { Engine.addTexture(CRAG, paintCrag()); Engine.addTexture(ROAD, paintRoad()); Engine.addTexture(FALLTEX, paintFallTile()); }
  }

  function buildRoad(toClearing, toGreenroot) {
    const m = new GameMap(MAP, TX.name, W, H, {
      outdoor: true, floor: 't_grass', floorTextures: ['t_grass', ROAD, 't_water', 't_shallows', 'p17c_plank', 't_moss', CRAG, FALLTEX], fogDist: 30, fogColor: [70, 76, 66],
      music: 'wild', danger: 1, spawn: { x: 1.6, y: GW + 0.5, dir: 0 },
    });
    m.border('t_hedge');
    m.set(0, GW, DOOR({ tex: 't_hedge', portal: toClearing, label: TX.toOak }));
    m.set(W - 1, GE, DOOR({ tex: 't_hedge', portal: toGreenroot, label: TX.toGreen }));
    const inside = (x, y) => x >= 1 && y >= 1 && x <= W - 2 && y <= H - 2, fl = (x, y) => m.floorCells[y * W + x];
    // the stream, the plunge pool under the Leap, the mere (with its eyot) and the tarn: water cannot be walked
    const wet = new Uint8Array(W * H), run = new Uint8Array(W * H), beck = new Uint8Array(W * H);
    along(STREAMPTS, 0.4, (px, py) => { for (const dx of [0, 1]) { const x = Math.floor(px) + dx, y = Math.floor(py); if (inside(x, y)) wet[y * W + x] = run[y * W + x] = 1; } });
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) {
      if (inEll(MERE, x + 0.5, y + 0.5) || inEll(TARN, x + 0.5, y + 0.5) || inEll(POOL, x + 0.5, y + 0.5)) { wet[y * W + x] = 1; run[y * W + x] = 0; }
      if (Math.hypot(x + 0.5 - EYOT.x, y + 0.5 - EYOT.y) < EYOT.r) wet[y * W + x] = 0;
    }
    // the land: Oak Hill, which the road goes over; the crags and the Shelf, flat-topped with flanks too steep to climb;
    // and a dozen low rises, so that nothing is level for long
    m.hill(OAKHILL.x, OAKHILL.y, OAKHILL.rx, OAKHILL.ry, OAKHILL.h);
    for (const c of CRAGS) m.hill(c.x, c.y, c.rx, c.ry, c.h, { steep: c.steep });
    // (water lies level, and a crag stands clear: a rise draws in its skirts sooner than tilt a pond or make a ramp up a cliff)
    const dry = (cx, cy, rx, ry) => { for (let y = Math.max(1, Math.floor(cy - ry - 1)); y <= Math.min(H - 2, cy + ry + 1); y++) for (let x = Math.max(1, Math.floor(cx - rx - 1)); x <= Math.min(W - 2, cx + rx + 1); x++) if ((wet[y * W + x] || CRAGS.some((q) => inEll(q, x + 0.5, y + 0.5, 1.12))) && ((x + 0.5 - cx) / (rx + 1.5)) ** 2 + ((y + 0.5 - cy) / (ry + 1.5)) ** 2 < 1) return false; return true; };
    const rise = (x, y, rx, ry, h) => { while (rx > 4 && ry > 3.5 && !dry(x, y, rx, ry)) { rx -= 1; ry -= 1; h *= 0.9; } if (dry(x, y, rx, ry)) { m.hill(x, y, rx, ry, Math.min(h, 0.4 * Math.min(rx, ry))); return true; } return false; };   // never so steep it bares rock
    for (const [x, y, rx, ry, h] of RISES) rise(x, y, rx, ry, h);
    m.hill(SADDLE.x, SADDLE.y, SADDLE.rx, SADDLE.ry, SADDLE.h);
    // the road runs down a broad valley: the land climbs to a wooded rim all round, with a gap at each gate
    // (its crest stands a few paces inside the hedge, so from the valley floor the hedge is behind the skyline)
    const rim = (x, y, i, ns) => { if (Math.hypot(x, y - GW) < 15 || Math.hypot(x - W, y - GE) < 15 || (y < 12 && x > 60 && x < 132)) return; if (rise(x, y, (ns ? 9 : 7) + h2(i, 41) * 5, (ns ? 6 : 9) + h2(i, 43) * 4, 2.8 + h2(i, 47) * 2.0)) RIM.push([x, y]); };
    RIM.length = 0;
    for (let x = 4, i = 0; x < W; x += 10, i++) { rim(x + h2(i, 51) * 4, 5, i, 1); rim(x + h2(i, 53) * 4, H - 5, i + 40, 1); }
    for (let y = 8, i = 80; y < H - 4; y += 10, i++) { rim(5, y + h2(i, 55) * 4, i, 0); rim(W - 5, y + h2(i, 57) * 4, i + 40, 0); }
    // the hedge shows at the two gates; along the rim it is behind the skyline, and kept too low to stand up over it
    const lowEdge = (x, y) => { if (Math.hypot(x, y - GW) > 17 && Math.hypot(x - (W - 1), y - GE) > 17) m.block(x, y, 't_hedge', Math.min(0.9, m.groundAt(x + 0.5, y + 0.5) + 0.1), { capTex: 't_hedge' }); };
    for (let x = 0; x < W; x++) { lowEdge(x, 0); lowEdge(x, H - 1); }
    for (let y = 1; y < H - 1; y++) { lowEdge(0, y); lowEdge(W - 1, y); }
    along(BECKPTS, 0.4, (px, py) => { const x = Math.floor(px), y = Math.floor(py); if (inside(x, y) && !wet[y * W + x]) beck[y * W + x] = 1; });
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) {
      if (wet[y * W + x]) { m.setFloor(x, y, WATER); continue; }
      if (beck[y * W + x]) { m.setFloor(x, y, SHALLOW); continue; }
      let bank = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (inside(x + dx, y + dy) && wet[(y + dy) * W + x + dx]) bank = true;
      if (bank) m.setFloor(x, y, MOSS);
    }
    // flat stones a hand under the water, from the north shore out to the eyot
    for (let y = Math.floor(EYOT.y - EYOT.r); y > MERE.y - MERE.ry - 2; y--) { const x = Math.floor(EYOT.x); if (wet[y * W + x]) { wet[y * W + x] = 0; m.setFloor(x, y, SHALLOW); } }
    // bare rock wherever the ground is too steep to hold turf
    // (where the stream comes to the lip of the Shelf it keeps its bed down the rock as white water, from the lip to the
    // pool: owner, 12 Nov, of the first Leap, which was only a picture standing in front of the cliff: "it looks like its
    // just falling from the sky")
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) if (m.gradeAt(x + 0.5, y + 0.5) > 0.8) { m.setFloor(x, y, run[y * W + x] ? FALLS : ROCK); wet[y * W + x] = run[y * W + x] = 0; }
    // the track, two cells wide; where it crosses the stream is the ford, and where it crosses the beck it just gets wet
    FORDC = [];
    along(ROADPTS, 0.4, (px, py) => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const x = Math.floor(px - 0.5) + dx, y = Math.floor(py - 0.5) + dy; if (!inside(x, y) || beck[y * W + x]) continue;
      if (run[y * W + x]) { if (fl(x, y) !== SHALLOW) { m.setFloor(x, y, SHALLOW); FORDC.push([x, y]); } } else if (!wet[y * W + x]) m.setFloor(x, y, TRACK); } });
    // the plank bridge upstream of the ford, the paths down to the road on either bank, and the path up to the Leap
    let a = W, b = 0; for (const y of BRIDGE_Y) for (let x = 1; x <= W - 2; x++) if (run[y * W + x]) { a = Math.min(a, x); b = Math.max(b, x); }
    a -= 1; b += 1; BANKS = [a - 1, b + 1];
    for (const y of BRIDGE_Y) for (let x = a; x <= b; x++) m.setFloor(x, y, PLANK);
    for (const x of BANKS) for (let y = BRIDGE_Y[0]; y <= BRIDGE_Y[0] + 14 && fl(x, y) !== TRACK; y++) if (!wet[y * W + x]) m.setFloor(x, y, TRACK);
    along(PATHPTS, 0.4, (px, py) => { const x = Math.floor(px), y = Math.floor(py); if (inside(x, y) && !wet[y * W + x] && (fl(x, y) === 0 || fl(x, y) === MOSS)) m.setFloor(x, y, TRACK); });
    // the ruin of the toll-house, where the road turns north: knee-high walls, a gap where the door was
    const low = (x, y, top) => m.block(x, y, 't_stone', top, { capTex: 't_stone' });
    for (let x = 22; x <= 27; x++) { low(x, 53, 0.34 + 0.2 * h2(x, 4)); if (x !== 25) low(x, 58, 0.3 + 0.16 * h2(x, 9)); }
    for (let y = 54; y <= 57; y++) { low(22, y, 0.3 + 0.24 * h2(30, y)); if (y !== 56) low(27, y, 0.3 + 0.2 * h2(36, y)); }
    low(22, 53, 0.9); low(27, 53, 0.7);                                             // two corners still stand to the chest
    m.deco('sign', 26.4, 60.2, { radius: 0.2, scale: 0.85, label: TX.board });
    m.deco('sign', 23.6, 55.5, { radius: 0.2, scale: 0.7, label: TX.ruin });
    m.add({ kind: 'item', item: 'cache', tier: 1, x: 26.4, y: 54.5, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.deco('campfire', FIRE.x, FIRE.y, { radius: 0.3, scale: 0.55, glow: true, label: TX.fire, _p79: 'fire', hidden: true });
    // the half-way stone (the two end stones stand on the end stretches: js/road79b.js)
    m.deco('p20_stone', STONE2.x, STONE2.y, { radius: 0.22, scale: 0.32, solid: false, label: TX.stoneDown, use: 'p79_stone', _p79: 'stone' });
    // the ford-post, the bridge, the Leap, the mere and its eyot, the tarn, the Hang, the cairn in the Narrows
    m.deco('p12r_post', 96.6, 48.4, { radius: 0.18, scale: 0.8, label: TX.ford, _p79: 'post' });
    m.deco('sign', BANKS[0] - 0.4, BRIDGE_Y[0] - 0.6, { radius: 0.2, scale: 0.7, label: TX.bridge });
    m.deco('p79_fall0', FALL.x, FALL.y, { radius: 0.2, scale: 1.25, solid: false, _p79: 'fall' });   // spray at the foot of the fall
    m.deco('sign', 91.4, 22.4, { radius: 0.2, scale: 0.75, label: TX.leap, _p79: 'leap' });
    m.deco('sign', 122.4, 56.5, { radius: 0.2, scale: 0.75, label: TX.mere });
    m.add({ kind: 'item', item: 'cache', tier: 1, x: EYOT.x + 0.9, y: EYOT.y + 0.6, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });   // for whoever finds the stones
    m.deco('willow', EYOT.x - 1.0, EYOT.y + 0.2, { radius: 0.4, scale: 1.7 });
    m.deco('sign', 36.4, 74.6, { radius: 0.2, scale: 0.75, label: TX.tarn });
    m.deco('sign', 143.4, 41.6, { radius: 0.2, scale: 0.75, label: TX.hang });
    m.deco('p79_cairn', 150.2, 27.4, { radius: 0.5, scale: 0.9, label: TX.cairn });
    // the great oak on Oak Hill
    m.deco('oak', 60.5, 27.6, { radius: 0.6, scale: 2.4, label: TX.oak, _p79: 'oak' });
    // scree: fallen rock round the feet of the crags
    const open = (x, y) => inside(x, y) && !m.get(x, y) && fl(x, y) === 0;
    for (const c of CRAGS) for (let y = Math.floor(c.y - c.ry * 1.3); y <= c.y + c.ry * 1.3; y++) for (let x = Math.floor(c.x - c.rx * 1.3); x <= c.x + c.rx * 1.3; x++) {
      if (!open(x, y) || !inEll(c, x + 0.5, y + 0.5, 1.22) || CRAGS.some((q) => inEll(q, x + 0.5, y + 0.5, 1.03)) || h2(x * 3 + 1, y * 5 + 2) > 0.2) continue;
      const ox = x + 0.3 + h2(x, y + 11) * 0.4, oy = y + 0.3 + h2(x + 5, y) * 0.4;
      if (roadNear(ox, oy) < 2.6 || m.entities.some((e) => Math.hypot(e.x - ox, e.y - oy) < 1.5)) continue;
      m.deco(h2(x, y + 77) < 0.5 ? 'p79_rock0' : 'p79_rock1', ox, oy, { radius: 0.4, scale: 0.6 + h2(x + 9, y + 3) * 0.9 });
    }
    // trees. The books: "the iron-bark oaks on either side" of the road; then copses with fern under them, willows by
    // the water, and thorns on the tops where nothing else will stand
    const lawn = (x, y) => open(x | 0, y | 0) && m.gradeAt(x, y) < 0.7;
    const room = (x, y, r) => !(x > 20 && x < 30 && y > 51 && y < 60) && !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r);
    let k = 0, due = 2;
    for (let i = 0; i + 1 < ROADPTS.length; i++) { const [ax, ay] = ROADPTS[i], [bx, by] = ROADPTS[i + 1], L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
      for (; due <= L; due += 3.7) for (const side of [-1, 1]) { k++; const off = 2.7 + h2(k, 7) * 1.2, t = due + (h2(k, 9) - 0.5) * 1.6, ox = ax + (bx - ax) * t / L + nx * off * side, oy = ay + (by - ay) * t / L + ny * off * side;
        if (lawn(ox, oy) && roadNear(ox, oy) > 2.1 && room(ox, oy, 1.7)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.5 + h2(k, 11) * 0.7 }); }
      due -= L; }
    COPSES.forEach(([cx, cy], ci) => { for (let i = 0; i < 13; i++) {
      const an = h2(ci * 17 + i, 61) * PI * 2, rr = Math.sqrt(h2(ci * 29 + i, 67)) * 6.5, ox = cx + Math.cos(an) * rr, oy = cy + Math.sin(an) * rr * 0.8;
      if (!lawn(ox, oy) || roadNear(ox, oy) < 2.6) continue;
      if (i < 9) { if (room(ox, oy, 1.9)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.5 + h2(ci, i + 3) * 0.8 }); }
      else if (room(ox, oy, 0.9) && Engine.sprites && Engine.sprites.p22_fern) m.deco('p22_fern', ox, oy, { radius: 0.2, scale: 0.5 + h2(ci, i) * 0.2, solid: false });
    } });
    for (let i = 0; i < 16; i++) {                                                     // willows round the mere and the tarn
      const e = i < 11 ? MERE : TARN, an = (i + h2(i, 83) * 0.7) * (PI * 2 / (i < 11 ? 11 : 5)), ox = e.x + Math.cos(an) * (e.rx + 1.9), oy = e.y + Math.sin(an) * (e.ry + 1.9);
      if (inside(ox | 0, oy | 0) && !m.get(ox | 0, oy | 0) && (fl(ox | 0, oy | 0) === 0 || fl(ox | 0, oy | 0) === MOSS) && roadNear(ox, oy) > 2.4 && Math.abs(ox - EYOT.x) > 2.5 && room(ox, oy, 2.2)) m.deco('willow', ox, oy, { radius: 0.4, scale: 1.6 + h2(i, 5) * 0.5 });
    }
    for (let i = 0; i < 26; i++) {                                                     // thorns on the tops
      const c = CRAGS[i % CRAGS.length], ox = c.x + (h2(i, 91) - 0.5) * c.rx * 1.1, oy = c.y + (h2(i, 97) - 0.5) * c.ry * 1.1;
      if (inside(ox | 0, oy | 0) && inEll(c, ox, oy, 0.62) && !m.get(ox | 0, oy | 0) && fl(ox | 0, oy | 0) === 0 && room(ox, oy, 2)) m.deco(Engine.sprites && Engine.sprites.p20_thorn ? 'p20_thorn' : 'oak', ox, oy, { radius: 0.3, scale: 0.9 + h2(i, 3) * 0.4 });
    }
    RIM.forEach(([cx, cy], ci) => { for (let i = 0; i < 7; i++) {                       // the rim is wooded
      const ox = cx + (h2(ci * 13 + i, 71) - 0.5) * 16, oy = cy + (h2(ci * 19 + i, 73) - 0.5) * 12;
      if (lawn(ox, oy) && roadNear(ox, oy) > 5 && room(ox, oy, 2.3)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.6 + h2(ci, i + 31) * 0.9 });
    } });
    m.baseCount = m.entities.length;
    return m;
  }

  // the two doors this road stands between
  const doorTo = (m, target) => { for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === target) return c; } return null; };
  function join(maps) {
    const cl = maps.clearing, gr = maps.greenroot; if (!cl || !gr || maps[MAP]) return false;
    const out = doorTo(cl, 'greenroot'), back = doorTo(gr, 'clearing'); if (!out || !back) return false;
    maps[MAP] = buildRoad(Object.assign({}, back.portal), Object.assign({}, out.portal));
    out.portal = { map: MAP, x: 1.6, y: GW + 0.5, dir: 0 };
    back.portal = { map: MAP, x: W - 1.6, y: GE + 0.5, dir: PI };
    return true;
  }

  // ---- the hour and the weather
  const hour = () => { const t = typeof G !== 'undefined' ? Number(G.tod) || 0 : 0; return (((t % 1) + 1) % 1) * 24; };
  const wet = () => typeof Weather !== 'undefined' && (Weather.state === 'rain' || Weather.state === 'storm');
  const night = () => { const h = hour(); return h >= 20 || h < 5; };
  let last = '', FALLE = null;
  function sync() {
    if (typeof G === 'undefined' || !G.map || G.map.id !== MAP) return;
    const m = G.map, cam = typeof Engine !== 'undefined' ? Engine.cam : null, f = G.flags || {};
    // the ford floods in rain, but never round somebody standing in it
    const inFord = !!cam && FORDC.some(([x, y]) => Math.abs(cam.x - (x + 0.5)) < 1.7 && Math.abs(cam.y - (y + 0.5)) < 1.7);
    const fc = FORDC[0], flooded = !!fc && m.floorCells[fc[1] * W + fc[0]] === WATER, want = wet();
    let changed = false;
    if (fc && want !== flooded && !(want && inFord)) { for (const [x, y] of FORDC) m.floorCells[y * W + x] = want ? WATER : SHALLOW; changed = true; }
    // the Leap never stops falling (the game's own clock runs it; no random numbers)
    const fr = Math.floor((Number(G.time) || 0) * 7) % 3, fall = (want ? 'p79_spate' : 'p79_fall') + fr;
    if (!FALLE || FALLE._p79 !== 'fall' || G.ents.indexOf(FALLE) < 0) FALLE = G.ents.find((e) => e && e._p79 === 'fall') || null;
    if (FALLE && FALLE.sprite !== fall && Engine.sprites && Engine.sprites[fall]) FALLE.sprite = fall;
    const nowWet = !!fc && m.floorCells[fc[1] * W + fc[0]] === WATER, dark = night(), key = (nowWet ? 'w' : 'd') + (dark ? 'n' : 'y') + (f.p79_stone ? 's' : '-') + (want ? 'r' : '');
    if (key !== last || changed) {
      last = key;
      for (const e of G.ents) { if (!e || !e._p79) continue;
        if (e._p79 === 'fire') { e.hidden = !dark; e.solid = dark; e.label = TX.fire; }
        else if (e._p79 === 'post') e.label = nowWet ? TX.fordWet : TX.ford;
        else if (e._p79 === 'oak') e.label = want ? TX.oakWet : TX.oak;
        else if (e._p79 === 'leap') e.label = want ? TX.leapWet : TX.leap;
        else if (e._p79 === 'stone') { const up = !!f.p79_stone; e.scale = up ? 0.6 : 0.32; e.solid = up; e.label = up ? TX.stone2 : TX.stoneDown; e.use = up ? undefined : 'p79_stone'; }
      }
      if (typeof R3D !== 'undefined' && R3D.invalidate) { try { R3D.invalidate(); } catch (e) { /* the classic renderer reads the floor and the figures live */ } }
    }
  }
  // the small task: set the half-way stone up again
  function useOwn(e) {
    if (!e || e.use !== 'p79_stone' || typeof G === 'undefined' || !G.map || G.map.id !== MAP) return false;
    G.flags.p79_stone = 1; last = '';
    if (typeof msg === 'function') msg(TX.stoneUp, 'good', 9000);
    if (typeof questXp === 'function') questXp(20);
    sync(); return true;
  }

  // ---- the people (js/life60.js): a road-mender by day at the ford, a drover by night at the watch-fire
  const st = (from, to, job, at, x) => Object.assign({ from, to, job, at }, x || {});
  const ROSTER = [
    { key: 'rd_mender', name: TX.mender, sprite: 'p60_man_b', home: [1.6, GW + 0.5],
      day: [st(7, 12, 'rake', [95.5, 51.4]), st(12, 13, 'sit', [94.5, 48.4]), st(13, 18, 'rake', [102.5, 51.4]), { from: 18, to: 7, job: 'home' }],
      greet: TX.menderGreet, work: TX.menderWork, place: TX.menderPlace, barks: [TX.menderBark] },
    { key: 'rd_drover', name: TX.drover, sprite: 'p60_man_c', home: [28.5, 61.5],
      day: [st(20, 24, 'sit', [FIRE.x + 1.0, FIRE.y + 0.3]), st(0, 5, 'sit', [FIRE.x + 1.0, FIRE.y + 0.3]), { from: 5, to: 20, job: 'home' }],
      greet: TX.droverGreet, work: TX.droverWork, place: TX.droverPlace, barks: [TX.droverBark] },
  ];

  installArt();
  // the far country (js/upgrades.js LANDMARKS, the same table the Watch Downs use): the Grey Teeth to the north with snow on
  // them, and the downs rolling away south and west in the haze. Without an entry a map gets one dark band all round.
  try { if (typeof LANDMARKS !== 'undefined' && !LANDMARKS[MAP]) LANDMARKS[MAP] = [
    { a: -1.5, aw: 1.25, h: 0.30, p: 1.4, ridge: 0.5, seed: 2.9, far: 0.85, cap: [152, 158, 178], capH: 0.26, c: [40, 42, 58] },
    { a: 2.5, aw: 1.4, h: 0.12, p: 1.0, ridge: 0.4, seed: 6.3, far: 0.6, c: [44, 50, 52] },
    { a: 0.6, aw: 1.0, h: 0.10, p: 1.1, ridge: 0.35, seed: 3.8, far: 0.6, c: [38, 44, 46] },
  ]; } catch (e) { /* the plain sky */ }
  if (typeof buildAllMaps === 'function') {
    const _b = buildAllMaps;
    buildAllMaps = function () {
      const maps = _b.apply(this, arguments);
      try { if (join(maps) && typeof FLORA !== 'undefined' && FLORA.place) FLORA.place({ [MAP]: maps[MAP] }); } catch (e) { if (typeof console !== 'undefined') console.warn('road79', e); }
      return maps;
    };
    try { if (typeof FLORA !== 'undefined' && FLORA.PLANS && !FLORA.PLANS[MAP]) FLORA.PLANS[MAP] = { grass: 760, reed: 44 }; } catch (e) { /* no grass */ }
    try { if (typeof LIFE60 !== 'undefined' && LIFE60.add) LIFE60.add(MAP, ROSTER, {}); } catch (e) { /* nobody on the road */ }
  }
  if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { /* fall through */ } return _ud.apply(this, arguments); }; }
  if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { last = ''; sync(); } catch (e) { /* next frame */ } return r; }; }
  // every frame, under either renderer: the engine's post hooks only run when the classic renderer draws, so the game's
  // own update is the place (js/flora.js does the same)
  if (typeof update === 'function') { const _u = update; update = function () { const r = _u.apply(this, arguments); try { sync(); } catch (e) { /* next frame */ } return r; }; }
  else if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook(() => { try { sync(); } catch (e) { /* next frame */ } }, 30);

  return { MAP, W, H, GW, GE, TX, TEXTS, ROSTER, ROADPTS, STREAMPTS, BECKPTS, MERE, TARN, POOL, EYOT, HANG, LITTLE, SHELF, OAKHILL, buildRoad, join, sync, useOwn, util: { h2, along, inEll, hour, night, wet }, CRAG, ROAD, paintFall, paintCrag, paintRoad, paintRock, paintCairn, fordCells: () => FORDC.map((c) => c.slice()), banks: () => BANKS.slice(), BRIDGE_Y, STONE2, FIRE, FALL };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ROAD79;
if (typeof window !== 'undefined') window.ROAD79 = ROAD79;
