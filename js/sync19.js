// ============================================================
//  sync19 — Phase 19 "Together", team SYNC: the host-authoritative shared world.
//
//  WHAT IT DOES
//   The host's game is the only world. The guest's page stops simulating its own world while joined and instead
//   renders the host's: it sends its inputs (movement, facing, look, run, block, pose) at 30 Hz and its actions
//   (strike, Song, use, item) as events; the host moves the guest's traveller with the same mover the guest uses to
//   predict itself, and sends the guest compact delta snapshots (15 Hz) of what the guest can see: the map, the
//   entities in range, doors, the host's figure, the time of day, the weather, the host's world flags and short
//   world messages. The guest interpolates everything 100 ms behind, predicts its own movement and reconciles to
//   the host's answer. Map changes follow the "come with me" rule: when the host changes map the guest travels with
//   them and lands beside them; the guest can never leave the host's map alone.
//
//  NOBODY CONNECTED = THE GAME EXACTLY AS BEFORE. Every wrapper below checks one boolean first and calls straight
//  through; this module never calls Math.random (on either side), never writes G.flags/G.player/entities on the host,
//  and its draw hook paints nothing unless a session is live. (test/sync19.test.js: seeded trace + save code + frame
//  hash against a page with this file blocked.)
//
//  ---------------------------------------------------------------- TRANSPORT (NET19, team NET)
//   NET19.on(type, fn(payload, peerId)) / NET19.off(type, fn) / NET19.send(type, payload, { reliable })
//   NET19.role() -> 'host' | 'guest' | null    NET19.peers() -> array (length > 0 = connected)    NET19.stats()
//   SYNC19.useTransport(t) swaps in any object with that shape (the tests' loopback). NET validates size/shape at the
//   transport; SYNC validates meaning (below). Message types used (all JSON-able plain objects):
//     guest -> host  'sync.hello'  { v }                                   reliable   ask to join / re-join
//                    'sync.in'     { k:[ep, ackSnap], i:[[seq, f, r, bits, dir, pitch, act, ap], ...] }   unreliable, 30 Hz
//                    'sync.act'    { a, ... } (see ACTIONS)                 reliable
//                    'sync.bye'    {}                                      reliable
//     host -> guest  'sync.welcome' { v, ep, map, x, y, dir, spd, flags, wx, tod, day, sig }      reliable
//                    'sync.map'    { ep, map, x, y, dir, sig }             reliable   the guest comes along
//                    'sync.snap'   SNAPSHOT (below)                        unreliable, 15 Hz
//                    'sync.flags'  { f: { key: value } }                   reliable   changed world flags (1 Hz check)
//                    'sync.msg'    { t, c }                                reliable   a world line to show (textContent)
//                    'sync.full'   {}                                      reliable   a second guest is refused
//
//  ---------------------------------------------------------------- SNAPSHOT FORMAT ('sync.snap')
//   { q, b, ep, t, tod, day, h, you, e, rm, d, wx?, x? }
//     q    snapshot sequence;  b  the snapshot it is a delta against (the newest one the guest acknowledged), -1 = full
//          (a full snapshot is a census of EVERY entity and door of the map, sent after a join or a map change)
//     ep   map epoch (bumps on every host map change; anything from another epoch is ignored on both sides)
//     t    host clock, ms (the guest interpolates 100 ms behind it)
//     tod  time of day x 10000; day = G.day
//     h    the host's figure  [x*32, y*32, feet*32, dir 0-255, act, ap 0-15, speed*10]
//     you  the guest's authoritative state [lastInputSeq, x*256, y*256, vx*256, vy*256, feet*32] (reconciliation)
//     e    changed entities   [[sid, x*32, y*32, bits, hp% | -1, state, dir 0-255, kind?, name?], ...]
//          sid < map.baseCount is the index of a map-built entity (the guest's own copy of the map has the same one);
//          sid >= 100000 is something spawned since (loot, hounds): it carries kind (0 enemy, 1 item, 2 deco, 3 npc)
//          and its catalogue name (ENEMIES type / ITEMS id / sprite / NPCS id), which the guest checks before use.
//          bits: 1 dead, 2 hidden, 4 solid, 8 flash.  state: 0 idle, 1 chase, 2 passive, 3 investigate, 4 other.
//     rm   sids gone from the map;  d  changed doors [[cellIndex, target 0|1], ...]
//     wx   weather (Weather.save()) when it changed;  x  PARTNER's extension data { key: data } (SYNC19.extend)
//   Interest: after the census, only entities within B.RANGE tiles of the guest are compared and sent; at most
//   B.MAX_ENTS per snapshot, nearest first; the rest wait for the next one. Caps: B.SNAP_MAX bytes per snapshot.
//
//  ---------------------------------------------------------------- THE CONTRACT FOR PARTNER (js/partner19.js)
//   How the guest's traveller appears to the host simulation: it is NOT an entity. It is SYNC19.guestState(), moved
//   by SYNC from the guest's validated inputs. It blocks enemies only if PARTNER makes it (SYNC never puts anything
//   into G.ents). SYNC draws a plain stand-in figure for each remote traveller until PARTNER calls
//   SYNC19.fallbackFigure(false) and draws its own from SYNC19.figures().
//
//   Inputs SYNC carries AND applies:  move (forward/strafe), turn/facing, look (pitch), run, block (held, a bit only),
//     the pose shown on the figure (act/ap), doors (open/close an unlocked, non-portal door within reach).
//   Inputs SYNC carries, validates and HANDS TO PARTNER (SYNC applies nothing): strike, Song, use (an entity),
//     item (from the guest's own pack), and any 'p.*' action PARTNER defines. Without a PARTNER handler they are
//     counted and dropped. The host's RNG is only ever touched by those handlers, i.e. by the guest's real actions.
//
//   HOST side
//    SYNC19.isHost() / isGuest() / active()     booleans; active() = a guest is joined (host) or we are joined (guest)
//    SYNC19.guestState() -> null | { peer, map, x, y, feet, dir, pitch, vx, vy, spd, run, block, act, ap, ep,
//                                     lastInputAt (performance.now ms), inputs, rejected }
//    SYNC19.onGuestAction(fn)   fn(action, guestState) for each validated action:
//                                 { a:'atk', dir:'slash right'|'slash left'|'chop down'|'cut up'|'thrust', w:int }
//                                 { a:'song', id:string }      { a:'use', sid:int, ent:<host entity object> }
//                                 { a:'item', id:string }      { a:'p.<name>', v:<plain value, <= 512 bytes JSON> }
//    SYNC19.setGuestSpeed(speedAttr)   the guest's validated Speed attribute (0-100; default 50). Movement speed is
//                                 2.6 + Speed/60 tiles/s, x1.7 running (the game's own formula); the guest is told.
//    SYNC19.placeGuest(x, y, dir?)  teleport the guest's traveller (revive, story staging); reconciled next snapshot.
//    SYNC19.setGuestFrozen(bool)    while true the host ignores the guest's movement (downed, cutscene).
//    SYNC19.tellGuest(text, cls?)   show a line on the guest's message strip (plain text, <= 200 chars).
//    SYNC19.extend(key, { host: () => plainData | undefined, guest: (data) => void })
//                                 piggyback PARTNER state on every snapshot (key [a-z0-9_]{1,16}, <= 2 KB JSON each).
//   GUEST side
//    SYNC19.sendAction(action)   send one action (shapes above); the module's own wrappers send atk/song/use/door.
//    SYNC19.leave()              leave the session and get your own world back exactly as it was.
//   BOTH sides
//    SYNC19.figures() -> [{ who:'host'|'guest', x, y, feet, dir, pitch, act, ap, spd }]  remote travellers on THIS
//                                 map, interpolated, ready to draw (act/ap use GHOST18's pose codes: 0 none, 1-5 swings,
//                                 6 shot, 7 song, 8 hurt, 9 block; ap 0-1 the action phase)
//    SYNC19.on(evt, fn)          'join' | 'leave' | 'map' (host and guest) | 'snap' (guest, after a snapshot applied)
//    SYNC19.fallbackFigure(on)   PARTNER turns SYNC's stand-in figure off when it draws its own.
//    SYNC19.stats()              bytes/s each way by message type, snapshot sizes, CPU ms per frame, rejections.
//
//   The guest's own world is put aside while joined (maps, map, entities, flags, time, weather, camera) and restored
//   on leave; saving while joined saves that own world, never the host's (snapshotGame is wrapped). The guest's
//   G.player stays the guest's own (PARTNER owns what happens to it). A guest that joins from the title screen with
//   no character gets a plain stand-in traveller until PARTNER supplies one; it cannot be saved.
//
//  Wrapped, never edited: update, loadMap, interact, attack, castSong, transfer, snapshotGame, msg.
// ============================================================
'use strict';

const SYNC19 = (function () {
  const api = {
    isHost: () => false, isGuest: () => false, active: () => false,
    guestState: () => null, onGuestAction() {}, setGuestSpeed() {}, placeGuest() {}, setGuestFrozen() {},
    tellGuest() {}, extend() {}, sendAction() { return false; }, leave() {}, figures: () => [], on() {},
    fallbackFigure() {}, stats: () => ({}), useTransport() {},
  };
  return api;
})();
window.SYNC19 = SYNC19;
