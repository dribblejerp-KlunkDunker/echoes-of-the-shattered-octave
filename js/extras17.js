// extras17 — Phase 17 "Beyond Book One", team EXTRAS: the Extras menu (title screen), spoiler notice, unlocks, save
// isolation for extras, the "An extra — after Book One" banner, and the shared winter look (WINTER17).
//
// WINTER17 CONTRACT (stable; other Phase 17 teams call it — the EXTRAS team implements it, these stubs are no-ops):
//   WINTER17.apply(mapId, opts)  opts: { snow: 0..1 ground/roof cover, fall: 0..1 falling snow, breath: bool,
//                                        grade: 0..1 cold colour grade }   — winter on that map until clear()
//   WINTER17.clear(mapId)        — remove it (also cleared automatically when an extra ends)
//   WINTER17.active(mapId)       — the opts in force, or null
// EXTRAS17 CONTRACT (for the extra teams):
//   EXTRAS17.register({ id, title, blurb, start(), unlocked() })  — an extra appears in the Extras menu; start() runs
//                                        inside an isolated session (its own G; the Book One save is never touched)
//   EXTRAS17.inExtra()                — the id of the running extra, or null
//   EXTRAS17.finish(result)           — end the extra and return to the Extras menu (result is shown on its card)
(function () {
  'use strict';
  const reg = [];
  const winter = {};
  window.WINTER17 = {
    apply(mapId, opts) { winter[mapId] = Object.assign({ snow: 0.6, fall: 0.3, breath: true, grade: 0.5 }, opts || {}); },
    clear(mapId) { delete winter[mapId]; },
    active(mapId) { return winter[mapId] || null; },
  };
  window.EXTRAS17 = {
    register(x) { if (x && x.id && !reg.find((r) => r.id === x.id)) reg.push(x); },
    list() { return reg.slice(); },
    inExtra() { return null; },
    finish() {},
  };
})();
