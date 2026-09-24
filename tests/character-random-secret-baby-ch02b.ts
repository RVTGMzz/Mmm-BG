import assert from 'node:assert/strict';
import { createRngState, type SerializableRngState } from '../src/core/rng';
import {
  isDirectSelectableCharacterCh02b,
  resolveRandomCharacterBatchCh02b,
} from '../src/core/characterRandomSelectionCh02b';
import {
  SECRET_BABY_CHARACTER_ID,
  SECRET_BABY_RANDOM_CHANCE,
  SECRET_BABY_V01,
} from '../src/content/core/character_secret_baby_v01';
import { STARTER_CHARACTERS_V01 } from '../src/content/core/characters_starter_v01';

assert.equal(SECRET_BABY_RANDOM_CHANCE, 0.05);
assert.equal(SECRET_BABY_V01.randomOnly, true);
assert.equal(SECRET_BABY_V01.directSelectable, false);
assert.equal(SECRET_BABY_V01.passiveConcept.live, false);
assert.equal(isDirectSelectableCharacterCh02b(SECRET_BABY_CHARACTER_ID), false);
assert.equal(isDirectSelectableCharacterCh02b('starter-crybaby'), true);
assert.equal(
  STARTER_CHARACTERS_V01.some((character) => character.id === SECRET_BABY_CHARACTER_ID),
  false,
  'Secret Baby must never appear in the normal starter roster',
);

function scriptedRng(values: number[]): SerializableRngState {
  // This object only satisfies the shape. nextRandom() mutates state using xorshift,
  // so for threshold-specific tests we instead locate deterministic seeds below.
  return createRngState(values[0] ?? 1);
}

function findSeed(predicate: (first: number[]) => boolean, draws: number): number {
  for (let seed = 1; seed < 200000; seed += 1) {
    const probe = createRngState(seed);
    const values: number[] = [];
    // inline xorshift by calling resolver would also consume shuffles; use nextRandom via dynamic import avoided here.
    let state = probe.state >>> 0;
    for (let i = 0; i < draws; i += 1) {
      let value = state;
      value ^= value << 13;
      value ^= value >>> 17;
      value ^= value << 5;
      state = value >>> 0;
      values.push(state / 0x1_0000_0000);
    }
    if (predicate(values)) return seed;
  }
  throw new Error('Unable to find deterministic seed for CH-02B test.');
}

const noSecretSeed = findSeed((values) => values.every((value) => value >= 0.05), 4);
const noSecretA = resolveRandomCharacterBatchCh02b([3, 1, 2, 0], createRngState(noSecretSeed));
const noSecretB = resolveRandomCharacterBatchCh02b([0, 1, 2, 3], createRngState(noSecretSeed));
assert.equal(noSecretA.secretIncluded, false);
assert.equal(noSecretA.revealAt, 'match_start');
assert.deepEqual(noSecretA, noSecretB, 'same seats + same RNG state must resolve identically');
assert.equal(new Set(noSecretA.assignments.map((item) => item.characterId)).size, 4);

const oneSecretSeed = findSeed(
  (values) => values.some((value) => value < 0.05),
  4,
);
const secretBatch = resolveRandomCharacterBatchCh02b([0, 1, 2, 3], createRngState(oneSecretSeed));
assert.equal(secretBatch.secretIncluded, true);
assert.equal(
  secretBatch.assignments.filter((item) => item.characterId === SECRET_BABY_CHARACTER_ID).length,
  1,
  'RANDOM batch may contain at most one Secret Baby',
);

// Find a seed where at least two of the four independent eligibility rolls hit.
// The result must still contain a single Secret Baby.
const multiHitSeed = findSeed(
  (values) => values.filter((value) => value < 0.05).length >= 2,
  4,
);
const multiHitBatch = resolveRandomCharacterBatchCh02b([0, 1, 2, 3], createRngState(multiHitSeed));
assert.equal(
  multiHitBatch.assignments.filter((item) => item.secret).length,
  1,
  'multiple successful 5% rolls still collapse to one secret token',
);

// Occupied fixed starters are avoided when enough other starters exist.
const occupiedId = STARTER_CHARACTERS_V01[0].id;
const partialBatch = resolveRandomCharacterBatchCh02b(
  [1, 2],
  createRngState(noSecretSeed),
  [occupiedId],
);
assert.equal(
  partialBatch.assignments.some((item) => item.characterId === occupiedId),
  false,
  'RANDOM should avoid a fixed occupied starter when capacity allows',
);

assert.equal(scriptedRng([1]).calls, 0);
console.log('[character-random-secret-baby-ch02b] PASS deterministic RANDOM + 5% secret + max-one + concealed batch contract');
