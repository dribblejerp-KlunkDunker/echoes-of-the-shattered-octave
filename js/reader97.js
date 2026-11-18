// ============================================================
//  reader97 — Phase 97: "Read everything aloud".
//
//  Owner, 17 Nov: "I need all the lines properly voiced, my brother cant read so he needs everything read to him."
//  Until now the game spoke its recorded greetings, barks and boss lines (js/voice-acting.js) and, as an option, let the
//  browser read the last line of a conversation, cut at 220 letters. Nothing read a message, a sign, a door, a choice,
//  a menu, the logbook, a card or the screens before the game starts.
//
//  With the reader on, every line the game puts in front of the player is spoken by the device's own reading voice
//  (the browser's speechSynthesis: no sound files, nothing downloaded):
//    messages      every line that appears at the top of the view (#msgs), in order, none dropped
//    what you face the line under the crosshair (#hint): a door's name, a sign, a person, "press E" lines
//    conversations each thing a person says, with their name, in a pitch of their own; then the answers you can give
//    choices       an event's title, its text, and each choice, numbered
//    panels        the title and the text of every panel (logbook, map, shop, rest, options, help, a held book or card)
//    buttons       whatever the pointer or the keyboard focus is on, in a panel or on the touch buttons
//    the screens   the title screen, making a character, the opening scroll, death, the ending
//    module cards  any card a later phase lays over the view (an element put straight into #game or the page)
//  A line a recorded voice already says is left to that voice.
//
//  Keys (every letter was taken): F3 or [ says the last thing again. F4 or ] reads everything on the screen now; in play,
//  with no panel open, it says where you are, how you are, the hour, and where the compass's quest markers lie
//  (js/compass97.js). F2 turns the reader on and off from anywhere (so somebody who cannot read the menu can be set up
//  in one key). Esc stops it talking.
//
//  It reads the page, not the game's tables: a MutationObserver watches #game and the page for new text and says what it
//  has not yet said in that panel. So a line added by any module, past or future, is read without that module knowing.
//  The French is read in French: the page's text is already translated when it is read, and the voice is chosen by the
//  game's language. Nothing here draws from chance, writes a flag or is saved in a game: the setting lives in
//  localStorage ('octave.reader.v1').
// ============================================================
'use strict';

const READER97 = (() => {
  const KEY = 'octave.reader.v1';
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const TX = {
    on: S('Reading aloud is on. F3 says the last thing again. F4 reads the whole screen. F2 turns reading off.'),
    off: S('Reading aloud is off.'),
    answers: S('You can answer:'),
    choices: S('You can choose:'),
    says: S('{0} says:'),
    nothing: S('Nothing to say again yet.'),
    where: S('You are in {0}.'),
    health: S('Health {0} of {1}.'),
    hour: S('It is {0}.'),
    facing: S('You are facing {0}.'),
    row: S('Read everything aloud'),
    rowHint: S('for a player who cannot read: F3 or [ says it again, F4 or ] reads the screen, F2 on or off'),
    titleBtnOn: S('Read aloud: On'),
    titleBtnOff: S('Read aloud: Off'),
    dirs: [S('north'), S('north-east'), S('east'), S('south-east'), S('south'), S('south-west'), S('west'), S('north-west')],
  };
  const st = { on: false, rate: 1, last: '', log: [], said: new Map(), hint: '', hintTimer: 0, scanTimer: 0, hoverTimer: 0, hoverEl: null, unlocked: false, dialogN: 0, dialogKey: '' };

  const has = () => typeof window !== 'undefined' && typeof window.speechSynthesis !== 'undefined' && typeof SpeechSynthesisUtterance !== 'undefined';
  function load() { try { const o = JSON.parse(localStorage.getItem(KEY) || 'null'); if (o && typeof o.on === 'boolean') st.on = o.on; if (o && Number.isFinite(o.rate)) st.rate = Math.max(0.6, Math.min(1.6, o.rate)); } catch (e) { /* no storage: the reader starts off */ } }
  function save() { try { localStorage.setItem(KEY, JSON.stringify({ on: st.on, rate: st.rate })); } catch (e) { /* no storage */ } }

  // ---------------------------------------------------------------- words
  const locale = () => { try { if (typeof STORY_I18N !== 'undefined' && STORY_I18N.locale) return String(STORY_I18N.locale); if (typeof ACCESS !== 'undefined' && ACCESS.locale) return String(ACCESS.locale); } catch (e) { /* English */ } return 'en'; };
  const tr = (s) => { try { if (typeof STORY_I18N !== 'undefined' && STORY_I18N.translate) { const o = STORY_I18N.translate(s); if (typeof o === 'string' && o) return o; if (o && typeof o.t === 'string') return o.t; } } catch (e) { /* English */ } return s; };
  const fill = (s, ...a) => tr(s).replace(/\{(\d)\}/g, (m, i) => a[+i] == null ? '' : a[+i]);
  const clean = (t) => String(t == null ? '' : t).replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s*[·•|]\s*/g, ', ').replace(/\s*[—–]\s*/g, ', ').replace(/\s+/g, ' ').replace(/^[\s,]+|[\s,]+$/g, '').trim();
  // an utterance much over 200 letters is cut short by some browsers: speak sentence by sentence
  function chunks(text) {
    const out = []; let cur = '';
    for (const s of text.split(/(?<=[.!?…;:])\s+/)) {
      const parts = s.length > 220 ? s.split(/(?<=,)\s+/) : [s];
      for (const p of parts) { if (!p) continue; if (cur && (cur.length + p.length + 1) > 200) { out.push(cur); cur = p; } else cur = cur ? cur + ' ' + p : p; }
    }
    if (cur) out.push(cur);
    return out;
  }
  function hashStr(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  let voiceFor = null, voiceLoc = '';
  function voice() {
    const loc = locale();
    if (voiceLoc === loc && voiceFor !== undefined && voiceFor !== null) return voiceFor;
    let v = null;
    try { const all = window.speechSynthesis.getVoices() || [], lang = loc.slice(0, 2).toLowerCase(), fit = all.filter((x) => String(x.lang || '').toLowerCase().startsWith(lang));
      v = fit.find((x) => /natural|neural|online/i.test(x.name)) || fit.find((x) => x.localService) || fit[0] || null; } catch (e) { v = null; }
    voiceFor = v; voiceLoc = loc; return v;
  }

  // ---------------------------------------------------------------- speaking
  // opts: { who (a speaker: gives the line a pitch of its own), flush (stop what is being said: the scene changed), kind }
  function say(text, opts) {
    opts = opts || {};
    const t = clean(text);
    if (!t) return false;
    const now = typeof performance !== 'undefined' ? performance.now() : Date.now();
    if (!opts.force && st.log.length) { const l = st.log[st.log.length - 1]; if (l.t === t && now - l.at < 1500) return false; }   // the same line twice in a breath
    st.log.push({ t, kind: opts.kind || 'line', who: opts.who || '', at: now }); if (st.log.length > 80) st.log.shift();
    if (opts.kind !== 'hover' && opts.kind !== 'again') st.last = t;
    if (!st.on || !has()) return false;
    try {
      if (opts.flush) window.speechSynthesis.cancel();
      const v = voice(), loc = locale(), pitch = opts.who ? 0.78 + hashStr(String(opts.who)) * 0.5 : 1;
      for (const c of chunks(t)) { const u = new SpeechSynthesisUtterance(c); u.lang = v && v.lang ? v.lang : (loc.length > 2 ? loc : loc === 'fr' ? 'fr-FR' : 'en-GB'); if (v) u.voice = v; u.rate = st.rate; u.pitch = pitch; u.volume = 1; window.speechSynthesis.speak(u); }
    } catch (e) { /* speech is optional: the game goes on */ }
    return true;
  }
  const recorded = (t) => { try { return typeof VOICE_ACT !== 'undefined' && VOICE_ACT.covers && typeof VOICES !== 'undefined' && VOICES.mode && /acted|spoken/.test(VOICES.mode()) && VOICE_ACT.covers(String(t)); } catch (e) { return false; } };
  function stop() { try { if (has()) window.speechSynthesis.cancel(); } catch (e) { /* nothing to stop */ } }
  function again() { if (st.last) say(st.last, { flush: true, force: true, kind: 'again' }); else say(tr(TX.nothing), { flush: true, force: true, kind: 'again' }); }
  function setOn(v, quiet) {
    st.on = !!v; save();
    if (st.on) { st.said.clear(); if (!quiet) say(tr(TX.on), { flush: true, force: true, kind: 'reader' }); schedule(350); }
    else { const was = st.on; st.on = true; if (!quiet) say(tr(TX.off), { flush: true, force: true, kind: 'reader' }); st.on = was; }
    syncButtons();
    return st.on;
  }

  // ---------------------------------------------------------------- reading the page
  const visible = (el) => { if (!el || !el.isConnected) return false; for (let n = el; n && n.nodeType === 1; n = n.parentElement) { if (n.hidden || n.classList.contains('hidden') || n.getAttribute('aria-hidden') === 'true') return false; const cs = getComputedStyle(n); if (cs.display === 'none' || cs.visibility === 'hidden') return false; } return true; };
  const SKIP_TAG = /^(BUTTON|A|SELECT|OPTION|INPUT|TEXTAREA|CANVAS|IMG|SVG|SCRIPT|STYLE|TABLE|UL|OL|LABEL|SMALL)$/;
  const ATOM_TAG = /^(H1|H2|H3|H4|H5|H6|P|BLOCKQUOTE|PRE|FIGCAPTION|DT|DD)$/;
  // the pieces of a panel that are read on their own: headings, paragraphs, a speaker's line, any leaf that holds words.
  // Buttons, lists and tables are not read out when a panel opens (a shop's forty rows): they are read under the pointer.
  function blocks(root, out) {
    out = out || [];
    for (const el of root.children) {
      if (SKIP_TAG.test(el.tagName) || el.classList.contains('you') || el.classList.contains('btns') || el.classList.contains('tone') || el.classList.contains('topics') || el.classList.contains('muted-skip')) continue;
      if (el.hidden || el.classList.contains('hidden')) continue;
      const kids = Array.from(el.children).filter((k) => !/^(B|I|EM|STRONG|SPAN|BR|SMALL|U|Q|CITE|A)$/.test(k.tagName));
      if (ATOM_TAG.test(el.tagName) || el.classList.contains('them') || !kids.length) { const t = clean(el.innerText != null ? el.innerText : el.textContent); if (t.length > 1) out.push({ el, t }); }
      else blocks(el, out);
    }
    return out;
  }
  const buttonsOf = (root) => Array.from(root.querySelectorAll('button')).filter((b) => visible(b) && !b.classList.contains('close') && clean(b.getAttribute('aria-label') || b.textContent));
  const labelOf = (el) => clean(el.getAttribute('aria-label') || el.innerText || el.textContent || el.getAttribute('title') || '');
  // the containers that hold lines. Each keeps the set of lines already said while it stays open.
  const FIXED = ['#title', '#create-panel', '#intro', '#modal-panel', '#event-panel', '#death', '#ending', '#lockhint', '#cover-status'];
  const NOT_CARD = /^(view|fx|msgs|hint|cover-status|lockhint|t-stick|touchui|title|create|intro|modal|event|death|ending|loading|debug|stage|game|rotate-hint)$/;
  function containers() {
    const out = [];
    for (const sel of FIXED) { const el = document.querySelector(sel); if (el) out.push(el); }
    // a card or overlay a later phase lays over the view
    for (const host of [document.getElementById('game'), document.body]) if (host) for (const el of host.children) { if (el.id && NOT_CARD.test(el.id)) continue; if (/^(SCRIPT|STYLE|CANVAS|LINK|NOSCRIPT)$/.test(el.tagName) || el.id === 'stage') continue; out.push(el); }
    return out;
  }
  function scan() {
    st.scanTimer = 0;
    if (!st.on) return;
    for (const el of containers()) {
      const vis = visible(el);
      if (!vis) { st.said.delete(el); if (el.id === 'modal-panel') { st.dialogKey = ''; st.dialogN = 0; } continue; }
      let said = st.said.get(el); const fresh = !said; if (fresh) { said = new Set(); st.said.set(el, said); }
      const isEvent = el.id === 'event-panel', isDialogue = el.id === 'modal-panel' && typeof G !== 'undefined' && G.openPanel === 'dialogue';
      if (el.id === 'modal-panel' && !isDialogue) { st.dialogKey = ''; st.dialogN = 0; }
      let spoke = false, first = true;
      if (isDialogue) { spoke = readDialogue(el, said); }
      else for (const b of blocks(el)) {
        if (said.has(b.t)) continue; said.add(b.t);
        say(b.t, { flush: first && (fresh || isEvent), kind: el.id === 'modal-panel' ? 'panel' : isEvent ? 'event' : 'screen' }); first = false; spoke = true;
      }
      // an event's choices, and the few buttons of a small card, are read out after its text
      if (spoke && (isEvent || (fresh && el.id !== 'modal-panel' && el.id !== 'create-panel'))) { const bs = buttonsOf(el); if (bs.length && bs.length <= 8) { if (isEvent) say(tr(TX.choices), { kind: 'event' }); bs.forEach((b, i) => say((bs.length > 1 ? (i + 1) + ': ' : '') + labelOf(b), { kind: 'choice' })); } }
    }
  }
  // a conversation: each new thing they say, in their own pitch; then the answers on offer
  function readDialogue(el, said) {
    const npc = (typeof DLG !== 'undefined' && DLG && DLG.npc) || null, name = npc ? clean(String(npc.name || '').split(',')[0]) : '';
    const lines = Array.from(el.querySelectorAll('#dlg-log > div'));
    const key = name + '|' + (npc ? npc.portrait || '' : '');
    if (key !== st.dialogKey) { st.dialogKey = key; st.dialogN = 0; }
    if (lines.length < st.dialogN) st.dialogN = 0;
    let spoke = false, first = true;
    for (let i = st.dialogN; i < lines.length; i++) {
      const d = lines[i]; if (!d.classList.contains('them')) continue;
      const t = clean(d.innerText != null ? d.innerText : d.textContent); if (!t) continue;
      if (recorded(t)) { st.log.push({ t, kind: 'recorded', who: name, at: performance.now() }); st.last = t; spoke = true; continue; }   // a recorded voice says this one
      say((first && name ? fill(TX.says, name) + ' ' : '') + t, { who: name, flush: first, kind: 'dialogue' }); first = false; spoke = true;
    }
    st.dialogN = lines.length;
    const wide = el.querySelector('#d-topics.wide');
    if (wide) { const bs = buttonsOf(wide), sig = 'answers:' + bs.map(labelOf).join('|'); if (bs.length && !said.has(sig)) { said.add(sig); say(tr(TX.answers), { kind: 'dialogue' }); bs.forEach((b, i) => say((i + 1) + ': ' + labelOf(b), { kind: 'choice' })); } }
    return spoke;
  }
  function schedule(ms) { if (st.scanTimer || !st.on) return; st.scanTimer = setTimeout(scan, ms == null ? 110 : ms); }

  // messages: every new line at the top of the view, in order
  function onMsgs(muts) { if (!st.on) return; for (const m of muts) for (const n of m.addedNodes) if (n.nodeType === 1) { const t = clean(n.textContent); if (t) say(t, { kind: 'msg' }); } }
  // what you face: said once it has stood for a moment, and not over something else being said
  function onHint() {
    if (!st.on) return;
    clearTimeout(st.hintTimer);
    let tries = 0;
    const go = () => { const el = document.getElementById('hint'), t = el ? clean(el.textContent) : ''; if (!t) { st.hint = ''; return; } if (t === st.hint) return;
      if (has() && window.speechSynthesis.speaking && tries++ < 8) { st.hintTimer = setTimeout(go, 500); return; }
      st.hint = t; say(t, { kind: 'hint' }); };
    st.hintTimer = setTimeout(go, 420);
  }
  // whatever the pointer or the focus is on
  function onPoint(ev) {
    if (!st.on) return;
    const el = ev.target && ev.target.closest ? ev.target.closest('button, a, [role="button"], option, li, td, th, label, summary, .item, .lm-key') : null;
    if (!el || el === st.hoverEl || !visible(el)) return;
    st.hoverEl = el; clearTimeout(st.hoverTimer);
    st.hoverTimer = setTimeout(() => { if (st.hoverEl !== el || !visible(el)) return; const t = labelOf(el); if (t) say(t + (el.title && clean(el.title) !== t ? '. ' + clean(el.title) : ''), { flush: true, kind: 'hover' }); }, 260);
  }
  function onLeave(ev) { if (ev.target === st.hoverEl) st.hoverEl = null; }

  // F4 or ]: everything on the screen, top to bottom; in play, where and how you are
  function readAll() {
    const open = containers().filter((el) => visible(el) && !/^(lockhint|cover-status)$/.test(el.id));
    const top = open.find((el) => el.id === 'event-panel') || open.find((el) => el.id === 'modal-panel') || open[open.length - 1];
    if (top) { const t = clean(top.innerText != null ? top.innerText : top.textContent); if (t) { say(t, { flush: true, force: true, kind: 'all' }); return 'panel'; } }
    say(status(), { flush: true, force: true, kind: 'status' });
    return 'status';
  }
  function status() {
    const out = [];
    try {
      if (typeof G === 'undefined' || !G.map || !G.player) return '';
      out.push(fill(TX.where, tr(G.map.name)));
      const p = G.player; if (Number.isFinite(p.hp) && Number.isFinite(p.hpMax)) out.push(fill(TX.health, Math.max(0, Math.round(p.hp)), Math.round(p.hpMax)));
      try { if (typeof timeName === 'function' && typeof DAYS !== 'undefined') out.push(fill(TX.hour, tr(DAYS[G.day % DAYS.length]) + ', ' + tr(timeName()))); } catch (e) { /* no clock */ }
      if (typeof Engine !== 'undefined' && Engine.cam) { let h = (Engine.cam.dir + Math.PI / 2) % (2 * Math.PI); if (h < 0) h += 2 * Math.PI; out.push(fill(TX.facing, tr(TX.dirs[Math.round(h / (Math.PI / 4)) % 8]))); }
      const hint = document.getElementById('hint'), ht = hint ? clean(hint.textContent) : ''; if (ht) out.push(/[.!?]$/.test(ht) ? ht : ht + '.');
      if (typeof COMPASS97 !== 'undefined' && COMPASS97.spoken) { const c = COMPASS97.spoken(); if (c) out.push(c); }
    } catch (e) { /* say what we have */ }
    return out.join(' ');
  }

  // ---------------------------------------------------------------- the switches
  function syncButtons() { const b = document.getElementById('btn-read'); if (b) b.textContent = tr(st.on ? TX.titleBtnOn : TX.titleBtnOff); const a = document.getElementById('ac-read'); if (a) a.textContent = st.on ? 'On' : 'Off'; }
  function addTitleButton() {
    const title = document.getElementById('title'); if (!title || document.getElementById('btn-read')) return;
    // in the corner, not in the row: the title's row of buttons is full at six
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'btn-read'; b.style.cssText = 'position:absolute;top:2cqh;right:2cqw;z-index:3'; b.onclick = () => setOn(!st.on); title.appendChild(b); syncButtons();
  }
  function addMenuRow() {                                        // Options > Difficulty, Visuals & Accessibility
    const tts = document.getElementById('ac-tts'); if (!tts || document.getElementById('ac-read')) return;
    const lab = document.createElement('span'); lab.textContent = tr(TX.row) + ' '; const sm = document.createElement('small'); sm.className = 'muted'; sm.textContent = tr(TX.rowHint); lab.appendChild(sm);
    const b = document.createElement('button'); b.className = 'dfbtn small'; b.id = 'ac-read'; b.onclick = () => { setOn(!st.on); };
    const grid = tts.parentNode, first = grid.firstElementChild; grid.insertBefore(b, first); grid.insertBefore(lab, b); syncButtons();
  }
  function onKey(ev) {
    if (ev.repeat || ev.ctrlKey || ev.metaKey || ev.altKey) return;
    if (ev.target && (ev.target.tagName === 'INPUT' || ev.target.tagName === 'TEXTAREA')) return;
    if (ev.code === 'F2') { ev.preventDefault(); setOn(!st.on); return; }
    if (!st.on) return;
    if (ev.code === 'F3' || ev.code === 'BracketLeft') { ev.preventDefault(); again(); return; }
    if (ev.code === 'F4' || ev.code === 'BracketRight') { ev.preventDefault(); readAll(); return; }
    if (ev.code === 'Escape') stop();
  }

  function init() {
    if (typeof document === 'undefined') return;
    load();
    addTitleButton();
    const game = document.getElementById('game') || document.body;
    try {
      new MutationObserver(() => { addMenuRow(); schedule(); }).observe(game, { childList: true, subtree: true, characterData: true, attributes: true, attributeFilter: ['class', 'hidden'] });
      if (document.body !== game) new MutationObserver(() => schedule()).observe(document.body, { childList: true });
      const msgs = document.getElementById('msgs'); if (msgs) new MutationObserver(onMsgs).observe(msgs, { childList: true });
      const hint = document.getElementById('hint'); if (hint) new MutationObserver(onHint).observe(hint, { childList: true, characterData: true, subtree: true });
    } catch (e) { /* no observers: the keys still work */ }
    document.addEventListener('mouseover', onPoint, true); document.addEventListener('focusin', onPoint, true); document.addEventListener('mouseout', onLeave, true);
    window.addEventListener('keydown', onKey, true);
    // a browser will not speak before the first touch or key: read the screen that is up as soon as there has been one
    const unlock = () => { if (st.unlocked) return; st.unlocked = true; if (st.on) { st.said.clear(); schedule(60); } };
    window.addEventListener('pointerdown', unlock, true); window.addEventListener('keydown', unlock, true);
    try { if (has() && window.speechSynthesis.addEventListener) window.speechSynthesis.addEventListener('voiceschanged', () => { voiceFor = null; voiceLoc = ''; }); } catch (e) { /* the first voice will do */ }
    // the older "read the last line of a conversation" (js/voices.js) would say a line twice: the reader has it
    if (typeof window.speakLine === 'function') { const _sl = window.speakLine; window.speakLine = function () { if (st.on) return undefined; return _sl.apply(this, arguments); }; }
  }
  if (typeof document !== 'undefined') { if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init); else init(); }

  return { TEXTS, TX, say, again, readAll, status, stop, scan, setOn, on: () => st.on, log: () => st.log.slice(), last: () => st.last, chunks, clean, blocks, _st: st };
})();
if (typeof window !== 'undefined') window.READER97 = READER97;
if (typeof module !== 'undefined' && module.exports) module.exports = READER97;
