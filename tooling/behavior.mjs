// Local-only: interaction checks (toggle, menu, counters, persistence).
import { chromium } from 'playwright';
import { start } from './serve.mjs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
const server = await start();
const URL = 'http://localhost:4173/';
const browser = await chromium.launch();
const ok = (c, m) => console.log(c ? 'PASS' : 'FAIL', m);

const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
const page = await ctx.newPage();
const errs = []; page.on('pageerror', (e) => errs.push(e.message));
await page.goto(URL, { waitUntil: 'networkidle' });
ok(await page.evaluate(() => document.documentElement.dir === 'rtl' && document.documentElement.lang === 'ku-Arab'), 'default ku/rtl');

await page.locator('#highlights').scrollIntoViewIfNeeded(); await page.waitForTimeout(1500);
ok((await page.locator('[data-count="4"]').textContent()) === '٤', 'counter uses Eastern Arabic digits');
ok((await page.locator('[data-year]').textContent()) === '٢٠٢٦', 'footer year in ku digits');

await page.click('.lang-toggle__opt[data-lang="en"]'); await page.waitForTimeout(400);
const s = await page.evaluate(() => ({ dir: document.documentElement.dir, lang: document.documentElement.lang, title: document.title,
  desc: document.querySelector('meta[name=description]').content, og: document.querySelector('meta[property="og:title"]').content,
  cv: document.querySelector('[data-cv-link]').getAttribute('href'), n: document.querySelector('[data-count="4"]').textContent,
  alt: document.querySelector('.portrait__img').alt, checked: document.querySelector('[data-lang=en]').getAttribute('aria-checked'),
  tickerAnim: getComputedStyle(document.querySelector('.ticker__track')).animationName }));
ok(s.dir === 'ltr' && s.lang === 'en', 'switch to en/ltr');
ok(s.title.startsWith('Rayan') && s.desc.startsWith('Rayan') && s.og.startsWith('Rayan'), 'title + meta + og updated');
ok(s.cv.endsWith('cv-en.pdf'), 'CV link -> en');
ok(s.n === '4', 'counter re-rendered western digits');
ok(s.alt === 'Portrait of Rayan Mirkhan', 'alt translated');
ok(s.checked === 'true', 'aria-checked synced');
ok(s.tickerAnim === 'marquee', 'ticker LTR direction');

await page.reload({ waitUntil: 'networkidle' });
ok(await page.evaluate(() => document.documentElement.dir === 'ltr' && !document.documentElement.classList.contains('i18n-pending')), 'persisted en after reload');

// keyboard on toggle
await page.focus('.lang-toggle__opt[data-lang="en"]'); await page.keyboard.press('ArrowLeft'); await page.waitForTimeout(400);
const k = await page.evaluate(() => ({ dir: document.documentElement.dir, focus: document.activeElement.dataset.lang,
  anim: getComputedStyle(document.querySelector('.ticker__track')).animationName }));
ok(k.dir === 'rtl' && k.focus === 'ku', 'arrow key switches to ku and moves focus');
ok(k.anim === 'marquee-rtl', 'ticker reverses in RTL');


// mobile menu
await page.setViewportSize({ width: 375, height: 800 });
await page.click('.menu-btn');
const m = await page.evaluate(() => ({ open: !document.getElementById('menu').hidden, exp: document.querySelector('.menu-btn').getAttribute('aria-expanded'),
  lock: document.documentElement.classList.contains('is-locked'), focus: document.activeElement.className }));
ok(m.open && m.exp === 'true' && m.lock && m.focus === 'menu__close', 'menu opens, locks scroll, focuses close');
for (let i = 0; i < 8; i++) await page.keyboard.press('Tab');
ok(await page.evaluate(() => !!document.activeElement.closest('#menu')), 'focus trapped in menu');
await page.keyboard.press('Escape');
ok(await page.evaluate(() => document.getElementById('menu').hidden && document.activeElement.classList.contains('menu-btn') && !document.documentElement.classList.contains('is-locked')), 'Esc closes, restores focus, unlocks');

// 404 under subpath
const r = await page.goto('http://localhost:4173/no/such/page', { waitUntil: 'networkidle' });
ok(r.status() === 404 && (await page.locator('h1').textContent()).includes('نەهاتە دیتن'), '404 page renders at nested path');

// CV files reachable
for (const l of ['ku', 'en']) { const res = await page.request.get(`${URL}assets/cv/rayan-mirkhan-cv-${l}.pdf`); ok(res.status() === 200, `cv-${l}.pdf served`); }

// file:// works
const fp = await ctx.newPage(); const ferr = []; fp.on('pageerror', (e) => ferr.push(e.message));
await fp.goto(pathToFileURL(path.resolve('..', 'index.html')).href);
await fp.waitForTimeout(500);
ok(ferr.length === 0 && await fp.evaluate(() => !!window.RM.i18n), 'works via file://');

ok(errs.length === 0, 'no page errors ' + errs.join('|'));
await browser.close(); server.close();
