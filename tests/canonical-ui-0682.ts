import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const scene069 = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const jobPicker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const reactions = readFileSync('src/ui/ReactionSequencer.ts', 'utf8');
const gamepad = readFileSync('src/ui/gamepadUiNavigation0651.ts', 'utf8');
const rules = readFileSync('docs/CANONICAL_UI_UX_RULES.md', 'utf8');

// Historical 0.1.68.2 UI guard: later canonical builds may advance the visible
// version while retaining this HUD/detail/safe-bubble contract.
const versionParts = MEMEME_BUILD.version.split('.').map(Number);
assert.equal(versionParts[0], 0);
assert.equal(versionParts[1], 1);
assert(versionParts[2] >= 69, `canonical runtime regressed below 0.1.69: ${MEMEME_BUILD.version}`);
assert(MEMEME_BUILD.phase.length > 0, 'canonical build phase must stay visible');
assert.match(main, /CareerMinigameBoardScene069 as ActiveBoardScene/);
assert.match(scene069, /extends CareerMinigameBoardScene0682/);
assert.match(scene, /extends CareerMinigameBoardScene0681/);
assert.match(scene, /IDLE_HUD_SCALE_0682 = 0\.9/);
assert.match(scene, /ACTIVE_HUD_SCALE_0682 = 1\.08/);
assert.match(scene, /syncStrictModalOwnership0682/);
assert(!scene.includes('Math.random'));
assert(!scene.includes('submitIntent('));
assert.match(jobPicker, /CHẠM \/ A: CHI TIẾT/);
assert.match(jobPicker, /detailRoot/);
assert.match(jobPicker, /scene\.events\.on\('mememe-ui-back'/);
assert(!jobPicker.includes('Math.random'));
assert.match(gamepad, /events\.emit\('mememe-ui-back'\)/);
assert.match(reactions, /BUBBLE_SAFE_MARGIN_0682 = 18/);
assert.match(reactions, /Phaser\.Math\.Clamp/);
assert(!reactions.includes('Math.random'));
assert.match(rules, /Idle player HUD is compact; active player HUD expands/);
assert.match(rules, /Job Hub uses compact cards plus optional details/);
assert.match(rules, /Soft rounded surfaces are the default shape language/);
console.log(`[canonical-ui-0682] PASS inherited active/idle HUD + Job details + safe reaction lanes under canonical ${MEMEME_BUILD.version}`);
