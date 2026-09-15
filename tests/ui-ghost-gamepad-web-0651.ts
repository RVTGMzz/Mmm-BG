import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const scene065 = readFileSync('src/scenes/CareerMinigameBoardScene065.ts', 'utf8');
const scene0651 = readFileSync('src/scenes/CareerMinigameBoardScene0651.ts', 'utf8');
const scene066 = readFileSync('src/scenes/CareerMinigameBoardScene066.ts', 'utf8');
const main = readFileSync('src/main.ts', 'utf8');
const gamepad = readFileSync('src/ui/gamepadUiNavigation0651.ts', 'utf8');
const vite = readFileSync('vite.config.ts', 'utf8');
const pages = readFileSync('.github/workflows/pages-playtest.yml', 'utf8');

assert.match(scene065, /handle\.graphic\.destroy\(\)/, 'dead source must destroy its rounded proxy');
assert.match(scene065, /handle\.visualAlpha = rectangle\.alpha/, 'proxy must mirror owner alpha changes');
assert.match(scene065, /rectangle\.visible && visualAlpha > 0\.01/, 'hidden/faded source must hide rounded proxy');
assert.match(scene065, /destroyRoundedProxies065/, 'scene shutdown must clean all rounded proxies');

assert.match(scene0651, /extends CareerMinigameBoardScene065/);
assert.match(scene066, /extends CareerMinigameBoardScene0651/);
assert.match(main, /CareerMinigameBoardScene066 as ActiveBoardScene/);
assert.match(main, /installGlobalGamepadUiNavigation0651\(game\)/);

assert.match(gamepad, /0: 'confirm'/);
assert.match(gamepad, /12: 'up'/);
assert.match(gamepad, /13: 'down'/);
assert.match(gamepad, /14: 'left'/);
assert.match(gamepad, /15: 'right'/);
assert.match(gamepad, /navigator\.getGamepads\(\)/);
assert.match(gamepad, /target\.emit\('pointerdown'\)/, 'A must reuse existing UI pointer action');
assert.match(gamepad, /focus\.emit\('pointerover'\)/, 'D-pad focus must reuse existing hover feedback');
assert(!gamepad.includes('Math.random'), 'gamepad navigation must add no RNG');
assert(!gamepad.includes('submitIntent'), 'gamepad navigation must not bypass gameplay authority');

assert.match(vite, /base:\s*'\.\/'/);
assert.match(pages, /actions\/deploy-pages@/);
assert.match(pages, /path:\s*dist/);
assert.match(pages, /mememe-mvp-0\.1-core/);

console.log('[ui-ghost-gamepad-web-0651] PASS retained under 0.1.66 wrapper');
