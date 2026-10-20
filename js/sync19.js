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
//  Wrapped, never edited: update, loadMap, buildAllMaps (records where each map-built entity sits), interact, attack,
//  castSong, transfer, snapshotGame, renderSave, msg.
// ============================================================
'use strict';

const SYNC19 = (function () {
  // ---------------------------------------------------------------- the numbers (all of them)
  const B = {
    V: 1,                 // protocol version (sync.hello / sync.welcome)
    STEP: 1 / 30,         // one guest input = one 1/30 s step of movement, on both sides
    SNAP_MS: 1000 / 15,   // a snapshot every 66.7 ms
    RANGE: 28,            // tiles: entities further from the guest than this are not compared (after the census)
    MAX_ENTS: 64,         // changed entities per snapshot, nearest first
    CENSUS_MAX: 3000,     // entities in a full snapshot
    SNAP_MAX: 16000,      // bytes of JSON per snapshot (entities beyond it wait for the next one)
    RING: 32,             // snapshots kept for delta baselines, each side
    INTERP_MS: 100,       // the guest draws the host's world this far behind
    IN_BATCH: 6,          // inputs per 'sync.in' (the newest unacknowledged ones; redundancy for a lossy channel)
    IN_PENDING: 120,      // inputs the guest keeps for replay (4 s)
    BUDGET_MAX: 0.35,     // seconds of movement the host lets a guest bank (anti speed-hack: real time is the cap)
    IN_RATE: 60,          // 'sync.in' messages per second the host accepts
    ACT_RATE: 12,         // actions per second (burst 12)
    MSG_RATE: 4,          // world lines per second forwarded to the guest
    SEQ_JUMP: 900,        // an input sequence may not jump further than this (30 s)
    DOOR_REACH: 2.6,      // a guest opens doors within this
    USE_REACH: 3.4,       // and uses things within this
    FLAG_MS: 1000,        // how often the host looks for changed world flags
    MAX_FLAGS: 6000, FLAG_STR: 64,
    HELLO_MS: 2000,       // the guest asks again this often until welcomed
    LOST_MS: 20000,       // a guest with no snapshot for this long goes home
    EXT_MAX: 2048,        // bytes per PARTNER extension per snapshot
    ACT_V_MAX: 512,       // bytes of a PARTNER action value
    MSG_MAX: 200,
    SMOOTH: 10,           // the guest's reconciliation error decays at this rate (1/s)
    SNAP_DIST: 2,         // a correction bigger than this (tiles) is a jump, not a slide
  };
  const SWINGS = ['slash right', 'slash left', 'chop down', 'cut up', 'thrust'];
  const STATE_CODE = { idle: 0, chase: 1, passive: 2, investigate: 3 };
  const STATE_NAME = ['idle', 'chase', 'passive', 'idle', 'idle'];   // the guest never runs investigations: 3 shows as idle
  const KIND = ['enemy', 'item', 'deco', 'npc'];

  // ---------------------------------------------------------------- the text (procedural, [PROPOSED]; French in tools/i18n/p19-sync.tsv)
  const TX = {
    joined: 'You walk beside {0} now. Their road is yours until you part.',
    follow: 'You go with your companion.',
    cantLeave: 'Not without your companion. Where they go, you go.',
    left: 'You part ways. Your own road is where you left it.',
    lost: 'The thread to your companion has gone slack. You are back on your own road.',
    full: 'That fire already has two travellers at it.',
    noSave: 'Saving waits until you are back on your own road.',
    companion: 'your companion',
  };
  const fmt = (s, ...a) => String(s).replace(/\{(\d+)\}/g, (m, i) => (a[+i] == null ? '' : a[+i]));

  // ---------------------------------------------------------------- small helpers (no Math.random anywhere in this file)
  const clampN = (v, a, b) => (v < a ? a : v > b ? b : v);
  const isInt = (v) => typeof v === 'number' && Number.isInteger(v);
  const isNum = (v) => typeof v === 'number' && Number.isFinite(v);
  const now = () => performance.now();
  const hasG = () => typeof G !== 'undefined' && G && typeof G === 'object';
  const wrapAng = (a) => { a = a % (Math.PI * 2); if (a > Math.PI) a -= Math.PI * 2; else if (a < -Math.PI) a += Math.PI * 2; return a; };
  const dirByte = (a) => ((Math.round(wrapAng(a) / (Math.PI * 2) * 256) % 256) + 256) % 256;
  const byteDir = (b) => wrapAng(b / 256 * Math.PI * 2);
  const say = (t, c, ms) => { try { if (typeof msg === 'function') ORIG.msg ? ORIG.msg(t, c, ms) : msg(t, c, ms); } catch (e) { /* the message strip is cosmetic */ } };
  const jsonLen = (o) => { try { return JSON.stringify(o).length; } catch (e) { return Infinity; } };
  const plainStr = (s, n) => String(s == null ? '' : s).replace(/[\u0000-\u001f<>]/g, '').slice(0, n);
  const okName = (s, n) => typeof s === 'string' && s.length > 0 && s.length <= (n || 32) && /^[A-Za-z0-9_.:-]+$/.test(s);
  const BAD_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
  const own = (o, k) => !!o && typeof k === 'string' && Object.prototype.hasOwnProperty.call(o, k) && !!o[k];   // catalogue lookups never reach Object.prototype

  // ---------------------------------------------------------------- stats
  const ST = {
    out: {}, in: {}, outN: {}, inN: {}, win: { t0: 0, out: 0, in: 0 }, outRate: 0, inRate: 0, peakOut: 0, peakIn: 0,
    snaps: 0, snapBytes: 0, snapMax: 0, snapEntsMax: 0, census: 0,
    cpu: { t0: 0, ms: 0, frames: 0, msPerFrame: 0, peak: 0 },
    rejected: {}, inputs: 0, acts: 0, recon: 0, reconErr: 0, reconErrMax: 0, mapMismatch: 0,
  };
  function rateTick() {
    const t = now(), w = ST.win;
    if (!w.t0) w.t0 = t;
    if (t - w.t0 >= 1000) {
      const s = (t - w.t0) / 1000; ST.outRate = Math.round(w.out / s); ST.inRate = Math.round(w.in / s);
      ST.peakOut = Math.max(ST.peakOut, ST.outRate); ST.peakIn = Math.max(ST.peakIn, ST.inRate);
      w.t0 = t; w.out = 0; w.in = 0;
    }
  }
  function countOut(type, n) { ST.out[type] = (ST.out[type] || 0) + n; ST.outN[type] = (ST.outN[type] || 0) + 1; ST.win.out += n; }
  function countIn(type, n) { ST.in[type] = (ST.in[type] || 0) + n; ST.inN[type] = (ST.inN[type] || 0) + 1; ST.win.in += n; }
  function reject(why) { ST.rejected[why] = (ST.rejected[why] || 0) + 1; return false; }
  function cpu(ms) {
    const c = ST.cpu, t = now(); c.ms += ms; c.peak = Math.max(c.peak, ms);
    if (!c.t0) c.t0 = t;
    if (t - c.t0 >= 1000) { c.msPerFrame = c.frames ? +(c.ms / c.frames).toFixed(4) : 0; c.msPerSec = +(c.ms / ((t - c.t0) / 1000)).toFixed(3); c.t0 = t; c.ms = 0; c.frames = 0; }
  }

  // ---------------------------------------------------------------- events
  const EV = { join: [], leave: [], map: [], snap: [] };
  function emit(name, arg) { for (const fn of EV[name] || []) { try { fn(arg); } catch (e) { console.warn('sync19: ' + name + ' handler failed', e); } } }

  // ---------------------------------------------------------------- transport
  let T = null, Tbound = null, Toverride = null;
  const HANDLERS = {};
  function transport() { if (Toverride) return Toverride; try { if (typeof NET19 !== 'undefined' && NET19) return NET19; } catch (e) { /* not loaded */ } return (typeof window !== 'undefined' && window.NET19) || null; }
  function bind() {
    const t = transport();
    if (t === Tbound) { T = t; return T; }
    if (Tbound && typeof Tbound.off === 'function') for (const k in HANDLERS) { try { Tbound.off(k, HANDLERS[k]); } catch (e) { /* gone */ } }
    Tbound = t; T = t;
    if (t && typeof t.on === 'function') for (const k in HANDLERS) { try { t.on(k, HANDLERS[k]); } catch (e) { console.warn('sync19: could not listen for ' + k, e); } }
    return T;
  }
  function role() { const t = T; if (!t || typeof t.role !== 'function') return null; try { return t.role(); } catch (e) { return null; } }
  function peerCount() { const t = T; if (!t || typeof t.peers !== 'function') return 0; try { const p = t.peers(); return Array.isArray(p) ? p.length : (p && typeof p.size === 'number' ? p.size : 0); } catch (e) { return 0; } }
  function send(type, payload, reliable) {
    const t = T; if (!t || typeof t.send !== 'function') return false;
    let n = 0; try { n = JSON.stringify(payload).length; } catch (e) { return false; }
    try { t.send(type, payload, { reliable: !!reliable }); } catch (e) { return false; }
    countOut(type, n); return n;
  }
  function on(type, fn) { HANDLERS[type] = function (payload, from) { try { countIn(type, jsonLen(payload)); fn(payload, from == null ? 'peer' : String(from)); } catch (e) { reject('throw'); console.warn('sync19: ' + type + ' failed', e); } }; }

  // ---------------------------------------------------------------- the shared mover (host simulates, guest predicts: same code)
  // st: { x, y, vx, vy, feet, dir }; inp: { f, r (-1..1), run, dir }; ctx: { map, ents, other: {x,y}|null }
  function blockedAt(x, y, st, ctx) {
    const m = ctx.map, r = 0.24;
    if (!(x >= 0.3 && y >= 0.3 && x < m.w - 0.3 && y < m.h - 0.3)) return true;
    if (m.lvls || m.smooth) {
      const g = m.groundAt(x, y);
      if (g - st.feet > STEP_UP) return true;
      if (m.smooth && g > st.feet + 0.02 && m.gradeAt(x, y) > MAX_GRADE) return true;
    }
    if (m.isBlocked((x - r) | 0, (y - r) | 0) || m.isBlocked((x + r) | 0, (y - r) | 0) || m.isBlocked((x - r) | 0, (y + r) | 0) || m.isBlocked((x + r) | 0, (y + r) | 0)) return true;
    // bodies block only a step that brings you closer, so two travellers set down on the same spot can always walk apart
    const ents = ctx.ents;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i]; if (!e.solid || e.hidden || e.dead) continue;
      const rr = (e.radius || 0.3) + 0.22, dn = (x - e.x) * (x - e.x) + (y - e.y) * (y - e.y);
      if (dn < rr * rr && dn < (st.x - e.x) * (st.x - e.x) + (st.y - e.y) * (st.y - e.y)) return true;
    }
    const o = ctx.other;
    if (o) { const dn = (x - o.x) * (x - o.x) + (y - o.y) * (y - o.y); if (dn < 0.4 && dn < (st.x - o.x) * (st.x - o.x) + (st.y - o.y) * (st.y - o.y)) return true; }
    return false;
  }
  function stepMover(st, inp, base, ctx) {
    const dt = B.STEP;
    st.dir = inp.dir;
    let fwd = inp.f, str = inp.r, mag = Math.hypot(fwd, str);
    if (mag > 1) { fwd /= mag; str /= mag; mag = 1; }
    const spd = base * (inp.run ? 1.7 : 1), cs = Math.cos(st.dir), sn = Math.sin(st.dir);
    const wx = (cs * fwd - sn * str) * spd, wy = (sn * fwd + cs * str) * spd;
    const blend = 1 - Math.exp(-(mag > 0.05 ? 15 : 22) * dt);
    st.vx += (wx - st.vx) * blend; st.vy += (wy - st.vy) * blend;
    if (mag <= 0.05 && Math.hypot(st.vx, st.vy) < 0.03) { st.vx = 0; st.vy = 0; }
    if (st.vx) { const nx = st.x + st.vx * dt; if (!blockedAt(nx, st.y, st, ctx)) st.x = nx; else st.vx = 0; }
    if (st.vy) { const ny = st.y + st.vy * dt; if (!blockedAt(st.x, ny, st, ctx)) st.y = ny; else st.vy = 0; }
    const m = ctx.map; st.feet = (m.lvls || m.smooth) ? m.groundAt(st.x, st.y) : 0;
  }
  const speedOf = (attr) => 2.6 + clampN(isNum(attr) ? attr : 50, 0, 100) / 60;
  // decode one wire input [seq, f, r, bits, dir, pitch, act, ap] (both sides use the decoded, quantised values)
  function decodeInput(a) {
    if (!Array.isArray(a) || a.length !== 8) return null;
    const [seq, f, r, bits, dir, pitch, act, ap] = a;
    if (!isInt(seq) || seq < 0 || seq > 1e9) return null;
    if (!isInt(f) || !isInt(r) || f < -100 || f > 100 || r < -100 || r > 100) return null;
    if (!isInt(bits) || bits < 0 || bits > 3) return null;
    if (!isNum(dir) || Math.abs(dir) > 1000) return null;
    if (!isInt(pitch) || pitch < -40 || pitch > 40) return null;
    if (!isInt(act) || act < 0 || act > 9 || !isInt(ap) || ap < 0 || ap > 15) return null;
    return { seq, f: f / 100, r: r / 100, run: !!(bits & 1), block: !!(bits & 2), dir: wrapAng(dir), pitch, act, ap };
  }

  // ---------------------------------------------------------------- interpolation buffers
  function sample(buf, t, o) {   // keeps the newest few samples in time order
    const last = buf[buf.length - 1];
    if (last && t <= last.t) { if (t === last.t) Object.assign(last, o, { t }); return; }
    if (last && t - last.t > B.SNAP_MS * 1.6) buf.push(Object.assign({}, last, { t: t - B.SNAP_MS }));   // it stood still until just now
    buf.push(Object.assign({ t }, o));
    while (buf.length > 8) buf.shift();
  }
  function lerpAt(buf, rt, out) {
    if (!buf.length) return false;
    let a = buf[0], b = null;
    for (let i = 1; i < buf.length; i++) { if (buf[i].t <= rt) a = buf[i]; else { b = buf[i]; break; } }
    if (!b || rt <= a.t) { Object.assign(out, a); return true; }
    const k = clampN((rt - a.t) / (b.t - a.t), 0, 1);
    for (const key in b) {
      if (key === 'dir') out.dir = a.dir + wrapAng(b.dir - a.dir) * k;
      else if (key === 'act' || key === 'ap') out[key] = k < 0.5 ? a[key] : b[key];
      else out[key] = a[key] + (b[key] - a[key]) * k;
    }
    return true;
  }

  // ---------------------------------------------------------------- figure pose of THIS side's player (the codes GHOST18 uses)
  function myPose() {
    const p = G.player, w = typeof currentWeapon === 'function' && p ? currentWeapon() : null;
    let act = 0, ap = 0;
    if (G.attack && G.attack.t > 0 && G.attack.dur > 0) {
      const i = SWINGS.indexOf(G.attack.dirLabel); act = w && w.ranged ? 6 : i >= 0 ? i + 1 : 5;
      ap = Math.round(clampN(1 - G.attack.t / G.attack.dur, 0, 1) * 15);
    } else if (G.song && G.song.t > 0) { act = 7; ap = Math.round(clampN(1 - G.song.t / 0.7, 0, 1) * 15); }
    else if (G.hurtT > 0) act = 8;
    else if (typeof UPG !== 'undefined' && UPG && UPG.blocking) act = 9;
    return { act, ap };
  }

  // what an entity is, in catalogue terms: [kind code, name] (both sides compute it the same way)
  function descOf(e) {
    if (e.kind === 'enemy' && okName(e.type) && own(ENEMIES, e.type)) return [0, e.type];
    if (e.kind === 'item' && okName(e.item) && own(ITEMS, e.item)) return [1, e.item];
    if (e.kind === 'npc' && okName(e.id) && typeof NPCS !== 'undefined' && own(NPCS, e.id) && okName(e.sprite)) return [3, e.id + '|' + e.sprite];
    if (okName(e.sprite) && own(Engine.sprites, e.sprite)) return [2, e.sprite];
    return null;
  }

  // ================================================================ HOST
  const H = {
    gs: null, ep: 0, q: 0, ring: new Map(), sid: new WeakMap(), nextSid: 100000, lastSnap: 0, actFns: [], ext: new Map(),
    spdAttr: 50, frozen: false, flagsSent: new Map(), lastFlags: 0, msgB: { t: 0, n: B.MSG_RATE }, wxSent: '', figBuf: [], figOut: {},
  };
  const hostActive = () => !!H.gs;
  // A map-built entity's sid is its place in the map as built (BASE, recorded when the maps are built), so it survives
  // anything later taking entities out of the list; the guest's own copy of the map has the same entity at that place.
  function sidOf(e) {
    let s = H.sid.get(e); if (s != null) return s;
    s = BASE.has(e) ? BASE.get(e) : H.nextSid++;
    H.sid.set(e, s); return s;
  }
  function primeSids(m) {
    // a map built outside buildAllMaps (the greened Oakhaven) has had nothing taken out yet when first seen
    const n = Math.min(m.baseCount || 0, m.entities.length);
    if (!m.entities.some((e) => BASE.has(e))) for (let i = 0; i < n; i++) BASE.set(m.entities[i], i);
  }
  function entTuple(e, sid) {
    if (!isNum(e.x) || !isNum(e.y)) return null;
    const bits = (e.dead ? 1 : 0) | (e.hidden ? 2 : 0) | (e.solid ? 4 : 0) | (e.flash ? 8 : 0);
    const hp = e.kind === 'enemy' && e.hpMax > 0 && isNum(e.hp) ? clampN(Math.round(100 * e.hp / e.hpMax), 0, 100) : -1;
    const stc = e.state in STATE_CODE ? STATE_CODE[e.state] : 4;
    const t = [sid, Math.round(e.x * 32), Math.round(e.y * 32), bits, hp, stc, isNum(e.dir) ? dirByte(e.dir) : 0];
    if (sid >= 100000) {   // something added since the map was built: say what it is (the guest checks it against its catalogue)
      const d = descOf(e); if (!d) return null;
      t.push(d[0], d[1]);
    }
    return t;
  }
  function placeNear(x, y, dir) {
    const m = G.map, st = { x, y, vx: 0, vy: 0, feet: 0, dir };
    const ctx = { map: m, ents: G.ents, other: null };
    for (const [back, side] of [[0.9, 0], [0.6, 0.7], [0.6, -0.7], [0, 0.9], [0, -0.9], [-0.9, 0], [1.4, 0]]) {
      const px = x - Math.cos(dir) * back - Math.sin(dir) * side, py = y - Math.sin(dir) * back + Math.cos(dir) * side;
      st.feet = (m.lvls || m.smooth) ? m.groundAt(x, y) : 0;
      st.x = px; st.y = py;   // a spot is good if a body can stand in it and step to it from where the host stands
      if (!blockedAt(px, py, { x: px + 9, y: py + 9, feet: st.feet }, ctx)) return { x: px, y: py };
    }
    return { x, y };
  }
  function hostStart(peer) {
    const c = Engine.cam, p = G.player;
    const at = placeNear(c.x, c.y, c.dir);
    H.gs = {
      peer, map: G.mapId, x: at.x, y: at.y, vx: 0, vy: 0, feet: (G.map.lvls || G.map.smooth) ? G.map.groundAt(at.x, at.y) : 0, dir: c.dir, pitch: 0,
      run: false, block: false, act: 0, ap: 0, lastSeq: -1, ackEp: -1, ackQ: -1, budget: B.STEP * 3, budgetAt: now(), lastInputAt: now(),
      inputs: 0, rejected: 0, inB: { t: now(), n: B.IN_RATE }, actB: { t: now(), n: B.ACT_RATE }, buf: [], gclock: null,
    };
    H.ep++; H.ring.clear(); H.lastSnap = 0; H.flagsSent.clear(); H.wxSent = ''; H.figBuf = [];
    primeSids(G.map);
    const flags = flagsDiff(true);
    send('sync.welcome', {
      v: B.V, ep: H.ep, map: G.mapId, x: H.gs.x, y: H.gs.y, dir: c.dir, spd: H.spdAttr, flags, gr: !!G.flags.greening,
      wx: typeof Weather !== 'undefined' ? Weather.save() : null, tod: Math.round(G.tod * 10000), day: G.day | 0, sig: mapSig(G.map), name: p ? plainStr(p.name, 24) : '',
    }, true);
    H.lastFlags = now();
    emit('join', { side: 'host', peer });
  }
  function hostEnd(why) {
    if (!H.gs) return;
    const peer = H.gs.peer; H.gs = null; H.ring.clear();
    emit('leave', { side: 'host', peer, why });
  }
  function mapSig(m) { return { n: m.baseCount || 0, w: m.w, h: m.h }; }
  // flags the guest's renderers may need, as a diff against what was sent (primitive values only)
  function flagsDiff(full) {
    const out = {}; let n = 0;
    const f = G.flags || {};
    for (const k in f) {
      if (n >= B.MAX_FLAGS) break;
      if (BAD_KEYS.has(k) || k.length > 64) continue;
      const v = f[k]; let w;
      if (typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v))) w = v;
      else if (typeof v === 'string' && v.length <= B.FLAG_STR) w = v;
      else continue;
      n++;
      const key = typeof w + ':' + w;
      if (!full && H.flagsSent.get(k) === key) continue;
      H.flagsSent.set(k, key); out[k] = w;
    }
    if (!full) for (const k of H.flagsSent.keys()) if (!(k in f)) { H.flagsSent.delete(k); out[k] = null; }
    return out;
  }
  function hostFigure() {
    const c = Engine.cam, p = G.player, pose = myPose();
    return [Math.round(c.x * 32), Math.round(c.y * 32), Math.round(((p && isNum(p.feet)) ? p.feet : 0) * 32), dirByte(c.dir), pose.act, pose.ap, Math.round(Math.hypot(G.vel.x, G.vel.y) * 10)];
  }
  function buildSnap() {
    const gs = H.gs, m = G.map;
    const base = gs.ackEp === H.ep ? H.ring.get(gs.ackQ) : null;
    const full = !base;
    const held = full ? new Map() : new Map(base);
    const q = ++H.q, R2 = B.RANGE * B.RANGE;
    const cand = [], seen = new Set();
    const ents = m.entities;
    for (let i = 0; i < ents.length; i++) {
      const e = ents[i]; if (!e || typeof e !== 'object') continue;
      const sid = sidOf(e); seen.add(sid);
      const d2 = (e.x - gs.x) * (e.x - gs.x) + (e.y - gs.y) * (e.y - gs.y);
      if (!full && !(d2 <= R2)) continue;
      const t = entTuple(e, sid); if (!t) continue;
      const k = t.join(',');
      if (held.get(sid) === k) continue;
      cand.push([d2, sid, t, k]);
    }
    if (!full) cand.sort((a, b) => a[0] - b[0]);
    const lim = full ? B.CENSUS_MAX : B.MAX_ENTS;
    const e = [], rm = [], d = [];
    let bytes = 160;
    for (const c of cand) {
      if (e.length >= lim || bytes + c[3].length + 3 > B.SNAP_MAX - 2000) break;
      e.push(c[2]); held.set(c[1], c[3]); bytes += c[3].length + 3;
    }
    for (const k of held.keys()) if (k >= 0 && !seen.has(k)) { rm.push(k); held.delete(k); }
    if (full) for (let i = 0; i < (m.baseCount || 0); i++) if (!seen.has(i)) rm.push(i);   // map-built things the host's world no longer has
    for (const key in m.doors) {
      const dr = m.doors[key], t = dr.target > 0.5 ? 1 : 0, hk = -(+key) - 1;
      if (held.get(hk) === t) continue;
      if (bytes > B.SNAP_MAX - 400) break;
      d.push([+key, t]); held.set(hk, t); bytes += 12;
    }
    const snap = {
      q, b: full ? -1 : gs.ackQ, ep: H.ep, t: Math.round(now()), tod: Math.round(G.tod * 10000), day: G.day | 0, h: hostFigure(),
      you: [gs.lastSeq, Math.round(gs.x * 256), Math.round(gs.y * 256), Math.round(gs.vx * 256), Math.round(gs.vy * 256), Math.round(gs.feet * 32)],
      e, rm, d,
    };
    if (typeof Weather !== 'undefined') { const w = Weather.save(), ws = JSON.stringify(w); if (ws !== H.wxSent || full) { snap.wx = w; H.wxSent = ws; } }
    if (H.ext.size) {
      const x = {};
      for (const [key, h] of H.ext) { try { const v = h.host ? h.host() : undefined; if (v !== undefined && jsonLen(v) <= B.EXT_MAX) x[key] = v; } catch (err) { reject('ext'); } }
      snap.x = x;
    }
    if (H.spdSent !== H.spdAttr) { snap.spd = H.spdAttr; H.spdSent = H.spdAttr; }
    H.ring.set(q, held); H.ring.delete(q - B.RING);
    const n = send('sync.snap', snap, false);
    ST.snaps++; ST.snapBytes += n || 0; ST.snapMax = Math.max(ST.snapMax, n || 0); ST.snapEntsMax = Math.max(ST.snapEntsMax, full ? 0 : e.length); if (full) ST.census++;
  }
  function bucket(b, rate, burst) { const t = now(); b.n = Math.min(burst, b.n + (t - b.t) / 1000 * rate); b.t = t; if (b.n < 1) return false; b.n -= 1; return true; }
  function hostCtx() { return { map: G.map, ents: G.ents, other: { x: Engine.cam.x, y: Engine.cam.y } }; }
  function onIn(p, from) {
    const gs = H.gs; if (!gs || from !== gs.peer) return reject('in-peer');
    if (!bucket(gs.inB, B.IN_RATE, B.IN_RATE)) { gs.rejected++; return reject('in-rate'); }
    if (!p || typeof p !== 'object' || !Array.isArray(p.k) || p.k.length !== 2 || !isInt(p.k[0]) || !isInt(p.k[1]) || !Array.isArray(p.i) || p.i.length > 12) { gs.rejected++; return reject('in-shape'); }
    const [ep, ack] = p.k;
    if (ep === H.ep && ack >= 0 && H.ring.has(ack) && (gs.ackEp !== H.ep || ack > gs.ackQ)) { gs.ackEp = ep; gs.ackQ = ack; }
    else if (ep === H.ep && ack === -1) { gs.ackEp = -1; gs.ackQ = -1; }
    const t = now();
    gs.budget = Math.min(B.BUDGET_MAX, gs.budget + (t - gs.budgetAt) / 1000); gs.budgetAt = t;
    const ins = [];
    for (const a of p.i) { const d = decodeInput(a); if (!d) { gs.rejected++; reject('in-value'); continue; } ins.push(d); }
    ins.sort((a, b) => a.seq - b.seq);
    const ctx = hostCtx(), base = speedOf(H.spdAttr);
    for (const d of ins) {
      if (d.seq <= gs.lastSeq) continue;
      if (gs.lastSeq >= 0 && d.seq - gs.lastSeq > B.SEQ_JUMP) { gs.rejected++; reject('in-jump'); continue; }
      gs.lastSeq = d.seq; gs.inputs++; ST.inputs++;
      gs.pitch = d.pitch; gs.act = d.act; gs.ap = d.ap; gs.block = d.block; gs.run = d.run; gs.dir = d.dir;
      if (ep !== H.ep || H.frozen) { gs.vx = gs.vy = 0; continue; }   // an input from before the last map change moves nothing
      if (gs.budget < B.STEP * 0.999) { gs.rejected++; reject('in-budget'); continue; }   // faster than real time: dropped
      gs.budget -= B.STEP;
      stepMover(gs, d, base, ctx);
      // the guest's own clock for this step, to draw the guest's figure smoothly on the host
      const gt = d.seq * B.STEP * 1000; const off = t - gt;
      gs.gclock = gs.gclock == null || off < gs.gclock ? off : gs.gclock + (off - gs.gclock) * 0.02;
      sample(gs.buf, gt, { x: gs.x, y: gs.y, feet: gs.feet, dir: gs.dir, act: gs.act, ap: gs.ap, spd: Math.hypot(gs.vx, gs.vy) });
    }
    if (ins.length) gs.lastInputAt = t;
  }
  function entBySid(sid) { const m = G.map; for (let i = 0; i < m.entities.length; i++) { const e = m.entities[i]; if (H.sid.get(e) === sid) return e; } return null; }
  function onAct(p, from) {
    const gs = H.gs; if (!gs || from !== gs.peer) return reject('act-peer');
    if (!bucket(gs.actB, B.ACT_RATE, B.ACT_RATE)) { gs.rejected++; return reject('act-rate'); }
    if (!p || typeof p !== 'object' || typeof p.a !== 'string' || p.a.length > 32) { gs.rejected++; return reject('act-shape'); }
    let a = null;
    if (p.a === 'door') {
      const m = G.map, k = p.k;
      if (!isInt(k) || k < 0 || k >= m.w * m.h || !m.doors[k]) { gs.rejected++; return reject('door'); }
      const cell = m.cells[k], cx = (k % m.w) + 0.5, cy = Math.floor(k / m.w) + 0.5;
      if (!cell || !cell.door || cell.portal || cell.locked) { gs.rejected++; return reject('door-locked'); }
      if (cell.lockDifficulty && !(typeof mechanicalLockKey === 'function' && G.flags[mechanicalLockKey(cell, k % m.w, Math.floor(k / m.w))])) { gs.rejected++; return reject('door-locked'); }
      if (Math.hypot(cx - gs.x, cy - gs.y) > B.DOOR_REACH + 0.75) { gs.rejected++; return reject('door-far'); }
      const d = m.doors[k]; d.target = d.target > 0.5 ? 0 : 1;   // the door's own sound is the host's game's; this stays silent
      ST.acts++; return true;
    }
    if (p.a === 'atk') { if (!SWINGS.includes(p.dir) || !isInt(p.w) || p.w < 0 || p.w > 15) { gs.rejected++; return reject('atk'); } a = { a: 'atk', dir: p.dir, w: p.w }; }
    else if (p.a === 'song') { if (!okName(p.id) || !/^[a-z0-9_]+$/.test(p.id)) { gs.rejected++; return reject('song'); } a = { a: 'song', id: p.id }; }
    else if (p.a === 'item') { if (!okName(p.id) || !own(ITEMS, p.id)) { gs.rejected++; return reject('item'); } a = { a: 'item', id: p.id }; }
    else if (p.a === 'use') {
      if (!isInt(p.sid) || p.sid < 0) { gs.rejected++; return reject('use'); }
      const e = entBySid(p.sid);
      if (!e || e.dead || e.hidden || Math.hypot(e.x - gs.x, e.y - gs.y) > B.USE_REACH + (e.radius || 0.3)) { gs.rejected++; return reject('use-far'); }
      a = { a: 'use', sid: p.sid, ent: e };
    } else if (/^p\.[a-z0-9_]{1,24}$/.test(p.a)) {
      const v = p.v === undefined ? null : p.v;
      if (jsonLen(v) > B.ACT_V_MAX) { gs.rejected++; return reject('p-size'); }
      a = { a: p.a, v: JSON.parse(JSON.stringify(v)) };
    } else { gs.rejected++; return reject('act-unknown'); }
    ST.acts++;
    if (!H.actFns.length) return reject('act-unhandled');
    for (const fn of H.actFns) { try { fn(a, publicGuest()); } catch (e) { console.warn('sync19: PARTNER action handler failed', e); } }
    return true;
  }
  function publicGuest() {
    const g = H.gs; if (!g) return null;
    return { peer: g.peer, map: g.map, x: g.x, y: g.y, feet: g.feet, dir: g.dir, pitch: g.pitch, vx: g.vx, vy: g.vy, spd: Math.hypot(g.vx, g.vy), run: g.run, block: g.block, act: g.act, ap: g.ap, ep: H.ep, lastInputAt: g.lastInputAt, inputs: g.inputs, rejected: g.rejected };
  }
  function onHello(p, from) {
    if (role() !== 'host') return reject('hello-role');
    if (!p || p.v !== B.V) return reject('hello-version');
    if (!hasG() || !G.map || !G.player || !G.mapId) return reject('hello-wait');   // no world yet: the guest asks again
    if (H.gs && H.gs.peer !== from && now() - H.gs.lastInputAt < 5000) { send('sync.full', {}, true); return reject('hello-full'); }
    hostStart(from);
  }
  function onBye(p, from) { if (H.gs && H.gs.peer === from) hostEnd('bye'); }
  function hostTick() {
    const t0 = now();
    if (role() !== 'host' || peerCount() === 0) { hostEnd('dropped'); return; }
    const gs = H.gs; gs.map = G.mapId;
    if (G.map && t0 - H.lastSnap >= B.SNAP_MS) { H.lastSnap = H.lastSnap && t0 - H.lastSnap < B.SNAP_MS * 2 ? H.lastSnap + B.SNAP_MS : t0; buildSnap(); }
    if (t0 - H.lastFlags >= B.FLAG_MS) { H.lastFlags = t0; const f = flagsDiff(false); if (Object.keys(f).length) send('sync.flags', { f }, true); }
    ST.cpu.frames++; cpu(now() - t0); rateTick();
  }
  function hostMapChanged() {
    const gs = H.gs; if (!gs || !G.map) return;
    H.ep++; H.ring.clear(); gs.ackEp = -1; gs.ackQ = -1; gs.buf = [];
    primeSids(G.map);
    const c = Engine.cam, at = placeNear(c.x, c.y, c.dir);
    gs.x = at.x; gs.y = at.y; gs.vx = gs.vy = 0; gs.dir = c.dir; gs.map = G.mapId; gs.feet = (G.map.lvls || G.map.smooth) ? G.map.groundAt(at.x, at.y) : 0;
    send('sync.map', { ep: H.ep, map: G.mapId, x: gs.x, y: gs.y, dir: c.dir, sig: mapSig(G.map), gr: !!G.flags.greening }, true);
    H.lastSnap = 0;
    emit('map', { side: 'host', map: G.mapId });
  }

  // ================================================================ GUEST
  const C = {
    on: false, peer: null, ep: -1, stash: null, standIn: false, st: null, prev: { x: 0, y: 0 }, err: { x: 0, y: 0 }, acc: 0, seq: 0, pending: [],
    lastQ: -1, ring: new Map(), applied: new Map(), ents: new Map(), hostBuf: [], hostOut: {}, offset: null, lastSnapAt: 0, spd: 50,
    helloAt: 0, fullUntil: 0, moving: new Set(), sampleT: 0, hostName: '', extFns: new Map(),
  };
  const guestActive = () => C.on;
  function standInTraveller() {
    // a plain traveller for a guest who joined from the title screen (PARTNER brings the real one); never saved
    const keep = Object.assign({}, CREATE), c = CLASSES[0];
    CREATE.name = 'Traveller'; CREATE.cls = 0; CREATE.face = 1; CREATE.attrs = Object.assign({}, c.attrs);
    let p; try { p = newPlayer(); } finally { Object.assign(CREATE, keep); }
    try { if (typeof ensurePlayerUpgrades === 'function') ensurePlayerUpgrades(p); } catch (e) { /* the upgrades table is optional */ }
    return p;
  }
  function cleanFlags(src, into) {
    const out = into || {}; let n = Object.keys(out).length;
    if (!src || typeof src !== 'object') return out;
    for (const k of Object.keys(src)) {
      if (BAD_KEYS.has(k) || k.length > 64 || !/^[\w:.\-]+$/.test(k)) continue;
      const v = src[k];
      if (v === null) { delete out[k]; continue; }
      if (!(typeof v === 'boolean' || (typeof v === 'number' && Number.isFinite(v)) || (typeof v === 'string' && v.length <= B.FLAG_STR))) continue;
      if (!(k in out)) { if (n >= B.MAX_FLAGS) continue; n++; }
      out[k] = typeof v === 'string' ? plainStr(v, B.FLAG_STR) : v;
    }
    return out;
  }
  function knownMap(id) { return typeof id === 'string' && id.length <= 48 && G.maps && Object.prototype.hasOwnProperty.call(G.maps, id) && G.maps[id] && G.maps[id].w; }
  function onWelcome(p, from) {
    if (role() !== 'guest') return reject('welcome-state');
    if (C.on) {   // welcomed again (a reconnect): same session, fresh epoch
      if (from !== C.peer || !p || p.v !== B.V || !isInt(p.ep) || typeof p.map !== 'string' || !isNum(p.x) || !isNum(p.y) || !isNum(p.dir)) return reject('welcome-shape');
      G.flags = cleanFlags(p.flags, {}); C.lastSnapAt = now(); C.offset = null; follow(p); return;
    }
    if (!p || p.v !== B.V || !isInt(p.ep) || typeof p.map !== 'string' || !isNum(p.x) || !isNum(p.y) || !isNum(p.dir)) return reject('welcome-shape');
    const probe = buildAllMaps(); if (!Object.prototype.hasOwnProperty.call(probe, p.map)) return reject('welcome-map');
    // put the guest's own world aside, exactly as it is
    const c = Engine.cam;
    C.stash = {
      had: !!(G.player && G.map), player: G.player, maps: G.maps, map: G.map, mapId: G.mapId, ents: G.ents, flags: G.flags, tod: G.tod, day: G.day,
      wx: typeof Weather !== 'undefined' ? Weather.save() : null, cam: { x: c.x, y: c.y, dir: c.dir, pitch: c.pitch, z: c.z }, state: G.state,
      escapeTimer: G.escapeTimer, boreHold: G.boreHold, fadeT: G.fadeT, vel: { x: G.vel.x, y: G.vel.y }, feet: G.player ? G.player.feet : undefined,
    };
    C.standIn = !G.player; if (C.standIn) G.player = standInTraveller();
    C.on = true; C.peer = from; C.hostName = plainStr(p.name, 24);
    G.flags = cleanFlags(p.flags, {}); G.maps = probe; if (p.gr || G.flags.greening) { G.maps.oakhaven = buildOakhaven(true); C.green = true; } else C.green = false;
    G.escapeTimer = 0; G.boreHold = 0; G.dead = false;
    if (isNum(p.tod)) G.tod = clampN(p.tod / 10000, 0, 0.9999); if (isInt(p.day) && p.day >= 0) G.day = p.day;
    if (typeof Weather !== 'undefined' && p.wx) Weather.load(p.wx);
    if (isNum(p.spd)) C.spd = clampN(p.spd, 0, 100);
    ['#title', '#create', '#intro', '#death', '#ending', '#event'].forEach((s) => { try { hide(s); } catch (e) { /* absent */ } });
    try { closeModal(); } catch (e) { /* none open */ }
    C.lastSnapAt = now(); C.offset = null;
    if (!follow(p)) { C.on = false; G.flags = C.stash.flags; G.maps = C.stash.maps; G.player = C.stash.player; C.stash = null; return; }
    G.state = 'play'; G.keys = {};
    say(fmt(TX.joined, C.hostName || TX.companion), 'good', 6000);
    emit('join', { side: 'guest', peer: from });
  }
  function follow(p) {
    if (!knownMap(p.map)) { reject('map-unknown'); return false; }
    if ((p.gr || G.flags.greening) && !C.green) { G.maps.oakhaven = buildOakhaven(true); C.green = true; }
    const m0 = G.maps[p.map];
    const x = clampN(p.x, 0.5, m0.w - 0.5), y = clampN(p.y, 0.5, m0.h - 0.5);
    ORIG.loadMap(p.map, { x, y, dir: wrapAng(p.dir) });
    const m = G.map;
    // map-built entities keep their identity; anything this page's own modules added on arrival waits to be claimed by
    // the host's census (the same prop in the same place) and goes if it is not
    C.ents.clear(); C.moving.clear();
    for (const e of m.entities) { e._sbuf = null; if (BASE.has(e)) { e._sid19 = BASE.get(e); C.ents.set(e._sid19, e); } else e._sid19 = null; }
    if (p.sig && (p.sig.n !== (m.baseCount || 0) || p.sig.w !== m.w || p.sig.h !== m.h)) { ST.mapMismatch++; console.warn('sync19: this copy of ' + p.map + ' differs from the host\'s'); }
    C.ep = p.ep; C.ring.clear(); C.applied.clear(); C.lastQ = -1; C.pending = []; C.acc = 0; C.hostBuf = [];
    const feet = (m.lvls || m.smooth) ? m.groundAt(x, y) : 0;
    C.st = { x, y, vx: 0, vy: 0, feet, dir: wrapAng(p.dir) }; C.prev = { x, y }; C.err = { x: 0, y: 0 };
    if (G.player) { G.player.feet = feet; }
    G.vel.x = G.vel.y = 0;
    emit('map', { side: 'guest', map: p.map });
    return true;
  }
  function onMap(p, from) {
    if (!C.on || from !== C.peer) return reject('map-state');
    if (!p || !isInt(p.ep) || p.ep <= C.ep || typeof p.map !== 'string' || !isNum(p.x) || !isNum(p.y) || !isNum(p.dir)) return reject('map-shape');
    if (follow(p)) say(TX.follow, '', 2500);
  }
  function makeMirror(kind, name) {
    if (kind === 0 && okName(name) && own(ENEMIES, name)) {
      const d = ENEMIES[name];
      return { kind: 'enemy', type: name, def: d, hp: d.hp, hpMax: d.hp, sprite: d.sprite, scale: d.scale || 1, yOff: d.yOff || 0, state: 'idle', solid: true, radius: 0.35, cool: 0, stun: 0, _h: true, transient: true };
    }
    if (kind === 1 && okName(name) && own(ITEMS, name)) return { kind: 'item', item: name, sprite: ITEMS[name].sprite || 'gear', scale: 0.35, yOff: 0, solid: false, _h: true, transient: true };
    if (kind === 2 && okName(name) && own(Engine.sprites, name)) return { kind: 'deco', sprite: name, scale: 1, solid: false, _h: true, transient: true };
    if (kind === 3 && typeof name === 'string' && name.length <= 66) {
      const [id, spr] = name.split('|');
      if (okName(id) && typeof NPCS !== 'undefined' && own(NPCS, id) && okName(spr) && own(Engine.sprites, spr)) return { kind: 'npc', id, sprite: spr, scale: 1, solid: true, radius: 0.3, _h: true, transient: true };
    }
    return null;
  }
  function validTuple(t) {
    if (!Array.isArray(t) || t.length < 7 || t.length > 9) return false;
    for (let i = 0; i < 7; i++) if (!isInt(t[i])) return false;
    return t[0] >= 0 && t[0] < 1e7 && Math.abs(t[1]) < 32 * 2048 && Math.abs(t[2]) < 32 * 2048 && t[3] >= 0 && t[3] < 16 && t[4] >= -1 && t[4] <= 100 && t[5] >= 0 && t[5] <= 4 && t[6] >= 0 && t[6] < 256;
  }
  function applyEnt(t, ts, census) {
    const sid = t[0];
    let e = C.ents.get(sid);
    if (!e) {
      if (sid < (G.map.baseCount || 0)) return;   // a map-built thing this copy does not have: nothing to show
      e = claimLocal(t);
      if (!e) {
        e = makeMirror(t[7], t[8]); if (!e) { reject('ent-kind'); return; }
        e._mirror19 = true; e.x = t[1] / 32; e.y = t[2] / 32; e.homeX = e.x; e.homeY = e.y;
        G.map.entities.push(e);
      }
      e._sid19 = sid; C.ents.set(sid, e); census = true;
    }
    const x = t[1] / 32, y = t[2] / 32;
    if (census || !e._sbuf) { e._sbuf = []; e.x = x; e.y = y; }
    if (e.x !== x || e.y !== y || e._sbuf.length) { sample(e._sbuf, ts, { x, y }); C.moving.add(e); }
    e.dead = !!(t[3] & 1); e.hidden = !!(t[3] & 2); e.solid = !!(t[3] & 4); e.flash = !!(t[3] & 8);
    if (t[4] >= 0 && e.kind === 'enemy') e.hp = (e.hpMax || 1) * t[4] / 100;
    if (e.kind === 'enemy' || e.kind === 'npc') { const sn = STATE_NAME[t[5]]; if (e.state !== sn && !(e.state === 'passive' && t[5] === 2)) e.state = sn; }
    if (e.kind === 'npc' || e.kind === 'deco') e.dir = byteDir(t[6]);
  }
  // a local, unclaimed entity that is the same thing in the same place as the host's (props and banners placed by
  // presentation modules from the same seeds on both sides)
  function claimLocal(t) {
    const x = t[1] / 32, y = t[2] / 32;
    for (const e of G.map.entities) {
      if (e._sid19 != null || e._mirror19) continue;
      const d = descOf(e); if (!d || d[0] !== t[7] || d[1] !== t[8]) continue;
      if (Math.abs(e.x - x) < 0.3 && Math.abs(e.y - y) < 0.3) return e;
    }
    return null;
  }
  function removeEnt(sid) {
    const e = C.ents.get(sid); if (!e) return;
    if (sid >= (G.map.baseCount || 0)) { const i = G.map.entities.indexOf(e); if (i >= 0) G.map.entities.splice(i, 1); C.ents.delete(sid); }
    else { e.hidden = true; e.solid = false; }
    C.moving.delete(e);
  }
  function onSnap(p, from) {
    if (!C.on || from !== C.peer) return reject('snap-state');
    const t0 = now();
    if (!p || typeof p !== 'object' || !isInt(p.q) || !isInt(p.b) || !isInt(p.ep) || !isNum(p.t)) return reject('snap-shape');
    if (p.ep !== C.ep) return reject('snap-epoch');
    if (p.q <= C.lastQ) return reject('snap-old');
    if (!Array.isArray(p.e) || !Array.isArray(p.rm) || !Array.isArray(p.d) || p.e.length > B.CENSUS_MAX || p.rm.length > B.CENSUS_MAX || p.d.length > 20000) return reject('snap-shape');
    const base = p.b === -1 ? new Map() : C.ring.get(p.b);
    if (!base) return reject('snap-baseline');
    const census = p.b === -1;
    const next = new Map(base);
    for (const t of p.e) { if (!validTuple(t)) { reject('snap-ent'); continue; } next.set(t[0], t); }
    for (const sid of p.rm) if (isInt(sid) && sid >= 0) { next.delete(sid); removeEnt(sid); C.applied.delete(sid); }
    const m = G.map;
    for (const dd of p.d) { if (Array.isArray(dd) && isInt(dd[0]) && dd[0] >= 0 && dd[0] < m.w * m.h && (dd[1] === 0 || dd[1] === 1)) next.set(-dd[0] - 1, dd[1]); }
    C.ring.set(p.q, next); C.ring.delete(p.q - B.RING);
    // clock: the guest draws the host's world INTERP_MS behind the host's newest moment
    const est = t0 - p.t; C.offset = C.offset == null || est < C.offset ? est : C.offset + (est - C.offset) * 0.02;
    // the world: whatever differs from what this page shows now
    for (const [k, v] of next) {
      if (C.applied.get(k) === v) continue;
      if (k >= 0) applyEnt(v, p.t, census); else { const dr = m.doors[-k - 1]; if (dr) { dr.target = v; if (census) dr.open = v; } }
      C.applied.set(k, v);
    }
    for (const k of Array.from(C.applied.keys())) if (!next.has(k)) { if (k >= 0) removeEnt(k); C.applied.delete(k); }
    C.lastQ = p.q; C.lastSnapAt = t0;
    // the host's figure
    if (Array.isArray(p.h) && p.h.length === 7 && p.h.every(isInt)) sample(C.hostBuf, p.t, { x: p.h[0] / 32, y: p.h[1] / 32, feet: p.h[2] / 32, dir: byteDir(p.h[3]), act: clampN(p.h[4], 0, 9), ap: clampN(p.h[5], 0, 15) / 15, spd: p.h[6] / 10 });
    if (isInt(p.tod) && p.tod >= 0 && p.tod < 10000) G.tod = p.tod / 10000;
    if (isInt(p.day) && p.day >= 0 && p.day < 1e6) G.day = p.day;
    if (p.wx && typeof Weather !== 'undefined') Weather.load(p.wx);
    if (isNum(p.spd)) C.spd = clampN(p.spd, 0, 100);
    if (Array.isArray(p.you) && p.you.length === 6 && p.you.every(isInt)) reconcile(p.you);
    if (p.x && typeof p.x === 'object') for (const key of Object.keys(p.x)) { const h = C.extFns.get(key); if (h) { try { h(p.x[key]); } catch (e) { console.warn('sync19: extension ' + key + ' failed', e); } } }
    cpu(now() - t0);
    emit('snap', p.q);
  }
  function guestCtx() {
    const o = C.hostOut, has = lerpAt(C.hostBuf, now() - (C.offset || 0) - B.INTERP_MS, o);
    return { map: G.map, ents: G.map.entities, other: has ? { x: o.x, y: o.y } : null };
  }
  function reconcile(you) {
    const [ack, xq, yq, vxq, vyq, fq] = you;
    const st = C.st, ox = st.x, oy = st.y;
    C.pending = C.pending.filter((i) => i.seq > ack);
    st.x = xq / 256; st.y = yq / 256; st.vx = vxq / 256; st.vy = vyq / 256; st.feet = fq / 32;
    const ctx = guestCtx(), base = speedOf(C.spd);
    for (const inp of C.pending) stepMover(st, inp, base, ctx);
    const dx = st.x - ox, dy = st.y - oy, e = Math.hypot(dx, dy);
    ST.recon++; ST.reconErr = e; ST.reconErrMax = Math.max(ST.reconErrMax, e);
    C.prev.x += dx; C.prev.y += dy;
    if (Math.hypot(C.err.x - dx, C.err.y - dy) > B.SNAP_DIST) { C.err.x = 0; C.err.y = 0; } else { C.err.x -= dx; C.err.y -= dy; }
  }
  function guestInput() {
    const k = G.keys, c = Engine.cam, play = G.state === 'play';
    let fwd = 0, str = 0, run = false;
    if (play) {
      fwd = G.touch.fy; str = G.touch.fx;
      if (k.w || k.arrowup) fwd += 1; if (k.s || k.arrowdown) fwd -= 1; if (k.d) str += 1; if (k.a) str -= 1;
      run = (G.opts.alwaysRun ? !k.shift : !!k.shift) || G.touch.run;
    }
    const mag = Math.hypot(fwd, str); if (mag > 1) { fwd /= mag; str /= mag; }
    const pose = myPose(), block = !!(typeof UPG !== 'undefined' && UPG && UPG.blocking);
    const dirQ = Math.round(wrapAng(c.dir) * 10000) / 10000;
    const wire = [++C.seq, Math.round(clampN(fwd, -1, 1) * 100), Math.round(clampN(str, -1, 1) * 100), (run ? 1 : 0) | (block ? 2 : 0), dirQ, Math.round(clampN(c.pitch, -40, 40)), pose.act, pose.ap];
    return { wire, inp: decodeInput(wire) };
  }
  function sweep() {
    const es = G.map.entities;
    for (let i = es.length - 1; i >= 0; i--) {
      const e = es[i]; if (e._sid19 != null) continue;
      // a module put its own copy back: if the host's copy is here as a stand-in, the module's own one takes its place
      const d = descOf(e); let swapped = false;
      if (d) for (const [sid, m] of C.ents) {
        if (!m._mirror19 || Math.abs(m.x - e.x) > 0.3 || Math.abs(m.y - e.y) > 0.3) continue;
        const md = descOf(m); if (!md || md[0] !== d[0] || md[1] !== d[1]) continue;
        for (const k of ['dead', 'hidden', 'solid', 'hp', 'state']) if (m[k] !== undefined) e[k] = m[k];
        e._sid19 = sid; e._sbuf = m._sbuf; C.ents.set(sid, e); C.moving.delete(m); if (e._sbuf) C.moving.add(e);
        const j = es.indexOf(m); if (j >= 0) es.splice(j, 1); if (j >= 0 && j < i) i--;
        swapped = true; break;
      }
      if (!swapped) es.splice(i, 1);
    }
  }
  function guestUpdate(dt) {
    const t0 = now();
    G.time += dt;
    const c = Engine.cam, k = G.keys;
    if (G.fadeT > 0) G.fadeT -= dt;
    // keyboard turning eases in and out (the game's own feel)
    if (G.state === 'play') {
      let tin = clampN(edgeTurn * 0.9, -1, 1); if (k.q || k.arrowleft) tin -= 1; if (k.arrowright) tin += 1; tin = clampN(tin, -1, 1);
      G.turnV += (tin * 2.4 - G.turnV) * (1 - Math.exp(-(tin ? 11 : 18) * dt));
      if (!tin && Math.abs(G.turnV) < 0.02) G.turnV = 0;
      c.dir += G.turnV * dt;
    }
    for (const key in G.map.doors) { const d = G.map.doors[key]; if (d.open !== d.target) d.open = d.target > d.open ? Math.min(d.target, d.open + dt * 1.6) : Math.max(d.target, d.open - dt * 1.6); }
    if (G.attack.t > 0) G.attack.t -= dt;
    if (G.song.t > 0) G.song.t -= dt;
    if (G.hurtT > 0) G.hurtT -= dt;
    if (G.songFx > 0) G.songFx -= dt;
    // inputs: one per 1/30 s, predicted here at once and sent with the newest unacknowledged few
    C.acc += dt;
    const base = speedOf(C.spd);
    let moved = false;
    while (C.acc >= B.STEP) {
      C.acc -= B.STEP;
      const { wire, inp } = guestInput();
      C.prev = { x: C.st.x, y: C.st.y };
      stepMover(C.st, inp, base, guestCtx());
      inp.wire = wire; C.pending.push(inp); if (C.pending.length > B.IN_PENDING) C.pending.shift();
      send('sync.in', { k: [C.ep, C.lastQ], i: C.pending.slice(-B.IN_BATCH).map((i) => i.wire) }, false);
      moved = moved || Math.hypot(inp.f, inp.r) > 0.05;
    }
    // the camera: between the last two predicted steps, plus the decaying correction
    const a = C.acc / B.STEP, decay = Math.exp(-B.SMOOTH * dt);
    C.err.x *= decay; C.err.y *= decay;
    c.x = C.prev.x + (C.st.x - C.prev.x) * a + C.err.x; c.y = C.prev.y + (C.st.y - C.prev.y) * a + C.err.y;
    c.z = C.st.feet + 0.5; if (G.player) G.player.feet = C.st.feet;
    G.vel.x = C.st.vx; G.vel.y = C.st.vy;
    const sp = Math.hypot(C.st.vx, C.st.vy);
    if (sp > 0.1) { G.bobPhase += dt * 9 * Math.min(1, sp / base); c.bob = Math.sin(G.bobPhase) * 2 * Math.min(1, sp / base); if (G.time - G.lastStep > 0.45 * base / Math.max(0.5, sp)) { G.lastStep = G.time; try { Audio_.sfx.step(); } catch (e) { /* no audio yet */ } } }
    else c.bob = (c.bob || 0) * Math.exp(-13 * dt);
    const mx = c.x | 0, my = c.y | 0; if (mx >= 0 && my >= 0 && mx < G.map.w && my < G.map.h) G.map.visited[my * G.map.w + mx] = 1;
    // things this page's own modules add to the map later (banners, props) are not the host's: the host's own arrive
    // in its snapshots, so local ones go (a few times a second is plenty)
    if ((C.sweep = (C.sweep || 0) + 1) % 12 === 0) sweep();
    // everything else the host sent, drawn INTERP_MS behind
    const rt = now() - (C.offset || 0) - B.INTERP_MS, tmp = {};
    for (const e of C.moving) { if (!e._sbuf || !e._sbuf.length) { C.moving.delete(e); continue; } if (lerpAt(e._sbuf, rt, tmp)) { e.x = tmp.x; e.y = tmp.y; } if (e._sbuf.length && rt > e._sbuf[e._sbuf.length - 1].t + 500) C.moving.delete(e); }
    try { Engine.setFlicker(G.map.outdoor ? 1 : 0.92 + Math.sin(G.time * 11) * 0.03 + Math.sin(G.time * 23.7) * 0.03); } catch (e) { /* cosmetic */ }
    // what is under the crosshair (the same reading the game gives)
    const h = Engine.pick(G.ents, 3.2); let hint = '';
    if (h && !h.dead) hint = h.kind === 'npc' ? (NPCS[h.id] ? NPCS[h.id].name : (h.name || '')) : h.kind === 'enemy' ? h.def.name : h.kind === 'item' ? ITEMS[h.item].name : (h.label || '');
    const usable = h && !h.dead && (h.kind === 'npc' || h.kind === 'item' || (h.kind === 'deco' && h.use));
    G.hintKind = usable && h._screen && h._screen.dist <= USE_RANGE ? h.kind : '';
    if (hint !== G.hint) { G.hint = hint; const el = document.getElementById('hint'); if (el) el.textContent = hint; }
    const tl = now();
    if (tl - C.lastSnapAt > B.LOST_MS) { leave('lost'); return; }
    if (tl - C.lastSnapAt > 3000 && tl - C.helloAt > B.HELLO_MS && peerCount() > 0) { C.helloAt = tl; send('sync.hello', { v: B.V }, true); }   // the host lost us: ask again
    ST.cpu.frames++; cpu(now() - t0); rateTick();
  }
  function leave(why) {
    if (!C.on) return;
    const s = C.stash, c = Engine.cam;
    if (why !== 'lost') send('sync.bye', {}, true);
    C.on = false; C.stash = null; C.ents.clear(); C.moving.clear(); C.ring.clear(); C.applied.clear(); C.pending = []; C.hostBuf = [];
    G.flags = s.flags; G.maps = s.maps; G.tod = s.tod; G.day = s.day; G.escapeTimer = s.escapeTimer; G.boreHold = s.boreHold; G.vel.x = s.vel.x; G.vel.y = s.vel.y;
    if (typeof Weather !== 'undefined' && s.wx) Weather.load(s.wx);
    if (s.had) {
      G.player = s.player; G.player.feet = s.feet;
      G.map = s.map; G.mapId = s.mapId; G.ents = s.ents; Engine.setMap(s.map);
      c.x = s.cam.x; c.y = s.cam.y; c.dir = s.cam.dir; c.pitch = s.cam.pitch; c.z = s.cam.z;
      try { Audio_.setScene(s.map.music); } catch (e) { /* no audio yet */ }
      G.state = 'play'; G.keys = {};
      say(why === 'lost' ? TX.lost : TX.left, 'warn', 6000);
    } else {
      G.player = s.player; G.map = null; G.mapId = null; G.ents = [];
      try { closeModal(); } catch (e) { /* none */ }
      G.state = 'title'; G.keys = {}; try { show('#title'); Audio_.setScene('title'); } catch (e) { /* title absent */ }
    }
    C.standIn = false;
    emit('leave', { side: 'guest', why });
  }
  function guestPoll() {
    // not joined: ask to join while NET says we are a connected guest
    if (role() !== 'guest' || peerCount() === 0) return;
    const t = now(); if (t < C.fullUntil || t - C.helloAt < B.HELLO_MS) return;
    C.helloAt = t; send('sync.hello', { v: B.V }, true);
  }
  function onFlags(p, from) { if (!C.on || from !== C.peer || !p || typeof p.f !== 'object' || !p.f) return reject('flags'); cleanFlags(p.f, G.flags); }
  function onMsg(p, from) {
    if (!C.on || from !== C.peer || !p || typeof p.t !== 'string') return reject('msg');
    const cls = ['voice', 'warn', 'good', 'bad', ''].includes(p.c) ? p.c : '';
    say(plainStr(p.t, B.MSG_MAX), cls, 4500);   // msg() writes textContent: never markup
  }
  function onFull() { C.fullUntil = now() + 10000; say(TX.full, 'warn', 5000); }

  // ================================================================ the stand-in figure (procedural stand-in art)
  // Until PARTNER draws the travellers, each remote one is a plain townsperson sprite tinted toward a colour of its
  // own (host gold, guest teal), depth-tested like any sprite. Drawn by one post hook; nothing when no session.
  let fallbackOn = true, figSprite = null;
  const TINT = { host: [236, 196, 96], guest: [96, 214, 220] };
  function pickFigSprite() {
    if (figSprite && Engine.sprites[figSprite]) return Engine.sprites[figSprite];
    for (const n of ['harrow', 'aldric', 'herald', 'bettis', 'hetty', 'halder', 'proctor']) if (Engine.sprites[n]) { figSprite = n; return Engine.sprites[n]; }
    return null;
  }
  function drawFigures(F) {
    if (!fallbackOn || !(C.on || H.gs)) return;
    const sp = pickFigSprite(); if (!sp) return;
    for (const f of figures()) {
      const cam = F.cam, w = F.w, h = F.h, fb = F.fb, dbuf = F.dbuf;
      const dx = f.x - cam.x, dy = f.y - cam.y;
      const invDet = 1 / (F.planeX * F.dirY - F.dirX * F.planeY);
      const trX = invDet * (F.dirY * dx - F.dirX * dy), trY = invDet * (-F.planeY * dx + F.planeX * dy);
      if (trY <= 0.1) continue;
      const screenX = ((w / 2) * (1 + trX / trY)) | 0, sprH = Math.abs(h / trY) | 0; if (sprH < 3) continue;
      const sprW = Math.max(1, (sprH * sp.w / sp.h) | 0);
      const baseline = F.horizon + (((cam.z - (f.feet || 0)) * h / trY) | 0), dsY = baseline - sprH, dsX = screenX - ((sprW * (sp.cx == null ? 0.5 : sp.cx)) | 0);
      const xs = Math.max(0, dsX), xe = Math.min(w - 1, dsX + sprW - 1), ys = Math.max(0, dsY), ye = Math.min(h - 1, baseline - 1);
      if (xe < xs || ye < ys) continue;
      const tn = TINT[f.who] || TINT.guest, data = sp.data, tw = sp.w, th = sp.h, fog = clampN(1 - (trY - (F.fogDist || 12) * 0.6) / ((F.fogDist || 12) * 0.5), 0.15, 1);
      for (let x = xs; x <= xe; x++) {
        const tx = (((x - dsX) * tw) / sprW) | 0; if (tx < 0 || tx >= tw) continue;
        let o = ys * w + x;
        for (let y = ys; y <= ye; y++, o += w) {
          if (dbuf[o] < trY) continue;
          const px = data[((((y - dsY) * th) / sprH) | 0) * tw + tx]; if ((px >>> 24) < 128) continue;
          const r = ((px & 255) * 0.55 + tn[0] * 0.45) * fog, g = (((px >>> 8) & 255) * 0.55 + tn[1] * 0.45) * fog, b = (((px >>> 16) & 255) * 0.55 + tn[2] * 0.45) * fog;
          fb[o] = (0xff000000 | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0; dbuf[o] = trY;
        }
      }
    }
  }
  function figures() {
    const out = [];
    if (C.on) {
      const o = {}; if (lerpAt(C.hostBuf, now() - (C.offset || 0) - B.INTERP_MS, o)) out.push({ who: 'host', x: o.x, y: o.y, feet: o.feet, dir: o.dir, pitch: 0, act: o.act, ap: o.ap, spd: o.spd });
    } else if (H.gs && H.gs.map === G.mapId) {
      const g = H.gs, o = {};
      if (g.buf.length && g.gclock != null && lerpAt(g.buf, now() - g.gclock - B.INTERP_MS, o)) out.push({ who: 'guest', x: o.x, y: o.y, feet: o.feet, dir: o.dir, pitch: g.pitch, act: o.act, ap: o.ap / 15, spd: o.spd });
      else out.push({ who: 'guest', x: g.x, y: g.y, feet: g.feet, dir: g.dir, pitch: g.pitch, act: g.act, ap: g.ap / 15, spd: Math.hypot(g.vx, g.vy) });
    }
    return out;
  }

  // ================================================================ wrappers (each one: nobody joined = straight through)
  const ORIG = {};
  // where each map-built entity sits in its map as built (both sides build the same maps: seeded, deterministic)
  const BASE = new WeakMap();
  ORIG.buildAllMaps = buildAllMaps;
  buildAllMaps = function () {
    const maps = ORIG.buildAllMaps.apply(this, arguments);
    try { for (const id in maps) { const m = maps[id], n = Math.min(m.baseCount || 0, m.entities.length); for (let i = 0; i < n; i++) BASE.set(m.entities[i], i); } } catch (e) { /* bookkeeping only */ }
    return maps;
  };
  ORIG.update = update; ORIG.loadMap = loadMap; ORIG.interact = interact; ORIG.attack = attack; ORIG.castSong = castSong;
  ORIG.transfer = transfer; ORIG.snapshotGame = snapshotGame; ORIG.msg = msg; ORIG.renderSave = renderSave;
  update = function (dt) {
    if (C.on) { try { guestUpdate(dt); } catch (e) { console.warn('sync19: guest update failed', e); } return; }
    const r = ORIG.update.apply(this, arguments);
    if (T || Toverride || typeof NET19 !== 'undefined' || window.NET19) {
      bind();
      if (H.gs) { try { hostTick(); } catch (e) { console.warn('sync19: host tick failed', e); } }
      else if (T) guestPoll();
    }
    return r;
  };
  loadMap = function () {
    const r = ORIG.loadMap.apply(this, arguments);
    if (H.gs) { try { hostMapChanged(); } catch (e) { console.warn('sync19: map follow failed', e); } }
    return r;
  };
  interact = function () {
    if (!C.on) return ORIG.interact.apply(this, arguments);
    const e = Engine.pick(G.ents, USE_RANGE);
    if (e && !e.dead && e._sid19 != null) {
      if (e.kind === 'npc' || e.kind === 'item' || (e.kind === 'deco' && e.use)) { sendAction({ a: 'use', sid: e._sid19 }); return; }
      if (e.kind === 'enemy') { say(e.def.desc || e.def.name, '', 2500); return; }
      if (e.kind === 'deco') { try { say(decoLabel(e), '', 2500); } catch (err) { /* label is cosmetic */ } return; }
    }
    const w = Engine.pickWall(2.0);
    if (w && w.cell.door) {
      if (w.cell.portal) { say(TX.cantLeave, 'warn', 3000); return; }
      sendAction({ a: 'door', k: w.y * G.map.w + w.x }); return;
    }
    if (w) { try { say(wallLabel(w.cell), '', 1800); } catch (err) { /* cosmetic */ } }
  };
  attack = function (dirLabel) {
    if (!C.on) return ORIG.attack.apply(this, arguments);
    if (G.attack.t > 0 || G.song.t > 0) return;
    const w = currentWeapon();
    G.attack.t = w.speed; G.attack.dur = w.speed; G.attack.dirLabel = dirLabel;
    try { if (w.ammo) (w.ammo === 'bolts' ? Audio_.sfx.bow() : Audio_.sfx.shot()); else Audio_.sfx.swing(); } catch (e) { /* no audio yet */ }
    sendAction({ a: 'atk', dir: SWINGS.includes(dirLabel) ? dirLabel : 'thrust', w: clampN(G.player.weapon | 0, 0, 15) });
  };
  castSong = function (id) {
    if (!C.on) return ORIG.castSong.apply(this, arguments);
    if (G.song.t > 0 || G.attack.t > 0 || typeof id !== 'string') return;
    G.song.t = 0.7; G.songFx = 0.6;
    sendAction({ a: 'song', id });
  };
  transfer = function () {
    if (!C.on) return ORIG.transfer.apply(this, arguments);
    say(TX.cantLeave, 'warn', 3000);
  };
  snapshotGame = function () {
    if (!C.on) return ORIG.snapshotGame.apply(this, arguments);
    // while joined a save is of the guest's OWN world, never the host's
    if (C.standIn || !C.stash || !C.stash.had) throw new Error(TX.noSave);
    const s = C.stash, c = Engine.cam;
    const live = { maps: G.maps, map: G.map, mapId: G.mapId, ents: G.ents, flags: G.flags, tod: G.tod, day: G.day, wx: typeof Weather !== 'undefined' ? Weather.save() : null, cam: { x: c.x, y: c.y, dir: c.dir }, esc: G.escapeTimer, bore: G.boreHold, feet: G.player.feet };
    G.maps = s.maps; G.map = s.map; G.mapId = s.mapId; G.ents = s.ents; G.flags = s.flags; G.tod = s.tod; G.day = s.day; G.escapeTimer = s.escapeTimer; G.boreHold = s.boreHold; G.player.feet = s.feet;
    c.x = s.cam.x; c.y = s.cam.y; c.dir = s.cam.dir;
    if (typeof Weather !== 'undefined' && s.wx) Weather.load(s.wx);
    try { return ORIG.snapshotGame.apply(this, arguments); }
    finally {
      G.maps = live.maps; G.map = live.map; G.mapId = live.mapId; G.ents = live.ents; G.flags = live.flags; G.tod = live.tod; G.day = live.day; G.escapeTimer = live.esc; G.boreHold = live.bore; G.player.feet = live.feet;
      c.x = live.cam.x; c.y = live.cam.y; c.dir = live.cam.dir;
      if (typeof Weather !== 'undefined' && live.wx) Weather.load(live.wx);
    }
  };
  renderSave = function () {
    if (!C.on) return ORIG.renderSave.apply(this, arguments);
    try { closeModal(); } catch (e) { /* none */ }
    G.state = 'play'; say(TX.noSave, 'warn', 4000);
    return Promise.resolve();
  };
  msg = function (text, cls) {
    const r = ORIG.msg.apply(this, arguments);
    if (H.gs && cls === 'voice' && typeof text === 'string' && bucket(H.msgB, B.MSG_RATE, B.MSG_RATE)) send('sync.msg', { t: plainStr(text, B.MSG_MAX), c: 'voice' }, true);
    return r;
  };
  function sendAction(a) {
    if (!C.on || !a || typeof a !== 'object' || typeof a.a !== 'string') return false;
    if (jsonLen(a) > B.ACT_V_MAX + 64) return false;
    return !!send('sync.act', a, true);
  }

  // ---------------------------------------------------------------- listen
  on('sync.hello', onHello); on('sync.in', onIn); on('sync.act', onAct); on('sync.bye', onBye);
  on('sync.welcome', onWelcome); on('sync.map', onMap); on('sync.snap', onSnap); on('sync.flags', onFlags); on('sync.msg', onMsg); on('sync.full', onFull);
  bind();
  if (typeof Engine !== 'undefined' && Engine.addPostHook) Engine.addPostHook((F) => { try { drawFigures(F); } catch (e) { if (!drawFigures.warned) { drawFigures.warned = true; console.warn('sync19: figure draw failed', e); } } }, 9);

  // ================================================================ the API (see the contract at the top)
  const api = {
    B, TX, SWINGS,
    isHost: () => !!H.gs, isGuest: () => C.on, active: () => !!H.gs || C.on,
    guestState: publicGuest,
    onGuestAction(fn) { if (typeof fn === 'function') H.actFns.push(fn); },
    setGuestSpeed(v) { if (isNum(v)) H.spdAttr = clampN(v, 0, 100); },
    placeGuest(x, y, dir) {
      const g = H.gs; if (!g || !isNum(x) || !isNum(y) || !G.map) return false;
      g.x = clampN(x, 0.5, G.map.w - 0.5); g.y = clampN(y, 0.5, G.map.h - 0.5); g.vx = g.vy = 0; if (isNum(dir)) g.dir = wrapAng(dir);
      g.feet = (G.map.lvls || G.map.smooth) ? G.map.groundAt(g.x, g.y) : 0; g.buf = []; return true;
    },
    setGuestFrozen(b) { H.frozen = !!b; },
    tellGuest(text, cls) { if (!H.gs || typeof text !== 'string') return false; return !!send('sync.msg', { t: plainStr(text, B.MSG_MAX), c: ['voice', 'warn', 'good', 'bad', ''].includes(cls) ? cls : '' }, true); },
    extend(key, h) {
      if (!/^[a-z0-9_]{1,16}$/.test(key) || !h) return false;
      if (typeof h.host === 'function') H.ext.set(key, h);
      if (typeof h.guest === 'function') C.extFns.set(key, h.guest);
      return true;
    },
    sendAction, leave: () => leave('left'), figures,
    on(evt, fn) { if (EV[evt] && typeof fn === 'function') EV[evt].push(fn); },
    fallbackFigure(b) { fallbackOn = !!b; },
    stats() {
      rateTick();
      return {
        role: H.gs ? 'host' : C.on ? 'guest' : null, out: Object.assign({}, ST.out), in: Object.assign({}, ST.in), outN: Object.assign({}, ST.outN), inN: Object.assign({}, ST.inN),
        outRate: ST.outRate, inRate: ST.inRate, peakOut: ST.peakOut, peakIn: ST.peakIn,
        snaps: ST.snaps, snapAvg: ST.snaps ? Math.round(ST.snapBytes / ST.snaps) : 0, snapMax: ST.snapMax, snapEntsMax: ST.snapEntsMax, census: ST.census,
        msPerTick: ST.cpu.msPerFrame, msPerSec: ST.cpu.msPerSec || 0, msPeak: +ST.cpu.peak.toFixed(3), rejected: Object.assign({}, ST.rejected), inputs: ST.inputs, acts: ST.acts,
        recon: ST.recon, reconErr: +ST.reconErr.toFixed(4), reconErrMax: +ST.reconErrMax.toFixed(4), mapMismatch: ST.mapMismatch,
        pending: C.pending.length, ep: C.on ? C.ep : H.ep,
      };
    },
    resetStats() { for (const k of ['out', 'in', 'outN', 'inN', 'rejected']) ST[k] = {}; Object.assign(ST, { snaps: 0, snapBytes: 0, snapMax: 0, snapEntsMax: 0, census: 0, inputs: 0, acts: 0, recon: 0, reconErr: 0, reconErrMax: 0, peakOut: 0, peakIn: 0, mapMismatch: 0 }); ST.cpu.peak = 0; },
    useTransport(t) { Toverride = t || null; bind(); },
    // for tests
    _internal: { H, C, stepMover, decodeInput, blockedAt },
  };
  return api;
})();
window.SYNC19 = SYNC19;
