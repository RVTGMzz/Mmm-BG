import type { MatchState } from './matchState';
import { pendingFreshMovementRollAfterRelease0701 } from './releaseFlow0701';

/**
 * Historical 0.1.66 compatibility wrapper around the 0.1.70.1 authoritative
 * release detector. Human-facing legacy callers may still ask for a presentation
 * gate, but the authoritative release state itself is independent from UI timing.
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
 * 0.1.70.1 CPU compatibility path.
 *
 * A successful Jail/Hospital release has already changed authoritative state to
 * PRE_ROLL_ACTION + lastRoll=null + no hold. Presentation must never be allowed to
 * veto that fresh movement D6. The modal is feedback only, so CPU resume ignores
 * presentationBlocking and asks HOST to roll from the authoritative state.
 */
export function pendingCpuFreshRollAfterRelease066(
  match: MatchState,
  cpuSeatIds: readonly number[],
  _presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  const eventSeq = pendingFreshMovementRollAfterRelease0701(match);
  if (eventSeq === undefined || eventSeq <= handledReleaseEventSeq) return undefined;

  const actor = match.players[match.turn.currentPlayerIndex];
  if (!actor || !cpuSeatIds.includes(actor.id)) return undefined;
  return eventSeq;
}
