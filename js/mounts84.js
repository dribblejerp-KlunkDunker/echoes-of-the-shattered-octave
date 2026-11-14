// ============================================================
//  mounts84 — Phase 84, mounts and fast travel (story/Game Layer/Phase 84 - Mounts and fast travel (design, for
//  ruling).md; every recommendation approved by the owner, 14 Nov 2026, "I approve of phase 84").
//
//  1. THE PONY, RIDDEN. The hire at the North Gate stables (js/travel.js, a day for 25 sovereigns) now brings the roan
//     mare out to you; two more stables hire the same way: the Bellwether's yard in Wethercombe (the dun) and the drovers'
//     pen on the Long Common (the grey). Press X beside her to get up, X again to get down. Riding you go about one and
//     three-quarter times as fast, see from a little higher, tire much more slowly and make a horse's noise; you can fight
//     from the saddle, but not shoot; every third hard blow she shies and you come off. She will not go onto planks, down
//     the Pound Stair, into the Deep Grove or indoors: you get down and she waits there. Left alone she waits six hours
//     and then walks home; left near hunting ground at night, hounds come for her and she bolts home (the ostler wants 5
//     sovereigns for the fright). Nothing kills her. When the day's hire is up she goes home.
//  2. MILESTONES. A short stone stands by every finger-post (js/bearings82b.js): at each end of every stretch of road and
//     at every town's gates. Walking past one marks it on the world map, and the world map can send you to it. A save
//     from before this phase counts every milestone you have already seen.
//  3. THE MAP KNOWS THE ROADS. A journey goes gate to gate along the roads, never straight across the country; it is the
//     length of the road (one minute a cell on foot, half that riding), and the chart draws the way you will go. A journey
//     that would run past dusk stops the night at a halt about halfway (the Three Pines on the drove road), unless you
//     choose to press on in the dark. Each stretch you pass through rolls for its own ambush, by its own danger, hour and
//     weather; if one comes up you arrive on that stretch, mid-road, with what was waiting.
//  (The punt is built with the Sunk Lanes, Phase 85.) Pony state lives on the player (G.player.p84), milestones in
//  G.flags (p84m_<post id>), all validated on read. Nothing visual uses random numbers.
// ============================================================
'use strict';

const MOUNTS84 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const PI = Math.PI;
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('mounts84: ' + k, e); } };
  const tr = (t) => { try { const f = typeof STORY_I18N !== 'undefined' && STORY_I18N.translate(t); return f || t; } catch (e) { return t; } };
  const fmt = (t, ...a) => { const o = String(tr(t)).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? tr(String(a[+i])) : m)); return o.charAt(0).toUpperCase() + o.slice(1); };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 5000); } catch (e) { /* cosmetic */ } };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const clock = () => (Number(G.day) || 0) * 24 + (Number(G.tod) || 0) * 24;
  const hour = () => ((((Number(G.tod) || 0) % 1) + 1) % 1) * 24;
  const night = () => { const h = hour(); return h >= 20 || h < 5; };

  const TX = {
    names: { oakhaven: S('the roan mare'), p22_combe: S('the dun'), p79_road_w: S('the grey') },
    pick: S('Which of them?'), chooseHint: S('Left and right arrows choose between them.'), hiredAs: S('Hired: {0}'),
    hireLine: S('You hire {0} for {1} sovereigns. The ostler ties a green ribbon to the bridle: she is yours until this time tomorrow.'),
    backLine: S('You hand {0} back. The ostler counts {1} sovereigns into your palm and hangs the green ribbon on its nail.'),
    waiting: S('{0}, saddled and waiting. X to get up.'),
    up: S('You get up on {0}.'), down: S('You get down. {0} waits where you leave her.'),
    planks: S('She will not go onto the planks. Get down and go on foot; she will wait.'),
    stair: S('She will not go down the Pound Stair. You leave her at the top, and she waits.'),
    grove: S('She will not go in among those trees. You leave her at the edge, and she waits.'),
    indoors: S('You leave {0} at the door. She waits.'),
    noShot: S('You cannot shoot from the saddle.'),
    thrown: S('{0} shies at the blow and you come off.'),
    tooFar: S('She is too far off. Go to her first.'),
    home: S('{0} has gone home to her stable.'),
    dayUp: S('The day\'s hire is up. You get down, and {0} turns for home.'),
    fright: S('Hounds came for {0} in the night. She bolted home, and the ostler wants 5 sovereigns for the fright.'),
    paidFright: S('You pay the ostler 5 sovereigns for the fright.'),
    yardTitle: S('The Bellwether\'s yard'), yardText: S('Three stalls behind the Bellwether. The dun has been down the drove road more times than you have. Absalom Rudd\'s girl does the hiring, and asks nothing.'),
    penTitle: S('The drovers\' pen on the Long Common'), penText: S('A hurdle pen by the road, a lean-to for the tack, and three ponies with burrs in their manes. The man who keeps them lives in the lean-to.'),
    stableSign: S('A stable: a pony to hire for a day, or to give back'),
    mile: S('A milestone. Cut in it: {0}.'), touched: S('You lay a hand on the milestone. {0} is on your map now.'),
    mileName: S('{0}, towards {1}'),
    byRoads: S('By the roads, through {0}.'),
    pastDusk: S('The road runs past dusk.'), stopAt: S('Stop the night at {0}'), pressOn: S('Press on in the dark'),
    stopped: S('You stop the night at {0}. {1} is still ahead.'),
    midRoad: S('On {0}, mid-road, something has been waiting.'),
    halt: S('the halt'), pines: S('the Three Pines'),
  };

  // ---------------------------------------------------------------- the ponies: nine coats a real horse wears, three to a stable [PROPOSED]
  //  body/light/dark: the coat lit and shaded; hair: mane and tail; legs: the lower legs (black points on a bay, a dun);
  //  socks: which legs are white below the knee (0 near fore, 1 near hind, 2 far fore, 3 far hind); face: star or blaze;
  //  mark: the pattern laid over the coat (roan flecks, dapples, the dun's eel stripe and barred legs, skewbald patches, leopard spots).
  const COATS = {
    roan:     { name: TX.names.oakhaven, about: S('A red roan: chestnut flecked all over with white, darker on the head and legs.'), body: '#7a4a36', light: '#8e5c44', dark: '#5a3426', hair: '#2a1a12', legs: '#4a2c20', mark: 'roan', chart: '#9a6a48' },
    bay:      { name: S('the bay mare'), about: S('A bay: a red-brown coat with a black mane and tail and black legs, a white star on her brow.'), body: '#6e3a22', light: '#86492c', dark: '#4e2816', hair: '#16100c', legs: '#18110c', face: 'star', chart: '#8a4a2a' },
    black:    { name: S('the black mare'), about: S('Black from ears to hooves, with a star and one white hind sock.'), body: '#221c19', light: '#352c27', dark: '#151110', hair: '#0c0a09', legs: '#171311', face: 'star', socks: [1], chart: '#2e2622' },
    dun:      { name: TX.names.p22_combe, about: S('A dun: sandy, with a dark stripe down her back, dark points and faint bars on her legs.'), body: '#c2a26a', light: '#d2b47c', dark: '#977b4a', hair: '#2a1e14', legs: '#3a2a1c', mark: 'dun', chart: '#c2a26a' },
    chestnut: { name: S('the chestnut with the blaze'), about: S('A chestnut: copper all over, mane and tail too, with a white blaze and two white socks.'), body: '#9a4e22', light: '#b05e2c', dark: '#723818', hair: '#7a3412', legs: '#8a4420', face: 'blaze', socks: [0, 3], chart: '#a85a2c' },
    palomino: { name: S('the palomino'), about: S('A palomino: a gold coat with a cream mane and tail, a blaze down her face.'), body: '#d2a85a', light: '#e2bc72', dark: '#a8823e', hair: '#efe4c8', legs: '#c49c52', face: 'blaze', chart: '#d8b060' },
    grey:     { name: TX.names.p79_road_w, about: S('A dapple grey: iron-grey rings on a pale coat, a white mane, dark knees.'), body: '#9c9c98', light: '#b8b8b4', dark: '#74746f', hair: '#dcdcd6', legs: '#5e5e5a', mark: 'dapple', chart: '#a8a8a4' },
    skewbald: { name: S('the skewbald'), about: S('A skewbald: big white patches on a brown coat, white legs, a white face.'), body: '#7e4426', light: '#94532e', dark: '#5a2e18', hair: '#3a2416', legs: '#7e4426', face: 'bald', socks: [0, 1, 2, 3], mark: 'pinto', chart: '#9a6040' },
    spotted:  { name: S('the spotted mare'), about: S('Leopard-spotted: a white coat scattered with dark spots, a thin dark mane and tail.'), body: '#e6e0d4', light: '#f2eee6', dark: '#bdb5a6', hair: '#3e3028', legs: '#d8d2c4', mark: 'spots', chart: '#e6e0d4' },
  };
  const OFFER = { oakhaven: ['roan', 'bay', 'black'], p22_combe: ['dun', 'chestnut', 'palomino'], p79_road_w: ['grey', 'skewbald', 'spotted'] };
  const coatOf = (p) => { const k = (p && p.coat) || (hasG() && G.player.horseCoat); return COATS[k] ? k : (OFFER[(p && p.home) || 'oakhaven'] || OFFER.oakhaven)[0]; };
  const spriteOf = (k) => (k === 'roan' ? 'p84_pony' : 'p84_pony_' + k);

  // ---------------------------------------------------------------- where the stables are, and where she will not go
  const STABLES = { oakhaven: null, p22_combe: { x: 26.5, y: 23.5 }, p79_road_w: null };     // oakhaven's is maps.js's own; the pen is found by the east gate
  const NO_GO = new Set(['p83_poundstair', 'p85_deepgrove']);
  const RIDE = 1.75, EYE = 0.32;
  const PLANK = /plank/;
  function pony() {
    if (!hasG()) return null; const p = G.player.p84; if (!p || typeof p !== 'object') return null;
    if (typeof p.map !== 'string' || !G.maps || !G.maps[p.map] || !Number.isFinite(+p.x) || !Number.isFinite(+p.y)) return null;
    p.x = +p.x; p.y = +p.y; p.mounted = !!p.mounted; p.left = Number.isFinite(+p.left) ? +p.left : clock(); p.home = TX.names[p.home] ? p.home : 'oakhaven'; p.coat = COATS[p.coat] ? p.coat : coatOf({ home: p.home }); return p;
  }
  const nameOf = (p) => COATS[coatOf(p)].name;
  const hired = () => typeof horseActive === 'function' && horseActive();
  const mounted = () => { const p = pony(); return !!(p && p.mounted && hired()); };
  function stableSpot(home) {
    const m = G.maps && G.maps[home]; if (!m) return null;
    const e = m.entities.find((q) => q && q.use === 'stable'); if (!e) return null;
    const fr = typeof travelFreeNear === 'function' ? travelFreeNear(m, e.x, e.y + 1.2) : null;
    return fr ? { map: home, x: fr[0], y: fr[1] } : { map: home, x: e.x, y: e.y + 1 };
  }
  function sendHome(p, why) {
    const s = stableSpot(p.home) || stableSpot('oakhaven'); if (!s) { G.player.p84 = null; return; }
    p.map = s.map; p.x = s.x; p.y = s.y; p.mounted = false; p.left = clock(); p.atHome = true;
    if (why) say(fmt(why, nameOf(p)), '', 5000);
  }

  // ---------------------------------------------------------------- the pony on the map (a transient entity)
  function stage() {
    if (!hasG() || !G.map) return;
    const m = G.map; for (let i = m.entities.length - 1; i >= 0; i--) if (m.entities[i] && m.entities[i]._p84pony) m.entities.splice(i, 1);
    const p = pony(); if (!p || p.mounted || p.map !== G.mapId || !hired()) return;
    m.entities.push({ kind: 'deco', sprite: spriteOf(coatOf(p)), x: p.x, y: p.y, scale: 1, solid: false, radius: 0.35, transient: true, _decor: true, _p84pony: true, label: fmt(TX.waiting, nameOf(p)) });
  }
  function getUp() {
    const p = pony(); if (!p || !hired()) return false;
    if (p.mounted) return getDown(TX.down);
    const c = Engine.cam; if (p.map !== G.mapId || Math.hypot(p.x - c.x, p.y - c.y) > 2.2) { say(tr(TX.tooFar), '', 2500); return true; }
    p.mounted = true; p.atHome = false; stage(); head(true); say(fmt(TX.up, nameOf(p)), '', 3000);
    try { Audio_.sfx.step && Audio_.sfx.step(); } catch (e) { /* quiet */ }
    return true;
  }
  function getDown(line, at) {
    const p = pony(); if (!p) return false;
    const c = Engine.cam, a = at || { map: G.mapId, x: c.x - Math.cos(c.dir) * 0.9, y: c.y - Math.sin(c.dir) * 0.9 };
    const m = G.maps[a.map], fr = m && typeof travelFreeNear === 'function' ? travelFreeNear(m, a.x, a.y) : null;
    p.mounted = false; p.map = a.map; p.x = fr ? fr[0] : a.x; p.y = fr ? fr[1] : a.y; p.left = clock(); p.leftMap = a.map;
    stage(); head(false); if (line) say(fmt(line, nameOf(p)), '', 4000);
    return true;
  }

  // ---------------------------------------------------------------- her head and ears, at the bottom of the view
  let headEl = null;
  // a coat's marks, laid over whatever is already drawn (source-atop keeps them on the coat). Fixed patterns, no random numbers.
  function marks(x, C, x0, y0, w, h, sc) {
    const E = (cx, cy, rx, ry, col, r) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); x.fill(); };
    const n = Math.round(w * h / 40);
    x.save(); x.globalCompositeOperation = 'source-atop';
    if (C.mark === 'roan') for (let i = 0; i < n; i++) E(x0 + ((i * 37) % w), y0 + ((i * 53) % h), sc, sc * 0.8, 'rgba(236,226,216,0.5)');
    // a staggered grid nudged by a fixed hash: even cover, no lines, the same every time
    const grid = (dx, dy, fn) => { let j = 0; for (let gy = y0; gy < y0 + h; gy += dy, j++) for (let gx = x0 + (j % 2) * dx / 2, i = 0; gx < x0 + w; gx += dx, i++) { const hsh = ((i * 7 + j * 13) * 2654435761 >>> 0) % 1000 / 1000; fn(gx + (hsh - 0.5) * dx * 0.6, gy + (((hsh * 7) % 1) - 0.5) * dy * 0.6, hsh, i + j); } };
    if (C.mark === 'dapple') grid(7 * sc, 6 * sc, (cx, cy, q) => { E(cx, cy, 3.2 * sc, 2.6 * sc, 'rgba(78,78,74,0.32)'); E(cx, cy, (1.6 + q) * sc, (1.3 + q * 0.8) * sc, 'rgba(216,216,212,0.7)'); });
    if (C.mark === 'pinto') { E(x0 + w * 0.42, y0 + h * 0.62, w * 0.2, h * 0.38, '#f2eee6', 0.3); E(x0 + w * 0.12, y0 + h * 0.3, w * 0.1, h * 0.3, '#f2eee6', -0.4); E(x0 + w * 0.74, y0 + h * 0.2, w * 0.08, h * 0.22, '#f2eee6', 0.6); }
    if (C.mark === 'spots') grid(8 * sc, 6.5 * sc, (cx, cy, q, t) => E(cx, cy, (1.1 + q) * sc, (0.9 + q * 0.6) * sc, t % 3 ? '#3e3028' : '#5e4a3c', q * 3));
    x.restore();
  }
  let headCoat = '';
  function head(on) {
    if (typeof document === 'undefined') return;
    if (!headEl) {
      const cv = document.getElementById('view'), v = (cv && cv.parentElement) || document.body; if (!v) return;   // beside the view canvas, over it
      headEl = document.createElement('canvas'); headEl.width = 240; headEl.height = 110; headEl.id = 'p84-head';
      headEl.style.cssText = 'position:absolute;left:50%;bottom:0;width:30%;transform:translateX(-50%);pointer-events:none;z-index:6;image-rendering:pixelated;display:none';
      v.appendChild(headEl);
    }
    const k = coatOf(pony());
    if (on && k !== headCoat) {
      headCoat = k; const C = COATS[k];
      const x = headEl.getContext('2d'), E = (cx, cy, rx, ry, col, r) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); x.fill(); };
      const P = (pts, col) => { x.fillStyle = col; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (const q of pts.slice(1)) x.lineTo(q[0], q[1]); x.closePath(); x.fill(); };
      x.clearRect(0, 0, 240, 110);
      // the neck running away from you, the poll at its top, two pointed ears; the mane falls to the right
      P([[34, 112], [206, 112], [150, 44], [90, 44]], C.dark); P([[60, 112], [180, 112], [140, 50], [100, 50]], C.body);
      E(120, 44, 30, 13, C.body);
      P([[100, 40], [92, 8], [110, 34]], C.dark); P([[140, 40], [148, 8], [130, 34]], C.dark);
      marks(x, C, 50, 30, 140, 80, 1.2);
      P([[101, 37], [95, 14], [107, 33]], 'rgba(20,12,8,0.6)'); P([[139, 37], [145, 14], [133, 33]], 'rgba(20,12,8,0.6)');
      const thin = C.mark === 'spots' ? 0.6 : 1;
      for (let i = 0; i < 22; i++) { const t = i / 21; E(126 + t * 52 + ((i * 5) % 3), 48 + t * 62, (4 + t * 3) * thin, 2.4 * thin, C.hair, 0.9); E(126 + t * 52, 47 + t * 62, (2 + t * 2) * thin, 1.2, i % 2 ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.15)', 0.9); }
      x.fillStyle = '#2e7a3a'; x.fillRect(112, 46, 16, 4);                               // the green hire ribbon on the bridle
    }
    headEl.style.display = on ? 'block' : 'none';
    if (on) { const cv = document.getElementById('view'), par = headEl.parentElement; if (cv && par) { const a = cv.getBoundingClientRect(), b = par.getBoundingClientRect(); const hud = a.height * (1 - (typeof VIEW_H !== 'undefined' && typeof VH !== 'undefined' ? VIEW_H / VH : 0.75)); headEl.style.bottom = Math.max(0, b.bottom - a.bottom + hud) + 'px'; headEl.style.width = Math.round(a.width * 0.3) + 'px'; headEl.style.left = Math.round(a.left - b.left + a.width / 2) + 'px'; } }
  }

  // ---------------------------------------------------------------- milestones
  const posts = (m) => m.entities.filter((e) => e && e._p82bPost);
  function chart(m) { try { return typeof BEARINGS82B !== 'undefined' ? BEARINGS82B.chartName(m) : m.name; } catch (e) { return m.name; } }
  function placeMiles(maps) {
    for (const id in maps) {
      const m = maps[id]; if (!m || !m.outdoor || !m.entities || m._p84miles) continue; m._p84miles = true;
      for (const e of posts(m)) {
        let spot = null;
        for (let k = 0; k < 8 && !spot; k++) { const a = k * PI / 4, x = e.x + Math.cos(a) * 1.1, y = e.y + Math.sin(a) * 1.1; if (!m.isBlocked(Math.floor(x), Math.floor(y)) && !m.entities.some((q) => q !== e && Math.hypot(q.x - x, q.y - y) < 0.5)) spot = [x, y]; }
        if (!spot) continue;
        const P = (typeof BEARINGS82B !== 'undefined' ? BEARINGS82B.allPosts() : []).find((q) => q.id === e._p82bPost);
        const toMap = P && maps[(BEARINGS82B.targets(P) || [])[0]];
        const mi = { kind: 'deco', sprite: 'p84_mile', x: spot[0], y: spot[1], scale: 0.55, solid: false, radius: 0.15, _p84mile: e._p82bPost, _p84to: toMap ? toMap.id : null };
        mi.label = fmt(TX.mile, chart(m));
        const at = m.baseCount == null ? m.entities.length : m.baseCount; m.entities.splice(at, 0, mi); if (m.baseCount != null) m.baseCount++;
      }
    }
  }
  const touchedKey = (id) => 'p84m_' + id;
  function touched(id) { return hasG() && Number(G.flags[touchedKey(id)]) === 1; }
  function touch() {
    const c = Engine.cam;
    for (const e of G.ents) { if (!e || !e._p84mile || touched(e._p84mile)) continue; if (Math.hypot(e.x - c.x, e.y - c.y) < 1.6) { G.flags[touchedKey(e._p84mile)] = 1; say(fmt(TX.touched, mileName(G.map, e)), 'good', 4000); } }
  }
  function mileName(m, e) { const t = e._p84to && G.maps[e._p84to]; return t ? fmt(TX.mileName, chart(m), chart(t)) : tr(chart(m)); }

  // ---------------------------------------------------------------- the roads: the way from here to there, gate to gate
  const WIND = 1.25;                                     // a road is about a quarter longer than the straight line between its gates
  function startPoint(R) {
    const c = Engine.cam;
    if (G.map && G.map.outdoor && R.maps[G.mapId]) return { map: G.mapId, x: c.x, y: c.y };
    for (const id in R.maps) { const m = G.maps[id]; if (!m) continue; const i = m.cells.findIndex((q) => q && q.portal && q.portal.map === G.mapId); if (i >= 0) return { map: id, x: i % m.w + 0.5, y: ((i / m.w) | 0) + 0.5 }; }
    return null;
  }
  // every outdoor place laid on a region's chart is a place the world map knows (the roads built since the painting too)
  const FOES = { p83_stride: ['briarsprite', 'hound'], p83_poundstair: ['miredrone', 'hound'], p83_hollows: ['hound'] };
  function ensureRegions() {
    if (typeof BEARINGS82B === 'undefined' || typeof TRAVEL_REGIONS === 'undefined' || !G.maps) return;
    BEARINGS82B.apply(); let added = false;
    for (const rid in TRAVEL_REGIONS) {
      const R = TRAVEL_REGIONS[rid], lay = BEARINGS82B.L.lay[rid]; if (!lay) continue;
      for (const id in lay.places) {
        if (R.maps[id] || !G.maps[id] || !G.maps[id].outdoor) continue;
        const near = BEARINGS82B.gatesOf(G.maps).filter((g) => g.from === id && R.maps[g.to]).map((g) => R.maps[g.to].ch || 1);
        const dg = G.maps[id].danger || 0;
        R.maps[id] = { ch: near.length ? Math.min(...near) : 1, rect: lay.frac(id), risk: dg ? 0.1 + 0.08 * dg : 0, p84: true };
        if (!dg) R.maps[id].safe = true;
        if (typeof TRAVEL_FOES !== 'undefined' && !TRAVEL_FOES[id] && dg) TRAVEL_FOES[id] = FOES[id] || ['hound'];
        added = true;
      }
    }
    if (added) BEARINGS82B.apply();
  }
  function route(d, from) {
    if (!hasG() || typeof BEARINGS82B === 'undefined' || typeof TRAVEL_REGIONS === 'undefined') return null;
    try { ensureRegions(); } catch (e) { warnOnce('regions', e); }
    const R = TRAVEL_REGIONS[TRAVEL.region]; if (!R || !R.maps[d.map]) return null;
    const s = from || startPoint(R); if (!s || !R.maps[s.map]) return null;
    const gates = BEARINGS82B.gatesOf(G.maps).filter((g) => !g.pseudo && R.maps[g.from] && R.maps[g.to]);
    // nodes: 0 the start, 1 the end, then for every gate its two sides (leaving A, arriving in B)
    const N = [{ map: s.map, x: s.x, y: s.y }, { map: d.map, x: d.x, y: d.y }];
    for (const g of gates) { N.push({ map: g.from, x: g.x + 0.5, y: g.y + 0.5, g, out: true }); N.push({ map: g.to, x: g.tx, y: g.ty, g, out: false }); }
    const dist = N.map(() => Infinity), prev = N.map(() => -1), done = N.map(() => false); dist[0] = 0;
    for (let it = 0; it < N.length; it++) {
      let u = -1; for (let i = 0; i < N.length; i++) if (!done[i] && dist[i] < Infinity && (u < 0 || dist[i] < dist[u])) u = i;
      if (u < 0 || u === 1) break; done[u] = true;
      const a = N[u];
      for (let v = 1; v < N.length; v++) {
        if (done[v]) continue; const b = N[v]; let w = Infinity;
        if (a.out && !b.out && b.g === a.g) w = 0;                                     // through the gate
        else if (b.map === a.map && (v === 1 || b.out) && !(a.out && v !== 1)) w = Math.hypot(b.x - a.x, b.y - a.y) * WIND;   // along the stretch
        if (dist[u] + w < dist[v]) { dist[v] = dist[u] + w; prev[v] = u; }
      }
    }
    if (dist[1] === Infinity) return null;
    const path = []; for (let v = 1; v >= 0; v = prev[v]) path.unshift(N[v]);
    const legs = []; for (let i = 0; i + 1 < path.length; i++) if (path[i].map === path[i + 1].map) legs.push({ map: path[i].map, ax: path[i].x, ay: path[i].y, bx: path[i + 1].x, by: path[i + 1].y, cells: Math.hypot(path[i + 1].x - path[i].x, path[i + 1].y - path[i].y) * WIND });
    return { cells: dist[1], legs, maps: legs.map((l) => l.map) };
  }
  // the places a milestone can be travelled to: along the roads from where you are, never through a place the story has
  // closed (after the Greening the Hedge takes the Flume's gate and the Greenroot road: what lies past them is out of reach)
  function closed() {
    const out = new Set(); if (!(G.flags && G.flags.greening)) return out;
    for (const M of [typeof FLUME16 !== 'undefined' ? FLUME16.MAPS : null, typeof PARISH !== 'undefined' ? PARISH.MAPS : null, ['p79_road_w', 'p79_greenroad', 'p79_road_e']]) if (Array.isArray(M)) M.forEach((id) => out.add(id));
    return out;
  }
  function reachable(R) {
    const s = startPoint(R), shut = closed(), seen = new Set(); if (!s || shut.has(s.map)) return seen;
    const gates = BEARINGS82B.gatesOf(G.maps).filter((g) => !g.pseudo), q = [s.map]; seen.add(s.map);
    while (q.length) { const a = q.shift(); for (const g of gates) if (g.from === a && !seen.has(g.to) && !shut.has(g.to) && R.maps[g.to]) { seen.add(g.to); q.push(g.to); } }
    return seen;
  }
  const withPony = () => hired() && (() => { const p = pony(); return !!p && (p.mounted || p.map === G.mapId); })();
  function minutesOf(cells) {
    let mins = Math.max(10, cells);
    if (TRAVEL.pace === 'cautious') mins *= 1.35;
    if (withPony()) mins *= 0.5;
    if (typeof Weather !== 'undefined') mins *= Weather.travelFactor();
    return Math.round(mins / 5) * 5;
  }
  function legRisk(R, leg, mins) {
    const mc = R.maps[leg.map] || {}; if (mc.safe) return 0;
    const m = G.maps[leg.map], base = mc.risk != null ? mc.risk : 0.12 * ((m && m.danger) || 0);
    const nt = G.tod < 0.25 || G.tod > 0.83 ? 1.4 : 1, sky = typeof Weather !== 'undefined' ? Weather.riskFactor() : 1;
    return Math.min(0.85, base * (TRAVEL.pace === 'cautious' ? 0.4 : 1) * nt * sky * clamp(mins / 45, 0.4, 1.5));
  }
  function haltOn(r) {
    // about halfway along: the stretch the middle falls on, at its named halt if it has one, else where the middle is
    let half = r.cells / 2, leg = r.legs[0];
    for (const l of r.legs) { if (half <= l.cells) { leg = l; break; } half -= l.cells; }
    const m = G.maps[leg.map]; let x = leg.ax + (leg.bx - leg.ax) * clamp(half / Math.max(1, leg.cells), 0, 1), y = leg.ay + (leg.by - leg.ay) * clamp(half / Math.max(1, leg.cells), 0, 1), name = TX.halt;
    if (leg.map === 'p83_wethers' && typeof DROVE83 !== 'undefined') { x = DROVE83.HALT[0] + 1.5; y = DROVE83.HALT[1] - 1.5; name = TX.pines; }
    const fr = typeof travelFreeNear === 'function' ? travelFreeNear(m, x, y) : [x, y];
    return { name: tr(name) + ' (' + tr(chart(m)) + ')', map: leg.map, x: fr ? fr[0] : x, y: fr ? fr[1] : y, dir: 0, fx: 0, fy: 0, halt: true };
  }
  function crossesDusk(mins) { const h0 = hour(); return h0 >= 5 && h0 < 20 && h0 + mins / 60 > 20; }

  // the pony, side on, facing right: short thick legs, a deep round barrel, a short crested neck, a big head.
  // The coat is painted on its own layer so the marks stay on the hide; mane, tail, tack go on top.
  function paintPony(x, C) {
    const L = document.createElement('canvas'); L.width = 104; L.height = 86; const b = L.getContext('2d');
    const E = (g, cx, cy, rx, ry, col, r) => { g.fillStyle = col; g.beginPath(); g.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); g.fill(); };
    const legShape = (g, lx, col, bend) => { g.fillStyle = col; g.beginPath(); g.moveTo(lx - 1, 52); g.lineTo(lx + 10, 52); g.lineTo(lx + 8 + bend, 70); g.lineTo(lx + 7 + bend, 78); g.lineTo(lx + 2 + bend, 78); g.lineTo(lx + 1 + bend, 70); g.closePath(); g.fill(); E(g, lx + 5 + bend, 70, 3.6, 3, col); };
    const LEGS = [[30, 1, true, 2], [70, -1, true, 3], [22, 0, false, 1], [62, 0, false, 0]];   // far hind, far fore, near hind, near fore: x, bend, far, sock index
    for (const [lx, bend, far] of LEGS) legShape(b, lx, far ? C.dark : C.body, bend);
    E(b, 48, 44, 31, 15, C.body); E(b, 24, 40, 12, 12, C.body); E(b, 72, 44, 11, 13, C.body);
    b.fillStyle = C.body; b.beginPath(); b.moveTo(64, 36); b.quadraticCurveTo(72, 18, 84, 12); b.lineTo(94, 18); b.quadraticCurveTo(88, 34, 84, 52); b.lineTo(70, 54); b.closePath(); b.fill();
    b.beginPath(); b.moveTo(82, 12); b.quadraticCurveTo(92, 6, 98, 14); b.lineTo(103, 30); b.quadraticCurveTo(102, 37, 95, 37); b.quadraticCurveTo(86, 34, 84, 26); b.closePath(); b.fill();
    b.beginPath(); b.moveTo(85, 11); b.lineTo(86, 2); b.lineTo(90, 9); b.closePath(); b.fill();
    marks(b, C, 14, 10, 90, 64, 1);
    b.save(); b.globalCompositeOperation = 'source-atop';
    E(b, 46, 37, 26, 8, 'rgba(255,240,220,0.12)'); E(b, 50, 56, 28, 5, 'rgba(0,0,0,0.12)'); E(b, 88, 25, 6, 7, 'rgba(255,240,220,0.1)');
    if (C.mark === 'dun') { b.strokeStyle = C.hair; b.lineWidth = 2; b.beginPath(); b.ellipse(48, 44.5, 30, 14, 0, PI * 1.08, PI * 1.62); b.stroke(); b.fillStyle = C.hair; for (const [lx, bend] of LEGS) for (let k = 0; k < 3; k++) b.fillRect(lx + 1 + bend * 0.5, 58 + k * 3, 8, 1); }
    // the lower legs: the coat's points, then white socks
    for (const [lx, bend, far, si] of LEGS) {
      const white = (C.socks || []).includes(si);
      b.fillStyle = white ? (far ? '#d6d0c4' : '#eeeae2') : C.legs; b.fillRect(lx - 1 + bend, white ? 66 : 63, 12, white ? 14 : 17);
      if (far && !white) { b.fillStyle = 'rgba(0,0,0,0.22)'; b.fillRect(lx - 1 + bend, 63, 12, 17); }
    }
    E(b, 98, 33, 5, 4, 'rgba(30,18,12,0.55)');                                           // the muzzle, always darker
    if (C.face === 'star') { b.fillStyle = '#efe9de'; b.beginPath(); b.moveTo(92, 14); b.lineTo(94.5, 17); b.lineTo(92, 20); b.lineTo(89.5, 17); b.closePath(); b.fill(); }
    if (C.face === 'blaze' || C.face === 'bald') { b.fillStyle = '#efe9de'; b.beginPath(); b.moveTo(89, 13); b.lineTo(C.face === 'bald' ? 97 : 94, 13); b.lineTo(103, 30); b.lineTo(C.face === 'bald' ? 94 : 99, 32); b.closePath(); b.fill(); }
    b.restore();
    E(x, 52, 82, 40, 4, 'rgba(0,0,0,0.3)');
    // the tail, full and long from a high croup (thinner on the spotted mare: leopard-spotted horses often have sparse tails)
    const tw = C.mark === 'spots' ? 0.55 : 1;
    x.fillStyle = C.hair; x.beginPath(); x.moveTo(18, 34); x.quadraticCurveTo(6 + (1 - tw) * 8, 44, 9 + (1 - tw) * 6, 70); x.quadraticCurveTo(12, 74, 16, 70); x.quadraticCurveTo(15, 50, 23, 38); x.closePath(); x.fill();
    x.drawImage(L, 0, 0);
    for (const [lx, bend] of LEGS) { x.fillStyle = '#1e140e'; x.fillRect(lx + 1 + bend, 77, 7.5, 5); }   // hooves
    x.fillStyle = 'rgba(20,12,8,0.6)'; x.beginPath(); x.moveTo(86, 4); x.lineTo(88.5, 9); x.lineTo(86.5, 9); x.closePath(); x.fill();   // inside the ear
    E(x, 93, 18, 1.6, 1.6, '#1e140e'); E(x, 100, 32, 1, 1, '#1e140e');                   // the eye and the nostril
    // the mane, thick along the crest, and the forelock
    x.fillStyle = C.hair; x.beginPath(); x.moveTo(84, 9); x.quadraticCurveTo(70, 14, 62, 34); x.lineTo(66, 38); x.quadraticCurveTo(72, 22, 86, 15); x.closePath(); x.fill();
    for (let i = 0; i < 7; i++) E(x, 67 + i * 2.6, 32 - i * 3, 3 * tw, 2.2 * tw, C.hair, 0.6);
    E(x, 90, 13, 4 * tw, 2.5, C.hair, 0.4);
    // the saddle and girth; the bridle with the green hire ribbon
    x.fillStyle = '#3a2a1c'; x.beginPath(); x.moveTo(36, 31); x.quadraticCurveTo(48, 36, 60, 30); x.lineTo(62, 26); x.quadraticCurveTo(48, 32, 34, 26); x.closePath(); x.fill();
    x.fillStyle = '#5a4430'; x.fillRect(47, 33, 4, 22); x.fillStyle = '#6a5a40'; x.fillRect(46, 50, 6, 6);
    x.strokeStyle = '#3a2a1c'; x.lineWidth = 1.5; x.beginPath(); x.moveTo(87, 12); x.lineTo(96, 34); x.moveTo(90, 28); x.lineTo(101, 28); x.stroke();
    x.fillStyle = '#2e7a3a'; x.fillRect(86, 14, 4, 3); x.fillRect(85, 16, 2, 5);
  }

  // ---------------------------------------------------------------- art (code only, no random numbers)
  function art() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || typeof document === 'undefined') return;
    const add = (name, w, h, hs, fn) => { if (Engine.sprites[name]) return; const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d', { willReadFrequently: true }); fn(x); Engine.addSprite(name, { w, h, hs, cx: 0.5, dy: 0, data: new Uint32Array(x.getImageData(0, 0, w, h).data.buffer.slice(0)) }); };
    const E = (x, cx, cy, rx, ry, col, r) => { x.fillStyle = col; x.beginPath(); x.ellipse(cx, cy, rx, ry, r || 0, 0, PI * 2); x.fill(); };
    // the pony, side on: a roan (red-brown flecked with white), saddled, the green hire ribbon on her bridle
    for (const k in COATS) add(spriteOf(k), 104, 86, 1.25, (x) => paintPony(x, COATS[k]));
    // a milestone: a short dressed stone with a rounded head, a line cut across it
    add('p84_mile', 32, 40, 0.6, (x) => {
      E(x, 16, 38, 13, 2.5, 'rgba(0,0,0,0.3)');
      x.fillStyle = '#9a968a'; x.beginPath(); x.moveTo(5, 38); x.lineTo(5, 14); x.quadraticCurveTo(16, 2, 27, 14); x.lineTo(27, 38); x.closePath(); x.fill();
      x.fillStyle = '#7a766a'; x.fillRect(20, 14, 7, 24); x.fillStyle = '#4a463e'; x.fillRect(8, 18, 16, 2); x.fillRect(10, 23, 12, 1.5); x.fillRect(10, 27, 10, 1.5);
      E(x, 10, 33, 4, 2, 'rgba(110,130,80,0.6)');
    });
  }

  // ---------------------------------------------------------------- the stables
  function placeStables(maps) {
    const pen = maps.p79_road_w;
    if (pen && !pen.entities.some((e) => e && e.use === 'stable')) {
      // by the Long Common's east gate (the far end of the stretch from the clearing), a little in from the road
      const g = typeof BEARINGS82B !== 'undefined' ? BEARINGS82B.gatesOf(maps).find((q) => q.from === 'p79_road_w' && q.side === 'E') : null;
      const fr = g && typeof travelFreeNear === 'function' ? travelFreeNear(pen, g.x - 3.5, g.y + 3.5) : null;
      if (fr) { STABLES.p79_road_w = { x: fr[0], y: fr[1] }; const at = pen.baseCount == null ? pen.entities.length : pen.baseCount; pen.entities.splice(at, 0, { kind: 'deco', sprite: 'sign', x: fr[0], y: fr[1], scale: 0.85, solid: false, radius: 0.2, use: 'stable', label: TX.stableSign }); if (pen.baseCount != null) pen.baseCount++; }
    }
    const combe = maps.p22_combe;
    if (combe && !combe.entities.some((e) => e && e.use === 'stable')) {
      const s = STABLES.p22_combe, fr = typeof travelFreeNear === 'function' ? travelFreeNear(combe, s.x, s.y) : [s.x, s.y];
      if (fr) { const at = combe.baseCount == null ? combe.entities.length : combe.baseCount; combe.entities.splice(at, 0, { kind: 'deco', sprite: 'sign', x: fr[0], y: fr[1], scale: 0.85, solid: false, radius: 0.2, use: 'stable', label: TX.stableSign }); if (combe.baseCount != null) combe.baseCount++; }
    }
  }

  // ---------------------------------------------------------------- the hour: she waits, goes home, takes fright; the day ends
  let lastStage = '';
  function tick() {
    if (!hasG() || !G.map) return;
    const p = pony();
    if (p && !hired()) { if (p.mounted) { getDown(null); say(fmt(TX.dayUp, nameOf(p)), '', 5000); } G.player.p84 = null; stage(); head(false); return; }
    if (hired() && !p && !G.player.horseFrom) G.player.horseFrom = 'oakhaven';   // a hire made before this phase
    if (hired() && !p && G.player.horseFrom) { const s = stableSpot(G.player.horseFrom) || stableSpot('oakhaven'); if (s) { G.player.p84 = { map: s.map, x: s.x, y: s.y, coat: coatOf({ home: G.player.horseFrom }), mounted: false, left: clock(), home: G.player.horseFrom }; stage(); } }
    if (p && !p.mounted && !p.atHome && clock() - p.left > 6) sendHome(p);
    if (p && !p.mounted && !p.atHome && p.map !== G.mapId && night()) { const m = G.maps[p.map]; if (m && (m.danger || 0) >= 1) { sendHome(p); p.fright = 1; } }
    if (p) head(p.mounted);
    const key = (p ? p.map + p.mounted + p.x.toFixed(1) : '-') + G.mapId; if (key !== lastStage) { lastStage = key; stage(); }
    touch();
  }

  // ---------------------------------------------------------------- the stable panel: three ponies to choose from, a portrait of each
  const pick = { coat: null };
  function portrait(k) {
    const c = document.createElement('canvas'); c.width = 104; c.height = 86; c.className = 'p84-portrait';
    const s = typeof Engine !== 'undefined' && Engine.sprites[spriteOf(k)];
    if (s && s.data) c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(s.data.buffer.slice(0)), s.w, s.h), 0, 0);
    c.style.cssText = 'width:4.2em;height:auto;image-rendering:pixelated;display:block;margin:0 auto';
    return c;
  }
  function choose(id) {
    const offer = OFFER[id] || OFFER.oakhaven, active = hired();
    const study = document.querySelector('#modal-panel .horse-study'); if (!study) return;
    const cur = active ? coatOf(pony()) : (offer.includes(pick.coat) ? pick.coat : offer[0]); pick.coat = cur;
    const bh = study.querySelector('b'); if (bh && active) bh.textContent = fmt(TX.hiredAs, COATS[cur].name);
    const row = document.createElement('div'); row.className = 'p84-coats'; row.setAttribute('role', 'radiogroup'); row.setAttribute('aria-label', tr(TX.pick));
    row.style.cssText = 'display:flex;gap:1cqw;justify-content:space-between;margin:1cqh 0';
    const about = document.createElement('p'); about.className = 'p84-about'; about.style.margin = '.4em 0';
    const show = () => { for (const b of row.children) { const on = b.dataset.coat === pick.coat; b.setAttribute('aria-checked', on ? 'true' : 'false'); b.style.outline = on ? '2px solid var(--gold, #d8b45a)' : 'none'; b.style.opacity = on || !active ? '1' : '0.45'; } about.textContent = tr(COATS[pick.coat].about); };
    for (const k of offer) {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'dfbtn p84-coat'; b.dataset.coat = k; b.setAttribute('role', 'radio'); b.style.cssText = 'flex:1;padding:.2em .2em;line-height:1.15';
      if (active && k !== cur) b.disabled = true;
      b.appendChild(portrait(k)); const t = document.createElement('span'); t.textContent = fmt(COATS[k].name); t.style.display = 'block'; b.appendChild(t);
      b.onclick = () => { if (hired() || G.openPanel !== 'stable') return; pick.coat = k; show(); };
      row.appendChild(b);
    }
    study.insertAdjacentElement('afterend', row); row.insertAdjacentElement('afterend', about); show();
    const hint = document.querySelector('#modal-panel p.muted:last-of-type'); if (hint && !active) { const h2 = document.createElement('p'); h2.className = 'muted'; h2.textContent = tr(TX.chooseHint); hint.insertAdjacentElement('afterend', h2); }
    pick.show = show; pick.offer = offer;
  }
  function stepChoice(d) { if (!pick.offer || hired()) return; const i = pick.offer.indexOf(pick.coat); pick.coat = pick.offer[(i + d + pick.offer.length) % pick.offer.length]; if (pick.show) pick.show(); }

  // ---------------------------------------------------------------- hooks
  function wire() {
    art();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { art(); placeMiles(maps); placeStables(maps); } catch (e) { warnOnce('build', e); } return maps; }; }
    if (typeof loadMap === 'function') {
      const _l = loadMap;
      loadMap = function (id) {
        let from = null; try { if (mounted() && G.map) from = { map: G.mapId, x: Engine.cam.x, y: Engine.cam.y }; } catch (e) { /* first load */ }
        const r = _l.apply(this, arguments);
        try {
          if (from && mounted()) {
            const m = G.map, p = pony();
            if (!m.outdoor) { getDown(TX.indoors, from); }
            else if (NO_GO.has(m.id)) { getDown(m.id === 'p83_poundstair' ? TX.stair : TX.grove, from); }
            else { p.map = m.id; p.x = Engine.cam.x; p.y = Engine.cam.y; }
          }
          lastStage = ''; tick();
        } catch (e) { warnOnce('load', e); }
        return r;
      };
    }
    if (typeof playerMove === 'function') {
      const _m = playerMove;
      playerMove = function (o, dx, dy) {
        try {
          if (typeof Engine !== 'undefined' && o === Engine.cam && mounted()) {
            const m = G.map, nx = o.x + dx * RIDE, ny = o.y + dy * RIDE, f = m.floorCells && m.floorTextures ? m.floorTextures[m.floorCells[Math.floor(ny) * m.w + Math.floor(nx)]] : '';
            if (PLANK.test(f || '')) { if (!G._p84plank || G.time - G._p84plank > 3) { G._p84plank = G.time; say(tr(TX.planks), '', 3500); } return { bx: true, by: true }; }
            G.noise = Math.max(Number(G.noise) || 0, 1.3);
            return _m.call(this, o, dx * RIDE, dy * RIDE);
          }
        } catch (e) { warnOnce('move', e); }
        return _m.apply(this, arguments);
      };
    }
    if (typeof update === 'function') {
      const _u = update;
      update = function () {
        const p0 = hasG() ? G.player.fat : 0, wasUp = mounted();
        const r = _u.apply(this, arguments);
        try { if (wasUp && mounted() && G.state === 'play') { Engine.cam.z = (Number(G.player.feet) || 0) + 0.88 + EYE; if (G.player.fat < p0) G.player.fat = p0 - (p0 - G.player.fat) * 0.15; } tick(); } catch (e) { /* next frame */ }
        return r;
      };
    }
    if (typeof attack === 'function') { const _a = attack; attack = function () { try { if (mounted() && typeof currentWeapon === 'function' && currentWeapon().ranged) { say(tr(TX.noShot), 'warn', 2000); return; } } catch (e) { /* swing */ } return _a.apply(this, arguments); }; }
    if (typeof damagePlayer === 'function') {
      const _d = damagePlayer;
      damagePlayer = function (dmg) {
        const r = _d.apply(this, arguments);
        try { if (mounted() && dmg >= 6) { const p = pony(); p.hits = (p.hits || 0) + 1; if (p.hits % 3 === 0) { const c = Engine.cam; getDown(TX.thrown, { map: G.mapId, x: c.x + Math.cos(c.dir + PI / 2) * 1.6, y: c.y + Math.sin(c.dir + PI / 2) * 1.6 }); } } } catch (e) { /* stay up */ }
        return r;
      };
    }
    if (typeof window !== 'undefined' && window.addEventListener) window.addEventListener('keydown', (ev) => {
      try { if (hasG() && G.openPanel === 'stable' && !ev.repeat) { const k0 = typeof keyOf === 'function' ? keyOf(ev) : (ev.key || '').toLowerCase(); if (k0 === 'arrowleft' || k0 === 'arrowright') { ev.preventDefault(); stepChoice(k0 === 'arrowleft' ? -1 : 1); return; } }
        if (!hasG() || G.state !== 'play' || ev.repeat) return; if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return; const k = typeof keyOf === 'function' ? keyOf(ev) : (ev.key || '').toLowerCase(); if (k === 'x' && pony()) { ev.preventDefault(); getUp(); } } catch (e) { warnOnce('key', e); }
    });
    // the stables: which pony, and where she comes from; the fright paid for
    if (typeof openStable === 'function') {
      const _o = openStable;
      openStable = function () {
        const r = _o.apply(this, arguments);
        try {
          const id = G.mapId, h = document.querySelector('#modal-panel h2'), pp = document.querySelector('#modal-panel h2 + p');
          if (id === 'p22_combe') { if (h) h.textContent = tr(TX.yardTitle); if (pp) pp.textContent = tr(TX.yardText); }
          if (id === 'p79_road_w') { if (h) h.textContent = tr(TX.penTitle); if (pp) pp.textContent = tr(TX.penText); }
          const p = G.player.p84; if (p && p.fright) { p.fright = 0; G.player.gold = Math.max(0, (Number(G.player.gold) || 0) - 5); say(tr(TX.paidFright), '', 4000); }
          choose(id);
          const quiet = (fn, self, args) => { const _msg = msg; msg = function () {}; try { return fn && fn.apply(self, args); } finally { msg = _msg; } };
          const rent = document.getElementById('stable-rent');
          if (rent) { const _c = rent.onclick; rent.onclick = function () { const was = hired(), k = pick.coat; const rr = quiet(_c, this, arguments); if (!was && hired()) { G.player.horseFrom = TX.names[id] ? id : 'oakhaven'; G.player.horseCoat = k; G.player.p84 = null; tick(); say(fmt(TX.hireLine, COATS[k].name, HORSE.cost), 'good', 6500); } return rr; }; }
          const back = document.getElementById('stable-return');
          if (back) { const _c = back.onclick; back.onclick = function () { const nm = nameOf(pony()), rr = quiet(_c, this, arguments); if (!hired()) { G.player.p84 = null; G.player.horseCoat = null; stage(); head(false); say(fmt(TX.backLine, nm, HORSE.refund), '', 5500); } return rr; }; }
        } catch (e) { warnOnce('stable', e); }
        return r;
      };
    }
    // the world map: milestones to go to, the way along the roads, night halts, an ambush where it happens
    if (typeof travelDestinations === 'function') {
      const _t = travelDestinations;
      travelDestinations = function (regionId) {
        try { ensureRegions(); } catch (e) { warnOnce('regions', e); }
        const out = _t.apply(this, arguments);
        try {
          const R = TRAVEL_REGIONS[regionId], ch = typeof travelChapter === 'function' ? travelChapter() : 1, open = reachable(R);
          for (const id in R.maps) {
            const m = G.maps[id]; if (!m || !m.outdoor || !open.has(id) || !travelMapVisited(m)) continue; const mc = R.maps[id], mch = mc.ch || 1;
            if (!(mch === ch || (mch === 1 && ch === 1) || mch < ch)) continue;
            for (const e of m.entities) {
              if (!e || !e._p84mile) continue;
              if (!touched(e._p84mile) && !(typeof travelSeenNear === 'function' && travelMapVisited(m) && travelSeenNear(m, e.x, e.y, 2))) continue;
              const fr = travelFreeNear(m, e.x + 0.6, e.y + 0.6) || [e.x, e.y], [fx, fy] = travelPlace(R, id, fr[0], fr[1]);
              out.push({ name: mileName(m, e), map: id, x: fr[0], y: fr[1], dir: 0, fx, fy, state: mch === ch || (mch === 1 && ch === 1) ? 'ok' : 'behind', mile: e._p84mile });
            }
          }
        } catch (e) { warnOnce('dests', e); }
        return out;
      };
    }
    if (typeof travelMinutes === 'function') {
      const _tm = travelMinutes;
      travelMinutes = function (d) { try { const r = route(d); if (r && r.legs.length >= 2) return minutesOf(r.cells); } catch (e) { warnOnce('minutes', e); } return _tm.apply(this, arguments); };   // within one place: as it always was
    }
    if (typeof travelConfirm === 'function') {
      const _c = travelConfirm;
      travelConfirm = function (d) {
        const r0 = _c.apply(this, arguments);
        try {
          const el = document.getElementById('tvconfirm'), r = route(d); if (!el || !r || r.legs.length < 1) return r0;
          const names = []; for (const l of r.legs) { const n = tr(chart(G.maps[l.map])); if (names[names.length - 1] !== n) names.push(n); }
          const p = document.createElement('p'); p.className = 'muted'; p.textContent = fmt(TX.byRoads, names.join(', ')); el.insertBefore(p, el.children[1] || null);
          if (r.legs.length >= 2 && crossesDusk(travelMinutes(d))) {
            const h = haltOn(r), row = document.createElement('div'); row.className = 'tv-row';
            row.innerHTML = '<span class="muted"></span> <span class="tone"><button class="dfbtn small" id="p84-stop"></button><button class="dfbtn small" id="p84-press"></button></span>';
            row.children[0].textContent = tr(TX.pastDusk); row.querySelector('#p84-stop').textContent = fmt(TX.stopAt, h.name); row.querySelector('#p84-press').textContent = tr(TX.pressOn);
            row.querySelector(TRAVEL.p84press ? '#p84-press' : '#p84-stop').classList.add('sel');
            row.querySelector('#p84-stop').onclick = () => { TRAVEL.p84press = false; travelConfirm(d); };
            row.querySelector('#p84-press').onclick = () => { TRAVEL.p84press = true; travelConfirm(d); };
            el.insertBefore(row, el.querySelector('.tv-row') || null);
          }
        } catch (e) { warnOnce('confirm', e); }
        return r0;
      };
    }
    if (typeof travelGo === 'function') {
      const _g = travelGo, _risk = typeof travelRisk === 'function' ? travelRisk : null;
      travelGo = function (d) {
        let r = null; try { r = d && !d.halt && !d.mid ? route(d) : null; } catch (e) { r = null; }
        if (!r || r.legs.length < 2 || !_risk || (typeof travelBlocked === 'function' && travelBlocked())) return _g.apply(this, arguments);   // within one place: as it always was
        const R = TRAVEL_REGIONS[TRAVEL.region], pace = TRAVEL.pace, wasPony = withPony(), p = pony();
        // the night halt
        let target = d, rest = null;
        if (r.legs.length >= 2 && crossesDusk(travelMinutes(d)) && !TRAVEL.p84press) { target = haltOn(r); rest = d.name; }
        // an ambush where it happens: each stretch on the way rolls for its own
        const rt = target === d ? r : route(target) || r;
        let hit = null;
        for (const l of rt.legs) { const mins = minutesOf(l.cells); if (Math.random() < legRisk(R, l, mins)) { hit = l; break; } }
        if (hit) { const m = G.maps[hit.map], fr = travelFreeNear(m, (hit.ax + hit.bx) / 2, (hit.ay + hit.by) / 2) || [hit.ax, hit.ay]; target = { name: tr(chart(m)), map: hit.map, x: fr[0], y: fr[1], dir: Math.atan2(hit.by - hit.ay, hit.bx - hit.ax), fx: 0, fy: 0, mid: true }; rest = null; }
        travelRisk = function () { return hit ? 1 : 0; };                         // the game's own roll then sets what waited (and other modules see it)
        try { _g.call(this, target); } finally { travelRisk = _risk; }
        try {
          if (wasPony && p) { p.map = G.mapId; p.x = Engine.cam.x; p.y = Engine.cam.y; p.mounted = true; p.atHome = false; lastStage = ''; tick(); }
          if (rest) say(fmt(TX.stopped, target.name, rest), '', 6000);
          if (hit) say(fmt(TX.midRoad, target.name), 'bad', 5000);
        } catch (e) { warnOnce('go', e); }
        TRAVEL.p84press = false;
        return undefined;
      };
    }
    if (typeof travelDraw === 'function') {
      const _dr = travelDraw;
      travelDraw = function () {
        const r0 = _dr.apply(this, arguments);
        try {
          if (TRAVEL.view === 'continent') return r0;
          const cv = document.getElementById('tvmap'), d = TRAVEL.dests.find((q) => q.name === TRAVEL.sel) || TRAVEL.hover; if (!cv || !d || !d.map) return r0;
          const r = route(d); if (!r) return r0;
          const R = TRAVEL_REGIONS[TRAVEL.region], x = cv.getContext('2d'), W = cv.width, H = cv.height, u = 0.62 * W / Math.max(1, cv.getBoundingClientRect().width || W);
          x.save(); x.setLineDash([9 * u, 7 * u]); x.lineWidth = 3.5 * u; x.strokeStyle = 'rgba(255,236,170,0.9)'; x.beginPath();
          r.legs.forEach((l, i) => { const [ax, ay] = travelPlace(R, l.map, l.ax, l.ay), [bx, by] = travelPlace(R, l.map, l.bx, l.by); if (i === 0) x.moveTo(ax * W, ay * H); else x.lineTo(ax * W, ay * H); x.lineTo(bx * W, by * H); });
          x.stroke(); x.restore();
        } catch (e) { warnOnce('draw', e); }
        return r0;
      };
    }
  }
  wire();

  return { chartColour: () => { try { return hired() ? COATS[coatOf(pony())].chart : null; } catch (e) { return null; } }, ensureRegions, TX, TEXTS, COATS, OFFER, coatOf, pick, stepChoice, paintPony, STABLES, NO_GO, RIDE, EYE, pony, mounted, hired, getUp, getDown, stage, tick, sendHome, stableSpot, placeMiles, touched, route, minutesOf, legRisk, haltOn, crossesDusk, mileName, head };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = MOUNTS84;
if (typeof window !== 'undefined') window.MOUNTS84 = MOUNTS84;
