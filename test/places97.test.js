// Phase 97: quest markers on the map, and every place you read or hear of (js/places97.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/places97.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'places97.js'), 'utf8');
  check(!/Math\.random/.test(src), 'the place marks draw nothing from Math.random');
  const P = require('../js/places97.js');
  const kinds = { 'The Boar & Dulcimer': 'inn', "Rooke's surgery": 'healer', 'The Chapel of the Carillon': 'chapel', "The Carders' mill": 'works', 'The North Gate': 'gate', 'The mooring mast': 'moor', 'The tannery culvert': 'under', 'The market': 'market', "Lyra Ashgrove's house": 'house', 'The Greenhall': 'hall', 'The orchard store': 'store', 'The Basilica school': 'school', 'The Flume crossing': 'water' };
  check(Object.keys(kinds).every((n) => P.kindOf(n) === kinds[n]), 'a name says what kind of place it is: ' + Object.keys(kinds).map((n) => P.kindOf(n)).join(', '));
  check(P.nameOf("The Sowerbys' — empty") === "The Sowerbys'" && P.nameOf('The Greenhall. The door is barred.') === 'The Greenhall', 'a door\'s label is cut to the name in it');
  const tsv = fs.readFileSync(path.join(__dirname, '..', 'tools', 'i18n', 'p97-reader.tsv'), 'utf8').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t')[0]);
  const flat = (o) => Object.values(o).flatMap((v) => typeof v === 'string' ? [v] : Array.isArray(v) ? v : flat(v));
  check(flat(P.TX).every((t) => tsv.includes(t)), 'every new line has French');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.waitForTimeout(700);

  const r = await page.evaluate(async () => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, PL = PLACES97, wait = (ms) => new Promise((res) => setTimeout(res, ms));
    loadMap('oakhaven'); closeModal(); hide('#event'); G.state = 'play'; document.getElementById('msgs').innerHTML = ''; document.getElementById('hint').textContent = '';
    for (const k of Object.keys(G.flags)) if (/^p97m_/.test(k)) delete G.flags[k];
    const ix = PL.index(), oak = ix.byMap.oakhaven, by = (re) => oak.find((p) => re.test(p.name));
    out.nOak = oak.length; out.nAll = ix.all.length; out.maps = Object.keys(ix.byMap).filter((id) => ix.byMap[id].length).length;
    out.kinds = { boar: by(/Boar/) && by(/Boar/).kind, surgery: by(/surgery/) && by(/surgery/).kind, chapel: by(/Chapel/) && by(/Chapel/).kind, mill: by(/mill/) && by(/mill/).kind, gate: by(/North Gate/) && by(/North Gate/).kind, market: by(/market/i) && by(/market/i).kind };
    out.noGeneric = !oak.some((p) => /shuttered|^A |^Out /i.test(p.name));
    out.start = PL.known('oakhaven').length;
    // heard: somebody says its name
    out.heard = PL.hear('You want the Boar & Dulcimer. Ask for Hetty.'); out.boarKnown = PL.isKnown(by(/Boar/));
    out.said = Array.from(document.querySelectorAll('#msgs .m')).map((e) => e.textContent).join(' | ');
    out.again = PL.hear('You want the Boar & Dulcimer. Ask for Hetty.');
    // a plain word, in its own town
    out.plain = PL.hear('Past the chapel, then left.'); out.chapelKnown = PL.isKnown(by(/Chapel/));
    out.notPartWord = PL.hear('He is a miller by trade, and gated in.') === 0 && !PL.isKnown(by(/mill/)) && !PL.isKnown(by(/North Gate/));
    // the flags are small whole numbers, and survive a save
    const fl = Object.keys(G.flags).filter((k) => /^p97m_/.test(k)); out.flagsOk = fl.length >= 2 && fl.every((k) => Number.isInteger(G.flags[k]) && G.flags[k] > 0 && G.flags[k] <= 0x3fffffff);
    const saved = JSON.parse(JSON.stringify(G.flags)); for (const k of fl) delete G.flags[k]; out.cleared = PL.known('oakhaven').length === 0; Object.assign(G.flags, saved); out.restored = PL.known('oakhaven').length === 2;
    G.flags.p97m_oakhaven_3_0 = 'x'; out.badFlag = PL.known('oakhaven').length === 2; delete G.flags.p97m_oakhaven_3_0;
    // heard in talk: a line in a conversation, through the page
    const e = G.ents.find((x) => x.kind === 'npc'); talk(e); DLG.log.push({ who: 'them', t: "Rooke's surgery is by the square." }); renderDialogue(); await wait(600);
    out.dialogue = PL.isKnown(by(/surgery/)); closeModal(); G.state = 'play';
    // asked: "Where is ..."
    talk(e); askPlace("The Carders' mill"); await wait(100); out.asked = PL.isKnown(by(/mill/)); closeModal(); G.state = 'play';
    // read: a board or a book in a panel; a message; an event
    openModal('<h2>Notices</h2><p>WANTED: a steady hand at the tannery culvert, nights.</p>', 'board'); await wait(600); out.read = PL.isKnown(by(/culvert/)); closeModal(); G.state = 'play';
    msg('A crier: the market opens at noon.'); await wait(600); out.message = PL.isKnown(by(/market/i));
    // seen: the name on its own door, without a word said
    const n0 = document.querySelectorAll('#msgs .m').length; document.getElementById('hint').textContent = 'The North Gate'; await wait(600); out.seen = PL.isKnown(by(/North Gate/)) && document.querySelectorAll('#msgs .m').length === n0;
    // a place in another town: a full name counts anywhere, and is marked on that town's map
    const far = ix.all.find((p) => p.map !== 'oakhaven' && PL.hubOf(p.map) !== 'oakhaven' && p.far.length && G.maps[p.map].outdoor);
    out.far = far ? { name: far.name, map: far.map } : null;
    if (far) { document.getElementById('msgs').innerHTML = ''; out.farHeard = PL.hear('They say ' + far.name + ' is worth the walk.'); out.farKnown = PL.isKnown(far) && PL.known(far.map).includes(far); out.farSaid = Array.from(document.querySelectorAll('#msgs .m')).map((x) => x.textContent).join(' | '); }
    // a plain word does not reach into another town
    const farPlain = ix.all.find((p) => p.map !== 'oakhaven' && PL.hubOf(p.map) !== 'oakhaven' && p.plain.length && !PL.isKnown(p));
    out.plainStaysHome = farPlain ? (PL.hear('Meet me at the ' + farPlain.plain[0] + ' over there, the one far away.'), !PL.isKnown(farPlain)) : true;
    // the map: marks where you have not walked, and the list under it
    const m = G.map; m.visited.fill(0); place: { const c = Engine.cam; m.visited[(c.y | 0) * m.w + (c.x | 0)] = 1; }
    renderMap(); const cv = document.getElementById('amap'), cx = cv.getContext('2d'), cw = cv.width / m.w;
    const tile = (p) => { const d = cx.getImageData(Math.max(4, Math.min(cv.width - 5, Math.round(p.x * cw))) - 4, Math.max(4, Math.min(cv.height - 5, Math.round(p.y * cw))) - 4, 9, 9).data; let edge = 0; for (let i = 0; i < 9; i++) { const k = i * 4; if (d[k] === 0xe9 && d[k + 1] === 0xdc && d[k + 2] === 0xb4) edge++; } return edge; };
    out.marked = PL.known('oakhaven').map((p) => tile(p)); out.unmarked = oak.filter((p) => !PL.isKnown(p)).slice(0, 4).map((p) => tile(p));
    const rows = Array.from(document.querySelectorAll('#p97-places [role="listitem"]')).map((x) => x.textContent);
    out.rows = rows; out.listHead = document.querySelector('#p97-places p').textContent;
    const gold = (() => { const d = cx.getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] === 0xff && d[i + 1] === 0xd2 && d[i + 2] === 0x4a) n++; return n; })();
    out.questGold = gold; out.nQuest = COMPASS97.targets().filter((t) => t.kind === 'quest').length;
    closeModal(); G.state = 'play';
    UPG.questMarkers = false; renderMap(); { const d = document.getElementById('amap').getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i] === 0xff && d[i + 1] === 0xd2 && d[i + 2] === 0x4a) n++; out.questOff = n; out.placesStay = document.querySelectorAll('#p97-places [role="listitem"]').length; } UPG.questMarkers = true; closeModal(); G.state = 'play';
    // an empty map says what will be marked there
    for (const k of Object.keys(G.flags)) if (/^p97m_/.test(k)) delete G.flags[k]; const givers = G.ents.filter((x) => x.kind === 'npc' && LOGMAP.QUEST_GIVERS.indexOf(x.id) >= 0); UPG.questMarkers = false; renderMap(); out.emptyHead = document.querySelector('#p97-places p').textContent; UPG.questMarkers = true; closeModal(); G.state = 'play';
    return out;
  });
  if (process.env.DEBUG97) console.log(JSON.stringify(r));
  check(r.nOak >= 20 && r.nAll >= 120 && r.maps >= 20 && r.noGeneric, 'the places are the game\'s own named doors and "Where is" places: ' + r.nOak + ' in Oakhaven, ' + r.nAll + ' in ' + r.maps + ' maps; "A shuttered house" is not one');
  check(r.kinds.boar === 'inn' && r.kinds.surgery === 'healer' && r.kinds.chapel === 'chapel' && r.kinds.mill === 'works' && r.kinds.gate === 'gate' && r.kinds.market === 'market', 'Oakhaven\'s inn, healer, chapel, mill, gate and market are each their own kind');
  check(r.start === 0 && r.heard === 1 && r.boarKnown && /The Boar & Dulcimer is on your map now\./.test(r.said) && r.again === 0, 'hearing a place named marks it, says so once, and not twice');
  check(r.plain === 1 && r.chapelKnown && r.notPartWord, '"the chapel" said in Oakhaven is Oakhaven\'s chapel; "miller" and "gated" name nothing');
  check(r.flagsOk && r.cleared && r.restored && r.badFlag, 'what is known is kept as small whole numbers, comes back from a save, and a spoiled number is read as nothing');
  check(r.dialogue && r.asked, 'heard in a conversation, and asked for with "Where is"');
  check(r.read && r.message && r.seen, 'read on a board, read in a message, and seen on its own door (that one without a word)');
  check(r.far && r.farHeard === 1 && r.farKnown && /is marked on the map of /.test(r.farSaid) && r.plainStaysHome, 'a place in another town, heard of by its full name, is marked on that town\'s map (' + (r.far ? r.far.name + ', ' + r.far.map : 'none found') + '); a plain word does not reach that far');
  check(r.marked.length >= 6 && r.marked.every((e) => e >= 7) && r.unmarked.every((e) => e < 7), 'the map draws a mark on every known place, walked or not, and none on the others (' + r.marked.length + ' marks)');
  check(r.rows.some((t) => /The Boar & Dulcimer \(an inn\)/.test(t)) && r.rows.some((t) => /\(a healer\)/.test(t)) && r.rows.some((t) => /a quest marker/.test(t)) && /Marked on this map/.test(r.listHead), 'under the map, in words: each place with its kind, and the quest markers');
  check(r.nQuest >= 1 && r.questGold >= r.nQuest * 8 && r.questOff === 0 && r.placesStay >= 6, 'quest markers are drawn where you have not walked (' + r.nQuest + '); Map Objective Markers off hides them and leaves the places');
  check(/Nothing is marked on this map yet/.test(r.emptyHead), 'a map with nothing marked says what will be');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
