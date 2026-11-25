// PREVIEW_URL=http://127.0.0.1:4228 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/boots125.test.js
// Phase 125b: in their boots. Six moments of Book One are played in the hero's own boots, and the hero can do only what
// the book has them do, well or badly: Kaelen at the needle and the eight bolts, Lyra at the Hold and the coda, Vane at One
// to Ten, Sable at the three names. A slip is the grey Echo (RITE43.echo) and never changes what happens; after two slips
// on one beat it plays itself. The captions are the book's own lines, read here from the manuscript. Also: the removals
// (the traveller-sings coda, Crane seeing the needle, the lenses Echo, the two Rite minigames), the old-save migration,
// the calling lines, the hero's hands behind GFX.heroHands, the first-frame fix (BODY21.redrawNeeded), the tideline line,
// Ada Pellow's age, and the French. The numbers are the design's §5.6 (story/Game Layer/Phase 125b - In their boots
// (design, for the builder).md).
'use strict';
const fs = require('node:fs');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.PREVIEW_URL || 'http://127.0.0.1:4228';
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
let fails = 0;
const check = (ok, m) => { if (ok) console.log('PASS ' + m); else { fails++; console.log('FAIL ' + m); } };

// the manuscript, by line (1-based, as the design cites it)
const MS = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md').split('\n');
const norm = (s) => String(s).replace(/<br\s*\/?>/gi, ' ').replace(/<\/?(i|b|em)>/gi, '').replace(/\*/g, '').replace(/\s+/g, ' ').trim();
const msText = (lines) => norm(lines.map((n) => MS[n - 1] || '').join(' '));
// a caption is verbatim when each piece of it (cut at "…") is in the book at the lines it names
function verbatim(t, lines) {
  const book = msText(lines);
  // (a cut sentence may end in a full stop where the book goes on: "slow would look wrong." for "slow would look wrong:")
  return norm(t).split('…').map((p) => p.trim()).filter((p) => p.length > 1).every((p) => book.includes(p) || book.includes(p.replace(/[.,:;]+$/, '')));
}

(async () => {
  // ---------------------------------------------------------------- 1, 2, 23: static
  const jsFiles = fs.readdirSync(path.join(ROOT, 'js')).filter((f) => /\.js$/.test(f) && f !== 'voice-lines.js');
  const jsSrc = Object.fromEntries(jsFiles.map((f) => [f, src('js/' + f)]));
  const has = (re, only) => Object.entries(jsSrc).filter(([f, s]) => (!only || only.includes(f)) && re.test(s)).map(([f]) => f);
  const gone1 = ['needleSeen', 'echoNeedle', 'NEEDLE_SEEN', 'hudEye', 'ignatius\\.rite\\.notch'].flatMap((w) => has(new RegExp(w)).map((f) => w + '@' + f))
    .concat(/\bblocked\(/.test(jsSrc['rite43.js']) ? ['blocked(@rite43.js'] : []);   // (js/night13.js has a blocked() of its own, for its own doors)
  check(gone1.length === 0, '1. Crane never sees the needle: no needleSeen, echoNeedle, NEEDLE_SEEN, blocked(, hudEye or ignatius.rite.notch in js/ (' + gone1.join(', ') + ')');
  const gone1b = ['boltsLost', 'WATCH_LIMIT', 'voskTurns'].filter((w) => new RegExp(w).test(jsSrc['rite43.js']));
  check(gone1b.length === 0, '1. the lenses Echo is gone from js/rite43.js: no boltsLost, WATCH_LIMIT or voskTurns (' + gone1b.join(', ') + ')');
  check(!/ignatius\.rite\.notch/.test(src('js/voice-lines.js')) && !/ignatius\.rite\.notch/.test(src('voices/script.json')), '1. the recording of Crane seeing the needle is gone from voices/script.json and js/voice-lines.js');
  const byYou = has(/coda_by_you/).filter((f) => f !== 'boots125.js');
  check(byYou.length === 0, '2. coda_by_you is read only by the migration in js/boots125.js (' + byYou.join(', ') + ')');
  check(has(/lb_you_sang/).length === 0, '2. there is no lb_you_sang');
  check(/She looks at Kaelen\./.test(jsSrc['coda.js']) && !/She looks at you\./.test(jsSrc['coda.js']), '2. js/coda.js has "She looks at Kaelen." and not "She looks at you."');
  check(!/523, 659, 784/.test(jsSrc['coda.js']), '2. the bright six-note phrase is gone from js/coda.js');
  const boots = jsSrc['boots125.js'] || '';
  check(boots.length > 0 && !/Math\.random/.test(boots), '23. js/boots125.js exists and draws on no Math.random');
  const tags = [...src('index.html').matchAll(/<script src="([^"?]+)/g)].map((m) => m[1]);
  check(tags[tags.length - 1] === 'js/mast123.js' && tags.indexOf('js/boots125.js') > tags.indexOf('js/faces124.js'), '23. js/boots125.js loads after js/faces124.js, and js/mast123.js is still the last script tag');
  const cover = src('test/cover105.test.js').split('\n').find((l) => /indoors nothing is drawn/.test(l) === false && /S\.stage\('tavern'/.test(l)) || '';
  check(/GFX\.groundCover = true; S\.frame\(\); const a = S\.hash\(\)/.test(cover), '20. test/cover105.test.js stages the tavern and hashes after a single S.frame()');
  check(!/four and a half fingers|hundred-and-forty/.test(jsSrc['game.js'] + jsSrc['grove.js']), '21. the tideline lines carry neither Kaelen\'s measure nor the man in the glass (js/game.js, js/grove.js)');
  const tsvPairs = new Map();
  for (const f of fs.readdirSync(path.join(ROOT, 'tools', 'i18n'))) if (/^p.*\.tsv$/.test(f)) for (const l of src('tools/i18n/' + f).split('\n')) { const c = l.split('\t'); if (c.length === 2 && c[0] && !l.startsWith('#')) tsvPairs.set(c[0], c[1]); }
  const tsv = (() => { try { return src('tools/i18n/p125b-boots.tsv'); } catch (e) { return ''; } })();
  check(tsv.split('\n').filter((l) => l.trim() && !l.startsWith('#')).every((l) => l.split('\t').length === 2) && tsv.length > 0, '23. tools/i18n/p125b-boots.tsv exists, two columns a row');

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /boots125|rite43|rope45|manifest53/.test(m.text())) errors.push(m.text()); });
    await page.goto(URL_ + '/index.html?nosw=1');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
    await page.locator('#btn-new').click();
    await page.locator('#cname').fill('Boots Tester');
    await page.locator('#c-next').click();
    await page.locator('.classlist button').first().click();   // Glass-Hand (blade): its calling lines are at the needle and the bolts
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
    const ok = await page.evaluate(() => typeof BOOTS125 === 'object' && !!BOOTS125);
    check(ok, 'BOOTS125 is loaded');
    if (!ok) throw new Error('no BOOTS125: the rest cannot run');
    await page.evaluate(() => {
      window.__msgs = []; const _m = window.msg; window.msg = function (t) { window.__msgs.push(String(t)); return _m.apply(this, arguments); };
      window.__ev = []; window.showEvent = (t, b, c) => { window.__ev.push({ t, b, c }); };
      window.requestAnimationFrame = () => 0;   // only T.step ticks the game
      window.__vo = []; VOICE_ACT.playLine = (l) => { window.__vo.push(l.id); return 0.01; };
      window.__hz = []; const _song = Audio_.sfx.song; Audio_.sfx.song = function (hz) { window.__hz.push(Math.round(hz)); return _song.apply(this, arguments); };
      window.T = {
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; update(dt || 0.05); } },
        until(pred, n, dt) { for (let i = 0; i < (n || 2000); i++) { if (pred()) return true; T.step(1, dt || 0.05); } return !!pred(); },
        beat(k, n) { return T.until(() => BOOTS125.S.beat === k, n || 3000, 0.05); },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        last() { return window.__ev[window.__ev.length - 1] || null; },
        press(i) { const e = T.last(); if (e && e.c[i || 0]) { e.c[i || 0].f(); return true; } return false; },
        ent(k) { return G.ents.find((e) => e && e._r43 === k); },
        tap(name) { BOOTS125.input(name, true); T.step(1, 0.05); BOOTS125.input(name, false); },
        grey() { const c = document.querySelector('canvas'); return !!c && /grayscale/.test(c.style.filter); },
        async pitch(perfect) {   // drive the running Hold the Pitch session by hand
          for (let i = 0; i < 40 && !REEDS.session; i++) await new Promise((r) => setTimeout(r, 25));
          const s = REEDS.session; if (!s) return null;
          const info = { duration: s.duration, title: s.title };
          if (perfect) { for (let i = 0; i < 2000 && !s.done; i++) { s.pitch = s.centsAt(Math.max(0, s.t)); s.step(0.05); } if (!s.done) s.finish(false); }
          else s.finish(true);
          for (let i = 0; i < 40 && REEDS.session === s; i++) await new Promise((r) => setTimeout(r, 25));
          await new Promise((r) => setTimeout(r, 30));
          return info;
        },
      };
      REEDS.forceManual = true;
      const f = G.flags; f.lyra_met = f.need_gate = f.gate_open = f.kaelen_met = f.tobiah_met = true; f.coil_done = f.rite_ready = f.church_come = true;
    });
    // each section runs on its own: one that throws is a FAIL of its own, and the rest still run
    const sect = async (name, fn) => { try { return await page.evaluate(fn); } catch (e) { fails++; console.log('FAIL section ' + name + ' threw: ' + String(e && e.message || e).split('\n').slice(0, 4).join(' / ')); return {}; } };
    const CAPS = (await page.evaluate(() => BOOTS125.CAPS)) || {};
    const bad = Object.entries(CAPS).filter(([, c]) => c.ms && c.ms.length && !verbatim(c.t, c.ms)).map(([k]) => k);
    check(Object.keys(CAPS).length > 80 && bad.length === 0, 'every book caption of the six moments is verbatim at the manuscript lines it names (' + Object.keys(CAPS).length + ' captions; not verbatim: ' + bad.slice(0, 6).join(', ') + ')');

    // ---------------------------------------------------------------- 3, 11a: the ring needs her voice
    const ringVoice = await sect('ringVoice', () => {
      const out = {}, f = G.flags;
      Object.assign(f, { part4: true, lyra_dw_met: true }); f.lyra_voice = false;
      const q = NPCS.lyra_dw.quest(G);
      out.text = q.text; out.tune = /YOU KNOW THE TUNE/.test(q.text);
      for (const c of q.choices || []) { try { c.f(G); } catch (e) { /* none */ } }
      out.set = !!f.ring_set;
      out.plan = (() => { try { return ringPlan(G); } catch (e) { return 'threw'; } })(); out.set2 = !!f.ring_set;
      for (const k of ['part4', 'lyra_dw_met', 'ring_set', 'ring_go', 'coda_go', 'ring_night']) delete f[k];
      return out;
    });
    check(!ringVoice.tune && !ringVoice.set && /I HAVE NO VOICE\. I KNOW\./.test(ringVoice.text) && /SOMETHING IS SITTING ON IT/.test(ringVoice.text), '3. without her voice Lyra offers no way to set the ring, and no "YOU KNOW THE TUNE"');
    check(!ringVoice.set2, '11. the ring cannot be set without lyra_voice, even by ringPlan itself');

    // ---------------------------------------------------------------- 4, 5: the needle
    const needle = await sect('needle', () => {
      const out = {}, f = G.flags;
      f.rite_started = true; f.r43 = 2; G.give('coil');
      const cs = G.maps.rootvault.casingRoom; loadMap('rootvault', { x: cs.cx + 0.5, y: cs.cy + 1.9, dir: -Math.PI / 2 }); G.state = 'play';
      RITE43.stageVault(G.map);
      window.__msgs.length = 0; window.__ev.length = 0;
      RITE43.startNeedle();
      const c = T.last(); out.card = !!c && /In his boots/.test(c.t) && /picked up the needle, and Lyra looked at his hands\. They were shaking\./.test(c.b) && c.c.length === 1 && c.c[0].t === 'Kneel.';
      out.callingBefore = T.heard(/Near the glass channels your own wrapped hand rings/);
      out.active = BOOTS125.active() === 'needle' && f.r43 === 3;
      T.press(0);
      out.glassArm = GEARLOOK21.of().glassArm === true; out.hidden = T.ent('kaelen').hidden === true;
      const V = RITE43.V, cr0 = [T.ent('crane').x, T.ent('crane').y];
      // 5: the pinch held too long
      out.toPinch = T.beat('pinch');
      out.hint = T.heard(/Hold to pinch\. Let go to drive the needle\./);
      BOOTS125.input('use', true); T.step(40, 0.05);
      const e1 = T.last(); out.slip1 = !!e1 && /An Echo/.test(e1.t) && /That is not how it went\./.test(e1.b) && /slow would look wrong/.test(e1.b) && T.grey();
      BOOTS125.input('use', false); T.press(0);
      out.again = BOOTS125.S.beat === 'pinch' && f.r43 === 3 && !T.grey();
      BOOTS125.input('use', true); T.step(10, 0.05); BOOTS125.input('use', false); T.step(2, 0.05);
      out.pinched = BOOTS125.S.beat !== 'pinch';
      out.toPegs = T.beat('pegs');
      for (let i = 0; i < 4; i++) T.tap('use');
      out.toLook = T.beat('look');
      const cr = T.ent('crane'); out.crouched = Math.hypot(cr.x - V.stool[0], cr.y - V.stool[1]) < 1.4;
      Engine.cam.x += 0.6; T.step(2, 0.05);
      const e2 = T.last(); out.slip2 = !!e2 && /Kaelen did not move\./.test(e2.b) && T.grey(); T.press(0);
      Engine.cam.x += 0.6; T.step(2, 0.05); const e3 = T.last(); out.slip3 = !!e3 && e3 !== e2 && /Kaelen did not move\./.test(e3.b); T.press(0);
      Engine.cam.x += 0.6; T.step(2, 0.05); out.plays = T.last() === e3;   // two slips on the beat: it plays itself
      out.done = T.until(() => !BOOTS125.active(), 3000);
      out.stage4 = f.r43 === 4;
      out.fortunate = T.heard(/^'I\. Am\. Fortunate\.'|^"I\. Am\. Fortunate\."/);
      out.back = Math.hypot(T.ent('crane').x - cr0[0], T.ent('crane').y - cr0[1]) < 0.3 && !T.ent('kaelen').hidden;
      out.callingAfter = T.heard(/You saw which thumb did the pinching/);
      const all = window.__msgs.concat(window.__ev.map((e) => e.t + ' ' + e.b));
      out.sees = all.filter((t) => /\b(Inquisitor|Crane|Ignatius|He)\b[^.]{0,40}\bsees\b/.test(t)).slice(0, 2);
      out.log = BOOTS125.S.log.filter((l) => l.m === 'needle').map((l) => l.ms || []).flat();
      out.fuse = window.__msgs.some((t) => /She was the fuse/.test(t));
      out.slips = f.p125b_slips;
      out.holdCard = /The Hold began at noon\./.test((T.last() || {}).b || '');
      return out;
    });
    const NEEDLE_LINES = [3044, 3046, 3068, 3070, 3072, 3074, 3076, 3078, 3084, 3086, 3088, 3090, 3092, 3094, 3096, 3098, 3104, 3106, 3108, 3110];
    const missN = NEEDLE_LINES.filter((n) => n !== 3044 && n !== 3046 && !(needle.log || []).includes(n));
    check(needle.card && needle.active && needle.glassArm && needle.hidden && needle.callingBefore, '4. from the lullaby card the player is in Kaelen\'s boots: "In his boots", the glass arm, the rite43 Kaelen hidden, the Glass-Hand\'s calling line before');
    check(missN.length === 0 && needle.fortunate && needle.stage4 && needle.back && !needle.fuse, '4. the captions are MS 3044-3110 (missing ' + missN.join(',') + '); "I. Am. Fortunate."; Crane comes down and goes back up; stage 4; nothing of the fuse here');
    check(!!needle.sees && needle.sees.length === 0, '4. no card or message has Crane seeing (' + (needle.sees || []).join(' | ') + ')');
    check(needle.toPinch && needle.hint && needle.slip1 && needle.again && needle.pinched, '5. holding the pinch two seconds is a grey slip, "slow would look wrong"; after "Again" the same beat, r43 still 3');
    check(needle.toPegs && needle.toLook && needle.crouched && needle.slip2 && needle.slip3 && needle.plays && needle.done, '5. a move while Crane crouches a foot away is a slip, "Kaelen did not move."; after two slips the beat plays itself');
    check(needle.callingAfter && needle.slips >= 3 && needle.holdCard, '12. the Glass-Hand\'s line after the needle; p125b_slips counted; the Hold card follows');

    // ---------------------------------------------------------------- 6, 7, 8: the Hold and the bolts
    const hold = await sect('hold', async () => {
      const out = {}, f = G.flags;
      const t0 = BOOTS125.S.clock;
      T.press(0); window.__msgs.length = 0;   // "Head at one span!" on the Hold card
      const c = T.last(); out.card = !!c && /In her boots/.test(c.t) && /began to sing\./.test(c.b) && c.c[0].t === 'Sing.';
      out.active = BOOTS125.active() === 'hold'; T.press(0);
      out.spanFirst = /Head at one span! One span and holding!/.test(window.__msgs.find((t) => !/^</.test(t) && /Head at one span|One note|chain creaked|Cantor|hundred and seventy-four/.test(t)) || '');
      const lyra = T.ent('lyra'); out.lyraHidden = !!lyra && lyra.hidden === true;
      out.lyraLook = GEARLOOK21.of().glassArm === false;
      out.toSing = T.beat('sing');
      out.cantorNone = !T.heard(/You have held it yourself at a bedside/);   // a Glass-Hand: not the cantor's line
      const s1 = T.pitch(false); const i1 = await s1;
      out.flat = !!i1 && i1.duration >= 20 && i1.duration <= 24;
      const e1 = T.last(); out.slip = !!e1 && /An Echo/.test(e1.t) && /the last thing a Cantor does is stop/.test(e1.b); T.press(0);
      out.again = BOOTS125.S.beat === 'sing';
      await T.pitch(true);
      out.toStopped = T.beat('stopped');
      out.heard = T.heard(/The Root heard her in the first minute/) && T.heard(/it's matching/) && T.heard(/Mark it/);
      // the bolts
      out.toBolts = T.until(() => BOOTS125.active() === 'bolts' && T.last() && /In his boots/.test(T.last().t), 400);
      const b = T.last(); out.boltsCard = /four hours of it ahead of her/.test(b.b) && /She was the fuse\./.test(b.b) && b.c[0].t === 'Pick up the toolbag.';
      out.callingB = T.heard(/Through your wrapped hand the lock sounds clean to you/);
      T.press(0);
      const V = RITE43.V;
      window.__msgs.length = 0;
      T.step(200, 0.05);   // the captions run while he walks; he has not reached the drum
      out.walkWait = BOOTS125.S.beat === 'walk' && T.heard(/Slippage on the lock/) && T.heard(/Spanner\. Sit on the rail there/);
      Engine.cam.x = V.kaelenDrum[0]; Engine.cam.y = V.kaelenDrum[1]; T.step(4, 0.05);
      out.kneelHint = BOOTS125.S.beat === 'kneel' && T.heard(/Kneel at the plate\./);
      out.noStepAway = !window.__msgs.concat(window.__ev.map((e) => e.b)).some((t) => /step away from the drum/i.test(t));
      T.tap('use');
      const k0 = BOOTS125.S.clock;
      out.toPlate = T.until(() => T.heard(/The plate came off\. He laid it down quietly\./), 3000, 0.05);
      out.boltSecs = BOOTS125.S.clock - k0;
      out.calls = window.__msgs.filter((t) => /^Tobiah(, from the rail)?: "(Pitch, one-seventy-four|One-seventy-four)/.test(t)).length;
      out.noBoltCount = !window.__msgs.some((t) => /\b\d+ (of 8|bolts?)\b|\bsecs?\b|\d+ ?s\b/.test(t));
      out.toChoice = T.until(() => T.last() && /hold onto something/.test((T.last().c[0] || {}).t || ''), 400);
      const ch = T.last(); out.oneChoice = ch.c.length === 1 && ch.c[0].t === 'You\'ll want to hold onto something.' && /Sir, what's that\?/.test(ch.b);
      out.notSeated = !f.bore_seated; T.press(0);
      out.seated = T.until(() => !!f.bore_seated, 200) && f.r43 === 5 && T.heard(/And he seated the coil in the port\./);
      out.callingB2 = T.until(() => T.heard(/The lock is out of tune now/), 200);
      // part two
      out.toPart2 = T.until(() => T.last() && /In her boots/.test(T.last().t) && /The lock threw\./.test(T.last().b), 400);
      T.press(0);
      out.toThrough = T.beat('through');
      const i2 = await T.pitch(true); out.through = !!i2 && i2.duration >= 5 && i2.duration <= 7;
      out.toFifth = T.beat('fifth');
      out.cue = T.heard(/LYRA! SING IT DOWN!/);
      out.curve = BOOTS125.FIFTH.map((p) => p[1]).filter((hz, i, a) => i === 0 || hz !== a[i - 1]);
      const i3 = await T.pitch(true); out.fifth = !!i3 && i3.duration === 9;
      out.secs = BOOTS125.S.clock - t0;
      const r = T.last(); out.result = !!r && /She let it fall\./.test(r.b) && /let go of the question/.test(r.b) && r.c.length === 1 && r.c[0].t === 'Step back into your own boots.';
      T.press(0);
      out.out = !BOOTS125.active() && /The Golems/.test((T.last() || {}).t || '') && !T.ent('lyra').hidden;
      const texts = BOOTS125.TEXTS.concat(RITE43.TEXTS);
      out.hours = texts.filter((t) => /(hours (had|have) passed|for four hours|after four hours)/i.test(t)).map((t) => t.slice(0, 50));
      out.noPoor = !('fifthPoor' in RITE43.TX) && !('holdGo' in RITE43.TX) && !('holdHint' in RITE43.TX);
      return out;
    });
    check(hold.card && hold.active && hold.spanFirst && hold.lyraHidden && hold.lyraLook && hold.toSing, '6. Lyra\'s boots start on "Head at one span!"; the rite43 Lyra is hidden; her own bare hands');
    check(hold.flat && hold.slip && hold.again && hold.toStopped && hold.heard && hold.cantorNone, '6. releasing the note before the cue is a slip, "the last thing a Cantor does is stop", and the note again; the Root hears her, "Mark it", the lullaby stops');
    check(JSON.stringify(hold.curve) === '[174,116,174,116]' && hold.fifth && hold.cue && hold.through && hold.result, '6. part two: through the lock on 174, then "SING IT DOWN" and the fifth, 174 116 174 116 (' + JSON.stringify(hold.curve) + '); the book\'s result card');
    check(!!hold.hours && hold.hours.length === 0, '6. no text says or implies that hours have passed (' + (hold.hours || []).join(' | ') + ')');
    check(hold.toBolts && hold.boltsCard && hold.callingB, '7. Kaelen\'s boots after "The lullaby stopped."; the four hours as what lies ahead (3126) and the fuse (3156-3160) here; the Glass-Hand\'s bolts line');
    check(hold.walkWait && hold.kneelHint && hold.noStepAway, '7. "Slippage on the lock", "Spanner"; the walk to the drum, then "Kneel at the plate."; no "step away from the drum" before the coil');
    check(hold.toPlate && Math.abs((hold.boltSecs || 0) - 51) <= 1 && hold.calls === 5 && hold.noBoltCount, '7. the plate comes off at 51 s of game time (' + (hold.boltSecs || 0).toFixed(1) + '); Tobiah calls five times (' + hold.calls + '); no timer or bolt count on screen');
    check(hold.toChoice && hold.oneChoice && hold.notSeated && hold.seated && hold.callingB2, '7. the only choice at "Sir, what\'s that?" is "You\'ll want to hold onto something."; it seats the coil');
    check(hold.secs > 0 && hold.secs < 240, '8. the whole playable Hold, from "Head at one span" to the end of the fifth, is under four minutes of game time (' + (hold.secs || 0).toFixed(0) + ' s)');
    check(hold.out && hold.noPoor, 'the step out, then the Golems as before; fifthGood/fifthPoor, holdGo and holdHint are gone');

    // ---------------------------------------------------------------- 9: One to Ten
    const rope = await sect('rope', () => {
      const out = {}, f = G.flags;
      for (const k of Object.keys(f)) if (/^r45|^escaped$/.test(k)) delete f[k];
      Object.assign(f, { r43: 7, bore_broken: true, greening: true, g44: 5, r45: 4, r45_way: 'deck', r45_count: 18, r45_load: 6, r45_jitter: 'kaelen', r45_kaelen: true });
      hide('#ending'); G.state = 'play'; G.escapeTimer = 300;
      ROPE45.toDeck(4); G.state = 'play';
      window.__msgs.length = 0; window.__ev.length = 0;
      const w0 = G.player.weapons.slice();
      ROPE45.startCount();
      const c = T.last(); out.card = !!c && /In his boots/.test(c.t) && /Take her up/.test(c.b) && /She went sideways\./.test(c.b) && c.c[0].t === 'The rail.';
      out.active = BOOTS125.active() === 'rope' && ROPE45.stage() === 5; T.press(0);
      out.vaneHidden = G.ents.some((e) => e._r45 === 'vane' && e.hidden);
      // Five, no take: a slip, back to Five
      out.to5 = T.beat('n5');
      out.takeHint = T.heard(/^Take the axe\.$/);
      T.until(() => BOOTS125.S.beat !== 'n5' || /An Echo/.test((T.last() || {}).t || ''), 400);
      const e1 = T.last(); out.noTake = /An Echo/.test(e1.t) && /Vane took the axe out of Mags's hands/.test(e1.b); T.press(0);
      out.back5 = BOOTS125.S.beat === 'n5';
      T.tap('use'); out.axe = currentWeapon() === WEAPONS.axe;
      // an early cut: a slip, back to the number where it happened
      out.to7 = T.beat('n7'); T.tap('use');
      const e2 = T.last(); out.early = /An Echo/.test(e2.t) && /Ten\. Vane cut the line\./.test(norm(e2.b)); T.press(0);
      out.back7 = BOOTS125.S.beat === 'n7';
      // no cut by Ten + 2.5 s: back to Nine
      out.to10 = T.beat('n10'); T.step(60, 0.05);
      const e3 = T.last(); out.late = /An Echo/.test(e3.t) && /'Do it,' said Kaelen\.|"Do it," said Kaelen\./.test(e3.b); T.press(0);
      out.back9 = BOOTS125.S.beat === 'n9';
      out.to10b = T.beat('n10'); T.tap('use');
      out.cut = T.heard(/^Vane cut the line\.$/) && f.r45_cut === true && ROPE45.stage() === 6;
      BOOTS125.input('song', true); T.step(2, 0.05); BOOTS125.input('song', false);
      out.nothing = T.heard(/^Nothing came up at all\.$/);
      const nums = ['One.', 'Two.', 'Three.', 'Four.', 'Five.', 'Six.', 'Seven.', 'Eight.', 'Nine.', 'Ten.'];
      const firsts = nums.map((n) => window.__msgs.findIndex((t) => norm(t).startsWith(n)));
      out.order = firsts.every((i, k) => i >= 0 && (k === 0 || i > firsts[k - 1]));
      out.toAfter = T.until(() => T.last() && /She came up like a cork\./.test(T.last().b), 400);
      const a = T.last(); out.after = /Nobody coiled it\. It hung there for six days\./.test(a.b) && a.c.length === 1 && !/You saw his hand go up|You were not looking/.test(a.b);
      const wid = G.player.weapons[G.player.weapon]; T.press(0);
      out.weaponBack = !BOOTS125.active() && JSON.stringify(G.player.weapons) === JSON.stringify(w0) && currentWeapon() === (WEAPONS[wid] || WEAPONS.hands);
      out.ledger = G.ledger.filter((r) => r.name === 'Aldric Vance').length === 1;
      out.r45 = f.r45 === 7;
      out.noHoldDrum = typeof ROPE45.holdDrum === 'undefined';
      return out;
      function norm(s) { return String(s).replace(/<\/?i>/g, '').replace(/\s+/g, ' ').trim(); }
    });
    check(rope.card && rope.active && rope.vaneHidden && rope.to5 && rope.takeHint, '9. Vane\'s boots from the count; "Take the axe." at Five');
    check(rope.noTake && rope.back5 && rope.axe, '9. no take by the end of Five is a slip (3752), back to Five; taking it puts the axe in currentWeapon()');
    check(rope.to7 && rope.early && rope.back7 && rope.to10 && rope.late && rope.back9, '9. a cut before Ten is a slip; no cut by Ten + 2.5 s is a slip back to Nine with "\'Do it,\' said Kaelen."');
    check(rope.to10b && rope.cut && rope.nothing && rope.order, '9. One to Ten in order with the book\'s lines; Vane cut the line; after the cut the Song key shows "Nothing came up at all."');
    check(rope.toAfter && rope.after && rope.weaponBack && rope.ledger && rope.r45 && rope.noHoldDrum, '9. the book\'s after card; Aldric in the ledger once; r45 reaches 7; holdDrum is gone');

    // ---------------------------------------------------------------- 10: the three names
    const names = await sect('names', () => {
      const out = {}, f = G.flags;
      hide('#ending'); G.state = 'play';
      delete f.p53; delete f.p53_deck; f.sable_joined = true; f.escaped = true; f.part3 = true; delete f.part4;   // (the ship's maps exist once she has escaped, as test/audit54 has it)
      const frag0 = JSON.stringify([G.player.fragments, Object.keys(f).filter((k) => /frag/.test(k)).map((k) => f[k])]);
      window.__msgs.length = 0; window.__ev.length = 0;
      loadMap(MANIFEST53.HOLD); G.state = 'play';
      out.tags = /Manifest/.test((T.last() || {}).t || ''); T.press(0);
      out.three = /Read you three/.test((T.last() || {}).b || ''); T.press(0);
      const c = T.last(); out.card = !!c && /In her boots/.test(c.t) && /"Go on, then," he said\./.test(c.b) && c.c[0].t === 'Read.';
      out.active = BOOTS125.active() === 'names'; T.press(0);
      out.toCorwin = T.beat('corwin');
      out.hint = T.heard(/^Keep your eyes on him\.$/);
      T.tap('use');
      Engine.cam.pitch = 242.42 * Math.tan(-15 * Math.PI / 180); T.step(3, 0.05);
      const e1 = T.last(); out.slip = /An Echo/.test(e1.t) && /she did not look at it/.test(e1.b);
      Engine.cam.pitch = 0; T.press(0);
      out.again = BOOTS125.S.beat === 'corwin';
      const order = [];
      for (const k of ['corwin', 'mirren', 'annet']) { T.beat(k); T.tap('use'); order.push(k); T.step(5, 0.05); }
      out.toEnd = T.until(() => !BOOTS125.active(), 6000);
      const shown = window.__msgs.map((t) => t.replace(/<\/?i>/g, ''));
      const at = (re) => shown.findIndex((t) => re.test(t));
      out.entries = [at(/Entry thirty-nine thousand, eight hundred and two/), at(/Entry forty thousand, nine hundred and ninety-one/), at(/Entry forty-one thousand and six/)];
      out.inOrder = out.entries.every((i, k, a) => i >= 0 && (k === 0 || i > a[k - 1]));
      out.whole = T.heard(/He was pressed in the second room because the first room had a queue\./) && T.heard(/He carried in the second consignment, Captain\. Your sixteen crates\./);
      out.iknow = T.heard(/Your engineer told me\. It is why I came up the ladder\./);
      out.filed = /Filed/.test((T.last() || {}).t || '') && f.p53 === 1;
      out.frag = JSON.stringify([G.player.fragments, Object.keys(f).filter((k) => /frag/.test(k)).map((k) => f[k])]) === frag0;
      out.callingNone = !T.heard(/You know the form for this/);
      return out;
    });
    check(names.tags && names.three && names.card && names.active && names.toCorwin && names.hint, '10. Sable\'s boots after "Go on, then"; "Keep your eyes on him."');
    check(names.slip && names.again, '10. looking 15 degrees down during an entry is a slip, "she did not look at it", and the same entry again');
    check(names.toEnd && names.inOrder && names.whole && names.iknow, '10. the three entries are MS 4556, 4560 and 4564 whole, in that order; "Your engineer told me."');
    check(names.filed && names.frag && names.callingNone, '10. the filed card follows; no fragment is spent');

    // ---------------------------------------------------------------- 11: the coda
    const coda = await sect('coda', () => {
      const out = {}, f = G.flags;
      const RESET = ['coda_done', 'coda_go', 'ring_set', 'ring_go', 'ring_fight', 'ring_sung', 'ring_struck', 'ring_back', 'lyra_dw_met', 'lyra_requiem', 'requiem_done', 'wearer_dead', 'wearer_coda_dead', 'coda_fight', 'coda_sung', 'herald_come'];
      for (const k of RESET) delete f[k];
      Object.assign(f, { part4: true, aegis_follow: true, sable_with: true, lyra_voice: true, kaelen_told_now: true });
      loadMap('deepwoods'); G.state = 'play'; G.player.hp = G.player.hpMax = 999;
      window.__msgs.length = 0; window.__ev.length = 0; window.__hz.length = 0;
      let q = NPCS.lyra_dw.quest(G); q = NPCS.lyra_dw.quest(G);
      const plan = q.choices[0].f(G); out.plan = /She looks at Kaelen\./.test(plan) && !/She looks at you/.test(plan) && f.ring_set;   // (the plan card is the game's present-tense retelling of MS 6022-6036; 6028 has 'She looked at Kaelen.')
      const t = G.map.triggers.find((o) => o.id === 'ring');
      Engine.cam.x = RING.cx; Engine.cam.y = RING.cy + 0.5; t.inside = false; checkTriggers();
      const c = T.last(); out.card = !!c && /In her boots/.test(c.t) && /She walked out past the last lamp at the second hour/.test(c.b) && c.c[0].t === 'Sing.';
      out.active = BOOTS125.active() === 'coda'; T.press(0);
      out.ringLyraHidden = G.ents.filter((o) => o.id === 'lyra_dw').every((o) => o.hidden);
      Engine.cam.x = RING.bx; Engine.cam.y = RING.by; T.step(4, 0.05);
      out.toSing = BOOTS125.S.beat === 'sing';
      BOOTS125.input('song', true); T.step(60, 0.05);
      out.going = f.ring_t < 44 && T.heard(/Tobin Ashgrove of the orchard rows/);
      // step off the spot: grey, and not ringAbort
      Engine.cam.x = RING.bx + 2; T.step(2, 0.05);
      const e1 = T.last(); out.stepSlip = /An Echo/.test(e1.t) && /walk further out/.test(e1.b) && T.grey() && f.ring_set === true && !G.journal.some((j) => /the ring failed/.test(j.text));
      T.press(0); out.backOn = Math.hypot(Engine.cam.x - RING.bx, Engine.cam.y - RING.by) < 0.3 && f.ring_t >= 44.9;
      // stop singing: a slip
      BOOTS125.input('song', false); T.step(4, 0.05);
      const e2 = T.last(); out.stopSlip = /An Echo/.test(e2.t) && /'I know,' said Lyra, and kept singing\.|"I know," said Lyra, and kept singing\./.test(e2.b); T.press(0);
      BOOTS125.input('song', true);
      out.toBurst = T.until(() => T.last() && /It came apart four feet in front of her\./.test(T.last().b), 4000, 0.05);
      BOOTS125.input('song', false);
      const b = T.last(); out.struck = f.ring_struck === 'kaelen' && f.coda_done === true;
      out.burst = ['Davin Hale, singing the fourth line of the harvest home.', 'Old Tam, going up for the high note he never once reached.', 'Ada Pellow, saying', 'A boy whistling a falling fifth with too much air in it.', 'Lyra\'s own voice, whole and warm and twenty-nine years old', 'And under all of it, rising up through it as the rest came apart, her father.'].every((s) => b.b.replace(/<\/?i>/g, '').includes(s));
      out.notTraveller = !/Two years of Kaelen|Your own voice/.test(b.b);
      out.naming = window.__msgs.filter((t) => /^(<i>)?Tobin Ashgrove\.(<\/i>)?$/.test(t)).length === 4 && T.heard(/Twenty feet\. Fifteen\./) && T.heard(/Ten feet\./);
      out.twoVoice = T.heard(/I know it's a two-voice part," said Lyra Ashgrove\./) && T.heard(/And she sang the coda alone\./);
      out.noPhrase = ![523, 659, 784].some((hz) => window.__hz.includes(hz));
      T.press(0);
      const a = T.last(); out.after = !!a && /did not forgive him either/.test(a.b) && a.c.length === 1 && a.c[0].t === 'Step back into your own boots.' && !/ring_sat/.test(JSON.stringify(Object.keys(f)));
      T.press(0); out.out = !BOOTS125.active();
      out.ending = codaEndingLines().some((l) => /Lyra walked out past the last lamp/.test(l) && /Kaelen came out of the dark/.test(l) && !/You struck/.test(l));
      return out;
    });
    check(coda.plan && coda.card && coda.active && coda.ringLyraHidden && coda.toSing && coda.going, '11. "She looks at Kaelen."; in Lyra\'s boots past the last lamp, her figure hidden; the office goes on while she sings');
    check(coda.stepSlip && coda.backOn, '11. moving two from the spot is a grey slip, not ringAbort: ring_set stays, no "the ring failed"; back on the spot at the start of the part');
    check(coda.stopSlip, '11. releasing the song is a slip, "\'I know,\' said Lyra, and kept singing."');
    check(coda.toBurst && coda.struck && coda.burst && coda.notTraveller && coda.naming && coda.twoVoice, '11. the naming four times, "Ten feet.", the coda alone; Kaelen strikes (ring_struck kaelen); the burst is the book\'s five voices and her father, and not the traveller\'s');
    check(coda.noPhrase, '11. no 523, 659 or 784 Hz phrase is played (' + JSON.stringify(coda.noPhrase) + ')');
    check(coda.after && coda.out && coda.ending, '11. the after card has "did not forgive him either" and one button; the ending reads Lyra\'s way');

    // ---------------------------------------------------------------- 12: the calling lines
    const calling = await sect('calling', async () => {
      const out = { rows: {}, fr: [] };
      const MOM = ['needle', 'hold', 'bolts', 'rope', 'names', 'coda'];
      const WANT = { blade: ['needle', 'bolts'], cantor: ['hold', 'coda'], corsair: ['rope'], archivist: ['names'], penitent: ['needle'], quarry: ['bolts'] };
      for (const id in WANT) {
        out.rows[id] = MOM.map((m) => { const l = BOOTS125.callingLines(id, m); return l && l[0] && l[1] ? m : null; }).filter(Boolean).join(',') === WANT[id].join(',');
      }
      await ACCESS.setLocale('fr');
      for (const id in WANT) for (const m of MOM) { const l = BOOTS125.callingLines(id, m); if (l) for (const s of l) if (STORY_I18N.translate(s) == null) out.fr.push(s.slice(0, 50)); }
      const miss = BOOTS125.TEXTS.filter((s) => typeof s === 'string' && s.length > 1 && STORY_I18N.translate(s) == null);
      out.miss = miss.slice(0, 5); out.nMiss = miss.length; out.n = BOOTS125.TEXTS.length;
      await ACCESS.setLocale('en');
      return out;
    });
    check(!!calling.rows && Object.values(calling.rows).length === 6 && Object.values(calling.rows).every(Boolean), '12. each calling has its before and after lines at its own moments and none at the others (' + JSON.stringify(calling.rows) + ')');
    check(!!calling.fr && calling.fr.length === 0 && calling.nMiss === 0, '12, 23. every calling line and every BOOTS125 text has French (' + calling.nMiss + ' of ' + calling.n + ' missing: ' + JSON.stringify(calling.miss) + ')');
    const notInTsv = ((await page.evaluate(() => BOOTS125.TEXTS.slice())) || []).filter((s) => !tsvPairs.has(s));
    check(notInTsv.length === 0, '23. every string in BOOTS125.TEXTS is in a TSV (' + notInTsv.length + ' not: ' + notInTsv.slice(0, 2).map((s) => s.slice(0, 50)).join(' | ') + ')');

    // ---------------------------------------------------------------- 13-17: old saves
    const saves = await sect('saves', () => {
      const out = {};
      const base = snapshotGame();
      const load = (flags, mapId, cam) => { const d = JSON.parse(JSON.stringify(base)); for (const k of Object.keys(d.flags)) if (/^(r43|r45|p53|p125b_|ring_|coda_|lyra_voice|kaelen_dw_done|kaelen_told_now|part4|wearer)/.test(k)) delete d.flags[k]; Object.assign(d.flags, flags); if (mapId) { d.mapId = mapId; d.cam = cam; } window.__ev.length = 0; window.__msgs.length = 0; BOOTS125.reset(); restoreGame(d); G.state = 'play'; return d; };
      // 13
      load({ part4: true, coda_done: true, coda_by_you: true, ring_struck: 'you', lyra_voice: false, wearer_coda_dead: true }, 'deepwoods', { x: 30.5, y: 32.5, dir: 0 });
      const f = G.flags;
      const lines = codaEndingLines();
      let ep = ''; try { const p = EPILOGUE.pick ? EPILOGUE.pick(f) : null; ep = JSON.stringify(p || ''); } catch (e) { ep = ''; }
      out.s13 = !('coda_by_you' in f) && f.lyra_voice === true && f.ring_struck === 'kaelen' && f.p125b_m === 1 && f.p125b_cv === 1 && !lines.some((l) => /you stood past the last lamp|You struck it/.test(l)) && lines.some((l) => /Lyra walked out past the last lamp/.test(l)) && !/You sang the coda she could not/.test(ep);
      out.s13d = JSON.stringify({ by: f.coda_by_you, v: f.lyra_voice, s: f.ring_struck, m: f.p125b_m, cv: f.p125b_cv });
      // 13b: inside the Unended Office, the traveller singing; Kaelen's "No." in the moss given to the traveller
      load({ part4: true, coda_done: true, coda_fight: true, coda_by_you: true, lyra_voice: false, ring_struck: 'kaelen', ring_sat_no: true, ring_sat_kind: true }, 'deepwoods', { x: 30.5, y: 32.5, dir: 0 });
      out.s13b = !('coda_by_you' in G.flags) && G.flags.coda_fight === true && G.flags.lyra_voice === true && !('ring_sat_no' in G.flags) && !('ring_sat_kind' in G.flags) && G.flags.p125b_cv === 1;
      // 13c: a save of the new kind is not migrated twice (p125b_m set): a finished coda of Lyra's is left as it is
      load({ part4: true, coda_done: true, ring_struck: 'kaelen', lyra_voice: true, p125b_m: 1 }, 'deepwoods', { x: 30.5, y: 32.5, dir: 0 });
      out.s13c = G.flags.p125b_cv === 0 && G.flags.ring_struck === 'kaelen' && G.flags.p125b_m === 1;
      // 14
      load({ part4: true, ring_set: true, ring_go: true, ring_fight: true, coda_go: true, coda_by_you: true, ring_t: 20, ring_w: 3 }, 'deepwoods', { x: 30.5, y: 32.5, dir: 0 });
      out.s14 = !G.flags.ring_set && !G.flags.ring_fight && !G.flags.coda_go && !('coda_by_you' in G.flags) && !('ring_t' in G.flags) && G.ents.filter((o) => o.ringLamp).every((o) => o.hidden) && G.ents.some((o) => o.id === 'lyra_dw' && !o.ringLyra && !o.hidden);
      // 14b: a mid-ring save of Lyra's own: reset, keeping the lamps set
      load({ part4: true, lyra_voice: true, ring_set: true, ring_go: true, ring_fight: true, coda_go: true, ring_t: 20 }, 'deepwoods', { x: 30.5, y: 32.5, dir: 0 });
      out.s14b = G.flags.ring_set === true && !G.flags.ring_fight;
      // 15
      const cs = G.maps.rootvault.casingRoom, vault = { x: cs.cx + 0.5, y: cs.cy + 1.9, dir: -Math.PI / 2 };
      load({ rite_started: true, coil_done: true, r43: 3 }, 'rootvault', vault); out.r43_3 = BOOTS125.active() === 'needle' && /In his boots/.test((window.__ev[window.__ev.length - 1] || {}).t || ''); BOOTS125.reset();
      load({ rite_started: true, coil_done: true, r43: 4 }, 'rootvault', vault); out.r43_4 = BOOTS125.active() === 'hold' && /In her boots/.test((window.__ev[window.__ev.length - 1] || {}).t || ''); BOOTS125.reset();
      load({ rite_started: true, r43: 7, bore_broken: true, greening: true, r45: 5, r45_way: 'deck', r45_count: 18, r45_load: 6 }, ROPE45.DECK, { x: 26.3, y: 20.5, dir: 1.57 }); out.r45_5 = BOOTS125.active() === 'rope'; BOOTS125.reset();
      load({ escaped: true, part3: true, sable_joined: true, p53: 9 }, MANIFEST53.HOLD, { x: 12.6, y: 11.0, dir: -1.57 }); out.p53_9 = BOOTS125.active() === 'names'; BOOTS125.reset();
      // 17: hostile flags
      window.__x = 0;
      load({ p125b_seen: '<b onmouseover="window.__x=1">x</b>', p125b_slips: -4, p125b_at: 1e9, p125b_m: 'yes', p125b_cv: { a: 1 } });
      const g = G.flags; out.s17 = [g.p125b_seen, g.p125b_slips, g.p125b_at, g.p125b_cv].every((v) => v === 0) && g.p125b_m === 1 && window.__x === 0 && !BOOTS125.active();
      out.s17d = JSON.stringify([g.p125b_seen, g.p125b_slips, g.p125b_at, g.p125b_m, g.p125b_cv]);
      // 16: a save made inside a boot
      try {
      load({ rite_started: true, coil_done: true, r43: 3 }, 'rootvault', vault);
      const trav = BOOTS125.S.home ? Object.assign({}, BOOTS125.S.home) : null;
      T.press(0); T.step(10, 0.05);
      const snap = snapshotGame();
      out.s16a = !!trav && snap.flags.p125b_at === 1 && Math.abs(snap.cam.x - trav.x) < 1e-6 && Math.abs(snap.cam.y - trav.y) < 1e-6;
      BOOTS125.reset(); window.__ev.length = 0; restoreGame(snap); G.state = 'play';
      out.s16b = BOOTS125.active() === 'needle' && BOOTS125.S.beat === 'card';
      BOOTS125.exit(); out.s16c = Math.abs(Engine.cam.x - trav.x) < 1e-6 && Math.abs(Engine.cam.y - trav.y) < 1e-6;
      } catch (e) { out.s16err = String(e && e.message || e); }
      return out;
    });
    check(saves.s13, '13. an old save where the traveller sang the coda: coda_by_you gone, lyra_voice true, ring_struck kaelen, p125b_m and p125b_cv 1; the ending and epilogue read Lyra\'s way (' + saves.s13d + ')');
    check(saves.s13b && saves.s13c, '13. inside the Unended Office with coda_by_you: it goes and the fight goes on with Lyra; ring_sat_no and ring_sat_kind are deleted; a new save is not migrated again');
    check(saves.s14 && saves.s14b, '14. an old save mid-ring with coda_by_you: the ring is reset, Lyra is at the fire, no lamps; a mid-ring save of Lyra\'s keeps the lamps');
    check(saves.r43_3 && saves.r43_4 && saves.r45_5 && saves.p53_9, '15. old saves at r43 3 and 4, r45 5 and p53 9 load into the start of their moment (' + JSON.stringify([saves.r43_3, saves.r43_4, saves.r45_5, saves.p53_9]) + ')');
    check(saves.s16a && saves.s16b && saves.s16c, '16. a save made inside a boot holds the traveller\'s camera and p125b_at; on load the moment restarts, and the camera comes back on exit');
    check(saves.s17, '17. p125b_* flags that are strings, markup, negative or huge are 0 after load, and nothing is injected (' + saves.s17d + ')');

    // ---------------------------------------------------------------- 18: the switch
    const sw = await sect('sw', () => {
      const out = {};
      const hashCv = () => { const c = Engine.ctx.canvas, d = Engine.ctx.getImageData(0, 0, c.width, c.height).data; let h = 0x811c9dc5 | 0; for (let i = 0; i < d.length; i += 3) h = Math.imul(h ^ d[i], 16777619) | 0; return h >>> 0; };
      const pin = (fn) => { const pn = performance.now.bind(performance); performance.now = () => 5000; try { return fn(); } finally { performance.now = pn; } };
      BOOTS125.reset();
      loadMap('tavern', { x: 8.5, y: 10.5, dir: -1.57 }); G.state = 'play';
      GFX.heroHands = true; pin(() => render()); const a = pin(() => { render(); return hashCv(); });
      GFX.heroHands = false; pin(() => render()); const b = pin(() => { render(); return hashCv(); });
      out.outside = a === b;
      // inside Lyra's boots (the Hold): her look with it on, the traveller's with it off
      const f = G.flags; f.rite_started = true; f.coil_done = true; f.r43 = 4;
      const cs = G.maps.rootvault.casingRoom; loadMap('rootvault', { x: cs.cx + 0.5, y: cs.cy + 1.9, dir: -Math.PI / 2 }); G.state = 'play';
      BOOTS125.reset(); BOOTS125.enter('hold'); T.press(0);
      const trav = (() => { const k = GFX.heroHands; GFX.heroHands = false; const L = GEARLOOK21.of(); GFX.heroHands = k; return L; })();
      GFX.heroHands = true; out.onLook = GEARLOOK21.of().glassArm === false; BOOTS125.stats.props = 0; pin(() => render()); out.propsOn = BOOTS125.stats.props;
      GFX.heroHands = false; out.offLook = GEARLOOK21.of().key === trav.key && GEARLOOK21.of().glassArm === G.player.glassed; BOOTS125.stats.props = 0; pin(() => render()); out.propsOff = BOOTS125.stats.props;
      BOOTS125.reset(); GFX.heroHands = true;
      PRESETS.apply('original'); out.original = GFX.heroHands === false;
      PRESETS.apply('medium'); out.medium = GFX.heroHands === true;
      out.inFx = GFX.FX.includes('heroHands');
      return out;
    });
    check(sw.outside, '18. outside a boot the frame is the same with GFX.heroHands on or off');
    check(sw.onLook && sw.offLook && sw.propsOff === 0 && sw.propsOn > 0, '18. inside a boot: the hero\'s look and props with it on; the traveller\'s own look and no prop with it off (' + JSON.stringify(sw) + ')');
    check(sw.original && sw.medium && sw.inFx, '18. GFX.heroHands is off in Original and on in Medium');

    // ---------------------------------------------------------------- 21, 22: the tideline and Ada
    const fix = await sect('fix', async () => {
      const out = {}, p = G.player;
      const g0 = [p.glassed, p.glass]; p.glassed = true;
      const f = G.flags; for (const k of ['sable_returned', 'sable_kept', 'sable_met']) delete f[k];
      hide('#ending'); G.state = 'play';
      p.glass = 80; try { ending(); } catch (e) { out.err = e.message; } out.end80 = document.querySelector('#ending-text').textContent;
      p.glass = 50; try { ending(); } catch (e) { /* none */ } out.end50 = document.querySelector('#ending-text').textContent;
      hide('#ending'); G.state = 'play'; p.glassed = g0[0]; p.glass = g0[1];
      out.ada = NPCS.p9_ada && NPCS.p9_ada.topics && NPCS.p9_ada.topics.Oakhaven;
      out.seventy = Object.values(VOICE_ACT.LINES).some((l) => /Seventy years/.test(l.t || ''));
      await ACCESS.setLocale('fr'); out.adaFr = STORY_I18N.translate(out.ada); await ACCESS.setLocale('en');
      const ids = BOOTS125.voiceIds(); out.noVoice = ids.filter((id) => !VOICE_ACT.LINES[id]);
      return out;
    });
    check(!/four and a half fingers|hundred-and-forty|three inches from the throat/.test(fix.end80 + fix.end50) && /You have stopped measuring it/.test(fix.end80) && /you keep it wrapped/.test(fix.end50), '21. the Part Two ending for a glassed traveller is the stranger\'s own glass, not Kaelen\'s measure' + (fix.err ? ' (' + fix.err + ')' : ''));
    check(/^Fifty-one years/.test(fix.ada || '') && !fix.seventy && !!fix.adaFr, '22. Ada says "Fifty-one years"; no recording says "Seventy years"; the French exists');
    check(!!fix.noVoice && fix.noVoice.length === 0, 'every voice the moments name is recorded (' + (fix.noVoice || []).join(', ') + ')');

    check(errors.length === 0, 'no page errors (' + errors.slice(0, 3).join(' | ') + ')');

    // ---------------------------------------------------------------- 19: the first frame, in the 3D view with the sculpted hands
    const p3 = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    p3.setDefaultTimeout(900000);
    await p3.addInitScript(() => { window.__r3d21 = { automation: true, force: true }; try { localStorage.setItem('octave.r3d21.v1', JSON.stringify({ mode: 'on', cap: 80 })); } catch (e) { /* none */ } });
    await p3.goto(URL_ + '/?nosw=1', { timeout: 600000, waitUntil: 'domcontentloaded' });
    await p3.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000, polling: 500 });
    await p3.locator('#btn-new').click(); await p3.locator('#cname').fill('Frame Tester');
    await p3.locator('#c-next').click(); await p3.locator('.classlist button').first().click();
    await p3.locator('#c-next').click(); await p3.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await p3.locator('#c-go').count()); i++) {
      const choice = p3.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await p3.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await p3.locator('#c-go').click(); await p3.locator('#btn-intro-skip').click();
    await p3.waitForTimeout(500);
    const ff = await p3.evaluate(() => {
      window.requestAnimationFrame = () => 0; window.showEvent = () => {};
      const out = {};
      const pin = (fn) => { const rn = Math.random, pn = performance.now.bind(performance), dn = Date.now; let sd = 7; Math.random = () => (sd = (sd * 16807) % 2147483647) / 2147483647; performance.now = () => 123456; Date.now = () => 1700000000000; try { return fn(); } finally { Math.random = rn; performance.now = pn; Date.now = dn; } };
      const stage = (map, x, y, dir, tod) => pin(() => { G.state = 'paused'; G.day = 3; G.tod = tod; loadMap(map, { x, y, dir }); G.fadeT = 0; G.tod = tod; Engine.cam.pitch = 0; Engine.cam.bob = 0; try { Weather.hold('clear'); } catch (e) { /* none */ } G.state = 'play'; });
      const frame = () => pin(() => render());
      const hash = () => { const p = R3D.readPixels(); if (!p) return 0; let h = 0x811c9dc5 | 0; const d = p.data; for (let i = 0; i < d.length; i++) h = Math.imul(h ^ d[i], 16777619) | 0; return h >>> 0; };
      out.r3d = typeof R3D === 'object' && R3D.active && R3D.active();
      PRESETS.apply('medium'); GFX.sculptedHands = true;
      stage('oakhaven', 23.5, 20.5, -1.57, 0.5); frame(); frame(); frame();
      stage('tavern', 8.5, 10.5, -1.57, 0.85); frame(); const a = hash(); frame(); const b = hash();
      out.tavern = a === b && a !== 0;
      // a step into a hero's boots on the same map
      const f = G.flags; f.rite_started = true; f.coil_done = true; f.r43 = 2; G.give('coil');
      const cs = G.maps.rootvault.casingRoom; stage('rootvault', cs.cx + 0.5, cs.cy + 1.9, -1.57, 0.5); RITE43.stageVault(G.map); frame(); frame();
      pin(() => { BOOTS125.reset(); BOOTS125.enter('needle'); }); frame(); const c = hash(); frame(); const d = hash();
      out.boots = c === d && c !== 0;
      pin(() => BOOTS125.reset());
      // the pixel hands too
      GFX.sculptedHands = false; stage('oakhaven', 23.5, 20.5, -1.57, 0.5); frame(); frame(); stage('tavern', 8.5, 10.5, -1.57, 0.85); frame(); const e = hash(); frame(); const g = hash();
      out.pixel = e === g;
      GFX.sculptedHands = true;
      // the classic view: never a second render
      try { R3D.setMode && R3D.setMode('off'); } catch (x) { /* none */ }
      let seen = false; const _r = BODY21.redrawNeeded; stage('oakhaven', 23.5, 20.5, -1.57, 0.5); for (let i = 0; i < 4; i++) { frame(); if (!R3D.active() && BODY21.redrawNeeded()) seen = true; }
      stage('tavern', 8.5, 10.5, -1.57, 0.85); for (let i = 0; i < 4; i++) { frame(); if (!R3D.active() && BODY21.redrawNeeded()) seen = true; }
      out.classic = typeof _r === 'function' && !seen;
      return out;
    });
    check(ff.r3d && ff.tavern, '19. with the sculpted hands in the 3D view, the first render() after staging the tavern from outdoors hashes equal to the second (' + JSON.stringify(ff) + ')');
    check(ff.boots, '19. the same after BOOTS125.enter on the same map');
    check(ff.pixel, '19. the same with the pixel hands');
    check(ff.classic, '19. in the classic view BODY21.redrawNeeded() is never true');
    await p3.close();
  } catch (e) { fails++; console.log('FAIL ' + (e && e.stack || e)); }
  finally { await browser.close(); }
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
