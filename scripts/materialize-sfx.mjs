import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  { name: 'news', chunks: 6, size: 4192 },
  { name: 'victory', chunks: 7, size: 4666 },
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

async function materialize(source) {
  const chunks = [];
  for (let index = 0; index < source.chunks; index += 1) {
    const suffix = String(index).padStart(2, '0');
    chunks.push(await readFile(`scripts/audio-src/${source.name}.${suffix}.b64`, 'utf8'));
  }

  const encoded = chunks.join('').replace(/\s+/g, '');
  const data = Buffer.from(encoded, 'base64');
  if (data.length !== source.size) {
    throw new Error(`${source.name}.ogg size mismatch: expected ${source.size}, got ${data.length}`);
  }
  if (data.subarray(0, 4).toString('ascii') !== 'OggS') {
    throw new Error(`${source.name}.ogg is not a valid Ogg stream`);
  }

  const digest = sha256(data);
  await mkdir('public/audio/sfx', { recursive: true });
  await writeFile(`public/audio/sfx/${source.name}.ogg`, data);
  console.log(`[materialize-sfx] ${source.name}.ogg ${data.length} bytes sha256=${digest}`);
}

for (const source of SOURCES) await materialize(source);
