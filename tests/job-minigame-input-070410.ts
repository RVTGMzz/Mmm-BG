import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

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

// Regression: the Career Job Hub must accept the same Enter/Space input used
// by other board screens. The prior A/B/C/Escape-only handler forced a mouse click.
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
assert.match(picker, /const submitRoll = \(\): void =>/);
assert.match(picker, /rollHit\.on\('pointerdown', submitRoll\)/);
assert.match(picker, /event\.code === 'Space'/);
assert.match(picker, /key === 'enter'/);
assert.match(picker, /!detailRoot\?\.active && rollHit\.input\?\.enabled/);
assert.match(picker, /event\.preventDefault\(\);\s*submitRoll\(\)/);
assert.match(picker, /if \(!canRoll \|\| submitted \|\| !root\.active \|\| !root\.visible/);

console.log('[job-minigame-input-070410] PASS shared pointer/Enter/Space Job roll, spectator/detail guard + compact Mini Game controls');
