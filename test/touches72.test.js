// PREVIEW_URL=http://127.0.0.1:8835 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/touches72.test.js
// Small canon touches II (js/touches72.js; R9 #25 b, h, j, m, s; Book One): "Apples in the Rain", off-key on the fourth
// bar, hummed through the Hedge; the pebble that makes no sound in the hound's bed; four Legionnaires at the greened
// quarry's gate with grass through their pewter feet; the colours brighter once (a late rumour, and the Church's "come
// right again with prayer" in the Gazette); Hetty Bram's eyebrows, and no toasts.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /touches72/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8835');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof TOUCHES72 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Touches Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0; },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        stand(x, y, dir) { Engine.cam.x = x; Engine.cam.y = y; if (dir != null) Engine.cam.dir = dir; },
        find(use) { return G.ents.filter((e) => e && e.use === use && !e.hidden); },
      };
    });

    // ---- b. "Apples in the Rain", off-key on the fourth bar, through the Hedge
    let r = await page.evaluate(() => {
      const out = {};
      T.reset(); loadMap('oakhaven');
      // the game's own trigger at the tannery culvert opens the card; this module only adds the humming to it
      const t = G.map.triggers.find((x) => x.id === 'hedge_voice');
      out.trig = !!t;
      if (!t) return out;
      window.__ev.length = 0; T.stand(t.x, t.y); t.inside = false; t.done = false; checkTriggers();
      const ev = window.__ev.find((e) => e.t === 'A voice beyond the Hedge') || null;
      out.card = !!ev;
      if (!ev) return out;
      out.hum = /And after it, softly, humming: the first bars of "Apples in the Rain\." The old orchard working-song\. Off-key on the fourth bar\. Always the fourth bar\./.test(ev.b);
      out.order = ev.b.indexOf('Just say you') >= 0 && ev.b.indexOf('Just say you') < ev.b.indexOf('Apples in the Rain');
      out.choices = ev.c.length === 3;
      out.noVoice = !window.__vo.length;
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.trig && r.card, 'b. the tannery culvert still opens the game\'s own "A voice beyond the Hedge" card (' + (r.err || '') + ')');
    check(r.hum && r.order, 'b. after the voice, the Hedge hums "Apples in the Rain", off-key on the fourth bar, in the book\'s words');
    check(r.choices && r.noVoice, 'b. the card keeps its three choices; a hum is not a spoken line, so nothing is voiced');

    // ---- h. the hound's bed: a pebble makes no sound at all
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); loadMap('clearing'); G.state = 'play';
      const BED = TOUCHES72.BED;
      out.bedAtGame = Math.hypot(BED[0] - 17.5, BED[1] - 24.5) < 0.01;
      // a hound lying out among the stumps, idle, close enough to hear an ordinary stone
      const h = hydrate({ kind: 'enemy', type: 'hound', x: BED[0] + 2.0, y: BED[1] + 2.0, transient: true });
      h.state = 'idle'; G.ents.push(h);
      G.give('pebble', 3);
      const n0 = G.count('pebble');
      // a skipping stone flies its full reach (5 paces) in open ground: stand that far off and throw at the bed
      T.stand(BED[0] - DISTRACTIONS.pebble.reach + 0.05, BED[1], 0); out.lands = TOUCHES72.inBed(distractionImpact('pebble').x, BED[1]); G.time = (G.time || 0) + 5; G.throwReady = 0;
      window.__msgs.length = 0;
      out.thrown = out.lands && throwDistraction('pebble') === true && G.count('pebble') === n0 - 1;
      out.silent = T.heard(/^The pebble strikes the earth and makes no sound at all\.$/) && !T.heard(/stone clatters/);
      out.nobody = h.state !== 'investigate' && !h.investigation;
      // outside the bed: the game's own stone, heard as usual
      T.stand(BED[0] - 2.0, BED[1] + 3.5, Math.PI); G.time += 5; G.throwReady = 0; window.__msgs.length = 0;
      h.x = BED[0] - 4.5; h.y = BED[1] + 3.5; h.state = 'idle'; delete h.investigation;
      throwDistraction('pebble');
      out.elsewhere = T.heard(/stone clatters/) && !T.heard(/makes no sound at all/) && h.state === 'investigate';
      // a bottle thrown into the bed still breaks (the book drops a pebble)
      G.give('empty_bottle', 1); T.stand(BED[0] - DISTRACTIONS.empty_bottle.reach + 0.05, BED[1], 0); G.time += 5; G.throwReady = 0; window.__msgs.length = 0;
      out.bottle = TOUCHES72.inBed(distractionImpact('empty_bottle').x, BED[1]) && throwDistraction('empty_bottle') === true && T.heard(/glass breaks/) && !T.heard(/makes no sound at all/);
      G.ents.splice(G.ents.indexOf(h), 1);
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.bedAtGame, 'h. the hound\'s bed is the game\'s own (js/maps.js, the clearing) (' + (r.err || '') + ')');
    check(r.thrown && r.silent, 'h. a pebble dropped into the hound\'s bed "struck the earth and made no sound at all"');
    check(r.nobody, 'h. so no listener turns toward it');
    check(r.elsewhere && r.bottle, 'h. anywhere else the stone clatters as before, and the same hound turns to look; a bottle in the bed still breaks');

    // ---- j. Legionnaires with grass through their feet, at the greened quarry's gate
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); loadMap('quarry'); out.before = !T.find('p72_legion').length;
      T.reset(); G.flags.bore_broken = true; G.flags.greening = true; G.escapeTimer = 280; loadMap('quarry');
      const L = T.find('p72_legion'), grass = G.ents.filter((e) => e && e._p72 && /^grass/.test(e._p72));
      out.four = L.length === 4 && grass.length === 4 && L.every((e) => e.sprite === 'legionnaire' && e.transient && !e.solid && e.kind === 'deco');
      out.atGate = L.every((e) => Math.hypot(e.x - G.map.spawn.x, e.y - G.map.spawn.y) < 2.5 && !G.map.isSolidCell(e.x | 0, e.y | 0));
      window.__msgs.length = 0; useDeco(L[0]);
      out.look = T.heard(/^Four of them stand at the gate exactly where they were posted, bells lifted, with grass coming up through their pewter feet, because nobody has told them to do anything else\.$/);
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      out.unsaved = !JSON.stringify(snap).includes('p72_legion');
      restoreGame(snap); G.state = 'play'; out.restaged = T.find('p72_legion').length === 4;
      G.flags.escaped = true; loadMap('quarry'); out.gone = !T.find('p72_legion').length;
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.before, 'j. no grass-footed Legionnaires before the Greening (' + (r.err || '') + ')');
    check(r.four && r.atGate, 'j. during the Greening, four Legionnaires stand passive at the quarry gate, a tuft of grass at each one\'s feet');
    check(r.look, 'j. looked at: "because nobody had told them to do anything else", the book\'s line');
    check(r.unsaved && r.restaged && r.gone, 'j. never saved, restaged on load, and gone once you have escaped');

    // ---- m. colours were brighter once
    r = await page.evaluate(() => {
      const out = {};
      T.reset();
      const prayer = () => /The Church says it is the Cascade: that all things have gone a quarter-tone flat since the Spire of Dawning broke, and will come right again with prayer\./.test(STORYRUM.issueHtml());
      G.flags.kaelen_met = true; out.gazette = prayer();
      T.reset(); G.flags.hedge_answered = true; out.gazette2 = prayer();
      T.reset(); G.flags.kaelen_met = true; G.flags.tobiah_met = true; out.full = !prayer();
      T.reset(); G.flags.hedge_answered = true; G.flags.wearer_dead = true; out.full2 = !prayer();
      T.reset(); G.flags.kaelen_met = true; G.flags.greening = true; out.notGreen = !prayer();
      TOUCHES72.wireRumours(); TOUCHES72.wireRumours();
      out.once = STORYRUM.RUMOURS.filter((x) => x.id === 'p72_colours').length === 1 && STORYRUM.ISSUES.every((s) => s.items.filter((it) => it && it.t === TOUCHES72.TX.prayer).length <= 1);
      T.reset();
      const late = STORYRUM.eligible(STORYRUM.context({ hour: 22.5 }), 'patron').map((x) => x.id);
      const noon = STORYRUM.eligible(STORYRUM.context({ hour: 13 }), 'patron').map((x) => x.id);
      const het = STORYRUM.eligible(STORYRUM.context({ hour: 22.5 }), 'hetty').map((x) => x.id);
      out.late = late.includes('p72_colours') && !noon.includes('p72_colours') && !het.includes('p72_colours');
      const rr = STORYRUM.RUMOURS.find((x) => x.id === 'p72_colours');
      out.words = !!rr && /a red red, a red like a shout/.test(rr.text) && /rust-pink, like a stain that has been scrubbed/.test(rr.text) && /the sun at noon was a thing you could not look at/.test(rr.text);
      out.kept = STORYRUM.RUMOURS.some((x) => x.id === 'a_colour');
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.gazette && r.gazette2, 'm. the Gazette (the quarry and the Hedge issues): the Church says it will come right again with prayer (' + (r.err || '') + ')');
    check(r.full && r.full2, 'm. not where the sheet is already full (four items at most, js/rumours.js)');
    check(r.notGreen && r.once, 'm. not once the town is going under; each issue carries it once');
    check(r.late && r.words, 'm. late at night a townsperson (not Hetty) says the reds were redder, in the book\'s words');
    check(r.kept, 'm. the game\'s own "Red was redder" line is kept');

    // ---- s. Hetty's eyebrows: a drink is a silent nod
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); loadMap('tavern'); G.state = 'play';
      G.player.gold = 5;
      DLG.npc = NPCS.hetty; DLG.ent = null; DLG.log = []; G.state = 'dialogue'; renderDialogue(null);
      const b = document.querySelector('#d-p72-drink');
      out.button = !!b && !b.disabled;
      if (!b) return out;
      b.click();
      const log = DLG.log.map((l) => l.t).join(' | ');
      out.nod = /She raises one eyebrow at you, and you raise one back, and she draws you a leather mug of the dark Reach ale without being asked and puts it on the bar and takes your coin, and that is the whole of the conversation\./.test(log);
      out.toast = /You drink\. Silently\. No toasts\./.test(log);
      out.silentLog = DLG.log.every((l) => l.who !== 'you');
      out.coin = G.player.gold === 4;
      G.player.gold = 0; renderDialogue(null); out.broke = document.querySelector('#d-p72-drink').disabled === true;
      DLG.npc = NPCS.vane; DLG.log = []; renderDialogue(null); out.onlyHetty = !document.querySelector('#d-p72-drink');
      DLG.npc = NPCS.hetty; G.flags.greening = true; renderDialogue(null); out.closed = !document.querySelector('#d-p72-drink');
      closeModal(); G.state = 'play';
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.button, 'Hetty\'s dialogue at the Boar offers a drink (' + (r.err || '') + ')');
    check(r.nod && r.silentLog, 's. buying it is the book\'s silent exchange of eyebrows; you say nothing');
    check(r.toast && r.coin, 's. she takes your coin; you drink. Silently. No toasts.');
    check(r.broke && r.onlyHetty && r.closed, 's. not without a coin, not from anyone else, and not once the town is going under');

    // ---- French
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p72-touches.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
    const texts = await page.evaluate(() => TOUCHES72.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 8 && noFr.length === 0 && tsv.every((x) => x.length === 2), 'every new string has a French pair in p72-touches.tsv and fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((x) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|Hearthday|Greening)\b/.test(x[1])), 'the French follows the glossary (la Haie, Légionnaire)');

    check(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
