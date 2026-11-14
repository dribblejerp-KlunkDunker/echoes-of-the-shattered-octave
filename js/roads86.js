// ============================================================
//  roads86 — Phase 86: danger and reward on the roads (design approved by the owner on 14 Nov: "yes, yes, yes, yes,
//  yes, no they work well, yes"). Record: story/Game Layer/Phase 86 - Danger and reward on the roads (design, for
//  ruling).md.
//
//    rosters   what walks each road by hour and weather: packs on the Greenroot road after dark, the briar awake on
//              the Stride in and after rain and asleep in snow, drones on the Flume road's banks at night and all day
//              in storm, the Hollows' hounds out by day in mist, woolwights down off the high ground in snow. Worked
//              out from the day, the hour and the weather, never chance; the fallen come back the next day.
//    camps     hostile (an Office survey camp, a Quiet Faith vigil, the hound den, a briar-bed): occupied four days in
//              six, cold for a week once cleared, a crate to take. Friendly fires (the raft-hands', the Three Pines)
//              where you can sit until morning.
//    keepers   one for each road, out only at its own hour and weather: the Hiss (Long Common, night, wet), the Briar
//              Queen (the Stride, the day after rain), the Hollow Dog (the Hollows, mist), the Sunk Bell (the Lanes'
//              deepest pool, storm). Down for a week once put down; each leaves a trophy (for selling and bounties
//              only: no new gear, on the owner's word).
//    bounties  from the people already on the roads: the turf-cutter, the lengthsman, the returners, the salvagers.
//              One keeper bounty each, and the week's work, renewed every eight-day week.
//    column    the Office assessor and her column, one road a day, camped at night and in storm. Fighting it goes in
//              the Office's book (a small crime), on the owner's word.
//    boards    every notice board says what is out on the roads today.
//  Everything here is [PROPOSED] under the approved design. Flags (small ints, validated on read): p86_rain (the day it
//  last rained), p86k_<keeper> (the day it was put down), p86c_<camp> / p86cr_<camp> (cleared / crate taken),
//  p86b_<giver> (0, 1 taken, 2 paid), p86w_/p86wb_/p86wd_<giver> (the week's work), p86n_<map>_<type> (kills, capped),
//  p86col (the day the column was broken), p86lead (lead taken this week, as bits). No visual uses random numbers.
// ============================================================
'use strict';

const ROADS86 = (function () {
  const PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('roads86: ' + k, e); } };
  const h2 = (a, b) => { const s = Math.sin(a * 127.1 + b * 311.7) * 43758.5453; return s - Math.floor(s); };
  const TX = {
    // keepers
    hiss: S('The Hiss'), hissSeen: S('Out on the Common, in the rain, a hiss like a kettle left on: the pack\'s mother, the size of a pony. You heard her before you saw her.'),
    queen: S('The Briar Queen'), queenSeen: S('In the verge something the size of a cart lifts itself on a thousand thorns, every one with its little lamp lit.'),
    dog: S('The Hollow Dog'), dogSeen: S('Out of the mist in the hollow, the dog that dens deepest. It does not bark. It has never needed to.'),
    bell: S('The Sunk Bell'), bellSeen: S('The pool rings, once, from underneath. A drone grown under a fallen bell-tower comes up, and its note is the bell\'s.'),
    hissDown: S('The Hiss is down. It will be a week before anything takes her place on the Common.'), queenDown: S('The Briar Queen is down. The verges will be a week growing another.'), dogDown: S('The Hollow Dog is down. The dens are quiet, for a week.'), bellDown: S('The Sunk Bell is down. The pool will not ring again for a week.'),
    // trophies
    collar: S('The Hiss\'s collar'), collarDesc: S('A collar of static, still crackling. It belonged to a dog once. The turf-cutter will know it.'),
    lamps: S('The Briar Queen\'s lamps'), lampsDesc: S('A fistful of the little pale lamps off her thorns. They go on glowing in your pack.'),
    denbone: S('The Hollow Dog\'s den-bone'), denboneDesc: S('A bone from the deepest den, gnawed white. Nobody has asked whose.'),
    clapper: S('The Sunk Bell\'s clapper'), clapperDesc: S('An iron bell-clapper, green with the pool. It still rings if you knock it.'),
    tookCollar: S('You take the Hiss\'s collar.'), tookLamps: S('You take the Briar Queen\'s lamps.'), tookDenbone: S('You take the Hollow Dog\'s den-bone.'), tookClapper: S('You take the Sunk Bell\'s clapper.'),
    // camps
    office: S('An Office survey camp: grey oilcloth, a table, a theodolite on its legs, a ledger.'),
    officeLedger: S('The ledger: names taken on the road, a column for where from and a column for where to. The second column is mostly blank.'),
    vigil: S('A ring of the brothers of the Quiet Faith round a fire laid and never lit. They make no sound at all.'),
    den: S('The hound den, and what the hounds have dragged into it.'),
    briar: S('A briar-bed in the verge: a knot of sprites round something they have stripped to the buckles.'),
    campCold: S('A cold camp: ashes, marks in the grass, nobody.'),
    campClear: S('The camp is cleared. Nobody will be back here for a week.'),
    crate: S('The camp\'s crate'), crateTake: S('You go through the camp\'s crate: {0} sovereigns.'), crateEmpty: S('The crate is empty.'), crateShut: S('Not while the camp is held.'),
    fire: S('A fire kept small, and room beside it'), fireSit: S('You sit by the fire until morning. The night goes by on the road without you.'), fireNo: S('Not with something coming.'),
    rafthands: S('The raft-hands\' fire. Men walking home from the rafts stop here for the night.'), raftA: S('A raft-hand, walking home: "Sit, if you like. Nobody\'s coming down this road in the dark that we can\'t see coming."'), raftB: S('A raft-hand, his boots off by the fire: "Six days on the water. Two more on my feet."'),
    // the column
    assessor: S('The Assessor'),
    columnSeen: S('An Office column on the road: an assessor in grey with her book, two proctors, an outrider, a hushwarden. They are taking names.'),
    columnBook: S('That goes in the Office\'s book.'),
    columnBroken: S('The column is broken. The Office will send another, in a week.'),
    // bounties
    take: S('I\'ll do it.'), later: S('Not now.'), give: S('Here.'), laterSaid: S('"Suit yourself."'),
    cutterOffer: S('"There\'s an old dog runs the pack on the Common. Nights, in the wet: you hear her before you see her. She had my own dog, last winter. Bring me the collar and I\'ll pay what I\'ve got."'),
    cutterWait: S('"Nights, in the wet. You\'ll hear her."'),
    cutterPaid: S('The turf-cutter turns the collar over in his hands and does not say anything for a while. Then he pays you.'),
    lengthOffer: S('"There\'s a queen in the briar on the Stride. Comes up the day after rain. She\'s had the bootlaces off every raft-hand on the Flume. Bring me her lamps."'),
    lengthWait: S('"The day after rain. Look in the verge."'),
    lengthPaid: S('"That\'s her. Compact rate, and a bit over. Don\'t tell the Compact."'),
    retOffer: S('"There\'s a dog in the hollows, in the mist. It sits on the way to our farm. We\'ve the little one. Can you?"'),
    retWait: S('"When the mist\'s down. It\'s always the mist."'),
    retPaid: S('The family look at the bone and then at each other. The father counts out coins he cannot spare and will not let you refuse.'),
    salvOffer: S('"There\'s a drone sits under the old bell-tower in the deep pool. In a storm it comes up. It\'s on our best roof. Fetch us the clapper and you\'re paid."'),
    salvWait: S('"In a storm. Bring a punt and a long arm."'),
    salvPaid: S('"Clapper. Good iron, that. Here."'),
    cutterWeek: S('"The Common wants quieting again. Six of them, this week, and I\'ll pay a fair rate."'),
    lengthWeek: S('"The briar\'s back on the lock-ladders. Eight of the little ones, this week."'),
    retWeek: S('"The hollows are full of dogs again. Five of them gone this week and we\'ll get the cart through."'),
    salvWeek: S('"Lead off the garret roofs. Four pieces this week, off the ones by the long board."'),
    weekSoFar: S('"{0} of {1}. Keep at it."'),
    weekPaid: S('"That\'s the week\'s work done, then."'), weekThanks: S('"Good. Here\'s your money."'),
    weekDone: S('"That\'s this week done. Come back next week."'),
    lead: S('Lead flashing on a garret roof, half off already'), leadTake: S('You peel off a piece of lead. {0} of 4.'), leadGone: S('The lead is gone from this one.'),
    journalCutter: S('The turf-cutter on the Long Common wants the collar of the Hiss, the pack\'s mother: out at night in the wet.'),
    journalLength: S('The lengthsman wants the Briar Queen\'s lamps: she is in the Stride\'s verges the day after rain.'),
    journalRet: S('The returning family on the drove road want the Hollow Dog gone: it comes out in the mist.'),
    journalSalv: S('The salvagers in Cross Pool want the Sunk Bell\'s clapper: it comes up in a storm, in the Lanes\' deepest pool.'),
    // the boards
    roadsHead: S('On the roads today'),
    bGreen: S('The Greenroot road: two dogs on the Common by day, nothing worse.'), bGreenNight: S('The Greenroot road: the pack is out on the Common after dark, and a Dirge comes out of the Wood. Keep your voice down.'),
    bGreenWet: S('In the wet the dogs come closer to the road.'), bGreenSnow: S('Snow on the Greenroot road. It is quiet; half the dogs are lying up.'), bGreenMist: S('Moths in Greenroot Wood in the mist.'),
    bFlume: S('The Flume road: briar in the verges on the Stride.'), bFlumeWet: S('The briar is up with the rain: twice as many, and the day after, something bigger.'), bFlumeNight: S('Drones on the pound banks after dark.'), bFlumeStorm: S('Storm: the pounds are surging, drones out all day.'), bFlumeSnow: S('Snow on the Flume road: the briar sleeps.'),
    bDrove: S('The drove road: quiet on the Wethers.'), bDroveNight: S('After dark: hounds in the Hollows, and the silent brothers at the stones.'), bDroveMist: S('Mist on the drove road: the Hollows\' dogs are out by day, and the one that dens deepest.'), bDroveSnow: S('Snow: woolwights are down off the high ground.'),
    bLanes: S('Storm in the Lanes: drones out, and the deep pool rings.'),
    bColumnGone: S('No Office column on the roads this week.'),
    bColumnGreen: S('The Office column is on the Greenroot road today, taking names.'), bColumnFlume: S('The Office column is on the Flume road today, taking names.'), bColumnDrove: S('The Office column is on the drove road today, taking names.'),
    bCampGreen: S('The Office column is camped on the Greenroot road.'), bCampFlume: S('The Office column is camped on the Flume road.'), bCampDrove: S('The Office column is camped on the drove road.'),
  };

  // ---------------------------------------------------------------- the trophies (valuables: sold, or taken to the bounty's giver)
  const TROPHY = { hiss: 't_p86_collar', queen: 't_p86_lamps', dog: 't_p86_denbone', bell: 't_p86_clapper' };
  function items() {
    if (typeof ITEMS === 'undefined') return;
    const add = (id, name, desc, v) => { if (!ITEMS[id]) ITEMS[id] = { name, sprite: 'loot', valuable: true, value: v, desc }; };
    add('t_p86_collar', TX.collar, TX.collarDesc, 44); add('t_p86_lamps', TX.lamps, TX.lampsDesc, 40); add('t_p86_denbone', TX.denbone, TX.denboneDesc, 36); add('t_p86_clapper', TX.clapper, TX.clapperDesc, 48);
  }

  // ---------------------------------------------------------------- the hour and the weather
  const hasG = () => typeof G !== 'undefined' && G && G.flags && G.player;
  const f = () => G.flags, fint = (k, max) => { const v = Number(f()[k]); return Number.isFinite(v) ? Math.max(-1, Math.min(max == null ? 99999 : max, Math.floor(v))) : 0; };
  const hour = () => ((((Number(G.tod) || 0) % 1) + 1) % 1) * 24;
  const day = () => Math.max(0, Math.floor(Number(G.day) || 0));
  const week = () => Math.floor(day() / 8);
  const wx = () => (typeof Weather !== 'undefined' && Weather.state) || 'clear';
  function cond() {
    const h = hour(), w = wx(), nightT = h >= 20 || h < 5, rain = w === 'rain' || w === 'storm';
    const rainDay = fint('p86_rain', 99999), after = !rain && rainDay > 0 && day() - rainDay >= 0 && day() - rainDay <= 1;
    return { night: nightT, dusk: h >= 18 || h < 6, rain, storm: w === 'storm', mist: w === 'mist', snow: w === 'snow', after, wet: rain || after };
  }

  // ---------------------------------------------------------------- where things stand: open ground along each stretch, away from doors and people
  function spotsOf(m, n, seed) {
    const W = m.w, H = m.h, dist = new Int32Array(W * H).fill(-1);
    const sx = Math.floor(m.spawn.x), sy = Math.floor(m.spawn.y), q = [sy * W + sx]; dist[q[0]] = 0;
    const doors = []; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door) doors.push([i % W, (i / W) | 0]); }
    const water = (x, y) => /water/.test(String(m.floorTextures && m.floorTextures[m.floorCells[y * W + x]] || ''));
    // a walk as the game allows it: no blocks, no water, and no slope too steep to climb (as the road tests walk it)
    const g = (x, y) => (m.groundAt ? m.groundAt(x + 0.5, y + 0.5) : 0), steep = (x, y) => !!(m.smooth && m.gradeAt && m.gradeAt(x + 0.5, y + 0.5) > (typeof MAX_GRADE !== 'undefined' ? MAX_GRADE : 1.1));
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, j = ny * W + nx; if (nx < 1 || ny < 1 || nx >= W - 1 || ny >= H - 1 || dist[j] >= 0 || m.isBlocked(nx, ny) || water(nx, ny) || (steep(nx, ny) && g(nx, ny) > g(x, y) + 0.02)) continue; dist[j] = dist[i] + 1; q.push(j); } }
    let max = 0; for (const i of q) max = Math.max(max, dist[i]);
    const ok = (i) => { const x = i % W, y = (i / W) | 0; if (doors.some(([dx, dy]) => Math.hypot(dx - x, dy - y) < 9)) return false; if (m.entities.some((e) => e && (e.kind === 'npc' || e._p82bPost || e._life) && Math.hypot(e.x - x - 0.5, e.y - y - 0.5) < 3)) return false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) if (m.isBlocked(x + dx, y + dy)) return false; return true; };
    const out = [];
    for (let k = 0; k < n; k++) {
      const t = (k + 0.5) / n * max, near = q.filter((i) => Math.abs(dist[i] - t) < 3 && ok(i));
      if (!near.length) continue;
      const i = near[Math.floor(h2(seed + k, n) * near.length) % near.length]; out.push([(i % W) + 0.5, ((i / W) | 0) + 0.5]);
    }
    out.dist = dist;
    return out;
  }

  // ---------------------------------------------------------------- what is put out on each road, and when
  // a group: { type, at: [x, y] or a spot index, when(c), n, keeper, camp, column, opts }
  const PLAN = {
    p79_road_w: (m, S) => [
      { type: 'hound', at: [S[1], S[2], S[3]], when: (c) => c.dusk && !c.snow },
      { type: 'hound', at: [S[5]], when: (c) => c.rain },
      { keeper: 'hiss', type: 'hound', at: [S[4]], when: (c) => c.night && c.rain },
    ],
    p79_greenroad: (m, S) => [
      { type: 'hound', at: [S[2], S[6]], when: (c) => c.dusk && !c.snow },
      { camp: 'office', type: ['proctor', 'proctor', 'outrider'], at: campAt(m, typeof ROAD79 !== 'undefined' && ROAD79.FIRE ? [ROAD79.FIRE.x + 4, ROAD79.FIRE.y + 3] : S[4]), when: () => true },
    ],
    p79_road_e: (m, S) => [
      { type: 'dirge', at: [S[3]], when: (c) => c.dusk },
      { type: 'hound', at: [S[2], S[5]], when: (c) => c.dusk && !c.snow },
      { type: 'hushmoth', at: [S[1], S[4]], when: (c) => c.mist },
    ],
    p83_stride: (m, S) => [
      { type: 'briarsprite', at: [S[1], S[2], S[3], S[4], S[5], S[6]], when: (c) => c.wet && !c.snow },
      { type: 'miredrone', at: [S[7], S[8]], when: (c) => c.night || c.storm },
      { keeper: 'queen', type: 'briarsprite', at: [S[4]], when: (c) => c.after },
      { camp: 'briar', type: ['briarsprite', 'briarsprite', 'briarsprite'], at: campAt(m, S[2]), when: (c) => !c.snow },
      { fire: 'rafthands', at: campAt(m, S[6]) },
    ],
    p83_poundstair: (m, S) => [
      { type: 'miredrone', at: [S[2], S[5]], when: (c) => c.night || c.storm },
    ],
    p83_wethers: (m, S) => [
      { camp: 'vigil', type: ['tongueless', 'tongueless', 'tongueless'], at: campAt(m, typeof DROVE83 !== 'undefined' ? [DROVE83.MARKED[0][0] - 3, DROVE83.MARKED[0][1] + 2] : S[3]), when: (c) => c.night },
      { type: 'p22_woolwight', at: [S[2], S[5]], when: (c) => c.snow },
      { fire: 'pines', at: typeof DROVE83 !== 'undefined' ? [DROVE83.HALT[0] + 1.2, DROVE83.HALT[1] - 1.4] : S[7] },
    ],
    p83_hollows: (m, S) => {
      const dens = (m._p83d && m._p83d.DENS) || [S[2], S[4], S[6]];
      return [
        { type: 'hound', at: dens.slice(0, 3), when: (c) => c.mist && !c.night },
        { keeper: 'dog', type: 'hound', at: [dens[0]], when: (c) => c.mist },
        { camp: 'den', type: ['hound', 'hound'], at: campAt(m, dens[dens.length - 1]), when: () => true },
        { type: 'p22_woolwight', at: [S[3]], when: (c) => c.snow },
      ];
    },
    // the deepest pool's edge, where the old bell-tower went down (LANES85's pools: [24, 25, r 5])
    p85_sunklanes: (m) => [
      { keeper: 'bell', type: 'miredrone', at: [[24.5, 25.5]], water: true, when: (c) => c.storm },   // over the water: the punt's to reach it
    ],
  };
  // the foes each road was built with join its roster: still where they were put, but out only at their hour and weather
  // (k counts them by type, so "half the dogs" is every other one). They are not woken again once put down, as before.
  const STATIC = {
    p79_road_w: { hound: (c, k) => !(c.snow && k % 2) },
    p79_road_e: { dirge: (c) => c.dusk, mites: (c) => !c.snow, hound: (c, k) => !(c.snow && k % 2), hushmoth: (c) => c.mist || c.dusk },
    p83_stride: { briarsprite: (c) => !c.snow },
    p83_poundstair: { hound: (c, k) => !(c.snow && k % 2), miredrone: (c) => c.night || c.storm || c.wet },
  };
  const KEEPER = { hiss: { name: TX.hiss, seen: TX.hissSeen, down: TX.hissDown, took: TX.tookCollar, hp: 120, dmg: [6, 13], scale: 1.8, speed: 1.25, xp: 150 }, queen: { name: TX.queen, seen: TX.queenSeen, down: TX.queenDown, took: TX.tookLamps, hp: 110, dmg: [5, 11], scale: 2.4, yOff: 0.2, speed: 0.8, xp: 140 }, dog: { name: TX.dog, seen: TX.dogSeen, down: TX.dogDown, took: TX.tookDenbone, hp: 110, dmg: [6, 12], scale: 1.6, speed: 1.3, xp: 140 }, bell: { name: TX.bell, seen: TX.bellSeen, down: TX.bellDown, took: TX.tookClapper, hp: 160, dmg: [7, 14], scale: 2.2, speed: 0.6, xp: 170 } };
  const CAMP_TEXT = { office: TX.office, vigil: TX.vigil, den: TX.den, briar: TX.briar };
  const CAMP_OFF = { office: 0, vigil: 2, den: 4, briar: 1 };
  // hydrate() draws a random name for the Office's people: name them here, so no new enemy takes from Math.random
  function nameFor(type, k) { const d = typeof ENEMIES !== 'undefined' && ENEMIES[type]; if (!d || !d.core || typeof NAMES_POOL === 'undefined') return undefined; return NAMES_POOL[k % NAMES_POOL.length]; }
  // ours are base entities (saved by index, never swept as transient): put at the end of the base, as bearings82b does
  function put(m, kind, type, x, y, o) {
    const e = kind === 'enemy' ? Object.assign({ kind: 'enemy', type, x, y }, o) : Object.assign({}, o);
    if (m.baseCount == null) m.entities.push(e); else { m.entities.splice(m.baseCount, 0, e); m.baseCount++; }
    return e;
  }
  function campAt(m, p) { if (!p) return null; const fr = typeof travelFreeNear === 'function' ? travelFreeNear(m, p[0], p[1]) : p; return fr ? [fr[0], fr[1]] : null; }

  // the Office column: one road a day, in turn
  const COLUMN_ROADS = ['p79_road_w', 'p79_greenroad', 'p79_road_e', 'p83_stride', 'p83_poundstair', 'p83_wethers', 'p83_hollows'];
  const ROAD_NAME = { p79_road_w: 'Green', p79_greenroad: 'Green', p79_road_e: 'Green', p83_stride: 'Flume', p83_poundstair: 'Flume', p83_wethers: 'Drove', p83_hollows: 'Drove' };
  const columnRoad = () => COLUMN_ROADS[day() % COLUMN_ROADS.length];
  const columnOut = () => { const b = fint('p86col'); return !(b > 0 && day() - b < 8); };

  function place(maps) {
    for (const id of Object.keys(PLAN)) {
      const m = maps[id]; if (!m || m._r86) continue;
      const S = spotsOf(m, 10, id.length * 7 + id.charCodeAt(id.length - 1));
      const ST = STATIC[id], seen = {};
      if (ST) for (const e of m.entities) if (e && e.kind === 'enemy' && !e._r86 && ST[e.type] && !e.boss && !e.hidden) { seen[e.type] = (seen[e.type] || 0) + 1; e._r86s = { type: e.type, k: seen[e.type] - 1 }; }
      const groups = PLAN[id](m, S); m._r86 = { groups, spots: S };
      groups.forEach((g, gi) => {
        if (g.fire) { if (!g.at) return; put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'campfire', x: g.at[0], y: g.at[1], scale: 0.8, solid: false, radius: 0.3, glow: 0.8, lightCol: [220, 140, 60], label: g.fire === 'rafthands' ? TX.rafthands : TX.fire, use: 'p86_sit', _r86: { fire: g.fire } });
          // the raft-hands themselves, by their fire from dusk to morning
          if (g.fire === 'rafthands') [['p60_man_b', -1.1, -0.5, 0.6], ['p60_man_c', 0.9, -0.8, 2.6]].forEach(([sp, dx, dy, fa], k) => put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: sp, x: g.at[0] + dx, y: g.at[1] + dy, facing: fa, scale: 1, solid: true, radius: 0.3, label: k ? TX.raftB : TX.raftA, hidden: true, _r86: { hands: 1 } }));
          return; }
        const pts = g.camp ? (g.at ? [0, 1, 2].slice(0, g.type.length).map((k) => [g.at[0] + Math.cos(k * 2.1) * 1.4, g.at[1] + Math.sin(k * 2.1) * 1.4]) : []) : (g.at || []).filter(Boolean);
        const types = Array.isArray(g.type) ? g.type : pts.map(() => g.type);
        pts.forEach((p, k) => { if (!p || (!g.water && m.isBlocked(Math.floor(p[0]), Math.floor(p[1])))) return; const ty = types[k % types.length]; put(m, 'enemy', ty, p[0], p[1], { hidden: true, name: nameFor(ty, id.length + gi * 3 + k), _r86: { g: gi, keeper: g.keeper || null, camp: g.camp || null, water: !!g.water } }); });
        if (g.camp && g.at) {
          const c = g.camp, at = g.at;
          if (c === 'office') { put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'p22_tent', x: at[0] - 1.6, y: at[1] - 1.2, scale: 1, solid: true, radius: 0.6, label: TX.office, _r86: { campDeco: c } }); put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'table', x: at[0] + 0.2, y: at[1] - 0.2, scale: 0.8, solid: true, radius: 0.35, label: TX.officeLedger, _r86: { campDeco: c } }); }
          else if (c === 'vigil') put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'bones', x: at[0], y: at[1], scale: 0.01, solid: false, radius: 0.1, label: TX.vigil, _r86: { campDeco: c } });
          else put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'bones', x: at[0], y: at[1], scale: 0.6, solid: false, radius: 0.2, label: CAMP_TEXT[c], _r86: { campDeco: c } });
          put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: c === 'office' ? 'crates' : 'p_crate', x: at[0] + 1.1, y: at[1] + 1.0, scale: 0.6, solid: true, radius: 0.3, label: TX.crate, use: 'p86_crate', _r86: { crate: c } });
        }
      });
      // the column: put out on every road it walks; only today's road shows it
      if (COLUMN_ROADS.includes(id) && S[3] && S[7]) {
        for (const [k, t] of [['assessor', 'proctor'], ['p1', 'proctor'], ['p2', 'proctor'], ['out', 'outrider'], ['hush', 'hushwarden']].entries()) {
          const [role, type] = t, base = S[3], dx = Math.cos(k * 1.3) * (k ? 1.2 : 0), dy = Math.sin(k * 1.3) * (k ? 1.2 : 0);
          if (m.isBlocked(Math.floor(base[0] + dx), Math.floor(base[1] + dy))) continue;
          put(m, 'enemy', type, base[0] + dx, base[1] + dy, { hidden: true, name: role === 'assessor' ? TX.assessor : nameFor(type, id.length * 5 + k), _r86: { column: role, cday: S[3], ccamp: S[7] } });
        }
        put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'p22_tent', x: S[7][0] - 1.4, y: S[7][1] - 1.0, scale: 1, solid: true, radius: 0.6, label: TX.columnSeen, hidden: true, _r86: { columnTent: true } });
      }
      // everything of ours stands where you can walk to it (as the game walks: no water, no slope too steep); the
      // Sunk Bell is the one out over the water, for the punt
      settle(m, S.dist);
    }
  }
  function settle(m, dist) {
    const W = m.w, at = (x, y) => { for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const X = (x | 0) + dx, Y = (y | 0) + dy; if (X >= 0 && Y >= 0 && X < W && Y < m.h && dist[Y * W + X] >= 0) return true; } return false; };
    for (const e of m.entities) {
      if (!e || !e._r86 || e._r86.water || at(e.x, e.y)) continue;
      let done = false;
      for (let r = 1; r <= 6 && !done; r++) for (let a = 0; a < 16 && !done; a++) { const x = Math.floor(e.x + Math.cos(a / 16 * 2 * PI) * r) + 0.5, y = Math.floor(e.y + Math.sin(a / 16 * 2 * PI) * r) + 0.5; if (x > 1 && y > 1 && x < W - 1 && y < m.h - 1 && dist[(y | 0) * W + (x | 0)] >= 0) { e.x = x; e.y = y; done = true; } }
    }
  }

  // ---------------------------------------------------------------- each moment on a road: who is out
  function campHeld(c, cnd) { const cl = fint('p86c_' + c); if (cl > 0 && day() - cl < 8) return false; if (((day() + CAMP_OFF[c]) % 6) >= 4) return false; return true; }
  function keeperUp(k) { const d = fint('p86k_' + k); return !(d > 0 && day() - d < 8); }
  let seenKeeper = {}, seenColumn = -1;
  function revive(e) { e.dead = false; e.solid = true; e.hp = e.hpMax || (e.def && e.def.hp) || 10; e.state = e.passive ? 'passive' : 'idle'; e.x = e.homeX != null ? e.homeX : e.x; e.y = e.homeY != null ? e.homeY : e.y; e.stun = 0; }
  function sync(onLoad) {
    if (!hasG() || !G.map) return;
    const m = G.map, R = m._r86, c = cond();
    if (c.rain) f().p86_rain = day() || 1;
    if (!R) return;
    const cam = typeof Engine !== 'undefined' ? Engine.cam : { x: 0, y: 0 };
    const ST = STATIC[m.id];
    if (ST) for (const e of G.ents) {
      const s = e && e._r86s; if (!s || e.dead) continue;
      const want = ST[s.type](c, s.k), busy = e.state === 'chase' || e.state === 'attack';
      if (!onLoad && (busy || Math.hypot(e.x - cam.x, e.y - cam.y) < 10) && want !== !e.hidden) continue;
      e.hidden = !want;
    }
    for (const e of G.ents) {
      const r = e && e._r86; if (!r) continue;
      if (r.campDeco) { e.label = campHeld(r.campDeco, c) ? (r.campDeco === 'office' && e.sprite === 'table' ? TX.officeLedger : CAMP_TEXT[r.campDeco]) : TX.campCold; continue; }
      if (r.hands) { const h = hour(); e.hidden = !(h >= 18 || h < 7) || c.storm; continue; }
      if (r.columnTent) { e.hidden = !(columnOut() && columnRoad() === m.id && (c.night || c.storm)); continue; }
      if (e.kind !== 'enemy') continue;
      const g = r.g != null ? R.groups[r.g] : null;
      let want;
      if (r.column) want = columnOut() && columnRoad() === m.id;
      else if (r.keeper) want = keeperUp(r.keeper) && g.when(c);
      else if (r.camp) want = campHeld(r.camp, c) && g.when(c);
      else want = g.when(c);
      // the fallen come back another day; a keeper or a camp only when its flags say so
      if (e.dead) { if (!want || !onLoad) continue; if (r.died === day()) continue; if (r.camp && fint('p86c_' + r.camp) >= day()) continue; revive(e); }
      const busy = e.state === 'chase' || e.state === 'attack';
      if (!onLoad && busy && !want) continue;                                              // never vanish mid-fight
      if (!onLoad && Math.hypot(e.x - cam.x, e.y - cam.y) < 10 && want !== !e.hidden) continue;   // nor pop up beside you
      e.hidden = !want;
      if (want && r.keeper) dressKeeper(e, r.keeper);
      if (want && r.column) { const night = c.night || c.storm, at = night ? r.ccamp : r.cday; if (onLoad && at) { const k = ['assessor', 'p1', 'p2', 'out', 'hush'].indexOf(r.column), nx = at[0] + Math.cos(k * 1.3) * (k ? 1.2 : 0), ny = at[1] + Math.sin(k * 1.3) * (k ? 1.2 : 0); if (!m.isBlocked(nx | 0, ny | 0)) { e.x = e.homeX = nx; e.y = e.homeY = ny; } } if (r.column === 'assessor' && e.def && e.def.name !== TX.assessor) { e.def = Object.assign({}, e.def, { name: TX.assessor, xp: 60 }); e.name = TX.assessor; e.hpMax = 50; e.hp = Math.min(e.hp, 50) || 50; e.scale = 1.1; } }
    }
    // told once when first seen
    for (const e of G.ents) { const r = e && e._r86; if (!r || e.hidden || e.dead || e.kind !== 'enemy') continue; const d = Math.hypot(e.x - cam.x, e.y - cam.y); if (d > 9) continue;
      if (r.keeper && !seenKeeper[r.keeper + day()]) { seenKeeper[r.keeper + day()] = 1; say(KEEPER[r.keeper].seen, 'bad', 8000); }
      if (r.column && seenColumn !== day()) { seenColumn = day(); say(TX.columnSeen, 'warn', 7000); } }
  }
  function dressKeeper(e, k) {
    const K = KEEPER[k]; if (e.def && e.def.name === K.name) return;
    const fresh = !e.hp || e.hp === (e.def && e.def.hp);
    e.def = Object.assign({}, e.def, { name: K.name, dmg: K.dmg, xp: K.xp, speed: K.speed, boss: false }); e.name = K.name; e.hpMax = K.hp; if (fresh) e.hp = K.hp; e.scale = K.scale; if (K.yOff) e.yOff = K.yOff; e.passive = false; if (e.state === 'passive') e.state = 'idle';
  }
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* quiet */ } };
  // the game translates what it shows, by exact line or by {0} pattern (tools/i18n/p86-roads.tsv): substitute in English
  const fmt = (t, ...a) => { let s = t; a.forEach((v, i) => { s = s.split('{' + i + '}').join(String(v)); }); return s; };

  // ---------------------------------------------------------------- deaths: counts for the week's work, trophies, cleared camps, the column's book
  function onKill(e) {
    if (!hasG() || !e || e.kind !== 'enemy') return;
    const m = G.map, r = e._r86;
    const key = 'p86n_' + m.id + '_' + e.type; f()[key] = Math.min(9999, fint(key) + 1);
    if (!r) return;
    r.died = day();
    if (r.keeper) { f()['p86k_' + r.keeper] = day() || 1; const id = TROPHY[r.keeper]; try { G.give(id, 1); } catch (err) { warnOnce('give', err); } say(KEEPER[r.keeper].took, 'good', 5000); setTimeout(() => say(KEEPER[r.keeper].down, '', 5000), 1500); }
    if (r.camp) { const left = G.ents.filter((q) => q && q._r86 && q._r86.camp === r.camp && q.kind === 'enemy' && !q.dead && !q.hidden); if (!left.length) { f()['p86c_' + r.camp] = day() || 1; say(TX.campClear, 'good', 5000); } }
    if (r.column) { try { say(TX.columnBook, 'bad', 4000); reportCrime('an assault on the Office', 6); } catch (err) { /* no law here */ } const left = G.ents.filter((q) => q && q._r86 && q._r86.column && !q.dead && !q.hidden); if (!left.length) { f().p86col = day() || 1; say(TX.columnBroken, 'good', 6000); } }
  }

  // ---------------------------------------------------------------- the bounty-givers
  const GIVERS = {
    cutter: { npc: 'p60_rd_cutter', keeper: 'hiss', offer: TX.cutterOffer, wait: TX.cutterWait, paid: TX.cutterPaid, journal: TX.journalCutter, week: TX.cutterWeek, need: 6, count: () => fint('p86n_p79_road_w_hound') },
    length: { npc: 'p60_fl_length', keeper: 'queen', offer: TX.lengthOffer, wait: TX.lengthWait, paid: TX.lengthPaid, journal: TX.journalLength, week: TX.lengthWeek, need: 8, count: () => fint('p86n_p83_stride_briarsprite') + fint('p86n_p83_poundstair_briarsprite') },
    ret: { npc: 'p60_dr_man', keeper: 'dog', offer: TX.retOffer, wait: TX.retWait, paid: TX.retPaid, journal: TX.journalRet, week: TX.retWeek, need: 5, count: () => fint('p86n_p83_hollows_hound') },
    salv: { npc: 'p60_cp_salv2', keeper: 'bell', offer: TX.salvOffer, wait: TX.salvWait, paid: TX.salvPaid, journal: TX.journalSalv, week: TX.salvWeek, need: 4, count: () => leadCount() },
  };
  const BOUNTY_PAY = 60, WEEK_PAY = 35;
  function leadCount() { const b = fint('p86lead'), wk = b >> 4; return wk === week() + 1 ? [0, 1, 2, 3].filter((i) => b & (1 << i)).length : 0; }
  function inv(id) { return G.player.inv.find((s) => s && s.id === id); }
  function takeFromInv(id) { const p = G.player, i = p.inv.findIndex((s) => s && s.id === id); if (i < 0) return false; if ((p.inv[i].n || 1) > 1) p.inv[i].n--; else p.inv.splice(i, 1); return true; }
  // what the giver says now, and what you can answer: { text, choices: [{ t, f }] } for the game's dialogue
  function giverTalk(gk) {
    const g = GIVERS[gk], b = fint('p86b_' + gk), tro = TROPHY[g.keeper];
    if (b === 0) return { text: g.offer, choices: [{ t: TX.take, f: () => { f()['p86b_' + gk] = 1; try { journal('side', g.journal); } catch (e) { /* */ } return g.wait; } }, { t: TX.later, f: () => '' }] };
    if (b === 1 && inv(tro)) return { text: g.wait, choices: [{ t: TX.give, f: () => { if (!takeFromInv(tro)) return g.wait; f()['p86b_' + gk] = 2; G.gold(BOUNTY_PAY); try { questXp(40); } catch (e) { /* */ } return g.paid; } }, { t: TX.later, f: () => '' }] };
    // the week's work, renewed every eight-day week, whether or not the keeper is still out there
    const wk = week() + 1, taken = fint('p86w_' + gk) === wk, done = fint('p86wd_' + gk) === wk;
    if (done) return { text: b === 1 ? g.wait : TX.weekDone, quiet: true };
    if (!taken) return { text: g.week, choices: [{ t: TX.take, f: () => { f()['p86w_' + gk] = wk; f()['p86wb_' + gk] = gk === 'salv' ? 0 : g.count(); return fmt(TX.weekSoFar, 0, g.need); } }, { t: TX.later, f: () => '' }] };
    const got = g.count() - fint('p86wb_' + gk);
    if (got >= g.need) return { text: TX.weekPaid, choices: [{ t: TX.give, f: () => { f()['p86wd_' + gk] = wk; G.gold(WEEK_PAY); try { questXp(20); } catch (e) { /* */ } return TX.weekThanks; } }] };
    return { text: fmt(TX.weekSoFar, Math.max(0, got), g.need), quiet: true };
  }
  // with the townsfolk switched off the salvagers are figures by the board, with no dialogue of their own: the second one
  // takes the jobs when there is something new to say, heard on the spot (no harm in taking on a job); else their own chat
  let salvTurn = 0;
  function salvUse(e) {
    if (!e || (e._i || 0) !== 1) return false;
    const q = giverTalk('salv'); if (q.quiet && (salvTurn ^= 1)) return false;   // progress every other time; their chat between
    say(q.text, '', 9000);
    if (q.choices && q.choices[0]) { const r = q.choices[0].f(); if (r) setTimeout(() => say(r, 'good', 6000), 2500); }
    return true;
  }

  // ---------------------------------------------------------------- the boards: what is out today
  function roadNews() {
    const c = cond(), L = [];
    L.push(c.snow ? TX.bGreenSnow : c.dusk ? TX.bGreenNight : TX.bGreen); if (c.rain) L.push(TX.bGreenWet); if (c.mist) L.push(TX.bGreenMist);
    L.push(c.snow ? TX.bFlumeSnow : c.storm ? TX.bFlumeStorm : c.wet ? TX.bFlumeWet : TX.bFlume); if (c.dusk && !c.storm) L.push(TX.bFlumeNight);
    L.push(c.snow ? TX.bDroveSnow : c.mist ? TX.bDroveMist : c.dusk ? TX.bDroveNight : TX.bDrove);
    if (c.storm) L.push(TX.bLanes);
    const col = ROAD_NAME[columnRoad()]; L.push(!columnOut() ? TX.bColumnGone : (c.night || c.storm ? TX['bCamp' + col] : TX['bColumn' + col]));
    return L;
  }
  function boardNews(name) {
    if (typeof document === 'undefined' || !hasG() || (name !== 'p82b_board' && name !== 'bounty')) return;
    const p = document.getElementById('modal-panel'); if (!p || p.querySelector('.p86-roads')) return;
    const at = p.querySelector('.p82b-board') || p.querySelector('.dlg, .col') || p;
    const div = document.createElement('div'); div.className = 'p86-roads p82b-board';
    const h = document.createElement('h3'); h.textContent = TX.roadsHead; div.appendChild(h);
    for (const t of roadNews()) { const e = document.createElement('p'); e.textContent = t; div.appendChild(e); }
    // on a notice board, before its tasks; on the Oakhaven bounty board, at the foot
    const tasks = at.querySelector('.list'); const head = tasks && tasks.previousElementSibling;
    if (head && head.tagName === 'H3') at.insertBefore(div, head); else at.appendChild(div);
  }

  // ---------------------------------------------------------------- the lead on the garret roofs (the salvagers' week)
  const LEAD = [[12.5, 44.4], [19.5, 44.4], [33.5, 44.4], [47.5, 44.4]];
  function placeLead(maps) {
    const m = maps.p85_crosspool; if (!m || m._r86lead) return; m._r86lead = true;
    LEAD.forEach(([x, y], i) => put(m, 'deco', null, 0, 0, { kind: 'deco', sprite: 'p_bones_small', x, y, scale: 0.01, solid: false, radius: 0.15, label: TX.lead, use: 'p86_lead', _r86: { lead: i } }));
  }

  // ---------------------------------------------------------------- using things
  function useOwn(e) {
    if (!e || typeof e.use !== 'string' || !hasG()) return false;
    if (e.use === 'p85l_salv') return salvUse(e);
    if (!/^p86_/.test(e.use)) return false;
    const c = cond();
    if (e.use === 'p86_crate') { const k = e._r86.crate; if (campHeld(k, c) && G.ents.some((q) => q && q._r86 && q._r86.camp === k && q.kind === 'enemy' && !q.dead && !q.hidden)) { say(TX.crateShut, '', 3000); return true; }
      const cl = fint('p86c_' + k) || -1, key = 'p86cr_' + k; if (fint(key) === cl || cl <= 0) { say(TX.crateEmpty, '', 3000); return true; }
      const n = 8 + Math.floor(h2(day(), k.length) * 9); f()[key] = cl; G.gold(n); say(fmt(TX.crateTake, n), 'good', 4000); return true; }
    if (e.use === 'p86_sit') { if (G.ents.some((q) => q && q.kind === 'enemy' && !q.dead && !q.hidden && q.state === 'chase')) { say(TX.fireNo, 'warn', 3000); return true; }
      const h = hour(), until = ((30 - h) % 24) || 24; try { passHours(until); } catch (err) { G.tod = 0.25; G.day++; } G.player.hp = G.player.hpMax; say(TX.fireSit, 'good', 6000); sync(true); return true; }
    if (e.use === 'p86_lead') { const i = e._r86.lead, wk = week() + 1; let b = fint('p86lead'); if ((b >> 4) !== wk) b = wk << 4; if (b & (1 << i)) { say(TX.leadGone, '', 2500); return true; } b |= 1 << i; f().p86lead = b; say(fmt(TX.leadTake, leadCount()), '', 3000); return true; }
    return false;
  }

  // ---------------------------------------------------------------- the map journey draws from the same rosters
  // only roads the map journey already counts as dangerous (mounts84 files those); a safe road stays safe
  function travelFoes() {
    if (typeof TRAVEL_FOES === 'undefined') return;
    const c = cond(), set = (k, v) => { if (TRAVEL_FOES[k] && v.length) TRAVEL_FOES[k] = v; };
    set('p79_road_w', ['hound']);
    set('p79_greenroad', c.dusk ? ['hound'] : ['proctor']);
    set('p79_road_e', c.mist ? ['hushmoth', 'hound'] : c.dusk ? ['hound', 'dirge'] : ['mites']);
    set('p83_stride', c.snow ? ['miredrone'] : c.wet ? ['briarsprite'] : c.night ? ['miredrone', 'briarsprite'] : ['briarsprite', 'hound']);
    set('p83_poundstair', c.night || c.storm ? ['miredrone'] : ['hound']);
    set('p83_wethers', c.snow ? ['p22_woolwight'] : c.night ? ['tongueless'] : []);
    set('p83_hollows', c.snow ? ['p22_woolwight', 'hound'] : ['hound']);
  }

  function wire() {
    items();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { items(); place(maps); placeLead(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(true); travelFoes(); } catch (e) { warnOnce('load', e); } return r; }; }
    let t = 0;
    if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { t += Number(dt) || 0; if (t > 0.5) { t = 0; sync(false); travelFoes(); } } catch (e) { /* next frame */ } return r; }; }
    if (typeof killEnemy === 'function') { const _k = killEnemy; killEnemy = function (e) { const was = e && e.dead; const r = _k.apply(this, arguments); try { if (!was) onKill(e); } catch (err) { warnOnce('kill', err); } return r; }; }
    if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { warnOnce('use', err); } return _ud.apply(this, arguments); }; }
    if (typeof openModal === 'function') { const _o = openModal; openModal = function (html, name) { const r = _o.apply(this, arguments); try { boardNews(name); } catch (e) { warnOnce('board', e); } return r; }; }
    // the givers who walk: their own words come first in talk
    if (typeof talk === 'function') { const _t = talk; talk = function (e) {
      try { const gk = e && Object.keys(GIVERS).find((k) => GIVERS[k].npc && GIVERS[k].npc === e.id); if (gk && typeof NPCS !== 'undefined' && NPCS[e.id] && !NPCS[e.id]._p86) { const n = NPCS[e.id], q0 = n.quest; n.quest = function (g) { try { const q = giverTalk(gk); if (q) return { text: q.text, choices: q.choices ? q.choices.map((c) => ({ t: c.t, f: () => c.f() || TX.laterSaid })) : undefined }; } catch (err) { warnOnce('quest', err); } return q0 ? q0.apply(this, arguments) : null; }; n._p86 = true; } } catch (err) { warnOnce('talk', err); }
      return _t.apply(this, arguments); }; }
  }
  wire();

  return { TX, TEXTS, PLAN, KEEPER, GIVERS, TROPHY, COLUMN_ROADS, LEAD, cond, spotsOf, place, sync, onKill, giverTalk, roadNews, campHeld, keeperUp, columnRoad, columnOut, useOwn, travelFoes };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ROADS86;
if (typeof window !== 'undefined') window.ROADS86 = ROADS86;
