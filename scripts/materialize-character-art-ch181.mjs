import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, resolve } from 'node:path';

const chunks = [
  'scripts/assets/ch181/portrait-00.b64',
  'scripts/assets/ch181/portrait-01.b64',
  'scripts/assets/ch181/portrait-02.b64',
  'scripts/assets/ch181/portrait-03.b64',
  'scripts/assets/ch181/portrait-04.b64',
];

const base64 = (await Promise.all(chunks.map((path) => readFile(resolve(path), 'utf8'))))
  .join('')
  .replace(/\s+/g, '');

const bytes = Buffer.from(base64, 'base64');
if (bytes.length < 20_000) throw new Error(`CH-18.1 portrait atlas truncated: ${bytes.length} bytes`);
if (bytes.subarray(0, 4).toString('ascii') !== 'RIFF') throw new Error('CH-18.1 portrait atlas missing RIFF header');
if (bytes.subarray(8, 12).toString('ascii') !== 'WEBP') throw new Error('CH-18.1 portrait atlas missing WEBP signature');

const output = resolve('public/assets/characters/ch181/portraits.webp');
await mkdir(dirname(output), { recursive: true });
await writeFile(output, bytes);
console.log(`[materialize-character-art-ch181] portraits.webp bytes=${bytes.length} PASS`);
