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

const authority = SECRET_BABY_VISUAL_CANON_CH1819.conceptAuthority;
assert.equal(authority.repoAssetPath, 'docs/character-production/canon/embe.webp');
assert.equal(authority.driveFileName, 'embe.webp');
assert.equal(authority.driveFileId, '1vJIkKjMhqZSHfQ3hylYF39XxfpBYYGrv');
assert.equal(authority.width, 1122);
assert.equal(authority.height, 1402);
assert.equal(SECRET_BABY_VISUAL_CANON_CH1819.agePresentation, 'infant');

const concept = await readFile(authority.repoAssetPath);
assert.equal(concept.subarray(0, 4).toString('ascii'), 'RIFF');
assert.equal(concept.subarray(8, 12).toString('ascii'), 'WEBP');
assert.equal(concept.length, 182_156);
assert.equal(
  createHash('sha256').update(concept).digest('hex'),
  'f5cd53cb3eacb8f1c9da6af5ff3dc09b5dcb562235bca51e1a8f612ef7f40713',
);

for (const anchor of [
  'bald infant head',
  'gold pacifier with crown emblem',
  'small gold crown',
  'red royal cape with white-and-black spotted fur trim',
  'gold chain / crown pendant',
  'white diaper / baby romper with small crown motifs',
  'crawling / one-hand-down body language',
  'bossy narrowed-eye expression',
]) {
  assert(SECRET_BABY_VISUAL_CANON_CH1819.requiredVisualAnchors.includes(anchor), anchor);
}

const assetPath = 'public/assets/characters/ch181/walk-secret-baby-production-x4.png';
const png = await readFile(assetPath);
assert.deepEqual([...png.subarray(0, 8)], [137, 80, 78, 71, 13, 10, 26, 10], 'SECRET BABY strip must be PNG');
assert.equal(png.readUInt32BE(16), 1536, 'SECRET BABY strip must contain 8 × 192px frames');
assert.equal(png.readUInt32BE(20), 192, 'SECRET BABY strip must be 192px tall');
assert.equal(png.length, 444_398, 'SECRET BABY production strip bytes changed unexpectedly');
assert.equal(
  createHash('sha256').update(png).digest('hex'),
  '417f9df93ffcfca6d333ac45f03087d085aa3dc964e3e26522518b1d912e9d89',
  'SECRET BABY production strip fingerprint changed unexpectedly',
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

console.log('[character-production-crawl-ch1819] PASS SECRET BABY infant crawl + RANDOM-only canon + runtime + idle/ring contract');
