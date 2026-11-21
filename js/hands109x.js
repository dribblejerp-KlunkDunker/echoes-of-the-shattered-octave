// hands109x — Phase 109, an option for the first-person hands and arms (for the owner's ruling; not used by the game yet).
// Interface: tools/dev/hands109.js. Built by team X.
'use strict';
const HANDS109X = (() => {
  function render(pose, look, light) { const c = document.createElement('canvas'); c.width = 1152; c.height = 500; return c; }
  return { render };
})();
