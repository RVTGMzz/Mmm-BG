import type { MatchState } from './matchState';
import { pendingFreshMovementRollAfterRelease0701 } from './releaseFlow0701';

/**
 * Historical 0.1.66 compatibility wrapper around the 0.1.70.1 authoritative
 * release detector. Presentation state is intentionally ignored here: this helper
 * reports whether authority owes a fresh movement D6, while DirectDiceBoardScene
 * remains responsible for presentation-safe human input visibility.
 */
export function pendingFreshRollAfterRelease066(
  match: MatchState,
  _presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
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
