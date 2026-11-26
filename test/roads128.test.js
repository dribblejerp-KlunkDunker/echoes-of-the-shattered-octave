// Phase 128a, the roads filled, part one (js/roads128.js). Run:
//   PREVIEW_URL=http://127.0.0.1:4233 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/roads128.test.js
// The wayside things the books give the roads and the game lacked (the findings record, section 3):
//   - the brazier at the foot of Tower Six (Book Three, Part One l. 1842)
// Each is a thing of the world (no switch), placed by rule, with a French line for every English one.
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const ROOT = path.join(__dirname, '..');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4233';
let fails = 0, passes = 0;
const check = (ok, text) => { if (ok) { passes++; console.log('PASS ' + text); } else { fails++; console.log('FAIL ' + text); } };

(async () => {
  const src = (() => { try { return fs.readFileSync(path.join(ROOT, 'js', 'roads128.js'), 'utf8'); } catch (e) { return ''; } })();
  check(!!src, 'js/roads128.js exists');
  check(!/Math\.random/.test(src.split('\n').map((l) => l.replace(/\/\/.*$/, '')).join('\n')), 'nothing on the roads is decided by chance (no Math.random in the source)');
  const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8'), tags = [...html.matchAll(/<script src="js\/([a-z0-9_-]+)\.js/g)].map((m) => m[1]);
  check(tags.includes('roads128') && tags[tags.length - 1] === 'mast123', 'index.html loads js/roads128.js, and js/mast123.js is still the last script');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 240000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play', null, { timeout: 120000 });

  // ------------------------------------------------------------------ the brazier at the foot of Tower Six
  const br = await page.evaluate(() => {
    const out = { api: typeof ROADS128 !== 'undefined' };
    if (!out.api) return out;
    try { closeModal(); hide('#event'); } catch (e) { /* none */ }
    const rn = Math.random; let calls = 0;
    loadMap('p100_wall', {}); G.state = 'play';
    const find = () => G.ents.filter((e) => e && e._p128 === 'brazier6');
    const b = find()[0], t6 = RIFT100.TOWERS.find((t) => t.n === 6);
    out.one = find().length;
    if (b) {
      out.sprite = b.sprite; out.kind = b.kind; out.label = b.label; out.want = ROADS128.TX.brazier6;
      out.dist = Math.hypot(b.x - t6.at[0], b.y - t6.at[1]);
      out.open = !G.map.get(Math.floor(b.x), Math.floor(b.y));                          // it stands on open ground
      out.wallBeside = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => !!G.map.get(Math.floor(b.x) + dx, Math.floor(b.y) + dy));   // at the wall's foot
      out.solid = !!b.solid; out.glow = b.glow > 0;
      out.inBase = G.map.entities.indexOf(b) >= 0 && G.map.entities.indexOf(b) < G.map.baseCount;
      // on the ground, not up on the wall-walk with the battery
      const gun = G.ents.find((e) => e && e._p100 === 'gun' && Math.hypot(e.x - t6.at[0], e.y - t6.at[1]) < 6);
      out.west = !!gun && b.x < gun.x - 4;
    }
    Math.random = () => { calls++; return rn(); };
    try { ROADS128.dress(G.maps.p100_wall); ROADS128.dress(G.maps.p100_wall); } finally { Math.random = rn; }
    out.again = G.maps.p100_wall.entities.filter((e) => e && e._p128 === 'brazier6').length; out.calls = calls;
    out.texts = ROADS128.TEXTS.slice();
    loadMap('oakhaven', {});
    return out;
  });
  check(br.api, 'ROADS128 exists');
  check(br.one === 1 && br.kind === 'deco' && br.sprite === 'brazier' && br.label === br.want && !!br.want, 'the wall has one brazier, with its own line (' + JSON.stringify([br.one, br.sprite, br.label]) + ')');
  check(br.dist > 0 && br.dist < 14 && br.open && br.wallBeside && br.west, '"the brazier at the foot of Tower Six" (Book Three, Part One l. 1842): on open ground at the wall\'s foot, below the battery (' + (br.dist || 0).toFixed(1) + ' cells from the tower)');
  check(br.solid === false && br.glow && br.inBase, 'it is lit, blocks nobody\'s way, and is one of the map\'s own things');
  check(br.again === 1 && br.calls === 0, 'dressing the map again adds nothing and asks no random number (' + br.again + ', ' + br.calls + ')');

  // ------------------------------------------------------------------ French for every line
  const tsv = (() => { try { return fs.readFileSync(path.join(ROOT, 'tools', 'i18n', 'p128-roads.tsv'), 'utf8'); } catch (e) { return ''; } })().split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const noFr = (br.texts || []).filter((t) => !tsv.some((r) => r[0] === t && (r[1] || '').trim() && r[1] !== t));
  check((br.texts || []).length > 0 && noFr.length === 0, 'every line has its French in tools/i18n/p128-roads.tsv (' + (br.texts || []).length + ' lines' + (noFr.length ? '; missing: ' + noFr.slice(0, 3).join(' | ') : '') + ')');

  await browser.close();
  console.log('\n' + passes + ' passed, ' + fails + ' failed');
  process.exit(fails ? 1 : 0);
})().catch((e) => { console.error(e); process.exit(1); });
