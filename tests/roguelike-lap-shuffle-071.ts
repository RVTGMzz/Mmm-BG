import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import boardJson from '../src/content/city/board_city_mvp.json';
import { computeMatchChecksum } from '../src/core/checksum';
import {
  boardShuffleSignature071,
  effectiveBoardNode071,
  isBoardNodeLockedForShuffle071,
  mutableBoardNodeIds071,
  shouldTriggerBoardShuffle071,
  shuffleBoardContent071,
} from '../src/core/lapShuffle071';
import {
  createInitialMatchState,
  deserializeMatchState,
  serializeMatchState,
  type MatchEvent,
} from '../src/core/matchState';
import { createRngState } from '../src/core/rng';
import type { BoardDefinition } from '../src/core/types';
import { buildPresentationModel } from '../src/ui/presentationModel';

const board = boardJson as BoardDefinition;
const mutable = mutableBoardNodeIds071(board);
const mutableSet = new Set(mutable);

for (const lockedId of [0, 7, 11, 33, 100, 101, 102, 103, 110, 111, 112, 113]) {
  assert.equal(mutableSet.has(lockedId), false, `locked node ${lockedId} must never shuffle`);
  const node = board.nodes.find((entry) => entry.id === lockedId);
  assert.ok(node);
  assert.equal(isBoardNodeLockedForShuffle071(board, node), true);
}

// Requested roguelike pool stays broad: lottery, mini-game, card, news and money may move.
for (const mutableId of [2, 3, 5, 8, 22, 210, 220]) {
  assert.equal(mutableSet.has(mutableId), true, `node ${mutableId} should be shuffleable`);
}

assert.equal(shouldTriggerBoardShuffle071(1, undefined), true);
assert.equal(shouldTriggerBoardShuffle071(1, 0), true);
assert.equal(shouldTriggerBoardShuffle071(1, 1), false);
assert.equal(shouldTriggerBoardShuffle071(2, 1), true);
assert.equal(shouldTriggerBoardShuffle071(2, 2), false);
assert.equal(shouldTriggerBoardShuffle071(0, 0), false);

const rngA = createRngState(0x7137);
const rngB = createRngState(0x7137);
const firstA = shuffleBoardContent071(board, undefined, rngA);
const firstB = shuffleBoardContent071(board, undefined, rngB);

assert.deepEqual(firstA, firstB, 'same seed must create the same shuffled board');
assert.ok(firstA.changedNodeIds.length > 0, 'a triggered shuffle must visibly change the board');
assert.equal(firstA.assignments.length, mutable.length);

const sourceIds = firstA.assignments.map((entry) => entry.sourceNodeId).sort((a, b) => a - b);
assert.deepEqual(sourceIds, [...mutable].sort((a, b) => a - b), 'content is permuted, never created/deleted');

for (const entry of firstA.assignments) {
  const effective = effectiveBoardNode071(board, entry.nodeId, firstA.assignments);
  const target = board.nodes.find((node) => node.id === entry.nodeId);
  const source = board.nodes.find((node) => node.id === entry.sourceNodeId);
  assert.ok(target && source);
  assert.equal(effective.id, target.id);
  assert.equal(effective.x, target.x);
  assert.equal(effective.y, target.y);
  assert.equal(effective.type, source.type);
  assert.equal(effective.value, source.value);
  assert.equal(effective.feature, source.feature);
  assert.equal(effective.contentId, source.contentId);
}

// A later lap shuffles the CURRENT layout rather than resetting to the original layout.
const second = shuffleBoardContent071(board, firstA.assignments, rngA);
assert.notEqual(boardShuffleSignature071(second.assignments), boardShuffleSignature071(firstA.assignments));
assert.deepEqual(
  second.assignments.map((entry) => entry.sourceNodeId).sort((a, b) => a - b),
  sourceIds,
);

// Protected content remains canonical even if a malformed assignment tries to move it.
const jail = effectiveBoardNode071(board, 11, [{ nodeId: 11, sourceNodeId: 22 }]);
assert.equal(jail.contentId, 'SPECIAL_JAIL_GATE');
const job = effectiveBoardNode071(board, 7, [{ nodeId: 7, sourceNodeId: 3 }]);
assert.equal(job.feature, 'job');

// Shuffle state participates in reconnect/desync checksum and survives serialization.
const match = createInitialMatchState({
  boardId: board.id,
  startNodeId: board.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 12345,
});
const beforeChecksum = computeMatchChecksum(match);
match.boardContentAssignments = firstA.assignments;
match.lastBoardShuffleLap = 1;
const afterChecksum = computeMatchChecksum(match);
assert.notEqual(afterChecksum, beforeChecksum);

const restored = deserializeMatchState(serializeMatchState(match));
assert.deepEqual(restored.boardContentAssignments, firstA.assignments);
assert.equal(restored.lastBoardShuffleLap, 1);
assert.equal(computeMatchChecksum(restored), afterChecksum);

// Presentation exists as a global board event.
const event: MatchEvent = {
  seq: 9,
  type: 'board_shuffle',
  turnNumber: 12,
  playerIndex: 0,
  phase: 'MOVING',
  revision: 4,
  rngCalls: 30,
  actorId: 0,
  data: {
    lap: 1,
    changedCount: firstA.changedNodeIds.length,
    title: 'BÀN CỜ ĐÃ BIẾN ĐỔI!',
    impact: '🔀',
    description: 'P1 chạm vạch xuất phát đầu tiên.',
    summary: 'Các ô khóa giữ nguyên.',
    affectedPlayerIds: '0,1,2,3',
  },
};
const model = buildPresentationModel(event, match.players);
assert.equal(model?.kind, 'board_shuffle');
assert.equal(model?.title, 'BÀN CỜ ĐÃ BIẾN ĐỔI!');
assert.deepEqual(model?.affectedPlayerIds, [0, 1, 2, 3]);

// Integration guards: authority owns the mutation and presentation reveals it at the event beat.
const replay = readFileSync('src/core/replay.ts', 'utf8');
const scene = readFileSync('src/scenes/CareerMinigameBoardScene07044.ts', 'utf8');
assert.match(replay, /shouldTriggerBoardShuffle071\(lapIndex, ctx\.state\.lastBoardShuffleLap\)/);
assert.match(replay, /shuffleBoardContent071\([\s\S]*ctx\.state\.rng/);
assert.match(replay, /appendMatchEvent\(ctx\.state, 'board_shuffle'/);
assert.match(replay, /effectiveBoardNode071\([\s\S]*ctx\.state\.boardContentAssignments/);
assert.doesNotMatch(replay, /Math\.random\(/);
assert.match(scene, /model\.kind === 'board_shuffle'\) this\.syncLapShuffleBoard071\(true\)/);
assert.match(scene, /setName\('lap-shuffle-board-071'\)/);
assert.match(scene, /const face = this\.add\.circle\(0, 0, 34, fill, 1\)/);
assert.match(scene, /\.setStrokeStyle\(5, 0x4a302a, 1\)/);
const shuffleRenderer = scene.slice(
  scene.indexOf('private buildLapShuffleNode071'),
  scene.indexOf('private lapShuffleNodeFill071'),
);
assert.doesNotMatch(shuffleRenderer, /fillRoundedRect|strokeRoundedRect/, 'shuffle must preserve circular tile geometry');

console.log('[roguelike-lap-shuffle-071] PASS deterministic one-per-lap shuffle + locked nodes + checksum + presentation');
