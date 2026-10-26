// Local-only: Lighthouse scores (mobile + desktop) using Playwright's Chromium.
import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { chromium } from 'playwright';
import { start } from './serve.mjs';
import fs from 'node:fs';

const target = process.argv[2] || 'http://localhost:4173/rayan-mirkhan/';
const server = target.includes('localhost') ? await start() : null;
const chrome = await chromeLauncher.launch({ chromePath: chromium.executablePath(), chromeFlags: ['--headless=new', '--no-sandbox'] });
fs.mkdirSync('lighthouse', { recursive: true });
for (const preset of (process.env.PRESETS || 'mobile,desktop').split(',')) {
  const config = preset === 'desktop' ? (await import('lighthouse/core/config/desktop-config.js')).default : undefined;
  const r = await lighthouse(target, { port: chrome.port, output: 'json', logLevel: 'error' }, config);
  const c = r.lhr.categories;
  console.log(preset, Object.entries(c).map(([k, v]) => `${k}:${Math.round(v.score * 100)}`).join(' '));
  const fails = Object.values(r.lhr.audits).filter((a) => a.score !== null && a.score < 0.9 && a.scoreDisplayMode !== 'informative' && a.scoreDisplayMode !== 'notApplicable');
  fails.forEach((a) => console.log('  -', a.id, a.displayValue || '', a.score));
  fs.writeFileSync(`lighthouse/${preset}.json`, r.report);
}
await chrome.kill();
server?.close();
