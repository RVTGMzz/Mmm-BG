import type { MatchState } from './matchState';

/**
 * Shared same-turn fresh movement D6 detector after a successful Jail/Hospital
 * release. The release event does not have to remain the final event in the log:
 * presentation/network bookkeeping may append events before the blocking modal
 * closes. Search backward for the newest successful release owned by the current
 * actor in the current turn instead of coupling gameplay recovery to eventLog.at(-1).
 */
export function pendingFreshRollAfterRelease066(
  match: MatchState,
  presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  if (presentationBlocking || match.turn.phase !== 'PRE_ROLL_ACTION' || match.turn.lastRoll !== null) {
    return undefined;
  }

  const actorId = match.turn.currentPlayerIndex;
  const release = [...match.eventLog].reverse().find((event) =>
    event.turnNumber === match.turn.turnNumber &&
    event.type === 'special_release' &&
    event.data.success === true &&
    event.actorId === actorId &&
    event.seq > handledReleaseEventSeq,
  );
  if (!release) return undefined;

  const actor = match.players.find((player) => player.id === actorId);
  if (!actor || actor.specialHold !== undefined) return undefined;

  return release.seq;
}

/**
 * Browser-side 0.1.66 CPU watchdog. It never rolls RNG or mutates MatchState;
 * it only tells the scene when the existing HOST roll intent should be woken up.
 */
export function pendingCpuFreshRollAfterRelease066(
  match: MatchState,
  cpuSeatIds: readonly number[],
  presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  const eventSeq = pendingFreshRollAfterRelease066(match, presentationBlocking, handledReleaseEventSeq);
  if (eventSeq === undefined) return undefined;

  if (!cpuSeatIds.includes(match.turn.currentPlayerIndex)) return undefined;
  return eventSeq;
}
