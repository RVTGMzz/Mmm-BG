import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const svg = await readFile('public/assets/characters/ch181/walk-atlas-hq-x4.svg', 'utf8');
const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

assert(svg.includes('width="1536" height="960"'));
assert(svg.includes('8 columns × 5 rows'));
assert.equal((svg.match(/width="192" height="192"/g) ?? []).length, 40);
assert.equal((svg.match(/data:image\/webp;base64,/g) ?? []).length, 40);
assert.equal((svg.match(/<use href="#walk-source"\/>/g) ?? []).length, 40);\nassert(svg.includes('viewBox="0 0 48 48"'));
assert(svg.includes('viewBox="336 192 48 48"'));

assert(board.includes("publicAssetUrl('assets/characters/ch181/walk-atlas-hq-x4.svg')"));
assert(board.includes('{ frameWidth: CHARACTER_HQ_FRAME_CH189, frameHeight: CHARACTER_HQ_FRAME_CH189 }'));
assert(!board.includes('materializeCharacterHqAtlasCh189'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('CHARACTER_FOOT_RING_HEIGHT_CH189 = 18'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(!board.includes('Math.random()'));

console.log('[character-hq-asset-ch1810] PASS persistent 1536x960 x4 atlas + under-foot ring');
