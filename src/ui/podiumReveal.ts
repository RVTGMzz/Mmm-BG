export const PODIUM_REVEAL_BASE_DELAY_MS = 940;
export const PODIUM_REVEAL_STEP_MS = 90;
export const PODIUM_REVEAL_TWEEN_MS = 180;

export function podiumRevealDelayForRank(rank: number): number {
  const normalized = rank < 1 ? 1 : rank > 4 ? 4 : rank;
  return PODIUM_REVEAL_BASE_DELAY_MS + (4 - normalized) * PODIUM_REVEAL_STEP_MS;
}
