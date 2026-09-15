import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import cardsJson from '../src/content/core/cards_mvp.json' with { type: 'json' };
import newsJson from '../src/content/core/news_mvp_demo.json' with { type: 'json' };
import boardJson from '../src/content/city/board_city_mvp.json' with { type: 'json' };
import {
  applyCardEffect,
  getValidTargets,
  type CardDefinition,
} from '../src/core/cards';
import {
  advanceMatchTurn,
  createInitialMatchState,
  type MatchCommand,
} from '../src/core/matchState';
import { MINI_GAME_SLOTS_059, miniGameRewardTable059 } from '../src/core/miniGameSlots059';
import { applyNewsEffect, type NewsDefinition } from '../src/core/news';
import {
  ECONOMY_060,
  MVP_TARGET_LAPS_060,
  PACING_060,
  isPlayerFinished060,
  miniGameEligiblePlayers060,
} from '../src/core/pacingEconomy060';
import { createRandomSource } from '../src/core/rng';
import { rollD6 } from '../src/core/dice';
import { replayMatchCommands } from '../src/core/replay';
import { SPECIAL_LOCATION_057 } from '../src/core/specialLocations057';
import type { BoardDefinition, PlayerState } from '../src/core/types';
import { CANONICAL_PRESENTATION_0561 } from '../src/ui/canonicalPresentation0561';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const NEWS = newsJson as NewsDefinition[];

assert.equal(MVP_TARGET_LAPS_060, 1);
assert.equal(ECONOMY_060.startingMoney, 200);
const defaultState = createInitialMatchState({
  boardId: BOARD.id,
  startNodeId: BOARD.startNodeId,
  playerNames: ['P1', 'P2', 'P3', 'P4'],
  seed: 6001,
});
assert.deepEqual(defaultState.players.map((player) => player.money), [200, 200, 200, 200]);

// 0.1.60 intentionally leaves locked Draft D / 0.1.57 values alone.
const mainMoney = BOARD.nodes
  .filter((node) => node.id >= 0 && node.id < 44 && node.type === 'money')
  .map((node) => node.value ?? 0)
  .sort((a, b) => a - b);
assert.deepEqual(mainMoney, [-20, -20, -20, -20, 25, 25, 25, 25]);
assert.equal(SPECIAL_LOCATION_057.lottery.multiplier, 20, 'Lottery x20 is not part of the 0.1.60 tune.');

// Five Mini Game identities stay distinct, but one-lap inflation is lower.
assert.equal(MINI_GAME_SLOTS_059.length, 5);
for (const slot of MINI_GAME_SLOTS_059) {
  assert.equal(
    miniGameRewardTable059(slot.contentId, 'majority_minority').reduce((sum, amount) => sum + amount, 0),
    ECONOMY_060.miniGameMajorityTotal,
  );
  assert.equal(
    miniGameRewardTable059(slot.contentId, 'rps').slice(0, 2).reduce((sum, amount) => sum + amount, 0),
    ECONOMY_060.miniGameRpsTotal,
  );
}
assert.equal(new Set(MINI_GAME_SLOTS_059.map((slot) => slot.majorityRewards.join(','))).size, 5);

const tactical = CARDS.find((card) => card.id === 'ACT_008');
const richTax = CARDS.find((card) => card.id === 'ACT_015');
const catchUp = CARDS.find((card) => card.id === 'ACT_016');
const groupLossCards = CARDS.filter((card) => card.effect.type === 'percent_loss_all_others');
assert(tactical?.effect.type === 'tactical_choice');
assert.equal(tactical.effect.safeAmount, ECONOMY_060.cardTacticalSafe);
assert.equal(tactical.effect.taxPercent, 0.15);
assert(richTax?.effect.type === 'rich_tax');
assert.equal(richTax.effect.percent, ECONOMY_060.cardRichTaxPercent);
assert(catchUp?.effect.type === 'catch_up_bonus');
assert.equal(catchUp.effect.poorAmount, ECONOMY_060.cardCatchUpPoor);
assert.equal(catchUp.effect.baseAmount, ECONOMY_060.cardCatchUpBase);
assert(groupLossCards.every((card) => card.effect.type === 'percent_loss_all_others' && card.effect.percent === ECONOMY_060.cardGroupLossPercent));

const selfNews = NEWS.filter((news) => news.effect.type === 'money_delta_self');
assert.deepEqual(
  selfNews.map((news) => news.effect.type === 'money_delta_self' ? news.effect.amount : 0).sort((a, b) => a - b),
  [-30, -30, -30, 25, 25, 25],
);
const groupNews = NEWS
  .filter((news) => news.effect.type === 'money_delta_all')
  .map((news) => news.effect.type === 'money_delta_all' ? news.effect.amount : 0)
  .sort((a, b) => a - b);
assert.deepEqual(groupNews, [-15, -15, -10, 10]);

// Weighted direct News expectation stays close to the old +4.25 B$/draw while variance drops.
const weightedDirectExpectation = NEWS.reduce((sum, news) => {
  if (news.effect.type !== 'money_delta_self' && news.effect.type !== 'money_delta_all') return sum;
  return sum + news.dropWeight * news.effect.amount;
}, 0) / 1000;
assert(Math.abs(weightedDirectExpectation - 4.3) < 1e-9);

const players: PlayerState[] = [
  { id: 0, name: 'Finished', nodeId: 0, money: 320, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0, lapsCompleted: 1 },
  { id: 1, name: 'Runner', nodeId: 20, money: 200, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0, lapsCompleted: 0 },
  { id: 2, name: 'Held', nodeId: 100, money: 180, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0, lapsCompleted: 0, specialHold: 'jail' },
  { id: 3, name: 'Runner 2', nodeId: 30, money: 220, cardBlockTurns: 0, handCardIds: [], cardsPlayedThisTurn: 0, lapsCompleted: 0 },
];
assert.equal(isPlayerFinished060(players[0]!), true);
assert.deepEqual(getValidTargets(players, 1).map((player) => player.id), [2, 3], 'finished player must leave Card target pool');
assert.deepEqual(miniGameEligiblePlayers060(players).map((player) => player.id), [1, 3], 'finished + held players must be excluded from Mini Games');

const groupGain: NewsDefinition = {
  id: 'TEST_060_GROUP', title: 'Test', rarity: 'N', dropWeight: 1, impact: '⭐', description: '',
  targetMode: 'all_players', effect: { type: 'money_delta_all', amount: 10 },
};
applyNewsEffect(groupGain, players[1]!, players);
assert.equal(players[0]!.money, 320, 'finished score must ignore later global News');
assert.equal(players[1]!.money, 210);
assert.equal(players[2]!.money, 190);
assert.equal(players[3]!.money, 230);

const groupLoss = CARDS.find((card) => card.effect.type === 'percent_loss_all_others')!;
applyCardEffect(groupLoss, players[1]!, players);
assert.equal(players[0]!.money, 320, 'finished score must ignore later all-opponent Cards');

const jailCard = CARDS.find((card) => card.id === 'ACT_017')!;
assert.throws(
  () => applyCardEffect(jailCard, players[1]!, players, players[0]),
  /final B\$ is already locked/i,
  'authoritative effect must reject a finished target even if UI is bypassed',
);

// Turn order retires finishers while at least one runner remains.
const orderState = createInitialMatchState({
  boardId: 'turn-skip-060', startNodeId: 0, playerNames: ['P1', 'P2', 'P3', 'P4'], seed: 6002,
  playOrder: [0, 1, 2, 3],
});
orderState.players[0]!.lapsCompleted = 1;
orderState.turn.currentPlayerIndex = 3;
assert.equal(advanceMatchTurn(orderState), 1, 'next turn must skip finished P1 and continue with P2');

// Force a >1 roll on a two-node loop. Crossing READY must discard all remaining pips.
const finishBoard: BoardDefinition = {
  id: 'finish-lock-060',
  name: '0.1.60 finish lock fixture',
  startNodeId: 0,
  nodes: [
    { id: 0, x: 0, y: 0, type: 'ready', contentId: 'READY' },
    { id: 1, x: 10, y: 0, type: 'normal', contentId: 'M02' },
  ],
  edges: [
    { from: 0, to: 1, route: 'main' },
    { from: 1, to: 0, route: 'main' },
  ],
};
let finishSeed = 1;
for (; finishSeed < 10_000; finishSeed += 1) {
  const probe = createInitialMatchState({ boardId: finishBoard.id, startNodeId: 0, playerNames: ['P1', 'P2'], seed: finishSeed });
  const random = createRandomSource(probe.rng);
  if (rollD6(random) >= 3) break;
}
assert(finishSeed < 10_000);
const finishSource = createInitialMatchState({
  boardId: finishBoard.id,
  startNodeId: 0,
  playerNames: ['P1', 'P2'],
  seed: finishSeed,
});
const finishCommand: MatchCommand = {
  seq: 1,
  type: 'roll',
  turnNumber: 1,
  playerIndex: 0,
  actorId: 0,
  data: {},
};
finishSource.commandLog = [finishCommand];
finishSource.nextCommandSeq = 2;
const finishReplay = replayMatchCommands(finishSource, finishBoard, [], []);
assert.deepEqual(finishReplay.errors, []);
const rolled = Number(finishReplay.state.eventLog.find((event) => event.type === 'dice_roll')?.data.result ?? 0);
assert(rolled >= 3, 'fixture must prove there were pips available after crossing READY');
assert.equal(finishReplay.state.players[0]!.nodeId, 0, 'finisher must stop exactly on READY');
assert.equal(finishReplay.state.players[0]!.lapsCompleted, 1);
assert.equal(finishReplay.state.eventLog.filter((event) => event.type === 'move_step').length, 2, 'remaining die pips must be discarded at finish');
const ready = finishReplay.state.eventLog.find((event) => event.type === 'ready_pass');
assert.equal(ready?.data.finishLocked, true);
assert.equal(finishReplay.state.turn.currentPlayerIndex, 1, 'finished P1 must retire and next turn belongs to unfinished P2');

assert(PACING_060.globalAutoMaxMs < 10_000);
assert(PACING_060.passiveAutoMaxMs < 6_000);

const scene061 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene061.ts', import.meta.url), 'utf8');
const scene060 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene060.ts', import.meta.url), 'utf8');
const scene059 = readFileSync(new URL('../src/scenes/CareerMinigameBoardScene059.ts', import.meta.url), 'utf8');
const main = readFileSync(new URL('../src/main.ts', import.meta.url), 'utf8');
assert(scene061.includes('extends CareerMinigameBoardScene060'));
assert(scene060.includes('extends CareerMinigameBoardScene059'));
assert(scene059.includes('extends CareerMinigameBoardScene058'));
assert(scene060.includes('B$ ĐÃ KHÓA'));
assert(!scene060.includes('Math.random'));
assert(!scene060.includes('submitIntent('));
assert(!scene061.includes('Math.random'));
assert(!scene061.includes('submitIntent('));
assert(main.includes('CareerMinigameBoardScene061 as ActiveBoardScene'));
assert.equal(CANONICAL_PRESENTATION_0561.version, '0.1.61');

console.log('[pacing-economy-060] PASS finish-stop + retired turns + locked final B$ + tighter Card/News/Mini economy retained beneath 0.1.61 telemetry wrapper');
