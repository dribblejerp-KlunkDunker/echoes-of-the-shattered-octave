// ============================================================
//  callings127 — Phase 127: the callings, part two, "the quarry" (the Catalogue Clerk and the Quarry-Hand). The design is
//  story/Game Layer/Phase 127 - The callings, part two (design, for the builder).md (§3.1, §3.2); the record is
//  story/Game Layer/Phase 127 - The callings, part two.md. Both register in Phase 126's table (CALLINGS126.register): the
//  same sight (drawn on the HUD layer after the frame, hidden behind walls, the Options row "Your calling's sight"), the
//  same act on the use key. Everything here is [PROPOSED] unless a line says it is the book's.
//
//  CATALOGUE CLERK (archivist)
//    Sees: "the serial stamped in the bronze beside it in the Office's blocky numerals" (MS 4828) beside every Legionnaire's
//      grille, legible within three paces; the first name lit above a bell once the name is in your book; a proctor's plate
//      blank, struck through, because proctors surrender "the name and the family" (MS 4411).
//    Does: "Copy it off the bronze": the name into the ledger without breaking the bell. The bell hears you do it, and the
//      Factor reads it back at her morning walk (js/audit54.js BITS.stamp). Never at a proctor, a boss (the Aegis's serial
//      is Sable's, MS 4828), a staged figure, Tamsin Reed (js/tamsin52.js keeps her card), a bell that is hunting you, or in
//      a boot.
//    The serial is a pure function of the name, WG-30,000 to WG-38,999: under every canon entry (39,802 and up), so no bell
//      wears a book person's number.
//  QUARRY-HAND (quarry)
//    Sees: sound and unsound timber on the scaffolds (the sprung leg, and the way the frame will go); the line a glass-rock
//      face would split on ("how to read a face for the line it will split on", js/data.js); the loads a hand could shoulder.
//    Does: "Shoulder it": a crate from a stack in the workings onto your shoulder; at a walk the quarry's Legionnaires and
//      proctors take you for one of the shift (disguiseProtects, as the Synod robes). The bells still count you (BITS.shift).
//      It ends on running, a strike, a song, a hurt, a body, noise 4, leaving the workings, or two minutes. And "Split it on
//      its line" at a resonant seam (the delves' "a heavy blow will crack it").
//
//  No random numbers, never Engine.render, no clock moved from drawing code. Flags (small integers, validated on every
//  load): p127_copied, p127_carried, p127_split; the first sight and first act use Phase 126's p126_seen / p126_did bits 8
//  and 32. Not saved: the load on your shoulder, its timer, the hint per map.
// ============================================================
'use strict';

const CALLINGS127 = (function () {
  const TEXTS = [];
  const S = (t) => { TEXTS.push(t); return t; };
  const C = () => CALLINGS126;
  const hasG = () => typeof G !== 'undefined' && G && G.player && G.flags && G.map;
  const F = () => G.flags;
  const fmt = (t, ...a) => String(t).replace(/\{(\d+)\}/g, (m, i) => (a[+i] != null ? a[+i] : m));
  const say = (t, cls, ms) => { try { msg(String(t).replace(/<\/?i>/g, ''), cls || '', ms || 5200); } catch (e) { /* cosmetic */ } };
  const warned = {};
  const warnOnce = (k, e) => { if (!warned[k]) { warned[k] = true; console.warn('callings127: ' + k + ' failed', e); } };
  const guest = () => { try { return typeof SYNC19 !== 'undefined' && !!SYNC19.isGuest(); } catch (e) { return false; } };
  const inExtra = () => { try { return typeof EXTRAS17 !== 'undefined' && !!EXTRAS17.inExtra(); } catch (e) { return false; } };
  const inBoots = () => { try { return typeof BOOTS125 === 'object' && !!BOOTS125.active(); } catch (e) { return false; } };
  const calling = () => { try { return G.player.cls && G.player.cls.id; } catch (e) { return null; } };
  const sightOn = () => typeof GFX !== 'undefined' && !!GFX.callingSight;
  const clamp = (v, a, b) => (v < a ? a : v > b ? b : v);
  const actsOn = () => hasG() && G.state === 'play' && !inBoots() && !guest() && !inExtra();
  const distTo = (e) => { const c = Engine.cam; return Math.hypot(e.x - c.x, e.y - c.y); };
  const card = (title, body, choices) => { try { showEvent(title, body, choices); } catch (e) { warnOnce('card', e); } };
  const back = () => { try { return C().TX.back; } catch (e) { return 'Step back'; } };
  const liveEnemy = (e) => !!(e && e.kind === 'enemy' && !e.dead && !e.hidden && !e.dying);
  const bossLike = (e) => { try { return C().bossLike(e); } catch (err) { const d = e.def || {}; return !!(d.boss || d.wildsBoss); } };
  const echoWaits = (e) => { try { return C().echoWaits(e); } catch (err) { return false; } };
  const firstAct = (id, line) => { try { C().firstAct(id, line); } catch (e) { warnOnce('firstAct', e); } };
  const hashStr = (s) => { let h = 2166136261; s = String(s || ''); for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619); return (h >>> 0) / 4294967296; };
  const h3 = (a, b, c) => { let h = Math.imul((a * 73856093) ^ (b * 19349663) ^ (c * 83492791), 2654435761) >>> 0; h ^= h >>> 13; h = Math.imul(h, 1274126177) >>> 0; return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };

  // ================================================================ the words (§5 of the design)
  const TX = {
    // Catalogue Clerk
    clerkFirst: S('You stand still and read the room the way the Office taught you to read a page: beside every grille, a number stamped in the bronze.'),
    copyAct: S('Copy it off the bronze'),
    stampTitle: S('The stamp'),
    stampBody: S('Beside the grille, where the core sits, a serial is stamped into the bronze in the Office\'s blocky numerals: {0}. You know the run. You filled in the forms for numbers like it, and the voice inside has just told you the rest.'),
    copyIt: S('Copy it into your book'),
    copied: S('You write it small, in a clerk\'s hand: the number, the name, the place and the day. The bell does not move. It does not need to.'),
    clerkHint: S('E: Copy it off the bronze'),
    jClerk: S('I read the Legion the way I was taught to read a docket: the number in the bronze, and the name the voice inside gives up. I copy them into my own book. The bells hear me do it.'),
    // Quarry-Hand
    quarryFirst: S('You stand still and look the way you were taught to look at a face of stone: where it is sound, where it is sprung, and the line it will split on.'),
    shoulderAct: S('Shoulder it'),
    loadTitle: S('A load'),
    loadBody: S('Crates for the depot, stacked where they were left. A hand with a load on his shoulder is a hand at work, and nobody in the workings looks twice at a hand at work.'),
    shoulderIt: S('Shoulder it, and walk like you are paid to'),
    leaveIt: S('Leave it.'),
    shouldered: S('You get it onto your shoulder the way you did a thousand times down the Flume. It is lighter than a lintel.'),
    setDown: S('You set it down by the drums. Somebody will move it, or nobody will.'),
    dropped: S('You drop the load. Anyone watching has stopped taking you for one of the shift.'),
    tooLong: S('You have walked that crate the length of the workings. A load with nowhere to go stops being work.'),
    quarryHint: S('E: Shoulder it'),
    jQuarry: S('In the workings a hand with a load on his shoulder is a hand at work, and the Legion lets him by. The bells still count him.'),
    split: S('You find the line in the face, set your feet, and hit it once. It splits where you knew it would.'),
    splitAct: S('Split it on its line'),
    shiftNod: S('He looks at your hands, and at your boots, and nods, as if you had been on the next terrace yesterday.'),
  };

  // ================================================================ the flags
  const FLAGS = { p127_copied: 99, p127_carried: 99, p127_split: 9 };
  function validate(f) {
    if (!f || typeof f !== 'object') return;
    for (const k in FLAGS) { const v = f[k]; if (!(typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= FLAGS[k])) f[k] = 0; }
  }
  const flagInt = (k) => { const v = Number(F()[k]); return Number.isInteger(v) && v >= 0 ? v : 0; };
  const bump = (k) => { F()[k] = Math.min(FLAGS[k], flagInt(k) + 1); };
  const st = { carry: null, hintMap: '', hintMapQ: '' };

  // ================================================================ a small pixel font (3x5, code-drawn; a name and a serial are data)
  const GLYPH = {
    '0': [7, 5, 5, 5, 7], '1': [2, 6, 2, 2, 7], '2': [7, 1, 7, 4, 7], '3': [7, 1, 3, 1, 7], '4': [5, 5, 7, 1, 1], '5': [7, 4, 7, 1, 7],
    '6': [7, 4, 7, 5, 7], '7': [7, 1, 2, 2, 2], '8': [7, 5, 7, 5, 7], '9': [7, 5, 7, 1, 7], '-': [0, 0, 7, 0, 0], ',': [0, 0, 0, 2, 4],
    A: [2, 5, 7, 5, 5], B: [6, 5, 6, 5, 6], C: [3, 4, 4, 4, 3], D: [6, 5, 5, 5, 6], E: [7, 4, 6, 4, 7], F: [7, 4, 6, 4, 4], G: [3, 4, 5, 5, 3],
    H: [5, 5, 7, 5, 5], I: [7, 2, 2, 2, 7], J: [1, 1, 1, 5, 2], K: [5, 5, 6, 5, 5], L: [4, 4, 4, 4, 7], M: [5, 7, 7, 5, 5], N: [6, 5, 5, 5, 5],
    O: [2, 5, 5, 5, 2], P: [6, 5, 6, 4, 4], Q: [2, 5, 5, 6, 3], R: [6, 5, 6, 5, 5], S: [3, 4, 2, 1, 6], T: [7, 2, 2, 2, 2], U: [5, 5, 5, 5, 7],
    V: [5, 5, 5, 5, 2], W: [5, 5, 7, 7, 5], X: [5, 5, 2, 5, 5], Y: [5, 5, 2, 2, 2], Z: [7, 1, 2, 4, 7], ' ': [0, 0, 0, 0, 0],
  };
  const textW = (s) => String(s).length * 4 - 1;
  function text(g, x, y, s, col, a) {
    x = Math.round(x); y = Math.round(y); s = String(s).toUpperCase();
    for (let i = 0; i < s.length; i++) {
      const rows = GLYPH[s[i]] || GLYPH[' '];
      for (let r = 0; r < 5; r++) for (let b = 0; b < 3; b++) if (rows[r] & (4 >> b)) g.px(x + i * 4 + b, y + r, 1, 1, col, a);
    }
  }

  // ================================================================ CATALOGUE CLERK: the stamps
  const BRONZE = '#b08a48', RIM = '#140f08', GOLD = '#f0dca0';
  function serialOf(e) {
    const n = 30000 + Math.floor(hashStr(e && (e.name || '')) * 9000);
    return 'WG-' + String(n).replace(/(\d\d)(\d\d\d)$/, '$1,$2');
  }
  const inLedger = (name) => { try { return !!name && G.ledger.some((x) => x && x.name === name); } catch (e) { return false; } };
  const bellSight = (e) => liveEnemy(e) && e.type === 'legionnaire' && !e.transient && !bossLike(e);
  const plateBlank = (e) => liveEnemy(e) && (e.type === 'proctor' || (e.def && e.def.press)) && !bossLike(e);
  function canCopy(e) {
    if (!hasG() || calling() !== 'archivist' || inBoots() || !e) return false;
    if (!bellSight(e) || !e.name || e.name === 'Tamsin Reed' || e.state === 'chase') return false;
    if (distTo(e) > 1.3 || inLedger(e.name)) return false;
    return !echoWaits(e);   // js/dreams.js's first bell echo in a place plays first (Phase 126's lesson)
  }
  function copyRun(e) {
    const n0 = Number(G.noise) || 0;
    const old = 'Stand close, and you can hear someone murmuring inside the bell: "' + (typeof coreMurmur === 'function' ? coreMurmur(e) : '') + '"';   // js/game.js interact's own line, so nothing is lost
    card(TX.stampTitle, old + '<br><br>' + fmt(TX.stampBody, serialOf(e)), [
      { t: TX.copyIt, f: () => {
        if (!inLedger(e.name)) G.ledger.push({ name: e.name, where: G.map.name, day: G.day });
        bump('p127_copied');
        try { if (typeof AUDIT54 === 'object') AUDIT54.log('stamp'); } catch (err) { warnOnce('audit', err); }   // the bell heard you
        G.noise = Math.min(Number(G.noise) || 0, n0);
        say(TX.copied, '', 5500); firstAct('archivist', TX.jClerk);
      } },
      { t: back(), f: null },
    ]);
    G.noise = n0;
    return true;
  }
  C().register('archivist', {
    radius: 6,
    targets(add) {
      for (const e of G.ents) {
        if (bellSight(e)) { add({ e, kind: 'stamp' }); if (e.name && inLedger(e.name)) add({ e, kind: 'name' }); }
        else if (plateBlank(e)) add({ e, kind: 'blank' });
      }
    },
    draw: {
      // the bronze plate beside the grille (MS 4828); within three paces the serial can be read
      stamp(g, t, fade, rec) {
        const s = t.s, w = s.x1 - s.x0, h = s.y1 - s.y0, x = Math.round((s.x0 + s.x1) / 2 + w * 0.14), y = Math.round(s.y0 + h * 0.24), a = fade * 0.95;
        g.px(x - 1, y - 1, 7, 5, RIM, a); g.px(x, y, 5, 3, BRONZE, a); g.px(x, y, 5, 1, '#d8b070', a);
        const ser = serialOf(t.e);
        if (Math.sqrt(t.d2) <= 3) {
          const tx = x + 7, ty = y - 2;
          g.px(tx - 1, ty - 1, textW(ser) + 2, 7, RIM, a * 0.8); text(g, tx, ty, ser, GOLD, a);
          rec.text = ser;
        } else { for (let k = 0; k < 3; k++) g.px(x + 1 + k * 1.5, y + 1, 1, 1, '#4a3418', a); rec.text = null; }
        rec.x = x; rec.y = y; rec.serial = ser;
        return true;
      },
      // a name in your book, lit above its bell
      name(g, t, fade, rec) {
        const s = t.s, nm = String(t.e.name || '').split(/\s+/)[0].toUpperCase().replace(/[^A-Z]/g, '');
        if (!nm) return false;
        const x = Math.round((s.x0 + s.x1) / 2 - textW(nm) / 2), y = Math.round(s.y0 - 7), a = fade;
        text(g, x + 1, y + 1, nm, RIM, a * 0.8); text(g, x, y, nm, GOLD, a);
        rec.text = nm; rec.x = x; rec.y = y;
        return true;
      },
      // a proctor's plate: no number, struck through (MS 4411)
      blank(g, t, fade, rec) {
        const s = t.s, h = s.y1 - s.y0, x = Math.round((s.x0 + s.x1) / 2 - 2), y = Math.round(s.y0 + h * 0.2), a = fade * 0.9;
        g.px(x - 1, y - 1, 7, 5, RIM, a); g.px(x, y, 5, 3, BRONZE, a); g.px(x - 1, y + 1, 7, 1, RIM, a);
        rec.x = x; rec.y = y;
        return true;
      },
    },
    acts: [{ verb: 'copy', can: canCopy, run: copyRun }],
    tick: clerkTick,
    lines: { first: TX.clerkFirst },
  });
  // with the sight hidden: the prompt, once a map, the first time you aim at a bell you could copy
  let hintT = 0;
  function clerkTick(dt) {
    hintT -= dt; if (hintT > 0) return; hintT = 0.25;
    if (sightOn() || st.hintMap === G.mapId) return;
    let e = null; try { e = Engine.pick(G.ents, typeof USE_RANGE === 'number' ? USE_RANGE : 2); } catch (err) { e = null; }
    if (e && canCopy(e)) { st.hintMap = G.mapId; say(TX.clerkHint, 'warn', 4000); }
  }

  // ================================================================ QUARRY-HAND: sound and unsound
  const WOOD = '#c8a870', SPRUNG = '#e0a040', GLASS = '#7fd0a0', IRON = '#9a9aa0';
  const fallen = (e) => { try { const k = e._p12r.k; return !!e._p12r.fall || RIGGING.hasBit(k === 'chand' ? 'p12r_ch' : 'p12r_sc', e._p12r.i, 8); } catch (err) { return false; } };
  const RCFG = () => { try { return RIGGING.CFG || {}; } catch (e) { return {}; } };
  const isLoad = (e) => !!(e && e.kind === 'deco' && e.sprite === 'crates' && !e.use && !e.hidden && !e.dead && !e.transient);
  const hunted = () => { const c = Engine.cam; return G.ents.some((e) => liveEnemy(e) && e.state === 'chase' && (e.x - c.x) ** 2 + (e.y - c.y) ** 2 < 100); };
  // glass-rock faces near you that face you: at most six, nearest first
  const faces = [];
  function seamFaces(max) {
    faces.length = 0;
    const m = G.map, c = Engine.cam, cx = Math.floor(c.x), cy = Math.floor(c.y);
    for (let y = cy - 4; y <= cy + 4; y++) for (let x = cx - 4; x <= cx + 4; x++) {
      const cell = m.get(x, y); if (!cell || cell.door || cell.tex !== 't_glassrock') continue;
      for (const [nx, ny] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        if (m.get(x + nx, y + ny)) continue;   // the face must give onto open ground
        const fx = x + 0.5 + nx * 0.5, fy = y + 0.5 + ny * 0.5;
        if ((c.x - fx) * nx + (c.y - fy) * ny <= 0) continue;   // facing you
        const d = Math.hypot(fx - c.x, fy - c.y); if (d > 3.5) continue;
        faces.push({ x, y, nx, ny, fx, fy, d, res: cell.resonant === true });
      }
    }
    faces.sort((a, b) => a.d - b.d);
    if (faces.length > max) faces.length = max;
    return faces;
  }
  function canShoulder(e) {
    if (!hasG() || calling() !== 'quarry' || G.mapId !== 'quarry' || inBoots() || st.carry || !isLoad(e)) return false;
    return distTo(e) <= 1.6 && !hunted();
  }
  function shoulderRun() {
    card(TX.loadTitle, TX.loadBody, [
      { t: TX.shoulderIt, f: () => { st.carry = { t: 0, heard: false }; bump('p127_carried'); say(TX.shouldered, '', 5000); firstAct('quarry', TX.jQuarry); } },
      { t: TX.leaveIt, f: null },
    ]);
    return true;
  }
  function drop(line) { if (!st.carry) return; st.carry = null; if (line) say(line, line === TX.setDown ? '' : 'warn', 5000); }
  // the cover: the quarry's Legionnaires and proctors let a hand at work by, as js/game.js lets the Synod robes by
  function shiftCover(e) {
    if (!st.carry || !hasG() || G.mapId !== 'quarry' || calling() !== 'quarry') return false;
    let insp = false; try { insp = typeof synodInspector === 'function' && synodInspector(e); } catch (err) { insp = false; }
    return insp && e.state !== 'chase' && !(e.investigation && e.investigation.source === 'body');
  }
  const EARSHOT = () => { try { return AUDIT54.EARSHOT || 7; } catch (e) { return 7; } };
  function carryTick(dt) {
    const k = st.carry; if (!k) return;
    if (G.mapId !== 'quarry' || calling() !== 'quarry') { st.carry = null; return; }
    k.t += dt;
    const p = G.player, base = 2.6 + (Number(p.attrs && p.attrs.Speed) || 0) / 60, sp = G.vel ? Math.hypot(G.vel.x, G.vel.y) : 0;
    const forced = sp > 1.15 * base || (G.attack && G.attack.t > 0) || (G.song && G.song.t > 0) || G.hurtT > 0 || !!G.dragBody || (Number(G.noise) || 0) >= 4;
    if (forced) { drop(TX.dropped); return; }
    if (k.t >= 120) { drop(TX.tooLong); return; }
    if (!k.heard) {   // the bells still count you: the first Legionnaire in earshot with a clear line
      const c = Engine.cam, R = EARSHOT();
      for (const e of G.ents) {
        if (!liveEnemy(e) || e.type !== 'legionnaire' || Math.hypot(e.x - c.x, e.y - c.y) >= R) continue;
        let clear = true; try { clear = typeof los !== 'function' || los(c.x, c.y, e.x, e.y); } catch (err) { clear = true; }
        if (!clear) continue;
        k.heard = true; try { AUDIT54.log('shift'); } catch (err) { warnOnce('audit', err); }
        break;
      }
    }
  }
  let hintQ = 0;
  function quarryTick(dt) {
    carryTick(dt);
    hintQ -= dt; if (hintQ > 0) return; hintQ = 0.25;
    if (sightOn() || st.hintMapQ === G.mapId || st.carry) return;
    let e = null; try { e = Engine.pick(G.ents, typeof USE_RANGE === 'number' ? USE_RANGE : 2); } catch (err) { e = null; }
    if (e && canShoulder(e)) { st.hintMapQ = G.mapId; say(TX.quarryHint, 'warn', 4000); }
  }
  // "Split it on its line": E with nothing in hand's reach but a resonant seam
  function nearUsable() {
    const c = Engine.cam;
    for (const o of G.ents) {
      if (!o || o.hidden || o.dead || (o.kind !== 'item' && !(o.kind === 'deco' && o.use) && o.kind !== 'npc')) continue;
      const d = Math.hypot(o.x - c.x, o.y - c.y); if (d > 1.6 + (o.radius || 0)) continue;
      let a = Math.atan2(o.y - c.y, o.x - c.x) - c.dir; while (a > Math.PI) a -= 2 * Math.PI; while (a < -Math.PI) a += 2 * Math.PI;
      if (Math.abs(a) < 0.8) return true;
    }
    return false;
  }
  function wallEchoWaits() {
    try {
      if (typeof DREAMS !== 'object' || !DREAMS.on()) return false;
      return DREAMS.ECHO_LIST.some((x) => x.trig === 'wall' && x.maps && x.maps.indexOf(G.mapId) >= 0 && !DREAMS.echoSeen(x.id));
    } catch (e) { return false; }
  }
  function trySplit() {
    if (calling() !== 'quarry' || typeof checkResonantWall !== 'function') return false;
    let e = null; try { e = Engine.pick(G.ents, typeof USE_RANGE === 'number' ? USE_RANGE : 2); } catch (err) { e = null; }
    if ((e && !e.dead) || nearUsable()) return false;
    const w = Engine.pickWall(1.8); if (!w || !w.cell || w.cell.resonant !== true) return false;
    if (wallEchoWaits()) return false;   // js/dreams.js's glass-rock echo is heard first (through the game's own wall label)
    if (!checkResonantWall(0)) return false;
    bump('p127_split'); say(TX.split, 'good', 5000);
    return true;
  }
  C().register('quarry', {
    radius: 8,
    targets(add) {
      for (const e of (G.map._p12r || [])) if (e && e._p12r && e._p12r.k === 'scaff' && G.ents.includes(e) && !fallen(e)) add({ e, kind: 'timber' });
      for (const f of seamFaces(6)) add({ pt: [f.fx, f.fy, 0.5], kind: 'seam', free: true, k: f.x + ',' + f.y + ',' + f.nx + ',' + f.ny, f: Object.assign({}, f) });
      if (G.mapId === 'quarry') for (const e of G.ents) if (isLoad(e)) add({ e, kind: 'load' });
    },
    draw: {
      // the grain down both legs; the sprung one split; on the floor, which way the frame will go (js/rigging12.js knockScaff:
      // away from whoever puts their weight to it)
      timber(g, t, fade, rec) {
        const e = t.e, s = t.s, w = s.x1 - s.x0, hh = s.y1 - s.y0, a = fade * 0.75;
        const sprung = h3(Math.round(e.x * 10), Math.round(e.y * 10), 5) < 0.5 ? 0 : 1;
        [0.18, 0.82].forEach((u, i) => {
          const x = s.x0 + w * u;
          g.px(x - 1, s.y0 + hh * 0.25, 1, hh * 0.72, WOOD, a * 0.7); g.px(x + 1, s.y0 + hh * 0.3, 1, hh * 0.66, WOOD, a * 0.5);
          if (i === sprung) { const ym = s.y0 + hh * 0.55; for (let k = 0; k < 4; k++) g.px(x + (k % 2 ? 1 : -1), ym + k, 1, 1, SPRUNG, fade * 0.95); }
        });
        const c = Engine.cam, cf = RCFG(), reach = cf.scaffReach || 1.8;
        let dx = e.x - c.x, dy = e.y - c.y; const l = Math.hypot(dx, dy) || 1; dx /= l; dy /= l;
        const z = g.groundZ(e.x, e.y) + 0.02, wx = e.x + dx * reach, wy = e.y + dy * reach;
        const p0 = g.toView(e.x + dx * 0.4, e.y + dy * 0.4, z); const a0 = p0 ? { x: p0.x, y: p0.y } : null;
        const p1 = g.toView(wx, wy, z); const a1 = p1 ? { x: p1.x, y: p1.y } : null;
        if (a0 && a1) {
          g.line(a0.x, a0.y, a1.x, a1.y, SPRUNG, fade * 0.8, 0);
          const ang = Math.atan2(a1.y - a0.y, a1.x - a0.x);
          for (const sgn of [-1, 1]) { const b = ang + Math.PI + sgn * 0.5; g.line(a1.x, a1.y, a1.x + Math.cos(b) * 4, a1.y + Math.sin(b) * 4, SPRUNG, fade * 0.8, 0); }
        }
        rec.wx = wx; rec.wy = wy; rec.sprung = sprung;
        return true;
      },
      // the line the face would split on: faint on ordinary glass-rock, bright and ticked at each end on a resonant seam
      seam(g, t, fade, rec) {
        const f = t.f, tx = -f.ny, ty = f.nx, pts = [], base = g.groundZ(f.fx + f.nx * 0.3, f.fy + f.ny * 0.3);   // (a raised floor, as the depot's terrace)
        for (let k = 0; k < 5; k++) {
          const u = (h3(f.x, f.y, k + 1) - 0.5) * 0.6, z = base + 0.15 + 0.7 * k / 4;
          const p = g.toView(f.fx + tx * u + f.nx * 0.02, f.fy + ty * u + f.ny * 0.02, z);
          pts.push(p && g.visiblePt(p.x, p.y, p.depth) ? [p.x, p.y] : null);   // (close to a face, its foot is below the view)
        }
        const a = fade * (f.res ? 0.85 : 0.35);
        let segs = 0;
        for (let k = 1; k < pts.length; k++) if (pts[k - 1] && pts[k]) { g.line(pts[k - 1][0], pts[k - 1][1], pts[k][0], pts[k][1], GLASS, a, 0); segs++; }
        if (!segs) return false;
        if (f.res) for (const q of [pts.find(Boolean), pts.slice().reverse().find(Boolean)]) g.px(q[0] - 2, q[1], 5, 1, GLASS, a);
        rec.d = f.d; rec.res = f.res;
        return true;
      },
      // a load you could shoulder: an iron shoulder-hook over the stack
      load(g, t, fade, rec) {
        const s = t.s, x = Math.round((s.x0 + s.x1) / 2), y = Math.round(s.y0 - 7), a = fade * 0.9;
        g.px(x - 1, y - 1, 3, 1, IRON, a); g.px(x, y, 1, 4, IRON, a); g.px(x - 2, y + 3, 2, 1, IRON, a); g.px(x - 2, y + 2, 1, 1, IRON, a);
        return true;
      },
    },
    acts: [{ verb: 'shoulder', can: canShoulder, run: shoulderRun }],
    tick: quarryTick,
    lines: { first: TX.quarryFirst },
  });

  // ================================================================ the load on your shoulder, drawn (both views: the HUD layer)
  const stats = { hudMs: 0 };
  function drawHud() {
    const ctx = Engine.ctx; if (!ctx) return;
    const P = (x, y, w, h, c) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    ctx.save(); ctx.globalAlpha = 1;
    try {
      // the near corner of a crate riding on the shoulder, at the top left of the view: planks, slats, an iron band
      for (let y = 0; y < 30; y++) { const w = 44 - Math.max(0, y - 20) * 2; P(0, y, w, 1, (y % 7 === 6) ? '#3e2a16' : (y % 7 < 2 ? '#7a5634' : '#6b4a2a')); }
      for (let x = 10; x < 44; x += 11) P(x, 0, 1, 26, '#3e2a16');
      P(0, 12, 42, 2, '#5a5a60'); P(0, 12, 42, 1, '#8a8a92');
      for (let x = 4; x < 42; x += 12) P(x, 12, 1, 2, '#2a2a2e');
      P(43, 0, 1, 22, '#9a7650');
    } finally { ctx.restore(); }
  }

  // ================================================================ the wiring
  function rename() {   // a save from before Phase 127: the Root-vault's Mirren Salk is Cass Yelland (her core is in the Kestrel's hold, MS 4560)
    try {
      const rv = G.maps && G.maps.rootvault; if (!rv) return;
      for (const e of rv.entities || []) if (e && e.kind === 'enemy' && e.type === 'legionnaire' && e.name === 'Mirren Salk') e.name = 'Cass Yelland';
    } catch (e) { warnOnce('rename', e); }
  }
  function wire() {
    if (typeof disguiseProtects === 'function') { const _dp = disguiseProtects; disguiseProtects = function (e) { return _dp.apply(this, arguments) || shiftCover(e); }; }
    if (typeof interact === 'function') {
      const _i = interact;
      interact = function () {
        try {
          if (actsOn()) {
            if (st.carry) { drop(TX.setDown); return undefined; }   // hands full: E puts it down
            if (trySplit()) return undefined;
          }
        } catch (err) { warnOnce('interact', err); }
        return _i.apply(this, arguments);
      };
    }
    if (typeof talk === 'function') {
      const _t = talk;
      talk = function (e) { try { if (e && /^p60_q127_/.test(String(e.id || '')) && calling() === 'quarry') say(TX.shiftNod, '', 5000); } catch (err) { /* none */ } return _t.apply(this, arguments); };
    }
    if (typeof render === 'function') {
      const _r = render;
      render = function () { const r = _r.apply(this, arguments); try { if (st.carry && hasG()) { const t0 = performance.now(); api.drawHud(); stats.hudMs = performance.now() - t0; } } catch (e) { warnOnce('hud', e); } return r; };
    }
    if (typeof loadMap === 'function') { const _lm = loadMap; loadMap = function () { st.carry = null; const r = _lm.apply(this, arguments); st.hintMap = ''; st.hintMapQ = ''; return r; }; }
    if (typeof restoreGame === 'function') {
      const _rg = restoreGame;
      restoreGame = function () { st.carry = null; const r = _rg.apply(this, arguments); try { if (hasG()) { validate(G.flags); rename(); } } catch (e) { warnOnce('validate', e); } return r; };
    }
  }
  try { wire(); } catch (e) { console.warn('callings127 failed to wire', e); }

  const api = {
    TEXTS, TX, FLAGS, validate, serialOf, canCopy, canShoulder, carrying: () => !!st.carry, shiftCover, drop: () => drop(null), drawHud, stats, st,
    tick: (dt) => { if (hasG() && calling() === 'quarry') carryTick(dt); }, text, textW, rename,
  };
  return api;
})();
if (typeof window !== 'undefined') window.CALLINGS127 = CALLINGS127;
