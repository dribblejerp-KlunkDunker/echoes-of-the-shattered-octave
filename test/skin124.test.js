// PLAYWRIGHT_MODULE=/path/to/playwright PREVIEW_URL=http://127.0.0.1:4225 node test/skin124.test.js
// Phase 124b, the recoloured townsfolk keep their skin (js/faces124.js FACES124.skin, called by every maker that
// recolours a whole painted figure: js/life60.js variant, js/cantabile17.js, js/flume16.js and js/longnight17.js COATS,
// js/sheepwalk22.js tinted, js/calendar11.js stall-keepers).
//   - every recolour the survey found is made and goes through FACES124.skin
//   - switch on: on the face and on the hands (the source painting's own flesh pixels) every recolour's hue, saturation
//     and lightness stay inside the source painting's measured flesh range; the cloth still takes its tint
//   - switch off: every recolour is byte for byte its maker's own pixels (Oona Salt's checked against the Cantabile
//     multiply computed here, independently); on again restores the kept skin
//   - Original has the switch off, High on; the Options row's words have French in tools/i18n/p124-skin.tsv
//   - no Math.random in js/faces124.js; the cost of measuring the masks
'use strict';
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const URL = process.env.PREVIEW_URL || 'http://127.0.0.1:4225';
const ROOT = path.join(__dirname, '..');
let passed = 0, failed = 0;
async function step(text, fn) { try { await fn(); passed++; console.log('PASS ' + text); } catch (e) { failed++; console.log('FAIL ' + text + ' -- ' + (e && e.message ? String(e.message).split('\n')[0].slice(0, 900) : e)); } }

// the survey: [maker, made name, source painting]
const SURVEY = [
  ...['p60_man_a', 'p60_man_b', 'p60_man_c'].map((n) => ['life60', n, 'townsman']), ...['p60_wom_a', 'p60_wom_b', 'p60_wom_c'].map((n) => ['life60', n, 'townswoman']),
  ['life62', 'p61_clerk', 'townsman'],
  ...[['townsman', 'p17c_teague'], ['townswoman', 'p17c_oona'], ['townswoman', 'p17c_bessa'], ['townsman', 'p17c_teel'], ['hob', 'p17c_sloe'], ['townswoman', 'p17c_tace'], ['townsman', 'p17c_dunmore'], ['townswoman', 'p17c_hesper'], ['townsman', 'p17c_quain'], ['townswoman', 'p17c_wife'], ['townsman', 'p17c_hand'], ['townswoman', 'p17c_child']].map(([s, n]) => ['cantabile17', n, s]),
  ...[['townsman', 'p16f_dockman'], ['townswoman', 'p16f_dockwoman'], ['townsman', 'p16f_cutter'], ['hob', 'p16f_keeper'], ['townswoman', 'p16f_rafter']].map(([s, n]) => ['flume16', n, s]),
  ...[['hob', 'ln17_marl'], ['townswoman', 'ln17_tansy'], ['townsman', 'ln17_jory']].map(([s, n]) => ['longnight17', n, s]),
  ...[['townswoman', 'p22_tamar'], ['townsman', 'p22_kit'], ['townsman', 'p22_gideon'], ['townsman', 'p22_absalom']].map(([s, n]) => ['sheepwalk22', n, s]),
  ...[['townswoman', 'herb'], ['townsman', 'larder'], ['townsman', 'tinker'], ['townswoman', 'odds'], ['townswoman', 'fish']].map(([s, k]) => ['calendar11', 'p11c_vendor_' + k, s]),
];
// recolours that are a state of the whole figure, not dyed cloth: stay exactly as their maker makes them, switch on or off
const STATES = [['p62_hollow_a', 30, 0.55, 0.92], ['p62_hollow_b', 205, 0.45, 0.9], ['p62_hollow_c', 95, 0.35, 0.85]];   // js/life62-whispergrove.js 36-38
// (js/kestrel16.js paintPennick also recolours the townsman, but runs once at script load, before the townsman's painting
// exists, so in a started game it never makes its sprite: nothing to check; noted in the phase record.)

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

  // make every recolour: the places whose makers run when they are built or entered
  const made = await page.evaluate(() => {
    try { closeModal(); hide('#event'); } catch (e) { /* none open */ }
    GFX.keepSkin = true; if (typeof FACES124 !== 'undefined' && FACES124.sync) FACES124.sync();
    const tryLoad = (id, o) => { try { loadMap(id, o || {}); } catch (e) { /* a place that cannot be entered from here */ } };
    G.day = 4; G.tod = 0.5; tryLoad('oakhaven'); G.day = 3; tryLoad('oakhaven');
    for (const id of ['cantabile_harbour', 'flume_landing', 'whispergrove', 'p22_combe']) tryLoad(id);
    tryLoad('oakhaven');
    return Object.keys(Engine.sprites).length;
  });
  console.log('sprites: ' + made);

  await step('every recolour of the survey is made and went through FACES124.skin', async () => {
    const r = await page.evaluate((S) => {
      const reg = typeof FACES124 !== 'undefined' && FACES124.recolours ? FACES124.recolours() : [];
      return S.map(([m, n, s]) => { const sp = Engine.sprites[n]; return [n, !!sp, !!(sp && reg.some((e) => e.data === sp.data && e.src === Engine.sprites[s]))]; });
    }, SURVEY);
    const missing = r.filter((x) => !x[1]).map((x) => x[0]), unhelped = r.filter((x) => x[1] && !x[2]).map((x) => x[0]);
    assert.deepStrictEqual([missing, unhelped], [[], []], 'not made: ' + missing.join(',') + ' / not through skin(): ' + unhelped.join(','));
  });

  const check = await page.evaluate((S) => {
    if (typeof FACES124 === 'undefined' || !FACES124.maskOf) return null;
    const out = [];
    for (const [, n, s] of S) {
      const sp = Engine.sprites[n]; if (!sp) continue;
      const e = FACES124.recolours().find((x) => x.data === sp.data); if (!e) continue;
      const src = e.from, m = FACES124.maskOf(src); if (!m) { out.push({ n, noMask: true }); continue; }   // the pixels the maker read
      const w = src.w, H = m.bot - m.top + 1, y0 = Math.round(m.top + (m.neckY - m.top) * 0.38);
      let face = 0, faceBad = 0, hand = 0, handBad = 0, cloth = 0, clothChanged = 0, clothLost = 0, worn = 0, wornLost = 0, specks = 0, jar = 0, jarLost = 0;
      const base = e.base;   // the maker's tint over the whole figure (life60's, without its old keep-flesh-by-colour rule)
      for (let i = 0; i < src.data.length; i++) {
        const q = src.data[i]; if ((q >>> 24) < 200) continue; const y = (i / w) | 0, x = i % w, v = sp.data[i];
        if ((v >>> 24) < 100) continue;   // a maker may drop faint pixels: not a face pixel any more
        const FO = m.faceOval, inFace = FO ? (((x - FO.c[0]) / FO.r[0]) ** 2 + ((y - FO.c[1]) / FO.r[1]) ** 2 <= 0.8) : (y >= y0 && y < m.neckY && Math.abs(x - m.hx) <= m.headW * 0.28);   // the face's measured oval where there is one
        if (inFace && m.isFlesh(q)) { face++; if (!m.isFlesh(v)) faceBad++; }
        else if (y > m.neckY + H * 0.05 && m.seed[i] && m.isFlesh(q)) { hand++; if (!m.isFlesh(v)) handBad++; }
        else if (m.wt[i] === 0 && y <= m.neckY) { worn++; if (v !== base[i]) wornLost++; }   // the kerchief or cap: dyed with the rest
        else if (m.wt[i] === 0) { cloth++; if ((base[i] & 0xffffff) !== (q & 0xffffff)) clothChanged++; if (v !== base[i]) clothLost++; if ((v & 0xffffff) === (q & 0xffffff) && (base[i] & 0xffffff) !== (q & 0xffffff) && m.isFlesh(q)) specks++; }
        if (m.carried && m.carried[i]) { jar++; if ((v & 0xffffff) !== (q & 0xffffff)) jarLost++; }
      }
      out.push({ n, s, face, faceBad, hand, handBad, cloth, clothChanged, clothLost, worn, wornLost, specks, jar, jarLost });
    }
    return out;
  }, SURVEY);

  await step('switch on: every face keeps the source painting\'s flesh (no pixel of the face outside its range)', async () => {
    assert.ok(check && check.length === SURVEY.length, 'measured ' + (check ? check.length : 0) + ' of ' + SURVEY.length);
    const bad = check.filter((c) => c.noMask || c.face < 20 || c.faceBad > 0).map((c) => c.n + ':' + (c.noMask ? 'no mask' : c.faceBad + '/' + c.face));
    assert.deepStrictEqual(bad, [], bad.join(' '));
  });
  await step('switch on: hands, arms and legs keep it too (the townsman\'s and townswoman\'s recolours have bare skin below the neck)', async () => {
    const bad = check.filter((c) => c.handBad > 0).map((c) => c.n + ':' + c.handBad + '/' + c.hand);
    assert.deepStrictEqual(bad, []);
    const noHands = check.filter((c) => /^p60_|^p17c_teague|^p22_/.test(c.n) && c.hand < 8).map((c) => c.n);
    assert.deepStrictEqual(noHands, [], 'no bare skin found below the neck');
  });
  await step('the cloth still takes its tint: every cloth pixel is the maker\'s own, and a third or more of it is tinted (the Hollows\' grey rags excepted: their maker leaves grey alone)', async () => {
    const bad = check.filter((c) => c.cloth < 100 || c.clothLost > 0 || c.clothChanged < c.cloth / 3).map((c) => c.n + ':' + c.clothLost + ' lost, ' + c.clothChanged + '/' + c.cloth);
    assert.deepStrictEqual(bad, [], bad.join(' '));
  });
  await step('no flesh-coloured specks are spared in the cloth: outside the rig-placed mask every pixel takes the tint', async () => {
    const bad = check.filter((c) => c.specks > 0).map((c) => c.n + ':' + c.specks);
    assert.deepStrictEqual(bad, [], bad.join(' '));
  });
  await step('headwear takes the dye: the townsman\'s cap and the townswoman\'s kerchief are tinted as the maker tints them; only face and hair keep the painting', async () => {
    const bad = check.filter((c) => (/^towns/.test(c.s) && c.worn < 30) || c.wornLost > 0).map((c) => c.n + ':' + c.wornLost + '/' + c.worn);
    assert.deepStrictEqual(bad, [], bad.join(' '));
  });
  await step('the townswoman\'s jar keeps its clay in every recolour of her', async () => {
    const bad = check.filter((c) => c.s === 'townswoman' && (c.jar < 60 || c.jarLost > 0)).map((c) => c.n + ':' + c.jarLost + '/' + c.jar);
    assert.deepStrictEqual(bad, [], bad.join(' '));
  });
  await step('the Hollows (a state of the whole figure, not dyed cloth) are exactly as their maker makes them, switch on or off', async () => {
    const r = await page.evaluate((ST) => {
      const out = [], reg = FACES124.recolours();
      for (const [n, hue, sk, lk] of ST) {
        const sp = Engine.sprites[n]; if (!sp) { out.push(n + ':missing'); continue; }
        if (reg.some((e) => e.data === sp.data)) out.push(n + ':helped');
        for (const v of [false, true]) { GFX.keepSkin = v; FACES124.sync(); const k = 'zz124_' + n + v; delete Engine.sprites[k]; LIFE60.variant('hollow', k, hue, sk, lk);
          const a = Engine.sprites[k].data; let diff = 0; for (let i = 0; i < a.length; i++) if (a[i] !== sp.data[i]) diff++; if (diff) out.push(n + ':' + v + ':' + diff); delete Engine.sprites[k]; }
      }
      GFX.keepSkin = true; FACES124.sync(); return out;
    }, STATES);
    assert.deepStrictEqual(r, []);
  });

  // Found by this phase's survey: Pennick's figure (js/kestrel16.js paintPennick) was painted once at script load, before the
  // townsman's painting existed, so in a started game he had no figure and the engine drew nothing where he stands.
  await step('Pennick has a figure in a started game, and it keeps the townsman\'s skin', async () => {
    const r = await page.evaluate(() => {
      const sp = Engine.sprites.p16k_pennick, src = Engine.sprites.townsman; if (!sp || !src) return { made: !!sp };
      // the middle of the face: the same pixels as the townsman's own, give or take the goggles above them
      let same = 0, n = 0; const w = sp.w, y0 = Math.round(sp.h * 0.075), y1 = Math.round(sp.h * 0.11), x0 = Math.round(w * 0.44), x1 = Math.round(w * 0.56);
      for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const a = sp.data[y * w + x], b = src.data[y * w + x]; if (!(b >>> 24)) continue; n++; if (a === b) same++; }
      // his goggles are "pushed up" (js/kestrel16.js): their brass is on the cap, above the eyes, never down on the beard
      let brassUp = 0, brassDown = 0; for (let y = 0; y < sp.h; y++) for (let x = 0; x < w; x++) { const p = sp.data[y * w + x], r = p & 255, g = (p >>> 8) & 255, b = (p >>> 16) & 255; if ((p >>> 24) && r > 150 && g > 105 && g < 175 && b < 80 && r - b > 100) { if (y < sp.h * 0.085) brassUp++; else if (y < sp.h * 0.25) brassDown++; } }
      return { made: true, sameSize: sp.w === src.w && sp.h === src.h, n, same, brassUp, brassDown };
    });
    assert.ok(r.made, 'p16k_pennick is not in Engine.sprites');
    assert.ok(r.sameSize && r.n > 20 && r.same > r.n * 0.6, 'his face is not the painting\'s own ' + JSON.stringify(r));
    assert.ok(r.brassUp >= 6 && r.brassDown === 0, 'his goggles are not up on the cap ' + JSON.stringify(r));
  });
  await step('switch off: every recolour is byte for byte its maker\'s pixels; Oona Salt equals the Cantabile multiply; on again restores', async () => {
    const r = await page.evaluate((S) => {
      GFX.keepSkin = false; if (GFX.changed) GFX.changed(); FACES124.sync();
      const reg = FACES124.recolours(), diff = [];
      for (const [, n] of S) { const sp = Engine.sprites[n], e = reg.find((x) => x.data === sp.data); if (!e) { diff.push(n + ':unregistered'); continue; } for (let i = 0; i < sp.data.length; i++) if (sp.data[i] !== e.tinted[i]) { diff.push(n); break; } }
      // Oona Salt, as js/cantabile17.js tintSprite made her before this phase (the townswoman times [0.7, 0.8, 1.15])
      const src = Engine.sprites.townswoman, k = [0.7, 0.8, 1.15], o = Engine.sprites.p17c_oona.data; let oona = 0;
      for (let i = 0; i < src.data.length; i++) { const p = src.data[i], a = p >>> 24; let want = p; if (a) { const r = Math.min(255, (p & 255) * k[0]), g = Math.min(255, ((p >>> 8) & 255) * k[1]), b = Math.min(255, ((p >>> 16) & 255) * k[2]); want = ((a << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0; } if (o[i] !== want) oona++; }
      const offFace = Engine.sprites.p60_man_a.data.slice();
      GFX.keepSkin = true; if (GFX.changed) GFX.changed(); FACES124.sync();
      let back = 0; for (let i = 0; i < offFace.length; i++) if (offFace[i] !== Engine.sprites.p60_man_a.data[i]) back++;
      return { diff, oona, back };
    }, SURVEY);
    assert.deepStrictEqual(r.diff, []); assert.strictEqual(r.oona, 0, 'Oona Salt pixels unlike the old multiply'); assert.ok(r.back > 50, 'switching on again changed ' + r.back + ' pixels');
  });

  await step('Original has the switch off, High has it on; the Options row\'s words have French', async () => {
    const r = await page.evaluate(() => { const o = {}; PRESETS.apply('original'); o.original = GFX.keepSkin; PRESETS.apply('high'); o.high = GFX.keepSkin; return { o, row: FACES124.ROW }; });
    assert.deepStrictEqual(r.o, { original: false, high: true });
    const tsv = fs.readFileSync(path.join(ROOT, 'tools/i18n/p124-skin.tsv'), 'utf8');
    for (const t of r.row.slice(1)) assert.ok(tsv.split('\n').some((l) => l.split('\t')[0] === t && (l.split('\t')[1] || '').trim()), 'no French for: ' + t);
  });

  await step('no Math.random in js/faces124.js', async () => {
    const code = fs.readFileSync(path.join(ROOT, 'js/faces124.js'), 'utf8').split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n');
    assert.ok(!/Math\.random/.test(code));
  });

  await step('the cost: measuring a source painting\'s mask is under 40 ms each, and all of them under 200 ms', async () => {
    const s = await page.evaluate(() => { for (const e of FACES124.recolours()) FACES124.maskOf(e.from); return FACES124.stats(); });
    console.log('  cost: ' + JSON.stringify(s));
    assert.ok(s.masks >= 3 && s.ms / s.masks < 40 && s.ms < 200, JSON.stringify(s));
  });

  await browser.close();
  console.log(`\n${passed} passed, ${failed} failed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
