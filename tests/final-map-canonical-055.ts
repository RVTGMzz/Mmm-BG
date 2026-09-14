import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import { getBoardNode, getOutgoingEdges, validateBoardDefinition } from '../src/core/board';
import type { BoardDefinition } from '../src/core/types';

const BOARD = boardJson as BoardDefinition;

assert.equal(BOARD.id, 'city-mvp-graph-01', '0.1.55 keeps the canonical board id for compatibility.');
assert.equal(BOARD.startNodeId, 0);
assert.deepEqual(validateBoardDefinition(BOARD), [], 'Draft D canonical graph must validate cleanly.');

const mainNodes = BOARD.nodes.filter((node) => node.id >= 0 && node.id < 44);
assert.equal(mainNodes.length, 44, 'Canonical Draft D must contain exactly 44 main-loop spaces.');
for (let id = 0; id < 44; id += 1) {
  assert(BOARD.nodes.some((node) => node.id === id), `Missing main node M${String(id + 1).padStart(2, '0')}.`);
}

assert.equal(getBoardNode(BOARD, 0).contentId, 'READY');
assert.equal(getBoardNode(BOARD, 11).contentId, 'SPECIAL_JAIL_GATE');
assert.equal(getBoardNode(BOARD, 22).contentId, 'SPECIAL_LOTTERY');
assert.equal(getBoardNode(BOARD, 33).contentId, 'SPECIAL_HOSPITAL_GATE');

const miniGameNodes = mainNodes.filter((node) => node.feature === 'minigame');
assert.deepEqual(
  miniGameNodes.map((node) => node.id),
  [8, 16, 25, 34, 43],
  'Draft D must expose five Mini Game spaces at M09/M17/M26/M35/M44.',
);
assert.deepEqual(
  miniGameNodes.map((node) => node.contentId),
  ['MINIGAME_SLOT_01', 'MINIGAME_SLOT_02', 'MINIGAME_SLOT_03', 'MINIGAME_SLOT_04', 'MINIGAME_SLOT_05'],
);

const branchPlans = [
  { junction: 3, first: new Set([4, 200]), merge: 7, main: [4, 5, 6, 7], alt: [200, 201, 202, 7] },
  { junction: 16, first: new Set([17, 210]), merge: 20, main: [17, 18, 19, 20], alt: [210, 211, 212, 20] },
  { junction: 34, first: new Set([35, 220]), merge: 38, main: [35, 36, 37, 38], alt: [220, 221, 222, 38] },
] as const;

const followSinglePath = (start: number, steps: number): number[] => {
  const path: number[] = [];
  let current = start;
  for (let step = 0; step < steps; step += 1) {
    path.push(current);
    if (step === steps - 1) break;
    const outgoing = getOutgoingEdges(BOARD, current);
    assert.equal(outgoing.length, 1, `Node ${current} inside a declared branch corridor must have exactly one continuation.`);
    current = outgoing[0]!.to;
  }
  return path;
};

for (const plan of branchPlans) {
  const outgoing = getOutgoingEdges(BOARD, plan.junction);
  assert.equal(outgoing.length, 2, `Junction ${plan.junction} must expose exactly Left/Right choices.`);
  assert.deepEqual(new Set(outgoing.map((edge) => edge.to)), plan.first);
  assert(outgoing.some((edge) => edge.label?.includes('RẼ TRÁI')));
  assert(outgoing.some((edge) => edge.label?.includes('RẼ PHẢI')));
  assert.deepEqual(followSinglePath(plan.main[0], 4), [...plan.main]);
  assert.deepEqual(followSinglePath(plan.alt[0], 4), [...plan.alt]);
  assert.equal(plan.main.at(-1), plan.merge);
  assert.equal(plan.alt.at(-1), plan.merge);
}

// Holding geometry exists in the canonical board now, but 0.1.55 intentionally
// does not pretend the authoritative detention/hospital state machine is already done.
assert.equal(getBoardNode(BOARD, 100).contentId, 'SPECIAL_JAIL_HOLD');
assert.deepEqual([101, 102, 103].map((id) => getBoardNode(BOARD, id).contentId), ['JAIL_EXIT_1', 'JAIL_EXIT_2', 'JAIL_EXIT_3']);
assert.equal(getOutgoingEdges(BOARD, 103)[0]?.to, 12, 'Jail exit must rejoin at M13.');
assert.equal(getBoardNode(BOARD, 110).contentId, 'SPECIAL_HOSPITAL_HOLD');
assert.deepEqual([111, 112, 113].map((id) => getBoardNode(BOARD, id).contentId), ['HOSPITAL_EXIT_1', 'HOSPITAL_EXIT_2', 'HOSPITAL_EXIT_3']);
assert.equal(getOutgoingEdges(BOARD, 113)[0]?.to, 34, 'Hospital exit must rejoin at M35.');

console.log('[final-map-canonical-055] PASS 44 main spaces + 3 forward merges + 5 Mini Games + special-location geometry');
