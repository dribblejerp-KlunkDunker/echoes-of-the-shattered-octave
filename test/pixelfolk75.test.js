// node test/pixelfolk75.test.js   (needs no browser: the module is pure)
// Phase 75 pilot, the pixel folk: people drawn from a skeleton as pixel art, with limbs that move, from eight sides.
'use strict';
const path = require('path');
const PF = require(path.join(__dirname, '..', 'js', 'pixelfolk75.js'));
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
const solid = (s) => { let n = 0; for (let i = 0; i < s.data.length; i++) if (s.data[i] >>> 24) n++; return n; };
const same = (a, b) => { for (let i = 0; i < a.data.length; i++) if (a.data[i] !== b.data[i]) return false; return true; };
const colours = (s) => new Set(s.data).size - 1;
const box = (s) => { let x0 = s.w, x1 = 0, y0 = s.h, y1 = 0; for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.data[y * s.w + x] >>> 24) { if (x < x0) x0 = x; if (x > x1) x1 = x; if (y < y0) y0 = y; if (y > y1) y1 = y; } return { x0, x1, y0, y1 }; };

const ids = PF.ids();
check(['kaelen', 'townsman', 'legionnaire', 'lyra'].every((id) => PF.has(id)) && !PF.has('hound'), 'the pilot cast is rigged, and only the pilot cast');
for (const id of ids) {
  let ok = true, inside = true, few = true, ground = true;
  for (const anim of Object.keys(PF.COUNT)) for (let o = 0; o < 8; o++) for (let f = 0; f < PF.COUNT[anim]; f++) {
    const s = PF.frame(id, anim, f, o);
    if (!s || s.w !== PF.W || s.h !== PF.H || s.data.length !== s.w * s.h || solid(s) < 1500) ok = false;
    const b = box(s); if (b.x0 < 1 || b.x1 > s.w - 2 || b.y0 < 1) inside = false;
    if (anim !== 'hurt' && (b.y1 < s.h - 6 || b.y1 > s.h - 1)) ground = false;
    if (colours(s) > 64) few = false;
  }
  check(ok, id + ': every animation draws a body from all eight sides');
  check(inside, id + ': no frame is cut off by the edge of its picture');
  check(ground, id + ': the feet stand on the same ground line in every frame (no floating, no sinking)');
  check(few, id + ': a limited palette (at most 64 colours a frame)');
  const walk = []; for (let f = 0; f < PF.COUNT.walk; f++) walk.push(PF.frame(id, 'walk', f, 2));
  let distinct = true; for (let i = 0; i < walk.length; i++) for (let j = i + 1; j < walk.length; j++) if (same(walk[i], walk[j])) distinct = false;
  check(distinct, id + ': eight different walk frames (the limbs really move)');
  check(!same(PF.frame(id, 'idle', 0, 0), PF.frame(id, 'idle', 0, 4)) && !same(PF.frame(id, 'idle', 0, 2), PF.frame(id, 'idle', 0, 6)), id + ': front, back, left and right are different pictures');
  check(same(PF.render(id, 'walk', 0.25, 1), PF.render(id, 'walk', 0.25, 1)), id + ': the same pose always gives the same picture');
  check(Math.abs(PF.frame(id, 'idle', 0, 0).cx - 0.5) < 0.01 && PF.frame(id, 'idle', 0, 0).hs > 1, id + ': centred, and sized to stand as tall as the painted figure did');
}
const k = PF.frame('kaelen', 'idle', 0, 0), t = PF.frame('townsman', 'idle', 0, 0);
check(k.emit && k.emit.some((v) => v) && !t.emit, "Kaelen's glass arm is marked as lit from inside; the orchardman has nothing that glows");
{ const s = PF.frame('kaelen', 'idle', 0, 0); let l = 0, r = 0; for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) if (s.emit[y * s.w + x]) { if (x > s.w / 2) r++; else l++; }
  check(r > 0 && l === 0, 'the glass arm is his left (the viewer\'s right when he faces you), as in the book'); }
check(PF.canAttack('kaelen') && PF.canAttack('legionnaire') && !PF.canAttack('townsman'), 'only fighters have a strike');
check(!same(PF.frame('legionnaire', 'attack', 2, 1), PF.frame('legionnaire', 'attack', 3, 1)), "the legionnaire's wind-up and strike are different poses");
check(PF.frame('lyra', 'walk', 9, 9) === PF.frame('lyra', 'walk', 1, 1), 'frames wrap and are cached');
console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
