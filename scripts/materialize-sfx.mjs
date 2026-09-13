import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  {
    name: 'news',
    chunks: 6,
    sha256: 'a9901b41245a2a118c0a007af8b0fc35561939f673245a0ea728f0d4f406cd2e',
    size: 4192,
  },
  {
    name: 'victory',
    chunks: 7,
    sha256: '4be8669448d283a1747f32195da0235e6267100f9461d2d9093adedf25d9bd98',
    size: 4666,
  },
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
  const digest = sha256(data);
  if (data.length !== source.size) {
    throw new Error(`${source.name}.ogg size mismatch: expected ${source.size}, got ${data.length}`);
  }
  if (digest !== source.sha256) {
    throw new Error(`${source.name}.ogg SHA256 mismatch: expected ${source.sha256}, got ${digest}`);
  }

  await mkdir('public/audio/sfx', { recursive: true });
  await writeFile(`public/audio/sfx/${source.name}.ogg`, data);
  console.log(`[materialize-sfx] ${source.name}.ogg ${data.length} bytes ${digest}`);
}

for (const source of SOURCES) await materialize(source);
