import type { MatchState } from './matchState';

/**
 * 0.1.70.1 authoritative release-flow detector.
 *
 * A successful Jail/Hospital release consumes only the escape D6. The same actor
 * remains in PRE_ROLL_ACTION with lastRoll cleared and must receive one fresh
 * movement D6. This detector intentionally ignores presentation state: UI may still
 * be showing the release modal, but gameplay readiness must not be coupled to a
 * tween/timer. Presentation decides when controls become visible; authority decides
 * whether a fresh movement roll is owed.
 */
export function pendingFreshMovementRollAfterRelease0701(match: MatchState): number | undefined {
  if (match.turn.phase !== 'PRE_ROLL_ACTION' || match.turn.lastRoll !== null) return undefined;

  const actor = match.players[match.turn.currentPlayerIndex];
  if (!actor || actor.specialHold !== undefined) return undefined;

  const release = [...match.eventLog].reverse().find((event) =>
    event.turnNumber === match.turn.turnNumber &&
    event.type === 'special_release' &&
    event.data.success === true &&
    event.actorId === actor.id,
  );

  return release?.seq;
}
