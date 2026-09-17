import type { MatchState } from './matchState';
import { pendingFreshMovementRollAfterRelease0701 } from './releaseFlow0701';

/**
 * Historical 0.1.66 compatibility wrapper around the 0.1.70.1 authoritative
 * release detector. Presentation/handled gates remain available for older tests,
 * while runtime human + CPU logic share one state source underneath.
 */
export function pendingFreshRollAfterRelease066(
  match: MatchState,
  presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  if (presentationBlocking) return undefined;
  const eventSeq = pendingFreshMovementRollAfterRelease0701(match);
  if (eventSeq === undefined || eventSeq <= handledReleaseEventSeq) return undefined;
  return eventSeq;
}

/**
 * Browser-side 0.1.66 CPU watchdog compatibility wrapper. It never rolls RNG or
 * mutates MatchState; it only says when the existing HOST roll intent may resume.
 */
export function pendingCpuFreshRollAfterRelease066(
  match: MatchState,
  cpuSeatIds: readonly number[],
  presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  const eventSeq = pendingFreshRollAfterRelease066(match, presentationBlocking, handledReleaseEventSeq);
  if (eventSeq === undefined) return undefined;

  const actor = match.players[match.turn.currentPlayerIndex];
  if (!actor || !cpuSeatIds.includes(actor.id)) return undefined;
  return eventSeq;
}
