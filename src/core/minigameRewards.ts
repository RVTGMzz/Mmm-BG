import {
  MINI_GAME_SLOTS_059,
  miniGameRewardForSlot059,
  type MiniGameBaseMode059,
} from './miniGameSlots059';

export type MiniGameBaseRewardType = MiniGameBaseMode059;
export type MiniGameRewardType = MiniGameBaseRewardType | `${MiniGameBaseRewardType}@${string}`;

export const MINI_GAME_REWARDS: Record<MiniGameBaseRewardType, readonly [number, number, number, number]> = {
  majority_minority: [30, 20, 10, 0],
  rps: [25, 15, 5, 0],
};

export interface MiniGameRewardIdentity059 {
  baseType: MiniGameBaseRewardType;
  contentId?: string;
}

export function miniGameRewardType059(
  baseType: MiniGameBaseRewardType,
  contentId: string | undefined,
): MiniGameRewardType {
  const slot = MINI_GAME_SLOTS_059.find((entry) => entry.contentId === contentId);
  return slot ? `${baseType}@${slot.contentId}` : baseType;
}

export function parseMiniGameRewardType059(value: unknown): MiniGameRewardIdentity059 | undefined {
  if (value === 'majority_minority' || value === 'rps') return { baseType: value };
  if (typeof value !== 'string') return undefined;

  const separator = value.indexOf('@');
  if (separator <= 0) return undefined;
  const baseType = value.slice(0, separator);
  const contentId = value.slice(separator + 1);
  if (baseType !== 'majority_minority' && baseType !== 'rps') return undefined;
  if (!MINI_GAME_SLOTS_059.some((entry) => entry.contentId === contentId)) return undefined;
  return { baseType, contentId };
}

export function miniGameRewardForRank(type: MiniGameRewardType, rank: number): number {
  if (!Number.isInteger(rank) || rank < 1) return 0;
  const identity = parseMiniGameRewardType059(type);
  if (!identity) return 0;
  if (identity.contentId) {
    return miniGameRewardForSlot059(identity.contentId, identity.baseType, rank);
  }
  return MINI_GAME_REWARDS[identity.baseType][rank - 1] ?? 0;
}

export function isMiniGameRewardType(value: unknown): value is MiniGameRewardType {
  return parseMiniGameRewardType059(value) !== undefined;
}

export function parseRankingPlayerIds(value: unknown): number[] {
  if (typeof value !== 'string' || value.trim() === '') return [];
  return value
    .split(',')
    .map((entry) => Number(entry.trim()))
    .filter((entry) => Number.isInteger(entry));
}

export function validateMiniGameRanking(
  rankingPlayerIds: readonly number[],
  participantPlayerIds: readonly number[],
): string | undefined {
  if (rankingPlayerIds.length !== participantPlayerIds.length) {
    return `ranking has ${rankingPlayerIds.length} players, expected ${participantPlayerIds.length}.`;
  }

  const rankingSet = new Set(rankingPlayerIds);
  if (rankingSet.size !== rankingPlayerIds.length) return 'ranking contains duplicate player IDs.';

  const participantSet = new Set(participantPlayerIds);
  if (participantSet.size !== participantPlayerIds.length) return 'participant list contains duplicate player IDs.';

  for (const id of rankingPlayerIds) {
    if (!participantSet.has(id)) return `ranking contains non-participant P${id}.`;
  }
  for (const id of participantPlayerIds) {
    if (!rankingSet.has(id)) return `ranking is missing participant P${id}.`;
  }
  return undefined;
}
