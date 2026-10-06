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


const cauCoWalkChunks = [
  'scripts/assets/ch181/walk-cau-co-production-00.b64',
  'scripts/assets/ch181/walk-cau-co-production-01.b64',
  'scripts/assets/ch181/walk-cau-co-production-02.b64',
  'scripts/assets/ch181/walk-cau-co-production-03.b64',
];

const cauCoWalkBase64 = (await Promise.all(
  cauCoWalkChunks.map((path) => readFile(resolve(path), 'utf8')),
)).join('').replace(/\s+/g, '');

const cauCoWalkBytes = Buffer.from(cauCoWalkBase64, 'base64');
if (cauCoWalkBytes.subarray(0, 8).toString('hex') !== '89504e470d0a1a0a') {
  throw new Error('CH-18.16 CAU CO walk strip missing PNG signature');
}
if (cauCoWalkBytes.length !== 32_474) {
  throw new Error(`CH-18.16 CAU CO walk strip byte size changed: ${cauCoWalkBytes.length}`);
}
if (cauCoWalkBytes.readUInt32BE(16) !== 1536 || cauCoWalkBytes.readUInt32BE(20) !== 192) {
  throw new Error(
    `CH-18.16 CAU CO walk strip must be 1536x192, got ${cauCoWalkBytes.readUInt32BE(16)}x${cauCoWalkBytes.readUInt32BE(20)}`,
  );
}
const cauCoWalkOutput = resolve('public/assets/characters/ch181/walk-cau-co-production-x4.png');
await mkdir(dirname(cauCoWalkOutput), { recursive: true });
await writeFile(cauCoWalkOutput, cauCoWalkBytes);
console.log(`[materialize-character-art-ch181] walk-cau-co-production-x4.png bytes=${cauCoWalkBytes.length} PASS`);
