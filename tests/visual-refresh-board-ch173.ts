import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const hud = readFileSync('src/ui/visualFoundationHudVf04.ts', 'utf8');

assert.match(main, /CareerMinigameBoardSceneCh173 as ActiveBoardScene/);
assert.match(scene, /extends CareerMinigameBoardScene07044/);
assert.match(scene, /board-turn-status-skin-ch173/);
assert.match(scene, /board-overview-skin-ch173/);
assert.match(scene, /board-direct-dice-skin-ch173/);
assert.match(scene, /runtime\.hud\.get\(player\.id\)/);
assert.match(scene, /runtime\.directDice/);
assert.match(scene, /currentPlayer\(\)/);
assert.doesNotMatch(scene, /submitIntent\s*\(/);
assert.doesNotMatch(scene, /Math\.random\s*\(/);
assert.doesNotMatch(scene, /match\.[A-Za-z0-9_]+\s*=/);
assert.match(hud, /Dedicated money and career\/material lanes/);
assert.match(hud, /Active turn uses a toy-like ribbon tab/);
assert.match(hud, /fillRoundedRect\(-62, -13, 118, 25, 13\)/);
assert.match(hud, /fillRoundedRect\(-62, 14, 184, 31, 14\)/);

console.log('[visual-refresh-board-ch173] PASS four-corner sticker HUD + turn/dice chrome; authority untouched');
