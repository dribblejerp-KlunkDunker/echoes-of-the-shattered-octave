// ============================================================
//  bestiary20a — hand-built five-angle views, first half of the bestiary (Phase 20, team BEASTA)
//
//  Every species here gets its own drawn front-side, side, back-side and back
//  views (the engine mirrors them for the other side), with walk and attack
//  poses, in place of js/directions.js's squeezed-and-darkened stand-ins.
//  Each view is composed by hand for that species and angle: pieces of the
//  species' own painted front (cloth, armour plate, fur, brass — so colours,
//  grain and identity stay exactly its own) are cut out, turned, re-stacked and
//  re-lit into a new silhouette, and the parts a front view cannot supply
//  (profiles, backs of heads, hoods, spines, boots seen from the side, a sword
//  held up behind the shoulder) are drawn pixel by pixel from the small maps
//  and shapes below. No random numbers; every view is built once, on first
//  sight, and cached (byte-budgeted, oldest evicted first).
//
//  Contract: DIRECTIONS.view(name, view 1..4, pose) — this file wraps that one
//  property, so directions.js and the engine's sprite chooser are untouched and
//  the Proctor pilot and team BEASTB's species pass straight through.
//  Views keep the source's pixel scale (hs is raised only when a raised arm
//  needs head-room), its anchor (feet on the floor, dy unchanged) and its
//  hitbox (nothing here touches the entity). GFX.p20_beastA off (and the
//  Original preset, where GFX.directions is off too) = the stand-ins exactly.
// ============================================================
'use strict';

if (GFX.p20_beastA === undefined) GFX.p20_beastA = true;
if (!GFX.FX.includes('p20_beastA')) GFX.FX.push('p20_beastA');

const BEAST20A = (() => {
  const CAP = 6 * 1024 * 1024;                 // derived-view budget (bytes of pixel data)
  const POSES = ['', '_w1', '_w2', '_a1', '_a2'];
  const SPECIES = {};                          // sprite name -> recipe(P, view, pose)
  const cache = new Map();                     // 'name|view|pose' -> { sprite, used, bytes }
  let bytes = 0, stamp = 0;

  // ---------------------------------------------------------------- sources
  const srcCanvases = new WeakMap();           // engine sprite -> canvas of its pixels
  function srcCanvas(name) {
    const sp = Engine.sprites[name]; if (!sp) throw new Error('no sprite ' + name);
    let c = srcCanvases.get(sp); if (c) return c;
    c = document.createElement('canvas'); c.width = sp.w; c.height = sp.h;
    c.getContext('2d').putImageData(new ImageData(new Uint8ClampedArray(sp.data.buffer.slice(sp.data.byteOffset, sp.data.byteOffset + sp.data.byteLength)), sp.w, sp.h), 0, 0);
    srcCanvases.set(sp, c); return c;
  }
  // A colour of the painted art, so every hand-drawn pixel matches the species' own palette.
  function at(name, x, y, k) {
    const sp = Engine.sprites[name], p = sp.data[(y | 0) * sp.w + (x | 0)];
    return css([p & 255, (p >>> 8) & 255, (p >>> 16) & 255], k);
  }
  function css(rgb, k) {
    const m = k == null ? 1 : k, f = v => Math.max(0, Math.min(255, Math.round(v * m)));
    return 'rgb(' + f(rgb[0]) + ',' + f(rgb[1]) + ',' + f(rgb[2]) + ')';
  }
  // one pixel of a painted texture tile: t = [frame, sx, sy, sw, sh, mul]
  function texAt(t, x, y) {
    const sp = Engine.sprites[t[0]]; if (!sp) return null;
    const sx = t[1] + (((x % t[3]) + t[3]) % t[3]), sy = t[2] + (((y % t[4]) + t[4]) % t[4]);
    const p = sp.data[sy * sp.w + sx]; if ((p >>> 24) < 100) return null;
    return css([p & 255, (p >>> 8) & 255, (p >>> 16) & 255], t[5]);
  }
  // deterministic grain for hand-filled shapes
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }

  // ---------------------------------------------------------------- the painter
  // One per view build. Coordinates are output pixels; source rects are in the
  // named frame's pixels.
  function painter(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const g = c.getContext('2d', { willReadFrequently: true }); g.imageSmoothingEnabled = false;
    const P = {
      w, h, c, g, at, css, hash, texAt,
      // Cut a piece of a source frame (optionally masked by a polygon in source
      // coordinates) and put its pivot at (dx, dy), scaled k across, ky down,
      // optionally mirrored and turned by rot radians.
      cut(name, sx, sy, sw, sh, dx, dy, o) {
        o = o || {};
        const src = srcCanvas(name);
        const t = document.createElement('canvas'); t.width = Math.max(1, sw); t.height = Math.max(1, sh);
        const tg = t.getContext('2d'); tg.imageSmoothingEnabled = false;
        if (o.mask) { tg.beginPath(); o.mask.forEach((p, i) => (i ? tg.lineTo(p[0] - sx, p[1] - sy) : tg.moveTo(p[0] - sx, p[1] - sy))); tg.closePath(); tg.clip(); }
        tg.drawImage(src, -sx, -sy);
        if (o.mul != null || o.tint) { tg.globalCompositeOperation = 'source-atop'; if (o.mul != null) { tg.fillStyle = o.mul < 1 ? 'rgba(0,0,0,' + (1 - o.mul) + ')' : 'rgba(255,255,255,' + (o.mul - 1) + ')'; tg.fillRect(0, 0, sw, sh); } if (o.tint) { tg.fillStyle = o.tint; tg.fillRect(0, 0, sw, sh); } }
        const px = o.px == null ? sx : o.px, py = o.py == null ? sy : o.py;
        g.save(); g.translate(dx, dy); if (o.rot) g.rotate(o.rot);
        g.scale((o.k == null ? 1 : o.k) * (o.flip ? -1 : 1), o.ky == null ? 1 : o.ky);
        if (o.alpha != null) g.globalAlpha = o.alpha;
        g.drawImage(t, -(px - sx), -(py - sy));
        g.restore();
      },
      poly(col, pts) { g.fillStyle = col; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill(); },
      rect(col, x, y, rw, rh) { g.fillStyle = col; g.fillRect(x, y, rw, rh); },
      px(col, x, y) { g.fillStyle = col; g.fillRect(x | 0, y | 0, 1, 1); },
      // a 1-pixel line (Bresenham), for straps, blades, hair strands and seams
      line(col, x0, y0, x1, y1, wd) {
        g.fillStyle = col; x0 |= 0; y0 |= 0; x1 |= 0; y1 |= 0; const W = wd || 1;
        const dx = Math.abs(x1 - x0), dy = -Math.abs(y1 - y0), sx = x0 < x1 ? 1 : -1, sy = y0 < y1 ? 1 : -1; let e = dx + dy;
        for (;;) { g.fillRect(x0, y0, W, W); if (x0 === x1 && y0 === y1) break; const e2 = 2 * e; if (e2 >= dy) { e += dy; x0 += sx; } if (e2 <= dx) { e += dx; y0 += sy; } }
      },
      // fill a polygon with a tile of the species' own painted texture
      tex(name, sx, sy, sw, sh, pts, o) {
        o = o || {};
        const src = srcCanvas(name), t = document.createElement('canvas'); t.width = sw; t.height = sh;
        const tg = t.getContext('2d'); tg.drawImage(src, -sx, -sy);
        if (o.mul != null) { tg.globalCompositeOperation = 'source-atop'; tg.fillStyle = o.mul < 1 ? 'rgba(0,0,0,' + (1 - o.mul) + ')' : 'rgba(255,255,255,' + (o.mul - 1) + ')'; tg.fillRect(0, 0, sw, sh); }
        const pat = g.createPattern(t, 'repeat');
        if (o.ox != null || o.oy != null) pat.setTransform(new DOMMatrix().translate(o.ox || 0, o.oy || 0));
        g.fillStyle = pat; g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.fill();
      },
      // hand-placed pixels: rows of palette keys, '.' or ' ' = leave alone
      map(rows, pal, x, y, o) {
        o = o || {};
        for (let r = 0; r < rows.length; r++) for (let i = 0; i < rows[r].length; i++) {
          const ch = rows[r][i]; if (ch === '.' || ch === ' ') continue;
          let col = pal[ch]; if (!col) continue;
          const X = o.flip ? x + rows[r].length - 1 - i : x + i, Y = y + r;
          if (col === 'clear') { g.clearRect(X, Y, 1, 1); continue; }
          // a texture key: [frame, sx, sy, sw, sh, mul] samples the painted art at this pixel
          if (typeof col !== 'string') col = texAt(col, X, Y);
          if (!col) continue;
          g.fillStyle = col; g.fillRect(X, Y, 1, 1);
        }
      },
      // fill a polygon with this layer's own pixels from (dx, dy) away: closes the
      // hole a lifted prop leaves with the cloth that was beside it
      heal(pts, dx, dy) {
        const t = document.createElement('canvas'); t.width = w; t.height = h; t.getContext('2d').drawImage(c, 0, 0);
        P.clip(pts, () => { g.clearRect(0, 0, w, h); g.drawImage(t, -dx, -(dy || 0)); });
        // whatever the copy could not cover stays as it was
        g.save(); g.globalCompositeOperation = 'destination-over'; g.drawImage(t, 0, 0); g.restore();
      },
      // strand or fur grain over a polygon: tones picked per pixel, in short vertical runs
      grain(pts, tones, run, seed) {
        P.clip(pts, () => {
          const xs = pts.map(q => q[0]), ys = pts.map(q => q[1]);
          for (let y = Math.floor(Math.min(...ys)); y <= Math.ceil(Math.max(...ys)); y++) for (let x = Math.floor(Math.min(...xs)); x <= Math.ceil(Math.max(...xs)); x++) {
            const t = hash(x, Math.floor((y + (x * 7 % 3)) / (run || 3)), seed || 1);
            g.fillStyle = tones[Math.min(tones.length - 1, Math.floor(t * tones.length))]; g.fillRect(x, y, 1, 1);
          }
        });
      },
      erase(pts) { g.save(); g.globalCompositeOperation = 'destination-out'; P.poly('#000', pts); g.restore(); },
      under(fn) { g.save(); g.globalCompositeOperation = 'destination-over'; fn(); g.restore(); },
      clip(pts, fn) { g.save(); g.beginPath(); pts.forEach((p, i) => (i ? g.lineTo(p[0], p[1]) : g.moveTo(p[0], p[1]))); g.closePath(); g.clip(); fn(); g.restore(); },
      // light: a multiply over opaque pixels, f(x, y) -> brightness factor
      light(f) {
        const im = g.getImageData(0, 0, w, h), d = im.data;
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = (y * w + x) * 4; if (d[i + 3] < 20) continue;
          const k = f(x, y); if (k === 1) continue;
          d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
        }
        g.putImageData(im, 0, 0);
      },
      // Draw into a separate layer, give it round volume, then lay it on:
      // per row, light peaks at fraction c of the layer's width there and falls
      // to `back` at the far edge and `front` at the near one.
      layer(fn, back, peak, front, c) {
        const L = painter(w, h); fn(L);
        if (back != null) {
          const im = L.g.getImageData(0, 0, w, h), d = im.data;
          for (let y = 0; y < h; y++) {
            let x0 = -1, x1 = -1;
            for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 100) { if (x0 < 0) x0 = x; x1 = x; }
            if (x0 < 0) continue;
            const span = Math.max(1, x1 - x0);
            for (let x = x0; x <= x1; x++) {
              const i = (y * w + x) * 4; if (d[i + 3] < 20) continue;
              const t = (x - x0) / span;
              const k = t < c ? back + (peak - back) * Math.sin((t / c) * Math.PI / 2) : peak + (front - peak) * (1 - Math.cos(((t - c) / (1 - c)) * Math.PI / 2));
              d[i] = Math.min(255, d[i] * k); d[i + 1] = Math.min(255, d[i + 1] * k); d[i + 2] = Math.min(255, d[i + 2] * k);
            }
          }
          L.g.putImageData(im, 0, 0);
        }
        g.drawImage(L.c, 0, 0);
        return L;
      },
      // light only inside a polygon
      lightIn(pts, f) {
        const m = document.createElement('canvas'); m.width = w; m.height = h; const mg = m.getContext('2d');
        mg.fillStyle = '#fff'; mg.beginPath(); pts.forEach((p, i) => (i ? mg.lineTo(p[0], p[1]) : mg.moveTo(p[0], p[1]))); mg.closePath(); mg.fill();
        const md = mg.getImageData(0, 0, w, h).data;
        P.light((x, y) => (md[(y * w + x) * 4 + 3] > 127 ? f(x, y) : 1));
      },
      // a dark rim one pixel outside the silhouette, like the painted fronts carry
      rim(col, sides) {
        const im = g.getImageData(0, 0, w, h), d = im.data, solid = new Uint8Array(w * h);
        for (let i = 0; i < w * h; i++) solid[i] = d[i * 4 + 3] >= 128 ? 1 : 0;
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(col) || [0, 20, 16, 18];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          const i = y * w + x; if (!solid[i]) continue;
          const edge = (x === 0 || !solid[i - 1]) || (x === w - 1 || !solid[i + 1]) || (y === 0 || !solid[i - w]) || (!sides && (y === h - 1 || !solid[i + w]));
          if (!edge) continue;
          d[i * 4] = (d[i * 4] + +m[1]) >> 1; d[i * 4 + 1] = (d[i * 4 + 1] + +m[2]) >> 1; d[i * 4 + 2] = (d[i * 4 + 2] + +m[3]) >> 1;
        }
        g.putImageData(im, 0, 0);
      },
    };
    return P;
  }

  // Crisp pixel art: no half-transparent edges from the canvas' anti-aliasing.
  function finish(P, base, hsMul, cx) {
    const im = P.g.getImageData(0, 0, P.w, P.h), d = im.data;
    for (let i = 3; i < d.length; i += 4) d[i] = d[i] >= 110 ? 255 : 0;
    for (let i = 0; i < d.length; i += 4) if (!d[i + 3]) d[i] = d[i + 1] = d[i + 2] = 0;
    const data = new Uint32Array(d.buffer.slice(0));
    return { w: P.w, h: P.h, data, hs: (base.hs || 1) * (hsMul || 1), cx: cx == null ? 0.5 : cx, dy: base.dy || 0 };
  }

  // ---------------------------------------------------------------- build + cache
  function evict(need) {
    while (bytes + need > CAP && cache.size) {
      let oldK = null, old = null;
      for (const [k, en] of cache) if (!old || en.used < old.used) { old = en; oldK = k; }
      cache.delete(oldK); bytes -= old.bytes;
    }
  }
  function view(name, v, pose) {
    const recipe = SPECIES[name]; if (!recipe || !v || v < 1 || v > 4) return null;
    let p = pose || ''; if (!POSES.includes(p)) p = '';
    if (!Engine.sprites[name] || (p && !Engine.sprites[name + p])) return null;
    const key = name + '|' + v + '|' + p, hit = cache.get(key);
    if (hit) { hit.used = ++stamp; return hit.sprite; }
    const sprite = recipe(v, p);
    if (!sprite) return null;
    const size = sprite.data.byteLength; evict(size);
    cache.set(key, { sprite, used: ++stamp, bytes: size }); bytes += size;
    return sprite;
  }
  function make(name, w, h, draw, opt) {
    // opt: { cx, hsMul, rim, light }
    const P = painter(w, h); draw(P);
    if (opt && opt.light) P.light(opt.light);
    if (opt && opt.rim) P.rim(opt.rim, true);
    return finish(P, Engine.sprites[name], opt && opt.hsMul, opt && opt.cx);
  }

  // ---------------------------------------------------------------- shared shapes
  // walk: which foot is forward (+1 right foot ahead, -1 left foot ahead, 0 standing)
  const stride = p => (p === '_w1' ? 1 : p === '_w2' ? -1 : 0);
  // light across a turned figure: the lit edge leads, the far edge falls away
  function sideLight(w, lo, hi, back) {
    return (x) => { const t = x / Math.max(1, w - 1); return (lo + (hi - lo) * t) * (back || 1); };
  }

  // ---------------------------------------------------------------- the turntable
  // A hand-rigged figure: its body layer (front, as painted, with props lifted
  // off), its hand-built back (as seen from behind), the vertical axis it turns
  // on, how deep it is front-to-back, and the props (a lantern, a sabre, a bell)
  // that ride along at their own place in the round. Every horizontal run of
  // body pixels is a slice of an elliptical column; turning the figure turns
  // each column about the axis, the front art wraps its near half and the back
  // art its far half, and the light is recomputed for the new angle. The views
  // are then finished by hand per species (profile faces, hoods, strides).
  function rowRuns(d, w, y, join) {
    const runs = []; let s = -1, last = -9;
    for (let x = 0; x < w; x++) {
      if (d[(y * w + x) * 4 + 3] > 100) {
        if (s < 0) s = x; else if (x - last > join + 1) { runs.push([s, last]); s = x; }
        last = x;
      }
    }
    if (s >= 0) runs.push([s, last]);
    return runs;
  }
  function turn(rig, theta, outW, ox) {
    const F = rig.front, Bk = rig.back, w = F.width, h = F.height;
    const fd = F.getContext('2d').getImageData(0, 0, w, h).data, bd = Bk.getContext('2d').getImageData(0, 0, w, h).data;
    const out = new Uint8ClampedArray(outW * h * 4), zb = new Float32Array(outW * h).fill(-1e9);
    const ct = Math.cos(theta), st = Math.sin(theta);
    const lx0 = -0.5, lz0 = 0.86, relight = rig.relight == null ? 0.55 : rig.relight;
    const A = rig.axis, join = rig.join == null ? 2 : rig.join;
    // pass 1: the slices of every row
    const rows = [];
    for (let y = 0; y < h; y++) {
      let runs = rowRuns(fd, w, y, join);
      // hand-drawn torso bounds: what lies inside is the body column, what
      // lies outside (an arm held clear, a hem) turns as its own slice
      if (rig.body) {
        const bb = rig.body(y);
        if (bb) {
          const out2 = []; let bl = 1e9, br = -1;
          for (const [xl, xr] of runs) {
            if (xr < bb[0] || xl > bb[1]) { out2.push([xl, xr]); continue; }
            if (xl < bb[0]) out2.push([xl, bb[0] - 1]);
            if (xr > bb[1]) out2.push([bb[1] + 1, xr]);
            bl = Math.min(bl, Math.max(xl, bb[0])); br = Math.max(br, Math.min(xr, bb[1]));
          }
          if (br >= 0) out2.push([bl, br]);
          runs = out2;
        }
      }
      // the run the axis passes through turns about the axis itself, so the
      // body stays one coherent column whatever an arm or a hem does to its edges
      rows.push(runs.map(([xl, xr]) => {
        const main = xl <= A && xr >= A;
        return { xl, xr, main, a: main ? Math.max(A - xl, xr + 1 - A) : (xr - xl + 1) / 2, c: main ? A : (xl + xr + 1) / 2 };
      }));
    }
    // pass 2: an arm or a leg is a ragged column; steady its centre and girth
    // over a few rows so it turns as one limb instead of a stack of coins
    for (let y = 0; y < h; y++) for (const r of rows[y]) {
      if (r.main) continue;
      let sc = 0, sa = 0, n = 0;
      for (let k = -3; k <= 3; k++) {
        const row = rows[y + k]; if (!row) continue;
        for (const q of row) if (!q.main && q.xr >= r.xl - 1 && q.xl <= r.xr + 1) { const wgt = 4 - Math.abs(k); sc += (q.c0 == null ? q.c : q.c0) * wgt; sa += (q.a0 == null ? q.a : q.a0) * wgt; n += wgt; }
      }
      r.c0 = r.c; r.a0 = r.a; r.cs = sc / n; r.as = sa / n;
    }
    for (let y = 0; y < h; y++) {
      const depth = typeof rig.depth === 'function' ? rig.depth(y) : rig.depth;
      for (const r of rows[y]) {
        const { xl, xr, main } = r;
        // depth: a fraction of the slice's half-width, or (above 2) a half-depth in pixels
        // the body column is two half-ellipses meeting at the axis, one per side,
        // so a figure wider on one side (a cape flung out, a hip) wraps without gaps
        const a = main ? r.a : Math.max(r.as, (xr - xl + 1) / 2), c = main ? r.c : r.cs;
        const aL = main ? Math.max(0.5, A - xl) : a, aR = main ? Math.max(0.5, xr + 1 - A) : a, am = (aL + aR) / 2;
        const dv = typeof depth === 'function' ? depth(y, main) : depth;
        const b = Math.max(1, dv > 2 ? Math.min(dv, main ? am * 1.6 + 1 : a * (rig.limbK || 1.3)) : am * dv);   // a slice is never much deeper than it is wide: no blades off a hood's tip
        let X0 = c - A, Z0 = 0;
        if (rig.zOf) Z0 = rig.zOf(c, y, a) || 0;
        const steps = Math.ceil(Math.PI * 2 * Math.max(aL, aR, b) * 2.2);
        for (let i = 0; i < steps; i++) {
          const phi = -Math.PI + (i + 0.5) * (Math.PI * 2 / steps);
          const sp = Math.sin(phi), cp = Math.cos(phi), ah = sp < 0 ? aL : aR;
          const lx = ah * sp, lz = b * cp;
          let nx = sp / ah, nz = cp / b; const nl = Math.hypot(nx, nz); nx /= nl; nz /= nl;
          const rnz = -nx * st + nz * ct; if (rnz < -0.02) continue;
          const rnx = nx * ct + nz * st;
          const px = Math.round(ox + (X0 + lx) * ct + (Z0 + lz) * st - 0.5);
          if (px < 0 || px >= outW) continue;
          const pz = -(X0 + lx) * st + (Z0 + lz) * ct;
          const o = y * outW + px; if (pz <= zb[o]) continue;
          let si, src;
          // only the run's own pixels: beyond its real edge (an off-axis run is
          // shorter on one side) the column is left open rather than smeared
          const fx = Math.floor(main ? c + lx : r.c0 + lx * r.a0 / a); if (fx < xl || fx > xr) continue;
          if (cp >= 0) { si = (y * w + fx) * 4; src = fd; }
          else { si = (y * w + (w - 1 - fx)) * 4; src = bd; }
          if (src[si + 3] < 100) continue;   // the gap beside an off-centre run stays open
          zb[o] = pz;
          // relight: the painted art already carries the light it was drawn
          // under (front art lit as a front, back art as a back): change only the difference
          const ref = cp >= 0 ? nx * lx0 + nz * lz0 : -nx * lx0 - nz * lz0;
          const k = Math.max(0.45, 1 + relight * ((rnx * lx0 + rnz * lz0) - ref));
          out[o * 4] = Math.min(255, src[si] * k); out[o * 4 + 1] = Math.min(255, src[si + 1] * k); out[o * 4 + 2] = Math.min(255, src[si + 2] * k); out[o * 4 + 3] = 255;
        }
      }
    }
    // props: flat cards that keep facing us (narrowing as they turn edge-on),
    // placed at their spot in the round and depth-tested against the body
    for (const pr of rig.props || []) {
      if (pr.show && !pr.show(theta)) continue;
      const pc = pr.canvas, pw = pc.width, ph = pc.height, pdat = pc.getContext('2d').getImageData(0, 0, pw, ph).data;
      const X = pr.X, Z = pr.Z || 0;
      const cxp = ox + X * ct + Z * st, cz = -X * st + Z * ct + (pr.dz || 0);
      const k = Math.max(pr.minK == null ? 0.55 : pr.minK, Math.abs(Math.cos(theta + (pr.yaw || 0))));
      const flip = pr.flipBack && Math.cos(theta) < 0;
      const mul = Math.cos(theta) < 0 ? (pr.backMul == null ? 0.8 : pr.backMul) : 1;
      for (let yy = 0; yy < ph; yy++) for (let xx = 0; xx < pw; xx++) {
        const si = (yy * pw + xx) * 4; if (pdat[si + 3] < 100) continue;
        const u = (flip ? pw - 1 - xx : xx) - pr.ax;
        const x0 = Math.round(cxp + u * k), x1 = Math.round(cxp + (u + 1) * k);
        const Y = pr.y + yy; if (Y < 0 || Y >= h) continue;
        for (let px = x0; px < Math.max(x1, x0 + 1); px++) {
          if (px < 0 || px >= outW) continue;
          const o = Y * outW + px; if (cz <= zb[o]) continue;
          zb[o] = cz; out[o * 4] = pdat[si] * mul; out[o * 4 + 1] = pdat[si + 1] * mul; out[o * 4 + 2] = pdat[si + 2] * mul; out[o * 4 + 3] = 255;
        }
      }
    }
    const c = document.createElement('canvas'); c.width = outW; c.height = h;
    c.getContext('2d').putImageData(new ImageData(out, outW, h), 0, 0);
    return c;
  }
  // a canvas holding one frame with polygons lifted out (props, faces) and
  // optionally patched with the species' own texture
  function layerOf(name, edit) {
    const sp = Engine.sprites[name], P = painter(sp.w, sp.h);
    P.g.drawImage(srcCanvas(name), 0, 0);
    if (edit) edit(P);
    return P;
  }
  // the frame seen from behind: mirrored, then painted over by hand
  function backOf(name, edit) {
    const src = typeof name === 'string' ? srcCanvas(name) : name, P = painter(src.width, src.height);
    P.g.save(); P.g.scale(-1, 1); P.g.drawImage(src, -src.width, 0); P.g.restore();
    if (edit) edit(P);
    return P;
  }
  // a piece of a frame as its own canvas (a prop), optionally masked
  function piece(name, sx, sy, sw, sh, mask) {
    const P = painter(sw, sh);
    P.cut(name, sx, sy, sw, sh, 0, 0, { mask });
    return P.c;
  }
  const VIEW_ANGLE = [0, Math.PI / 4, Math.PI / 2, Math.PI * 3 / 4, Math.PI];
  // crop a turned canvas to its pixels; returns { P (painter over it), x0 } for hand finishing
  function cropTo(c, pad) {
    const w = c.width, h = c.height, d = c.getContext('2d').getImageData(0, 0, w, h).data;
    let x0 = w, x1 = -1;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (d[(y * w + x) * 4 + 3] > 100) { if (x < x0) x0 = x; if (x > x1) x1 = x; }
    if (x1 < 0) { x0 = 0; x1 = w - 1; }
    x0 = Math.max(0, x0 - (pad || 0)); x1 = Math.min(w - 1, x1 + (pad || 0));
    return { x0, w: x1 - x0 + 1 };
  }

  // Turn a rig to view v, crop it, let the species finish it by hand
  // (finish(P, axisX, theta)), and return the sprite anchored on its axis.
  function turned(name, rig, v, fin, opt) {
    opt = opt || {};
    const F = rig.front, w = F.width, h = F.height, outW = w * 2 + 20, ox = w + 10;
    const theta = (opt.angles || VIEW_ANGLE)[v];
    const tc = turn(rig, theta, outW, ox);
    const P0 = painter(outW, h); P0.g.drawImage(tc, 0, 0);
    if (fin) fin(P0, ox, theta);
    const cr = cropTo(P0.c, 1), P = painter(cr.w, h);
    P.g.drawImage(P0.c, -cr.x0, 0);
    if (opt.light) P.light(opt.light);
    return finish(P, Engine.sprites[name], opt.hsMul, (ox - cr.x0) / cr.w);
  }

  // A piecewise table [[yMax, value], ...] read at row y (the last entry covers the rest).
  function band(tab, y) { for (const r of tab) if (y < r[0]) return r[1]; return tab[tab.length - 1][1]; }
  // A figure rigged from a table, one entry per pose frame:
  //   A axis x; depth [[yMax, d]]; body [[yMax, xl, xr]] (xl null = no bound);
  //   erase [poly] lifted off the frame; patch [[frame, sx, sy, sw, sh, poly, mul]];
  //   props [{ r: [sx, sy, sw, sh], mask, X (anchor x in the frame), Z, ax, minK, flipBack, backMul }];
  //   stride: how far the screen-left leg steps forward (below legY).
  // cfg.back(P, spec, pose) paints the back by hand; cfg.fin(P, ox, theta, v, pose, spec) finishes a view.
  function rigged(N, cfg) {
    const specOf = p => Object.assign({}, cfg.poses[''], cfg.poses[p] || {});
    function rig(p) {
      const name = N + p, S = specOf(p);
      const front = layerOf(name, P => {
        for (const e of S.erase || []) P.erase(e);
        for (const t of S.patch || []) P.tex(t[0], t[1], t[2], t[3], t[4], t[5], { mul: t[6] });
        for (const t of S.heal || []) P.heal(t[0], t[1], t[2]);
        if (cfg.front) cfg.front(P, S, p);
      });
      const back = backOf(front.c, P => { if (cfg.back) cfg.back(P, S, p); });
      const props = (S.props || []).map(q => {
        const r = q.r, c = piece(name, r[0], r[1], r[2], r[3], q.mask);
        return Object.assign({}, q, { canvas: c, y: r[1], ax: q.ax == null ? q.X - r[0] : q.ax, X: q.X - S.A });
      });
      const zOf = S.stride ? (c, y) => (y >= S.legY ? (c < S.A ? S.stride : -S.stride) : 0) : null;
      return {
        front: front.c, back: back.c, axis: S.A, props, zOf, relight: S.relight, join: S.join, limbK: cfg.limbK,
        depth: y => { const d = band(S.depth, y); return typeof d === 'function' ? d(y) : d; },
        body: S.body ? y => { const b = band(S.body, y); return b && b[0] != null ? b : null; } : null,
      };
    }
    const recipe = (v, p) => {
      const S = specOf(p);
      return turned(N, rig(p), v, (P, ox, th) => { if (cfg.fin) cfg.fin(P, ox, th, v, p, S); }, { hsMul: S.hsMul, angles: cfg.angles });
    };
    recipe.rig = rig;
    return recipe;
  }

  // front-frame coordinates -> the mirrored back layer's coordinates
  const mir = (w, pts) => pts.map(q => [w - 1 - q[0], q[1]]);
  // Cover a face (or a visor) with the hood's own cloth when seen from behind:
  // a tile of the hood, light from the crown, a seam down the middle.
  function hoodBack(P, name, facePts, tile, opt) {
    opt = opt || {};
    const pts = mir(P.w, facePts), ys = pts.map(q => q[1]), xs = pts.map(q => q[0]);
    const y0 = Math.min(...ys), y1 = Math.max(...ys), cx = (Math.min(...xs) + Math.max(...xs)) / 2;
    P.tex(name, tile[0], tile[1], tile[2], tile[3], pts, { mul: opt.mul == null ? 0.95 : opt.mul });
    P.lightIn(pts, (x, y) => 1.1 - 0.35 * (y - y0) / Math.max(1, y1 - y0));
    if (opt.seam) P.line(at(name, opt.seam[0], opt.seam[1], 0.55), cx, opt.seamTop == null ? y0 : opt.seamTop, cx, y1);
  }

  // the opaque colours among the given points of a frame (palette for grain)
  function tones(name, pts, k) {
    const sp = Engine.sprites[name], out = [];
    for (const q of pts) { const p = sp.data[q[1] * sp.w + q[0]]; if ((p >>> 24) > 100) out.push(css([p & 255, (p >>> 8) & 255, (p >>> 16) & 255], q[2] == null ? k : q[2])); }
    return out.length ? out : ['rgb(60,56,52)'];
  }
  // A hood seen from behind over a face polygon (front coordinates): woven
  // grain in the hood's own tones, light from the crown, a seam from the tip.
  function hoodOver(P, name, face, tns, seamCol, tip) {
    const f = mir(P.w, face), ys = f.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
    P.grain(f, tns, 4, 3);
    P.lightIn(f, (x, y) => 1.08 - 0.35 * (y - y0) / Math.max(1, y1 - y0));
    const cx = Math.round((f[0][0] + f[1][0]) / 2); if (seamCol) P.line(seamCol, cx, y0 - (tip || 10), cx, y1);
  }

  return {
    mir, hoodBack, tones, hoodOver,
    turned, rigged, band,
    turn, layerOf, backOf, piece, cropTo, VIEW_ANGLE, finish,
    view, make, painter, at, css, hash, stride, sideLight, srcCanvas, SPECIES, POSES,
    has: name => !!SPECIES[name], species: () => Object.keys(SPECIES).sort(),
    clear() { cache.clear(); bytes = 0; }, budgetBytes: () => bytes, cap: CAP,
  };
})();

// ================================================================ species
// Each recipe(view, pose) returns a sprite. Views: 1 front-side, 2 side,
// 3 back-side, 4 back; unflipped, the creature faces screen-right, so its own
// right side is the one turned to us in views 1 to 3.

// ---------------------------------------------------------------- the Outrider-Captain
// Hal Brennick: long grey field coat with a shoulder cape, cross-straps and
// belt pouches, shoulder-length brown hair, a sabre in the right hand and a
// lantern held up in the left. Source: captain (79x165).
BEAST20A.SPECIES.captain = (() => {
  const B = BEAST20A, N = 'captain';
  // texture keys: hair, skin, boot leather, coat cloth from the painted front
  const pal = () => ({
    H: [N, 28, 4, 4, 16, 1], h: [N, 33, 1, 8, 4, 1.1], S: [N, 37, 9, 5, 5, 1], s: [N, 37, 9, 5, 5, 0.78], d: [N, 37, 9, 5, 5, 0.55],
    o: B.at(N, 30, 18, 0.5), e: B.at(N, 41, 15, 0.5),
    B: [N, 17, 152, 9, 10, 1], b: [N, 17, 152, 9, 10, 1.35], K: B.at(N, 18, 162, 0.55),
  });
  // profile head, facing right (15 x 25)
  const HEAD2 = [
    '....oohhhoo....',
    '..ohhhhhhhho...',
    '.oHhhhhhhhhho..',
    '.HHHHhhhhhhHo..',
    'oHHHHHHHhhHHHo.',
    'oHHHHHHHHHSSSo.',
    'HHHHHHHHHSSSSo.',
    'HHHHHHHHsSSSSo.',
    'HHHHHHHHsSSeSo.',
    'HHHHHHHHsSSeSSo',
    'HHHHHHHHsSSSSSS',
    'HHHHHHHHssSSSSo',
    'HHHHHHHHHsSSSo.',
    'HHHHHHHHHsSSSo.',
    'HHHHHHHHHssSdo.',
    'HHHHHHHHHHsSSo.',
    'oHHHHHHHHHssso.',
    '.HHHHHHHHHdso..',
    '.HHHHHHHHHdo...',
    '.HHHHHHHHdd....',
    '.oHHHHHHHdd....',
    '..HHHHHHHdd....',
    '..oHHHHHHdd....',
    '...HHHHHddd....',
    '...oHHHdddd....',
  ];
  // back of the head: hair to the shoulders (15 x 24)
  const HEAD4 = [
    '....oHHHHHo....',
    '..oHHhhhhhHHo..',
    '.oHHhhhHhhhHHo.',
    '.HHhhHHHHhhhHH.',
    'oHHhHHHHHHhhHHo',
    'oHHHHHHHHHHhHHo',
    'HHHHHHhHHHHHHHH',
    'HHHHHHhHHHHHHHH',
    'HHHHHhHHHHHHHHH',
    'HHHHHhHHHHHhHHH',
    'HHHHHhHHHHHhHHH',
    'HHHHhHHHHHHhHHH',
    'HHHHhHHHHHHHhHH',
    'HHHHhHHHHHHHhHH',
    'oHHHhHHHHHHHhHo',
    'oHHHhHHHHHHHhHo',
    '.HHHHHHHHHHHHH.',
    '.HHHHHHHHHHHHH.',
    '.oHHHHHHHHHHHo.',
    '..HHHHHHHHHHH..',
    '..oHHHHHHHHHo..',
    '...oHHddddHo...',
    '....oddssdo....',
    '.....dssssd....',
  ];
  // a boot seen from the side, toe to the right (17 x 15)
  const BOOT = [
    '....oBBBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBo......',
    '....oBbBBBBo.....',
    '....oBbBBBBo.....',
    '....oBbBBBBo.....',
    '....oBbBBBBBo....',
    '....oBbBBBBBo....',
    '....oBBbBBBBBo...',
    '...oBBBbBBBBBBo..',
    '...oBBBBbbBBBBBo.',
    '...oBBBBBBbbBBBBo',
    '...oBBBBBBBBBBBBo',
    '...oKKKKKKKKKKKKo',
    '....ooooooooooo..',
  ];
  // Hair seen from behind, painted strand by strand over the head's box (front coordinates).
  function hairBack(P, hb, w) {
    const x0 = w - 1 - hb[2], x1 = w - 1 - hb[0], y0 = hb[1], y1 = hb[3], cx = (x0 + x1) / 2;
    const shape = [[x0 + 5, y0], [x1 - 5, y0], [x1 - 1, y0 + 4], [x1 + 1, y0 + 11], [x1, y1 - 5], [x1 - 2, y1 - 1], [cx + 3, y1], [cx - 3, y1 - 1], [x0 + 2, y1], [x0, y1 - 5], [x0 - 1, y0 + 11], [x0 + 1, y0 + 4]];
    // the hair's own painted grain, lit from the crown and falling into shadow at the nape
    P.grain(shape, [B.at(N, 29, 14, 0.85), B.at(N, 33, 4, 0.85), B.at(N, 30, 9, 0.95), B.at(N, 35, 2, 1.0)], 4, 7);
    P.lightIn(shape, (x, y) => 1.18 - 0.45 * (y - y0) / (y1 - y0) - 0.12 * Math.abs(x - cx) / (x1 - x0));
    const dk = B.at(N, 29, 14, 0.7);
    for (const [ax, bx] of [[cx - 4, x0 + 2], [cx - 1, cx - 3], [cx + 2, cx + 3], [cx + 5, x1 - 2]]) P.line(dk, ax, y0 + 6, bx, y1 - 2);
  }
  const CAPE = [N, 10, 28, 20, 22], COAT = [N, 50, 100, 10, 40];
  const recipe = B.rigged(N, {
    angles: [0, Math.PI / 4, Math.PI * 0.42, Math.PI * 0.75, Math.PI],
    poses: {
      '': {
        A: 40, head: [28, 0, 47, 27],
        depth: [[26, 9], [46, 15], [100, 13], [143, y => 13 + (y - 100) * 0.14], [999, 8]],
        body: [[24, [27, 48]], [46, [8, 70]], [80, [19, 60]], [100, [15, 66]], [999, null]],
        erase: [[[57, 17], [79, 17], [79, 70], [57, 70]], [[9, 93], [16, 93], [37, 153], [30, 155]]],
        patch: [], heal: [[[[9, 96], [17, 96], [37, 150], [29, 150]], 9]],
        props: [{ r: [57, 17, 22, 53], X: 68, Z: 18, minK: 0.8 },
          { r: [8, 90, 32, 66], mask: [[9, 93], [16, 93], [37, 153], [30, 155]], X: 16, Z: 0, minK: 0.7 }],
      },
      _w1: {
        A: 41, head: [32, 0, 50, 26], legY: 130, stride: 6,
        body: [[25, [31, 51]], [52, [8, 80]], [95, [16, 68]], [999, null]],
        erase: [[[69, 50], [89, 50], [89, 104], [69, 104]], [[7, 90], [14, 90], [29, 150], [22, 152]]],
        patch: [], heal: [[[[8, 96], [15, 96], [28, 146], [21, 146]], 8]],
        props: [{ r: [69, 50, 20, 54], X: 79, Z: 10, minK: 0.8 },
          { r: [6, 88, 26, 66], mask: [[7, 90], [14, 90], [29, 150], [22, 152]], X: 13, Z: 0, minK: 0.7 }],
      },
      _w2: {
        A: 37, head: [28, 0, 46, 25], legY: 130, stride: -6,
        body: [[25, [27, 47]], [55, [6, 76]], [90, [15, 66]], [999, null]],
        erase: [[[66, 58], [85, 58], [85, 106], [66, 106]], [[7, 90], [14, 90], [29, 150], [22, 152]]],
        patch: [], heal: [[[[8, 96], [15, 96], [28, 146], [21, 146]], 8]],
        props: [{ r: [66, 58, 19, 48], X: 76, Z: 10, minK: 0.8 },
          { r: [6, 88, 26, 66], mask: [[7, 90], [14, 90], [29, 150], [22, 152]], X: 11, Z: 0, minK: 0.7 }],
      },
      _a1: {
        A: 47, head: [37, 17, 56, 45],
        depth: [[46, 9], [64, 15], [110, 13], [150, y => 13 + (y - 110) * 0.15], [999, 8]],
        body: [[46, [35, 58]], [62, [10, 85]], [100, [18, 75]], [999, null]],
        erase: [[[72, 34], [91, 34], [91, 84], [72, 84]], [[2, 30], [14, 16], [70, 0], [76, 2], [32, 24], [33, 60], [8, 62], [2, 45]]],
        patch: [],
        props: [{ r: [72, 34, 19, 50], X: 82, Z: 14, minK: 0.8 },
          { r: [0, 0, 78, 64], mask: [[2, 30], [14, 16], [70, 0], [76, 2], [32, 24], [33, 60], [8, 62], [2, 45]], X: 22, Z: 0, minK: 0.6 }],
      },
      _a2: {
        A: 43, head: [33, 0, 52, 28],
        depth: [[28, 9], [50, 15], [90, 13], [122, y => 13 + (y - 90) * 0.18], [999, 8]],
        body: [[28, [32, 54]], [62, [8, 72]], [999, null]],
        erase: [[[69, 8], [90, 8], [90, 58], [69, 58]], [[28, 46], [40, 40], [52, 46], [92, 70], [92, 76], [50, 62], [30, 62]]],
        patch: [],
        props: [{ r: [69, 8, 21, 50], X: 79, Z: 12, minK: 0.8 },
          { r: [28, 40, 64, 36], mask: [[28, 46], [40, 40], [52, 46], [92, 70], [92, 76], [50, 62], [30, 62]], X: 40, Z: 16, minK: 0.6 }],
      },
    },
    back(P, S) {
      const w = P.w, hb = S.head, cx = w - 1 - (hb[0] + hb[2]) / 2;
      // the collar of the cape closes over the neck, and the chest badge is on the other side
      P.tex(...CAPE, [[cx - 9, hb[3] - 2], [cx + 9, hb[3] - 2], [cx + 11, hb[3] + 8], [cx - 11, hb[3] + 8]]);
      P.tex(...CAPE, [[cx - 4, hb[3] + 8], [cx + 4, hb[3] + 8], [cx + 4, hb[3] + 32], [cx - 4, hb[3] + 32]]);
      hairBack(P, hb, w);
      P.light(() => 0.82);
    },
    fin(P, ox, th, v, p, S) {
      if (v !== 2) return;
      // the side view gets a drawn profile head in place of the turned one
      const hy = S.head[1];
      P.g.clearRect(ox - 12, hy, 26, S.head[3] - hy - 2);
      P.map(HEAD2, pal(), ox - 8, hy);
    },
  });
  return recipe;
})();

// ---------------------------------------------------------------- the Office Hushwarden
// A grey field-robe with a shoulder cape, a deep pointed hood over a barred
// visor, cross-straps and belt, and the warden's staff crowned with a muffled
// bell, carried in the left hand. Source: hushwarden (74x165).
BEAST20A.SPECIES.hushwarden = (() => {
  const B = BEAST20A, N = 'hushwarden';
  const HOOD = [19, 24, 5, 10];
  const staff = (dx, top) => [[50 + dx, 0 + top], [75 + dx, 0 + top], [75 + dx, 33 + top], [67 + dx, 35 + top], [68 + dx, 58], [68 + dx, 78], [66 + dx, 80], [66 + dx, 168], [55 + dx, 168], [55 + dx, 80], [52 + dx, 78], [52 + dx, 58], [55 + dx, 35 + top], [50 + dx, 33 + top]];
  return B.rigged(N, {
    angles: [0, Math.PI / 4, Math.PI * 0.42, Math.PI * 0.75, Math.PI],
    poses: {
      '': {
        A: 33, face: [[25, 15], [42, 15], [46, 30], [44, 42], [23, 42], [21, 30]],
        depth: [[45, 11], [62, 15], [100, 13], [150, y => 13 + (y - 100) * 0.1], [999, 8]],
        body: [[45, [19, 47]], [62, [0, 60]], [95, [15, 53]], [999, null]],
        erase: [staff(0, 0)], heal: [[[[50, 60], [58, 60], [58, 150], [50, 150]], -6]],
        props: [{ r: [50, 0, 25, 166], mask: staff(0, 0), X: 61, Z: 7, minK: 0.85 }],
      },
      _w1: {
        A: 33, face: [[25, 21], [42, 21], [46, 36], [44, 48], [23, 48], [21, 36]], legY: 140, stride: 5,
        erase: [staff(-4, 0)], heal: [[[[46, 60], [54, 60], [54, 150], [46, 150]], -6]],
        props: [{ r: [46, 0, 25, 167], mask: staff(-4, 0), X: 57, Z: 7, minK: 0.85 }],
        body: [[50, [19, 47]], [66, [0, 60]], [100, [14, 50]], [999, null]],
      },
      _w2: {
        A: 33, face: [[25, 21], [42, 21], [46, 36], [44, 48], [23, 48], [21, 36]], legY: 140, stride: -5,
        erase: [staff(-3, 0)], heal: [[[[47, 60], [55, 60], [55, 150], [47, 150]], -6]],
        props: [{ r: [47, 0, 24, 167], mask: staff(-3, 0), X: 58, Z: 7, minK: 0.85 }],
        body: [[50, [19, 47]], [66, [0, 60]], [100, [14, 50]], [999, null]],
      },
      _a1: {
        A: 39, face: [[32, 60], [47, 60], [50, 72], [48, 84], [31, 84], [29, 72]],
        depth: [[56, 9], [90, 12], [140, 13], [185, y => 13 + (y - 140) * 0.1], [999, 8]],
        body: [[90, [10, 70]], [999, null]],
        erase: [[[38, 0], [64, 0], [64, 32], [53, 36], [51, 62], [38, 84], [30, 80], [33, 60], [45, 34], [38, 32]]],
        heal: [[[[34, 60], [48, 60], [48, 86], [34, 86]], 10]],
        props: [{ r: [28, 0, 38, 86], mask: [[38, 0], [64, 0], [64, 32], [53, 36], [51, 62], [38, 84], [30, 80], [33, 60], [45, 34], [38, 32]], X: 45, Z: 6, minK: 0.85 }],
      },
      _a2: {
        A: 41, face: [[33, 15], [48, 15], [51, 28], [49, 38], [32, 38], [30, 28]],
        depth: [[42, 11], [60, 15], [100, 14], [135, y => 14 + (y - 100) * 0.12], [999, 8]],
        body: [[42, [27, 55]], [999, null]],
        erase: [[[26, 52], [52, 52], [49, 86], [62, 96], [62, 133], [20, 133], [23, 96], [34, 86]]],
        patch: [[N, 6, 96, 14, 30, [[24, 52], [54, 52], [62, 96], [64, 134], [18, 134], [21, 96]], 0.95]],
        props: [{ r: [18, 50, 46, 85], mask: [[26, 52], [52, 52], [49, 86], [62, 96], [62, 133], [20, 133], [23, 96], [34, 86]], X: 41, Z: 16, minK: 0.85 }],
      },
    },
    back(P, S) {
      P.grain(B.mir(P.w, S.face), [B.at(N, 27, 12), B.at(N, 30, 10), B.at(N, 26, 16), B.at(N, 24, 25), B.at(N, 42, 15), B.at(N, 44, 25, 0.9)], 4, 3);
      const f = B.mir(P.w, S.face), ys = f.map(q => q[1]), y0 = Math.min(...ys), y1 = Math.max(...ys);
      P.lightIn(f, (x, y) => 1.08 - 0.35 * (y - y0) / (y1 - y0));
      const cx = Math.round((f[0][0] + f[1][0]) / 2); P.line(B.at(N, 23, 28), cx, y0 - 10, cx, y1);
      P.light(() => 0.8);
    },
  });
})();

// ---------------------------------------------------------------- the Deacon of the Unrung Bell
// A skull-faced deacon in a long, rotted brown robe and hood, barefoot, a
// hand-bell held up in the right hand (both hands, overhead, to strike; low
// before the body for the toll). Source: deacon (62x170).
BEAST20A.SPECIES.deacon = (() => {
  const B = BEAST20A, N = 'deacon';
  // the raised right arm: bell, hand, and the sleeve falling from the forearm
  const arm = dx => [[5 + dx, 0], [20 + dx, 0], [20 + dx, 18], [18 + dx, 32], [19 + dx, 40], [18 + dx, 62], [16 + dx, 80], [0, 80], [0, 40], [6 + dx, 30], [6 + dx, 18]];
  const face = (dx, dy) => [[22 + dx, 19 + dy], [42 + dx, 19 + dy], [44 + dx, 32 + dy], [41 + dx, 45 + dy], [23 + dx, 45 + dy], [20 + dx, 32 + dy]];
  // the stole and its bead-weights hang at the front; from behind it is all robe
  const stole = (dx, dy) => [[18 + dx, 44 + dy], [47 + dx, 44 + dy], [44 + dx, 80 + dy], [21 + dx, 80 + dy]];
  const ROBE = [N, 30, 92, 10, 26];
  // the robe's shoulder and flank that the raised sleeve hid, in the robe's own cloth
  const under = dx => [N, 6, 88, 12, 30, [[17 + dx, 36], [21 + dx, 36], [21 + dx, 84], [6 + dx * 0.5, 86], [8 + dx * 0.5, 60], [12 + dx, 44]], 0.92];
  return B.rigged(N, {
    angles: [0, Math.PI / 4, Math.PI * 0.42, Math.PI * 0.75, Math.PI],
    limbK: 0.9,
    poses: {
      '': {
        A: 32, face: face(0, 0), stole: stole(0, 0),
        depth: [[45, 11], [62, 14], [110, 13], [158, y => 13 + (y - 110) * 0.07], [999, 6]],
        body: [[45, [19, 46]], [82, null], [118, [0, 50]], [999, null]],
        erase: [arm(0)], patch: [under(0)], props: [{ r: [0, 0, 22, 81], mask: arm(0), X: 11, Z: 3, minK: 0.85 }],
      },
      _w1: { A: 33, face: face(2, 0), stole: stole(2, 0), legY: 150, stride: 4, erase: [arm(2)], patch: [under(2)], props: [{ r: [0, 0, 24, 81], mask: arm(2), X: 13, Z: 3, minK: 0.85 }],
        body: [[45, [21, 48]], [82, null], [118, [0, 52]], [999, null]] },
      _w2: { A: 34, face: face(3, 0), stole: stole(3, 0), legY: 150, stride: -4, erase: [arm(5)], patch: [under(5)], props: [{ r: [0, 0, 27, 81], mask: arm(5), X: 16, Z: 3, minK: 0.85 }],
        body: [[45, [22, 49]], [82, null], [118, [0, 54]], [999, null]] },
      _a1: {
        A: 29, face: [[21, 42], [36, 42], [38, 52], [35, 63], [22, 63], [19, 52]], stole: stole(-3, 20),
        depth: [[64, 11], [92, 14], [140, 13], [178, y => 13 + (y - 140) * 0.08], [999, 6]],
        body: null,
        erase: [[[24, 0], [41, 0], [41, 22], [39, 38], [24, 38], [24, 22]]],
        props: [{ r: [23, 0, 19, 40], mask: [[24, 0], [41, 0], [41, 22], [39, 38], [24, 38], [24, 22]], X: 32, Z: 4, minK: 0.85 }],
      },
      _a2: {
        A: 30, face: [[20, 9], [40, 9], [42, 22], [39, 35], [21, 35], [18, 22]], stole: [[17, 36], [43, 36], [41, 52], [19, 52]],
        depth: [[36, 11], [55, 14], [110, 14], [142, y => 14 + (y - 110) * 0.1], [999, 6]],
        body: null,
        erase: [[[18, 52], [40, 52], [42, 85], [42, 112], [20, 112], [20, 85]]],
        heal: [[[[18, 52], [40, 52], [42, 85], [42, 112], [20, 112], [20, 85]], -15]],
        props: [{ r: [17, 50, 27, 64], mask: [[18, 52], [40, 52], [42, 85], [42, 112], [20, 112], [20, 85]], X: 30, Z: 15, minK: 0.85 }],
      },
    },
    back(P, S) {
      P.tex(...ROBE, B.mir(P.w, S.stole), { mul: 0.95 });
      B.hoodOver(P, N, S.face, B.tones(N, [[25, 18], [30, 14], [40, 25], [33, 12], [43, 34], [28, 16], [36, 15]]), B.tones(N, [[22, 30]], 0.6)[0]);
      P.light(() => 0.82);
    },
  });
})();

// Plug in: the hand-built views answer first for their species; everything else
// (the Proctor pilot, BEASTB's species, the stand-ins) falls through unchanged.
(() => {
  const _view = DIRECTIONS.view;
  DIRECTIONS.view = function (name, v, pose) {
    try {
      if (GFX.p20_beastA && v >= 1 && v <= 4 && BEAST20A.has(name)) { const s = BEAST20A.view(name, v, pose); if (s) return s; }
    } catch (err) { /* fall back to the stand-in */ }
    return _view.apply(this, arguments);
  };
  const _species = DIRECTIONS.species;
  DIRECTIONS.species = function () {
    const list = _species.apply(this, arguments);
    for (const s of list) if (BEAST20A.has(s.sprite)) s.hand = true;
    return list;
  };
})();
