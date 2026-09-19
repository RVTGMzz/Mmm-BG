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

console.log('[job-minigame-input-070410] PASS single Job card owner + nonblank detail healing + compact Mini Game intro + keyboard/gamepad choice navigation');
