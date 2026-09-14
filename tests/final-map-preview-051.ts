import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_final_051.json';
import { getOutgoingEdges, validateBoardDefinition } from '../src/core/board';
import {
  FINAL_MAP_PREVIEW_051,
  canReleaseFrom,
  isDraftDBranchNode,
  lotteryRewardForRoll,
} from '../src/core/finalMapPreview051';
import type { BoardDefinition } from '../src/core/types';

const board = boardJson as BoardDefinition;
assert.deepEqual(validateBoardDefinition(board), [], 'Draft D graph must validate');
assert.equal(board.nodes.filter((node) => node.id >= 0 && node.id < 44).length, 44, 'Draft D keeps 44 main spaces');

assert.deepEqual([...FINAL_MAP_PREVIEW_051.branchJunctionNodeIds], [3, 16, 34], 'Draft D has exactly three working branch junctions');
for (const junction of FINAL_MAP_PREVIEW_051.branchJunctionNodeIds) {
  const outgoing = getOutgoingEdges(board, junction);
  assert.equal(outgoing.length, 2, `junction ${junction} must expose two route choices`);
  assert(outgoing.some((edge) => edge.route === 'main'), `junction ${junction} needs main route`);
  assert(outgoing.some((edge) => edge.route === 'branch'), `junction ${junction} needs alternate route`);
}

const branchGroups = [
  [200, 201, 202, 7],
  [210, 211, 212, 20],
  [220, 221, 222, 38],
] as const;
for (const [a, b, c, rejoin] of branchGroups) {
  assert(isDraftDBranchNode(a) && isDraftDBranchNode(b) && isDraftDBranchNode(c), 'all alternate corridor nodes must be registered');
  assert.equal(getOutgoingEdges(board, a)[0]?.to, b);
  assert.equal(getOutgoingEdges(board, b)[0]?.to, c);
  assert.equal(getOutgoingEdges(board, c)[0]?.to, rejoin);
}

assert.equal(FINAL_MAP_PREVIEW_051.readyNodeId, 0);
assert.equal(FINAL_MAP_PREVIEW_051.jailGateNodeId, 11);
assert.equal(FINAL_MAP_PREVIEW_051.lotteryNodeId, 22);
assert.equal(FINAL_MAP_PREVIEW_051.hospitalGateNodeId, 33);
assert(FINAL_MAP_PREVIEW_051.normalFollowZoom >= 1.3, 'normal Draft D camera must be materially closer than 0.1.50');
assert(FINAL_MAP_PREVIEW_051.branchDecisionZoom < FINAL_MAP_PREVIEW_051.normalFollowZoom, 'branch framing must pull back from close follow');
assert(FINAL_MAP_PREVIEW_051.overviewZoom < 0.7, 'overview must remain a distinct full-board mode');

assert(canReleaseFrom('jail', 1));
assert(canReleaseFrom('jail', 3));
assert(canReleaseFrom('jail', 5));
assert(!canReleaseFrom('jail', 2));
assert(canReleaseFrom('hospital', 2));
assert(canReleaseFrom('hospital', 4));
assert(canReleaseFrom('hospital', 5));
assert(!canReleaseFrom('hospital', 6));
assert.equal(lotteryRewardForRoll(6), 120);

console.log('[final-map-preview-051] PASS 44 main spaces + 3 equal-step route decisions + close camera contract + retained special rules');
