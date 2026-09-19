import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const replay = readFileSync('src/core/replay.ts', 'utf8');
const presentation = readFileSync('src/ui/MatchPresentationLayer.ts', 'utf8');
const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');
const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const ownership = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(replay, /description: 'Đổ xúc xắc để nhận việc\./);
assert.doesNotMatch(replay, /Không chọn trực tiếp\. Hãy đổ xúc xắc Job/);
assert.match(replay, /\$\{job\.icon\} \$\{job\.title\} • \$\{jobSalary\(job, 1\)\} B\$\/cổng/);
assert.match(replay, /Còn \$\{pendingMovement\.remainingSteps\} bước di chuyển/);

assert.match(presentation, /const isJobCard = model\.tileType === 'job'/);
assert.match(presentation, /const panelWidth = isJobCard \? 700 : 560/);
assert.match(presentation, /const bodyWidth = isJobCard \? 500 : 410/);

assert.match(mini, /title\.setVisible\(false\)/);
assert.match(mini, /subtitle\.setVisible\(false\)/);
assert.match(mini, /stake\.setVisible\(false\)/);
assert.match(mini, /Hạng \$\{index \+ 1\} •/);

assert.match(picker, /780, 370/);
assert.match(picker, /fixedWidth: 640/);
assert.match(ownership, /const jobDetailRoot = this\.findNamedTopLevelContainer0682\('job-detail-modal'\)/);
assert.match(ownership, /jobDetailRoot\?\.active/);

console.log('[job-ui-compact-07048] PASS concise Job copy + wider Job card + clean ranking + visible Job detail');
