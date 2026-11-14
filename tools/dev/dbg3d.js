const { chromium } = require('/opt/npm-tools/node_modules/playwright');
(async () => {
  const browser = await chromium.launch({ headless: true, args: ['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader', '--ignore-gpu-blocklist'] }); const page = await browser.newPage();
  page.on('console', (m) => { if (m.type() !== 'log') console.log('[' + m.type() + ']', m.text().slice(0, 300)); });
  await page.addInitScript(() => { window.__r3d21 = { automation: true }; }); await page.goto('http://127.0.0.1:4175/index.html?nosw=1');
  await page.waitForFunction(() => typeof Engine !== 'undefined' && Engine.sprites.proctor && !document.querySelector('#loading')?.classList.contains('on'), null, { timeout: 90000 });
  const hit = (sel) => page.locator(sel).first().dispatchEvent('click');
  await hit('#btn-new'); await page.locator('#cname').fill('Wren Ashby'); await hit('#c-next'); await hit('.classlist button'); await hit('#c-next'); await hit('#c-next');
  for (let i = 0; i < 20 && !(await page.locator('#c-go').count()); i++) { const c = page.locator('#create-panel .list button').first(); if (await c.count()) await c.dispatchEvent('click'); else await page.locator('#create-panel button').filter({ hasText: /Continue|Begin|Confirm|Accept/ }).first().dispatchEvent('click'); }
  await hit('#c-go'); await hit('#btn-intro-skip'); await page.waitForFunction(() => G.state === 'play');
  await page.evaluate(() => { GFX.illustratedScreens = false; R3D.setMode('on'); window.requestAnimationFrame = () => 0; }); console.log(await page.evaluate((code) => { closeModal(); hide('#event'); return (0, eval)(code); }, process.argv[2]));
  await browser.close();
})();
