import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CHARACTER_WALK_PRODUCTION_FRAME_CH1812,
  CHARACTER_WALK_PRODUCTION_FRAMES_CH1812,
  CHARACTER_WALK_PRODUCTION_SOURCES_CH1812,
} from '../src/content/core/character_walk_production_sources_ch1812';

assert.equal(CHARACTER_WALK_PRODUCTION_FRAME_CH1812, 192);
assert.equal(CHARACTER_WALK_PRODUCTION_FRAMES_CH1812, 8);
assert.equal(CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.length, 5);

assert.deepEqual(
  CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.map((item) => item.characterId),
  ['starter-crybaby', 'starter-grumpy', 'starter-anxious', 'starter-hyper', 'secret-baby'],
);
assert.deepEqual(
  CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.map((item) => item.fallbackRow),
  [0, 1, 2, 3, 4],
);

const productionReady = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.filter(
  (item) => item.status === 'runtime-production-strip',
);
assert.equal(productionReady.length, 3, 'KHÓC NHÈ, CAU CÓ and LO LẮNG have approved production walk strips');
assert.deepEqual(
  productionReady.map((item) => item.characterId),
  ['starter-crybaby', 'starter-grumpy', 'starter-anxious'],
);
assert.deepEqual(
  productionReady.map((item) => item.productionAssetPath),
  [
    'assets/characters/ch181/walk-khoc-nhe-production-x4.png',
    'assets/characters/ch181/walk-cau-co-production-x4.png',
    'assets/characters/ch181/walk-lo-lang-production-x4.png',
  ],
);

const pending = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.filter(
  (item) => item.status === 'awaiting-genuine-strip',
);
assert.deepEqual(
  pending.map((item) => item.characterId),
  ['starter-hyper', 'secret-baby'],
);
for (const item of pending) {
  assert.equal(item.productionAssetPath, undefined, `${item.canonicalLabel} must stay fallback-only`);
  assert.equal(item.genuineHighResolutionSourceRequired, true);
}

const png = await readFile('public/assets/characters/ch181/walk-khoc-nhe-production-x4.png');
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10]);
assert.equal(png.readUInt32BE(16), 192 * 8);
assert.equal(png.readUInt32BE(20), 192);
assert.ok(png.length > 200_000, 'approved production strip unexpectedly small');

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(board.includes("player.characterId === 'starter-crybaby'"));
assert(board.includes('let walkTextureKeyCh1811 = CHARACTER_HQ_ATLAS_KEY_CH189;'));
assert(board.includes('walkTextureKeyCh1811 = CRYBABY_PRODUCTION_WALK_KEY_CH1811'));
assert(board.includes('walkTextureKeyCh1811 = GRUMPY_PRODUCTION_WALK_KEY_CH1816'));
assert(board.includes('walkTextureKeyCh1811 = ANXIOUS_PRODUCTION_WALK_KEY_CH1817'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(board.includes("player.characterId === 'starter-grumpy'"));
assert(board.includes('GRUMPY_PRODUCTION_WALK_KEY_CH1816'));
assert(board.includes("player.characterId === 'starter-anxious'"));
assert(board.includes('ANXIOUS_PRODUCTION_WALK_KEY_CH1817'));
assert(!board.includes("player.characterId === 'starter-hyper'\n        && this.textures.exists"));
assert(!board.includes("player.characterId === 'secret-baby'\n        && this.textures.exists"));
assert(!board.includes('Math.random()'));

console.log('[character-production-source-ch1812] PASS KHÓC NHÈ + CAU CÓ + LO LẮNG production strips; remaining cast stays fallback-only');
