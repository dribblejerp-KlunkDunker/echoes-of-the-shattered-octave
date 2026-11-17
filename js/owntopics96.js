// ============================================================
//  owntopics96 — a person's own subjects get their own buttons (Phase 96).
//
//  "Tell me about…" listed only the game's shared subjects (TOPIC_KEYS). A person whose NPCS entry has subjects of its own
//  (Brenna Corliss on the Wired, Bardo on the nineteen, Perpetua Lisle on the robes) could answer them (askTopic reads
//  n.topics[t]) but nobody could ask: there was no button. Found by a builder of Phase 96. This adds the missing buttons, the
//  person's own subjects first, and touches nothing else. TOPIC_KEYS is left alone (the rumours test counts it).
// ============================================================
'use strict';

const OWNTOPICS96 = (function () {
  let warned = false;
  function own(n) {
    if (!n || !n.topics || typeof TOPIC_KEYS === 'undefined') return [];
    return Object.keys(n.topics).filter((t) => !TOPIC_KEYS.includes(t));
  }
  function add(mode) {
    if (mode !== 'tell' || typeof DLG === 'undefined' || typeof document === 'undefined') return 0;
    const box = document.getElementById('d-topics'); if (!box) return 0;
    const shown = new Set(Array.from(box.querySelectorAll('button')).map((b) => b.getAttribute('data-topic') || b.textContent));
    const first = box.firstChild; let n = 0;
    for (const t of own(DLG.npc)) {
      if (shown.has(t)) continue;
      const b = document.createElement('button'); b.className = 'dfbtn small'; b.setAttribute('data-topic', t); b.setAttribute('data-own', '1'); b.textContent = t;
      b.onclick = () => { askTopic(t); renderDialogue('tell'); };
      box.insertBefore(b, first); n++;
    }
    return n;
  }
  if (typeof renderDialogue === 'function') {
    const _rd = renderDialogue;
    renderDialogue = function (mode) {
      const r = _rd.apply(this, arguments);
      try { add(mode); } catch (e) { if (!warned) { warned = true; console.warn('owntopics96 failed', e); } }
      return r;
    };
  }
  return { own, add };
})();
if (typeof window !== 'undefined') window.OWNTOPICS96 = OWNTOPICS96;
