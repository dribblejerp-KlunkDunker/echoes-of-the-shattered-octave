// ============================================================
//  compass97 — Phase 97: the compass points to quest and side-quest markers.
//
//  Owner, 17 Nov: "I also want the compass to point to any quest or sidequest markers."
//  The game's quest markers are the people the automap stamps as quest givers (js/logmap.js: LOGMAP.QUEST_GIVERS, the
//  list the side-quest modules add to and take from; Options > "Map Objective Markers" turns them off). Until now you saw
//  them only by opening the map, and only where you had already walked. Now each one on the map you are standing in has
//  a mark on the compass strip at its bearing:
//    a gold diamond       a quest marker
//    a pale-blue disc     a side-quest marker (shape as well as colour: the colourblind setting needs no change)
//    an arrow at an end   the marker is behind you on that side: turn that way
//    a diamond with a dark eye   nobody marked is on this map: this is the door that leads toward the nearest one
//  The nearest mark is drawn larger and last, so it sits on top. When the reader (js/reader97.js) is asked where you are
//  (F4 or ]), it also says where the nearest marker lies: "A quest marker is ahead and to the left, about 30 paces."
//
//  What it does not know: which step of a quest comes next. Quests here are told in the logbook, not kept as tracked
//  objectives, so the compass points at the people who give and take quests, not at a place a quest sends you to.
//
//  Nothing is saved, no flag is written, nothing is drawn from chance. The marks follow UPG.questMarkers.
// ============================================================
'use strict';

const COMPASS97 = (() => {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    quest: S('A quest marker is {0}, about {1} paces.'),
    side: S('A side-quest marker is {0}, about {1} paces.'),
    via: S('The way to the nearest quest marker is {0}, about {1} paces, through {2}.'),
    none: S('No quest markers are in reach.'),
    beside: S('A quest marker is right beside you.'), besideSide: S('A side-quest marker is right beside you.'),
    ahead: S('ahead'), aheadL: S('ahead and to the left'), aheadR: S('ahead and to the right'), left: S('to your left'), right: S('to your right'), behind: S('behind you'),
    door: S('a door'),
  };
  // the automap's own list as the game ships it: these are the story's givers; anyone a module adds later is a side quest
  const MAIN = new Set(['harrow', 'lyra', 'kaelen', 'hetty', 'vane', 'rooke', 'orla', 'tobiah', 'tam', 'hob', 'nell', 'ignatius', 'sable', 'sable_wg', 'sable_dw', 'lyra_wg', 'lyra_dw', 'kaelen_wg', 'kaelen_dw', 'vane_wg', 'vane_dw', 'tobiah_dw', 'halder', 'quist', 'lamplighter', 'aegis_wg', 'aegis_dw', 'sexton', 'herald', 'mags_dw']);
  const st = { list: [], at: -1e9, mapId: '', syncAt: -1e9, portals: new Map(), warned: false };
  const on = () => typeof UPG === 'undefined' || UPG.questMarkers !== false;
  const tr = (s) => { try { if (typeof STORY_I18N !== 'undefined' && STORY_I18N.translate) { const o = STORY_I18N.translate(s); if (typeof o === 'string' && o) return o; if (o && typeof o.t === 'string') return o.t; } } catch (e) { /* English */ } return s; };
  const fill = (s, ...a) => tr(s).replace(/\{(\d)\}/g, (m, i) => a[+i] == null ? '' : a[+i]);
  const givers = () => (typeof LOGMAP !== 'undefined' && LOGMAP && Array.isArray(LOGMAP.QUEST_GIVERS)) ? LOGMAP.QUEST_GIVERS : [];
  const marked = (ents, list) => (ents || []).filter((e) => e && e.kind === 'npc' && typeof e.id === 'string' && !e.hidden && !e.dead && list.indexOf(e.id) >= 0);

  // the modules that keep the list hook the map screen: run their hooks without opening it (js/game.js stops at G._dryMap)
  function sync() {
    if (typeof G === 'undefined' || typeof renderMap !== 'function' || !G.map) return;
    const was = G._dryMap;
    try { G._dryMap = true; renderMap(); } catch (e) { if (!st.warned) { st.warned = true; console.warn('compass97: sync', e); } } finally { if (was === undefined) delete G._dryMap; else G._dryMap = was; }
  }
  // the doors of a map that lead to another map (kept: maps do not move their doors)
  function portalsOf(id) {
    let p = st.portals.get(id); if (p) return p;
    p = []; const m = G.maps && G.maps[id];
    if (m && m.cells) for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.portal && typeof c.portal.map === 'string' && c.portal.map !== id) p.push({ x: (i % m.w) + 0.5, y: ((i / m.w) | 0) + 0.5, to: c.portal.map, c }); }
    st.portals.set(id, p); return p;
  }
  const passable = (c) => { if (!c.locked) return true; if (c.locked === '__never') return false; try { return !!(G.flags && G.flags[c.locked]); } catch (e) { return false; } };
  // nobody marked here: the first door on the shortest way (in doors) to a map that has somebody
  function wayOut(from, list) {
    const seen = new Set([from]); let frontier = portalsOf(from).filter((p) => passable(p.c)).map((p) => ({ first: p, id: p.to }));
    for (let depth = 0; depth < 6 && frontier.length; depth++) {
      const next = [];
      for (const f of frontier) {
        if (seen.has(f.id)) continue; seen.add(f.id);
        const m = G.maps[f.id]; if (!m) continue;
        if (marked(m.entities, list).length) return f.first;
        for (const p of portalsOf(f.id)) if (!seen.has(p.to) && passable(p.c)) next.push({ first: f.first, id: p.to });
      }
      frontier = next;
    }
    return null;
  }
  // every mark for the map you stand in: [{ x, y, kind: 'quest' | 'side' | 'via', label }]
  function targets() {
    if (typeof G === 'undefined' || !G.map || !G.player || !on()) return [];
    const t = Number.isFinite(G.time) ? G.time : 0;
    if (G.mapId === st.mapId && t - st.at < 1.5 && t >= st.at) return st.list;
    if (G.mapId !== st.mapId || t - st.syncAt > 12 || t < st.syncAt) { st.syncAt = t; sync(); }
    const list = givers(), out = marked(G.ents, list).map((e) => ({ x: e.x, y: e.y, kind: MAIN.has(e.id) ? 'quest' : 'side', label: '' }));
    if (!out.length && list.length && G.maps) { const p = wayOut(G.mapId, list); if (p) out.push({ x: p.x, y: p.y, kind: 'via', label: String(p.c.label || '') }); }
    st.list = out; st.at = t; st.mapId = G.mapId;
    return out;
  }
  const norm = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };
  // a mark as the compass sees it: rel is its bearing off the way you face (- left, + right), d its distance in cells
  function seen() {
    if (typeof Engine === 'undefined' || !Engine.cam) return [];
    const c = Engine.cam;
    return targets().map((m) => ({ ...m, rel: norm(Math.atan2(m.y - c.y, m.x - c.x) - c.dir), d: Math.hypot(m.x - c.x, m.y - c.y) })).sort((a, b) => b.d - a.d);
  }
  const X0 = 228, CW = 86, SPAN = 1.6;
  function draw() {
    if (typeof Engine === 'undefined' || !Engine.ctx || typeof VIEW_H === 'undefined' || typeof G === 'undefined' || G.state === 'title') return;
    const marks = seen(); if (!marks.length) return;
    const ctx = Engine.ctx, y = VIEW_H + 15.5, mid = X0 + CW / 2;
    ctx.save(); ctx.lineWidth = 1;
    marks.forEach((m, i) => {
      const near = i === marks.length - 1, off = Math.abs(m.rel) > SPAN, x = off ? (m.rel < 0 ? X0 + 4 : X0 + CW - 4) : mid + m.rel / SPAN * (CW / 2), r = near ? 3 : 2.2;
      const fillC = m.kind === 'side' ? '#9fd8ff' : '#ffd24a', edge = '#1a120a';
      ctx.beginPath();
      if (off) { const s = m.rel < 0 ? -1 : 1; ctx.moveTo(x + s * 3.5, y); ctx.lineTo(x - s * 2, y - 3); ctx.lineTo(x - s * 2, y + 3); ctx.closePath(); }
      else if (m.kind === 'side') ctx.arc(x, y, r, 0, Math.PI * 2);
      else { ctx.moveTo(x, y - r - 0.5); ctx.lineTo(x + r, y); ctx.lineTo(x, y + r + 0.5); ctx.lineTo(x - r, y); ctx.closePath(); }
      ctx.fillStyle = fillC; ctx.fill(); ctx.strokeStyle = edge; ctx.stroke();
      if (m.kind === 'via' && !off) { ctx.fillStyle = edge; ctx.fillRect(Math.round(x) - 1, Math.round(y) - 1, 2, 2); }   // hollow: a door on the way, not the person
    });
    ctx.restore();
  }
  // for the reader: where the nearest mark lies, in words
  function spoken() {
    const marks = seen(); if (!on()) return '';
    if (!marks.length) return tr(TX.none);
    const m = marks[marks.length - 1], a = Math.abs(m.rel);
    const where = tr(a < 0.35 ? TX.ahead : a < 1.15 ? (m.rel < 0 ? TX.aheadL : TX.aheadR) : a < 2.3 ? (m.rel < 0 ? TX.left : TX.right) : TX.behind), paces = Math.max(1, Math.round(m.d));
    if (m.kind !== 'via' && m.d < 2.2) return tr(m.kind === 'side' ? TX.besideSide : TX.beside);
    return m.kind === 'via' ? fill(TX.via, where, paces, tr(m.label || TX.door)) : fill(m.kind === 'side' ? TX.side : TX.quest, where, paces);
  }

  if (typeof drawHUD === 'function') { const _d = drawHUD; drawHUD = function () { const r = _d.apply(this, arguments); try { draw(); } catch (e) { if (!st.warned) { st.warned = true; console.warn('compass97: draw', e); } } return r; }; }

  return { TEXTS, TX, MAIN, targets, seen, spoken, draw, sync, _st: st };
})();
if (typeof window !== 'undefined') window.COMPASS97 = COMPASS97;
if (typeof module !== 'undefined' && module.exports) module.exports = COMPASS97;
