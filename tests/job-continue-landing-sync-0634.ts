import assert from 'node:assert/strict';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
} from '../src/core/authority';
import { computeMatchChecksum } from '../src/core/checksum';
import { replayMatchCommands } from '../src/core/replay';
import type { BoardDefinition } from '../src/core/types';
import {
  shouldCatchUpVisibleMoney0634,
  shouldCommitVisibleMoney0634,
} from '../src/ui/landingEffectSync0634';

const board: BoardDefinition = {
  id: 'job-continue-0634',
  name: '0.1.63.4 Job continuation fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal' },
    { id: 2, x: 20, y: 0, type: 'normal', feature: 'job', contentId: 'JOB_HUB_01' },
    { id: 3, x: 30, y: 0, type: 'normal' },
    { id: 4, x: 40, y: -10, type: 'normal' },
    { id: 40, x: 40, y: 10, type: 'normal' },
    { id: 5, x: 50, y: 0, type: 'money', value: -20 },
  ],
  edges: [
    { from: 0, to: 1, route: 'main' },
    { from: 1, to: 2, route: 'main' },
    { from: 2, to: 3, route: 'main' },
    { from: 3, to: 4, route: 'branch', label: 'TRÁI', parity: 'odd' },
    { from: 3, to: 40, route: 'branch', label: 'PHẢI', parity: 'even' },
    { from: 4, to: 5, route: 'main' },
    { from: 40, to: 5, route: 'main' },
  ],
};

// Seed 106496 => first authoritative movement D6 is exactly 5.
const authority = createEmptyHostAuthority(
  {
    boardId: board.id,
    startNodeId: 0,
    playerNames: ['P1'],
    seed: 106496,
  },
  { board, cards: [], news: [] },
);

const rollReceipt = submitClientIntent(authority, {
  intentId: '0634-roll-5',
  clientId: 'test',
  actorId: 0,
  type: 'roll',
  observedCommandSeq: 0,
  data: {},
});
assert.equal(rollReceipt.status, 'accepted');
assert.equal(authority.state.turn.lastRoll, 5);
assert.equal(authority.state.players[0]?.nodeId, 2, 'roll 5 must pause at Job on movement step 2');
assert.equal(authority.state.turn.phase, 'JOB_CHOICE');
assert.deepEqual(
  authority.state.pendingJobMovement,
  { roll: 5, nextStep: 3, remainingSteps: 3 },
  'Job Hub must remember the three unspent pips',
);

const checksumWithPending = computeMatchChecksum(authority.state);
const jobReceipt = submitClientIntent(authority, {
  intentId: '0634-job-choice',
  clientId: 'test',
  actorId: 0,
  type: 'choose_job',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {},
});
assert.equal(jobReceipt.status, 'accepted');
assert.equal(authority.state.pendingJobMovement, undefined);
assert.equal(authority.state.players[0]?.nodeId, 5, 'after Job resolution the same roll must continue steps 3, 4 and 5');
assert.equal(authority.state.players[0]?.money, 180, 'the final -20 money tile must resolve after resumed movement');
assert.equal(authority.state.turn.turnNumber, 2);
assert.equal(authority.state.turn.phase, 'PRE_ROLL_ACTION');
assert.notEqual(computeMatchChecksum(authority.state), checksumWithPending);

const automaticBranch = authority.source.commandLog.find(
  (command) => command.type === 'choose_branch' && command.data.automatic === true,
);
assert(automaticBranch, 'resumed movement must still HOST-auto-resolve parity branches');
assert.equal(automaticBranch.data.parity, 'odd');
assert.equal(automaticBranch.data.to, 4, 'roll 5 must take the LEFT/odd branch after Job resume');

const events = authority.state.eventLog;
const jobSelectedIndex = events.findIndex((event) => event.type === 'job_selected');
const resumedMoves = events.filter(
  (event) => event.type === 'move_step' && Number(event.data.step) >= 3,
);
const moneyLandingIndex = events.findIndex(
  (event) => event.type === 'tile_land' && Number(event.data.nodeId) === 5,
);
const moneyEffectIndex = events.findIndex(
  (event) => event.type === 'money_tile' && Number(event.data.nodeId) === 5,
);
assert(jobSelectedIndex >= 0);
assert.deepEqual(resumedMoves.map((event) => Number(event.data.step)), [3, 4, 5]);
assert(moneyLandingIndex > jobSelectedIndex, 'destination landing must occur after Job selection and resumed movement');
assert(moneyEffectIndex > moneyLandingIndex, 'money effect event must follow the destination landing event');

const replayed = replayMatchCommands(authority.source, board, [], []);
assert.deepEqual(replayed.errors, []);
assert.equal(replayed.consumedCommands, authority.source.commandLog.length);
assert.equal(computeMatchChecksum(replayed.state), computeMatchChecksum(authority.state));
assert.equal(replayed.state.players[0]?.nodeId, 5);
assert.equal(replayed.state.players[0]?.money, 180);

// Presentation policy: movement/dice never expose future B$. The visible snapshot
// advances only when the matching money-bearing effect reaches the screen.
assert.equal(shouldCommitVisibleMoney0634(undefined), false);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'dice_roll' }), false);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'move_step' }), false);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'tile_land', tileType: 'normal' }), false);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'tile_land', tileType: 'money' }), true);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'ready_bonus' }), true);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'card_play' }), true);
assert.equal(shouldCommitVisibleMoney0634({ kind: 'news' }), true);
assert.equal(shouldCatchUpVisibleMoney0634(true), false);
assert.equal(shouldCatchUpVisibleMoney0634(false), true);

console.log('[job-continue-landing-sync-0634] PASS roll 5 -> Job step 2 -> resume 3 pips + parity branch + landing-timed B$');
