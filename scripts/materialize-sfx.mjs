import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  { name: 'news', chunks: 6 },
  { name: 'victory', chunks: 7 },
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function validateOgg(name, data) {
  let offset = 0;
  let pages = 0;
  let lastHeaderType = 0;

  while (offset < data.length) {
    if (offset + 27 > data.length) {
      throw new Error(`${name}.ogg truncated Ogg page header at byte ${offset}`);
    }
    if (data.subarray(offset, offset + 4).toString('ascii') !== 'OggS') {
      throw new Error(`${name}.ogg invalid Ogg capture pattern at byte ${offset}`);
    }
    if (data[offset + 4] !== 0) {
      throw new Error(`${name}.ogg unsupported Ogg stream version ${data[offset + 4]}`);
    }

    const headerType = data[offset + 5];
    const segmentCount = data[offset + 26];
    const segmentTableEnd = offset + 27 + segmentCount;
    if (segmentTableEnd > data.length) {
      throw new Error(`${name}.ogg truncated segment table at byte ${offset}`);
    }

    let payloadSize = 0;
    for (let i = offset + 27; i < segmentTableEnd; i += 1) payloadSize += data[i];
    const pageEnd = segmentTableEnd + payloadSize;
    if (pageEnd > data.length) {
      throw new Error(`${name}.ogg truncated page payload at byte ${offset}`);
    }

    pages += 1;
    lastHeaderType = headerType;
    offset = pageEnd;
  }

  if (pages < 2) throw new Error(`${name}.ogg has too few Ogg pages: ${pages}`);
  if ((lastHeaderType & 0x04) === 0) {
    throw new Error(`${name}.ogg final page has no EOS flag; file may be truncated`);
  }
  return pages;
}

async function materialize(source) {
  const chunks = [];
  for (let index = 0; index < source.chunks; index += 1) {
    const suffix = String(index).padStart(2, '0');
    chunks.push(await readFile(`scripts/audio-src/${source.name}.${suffix}.b64`, 'utf8'));
  }

  const encoded = chunks.join('').replace(/\s+/g, '');
  const data = Buffer.from(encoded, 'base64');
  const pages = validateOgg(source.name, data);
  const digest = sha256(data);

  await mkdir('public/audio/sfx', { recursive: true });
  await writeFile(`public/audio/sfx/${source.name}.ogg`, data);
  console.log(`[materialize-sfx] ${source.name}.ogg bytes=${data.length} pages=${pages} sha256=${digest} ogg=PASS`);
}

for (const source of SOURCES) await materialize(source);
