import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const news = readFileSync('src/ui/visualFoundationNewsVf05.ts', 'utf8');
const card = readFileSync('src/ui/visualFoundationCardVf051.ts', 'utf8');
const jobHub = readFileSync('src/ui/JobChoicePicker.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const mini = readFileSync('src/ui/MiniGameOverlay.ts', 'utf8');

assert.match(news, /CH-17\.4/);
assert.match(news, /fillRoundedRect\(left \+ 15, top \+ 9, n\.width - 30, 10, 5\)/);
assert.match(news, /fillCircle\(left \+ 30, top \+ 27, 5\)/);

assert.match(card, /CH-17\.4/);
assert.match(card, /fillRoundedRect\(left \+ 15, top \+ 9, c\.width - 30, 10, 5\)/);
assert.match(card, /fillCircle\(292, -99, 31\)/);

assert.match(jobHub, /JOB_HUB_VF06\.cocoa, 0\.58/);
assert.match(jobHub, /const headerGloss = scene\.add\.graphics\(\)/);
assert.match(jobHub, /const playerPill = scene\.add\.graphics\(\)/);
assert.match(jobHub, /JOB_HUB_VF06\.cocoa, 0\.62/);

assert.match(board, /const bodyPaper = this\.add\.graphics\(\)/);
assert.match(board, /const iconWell = this\.add\.graphics\(\)/);
assert.match(board, /jobBodyViewport070429\.height \+ 26/);

assert.match(mini, /vf07-minigame-shell-shadow-ch174/);
assert.match(mini, /vf07-minigame-header-gloss-ch174/);
assert.match(mini, /vf07-minigame-sticker-icon-ch174/);
assert.match(mini, /submitSystemIntent\('resolve_minigame'/);
assert.doesNotMatch(mini, /Math\.random\s*\(/);

console.log('[visual-refresh-modals-ch174] PASS News/Card/Job/Mini Game CH-17.4 material refresh; gameplay authority retained');
