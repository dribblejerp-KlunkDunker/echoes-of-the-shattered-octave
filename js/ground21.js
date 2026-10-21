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
  const config = { lo: 2.5, hi: 3.5, perFrame: 2, worker: true };

  const st = { made: 0, genMs: 0, uploads: 0, slots: 0, cap: 0, pending: 0, errors: 0, worker: null, workerFailed: false, ctx: 0, lastFrameMs: 0, idxDirty: false, mipDirty: false, chunkSet: false };

  // ---------------------------------------------------------------------------------------------- settings
  let stored = null, mineChanging = false;
  function loadSettings() {
    try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o.on === 'boolean') stored = o.on; } catch (e) { /* no storage */ }
    if (stored !== null && typeof GFX !== 'undefined' && !originalish()) GFX[FLAG] = stored;
  }
  function saveSettings() { try { localStorage.setItem(KEY, JSON.stringify({ on: stored })); } catch (e) { /* no storage */ } }
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
    if (e.sum !== s && e.want !== s) { e.want = s; queue.push({ name, sum: s, base: new Uint8Array(new Uint8Array(d.buffer, d.byteOffset, d.length * 4)) }); pump(); }
    return e;
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
    st.made++; st.genMs += m.ms || 0;
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

  // ---------------------------------------------------------------------------------------------- Options row
  const ROW = ['p21-ground', 'Close-up detail', 'fine pixel-art detail on floors and walls up close (3D renderer)'];
  function syncRow() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = typeof GFX !== 'undefined' && GFX[FLAG] === true;
    b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function appendRow() {
    const grid = document.querySelector('#modal-panel .ctl-grid');
    if (!grid || document.getElementById(ROW[0]) || !document.getElementById('gfx-state')) return;
    const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.id = ROW[0] + '-label'; lab.textContent = ROW[1] + ' ';
    const small = document.createElement('small'); small.className = 'muted'; small.textContent = ROW[2]; lab.appendChild(small);
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
    b.onclick = () => setOn(!(GFX[FLAG] === true));
    const anchor = document.getElementById('r3d-cap');
    if (anchor && anchor.parentNode === grid) { anchor.insertAdjacentElement('afterend', b); anchor.insertAdjacentElement('afterend', lab); }
    else { grid.appendChild(lab); grid.appendChild(b); }
    syncRow();
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
    if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(() => { if (!mineChanging && stored !== null && GFX[FLAG] !== stored) { stored = null; saveSettings(); } syncRow(); });
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
    names: () => names.slice(), chunk: CHUNK, appendRow,
  };
})();
if (typeof window !== 'undefined') window.GROUND21 = GROUND21;
