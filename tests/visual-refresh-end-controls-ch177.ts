import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene.ts', 'utf8');
const base = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');

const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const activeExec = stripComments(active);
const boardExec = stripComments(board);

assert.match(active, /styleFinalShellControlsCh177\(internals\)/);
assert.match(active, /final-rematch-skin-ch177/);
assert.match(active, /final-lobby-skin-ch177/);
assert.match(active, /final-rematch-hit-ch177/);
assert.match(active, /final-lobby-hit-ch177/);
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

assert.doesNotMatch(activeExec, /Math\.random\s*\(/);
assert.doesNotMatch(boardExec, /Math\.random\s*\(/);
assert.doesNotMatch(activeExec, /submitIntent\s*\(/);
assert.doesNotMatch(boardExec, /submitIntent\s*\(/);

console.log('[visual-refresh-end-controls-ch177] PASS final controls + lap banner visual refresh; overlay lifecycle and authority retained');
