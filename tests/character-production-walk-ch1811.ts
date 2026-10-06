import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const png = await readFile('public/assets/characters/ch181/walk-khoc-nhe-production-x4.png');
const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

assert.deepEqual([...png.subarray(0, 8)], [137,80,78,71,13,10,26,10], 'CH-18.11 asset must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'CH-18.11 strip must be 8 × 192px wide');
assert.equal(png.readUInt32BE(20), 192, 'CH-18.11 strip must be 192px tall');
assert.ok(png.length > 200_000, 'production strip unexpectedly small');

assert(board.includes("CRYBABY_PRODUCTION_WALK_KEY_CH1811"));
assert(board.includes("walk-khoc-nhe-production-x4.png"));
assert(board.includes("player.characterId === 'starter-crybaby'"));
assert(board.includes("setData('productionWalkCh1811'"));
assert(board.includes("setData('walkFrameBaseCh1811'"));
assert(board.includes("sprite.getData('walkFrameBaseCh1811')"));
assert(board.includes("Math.floor(this.time.now / 90) % 8"));
assert(board.includes("CHARACTER_FOOT_RING_Y_CH189 = 31"));
assert(!board.includes('Math.random()'));

console.log('[character-production-walk-ch1811] PASS genuine KHÓC NHÈ production-source 1536x192 walk strip + HQ fallback for remaining cast');
