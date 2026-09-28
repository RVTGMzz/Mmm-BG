import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  MINI_GAME_SLOTS_059,
  miniGameRewardForSlot059,
} from '../src/core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveThreeDoorsRound,
  threeDoorForRoll,
} from '../src/core/minigames';
import {
  isMiniGameRewardType,
  miniGameRewardForRank,
  miniGameRewardType059,
} from '../src/core/minigameRewards';
import {
  createEmptyHostAuthority,
  hostAuthorityCommandSeq,
  submitClientIntent,
} from '../src/core/authority';
import type { BoardDefinition } from '../src/core/types';

assert.equal(threeDoorForRoll(1), 'a');
assert.equal(threeDoorForRoll(2), 'a');
assert.equal(threeDoorForRoll(3), 'b');
assert.equal(threeDoorForRoll(4), 'b');
assert.equal(threeDoorForRoll(5), 'c');
assert.equal(threeDoorForRoll(6), 'c');
assert.throws(() => threeDoorForRoll(0), /D6 1\.\.6/);
assert.throws(() => threeDoorForRoll(7), /D6 1\.\.6/);

assert.equal(minigameModeForActivePlayers([0, 1], 'three_doors'), 'rps');
assert.equal(minigameModeForActivePlayers([0, 1, 2], 'three_doors'), 'three_doors');
assert.equal(minigameModeForActivePlayers([0, 1, 2, 3]), 'majority_minority');

const slot2 = MINI_GAME_SLOTS_059.find((slot) => slot.contentId === 'MINIGAME_SLOT_02');
assert(slot2);
assert.equal(slot2.mode3Plus, 'three_doors');
assert.equal(slot2.title, 'KÈO ALL-IN');
for (const slot of MINI_GAME_SLOTS_059.filter((slot) => slot.contentId !== 'MINIGAME_SLOT_02')) {
  assert.equal(slot.mode3Plus, 'majority_minority');
}

const hit = resolveThreeDoorsRound(
  [0, 1, 2, 3],
  { 0: 'a', 1: 'b', 2: 'b', 3: 'c' },
  4,
);
assert.equal(hit.winningDoor, 'b');
assert.deepEqual(hit.survivingPlayerIds, [1, 2]);
assert.deepEqual(hit.eliminatedPlayerIds, [0, 3]);
assert.equal(hit.tied, false);

const nobody = resolveThreeDoorsRound([0, 1, 2], { 0: 'a', 1: 'a', 2: 'c' }, 3);
assert.equal(nobody.winningDoor, 'b');
assert.equal(nobody.tied, true);
assert.deepEqual(nobody.survivingPlayerIds, [0, 1, 2]);

const everybody = resolveThreeDoorsRound([0, 1, 2], { 0: 'c', 1: 'c', 2: 'c' }, 6);
assert.equal(everybody.tied, true);
assert.deepEqual(everybody.eliminatedPlayerIds, []);

const payoutType = miniGameRewardType059('three_doors', 'MINIGAME_SLOT_02');
assert.equal(payoutType, 'three_doors@MINIGAME_SLOT_02');
assert.equal(isMiniGameRewardType(payoutType), true);
assert.equal(miniGameRewardForRank(payoutType, 1), 35);
assert.equal(miniGameRewardForRank(payoutType, 2), 10);
assert.equal(miniGameRewardForRank(payoutType, 3), 5);
assert.equal(miniGameRewardForSlot059('MINIGAME_SLOT_02', 'three_doors', 4), 0);

const board: BoardDefinition = {
  id: 'three-doors-0711',
  name: 'Three Doors authority fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'normal' },
    { id: 1, x: 10, y: 0, type: 'normal', feature: 'minigame', contentId: 'MINIGAME_SLOT_02' },
  ],
  edges: [{ from: 0, to: 1, route: 'main' }],
};
const authority = createEmptyHostAuthority(
  { boardId: board.id, startNodeId: 0, playerNames: ['P1', 'P2', 'P3', 'P4'], seed: 7111 },
  { board, cards: [], news: [] },
);
const roll = submitClientIntent(authority, {
  intentId: 'three-doors-roll',
  clientId: 'test',
  actorId: 0,
  type: 'roll',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {},
});
assert.equal(roll.status, 'accepted');
const sourceEvent = authority.state.eventLog.find((event) => event.type === 'minigame_tile');
assert(sourceEvent);
const payout = submitClientIntent(authority, {
  intentId: 'three-doors-payout',
  clientId: 'host-system',
  actorId: authority.state.players[authority.state.turn.currentPlayerIndex]!.id,
  type: 'resolve_minigame',
  observedCommandSeq: hostAuthorityCommandSeq(authority),
  data: {
    sourceEventSeq: sourceEvent.seq,
    gameType: payoutType,
    rankingPlayerIds: '0,1,2,3',
  },
});
assert.equal(payout.status, 'accepted');
assert.deepEqual(authority.state.players.map((player) => player.money), [235, 210, 205, 200]);

const overlay = await readFile('src/ui/MiniGameOverlay.ts', 'utf8');
assert.match(overlay, /slot\.mode3Plus/);
assert.match(overlay, /resolveThreeDoorsRound/);
assert.match(overlay, /D6: 1–2=A • 3–4=B • 5–6=C/);
assert.match(overlay, /CỬA A/);
assert.match(overlay, /CỬA B/);
assert.match(overlay, /CỬA C/);
assert.doesNotMatch(overlay, /Math\.random/);

console.log('[minigame-three-doors-0711] PASS M17 BA CỬA deterministic rule + retained HOST payout authority');
