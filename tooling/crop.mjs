// Local-only: crop a region of a QA screenshot for close inspection. Usage: node crop.mjs in.png top height out.png
import sharp from 'sharp';
const [, , input, top, height, out] = process.argv;
const meta = await sharp(input).metadata();
const h = Math.min(Number(height), meta.height - Number(top));
await sharp(input).extract({ left: 0, top: Number(top), width: meta.width, height: h }).toFile(out);
