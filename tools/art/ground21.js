#!/usr/bin/env node
// ============================================================
//  tools/art/ground21.js — Phase 21 GROUND: draw the close-up detail textures (256 x 256 pixel art, one per floor,
//  ground, wall and ceiling texture) with the same deterministic generator the game runs (js/ground21-art.js), and
//  check them: palette size, 16 x 16 block means against the base texture, seamless wrap.
//
//  The game draws these at load time in a Web Worker (cheaper than shipping ~2 MB of PNGs, and it covers textures other
//  modules paint at run time, winter swaps included). This tool is for looking at them and for the tests:
//
//    node tools/art/ground21.js <textures.json> <outdir> [--sheet] [--png8]
//
//  textures.json: { name: base64 of the 64 x 64 RGBA bytes } (test/ground21.test.js writes one from Engine.textures).
//  Writes <outdir>/<name>.png (the 256 x 256 detail, PNG-8 when --png8: palette-quantised, to report what shipping them
//  as files would weigh), <outdir>/sheet.png (base 4x beside detail, every texture) with --sheet, and prints a JSON
//  summary: per texture family, colours, block-mean error (max, mean), seam ratio, checksum.
// ============================================================
'use strict';
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const ART = require(path.join(__dirname, '..', '..', 'js', 'ground21-art.js'));

const CRC = new Int32Array(256).map((_, n) => { let c = n; for (let k = 0; k < 8; k++) c = c & 1 ? 0xEDB88320 ^ (c >>> 1) : c >>> 1; return c; });
function crc(b) { let c = -1; for (let i = 0; i < b.length; i++) c = CRC[(c ^ b[i]) & 255] ^ (c >>> 8); return (c ^ -1) >>> 0; }
function chunk(t, d) { const l = Buffer.alloc(4); l.writeUInt32BE(d.length); const td = Buffer.concat([Buffer.from(t), d]); const c = Buffer.alloc(4); c.writeUInt32BE(crc(td)); return Buffer.concat([l, td, c]); }
function png(w, h, rgba, eight) {
  const ih = Buffer.alloc(13); ih.writeUInt32BE(w, 0); ih.writeUInt32BE(h, 4); ih[8] = 8;
  const parts = [Buffer.from([137, 80, 78, 71, 13, 10, 26, 10])];
  if (eight) {
    const map = new Map(), pal = [];
    const idx = new Uint8Array(w * h);
    for (let i = 0; i < w * h; i++) {
      const k = (rgba[i * 4] << 16) | (rgba[i * 4 + 1] << 8) | rgba[i * 4 + 2];
      let v = map.get(k); if (v === undefined) { v = pal.length; if (v > 255) throw new Error('more than 256 colours'); map.set(k, v); pal.push(k); }
      idx[i] = v;
    }
    ih[9] = 3; parts.push(chunk('IHDR', ih));
    const P = Buffer.alloc(pal.length * 3); pal.forEach((k, i) => { P[i * 3] = k >> 16; P[i * 3 + 1] = (k >> 8) & 255; P[i * 3 + 2] = k & 255; });
    parts.push(chunk('PLTE', P));
    const raw = Buffer.alloc((w + 1) * h); for (let y = 0; y < h; y++) { raw[y * (w + 1)] = 0; Buffer.from(idx.buffer, y * w, w).copy(raw, y * (w + 1) + 1); }
    parts.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })));
  } else {
    ih[9] = 6; parts.push(chunk('IHDR', ih));
    const raw = Buffer.alloc((w * 4 + 1) * h);
    for (let y = 0; y < h; y++) { raw[y * (w * 4 + 1)] = 0; Buffer.from(rgba.buffer, rgba.byteOffset + y * w * 4, w * 4).copy(raw, y * (w * 4 + 1) + 1); }
    parts.push(chunk('IDAT', zlib.deflateSync(raw, { level: 9 })));
  }
  parts.push(chunk('IEND', Buffer.alloc(0)));
  return Buffer.concat(parts);
}

function main() {
  const args = process.argv.slice(2);
  const inp = args.find(a => !a.startsWith('--')), out = args.filter(a => !a.startsWith('--'))[1];
  if (!inp || !out) { console.error('usage: node tools/art/ground21.js <textures.json> <outdir> [--sheet] [--png8] [--only=a,b]'); process.exit(2); }
  const only = (args.find(a => a.startsWith('--only=')) || '').slice(7).split(',').filter(Boolean);
  const tex = JSON.parse(fs.readFileSync(inp, 'utf8'));
  fs.mkdirSync(out, { recursive: true });
  const names = Object.keys(tex).sort().filter(n => ART.wants(n) && (!only.length || only.includes(n)));
  const summary = {}, sheet = [];
  let bytes = 0;
  for (const n of names) {
    const base = new Uint8Array(Buffer.from(tex[n], 'base64'));
    const t0 = Date.now();
    const r = ART.make(n, base);
    const ms = Date.now() - t0;
    const be = ART.blockMeanError(base, r.data);
    const file = png(256, 256, r.data, args.includes('--png8'));
    fs.writeFileSync(path.join(out, n + '.png'), file); bytes += file.length;
    summary[n] = { family: r.family, colors: r.colors, rounds: r.rounds, blockMax: +be.max.toFixed(2), blockMean: +be.mean.toFixed(2), seam: +ART.seamRatio(r.data).toFixed(3), sum: ART.texSum(r.data), ms, bytes: file.length };
    sheet.push([n, base, r.data]);
  }
  if (args.includes('--sheet')) {
    // two tiles per texture: the base at 4x (nearest) and the detail; 4 textures per row
    const C = 4, cw = 2 * 256 + 24, ch = 256 + 16, rows = Math.ceil(sheet.length / C), W = C * cw, H = rows * ch;
    const img = new Uint8Array(W * H * 4).fill(24);
    sheet.forEach(([n, base, det], i) => {
      const ox = (i % C) * cw, oy = ((i / C) | 0) * ch;
      for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) {
        const s = (((y >> 2) * 64) + (x >> 2)) * 4, d = (y * 256 + x) * 4;
        let o = ((oy + y) * W + ox + x) * 4; img[o] = base[s]; img[o + 1] = base[s + 1]; img[o + 2] = base[s + 2]; img[o + 3] = 255;
        o = ((oy + y) * W + ox + 264 + x) * 4; img[o] = det[d]; img[o + 1] = det[d + 1]; img[o + 2] = det[d + 2]; img[o + 3] = 255;
      }
    });
    for (let i = 3; i < img.length; i += 4) img[i] = 255;
    fs.writeFileSync(path.join(out, 'sheet.png'), png(W, H, img, false));
  }
  console.log(JSON.stringify({ count: names.length, bytes, summary }, null, 1));
}
main();
