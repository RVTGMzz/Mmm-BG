import assert from 'node:assert/strict';
import type { PlayerState } from '../src/core/types';
import {
  formatMoneyLeaderboardRow,
  moneyDeltas,
  moneyRankForPlayer,
  moneyRanks,
} from '../src/ui/moneyStakes';

function player(id: number, money: number, name = `P${id + 1}`): PlayerState {
  return {
    id,
    name,
    nodeId: 0,
    money,
    cardBlockTurns: 0,
    handCardIds: [],
    cardsPlayedThisTurn: 0,
  };
}

const tied = [player(0, 200), player(1, 200), player(2, 200), player(3, 200)];
assert.deepEqual(moneyRanks(tied).map((entry) => entry.playerId), [0, 1, 2, 3]);
assert(moneyRanks(tied).every((entry) => entry.marker === ''), 'all-tied opening should not crown or lifebuoy anyone');

const spread = [player(0, 180), player(1, 260), player(2, 90), player(3, 260)];
const ranks = moneyRanks(spread);
assert.deepEqual(ranks.map((entry) => entry.playerId), [1, 3, 0, 2]);
assert.equal(ranks[0]?.marker, '👑');
assert.equal(ranks[3]?.marker, '🛟');
assert.equal(moneyRankForPlayer(spread, 0)?.rank, 3);
assert.equal(moneyRankForPlayer(spread, 1)?.rank, 1);
assert.equal(moneyRankForPlayer(spread, 3)?.rank, 2, 'money ties must use lower seat ID as deterministic tiebreak');

const leaderRow = formatMoneyLeaderboardRow(spread[1]!, spread, 1, true);
assert(leaderRow.includes('▶1'), 'current player row should expose turn marker and rank');
assert(leaderRow.includes('👑'), 'leader row should expose crown');
assert(leaderRow.includes('🤖'), 'CPU row should expose CPU marker');
assert(leaderRow.includes('260B$'), 'leader row should expose wallet');

const before = [player(0, 200), player(1, 200), player(2, 200), player(3, 200)];
const after = [player(0, 230), player(1, 160), player(2, 200), player(3, 190)];
assert.deepEqual(moneyDeltas(before, after), [
  { playerId: 0, amount: 30 },
  { playerId: 1, amount: -40 },
  { playerId: 3, amount: -10 },
]);

console.log('[money-stakes-026] PASS deterministic leaderboard, markers and wallet deltas');
