import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CHARACTER_PRODUCTION_SHEETS_CH181,
  CHARACTER_WALK_CROP_CH181,
} from '../src/content/core/characterProductionAssetsCh181';

assert.deepEqual(Object.keys(CHARACTER_PRODUCTION_SHEETS_CH181).sort(), [
  'secret-baby','starter-anxious','starter-crybaby','starter-grumpy','starter-hyper',
]);
for (const [id, asset] of Object.entries(CHARACTER_PRODUCTION_SHEETS_CH181)) {
  assert.match(asset.dataUrl, /^data:image\/webp;base64,/u, `${id} must embed the approved WebP concept sheet`);
  assert.ok(asset.dataUrl.length > 100_000, `${id} concept payload unexpectedly small`);
}
assert.equal(CHARACTER_WALK_CROP_CH181.frames, 8);

const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');
const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(setup.includes('character-production-preview-ch181'));
assert(setup.includes('characterProductionSheetCh181(character.id)'));
assert(!setup.includes("characterProductionSheetCh181('secret-baby')"), 'normal selection must not reveal Secret Baby');
assert(board.includes('installCharacterProductionTokensCh181'));
assert(board.includes('syncCharacterProductionTokensCh181'));
assert(board.includes('setCrop(walk.x + frame * walk.stepX'));
assert(board.includes('setFlipX(dx < 0)'));

console.log('[character-production-ch181] PASS approved sheets + Character Select previews + 8-frame board walk animation');
