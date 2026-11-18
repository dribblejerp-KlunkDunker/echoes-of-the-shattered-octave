// ============================================================
//  places97 — Phase 97: quest markers on the map, and every place you read or hear of.
//
//  Owner, 17 Nov: "I also want the quest markers and when I read or hear of a place of interest I want them to show up on
//  the map with a special mini marker that signifies what kind of location it is."
//
//  A place of interest is a named door (every door in the world that says where it leads: "The Boar & Dulcimer",
//  "Rooke's surgery", "The Chapel of the Carillon") or one of the places the game's own "Where is..." talk knows (the
//  market, the Flume crossing, the mooring mast). The game's own names are the only source: nothing is invented here.
//
//  A place becomes known when its name is put in front of you or said to you:
//    heard   in what somebody says in a conversation, and when you ask "Where is ..."
//    read    on a board, a notice, a book, a held document, a card or an event; in a message at the top of the view
//    seen    on its own door or sign, when you look at it
//  A plain word counts in the town it belongs to ("the chapel" said in Oakhaven is Oakhaven's chapel); a full name counts
//  anywhere, so hearing of a place in another town marks it on that town's map for when you get there.
//
//  A known place is drawn on its map with a small mark for what kind of place it is, whether or not you have walked
//  there: an inn (a tankard), a healer (a cross), a chapel (a bell), a hall, a gate, a works (a wheel: a mill, a tannery,
//  a dye-house), a store (a barn or granary), a shop (a coin), a house, a mooring (an anchor), a way down (a cellar or a
//  culvert), water, a market, a school, a tower; anything else gets a star. Quest markers are drawn the same way wherever
//  they stand, in the compass's own shapes (js/compass97.js): a gold diamond, a pale-blue disc for a side quest, a
//  diamond with a dark eye for the door that leads toward the nearest one. Under the map is a list of what is marked,
//  in words, so the reader (js/reader97.js) can say it.
//
//  Saved: bit fields in G.flags, 'p97m_<map>_<row>_<n>' (a bit a column), small whole numbers, read through a clamp. Nothing here draws from
//  chance. Options > "Map Objective Markers" off hides the quest marks; the places stay.
// ============================================================
'use strict';

const PLACES97 = (() => {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    learned: S('{0} is on your map now.'),
    learnedFar: S('{0} is marked on the map of {1}.'),
    listTitle: S('Marked on this map:'),
    listNone: S('Nothing is marked on this map yet. Places you read or hear of are marked here.'),
    quest: S('a quest marker'), side: S('a side-quest marker'), via: S('the way to the nearest quest marker'),
    kinds: {
      inn: S('an inn'), healer: S('a healer'), chapel: S('a chapel'), hall: S('a hall'), gate: S('a gate'), works: S('a works'), store: S('a store'), shop: S('a shop'), house: S('a house'),
      moor: S('a mooring'), under: S('a way down'), water: S('water'), market: S('a market'), school: S('a school'), tower: S('a tower'), place: S('a place'),
    },
  };
  // what kind of place a name is: the first rule that fits
  const RULES = [
    ['inn', /\b(inn|tavern|alehouse|taproom|boar & dulcimer|rest-house|hostel)\b/i],
    ['healer', /\b(surgery|infirmary|physician|apothecary|healer|hospital|leech)\b/i],
    ['school', /\b(school|conservatory|library|reading-room|archive)\b/i],
    ['chapel', /\b(chapel|church|basilica|shrine|abbey|vigil|cloister|altar|mausoleum|belfry|nave)\b/i],
    ['gate', /\b(gate|postern|arch|toll|wicket)\b/i],
    ['moor', /\b(mast|mooring|dock|docks|quay|mole|harbour|wharf|kestrel|landing|anchorage)\b/i],
    ['under', /\b(cellar|culvert|vault|crypt|undercroft|shaft|sewer|pit|mine|quarry|bore|tunnel|catacomb|stair down|hatch)\b/i],
    ['water', /\b(flume|well|fountain|spring|ford|pool|pump|pumps|weir|cistern)\b/i],
    ['market', /\b(market|glassmarket|fair|stalls)\b/i],
    ['house', /\b(row|lane|street|terrace)\b/i],
    ['works', /\b(mill|tannery|dyer|dye-house|forge|smithy|foundry|malting|press|workshop|fulling|cooper|chandler|wheelwright|brewery|kiln|winch|yard)\b/i],
    ['store', /\b(granary|barn|store|storehouse|shed|warehouse|depot|counting-house)\b/i],
    ['tower', /\b(tower|spire|keep|watch-house|watchhouse|lighthouse|bell-tower)\b/i],
    ['hall', /\b(hall|greenhall|moot|office|court|registry|house of|guild|palace|synod)\b/i],
    ['shop', /\b(shop|stall|baker|chandlery|factor|merchant|trader)\b/i],
    ['house', /\b(house|home|cottage|hut|row|lodging|cell|room|washhouse)\b|'s?$|'s?\b/i],
  ];
  const kindOf = (name) => { for (const [k, re] of RULES) if (re.test(name)) return k; return 'place'; };
  // a door's label, cut to the name in it: "The Sowerbys' — empty" -> "The Sowerbys'"
  const nameOf = (label) => String(label || '').replace(/<[^>]+>/g, '').split(/\s[—–-]\s|[.:;(]|,\s/)[0].trim();
  // not places: ways back, and doors that are only described
  const NOT = /^(out|back|the way|the door|a door|the stair|a stair|the ladder|a ladder|down|up|leave|return|climb|go |step |into |to the|the hatch|the trapdoor|a shuttered|a barred|a locked|a cell of|the low|the black arch)/i;
  const core = (n) => n.replace(/^(the|a|an)\s+/i, '').trim();
  const low = (s) => String(s).toLowerCase().replace(/[’`]/g, "'").replace(/\s+/g, ' ');

  // ---------------------------------------------------------------- the index: every place of every map
  let IDX = null;
  function index() {
    if (IDX || typeof G === 'undefined' || !G.maps) return IDX;
    const byMap = {}, all = [];
    for (const id of Object.keys(G.maps)) {
      const m = G.maps[id]; if (!m || !m.cells) continue;
      const list = [], seen = new Set();
      for (let i = 0; i < m.cells.length; i++) {
        const c = m.cells[i]; if (!c || !c.door || !c.label) continue;
        const n = nameOf(c.label); if (n.length < 4 || NOT.test(n) || !/[A-Za-z]{3}/.test(n)) continue;
        if (!c.portal && /^(a|an)\s/i.test(n)) continue;                      // "A granary", barred: described, not named
        const k = low(n); if (seen.has(k)) continue; seen.add(k);
        list.push({ name: n, x: (i % m.w) + 0.5, y: ((i / m.w) | 0) + 0.5, kind: kindOf(n) });
      }
      // the game's own "Where is ..." places for this town
      const own = id === 'oakhaven' && typeof PLACES !== 'undefined' && typeof PLACE_POS !== 'undefined' ? Object.keys(PLACES).map((n) => [n, PLACE_POS[PLACES[n]]])
        : id === 'whispergrove' && typeof PLACES_WG !== 'undefined' ? Object.entries(PLACES_WG) : id === 'deepwoods' && typeof PLACES_DW !== 'undefined' ? Object.entries(PLACES_DW) : [];
      for (const [n, pos] of own) { if (!pos) continue; const k = low(n);
        const near = list.find((p) => Math.hypot(p.x - pos[0], p.y - pos[1]) < 2.6 && (low(core(p.name)).indexOf(low(core(n)).split(' ')[0]) >= 0 || low(core(n)).indexOf(low(core(p.name)).split(' ')[0]) >= 0));
        if (near) { (near.also = near.also || []).push(n); continue; }
        if (seen.has(k)) continue; seen.add(k); list.push({ name: n, x: pos[0], y: pos[1], kind: kindOf(n) }); }
      list.sort((a, b) => a.y - b.y || a.x - b.x || (a.name < b.name ? -1 : 1));
      list.forEach((p, i) => { p.i = i; p.map = id; p.keys = [low(core(p.name))].concat((p.also || []).map((n) => low(core(n)))); all.push(p); });
      byMap[id] = list;
    }
    // a full name is its place's alone only if no other map has the same one
    const count = {}; for (const p of all) for (const k of p.keys) count[k] = (count[k] || 0) + 1;
    for (const p of all) p.far = p.keys.filter((k) => count[k] === 1 && k.length >= 6);
    // the plain word for it, good in its own town: "the chapel", "the mill", "the surgery"
    for (const id of Object.keys(byMap)) { const words = {};
      for (const p of byMap[id]) { const w = low(core(p.name)).split(/[\s']+/).filter((x) => x.length >= 4 && /^(mill|chapel|surgery|tannery|market|greenhall|gate|mast|tavern|inn|flume|culvert|granary|school|library|forge|well|fountain|docks|harbour|watch-house|basilica|vigil|anchorage|malting|moot-house|conservatory)$/.test(x)); p.plain = w; for (const x of w) words[x] = (words[x] || 0) + 1; }
      for (const p of byMap[id]) p.plain = p.plain.filter((x) => words[x] === 1); }
    IDX = { byMap, all };
    return IDX;
  }
  const hubOf = (id) => { const m = G.maps[id]; if (m && m.outdoor) return id; if (!m) return id; for (const c of m.cells) if (c && c.portal && G.maps[c.portal.map] && G.maps[c.portal.map].outdoor) return c.portal.map; return id; };

  // ---------------------------------------------------------------- what is known (saved as small whole numbers)
  // a place is kept by where it stands (its map, its row, its column), so a door renamed later cannot shift the others
  const key = (p) => 'p97m_' + p.map + '_' + (p.y | 0) + '_' + (((p.x | 0) / 30) | 0);
  const bits = (k) => { const v = Number(G.flags[k]); return Number.isFinite(v) ? Math.max(0, Math.min(0x3fffffff, Math.floor(v))) : 0; };
  const isKnown = (p) => !!(bits(key(p)) & (1 << ((p.x | 0) % 30)));
  function mark(p, quiet) {
    if (!p || isKnown(p)) return false;
    G.flags[key(p)] = bits(key(p)) | (1 << ((p.x | 0) % 30));
    marks.push({ name: p.name, map: p.map, at: typeof G !== 'undefined' ? G.mapId : '', quiet: !!quiet, from: lastText.slice(0, 80) }); if (marks.length > 40) marks.shift();   // for checks: what was marked, where you stood, and from which words
    if (!quiet) { try { const here = G.mapId === p.map, t = tr(here ? TX.learned : TX.learnedFar).replace('{0}', tr(p.name)).replace('{1}', tr(G.maps[p.map].name)); muted = t; msg(t, 'good', 4200); } catch (e) { /* the mark is made all the same */ } }
    return true;
  }
  const known = (mapId) => { const ix = index(); return ix && ix.byMap[mapId] ? ix.byMap[mapId].filter(isKnown) : []; };
  const tr = (s) => { try { if (typeof STORY_I18N !== 'undefined' && STORY_I18N.translate) { const o = STORY_I18N.translate(s); if (typeof o === 'string' && o) return o; if (o && typeof o.t === 'string') return o.t; } } catch (e) { /* English */ } return s; };

  // ---------------------------------------------------------------- reading and hearing
  const wordAt = (text, k, from) => { let i = text.indexOf(k, from || 0); while (i >= 0) { const a = i === 0 ? ' ' : text[i - 1], b = i + k.length >= text.length ? ' ' : text[i + k.length]; if (!/[a-z0-9]/.test(a) && !/[a-z0-9]/.test(b)) return i; i = text.indexOf(k, i + 1); } return -1; };
  const scanned = new Set(); let muted = '';
  // text put in front of the player: mark every place it names. Returns how many were new.
  const marks = []; let lastText = '';
  function hear(text, quiet) {
    lastText = String(text || '');
    const ix = index(); if (!ix || typeof G === 'undefined' || !G.flags || !G.map || guest()) return 0;
    const t = low(String(text || '').replace(/<[^>]+>/g, ' ')); if (t.length < 4 || t === low(muted)) return 0;
    const sig = G.mapId + '|' + t; if (scanned.has(sig)) return 0; scanned.add(sig); if (scanned.size > 4000) scanned.clear();
    let n = 0; const hub = hubOf(G.mapId), mine = (id) => id === G.mapId || id === hub;
    for (const p of ix.all) {
      if (isKnown(p)) continue;
      let hit = false;
      if (mine(p.map)) hit = p.keys.some((k) => k.length >= 4 && wordAt(t, k) >= 0) || p.plain.some((w) => wordAt(t, 'the ' + w) >= 0);
      else hit = p.far.some((k) => wordAt(t, k) >= 0);
      if (hit && mark(p, quiet)) n++;
    }
    return n;
  }

  // ---------------------------------------------------------------- the marks
  // a small mark for a kind, about nine pixels, on a dark tile with a pale edge
  function icon(cx, kind, x, y) {
    x = Math.round(x); y = Math.round(y);
    cx.save(); cx.translate(x - 4, y - 4);
    cx.fillStyle = '#17110b'; cx.fillRect(0, 0, 9, 9); cx.fillStyle = '#e9dcb4'; cx.fillRect(0, 0, 9, 1); cx.fillRect(0, 8, 9, 1); cx.fillRect(0, 0, 1, 9); cx.fillRect(8, 0, 1, 9);
    const r = (c, a, b, w, h) => { cx.fillStyle = c; cx.fillRect(a, b, w, h); };
    if (kind === 'inn') { r('#e2a23a', 2, 3, 4, 4); r('#fff4d8', 2, 2, 4, 1); r('#e2a23a', 6, 4, 1, 2); }
    else if (kind === 'healer') { r('#f4f0e6', 2, 2, 5, 5); r('#3fa35a', 4, 2, 1, 5); r('#3fa35a', 2, 4, 5, 1); }
    else if (kind === 'chapel') { r('#f0c84a', 3, 2, 3, 1); r('#f0c84a', 2, 3, 5, 3); r('#f0c84a', 4, 6, 1, 1); r('#8a6a1a', 2, 5, 5, 1); }
    else if (kind === 'hall') { r('#d8d2c2', 2, 2, 5, 1); r('#d8d2c2', 2, 3, 1, 4); r('#d8d2c2', 4, 3, 1, 4); r('#d8d2c2', 6, 3, 1, 4); }
    else if (kind === 'gate') { r('#b8ac98', 2, 2, 5, 5); r('#17110b', 3, 4, 3, 3); r('#17110b', 4, 3, 1, 1); }
    else if (kind === 'works') { r('#9aa2ac', 3, 2, 3, 5); r('#9aa2ac', 2, 3, 5, 3); r('#17110b', 4, 4, 1, 1); }
    else if (kind === 'store') { r('#a87a48', 2, 3, 5, 4); r('#6e4a26', 2, 3, 5, 1); r('#6e4a26', 4, 4, 1, 3); }
    else if (kind === 'shop') { r('#f0c84a', 3, 2, 3, 5); r('#f0c84a', 2, 3, 5, 3); r('#8a6a1a', 4, 3, 1, 3); }
    else if (kind === 'house') { r('#b85a3a', 4, 2, 1, 1); r('#b85a3a', 3, 3, 3, 1); r('#b85a3a', 2, 4, 5, 1); r('#e6dcc4', 3, 5, 3, 2); }
    else if (kind === 'moor') { r('#7fb8e8', 4, 2, 1, 5); r('#7fb8e8', 3, 3, 3, 1); r('#7fb8e8', 2, 5, 1, 1); r('#7fb8e8', 6, 5, 1, 1); r('#7fb8e8', 3, 6, 3, 1); }
    else if (kind === 'under') { r('#b8a0d8', 2, 2, 2, 1); r('#b8a0d8', 3, 3, 2, 1); r('#b8a0d8', 4, 4, 2, 1); r('#b8a0d8', 5, 5, 2, 1); r('#b8a0d8', 5, 6, 2, 1); }
    else if (kind === 'water') { r('#5aa8e0', 4, 2, 1, 1); r('#5aa8e0', 3, 3, 3, 2); r('#5aa8e0', 2, 5, 5, 1); r('#5aa8e0', 3, 6, 3, 1); }
    else if (kind === 'market') { r('#d85a4a', 2, 2, 1, 2); r('#f4f0e6', 3, 2, 1, 2); r('#d85a4a', 4, 2, 1, 2); r('#f4f0e6', 5, 2, 1, 2); r('#d85a4a', 6, 2, 1, 2); r('#b8ac98', 2, 4, 1, 3); r('#b8ac98', 6, 4, 1, 3); }
    else if (kind === 'school') { r('#e6dcc4', 2, 3, 5, 4); r('#6a8ab8', 4, 3, 1, 4); r('#8a7c60', 2, 6, 5, 1); }
    else if (kind === 'tower') { r('#c8c0b0', 3, 2, 3, 5); r('#17110b', 4, 2, 1, 1); r('#17110b', 4, 5, 1, 2); }
    else { r('#f0e0a0', 4, 2, 1, 5); r('#f0e0a0', 2, 4, 5, 1); r('#f0e0a0', 3, 3, 3, 3); }
    cx.restore();
  }
  function questMark(cx, kind, x, y) {
    cx.save(); cx.lineWidth = 1; cx.beginPath();
    if (kind === 'side') cx.arc(x, y, 3.2, 0, Math.PI * 2); else { cx.moveTo(x, y - 4.5); cx.lineTo(x + 3.5, y); cx.lineTo(x, y + 4.5); cx.lineTo(x - 3.5, y); cx.closePath(); }
    cx.fillStyle = kind === 'side' ? '#9fd8ff' : '#ffd24a'; cx.fill(); cx.strokeStyle = '#1a120a'; cx.stroke();
    if (kind === 'via') { cx.fillStyle = '#1a120a'; cx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); }
    cx.restore();
  }
  // on the map screen: the marks on the map, and the list under it
  function decorate() {
    const cv = document.getElementById('amap'); if (!cv || cv.dataset.p97 || typeof G === 'undefined' || !G.map) return;
    cv.dataset.p97 = '1';
    const cx = cv.getContext('2d'), cw = cv.width / G.map.w, places = known(G.mapId);
    const inX = (v) => Math.max(4, Math.min(cv.width - 5, Math.round(v))), inY = (v) => Math.max(4, Math.min(cv.height - 5, Math.round(v)));   // a gate on the map's edge keeps its whole mark
    for (const p of places) icon(cx, p.kind, inX(p.x * cw), inY(p.y * cw));
    let quests = [];
    try { if (typeof COMPASS97 !== 'undefined' && (typeof UPG === 'undefined' || UPG.questMarkers !== false)) { COMPASS97._st.at = -1e9; quests = COMPASS97.targets(); } } catch (e) { quests = []; }
    for (const q of quests) questMark(cx, q.kind, q.x * cw, q.y * cw - (q.kind === 'via' ? 0 : 4));
    const old = document.getElementById('p97-places'); if (old) old.remove();
    const box = document.createElement('div'); box.id = 'p97-places'; box.setAttribute('role', 'list'); box.style.cssText = 'display:flex;flex-wrap:wrap;gap:.3cqh .9cqw;margin-top:.6cqh;font-size:1.25cqw;align-items:center;max-height:13cqh;overflow-y:auto;scrollbar-width:thin';
    const head = document.createElement('p'); head.style.cssText = 'margin:0'; head.className = 'muted'; head.textContent = tr(places.length || quests.length ? TX.listTitle : TX.listNone); box.appendChild(head);
    const row = (draw, text) => { const s = document.createElement('span'); s.setAttribute('role', 'listitem'); s.className = 'p97-row'; s.style.cssText = 'display:inline-flex;align-items:center;gap:.35cqw';
      const c = document.createElement('canvas'); c.width = 11; c.height = 11; c.setAttribute('aria-hidden', 'true'); c.style.cssText = 'width:1.5cqw;height:1.5cqw;image-rendering:pixelated'; draw(c.getContext('2d')); s.appendChild(c);
      const t = document.createElement('span'); t.textContent = text; s.appendChild(t); box.appendChild(s); };
    const nQ = quests.filter((q) => q.kind === 'quest').length, nS = quests.filter((q) => q.kind === 'side').length, via = quests.find((q) => q.kind === 'via');
    if (nQ) row((c) => questMark(c, 'quest', 5.5, 5.5), tr(TX.quest) + (nQ > 1 ? ' × ' + nQ : ''));
    if (nS) row((c) => questMark(c, 'side', 5.5, 5.5), tr(TX.side) + (nS > 1 ? ' × ' + nS : ''));
    if (via) row((c) => questMark(c, 'via', 5.5, 5.5), tr(TX.via) + (via.label ? ': ' + tr(via.label) : ''));
    for (const p of places) row((c) => icon(c, p.kind, 5, 5), tr(p.name) + ' (' + tr(TX.kinds[p.kind]) + ')');
    cv.parentNode.insertBefore(box, cv.nextSibling);
    // The list takes the room that is left. What the panel shows under it (the legend, the places you marked, Clear
    // marks) stays in view; the list shows whole lines and scrolls for the rest. (With a dozen places known it had
    // pushed the Clear marks button off the bottom of the panel and cut its own last line in half: test/ledger15.)
    try {
      const pn = document.getElementById('modal-panel'), rows = box.querySelectorAll('.p97-row');
      if (pn && rows.length) {
        const cap = parseFloat(getComputedStyle(box).maxHeight) || 1e9; box.style.maxHeight = 'none';
        const full = box.getBoundingClientRect().height, rowGap = parseFloat(getComputedStyle(box).rowGap) || 0;
        const line = rows[0].getBoundingClientRect().height + rowGap, first = 0;   // (the heading sits on the first line with the first places)
        let want = Math.min(full, cap); box.style.maxHeight = want + 'px';
        const over = pn.scrollHeight - pn.clientHeight; if (over > 0) want -= over;
        if (want < full - 0.5) { const n = Math.max(1, Math.floor((want - first + rowGap) / line)); box.style.maxHeight = (first + n * line - rowGap) + 'px'; } else box.style.maxHeight = 'none';
      }
    } catch (e) { /* the list keeps its plain cap */ }
  }

  // ---------------------------------------------------------------- wiring
  let timer = 0;
  const seenEl = new WeakSet();
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest && SYNC19.isGuest(); } catch (e) { return false; } };
  function sweep() {
    timer = 0;
    try {
      if (typeof G === 'undefined' || !G.map || !G.flags || G.state === 'title') return;
      // in a friend's game the world and its flags are the host's: nothing is marked there, and what was said there is
      // not heard again when you are back in your own (your own save comes back exactly as it was: js/sync19.js)
      const away = guest();
      for (const sel of ['#dlg-log .them', '#event-panel', '#msgs .m', '#hint']) for (const el of document.querySelectorAll(sel)) {
        const once = sel === '#msgs .m' || sel === '#dlg-log .them';   // a line in the log is one thing said once; the hint and the event panel change their words
        if (once) { if (seenEl.has(el)) continue; seenEl.add(el); }
        if (away) continue;
        const t = el.textContent; if (t) hear(t, sel === '#hint');   // a door you are looking at is marked without a word
      }
      if (away) return;
      const mp = document.getElementById('modal-panel'), modal = document.getElementById('modal');
      if (mp && modal && !modal.classList.contains('hidden') && G.openPanel !== 'dialogue' && G.openPanel !== 'map' && G.openPanel !== 'controls' && G.openPanel !== 'travel' && G.openPanel !== 'travelanim') {   // (the travel chart is a map too: its names are places you can already go)
        for (const el of mp.querySelectorAll('p, li, blockquote, pre, h2, h3, .text, .page, .note')) { const t = el.textContent; if (t && t.length < 4000) hear(t); } }
    } catch (e) { /* never break the page */ }
  }
  function wire() {
    if (typeof document === 'undefined') return;
    const game = document.getElementById('game'); if (!game) return;
    try { new MutationObserver(() => { if (!timer) timer = setTimeout(sweep, 260); }).observe(game, { childList: true, subtree: true, characterData: true }); } catch (e) { /* asking still marks */ }
    // the place you are standing in is on your map from the moment you are in it (not a moment later, when its name is
    // read off the screen): a save made on arrival and one made after are the same
    // ... and so is the place you have just travelled to by the chart: it is marked without a word (it was being
    // announced in the middle of the journey's picture, before you had arrived: test/motion10)
    if (typeof travelGo === 'function') { const _tg = travelGo; travelGo = function (d) { const r = _tg.apply(this, arguments); try { if (d && d.name && typeof G !== 'undefined' && G.map && d.map === G.mapId) hear(String(d.name), true); } catch (e) { /* the journey is made all the same */ } return r; }; }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { const r = _lm.apply(this, arguments); try { if (typeof G !== 'undefined' && G.map && G.map.name) hear(String(G.map.name), true); } catch (e) { /* the map still loads */ } return r; }; }
    if (typeof askPlace === 'function') { const _ap = askPlace; askPlace = function (place) { try { hear(String(place), false); } catch (e) { /* the answer still comes */ } return _ap.apply(this, arguments); }; }
    if (typeof renderMap === 'function') { const _rm = renderMap; renderMap = function () { const r = _rm.apply(this, arguments); try { decorate(); } catch (e) { console.warn('places97: map marks failed', e); } return r; }; }
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', wire); else wire(); }

  return { TEXTS, TX, RULES, kindOf, nameOf, index, known, isKnown, mark, hear, icon, decorate, sweep, hubOf, marks, _reset: () => { IDX = null; scanned.clear(); } };
})();
if (typeof window !== 'undefined') window.PLACES97 = PLACES97;
if (typeof module !== 'undefined' && module.exports) module.exports = PLACES97;
