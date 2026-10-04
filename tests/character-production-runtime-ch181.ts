import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const walk = await readFile('public/assets/characters/ch181/walk-atlas.webp');

assert.equal(walk.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(walk.subarray(8, 12).toString('ascii'), 'WEBP');
assert.ok(walk.length > 20_000, 'CH-18.1 walk atlas must contain real Character pixels');

assert(board.includes("'character-walk-atlas-ch181'"));
assert(board.includes("publicAssetUrl('assets/characters/ch181/walk-atlas.webp')"));
assert(board.includes('{ frameWidth: 48, frameHeight: 48 }'));
assert(board.includes("if (characterId === 'starter-crybaby') return 0;"));
assert(board.includes("if (characterId === 'starter-grumpy') return 1;"));
assert(board.includes("if (characterId === 'starter-anxious') return 2;"));
assert(board.includes("if (characterId === 'starter-hyper') return 3;"));
assert(board.includes("if (characterId === 'secret-baby') return 4;"));
assert(board.includes('Math.floor(this.time.now / 90) % 8'));
assert(board.includes('sprite.setFlipX(dx < 0)'));
assert(!board.includes('Math.random()'), 'CH-18.1 presentation runtime must not introduce client RNG');

console.log('[character-production-runtime-ch181] PASS 5-row 8-frame board walk atlas + presentation-only movement');
