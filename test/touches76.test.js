// PREVIEW_URL=http://127.0.0.1:8839 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/touches76.test.js
// Small canon touches IV (js/touches76.js; R9 #25 g, i, l, p; Book One): Kaelen's charcoal clamps, walked for coin (one
// goes quiet before it pops; turf it in time); Pim's whistle as a tool in fog, and the mimic that learns you used it;
// Consecrated (the sermon that comes round to the glass, and the ward-sign made twice beside a Synod soldier); and the
// Veil's third rule, when a ledger entry carries a comforting note and Sable is with you.
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
    page.on('console', (m) => { if (m.type() === 'warning' && /touches76/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8839');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof TOUCHES76 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
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
      window.__ev = []; window.__realShow = window.showEvent; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.__echo = 0; if (typeof RITE43 !== 'undefined') RITE43.echo = function () { window.__echo++; };
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0; },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        stand(x, y, dir) { Engine.cam.x = x; Engine.cam.y = y; if (dir != null) Engine.cam.dir = dir; },
        find(use) { return G.ents.filter((e) => e && e.use === use && !e.hidden); },
        run(secs) { for (let t = 0; t < secs; t += 1 / 30) { G.state = 'play'; update(1 / 30); } },
        pick(ev, re) { const c = ev && ev.c && ev.c.find((x) => re.test(x.t)); if (c && c.f) c.f(); return !!c; },
      };
    });

    // ---- g. Kaelen's charcoal clamps
    let r = await page.evaluate(() => {
      const out = {};
      T.reset(); G.flags.kaelen_met = true; loadMap('clearing'); G.state = 'play';
      const C = T.find('p76_clamp');
      out.four = C.length === 4 && C.every((e) => e.transient && e.kind === 'deco' && !G.map.isSolidCell(e.x | 0, e.y | 0));
      out.near = C.every((e) => Math.hypot(e.x - 13.5, e.y - 16.5) < 9);
      out.unsaved = !JSON.stringify(snapshotGame()).includes('p76_clamp');
      window.__ev.length = 0; useDeco(C[0]);
      const card = window.__ev.find((e) => e.t === 'The charcoal clamps');
      out.card = !!card && /A clamp is only a heap of cordwood built into a careful dome/.test(card.b)
        && /A good clamp breathes, a low steady hiss through the vent-holes\. A clamp about to flare goes quiet first, and then pops/.test(card.b)
        && /the finest ear for failure of any student in forty years\. It was meant as praise\./.test(card.b);
      out.kaelenSilent = !!card && !/Kaelen says|"[^"]*," Kaelen/.test(card.b);
      T.pick(card, /Walk the clamps/);
      const J = TOUCHES76.job();
      out.running = !!J && J.round === 1 && J.quiet < 0;
      // breathing clamps hiss; the quiet one stops
      T.stand(C[0].x + 1.2, C[0].y, Math.PI); window.__msgs.length = 0;
      for (let i = 0; i < 600 && TOUCHES76.job().quiet < 0; i++) T.run(1 / 30);
      const q = TOUCHES76.job().quiet; out.quiet = q >= 0;
      const before = TOUCHES76.job().hissed.slice(); T.run(3);
      const after = TOUCHES76.job().hissed;
      out.hush = after[q] === before[q] && after.some((n, i) => i !== q && n > before[i]);
      // turf it in time: saved
      const clamps = T.find('p76_clamp'), qe = clamps.find((e) => e._p76 === 'clamp' + q);
      window.__msgs.length = 0; useDeco(qe);
      out.turfed = T.heard(/^You kneel and pack turf over two of its vents and listen until the breathing slows\.$/) && TOUCHES76.job().saved === 1;
      // round two: turf a breathing one, and it dies; leave the quiet one, and it pops
      for (let i = 0; i < 600 && TOUCHES76.job().quiet < 0; i++) T.run(1 / 30);
      const q2 = TOUCHES76.job().quiet, wrong = T.find('p76_clamp').find((e) => e._p76 !== 'clamp' + q2 && !TOUCHES76.job().dead[+e._p76.slice(5)]);
      window.__msgs.length = 0; useDeco(wrong);
      out.died = T.heard(/^Too little air, and it dies\.$/) && TOUCHES76.job().lost === 1;
      T.run(TOUCHES76.B.POP + 0.5);
      out.popped = T.heard(/a small hollow crack, deep in the stack, like a knuckle/) && T.heard(/A heap of ash, and a lost week\./) && TOUCHES76.job().lost === 2;
      // round three, saved again; then the coin
      const gold0 = G.player.gold | 0;
      for (let i = 0; i < 900 && TOUCHES76.job() && TOUCHES76.job().quiet < 0; i++) T.run(1 / 30);
      const q3 = TOUCHES76.job() && TOUCHES76.job().quiet;
      if (q3 >= 0) useDeco(T.find('p76_clamp').find((e) => e._p76 === 'clamp' + q3));
      T.run(0.2);
      out.done = !TOUCHES76.job() && G.flags.p76_cday === (G.day | 0) + 1;
      out.paid = (G.player.gold | 0) === gold0 + 2 * TOUCHES76.B.PAY && T.heard(/left on the gatepost/);
      window.__msgs.length = 0; useDeco(T.find('p76_clamp')[0]);
      out.today = T.heard(/^The clamps are walked for today\.$/);
      out.noEcho = window.__echo === 0;
      // leaving mid-job ends it, paid for what was saved
      G.flags.p76_cday = 0; window.__ev.length = 0; useDeco(T.find('p76_clamp')[0]); T.pick(window.__ev.find((e) => e.t === 'The charcoal clamps'), /Walk the clamps/);
      loadMap('oakhaven'); G.state = 'play'; T.run(0.1);
      out.left = !TOUCHES76.job();
      T.reset(); G.flags.kaelen_met = true; G.flags.rite_started = true; loadMap('clearing'); out.gone = !T.find('p76_clamp').length;
      return out;
    }).catch((e) => ({ err: String(e && e.stack || e) }));
    check(r.four && r.near && r.unsaved, 'g. four clamps by Kaelen\'s hut in the clearing, transient (' + (r.err || '') + ')');
    check(r.card && r.kaelenSilent, 'g. the clamps card is the book\'s: the careful dome, the breathing, the pop; "the finest ear for failure"; Kaelen says nothing');
    check(r.running && r.quiet && r.hush, 'g. walked for a day: the breathing clamps hiss, and one goes quiet');
    check(r.turfed, 'g. turf the quiet one in time and it is saved');
    check(r.died && r.popped, 'g. turf a breathing one and it dies; leave the quiet one and it pops "like a knuckle"');
    check(r.done && r.paid && r.today, 'g. paid in coin for each clamp saved, left on the gatepost; once a day');
    check(r.noEcho && r.left && r.gone, 'g. failure only costs the clamp (never an Echo); leaving ends the day; no clamps once the Rite has begun');

    // ---- i. Pim's whistle as a tool
    r = await page.evaluate(() => {
      const out = {};
      const btn = () => document.querySelector('#p76-whistle');
      T.reset(); loadMap('oakhaven'); G.state = 'panel'; renderSongs(); out.noneYet = !btn(); closeModal();
      T.reset(); G.flags.p49_whistle = 1; loadMap('oakhaven'); G.state = 'panel'; renderSongs(); out.row = !!btn();
      btn().click(); out.inside = T.heard(/^You whistle it, the falling fifth: the Root, and down\.$/) && !G.flags.p76_heard && G.state === 'play';
      // outside the Hedge, the first time: the thing outside hears it, and says nothing yet
      Weather.set('mist', 3); loadMap('clearing'); G.state = 'play'; window.__msgs.length = 0; G.time += 10;
      TOUCHES76.whistle(); out.heardOnce = G.flags.p76_heard === 1 && !T.heard(/interval exactly right/);
      // Part Four, fog: Lyra whistles it back from where she is
      T.reset(); Object.assign(G.flags, { p49_whistle: 1, p76_heard: 1, part4: true }); loadMap('deepwoods'); G.state = 'play';
      Weather.set('mist', 3);
      partyJoin('lyra'); const e = partyEnt(); const c = Engine.cam;
      e.x = c.x - Math.sin(c.dir) * 5; e.y = c.y + Math.cos(c.dir) * 5;   // five paces to the right
      window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle();
      out.lyra = T.heard(/^Two notes, down, from your right, some way off: Lyra, whistling it back\.$/);
      out.mimic = T.heard(/Two notes\. The Root, and down\. It got the interval exactly right\./);
      e.x = c.x + Math.sin(c.dir) * 5; e.y = c.y - Math.cos(c.dir) * 5; window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle();
      out.left = T.heard(/^Two notes, down, from your left, some way off: Lyra, whistling it back\.$/);
      G.flags.wearer_dead = true; window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle(); out.noMimic = !T.heard(/interval exactly right/);
      Weather.set('clear', 3); window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle(); out.clear = !T.heard(/whistling it back/);
      partyDismiss(true); partyJoin('kaelen'); Weather.set('mist', 3); window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle();
      out.kaelen = T.heard(/glass rings once, faintly: Kaelen's hand, answering\./);
      partyDismiss(true);
      // Sable has no answer the book gives her; a downed Lyra cannot whistle
      partyJoin('sable'); window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle();
      out.sable = !!G.party && G.party.id === 'sable' && !T.heard(/whistling it back|glass rings/);
      partyDismiss(true); partyJoin('lyra'); G.party.downed = { lyra: true }; window.__msgs.length = 0; G.time += 10; TOUCHES76.whistle();
      out.downed = !T.heard(/whistling it back/);
      partyDismiss(true); Weather.set('clear', 3);
      return out;
    }).catch((e) => ({ err: String(e && e.stack || e) }));
    check(r.noneYet && r.row, 'i. the Song-book offers the whistle only once you have whistled it with Lyra (' + (r.err || '') + ')');
    check(r.inside, 'i. inside the Hedge it is only a whistle');
    check(r.heardOnce, 'i. used outside the Hedge once, it is heard: nothing answers yet');
    check(r.lyra && r.left, 'i. in fog, Lyra whistles it back, and you can tell where she is');
    check(r.mimic && r.noMimic, 'i. from then on the Wearer answers too: "It got the interval exactly right." (not once it is dead)');
    check(r.clear && r.kaelen, 'i. no answer is needed out of the fog; Kaelen answers with the glass');
    check(r.sable && r.downed, 'i. nobody else answers for them: not Sable, and not Lyra when she is down');

    // the porch: the Wearer uses it on you
    r = await page.evaluate(() => {
      const out = {};
      const walk = () => {
        window.__ev.length = 0; porchVoice(); update(1 / 30);   // a frame goes by before any choice is clicked
        for (let i = 0; i < 10; i++) {
          const ev = window.__ev[window.__ev.length - 1]; if (!ev || ev.t === 'Seven times') return ev;
          if (!(T.pick(ev, /^Say nothing\.$|Do not turn|do not answer|Never answer/) || (ev.c[0] && ev.c[0].f && (ev.c[0].f(), true)))) return null;
        }
        return null;
      };
      T.reset(); G.flags.p76_heard = 0; let ev = walk(); out.plain = !!ev && !/your whistle/.test(ev.b);
      T.reset(); G.flags.p76_heard = 1; ev = walk();
      out.whistle = !!ev && /Then your whistle, the one you blew outside the Hedge: two notes, the Root, and down\. It got the interval exactly right\./.test(ev.b)
        && ev.b.indexOf('your whistle') < ev.b.indexOf('You do not make a sound');
      return out;
    }).catch((e) => ({ err: String(e && e.stack || e) }));
    check(r.plain && r.whistle, 'i. at the Cloister porch it whistles your whistle back at you, once you have used it outside (' + (r.err || '') + ')');

    // ---- l. Consecrated
    r = await page.evaluate(() => {
      const out = {};
      // a Chapel-day: the Dawnday sermon at first light
      T.reset();
      let d = 0; while (SYNOD15.sermonDay(d) !== 0) d++;
      G.day = d; G.tod = 7 / 24; loadMap('chapel'); G.state = 'play';
      const seat = SYNOD15.seatEnt(); T.stand(seat.x, seat.y + 0.4);
      out.open = !!SYNOD15.openSermon(); SYNOD15.finishSermon(); update(1 / 30);
      const box = document.querySelector('#s15-lines');
      out.cons = !!box && /The sermon comes round to the Consecrated and the blessing of the glass, and some of them look toward the North Gate with a kind of nervous piety\./.test(box.textContent);
      update(1 / 30); out.once = (box.textContent.match(/nervous piety/g) || []).length === 1;
      SYNOD15.closeSermon(); G.state = 'play';
      // the ward-sign twice: glassed, beside a Legionnaire, in the lanes
      const lane = () => {
        loadMap('oakhaven'); G.state = 'play'; G.tod = 0.5;
        const c = Engine.cam; T.stand(23.5, 36.5, -Math.PI / 2);
        for (const e of G.ents) if (e && e.kind === 'npc') e.hidden = true;   // only our witness sees it
        const spot = [[0, 2], [0, -2], [2, 0], [-2, 0]].map(([dx, dy]) => [c.x + dx, c.y + dy]).find(([x, y]) => !G.map.isSolidCell(x | 0, y | 0));
        const w = hydrate({ kind: 'npc', id: 'townswoman', x: spot[0], y: spot[1], facing: Math.atan2(c.y - spot[1], c.x - spot[0]), transient: true }); G.ents.push(w);
        return w;
      };
      T.reset(); G.player.glassed = true; const w1 = lane();
      window.__msgs.length = 0; T.run(1); out.noSoldier = !T.heard(/makes it again, faster/);
      const leg = { kind: 'deco', sprite: 'legionnaire', x: Engine.cam.x + 0.9, y: Engine.cam.y, transient: true }; G.ents.push(leg);
      window.__msgs.length = 0; T.run(1);
      out.twice = T.heard(/^A woman in a doorway makes the ward-sign at you, fingers to lips and fingers to ear, and then, because you are walking beside a Synod soldier, makes it again, faster\.$/);
      window.__msgs.length = 0; T.run(1); out.daily = !T.heard(/makes it again, faster/) && G.flags.p76_wday === (G.day | 0) + 1;
      // a Legionnaire that is after you is not walking beside you
      T.reset(); G.player.glassed = true; lane();
      const foe = hydrate({ kind: 'enemy', type: 'legionnaire', x: Engine.cam.x + 0.9, y: Engine.cam.y, transient: true }); foe.state = 'chase'; G.ents.push(foe);
      window.__msgs.length = 0; T.run(0.5); out.notFoe = !T.heard(/makes it again, faster/) && !G.flags.p76_wday;
      G.ents.splice(G.ents.indexOf(foe), 1);
      T.reset(); G.player.glassed = false; lane(); G.ents.push(leg); leg.x = Engine.cam.x + 0.9; leg.y = Engine.cam.y;
      window.__msgs.length = 0; T.run(1); out.notGlassed = !T.heard(/makes it again, faster/);
      void w1;
      return out;
    }).catch((e) => ({ err: String(e && e.stack || e) }));
    check(r.open && r.cons && r.once, 'l. a Chapel-day sermon comes round to the Consecrated, and they look toward the North Gate (' + (r.err || '') + ')');
    check(r.twice && r.daily, 'l. glassed, beside a Synod soldier in the lanes: the ward-sign, and then again, faster (once a day)');
    check(r.noSoldier && r.notGlassed && r.notFoe, 'l. not without the soldier (nor beside one that is after you), and not unless you carry the glass');

    // ---- p. the Veil's three rules
    r = await page.evaluate(() => {
      const out = {};
      const open = () => { G.state = 'panel'; renderLedger(); return [...document.querySelectorAll('#modal-panel select.p76-note')]; };
      const choose = (i, v) => { const s = open()[i]; s.value = v; s.dispatchEvent(new Event('change')); };
      T.reset(); G.ledger = [{ name: 'Davin Hale', where: 'Oakhaven', day: 2 }, { name: 'Annet Sowerby', where: 'the Kestrel\'s hold', day: 4 }];
      let sel = open(); out.rows = sel.length === 2 && sel.every((s) => s.value === '' && [...s.options].map((o) => o.value).join(',') === ',plain,comfort');
      choose(0, 'plain'); out.plain = G.ledger[0].p76n === 'plain' && /Oakhaven, Hearthday\./.test(document.querySelector('#modal-panel').textContent);
      choose(1, 'comfort'); out.comfort = G.ledger[1].p76n === 'comfort' && !G.ledger[1].p76s && /Died bravely\./.test(document.querySelector('#modal-panel').textContent) && !window.__ev.length;
      choose(1, ''); out.cleared = !G.ledger[1].p76n;
      // with Sable
      G.flags.sable_joined = true; window.__ev.length = 0; choose(1, 'comfort');
      const card = window.__ev.find((e) => e.t === 'The margin');
      out.sable = !!card && /Sable reads it over your shoulder, and draws a line through it\./.test(card.b)
        && /The Veil keeps three rules\. Write what happened\. Write who it happened to\. Do not comfort yourself in the margin\./.test(card.b);
      out.struck = G.ledger[1].p76s === true;
      G.state = 'panel'; renderLedger(); out.shownStruck = !!document.querySelector('#modal-panel s.p76-struck');
      window.__ev.length = 0; window.__msgs.length = 0; choose(0, 'comfort');
      out.later = !window.__ev.length && T.heard(/^Sable draws a line through it\.$/) && G.ledger[0].p76s === true;
      out.noVoice = !window.__vo.length;
      const snap = JSON.parse(JSON.stringify(snapshotGame())); restoreGame(snap);
      out.kept = G.ledger[1].p76n === 'comfort' && G.ledger[1].p76s === true;
      // an old save: entries with no note, and a hostile one
      const old = JSON.parse(JSON.stringify(window.__base)); old.ledger = [{ name: 'Old Tam', where: 'the Flume', day: 3 }, { name: 'X', where: 'Y', day: 1, p76n: '<b>bad</b>' }];
      restoreGame(old); sel = open(); out.old = sel.length === 2 && sel[0].value === '' && sel[1].value === '' && !document.querySelector('#modal-panel b');
      closeModal(); G.state = 'play';
      return out;
    }).catch((e) => ({ err: String(e && e.stack || e) }));
    check(r.rows, 'p. [PROPOSED UI] each ledger entry has a margin: no note, a plain note, or a comforting one (' + (r.err || '') + ')');
    check(r.plain && r.comfort && r.cleared, 'p. the plain note says where and when; without Sable a comfort stands');
    check(r.sable && r.struck && r.shownStruck, 'p. with Sable, she draws a line through it: "Do not comfort yourself in the margin."');
    check(r.later && r.noVoice, 'p. after the first time, only the line through it; narration, so nothing is voiced');
    check(r.kept && r.old, 'p. notes are saved; old saves load with no notes, and a bad note is ignored');

    // ---- French
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p76-touches.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
    const texts = await page.evaluate(() => TOUCHES76.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 20 && noFr.length === 0 && tsv.every((x) => x.length === 2), 'every new string has a French pair in p76-touches.tsv and fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((x) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|Hearthday|Greening|Narrow)\b/.test(x[1])), 'the French follows the glossary (la Haie, l\'Étroit, Légionnaire)');

    check(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
