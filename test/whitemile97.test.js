// Phase 97: the White Mile (js/whitemile97.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/whitemile97.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'whitemile97.js'), 'utf8');
  check(!/Math\.random/.test(src), 'nothing in the White Mile is drawn or decided by chance');
  const M = require('../js/whitemile97.js');
  const tsv = fs.readFileSync(path.join(__dirname, '..', 'tools', 'i18n', 'p97-whitemile.tsv'), 'utf8').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const en = new Set(tsv.map((l) => l[0]));
  const missing = M.TEXTS.filter((t) => !en.has(t));
  check(M.TEXTS.length > 110 && !missing.length && tsv.every((l) => l[1] && l[1].trim()), 'every new line has French (' + M.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing.slice(0, 3).join(' | ') : ''));
  // what the books do later is never done here: nobody from the books, no nest, no sixth chain, no mirror, no Polisher
  const words = M.TEXTS.join(' \n ');
  check(!/Solenne|Seraphina|Kaelen|Vesper|Mags|Vaelen|Severin|Ignatius|Lyra\b|Sable\b|Mote\b|sixth chain|sixth anchor|\bnest\b|Polisher|Mirror Walk|mirror/i.test(words), 'nobody from the books is named, and there is no nest, no sixth chain, no mirror and no Polisher in its words');
  check(!/child on|on her hip|small on her/i.test(words), 'the child on the woman\'s hip is neither drawn nor told');
  // the plan: shade lies north of what casts it, and the way up crosses from shadow to shadow
  const plan = M.plan(), W = M.W, H = M.H, walk = (k) => [1, 2, 3, 8, 10].includes(plan.kind[k]);
  { // shadow to shadow: for a longest white stretch T, what can be reached? (the run of white starts again at every shadow)
    const N = W * H, start = (M.P.arrive[1] | 0) * W + (M.P.arrive[0] | 0), cellOf = (p) => (p[1] | 0) * W + (p[0] | 0);
    const lvl = (k) => { const i = k % W, j = (k / W) | 0; return (i >= 40 && i <= 45 && j >= 12 && j <= 32) ? 1.3 : M.lvlAt(j); };
    const reach = (T) => { const run = new Float64Array(N).fill(1e9); run[start] = 0; const q = [start];
      while (q.length) { const k = q.shift(), i = k % W, j = (k / W) | 0;
        for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1], [1, 1], [1, -1], [-1, 1], [-1, -1]]) { const x = i + dx, y = j + dy; if (x < 0 || y < 0 || x >= W || y >= H) continue; const n = y * W + x; if (!walk(n)) continue; if (dx && dy && (!walk(j * W + x) || !walk(y * W + i))) continue; if (Math.abs(lvl(n) - lvl(k)) > 0.35) continue;
          const nr = plan.shade[n] ? 0 : run[k] + Math.hypot(dx, dy); if (nr <= T + 1e-9 && nr < run[n] - 1e-9) { run[n] = nr; q.push(n); } } }
      return run; };
    const least = (goal) => { let lo = 0, hi = 30; if (reach(hi)[goal] > 1e8) return Infinity; for (let it = 0; it < 12; it++) { const mid = (lo + hi) / 2; if (reach(mid)[goal] < 1e8) hi = mid; else lo = mid; } return hi; };
    const gTally = least(cellOf(M.P.tally)), gArcade = least(82 * W + 24), gT3 = least(57 * W + 23), gT2 = least(34 * W + 23), gTop = least(cellOf(M.P.lineTopStand));
    check(gTally < 30, 'the Tallyman can be reached on foot from the trapdoor');
    check(gT2 >= 2 && gT2 <= 5.01 && gT3 <= 5.01 && gArcade <= 5.01, 'shadow to shadow, two to five strides, as the book has it: ' + gT2.toFixed(1) + ' up the first tier, ' + gT3.toFixed(1) + ' past the houses, ' + gArcade.toFixed(1) + ' down the Unison\'s street');
    check(gTally > 5.2 && gTally <= 7 && gTally > gArcade + 0.5, 'the widest gap on the Mile (' + gTally.toFixed(1) + ' strides) is the one before the Tallyman');
    check(gTop <= 5.01, 'the garden\'s parapet is reached from the second tier, by the statues\' shadows (' + gTop.toFixed(1) + ')');
  }
  { let bad = 0, n = 0; for (let j = 12; j < H - 2; j++) for (let i = 0; i < W; i++) { const k = j * W + i; if (!plan.shade[k] || !walk(k) || plan.kind[k] === 3) continue; if (j >= 81 && (j <= 84 || j >= 103)) continue; if ((j >= 56 && j <= 59) || (j >= 72 && j <= 77) || (i >= 40 && j >= 33 && j <= 34)) continue;   // arcades, the stair-head, the passage, the pergola
      if (i >= 26 && i <= 27 && j >= 46 && j <= 47) continue;   // under the balcony
      n++; const roofed = (x, y) => plan.kind[y * W + x] === 3 || (x >= 22 && x <= 25 && ((y >= 56 && y <= 59) || (y >= 72 && y <= 77)));
      let caster = false; for (let d = 1; d <= 6 && !caster; d++) { const s = (j + d) * W + i; if (j + d < H && (!walk(s) || roofed(i, j + d))) caster = true; } const alcove = !walk(j * W + i - 1) || !walk(j * W + i + 1); if (!caster && !alcove) bad++; }
    check(n > 150 && bad === 0, 'every shadow lies north of the thing that casts it, away from the Spire (' + n + ' shaded cells checked)'); }
  check(M.COUNT === 9 && M.P.bleached.length === 8, 'the market\'s people: eight figures, nine people (two old men share a bench)');
  check(Math.abs(M.CYCLE - 2 * (M.B.STAND_S + (M.EAST - M.WEST) / M.B.WALK)) < 1e-9 && M.walkAt(0).x === M.WEST && M.walkAt(M.B.STAND_S + 1).x > M.WEST && Math.abs(M.walkAt(M.CYCLE / 2 + 1).x - M.EAST) < 1e-9, 'the Unison keeps its own clock: stand, down the street to the plaza, stand, back');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, M = WHITEMILE97, P = M.P, said = () => Array.from(document.querySelectorAll('#msgs .m')).map((e) => e.textContent), clr = () => { document.getElementById('msgs').innerHTML = ''; };
    const p = G.player, put = (x, y, dir) => { p.x = x; p.y = y; if (dir != null) p.dir = dir; Engine.cam.x = x; Engine.cam.y = y; if (dir != null) Engine.cam.dir = dir; G.vel.x = G.vel.y = 0; p.feet = G.map.groundAt(x, y); p.fallFrom = null; };
    const still = (s, fn) => { for (let i = 0; i < s * 20; i++) { if (fn) fn(); const x = Engine.cam.x, y = Engine.cam.y; update(0.05); if (!fn) { Engine.cam.x = x; Engine.cam.y = y; p.x = x; p.y = y; } if (G.dead || G.state !== 'play') break; } };
    for (const k of Object.keys(G.flags)) if (/^p97/.test(k)) delete G.flags[k];
    p.hp = p.hpMax = 400; p.armor = {}; G.noise = 2;
    // ---- the way in: a door in the Tiers, the gutted house, the ladder through its roof
    const tm = G.maps.p92_tiers, dc = tm.cells[P.tiersDoor[1] * tm.w + P.tiersDoor[0]];
    out.door = !!(dc && dc.door && dc.portal && dc.portal.map === 'p97_gutted'); out.maps = !!(G.maps.p97_gutted && G.maps.p97_mile);
    const hm = G.maps.p97_gutted, hd = hm.cells[P.hDoor[1] * hm.w + P.hDoor[0]]; out.back = !!(hd && hd.portal && hd.portal.map === 'p92_tiers' && P.hDoor[1] === hm.h - 1 && P.tiersDoor[1] < 8);
    loadMap('p97_gutted'); closeModal(); G.state = 'play'; const lad = G.ents.find((e) => e.use === 'p97_up'); useDeco(lad); out.up = G.mapId === 'p97_mile' && Math.abs(Engine.cam.y - P.arrive[1]) < 0.01;
    G.tod = 0.9; clr(); still(0.5); out.arriveSaid = said().some((t) => /black planks/.test(t)); out.shadeAtShelf = M.shadeAt(Engine.cam.x, Engine.cam.y);
    const trap = G.ents.find((e) => e.use === 'p97_down'); useDeco(trap); out.down = G.mapId === 'p97_gutted'; useDeco(G.ents.find((e) => e.use === 'p97_up'));
    out.bright = G.map.bright === true && G.map.danger === 0 && !G.ents.some((e) => e.kind === 'enemy');
    // ---- the offerings: seen, never taken
    const off = G.ents.filter((e) => e.use === 'p97_offer'); const inv0 = JSON.stringify(p.inv); clr(); useDeco(off[0]); out.offer = off.length === 4 && said().some((t) => /not for you/.test(t)) && JSON.stringify(p.inv) === inv0 && G.ents.includes(off[0]);
    // ---- the light: shade holds you; the white takes you, by the hour and the tier; the book's kit slows it
    G.tod = 0.9; put(22.5, 14.5, Math.PI / 2); let h0 = p.hp; still(4); out.shadeSafe = p.hp === h0 && M.shadeAt(22.5, 14.5);
    put(30.5, 20.5); h0 = p.hp; clr(); still(4); const nightLoss = h0 - p.hp; out.nightLoss = nightLoss; out.firstSaid = said().some((t) => /does not hurt/.test(t));
    G.tod = 0.5; put(30.5, 20.5); h0 = p.hp; still(4); const dayLoss = h0 - p.hp; out.dayLoss = dayLoss;
    G.tod = 0.23; put(30.5, 20.5); h0 = p.hp; still(4); out.deadLoss = h0 - p.hp;
    G.tod = 0.9; put(24.5, 90.5); h0 = p.hp; still(4); out.topLoss = h0 - p.hp;
    out.rates = [M.rateAt(20), M.rateAt(90)]; p.armor = { head: 'a_p97_wrap', hands: 'a_p97_gloves' }; out.kit = M.rateAt(20) / out.rates[0]; p.armor = {};
    out.hours = [0.9, 0.5, 0.23].map((t) => { G.tod = t; return M.hour(); }); G.tod = 0.9;
    // dying of it is the game's own death
    put(30.5, 20.5); p.hp = 3; G.tod = 0.5; clr(); still(3); out.died = !!G.dead || G.state !== 'play'; G.dead = false; G.state = 'play'; hide('#death'); p.hp = p.hpMax = 400; G.tod = 0.9; loadMap('p97_mile'); closeModal(); G.state = 'play';
    // ---- the Unison: forty, in four ranks of ten; they keep their walk; they hear noise and nothing else
    const wired = G.ents.filter((e) => e._p97 === 'wired'); out.forty = wired.length === 40 && wired.every((e) => e.kind === 'deco') && wired.filter((e) => e._man).length >= 4;
    const U = M.unison(); U.clock = 0; U.state = 'walk'; put(23.5, 58.5, Math.PI / 2); G.noise = 2; still(1);
    const xs = wired.map((e) => e.x), ys = wired.map((e) => e.y); out.ranks = Math.max(...ys) - Math.min(...ys) > 7 && Math.max(...xs) - Math.min(...xs) < 3.2 && Math.max(...ys) < 69 && Math.min(...ys) > 60.5;
    const x0 = U.x; U.clock = M.B.STAND_S + 5; still(2); out.walks = U.x > x0 + 4 && U.state === 'walk';
    // silent and in plain sight, ten feet away: they do not find you
    U.clock = M.B.STAND_S + 8; still(0.2); put(U.x + 2.6, 59.5, Math.PI / 2); G.noise = 2; clr(); h0 = p.hp; const v0 = p.voice; still(6, () => { G.noise = 2; }); out.unseen = U.state === 'walk' && !said().some((t) => /strike|leans?\b/i.test(t));
    // loud: they stop and lean; quiet again: they could not hear you, and go back
    U.clock = M.B.STAND_S + 2; U.state = 'walk'; still(0.2); put(U.x + 9, 61.5, Math.PI); clr(); G.noise = 8; update(0.05); out.lean = U.state === 'lean' && said().some((t) => /Forty heads turn/.test(t)); out.turned = wired.every((e) => /_t$/.test(e.sprite));
    still(4, () => { G.noise = 1.6; }); out.letGo = U.state === 'walk';
    // loud and staying loud: they come, and strike; they do not kill; you are deafened and your voice is gone
    U.clock = M.B.STAND_S + 2; U.state = 'walk'; still(0.2); put(U.x + 7, 70.5, Math.PI); clr(); p.hp = 9; p.voice = Math.max(4, p.voiceMax || 4); const before = { x: Engine.cam.x, y: Engine.cam.y };
    let struck = false; for (let i = 0; i < 600 && !struck; i++) { G.noise = 8; const cx = Engine.cam.x, cy = Engine.cam.y; update(0.05); if (G.flags.p97_struck) struck = true; else { Engine.cam.x = cx; Engine.cam.y = cy; p.x = cx; p.y = cy; } }
    out.struck = struck && said().some((t) => /strike the note/.test(t)) && said().some((t) => /coming toward the sound/.test(t)); out.notKilled = p.hp >= 1 && !G.dead && G.state === 'play'; out.voiceGone = p.voice === 0; out.deaf = !!(typeof UPG !== 'undefined' && UPG.status && UPG.status.deaf > 0);
    out.thrown = Math.hypot(Engine.cam.x - before.x, Engine.cam.y - before.y) > 0.5; out.hold = U.state === 'hold';
    p.hp = p.hpMax; if (UPG.status) UPG.status.deaf = 0; still(8, () => { G.noise = 1.6; }); still(30, () => { G.noise = 1.6; }); out.resumed = U.state === 'walk';
    // they cannot be harmed, stopped or scattered: they are not foes at all, and a blow near them only says so
    U.clock = M.B.STAND_S + 2; still(0.2); put(U.x + 2.2, 65, Math.PI); clr(); try { attack(); } catch (e) { out.attackErr = String(e); } still(0.3, () => { G.noise = 1.6; });
    out.noHarm = wired.length === G.ents.filter((e) => e._p97 === 'wired' && !e.dead && !e.hidden).length && said().some((t) => /note does not change/.test(t));
    U.state = 'walk'; G.noise = 2;
    // near them the note is a pressure on the voice
    U.clock = 2; still(0.2); p.voice = p.voiceMax || 10; const v1 = p.voice; put(U.x + 2.4, 65, Math.PI); still(3, () => { G.noise = 1.6; }); out.press = p.voice < v1 && U.state === 'walk';
    // ---- the Glassmarket: its people stand; they are not touched; one hand trembles
    const bl = G.ents.filter((e) => e._p97 === 'bleached'); clr(); useDeco(bl.find((e) => e._key === 'blBasket')); const t1 = said().join('|'); clr(); useDeco(bl.find((e) => e._key === 'blStall')); const t2 = said().join('|');
    out.bleached = bl.length === 8 && bl.every((e) => e.solid && e.kind === 'deco') && /Don't touch them/.test(t1) && /trembling/.test(t2) && !bl.some((e) => M.shadeAt(e.x, e.y + 0.6) && M.shadeAt(e.x, e.y - 0.6) && false);
    out.fountLabel = /face turned south/.test(bl.find((e) => e._key === 'blFount').label);
    // ---- the Tallyman: there by night only; across the widest gap; his gift, once
    const tally = G.ents.find((e) => e._p97 === 'tally'), scav = G.ents.find((e) => e._p97 === 'scav');
    G.tod = 0.5; put(24.5, 83.5); still(0.3); out.dayGone = tally.hidden === true && scav.hidden === true;
    G.tod = 0.9; still(0.3); out.nightThere = tally.hidden === false && scav.hidden === false && M.shadeAt(tally.x, tally.y);
    out.marker = LOGMAP.QUEST_GIVERS.indexOf('p97_tallyman') >= 0;
    put(tally.x, tally.y - 1.4, Math.PI / 2); const n0 = G.ents.length, xp0 = p.xp + p.level * 1e6, j0 = G.journal.length; talk(tally);
    out.offered = G.state === 'dialogue' && !!DLG.choices && /Nine tonight/.test(DLG.log.map((l) => l.t).join(' '));
    const btn = document.querySelector('#d-topics button'); if (btn) btn.click();
    out.given = G.flags.p97_tally === 1 && ['a_p97_wrap', 'a_p97_gloves', 'a_p97_coat', 'w_p97_hook'].every((id) => G.ents.some((e) => e.kind === 'item' && e.item === id)) && G.journal.length === j0 + 1 && (p.xp + p.level * 1e6) > xp0;
    out.markerGone = LOGMAP.QUEST_GIVERS.indexOf('p97_tallyman') < 0; closeModal(); G.state = 'play';
    const n1 = G.ents.length; talk(tally); out.onceOnly = !DLG.choices && G.ents.length === n1; out.topics = Object.keys(NPCS.p97_tallyman.topics).length === 5 && Object.keys(NPCS.p97_scav.topics).length === 4; closeModal(); G.state = 'play';
    // ---- the set, and each piece its own look
    out.set = !!(GEAR87.SETS.find((s) => s.id === 'blacks')) && ['a_p97_wrap', 'a_p97_gloves', 'a_p97_coat'].every((id) => ARMOR[id] && ITEMS[id]) && !!WEAPONS.p97_hook && !!ITEMS.w_p97_hook && GEAR87.SETS.find((s) => s.id === 'blacks').weapons[0] === 'p97_hook';
    // ---- the drop-line: nothing hangs until it is let down from the garden; then it is the way up and back
    const top = G.ents.find((e) => e._p97 === 'lineTop'), bot = G.ents.find((e) => e._p97 === 'lineBot'), ring = G.ents.find((e) => e._p97 === 'ring');
    out.lineStart = bot.hidden === true && ring.hidden !== true;
    put(P.lineTopStand[0], P.lineTopStand[1]); clr(); useDeco(top); out.letDown = G.flags.p97_line === 1 && bot.hidden === false && ring.hidden === true && said().some((t) => /pay the line out/.test(t)) && Math.abs(Engine.cam.y - P.lineTopStand[1]) < 0.01;
    useDeco(top); out.rodeDown = Math.abs(Engine.cam.y - P.lineBotStand[1]) < 0.01 && M.shadeAt(Engine.cam.x, Engine.cam.y) && Math.abs(G.map.groundAt(Engine.cam.x, Engine.cam.y)) < 0.01;
    useDeco(bot); out.rodeUp = Math.abs(Engine.cam.y - P.lineTopStand[1]) < 0.01 && Math.abs(G.map.groundAt(Engine.cam.x, Engine.cam.y) - 1.3) < 0.01;
    // ---- the lamp on the shelf (the Souls rules, group k): one, in shade, no keeper to put down
    const lamps = M.lamps(); out.lamp = lamps.length === 1 && lamps[0].g === 'k' && M.shadeAt(lamps[0].x, lamps[0].y) && G.ents.some((e) => e.sprite === 'p92_shadelamp' || e.sprite === 'p92_shadelamplit');
    // ---- the card: the hour and the shade; with the cloth-pole, what the cloth says
    put(22.5, 14.5); still(0.2); drawHUD(); const card = document.getElementById('p97-card'); out.card = !!card && /night/.test(card.textContent) && /in shade/.test(card.textContent);
    if (WEAPONS.p92_pole) { if (!p.weapons.includes('p92_pole')) p.weapons.push('p92_pole'); p.weapon = p.weapons.indexOf('p92_pole'); drawHUD(); out.pole = /the cloth is grey/.test(document.getElementById('p97-card').textContent); G.tod = 0.5; drawHUD(); out.poleDay = /the cloth is gone/.test(document.getElementById('p97-card').textContent); G.tod = 0.9; p.weapon = 0; } else { out.pole = true; out.poleDay = true; }
    // ---- the flags are small whole numbers
    out.flags = Object.keys(G.flags).filter((k) => /^p97_/.test(k)).every((k) => Number.isInteger(G.flags[k]) && G.flags[k] >= 0 && G.flags[k] <= 0x3fffffff);
    // ---- nothing reaches past the market: the way on is shut
    out.shut = !!G.map.cells[P.rubble[1] * G.map.w + P.rubble[0]] && G.ents.every((e) => !(e.portal));
    loadMap('p92_tiers'); out.cardGone = (drawHUD(), !document.getElementById('p97-card'));
    return out;
  });
  if (process.env.DEBUG97) console.log(JSON.stringify(r));
  check(r.door && r.maps && r.back && r.up && r.down, 'the way in: a doorway in the Tiers\' top wall, the gutted house, the ladder through its roof, and back');
  check(r.arriveSaid && r.shadeAtShelf && r.bright, 'the walkway under the line is in shade; the map is lit by its own light; there is nothing to fight');
  check(r.offer, 'the offerings on the line are seen and never taken');
  check(r.shadeSafe && r.nightLoss >= 5 && r.nightLoss <= 12 && r.firstSaid, 'in a shadow nothing is taken; four seconds of white at night takes ' + r.nightLoss + ', and "It does not hurt"');
  check(r.dayLoss >= r.nightLoss * 3 && r.deadLoss < r.nightLoss && r.deadLoss >= 2 && r.topLoss > r.nightLoss && r.hours.join() === 'night,day,dead', 'by day two lights (' + r.dayLoss + '); least in the dead hour (' + r.deadLoss + '); worse nearer the Spire (' + r.topLoss + ' on the fourth tier)');
  check(Math.abs(r.kit - 0.64) < 0.01 && r.died, 'black cloth round the face and black gloves slow it (to ' + r.kit.toFixed(2) + '); staying in it is the game\'s own death');
  check(r.forty && r.ranks && r.walks, 'the Unison: forty, in four ranks of ten, men among them, walking their street on their own clock');
  check(r.unseen, 'silent, ten feet from them in plain sight: they do not find you');
  check(r.lean && r.turned && r.letGo, 'loud: they stop and forty heads turn; quiet again: they cannot hear you, and go back to their walk');
  check(r.struck && r.notKilled && r.voiceGone && r.deaf && r.thrown && r.hold && r.resumed, 'loud and staying loud: they come, and strike the note; it deafens, takes the voice and throws you down, and it does not kill; then they go back');
  check(r.noHarm && !r.attackErr && r.press, 'they are never harmed, stopped or scattered; near them the note presses on the voice');
  check(r.bleached && r.fountLabel, 'the Glassmarket\'s people stand where they stood; "Don\'t touch them"; one hand trembles');
  check(r.dayGone && r.nightThere && r.marker, 'the Tallyman is at his pillar by night only, in the arcade\'s shade, and is a side-quest marker until met');
  check(r.offered && r.given && r.markerGone && r.onceOnly && r.topics, 'he says his count and gives the blacks and his second hook, once; then he only talks');
  check(r.set, 'the Scavenger\'s Blacks are a set of their own');
  check(r.lineStart && r.letDown && r.rodeDown && r.rodeUp, 'the drop-line: nothing hangs until it is let down from the garden; after that it is the way up and back');
  check(r.lamp && r.card && r.pole && r.poleDay && r.cardGone, 'one shade-lamp on the shelf; the card tells the hour and the shade, and with the cloth-pole what the cloth says');
  check(r.flags && r.shut, 'the flags are small whole numbers; the street is shut above the market');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
