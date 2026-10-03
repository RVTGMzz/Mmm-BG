import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import {
  MINI_GAME_SLOTS_059,
  miniGameRewardForSlot059,
} from '../src/core/miniGameSlots059';
import {
  minigameModeForActivePlayers,
  resolveAllInRound,
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

assert.equal(minigameModeForActivePlayers([0, 1], 'all_in'), 'rps');
assert.equal(minigameModeForActivePlayers([0, 1, 2], 'all_in'), 'all_in');

const slot2 = MINI_GAME_SLOTS_059.find((slot) => slot.contentId === 'MINIGAME_SLOT_02');
assert(slot2);
assert.equal(slot2.mode3Plus, 'all_in');
assert.equal(slot2.title, 'KÈO ALL-IN');
assert.match(slot2.description, /CHỐT|ALL-IN/i);
assert.match(slot2.description, /vượt 9/i);
assert.equal(MINI_GAME_SLOTS_059.length, 5);
assert.equal(MINI_GAME_SLOTS_059.filter((slot) => slot.mode3Plus === 'all_in').length, 1);

const resolved = resolveAllInRound(
  [0, 1, 2, 3],
  { 0: 6, 1: 4, 2: 5, 3: 2 },
  { 0: 'hold', 1: 'all_in', 2: 'all_in', 3: 'all_in' },
  { 1: 5, 2: 5, 3: 4 },
  9,
);
assert.deepEqual(resolved.scores, { 0: 6, 1: 9, 2: 0, 3: 6 });
assert.deepEqual(resolved.bustedPlayerIds, [2]);
assert.equal(resolved.secondRolls[0], undefined);
assert.equal(resolved.secondRolls[1], 5);
assert.throws(
  () => resolveAllInRound([0], { 0: 7 }, { 0: 'hold' }, {}, 9),
  /D6 1\.\.6/,
);

const payoutType = miniGameRewardType059('all_in', 'MINIGAME_SLOT_02');
assert.equal(payoutType, 'all_in@MINIGAME_SLOT_02');
assert.equal(isMiniGameRewardType(payoutType), true);
assert.equal(miniGameRewardForRank(payoutType, 1), 35);
assert.equal(miniGameRewardForRank(payoutType, 2), 10);
assert.equal(miniGameRewardForRank(payoutType, 3), 5);
assert.equal(miniGameRewardForSlot059('MINIGAME_SLOT_02', 'all_in', 4), 0);

const board: BoardDefinition = {
  id: 'all-in-ch16',
  name: 'All-In authority fixture',
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
  intentId: 'all-in-roll',
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
  intentId: 'all-in-payout',
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
assert.match(overlay, /resolveAllInRound/);
assert.match(overlay, /CHỐT/);
assert.match(overlay, /ALL-IN/);
assert.match(overlay, /tổng > 9/);
assert.match(overlay, /rankTiedIdsByDiceLowToHigh/);
assert.doesNotMatch(overlay, /Math\.random/);

console.log('[minigame-three-doors-0711] PASS CH-16 M17 All-In push-your-luck + retained HOST payout authority');
