import assert from 'node:assert/strict';
import boardJson from '../src/content/city/board_city_mvp.json';
import cardsJson from '../src/content/core/cards_mvp.json';
import {
  applyCardEffect,
  pickRichestOtherTarget,
  tacticalChoicePressureAmount,
  type CardDefinition,
} from '../src/core/cards';
import { createInitialMatchState } from '../src/core/matchState';
import { chooseTestBotIntent, cpuQuirkLine, shouldCpuQuirk } from '../src/core/testBot';
import type { BoardDefinition } from '../src/core/types';
import { NPC_CHAT_DURATION_MULTIPLIER, npcChatDurationMs } from '../src/ui/npcChatPolicy';

const BOARD = boardJson as BoardDefinition;
const CARDS = cardsJson as CardDefinition[];
const tactical = CARDS.find((card) => card.id === 'ACT_008');
assert(tactical, 'ACT_008 tactical card missing');
assert.equal(tactical.title, 'Kèo Hai Cửa');
assert.equal(tactical.effect.type, 'tactical_choice');
if (tactical.effect.type !== 'tactical_choice') throw new Error('ACT_008 effect drifted');
assert.equal(tactical.effect.safeAmount, 20);
assert.equal(tactical.effect.taxPercent, 0.15);

function makeState(values: number[]) {
  const state = createInitialMatchState({
    boardId: BOARD.id,
    startNodeId: BOARD.startNodeId,
    playerNames: ['P1', 'P2', 'P3', 'P4'],
    seed: 127,
  });
  state.players.forEach((player, index) => { player.money = values[index] ?? 0; });
  state.turn.phase = 'PRE_ROLL_ACTION';
  return state;
}

const safeState = makeState([100, 300, 240, 180]);
const safe = applyCardEffect(tactical, safeState.players[0]!, safeState.players, undefined, 'safe');
assert.equal(safe.amount, 20);
assert.equal(safeState.players[0]?.money, 120);
assert.equal(safeState.players[1]?.money, 300);
assert.deepEqual(safe.affectedPlayerIds, [0]);

const pressureState = makeState([100, 300, 300, 180]);
assert.equal(pickRichestOtherTarget(pressureState.players, 0)?.id, 1, 'Richest tie must prefer lower seat ID');
assert.equal(tacticalChoicePressureAmount(tactical.effect, pressureState.players, 0), 45);
const pressure = applyCardEffect(tactical, pressureState.players[0]!, pressureState.players, undefined, 'pressure');
assert.equal(pressure.amount, 45);
assert.equal(pressureState.players[0]?.money, 145);
assert.equal(pressureState.players[1]?.money, 255);
assert.equal(pressureState.players[2]?.money, 300);
assert.deepEqual(pressure.affectedPlayerIds, [0, 1]);

const invalidState = makeState([100, 200, 150, 125]);
assert.throws(
  () => applyCardEffect(tactical, invalidState.players[0]!, invalidState.players, undefined, '???' as never),
  /requires tactical choice/,
);

const pressureBot = makeState([100, 300, 200, 150]);
pressureBot.players[0]!.handCardIds = ['ACT_008'];
const rngBeforePressure = pressureBot.rng.calls;
const pressureDecision = chooseTestBotIntent(pressureBot, BOARD, CARDS);
assert.equal(pressureDecision?.type, 'play_card');
assert.equal(pressureDecision?.data.choice, 'pressure');
assert.equal(pressureBot.rng.calls, rngBeforePressure, 'CPU tactical evaluation must not consume gameplay RNG');

const safeBot = makeState([100, 100, 100, 100]);
safeBot.players[0]!.handCardIds = ['ACT_008'];
const rngBeforeSafe = safeBot.rng.calls;
const safeDecision = chooseTestBotIntent(safeBot, BOARD, CARDS);
assert.equal(safeDecision?.type, 'play_card');
assert.equal(safeDecision?.data.choice, 'safe');
assert.equal(safeBot.rng.calls, rngBeforeSafe, 'CPU safe evaluation must not consume gameplay RNG');

const quirkBot = makeState([100, 300, 200, 150]);
quirkBot.turn.turnNumber = 8;
quirkBot.players[0]!.handCardIds = ['ACT_008'];
const rngBeforeQuirk = quirkBot.rng.calls;
assert.equal(shouldCpuQuirk(quirkBot, 0, 'ACT_008'), true, 'turn 8 fixture should hit the rare CPU quirk');
const quirkDecision = chooseTestBotIntent(quirkBot, BOARD, CARDS);
assert.equal(quirkDecision?.data.choice, 'safe', 'rare quirk intentionally flips the otherwise-better pressure choice');
assert.equal(quirkBot.rng.calls, rngBeforeQuirk, 'CPU quirk must consume zero gameplay RNG');
assert(cpuQuirkLine(8, 0).length > 0, 'CPU quirk needs visible side-chat copy');

assert.equal(NPC_CHAT_DURATION_MULTIPLIER, 2.5);
assert.equal(npcChatDurationMs(1700, true), 4250, 'NPC side chat should linger 2.5x');
assert.equal(npcChatDurationMs(1700, false), 1700, 'human side chat timing must remain unchanged');

const rarityWeight = CARDS
  .filter((card) => card.rarity === 'R')
  .reduce((sum, card) => sum + card.dropWeight, 0);
assert.equal(rarityWeight, 300, 'R rarity total must stay 300/1000');

console.log('[tactical-choice-027/0.1.60] PASS tuned tactical choice + rare CPU quirk + 2.5x NPC chat');
