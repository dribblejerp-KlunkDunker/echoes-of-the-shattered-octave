// Phase 121: the text matched to the books (the audit of 23 Nov 2026, sections 3.2 and 3.3), the four new names
// (Rulings of 23 Nov 2026, the last section) and the texture budget raised to 768 KB.
//   node test/text121.test.js        (no browser: reads the game's text the way tools/i18n/extract.js does)
// Every string literal and template piece in js/*.js (less the files extract.js skips: the voice manifest, the asset
// table, the dev tools) and the text of index.html. Comments are not text and are not read.
'use strict';
const fs = require('fs');
const path = require('path');
const acorn = require(process.env.ACORN_MODULE || '/opt/npm-tools/node_modules/acorn');
const ROOT = path.join(__dirname, '..');
const src = (f) => fs.readFileSync(path.join(ROOT, f), 'utf8');

let fails = 0;
const check = (cond, label) => { if (cond) console.log('PASS ' + label); else { fails++; console.log('FAIL ' + label); } };

// ---- the game's text, file by file
const SKIP = new Set(['assets.js', 'voice-lines.js', 'mods.js', 'story-i18n.js', 'access.js', 'painted-manifest.js', 'icons.js', 'frames.js', 'voices.js']);
const TEXT = {};   // file -> [strings]
for (const f of fs.readdirSync(path.join(ROOT, 'js')).filter((x) => x.endsWith('.js') && !SKIP.has(x)).sort()) {
  const out = [];
  const walk = (n) => {
    if (!n || typeof n.type !== 'string') return;
    if (n.type === 'Literal' && typeof n.value === 'string') out.push(n.value);
    else if (n.type === 'TemplateElement') out.push(n.value.cooked == null ? n.value.raw : n.value.cooked);
    for (const k of Object.keys(n)) {
      if (k === 'type' || k === 'start' || k === 'end') continue;
      const v = n[k];
      if (Array.isArray(v)) v.forEach(walk); else if (v && typeof v.type === 'string') walk(v);
    }
  };
  try { walk(acorn.parse(src('js/' + f), { ecmaVersion: 'latest', sourceType: 'script', allowHashBang: true })); }
  catch (e) { check(false, 'js/' + f + ' parses (' + e.message + ')'); }
  TEXT[f] = out;
}
TEXT['index.html'] = [src('index.html').replace(/<script[\s\S]*?<\/script>/g, '').replace(/<style[\s\S]*?<\/style>/g, '').replace(/<!--[\s\S]*?-->/g, '')];
const ALL = Object.values(TEXT).flat();
const has = (re) => ALL.some((s) => re.test(s));
const where = (re) => Object.keys(TEXT).filter((f) => TEXT[f].some((s) => re.test(s)));
const none = (re, label) => { const w = where(re); check(w.length === 0, label + (w.length ? ' (still in ' + w.join(', ') + ')' : '')); };
const some = (re, label) => check(has(re), label);

// ---- A. no weekdays the world does not have
none(/Thursday/, 'A: the word Thursday is nowhere in the game\'s text');
some(/the bread's for Hearthday/, 'A1: the Hollow\'s loop is "the bread\'s for Hearthday"');
check(['maps.js', 'life62-whispergrove.js', 'deep16.js'].every((f) => TEXT[f].some((s) => /the bread's for Hearthday/.test(s))), 'A1: in all three places (maps.js, life62-whispergrove.js, deep16.js)');
some(/Tom and Wat are to sing on Memoryday/, 'A2: Bryony Wick\'s letter: the boys sing on Memoryday');
some(/no Memoryday marked on anything/, 'A3: Halder Wick\'s dresser answers the letter: no Memoryday marked on anything');

// ---- B. the old contradictions (Vol VIII, Part V)
none(/I've stood this gate eleven years|I have kept this gate eleven years|Eleven years he has kept it shut/, 'B4: nobody says Harrow has kept THIS gate eleven years (the Hedge and its gate are from 417)');
check(TEXT['data.js'].some((s) => /eleven years/.test(s) && /since they planted the Hedge/.test(s)), 'B4: Harrow\'s own line: a gate in this town eleven years, and this one since they planted the Hedge');
check(TEXT['rumours.js'].some((s) => /Harrow/.test(s) && /eleven years/i.test(s) && /Hedge/.test(s)), 'B4: the rumour says the same in its own voice');
check(TEXT['ledger15.js'].some((s) => /eleven years/.test(s) && /Hedge/.test(s) && /quiet feet/.test(s)), 'B4: his quiet-feet lesson says the same');
check(TEXT['festivals12.js'].some((s) => /hung it eleven years running/.test(s)), 'B4: the Sheaf hung eleven years running is about the Sheaf, not the gate, and stays');
none(/twelve crates for two years/, 'B5: Vane no longer carried "twelve crates for two years"');
some(/crates for two years, twelve to a run/, 'B5: crates for two years, twelve to a run (Book One ch. 13)');
none(/hut in four years/, 'B6: Kaelen no longer says "four years"');
some(/Nobody came to the hut in seven years/, 'B6: nobody came to the hut in seven years');
none(/green-gold at the wrist/, 'B7: the glass arm is no longer green-gold at the wrist');
some(/pale blue at the wrist/, 'B7: it is pale blue at the wrist, Light-glass as in the book');
none(/forgot themselves in one night/, 'B8: seventy-four thousand did not forget themselves in one night');
some(/forgot themselves in a few days in 416/, 'B8: Part Three\'s card: in a few days in 416');
check(TEXT['data.js'].some((s) => /forgot themselves in a few days/.test(s)), 'B8: the Whisper-Grove talk in data.js says it in its own way');
none(/talks in chalk now|in chalk now, in capitals/, 'B9: the epilogue no longer has Lyra talk in chalk after the coda');
check(TEXT['epilogue.js'].some((s) => /most of what was left of her voice/.test(s) && !/chalk|capitals/.test(s)), 'B9: the coda cost her most of what was left of her voice, and she spends the rest sparingly');
none(/Seventy years in one street/, 'B10: Ada Pellow: not one street');
some(/Seventy years in one parish/, 'B10: seventy years in one parish');
none(/[Nn]ine winters/, 'B11: Old Tam did not keep the bridge nine winters');
check(TEXT['sidequests.js'].filter((s) => /[Tt]wo winters/.test(s)).length >= 2, 'B11: two winters, in Ada\'s line and in Tam\'s');
none(/three weeks gone|answered it for weeks|has been for weeks/, 'B12: the Tarrows have not been gone three weeks');
check(TEXT['house13.js'].some((s) => /two years gone/.test(s)) && TEXT['house13.js'].some((s) => /Back by the first frost/.test(s)), 'B12: two years gone; Maud\'s "Back by the first frost" stays as written');
none(/a fifth less gold|a fifth off the gold/, 'B13: the Kestrel\'s repairs are not priced in gold');
check(TEXT['kestrel16.js'].filter((s) => /a fifth/.test(s) && /sovereigns/.test(s)).length >= 2, 'B13: they are priced in sovereigns');
none(/\b[Tt]raveler/, 'B14: "traveler" is spelled "traveller" everywhere');
some(/Traveller on the Greenroot Road/, 'B14: the first title is "Traveller on the Greenroot Road"');

// ---- C. the new names
none(/Umber, scribe of the House|scribe styled Umber|Mine is Umber/, 'C15: the Library\'s old scribe is no longer Umber');
some(/Smalt, scribe of the House/, 'C15: "What Is Written" is by Smalt, scribe of the House');
some(/copied fair by the scribe styled Smalt/, 'C15: the Rule is copied fair by the scribe styled Smalt');
some(/Mine is Smalt/, 'C15: "Mine is Smalt"');
some(/Umber, a runaway of the Veil/, 'C15: the Reach\'s runaway scribe is still Umber');
some(/I am Umber/, 'C15: and still says "I am Umber"');
check(Object.keys(TEXT).filter((f) => f !== 'house13.js').every((f) => !TEXT[f].some((s) => /\bLinnet\b/.test(s))), 'C16: the hush-gift child is not Linnet anywhere');
some(/Her name, she tells you, is Pipit/, 'C16: her name, she tells you, is Pipit');
check(TEXT['epilogue.js'].some((s) => /^Pipit sits at her elbow/.test(s)), 'C16: the epilogue names her Pipit');
check(TEXT['house13.js'].some((s) => /Linnet's Counting-Beads/.test(s)) && TEXT['house13.js'].some((s) => /Linnet is eight/.test(s)), 'C16: Linnet Tarrow keeps her name');
none(/\bAbner\b/, 'C17: nobody is called Abner');
none(/\bFenning/, 'C17: nobody is called Fenning');
some(/Jabez Barker, tanner/, 'C17: the tanner is Jabez Barker');
some(/Ned and Wyn Barker/, 'C17: his twins are Ned and Wyn Barker');
some(/[Tt]he Barker twins/, 'C17: the Barker twins');
none(/\bRequiem\b/, 'C18: nothing is called the Requiem');
some(/the Unended Office/, 'C18: the older thing in the choir is the Unended Office');
some(/The Unended Office's Chord-Plate/, 'C18: its trophy is the Unended Office\'s Chord-Plate');
none(/three hundred years of funeral offices/, 'C18: not three hundred years of funeral offices');
some(/eleven hundred years of funeral offices/, 'C18: eleven hundred years (Vol V: the House is eleven hundred years old)');
check(TEXT['coda.js'].some((s) => /^A sexton's register, three hundred years of it/.test(s)), 'C18: the sexton\'s register of three hundred years is another thing, and stays');
check(/\^the unended office:/.test(src('js/logmap.js')) && /\^the requiem:/.test(src('js/logmap.js')), 'C18: the logbook map files the new journal entry with the Mausoleum (and an old save\'s still)');

// ---- E. left to Claude by the owner, 23 Nov evening ("make the right ones"): the Wearer's burst, in its older scene, says what the book says
// Book One, ch. 23: "It had eaten a Cantor and four others and two years of a woman's nights". It learned Lyra for two years, not Kaelen;
// five people, not a village; "Lark" is Tobin's word for his daughter, not a girl it ate.
none(/two years of Kaelen talking to himself/, 'E20: the Wearer did not eat two years of Kaelen in his hut');
none(/a whole village of voices/, 'E20: nor a whole village');
none(/a girl who used to be called lark/, 'E20: nor a girl called lark');
check(TEXT['coda.js'].some((s) => /^It bursts, and everything it ever ate comes out at once: a Cantor and four others, two years of a woman's nights, a boy whistling a falling fifth/.test(s)), 'E20: the older scene now gives the book\'s list (a Cantor and four others, two years of a woman\'s nights)');

// ---- ids, flags and keys stay
const data = src('js/data.js');
check(/requiem: \{ name: 'The Unended Office', sprite: 'requiem'/.test(data), 'ids stay: the enemy id and sprite are still requiem');
check(/name: 'Pipit', sprite: 'wren', portrait: 'wren'/.test(data) && /wren_saved/.test(src('js/epilogue.js')), 'ids stay: the child\'s sprite, portrait and flag are still wren');
check(/name: 'Jabez Barker, tanner', sprite: 'hob', portrait: 'hob'/.test(data), 'ids stay: the tanner is still hob');
check(/key: 'requiem', name: S\('The Unended Office\\'s Chord-Plate'\)/.test(src('js/hearth15.js')), 'ids stay: the trophy key is still requiem');

// ---- D. the texture budget
const dec = src('js/decals.js');
check(/CAP_BYTES = 768 \* 1024/.test(dec), 'D19: the cap is 768 KB');
check(/344,064 B/.test(dec) && /524,288 B/.test(dec) && /786,432 B/.test(dec) && /8 ceilings/.test(dec), 'D19: the comment table tells what is true now (8 ceilings; 344,064 B; with the tiles 524,288 B; the cap 786,432 B)');
check(!/512 KB/.test(src('js/painted20.js')) && /768 KB/.test(src('js/painted20.js')), 'D19: painted20.js says the same');
check(/DECALS\.capBytes/.test(src('test/painted20.test.js')) && !/< 512 \* 1024/.test(src('test/painted20.test.js')), 'D19: painted20\'s check reads the cap from DECALS.capBytes');

// ---- the voices: no recording of an old line is left, and the changed lines that had one have one again
const vl = src('js/voice-lines.js');
check(!/\bAbner\b|\bFenning|Seventy years in one street|I've stood this gate eleven years|forgot themselves in one night/.test(vl), 'voices: no recording of an old line is left in the manifest');
check(/"t": "[^"]*Jabez Barker on Tannery Row/.test(vl) && /"t": "Seventy years in one parish/.test(vl) && /"t": "I've kept a gate in this town eleven years/.test(vl), 'voices: the changed lines that had a recording have one again');

console.log(fails ? fails + ' failed' : 'all passed');
process.exit(fails ? 1 : 0);
