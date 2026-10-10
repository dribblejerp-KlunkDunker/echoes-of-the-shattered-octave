// ============================================================
//  GAME — Echoes of the Shattered Octave: The Silenced Province
// ============================================================
'use strict';

const $ = (s) => document.querySelector(s);
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const rnd = (a, b) => a + Math.random() * (b - a);
const rndi = (a, b) => Math.floor(rnd(a, b + 1));
const dist2 = (ax, ay, bx, by) => (ax - bx) * (ax - bx) + (ay - by) * (ay - by);
const normAng = (a) => { while (a > Math.PI) a -= Math.PI * 2; while (a < -Math.PI) a += Math.PI * 2; return a; };

const G = {
  state: 'loading', maps: null, map: null, mapId: null, ents: [],
  player: null, flags: {}, journal: [], ledger: [], runs: 0,
  tod: 0.78, day: 0, hour: 18, time: 0,
  keys: {}, mouse: { down: false, rdown: false, x: 0, y: 0, sx: 0, sy: 0, t: 0 },
  attack: { t: 0, dur: 0, dirLabel: '' }, song: { t: 0 },
  noise: 2, stillT: 0, unwriting: false, rootWard: 0, glassLock: 0, murmurT: 0, whistleT: 0,
  escapeTimer: 0, hurtT: 0, songFx: 0, msgQueue: [], dead: false,
  fadeT: 0, bobPhase: 0, lastStep: 0, hint: '', openPanel: null,
  give(id, n) { const it = ITEMS[id]; const slot = this.player.inv.find(s => s.id === id); if (slot && !it.key) slot.n += (n || 1); else this.player.inv.push({ id, n: n || 1 }); },
  has(id) { return this.player.inv.some(s => s.id === id); },
  take(id) { const i = this.player.inv.findIndex(s => s.id === id); if (i >= 0) { this.player.inv[i].n--; if (this.player.inv[i].n <= 0) this.player.inv.splice(i, 1); } },
  gold(n) { this.player.gold += n; },
};

// ---------------------------------------------------------------- UI helpers
function show(id) { $(id).classList.remove('hidden'); }
function hide(id) { $(id).classList.add('hidden'); }
function msg(text, cls, ttl) {
  const box = $('#msgs'); const el = document.createElement('div'); el.className = 'm' + (cls ? ' ' + cls : ''); el.textContent = text; box.appendChild(el);
  while (box.children.length > 5) box.removeChild(box.firstChild);
  setTimeout(() => el.classList.add('fade'), ttl || 5200); setTimeout(() => el.remove(), (ttl || 5200) + 700);
}
function journal(cat, text) { G.journal.unshift({ cat, text, day: G.day }); msg('Your logbook has been updated.', 'warn', 2500); Audio_.sfx.ui(); }
function openModal(html, name) { $('#modal-panel').innerHTML = html; show('#modal'); G.openPanel = name; G.keys = {}; }
function closeModal() { hide('#modal'); G.openPanel = null; }
function fx(cls, ms) { const f = $('#fx'); f.className = cls; clearTimeout(f._t); f._t = setTimeout(() => { if (f.className === cls) f.className = ''; }, ms || 200); }

// ---------------------------------------------------------------- character creation
const CREATE = { step: 0, name: '', cls: null, face: 1, bio: [], mods: {} };
function renderCreate() {
  const p = $('#create-panel'); const s = CREATE.step;
  if (s === 0) {
    p.innerHTML = `<h2>Who are you, in the Narrow?</h2><p class="muted">Every soul in the Reach keeps its name close. The Catalogue would like to know yours.</p>
    <p><input id="cname" type="text" maxlength="24" placeholder="Your name" value="${CREATE.name}"></p>
    <div class="btns"><button class="dfbtn" id="c-next">Continue</button><button class="dfbtn" id="c-back">Back to title</button></div>`;
    $('#cname').focus();
    $('#c-next').onclick = () => { CREATE.name = $('#cname').value.trim() || 'Nameless'; CREATE.step = 1; renderCreate(); };
    $('#c-back').onclick = () => { hide('#create'); show('#title'); };
    $('#cname').onkeydown = (e) => { if (e.key === 'Enter') $('#c-next').click(); e.stopPropagation(); };
  } else if (s === 1) {
    p.innerHTML = `<h2>Choose your calling</h2><div class="classlist">${CLASSES.map((c, i) => `<button class="dfbtn ${CREATE.cls === i ? 'sel' : ''}" data-i="${i}">${c.name}<small>${c.hz} · ${c.skills}</small></button>`).join('')}</div>
    <div id="cdesc" style="margin-top:1cqh;min-height:9cqh"></div><div class="btns"><button class="dfbtn" id="c-next" ${CREATE.cls == null ? 'disabled' : ''}>Continue</button><button class="dfbtn" id="c-back">Back</button></div>`;
    const descr = () => { if (CREATE.cls == null) { $('#cdesc').innerHTML = '<p class="muted">Pick a calling to read of it.</p>'; return; } const c = CLASSES[CREATE.cls]; $('#cdesc').innerHTML = `<p class="q">${c.desc}</p><p class="muted">Health ${c.hp} · Voice ${c.voice} · Glass shot ×${c.pellets} · Songs: ${c.songs.map(s => SONGS[s].name).join(', ')}</p>`; };
    descr();
    p.querySelectorAll('.classlist button').forEach(b => b.onclick = () => { CREATE.cls = +b.dataset.i; renderCreate(); Audio_.sfx.ui(); });
    $('#c-next').onclick = () => { CREATE.step = 2; renderCreate(); };
    $('#c-back').onclick = () => { CREATE.step = 0; renderCreate(); };
  } else if (s === 2) {
    p.innerHTML = `<h2>Choose your face</h2><div class="faces">${[1, 2, 3, 4, 5, 6].map(i => `<img src="img/face_${i}.jpg" data-i="${i}" class="${CREATE.face === i ? 'sel' : ''}" alt="face ${i}">`).join('')}</div>
    <div class="btns"><button class="dfbtn" id="c-next">Continue</button><button class="dfbtn" id="c-back">Back</button></div>`;
    p.querySelectorAll('.faces img').forEach(im => im.onclick = () => { CREATE.face = +im.dataset.i; renderCreate(); Audio_.sfx.ui(); });
    $('#c-next').onclick = () => { CREATE.step = 3; CREATE.bio = []; renderCreate(); };
    $('#c-back').onclick = () => { CREATE.step = 1; renderCreate(); };
  } else if (s === 3) {
    const qi = CREATE.bio.length; const q = BIOGRAPHY[qi];
    p.innerHTML = `<h2>Biography · ${qi + 1} of ${BIOGRAPHY.length}</h2><p class="q">${q.q}</p><div class="list" style="margin-top:1cqh">${q.a.map((a, i) => `<button class="dfbtn" data-i="${i}">${a.t}</button>`).join('')}</div>`;
    p.querySelectorAll('.list button').forEach(b => b.onclick = () => { CREATE.bio.push(+b.dataset.i); Audio_.sfx.ui(); if (CREATE.bio.length >= BIOGRAPHY.length) { CREATE.step = 4; } renderCreate(); });
  } else {
    const c = CLASSES[CREATE.cls]; const attrs = Object.assign({}, c.attrs);
    for (let i = 0; i < CREATE.bio.length; i++) { const a = BIOGRAPHY[i].a[CREATE.bio[i]]; for (const k in a.mod) attrs[k] += a.mod[k]; }
    p.innerHTML = `<h2>${CREATE.name}, ${c.name}</h2><div class="row"><div class="col"><img src="img/face_${CREATE.face}.jpg" style="width:16cqw;height:16cqw;border:2px solid #0b0806"><p class="muted">${c.hz} · Level 1</p></div>
    <div class="col"><div class="attrs">${ATTRS.map(a => `<div><span>${a}</span><b>${attrs[a]}</b></div>`).join('')}</div>
    <p style="margin-top:1cqh">Health <b style="color:var(--gold)">${c.hp + Math.floor(attrs.Endurance / 10)}</b> · Voice <b style="color:var(--gold)">${c.voice + Math.floor(attrs.Willpower / 10)}</b> · Fatigue <b style="color:var(--gold)">${attrs.Strength + attrs.Endurance}</b></p></div></div>
    <div class="btns"><button class="dfbtn" id="c-go">Go up the Greenroot road</button><button class="dfbtn" id="c-back">Back</button></div>`;
    $('#c-go').onclick = () => { CREATE.attrs = attrs; startGame(); };
    $('#c-back').onclick = () => { CREATE.step = 3; CREATE.bio = []; renderCreate(); };
  }
}

// ---------------------------------------------------------------- new game
function newPlayer() {
  const c = CLASSES[CREATE.cls]; const a = CREATE.attrs;
  const hpMax = c.hp + Math.floor(a.Endurance / 10), voiceMax = c.voice + Math.floor(a.Willpower / 10), fatMax = a.Strength + a.Endurance;
  return { name: CREATE.name, cls: c, face: CREATE.face, attrs: a, hp: hpMax, hpMax, voice: voiceMax, voiceMax, fat: fatMax, fatMax, gold: 12, pellets: c.pellets,
    inv: [], weapons: c.weapons.slice(), weapon: 0, songs: c.songs.slice(), glass: c.glass ? 42 : 0, glassed: c.glass, fragments: c.id === 'archivist' ? 3 : 0, xp: 0, level: 1, kills: 0 };
}
function startGame() {
  hide('#create'); G.player = newPlayer(); G.flags = {}; G.journal = []; G.ledger = []; G.tod = 0.74; G.day = 0; G.escapeTimer = 0; G.dead = false; G.noise = 2;
  for (let i = 0; i < CREATE.bio.length; i++) G.flags[BIOGRAPHY[i].a[CREATE.bio[i]].flag] = true;
  G.maps = buildAllMaps();
  journal('main', 'I came up the Greenroot road to Oakhaven on Nullday, autumn, 419 SR. The gate-warden will know where the Cantor lives.');
  // intro
  show('#intro'); const it = $('#intro-text'); it.innerHTML = '';
  INTRO.forEach((line, i) => { const pEl = document.createElement('p'); pEl.textContent = line; pEl.style.animationDelay = (i * 1.1) + 's'; it.appendChild(pEl); });
  $('#btn-intro-skip').onclick = () => { hide('#intro'); loadMap('oakhaven'); G.state = 'play'; Audio_.setScene('town'); msg('Nullday. Dusk. Oakhaven, inside the Hedge.', 'warn', 6000); msg('Press H for help at any time.', '', 7000); };
}

// ---------------------------------------------------------------- maps
function hydrate(e) {
  if (e._h) return e; e._h = true;
  if (e.kind === 'enemy') {
    const d = ENEMIES[e.type]; e.def = d; e.hp = d.hp; e.hpMax = d.hp; e.sprite = d.sprite; e.scale = d.scale || 1; e.yOff = d.yOff || 0; e.state = e.passive ? 'passive' : 'idle'; e.solid = true; e.radius = 0.35;
    e.homeX = e.x; e.homeY = e.y; e.cool = 0; e.stun = 0; e.fifthN = 0; e.wanderT = 0; e.name = e.name || (d.core ? NAMES_POOL[rndi(0, NAMES_POOL.length - 1)] : null); e.alertT = 0;
  }
  if (e.kind === 'npc') { e.homeX = e.x; e.homeY = e.y; e.wanderT = rnd(0, 3); e.dir = rnd(0, 6.28); }
  return e;
}
function loadMap(id, pos) {
  const m = G.maps[id]; G.map = m; G.mapId = id; G.ents = m.entities; m.entities.forEach(hydrate);
  Engine.setMap(m);
  const p = pos || m.spawn; Engine.cam.x = p.x; Engine.cam.y = p.y; Engine.cam.dir = p.dir || 0; Engine.cam.pitch = 0;
  G.stillT = 0; G.unwriting = false; $('#view').classList.remove('unwrite');
  Audio_.setScene(m.music);
  msg(m.name, 'warn', 3500);
  G.fadeT = 0.5;
}
function transfer(portal) {
  let pos = null; const target = G.maps[portal.map];
  if (portal.useSpawn === 'shaft' && target.named && target.named.shaft) { const s = target.named.shaft; pos = { x: s.cx + 0.5, y: s.cy + 1.2, dir: Math.PI / 2 }; }
  else if (portal.useSpawn) pos = target.spawn; else pos = { x: portal.x, y: portal.y, dir: portal.dir };
  // the Rite begins when you take the shaft down with the pass
  if (portal.map === 'rootvault' && !G.flags.rite_started) { G.flags.rite_started = true; G.day = 10; G.tod = 0.42; journal('main', 'Hearthday. The Church holds the Pure Note over Oakhaven; the town hums the Root note under it, too quietly to punish. They have walked Lyra down in white. I go down by the shaft with the coil.'); }
  loadMap(portal.map, pos);
}

// ---------------------------------------------------------------- collision
function solidAt(x, y, self) {
  const m = G.map; const r = 0.24;
  for (const [dx, dy] of [[-r, -r], [r, -r], [-r, r], [r, r]]) if (m.isSolidCell((x + dx) | 0, (y + dy) | 0)) return true;
  if (self && dist2(x, y, Engine.cam.x, Engine.cam.y) < 0.4) return true;
  for (const e of G.ents) { if (e === self || !e.solid || e.hidden || e.dead) continue; const rr = (e.radius || 0.3) + 0.22; if (dist2(x, y, e.x, e.y) < rr * rr) return true; }
  return false;
}
function moveWithSlide(o, dx, dy, self) {
  let moved = false;
  if (!solidAt(o.x + dx, o.y, self)) { o.x += dx; moved = true; }
  if (!solidAt(o.x, o.y + dy, self)) { o.y += dy; moved = true; }
  return moved;
}
function los(ax, ay, bx, by) {
  const d = Math.sqrt(dist2(ax, ay, bx, by)); const n = Math.ceil(d / 0.2); const sx = (bx - ax) / n, sy = (by - ay) / n;
  let x = ax, y = ay; for (let i = 0; i < n; i++) { x += sx; y += sy; if (G.map.isSolidCell(x | 0, y | 0)) return false; } return true;
}

// ---------------------------------------------------------------- noise / the Narrow
function addNoise(n) { G.noise = clamp(G.noise + n, 0, 10); }
function updateNarrow(dt, moving, running) {
  const p = G.player;
  let floor = moving ? (running ? 4.2 : 2.4) : 1.0;
  if (G.murmurT > 0) { floor = Math.max(floor, 2.6); G.murmurT -= dt; }
  if (G.whistleT > 0) { floor = Math.max(floor, 2.2); G.whistleT -= dt; }
  // decay toward floor
  if (G.noise > floor) G.noise = Math.max(floor, G.noise - dt * 1.4); else G.noise = Math.min(floor, G.noise + dt * 3);
  // the Hush
  if (G.map.siphoned && G.noise < 1.5 && G.whistleT <= 0 && !(G.boreHold > 0) && !G.escapeTimer) { G.stillT += dt; } else { G.stillT = Math.max(0, G.stillT - dt * 2); }
  const was = G.unwriting; G.unwriting = G.stillT > 7;
  if (G.unwriting && !was) msg('You are too still. Something leans in. Your fingertips are going cold. Move, or murmur (N).', 'bad');
  if (G.unwriting) { p.hp -= dt * 0.8; $('#view').classList.add('unwrite'); if (p.hp <= 0) die('unwrite'); }
  else if (was) $('#view').classList.remove('unwrite');
  // the hounds
  if (G.map.danger > 0 && G.noise > 7 && Math.random() < dt * 0.35 * G.map.danger) spawnHound();
}
function spawnHound() {
  const alive = G.ents.filter(e => e.kind === 'enemy' && e.type === 'hound' && !e.dead).length; if (alive >= 5) return;
  const c = Engine.cam;
  for (let i = 0; i < 20; i++) {
    const a = rnd(0, 6.28), d = rnd(5, 9); const x = c.x + Math.cos(a) * d, y = c.y + Math.sin(a) * d;
    if (x < 1 || y < 1 || x >= G.map.w - 1 || y >= G.map.h - 1 || solidAt(x, y)) continue;
    const e = hydrate({ kind: 'enemy', type: 'hound', x, y }); e.state = 'chase'; G.ents.push(e); msg('Something has heard you. A jitter in the air, like heat-haze with teeth.', 'bad'); Audio_.sfx.hound(); return;
  }
}

// ---------------------------------------------------------------- enemies
function enemyUpdate(e, dt) {
  const p = G.player, c = Engine.cam, d = e.def;
  if (e.dead) return;
  if (e.stun > 0) { e.stun -= dt; e.flash = (e.stun % 0.3) < 0.1; return; } else e.flash = false;
  if (e.state === 'passive') return;
  const dx = c.x - e.x, dy = c.y - e.y, dist = Math.sqrt(dx * dx + dy * dy);
  const canSee = dist < 7 && los(e.x, e.y, c.x, c.y);
  const hearRange = 1.5 + G.noise * (d.noiseLure ? 1.4 : 0.8);
  if (e.state === 'idle') {
    if ((canSee && dist < 5) || (dist < hearRange && !e.guard) || (e.guard && canSee && dist < 4)) { e.state = 'chase'; if (d.cacophony) Audio_.sfx.hound(); else if (d.core) Audio_.sfx.bell(); else if (e.type === 'golem') Audio_.sfx.golem(); }
    else if (!e.guard) { e.wanderT -= dt; if (e.wanderT <= 0) { e.wanderT = rnd(1, 4); e.wdir = rnd(0, 6.28); } if (dist2(e.x, e.y, e.homeX, e.homeY) < 9 && e.wanderT > 1.5) moveWithSlide(e, Math.cos(e.wdir) * d.speed * 0.3 * dt, Math.sin(e.wdir) * d.speed * 0.3 * dt, e); }
    return;
  }
  // chase
  if (e.state === 'chase') {
    e.alertT = canSee ? 8 : e.alertT - dt;
    if (e.alertT <= 0 && dist > 9) { e.state = 'idle'; return; }
    // hounds will not touch the glassed; Root Note wards them
    const glassFear = d.cacophony && ((p.glassed && G.glassLock <= 0) || G.rootWard > 0);
    if (glassFear) { if (dist < 3.5) { moveWithSlide(e, -dx / dist * d.speed * dt, -dy / dist * d.speed * dt, e); } return; }
    if (dist > d.reach) {
      // telegraph for golem
      let sp = d.speed; if (e.type === 'golem' && e.cool > 0) sp *= 0.3;
      const nx = dx / dist, ny = dy / dist;
      if (!moveWithSlide(e, nx * sp * dt, ny * sp * dt, e) || (!canSee && e.alertT < 7)) {
        // try sidestep
        const side = Math.random() < 0.5 ? 1 : -1; moveWithSlide(e, -ny * side * sp * dt, nx * side * sp * dt, e);
      }
    } else {
      e.cool -= dt;
      if (e.cool <= 0) {
        e.cool = e.type === 'golem' ? 2.2 : (d.cacophony ? 1.1 : 1.5);
        // hit roll vs agility
        const dodge = p.attrs.Agility / 400 + (p.cls.id === 'corsair' ? 0.08 : 0);
        if (Math.random() > dodge) {
          let dmg = rndi(d.dmg[0], d.dmg[1]);
          if (d.press && p.glassed) { G.glassLock = 8; msg('The proctor strikes your glass with a hand-press tuned to 741. Your arm locks rigid, ringing flat.', 'bad'); Audio_.sfx.press(); }
          damagePlayer(dmg, d.name);
        } else msg(`You slip the ${d.name}'s blow.`, '', 1800);
        if (d.quiet) Audio_.sfx.quiet();
        if (d.cacophony) addNoise(0.8);
      }
    }
  }
}
function damagePlayer(dmg, src) {
  const p = G.player; p.hp -= dmg; G.hurtT = 0.25; fx('hurt', 220); Audio_.sfx.hurt();
  msg(`${src} hits you for ${dmg}.`, 'bad', 2200);
  if (p.hp <= 0) die(src);
}
function killEnemy(e, byGlass) {
  e.dead = true; e.solid = false; e.hidden = true; G.player.kills++; G.player.xp += e.def.xp;
  if (e.def.core && e.name) {
    Audio_.sfx.bellDie();
    G.ledger.push({ name: e.name, where: G.map.name, day: G.day });
    msg(`The bell goes still. Inside it, a voice says: "${e.name}." Three times. Then nothing.`, 'voice', 7000);
    if (!G.has('core') && e.name === 'Tamsin Reed') { G.give('core'); msg('You take the cracked lilac core.', 'good'); }
  } else if (e.def.cacophony) { msg(`The ${e.def.name} bursts, and everything it ever ate comes out at once.`, 'good', 4000); }
  else msg(`The ${e.def.name} is destroyed.`, 'good', 3000);
  if (byGlass && e.def.cacophony) { const p = G.player; p.hp = Math.min(p.hpMax, p.hp + 4); p.glass = Math.min(100, p.glass + 3); fx('glass', 400); msg('The glass drinks what it broke. The ring is fuller. The tideline climbs.', 'warn'); if (p.glass >= 100) die('heartglass'); }
  if (e.onDeath) e.onDeath();
  checkLevel();
}
function checkLevel() {
  const p = G.player; const need = Math.floor(60 * Math.pow(p.level, 1.5));
  if (p.xp >= need) { p.level++; p.xp -= need; const h = 4 + Math.floor(p.attrs.Endurance / 20), v = 2 + Math.floor(p.attrs.Willpower / 20); p.hpMax += h; p.hp += h; p.voiceMax += v; p.voice += v; msg(`You have learned enough from your travels to reach level ${p.level}.`, 'good', 6000); Audio_.sfx.pickup(); }
}

// ---------------------------------------------------------------- combat
function currentWeapon() { return WEAPONS[G.player.weapons[G.player.weapon]]; }
function attack(dirLabel) {
  const p = G.player; const w = currentWeapon(); if (G.attack.t > 0 || G.song.t > 0) return;
  if (w.type === 'glass' && G.glassLock > 0) { msg('Your glass arm is locked rigid, ringing flat.', 'bad', 1500); return; }
  if (w.ammo) { if (p.pellets <= 0) { msg('No glass shot. A sovereign a pellet, and you have none loaded.', 'bad'); return; } p.pellets--; Audio_.sfx.shot(); }
  else Audio_.sfx.swing();
  G.attack.t = w.speed; G.attack.dur = w.speed; G.attack.dirLabel = dirLabel; addNoise(w.noise);
  p.fat = Math.max(0, p.fat - 1);
  // find target
  const c = Engine.cam; let best = null, bd = 1e9;
  for (const e of G.ents) {
    if (e.kind !== 'enemy' || e.dead) continue;
    const dx = e.x - c.x, dy = e.y - c.y, d = Math.sqrt(dx * dx + dy * dy);
    if (d > w.reach + (e.radius || 0.3)) continue;
    const ang = Math.abs(normAng(Math.atan2(dy, dx) - c.dir));
    const cone = w.type === 'shot' ? 0.14 + 0.25 / Math.max(1, d) : 0.55;
    if (ang > cone) continue;
    if (w.type === 'shot' && !los(c.x, c.y, e.x, e.y)) continue;
    if (d < bd) { bd = d; best = e; }
  }
  if (!best) { if (w.type !== 'shot') msg(`Your ${dirLabel || 'swing'} finds nothing but air.`, '', 1200); return; }
  const e = best, d = e.def;
  // hit chance
  const hitChance = 0.55 + p.attrs.Agility / 250 + p.attrs.Luck / 600 + (w.type === 'shot' ? 0.15 : 0);
  if (Math.random() > hitChance) { msg(`You miss the ${d.name}.`, '', 1500); return; }
  let dmg = rndi(w.dmg[0], w.dmg[1]) + Math.floor(p.attrs.Strength / 25);
  if (w.type === 'shot') { if (d.cacophony) dmg *= 2; if (d.quiet) { dmg = 0; msg('The pellet cannot ring inside the quiet. It drops like a dropped coat.', 'warn'); } }
  if (w.type === 'iron' && d.quiet) dmg = Math.floor(dmg * 1.5);
  if (w.type === 'glass') { if (d.cacophony) dmg = Math.floor(dmg * 1.6); p.glass = Math.min(100, p.glass + 0.4); }
  if (w.type === 'iron' && d.cacophony && w !== WEAPONS.hands) dmg = Math.floor(dmg * 0.6);
  if (d.armored && w.type !== 'glass') dmg = Math.max(1, dmg - 3);
  e.hp -= dmg; e.flash = true; setTimeout(() => e.flash = false, 90);
  if (w.type === 'glass') Audio_.sfx.glasshit(); else Audio_.sfx.hit();
  if (e.state === 'idle' || e.state === 'passive') e.state = 'chase';
  if (dmg > 0) msg(w.type === 'shot' ? `Your shot breaks on the ${d.name} for ${dmg}.` : `Your ${dirLabel || 'blow'} lands on the ${d.name} for ${dmg}.`, '', 1800);
  if (e.hp <= 0) killEnemy(e, w.type === 'glass');
}

// ---------------------------------------------------------------- songs
function castSong(id) {
  const p = G.player, s = SONGS[id]; if (!s || G.song.t > 0 || G.attack.t > 0) return;
  // a quiet eats the air
  for (const e of G.ents) if (e.kind === 'enemy' && !e.dead && e.def.quiet && dist2(e.x, e.y, Engine.cam.x, Engine.cam.y) < 16) { msg('You open your mouth and nothing comes out. The air here cannot carry it.', 'bad'); return; }
  if (id === 'murmur') { G.murmurT = 4; addNoise(s.noise); Audio_.sfx.murmur(); msg('You murmur, low, inside the Narrow.', '', 1500); return; }
  if (p.voice < s.cost) { msg('Your voice is torn. There is nothing left in it.', 'bad'); return; }
  p.voice -= s.cost; addNoise(s.noise); G.song.t = 0.7; fx('song', 600); G.songFx = 0.6;
  if (id === 'tending') { p.hp = Math.min(p.hpMax, p.hp + 14); Audio_.sfx.song(174, 1.4); msg('You sing the tending note, low. Something knits.', 'good'); }
  else if (id === 'root') { G.rootWard = 12; Audio_.sfx.song(174, 2.0); msg('You sing the Root note, the one it keeps losing. The hounds will not come to you, for a little while.', 'good'); }
  else if (id === 'fifth') {
    Audio_.sfx.fifth(); let n = 0;
    for (const e of G.ents) { if (e.kind !== 'enemy' || e.dead || !e.def.cacophony) continue; if (dist2(e.x, e.y, Engine.cam.x, Engine.cam.y) > 100) continue; if (e.def.boss && e.fifthN > 0) { msg('The Wearer whistles the falling fifth back at you, exactly right. It has learned it.', 'bad'); continue; } const st = [4.5, 2.5, 1.2, 0.5][Math.min(3, e.fifthN)]; e.stun = st; e.fifthN++; n++; }
    msg(n ? `You sing the falling fifth at full voice. ${n === 1 ? 'The thing' : n + ' of them'} stop${n === 1 ? 's' : ''} for a breath.` : 'You sing the falling fifth. Nothing here is listening. Something further off may be.', n ? 'good' : 'warn');
    if (G.map.danger > 0 && Math.random() < 0.5) setTimeout(spawnHound, 2500);
  }
  else if (id === 'name') {
    if (p.fragments <= 0) { msg('You reach for the Ledger and find nothing left to pay with.', 'bad'); p.voice += s.cost; return; }
    const c = Engine.cam; let best = null, bd = 1e9;
    for (const e of G.ents) { if (e.kind !== 'enemy' || e.dead || !e.def.core) continue; const d = Math.sqrt(dist2(e.x, e.y, c.x, c.y)); if (d > 4) continue; const ang = Math.abs(normAng(Math.atan2(e.y - c.y, e.x - c.x) - c.dir)); if (ang < 0.5 && d < bd) { bd = d; best = e; } }
    if (!best) { msg('There is no one here whose name you hold.', 'warn'); p.voice += s.cost; return; }
    p.fragments--; Audio_.sfx.song(741, 1.2);
    msg(`You read it its own surrendered name. "${best.name}." It stops. You have forgotten something small to pay for it; you cannot tell what.`, 'voice', 7000);
    killEnemy(best, false);
  }
}

// ---------------------------------------------------------------- interaction
function interact() {
  const c = Engine.cam;
  const e = Engine.pick(G.ents, 2.2);
  if (e && !e.dead) {
    if (e.kind === 'npc') { talk(e); return; }
    if (e.kind === 'item') { pickUp(e); return; }
    if (e.kind === 'deco' && e.use) { useDeco(e); return; }
    if (e.kind === 'enemy') { if (e.def.core) msg(`Stand close, and you can hear someone murmuring inside the bell: "...${e.name ? e.name.split(' ')[0].toLowerCase() : 'home'}... the blue jug... "`, 'voice'); else msg(e.def.desc, ''); return; }
    if (e.kind === 'deco') { msg(decoLabel(e), '', 2500); return; }
  }
  // proximity fallback: items and usable things just in front of you
  let best = null, bd = 1e9;
  for (const o of G.ents) { if (o.hidden || o.dead || (o.kind !== 'item' && !(o.kind === 'deco' && o.use) && o.kind !== 'npc')) continue; const d = Math.sqrt(dist2(o.x, o.y, c.x, c.y)); if (d > 1.6 + (o.radius || 0)) continue; const ang = Math.abs(normAng(Math.atan2(o.y - c.y, o.x - c.x) - c.dir)); if (ang < 0.8 && d < bd) { bd = d; best = o; } }
  if (best) { if (best.kind === 'item') pickUp(best); else if (best.kind === 'npc') talk(best); else useDeco(best); return; }
  const w = Engine.pickWall(2.0);
  if (w && w.cell.door) {
    const cell = w.cell, key = w.y * G.map.w + w.x;
    if (cell.locked) {
      const ok = cell.locked === 'pass' ? G.has('pass') : (cell.locked === '__never' ? false : !!G.flags[cell.locked]);
      if (!ok) { msg(cell.lockMsg || 'It is locked.', 'warn', 4500); return; }
    }
    if (cell.portal) { Audio_.sfx.door(); transfer(cell.portal); return; }
    const d = G.map.doors[key]; d.target = d.target > 0.5 ? 0 : 1; Audio_.sfx.door(); addNoise(0.8); return;
  }
  if (w) msg(wallLabel(w.cell), '', 1800);
}
function decoLabel(e) { return e.label || ({ oak: 'An iron-bark oak. When the wind moves it, it rings like bronze.', lamp: 'A hush-lamp. Its reed-whistle never lets the street go silent.', crates: 'Crates, iron-banded.', bones: 'Bones, and a torn cloth. A hound\'s bed: no sound carries here.', pump: 'A steam pump. Hollows work these.', bed: 'A straw bed.', table: 'A table.', shelf: 'Shelves of ledgers and jars.', hearth: 'A hearth, kept low.', chair: 'A chair with a sap-mark chalked on it.', sign: 'A signpost. The boards have been scraped blank.', grate: 'The tannery culvert. Beyond it, the Hedge. At the dead hour, it speaks.', lever: 'A sluice lever. It is chained.', bore: 'The bore.', cores: 'Crates of glass cores.', burlsick: 'One of the burl-sick. Roots in the skin. They do not see you.' })[e.sprite] || 'Something.'; }
function wallLabel(cell) { return ({ t_hedge: 'The Hedge. Three men deep of thorn and packed wool.', t_glassrock: 'Rock veined with green-gold glass. It is faintly warm, and it hums.', t_marble: 'Old marble.', t_brass: 'Riveted brass. Verdigris.', t_house: 'Plaster and oak timber.', t_wood: 'Old planks.', t_stone: 'Cold stone.', t_door: 'A door.' })[cell.tex] || 'A wall.'; }
function pickUp(e) {
  const it = ITEMS[e.item]; e.hidden = true; e.dead = true; Audio_.sfx.pickup();
  if (e.item === 'sovereigns') { const n = rndi(4, 14); G.gold(n); msg(`You find ${n} sovereigns.`, 'good'); return; }
  if (e.item === 'pellets') { G.player.pellets += 3; msg('You find three pellets of glass shot.', 'good'); return; }
  G.give(e.item); msg(`You take the ${it.name}.`, 'good');
  if (e.item === 'coil') journal('main', 'I have the reverse-phase coil from Depot Three. Kaelen wants it brought to his hut outside the Hedge.');
}
function useItem(slot) {
  const it = ITEMS[slot.id], p = G.player;
  if (it.use === 'heal') { p.hp = Math.min(p.hpMax, p.hp + it.n); G.take(slot.id); msg('Honey, raw egg and willow-bark. You feel a little less like dying.', 'good'); }
  else if (it.use === 'voice') { p.voice = Math.min(p.voiceMax, p.voice + it.n); G.take(slot.id); msg('The honey eases your throat.', 'good'); }
  else if (it.use === 'ammo') { p.pellets += it.n; G.take(slot.id); msg('You load three pellets.', 'good'); }
  else if (it.use === 'whistle') { G.whistleT = 25; G.stillT = 0; msg('You blow the reed-whistle. A thin, steady note the hounds do not care for and the Hush cannot get past.', 'good'); Audio_.sfx.song(1760, 0.6); }
  else if (it.use === 'bottle') { G.take(slot.id); closeModal(); G.state = 'play'; msg('You unstop the bottle. A woman\'s voice says, very clearly, "Tell Merret the tide\'s wrong." Then the hounds come.', 'bad', 7000); Audio_.sfx.voice(); addNoise(6); setTimeout(spawnHound, 800); setTimeout(spawnHound, 1600); return; }
  else msg(it.desc, '', 6000);
  renderInventory();
}
function useDeco(e) {
  if (e.use === 'crates') {
    if (!G.flags.crates_heard) { G.flags.crates_heard = true; ['Annet Sowerby', 'Corwin Aye', 'Mirren Salk'].forEach(n => G.ledger.push({ name: n, where: 'Hetty\'s cellar', day: G.day })); }
    showEvent('The crates in the cellar', 'You put your ear to the wood. Thirty-six lilac spheres, you would guess by the weight, each in its straw. For a long moment nothing. Then, very small, through the side of the crate: <i>"Is somebody there? I\'m Annet. Annet Sowerby. I\'m six. What\'s your name?"</i><br><br>You do not answer. You have learned that much. From further in, two more voices, each saying only a name, over and over, the way a person says a thing they are afraid of losing: Corwin Aye. Mirren Salk.', [{ t: 'Step away from the crates', f: () => { journal('side', 'The corsair\'s crates in Hetty\'s cellar hold glass cores. One of them is a six-year-old called Annet Sowerby. I wrote the names in my ledger.'); } }]);
    Audio_.sfx.voice();
  } else if (e.use === 'bore') {
    if (G.flags.bore_broken) { msg('The bit is snapped. The Root is drinking the reservoir, and growing.', 'warn'); return; }
    if (G.flags.bore_seated) { msg('The coil is seated. Hold the room until the lock throws.', 'warn'); return; }
    if (!G.has('coil')) { msg('The casing has a lock, a brass socket the size of a fist, that wants a coil you do not have.', 'warn', 5000); return; }
    G.flags.bore_seated = true; G.take('coil'); Audio_.sfx.song(174, 3);
    showEvent('The Siphon Casing', 'You seat the reverse-phase coil in the lock. For three seconds nothing happens, and in those three seconds you hear, under the grinding, what is under the grinding: five notes, a Cantor\'s lullaby, held by something so tired it keeps losing the tune.<br><br>Then the lock throws. The whole casing drops a quarter-tone. Somewhere above, a woman in white begins to sing the falling fifth against the bore, and the Root turns toward her voice like a face.<br><br>From the boiler galleries, steam. The golems are coming to the noise.', [{ t: 'Hold the room', f: () => { startBoreFight(); } }]);
  }
}
function startBoreFight() {
  const cs = G.map.casingRoom; const spots = [[cs.x + 0.8, cs.y + 0.8], [cs.x + cs.w - 0.8, cs.y + cs.h - 0.8], [cs.x + 0.8, cs.y + cs.h - 0.8]];
  G.boreGolems = 0; G.boreHold = 75;
  for (const [x, y] of spots.slice(0, 2)) { const e = hydrate({ kind: 'enemy', type: 'golem', x, y }); e.state = 'chase'; e.onDeath = () => { G.boreGolems--; if (G.boreGolems <= 0) finishBore(); }; G.boreGolems++; G.ents.push(e); }
  Audio_.sfx.golem(); journal('main', 'The coil is seated and the lock has thrown. Steam Golems have come to the casing. I must hold the room until the bit snaps.');
}
function finishBore() {
  if (G.flags.bore_broken) return; G.boreHold = 0;
  G.flags.bore_broken = true; G.flags.greening = true; Audio_.sfx.crack(); fx('green', 2500);
  G.maps.oakhaven = buildOakhaven(true);
  G.escapeTimer = 300;
  showEvent('The Greening', 'The bit snaps. You hear it go, a sound like a bell dropped down a well.<br><br>Then, from a speaking-tube on the wall, the Governor\'s voice, counting down a purge: <i>"...three. Two. For Oakhaven."</i> The reservoir dumps forty thousand gallons into an open wound. The Root drinks it. And screams. And cracks. And begins to grow.<br><br>Leaves are coming up the shaft behind you. The oaks in the town above are doubling and ringing. The Drift-Kestrel is at the mooring mast, and she takes children first, four to a line.', [{ t: 'Get out', f: () => { journal('main', 'The bit is snapped and the Root is Greening. Oakhaven is going under in an hour. I must climb — the shaft, the headframe, the North Gate — and reach the mooring mast on the east side of the square before the oaks close over it.'); msg('GET OUT. Up the shaft, up the headframe, through the gate, to the mooring mast.', 'bad', 9000); } }]);
}

// ---------------------------------------------------------------- events & triggers
function showEvent(title, html, choices) {
  G.state = 'event'; const p = $('#event-panel');
  p.innerHTML = `<h2>${title}</h2><p>${html}</p><div class="list" style="margin-top:1cqh">${choices.map((c, i) => `<button class="dfbtn" data-i="${i}">${c.t}</button>`).join('')}</div>`;
  show('#event');
  p.querySelectorAll('button').forEach(b => b.onclick = () => { hide('#event'); G.state = 'play'; G.keys = {}; const ch = choices[+b.dataset.i]; if (ch.f) ch.f(); });
}
function checkTriggers() {
  const c = Engine.cam;
  for (const t of G.map.triggers) {
    if (dist2(c.x, c.y, t.x, t.y) > t.r * t.r) { t.inside = false; continue; }
    if (t.inside) continue; t.inside = true;
    if (t.id === 'hound_bed' && !t.done) { t.done = true; msg('A hound\'s bed. Twenty paces across, and no sound carries over it for a day. Your own footsteps arrive by bone.', 'warn', 6000); }
    if (t.id === 'hedge_voice' && !t.done) {
      t.done = true; Audio_.sfx.voice();
      const who = G.flags.bio_brother ? 'your brother\'s' : (G.flags.bio_coast ? 'a first mate you once left in the water' : 'someone you buried');
      showEvent('A voice beyond the Hedge', `From the culvert, from the far side of three men\'s depth of thorn and wool, a voice you know says your name. <i>"${G.player.name}."</i> It is ${who} voice. It gets it exactly right, the way it used to say it when you were in trouble.<br><br><i>"There\'s a way through. I can show you. Just say you\'re there."</i>`, [
        { t: 'Say nothing. Never answer a voice you cannot see.', f: () => { G.flags.hedge_silent = true; msg('You say nothing. After a while it tries Lyra\'s voice, and then a child\'s, and then it stops.', 'warn', 7000); journal('side', 'Something in the Hedge by the tannery culvert spoke to me in a voice I knew. I did not answer.'); } },
        { t: 'Answer it. Just once.', f: () => { G.flags.hedge_answered = true; addNoise(5); msg('"I\'m here," you say. The voice laughs, warmly, and says it again — in your voice, this time. Something has learned you.', 'bad', 8000); journal('side', 'I answered the voice in the Hedge. It said my name back to me in my own voice. It knows me now, and it can follow a voice anywhere.'); setTimeout(() => { for (let i = 0; i < 3; i++) spawnHound(); }, 1200); } },
        { t: 'Stand and listen, and say nothing.', f: () => { G.flags.hedge_listened = true; msg('You listen. Under the voice, if you hold very still, there is a second sound: a great many people, very far down, all saying different things at once.', 'voice', 8000); } },
      ]);
    }
    if (t.id === 'mast') {
      if (!G.flags.greening) { if (!t.said) { t.said = true; msg('The Drift-Kestrel hangs from the mast, her lift-tanks murmuring. Six feet of rope coil on the deck. Nobody is aboard who will talk to you yet.', '', 6000); } continue; }
      if (G.flags.hedge_answered && !G.flags.wearer_spawned) {
        G.flags.wearer_spawned = true; Audio_.sfx.voice();
        const e = hydrate({ kind: 'enemy', type: 'wearer', x: c.x + Math.cos(c.dir) * 3, y: c.y + Math.sin(c.dir) * 3 }); e.state = 'chase'; e.onDeath = () => { G.flags.wearer_dead = true; msg('It bursts, and everything it ever ate comes out at once, ending with a voice getting louder as they took him, so the house would be further away.', 'voice', 9000); setTimeout(ending, 2500); }; G.ents.push(e);
        msg('Between you and the rope, something that sounds exactly like you says: "Grab the line." It followed your voice here.', 'bad', 8000);
        continue;
      }
      if (G.flags.hedge_answered && !G.flags.wearer_dead) continue;
      ending();
    }
  }
}

// ---------------------------------------------------------------- death & ending
function die(src) {
  if (G.dead) return; G.dead = true; G.state = 'dead'; G.player.hp = 0;
  const t = $('#death-title'), x = $('#death-text');
  if (src === 'heartglass') { t.textContent = 'Heartglass.'; x.textContent = 'The glass reaches your heart. You hear the Chorister clearly now, every note of its lullaby, and you understand that it has been singing to you the whole time. You stand very still. You will stand there a long time, humming, alive and aware.'; }
  else if (src === 'unwrite') { t.textContent = 'Too still.'; x.textContent = 'You lost warmth first, then your name, then your outline. Something leaned in through the thin place and took you the way it takes everything: slowly, consciously, without end.'; }
  else if (src === 'greening') { t.textContent = 'The oaks close over.'; x.textContent = 'You hear the ship lift without you. Three hundred and eighty people stand in the mud and wave it away, and you are one of them, and then you are a tree.'; }
  else { t.textContent = 'You have been found.'; x.textContent = `${src} has you. The last thing you hear is your own voice, coming from somewhere else, saying your name.`; }
  show('#death');
}
$('#btn-wake').onclick = () => {
  hide('#death'); G.dead = false; G.state = 'play'; const p = G.player; p.hp = Math.ceil(p.hpMax * 0.6); p.voice = Math.ceil(p.voiceMax * 0.5); p.gold = Math.max(0, p.gold - 5);
  if (p.glass >= 100) p.glass = 85;
  for (const e of G.ents) if (e.kind === 'enemy' && !e.dead && e.state === 'chase') { e.state = 'idle'; e.x = e.homeX; e.y = e.homeY; }
  if (G.escapeTimer > 0) G.escapeTimer = Math.max(G.escapeTimer, 150);
  const s = G.map.spawn; Engine.cam.x = s.x; Engine.cam.y = s.y; Engine.cam.dir = s.dir; G.stillT = 0; G.noise = 2;
  msg('You wake by the lamp. Somebody dragged you. Nobody will say who.', 'warn', 6000);
};
function ending() {
  if (G.state === 'ending') return; G.state = 'ending'; G.runs++;
  const p = G.player, f = G.flags; const names = G.ledger.length;
  const lines = [];
  lines.push(`The mooring mast is taken by a tree. Mags cuts you free. Vane turns the Kestrel toward the town instead of away, and the children come up the rope four to a line${f.vane_told ? ', because you made him hear what was in his hold, and a man who has heard it does not fly away from children' : ''}.`);
  lines.push(`On the last load the Governor is at the bottom, because he has been loading his town onto that rope for twenty minutes. The line snags in a crown. Vane counts to ten. Aldric Vance looks up and waves you on. "Do it," says Kaelen. Six feet of cut rope will hang from the drum for four days.`);
  if (f.hedge_answered) lines.push(`Behind you, where the thing that wore your voice burst, there is a patch of ground where no sound will carry for a day. You will hear your own name in the wrong mouth for the rest of your life, and you will know it is your fault, and you will be right.`);
  else if (f.hedge_silent) lines.push(`At the Hedge, as the ship lifts, something speaks to the town in the voices of its dead and offers a way through. You said nothing when it spoke to you. You wonder, every night after, who answered.`);
  if (f.boots_delivered) lines.push(`Lyra sang Orla Hale down proper, all the lines, even the fourth, while the tree closed over her. The boots were on the chair. You put them there.`);
  if (G.has('charts')) lines.push(`Tobiah Marsh's charts are in your shirt, with Revision Seven and the margin: on failure of the hold, slippage is to be absorbed by the source. Kaelen reads it twice and says nothing for an hour. Then he starts a list of names on a deck-beam.`);
  if (names > 0) lines.push(`You have ${names} name${names === 1 ? '' : 's'} in your ledger${names >= 6 ? ', which is more than most people carry out of the Reach alive' : ''}. ${names >= 3 ? 'Annet Sowerby, six years old, is in the hold, in a crate, in her straw, and she is not lost. She is filed. There is a scribe at Whisper-Grove who knows how to read a name back.' : 'Everyone who ever kept such a list before you was the Catalogue. You intend to be something else.'}`);
  if (p.glassed) lines.push(`Your tideline is ${p.glass >= 70 ? 'past the collarbone, three inches from the throat' : 'four and a half fingers from the shoulder'}. ${p.glass >= 70 ? 'Six weeks, at the current rate.' : 'Eight weeks of slack, perhaps.'} Somewhere in the glass a hundred-and-forty-year-old man is listening to everything you say, and tonight, for the first time, his argument sounds to you like mercy.`);
  lines.push(`Three hundred and eighty people stand in the mud and wave the ship away. The Kestrel leaps a hundred and fifty feet, and from four miles back a whole voice sings the calling-song after you. The course is set west-south-west, for the Rust Coast, which is the one place the captain swore never to go.`);
  lines.push(`<span class="muted">Here ends The Silenced Province. ${G.runs > 1 ? `The Tide-Weaver notes that this is the ${['second', 'third', 'fourth', 'fifth'][Math.min(3, G.runs - 2)]} thread he has watched you walk. "It is still kind," he says.` : 'The Tide-Weaver has watched this thread before. He does not say so.'}</span>`);
  $('#ending-text').innerHTML = lines.map(l => `<p>${l}</p>`).join('');
  show('#ending'); Audio_.setScene('inside');
}
$('#btn-again').onclick = () => { hide('#ending'); show('#title'); G.state = 'title'; };

// ---------------------------------------------------------------- dialogue
const DLG = { npc: null, tone: 'normal', log: [] };
function talk(e) {
  if (e.id === 'hollow') { msg(`The Hollow repeats, to no one: "${e.lines[rndi(0, e.lines.length - 1)]}"`, 'voice', 5000); return; }
  const n = NPCS[e.id]; if (!n) return;
  DLG.npc = n; DLG.ent = e; DLG.log = []; G.state = 'dialogue'; Audio_.sfx.ui();
  const q = n.quest ? n.quest(G) : null;
  if (q) { DLG.log.push({ who: 'them', t: q.text }); if (q.journal) journal(q.journal[0], q.journal[1]); }
  else DLG.log.push({ who: 'them', t: n.greet[DLG.tone] });
  renderDialogue();
}
function renderDialogue(mode) {
  const n = DLG.npc;
  const html = `<h2>${n.name.split(',')[0]}</h2><div class="dlg"><div class="port"><img src="img/p_${n.portrait}.jpg" alt=""><div class="name">${n.name}</div></div>
  <div class="col"><div class="log" id="dlg-log">${DLG.log.map(l => `<div class="${l.who}">${l.who === 'you' ? '— ' : ''}${l.t}</div>`).join('')}</div>
  <div class="btns"><button class="dfbtn small ${mode === 'tell' ? 'sel' : ''}" id="d-tell">Tell me about…</button><button class="dfbtn small ${mode === 'where' ? 'sel' : ''}" id="d-where">Where is…</button>
  <span class="tone">${['polite', 'normal', 'blunt'].map(t => `<button class="dfbtn small ${DLG.tone === t ? 'sel' : ''}" data-t="${t}">${t[0].toUpperCase() + t.slice(1)}</button>`).join('')}</span>
  <button class="dfbtn small" id="d-bye">Goodbye</button></div>
  <div class="topics" id="d-topics">${mode === 'tell' ? TOPIC_KEYS.map(t => `<button class="dfbtn small" data-topic="${t}">${t}</button>`).join('') : mode === 'where' ? Object.keys(PLACES).map(t => `<button class="dfbtn small" data-place="${t}">${t}</button>`).join('') : ''}</div></div></div>`;
  openModal(html, 'dialogue');
  const log = $('#dlg-log'); log.scrollTop = log.scrollHeight;
  $('#d-tell').onclick = () => renderDialogue(mode === 'tell' ? null : 'tell');
  $('#d-where').onclick = () => renderDialogue(mode === 'where' ? null : 'where');
  $('#d-bye').onclick = () => { closeModal(); G.state = 'play'; };
  document.querySelectorAll('.tone button').forEach(b => b.onclick = () => { DLG.tone = b.dataset.t; renderDialogue(mode); });
  document.querySelectorAll('[data-topic]').forEach(b => b.onclick = () => { askTopic(b.dataset.topic); renderDialogue('tell'); });
  document.querySelectorAll('[data-place]').forEach(b => b.onclick = () => { askPlace(b.dataset.place); renderDialogue('where'); });
}
function askTopic(t) {
  const n = DLG.npc, p = G.player; DLG.log.push({ who: 'you', t: `Tell me about ${t}.` });
  const pers = p.attrs.Personality;
  if (DLG.tone === 'blunt' && Math.random() < 0.45 - pers / 300) { DLG.log.push({ who: 'them', t: ['Lower your voice and ask me again like a person.', 'I have nothing to say to that tone.', 'No.'][rndi(0, 2)] }); return; }
  let ans = n.topics[t];
  if (!ans) {
    const tier = (n.tier === 'high' || (DLG.tone === 'polite' && pers >= 55 && Math.random() < 0.6)) ? 'high' : 'low';
    ans = TOPICS[t][tier];
    if (n.rumour && Math.random() < 0.35) ans = 'I couldn\'t say. But I\'ll tell you what I heard: ' + RUMOURS[rndi(0, RUMOURS.length - 1)];
  }
  if (DLG.tone === 'polite' && Math.random() < 0.3) ans += ' ' + ['Blessings of the Narrow on you.', 'Keep your voice low, friend.', 'Mind how you go.'][rndi(0, 2)];
  DLG.log.push({ who: 'them', t: ans });
  // quest-relevant tells
  if (t === 'Kaelen Vance' && !G.flags.need_gate && G.flags.lyra_met) { G.flags.need_gate = true; }
}
const PLACE_POS = { tavern: [29.5, 17.5], lyra_house: [21.5, 29.5], greenhall: [30.5, 9.5], surgery: [17.5, 15.5], gate: [23.5, 1.5], mast: [36.5, 22.5], orla_house: [29.5, 40.5], culvert: [23.5, 42.5] };
function askPlace(place) {
  const key = PLACES[place]; const [tx, ty] = PLACE_POS[key]; DLG.log.push({ who: 'you', t: `Where is ${place}?` });
  let from = [Engine.cam.x, Engine.cam.y], pre = '';
  if (G.mapId !== 'oakhaven') {
    const door = Object.values(G.maps.oakhaven.cells).find(c => c && c.portal && c.portal.map === G.mapId);
    if (G.mapId === 'tavern' || G.mapId === 'lyra_house' || G.mapId === 'greenhall' || G.mapId === 'surgery' || G.mapId === 'orla_house') { const idx = G.maps.oakhaven.cells.indexOf(door); from = [idx % 46 + 0.5, (idx / 46 | 0) + 0.5]; pre = 'Out the door, then '; }
    else { DLG.log.push({ who: 'them', t: 'That is in Oakhaven. You are a long way from Oakhaven.' }); return; }
  }
  const dx = tx - from[0], dy = ty - from[1]; const d = Math.sqrt(dx * dx + dy * dy);
  const ang = Math.atan2(dy, dx); const dirs = ['east', 'south-east', 'south', 'south-west', 'west', 'north-west', 'north', 'north-east'];
  const dname = dirs[((Math.round(ang / (Math.PI / 4)) % 8) + 8) % 8];
  const paces = Math.round(d * 6);
  const t = d < 2 ? `You are standing at it.` : `${pre}${dname}${pre ? '' : ' of here'}, about ${paces} paces. ${d > 12 ? 'Follow the cobbles; keep your voice down past the oaks.' : 'You cannot miss it.'}`;
  DLG.log.push({ who: 'them', t: t.charAt(0).toUpperCase() + t.slice(1) });
}

// ---------------------------------------------------------------- panels
function renderInventory() {
  const p = G.player;
  const rows = p.inv.map((s, i) => { const it = ITEMS[s.id]; return `<tr><td>${it.name}${s.n > 1 ? ` ×${s.n}` : ''}</td><td class="muted">${it.desc}</td><td class="n">${it.use ? `<button class="dfbtn small" data-use="${i}">Use</button>` : ''}</td></tr>`; }).join('');
  const weps = p.weapons.map((w, i) => `<button class="dfbtn small ${i === p.weapon ? 'sel' : ''}" data-w="${i}">${i + 1}. ${WEAPONS[w].name}</button>`).join('');
  openModal(`<h2>Inventory</h2><button class="dfbtn small close" id="x">Close</button><p class="muted">${p.gold} sovereigns · ${p.pellets} glass pellets · Fatigue ${Math.round(p.fat)}/${p.fatMax}</p><h3>Weapons</h3><div class="btns">${weps}</div><h3>Carried</h3><table>${rows || '<tr><td class="muted">Nothing but the clothes you came in.</td></tr>'}</table>`, 'inv');
  $('#x').onclick = closeModal;
  document.querySelectorAll('[data-use]').forEach(b => b.onclick = () => useItem(p.inv[+b.dataset.use]));
  document.querySelectorAll('[data-w]').forEach(b => b.onclick = () => { p.weapon = +b.dataset.w; renderInventory(); });
}
function renderCharacter() {
  const p = G.player; const stage = p.glass >= 100 ? 'Heartglass' : p.glass >= 40 ? 'Set' : p.glass >= 15 ? 'Frost' : p.glass > 0 ? 'Ringing' : 'Unglassed';
  openModal(`<h2>${p.name}</h2><button class="dfbtn small close" id="x">Close</button><div class="row"><div class="col" style="flex:0 0 18cqw"><img src="img/face_${p.face}.jpg" style="width:16cqw;height:16cqw;border:2px solid #0b0806"><p class="muted">${p.cls.name}<br>Level ${p.level} · ${p.xp} xp<br>${p.cls.hz}</p></div>
  <div class="col"><div class="attrs">${ATTRS.map(a => `<div><span>${a}</span><b>${p.attrs[a]}</b></div>`).join('')}</div>
  <h3>Vitals</h3><div>Health ${Math.ceil(p.hp)} / ${p.hpMax}</div><div class="bar-h"><i style="width:${100 * p.hp / p.hpMax}%;background:var(--red)"></i></div>
  <div>Fatigue ${Math.round(p.fat)} / ${p.fatMax}</div><div class="bar-h"><i style="width:${100 * p.fat / p.fatMax}%;background:var(--green)"></i></div>
  <div>Voice ${Math.round(p.voice)} / ${p.voiceMax}</div><div class="bar-h"><i style="width:${100 * p.voice / p.voiceMax}%;background:var(--blue)"></i></div>
  ${p.glassed ? `<div>Glassing — ${stage} (${Math.round(p.glass)}%)</div><div class="bar-h"><i style="width:${p.glass}%;background:#6fd6e0"></i></div>` : ''}
  ${p.fragments ? `<div>Identity fragments left: ${p.fragments}</div>` : ''}
  <p class="muted">Kills ${p.kills} · Names kept ${G.ledger.length} · ${p.gold} sovereigns</p></div></div>`, 'char');
  $('#x').onclick = closeModal;
}
function renderLog() {
  const main = G.journal.filter(j => j.cat === 'main'), side = G.journal.filter(j => j.cat === 'side');
  const fmt = (j) => `<p><span class="muted">${DAYS[j.day % 8]} —</span> ${j.text}</p>`;
  openModal(`<h2>Logbook</h2><button class="dfbtn small close" id="x">Close</button><p class="muted">${DAYS[G.day % 8]}, autumn, 419 SR · ${timeName()}</p><h3>The Rite</h3>${main.map(fmt).join('')}<h3>Other matters</h3>${side.map(fmt).join('') || '<p class="muted">Nothing yet.</p>'}`, 'log');
  $('#x').onclick = closeModal;
}
function renderLedger() {
  openModal(`<h2>The Ledger</h2><button class="dfbtn small close" id="x">Close</button><p class="muted">Every Carillon Legionnaire dies saying a name. Whoever keeps the list, keeps them.</p>
  <table>${G.ledger.map((l, i) => `<tr><td class="n">Entry ${i + 1}</td><td>${l.name}</td><td class="muted">${l.where}, ${DAYS[l.day % 8]}</td></tr>`).join('') || '<tr><td class="muted">No entries. You have not yet been close enough to a bell when it stopped.</td></tr>'}</table>`, 'ledger');
  $('#x').onclick = closeModal;
}
function renderSongs() {
  const p = G.player;
  openModal(`<h2>Song-book</h2><button class="dfbtn small close" id="x">Close</button><p class="muted">Voice ${Math.round(p.voice)} / ${p.voiceMax}. Every song is sound, and sound is the predator's sense. Cast with F1–F${p.songs.length}.</p>
  <table>${p.songs.map((s, i) => `<tr><td class="n">F${i + 1}</td><td><b style="color:var(--gold)">${SONGS[s].name}</b> <span class="muted">${SONGS[s].hz ? SONGS[s].hz + ' Hz' : 'under the breath'}</span><br><span class="muted">${SONGS[s].desc}</span></td><td class="n">${SONGS[s].cost} voice<br>${'♪'.repeat(Math.ceil(SONGS[s].noise))}<br><button class="dfbtn small" data-s="${s}">Sing</button></td></tr>`).join('')}</table>`, 'songs');
  $('#x').onclick = closeModal;
  document.querySelectorAll('[data-s]').forEach(b => b.onclick = () => { closeModal(); G.state = 'play'; castSong(b.dataset.s); });
}
function renderRest() {
  const lampNear = G.ents.some(e => e.sprite === 'lamp' && !e.hidden && dist2(e.x, e.y, Engine.cam.x, Engine.cam.y) < 12) || G.mapId.includes('house') || G.mapId === 'tavern';
  openModal(`<h2>Rest</h2><button class="dfbtn small close" id="x">Close</button><p class="q">Every rest asks who holds the line tonight.</p><p class="muted">${G.map.siphoned ? 'This is siphoned country. A sleeper who goes truly silent is a door left open.' : lampNear ? 'There is a hush-lamp burning. Its reed will not let the room go silent.' : 'No lamp near. The night will be very quiet.'}</p>
  <div class="list"><button class="dfbtn" data-r="self">I hold the line myself <small class="muted">— half rest. If something comes, you hear it.</small></button>
  <button class="dfbtn" data-r="lamp" ${lampNear ? '' : 'disabled'}>Trust the lamp <small class="muted">— full rest, if a lamp is near.</small></button>
  <button class="dfbtn" data-r="dark">Let the dark take the watch <small class="muted">— full rest. ${G.map.siphoned ? 'Something will lean in, and take a little.' : 'You will sleep deeply, and loudly.'}</small></button></div>`, 'rest');
  $('#x').onclick = closeModal;
  document.querySelectorAll('[data-r]').forEach(b => b.onclick = () => { closeModal(); G.state = 'play'; doRest(b.dataset.r); });
}
function doRest(kind) {
  const p = G.player; const hours = kind === 'self' ? 4 : 8;
  advanceTime(hours);
  if (kind === 'self') { p.hp = Math.min(p.hpMax, p.hp + p.hpMax * 0.5); p.voice = Math.min(p.voiceMax, p.voice + p.voiceMax * 0.5); p.fat = p.fatMax; msg(`You rest four hours with your back to the wall and your hand on your weapon.`, 'good'); if (G.map.danger > 0 && Math.random() < 0.35) { msg('Something came to the fire while you dozed.', 'bad'); spawnHound(); spawnHound(); } }
  else if (kind === 'lamp') { p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = p.fatMax; msg('You sleep eight hours under the reed-whistle. Nothing comes.', 'good'); }
  else { p.hp = p.hpMax; p.voice = p.voiceMax; p.fat = p.fatMax; if (G.map.siphoned) { p.hpMax = Math.max(8, p.hpMax - 3); p.hp = p.hpMax; msg('You slept like the dead, and the dead do not keep the Narrow. Something leaned in and took a little. You are a little less than you were.', 'bad', 8000); } else { msg('You sleep deeply, and snore, and in the morning the hush-lamp has burned out and nobody will say what they heard.', 'warn'); if (G.map.danger > 0) { spawnHound(); } } }
  G.noise = 2; G.stillT = 0;
}
function advanceTime(hours) { G.tod += hours / 24; while (G.tod >= 1) { G.tod -= 1; G.day++; } }
function timeName() { const h = G.tod * 24; return h < 5 ? 'the dead hour' : h < 7 ? 'before dawn' : h < 12 ? 'morning' : h < 17 ? 'afternoon' : h < 20 ? 'dusk' : 'night'; }
function renderMap() {
  const m = G.map; const cw = 4; const html = `<h2>${m.name}</h2><button class="dfbtn small close" id="x">Close</button><p class="muted">What you have walked. ${m.outdoor ? 'North is up.' : 'The automap remembers where the lamps were.'}</p><canvas id="amap" width="${m.w * cw}" height="${m.h * cw}" style="width:100%;max-height:70cqh;object-fit:contain;image-rendering:pixelated;background:#0a0806;border:2px solid #0b0806"></canvas>`;
  openModal(html, 'map'); $('#x').onclick = closeModal;
  const cv = $('#amap'), cx = cv.getContext('2d');
  for (let y = 0; y < m.h; y++) for (let x = 0; x < m.w; x++) {
    if (!m.visited[y * m.w + x]) continue;
    const c = m.cells[y * m.w + x];
    cx.fillStyle = c ? (c.door ? '#d9a441' : (c.tex === 't_hedge' ? '#2f4a22' : '#7a6a58')) : '#2a2219';
    cx.fillRect(x * cw, y * cw, cw, cw);
  }
  for (const e of G.ents) { if (e.hidden || e.dead) continue; if (!m.visited[(e.y | 0) * m.w + (e.x | 0)]) continue; cx.fillStyle = e.kind === 'npc' ? '#6fa0e0' : e.kind === 'enemy' ? '#d04030' : e.kind === 'item' ? '#e0d060' : null; if (cx.fillStyle && e.kind !== 'deco') cx.fillRect(e.x * cw - 1, e.y * cw - 1, 3, 3); }
  cx.fillStyle = '#fff'; cx.beginPath(); cx.arc(Engine.cam.x * cw, Engine.cam.y * cw, 2.5, 0, 7); cx.fill();
  cx.strokeStyle = '#fff'; cx.beginPath(); cx.moveTo(Engine.cam.x * cw, Engine.cam.y * cw); cx.lineTo(Engine.cam.x * cw + Math.cos(Engine.cam.dir) * 7, Engine.cam.y * cw + Math.sin(Engine.cam.dir) * 7); cx.stroke();
}
function renderHelp() {
  openModal(`<h2>How to play</h2><button class="dfbtn small close" id="x">Close</button><pre class="help">${HELP_TEXT}</pre><h3>The Narrow</h3><p>This world has two predators and you live in the band between them. The amber bar on the HUD is how loud you are. Running, fighting, firing glass shot and singing push it up; above the upper mark, hounds come. Standing still in siphoned country (the quarry, the Root-vault) lets it fall; below the lower mark, the Hush begins to unwrite you. Murmur (<span class="kbd">N</span>) when you need to stand still.</p><p>Never answer a voice you cannot see. Glass shot breaks the Cacophony and does nothing to a quiet. A hound has to be hit with something that rings. Every Legionnaire dies saying a name; keep it.</p>`, 'help');
  $('#x').onclick = closeModal;
}

// ---------------------------------------------------------------- input
const canvas = $('#view');
function canvasPos(ev) { const r = canvas.getBoundingClientRect(); return { x: (ev.clientX - r.left) / r.width * VW, y: (ev.clientY - r.top) / r.height * VH }; }
canvas.addEventListener('contextmenu', e => e.preventDefault());
canvas.addEventListener('mousedown', (ev) => {
  Audio_.init(); Audio_.resume();
  if (G.state !== 'play') return;
  const p = canvasPos(ev);
  if (ev.button === 2 || ev.button === 1) { G.mouse.rdown = true; ev.preventDefault(); return; }
  if (p.y >= VIEW_H) { hudClick(p.x, p.y); return; }
  G.mouse.down = true; G.mouse.sx = p.x; G.mouse.sy = p.y; G.mouse.t = performance.now();
});
window.addEventListener('mouseup', (ev) => {
  if (ev.button === 2 || ev.button === 1) { G.mouse.rdown = false; return; }
  if (!G.mouse.down) return; G.mouse.down = false;
  if (G.state !== 'play') return;
  const p = canvasPos(ev); const dx = p.x - G.mouse.sx, dy = p.y - G.mouse.sy; const len = Math.sqrt(dx * dx + dy * dy);
  if (G.hintKind) { interact(); return; }
  let label = 'thrust';
  if (len > 12) { if (Math.abs(dx) > Math.abs(dy)) label = dx > 0 ? 'slash right' : 'slash left'; else label = dy > 0 ? 'chop down' : 'cut up'; }
  attack(label);
});
window.addEventListener('mousemove', (ev) => {
  if (G.state !== 'play') return;
  if (G.mouse.rdown || (G.mouse.down && performance.now() - G.mouse.t > 220 && Math.abs(ev.movementX) > 0 && false)) { Engine.cam.dir += ev.movementX * 0.0045; Engine.cam.pitch = clamp(Engine.cam.pitch - ev.movementY * 0.25, -40, 40); }
  const p = canvasPos(ev); G.mouse.x = p.x; G.mouse.y = p.y;
});
window.addEventListener('keydown', (ev) => {
  if (ev.target && ev.target.tagName === 'INPUT') return;
  const k = ev.key.toLowerCase(); G.keys[k] = true;
  if (ev.repeat && !['w','a','s','d','arrowup','arrowdown','arrowleft','arrowright','q','shift'].includes(k)) return;
  if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' ', 'tab', 'f1', 'f2', 'f3', 'f4', 'f5'].includes(k)) ev.preventDefault();
  if (G.state === 'play') {
    if (k === 'e' || k === ' ') interact();
    else if (k === 'i') { G.state = 'panel'; renderInventory(); }
    else if (k === 'c') { G.state = 'panel'; renderCharacter(); }
    else if (k === 'l') { G.state = 'panel'; renderLog(); }
    else if (k === 'm') { G.state = 'panel'; renderMap(); }
    else if (k === 'r') { G.state = 'panel'; renderRest(); }
    else if (k === 'k') { G.state = 'panel'; renderLedger(); }
    else if (k === 'tab') { G.state = 'panel'; renderSongs(); }
    else if (k === 'h' || k === '?') { G.state = 'panel'; renderHelp(); }
    else if (k === 'n') castSong('murmur');
    else if (k === 'v') { const m = Audio_.toggleMute(); msg(m ? 'Sound off.' : 'Sound on.', '', 1200); }
    else if (k >= '1' && k <= '4') { const i = +k - 1; if (G.player.weapons[i]) { G.player.weapon = i; msg(`${WEAPONS[G.player.weapons[i]].name}.`, '', 1200); } }
    else if (k.startsWith('f') && k.length === 2 && +k[1] >= 1) { const s = G.player.songs[+k[1] - 1]; if (s) castSong(s); }
    else if (k === '`') { const d = $('#debug'); d.style.display = d.style.display === 'none' || !d.style.display ? 'block' : 'none'; }
  } else if (G.state === 'panel' || G.state === 'dialogue') {
    if (k === 'escape' || (G.state === 'panel' && (k === 'i' && G.openPanel === 'inv' || k === 'c' && G.openPanel === 'char' || k === 'l' && G.openPanel === 'log' || k === 'm' && G.openPanel === 'map' || k === 'k' && G.openPanel === 'ledger' || k === 'tab' && G.openPanel === 'songs' || k === 'h' && G.openPanel === 'help' || k === 'r' && G.openPanel === 'rest'))) { closeModal(); G.state = 'play'; }
  } else if (G.state === 'title' && k === 'enter') $('#btn-new').click();
});
window.addEventListener('keyup', (ev) => { G.keys[ev.key.toLowerCase()] = false; });
window.addEventListener('blur', () => { G.keys = {}; G.mouse.down = false; G.mouse.rdown = false; });

// HUD buttons (canvas coords)
const HUD_BTNS = [
  { x: 48, y: 155, w: 24, h: 11, t: 'CHAR', f: () => { G.state = 'panel'; renderCharacter(); } },
  { x: 74, y: 155, w: 24, h: 11, t: 'INV', f: () => { G.state = 'panel'; renderInventory(); } },
  { x: 100, y: 155, w: 24, h: 11, t: 'SONG', f: () => { G.state = 'panel'; renderSongs(); } },
  { x: 126, y: 155, w: 24, h: 11, t: 'LOG', f: () => { G.state = 'panel'; renderLog(); } },
  { x: 48, y: 168, w: 24, h: 11, t: 'MAP', f: () => { G.state = 'panel'; renderMap(); } },
  { x: 74, y: 168, w: 24, h: 11, t: 'REST', f: () => { G.state = 'panel'; renderRest(); } },
  { x: 100, y: 168, w: 24, h: 11, t: 'NAMES', f: () => { G.state = 'panel'; renderLedger(); } },
  { x: 126, y: 168, w: 24, h: 11, t: 'HELP', f: () => { G.state = 'panel'; renderHelp(); } },
  { x: 48, y: 181, w: 50, h: 11, t: 'MURMUR', f: () => castSong('murmur') },
  { x: 100, y: 181, w: 50, h: 11, t: 'WEAPON', f: () => { const p = G.player; p.weapon = (p.weapon + 1) % p.weapons.length; msg(`${currentWeapon().name}.`, '', 1200); } },
];
function hudClick(x, y) { for (const b of HUD_BTNS) if (x >= b.x && x <= b.x + b.w && y >= b.y && y <= b.y + b.h) { Audio_.sfx.ui(); b.f(); return; } }

// ---------------------------------------------------------------- update
function update(dt) {
  G.time += dt;
  if (G.state !== 'play') return;
  const p = G.player, c = Engine.cam, k = G.keys;
  // time of day: one game hour per 90 real seconds
  G.tod += dt / (90 * 24); if (G.tod >= 1) { G.tod -= 1; G.day++; }
  if (G.fadeT > 0) G.fadeT -= dt;
  // movement
  const running = (k.shift) && p.fat > 0;
  let spd = (2.6 + p.attrs.Speed / 60) * (running ? 1.7 : 1);
  let mx = 0, my = 0;
  if (k.w || k.arrowup) { mx += Math.cos(c.dir); my += Math.sin(c.dir); }
  if (k.s || k.arrowdown) { mx -= Math.cos(c.dir); my -= Math.sin(c.dir); }
  if (k.a) { mx += Math.sin(c.dir); my -= Math.cos(c.dir); }
  if (k.d) { mx -= Math.sin(c.dir); my += Math.cos(c.dir); }
  if (k.q || k.arrowleft) c.dir -= 1.9 * dt;
  if (k.e && false) { }
  if (k.arrowright) c.dir += 1.9 * dt;
  const moving = mx !== 0 || my !== 0;
  if (moving) {
    const l = Math.sqrt(mx * mx + my * my); mx /= l; my /= l;
    moveWithSlide(c, mx * spd * dt, my * spd * dt, null);
    G.bobPhase += dt * (running ? 13 : 9); c.bob = Math.sin(G.bobPhase) * 2;
    if (running) p.fat = Math.max(0, p.fat - dt * 3);
    if (G.time - G.lastStep > (running ? 0.28 : 0.45)) { G.lastStep = G.time; Audio_.sfx.step(); }
  } else { c.bob *= 0.8; p.fat = Math.min(p.fatMax, p.fat + dt * 2); }
  G.map.visited[(c.y | 0) * G.map.w + (c.x | 0)] = 1;
  for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const xx = (c.x | 0) + dx, yy = (c.y | 0) + dy; if (xx >= 0 && yy >= 0 && xx < G.map.w && yy < G.map.h) G.map.visited[yy * G.map.w + xx] = 1; }
  // doors animate
  for (const key in G.map.doors) { const d = G.map.doors[key]; if (d.open !== d.target) d.open = d.target > d.open ? Math.min(d.target, d.open + dt * 1.6) : Math.max(d.target, d.open - dt * 1.6); }
  // timers
  if (G.attack.t > 0) G.attack.t -= dt;
  if (G.song.t > 0) G.song.t -= dt;
  if (G.rootWard > 0) G.rootWard -= dt;
  if (G.glassLock > 0) G.glassLock -= dt;
  if (G.hurtT > 0) G.hurtT -= dt;
  if (G.songFx > 0) G.songFx -= dt;
  p.voice = Math.min(p.voiceMax, p.voice + dt * 0.08);
  updateNarrow(dt, moving, running);
  // entities
  for (const e of G.ents) {
    if (e.kind === 'enemy') enemyUpdate(e, dt);
    else if ((e.kind === 'npc' && e.wander) || (e.kind === 'deco' && e.wander)) {
      e.wanderT -= dt; if (e.wanderT <= 0) { e.wanderT = rnd(2, 6); e.dir = rnd(0, 6.28); e.moving = Math.random() < 0.6; }
      if (e.moving && dist2(e.x, e.y, e.homeX, e.homeY) < 20) { if (!moveWithSlide(e, Math.cos(e.dir) * 0.6 * dt, Math.sin(e.dir) * 0.6 * dt, e)) e.dir += 1.5; } else if (e.moving) { e.dir = Math.atan2(e.homeY - e.y, e.homeX - e.x); moveWithSlide(e, Math.cos(e.dir) * 0.6 * dt, Math.sin(e.dir) * 0.6 * dt, e); }
    } else if (e.kind === 'npc' && e.loop) {
      e.loopT = (e.loopT || 0) + dt; const ph = Math.sin(e.loopT * 0.7); moveWithSlide(e, Math.cos(e.loopT * 0.7) * 0.5 * dt * 1.2, 0, e);
      if (Math.random() < dt * 0.08 && dist2(e.x, e.y, c.x, c.y) < 30) msg(`A Hollow, to no one: "${e.lines[rndi(0, e.lines.length - 1)]}"`, 'voice', 4000);
    }
  }
  checkTriggers();
  if (G.boreHold > 0) { G.boreHold -= dt; if (G.boreHold <= 0) { G.boreHold = 0; if (!G.flags.bore_broken) finishBore(); } }
  // greening clock
  if (G.escapeTimer > 0) { G.escapeTimer -= dt; if (G.escapeTimer <= 0) { G.escapeTimer = 0; die('greening'); } }
  // flicker
  Engine.setFlicker(G.map.outdoor ? 1 : 0.92 + Math.sin(G.time * 11) * 0.03 + Math.sin(G.time * 23.7) * 0.03 + (G.flags.greening && G.mapId === 'rootvault' ? Math.sin(G.time * 3) * 0.1 : 0));
  // hint under crosshair
  const h = Engine.pick(G.ents, 3.2); let hint = '';
  if (h && !h.dead) hint = h.kind === 'npc' ? (NPCS[h.id] ? NPCS[h.id].name : h.name) : h.kind === 'enemy' ? (h.def.name + (h.name && h.def.core ? '' : '')) : h.kind === 'item' ? ITEMS[h.item].name : (h.label || (h.sprite === 'oak' ? 'Iron-bark oak' : h.sprite === 'lamp' ? 'Hush-lamp' : ''));
  else { const w = Engine.pickWall(2.0); if (w && w.cell.door) hint = w.cell.label || (w.cell.portal ? 'A door' : (G.map.doors[w.y * G.map.w + w.x].open > 0.5 ? 'An open door' : 'A closed door')); }
  G.hintKind = (h && !h.dead && (h.kind === 'npc' || h.kind === 'item' || (h.kind === 'deco' && h.use))) ? h.kind : (!h && hint ? 'door' : '');
  if (hint !== G.hint) { G.hint = hint; $('#hint').textContent = hint; }
}

// ---------------------------------------------------------------- HUD
function drawHUD() {
  const ctx = Engine.ctx, p = G.player; if (!p) return;
  const y0 = VIEW_H;
  // weapon overlay
  const w = currentWeapon(); const img = Engine.images[G.song.t > 0 || G.songFx > 0 ? 'fp_hands' : w.img];
  if (img) {
    const sc = 0.5; const iw = img.width * sc, ih = img.height * sc;
    let ax = 0, ay = 0;
    if (G.attack.t > 0) { const f = 1 - G.attack.t / G.attack.dur; const s = Math.sin(f * Math.PI); ax = -s * 60 * (G.attack.dirLabel === 'slash left' ? 1.4 : 0.8); ay = -s * 40 + (G.attack.dirLabel === 'chop down' ? s * 25 : 0); }
    if (G.song.t > 0) { ay = -Math.sin((1 - G.song.t / 0.7) * Math.PI) * 30; }
    const bob = Engine.cam.bob || 0;
    const bx = w.img === 'fp_hands' || G.song.t > 0 || G.songFx > 0 ? VW / 2 - iw / 2 : VW - iw - 10;
    ctx.drawImage(img, bx + ax, VIEW_H - ih + 24 + ay + bob * 1.5, iw, ih);
    if (G.glassLock > 0 && w.type === 'glass') { ctx.fillStyle = 'rgba(80,200,220,0.25)'; ctx.fillRect(bx + ax, VIEW_H - ih + 24 + ay, iw, ih); }
  }
  // crosshair
  ctx.fillStyle = 'rgba(255,240,200,0.7)'; ctx.fillRect(VW / 2 - 1, VIEW_H / 2 + Engine.cam.pitch - 1, 2, 2);
  // hurt / hush vignette are CSS; damage flash on canvas edge
  // bar
  ctx.fillStyle = '#2a2018'; ctx.fillRect(0, y0, VW, VH - y0);
  ctx.fillStyle = '#5a4530'; ctx.fillRect(0, y0, VW, 1); ctx.fillStyle = '#0b0806'; ctx.fillRect(0, y0 + 1, VW, 1);
  // stone texture dots
  ctx.fillStyle = 'rgba(0,0,0,0.18)'; for (let i = 0; i < 60; i++) ctx.fillRect((i * 37) % VW, y0 + 4 + (i * 13) % 44, 2, 1);
  // vital bars
  const bars = [[6, p.hp / p.hpMax, '#b23a2a', 'H'], [14, p.fat / p.fatMax, '#4e8a3a', 'F'], [22, p.voice / p.voiceMax, '#3d6aa8', 'V']];
  for (const [x, f, col] of bars) { ctx.fillStyle = '#000'; ctx.fillRect(x, y0 + 5, 6, 40); ctx.fillStyle = col; const hh = Math.round(40 * clamp(f, 0, 1)); ctx.fillRect(x, y0 + 45 - hh, 6, hh); ctx.fillStyle = '#5a4530'; ctx.fillRect(x - 1, y0 + 4, 8, 1); ctx.fillRect(x - 1, y0 + 45, 8, 1); }
  // the Narrow (noise) bar
  ctx.fillStyle = '#000'; ctx.fillRect(32, y0 + 5, 8, 40);
  const nh = Math.round(40 * G.noise / 10); ctx.fillStyle = G.noise > 7 ? '#e0442a' : G.noise < 1.5 ? '#9aa0b0' : '#d98b2a'; ctx.fillRect(32, y0 + 45 - nh, 8, nh);
  ctx.fillStyle = '#ff6a40'; ctx.fillRect(30, y0 + 45 - 28, 12, 1); // hound mark at 7
  ctx.fillStyle = '#c0c8e0'; ctx.fillRect(30, y0 + 45 - 6, 12, 1); // hush mark at 1.5
  if (p.glassed) { ctx.fillStyle = '#000'; ctx.fillRect(2, y0 + 5, 2, 40); ctx.fillStyle = '#6fd6e0'; const gh = Math.round(40 * p.glass / 100); ctx.fillRect(2, y0 + 45 - gh, 2, gh); }
  // buttons
  ctx.font = '7px "Alegreya SC", serif'; ctx.textBaseline = 'middle'; ctx.textAlign = 'center';
  for (const b of HUD_BTNS) { ctx.fillStyle = '#1a130d'; ctx.fillRect(b.x, b.y, b.w, b.h); ctx.fillStyle = '#5a4530'; ctx.fillRect(b.x, b.y, b.w, 1); ctx.fillRect(b.x, b.y, 1, b.h); ctx.fillStyle = '#0b0806'; ctx.fillRect(b.x, b.y + b.h - 1, b.w, 1); ctx.fillRect(b.x + b.w - 1, b.y, 1, b.h); ctx.fillStyle = '#d9a441'; ctx.fillText(b.t, b.x + b.w / 2, b.y + b.h / 2 + 0.5); }
  // centre: status words
  ctx.fillStyle = '#0e0a07'; ctx.fillRect(156, y0 + 5, 64, 40); ctx.fillStyle = '#5a4530'; ctx.fillRect(156, y0 + 5, 64, 1); ctx.fillRect(156, y0 + 5, 1, 40);
  ctx.font = '8px "Alegreya SC", serif'; ctx.fillStyle = '#d9a441'; ctx.textAlign = 'center';
  const narrow = G.unwriting ? 'UNWRITING' : G.noise > 7 ? 'TOO LOUD' : G.noise < 1.5 ? (G.map.siphoned ? 'TOO STILL' : 'STILL') : G.noise > 4.5 ? 'LOUD' : 'THE NARROW';
  ctx.fillStyle = G.unwriting ? '#c0c8e0' : G.noise > 7 ? '#ff6a40' : '#d9a441'; ctx.fillText(narrow, 188, y0 + 12);
  ctx.fillStyle = '#b8a883'; ctx.font = '7px "Alegreya", serif'; ctx.fillText(w.name + (w.ammo ? ` · ${p.pellets}` : ''), 188, y0 + 23);
  ctx.fillText(`${DAYS[G.day % 8]} · ${timeName()}`, 188, y0 + 33);
  if (G.escapeTimer > 0) { ctx.fillStyle = '#7fe060'; ctx.font = '8px "Alegreya SC", serif'; ctx.fillText(`GREENING ${Math.floor(G.escapeTimer / 60)}:${String(Math.floor(G.escapeTimer % 60)).padStart(2, '0')}`, 188, y0 + 42); }
  else if (G.boreHold > 0) { ctx.fillStyle = '#7fe060'; ctx.font = '8px "Alegreya SC", serif'; ctx.fillText(`HOLD ${Math.floor(G.boreHold / 60)}:${String(Math.floor(G.boreHold % 60)).padStart(2, '0')}`, 188, y0 + 42); }
  else if (G.rootWard > 0) { ctx.fillStyle = '#a9e07a'; ctx.fillText('ROOT NOTE', 188, y0 + 42); }
  else if (G.whistleT > 0) { ctx.fillStyle = '#a9e07a'; ctx.fillText('REED', 188, y0 + 42); }
  // compass strip
  const cx0 = 228, cw = 86; ctx.fillStyle = '#0e0a07'; ctx.fillRect(cx0, y0 + 5, cw, 14); ctx.fillStyle = '#5a4530'; ctx.fillRect(cx0, y0 + 5, cw, 1);
  const heading = Engine.cam.dir + Math.PI / 2; // 0 = north
  ctx.save(); ctx.beginPath(); ctx.rect(cx0, y0 + 5, cw, 14); ctx.clip(); ctx.font = '8px "Alegreya SC", serif';
  const pts = [['N', 0], ['NE', 0.785], ['E', 1.571], ['SE', 2.356], ['S', 3.142], ['SW', 3.927], ['W', 4.712], ['NW', 5.498]];
  for (const [lab, a] of pts) { let rel = normAng(a - heading); if (Math.abs(rel) > 1.6) continue; const x = cx0 + cw / 2 + rel / 1.6 * (cw / 2); ctx.fillStyle = lab.length === 1 ? '#d9a441' : '#7a6a58'; ctx.fillText(lab, x, y0 + 12); for (let t = 1; t < 4; t++) { ctx.fillStyle = '#4a3a2a'; const rx = cx0 + cw / 2 + (rel + t * 0.196) / 1.6 * (cw / 2); ctx.fillRect(rx, y0 + 16, 1, 2); } }
  ctx.restore(); ctx.fillStyle = '#fff1c8'; ctx.fillRect(cx0 + cw / 2, y0 + 5, 1, 14);
  // right-bottom: map name & level
  ctx.textAlign = 'right'; ctx.fillStyle = '#b8a883'; ctx.font = '7px "Alegreya", serif'; ctx.fillText(G.map.name, 314, y0 + 27);
  ctx.fillText(`${p.name} · Lv ${p.level} · ${p.gold} sov.`, 314, y0 + 37);
  if (p.fragments) ctx.fillText(`fragments ${p.fragments}`, 314, y0 + 46);
  ctx.textAlign = 'left';
  // fade-in on map load
  if (G.fadeT > 0) { ctx.fillStyle = `rgba(0,0,0,${clamp(G.fadeT * 2, 0, 1)})`; ctx.fillRect(0, 0, VW, VIEW_H); }
}

// ---------------------------------------------------------------- loop
let last = performance.now(), acc = 0, fpsN = 0, fpsT = 0, fps = 0;
function frame(now) {
  requestAnimationFrame(frame);
  let dt = Math.min(0.1, (now - last) / 1000); last = now; acc += dt;
  while (acc >= 1 / 60) { update(1 / 60); acc -= 1 / 60; }
  render();
  fpsN++; fpsT += dt; if (fpsT >= 1) { fps = fpsN / fpsT; fpsN = 0; fpsT = 0; }
}
function render() {
  if (!G.map) return;
  Engine.render(G.ents, G.tod);
  drawHUD();
  const d = $('#debug'); if (d.style.display === 'block') d.textContent = `FPS ${fps.toFixed(0)} | ${G.mapId} ${Engine.cam.x.toFixed(1)},${Engine.cam.y.toFixed(1)} dir ${Engine.cam.dir.toFixed(2)} | noise ${G.noise.toFixed(1)} still ${G.stillT.toFixed(1)} | ents ${G.ents.length}`;
}
window.advanceTime = (ms) => { const steps = Math.max(1, Math.round(ms / (1000 / 60))); for (let i = 0; i < steps; i++) update(1 / 60); render(); };
window.render_game_to_text = () => {
  const c = Engine.cam, p = G.player;
  return JSON.stringify({ state: G.state, panel: G.openPanel, map: G.mapId, note: 'grid units, x east, y south, dir radians (0=east, +=clockwise)', player: p ? { x: +c.x.toFixed(2), y: +c.y.toFixed(2), dir: +c.dir.toFixed(2), hp: Math.round(p.hp), hpMax: p.hpMax, voice: Math.round(p.voice), noise: +G.noise.toFixed(1), weapon: currentWeapon().name, pellets: p.pellets, gold: p.gold, inv: p.inv.map(s => s.id), glass: p.glass } : null, flags: G.flags, escape: Math.round(G.escapeTimer), ledger: G.ledger.length, hint: G.hint,
    near: G.ents.filter(e => !e.hidden && !e.dead && dist2(e.x, e.y, c.x, c.y) < 64).map(e => ({ k: e.kind, id: e.id || e.type || e.item || e.sprite, x: +e.x.toFixed(1), y: +e.y.toFixed(1), hp: e.hp, st: e.state })).slice(0, 25) });
};

// ---------------------------------------------------------------- boot
(async function boot() {
  await Engine.loadAll((f) => { $('#load-fill').style.width = (f * 100) + '%'; });
  try { await Promise.all(['8px "Alegreya SC"', '8px "Alegreya"', '700 20px "Cinzel"'].map(f => document.fonts.load(f))); await document.fonts.ready; } catch (e) { }
  hide('#loading'); G.state = 'title';
  $('#btn-new').onclick = () => { Audio_.init(); Audio_.resume(); hide('#title'); show('#create'); CREATE.step = 0; renderCreate(); G.state = 'create'; };
  $('#btn-help').onclick = () => { $('#modal-panel').innerHTML = `<h2>How to play</h2><button class="dfbtn small close" id="x">Close</button><pre class="help">${HELP_TEXT}</pre>`; show('#modal'); $('#x').onclick = () => hide('#modal'); };
  document.addEventListener('click', () => { Audio_.init(); Audio_.resume(); }, { once: true });
  requestAnimationFrame(frame);
})();
