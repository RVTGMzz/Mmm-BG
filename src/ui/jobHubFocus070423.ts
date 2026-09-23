/** Job Hub is a 4-control, keyboard-first modal: roll, A, B, C. */
export type JobHubFocus = 'roll' | 0 | 1 | 2;
export type JobHubNavKey = 'left' | 'right' | 'up' | 'down' | 'tab' | 'shift-tab';

/**
 * Deterministic keyboard traversal independent of Phaser or a physical mouse.
 * Roll sits below the centre card; arrows follow the spatial layout.
 * Spectators can browse details but can never focus/activate the dice button.
 */
export function nextJobHubFocus070423(
  current: JobHubFocus,
  key: JobHubNavKey,
  canRoll: boolean,
): JobHubFocus {
  const focus: JobHubFocus = !canRoll && current === 'roll' ? 0 : current;
  if (key === 'up') return focus === 'roll' ? 1 : focus;
  if (key === 'down') return canRoll ? 'roll' : focus;
  if (key === 'left') {
    if (focus === 'roll') return 0;
    return ((focus + 2) % 3) as 0 | 1 | 2;
  }
  if (key === 'right') {
    if (focus === 'roll') return 2;
    return ((focus + 1) % 3) as 0 | 1 | 2;
  }
  const order: JobHubFocus[] = canRoll ? ['roll', 0, 1, 2] : [0, 1, 2];
  const step = key === 'shift-tab' ? -1 : 1;
  return order[(order.indexOf(focus) + step + order.length) % order.length]!;
}
