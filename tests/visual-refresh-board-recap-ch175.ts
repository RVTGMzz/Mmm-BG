import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import type { BoardDefinition } from '../src/core/types';

const board = boardJson as BoardDefinition;
const scene = readFileSync('src/scenes/CareerMinigameBoardSceneCh173.ts', 'utf8');
const recap = readFileSync('src/ui/matchRecapOverlayCh14.ts', 'utf8');

assert.equal(board.nodes.filter((node) => node.id >= 0 && node.id < 44).length, 44);
assert.equal(board.nodes.filter((node) => node.feature === 'minigame' && node.id < 44).length, 5);

assert.match(scene, /BOARD_CH175 = boardJson as BoardDefinition/);
assert.match(scene, /installBoardPathChromeCh175/);
assert.match(scene, /board-path-chrome-ch175/);
assert.match(scene, /installBoardTileChromeCh175/);
assert.match(scene, /board-tile-skin-ch175/);
assert.match(scene, /object\.depth === 4/);
assert.match(scene, /skin\.fillRoundedRect/);
assert.match(scene, /skin\.fillStyle\(0xffffff/);
assert.doesNotMatch(scene, /submitIntent\s*\(/);
assert.doesNotMatch(scene, /Math\.random\s*\(/);

assert.match(recap, /match-recap-panel-ch175/);
assert.match(recap, /match-recap-header-ch175/);
assert.match(recap, /match-recap-tab-skin-/);
assert.match(recap, /match-recap-detail-panel-ch175/);
assert.match(recap, /match-recap-moment-panel-ch175/);
assert.match(recap, /match-recap-close-face-ch175/);
assert.match(recap, /fillRoundedRect/);
assert.match(recap, /0x4b302a, 0\.72/);
assert.doesNotMatch(recap, /Math\.random/);
assert.doesNotMatch(recap, /\.money\s*[+\-*/]?=/);

console.log('[visual-refresh-board-recap-ch175] PASS toy-board chrome + paper Match Recap; topology and authority untouched');
