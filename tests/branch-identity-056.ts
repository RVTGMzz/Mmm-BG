import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import { branchFlavorForNode056, branchFlavorInfo056 } from '../src/core/branchIdentity056';
import { getBoardNode, getOutgoingEdges, validateBoardDefinition } from '../src/core/board';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;

assert.deepEqual(validateBoardDefinition(BOARD), [], '0.1.56 branch-identity board must validate cleanly.');
assert.equal(BOARD.id, 'city-mvp-graph-01', '0.1.56 must keep the canonical board id stable.');
assert(BOARD.name.includes('0.1.56'));

const safe = [200, 201, 202].map((id) => getBoardNode(BOARD, id));
assert.deepEqual(safe.map((node) => node.type), ['normal', 'normal', 'normal']);
assert(safe.every((node) => branchFlavorForNode056(node) === 'safe'));
assert.equal(branchFlavorInfo056(safe[0]!).title, 'AN TOÀN');

const drama = [210, 211, 212].map((id) => getBoardNode(BOARD, id));
assert.deepEqual(drama.map((node) => node.type), ['news', 'card', 'news']);
assert(drama.every((node) => branchFlavorForNode056(node) === 'drama'));
assert.equal(branchFlavorInfo056(drama[0]!).title, 'DRAMA');

const money = [220, 221, 222].map((id) => getBoardNode(BOARD, id));
assert.deepEqual(money.map((node) => node.type), ['money', 'money', 'money']);
assert.deepEqual(money.map((node) => node.value), [25, -20, 25]);
assert(money.every((node) => branchFlavorForNode056(node) === 'money'));
assert.equal(branchFlavorInfo056(money[0]!).title, 'TIỀN');

const junctions = [
  { id: 3, flavorDestination: 200, flavorText: 'AN TOÀN', mainDestination: 4 },
  { id: 16, flavorDestination: 210, flavorText: 'DRAMA', mainDestination: 17 },
  { id: 34, flavorDestination: 220, flavorText: 'TIỀN', mainDestination: 35 },
] as const;

for (const junction of junctions) {
  const outgoing = getOutgoingEdges(BOARD, junction.id);
  assert.equal(outgoing.length, 2, `Junction ${junction.id} must still expose exactly two routes.`);
  const flavorEdge = outgoing.find((edge) => edge.to === junction.flavorDestination);
  const mainEdge = outgoing.find((edge) => edge.to === junction.mainDestination);
  assert(flavorEdge?.label?.includes(junction.flavorText), `Junction ${junction.id} must advertise ${junction.flavorText}.`);
  assert(mainEdge?.label?.includes('PHỐ CHÍNH'), `Junction ${junction.id} must retain a PHỐ CHÍNH comparison route.`);
  assert.equal(branchFlavorForNode056(getBoardNode(BOARD, junction.mainDestination)), 'main');
}

// 0.1.56 changes content identity only. The equal-step forward-only topology from
// 0.1.55 must remain untouched so route flavor does not secretly become a shortcut.
assert.equal(getOutgoingEdges(BOARD, 202)[0]?.to, 7);
assert.equal(getOutgoingEdges(BOARD, 212)[0]?.to, 20);
assert.equal(getOutgoingEdges(BOARD, 222)[0]?.to, 38);

console.log('[branch-identity-056] PASS SAFE=normal/normal/normal • DRAMA=news/card/news • MONEY=+25/-20/+25 • topology unchanged');
