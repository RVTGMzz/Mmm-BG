import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const picker = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const legacy067 = readFileSync('src/scenes/CareerMinigameBoardScene067.ts', 'utf8');
const legacy068 = readFileSync('src/scenes/CareerMinigameBoardScene068.ts', 'utf8');
const legacy0681 = readFileSync('src/scenes/CareerMinigameBoardScene0681.ts', 'utf8');
const owner0682 = readFileSync('src/scenes/CareerMinigameBoardScene0682.ts', 'utf8');
const legacy069 = readFileSync('src/scenes/CareerMinigameBoardScene069.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(picker, /restoreHubVisuals/);
assert.match(picker, /object instanceof Phaser\.GameObjects\.Text/);
assert.match(picker, /restoreHubVisuals\(\);[\s\S]*setCardInteractive\(true\)/);

assert.match(owner0682, /if \(jobHubRoot\?\.active\) this\.restoreCanonicalModalText0682\(jobHubRoot\)/);
assert.match(owner0682, /jobDetailRoot\?\.active && jobHubRoot\?\.active[\s\S]*collectObjects0682\(jobHubRoot, canonical\)/);

assert.match(legacy067, /root\.name === 'job-presentation-card'/);
assert.match(legacy068, /root\.name === 'job-presentation-card'/);
assert.match(legacy0681, /canonicalJobPresentation/);
assert.match(legacy069, /root\?\.name === 'job-presentation-card'/);

assert.match(active, /installCanonicalJobPresentation070411/);
assert.match(active, /if \(model\.tileType !== 'job'\)/);
assert.match(active, /showCanonicalJobLanding070411/);
assert.match(active, /setName\('job-presentation-card'\)/);
assert.match(active, /fixedWidth: isResult \? 260 : 570/);
assert.match(active, /fixedHeight: isResult \? 92 : 88/);
assert.match(active, /maxLines: 3/);
assert.match(active, /presentation\.finishCurrent\(false\)/);

console.log('[job-flow-consolidation-070411] PASS one Job renderer + Hub/Detail visibility lifecycle + retired legacy Job mutations');
