import type { PlayerState } from './types';

export type NewsRarity = 'N' | 'R' | 'SR' | 'SSR';
export type NewsTargetMode = 'self' | 'all_players';

export interface MoneyDeltaSelfEffect {
  type: 'money_delta_self';
  amount: number;
}

export interface MoneyDeltaAllEffect {
  type: 'money_delta_all';
  amount: number;
}

export type NewsEffect = MoneyDeltaSelfEffect | MoneyDeltaAllEffect;

export interface NewsDefinition {
  id: string;
  title: string;
  rarity: NewsRarity;
  dropWeight: number;
  impact: string;
  description: string;
  targetMode: NewsTargetMode;
  effect: NewsEffect;
  reactionEventId?: string;
}

export interface NewsResolution {
  summary: string;
  affectedPlayerIds: number[];
  deltas: Record<number, number>;
  amount?: number;
}

export function drawWeightedNews(
  news: NewsDefinition[],
  random: () => number = Math.random,
): NewsDefinition | undefined {
  const enabled = news.filter((entry) => Number.isFinite(entry.dropWeight) && entry.dropWeight > 0);
  const total = enabled.reduce((sum, entry) => sum + entry.dropWeight, 0);
  if (total <= 0) return undefined;

  let roll = random() * total;
  for (const entry of enabled) {
    roll -= entry.dropWeight;
    if (roll < 0) return entry;
  }

  return enabled[enabled.length - 1];
}

function applyMoneyDelta(player: PlayerState, requestedDelta: number): number {
  if (requestedDelta >= 0) {
    const gain = Math.floor(requestedDelta);
    player.money += gain;
    return gain;
  }

  const requestedLoss = Math.floor(Math.abs(requestedDelta));
  const loss = Math.min(requestedLoss, Math.max(0, player.money));
  player.money -= loss;
  return -loss;
}

export function applyNewsEffect(
  news: NewsDefinition,
  subject: PlayerState,
  players: PlayerState[],
): NewsResolution {
  switch (news.effect.type) {
    case 'money_delta_self': {
      const delta = applyMoneyDelta(subject, news.effect.amount);
      const verb = delta >= 0 ? 'nhận' : 'mất';
      return {
        amount: Math.abs(delta),
        affectedPlayerIds: [subject.id],
        deltas: { [subject.id]: delta },
        summary: `${subject.name} ${verb} ${Math.abs(delta)}B$.`,
      };
    }

    case 'money_delta_all': {
      const deltas: Record<number, number> = {};
      let total = 0;
      for (const player of players) {
        const delta = applyMoneyDelta(player, news.effect.amount);
        deltas[player.id] = delta;
        total += Math.abs(delta);
      }

      const verb = news.effect.amount >= 0 ? 'nhận' : 'mất';
      return {
        amount: total,
        affectedPlayerIds: players.map((player) => player.id),
        deltas,
        summary: `Cả bàn ${verb} ${Math.abs(Math.floor(news.effect.amount))}B$ mỗi người (tổng ${total}B$).`,
      };
    }
  }
}
