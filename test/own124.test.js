// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4227 node test/own124.test.js
// Phase 124c, 124d and 124e, faces of their own: the first three, the next six, the next five, and the way in for the rest (js/faces124.js FACES124.OWN and
// FACES124.portrait, which every place that builds a portrait's path asks).
//   - Old Marrable, trooper 132 of the Watch (p100_tr_b, and p113_trooper at the tip, the same figure) and the Tallyman
//     show their own portrait in the talk window with the switch on, the borrowed one with it off
//   - the files exist and are 96 by 96; every OWN row names a person or figure that exists and a file that exists
//   - nobody else's portrait changed: every NPC's shown portrait, the whole NPCS table, before and after
//   - switch off: every talk window's markup is what the game built before this phase
//   - mood portraits (js/portraits.js) give an own portrait no mood, as for any minor portrait
//   - how many still borrow (printed, with their ids, for the next portraits); Original borrows; no Math.random
// To add a portrait: put img/p_own_<name>.jpg (96 by 96) in, add one row to OWN in js/faces124.js, run this test.
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4227';
const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

// the first three: NPC id -> the portrait each must show with the switch on
const WANT = { p113f_marrable: 'own_marrable', p100_tr_b: 'own_watch132', p113_trooper: 'own_watch132', p97_tallyman: 'own_tallyman',
  // Phase 124d, the next six (24 Nov 2026). Orrin Pale the sexton is one man under three NPC ids, and they wear two
  // different figures (the sexton's, and the townsman's in the heist), so he has three rows and one picture.
  p95_perpetua: 'own_perpetua', p9_ada: 'own_ada', p46_marrit: 'own_marrit', p12_baker: 'own_brenna', p12_dunna: 'own_dunna',
  orrin: 'own_orrin', p29_sexton: 'own_orrin', p16h_orrin: 'own_orrin',
  // Phase 124e, the next five (25 Nov 2026)
  p11_dicer: 'own_garrow', p15_dealer: 'own_nessa', p29_agnes: 'own_agnes', p29_ambrose: 'own_ambrose', p29_sim: 'own_sim' };
// NPC entries in the running game (every map loaded) that showed one of the two borrowed portraits before this phase.
// A later phase that adds a person with a borrowed face changes this number: change it here, and say so in its record.
// Phase 127 (26 Nov 2026): 263. The quarry at work adds five quarrymen of the shift (p60_q127_dayA, dayB, dayC, nightA, nightB),
// who borrow the townsman's face as the clearing's quarrymen do. They are a crowd: their faces come with the crowds' (FACES124.POOL).
const BORROWED_BEFORE = 263;
const BORROWED = ['townsman', 'townswoman'];

function jpegSize(file) {
  const b = fs.readFileSync(file); if (b[0] !== 0xff || b[1] !== 0xd8) return null;
  let i = 2; while (i < b.length) { if (b[i] !== 0xff) { i++; continue; } const m = b[i + 1], len = b.readUInt16BE(i + 2);
    if (m >= 0xc0 && m <= 0xcf && m !== 0xc4 && m !== 0xc8 && m !== 0xcc) return { h: b.readUInt16BE(i + 5), w: b.readUInt16BE(i + 7) };
    i += 2 + len; }
  return null;
}

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(URL + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 240000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play', null, { timeout: 120000 });

  // every map entered once, so every person a map adds on arrival is in NPCS; where each is met is noted
  const setup = await page.evaluate(() => {
    try { closeModal(); hide('#event'); } catch (e) { /* none open */ }
    window.__met = {}; const errs = [];
    for (const id of Object.keys(G.maps)) { try { loadMap(id, {}); } catch (e) { errs.push(id); } for (const e of (G.map.entities || [])) if (e && e.kind === 'npc' && NPCS[e.id]) (window.__met[e.id] = window.__met[e.id] || []).includes(id) || window.__met[e.id].push(id); }
    loadMap('oakhaven', {}); try { closeModal(); hide('#event'); } catch (e) { /* none */ }
    // the talk window for any NPC, as js/game.js talk() opens it, with a plain line (no mood phrase in it)
    window.__talk = (id, line) => {
      const n = NPCS[id]; DLG.npc = n; DLG.ent = { id, kind: 'npc', x: Engine.cam.x + 1, y: Engine.cam.y, sprite: n.sprite }; DLG.log = [{ who: 'them', t: line || 'Good day.' }]; DLG.choices = null; DLG.tone = 'normal'; G.state = 'dialogue';
      let src = null, html = null; try { renderDialogue(null); const img = document.querySelector('#modal-panel .dlg .port img'); src = img ? img.getAttribute('src') : null; html = document.querySelector('#modal-panel').innerHTML; } catch (e) { src = 'error: ' + e.message; }
      return { src, html };
    };
    window.__close = () => { try { closeModal(); } catch (e) { /* none */ } G.state = 'play'; };
    window.__all = () => { const out = {}; for (const id of Object.keys(NPCS)) { out[id] = window.__talk(id).src; } window.__close(); return out; };
    return { errs, npcs: Object.keys(NPCS).length, hasApi: typeof FACES124 !== 'undefined' && typeof FACES124.portrait === 'function' && !!FACES124.OWN };
  });
  console.log('maps that would not load: ' + (setup.errs.join(',') || 'none') + '; NPCs: ' + setup.npcs);

  await step('FACES124.portrait and FACES124.OWN exist, and the switch is GFX.ownFaces, on by default', async () => {
    assert.ok(setup.hasApi, 'no FACES124.portrait / FACES124.OWN');
    const r = await page.evaluate(() => ({ on: GFX.ownFaces, fx: Array.isArray(GFX.FX) && GFX.FX.includes('ownFaces') }));
    assert.deepStrictEqual(r, { on: true, fx: true });
  });

  // every NPC's shown portrait, switch off then on
  const shown = await page.evaluate(() => {
    const set = (v) => { GFX.ownFaces = v; if (typeof FACES124 !== 'undefined' && FACES124.sync) FACES124.sync(); };
    set(false); const off = window.__all();
    set(true); const on = window.__all();
    return { off, on, portrait: Object.fromEntries(Object.keys(NPCS).map((k) => [k, NPCS[k].portrait])) };
  });

  await step('switch on: the three show their own portrait in the talk window', async () => {
    const got = Object.fromEntries(Object.keys(WANT).map((k) => [k, shown.on[k]]));
    assert.deepStrictEqual(got, Object.fromEntries(Object.entries(WANT).map(([k, v]) => [k, 'img/p_' + v + '.jpg'])));
  });
  await step('switch off: the three show the face they borrowed', async () => {
    const got = Object.fromEntries(Object.keys(WANT).map((k) => [k, shown.off[k]]));
    assert.deepStrictEqual(got, Object.fromEntries(Object.keys(WANT).map((k) => [k, 'img/p_' + shown.portrait[k] + '.jpg'])));
    for (const k of Object.keys(WANT)) assert.ok(BORROWED.includes(shown.portrait[k]), k + ' did not borrow: ' + shown.portrait[k]);
  });
  await step('nobody else\'s portrait changed: every NPC in the table shows what its entry names, switch off; switch on, only the served ones differ', async () => {
    const ids = Object.keys(shown.portrait), offBad = ids.filter((k) => shown.off[k] !== 'img/p_' + shown.portrait[k] + '.jpg');
    assert.deepStrictEqual(offBad, [], 'off: ' + offBad.map((k) => k + '=' + shown.off[k]).join(' '));
    const served = await page.evaluate(() => Object.keys(NPCS).filter((k) => FACES124.servedBy(k)));
    const changed = ids.filter((k) => shown.on[k] !== shown.off[k]);
    assert.deepStrictEqual(changed.slice().sort(), served.slice().sort());
    const notBorrowers = changed.filter((k) => !BORROWED.includes(shown.portrait[k]));
    assert.deepStrictEqual(notBorrowers, [], 'a person with a portrait of their own was changed');
    for (const k of Object.keys(WANT)) assert.ok(changed.includes(k), k + ' not served');
  });
  await step('switch off: every talk window\'s markup is byte for byte what the game built before (the path straight from the entry)', async () => {
    const bad = await page.evaluate(() => {
      GFX.ownFaces = false; const ids = Object.keys(NPCS), a = {}, out = [];
      for (const id of ids) a[id] = window.__talk(id).html;
      const keep = FACES124.portrait; FACES124.portrait = null;   // the places fall back to the entry's own portrait
      try { for (const id of ids) if (window.__talk(id).html !== a[id]) out.push(id); } finally { FACES124.portrait = keep; GFX.ownFaces = true; window.__close(); }
      return out;
    });
    assert.deepStrictEqual(bad, []);
  });
  await step('the portrait files exist and are 96 by 96; every OWN row names a person or figure that exists and a file that exists', async () => {
    const rows = await page.evaluate(() => Object.entries(FACES124.OWN).map(([k, stem]) => [k, stem, !!NPCS[k], !!(Engine.sprites[k] && Object.keys(NPCS).some((n) => NPCS[n].sprite === k)), Object.keys(NPCS).filter((n) => FACES124.servedBy(n) === k).length]));
    assert.ok(rows.length >= 3, 'rows: ' + rows.length);
    for (const [k, stem, isNpc, isFigure, n] of rows) {
      assert.ok(isNpc || isFigure, 'OWN row ' + k + ': no such NPC id, and no figure of that name worn by anyone');
      assert.ok(/^own_[a-z0-9_]+$/.test(stem), 'OWN row ' + k + ': the file stem must be own_<name>: ' + stem);
      const f = path.join(ROOT, 'img', 'p_' + stem + '.jpg'); assert.ok(fs.existsSync(f), 'OWN row ' + k + ': no file img/p_' + stem + '.jpg');
      assert.deepStrictEqual(jpegSize(f), { w: 96, h: 96 }, 'img/p_' + stem + '.jpg is not 96 by 96');
      assert.ok(n >= 1, 'OWN row ' + k + ' serves nobody (a person who borrows neither face, or a typo)');
    }
    for (const stem of new Set(Object.values(WANT))) assert.deepStrictEqual(jpegSize(path.join(ROOT, 'img/p_' + stem + '.jpg')), { w: 96, h: 96 }, stem);
  });
  await step('mood portraits: an own portrait has no mood (as any minor portrait); a story face still does', async () => {
    const r = await page.evaluate(async () => {
      const line = 'I am afraid. Terrified, please.', o = { log: [{ who: 'them', t: line }], tone: 'blunt', flags: { coil_done: 1 } }, out = {};
      for (const id of ['p113f_marrable', 'p100_tr_b', 'p113_trooper', 'p97_tallyman']) out[id] = PORTRAITS.pick(NPCS[id], o);
      out.lyra = PORTRAITS.pick(NPCS.lyra, o);
      // in the talk window, with the line said: the own portrait stays, no variant is swapped in
      window.__talk('p97_tallyman', line); await new Promise((res) => setTimeout(res, 400));
      const img = document.querySelector('#modal-panel .dlg .port img'); out.window = [img.getAttribute('src'), img.dataset.mood || null]; window.__close();
      return out;
    });
    assert.deepStrictEqual(r, { p113f_marrable: null, p100_tr_b: null, p113_trooper: null, p97_tallyman: null, lyra: 'afraid', window: ['img/p_own_tallyman.jpg', null] });
  });
  await step('how many still borrow: the count before less those now served (printed, with every id, for the next portraits)', async () => {
    const r = await page.evaluate(() => {
      const B = ['townsman', 'townswoman'], ids = Object.keys(NPCS).filter((k) => B.includes(NPCS[k].portrait) && !B.includes(k));
      const still = ids.filter((k) => !FACES124.servedBy(k));
      return { before: ids.length, served: ids.length - still.length, still: still.map((k) => [k, NPCS[k].portrait, NPCS[k].sprite, String(NPCS[k].name), (window.__met[k] || []).join(',')]) };
    });
    const lines = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => f.endsWith('.js')).map((f) => (fs.readFileSync(path.join(ROOT, 'js', f), 'utf8').match(/portrait: '(townsman|townswoman)'/g) || []).length).reduce((a, b) => a + b, 0);
    console.log('  borrowed before: ' + r.before + ' NPC entries; served now: ' + r.served + '; STILL BORROW: ' + r.still.length + ' (source lines naming a borrowed portrait outright: ' + lines + ')');
    for (const s of r.still) console.log('  still borrows: ' + s.join(' | '));
    assert.strictEqual(r.before, BORROWED_BEFORE, 'the number of NPC entries with a borrowed face has changed: update BORROWED_BEFORE and say so');
    assert.strictEqual(r.still.length, BORROWED_BEFORE - r.served);
    assert.ok(r.served >= Object.keys(WANT).length, 'served: ' + r.served);
  });
  await step('Original borrows, High has faces of their own; the Options row\'s words have French; sw.js names the pictures', async () => {
    const r = await page.evaluate(() => {
      const o = {}; PRESETS.apply('original'); o.original = [GFX.ownFaces, window.__talk('p113f_marrable').src];
      PRESETS.apply('high'); o.high = [GFX.ownFaces, window.__talk('p113f_marrable').src]; window.__close(); return { o, row: FACES124.OWN_ROW, stems: Object.values(FACES124.OWN) };
    });
    assert.deepStrictEqual(r.o, { original: [false, 'img/p_townswoman.jpg'], high: [true, 'img/p_own_marrable.jpg'] });
    const tsv = fs.readFileSync(path.join(ROOT, 'tools/i18n/p124-own.tsv'), 'utf8');
    for (const t of r.row.slice(1)) assert.ok(tsv.split('\n').some((l) => l.split('\t')[0] === t && (l.split('\t')[1] || '').trim()), 'no French for: ' + t);
    const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    for (const s of new Set(r.stems)) assert.ok(sw.includes('"img/p_' + s + '.jpg"'), 'sw.js does not name img/p_' + s + '.jpg');
  });
  await step('the Options row is there, beside "Recoloured people keep their skin", and turns the switch', async () => {
    const r = await page.evaluate(() => {
      renderAccessibilityMenu(); const b = document.getElementById(FACES124.OWN_ROW[0]); if (!b) return { row: false };
      const prev = b.previousElementSibling, before = prev && prev.previousElementSibling; const was = GFX.ownFaces; b.click(); const after = GFX.ownFaces; b.click();
      const r = { row: true, beside: !!(before && before.id === FACES124.ROW[0]), toggled: was !== after, back: GFX.ownFaces === was }; closeModal(); return r;
    });
    assert.deepStrictEqual(r, { row: true, beside: true, toggled: true, back: true });
  });
  // (26 Nov) the crowds. One entry (a townsman, a mourner, one of the Umbral folk) stands in many places; each of its
  // people shows one of the crowd's painted faces, chosen by where that person stands among the others (a fixed rule)
  await step('a crowd: each of its people shows one of the crowd\'s faces by a fixed rule (FACES124.POOL), never by chance', async () => {
    const r = await page.evaluate(() => {
      const F = FACES124, out = { api: !!F.POOL && typeof F.crowdFace === 'function' };
      if (!out.api) return out;
      const had = Object.assign({}, F.POOL), ents0 = G.ents.slice(), rn = Math.random; let calls = 0; Math.random = () => { calls++; return rn(); };
      const n = NPCS.townsman, men = [0, 1, 2].map((i) => ({ id: 'townsman', kind: 'npc', sprite: n.sprite, x: 30 + i * 2, y: 40, homeX: 30 + i * 2, homeY: 40 }));
      const ask = (e) => { DLG.npc = n; DLG.ent = e; G.state = 'dialogue'; const v = F.portrait(n); G.state = 'play'; DLG.ent = null; return v; };
      try {
        loadMap('oakhaven', {}); for (const k of Object.keys(F.POOL)) delete F.POOL[k];
        calls = 0;   // (entering a map rolls its own dice; from here on nothing may)
        G.ents = G.ents.filter((e) => e.id !== 'townsman').concat(men);
        out.empty = men.map(ask).join(',');                                   // no faces painted for the crowd: as before
        F.POOL.townsman = ['own_orrin', 'own_garrow', 'own_sim'];              // (three of the painted faces, borrowed for the test)
        const a = men.map(ask); out.three = a.join(','); out.distinct = new Set(a).size;
        out.again = men.map(ask).join(',') === out.three;
        G.ents = G.ents.slice().reverse(); out.reordered = men.map(ask).join(',') === out.three;   // the order of the list does not matter
        men[1].x += 5; men[1].y -= 3; out.walked = men.map(ask).join(',') === out.three;           // nor where he has walked to: his home does
        out.stranger = ask({ id: 'townsman', kind: 'npc', x: 1, y: 1 });                             // someone not on the map's list: still one of the faces
        out.noEnt = F.portrait(n);                                                                   // nobody being spoken to: the entry's own portrait
        out.own = F.portrait('p9_ada');
        GFX.ownFaces = false; out.off = men.map(ask).join(','); GFX.ownFaces = true;
        out.calls = calls;
      } finally { Math.random = rn; for (const k of Object.keys(F.POOL)) delete F.POOL[k]; Object.assign(F.POOL, had); G.ents = ents0; try { closeModal(); } catch (e) { /* none */ } G.state = 'play'; }
      out.rows = Object.keys(F.POOL).map((k) => [k, F.POOL[k]]);
      return out;
    });
    assert.ok(r.api, 'no FACES124.POOL / FACES124.crowdFace');
    assert.strictEqual(r.empty, 'townsman,townsman,townsman', JSON.stringify(r));
    assert.ok(r.distinct === 3 && r.again && r.reordered && r.walked, 'three men, three faces, the same each time ' + JSON.stringify(r));
    assert.ok(['own_orrin', 'own_garrow', 'own_sim'].includes(r.stranger) && r.noEnt === 'townsman' && r.own === 'own_ada', JSON.stringify(r));
    assert.strictEqual(r.off, 'townsman,townsman,townsman', 'switch off: the borrowed face');
    assert.strictEqual(r.calls, 0, 'Math.random was asked ' + r.calls + ' times');
    const sw = fs.readFileSync(path.join(ROOT, 'sw.js'), 'utf8');
    for (const [k, list] of r.rows) {
      assert.ok(Array.isArray(list) && list.length >= 2, 'crowd ' + k + ' needs two faces or more');
      for (const s of list) { const f = path.join(ROOT, 'img', 'p_' + s + '.jpg'); assert.ok(fs.existsSync(f), 'missing ' + f); const z = jpegSize(f); assert.ok(z && z.w === 96 && z.h === 96, f + ' is not 96 by 96'); assert.ok(sw.includes('"img/p_' + s + '.jpg"'), 'sw.js does not name img/p_' + s + '.jpg'); }
    }
  });
  await step('no Math.random in js/faces124.js', async () => {
    const code = fs.readFileSync(path.join(ROOT, 'js/faces124.js'), 'utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    assert.ok(!/Math\.random/.test(code));
  });

  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
