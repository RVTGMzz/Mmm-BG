/** Browser Standard Gamepad / Steam Deck controller mapping; no Phaser dependency. */
export type PadAction070424 =
  | 'confirm' | 'back' | 'up' | 'down' | 'left' | 'right'
  | 'overview' | 'card' | 'settings';

export interface PadSnapshot070424 {
  buttons: readonly { pressed: boolean }[];
  axes: readonly number[];
}
export interface PadEdgeState070424 {
  buttons: readonly boolean[];
  horizontal: -1 | 0 | 1;
  vertical: -1 | 0 | 1;
}
export const EMPTY_PAD_STATE_070424: PadEdgeState070424 = {
  buttons: [], horizontal: 0, vertical: 0,
};

/** Dead-zone hysteresis avoids spurious repeat actions from a drifting stick. */
export function axisDirection070424(value: number, previous: -1 | 0 | 1): -1 | 0 | 1 {
  if (value >= 0.58) return 1;
  if (value <= -0.58) return -1;
  if (Math.abs(value) <= 0.35) return 0;
  return previous;
}

const PAD_BUTTONS_070424: ReadonlyArray<readonly [number, PadAction070424]> = [
  [12, 'up'], [13, 'down'], [14, 'left'], [15, 'right'],
  [0, 'confirm'], [1, 'back'], [2, 'overview'], [3, 'card'],
  [9, 'settings'],
];

/** Rising edges only: one D-pad press or stick tilt = one navigation step. */
export function padEdges070424(
  pad: PadSnapshot070424,
  previous: PadEdgeState070424 = EMPTY_PAD_STATE_070424,
): { actions: PadAction070424[]; next: PadEdgeState070424 } {
  const buttons = pad.buttons.map((button) => Boolean(button.pressed));
  const horizontal = axisDirection070424(pad.axes[0] ?? 0, previous.horizontal);
  const vertical = axisDirection070424(pad.axes[1] ?? 0, previous.vertical);
  const actions = new Set<PadAction070424>();
  for (const [index, action] of PAD_BUTTONS_070424) {
    if (buttons[index] && !previous.buttons[index]) actions.add(action);
  }
  if (horizontal !== previous.horizontal && horizontal !== 0) {
    actions.add(horizontal < 0 ? 'left' : 'right');
  }
  if (vertical !== previous.vertical && vertical !== 0) {
    actions.add(vertical < 0 ? 'up' : 'down');
  }
  return { actions: [...actions], next: { buttons, horizontal, vertical } };
}

/** Spatial navigation, with wrapping when a layout has no item in that direction. */
export function nextSpatialIndex070424(
  current: number,
  points: readonly { x: number; y: number }[],
  direction: 'up' | 'down' | 'left' | 'right',
): number {
  if (points.length === 0) return -1;
  const at = current >= 0 && current < points.length ? current : 0;
  const from = points[at]!;
  let best = -1;
  let score = Number.POSITIVE_INFINITY;
  points.forEach((item, index) => {
    if (index === at) return;
    const dx = item.x - from.x;
    const dy = item.y - from.y;
    const primary = direction === 'left' ? -dx
      : direction === 'right' ? dx
        : direction === 'up' ? -dy : dy;
    if (primary <= 5) return;
    const orthogonal = direction === 'left' || direction === 'right' ? dy : dx;
    const candidate = primary + Math.abs(orthogonal) * 0.65;
    if (candidate < score) { score = candidate; best = index; }
  });
  if (best >= 0) return best;
  if (direction === 'up' || direction === 'left') return points.length - 1;
  return 0;
}

/** Skip unavailable entries and wrap inside a native HTML SELECT on a Deck. */
export function cycleSelectOption070425(
  selectedIndex: number,
  options: readonly { disabled: boolean }[],
  step: -1 | 1,
): number {
  if (options.length === 0) return -1;
  let index = selectedIndex >= 0 && selectedIndex < options.length ? selectedIndex : 0;
  for (let count = 0; count < options.length; count += 1) {
    index = (index + step + options.length) % options.length;
    if (!options[index]!.disabled) return index;
  }
  return selectedIndex;
}
