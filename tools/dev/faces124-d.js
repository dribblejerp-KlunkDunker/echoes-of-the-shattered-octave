// Phase 124 stage 1, way D: each person's portrait cut from their own figure in the world (Engine.sprites, enlarged
// by PAINTFOLK.enlarge), brought to 96 by 96 and given the paintings' finish. Run through browser.sh; needs the game page.
const { chromium } = require('/opt/npm-tools/node_modules/playwright');
const fs = require('fs'), path = require('path');
const IDS = { marrable: 'p113f_marrable', trooper: 'p100_tr_b', tally: 'p97_tallyman', perpetua: 'p95_perpetua', packman: 'p60_man_a', oona: 'p17c_oona' };
(async () => {
  const outDir = '/home/claude/army124/F/shots/png'; fs.mkdirSync(outDir, { recursive: true });
  const base = process.env.PREVIEW_URL || 'http://127.0.0.1:4225';
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] }); const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('[pageerror]', e.message));
  await page.goto(base + '/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 240000 });
  const r = await page.evaluate(async (IDS) => {
    const ld = (s) => new Promise((res) => { const i = new Image(); i.onload = () => res(i); i.src = s; });
    // the ground: Harrow's and Orla's corners
    const gc = document.createElement('canvas'); gc.width = gc.height = 96; const gx = gc.getContext('2d'); let acc = [0, 0, 0], n = 0;
    for (const p of ['harrow', 'orla']) { gx.drawImage(await ld('/img/p_' + p + '.jpg'), 0, 0); for (const [x0, y0] of [[0, 0], [88, 0], [0, 30], [88, 30]]) { const d = gx.getImageData(x0, y0, 8, 8).data; for (let i = 0; i < d.length; i += 4) { acc[0] += d[i]; acc[1] += d[i + 1]; acc[2] += d[i + 2]; n++; } } }
    const GR = acc.map((v) => v / n);
    const hs = (x, y, s) => { let h = (Math.imul(x, 374761393) + Math.imul(y, 668265263) + Math.imul(s, 982451653)) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); h ^= h >>> 16; return (h >>> 0) / 4294967296; };
    const vn = (x, y, s) => { const xi = Math.floor(x), yi = Math.floor(y), fx = x - xi, fy = y - yi, u = fx * fx * (3 - 2 * fx), v = fy * fy * (3 - 2 * fy), a = hs(xi, yi, s), b = hs(xi + 1, yi, s), c = hs(xi, yi + 1, s), d = hs(xi + 1, yi + 1, s); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; };
    // two figures the game makes on arrival: the packman's (life60's variant) and Oona's (Cantabile's coat tint, its own COATS entry)
    try { if (!Engine.sprites.p60_man_a) LIFE60.variant('townsman', 'p60_man_a', 210, 0.9, 0.9); } catch (e) { /* reported as missing */ }
    try { const c = CANTABILE17.COATS.find((q) => q[1] === 'p17c_oona'), sp = Engine.sprites[c[0]]; if (sp && !Engine.sprites.p17c_oona) { const k = c[2], d = new Uint32Array(sp.data.length);
      for (let i = 0; i < d.length; i++) { const p = sp.data[i], a = p >>> 24; if (!a) { d[i] = p; continue; } const r = Math.min(255, (p & 255) * k[0]), g = Math.min(255, ((p >>> 8) & 255) * k[1]), b = Math.min(255, ((p >>> 16) & 255) * k[2]); d[i] = ((a << 24) | ((b | 0) << 16) | ((g | 0) << 8) | (r | 0)) >>> 0; }
      Engine.addSprite('p17c_oona', Object.assign({}, sp, { data: d })); } } catch (e) { /* reported as missing */ }
    const out = {}, ms = [], info = {};
    for (const [key, sid] of Object.entries(IDS)) {
      const sp = Engine.sprites[sid]; if (!sp) { info[key] = 'missing ' + sid; continue; }
      const t0 = performance.now();
      const E = PAINTFOLK.enlarge(sp), W = E.w, H = E.h, al = E.al;
      // the whole figure, for the sheet
      const fc = document.createElement('canvas'); fc.width = W; fc.height = H; const fid = new ImageData(new Uint8ClampedArray(E.data.buffer.slice(0)), W, H); fc.getContext('2d').putImageData(fid, 0, 0);
      // the head: first rows with figure pixels; its width over the top eighth (a hook or pole is left out: widest run near the centre of mass)
      const run = (y) => { let best = null, s = -1; for (let x = 0; x <= W; x++) { const o = x < W && al[y * W + x]; if (o && s < 0) s = x; else if (!o && s >= 0) { if (x - s >= 2 && (!best || x - s > best[1] - best[0])) best = [s, x]; s = -1; } } return best; };
      let cxm = 0, cm = 0; for (let y = (H * 0.3) | 0; y < H * 0.5; y++) { const r = run(y); if (r) { cxm += (r[0] + r[1]) / 2; cm++; } } cxm /= cm || 1;
      const near = (y) => { let best = null, s = -1; for (let x = 0; x <= W; x++) { const o = x < W && al[y * W + x]; if (o && s < 0) s = x; else if (!o && s >= 0) { const c = (s + x) / 2; if (x - s >= 2 && Math.abs(c - cxm) < W * 0.25 && (!best || x - s > best[1] - best[0])) best = [s, x]; s = -1; } } return best; };
      let top = -1; for (let y = 0; y < H && top < 0; y++) if (near(y)) top = y;
      let fh = 0; for (let y = H - 1; y >= 0; y--) if (near(y)) { fh = y - top + 1; break; }
      let headW = 0, hx = 0, hn = 0; for (let y = top; y < top + fh * 0.12; y++) { const r = near(y); if (r) { headW = Math.max(headW, r[1] - r[0]); hx += (r[0] + r[1]) / 2; hn++; } } hx /= hn || 1;
      const side = Math.round(Math.max(headW * 3.4, fh * 0.42)), x0 = Math.round(hx - side / 2), y0 = Math.round(top - side * 0.1);
      info[key] = { sprite: sid, w: sp.w, h: sp.h, enlarged: W + 'x' + H, head: [Math.round(hx), top, headW], crop: [x0, y0, side] };
      // to 96: two smooth steps
      const c1 = document.createElement('canvas'); c1.width = c1.height = 192; const x1 = c1.getContext('2d'); x1.imageSmoothingQuality = 'high'; x1.drawImage(fc, x0, y0, side, side, 0, 0, 192, 192);
      const fig = document.createElement('canvas'); fig.width = fig.height = 96; const fx = fig.getContext('2d'); fx.imageSmoothingQuality = 'high'; fx.drawImage(c1, 0, 0, 96, 96);
      // light sharpen of the figure's colours (alpha kept)
      { const id = fx.getImageData(0, 0, 96, 96), d = id.data, s = new Uint8ClampedArray(d);
        for (let y = 1; y < 95; y++) for (let x = 1; x < 95; x++) { const o = (y * 96 + x) * 4; if (s[o + 3] < 20) continue; for (let c = 0; c < 3; c++) { const bl = (s[o - 4 + c] + s[o + 4 + c] + s[o - 384 + c] + s[o + 384 + c]) / 4; d[o + c] = s[o + c] + 0.45 * (s[o + c] - bl); } } fx.putImageData(id, 0, 0); }
      // key light from the upper left, falling off toward the bottom (on the figure only)
      fx.globalCompositeOperation = 'source-atop';
      let g = fx.createRadialGradient(28, 18, 4, 34, 26, 80); g.addColorStop(0, 'rgba(255,214,160,0.22)'); g.addColorStop(1, 'rgba(255,214,160,0)'); fx.fillStyle = g; fx.fillRect(0, 0, 96, 96);
      g = fx.createLinearGradient(0, 40, 0, 96); g.addColorStop(0, 'rgba(12,8,6,0)'); g.addColorStop(1, 'rgba(12,8,6,0.5)'); fx.fillStyle = g; fx.fillRect(0, 0, 96, 96);
      g = fx.createLinearGradient(30, 0, 96, 0); g.addColorStop(0, 'rgba(12,8,6,0)'); g.addColorStop(1, 'rgba(12,8,6,0.3)'); fx.fillStyle = g; fx.fillRect(0, 0, 96, 96);
      fx.globalCompositeOperation = 'source-over';
      // the ground, a soft edge, the figure, grain
      const o = document.createElement('canvas'); o.width = o.height = 96; const ox = o.getContext('2d');
      ox.fillStyle = `rgb(${GR.map(Math.round)})`; ox.fillRect(0, 0, 96, 96);
      g = ox.createRadialGradient(46, 34, 4, 48, 40, 66); g.addColorStop(0, 'rgba(66,50,40,0.55)'); g.addColorStop(1, 'rgba(14,10,9,0.35)'); ox.fillStyle = g; ox.fillRect(0, 0, 96, 96);
      ox.save(); ox.filter = 'blur(1.2px)'; ox.globalAlpha = 0.55; ox.drawImage(fig, 0, 0); ox.restore();
      ox.drawImage(fig, 0, 0);
      const id = ox.getImageData(0, 0, 96, 96), d = id.data;
      for (let y = 0; y < 96; y++) for (let x = 0; x < 96; x++) { const u = x * 0.83 + y * 0.56, v = -x * 0.56 + y * 0.83, m = 1 + (vn(u / 5, v / 1.2, 7) - 0.5) * 0.12 + (hs(x, y, 3) - 0.5) * 0.04, q = (y * 96 + x) * 4; d[q] *= m; d[q + 1] *= m; d[q + 2] *= m; }
      ox.putImageData(id, 0, 0);
      ms.push(performance.now() - t0);
      out[key + '_D'] = o.toDataURL('image/png'); out[key + '_fig'] = fc.toDataURL('image/png');
    }
    return { out, ms, info, GR };
  }, IDS);
  for (const [k, v] of Object.entries(r.out)) fs.writeFileSync(path.join(outDir, k + '.png'), Buffer.from(v.split(',')[1], 'base64'));
  console.log(JSON.stringify({ ms: r.ms, info: r.info, GR: r.GR }));
  await browser.close();
})();
