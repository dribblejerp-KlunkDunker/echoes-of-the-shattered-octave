// ============================================================
//  bestiary20b — hand-built five-angle views, second half of the bestiary (Phase 20, team BEASTB)
//
//  Species (directions.js species list, sorted by sprite name, Proctor excluded, second half):
//    ln17_hollow, marine, miredrone, mites, outrider, pressman, quiet, requiem, tongueless,
//    warden, wearer, weaver, weaverling.   (mites is a swarm: symmetric by design, it keeps its one drawing.)
//
//  How the views are made. Each species has a hand-built RIG (the SPECIES table below): its body and
//  head modelled as stacks of elliptical sections (the width of each row is the painted silhouette,
//  the depth and forward lean are authored per band), with the parts that must not be wrapped onto
//  the body (arms, held tools, weapons, boots, hats) cut out of the painting by hand-drawn masks and
//  re-hung in 3D at a shoulder, hip or hand. Turning the rig and projecting it (a z-buffer, so a far
//  arm really goes behind the body) gives the front-side, side, back-side and back drawings. The front
//  half of every body is the original painting, re-lit for the new angle; the back half is painted
//  from the creature's own cloth, hide and metal (tiled patches of the same painting) plus hand-placed
//  back details (seams, hood points, straps, the press on Mallow's back). Walk frames swing the legs
//  and arms in the rig; attack frames are authored per species (wind-up and strike) and use the pose
//  frame's height and scale (hs), so the creature's size on screen never changes between views.
//
//  Everything is deterministic (no random numbers), built once per species/view/pose on demand,
//  cached and byte-budgeted. GFX.p20_beastb = false (or GFX.directions = false, or the Original preset)
//  falls back to the stand-ins exactly as before. No gameplay is touched.
// ============================================================
'use strict';

if (GFX.p20_beastb === undefined) GFX.p20_beastb = true;
if (GFX.FX && !GFX.FX.includes('p20_beastb')) GFX.FX.push('p20_beastb');

const BEASTB = (() => {
  const CAP = 6 * 1024 * 1024;
  const POSES = ['', '_w1', '_w2', '_a1', '_a2'];
  const VIEW_DARK = [1, 0.96, 0.9, 0.8, 0.7];      // the back of a creature is the side away from the light
  const DEG = Math.PI / 180;

  // ---------------------------------------------------------------- pixels (ABGR, like the engine)
  const cl8 = v => (v < 0 ? 0 : v > 255 ? 255 : v | 0);
  const pack = (r, g, b, a) => (((a == null ? 255 : a) << 24) | (cl8(b) << 16) | (cl8(g) << 8) | cl8(r)) >>> 0;
  const R = p => p & 255, Gn = p => (p >>> 8) & 255, Bn = p => (p >>> 16) & 255, A = p => p >>> 24;
  const mul = (p, f) => pack(R(p) * f, Gn(p) * f, Bn(p) * f, 255);
  const lum = p => 0.3 * R(p) + 0.59 * Gn(p) + 0.11 * Bn(p);
  function hex(s) { const n = parseInt(s.replace('#', ''), 16); return pack(n >> 16, (n >> 8) & 255, n & 255); }
  function mix(p, q, k) { return pack(R(p) + (R(q) - R(p)) * k, Gn(p) + (Gn(q) - Gn(p)) * k, Bn(p) + (Bn(q) - Bn(p)) * k, 255); }
  function hash(x, y, s) {
    let h = (Math.imul(x | 0, 374761393) + Math.imul(y | 0, 668265263) + Math.imul(s | 0, 1274126177)) | 0;
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
  }
  const sp = name => (typeof Engine !== 'undefined' && Engine.sprites ? Engine.sprites[name] : null);
  const px = (s, x, y) => (x < 0 || y < 0 || x >= s.w || y >= s.h ? 0 : s.data[(y | 0) * s.w + (x | 0)]);
  const solidPx = p => (p >>> 24) > 100;

  // ---------------------------------------------------------------- masks
  // Hand-drawn polygons in the coordinates of a source painting, rasterised to a byte mask.
  function polyMask(w, h, polys) {
    const m = new Uint8Array(w * h);
    for (const pts of polys) {
      let y0 = Infinity, y1 = -Infinity;
      for (const p of pts) { if (p[1] < y0) y0 = p[1]; if (p[1] > y1) y1 = p[1]; }
      for (let y = Math.max(0, Math.floor(y0)); y <= Math.min(h - 1, Math.ceil(y1)); y++) {
        const yc = y + 0.5, xs = [];
        for (let i = 0; i < pts.length; i++) {
          const a = pts[i], b = pts[(i + 1) % pts.length];
          if ((a[1] <= yc && b[1] > yc) || (b[1] <= yc && a[1] > yc)) xs.push(a[0] + (yc - a[1]) / (b[1] - a[1]) * (b[0] - a[0]));
        }
        xs.sort((p, q) => p - q);
        for (let k = 0; k + 1 < xs.length; k += 2) for (let x = Math.max(0, Math.ceil(xs[k] - 0.5)); x <= Math.min(w - 1, Math.floor(xs[k + 1] - 0.5)); x++) m[y * w + x] = 1;
      }
    }
    return m;
  }
  const rectPoly = (x, y, w, h) => [[x, y], [x + w, y], [x + w, y + h], [x, y + h]];

  // A cut-out: the pixels of a painting inside a mask, as a little sprite with a pivot.
  function cutout(src, polys, pivot) {
    const m = polyMask(src.w, src.h, polys);
    let x0 = src.w, y0 = src.h, x1 = -1, y1 = -1;
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) if (m[y * src.w + x] && solidPx(src.data[y * src.w + x])) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return null;
    const w = x1 - x0 + 1, h = y1 - y0 + 1, data = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const i = (y + y0) * src.w + x + x0; if (m[i] && solidPx(src.data[i])) data[y * w + x] = src.data[i]; }
    return { w, h, data, px: pivot[0] - x0, py: pivot[1] - y0 };
  }

  // A tileable patch of a painting (mirror-wrapped so it never shows a seam); holes take the patch's mean.
  function patch(src, x, y, w, h, tone) {
    const data = new Uint32Array(w * h); let r = 0, g = 0, b = 0, n = 0;
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = px(src, x + i, y + j); if (solidPx(p)) { r += R(p); g += Gn(p); b += Bn(p); n++; } }
    const mean = n ? pack(r / n, g / n, b / n) : pack(60, 56, 60);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) { const p = px(src, x + i, y + j); data[j * w + i] = solidPx(p) ? (p | 0xff000000) >>> 0 : mean; }
    if (tone) for (let i = 0; i < data.length; i++) data[i] = mix(data[i], tone[0], tone[1]);
    return { w, h, data, mean };
  }
  const wrap = (u, n) => { let m = ((u % (2 * n)) + 2 * n) % (2 * n); return m >= n ? 2 * n - 1 - m : m; };
  const tap = (pt, u, v) => pt.data[wrap(Math.floor(v), pt.h) * pt.w + wrap(Math.floor(u), pt.w)];

  // Back paintings are the front painting with its front-only features painted out by hand.
  function editable(src) { return { w: src.w, h: src.h, data: new Uint32Array(src.data), cx: src.cx }; }
  // clone stamp: copy a rectangle of the image onto another place of itself (opaque pixels only)
  function clone(img, sx, sy, w, h, dx, dy, mirror) {
    const buf = new Uint32Array(w * h);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) buf[j * w + i] = px(img, sx + i, sy + j);
    for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) {
      const p = buf[j * w + (mirror ? w - 1 - i : i)], x = dx + i, y = dy + j;
      if (!solidPx(p) || x < 0 || y < 0 || x >= img.w || y >= img.h || !solidPx(img.data[y * img.w + x])) continue;
      img.data[y * img.w + x] = p;
    }
  }
  // paint the opaque pixels inside polygons with a cloth patch (keeps the silhouette)
  function paintIn(img, polys, pt, du, dv, f) {
    const m = polyMask(img.w, img.h, polys);
    for (let y = 0; y < img.h; y++) for (let x = 0; x < img.w; x++) {
      const i = y * img.w + x; if (!m[i] || !solidPx(img.data[i])) continue;
      img.data[i] = mul(tap(pt, x + (du || 0), y + (dv || 0)), f || 1);
    }
  }

  // Inpainting: fill the pixels of a mask from their surroundings (an onion peel, then smoothing),
  // then lay the cloth's own grain back on (the high-frequency part of a patch). This is how arms and
  // tools are lifted off a body, and how faces, straps and buckles are taken off its back.
  function inpaint(img, fill, known, pt, opt) {
    const { w, h, data } = img, n = w * h;
    const r = new Float32Array(n), g = new Float32Array(n), b = new Float32Array(n), ok = new Uint8Array(n);
    // only pixels that look like the cloth being continued may feed the fill (no straps, no buckles)
    const like = opt && opt.like, tol = (opt && opt.tol) || 40;
    const near = p => !like || Math.abs(R(p) - R(like)) + Math.abs(Gn(p) - Gn(like)) + Math.abs(Bn(p) - Bn(like)) < tol * 1.6 && Math.abs((R(p) - Bn(p)) - (R(like) - Bn(like))) < tol * 0.5;
    for (let i = 0; i < n; i++) if (known[i] && !fill[i] && solidPx(data[i]) && near(data[i])) { ok[i] = 1; r[i] = R(data[i]); g[i] = Gn(data[i]); b[i] = Bn(data[i]); }
    // Mirror mode (opt.axis): the cloth beside the hole, reflected across an authored vertical axis, so
    // folds, hems and belts carry on as painted. Vertical mode (opt.vertical): each column is bridged
    // from the cloth just above to the cloth just below (thin straps, buckles, pouches).
    const fillFrom = (i, j, k, j2) => { if (j2 == null) { r[i] = r[j]; g[i] = g[j]; b[i] = b[j]; } else { r[i] = r[j] + (r[j2] - r[j]) * k; g[i] = g[j] + (g[j2] - g[j]) * k; b[i] = b[j] + (b[j2] - b[j]) * k; } };
    if (opt && (opt.axis != null || opt.vertical)) {
      const got = [];
      for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
        const i = y * w + x; if (!fill[i]) continue;
        if (opt.axis != null) {
          let xs = Math.round(2 * opt.axis - x);
          const dir = xs > x ? 1 : -1;
          while (xs >= 0 && xs < w && !ok[y * w + xs] && Math.abs(xs - x) < w) xs += dir;
          if (xs >= 0 && xs < w && ok[y * w + xs]) { fillFrom(i, y * w + xs); got.push(i); }
        } else {
          let ya = y, yb = y; while (ya >= 0 && !ok[ya * w + x]) ya--; while (yb < h && !ok[yb * w + x]) yb++;
          if (ya >= 0 && yb < h) { fillFrom(i, ya * w + x, (y - ya) / (yb - ya), yb * w + x); got.push(i); }
          else if (ya >= 0) { fillFrom(i, ya * w + x); got.push(i); } else if (yb < h) { fillFrom(i, yb * w + x); got.push(i); }
        }
      }
      for (const i of got) { const x = i % w, y = (i / w) | 0; let a = r[i], c = g[i], d = b[i];
        if (pt && opt.grain) { const q = tap(pt, x + (opt.du || 0), y + (opt.dv || 0)); a += (R(q) - R(pt.mean)) * opt.grain; c += (Gn(q) - Gn(pt.mean)) * opt.grain; d += (Bn(q) - Bn(pt.mean)) * opt.grain; }
        data[i] = pack(a, c, d, 255); fill[i] = 0; }
      for (const i of got) ok[i] = 1;
    }
    let todo = []; for (let i = 0; i < n; i++) if (fill[i]) todo.push(i);
    const want = todo.slice();
    const vert = (opt && opt.vert) || 1;      // cloth falls vertically: weight vertical neighbours more
    for (let pass = 0; pass < 400 && todo.length; pass++) {
      const next = [], set = [];
      for (const i of todo) {
        const x = i % w, y = (i / w) | 0; let sr = 0, sg = 0, sb = 0, sw = 0;
        for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) {
          if (!dx && !dy) continue; const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
          const j = yy * w + xx; if (!ok[j]) continue; const wt = (dx ? 1 : vert) * (dx && dy ? 0.7 : 1);
          sr += r[j] * wt; sg += g[j] * wt; sb += b[j] * wt; sw += wt;
        }
        if (sw) set.push([i, sr / sw, sg / sw, sb / sw]); else next.push(i);
      }
      if (!set.length) break;
      for (const [i, a, c, d] of set) { r[i] = a; g[i] = c; b[i] = d; ok[i] = 1; }
      todo = next;
    }
    for (let it = 0; it < ((opt && opt.smooth) || 60); it++) for (const i of want) {
      const x = i % w, y = (i / w) | 0; let sr = 0, sg = 0, sb = 0, sw = 0;
      for (const [dx, dy, wt] of [[-1, 0, 1], [1, 0, 1], [0, -1, vert], [0, 1, vert]]) {
        const xx = x + dx, yy = y + dy; if (xx < 0 || yy < 0 || xx >= w || yy >= h) continue;
        const j = yy * w + xx; if (!ok[j]) continue; sr += r[j] * wt; sg += g[j] * wt; sb += b[j] * wt; sw += wt;
      }
      if (sw) { r[i] = sr / sw; g[i] = sg / sw; b[i] = sb / sw; }
    }
    const k = opt && opt.grain != null ? opt.grain : 1, du = (opt && opt.du) || 0, dv = (opt && opt.dv) || 0;
    const mr = pt ? R(pt.mean) : 0, mg = pt ? Gn(pt.mean) : 0, mb = pt ? Bn(pt.mean) : 0;
    for (const i of want) {
      if (!ok[i]) { if (!pt) continue; r[i] = R(pt.mean); g[i] = Gn(pt.mean); b[i] = Bn(pt.mean); }
      const x = i % w, y = (i / w) | 0;
      let a = r[i], c = g[i], d = b[i];
      if (pt) { const q = tap(pt, x + du, y + dv); a += (R(q) - mr) * k; c += (Gn(q) - mg) * k; d += (Bn(q) - mb) * k; }
      data[i] = pack(a, c, d, 255);
    }
  }
  // A clean painting for a rig: the parts (arms, tools) lifted off, the body behind them painted in.
  //   body: polygons of the body's true silhouette; remove: polygons of what is lifted off.
  function cleanPainting(src, body, remove, pt, opt) {
    const img = editable(src), n = src.w * src.h;
    const inBody = polyMask(src.w, src.h, body), rm = polyMask(src.w, src.h, remove);
    const fill = new Uint8Array(n), known = new Uint8Array(n);
    for (let i = 0; i < n; i++) {
      if (rm[i]) { if (inBody[i]) fill[i] = 1; else img.data[i] = 0; }
      else if (inBody[i] && solidPx(src.data[i])) known[i] = 1;
    }
    inpaint(img, fill, known, pt, opt);
    return img;
  }
  // Paint features out of an image (for a back): inside the polygons, from the rest of the image.
  function paintOut(img, polys, pt, opt) {
    const n = img.w * img.h, fill = polyMask(img.w, img.h, polys), known = new Uint8Array(n);
    for (let i = 0; i < n; i++) { if (fill[i] && !solidPx(img.data[i])) fill[i] = 0; if (!fill[i] && solidPx(img.data[i])) known[i] = 1; }
    if (opt && opt.from) { const f = polyMask(img.w, img.h, opt.from); for (let i = 0; i < n; i++) known[i] = known[i] && f[i]; }
    inpaint(img, fill, known, pt, opt);
  }

  // ---------------------------------------------------------------- the canvas
  function canvas(w, h) { return { w, h, col: new Uint32Array(w * h), z: new Float32Array(w * h).fill(-1e9), id: new Uint8Array(w * h), n: 0 }; }
  function put(C, x, y, z, c, id) {
    if (x < 0 || y < 0 || x >= C.w || y >= C.h) return;
    const i = y * C.w + x;
    if (z < C.z[i]) return;
    C.z[i] = z; C.col[i] = c; C.id[i] = id;
  }

  // The light: from the viewer's upper left, a little toward the camera (screen space).
  const LX = -0.3, LZ = 0.95;

  // ---------------------------------------------------------------- stacks (bodies and heads)
  // A stack is a column of elliptical sections, one per painted row: half-width and centre from the
  // painting's silhouette (inside the stack's mask), depth and forward offset authored per row.
  function buildStack(src, ax, def) {
    const m = polyMask(src.w, src.h, def.mask);
    const rows = [];
    for (let y = 0; y < src.h; y++) {
      let xl = -1, xr = -1;
      for (let x = 0; x < src.w; x++) if (m[y * src.w + x] && solidPx(src.data[y * src.w + x])) { if (xl < 0) xl = x; xr = x; }
      if (xl < 0) { rows.push(null); continue; }
      const al = Math.max(1, (xr - xl + 1) / 2), cl = (xl + xr + 1) / 2 - ax;
      const t = def.depth(y, al);
      rows.push({ cl, al, af: Math.max(1, t), cf: def.fwd ? def.fwd(y) : 0, xl, xr });
    }
    return { m, rows, def, img: src };
  }

  // Paint a stack at view angle th. ymap(yt) -> source row (or -1), shear(yt) -> extra screen x.
  // The front half samples the painting, the back half samples the stack's back painting (the same
  // painting with its front-only features painted out by hand: S.backSrc), mirrored. Columns are
  // picked by a blend of projection (exact when facing us) and arc length (no smearing on the flanks).
  function drawStack(C, S, st, th, ax, axT, ymap, shear, id, opt) {
    const sn = Math.sin(th), cs = Math.cos(th), src = st.img, bsrc = (opt && opt.backSrc) || S.backSrc || src;
    const wArc = Math.min(0.85, Math.abs(sn) * 0.9), edgeIn = (opt && opt.edgeIn) || 2;
    const backTone = opt && opt.backTone;
    const colOf = (row, ang) => {   // ang in [-pi/2, pi/2] from the facing centre
      const m = (1 - wArc) * Math.sin(ang) + wArc * ang / (Math.PI / 2);
      return Math.round(ax + row.cl + (row.al - edgeIn) * m - 0.5);
    };
    for (let yt = 0; yt < C.h; yt++) {
      const ys = ymap(yt); if (ys < 0 || ys >= src.h) continue;
      const yi = ys | 0, row = st.rows[yi]; if (!row) continue;
      const dx = shear ? shear(yt, ys) : 0;
      const A_ = row.af * sn, B_ = row.al * cs, Rr = Math.hypot(A_, B_);
      const s0 = row.cf * sn + row.cl * cs, del = Math.atan2(B_, A_);
      const zc = row.cf * cs + row.cl * sn;
      const xa = Math.floor(axT + dx + s0 - Rr - 1), xb = Math.ceil(axT + dx + s0 + Rr + 1);
      for (let x = xa; x <= xb; x++) {
        const s = x + 0.5 - axT - dx - s0;
        if (Math.abs(s) > Rr) continue;
        const ac = Math.acos(Math.max(-1, Math.min(1, s / Rr)));
        let phi = del + ac, phi2 = del - ac;
        const z1 = row.af * Math.cos(phi) * cs + row.al * Math.sin(phi) * sn, z2 = row.af * Math.cos(phi2) * cs + row.al * Math.sin(phi2) * sn;
        let z = z1; if (z2 > z1) { phi = phi2; z = z2; }
        phi = Math.atan2(Math.sin(phi), Math.cos(phi));
        const cphi = Math.cos(phi), sphi = Math.sin(phi);
        let nf = cphi / row.af, nl = sphi / row.al; const nn = Math.hypot(nf, nl) || 1; nf /= nn; nl /= nn;
        const nx = nf * sn + nl * cs, nz = nf * cs + nl * sn;
        const litNow = 0.55 + 0.55 * Math.max(0, LX * nx + LZ * nz);
        let c = 0;
        const clampX = xs => Math.max(row.xl + 1, Math.min(row.xr - 1, xs));
        const take = (img, xs) => { const xx = clampX(xs), p = px(img, xx, yi); return solidPx(p) && st.m[yi * src.w + xx] ? p : 0; };
        if (cphi >= 0) {
          const p = take(src, colOf(row, phi));
          const n0 = Math.max(0, LX * sphi + LZ * cphi);
          if (p) c = mul(p, Math.sqrt(Math.max(0.5, Math.min(1.4, litNow / (0.55 + 0.55 * n0)))));
        }
        if (cphi < 0.18) {
          // the back: mirrored, so the creature's own right stays on its right
          const pb = phi > 0 ? Math.PI - phi : -Math.PI - phi;
          let p = take(bsrc, colOf(row, -pb));
          if (p) {
            if (backTone) p = mix(p, backTone[0], backTone[1]);
            const pc = mul(p, Math.max(0.55, Math.min(1.2, litNow / 0.95)));
            c = c && cphi >= 0 ? mix(pc, c, cphi / 0.18) : pc;
          }
        }
        if (!c) continue;
        put(C, x, yt, zc + z, c, id);
      }
    }
  }

  // An arm or a haft: a tapered limb between two body-frame points (f, l, canvas y), textured from a
  // patch and shaded round, with depth interpolated along it.
  function drawLimb(C, th, axT, a, b, w0, w1, pt, id, shade) {
    const sn = Math.sin(th), cs = Math.cos(th);
    const P0 = { x: axT + a.f * sn + a.l * cs, y: a.y, z: a.f * cs + a.l * sn + (a.dz || 0) };
    const P1 = { x: axT + b.f * sn + b.l * cs, y: b.y, z: b.f * cs + b.l * sn + (b.dz || 0) };
    const dx = P1.x - P0.x, dy = P1.y - P0.y, len = Math.hypot(dx, dy) || 1, ux = dx / len, uy = dy / len;
    const x0 = Math.floor(Math.min(P0.x, P1.x) - Math.max(w0, w1)), x1 = Math.ceil(Math.max(P0.x, P1.x) + Math.max(w0, w1));
    const y0 = Math.floor(Math.min(P0.y, P1.y) - Math.max(w0, w1)), y1 = Math.ceil(Math.max(P0.y, P1.y) + Math.max(w0, w1));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const qx = x + 0.5 - P0.x, qy = y + 0.5 - P0.y;
      let t = (qx * ux + qy * uy) / len; const d = -qx * uy + qy * ux;
      if (t < -0.08 || t > 1.08) continue;
      const tc = Math.max(0, Math.min(1, t)), hw = (w0 + (w1 - w0) * tc) / 2;
      if (Math.abs(d) > hw) continue;
      const across = d / hw;                               // -1..1 across the limb
      const f = (0.58 + 0.55 * Math.sqrt(Math.max(0, 1 - across * across)) - 0.12 * across * Math.sign(ux || 1)) * (shade || 1);
      const c = mul(tap(pt, (across + 1) * pt.w / 2, t * len), f);
      put(C, x, y, P0.z + (P1.z - P0.z) * tc + 1, c, id || 40);
    }
  }

  // A cut-out turned so that the direction (dx, dy) in its own pixels becomes its x axis.
  function alignCut(cut, dx, dy) {
    const a = -Math.atan2(dy, dx), ca = Math.cos(a), sa = Math.sin(a);
    const pts = [[0, 0], [cut.w, 0], [0, cut.h], [cut.w, cut.h]].map(([u, v]) => [(u - cut.px) * ca - (v - cut.py) * sa, (u - cut.px) * sa + (v - cut.py) * ca]);
    const x0 = Math.floor(Math.min(...pts.map(p => p[0]))), x1 = Math.ceil(Math.max(...pts.map(p => p[0])));
    const y0 = Math.floor(Math.min(...pts.map(p => p[1]))), y1 = Math.ceil(Math.max(...pts.map(p => p[1])));
    const w = x1 - x0, h = y1 - y0, data = new Uint32Array(w * h);
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const X = x + 0.5 + x0, Y = y + 0.5 + y0;
      const u = X * ca + Y * sa + cut.px, v = -X * sa + Y * ca + cut.py;
      if (u < 0 || v < 0 || u >= cut.w || v >= cut.h) continue;
      data[y * w + x] = cut.data[(v | 0) * cut.w + (u | 0)];
    }
    return { w, h, data, px: -x0, py: -y0 };
  }
  // Draw an aligned cut (its x axis = its length) pointing along a body-frame direction (f, l, up).
  function drawAlong(C, cut, th, axT, at, dir, opt) {
    const sn = Math.sin(th), cs = Math.cos(th);
    const sx = dir.f * sn + dir.l * cs, sy = -dir.up, n3 = Math.hypot(dir.f, dir.l, dir.up) || 1;
    const k = Math.max(0.3, Math.hypot(sx, sy) / n3);
    const rot = Math.atan2(sy, sx) / DEG;
    // keep the cut's top edge up: a blade pointing left is mirrored rather than upside down
    const left = sx < 0;
    drawCut(C, cut, th, axT, at.f, at.l, at.y, left ? rot - 180 : rot, Object.assign({ kx: k, mirror: left, dz: (opt && opt.dz) || 0 }, opt, { rotMirror: left }));
  }

  // Draw a cut-out at a 3D point (f, l, y in source rows), rotated (deg), scaled; z constant.
  function drawCut(C, cut, th, axT, f, l, ysT, rot, opt) {
    if (!cut) return;
    opt = opt || {};
    const sn = Math.sin(th), cs = Math.cos(th);
    const sx = axT + f * sn + l * cs, z = f * cs + l * sn + (opt.dz || 0);
    const kx = (opt.kx == null ? 1 : opt.kx) * (opt.mirror ? -1 : 1), ky = opt.ky == null ? 1 : opt.ky;
    const a = (rot || 0) * DEG, ca = Math.cos(a), sa = Math.sin(a);
    const shade = opt.shade == null ? 1 : opt.shade;
    // bounding box of the transformed cut
    const corners = [[-cut.px, -cut.py], [cut.w - cut.px, -cut.py], [-cut.px, cut.h - cut.py], [cut.w - cut.px, cut.h - cut.py]];
    let x0 = Infinity, x1 = -Infinity, y0 = Infinity, y1 = -Infinity;
    for (const [u, v] of corners) { const X = u * kx * ca - v * ky * sa, Y = u * kx * sa + v * ky * ca; x0 = Math.min(x0, X); x1 = Math.max(x1, X); y0 = Math.min(y0, Y); y1 = Math.max(y1, Y); }
    for (let y = Math.floor(ysT + y0) - 1; y <= Math.ceil(ysT + y1) + 1; y++) for (let x = Math.floor(sx + x0) - 1; x <= Math.ceil(sx + x1) + 1; x++) {
      const X = x + 0.5 - sx, Y = y + 0.5 - ysT;
      const u = (X * ca + Y * sa) / kx + cut.px, v = (-X * sa + Y * ca) / ky + cut.py;
      if (u < 0 || v < 0 || u >= cut.w || v >= cut.h) continue;
      const p = cut.data[(v | 0) * cut.w + (u | 0)]; if (!solidPx(p)) continue;
      let c = shade === 1 ? p : mul(p, shade);
      if (opt.tint) c = mix(c, opt.tint[0], opt.tint[1]);
      put(C, x, y, z, c | 0xff000000, opt.id || 200);
    }
  }

  // Filled polygon in screen space at depth z, painted by a brush (x, y) -> colour.
  function fillPoly(C, pts, z, brush, id) {
    const m = { w: C.w, h: C.h };
    const mk = polyMask(m.w, m.h, [pts]);
    for (let y = 0; y < C.h; y++) for (let x = 0; x < C.w; x++) if (mk[y * C.w + x]) { const c = brush(x, y); if (c) put(C, x, y, typeof z === 'function' ? z(x, y) : z, c, id || 150); }
  }
  // Project a body-frame point to screen x and depth.
  const proj = (th, axT, f, l) => ({ x: axT + f * Math.sin(th) + l * Math.cos(th), z: f * Math.cos(th) + l * Math.sin(th) });

  // ---------------------------------------------------------------- finishing
  function finish(C, v, ink) {
    const { w, h, col, id } = C, out = new Uint32Array(w * h), dark = VIEW_DARK[v];
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const i = y * w + x, c = col[i]; if (!c) continue;
      let f = dark;
      // a dark pixel-art outline on the silhouette
      const edge = (x === 0 || !col[i - 1]) || (x === w - 1 || !col[i + 1]) || (y === 0 || !col[i - w]) || (y === h - 1 || !col[i + w]);
      if (edge) { out[i] = ink ? mix(c, ink, 0.6) : mul(c, 0.45 * dark); continue; }
      // a softer seam where a nearer part overlaps a farther one
      const zi = C.z[i];
      if (id[i] !== id[i - 1] && C.z[i - 1] < zi - 2.5 || id[i] !== id[i + 1] && C.z[i + 1] < zi - 2.5 || id[i] !== id[i - w] && C.z[i - w] < zi - 2.5 || id[i] !== id[i + w] && C.z[i + w] < zi - 2.5) f *= 0.72;
      out[i] = mul(c, f);
    }
    return out;
  }

  // ---------------------------------------------------------------- poses
  // Pose canvases match the painted pose frame: same height, same hs, the feet on the bottom row.
  function poseFrame(name, pose) { return sp(name + pose) || sp(name); }

  // ---------------------------------------------------------------- the species
  const SPECIES = {};
  const built = new Map();     // name -> prepared rig (cut-outs, stacks, patches)

  function prep(name) {
    if (built.has(name)) return built.get(name);
    const def = SPECIES[name], src = sp(name);
    if (!def || !src) return null;
    const S = { name, src, ax: (src.cx == null ? 0.5 : src.cx) * src.w, def };
    def.prep(S, src);
    built.set(name, S);
    return S;
  }

  const cache = new Map(); let bytes = 0, stamp = 0;
  function evict(need) {
    while (bytes + need > CAP && cache.size) {
      let ok = null, ov = null;
      for (const [k, en] of cache) if (!ov || en.used < ov.used) { ok = k; ov = en; }
      bytes -= ov.sprite.data.byteLength; cache.delete(ok);
    }
  }

  function render(name, v, pose) {
    const S = prep(name); if (!S) return null;
    const fr = poseFrame(name, pose), idle = S.src;
    const hs = fr === idle ? (idle.hs || 1) : (fr.hs || fr.h / idle.h);
    // canvas height keeps the pose frame's scale: hs * idle height
    const H = Math.round(hs * idle.h);
    const W = S.def.W || Math.round(idle.w * 1.5);
    const C = canvas(W, H);
    const axT = S.def.axT != null ? S.def.axT : W / 2;
    const th = v * 45 * DEG;
    const P = S.def.pose(pose || '', v);
    P.lift = P.lift || 0;
    P.H = H; P.drop = Math.max(0, idle.h - H);
    S.def.draw(C, S, th, axT, P, v);
    const data = finish(C, v, S.def.ink);
    // never two identical drawings for different poses (a pixel of the outline moves)
    return { w: W, h: H, data, hs, cx: axT / W, dy: 0 };
  }

  function view(name, v, pose) {
    if (!SPECIES[name] || !(v >= 1 && v <= 4)) return null;
    const key = name + ':' + v + ':' + (pose || '');
    const hit = cache.get(key);
    if (hit) { hit.used = ++stamp; return hit.sprite; }
    const sprite = render(name, v, pose || '');
    if (!sprite) return null;
    evict(sprite.data.byteLength);
    cache.set(key, { sprite, used: ++stamp }); bytes += sprite.data.byteLength;
    return sprite;
  }

  // ---------------------------------------------------------------- shared rig helpers
  // Vertical mapping for a pose: the figure stands on the bottom row; a crouch (canvas shorter than
  // the idle painting) bends at the knee row, compressing the legs and the skirt below it.
  function ymapper(S, P) {
    const idleH = S.src.h, H = P.H, knee = S.def.knee || Math.round(idleH * 0.62);
    const up = Math.round(P.lift || 0);
    if (H >= idleH) { const off = H - idleH; return yt => { const y = yt - off + up; return y >= idleH ? -1 : y; }; }
    const drop = idleH - H, kT = knee - drop;
    return yt => {
      const y = yt + up;
      if (y < kT) return y + drop;
      const t = (y - kT) / Math.max(1, H - kT);
      const ys = knee + t * (idleH - knee);
      return ys >= idleH ? -1 : ys | 0;
    };
  }
  // where a source row lands on the canvas (inverse of ymapper, for hanging parts)
  function rowT(S, P, ys) {
    const idleH = S.src.h, H = P.H, knee = S.def.knee || Math.round(idleH * 0.62);
    const up = Math.round(P.lift || 0);
    if (H >= idleH) return ys + (H - idleH) - up;
    const drop = idleH - H;
    if (ys < knee) return ys - drop - up;
    return knee - drop + (ys - knee) / (idleH - knee) * (H - (knee - drop)) - up;
  }
  // forward lean: rows above the hip move along the heading
  function shearer(S, P, th) {
    const lean = P.lean || 0, hip = S.def.hip || S.src.h * 0.5, sn = Math.sin(th);
    if (!lean) return null;
    return (yt, ys) => (ys < hip ? lean * (hip - ys) / hip * sn : 0);
  }
  // a cloth band painter for the back half of a stack: tiled patch by row band
  function bandBack(bands, extra) {
    return (row, ys, sphi, cphi, x, yt) => {
      for (const b of bands) if (ys >= b.y0 && ys < b.y1) {
        // u runs around the section: arc position, so folds wrap continuously
        const u = Math.atan2(sphi, cphi) * row.al * 0.9 + (b.du || 0);
        let c = tap(b.pt, u, ys - b.y0 + (b.dv || 0));
        if (extra) c = extra(c, row, ys, sphi, cphi, b) || c;
        return c;
      }
      return 0;
    };
  }

  return { SPECIES, view, render, prep, cache, budgetBytes: () => bytes, cap: CAP, clear() { cache.clear(); bytes = 0; },
    poses: POSES,
    lib: { inpaint, cleanPainting, paintOut, editable, clone, paintIn, drawLimb, alignCut, drawAlong, polyMask, rectPoly, cutout, patch, tap, wrap, buildStack, drawStack, drawCut, fillPoly, proj, ymapper, rowT, shearer, bandBack, hex, mix, mul, pack, lum, hash, px, solidPx, R, Gn, Bn, A, put } };
})();

// ================================================================ species rigs
(() => {
  const L = BEASTB.lib, SP = BEASTB.SPECIES;
  const { cleanPainting, paintOut, cutout, patch, buildStack, drawStack, drawCut, drawLimb, alignCut, drawAlong, ymapper, rowT, shearer, editable, clone, paintIn, hex, mix, mul, tap, proj } = L;

  // Walk and attack parameters shared by the bipeds: step (-1..1), arm swing, lift, lean.
  function bipedPose(pose) {
    if (pose === '_w1') return { step: 1, swing: 1, lift: 1 };
    if (pose === '_w2') return { step: -1, swing: -1, lift: 1 };
    if (pose === '_a1') return { atk: 1, lean: -2 };
    if (pose === '_a2') return { atk: 2, lean: 8 };
    return { step: 0, swing: 0 };
  }
  // Boots: two cut-outs that stride along the heading; seen from the side they lengthen (the toe).
  function boots(C, S, th, axT, P, v, bR, bL, lR, lL, yRow) {
    const sn = Math.sin(th), step = P.step || 0, back = v >= 3, yb = rowT(S, P, yRow);
    const kx = 0.8 + 0.5 * Math.abs(sn), stride = 6 * step;
    drawCut(C, bR, th, axT, -stride + 1, lR, yb - (step < 0 ? 2 : 0), 0, { kx, mirror: back, shade: 0.92, id: 11 });
    drawCut(C, bL, th, axT, stride + 1, lL, yb - (step > 0 ? 2 : 0), 0, { kx, mirror: back, shade: 0.92, id: 12 });
  }
  // A held arm cut-out, hung from its shoulder and swung by the walk.
  function hangArm(C, cut, th, axT, P, v, l, yS, sw, id) {
    const cs = Math.cos(th);
    drawCut(C, cut, th, axT, 0, l, yS, sw, { kx: 0.78 + 0.22 * Math.abs(cs), shade: v >= 3 ? 0.82 : 1, dz: 2, id });
  }
  // The head row map: the head follows the body's row map, lowered into a strike.
  const headMap = (ym, drop) => yt => { const y = ym(yt); return y < 0 ? -1 : y - drop < 0 ? -1 : y - drop; };

  // ---------------------------------------------------------------- Cutter-Man (marine)
  // Office boarding crew: grey oilcloth hooded coat with a shoulder mantle, a blank face-plate in the
  // hood, crossed leather straps and a belt with pouches, a coiled grapnel line in the right hand and
  // a cudgel in the left. Attack: the grapnel swung up two-handed (a1) and driven down (a2).
  SP.marine = {
    W: 112, axT: 52, knee: 112, hip: 92,
    prep(S, src) {
      const a1 = Engine.sprites.marine_a1 || src;
      const cloth = patch(src, 28, 100, 16, 40), hood = patch(src, 13, 14, 6, 24), mantle = patch(src, 44, 44, 12, 10);
      // the coat's own silhouette, under the line and the cudgel arm
      const body = [[[22, 2], [42, 2], [50, 40], [58, 46], [58, 62], [55, 80], [57, 120], [61, 150], [6, 150], [8, 110], [9, 70], [6, 52], [14, 40]]];
      const lift = [[[0, 50], [12, 50], [19, 58], [21, 70], [22, 150], [0, 150]], [[51, 48], [75, 14], [75, 100], [53, 100], [53, 70]]];
      S.front = cleanPainting(src, body, [lift[0]], cloth, { axis: 22.5 });
      S.front = cleanPainting(S.front, body, [lift[1]], cloth, { axis: 51.5 });
      S.body = buildStack(S.front, S.ax, {
        mask: [[[0, 40], [75, 40], [75, 150], [0, 150]]],
        depth: (y, al) => (y < 56 ? al * 0.6 : y < 72 ? al * 0.66 : al * 0.74),
        fwd: y => (y < 56 ? -1 : y > 120 ? 1 : 0),
      });
      S.head = buildStack(S.front, S.ax, {
        mask: [[[17, 0], [47, 0], [50, 40], [14, 40]]],
        depth: (y, al) => al * (y < 10 ? 1.1 : 0.98),
        fwd: y => (y < 12 ? -6 + y * 0.45 : y > 34 ? -1 : 0),
      });
      S.armR = cutout(src, lift.slice(0, 1), [12, 54]);       // the line and grapnel (screen left)
      S.armL = cutout(src, lift.slice(1), [54, 54]);          // the cudgel hand (screen right)
      S.bootR = cutout(src, [[[6, 146], [30, 146], [30, 160], [6, 160]]], [18, 147]);
      S.bootL = cutout(src, [[[36, 146], [60, 146], [60, 160], [36, 160]]], [48, 147]);
      S.coil = cutout(src, [[[0, 60], [24, 60], [24, 120], [0, 120]]], [12, 64]);
      // the grapnel from the wind-up painting, turned so its haft is its length (fist -> head)
      const g = cutout(a1, [[[0, 26], [44, 4], [50, 0], [68, 0], [68, 24], [50, 24], [22, 42], [0, 46]]], [12, 35]);
      S.grap = alignCut(g, 44, -25);
      S.sleeve = patch(src, 50, 58, 8, 16);
      // the back: no face-plate, no straps, no buckle or pouches; a centre seam down the coat
      const B = editable(S.front);
      paintOut(B, [[[20, 9], [44, 9], [45, 44], [19, 44]]], hood, { grain: 0, smooth: 80 });
      paintOut(B, [[[18, 42], [50, 42], [52, 62], [16, 62]]], mantle, { grain: 0.9, smooth: 40, vert: 0.4, from: [[[0, 43], [75, 43], [75, 62], [0, 62]]] });
      clone(B, 18, 96, 38, 26, 18, 70);
      clone(B, 21, 63, 9, 7, 30, 63); clone(B, 21, 63, 9, 7, 39, 63);
      for (let y = 6; y < 150; y++) { const x = Math.round(S.ax); const i = y * B.w + x; if (L.solidPx(B.data[i]) && (y < 41 || y > 70)) B.data[i] = mul(B.data[i], 0.75); }
      S.backSrc = B;
    },
    pose: bipedPose,
    draw(C, S, th, axT, P, v) {
      const ym = ymapper(S, P), sh = shearer(S, P, th), sn = Math.sin(th), atk = P.atk || 0;
      boots(C, S, th, axT, P, v, S.bootR, S.bootL, -10, 12, 147);
      drawStack(C, S, S.body, th, S.ax, axT, ym, sh, 1);
      const lean = (P.lean || 0) * sn;
      drawStack(C, S, S.head, th, S.ax, axT + lean, headMap(ym, atk === 2 ? 4 : 0), null, 2);
      const shY = rowT(S, P, 54);
      if (!atk) {
        const sw = (P.swing || 0) * 9;
        hangArm(C, S.armR, th, axT, P, v, -19, shY, sw, 21);
        hangArm(C, S.armL, th, axT, P, v, 21, shY, -sw, 22);
        return;
      }
      drawCut(C, S.coil, th, axT, -2, -18, rowT(S, P, 66), 0, { kx: 0.8, shade: 0.9, dz: 1, id: 21 });
      const up = atk === 1;
      const hand = up ? { f: 2, l: -15, y: rowT(S, P, 30) } : { f: 21, l: 0, y: rowT(S, P, 100) };
      const dzF = 7 * Math.max(0, Math.cos(th));
      for (const l of [-22, 22]) drawLimb(C, th, axT, { f: 8, l, y: shY + 1, dz: dzF }, Object.assign({}, hand, { dz: dzF + 2 }), 11, 8, S.sleeve, 30 + (l > 0 ? 1 : 0), l > 0 ? 1 : 0.85);
      drawAlong(C, S.grap, th, axT, hand, up ? { f: -0.55, l: 0.5, up: 0.5 } : { f: 0.7, l: 0.1, up: -0.7 }, { dz: 6, id: 32 });
    },
  };
})();

// ================================================================ the hook
// DIRECTIONS.view is the one place a five-angle view is chosen (directions.js wraps the engine's
// sprite chooser through it). Our species answer here; everyone else falls through untouched.
(() => {
  if (typeof DIRECTIONS === 'undefined') return;
  const _view = DIRECTIONS.view;
  DIRECTIONS.view = function (name, v, pose) {
    if (GFX.p20_beastb && BEASTB.SPECIES[name] && v >= 1 && v <= 4) {
      try { const s = BEASTB.view(name, v, pose || ''); if (s) return s; } catch (err) { if (!BEASTB._warned) { BEASTB._warned = true; console.warn('bestiary20b', err); } }
    }
    return _view.apply(this, arguments);
  };
})();
