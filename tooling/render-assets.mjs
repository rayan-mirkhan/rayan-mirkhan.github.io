// Local-only: screenshots the temporary og.html / icon.html templates into assets/img/.
import { chromium } from 'playwright';
import { pathToFileURL, fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const img = (f) => path.join(here, '..', 'assets', 'img', f);
const browser = await chromium.launch();

async function shot(file, width, height, out) {
  const page = await browser.newPage({ viewport: { width, height } });
  await page.goto(pathToFileURL(path.join(here, file)).href, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: img(out) });
  await page.close();
}

await shot('og.html', 1200, 630, 'og-image.png');
await shot('icon.html', 180, 180, 'apple-touch-icon.png');
await browser.close();
console.log('done');
