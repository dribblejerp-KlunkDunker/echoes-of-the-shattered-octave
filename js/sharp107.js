// ============================================================
//  sharp107 — Phase 107, "the best look everywhere": every sprite close to you in the 3D view is drawn from a sharp
//  enlargement, as the moving paintings of Phase 76 are.
//
//  The owner, 20 Nov: "fix all old sprites including the enemies. Whatever is technically the best visuals should be
//  the benchmark everywhere". The best figures in the game are the moving paintings (js/paintfolk76.js): each one is
//  enlarged twice over with a sharp filter (smooth curves between the old pixels, then an unsharp pass), so a figure at
//  arm's length has four times the pixels. People already get it. Everything else was still drawn from its pixels as
//  they were made: the hounds, the mites, the spiders and the drones, the sheep things, the bosses' views, items,
//  props and the scenery's cut-outs, all blocky at arm's length beside the people.
//
//  How: when the 3D view (js/sprites21.js) is about to draw a sprite within NEAR units of the eye, it asks here for the
//  sprite to draw. The first time a given picture is wanted, it is enlarged twice with the paintings' own filter
//  (PAINTFOLK.enlarge), its glowing pixels carried over, and kept with the picture (found again by object identity;
//  a picture whose pixels change is enlarged again). Size, foot point and glow are the original's: the 3D view sizes
//  a sprite by its height setting, not its pixel count, so nothing moves or grows. Further than NEAR, the original is
//  drawn (its pixels are already small on screen). At most BUDGET new enlargements a frame, counted in the game's own
//  animation ticks, never a clock: until its turn comes a picture is drawn as before, so nothing waits.
//  Not touched: the moving paintings (already enlarged), and anything bigger than MAXPX (a whole panorama card).
//  The classic view is the pixel look and keeps its pixels.
//
//  Switch: GFX.sharpSprites (in GFX.FX: off in Original, on in every other preset); Options row "Sharp figures".
//  SHARP107.pick(sp, dist2) is the hook; SHARP107.of(sp) enlarges at once (tests); SHARP107.stats().
// ============================================================
'use strict';

const SHARP107 = (() => {
  const FLAG = 'sharpSprites', NEAR = 4.5, BUDGET = 3, MAXPX = 320 * 320;
  if (typeof GFX !== 'undefined') {
    if (GFX[FLAG] === undefined) GFX[FLAG] = true;
    if (GFX.FX && !GFX.FX.includes(FLAG)) GFX.FX.push(FLAG);
  }
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('sharp107 ' + k, e); };
  const made = new WeakMap();   // picture object -> its enlargement (or null: cannot be enlarged)
  let tick = -1, spent = 0, total = 0;
  const on = () => typeof GFX !== 'undefined' && GFX[FLAG] === true;

  function of(sp) {
    if (!sp || !sp.data) return null;
    const had = made.get(sp);
    if (had !== undefined && (had === null || had.src === sp.data)) return had;
    let out = null;
    try {
      if (sp.paintfolk || sp.sharp107 || !(sp.data instanceof Uint32Array) || sp.data.length !== sp.w * sp.h || sp.w * sp.h > MAXPX || sp.w < 4 || sp.h < 4) out = null;
      else if (typeof PAINTFOLK === 'undefined' || !PAINTFOLK.enlarge) out = null;
      else {
        const big = PAINTFOLK.enlarge(sp), K = big.w / sp.w;
        // the glowing pixels (lamps, eyes, embers) stay glowing: their mask is enlarged by nearest neighbour
        const m0 = sp._mask || sp.emit || null; let m = null;
        if (m0 && m0.length === sp.w * sp.h) { m = new Uint8Array(big.w * big.h); for (let y = 0; y < big.h; y++) for (let x = 0; x < big.w; x++) m[y * big.w + x] = m0[((y / K) | 0) * sp.w + ((x / K) | 0)]; }
        out = { w: big.w, h: big.h, data: big.data, hs: sp.hs, cx: sp.cx, dy: sp.dy, emit: m, _mask: m, sharp107: true, src: sp.data };
        total++;
      }
    } catch (e) { warnOnce('enlarge', e); out = null; }
    made.set(sp, out);
    return out;
  }
  // the 3D view's hook: the picture to draw for sp at squared distance d2 from the eye
  function pick(sp, d2) {
    if (!sp || !on() || d2 > NEAR * NEAR || sp.paintfolk || sp.sharp107) return sp;
    const had = made.get(sp);
    if (had !== undefined && (had === null || had.src === sp.data)) return had || sp;
    const T = typeof ANIM !== 'undefined' ? ANIM.T : 0;
    if (T !== tick) { tick = T; spent = 0; }
    if (spent >= BUDGET) return sp;
    spent++;
    return of(sp) || sp;
  }

  // ---------------------------------------------------------------- the Options row
  const ROW = ['gfx-sharp107', 'Sharp figures', 'creatures, props and items close to you drawn as crisply as the people (3D renderer)'];
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
            const after = document.getElementById('gfx-cover105') || document.getElementById('gfx-hdtex');
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
  return { NEAR, BUDGET, pick, of, on, setOn, stats: () => ({ made: total }) };
})();
if (typeof window !== 'undefined') window.SHARP107 = SHARP107;
