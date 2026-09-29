import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';
import { MINI_GAME_CHOICE_LAYOUT_070431, miniGameChoiceFits070431 } from '../src/ui/miniGameLayout070423';

const job=readFileSync('src/ui/JobChoicePicker.ts','utf8');
const scene=readFileSync('src/scenes/CareerMinigameBoardScene07044.ts','utf8');
const mini=readFileSync('src/ui/MiniGameOverlay.ts','utf8');

assert.equal(MEMEME_BUILD.version,'0.1.70.4.31');
assert.match(job,/job-detail-salary-label-070432/);
assert.match(job,/job-detail-salary-levels-070432/);
assert.match(job,/LƯƠNG \/ VÒNG/);
assert.match(job,/Lv1 \$\{jobSalary\(job, 1\)\} B\$/);
assert.doesNotMatch(job,/LƯƠNG \/ VÒNG   Lv1/);

assert.match(scene,/const landingIcon = isResult \? \(model\.impact \|\| '💼'\) : '🎲'/u);
assert.match(scene,/dieChip\.setVisible\(Boolean\(dieMatch\)\)/);
assert.match(scene,/job-result-impact-icon-070432/);

assert.equal(MINI_GAME_CHOICE_LAYOUT_070431.promptY,-105);
assert.equal(MINI_GAME_CHOICE_LAYOUT_070431.hintY,-62);
assert.equal(MINI_GAME_CHOICE_LAYOUT_070431.cardCenterY,80);
assert.equal(miniGameChoiceFits070431(),true);

assert.match(mini,/const showMajorityFlow = async/);
assert.match(mini,/TRẠNG THÁI/);
assert.match(mini,/KẾT QUẢ/);
assert.match(mini,/vf07-majority-result-copy/);
assert.doesNotMatch(mini,/await showResult\('🤝 HÒA, RA LẠI!'/u);
assert.doesNotMatch(mini,/await showResult\('😵 ÍT BỊ!'/u);

console.log('[ui-density-polish-ch11] PASS Job spacing + dice-only waiting + majority status→result flow + choice top breathing room');
