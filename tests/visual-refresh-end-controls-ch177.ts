import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene.ts', 'utf8');
const base = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const finalControlsStart = active.indexOf('private styleFinalShellControlsCh177');
const finalControlsEnd = active.indexOf('private closeMatchRecapCh14', finalControlsStart);
const lapBannerStart = board.indexOf('private showLapCompletionBanner');
const lapBannerEnd = board.indexOf('private installOneLapScoreHud', lapBannerStart);
assert.ok(finalControlsStart >= 0 && finalControlsEnd > finalControlsStart, 'CH-17.7 final controls method slice missing');
assert.ok(lapBannerStart >= 0 && lapBannerEnd > lapBannerStart, 'CH-17.7 lap banner method slice missing');
const finalControlsExec = stripComments(active.slice(finalControlsStart, finalControlsEnd));
const lapBannerExec = stripComments(board.slice(lapBannerStart, lapBannerEnd));

assert.match(active, /styleFinalShellControlsCh177\(internals\)/);
assert.match(active, /setName\(\`\$\{name\}-skin-ch177\`\)/);
assert.match(active, /setName\(\`\$\{name\}-hit-ch177\`\)/);
assert.match(active, /setName\(\`\$\{name\}-label-ch177\`\)/);
assert.match(active, /skinButton\('CHƠI LẠI 🔁',[\s\S]*?'final-rematch'\)/);
assert.match(active, /skinButton\('VỀ LOBBY',[\s\S]*?'final-lobby'\)/);
assert.match(active, /final-host-wait-pill-ch177/);
assert.match(active, /CHƠI LẠI 🔁/);
assert.match(active, /VỀ LOBBY/);

assert.match(base, /for \(const object of this\.shellOverlay\) object\.destroy\(\);/);
assert.match(base, /this\.shellOverlay = \[\];/);

assert.match(board, /lap-banner-shadow-ch177/);
assert.match(board, /lap-banner-panel-ch177/);
assert.match(board, /lap-banner-flag-well-ch177/);
assert.match(board, /HOÀN THÀNH 1 VÒNG!/);
assert.match(board, /chốt B\$ khi cả bàn hoàn thành/);

assert.doesNotMatch(finalControlsExec, /Math\.random\s*\(/);
assert.doesNotMatch(lapBannerExec, /Math\.random\s*\(/);
assert.doesNotMatch(finalControlsExec, /submitIntent\s*\(/);
assert.doesNotMatch(lapBannerExec, /submitIntent\s*\(/);

console.log('[visual-refresh-end-controls-ch177] PASS final controls + lap banner visual refresh; overlay lifecycle and authority retained');
