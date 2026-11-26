// ============================================================
//  roads128 — Phase 128a, "the roads filled", part one: the wayside things the books give the roads and the game lacked.
//
//  Two readers went through the four books and the bibles for the four roads before anything was designed (the
//  findings: story/Game Layer/Phase 128 - The roads filled (findings and options, for ruling).md). The books give the
//  roads two things the game did not have, and this file is where they are built:
//
//  1. THE BRAZIER AT THE FOOT OF TOWER SIX, on the wall of the Null-Watch. Book Three, Part One l. 1842: "the brazier at
//     the foot of Tower Six, where the battery crew warmed their hands between Refusals." The firesmoke brazier, lit, on
//     the open ground at the wall's foot below the battery, placed by rule (the nearest open cell west of the tower that
//     has the wall beside it). One of the map's own things (added at the end of its base list, as js/fold113.js adds its
//     stones); it blocks nobody's way. Its line is the game's own wording [PROPOSED]; the brazier is the book's.
//
//  No switch: these are things of the world. Nothing here uses the random stream. ROADS128.dress(map) may be called any
//  number of times and adds each thing once.
// ============================================================
'use strict';

const ROADS128 = (function () {
  const TEXTS = [];
  const S = (t) => { if (!TEXTS.includes(t)) TEXTS.push(t); return t; };
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('roads128: ' + k + ': ' + (e && e.message ? e.message : e)); } catch (x) { /* none */ } };

  const TX = {
    // [PROPOSED] wording; the brazier, the tower and the crew warming their hands are Book Three's (Part One l. 1842)
    brazier6: S('A brazier at the foot of Tower Six, the coals banked. The battery crew come down to warm their hands at it.'),
  };

  // as js/fold113.js addBase: a thing added after the map was built joins the map's own list, at its end
  function addBase(m, e) {
    if (m.baseCount == null) return e;
    const i = m.entities.lastIndexOf(e); if (i < 0) return e;
    m.entities.splice(i, 1); m.entities.splice(m.baseCount, 0, e); m.baseCount++;
    return e;
  }
  const has = (m, tag) => (m.entities || []).some((e) => e && e._p128 === tag);

  // ---------------------------------------------------------------- the wall: the brazier at the foot of Tower Six
  function dressWall(m) {
    if (has(m, 'brazier6') || typeof RIFT100 === 'undefined' || !RIFT100.TOWERS) return;
    const t6 = RIFT100.TOWERS.find((t) => t.n === 6); if (!t6) return;
    const open = (x, y) => x >= 0 && y >= 0 && x < m.w && y < m.h && !m.get(x, y);
    // west of the tower, along its own row and the rows beside it: the first open cell that has the wall to its east
    const y0 = Math.floor(t6.at[1]); let spot = null;
    for (const dy of [0, 1, -1, 2, -2]) {
      const y = y0 + dy;
      for (let x = Math.floor(t6.at[0]) - 6; x > Math.floor(t6.at[0]) - 22 && !spot; x--) if (open(x, y) && !open(x + 1, y) && open(x - 1, y)) spot = [x, y];
      if (spot) break;
    }
    if (!spot) { warnOnce('tower six', 'no open ground at its foot'); return; }
    addBase(m, m.deco('brazier', spot[0] + 0.62, spot[1] + 0.5, { scale: 0.62, solid: false, radius: 0.2, glow: 0.75, lightCol: [62, 31, 8], label: TX.brazier6, _p128: 'brazier6' }));
  }

  function dress(m) {
    if (!m || !m.id) return;
    try { if (m.id === 'p100_wall') dressWall(m); } catch (e) { warnOnce('dress ' + m.id, e); }
  }

  try {
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { for (const id in maps) dress(maps[id]); } catch (e) { warnOnce('build', e); } return maps; }; }
  } catch (e) { warnOnce('wire', e); }

  return { TX, TEXTS, dress };
})();
if (typeof module !== 'undefined') module.exports = ROADS128;
