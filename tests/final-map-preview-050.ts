import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_final_050.json';
import { validateBoardDefinition } from '../src/core/board';
import {
  FINAL_MAP_PREVIEW_050,
  canReleaseFrom,
  lotteryRewardForRoll,
  mainNodeKey,
  previewExitRoute,
  releaseFaces,
} from '../src/core/finalMapPreview050';
import type { BoardDefinition } from '../src/core/types';

const board = boardJson as BoardDefinition;
const errors = validateBoardDefinition(board);
assert.deepEqual(errors, [], `final map graph must validate: ${errors.join(' | ')}`);

assert.equal(board.nodes.length, 52, '44 main + 4 Jail nodes + 4 Hospital nodes');
assert.equal(board.edges.filter((edge) => edge.route === 'main').length, 44, 'main loop must contain exactly 44 edges');
assert.equal(board.edges.filter((edge) => edge.route === 'branch').length, 8, 'Jail/Hospital exit routes must contain four edges each');

for (let id = 0; id < 44; id += 1) {
  assert(board.nodes.some((node) => node.id === id), `missing ${mainNodeKey(id)}`);
}

const contentAt = (nodeId: number) => board.nodes.find((node) => node.id === nodeId)?.contentId;
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.readyNodeId), 'READY');
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.jailGateNodeId), 'SPECIAL_JAIL_GATE');
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.lotteryNodeId), 'SPECIAL_LOTTERY');
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.hospitalGateNodeId), 'SPECIAL_HOSPITAL_GATE');
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.jailNodeId), 'SPECIAL_JAIL_HOLD');
assert.equal(contentAt(FINAL_MAP_PREVIEW_050.hospitalNodeId), 'SPECIAL_HOSPITAL_HOLD');

assert.deepEqual([...FINAL_MAP_PREVIEW_050.jailExitNodeIds], [101, 102, 103], 'Jail exit must be exactly J1/J2/J3');
assert.deepEqual([...FINAL_MAP_PREVIEW_050.hospitalExitNodeIds], [111, 112, 113], 'Hospital exit must be exactly H1/H2/H3');
assert.deepEqual(previewExitRoute('jail'), [101, 102, 103, 12]);
assert.deepEqual(previewExitRoute('hospital'), [111, 112, 113, 34]);

assert.deepEqual(releaseFaces('jail'), [1, 3, 5]);
assert.deepEqual(releaseFaces('hospital'), [2, 4, 5]);
for (let roll = 1; roll <= 6; roll += 1) {
  assert.equal(canReleaseFrom('jail', roll), [1, 3, 5].includes(roll), `Jail release mismatch on ${roll}`);
  assert.equal(canReleaseFrom('hospital', roll), [2, 4, 5].includes(roll), `Hospital release mismatch on ${roll}`);
  assert.equal(lotteryRewardForRoll(roll), roll * 20, `Lottery x20 mismatch on ${roll}`);
}

console.log('[final-map-preview-050] PASS 44-space loop + 3-space exits + release faces + lottery x20');
