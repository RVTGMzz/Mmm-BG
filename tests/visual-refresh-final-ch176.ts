import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const transition = readFileSync('src/scenes/CareerMinigameBoardScene039.ts', 'utf8');
const podium = readFileSync('src/scenes/CareerMinigameBoardScene041.ts', 'utf8');
const active = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const gate = readFileSync('src/scenes/CareerMinigameBoardScene044.ts', 'utf8');
const stripComments = (source: string) => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const transitionExec = stripComments(transition);
const podiumExec = stripComments(podium);
const gateExec = stripComments(gate);

const executable = (source: string): string => source
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/\/\/.*$/gm, '');
const transitionCode = executable(transition);
const podiumCode = executable(podium);
const gateCode = executable(gate);

assert.match(transition, /final-transition-panel-ch176/);
assert.match(transition, /final-transition-header-ch176/);
assert.match(transition, /final-transition-flag-well-ch176/);
assert.match(transition, /CHỐT B\$ • XẾP HẠNG CUỐI VÁN/);
assert.doesNotMatch(transitionCode, /Math\.random\s*\(/);
assert.doesNotMatch(transitionCode, /submitIntent\s*\(/);

assert.match(podium, /final-podium-ch176/);
assert.match(podium, /final-podium-paper-ch176/);
assert.match(podium, /final-podium-header-ch176/);
assert.match(podium, /final-podium-slot-/);
assert.match(podium, /final-podium-rank-pill-/);
assert.match(podium, /final-podium-face-frame-/);
assert.match(podium, /XẾP THEO B\$ • BẰNG TIỀN = CÙNG HẠNG/);
assert.match(podium, /demoMatchResult\(internals\.match\)/);
assert.match(podium, /withCompetitionRanks\(result\.ranking\)/);
assert.match(podium, /root\.setAlpha\(inheritedAlpha\)/);
assert.doesNotMatch(podiumCode, /Math\.random\s*\(/);
assert.doesNotMatch(podiumCode, /submitIntent\s*\(/);
assert.doesNotMatch(podiumCode, /\.money\s*[+\-*/]?=/);

assert.match(active, /match-recap-trigger-shadow-ch176/);
assert.match(active, /match-recap-trigger-face-ch176/);
assert.match(active, /match-recap-trigger-ch14/);
assert.match(active, /showMatchRecapCh14/);

assert.match(gate, /podiumRevealCompleteMs\(\)/);
assert.match(gate, /podiumRevealBlocker/);
assert.doesNotMatch(gateCode, /Math\.random\s*\(/);

console.log('[visual-refresh-final-ch176] PASS final transition + podium + recap trigger visual refresh; ranking/reveal authority retained');
