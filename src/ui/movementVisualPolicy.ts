export type ScreenPoint = { x: number; y: number };
export type MovementStepDisposition = 'animate' | 'duplicate' | 'stale';

function distance(left: ScreenPoint, right: ScreenPoint): number {
  return Math.hypot(left.x - right.x, left.y - right.y);
}

/**
 * Presentation guard for queued move_step events.
 *
 * Authoritative state may already be ahead of the visual queue. A delayed or
 * duplicated presentation event must never drag a token backwards from a newer
 * screen position. Only animate when the token is still at the event's from-node.
 */
export function movementStepDisposition(
  current: ScreenPoint,
  from: ScreenPoint | undefined,
  to: ScreenPoint,
  tolerancePx = 7,
): MovementStepDisposition {
  const tolerance = Math.max(0, tolerancePx);
  if (distance(current, to) <= tolerance) return 'duplicate';
  if (!from) return 'animate';
  if (distance(current, from) <= tolerance) return 'animate';
  return 'stale';
}
