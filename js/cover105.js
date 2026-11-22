// ============================================================
//  cover105 — Phase 105, "Ground cover": small things on the ground near your feet, outdoors, in the 3D renderer.
//
//  The owner, 20 Nov: "add the ground details". They come from Phase 21's close-up ground (PR #44, closed because
//  Phase 77's "Sharp walls and ground" replaced its textures): the ground cover was the part Phase 77 does not have.
//  Grass tufts (two crossed blades of card that sway a little) and the odd clover on grass and turf, pebbles on dirt
//  and tracks, fallen leaves on woodland floors. Where each one stands comes from a hash of the cell and the map, so
//  the same tufts stand in the same places on every visit and every machine. No random numbers anywhere.
//
//  It is an R3D pass at order 35 (after the sprites, before the bodies' 40): depth-tested against the scene but writing
//  neither depth nor the aux target, so picks, depthAt and materialAt answer exactly as without it. Lit through the
//  'shade' chunk, so the sun, the lamps and the fog reach it. Texture unit 13. Nothing in play changes.
//
//  Switch: GFX.groundCover (in GFX.FX: off in Original and Low, on in every other preset); Options row "Ground cover".
//  Reduce motion stops the sway. Under the classic renderer nothing is drawn.
//  COVER105.cover (n, buf, cellKey, ms), COVER105.familyOf(textureName), COVER105.on() for tests.
// ============================================================
'use strict';

const COVER105 = (() => {
  const FLAG = 'groundCover';
  if (typeof GFX !== 'undefined') {
    // a returning player's preset was applied before this file loaded (js/max20.js): start as that preset wants
    if (typeof PRESETS !== 'undefined' && PRESETS.keep) PRESETS.keep(FLAG); else if (GFX[FLAG] === undefined) GFX[FLAG] = true;   // the player's own choice, kept across launches
    if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
  }
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('cover105 ' + k, e); };
  const now = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
  function h3(x, y, s) { let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1013904223)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return h >>> 0; }

  // ------------------------------------------------------------------------------------------ what kind of ground
  // the textures Phase 21 knew; anything newer is judged by its colour (green: grass; brown: dirt), and stone, snow,
  // chalk, water, boards and the rest get nothing
  const NAMES = {
    t_grass: 'grass', p17c_turf: 'turf', p17c_turf2: 'turf', t_moss: 'dirt', t_p20_track: 'track',
    t_cobble: '', p17c_mole: '', c_rock: '', t_flag: '', p17c_flags: '', t_stone: '', t_wood: '', p17c_plank: '',
    p16k_deck: '', ln17_snow: '', p17p_snow: '', p17p_snowroad: '', t_p20_chalk: '', t_water: '', t_shallows: '',
    t_marble: '', t_greymarble: '', t_mausoleum: '', t_catacomb: '', p17c_quay: '', t_glassrock: '', p16h_rock: '',
  };
  const NEVER = /water|shallow|mist|snow|ice|chalk|marble|plank|deck|board|stone|cobble|flag|tile|slate|roof|brass|rail|glass|void|sand|lava|ash|ember|salt|bone|metal|iron|brick|quay|road/i;
  const famCache = new Map();
  function familyOf(name) {
    if (!name) return '';
    if (name in NAMES) return NAMES[name];
    if (famCache.has(name)) return famCache.get(name);
    // a later phase's variant of a known tile (t_grass_p20b_a is Oakhaven's grass, worn four ways) is that tile
    const base = name.replace(/(_p\d+[a-z]*_[a-z0-9]+)+$/, '');
    if (base !== name && base in NAMES) { famCache.set(name, NAMES[base]); return NAMES[base]; }
    let f = '';
    const d = typeof Engine !== 'undefined' && Engine.textures[name];
    if (d && !NEVER.test(name)) {
      const m = meanOf(name), r = m[0] * 255, g = m[1] * 255, b = m[2] * 255, mx = Math.max(r, g, b), mn = Math.min(r, g, b);
      const s = mx ? (mx - mn) / mx : 0;
      let hue = 0; if (mx > mn) { if (mx === r) hue = 60 * (((g - b) / (mx - mn)) % 6); else if (mx === g) hue = 60 * ((b - r) / (mx - mn) + 2); else hue = 60 * ((r - g) / (mx - mn) + 4); }
      if (hue < 0) hue += 360;
      if (hue > 60 && hue < 160 && s > 0.2 && mx > 40) f = /moss|turf|lawn|meadow|grass|green|field|heath/i.test(name) || s > 0.28 ? 'grass' : 'turf';
      else if (hue > 15 && hue < 50 && s > 0.25 && mx > 40 && mx < 200) f = /track|path|lane|rut/i.test(name) ? 'track' : 'dirt';
    }
    famCache.set(name, f);
    return f;
  }
  const meanCache = new WeakMap();
  function meanOf(name) {
    const d = typeof Engine !== 'undefined' && Engine.textures[name]; if (!d) return [0.4, 0.45, 0.3];
    let m = meanCache.get(d); if (m) return m;
    let r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i++) { const px = d[i]; r += px & 255; g += (px >> 8) & 255; b += (px >> 16) & 255; }
    m = [r / d.length / 255, g / d.length / 255, b / d.length / 255]; meanCache.set(d, m); return m;
  }

  // ------------------------------------------------------------------------------------------ the little pictures
  const CV = 16, CV_LAYERS = 8;   // 16 x 16: 0-2 tufts, 3-4 pebbles, 5-6 leaves, 7 clover
  function coverArt() {
    // grey values (the ground's own colour tints them in the shader); alpha 0 or 255
    const out = new Uint8Array(CV * CV * 4 * CV_LAYERS);
    const put = (L, x, y, v, a) => { if (x < 0 || y < 0 || x >= CV || y >= CV) return; const o = ((L * CV + y) * CV + x) * 4; out[o] = out[o + 1] = out[o + 2] = Math.max(0, Math.min(255, v)); out[o + 3] = a == null ? 255 : a; };
    for (let L = 0; L < 3; L++) {          // tufts: blades fanning up from the root, dark at the base and light at the tips
      const nb = 5 + L * 2;
      for (let b = 0; b < nb; b++) {
        const x = 7.5 + (h3(L, b, 11) - 0.5) * 3, lean = (b / (nb - 1) - 0.5) * (1.6 + L * 0.4) + (h3(L, b, 12) - 0.5) * 0.5;
        const h = 8 + Math.floor(h3(L, b, 13) * (6 + L));
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

  // ------------------------------------------------------------------------------------------ the pass
  const COVER = { radius: 7.5, perCell: { grass: 9, turf: 7, track: 4, dirt: 4 }, n: 0, cellKey: '', vao: null, vbo: null, tex: null, prog: null, buf: new Float32Array(4096 * 12), ms: 0 };
  const UNIT = 13;
  const LEAF = [[0.74, 0.56, 0.22], [0.64, 0.31, 0.13], [0.8, 0.7, 0.44], [0.52, 0.36, 0.17]];   // ochre, rust, pale, brown
  const VS = (R) => `
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
  const FS = `
uniform highp sampler2DArray uCov105;
in vec2 vUV; flat in float vLayer; flat in vec3 vTint; in vec3 vPos; flat in float vFade;
layout(location=0) out vec4 oColor; layout(location=1) out vec4 oAux;
void main() {
  vec4 t = texture(uCov105, vec3(vUV, vLayer));
  if (t.a < 0.5) discard;
  if (vFade < 0.999 && float(r3dBayer(ivec2(gl_FragCoord.xy))) >= vFade * 16.0) discard;
  R3DSurf s; s.albedo = vTint * t.r * 1.15; s.pos = vPos; s.nrm = vec3(0.0, 0.0, 1.0); s.side = 1.0; s.mat = 5.0; s.emissive = 0.0; s.fi = 1.0; s.ladd = vec3(0.0); s.kind = 0;
  oColor = vec4(r3dShade(s), 1.0); oAux = vec4(5.0 / 255.0, 0.0, 0.0, 1.0);
}`;
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;

  function build(F) {
    const m = F.map, c = F.cam, R = COVER.radius, W = m.w, H = m.h;
    const key = m.id + ':' + Math.floor(c.x) + ':' + Math.floor(c.y) + ':' + (m.cells ? m.cells.length : 0);
    if (key === COVER.cellKey && COVER.n) return false;
    COVER.cellKey = key;
    const seed = hashStr(String(m.id)), buf = COVER.buf; let n = 0;
    const floorDef = m.floor || 't_flag';
    const texAt = (cx, cy) => { if (m.floorCells && m.floorTextures) { const idx = m.floorCells[cy * W + cx]; if (idx && m.floorTextures[idx] && Engine.textures[m.floorTextures[idx]]) return m.floorTextures[idx]; } return floorDef; };
    const woods = /wood|grove|forest|weald|copse|orchard/i.test(String(m.id));
    for (let cy = Math.max(0, Math.floor(c.y - R)); cy <= Math.min(H - 1, Math.floor(c.y + R)); cy++) {
      for (let cx = Math.max(0, Math.floor(c.x - R)); cx <= Math.min(W - 1, Math.floor(c.x + R)); cx++) {
        if (m.isBlocked && m.isBlocked(cx, cy)) continue;
        const dx = cx + 0.5 - c.x, dy = cy + 0.5 - c.y; if (dx * dx + dy * dy > (R + 0.7) * (R + 0.7)) continue;
        const name = texAt(cx, cy), fam = familyOf(name);
        const count = COVER.perCell[fam] || 0;
        if (!count) continue;
        const tint = meanOf(name);
        const k = Math.floor(h3(cx, cy, seed) * (count + 1.999));
        for (let i = 0; i < k + (woods ? 2 : 0) && n < 4096; i++) {
          const fx = cx + 0.08 + 0.84 * h3(cx * 7 + i, cy * 13, seed + 1), fy = cy + 0.08 + 0.84 * h3(cx * 11, cy * 5 + i, seed + 2);
          const pick = h3(cx + i * 31, cy - i * 17, seed + 3);
          let kind = 0, layer = 0, w = 0.13, h = 0.1, sway = 0.006, tr = tint[0], tg = tint[1], tb = tint[2];
          if (fam === 'grass' || fam === 'turf') {
            if (woods && pick > 0.82) { const sh = LEAF[Math.floor(h3(cx, i, seed + 7) * LEAF.length)]; kind = 1; layer = 5 + (pick < 0.91 ? 0 : 1); w = h = 0.14 + 0.3 * (pick - 0.82); tr = sh[0]; tg = sh[1]; tb = sh[2]; sway = 0; }   // a fallen leaf
            else if (pick < 0.08) { kind = 1; layer = 7; w = h = 0.07; tr *= 0.8; tg *= 1.15; tb *= 0.75; }        // clover
            else {
              layer = Math.floor(pick * 3) % 3; w = 0.12 + 0.06 * h3(cx, cy + i, seed + 4); h = 0.07 + 0.06 * h3(cy, cx + i, seed + 5);
              // each tuft its own green: some fresher, some sun-dried, a few darker in their own shade
              const v = 0.82 + 0.34 * h3(cx + i, cy, seed + 8), dry = h3(cy + i, cx, seed + 9);
              tr *= v * (0.88 + 0.24 * dry); tg *= v * 1.12; tb *= v * (0.8 - 0.1 * dry);
            }
          } else if (woods && pick < 0.7) {                                                                    // fallen leaves: ochre, rust or pale and old
            const sh = LEAF[Math.floor(h3(cx + i, cy - i, seed + 10) * LEAF.length)], v = 0.85 + 0.3 * h3(cx - i, cy, seed + 11);
            kind = 1; layer = 5 + (pick < 0.35 ? 0 : 1); w = h = 0.15 + 0.08 * h3(cy, cx - i, seed + 12); tr = sh[0] * v; tg = sh[1] * v; tb = sh[2] * v; sway = 0;
          } else if (fam === 'track' && pick < 0.45) {                                                        // grass at the track's edge
            layer = Math.floor(pick * 6) % 3; w = 0.1; h = 0.06; tr *= 0.95; tg *= 1.15; tb *= 0.8;
          } else {                                                                                             // pebbles
            kind = 1; layer = 3 + (pick < 0.5 ? 0 : 1); w = h = 0.05 + 0.04 * pick; const gr = Math.min(1, (tint[0] + tint[1] + tint[2]) / 3 * 1.4 + 0.08); tr = gr; tg = gr * 0.97; tb = gr * 0.9; sway = 0;
          }
          const o = n * 12;
          buf[o] = fx; buf[o + 1] = fy; buf[o + 2] = R3D.groundGL(fx, fy); buf[o + 3] = h3(cx - i, cy + i, seed + 6) * 6.2831;
          buf[o + 4] = w; buf[o + 5] = h; buf[o + 6] = kind; buf[o + 7] = layer;
          buf[o + 8] = tr; buf[o + 9] = tg; buf[o + 10] = tb; buf[o + 11] = (typeof GFX !== 'undefined' && GFX.reduceMotion) ? 0 : sway;
          n++;
        }
      }
    }
    COVER.n = n;
    return true;
  }
  function init(gl) {
    COVER.cellKey = ''; COVER.n = 0;
    COVER.tex = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D_ARRAY, COVER.tex);
    gl.texStorage3D(gl.TEXTURE_2D_ARRAY, 1, gl.RGBA8, CV, CV, CV_LAYERS);
    gl.texSubImage3D(gl.TEXTURE_2D_ARRAY, 0, 0, 0, 0, CV, CV, CV_LAYERS, gl.RGBA, gl.UNSIGNED_BYTE, coverArt());
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.NEAREST); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    gl.bindTexture(gl.TEXTURE_2D_ARRAY, null);
    COVER.vao = gl.createVertexArray(); gl.bindVertexArray(COVER.vao);
    COVER.vbo = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, COVER.vbo); gl.bufferData(gl.ARRAY_BUFFER, COVER.buf.byteLength, gl.DYNAMIC_DRAW);
    for (let i = 0; i < 3; i++) { gl.enableVertexAttribArray(i); gl.vertexAttribPointer(i, 4, gl.FLOAT, false, 48, i * 16); gl.vertexAttribDivisor(i, 1); }
    gl.bindVertexArray(null);
    if (!COVER.prog) COVER.prog = R3D.program(VS(COVER.radius), FS, {});
  }
  let lastMotion = null;
  const pass = {
    name: 'cover105', order: 35,
    init(gl) { try { init(gl); } catch (e) { warnOnce('init', e); } },
    enabled(F) { return on() && !!F.outdoor && !!F.map; },
    draw(gl, F) {
      const t0 = now();
      if (!COVER.vao || !COVER.prog || !COVER.prog.p) return;
      const rm = typeof GFX !== 'undefined' && !!GFX.reduceMotion; if (rm !== lastMotion) { lastMotion = rm; COVER.cellKey = ''; }
      if (build(F)) { gl.bindBuffer(gl.ARRAY_BUFFER, COVER.vbo); gl.bufferSubData(gl.ARRAY_BUFFER, 0, COVER.buf.subarray(0, COVER.n * 12)); }
      if (!COVER.n) return;
      R3D.bindScene(gl, F);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.NONE]);   // colour only: the aux target (materials) stays the world's
      gl.enable(gl.DEPTH_TEST); gl.depthFunc(gl.LEQUAL); gl.depthMask(false); gl.disable(gl.CULL_FACE); gl.disable(gl.BLEND);
      const pr = R3D.use(COVER.prog);
      if (pr.u.uCov105) { gl.activeTexture(gl.TEXTURE0 + UNIT); gl.bindTexture(gl.TEXTURE_2D_ARRAY, COVER.tex); gl.uniform1i(pr.u.uCov105, UNIT); gl.activeTexture(gl.TEXTURE0); }
      gl.bindVertexArray(COVER.vao);
      gl.drawArraysInstanced(gl.TRIANGLES, 0, 12, COVER.n);
      gl.bindVertexArray(null);
      gl.drawBuffers([gl.COLOR_ATTACHMENT0, gl.COLOR_ATTACHMENT1]);
      gl.depthMask(true);
      COVER.ms = now() - t0;
    },
    dispose(gl) { try { if (COVER.vbo) gl.deleteBuffer(COVER.vbo); if (COVER.vao) gl.deleteVertexArray(COVER.vao); if (COVER.tex) gl.deleteTexture(COVER.tex); } catch (e) { /* fine */ } COVER.vbo = COVER.vao = COVER.tex = null; COVER.n = 0; },
  };

  // ------------------------------------------------------------------------------------------ the Options row
  const ROW = ['gfx-cover105', 'Ground cover', 'grass tufts, pebbles and fallen leaves near you outdoors (3D renderer)'];
  function sync() {
    if (typeof document === 'undefined') return;
    const b = document.getElementById(ROW[0]); if (!b) return;
    const v = on(); b.textContent = v ? 'On' : 'Off'; b.setAttribute('aria-pressed', v ? 'true' : 'false'); b.classList.toggle('sel', v);
  }
  function setOn(v) {
    GFX[FLAG] = !!v;
    if (typeof PRESETS !== 'undefined' && PRESETS.current) GFX.preset = PRESETS.current();
    if (typeof GFX.changed === 'function') GFX.changed();
    sync();
    return GFX[FLAG];
  }
  function wire() {
    if (typeof R3D !== 'undefined' && R3D.addPass) { try { R3D.addPass(pass); } catch (e) { warnOnce('pass', e); } }
    if (typeof GFX !== 'undefined' && GFX.onChange) GFX.onChange(sync);
    if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') {
      const _acc = renderAccessibilityMenu;
      renderAccessibilityMenu = function () {
        const r = _acc.apply(this, arguments);
        try {
          const grid = document.querySelector('#modal-panel .ctl-grid');
          if (grid && !document.getElementById(ROW[0])) {
            const lab = document.createElement('span'); lab.className = 'gfx-label'; lab.appendChild(document.createTextNode(ROW[1] + ' '));
            const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = ROW[2]; lab.appendChild(sm);
            const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = ROW[0]; b.type = 'button'; b.setAttribute('aria-label', ROW[1]);
            b.onclick = () => setOn(!on());
            const after = document.getElementById('gfx-hdtex');
            if (after && after.parentNode === grid) { after.insertAdjacentElement('afterend', b); after.insertAdjacentElement('afterend', lab); }
            else { grid.appendChild(lab); grid.appendChild(b); }
            sync();
          }
        } catch (e) { warnOnce('row', e); }
        return r;
      };
    }
  }
  try { wire(); } catch (e) { warnOnce('wire', e); }
  return { cover: COVER, familyOf, on, setOn, pass, art: coverArt };
})();
if (typeof window !== 'undefined') window.COVER105 = COVER105;
