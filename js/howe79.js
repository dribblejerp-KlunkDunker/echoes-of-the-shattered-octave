// ============================================================
//  howe79 — Phase 79: Singers' Howe, the dungeon off the Greenroot road (owner, 12 Nov: "old ruins that hide dangerous
//  and deadly surprises and perhaps a full dungeon that can be explored and looted for special gear").
//
//  Under the ruined lych-house in Greenroot Wood (js/road79b.js) is the hill where Greenroot's Cantors were sung down.
//  Seven rooms: the stair foot, the gallery of niches, the choir, the offering room, the drowned vault, and behind a door
//  with no handle, the passage and the singers' chamber.
//    the way in   three graves have lost their second stone (the Reach's way of setting a grave: a stone on the tongue, a
//                 stone on the stone). Set a stone on each and the inner door opens. One grave is in the offering room,
//                 one in the drowned vault, one in the choir.
//    what is there   Cacophony Swarms in the gallery and the vault, Hush-Moths at the offering-room lamp, two Dirges in
//                 the choir (a Dirge is funeral songs, eaten), and in the singers' chamber, in the dark, a Quiet.
//                 Three traps (a tripwire, a net, an alarm wire).
//    special gear   on the singers' shelf: the Old Cantor's Staff (iron: it bites the Quiet; blunt: it breaks armour; a
//                 long reach, and the quietest long weapon there is) and the Bearer's Gloves (as stout as mail, and they make you quieter);
//                 and a strongbox of the best kind. A lesser strongbox in the offering room.
//    the task     the antiquary camped above wants the words cut over the inner door written in her field-book.
//  Canon used: Cantors sing the dead into the ground; the Dirge; the Quiet and iron; graves marked with a reed; a stone on
//  the tongue and a stone on the stone (already in the game's Book Four prologue). The Howe itself, its rooms, the words
//  and the two pieces of gear were [PROPOSED] and approved by the owner on 13 Nov.
//
//  Flags: p79_graves (a bit for each grave set), p79_howe_open (1 once all three are), p79_words (1 once read).
// ============================================================
'use strict';

const HOWE79 = (function () {
  const MAP = 'p79_howe', W = 46, H = 36, PI = Math.PI;
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    name: S('Singers\' Howe'),
    up: S('Up to the lych-house'),
    stair: S('The stair foot. The steps are worn in the middle by people carrying something between them.'),
    niche: S('Niches, floor to roof. In each one a reed stands where a name would be. Every reed is dry.'),
    offer: S('The offering room. What Greenroot left at the door of its dead: a hundred years of it, and nobody has swept.'),
    choir: S('The choir, cut round, with a step for the singer. The echo comes back a half-note flat.'),
    vault: S('The lower vault. The water has come up into it and has not gone down.'),
    grave: S('A grave set the Reach way: a stone on the tongue, a stone on the stone. The second stone is gone.'),
    graveSet: S('You set a stone on the stone.'),
    graveDone: S('A grave set the Reach way. Both its stones are in their places.'),
    opens: S('The third stone goes down. Under the hill, something that has been waiting for it draws back a bar.'),
    inner: S('The inner door'),
    innerLock: S('A door of one slab, with no handle and no keyhole. It is waiting for something, and it is not you.'),
    words: S('Cut over the inner door, in letters older than the Hedge: WE SANG THEM DOWN. LET NO ONE SING THEM UP.'),
    wordsTake: S('You say the words over until you have them by heart.'),
    shelf: S('The singers\' own things, laid on a shelf of rock and left.'),
    staff: S('Old Cantor\'s Staff'),
    staffDesc: S('Ash, shod with iron at both ends, the grip worn to a hand that is not yours. Iron bites the Quiet, and this makes very little noise about it.'),
    gloves: S('Bearer\'s Gloves'),
    glovesDesc: S('Grey kid lined with hush-cloth. The ones who carried the dead down wore them, so that nothing they touched would ring.'),
  };
  const GRAVES = [[4.5, 11.5], [41.5, 10.6], [29.4, 18.4]];

  // ---- the special gear
  if (typeof WEAPONS !== 'undefined' && !WEAPONS.p79_staff) WEAPONS.p79_staff = { name: TX.staff, img: 'fp_spear', dmg: [6, 14], reach: 2.0, noise: 0.6, speed: 0.5, type: 'iron', blunt: true, value: 90, desc: TX.staffDesc };
  if (typeof ITEMS !== 'undefined') {
    if (!ITEMS.w_p79_staff) ITEMS.w_p79_staff = { name: TX.staff, sprite: 'gear', weapon: 'p79_staff', value: 90, desc: TX.staffDesc };
    if (!ITEMS.a_p79_gloves) ITEMS.a_p79_gloves = { name: TX.gloves, slot: 'hands', ar: 3, noise: -0.2, value: 48, desc: TX.glovesDesc };
  }

  // their pictures in the pack (js/icons.js: every item has a hand-built pixel icon)
  try { if (typeof ICONS !== 'undefined' && ICONS.PIX && ICONS.C_PX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p79_staff')) {
    const C = ICONS.C_PX;
    const staff = (d) => {   // Old Cantor's Staff: ash, shod with iron at both ends, a grip worn dark
      d.tilt(12, 12);
      d.layer(C.ash).rrect(-1, -12, 2, 24);
      d.layer(C.iron, { shiny: 1 }).rrect(-1.5, -14, 3, 3.4).rrect(-1.5, 10.6, 3, 3.4);
      d.layer(C.dleather).rrect(-1.3, -2.5, 2.6, 6);
      d.mark('#e6ecee', 20, 2);
    };
    ICONS.PIX['weapon:p79_staff'] = staff; ICONS.PIX.w_p79_staff = staff;
    ICONS.PIX.a_p79_gloves = (d) => {   // Bearer's Gloves: grey kid, a hush-cloth cuff
      const g = (x) => d.layer('#9a968f', { shiny: 1 }).rect(x, 9, 6, 7).rect(x, 4, 1, 6).rect(x + 2, 3, 1, 6).rect(x + 4, 4, 1, 6).rect(x + 5, 6, 1, 4).rect(x - 1, 10, 1, 4);
      g(4); g(13);
      d.layer('#4a6b62').rect(3, 16, 8, 5).rect(12, 16, 8, 5);
      d.layer('#223630').rect(3, 16, 8, 1).rect(12, 16, 8, 1);
    };
  } } catch (e) { /* the pack shows them without a picture */ }

  function build(up) {
    const m = new GameMap(MAP, TX.name, W, H, { floor: 't_flag', floorTextures: ['t_flag', 't_shallows', 't_water'], ceil: 't_stone', fogDist: 10, ambient: 0.08, fogColor: [12, 12, 16], music: 'root', danger: 1, spawn: { x: 22.5, y: 33.4, dir: -PI / 2 } });
    m.rect(0, 0, W - 1, H - 1, 't_stone');
    const room = (x0, y0, x1, y1) => m.clear(x0, y0, x1, y1);
    room(20, 30, 25, 34);                       // the stair foot
    room(22, 20, 23, 29);                       // the gallery of niches
    room(15, 10, 30, 19);                       // the choir
    room(9, 14, 14, 15); room(2, 10, 8, 19);    // west: the offering room
    room(31, 14, 36, 15); room(37, 9, 43, 20);  // east: the drowned vault
    room(22, 6, 22, 8); room(16, 1, 29, 5);     // behind the inner door: the passage and the singers' chamber
    m.set(22, 35, DOOR({ portal: up, label: TX.up }));
    m.set(22, 9, DOOR({ label: TX.inner, locked: 'p79_howe_open', lockMsg: TX.innerLock }));
    // pillars in the choir, a ledge in the vault that stays dry, water everywhere else in it
    for (const [x, y] of [[18, 12], [27, 12], [18, 17], [27, 17]]) m.set(x, y, WALL('t_stone'));
    for (let y = 9; y <= 20; y++) for (let x = 37; x <= 43; x++) m.setFloor(x, y, y <= 11 && x >= 40 ? 0 : 1);
    for (let y = 15; y <= 18; y++) for (let x = 40; x <= 42; x++) m.setFloor(x, y, 2);
    // light: little of it, and none behind the inner door
    for (const [x, y] of [[20.6, 31.0], [23.6, 24.5], [15.6, 14.5], [30.4, 14.5], [5.5, 10.5]]) m.deco('lamp', x, y, { radius: 0.12, scale: 0.6, glow: 0.4 });
    // what the rooms are
    m.deco('sign', 24.4, 31.6, { radius: 0.2, scale: 0.6, label: TX.stair });
    for (const y of [21.5, 24.5, 27.5]) m.deco('bones', 23.7, y, { radius: 0.2, scale: 0.45, solid: false, label: TX.niche });
    m.deco('sign', 8.4, 13.4, { radius: 0.2, scale: 0.6, label: TX.offer });
    m.deco('sign', 20.5, 18.4, { radius: 0.2, scale: 0.6, label: TX.choir });
    m.deco('sign', 37.6, 13.4, { radius: 0.2, scale: 0.6, label: TX.vault });
    m.deco('sign', 23.6, 10.5, { radius: 0.2, scale: 0.7, label: TX.words, use: 'p79_words', _p79h: 'words' });
    GRAVES.forEach(([x, y], i) => m.deco(typeof Engine !== 'undefined' && Engine.sprites && Engine.sprites.p79_cairn ? 'p79_cairn' : 'bones', x, y, { radius: 0.4, scale: 0.6, label: TX.grave, use: 'p79_grave', _p79h: 'grave', _i: i }));
    m.deco('bones', 3.0, 18.0, { radius: 0.3, scale: 0.6 }); m.deco('bones', 16.4, 18.4, { radius: 0.3, scale: 0.6 }); m.deco('bones', 28.4, 2.0, { radius: 0.3, scale: 0.6 });
    // traps
    const trap = (type, x, y, id) => m.deco(TRAP_TYPES[type].sprite, x, y, { solid: false, scale: type === 'alarm' ? 0.35 : 0.45, use: 'trap', trapType: type, trapId: id, label: TRAP_TYPES[type].name + ' — inspect to disarm', glow: 0.35 });
    trap('tripwire', 22.5, 26.5, 'p79-howe-cord'); trap('net', 10.5, 14.6, 'p79-howe-net'); trap('alarm', 22.5, 11.6, 'p79-howe-bell');
    // what lives here now
    m.enemy('mites', 22.6, 22.4); m.enemy('mites', 23.3, 28.2);
    m.enemy('dirge', 17.4, 14.6); m.enemy('dirge', 27.6, 15.4);
    m.enemy('hushmoth', 5.0, 12.0); m.enemy('hushmoth', 6.4, 11.2);
    m.enemy('mites', 38.5, 18.5); m.enemy('mites', 42.5, 13.5); m.enemy('mites', 39.5, 12.5);
    m.enemy('quiet', 22.5, 3.0);
    // loot: the offering room, and the singers' shelf
    m.add({ kind: 'item', item: 'cache', tier: 2, x: 3.4, y: 16.5, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.deco('sign', 20.4, 1.6, { radius: 0.2, scale: 0.6, label: TX.shelf });
    m.add({ kind: 'item', item: 'w_p79_staff', x: 21.6, y: 1.6, sprite: 'gear', scale: 0.5, yOff: 0, solid: false, label: TX.staff });
    m.add({ kind: 'item', item: 'a_p79_gloves', x: 23.4, y: 1.6, sprite: 'gear', scale: 0.4, yOff: 0, solid: false, label: TX.gloves });
    m.add({ kind: 'item', item: 'cache', tier: 3, x: 25.4, y: 1.7, sprite: 'chest', scale: 0.5, yOff: 0, solid: false, label: 'A strongbox' });
    m.baseCount = m.entities.length;
    return m;
  }

  const ALL = 7;
  function sync() {
    if (typeof G === 'undefined' || !G.map || G.map.id !== MAP) return;
    const f = G.flags, set = Number(f.p79_graves) || 0;
    for (const e of G.ents) { if (!e || !e._p79h) continue;
      if (e._p79h === 'grave') { const done = !!(set & (1 << e._i)); e.label = done ? TX.graveDone : TX.grave; e.use = done ? undefined : 'p79_grave'; } }
  }
  function useOwn(e) {
    if (!e || typeof G === 'undefined' || !G.map || G.map.id !== MAP || typeof e.use !== 'string') return false;
    const f = G.flags, say = (t, cls, ttl) => { if (typeof msg === 'function') msg(t, cls || '', ttl || 6000); };
    if (e.use === 'p79_grave') {
      const was = Number(f.p79_graves) || 0, now = was | (1 << e._i); f.p79_graves = now;
      if (now === ALL && !f.p79_howe_open) { f.p79_howe_open = 1; say(TX.opens, 'good', 9000); if (typeof questXp === 'function') questXp(40); try { if (typeof Audio_ !== 'undefined' && Audio_.sfx && Audio_.sfx.door) Audio_.sfx.door(); } catch (err) { /* silent */ } }
      else say(TX.graveSet, 'good');
      sync(); return true;
    }
    if (e.use === 'p79_words') { if (!f.p79_words) { f.p79_words = 1; say(TX.words + ' ' + TX.wordsTake, 'good', 10000); } else say(TX.words, '', 8000); return true; }
    return false;
  }

  if (typeof buildAllMaps === 'function') {
    const _b = buildAllMaps;
    buildAllMaps = function () {
      const maps = _b.apply(this, arguments);
      try { const B = typeof ROAD79B !== 'undefined' ? ROAD79B : null; if (B && B.EAST && maps[B.EAST] && !maps[MAP]) maps[MAP] = build(Object.assign({}, B.HOWE_UP)); } catch (e) { if (typeof console !== 'undefined') console.warn('howe79', e); }
      return maps;
    };
  }
  if (typeof useDeco === 'function') { const _ud = useDeco; useDeco = function (e) { try { if (useOwn(e)) return undefined; } catch (err) { /* fall through */ } return _ud.apply(this, arguments); }; }
  if (typeof loadMap === 'function') { const _l = loadMap; loadMap = function () { const r = _l.apply(this, arguments); try { sync(); } catch (e) { /* cosmetic */ } return r; }; }

  return { MAP, W, H, TX, TEXTS, GRAVES, build, sync, useOwn };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = HOWE79;
if (typeof window !== 'undefined') window.HOWE79 = HOWE79;
