import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

const grumpy = STARTER_CHARACTERS_V01.find((item) => item.id === 'starter-grumpy');
assert(grumpy, 'CAU CÓ canon missing');
assert.equal(grumpy.genderPresentation, 'male');
assert.deepEqual(grumpy.ageBand, { min: 40, max: 50 });
assert.equal(grumpy.styleDirection, 'Chỉnh tề, sắc cạnh, màu gọn; silhouette thẳng và hơi khó gần.');
assert(grumpy.presentationTags.includes('style:sharp-tailored'));
assert(grumpy.presentationTags.includes('silhouette:upright-angular'));

const grumpyWalk = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'starter-grumpy',
);
assert(grumpyWalk, 'CAU CÓ walk source contract missing');
assert.equal(grumpyWalk.status, 'awaiting-genuine-strip');
assert.equal(grumpyWalk.productionAssetPath, undefined, 'wrong/non-canon CAU CÓ art must not be cut over');

assert(board.includes('const CHARACTER_IDLE_BREATH_PERIOD_CH1813 = 2200;'));
assert(board.includes('const CHARACTER_IDLE_BREATH_RISE_CH1813 = 1.1;'));
assert(board.includes('const CHARACTER_IDLE_BREATH_SCALE_X_CH1813 = 0.003;'));
assert(board.includes('const CHARACTER_IDLE_BREATH_SCALE_Y_CH1813 = 0.012;'));
assert(board.includes('applyCharacterIdleBreathCh1813'));
assert(board.includes('resetCharacterIdleBreathCh1813'));
assert(board.includes("setData('idleBaseScaleXCh1813'"));
assert(board.includes("setData('idleBaseScaleYCh1813'"));
assert(board.includes('this.applyCharacterIdleBreathCh1813(sprite, playerId)'));
assert(board.includes('this.applyCharacterIdleBreathCh1813(faceComposite, playerId)'));
assert(board.includes('this.resetCharacterIdleBreathCh1813(sprite)'));
assert(board.includes('this.resetCharacterIdleBreathCh1813(faceComposite)'));

assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(!board.includes('Math.random()'));

console.log('[character-idle-breath-ch1813] PASS canon CAU CÓ remains fallback-only + all board Character visuals breathe while idle');
