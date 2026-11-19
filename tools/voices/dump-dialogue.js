// Dump every person's own dialogue from the running game (greetings and topic answers), with each speaker's voice
// profile from js/voices.js, to tools/voices/dialogue.json. tools/voices/extract.py turns that into script lines.
//
//   PREVIEW_URL=http://127.0.0.1:4176 PLAYWRIGHT_MODULE=/path/to/playwright node tools/voices/dump-dialogue.js
//
// Only plain strings are taken (a topic that is a function is decided in play and stays unvoiced); the shared answers
// in TOPICS are spoken by anyone and are not recorded per speaker.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4176') + '/?nosw=1');
  await p.waitForFunction(() => typeof Engine !== 'undefined' && typeof NPCS !== 'undefined' && typeof VOICES !== 'undefined' && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 120000 });
  const out = await p.evaluate(() => {
    const people = {};
    for (const id of Object.keys(NPCS).sort()) {
      const n = NPCS[id], pr = VOICES.resolveNpc(id), lines = [];
      const g = n.greet;
      if (typeof g === 'string') lines.push({ kind: 'greet', key: 'normal', text: g });
      else if (g) for (const k of ['polite', 'normal', 'blunt']) if (typeof g[k] === 'string') lines.push({ kind: 'greet', key: k, text: g[k] });
      for (const t of Object.keys(n.topics || {})) if (typeof n.topics[t] === 'string') lines.push({ kind: 'topic', key: t, text: n.topics[t] });
      people[id] = { name: String(n.name || ''), sprite: n.sprite || '', portrait: typeof n.portrait === 'string' ? n.portrait : '', profile: { f0: pr.f0, fs: pr.fs, style: pr.style, silent: !!pr.silent, authored: !!pr.authored }, lines };
    }
    return people;
  });
  fs.writeFileSync(path.join(__dirname, 'dialogue.json'), JSON.stringify(out, null, 1) + '\n');
  console.log('people', Object.keys(out).length, 'lines', Object.values(out).reduce((a, x) => a + x.lines.length, 0));
  await b.close();
})();
