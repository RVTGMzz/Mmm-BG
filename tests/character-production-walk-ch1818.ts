import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';
import { TANG_DONG_VISUAL_CANON_CH1818 } from '../src/content/core/character_visual_canon_ch1818';

const starter = STARTER_CHARACTERS_V01.find((item) => item.id === 'starter-hyper');
assert(starter, 'TĂNG ĐỘNG starter canon missing');
assert.equal(starter.genderPresentation, 'female');
assert.deepEqual(starter.ageBand, { min: 18, max: 24 });
assert.equal(
  starter.styleDirection,
  'Streetwear/sporty, màu sáng, sticker và phụ kiện chuyển động; silhouette nghiêng, bật, luôn có momentum.',
);

const authority = TANG_DONG_VISUAL_CANON_CH1818.conceptAuthority;
assert.equal(authority.repoAssetPath, 'docs/character-production/canon/tangdong.webp');
assert.equal(authority.driveFileName, 'tangdong.webp');
assert.equal(authority.driveFileId, '1zjtCwUM3oh2_wsa9M7Ys7Msif9i2XYv5');
assert.equal(authority.width, 1122);
assert.equal(authority.height, 1402);

const concept = await readFile(authority.repoAssetPath);
assert.equal(concept.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(concept.subarray(8, 12).toString('ascii'), 'WEBP');
assert.equal(concept.length, 240_936);
assert.equal(
  createHash('sha256').update(concept).digest('hex'),
  '8bd94dc4cb712fe00dceec59ca68deb77069e79b04d6ee4f7d5aeb4c8c84dd5f',
);

for (const anchor of [
  'messy brown double-bun / twin-bun hair',
  'colorful sunglasses resting on top of the head',
  'pink-and-white headphones',
  'oversized yellow / pink / teal sticker-covered jacket',
  'white cropped top',
  'black athletic shorts with white trim',
  'chunky multicolor sneakers',
  'teal sticker-covered backpack',
  'bunny charms and dangling keychains',
  'small handheld game device',
]) {
  assert(TANG_DONG_VISUAL_CANON_CH1818.requiredVisualAnchors.includes(anchor), anchor);
}

const assetPath = 'public/assets/characters/ch181/walk-tang-dong-production-x4.png';
const png = await readFile(assetPath);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'TĂNG ĐỘNG strip must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'TĂNG ĐỘNG strip must contain 8 × 192px frames');
assert.equal(png.readUInt32BE(20), 192, 'TĂNG ĐỘNG strip must be 192px tall');
assert.equal(png.length, 310_854, 'TĂNG ĐỘNG production strip bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(png).digest('hex'),
  '98a4ab0c84ff399ed4c846e2adafe80892125ddc7373a03d1414b5de546538c9',
  'TĂNG ĐỘNG production strip fingerprint changed unexpectedly',
);

const production = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'starter-hyper',
);
assert(production);
assert.equal(production.status, 'runtime-production-strip');
assert.equal(production.productionAssetPath, 'assets/characters/ch181/walk-tang-dong-production-x4.png');
assert.equal(production.frameWidth, 192);
assert.equal(production.frameHeight, 192);
assert.equal(production.frameCount, 8);

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(board.includes("const HYPER_PRODUCTION_WALK_KEY_CH1818 = 'character-walk-hyper-production-ch1818';"));
assert(board.includes("const HYPER_PRODUCTION_WALK_PATH_CH1818 = 'assets/characters/ch181/walk-tang-dong-production-x4.png';"));
assert(board.includes("player.characterId === 'starter-hyper'"));
assert(board.includes('this.textures.exists(HYPER_PRODUCTION_WALK_KEY_CH1818)'));
assert(board.includes('walkTextureKeyCh1811 = HYPER_PRODUCTION_WALK_KEY_CH1818'));
assert(board.includes('this.applyCharacterIdleBreathCh1813(sprite, playerId)'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(!board.includes('Math.random()'));

const remainingFallback = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812
  .filter((item) => item.status === 'awaiting-genuine-strip')
  .map((item) => item.characterId);
assert.deepEqual(remainingFallback, ['secret-baby']);

console.log('[character-production-walk-ch1818] PASS TĂNG ĐỘNG 8x192 production strip + canon + runtime + idle/ring contract');
