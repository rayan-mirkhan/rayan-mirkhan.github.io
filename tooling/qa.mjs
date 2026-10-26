// Local-only QA: screenshots + layout checks at 4 widths in both languages.
import { chromium } from 'playwright';
import { start } from './serve.mjs';
import fs from 'node:fs';

const OUT = process.env.QA_OUT || 'qa-out';
fs.mkdirSync(OUT, { recursive: true });
const server = await start();
const URL = 'http://localhost:4173/';
const browser = await chromium.launch();
const widths = [360, 768, 1280, 1600];
const scheme = process.env.SCHEME || 'light';
let problems = [];

for (const lang of ['ku', 'en']) {
  for (const w of widths) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme, reducedMotion: 'reduce' });
    await ctx.addInitScript((l) => { try { localStorage.setItem('rm-lang', l); } catch (e) {} }, lang);
    const page = await ctx.newPage();
    const errors = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
    page.on('requestfailed', (r) => errors.push('failed: ' + r.url()));
    await page.goto(URL, { waitUntil: 'networkidle' });
    await page.evaluate(() => document.fonts.ready);
    // Scroll through so content-visibility sections render, as they would for a real visitor.
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { window.scrollTo(0, y); await new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(r))); } window.scrollTo(0, 0); });
    const info = await page.evaluate(() => {
      const doc = document.documentElement;
      const wide = [...document.querySelectorAll('body *')].filter((el) => {
        const r = el.getBoundingClientRect();
        return r.width > 0 && (r.right > doc.clientWidth + 1 || r.left < -1) && !el.closest('.ticker');
      }).slice(0, 5).map((el) => el.className || el.tagName);
      return { lang: doc.lang, dir: doc.dir, sw: doc.scrollWidth, cw: doc.clientWidth, wide,
        cv: document.querySelector('[data-cv-link]').getAttribute('href'), title: document.title };
    });
    if (info.sw > info.cw || info.wide.length) problems.push({ lang, w, ...info });
    if (errors.length) problems.push({ lang, w, errors });
    console.log(lang, w, info.dir, info.cv, info.sw === info.cw ? 'no-hscroll' : `HSCROLL ${info.sw}>${info.cw}`, info.wide.join(','));
    await page.screenshot({ path: `${OUT}/${scheme}-${lang}-${w}.png`, fullPage: true });
    await ctx.close();
  }
}
await browser.close();
server.close();
console.log(problems.length ? JSON.stringify(problems, null, 1) : 'ALL CLEAN');
