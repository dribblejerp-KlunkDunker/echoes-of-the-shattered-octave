// Phase 124 stage 1 trial: paints the six trial faces three ways (tools/dev/faces124-paint.js) in a page of the
// game's origin and writes PNGs to the folder given (default /home/claude/army124/F/shots/png). Run through browser.sh.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const outDir = process.argv[2] || '/home/claude/army124/F/shots/png'; fs.mkdirSync(outDir, { recursive: true });
  const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4225';
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] }); const page = await browser.newPage();
  page.on('console', (m) => console.log('[' + m.type() + ']', m.text().slice(0, 300)));
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(base + '/tools/dev/');
  await page.addScriptTag({ url: base + '/tools/dev/faces124-paint.js?t=' + Date.now() });
  const r = await page.evaluate(() => FT.run());
  for (const [k, v] of Object.entries(r.out)) if (typeof v === 'string' && v.startsWith('data:')) fs.writeFileSync(path.join(outDir, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  fs.writeFileSync(path.join(outDir, 'meta.json'), JSON.stringify({ ms: r.ms, names: r.names, src: Object.fromEntries(Object.entries(r.out).filter(([k, v]) => !String(v).startsWith('data:'))) }, null, 1));
  console.log(JSON.stringify(r.ms));
  await browser.close();
})();
