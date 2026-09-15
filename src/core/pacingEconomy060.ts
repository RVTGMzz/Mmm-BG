import type { PlayerState } from './types';

/** One lap remains the backwards-compatible default when no per-match target is present. */
export const MVP_TARGET_LAPS_060 = 1;

/**
 * Economy tuning for the one-lap playtest.
 *
 * 0.1.60 deliberately keeps the 200 B$ start, Draft D money spaces, Job salaries,
 * Lottery x20 and all special-location release rules unchanged. The tune focuses on
 * runaway variance from repeat play after finishing, Mini Games and high-swing Card/
 * News effects.
 */
export const ECONOMY_060 = {
  startingMoney: 200,
  miniGameMajorityTotal: 50,
  miniGameRpsTotal: 30,
  cardTacticalSafe: 20,
  cardRichTaxPercent: 0.15,
  cardGroupLossPercent: 0.20,
  cardCatchUpPoor: 50,
  cardCatchUpBase: 15,
  newsSelfGain: 25,
  newsSelfLoss: -30,
  newsGroupGain: 10,
  newsGroupLoss: -10,
  newsRareGroupLoss: -15,
} as const;

/** 0.1.60 presentation auto-timing is ~15–20% tighter without touching manual reads. */
export const PACING_060 = {
  cpuAutoMaxMs: 820,
  globalAutoMinMs: 5_000,
  globalAutoMaxMs: 8_000,
  globalTailMs: 1_450,
  passiveSkipMinMs: 2_500,
  passiveAutoMinMs: 3_500,
  passiveAutoMaxMs: 5_000,
  passiveTailMs: 1_250,
} as const;

export function targetLapsForPlayer060(player: Pick<PlayerState, 'targetLaps'>): number {
  const raw = Math.floor(player.targetLaps ?? MVP_TARGET_LAPS_060);
  return Math.max(1, Math.min(3, raw));
}

export function isPlayerFinished060(player: Pick<PlayerState, 'lapsCompleted' | 'targetLaps'>): boolean {
  return (player.lapsCompleted ?? 0) >= targetLapsForPlayer060(player);
}

export function economyActivePlayers060<T extends PlayerState>(players: readonly T[]): T[] {
  return players.filter((player) => !isPlayerFinished060(player));
}

export function isEconomyActivePlayer060(player: Pick<PlayerState, 'lapsCompleted' | 'targetLaps'>): boolean {
  return !isPlayerFinished060(player);
}

export function miniGameEligiblePlayers060<T extends PlayerState>(players: readonly T[]): T[] {
  return players.filter((player) => !isPlayerFinished060(player) && player.specialHold === undefined);
}
