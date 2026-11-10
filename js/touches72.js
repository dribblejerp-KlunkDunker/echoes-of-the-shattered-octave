// ============================================================
//  touches72 — Small canon touches II (ROADMAP R9 #25, the second five: b, h, j, m, s; Story Brainstorm §3 #25).
//
//  Five more small things the manuscript states outright, each placed where the game already has the moment:
//    b  "APPLES IN THE RAIN", OFF-KEY ON THE FOURTH BAR (Book One ch. 1, l. 436). At the tannery culvert the game's own
//       "A voice beyond the Hedge" card (js/game.js checkTriggers, hedge_voice) now ends as the book's Hedge-voice does:
//       "And after it, softly, humming: the first bars of "Apples in the Rain."" [PROPOSED] the place (the book has it at
//       Weavers' Cross, to Lyra; the culvert is where the game's Hedge speaks to you). Not voiced: a hum is not a spoken
//       line. The Wearer's set already sings it (js/grove.js, "Seven times"). Tobin's journal (js/tobin.js) is left as it
//       is: its pages are the game's own [PROPOSED] prose, and the book gives Tobin no words about the song.
//    h  THE HOUND'S BED (ch. 2, l. 612). "When he dropped a pebble into the middle of it, the pebble struck the earth and
//       made no sound at all." A skipping stone thrown into the game's hound's bed in the clearing (js/maps.js, the
//       hound_bed trigger at 17.5, 24.5) is heard by nobody, and says so (a patrol can still see you throw it). [PROPOSED] the bed's reach for a landing stone
//       (1.2 cells: "a rough oval a little longer than a big dog"); bottles still break (the book drops a pebble).
//    j  LEGIONNAIRES WITH GRASS THROUGH THEIR FEET (ch. 11, l. 3386). While the Greening runs, four passive Legionnaires
//       stand at the quarry's gate (the headframe door, js/maps.js buildQuarry) "exactly where they had been posted,
//       bells lifted, with grass coming up through their pewter feet, because nobody had told them to do anything else."
//       js/greening44.js's card already says the first half; looking at them gives the whole line. The book puts them at
//       the quarry gate only, so the greened town gets none.
//    m  "COLOURS WERE BRIGHTER ONCE" (ch. 1, l. 294). "Everyone over thirty said the same thing, if you got them talking
//       late enough." [PROPOSED] a townsperson's "Any news?" late at night (21:00 to 04:00), any patron (the game keeps no
//       ages), in the book's words made first-person; the game's own "Red was redder" line (js/rumours.js a_colour) stays.
//       And the Church's answer in the Synod Gazette: "would come right again with prayer". [PROPOSED] the Gazette
//       carries it, as a Church line (which the book says it is), in two Part One issues where the sheet has room: the
//       quarry roster issue (until Marsh is commended) and the Hedge issue (until the fault there is resolved).
//    s  HETTY BRAM'S EYEBROWS (ch. 4, ll. 1372–1386). The Boar's board says NO TOASTS, and Hetty "communicated almost
//       entirely with her eyebrows". In her dialogue at the Boar, "Buy a drink" is the book's whole conversation: an
//       eyebrow each, a leather mug of the dark Reach ale, your coin; then "Silently. No toasts." [PROPOSED] the button,
//       its price (one sovereign, the game's smallest coin), and that it is only offered in the Boar before the Greening.
//  Nothing here gates a quest; missing any of it changes nothing. Props are transient (never saved) and restaged on load.
//  No flags.
// ============================================================
'use strict';

const TOUCHES72 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const away = () => { const f = F(); return !!(f.escaped || f.part3 || f.part4); };   // on the Kestrel, or later
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('touches72: ' + k + ' failed', e); } };

  const TX = {
    // b · the Hedge-voice (ch. 1, l. 436)
    hum: S('And after it, softly, humming: the first bars of "Apples in the Rain." The old orchard working-song. Off-key on the fourth bar. Always the fourth bar.'),
    // h · the hound's bed (ch. 2, l. 612)
    pebble: S('The pebble strikes the earth and makes no sound at all.'),
    // j · the quarry gate (ch. 11, l. 3386)
    legionLabel: S('The Legionnaires at the gate'),
    legionLook: S('Four of them stand at the gate exactly where they were posted, bells lifted, with grass coming up through their pewter feet, because nobody has told them to do anything else.'),
    // m · colours (ch. 1, l. 294)
    colours: S('Colours were brighter once. The leaves of the iron-oaks turned red in the autumns when I was a child, a red red, a red like a shout. Now they turn a kind of rust-pink, like a stain that has been scrubbed. And the sun at noon was a thing you could not look at.'),
    prayer: S('The Church says it is the Cascade: that all things have gone a quarter-tone flat since the Spire of Dawning broke, and will come right again with prayer.'),
    // s · Hetty (ch. 4, ll. 1374–1386)
    drink: S('Buy a drink'),
    drinkBroke: S('You have no coin.'),
    nod: S('She raises one eyebrow at you, and you raise one back, and she draws you a leather mug of the dark Reach ale without being asked and puts it on the bar and takes your coin, and that is the whole of the conversation.'),
    toast: S('You drink. Silently. No toasts.'),
  };

  // ---------------------------------------------------------------- art (procedural stand-in, painted once)
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
    // a tuft of the ugly hurrying green, a foot high, blades leaning every way
    reg('p72_grass', 48, 32, (c) => {
      const greens = ['#3f7a2e', '#5a9a3a', '#2f5f24', '#76b048'];
      for (let i = 0; i < 26; i++) {
        const x = 6 + ((i * 37) % 36), lean = ((i * 13) % 9) - 4, top = 4 + ((i * 7) % 14);
        c.strokeStyle = greens[i % greens.length]; c.lineWidth = 2;
        c.beginPath(); c.moveTo(x, 32); c.quadraticCurveTo(x + lean * 0.4, 18, x + lean, top); c.stroke();
      }
    });
  }

  // ---------------------------------------------------------------- props (transient; restaged on load)
  const keyed = (m, k) => (m.entities || []).find((e) => e && e._p72 === k);
  function put(m, k, e) {
    const have = keyed(m, k); if (have) return have;
    Object.assign(e, { kind: 'deco', transient: true, _decor: true, nopick: true, _p72: k, solid: false });
    m.entities.push(e); return e;
  }
  function dropAll(m) { for (let i = m.entities.length - 1; i >= 0; i--) { const e = m.entities[i]; if (e && e._p72) m.entities.splice(i, 1); } }
  // j: while the escape runs (the bit is broken, the town is going under, you have not got away)
  // greening44's own test of the escape window when it is loaded (it also stands down for a co-op guest)
  const greeningNow = () => (typeof GREEN44 !== 'undefined' && GREEN44.live ? !!GREEN44.live() : !!F().greening && !away() && !guest());
  // two either side of the headframe door, a pace in from it, facing into the quarry (the spawn stands at the door)
  const POSTS = [[0.6, -1.1], [0.6, 1.1], [1.5, -1.2], [1.5, 1.2]];
  function stage() {
    if (!hasG() || !G.map || !Array.isArray(G.map.entities) || G.mapId !== 'quarry') return;
    const m = G.map;
    if (!greeningNow() || !m.spawn) { dropAll(m); return; }
    const s = m.spawn, ux = Math.cos(s.dir || 0), uy = Math.sin(s.dir || 0);
    POSTS.forEach(([a, b], i) => {
      const x = s.x + ux * a - uy * b, y = s.y + uy * a + ux * b;
      if (m.isSolidCell && m.isSolidCell(x | 0, y | 0)) return;
      put(m, 'legion' + i, { sprite: 'legionnaire', x, y, scale: 1.0, radius: 0.3, facing: s.dir || 0, passive: true, use: 'p72_legion', label: TX.legionLabel });
      put(m, 'grass' + i, { sprite: 'p72_grass', x: x + ux * 0.05, y: y + uy * 0.05, scale: 0.42, radius: 0.1 });
    });
  }

  // ---------------------------------------------------------------- b · the hum at the Hedge
  const HEDGE_TITLE = 'A voice beyond the Hedge';     // js/game.js checkTriggers, hedge_voice
  // the card is built inside checkTriggers; add the hum to it on the way out, and put showEvent back however the call ends
  function withHum(run) {
    const own = window.showEvent;
    window.showEvent = function (t, b, c) {
      if (t === HEDGE_TITLE && typeof b === 'string' && b.indexOf(TX.hum) < 0) b += '<br><br>' + TX.hum;
      return own.call(this, t, b, c);
    };
    try { return run(); } finally { window.showEvent = own; }
  }
  // checkTriggers runs every frame: only wrap the call that can open the card (inside the culvert trigger, not yet done)
  const nearCulvert = () => G.mapId === 'oakhaven' && Array.isArray(G.map.triggers)
    && G.map.triggers.some((t) => t && t.id === 'hedge_voice' && !t.done && Math.hypot(Engine.cam.x - t.x, Engine.cam.y - t.y) <= t.r);

  // ---------------------------------------------------------------- h · the hound's bed
  const BED = [17.5, 24.5], BED_R = 1.2;               // js/maps.js: the clearing's hound_bed trigger (read from the map when there)
  function bedAt() {
    const t = G.mapId === 'clearing' && G.map && Array.isArray(G.map.triggers) && G.map.triggers.find((x) => x && x.id === 'hound_bed');
    return t ? [t.x, t.y] : BED;
  }
  const inBed = (x, y) => { const b = bedAt(); return Math.hypot(x - b[0], y - b[1]) <= BED_R; };
  // the stone lands and nobody hears it: whoever the original sends to look is put back as they were (nothing is hidden,
  // so the throw's own ray, and a patrol seeing you throw it, are unchanged), the clatter is not played, no ripple is
  // drawn, and the stone's sentence is the book's
  function quietly(run) {
    const was = new Map();
    for (const e of G.ents) if (e) was.set(e, { st: e.state, inv: e.investigation });
    const _m = msg, sfx = typeof Audio_ !== 'undefined' && Audio_.sfx, _step = sfx && sfx.step;
    const rip = typeof RIPPLES !== 'undefined' && RIPPLES.settings, ripOn = rip && rip.on;
    let said = false;
    msg = function (text, cls, ms) {
      if (!said && typeof text === 'string' && text.indexOf(DISTRACTIONS.pebble.name + ':') === 0) { said = true; text = TX.pebble; cls = ''; ms = 5000; }
      return _m.call(this, text, cls, ms);
    };
    if (sfx) sfx.step = function () { /* no sound at all */ };
    if (rip) rip.on = false;
    try { return run(); } finally {
      msg = _m; if (sfx) sfx.step = _step; if (rip) rip.on = ripOn;
      for (const [e, w] of was) if (e.investigation !== w.inv) { e.state = w.st; if (w.inv === undefined) delete e.investigation; else e.investigation = w.inv; }
    }
  }

  // ---------------------------------------------------------------- m · the rumour and the Gazette
  // a Gazette sheet holds two to four items, Local matters included (js/rumours.js): the line goes only where it fits,
  // the quarry issue while Marsh's commendation is not printed, the Hedge issue until the fault is resolved [PROPOSED]
  const PRAYER_IN = { quarry: { not: ['tobiah_met'] }, hedge: { not: ['wearer_dead'] } };
  function wireRumours() {
    if (typeof STORYRUM === 'undefined') return;
    if (Array.isArray(STORYRUM.RUMOURS) && !STORYRUM.RUMOURS.some((r) => r && r.id === 'p72_colours')) {
      STORYRUM.RUMOURS.push({ id: 'p72_colours', cat: 'ambient', who: 'patron', rank: 0, note: 'Late at night (town colour; Book One ch. 1)',
        when: (c) => c.hour >= 21 || c.hour < 4, text: TX.colours });
    }
    if (Array.isArray(STORYRUM.ISSUES)) {
      for (const issue of STORYRUM.ISSUES) {
        const when = PRAYER_IN[issue.id];
        if (when && !issue.items.some((it) => it && it.t === TX.prayer)) issue.items.push(Object.assign({ t: TX.prayer }, when));
      }
    }
  }

  // ---------------------------------------------------------------- s · Hetty's eyebrows
  const boarOpen = () => G.mapId === 'tavern' && !F().greening && !away();
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('touches72-style')) return;
    const st = document.createElement('style'); st.id = 'touches72-style'; st.textContent = '.dlg .log .p72-nod{font-style:italic}';   // told, not said
    (document.head || document.documentElement).appendChild(st);
  }
  function addDrink() {
    if (typeof DLG === 'undefined' || typeof NPCS === 'undefined' || DLG.npc !== NPCS.hetty || !hasG() || !boarOpen() || guest()) return;
    const btns = document.querySelector('#modal-panel .dlg .btns'); if (!btns || btns.querySelector('#d-p72-drink')) return;
    injectStyle();
    const b = document.createElement('button');
    b.className = 'dfbtn small'; b.id = 'd-p72-drink'; b.type = 'button'; b.textContent = TX.drink;
    if ((G.player.gold | 0) < 1) { b.disabled = true; b.title = TX.drinkBroke; }
    btns.insertBefore(b, btns.querySelector('#d-bye') || null);
    b.onclick = () => {
      if (DLG.npc !== NPCS.hetty || (G.player.gold | 0) < 1 || !boarOpen()) return;
      G.player.gold -= 1;
      DLG.log.push({ who: 'them p72-nod', t: TX.nod }, { who: 'them p72-nod', t: TX.toast });
      try { Audio_.sfx.pickup(); } catch (e) { /* no audio */ }
      renderDialogue(null);
    };
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    try { paintAll(); } catch (e) { warnOnce('art', e); }
    try { wireRumours(); } catch (e) { warnOnce('rumours', e); }
    if (typeof checkTriggers === 'function') {
      const _ct = checkTriggers;
      checkTriggers = function () {
        const self = this, args = arguments;
        let near = false; try { near = hasG() && nearCulvert(); } catch (e) { warnOnce('hedge', e); }
        return near ? withHum(() => _ct.apply(self, args)) : _ct.apply(this, arguments);
      };
    }
    if (typeof throwDistraction === 'function' && typeof distractionImpact === 'function') {
      const _t = throwDistraction;
      throwDistraction = function (id) {
        const self = this, args = arguments;
        let pt = null;
        try { if (id === 'pebble' && hasG() && G.mapId === 'clearing' && G.state === 'play') pt = distractionImpact(id); } catch (e) { pt = null; }   // a read-only ray
        if (pt && inBed(pt.x, pt.y)) return quietly(() => _t.apply(self, args));
        return _t.apply(this, arguments);
      };
    }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        try { if (e && e._p72 && e.use === 'p72_legion') { msg(TX.legionLook, '', 7000); return undefined; } } catch (err) { warnOnce('use', err); }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof renderDialogue === 'function') {
      const _rd = renderDialogue;
      renderDialogue = function () { const r = _rd.apply(this, arguments); try { addDrink(); } catch (e) { warnOnce('drink', e); } return r; };
    }
    if (typeof loadMap === 'function') {
      const _lm = loadMap;
      loadMap = function () { const r = _lm.apply(this, arguments); try { stage(); } catch (e) { warnOnce('loadMap', e); } return r; };
    }
  }
  try { wire(); } catch (e) { console.warn('touches72 failed to wire', e); }

  return { TX, TEXTS, BED, BED_R, POSTS, inBed, stage, nearCulvert, wireRumours };
})();
if (typeof window !== 'undefined') window.TOUCHES72 = TOUCHES72;
