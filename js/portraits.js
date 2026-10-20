// ============================================================
//  portraits — Phase 5 (illustrated interface): conversation mood portraits.
//  Kaelen, Lyra and the NPCs who carry the story get four extra faces each:
//  angry, sad, afraid and wry. They are a PROCEDURAL STAND-IN: each is the
//  existing img/p_<id>.jpg regraded and lightly warped on a canvas (colour grade,
//  contrast, framing tilt/shear, brow and mouth shading, vignette). The faces differ
//  per portrait and we never guess feature coordinates, so every edit is global or
//  a very soft wide gradient in the upper face band. Final painted art can replace
//  the data URLs without touching the selection logic.
//
//  Which face shows is chosen, per displayed line, by pick(): a pure function of
//  (1) a hand-written phrase table matched against the NPC's visible line,
//  (2) the Blunt tone on an opening line (angry or wry, by a stable hash),
//  (3) a few flags READ for the opening line only. It never calls n.quest() (that
//  mutates flags), never writes G or DLG, and returns null for "keep the neutral
//  portrait". Variants are cached as data URLs and built once, in idle time.
//
//  Security: the only markup touched is the existing <img>'s src/alt. Both come from
//  this file's own constant tables and canvas data URLs; save text is only ever
//  tested with regular expressions, never inserted. Portrait ids are looked up in
//  MAJOR (own-property check), so a hostile id falls back to the original image.
//  GFX.moodPortraits = false leaves the dialogue DOM exactly as game.js built it.
// ============================================================
'use strict';

if (typeof GFX !== 'undefined') {
  if (GFX.moodPortraits === undefined) GFX.moodPortraits = true; // mood faces in conversations
}

const PORTRAITS = (function () {
  const MOODS = ['angry', 'sad', 'afraid', 'wry'];
  const SIZE = 96; // the source portraits are 96x96

  // Story weight, checked against js/data.js: every id below owns a quest hook or a
  // topic set in NPCS (quest givers and companions first, then the town's recurring
  // voices). Townsfolk, the Aegis construct and the Hollow stay neutral.
  const MAJOR = {
    kaelen: 'Kaelen', lyra: 'Lyra', vane: 'Vane', hetty: 'Hetty', sable: 'Sable',
    aldric: 'Aldric', halder: 'Halder', harrow: 'Harrow', rooke: 'Rooke', vosk: 'Vosk',
    tobiah: 'Tobiah', mags: 'Mags', quist: 'Quist', flambeau: 'Flambeau', orla: 'Orla',
    pim: 'Pim', wren: 'Wren', herald: 'The Synod herald', tam: 'Tam', nell: 'Nell',
  };
  const has = (o, k) => Object.prototype.hasOwnProperty.call(o, k);

  // ---------------------------------------------------------------- selection
  // Scored per mood; the highest wins, ties go to the earlier mood here.
  const PHRASES = [
    ['afraid', /\b(frightened|afraid|terrified|fear(?:ful)?|gods|learn from every sound|I can hear|do not answer|run toward|screaming|shaking|please)\b/i],
    ['angry', /\b(put you out|get out|lower your voice|ask me again|that tone|nothing to say to that|how dare|damn|fool|liar|traitor|never again|curse you|bastard)\b|^No\.$/i],
    ['sad', /\b(Davin|grief|mourn|wept|weep|buried|funeral|forgive|too late|alone|never came back|I miss|gone now|dead|died)\b/i],
    ['wry', /\b(Ha[!,.]|Hm\.|of course|clever|as it happens|retired from the sea|for what it'?s worth|funny|laugh|I know what that sounds like|rather not discuss|skill\.)/i],
  ];
  // Opening-line state, from flags that already exist in saves. '!x' means "flag x unset".
  const FLAG_MOODS = {
    lyra: [[['coil_done'], 'afraid']],
    kaelen: [[['coil_done'], 'sad']],
    vane: [[['vane_told'], 'sad']],
    hetty: [[['hetty_paid'], 'sad'], [['hetty_crates', '!hetty_paid'], 'afraid']],
    tam: [[['tam_left'], 'sad']],
  };

  function hash(s) { let h = 5381; for (let i = 0; i < s.length; i++) h = ((h << 5) + h + s.charCodeAt(i)) | 0; return h >>> 0; }
  function lastThem(log) {
    if (!Array.isArray(log)) return null;
    for (let i = log.length - 1; i >= 0; i--) if (log[i] && log[i].who === 'them' && typeof log[i].t === 'string') return log[i].t;
    return null;
  }
  function flagsMatch(flags, conds) {
    return conds.every(c => c[0] === '!' ? !flags[c.slice(1)] : !!flags[c]);
  }

  // Pure and side-effect free: reads its arguments only (defaults come from DLG / G).
  function pick(npc, opts) {
    try {
      if (!npc || typeof npc.portrait !== 'string' || !has(MAJOR, npc.portrait)) return null;
      const o = opts || {};
      const log = o.log !== undefined ? o.log : (typeof DLG !== 'undefined' ? DLG.log : []);
      const tone = o.tone !== undefined ? o.tone : (typeof DLG !== 'undefined' ? DLG.tone : 'normal');
      const flags = o.flags !== undefined ? o.flags : (typeof G !== 'undefined' && G.flags ? G.flags : {});
      const line = lastThem(log);
      if (line === null) return null;
      let best = null, bestScore = 0;
      for (const [mood, re] of PHRASES) {
        const m = line.match(new RegExp(re.source, re.flags + 'g'));
        if (m && m.length > bestScore) { best = mood; bestScore = m.length; }
      }
      if (best) return best;
      const opening = Array.isArray(log) && log.length === 1;
      if (tone === 'blunt' && opening && npc.greet && line === npc.greet.blunt) {
        return hash(npc.portrait + '|' + line) % 2 ? 'wry' : 'angry';
      }
      if (opening && has(FLAG_MOODS, npc.portrait)) {
        for (const [conds, mood] of FLAG_MOODS[npc.portrait]) if (flagsMatch(flags, conds)) return mood;
      }
      return null;
    } catch (e) { return null; }
  }

  // ---------------------------------------------------------------- generation
  // Colour grade: saturation, contrast, brightness, per-channel multiply and lift.
  const GRADE = {
    angry:  { sat: 1.15, con: 1.3,  bri: 0.97, mul: [1.16, 0.92, 0.84], add: [10, -4, -8] },
    sad:    { sat: 0.62, con: 0.88, bri: 0.86, mul: [0.84, 0.95, 1.22], add: [-6, 0, 12] },
    afraid: { sat: 0.32, con: 0.96, bri: 1.1,  mul: [1.02, 1.08, 1.04], add: [24, 28, 26] },
    wry:    { sat: 1.1,  con: 1.1,  bri: 1.0,  mul: [1.09, 1.02, 0.9],  add: [9, 3, -5] },
  };
  // Framing: pivot at the face (upper third); rotation in radians, shear in x, shift in px.
  const FRAME = {
    angry:  { rot: -0.03, shear: 0,     scale: 1.1,  dx: 0,  dy: 3 },   // leans in
    sad:    { rot: 0.045, shear: 0,     scale: 1.06, dx: 1,  dy: 4 },   // head drops
    afraid: { rot: -0.015, shear: 0,    scale: 0.95, dx: -3, dy: -2 },  // recoils
    wry:    { rot: -0.04, shear: -0.07, scale: 1.06, dx: 2,  dy: 0 },   // cocked, lopsided
  };

  function blurred(ctx, px, fn) {
    ctx.save();
    if ('filter' in ctx) ctx.filter = 'blur(' + px + 'px)';
    fn(); ctx.restore();
  }
  function ellipse(ctx, x, y, rx, ry, rot, fill) {
    ctx.fillStyle = fill; ctx.beginPath(); ctx.ellipse(x * SIZE, y * SIZE, rx * SIZE, ry * SIZE, rot, 0, Math.PI * 2); ctx.fill();
  }
  function vignette(ctx, strength, tint) {
    const g = ctx.createRadialGradient(SIZE / 2, SIZE * 0.3, SIZE * 0.22, SIZE / 2, SIZE * 0.4, SIZE * 0.78);
    g.addColorStop(0, 'rgba(' + tint + ',0)'); g.addColorStop(1, 'rgba(' + tint + ',' + strength + ')');
    ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
  }
  // Shading that reads as expression without knowing where the eyes are: the face sits in
  // the upper band of these bust portraits, so everything is soft and wide.
  const SHADE = {
    angry(ctx) { // heavy, inward-slanting brow shadow
      blurred(ctx, 3, () => {
        ctx.fillStyle = 'rgba(12,0,0,0.5)';
        ctx.beginPath(); ctx.moveTo(SIZE * 0.26, SIZE * 0.15); ctx.lineTo(SIZE * 0.5, SIZE * 0.25); ctx.lineTo(SIZE * 0.5, SIZE * 0.17); ctx.lineTo(SIZE * 0.3, SIZE * 0.12); ctx.fill();
        ctx.beginPath(); ctx.moveTo(SIZE * 0.74, SIZE * 0.15); ctx.lineTo(SIZE * 0.5, SIZE * 0.25); ctx.lineTo(SIZE * 0.5, SIZE * 0.17); ctx.lineTo(SIZE * 0.7, SIZE * 0.12); ctx.fill();
        ellipse(ctx, 0.5, 0.2, 0.3, 0.05, 0, 'rgba(10,0,0,0.3)');
      });
      vignette(ctx, 0.5, '30,0,0');
    },
    sad(ctx) { // brows lifted at the middle, shadow under the eyes, a drooping dark base
      blurred(ctx, 4, () => {
        ellipse(ctx, 0.5, 0.11, 0.2, 0.05, 0, 'rgba(210,225,255,0.22)');
        ellipse(ctx, 0.5, 0.29, 0.22, 0.03, 0, 'rgba(10,20,50,0.28)');
      });
      const g = ctx.createLinearGradient(0, SIZE * 0.55, 0, SIZE);
      g.addColorStop(0, 'rgba(8,12,28,0)'); g.addColorStop(1, 'rgba(8,12,28,0.5)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
    },
    afraid(ctx) { // eye-line catches the light, hard dark vignette
      blurred(ctx, 2.5, () => ellipse(ctx, 0.5, 0.235, 0.27, 0.035, 0, 'rgba(255,255,255,0.2)'));
      vignette(ctx, 0.72, '4,8,18');
    },
    wry(ctx) { // light from one side, one raised cheek and a crease at the corner of the mouth
      const g = ctx.createLinearGradient(0, 0, SIZE, 0);
      g.addColorStop(0, 'rgba(25,10,0,0.34)'); g.addColorStop(0.55, 'rgba(25,10,0,0)'); g.addColorStop(1, 'rgba(255,200,130,0.1)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, SIZE, SIZE);
      blurred(ctx, 2.5, () => {
        ellipse(ctx, 0.62, 0.3, 0.07, 0.035, -0.4, 'rgba(255,215,160,0.22)');
        ellipse(ctx, 0.6, 0.355, 0.045, 0.012, -0.5, 'rgba(25,8,0,0.4)');
        ellipse(ctx, 0.4, 0.34, 0.06, 0.02, 0.2, 'rgba(25,8,0,0.15)');
      });
    },
  };

  function render(img, mood) {
    const c = document.createElement('canvas'); c.width = c.height = SIZE;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    const f = FRAME[mood], gr = GRADE[mood];
    ctx.fillStyle = '#150e0f'; ctx.fillRect(0, 0, SIZE, SIZE); // the portraits' own dark ground
    ctx.save();
    ctx.translate(SIZE / 2, SIZE * 0.3);
    ctx.transform(1, 0, f.shear, 1, 0, 0);
    ctx.rotate(f.rot); ctx.scale(f.scale, f.scale);
    ctx.translate(-SIZE / 2 + f.dx, -SIZE * 0.3 + f.dy);
    ctx.drawImage(img, 0, 0, SIZE, SIZE);
    ctx.restore();
    const d = ctx.getImageData(0, 0, SIZE, SIZE), p = d.data; // throws if the canvas is tainted (file://): caller falls back
    for (let i = 0; i < p.length; i += 4) {
      const lum = 0.3 * p[i] + 0.59 * p[i + 1] + 0.11 * p[i + 2];
      for (let k = 0; k < 3; k++) {
        let v = lum + (p[i + k] - lum) * gr.sat;
        v = ((v - 128) * gr.con + 128) * gr.bri * gr.mul[k] + gr.add[k];
        p[i + k] = v < 0 ? 0 : v > 255 ? 255 : v;
      }
    }
    ctx.putImageData(d, 0, 0);
    SHADE[mood](ctx);
    return c.toDataURL('image/jpeg', 0.9);
  }

  const cache = {};   // id -> { mood: dataURL }
  const pending = {}; // id -> Promise
  function ensure(id) {
    if (!has(MAJOR, id)) return Promise.resolve(null);
    if (cache[id]) return Promise.resolve(cache[id]);
    if (pending[id]) return pending[id];
    pending[id] = new Promise(resolve => {
      const img = new Image();
      img.onload = () => {
        try { const out = {}; for (const m of MOODS) out[m] = render(img, m); cache[id] = out; resolve(out); }
        catch (e) { console.warn('portraits: could not build ' + id, e); resolve(null); }
      };
      img.onerror = () => resolve(null);
      img.src = 'img/p_' + id + '.jpg';
    });
    return pending[id];
  }
  // Synchronous: the cached data URL, or null while it is still being built or unknown.
  function variant(id, mood) {
    return has(MAJOR, id) && MOODS.includes(mood) && cache[id] ? cache[id][mood] : null;
  }
  const ready = ids => Promise.all((ids || Object.keys(MAJOR)).map(ensure)).then(() => true);
  const label = (id, mood) => has(MAJOR, id) ? MAJOR[id] + ', ' + mood : '';

  // ---------------------------------------------------------------- dialogue hook
  function apply() {
    if (typeof GFX === 'undefined' || !GFX.moodPortraits || typeof DLG === 'undefined' || !DLG.npc) return null;
    const img = document.querySelector('#modal-panel .dlg .port img');
    if (!img) return null;
    const n = DLG.npc, mood = pick(n);
    if (!mood) return null;
    const id = n.portrait;
    const swap = () => {
      const url = variant(id, mood);
      if (!url || !img.isConnected || img.dataset.mood === mood) return;
      img.src = url; img.alt = label(id, mood); img.dataset.mood = mood;
      if (!GFX.reduceMotion) { img.classList.remove('pt-swap'); void img.offsetWidth; img.classList.add('pt-swap'); }
    };
    if (variant(id, mood)) swap(); else ensure(id).then(() => { if (GFX.moodPortraits) swap(); });
    return mood;
  }

  if (typeof renderDialogue === 'function') {
    const _renderDialogue = renderDialogue;
    renderDialogue = function () {
      const r = _renderDialogue.apply(this, arguments);
      try { apply(); } catch (e) { console.warn('portraits:', e); }
      return r;
    };
  }

  if (typeof document !== 'undefined') {
    const st = document.createElement('style'); st.id = 'portraits-style';
    // A short settle when the face changes; skipped entirely under reduced motion (checked at swap time).
    st.textContent = '@keyframes pt-settle { from { opacity: .55; } to { opacity: 1; } } .dlg .port img.pt-swap { animation: pt-settle .3s ease-out; }';
    document.head.appendChild(st);
    // Warm the cache one portrait per idle slot so the first mood change is instant.
    const ids = Object.keys(MAJOR);
    const next = () => { const id = ids.shift(); if (!id) return; ensure(id).then(() => setTimeout(next, 30)); };
    setTimeout(next, 800);
  }

  return { MOODS, MAJOR, pick, variant, ensure, ready, label, apply, has: id => has(MAJOR, id) };
})();
