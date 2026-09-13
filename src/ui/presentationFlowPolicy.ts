import type { MatchEvent } from '../core/matchState';
import type { PlayerState } from '../core/types';
import { buildPresentationModel } from './presentationModel';

/**
 * Presentation should only self-advance during the dedicated 4-CPU stress mode.
 * Human-containing sessions must wait for an explicit acknowledge gesture so
 * gameplay cannot run ahead of the visible Tile/Card/News/Reaction queue.
 */
export function shouldAutoAdvancePresentation(
  cpuSeatIds: readonly number[],
  playerCount = 4,
): boolean {
  if (playerCount <= 0 || cpuSeatIds.length !== playerCount) return false;
  const seats = new Set(cpuSeatIds);
  if (seats.size !== playerCount) return false;
  for (let seat = 0; seat < playerCount; seat += 1) {
    if (!seats.has(seat)) return false;
  }
  return true;
}

/**
 * Count authoritative events that become blocking presentation models.
 * Unknown/log-only events stay outside the gate.
 */
export function countBlockingPresentationEvents(
  events: readonly MatchEvent[],
  players: PlayerState[],
): number {
  let count = 0;
  for (const event of events) {
    if (buildPresentationModel(event, players)) count += 1;
  }
  return count;
}
