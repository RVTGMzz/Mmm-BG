import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  CHARACTER_ART_EMOTIONS_V01,
  CHARACTER_ART_MANIFESTS_V01,
  CHARACTER_ART_MASTER_SIZE_V01,
  characterArtManifestV01,
  isRuntimeReadyCharacterArtV01,
} from '../src/content/core/character_art_manifest_v01';

assert.equal(CHARACTER_ART_MANIFESTS_V01.length, 5, 'four starters + one Secret art authority');
assert.deepEqual(CHARACTER_ART_MASTER_SIZE_V01, { width: 1024, height: 1536 });

const ids = CHARACTER_ART_MANIFESTS_V01.map((item) => item.characterId);
assert.equal(new Set(ids).size, 5);

const conceptNames = CHARACTER_ART_MANIFESTS_V01.map((item) => item.concept.driveFileName);
assert.deepEqual(
  conceptNames,
  ['khocnhe.webp', 'cauco.webp', 'lolang.webp', 'tangdong.webp', 'embe.webp'],
);
assert.equal(new Set(CHARACTER_ART_MANIFESTS_V01.map((item) => item.concept.driveFileId)).size, 5);

for (const item of CHARACTER_ART_MANIFESTS_V01) {
  assert.equal(item.status, 'layer-export-pending');
  assert.equal(isRuntimeReadyCharacterArtV01(item), false);
  assert.equal(item.poses.length, CHARACTER_ART_EMOTIONS_V01.length);
  assert.deepEqual(item.poses.map((pose) => pose.emotion), CHARACTER_ART_EMOTIONS_V01);
  for (const pose of item.poses) {
    assert.equal(pose.faceSocket, undefined, 'do not invent socket coordinates before final layer export');
    assert.match(pose.bodyBackAsset, new RegExp(`^/assets/characters/${item.characterId}/${pose.emotion}/body-back\\.webp$`));
    assert.match(pose.foregroundAsset, /\/foreground\.webp$/);
    assert.match(pose.faceMaskAsset ?? '', /\/face-mask\.webp$/);
  }
}

assert.equal(characterArtManifestV01('secret-baby')?.concept.driveFileName, 'embe.webp');
assert.equal(characterArtManifestV01('missing'), undefined);

const setupSource = await readFile('src/scenes/SetupScene.ts', 'utf8');
assert(!setupSource.includes('character_art_manifest_v01'), 'normal Character Select must not accidentally preload Secret art manifest');
assert(!setupSource.includes('embe.webp'), 'normal Character Select must never expose Secret concept art');

console.log('[character-art-layer-pipeline-ch02e] PASS approved concept authority + planned layered export contract');
