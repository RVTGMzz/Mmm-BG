import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';
import {
  CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181,
  characterProductionPortraitCh181,
} from '../src/ui/characterProductionArtCh181';

const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');
const css = await readFile('src/characterSelectCh02c.css', 'utf8');
const atlas = await readFile('public/assets/characters/ch181/portraits.webp');

assert.equal(atlas.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(atlas.subarray(8, 12).toString('ascii'), 'WEBP');
assert.ok(atlas.length > 20_000, 'CH-18.1 portrait atlas must contain real Character pixels');
assert.equal(CHARACTER_PRODUCTION_PORTRAIT_ATLAS_CH181, './assets/characters/ch181/portraits.webp');

const expected = [
  ['starter-crybaby', 'female', 55, 65, 0],
  ['starter-grumpy', 'male', 40, 50, 1],
  ['starter-anxious', 'male', 28, 35, 2],
  ['starter-hyper', 'female', 18, 24, 3],
] as const;

for (const [id, gender, min, max, row] of expected) {
  const character = STARTER_CHARACTERS_V01.find((item) => item.id === id);
  assert(character, id);
  assert.equal(character.genderPresentation, gender, id);
  assert.deepEqual(character.ageBand, { min, max }, id);
  const portrait = characterProductionPortraitCh181(id, 'neutral');
  assert.equal(portrait?.row, row, id);
  assert.equal(portrait?.column, 0, id);
}

const secret = characterProductionPortraitCh181('secret-baby', 'passive');
assert.equal(secret?.row, 4);
assert.equal(secret?.column, 7);

assert(setup.includes('characterProductionPortraitCh181(character.id'), 'starter cards must render production portraits');
assert(setup.includes('character-production-portrait-ch181'));
assert(!setup.includes('assets/characters/secret-baby'), 'normal Character Select must not preload Secret-specific path');
assert(!setup.includes('EM BÉ BÁ ĐẠO'), 'normal Character Select must not reveal Secret identity');
assert(css.includes('.character-production-portrait-ch181'));
assert(css.includes('width: 800%'));
assert(!setup.includes('Math.random()'));

console.log('[character-production-ch181] PASS approved starter demographics + real portrait atlas + Secret-safe Character Select');
