import assert from 'node:assert/strict';
import { createEmptyHostAuthority } from '../src/core/authority';
import { InMemoryTransportHub } from '../src/core/localTransport';
import { TwoTabHostSession, type TwoTabMessage } from '../src/core/twoTabSession';
import type { BoardDefinition } from '../src/core/types';

const board: BoardDefinition = {
  id: 'minigame-host-system-test',
  name: 'Mini Game host ownership test',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal', feature: 'minigame', contentId: 'MINIGAME_SLOT_01' },
  ],
  edges: [{ from: 0, to: 1, route: 'main' }],
};

const authority = createEmptyHostAuthority(
  {
    boardId: board.id,
    startNodeId: board.startNodeId,
    playerNames: ['P1', 'P2', 'P3', 'P4'],
    seed: 3710,
  },
  { board, cards: [], news: [] },
);

const hub = new InMemoryTransportHub<TwoTabMessage>();
const host = new TwoTabHostSession('037', authority, hub.createEndpoint('host'));
host.start();

const roll = host.submitLocalIntent('roll', 0, {});
assert.equal(roll.status, 'accepted');

const sourceEvent = authority.state.eventLog.find((event) => event.type === 'minigame_tile');
assert(sourceEvent, 'rolling onto the Mini Game tile must create a source event');

const payoutData = {
  sourceEventSeq: sourceEvent.seq,
  gameType: 'majority_minority',
  rankingPlayerIds: '0,1,2,3',
};

const beforeMoney = authority.state.players.map((player) => player.money);
const rejectedSeatPath = host.submitLocalIntent('resolve_minigame', 0, payoutData);
assert.equal(rejectedSeatPath.status, 'rejected');
assert.match(rejectedSeatPath.reason ?? '', /host-system only/i);
assert.deepEqual(
  authority.state.players.map((player) => player.money),
  beforeMoney,
  'seat/player intent must never pay Mini Game rewards',
);

const systemPayout = host.submitSystemIntent('resolve_minigame', payoutData);
assert.equal(systemPayout.status, 'accepted');
assert.deepEqual(
  authority.state.players.map((player) => player.money),
  [230, 220, 210, 200],
  'host-system path must apply 30/20/10/0 exactly once',
);

const duplicateSystemPayout = host.submitSystemIntent('resolve_minigame', payoutData);
assert.equal(duplicateSystemPayout.status, 'rejected');
assert.match(duplicateSystemPayout.reason ?? '', /already resolved/i);
assert.deepEqual(
  authority.state.players.map((player) => player.money),
  [230, 220, 210, 200],
  'duplicate host-system payout must not change B$ again',
);

host.close();
console.log('[minigame-authority-037] PASS Mini Game payout is host-system owned and single-commit');
