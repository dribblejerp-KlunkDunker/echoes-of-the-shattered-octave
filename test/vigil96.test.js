// Phase 96: Sun-Peak Vigil (js/vigil96.js). Run: PREVIEW_URL=http://127.0.0.1:4182 node test/vigil96.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4182';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.removeItem('octave.souls91.v1'); localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /next|continue/i }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play'; Weather.hold && Weather.hold('clear');
    const out = {}, V = VIGIL96, p = G.player, msgs = []; const _m = msg; msg = function (t) { msgs.push(String(t)); return _m.apply(this, arguments); };
    const said = (re) => msgs.some((t) => re.test(t));
    const play = () => { closeModal(); hide('#event'); G.state = 'play'; };
    const m = G.maps[V.MAP], cm = G.maps[V.CELL];
    out.maps = !!m && m.w === 56 && m.h === 48 && m.outdoor && !!cm && cm.w === 12 && cm.h === 10 && cm.ceil && cm.ceilZ === 2.2 && m.entities.length === m.baseCount;
    // ---- reach: every room from the shelf, through floor cells and the doors that open
    const reach = (gateOpen) => {
      const W = m.w, dist = new Int32Array(W * m.h).fill(-1), q = [(V.P.arrive[1] | 0) * W + (V.P.arrive[0] | 0)]; dist[q[0]] = 0;
      const pass = (x, y) => { const c = m.get(x, y); if (c && c.door) return !c.portal && c.locked !== '__never' && (!c.locked || (c.locked === 'p96b_gate' && gateOpen)); return !c && !(m.floorCells && m.floorCells[y * W + x] === 2); };
      for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const nx = x + dx, ny = y + dy, k = ny * W + nx; if (nx < 0 || ny < 0 || nx >= W || ny >= m.h || dist[k] >= 0 || !pass(nx, ny)) continue; dist[k] = dist[i] + 1; q.push(k); } }
      const at = (x, y) => dist[(y | 0) * W + (x | 0)];
      const by = (x, y) => Math.max(at(x + 1, y), at(x - 1, y), at(x, y + 1), at(x, y - 1));   // a door: a floor cell beside it
      return { shelf: at(28, 44), ladder: at(V.P.ladder[0], V.P.ladder[1]), gatebell: by(30, 39), gate: by(V.P.gate[0], V.P.gate[1]), passage: at(28, 35),
        westWalk: at(16, 24), eastWalk: at(40, 24), northWalk: at(28, 14), southWalk: at(28, 33), garth: at(28, 24), abbessDoor: by(V.P.abbess[0], V.P.abbess[1]),
        towerBase: at(28, 8), rope: at(V.P.rope[0], V.P.rope[1]), yard: at(20, 5), postern: by(V.P.postern[0], V.P.postern[1]) };
    };
    const shut = reach(false), open = reach(true);
    out.reach = open;
    out.reachShut = shut.shelf >= 0 && shut.gatebell >= 0 && shut.ladder >= 0 && shut.passage < 0 && shut.garth < 0;
    out.reachOpen = Object.values(open).every((v) => v >= 0);
    // ---- the gate: shut until the gate-bell; the gate-bell rings and Brother Fabian opens it
    loadMap(V.MAP, { x: V.P.arrive[0], y: V.P.arrive[1], dir: -Math.PI / 2 }); play();
    const put = (x, y, d) => { Engine.cam.x = x; Engine.cam.y = y; if (d != null) Engine.cam.dir = d; p.feet = G.map.groundAt(x, y); p.fallFrom = null; p.fallV = 0; G.keys = {}; };
    const gk = V.P.gate[1] * m.w + V.P.gate[0], gc = m.get(V.P.gate[0], V.P.gate[1]);
    put(28.5, 39.5, -Math.PI / 2); update(0.016); msgs.length = 0; interact();
    out.gateShut = gc.door && gc.locked === 'p96b_gate' && !G.flags.p96b_gate && said(/Shut\. There is a bell on a post/) && G.map.isBlocked(V.P.gate[0], V.P.gate[1]);
    out.firstSight = said(/A white wall on the mountainside/) || ((G.flags.p96b_seen | 0) & 1) === 1;
    let bells = 0; const _b = Audio_.sfx.bell; Audio_.sfx.bell = function () { bells++; return _b.apply(this, arguments); };
    const gb = G.ents.find((e) => e._p96v === 'gatebell'); msgs.length = 0; V.useOwn(gb);
    for (let i = 0; i < 40; i++) update(1 / 30);
    out.gateOpen = G.flags.p96b_gate === 1 && bells === 1 && said(/Brother Fabian: Light keep you true\. Come in\./) && !G.map.isBlocked(V.P.gate[0], V.P.gate[1]) && /The gate is open/.test(gb.label);
    // ---- the Abbess's door into her cell, and back
    const ad = m.get(V.P.abbess[0], V.P.abbess[1]);
    transfer(ad.portal); play();
    const cor = G.ents.find((e) => e.kind === 'npc' && e.id === 'p96v_coriel');
    out.cell = G.mapId === V.CELL && !!cor && !cm.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0) && Math.abs(cor.x - V.P.coriel[0]) < 0.3 && Math.abs(cor.y - V.P.coriel[1]) < 0.3;
    const cd = cm.get(V.P.cDoor[0], V.P.cDoor[1]);
    transfer(cd.portal); play();
    out.cellBack = G.mapId === V.MAP && !m.isBlocked(Engine.cam.x | 0, Engine.cam.y | 0) && Engine.cam.x > 16;
    // eleven cells are not yours to open
    let never = 0; for (const y of V.P.doorYs) for (const x of [V.P.westDoors, V.P.eastDoors]) { const c = m.get(x, y); if (c && c.door && c.locked === '__never' && /not yours to open/.test(c.lockMsg)) never++; }
    out.twelve = never === 11 && !!ad.portal && ad.portal.map === V.CELL;
    // ---- Coriel's help: whole, once a day, at a cost to herself; then a tired greeting
    const N = NPCS.p96v_coriel;
    const day0 = G.day; p.hp = 1; p.voice = 0; p.fat = 0; p.injuries = [{ k: 'x' }]; if (typeof UPG !== 'undefined' && UPG.status) UPG.status.bleed = 5;
    const g0 = N.greet.normal, gold0 = p.gold, inv0 = JSON.stringify(p.inv);
    const a1 = V.ask('p96v_coriel', V.TX.tHelp);
    out.help = a1 === V.TX.helped && p.hp === p.hpMax && p.voice === p.voiceMax && p.fat > 0 && p.injuries.length === 0 && (!UPG.status || UPG.status.bleed === 0) && G.flags.p96b_help === day0 + 1;
    out.tired = g0 === V.SAY.coriel.greet.normal && N.greet.normal === V.SAY.coriel.tired && N.greet.polite === V.SAY.coriel.tired;
    p.hp = 5; const a2 = V.ask('p96v_coriel', V.TX.tHelp);
    out.helpOnce = a2 === V.TX.helpNone && p.hp === 5;
    G.day = day0 + 1; out.nextDay = N.greet.normal === V.SAY.coriel.greet.normal && V.ask('p96v_coriel', V.TX.tHelp) === V.TX.helped && p.hp === p.hpMax && G.flags.p96b_help === day0 + 2;
    G.day = day0 + 1;   // the day she last helped: her greeting is tired
    // ---- thanks: refused three ways, in turn; the count rises; nothing is given
    const t = [V.ask('p96v_coriel', V.TX.tThank), V.ask('p96v_coriel', V.TX.tThank), V.ask('p96v_coriel', V.TX.tThank), V.ask('p96v_coriel', V.TX.tThank)];
    out.thanks = G.flags.p96b_thank === 4 && new Set(t.slice(0, 3)).size === 3 && t[3] === t[0] && p.gold === gold0 && JSON.stringify(p.inv) === inv0;
    // ---- talking: her own topics sit under what she says, and the buttons work
    loadMap(V.CELL, { x: 6.5, y: 7.8, dir: -Math.PI / 2 }); play();
    talk(G.ents.find((e) => e.id === 'p96v_coriel'));
    const btns = Array.from(document.querySelectorAll('#d-topics [data-p96v]')).map((b) => b.getAttribute('data-p96v'));
    const rite = document.querySelector('#d-topics [data-p96v="The Rite"]'); if (rite) rite.click();
    out.talk = btns.includes(V.TX.tHelp) && btns.includes(V.TX.tThank) && btns.includes('The Rite') && btns.length === 6 && DLG.log.some((l) => /Three hundred sunrises/.test(l.t)) && DLG.log[0].t === V.SAY.coriel.tired;
    G.day = day0; closeModal(); play();
    // ---- the rope is Sister Ottavia's: her line, and no flag changes
    loadMap(V.MAP, { x: 28.5, y: 10.6, dir: -Math.PI / 2 }); play();
    const rope = G.ents.find((e) => e._p96v === 'rope'), fl0 = JSON.stringify(G.flags); msgs.length = 0; V.useOwn(rope);
    out.rope = said(/Sister Ottavia: That is ours to ring\./) && JSON.stringify(G.flags) === fl0;
    // ---- the dusk bell: the contract with the Chalk Cliffs
    const B = (tod) => { const b = V.bell(tod); return b.phase + ':' + b.stroke + ':' + b.left; };
    out.bellTable = { 0.2: B(0.2), 0.5: B(0.5), 0.749: B(0.749), 0.75: B(0.75), 0.7528: B(0.7528), 0.78: B(0.78), 0.79: B(0.79), 0.99: B(0.99) };
    out.bell = B(0.2) === 'dark:12:0' && B(0.5) === 'day:0:12' && B(0.749) === 'day:0:12' && B(0.75) === 'ringing:1:11' && B(0.7528) === 'ringing:2:10' && B(0.78) === 'ringing:11:1' && B(0.79) === 'dark:12:0' && B(0.99) === 'dark:12:0'
      && V.BELL.at === 0.75 && V.BELL.strokes === 12 && Math.abs(V.BELL.gap - 1 / 360) < 1e-12
      && Math.abs(V.bell(0.76).toDark - (0.75 + 12 / 360 - 0.76)) < 1e-9 && V.bell(0.9).toDark === 0 && V.bell(NaN).phase === 'day';
    G.tod = 0.3; out.bellDefault = V.bell().phase === 'day' && V.bell(undefined).phase === 'day';
    // in the Vigil: a stroke is heard each time the count goes up; the first of the dusk is said
    put(28.5, 20.5, -Math.PI / 2); G.tod = 0.7495; bells = 0; update(0.016); msgs.length = 0;
    G.tod = 0.7501; update(0.016); const firstSaid = said(/The dusk bell\. Sister Ottavia rings it\./), b1 = bells;
    const bellEnt = G.ents.find((e) => e._p96v === 'bell'); const swung = bellEnt.sprite === 'p96v_bell2';
    msgs.length = 0; G.tod = 0.7501 + V.BELL.gap; update(0.016); const b2 = bells, again = said(/Sister Ottavia rings it/);
    G.tod = 0.79; update(0.016); const b3 = bells;
    out.bellHeard = firstSaid && b1 === 1 && b2 === 2 && !again && swung && bellEnt.sprite === 'p96v_bell' && b3 === 2;
    Audio_.sfx.bell = _b; G.tod = 0.45;
    // ---- the Kestrel's far entry: one, and it lands on the shelf
    const far = typeof KESTREL16 !== 'undefined' && KESTREL16.FAR ? KESTREL16.FAR.filter((d) => d.id === V.MAP) : [];
    const L = far[0] && far[0].landing();
    out.kestrel = far.length === 1 && far[0].name === V.TX.fly && far[0].hours === 30 && !!L && L.map === V.MAP && !m.isBlocked(L.x | 0, L.y | 0) && !m.get(L.x | 0, L.y | 0) && L.y > 39;
    // the ladder aboard is on the shelf
    out.ladder = m.entities.some((e) => e.use === 'p96v_kestrel' && !m.get(e.x | 0, e.y | 0));
    // ---- the postern: down to the Chalk Cliffs when they are there, else barred
    const pc = m.get(V.P.postern[0], V.P.postern[1]);
    const cl = typeof CLIFFS96 !== 'undefined' && CLIFFS96.MAP ? CLIFFS96.MAP : null;
    out.postern = !!pc && pc.door && (cl ? (pc.portal && pc.portal.map === cl && !!G.maps[cl] && !G.maps[cl].isBlocked(pc.portal.x | 0, pc.portal.y | 0)) : (pc.locked === '__never' && pc.lockMsg === 'Barred.'));
    out.posternTo = cl ? 'cliffs' : 'barred';
    // ---- the people: twelve; each stands on a floor; the eleven named once each
    const people = m.entities.filter((e) => e.kind === 'npc').concat(cm.entities.filter((e) => e.kind === 'npc'));
    const ids = people.map((e) => e.id);
    out.people = people.length === 12 && new Set(ids).size === 12 && ids.every((id) => /^p96v_/.test(id) && NPCS[id] && NPCS[id].greet && Object.keys(NPCS[id].topics).length >= 1)
      && ['fabian', 'ottavia', 'domitia'].every((k) => Object.keys(NPCS['p96v_' + k].topics).length === 2)
      && m.entities.filter((e) => e.kind === 'npc').every((e) => !m.get(e.x | 0, e.y | 0) && !m.isBlocked(e.x | 0, e.y | 0))
      && Math.hypot(people.find((e) => e.id === 'p96v_fabian').x - 28.5, people.find((e) => e.id === 'p96v_fabian').y - 35.6) < 0.8;
    out.noFoes = !m.entities.some((e) => e.kind === 'enemy' || e.kind === 'item') && m.danger === 0;
    out.art = ['p96v_gatebell', 'p96v_pillar', 'p96v_bell', 'p96v_bell2', 'p96v_rope', 'p96v_cot', 'p96v_desk', 'p96v_lamp', 'p96v_window', 'p96v_coriel', 'p96v_cleric_m', 'p96v_cleric_f', 'p96v_lintel'].every((k) => Engine.sprites[k])
      && ['t_p96v_stone', 't_p96v_snow', 't_p96v_flag', 't_p96v_gate', 't_p96v_door', 't_p96v_tower', 't_p96v_postern', 't_p96v_plaster', 't_p96v_board', 't_p96v_ceil'].every((k) => Engine.textures[k]);
    msg = _m;
    return out;
  });
  if (process.env.DEBUG96) console.log(JSON.stringify(r));
  check(r.maps, 'Sun-Peak Vigil: an open-sky map of 56 by 48, and the Abbess\'s cell, a roofed map of its own');
  check(r.reachShut, 'from the shelf before the gate-bell: the shelf, the ladder and the gate-bell, and nothing inside');
  check(r.reachOpen, 'with the gate open, every room can be walked to from the shelf: ' + JSON.stringify(r.reach));
  check(r.gateShut && r.firstSight, 'the gate is shut until the gate-bell is rung ("Shut. There is a bell on a post by the gate.")');
  check(r.gateOpen, 'the gate-bell rings, Brother Fabian says "Light keep you true. Come in." and the gate opens (p96b_gate)');
  check(r.cell && r.cellBack, 'the Abbess\'s door leads into her cell, where Coriel sits; its door leads back to the cloister walk');
  check(r.twelve, 'twelve cell doors: eleven not yours to open, and the Abbess\'s');
  check(r.help && r.helpOnce && r.nextDay, 'Coriel heals you whole once a day; asked again the same day she has nothing left; the next day she helps again');
  check(r.tired, 'after she helps, her greeting is tired for the rest of the day');
  check(r.thanks, 'thanks are refused three ways in turn; the count rises; nothing is given');
  check(r.talk, 'her own topics and the two asks sit under what she says, and they answer');
  check(r.rope, 'the rope: "Sister Ottavia: That is ours to ring." and nothing changes');
  check(r.bell && r.bellDefault, 'bell(tod) gives the phases and strokes of the contract: ' + JSON.stringify(r.bellTable));
  check(r.bellHeard, 'in the Vigil each stroke sounds once, the first of the dusk is said, the bell swings while it rings');
  check(r.kestrel && r.ladder, 'the Kestrel has one far entry for the Vigil and sets you down on the shelf, with her ladder there');
  check(r.postern, 'the postern in the tower yard: ' + r.posternTo);
  check(r.people && r.noFoes, 'twelve clergy, Coriel among them, each standing on the floor with something to say; no foes and no loot');
  check(r.art, 'the stone, the snow, the bells, the cell and the clergy are drawn in code');
  const texts = await page.evaluate(() => VIGIL96.TEXTS);
  let fr = null; try { const { hash, norm } = require('../tools/i18n/lib'); const d = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '..', 'locales', 'story', 'fr.json'), 'utf8')); fr = texts.filter((t) => !/\{\d/.test(t) && d.s[hash(norm(t))] == null); } catch (e) { fr = ['(could not read fr.json: ' + e.message + ')']; }
  check(fr.length === 0, 'every new line has its French' + (fr.length ? ' (' + fr.length + ' missing): ' + fr.slice(0, 3).join(' | ') : ''));
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
