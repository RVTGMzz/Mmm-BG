import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { characterArtManifestV01 } from '../src/content/core/character_art_manifest_v01';

const base = 'public/assets/characters/starter-crybaby/neutral';
const body = await readFile(`${base}/body-back.webp`);
const mask = await readFile(`${base}/face-mask.webp`);
const foreground = await readFile(`${base}/foreground.webp`);

for (const [name, file] of [['body', body], ['mask', mask], ['foreground', foreground]] as const) {
  assert.equal(file.subarray(0, 4).toString('ascii'), 'RIFF', `${name} must be RIFF/WebP`);
  assert.equal(file.subarray(8, 12).toString('ascii'), 'WEBP', `${name} must be WebP`);
}
assert.ok(foreground.length > 8_000, 'foreground proof must contain real Character pixels');
assert.ok(mask.length > 500, 'face mask proof must contain a non-trivial alpha shape');

const crybaby = characterArtManifestV01('starter-crybaby');
const neutral = crybaby?.poses.find((pose) => pose.emotion === 'neutral');
assert.equal(crybaby?.status, 'layer-export-pending', 'one proof pose must not mark the whole Character runtime-ready');
assert.equal(neutral?.faceSocket, undefined, 'preview socket must not silently become final production socket');
assert.deepEqual(neutral?.runtimeProof, {
  width: 128,
  height: 192,
  faceSocket: {
    x: 0.5,
    y: 0.2734375,
    scale: 0.359375,
    rotationDeg: 0,
    padding: 0.08,
  },
  milestone: 'CH-02G',
});

const setup = await readFile('src/scenes/SetupScene.ts', 'utf8');
const css = await readFile('src/characterSelectCh02c.css', 'utf8');
assert(setup.includes('character-layered-proof-ch02g'));
assert(setup.includes('./assets/characters/starter-crybaby/neutral/foreground.webp'));
assert(setup.includes('./assets/characters/starter-crybaby/neutral/face-mask.webp'));
assert(setup.includes("button.dataset.characterId === 'starter-crybaby'"));
assert(!setup.includes('assets/characters/secret-baby'), 'normal Character Select must not preload Secret Baby art');
assert(css.includes('.layered-preview-active-ch02g'));
assert(css.includes('-webkit-mask-size: 100% 100%'));

console.log('[character-crybaby-runtime-proof-ch02g] PASS real WebP layers + masked face composite + Secret-safe selection');
