import assert from 'node:assert/strict';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntentType,
  type HostAuthority,
} from '../src/core/authority';
import { computeMatchChecksum } from '../src/core/checksum';
import { createInitialMatchState } from '../src/core/matchState';
import { replayMatchCommands } from '../src/core/replay';
import {
  lotteryReward057,
  miniGameEligiblePlayers057,
  specialCorridorPath064,
  specialReleasePath057,
  specialReleaseSucceeds057,
} from '../src/core/specialLocations057';
import type { BoardDefinition } from '../src/core/types';

let intentSerial = 0;
function submit(authority: HostAuthority, type: ClientIntentType) {
  const actor = authority.state.players[authority.state.turn.currentPlayerIndex]!;
  intentSerial += 1;
  return submitClientIntent(authority, {
    intentId: `special-057-${intentSerial}`,
    clientId: 'special-057-test',
    actorId: actor.id,
    type,
    observedCommandSeq: hostAuthorityCommandSeq(authority),
    data: {},
  });
}

function jailBoard(): BoardDefinition {
  return {
    id: 'special-jail-057',
    name: 'Jail authority fixture retained under 0.1.64 release-in-place',
    startNodeId: 0,
    nodes: [
      { id: 0, x: 0, y: 0, type: 'normal' },
      { id: 1, x: 10, y: 0, type: 'normal', contentId: 'SPECIAL_JAIL_GATE' },
      { id: 100, x: 20, y: 0, type: 'normal', contentId: 'SPECIAL_JAIL_HOLD' },
      { id: 101, x: 30, y: 0, type: 'money', contentId: 'JAIL_EXIT_1', value: -20 },
      { id: 102, x: 40, y: 0, type: 'money', contentId: 'JAIL_EXIT_2', value: -20 },
      { id: 103, x: 50, y: 0, type: 'money', contentId: 'JAIL_EXIT_3', value: -20 },
      { id: 12, x: 60, y: 0, type: 'normal' },
      { id: 13, x: 70, y: 0, type: 'normal' },
      { id: 14, x: 80, y: 0, type: 'normal' },
      { id: 15, x: 90, y: 0, type: 'normal' },
    ],
    edges: [
      { from: 0, to: 1, route: 'main' },
      { from: 100, to: 101, route: 'branch' },
      { from: 101, to: 102, route: 'branch' },
      { from: 102, to: 103, route: 'branch' },
      { from: 103, to: 12, route: 'branch' },
      { from: 12, to: 13, route: 'main' },
      { from: 13, to: 14, route: 'main' },
      { from: 14, to: 15, route: 'main' },
    ],
  };
}

function hospitalBoard(): BoardDefinition {
  return {
    id: 'special-hospital-057',
    name: 'Hospital authority fixture retained under 0.1.64 release-in-place',
    startNodeId: 0,
    nodes: [
      { id: 0, x: 0, y: 0, type: 'normal' },
      { id: 1, x: 10, y: 0, type: 'normal', contentId: 'SPECIAL_HOSPITAL_GATE' },
      { id: 110, x: 20, y: 0, type: 'normal', contentId: 'SPECIAL_HOSPITAL_HOLD' },
      { id: 111, x: 30, y: 0, type: 'money', contentId: 'HOSPITAL_EXIT_1', value: -20 },
      { id: 112, x: 40, y: 0, type: 'money', contentId: 'HOSPITAL_EXIT_2', value: -20 },
      { id: 113, x: 50, y: 0, type: 'money', contentId: 'HOSPITAL_EXIT_3', value: -20 },
      { id: 34, x: 60, y: 0, type: 'normal' },
      { id: 35, x: 70, y: 0, type: 'normal' },
      { id: 36, x: 80, y: 0, type: 'normal' },
      { id: 37, x: 90, y: 0, type: 'normal' },
    ],
    edges: [
      { from: 0, to: 1, route: 'main' },
      { from: 110, to: 111, route: 'branch' },
      { from: 111, to: 112, route: 'branch' },
      { from: 112, to: 113, route: 'branch' },
      { from: 113, to: 34, route: 'branch' },
      { from: 34, to: 35, route: 'main' },
      { from: 35, to: 36, route: 'main' },
      { from: 36, to: 37, route: 'main' },
    ],
  };
}

function lotteryBoard(): BoardDefinition {
  return {
    id: 'special-lottery-057',
    name: 'Lottery 0.1.57 authority fixture',
    startNodeId: 0,
    nodes: [
      { id: 0, x: 0, y: 0, type: 'normal' },
      { id: 22, x: 10, y: 0, type: 'normal', contentId: 'SPECIAL_LOTTERY' },
    ],
    edges: [{ from: 0, to: 22, route: 'main' }],
  };
}

// 0.1.64 supersedes automatic release-corridor traversal while retaining the old
// corridor topology for the NEW movement D6.
assert.deepEqual(specialReleasePath057('jail'), []);
assert.deepEqual(specialReleasePath057('hospital'), []);
assert.deepEqual(specialCorridorPath064('jail'), [101, 102, 103, 12]);
assert.deepEqual(specialCorridorPath064('hospital'), [111, 112, 113, 34]);
for (let face = 1; face <= 6; face += 1) {
  assert.equal(specialReleaseSucceeds057('jail', face), [1, 3, 5].includes(face));
  assert.equal(specialReleaseSucceeds057('hospital', face), [2, 4, 5].includes(face));
  assert.equal(lotteryReward057(face), face * 20);
}

// Seed 1 => deterministic D6 stream 1,1,4,...
// First 1 enters Jail; second 1 passes release; third 4 is the fresh movement D6.
const jailSuccessBoard = jailBoard();
const jailSuccess = createEmptyHostAuthority(
  { boardId: jailSuccessBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 1 },
  { board: jailSuccessBoard, cards: [], news: [] },
);
assert.equal(submit(jailSuccess, 'roll').status, 'accepted');
assert.equal(jailSuccess.state.players[0]!.specialHold, 'jail');
assert.equal(jailSuccess.state.players[0]!.nodeId, 100);
assert.equal(jailSuccess.state.turn.turnNumber, 2);

assert.equal(submit(jailSuccess, 'roll').status, 'accepted');
assert.equal(jailSuccess.state.players[0]!.specialHold, undefined);
assert.equal(jailSuccess.state.players[0]!.nodeId, 100, '0.1.64 successful release must stay on the Jail hold node');
assert.equal(jailSuccess.state.turn.turnNumber, 2, 'successful release must remain in the same turn');
assert.equal(jailSuccess.state.turn.phase, 'PRE_ROLL_ACTION');
assert.equal(jailSuccess.state.turn.lastRoll, null, 'release D6 must be discarded before fresh movement');

assert.equal(submit(jailSuccess, 'roll').status, 'accepted');
assert.equal(jailSuccess.state.players[0]!.nodeId, 12, 'fresh roll 4 must traverse J1/J2/J3 and rejoin at node 12');
assert.equal(jailSuccess.state.turn.turnNumber, 3, 'fresh movement roll should finish the released turn normally');
assert(jailSuccess.state.eventLog.some((event) => event.type === 'special_release' && event.data.success === true));

const replayedJail = replayMatchCommands(jailSuccess.source, jailSuccessBoard, [], []);
assert.deepEqual(replayedJail.errors, []);
assert.equal(computeMatchChecksum(replayedJail.state), computeMatchChecksum(jailSuccess.state));

// Seed 11 => deterministic D6 stream 1,2,... Jail release face 2 fails.
const jailFailBoard = jailBoard();
const jailFail = createEmptyHostAuthority(
  { boardId: jailFailBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 11 },
  { board: jailFailBoard, cards: [], news: [] },
);
assert.equal(submit(jailFail, 'roll').status, 'accepted');
assert.equal(submit(jailFail, 'roll').status, 'accepted');
assert.equal(jailFail.state.players[0]!.specialHold, 'jail');
assert.equal(jailFail.state.players[0]!.nodeId, 100);
assert.equal(jailFail.state.turn.turnNumber, 3, 'failed Jail release must end the turn');

// Seed 11 second face 2 succeeds for Hospital and now also stays on hold node 110.
const hospitalSuccessBoard = hospitalBoard();
const hospitalSuccess = createEmptyHostAuthority(
  { boardId: hospitalSuccessBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 11 },
  { board: hospitalSuccessBoard, cards: [], news: [] },
);
assert.equal(submit(hospitalSuccess, 'roll').status, 'accepted');
assert.equal(hospitalSuccess.state.players[0]!.specialHold, 'hospital');
assert.equal(submit(hospitalSuccess, 'roll').status, 'accepted');
assert.equal(hospitalSuccess.state.players[0]!.specialHold, undefined);
assert.equal(hospitalSuccess.state.players[0]!.nodeId, 110, '0.1.64 Hospital release must stay on the Hospital hold node');
assert.equal(hospitalSuccess.state.turn.turnNumber, 2);
assert.equal(hospitalSuccess.state.turn.phase, 'PRE_ROLL_ACTION');
assert.equal(hospitalSuccess.state.turn.lastRoll, null);

// Seed 1 second face 1 fails Hospital release.
const hospitalFailBoard = hospitalBoard();
const hospitalFail = createEmptyHostAuthority(
  { boardId: hospitalFailBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 1 },
  { board: hospitalFailBoard, cards: [], news: [] },
);
assert.equal(submit(hospitalFail, 'roll').status, 'accepted');
assert.equal(submit(hospitalFail, 'roll').status, 'accepted');
assert.equal(hospitalFail.state.players[0]!.specialHold, 'hospital');
assert.equal(hospitalFail.state.turn.turnNumber, 3);

// Lottery is movement D6 + a separate authoritative payout D6. Seed 1 => 1 then 1 => +20 B$.
const lottoBoard = lotteryBoard();
const lottery = createEmptyHostAuthority(
  { boardId: lottoBoard.id, startNodeId: 0, playerNames: ['P1'], seed: 1 },
  { board: lottoBoard, cards: [], news: [] },
);
assert.equal(submit(lottery, 'roll').status, 'accepted');
assert.equal(lottery.state.players[0]!.money, 220);
const lotteryEvent = lottery.state.eventLog.find((event) => event.type === 'lottery');
assert(lotteryEvent);
assert.equal(lotteryEvent.data.roll, 1);
assert.equal(lotteryEvent.data.amount, 20);

const eligibilityState = createInitialMatchState({
  boardId: 'eligibility-057',
  startNodeId: 0,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 57,
});
eligibilityState.players[0]!.specialHold = 'jail';
eligibilityState.players[2]!.specialHold = 'hospital';
assert.deepEqual(miniGameEligiblePlayers057(eligibilityState.players).map((player) => player.id), [1, 3]);

const checksumFree = computeMatchChecksum(createInitialMatchState({
  boardId: 'checksum-057', startNodeId: 0, playerNames: ['P1'], seed: 57,
}));
const heldState = createInitialMatchState({
  boardId: 'checksum-057', startNodeId: 0, playerNames: ['P1'], seed: 57,
});
heldState.players[0]!.specialHold = 'jail';
assert.notEqual(computeMatchChecksum(heldState), checksumFree, 'holding state must participate in checksum');

console.log('[special-locations-057/0.1.64] PASS release-in-place + fresh D6 corridor + Lottery x20 + eligibility + checksum');
