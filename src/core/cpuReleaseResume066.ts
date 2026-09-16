import type { MatchState } from './matchState';

/**
 * Shared same-turn fresh movement D6 detector after a successful Jail/Hospital
 * release. The release D6 only decides whether the hold is cleared. Once the
 * blocking presentation closes, the same actor must be allowed to roll a new D6
 * without advancing turnNumber.
 */
export function pendingFreshRollAfterRelease066(
  match: MatchState,
  presentationBlocking: boolean,
  handledReleaseEventSeq = 0,
): number | undefined {
  if (presentationBlocking || match.turn.phase !== 'PRE_ROLL_ACTION' || match.turn.lastRoll !== null) {
    return undefined;
  }

  const latest = match.eventLog.at(-1);
  if (!latest || latest.type !== 'special_release' || latest.data.success !== true) return undefined;
  if (latest.seq <= handledReleaseEventSeq) return undefined;

  const actorId = latest.actorId;
  if (actorId === undefined || actorId !== match.turn.currentPlayerIndex) return undefined;

  const actor = match.players.find((player) => player.id === actorId);
  if (!actor || actor.specialHold !== undefined) return undefined;

  return latest.seq;
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

  const actorId = match.eventLog.at(-1)?.actorId;
  if (actorId === undefined || !cpuSeatIds.includes(actorId)) return undefined;
  return eventSeq;
}
