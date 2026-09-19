import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const parity = readFileSync('src/scenes/PresentationParityBoardScene.ts', 'utf8');
const owner = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.doesNotMatch(parity, /\$\{model\.actorName\} • \$\{result\}/);
assert.match(parity, /\$\{model\.actorName\} đang đổ\.\.\./);
assert.match(parity, /label\.setText\(model\.actorName\)/);

assert.match(
  owner,
  /const blockingRoot = jobDetailRoot\?\.active[\s\S]*jobHubRoot\?\.active[\s\S]*presentationRoot/,
);

assert.match(active, /installFinalCardLayout070412/);
assert.match(active, /normalizeCardPresentation070412/);
assert.match(active, /setName\('card-presentation-card'\)/);
assert.match(active, /setPosition\(-322, -28\)/);
assert.match(active, /setFixedSize\(628, 128\)/);
assert.match(active, /description\.length > 8/);

console.log('[presentation-leak-cleanup-070412] PASS dice suspense + Job Hub priority + final Card layout containment');
