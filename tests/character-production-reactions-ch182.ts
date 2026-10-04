import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182,
  characterProductionPortraitFrameCh182,
} from '../src/ui/characterProductionArtCh181';

assert.equal(CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182, 'character-portrait-atlas-ch182');
assert.equal(characterProductionPortraitFrameCh182('starter-crybaby', 'neutral'), 0);
assert.equal(characterProductionPortraitFrameCh182('starter-grumpy', 'happy'), 9);
assert.equal(characterProductionPortraitFrameCh182('starter-anxious', 'angry'), 18);
assert.equal(characterProductionPortraitFrameCh182('starter-hyper', 'panic'), 27);
assert.equal(characterProductionPortraitFrameCh182('secret-baby', 'passive'), 39);
assert.equal(characterProductionPortraitFrameCh182(undefined, 'neutral'), undefined);

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const layer = await readFile('src/ui/MatchPresentationLayer.ts', 'utf8');
const sequencer = await readFile('src/ui/ReactionSequencer.ts', 'utf8');

assert(board.includes('CHARACTER_PRODUCTION_PORTRAIT_TEXTURE_CH182'));
assert(board.includes('CHARACTER_PRODUCTION_PORTRAIT_CELL_CH181'));
assert(layer.includes("setName('character-production-reaction-avatar-ch182')"));
assert(layer.includes('gameSession.getFace(playerId, expression)'));
assert(layer.indexOf('gameSession.getFace(playerId, expression)') < layer.indexOf('characterProductionPortraitFrameCh182'),
  'uploaded player face must stay higher priority than Character portrait fallback');
assert(sequencer.includes("setName('character-production-reaction-avatar-ch182')"));
assert(!layer.includes('Math.random()'));
assert(!sequencer.includes('Math.random()'));

console.log('[character-production-reactions-ch182] PASS custom-face priority + canonical Character portrait fallback');
