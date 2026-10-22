// ============================================================
//  ground21 — Phase 21 "Wow", team GROUND: close-up detail for R3D's world surfaces.
//
//  Up close, R3D shows each 64 x 64 texel as a flat block many screen pixels wide (the eye sits 0.31 GL units over the
//  ground). For every floor, ground, wall and ceiling texture a map uses, js/ground21-art.js draws a 256 x 256 version in
//  real pixel art that agrees with the base texture's 16 x 16 block means; this module draws them in a Web Worker as the
//  maps need them, keeps them in a TEXTURE_2D_ARRAY (texture unit 8, with a layer -> slot table on unit 9), and replaces
//  R3D's 'ground' chunk so the world shader swaps the base texel for the detail texel wherever one base texel would cover
//  more than ~3 screen pixels (a 2.5..3.5 px fade, so there is no line). Nearest filtering within a level, R3D's mip rule
//  (NEAREST_MIPMAP_LINEAR, three levels), MSAA untouched. Units 8 and 9 only (CORE 0-5, SPRITES 6-7, LIGHT 14-15).
//
//  Switch: GFX.p21_ground (in GFX.FX: off in the Original preset, on in every other), Options row "Close-up detail".
//  Under the classic raycaster, and with the switch off, this module draws nothing (R3D's chunk goes back to CORE's no-op
//  uniforms: uGnd.x = 0), so the CPU frame and the Original preset are untouched byte for byte.
//  Optional ground cover (GFX.p21_groundCover, default on with p21_ground): see COVER below.
//  Loaded after js/r3d21.js (script tags: js/ground21-art.js, js/ground21.js). No saves, RNG, gameplay or story touched.
// ============================================================
'use strict';

const GROUND21 = (() => {
  const KEY = 'octave.ground21.v1';
  const FLAG = 'p21_ground';
  const ART = typeof GROUND21_ART !== 'undefined' ? GROUND21_ART : null;
  const UNIT_TEX = 8, UNIT_IDX = 9;
  const M = 256, LEVELS = 3, IDX_W = 1024;
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('ground21 ' + k, e); };

  if (typeof GFX !== 'undefined') {
    if (GFX[FLAG] === undefined) GFX[FLAG] = true;
    if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
  }
  // the fade band, in screen pixels per base texel
  const config = { lo: 2.5, hi: 3.5, perFrame: 2, worker: true, cache: true };

  const st = { made: 0, cacheHits: 0, genMs: 0, uploads: 0, slots: 0, cap: 0, pending: 0, errors: 0, worker: null, workerFailed: false, ctx: 0, lastFrameMs: 0, idxDirty: false, mipDirty: false, chunkSet: false };

  // ---------------------------------------------------------------------------------------------- settings
  let stored = null, storedCover = null, mineChanging = false;
  function loadSettings() {
    try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o.on === 'boolean') stored = o.on; if (o && typeof o.cover === 'boolean') storedCover = o.cover; } catch (e) { /* no storage */ }
    if (typeof GFX !== 'undefined' && !originalish()) { if (stored !== null) GFX[FLAG] = stored; if (storedCover !== null) GFX.p21_groundCover = storedCover; }
  }
  function saveSettings() { try { localStorage.setItem(KEY, JSON.stringify({ on: stored, cover: storedCover })); } catch (e) { /* no storage */ } }
  function originalish() {
    if (typeof GFX === 'undefined') return true;
    if (GFX.preset === 'plain' || GFX.preset === 'original') return true;
    try { return typeof PRESETS !== 'undefined' && PRESETS.current() === 'original'; } catch (e) { return false; }
  }
  function setOn(on) {
    mineChanging = true;
    try {
      GFX[FLAG] = !!on; stored = !!on; saveSettings();
      if (typeof PRESETS !== 'undefined') GFX.preset = PRESETS.current();
      GFX.changed();
      if (typeof PRESETS !== 'undefined' && PRESETS.refresh) PRESETS.refresh();
    } finally { mineChanging = false; }
    syncRow();
    return GFX[FLAG];
  }
  const enabled = () => typeof GFX !== 'undefined' && GFX[FLAG] === true && !!ART;

  // ---------------------------------------------------------------------------------------------- the detail store
  // name -> { sum (checksum of the base it was drawn from), data (Uint8Array 256*256*4) or null, want (sum queued),
  //           slot (layer in the GL array, -1), up (the context it was uploaded to) }
  const store = new Map();
  function texSum(d) { let h = 0x811c9dc5; const u = new Uint32Array(d.buffer, d.byteOffset, d.length); for (let i = 0; i < u.length; i += 7) h = Math.imul(h ^ u[i], 16777619); return h >>> 0; }
  const queue = [];
  function want(name) {
    if (!ART || !ART.wants(name)) return null;
    const d = typeof Engine !== 'undefined' && Engine.textures[name]; if (!d) return null;
    let e = store.get(name);
    if (!e) { e = { sum: 0, data: null, want: 0, slot: -1, up: -1, family: '' }; store.set(name, e); }
    const s = texSum(d);
    if (e.sum !== s && e.want !== s) {
      e.want = s;
      const job = { name, sum: s, base: new Uint8Array(new Uint8Array(d.buffer, d.byteOffset, d.length * 4)) };
      cacheGet(name, s).then((data) => { if (data) done({ name, sum: s, data: data.buffer, family: '', cached: true }); else { queue.push(job); pump(); } });
    }
    return e;
  }
  // ---- a per-device cache (IndexedDB) of drawn textures, as palette indices (~64 KB each), keyed by the art code's own
  // hash, the name and the base's checksum: a later visit shows the detail at once, and any change to the art or to a base
  // texture (a winter swap) misses the cache and draws afresh. Best effort: no storage, no cache.
  const ART_SIG = ART && ART.source ? (ART.hashStr(ART.source) >>> 0).toString(36) : '0';
  let dbP = null;
  function db() {
    if (dbP) return dbP;
    dbP = new Promise((res) => {
      try {
        if (typeof indexedDB === 'undefined') return res(null);
        const rq = indexedDB.open('octave-ground21', 1);
        rq.onupgradeneeded = () => { try { rq.result.createObjectStore('tex'); } catch (e) { /* exists */ } };
        rq.onsuccess = () => res(rq.result); rq.onerror = () => res(null); rq.onblocked = () => res(null);
      } catch (e) { res(null); }
    });
    return dbP;
  }
  const ckey = (name, sum) => ART_SIG + '|' + name + '|' + sum;
  function cacheGet(name, sum) {
    if (!config.cache) return Promise.resolve(null);
    return db().then((d) => new Promise((res) => {
      if (!d) return res(null);
      try {
        const rq = d.transaction('tex', 'readonly').objectStore('tex').get(ckey(name, sum));
        rq.onsuccess = () => {
          const v = rq.result; if (!v || !v.idx || !v.pal) return res(null);
          const idx = new Uint8Array(v.idx), pal = new Uint8Array(v.pal), out = new Uint8Array(M * M * 4);
          if (idx.length !== M * M) return res(null);
          for (let i = 0; i < M * M; i++) { const k = idx[i] * 3; out[i * 4] = pal[k]; out[i * 4 + 1] = pal[k + 1]; out[i * 4 + 2] = pal[k + 2]; out[i * 4 + 3] = 255; }
          st.cacheHits++; res(out);
        };
        rq.onerror = () => res(null);
      } catch (e) { res(null); }
    })).catch(() => null);
  }
  function cachePut(name, sum, data) {
    if (!config.cache) return;
    const map = new Map(), idx = new Uint8Array(M * M), pal = [];
    for (let i = 0; i < M * M; i++) {
      const k = (data[i * 4] << 16) | (data[i * 4 + 1] << 8) | data[i * 4 + 2];
      let v = map.get(k); if (v === undefined) { v = pal.length / 3; if (v > 255) return; map.set(k, v); pal.push(k >> 16, (k >> 8) & 255, k & 255); }
      idx[i] = v;
    }
    db().then((d) => { if (!d) return; try { d.transaction('tex', 'readwrite').objectStore('tex').put({ idx: idx.buffer, pal: new Uint8Array(pal).buffer }, ckey(name, sum)); } catch (e) { /* full or blocked */ } }).catch(() => {});
  }
  // generation: a Web Worker built from the art factory's own source (no extra file to fetch); the main thread, one
  // texture per idle slot, where workers are missing
  let busy = 0;
  function makeWorker() {
    if (st.worker || st.workerFailed || !config.worker || typeof Worker === 'undefined' || typeof Blob === 'undefined' || !ART.source) return st.worker;
    try {
      const src = 'const ART = ' + ART.source + ';\n' +
        'onmessage = function (e) { const m = e.data; const t0 = Date.now(); try { const r = ART.make(m.name, new Uint8Array(m.base)); ' +
        'postMessage({ name: m.name, sum: m.sum, data: r.data.buffer, family: r.family, err: r.err, ms: Date.now() - t0 }, [r.data.buffer]); } ' +
        'catch (err) { postMessage({ name: m.name, sum: m.sum, error: String(err && err.message || err) }); } };';
      const url = URL.createObjectURL(new Blob([src], { type: 'text/javascript' }));
      const w = new Worker(url);
      w.onmessage = (e) => { busy--; done(e.data); pump(); };
      w.onerror = (e) => { warnOnce('worker', e && e.message); st.workerFailed = true; st.worker = null; busy = 0; requeueAll(); pump(); };
      st.worker = w;
    } catch (e) { st.workerFailed = true; warnOnce('worker', e); }
    return st.worker;
  }
  const inflight = [];
  function requeueAll() { while (inflight.length) queue.unshift(inflight.pop()); }
  function pump() {
    if (!queue.length) return;
    const w = makeWorker();
    if (w) {
      while (queue.length && busy < 2) { const j = queue.shift(); busy++; inflight.push(j); try { w.postMessage({ name: j.name, sum: j.sum, base: j.base.buffer }, [j.base.buffer]); } catch (e) { busy--; warnOnce('post', e); } }
      return;
    }
    if (busy) return;
    busy = 1;
    setTimeout(() => {
      busy = 0;
      const j = queue.shift(); if (!j) return;
      const t0 = now();
      try { const r = ART.make(j.name, j.base); done({ name: j.name, sum: j.sum, data: r.data.buffer, family: r.family, err: r.err, ms: now() - t0 }); }
      catch (e) { done({ name: j.name, sum: j.sum, error: String(e) }); }
      pump();
    }, 16);
  }
  function done(m) {
    const k = inflight.findIndex(j => j.name === m.name && j.sum === m.sum); if (k >= 0) inflight.splice(k, 1);
    const e = store.get(m.name); if (!e) return;
    if (m.error) { st.errors++; warnOnce('make ' + m.name, m.error); if (e.want === m.sum) e.want = 0; return; }
    if (e.want !== m.sum) return;               // a newer base is on its way
    e.sum = m.sum; e.want = 0; e.data = new Uint8Array(m.data); e.family = m.family; e.err = m.err; e.up = -1;
    if (!m.cached) { st.made++; st.genMs += m.ms || 0; cachePut(m.name, m.sum, e.data); }
  }
  function pending() { let n = 0; for (const e of store.values()) if (e.want) n++; return n; }

  // ---------------------------------------------------------------------------------------------- GL
  const GS = { gl: null, tex: null, idx: null, idxData: new Uint8Array(IDX_W), cap: 0, ctx: 0, layerOf: new Map(), slotName: [] };
  function glInit(gl) {
    GS.gl = gl; GS.tex = null; GS.cap = 0; GS.ctx++; GS.layerOf = new Map(); GS.slotName = []; GS.idxData.fill(0); st.idxDirty = true;
    for (const e of store.values()) { e.slot = -1; e.up = -1; }
    GS.idx = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, GS.idx);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.R8UI, IDX_W, 1, 0, gl.RED_INTEGER, gl.UNSIGNED_BYTE, GS.idxData);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  }
  function ensureCap(gl, n) {
    if (GS.tex && n <= GS.cap) return;
    let cap = Math.max(16, GS.cap || 0); while (cap < n) cap *= 2;
    cap = Math.min(cap, Math.min(255, gl.getParameter(gl.MAX_ARRAY_TEXTURE_LAYERS) || 256));
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, t);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, LEVELS, gl.RGBA8, M, M, cap);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST_MIPMAP_LINEAR);   // R3D's world rule
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAX_LEVEL, LEVELS - 1);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.REPEAT); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.REPEAT);
    if (GS.tex) gl.deleteTexture(GS.tex);
    GS.tex = t; GS.cap = cap;
    // re-upload what the old array held
    for (let s = 0; s < GS.slotName.length; s++) { const e = store.get(GS.slotName[s]); if (e && e.data) upload(gl, s, e.data); }
  }
  // level 0 and the two smaller levels (box mips, computed here so only this layer is touched)
  const mipBuf = [new Uint8Array(128 * 128 * 4), new Uint8Array(64 * 64 * 4)];
  function upload(gl, slot, data) {
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, GS.tex);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, slot, M, M, 1, gl.RGBA, gl.UNSIGNED_BYTE, data);
    let src = data, w = M;
    for (let L = 1; L < LEVELS; L++) {
      const w2 = w >> 1, out = mipBuf[L - 1];
      for (let y = 0; y < w2; y++) for (let x = 0; x < w2; x++) for (let c = 0; c < 4; c++) {
        const a = ((y * 2) * w + x * 2) * 4 + c;
        out[(y * w2 + x) * 4 + c] = (src[a] + src[a + 4] + src[a + w * 4] + src[a + w * 4 + 4] + 2) >> 2;
      }
      gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, L, 0, 0, slot, w2, w2, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      src = out; w = w2;
    }
    st.uploads++;
  }
  // the texture names a map's mesh uses (ground, slopes' sides, walls, caps, ceilings, doors)
  function mapNames(m) {
    const T = Engine.textures, out = new Set();
    const add = (n) => { if (n && T[n]) out.add(n); };
    add(m.floor || 't_flag'); add('t_stone');
    if (m.floorTextures) for (const n of m.floorTextures) add(n);
    if (m.ceil) add(m.ceil);
    if (m.ceilTextures) for (const n of m.ceilTextures) add(n);
    if (m.sideTex) { const seen = new Set(); for (const n of m.sideTex) if (n && !seen.has(n)) { seen.add(n); add(n); } }
    if (m.cells) for (const c of m.cells) if (c && typeof c === 'object') { add(c.tex); add(c.capTex); }
    return Array.from(out);
  }
  let names = [], namesMap = null;
  function frame(F) {
    const t0 = now();
    const gl = R3D.gl(); if (!gl) return;
    if (GS.gl !== gl || !GS.idx) glInit(gl);
    if (!enabled()) return;
    const m = F.map; if (!m) return;
    if (namesMap !== m) { names = mapNames(m); namesMap = m; }
    let ups = 0;
    for (const n of names) {
      const e = want(n); if (!e) continue;
      const layer = R3D.worldTex(n); if (layer < 0 || layer >= IDX_W) continue;
      if (!e.data) continue;
      if (e.slot < 0) {
        if (GS.slotName.length >= 255) continue;
        e.slot = GS.slotName.length; GS.slotName.push(n); ensureCap(gl, GS.slotName.length);
      }
      if (e.up !== GS.ctx && ups < config.perFrame) { upload(gl, e.slot, e.data); e.up = GS.ctx; ups++; }
      if (e.up === GS.ctx && GS.idxData[layer] !== e.slot + 1) { GS.idxData[layer] = e.slot + 1; st.idxDirty = true; }
      GS.layerOf.set(n, layer);
    }
    if (st.idxDirty) { gl.bindTexture(gl.TEXTURE_2D, GS.idx); gl.texSubImage2D(gl.TEXTURE_2D, 0, 0, 0, IDX_W, 1, gl.RED_INTEGER, gl.UNSIGNED_BYTE, GS.idxData); st.idxDirty = false; }
    st.slots = GS.slotName.length; st.cap = GS.cap; st.pending = pending();
    st.lastFrameMs = now() - t0;
  }

  // ---------------------------------------------------------------------------------------------- the shader chunk
  const CHUNK = `
uniform highp sampler2DArray uGndTex; uniform highp usampler2D uGndIdx; uniform vec4 uGnd;   // x on, y fade start px, z fade end px
float gGroundK = 0.0;
vec4 r3dGround(vec4 c, vec2 uv, float layer, float mat, vec2 gdx, vec2 gdy) {
  gGroundK = 0.0;
  if (uGnd.x < 0.5 || mat == 2.0 || mat == 3.0) return c;
  uint di = texelFetch(uGndIdx, ivec2(int(layer + 0.5), 0), 0).r;
  if (di == 0u) return c;
  // screen pixels covered by one base texel (64 per tile), along the most squeezed axis so nothing shimmers
  float rho = 64.0 * max(length(gdx), length(gdy));
  float k = smoothstep(uGnd.y, uGnd.z, 1.0 / max(rho, 1e-6));
  if (k <= 0.0) return c;
  vec3 d = textureGrad(uGndTex, vec3(uv, float(di - 1u)), gdx, gdy).rgb;
  gGroundK = k;
  return vec4(mix(c.rgb, d, k), c.a);
}
`;
  function chunkUniforms(g, pr) {
    const u = pr.u; if (!u.uGnd) return;
    const on = enabled() && GS.tex && GS.gl === g;
    g.uniform4f(u.uGnd, on ? 1 : 0, config.lo, config.hi, 0);
    if (u.uGndTex) { g.uniform1i(u.uGndTex, UNIT_TEX); g.activeTexture(g.TEXTURE0 + UNIT_TEX); g.bindTexture(g.TEXTURE_2D_ARRAY, on ? GS.tex : null); }
    if (u.uGndIdx) { g.uniform1i(u.uGndIdx, UNIT_IDX); g.activeTexture(g.TEXTURE0 + UNIT_IDX); g.bindTexture(g.TEXTURE_2D, GS.idx || null); }
    g.activeTexture(g.TEXTURE0);
  }
  function installChunk() {
    if (st.chunkSet || typeof R3D === 'undefined' || !R3D.setChunk || !R3D.chunk || R3D.chunk('ground') === null) return false;
    try { R3D.setChunk('ground', CHUNK, { uniforms: chunkUniforms }); st.chunkSet = true; } catch (e) { warnOnce('chunk', e); }
    return st.chunkSet;
  }

  // ---------------------------------------------------------------------------------------------- COVER: ground cover
  // Sparse, deterministic small things on the ground near the player, in R3D only: grass tufts (two crossed quads that
  // sway a little) on grass and turf, pebbles on dirt and tracks, fallen leaves on woodland floors. Per cell, from a
  // hash of the cell and the map, so the same tufts stand in the same places on every visit and every machine. A pass
  // at order 35 (after the sprites, before BODY's 40): depth-tested against the scene but writing neither depth nor the
  // aux target, so picks, depthAt and materialAt answer exactly as without it. Lit through the 'shade' chunk (LIGHT's
  // lights reach it). No gameplay effect. Texture unit 10. Switch: GFX.p21_groundCover (off in Original, on elsewhere;
  // off with Reduce motion only stops the sway).
  const COVER_FLAG = 'p21_groundCover';
  if (typeof GFX !== 'undefined') {
    if (GFX[COVER_FLAG] === undefined) GFX[COVER_FLAG] = true;
    if (GFX.FX && !GFX.FX.includes(COVER_FLAG)) GFX.FX.push(COVER_FLAG);
  }
  const COVER = { radius: 7.5, perCell: { grass: 5, turf: 4, track: 3, dirt: 3, leaf: 0 }, n: 0, cellKey: '', vao: null, vbo: null, tex: null, prog: null, buf: new Float32Array(4096 * 12), ms: 0, ctx: -1 };
  const CV = 16, CV_LAYERS = 8;   // 16 x 16 sprites: 0-2 tufts, 3-4 pebbles, 5-6 leaves, 7 clover
  function coverArt() {
    // procedural stand-in pixel art in grey values (the floor's colour tints it in the shader); alpha 0/255
    const out = new Uint8Array(CV * CV * 4 * CV_LAYERS);
    const put = (L, x, y, v, a) => { if (x < 0 || y < 0 || x >= CV || y >= CV) return; const o = ((L * CV + y) * CV + x) * 4; out[o] = out[o + 1] = out[o + 2] = Math.max(0, Math.min(255, v)); out[o + 3] = a == null ? 255 : a; };
    let s = 0x5eed;
    const rnd = () => { s = (Math.imul(s, 1103515245) + 12345) >>> 0; return (s >>> 8) / 16777216; };
    for (let L = 0; L < 3; L++) {          // tufts: blades fanning up from the root, dark at the base and light at the tips
      const nb = 5 + L * 2;
      for (let b = 0; b < nb; b++) {
        let x = 7.5 + (rnd() - 0.5) * 3, lean = (b / (nb - 1) - 0.5) * (1.6 + L * 0.4) + (rnd() - 0.5) * 0.5;
        const h = 8 + Math.floor(rnd() * (6 + L));
        for (let k = 0; k < h; k++) { const t = k / (h - 1); put(L, Math.round(x + lean * t * t * 4), CV - 1 - k, Math.round(150 + 120 * t), 255); }
      }
    }
    for (let L = 3; L < 5; L++) {          // pebbles seen from above: lit top-left, shaded bottom-right
      const rx = L === 3 ? 4.5 : 3.2, ry = L === 3 ? 3.4 : 2.6;
      for (let y = 0; y < CV; y++) for (let x = 0; x < CV; x++) {
        const dx = (x - 7.5) / rx, dy = (y - 7.5) / ry, d = dx * dx + dy * dy;
        if (d <= 1) put(L, x, y, (dx + dy) < -0.5 ? 255 : (dx + dy) > 0.6 ? 150 : 205);
      }
    }
    for (let L = 5; L < 7; L++) {          // leaves: an oval with a midrib and a stem
      const ang = L === 5 ? 0.6 : -0.9, c = Math.cos(ang), sn = Math.sin(ang);
      for (let y = 0; y < CV; y++) for (let x = 0; x < CV; x++) {
        const u = (x - 7.5) * c + (y - 7.5) * sn, v = -(x - 7.5) * sn + (y - 7.5) * c, d = (u / 6) * (u / 6) + (v / 3) * (v / 3);
        if (d <= 1) put(L, x, y, Math.abs(v) < 0.6 ? 150 : v < 0 ? 235 : 195);
        else if (u < -5.5 && u > -8 && Math.abs(v) < 0.6) put(L, x, y, 140);
      }
    }
    for (const [ox, oy] of [[7, 4], [4, 9], [10, 9]]) for (let y = -2; y <= 2; y++) for (let x = -2; x <= 2; x++) if (x * x + y * y <= 4) put(7, ox + x, oy + y, (x < 0 || y < 0) ? 240 : 195);
    return out;
  }
  const COVER_VS = (R) => `
layout(location=0) in vec4 iPos;   // x, y (map), z (GL ground), rotation
layout(location=1) in vec4 iSize;  // w, h (GL), kind (0 upright cross, 1 flat), layer
layout(location=2) in vec4 iCol;   // tint rgb 0..1, sway amount
out vec2 vUV; flat out float vLayer; flat out vec3 vTint; out vec3 vPos; flat out float vFade;
void main() {
  int q = gl_VertexID / 6, c6 = gl_VertexID % 6;
  int cid = c6 == 0 ? 0 : c6 == 1 ? 1 : c6 == 2 ? 2 : c6 == 3 ? 0 : c6 == 4 ? 2 : 3;
  vec2 c = vec2(float(cid == 1 || cid == 2), float(cid >= 2));
  float a = iPos.w + float(q) * 1.5707963;
  vec3 p;
  if (iSize.z < 0.5) {
    vec3 R = vec3(cos(a), sin(a), 0.0);
    p = vec3(iPos.xy, iPos.z) + R * (c.x - 0.5) * iSize.x + vec3(0.0, 0.0, c.y * iSize.y);
    float sw = sin(uEye.w * 1.7 + iPos.x * 2.3 + iPos.y * 1.9) * iCol.w * c.y * c.y;
    p.xy += vec2(sw, sw * 0.6);
  } else {
    if (q == 1) { gl_Position = vec4(2.0, 2.0, 2.0, 1.0); vUV = vec2(0.0); vLayer = 0.0; vTint = vec3(0.0); vPos = vec3(0.0); vFade = 0.0; return; }
    vec3 R = vec3(cos(a), sin(a), 0.0), F2 = vec3(-sin(a), cos(a), 0.0);
    p = vec3(iPos.xy, iPos.z + 0.002) + R * (c.x - 0.5) * iSize.x + F2 * (c.y - 0.5) * iSize.y;
  }
  vPos = p; vUV = vec2(c.x, 1.0 - c.y); vLayer = iSize.w; vTint = iCol.rgb;
  float d = length(iPos.xy - uEye.xy); vFade = clamp((${R.toFixed(2)} - d) / 1.5, 0.0, 1.0);
  gl_Position = uViewProj * vec4(p, 1.0);
}`;
  const COVER_FS = `
uniform highp sampler2DArray uCov;
in vec2 vUV; flat in float vLayer; flat in vec3 vTint; in vec3 vPos; flat in float vFade;
layout(location=0) out vec4 oColor; layout(location=1) out vec4 oAux;
void main() {
  vec4 t = texture(uCov, vec3(vUV, vLayer));
  if (t.a < 0.5) discard;
  if (vFade < 0.999 && float(r3dBayer(ivec2(gl_FragCoord.xy))) >= vFade * 16.0) discard;
  R3DSurf s; s.albedo = vTint * t.r * 1.15; s.pos = vPos; s.nrm = vec3(0.0, 0.0, 1.0); s.side = 1.0; s.mat = 5.0; s.emissive = 0.0; s.fi = 1.0; s.ladd = vec3(0.0); s.kind = 0;
  oColor = vec4(r3dShade(s), 1.0); oAux = vec4(5.0 / 255.0, 0.0, 0.0, 1.0);
}`;
  const coverOn = () => typeof GFX !== 'undefined' && GFX[COVER_FLAG] === true && GFX[FLAG] === true;
  function familyOfTex(name) { return ART && ART.NAMES[name] || ''; }
  // the base texture's mean colour (0..1), cached per texture array
  const meanCache = new WeakMap();
  function meanOf(name) {
    const d = Engine.textures[name]; if (!d) return [0.4, 0.45, 0.3];
    let m = meanCache.get(d); if (m) return m;
    let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i++) { const px = d[i]; r += px & 255; g += (px >> 8) & 255; b += (px >> 16) & 255; }
    m = [r / d.length / 255, g / d.length / 255, b / d.length / 255]; meanCache.set(d, m); return m;
  }
  function h3(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1013904223)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function coverBuild(F) {
    const m = F.map, c = F.cam, R = COVER.radius, W = m.w, H = m.h;
    const key = m.id + ':' + Math.floor(c.x) + ':' + Math.floor(c.y) + ':' + (m.cells ? m.cells.length : 0);
    if (key === COVER.cellKey && COVER.n) return false;
    COVER.cellKey = key;
    const seed = ART ? ART.hashStr(String(m.id)) : 7, buf = COVER.buf; let n = 0;
    const floorDef = m.floor || 't_flag';
    const texAt = (cx, cy) => { if (m.floorCells && m.floorTextures) { const idx = m.floorCells[cy * W + cx]; if (idx && m.floorTextures[idx] && Engine.textures[m.floorTextures[idx]]) return m.floorTextures[idx]; } return floorDef; };
    const outdoor = !!F.outdoor;
    for (let cy = Math.max(0, Math.floor(c.y - R)); cy <= Math.min(H - 1, Math.floor(c.y + R)); cy++) {
      for (let cx = Math.max(0, Math.floor(c.x - R)); cx <= Math.min(W - 1, Math.floor(c.x + R)); cx++) {
        if (m.isBlocked && m.isBlocked(cx, cy)) continue;
        const dx = cx + 0.5 - c.x, dy = cy + 0.5 - c.y; if (dx * dx + dy * dy > (R + 0.7) * (R + 0.7)) continue;
        const name = texAt(cx, cy), fam = familyOfTex(name);
        let count = COVER.perCell[fam] || 0;
        const woods = /wood|grove|forest/i.test(String(m.id)) && outdoor;
        if (!count && !(woods && (fam === 'grass' || fam === 'dirt' || fam === 'track'))) continue;
        const tint = meanOf(name);
        const k = Math.floor(h3(cx, cy, seed) * (count + 1.999));
        for (let i = 0; i < k + (woods ? 1 : 0) && n < 4096; i++) {
          const fx = cx + 0.08 + 0.84 * h3(cx * 7 + i, cy * 13, seed + 1), fy = cy + 0.08 + 0.84 * h3(cx * 11, cy * 5 + i, seed + 2);
          const pick = h3(cx + i * 31, cy - i * 17, seed + 3);
          let kind = 0, layer = 0, w = 0.13, h = 0.1, sway = 0.006, tr = tint[0], tg = tint[1], tb = tint[2];
          if (fam === 'grass' || fam === 'turf') {
            if (pick < 0.08) { kind = 1; layer = 7; w = h = 0.07; tr *= 0.8; tg *= 1.15; tb *= 0.75; }        // clover
            else { layer = Math.floor(pick * 3) % 3; w = 0.12 + 0.06 * h3(cx, cy + i, seed + 4); h = 0.07 + 0.06 * h3(cy, cx + i, seed + 5); tr *= 0.95; tg *= 1.1; tb *= 0.85; }
          } else if (woods && pick < 0.55) {                                                                   // fallen leaves
            kind = 1; layer = 5 + (pick < 0.28 ? 0 : 1); w = h = 0.09 + 0.04 * pick; tr = 0.5 + 0.25 * pick; tg = 0.36 + 0.1 * pick; tb = 0.16; sway = 0;
          } else if (fam === 'track' && pick < 0.45) {
            layer = Math.floor(pick * 6) % 3; w = 0.1; h = 0.06; tr *= 0.95; tg *= 1.15; tb *= 0.8;
          } else {                                                                                             // pebbles
            kind = 1; layer = 3 + (pick < 0.5 ? 0 : 1); w = h = 0.05 + 0.04 * pick; const gr = Math.min(1, (tint[0] + tint[1] + tint[2]) / 3 * 1.4 + 0.08); tr = gr; tg = gr * 0.97; tb = gr * 0.9; sway = 0;
          }
          const z = R3D.groundGL(fx, fy);
          const o = n * 12;
          buf[o] = fx; buf[o + 1] = fy; buf[o + 2] = z; buf[o + 3] = h3(cx - i, cy + i, seed + 6) * 6.2831;
          buf[o + 4] = w; buf[o + 5] = h; buf[o + 6] = kind; buf[o + 7] = layer;
          buf[o + 8] = tr; buf[o + 9] = tg; buf[o + 10] = tb; buf[o + 11] = sway;
          n++;
        }
      }
    }
    COVER.n = n;
    return true;
  }
  function coverInit(gl) {
    COVER.ctx = GS.ctx; COVER.cellKey = ''; COVER.n = 0;
    COVER.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, COVER.tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, CV, CV, CV_LAYERS);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, CV, CV, CV_LAYERS, gl.RGBA, gl.UNSIGNED_BYTE, coverArt());
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    COVER.vao = gl.createVertexArray(); gl.bindVertexArray(COVER.vao);
    COVER.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, COVER.vbo); gl.bufferData(gl.ARRAY_BUFFER, COVER.buf.byteLength, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 4, gl.FLOAT, false, 48, i * 16); gl.vertexAttribDivisor(i, 1); }
    gl.bindVertexArray(null);
    if (!COVER.prog) COVER.prog = R3D.program(COVER_VS(COVER.radius), COVER_FS, {});
  }
  const coverPass = {
    name: 'p21_cover', order: 35,
    init(gl) { try { coverInit(gl); } catch (e) { warnOnce('cover init', e); } },
    enabled(F) { return coverOn() && !!F.outdoor; },
    draw(gl, F) {
      const t0 = now();
      if (!COVER.vao || !COVER.prog || !COVER.prog.p) return;
      if (coverBuild(F)) { coverSway(); gl.bindBuffer(gl.ARRAY_BUFFER, COVER.vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, COVER.buf.subarray(0, COVER.n * 12)); }
      if (!COVER.n) return;
      R3D.bindScene(gl, F);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE]);   // colour only: the aux target (materials) stays the world's
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(false); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
      const pr = R3D.use(COVER.prog);
      if (pr.u.uCov) { gl.activeTexture(gl.TEXTURE10); gl.bindTexture(gl.TEXTURE_2D_ARRAY, COVER.tex); gl.uniform1i(pr.u.uCov, 10); gl.activeTexture(gl.TEXTURE0); }
      gl.bindVertexArray(COVER.vao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 12, COVER.n);
      gl.bindVertexArray(null);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.depthMask(true);
      COVER.ms = now() - t0;
    },
  };
  // the sway respects Reduce motion
  function coverSway() { const rm = typeof GFX !== 'undefined' && GFX.reduceMotion; if (rm) for (let i = 0; i < COVER.n; i++) COVER.buf[i * 12 + 11] = 0; }

  // ---------------------------------------------------------------------------------------------- Options rows
  const ROW = ['p21-ground', 'Close-up detail', 'fine pixel-art detail on floors and walls up close (3D renderer)'];
  const ROW2 = ['p21-cover', 'Ground cover', 'grass tufts, pebbles and fallen leaves near you outdoors (3D renderer)'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    for (const [id, flag] of [[ROW[0], FLAG], [ROW2[0], COVER_FLAG]]) {
      const b = document.getElementById(id); if (!b) continue;
      const v = typeof GFX !== 'undefined' && GFX[flag] === true;
      b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
    }
  }
  function appendRow() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById(ROW[0]) || !document.getElementById('gfx-state')) return;
    let anchor = document.getElementById('r3d-cap');
    for (const [id, name, hint] of [ROW, ROW2]) {
      const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.id = id + '-label'; lab.textContent = name + ' ';
      const small = document.createElement('small'); small.className = 'muted'; small.textContent = hint; lab.appendChild(small);
      const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = id; b.type = 'button'; b.setAttribute('aria-label', name);
      b.onclick = id === ROW[0] ? () => setOn(!(GFX[FLAG] === true)) : () => setCover(!(GFX[COVER_FLAG] === true));
      if (anchor && anchor.parentNode === grid) { anchor.insertAdjacentElement('afterend', b); anchor.insertAdjacentElement('afterend', lab); anchor = b; }
      else { grid.appendChild(lab); grid.appendChild(b); }
    }
    syncRow();
  }
  function setCover(on) {
    mineChanging = true;
    try {
      GFX[COVER_FLAG] = !!on; storedCover = !!on; saveSettings();
      if (typeof PRESETS !== 'undefined') GFX.preset = PRESETS.current();
      GFX.changed();
      if (typeof PRESETS !== 'undefined' && PRESETS.refresh) PRESETS.refresh();
    } finally { mineChanging = false; }
    syncRow();
    return GFX[COVER_FLAG];
  }

  // ---------------------------------------------------------------------------------------------- wiring
  function wire() {
    if (typeof R3D === 'undefined' || !R3D.on) return;
    installChunk();
    R3D.on('frame', (F) => { try { if (!st.chunkSet) installChunk(); frame(F); } catch (e) { warnOnce('frame', e); } });
    R3D.on('restored', () => { GS.gl = null; GS.tex = null; GS.idx = null; st.chunkSet = st.chunkSet && !!R3D.chunk('ground'); });
    R3D.on('lost', () => { GS.gl = null; GS.tex = null; GS.idx = null; });
    R3D.on('mapchange', () => { namesMap = null; });
    R3D.on('meshbuilt', () => { namesMap = null; });
    try { R3D.addPass(coverPass); } catch (e) { warnOnce('cover pass', e); }
    if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => {
      if (!mineChanging && ((stored !== null && GFX[FLAG] !== stored) || (storedCover !== null && GFX[COVER_FLAG] !== storedCover))) { stored = null; storedCover = null; saveSettings(); }   // a preset took over
      syncRow();
    });
    if (typeof renderAccessibilityMenu === 'function') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () { const r = _acc.apply(this, arguments); try { appendRow(); } catch (e) { warnOnce('row', e); } return r; };
    }
  }
  loadSettings();
  try { wire(); } catch (e) { warnOnce('wire', e); }

  // tests and tools: make every texture a map uses now (returns a promise when they are all drawn)
  function prepare(list) {
    const gm = (typeof G !== 'undefined' && G && G.map) || null;   // the game's state (a global lexical binding)
    const ns = list || (gm ? mapNames(gm) : names);
    for (const n of ns) want(n);
    return new Promise((res) => { const tick = () => { if (!pending() && !queue.length) res(true); else setTimeout(tick, 50); }; tick(); });
  }
  return {
    KEY, FLAG, config, st, store, ART, setOn, enabled, mapNames, prepare, pending: () => pending() + queue.length,
    slotOf: (name) => { const e = store.get(name); return e ? e.slot : -1; }, detail: (name) => { const e = store.get(name); return e && e.data; },
    names: () => names.slice(), chunk: CHUNK, appendRow, setCover, cover: COVER, COVER_FLAG,
  };
})();
if (typeof window !== 'undefined') window.GROUND21 = GROUND21;
