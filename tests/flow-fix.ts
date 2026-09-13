import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json';
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import type { BoardDefinition } from '../src/core/types';
import {
  countBlockingPresentationEvents,
  shouldAutoAdvancePresentation,
  shouldDeferResultOverlay,
} from '../src/ui/presentationFlowPolicy';

const BOARD = boardJson as BoardDefinition;

const branchEdges = getOutgoingEdges(BOARD, 4);
assert.equal(branchEdges.length, 2);
assert.equal(pickParityEdge(branchEdges, 1)?.to, 5);
assert.equal(pickParityEdge(branchEdges, 3)?.to, 5);
assert.equal(pickParityEdge(branchEdges, 2)?.to, 18);
assert.equal(pickParityEdge(branchEdges, 6)?.to, 18);

assert.equal(shouldAutoAdvancePresentation([0, 1, 2, 3]), true);
assert.equal(shouldAutoAdvancePresentation([1, 2, 3]), false);
assert.equal(shouldAutoAdvancePresentation([2, 3]), false);
assert.equal(shouldAutoAdvancePresentation([0, 1, 1, 3]), false);

assert.equal(shouldDeferResultOverlay(true, 'ended'), true);
assert.equal(shouldDeferResultOverlay(false, 'ended'), false);
assert.equal(shouldDeferResultOverlay(true, 'active'), false);

const match = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['Ron', 'Bích', 'Hưng', 'Mây'],
  seed: 1811,
});

function event(seq: number, type: string, data: MatchEvent['data']): MatchEvent {
  return {
    seq,
    type,
    turnNumber: 1,
    playerIndex: 0,
    phase: 'RESOLVING_TILE',
    revision: 4,
    rngCalls: 2,
    actorId: 0,
    data,
  };
}

const blockingBatch = [
  event(1, 'tile_land', { nodeId: 5, tileType: 'news', value: 0 }),
  event(2, 'news', {
    newsId: 'NEWS_DEMO_002',
    title: 'Ví Bay Màu',
    rarity: 'R',
    impact: '⭐⭐',
    description: 'Một khoản phí bất ngờ.',
    summary: 'Ron mất 80B$.',
    amount: 80,
    reactionEventId: 'NEWS_NEGATIVE_DEMO',
    spectatorId: 2,
  }),
];

assert.equal(countBlockingPresentationEvents(blockingBatch, match.players), 2);
assert.equal(
  countBlockingPresentationEvents(
    [event(3, 'money_tile', { amount: 50, resultMoney: 550 })],
    match.players,
  ),
  0,
);

console.log('[flow-fix] PASS manual acknowledge, result deferral, and parity routing');
