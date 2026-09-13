import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json';
import { getOutgoingEdges, pickParityEdge } from '../src/core/board';
import { createInitialMatchState, type MatchEvent } from '../src/core/matchState';
import type { BoardDefinition } from '../src/core/types';
import {
  countBlockingPresentationEvents,
  shouldAutoAdvancePresentation,
} from '../src/ui/presentationFlowPolicy';

const BOARD = boardJson as BoardDefinition;

const branchEdges = getOutgoingEdges(BOARD, 4);
assert.equal(branchEdges.length, 2, 'node 4 should remain the two-way parity fork');
assert.equal(pickParityEdge(branchEdges, 1)?.to, 5, 'odd roll should take PHỐ CHÍNH');
assert.equal(pickParityEdge(branchEdges, 3)?.to, 5, 'odd parity must be stable');
assert.equal(pickParityEdge(branchEdges, 2)?.to, 18, 'even roll should take HẺM TẮT');
assert.equal(pickParityEdge(branchEdges, 6)?.to, 18, 'even parity must be stable');

assert.equal(
  shouldAutoAdvancePresentation([0, 1, 2, 3]),
  true,
  '4 CPU AUTOPLAY may self-ack presentation',
);
assert.equal(
  shouldAutoAdvancePresentation([1, 2, 3]),
  false,
  '1 human + 3 CPU must wait for human acknowledgement',
);
assert.equal(
  shouldAutoAdvancePresentation([2, 3]),
  false,
  '2 human + 2 CPU must wait for acknowledgement',
);
assert.equal(
  shouldAutoAdvancePresentation([0, 1, 1, 3]),
  false,
  'duplicate CPU seats must never accidentally enable autoplay',
);

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

assert.equal(
  countBlockingPresentationEvents(blockingBatch, match.players),
  2,
  'landing + news must be two acknowledged presentation steps, not a timed backlog',
);
assert.equal(
  countBlockingPresentationEvents(
    [event(3, 'money_tile', { amount: 50, resultMoney: 550 })],
    match.players,
  ),
  0,
  'log-only events must not create extra blocking panels',
);

console.log('[flow-fix] PASS manual-ack policy + deterministic odd/even branch routing');
