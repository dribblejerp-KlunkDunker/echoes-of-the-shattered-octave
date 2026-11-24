// PREVIEW_URL=http://127.0.0.1:4226 PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node test/strangers125.test.js
// Phase 125a: the six strangers. The traveller is their own person: no calling and no likeness carries a book person's
// name, title or history; the two callings that were one hero's own title are Glass-Hand and Catalogue Clerk; ids,
// numbers, gear and flags are unchanged; a save made before the change loads with its name, calling, numbers and face;
// every new line has French; nothing new draws on Math.random.
'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const zlib = require('node:zlib');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const URL_ = process.env.PREVIEW_URL || 'http://127.0.0.1:4226';
const ROOT = path.join(__dirname, '..');
let fails = 0;
const pass = (m) => console.log('PASS ' + m);
const check = (ok, m) => { if (ok) pass(m); else { fails++; console.log('FAIL ' + m); } };

// The book people (Series Bible, Part VIII "The Cast", ll. 298-384, and the callings brief's section 9), their titles,
// and the sentences of the old texts that are a book person's own history or that a book line contradicts.
const FORBIDDEN = [
  // names
  'Kaelen', 'Vance', 'Lyra', 'Ashgrove', 'Tobin', 'Vane', 'Sable', 'Ignatius', 'Crane', 'Vaelen', 'Aurelian', 'Casimir',
  'Solenne', 'Seraphina', 'Aubade', 'Vesper', 'Aldric', 'Ysolde', 'Carrow', 'Severin', 'Pellam', 'Quist', 'Halloway',
  'Ilias Marren', 'Mags', 'Margarethe', 'Tennant', 'Pennick', 'Rooke', 'Anselm', 'Tobiah', 'Vosk', 'Harrow', 'Bettany',
  'Orla', 'Davin', 'Oona', 'Ilse', 'Brennan', 'Garret Tull', 'Emory Wain', 'Hester Vell', 'Renshaw', 'Ostrel', 'Placidus',
  'Wenna', 'Hadda', 'Tolland', 'Ormond', 'Hesper', 'Dorran', 'Old Tam', 'Marten', 'Old Coyle', 'Tanner twins', 'Carder',
  'Madder', 'Hetty Bram', 'Hob Wendle', 'Lissa Merrow', 'Tamsin', 'Halder Wick', 'Theresa Ward', 'Kestrel', 'Wave-Cutter',
  // titles
  'Dissonant Blade', 'Archivist of the Veil', 'Cantor of Oakhaven', 'Cantor of the Living Chord', 'Corsair of the Rust Coast',
  'Flambeau of the Synod', 'Surgeon-Grafter', 'Veil-sworn', 'Bound Ledger', 'second Ledger', 'Inquisitor',
  // histories and contradicted lines
  'Governor', "Cooper's Row", 'Dawning floor', 'bulkhead', 'consecrated', 'medal', 'one of their own', 'three shifts',
  'foreman', 'foremen', 'ladder', 'Grafters bring', 'pump-house', 'fourth line', 'walked into the mist', 'half-believe',
  'laugh loudest', 'laughs loudest', 'births, fevers and burials', 'until the light turned', 'the day the light turned',
  'Forty-eight', 'seventy-four thousand', 'Whisper-Grove', 'felt sleeve', 'Conservatory of Bores', 'Reedside',
  'the Church still denies', 'charcoal', 'hound-bed',
];
const re = (w) => new RegExp('(^|[^A-Za-z])' + w.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '([^A-Za-z]|$)', 'i');

// the numbers, gear and flags as they stood before Phase 125a (js/data.js v48)
const BEFORE = {
  blade: { hz: '174 Hz', hp: 30, voice: 10, glass: true, pellets: 4, songs: 'murmur', skills: 'Long Blade, Glasswork, Engineering', attrs: '60,55,50,45,60,35,45,40' },
  cantor: { hz: '174 Hz', hp: 20, voice: 40, glass: false, pellets: 9, songs: 'murmur,tending,fifth,root', skills: 'Law-song, Mending, Etiquette', attrs: '35,55,70,45,45,65,45,45' },
  corsair: { hz: '639 Hz', hp: 25, voice: 12, glass: false, pellets: 12, songs: 'murmur', skills: 'Short Blade, Firearms, Streetwise', attrs: '50,45,40,65,50,55,60,55' },
  archivist: { hz: '741 Hz', hp: 18, voice: 30, glass: false, pellets: 7, songs: 'murmur,tending,name', skills: 'Ledger-craft, Lore, Resonance', attrs: '35,75,60,45,40,50,45,50' },
  penitent: { hz: '285 Hz', hp: 26, voice: 25, glass: false, pellets: 3, songs: 'murmur,fifth', skills: 'Blunt Weapon, Doctrine, Glass-fire', attrs: '55,50,65,40,55,45,40,35' },
  quarry: { hz: '396 Hz', hp: 36, voice: 8, glass: false, pellets: 2, songs: 'murmur', skills: 'Axe, Climbing, Endurance', attrs: '70,40,45,50,70,40,50,40' },
};
const NAMES = { blade: 'Glass-Hand', cantor: 'Cantor', corsair: 'Corsair', archivist: 'Catalogue Clerk', penitent: 'Flambeau Penitent', quarry: 'Quarry-Hand' };
// the kits as js/gear87.js dresses each calling at load (Phase 87), and the weapons it gives them
const KIT_BEFORE = '{"kit":{"blade":["a_p87_sip_apron","a_p87_sip_gauntlets","a_p87_sip_goggles","a_p87_sip_boots"],"cantor":["a_p87_can_cassock","a_p87_can_sandals","a_p87_can_cowl","a_p87_can_mantle"],"corsair":["a_p87_cap_coat","a_buckler","a_p87_cap_boots","a_p87_cap_bandana","a_p87_cap_gloves"],"archivist":["a_hood","a_gambeson","a_p87_hush_mitts","a_softboots"],"penitent":["a_gambeson","a_kettle"],"quarry":["a_jerkin","a_p87_wks_boots","a_p87_wks_gauntlets","a_kettle"]},"weapons":[["sword","glass"],["hands","pistol"],["axe","pistol"],["throwknife","pistol"],["mace","hands"],["p87_sledge"]]}';
const FLAGS = 'bio_reach,bio_rite,bio_coast,bio_silent,bio_answered,bio_pistol,bio_brother,bio_pressed,bio_bells';
const RANDOM_BEFORE = { 'js/data.js': 0, 'js/origins.js': 0, 'js/game.js': 24 };

(async () => {
  // ---------------------------------------------------------------- Math.random: no new draw in the files this phase touches
  for (const f in RANDOM_BEFORE) {
    const n = (fs.readFileSync(path.join(ROOT, f), 'utf8').match(/Math\.random/g) || []).length;
    check(n === RANDOM_BEFORE[f], `${f} draws on Math.random ${n} times (was ${RANDOM_BEFORE[f]})`);
  }

  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  try {
    const page = await browser.newPage({ viewport: { width: 1280, height: 800 } });
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(URL_ + '/index.html?nosw=1');
    await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
    await page.waitForFunction(() => typeof ORIGINS === 'object' && typeof STORY_I18N === 'object');

    // ---------------------------------------------------------------- the text: nobody from the books
    const T = await page.evaluate(() => {
      const out = [];
      for (const c of CLASSES) for (const k of ['name', 'desc', 'bio', 'summary', 'skills']) out.push({ where: c.id + '.' + k, t: c[k] });
      for (const f of CREATION_FACES) {
        for (const k of ['name', 'sketch', 'history', 'detail', 'says']) out.push({ where: 'face' + f.n + '.' + k, t: f[k] });
        f.facts.forEach(([a, b], i) => { out.push({ where: 'face' + f.n + '.fact' + i + 'k', t: a }); out.push({ where: 'face' + f.n + '.fact' + i, t: b }); });
      }
      for (const id in ORIGINS.REASONS) out.push({ where: 'reason.' + id, t: ORIGINS.REASONS[id] });
      return out;
    });
    const hits = [];
    for (const { where, t } of T) for (const w of FORBIDDEN) if (re(w).test(t)) hits.push(where + ': ' + w);
    check(hits.length === 0, `no calling, likeness or suggestion names a book person, title or history (${T.length} lines; ${hits.length} hits: ${hits.slice(0, 12).join('; ')})`);

    // ---------------------------------------------------------------- the six likenesses are six strangers of their own
    const faces = await page.evaluate(() => CREATION_FACES.map((f) => ({ n: f.n, name: f.name, keys: f.facts.map((x) => x[0]).join(',') })));
    check(faces.length === 6 && faces.every((f, i) => f.n === i + 1), 'six likenesses, faces 1 to 6, the same pictures');
    const fnames = faces.map((f) => f.name);
    check(new Set(fnames).size === 6 && fnames.every((n) => /^[A-Z][a-z]+ [A-Z][a-z]+$/.test(n)), 'six different names, a given name and a family name each: ' + fnames.join(', '));
    check(faces.every((f) => !/Trade/.test(f.keys)), 'a likeness is a face and a past, not a calling: no "Trade" among its facts');
    // each new name is used nowhere in the books, the bibles or the rest of the game
    const corpus = [];
    const walk = (d) => { for (const e of fs.readdirSync(d, { withFileTypes: true })) { const p = path.join(d, e.name); if (e.isDirectory()) walk(p); else if (/\.md$/.test(e.name)) corpus.push(fs.readFileSync(p, 'utf8')); } };
    walk(path.join(ROOT, 'story', 'Books')); walk(path.join(ROOT, 'story', 'World Bibles'));
    for (const f of fs.readdirSync(path.join(ROOT, 'js'))) if (/\.js$/.test(f) && f !== 'data.js') corpus.push(fs.readFileSync(path.join(ROOT, 'js', f), 'utf8'));
    const all = corpus.join('\n');
    const clash = [];
    for (const n of fnames) for (const part of n.split(' ')) if (re(part).test(all)) clash.push(part);
    check(clash.length === 0, 'the six names are nobody else in the books, the bibles or the game: ' + (clash.join(', ') || 'none'));

    // ---------------------------------------------------------------- the callings: two renamed, every number the same
    const C = await page.evaluate(() => CLASSES.map((c) => ({ id: c.id, name: c.name, hz: c.hz, hp: c.hp, voice: c.voice, glass: c.glass, pellets: c.pellets, songs: c.songs.join(','), skills: c.skills, attrs: ATTRS.map((a) => c.attrs[a]).join(',') })));
    check(C.map((c) => c.id).join() === 'blade,cantor,corsair,archivist,penitent,quarry', 'the six calling ids, in the same order');
    check(C.every((c) => c.name === NAMES[c.id]), 'the calling names: ' + C.map((c) => c.name).join(', '));
    const moved = C.filter((c) => { const b = BEFORE[c.id]; return !b || ['hz', 'hp', 'voice', 'glass', 'pellets', 'songs', 'skills', 'attrs'].some((k) => b[k] !== c[k]); }).map((c) => c.id);
    check(moved.length === 0, 'every calling\'s numbers, songs, skills and glass are as they were' + (moved.length ? ': ' + moved : ''));
    const flags = await page.evaluate(() => BIOGRAPHY.map((q) => q.a.map((a) => a.flag).join(',')).join(','));
    check(flags === FLAGS, 'the biography flags are unchanged');
    const kit = await page.evaluate(() => JSON.stringify({ kit: CLASS_KIT, weapons: CLASSES.map((c) => c.weapons) }));
    check(kit === KIT_BEFORE, 'the starting gear and weapons are unchanged: ' + kit);

    // ---------------------------------------------------------------- the creation screens show it
    const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
    await hit('#btn-new');
    const startName = await page.locator('#cname').inputValue();
    check(startName === fnames[0] && !FORBIDDEN.some((w) => re(w).test(startName)), 'the name box starts as the first stranger\'s name, nobody from the books: "' + startName + '"');
    await hit('#c-next');
    const list = await page.locator('.classlist button').allInnerTexts();
    check(list.some((t) => /^Glass-Hand/.test(t)) && list.some((t) => /^Catalogue Clerk/.test(t)) && !list.some((t) => /Dissonant Blade|Archivist of the Veil/.test(t)), 'the calling list shows Glass-Hand and Catalogue Clerk');
    // the question picker's suggestion for each calling uses the calling's own name
    const sugg = await page.evaluate(() => CLASSES.map((c) => (ORIGINS.REASONS[c.id] || '').includes(c.name)));
    check(sugg.every(Boolean), 'each suggestion names its calling by its name now');
    await hit('.classlist button'); await hit('#c-next');
    const faceShown = await page.evaluate(() => ({ name: document.querySelector('.fb-name')?.textContent, text: document.querySelector('#cfacebio')?.innerText || '' }));
    check(faceShown.name === fnames[0] && !FORBIDDEN.some((w) => re(w).test(faceShown.text)), 'the likeness screen shows the first stranger and nothing of a book person');

    // ---------------------------------------------------------------- every new line has French
    const fr = await page.evaluate(async () => {
      await ACCESS.setLocale('fr');
      const miss = []; const seen = new Set();
      const want = (s) => { if (typeof s !== 'string' || s.length < 8 || !/\s/.test(s) || seen.has(s)) return; seen.add(s); if (STORY_I18N.translate(s) == null) miss.push(s.slice(0, 70)); };
      for (const c of CLASSES) ['desc', 'bio', 'summary'].forEach((k) => want(c[k]));
      for (const f of CREATION_FACES) { ['sketch', 'history', 'detail', 'says'].forEach((k) => want(f[k])); f.facts.forEach(([, b]) => want(b)); }
      for (const id in ORIGINS.REASONS) want(ORIGINS.REASONS[id]);
      const words = []; for (const c of CLASSES) if (STORY_I18N.translate(c.name) == null) words.push(c.name);
      for (const f of CREATION_FACES) for (const [k] of f.facts) if (STORY_I18N.translate(k) == null && !words.includes(k)) words.push(k);
      await ACCESS.setLocale('en');
      return { n: seen.size, miss, words };
    });
    check(fr.miss.length === 0, `every calling, likeness and suggestion line has French (${fr.n}; missing: ${JSON.stringify(fr.miss.slice(0, 4))})`);
    check(fr.words.length === 0, 'the calling names and fact labels have French: missing ' + JSON.stringify(fr.words));

    // ---------------------------------------------------------------- an old save, made before the change, as "Kaelen Vance"
    await page.evaluate(() => { CREATE.cls = 0; CREATE.attrs = Object.assign({}, CLASSES[0].attrs); CREATE.bio = []; startGame(); });
    await page.waitForFunction(() => G.state === 'intro' || G.state === 'play');
    const OLD = JSON.parse(zlib.gunzipSync(fs.readFileSync(path.join(__dirname, 'fixtures', 'p123-oldsaves.json.gz'))).toString('utf8'));
    const old = JSON.parse(JSON.stringify(OLD.atMast)); old.player.name = 'Kaelen Vance'; old.player.face = 1;
    const r = await page.evaluate((d) => {
      const before = { attrs: JSON.stringify(d.player.attrs), level: d.player.level, hpMax: d.player.hpMax };
      try { restoreGame(d); } catch (e) { return { err: e.message }; }
      G.state = 'play'; renderCharacter();
      const sheet = document.querySelector('#modal-panel')?.innerText || ''; closeModal();
      return { name: G.player.name, cls: G.player.cls.id, clsName: G.player.cls.name, face: G.player.face, attrs: JSON.stringify(G.player.attrs) === before.attrs, level: G.player.level === before.level, hpMax: G.player.hpMax === before.hpMax, sheet, slot: slotSummary(snapshotGame()) };
    }, old);
    check(!r.err, 'the old save loads' + (r.err ? ': ' + r.err : ''));
    check(r.name === 'Kaelen Vance' && r.cls === 'blade' && r.face === 1 && r.attrs && r.level && r.hpMax, 'it keeps its traveller\'s name, calling, numbers and face');
    check(r.clsName === 'Glass-Hand' && /Glass-Hand/.test(r.sheet) && /Glass-Hand/.test(r.slot), 'its calling reads Glass-Hand on the sheet and the save slot');
    const borrowed = ['Lyra', 'Governor', 'Conservatory', 'charcoal', 'Dissonant Blade', 'I just know how they break'];
    check(!borrowed.some((w) => r.sheet.includes(w)), 'the character sheet shows none of the borrowed history');

    check(errors.length === 0, 'no page errors' + (errors.length ? ': ' + errors.slice(0, 3).join(' | ') : ''));
  } catch (e) { fails++; console.log('FAIL ' + (e && e.stack || e)); }
  finally { await browser.close(); }
  console.log(fails ? `${fails} FAILED` : 'ALL PASS');
  process.exit(fails ? 1 : 0);
})();
