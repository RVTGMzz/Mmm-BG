import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createRngState } from '../src/core/rng';
import {
  characterDisplayLabelCh02c,
  resolveCharacterAssignmentsCh02c,
} from '../src/core/characterPregameCh02c';

const setupSource = await readFile('src/scenes/SetupScene.ts', 'utf8');
const turnSource = await readFile('src/scenes/TurnOrderScene.ts', 'utf8');
const cssSource = await readFile('src/characterSelectCh02c.css', 'utf8');

assert(setupSource.includes('RANDOM (?)'), 'Character Select must expose a visible RANDOM (?) option');
assert(setupSource.includes('ÚP KẾT QUẢ TỚI KHI VÀO TRẬN'), 'RANDOM must promise concealed reveal');
assert(!setupSource.includes('EM BÉ BÁ ĐẠO'), 'normal Character Select must not leak the Secret Baby identity');
assert(setupSource.includes("gameSession.setCharacterSelection(playerId, 'fixed', characterId)"));
assert(setupSource.includes("gameSession.setCharacterSelection(playerId, 'random')"));
assert(turnSource.includes("setName('character-reveal-ch02c')"), 'Turn Order must own one dedicated reveal overlay');
assert(turnSource.includes("✨ SECRET! ✨\\nEM BÉ BÁ ĐẠO 🍼"), 'Secret identity may appear only inside reveal presentation');
assert(cssSource.includes('grid-template-columns: repeat(5'), 'four starters + RANDOM should share one readable row');

const fixedAndRandom = resolveCharacterAssignmentsCh02c([
  { playerId: 0, mode: 'fixed', characterId: 'starter-crybaby' },
  { playerId: 1, mode: 'random' },
  { playerId: 2, mode: 'fixed', characterId: 'starter-anxious' },
  { playerId: 3, mode: 'random' },
], createRngState(12345));

assert.equal(fixedAndRandom.length, 4);
assert.equal(fixedAndRandom.find((item) => item.playerId === 0)?.characterId, 'starter-crybaby');
assert.equal(fixedAndRandom.find((item) => item.playerId === 2)?.characterId, 'starter-anxious');
assert.equal(
  fixedAndRandom.filter((item) => item.source === 'random').length,
  2,
  'two RANDOM intents must yield two concealed assignment tokens',
);
assert.throws(
  () => resolveCharacterAssignmentsCh02c([
    { playerId: 0, mode: 'fixed', characterId: 'secret-baby' },
  ], createRngState(1)),
  /visible starter Character/,
  'Secret Baby can never be fixed-selected',
);
assert.equal(characterDisplayLabelCh02c('secret-baby'), 'EM BÉ BÁ ĐẠO');

console.log('[character-select-runtime-ch02c] PASS sequential select + concealed RANDOM + reveal ownership');
