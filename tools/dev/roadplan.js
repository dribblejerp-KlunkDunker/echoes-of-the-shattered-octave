// node roadplan.js <map id> <out.png> : a plan of a map (floor kinds, relief, too-steep ground, blocks, things) and a walk check
const { chromium } = require('/opt/npm-tools/node_modules/playwright'); const fs = require('fs');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox'] }); const page = await browser.newPage();
  page.on('pageerror', (e) => console.log('PAGEERROR', e.message));
  await page.goto('http://127.0.0.1:4175/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  const r = await page.evaluate((id) => {
    closeModal(); hide('#event'); const m = G.maps[id], W = m.w, H = m.h, Z = 10, cv = document.createElement('canvas'); cv.width = W * Z; cv.height = H * Z; const cx = cv.getContext('2d');
    const col = { 0: [86, 122, 62], 1: [150, 124, 84], 2: [46, 84, 140], 3: [110, 150, 180], 4: [120, 84, 50], 5: [70, 100, 70] };
    const steep = (x, y) => !!m.smooth && m.gradeAt(x + 0.5, y + 0.5) > MAX_GRADE;
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const c = m.cells[y * W + x], f = m.floorCells ? m.floorCells[y * W + x] : 0, g = m.groundAt(x + 0.5, y + 0.5); let k = (col[f] || [200, 0, 200]).map((v) => Math.min(255, v + g * 28));
      if (c) k = c.door ? [230, 200, 60] : [90 + (c.top || 1) * 30, 90 + (c.top || 1) * 30, 96 + (c.top || 1) * 30]; else if (steep(x, y)) k = [120, 60, 50];
      cx.fillStyle = 'rgb(' + k.map((v) => v | 0).join(',') + ')'; cx.fillRect(x * Z, y * Z, Z, Z); }
    for (const e of m.entities) { cx.fillStyle = e.sprite === 'oak' ? '#1e4a1e' : e.kind === 'item' ? '#ffd040' : e.label ? '#ff4040' : '#203020'; const s = e.sprite === 'oak' ? 4 : 3; cx.beginPath(); cx.arc(e.x * Z, e.y * Z, s, 0, 7); cx.fill(); }
    // walk check with the grade rule
    const ok = (x, y, fx, fy) => { if (m.isBlocked(x, y)) return false; if (steep(x, y) && m.groundAt(x + 0.5, y + 0.5) > m.groundAt(fx + 0.5, fy + 0.5) + 0.02) return false; return true; };
    const sp = m.spawn, dist = new Int32Array(W * H).fill(-1), q = [(sp.y | 0) * W + (sp.x | 0)]; dist[q[0]] = 0;
    for (let h = 0; h < q.length; h++) { const i = q[h], x = i % W, y = (i / W) | 0; for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) { const X = x + dx, Y = y + dy; if (X < 0 || Y < 0 || X >= W || Y >= H) continue; const j = Y * W + X; if (dist[j] >= 0 || !ok(X, Y, x, y)) continue; dist[j] = dist[i] + 1; q.push(j); } }
    const near = (x, y) => { let b = -1; for (let dy = -1; dy <= 1; dy++) for (let dx = -1; dx <= 1; dx++) { const v = dist[((y | 0) + dy) * W + (x | 0) + dx]; if (v >= 0 && (b < 0 || v < b)) b = v; } return b; };
    const doors = []; for (let i = 0; i < m.cells.length; i++) { const c = m.cells[i]; if (c && c.door) doors.push([i % W, (i / W) | 0, c.portal && c.portal.map, near(i % W, (i / W) | 0)]); }
    const lab = m.entities.filter((e) => e.label).map((e) => [e.sprite, e.x, e.y, near(e.x, e.y), (e.label + '').slice(0, 30)]);
    let open = 0, reach = 0; for (let i = 0; i < W * H; i++) { if (!m.isBlocked(i % W, (i / W) | 0)) { open++; if (dist[i] >= 0) reach++; } }
    return { png: cv.toDataURL('image/png'), doors, lab, open, reach, ents: m.entities.length, maxG: Math.max(...Array.from({ length: W * H }, (_, i) => m.groundAt(i % W + 0.5, ((i / W) | 0) + 0.5))) };
  }, process.argv[2]);
  fs.writeFileSync(process.argv[3], Buffer.from(r.png.split(',')[1], 'base64')); delete r.png; console.log(JSON.stringify(r, null, 0).replace(/\],\[/g, '],\n['));
  await browser.close();
})();
