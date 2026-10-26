// Local-only: builds the optimized profile photo variants from source-assets/.
import sharp from 'sharp';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'source-assets', 'profile.jpg');
const out = (f) => path.join(root, 'assets', 'img', f);

const base = sharp(src).rotate().resize({ height: 1200, withoutEnlargement: true });
const jpg = await base.clone().jpeg({ quality: 80, mozjpeg: true, progressive: true }).toFile(out('profile.jpg'));
const webp = await base.clone().webp({ quality: 80 }).toFile(out('profile.webp'));
const small = sharp(src).rotate().resize({ width: 480 });
await small.clone().jpeg({ quality: 78, mozjpeg: true, progressive: true }).toFile(out('profile-480.jpg'));
await small.clone().webp({ quality: 78 }).toFile(out('profile-480.webp'));
console.log('jpg', jpg.width, jpg.height, jpg.size, '| webp', webp.size);
