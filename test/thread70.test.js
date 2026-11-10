// PREVIEW_URL=http://127.0.0.1:8833 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/thread70.test.js
// Echo I, "The Thread Where She Answered", played as an extra (js/thread70.js; Book One, Echo I; ROADMAP R9 #24).
//   registration with EXTRAS17 (tagged "Echo I of Book One"); every book line of the module is in the manuscript; the
//   Weaver's opening (the epigraph, "who is talking", "a thread that was not taken", "One night."); the world is grey for
//   the whole extra; out at the dead hour to the stone; "there's my lark", "hello, Da"; "Come through"; eleven noes;
//   getting up is another thread (RITE43.echo, grey), and you are back on the stone; the twelfth time, "Don't. I'm
//   coming."; "four hundred and eleven times"; the drain, eleven seconds, four minutes; what comes back walks up Cooper's
//   Row in her boots and lies down in her bed; "And it is very good."; Kaelen at her door, at her table, his hum not
//   recognized; the rest, and the margin, and the Tide-Weaver; finish. A save mid-asking; the Book One game
//   byte-identical after; the modules that stand down in extras; the voices; French; no page errors.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));
const SHOT = process.env.SHOT || '';

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: SHOT ? 2 : 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /thread70|extras17/.test(m.text())) errors.push(m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8833');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && !document.querySelector('#loading')?.classList.contains('on'));
    const E = (f, a) => page.evaluate(f, a);

    // ---- book accuracy: every line the module does not mark [PROPOSED] is in the manuscript, word for word
    const book = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md').replace(/\r/g, '');
    const echoI = book.slice(book.indexOf('## ECHO I'));
    const words = await E(() => Object.keys(THREAD70.TX).filter((k) => !THREAD70.PROPOSED.includes(k)).map((k) => [k, THREAD70.TX[k]]));
    const asBook = (t) => t.replace(/<\/?i>/g, '*').split(/<br\s*\/?>/).map((p) => p.trim()).filter(Boolean);
    const notInBook = words.filter(([, t]) => !asBook(t).every((p) => book.includes(p) || book.includes(p.replace(/^\*(.*)\*$/, '$1'))));
    check(words.length >= 70 && notInBook.length === 0, 'every line of the scene not marked [PROPOSED] is the manuscript\'s, word for word (' + words.length + ' lines' + (notInBook.length ? '; not in the book: ' + notInBook.slice(0, 3).map((w) => w[0]).join(', ') : '') + ')');
    const inEcho = ['who', 'thread', 'went', 'come', 'twelfth', 'coming', 'watched', 'good', 'looking'].every((k) => { const t = words.find((w) => w[0] === k); return t && asBook(t[1]).every((p) => echoI.includes(p)); });
    check(inEcho, 'and the scene\'s lines come from Echo I itself');

    // ---- registration, before any game
    const reg = await E(() => { const x = EXTRAS17.list().find((r) => r.id === 'echoone'); return x ? { title: x.title, tag: x.tag, start: typeof x.start } : null; });
    check(reg && reg.title === 'The Thread Where She Answered' && reg.tag === 'Echo I of Book One' && reg.start === 'function', 'registered with EXTRAS17 as "The Thread Where She Answered", tagged "Echo I of Book One"');
    check(await E(() => typeof THREAD70 !== 'undefined' && !THREAD70.active() && !Object.keys(buildAllMaps()).some((k) => /^t70_/.test(k))), 'inert at the title: not active, and buildAllMaps() builds no Cooper\'s Row');
    const menu = await E(() => {
      EXTRAS17.state.ack = 1; EXTRAS17.state.done = 1; EXTRAS17.render();
      const c = document.querySelector('#modal-panel .x17-card[data-extra="echoone"]');
      const r = c ? { tag: c.querySelector('.x17-tag').textContent, play: !!c.querySelector('#x17-play-echoone') } : null;
      closeModal(); EXTRAS17.state.done = 0; return r;
    });
    check(menu && menu.tag === 'Echo I of Book One' && menu.play, 'its card in the Extras menu carries its own tag');

    // ---- a Book One game, and its saves, before the extra
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Thread Tester');
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
    const before = await E(() => {
      G.flags.kaelen_met = true; G.state = 'panel';
      SLOTS[0] = JSON.parse(JSON.stringify(snapshotGame()));
      const keep = (k, v) => (/^p7t_[gr]ms$/.test(k) ? undefined : v);
      window.__book = () => JSON.stringify({ slots: SLOTS, flags: G.flags, journal: G.journal, ledger: G.ledger, map: G.mapId, name: G.player.name, day: G.day }, keep);
      return window.__book();
    });

    await E(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { if (G.state !== 'play') break; G.keys = {}; update(dt || 0.05); } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        idx(re) { return window.__msgs.findIndex((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        pick(re) { const e = T.last(); const c = e && e.c.find((x) => re.test(x.t)); if (c) { window.__ev.push({ t: '(picked)', b: '', c: [] }); c.f(); } return !!c; },
        first() { const e = T.last(); if (e && e.c[0]) { window.__ev.push({ t: '(picked)', b: '', c: [] }); e.c[0].f(); } },
        // real movement: hold a key through the game's own update (collision included)
        hold(key, n, until) { for (let i = 0; i < n; i++) { if (G.state !== 'play' || (until && until())) break; G.keys = { [key]: true }; update(0.05); } G.keys = {}; },
        at(x, y, dir) { const c = Engine.cam; c.x = x; c.y = y; if (dir != null) c.dir = dir; },
        until(re, n) { let i = 0; while (i++ < (n || 600) && !re.test((T.last() || {}).t || '')) T.step(1, 0.1); return re.test((T.last() || {}).t || ''); },
        walk(x, y, n) { const c = Engine.cam, x0 = c.x, y0 = c.y; n = n || 30; for (let i = 1; i <= n; i++) { if (G.state !== 'play') break; c.x = x0 + (x - x0) * i / n; c.y = y0 + (y - y0) * i / n; c.dir = Math.atan2(y - y0, x - x0); G.keys = {}; update(0.05); } },
        // the frame is grey: render once and sample the middle of the view
        grey() { Engine.render(G.ents, G.tod); const cv = Engine.ctx.canvas, d = Engine.ctx.getImageData(0, 0, cv.width, cv.height).data; let n = 0, off = 0, lit = 0; for (let y = cv.height * 0.2 | 0; y < cv.height * 0.7; y += 7) for (let x = 8; x < cv.width - 8; x += 7) { const o = (y * cv.width + x) * 4; n++; if (Math.abs(d[o] - d[o + 1]) > 2 || Math.abs(d[o + 1] - d[o + 2]) > 2) off++; if (d[o] + d[o + 1] + d[o + 2] > 30) lit++; } return { n, off, lit }; },
      };
    });

    // ---- the start: Lyra's house, and the Weaver
    const st = await E(() => {
      EXTRAS17.state.done = 1;
      const r = EXTRAS17.start('echoone');
      const ban = document.getElementById('x17-banner'), c = T.last();
      return { r, inx: EXTRAS17.inExtra(), x17: G.flags.p17x_on, slots: SLOTS.every((x) => x === null), banner: ban && !ban.hidden ? ban.textContent : '',
        name: G.player.name, map: G.mapId, who: window.__vo.includes('weaver.t70.who'), card: c && { t: c.t, b: c.b, c: c.c.map((x) => x.t) }, journal: G.journal.map((j) => j.text), active: THREAD70.active(), stage: THREAD70.stage(), grey: T.grey() };
    });
    if (process.env.DEBUG) console.log('start', JSON.stringify(st).slice(0, 900));
    check(st.r === true && st.inx === 'echoone' && st.x17 === 1 && st.slots && st.active, 'EXTRAS17.start(\'echoone\') runs Echo I in its own session (Book One slots put aside)');
    check(/Echo I of Book One/.test(st.banner) && /The Thread Where She Answered/.test(st.banner) && !/after Book One/.test(st.banner), 'the banner says "Echo I of Book One · The Thread Where She Answered"');
    check(st.name === 'Lyra Ashgrove' && st.map === 't70_house' && st.stage === 1 && st.journal.length === 1, 'you are Lyra Ashgrove, in her house, a fresh logbook [PROPOSED: the player is Lyra in that thread]');
    check(st.card && /Echo I/.test(st.card.t) && /A loom has no opinion about the cloth/.test(st.card.b) && /Ilias Marren, exile of the Loom-Wardens/.test(st.card.b) && /You will want to know who is talking\./.test(st.card.b) && /You will want to know who is talking/.test(st.card.b), 'the opening card is the book\'s: the epigraph, "You will want to know who is talking.", Ilias Marren');
    check(st.grey.n > 50 && st.grey.off === 0 && st.grey.lit > 5, 'the world is drawn grey: it is an Echo (' + st.grey.off + ' coloured of ' + st.grey.n + ')');
    const open = await E(() => {
      const out = {}; window.__vo.length = 0;
      T.first(); const a = T.last(); T.first(); const a2 = T.last();
      out.thread = /Sandglass Bazaar/.test(a.b) && /a thread that was not taken/.test(a.b) && /It also did not <i>un<\/i>happen; nothing does\./.test(a2.b) && /almost always a Hearthday/.test(a2.b);
      out.vo = window.__vo.includes('weaver.h66.thread');   // a card plays its first line now and the rest after it (RITE43.seq)
      T.first(); const b = T.last(); out.night = /On the forty-second night — the night Kaelen Vance came to her door/.test(b.b) && /That is the whole of the difference\. One night\./.test(b.b) && /Here is the thread where she went\./.test(b.b);
      T.pick(/Go out/); out.hint = T.heard(/flat stone behind it at the foot of the Hedge/);
      return out;
    });
    if (process.env.DEBUG) console.log('open', JSON.stringify(open));
    check(st.who && open.thread && open.night && open.hint && open.vo, '"I am going to show you a thread that was not taken." The forty-first night and the forty-second: "One night." "Here is the thread where she went." (the Weaver, voiced)');

    // ---- out at the dead hour, to the stone
    const out = await E(() => {
      const o = {}; window.__msgs.length = 0; window.__vo.length = 0;
      transfer(G.map.get(6, 8).portal);
      o.row = G.mapId === 't70_row' && THREAD70.stage() === 2 && T.heard(/She goes out at the dead hour, because she always does/);
      if (typeof animFrame === 'function') animFrame();   // a frame: anim.js tidies away the transient figures of every map but this one
      o.lamps = G.ents.filter((e) => e._t70 && /^lamp/.test(e._t70)).length;
      // in and out of her door, frames between: the house keeps its bed and the Row its stone, drain and lamps
      transfer(G.map.get(7, 1).portal); animFrame(); o.bed = G.ents.some((e) => e._t70 === 'bed' && !e.hidden);
      transfer(G.map.get(6, 8).portal); animFrame();
      o.fixtures = ['stone', 'drain'].every((k) => G.ents.some((e) => e._t70 === k)) && G.ents.filter((e) => e._t70 && /^lamp/.test(e._t70)).length === 4;
      T.walk(5.0, 17.5, 30); T.walk(THREAD70.STONE.x, 22.5, 20); T.walk(THREAD70.STONE.x, THREAD70.STONE.y - 1.0, 10); T.at(THREAD70.STONE.x, THREAD70.STONE.y - 0.5); T.step(1);
      o.sat = THREAD70.stage() === 3 && Math.abs(Engine.cam.dir + Math.PI / 2) < 0.01;
      T.until(/One night further along/, 200);
      o.order = [/and she sits down with her back to the thorn/, /and it says there's my lark/, /and she says hello, Da/, /and it asks about her day/].map((r) => T.idx(r));
      o.vo = ['wearer.t70.lark', 'lyra.t70.hello', 'wearer.t70.come'].every((id) => window.__vo.includes(id));
      const c = T.last(); o.come = /it asks her something it has not asked before/.test(c.b) && /There's a gap down by the cooperage drain, where the water goes under/.test(c.b) && /I've been on my own two years/.test(c.b) && /And she says no\./.test(c.b) && c.c.length === 1 && c.c[0].t === 'No.';
      T.pick(/^No\.$/); o.no1 = THREAD70.fint('t70_no') === 1 && window.__vo.includes('lyra.t70.no') && T.heard(/It asks again/);
      return o;
    });
    if (process.env.DEBUG) console.log('out', JSON.stringify(out));
    check(out.row && out.lamps === 4 && out.bed && out.fixtures, 'out of her door onto Cooper\'s Row: "She goes out at the dead hour, because she always does," (the house and the Row keep their bed, stone, drain and lamps through doors and frames)');
    check(out.sat && out.order.every((i, k, a) => i >= 0 && (k === 0 || i > a[k - 1])) && out.vo, 'on the stone with her back to the thorn: "there\'s my lark", "hello, Da", and it asks about her day (voiced, in order)');
    check(out.come && out.no1, 'it asks something it has not asked before: "Come through ... I\'ve been on my own two years." And she says no (the only choice)');

    // ---- the asking: it asks again, you say no; a save mid-asking; getting up is another thread
    const ask = await E(() => {
      const o = {};
      window.__vo.length = 0; T.step(Math.ceil(THREAD70.ASK_GAP / 0.1) + 2, 0.1);
      o.again = T.heard(/^Come through\.$/) && window.__vo.includes('wearer.t70.again');
      interact(); o.no2 = THREAD70.fint('t70_no') === 2;
      interact(); o.notTwice = THREAD70.fint('t70_no') === 2;   // it has to ask again first
      for (let i = 0; i < 3; i++) { T.step(Math.ceil(THREAD70.ASK_GAP / 0.1) + 2, 0.1); interact(); }
      o.five = THREAD70.fint('t70_no') === 5;
      // a save mid-asking, restored: the same count, on the stone
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      restoreGame(snap); G.state = 'play'; T.step(2);
      o.saved = THREAD70.stage() === 3 && THREAD70.beat() === 5 && THREAD70.fint('t70_no') === 5 && G.mapId === 't70_row' && Math.hypot(Engine.cam.x - THREAD70.STONE.x, Engine.cam.y - THREAD70.STONE.y) < 0.01 && EXTRAS17.inExtra() === 'echoone' && G.ents.filter((e) => e._t70 === 'stone').length === 1;
      // get up and walk away (W, through the game's own movement and collision): another thread
      window.__ev.length = 0; T.hold('w', 60, () => window.__ev.length > 0);
      const e = T.last(); o.echo = !!e && /Another thread/.test(e.t) && /she stays on the stone with her back to the thorn/.test(e.b) && document.querySelector('canvas').style.filter.includes('grayscale') && THREAD70.fint('t70_echoes') === 1;
      T.first(); o.back = Math.hypot(Engine.cam.x - THREAD70.STONE.x, Engine.cam.y - THREAD70.STONE.y) < 0.01 && THREAD70.fint('t70_no') === 5 && T.grey().off === 0;
      for (let i = 0; i < 6; i++) { T.step(Math.ceil(THREAD70.ASK_GAP / 0.1) + 2, 0.1); interact(); }
      o.eleven = THREAD70.fint('t70_no') === 11;
      T.until(/Eleven times/, 100); const el = T.last();
      o.elevenCard = /She says no eleven times over the next three hours/.test(el.b) && /practising for seven hundred and thirty nights/.test(el.b);
      T.first(); T.until(/twelfth time/, 100); const tw = T.last();
      o.twelfth = /All right, lark\. Then I'll come through to you\./.test(tw.b) && /And she hears the thorn move\./.test(tw.b) && /where ninety-one children are asleep/.test(tw.b) && tw.c.length === 1 && /Don't\. I'm coming\./.test(tw.c[0].t) && window.__vo.includes('wearer.t70.twelfth');
      window.__vo.length = 0; T.first(); o.coming = window.__vo.includes('lyra.t70.coming') && THREAD70.stage() === 4;
      return o;
    });
    if (process.env.DEBUG) console.log('ask', JSON.stringify(ask));
    check(ask.again && ask.no2 && ask.notTwice && ask.five, 'it asks again, in its own first words ("Come through."), and you say no (E) each time it asks [PROPOSED]');
    check(ask.saved, 'a save mid-asking restores to the same count, on the stone, still inside the extra, staged once');
    check(ask.echo && ask.back, 'getting up from the stone is another thread, shown grey, and you are back on the stone with the same count');
    check(ask.eleven && ask.elevenCard && ask.twelfth && ask.coming, 'eleven noes over three hours; on the twelfth time "All right, lark. Then I\'ll come through to you."; the thorn moves; "Don\'t. I\'m coming."');

    // ---- the drain
    const drain = await E(() => {
      const o = {};
      T.until(/Four hundred and eleven times/, 100); const w = T.last();
      o.watched = /I have watched that moment four hundred and eleven times\./.test(w.b) && /in two hundred and six of those threads/.test(w.b) && /You are a soup/.test(w.b) && window.__vo.includes('weaver.t70.watched');
      window.__msgs.length = 0; T.first(); o.hint = T.heard(/cooperage drain, where the water goes under/);
      // back up the Row instead: another thread
      window.__ev.length = 0; T.at(4.5, 14.0); T.step(1); const e = T.last(); o.home = !!e && /Another thread/.test(e.t) && /does not go back up Cooper's Row tonight/.test(e.b); if (e) T.first();
      // walk to the drain with the game's own movement: the foot of the Hedge is walkable
      const c0 = Engine.cam; c0.dir = Math.atan2(THREAD70.DRAIN.y - c0.y, THREAD70.DRAIN.x - c0.x);
      T.hold('w', 200, () => THREAD70.beat() >= 2); T.step(2);
      o.crawl = THREAD70.stage() === 4 && THREAD70.beat() === 2 && T.heard(/She goes through the drain on her hands and knees\./);
      const z0 = Engine.cam.z; T.step(Math.ceil(THREAD70.CRAWL_SECS / 0.1 / 2), 0.1); o.sinking = Engine.cam.z < z0 - 0.15 && THREAD70.R.black > 0.3;
      T.until(/Eleven seconds/, 200); const s = T.last();
      o.eleven = /It takes eleven seconds\. I am not going to describe what is waiting/.test(s.b) && /I will tell you the part that matters\./.test(s.b) && THREAD70.R.black > 0.99;
      T.first(); T.step(3, 0.1); o.four = THREAD70.beat() === 4; o.dark = T.grey().lit === 0;
      T.until(/What comes back/, 200); const b = T.last();
      o.back = /It does not kill her\./ .test(b.b) && /walks up Cooper's Row in Lyra Ashgrove's boots/.test(b.b) && /goes to look at Pim Carder's hands/.test(b.b);
      window.__msgs.length = 0; T.pick(/Walk up Cooper's Row/);
      o.boots = THREAD70.stage() === 5 && T.heard(/^walks up Cooper's Row in Lyra Ashgrove's boots$/) && THREAD70.R.black === 0 && Math.abs(Engine.cam.z - 0.88) < 0.05;
      return o;
    });
    if (process.env.DEBUG) console.log('drain', JSON.stringify(drain));
    check(drain.watched && drain.hint && drain.home, '"I have watched that moment four hundred and eleven times."; going back up the Row is another thread');
    check(drain.crawl && drain.sinking && drain.eleven && drain.four && drain.dark, 'through the drain on her hands and knees: eleven seconds, the view sinking into the dark; "I am not going to describe what is waiting"; four minutes, black');
    check(drain.back && drain.boots, 'what comes back walks up Cooper\'s Row in Lyra Ashgrove\'s boots');

    // ---- her boots: home, and her bed
    const home = await E(() => {
      const o = {};
      T.walk(13.5, 15.2, 20); T.walk(7.5, 3.0, 30);
      window.__msgs.length = 0; transfer(G.map.get(7, 1).portal); T.step(1);
      o.house = G.mapId === 't70_house' && T.heard(/^and lets itself into Lyra Ashgrove's house$/);
      window.__msgs.length = 0; const bed = G.ents.find((e) => e._t70 === 'bed'); useDeco(bed); o.lies = T.heard(/^and lies down in her bed,$/);
      T.until(/And it is very good/, 100); const g = T.last();
      o.good = /It has her whole voice\./.test(g.b) && /Nell Carder takes two sugars/.test(g.b) && /It cannot sing the Root note into a clay jar and make a baby breathe\./.test(g.b) && window.__vo.includes('weaver.t70.good');
      T.first(); o.six = THREAD70.stage() === 6;
      return o;
    });
    if (process.env.DEBUG) console.log('home', JSON.stringify(home));
    check(home.house && home.lies && home.good && home.six, 'it lets itself into her house and lies down in her bed; "And it is very good."; it cannot sing the Root note into a clay jar');

    // ---- the forty-second night: Kaelen
    const night = await E(() => {
      const o = {};
      const k = () => G.ents.find((e) => e._t70 === 'kaelen');
      T.until(/forty-second night/, 100); const d = T.last();
      o.door = /Here is the rest of it, quickly, because you have a book to finish\./.test(d.b) && /with a bore plan under his arm and a Stage Nine/.test(d.b) && /the thing wearing her face lets him in,/.test(d.b) && k() && !k().hidden && Math.hypot(k().x - THREAD70.KDOOR.x, k().y - THREAD70.KDOOR.y) < 0.1;
      window.__msgs.length = 0; T.pick(/Let him in/);
      // out of her door, the night waits; back in, it goes on
      transfer(G.map.get(6, 8).portal); const b0 = THREAD70.beat(); T.step(150, 0.1); o.waits = THREAD70.beat() === b0 && G.mapId === 't70_row';
      transfer(G.map.get(7, 1).portal); T.step(8, 0.1);
      o.table = T.heard(/he sits at her table and tells it everything — the Sequence, the coil, the phase port, the eight bolts, the forty seconds/) && Math.hypot(k().x - THREAD70.KSEAT.x, k().y - THREAD70.KSEAT.y) < 0.1;
      T.step(110, 0.1); o.seeHim = T.heard(/See him to the door/) && Math.hypot(k().x - THREAD70.KDOOR.x, k().y - THREAD70.KDOOR.y) < 0.1;
      T.walk(THREAD70.KDOOR.x, THREAD70.KDOOR.y - 1.2, 10); T.step(10, 0.1);
      o.hum = T.heard(/at the door he hums his note and it does not recognize it, because there is nothing in there that was ever eight years old on a stile/);
      T.step(100, 0.1); o.ally = T.heard(/He goes away believing he has a plan and an ally\./) && k().hidden;
      return o;
    });
    if (process.env.DEBUG) console.log('night', JSON.stringify(night));
    check(night.waits && night.door && night.table && night.seeHim && night.hum && night.ally, 'Kaelen at her door on the forty-second night; at her table he tells it everything; at the door he hums his note and it does not recognize it; he goes away believing he has an ally');

    // ---- the rest, the margin, the Tide-Weaver, and the end
    const rest = await E(() => {
      const o = {}, seen = []; 
      for (const re of [/Hearthday/, /It holds the note/, /It lets go/, /The Greening in that thread/, /And the thing wearing Lyra Ashgrove/, /Four hundred and eleven times/, /One more thing/]) { const ok = T.until(re, 100); seen.push(ok ? T.last() : null); if (ok && !/One more thing/.test(re.source)) T.first(); }
      o.all = seen.every(Boolean);
      const b = (i) => (seen[i] && seen[i].b) || '';
      o.hearth = /threads a wire through a fold of skin instead of the fold of her voice/.test(b(0)) && /Then the Hold begins/.test(b(0));
      o.hold = /four hours and nineteen minutes with blood on its collar/.test(b(1)) && /five bolts out of eight/.test(b(1));
      o.letgo = /The Root is relieved\./.test(b(2)) && /It lets go\./.test(b(2));
      o.green = /the whole Resonant Reach, from the Flume to the Greenroot road to the edge of the Shifting Dunes/.test(b(3));
      o.rest = /counting down from sixty/.test(b(4)) && /dies on the Rust Coast of something ordinary/.test(b(4)) && /twenty names a night in a drowned plaza/.test(b(4)) && /because there is a great deal to eat/.test(b(4));
      o.margin = /That is the whole margin\. A tired woman heard something, and did not go out\./.test(b(5)) && /the world is never saved by the people who are fresh/.test(b(5)) && window.__vo.includes('weaver.t70.times');
      o.more = /In one thread, somebody sells them at the gate\./.test(b(6)) && /Some of them live\./.test(b(6)) && /that I was looking\./.test(b(6)) && /— the Tide-Weaver/.test(b(6));
      T.pick(/end of Book One/);
      o.fin = { inx: EXTRAS17.inExtra(), state: G.state, res: EXTRAS17.state.res.echoone || '', active: THREAD70.active(), maps: Object.keys(G.maps).filter((k) => /^t70_/.test(k)).length, filter: document.querySelector('canvas').style.filter };
      o.book = window.__book();
      return o;
    });
    if (process.env.DEBUG) console.log('rest', JSON.stringify(rest).slice(0, 800));
    check(rest.all && rest.hearth && rest.hold && rest.letgo && rest.green && rest.rest, 'the rest of it, quickly: Hearthday, the Hold, the Root lets go, the Greening of the whole Reach, Kaelen, Vane, Sable, and the thing walking around inside the Greening');
    check(rest.margin && rest.more, '"Four hundred and eleven times." The whole margin; "the world is never saved by the people who are fresh"; "One more thing" ... "— the Tide-Weaver"');
    check(rest.fin.inx === null && rest.fin.state === 'title' && /did not go out/.test(rest.fin.res) && !rest.fin.active && rest.fin.maps === 0 && !/grayscale/.test(rest.fin.filter), 'the end: EXTRAS17.finish, back on the title with its result on the card, nothing grey');
    check(rest.book === before, 'the Book One game (slots, flags, logbook, ledger, place, name) is byte-identical after the extra: no Book One flag was written');
    const inert = await E(() => {
      restoreGame(JSON.parse(JSON.stringify(SLOTS[0]))); G.state = 'play';
      const p = G.player; p.voice = p.voiceMax; G.song.t = 0; window.__ev.length = 0; window.__msgs.length = 0; castSong('root'); const spent = p.voiceMax - p.voice; G.song.t = 0;
      return { spent, ev: window.__ev.length, said: T.heard(/You do not sing here/), maps: Object.keys(buildAllMaps()).some((k) => /^t70_/.test(k)), map: G.mapId, flags: Object.keys(G.flags).filter((k) => /^t70/.test(k)), grey: T.grey().off > 0 };
    });
    check(inert.spent > 0 && !inert.said && !inert.maps && inert.map === 'oakhaven' && inert.flags.length === 0 && inert.grey, 'after the extra the Book One slot loads in colour and every wrapper is inert: Songs are sung, no Cooper\'s Row is built');
    // the Book One modules that stand down in an extra do so by EXTRAS17.inExtra(), which covers this one
    check(['cargo56', 'lyra51', 'grafters67', 'boar48', 'meadow49', 'days35', 'church55', 'tamsin52', 'audit54', 'manifest53'].every((f) => /EXTRAS17\.inExtra\(\)/.test(src('js/' + f + '.js'))), 'the Book One modules that stand down in an extra (cargo56, lyra51, grafters67, boar48, meadow49, days35 and the rest) check EXTRAS17.inExtra(), which is this extra while it runs');

    // ---- voices and French
    const vo = await E(() => ({ missing: Object.values(THREAD70.VO).flat().filter((id) => !VOICE_ACT.LINES[id]), speakers: [...new Set(Object.values(THREAD70.VO).flat().map((id) => VOICE_ACT.LINES[id] && VOICE_ACT.LINES[id].speaker))] }));
    const cast = src('tools/voices/cast.py');
    check(vo.missing.length === 0 && vo.speakers.every((s) => s && new RegExp("'" + s + "'\\s*:").test(cast)) && vo.speakers.includes('weaver'), 'every spoken line is recorded, by a speaker in cast.py, the Tide-Weaver as `weaver` (' + (vo.missing.slice(0, 3).join(', ') || vo.speakers.join(', ')) + ')');
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p70-thread.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await E(() => THREAD70.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 100 && noFr.length === 0 && tsv.every((r) => r.length === 2 && r[1].trim()), 'every registered string has a French pair in p70-thread.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((r) => /\b(Le Hush|les Hollows|Cantor\b|the Reach|Tide-Weaver|Hearthday)\b/.test(r[1])) && tsv.some((r) => /le Tisseur des Marées/.test(r[1])) && tsv.some((r) => /Âtredi/.test(r[1])) && tsv.some((r) => /le Silence/.test(r[1])), 'the French follows the glossary (le Tisseur des Marées, Âtredi, le Silence)');

    console.log('errors', JSON.stringify(errors.slice(0, 3)));
    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL THREAD TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
