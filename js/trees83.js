// ============================================================
//  trees83 — the trees, larger and of many shapes (owner, 13 Nov 2026: "I think the trees themselves need to be larger
//  in general possibly with varying sizes and shapes for more immersion and beauty").
//
//  Every tree standing out of doors (oak, willow, beech, ash, yew, pine, hawthorn, thorn, elder, apple and the rest of the
//  wood) is grown when the maps are built: the big trees to between about one and a third and twice their old height, the
//  small ones a little less, most of them middling and a few of them giants, so a wood is no longer one height all
//  through. Each tree also takes a shape of its own, drawn from its own picture in code: as it was, broad and spreading,
//  tall and narrow, old and squat, or leaning one way or the other (wind-bent, on the open downs). A tree near a wall or
//  a house grows only as far as it has room, and takes the narrow shape there, so no crown goes through a roof.
//  Nothing changes where a tree stands or what you bump into (its trunk keeps its old reach), and nothing is random:
//  each tree's size and shape come from where it stands. The Options switch "Larger trees, of many shapes" (GFX.trees83,
//  on by default) puts every tree back exactly as it was. Both renderers draw the shapes (through animDirectionalSprite).
// ============================================================
'use strict';

if (typeof GFX !== 'undefined' && GFX.trees83 === undefined) GFX.trees83 = true;

const TREES83 = (function () {
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('trees83: ' + k, e); } };
  const h2 = (a, b) => { let n = (Math.imul(a | 0, 374761393) + Math.imul(b | 0, 668265263)) | 0; n = Math.imul(n ^ (n >>> 13), 1274126177); return ((n ^ (n >>> 16)) >>> 0) / 4294967296; };
  const hashStr = (s) => { let n = 2166136261; for (let i = 0; i < s.length; i++) { n ^= s.charCodeAt(i); n = Math.imul(n, 16777619); } return n | 0; };
  const on = () => typeof GFX === 'undefined' || GFX.trees83 !== false;

  // Each kind has its own heights (in the game's measure, where a person is one tall: no grown tree is anywhere near a
  // person's height; an oak stands three to nearly six) and its own set of shapes, each drawn from its own picture:
  // wf how wide, hf how tall, lean how far the crown leans (of its width; minus is to the left).
  const SH = (wf, hf, lean) => ({ wf, hf, lean: lean || 0 }), AS = SH(1, 1);
  const SPECIES = {
    oak: { h: [3.0, 5.6], shapes: [AS, SH(1.42, 0.95), SH(1.26, 0.84), SH(0.84, 1.12), SH(1.1, 1, -0.15), SH(1.1, 1, 0.15), SH(1.55, 0.9)] },        // spreading, stag-old, tall, leaning, the great field oak
    willow: { h: [2.6, 4.3], shapes: [AS, SH(1.36, 0.92), SH(0.86, 1.1), SH(1.18, 0.86, 0.1)] },                                                        // weeping wide, tall, bowed over the water
    p22_beech: { h: [3.0, 5.2], shapes: [AS, SH(1.3, 1), SH(0.78, 1.18), SH(1.45, 0.92)] },                                                              // domed, columnar, the wide old beech
    p22_ash: { h: [3.0, 5.4], shapes: [AS, SH(0.82, 1.2), SH(1.25, 0.95), SH(1.05, 1.05, 0.12), SH(1.05, 1.05, -0.12)] },                                // airy and tall, spread, leaning
    p22_bellash: { h: [3.0, 5.0], shapes: [AS, SH(0.82, 1.18), SH(1.25, 0.95), SH(1.05, 1, 0.12)] },
    p22_wooltree: { h: [2.6, 3.8], shapes: [AS, SH(1.25, 0.95), SH(0.85, 1.1)] },
    p22_yew: { h: [2.3, 3.8], shapes: [AS, SH(1.38, 0.85), SH(0.84, 1.12), SH(1.6, 0.78)] },                                                            // broad, tall, the huge low churchyard yew
    p83_pine: { h: [3.4, 5.2], shapes: [AS, SH(0.86, 1.15), SH(1.1, 1, -0.18), SH(1.1, 1, 0.18)] },
    p22_haw: { h: [1.9, 3.1], shapes: [AS, SH(1.3, 0.86), SH(1.15, 0.95, -0.24), SH(1.15, 0.95, 0.24), SH(0.86, 1.12)] },                               // squat, wind-bent both ways, upright
    p22_glassthorn: { h: [1.9, 3.0], shapes: [AS, SH(1.3, 0.86), SH(1.15, 0.95, -0.22), SH(1.15, 0.95, 0.22)] },
    p20_thorn: { h: [1.6, 2.7], shapes: [AS, SH(1.35, 0.85), SH(1.2, 0.9, -0.3), SH(1.2, 0.9, 0.3)] },                                                   // the downs' thorns lean away from the wind
    p22_elder: { h: [1.7, 2.6], shapes: [AS, SH(1.25, 0.92), SH(1.15, 0.85)] },
    p22_apple: { h: [2.1, 3.0], shapes: [AS, SH(1.25, 0.92), SH(1.15, 0.85, 0.1)] }, p22_apple2: { h: [2.1, 3.0], shapes: [AS, SH(1.25, 0.92), SH(1.15, 0.85, -0.1)] },
  };
  const stats = { maps: 0, trees: 0, grown: 0, held: 0, tight: 0, variants: 0 };

  // ---------------------------------------------------------------- the shapes, drawn from each tree's own picture
  const cache = new WeakMap();                 // sprite object -> { key: variant sprite }
  let serial = 0;
  function canvasOf(sp) {
    const c = document.createElement('canvas'); c.width = sp.w; c.height = sp.h; const x = c.getContext('2d');
    const id = x.createImageData(sp.w, sp.h); id.data.set(new Uint8ClampedArray(sp.data.buffer, sp.data.byteOffset, sp.data.byteLength)); x.putImageData(id, 0, 0); return c;
  }
  function variant(sp, S) {
    if (!sp || !S || (S.wf === 1 && S.hf === 1 && !S.lean) || typeof document === 'undefined' || !Engine.addSprite) return sp;
    const key = S.wf + ',' + S.hf + ',' + S.lean;
    let m = cache.get(sp); if (!m) { m = {}; cache.set(sp, m); }
    if (m[key] !== undefined) return m[key] || sp;
    try {
      const src = canvasOf(sp), cx0 = sp.cx == null ? 0.5 : sp.cx;
      const lean = Math.round(Math.abs(S.lean) * sp.w), W = Math.max(2, Math.round(sp.w * S.wf)) + lean, H = sp.h;
      const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingEnabled = false;
      const sw = Math.max(1, Math.round(sp.w * S.wf)), base = S.lean < 0 ? lean : 0;
      if (!S.lean) x.drawImage(src, 0, 0, sp.w, sp.h, 0, 0, sw, H);
      else for (let y = 0; y < H; y++) {                                     // the crown leans, the foot of the trunk stays put
        const up = 1 - y / (H - 1), off = Math.round(Math.sign(S.lean) * lean * Math.pow(up, 1.6));
        x.drawImage(src, 0, y, sp.w, 1, base + off, y, sw, 1);
      }
      const name = 't83_' + (++serial);
      Engine.addSprite(name, { w: W, h: H, hs: (sp.hs || 1) * S.hf, cx: (base + cx0 * sw) / W, dy: sp.dy || 0, data: new Uint32Array(x.getImageData(0, 0, W, H).data.buffer.slice(0)) });
      const v = Engine.sprites[name]; m[key] = v || null; stats.variants++;
      return v || sp;
    } catch (e) { warnOnce('variant', e); m[key] = null; return sp; }
  }

  // ---------------------------------------------------------------- growing the trees of one map
  // what a crown must keep clear of: a building's wall. Hedges, low walls and plinths a crown may hang over.
  const wallAt = (m, x, y) => { const c = m.get(x, y); if (!c || c.door) return false; if (/hedge/.test(c.tex || '')) return false; if (c.top != null && c.top - m.groundAt(x + 0.5, y + 0.5) < 1.6) return false; return true; };
  function roomFor(m, e, reach) {                                  // how far the nearest wall is, up to `reach`
    let best = reach; const X = Math.floor(e.x), Y = Math.floor(e.y), R = Math.ceil(reach) + 1;
    for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
      if (!wallAt(m, X + dx, Y + dy)) continue;
      const nx = Math.max(X + dx, Math.min(e.x, X + dx + 1)), ny = Math.max(Y + dy, Math.min(e.y, Y + dy + 1)), d = Math.hypot(nx - e.x, ny - e.y);
      if (d < best) best = d;
    }
    return best;
  }
  function prepare(m) {
    if (!m || !m.outdoor || !m.entities || m._t83) return;
    const seed = hashStr(m.id), list = [], n0 = m.baseCount == null ? m.entities.length : m.baseCount;
    for (let i = 0; i < n0; i++) {
      const e = m.entities[i]; if (!e || e.kind !== 'deco' || e.transient) continue;
      const S = SPECIES[e.sprite]; if (!S) continue;
      const sp = typeof Engine !== 'undefined' && Engine.sprites ? Engine.sprites[e.sprite] : null;
      const a = h2(Math.round(e.x * 4) ^ seed, Math.round(e.y * 4)), b = h2(Math.round(e.y * 4) + seed, Math.round(e.x * 4) * 3 + 7);
      const s0 = e.scale || 1, aspect = sp ? sp.w / sp.h : 0.7, hs = sp ? sp.hs || 1 : 1;
      // its height: anywhere in its kind's range, most of them middling and a few of them giants; never smaller than it was
      const want = S.h[0] + (S.h[1] - S.h[0]) * Math.pow(a, 1.35);
      let shape = S.shapes[Math.floor(b * S.shapes.length) % S.shapes.length], k = Math.max(1, want / (s0 * hs * shape.hf));
      // room to spread: the crown's half-width at this size must not reach a wall (by a house it grows less, and narrow)
      const half = (kk, sh) => s0 * kk * hs * sh.hf * aspect * (sh.wf + Math.abs(sh.lean)) * 0.5 * 0.8;
      const room = roomFor(m, e, half(k, shape) + 0.5);
      // by a house it takes its narrowest shape and grows only as far as there is room (a garden tree hard by a wall keeps
      // the size it had, which is never below twice a person's height for the big kinds)
      if (half(k, shape) > room) {
        shape = S.shapes.reduce((q, z) => (z.wf + Math.abs(z.lean) < q.wf + Math.abs(q.lean) ? z : q), S.shapes[0]);
        k = Math.max(1, Math.min(k, room / Math.max(0.01, half(1, shape)))); stats.held++; if (half(k, shape) > room + 1e-6) stats.tight++;
      }
      const key = shape;
      list.push({ e, s0, k, key }); stats.trees++; if (k > 1.01) stats.grown++;
    }
    m._t83 = { list, applied: null }; stats.maps++;
  }
  function apply(m, want) {
    const P = m && m._t83; if (!P || P.applied === want) return;
    for (const t of P.list) { t.e.scale = want ? t.s0 * t.k : t.s0; t.e._t83 = want ? t.key : undefined; }
    P.applied = want;
  }
  function sync(maps) {
    const want = on(), seen = new Set();
    const each = (ms) => { if (!ms) return; for (const id in ms) { const m = ms[id]; if (!m || seen.has(m)) continue; seen.add(m); prepare(m); apply(m, want); } };
    each(maps); if (typeof G !== 'undefined' && G && G.maps) each(G.maps);
  }

  // ---------------------------------------------------------------- hooks
  function wire() {
    if (typeof buildAllMaps === 'function') {
      const _b = buildAllMaps;
      buildAllMaps = function () { const maps = _b.apply(this, arguments); try { sync(maps); } catch (e) { warnOnce('build', e); } return maps; };
    }
    if (typeof loadMap === 'function') {
      const _l = loadMap;
      loadMap = function () { const r = _l.apply(this, arguments); try { sync(); } catch (e) { warnOnce('load', e); } return r; };
    }
    if (typeof animDirectionalSprite === 'function') {
      const _a = animDirectionalSprite;
      animDirectionalSprite = function (e) {
        const r = _a.apply(this, arguments);
        if (e && e._t83 && r && r.sprite && on()) { const v = variant(r.sprite, e._t83); if (v !== r.sprite) return { sprite: v, flip: r.flip }; }
        return r;
      };
    }
  }
  wire();

  return { SPECIES, stats, variant, prepare, apply, sync, roomFor, on, h2 };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = TREES83;
if (typeof window !== 'undefined') window.TREES83 = TREES83;

// the Options row
if (typeof renderAccessibilityMenu === 'function' && typeof document !== 'undefined') (() => {
  const _acc = renderAccessibilityMenu;
  renderAccessibilityMenu = function () {
    const r = _acc.apply(this, arguments);
    try {
      const grid = document.querySelector('#modal-panel .ctl-grid');
      if (grid && !document.getElementById('gfx-trees83')) {
        const label = document.createElement('span'); label.className = 'gfx-label'; label.appendChild(document.createTextNode('Larger trees, of many shapes '));
        const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = 'trees out of doors grow to many heights and take shapes of their own: broad, tall, old or leaning'; label.appendChild(sm);
        const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'gfx-trees83'; b.type = 'button'; b.setAttribute('aria-label', 'Larger trees, of many shapes');
        const sync = () => { b.textContent = GFX.trees83 !== false ? 'On' : 'Off'; b.setAttribute('aria-pressed', GFX.trees83 !== false ? 'true' : 'false'); };
        b.onclick = () => { GFX.trees83 = GFX.trees83 === false; try { TREES83.sync(); } catch (e) { /* the trees stay as they are */ } if (typeof GFX.changed === 'function') GFX.changed(); if (typeof R3D !== 'undefined' && R3D.invalidate) R3D.invalidate(); sync(); };
        sync(); grid.appendChild(label); grid.appendChild(b);
      }
    } catch (e) { /* the menu still opens without the row */ }
    return r;
  };
})();
