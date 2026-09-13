import { createHash } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';

const SOURCES = [
  {
    name: 'news',
    chunks: 6,
    size: 4192,
    sha256: 'a9901b41245a2a118c0a007af8b0fc35561939f673245a0ea728f0d4f406cd2e',
  },
  {
    name: 'victory',
    chunks: 7,
    size: 4666,
    sha256: '4be8669448d283a1747f32195da0235e6267100f9461d2d9093adedf25d9bd98',
  },
];

function sha256(buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function findOggEos(name, data) {
  let offset = 0;
  let pages = 0;

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
    offset = pageEnd;
    if ((headerType & 0x04) !== 0) return { end: pageEnd, pages };
  }

  throw new Error(`${name}.ogg has no EOS page; file may be truncated`);
}

async function materialize(source) {
  const chunks = [];
  for (let index = 0; index < source.chunks; index += 1) {
    const suffix = String(index).padStart(2, '0');
    chunks.push(await readFile(`scripts/audio-src/${source.name}.${suffix}.b64`, 'utf8'));
  }

  const encoded = chunks.join('').replace(/\s+/g, '');
  const decoded = Buffer.from(encoded, 'base64');
  const { end, pages } = findOggEos(source.name, decoded);
  const data = decoded.subarray(0, end);
  const trailingBytes = decoded.length - end;
  const digest = sha256(data);

  if (data.length !== source.size) {
    throw new Error(`${source.name}.ogg EOS size mismatch: expected ${source.size}, got ${data.length}`);
  }
  if (digest !== source.sha256) {
    throw new Error(`${source.name}.ogg SHA256 mismatch: expected ${source.sha256}, got ${digest}`);
  }

  await mkdir('public/audio/sfx', { recursive: true });
  await writeFile(`public/audio/sfx/${source.name}.ogg`, data);
  console.log(
    `[materialize-sfx] ${source.name}.ogg bytes=${data.length} pages=${pages} sha256=${digest} ` +
      `trimmedTrailingBytes=${trailingBytes} ogg=PASS`,
  );
}

for (const source of SOURCES) await materialize(source);
