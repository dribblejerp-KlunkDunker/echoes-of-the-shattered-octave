// ============================================================
//  epigraphs73 — Book One's chapter epigraphs as documents in the world (ROADMAP R6; Story Brainstorm §3, "How books
//  could carry story").
//
//  Every chapter of the manuscript opens with a quoted document. Five of the twenty-four are already in the game word for
//  word and are not placed again: ch. 1 the skipping rhyme (js/upgrades.js, "Rhymes of the Hedge-Nursery"), ch. 3 the
//  Grafting Office handbook (the library's copy in Rooke's surgery), ch. 7 the Warrant's line (it opens the library's
//  sermon "The Only Song" in the chapel), ch. 15 the Veil's three rules (Sable says them, js/grove31.js, and the library's
//  "Rule of the House" keeps them) and ch. 22 Quist's precept (the library's Bistre commonplace book). The other nineteen
//  are papers you can pick up and read in the held-document reader (js/reading.js), each in its own paper:
//    quarry          Tobiah Marsh's copy of K. Vance (ch. 2; the book: in his satchel, ch. 5), until the escape, and
//                    Catalogue Circular 12 (ch. 5) by the first pump
//    Bonded Store    the label on a vox-bottle, Port Cantabile (ch. 4)
//    Lyra's house    the Cantor's notebooks on the shelf (book, l. 500): Tobin's entries of 401, 398 and 404 SR (ch. 6, 11, 23)
//    chapel          the Rubric of the Rite of Unison (ch. 9), once the Church has come (church_come or rite_ready)
//    Kestrel below   the bill of lading by the crates in the hold (ch. 8); on the engineer's bench, Tobiah's K. Vance (ch. 13)
//                    and, while you do not carry his charts, Revision Seven with the margin (ch. 10)
//    your pack       Tobiah's charts (js/data.js 'charts', "the only copy" of Revision Seven): used once the Rite has begun,
//                    they read the margin (ch. 10); before it they show their old description
//    Kestrel deck    the Rust Coast saying by the coiled rope (ch. 12); the Free Captains' handbill on the mast (ch. 21, from
//                    the cutter chase on: c68 or part4)
//    the Malting     Form 9 at registration (ch. 14); S.'s Notes Toward an Efficient Intake on a clerk's desk (ch. 18, from the
//                    front door on: p61, press_taken or part4); in the Tuning Room archive the south wall's paper (the book,
//                    l. 5120: "intake sheets and requisitions and carriage notes"): the carriage note for OK-114 (ch. 16, once
//                    Sable has joined) and Requisition 44 (ch. 17, once Sable has joined or the Cloister's Aegis has woken);
//                    and the box on the table with the Arbiterium cover-sheet (ch. 19)
//    the Cloister    A Plain Account of the Cacophony (ch. 20, once the press is taken or the porch has begun)
//    the Deep Woods  the herald's sealed sheet with the black ribbon (ch. 24), while he stands in the clearing after reading it
//  Each shows the quoted lines and the attribution exactly as the book prints them, and nothing else: the book quotes these
//  documents and never gives the rest. Every placement the book does not state, the labels and the gates are [PROPOSED]
//  (story/Game Layer/Phase 73 - The Epigraphs - New In-Game Text.md). No voices: documents are read, not spoken.
//  Nothing is gated on reading them. Papers are transient props, restaged on every map load (never saved). Reading one
//  marks it in G.flags.p73_read (a bitmask by DOCS order) and gives Lore +1 the first time.
// ============================================================
'use strict';

const EPI73 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('epigraphs73: ' + k + ' failed', e); } };

  const TX = {
    down: S('Put it down.'),
    back: S('Back.'),
    leave: S('Leave them.'),
    // the kinds, as the reader's kicker shows them
    kVolume: S('Volume'), kLabel: S('Label'), kCircular: S('Office circular'), kNotebook: S('Cantor\'s notebook'),
    kBill: S('Ship\'s papers'), kRubric: S('Rubric'), kSequence: S('Calibration sheet'), kSaying: S('Saying'),
    kForm: S('Standing form'), kNote: S('Carriage note'), kRequisition: S('Requisition'), kNotes: S('Office notes'),
    kCover: S('Cover-sheet'), kPrimer: S('Primer'), kHandbill: S('Handbill'), kWrit: S('Writ'),
  };

  // ---------------------------------------------------------------- the places (labels [PROPOSED] unless quoted from the book)
  // at: where the paper is put down (the nearest free floor cell is used); near: an entity to stand it by, when the map is generated
  const SPOTS = {
    quarry_book: { map: 'quarry', near: (e) => e.kind === 'npc' && e.id === 'tobiah', off: [0.4, -1.4], sprite: 'lib_book',
      label: S('A small battered book with a broken spine') },
    quarry_circular: { map: 'quarry', near: (e) => e.kind === 'deco' && e.sprite === 'pump', off: [0.9, 0.9], sprite: 'p73_sheet',
      label: S('An Office circular, pinned up by the pumps') },
    bonded_bottle: { map: 'lib_bonded', at: [9.4, 6.3], sprite: 'p73_bottle',
      label: S('A vox-bottle: blue glass, red wax, a paper label') },
    lyra_notebooks: { map: 'lyra_house', at: [3.0, 1.6], sprite: 'lib_book',
      label: S('The Cantor\'s notebooks, twenty years of them'), title: S('The Cantor\'s notebooks'),
      intro: S('Tobin Ashgrove\'s notebooks, full of intervals and orchard-lore and small pencil sketches of trees.') },
    chapel_rubric: { map: 'chapel', at: [8.4, 2.0], sprite: 'lib_book',
      label: S('The Rubric of the Rite, open by the altar step') },
    hold_bill: { map: 'p16k_kestrel_below', at: [23.4, 10.3], sprite: 'p73_sheet',
      label: S('A bill of lading, tacked to a crate') },
    below_bench: { map: 'p16k_kestrel_below', at: [8.6, 1.9], sprite: 'p73_sheet',
      label: S('Tobiah Marsh\'s papers, on the end of the engineer\'s bench'), title: S('Tobiah Marsh\'s papers'),
      intro: S('A month of readings, every quarter-hour, in his own small careful hand.') },
    deck_rope: { map: 'p16k_kestrel_deck', at: [23.4, 21.4], sprite: 'p73_plank',
      label: S('Words cut into a plank by the coiled rope') },
    deck_handbill: { map: 'p16k_kestrel_deck', at: [33.4, 18.4], sprite: 'p73_sheet',
      label: S('A handbill, nailed to the mast') },
    malting_form: { map: 'malting', at: [2.2, 8.2], sprite: 'p73_sheet',
      label: S('A stack of printed forms on the registration bench') },
    malting_notes: { map: 'malting', at: [11.4, 3.2], sprite: 'p73_sheet',
      label: S('A clerk\'s copy of the house notes, under a blotter') },
    archive_paper: { map: 'malting', at: [17.6, 17.4], sprite: 'p73_sheet',
      label: S('The shelves on the south wall: paper'), title: S('The south wall'),
      intro: S('The Office of the Catalogue keeps everything. It keeps intake sheets and requisitions and carriage notes.') },
    archive_box: { map: 'malting', at: [15.0, 19.6], sprite: 'p73_sheet',
      label: S('A box on the table: CONSORTIUM — DAWNING WORKS — RITE OF PURE UNISON — 411/412') },
    cloister_primer: { map: 'cloister', at: [5.2, 3.2], sprite: 'lib_book',
      label: S('A primer from the Null-Watch Press, on the end of a riser') },
    camp_writ: { map: 'deepwoods', near: (e) => e.kind === 'npc' && e.id === 'herald', off: [1.3, -0.6], sprite: 'p73_sheet',
      label: S('The sealed sheet with the black ribbon') },
  };

  // ---------------------------------------------------------------- gates: never before the story reaches the chapter
  const any = (...k) => (f) => k.some((x) => !!f[x]);
  const church = any('church_come', 'rite_ready', 'rite_started', 'greening', 'escaped', 'part3', 'part4');
  const sable = any('sable_joined', 'part4');
  const cloister = any('sable_joined', 'aegis_awake', 'aegis_calmed', 'aegis_destroyed', 'aegis_done', 'part4');
  const queue = (f) => (Number(f.p61) | 0) >= 1 || !!(f.press_taken || f.part4);
  const porch = any('press_taken', 'wearer_porch', 'porch_answered', 'porch_held', 'porch_survived', 'porch_aside', 'porch_slate', 'part4');
  const chase = (f) => (Number(f.c68) | 0) >= 1 || !!f.part4;
  const quarryDays = (f) => !(f.escaped || f.part3 || f.part4);       // Tobiah's copy goes aboard with him (ch. 13's passage)
  const rite = any('rite_started', 'greening', 'escaped', 'part3', 'part4');
  // Revision Seven with the margin is Tobiah's charts (js/data.js 'charts', "the only copy"): in your pack once he has
  // given them to you, read from there; on his bench aboard only while he still has them
  const charts = () => { try { return typeof G.has === 'function' && !!G.has('charts'); } catch (e) { return false; } };
  const writ = (f) => { const s = Number(f.h66) | 0; return !!f.herald_come && s >= 2 && s < 6; };   // he reads it at 1, is gone at 6

  // ---------------------------------------------------------------- the documents: the book's words, as Book One prints them
  const D = (id, ch, spot, title, kind, style, lines, attr, when) => ({ id, ch, spot, map: SPOTS[spot].map, title, kind, style, lines, attr, when: when || null });
  const DOCS = [
    D('e02', 2, 'quarry_book', S('On the Calibration of Resonant Bores, Tobiah Marsh\'s copy'), TX.kVolume, 'parch',
      [S('Every structure has a note at which it wishes to fail. The engineer\'s task is to find that note before the structure does, and to hold the bore a hair\'s breadth beneath it.')],
      S('K. Vance, <i>On the Calibration of Resonant Bores</i>, Conservatory of Bores, 409 SR'), quarryDays),
    D('e04', 4, 'bonded_bottle', S('The label on a vox-bottle'), TX.kLabel, 'paper',
      [S('VOX. Genuine Last Words, Sealed at the Deathbed.'), S('Do Not Unstop Within a Mile of Open Country.'), S('No Refunds.')],
      S('Label on a vox-bottle, Port Cantabile')),
    D('e05', 5, 'quarry_circular', S('Catalogue Circular 12'), TX.kCircular, 'office',
      [S('An engram is a harmonic template and possesses no identity. Speech emitted by a damaged engram is to be disregarded and is not to be recorded.')],
      S('Catalogue Circular 12, <i>On the Maintenance of Carillon Engrams</i>')),
    D('e06', 6, 'lyra_notebooks', S('The notebook of 401 SR'), TX.kNotebook, 'parch',
      [S('For lost lambs, the calling-song. Sing it full, or not at all. A lamb in the dark will not follow a whisper.')],
      S('T. Ashgrove, Cantor\'s notebook, 401 SR')),
    D('e08', 8, 'hold_bill', S('Bill of lading'), TX.kBill, 'office',
      [S('Item: engram cores, standard, in straw. Twelve crates. Consignee: Oakhaven Works, Carillon garrison. The consignment is not to be opened in transit. The Office is aware that carriers sometimes hear the consignment. Carriers who report hearing the consignment will not be engaged again.')],
      S('Bill of lading, Office of the Catalogue')),
    D('e09', 9, 'chapel_rubric', S('Rubric of the Rite of Unison'), TX.kRubric, 'parch',
      [S('The chosen voice shall not speak from the third day, that the instrument be not worn. She shall be given honey and raw egg. She shall be washed. She shall be told that she is fortunate.')],
      S('Rubric of the Rite of Unison'), church),
    D('e10', 10, 'below_bench', S('Vance Sequence, Revision Seven'), TX.kSequence, 'office',
      [S('STAGE 9 — UNISON HOLD. On failure of the hold, for any cause, the Sequence is not to be halted. Slippage is to be absorbed by the source.')],
      S('Vance Sequence, Rev. 7, marginal note in an unknown hand'), (f) => rite(f) && !charts()),
    D('e11', 11, 'lyra_notebooks', S('The notebook of 398 SR'), TX.kNotebook, 'parch',
      [S('Growth is the kindest of the eight laws and the least merciful. It has no idea what it is doing. It only knows the word more.')],
      S('T. Ashgrove, Cantor\'s notebook, 398 SR')),
    D('e12', 12, 'deck_rope', S('A Rust Coast saying'), TX.kSaying, 'slate',
      [S('The line is not a promise. The line is a rope.')],
      S('Rust Coast saying')),
    D('e13', 13, 'below_bench', S('On the Calibration of Resonant Bores, Tobiah Marsh\'s copy'), TX.kVolume, 'parch',
      [S('A structure does not fail where it is weakest. It fails where the load finds it.')],
      S('K. Vance, <i>On the Calibration of Resonant Bores</i>')),
    D('e14', 14, 'malting_form', S('Form 9: Intake'), TX.kForm, 'office',
      [S('Form 9: Intake. The subject is to be asked three questions and no more. Name. Age. Trade. Further speech is not to be recorded, as it lengthens the queue.')],
      S('Office of the Catalogue, standing forms')),
    D('e16', 16, 'archive_paper', S('Carriage note, Registry OK-114'), TX.kNote, 'office',
      [S('Registry OK-114. Consignment: twelve crates. The carrier attests that the consignment travelled dry, secure and unopened.'), S('Signature of carrier: (mark).')],
      S('Carriage note, Office of the Catalogue, Greenleaf 417'), sable),
    D('e17', 17, 'archive_paper', S('Requisition 44'), TX.kRequisition, 'office',
      [S('Requisition 44: small clear voices, forty (40). Source: charitable choir, Cloister road, Whisper-Grove. Note: one roof, one hour, one wagon. Efficient.')],
      S('Office of the Catalogue, requisition file, Ashfall 416'), cloister),
    D('e18', 18, 'malting_notes', S('Notes Toward an Efficient Intake'), TX.kNotes, 'office',
      [S('Queue discipline is the whole of the work. A subject who has been standing for two hours and has been told three times what will be asked will answer in under nine seconds. A subject who is surprised will take a minute and upset the line behind her.')],
      S('S., <i>Notes Toward an Efficient Intake</i>, Office of the Catalogue, 416'), queue),
    D('e19', 19, 'archive_box', S('The Arbiterium cover-sheet'), TX.kCover, 'office',
      [S('Engineer V. is not to be informed of the object of Stage 9. His calibration is measurably more accurate when he believes the object is extraction.')],
      S('Arbiterium cover-sheet, Rite of Pure Unison, 411 SR')),
    D('e20', 20, 'cloister_primer', S('A Plain Account of the Cacophony'), TX.kPrimer, 'paper',
      [S('It cannot read. It cannot guess. It knows nothing about you that was not said out loud within its hearing, which is why the old women say: do your weeping on paper.')],
      S('<i>A Plain Account of the Cacophony</i>, Null-Watch Press'), porch),
    D('e21', 21, 'deck_handbill', S('A Free Captains\' handbill'), TX.kHandbill, 'paper',
      [S('An Office cutter carries listening gear forward of the mast. Running silent will not help you. Your cargo is not silent.')],
      S('Free Captains\' handbill, Port Cantabile'), chase),
    D('e23', 23, 'lyra_notebooks', S('The notebook of 404 SR'), TX.kNotebook, 'parch',
      [S('For a death with no body, sing the full office anyway. The song is not for the dead. It is for the hole the dead left, and a hole will take a song the way dry ground takes rain.')],
      S('T. Ashgrove, Cantor\'s notebook, 404 SR')),
    D('e24', 24, 'camp_writ', S('Writ of Attainder and Grace'), TX.kWrit, 'office',
      [S('Writ of Attainder and Grace. Be it known that the persons herein named are declared Dissonant, their goods forfeit, their testimony void, their names struck. Provided always that grace is offered to each, once, and that a man who refuses grace has chosen what follows.')],
      S('Standing form, the Arbiterium'), writ),
  ];
  const DOC = Object.create(null);
  DOCS.forEach((d, i) => { d.bit = i; DOC[d.id] = d; });
  const docsAt = (spot) => DOCS.filter((d) => d.spot === spot);

  // ---------------------------------------------------------------- state
  const available = (id) => { const d = DOC[id]; return !!(d && hasG() && (!d.when || d.when(F()))); };
  const readMask = () => (hasG() ? (Number(F().p73_read) >>> 0) : 0);
  const isRead = (id) => !!(DOC[id] && (readMask() >>> DOC[id].bit) & 1);
  const open = (spot) => docsAt(spot).filter((d) => available(d.id));

  // ---------------------------------------------------------------- reading
  function html(d) {
    return '<div class="p73-doc"><p class="p73-q">' + d.lines.map((l) => '<i>' + l + '</i>').join('<br>') + '</p>'
      + '<p class="p73-a"><span>— </span>' + d.attr + '</p></div>';
  }
  function read(id, back) { return available(id) && show(DOC[id], back); }
  function show(d, back) {
    if (!isRead(d.id)) {
      F().p73_read = (readMask() | (1 << d.bit)) >>> 0;
      try { if (typeof gainSkill === 'function') gainSkill('Lore', 1); } catch (e) { /* optional */ }
    }
    injectStyle();
    showEvent(d.title, html(d), [back || { t: TX.down, f: null }]);
    return true;
  }
  // one paper reads at once; a place with several (the notebooks, Tobiah's papers, the south wall) offers them by title
  function useSpot(key) {
    const list = open(key), sp = SPOTS[key];
    if (!list.length) return false;
    if (list.length === 1) return read(list[0].id);
    const choices = list.map((d) => ({ t: (isRead(d.id) ? '✓ ' : '') + d.title, f: () => read(d.id, { t: TX.back, f: () => useSpot(key) }) }));
    choices.push({ t: TX.leave, f: null });
    showEvent(sp.title, '<p>' + sp.intro + '</p>', choices);
    return true;
  }

  // ---------------------------------------------------------------- props (transient; restaged on load)
  const keyed = (m, k) => (m.entities || []).find((e) => e && e._p73 === k);
  function spotNear(m, x, y, taken) {
    const ents = (m.entities || []).filter((e) => e && !e._p73 && !e.hidden);
    const trig = m.triggers || [], others = taken || [];
    const doors = Object.keys(m.doors || {}).map(Number).map((k) => [k % m.w + 0.5, Math.floor(k / m.w) + 0.5]);
    let best = null, bestD = Infinity;
    for (let cy = Math.max(1, Math.floor(y) - 4); cy <= Math.min(m.h - 2, Math.floor(y) + 4); cy++) {
      for (let cx = Math.max(1, Math.floor(x) - 4); cx <= Math.min(m.w - 2, Math.floor(x) + 4); cx++) {
        if (m.get(cx, cy)) continue;
        const i = cy * m.w + cx;
        if ((m.lvls && m.lvls[i]) || (m.smooth && m.smooth[i]) || (m.floorCells && m.floorCells[i] === 2)) continue;
        const px = cx + 0.5, py = cy + 0.5;
        if (doors.some(([dx, dy]) => (dx - px) ** 2 + (dy - py) ** 2 < 1.6 * 1.6)) continue;
        if (trig.some((t) => (t.x - px) ** 2 + (t.y - py) ** 2 < (t.r + 0.8) ** 2)) continue;
        if (ents.some((e) => (e.x - px) ** 2 + (e.y - py) ** 2 < Math.max(0.8, (e.radius || 0) + 0.5) ** 2)) continue;
        if (others.some(([ox, oy]) => (ox - px) ** 2 + (oy - py) ** 2 < 1)) continue;   // never on another paper's cell
        const dd = (px - x) ** 2 + (py - y) ** 2;
        if (dd < bestD) { best = [px, py]; bestD = dd; }
      }
    }
    return best;
  }
  // the free cell nearest the spot's place (or its entity, on a generated map)
  function placeFor(m, sp) {
    const e = sp.near && (m.entities || []).find((x) => x && sp.near(x));
    const w = sp.near ? (e && [e.x + sp.off[0], e.y + sp.off[1]]) : sp.at;
    return w ? spotNear(m, w[0], w[1], Object.values(m._p73).filter(Boolean)) : null;
  }
  function stage() {
    if (!hasG() || !G.map || !Array.isArray(G.map.entities)) return;
    const m = G.map, id = G.mapId;
    for (const key of Object.keys(SPOTS)) {
      const sp = SPOTS[key]; if (sp.map !== id) continue;
      const have = keyed(m, key), show = open(key).length > 0;
      if (!show) { if (have) m.entities.splice(m.entities.indexOf(have), 1); continue; }
      if (have) continue;
      m._p73 = m._p73 || {};
      if (!(key in m._p73)) m._p73[key] = placeFor(m, sp);   // once per map, even when there is no room (null)
      const pos = m._p73[key];
      if (!pos) continue;
      let e = { kind: 'deco', sprite: sp.sprite, x: pos[0], y: pos[1], scale: sp.sprite === 'lib_book' ? 0.32 : 0.42, solid: false, radius: 0.15,
        transient: true, _decor: true, _p73: key, use: 'p73_read', label: sp.label };
      if (typeof hydrate === 'function') e = hydrate(e) || e;
      m.entities.push(e);
    }
  }

  // ---------------------------------------------------------------- art (procedural stand-ins, painted once)
  function reg(name, w, h, draw) {
    if (typeof Engine === 'undefined' || !Engine.addSprite || (Engine.sprites && Engine.sprites[name]) || typeof document === 'undefined') return;
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const c = cv.getContext('2d', { willReadFrequently: true });
    draw(c);
    const id = c.getImageData(0, 0, w, h), u8 = id.data;
    for (let i = 0; i < w * h; i++) { const o = i * 4; u8[o + 3] = u8[o + 3] < 100 ? 0 : 255; }
    Engine.addSprite(name, { w, h, data: new Uint32Array(id.data.buffer), hs: 1, cx: 0.5, dy: 0 });
  }
  function paintAll() {
    reg('p73_sheet', 24, 24, (c) => {            // a sheet of paper lying flat, a few ruled lines
      c.fillStyle = '#d8d2bf'; c.fillRect(4, 15, 16, 7);
      c.fillStyle = '#efe9d6'; c.fillRect(5, 15, 14, 6);
      c.fillStyle = '#6b6252'; for (let x = 6; x < 18; x += 3) c.fillRect(x, 17, 2, 1);
      c.fillStyle = '#8a8170'; c.fillRect(6, 19, 9, 1);
    });
    reg('p73_bottle', 24, 24, (c) => {           // a small thing of blue glass, red wax, a paper label
      c.fillStyle = '#2f5a9a'; c.fillRect(9, 12, 6, 10);
      c.fillStyle = '#3f74c0'; c.fillRect(10, 13, 2, 8);
      c.fillStyle = '#2f5a9a'; c.fillRect(11, 9, 2, 3);
      c.fillStyle = '#9a2a22'; c.fillRect(10, 7, 4, 2);
      c.fillStyle = '#e8dfc4'; c.fillRect(9, 16, 6, 3);
    });
    reg('p73_plank', 24, 24, (c) => {            // a short plank, words cut into it
      c.fillStyle = '#6e5232'; c.fillRect(2, 16, 20, 6);
      c.fillStyle = '#87663f'; c.fillRect(2, 16, 20, 2);
      c.fillStyle = '#3b2a18'; for (let x = 4; x < 20; x += 3) c.fillRect(x, 19, 2, 1);
    });
  }
  const CSS = '.p73-doc{margin:.4em 0}.p73-q{font-size:1.08em;line-height:1.6}.p73-a{text-align:right;margin-top:1em}';
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('epigraphs73-style')) return;
    const st = document.createElement('style'); st.id = 'epigraphs73-style'; st.textContent = CSS;
    (document.head || document.documentElement).appendChild(st);
  }

  // ---------------------------------------------------------------- wiring
  function wire() {
    try { paintAll(); } catch (e) { warnOnce('art', e); }
    if (typeof READING !== 'undefined' && READING && READING.SOURCES) for (const d of DOCS) READING.SOURCES[d.title] = { style: d.style, kind: d.kind };
    if (typeof useDeco === 'function') {
      const _ud = useDeco;
      useDeco = function (e) {
        if (e && e.use === 'p73_read' && hasG()) { try { if (!useSpot(e._p73)) stage(); } catch (err) { warnOnce('read', err); } return undefined; }
        return _ud.apply(this, arguments);
      };
    }
    if (typeof useItem === 'function') {
      const _ui = useItem;
      useItem = function (slot) {
        if (slot && slot.id === 'charts' && hasG() && rite(F()) && charts()) { try { closeModal(); } catch (e) { /* none */ } show(DOC.e10); return undefined; }
        return _ui.apply(this, arguments);
      };
    }
    if (typeof loadMap === 'function') {
      const _lm = loadMap;
      loadMap = function () { const r = _lm.apply(this, arguments); try { stage(); } catch (e) { warnOnce('loadMap', e); } return r; };
    }
    // a chapter can arrive while you stand in the room (the herald reads his sheet in the clearing): look twice a second
    if (typeof update === 'function') {
      const _up = update; let t = 0;
      update = function (dt) {
        const r = _up.apply(this, arguments);
        t += Number(dt) || 0;
        if (t >= 0.5) { t = 0; try { if (hasG() && G.state === 'play') stage(); } catch (e) { warnOnce('update', e); } }
        return r;
      };
    }
  }
  try { wire(); } catch (e) { console.warn('epigraphs73 failed to wire', e); }

  return { TX, TEXTS, SPOTS, DOCS, DOC, available, isRead, open, read, useSpot, html, stage, spotNear };
})();
if (typeof window !== 'undefined') window.EPI73 = EPI73;
