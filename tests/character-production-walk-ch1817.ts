import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';
import { LO_LANG_VISUAL_CANON_CH1817 } from '../src/content/core/character_visual_canon_ch1817';

const starter = STARTER_CHARACTERS_V01.find((item) => item.id === 'starter-anxious');
assert(starter, 'LO LẮNG starter canon missing');
assert.equal(starter.genderPresentation, 'male');
assert.deepEqual(starter.ageBand, { min: 28, max: 35 });

const authority = LO_LANG_VISUAL_CANON_CH1817.conceptAuthority;
assert.equal(authority.repoAssetPath, 'docs/character-production/canon/lolang.webp');
assert.equal(authority.driveFileName, 'lolang.webp');
assert.equal(authority.driveFileId, '1PLBsvV5_d0fvda4K7od9dv_de7M-H8qq');
assert.equal(authority.width, 1122);
assert.equal(authority.height, 1402);

const concept = await readFile(authority.repoAssetPath);
assert.equal(concept.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(concept.subarray(8, 12).toString('ascii'), 'WEBP');
assert.equal(concept.length, 212_632);
assert.equal(
  createHash('sha256').update(concept).digest('hex'),
  'e1a6ccd8e7586584949b34fb9a227ba2cdfc4f91bb0c88bcce880a2eb8ada964',
);

for (const anchor of [
  'messy voluminous brown hair',
  'large dark rectangular glasses',
  'dark teal / forest-green planner-core top',
  'wide cream-beige trousers',
  'green-and-cream sneakers',
  'large brown organizer satchel and backpack system',
  'multiple planners / notebooks / checklists',
  'water bottle',
  'small dangling character keychain',
]) {
  assert(LO_LANG_VISUAL_CANON_CH1817.requiredVisualAnchors.includes(anchor), anchor);
}

const assetPath = 'public/assets/characters/ch181/walk-lo-lang-production-x4.png';
const png = await readFile(assetPath);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'LO LẮNG strip must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'LO LẮNG strip must contain 8 × 192px frames');
assert.equal(png.readUInt32BE(20), 192, 'LO LẮNG strip must be 192px tall');
assert.equal(png.length, 36_742, 'LO LẮNG production strip bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(png).digest('hex'),
  'c112d1ced88c11d41bd59a71cb2bd1683655803e827912c5079cd103f3da0497',
  'LO LẮNG production strip fingerprint changed unexpectedly',
);

const production = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'starter-anxious',
);
assert(production);
assert.equal(production.status, 'runtime-production-strip');
assert.equal(production.productionAssetPath, 'assets/characters/ch181/walk-lo-lang-production-x4.png');
assert.equal(production.frameWidth, 192);
assert.equal(production.frameHeight, 192);
assert.equal(production.frameCount, 8);

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(board.includes("const ANXIOUS_PRODUCTION_WALK_KEY_CH1817 = 'character-walk-anxious-production-ch1817';"));
assert(board.includes("const ANXIOUS_PRODUCTION_WALK_PATH_CH1817 = 'assets/characters/ch181/walk-lo-lang-production-x4.png';"));
assert(board.includes("player.characterId === 'starter-anxious'"));
assert(board.includes('this.textures.exists(ANXIOUS_PRODUCTION_WALK_KEY_CH1817)'));
assert(board.includes('walkTextureKeyCh1811 = ANXIOUS_PRODUCTION_WALK_KEY_CH1817'));
assert(board.includes('this.applyCharacterIdleBreathCh1813(sprite, playerId)'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(!board.includes('Math.random()'));

const remainingFallback = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812
  .filter((item) => item.status === 'awaiting-genuine-strip')
  .map((item) => item.characterId);
assert.deepEqual(remainingFallback, []);

console.log('[character-production-walk-ch1817] PASS LO LẮNG 8x192 production strip + canon + runtime + idle/ring contract');
