// ============================================================
//  items87 — Phase 87 (c): the new pieces of the fourteen sets, made in code (data, pack pictures, French). Each piece
//  has its own look from the world of the Shattered Octave (owner, 14 Nov: "I do want each weapon to have its own cool and
//  unique look that represents the world that the shattered octave resides in"). Its card and first-person looks are in
//  js/gearlook21.js and js/fp87.js. Loads before js/gear87.js, so the starting kits find what it makes.
//  Every name, number and line here is [PROPOSED] under the approved design.
// ============================================================
'use strict';

const ITEMS87 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    sledgeName: S('Night-Shift Sledge'),
    sledgeDesc: S('A quarry-hand\'s sledge from the Oakhaven works: a stone-splitter\'s head on a short ash haft, a brass Consortium tag nailed on with a number that is not yours, and a red rag at the neck so it can be found in the dark.'),
  };
  // ---------------------------------------------------------------- weapons
  const WEAPONS87 = {
    // the Quarry-Hand's own (owner, 14 Nov: "make a lighter quarry sledge"): one hand, quicker and lighter than the Great-Maul
    p87_sledge: { name: TX.sledgeName, img: 'fp_mace', dmg: [6, 13], reach: 1.25, noise: 2.4, speed: 0.62, type: 'iron', blunt: true, value: 28, desc: TX.sledgeDesc },
  };
  function register() {
    if (typeof WEAPONS === 'undefined' || typeof ITEMS === 'undefined') return;
    for (const id in WEAPONS87) {
      if (!WEAPONS[id]) WEAPONS[id] = Object.assign({}, WEAPONS87[id]);
      if (!ITEMS['w_' + id]) ITEMS['w_' + id] = { name: WEAPONS87[id].name, sprite: 'gear', weapon: id, value: WEAPONS87[id].value, desc: WEAPONS87[id].desc };
    }
    icons();
  }
  // ---------------------------------------------------------------- pack pictures (24 by 24, pixel by pixel)
  function icons() {
    try {
      if (typeof ICONS === 'undefined' || !ICONS.PIX || Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p87_sledge')) return;
      const sledge = (d) => { d.tilt(12, 12);
        d.layer('#8a6440').rrect(-1.5, -4, 3, 17);                                   // the ash haft
        d.layer('#c8a040', { shiny: 1, sep: false }).rect(-1.5, 4, 3, 2);            // the brass Consortium tag
        d.layer('#b03a2a', { sep: false }).rect(-2, -5, 4, 2);                       // the red rag at the neck
        d.layer('#5a5e62', { shiny: 1 }).rect(-7, -11, 11, 6).path([4, -11, 7, -8, 4, -5]);   // the head: a flat face, a wedge peen
        d.layer('#e8e4da', { shade: 'flat', sep: false }).px(-5, -9, -3, -9, -1, -9); // chalk tallies
      };
      ICONS.PIX['weapon:p87_sledge'] = sledge; ICONS.PIX.w_p87_sledge = sledge;
    } catch (e) { /* the pack shows it without a picture */ }
  }
  register();
  return { TX, TEXTS, WEAPONS87, register };
})();
if (typeof window !== 'undefined') window.ITEMS87 = ITEMS87;
