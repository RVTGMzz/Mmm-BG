import type { FaceExpression } from './session';
import type { PlayerState } from './types';

export type CardRarity = 'N' | 'R' | 'SR' | 'SSR';
export type CardFaceRole = 'caster' | 'target';

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

export type CardEffect = StealMoneyEffect;

export interface CardDefinition {
  id: string;
  title: string;
  rarity: CardRarity;
  impact: string;
  description: string;
  effect: CardEffect;
  faceSlots: CardFaceSlot[];
}

export interface CardResolution {
  amount: number;
  summary: string;
}

export function pickRandomOtherPlayer<T extends PlayerState>(
  players: T[],
  casterId: number,
  random: () => number = Math.random,
): T | undefined {
  const candidates = players.filter((player) => player.id !== casterId);
  if (candidates.length === 0) return undefined;
  return candidates[Math.floor(random() * candidates.length)];
}

export function applyCardEffect(
  card: CardDefinition,
  caster: PlayerState,
  target: PlayerState,
): CardResolution {
  switch (card.effect.type) {
    case 'steal_money': {
      const requested = Math.max(0, Math.floor(card.effect.amount));
      const amount = Math.min(requested, Math.max(0, target.money));
      target.money -= amount;
      caster.money += amount;

      return {
        amount,
        summary: `${caster.name} lấy ${amount}B$ từ ${target.name}.`,
      };
    }
  }
}
