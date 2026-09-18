import assert from 'node:assert/strict';
import { clampFaceTransform, DEFAULT_FACE_TRANSFORM, FACE_RUNTIME_SIZE } from '../src/systems/faces';

assert.equal(FACE_RUNTIME_SIZE, 320);
assert.deepEqual(clampFaceTransform(DEFAULT_FACE_TRANSFORM), DEFAULT_FACE_TRANSFORM);

assert.deepEqual(
  clampFaceTransform({ zoom: 9, rotation: 270, offsetX: 4, offsetY: -4 }),
  { zoom: 3, rotation: 180, offsetX: 1, offsetY: -1 },
);

assert.deepEqual(
  clampFaceTransform({ zoom: 0.2, rotation: -400, offsetX: -2, offsetY: 2 }),
  { zoom: 1, rotation: -180, offsetX: -1, offsetY: 1 },
);

assert.deepEqual(
  clampFaceTransform({ zoom: Number.NaN, rotation: Number.NaN, offsetX: Number.NaN, offsetY: Number.NaN }),
  DEFAULT_FACE_TRANSFORM,
);

console.log('[image-transform] PASS crop transform bounds + 320px runtime target locked');
