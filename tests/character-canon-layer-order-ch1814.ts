import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';
import { CHARACTER_ART_MANIFESTS_V01 } from '../src/content/core/character_art_manifest_v01';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';
import { CAU_CO_VISUAL_CANON_CH1814 } from '../src/content/core/character_visual_canon_ch1814';

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');

const starter = STARTER_CHARACTERS_V01.find((item) => item.id === 'starter-grumpy');
assert(starter);
assert.equal(starter.genderPresentation, 'male');
assert.deepEqual(starter.ageBand, { min: 40, max: 50 });
assert(starter.presentationTags.includes('style:sharp-tailored'));
assert(starter.presentationTags.includes('silhouette:upright-angular'));

const art = CHARACTER_ART_MANIFESTS_V01.find((item) => item.characterId === 'starter-grumpy');
assert(art);
assert.equal(art.concept.driveFileName, 'cauco.webp');
assert.equal(art.concept.driveFileId, '1dZ6Ruav4nnaDy371hrBwTGR-hNkMnUnf');
assert.equal(art.concept.approved, true);

assert.equal(CAU_CO_VISUAL_CANON_CH1814.characterId, 'starter-grumpy');
assert.equal(CAU_CO_VISUAL_CANON_CH1814.ageGender, 'male 40-50');
for (const anchor of [
  'thin gold rectangular glasses',
  'brown crown-pattern tie',
  'dark olive pinstripe jacket draped over the shoulders',
  'high-waisted brown tailored trousers',
  'structured brown leather work bag',
]) {
  assert(CAU_CO_VISUAL_CANON_CH1814.requiredVisualAnchors.includes(anchor), anchor);
}
for (const forbidden of ['tank top or sleeveless undershirt', 'shorts', 'sandals or flip-flops']) {
  assert(CAU_CO_VISUAL_CANON_CH1814.forbiddenDrift.includes(forbidden), forbidden);
}

const walk = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find((item) => item.characterId === 'starter-grumpy');
assert(walk);
assert.equal(walk.status, 'awaiting-genuine-strip');
assert.equal(walk.productionAssetPath, undefined);

assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(board.includes('visual.token.addAt(composite, 1)'));
assert(board.includes('visual.token.addAt(image, 1)'));
assert(!board.includes('visual.token.addAt(image, 0)'));

console.log('[character-canon-layer-order-ch1814] PASS CAU CÓ canon locked + all Character bodies stay above foot ring');
