// Run in the site's Chromium test container: node scripts/check-wordmark.cjs
const assert = require('node:assert/strict');
const puppeteer = require('puppeteer');
const fs = require('node:fs');
const path = require('node:path');
(async () => {
  const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-dev-shm-usage']});
  try {
    const root = path.resolve(__dirname, '..');
    for (const width of [390, 1440]) {
      const page = await browser.newPage();
      await page.setViewport({width, height: width === 390 ? 844 : 900});
      await page.goto('about:blank');
      await page.setContent(fs.readFileSync(path.join(root, 'index.html'), 'utf8').replace('<script defer src="/wordmark.js"></script>', ''));
      await page.addScriptTag({path: path.join(root, 'wordmark.js')});
      await page.waitForSelector('h1.painted');
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth), width);
      const colored = () => page.evaluate(() => {
        const c = document.querySelector('canvas'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data;
        for (let i = 0; i < d.length; i += 4) if (d[i + 3] && d[i] !== d[i + 1]) return true;
        return false;
      });
      assert.equal(await colored(), false);
      await page.mouse.move(width / 2, page.viewport().height / 2);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      assert.equal(await colored(), true);
      await page.emulateMediaFeatures([{name: 'prefers-reduced-motion', value: 'reduce'}]);
      await page.mouse.move(width / 2 + 5, page.viewport().height / 2);
      await page.evaluate(() => new Promise(r => requestAnimationFrame(() => requestAnimationFrame(r))));
      assert.equal(await colored(), false);
      await page.close();
      console.log(`${width}px: wordmark, pointer, reduced motion, overflow OK`);
    }
  } finally { await browser.close(); }
})().catch(e => { console.error(e); process.exitCode = 1; });
