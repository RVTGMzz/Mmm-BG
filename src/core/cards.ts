import { economyActivePlayers060, isEconomyActivePlayer060 } from './pacingEconomy060';
import { specialHoldNodeId057 } from './specialLocations057';
import type { FaceExpression } from './session';
import type { PlayerState, SpecialHoldLocation } from './types';

export type CardRarity = 'N' | 'R' | 'SR' | 'SSR';
export type CardFaceRole = 'caster' | 'target';
export type CardTargetMode = 'self' | 'single_other' | 'random_other' | 'richest_other' | 'all_others';
export type TacticalCardChoice = 'safe' | 'pressure';
export type CardTiming = 'before_roll';

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

export interface SendToSpecialEffect {
  type: 'send_to_special';
  location: SpecialHoldLocation;
}

/* ---- CH-19 card effects ---- */
export interface FineRandomEffect { type: 'fine_random'; amount: number }
export interface GiftPoorestEffect { type: 'gift_poorest'; selfAmount: number; giftAmount: number }
export interface CollectEachEffect { type: 'collect_each'; amount: number }
export interface BonusStepsEffect { type: 'bonus_steps'; steps: number }
export interface ShieldEffect { type: 'shield'; charges: number }
export interface RobinHoodEffect { type: 'robin_hood'; amount: number }
export interface DoubleRollEffect { type: 'double_roll' }
export interface SlowRollEffect { type: 'slow_roll' }
export interface DiceBonusEffect { type: 'dice_bonus'; multiplier: number }
export interface GambleEffect { type: 'gamble'; win: number; lose: number }
export interface EqualizeEffect { type: 'equalize'; aboveAmount: number }

export type CardEffect =
  | FineRandomEffect
  | GiftPoorestEffect
  | CollectEachEffect
  | BonusStepsEffect
  | ShieldEffect
  | RobinHoodEffect
  | DoubleRollEffect
  | SlowRollEffect
  | DiceBonusEffect
  | GambleEffect
  | EqualizeEffect
  | StealMoneyEffect
  | RichTaxEffect
  | TacticalChoiceEffect
  | CatchUpBonusEffect
  | BlockCardsEffect
  | PercentLossAllOthersEffect
  | SwapMoneyEffect
  | SendToSpecialEffect;

export interface CardDefinition {
  id: string;
  title: string;
  rarity: CardRarity;
  dropWeight: number;
  impact: string;
  description: string;
  targetMode: CardTargetMode;
  timing?: CardTiming;
  effect: CardEffect;
  faceSlots: CardFaceSlot[];
}

export interface CardResolution {
  summary: string;
  affectedPlayerIds: number[];
  amount?: number;
  relocatedPlayerId?: number;
  relocatedToNodeId?: number;
  specialHold?: SpecialHoldLocation;
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

/** Finished players have a locked final B$ score and leave the interactive target pool. */
export function getValidTargets<T extends PlayerState>(players: T[], casterId: number): T[] {
  return players.filter((player) => player.id !== casterId && isEconomyActivePlayer060(player));
}

export function getValidTargetsForCard<T extends PlayerState>(
  card: CardDefinition,
  players: T[],
  casterId: number,
): T[] {
  const candidates = getValidTargets(players, casterId);
  if (card.effect.type === 'send_to_special') {
    return candidates.filter((player) => player.specialHold === undefined);
  }
  return candidates;
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
  if (!isEconomyActivePlayer060(target)) {
    throw new Error(`Card ${card.id} cannot target ${target.name}: final B$ is already locked.`);
  }
  return target;
}

/** CH-19 Bảo Kê: a shielded player shrugs off one harmful card (the charge is used up). */
function blockedByShieldCh19(player: PlayerState | undefined): boolean {
  if (!player || !player.cardShield || player.cardShield <= 0) return false;
  player.cardShield -= 1;
  if (player.cardShield <= 0) delete player.cardShield;
  return true;
}

const HARMFUL_SINGLE_CH19 = new Set<CardEffect['type']>(['steal_money', 'fine_random', 'block_cards', 'swap_money', 'send_to_special', 'slow_roll', 'rich_tax']);

export function applyCardEffect(
  card: CardDefinition,
  caster: PlayerState,
  players: PlayerState[],
  target?: PlayerState,
  tacticalChoice?: TacticalCardChoice,
  random: () => number = Math.random,
): CardResolution {
  if (HARMFUL_SINGLE_CH19.has(card.effect.type)) {
    const victim = target ?? (card.effect.type === 'rich_tax' ? pickRichestOtherTarget(players, caster.id) : undefined);
    if (victim && victim.id !== caster.id && blockedByShieldCh19(victim)) {
      return { amount: 0, affectedPlayerIds: [victim.id], summary: `${victim.name} giơ BẢO KÊ chặn ${card.title}!` };
    }
  }
  switch (card.effect.type) {
    case 'fine_random': {
      const resolvedTarget = requiredTarget(target, card);
      const amount = Math.min(Math.max(0, Math.floor(card.effect.amount)), Math.max(0, resolvedTarget.money));
      resolvedTarget.money -= amount;
      return { amount, affectedPlayerIds: [resolvedTarget.id], summary: `${resolvedTarget.name} dính phạt nguội ${amount}B$.` };
    }
    case 'gift_poorest': {
      const self = Math.max(0, Math.floor(card.effect.selfAmount));
      caster.money += self;
      const poorest = getValidTargets(players, caster.id).slice().sort((a, b) => a.money - b.money || a.id - b.id)[0];
      const gift = poorest ? Math.max(0, Math.floor(card.effect.giftAmount)) : 0;
      if (poorest) poorest.money += gift;
      return {
        amount: self,
        affectedPlayerIds: poorest ? [caster.id, poorest.id] : [caster.id],
        summary: poorest ? `${caster.name} nhận ${self}B$ lì xì và chia ${gift}B$ cho ${poorest.name}.` : `${caster.name} nhận ${self}B$ lì xì.`,
      };
    }
    case 'collect_each': {
      const each = Math.max(0, Math.floor(card.effect.amount));
      const payers = getValidTargets(players, caster.id);
      let total = 0;
      const paid: number[] = [];
      for (const payer of payers) {
        if (blockedByShieldCh19(payer)) continue;
        const amount = Math.min(each, Math.max(0, payer.money));
        payer.money -= amount;
        total += amount;
        paid.push(payer.id);
      }
      caster.money += total;
      return { amount: total, affectedPlayerIds: [caster.id, ...paid], summary: `${caster.name} chia bill: mỗi người góp ${each}B$ (tổng ${total}B$).` };
    }
    case 'bonus_steps': {
      const steps = Math.max(1, Math.floor(card.effect.steps));
      caster.cardBonusSteps = (caster.cardBonusSteps ?? 0) + steps;
      return { affectedPlayerIds: [caster.id], summary: `${caster.name} biết đường tắt: lần đổ tới đi thêm ${steps} ô.` };
    }
    case 'shield': {
      caster.cardShield = Math.max(caster.cardShield ?? 0, Math.max(1, Math.floor(card.effect.charges)));
      return { affectedPlayerIds: [caster.id], summary: `${caster.name} đã có BẢO KÊ: lá bài xấu tiếp theo nhắm vào sẽ bị chặn.` };
    }
    case 'robin_hood': {
      const others = getValidTargets(players, caster.id);
      const richest = others.slice().sort((a, b) => b.money - a.money || a.id - b.id)[0];
      const poorest = others.slice().sort((a, b) => a.money - b.money || a.id - b.id)[0];
      if (!richest || !poorest || richest.id === poorest.id) {
        return { amount: 0, affectedPlayerIds: [caster.id], summary: `${caster.name} không tìm được ai để cướp của người giàu chia người nghèo.` };
      }
      if (blockedByShieldCh19(richest)) return { amount: 0, affectedPlayerIds: [richest.id], summary: `${richest.name} giơ BẢO KÊ chặn ${card.title}!` };
      const amount = Math.min(Math.max(0, Math.floor(card.effect.amount)), Math.max(0, richest.money));
      richest.money -= amount;
      poorest.money += amount;
      return { amount, affectedPlayerIds: [richest.id, poorest.id], summary: `${caster.name} lấy ${amount}B$ của ${richest.name} chia cho ${poorest.name}.` };
    }
    case 'double_roll': {
      caster.cardDoubleRoll = true;
      return { affectedPlayerIds: [caster.id], summary: `${caster.name} sẽ đổ 2 xúc xắc và lấy mặt cao hơn.` };
    }
    case 'slow_roll': {
      const resolvedTarget = requiredTarget(target, card);
      resolvedTarget.cardSlowRoll = true;
      return { affectedPlayerIds: [resolvedTarget.id], summary: `${resolvedTarget.name} kẹt xe: lần đổ tới chỉ đi nửa số ô.` };
    }
    case 'dice_bonus': {
      const roll = Math.min(6, Math.max(1, Math.floor(random() * 6) + 1));
      const amount = roll * Math.max(0, Math.floor(card.effect.multiplier));
      caster.money += amount;
      return { amount, affectedPlayerIds: [caster.id], summary: `${caster.name} cào ra ${roll} × ${card.effect.multiplier} = +${amount}B$.` };
    }
    case 'gamble': {
      const win = random() < 0.5;
      const amount = win ? Math.max(0, Math.floor(card.effect.win)) : Math.min(Math.max(0, Math.floor(card.effect.lose)), Math.max(0, caster.money));
      caster.money += win ? amount : -amount;
      return { amount, affectedPlayerIds: [caster.id], summary: win ? `${caster.name} mở phong bì: TRÚNG +${amount}B$!` : `${caster.name} mở phong bì: xui, mất ${amount}B$.` };
    }
    case 'equalize': {
      const active = economyActivePlayers060(players);
      const pool = active.length > 0 ? active : [caster];
      const average = Math.floor(pool.reduce((sum, p) => sum + p.money, 0) / pool.length);
      const below = caster.money < average;
      const amount = below ? average - caster.money : Math.max(0, Math.floor(card.effect.aboveAmount));
      caster.money += amount;
      return {
        amount,
        affectedPlayerIds: [caster.id],
        summary: below ? `${caster.name} được kéo lên mức trung bình ${average}B$ (+${amount}B$).` : `${caster.name} đã trên trung bình, nhận thêm ${amount}B$.`,
      };
    }

    case 'steal_money': {
      const resolvedTarget = requiredTarget(target, card);
      const requested = Math.max(0, Math.floor(card.effect.amount));
      const amount = Math.min(requested, Math.max(0, resolvedTarget.money));
      resolvedTarget.money -= amount;
      caster.money += amount;
      return { amount, affectedPlayerIds: [caster.id, resolvedTarget.id], summary: `${caster.name} lấy ${amount}B$ từ ${resolvedTarget.name}.` };
    }

    case 'rich_tax': {
      const resolvedTarget = target ? requiredTarget(target, card) : pickRichestOtherTarget(players, caster.id);
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
      const activePlayers = economyActivePlayers060(players);
      const comparison = activePlayers.length > 0 ? activePlayers : [caster];
      const minimumMoney = Math.min(...comparison.map((player) => player.money));
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
      const opponents = getValidTargets(players, caster.id).filter((opponent) => !blockedByShieldCh19(opponent));
      let totalLost = 0;
      for (const opponent of opponents) {
        const loss = Math.floor(Math.max(0, opponent.money) * percent);
        opponent.money -= loss;
        totalLost += loss;
      }
      return {
        amount: totalLost,
        affectedPlayerIds: opponents.map((player) => player.id),
        summary: `${caster.name} khiến người chơi còn đang đua mất ${Math.round(percent * 100)}% B$ (tổng ${totalLost}B$).`,
      };
    }

    case 'swap_money': {
      const resolvedTarget = requiredTarget(target, card);
      const casterMoney = caster.money;
      caster.money = resolvedTarget.money;
      resolvedTarget.money = casterMoney;
      return { affectedPlayerIds: [caster.id, resolvedTarget.id], summary: `${caster.name} và ${resolvedTarget.name} hoán đổi toàn bộ B$.` };
    }

    case 'send_to_special': {
      const resolvedTarget = requiredTarget(target, card);
      if (resolvedTarget.specialHold) {
        throw new Error(`Card ${card.id} cannot relocate ${resolvedTarget.name}: already held in ${resolvedTarget.specialHold}.`);
      }
      const destination = specialHoldNodeId057(card.effect.location);
      resolvedTarget.nodeId = destination;
      resolvedTarget.specialHold = card.effect.location;
      const place = card.effect.location === 'jail' ? 'Đồn Cảnh Sát' : 'Bệnh Viện';
      return {
        affectedPlayerIds: [resolvedTarget.id],
        relocatedPlayerId: resolvedTarget.id,
        relocatedToNodeId: destination,
        specialHold: card.effect.location,
        summary: `${caster.name} đưa ${resolvedTarget.name} thẳng tới ${place}.`,
      };
    }
  }
}
