import type { ClientIntentType } from './authority';
import { getOutgoingEdges, pickParityEdge } from './board';
import {
  getValidTargets,
  tacticalChoicePressureAmount,
  type CardDefinition,
} from './cards';
import type { MatchEventValue, MatchState } from './matchState';
import { MVP_MAX_CARD_PLAYS_PER_TURN } from './rules';
import type { BoardDefinition, PlayerState } from './types';

export interface TestBotDecision {
  type: ClientIntentType;
  data: Record<string, MatchEventValue>;
  reason: string;
}

function currentPlayer(state: MatchState): PlayerState | undefined {
  return state.players[state.turn.currentPlayerIndex];
}

function chooseSingleTarget(state: MatchState, casterId: number): PlayerState | undefined {
  return getValidTargets(state.players, casterId)
    .slice()
    .sort((a, b) => b.money - a.money || a.id - b.id)[0];
}

/**
 * Tiny deterministic CPU used only for playtest/autoplay.
 * It intentionally does not consume MatchState RNG, so adding/removing a test bot
 * does not silently alter dice/card/news randomness beyond the commands it chooses.
 */
export function chooseTestBotIntent(
  state: MatchState,
  board: BoardDefinition,
  cards: readonly CardDefinition[],
): TestBotDecision | undefined {
  const actor = currentPlayer(state);
  if (!actor) return undefined;

  if (state.turn.phase === 'BRANCH_CHOICE') {
    const outgoing = getOutgoingEdges(board, actor.nodeId);
    const roll = state.turn.lastRoll ?? 0;
    const edge = pickParityEdge(outgoing, roll);
    if (!edge) return undefined;
    const parityLabel = Math.abs(Math.floor(roll)) % 2 === 0 ? 'chẵn' : 'lẻ';
    return {
      type: 'choose_branch',
      data: { to: edge.to },
      reason: `xúc xắc ${roll} ${parityLabel} → ${edge.label ?? `${edge.from}→${edge.to}`}`,
    };
  }

  if (state.turn.phase !== 'PRE_ROLL_ACTION') return undefined;

  const canPlayCard =
    actor.cardBlockTurns <= 0 &&
    actor.cardsPlayedThisTurn < MVP_MAX_CARD_PLAYS_PER_TURN &&
    actor.handCardIds.length > 0;

  if (canPlayCard) {
    const cardId = actor.handCardIds[0];
    const card = cards.find((candidate) => candidate.id === cardId);
    if (card) {
      let targetId = -1;
      let choice: MatchEventValue = null;
      if (card.targetMode === 'single_other') {
        const target = chooseSingleTarget(state, actor.id);
        if (target) targetId = target.id;
        else return { type: 'roll', data: {}, reason: 'không có target hợp lệ nên roll' };
      }

      if (card.effect.type === 'tactical_choice') {
        const safeAmount = Math.max(0, Math.floor(card.effect.safeAmount));
        const pressureAmount = tacticalChoicePressureAmount(card.effect, state.players, actor.id);
        choice = pressureAmount > safeAmount ? 'pressure' : 'safe';
      }

      return {
        type: 'play_card',
        data: { cardId: card.id, targetId, choice },
        reason: card.effect.type === 'tactical_choice'
          ? `dùng ${card.title} → ${choice === 'pressure' ? 'Ép Top 1' : 'Ăn Chắc'}`
          : `dùng ${card.title}`,
      };
    }
  }

  return {
    type: 'roll',
    data: {},
    reason: 'đổ xúc xắc',
  };
}
