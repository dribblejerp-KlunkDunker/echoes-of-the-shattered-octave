// node sprpng.js out.png name1 name2 ... : the named sprites side by side at 4x, on a grass-green ground
const { chromium } = require('/opt/npm-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const [out, ...names] = process.argv.slice(2);
  const b = await chromium.launch({ args: ['--no-sandbox'] }); const p = await b.newPage();
  await p.goto((process.env.PREVIEW_URL || 'http://127.0.0.1:4176') + '/?nosw=1', { timeout: 600000 });
  await p.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && G.state === 'title', null, { timeout: 600000 });
  const url = await p.evaluate((names) => {
    const sps = names.map(n => Engine.sprites[n]).filter(Boolean), K = 4;
    const W = sps.reduce((a, s) => a + s.w * K + 8, 0), H = Math.max(...sps.map(s => s.h * K));
    const c = document.createElement('canvas'); c.width = W; c.height = H; const x = c.getContext('2d'); x.imageSmoothingEnabled = false;
    x.fillStyle = '#789a6c'; x.fillRect(0, 0, W, H); let ox = 0;
    for (const s of sps) { const t = document.createElement('canvas'); t.width = s.w; t.height = s.h; const id = new ImageData(new Uint8ClampedArray(s.data.buffer.slice(0)), s.w, s.h); t.getContext('2d').putImageData(id, 0, 0); x.drawImage(t, ox, H - s.h * K, s.w * K, s.h * K); ox += s.w * K + 8; }
    return c.toDataURL('image/png');
  }, names);
  fs.writeFileSync(out, Buffer.from(url.split(',')[1], 'base64')); await b.close(); console.log('wrote', out);
})();
