import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const scene065=readFileSync('src/scenes/CareerMinigameBoardScene065.ts','utf8');
const scene0651=readFileSync('src/scenes/CareerMinigameBoardScene0651.ts','utf8');
const scene066=readFileSync('src/scenes/CareerMinigameBoardScene066.ts','utf8');
const scene069=readFileSync('src/scenes/CareerMinigameBoardScene069.ts','utf8');
const scene0701=readFileSync('src/scenes/CareerMinigameBoardScene0701.ts','utf8');
const main=readFileSync('src/main.ts','utf8');
const gamepad=readFileSync('src/ui/gamepadUiNavigation0651.ts','utf8');
const vite=readFileSync('vite.config.ts','utf8');
const pages=readFileSync('.github/workflows/pages-playtest.yml','utf8');
assert.match(scene065,/handle\.graphic\.destroy\(\)/); assert.match(scene065,/handle\.visualAlpha = rectangle\.alpha/); assert.match(scene065,/rectangle\.visible && visualAlpha > 0\.01/); assert.match(scene065,/destroyRoundedProxies065/);
assert.match(scene0651,/extends CareerMinigameBoardScene065/); assert.match(scene066,/extends CareerMinigameBoardScene0651/);
assert.match(main,/CareerMinigameBoardScene0701 as ActiveBoardScene/); assert.match(scene0701,/extends CareerMinigameBoardScene069/); assert(!scene0701.includes('Math.random')); assert.match(scene069,/extends CareerMinigameBoardScene0682/); assert(!scene069.includes('Math.random')); assert(!scene069.includes('submitIntent('));
assert.match(main,/installGlobalGamepadUiNavigation0651\(game\)/);
assert.match(gamepad,/0: 'confirm'/); assert.match(gamepad,/12: 'up'/); assert.match(gamepad,/13: 'down'/); assert.match(gamepad,/14: 'left'/); assert.match(gamepad,/15: 'right'/); assert.match(gamepad,/navigator\.getGamepads\(\)/); assert.match(gamepad,/target\.emit\('pointerdown'\)/); assert.match(gamepad,/focus\.emit\('pointerover'\)/); assert(!gamepad.includes('Math.random')); assert(!gamepad.includes('submitIntent'));
assert.match(vite,/base:\s*'\.\/'/); assert.match(pages,/actions\/deploy-pages@/); assert.match(pages,/path:\s*dist/); assert.match(pages,/mememe-mvp-0\.1-core/);
console.log('[ui-ghost-gamepad-web-0651] PASS web/gamepad/proxy guards retained beneath 0.1.70.1 wrapper');