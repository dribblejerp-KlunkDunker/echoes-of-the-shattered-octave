// PREVIEW_URL=http://127.0.0.1:8838 PLAYWRIGHT_MODULE=/opt/node-tools/node_modules/playwright node test/touches75.test.js
// Small canon touches III (js/touches75.js; R9 #25 c, d, e, f; Book One): the Pure Note as a lid (the town's wet cloth,
// wool and crying children, and shorter rests in Oakhaven under it); every mending borrows (a root-hair in a Cantor's
// palm after a large tending note, the blood slightly green); the palm held flat, "a hand's width of voice", before the
// ward-sign; the Cantor's clay jar, the tending note hummed into a body.
'use strict';
const fs = require('fs');
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');
const { hash, norm } = require(path.join(ROOT, 'tools', 'i18n', 'lib'));
const MS = src('story/Books/Book One - The Silenced Province/Book One - The Silenced Province (full manuscript).md');

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => { if (m.type() === 'warning' && /touches75/.test(m.text())) errors.push('console: ' + m.text()); });
    await page.goto(process.env.PREVIEW_URL || 'http://127.0.0.1:8838');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && typeof TOUCHES75 !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'));
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
      if (typeof NIGHT13 !== 'undefined') NIGHT13.set.terrors = false;   // no random night visits in the rest checks
      window.__base = JSON.parse(JSON.stringify(snapshotGame()));
      window.T = {
        reset() { restoreGame(JSON.parse(JSON.stringify(window.__base))); G.state = 'play'; G.keys = {}; window.__ev.length = 0; window.__msgs.length = 0; window.__vo.length = 0; },
        heard(re) { return window.__msgs.some((t) => re.test(t)); },
        count(re) { return window.__msgs.filter((t) => re.test(t)).length; },
        go(id, x, y, dir) { loadMap(id, x == null ? undefined : { x, y, dir: dir || 0 }); G.state = 'play'; G.keys = {}; },
        step(n, dt) { for (let i = 0; i < n; i++) { G.state = 'play'; G.keys = {}; update(dt || 0.033); } },
        quiet() { for (const e of G.ents) if (e.kind === 'enemy') { e.hidden = true; e.dead = true; } },
        cantor() { const p = G.player; p.cls = CLASSES.find((c) => c.id === 'cantor'); if (!p.songs.includes('tending')) p.songs.push('tending'); p.voiceMax = 40; p.voice = 40; p.hpMax = 20; },
        hoursOf(fn) { const t0 = G.day * 24 + G.tod * 24; fn(); return Math.round((G.day * 24 + G.tod * 24 - t0) * 100) / 100; },
      };
    });

    // ---- c. the Pure Note as a lid
    let r = await page.evaluate(() => {
      const out = {};
      const WET = /plaster(ed)? their windows with wet cloth and stuff(ed)? wool in their ears, and children are crying in the lanes for no reason they can name/;
      const NOSLEEP = /nobody is sleeping/;
      T.reset(); G.day = 4; T.go('oakhaven'); T.step(3); out.before = !T.heard(WET) && !T.heard(NOSLEEP);
      T.reset(); G.flags.church_come = true; G.day = 6; G.tod = 0.4; T.go('oakhaven');
      out.second = T.heard(NOSLEEP) && !T.heard(WET);
      T.reset(); G.flags.church_come = true; G.day = 7; G.tod = 0.4; T.go('oakhaven');
      out.third = T.heard(WET);
      T.go('tavern'); T.go('oakhaven'); out.oncePerDay = T.count(WET) === 1;
      out.notSaved = typeof G.flags.p75_lid === 'number';   // only the day the note began is kept
      T.reset(); G.flags.church_come = true; G.flags.rite_started = true; G.day = 7; T.go('oakhaven'); out.afterRite = !T.heard(WET);
      // rests: a lamp rest in the Boar is eight hours; under the Pure Note, shorter
      const rest = (setup, map) => { T.reset(); setup(); T.go(map); T.quiet(); G.tod = 0.9; G.player.hp = 1; window.__msgs.length = 0; const h = T.hoursOf(() => doRest('lamp')); return { h, hp: G.player.hp, lid: T.heard(/It is not a loud sound\. It is worse than loud\. It is a lid\./) }; };
      out.plain = rest(() => {}, 'tavern');
      out.under = rest(() => { G.flags.church_come = true; G.day = 6; }, 'tavern');
      out.away = rest(() => { G.flags.church_come = true; G.day = 6; }, 'clearing');
      out.rite = rest(() => { G.flags.church_come = true; G.flags.rite_started = true; G.day = 6; }, 'tavern');
      T.reset(); G.flags.church_come = true; G.day = 6; T.go('lyra_house'); T.quiet(); G.tod = 0.2; const hs = T.hoursOf(() => doRest('self')); out.self = hs;
      // the dark's deep, snoring sleep is not told under the lid
      const dark = (() => { T.reset(); G.flags.church_come = true; G.day = 6; T.go('tavern'); T.quiet(); G.tod = 0.9; window.__msgs.length = 0; const h = T.hoursOf(() => doRest('dark')); return h === 4 && !T.heard(/snore/) && T.heard(/It is a lid\./); })();
      out.dark = dark;
      // your own bed on Cooper's Row (js/upgrades.js) is shortened the same way
      T.reset(); G.flags.church_come = true; G.day = 6;
      if (!G.maps.cooper_house && typeof buildCoopersHouse === 'function') G.maps.cooper_house = buildCoopersHouse();
      T.go('cooper_house'); T.quiet(); G.tod = 0.9; G.player.hp = 1; window.__msgs.length = 0;
      const bed = G.ents.find((e) => e && e.use === 'house_bed');
      out.bed = !!bed && T.hoursOf(() => useDeco(bed)) === 4 && G.player.hp < G.player.hpMax && T.heard(/It is a lid\./) && !T.heard(/You sleep eight hours/);
      // the day the note began is recorded by the tick wherever you are, so a first visit later still counts from it
      T.reset(); G.flags.church_come = true; G.day = 3; T.go('clearing'); T.quiet(); T.step(2); const lid = G.flags.p75_lid;
      G.day = 5; T.go('oakhaven'); out.firstSeen = lid === 3 && T.heard(/^Over the rooftops the Pure Note goes on\. People have begun/);
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.before && r.afterRite, 'c. before the Church comes, and once the Rite has begun, the town is as it was (' + (r.err || '') + ')');
    check(r.second, 'c. on the second day of the Pure Note, nobody is sleeping');
    check(r.third && r.oncePerDay, 'c. by the third, wet cloth on the windows, wool in ears, children crying in the lanes, said once a day');
    check(r.notSaved, 'c. the day the note began is kept in one flag');
    check(r.plain && r.plain.h === 8 && !r.plain.lid, 'c. a lamp rest in the Boar is still eight hours before the Church comes (' + (r.plain && r.plain.h) + ')');
    check(r.under && r.under.h === 4 && r.under.lid && r.under.hp < r.plain.hp, 'c. under the Pure Note it is four, gives back less, and "It was a lid." (' + (r.under && r.under.h) + 'h, hp ' + (r.under && r.under.hp) + ' vs ' + (r.plain && r.plain.hp) + ')');
    check(r.dark && r.bed, 'c. the dark\'s snoring sleep is not told under the lid; your own bed on Cooper\'s Row is a half rest too (' + [r.dark, r.bed].join(', ') + ')');
    check(r.firstSeen, 'c. the note\'s days count from the day it was first held, even if you were outside the Hedge');
    check(r.away && r.away.h === 8 && r.rite && r.rite.h === 8 && r.self === 2, 'c. outside the Hedge, or after the Rite, a full rest; a half rest in a house is two hours (' + [r.away && r.away.h, r.rite && r.rite.h, r.self].join(', ') + ')');

    // ---- d. every mending borrows
    r = await page.evaluate(() => {
      const out = {};
      const HAIR = /grows a single root-hair\. White\. A thumbnail long\..*the blood is very slightly green\./;
      const sing = () => { G.song.t = 0; G.attack.t = 0; castSong('tending'); };
      T.reset(); T.cantor(); T.go('clearing'); T.quiet(); G.player.hp = 3; window.__msgs.length = 0; sing();
      out.healed = G.player.hp === 17;
      out.hair = T.heard(HAIR) && T.heard(/^Every mending borrows\.$/);
      G.player.hp = 3; window.__msgs.length = 0; sing(); out.oncePerDay = !T.heard(HAIR) && G.player.hp === 17;
      G.day += 1; G.player.hp = 3; window.__msgs.length = 0; sing(); out.nextDay = T.heard(HAIR);
      G.day += 1; G.player.hp = 15; window.__msgs.length = 0; sing(); out.small = !T.heard(HAIR) && G.player.hp === 20;   // five mended: not a large note
      T.reset(); G.player.songs.push('tending'); G.player.voice = G.player.voiceMax = 40; G.player.hpMax = 20; T.go('clearing'); T.quiet(); G.player.hp = 3; window.__msgs.length = 0; sing();
      out.notCantor = G.player.hp === 17 && !T.heard(HAIR);
      out.noVoice = !window.__vo.length;
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.healed && r.hair, 'd. after a large tending note a Cantor finds a root-hair in the palm, pulls it, and the blood is very slightly green: "Every mending borrows." (' + (r.err || '') + ')');
    check(r.oncePerDay && r.nextDay, 'd. at most once a game day');
    check(r.small && r.notCantor && r.noVoice, 'd. not after a small mending, not for another calling; a message, not a voice');

    // ---- e. the palm held flat
    r = await page.evaluate(() => {
      const out = {};
      const PALM = /lifts a hand toward you, palm flat, the way everyone in Oakhaven measures sound now\. A hand's width of voice, no more\./;
      T.reset(); T.go('oakhaven', 23.5, 16.5, 0); G.tod = 0.5; T.quiet(); crimeState().bounty = 0;
      const c = Engine.cam; const w = { kind: 'npc', id: 'n28_hummer', sprite: 'townswoman', x: c.x + 3, y: c.y, facing: Math.PI, solid: false, radius: 0.3 };
      w._h = true; w.homeX = w.x; w.homeY = w.y; w.wanderT = 1e9; w.dir = Math.PI; G.ents.push(w);
      NARROW28.reset(); T.step(30); window.__msgs.length = 0;
      G.noise = 3.5; T.step(2); out.quiet = !T.heard(PALM);
      G.noise = 5.8; T.step(1); out.palm = T.heard(/^A woman near you lifts a hand toward you, palm flat/) && !T.heard(/ward-sign/);
      G.noise = 5.8; T.step(5); out.once = T.count(PALM) === 1;
      G.noise = 8; T.step(1); out.ward = T.heard(/ward-sign/) && T.count(PALM) === 1;
      G.noise = 1; T.step(Math.ceil(TOUCHES75.PALM_EVERY / 0.033) + 5); window.__msgs.length = 0;
      G.noise = 5.8; T.step(1); out.again = T.heard(PALM);
      G.noise = 1; T.step(Math.ceil(TOUCHES75.PALM_EVERY / 0.033) + 5); window.__msgs.length = 0;
      crimeState().bounty = 5; crimeState().resisting = true; G.noise = 5.8; T.step(1); out.custody = !T.heard(PALM); crimeState().resisting = false; crimeState().bounty = 0;
      G.ents.splice(G.ents.indexOf(w), 1); G.noise = 1; T.step(Math.ceil(TOUCHES75.PALM_EVERY / 0.033) + 5); window.__msgs.length = 0;
      for (const e of G.ents) if (e.kind === 'npc') e.hidden = true; G.noise = 5.8; T.step(1); out.nobody = !T.heard(PALM);
      T.go('tavern'); T.quiet(); G.noise = 1; T.step(Math.ceil(TOUCHES75.PALM_EVERY / 0.033) + 5); window.__msgs.length = 0; G.noise = 5.8; T.step(1); out.boar = !T.heard(PALM);
      crimeState().bounty = 0; G.noise = 1;
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.quiet && r.palm, 'e. inside the Hedge, loud but under the breach, a townsperson who sees you lifts a flat palm: "a hand\'s width of voice, no more" (' + (r.err || '') + ')');
    check(r.once && r.ward, 'e. once, and the ward-sign still comes at the breach');
    check(r.custody, 'e. not at someone resisting the watch (narrow28\'s own guard)');
    check(r.again && r.nobody && r.boar, 'e. again after a minute; not with nobody watching, not in the Boar (' + [r.again, r.nobody, r.boar].join(',') + ')');

    // ---- f. the Cantor's clay jar
    r = await page.evaluate(() => {
      const out = {};
      T.reset(); T.go('clearing'); out.notOthers = !G.player.inv.some((s) => s.id === 'p75_jar');
      T.reset(); T.cantor(); T.go('clearing'); T.quiet();
      const slot = () => G.player.inv.find((s) => s.id === 'p75_jar');
      out.given = !!slot() && ITEMS.p75_jar.key === true && ITEMS.p75_jar.use === 'p75_jar' && /go into a body instead of into the air/.test(ITEMS.p75_jar.desc);
      T.go('oakhaven'); T.go('clearing'); out.onlyOnce = G.player.inv.filter((s) => s.id === 'p75_jar').length === 1;
      // the jar against the sung note: the same voice, less noise, more mended
      const once = (fn) => { G.song.t = 0; G.attack.t = 0; G.noise = 2; G.player.hp = 0.5; G.player.voice = 40; window.__msgs.length = 0; fn(); return { hp: Math.round((G.player.hp - 0.5) * 10) / 10, voice: 40 - G.player.voice, noise: Math.round((G.noise - 2) * 100) / 100 }; };
      out.sung = once(() => castSong('tending'));
      out.jar = once(() => useItem(slot()));
      out.jarWords = T.heard(/^You press the clay jar to your own throat and hum the tending note into it\. Hummed into the open room, the tending note would have been a sound\. Hummed into the jar, it is a warmth, a pressure, a hand laid flat where no hand can reach\.$/) && !T.heard(/You sing the tending note/);
      out.songNoise = SONGS.tending.noise === 1.8;
      // not while hunted
      const h = hydrate({ kind: 'enemy', type: 'hound', x: Engine.cam.x + 3, y: Engine.cam.y, transient: true }); h.state = 'chase'; G.ents.push(h);
      const hu = once(() => useItem(slot()));
      out.hunted = hu.hp === 0 && hu.voice === 0 && T.heard(/^Not with something hunting you\./);
      G.ents.splice(G.ents.indexOf(h), 1);
      // a save keeps it; an old Cantor save without it is given one
      const snap = JSON.parse(JSON.stringify(snapshotGame()));
      restoreGame(snap); G.state = 'play'; out.saved = !!slot();
      delete snap.flags.p75_jar; snap.player.inv = snap.player.inv.filter((s) => s.id !== 'p75_jar');
      restoreGame(snap); G.state = 'play'; out.old = !!slot() && G.flags.p75_jar === 1;
      // straight after a song: not yet
      G.song.t = 0.5; const busy = (() => { const v = G.player.voice; window.__msgs.length = 0; useItem(slot()); return G.player.voice === v && T.heard(/^Not yet\. The jar wants a still body/); })(); G.song.t = 0; out.busy = busy;
      // no tending note: nothing
      G.player.songs = G.player.songs.filter((s) => s !== 'tending'); const nn = once(() => useItem(slot())); out.noNote = nn.voice === 0 && T.heard(/^You have not the tending note/);
      return out;
    }).catch((e) => ({ err: String(e) }));
    check(r.notOthers && r.given && r.onlyOnce, 'f. a Cantor carries the clay jar (given once); no other calling does (' + (r.err || '') + ')');
    check(r.sung && r.jar && r.jar.voice === r.sung.voice && r.jar.noise < r.sung.noise && r.jar.hp > r.sung.hp, 'f. humming into the jar costs the same voice as singing, is quieter, and mends more (' + JSON.stringify([r.sung, r.jar]) + ')');
    check(r.jarWords && r.songNoise, 'f. in the book\'s words ("a hand laid flat where no hand can reach"); the sung note is unchanged');
    check(r.hunted && r.noNote && r.busy, 'f. not while something is hunting you, not straight after another song, and not without the tending note');
    check(r.saved && r.old, 'f. kept in a save; an old Cantor save is given one');

    // ---- the book's words (every quoted passage is in the manuscript)
    const flat = MS.replace(/\*/g, '');
    for (const q of ['By the second day nobody was sleeping', 'plaster their windows with wet cloth and stuff wool in their ears, and children were crying in the lanes for no reason they could name', 'It was not a loud sound. It was worse than loud. It was a lid.',
      'where the life-line crossed the heart-line, grew a single root-hair. White. A thumbnail long.', 'It came with a small wet tug, like a hair, and a bead of blood welled up after it, and the blood was very slightly green.', 'Every mending borrows.',
      'palm flat, the way everyone in Oakhaven measured sound now (a hand\'s width of voice, no more)',
      'for when you wanted a sound to go into a body instead of into the air. The jar caught the note and gave it to the skin. Hummed into the open room, the tending note would have been a sound. Hummed into the jar, it was a warmth, a pressure, a hand laid flat where no hand could reach.']) check(flat.includes(q), 'the manuscript has: "' + q.slice(0, 50) + '…"');

    // ---- French
    const fr = JSON.parse(src('locales/story/fr.json'));
    const tsv = src('tools/i18n/p75-touches.tsv').split('\n').filter((l) => l.trim() && !l.startsWith('#')).map((l) => l.split('\t'));
    const pairs = new Map(tsv.map((x) => [x[0], x[1]]));
    const texts = await page.evaluate(() => TOUCHES75.TEXTS.slice());
    const noFr = texts.filter((t) => !pairs.has(t) || !(fr.s[hash(norm(t))] || fr.p.some((p) => p[0] === norm(t))));
    check(texts.length >= 14 && noFr.length === 0 && tsv.every((x) => x.length === 2), 'every new string has a French pair in p75-touches.tsv and fr.json (' + noFr.length + ' missing' + (noFr.length ? ': ' + noFr[0].slice(0, 60) : '') + ')');
    check(!tsv.some((x) => /\b(Pure Note|Cantor\b|the Hedge|Hush|Narrow)\b/.test(x[1])) && tsv.some((x) => /la Note pure/.test(x[1])) && tsv.some((x) => /Chantre/.test(x[1])), 'the French follows the glossary (la Note pure, Chantre)');

    check(!errors.length, 'no page errors (' + errors.slice(0, 2).join(' | ') + ')');
  } catch (e) { fails++; console.log('FAIL exception ' + (e && e.stack || e)); }
  await browser.close();
  console.log(fails ? fails + ' FAILED' : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
