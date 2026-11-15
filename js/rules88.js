// ============================================================
//  rules88 — Phase 88 (part one): three rules the owner asked for on 14 Nov, after reading Phase 87's record:
//  "blocking should cost fatigue, there needs to be fall damage, enemies should follow."
//
//    blocking   a blow you block costs fatigue (a parry costs a little, a full block more, more for a heavier blow); with
//               no fatigue left you cannot raise your guard. The Synod Arsenal in full: blocks with the kite shield cost
//               none (that set's own bonus, as first designed).
//    falls      the game already hurts you for a drop of more than 0.9 (js/engine.js FALL_SAFE). The Free Captains in
//               full: the first ship's height of any drop (2.5) costs nothing (that set's own bonus, as first designed).
//    following  an enemy that is chasing you and close when you go through a door follows you through it, a moment
//               later, by the door you came in at; not bosses, nothing that cannot walk, at most four. The Barrow-
//               Wardens in full: woolwights and the barrow's dead do not follow you past its door.
//
//  All numbers are [PROPOSED]. Nothing here uses random numbers; nothing is saved but the player's fatigue and health.
// ============================================================
'use strict';

const RULES88 = (function () {
  const TEXTS = [], S = (t) => { TEXTS.push(t); return t; };
  const warned = {}, warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; if (typeof console !== 'undefined') console.warn('rules88: ' + k, e); } };
  const TX = {
    winded: S('Too winded to raise your guard.'),
    blockTired: S('The block takes it out of you.'),
    followed: S('Something came through the door behind you.'),
    followedN: S('{0} of them came through the door behind you.'),
  };
  const B = {
    PARRY: 1,                 // fatigue a parry costs
    BLOCK: 3,                 // fatigue a full block costs, plus a quarter of the blow
    BLOCK_PER: 0.25,
    SHIP: 2.5,                // the Free Captains' full set: this much of any drop is free
    FOLLOW_R: 9,              // how close a chasing enemy must be to follow you through
    FOLLOW_MAX: 4,
    FOLLOW_DELAY: 1.2,        // seconds before the first comes through; then by distance and speed
  };
  const special = (n) => { try { return typeof GEAR87 === 'object' && GEAR87.special(n); } catch (e) { return false; } };

  // ---------------------------------------------------------------- blocking costs fatigue
  function wireBlocks() {
    if (typeof triggerBlock === 'function') {
      const _tb = triggerBlock;
      triggerBlock = function () {
        try {
          const p = G.player;
          if (p && G.state === 'play' && !G.dead && !(p.fat >= 1) && !(typeof UPG !== 'undefined' && UPG.parryCool > 0)) { msg(TX.winded, 'bad', 1600); return undefined; }
        } catch (e) { warnOnce('guard', e); }
        return _tb.apply(this, arguments);
      };
    }
    if (typeof damagePlayer === 'function') {
      const _dp = damagePlayer;
      damagePlayer = function (dmg) {
        const gs = typeof GUARD !== 'undefined' ? GUARD.state : null, b0 = gs ? gs.blocked : 0, q0 = gs ? gs.parried : 0;
        const r = _dp.apply(this, arguments);
        try {
          const p = G.player; if (!gs || !p) return r;
          const kite = p.armor && p.armor.shield === 'a_kite' && special('kiteblock');
          let cost = 0;
          if (gs.parried > q0) cost = B.PARRY;
          else if (gs.blocked > b0) cost = B.BLOCK + Math.round((Number(dmg) || 0) * B.BLOCK_PER);
          if (cost && !kite) { const was = p.fat; p.fat = Math.max(0, (p.fat || 0) - cost); if (was >= 1 && p.fat < 1) msg(TX.blockTired, 'bad', 1800); }
        } catch (e) { warnOnce('block', e); }
        return r;
      };
    }
  }

  // ---------------------------------------------------------------- falls: the Free Captains land a ship's height free
  let deckFrom = null;
  function wireFalls() {
    if (typeof update !== 'function') return;
    const _u = update;
    update = function () {
      const p = G.player;
      try {
        if (p && p.fallFrom != null && special('deck')) {
          if (deckFrom == null) deckFrom = p.fallFrom;
          p.fallFrom = deckFrom - B.SHIP;   // the drop is measured from a ship's height lower down
        } else if (!p || p.fallFrom == null) deckFrom = null;
      } catch (e) { warnOnce('fall', e); }
      const r = _u.apply(this, arguments);
      if (p && p.fallFrom == null) deckFrom = null;   // landed
      return r;
    };
  }

  // ---------------------------------------------------------------- enemies follow you through doors
  // who can follow: walking enemies, not bosses or keepers, not the stationary ones (horns), not ones tied to a place
  function canFollow(e) {
    const d = e && e.def; if (!d) return false;
    if (e.kind !== 'enemy' || e.dead || e.hidden || e.passive) return false;
    if (e.state !== 'chase') return false;
    if (d.boss || d.wildsBoss || d.coda || d.horn || d.keeper || !(d.speed > 0)) return false;
    if (e.requires || e.until || e.noFollow || d.noFollow) return false;
    if (/^p22_/.test(e.type || '') && special('wight')) return false;   // the Barrow-Wardens in full: the barrow's dead stay
    return true;
  }
  const pending = [];   // { type, name, hp, at, x, y, map }
  function wireFollow() {
    if (typeof transfer !== 'function') return;
    const _tr = transfer;
    transfer = function (portal) {
      const from = G.mapId, c = Engine.cam, cx = c.x, cy = c.y, list = [];
      try {
        for (const e of G.ents || []) {
          if (!canFollow(e)) continue;
          const d = Math.hypot(e.x - cx, e.y - cy); if (d > B.FOLLOW_R) continue;
          list.push({ e, d });
        }
        list.sort((a, b) => a.d - b.d);
      } catch (e) { warnOnce('follow', e); }
      const r = _tr.apply(this, arguments);
      try {
        if (G.mapId !== from && list.length) {
          pending.length = 0;
          const at = { x: Engine.cam.x, y: Engine.cam.y, dir: Engine.cam.dir };
          list.slice(0, B.FOLLOW_MAX).forEach(({ e, d }, i) => {
            pending.push({ type: e.type, name: e.name || null, hp: e.hp, map: G.mapId, x: at.x, y: at.y, dir: at.dir, t: B.FOLLOW_DELAY + d / Math.max(0.6, e.def.speed) * 0.6 + i * 0.5 });
            // it has gone through the door after you: it is not waiting on the other side any more
            e.hidden = true; e.followedOut = true; e.state = 'idle';
          });
        }
      } catch (e) { warnOnce('follow out', e); }
      return r;
    };
    if (typeof update === 'function') {
      const _u = update;
      update = function (dt) {
        const r = _u.apply(this, arguments);
        try { if (pending.length && G.state === 'play' && dt > 0) tickFollow(dt); } catch (e) { warnOnce('follow in', e); }
        return r;
      };
    }
    if (typeof loadMap === 'function') {   // any other way out (travel, a cutscene) leaves them behind
      const _lm = loadMap;
      loadMap = function (id) { const r = _lm.apply(this, arguments); try { for (let i = pending.length - 1; i >= 0; i--) if (pending[i].map !== id) pending.splice(i, 1); } catch (e) { /* */ } return r; };
    }
  }
  function placeNear(f) {
    // just inside the door, behind where you came in, on open floor
    const back = f.dir + Math.PI;
    for (const [r, a] of [[0.9, 0], [1.2, 0.5], [1.2, -0.5], [0.6, 0.9], [0.6, -0.9], [0, 0]]) {
      const x = f.x + Math.cos(back + a) * r, y = f.y + Math.sin(back + a) * r;
      if (x < 1 || y < 1 || x >= G.map.w - 1 || y >= G.map.h - 1) continue;
      if (typeof solidAt === 'function' && solidAt(x, y)) continue;
      return { x, y };
    }
    return { x: f.x, y: f.y };
  }
  let lastCome = 0;
  function tickFollow(dt) {
    let came = 0;
    for (let i = pending.length - 1; i >= 0; i--) {
      const f = pending[i]; if (f.map !== G.mapId) { pending.splice(i, 1); continue; }
      f.t -= dt; if (f.t > 0) continue;
      pending.splice(i, 1);
      if (typeof ENEMIES === 'undefined' || !ENEMIES[f.type] || typeof hydrate !== 'function') continue;
      const q = placeNear(f);
      // a named core keeps its name; one without (never, in practice) gets one from the pool by place, not by chance
      let name = f.name; if (!name && ENEMIES[f.type].core && typeof NAMES_POOL !== 'undefined' && NAMES_POOL.length) name = NAMES_POOL[(f.type.length * 7 + Math.floor(q.x * 13) + Math.floor(q.y * 5)) % NAMES_POOL.length];
      const e = hydrate(Object.assign({ kind: 'enemy', type: f.type, x: q.x, y: q.y }, name ? { name } : {}));
      if (Number.isFinite(f.hp) && f.hp > 0) e.hp = Math.min(e.hpMax, f.hp);
      e.state = 'chase'; e.alertT = 8; e.followed = true;
      G.ents.push(e); came++;
    }
    if (came) {
      const now = typeof performance !== 'undefined' ? performance.now() : 0;
      if (now - lastCome > 1500) { msg(came === 1 ? TX.followed : TX.followedN.replace('{0}', came), 'bad', 3200); lastCome = now; }
      try { if (typeof Audio_ !== 'undefined') Audio_.sfx.door(); } catch (e) { /* */ }
    }
  }

  wireBlocks(); wireFalls(); wireFollow();
  return { TX, TEXTS, B, canFollow, pending, tickFollow };
})();
if (typeof window !== 'undefined') window.RULES88 = RULES88;
