import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const card = readFileSync('src/ui/CardOverlay.ts', 'utf8');
const news = readFileSync('src/ui/NewsOverlay.ts', 'utf8');
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const owner = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const dice = readFileSync('src/scenes/PresentationParityBoardScene.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(card, /setName\('legacy-card-overlay'\)/);
assert.match(news, /setName\('legacy-news-overlay'\)/);
assert.match(active, /destroyNamedTopLevelContainers070413\('legacy-card-overlay'\)/);
assert.match(active, /destroyNamedTopLevelContainers070413\('legacy-news-overlay'\)/);
assert.match(active, /object\.destroy\(true\)/);

assert.match(picker, /const restore = \(object: Phaser\.GameObjects\.GameObject\)/);
assert.match(owner, /isInsideProtectedJobModal0682/);
assert.match(owner, /root\?\.name === 'job-hub-modal' \|\| root\?\.name === 'job-detail-modal'/);

assert.doesNotMatch(dice, /\$\{model\.actorName\} • \$\{result\}/);
assert.match(dice, /label\.setText\(model\.actorName\)/);

console.log('[visual-preflight-070413] PASS legacy overlay retirement + protected Job modal text + dice suspense');
