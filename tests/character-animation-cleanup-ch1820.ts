import assert from 'node:assert/strict';
import { readFile, readdir } from 'node:fs/promises';
import { inflateSync } from 'node:zlib';

const ASSETS = [
  'public/assets/characters/ch181/walk-cau-co-production-x4.png',
  'public/assets/characters/ch181/walk-lo-lang-production-x4.png',
  'public/assets/characters/ch181/walk-tang-dong-production-x4.png',
] as const;

const crcTable = new Uint32Array(256);
for (let n = 0; n < 256; n += 1) {
  let c = n;
  for (let k = 0; k < 8; k += 1) c = (c & 1) ? (0xedb88320 ^ (c >>> 1)) : (c >>> 1);
  crcTable[n] = c >>> 0;
}
function crc32(bytes: Buffer): number {
  let c = 0xffffffff;
  for (const byte of bytes) c = crcTable[(c ^ byte) & 0xff] ^ (c >>> 8);
  return (c ^ 0xffffffff) >>> 0;
}
function paeth(a: number, b: number, c: number): number {
  const p = a + b - c;
  const pa = Math.abs(p - a);
  const pb = Math.abs(p - b);
  const pc = Math.abs(p - c);
  return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
}
function decodeRgbaPng(png: Buffer) {
  assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
  let offset = 8;
  let width = 0;
  let height = 0;
  const idat: Buffer[] = [];
  let sawIend = false;
  while (offset < png.length) {
    const length = png.readUInt32BE(offset);
    const type = png.subarray(offset + 4, offset + 8).toString('ascii');
    const data = png.subarray(offset + 8, offset + 8 + length);
    const storedCrc = png.readUInt32BE(offset + 8 + length);
    const crcInput = Buffer.concat([png.subarray(offset + 4, offset + 8), data]);
    assert.equal(crc32(crcInput), storedCrc, `PNG CRC failed for ${type}`);
    if (type === 'IHDR') {
      width = data.readUInt32BE(0);
      height = data.readUInt32BE(4);
      assert.equal(data[8], 8, 'production PNG must be 8-bit');
      assert.equal(data[9], 6, 'production PNG must be RGBA');
      assert.equal(data[12], 0, 'production PNG must be non-interlaced');
    } else if (type === 'IDAT') {
      idat.push(data);
    } else if (type === 'IEND') {
      sawIend = true;
      break;
    }
    offset += 12 + length;
  }
  assert(sawIend, 'PNG must contain IEND');
  assert.equal(width, 1536);
  assert.equal(height, 192);

  const packed = inflateSync(Buffer.concat(idat));
  const bpp = 4;
  const stride = width * bpp;
  assert.equal(packed.length, (stride + 1) * height);
  const rgba = Buffer.alloc(stride * height);
  for (let y = 0; y < height; y += 1) {
    const packedRow = y * (stride + 1);
    const filter = packed[packedRow];
    const outRow = y * stride;
    for (let x = 0; x < stride; x += 1) {
      const raw = packed[packedRow + 1 + x];
      const left = x >= bpp ? rgba[outRow + x - bpp] : 0;
      const up = y > 0 ? rgba[outRow - stride + x] : 0;
      const upLeft = y > 0 && x >= bpp ? rgba[outRow - stride + x - bpp] : 0;
      let value = raw;
      if (filter === 1) value = (raw + left) & 0xff;
      else if (filter === 2) value = (raw + up) & 0xff;
      else if (filter === 3) value = (raw + Math.floor((left + up) / 2)) & 0xff;
      else if (filter === 4) value = (raw + paeth(left, up, upLeft)) & 0xff;
      else assert.equal(filter, 0, `unsupported PNG filter ${filter}`);
      rgba[outRow + x] = value;
    }
  }
  return { width, height, rgba };
}

for (const path of ASSETS) {
  const png = await readFile(path);
  const { width, height, rgba } = decodeRgbaPng(png);
  for (let frame = 0; frame < 8; frame += 1) {
    let minX = 192;
    let maxX = -1;
    let minY = height;
    let maxY = -1;
    for (let y = 0; y < height; y += 1) {
      for (let x = 0; x < 192; x += 1) {
        const globalX = frame * 192 + x;
        const alpha = rgba[(y * width + globalX) * 4 + 3];
        if (alpha > 0) {
          minX = Math.min(minX, x);
          maxX = Math.max(maxX, x);
          minY = Math.min(minY, y);
          maxY = Math.max(maxY, y);
        }
      }
    }
    assert(maxX >= 0, `${path} frame ${frame} is empty`);
    assert(minX >= 32 && maxX <= 159, `${path} frame ${frame} leaks toward a cell edge`);
    assert(minY <= 12, `${path} frame ${frame} is vertically undersized`);
    assert(maxY >= 169 && maxY <= 179, `${path} frame ${frame} baseline drifted`);
    for (let y = 0; y < height; y += 1) {
      assert.equal(rgba[(y * width + frame * 192) * 4 + 3], 0, `${path} frame ${frame} touches left edge`);
      assert.equal(rgba[(y * width + frame * 192 + 191) * 4 + 3], 0, `${path} frame ${frame} touches right edge`);
    }
  }
}

const sourceFiles = await readdir('scripts/assets/ch181');
assert(
  !sourceFiles.some((name) => name.startsWith('walk-cau-co-production-')),
  'corrupt CAU CÓ base64 chunk pipeline must stay removed',
);

console.log('[character-animation-cleanup-ch1820] PASS CRC-valid PNGs + clean per-frame alpha separation + stable baseline');
