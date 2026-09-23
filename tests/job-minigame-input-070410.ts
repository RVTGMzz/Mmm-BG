import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { nextJobHubFocus070423, type JobHubFocus } from '../src/ui/jobHubFocus070423';

const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const ownership = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const polish = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const replay = readFileSync('src/core/replay.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(presentation, /setName\('job-presentation-card'\)/);
assert.match(presentation, /object\.name === 'job-presentation-card'/);

assert.match(ownership, /restoreCanonicalModalText0682/);
assert.match(ownership, /text\.setVisible\(true\)\.setAlpha\(1\)/);
assert.match(polish, /findNamedContainer069\('job-detail-modal'\)/);
assert.match(polish, /MatchPresentationLayer owns the canonical Job card/);
assert.doesNotMatch(polish, /setText\(`🎲\$\{roll/);

assert.match(replay, /title: `🎲 \$\{result\} → NHẬN VIỆC`/);
assert.match(replay, /Đổ xúc xắc để nhận việc\.\\nMỗi nghề có lương riêng/);

assert.match(mini, /setVisible\(false\)/);
assert.match(mini, /arrowleft/);
assert.match(mini, /arrowright/);
assert.match(mini, /navigator\.getGamepads/);
assert.match(mini, /pad\.buttons\[14\]/);
assert.match(mini, /pad\.buttons\[15\]/);
assert.match(mini, /pad\.buttons\[0\]/);
assert.doesNotMatch(mini, /stake\.setText\(`THƯỞNG:/);

// Keyboard-only acceptance: active Job Hub defaults to the dice, not a card.
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
assert.match(picker, /let focused: JobHubFocus = canRoll \? 'roll' : 0/);
assert.match(picker, /setName\('job-hub-keyboard-focus-070423'\)/);
assert.match(picker, /if \(focused === 'roll'\)/);
assert.match(picker, /rollHit\.on\('pointerdown', submitRoll\)/);
assert.match(picker, /nextJobHubFocus070423\(focused, direction, canRoll\)/);
assert.match(picker, /key === 'enter'/);
assert.match(picker, /event\.code === 'Space'/);
assert.match(picker, /key === 'tab'/);
assert.match(picker, /event\.shiftKey/);
assert.match(picker, /event\.preventDefault\(\)/);
assert.match(picker, /if \(detailRoot\?\.active\)/);
assert.match(picker, /if \(!canRoll \|\| submitted \|\| !root\.active \|\| !root\.visible/);
assert.match(picker, /!rollHit\.input\?\.enabled/);

// A/B/C may be browsed by arrows, Tab and Shift+Tab. Down always returns
// focus to the dice on an active player's turn; spectators cannot focus it.
assert.equal(nextJobHubFocus070423('roll', 'up', true), 1);
assert.equal(nextJobHubFocus070423('roll', 'left', true), 0);
assert.equal(nextJobHubFocus070423('roll', 'right', true), 2);
assert.equal(nextJobHubFocus070423(0, 'right', true), 1);
assert.equal(nextJobHubFocus070423(1, 'right', true), 2);
assert.equal(nextJobHubFocus070423(2, 'left', true), 1);
assert.equal(nextJobHubFocus070423(2, 'down', true), 'roll');
assert.equal(nextJobHubFocus070423(0, 'down', true), 'roll');
assert.equal(nextJobHubFocus070423(1, 'down', true), 'roll');
assert.equal(nextJobHubFocus070423(0, 'down', false), 0);
assert.equal(nextJobHubFocus070423('roll', 'down', false), 0);
assert.equal(nextJobHubFocus070423('roll', 'tab', true), 0);
assert.equal(nextJobHubFocus070423(2, 'tab', true), 'roll');
assert.equal(nextJobHubFocus070423('roll', 'shift-tab', true), 2);
assert.equal(nextJobHubFocus070423(2, 'tab', false), 0);
assert.equal(nextJobHubFocus070423(0, 'shift-tab', false), 2);

let focus: JobHubFocus = 'roll';
for (const direction of ['up', 'right', 'down'] as const) {
  focus = nextJobHubFocus070423(focus, direction, true);
}
assert.equal(focus, 'roll', 'arrow-only player must always be able to return to dice');
console.log('[job-minigame-input-070410] PASS default dice focus, arrow/Tab job preview, keyboard detail close and spectator-safe Enter/Space');
