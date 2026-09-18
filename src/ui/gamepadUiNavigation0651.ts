import Phaser from 'phaser';

export type GamepadUiAction0651 = 'confirm' | 'back' | 'up' | 'down' | 'left' | 'right';

type FocusableObject0651 = Phaser.GameObjects.GameObject & {
  active: boolean;
  visible: boolean;
  alpha?: number;
  depth?: number;
  x?: number;
  y?: number;
  input?: Phaser.Types.Input.InteractiveObject | null;
  parentContainer?: Phaser.GameObjects.Container | null;
  getBounds?: () => Phaser.Geom.Rectangle;
};

type Candidate0651 = {
  object: FocusableObject0651;
  scene: Phaser.Scene;
  x: number;
  y: number;
  layer: number;
};

const BUTTON_ACTION_0651: Record<number, GamepadUiAction0651 | undefined> = {
  0: 'confirm',
  1: 'back',
  12: 'up',
  13: 'down',
  14: 'left',
  15: 'right',
};

export function gamepadButtonAction0651(index: number): GamepadUiAction0651 | undefined {
  return BUTTON_ACTION_0651[index];
}

function effectivelyVisible0651(object: FocusableObject0651): boolean {
  if (!object.active || !object.visible || (object.alpha ?? 1) <= 0.01) return false;
  let parent = object.parentContainer ?? null;
  while (parent) {
    if (!parent.active || !parent.visible || parent.alpha <= 0.01) return false;
    parent = parent.parentContainer;
  }
  return true;
}

function effectiveDepth0651(object: FocusableObject0651): number {
  let depth = object.depth ?? 0;
  let parent = object.parentContainer ?? null;
  while (parent) {
    depth = Math.max(depth, parent.depth);
    parent = parent.parentContainer;
  }
  return depth;
}

function isBackdrop0651(object: FocusableObject0651): boolean {
  if (!(object instanceof Phaser.GameObjects.Rectangle)) return false;
  return object.width >= 1000 && object.height >= 600;
}

function center0651(object: FocusableObject0651): { x: number; y: number } {
  if (typeof object.getBounds === 'function') {
    const bounds = object.getBounds();
    return { x: bounds.centerX, y: bounds.centerY };
  }
  return { x: object.x ?? 0, y: object.y ?? 0 };
}

function visitTree0651(
  objects: readonly Phaser.GameObjects.GameObject[],
  visit: (object: Phaser.GameObjects.GameObject) => void,
): void {
  for (const object of objects) {
    visit(object);
    if (object instanceof Phaser.GameObjects.Container) visitTree0651(object.list, visit);
  }
}

function sceneCandidates0651(scene: Phaser.Scene, sceneRank: number): Candidate0651[] {
  const candidates: Candidate0651[] = [];
  visitTree0651(scene.children.list, (gameObject) => {
    const object = gameObject as FocusableObject0651;
    if (!effectivelyVisible0651(object)) return;
    if (!object.input?.enabled) return;
    if (isBackdrop0651(object)) return;
    if (object.listenerCount('pointerdown') <= 0) return;
    const point = center0651(object);
    candidates.push({
      object,
      scene,
      x: point.x,
      y: point.y,
      layer: sceneRank * 10000 + effectiveDepth0651(object),
    });
  });
  return candidates;
}

function currentCandidates0651(game: Phaser.Game): Candidate0651[] {
  const scenes = game.scene.getScenes(true);
  const all = scenes.flatMap((scene, index) => sceneCandidates0651(scene, index));
  if (all.length === 0) return [];
  const maxLayer = Math.max(...all.map((candidate) => candidate.layer));
  return all
    .filter((candidate) => candidate.layer === maxLayer)
    .sort((left, right) => left.y - right.y || left.x - right.x);
}

export function directionalCandidateIndex0651(
  currentIndex: number,
  candidates: readonly Pick<Candidate0651, 'x' | 'y'>[],
  direction: Exclude<GamepadUiAction0651, 'confirm' | 'back'>,
): number {
  if (candidates.length === 0) return -1;
  const safeIndex = currentIndex >= 0 && currentIndex < candidates.length ? currentIndex : 0;
  const current = candidates[safeIndex]!;
  let bestIndex = -1;
  let bestScore = Number.POSITIVE_INFINITY;

  candidates.forEach((candidate, index) => {
    if (index === safeIndex) return;
    const dx = candidate.x - current.x;
    const dy = candidate.y - current.y;
    const inDirection =
      direction === 'left' ? dx < -4 :
      direction === 'right' ? dx > 4 :
      direction === 'up' ? dy < -4 :
      dy > 4;
    if (!inDirection) return;

    const primary = direction === 'left' || direction === 'right' ? Math.abs(dx) : Math.abs(dy);
    const secondary = direction === 'left' || direction === 'right' ? Math.abs(dy) : Math.abs(dx);
    const score = primary + secondary * 0.42;
    if (score < bestScore) {
      bestScore = score;
      bestIndex = index;
    }
  });

  if (bestIndex >= 0) return bestIndex;
  if (direction === 'left' || direction === 'up') return candidates.length - 1;
  return 0;
}

/**
 * Browser-level controller navigation used by the Steam Deck web playtest.
 * Standard Gamepad mapping: D-pad 12..15, A = 0, B = 1. Existing pointer handlers
 * remain the source of truth for confirm; B emits a scene-level UI back event so
 * blocking detail surfaces can close without inventing gameplay state.
 */
export function installGlobalGamepadUiNavigation0651(game: Phaser.Game): () => void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.getGamepads) {
    return () => undefined;
  }

  let disposed = false;
  let frame = 0;
  let focus: FocusableObject0651 | undefined;
  let previousButtons: boolean[] = [];

  const clearFocus = (): void => {
    if (focus?.active) focus.emit('pointerout');
    focus = undefined;
  };

  const setFocus = (next: FocusableObject0651 | undefined): void => {
    if (focus === next) return;
    if (focus?.active) focus.emit('pointerout');
    focus = next;
    if (focus?.active) focus.emit('pointerover');
  };

  const handleAction = (action: GamepadUiAction0651): void => {
    if (action === 'back') {
      const scenes = game.scene.getScenes(true);
      const topScene = scenes[scenes.length - 1];
      topScene?.events.emit('mememe-ui-back');
      clearFocus();
      return;
    }

    const candidates = currentCandidates0651(game);
    if (candidates.length === 0) {
      clearFocus();
      return;
    }

    let currentIndex = focus
      ? candidates.findIndex((candidate) => candidate.object === focus)
      : -1;
    if (currentIndex < 0) {
      currentIndex = 0;
      setFocus(candidates[0]!.object);
    }

    if (action === 'confirm') {
      const target = candidates[currentIndex]?.object;
      if (target?.active) target.emit('pointerdown');
      return;
    }

    const nextIndex = directionalCandidateIndex0651(currentIndex, candidates, action);
    if (nextIndex >= 0) setFocus(candidates[nextIndex]!.object);
  };

  const tick = (): void => {
    if (disposed) return;
    const pads = navigator.getGamepads();
    const pad = Array.from(pads).find((candidate): candidate is Gamepad => Boolean(candidate?.connected));
    if (!pad) {
      previousButtons = [];
      frame = window.requestAnimationFrame(tick);
      return;
    }

    const nextButtons = pad.buttons.map((button) => button.pressed);
    for (const [indexText, action] of Object.entries(BUTTON_ACTION_0651)) {
      if (!action) continue;
      const index = Number(indexText);
      const pressed = nextButtons[index] ?? false;
      const wasPressed = previousButtons[index] ?? false;
      if (pressed && !wasPressed) handleAction(action);
    }
    previousButtons = nextButtons;
    frame = window.requestAnimationFrame(tick);
  };

  frame = window.requestAnimationFrame(tick);
  return () => {
    disposed = true;
    if (frame) window.cancelAnimationFrame(frame);
    clearFocus();
  };
}
