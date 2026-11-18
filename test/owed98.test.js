// Phase 98: what was owed. (1) Phase 87 (d): the bare hands and the glass arm painted in code (js/fp87.js, js/body21.js).
// (2) Phase 91, question 4: the Reach's two keepers leave a trophy and a piece of realm gear (js/keepers98.js).
// Run: PREVIEW_URL=http://127.0.0.1:4175 node test/owed98.test.js
'use strict';
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('fs'), path = require('path');
const URL0 = process.env.PREVIEW_URL || 'http://127.0.0.1:4175';
let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };
const read = (f) => fs.readFileSync(path.join(__dirname, '..', f), 'utf8');

(async () => {
  check(!/Math\.random/.test(read('js/fp87.js')) && !/Math\.random/.test(read('js/keepers98.js')), 'nothing in the paintings or the leavings is drawn or decided by chance');
  const K = require('../js/keepers98.js');
  const tsv = read('tools/i18n/p98-owed.tsv').split('\n').filter((l) => l && l[0] !== '#').map((l) => l.split('\t'));
  const en = new Set(tsv.map((l) => l[0])), missing = K.TEXTS.filter((t) => !en.has(t));
  check(K.TEXTS.length === 10 && !missing.length && tsv.every((l) => l[1] && l[1].trim()), 'every new line has French (' + K.TEXTS.length + ' lines)' + (missing.length ? ': missing ' + missing[0] : ''));
  // the Heights' three fought keepers already follow the rule: a piece of gear and a valuable, once
  const rule = [['js/heights92.js', 'p92_kdrop', /\['a_p92_lamphood', -0\.4\], \['v_p92_amber', 0\.4\]/], ['js/anchorage94.js', 'p94_kdrop', /\['a_p94_gloves', -0\.5\], \['v_p94_link', 0\.5\]/], ['js/pilgrim95.js', 'p95_kdrop', /\['w_p95_stave', -0\.5\], \['v_p95_warrant', 0\.5\]/]];
  check(rule.every(([f, flag, re]) => { const s = read(f); return s.includes("!fint('" + flag + "', 1)") && s.includes('f().' + flag + ' = 1') && re.test(s); }), 'the Heights\' three fought keepers each leave one piece of gear and one valuable, once (the Lamplighter, the Nineteen, the Brother-Captain)');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage(); const errors = []; page.on('pageerror', (e) => errors.push(e.message));
  await page.goto(URL0 + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');

  const r = await page.evaluate(() => {
    window.requestAnimationFrame = () => 0; closeModal(); hide('#event'); G.state = 'play';
    const out = {}, p = G.player, said = () => Array.from(document.querySelectorAll('#msgs .m')).map((e) => e.textContent), clr = () => { document.getElementById('msgs').innerHTML = ''; };
    const GLk = (typeof GEARLOOK21 !== 'undefined') ? GEARLOOK21 : null;
    // ================================================================ (1) the hands
    const lookOf = () => GLk.of(G.player);
    const sum = (cv) => { const d = cv.getContext('2d').getImageData(0, 0, cv.width, cv.height).data; let h = 0, n = 0, r = 0, g = 0, b = 0; for (let i = 0; i < d.length; i += 4) { if (d[i + 3] < 128) continue; n++; r += d[i]; g += d[i + 1]; b += d[i + 2]; h = (h * 31 + d[i] + d[i + 1] * 7 + d[i + 2] * 13) >>> 0; } return { h, n, r: r / n, g: g / n, b: b / n }; };
    p.glassed = true; p.weapons = ['hands', 'glass', 'sword']; p.weapon = 0; G.song.t = 0; G.songFx = 0;
    const L1 = lookOf();
    const fist = FP87.paintHands(L1, 'fist'), gl = FP87.paintHands(L1, 'glassfist'), open = FP87.paintHands(L1, 'open');
    out.three = !!(fist && gl && open) && fist.k === 2 && gl.k === 2 && open.k === 2 && fist.shift === true && !fist.flip && gl.flip === true && !gl.shift && open.center === true;
    const sF = sum(fist.canvas), sG = sum(gl.canvas), sO = sum(open.canvas);
    out.glassBlue = sG.b > sG.r + 70 && sG.b > 150 && sG.n > 20000; out.fleshWarm = sF.r > sF.b + 20 && sF.n > 20000;
    out.glassGlow = !!gl.emis && !!open.emis; out.sizes = fist.canvas.width === gl.canvas.width && open.canvas.width > fist.canvas.width;
    // the open hands: the left one glass, the right one not
    { const d = open.canvas.getContext('2d').getImageData(0, 0, open.canvas.width, open.canvas.height).data, W = open.canvas.width; let lb = 0, ln = 0, rb = 0, rn = 0; for (let i = 0, q = 0; i < d.length; i += 4, q++) { if (d[i + 3] < 128) continue; const blue = d[i + 2] > d[i] + 50; if ((q % W) < W / 2) { ln++; if (blue) lb++; } else { rn++; if (blue) rb++; } } out.openSides = ln > 5000 && rn > 5000 && lb / ln > 0.8 && rb / rn < 0.05; }
    // they wear what you wear: bare skin and gloves are different pictures; the same look twice is the same picture
    const h0 = p.armor.hands; p.armor.hands = null; const bare = FP87.paintHands(lookOf(), 'fist'); p.armor.hands = h0;
    out.wears = (h0 ? sum(bare.canvas).h !== sF.h : true) && FP87.paintHands(lookOf(), 'fist') === fist;
    // which picture the game is given
    const b1 = BODY21.build('fp_hands', lookOf(), 'hands', 'right'); G.songFx = 5; const b2 = BODY21.build('fp_hands', lookOf(), 'hands', 'right'); G.songFx = 0;
    const shown = (id) => { if (typeof FPHANDS !== 'undefined' && FPHANDS.st) FPHANDS.st.shown = id; };
    p.weapon = 2; shown('sword'); const b3 = BODY21.build('fp_hands', lookOf(), 'hands', 'right');
    shown('hands'); const b5 = BODY21.build('fp_hands', lookOf(), 'hands', 'right'); shown('sword');     // the bare hands being put away for the sword
    p.weapon = 1; const b4 = BODY21.build('fp_glass', lookOf(), 'glass', 'right');
    out.poses = b1.pose === 'fist' && b2.pose === 'open' && b3.pose === 'open' && b4.pose === 'glassfist' && b4.flip === true && b5.pose === 'fist';
    // on the screen: where the glass is
    // a constant backdrop: the hands are what is looked at, and the street has smoke and people in it
    Engine.render = () => { Engine.ctx.fillStyle = '#334455'; Engine.ctx.fillRect(0, 0, VW, VIEW_H); };
    const draw = () => { render(); return Engine.ctx.getImageData(0, 0, VW, VIEW_H).data; };
    const azure = (d, x0, x1, y0, y1) => { let n = 0; for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) { const i = (y * VW + x) * 4; if (d[i + 2] > d[i] * 1.9 && d[i + 2] > d[i] + 25 && d[i + 1] > d[i]) n++;   /* azure, in any light; the backdrop is not */ } return n; };
    loadMap('oakhaven', { x: 38.5, y: 40.5, dir: 0 }); closeModal(); G.state = 'play'; G.tod = 0.5; if (typeof FPHANDS !== 'undefined' && FPHANDS.st) { FPHANDS.st.lower = 0; FPHANDS.st.shown = null; }
    const settle = () => { for (let i = 0; i < 40; i++) update(0.05); };
    p.weapon = 1; settle(); let d = draw(); const gL = azure(d, 0, 160, 30, 150), gR = azure(d, 160, 320, 30, 150), gHigh = azure(d, 0, 160, 30, 100);
    out.glassLeft = gL > 800 && gR < 40 && gHigh > 300; out.glassCounts = [gL, gR, gHigh];
    const idle0 = BODY21.stats.drawn.glassIdle; draw(); out.rightRests = BODY21.stats.drawn.glassIdle === idle0 + 1;
    // the locked arm: a wash over the arm itself, and nothing drawn where the arm is not
    const farRight = (dd) => { let s = 0; for (let y = 40; y < 110; y++) for (let x = 200; x < 250; x++) { const i = (y * VW + x) * 4; s += dd[i] + dd[i + 1] * 3 + dd[i + 2] * 7; } return s; };
    const armSum = (dd) => { let s = 0; for (let y = 60; y < 150; y++) for (let x = 0; x < 110; x++) { const i = (y * VW + x) * 4; s += dd[i] + dd[i + 1]; } return s; };
    const u1 = draw(), fr0 = farRight(u1), as0 = armSum(u1); G.glassLock = 6; const u2 = draw(); G.glassLock = 0;
    out.lock = farRight(u2) === fr0 && armSum(u2) !== as0;
    p.weapon = 0; settle(); d = draw(); const hL = azure(d, 0, 160, 30, 150), hHigh = azure(d, 0, 160, 30, 100);
    out.handsGlassRests = hL > 300 && hL < gL && hHigh < gHigh / 3; out.handsCounts = [hL, hHigh];
    p.weapon = 2; settle(); d = draw(); out.bladeGlassRests = azure(d, 0, 160, 30, 150) > 300;
    // not glassed: no glass anywhere; bare hands still show two fists (one resting)
    p.glassed = false; p.weapons = ['hands', 'sword']; p.weapon = 0; settle(); const i1 = BODY21.stats.drawn.glassIdle; d = draw();
    out.unglassed = azure(d, 0, 320, 30, 150) < 40 && BODY21.stats.drawn.glassIdle === i1 + 1;
    G.songFx = 5; const i2 = BODY21.stats.drawn.glassIdle; draw(); out.songNoRest = BODY21.stats.drawn.glassIdle === i2; G.songFx = 0;
    p.weapon = 1; settle(); const i3 = BODY21.stats.drawn.glassIdle; draw(); out.bladeNoRest = BODY21.stats.drawn.glassIdle === i3;
    // a fist goes straight out
    const pose = (id, dir) => animWeaponPose(WEAPONS[id], 0.48, dir);
    out.punch = pose('hands').family === 'thrust' && pose('glass').family === 'thrust' && pose('sword').family === 'sweep' && pose('hands', 'slash left').family === 'thrust'
      && pose('sword', 'slash left').x < -40 && pose('glass', 'slash left').x > 40 && pose('glass', 'slash right').x < -40 && pose('glass', 'chop down').family === 'overhead';   // the glass arm is mirrored on the screen, so a drag to the left still swings it to the left
    out.warn = JSON.stringify(BODY21.stats.warn || {});

    // ================================================================ (2) the keepers' leavings
    const W4 = ['w_p98_ridge', 'w_p98_beamkey', 'v_p98_shell', 'v_p98_reed'];
    out.defs = !!(WEAPONS.p98_ridge && WEAPONS.p98_beamkey) && W4.every((id) => ITEMS[id]) && ITEMS.v_p98_shell.valuable === true && ITEMS.v_p98_reed.valuable === true && !ITEMS.v_p98_shell.weapon && !ITEMS.v_p98_reed.armor && ITEMS.w_p98_ridge.weapon === 'p98_ridge';
    const pix = ['weapon:p98_ridge', 'weapon:p98_beamkey', 'v_p98_shell', 'v_p98_reed'].map((k) => ICONS.PIX[k]); out.icons = pix.every((f) => typeof f === 'function') && new Set(pix).size === 4;
    const eR = GLk.WEAPONS ? GLk.WEAPONS.p98_ridge : null;
    const cR = FP87.paint('p98_ridge', L1), cK = FP87.paint('p98_beamkey', L1), cA = FP87.paint('axe', L1), cM = FP87.paint('mace', L1);
    out.fp = FP87.covers('p98_ridge') && FP87.covers('p98_beamkey') && !!cR && !!cK && new Set([sum(cR.canvas).h, sum(cK.canvas).h, sum(cA.canvas).h, sum(cM.canvas).h]).size === 4 && FP87.FORM.p98_ridge.head === 'ridgeflint' && FP87.FORM.p98_beamkey.head === 'beamkey';
    void eR;
    const set = (id) => GEAR87.SETS.find((s) => s.id === id);
    out.sets = GEAR87.SETS.length === 18 && set('oldreach').weapons.includes('p98_ridge') && set('flume').weapons.includes('p98_beamkey') && set('oldreach').armor.length === 5 && set('flume').armor.length === 6;
    // put a keeper down: its leavings lie by it, once
    const run = (map, is, flag, ids, re) => {
      const o = {}; delete G.flags[flag]; loadMap(map); closeModal(); G.state = 'play'; p.hp = p.hpMax = 900;
      const kp = G.ents.find((e) => e && e.kind === 'enemy' && is(e)); o.found = !!kp; if (!kp) return o;
      const items = () => G.ents.filter((e) => e && e.kind === 'item' && ids.includes(e.item));
      const cx = Engine.cam.x, cy = Engine.cam.y; const step = () => { update(0.05); Engine.cam.x = cx; Engine.cam.y = cy; p.x = cx; p.y = cy; };
      kp.dead = false; step(); o.aliveNothing = items().length === 0 && !G.flags[flag];
      clr(); kp.dead = true; kp.hp = 0; step();
      const got = items(); o.left = G.flags[flag] === 1 && got.length === 2 && ids.every((id) => got.some((e) => e.item === id)) && got.every((e) => Math.hypot(e.x - kp.x, e.y - kp.y) < 0.8) && said().some((t) => re.test(t));
      step(); step(); o.once = items().length === 2;
      for (const e of got) G.ents.splice(G.ents.indexOf(e), 1);                  // picked up
      kp.dead = false; step(); kp.dead = true; step(); o.neverAgain = items().length === 0;   // a week on, put down again
      // put down before this was built: the flag is not there, the body is
      delete G.flags[flag]; loadMap(map); closeModal(); G.state = 'play'; const kp2 = G.ents.find((e) => e && e.kind === 'enemy' && is(e)); kp2.dead = true; kp2.hp = 0; update(0.05);
      o.late = G.flags[flag] === 1 && G.ents.filter((e) => e && e.kind === 'item' && ids.includes(e.item)).length === 2;
      return o;
    };
    out.flint = run('p85_antlerdeep', (e) => e._p85a === 'keeper', 'p98_ka', ['w_p98_ridge', 'v_p98_shell'], /Flint-Back lies still/);
    out.note = run('p85_dryflume', (e) => e._p85 === 'keeper', 'p98_kf', ['w_p98_beamkey', 'v_p98_reed'], /The note stops/);
    // elsewhere nothing is looked for
    loadMap('oakhaven'); closeModal(); G.state = 'play'; delete G.flags.p98_ka; update(0.05); out.elsewhere = !G.flags.p98_ka;
    out.flags = ['p98_ka', 'p98_kf'].every((k) => G.flags[k] == null || G.flags[k] === 1);
    return out;
  });
  if (process.env.DEBUG98) console.log(JSON.stringify(r));
  check(r.three && r.sizes, 'three paintings in code, at twice the old detail: the bare fist, the glass fist, the open hands');
  check(r.glassBlue && r.fleshWarm && r.glassGlow, 'the glass fist is azure and keeps its own light; the bare fist is a hand');
  check(r.openSides, 'the open hands for a Song: the left one glass if that arm is, the right one what you wear');
  check(r.wears, 'the hands wear what you wear (bare skin and gloves are different pictures)');
  check(r.poses, 'bare-handed: the fist (and as it is put away); singing, or a Song with a blade out: the open hands; the glass arm: the glass fist, mirrored');
  check(r.glassLeft, 'the glass arm is raised on the LEFT of the view, where that arm is (' + r.glassCounts + ')');
  check(r.rightRests && r.handsGlassRests && r.bladeGlassRests, 'the hand that is not striking rests low at its own side: the right fist under the glass arm, the glass fist under bare hands and under a blade');
  check(r.unglassed && r.songNoRest && r.bladeNoRest, 'not glassed: no glass anywhere, the left fist still rests under bare hands; nothing rests during a Song or beside a blade');
  check(r.lock, 'the locked glass arm takes its pale wash on the arm itself, and nothing is drawn where the arm is not');
  check(r.punch, 'a fist goes straight out: the bare hands and the glass arm thrust, a sword still sweeps; a dragged swing of the glass arm goes the way you drag');
  check(r.warn === '{}', 'the body module drew all of it without a warning' + (r.warn === '{}' ? '' : ': ' + r.warn));
  check(r.defs && r.icons, 'the leavings exist: two weapons and two valuables, each with its own picture');
  check(r.fp, 'the Ridge-Flint and the Beam-Key have their own first-person pictures, unlike the axe, the mace and each other');
  check(r.sets, 'they join their realm\'s set as weapons: the Old Reach and the Flume; no set asks for more pieces than before');
  for (const [k, name] of [['flint', 'the Flint-Back'], ['note', 'the Standing Note']]) { const o = r[k] || {};
    check(o.found && o.aliveNothing && o.left && o.once, name + ': nothing while it lives; put down, a weapon and a trophy lie by it, with a line');
    check(o.neverAgain && o.late, name + ': never a second time; and given late to whoever put it down before this was built'); }
  check(r.elsewhere && r.flags, 'nothing is looked for outside the keepers\' places; the flags are 0 or 1');
  check(!errors.length, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'all passed');
  process.exit(fails ? 1 : 0);
})();
