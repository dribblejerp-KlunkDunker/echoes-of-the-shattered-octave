// library26 — Phase 26, the Library of the Reach: a few dozen in-world books (history, lives, tales, verse,
// craft, faith and law, and the wider world) shelved where their readers would keep them.
//
//  * The books are data: js/library26-books.js (LIBRARY_BOOKS), built from tools/library/books/*.json by
//    tools/library/build.js. Each names a map (`where`); this module adds one small, non-solid pile of books
//    to each such map on a free floor cell against a wall, near the room's own shelf or furniture, so it can
//    never block a route. Transient: never saved, rebuilt whenever the map is loaded.
//  * Using the pile lists the books shelved there. Reading one marks it read (G.flags 'lib:<id>' === true),
//    adds it to your library, and never takes or consumes anything.
//  * The logbook gains "Your Library (n/m)", which opens the library: every book you have read, by shelf
//    (genre), to read again anywhere, and how many are still unfound in each part of the province.
//  * Every string shown comes from the constant tables here or in LIBRARY_BOOKS and is escaped; flags only
//    choose between them. French: tools/i18n/p26-library.tsv (story-i18n translates the page).
//  Switch: UPG.library (default on). Off = no piles, no logbook section.
'use strict';

const LIBRARY = (function () {
  const BOOKS = typeof LIBRARY_BOOKS !== 'undefined' && Array.isArray(LIBRARY_BOOKS) ? LIBRARY_BOOKS : [];
  const BY_ID = Object.create(null);
  for (const b of BOOKS) BY_ID[b.id] = b;
  const FLAG = id => 'lib:' + id;
  if (typeof UPG !== 'undefined' && UPG.library === undefined) UPG.library = true;
  const on = () => { try { return typeof UPG === 'undefined' || UPG.library !== false; } catch (e) { return true; } };

  // ---------------------------------------------------------------- shelves (genres) and regions
  const SHELVES = [
    { key: 'history', name: 'Histories and chronicles', genres: ['history', 'chronicle', 'almanac'] },
    { key: 'lives', name: 'Lives, letters and journals', genres: ['biography', 'autobiography', 'memoir', 'letters', 'journal'] },
    { key: 'tales', name: 'Tales and verse', genres: ['folk tale', 'fable', 'ghost story', 'romance', 'adventure', "children's", 'poetry', 'song', 'play'] },
    { key: 'craft', name: 'Craft and the natural world', genres: ['natural history', 'herbal', 'field guide', 'manual', 'cookery'] },
    { key: 'faith', name: 'Faith, law and the press', genres: ['sermon', 'catechism', 'philosophy', 'law', 'politics', 'pamphlet'] },
    { key: 'world', name: 'The wider world', genres: ['travel'] },
  ];
  const shelfOf = g => (SHELVES.find(s => s.genres.includes(String(g || '').toLowerCase())) || SHELVES[SHELVES.length - 1]);
  const GENRE_NAME = {
    'history': 'History', 'chronicle': 'Chronicle', 'almanac': 'Almanac', 'biography': 'Biography', 'autobiography': 'Autobiography',
    'memoir': 'Memoir', 'letters': 'Letters', 'journal': 'Journal', 'folk tale': 'Folk tale', 'fable': 'Fable', 'ghost story': 'Ghost story',
    'romance': 'Romance', 'adventure': 'Adventure', "children's": "Children's book", 'poetry': 'Poetry', 'song': 'Songbook', 'play': 'Play-script',
    'natural history': 'Natural history', 'herbal': 'Herbal', 'field guide': 'Field guide', 'manual': 'Manual', 'cookery': 'Cookery',
    'sermon': 'Sermon', 'catechism': 'Catechism', 'philosophy': 'Philosophy', 'law': 'Law', 'politics': 'Politics', 'pamphlet': 'Pamphlet',
    'travel': 'Travel',
  };
  const genreName = g => GENRE_NAME[String(g || '').toLowerCase()] || 'Book';
  const REGIONS = [
    { name: 'Oakhaven', maps: ['oakhaven', 'tavern', 'lyra_house', 'greenhall', 'surgery', 'mill', 'chapel', 'tannery', 'orla_house', 'cooper_house', 'watchhouse', 'p13h_tarrow', 'p16h_vestry', 'underhedge'] },
    { name: 'the Reach beyond the Hedge', maps: ['clearing', 'quarry', 'rootvault', 'p16h_depot3', 'flume_road', 'flume_landing', 'flume_lowrings', 'greenroot', 'greenroot_chapel', 'greenroot_crypt', 'p20_downs', 'p22_combe', 'p22_bellwether', 'p22_hanger', 'p22_barrow'] },
    { name: 'the Drift-Kestrel', maps: ['p16k_kestrel_deck', 'p16k_kestrel_below'] },
    { name: 'Whisper-Grove and the Woods', maps: ['whispergrove', 'cloister', 'malting', 'catacombs', 'wickhouse', 'p16d_lower', 'deepwoods', 'mausoleum', 'belfry'] },
  ];
  const regionOf = mapId => (REGIONS.find(r => r.maps.includes(mapId)) || { name: 'the province' }).name;

  // ---------------------------------------------------------------- state
  const flags = () => (typeof G !== 'undefined' && G.flags && typeof G.flags === 'object') ? G.flags : null;
  const has = id => { const f = flags(); return !!(f && f[FLAG(id)] === true); };
  const count = () => BOOKS.reduce((n, b) => n + (has(b.id) ? 1 : 0), 0);
  const booksAt = mapId => BOOKS.filter(b => b.where === mapId);

  // ---------------------------------------------------------------- text
  const esc = t => String(t == null ? '' : t).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  function bodyHtml(b) {
    const meta = [b.author, genreName(b.genre), b.year, b.origin].filter(Boolean).map(x => '<span>' + esc(x) + '</span>').join(' · ');
    const paras = (Array.isArray(b.text) ? b.text : String(b.text || '').split('\n\n')).map(p => {
      const lines = String(p).split('\n').map(esc);
      return '<p>' + lines.join('<br>') + '</p>';
    });
    return '<p class="lib-meta"><i>' + meta + '</i></p>' + paras.join('');
  }

  // ---------------------------------------------------------------- reading
  const MILESTONES = [[10, 'lib_ten', 'A Reader of the Reach', 'Read ten books from the Library of the Reach.'],
    [25, 'lib_quarter', 'Keeper of Shelves', 'Read twenty-five books from the Library of the Reach.']];
  function read(id, back) {
    const b = BY_ID[id];
    if (!b || !Object.prototype.hasOwnProperty.call(BY_ID, id)) return false;
    const first = !has(id);
    const f = flags(); if (f) f[FLAG(id)] = true;
    if (first) {
      try { if (typeof gainSkill === 'function') gainSkill('Lore', 1); } catch (e) { /* optional */ }
      try { if (typeof questXp === 'function') questXp(10); } catch (e) { /* optional */ }
      const n = count();
      try { if (typeof msg === 'function') msg('Added to your library (' + n + '/' + BOOKS.length + ').', 'good', 3500); } catch (e) { /* optional */ }
      try {
        if (typeof unlockAchievement === 'function') {
          for (const [k, aid, name, desc] of MILESTONES) if (n >= k) unlockAchievement(aid, name, desc);
          if (n >= BOOKS.length) unlockAchievement('lib_all', 'The Library of the Reach', 'Read every book in the Library of the Reach.');
        }
      } catch (e) { /* optional */ }
    }
    try { if (typeof closeModal === 'function') closeModal(); } catch (e) { /* ignore */ }
    showEvent(b.title, bodyHtml(b), [back || { t: 'Close the book.', f: null }]);
    return true;
  }

  function pile(mapId) {
    const here = booksAt(mapId);
    const choices = here.map(b => ({ t: (has(b.id) ? '✓ ' : '') + b.title, f: () => read(b.id) }));
    choices.push({ t: 'Leave the books.', f: null });
    const unread = here.filter(b => !has(b.id)).length;
    showEvent('Books', '<p>' + esc(PILE_TEXT[mapId] || PILE_TEXT._) + '</p><p class="muted">' + esc(unread ? (unread === 1 ? 'One here you have not read.' : unread + ' here you have not read.') : 'You have read everything here.') + '</p>', choices);
  }
  const PILE_TEXT = {
    _: 'A few books, kept where someone could reach them.',
    tavern: 'A shelf of books by the hearth, swollen with damp and read soft at the corners. Hetty lends them on trust.',
    lyra_house: 'The Cantor’s books, kept off the floor and away from the reeds.',
    greenhall: 'The Greenhall’s books: ledgers, almanacs, and whatever the town clerks thought worth keeping.',
    surgery: 'Rooke’s books, stacked under the window where the light is best for small print.',
    chapel: 'Books left in the Chapel, some of them by people who should not have left them.',
    mill: 'Books in a meal-sack, kept dry on the beam.',
    clearing: 'Books in a crate under the eaves of the hut, wrapped against the wet.',
    flume_landing: 'A tea-chest of books on the wharf, for sale or swap, no questions.',
    p16k_kestrel_below: 'The ship’s books, wedged into a rack so they do not fly about in weather.',
    deepwoods: 'Books in a saddlebag by the fire, dried and redried.',
    malting: 'Books the Office did not catalogue, or did and forgot.',
    whispergrove: 'Books someone carried out of a house and could not carry further.',
  };

  // ---------------------------------------------------------------- the pile on the floor
  // A free floor cell against a wall, near the room's shelf or furniture, clear of doors, triggers, entities and slopes.
  const ANCHORS = ['shelf', 'table', 'hearth', 'campfire', 'chest', 'bed', 'crates', 'lamp'];
  function findSpot(m) {
    if (!m || !m.w || !m.h) return null;
    const ents = (m.entities || []).filter(e => e && !e.libPile);
    let ax = m.spawn ? m.spawn.x : m.w / 2, ay = m.spawn ? m.spawn.y : m.h / 2;
    for (const s of ANCHORS) { const e = ents.find(o => o.sprite === s && o.kind === 'deco'); if (e) { ax = e.x; ay = e.y; break; } }
    const doorCells = Object.keys(m.doors || {}).map(Number).map(k => [k % m.w + 0.5, Math.floor(k / m.w) + 0.5]);
    const trig = m.triggers || [];
    let best = null, bestD = Infinity;
    for (let y = 1; y < m.h - 1; y++) for (let x = 1; x < m.w - 1; x++) {
      if (m.get(x, y)) continue;
      const i = y * m.w + x;
      if (m.lvls && m.lvls[i]) continue;
      if (m.smooth && m.smooth[i]) continue;
      if (m.floorCells && m.floorCells[i] === 2) continue;
      const wallN = (m.get(x + 1, y) ? 1 : 0) + (m.get(x - 1, y) ? 1 : 0) + (m.get(x, y + 1) ? 1 : 0) + (m.get(x, y - 1) ? 1 : 0);
      if (!wallN) continue;
      const cx = x + 0.5, cy = y + 0.5;
      if (doorCells.some(([dx, dy]) => (dx - cx) ** 2 + (dy - cy) ** 2 < 2.25 * 2.25)) continue;
      if (trig.some(t => (t.x - cx) ** 2 + (t.y - cy) ** 2 < (t.r + 0.8) ** 2)) continue;
      if (ents.some(e => (e.x - cx) ** 2 + (e.y - cy) ** 2 < Math.max(0.95, (e.radius || 0) + 0.6) ** 2)) continue;
      const d = (cx - ax) ** 2 + (cy - ay) ** 2;
      if (d < 1.4 || d >= bestD) continue;
      best = [cx, cy]; bestD = d;
    }
    return best;
  }
  function place(m, id) {
    if (!m || !Array.isArray(m.entities)) return;
    const already = m.entities.findIndex(e => e && e.libPile);
    if (!on() || !booksAt(id).length) { if (already >= 0) m.entities.splice(already, 1); return; }
    if (already >= 0) return;
    const at = m._libSpot || (m._libSpot = findSpot(m));
    if (!at) return;
    const e = { kind: 'deco', sprite: 'bookpile', x: at[0], y: at[1], scale: 0.42, solid: false, radius: 0.2, transient: true, _decor: true,
      use: 'library_pile', libPile: true, label: 'Books — read (' + booksAt(id).length + ')' };
    m.add(typeof hydrate === 'function' ? hydrate(e) : e);
  }

  // A small stack of bound books, spines out (procedural stand-in, 24x24).
  function paintPile() {
    if (typeof Engine !== 'undefined' && Engine.addSprite && !(Engine.sprites && Engine.sprites.bookpile)) {
      const w = 24, h = 24, d = new Uint32Array(w * h);
      const px = (x, y, r, g, b) => { if (x >= 0 && y >= 0 && x < w && y < h) d[y * w + x] = (255 << 24) | (b << 16) | (g << 8) | r; };
      const books = [[3, 20, 18, [92, 52, 34]], [4, 17, 16, [58, 70, 52]], [2, 14, 17, [118, 92, 52]], [5, 11, 14, [70, 54, 84]], [4, 8, 15, [134, 48, 40]]];
      for (const [x0, y0, len, c] of books) for (let y = y0; y < y0 + 3; y++) for (let x = x0; x < x0 + len; x++) {
        const edge = y === y0 || y === y0 + 2 || x === x0 || x === x0 + len - 1;
        const page = x > x0 + len - 3;
        if (page) px(x, y, 214, 202, 168); else px(x, y, edge ? c[0] * 0.6 : c[0], edge ? c[1] * 0.6 : c[1], edge ? c[2] * 0.6 : c[2]);
      }
      for (const [x0, y0, len] of books) for (let x = x0 + 2; x < x0 + len - 4; x += 4) px(x, y0 + 1, 196, 160, 84);   // gilt bands
      Engine.addSprite('bookpile', { w, h, data: d, hs: 1, cx: 0.5, dy: 0 });
    }
  }
  paintPile();

  // ---------------------------------------------------------------- your library (logbook)
  function decorateLog() {
    const panel = typeof document !== 'undefined' && document.getElementById('modal-panel');
    if (!panel || panel.querySelector('#lib-log') || !BOOKS.length) return;
    const sec = document.createElement('section'); sec.id = 'lib-log'; sec.className = 'lib-log';
    const h = document.createElement('h3'); h.textContent = 'Your Library (' + count() + '/' + BOOKS.length + ')'; sec.appendChild(h);
    const p = document.createElement('p'); p.className = 'muted';
    p.textContent = count() ? 'Every book you have read, to read again anywhere.' : 'Books are shelved in houses, halls and camps across the province. Read one and it is yours to reread.';
    sec.appendChild(p);
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.type = 'button'; b.id = 'lib-open'; b.textContent = 'Open your library';
    b.onclick = () => renderLibrary(); sec.appendChild(b);
    const first = panel.querySelector('h3');
    if (first) panel.insertBefore(sec, first); else panel.appendChild(sec);
  }
  function renderLibrary() {
    const parts = ['<h2>Your Library</h2><button class="dfbtn small close" id="lib-x">Close</button>',
      '<p class="muted">' + esc(count() + ' of ' + BOOKS.length + ' books read.') + '</p>'];
    for (const s of SHELVES) {
      const all = BOOKS.filter(b => shelfOf(b.genre) === s); if (!all.length) continue;
      const mine = all.filter(b => has(b.id));
      parts.push('<h3>' + esc(s.name) + ' <span class="muted">(' + mine.length + '/' + all.length + ')</span></h3><div class="lib-list" role="list">');
      for (const b of mine) parts.push('<button class="dfbtn small" type="button" role="listitem" data-lib="' + esc(b.id) + '"><b>' + esc(b.title) + '</b><br><small><span>' + esc(b.author) + '</span> · <span>' + esc(genreName(b.genre)) + '</span></small><br><small class="muted">' + esc(b.summary || '') + '</small></button>');
      parts.push('</div>');
      const left = all.filter(b => !has(b.id));
      for (const r of REGIONS) {
        const n = left.filter(b => regionOf(b.where) === r.name).length;
        if (n) parts.push('<p class="muted">' + esc('Not yet found in ' + r.name + ': ' + n + '.') + '</p>');
      }
    }
    openModal(parts.join(''), 'library');
    const x = document.getElementById('lib-x'); if (x) x.onclick = () => { closeModal(); G.state = 'play'; };
    for (const btn of document.querySelectorAll('#modal-panel [data-lib]')) btn.onclick = () => {
      G.state = 'event';
      read(btn.dataset.lib, { t: 'Back to your library.', f: () => { G.state = 'panel'; renderLibrary(); } });
    };
  }
  function injectStyle() {
    if (typeof document === 'undefined' || document.getElementById('lib-style')) return;
    const st = document.createElement('style'); st.id = 'lib-style';
    st.textContent = `.lib-log { margin: 0 0 1.2cqh; }
.lib-list { display: grid; grid-template-columns: repeat(auto-fill, minmax(min(100%, 18em), 1fr)); gap: .6cqh 1cqw; }
.lib-list .dfbtn { text-align: left; min-width: 0; overflow-wrap: anywhere; white-space: normal; }
.lib-meta { opacity: .8; }`;
    (document.head || document.documentElement).appendChild(st);
  }

  // ---------------------------------------------------------------- wiring
  if (typeof READING !== 'undefined' && READING.SOURCES) for (const b of BOOKS) READING.SOURCES[b.title] = { style: b.style || 'parch', kind: genreName(b.genre) };
  if (typeof document !== 'undefined') injectStyle();
  if (typeof loadMap === 'function') {
    const _loadMap = loadMap;
    loadMap = function (id) {
      try { if (typeof G !== 'undefined' && G.maps && G.maps[id]) place(G.maps[id], id); } catch (e) { console.warn('library: placement failed', e); }
      const r = _loadMap.apply(this, arguments);
      try { if (G.map) place(G.map, G.mapId || id); } catch (e) { /* never break a map change */ }
      return r;
    };
  }
  if (typeof useDeco === 'function') {
    const _useDeco = useDeco;
    useDeco = function (e) {
      if (e && e.use === 'library_pile') { if (on()) pile(G.mapId); return; }
      return _useDeco.apply(this, arguments);
    };
  }
  if (typeof renderLog === 'function') {
    const _renderLog = renderLog;
    renderLog = function () {
      const r = _renderLog.apply(this, arguments);
      if (on()) { try { decorateLog(); } catch (e) { console.warn('library: logbook section failed', e); } }
      return r;
    };
  }

  return { BOOKS, SHELVES, REGIONS, has, count, booksAt, read, pile, place, findSpot, renderLibrary, bodyHtml, genreName, shelfOf, regionOf };
})();
