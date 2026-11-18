// ============================================================
//  keepers98 — Phase 91, question 4 (the owner, 17 Nov 2026: "lets move onto 91"). The rule every great place follows
//  (Phase 90, rule 5): a keeper put down leaves a trophy, which is a valuable and nothing more, and one piece of gear in
//  its realm's own look, once. The Heights' keepers have done so since they were built. The Reach's two had not: their
//  gear only lay in their places. Now they do.
//
//    the Flint-Back (the Antler Galleries)   a plate of its shell (a valuable), and the Ridge-Flint: a ridge of black
//                                            flint off its back, still set in a fist of white shell. It joins the Old
//                                            Reach set's weapons, and counts as flint.
//    the Standing Note (the Dry Flume)       the reed out of its throat (a valuable), and the Beam-Key: the engine-man's
//                                            iron key it lay on for two hundred years. It joins the Flume set's weapons.
//
//  Given once each, and to those who put a keeper down before this was built: the leavings appear by the body the next
//  time you stand in its place. Everything here is [PROPOSED]. Flags (0 or 1): p98_ka, p98_kf.
//  Nothing visual uses random numbers.
// ============================================================
'use strict';

const KEEPERS98 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('keepers98: ' + k, e); } };
  const TX = {
    flintDown: S('The Flint-Back lies still. A plate of its shell has come away whole, and a ridge of black flint with it.'),
    noteDown: S('The note stops. The iron galleries ring on a moment, and then they are only iron. Something lies where the Standing Note lay.'),
    shell: S('Chalk-White Shell-Plate'), shellDesc: S('A plate of the Flint-Back\'s shell, as broad as a shield and as white as the chalk it grew in. It is too brittle to carry on an arm. Somebody will want it on a wall.'),
    ridge: S('Ridge-Flint'), ridgeDesc: S('A ridge of black flint off the Flint-Back\'s shell, still set in a fist of white shell for a grip. Nobody knapped it. It grew its edge.'),
    reed: S('The Standing Note\'s Reed'), reedDesc: S('The reed out of the Standing Note\'s throat, as long as a forearm and the colour of old horn. Held near iron, it hums the one note it ever made.'),
    key: S('Beam-Key'), keyDesc: S('An engine-man\'s key for the great nuts of the beam: iron, as long as a forearm, its jaw worn bright. The Standing Note lay on it for two hundred years. When it strikes, it rings.'),
  };
  const RIDGE = { name: TX.ridge, img: 'fp_axe', dmg: [5, 12], reach: 1.15, noise: 0.6, speed: 0.48, type: 'iron', value: 60, desc: TX.ridgeDesc };
  const BEAMKEY = { name: TX.key, img: 'fp_mace', dmg: [6, 12], reach: 1.25, noise: 1.3, speed: 0.56, type: 'iron', blunt: true, value: 58, desc: TX.keyDesc };
  // where each keeper lies, how it is known, what it leaves
  const PLACES = [
    { id: 'flint', maps: ['p85_galleries', 'p85_antlerdeep'], is: (e) => e._p85a === 'keeper', flag: 'p98_ka', items: ['w_p98_ridge', 'v_p98_shell'], line: TX.flintDown },
    { id: 'note', maps: ['p85_dryflume'], is: (e) => e._p85 === 'keeper', flag: 'p98_kf', items: ['w_p98_beamkey', 'v_p98_reed'], line: TX.noteDown },
  ];

  function defs() {
    if (typeof WEAPONS !== 'undefined') { if (!WEAPONS.p98_ridge) WEAPONS.p98_ridge = Object.assign({}, RIDGE); if (!WEAPONS.p98_beamkey) WEAPONS.p98_beamkey = Object.assign({}, BEAMKEY); }
    if (typeof ITEMS !== 'undefined') {
      if (!ITEMS.w_p98_ridge) ITEMS.w_p98_ridge = { name: TX.ridge, sprite: 'gear', weapon: 'p98_ridge', value: RIDGE.value, desc: TX.ridgeDesc };
      if (!ITEMS.w_p98_beamkey) ITEMS.w_p98_beamkey = { name: TX.key, sprite: 'gear', weapon: 'p98_beamkey', value: BEAMKEY.value, desc: TX.keyDesc };
      if (!ITEMS.v_p98_shell) ITEMS.v_p98_shell = { name: TX.shell, sprite: 'gear', valuable: true, value: 85, desc: TX.shellDesc };
      if (!ITEMS.v_p98_reed) ITEMS.v_p98_reed = { name: TX.reed, sprite: 'gear', valuable: true, value: 90, desc: TX.reedDesc };
    }
    try { if (typeof ICONS !== 'undefined' && ICONS.PIX && !Object.prototype.hasOwnProperty.call(ICONS.PIX, 'weapon:p98_ridge')) {
      // the Ridge-Flint: a black ragged ridge standing out of a white lump
      const ridge = (d) => { d.layer('#ece6d6').rrect(6, 14, 12, 7); d.layer('#c8c0ac').rect(7, 19, 10, 2); d.layer('#1c1c22', { shiny: 1 }).rect(8, 9, 8, 6).rect(9, 5, 3, 5).rect(13, 3, 3, 7).rect(11, 7, 3, 3); d.layer('#50505a').rect(8, 9, 1.2, 6).rect(13, 3, 1, 6); d.mark('#e6ecee', 15, 3); };
      // the Beam-Key: an iron shank and an open jaw, its faces bright
      const key = (d) => { d.tilt(12, 12); d.layer('#5c6068').rrect(-1.5, -4, 3, 16); d.layer('#70747c').rrect(-5, -11, 10, 8); d.layer('#14141a').rect(-2, -11, 4, 5); d.layer('#d8dce2', { shiny: 1 }).rect(-2.8, -11, 0.9, 5).rect(1.9, -11, 0.9, 5); d.layer('#3c4048').rrect(-1.5, 9, 3, 3); d.mark('#f0f4f8', 15, 2); };
      // the shell-plate: a white slab with a ridge line down it; the reed: a long horn-coloured tongue, split at the tip
      const shell = (d) => { d.layer('#eee8da').rrect(4, 5, 16, 14); d.layer('#cfc7b4').rect(4, 16, 16, 3); d.layer('#2a2a30').rect(11, 6, 2, 12); d.layer('#fffaf0').rect(6, 7, 4, 2); d.mark('#ffffff', 17, 6); };
      const reed = (d) => { d.tilt(12, 12); d.layer('#b89a62').rrect(-2, -11, 4, 22); d.layer('#8a6e40').rect(0.6, -11, 1.4, 22); d.layer('#e0c890').rect(-1.6, -10, 1, 18); d.layer('#3a2c18').rect(-0.3, -11, 0.6, 7); d.mark('#fff0c8', 14, 3); };
      ICONS.PIX['weapon:p98_ridge'] = ridge; ICONS.PIX.w_p98_ridge = ridge; ICONS.PIX['weapon:p98_beamkey'] = key; ICONS.PIX.w_p98_beamkey = key;
      ICONS.PIX.v_p98_shell = shell; ICONS.PIX.v_p98_reed = reed;
    } } catch (e) { /* the pack shows them without a picture */ }
  }

  const f = () => G.flags;
  const fint = (k) => { const v = Number(f()[k]); return Number.isFinite(v) && v >= 1 ? 1 : 0; };
  // a keeper down, and its leavings not yet given: they lie by the body, once
  function tick() {
    if (typeof G === 'undefined' || G.state !== 'play' || !G.map || !G.player || !Array.isArray(G.ents)) return;
    const P = PLACES.find((p) => p.maps.indexOf(G.mapId) >= 0); if (!P || fint(P.flag)) return;
    const kp = G.ents.find((e) => e && e.kind === 'enemy' && P.is(e)); if (!kp || !kp.dead) return;
    f()[P.flag] = 1;
    P.items.forEach((id, n) => { const it = ITEMS[id]; if (!it) return; G.ents.push(hydrate({ kind: 'item', item: id, sprite: it.sprite || 'gear', x: kp.x + (n ? 0.45 : -0.45), y: kp.y + 0.1, scale: 0.4, yOff: 0, solid: false })); });
    try { say(P.line, 'good', 8000); } catch (e) { warnOnce('say', e); }
  }
  const say = (t, cls, ms) => msg(t, cls, ms);

  function wire() {
    defs();
    if (typeof buildAllMaps === 'function') { const _b = buildAllMaps; buildAllMaps = function () { const maps = _b.apply(this, arguments); try { defs(); } catch (e) { warnOnce('defs', e); } return maps; }; }
    if (typeof update === 'function') { const _u = update; update = function () { const r = _u.apply(this, arguments); try { tick(); } catch (e) { warnOnce('tick', e); } return r; }; }
  }
  wire();

  return { TX, TEXTS, PLACES, RIDGE, BEAMKEY, defs, tick };
})();
if (typeof module !== 'undefined' && module.exports) module.exports = KEEPERS98;
if (typeof window !== 'undefined') window.KEEPERS98 = KEEPERS98;
