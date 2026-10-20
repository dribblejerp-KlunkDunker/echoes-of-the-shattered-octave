// ============================================================
//  net19 — Phase 19 "Together", team NET: the transport and the lobby for two-player co-op.
//
//  ====================================================================================================================
//  THE NET19 API CONTRACT (v1). Teams SYNC and PARTNER code against exactly this; the signatures do not change.
//  ====================================================================================================================
//  Sessions are two players: one HOST (the world) and one GUEST. Nothing here runs, touches G, the canvas, the RNG or
//  the saves until a player presses Host or Join, so single-player is unchanged.
//
//  Lifecycle
//    NET19.host(opts?)        -> Promise<{ code }>   start hosting; code is the 6-letter join code ("KRT4MW", shown
//                                                    "KRT-4MW"). opts: { transport, name, code } (see Transports).
//    NET19.join(code, opts?)  -> Promise<void>       connect to a host; resolves once the host has said welcome.
//                                                    Rejects with Error whose .code is one of 'no-host' | 'full' |
//                                                    'version' | 'timeout' | 'bad-code' | 'transport'.
//    NET19.leave(reason?)     -> void                clean disconnect (the other side gets 'net:closed').
//    NET19.role()             -> 'host' | 'guest' | null    null = not in a session (single-player).
//    NET19.connected()        -> boolean             a guest/host is on the other end right now (handshake done).
//    NET19.peers()            -> [{ id: 'host'|'guest', name, state: 'open'|'lost', rtt }]   (0 or 1 entries)
//    NET19.stats()            -> { role, state, transport, code, rtt, rttAvg, sent, recv, bytesOut, bytesIn,
//                                  kbpsOut, kbpsIn, rejected, reasons: {why: n}, lost, reconnects, unreliable }
//                                state: 'idle' | 'hosting' (waiting for a guest) | 'connecting' | 'open' | 'lost' | 'closed'
//                                unreliable: true when {reliable:false} really goes over a lossy, unordered channel.
//
//  Messages
//    NET19.define(type, spec) -> void   REQUIRED before a type can be received (undefined types are dropped).
//         type: /^[a-z][a-z0-9_.:-]{0,31}$/ ; 'net.' is reserved. Use your team prefix: 'sync.*', 'partner.*'.
//         spec: { max: bytes of the whole frame (default 2048, hard cap 32768),
//                 rate: messages per second allowed from the peer (default 10), burst: (default 2*rate),
//                 from: 'host' | 'guest' | 'any' — who may SEND this type (default 'any'); anything else is dropped,
//                 validate(payload, meta) -> boolean — your shape/range check; throwing counts as false }
//         Every incoming frame is checked in this order: version byte, size (64 KB link cap, then spec.max), JSON,
//         envelope shape, depth <= 8 / <= 1024 keys / no __proto__-style keys, type known, sender role, rate, validate.
//         A failure drops the frame and counts it in stats().reasons; a flood of failures closes the link.
//    NET19.on(type, fn)       -> off()   fn(payload, meta) with meta = { from: 'host'|'guest', seq, reliable, at }
//         at = performance.now() on arrival. Unreliable frames older than the newest seen of the same type are dropped.
//         Lifecycle events come through on() too (no define needed):
//           'net:state'  { state }                 every state change
//           'net:peer'   { id, name }              the other player arrived (host: guest joined; guest: welcomed)
//           'net:lost'   { id }                    no word from them for lostMs; the host carries on alone meanwhile
//           'net:back'   { id, name }              the same player reconnected after a drop
//           'net:closed' { reason }                session over: 'left' | 'kicked' | 'gave-up' | 'full' | 'error' | 'local'
//    NET19.off(type, fn)
//    NET19.send(type, payload, { reliable = true }?) -> boolean
//         payload: plain JSON data (no functions, cycles, typed arrays). Returns false when nobody is connected, the type
//         is not defined/reserved, or the frame is larger than spec.max. reliable:true = ordered, never lost (events);
//         reliable:false = may be dropped or overtaken (state snapshots: send often, the newest wins).
//
//  Testing hooks (the same API on separate instances)
//    NET19.create(opts?)      -> a new, independent instance with this whole API (two in one page = host + guest)
//    NET19.loopbackPair(opts?)-> Promise<{ host, guest }> two fresh instances already connected in-page (no network);
//                                opts.loss (0..1) drops that share of unreliable frames, opts.latency adds ms each way.
//    NET19.configure(cfg)     -> merge { broker: { host, port, path, secure, key }, iceServers: [...], heartbeatMs,
//                                lostMs, giveUpMs, joinTimeoutMs } into the default config (tests point the broker at
//                                a local stub and set iceServers: [] so nothing reaches the internet).
//
//  Transports (opts.transport): 'peer' (default: PeerJS broker + WebRTC, js/vendor/peerjs.min.js, loaded on demand),
//    'bc' (BroadcastChannel: two tabs of the same browser, no network), 'loop' (two instances in one page), or an
//    injected object { name, listen(code, onLink) -> Promise, connect(code) -> Promise<link>, close() } where
//    link = { send(str, reliable) -> bool, close(), onmessage(str, reliable), onclose(), unreliable }.
//    The manual copy-paste path (no broker at all) is NET19.manual: hostOffer() -> Promise<offerCode>,
//    hostAccept(answerCode) -> Promise, guestAnswer(offerCode) -> Promise<answerCode>; the session then opens as above.
//  ====================================================================================================================
//
//  SECURITY: the other player is untrusted. Every frame is validated (above); nothing from the network is ever put into
//  markup (names go in through textContent and are cleaned: no control or bidi characters, at most 24 characters); no
//  eval; join and manual codes are parsed with fixed rules and size caps. Random codes come from crypto.getRandomValues,
//  never Math.random (the game's RNG order is untouched).
//  Keys: localStorage 'octave.net19.v1' (the name you play under; last code joined). Flags: none (prefix p19n_ reserved).
// ============================================================
'use strict';

const NET19 = (function () {
  const PROTO = 1;                                   // the version byte, first character of every frame
  const LINK_CAP = 65536;                            // no frame larger than this is even parsed
  const TYPE_CAP = 32768;                            // the largest spec.max a team may ask for
  const TYPE_RE = /^[a-z][a-z0-9_.:-]{0,31}$/;
  const CODE_ABC = '23456789ABCDEFGHJKMNPQRSTVWXYZ';   // no 0/O, 1/I/L, U (reads as V): easy to say over the phone
  const CODE_LEN = 6;
  const ID_PREFIX = 'octave19-';                     // PeerJS id = prefix + code (lower case)
  const BAD_KEYS = { __proto__: 1, constructor: 1, prototype: 1 };
  const NAME_MAX = 24;

  const DEFAULTS = {
    broker: { host: '0.peerjs.com', port: 443, path: '/', secure: true, key: 'peerjs' },  // PeerJS's free public broker
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }],                              // Google STUN
    heartbeatMs: 1000, lostMs: 4500, giveUpMs: 90000, joinTimeoutMs: 20000, reconnectMs: 2500,
    inRate: 240, inBurst: 480,                       // all frames per second from the peer, any type
    abuse: 400,                                      // rejected frames within 10 s that close the link
  };
  const CONFIG = JSON.parse(JSON.stringify(DEFAULTS));

  const warned = {};
  function warnOnce(k, e) { if (!warned[k]) { warned[k] = true; try { console.warn('net19 ' + k, e); } catch (e2) { /* no console */ } } }
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function err(code, text) { const e = new Error(text || code); e.code = code; return e; }

  // ---------------------------------------------------------------- small pure helpers (exported for tests)
  function randomCode() {
    const out = [], buf = new Uint32Array(CODE_LEN);
    crypto.getRandomValues(buf);
    for (let i = 0; i < CODE_LEN; i++) out.push(CODE_ABC[buf[i] % CODE_ABC.length]);
    return out.join('');
  }
  // what the guest typed (or a pasted join link) -> the code, or '' when it can't be one. Case, spaces and dashes are
  // forgiven; the alphabet has no look-alikes to confuse, so anything outside it is simply not a code.
  function normCode(s) {
    if (typeof s !== 'string' || s.length > 200) return '';
    // a pasted join link: take the code from #join=...
    const m = /[#&?]join=([A-Za-z0-9-]{4,16})/.exec(s);
    if (m) s = m[1];
    let c = s.toUpperCase().replace(/[\s\-_.]/g, '');
    if (c.length !== CODE_LEN) return '';
    for (const ch of c) if (CODE_ABC.indexOf(ch) < 0) return '';
    return c;
  }
  const showCode = (c) => (c && c.length === CODE_LEN ? c.slice(0, 3) + '-' + c.slice(3) : c || '');
  // control characters, bidi overrides and isolates, line/paragraph separators, zero-width characters, BOM, specials.
  // Built from code points so the source stays plain ASCII.
  const hex4 = (n) => '\\' + 'u' + ('000' + n.toString(16)).slice(-4);
  const STRIP_RE = new RegExp('[' + [[0x0, 0x1f], [0x7f, 0x9f], [0x200b, 0x200f], [0x2028, 0x202e], [0x2060, 0x206f], [0xfeff, 0xfeff], [0xfff9, 0xfffb]]
    .map(([a, b]) => hex4(a) + '-' + hex4(b)).join('') + ']', 'g');
  function cleanName(s) {
    if (typeof s !== 'string') return '';
    s = s.replace(STRIP_RE, '').replace(/\s+/g, ' ').trim();
    return Array.from(s).slice(0, NAME_MAX).join('');
  }
  // depth / key-count / dangerous-key check of parsed JSON
  function sane(v, depth, budget) {
    if (v === null || typeof v === 'number' || typeof v === 'boolean' || typeof v === 'string') return typeof v !== 'number' || Number.isFinite(v);
    if (typeof v !== 'object' || depth > 8) return false;
    if (Array.isArray(v)) { budget.n += v.length; if (budget.n > 1024) return false; for (const x of v) if (!sane(x, depth + 1, budget)) return false; return true; }
    const ks = Object.keys(v); budget.n += ks.length; if (budget.n > 1024) return false;
    for (const k of ks) { if (BAD_KEYS[k] === 1 || k === '__proto__') return false; if (!sane(v[k], depth + 1, budget)) return false; }
    return true;
  }
  function encodeFrame(type, seq, payload) { return String.fromCharCode(PROTO) + JSON.stringify([type, seq, payload === undefined ? null : payload]); }
  // -> { type, seq, payload } or { bad: reason }
  function decodeFrame(data) {
    if (typeof data !== 'string') return { bad: 'not-text' };
    if (data.length > LINK_CAP) return { bad: 'too-big' };
    if (data.length < 2) return { bad: 'short' };
    if (data.charCodeAt(0) !== PROTO) return { bad: 'version' };
    let a;
    try { a = JSON.parse(data.slice(1)); } catch (e) { return { bad: 'json' }; }
    if (!Array.isArray(a) || a.length !== 3) return { bad: 'shape' };
    const [type, seq, payload] = a;
    if (typeof type !== 'string' || !TYPE_RE.test(type)) return { bad: 'type' };
    if (!Number.isInteger(seq) || seq < 0 || seq > 0x7fffffff) return { bad: 'seq' };
    if (!sane(payload, 0, { n: 0 })) return { bad: 'deep' };
    return { type, seq, payload, size: data.length };
  }
  function bucket(rate, burst) { return { rate, burst, tokens: burst, t: now() }; }
  function take(b) {
    const t = now(); b.tokens = Math.min(b.burst, b.tokens + (t - b.t) * b.rate / 1000); b.t = t;
    if (b.tokens < 1) return false;
    b.tokens -= 1; return true;
  }
  function savedName() {
    try { const o = JSON.parse(localStorage.getItem('octave.net19.v1') || '{}'); return cleanName(o && o.name) || ''; } catch (e) { return ''; }
  }
  function defaultName() {
    const s = savedName(); if (s) return s;
    try { if (typeof G !== 'undefined' && G && G.player && typeof G.player.name === 'string') { const n = cleanName(G.player.name); if (n) return n; } } catch (e) { /* no game */ }
    return 'Traveller';
  }

  // ---------------------------------------------------------------- transports
  // A link is one live connection to the other player:
  //   { send(str, reliable) -> bool, close(), onmessage: fn(str, reliable), onclose: fn(), unreliable: bool, kind }
  // A transport makes links: host side listen(code, onLink) -> Promise<{ code }>, guest side connect(code) -> Promise<link>.

  // LOOP: two instances in one page. Delivery is asynchronous (a timer), like a real network, so code that works here
  // does not depend on same-tick delivery.
  const LOOP_HOSTS = new Map();
  function pairLinks(opts) {
    const o = opts || {}, loss = +o.loss || 0, latency = +o.latency || 0;
    let ls = 0x9e3779b9 >>> 0;
    const lossRng = () => { ls = (ls + 0x6d2b79f5) >>> 0; let t = ls; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
    const mk = () => ({ kind: 'loop', unreliable: loss > 0, open: true, onmessage: null, onclose: null });
    const a = mk(), b = mk();
    const deliver = (to, str, rel) => {
      if (!rel && loss > 0 && lossRng() < loss) return;   // test-only loss, own stream (never the game's Math.random)
      setTimeout(() => { if (to.open && to.onmessage) to.onmessage(str, rel); }, latency);
    };
    const closeBoth = () => {
      for (const l of [a, b]) if (l.open) { l.open = false; setTimeout(() => { if (l.onclose) l.onclose(); }, latency); }
    };
    a.send = (s, r) => { if (!a.open) return false; deliver(b, s, r !== false); return true; };
    b.send = (s, r) => { if (!b.open) return false; deliver(a, s, r !== false); return true; };
    a.close = b.close = closeBoth;
    return [a, b];
  }
  function loopTransport(opts) {
    let code = null;
    return {
      name: 'loop',
      listen(c, onLink) { code = c; LOOP_HOSTS.set(c, onLink); return Promise.resolve({ code: c }); },
      connect(c) {
        const onLink = LOOP_HOSTS.get(c);
        if (!onLink) return Promise.reject(err('no-host', 'No game with that code'));
        const [h, g] = pairLinks(opts);
        setTimeout(() => onLink(h), 0);
        return Promise.resolve(g);
      },
      close() { if (code && LOOP_HOSTS.get(code)) LOOP_HOSTS.delete(code); code = null; },
    };
  }

  // BC: two tabs of the same browser (same origin). A knock/accept exchange gives each guest connection its own id, so
  // a stale tab can't talk into a newer session. Messages are only strings; anything else on the channel is ignored.
  function bcTransport() {
    let ch = null, onLinkFn = null;
    const links = new Map();
    const rid = () => { const b = new Uint32Array(2); crypto.getRandomValues(b); return b[0].toString(36) + b[1].toString(36); };
    function mkLink(chan, me, them) {
      const l = { kind: 'bc', unreliable: false, open: true, onmessage: null, onclose: null };
      l.send = (s, r) => { if (!l.open) return false; try { chan.postMessage({ k: 'm', from: me, to: them, d: s, r: r !== false }); return true; } catch (e) { return false; } };
      l.close = () => { if (!l.open) return; l.open = false; try { chan.postMessage({ k: 'x', from: me, to: them }); } catch (e) { /* closed */ } setTimeout(() => { if (l.onclose) l.onclose(); }, 0); };
      l._remote = () => { if (!l.open) return; l.open = false; if (l.onclose) l.onclose(); };
      return l;
    }
    const okMsg = (m) => m && typeof m === 'object' && typeof m.k === 'string' && typeof m.from === 'string' && m.from.length < 40;
    return {
      name: 'bc',
      listen(c, onLink) {
        if (typeof BroadcastChannel !== 'function') return Promise.reject(err('transport', 'BroadcastChannel is not available'));
        onLinkFn = onLink; ch = new BroadcastChannel('octave.net19.' + c);
        const me = 'h' + rid();
        ch.onmessage = (ev) => {
          const m = ev.data; if (!okMsg(m)) return;
          if (m.k === 'knock') {
            const l = mkLink(ch, me, m.from); links.set(m.from, l);
            ch.postMessage({ k: 'accept', from: me, to: m.from });
            onLinkFn(l);
          } else if (m.to === me) {
            const l = links.get(m.from); if (!l) return;
            if (m.k === 'm' && typeof m.d === 'string') { if (l.open && l.onmessage) l.onmessage(m.d, m.r !== false); } else if (m.k === 'x') { links.delete(m.from); l._remote(); }
          }
        };
        return Promise.resolve({ code: c });
      },
      connect(c) {
        if (typeof BroadcastChannel !== 'function') return Promise.reject(err('transport', 'BroadcastChannel is not available'));
        const chan = new BroadcastChannel('octave.net19.' + c), me = 'g' + rid();
        return new Promise((resolve, reject) => {
          let link = null;
          const t = setTimeout(() => { if (!link) { chan.close(); reject(err('no-host', 'No game with that code')); } }, 1500);
          chan.onmessage = (ev) => {
            const m = ev.data; if (!okMsg(m) || m.to !== me) return;
            if (m.k === 'accept' && !link) { clearTimeout(t); link = mkLink(chan, me, m.from); link._host = m.from; const cl = link.close; link.close = () => { cl(); setTimeout(() => { try { chan.close(); } catch (e) { /* closed */ } }, 50); }; resolve(link); } else if (!link || m.from !== link._host) { /* not our host */ } else if (m.k === 'm' && typeof m.d === 'string') { if (link.open && link.onmessage) link.onmessage(m.d, m.r !== false); } else if (m.k === 'x') { link._remote(); try { chan.close(); } catch (e) { /* closed */ } }
          };
          chan.postMessage({ k: 'knock', from: me });
        });
      },
      close() { for (const l of links.values()) l.close(); links.clear(); if (ch) { const c2 = ch; setTimeout(() => { try { c2.close(); } catch (e) { /* closed */ } }, 50); } ch = null; },
    };
  }

  // PEER (PeerJS broker + WebRTC) and MANUAL (copy-paste offer/answer, no broker) are defined further down.
  let peerTransport = null, manualApi = null;   // filled in below
  function makeTransport(kind, opts, inst) {
    if (kind && typeof kind === 'object') return kind;                // injected (tests, or another team's stub)
    if (kind === 'loop') return loopTransport(opts);
    if (kind === 'bc') return bcTransport(opts);
    if (kind === 'peer' || !kind) return peerTransport(opts, inst);
    throw err('transport', 'Unknown transport ' + kind);
  }

  // ---------------------------------------------------------------- the session (one per instance)
  function create(createOpts) {
    const cfg = () => Object.assign({}, CONFIG, (createOpts && createOpts.config) || {});
    const handlers = new Map();                 // type -> Set(fn)
    const types = new Map();                    // type -> spec (+ bucket)
    const S = {
      role: null, state: 'idle', code: null, transport: null, tname: null,
      link: null, peer: null,                   // peer: { name, token, state }
      token: null,                              // guest: the token the host gave us (reconnect proof)
      myName: '', seqR: 0, seqU: 0, lastU: new Map(),
      heard: 0, pingN: 0, timers: [], inB: null, rejectsAt: [], joinWait: null, giveUpAt: 0, reconnecting: false,
      st: null,
    };
    function freshStats() {
      return { sent: 0, recv: 0, bytesOut: 0, bytesIn: 0, kbpsOut: 0, kbpsIn: 0, rtt: 0, rttAvg: 0, rejected: 0, reasons: {}, lost: 0, reconnects: 0, _wOut: 0, _wIn: 0, _wT: now() };
    }
    S.st = freshStats();

    function emit(type, payload, meta) {
      const set = handlers.get(type); if (!set) return;
      for (const fn of Array.from(set)) { try { fn(payload, meta || {}); } catch (e) { warnOnce('handler ' + type, e); } }
    }
    function setState(s) { if (S.state === s) return; S.state = s; emit('net:state', { state: s }); }

    function reject(why) {
      S.st.rejected++; S.st.reasons[why] = (S.st.reasons[why] || 0) + 1;
      const t = now(); S.rejectsAt.push(t);
      while (S.rejectsAt.length && t - S.rejectsAt[0] > 10000) S.rejectsAt.shift();
      if (S.rejectsAt.length > cfg().abuse && S.link) {
        S.rejectsAt = [];
        const l = S.link;
        if (S.role === 'host' && S.peer) S.peer.token = null;           // no coming back with that token
        dropLink(l, 'kicked');
      }
    }

    // ------------------------------------------------ sending
    function rawSend(link, type, payload, reliable) {
      if (!link || !link.open) return false;
      const seq = reliable ? (S.seqR = (S.seqR + 1) & 0x7fffffff) : (S.seqU = (S.seqU + 1) & 0x7fffffff);
      let f;
      try { f = encodeFrame(type, seq, payload); } catch (e) { warnOnce('encode ' + type, e); return false; }
      if (f.length > LINK_CAP) return false;
      const ok = link.send(f, reliable);
      if (ok) { S.st.sent++; S.st.bytesOut += f.length; S.st._wOut += f.length; }
      return ok;
    }
    function send(type, payload, opts) {
      if (typeof type !== 'string' || type.indexOf('net.') === 0) return false;
      const spec = types.get(type); if (!spec) return false;
      if (S.state !== 'open' || !S.link) return false;
      const reliable = !(opts && opts.reliable === false);
      let f;
      try { f = encodeFrame(type, 0, payload); } catch (e) { return false; }
      if (f.length + 10 > spec.max) return false;
      return rawSend(S.link, type, payload, reliable);
    }

    // ------------------------------------------------ receiving
    const SYS = {
      'net.hello': { max: 600, from: 'guest' }, 'net.welcome': { max: 600, from: 'host' }, 'net.full': { max: 200, from: 'host' },
      'net.ping': { max: 120, from: 'any' }, 'net.pong': { max: 120, from: 'any' }, 'net.bye': { max: 200, from: 'any' },
    };
    function onFrame(link, data, reliable) {
      if (link !== S.link && link !== S.pending) return;
      const fr = decodeFrame(data);
      if (fr.bad) return reject(fr.bad);
      if (!take(S.inB)) return reject('flood');
      const them = S.role === 'host' ? 'guest' : 'host';
      S.heard = now();
      S.st.recv++; S.st.bytesIn += fr.size; S.st._wIn += fr.size;
      if (fr.type.indexOf('net.') === 0) {
        const sp = SYS[fr.type]; if (!sp) return reject('unknown');
        if (fr.size > sp.max) return reject('size');
        if (sp.from !== 'any' && sp.from !== them) return reject('role');
        return system(link, fr);
      }
      if (link !== S.link || S.state === 'connecting') return reject('early');
      const spec = types.get(fr.type);
      if (!spec) return reject('unknown');
      if (fr.size > spec.max) return reject('size');
      if (spec.from !== 'any' && spec.from !== them) return reject('role');
      if (!take(spec.b)) return reject('rate');
      if (!reliable) {
        const last = S.lastU.get(fr.type);
        if (last != null && ((fr.seq - last) & 0x7fffffff) > 0x3fffffff) return reject('stale');   // older (wrap-safe)
        S.lastU.set(fr.type, fr.seq);
      }
      const meta = { from: them, seq: fr.seq, reliable: !!reliable, at: now() };
      let ok = false;
      try { ok = spec.validate ? spec.validate(fr.payload, meta) === true : true; } catch (e) { ok = false; }
      if (!ok) return reject('invalid');
      const set = handlers.get(fr.type); if (!set) return;
      for (const fn of Array.from(set)) { try { fn(fr.payload, meta); } catch (e) { warnOnce('handler ' + fr.type, e); } }
    }
    const isTok = (t) => typeof t === 'string' && /^[a-z0-9]{8,32}$/.test(t);
    function rtoken() { const b = new Uint32Array(3); crypto.getRandomValues(b); return Array.from(b, (x) => x.toString(36)).join('').slice(0, 20); }
    function system(link, fr) {
      const p = fr.payload;
      switch (fr.type) {
        case 'net.ping': if (p && typeof p.t === 'number' && Number.isFinite(p.t)) rawSend(link, 'net.pong', { t: p.t }, false); return;
        case 'net.pong': {
          if (!p || typeof p.t !== 'number' || !Number.isFinite(p.t)) return reject('invalid');
          const rtt = now() - p.t; if (rtt < 0 || rtt > 60000) return reject('invalid');
          S.st.rtt = Math.round(rtt); S.st.rttAvg = Math.round(S.st.rttAvg ? S.st.rttAvg * 0.8 + rtt * 0.2 : rtt);
          if (S.peer) S.peer.rtt = S.st.rtt;
          return;
        }
        case 'net.bye': if (link === S.link) dropLink(link, 'left', true); return;
        case 'net.hello': {         // host side
          if (S.role !== 'host' || link !== S.pending) return reject('early');
          if (!p || p.v !== PROTO) { rawSend(link, 'net.full', { why: 'version' }, true); return setTimeout(() => link.close(), 200); }
          const name = cleanName(p.name) || 'Traveller';
          const back = S.peer && S.peer.state === 'lost' && isTok(p.token) && p.token === S.peer.token;
          if (S.peer && !back) { rawSend(link, 'net.full', { why: 'full' }, true); S.pending = null; return setTimeout(() => link.close(), 200); }
          S.pending = null;
          if (S.link && S.link !== link) { try { S.link.close(); } catch (e) { /* gone */ } }
          S.link = link; S.lastU.clear();
          if (back) { S.peer.state = 'open'; S.peer.name = name; S.st.reconnects++; }
          else S.peer = { name, token: rtoken(), state: 'open', rtt: 0 };
          rawSend(link, 'net.welcome', { v: PROTO, name: S.myName, token: S.peer.token }, true);
          S.heard = now(); setState('open');
          emit(back ? 'net:back' : 'net:peer', { id: 'guest', name });
          return;
        }
        case 'net.welcome': {       // guest side
          if (S.role !== 'guest' || link !== S.pending) return reject('early');
          if (!p || p.v !== PROTO || !isTok(p.token)) return reject('invalid');
          const back = !!S.peer;
          S.pending = null; S.link = link; S.token = p.token; S.lastU.clear();
          S.peer = { name: cleanName(p.name) || 'Host', state: 'open', rtt: 0 };
          if (back) S.st.reconnects++;
          S.heard = now(); S.reconnecting = false; setState('open');
          emit(back ? 'net:back' : 'net:peer', { id: 'host', name: S.peer.name });
          if (S.joinWait) { const w = S.joinWait; S.joinWait = null; w.resolve(); }
          return;
        }
        case 'net.full': {
          if (S.role !== 'guest') return reject('role');
          const why = p && p.why === 'version' ? 'version' : 'full';
          if (S.joinWait) { const w = S.joinWait; S.joinWait = null; w.reject(err(why, why === 'version' ? 'That game is a different version' : 'That game already has two players')); }
          finish(why === 'version' ? 'error' : 'full');
          return;
        }
      }
    }

    // ------------------------------------------------ links coming and going
    function adopt(link) {
      link.onmessage = (data, rel) => { try { onFrame(link, data, rel); } catch (e) { warnOnce('frame', e); } };
      link.onclose = () => { if (link === S.link) linkLost(link); else if (link === S.pending) S.pending = null; };
    }
    function hostOnLink(link) {
      if (S.role !== 'host' || S.state === 'closed') { try { link.close(); } catch (e) { /* gone */ } return; }
      adopt(link);
      // one handshake at a time; a newer knock replaces an unfinished one
      if (S.pending && S.pending !== link) { try { S.pending.close(); } catch (e) { /* gone */ } }
      S.pending = link;
      setTimeout(() => { if (S.pending === link) { S.pending = null; try { link.close(); } catch (e) { /* gone */ } } }, 8000);
    }
    function linkLost(link) {
      if (link !== S.link) return;
      if (S.state === 'closed' || S.state === 'idle') return;
      S.link = null;
      if (S.peer) S.peer.state = 'lost';
      S.st.lost++;
      setState('lost');
      emit('net:lost', { id: S.role === 'host' ? 'guest' : 'host' });
      S.giveUpAt = now() + cfg().giveUpMs;
      if (S.role === 'guest') tryReconnect();
    }
    function dropLink(link, reason, remote) {
      // a deliberate end of this link: bye (theirs) or kick (ours)
      if (link !== S.link) return;
      S.link = null;
      if (!remote) { try { rawSend(link, 'net.bye', { why: reason }, true); } catch (e) { /* gone */ } }
      setTimeout(() => { try { link.close(); } catch (e) { /* gone */ } }, 100);
      if (S.role === 'host') {
        S.peer = null; S.lastU.clear();
        emit('net:closed', { reason, id: 'guest' });
        setState('hosting');                    // the host carries on and can take a new guest
      } else finish(reason);
    }
    function tryReconnect() {
      if (S.role !== 'guest' || S.reconnecting || S.state !== 'lost') return;
      if (now() > S.giveUpAt) { finish('gave-up'); return; }
      S.reconnecting = true;
      let p;
      try { p = S.transport.connect(S.code, { reconnect: true }); } catch (e) { p = Promise.reject(e); }
      p.then((link) => {
        if (S.state !== 'lost') { try { link.close(); } catch (e) { /* gone */ } return; }
        adopt(link); S.pending = link;
        rawSend(link, 'net.hello', { v: PROTO, name: S.myName, token: S.token }, true);
        setTimeout(() => { if (S.pending === link) { S.pending = null; try { link.close(); } catch (e) { /* gone */ } S.reconnecting = false; } }, 6000);
      }).catch(() => { S.reconnecting = false; });
    }

    // ------------------------------------------------ heartbeat
    function tick() {
      const c = cfg(), t = now();
      if (S.state === 'open' && S.link) {
        rawSend(S.link, 'net.ping', { t: Math.round(t * 10) / 10 }, false);
        if (t - S.heard > c.lostMs) linkLost(S.link);
      } else if (S.state === 'lost') {
        if (t > S.giveUpAt) {
          if (S.role === 'guest') finish('gave-up');
          else { S.peer = null; emit('net:closed', { reason: 'gave-up', id: 'guest' }); setState('hosting'); }
        } else if (S.role === 'guest') tryReconnect();
      }
      const dt = (t - S.st._wT) / 1000;
      if (dt >= 1) { S.st.kbpsOut = Math.round(S.st._wOut / dt / 102.4) / 10; S.st.kbpsIn = Math.round(S.st._wIn / dt / 102.4) / 10; S.st._wOut = S.st._wIn = 0; S.st._wT = t; }
    }
    function startTimers() { stopTimers(); S.timers.push(setInterval(tick, cfg().heartbeatMs)); }
    function stopTimers() { for (const t of S.timers) clearInterval(t); S.timers = []; }

    // ------------------------------------------------ public lifecycle
    function reset(role, tname) {
      S.role = role; S.tname = tname; S.link = null; S.pending = null; S.peer = null; S.token = null;
      S.seqR = S.seqU = 0; S.lastU.clear(); S.rejectsAt = []; S.st = freshStats(); S.reconnecting = false;
      const c = cfg(); S.inB = bucket(c.inRate, c.inBurst);
      S.myName = defaultName();
    }
    function finish(reason) {
      const was = S.role;
      stopTimers();
      if (S.link) { try { S.link.close(); } catch (e) { /* gone */ } }
      if (S.pending) { try { S.pending.close(); } catch (e) { /* gone */ } }
      if (S.transport) { try { S.transport.close(); } catch (e) { /* gone */ } }
      if (S.joinWait) { const w = S.joinWait; S.joinWait = null; w.reject(err(reason === 'full' ? 'full' : 'transport', 'Connection closed')); }
      S.link = S.pending = null; S.transport = null; S.peer = null; S.role = null; S.code = null;
      if (was) { setState('closed'); emit('net:closed', { reason }); }
      S.state = 'idle';
    }
    function host(opts) {
      const o = opts || {};
      if (S.role) finish('local');
      reset('host', typeof o.transport === 'object' ? (o.transport.name || 'custom') : (o.transport || 'peer'));
      if (o.name) S.myName = cleanName(o.name) || S.myName;
      let tr;
      try { tr = makeTransport(o.transport, o, api); } catch (e) { S.role = null; return Promise.reject(e); }
      S.transport = tr;
      const want = normCode(o.code || '') || randomCode();
      setState('connecting');
      return Promise.resolve(tr.listen(want, hostOnLink)).then((r) => {
        if (S.transport !== tr) throw err('transport', 'Stopped');
        S.code = (r && r.code) || want;
        setState('hosting'); startTimers();
        return { code: S.code };
      }).catch((e) => { if (S.transport === tr) { S.role = null; S.transport = null; try { tr.close(); } catch (e2) { /* gone */ } setState('idle'); } throw e; });
    }
    function join(code, opts) {
      const o = opts || {};
      const c = normCode(code);
      if (!c) return Promise.reject(err('bad-code', 'That is not a join code'));
      if (S.role) finish('local');
      reset('guest', typeof o.transport === 'object' ? (o.transport.name || 'custom') : (o.transport || 'peer'));
      if (o.name) S.myName = cleanName(o.name) || S.myName;
      let tr;
      try { tr = makeTransport(o.transport, o, api); } catch (e) { S.role = null; return Promise.reject(e); }
      S.transport = tr; S.code = c;
      setState('connecting');
      return new Promise((resolve, reject) => {
        S.joinWait = { resolve, reject };
        const to = setTimeout(() => { if (S.joinWait) { S.joinWait = null; finish('error'); reject(err('timeout', 'The host did not answer')); } }, cfg().joinTimeoutMs);
        const done = (f) => (v) => { clearTimeout(to); f(v); };
        S.joinWait = { resolve: done(resolve), reject: done(reject) };
        Promise.resolve(tr.connect(c)).then((link) => {
          if (S.transport !== tr) { try { link.close(); } catch (e) { /* gone */ } return; }
          adopt(link); S.pending = link;
          startTimers();
          rawSend(link, 'net.hello', { v: PROTO, name: S.myName, token: null }, true);
        }).catch((e) => {
          if (S.joinWait) { const w = S.joinWait; S.joinWait = null; S.role = null; S.transport = null; try { tr.close(); } catch (e2) { /* gone */ } setState('idle'); w.reject(e && e.code ? e : err('transport', (e && e.message) || 'Could not connect')); }
        });
      });
    }
    // The manual path hands a finished link to the session directly (no join code, no reconnect).
    function adoptManual(role, link, tr) {
      if (S.role) finish('local');
      reset(role, 'manual');
      S.transport = tr; S.code = null;
      adopt(link);
      startTimers();
      if (role === 'host') { setState('hosting'); S.pending = link; } else {
        setState('connecting'); S.pending = link;
        return new Promise((resolve, reject) => {
          S.joinWait = { resolve, reject };
          rawSend(link, 'net.hello', { v: PROTO, name: S.myName, token: null }, true);
        });
      }
      return Promise.resolve();
    }
    function leave(reason) {
      if (!S.role) return;
      if (S.link) { try { rawSend(S.link, 'net.bye', { why: 'left' }, true); } catch (e) { /* gone */ } }
      const l = S.link; S.link = null;
      setTimeout(() => { try { if (l) l.close(); } catch (e) { /* gone */ } }, 120);
      finish(reason || 'local');
    }

    const api = {
      PROTO,
      host, join, leave,
      role: () => S.role,
      connected: () => S.state === 'open' && !!S.link,
      code: () => S.code,
      peers: () => (S.peer ? [{ id: S.role === 'host' ? 'guest' : 'host', name: S.peer.name, state: S.peer.state, rtt: S.st.rtt }] : []),
      stats: () => ({
        role: S.role, state: S.state, transport: S.tname, code: S.code, rtt: S.st.rtt, rttAvg: S.st.rttAvg,
        sent: S.st.sent, recv: S.st.recv, bytesOut: S.st.bytesOut, bytesIn: S.st.bytesIn, kbpsOut: S.st.kbpsOut, kbpsIn: S.st.kbpsIn,
        rejected: S.st.rejected, reasons: Object.assign({}, S.st.reasons), lost: S.st.lost, reconnects: S.st.reconnects,
        unreliable: !!(S.link && S.link.unreliable), name: S.myName,
      }),
      define(type, spec) {
        if (typeof type !== 'string' || !TYPE_RE.test(type) || type.indexOf('net.') === 0) throw err('type', 'Bad message type ' + type);
        const s = spec || {};
        const rate = Math.max(0.1, Math.min(240, +s.rate || 10));
        const d = {
          max: Math.max(32, Math.min(TYPE_CAP, Math.floor(+s.max || 2048))),
          rate, burst: Math.max(1, Math.min(480, Math.floor(+s.burst || rate * 2))),
          from: s.from === 'host' || s.from === 'guest' ? s.from : 'any',
          validate: typeof s.validate === 'function' ? s.validate : null,
        };
        d.b = bucket(d.rate, d.burst);
        types.set(type, d);
      },
      defined: (type) => types.has(type),
      on(type, fn) {
        if (typeof fn !== 'function') return () => {};
        if (!handlers.has(type)) handlers.set(type, new Set());
        handlers.get(type).add(fn);
        return () => api.off(type, fn);
      },
      off(type, fn) { const s = handlers.get(type); if (s) s.delete(fn); },
      send,
      setName(n) { const c = cleanName(n); if (c) S.myName = c; return S.myName; },
      _adoptManual: adoptManual,
      _state: S,
    };
    return api;
  }

  // ---------------------------------------------------------------- PeerJS transport (filled in below the contract commit)
  peerTransport = function () { throw err('transport', 'PeerJS transport not built yet'); };

  // ---------------------------------------------------------------- the default instance and the module object
  const main = create();
  function loopbackPair(opts) {
    const h = create(), g = create(), code = randomCode();
    const tr = loopTransport(opts);
    return h.host({ transport: tr, code, name: (opts && opts.hostName) || 'Host' }).then(() => g.join(code, { transport: loopTransport(opts), name: (opts && opts.guestName) || 'Guest' })).then(() => ({ host: h, guest: g, code }));
  }
  const NET = Object.assign(main, {
    create, loopbackPair,
    configure(c) {
      if (!c || typeof c !== 'object') return Object.assign({}, CONFIG);
      if (c.broker && typeof c.broker === 'object') CONFIG.broker = Object.assign({}, CONFIG.broker, c.broker);
      if (Array.isArray(c.iceServers)) CONFIG.iceServers = c.iceServers.slice();
      for (const k of ['heartbeatMs', 'lostMs', 'giveUpMs', 'joinTimeoutMs', 'reconnectMs', 'abuse', 'inRate', 'inBurst']) if (Number.isFinite(+c[k]) && +c[k] > 0) CONFIG[k] = +c[k];
      return JSON.parse(JSON.stringify(CONFIG));
    },
    _pure: { randomCode, normCode, showCode, cleanName, encodeFrame, decodeFrame, sane, CODE_ABC, CODE_LEN, ID_PREFIX, LINK_CAP, TYPE_CAP },
    _transports: { loop: loopTransport, bc: bcTransport, pairLinks },
  });
  return NET;
})();
if (typeof window !== 'undefined') window.NET19 = NET19;
