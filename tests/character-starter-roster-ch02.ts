import assert from 'node:assert/strict';
import {
  STARTER_CHARACTERS_V01,
  getStarterCharacterV01,
  starterCharacterArchetypesV01,
} from '../src/content/core/characters_starter_v01';

assert.equal(STARTER_CHARACTERS_V01.length, 4, 'starter roster must contain exactly four characters');

const expectedArchetypes = ['crybaby', 'grumpy', 'anxious', 'hyper'];
assert.deepEqual(starterCharacterArchetypesV01(), expectedArchetypes);
assert.deepEqual(
  STARTER_CHARACTERS_V01.map((character) => character.genderPresentation),
  ['female', 'male', 'male', 'female'],
  'starter gender presentation must match the approved CH-02B roster',
);

const ids = STARTER_CHARACTERS_V01.map((character) => character.id);
assert.equal(new Set(ids).size, ids.length, 'starter character IDs must be unique');

const reactionIds = STARTER_CHARACTERS_V01.map((character) => character.reactionProfileId);
assert.equal(new Set(reactionIds).size, reactionIds.length, 'reaction profile IDs must be unique');

const poseIds = STARTER_CHARACTERS_V01.map((character) => character.poseSetId);
assert.equal(new Set(poseIds).size, poseIds.length, 'pose set IDs must be unique');

const passiveIds = STARTER_CHARACTERS_V01.map((character) => character.passiveConcept.id);
assert.equal(new Set(passiveIds).size, passiveIds.length, 'passive concept IDs must be unique');

for (const character of STARTER_CHARACTERS_V01) {
  assert.ok(character.archetypeLabel.length > 0);
  assert.ok(character.ageBand.min >= 18);
  assert.ok(character.ageBand.max > character.ageBand.min);
  assert.ok(character.presentationTags.some((tag) => tag.startsWith('age:')));
  assert.ok(character.presentationTags.some((tag) => tag.startsWith('style:')));
  assert.ok(character.bodyLanguage.length >= 3);
  assert.ok(character.reactionDirection.length >= 3);
  assert.equal(character.passiveIds.length, 1);
  assert.equal(character.passiveIds[0], character.passiveConcept.id);
  assert.equal(character.passiveConcept.live, false, 'CH-02A must not activate passive gameplay');
}

assert.equal(getStarterCharacterV01('starter-crybaby')?.archetypeLabel, 'KHÓC NHÈ');
assert.equal(getStarterCharacterV01('starter-grumpy')?.archetypeLabel, 'CAU CÓ');
assert.equal(getStarterCharacterV01('starter-anxious')?.archetypeLabel, 'LO LẮNG');
assert.equal(getStarterCharacterV01('starter-hyper')?.archetypeLabel, 'TĂNG ĐỘNG');
assert.equal(getStarterCharacterV01('missing-character'), undefined);

console.log('[character-starter-roster-ch02] PASS four starter archetypes + concept-only passives locked');
