// Phase 111: the pixel hands on their own, with no game loaded (a second or two a picture), for working on the model.
//
//   PLAYWRIGHT_MODULE=/opt/npm-tools/node_modules/playwright node tools/dev/px111.js OUT.png SPEC.js [scale]
//
// SPEC.js is evaluated in a blank page that has js/pixelhands110.js loaded; it must end in an expression giving
// { w, h, look, hands: [...] } (see PIXELHANDS110._dev.hands) or an array of them (laid side by side). `scale` enlarges
// the result with hard pixels (default 2). The background is a flat cobble brown, so outlines and halos can be judged.
'use strict';
const fs = require('fs'), path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const [out, specFile, scale] = [process.argv[2], process.argv[3], +(process.argv[4] || 2)];
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] });
  const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('pageerror: ' + e.message.slice(0, 400)));
  page.on('console', (m) => console.log('page: ' + m.text().slice(0, 400)));
  await page.setContent('<html><body></body></html>');
  await page.addScriptTag({ content: fs.readFileSync(path.join(__dirname, '..', '..', 'js', 'pixelhands110.js'), 'utf8') });
  const url = await page.evaluate(([src, sc]) => {
    let specs = (0, eval)(src); if (!Array.isArray(specs)) specs = [specs];
    const t0 = performance.now();
    const pics = specs.map((s) => ({ s, r: PIXELHANDS110._dev.hands(s) }));
    console.log('built in ' + (performance.now() - t0).toFixed(0) + ' ms');
    const pw = (p) => p.s.sheet ? p.s.w + 330 : p.s.w; const w = pics.reduce((a, p) => a + pw(p), 0), h = Math.max(...pics.map((p) => p.s.sheet ? p.s.h + 330 : p.s.h));
    const c = document.createElement('canvas'); c.width = w * sc; c.height = h * sc; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    let ox = 0;
    for (const p of pics) { x.fillStyle = p.s.bg || '#8a6f52'; x.fillRect(ox * sc, 0, pw(p) * sc, h * sc); x.drawImage(p.r.canvas, ox * sc, 0, p.s.w * sc, p.s.h * sc); if (p.s.over) for (const o of p.s.over(p.r)) x.drawImage(o, ox * sc, 0, o.width * sc, o.height * sc); ox += pw(p); }
    return c.toDataURL('image/png');
  }, [fs.readFileSync(specFile, 'utf8'), scale]);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64'));
  await browser.close();
})();
