// node test/walls77.test.js   (no browser: the tile enlarger is pure)
// Phase 77 pilot, sharp walls: every 64x64 tile enlarged to 256x256 from itself for the 3D renderer.
'use strict';
const fs = require('fs'), path = require('path'), zlib = require('zlib');
const ROOT = path.join(__dirname, '..'), HD = require(path.join(ROOT, 'js', 'walls77.js'));
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
// a tile with structure: courses of stone with dark joints, and a second with a hole in it
const tile = new Uint32Array(64 * 64), holed = new Uint32Array(64 * 64);
for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { const joint = y % 16 === 0 || (x + (y >> 4) * 8) % 21 === 0, v = joint ? 60 : 130 + ((x * 7 + y * 13) % 23); tile[y * 64 + x] = (255 << 24 | v << 16 | v << 8 | (v + 10)) >>> 0; holed[y * 64 + x] = x > 20 && x < 40 && y > 20 && y < 40 ? 0 : tile[y * 64 + x]; }
const a = HD.bytes(tile);
check(HD.SIZE === 256 && a.length === 256 * 256 * 4, 'a 64x64 tile becomes 256x256');
check(HD.bytes(tile) === a, 'the same tile is enlarged once and remembered');
// the painting is kept: every 4x4 block averages to its painted pixel, closely
let diff = 0; for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) { let r = 0; for (let j = 0; j < 4; j++) for (let i = 0; i < 4; i++) r += a[((y * 4 + j) * 256 + x * 4 + i) * 4]; diff += Math.abs(r / 16 - (tile[y * 64 + x] & 255)); }
check(diff / 4096 < 9, 'block for block it is still the painting (mean difference ' + (diff / 4096).toFixed(1) + ' of 255)');
// and it is finer: far more distinct neighbours-differ edges than the plain 4x repeat
const edges = (b) => { let n = 0; for (let y = 0; y < 256; y++) for (let x = 0; x < 255; x++) if (b[(y * 256 + x) * 4] !== b[(y * 256 + x + 1) * 4]) n++; return n; };
check(edges(a) > edges(HD.plain(tile)) * 2, 'it carries detail the plain 4x repeat does not (' + edges(a) + ' against ' + edges(HD.plain(tile)) + ' changes along the rows)');
// it still tiles: the left column continues the right one as smoothly as any neighbouring pair
let seam = 0, inner = 0; for (let y = 0; y < 256; y++) { seam += Math.abs(a[(y * 256) * 4] - a[(y * 256 + 255) * 4]); inner += Math.abs(a[(y * 256 + 100) * 4] - a[(y * 256 + 101) * 4]); }
check(seam < inner * 3 + 2000, 'the tile still meets its neighbour at the edge (seam ' + seam + ', an inside column pair ' + inner + ')');
const h = HD.bytes(holed); let open = 0, solid = 0; for (let i = 0; i < 256 * 256; i++) { if (h[i * 4 + 3] === 0) open++; else if (h[i * 4 + 3] === 255) solid++; }
check(open > 4000 && open + solid === 256 * 256, 'a hole in a tile stays a clean hole (' + open + ' open pixels, none half-open)');
// a tile that changes every frame (running water) is not enlarged the slow way
const water = new Uint32Array(tile); let t0 = Date.now(); for (let k = 0; k < 40; k++) { water[k] ^= 0x010101; HD.bytes(water); } const ms = (Date.now() - t0) / 40;
check(ms < 12, 'a tile that keeps changing costs ' + ms.toFixed(1) + ' ms a change, not a full enlargement');
// the renderer asks for it
const r3d = fs.readFileSync(path.join(ROOT, 'js', 'r3d21.js'), 'utf8'), html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
check(/HDTEX\.bytes\(d\)/.test(r3d) && /worldSize\(\) !== world\.size/.test(r3d), 'the 3D renderer uploads the sharp tile and rebuilds when the switch is flipped');
check(html.indexOf('js/walls77.js') > 0 && html.indexOf('js/walls77.js') < html.indexOf('js/r3d21.js'), 'walls77 loads before the 3D renderer');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
