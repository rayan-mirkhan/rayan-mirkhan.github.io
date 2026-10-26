// Local-only static server that mounts the site under /rayan-mirkhan/ to mimic the GitHub Pages project subpath.
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BASE = '/rayan-mirkhan/';
const PORT = Number(process.env.PORT || 4173);
const TYPES = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.webp': 'image/webp', '.pdf': 'application/pdf', '.txt': 'text/plain', '.xml': 'application/xml' };

export function start() {
  const server = http.createServer((req, res) => {
    const url = decodeURIComponent(new URL(req.url, 'http://x').pathname);
    let file = url.startsWith(BASE) ? path.join(root, url.slice(BASE.length)) : null;
    if (file && !file.startsWith(root + path.sep) && file !== root) file = null;
    if (file && fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
    if (!file || !fs.existsSync(file) || file.includes(`${path.sep}tooling${path.sep}`) || file.includes('source-assets')) {
      res.writeHead(404, { 'content-type': TYPES['.html'] });
      return res.end(fs.readFileSync(path.join(root, '404.html')));
    }
    res.writeHead(200, { 'content-type': TYPES[path.extname(file)] || 'application/octet-stream', 'cache-control': 'max-age=3600' });
    fs.createReadStream(file).pipe(res);
  });
  return new Promise((r) => server.listen(PORT, () => r(server)));
}

if (process.argv[1] === fileURLToPath(import.meta.url)) start().then(() => console.log(`http://localhost:${PORT}${BASE}`));
