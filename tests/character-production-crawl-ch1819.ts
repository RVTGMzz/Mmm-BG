import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import {
  SECRET_BABY_CHARACTER_ID,
  SECRET_BABY_V01,
} from '../src/content/core/character_secret_baby_v01';
import { CHARACTER_WALK_PRODUCTION_SOURCES_CH1812 } from '../src/content/core/character_walk_production_sources_ch1812';
import { SECRET_BABY_VISUAL_CANON_CH1819 } from '../src/content/core/character_visual_canon_ch1819';

assert.equal(SECRET_BABY_CHARACTER_ID, 'secret-baby');
assert.equal(SECRET_BABY_V01.randomOnly, true);
assert.equal(SECRET_BABY_V01.directSelectable, false);
assert.equal(SECRET_BABY_V01.agePresentation, 'infant');
assert(SECRET_BABY_V01.presentationTags.includes('style:baby-crawl'));
assert(SECRET_BABY_V01.presentationTags.includes('silhouette:crawling'));
assert(SECRET_BABY_V01.presentationTags.includes('prop:pacifier'));

const canon = SECRET_BABY_VISUAL_CANON_CH1819;
assert.equal(canon.agePresentation, 'infant');
assert.equal(canon.repoAuthority.portraitAtlasPath, 'public/assets/characters/ch181/portrait-atlas-secret-baby.webp');
assert.equal(canon.repoAuthority.legacyWalkAtlasPath, 'public/assets/characters/ch181/walk-atlas.webp');
assert.equal(canon.repoAuthority.legacyWalkRow, 4);

const portrait = await readFile(canon.repoAuthority.portraitAtlasPath);
assert.equal(
  createHash('sha256').update(portrait).digest('hex'),
  canon.repoAuthority.portraitAtlasSha256,
  'SECRET BABY production must stay visually anchored to the repo portrait authority',
);

const legacyWalk = await readFile(canon.repoAuthority.legacyWalkAtlasPath);
assert.equal(
  createHash('sha256').update(legacyWalk).digest('hex'),
  canon.repoAuthority.legacyWalkAtlasSha256,
  'SECRET BABY movement silhouette authority changed unexpectedly',
);

for (const anchor of [
  'bald infant head',
  'small gold crown',
  'gold pacifier',
  'red cape trailing behind the body',
  'very low crawling silhouette',
  'short infant limbs',
  'bossy narrowed-eye expression',
  'tiny rounded infant body',
]) {
  assert(canon.requiredVisualAnchors.includes(anchor), anchor);
}

const assetPath = 'public/assets/characters/ch181/walk-secret-baby-production-x4.png';
const png = await readFile(assetPath);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'SECRET BABY strip must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'SECRET BABY strip must contain 8 × 192px frames');
assert.equal(png.readUInt32BE(20), 192, 'SECRET BABY strip must be 192px tall');
assert.equal(png.length, 363_723, 'SECRET BABY production strip bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(png).digest('hex'),
  '5b00136a4077703e9ebe3d7116f243e1330aadba04fd9b4acf94035ca4125a0c',
  'SECRET BABY repo-matched production strip fingerprint changed unexpectedly',
);

const production = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812.find(
  (item) => item.characterId === 'secret-baby',
);
assert(production);
assert.equal(production.status, 'runtime-production-strip');
assert.equal(production.productionAssetPath, 'assets/characters/ch181/walk-secret-baby-production-x4.png');
assert.equal(production.frameWidth, 192);
assert.equal(production.frameHeight, 192);
assert.equal(production.frameCount, 8);

const board = await readFile('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
assert(board.includes("const SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819 = 'character-crawl-secret-baby-production-ch1819';"));
assert(board.includes("const SECRET_BABY_PRODUCTION_CRAWL_PATH_CH1819 = 'assets/characters/ch181/walk-secret-baby-production-x4.png';"));
assert(board.includes("player.characterId === 'secret-baby'"));
assert(board.includes('this.textures.exists(SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819)'));
assert(board.includes('walkTextureKeyCh1811 = SECRET_BABY_PRODUCTION_CRAWL_KEY_CH1819'));
assert(board.includes('this.applyCharacterIdleBreathCh1813(sprite, playerId)'));
assert(board.includes('CHARACTER_FOOT_RING_Y_CH189 = 31'));
assert(board.includes('visual.token.addAt(footRing, 0)'));
assert(board.includes('visual.token.addAt(sprite, 1)'));
assert(!board.includes('Math.random()'));

const remainingFallback = CHARACTER_WALK_PRODUCTION_SOURCES_CH1812
  .filter((item) => item.status === 'awaiting-genuine-strip')
  .map((item) => item.characterId);
assert.deepEqual(remainingFallback, []);

console.log('[character-production-crawl-ch1819] PASS repo-standard SECRET BABY infant crawl + RANDOM-only contract + runtime routing');
