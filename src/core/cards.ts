import type { FaceExpression } from './session';
import type { PlayerState } from './types';

export type CardRarity = 'N' | 'R' | 'SR' | 'SSR';
export type CardFaceRole = 'caster' | 'target';
export type CardTargetMode = 'self' | 'single_other' | 'random_other' | 'richest_other' | 'all_others';
export type TacticalCardChoice = 'safe' | 'pressure';

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

export interface RichTaxEffect {
  type: 'rich_tax';
  percent: number;
}

export interface TacticalChoiceEffect {
  type: 'tactical_choice';
  safeAmount: number;
  taxPercent: number;
}

export interface CatchUpBonusEffect {
  type: 'catch_up_bonus';
  poorAmount: number;
  baseAmount: number;
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
  | RichTaxEffect
  | TacticalChoiceEffect
  | CatchUpBonusEffect
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

export function pickRichestOtherTarget<T extends PlayerState>(players: T[], casterId: number): T | undefined {
  return getValidTargets(players, casterId)
    .slice()
    .sort((left, right) => right.money - left.money || left.id - right.id)[0];
}

export function tacticalChoicePressureAmount(
  effect: TacticalChoiceEffect,
  players: PlayerState[],
  casterId: number,
): number {
  const richest = pickRichestOtherTarget(players, casterId);
  if (!richest) return 0;
  const percent = Math.min(1, Math.max(0, effect.taxPercent));
  return Math.floor(Math.max(0, richest.money) * percent);
}

function requiredTarget(target: PlayerState | undefined, card: CardDefinition): PlayerState {
  if (!target) throw new Error(`Card ${card.id} requires a target.`);
  return target;
}

export function applyCardEffect(
  card: CardDefinition,
  caster: PlayerState,
  players: PlayerState[],
  target?: PlayerState,
  tacticalChoice?: TacticalCardChoice,
): CardResolution {
  switch (card.effect.type) {
    case 'steal_money': {
      const resolvedTarget = requiredTarget(target, card);
      const requested = Math.max(0, Math.floor(card.effect.amount));
      const amount = Math.min(requested, Math.max(0, resolvedTarget.money));
      resolvedTarget.money -= amount;
      caster.money += amount;
      return { amount, affectedPlayerIds: [caster.id, resolvedTarget.id], summary: `${caster.name} lấy ${amount}B$ từ ${resolvedTarget.name}.` };
    }

    case 'rich_tax': {
      const resolvedTarget = target ?? pickRichestOtherTarget(players, caster.id);
      if (!resolvedTarget) return { amount: 0, affectedPlayerIds: [caster.id], summary: `${caster.name} không tìm thấy đối thủ hợp lệ.` };
      const percent = Math.min(1, Math.max(0, card.effect.percent));
      const amount = Math.floor(Math.max(0, resolvedTarget.money) * percent);
      resolvedTarget.money -= amount;
      caster.money += amount;
      return {
        amount,
        affectedPlayerIds: [caster.id, resolvedTarget.id],
        summary: `${caster.name} thu ${Math.round(percent * 100)}% từ người nhiều B$ nhất ${resolvedTarget.name} (${amount}B$).`,
      };
    }

    case 'tactical_choice': {
      if (tacticalChoice === 'safe') {
        const amount = Math.max(0, Math.floor(card.effect.safeAmount));
        caster.money += amount;
        return {
          amount,
          affectedPlayerIds: [caster.id],
          summary: `${caster.name} chọn Ăn Chắc và nhận ${amount}B$.`,
        };
      }
      if (tacticalChoice === 'pressure') {
        const resolvedTarget = pickRichestOtherTarget(players, caster.id);
        if (!resolvedTarget) {
          return { amount: 0, affectedPlayerIds: [caster.id], summary: `${caster.name} không tìm thấy đối thủ để Ép Top 1.` };
        }
        const percent = Math.min(1, Math.max(0, card.effect.taxPercent));
        const amount = Math.floor(Math.max(0, resolvedTarget.money) * percent);
        resolvedTarget.money -= amount;
        caster.money += amount;
        return {
          amount,
          affectedPlayerIds: [caster.id, resolvedTarget.id],
          summary: `${caster.name} chọn Ép Top 1 và lấy ${amount}B$ (${Math.round(percent * 100)}%) từ ${resolvedTarget.name}.`,
        };
      }
      throw new Error(`Card ${card.id} requires tactical choice safe|pressure.`);
    }

    case 'catch_up_bonus': {
      const minimumMoney = Math.min(...players.map((player) => player.money));
      const isPoorest = caster.money <= minimumMoney;
      const amount = Math.max(0, Math.floor(isPoorest ? card.effect.poorAmount : card.effect.baseAmount));
      caster.money += amount;
      return {
        amount,
        affectedPlayerIds: [caster.id],
        summary: isPoorest
          ? `${caster.name} đang cuối bảng nên nhận cứu trợ ${amount}B$.`
          : `${caster.name} chưa ở cuối bảng, nhận ${amount}B$ hỗ trợ cơ bản.`,
      };
    }

    case 'block_cards': {
      const resolvedTarget = requiredTarget(target, card);
      const turns = Math.max(1, Math.floor(card.effect.turns));
      resolvedTarget.cardBlockTurns = Math.max(resolvedTarget.cardBlockTurns, turns);
      return { affectedPlayerIds: [resolvedTarget.id], summary: `${resolvedTarget.name} bị khóa Lá Bài trong ${turns} lượt.` };
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
      return { affectedPlayerIds: [caster.id, resolvedTarget.id], summary: `${caster.name} và ${resolvedTarget.name} hoán đổi toàn bộ B$.` };
    }
  }
}
