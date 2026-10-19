// ============================================================
//  GFX — shared graphics settings for the Phase 2 modules
//  Every visual module reads its switches from here; js/presets.js owns the
//  Low / Medium / High presets and the Options UI that sets them.
// ============================================================
'use strict';

const GFX = {
  preset: 'medium',
  scale: 1,          // 3D view resolution: 1 = 320x150 (original), 2 = 640x300
  viewDist: 1,       // multiplies each map's fog distance
  particles: 1,      // multiplies weather/leaf particle counts
  stars: true,       // night stars (js/sky.js)
  panoramas: true,   // painted area panoramas behind the ridges (js/sky.js)
  flyovers: true,    // the Kestrel crossing the sky in Part Three (js/sky.js)
  softFog: true,     // depth-graded fog (js/post.js)
  bloom: true,       // bloom on lamps, glass and fire (js/post.js)
  grade: true,       // richer per-area colour grade (js/post.js)
  mist: true,        // permanent area-level ground mist (js/post.js)
  reflections: true, // water reflections and ripples (js/water.js)
  decals: true,      // moss, cracks, scorch, posters, Synod notices (js/decals.js)
  detail: true,      // close-range wall detail (js/decals.js)
  scenery: true,     // barrels, carts, statues, graves, bones (js/scenery.js)
  grass: true,       // swaying, player-reactive grass and reeds (js/flora.js)
  crtCurve: false,   // CRT curvature (scanlines stay on UPG.crt) (js/presets.js)
  // Every effect off: the original look, and what pixel-exact tests use.
  // View distance and particle counts return to the original too (js/presets.js
  // rescales particles on change). The render resolution is a display choice and
  // is kept, so frames compare at the same size; PRESETS.apply('original')
  // restores everything including 1x.
  plain() { for (const k of GFX.FX) GFX[k] = false; GFX.viewDist = 1; GFX.particles = 1; GFX.preset = 'plain'; if (typeof Engine !== 'undefined') Engine.setLook({ fogK: 1 }); GFX.changed(); },
  FX: ['stars', 'panoramas', 'flyovers', 'softFog', 'bloom', 'grade', 'mist', 'reflections', 'decals', 'detail', 'scenery', 'grass', 'crtCurve'],
  listeners: [],
  onChange(fn) { GFX.listeners.push(fn); },
  changed() { for (const fn of GFX.listeners) { try { fn(GFX); } catch (e) { console.warn('GFX listener failed', e); } } },
};
