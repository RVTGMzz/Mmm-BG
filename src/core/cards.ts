import type { FaceExpression } from './session';
import type { PlayerState } from './types';

export type CardRarity = 'N' | 'R' | 'SR' | 'SSR';
export type CardFaceRole = 'caster' | 'target';
export type CardTargetMode = 'single_other' | 'random_other' | 'all_others';

export interface CardFaceSlot {
  role: CardFaceRole;
  expression: FaceExpression;
  x: number;
  y: number;
  size: number;
  rotation?: number;
}

export interface StealMoneyEffect {
  type: 'steal_money';
  amount: number;
}

export interface BlockCardsEffect {
  type: 'block_cards';
  turns: number;
}

export interface PercentLossAllOthersEffect {
  type: 'percent_loss_all_others';
  percent: number;
}

export interface SwapMoneyEffect {
  type: 'swap_money';
}

export type CardEffect =
  | StealMoneyEffect
  | BlockCardsEffect
  | PercentLossAllOthersEffect
  | SwapMoneyEffect;

export interface CardDefinition {
  id: string;
  title: string;
  rarity: CardRarity;
  dropWeight: number;
  impact: string;
  description: string;
  targetMode: CardTargetMode;
  effect: CardEffect;
  faceSlots: CardFaceSlot[];
}

export interface CardResolution {
  summary: string;
  affectedPlayerIds: number[];
  amount?: number;
}

export function drawWeightedCard(
  cards: CardDefinition[],
  random: () => number = Math.random,
): CardDefinition | undefined {
  const enabled = cards.filter((card) => Number.isFinite(card.dropWeight) && card.dropWeight > 0);
  const total = enabled.reduce((sum, card) => sum + card.dropWeight, 0);
  if (total <= 0) return undefined;

  let roll = random() * total;
  for (const card of enabled) {
    roll -= card.dropWeight;
    if (roll < 0) return card;
  }

  return enabled[enabled.length - 1];
}

export function getValidTargets<T extends PlayerState>(players: T[], casterId: number): T[] {
  return players.filter((player) => player.id !== casterId);
}

export function pickRandomOtherTarget<T extends PlayerState>(
  players: T[],
  casterId: number,
  random: () => number = Math.random,
): T | undefined {
  const candidates = getValidTargets(players, casterId);
  if (candidates.length === 0) return undefined;
  const index = Math.min(candidates.length - 1, Math.floor(random() * candidates.length));
  return candidates[index];
}

function requiredTarget(target: PlayerState | undefined, card: CardDefinition): PlayerState {
  if (!target) {
    throw new Error(`Card ${card.id} requires a target.`);
  }
  return target;
}

export function applyCardEffect(
  card: CardDefinition,
  caster: PlayerState,
  players: PlayerState[],
  target?: PlayerState,
): CardResolution {
  switch (card.effect.type) {
    case 'steal_money': {
      const resolvedTarget = requiredTarget(target, card);
      const requested = Math.max(0, Math.floor(card.effect.amount));
      const amount = Math.min(requested, Math.max(0, resolvedTarget.money));
      resolvedTarget.money -= amount;
      caster.money += amount;

      return {
        amount,
        affectedPlayerIds: [caster.id, resolvedTarget.id],
        summary: `${caster.name} lấy ${amount}B$ từ ${resolvedTarget.name}.`,
      };
    }

    case 'block_cards': {
      const resolvedTarget = requiredTarget(target, card);
      const turns = Math.max(1, Math.floor(card.effect.turns));
      resolvedTarget.cardBlockTurns = Math.max(resolvedTarget.cardBlockTurns, turns);

      return {
        affectedPlayerIds: [resolvedTarget.id],
        summary: `${resolvedTarget.name} bị khóa Lá Bài trong ${turns} lượt.`,
      };
    }

    case 'percent_loss_all_others': {
      const percent = Math.min(1, Math.max(0, card.effect.percent));
      const opponents = players.filter((player) => player.id !== caster.id);
      let totalLost = 0;

      for (const opponent of opponents) {
        const loss = Math.floor(Math.max(0, opponent.money) * percent);
        opponent.money -= loss;
        totalLost += loss;
      }

      return {
        amount: totalLost,
        affectedPlayerIds: opponents.map((player) => player.id),
        summary: `${caster.name} khiến tất cả người chơi khác mất ${Math.round(percent * 100)}% B$ (tổng ${totalLost}B$).`,
      };
    }

    case 'swap_money': {
      const resolvedTarget = requiredTarget(target, card);
      const casterMoney = caster.money;
      caster.money = resolvedTarget.money;
      resolvedTarget.money = casterMoney;

      return {
        affectedPlayerIds: [caster.id, resolvedTarget.id],
        summary: `${caster.name} và ${resolvedTarget.name} hoán đổi toàn bộ B$.`,
      };
    }
  }
}
