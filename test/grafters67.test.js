// PREVIEW_URL=http://127.0.0.1:4074 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/grafters67.test.js
// The Grafters' Rootday round (Book One ch. 3, "Burl"; ROADMAP R9 #22; js/grafters67.js), built on js/hollow30.js's wagon:
// the white wagon and Rooke unmasking for Lyra ("You went ahead of me"); Hob Wendle's toes (the mute-drops, the hush-saw,
// the sap-iron, "He'll walk"); Pim behind the blue door ("Unusual. Recheck next month."); Orla in her chair (the barley,
// the green chalk, "Don't, lovey", "sing me down", the mark); the sap-mark in the lane (the Inquisitor's list, "Someone
// less careful", the Echo if you rub it off); Lissa on the red-shutter step. Nothing the traveller does changes who is
// marked. Also: leaving it, missing it, a save mid-round, voices, French, no page errors.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));
const SHOTS = process.env.SHOT_DIR || '';

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 }, deviceScaleFactor: SHOTS ? 2 : 1 });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /grafters67|hollow30/.test(m.text())) errors.push(m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:4074');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof HOLLOW30 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Round Tester');
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
    const hasApi = await page.evaluate(() => typeof GRAFT67 !== 'undefined');
    check(hasApi, 'the round is loaded (GRAFT67)');
    if (!hasApi) throw new Error('no GRAFT67');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); G.state = 'event'; };
      window.requestAnimationFrame = () => 0;
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.T = {
        tick(n) { for (let i = 0; i < (n || 1); i++) { if (G.state !== 'event') { G.keys = {}; update(0.05); } } },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        pick(re) { const e = T.last(); const c = e && e.c.find((x) => re.test(x.t)); if (c) { G.state = 'play'; c.f(); } return !!c; },
        first() { const e = T.last(); if (e && e.c[0]) { G.state = 'play'; e.c[0].f(); } },
        at(x, y) { Engine.cam.x = x; Engine.cam.y = y; },
        ent(k) { return G.ents.find((e) => e && e._g67 === k); },
        g0() { return G.ents.find((e) => e && e._p30 === 'g0'); },
        go(id, x, y, dir) { G.state = 'play'; loadMap(id, x == null ? undefined : { x, y, dir: dir || 0 }); },
        reset(tod) {
          const f = G.flags;
          for (const k of Object.keys(f)) if (/^p67/.test(k)) delete f[k];
          G.day = 1; G.tod = tod == null ? 9 / 24 : tod; G.state = 'play';
          T.go('tannery', 11.5, 8.5, Math.PI / 2);
          window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0;
        },
      };
    });

    // ---- 1 · the wagon: Rootday morning, the first time you come into the Hollow
    const wagon = await page.evaluate(() => {
      const out = {}, f = G.flags;
      T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2);
      const c = T.last();
      out.card = !!c && /The white wagon/.test(c.t) && /harness has been wrapped in felt/.test(c.b) && /"Cantor," he says/.test(c.b) && /"Ah," he says softly. "You went ahead of me."/.test(c.b) && /Let's see what you've left me/.test(c.b) && /somebody has to hold their heads/.test(c.b);
      out.ways = !!c && c.c.length === 3 && /beside Lyra/.test(c.c[0].t) && /Grafters/.test(c.c[1].t) && /watch/.test(c.c[2].t);
      out.stage = GRAFT67.stage() === 1;
      out.rooke = !!T.g0() && T.g0().label === GRAFT67.TX.lookRooke && G.ents.filter((e) => e && e._p30 && /^g\d$/.test(e._p30)).length === 3 && !T.ent('rooke');   // hollow30's lead Grafter is Rooke; no fourth Grafter
      out.wagon = G.ents.filter((e) => e && e._p30 === 'wagon').length === 1;     // the wagon is hollow30's, once
      out.lyra = !!T.ent('lyra');
      out.vo = ['rooke.graft.cantor'].every((id) => window.__vo.includes(id));
      out.journal = G.journal.some((j) => /You went ahead of me/.test(j.text));
      return out;
    });
    check(wagon.card && wagon.ways && wagon.stage, 'Rootday morning in the Hollow: the white wagon, the masks, Rooke unmasking for Lyra in the book\'s words; three ways to go round [PROPOSED]');
    if (process.env.DEBUG) console.log(JSON.stringify(wagon));
    check(wagon.rooke && wagon.wagon && wagon.lyra && wagon.vo && wagon.journal, 'hollow30\'s lead Grafter is Rooke, the wagon is not duplicated, Lyra is at the mouth of the Hollow; Rooke is voiced; the logbook');

    // ---- 2 · Hob Wendle first (beside Lyra)
    const hob = await page.evaluate(() => {
      const out = {}, f = G.flags;
      T.pick(/beside Lyra/);
      out.way = f.p67_way === 'lyra' && GRAFT67.stage() === 2 && T.heard(/Hob Wendle's step first/);
      const a = GRAFT67.AT.hob;
      out.staged = !!T.ent('lyra') && Math.abs(T.ent('lyra').x - a.lyra[0]) < 0.01 && Math.abs(T.g0().x - a.rooke[0]) < 0.01 && !!T.ent('saw') && !!T.ent('wife');
      out.free = ['lyra', 'saw', 'saw2', 'wife'].every((k) => !G.map.isBlocked(Math.floor(T.ent(k).x), Math.floor(T.ent(k).y))) && !T.g0().solid && !G.map.isBlocked(Math.floor(T.g0().x), Math.floor(T.g0().y));
      // nothing until you come to his step
      window.__ev.length = 0; T.at(13.5, 4.5); T.tick(3); out.notYet = !T.last();
      T.at(a.at[0] + 0.6, a.at[1] + 1.0); T.tick(1);
      let c = T.last();
      out.card = !!c && /Hob Wendle first/.test(c.t) && /Three of his toes have gone to wood/.test(c.b) && /The drops do not take the pain. They take the voice./.test(c.b);
      out.choices = !!c && c.c.length === 2 && /Hold his hand/.test(c.c[0].t) && /Root note/.test(c.c[1].t);
      window.__vo.length = 0;
      T.pick(/Root note/); c = T.last();
      out.cut = /whispering <i>shh<\/i> into a pillow/.test(c.b) && /only true sound of the morning/.test(c.b) && /breathes the Root note, soundless/.test(c.b) && /You breathe it with her/.test(c.b) && /"Clean. He'll walk."/.test(c.b);
      out.hobFlag = f.p67_hob === 'breath'; out.vo = window.__vo.includes('rooke.graft.walk');
      T.first();
      out.next = GRAFT67.stage() === 3 && T.heard(/Then the Carders/) && !T.ent('wife') && Math.abs(T.ent('lyra').x - GRAFT67.AT.blue.lyra[0]) < 0.01;
      return out;
    });
    if (process.env.DEBUG) console.log(JSON.stringify(hob));
    check(hob.way && hob.staged && hob.free && hob.notYet, 'beside Lyra: Rooke, Lyra, the sawboys and his wife go to Hob Wendle\'s step, on open ground; nothing happens until you come to it');
    check(hob.card && hob.choices && hob.cut && hob.hobFlag && hob.vo && hob.next, 'Hob Wendle: the mute-drops take the voice, the hush-saw, the sap-iron, Lyra\'s soundless Root note (yours with hers) and "He\'ll walk"; then on to the Carders');

    // ---- 3 · the Carders, behind the blue door; 4 · Orla Hale; 5 · the lane; 6 · Lissa
    const rest = await page.evaluate(async () => {
      const wait = (ms) => new Promise((r) => setTimeout(r, ms));
      const out = {}, f = G.flags;
      window.__ev.length = 0; window.__vo.length = 0;
      T.go('p30_carders', 3.5, 5.0, -Math.PI / 2);
      let c = T.last();
      out.pimCard = !!c && /Then the Carders/.test(c.t) && /hot brick wrapped in flannel/.test(c.b) && /he never wears it for the children/.test(c.b) && /You stand by the door beside her/.test(c.b);
      out.pimStaged = ['pim', 'nell', 'rooke', 'lyra'].every((k) => !!T.ent(k));
      T.first(); c = T.last(); await wait(1200);
      out.pim = /"Early," Rooke says at last/.test(c.b) && /"And receding, I'd have said. If I didn't know better."/.test(c.b) && /"Recheck next month. Keep him out of the damp."/.test(c.b) && /fatherly pat/.test(c.b);
      out.pimVo = ['rooke.graft.early', 'rooke.graft.receding', 'rooke.graft.unusual'].every((id) => window.__vo.includes(id));
      out.pimSafe = !f.pim_safe;     // the round never settles Nell's own quest
      // 4 · Orla Hale
      T.pick(/Then Orla Hale/); c = T.last();
      out.orlaMap = G.mapId === 'orla_house' && GRAFT67.stage() === 4 && !!T.ent('rooke') && !!T.ent('lyra') && !G.maps.p30_carders.entities.some((e) => e && e._g67);
      out.orla = /Then Orla Hale/.test(c.t) && /"I'm afraid I've put down roots."/.test(c.b) && /like wind moving through a field of barley/.test(c.b) && /Green chalk/.test(c.b) && /You are at Lyra's shoulder/.test(c.b);
      T.first(); c = T.last(); await wait(1600);
      out.orla2 = /<i>Let me try.<\/i>/.test(c.b) && /And nothing comes/.test(c.b) && /"Don't, lovey,"/.test(c.b) && /It's like being held/.test(c.b) && /Not in a jar. Not in the Narrow/.test(c.b) && /"Good girl," says Orla Hale/.test(c.b) && /a green circle on the outside of it with a line struck through/.test(c.b);
      out.orlaVo = ['orla.graft.girl', 'orla.graft.dont', 'orla.graft.hurt', 'orla.graft.singme', 'orla.graft.goodgirl'].every((id) => window.__vo.includes(id));
      out.notMarkedYet = !GRAFT67.marked();
      // 5 · the lane, outside her door
      T.pick(/Out into the lane/); c = T.last(); await wait(1900);
      out.laneMap = G.mapId === 'oakhaven' && GRAFT67.stage() === 5 && !!T.ent('rooke') && !!T.ent('mark') && T.ent('mark').sprite === 'p30_sapmark';
      out.lane = /The sap-mark/.test(c.t) && /It means <i>past cutting<\/i>/.test(c.b) && /The Inquisitor has asked for the list/.test(c.b) && /He's four days out/.test(c.b) && /Someone less careful/.test(c.b) && /My saws leave people alive/.test(c.b) && /buckles his mask back on/.test(c.b);
      out.laneChoices = c.c.length === 2 && /Follow them/.test(c.c[0].t) && /Rub the mark/.test(c.c[1].t);
      out.laneVo = ['rooke.graft.sapmark', 'rooke.graft.list', 'rooke.graft.fourdays', 'rooke.graft.told', 'rooke.graft.saws'].every((id) => window.__vo.includes(id));
      // the Echo: rub it off, and you are back in the lane with the mark on the door
      T.pick(/Rub the mark/); c = T.last();
      out.echo = /An Echo/.test(c.t) && /someone less careful in it/.test(c.b) && /The mark is on the door/.test(c.b) && f.p67_echo === true && /grayscale/.test(document.querySelector('canvas').style.filter);
      T.first(); c = T.last();
      out.back = /The sap-mark/.test(c.t) && c.c.length === 1 && GRAFT67.marked() && !!T.ent('mark') && !document.querySelector('canvas').style.filter;
      // 6 · Lissa on the red-shutter step
      T.pick(/Follow them/); c = T.last();
      out.lissaMap = G.mapId === 'p30_hollow' && GRAFT67.stage() === 6 && T.g0() && T.g0().label === GRAFT67.TX.lookGrafter && !G.maps.oakhaven.entities.some((e) => e && e._g67 && e._g67 !== 'mark');
      out.lissa = /red shutters/.test(c.t) && /a tin cup of water between them/.test(c.b) && /perfect, terrible calm/.test(c.b) && /Then she walks home/.test(c.b) && /You make yourself look at her too/.test(c.b);
      T.first();
      out.done = GRAFT67.stage() === 7 && G.journal.some((j) => /beside Lyra/.test(j.text) && /Recheck next month/.test(j.text) && /sap-mark on her door/.test(j.text));
      out.cleared = !G.ents.some((e) => e && e._g67) && !G.ents.some((e) => e && e._g67rooke);
      // the mark stays on Orla's door, and says you watched it drawn
      T.go('oakhaven', 28.6, 40.6, 0); const m = T.ent('mark');
      out.mark = !!m && /You watched Rooke draw it/.test(m.look) && !T.ent('rooke');
      window.__ev.length = 0; useDeco(m); out.markUse = !!T.last() && /sap-mark/.test(T.last().t);
      G.flags.greening = true; GRAFT67.restage(); out.greening = !G.maps.oakhaven.entities.some((e) => e && e._g67); delete G.flags.greening; GRAFT67.restage();
      return out;
    });
    if (process.env.DEBUG) console.log(JSON.stringify(rest));
    check(rest.pimCard && rest.pimStaged && rest.pim && rest.pimVo && rest.pimSafe, 'the Carders: Pim on the hearth-rug, the lens one finger at a time; "Early ... And receding ... Unusual. Recheck next month." always, and Nell\'s own quest is untouched');
    check(rest.orlaMap && rest.orla && rest.orla2 && rest.orlaVo && rest.notMarkedYet, 'Orla Hale in her chair: "I\'m afraid I\'ve put down roots", the barley, the green chalk; Lyra\'s fifth and nothing; "Don\'t, lovey", "sing me down", "Good girl", the circle on the door');
    check(rest.laneMap && rest.lane && rest.laneChoices && rest.laneVo, 'the lane: the sap-mark on Orla\'s door, past cutting, the Inquisitor\'s list, four days out, "Someone less careful", "My saws leave people alive"');
    check(rest.echo && rest.back, 'rub the mark off and the Echo plays: someone less careful next month; back in the lane with the mark on the door');
    check(rest.lissaMap && rest.lissa && rest.done && rest.cleared, 'Lissa on the red-shutter step with her tin cup while the masked Grafters pass; Lyra walks home; the logbook says how you went round; the figures are gone');
    check(rest.mark && rest.markUse && rest.greening, 'the sap-mark stays on Orla Hale\'s door (you watched it drawn) until the Greening');
    await page.evaluate(() => { window.__ev.length = 0; });

    // ---- the other ways round: with the Grafters, and from the lane; the same outcome either way
    const ways = await page.evaluate(() => {
      const out = {}, f = G.flags;
      const run = (wayRe, hobRe) => {
        T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); T.pick(wayRe);
        const a = GRAFT67.AT.hob; T.at(a.at[0], a.at[1] + 1.0); T.tick(1);
        const hobCard = T.last(); const opts = hobCard.c.map((c) => c.t);
        T.pick(hobRe); const cut = T.last().b; T.first();
        T.go('p30_carders', 3.5, 5.0, -Math.PI / 2); const pim = T.last().b; T.first(); const pim2 = T.last().b; T.pick(/Orla/);
        const orla = T.last().b; T.first(); T.pick(/lane/); const lane = T.last().b; T.pick(/Follow/); const lissa = T.last().b; T.first();
        return { opts, cut, pim, pim2, orla, lane, lissa, way: f.p67_way, hob: f.p67_hob, stage: GRAFT67.stage(), j: G.journal[0] && G.journal[0].text };
      };
      const g = run(/Grafters/, /foot still/), w = run(/watch/, /Look away/);
      out.g = g.way === 'grafters' && g.opts.length === 1 && g.hob === 'foot' && /You hold the foot still/.test(g.cut) && /instrument roll/.test(g.pim) && /close enough to hear the barley/.test(g.orla) && /takes the instrument roll back/.test(g.lane) && /you go by/.test(g.lissa) && /with the sawboys/.test(g.j);
      out.w = w.way === 'watch' && w.opts.length === 2 && w.hob === 'away' && /You look away, up the lane/.test(w.cut) && /in the doorway behind the sawboys/.test(w.pim) && /From the door you can hear it/.test(w.orla) && /from the lane/.test(w.j);
      // whatever way, the book's outcome: "He'll walk", "Recheck next month", the mark
      out.same = [g, w].every((r) => /He'll walk/.test(r.cut) && /Recheck next month/.test(r.pim2) && /past cutting/.test(r.lane) && r.stage === 7) && GRAFT67.marked();
      return out;
    });
    if (process.env.DEBUG) console.log(JSON.stringify(ways));
    check(ways.g && ways.w && ways.same, 'with the Grafters (the instrument roll, the foot held for the saw) or from the lane (watch, or look away): each beat says where you stood, and the outcome is the book\'s');

    // ---- leaving it partway, the morning ending, missing it, and a save mid-round
    const edge = await page.evaluate(() => {
      const out = {}, f = G.flags;
      // walk out through the tannery between Hob and the Carders: the round goes on without you, and the mark is still drawn
      T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); T.pick(/beside Lyra/);
      const a = GRAFT67.AT.hob; T.at(a.at[0], a.at[1] + 1.0); T.tick(1); T.first(); T.first();
      window.__msgs.length = 0; T.go('tannery', 11.5, 8.5, Math.PI / 2); T.tick(2);
      out.left = GRAFT67.stage() === 8 && f.p67_left === 3 && T.heard(/goes on down the Hollow without you/) && G.journal.some((j) => /left the Grafters' round/.test(j.text)) && !GRAFT67.marked();
      T.go('oakhaven', 28.6, 40.6, 0); out.leftMark = !T.ent('mark');     // the round has not reached Orla's yet
      G.tod = 14.5 / 24; GRAFT67.restage(); out.leftMark = out.leftMark && GRAFT67.marked() && !!T.ent('mark') && /The Grafters came round on Rootday/.test(T.ent('mark').look);
      G.tod = 9 / 24;
      T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); out.noAgain = GRAFT67.stage() === 8 && !G.ents.some((e) => e && e._g67);
      // the morning ends in the middle of the round
      T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); T.pick(/watch/);
      G.tod = 14.2 / 24; T.tick(2);
      out.noon = GRAFT67.stage() === 8 && f.p67_left === 2 && !G.ents.some((e) => e && (e._g67 || e._g67rooke));
      // never there: Rootday afternoon, or a later day, and it went by without you
      T.reset(15 / 24); T.tick(2);
      out.missed = GRAFT67.stage() === 9 && G.journal.some((j) => /Rootday came and went/.test(j.text)) && GRAFT67.marked();
      T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); out.noLate = GRAFT67.stage() === 9 && !T.last();
      // not before eight, and not on another day
      T.reset(7 / 24); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); out.early = GRAFT67.stage() === 0;
      // an old save on Hearthday: missed, quietly enough
      T.reset(); G.day = 2; T.tick(1); out.hearthday = GRAFT67.stage() === 9;
      // a save that names no way we know goes round from the lane
      T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); T.pick(/watch/); f.p67_way = 'x';
      T.at(a.at[0], a.at[1] + 1.0); T.tick(1); out.badWay = /Hob Wendle first/.test((T.last() || {}).t) && T.last().c.length === 2 && GRAFT67.way() === 'watch';
      // a save in the middle of the round: in the Carders' house, it loads back to Pim's card with the figures once
      T.reset(); T.go('p30_hollow', 13.5, 1.5, Math.PI / 2); T.tick(2); T.pick(/beside Lyra/);
      T.at(a.at[0], a.at[1] + 1.0); T.tick(1); T.first(); T.first();
      T.go('p30_carders', 3.5, 5.0, -Math.PI / 2);
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      out.notSaved = !JSON.stringify(snap.maps.p30_carders).includes('_g67') && !JSON.stringify(snap.maps.p30_hollow).includes('_g67');
      window.__ev.length = 0; G.state = 'title'; restoreGame(snap); out.restoreState = G.state === 'event'; T.tick(1);
      const c = T.last();
      out.restored = window.__ev.length === 1 && out.restoreState && G.mapId === 'p30_carders' && GRAFT67.stage() === 3 && !!c && /Then the Carders/.test(c.t) && G.ents.filter((e) => e && e._g67 === 'pim').length === 1 && G.flags.p67_way === 'lyra';
      // and a save on the street outside Orla's comes back to the lane
      T.first(); T.pick(/Orla/); T.first(); T.pick(/lane/);
      const snap2 = JSON.parse(JSON.stringify(snapshotGame())); window.__ev.length = 0; G.state = 'title'; restoreGame(snap2); T.tick(1);
      out.restoredLane = window.__ev.length === 1 && G.mapId === 'oakhaven' && GRAFT67.stage() === 5 && /The sap-mark/.test((T.last() || {}).t) && G.ents.filter((e) => e && e._g67 === 'mark').length === 1;
      T.pick(/Follow/); T.first(); out.finish = GRAFT67.stage() === 7;
      return out;
    });
    if (process.env.DEBUG) console.log(JSON.stringify(edge));
    check(edge.left && edge.leftMark && edge.noAgain, 'leave the round partway and it goes on without you: a logbook line, the mark is still drawn (and says so), and it does not start again');
    check(edge.badWay && edge.noon && edge.missed && edge.noLate && edge.early && edge.hearthday, 'the morning ending mid-round, or never being there, changes only lines; nothing before eight or after Rootday');
    check(edge.notSaved && edge.restored && edge.restoredLane && edge.finish, 'the figures are never saved; a save in the Carders\' house or in the lane loads back into that beat, staged once, and the round finishes');

    // ---- French for every string, and the glossary
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p67-grafters.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((r) => [r[0], r[1]]));
    const texts = await page.evaluate(() => GRAFT67.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 70 && noFr.length === 0 && tsv.every((r) => r.length === 2), 'every string has a French pair in p67-grafters.tsv and locales/story/fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((r) => /\b(Hush|Hollows?|Cantor|the Narrow|Rootday|Grafters?)\b/.test(r[1])) && tsv.filter((r) => /Narrow/.test(r[0])).every((r) => /l'Étroit/.test(r[1])) && tsv.filter((r) => /Root note/.test(r[0])).every((r) => /Note-racine/.test(r[1])), 'the French follows the glossary (le Creux, Chantre, l\'Étroit, la Note-racine, Racinedi, les Greffeurs)');
    const vo = await page.evaluate(() => Object.values(GRAFT67.VO).flat().filter((id) => !VOICE_ACT.LINES[id]));
    check(vo.length === 0, 'every spoken book line in the round is recorded (' + (vo.join(', ') || 'all there') + ')');

    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');
  } finally {
    await browser.close();
  }
  console.log(fails ? fails + ' FAILED' : 'ALL GRAFTERS TESTS PASSED');
  process.exit(fails ? 1 : 0);
})();
