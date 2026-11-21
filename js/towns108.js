// ============================================================
//  towns108 — Phase 108, "every town raised": the other towns' houses stand as tall as Oakhaven's (3D renderer).
//
//  The owner, 17 Nov, of Oakhaven: "the houses for oakhaven are a bit small like the front doors are too small and the
//  roofs are to low". Phase 97 raised Oakhaven and the Hollow: a person stands 1 high and the map's wall ring is 1 high,
//  so the eaves came down to the top of your head and a door was exactly your own height. Phase 97's question 4, "Shall
//  the other towns' houses be raised the same way?", was answered on 18 Nov: "yes every town should have raised houses".
//
//  Each town's own planner (js/eaves78.js, js/eaves82.js) plans its houses as before; this runs after it (EAVES78.POST)
//  and does to every house with a door what Phase 97 did in Oakhaven: the ground storey stands `ground` taller (a band of
//  the house's own wall carried up over the map's ring), the front doors stand `doorH` high in a timber or stone
//  door-case with a step (Phase 97's drawing, js/eaves78.js), and everything from the old eaves up (the upper storey and
//  its windows, the roof, the ridge, the porches, hoists and bell-cotes) goes up with it. Ground-floor windows stay
//  where they were. Each town keeps its own proportions (TOWNS below); a barn, shed or store rises a little less, as in
//  Oakhaven, but a home does not, whatever it is built of. Not raised: a church with a tower (its spire must still stand over the roofs), the painted fronts on
//  Port Cantabile's Salt Stair (built against the stair), and a house whose walls are not the map's 1-high ring over its
//  own ground (a tall stone house, one on a slope). A building with no door is raised too (its town's skyline stays
//  even), with no door-case.
//
//  The map is not touched: walls, doors and what you can walk through are as they were. The classic renderer draws the
//  old boxes, as it does for Oakhaven. Part of the eaves art (GFX.ART 'eaves'), like Phase 97's raise.
// ============================================================
'use strict';

const TOWNS108 = (() => {
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = true; console.warn('towns108 ' + k, e); };
  // ground: how much taller the ground storey stands; doorH: the door's leaf (a person is 1). Oakhaven is 0.38 / 1.24.
  const TOWNS = {
    greenroot: { ground: 0.38, doorH: 1.24, why: "the Reach's timber, as Oakhaven" },
    flume_lowrings: { ground: 0.38, doorH: 1.24, why: "Oakhaven's own timber and plaster, as the water left it" },
    clearing: { ground: 0.3, doorH: 1.2, why: "a hut and a shed outside the Hedge: as the Hollow's cottages" },
    p22_combe: { ground: 0.32, doorH: 1.2, why: 'low flint cottages under deep thatch' },
    flume_landing: { ground: 0.3, doorH: 1.2, why: 'tarred board on the water, low against the wind' },
    cantabile_cay: { ground: 0.3, doorH: 1.2, why: 'one cottage roped down against the wind' },
    cantabile_harbour: { ground: 0.4, doorH: 1.26, why: 'a port of stone and lime-wash: quay houses with lofts over' },
    whispergrove: { ground: 0.45, doorH: 1.3, why: 'a marble city: the tallest doors in the Reach' },
    p31_bellyard: { ground: 0.45, doorH: 1.3, why: "the same city's lanes" },
    p61_yard: { ground: 0.4, doorH: 1.26, why: 'the Malting: a long brick range' },
  };
  const stats = { towns: 0, houses: 0, skipped: 0 };
  // a barn, shed or store rises a little less, as in Oakhaven; a home does not, whatever it is built of (Kaelen's hut is
  // plank, and the planner calls plank "plain")
  const SHED = /barn|shed|store|granary|washhouse/i;                       // Oakhaven's own rule (js/eaves78.js PLAIN)
  const shed = (b) => SHED.test(b.label || '') || (!!b.plain && !(b.ring0 || b.doors || []).length);

  function raise(m, p) {
    const T = m && TOWNS[m.id]; if (!T || !p || !p.houses) return;
    let n = 0;
    const W = m.w, lv = (x, y) => (m.lvls && x >= 0 && y >= 0 && x < W && y < m.h ? m.lvls[y * W + x] || 0 : 0);
    for (const b of p.houses) {
      if (b.ground > 0) continue;                                            // raised by its own planner (Oakhaven, the Hollow)
      if (b.cliff || b.headframe || (b.church && b.towers && b.towers.length)) { stats.skipped++; continue; }
      const doors = (b.ring0 || b.doors || []).filter((d) => d && (d.nx || d.ny));
      // only where the walls really are the map's ring, one high over the house's own ground (a tall stone house or one
      // on a slope is left as it is)
      const d0 = doors[0], g0 = typeof b.base === 'number' ? b.base : d0 ? lv(d0.x + d0.nx, d0.y + d0.ny) : lv(b.x0, b.y0), old = b.top;
      if (Math.abs(old - (g0 + 1)) > 0.08) { stats.skipped++; continue; }
      const g = T.ground * (shed(b) ? 0.6 : 1), up = (z) => (typeof z === 'number' && z >= old - 0.35 ? z + g : z);
      b.base = g0; b.ground = g; b.doorH = Math.min(T.doorH, 1 + g - 0.08); b.ring = doors;
      b.top = old + g; b.wallTop += g; b.zBase += g; b.ridge += g;
      if (typeof b.backFrom === 'number') b.backFrom += g;
      for (const w of b.windows || []) if (w.z0 >= old - 0.05) { w.z0 += g; w.z1 += g; }      // the upper storey's windows
      for (const e of b.extras || []) if ('z' in e) e.z = up(e.z);                               // porches, hoists, bell-cotes, finials
      n++;
    }
    if (n) { stats.towns++; stats.houses += n; }
  }
  try {
    if (typeof EAVES78 !== 'undefined' && EAVES78.POST) {
      EAVES78.POST.push(raise);
      for (const [id, T] of Object.entries(TOWNS)) if (EAVES78.STYLES[id]) Object.assign(EAVES78.STYLES[id], { raised108: T });
    }
  } catch (e) { warnOnce('hook', e); }

  return { TOWNS, raise, shed, stats: () => Object.assign({}, stats) };
})();
