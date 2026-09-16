import { createHash } from 'node:crypto';
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';

const SOURCE_DIR = 'scripts/brand-src';
const OUTPUT = 'public/assets/mememe-logo-official.webp';

// Canonical 2026-09-12 logo payload. The smaller .02a/.05a/tail01a/etc files
// are only emergency sub-splits of these same chunks and must not be appended.
// mememe-logo.06.b64 is a historical overlap/salvage fragment and is likewise
// intentionally excluded from the canonical stream.
const PARTS = [
  'mememe-logo.00.b64',
  'mememe-logo.01.b64',
  'mememe-logo.02.b64',
  'mememe-logo.03.b64',
  'mememe-logo.04.b64',
  'mememe-logo.05.b64',
  'mememe-logo.tail00.b64',
  'mememe-logo.tail01.b64',
  'mememe-logo.tail02.b64',
  'mememe-logo.tail03.b64',
  'mememe-logo.tail04.b64',
  'mememe-logo.tail05.b64',
  'mememe-logo.tail06.b64',
  'mememe-logo.tail07.b64',
];

const encoded = PARTS
  .map((file) => readFileSync(join(SOURCE_DIR, file), 'utf8').replace(/\s+/g, ''))
  .join('');

if (encoded.length !== 95_219) {
  throw new Error(`[materialize-brand] canonical base64 length mismatch: ${encoded.length} != 95219`);
}

const data = Buffer.from(encoded, 'base64');
if (data.length !== 71_414) {
  throw new Error(`[materialize-brand] decoded byte length mismatch: ${data.length} != 71414`);
}
if (data.subarray(0, 4).toString('ascii') !== 'RIFF' || data.subarray(8, 12).toString('ascii') !== 'WEBP') {
  throw new Error('[materialize-brand] canonical logo is not a RIFF/WEBP image');
}
if (data.readUInt32LE(4) + 8 !== data.length) {
  throw new Error('[materialize-brand] RIFF declared size does not match decoded bytes');
}
if (data.subarray(12, 16).toString('ascii') !== 'VP8X') {
  throw new Error('[materialize-brand] expected extended WebP VP8X header');
}

const readUint24LE = (offset) => data[offset] | (data[offset + 1] << 8) | (data[offset + 2] << 16);
const width = readUint24LE(24) + 1;
const height = readUint24LE(27) + 1;
if (width !== 1024 || height !== 1024) {
  throw new Error(`[materialize-brand] canonical logo dimensions mismatch: ${width}x${height} != 1024x1024`);
}

mkdirSync(dirname(OUTPUT), { recursive: true });
writeFileSync(OUTPUT, data);
const sha256 = createHash('sha256').update(data).digest('hex');
console.log(`[materialize-brand] PASS ${OUTPUT} bytes=${data.length} dimensions=${width}x${height} sha256=${sha256}`);
