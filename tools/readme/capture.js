#!/usr/bin/env node
// Renders the README's pictures from the running game: stills (JPEG) and short loops (GIF) into screenshots/readme/.
//   python3 -m http.server 8000            # from the repository root, in another terminal
//   PREVIEW_URL=http://127.0.0.1:8000 PLAYWRIGHT_MODULE=/path/to/playwright node tools/readme/capture.js [name ...]
// Needs Playwright's Chromium and ffmpeg (for the GIFs). With names, only those shots are made.
// Every scene is staged with the game's own functions on a fresh disposable game; nothing is saved. GIF frames are stepped
// with window.advanceTime, so they are smooth whatever the machine's speed. Look at every picture after a run.
'use strict';
const fs = require('fs');
const path = require('path');
const { execFileSync } = require('child_process');
const { chromium, devices } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');

const ROOT = path.join(__dirname, '..', '..');
const OUT = process.env.OUT || path.join(ROOT, 'screenshots', 'readme');
const URL0 = (process.env.PREVIEW_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');
const ONLY = new Set(process.argv.slice(2));
const want = (n) => !ONLY.size || ONLY.has(n);

async function ready(page) {
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
}
async function newGame(page, how) {
  const press = (loc) => (how === 'tap' ? loc.tap() : loc.dispatchEvent('click'));
  const hit = (sel) => press(page.locator(sel).first());
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next');
  await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) {
    const c = page.locator('#create-panel .list button').first();
    if (await c.count()) await press(c); else await press(page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first());
  }
  await hit('#c-go'); await hit('#btn-intro-skip');
  await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => {
    window.R = {
      clean() {
        for (const s of ['#msgs']) { const n = document.querySelector(s); if (n) n.innerHTML = ''; }
        const h = document.querySelector('#hint'); if (h) h.textContent = '';
        const l = document.querySelector('#lockhint'); if (l) l.classList.remove('on');
        G._lockHint = false; G.playStart = G.time - 999;
      },
      // a scene: map, place, heading, time of day; enemies calm, the player unhurt, no area card, no weather
      go(id, x, y, dir, tod) {
        if (typeof GFX !== 'undefined') GFX.illustratedScreens = false;
        closeModal(); hide('#event'); loadMap(id, { x, y, dir }); G.state = 'play'; G.tod = tod; G.fadeT = 0;
        if (typeof UPG !== 'undefined') { UPG.weather = 'clear'; UPG.weatherFx = { sight: 1, hear: 1 }; UPG.tutorial = false; }
        G.player.hp = G.player.hpMax = 999; G.noise = 1; G.keys = {}; G.vel.x = G.vel.y = 0;
        for (const e of G.ents) if (e.kind === 'enemy' && e.type !== 'wearer_coda') { e.state = 'idle'; }
        Engine.cam.pitch = 0; R.clean();
      },
      // freeze the page's own loop; frames are stepped with advanceTime from here on
      freeze() { if (!R.frozen) { R.frozen = true; window.requestAnimationFrame = () => 0; } },
      step(ms) { window.advanceTime(ms); controlsTick(); },
    };
  });
}
async function still(page, name, quality) {
  await page.evaluate(() => { R.clean(); if (R.frozen) for (let k = 0; k < 6; k++) R.step(1000 / 60); R.clean(); });
  await page.waitForTimeout(350);
  await page.evaluate(() => { if (R.frozen) R.step(1000 / 60); R.clean(); });
  await page.screenshot({ path: path.join(OUT, name + '.jpg'), type: 'jpeg', quality: quality || 86 });
  console.log('still', name);
}
// frames: count; each(i) runs in the page before frame i is stepped and shot
async function gif(page, name, { frames, fps, width, each, clip, colors }) {
  const dir = path.join(OUT, '.frames-' + name); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
  await page.evaluate(() => R.freeze()); await page.waitForTimeout(120);
  for (let i = 0; i < frames; i++) {
    await page.evaluate(([src, i, fps]) => { (0, eval)('(' + src + ')')(i); R.step(1000 / fps); R.clean(); }, [each.toString(), i, fps]);
    await page.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png'), clip });
  }
  const outFile = path.join(OUT, name + '.gif');
  const vf = `fps=${fps},scale=${width}:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=${colors || 128}:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle`;
  execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', String(fps), '-i', path.join(dir, '%04d.png'), '-vf', vf, '-loop', '0', outFile]);
  fs.rmSync(dir, { recursive: true, force: true });
  console.log('gif', name, (fs.statSync(outFile).size / 1e6).toFixed(2) + ' MB');
}

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const errors = [];
  try {
    // ---------------------------------------------------------------- desktop, 1280 x 800 (the game's own 16:10)
    const ctx = await browser.newContext({ viewport: { width: 1280, height: 800 } });
    const page = await ctx.newPage(); page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL0 + '/'); await ready(page);
    if (want('title')) { await page.waitForTimeout(1200); await page.screenshot({ path: path.join(OUT, 'title.jpg'), type: 'jpeg', quality: 88 }); console.log('still title'); }
    await newGame(page, 'dom');

    // ---- stills: places
    if (want('oakhaven-dusk')) { await page.evaluate(() => R.go('oakhaven', 30, 20, Math.PI, 0.72)); await still(page, 'oakhaven-dusk'); }
    if (want('spire')) { await page.evaluate(() => R.go('whispergrove', 24, 24, 1.5 * Math.PI, 0.66)); await still(page, 'spire'); }
    if (want('harbour')) { await page.evaluate(() => R.go('cantabile_harbour', 60, 40, Math.PI, 0.7)); await still(page, 'harbour'); }
    // ---- stills: the interface
    if (want('inventory')) { await page.evaluate(() => { R.go('oakhaven', 30, 20, Math.PI, 0.72); G.state = 'panel'; renderInventory(); }); await still(page, 'inventory'); await page.evaluate(() => closeModal()); }
    if (want('logbook')) { await page.evaluate(() => { R.go('oakhaven', 30, 20, Math.PI, 0.72); G.state = 'panel'; renderLog(); }); await still(page, 'logbook'); await page.evaluate(() => closeModal()); }
    if (want('dialogue')) { await page.evaluate(() => { R.go('tavern', 4.5, 6.2, -Math.PI / 2, 0.72); talk(G.ents.find((o) => o.id === 'hetty')); }); await still(page, 'dialogue'); await page.evaluate(() => closeModal()); }
    // the Cloister porch (Book One ch. 20): the first card of Voice at the Door
    if (want('porch')) {
      await page.evaluate(() => { R.go('cloister', 10, 16, -Math.PI / 2, 0.85); G.flags.aegis_done = true; G.flags.wearer_porch = false; porchVoice(); });
      await still(page, 'porch'); await page.evaluate(() => { hide('#event'); G.state = 'play'; for (const k of ['wearer_porch', 'porch_survived', 'porch_answered']) delete G.flags[k]; });
    }
    // the painted card each area shows as you arrive, four of them tiled. The paintings are decoded first (the game never
    // waits for one and uses a drawn stand-in instead), and SCREENS.hold keeps each card up for its picture.
    if (want('area-cards')) {
      const ids = ['clearing', 'whispergrove', 'flume_landing', 'greenroot'];
      const tmp = path.join(OUT, '.cards'); fs.rmSync(tmp, { recursive: true, force: true }); fs.mkdirSync(tmp, { recursive: true });
      for (let k = 0; k < ids.length; k++) {
        await page.evaluate(async (id) => {
          const fam = SCREENS.familyFor(id);
          if (typeof PAINTED !== 'undefined' && PAINTED.has('area', fam)) await PAINTED.load('area', fam);
          R.go(id, G.maps[id].spawn.x, G.maps[id].spawn.y, G.maps[id].spawn.dir || 0, 0.72);
          if (typeof GFX !== 'undefined') GFX.illustratedScreens = true;
          SCREENS.hold = true; SCREENS.showArea(id); if (R.frozen) R.step(1000 / 60);
        }, ids[k]);
        await page.waitForTimeout(900);
        await page.screenshot({ path: path.join(tmp, k + '.png') });
        await page.evaluate(() => { SCREENS.hold = false; SCREENS.dismiss(); if (typeof GFX !== 'undefined') GFX.illustratedScreens = false; });
      }
      execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-i', path.join(tmp, '%d.png'), '-vf', 'scale=640:400:flags=lanczos,tile=2x2', '-frames:v', '1', '-q:v', '3', path.join(OUT, 'area-cards.jpg')]);
      fs.rmSync(tmp, { recursive: true, force: true }); console.log('still area-cards');
    }

    // ---- loops
    // Oakhaven's square at sunset: walking towards the low sun, the chimneys smoking
    if (want('oakhaven-walk')) {
      await page.evaluate(() => R.go('oakhaven', 30, 21.5, 0.9 * Math.PI, 0.715));
      await gif(page, 'oakhaven-walk', { frames: 48, fps: 12, width: 560, colors: 96, each: (i) => { G.keys = { w: true }; Engine.cam.dir = 0.9 * Math.PI + i * 0.005; } });
    }
    // Whisper-Grove: a slow turn past the fountain to the Dawning Spire
    if (want('spire-pan')) {
      await page.evaluate(() => R.go('whispergrove', 24, 24, 1.28 * Math.PI, 0.66));
      await gif(page, 'spire-pan', { frames: 48, fps: 12, width: 560, colors: 96, each: (i) => { G.keys = {}; Engine.cam.dir = 1.28 * Math.PI + i * 0.0165; } });
    }
    // a Carillon Legionnaire, met with the sword: every blow makes it recoil
    if (want('fight')) {
      await page.evaluate(() => {
        R.go('clearing', 20.5, 26, -Math.PI / 2, 0.7);
        const c = Engine.cam; const e = hydrate({ kind: 'enemy', type: 'legionnaire', x: c.x + 0.3, y: c.y - 4.4 }); e.state = 'chase'; e.hp = 26; G.ents.push(e); window.__foe = e; window.__swings = ['slash right', 'slash left', 'chop down', 'slash right', 'thrust'];
        window.advanceTime(1800);   // past the spawn entrance (js/telegraphs.js)
      });
      await gif(page, 'fight', { frames: 60, fps: 12, width: 560, each: (i) => {
        G.keys = {}; const e = window.__foe, c = Engine.cam;
        if (e && !e.dead) { c.dir = Math.atan2(e.y - c.y, e.x - c.x); if (Math.hypot(e.x - c.x, e.y - c.y) < 1.6 && i % 7 === 0 && window.__swings.length) attack(window.__swings.shift()); }
      } });
    }
    // a Song: the falling fifth stops a pack in its tracks
    if (want('song')) {
      await page.evaluate(() => {
        R.go('clearing', 20.5, 26, -Math.PI / 2, 0.78);
        G.player.voice = G.player.voiceMax = 99; if (!G.player.songs.includes('fifth')) G.player.songs.push('fifth');
        const c = Engine.cam; window.__pack = [];
        // hounds are a jitter in the air, heat-haze with teeth: the dotted shapes coming in are the pack
        for (const [dx, dy] of [[-1.6, -7], [0, -8], [1.7, -7.4]]) { const e = hydrate({ kind: 'enemy', type: 'hound', x: c.x + dx, y: c.y + dy }); e.state = 'chase'; G.ents.push(e); window.__pack.push(e); }
      });
      await gif(page, 'song', { frames: 46, fps: 12, width: 560, each: (i) => { G.keys = {}; Engine.cam.dir = -Math.PI / 2; if (i === 12) castSong('fifth'); } });
    }
    // the ring of lamps (Book One ch. 23): Lyra sings past the last lamp, and it comes in on the harmony
    if (want('ring')) {
      await page.evaluate(() => {
        Object.assign(G.flags, { part4: true, aegis_follow: true, sable_with: true, lyra_voice: true, kaelen_told_now: true, lyra_dw_met: true });
        R.go('deepwoods', 27.5, 38, -Math.PI / 2, 0.08);
        NPCS.lyra_dw.quest(G).choices[0].f(G);
        R.go('deepwoods', RING.cx, RING.cy, -Math.PI / 2, 0.08);
        const t = G.map.triggers.find((o) => o.id === 'ring'); t.inside = false; checkTriggers();
        for (let k = 0; k < 40 * 30; k++) codaTick(1 / 30);
        Engine.cam.x = RING.cx; Engine.cam.y = RING.cy; Engine.cam.dir = -Math.PI / 2;
      });
      await still(page, 'ring');
    }
    await ctx.close();

    // ---------------------------------------------------------------- a phone, held sideways, opened with the ?touch=1 link
    if (want('phone')) {
      const W = 844, H = 390;   // an iPhone 13 held sideways, in CSS pixels
      const shell = `<!doctype html><meta charset="utf-8"><style>
        html,body{margin:0;height:100%;background:radial-gradient(ellipse at center,#2a1c12 0%,#0d0907 75%);display:grid;place-items:center;overflow:hidden}
        .phone{position:relative;padding:14px 30px;border-radius:52px;background:#0b0b0c;box-shadow:0 0 0 2px #3b3530,0 0 0 7px #17130f,0 24px 60px rgba(0,0,0,.7)}
        .phone:before{content:"";position:absolute;left:12px;top:50%;width:8px;height:8px;margin-top:-4px;border-radius:50%;background:#1f2a33}
        iframe{display:block;width:${W}px;height:${H}px;border:0;border-radius:30px;background:#000}
      </style><div class="phone"><iframe src="./?touch=1" allow="autoplay"></iframe></div>`;
      const pctx = await browser.newContext({ viewport: { width: W + 200, height: H + 150 }, hasTouch: true, deviceScaleFactor: 2 });
      const pp = await pctx.newPage(); pp.on('pageerror', (e) => errors.push(e.message));
      await pp.route(URL0 + '/__phone__.html', (r) => r.fulfill({ contentType: 'text/html', body: shell }));
      await pp.goto(URL0 + '/__phone__.html');
      const fr = await (await pp.waitForSelector('iframe')).contentFrame();
      await ready(fr);
      {
        await newGame(fr, 'dom');
        await fr.evaluate(() => { R.go('whispergrove', 24, 31, -Math.PI / 2, 0.66); if (!G.touchMode) throw new Error('the ?touch=1 link did not start touch mode'); });
        // the thumb stick, pushed forward and a little left; the right thumb turns the view now and then
        const each = (i) => {
          G.keys = {}; G.touch.fy = 0.9; G.touch.fx = Math.sin(i / 9) * 0.25;
          const st = document.querySelector('#t-stick'); st.style.left = '18%'; st.style.top = '68%'; st.classList.add('on');
          const kn = document.querySelector('#t-knob').style; kn.left = (50 + G.touch.fx * 50) + '%'; kn.top = (50 - G.touch.fy * 50) + '%';
          Engine.cam.dir = -Math.PI / 2 + Math.sin(i / 14) * 0.18;
        };
        const dir = path.join(OUT, '.frames-phone'); fs.rmSync(dir, { recursive: true, force: true }); fs.mkdirSync(dir, { recursive: true });
        await fr.evaluate(() => R.freeze()); await pp.waitForTimeout(120);
        for (let i = 0; i < 48; i++) {
          await fr.evaluate(([src, i]) => { (0, eval)('(' + src + ')')(i); R.step(1000 / 12); R.clean(); }, [each.toString(), i]);
          await pp.screenshot({ path: path.join(dir, String(i).padStart(4, '0') + '.png') });
          if (i === 20) await pp.screenshot({ path: path.join(OUT, 'phone.jpg'), type: 'jpeg', quality: 84 });
        }
        const vf = 'fps=12,scale=640:-1:flags=lanczos,split[a][b];[a]palettegen=max_colors=128:stats_mode=diff[p];[b][p]paletteuse=dither=bayer:bayer_scale=4:diff_mode=rectangle';
        execFileSync('ffmpeg', ['-y', '-loglevel', 'error', '-framerate', '12', '-i', path.join(dir, '%04d.png'), '-vf', vf, '-loop', '0', path.join(OUT, 'phone.gif')]);
        fs.rmSync(dir, { recursive: true, force: true });
        console.log('gif phone', (fs.statSync(path.join(OUT, 'phone.gif')).size / 1e6).toFixed(2) + ' MB'); console.log('still phone');
      }
      await pctx.close();
    }

    // ---------------------------------------------------------------- the README's buttons and QR card, in the game's own fonts
    if (want('buttons')) {
      const qr = fs.existsSync(path.join(OUT, 'qr-phone.png')) ? 'data:image/png;base64,' + fs.readFileSync(path.join(OUT, 'qr-phone.png')).toString('base64') : '';
      const html = `<!doctype html><meta charset="utf-8"><style>
        @font-face{font-family:Cinzel;font-weight:700;src:url(fonts/cinzel-latin-700-normal.woff2)}
        @font-face{font-family:Alegreya;font-style:italic;src:url(fonts/alegreya-latin-400-italic.woff2)}
        html,body{margin:0;background:transparent}
        body{padding:24px;display:flex;flex-direction:column;align-items:flex-start;gap:28px}
        .btn{display:inline-flex;align-items:center;gap:18px;padding:15px 32px 15px 20px;border-radius:12px;border:2px solid #d9a441;
          background:linear-gradient(180deg,#4d341b 0%,#2b1c10 55%,#1a110a 100%);
          box-shadow:inset 0 0 0 3px #1a110a,inset 0 0 0 4px #7a5a26}
        .icon{flex:none;width:50px;height:50px;border-radius:50%;display:grid;place-items:center;
          background:radial-gradient(circle at 38% 32%,#f6d27a,#d9a441 55%,#8a6526);box-shadow:inset 0 -3px 5px rgba(0,0,0,.35),0 0 0 2px #1a110a}
        .icon svg{width:26px;height:26px;display:block}
        .t{font-family:Cinzel;font-weight:700;font-size:27px;letter-spacing:.07em;color:#f2c95f;text-shadow:0 2px 0 #000,0 0 12px rgba(217,164,65,.25);white-space:nowrap}
        .s{font-family:Alegreya;font-style:italic;font-size:17px;color:#e8d9b5;opacity:.88;margin-top:1px;white-space:nowrap}
        .card{display:inline-flex;flex-direction:column;align-items:center;gap:10px;padding:16px 16px 12px;border-radius:12px;border:2px solid #d9a441;
          background:linear-gradient(180deg,#2b1c10,#1a110a);box-shadow:inset 0 0 0 3px #1a110a,inset 0 0 0 4px #7a5a26}
        .card img{width:236px;height:236px;image-rendering:pixelated;border-radius:4px;display:block}
        .card .t{font-size:16px}
      </style>
      <div class="btn" id="play"><div class="icon"><svg viewBox="0 0 24 24"><path d="M8.5 5.5l11 6.5-11 6.5z" fill="#1a110a"/></svg></div>
        <div><div class="t">PLAY IN YOUR BROWSER</div><div class="s">Free · nothing to install · keeps working offline</div></div></div>
      <div class="btn" id="phone"><div class="icon"><svg viewBox="0 0 24 24"><rect x="2.5" y="6.5" width="19" height="11" rx="2.6" fill="none" stroke="#1a110a" stroke-width="2.2"/><circle cx="5.6" cy="12" r="1" fill="#1a110a"/></svg></div>
        <div><div class="t">PLAY ON YOUR PHONE</div><div class="s">Touch controls from the first frame · hold it sideways</div></div></div>
      ${qr ? `<div class="card" id="qr"><img src="${qr}" alt=""><div class="t">SCAN TO PLAY ON YOUR PHONE</div></div>` : ''}`;
      const bctx = await browser.newContext({ viewport: { width: 900, height: 800 }, deviceScaleFactor: 2 });
      const bp = await bctx.newPage();
      await bp.route(URL0 + '/__buttons__.html', (r) => r.fulfill({ contentType: 'text/html', body: html }));
      await bp.goto(URL0 + '/__buttons__.html'); await bp.evaluate(() => document.fonts.ready);
      const fontsOk = await bp.evaluate(() => document.fonts.check('700 27px Cinzel') && document.fonts.check('italic 17px Alegreya'));
      if (!fontsOk) throw new Error('the button fonts did not load');
      for (const [id, file] of [['play', 'btn-play.png'], ['phone', 'btn-phone.png'], ['qr', 'qr-card.png']]) {
        const el = await bp.$('#' + id); if (!el) continue;
        await el.screenshot({ path: path.join(OUT, file), omitBackground: true }); console.log('button', file);
      }
      await bctx.close();
    }
  } finally {
    await browser.close();
  }
  if (errors.length) { console.log('page errors:', errors.slice(0, 5)); process.exitCode = 1; }
})();
