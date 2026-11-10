// PREVIEW_URL=http://127.0.0.1:8811 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/herald66.test.js
// The herald and the temptation (Book One ch. 24, "Heartglass"; ROADMAP R9 #21): the column on the keel-block (four
// fingers and a half); Sable at the hatch; the writ read aloud in the clearing, in the book's words, with the crew in a
// ring; twenty yards into the trees, "I'm taking it"; telling Kaelen to take it is an Echo (grey, then the moment again);
// Vane's bad trade and Sable's succession; Lyra answers the herald (walk out with her, or stay in the ring); by the bow,
// "Work."; noon and Port Cantabile; Vane's hand flat on the third crate; the list on the beam and "Not yet."; the end card;
// Lyra without her voice writes on the slate; a save mid-scene; voices; French; no page errors.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /herald66|coda/.test(m.text())) errors.push(m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8811');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Herald Tester');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click();
    await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click();
    await page.locator('#btn-intro-skip').click();
    await page.waitForFunction(() => G.state === 'play');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__realShow = window.showEvent;
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; update(dt || 0.05); } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        pick(re) { const e = T.last(); const c = e && e.c.find((x) => re.test(x.t)); if (c) c.f(); return !!c; },
        first() { const e = T.last(); if (e && e.c[0]) e.c[0].f(); },
        at(x, y) { Engine.cam.x = x; Engine.cam.y = y; },
        ent(k) { return G.ents.find((e) => e && e._h66 === k); },
        npc(id) { return G.maps.deepwoods.entities.find((e) => e && e.id === id); },
        reset(extra) {
          const f = G.flags;
          for (const k of Object.keys(f)) if (/^h66|^herald_|^book_one_done$/.test(k)) delete f[k];
          Object.assign(f, { part3: true, part4: true, sable_with: true, aegis_follow: true, coda_done: true, wearer_dead: true, ring_struck: 'kaelen', tank_patched: true, lyra_voice: true, kaelen_told_now: true }, extra || {});
          hide('#ending'); G.state = 'play'; G.party = null; G.player.glassed = false; G.player.glass = 0;
          for (const e of G.maps.deepwoods.entities) if (e && /_dw$/.test(e.id || '')) e.hidden = false;
          loadMap('deepwoods', { x: 27.5, y: 44.0, dir: Math.PI / 2 }); G.state = 'play';
          codaCheckHerald();
          window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0;
        },
      };
      T.reset();
    });

    // ---- 1 · the column, on the keel-block
    const col = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      out.herald = !T.npc('herald').hidden && f.herald_come;
      out.beam = !!T.ent('beam');
      const q = NPCS.kaelen_dw.quest(G); out.keel = !!q && /keel-block in the grey light/.test(q.text);
      await new Promise((r) => setTimeout(r, 120));
      const c = T.last(); out.card = !!c && /Four fingers and a half/.test(c.t) && /measured it again because the first answer was wrong/.test(c.b) && /drinking in a doorway/.test(c.b) && /three inches from the notch of the throat/.test(c.b);
      out.noOwn = !c.c.some((x) => /your own/.test(x.t));            // only a glassed traveller measures their own
      T.pick(/Hold the end of the string/);
      const b = T.last(); out.column = /1 · 2½ · 3 · 4 · 4½/.test(b.b) && /Six weeks, he thought/.test(b.b) && /counts them twice/.test(b.b) && /"Engineer\."/.test(b.b) && /under a parley flag/.test(b.b);
      out.vo = window.__vo.includes('sable.h66.engineer');
      T.first(); out.flag = !!f.h66_column && G.journal.some((j) => /Four and a half fingers|four and a half fingers/.test(j.text));
      out.beamLook = /1 · 2½ · 3 · 4 · 4½/.test(T.ent('beam').look || '');
      out.again = !/keel-block/.test((NPCS.kaelen_dw.quest(G) || {}).text || '');
      return out;
    });
    if (process.env.DEBUG) console.log('col', JSON.stringify(col));
    check(col.herald && col.beam && col.keel && col.card && col.noOwn, 'the column: Kaelen on the keel-block in the grey light, four fingers and a half, measured twice, three inches from the notch of the throat');
    check(col.column && col.vo && col.flag && col.beamLook && col.again, 'he writes it on the deck-beam under the nine names (1 · 2½ · 3 · 4 · 4½; six weeks); Sable at the hatch: "Engineer." and the man under a parley flag');

    // ---- 2 · the writ
    const writ = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      window.__ev.length = 0; window.__vo.length = 0;
      const q = NPCS.herald.quest(G); await new Promise((r) => setTimeout(r, 120));
      let c = T.last(); out.w1 = !!c && /The writ/.test(c.t) && /about twenty-five/.test(c.b) && /his hands shook the entire time/.test(c.b) && /nine-foot Office automaton eleven feet away/.test(c.b) && /declared Dissonant/.test(c.b) && /stayed, for now/.test(c.b);
      out.ring = ['kaelen', 'lyra', 'vane', 'mags', 'hetty', 'sable', 'pennick', 'aegis'].every((k) => !!T.ent(k) && !T.ent(k).hidden);
      out.campHidden = ['kaelen_dw', 'lyra_dw', 'vane_dw', 'sable_dw', 'mags_dw', 'aegis_dw'].every((id) => T.npc(id).hidden);
      await new Promise((r) => setTimeout(r, 5000)); out.vo1 = ['herald.h66.writ1', 'herald.h66.writ2'].every((id) => window.__vo.includes(id));
      T.first(); c = T.last(); out.w2 = /Hetty Bram said something short/.test(c.b) && /Justiciar Aurelian Vaelen/.test(c.b) && /grace is offered, once/.test(c.b);
      T.first(); c = T.last(); out.w3 = /The glass shall be drawn/.test(c.b) && /Pennick, on his crutch/.test(c.b) && /amnesty, full and recorded/.test(c.b) && /registration waived/.test(c.b) && /He knows what we saw at the Malting/.test(c.b) && /proper disposition by the Office of the Catalogue/.test(c.b) && /"There it is," said Vane/.test(c.b);
      await new Promise((r) => setTimeout(r, 5000)); out.vo3 = ['herald.h66.writ5', 'herald.h66.writ8', 'sable.h66.waived', 'vane.h66.thereitis'].every((id) => window.__vo.includes(id));
      T.first(); out.trees = HERALD66.stage() === 2 && T.heard(/twenty yards into the trees/) && G.journal.some((j) => /The herald read the writ/.test(j.text));
      const tq = NPCS.herald.quest(G); out.waits = /The form allows a reasonable time/.test(tq.text);
      return out;
    });
    if (process.env.DEBUG) console.log('writ', JSON.stringify(writ));
    check(writ.w1 && writ.ring && writ.campHidden && writ.vo1, 'the writ: a young man in white reads it aloud, hands shaking, in a loose and extremely unfriendly ring (the crew staged, the camp figures stood in for)');
    check(writ.w2 && writ.w3 && writ.vo3, 'the book\'s writ: Dissonant, the Justiciar nine days out, grace offered once; the glass drawn; Pennick\'s small noise; "Waived"; proper disposition; "There it is."');
    check(writ.trees && writ.waits, 'Kaelen and Lyra go twenty yards into the trees; the herald waits (the form allows it)');

    // ---- 3 · twenty yards into the trees; telling him to take it is an Echo
    const trees = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      out.staged = Math.hypot(T.ent('kaelen').x - HERALD66.TREES.kaelen[0], T.ent('kaelen').y - HERALD66.TREES.kaelen[1]) < 0.01 && !!T.ent('lyra');
      window.__ev.length = 0; window.__vo.length = 0;
      T.at(HERALD66.TREES.at[0] - 1, HERALD66.TREES.at[1] + 1); T.step(2, 0.05);
      let c = T.last();
      out.card = !!c && /Twenty yards into the trees/.test(c.t) && /"I'm taking it," said Kaelen/.test(c.b) && /Mags could read lips at that distance/.test(c.b) && /Her voice was still a ruin/.test(c.b) && /only Kaelen goes into the dark/.test(c.b) && /four hundred and thirty-two people into a furnace/.test(c.b) && /go back into Legionnaires/.test(c.b) && /Annet Sowerby is in the third crate/.test(c.b) && !/You stay in the ring/.test(c.b);
      out.three = c.c.length === 3 && f.h66_trees === 'near';
      await new Promise((r) => setTimeout(r, 5000)); out.vo = ['kaelen.h66.taking', 'lyra.h66.ofcourse', 'lyra.h66.annet'].every((id) => window.__vo.includes(id));
      T.pick(/Take it/); const e = T.last();
      out.echo = /An Echo/.test(e.t) && /a thread that was not taken/.test(e.b) && /lies down on a table for the man who used him/.test(e.b) && /proper disposition/.test(e.b) && /It also did not unhappen/.test(e.b) && document.querySelector('canvas').style.filter.includes('grayscale') && f.h66_echoes === 1 && !f.herald_answered;
      out.echoVo = window.__vo.includes('weaver.h66.thread');
      e.c[0].f(); const b = T.last();
      out.back = /You are back under the trees/.test(b.b) && b.c.length === 3 && !document.querySelector('canvas').style.filter.includes('grayscale') && HERALD66.stage() === 3;
      T.pick(/Say nothing/); const o = T.last();
      out.others = /A bad trade/.test(o.t) && /The others came up, because of course they did/.test(o.b) && /I've made a career of bad trades and that one's bad/.test(o.b) && /That is a <i>succession<\/i>/.test(o.b) && /The wood was very quiet/.test(o.b) && /he will be polite about that too/.test(o.b);
      await new Promise((r) => setTimeout(r, 5000)); out.othersVo = ['vane.h66.trade', 'sable.h66.succession'].every((id) => window.__vo.includes(id));
      out.atTrees = !!T.ent('vane') && Math.hypot(T.ent('vane').x - HERALD66.TREES.vane[0], T.ent('vane').y - HERALD66.TREES.vane[1]) < 0.01;
      return out;
    });
    if (process.env.DEBUG) console.log('trees', JSON.stringify(trees));
    check(trees.staged && trees.card && trees.three && trees.vo, '"I\'m taking it": twenty yards into the trees, which fools nobody; "only Kaelen goes into the dark"; "Proper disposition. Say what it means."; Annet Sowerby in the third crate');
    check(trees.echo && trees.echoVo && trees.back, 'telling him to take it is an Echo, grey: the Tide-Weaver\'s thread not taken (the table, the glass drawn, proper disposition), then back under the trees with the choice again');
    check(trees.others && trees.othersVo && trees.atTrees, 'the others come up: Vane\'s bad trade, Sable\'s succession, "he will be polite about that too"');

    // ---- 5 · the answer; 6 · the bow; 7 · noon; 8 · the hold and the beam; the end card
    const end = await page.evaluate(async () => {
      const out = {}, f = G.flags;
      window.__vo.length = 0; T.first(); let c = T.last();
      out.a0 = /In the end it was Lyra who answered the herald, because Kaelen found that he could not/.test(c.b) && c.c.length === 2 && Math.hypot(T.ent('lyra').x - 27.5, T.ent('lyra').y - 49.5) < 0.01;
      T.pick(/Walk out/); c = T.last();
      out.a1 = /a yard behind her shoulder/.test(c.b) && /in that torn and carrying voice/.test(c.b) && /declines it/.test(c.b) && /not goods and are not in his gift/.test(c.b) && /we are taking them home/.test(c.b) && /And Engineer Vance declines grace/.test(c.b) && /"He will ask me why," he said/.test(c.b) && /we heard the question too/.test(c.b);
      out.flags = f.herald_answered && f.herald_by_lyra && f.h66_beside && G.journal.some((j) => /Lyra answered the herald herself/.test(j.text));
      await new Promise((r) => setTimeout(r, 5000)); out.vo = ['lyra.h66.write', 'herald.h66.why', 'lyra.h66.question'].every((id) => window.__vo.includes(id));
      T.first(); out.bowStage = HERALD66.stage() === 6 && T.npc('herald').hidden && !T.ent('hetty') && !T.npc('mags_dw').hidden && T.npc('kaelen_dw').hidden && T.heard(/goes round to the bow/);
      window.__ev.length = 0; T.at(HERALD66.TREES.at[0], HERALD66.TREES.at[1]); T.step(Math.ceil(HERALD66.consts.FAR_BOW / 0.25) + 4, 0.25);
      c = T.last(); out.bowFar = !!c && /By the bow/.test(c.t) && /From the fire you can see the two of them/.test(c.b) && /You don't get to pay. You get to <i>help<\/i>/.test(c.b) && /"Work," said Lyra/.test(c.b) && /because the right one was easy/.test(c.b) && f.h66_bow === 'far';
      T.first(); c = T.last();
      out.noon = /Port Cantabile/.test(c.t) && /Mags went up the envelope at noon/.test(c.b) && /"Port Cantabile," said Pennick/.test(c.b) && /"Right," said Vane/.test(c.b) && !/hand flat on the third one/.test(c.b);
      T.first(); out.hold = HERALD66.stage() === 8 && !!T.ent('vane') && T.npc('vane_dw').hidden && T.heard(/Vane has gone to the crates/);
      T.at(HERALD66.CRATES[0] + 0.5, HERALD66.CRATES[1] + 0.8); T.step(2, 0.05);
      out.vane = T.heard(/with his hand flat on the third one/) && f.h66_vane === true;
      window.__ev.length = 0; useDeco(T.ent('beam')); c = T.last();
      out.list = !!c && /Not yet/.test(c.t) && /read his own list on the beam/.test(c.b) && /<i>Tamsin Reed<\/i>/.test(c.b) && /Tam — \(no surname\. ASK\.\)/.test(c.b) && /<i>Halder Wick<\/i>/.test(c.b) && /Coralie/.test(c.b) && /Somebody has to hold it/.test(c.b) && /<i>Not yet\.<\/i>/.test(c.b);
      T.first();
      out.ended = G.state === 'ending' && HERALD66.stage() === 10 && !T.npc('kaelen_dw').hidden && !T.npc('vane_dw').hidden && !T.ent('kaelen') && !T.ent('vane');
      const txt = document.querySelector('#ending-text').textContent;
      out.endText = /Kaelen measured his tideline on the keel-block/.test(txt) && /were shown the thread where he did/.test(txt) && /stood a yard behind her shoulder/.test(txt) && /we heard the question too/.test(txt) && /Not yet/.test(txt);
      return out;
    });
    if (process.env.DEBUG) console.log('end', JSON.stringify(end));
    check(end.a0 && end.a1 && end.flags && end.vo, 'Lyra answers the herald, because Kaelen could not; walk out with her and stand a yard behind her shoulder; the book\'s answer, "we heard the question too"');
    check(end.bowStage && end.bowFar, 'the herald gone; by the bow, seen from the fire if you do not go: "You don\'t get to pay. You get to help." "Work." The glass hand, because the right one was easy');
    check(end.noon && end.hold && end.vane, 'noon: Mags up the envelope, Pennick and the tank, "Port Cantabile", "Right"; Vane at the crates with his hand flat on the third one');
    check(end.list && end.ended && end.endText, 'that night the list on the beam (Tamsin Reed … Coralie) and "Not yet."; the camp is back; the end card tells it as played');

    // ---- the other ways: no voice (the slate), glassed (your own tideline), far from the trees, Halder alive, a save mid-scene
    const other = await page.evaluate(async () => {
      const out = {};
      T.reset({ lyra_voice: false, kaelen_told_now: false, halder_safe: true, sable_with: false, aegis_follow: false });
      let f = G.flags; G.player.glassed = true; G.player.glass = 42;
      NPCS.kaelen_dw.quest(G); await new Promise((r) => setTimeout(r, 120));
      const c = T.last(); out.own = c.c.some((x) => /your own tideline/.test(x.t)); T.pick(/your own tideline/);
      out.ownText = /3 fingers/.test(T.last().b) && /There is a man in the clearing, in white/.test(T.last().b) && !/"Engineer\."/.test(T.last().b);
      T.first(); NPCS.herald.quest(G); await new Promise((r) => setTimeout(r, 120));
      out.noAegis = !/automaton/.test(T.last().b) && !T.ent('aegis') && !T.ent('sable');
      T.first(); T.first(); out.noWaived = !/Waived/.test(T.last().b); T.first();
      // stay in the ring: after a while it plays anyway, heard from there
      window.__ev.length = 0; window.__vo.length = 0; T.at(27.5, 48.0); T.step(Math.ceil(HERALD66.consts.FAR_TREES / 0.25) + 4, 0.25);
      let t = T.last(); out.far = !!t && /You stay in the ring by the herald/.test(t.b) && /wrote it on her slate/.test(t.b) && !/Her voice was still a ruin/.test(t.b) && t.c.length === 1 && f.h66_trees === 'far';
      out.noLyraVo = window.__vo.includes('kaelen.h66.taking') && !window.__vo.some((id) => /^lyra\./.test(id));
      T.first(); t = T.last(); out.noSable = !/succession/.test(t.b) && /The wood was very quiet/.test(t.b);
      // a save during the answer shows the card again
      T.first(); const snap = JSON.parse(JSON.stringify(snapshotGame()));
      window.__ev.length = 0; restoreGame(snap); f = G.flags; G.state = 'play';
      await new Promise((r) => setTimeout(r, 50));
      t = T.last(); out.resumed = !!t && /In the end it was Lyra who answered/.test(t.b) && HERALD66.stage() === 5 && G.ents.filter((e) => e && e._h66 === 'lyra').length === 1 && T.npc('kaelen_dw').hidden;
      T.pick(/Stay in the ring/); t = T.last(); out.slate = /wrote on her slate, a line at a time/.test(t.b) && !/torn and carrying voice/.test(t.b) && !f.h66_beside;
      // a save on the answer card shows the answer again, not the choice, and does not write the journal twice
      const nJ = G.journal.filter((j) => /Lyra answered the herald herself/.test(j.text)).length; window.__ev.length = 0; restoreGame(JSON.parse(JSON.stringify(snapshotGame()))); f = G.flags; G.state = 'play'; await new Promise((r) => setTimeout(r, 50));
      t = T.last(); out.reAnswered = !!t && /wrote on her slate, a line at a time/.test(t.b) && t.c.length === 1 && G.journal.filter((j) => /Lyra answered the herald herself/.test(j.text)).length === nJ;
      // a save on the noon card shows noon again, not the bow
      T.first(); f.h66 = 7; f.h66_bow = 'near'; HERALD66.noon(); window.__ev.length = 0;
      restoreGame(JSON.parse(JSON.stringify(snapshotGame()))); f = G.flags; G.state = 'play'; await new Promise((r) => setTimeout(r, 50));
      t = T.last(); out.reNoon = !!t && /Port Cantabile/.test(t.t); T.first();
      f.h66 = 8; HERALD66.stageMap(G.map);
      window.__msgs.length = 0; useDeco(T.ent('beam')); t = T.last();
      out.pick = !T.ent('beam').nopick && !T.ent('vane').nopick;
      out.told = T.heard(/hand flat on the third one/) && f.h66_vane === 'told';
      out.halder = !/Halder Wick/.test(t.b) && /Coralie/.test(t.b);
      return out;
    });
    if (process.env.DEBUG) console.log('other', JSON.stringify(other));
    check(other.own && other.ownText, 'glassed, you can measure your own tideline with his string; without Sable the man in the clearing is told, not put in her mouth');
    check(other.noAegis && other.noWaived && other.far && other.noLyraVo && other.noSable, 'stay in the ring and hear it anyway; without her voice Lyra writes on the slate and her recordings stay silent; no automaton or Sable where they did not come');
    check(other.resumed && other.slate && other.reAnswered && other.reNoon, 'a save during the answer shows the card again, staged once (and once answered, the answer, journalled once); a save at noon shows noon; the answer on the slate');
    check(other.told && other.halder && other.pick, 'go straight to the beam and Vane\'s hand on the third crate is told there; Halder Wick is not on the beam if you kept him alive');

    // ---- the old flow is replaced, not duplicated; voices; French
    const coda = src('js/coda.js');
    check(/HERALD66\.fromTalk\(\)/.test(coda) && /herald66\.js\?v=1/.test(src('index.html')), 'coda.js hands the herald to herald66 (the old card is its fallback); index.html loads it');
    const vo = await page.evaluate(() => ({ missing: Object.values(HERALD66.VO).flat().filter((id) => !VOICE_ACT.LINES[id]) }));
    check(vo.missing.length === 0, 'the chapter is voiced: every card has its recorded lines (' + (vo.missing.slice(0, 3).join(', ') || 'all there') + ')');
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p66-herald.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await page.evaluate(() => HERALD66.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 100 && noFr.length === 0 && tsv.every((r) => r.length === 2), 'every registered string has a French pair in p66-herald.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    const frShown = await page.evaluate(async () => {
      await ACCESS.setLocale('fr'); const X = HERALD66.TX;
      window.__realShow(X.treesTitle, [X.t1a, X.t1b + ' <span>' + X.t1voice + '</span> ' + X.t1c, X.t1d, X.annet].join('<br><br>'), [{ t: X.chTake, f: null }]);
      await new Promise((r) => setTimeout(r, 600));
      const txt = document.querySelector('#event-panel').textContent; hide('#event'); await ACCESS.setLocale('en');
      return txt;
    });
    check(/Je l.accepte/.test(frShown) && /Sa voix était encore une ruine/.test(frShown) && /troisième caisse/.test(frShown) && !/taking it|third crate/.test(frShown), 'in French the trees card reads in French, piece by piece (' + frShown.slice(0, 80) + ')');
    check(!tsv.some((r) => /\b(Le Hush|les Hollows|Cantor\b|the Hedge|the Reach|Hearthday|Tide-Weaver)\b/.test(r[1])), 'the French follows the glossary');

    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL HERALD TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
