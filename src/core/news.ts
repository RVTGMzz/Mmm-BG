import { economyActivePlayers060, isEconomyActivePlayer060 } from './pacingEconomy060';
import { specialHoldNodeId057 } from './specialLocations057';
import type { PlayerState, SpecialHoldLocation } from './types';

export type NewsRarity = 'N' | 'R' | 'SR' | 'SSR';
export type NewsTargetMode = 'self' | 'all_players' | 'other_player';

export interface MoneyDeltaSelfEffect {
  type: 'money_delta_self';
  amount: number;
}

export interface MoneyDeltaAllEffect {
  type: 'money_delta_all';
  amount: number;
}

export interface NormalizeToAverageSelfEffect {
  type: 'normalize_to_average_self';
}

/**
 * The variant offset is chosen by content. Multiple equal-weight News variants can
 * point at different offsets, so the authoritative weighted News draw determines
 * which free opponent is hit without adding a second client-side RNG source.
 */
export interface SendOtherToSpecialEffect {
  type: 'send_other_to_special';
  location: SpecialHoldLocation;
  targetOffset: number;
}

export type NewsEffect =
  | MoneyDeltaSelfEffect
  | MoneyDeltaAllEffect
  | NormalizeToAverageSelfEffect
  | SendOtherToSpecialEffect;

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
  relocatedPlayerId?: number;
  relocatedToNodeId?: number;
  specialHold?: SpecialHoldLocation;
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

function freeOtherPlayers(players: PlayerState[], subjectId: number): PlayerState[] {
  return players
    .filter((player) => player.id !== subjectId && player.specialHold === undefined && isEconomyActivePlayer060(player))
    .slice()
    .sort((left, right) => left.id - right.id);
}

export function applyNewsEffect(
  news: NewsDefinition,
  subject: PlayerState,
  players: PlayerState[],
): NewsResolution {
  switch (news.effect.type) {
    case 'money_delta_self': {
      if (!isEconomyActivePlayer060(subject)) {
        return {
          amount: 0,
          affectedPlayerIds: [],
          deltas: {},
          summary: `${subject.name} đã về đích nên B$ cuối cùng không thay đổi.`,
        };
      }
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
      const activePlayers = economyActivePlayers060(players);
      const deltas: Record<number, number> = {};
      let total = 0;
      for (const player of activePlayers) {
        const delta = applyMoneyDelta(player, news.effect.amount);
        deltas[player.id] = delta;
        total += Math.abs(delta);
      }

      const verb = news.effect.amount >= 0 ? 'nhận' : 'mất';
      return {
        amount: total,
        affectedPlayerIds: activePlayers.map((player) => player.id),
        deltas,
        summary: activePlayers.length === players.length
          ? `Cả bàn ${verb} ${Math.abs(Math.floor(news.effect.amount))}B$ mỗi người (tổng ${total}B$).`
          : `Người còn đang đua ${verb} ${Math.abs(Math.floor(news.effect.amount))}B$ mỗi người; người đã về đích giữ nguyên B$ (tổng ${total}B$).`,
      };
    }

    case 'normalize_to_average_self': {
      const activePlayers = economyActivePlayers060(players);
      if (!isEconomyActivePlayer060(subject)) {
        return {
          amount: 0,
          affectedPlayerIds: [],
          deltas: {},
          summary: `${subject.name} đã về đích nên B$ cuối cùng không thay đổi.`,
        };
      }
      const average = activePlayers.length > 0
        ? Math.floor(activePlayers.reduce((sum, player) => sum + player.money, 0) / activePlayers.length)
        : subject.money;
      const before = subject.money;
      subject.money = Math.max(0, average);
      const delta = subject.money - before;
      return {
        amount: Math.abs(delta),
        affectedPlayerIds: [subject.id],
        deltas: { [subject.id]: delta },
        summary: delta === 0
          ? `${subject.name} đã đúng mức B$ trung bình nên không thay đổi.`
          : `${subject.name} được cân về mức trung bình ${subject.money}B$ (${delta > 0 ? '+' : ''}${delta}B$).`,
      };
    }

    case 'send_other_to_special': {
      const candidates = freeOtherPlayers(players, subject.id);
      if (candidates.length === 0) {
        return {
          affectedPlayerIds: [subject.id],
          deltas: {},
          summary: 'Không còn đối thủ đang đua và tự do hợp lệ nên sự kiện không bắt được ai.',
        };
      }
      const offset = Math.abs(Math.floor(news.effect.targetOffset));
      const target = candidates[offset % candidates.length]!;
      const destination = specialHoldNodeId057(news.effect.location);
      if (target.jobStatus === 'employed' && target.jobId) target.specialHoldSourceJobId = target.jobId;
      else delete target.specialHoldSourceJobId;
      target.nodeId = destination;
      target.specialHold = news.effect.location;
      const place = news.effect.location === 'jail' ? 'Đồn Cảnh Sát' : 'Bệnh Viện';
      return {
        affectedPlayerIds: [target.id],
        deltas: {},
        relocatedPlayerId: target.id,
        relocatedToNodeId: destination,
        specialHold: news.effect.location,
        summary: `${target.name} bị sự kiện kéo thẳng tới ${place}.`,
      };
    }
  }
}
