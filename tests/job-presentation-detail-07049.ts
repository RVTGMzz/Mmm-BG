import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const base = readFileSync('src/scenes/CareerMinigameBoardScene.ts', 'utf8');
const spectator = readFileSync('src/scenes/CareerMinigameBoardScene046.ts', 'utf8');
const ownership = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const polish = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(picker, /setName\('job-hub-modal'\)/);
assert.match(picker, /setName\('job-detail-modal'\)/);

assert.match(base, /internals\.presentation\?\.isBlocking\(\)/);
assert.match(base, /internals\.presentation\?\.active\?\.active/);
assert.match(spectator, /internals\.presentation\?\.isBlocking\(\)/);

assert.match(ownership, /findNamedTopLevelContainer0682\('job-detail-modal'\)/);
assert.match(ownership, /findNamedTopLevelContainer0682\('job-hub-modal'\)/);
assert.match(
  ownership,
  /const blockingRoot = jobDetailRoot\?\.active[\s\S]*\? jobDetailRoot[\s\S]*presentationRoot\?\.active/,
  'Job Detail must outrank stale presentation ownership',
);

assert.match(polish, /copy\.includes\('job xuất hiện'\)/);
assert.match(polish, /copy === 'đổ xúc xắc để nhận việc\.'/);

console.log('[job-presentation-detail-07049] PASS sequenced Job presentation + stable named modal ownership + stale-copy suppression');
