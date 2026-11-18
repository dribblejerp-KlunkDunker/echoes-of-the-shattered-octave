// Phase 96: a person's own subjects get their own buttons (js/owntopics96.js). Run: PREVIEW_URL=http://127.0.0.1:4175 node test/owntopics96.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.addInitScript(() => { try { localStorage.setItem('octave.air93.v1', JSON.stringify({ on: false })); } catch (e) { /* */ } });
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /next|continue/i }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, keys0 = TOPIC_KEYS.length;
    const ask = (map, id) => {
      loadMap(map); closeModal(); hide('#event'); G.state = 'play';
      const e = G.ents.find((x) => x.kind === 'npc' && x.id === id); if (!e) return null;
      talk(e); renderDialogue('tell');
      const box = document.getElementById('d-topics'), btns = Array.from(box.querySelectorAll('button'));
      const own = btns.filter((b) => b.getAttribute('data-own') === '1').map((b) => b.getAttribute('data-topic'));
      const res = { own, total: btns.length, dup: new Set(btns.map((b) => b.textContent)).size !== btns.length, firstOwn: btns[0] && btns[0].getAttribute('data-own') === '1' };
      if (own.length) { const n0 = DLG.log.length; DLG.tone = 'normal'; btns.find((b) => b.getAttribute('data-own') === '1').onclick(); res.answered = DLG.log.length >= n0 + 2 && DLG.log[DLG.log.length - 1].t === NPCS[id].topics[own[0]]; res.still = document.querySelectorAll('#d-topics [data-own="1"]').length === own.length; }
      closeModal(); G.state = 'play';
      return res;
    };
    out.bardo = ask('p94_anchorage', 'p94_bardo');
    out.perpetua = ask('p95_house', 'p95_perpetua');
    out.brenna = ask('p92_tiers', 'p92_brenna');
    // somebody with no subjects of their own: nothing added
    loadMap('oakhaven'); closeModal(); hide('#event'); G.state = 'play';
    const plain = G.ents.find((x) => x.kind === 'npc' && NPCS[x.id] && OWNTOPICS96.own(NPCS[x.id]).length === 0 && !NPCS[x.id].quest);
    if (plain) { talk(plain); if (G.state === 'dialogue') { renderDialogue('tell'); out.plain = document.querySelectorAll('#d-topics [data-own="1"]').length === 0 && document.querySelectorAll('#d-topics button').length === TOPIC_KEYS.length; closeModal(); G.state = 'play'; } else out.plain = true; } else out.plain = true;
    out.keys = TOPIC_KEYS.length === keys0;
    return out;
  });
  if (process.env.DEBUG96) console.log(JSON.stringify(r));
  const ok = (x, n) => x && x.own.length === n && !x.dup && x.firstOwn && x.answered && x.still;
  check(ok(r.bardo, 5), 'Winchmaster Bardo: his five subjects have buttons, first in the list, and he answers them');
  check(ok(r.perpetua, 5), 'Perpetua Lisle: her five subjects that are not shared ones have buttons (the Flambeaux is a shared subject she answers in her own words), and she answers them');
  check(ok(r.brenna, 5), 'Brenna Corliss: her five subjects have buttons, and she answers them');
  check(r.plain && r.keys, 'somebody with no subjects of their own gets no new button; the shared list is left alone');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
