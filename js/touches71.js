// ============================================================
//  touches71 — Small canon touches I (ROADMAP R9 #25, the first five: a, k, n, o, q; Story Brainstorm §3 #25).
//
//  Five small things the manuscript states outright, each placed where the game already has the moment:
//    a  HYMN 9'S REAL WORDS (Book One ch. 19, l. 4790). When the Aegis Sentinel is sung down (js/grove.js aegisCalm),
//       the hymn is now heard: Sable sings "Hold us in the little light — hold us in the little light until the morning
//       comes—", flat and cracked and far too low, in the wrong key (voiced). [PROPOSED] Sung yourself off the board, the
//       same words. The Wearer's lure at the Cloister porch (grove.js porchVoice, ch. 20) already sang them.
//    k  "DISSONANT: SELF-INFLICTED. NO FURTHER ACTION." (ch. 5, l. 1622). The Synod clerk's line for Davin Hale, word for
//       word, in the Synod Gazette (js/rumours.js) once he is gone (davin_gone). [PROPOSED] The Gazette prints the
//       district register, and the same formula for Old Tam after his walk in the meadow (p49_tam, js/meadow49.js; no
//       surname, as the book has none: "Tam — (no surname. ASK.)", l. 4053) and for Ada Pellow after she goes into the
//       Hedge (js/greening44.js, g44_gate 3; kept here as p71_ada). The lines stop once you have left on the Kestrel.
//    n  THE DEAD QUEEN'S DECREE (ch. 1, ll. 320–322). A new decree on the well-house, the paste still wet: BY ROYAL
//       ASSENT, the seal of pale green glass, "Maelis, by the Grace of the Pure Note, Queen of the Reach." Read like the
//       game's other documents (js/reading.js, the Office style). [PROPOSED] It stands where js/church55.js and
//       js/rite43.js put the well-house, at the south-east corner of the square; a new sheet goes up each day at dawn and
//       the paste is wet until noon; only in Part One. The decree's own wording is not in the book and is not shown.
//    o  "FORTY-EIGHT." (ch. 5, l. 1685). Vane to the hold at night, "the way he did most nights": up the mast-ladder
//       at night (js/maps.js use 'crates'), the crates card ends with him at the bottom of the ladder (voiced).
//       [PROPOSED] Night is 22:00 to 04:00, Part One, before the Rite; js/cargo56.js keeps its own two nights.
//    q  OK-114, TWICE PAINTED OVER (ch. 15, l. 4181). On the Kestrel's bow, legible only up close: a mark at the bow rail
//       of the deck (js/kestrel16.js). [PROPOSED] The place (the book sees it from the Moot-house steps; the game's deck is
//       where you can get close to the bow), and the reach: from further than 1.6 cells, only the ghost of a mark. With
//       Sable aboard (sable_joined), the book's line: she knows that mark the way a clerk knows any mark she has read
//       eleven times.
//  Nothing here gates a quest; missing any of it changes nothing. Props are transient (never saved) and restaged on load.
//  Flags: p71_ada.
// ============================================================
'use strict';

const TOUCHES71 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const hour = () => { const t = Number(G.tod) || 0; return (((t % 1) + 1) % 1) * 24; };
  const partOne = () => { const f = F(); return !(f.greening || f.escaped || f.part3 || f.part4); };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('touches71: ' + k + ' failed', e); } };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };

  const TX = {
    // a · Hymn 9 (ch. 19, l. 4790)
    hymnSable: S('Sable sings it: "Hold us in the little light — hold us in the little light until the morning comes—" It is terrible. It comes out flat and cracked and far too low, in the wrong key, in a voice that has been reading aloud and nothing else for three years.'),
    hymnYou: S('You sing it off the board: "Hold us in the little light — hold us in the little light until the morning comes—"'),
    // k · the district register (ch. 5, l. 1622)
    gDavin: S('Entered in the district register: Hale, D. Carter. Dissonant: self-inflicted. No further action.'),
    gTam: S('Entered in the district register: Tam, surname not recorded. Dissonant: self-inflicted. No further action.'),
    gAda: S('Entered in the district register: Pellow, A. Dissonant: self-inflicted. No further action.'),
    // n · the decree on the well-house (ch. 1, ll. 320–322)
    decreeLabel: S('A decree on the wall of the well-house'),
    decreeTitle: S('The decree on the well-house'),
    decreeKind: S('Decree'),
    decreeWet: S('A new decree has gone up over the old ones, the paste still wet.'),
    decreeDry: S('A new decree has gone up over the old ones.'),
    assent: S('BY ROYAL ASSENT'),
    began: S('BY ROYAL ASSENT, it begins, as they all do, above a seal of pale green glass pressed with a queen\'s profile.'),
    sign: S('Maelis, by the Grace of the Pure Note, Queen of the Reach.'),
    dead: S('The Synod\'s decrees always come with her seal and her signature. Queen Maelis has been dead for a hundred and forty years.'),
    steady: S('Her signature is very steady. People say that is because her hand no longer shakes. People say a great many things, very quietly.'),
    putBack: S('Leave it.'),
    // o · "Forty-eight." (ch. 5, ll. 1675–1687)
    hold: S('At the bottom of the ladder Captain Vane sits with the lantern, turning a small blue bottle over in his hands, among the murmuring crates.<br><br>"Forty-eight," he tells the dark, the way he does most nights.<br><br>The dark, as usual, has nothing to say to that.'),
    // q · OK-114 (ch. 15, l. 4181)
    bowLabel: S('The bow'),
    bowTitle: S('The Kestrel\'s bow'),
    bowMark: S('On her bow, under two coats of paint that were put on to cover the last name and then the one before it, is the ghost of a registry mark.'),
    bowFar: S('From here it is only a ghost. You would have to lean out over the bow rail to read it.'),
    bowNear: S('OK-114.'),
    bowSable: S('Sable knows that mark the way a clerk knows any mark she has read eleven times.'),
    bowGo: S('Step back from the rail.'),
  };
  const VO = { hymnSable: 'sable.hymn9.sung', hold: 'vane.hold.fortyeight' };

  // ---------------------------------------------------------------- voices (one recorded line each; the rope45 guard)
  const voiced = () => typeof VOICE_ACT !== 'undefined' && !!VOICE_ACT.LINES && (typeof VOICES === 'undefined' || ['acted', 'spoken'].includes(VOICES.mode));
  function play(id) {
    if (!voiced() || !VOICE_ACT.LINES[id]) return;
    try { VOICE_ACT.playLine(Object.assign({ id }, VOICE_ACT.LINES[id]), { interrupt: true }); } catch (e) { warnOnce('line', e); }
  }

  // ---------------------------------------------------------------- art (procedural stand-ins, painted once)
  function reg(name, w, h, draw) {
    if (typeof Engine === 'undefined' || !Engine.addSprite || (Engine.sprites && Engine.sprites[name]) || typeof document === 'undefined') return;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d', { willReadFrequently: true });
    draw(c, w, h);
    const id = c.getImageData(0, 0, w, h), u8 = id.data;
    for (let i = 0; i < w * h; i++) { const o = i * 4; u8[o + 3] = u8[o + 3] < 100 ? 0 : 255; }
    Engine.addSprite(name, { w, h, data: new Uint32Array(id.data.buffer), hs: 1, cx: 0.5, dy: 0 });
  }
  function paintAll() {
    // a corner of the well-house: stone courses, and the decree pasted over the edges of older ones
    reg('p71_decree', 64, 80, (c) => {
      c.fillStyle = '#6d6a63'; c.fillRect(4, 0, 56, 80);
      c.strokeStyle = '#4a4842'; c.lineWidth = 1;
      for (let y = 0; y < 80; y += 10) { c.beginPath(); c.moveTo(4, y); c.lineTo(60, y); c.stroke(); for (let x = 4 + ((y / 10) % 2) * 9; x < 60; x += 18) { c.beginPath(); c.moveTo(x, y); c.lineTo(x, y + 10); c.stroke(); } }
      c.fillStyle = '#b9ae92'; c.fillRect(12, 14, 40, 50);                 // the old ones, underneath
      c.fillStyle = '#a99e82'; c.fillRect(15, 11, 38, 50);
      c.fillStyle = '#e2d8bc'; c.fillRect(14, 16, 36, 46);                 // the new one
      c.fillStyle = '#2f2a22'; c.fillRect(19, 20, 26, 3);                  // BY ROYAL ASSENT
      c.fillStyle = '#6b6252'; for (let y = 27; y < 46; y += 3) c.fillRect(18, y, 28 - (y % 7), 1.4);
      c.beginPath(); c.arc(32, 53, 5, 0, Math.PI * 2); c.fillStyle = '#9fd0a2'; c.fill();   // the seal of pale green glass
      c.fillStyle = '#5e8f63'; c.fillRect(31, 50, 2, 6);
      c.fillStyle = '#c9bf9f'; c.fillRect(14, 61, 36, 1);                  // the wet edge
    });
    // the bow planking, grey over grey; the old mark shows only as a slightly paler ghost
    reg('p71_bow', 96, 40, (c) => {
      c.fillStyle = '#5b5852'; c.fillRect(0, 6, 96, 30);
      c.strokeStyle = '#3e3c37'; c.lineWidth = 1; for (let y = 10; y < 36; y += 6) { c.beginPath(); c.moveTo(0, y); c.lineTo(96, y); c.stroke(); }
      c.fillStyle = '#7a5a38'; c.fillRect(0, 2, 96, 5);                    // the rail cap
      c.fillStyle = '#64615a'; c.font = 'bold 16px sans-serif'; c.textBaseline = 'middle'; c.fillText('OK-114', 20, 24);
    });
  }

  // ---------------------------------------------------------------- props (transient; restaged on load)
  const WELL = [28.4, 21.6];                         // by js/church55.js's well-house corner (27.3, 22.6) [PROPOSED]
  const DECK = 'p16k_kestrel_deck', BOW = [41.9, 19.0];   // kestrel16's deck: ship-local (25.9, 5.0) at OX 16, OY 14, against the bow rail (a sprite in the rail's own cell would be hidden by it)
  const keyed = (m, k) => (m.entities || []).find((e) => e && e._p71 === k);
  function put(m, k, e) {
    const have = keyed(m, k); if (have) return have;
    Object.assign(e, { kind: 'deco', transient: true, _decor: true, _p71: k, solid: false });
    m.entities.push(e); return e;
  }
  function drop(m, k) { const e = keyed(m, k); if (e) m.entities.splice(m.entities.indexOf(e), 1); }
  function stage() {
    if (!hasG() || !G.map || !Array.isArray(G.map.entities)) return;
    const m = G.map;
    if (G.mapId === 'oakhaven') {
      // the authored town only (a test fixture can reuse the id); never the greened one
      if (m.w === 70 && m.h === 64 && partOne()) put(m, 'decree', { sprite: 'p71_decree', x: WELL[0], y: WELL[1], scale: 0.8, radius: 0.2, use: 'p71_decree', label: TX.decreeLabel });
      else drop(m, 'decree');
    }
    if (G.mapId === DECK) put(m, 'bow', { sprite: 'p71_bow', x: BOW[0], y: BOW[1], scale: 0.6, radius: 0.15, use: 'p71_bow', label: TX.bowLabel });
  }

  // ---------------------------------------------------------------- a · Hymn 9
  function hymn(how) {
    if (how === 'sable') { say(TX.hymnSable, 'voice', 10000); play(VO.hymnSable); }
    else if (how === 'you') say(TX.hymnYou, 'voice', 8000);
  }

  // ---------------------------------------------------------------- k · the register in the Gazette
  // printed while the district is still Oakhaven: once you are away on the Kestrel the Office has reclassified it [PROPOSED]
  const GONE = ['escaped', 'part3', 'part4', 'book_one_done'];
  const GAZ = [{ req: ['davin_gone'], not: GONE, t: TX.gDavin }, { req: ['p49_tam'], not: GONE, t: TX.gTam }, { req: ['p71_ada'], not: GONE, t: TX.gAda }];
  function wireGazette() {
    if (typeof STORYRUM === 'undefined' || !Array.isArray(STORYRUM.ISSUES)) return;
    for (const issue of STORYRUM.ISSUES) for (const g of GAZ) if (!issue.items.some((it) => it && it.t === g.t)) issue.items.push(Object.assign({}, g));
  }
  function syncFlags() { if (hasG() && !F().p71_ada && (Number(F().g44_gate) | 0) >= 3) F().p71_ada = true; }

  // ---------------------------------------------------------------- n · the decree
  const wet = () => hour() >= 5 && hour() < 12;       // a new sheet at dawn; wet until noon [PROPOSED]
  function decreeHtml() {
    return '<div class="p71-decree"><div class="p71-assent">' + TX.assent + '</div><div class="p71-seal" aria-hidden="true"></div><div class="p71-sign"><i>' + TX.sign + '</i></div></div>'
      + '<p>' + (wet() ? TX.decreeWet : TX.decreeDry) + '</p><p>' + TX.began + '</p><p>' + TX.dead + '</p><p>' + TX.steady + '</p>';
  }
  const CSS = '.p71-decree{text-align:center;margin:.2em 0 1em;padding:.6em .8em;border:1px solid currentColor}'
    + '.p71-assent{font-family:var(--font-display,"Cinzel",Georgia,serif);font-size:1.25em;letter-spacing:.08em}'
    + '.p71-seal{width:1.9em;height:1.9em;margin:.4em auto .2em;border-radius:50%;background:radial-gradient(circle at 40% 35%,#d4f0d2,#8fc596 60%,#5e8f63)}'
    + '.p71-sign{font-size:.95em}';
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('touches71-style')) return;
    const st = document.createElement('style'); st.id = 'touches71-style'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function readDecree() { injectStyle(); showEvent(TX.decreeTitle, decreeHtml(), [{ t: TX.putBack, f: null }]); }

  // ---------------------------------------------------------------- o · "Forty-eight."
  const holdNight = () => { const h = hour(); return G.mapId === 'oakhaven' && partOne() && !F().rite_started && (h >= 22 || h < 4); };
  const HOLD_TITLE = 'The crates in the hold';       // js/game.js useDeco 'crates'
  // the card is built inside game.js; add the line to it on the way out, and put showEvent back however the call ends
  function withVane(run) {
    const own = window.showEvent;
    let added = false;
    window.showEvent = function (t, b, c) {
      if (t === HOLD_TITLE && typeof b === 'string') { b += '<br><br>' + TX.hold; added = true; }
      return own.call(this, t, b, c);
    };
    try { return run(); } finally { window.showEvent = own; if (added) play(VO.hold); }
  }

  // ---------------------------------------------------------------- q · OK-114
  const NEAR = 1.6;
  function readBow(e) {
    const c = Engine.cam, d = Math.hypot(c.x - e.x, c.y - e.y);
    if (d > NEAR) { say(TX.bowMark, '', 7000); say(TX.bowFar, '', 7000); return; }   // two messages: each translates whole
    showEvent(TX.bowTitle, TX.bowMark + '<br><br><b>' + TX.bowNear + '</b>' + (F().sable_joined ? '<br><br>' + TX.bowSable : ''), [{ t: TX.bowGo, f: null }]);
  }

  // ---------------------------------------------------------------- wiring
  function useOwn(e, inner) {
    syncFlags();
    if (e.use === 'p71_decree') { if (partOne()) readDecree(); else stage(); return true; }   // the act can change without a reload
    if (e.use === 'p71_bow') { readBow(e); return true; }
    if (e.use === 'crates' && holdNight()) { try { withVane(inner); } catch (err) { warnOnce('hold', err); } return true; }
    return false;
  }
  function wire() {
    try { paintAll(); } catch (e) { warnOnce('art', e); }
    if (typeof READING !== 'undefined' && READING && READING.SOURCES) READING.SOURCES[TX.decreeTitle] = { style: 'office', kind: TX.decreeKind };
    try { wireGazette(); } catch (e) { warnOnce('gazette', e); }
    if (typeof aegisCalm === 'function') {
      const _ac = aegisCalm;
      aegisCalm = function (how) { try { hymn(how); } catch (e) { warnOnce('hymn', e); } return _ac.apply(this, arguments); };   // the singing, then the Aegis kneels
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        const self = this, args = arguments;
        try { if (e && hasG() && useOwn(e, () => _ud.apply(self, args))) return undefined; } catch (err) { warnOnce('use', err); }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof loadMap === 'function') {
      const _lm = loadMap;
      loadMap = function () { const r = _lm.apply(this, arguments); try { syncFlags(); stage(); } catch (e) { warnOnce('loadMap', e); } return r; };
    }
  }
  try { wire(); } catch (e) { console.warn('touches71 failed to wire', e); }

  return { TX, TEXTS, VO, GAZ, WELL, BOW, NEAR, stage, hymn, readDecree, readBow, decreeHtml, holdNight, syncFlags, play };
})();
if (typeof window !== 'undefined') window.TOUCHES71 = TOUCHES71;
