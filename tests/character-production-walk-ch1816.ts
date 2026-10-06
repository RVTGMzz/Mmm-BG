import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { CAU_CO_VISUAL_CANON_CH1814 } from '../src/content/core/character_visual_canon_ch1814';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';

const assetPath = 'public/assets/characters/ch181/walk-cau-co-production-x4.png';
const png = await readFile(assetPath);

assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'CAU CÓ strip must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'CAU CÓ strip must contain 8 × 192px frames');
assert.equal(png.readUInt32BE(20), 192, 'CAU CÓ strip must be 192px tall');
assert.equal(png.length, 239_574, 'CAU CÓ production strip bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(png).digest('hex'),
  'a93b1b7b642f9a4da6f32f8ad7e52a80f9cbb9e828f1bebeb0544dd5012a9504',
  'CAU CÓ production strip hash changed unexpectedly',
);

const source = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'starter-grumpy',
);
assert(source);
assert.equal(source.status, 'runtime-production-strip');
assert.equal(source.productionAssetPath, 'assets/characters/ch181/walk-cau-co-production-x4.png');
assert.equal(source.frameWidth, 192);
assert.equal(source.frameHeight, 192);
assert.equal(source.frameCount, 8);

assert.equal(CAU_CO_VISUAL_CANON_CH1814.ageGender, 'male 40-50');
assert.equal(CAU_CO_VISUAL_CANON_CH1814.conceptAuthority.repoAssetPath, 'docs/character-production/canon/cauco.webp');

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(board.includes("const GRUMPY_PRODUCTION_WALK_KEY_CH1816 = 'character-walk-grumpy-production-ch1816';"));
assert(board.includes("const GRUMPY_PRODUCTION_WALK_PATH_CH1816 = 'assets/characters/ch181/walk-cau-co-production-x4.png';"));
assert(board.includes("player.characterId === 'starter-grumpy'"));
assert(board.includes('this.textures.exists(GRUMPY_PRODUCTION_WALK_KEY_CH1816)'));
assert(board.includes('walkTextureKeyCh1811 = GRUMPY_PRODUCTION_WALK_KEY_CH1816'));
assert(board.includes("setData('productionWalkCh1811', walkTextureKeyCh1811 !== CHARACTER_HQ_ATLAS_KEY_CH189)"));
assert(board.includes('this.applyCharacterIdleBreathCh1813(sprite, playerId)'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));

const remainingFallback = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812
  .filter((item) => item.status === 'awaiting-genuine-strip')
  .map((item) => item.characterId);
assert.deepEqual(remainingFallback, []);

console.log('[character-production-walk-ch1816] PASS CAU CÓ 8x192 production strip + runtime cut-over + idle/ring contract');
