import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_final_051.json';
import { getOutgoingEdges, validateBoardDefinition } from '../src/core/board';
import type { BoardDefinition } from '../src/core/types';

const board = boardJson as BoardDefinition;
assert.deepEqual(validateBoardDefinition(board), [], 'Draft D graph must validate');

const plans = [
  { junction: 3, left: 200, right: 4, merge: 7 },
  { junction: 16, left: 17, right: 210, merge: 20 },
  { junction: 34, left: 220, right: 35, merge: 38 },
] as const;

function stepsToMerge(firstNodeId: number, mergeNodeId: number): number {
  const visited = new Set<number>();
  let current = firstNodeId;
  let steps = 1;

  while (current !== mergeNodeId) {
    assert(!visited.has(current), `branch cycle detected at node ${current}`);
    visited.add(current);
    assert.notEqual(current, 0, 'branch must not wrap through READY before merge');
    const outgoing = getOutgoingEdges(board, current);
    assert.equal(outgoing.length, 1, `branch corridor node ${current} must have one forward edge`);
    current = outgoing[0]!.to;
    steps += 1;
    assert(steps <= 6, `branch from ${firstNodeId} did not rejoin promptly`);
  }

  return steps;
}

for (const plan of plans) {
  const outgoing = getOutgoingEdges(board, plan.junction);
  assert.equal(outgoing.length, 2, `junction ${plan.junction} must have exactly two choices`);

  const left = outgoing.find((edge) => edge.label?.includes('TRÁI'));
  const right = outgoing.find((edge) => edge.label?.includes('PHẢI'));
  assert.equal(left?.to, plan.left, `junction ${plan.junction} left choice mismatch`);
  assert.equal(right?.to, plan.right, `junction ${plan.junction} right choice mismatch`);

  assert.equal(stepsToMerge(plan.left, plan.merge), 4, `left path at ${plan.junction} must rejoin in 4 steps`);
  assert.equal(stepsToMerge(plan.right, plan.merge), 4, `right path at ${plan.junction} must rejoin in 4 steps`);
  assert(plan.merge > plan.junction, `merge ${plan.merge} must be ahead of junction ${plan.junction}`);
}

const mainTs = readFileSync('src/main.ts', 'utf8');
const servePs1 = readFileSync('public/serve-playtest.ps1', 'utf8');
const fullMapScene = readFileSync('src/scenes/FullMapReviewScene053.ts', 'utf8');
assert(mainTs.includes("finalMapMode === '4'"), 'main.ts must expose dedicated finalmap=4 full-map mode');
assert(servePs1.includes('?finalmap=4'), 'full-map launcher must target dedicated finalmap=4 mode');
assert(fullMapScene.includes('fitWholeBoard()'), 'full-map review must fit the complete board to viewport');
assert(!fullMapScene.includes('createHud()'), 'dedicated full-map review must not render gameplay HUD');

console.log('[final-map-branching-053] PASS left/right choices are forward-only, equal-step, cycle-free, and full-map mode is dedicated');
