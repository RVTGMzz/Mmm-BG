import type { MatchState } from './matchState';

/**
 * Browser-side 0.1.66 watchdog for the same-turn fresh movement D6 after a
 * successful Jail/Hospital release. It never rolls RNG or mutates MatchState;
 * it only tells the scene when the existing HOST roll intent should be woken up.
 */
export function pendingCpuFreshRollAfterRelease066(
  match: MatchState,
  cpuSeatIds: readonly number[],
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
  if (!cpuSeatIds.includes(actorId)) return undefined;

  const actor = match.players.find((player) => player.id === actorId);
  if (!actor || actor.specialHold !== undefined) return undefined;

  return latest.seq;
}
