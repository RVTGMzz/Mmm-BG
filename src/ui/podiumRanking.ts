export type RankedPodiumEntry = {
  playerId: number;
  money: number;
  rank: number;
};

/**
 * Presentation-only competition ranking.
 * Equal money shares the same rank and skips the following position: 1,1,3,4.
 * Input order is expected to be the already-authoritative result ranking order.
 */
export function withCompetitionRanks(
  ranking: Array<{ playerId: number; money: number }>,
): RankedPodiumEntry[] {
  const ranked: RankedPodiumEntry[] = [];
  ranking.forEach((entry, index) => {
    const previous = ranked[index - 1];
    const rank = previous && previous.money === entry.money ? previous.rank : index + 1;
    ranked.push({ ...entry, rank });
  });
  return ranked;
}
