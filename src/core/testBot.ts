import type { ClientIntentType } from './authority';
import { getOutgoingEdges, pickParityEdge } from './board';
import {
  getValidTargets,
  getValidTargetsForCard,
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

function chooseCardTarget(state: MatchState, casterId: number, card: CardDefinition): PlayerState | undefined {
  return getValidTargetsForCard(card, state.players, casterId)
    .slice()
    .sort((a, b) => b.money - a.money || a.id - b.id)[0];
}

export function cpuQuirkForTurn(turnNumber: number, actorId: number, cardId: string): boolean {
  let cardValue = 0;
  for (let index = 0; index < cardId.length; index += 1) cardValue += cardId.charCodeAt(index);
  const bucket = (Math.max(1, turnNumber) * 17 + (actorId + 1) * 41 + cardValue) >>> 0;
  return bucket % 20 === 0;
}

export function shouldCpuQuirk(state: MatchState, actorId: number, cardId: string): boolean {
  return cpuQuirkForTurn(state.turn.turnNumber, actorId, cardId);
}

export function cpuQuirkLine(turnNumber: number, actorId: number): string {
  const lines = [
    'Ấy chết, bấm trượt tay 😭',
    'Khoan... tui định bấm cái khác mà?',
    'Ủa tay đi trước não rồi 😭',
    'Ơ... thôi coi như chiến thuật nha.',
  ];
  return lines[Math.abs(turnNumber + actorId) % lines.length] ?? lines[0];
}

export function chooseTestBotIntent(
  state: MatchState,
  board: BoardDefinition,
  cards: readonly CardDefinition[],
): TestBotDecision | undefined {
  const actor = currentPlayer(state);
  if (!actor) return undefined;

  // 0.1.57: holding locations own the turn opener. A held CPU must roll the
  // authoritative release check before considering cards or normal movement.
  if (state.turn.phase === 'PRE_ROLL_ACTION' && actor.specialHold) {
    return {
      type: 'roll',
      data: {},
      reason: actor.specialHold === 'jail' ? 'đổ xúc xắc xin thả khỏi Đồn' : 'đổ xúc xắc xin xuất viện',
    };
  }

  if (state.turn.phase === 'JOB_CHOICE') {
    if ((state.pendingJobOfferIds ?? []).length !== 3) return undefined;
    return {
      type: 'choose_job',
      data: {},
      reason: 'đổ xúc xắc Job để nhận 1 trong 3 nghề',
    };
  }

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
      const cpuQuirk = shouldCpuQuirk(state, actor.id, card.id);
      if (card.targetMode === 'single_other') {
        const target = card.effect.type === 'send_to_special'
          ? chooseCardTarget(state, actor.id, card)
          : chooseSingleTarget(state, actor.id);
        if (target) targetId = target.id;
        else return { type: 'roll', data: {}, reason: 'không có target hợp lệ nên roll' };
      }

      // 0.1.60 finish-lock can retire every opponent before the last runner finishes.
      // Random-target Cards must not be submitted in that state because HOST correctly
      // rejects them when no active opponent exists. CPU simply keeps the Card and rolls.
      if (card.targetMode === 'random_other' && getValidTargets(state.players, actor.id).length === 0) {
        return { type: 'roll', data: {}, reason: 'không có target ngẫu nhiên hợp lệ nên roll' };
      }

      if (card.effect.type === 'tactical_choice') {
        const safeAmount = Math.max(0, Math.floor(card.effect.safeAmount));
        const pressureAmount = tacticalChoicePressureAmount(card.effect, state.players, actor.id);
        const optimal = pressureAmount > safeAmount ? 'pressure' : 'safe';
        choice = cpuQuirk ? (optimal === 'pressure' ? 'safe' : 'pressure') : optimal;
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
