// ============================================================
//  touches76 — Small canon touches IV (ROADMAP R9 #25, the fourth batch: g, i, l, p; Story Brainstorm §3 #25).
//
//  Four small things the manuscript states outright, each placed where the game already has the moment:
//    g  KAELEN'S CHARCOAL CLAMPS (Book One ch. 2, ll. 602–606). Four clamps by Kaelen's hut in the clearing (js/maps.js
//       buildClearing), in Part One before the Rite. Use one: the book's account of the craft, in its words ("A good clamp
//       breathed... A clamp about to flare went quiet first, and then popped"; "the finest ear for failure of any student
//       in forty years. It had been meant as praise."). Once you have met Kaelen you can walk them for a day: the
//       breathing clamps hiss (positional), one goes quiet, and you turf it before it pops. Turf a breathing one and it
//       dies ("Too little and it died"). Three rounds; coin for each clamp saved. Failure costs only the clamp, never an
//       Echo. Kaelen says nothing: the book gives him no words about it. [PROPOSED] the job itself (who walks the clamps,
//       the three rounds, the timings, the pay: 3 sovereigns a clamp, "left on the gatepost" as the town leaves his,
//       ch. 2 l. 652), once a game day; with sound captions on, the quiet clamp is named.
//    i  PIM'S WHISTLE AS A TOOL (ch. 6, ll. 2013–2025, 2125–2229). Once you have whistled the falling fifth with Lyra in
//       the water-meadow (js/meadow49.js, p49_whistle), the Song-book offers it: two notes, the Root and down, no voice
//       spent. In fog (js/weather.js mist), your companion answers from where they are, so you can tell the way: Lyra
//       whistles it back ("And I'll whistle it back. Then you'll know it's me."). [PROPOSED] Kaelen cannot whistle it
//       (the book never has him), so his glass hand rings once instead; Sable, or anyone downed or told to keep quiet,
//       gives no answer. THE MIMIC RULE: use it outside the Hedge once
//       (any map not inside it, js/game.js LAW_MAPS) and from then on, in fog, the Wearer answers too, from somewhere
//       else: "It got the interval exactly right." (l. 2229). And at the Cloister porch (js/grove.js porchVoice, ch. 20)
//       it whistles your whistle back at you after the boy's. Not once the Wearer is dead.
//    l  CONSECRATED (ch. 2, l. 652). "On Chapel-days, when the chapel-reader's sermons came round to the Consecrated and
//       the blessing of the glass, some of them looked toward the North Gate with a kind of nervous piety." A sermon sat
//       to the end (js/synod15.js, the Chapel's three sermon days) closes with that line. And in Oakhaven's lanes, a
//       glassed traveller beside a Synod soldier gets the ward-sign (js/narrow28.js's witness) twice: "and then, because
//       he was walking beside a Synod soldier, made it again, faster." (l. 650) [PROPOSED] beside = within two paces of
//       a Legionnaire figure or one at its post (never one after you), once a game day, Part One only. The game seldom
//       walks a Legionnaire through the lanes (Dawnday's two at Cooper's Row, the Rite's column), so it is rare.
//    p  THE VEIL'S THREE RULES (ch. 15, l. 4167). [PROPOSED UI] each Ledger entry (K) has a margin: no note, a plain note
//       (where and when: "Entered: the Kestrel's hold, Massday."), or a comforting one ("Died bravely."). Once Sable is
//       with you (sable_joined), a comforting note gets what she did to her own: "Sable reads it over your shoulder, and
//       draws a line through it." and the Precept, in the book's words: "The Veil keeps three rules. Write what happened.
//       Write who it happened to. Do not comfort yourself in the margin." Narration, not her speech: nothing is voiced.
//  Nothing here gates a quest; missing any of it changes nothing. Props are transient (never saved) and restaged on load.
//  Flags: p76_cday (day + 1 the clamps were walked), p76_heard (the whistle used outside the Hedge), p76_wday (day + 1
//  of the twice-made sign), p76_veil (Sable's card shown), p76_porch (the porch's seventh card has gone by). Ledger entries may carry p76n ('plain' | 'comfort') and p76s
//  (struck); anything else is ignored, so an old save loads with no notes.
// ============================================================
'use strict';

const TOUCHES76 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const day = () => G.day | 0;
  const partOne = () => { const f = F(); return !(f.greening || f.escaped || f.part3 || f.part4); };
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const fmt = (s, ...a) => s.replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? String(a[+i]) : ''));
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('touches76: ' + k + ' failed', e); } };
  const say = (t, cls, ms) => { try { msg(t, cls || '', ms || 6000); } catch (e) { /* cosmetic */ } };
  const sfx = (name, ...a) => { try { Audio_.sfx[name](...a); } catch (e) { /* no audio */ } };

  const TX = {
    // g · the clamps (ch. 2, ll. 602–606)
    clampLabels: ['The first clamp', 'The second clamp', 'The third clamp', 'The fourth clamp'].map(S),
    clampQuiet: S('[{0} has gone quiet]'),
    clampTitle: S('The charcoal clamps'),
    clamp1: S('There are four clamps in the clearing, and Kaelen walks them in the half-light the way a shepherd walks a fold.'),
    clamp2: S('A clamp is only a heap of cordwood built into a careful dome, packed round with turf and earth and lit from the center, so that it burns for days without ever catching fire. That is the whole art: to keep a thing burning without letting it burn. Too much air and it flares, and you have a heap of ash and a lost week. Too little and it dies. You manage it by listening. A good clamp breathes, a low steady hiss through the vent-holes. A clamp about to flare goes quiet first, and then pops — a small hollow crack, deep in the stack, like a knuckle.'),
    clamp3: S('He is very good at it. He was told at the Conservatory that he had the finest ear for failure of any student in forty years. It was meant as praise.'),
    clampJob: S('He lets you walk them for a day, for a share of the charcoal money. Listen. When one goes quiet, turf it before it pops. Turf one that is still breathing, and it dies.'),
    walk: S('Walk the clamps'),
    leave: S('Leave it.'),
    walked: S('The clamps are walked for today.'),
    begin: S('You walk the clamps and listen.'),
    turf: S('You kneel and pack turf over two of its vents and listen until the breathing slows.'),
    died: S('Too little air, and it dies.'),
    pop: S('Somewhere in the clamps, a small hollow crack, deep in the stack, like a knuckle. It flares. A heap of ash, and a lost week.'),
    lostOne: S('This one is lost.'),
    paid: S('Your share of the charcoal money is left on the gatepost, the way the town leaves his: {0} sovereigns.'),
    unpaid: S('No coin today. The clamps you lost are ash.'),
    leftJob: S('You leave the clamps to themselves.'),
    // i · the whistle (ch. 6, ll. 2013–2025, 2229)
    wName: S('The falling fifth, whistled'),
    wDesc: S('Two notes, the Root and down, like a bird that knows only one thing to say. No voice spent. In fog, whoever is with you whistles back.'),
    wBtn: S('Whistle'),
    wYou: S('You whistle it, the falling fifth: the Root, and down.'),
    wLyra: S('Two notes, down, from {0}, {1}: Lyra, whistling it back.'),
    wKaelen: S('From {0}, {1}, glass rings once, faintly: Kaelen\'s hand, answering.'),
    wMimic: S('And from {0}, {1}, softly, it whistles. Two notes. The Root, and down. It got the interval exactly right.'),
    porch: S('Then your whistle, the one you blew outside the Hedge: two notes, the Root, and down. It got the interval exactly right.'),
    dirs: ['ahead', 'ahead on your right', 'your right', 'behind you on your right', 'behind you', 'behind you on your left', 'your left', 'ahead on your left'].map(S),
    near: S('close by'), mid: S('some way off'), far: S('far off'),
    // l · Consecrated (ch. 2, ll. 650–652)
    cons: S('The sermon comes round to the Consecrated and the blessing of the glass, and some of them look toward the North Gate with a kind of nervous piety.'),
    wardNamed: S('{0} makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster.'),
    wardShe: S('A woman in a doorway makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster.'),
    wardHe: S('A man across the lane makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster.'),
    // p · the margin (ch. 15, l. 4167)
    noNote: S('No note'),
    plainNote: S('Entered: {0}, {1}.'),
    comfortNote: S('Died bravely.'),
    marginOf: S('Margin note for {0}'),
    marginTitle: S('The margin'),
    sableStrikes: S('Sable reads it over your shoulder, and draws a line through it.'),
    rules: S('The Veil keeps three rules. Write what happened. Write who it happened to. Do not comfort yourself in the margin.'),
    struckAgain: S('Sable draws a line through it.'),
  };

  // ---------------------------------------------------------------- sound from a place (the spatial-audio mix)
  // a short gain + low-pass + pan chain for one effect (spatial-audio's mix: walls muffle), so a clamp or an answering
  // whistle comes from where it is
  function at(x, y, fn) {
    try {
      const ctx = Audio_.ctx;
      if (!ctx || typeof SPATIAL === 'undefined' || !SPATIAL.settings.positional || !Audio_.sfxBus) return fn();
      const c = Engine.cam, m = SPATIAL.mix({ x: c.x, y: c.y, dir: c.dir }, { x, y }, SPATIAL.wallsBetween(G.map, x, y, c.x, c.y));
      const g = ctx.createGain(), lp = ctx.createBiquadFilter(), nodes = [g, lp];
      g.gain.value = m.gain; lp.type = 'lowpass'; lp.frequency.value = m.cutoff; g.connect(lp);
      let tail = lp;
      if (ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = m.pan; lp.connect(p); tail = p; nodes.push(p); }
      tail.connect(Audio_.sfxBus);
      setTimeout(() => { for (const n of nodes) try { n.disconnect(); } catch (e) { /* gone */ } }, 4000);   // every effect here is under 2 s
      return Audio_.withRoute(g, fn);
    } catch (e) { return undefined; }
  }

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
    // a clamp: a low dome of turf and earth, a few dark vent-holes, a thread of smoke
    reg('p76_clamp', 64, 40, (c) => {
      c.fillStyle = '#4b3b2a'; c.beginPath(); c.ellipse(32, 40, 30, 26, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#56663a'; c.beginPath(); c.ellipse(32, 40, 27, 22, 0, Math.PI, 0); c.fill();
      c.fillStyle = '#3f4f2c'; for (let i = 0; i < 9; i++) c.fillRect(8 + i * 5.5, 22 + ((i * 7) % 11), 4, 3);   // turf sods
      c.fillStyle = '#1b1510'; for (const [x, y] of [[18, 31], [32, 22], [46, 31], [25, 36], [40, 36]]) c.fillRect(x, y, 3, 2);   // vent-holes
      c.strokeStyle = '#8c8a86'; c.lineWidth = 2; c.beginPath(); c.moveTo(32, 21); c.quadraticCurveTo(28, 12, 34, 4); c.stroke();
    });
  }

  // ================================================================ g · the clamps
  const B = { ROUNDS: 3, WAIT: [3, 4.5, 6], POP: 8, HISS: 1.6, PAY: 3 };
  const CLAMPS = [[8.6, 19.4], [10.6, 20.2], [12.4, 20.6], [14.6, 17.8]];   // by the hut and its hearth [PROPOSED]
  let job = null;
  const keyed = (m, k) => (m.entities || []).find((e) => e && e._p76 === k);
  function stage() {
    if (!hasG() || !G.map || !Array.isArray(G.map.entities) || G.mapId !== 'clearing') return;
    const m = G.map, on = partOne() && !F().rite_started;
    CLAMPS.forEach(([x, y], i) => {
      const k = 'clamp' + i, have = keyed(m, k);
      if (!on) { if (have) m.entities.splice(m.entities.indexOf(have), 1); return; }
      if (!have) m.entities.push({ kind: 'deco', sprite: 'p76_clamp', x, y, scale: 0.55, radius: 0.4, solid: false, transient: true, _decor: true, _p76: k, use: 'p76_clamp', label: TX.clampLabels[i] });
    });
  }
  const alive = () => [0, 1, 2, 3].filter((i) => !job.dead[i]);
  function offerClamps() {
    const body = TX.clamp1 + '<br><br>' + TX.clamp2 + '<br><br>' + TX.clamp3;
    if (!F().kaelen_met || guest()) { showEvent(TX.clampTitle, body, [{ t: TX.leave, f: null }]); return; }
    showEvent(TX.clampTitle, body + '<br><br>' + TX.clampJob, [{ t: TX.walk, f: startJob }, { t: TX.leave, f: null }]);
  }
  function startJob() {
    job = { who: G.player, round: 1, t: 0, quiet: -1, quietT: 0, saved: 0, lost: 0, dead: [false, false, false, false], hissed: [0, 0, 0, 0], hissT: [0.2, 0.6, 1.0, 1.4] };
    say(TX.begin, '', 3000);
  }
  function nextRound() {
    job.quiet = -1; job.t = 0; job.round++;
    if (job.round > B.ROUNDS || alive().length < 2) finish(false);
  }
  function finish(left) {
    const pay = job.saved * B.PAY;
    job = null;
    F().p76_cday = day() + 1;
    if (left) say(TX.leftJob, '', 3000);
    if (pay > 0) { G.player.gold = (G.player.gold | 0) + pay; sfx('pickup'); say(fmt(TX.paid, pay), 'good', 6000); } else say(TX.unpaid, '', 5000);
  }
  function tickJob(dt) {
    if (!job) return;
    if (job.who !== G.player) { job = null; return; }   // a new game or another run: the day's work is not theirs
    if (G.mapId !== 'clearing') { finish(true); return; }
    if (G.state !== 'play') return;
    job.t += dt;
    for (const i of alive()) {
      if (i === job.quiet) continue;
      job.hissT[i] -= dt;
      if (job.hissT[i] <= 0) { job.hissT[i] = B.HISS; job.hissed[i]++; at(CLAMPS[i][0], CLAMPS[i][1], () => sfx('rain')); }
    }
    if (job.quiet < 0 && job.t >= B.WAIT[Math.min(B.WAIT.length, job.round) - 1]) {
      const a = alive(); job.quiet = a[(day() * 5 + job.round * 3) % a.length]; job.quietT = 0;
      try { if (typeof ACCESS !== 'undefined' && ACCESS.settings.cap) say(fmt(TX.clampQuiet, TX.clampLabels[job.quiet]), '', 3000); } catch (e) { /* no captions */ }
    } else if (job.quiet >= 0 && (job.quietT += dt) >= B.POP) {
      const q = job.quiet; job.dead[q] = true; job.lost++;
      at(CLAMPS[q][0], CLAMPS[q][1], () => sfx('hit'));
      say(TX.pop, 'bad', 6000);
      nextRound();
    }
  }
  function useClamp(e) {
    const i = +String(e._p76).slice(5);
    if (!job) { if (F().p76_cday === day() + 1) say(TX.walked, '', 3000); else offerClamps(); return; }
    if (job.dead[i]) { say(TX.lostOne, '', 2500); return; }
    if (i === job.quiet) { job.saved++; sfx('step', 'grass'); say(TX.turf, 'good', 4500); nextRound(); return; }
    job.dead[i] = true; job.lost++; say(TX.died, 'bad', 4500);
    if (alive().length < 2 && job.quiet < 0) finish(false);
  }

  // ================================================================ i · the whistle
  const insideHedge = () => typeof LAW_MAPS !== 'undefined' && LAW_MAPS.has(G.mapId);
  const knowsWhistle = () => hasG() && (Number(F().p49_whistle) | 0) >= 1;
  const foggy = () => { try { return !!G.map && !!G.map.outdoor && Weather.state === 'mist'; } catch (e) { return false; } };
  function bearing(rel, d) {
    const k = ((Math.round(normAng(rel) / (Math.PI / 4)) % 8) + 8) % 8;
    return [TX.dirs[k], d < 3 ? TX.near : d < 9 ? TX.mid : TX.far];
  }
  function answer(text, x, y, sound) {
    const c = Engine.cam, rel = Math.atan2(y - c.y, x - c.x) - c.dir;
    const [w, d] = bearing(rel, Math.hypot(x - c.x, y - c.y));
    setTimeout(() => at(x, y, sound), 700);
    say(fmt(text, w, d), 'voice', 7000);
    return rel;
  }
  let lastWhistle = -1e9;
  function whistle() {
    if (!hasG() || guest() || !knowsWhistle() || G.time - lastWhistle < 3) return false;   // the host keeps the shared flags
    lastWhistle = G.time;
    const f = F(), heardBefore = !!f.p76_heard, wearer = !f.wearer_dead, outside = !insideHedge();
    try { addNoise(3); } catch (e) { /* no noise model */ }
    sfx('song', 348, 0.4); setTimeout(() => sfx('song', 232, 0.6), 420);
    say(TX.wYou, '', 3500);
    if (outside && wearer && !heardBefore) f.p76_heard = 1;
    if (!foggy()) return true;
    let rel = null;
    const P = G.party, e = P && P.id && typeof partyEnt === 'function' ? partyEnt() : null;
    // Lyra whistles back; Kaelen's glass answers; anyone else (Sable) has no answer the book gives them
    if (e && P.map === G.mapId && P.order !== 'quiet' && !(P.downed && P.downed[P.id])) {
      if (P.id === 'lyra') rel = answer(TX.wLyra, e.x, e.y, () => sfx('fifth'));
      else if (P.id === 'kaelen') rel = answer(TX.wKaelen, e.x, e.y, () => sfx('glasshit'));
    }
    if (outside && wearer && heardBefore) {
      const c = Engine.cam, a = c.dir + (rel == null ? Math.PI * 0.75 : rel + Math.PI);   // somewhere else in the white
      answer(TX.wMimic, c.x + Math.cos(a) * 8, c.y + Math.sin(a) * 8, () => sfx('fifth'));
    }
    return true;
  }
  function addSongRow() {
    if (!knowsWhistle() || G.state !== 'panel' || typeof document === 'undefined') return;
    const panel = document.querySelector('#modal-panel'); if (G.openPanel !== 'songs' || !panel || panel.querySelector('#p76-whistle')) return;
    const p = document.createElement('p'); p.className = 'p76-whistle';
    const b = document.createElement('b'); b.style.color = 'var(--gold)'; b.textContent = TX.wName;
    const s = document.createElement('span'); s.className = 'muted'; s.textContent = ' ' + TX.wDesc + ' ';
    const btn = document.createElement('button'); btn.className = 'dfbtn small'; btn.id = 'p76-whistle'; btn.type = 'button'; btn.textContent = TX.wBtn;
    btn.onclick = () => { closeModal(); G.state = 'play'; whistle(); };
    p.append(b, s, btn); panel.appendChild(p);
  }
  // the porch's cards are built inside grove.js's choice callbacks: once porchVoice has begun (wearer_porch), watch
  // showEvent until the seventh-time card goes by (porchVoice itself is left unwrapped: js/touches71's test reads it)
  const SEVEN = 'Seven times', BEFORE = 'You do not make a sound';
  let porchW = null;
  function watchPorch() {
    const f = F(), on = f.wearer_porch && !f.porch_survived && !f.p76_porch;
    if (porchW) { if (!on) unwatch(); return; }   // the porch ended another way: step back out
    if (!on) return;
    const own = window.showEvent;
    const w = function (t, b, c) {
      if (porchW === w && t === SEVEN) {
        F().p76_porch = 1; unwatch();
        if (F().p76_heard && !F().wearer_dead && typeof b === 'string' && b.indexOf(BEFORE) > 0) b = b.replace(BEFORE, TX.porch + '<br><br>' + BEFORE);
      }
      return own.call(this, t, b, c);
    };
    w._own = own; porchW = w; window.showEvent = w;
  }
  // put showEvent back only if nobody has wrapped it since; otherwise our wrapper stays in the chain as a pass-through
  function unwatch() { const w = porchW; porchW = null; if (w && window.showEvent === w) window.showEvent = w._own || window.showEvent; }

  // ================================================================ l · Consecrated
  function sermonLine() {
    if (typeof SYNOD15 === 'undefined' || !SYNOD15.ui || !SYNOD15.ui.open || !SYNOD15.ui.done) return;
    const box = document.getElementById('s15-lines'); if (!box || box.querySelector('.p76-cons')) return;
    const p = document.createElement('p'); p.className = 's15-line p76-cons'; p.textContent = TX.cons; box.appendChild(p);
  }
  // a Legionnaire standing or walking at your side: a figure, or one at its post (never one that is after you)
  const isLegion = (e) => e && !e.dead && !e.hidden && (e.type === 'legionnaire' || e.sprite === 'legionnaire') && (e.kind === 'deco' || e.passive || e.state === 'passive');
  function wardTwice() {
    const f = F();
    if (G.mapId !== 'oakhaven' || !partOne() || !G.player.glassed || f.p76_wday === day() + 1 || typeof NARROW28 === 'undefined') return;
    const c = Engine.cam;
    if (!G.ents.some((e) => isLegion(e) && Math.hypot(e.x - c.x, e.y - c.y) <= 2)) return;
    const w = NARROW28.witness(); if (!w) return;
    f.p76_wday = day() + 1;
    const n = typeof NPCS !== 'undefined' && NPCS[w.id] && w.id !== 'townsman' && w.id !== 'townswoman' ? String(NPCS[w.id].name || '').split(',')[0] : '';
    say(n ? fmt(TX.wardNamed, n) : (w.id === 'townswoman' || w.sprite === 'townswoman' ? TX.wardShe : TX.wardHe), 'warn', 7000);
  }

  // ================================================================ p · the margin
  const NOTES = ['', 'plain', 'comfort'];
  const noteOf = (l) => (l && NOTES.includes(l.p76n) ? l.p76n : '');
  const weekday = (d) => (typeof DAYS !== 'undefined' ? DAYS[((d | 0) % 8 + 8) % 8] : '');
  const noteText = (l, n) => (n === 'plain' ? fmt(TX.plainNote, l.where, weekday(l.day)) : n === 'comfort' ? TX.comfortNote : '');
  function setNote(i, v) {
    const l = G.ledger[i]; if (!l || guest()) return;
    delete l.p76s;
    if (v === 'plain' || v === 'comfort') l.p76n = v; else delete l.p76n;
    if (v === 'comfort' && F().sable_joined) {
      l.p76s = true;
      if (!F().p76_veil) {
        F().p76_veil = 1; closeModal();   // the card in place of the Ledger, and the Ledger back after it
        showEvent(TX.marginTitle, TX.sableStrikes + '<br><br>' + TX.rules, [{ t: TX.leave, f: () => { G.state = 'panel'; renderLedger(); } }]);
        return;
      }
      say(TX.struckAgain, 'voice', 4000);
    }
    renderLedger();
  }
  const CSS = '.p76-note{background:#1d1712;color:inherit;border:1px solid #6b5a3a;font:inherit;font-size:.8em;max-width:13em;padding:.1em .2em}'
    + '.p76-struck{display:block;font-size:.85em;margin-top:.15em}';
  function injectStyle() {
    if (document.getElementById('touches76-style')) return;
    const st = document.createElement('style'); st.id = 'touches76-style'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }
  function addMargins() {
    if (G.openPanel !== 'ledger' || !Array.isArray(G.ledger) || !G.ledger.length) return;
    injectStyle();
    const rows = document.querySelectorAll('#modal-panel table tr');
    G.ledger.forEach((l, i) => {
      const tr = rows[i]; if (!tr || tr.querySelector('.p76-note')) return;
      const td = document.createElement('td'), sel = document.createElement('select'), n = noteOf(l);
      sel.className = 'p76-note'; sel.setAttribute('aria-label', fmt(TX.marginOf, l.name));
      for (const v of NOTES) { const o = document.createElement('option'); o.value = v; o.textContent = v ? noteText(l, v) : TX.noNote; sel.appendChild(o); }
      sel.value = n; sel.onchange = () => setNote(i, sel.value);
      td.appendChild(sel);
      if (n === 'comfort' && l.p76s === true) {   // the select shows the note; a struck one is shown struck beside it
        const s = document.createElement('s'); s.className = 'muted p76-struck'; s.textContent = noteText(l, n);
        td.appendChild(s);
      }
      tr.appendChild(td);
    });
  }

  // ---------------------------------------------------------------- wiring
  let wardT = 0;
  function wire() {
    try { paintAll(); } catch (e) { warnOnce('art', e); }
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        try { if (e && e._p76 && e.use === 'p76_clamp' && hasG()) { useClamp(e); return undefined; } } catch (err) { warnOnce('use', err); }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof update === 'function') {
      const _up = update;
      update = function (dt) {
        const r = _up.apply(this, arguments);
        try {
          if (hasG() && !guest()) {
            watchPorch();   // grove.js porchVoice has begun (seen a frame later, before any click)
            tickJob(Number(dt) || 0);
            sermonLine();
            if (G.state === 'play' && (wardT += Number(dt) || 0) >= 0.25) { wardT = 0; wardTwice(); }
          }
        } catch (e) { warnOnce('update', e); }
        return r;
      };
    }
    if (typeof renderSongs === 'function') {
      const _rs = renderSongs;
      renderSongs = function () { const r = _rs.apply(this, arguments); try { addSongRow(); } catch (e) { warnOnce('songs', e); } return r; };
    }
    if (typeof renderLedger === 'function') {
      const _rl = renderLedger;
      renderLedger = function () { const r = _rl.apply(this, arguments); try { addMargins(); } catch (e) { warnOnce('ledger', e); } return r; };
    }
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () { job = null; return _rg.apply(this, arguments); };   // a day's work does not survive a load
    }
    if (typeof loadMap === 'function') {
      const _lm = loadMap;
      loadMap = function () { const r = _lm.apply(this, arguments); try { stage(); } catch (e) { warnOnce('loadMap', e); } return r; };
    }
  }
  try { wire(); } catch (e) { console.warn('touches76 failed to wire', e); }

  return { TX, TEXTS, B, CLAMPS, job: () => job, stage, whistle, setNote };
})();
if (typeof window !== 'undefined') window.TOUCHES76 = TOUCHES76;
