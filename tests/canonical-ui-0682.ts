import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const jobPicker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const reactions = readFileSync('src/ui/ReactionSequencer.ts', 'utf8');
const gamepad = readFileSync('src/ui/gamepadUiNavigation0651.ts', 'utf8');
const rules = readFileSync('docs/CANONICAL_UI_UX_RULES.md', 'utf8');

assert.equal(MEMEME_BUILD.version, '0.1.68.2');
assert.equal(MEMEME_BUILD.phase, 'CANONICAL MOBILE UI CONTRACT');
assert.match(main, /CareerMinigameBoardScene0682 as ActiveBoardScene/);

assert.match(scene, /extends CareerMinigameBoardScene0681/);
assert.match(scene, /IDLE_HUD_SCALE_0682 = 0\.9/);
assert.match(scene, /ACTIVE_HUD_SCALE_0682 = 1\.08/);
assert.match(scene, /active \? activeCopy : idleCopy/);
assert.match(scene, /active \? 13 : 11/);
assert.match(scene, /syncStrictModalOwnership0682/);
assert.match(scene, /if \(text\.parentContainer\) return/);
assert(!scene.includes('Math.random'), '0.1.68.2 presentation wrapper must add no client RNG');
assert(!scene.includes('submitIntent('), '0.1.68.2 presentation wrapper must remain authority-free');

assert.match(jobPicker, /CHẠM \/ A: CHI TIẾT/);
assert.match(jobPicker, /A \/ ENTER: MỞ CHI TIẾT/);
assert.match(jobPicker, /detailRoot/);
assert.match(jobPicker, /jobSalary\(job, 1\)/);
assert.match(jobPicker, /jobSalary\(job, 2\)/);
assert.match(jobPicker, /jobSalary\(job, 3\)/);
assert.match(jobPicker, /scene\.events\.on\('mememe-ui-back'/);
assert.match(jobPicker, /event\.key\.toLocaleLowerCase\(\)/);
assert(!jobPicker.includes('Math.random'), 'Job details must not own gameplay RNG');

assert.match(gamepad, /1: 'back'/);
assert.match(gamepad, /events\.emit\('mememe-ui-back'\)/);
assert(!gamepad.includes('submitIntent'), 'controller back must remain UI-only');

assert.match(reactions, /BUBBLE_WIDTH_0682 = 272/);
assert.match(reactions, /BUBBLE_SAFE_MARGIN_0682 = 18/);
assert.match(reactions, /Phaser\.Math\.Clamp/);
assert.match(reactions, /maxLines: 2/);
assert(!reactions.includes('Math.random'), 'reaction layout must stay deterministic');

assert.match(rules, /Idle player HUD is compact; active player HUD expands/);
assert.match(rules, /Job Hub uses compact cards plus optional details/);
assert.match(rules, /Modal priority is absolute/);
assert.match(rules, /Floating bubbles must respect viewport edges/);

console.log('[canonical-ui-0682] PASS active/idle HUD + Job detail disclosure + modal ownership + safe reaction lanes + input parity');
