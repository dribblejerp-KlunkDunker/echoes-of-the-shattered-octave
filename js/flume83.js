// ============================================================
//  flume83 — Phase 83, road 1 of the world plan (story/Game Layer/Phase 81 - The World Plan.md, "Road 1. The Flume, down
//  to Stillwater"; approved by the owner, 13 Nov 2026, "approve all").
//
//  Until now the lane cut down through the hedge on the Flume Road opened straight onto Stillwater Landing. Now the road
//  itself is there, in two stretches, walked north to south (each takes over the two doors it stands between; nothing
//  else about either place changes):
//    the Stride       (FLUME83.STRIDE)  the Flume Road  ->  the Pound Stair
//      The road winds down into a wet valley, Sallow Bottom, between alder and willow, crossing the brook twice. The Flume
//      strides straight over it on living trunks as tall as a church: the only straight thing in the country, and it is in
//      the sky. At night its sap-light runs in the channel, one green line across the dark, and the lit water throws green
//      light on the road under it. In rain the brook comes up over its fords; there is always a footbridge.
//      To find: Ennis Crowle's far skeps, in bee-boles in a wall; a gauging stone cut with the Flume's height year by year.
//      To meet: a broadsheet-runner coming up from the Landing; a Synod gauger with a measuring chain, polite.
//    the Pound Stair  (FLUME83.STAIR)   the Stride  ->  Stillwater Landing
//      The Flume comes down to the Landing by a flight of sixteen grown locks, each with a square side-pound beside it,
//      stepping down the hill like a giant's stair. The road zigzags down beside them and crosses by the lock gates.
//      To find: a timber raft wedged in a side-pound for two years, Compact chalk on it and something under its deck.
//      To meet: the lengthsman, the Compact's keeper of the Stair (his task: the top three gates have stuck since the lock
//      was chained; hum the Root note at them in order, top to bottom, to let a raft down, without ringing a stake);
//      two raft-hands walking home in the evening (the rafts go down by water, the crews come back on foot).
//      In rain the Stair walks: the pounds run over, the low road beside the channel is shut, and the way is the high path
//      along the pound-banks. When a surge has passed the lowest side-pound stands empty for a while, and shows a grating.
//  Canon: the Flume is a living aqueduct of grown wood that pumps water uphill and holds one low vowel; Stillwater is the
//  river port at its lower lock; the Timber Compacts; it over-pumps and surges; Ennis Crowle keeps bees on the Flume road;
//  grown wood remembers one note ("sing it the root"). Everything else is the plan's, approved, and every line is
//  [PROPOSED] in story/Game Layer/Phase 83 - New In-Game Text (for review).md.
//  Flags: p83_gates (a bit for each of the top three gates hummed open, in order), p83_raft (1 once the raft is down),
//  p83_drained (the hour the last surge ended, for the empty pound). Nothing visual uses random numbers.
// ============================================================
'use strict';

const FLUME83 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI, STRIDE = 'p83_stride', STAIR = 'p83_poundstair';
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('flume83: ' + k, e); } };
  const h2 = (a, b) => { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const along = (pts, step, fn) => { for (let i = 0; i + 1 < pts.length; i++) { const [ax, ay] = pts[i], [bx, by] = pts[i + 1], n = Math.max(1, Math.ceil(Math.hypot(bx - ax, by - ay) / step)); for (let k = 0; k <= n; k++) fn(ax + (bx - ax) * k / n, ay + (by - ay) * k / n); } };
  const hour = () => { const t = typeof G !== 'undefined' ? Number(G.tod) || 0 : 0; return (((t % 1) + 1) % 1) * 24; };
  const night = () => { const h = hour(); return h >= 20 || h < 5; };
  const wet = () => typeof Weather !== 'undefined' && (Weather.state === 'rain' || Weather.state === 'storm');
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };

  const TX = {
    nameS: S('The Flume Road: the Stride'), nameP: S('The Flume Road: the Pound Stair'),
    upToRoad: S('Up to the Flume Road'), downToStair: S('Down to the Pound Stair'), upToStride: S('Up to the Stride'), downToLanding: S('Down to Stillwater Landing'),
    // the Stride
    pier: S('A trunk of the Flume, grown, not built: as tall as a church, and the water going over the top of it, uphill.'),
    pierNight: S('Up in the dark the channel is a line of green light, from ridge to ridge, and it hums one low vowel.'),
    stride: S('The Stride. The Flume walks straight across Sallow Bottom on its trunks: the only straight thing in all this country, and it is in the sky.'),
    brook: S('The brook in Sallow Bottom, clear over gravel, under alder and willow.'),
    brookWet: S('The brook is up over its ford and running brown. The footbridge is the way over.'),
    plank: S('A footbridge of two planks. Somebody keeps the rail tied.'),
    boles: S('A wall with three niches in it, and a straw skep in each: Ennis Crowle\'s far skeps, in their bee-boles. The bees work the willow in the bottom.'),
    skep: S('A straw skep in its niche. The bees come and go at the door and do not mind you, if you do not mind them.'),
    gauge: S('A gauging stone at the foot of a trunk, cut with the Flume\'s height year by year. The last few marks are each a little higher than the one before.'),
    // the Pound Stair
    stair: S('The Pound Stair. Sixteen locks of grown wood stepping down the hill, each with its square side-pound, like a giant\'s stair.'),
    gate: S('A lock gate of grown timber, black with seep. You can cross on its top beam.'),
    gateStuck: S('A lock gate, stuck since the lock was chained. Grown wood remembers one note.'),
    gateOpen: S('The gate stands open. The water has gone on down.'),
    pound: S('A side-pound: a square pool beside the lock, to keep the water the lock lets down.'),
    raft: S('A timber raft wedged in the side-pound, two years by the weed on it. Compact chalk on every log, and something lashed under the deck.'),
    raftDown: S('The raft from the top lock, down at the foot of the Stair and tied up, waiting for its crew.'),
    raftUp: S('A raft waiting in the top lock, its gates stuck shut.'),
    stake: S('A mooring stake, iron-bark. It rings if you knock it.'),
    grate: S('A grating in the floor of the empty pound, bolted from below. Cold air comes up through it, and the smell of old stone.'),
    // the task (the gates, hummed in order)
    hum1: S('You hum the Root at the top gate. The grown wood remembers it, and the gate gives a little, and waits.'),
    hum2: S('The second gate takes the note and eases. Below you the water starts to talk.'),
    hum3: S('The third gate swings. The raft goes down the Stair on its own water, lock by lock, and the lengthsman lifts one hand from the bank below.'),
    humWrong: S('The gate groans and will not take the note out of order. Down the bank a stake rings, and goes on ringing.'),
    stakeRing: S('Your knee knocks a mooring stake, and it rings like a struck bell all down the Stair.'),
    paid: S('The lengthsman puts a few coins in your hand at the foot of the Stair. "Compact rate. Don\'t tell the Compact."'),
    journal: S('The Pound Stair: I hummed the Root at the three stuck gates, top to bottom, and the lengthsman\'s raft went down the Stair.'),
    // people
    runner: S('A broadsheet-runner'),
    runnerGreet: S('"Papers from Cantabile, three days old, which is fresh for up here. I don\'t sell them on the road. On the road I just run."'),
    runnerWork: S('"Up the Stair, along the Stride, over the Wash and on to the Hedge. They read every word in Oakhaven and believe one in four."'),
    runnerPlace: S('"Whisper-Grove is on every front page. Plazas full of people, standing. No two papers agree what they\'re standing for."'),
    runnerBark: S('A broadsheet-runner, shifting the bundle under her coat: "Dry. Keep dry."'),
    gauger: S('A Synod gauger'),
    gaugerGreet: S('"Good day. Do mind the chain. It is very accurate, and so am I."'),
    gaugerWork: S('"I measure what the Flume is pumping. It is pumping more than it ought. I write that down."'),
    gaugerPlace: S('"Why? I could not say. I mean that exactly: I could not say."'),
    gaugerBark: S('A Synod gauger, to his book: "Up again. Noted."'),
    length: S('The lengthsman'),
    lengthGreet: S('"Compact\'s man on the Stair. Sixteen locks, sixteen pounds, and a wheel at the bottom nobody lets me turn."'),
    lengthWork: S('"The top three gates have stuck since they chained the lock. There\'s a raft in the top lock wants to go down. Grown wood remembers one note: hum the Root at the top gate, then the second, then the third. In that order. And don\'t knock the stakes. They ring, and the hounds come to a ringing."'),
    lengthPlace: S('"In rain the Stair walks. Water comes down pound by pound and the low road\'s under it. Keep to the banks. After, the bottom pound stands empty a while. There\'s a grating in it nobody talks about."'),
    lengthBark: S('The lengthsman, to a gate: "Come on, old girl."'),
    handA: S('A raft-hand'), handB: S('A raft-hand, older'),
    handGreet: S('"Raft went down by water. We come back by road. Nobody\'s ever invented a raft that goes uphill."'),
    handWork: S('"Timber Compact. Forty logs of iron-bough to the Landing, and walk home. One strike from walking home for good."'),
    handPlace: S('"The Stride at night? Green as a bottle. You can read by it, if you\'ve anything worth reading."'),
    handBark: S('A raft-hand: "My feet. My feet."'),
  };

  // ---------------------------------------------------------------- the land of the Stride (north to south)
  const SW = 120, SH = 180, SGN = 40, SGS = 70;                       // size, the north gate's x, the south gate's x
  const SROAD = [[SGN + 0.5, 0.6], [SGN + 0.5, 7], [47, 17], [39, 29], [45, 43], [37, 57], [47, 71], [43, 85], [52, 99], [64, 107], [61, 121], [72, 134], [63, 148], [73, 161], [SGS + 0.5, 172], [SGS + 0.5, SH - 0.6]];
  const BROOK = [[1, 91], [22, 94], [44, 95], [58, 104], [68, 113], [84, 107], [100, 99], [118, 101]];
  const FLUME = [[90, 0], [58, SH - 1]];                                 // straight, and in the sky
  const RIDGES = [[30, 18, 32, 18, 3.4], [80, 22, 30, 20, 3.8], [12, 48, 18, 14, 2.6], [104, 52, 18, 16, 2.8], [56, 44, 12, 10, 2.0],
    [26, 150, 30, 20, 3.0], [96, 156, 28, 22, 3.4], [56, 168, 20, 10, 2.6], [8, 124, 12, 12, 1.8], [112, 128, 12, 14, 2.0]];
  const BOLES = [55, 36], GAUGE_AT = 0.52;                              // the bee-bole wall's west end; how far down the Flume the gauging stone is
  const CHANNEL_Z = 5.6;
  // ---------------------------------------------------------------- the land of the Pound Stair
  const PW = 96, PH = 190, PGN = 30, PGS = 62, LOCKS = 16, CH = [44, 46], TOPZ = 7.6, STEP = 0.45, BAND = 11, TOP_Y = 8;
  const bandY = (i) => TOP_Y + i * BAND;                                 // the first row of lock i's level (its gate is the row above)
  const levelAt = (i) => TOPZ - STEP * Math.max(0, Math.min(LOCKS, i));
  const POUND = (i) => [50, bandY(i) + 2, 55, bandY(i) + 7];             // a side-pound east of each lock
  // the low road: back and forth down the west side, crossing at the last gate to the south gate
  const PROAD = [[PGN + 0.5, 0.6], [PGN + 0.5, 6], [14, 18], [41, 32], [12, 48], [41, 62], [12, 78], [41, 92], [12, 108], [41, 122], [12, 138], [41, 152], [20, 166], [41, 178], [45, 181], [PGS + 0.5, 184], [PGS + 0.5, PH - 0.6]];
  const HIGH = [[48.5, 2], [48.5, 6], [48.5, 184], [PGS + 0.5, 186]];  // the high path, along the pound-banks
  const TASK_GATES = [1, 2, 3], RAFT_POUND = 6, STAKES = [[56.5, 30.5], [56.5, 63.5], [56.5, 96.5], [56.5, 129.5], [40.6, 46.8], [40.6, 112.8]];

  const TRACK = 1, WATER = 2, SHALLOW = 3, PLANK = 4, MOSS = 5, MUD = 6;
  function floors() { return ['t_grass', typeof ROAD79 !== 'undefined' && ROAD79.ROAD ? ROAD79.ROAD : 't_cobble', 't_water', 't_shallows', 'p17c_plank', 't_moss', 't_moss_p20b_a']; }
  function lineCells(m, pts, w, fn) { const W = m.w; along(pts, 0.4, (px, py) => { for (let dy = 0; dy < w; dy++) for (let dx = 0; dx < w; dx++) { const x = Math.floor(px - (w - 1) / 2) + dx, y = Math.floor(py - (w - 1) / 2) + dy; if (x >= 1 && y >= 1 && x < m.w - 1 && y < m.h - 1) fn(x, y, y * W + x); } }); }
  const distTo = (pts) => { const L = []; along(pts, 0.5, (x, y) => L.push(x, y)); return (x, y) => { let b = 1e9; for (let i = 0; i < L.length; i += 2) { const d = Math.hypot(L[i] - x, L[i + 1] - y); if (d < b) b = d; } return b; }; };

  // ---------------------------------------------------------------- build: the Stride
  function buildStride(up, down) {
    const m = new GameMap(STRIDE, TX.nameS, SW, SH, { outdoor: true, floor: 't_grass', floorTextures: floors(), fogDist: 40, fogColor: [72, 80, 74], music: 'wild', danger: 1, spawn: { x: SGN + 0.5, y: 1.6, dir: PI / 2 } });
    m.border('t_hedge');
    m.set(SGN, 0, DOOR({ tex: 't_hedge', portal: up, label: TX.upToRoad }));
    m.set(SGS, SH - 1, DOOR({ tex: 't_hedge', portal: down, label: TX.downToStair }));
    // the two sides of Sallow Bottom, and the low rises on them; the bottom itself stays low and wet
    for (const [x, y, rx, ry, hh] of RIDGES) m.hill(x, y, rx, ry, hh);
    const W = SW, fl = (x, y) => m.floorCells[y * W + x], roadD = distTo(SROAD), brook = new Uint8Array(SW * SH);
    lineCells(m, BROOK, 2, (x, y, i) => { brook[i] = 1; m.setFloor(x, y, WATER); });
    for (let y = 1; y < SH - 1; y++) for (let x = 1; x < SW - 1; x++) { if (brook[y * W + x]) continue; let b = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (brook[(y + dy) * W + x + dx]) b = true; if (b || (y > 84 && y < 116 && h2(x, y) < 0.18)) m.setFloor(x, y, MOSS); }
    // the road, two wide; where it meets the brook it is a ford (shallow), with a footbridge beside it
    const FORD = [];
    lineCells(m, SROAD, 2, (x, y, i) => { if (brook[i]) { m.setFloor(x, y, SHALLOW); FORD.push([x, y]); } else m.setFloor(x, y, TRACK); });
    const fords = []; for (const [x, y] of FORD) if (!fords.some((f) => Math.hypot(f[0] - x, f[1] - y) < 6)) fords.push([x, y]);
    const BRIDGES = [];
    for (const [fx, fy] of fords) {      // a footbridge a few paces upstream: planks over the brook, a track to it from the road
      let bx = fx + 4, best = null; for (let dx = 3; dx <= 7 && !best; dx++) for (const sx of [1, -1]) { const x = fx + dx * sx; let ys = []; for (let y = fy - 4; y <= fy + 4; y++) if (brook[y * W + x]) ys.push(y); if (ys.length) { best = [x, ys]; bx = x; break; } }
      if (!best) continue;
      const [x, ys] = best, y0 = ys[0] - 1, y1 = ys[ys.length - 1] + 1;
      for (let y = y0; y <= y1; y++) for (const xx of [x, x + 1]) m.setFloor(xx, y, PLANK);
      lineCells(m, [[x + 0.5, y0 - 0.5], [fx + 0.5, y0 - 2]], 1, (xx, yy, i) => { if (!brook[i]) m.setFloor(xx, yy, TRACK); });
      lineCells(m, [[x + 0.5, y1 + 0.5], [fx + 0.5, y1 + 2]], 1, (xx, yy, i) => { if (!brook[i]) m.setFloor(xx, yy, TRACK); });
      BRIDGES.push([x + 0.5, y0 - 0.6]); void bx;
    }
    m._p83 = { FORD, BRIDGES };
    // the Flume: a trunk every eight paces along a straight line, tall enough that the channel runs level over the hills
    const [fa, fb] = FLUME, len = Math.hypot(fb[0] - fa[0], fb[1] - fa[1]), PIERS = [];
    for (let t = 6; t < len - 4; t += 8) {
      const x = Math.floor(fa[0] + (fb[0] - fa[0]) * t / len), y = Math.floor(fa[1] + (fb[1] - fa[1]) * t / len);
      if (roadD(x + 0.5, y + 0.5) < 2.2 || brook[y * W + x]) continue;
      m.block(x, y, 'p16f_grown', CHANNEL_Z, { capTex: 'p16f_grown2' });
      PIERS.push([x, y]);
    }
    m._p83.PIERS = PIERS;
    const P = (t) => [fa[0] + (fb[0] - fa[0]) * t, fa[1] + (fb[1] - fa[1]) * t];
    m.deco('sign', ...P(0.47).map((v, k) => v + (k ? 0.6 : 2.2)), { radius: 0.2, scale: 0.8, label: TX.stride });
    PIERS.forEach(([x, y], k) => { if (k % 2 === 0) m.deco('p83_none', x + 0.5, y + 1.4, { radius: 0.1, scale: 0.5, solid: false, label: TX.pier, _p83: 'pier' }); });
    // the green light under the channel at night: lamps of nothing, on the ground along the line, shown after dusk
    for (let t = 0.04; t < 0.98; t += 0.045) { const [x, y] = P(t); m.deco('p83_none', x + 0.5, y + 0.5, { radius: 0.05, scale: 0.4, solid: false, glow: 0.9, lightCol: [40, 120, 70], hidden: true, _p83: 'green' }); }
    // Ennis Crowle's bee-boles: a low wall with three niches, a skep in each
    const [bx0, by0] = BOLES;
    for (let x = bx0; x <= bx0 + 6; x++) if (!m.get(x, by0) && fl(x, by0) !== TRACK) m.block(x, by0, 't_stone', m.groundAt(x + 0.5, by0 + 0.5) + 0.95, { capTex: 't_stone' });
    for (const k of [1, 3, 5]) m.deco('p9_skep', bx0 + k + 0.5, by0 + 1.15, { radius: 0.25, scale: 0.75, label: TX.skep });
    m.deco('sign', bx0 - 0.6, by0 + 1.4, { radius: 0.2, scale: 0.7, label: TX.boles });
    // the gauging stone, at the foot of the trunk nearest the road in the bottom
    const gp = PIERS.reduce((b, p) => (Math.abs(p[1] - 100) < Math.abs(b[1] - 100) ? p : b), PIERS[0]);
    m.deco('p20_stone', gp[0] + 1.4, gp[1] + 0.6, { radius: 0.2, scale: 0.42, label: TX.gauge, _p83: 'gauge' });
    m.deco('sign', fords[0] ? fords[0][0] - 2.6 : 40, fords[0] ? fords[0][1] - 1.4 : 90, { radius: 0.2, scale: 0.7, label: TX.brook, _p83: 'brook' });
    for (const [x, y] of BRIDGES) m.deco('sign', x - 1.2, y, { radius: 0.2, scale: 0.6, label: TX.plank });
    // trees: willow and alder along the brook, oaks on the sides, thorn on the tops; never on the road, never under a trunk
    const free = (x, y, r) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 2 || cy < 2 || cx > SW - 3 || cy > SH - 3 || m.get(cx, cy)) return false; const f = fl(cx, cy); if (f !== 0 && f !== MOSS) return false; if (roadD(x, y) < 2.6) return false; for (const [px, py] of PIERS) if (Math.hypot(px + 0.5 - x, py + 0.5 - y) < 2.2) return false; return !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r); };
    along(BROOK, 3.1, (x, y) => { for (const s of [-1, 1]) { const k = Math.floor(x * 7 + y * 3 + s), ox = x + (h2(k, 3) - 0.5) * 2, oy = y + s * (2.6 + h2(k, 5) * 1.8); if (free(ox, oy, 1.8)) m.deco(h2(k, 9) < 0.55 ? 'willow' : 'p22_ash', ox, oy, { radius: 0.4, scale: 1.4 + h2(k, 11) * 0.6 }); } });
    // copses on the sides of the valley, and trees scattered between
    const COPSE = [[14, 30], [96, 34], [20, 62], [100, 70], [30, 132], [92, 140], [12, 160], [104, 166], [64, 26], [84, 120]];
    COPSE.forEach(([cx, cy], ci) => { for (let i = 0; i < 16; i++) { const an = h2(ci * 17 + i, 61) * PI * 2, rr = Math.sqrt(h2(ci * 29 + i, 67)) * 8, x = cx + Math.cos(an) * rr, y = cy + Math.sin(an) * rr * 0.8; if (free(x, y, 1.9)) m.deco(h2(ci, i) < 0.8 ? 'oak' : 'p22_ash', x, y, { radius: 0.45, scale: 1.5 + h2(ci, i + 3) * 0.8 }); } });
    for (let i = 0; i < 600; i++) { const x = 3 + h2(i, 71) * (SW - 6), y = 3 + h2(i, 73) * (SH - 6), z = m.groundAt(x, y); if (!free(x, y, 3.0)) continue;
      if (z > 2.4 && h2(i, 79) < 0.5) m.deco('p20_thorn', x, y, { radius: 0.3, scale: 0.9 + h2(i, 81) * 0.4 }); else if (z > 0.5 || h2(i, 83) < 0.3) m.deco('oak', x, y, { radius: 0.45, scale: 1.4 + h2(i, 85) * 0.8 }); }
    // danger 1 (the plan): briar-sprites in the verge, in three knots beside the road
    for (const [t, side] of [[0.22, 1], [0.5, -1], [0.78, 1]]) { const k = Math.floor(t * (SROAD.length - 1)), [ax, ay] = SROAD[k], [bx, by] = SROAD[k + 1], dl = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / dl * side, ny = (bx - ax) / dl * side, mx = (ax + bx) / 2, my = (ay + by) / 2;
      for (let n = 0; n < 3; n++) { const x = mx + nx * (3.2 + n * 0.7) + (n - 1) * 0.9, y = my + ny * (3.2 + n * 0.7); if (!m.isBlocked(Math.floor(x), Math.floor(y)) && fl(Math.floor(x), Math.floor(y)) !== WATER) m.enemy('briarsprite', x, y); } }
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- build: the Pound Stair
  function buildStair(up, down) {
    const m = new GameMap(STAIR, TX.nameP, PW, PH, { outdoor: true, floor: 't_grass', floorTextures: floors(), fogDist: 40, fogColor: [72, 80, 74], music: 'wild', danger: 1, spawn: { x: PGN + 0.5, y: 1.6, dir: PI / 2 } });
    m.border('t_hedge');
    m.set(PGN, 0, DOOR({ tex: 't_hedge', portal: up, label: TX.upToStride }));
    m.set(PGS, PH - 1, DOOR({ tex: 't_hedge', portal: down, label: TX.downToLanding }));
    // the hill, in sixteen steps: each lock's level is flat, and a short slope takes you down to the next
    m.ramp(1, 1, PW - 2, TOP_Y - 1, TOPZ, TOPZ, 'y');
    for (let i = 0; i < LOCKS; i++) {
      const y0 = bandY(i), y1 = Math.min(PH - 2, y0 + BAND - 3);
      m.ramp(1, y0, PW - 2, y1, levelAt(i), levelAt(i), 'y');
      if (y1 + 2 <= PH - 2) m.ramp(1, y1 + 1, PW - 2, y1 + 2, levelAt(i), levelAt(i + 1), 'y');
    }
    const last = bandY(LOCKS); if (last < PH - 2) m.ramp(1, last, PW - 2, PH - 2, levelAt(LOCKS), 0.1, 'y');
    // the shoulders of the hill on either side, higher than the stair, so it lies in a fold
    for (let i = 0; i < 9; i++) { m.hill(2, 12 + i * 21, 9, 12, levelAt(i * 2) + 1.4); m.hill(PW - 3, 18 + i * 21, 12, 13, levelAt(i * 2) + 1.8); }
    const W = PW, chan = new Uint8Array(PW * PH), pound = new Uint8Array(PW * PH);
    // the channel down the middle of the stair, and the gates across it (their top beams are the crossings)
    for (let y = 1; y < PH - 1; y++) for (let x = CH[0]; x <= CH[1]; x++) { chan[y * W + x] = 1; m.setFloor(x, y, WATER); }
    const GATES = [];
    for (let i = 0; i <= LOCKS; i++) { const y = bandY(i) - 1; if (y < 1 || y > PH - 2) continue; for (let x = CH[0] - 1; x <= CH[1] + 1; x++) { chan[y * W + x] = 0; m.setFloor(x, y, PLANK); } GATES.push(y); }
    // the lock walls: grown wood a little above the water on both sides, open only where a gate's beam crosses
    for (let y = 2; y < PH - 1; y++) { if (GATES.includes(y)) continue; for (const x of [CH[0] - 1, CH[1] + 1]) m.block(x, y, 'p16f_grown', m.groundAt(x + 0.5, y + 0.5) + 0.42, { capTex: 'p16f_grown2' }); }
    for (let i = 0; i < LOCKS; i++) { const [x0, y0, x1, y1] = POUND(i); for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { pound[y * W + x] = 1; m.setFloor(x, y, WATER); } }
    lineCells(m, PROAD, 2, (x, y, i) => { if (!chan[i] && !pound[i]) m.setFloor(x, y, TRACK); });
    lineCells(m, HIGH, 1, (x, y, i) => { if (!chan[i] && !pound[i] && m.floorCells[i] !== PLANK) m.setFloor(x, y, TRACK); });
    // the low road's cells that the water takes when the Stair walks (beside the channel, on the west)
    const LOW = []; for (let y = 1; y < PH - 1; y++) for (let x = CH[0] - 4; x < CH[0] - 1; x++) if (m.floorCells[y * W + x] === TRACK) LOW.push([x, y]);
    m._p83 = { GATES, LOW, chan, pound };
    // the gates themselves (a beam to see), the three that stick, the stakes, the raft, the grating, the posts
    GATES.forEach((y, i) => { const task = TASK_GATES.indexOf(i + 1);
      m.deco('p83_gate', CH[0] - 0.4, y + 0.5, { radius: 0.15, scale: 0.9, solid: false, label: task >= 0 ? TX.gateStuck : TX.gate, use: task >= 0 ? 'p83_gate' : undefined, _p83: task >= 0 ? 'tgate' : 'gate', _i: task }); });
    for (const [x, y] of STAKES) m.deco('p12r_post', x, y, { radius: 0.15, scale: 0.6, label: TX.stake, _p83: 'stake' });
    const [rx0, ry0, rx1, ry1] = POUND(RAFT_POUND);
    m.deco('p16f_raft', (rx0 + rx1) / 2 + 0.5, (ry0 + ry1) / 2 + 0.5, { solid: false, scale: 1.1, yOff: -0.1, label: TX.raft });
    m.add({ kind: 'item', item: 'cache', tier: 2, x: rx0 - 0.6, y: (ry0 + ry1) / 2 + 0.5, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: TX.raft });
    m.deco('p16f_raft', (CH[0] + CH[1]) / 2 + 0.5, bandY(0) + 4, { solid: false, scale: 0.9, yOff: -0.1, label: TX.raftUp, _p83: 'raft' });
    const [gx0, gy0, gx1, gy1] = POUND(LOCKS - 1);
    m.deco('p83_grate', (gx0 + gx1) / 2 + 0.5, (gy0 + gy1) / 2 + 0.5, { radius: 0.3, scale: 0.8, solid: false, label: TX.grate, hidden: true, _p83: 'grate' });
    m.deco('sign', PGN - 2.4, 4.6, { radius: 0.2, scale: 0.8, label: TX.stair });
    // danger 1 (the plan): mire-drones lying at the edge of two of the pounds, and a pair of hounds on the shoulder that come to a ringing
    for (const i of [4, 11]) { const [x0, y0, x1, y1] = POUND(i); m.enemy('miredrone', x1 + 1.6, (y0 + y1) / 2 + 0.5, { passive: true, facing: PI }); }   // on the bank at the pound's edge (water blocks)
    for (const [x, y] of [[66.5, 96.5], [68.0, 97.6]]) if (!m.isBlocked(Math.floor(x), Math.floor(y))) m.enemy('hound', x, y);
    for (let i = 0; i < LOCKS; i += 5) { const [x0, y0] = POUND(i); m.deco('sign', x0 - 0.8, y0 - 0.2, { radius: 0.15, scale: 0.6, label: TX.pound }); }
    // trees on the shoulders, reed at the pound-sides
    const free = (x, y, r) => { const cx = Math.floor(x), cy = Math.floor(y); if (cx < 2 || cy < 2 || cx > PW - 3 || cy > PH - 3 || m.get(cx, cy) || m.floorCells[cy * W + cx] !== 0) return false; return !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r); };
    const rd = distTo(PROAD);
    for (let i = 0; i < 160; i++) { const x = 2 + h2(i, 31) * (PW - 4), y = 3 + h2(i, 37) * (PH - 6); if ((x > 9 && x < 58) || rd(x, y) < 3 || !free(x, y, 2.2)) continue; m.deco(h2(i, 41) < 0.7 ? 'oak' : 'p22_ash', x, y, { radius: 0.45, scale: 1.4 + h2(i, 43) * 0.7 }); }
    for (let i = 0; i < LOCKS; i++) { const [x0, y0, x1] = POUND(i); for (const x of [x0 + 0.6, x1 + 0.4]) if (free(x, y0 - 0.5, 0.8)) m.deco(Engine.sprites && Engine.sprites.p_reed1 ? 'p_reed' + (1 + (i % 2)) : 'oak', x, y0 - 0.5, { radius: 0.1, scale: 0.55, solid: false }); }
    m.baseCount = m.entities.length;
    return m;
  }

  // ---------------------------------------------------------------- joined into the world
  const doorTo = (m, target) => { for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === target) return c; } return null; };
  function join(maps) {
    const road = maps.flume_road, land = maps.flume_landing; if (!road || !land || maps[STRIDE]) return false;
    const out = doorTo(road, 'flume_landing'), back = doorTo(land, 'flume_road'); if (!out || !back) return false;
    const sN = { map: STRIDE, x: SGN + 0.5, y: 1.6, dir: PI / 2 }, sS = { map: STRIDE, x: SGS + 0.5, y: SH - 1.6, dir: -PI / 2 };
    const pN = { map: STAIR, x: PGN + 0.5, y: 1.6, dir: PI / 2 }, pS = { map: STAIR, x: PGS + 0.5, y: PH - 1.6, dir: -PI / 2 };
    maps[STRIDE] = buildStride(Object.assign({}, back.portal), pN);
    maps[STAIR] = buildStair(sS, Object.assign({}, out.portal));
    out.portal = sN; back.portal = pS;
    return true;
  }

  // ---------------------------------------------------------------- the hour, the weather, the task
  const f = () => G.flags, fint = (k) => { const v = Number(f()['p83_' + k]); return Number.isFinite(v) ? v : 0; };
  const clock = () => (Number(G.day) || 0) * 24 + hour();
  let lastWet = null;
  function sync() {
    if (typeof G === 'undefined' || !G.map || !G.flags) return;
    const id = G.map.id; if (id !== STRIDE && id !== STAIR) { if (lastWet !== null && !wet() && lastWet) f().p83_drained = clock(); lastWet = wet(); return; }
    const m = G.map, d = m._p83 || {}, nt = night(), w = wet();
    if (lastWet && !w) f().p83_drained = clock();
    lastWet = w;
    const cam = typeof Engine !== 'undefined' ? Engine.cam : null;
    if (id === STRIDE) {
      for (const e of G.ents) { if (!e || !e._p83) continue; if (e._p83 === 'green') e.hidden = !nt; if (e._p83 === 'pier') e.label = nt ? TX.pierNight : TX.pier; if (e._p83 === 'brook') e.label = w ? TX.brookWet : TX.brook; }
      // the fords go under in rain (never round someone standing in one)
      const inFord = !!cam && (d.FORD || []).some(([x, y]) => Math.abs(cam.x - x - 0.5) < 1.6 && Math.abs(cam.y - y - 0.5) < 1.6);
      for (const [x, y] of d.FORD || []) { const want = w && !inFord ? WATER : SHALLOW; if (m.floorCells[y * m.w + x] !== want && !(w && inFord)) m.floorCells[y * m.w + x] = want; }
    } else {
      // the Stair walks in rain: the low road beside the channel goes under; the banks stay dry
      const near = !!cam && (d.LOW || []).some(([x, y]) => Math.abs(cam.x - x - 0.5) < 1.6 && Math.abs(cam.y - y - 0.5) < 1.6);
      for (const [x, y] of d.LOW || []) { const want = w ? WATER : TRACK; if (m.floorCells[y * m.w + x] !== want && !(w && near)) m.floorCells[y * m.w + x] = want; }
      // after a surge the bottom pound stands empty a while (six hours), and the grating shows
      const empty = !w && fint('drained') > 0 && clock() - fint('drained') < 6;
      const [x0, y0, x1, y1] = POUND(LOCKS - 1);
      for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) { const want = empty ? MUD : WATER; if (m.floorCells[y * m.w + x] !== want) m.floorCells[y * m.w + x] = want; }
      const bits = fint('gates'), down = fint('raft') === 1;
      for (const e of G.ents) { if (!e || !e._p83) continue;
        if (e._p83 === 'grate') e.hidden = !empty;
        if (e._p83 === 'tgate') { const open = !!(bits & (1 << e._i)); e.label = open ? TX.gateOpen : TX.gateStuck; }
        if (e._p83 === 'raft') { e.y = down ? bandY(LOCKS - 1) + 4 : bandY(0) + 4; e.label = down ? TX.raftDown : TX.raftUp; } }
      // "don't knock the stakes"
      if (cam) for (const e of G.ents) { if (!e || e._p83 !== 'stake') continue; const dd = Math.hypot(e.x - cam.x, e.y - cam.y); if (dd < 0.55 && !e._rang) { e._rang = true; G.noise = Math.max(Number(G.noise) || 0, 3.2); say(TX.stakeRing, 'warn', 4500); } else if (dd > 1.2) e._rang = false; }
    }
  }
  // hum the Root at a stuck gate: the top one first, then the second, then the third
  function hummed() {
    if (typeof G === 'undefined' || !G.map || G.map.id !== STAIR || fint('raft') === 1) return false;
    const c = Engine.cam, gate = G.ents.find((e) => e && e._p83 === 'tgate' && Math.hypot(e.x - c.x, e.y - c.y) <= 3.4); if (!gate) return false;
    const bits = fint('gates'), next = bits === 0 ? 0 : bits === 1 ? 1 : bits === 3 ? 2 : -1;
    if (gate._i !== next) { f().p83_gates = 0; G.noise = Math.max(Number(G.noise) || 0, 3.2); say(TX.humWrong, 'warn', 6000); return true; }
    f().p83_gates = bits | (1 << gate._i);
    if (gate._i < 2) { say(gate._i === 0 ? TX.hum1 : TX.hum2, 'good', 6000); return true; }
    f().p83_raft = 1; say(TX.hum3, 'good', 8000);
    try { G.gold(8); questXp(35); journal('side', TX.journal); } catch (e) { /* no purse */ }
    setTimeout(() => say(TX.paid, 'good', 6000), 2500);
    sync(); return true;
  }
  function useOwn(e) {
    if (!e || e.use !== 'p83_gate') return false;
    say(e.label, '', 5000); return true;
  }

  // ---------------------------------------------------------------- the people
  const st = (from, to, job, at) => ({ from, to, job, at: [Math.floor(at[0]) + 0.5, Math.floor(at[1]) + 0.5] });
  const ROSTERS = {
    [STRIDE]: [
      { key: 'fl_runner', name: TX.runner, sprite: 'p60_wom_b', home: [SGS + 0.5, SH - 1.6], exit: [SGS + 0.5, SH - 1.6],
        day: [st(7, 9, 'carry', [61, 121]), st(9, 11, 'carry', [45, 43]), { from: 11, to: 15, job: 'home', at: [SGN + 0.5, 1.6] }, st(15, 17, 'carry', [52, 99]), { from: 17, to: 7, job: 'home', at: [SGS + 0.5, SH - 1.6] }],
        greet: TX.runnerGreet, work: TX.runnerWork, place: TX.runnerPlace, barks: [TX.runnerBark] },
      { key: 'fl_gauger', name: TX.gauger, sprite: 'p60_man_a', home: [SGN + 0.5, 1.6], exit: [SGN + 0.5, 1.6],
        day: [st(9, 12, 'reach', [70, 92]), st(12, 13, 'sit', [66, 96]), st(13, 16, 'reach', [74, 80]), { from: 16, to: 9, job: 'home' }],
        greet: TX.gaugerGreet, work: TX.gaugerWork, place: TX.gaugerPlace, barks: [TX.gaugerBark] },
    ],
    [STAIR]: [
      { key: 'fl_length', name: TX.length, sprite: 'p16f_keeper', home: [PGN + 0.5, 1.6],
        day: [st(6, 12, 'rake', [41, bandY(1) + 2]), st(12, 13, 'sit', [36, bandY(2) + 3]), st(13, 19, 'rake', [41, bandY(3) + 3]), { from: 19, to: 6, job: 'home' }],
        greet: TX.lengthGreet, work: TX.lengthWork, place: TX.lengthPlace, barks: [TX.lengthBark] },
      { key: 'fl_handa', name: TX.handA, sprite: 'p16f_rafter', home: [PGS + 0.5, PH - 1.6], exit: [PGN + 0.5, 1.6],
        day: [st(17, 18, 'carry', [38, 152]), st(18, 19, 'carry', [12, 78]), { from: 19, to: 17, job: 'home', at: [PGN + 0.5, 1.6] }],
        greet: TX.handGreet, work: TX.handWork, place: TX.handPlace, barks: [TX.handBark] },
      { key: 'fl_handb', name: TX.handB, sprite: 'p16f_dockman', home: [PGS + 0.5, PH - 1.6], exit: [PGN + 0.5, 1.6],
        day: [st(17, 18, 'carry', [37, 151]), st(18, 19, 'carry', [13, 79]), { from: 19, to: 17, job: 'home', at: [PGN + 0.5, 1.6] }],
        greet: TX.handGreet, work: TX.handWork, place: TX.handPlace, barks: [TX.handBark] },
    ],
  };

  // ---------------------------------------------------------------- art (code only)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    add('p83_none', 2, 2, 0.1, () => {});
    // a lock gate's balance beam, black grown timber
    add('p83_gate', 48, 24, 0.5, (x) => { x.fillStyle = '#2a2016'; x.fillRect(2, 8, 44, 6); x.fillStyle = '#4a3a28'; x.fillRect(2, 8, 44, 2); x.fillStyle = '#1c150e'; x.fillRect(4, 14, 5, 10); x.fillRect(39, 14, 5, 10); x.fillStyle = '#6a5a3a'; x.fillRect(20, 6, 8, 3); });
    // a grating of iron bars in a stone frame, seen from above
    add('p83_grate', 36, 16, 0.25, (x) => { x.fillStyle = '#5a564e'; x.fillRect(0, 2, 36, 14); x.fillStyle = '#121212'; x.fillRect(3, 4, 30, 10); x.fillStyle = '#4a3a2a'; for (let i = 0; i < 8; i++) x.fillRect(4 + i * 4, 4, 1.6, 10); x.fillRect(3, 8, 30, 1.6); });
  }

  // ---------------------------------------------------------------- the channel in the sky, in the 3D view
  function wire3d() {
    if (typeof EAVES78 === 'undefined' || !EAVES78.STYLES || !EAVES78.REGION) return;
    const none = () => ({ houses: [] });
    EAVES78.STYLES[STRIDE] = { builds: 'nothing built: grown wood', shutters: 'none', only: ['the Flume on its trunks, the channel in the sky, green after dusk'], plan: none };
    EAVES78.MAPS.add(STRIDE);
    EAVES78.REGION[STRIDE] = (m, T) => {
      const P = (m._p83 && m._p83.PIERS) || []; if (P.length < 2) return;
      const Lw = T.L('p16f_grown'), Lc = T.L('p16f_grown2'), Ls = T.L('e82_sap');
      const z0 = CHANNEL_Z - 0.45, z1 = CHANNEL_Z, z2 = CHANNEL_Z + 0.32;
      for (let i = 0; i + 1 < P.length; i++) {
        const [ax, ay] = P[i], [bx, by] = P[i + 1]; if (Math.hypot(bx - ax, by - ay) > 18) continue;
        const x0 = Math.min(ax, bx) + 0.12, x1 = Math.max(ax, bx) + 0.88, y0 = ay + 0.0, y1 = by + 1.0;
        // the trough: a floor slab and two walls, the full length between two trunks (the line runs mostly north-south)
        T.box(x0, y0, x1, y1, z0, z1, Lc, Lw, 0.95);
        T.box(x0, y0, x0 + 0.16, y1, z1, z2, Lw, Lc, 0.85); T.box(x1 - 0.16, y0, x1, y1, z1, z2, Lw, Lc, 0.85);
        // the water in it: dull by day, the sap-light after dusk
        const G2 = T.dusk ? T.MAT.glow : T.MAT.wall;
        T.quad([[x0 + 0.17, y0, z2 - 0.08], [x1 - 0.17, y0, z2 - 0.08], [x1 - 0.17, y1, z2 - 0.08], [x0 + 0.17, y1, z2 - 0.08]], [[0, 0], [1, 0], [1, 4], [0, 4]], Ls, G2, T.dusk ? 11 : 0.7, [0, 0, 1]);
        T.quad([[x0 + 0.17, y1, z0 - 0.002], [x1 - 0.17, y1, z0 - 0.002], [x1 - 0.17, y0, z0 - 0.002], [x0 + 0.17, y0, z0 - 0.002]], [[0, 0], [1, 0], [1, 4], [0, 4]], Lc, T.MAT.wall, 0.45, [0, 0, -1]);
      }
    };
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    art(); wire3d();
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () {
        const maps = _b.apply(this, arguments);
        try { art(); if (join(maps) && typeof FLORA !== 'undefined' && FLORA.place) FLORA.place({ [STRIDE]: maps[STRIDE], [STAIR]: maps[STAIR] }); } catch (e) { warnOnce('build', e); }
        return maps;
      };
    }
    try { if (typeof FLORA !== 'undefined' && FLORA.PLANS) { FLORA.PLANS[STRIDE] = FLORA.PLANS[STRIDE] || { grass: 1100, reed: 120 }; FLORA.PLANS[STAIR] = FLORA.PLANS[STAIR] || { grass: 700, reed: 90 }; } } catch (e) { /* no grass */ }
    try { if (typeof LANDMARKS !== 'undefined') for (const id of [STRIDE, STAIR]) if (!LANDMARKS[id]) LANDMARKS[id] = [
      { a: -1.6, aw: 1.3, h: 0.16, p: 1.2, ridge: 0.45, seed: 4.4, far: 0.75, c: [48, 54, 52] },
      { a: 1.5, aw: 1.5, h: 0.10, p: 1.0, ridge: 0.35, seed: 7.1, far: 0.6, c: [44, 50, 50] },
    ]; } catch (e) { /* the plain sky */ }
    try { if (typeof LIFE60 !== 'undefined' && LIFE60.add) for (const id of [STRIDE, STAIR]) LIFE60.add(id, ROSTERS[id], {}); } catch (e) { warnOnce('people', e); }
    if (typeof useDeco === 'function') { const _u = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (er) { /* fall through */ } return _u.apply(this, arguments); }; }
    if (typeof castSong === 'function') {
      const _c = castSong;
      castSong = function (id) {
        const p = typeof G !== 'undefined' ? G.player : null, s = typeof SONGS !== 'undefined' ? SONGS[id] : null, before = p ? p.voice : 0;
        const r = _c.apply(this, arguments);
        try { if (p && s && id === 'root' && G.song && G.song.t > 0 && before - p.voice >= (s.cost || 0) - 0.01) hummed(); } catch (e) { warnOnce('song', e); }
        return r;
      };
    }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(); } catch (e) { warnOnce('sync', e); } return r; }; }
    if (typeof update === 'function') { const _u2 = update; update = function () { const r = _u2.apply(this, arguments); try { sync(); } catch (e) { /* next frame */ } return r; }; }
    // the finger-posts at the four new gates (js/bearings82b.js reads this list) [PROPOSED]
    if (typeof window !== 'undefined') {
      // the lane's and the Landing's posts now stand by the doors onto this road
      window.P82B_REMAP = Object.assign(window.P82B_REMAP || {}, { flume_road: { flume_landing: STRIDE }, flume_landing: { flume_road: STAIR } });
      window.P82B_POSTS = (window.P82B_POSTS || []).concat([
        { id: 'stride_north', map: STRIDE, to: ['flume_road'], text: S('A finger-post. THE FLUME ROAD, up. Under it, smaller: OAKHAVEN, by the sluice-arch.') },
        { id: 'stride_south', map: STRIDE, to: [STAIR], text: S('A finger-post. THE POUND STAIR. Under it, smaller: STILLWATER LANDING.') },
        { id: 'stair_north', map: STAIR, to: [STRIDE], text: S('A finger-post. THE STRIDE, up. Under it, smaller: THE FLUME ROAD.') },
        { id: 'stair_south', map: STAIR, to: ['flume_landing'], text: S('A finger-post. STILLWATER LANDING, down. Somebody has cut under it: mind the gates.') },
      ]);
    }
  }
  wire();

  return { STRIDE, STAIR, TX, TEXTS, ROSTERS, SROAD, PROAD, HIGH, BROOK, FLUME, LOCKS, POUND, bandY, levelAt, CH, TASK_GATES, STAKES, buildStride, buildStair, join, sync, hummed, useOwn, h2 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = FLUME83;
if (typeof window !== 'undefined') window.FLUME83 = FLUME83;
