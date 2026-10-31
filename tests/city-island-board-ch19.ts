import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import type { BoardDefinition } from '../src/core/types';
import { effectiveBoardNode071 } from '../src/core/lapShuffle071';

const board = boardJson as BoardDefinition;
const main = readFileSync('src/main.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardSceneIslandCh19.ts', 'utf8');
const scenery = readFileSync('src/ui/cityIslandSceneryCh19.ts', 'utf8');

// The island board is the active board and keeps the whole CH-17.3 chain.
assert.match(main, /CareerMinigameBoardSceneIslandCh19 as ActiveBoardScene/);
assert.match(scene, /class CareerMinigameBoardSceneIslandCh19 extends CareerMinigameBoardSceneCh173/);
assert.match(scene, /super\.create\(\)/);
assert.match(scene, /super\.update\(\)/);

// Presentation only: no intents, no gameplay RNG, no authority writes.
for (const source of [scene, scenery]) {
  assert.doesNotMatch(source, /submitIntent\s*\(/);
  assert.doesNotMatch(source, /Math\.random\s*\(/);
  assert.doesNotMatch(source, /core\/(rng|authority|rules|turn)'/);
}

// Tiles are redrawn from the authoritative Lap Shuffle assignment.
assert.match(scene, /effectiveBoardNode071\(BOARD_CH19, target\.id, assignments\)/);
assert.match(scene, /boardContentAssignments/);
// Inherited tile objects stay alive (for lookups/tweens) but are kept invisible.
assert.match(scene, /setAlpha\(0\.001\)/);
assert.match(scene, /city-island-tile-ch19/);
assert.match(scene, /city-island-scenery-ch19/);

// Scenery sits below every tile/token and keeps the board playable if it fails.
assert.match(scene, /SCENERY_DEPTH_CH19 = -45/);
assert.match(scene, /TILE_DEPTH_CH19 = 4\.2/);
assert.match(scene, /console\.warn\('\[CH-19\] island scenery unavailable'/);
// GPU-safe texture size.
assert.match(scenery, /maxSide = 4096/);

// Every board tile resolves to a visual after any shuffle assignment.
const swapped = board.nodes
  .filter((n) => n.type === 'card' || n.type === 'news')
  .slice(0, 2);
const assignments = swapped.length === 2
  ? [{ nodeId: swapped[0].id, sourceNodeId: swapped[1].id }, { nodeId: swapped[1].id, sourceNodeId: swapped[0].id }]
  : [];
for (const node of board.nodes) {
  const effective = effectiveBoardNode071(board, node.id, assignments);
  assert.equal(effective.x, node.x);
  assert.equal(effective.y, node.y);
}

console.log('PASS CH-19 city island board: presentation-only layer over CH-17.3, shuffle-aware tiles');
