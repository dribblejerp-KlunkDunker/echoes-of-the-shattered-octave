// ============================================================
//  road79b — Phase 79, the long road made three times as long, with people on it and old places off it.
//
//  Owner, 12 Nov: "make the road 3 times longer and add more to do and explore. add the occasional traveler or band of
//  travelers, explorers. There should be old ruins that hide dangerous and deadly surprises and perhaps a full dungeon
//  that can be explored and looted for special gear."
//
//  js/road79.js put one map between Outside the Hedge and Greenroot. This file puts one more on each side of it, so the
//  Greenroot road is three stretches, walked in order (each takes over the two doors it stands between; nothing else
//  about any place changes):
//    the Long Common   (ROAD79B.WEST)  Outside the Hedge  ->  the middle stretch
//    the middle        (ROAD79.MAP)    the ford, the mere, the Narrows: as built
//    Greenroot Wood    (ROAD79B.EAST)  the middle stretch  ->  Greenroot
//  Every stretch keeps the owner's rules: the road is not a straight line; there is a lake, running water to cross, a
//  cliff or crag, a climb and a far skyline; something to find, someone to meet (with a small task), and something that
//  only happens at night or in bad weather.
//    the Long Common   the Delph (an old stone pit: hounds bedded in the bottom, a strongbox, the oil-can); a clapper
//                      bridge; the well and its hush-lamp (the task: fill it; then it burns at night); the Ringing Stand
//                      (in rain or storm the oaks toll, and standing among them is the loudest place on the road: noise
//                      brings the hounds, as it always has); Crow Tor; Long Water. A turf-cutter by day.
//    Greenroot Wood    the Cleave (a gorge); a timber bridge; the fen and its eel-stage; the lych-house, a ruin on a
//                      knoll with a Dirge in it, hounds behind it and two traps, and the mouth of the Howe (the dungeon:
//                      js/howe79.js); an antiquary and her digger (the explorers; her task is below ground); at night
//                      hush-moths come to their lantern.
//  Travellers (js/life60.js people, on every stretch, walking the road itself and crossing by the bridges):
//    a packman, one day in three: out from the Hedge in the morning as far as the toll-house, and home in the afternoon;
//    a band of three who went to Greenroot and turned back, one day in three: west along all three stretches.
//  Canon: Greenroot is found empty ("Tables laid, doors shut, kettles cold, and nobody"; the boots on the step; the
//  hush-lamp still burning), so nobody on this road has come from there with good news; noise brings the hounds; the
//  oaks ring; hush-lamps keep a street from going silent; hush-moths eat the light first. Everything else was [PROPOSED] and approved by the owner on 13 Nov.
//
//  Flags: p79_lamp (0, 1 = you carry the oil-can, 2 = the lamp is filled), p79_words (set in the Howe; 2 once written in
//  the field-book). No random numbers (the hounds that noise brings are the game's own).
// ============================================================
'use strict';

const ROAD79B = (function () {
  if (typeof ROAD79 === 'undefined' || !ROAD79.util) return {};
  const R = ROAD79, { h2, along, inEll, night } = R.util, PI = Math.PI, CRAG = R.CRAG, ROAD = R.ROAD;
  const WEST = 'p79_road_w', EAST = 'p79_road_e', MID = R.MAP, HOWE = 'p79_howe';
  const TRACK = 1, WATER = 2, SHALLOW = 3, PLANK = 4, MOSS = 5, ROCK = 6, FLAG = 7;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    nameW: S('The Greenroot Road: the Long Common'),
    nameE: S('The Greenroot Road: Greenroot Wood'),
    // ---- the Long Common
    delph: S('The Delph. They cut stone here until the day the glass came through the face, and then they stopped all at once: there are wedges still standing in the last block. Something has made its bed in the bottom.'),
    glass: S('Glass, come up through the stone like frost through a window. It is faintly warm, and it hums.'),
    glassNight: S('The glass is alight from inside, green and gold, and the whole pit hums one note with it.'),
    wind: S('The winding-house, what the weather has left of it. The drum is gone. The pawl is still on its pin.'),
    can: S('An oil-can under the fallen lintel, stoppered and half full.'),
    canTake: S('You take the oil-can. It is heavier than it looks, and it does not rattle.'),
    clapper: S('A clapper bridge: four slabs on three piers, and no rail. Whoever laid it did not expect to be thanked, and has not been.'),
    well: S('A wayside well with a stone lid, and a hush-lamp on a post beside it.'),
    lampDry: S('The hush-lamp is dry. The reed in its throat is furred with dust.'),
    lampNeed: S('It wants oil, and you have none.'),
    lampFill: S('You fill the lamp and trim the wick. It will light itself at dusk: they are made to. The reed gives one thin note, to try its voice.'),
    lampDay: S('The hush-lamp, filled and trimmed, waiting for dusk.'),
    lampLit: S('The hush-lamp is burning, and its reed is keeping the road from going quiet.'),
    stand: S('The Bell Oak, and the Ringing Stand round it: iron-barks grown close about a tree that was old when the road was a sheep-track. The carters call them the peal.'),
    standWet: S('The Ringing Stand is tolling in the wind, every tree a different note. Anything with ears for a mile knows where this is.'),
    standWarn: S('The oaks are tolling all round you. You are standing in the loudest place on the road.'),
    tor: S('Crow Tor. The crows have the view. Nobody else has found the way up.'),
    water: S('Long Water. Flat, grey and full of sky. A beck comes in at the far end.'),
    cutter: S('A turf-cutter'),
    cutterGreet: S('"You\'re from inside the Hedge. I can tell by the way you look at the sky."'),
    cutterWork: S('"Turf. It burns slow and it doesn\'t ring, which is more than you can say for oak. The lamp at the well has gone dry and I\'ve no oil. There was a can in the old winding-house at the Delph. I\'m not going in after it. There are hounds lying up in the bottom."'),
    cutterPlace: S('"Keep off the Ringing Stand when it blows. The oaks toll and the hounds come to it like a dinner bell. And don\'t stop at the well after dark while that lamp is out. A quiet road is the wrong kind of quiet."'),
    cutterBark: S('A turf-cutter, to nobody: "Slow and quiet. Slow and quiet."'),
    // ---- the travellers
    packman: S('A packman'),
    packGreet: S('"Needles, thread, salt, whistles. No? Then good day to you, and mind the ford."'),
    packWork: S('"I walk out as far as the toll-house and back. I used to go through to Greenroot. Nobody buys past the Narrows now."'),
    packPlace: S('"Greenroot? I knocked at four doors. I could smell bread. I did not knock at a fifth."'),
    packBark: S('A packman, shifting his pack: "Salt gets heavier. Nobody tells you that."'),
    bandA: S('A woman with a bundle'),
    bandAGreet: S('"Don\'t go on to Greenroot. We did."'),
    bandAPlace: S('"The tables were laid. I keep saying it. The tables were laid, and the kettles were cold."'),
    bandABark: S('A woman, low: "Don\'t look back at it."'),
    bandB: S('A man carrying a child\'s coat'),
    bandBGreet: S('"We\'re going back inside the Hedge. I never thought I would be glad to say it."'),
    bandBPlace: S('"My brother\'s house. The door was shut and not locked. His boots were on the step. I didn\'t go in."'),
    bandC: S('An old man with a stick'),
    bandCGreet: S('"I walked to Greenroot at sixteen to be married. I have walked back from it today."'),
    bandCPlace: S('"There was a lamp burning at the end of the street. That was the worst of it. Somebody trimmed that lamp."'),
    // ---- Greenroot Wood
    cleave: S('The Cleave. The road goes through because there is nowhere else for it to go. Sound does not come out of here the way it went in.'),
    bridgeE: S('A timber bridge, tarred, with a hand-rail on the downstream side only.'),
    fen: S('The fen. Reed as far as the trees, and under it water that does not show until you are standing in it.'),
    eel: S('An eel-stage: a plank walk out into the reeds, and a tarred box at the end of it.'),
    reedrow: S('An old reed-row: wind-reeds on a pole, for the dead to be sung past. Every reed went to dust in its binding the day the sky rang. The bindings still hang.'),
    post: S('A finger-post with one arm left. The arm says HOWE. Somebody has tried to burn the word off it.'),
    lych: S('The lych-house, where Greenroot rested its dead on the way down. The roof went in long ago. The bier-stone is still here, and it is not empty of everything.'),
    howeDoor: S('The mouth of the Howe'),
    gateLamp: S('A hush-lamp at the roadside, burning low. You can hear its reed from here. You cannot hear anything else.'),
    lantern: S('A dark-lantern on a box, shuttered.'),
    lanternNight: S('The diggers\' lantern, open a finger\'s width. Hush-moths are walking on the glass.'),
    moth: S('Hush-moths. They eat the light first.'),
    book: S('A field-book, open on a crate under a stone. Half a page is ruled and empty, and headed: OVER THE INNER DOOR.'),
    bookGive: S('You write the words into the field-book as you read them below. The antiquary reads them twice, closes the book, and puts money in your hand without counting it.'),
    bookDone: S('The field-book. Your writing is in it, and under your writing, in hers: LEAVE IT SHUT.'),
    antiq: S('An antiquary'),
    antiqGreet: S('"If you are from the Greenhall, I have a letter. If you are not, I have a kettle."'),
    antiqWork: S('"The Howe. Greenroot\'s old Cantors are under that hill, sung down one after another for three hundred years. There are words cut over the inner door and I cannot get to them. Three graves below have lost their second stone, and the door will open to nobody until they have it back. I am sixty-one. You go. Write what it says in my book."'),
    antiqPlace: S('"We have been here nine days. In nine days nothing has come up the road from Greenroot. Not a cart. Not a dog."'),
    antiqBark: S('An antiquary, writing: "Ninth day. No traffic from the east."'),
    digger: S('A digger'),
    diggerGreet: S('"She pays by the day. I would not go down there for a week of them."'),
    diggerWork: S('"I dig where she points. I stopped at the lych-house door. Something in there breathes in when you breathe out."'),
    diggerPlace: S('"We put the lantern out at night now. Moths. You learn."'),
    diggerBark: S('A digger: "I heard it again. Under."'),
  };

  // ---------------------------------------------------------------- art: an oil-can and a field-book
  const px = (r, g, b) => (0xff000000 | (b << 16) | (g << 8) | r) >>> 0;
  function stamp(rows, pal) { const w = rows[0].length, h = rows.length, data = new Uint32Array(w * h); rows.forEach((r, y) => { for (let x = 0; x < w; x++) { const c = pal[r[x]]; if (c) data[y * w + x] = px(c[0], c[1], c[2]); } }); return { w, h, hs: 1, cx: 0.5, dy: 0, data }; }
  function installArt() {
    if (typeof Engine === 'undefined' || !Engine.addSprite || Engine.sprites.p79_can) return;
    const P = { o: [30, 30, 34], a: [92, 104, 96], b: [128, 142, 130], c: [164, 176, 160], r: [120, 70, 44], k: [60, 44, 34], p: [214, 204, 176], q: [180, 168, 140], i: [70, 64, 60], w: [124, 96, 62], v: [96, 72, 46] };
    Engine.addSprite('p79_can', stamp(['....oo......', '...okko..oo.', '...okko.obo.', '..oooooobo..', '.obbccboo...', '.obbccbo....', '.oabbcbo....', '.oabbbbo....', '.oaabbbo....', '.orrrrro....', '.oaabbbo....', '..ooooo.....'], P));
    // glass come up through rock (it gives its own light), and a pole of the old reed-row
    const cv = (w, h, fn) => { const data = new Uint32Array(w * h), emit = new Uint8Array(w * h); fn((x, y, c, e) => { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) { data[y * w + x] = px(c[0], c[1], c[2]); emit[y * w + x] = e ? 1 : 0; } }); return { w, h, hs: 1, cx: 0.5, dy: 0, data, glow: emit }; };
    const GL = [[26, 58, 44], [48, 118, 78], [96, 178, 104], [168, 222, 128], [236, 240, 170]];
    const shard = (set, bx, by, w, h, lean) => { for (let y = 0; y <= h; y++) { const t = y / h, half = w * Math.pow(1 - t, 0.85), cx = bx + lean * y; for (let x = Math.floor(cx - half); x <= cx + half; x++) { const u = (x - cx) / Math.max(0.5, half), edge = Math.abs(u) > 0.78 || y === 0; const k = edge ? 0 : u < -0.15 ? 1 : u < 0.3 ? (h2(x, y + 900) < 0.18 ? 4 : 3) : 2; set(x, by - y, GL[k], !edge); } } };
    const glass = (v) => cv(30, 30, (set) => { if (v) { shard(set, 9, 29, 4.5, 20, 0.12); shard(set, 19, 29, 5.5, 27, -0.1); shard(set, 26, 29, 3, 12, 0.2); shard(set, 3, 29, 2.5, 9, -0.25); } else { shard(set, 15, 29, 6, 28, 0.05); shard(set, 6, 29, 3.5, 15, -0.2); shard(set, 24, 29, 4, 18, 0.22); } });
    for (const v of [0, 1]) { const g = glass(v); Engine.addSprite('p79_glass' + v, g); if (Engine.setEmissive) Engine.setEmissive('p79_glass' + v, g.glow); }
    const WD = [[52, 40, 30], [84, 66, 46], [116, 94, 66]], BN = [[150, 140, 116], [196, 186, 158]];
    Engine.addSprite('p79_reedrow', cv(18, 64, (set) => {
      for (let y = 2; y < 64; y++) { set(8, y, WD[0]); set(9, y, WD[1]); set(10, y, y % 9 === 0 ? WD[0] : WD[2]); }
      for (const [ay, half] of [[8, 8], [20, 6]]) { for (let x = 9 - half; x <= 9 + half; x++) { set(x, ay, WD[1]); set(x, ay + 1, WD[0]); }
        for (let i = 0; i < 5; i++) { const x = 9 - half + 1 + Math.round(i * (half * 2 - 2) / 4), n = 5 + Math.floor(h2(i, ay + 950) * 9); if (x === 9) continue; for (let y = 2; y < n; y++) set(x + (y > 3 && h2(x, y + 960) < 0.2 ? 1 : 0), ay + y, BN[y % 3 ? 1 : 0]); } }
      set(9, 1, WD[2]); set(9, 0, WD[1]);
    }));
    Engine.addSprite('p79_book', stamp(['......oooooooooo......', '....oopppppoppppoo....', '..ooppqppppoppqqppoo..', '.oppppppiipopiippppo..', '.opqiiippppopppiiqpo..', '.oppppiippqopiipppppo.', 'ooppiippppooooppiippoo', 'owwwwwwwwwwwwwwwwwwwwo', 'owvwwwvwwwwvwwwwvwwwvo', 'owwwvwwwwvwwwwvwwwwwwo', 'owwwwwwvwwwwwwwwwvwwwo', 'owvwwwwwwwvwwwvwwwwwvo', 'oooooooooooooooooooooo'], P));
  }

  // ---------------------------------------------------------------- one stretch of road, from a description of its land
  function buildStage(sp, toWest, toEast) {
    const W = sp.W, H = sp.H;
    const m = new GameMap(sp.id, sp.name, W, H, {
      outdoor: true, floor: 't_grass', floorTextures: ['t_grass', ROAD, 't_water', 't_shallows', 'p17c_plank', 't_moss', CRAG, 't_flag'], fogDist: sp.fog || 30, fogColor: sp.fogColor || [70, 76, 66],
      music: 'wild', danger: 1, spawn: { x: 1.6, y: sp.gw + 0.5, dir: 0 },
    });
    m.border('t_hedge');
    m.set(0, sp.gw, DOOR({ tex: 't_hedge', portal: toWest, label: R.TX.toOak }));
    m.set(W - 1, sp.ge, DOOR({ tex: 't_hedge', portal: toEast, label: R.TX.toGreen }));
    const inside = (x, y) => x >= 1 && y >= 1 && x <= W - 2 && y <= H - 2, fl = (x, y) => m.floorCells[y * W + x];
    const line = []; along(sp.road, 0.5, (x, y) => line.push(x, y));
    const roadNear = (x, y) => { let best = 1e9; for (let i = 0; i < line.length; i += 2) { const d = Math.hypot(line[i] - x, line[i + 1] - y); if (d < best) best = d; } return best; };
    // water: streams (two cells wide), lakes, islands in them, marsh (ankle-deep, walkable), becks (one cell, walkable)
    const wet = new Uint8Array(W * H), soft = new Uint8Array(W * H), band = new Uint8Array(W * H);
    for (const st of sp.streams || []) along(st, 0.4, (px_, py) => { for (const dx of [0, 1]) { const x = Math.floor(px_) + dx, y = Math.floor(py); if (inside(x, y)) wet[y * W + x] = 1; } });
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) {
      if ((sp.lakes || []).some((e) => inEll(e, x + 0.5, y + 0.5))) wet[y * W + x] = 1;
      if ((sp.islands || []).some((e) => Math.hypot(x + 0.5 - e.x, y + 0.5 - e.y) < e.r)) wet[y * W + x] = 0;
      if (!wet[y * W + x] && (sp.marsh || []).some((e) => inEll(e, x + 0.5, y + 0.5) && h2(x * 7 + 1, y * 3 + 5) < 0.86)) soft[y * W + x] = 1;
    }
    for (const b of sp.becks || []) along(b, 0.4, (px_, py) => { const x = Math.floor(px_), y = Math.floor(py); if (inside(x, y) && !wet[y * W + x]) soft[y * W + x] = 1; });
    // land: the hills the road goes over, the crags, the rises (water lies level and a crag stands clear), the wooded rim
    const crags = sp.crags || [];
    for (const c of sp.hills || []) m.hill(c.x, c.y, c.rx, c.ry, c.h);
    for (const c of crags) m.hill(c.x, c.y, c.rx, c.ry, c.h, { steep: c.steep });
    const dry = (cx, cy, rx, ry) => { for (let y = Math.max(1, Math.floor(cy - ry - 1)); y <= Math.min(H - 2, cy + ry + 1); y++) for (let x = Math.max(1, Math.floor(cx - rx - 1)); x <= Math.min(W - 2, cx + rx + 1); x++) if ((wet[y * W + x] || (soft[y * W + x] && (sp.marsh || []).some((e) => inEll(e, x + 0.5, y + 0.5))) || crags.some((q) => inEll(q, x + 0.5, y + 0.5, 1.12))) && ((x + 0.5 - cx) / (rx + 1.5)) ** 2 + ((y + 0.5 - cy) / (ry + 1.5)) ** 2 < 1) return false; return true; };
    const rise = (x, y, rx, ry, h) => { while (rx > 4 && ry > 3.5 && !dry(x, y, rx, ry)) { rx -= 1; ry -= 1; h *= 0.9; } if (dry(x, y, rx, ry)) { m.hill(x, y, rx, ry, Math.min(h, 0.4 * Math.min(rx, ry))); return true; } return false; };
    for (const [x, y, rx, ry, h] of sp.rises || []) rise(x, y, rx, ry, h);
    const rk = sp.k || 1, ri = Math.round(5 * rk);   // a wider valley has a broader rim
    const RIM = [], rim = (x, y, i, ns) => { if (Math.hypot(x, y - sp.gw) < 15 * rk || Math.hypot(x - W, y - sp.ge) < 15 * rk) return; if (rise(x, y, ((ns ? 9 : 7) + h2(i, 41 + sp.seed) * 5) * rk, ((ns ? 6 : 9) + h2(i, 43 + sp.seed) * 4) * rk, 3.0 + h2(i, 47 + sp.seed) * 2.2)) RIM.push([x, y]); };
    for (let x = 4, i = 0; x < W; x += 10 * rk, i++) { rim(x + h2(i, 51 + sp.seed) * 4, ri, i, 1); rim(x + h2(i, 53 + sp.seed) * 4, H - ri, i + 40, 1); }
    for (let y = 8, i = 80; y < H - 4; y += 10 * rk, i++) { rim(ri, y + h2(i, 55 + sp.seed) * 4, i, 0); rim(W - ri, y + h2(i, 57 + sp.seed) * 4, i + 40, 0); }
    const lowEdge = (x, y) => { if (Math.hypot(x, y - sp.gw) > 17 && Math.hypot(x - (W - 1), y - sp.ge) > 17) m.block(x, y, 't_hedge', Math.min(0.9, m.groundAt(x + 0.5, y + 0.5) + 0.1), { capTex: 't_hedge' }); };
    for (let x = 0; x < W; x++) { lowEdge(x, 0); lowEdge(x, H - 1); }
    for (let y = 1; y < H - 1; y++) { lowEdge(0, y); lowEdge(W - 1, y); }
    // floors
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) {
      if (wet[y * W + x]) { m.setFloor(x, y, WATER); continue; }
      if (soft[y * W + x]) { m.setFloor(x, y, SHALLOW); continue; }
      let bank = false; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [-1, -1], [1, -1], [-1, 1]]) if (inside(x + dx, y + dy) && wet[(y + dy) * W + x + dx]) bank = true;
      if (bank) m.setFloor(x, y, MOSS);
    }
    for (const e of sp.islands || []) if (e.stones) for (let y = e.stones[1]; y <= e.stones[2]; y++) { const x = e.stones[0]; if (wet[y * W + x]) { wet[y * W + x] = 0; m.setFloor(x, y, SHALLOW); } }
    for (let y = 1; y <= H - 2; y++) for (let x = 1; x <= W - 2; x++) if (m.gradeAt(x + 0.5, y + 0.5) > 0.8) { m.setFloor(x, y, ROCK); wet[y * W + x] = soft[y * W + x] = 0; }
    // the road: where it meets a stream it goes over (slabs or planks); where it meets a beck it gets its feet wet
    along(sp.road, 0.4, (px_, py) => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const x = Math.floor(px_ - 0.5) + dx, y = Math.floor(py - 0.5) + dy; if (!inside(x, y)) continue;
      band[y * W + x] = 1; if (soft[y * W + x]) continue; if (wet[y * W + x]) { wet[y * W + x] = 0; m.setFloor(x, y, sp.deck || PLANK); } else m.setFloor(x, y, TRACK); } });
    // side paths, a pace wide: a track on dry ground, a board-walk over wet
    for (const p of sp.paths || []) along(p, 0.4, (px_, py) => { const x = Math.floor(px_), y = Math.floor(py); if (!inside(x, y) || m.get(x, y)) return;
      if (wet[y * W + x] || soft[y * W + x]) { wet[y * W + x] = soft[y * W + x] = 0; m.setFloor(x, y, PLANK); } else if (fl(x, y) === 0 || fl(x, y) === MOSS) m.setFloor(x, y, TRACK); });
    // what stands on it
    const g = (x, y) => m.groundAt(x, y), keep = sp.keep || [];
    const low = (x, y, h, tex) => m.block(x, y, tex || 't_stone', g(x + 0.5, y + 0.5) + h, { capTex: tex || 't_stone' });
    const open = (x, y) => inside(x, y) && !m.get(x, y) && fl(x, y) === 0;
    const lawn = (x, y) => open(x | 0, y | 0) && m.gradeAt(x, y) < 0.7;
    const room = (x, y, r) => !keep.some(([x0, y0, x1, y1]) => x > x0 && x < x1 && y > y0 && y < y1) && !m.entities.some((e) => Math.hypot(e.x - x, e.y - y) < r);
    const trap = (type, x, y, id) => m.deco(TRAP_TYPES[type].sprite, x, y, { solid: false, scale: type === 'alarm' ? 0.35 : 0.45, use: 'trap', trapType: type, trapId: id, label: TRAP_TYPES[type].name + ' — inspect to disarm', glow: 0.35 });
    sp.dress(m, { low, g, fl, wet, open, lawn, room, roadNear, trap, inside, paths: sp.paths || [] });
    for (const c of crags) for (let y = Math.floor(c.y - c.ry * 1.3); y <= c.y + c.ry * 1.3; y++) for (let x = Math.floor(c.x - c.rx * 1.3); x <= c.x + c.rx * 1.3; x++) {   // scree
      if (!open(x, y) || !inEll(c, x + 0.5, y + 0.5, 1.22) || crags.some((q) => inEll(q, x + 0.5, y + 0.5, 1.03)) || h2(x * 3 + 1 + sp.seed, y * 5 + 2) > 0.2) continue;
      const ox = x + 0.3 + h2(x, y + 11) * 0.4, oy = y + 0.3 + h2(x + 5, y) * 0.4;
      if (roadNear(ox, oy) < 2.6 || !room(ox, oy, 1.5)) continue;
      m.deco(h2(x, y + 77) < 0.5 ? 'p79_rock0' : 'p79_rock1', ox, oy, { radius: 0.4, scale: 0.6 + h2(x + 9, y + 3) * 0.9 });
    }
    let k = 0, due = 2;                                                               // the oaks on either side of the road
    for (let i = 0; i + 1 < sp.road.length; i++) { const [ax, ay] = sp.road[i], [bx, by] = sp.road[i + 1], L = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / L, ny = (bx - ax) / L;
      for (; due <= L; due += sp.avenue || 3.7) for (const side of [-1, 1]) { k++; const off = 2.7 + h2(k, 7 + sp.seed) * 1.2, t = due + (h2(k, 9 + sp.seed) - 0.5) * 1.6, ox = ax + (bx - ax) * t / L + nx * off * side, oy = ay + (by - ay) * t / L + ny * off * side;
        if (lawn(ox, oy) && roadNear(ox, oy) > 2.1 && room(ox, oy, 1.7)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.5 + h2(k, 11) * 0.7 }); }
      due -= L; }
    (sp.copses || []).forEach(([cx, cy], ci) => { for (let i = 0; i < 13; i++) {
      const an = h2(ci * 17 + i + sp.seed, 61) * PI * 2, rr = Math.sqrt(h2(ci * 29 + i, 67 + sp.seed)) * 6.5, ox = cx + Math.cos(an) * rr, oy = cy + Math.sin(an) * rr * 0.8;
      if (!lawn(ox, oy) || roadNear(ox, oy) < 2.6) continue;
      if (i < 9) { if (room(ox, oy, 1.9)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.5 + h2(ci, i + 3) * 0.8 }); }
      else if (room(ox, oy, 0.9) && Engine.sprites && Engine.sprites.p22_fern) m.deco('p22_fern', ox, oy, { radius: 0.2, scale: 0.5 + h2(ci, i) * 0.2, solid: false });
    } });
    if (sp.fill) for (let gy = 16, ci = 0; gy < H - 12; gy += 22) for (let gx = 16; gx < W - 12; gx += 26, ci++) {       // and small stands across the wider country, with open ground between
      if (h2(ci, 131 + sp.seed) > 0.55) continue; const cx = gx + (h2(ci, 133 + sp.seed) - 0.5) * 14, cy = gy + (h2(ci, 137 + sp.seed) - 0.5) * 12;
      if (roadNear(cx, cy) < 9) continue;
      for (let i = 0; i < 6; i++) { const an = h2(ci * 7 + i, 139 + sp.seed) * PI * 2, rr = 1 + Math.sqrt(h2(ci * 11 + i, 141)) * 4.5, ox = cx + Math.cos(an) * rr, oy = cy + Math.sin(an) * rr * 0.8; if (lawn(ox, oy) && room(ox, oy, 2.0)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.5 + h2(ci, i + 17) * 0.9 }); } }
    (sp.lakes || []).forEach((e, li) => { const n = Math.max(4, Math.round((e.rx + e.ry) / 2.6)); for (let i = 0; i < n; i++) {   // willows by the water
      const an = (i + h2(i + li * 9, 83) * 0.7) * (PI * 2 / n), ox = e.x + Math.cos(an) * (e.rx + 1.9), oy = e.y + Math.sin(an) * (e.ry + 1.9);
      if (inside(ox | 0, oy | 0) && !m.get(ox | 0, oy | 0) && (fl(ox | 0, oy | 0) === 0 || fl(ox | 0, oy | 0) === MOSS) && roadNear(ox, oy) > 2.4 && room(ox, oy, 2.2)) m.deco('willow', ox, oy, { radius: 0.4, scale: 1.6 + h2(i, 5) * 0.5 });
    } });
    for (let i = 0; i < crags.length * 5; i++) {                                       // thorns on the tops
      const c = crags[i % crags.length], ox = c.x + (h2(i, 91 + sp.seed) - 0.5) * c.rx * 1.1, oy = c.y + (h2(i, 97 + sp.seed) - 0.5) * c.ry * 1.1;
      if (inside(ox | 0, oy | 0) && inEll(c, ox, oy, 0.62) && !m.get(ox | 0, oy | 0) && fl(ox | 0, oy | 0) === 0 && room(ox, oy, 2)) m.deco(Engine.sprites && Engine.sprites.p20_thorn ? 'p20_thorn' : 'oak', ox, oy, { radius: 0.3, scale: 0.9 + h2(i, 3) * 0.4 });
    }
    RIM.forEach(([cx, cy], ci) => { for (let i = 0; i < 9; i++) {
      const ox = cx + (h2(ci * 13 + i, 71 + sp.seed) - 0.5) * 16 * rk, oy = cy + (h2(ci * 19 + i, 73 + sp.seed) - 0.5) * 12 * rk;
      if (lawn(ox, oy) && roadNear(ox, oy) > 5 && room(ox, oy, 2.3)) m.deco('oak', ox, oy, { radius: 0.45, scale: 1.6 + h2(ci, i + 31) * 0.9 });
    } });
    m.baseCount = m.entities.length;
    m._p79band = band;
    return m;
  }

  const WELL0 = [64.2, 46.6], EYOT0 = [57.5, 84.5], KNOLL0 = [124, 46], CAMP0 = [116.5, 56.5], RUIN0 = { x0: 120, y0: 43, x1: 128, y1: 49 };   // working-size places

  // ---------------------------------------------------------------- room to breathe
  // Owner, 12 Nov: "Be sure not to put everything to close to each other so its claustrophobic. remember going to be a
  // very large map". Each stretch below is drawn at a working size and then grown by K: the land (the road, the water,
  // the hills and crags, the woods) grows with it; what people built (a ruin, a well, a camp, a bridge sign) stays the
  // size it is, moved to where the land now puts it. So there is K times the country between any two things.
  const K = 1.4;
  function grow(d, k) {
    const sc = (pts) => pts.map(([x, y]) => [x * k, y * k]);
    const W = Math.round(d.W * k), H = Math.round(d.H * k), gw = Math.round(d.gw * k), ge = Math.round(d.ge * k), n = d.road.length;
    const road = sc(d.road); road[0] = [1, gw + 0.5]; road[1][1] = gw + 0.5; road[n - 1] = [W - 2, ge + 0.5]; road[n - 2][1] = ge + 0.5;
    const ell = (e, hk) => Object.assign({}, e, { x: e.x * k, y: e.y * k, rx: e.rx * k, ry: e.ry * k }, e.h ? { h: e.h * hk } : {});
    const P = (x, y) => [x * k, y * k];                                                   // a place on the land
    const C = (ax, ay) => { const dx = Math.round(ax * (k - 1)), dy = Math.round(ay * (k - 1)); return (x, y) => [x + dx, y + dy]; };   // a built thing, moved whole
    return Object.assign({}, d, { W, H, gw, ge, road, k, P, C, fill: true,
      streams: (d.streams || []).map(sc), becks: (d.becks || []).map(sc), paths: (d.paths || []).map(sc), copses: sc(d.copses || []),
      lakes: (d.lakes || []).map((e) => ell(e, 1)), marsh: (d.marsh || []).map((e) => ell(e, 1)), islands: (d.islands || []).map((e) => Object.assign({}, e, { x: e.x * k, y: e.y * k })),
      hills: (d.hills || []).map((e) => ell(e, 1.15)), crags: (d.crags || []).map((e) => ell(e, 1.15)),
      rises: (d.rises || []).map(([x, y, rx, ry, h]) => [x * k, y * k, rx * k, ry * k, h * 1.2]), keep: (d.keep || []).map(([x0, y0, x1, y1]) => [x0 * k, y0 * k, x1 * k, y1 * k]),
      dress: (m, h) => d.dress(m, h, P, C) });
  }

  // ---------------------------------------------------------------- the Long Common
  const SPW = grow({
    id: WEST, name: TX.nameW, W: 168, H: 96, gw: 30, ge: 70, seed: 100, deck: FLAG, fog: 36,
    road: [[1, 30.5], [10, 30.5], [18, 33], [24, 39], [27, 47], [33, 53], [42, 55], [52, 52], [60, 46], [66, 39], [74, 35], [84, 36], [92, 41], [97, 49], [100, 58], [106, 65], [115, 68], [125, 66], [133, 60], [140, 57], [148, 60], [154, 66], [160, 70.5], [166, 70.5]],
    streams: [[[90, 1], [88, 14], [86, 26], [88, 38], [93, 50], [92, 62], [88, 74], [90, 86], [92, 94]]],
    becks: [[[62, 22], [68, 30], [72, 34.5], [78, 40], [86, 44], [91, 47]], [[150, 73], [142, 78], [135, 82]]],
    lakes: [{ x: 120, y: 84, rx: 16, ry: 7 }, { x: 41, y: 36.5, rx: 2.0, ry: 2.0 }],
    hills: [{ x: 56, y: 49, rx: 12, ry: 9, h: 2.6 }],
    crags: [{ x: 33, y: 37, rx: 4.5, ry: 8, h: 4.2, steep: 0.2 }, { x: 41, y: 29, rx: 9, ry: 4.5, h: 4.2, steep: 0.2 }, { x: 49, y: 37, rx: 4.5, ry: 8, h: 4.2, steep: 0.2 }, { x: 128, y: 50, rx: 7, ry: 6, h: 4.8, steep: 0.16 }],
    rises: [[14, 50, 8, 7, 1.8], [20, 14, 10, 7, 2.0], [70, 62, 9, 7, 1.6], [104, 30, 9, 7, 2.0], [144, 40, 9, 8, 2.2], [150, 86, 8, 5, 1.4], [76, 84, 9, 6, 1.5], [30, 74, 10, 7, 1.8], [118, 22, 8, 6, 1.6], [58, 14, 7, 5, 1.2], [16, 84, 8, 6, 1.4], [72, 48, 5, 4, 1.0], [12, 66, 7, 6, 1.5], [52, 66, 8, 6, 1.6], [116, 40, 6, 5, 1.3], [148, 24, 9, 6, 1.8], [100, 14, 7, 5, 1.4], [44, 12, 8, 5, 1.5], [60, 30, 5, 5, 1.1]],
    copses: [[14, 40], [30, 64], [68, 14], [100, 18], [74, 72], [138, 30], [156, 48], [104, 80], [50, 80], [150, 90], [24, 22]],
    paths: [[[38, 53], [40, 49], [41, 45], [41, 40]]],
    keep: [[42, 44, 52, 52], [60, 43, 70, 50], [36, 32, 46, 46], [100, 43, 120, 61]],
    dress(m, h, P, C) {
      m.deco('p20_stone', ...P(9.5, 29.4), { radius: 0.22, scale: 0.6, label: R.TX.stone1 });
      // the Delph: a stone pit with a pool in the bottom, the winding-house at its mouth, and what has moved in
      m.deco('sign', ...P(43.4, 45.6), { radius: 0.2, scale: 0.75, label: TX.delph });
      const D = C(45.5, 47.5);
      for (let x = 44; x <= 47; x++) { h.low(...D(x, 46), 0.3 + 0.5 * h2(x, 301)); if (x !== 45) h.low(...D(x, 49), 0.3 + 0.3 * h2(x, 303)); }
      h.low(...D(47, 47), 0.9); h.low(...D(47, 48), 0.5); h.low(...D(44, 46), 1.3);
      m.deco('sign', ...D(46.5, 50.4), { radius: 0.2, scale: 0.65, label: TX.wind });
      m.deco('p79_can', ...D(45.6, 47.6), { radius: 0.2, scale: 0.34, solid: false, label: TX.can, use: 'p79_can', _p79b: 'can' });
      m.deco('bones', ...P(39.3, 41.6), { radius: 0.3, scale: 0.6 }); m.deco('bones', ...P(43.2, 39.8), { radius: 0.3, scale: 0.6 });
      m.enemy('hound', ...P(39.4, 39.6)); m.enemy('hound', ...P(43.2, 41.6));
      [[38.3, 37.4, 1.5], [38.5, 40.6, 1.0], [43.9, 37.0, 1.7], [44.1, 34.9, 1.1], [40.3, 34.0, 1.3], [42.4, 33.9, 2.0], [38.4, 43.6, 0.8], [44.0, 42.6, 1.2], [41.0, 36.5, 1.1]].forEach(([x, y, sc], i) =>
        m.deco('p79_glass' + (i % 2), ...P(x, y), { radius: 0.25, scale: sc, solid: false, glow: 0.5, lightCol: [18, 56, 34], label: i === 8 ? undefined : TX.glass, _p79b: i === 8 ? 'glass0' : 'glass' }));   // the last stands in the pool, out of reach
      m.add({ kind: 'item', item: 'cache', tier: 2, x: P(38.7, 35.0)[0], y: P(38.7, 35.0)[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
      // the clapper bridge, the well and its lamp, the Ringing Stand, Crow Tor, Long Water
      m.deco('sign', ...P(84.5, 38.7), { radius: 0.2, scale: 0.75, label: TX.clapper });
      const Wl = C(WELL0[0], WELL0[1]);
      m.deco(Engine.sprites && Engine.sprites.p9p_well ? 'p9p_well' : 'sign', ...Wl(64.2, 46.6), { radius: 0.5, scale: 0.9, label: TX.well });
      m.deco('lamp', ...Wl(65.6, 45.5), { radius: 0.12, scale: 0.7, glow: 0, label: TX.lampDry, use: 'p79_lamp', _p79b: 'lamp' });
      const [sx, sy] = P(110, 52);
      m.deco('oak', sx, sy, { radius: 0.9, scale: 6.2, label: TX.stand, _p79b: 'ring' });   // the Bell Oak: a landmark from half the Common away
      for (let i = 0; i < 14; i++) { const an = i * PI / 7 + h2(i, 311) * 0.4, rr = 3.6 + h2(i, 313) * 4.4; m.deco('oak', sx + Math.cos(an) * rr, sy + Math.sin(an) * rr * 0.85, { radius: 0.5, scale: 2.0 + h2(i, 317) * 0.6 }); }
      m.deco('sign', ...P(122.6, 57.6), { radius: 0.2, scale: 0.75, label: TX.tor });
      m.add({ kind: 'item', item: 'cache', tier: 1, x: P(128.5, 42.4)[0], y: P(128.5, 42.4)[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
      m.deco('sign', ...P(117.5, 75.2), { radius: 0.2, scale: 0.75, label: TX.water });
    },
  }, K);
  const STAND = { x: SPW.P(110, 52)[0], y: SPW.P(110, 52)[1], r: 10 };

  // ---------------------------------------------------------------- Greenroot Wood
  const SPE = grow({
    id: EAST, name: TX.nameE, W: 168, H: 96, gw: 20, ge: 60, seed: 200, deck: PLANK, fog: 28, fogColor: [58, 66, 60], avenue: 3.2,
    road: [[1, 20.5], [9, 20.5], [17, 24], [23, 31], [26, 40], [24, 49], [27, 58], [35, 64], [45, 65], [54, 60], [60, 52], [63, 43], [69, 36], [78, 33], [88, 35], [96, 41], [101, 49], [103, 58], [109, 66], [118, 70], [128, 69], [136, 64], [144, 61], [153, 61], [160, 60.5], [166, 60.5]],
    streams: [[[112, 1], [108, 12], [104, 24], [99, 36], [98, 46], [94, 56], [88, 66], [80, 74], [64, 80]]],
    becks: [[[21.5, 34], [21.5, 46], [22, 58], [26, 68], [34, 75]]],
    lakes: [{ x: 48, y: 80, rx: 14, ry: 7 }],
    islands: [{ x: EYOT0[0], y: EYOT0[1], r: 2.4 }],
    marsh: [{ x: 50, y: 79, rx: 22, ry: 11 }],
    hills: [{ x: 72, y: 34, rx: 11, ry: 8, h: 2.4 }, { x: KNOLL0[0], y: KNOLL0[1], rx: 11, ry: 8, h: 2.6 }],
    crags: [{ x: 13, y: 48, rx: 7, ry: 13, h: 5.2, steep: 0.14 }, { x: 37, y: 47, rx: 7, ry: 12, h: 5.2, steep: 0.14 }],
    rises: [[60, 20, 10, 7, 2.2], [90, 18, 9, 7, 2.0], [140, 30, 9, 7, 2.0], [150, 80, 10, 7, 2.0], [100, 80, 8, 6, 1.8], [80, 52, 7, 6, 1.5], [50, 44, 7, 6, 1.6], [150, 46, 7, 6, 1.6], [130, 84, 9, 6, 1.6], [44, 24, 8, 6, 1.5], [112, 30, 6, 5, 1.2], [8, 76, 6, 6, 1.3], [84, 60, 6, 5, 1.3], [146, 12, 9, 5, 1.6], [70, 14, 7, 5, 1.4], [116, 58, 5, 4, 0.9], [160, 44, 6, 6, 1.4], [30, 84, 6, 5, 1.2], [128, 76, 6, 4, 1.1]],
    copses: [[8, 30], [40, 12], [52, 30], [66, 48], [84, 44], [92, 26], [118, 20], [136, 18], [152, 30], [146, 72], [112, 84], [86, 86], [72, 62], [46, 54], [160, 74], [134, 54], [106, 74], [60, 8], [24, 12], [154, 50], [76, 20], [140, 44]],
    paths: [[[46, 66], [48, 70], [52, 76], [56, 81], [57, 83.4]], [[112, 66], [114, 59], [118, 53.5], [122, 51], [124.4, 50.6], [124.4, 49.6]]],
    keep: [[117, 39, 131, 52], [113, 54, 120, 59]],
    dress(m, h, P, C) {
      m.deco('p20_stone', ...P(161.5, 59.4), { radius: 0.22, scale: 0.6, label: R.TX.stone3 });
      m.deco('lamp', ...P(156.6, 59.0), { radius: 0.12, scale: 0.7, glow: 0.3, label: TX.gateLamp });
      m.deco('sign', ...P(20.6, 33.4), { radius: 0.2, scale: 0.75, label: TX.cleave });
      m.deco('sign', ...P(94.4, 43.4), { radius: 0.2, scale: 0.75, label: TX.bridgeE });
      m.deco('sign', ...P(43.4, 67.4), { radius: 0.2, scale: 0.75, label: TX.fen });
      const I = (x, y) => [P(EYOT0[0], EYOT0[1])[0] + x, P(EYOT0[0], EYOT0[1])[1] + y];
      m.deco('sign', ...I(-1.3, -0.9), { radius: 0.2, scale: 0.65, label: TX.eel });
      m.add({ kind: 'item', item: 'cache', tier: 1, x: I(0.8, 0.7)[0], y: I(0.8, 0.7)[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
      m.deco('sign', ...P(110.4, 64.4), { radius: 0.2, scale: 0.8, label: TX.post });
      // the lych-house on its knoll: ragged walls, a door gap to the south, and in the north wall the mouth of the Howe
      const L = C(KNOLL0[0], KNOLL0[1]), { x0, y0, x1, y1 } = RUIN0, mx = 124;
      for (let x = x0; x <= x1; x++) { if (Math.abs(x - mx) > 1) h.low(...L(x, y0), 0.5 + 1.0 * h2(x, 401)); if (x !== mx) h.low(...L(x, y1), 0.35 + 0.8 * h2(x, 403)); }
      for (let y = y0 + 1; y < y1; y++) { h.low(...L(x0, y), 0.4 + 1.1 * h2(407, y)); h.low(...L(x1, y), 0.4 + 0.9 * h2(409, y)); }
      h.low(...L(x0, y0), 2.0); h.low(...L(x1, y1), 1.7); h.low(...L(mx - 1, y0), 2.3); h.low(...L(mx + 1, y0), 2.3);
      m.set(...L(mx, y0), DOOR({ tex: 't_stone', portal: { map: HOWE, x: 22.5, y: 33.4, dir: -PI / 2 }, label: TX.howeDoor }));
      for (const y of [y1, y1 + 1, y1 + 2]) { const [cx, cy] = L(mx, y); if (!m.get(cx, cy) && (h.fl(cx, cy) === 0 || h.fl(cx, cy) === MOSS)) m.setFloor(cx, cy, TRACK); }   // the path comes in at the door
      m.deco('sign', ...L(122.5, 50.6), { radius: 0.2, scale: 0.75, label: TX.lych });
      h.trap('alarm', ...L(124.5, 48.4), 'p79-lych-bell'); h.trap('tripwire', ...L(124.5, 46.6), 'p79-lych-cord');
      m.enemy('dirge', ...L(122.4, 45.4)); m.enemy('mites', ...L(126.6, 47.4));
      m.deco('bones', ...L(122.6, 40.8), { radius: 0.3, scale: 0.6 }); m.enemy('hound', ...L(121.4, 41.4)); m.enemy('hound', ...L(127.2, 41.2));
      m.add({ kind: 'item', item: 'cache', tier: 2, x: L(124.6, 40.6)[0], y: L(124.6, 40.6)[1], sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });   // what the hounds are lying on
      // the old reed-row, a pole every few paces up the path to the lych-house
      { const pth = h.paths[1], [kx, ky] = P(CAMP0[0], CAMP0[1]); let due = 3, n = 0;
        for (let i = 0; i + 1 < pth.length; i++) { const [ax, ay] = pth[i], [bx, by] = pth[i + 1], Ln = Math.hypot(bx - ax, by - ay), nx = -(by - ay) / Ln, ny = (bx - ax) / Ln;
          for (; due <= Ln; due += 4.6) { n++; const sd = n % 2 ? 1 : -1, ox = ax + (bx - ax) * due / Ln + nx * 1.5 * sd, oy = ay + (by - ay) * due / Ln + ny * 1.5 * sd;
            if (Math.hypot(ox - kx, oy - ky) > 3 && h.open(ox | 0, oy | 0)) m.deco('p79_reedrow', ox, oy, { radius: 0.15, scale: 3.4, solid: false, label: TX.reedrow }); }
          due -= Ln; } }
      // the diggers' camp on the path up
      const [cx, cy] = P(CAMP0[0], CAMP0[1]);
      m.deco('lamp', cx + 1.1, cy - 0.9, { radius: 0.12, scale: 0.5, glow: 0, label: TX.lantern, _p79b: 'lantern' });
      m.deco('p79_book', cx - 0.8, cy - 1.1, { radius: 0.25, scale: 0.45, label: TX.book, use: 'p79_book', _p79b: 'book' });
      for (let i = 0; i < 5; i++) m.deco('hushmoth', cx + 1.1 + Math.cos(i * 1.26) * 0.5, cy - 0.9 + Math.sin(i * 1.26) * 0.4, { radius: 0.1, scale: 0.34, solid: false, hidden: true, label: TX.moth, _p79b: 'moth', _i: i, _x: cx + 1.1, _y: cy - 0.9 });
    },
  }, K);
  const CAMP = { x: SPE.P(CAMP0[0], CAMP0[1])[0], y: SPE.P(CAMP0[0], CAMP0[1])[1] };
  const LYCH = SPE.C(KNOLL0[0], KNOLL0[1]), RUIN = { x0: LYCH(RUIN0.x0, RUIN0.y0)[0], y0: LYCH(RUIN0.x0, RUIN0.y0)[1], x1: LYCH(RUIN0.x1, RUIN0.y1)[0], y1: LYCH(RUIN0.x1, RUIN0.y1)[1] };
  const HOWE_UP = { map: EAST, x: LYCH(124.5, 44.6)[0], y: LYCH(124.5, 44.6)[1], dir: PI / 2 };   // where the Howe's stair comes up: just inside the lych-house

  // ---------------------------------------------------------------- joining the three stretches end to end
  const doorTo = (m, target) => { for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door && c.portal && c.portal.map === target) return c; } return null; };
  const gateW = (sp) => ({ map: sp.id, x: 1.6, y: sp.gw + 0.5, dir: 0 }), gateE = (sp) => ({ map: sp.id, x: sp.W - 1.6, y: sp.ge + 0.5, dir: PI });
  function join(maps) {
    const cl = maps.clearing, gr = maps.greenroot, mid = maps[MID]; if (!cl || !gr || !mid || maps[WEST]) return false;
    const out = doorTo(cl, MID), back = doorTo(gr, MID), mw = doorTo(mid, 'clearing'), me = doorTo(mid, 'greenroot'); if (!out || !back || !mw || !me) return false;
    const midW = { map: MID, x: 1.6, y: R.GW + 0.5, dir: 0 }, midE = { map: MID, x: R.W - 1.6, y: R.GE + 0.5, dir: PI };
    maps[WEST] = buildStage(SPW, Object.assign({}, mw.portal), midW);
    maps[EAST] = buildStage(SPE, midE, Object.assign({}, me.portal));
    out.portal = gateW(SPW); mw.portal = gateE(SPW);
    me.portal = gateW(SPE); back.portal = gateE(SPE);
    for (const id of [WEST, MID, EAST]) walkGrid(maps[id], ROSTERS[id]);
    return true;
  }

  // ---------------------------------------------------------------- the people
  const cen = (q) => [Math.floor(q[0]) + 0.5, Math.floor(q[1]) + 0.5];   // people stand in the middle of a pace of ground
  const st = (from, to, job, at, x) => Object.assign({ from, to, job, at: cen(at) }, x || {});
  const day3 = (k) => () => typeof G !== 'undefined' && (((Number(G.day) || 0) % 3) + 3) % 3 !== k;
  const off = (p, dx, dy) => [p[0] + dx, p[1] + dy];
  const GW_ = (sp) => [1.6, sp.gw + 0.5], GE_ = (sp) => [sp.W - 1.6, sp.ge + 0.5], MIDSP = { W: R.W, gw: R.GW, ge: R.GE };
  // stops along each stretch, west to east
  const onRoad = (sp, i, t) => { const a = sp.road[i], b = sp.road[i + 1]; return [a[0] + (b[0] - a[0]) * t + 0.5, a[1] + (b[1] - a[1]) * t + 0.5]; };   // a point on the road itself
  const STOPS = { [WEST]: [onRoad(SPW, 5, 0.1), onRoad(SPW, 11, 0.1), onRoad(SPW, 16, 0.1)], [MID]: [onRoad({ road: R.ROADPTS }, 3, 0.1), onRoad({ road: R.ROADPTS }, 8, 0.5), onRoad({ road: R.ROADPTS }, 15, 0.5)], [EAST]: [onRoad(SPE, 7, 0.1), onRoad(SPE, 13, 0.1), onRoad(SPE, 19, 0.1)] };
  const WELL = SPW.C(WELL0[0], WELL0[1]);
  const packLines = { name: TX.packman, sprite: 'p60_man_a', greet: TX.packGreet, work: TX.packWork, place: TX.packPlace, barks: [TX.packBark] };
  const band = [
    { key: 'rd_band_a', name: TX.bandA, sprite: 'p60_wom_b', greet: TX.bandAGreet, place: TX.bandAPlace, barks: [TX.bandABark], d: [0, 0] },
    { key: 'rd_band_b', name: TX.bandB, sprite: 'p60_man_c', greet: TX.bandBGreet, place: TX.bandBPlace, d: [0.9, 0.5] },
    { key: 'rd_band_c', name: TX.bandC, sprite: 'p60_man_b', greet: TX.bandCGreet, place: TX.bandCPlace, d: [-0.8, 0.7] },
  ];
  // the band walks west: Greenroot Wood 8 to 11, the middle 11 to 14, the Long Common 14 to 17
  const bandOn = (id, sp, h0) => band.map((b) => { const P = STOPS[id].slice().reverse().map((q) => off(q, b.d[0], b.d[1]));
    return Object.assign({}, b, { home: GW_(sp), away: day3(1), exit: GW_(sp), d: undefined,
      day: [st(h0, h0 + 1, 'carry', P[0]), st(h0 + 1, h0 + 2, 'carry', P[1]), st(h0 + 2, h0 + 3, 'carry', P[2]), { from: h0 + 3, to: 24, job: 'home', at: GW_(sp) }, { from: 0, to: h0, job: 'home', at: GE_(sp) }] }); });
  const ROSTERS = {
    [WEST]: [
      { key: 'rd_cutter', name: TX.cutter, sprite: 'p60_man_b', home: GW_(SPW),
        day: [st(7, 12, 'rake', off(onRoad(SPW, 9, 0.6), 0.6, 2.2)), st(12, 13, 'sit', WELL(63.4, 47.6)), st(13, 18, 'rake', off(onRoad(SPW, 10, 0.3), 0.4, 2.4)), { from: 18, to: 7, job: 'home' }],
        greet: TX.cutterGreet, work: TX.cutterWork, place: TX.cutterPlace, barks: [TX.cutterBark] },
      // the packman: out in the morning, home in the afternoon
      Object.assign({ key: 'rd_packman', home: GW_(SPW), away: day3(0), exit: GW_(SPW),
        day: [st(7, 8, 'carry', STOPS[WEST][0]), st(8, 9, 'carry', STOPS[WEST][1]), st(9, 10, 'carry', STOPS[WEST][2]), { from: 10, to: 14, job: 'home', at: GE_(SPW) },
          st(14, 15, 'carry', STOPS[WEST][2]), st(15, 16, 'carry', STOPS[WEST][1]), st(16, 17, 'carry', STOPS[WEST][0]), { from: 17, to: 7, job: 'home', at: GW_(SPW) }] }, packLines),
    ].concat(bandOn(WEST, SPW, 14)),
    [MID]: R.ROSTER.concat([
      Object.assign({ key: 'rd_packman', home: GW_(MIDSP), away: day3(0), exit: GW_(MIDSP),
        day: [st(10, 11, 'carry', STOPS[MID][0]), st(11, 13, 'sit', onRoad({ road: R.ROADPTS }, 3, 0.5)), { from: 13, to: 10, job: 'home', at: GW_(MIDSP) }] }, packLines),
    ]).concat(bandOn(MID, MIDSP, 11)),
    [EAST]: [
      { key: 'rd_antiq', name: TX.antiq, sprite: 'p60_wom_c', home: [CAMP.x, CAMP.y],
        day: [st(6, 9, 'sit', [CAMP.x - 0.2, CAMP.y + 0.4]), st(9, 12, 'reach', LYCH(124.5, 51.4)), st(12, 14, 'sit', [CAMP.x - 0.2, CAMP.y + 0.4]), st(14, 17, 'reach', LYCH(123.5, 51.6)), st(17, 24, 'sit', [CAMP.x - 0.2, CAMP.y + 0.4]), st(0, 6, 'sit', [CAMP.x - 0.2, CAMP.y + 0.4])],
        greet: TX.antiqGreet, work: TX.antiqWork, place: TX.antiqPlace, barks: [TX.antiqBark] },
      { key: 'rd_digger', name: TX.digger, sprite: 'p60_man_a', home: [CAMP.x + 0.8, CAMP.y + 1.0],
        day: [st(6, 9, 'sit', [CAMP.x + 1.0, CAMP.y + 0.9]), st(9, 12, 'rake', LYCH(125.6, 51.8)), st(12, 14, 'sit', [CAMP.x + 1.0, CAMP.y + 0.9]), st(14, 17, 'rake', LYCH(122.4, 52.0)), st(17, 24, 'sit', [CAMP.x + 1.0, CAMP.y + 0.9]), st(0, 6, 'sit', [CAMP.x + 1.0, CAMP.y + 0.9])],
        greet: TX.diggerGreet, work: TX.diggerWork, place: TX.diggerPlace, barks: [TX.diggerBark] },
    ].concat(bandOn(EAST, SPE, 8)),
  };
  // Where people walk: the road itself (never the ford: they cross by the bridge), side paths, bridges and board-walks,
  // and from each place they stop, the shortest way to the road.
  function walkGrid(m, roster) {
    const W = m.w, H = m.h, g = new Uint8Array(W * H);
    let bandCells = m._p79band;
    if (!bandCells) { bandCells = new Uint8Array(W * H); along(R.ROADPTS, 0.4, (px_, py) => { for (const [dx, dy] of [[0, 0], [1, 0], [0, 1], [1, 1]]) { const x = Math.floor(px_ - 0.5) + dx, y = Math.floor(py - 0.5) + dy; if (x >= 1 && y >= 1 && x <= W - 2 && y <= H - 2) bandCells[y * W + x] = 1; } }); for (const [x, y] of R.fordCells()) bandCells[y * W + x] = 0; }
    for (let i = 0; i < W * H; i++) { const f = m.floorCells[i]; if (!m.cells[i] && f !== WATER && (bandCells[i] || f === TRACK || f === PLANK || f === FLAG)) g[i] = 1; }
    const stops = []; for (const p of roster || []) { stops.push(p.home); if (p.exit) stops.push(p.exit); for (const s of p.day) if (s.at) stops.push(s.at); }
    for (const q of stops) {   // breadth-first from the stop to the nearest walked cell; the way found is walked too
      const s = Math.floor(q[1]) * W + Math.floor(q[0]); if (g[s]) continue;
      const prev = new Int32Array(W * H).fill(-1), queue = [s]; prev[s] = s; let hit = -1;
      for (let qi = 0; qi < queue.length && hit < 0; qi++) { const i = queue[qi], x = i % W, y = (i / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, j = Y * W + X; if (X < 1 || Y < 1 || X > W - 2 || Y > H - 2 || prev[j] >= 0 || m.isBlocked(X, Y)) continue; prev[j] = i; if (g[j]) { hit = j; break; } queue.push(j); } }
      for (let i = hit; i >= 0 && i !== s; i = prev[i]) g[i] = 1; g[s] = 1;
    }
    m._p79walk = g; return g;
  }
  const walk = (m, x, y) => !m._p79walk || !!m._p79walk[y * m.w + x];

  // ---------------------------------------------------------------- the hour, the weather, and the two small tasks
  const blowing = () => typeof Weather !== 'undefined' && (Weather.state === 'rain' || Weather.state === 'storm');
  let warned = false, lastKey = '';
  function sync(dt) {
    if (typeof G === 'undefined' || !G.map) return;
    const id = G.map.id, f = G.flags || {}, cam = typeof Engine !== 'undefined' ? Engine.cam : null, dark = night();
    if (id === WEST) {
      const lit = f.p79_lamp === 2, blow = blowing(), key = 'w' + (lit ? 1 : 0) + (dark ? 1 : 0) + (blow ? 1 : 0) + (f.p79_lamp || 0);
      if (key !== lastKey) { lastKey = key; for (const e of G.ents) { if (!e || !e._p79b) continue;
        if (e._p79b === 'lamp') { e.glow = lit && dark ? 0.5 : 0; e.label = lit ? (dark ? TX.lampLit : TX.lampDay) : TX.lampDry; e.use = lit ? undefined : 'p79_lamp'; }
        else if (e._p79b === 'can') { e.hidden = !!f.p79_lamp; }
        else if (e._p79b === 'ring') e.label = blow ? TX.standWet : TX.stand;
        else if (e._p79b === 'glass' || e._p79b === 'glass0') { if (e._p79b === 'glass') e.label = dark ? TX.glassNight : TX.glass; e.lightCol = dark ? [26, 78, 46] : [10, 30, 18]; } } }
      // in rain or a storm the Stand tolls: noise, which is what brings the hounds
      const inStand = blow && !!cam && Math.hypot(cam.x - STAND.x, cam.y - STAND.y) < STAND.r && G.state === 'play';
      if (inStand) { if (typeof addNoise === 'function') addNoise(3.2 * Math.min(0.1, Math.max(0, Number(dt) || 0))); if (!warned && typeof msg === 'function') { warned = true; msg(TX.standWarn, 'bad', 6000); } } else warned = false;
    } else if (id === EAST) {
      const key = 'e' + (dark ? 1 : 0) + (f.p79_words || 0);
      const T = Number(G.time) || 0;
      for (const e of G.ents) { if (!e || !e._p79b) continue;
        if (e._p79b === 'moth') { e.hidden = !dark; if (dark) { e.x = e._x + Math.cos(T * 2.3 + e._i * 1.9) * (0.28 + 0.1 * Math.sin(T * 1.1 + e._i)); e.y = e._y + Math.sin(T * 1.7 + e._i * 2.6) * 0.24; } }
        else if (key !== lastKey && e._p79b === 'lantern') { e.glow = dark ? 0.12 : 0; e.label = dark ? TX.lanternNight : TX.lantern; }
        else if (key !== lastKey && e._p79b === 'book') e.label = f.p79_words === 2 ? TX.bookDone : TX.book; }
      lastKey = key;
    } else lastKey = '';
  }
  function useOwn(e) {
    if (!e || typeof G === 'undefined' || !G.map || typeof e.use !== 'string') return false;
    const f = G.flags, say = (t, cls, ttl) => { if (typeof msg === 'function') msg(t, cls || '', ttl || 6000); };
    if (e.use === 'p79_can' && G.map.id === WEST) { if (!f.p79_lamp) { f.p79_lamp = 1; say(TX.canTake, 'good'); } lastKey = ''; sync(0); return true; }
    if (e.use === 'p79_lamp' && G.map.id === WEST) {
      if (f.p79_lamp === 1) { f.p79_lamp = 2; say(TX.lampFill, 'good', 9000); if (typeof questXp === 'function') questXp(30); } else if (!f.p79_lamp) say(TX.lampDry + ' ' + TX.lampNeed);
      lastKey = ''; sync(0); return true; }
    if (e.use === 'p79_book' && G.map.id === EAST) {
      if (f.p79_words === 1) { f.p79_words = 2; say(TX.bookGive, 'good', 9000); if (typeof questXp === 'function') questXp(60); if (typeof G.gold === 'function') G.gold(40); } else say(f.p79_words === 2 ? TX.bookDone : TX.book);
      lastKey = ''; sync(0); return true; }
    return false;
  }

  installArt();
  try { if (typeof LANDMARKS !== 'undefined' && LANDMARKS[MID]) { if (!LANDMARKS[WEST]) LANDMARKS[WEST] = LANDMARKS[MID].map((l) => Object.assign({}, l, { seed: (l.seed || 0) + 1.7 })); if (!LANDMARKS[EAST]) LANDMARKS[EAST] = LANDMARKS[MID].map((l) => Object.assign({}, l, { seed: (l.seed || 0) + 3.1, h: l.h * 0.85 })); } } catch (e) { /* the plain sky */ }
  if (typeof buildAllMaps === 'function') {
    const _b = buildAllMaps;
    buildAllMaps = function () {
      const maps = _b.apply(this, arguments);
      try { if (join(maps) && typeof FLORA !== 'undefined' && FLORA.place) FLORA.place({ [WEST]: maps[WEST], [EAST]: maps[EAST] }); } catch (e) { if (typeof console !== 'undefined') console.warn('road79b', e); }
      return maps;
    };
    try { if (typeof FLORA !== 'undefined' && FLORA.PLANS) { if (!FLORA.PLANS[WEST]) FLORA.PLANS[WEST] = { grass: 1400, reed: 60 }; if (!FLORA.PLANS[EAST]) FLORA.PLANS[EAST] = { grass: 1150, reed: 280 }; } } catch (e) { /* no grass */ }
    try { if (typeof LIFE60 !== 'undefined' && LIFE60.add) for (const id of [WEST, MID, EAST]) LIFE60.add(id, ROSTERS[id], { walk }); } catch (e) { /* nobody on the road */ }
  }
  if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { /* fall through */ } return _ud.apply(this, arguments); }; }
  // After the Greening the hedge grows across the old cart-road and "whatever road ran east of here is under the green
  // now" (js/parish.js shuts the clearing's door for good and puts a save made in Greenroot back in the clearing). The
  // road is that road: a save made anywhere on it, or in the Howe, comes back to the same place by the hedge.
  const MINE = [WEST, MID, EAST, HOWE], greened = () => typeof G !== 'undefined' && !!G.flags && !!G.flags.greening;
  if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function (id) {
    if (MINE.indexOf(id) >= 0 && greened()) { const cl = G.maps && G.maps.clearing; if (cl && cl._p9pRoad) return _l.call(this, 'clearing', { x: cl.w - 2.4, y: cl._p9pRoad.y + 0.5, dir: PI }); }
    const r = _l.apply(this, arguments); try { lastKey = ''; warned = false; sync(0); } catch (e) { /* next frame */ } return r; }; }
  if (typeof update === 'function') { const _u = update; update = function (dt) { const r = _u.apply(this, arguments); try { sync(dt); } catch (e) { /* next frame */ } return r; }; }

  return { WEST, EAST, MID, HOWE, MINE, K, TX, TEXTS, SPW, SPE, STAND, CAMP, RUIN, HOWE_UP, ROSTERS, STOPS, buildStage, join, sync, useOwn, walkGrid };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = ROAD79B;
if (typeof window !== 'undefined') window.ROAD79B = ROAD79B;
