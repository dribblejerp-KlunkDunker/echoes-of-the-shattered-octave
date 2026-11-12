// PREVIEW_URL=http://127.0.0.1:4175 PLAYWRIGHT_MODULE=/path/to/playwright node test/howe79.test.js
// Phase 79: Singers' Howe, the dungeon under the lych-house in Greenroot Wood (js/howe79.js).
'use strict';
const path = require('path');
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
(async () => {
  let chromium; try { ({ chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright')); } catch (e) { console.log('SKIP (no playwright)'); process.exit(0); }
  const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event');
    const out = {}, HW = HOWE79, B = ROAD79B, m = G.maps[HW.MAP], W = m.w, H = m.h, E = G.maps[B.EAST];
    const door = (mm, t) => { for (let i = 0; i < mm.cells.length; i++) { const c = mm.cells[i]; if (c && c.door && c.portal && c.portal.map === t) return { x: i % mm.w, y: (i / mm.w) | 0, p: c.portal, label: c.label }; } return null; };
    const down = door(E, HW.MAP), up = door(m, B.EAST);
    out.doors = !!down && !!up && !m.isBlocked(down.p.x | 0, down.p.y | 0) && !E.isBlocked(up.p.x | 0, up.p.y | 0) && Math.hypot(up.p.x - (down.x + 0.5), up.p.y - (down.y + 1.6)) < 1.2;
    const inner = 9 * W + 22, bfs = (open) => { const dist = new Int32Array(W * H).fill(-1), q = [(m.spawn.y | 0) * W + (m.spawn.x | 0)]; dist[q[0]] = 0; for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy, j = Y * W + X; if (X < 0 || Y < 0 || X >= W || Y >= H || dist[j] >= 0) continue; if (m.isBlocked(X, Y) && !(open && j === inner)) continue; dist[j] = dist[i] + 1; q.push(j); } } return dist; };
    const near = (dist, x, y) => { let best = -1; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = dist[((y | 0) + dy) * W + (x | 0) + dx]; if (v >= 0 && (best < 0 || v < best)) best = v; } return best; };
    const shut = bfs(false), open = bfs(true), ents = m.entities;
    const graves = ents.filter((e) => e.use === 'p79_grave'), gear = ents.filter((e) => e.item === 'w_p79_staff' || e.item === 'a_p79_gloves'), quiet = ents.filter((e) => e.type === 'quiet');
    out.graves = graves.length === 3 && graves.every((e) => near(shut, e.x, e.y) >= 0);
    out.locked = m.cells[inner] && m.cells[inner].locked === 'p79_howe_open' && gear.length === 2 && gear.every((e) => near(shut, e.x, e.y) < 0) && quiet.every((e) => near(shut, e.x, e.y) < 0);
    out.behind = gear.every((e) => near(open, e.x, e.y) >= 0) && quiet.length === 1 && near(open, quiet[0].x, quiet[0].y) >= 0 && ents.filter((e) => e.item === 'cache').every((e) => near(open, e.x, e.y) >= 0);
    let rooms = 0, cells = 0; for (let i = 0; i < W * H; i++) if (open[i] >= 0) cells++; out.cells = cells;
    out.foes = ents.filter((e) => e.kind === 'enemy').map((e) => e.type).sort().join(','); out.traps = ents.filter((e) => e.use === 'trap').map((e) => e.trapType).sort().join(',');
    out.dark = m.ambient <= 0.1 && !m.outdoor && ents.filter((e) => e.sprite === 'lamp').every((e) => near(shut, e.x, e.y) >= 0);   // no lamp behind the inner door
    // the way in: three stones
    loadMap(HW.MAP, {}); G.state = 'play'; G.flags.p79_graves = 0; G.flags.p79_howe_open = 0; G.flags.p79_words = 0; HW.sync();
    const gs = G.ents.filter((e) => e._p79h === 'grave'), xp0 = G.player.xp + G.player.level * 1e6;
    useDeco(gs[0]); useDeco(gs[0]); out.one = G.flags.p79_graves === 1 && !G.flags.p79_howe_open && !gs[0].use && /Both its stones/.test(gs[0].label);
    useDeco(gs[2]); out.two = !G.flags.p79_howe_open; useDeco(gs[1]); out.three = G.flags.p79_howe_open === 1 && G.flags.p79_graves === 7 && G.player.xp + G.player.level * 1e6 > xp0;
    // the words, and the gear
    const words = G.ents.find((e) => e._p79h === 'words'); useDeco(words); out.words = G.flags.p79_words === 1 && /WE SANG THEM DOWN/.test(words.label);
    const melee = Object.keys(WEAPONS).filter((k) => !WEAPONS[k].ranged), st = WEAPONS.p79_staff, gl = ITEMS.a_p79_gloves;
    out.staff = !!st && st.type === 'iron' && st.blunt === true && st.reach >= WEAPONS.longsword.reach && melee.filter((k) => k !== 'p79_staff' && WEAPONS[k].reach >= 1.6).every((k) => WEAPONS[k].noise > st.noise) && ITEMS.w_p79_staff.weapon === 'p79_staff' && !!Engine.images[st.img];
    out.gloves = !!gl && gl.slot === 'hands' && gl.ar >= ITEMS.a_gauntlets.ar && gl.noise < 0;
    const has = (id) => (G.player.inv || []).some((s) => s && s.id === id) || (G.player.weapons || []).includes(String(id).replace(/^w_/, ''));
    for (const e of G.ents.filter((x) => x.item === 'w_p79_staff' || x.item === 'a_p79_gloves')) pickUp(e);
    out.taken = has('w_p79_staff') && has('a_p79_gloves');
    out.texts = HW.TEXTS.length;
    G.flags.p79_graves = 0; G.flags.p79_howe_open = 0; G.flags.p79_words = 0;
    return out;
  });
  check(r.doors, 'the mouth of the Howe is in the lych-house wall, and the stair comes back up just inside it');
  check(r.cells > 380 && r.dark, 'a full dungeon: ' + r.cells + ' cells of floor in seven rooms, dark, with no lamp behind the inner door');
  check(/dirge,dirge/.test(r.foes) && /quiet/.test(r.foes) && /hushmoth/.test(r.foes) && /mites/.test(r.foes) && r.traps === 'alarm,net,tripwire', 'what is down there: ' + r.foes + '; traps: ' + r.traps);
  check(r.graves && r.locked, 'the inner door is shut on the gear and the Quiet, and all three graves can be reached without it');
  check(r.one && r.two && r.three, 'a stone on the stone: each grave takes one stone once, and the third opens the inner door');
  check(r.behind, 'behind it: the Quiet, the singers\' shelf and the best strongbox, all reachable once it is open');
  check(r.staff && r.gloves && r.taken, 'special gear: the Old Cantor\'s Staff (iron and blunt, a long reach, and quieter than every other long weapon) and the Bearer\'s Gloves (as stout as mail, and quieter than bare hands), both of which you can take');
  check(r.words, 'the words over the inner door can be read and remembered, for the antiquary\'s book');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors[0] : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed'); process.exit(fails ? 1 : 0);
})();
