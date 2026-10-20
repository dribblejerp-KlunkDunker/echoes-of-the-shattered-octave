#!/usr/bin/env node
'use strict';
// Merge "english<TAB>french" pair files (one per team, e.g. tools/i18n/p9-talk.tsv) straight into locales/story/fr.json.
// Lines whose English holds {0}-style placeholders become patterns; the rest are exact entries keyed by hash(norm(english)).
// Unlike merge.js this needs no entry in strings.en.json, so runtime-built variants (quoted, capitalised) can be listed.
//   node tools/i18n/merge-pairs.js tools/i18n/p9-*.tsv
const fs = require('fs');
const path = require('path');
const { hash, norm } = require('./lib');
const OUT = path.resolve(__dirname, '..', '..', 'locales', 'story', 'fr.json');
const d = JSON.parse(fs.readFileSync(OUT, 'utf8'));
d.s = d.s || {}; d.p = d.p || [];
const pIndex = new Map(d.p.map((pair, i) => [pair[0], i]));
const ph = (x) => (x.match(/\{\d+/g) || []).map(m => m.slice(1)).sort().join(',');
let exact = 0, pats = 0, bad = 0;
for (const file of process.argv.slice(2)) {
  for (const raw of fs.readFileSync(file, 'utf8').split('\n')) {
    if (!raw.trim() || raw.startsWith('#')) continue;
    const tab = raw.indexOf('\t'); if (tab < 0) { bad++; continue; }
    const en = norm(raw.slice(0, tab)), fr = raw.slice(tab + 1).trim();
    if (!en || !fr) { bad++; continue; }
    if (/\{\d+/.test(en)) {
      if (ph(en) !== ph(fr)) { console.warn('placeholder mismatch, skipped:', en); bad++; continue; }
      if (pIndex.has(en)) d.p[pIndex.get(en)][1] = fr; else { pIndex.set(en, d.p.length); d.p.push([en, fr]); }
      pats++;
    } else { d.s[hash(en)] = fr; exact++; }
  }
}
fs.writeFileSync(OUT, JSON.stringify(d));
console.log('merged exact ' + exact + ', patterns ' + pats + ', skipped ' + bad);
