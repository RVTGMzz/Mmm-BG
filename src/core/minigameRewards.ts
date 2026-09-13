export type MiniGameRewardType = 'majority_minority' | 'rps';

export const MINI_GAME_REWARDS: Record<MiniGameRewardType, readonly [number, number, number, number]> = {
  majority_minority: [30, 20, 10, 0],
  rps: [25, 15, 5, 0],
};

export function miniGameRewardForRank(type: MiniGameRewardType, rank: number): number {
  if (!Number.isInteger(rank) || rank < 1) return 0;
  return MINI_GAME_REWARDS[type][rank - 1] ?? 0;
}

export function isMiniGameRewardType(value: unknown): value is MiniGameRewardType {
  return value === 'majority_minority' || value === 'rps';
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
