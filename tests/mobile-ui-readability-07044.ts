import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const main = readFileSync('src/main.ts', 'utf8');
const board = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
const order = readFileSync('src/scenes/TurnOrderScene07044.ts', 'utf8');
const css = readFileSync('src/mobileReadability07044.css', 'utf8');
const helper = readFileSync('src/ui/mobileReadability07044.ts', 'utf8');

assert.match(main, /mobileReadability07044\.css/);
assert.match(main, /TurnOrderScene07044 as TurnOrderScene/);
assert.match(main, /CareerMinigameBoardScene07044 as ActiveBoardScene/);

assert.match(board, /extends CareerMinigameBoardScene0701/);
assert.match(order, /extends TurnOrderScene0701/);
assert.match(helper, /0\.1\.70\.4\.4/);
assert.match(helper, /pointer: coarse/);
assert.match(helper, /maxTouchPoints/);

assert.match(board, /setFontSize\(active \? 21 : 18\)/);
assert.match(board, /setFontSize\(active \? 23 : 20\)/);
assert.match(board, /setFontSize\(19\)/);
assert.match(board, /fillRoundedRect\(card\.x - 95, card\.y - 26, 190, 52/);
assert.match(order, /setFontSize\(30\)/);
assert.match(order, /setFontSize\(24\)/);

assert.match(css, /@media \(pointer: coarse\) and \(orientation: landscape\)/);
assert.match(css, /\.online-player-row strong[\s\S]*?font-size: 20px/);
assert.match(css, /\.face-editor-landscape \.face-editor-head strong/);
assert.match(css, /\.group-media-status[\s\S]*?display: none/);

assert(!board.includes('submitIntent('));
assert(!board.includes('Math.random('));
assert(!order.includes('submitRoll('));

console.log('[mobile-ui-readability-07044] PASS presentation-only mobile landscape readability + scene wiring');
