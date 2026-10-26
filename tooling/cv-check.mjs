// Local-only: confirms content-visibility sections render when scrolled into view.
import { chromium } from 'playwright';
import { start } from './serve.mjs';
const server = await start();
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 360, height: 800 } });
await page.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
for (const id of ['showreel', 'experience', 'languages']) {
  await page.evaluate((i) => document.getElementById(i).scrollIntoView({ behavior: 'instant' }), id);
  await page.waitForTimeout(900);
  await page.screenshot({ path: `qa-out/vp-${id}.png` });
}
await browser.close(); server.close();
