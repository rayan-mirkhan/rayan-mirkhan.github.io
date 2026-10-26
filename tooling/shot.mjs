// Local-only: viewport shots of the hero + about for design review.
import { chromium } from 'playwright';
import { start } from './serve.mjs';
const server = await start();
const b = await chromium.launch();
for (const [lang, w, h] of [['ku', 1280, 900], ['en', 390, 844]]) {
  const ctx = await b.newContext({ viewport: { width: w, height: h }, reducedMotion: 'reduce' });
  await ctx.addInitScript((l) => localStorage.setItem('rm-lang', l), lang);
  const p = await ctx.newPage();
  await p.goto('http://localhost:4173/', { waitUntil: 'networkidle' });
  await p.screenshot({ path: `qa-out/hero-${lang}-${w}.png` });
  await p.evaluate(() => document.getElementById('about').scrollIntoView({ behavior: 'instant' }));
  await p.waitForTimeout(600);
  await p.screenshot({ path: `qa-out/about-${lang}-${w}.png` });
  await ctx.close();
}
await b.close(); server.close();
