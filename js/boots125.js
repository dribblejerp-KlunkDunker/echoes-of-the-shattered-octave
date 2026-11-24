// ============================================================================
//  boots125 — Phase 125b: in their boots.
//
//  Six moments of Book One are played in the hero's own boots: Kaelen at the needle and the eight bolts, Lyra at the Hold
//  and the coda, Vane at One to Ten, Sable at the three names. In a hero's boots the player can do only what the hero did,
//  well or badly. A slip is the grey Echo (RITE43.echo): its card says "That is not how it went." and the book's own line,
//  "Again" starts the beat over, and after two slips on one beat it plays itself. A slip never changes what happens.
//  The captions are the book's narration, verbatim, past tense, third person (CAPS, each with its manuscript lines).
//
//  Also here: the flags p125b_* (validated on every load), the old-save migration of the traveller-sings coda (ruling b),
//  the calling lines (ruling g, unvoiced), and the hero's own hands behind GFX.heroHands ("Hands in a hero's boots").
//  Design: story/Game Layer/Phase 125b - In their boots (design, for the builder).md. Record: Phase 125b - In their boots.md.
//  No random numbers here (hashed noise only). Loaded after js/faces124.js and before js/mast123.js, which stays the last script.
// ============================================================================
'use strict';

const BOOTS125 = (function () {
  const TEXTS = [];
  const S_ = (t) => { TEXTS.push(t); return t; };
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags;
  const F = () => G.flags;
  const warned = {};
  const warnOnce = (k, e) => { if (warned[k]) return; warned[k] = 1; try { console.warn('boots125: ' + k + ' failed', e); } catch (x) { /* none */ } };

  // ---------------------------------------------------------------- the flags (small ints, validated on every load)
  const FLAGS = { p125b_seen: 63, p125b_slips: 99, p125b_at: 6, p125b_m: 1, p125b_cv: 1 };
  function validate(f) {
    for (const k in FLAGS) { const v = f[k]; if (!(typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= FLAGS[k])) f[k] = 0; }
  }

  // ---------------------------------------------------------------- the old saves (ruling b, design 4b and 5.5)
  // The traveller no longer sings the coda (coda_by_you), strikes the ring's Wearer (ring_struck 'you') or says Kaelen's
  // "No." in the moss (ring_sat_no, ring_sat_kind). A finished coda reads the book's way; an unfinished one starts again.
  function migrateCoda(f) {
    const reset = (keep) => { try { if (typeof ringReset === 'function') ringReset(keep); } catch (e) { warnOnce('ring reset', e); } };
    if (f.coda_by_you && f.coda_done) {   // the book's order (MS 5930-5970): Kaelen told her, and her voice came back
      delete f.coda_by_you;
      if (!f.lyra_voice) f.lyra_voice = true;
      if (!f.kaelen_dw_done) f.kaelen_dw_done = true;
      if (!f.kaelen_told_now) f.kaelen_told_now = true;
      f.p125b_cv = 1;
    } else if (f.coda_by_you) {   // mid-ring, or the lamps set for the traveller: Lyra is at the fire again, and needs her voice
      delete f.coda_by_you;
      reset(false);
    }
    if (f.ring_struck === 'you' && f.coda_done) f.ring_struck = 'kaelen';
    delete f.ring_sat_no; delete f.ring_sat_kind;
  }
  function onRestore() {
    if (!hasG()) return;
    const f = F();
    validate(f);
    if (!f.p125b_m) migrateCoda(f);
    if (f.ring_fight && !f.coda_done) { try { if (typeof ringReset === 'function') ringReset(true); } catch (e) { warnOnce('ring reset', e); } }   // the boots start again at the ring trigger
    f.p125b_m = 1;
  }

  // ---------------------------------------------------------------- the moments (filled in by Phase 125b part 4)
  const MOMENTS = { needle: 1, hold: 2, bolts: 3, rope: 4, names: 5, coda: 6 };
  const S = { at: null, beat: null, home: null, clock: 0, log: [] };
  const can = () => false;
  const active = () => S.at;
  function reset() { S.at = null; S.beat = null; S.home = null; }
  const enter = () => false, exit = () => {}, input = () => {}, callingLines = () => null, voiceIds = () => [];
  const CAPS = {}, stats = { props: 0 };

  // ---------------------------------------------------------------- the wiring
  function wire() {
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () {
        try { reset(); } catch (e) { warnOnce('reset', e); }
        const r = _rg.apply(this, arguments);
        try { onRestore(); } catch (e) { warnOnce('restore', e); }
        return r;
      };
    }
    if (typeof snapshotGame === 'function') {
      const _s = snapshotGame;
      snapshotGame = function () {
        try { if (hasG()) G.flags.p125b_m = 1; } catch (e) { /* none */ }
        return _s.apply(this, arguments);
      };
    }
  }
  try { wire(); } catch (e) { console.warn('boots125 failed to wire', e); }

  return { TEXTS, CAPS, FLAGS, MOMENTS, S, stats, can, active, enter, exit, input, reset, callingLines, voiceIds, validate, migrateCoda };
})();
if (typeof window !== 'undefined') window.BOOTS125 = BOOTS125;
