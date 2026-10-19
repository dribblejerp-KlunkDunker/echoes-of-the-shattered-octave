// PREVIEW_URL=http://127.0.0.1:3402 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/score.test.js
// Uses the managed preview; never starts a server or writes player saves.
// Covers js/score.js: the right piece for each area, dungeon, boss and story stage; Original = the old music requests;
// one AudioContext; bounded scheduling over a simulated ten minutes (a counting fake context); silence before audio
// unlock and while muted; every piece rendered offline (finite, audible, not clipping); the Options row; hostile flags.
// Set SCORE_SHOTS to a directory to keep screenshots.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const SHOTS = process.env.SCORE_SHOTS || path.join(os.tmpdir(), 'octave-score');
fs.mkdirSync(SHOTS, { recursive: true });
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--autoplay-policy=no-user-gesture-required'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = []; page.on('pageerror', e => errors.push(e.message));
    page.on('console', m => { if (m.type() === 'warning' && /score/.test(m.text())) errors.push('console: ' + m.text()); });
    // count every live AudioContext the page creates (there must be exactly one)
    await page.addInitScript(() => {
      window.__ctxCount = 0;
      const AC = window.AudioContext;
      if (AC) window.AudioContext = class extends AC { constructor(...a) { super(...a); window.__ctxCount++; } };
    });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:3402');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title' && typeof SCORE !== 'undefined');
    const ev = (fn, arg) => page.evaluate(fn, arg);

    // ---- before audio unlock: nothing happens, nothing throws, requests pass straight through
    const pre = await ev(() => {
      const out = {};
      out.ctx = Audio_.ctx;
      Audio_.music.request('town', 1); out.cur = Audio_.music.current;
      Audio_.music.tick(0.1); SCORE.tick(0.1);
      Audio_.music.request('title'); Audio_.music.tick(0.1);
      out.want = SCORE.want; out.active = SCORE.active; out.ctxCount = window.__ctxCount;
      return out;
    });
    assert.equal(pre.ctx, null, 'audio is locked at load');
    assert.equal(pre.cur, 'town', 'a request before unlock is forwarded untouched');
    assert.deepEqual(pre.want, { area: null, boss: null, layer: null }, 'no procedural want before unlock');
    assert.deepEqual(pre.active, {}, 'no instance before unlock');
    assert.equal(pre.ctxCount, 0, 'the score creates no AudioContext of its own');

    await page.locator('#btn-new').click(); await page.locator('#cname').fill('Score Tester');
    await page.locator('#c-next').click(); await page.locator('.classlist button').first().click();
    await page.locator('#c-next').click(); await page.locator('#c-next').click();
    for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
      const choice = page.locator('#create-panel .list button').first();
      if (await choice.count()) await choice.click();
      else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().click();
    }
    await page.locator('#c-go').click(); await page.locator('#btn-intro-skip').click();
    await page.waitForTimeout(500);
    await ev(() => { window.requestAnimationFrame = () => 0; Audio_.init(); Audio_.resume(); });
    await page.waitForTimeout(200);

    // ---- pure choice: areas, bosses, story stages
    const pure = await ev(() => {
      const o = {};
      o.areas = {
        oak: SCORE.pieceFor('oakhaven', 'town'), grove: SCORE.pieceFor('whispergrove', 'grove'), woods: SCORE.pieceFor('deepwoods', 'coda'),
        quarry: SCORE.pieceFor('quarry', 'dungeon'), root: SCORE.pieceFor('rootvault', 'dungeon'), hedge: SCORE.pieceFor('underhedge', 'dungeon'),
        cata: SCORE.pieceFor('catacombs', 'dungeon'), maus: SCORE.pieceFor('mausoleum', 'coda'), belfry: SCORE.pieceFor('belfry', 'coda'), malting: SCORE.pieceFor('malting', 'dungeon'),
        // left alone: other maps, other cues
        clearing: SCORE.pieceFor('clearing', 'wild'), tavern: SCORE.pieceFor('oakhaven', 'tavern'), inside: SCORE.pieceFor('watchhouse', 'town'), combat: SCORE.pieceFor('quarry', 'combat'), cloister: SCORE.pieceFor('cloister', 'grove'),
      };
      o.bosses = {};
      for (const t of ['requiem', 'broodmother', 'weaver', 'aegis', 'pressman', 'deacon', 'wearer', 'wearer_coda', 'golem', 'captain', 'hound', 'proctor']) o.bosses[t] = SCORE.bossFor(t);
      o.stages = [{}, { lyra_met: true }, { gate_open: true }, { lyra_met: true, rite_started: true }, { rite_started: true, greening: true }, { part3: true }, { part3: true, part4: true }, { part4: true, book_one_done: true }].map(f => SCORE.storyStage(f));
      o.pieces = Object.keys(SCORE.PIECES);
      return o;
    });
    assert.deepEqual(pure.areas, { oak: 'oakhaven', grove: 'whispergrove', woods: 'deepwoods', quarry: 'quarry', root: 'rootvault', hedge: 'rootvault', cata: 'catacombs', maus: 'mausoleum', belfry: 'mausoleum', malting: 'quarry', clearing: null, tavern: null, inside: null, combat: null, cloister: null });
    assert.equal(pure.bosses.requiem, 'boss_requiem'); assert.equal(pure.bosses.broodmother, 'boss_broodmother'); assert.equal(pure.bosses.weaver, 'boss_weaver');
    assert.equal(pure.bosses.aegis, 'boss_aegis'); assert.equal(pure.bosses.pressman, 'boss_pressman'); assert.equal(pure.bosses.deacon, 'boss_deacon');
    assert.equal(pure.bosses.wearer, 'boss_wearer'); assert.equal(pure.bosses.wearer_coda, 'boss_wearer'); assert.equal(pure.bosses.golem, 'boss_golem'); assert.equal(pure.bosses.captain, 'boss_captain');
    assert.equal(pure.bosses.hound, null); assert.equal(pure.bosses.proctor, null);
    assert.deepEqual(pure.stages, [0, 1, 1, 2, 3, 3, 4, 5], 'story stage follows the flags');
    for (const id of ['oakhaven', 'whispergrove', 'deepwoods', 'quarry', 'rootvault', 'catacombs', 'mausoleum', 'boss_requiem', 'boss_broodmother', 'boss_weaver', 'boss_aegis', 'boss_pressman', 'boss_deacon', 'boss_wearer', 'boss_golem', 'boss_captain', 'maintheme']) assert.ok(pure.pieces.includes(id), 'piece exists: ' + id);

    // ---- through the real director: the game's own musicDirector picks the piece for each map
    const dir = await ev(() => {
      const out = {};
      G.state = 'play'; G.escapeTimer = 0;
      for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
      for (const id of ['oakhaven', 'whispergrove', 'deepwoods', 'quarry', 'rootvault', 'underhedge', 'catacombs', 'mausoleum', 'belfry', 'malting', 'clearing', 'tavern', 'cloister']) {
        if (!G.maps[id]) { out[id] = 'missing'; continue; }
        loadMap(id); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
        SCORE.dropAll(); combatT = 0;
        musicDirector(0.016); Audio_.music.tick(0.016);
        out[id] = { want: SCORE.want.area, current: Audio_.music.current, active: (SCORE.active.area || {}).pid || null };
      }
      return out;
    });
    const expectArea = { oakhaven: 'oakhaven', whispergrove: 'whispergrove', deepwoods: 'deepwoods', quarry: 'quarry', rootvault: 'rootvault', underhedge: 'rootvault', catacombs: 'catacombs', mausoleum: 'mausoleum', belfry: 'mausoleum', malting: 'quarry' };
    for (const id in expectArea) {
      assert.equal(dir[id].want, expectArea[id], `${id} wants ${expectArea[id]}`);
      assert.equal(dir[id].active, expectArea[id], `${id} instance is ${expectArea[id]}`);
      assert.equal(dir[id].current, null, `${id}: the MP3 cue is replaced while the piece plays`);
    }
    for (const id of ['clearing', 'tavern', 'cloister']) {
      assert.equal(dir[id].want, null, `${id} is left to the recorded score`);
      assert.ok(dir[id].current, `${id} still requests an MP3 cue`);
    }

    // ---- bosses take over from combat; ordinary enemies do not
    const boss = await ev(() => {
      const out = {};
      loadMap('oakhaven'); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
      const c = Engine.cam, added = [];
      const run = (type, st) => {
        SCORE.dropAll(); combatT = 0;
        const e = hydrate({ kind: 'enemy', type, x: c.x + 3, y: c.y }); e.state = st || 'chase'; G.ents.push(e); added.push(e);
        musicDirector(0.016); Audio_.music.tick(0.016);
        const r = { boss: SCORE.want.boss, current: Audio_.music.current, active: (SCORE.active.boss || {}).pid || null };
        e.hidden = true; return r;
      };
      for (const t of ['requiem', 'broodmother', 'weaver', 'aegis', 'pressman', 'deacon', 'wearer', 'wearer_coda', 'golem', 'captain']) out[t] = run(t);
      out.hound = run('hound'); out.idleBoss = run('weaver', 'idle');
      for (const e of added) { const i = G.ents.indexOf(e); if (i >= 0) G.ents.splice(i, 1); }
      combatT = 0; SCORE.dropAll();
      return out;
    });
    const wantBoss = { requiem: 'boss_requiem', broodmother: 'boss_broodmother', weaver: 'boss_weaver', aegis: 'boss_aegis', pressman: 'boss_pressman', deacon: 'boss_deacon', wearer: 'boss_wearer', wearer_coda: 'boss_wearer', golem: 'boss_golem', captain: 'boss_captain' };
    for (const t in wantBoss) {
      assert.equal(boss[t].boss, wantBoss[t], `${t} engaged -> ${wantBoss[t]}`);
      assert.equal(boss[t].active, wantBoss[t], `${t} instance`);
      assert.equal(boss[t].current, null, `${t}: shared combat cue is replaced`);
    }
    assert.equal(boss.hound.boss, null, 'an ordinary hound keeps the shared combat cue'); assert.equal(boss.hound.current, 'combat');
    assert.equal(boss.idleBoss.boss, null, 'a boss that is not engaged does not start its theme'); assert.notEqual(boss.idleBoss.current, 'combat');

    // ---- story-evolving main theme: stage follows flags, the voices change with it
    const story = await ev(() => {
      G.state = 'title'; const saved = Object.assign({}, G.flags);
      const out = [];
      const sets = [{}, { lyra_met: true }, { lyra_met: true, rite_started: true }, { greening: true }, { part3: true, part4: true }, { book_one_done: true }];
      for (const f of sets) {
        for (const k of Object.keys(G.flags)) delete G.flags[k];
        Object.assign(G.flags, f);
        SCORE.dropAll(); Audio_.music.request('title'); Audio_.music.tick(0.016);
        out.push({ cur: Audio_.music.current, want: SCORE.want.layer, stageNow: SCORE.storyStage(G.flags) });
      }
      for (const k of Object.keys(G.flags)) delete G.flags[k]; Object.assign(G.flags, saved);
      G.state = 'play'; SCORE.dropAll();
      return out;
    });
    story.forEach((s, i) => { assert.equal(s.cur, 'title', 'title.mp3 keeps playing under the theme layer'); assert.equal(s.want, 'maintheme'); assert.equal(s.stageNow, [0, 1, 2, 3, 4, 5][i]); });

    // ---- Original: exactly the old music requests, nothing procedural
    const orig = await ev(() => {
      const out = {};
      SCORE.setMode('original'); out.stored = localStorage.getItem('octave.score.v1');
      loadMap('quarry'); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true; combatT = 0;
      musicDirector(0.016); Audio_.music.tick(0.016); out.quarry = { cur: Audio_.music.current, want: SCORE.want, keys: Object.keys(Audio_.music.debug()) };
      loadMap('deepwoods'); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
      musicDirector(0.016); Audio_.music.tick(0.016); out.woods = Audio_.music.current;
      loadMap('oakhaven'); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
      musicDirector(0.016); Audio_.music.tick(0.016); out.oak = Audio_.music.current;
      const e = hydrate({ kind: 'enemy', type: 'wearer', x: Engine.cam.x + 3, y: Engine.cam.y }); e.state = 'chase'; G.ents.push(e);
      musicDirector(0.016); Audio_.music.tick(0.016); out.boss = Audio_.music.current;
      e.hidden = true; G.ents.splice(G.ents.indexOf(e), 1); combatT = 0;
      G.state = 'title'; Audio_.music.request('title'); Audio_.music.tick(0.016); out.title = Audio_.music.current;
      Audio_.music.request('ending'); out.ending = Audio_.music.current;
      Audio_.music.request('dungeon', 0.9, 0.9); out.rate = Audio_.music.current;
      out.active = SCORE.active; out.retired = SCORE.retiredCount;
      G.state = 'play';
      return out;
    });
    assert.equal(orig.stored, '{"mode":"original"}');
    assert.equal(orig.quarry.cur, 'dungeon'); assert.ok(orig.quarry.keys.includes('dungeon'), 'the dungeon MP3 is requested in Original');
    assert.deepEqual(orig.quarry.want, { area: null, boss: null, layer: null });
    assert.equal(orig.woods, 'coda', 'Deep Woods still shares its old cue'); assert.equal(orig.oak, 'town'); assert.equal(orig.boss, 'combat');
    assert.equal(orig.title, 'title'); assert.equal(orig.ending, 'ending'); assert.equal(orig.rate, 'dungeon');
    assert.deepEqual(orig.active, {}, 'no procedural instance in Original');
    assert.ok(orig.retired <= 60, 'retired pieces are queued for reaping (the sims below check they are reaped)');

    // ---- Options row (Graphics & access): switch + persistence, fits 1280x800 and 640x400
    const row = await ev(() => {
      SCORE.setMode('extended'); G.state = 'panel'; renderMenu(); document.getElementById('mn-gfx').click();
      const b = document.getElementById('score-mode'); const o = { text: b.textContent, pressed: b.getAttribute('aria-pressed') };
      b.click(); o.after = b.textContent; o.mode = SCORE.state.mode; o.stored = localStorage.getItem('octave.score.v1');
      b.click(); o.back = b.textContent; o.mode2 = SCORE.state.mode;
      renderAccessibilityMenu(); o.rows = document.querySelectorAll('#score-mode').length;
      return o;
    });
    assert.equal(row.text, 'Extended'); assert.equal(row.pressed, 'true'); assert.equal(row.after, 'Original'); assert.equal(row.mode, 'original');
    assert.equal(row.stored, '{"mode":"original"}'); assert.equal(row.back, 'Extended'); assert.equal(row.mode2, 'extended'); assert.equal(row.rows, 1, 'one Score row');
    await page.screenshot({ path: path.join(SHOTS, 'score-options-1280.png') });
    await page.setViewportSize({ width: 640, height: 400 });
    await page.waitForTimeout(150);
    const fit = await ev(() => { const p = document.getElementById('modal-panel'); document.getElementById('score-mode').scrollIntoView(); return { sw: p.scrollWidth, cw: p.clientWidth, vis: document.getElementById('score-mode').getBoundingClientRect().right <= window.innerWidth }; });
    assert.ok(fit.sw <= fit.cw + 1, 'no horizontal overflow at 640x400'); assert.ok(fit.vis, 'the Score button is on screen at 640x400');
    await page.screenshot({ path: path.join(SHOTS, 'score-options-640.png') });
    await page.setViewportSize({ width: 1280, height: 800 });
    await ev(() => { closeModal(); G.state = 'play'; });

    // ---- hostile flags: strings, objects, markup never reach the DOM and never break the stage
    const hostile = await ev(() => {
      const saved = Object.assign({}, G.flags);
      G.flags.part4 = '<img src=x onerror="window.__pwn=1">'; G.flags.lyra_met = { toString() { throw new Error('x'); } }; G.flags.book_one_done = 0;
      const s = SCORE.storyStage(G.flags);
      G.state = 'title'; Audio_.music.request('title'); Audio_.music.tick(0.016); G.state = 'play';
      const html = document.body.innerHTML.includes('onerror="window.__pwn');
      for (const k of Object.keys(G.flags)) delete G.flags[k]; Object.assign(G.flags, saved); SCORE.dropAll();
      return { s, html, pwn: window.__pwn || 0 };
    });
    assert.ok(hostile.s >= 0 && hostile.s <= 5); assert.equal(hostile.html, false); assert.equal(hostile.pwn, 0);

    // ---- bounded scheduling over a simulated ten minutes (a counting fake AudioContext)
    const sim = await ev(() => {
      function makeFake() {
        const f = { t: 0, state: 'running', sampleRate: 44100, created: 0, sources: [], graph: 0 };
        const param = (v) => ({ value: v || 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
        const node = (kind, extra) => {
          const n = Object.assign({ kind, ends: Infinity, gone: false, connect(x) { return x; }, disconnect() { n.gone = true; }, frequency: param(440), detune: param(0), gain: param(1), Q: param(1), delayTime: param(0), type: 'sine' }, extra || {});
          f.created++;
          if (kind === 'osc' || kind === 'buf') { n.start = () => {}; n.stop = (t) => { n.ends = t === undefined ? f.t : t; }; f.sources.push(n); } else f.graph++;
          return n;
        };
        Object.defineProperty(f, 'currentTime', { get() { return f.t; } });
        f.createOscillator = () => node('osc'); f.createBufferSource = () => node('buf', { loop: false, buffer: null });
        f.createGain = () => node('gain'); f.createBiquadFilter = () => node('filter'); f.createDelay = () => node('delay');
        f.createBuffer = (c, len) => ({ getChannelData: () => new Float32Array(len) });
        f.liveSources = () => { let n = 0; for (const s of f.sources) if (!s.gone && s.ends > f.t) n++; return n; };
        f.prune = () => { f.sources = f.sources.filter(s => !s.gone && s.ends > f.t - 10); };
        return f;
      }
      const run = (label, setup, seconds, requestFn) => {
        const f = makeFake(); SCORE.useContext(f); SCORE.setSeed(42);
        const saved = G.mapId; setup();
        let peak = 0, phases = {}, retiredPeak = 0;
        const dt = 1 / 60, steps = Math.round(seconds / dt);
        for (let i = 0; i < steps; i++) {
          f.t += dt;
          SCORE.plan(...requestFn()); SCORE.tick(dt);
          if (i % 30 === 0) { peak = Math.max(peak, f.liveSources()); f.prune(); phases[SCORE.area.phase] = (phases[SCORE.area.phase] || 0) + 1; retiredPeak = Math.max(retiredPeak, SCORE.retiredCount); }
        }
        const r = { label, peak, created: f.created, phases, retiredPeak, end: SCORE.active };
        SCORE.useContext(null); G.mapId = saved; return r;
      };
      const out = {};
      out.oak = run('oak', () => { G.mapId = 'oakhaven'; }, 600, () => ['town', 1, 1]);
      out.woods = run('woods', () => { G.mapId = 'deepwoods'; }, 600, () => ['coda', 1, 1]);
      return out;
    });
    // the boss run needs a boss engaged: redo it with one in place (engagedBoss reads G.ents)
    const sim2 = await ev(() => {
      const f = (() => {
        const f = { t: 0, state: 'running', sampleRate: 44100, created: 0, sources: [] };
        const param = (v) => ({ value: v || 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {}, setTargetAtTime() {}, cancelScheduledValues() {} });
        const node = (kind) => { const n = { kind, ends: Infinity, gone: false, connect(x) { return x; }, disconnect() { n.gone = true; }, frequency: param(440), detune: param(0), gain: param(1), Q: param(1), delayTime: param(0), type: 'sine' }; f.created++; if (kind === 'osc' || kind === 'buf') { n.start = () => {}; n.stop = (t) => { n.ends = t === undefined ? f.t : t; }; f.sources.push(n); } return n; };
        Object.defineProperty(f, 'currentTime', { get() { return f.t; } });
        f.createOscillator = () => node('osc'); f.createBufferSource = () => node('buf'); f.createGain = () => node('gain'); f.createBiquadFilter = () => node('filter'); f.createDelay = () => node('delay');
        f.createBuffer = (c, len) => ({ getChannelData: () => new Float32Array(len) });
        f.liveSources = () => { let n = 0; for (const s of f.sources) if (!s.gone && s.ends > f.t) n++; return n; };
        f.prune = () => { f.sources = f.sources.filter(s => !s.gone && s.ends > f.t - 10); };
        return f;
      })();
      const out = {};
      loadMap('oakhaven'); G.state = 'play'; for (const e of G.ents) if (e.kind === 'enemy') e.hidden = true;
      const c = Engine.cam, boss = hydrate({ kind: 'enemy', type: 'broodmother', x: c.x + 3, y: c.y }); boss.state = 'chase'; G.ents.push(boss);
      SCORE.useContext(f); SCORE.setSeed(7);
      let peak = 0; const dt = 1 / 60;
      for (let i = 0; i < 36000; i++) { f.t += dt; SCORE.plan('combat', 1, 1); SCORE.tick(dt); if (i % 30 === 0) { peak = Math.max(peak, f.liveSources()); f.prune(); } }
      out.boss = { peak, created: f.created, active: SCORE.active, retired: SCORE.retiredCount };
      // title layer for ten minutes, broken-stage flags on
      const saved = Object.assign({}, G.flags); G.flags.greening = true;
      SCORE.dropAll(); let lp = 0, before = f.created;
      for (let i = 0; i < 36000; i++) { f.t += dt; SCORE.plan('title', 1, 1); SCORE.tick(dt); if (i % 30 === 0) { lp = Math.max(lp, f.liveSources()); f.prune(); } }
      out.layer = { peak: lp, created: f.created - before, stage: (SCORE.active.layer || {}).stage };
      // muted: scheduling stops, nothing is created
      SCORE.dropAll();
      for (let i = 0; i < 120; i++) { f.t += dt; SCORE.plan('title', 1, 1); SCORE.tick(dt); }
      const wasMuted = Audio_.muted; if (!wasMuted) Audio_.toggleMute();
      const c0 = f.created;
      for (let i = 0; i < 1800; i++) { f.t += dt; SCORE.plan('title', 1, 1); SCORE.tick(dt); }
      out.mutedCreated = f.created - c0; out.mutedLevel = (SCORE.active.layer || {}).level;
      if (Audio_.muted) Audio_.toggleMute();
      const c1 = f.created;
      for (let i = 0; i < 600; i++) { f.t += dt; SCORE.plan('title', 1, 1); SCORE.tick(dt); }
      out.resumedCreated = f.created - c1;
      for (const k of Object.keys(G.flags)) delete G.flags[k]; Object.assign(G.flags, saved);
      boss.hidden = true; G.ents.splice(G.ents.indexOf(boss), 1); SCORE.useContext(null); G.state = 'play';
      return out;
    });
    console.log('sim oak', JSON.stringify(sim.oak)); console.log('sim woods', JSON.stringify(sim.woods)); console.log('sim boss', JSON.stringify(sim2.boss)); console.log('sim layer', JSON.stringify(sim2.layer));
    for (const k of ['oak', 'woods']) {
      assert.ok(sim[k].peak > 0 && sim[k].peak < 120, `${k}: live sources stay bounded (peak ${sim[k].peak})`);
      assert.ok(sim[k].created < 25000, `${k}: node creation stays bounded (${sim[k].created})`);
      assert.ok(sim[k].retiredPeak <= 6, `${k}: retired instances are reaped`);
    }
    assert.ok(sim.oak.phases.play > 0 && sim.oak.phases.gap > 0 && sim.oak.phases.mp3 > 0, 'Oakhaven cycles play -> gap -> recorded cue: ' + JSON.stringify(sim.oak.phases));
    assert.ok(sim.woods.phases.play > 0 && sim.woods.phases.gap > 0 && !sim.woods.phases.mp3, 'Deep Woods replaces the shared cue: play and gap only: ' + JSON.stringify(sim.woods.phases));
    assert.ok(sim2.boss.peak > 0 && sim2.boss.peak < 120, 'boss: live sources bounded (peak ' + sim2.boss.peak + ')');
    assert.ok(sim2.boss.created < 40000, 'boss: creation bounded (' + sim2.boss.created + ')');
    assert.ok(sim2.layer.peak < 80 && sim2.layer.created < 20000, 'layer bounded'); assert.equal(sim2.layer.stage, 3, 'greening flag -> broken stage');
    assert.equal(sim2.mutedCreated, 0, 'muted: no notes are scheduled'); assert.ok(!sim2.mutedLevel, 'muted: the piece is faded out or released');
    assert.ok(sim2.resumedCreated > 0, 'unmuted: the piece resumes');

    // ---- every piece rendered offline: finite, audible, not clipping, not runaway loud
    const pieces = await ev(async () => {
      const out = [];
      for (const pid of Object.keys(SCORE.PIECES)) out.push(await SCORE.renderOffline(pid, 40, 3));
      return out;
    });
    for (const r of pieces) {
      console.log(`render ${r.pid}: peak ${r.peak.toFixed(3)} rms ${r.rms.toFixed(4)} bars ${r.bars}`);
      assert.equal(r.bad, 0, `${r.pid}: no NaN or runaway samples`);
      assert.ok(r.peak > 0.01, `${r.pid}: audible (peak ${r.peak})`);
      assert.ok(r.peak < 0.95, `${r.pid}: does not clip (peak ${r.peak})`);
      assert.ok(r.rms > 0.001, `${r.pid}: has body (rms ${r.rms})`);
    }
    // two seeds of the same piece differ (long-form variation), the same seed repeats
    const vary = await ev(async () => { const a = await SCORE.renderOffline('oakhaven', 30, 1), b = await SCORE.renderOffline('oakhaven', 30, 2), c = await SCORE.renderOffline('oakhaven', 30, 1); return [a.rms, b.rms, c.rms]; });
    console.log('seed rms', vary);
    assert.ok(Math.abs(vary[0] - vary[1]) / vary[0] > 0.005, 'a new seed plays a different night'); assert.ok(Math.abs(vary[0] - vary[2]) / vary[0] < 0.01, 'the same seed repeats (the noise bed differs by chance only)');

    // ---- one AudioContext, ever
    const ctxCount = await ev(() => window.__ctxCount);
    assert.equal(ctxCount, 1, 'exactly one AudioContext was created');

    assert.deepEqual(errors, [], 'no page errors: ' + errors.join(' | '));
    console.log('PASS score');
  } finally { await browser.close(); }
})().catch(e => { console.error('FAIL score:', e.stack || e); process.exit(1); });
