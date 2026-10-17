/* eslint-disable no-func-assign */
// ============================================================
//  ANIMATION: procedural life for every sprite in the world.
//  The engine reads animSY/animSX (squash and stretch), animLift, animSkew (lean),
//  animFlip, animAlpha (dithered fade), animHurt (red flash) and animGlow from each entity.
//  Nothing here is saved; it is all recomputed every frame.
// ============================================================

const ANIM = {
  T: 0, last: 0, ents: null, dirLast: 0,
  quadruped: new Set(['hound', 'cat', 'weaverling', 'broodmother']),
  flutter: new Set(['hushmoth', 'mites']),
  trees: new Set(['oak', 'willow']),
  hanging: new Set(['cloaks', 'web', 'cocoon', 'sign', 'bigbell']),
  fire: new Set(['campfire', 'hearth']),
  lamp: new Set(['lamp']),
};

const ANIM_FRAMES = {};
function animHasFrames(name) { if (ANIM_FRAMES[name] == null) ANIM_FRAMES[name] = !!(Engine.sprites[name + '_w1'] && Engine.sprites[name + '_a2']); return ANIM_FRAMES[name]; }
function animSeed(e) { if (e._seed == null) e._seed = ((e.x * 73.13 + e.y * 37.7) % 6.283 + 6.283) % 6.283; return e._seed; }
function animReset(e) { e.animSY = 1; e.animSX = 1; e.animLift = 0; e.animSkew = 0; e.animHurt = 0; e.animGlow = 0; e.animAlpha = 1; }

// ---------------------------------------------------------------- creatures
function animCreature(e, dt, T) {
  const s = animSeed(e), d = e.def || {}, isEnemy = e.kind === 'enemy';
  // how far did it move this frame?
  const vx = e._ax == null ? 0 : (e.x - e._ax) / Math.max(dt, 1e-3), vy = e._ay == null ? 0 : (e.y - e._ay) / Math.max(dt, 1e-3);
  e._ax = e.x; e._ay = e.y;
  const spd = Math.min(6, Math.hypot(vx, vy));
  e._spd = (e._spd || 0) * 0.8 + spd * 0.2; // smoothed, so a stop-start chase does not stutter
  const moving = e._spd > 0.25;
  const hover = (d.yOff || 0) < 0 || ANIM.flutter.has(e.sprite) || d.quiet;
  // idle breathing
  let sy = 1 + 0.018 * Math.sin(T * 2.1 + s), sx = 1 - 0.009 * Math.sin(T * 2.1 + s);
  let lift = 0, skew = 0, alpha = 1, glow = 0;
  if (!isEnemy) { sy = 1 + 0.012 * Math.sin(T * 1.6 + s); sx = 1 - 0.006 * Math.sin(T * 1.6 + s); skew = 0.012 * Math.sin(T * 0.45 + s * 2); }
  // walking, galloping or hovering
  if (hover) {
    lift = 0.05 + 0.045 * Math.sin(T * 2.4 + s);
    skew = 0.025 * Math.sin(T * 1.1 + s);
    if (ANIM.flutter.has(e.sprite)) sx *= 1 + 0.13 * Math.sin(T * 24 + s);
    if (d.quiet) { alpha = 0.62 + 0.22 * Math.sin(T * 1.3 + s); skew = 0.04 * Math.sin(T * 0.8 + s); }
  } else if (moving) {
    e._phase = (e._phase || 0) + e._spd * dt * (ANIM.quadruped.has(e.sprite) ? 5.2 : 4.2);
    const ph = e._phase;
    if (ANIM.quadruped.has(e.sprite)) { lift = Math.abs(Math.sin(ph)) * 0.05 * (e.scale || 1); sx *= 1 + 0.05 * Math.sin(ph * 2); sy *= 1 - 0.04 * Math.sin(ph * 2); }
    else { lift = Math.abs(Math.sin(ph)) * 0.035 * (e.scale || 1); skew = Math.sin(ph) * 0.035; sy *= 1 - Math.abs(Math.cos(ph)) * 0.02; }
  }
  // face the way it is going across the screen
  if (moving && (ANIM.quadruped.has(e.sprite) || ANIM.flutter.has(e.sprite))) {
    const c = Engine.cam, across = vx * -Math.sin(c.dir) + vy * Math.cos(c.dir);
    if (across < -0.35) e.animFlip = true; else if (across > 0.35) e.animFlip = false;
  }
  // attack: a wind-up and lunge, whenever its cooldown resets
  const cool = isEnemy ? e.cool : e.atkT;
  if (cool != null && e._cool != null && cool > e._cool + 0.3) e._atk = 0.42;
  e._cool = cool;
  if (e._atk > 0) {
    e._atk -= dt; const f = 1 - Math.max(0, e._atk) / 0.42;
    const wind = f < 0.35 ? -Math.sin(f / 0.35 * Math.PI / 2) * 0.5 : Math.sin((f - 0.35) / 0.65 * Math.PI);
    sy *= 1 + 0.09 * wind; sx *= 1 + 0.07 * wind; lift += 0.03 * Math.max(0, wind); skew += (s > 3.14 ? 1 : -1) * 0.07 * wind;
  }
  // real frames, where the enemy has them: walk steps, wind-up as the blow comes, strike as it lands
  if (animHasFrames(e.sprite)) {
    const dCam = Math.hypot(Engine.cam.x - e.x, Engine.cam.y - e.y);
    const shot = e.shotT;
    if (shot != null && e._shot != null && shot > e._shot + 0.5) e._strike = 0.4;
    e._shot = shot;
    // the listening-horn: its alarm timer resetting is its "strike"
    const horn = e.hornT;
    if (horn != null && e._horn != null && horn > e._horn + 0.5) e._strike = 0.6;
    e._horn = horn;
    if (e._atk > 0.3) e._strike = Math.max(e._strike || 0, 0.32);
    if (e._strike > 0) e._strike -= dt;
    let pick = null;
    if (e._strike > 0) pick = '_a2';
    else if (isEnemy && e.state === 'chase' && !e.stun && ((d.reach && dCam < d.reach + 0.35 && e.cool != null && e.cool < 0.38) || (shot != null && shot < 0.6 && shot > 0))) pick = '_a1';
    else if (d.horn && horn != null && horn > 0 && horn < 1) pick = '_a1';
    else if (d.horn) pick = [null, '_w1', null, '_w2'][Math.floor(((T * 0.45 + s) % 4 + 4) % 4)];
    else if (hover) pick = [null, '_w1', null, '_w2'][Math.floor(((T * 1.4 + s) % 4 + 4) % 4)];
    else if (moving) {
      const k = Math.floor((e._phase || 0) / (Math.PI / 2));
      pick = ANIM.quadruped.has(e.sprite) ? ['_w1', '_w2'][k & 1] : ['_w1', null, '_w2', null][k & 3];
    }
    e.animSprite = pick ? e.sprite + pick : null;
    // the frames carry the motion now, so the procedural bounce steps back
    if (pick && pick !== '_a1') { skew *= 0.35; lift *= 0.5; sy = 1 + (sy - 1) * 0.4; sx = 1 + (sx - 1) * 0.4; }
  } else e.animSprite = null;
  // hit: a flinch and a red flash
  if (e.hp != null && e._hp != null && e.hp < e._hp - 0.01) e._hurt = 0.3;
  e._hp = e.hp;
  let hurt = 0;
  if (e._hurt > 0) { e._hurt -= dt; hurt = Math.max(0, e._hurt) / 0.3; skew += 0.11 * hurt * Math.sin(T * 45); sx *= 1 - 0.06 * hurt; lift -= 0.015 * hurt; }
  // stunned: a slow drunk wobble
  if (e.stun > 0) { skew += 0.08 * Math.sin(T * 8 + s); sy *= 1 - 0.03 * Math.abs(Math.sin(T * 4)); }
  // talking to you: a little nod with every phrase
  if (typeof DLG !== 'undefined' && DLG.ent === e && G.state === 'dialogue') { sy *= 1 + 0.026 * Math.max(0, Math.sin(T * 9)) * (0.6 + 0.4 * Math.sin(T * 1.7)); lift += 0.006 * Math.sin(T * 9); }
  // companions: Lyra glows while she sings, Kaelen's arm when he swings it
  if (e.companion) {
    if (e.healT != null && e._healT != null && e.healT > e._healT + 5) e._sing = 1.4;
    e._healT = e.healT;
    const cd = G.party && G.party.cd; if (cd != null && e._cd != null && cd > e._cd + 5) e._sing = Math.max(e._sing || 0, 1.0);
    e._cd = cd;
    if (e._sing > 0) { e._sing -= dt; glow = 0.75 + 0.2 * Math.sin(T * 10); sy *= 1 + 0.02 * Math.sin(T * 7); }
  }
  e.animSY = sy; e.animSX = sx; e.animLift = lift; e.animSkew = skew; e.animAlpha = alpha; e.animHurt = hurt; e.animGlow = glow;
}

// ---------------------------------------------------------------- world objects
function animDeco(e, dt, T, outdoor) {
  const s = animSeed(e), sp = e.sprite;
  animReset(e);
  if (e.dying) return animDying(e, dt);
  if (ANIM.trees.has(sp) && outdoor) {
    const gust = 0.7 + 0.3 * Math.sin(T * 0.23 + e.x * 0.05);
    e.animSkew = gust * (0.016 * Math.sin(T * 0.9 + e.x * 0.35 + e.y * 0.2) + 0.006 * Math.sin(T * 2.3 + s));
  } else if (ANIM.hanging.has(sp)) {
    e.animSkew = (sp === 'bigbell' ? 0.012 : 0.03) * Math.sin(T * (sp === 'bigbell' ? 0.7 : 1.3) + s);
  } else if (ANIM.fire.has(sp)) {
    e.animSY = 1 + 0.05 * Math.sin(T * 11 + s) + 0.03 * Math.sin(T * 17.3 + s * 2);
    e.animSX = 1 - 0.03 * Math.sin(T * 13 + s);
    e.animGlow = 0.82 + 0.14 * Math.sin(T * 9.1 + s) + 0.04 * Math.sin(T * 23);
  } else if (ANIM.lamp.has(sp)) {
    e.animGlow = (e.glow || 0.7) * (0.92 + 0.08 * Math.sin(T * 6.3 + s) + 0.04 * Math.sin(T * 15.7));
  } else if (sp === 'cores') {
    e.animLift = 0.03 * Math.sin(T * 1.8 + s);
  }
}

// ---------------------------------------------------------------- deaths
function animDying(e, dt) {
  e.dieT += dt; const k = Math.min(1, e.dieT / e.dieDur), ease = 1 - (1 - k) * (1 - k);
  if (e.dieStyle === 'dissolve') {
    // Cacophony and Quiets come apart: static, lift, gone
    e.animLift = 0.25 * ease; e.animAlpha = 1 - k; e.animSX = 1 + 0.4 * ease; e.animSY = 1 - 0.2 * ease;
    e.animSkew = 0.12 * Math.sin(e.dieT * 50) * (1 - k); e.animGlow = 0.9 * (1 - k);
  } else {
    // flesh, wood and marble fall
    e.animSY = 1 - 0.82 * ease; e.animSX = 1 + 0.32 * ease; e.animSkew = (e._seed > 3.14 ? 1 : -1) * 0.25 * ease;
    e.animAlpha = k < 0.7 ? 1 : 1 - (k - 0.7) / 0.3; e.animHurt = 0.5 * (1 - k);
  }
  if (k >= 1) e.dead = e.hidden = true;
}
function animSpawnDeath(src) {
  if (!src || !src.sprite || !G.ents) return;
  const d = src.def || {}, big = !!d.boss;
  const ghost = { kind: 'deco', sprite: src.sprite, x: src.x, y: src.y, scale: src.scale, yOff: src.yOff, dying: true, transient: true, nopick: true, solid: false,
    dieT: 0, dieDur: big ? 1.4 : 0.65, dieStyle: (d.cacophony || d.quiet || d.hushkin) ? 'dissolve' : 'fall', animFlip: src.animFlip };
  animSeed(ghost); G.ents.push(ghost);
}

// ---------------------------------------------------------------- particles (screen space, drawn over the view)
const PARTICLES = { list: [], mapId: null };
const PART_STYLE = {
  deepwoods: { n: 28, kind: 'leaf', colors: ['#8a4a1c', '#a8642a', '#6b3a18', '#c08a3a', '#7d5a2a'] },
  oakhaven: { n: 10, kind: 'leaf', colors: ['#6f6a3a', '#8a7a3a', '#5a5030'] },
  clearing: { n: 12, kind: 'leaf', colors: ['#6f6a3a', '#8a7a3a', '#5a5030'] },
  whispergrove: { n: 22, kind: 'mote', colors: ['#d8d2e8', '#bfb6d8', '#e8e0f0'] },
  mausoleum: { n: 16, kind: 'dust', colors: ['#9a8f80', '#b8ab96'] },
  catacombs: { n: 14, kind: 'dust', colors: ['#8a8070', '#a89a86'] },
  belfry: { n: 14, kind: 'dust', colors: ['#9a8f80', '#b8ab96'] },
  cloister: { n: 10, kind: 'dust', colors: ['#a89a86'] },
  malting: { n: 12, kind: 'dust', colors: ['#b8a47a', '#c8b48a'] },
  wickhouse: { n: 8, kind: 'dust', colors: ['#a89a86'] },
};
function partNew(st, anywhere) {
  const p = { x: Math.random() * VW, y: anywhere ? Math.random() * VIEW_H : (st.kind === 'mote' ? VIEW_H + 2 : -2), c: st.colors[(Math.random() * st.colors.length) | 0], ph: Math.random() * 6.28, z: 0.5 + Math.random() * 0.8 };
  if (st.kind === 'leaf') { p.vy = 9 + Math.random() * 9; p.vx = -4 + Math.random() * 8; }
  else if (st.kind === 'mote') { p.vy = -(3 + Math.random() * 4); p.vx = -2 + Math.random() * 4; }
  else { p.vy = -0.6 + Math.random() * 1.6; p.vx = -1.5 + Math.random() * 3; }
  return p;
}
function animParticles(dt, T) {
  const st = PART_STYLE[G.mapId]; const ctx = Engine.ctx;
  if (!st || G.state === 'title') return;
  if (PARTICLES.mapId !== G.mapId) { PARTICLES.mapId = G.mapId; PARTICLES.list = []; for (let i = 0; i < st.n; i++) PARTICLES.list.push(partNew(st, true)); }
  // turning the view slides the particles, so they sit in the world rather than on the glass
  let dd = Engine.cam.dir - ANIM.dirLast; ANIM.dirLast = Engine.cam.dir;
  if (dd > Math.PI) dd -= Math.PI * 2; if (dd < -Math.PI) dd += Math.PI * 2;
  const shift = -dd * 255;
  for (const p of PARTICLES.list) {
    p.ph += dt * (st.kind === 'leaf' ? 3 : 1.2);
    p.x += (p.vx + Math.sin(p.ph) * (st.kind === 'leaf' ? 10 : 2)) * dt * p.z + shift * p.z;
    p.y += p.vy * dt * p.z;
    if (p.x < -4) p.x += VW + 8; if (p.x > VW + 4) p.x -= VW + 8;
    if (p.y > VIEW_H + 3 || p.y < -4) Object.assign(p, partNew(st, false));
    ctx.fillStyle = p.c;
    if (st.kind === 'leaf') { const flat = Math.sin(p.ph * 1.7) > 0; ctx.globalAlpha = 0.85; ctx.fillRect(p.x | 0, p.y | 0, flat ? 2 : 1, flat ? 1 : 2); }
    else if (st.kind === 'mote') { ctx.globalAlpha = 0.35 + 0.35 * Math.sin(p.ph * 2); ctx.fillRect(p.x | 0, p.y | 0, 1, 1); }
    else { ctx.globalAlpha = 0.18 + 0.14 * Math.sin(p.ph * 1.5); ctx.fillRect(p.x | 0, p.y | 0, 1, 1); }
  }
  ctx.globalAlpha = 1;
}

// ---------------------------------------------------------------- per frame
function animFrame() {
  const now = performance.now() / 1000; const dt = Math.min(0.1, ANIM.last ? now - ANIM.last : 0.016); ANIM.last = now;
  ANIM.T += dt; ANIM.dt = dt; const T = ANIM.T; Engine.setTime(T);
  if (!G.ents) return;
  if (ANIM.ents !== G.ents) {
    // left a map: tidy away any death animations still playing there
    ANIM.ents = G.ents;
    for (const id in G.maps) { const L = G.maps[id].entities; if (L === G.ents) continue; for (let i = L.length - 1; i >= 0; i--) if (L[i].transient) L.splice(i, 1); }
  }
  const outdoor = G.map && G.map.outdoor;
  for (let i = G.ents.length - 1; i >= 0; i--) {
    const e = G.ents[i];
    if (e.transient && e.dead) { G.ents.splice(i, 1); continue; }
    if (!e.sprite || (e.hidden && !e.dying)) continue;
    if (e.kind === 'enemy' || e.kind === 'npc') animCreature(e, dt, T);
    else if (e.kind === 'deco') animDeco(e, dt, T, outdoor);
  }
}

// ---------------------------------------------------------------- hooks (load order: after game.js and party.js)
(() => {
  const _kill = killEnemy;
  killEnemy = function (e, byGlass) { const r = _kill(e, byGlass); try { animSpawnDeath(e); } catch (err) { /* animation must never break a kill */ } return r; };
  const _eRender = Engine.render;
  Engine.render = function (ents, tod, opts) { const r = _eRender(ents, tod, opts); try { animParticles(ANIM.dt || 0.016, ANIM.T); } catch (err) { /* never break a frame */ } return r; };
  const _render = render;
  render = function () { if (G.map) animFrame(); return _render(); };
})();
