// Phase 97: the compass points to quest and side-quest markers (js/compass97.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/compass97.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'compass97.js'), 'utf8');
  check(!/Math\.random/.test(src) && !/G\.flags\s*\[[^\]]+\]\s*=[^=]/.test(src) && !/G\.flags\.\w+\s*=[^=]/.test(src), 'the compass marks draw nothing from Math.random and write no flag');
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
    const out = {}, C = COMPASS97, st = C._st, fresh = () => { st.at = -1e9; };
    const place = (x, y, dir) => { const p = G.player; p.x = x; p.y = y; p.dir = dir; Engine.cam.x = x; Engine.cam.y = y; Engine.cam.dir = dir; G.vel.x = G.vel.y = 0; fresh(); };
    // the strip's own pixels: the compass is 86 wide from x 228, under the view
    const strip = () => { render(); const d = Engine.ctx.getImageData(228, VIEW_H + 5, 86, 14).data, px = []; for (let i = 0; i < d.length; i += 4) px.push((d[i] << 16) | (d[i + 1] << 8) | d[i + 2]); return px; };
    const count = (px, c) => px.filter((v) => v === c).length, GOLD = 0xffd24a, BLUE = 0x9fd8ff;
    const cols = (px, c) => { const xs = []; for (let i = 0; i < px.length; i++) if (px[i] === c) xs.push(i % 86); return xs.length ? [Math.min(...xs), Math.max(...xs)] : null; };

    loadMap('oakhaven'); closeModal(); hide('#event'); G.state = 'play'; G.tod = 0.5;
    const givers = G.ents.filter((e) => e.kind === 'npc' && !e.hidden && !e.dead && LOGMAP.QUEST_GIVERS.indexOf(e.id) >= 0);
    out.nGivers = givers.length; out.nMarks = C.targets().length; out.kinds = Array.from(new Set(C.targets().map((t) => t.kind)));
    // one marker only, straight ahead: a gold diamond at the middle of the strip
    const keep = givers[0], others = givers.slice(1); for (const e of others) e.hidden = true;
    place(keep.x - 6, keep.y, 0);                                // facing east, the giver 6 cells ahead
    let px = strip(); out.aheadGold = count(px, GOLD); out.aheadCols = cols(px, GOLD);
    out.spokenAhead = C.spoken();
    place(keep.x - 6, keep.y, -Math.PI / 2);                     // facing north: the giver is to the right (east)
    px = strip(); out.rightCols = cols(px, GOLD); out.spokenRight = C.spoken();
    place(keep.x - 6, keep.y, Math.PI);                          // facing west: it is behind: an arrow at an end
    px = strip(); out.behindCols = cols(px, GOLD); out.spokenBehind = C.spoken();
    place(keep.x - 1, keep.y, 0); out.spokenBeside = C.spoken();
    // a side-quest giver (one a module added to the map's list) is a pale-blue disc
    const sideId = 'p97_test_side'; LOGMAP.QUEST_GIVERS.push(sideId); const was = keep.id; keep.id = sideId;
    place(keep.x - 6, keep.y, 0); px = strip(); out.sideBlue = count(px, BLUE); out.sideGold = count(px, GOLD); out.spokenSide = C.spoken(); out.sideKind = C.targets()[0] && C.targets()[0].kind;
    keep.id = was; LOGMAP.QUEST_GIVERS.splice(LOGMAP.QUEST_GIVERS.indexOf(sideId), 1);
    // Options > Map Objective Markers off: no marks
    UPG.questMarkers = false; fresh(); px = strip(); out.offGold = count(px, GOLD) + count(px, BLUE); out.offTargets = C.targets().length; out.offSpoken = C.spoken(); UPG.questMarkers = true;
    // nobody marked on this map: the door toward the nearest one, a hollow diamond
    keep.hidden = true; fresh(); const via = C.targets();
    out.via = via.length === 1 && via[0].kind === 'via' ? { label: via[0].label, x: via[0].x, y: via[0].y } : via.map((t) => t.kind);
    if (via.length === 1) { const c = G.map.cells[(via[0].y | 0) * G.map.w + (via[0].x | 0)]; out.viaIsDoor = !!(c && c.portal && c.portal.map !== 'oakhaven'); const to = G.maps[c.portal.map]; out.viaLeads = !!to; place(via[0].x, via[0].y + (via[0].y < 3 ? 5 : -5), via[0].y < 3 ? -Math.PI / 2 : Math.PI / 2); px = strip(); out.viaGoldEdge = count(px, GOLD); out.spokenVia = C.spoken(); }
    for (const e of givers) e.hidden = false; fresh();
    // the game is not changed by any of it
    const flags0 = JSON.stringify(G.flags), j0 = G.journal.length; for (let i = 0; i < 40; i++) { fresh(); st.syncAt = -1e9; C.targets(); render(); }
    out.pure = JSON.stringify(G.flags) === flags0 && G.journal.length === j0 && G.openPanel == null && document.getElementById('modal').classList.contains('hidden') && G._dryMap === undefined;
    // the map still opens
    renderMap(); out.mapOpens = !!document.getElementById('amap'); closeModal(); G.state = 'play';
    return out;
  });
  if (process.env.DEBUG97) console.log(JSON.stringify(r));
  check(r.nGivers >= 1 && r.nMarks === r.nGivers && r.kinds.every((k) => k === 'quest' || k === 'side'), 'every quest marker on the map you stand in has a mark on the compass (' + r.nMarks + ' in Oakhaven)');
  check(r.aheadGold >= 6 && r.aheadCols && r.aheadCols[0] >= 38 && r.aheadCols[1] <= 48, 'a quest giver straight ahead: a gold diamond at the middle of the strip (columns ' + JSON.stringify(r.aheadCols) + ' of 86)');
  check(r.rightCols && r.rightCols[0] > 60 && r.behindCols && (r.behindCols[1] < 10 || r.behindCols[0] > 76), 'to the right it sits right of the middle; behind you it is an arrow at an end (' + JSON.stringify(r.rightCols) + ', ' + JSON.stringify(r.behindCols) + ')');
  check(/ahead, about 6 paces/.test(r.spokenAhead) && /to your right/.test(r.spokenRight) && /behind you/.test(r.spokenBehind) && /right beside you/.test(r.spokenBeside), 'and in words, for the reader: "' + r.spokenAhead + '"');
  check(r.sideKind === 'side' && r.sideBlue >= 10 && r.sideGold === 0 && /^A side-quest marker/.test(r.spokenSide), 'a side-quest giver is a pale-blue disc, and is called a side-quest marker');
  check(r.offGold === 0 && r.offTargets === 0 && r.offSpoken === '', 'with Map Objective Markers off there are no marks');
  check(r.via && r.via.label !== undefined && r.viaIsDoor && r.viaLeads && r.viaGoldEdge >= 3 && /through /.test(r.spokenVia || ''), 'nobody marked on this map: the compass points to the door that leads toward the nearest one ("' + (r.spokenVia || JSON.stringify(r.via)) + '")');
  check(r.pure && r.mapOpens, 'keeping the marks up to date changes nothing in the game, opens no panel, and the map still opens');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
