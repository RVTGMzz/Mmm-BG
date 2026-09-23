import Phaser from 'phaser';
import {
  EMPTY_PAD_STATE_070424,
  nextSpatialIndex070424,
  cycleSelectOption070425,
  padEdges070424,
  type PadAction070424,
  type PadEdgeState070424,
} from './steamDeckPadPolicy070424';

type Direction070424 = 'up' | 'down' | 'left' | 'right';
type Focusable070424 = Phaser.GameObjects.GameObject & {
  input?: Phaser.Types.Input.InteractiveObject | null;
  active: boolean;
  visible: boolean;
  parentContainer?: Phaser.GameObjects.Container | null;
  x?: number; y?: number; depth?: number;
  getBounds?: () => Phaser.Geom.Rectangle;
};
type SceneRuntime070424 = Phaser.Scene & {
  presentation?: {
    active?: Phaser.GameObjects.Container;
    currentModel?: { kind: string };
    isBlocking(): boolean;
  };
  directDice?: Phaser.GameObjects.Container;
  compactCard?: Phaser.GameObjects.Rectangle;
  overviewMode?: boolean;
  currentPlayer?: () => { id: number; handCardIds: readonly string[] } | undefined;
  canControlCurrentPlayer?: () => boolean;
  match?: { turn: { phase: string } };
  cardPickerOpen?: boolean;
  guideObjects?: Phaser.GameObjects.GameObject[];
  shell?: { status: 'waiting' | 'active' | 'ended' };
  shellOverlay?: Phaser.GameObjects.GameObject[];
  finalResultBlocker?: Phaser.GameObjects.Rectangle;
  podiumRevealBlocker?: Phaser.GameObjects.Rectangle;
};
const PAD_EVENT_070424 = 'mememe-gamepad-action-070424';
export { PAD_EVENT_070424 };

function visible070424(object: Phaser.GameObjects.GameObject): boolean {
  const o = object as Focusable070424;
  if (!o.active || !o.visible) return false;
  let parent = o.parentContainer;
  while (parent) {
    if (!parent.active || !parent.visible || parent.alpha <= 0.01) return false;
    parent = parent.parentContainer;
  }
  // Tiny-alpha rectangles are legitimate invisible HIT AREAS in Phaser.
  // Requiring alpha > .01 here made Roll For Order unplayable on a controller.
  return true;
}

function uiPoint070424(object: Focusable070424): { x: number; y: number } {
  const bounds = object.getBounds?.();
  if (bounds && bounds.width > 0 && bounds.height > 0) {
    return { x: bounds.centerX, y: bounds.centerY };
  }
  let x = object.x ?? 0;
  let y = object.y ?? 0;
  let parent = object.parentContainer;
  while (parent) { x = parent.x + x * parent.scaleX; y = parent.y + y * parent.scaleY; parent = parent.parentContainer; }
  return { x, y };
}

function visit070424(
  objects: readonly Phaser.GameObjects.GameObject[],
  callback: (object: Phaser.GameObjects.GameObject) => void,
): void {
  for (const object of objects) {
    callback(object);
    if (object instanceof Phaser.GameObjects.Container) visit070424(object.list, callback);
  }
}

function candidates070424(root: Phaser.GameObjects.Container): Focusable070424[] {
  const result: Focusable070424[] = [];
  visit070424(root.list, (o) => {
    const item = o as Focusable070424;
    if (!visible070424(item) || !item.input?.enabled || item.listenerCount('pointerdown') === 0) return;
    if (item instanceof Phaser.GameObjects.Rectangle && item.width >= 1100 && item.height >= 650) return;
    result.push(item);
  });
  return result.sort((a, b) => {
    const pa = uiPoint070424(a), pb = uiPoint070424(b);
    return pa.y - pb.y || pa.x - pb.x;
  });
}

function modalRoot070424(scene: Phaser.Scene): Phaser.GameObjects.Container | undefined {
  const named = new Set([
    'branch-picker-modal', 'card-hand-picker-modal', 'target-picker-modal',
    'tactical-choice-modal',
  ]);
  return scene.children.list
    .filter((o): o is Phaser.GameObjects.Container =>
      o instanceof Phaser.GameObjects.Container && visible070424(o)
      && (
        named.has(o.name)
        || o.list.some((child) =>
          child instanceof Phaser.GameObjects.Rectangle && child.width >= 1200 && child.height >= 650
          && child.input?.enabled)
      ),
    )
    .sort((a, b) => b.depth - a.depth)[0];
}

function domVisible070424(node: HTMLElement): boolean {
  return !node.hidden && !node.closest('[hidden], [aria-hidden="true"]')
    && node.getClientRects().length > 0
    && getComputedStyle(node).visibility !== 'hidden';
}

function domItems070424(root: HTMLElement): HTMLElement[] {
  return Array.from(root.querySelectorAll<HTMLElement>(
    'button:not(:disabled),select:not(:disabled),input:not(:disabled),[tabindex]:not([tabindex="-1"])',
  )).filter((node) =>
    domVisible070424(node)
    && !(node instanceof HTMLInputElement && (node.type === 'file' || node.type === 'hidden')),
  );
}

function activeDom070424(scene: Phaser.Scene): HTMLElement | undefined {
  const settings = document.querySelector<HTMLElement>('#mememe-settings.is-open');
  if (settings) return settings;
  const nodes = scene.children.list
    .filter((o): o is Phaser.GameObjects.DOMElement =>
      o instanceof Phaser.GameObjects.DOMElement && o.active && o.visible)
    .map((o) => o.node)
    .filter((n): n is HTMLElement => n instanceof HTMLElement && domVisible070424(n));
  // Setup exposes separate DOM roots for setup/rules, only one shown at a time.
  return nodes.find((n) => domItems070424(n).length > 0);
}

function defaultDomItem070424(root: HTMLElement, items: readonly HTMLElement[]): HTMLElement | undefined {
  for (const selector of [
    '#lobby-solo', '#online-ready', '#online-start', '#start-game',
    '.rule-confirm', '.settings-close',
  ]) {
    const preferred = root.querySelector<HTMLElement>(selector);
    if (preferred && items.includes(preferred)) return preferred;
  }
  return items[0];
}

function clickFirst070424(root: ParentNode, selector: string): boolean {
  const button = root.querySelector<HTMLButtonElement>(selector);
  if (!button || button.disabled || !domVisible070424(button)) return false;
  button.click();
  return true;
}

/**
 * One action owner per frame. The existing Mini Game poll stays exclusive while
 * its arena is active. Job Hub owns its own focus via the same scene event.
 * All other Phaser dialogs share spatial focus; DOM lobbies use real HTML focus.
 */
export function installSteamDeckController070424(game: Phaser.Game): () => void {
  if (typeof window === 'undefined' || typeof navigator === 'undefined' || !navigator.getGamepads) {
    return () => undefined;
  }

  const style = document.createElement('style');
  style.textContent = `
    .mememe-pad-focus-070424 { outline: 4px solid #5b8def !important;
      outline-offset: 5px !important; box-shadow: 0 0 0 7px #ffda66aa !important; }
    #mememe-pad-status-070424 { position: fixed; right: 16px; bottom: 13px;
      z-index: 8000; pointer-events: none; background: #202633e8;
      border: 2px solid #ffda66; border-radius: 12px; color: #fffaf0;
      font: 700 13px system-ui,sans-serif; padding: 7px 12px;
      opacity: 0; transition: opacity .18s; }
  `;
  document.head.appendChild(style);
  const status = document.createElement('div');
  status.id = 'mememe-pad-status-070424';
  status.textContent = '🎮 TAY CẦM • A CHỌN  B QUAY LẠI';
  document.body.appendChild(status);

  let disposed = false;
  let frame = 0;
  let connectedPad = -1;
  let state: PadEdgeState070424 = EMPTY_PAD_STATE_070424;
  let currentScene: Phaser.Scene | undefined;
  let phaserScope: Phaser.GameObjects.Container | Phaser.Scene | undefined;
  let phaserFocused: Focusable070424 | undefined;
  let focusRing: Phaser.GameObjects.Graphics | undefined;
  let domScope: HTMLElement | undefined;
  let domFocused: HTMLElement | undefined;
  let domSelectEditing = false;
  let domSelectOriginalIndex = -1;
  let statusTimer = 0;

  const say = (): void => {
    status.style.opacity = '1';
    window.clearTimeout(statusTimer);
    statusTimer = window.setTimeout(() => { status.style.opacity = '0'; }, 2400);
  };
  const finishDomSelect070425 = (commit: boolean): void => {
    if (!domSelectEditing) return;
    if (!commit && domFocused instanceof HTMLSelectElement && domSelectOriginalIndex >= 0) {
      domFocused.selectedIndex = domSelectOriginalIndex;
      domFocused.dispatchEvent(new Event('change', { bubbles: true }));
    }
    domSelectEditing = false;
    domSelectOriginalIndex = -1;
    status.textContent = '🎮 TAY CẦM • A CHỌN  B QUAY LẠI';
    status.style.opacity = '0';
  };
  const clearDom = (): void => {
    // A disconnect, scene change or menu close must not leave a SELECT in
    // half-edited state. Roll the preview back unless A confirmed it.
    finishDomSelect070425(false);
    domFocused?.classList.remove('mememe-pad-focus-070424');
    domScope = undefined;
    domFocused = undefined;
  };
  const clearPhaser = (): void => {
    if (phaserFocused?.active) phaserFocused.emit('pointerout');
    phaserFocused = undefined;
    phaserScope = undefined;
    if (focusRing?.active) focusRing.destroy();
    focusRing = undefined;
  };
  const setPhaser = (
    scene: Phaser.Scene,
    scope: Phaser.GameObjects.Container | Phaser.Scene,
    target: Focusable070424 | undefined,
  ): void => {
    if (phaserFocused === target && phaserScope === scope) return;
    if (phaserFocused?.active) phaserFocused.emit('pointerout');
    phaserScope = scope;
    phaserFocused = target;
    if (!target) { if (focusRing?.active) focusRing.setVisible(false); return; }
    target.emit('pointerover');
    if (!focusRing?.active || focusRing.scene !== scene) {
      if (focusRing?.active) focusRing.destroy();
      focusRing = scene.add.graphics().setDepth(1700).setName('steam-deck-focus-ring-070424');
    }
    focusRing.clear().setVisible(true);
    const bounds = target.getBounds?.();
    const p = uiPoint070424(target);
    const width = Math.max(36, (bounds?.width ?? 88) + 10);
    const height = Math.max(36, (bounds?.height ?? 58) + 10);
    focusRing.lineStyle(4, 0x5b8def, 1);
    focusRing.strokeRoundedRect(p.x - width / 2, p.y - height / 2, width, height, 15);
  };

  const handleDom = (root: HTMLElement, action: PadAction070424): void => {
    if (domScope !== root) { clearDom(); domScope = root; }
    const items = domItems070424(root);
    if (items.length === 0) return;
    if (!domFocused || !items.includes(domFocused)) {
      domFocused = defaultDomItem070424(root, items);
      domFocused?.classList.add('mememe-pad-focus-070424');
      domFocused?.focus({ preventScroll: true });
    }
    const setFocus = (target: HTMLElement | undefined): void => {
      if (!target || target === domFocused) return;
      domFocused?.classList.remove('mememe-pad-focus-070424');
      domFocused = target;
      target.classList.add('mememe-pad-focus-070424');
      target.focus({ preventScroll: true });
    };
    if (action === 'back') {
      if (domSelectEditing) { finishDomSelect070425(false); return; }
      if (domFocused instanceof HTMLInputElement && domFocused.type !== 'checkbox') {
        domFocused.blur(); return;
      }
      if (clickFirst070424(root, '.settings-close, .face-choice-close, .rule-back, #setup-back-mode, #online-leave')) {
        clearDom();
      }
      return;
    }
    if (action === 'settings') {
      clickFirst070424(document, '.settings-trigger');
      clearDom();
      return;
    }
    if (action === 'confirm') {
      if (!domFocused) return;
      if (domFocused instanceof HTMLInputElement && domFocused.type !== 'checkbox') {
        domFocused.focus(); return; // Steam+X opens Deck's on-screen keyboard.
      }
      if (domFocused instanceof HTMLSelectElement) {
        if (domSelectEditing) {
          finishDomSelect070425(true);
        } else {
          domSelectEditing = true;
          domSelectOriginalIndex = domFocused.selectedIndex;
          status.textContent = '🎮 ↑↓ ĐỔI LỰA CHỌN • A LƯU • B HỦY';
          window.clearTimeout(statusTimer);
          status.style.opacity = '1';
        }
        return;
      }
      domFocused.click();
      return;
    }
    if (action === 'overview' || action === 'card') return;
    if (!domFocused) return;
    if (domFocused instanceof HTMLSelectElement && (
      domSelectEditing || action === 'left' || action === 'right'
    )) {
      // A opens a select's edit mode. D-pad UP/DOWN then browse its choices,
      // without unexpectedly jumping to another menu control.
      const step: -1 | 1 = action === 'left' || action === 'up' ? -1 : 1;
      const next = cycleSelectOption070425(domFocused.selectedIndex, Array.from(domFocused.options), step);
      if (next !== domFocused.selectedIndex && next >= 0) {
        domFocused.selectedIndex = next;
        domFocused.dispatchEvent(new Event('input', { bubbles: true }));
        domFocused.dispatchEvent(new Event('change', { bubbles: true }));
      }
      return;
    }
    const index = items.indexOf(domFocused);
    const points = items.map((n) => {
      const rect = n.getBoundingClientRect();
      return { x: rect.left + rect.width / 2, y: rect.top + rect.height / 2 };
    });
    const next = nextSpatialIndex070424(index, points, action as Direction070424);
    setFocus(items[next]);
  };

  const handlePhaserModal = (
    scene: Phaser.Scene,
    root: Phaser.GameObjects.Container,
    action: PadAction070424,
  ): void => {
    if (action === 'settings') {
      clickFirst070424(document, '.settings-trigger'); return;
    }
    const items = candidates070424(root);
    if (items.length === 0) { clearPhaser(); return; }
    if (phaserScope !== root || !phaserFocused || !items.includes(phaserFocused)) {
      clearPhaser();
      setPhaser(scene, root, items[0]);
    }
    if (action === 'back') {
      // Only cancel-capable dialogs may be dismissed. Branch/target choices
      // must not fabricate a gameplay decision just to satisfy the B button.
      if (root.name === 'card-hand-picker-modal' || root.name === 'tactical-choice-modal') {
        const cancel = root.list.filter((item): item is Focusable070424 =>
          Boolean(item.input?.enabled) && item.listenerCount('pointerdown') > 0).at(-1);
        cancel?.emit('pointerdown');
        clearPhaser();
      }
      return;
    }
    if (action === 'confirm') {
      phaserFocused?.emit('pointerdown');
      clearPhaser(); // Dialog may have been destroyed synchronously by its action.
      return;
    }
    if (action === 'overview' || action === 'card') return;
    const index = items.indexOf(phaserFocused!);
    const next = nextSpatialIndex070424(index, items.map(uiPoint070424), action as Direction070424);
    setPhaser(scene, root, items[next]);
  };

  const handleScene = (scene: Phaser.Scene, action: PadAction070424): void => {
    const runtime = scene as SceneRuntime070424;
    const settingsOpen = document.querySelector<HTMLElement>('#mememe-settings.is-open');
    if (settingsOpen) { clearPhaser(); handleDom(settingsOpen, action); return; }
    if (action === 'settings') {
      clickFirst070424(document, '.settings-trigger');
      clearPhaser(); clearDom(); return;
    }

    // Steam Deck splash uses the existing canonical keyboard start action.
    if (scene.scene.key === 'SplashScene069') {
      if (action === 'confirm') scene.input.keyboard?.emit('keydown-ENTER');
      return;
    }

    const minigame = scene.children.list.some((o) =>
      o instanceof Phaser.GameObjects.Container && o.active && o.visible && o.name === 'minigame-modal');
    if (minigame) {
      clearPhaser(); clearDom();
      // Mini Game uses its own exclusive poll. Never double-confirm its A press.
      return;
    }

    const jobModal = scene.children.list.find((o): o is Phaser.GameObjects.Container =>
      o instanceof Phaser.GameObjects.Container && o.active && o.visible
      && o.name === 'job-hub-modal');
    if (jobModal) {
      clearPhaser(); clearDom();
      // Job Hub owns default dice focus, spectator permissions and details.
      scene.events.emit(PAD_EVENT_070424, action);
      return;
    }

    const dom = activeDom070424(scene);
    if (dom) { clearPhaser(); handleDom(dom, action); return; }
    clearDom();

    if (runtime.guideObjects?.length) {
      const close = runtime.guideObjects.find((o) =>
        o.input?.enabled && o.listenerCount('pointerdown') > 0
        && !(o instanceof Phaser.GameObjects.Rectangle && o.width >= 1100));
      if (action === 'confirm' || action === 'back') close?.emit('pointerdown');
      return;
    }

    const modal = modalRoot070424(scene);
    if (modal) { handlePhaserModal(scene, modal, action); return; }

    if (runtime.presentation?.isBlocking() && runtime.presentation.currentModel?.kind !== 'move_step') {
      clearPhaser();
      if (action === 'confirm') {
        const active = runtime.presentation.active;
        if (active?.name === 'job-presentation-card') {
          const hit = candidates070424(active)[0];
          if (hit) hit.emit('pointerdown');
        } else {
          scene.input.keyboard?.emit('keydown-ENTER');
        }
      }
      return;
    }

    if (scene.scene.key === 'TurnOrderScene') {
      clearPhaser();
      const roll = (scene as Phaser.Scene & { rollButton?: Phaser.GameObjects.Rectangle }).rollButton;
      if (action === 'confirm' && roll?.active && roll.visible && roll.input?.enabled) {
        roll.emit('pointerdown');
      }
      if (action === 'back') {
        const back = scene.children.list.find((o) =>
          o instanceof Phaser.GameObjects.Text && o.active && o.visible
          && o.text.includes('QUAY LẠI') && o.input?.enabled);
        back?.emit('pointerdown');
      }
      return;
    }

    // The final podium is a separate, input-gated UI. No synthetic event may
    // bypass the reveal blocker or let a Steam Deck rematch before the result
    // has finished animating. A defaults to CHƠI LẠI when the HOST owns it.
    if (runtime.shell?.status === 'ended') {
      if (runtime.finalResultBlocker?.active || runtime.podiumRevealBlocker?.active) {
        clearPhaser();
        return;
      }
      const buttons = (runtime.shellOverlay ?? []).filter((o): o is Focusable070424 =>
        visible070424(o) && Boolean(o.input?.enabled) && o.listenerCount('pointerdown') > 0);
      if (!buttons.length) { clearPhaser(); return; }
      if (phaserScope !== scene || !phaserFocused || !buttons.includes(phaserFocused)) {
        clearPhaser();
        setPhaser(scene, scene, buttons[0]);
      }
      if (action === 'confirm') {
        phaserFocused?.emit('pointerdown');
        clearPhaser();
      } else if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
        const next = nextSpatialIndex070424(
          buttons.indexOf(phaserFocused!),
          buttons.map(uiPoint070424),
          action,
        );
        setPhaser(scene, scene, buttons[next]);
      }
      return;
    }

    // Active board: default A always targets the authoritative movement D6.
    // X toggles overview, Y uses a card only on a permitted human PRE_ROLL turn.
    if (scene.scene.key === 'CareerMinigameBoardScene'
      || scene.scene.key === 'ActiveBoardScene'
      || Boolean(runtime.match && runtime.directDice)) {
      clearPhaser();
      if (action === 'overview' || (action === 'back' && runtime.overviewMode)) {
        scene.input.keyboard?.emit('keydown-O'); return;
      }
      if (action === 'card') {
        const player = runtime.currentPlayer?.();
        if (runtime.match?.turn.phase === 'PRE_ROLL_ACTION'
          && runtime.canControlCurrentPlayer?.() && !runtime.cardPickerOpen
          && player?.handCardIds.length) {
          const card = runtime.compactCard;
          if (card?.active && card.visible && card.input?.enabled) card.emit('pointerdown');
        }
        return;
      }
      if (action === 'confirm') {
        const dice = runtime.directDice;
        if (dice?.active && dice.visible) {
          const hit = dice.list.find((o) => o.input?.enabled && o.listenerCount('pointerdown') > 0);
          hit?.emit('pointerdown');
        }
      }
      return;
    }

    // Other Phaser scenes with small sets of interactive buttons.
    const buttons = scene.children.list
      .filter((o): o is Focusable070424 => visible070424(o)
        && Boolean(o.input?.enabled) && o.listenerCount('pointerdown') > 0
        && !(o instanceof Phaser.GameObjects.Rectangle && o.width >= 1100));
    if (buttons.length === 0) { clearPhaser(); return; }
    if (phaserScope !== scene || !phaserFocused || !buttons.includes(phaserFocused)) {
      clearPhaser();
      setPhaser(scene, scene, buttons[0]);
    }
    if (action === 'confirm') {
      phaserFocused?.emit('pointerdown');
      clearPhaser();
    } else if (action === 'left' || action === 'right' || action === 'up' || action === 'down') {
      const next = nextSpatialIndex070424(
        buttons.indexOf(phaserFocused!),
        buttons.map(uiPoint070424),
        action,
      );
      setPhaser(scene, scene, buttons[next]);
    }

  };

  const tick = (): void => {
    if (disposed) return;
    const scenes = game.scene.getScenes(true);
    const scene = scenes[scenes.length - 1];
    if (scene !== currentScene) {
      clearPhaser(); clearDom();
      currentScene = scene;
    }
    let pad: Gamepad | undefined;
    if (!document.hidden) {
      try {
        pad = Array.from(navigator.getGamepads()).find((p): p is Gamepad => Boolean(p?.connected));
      } catch { /* WebKit/Gamepad API permission or secure-context restriction. */ }
    }
    if (!pad) {
      connectedPad = -1;
      state = EMPTY_PAD_STATE_070424;
      clearPhaser(); clearDom();
      frame = window.requestAnimationFrame(tick);
      return;
    }
    if (connectedPad !== pad.index) {
      connectedPad = pad.index;
      state = EMPTY_PAD_STATE_070424;
      say();
    }
    const edge = padEdges070424(pad, state);
    state = edge.next;
    if (scene && scene.sys.isActive()) for (const action of edge.actions) {
      handleScene(scene, action);
      // The initial controller hint is transient. Never keep it on screen
      // during every D-pad press: it would cover the P4 corner HUD.
      // A click can change the active scene; never dispatch a second
      // button from the same frame to a stale scene/controller owner.
      if (game.scene.getScenes(true).at(-1) !== scene) break;
    }
    frame = window.requestAnimationFrame(tick);
  };
  frame = window.requestAnimationFrame(tick);

  return () => {
    disposed = true;
    window.cancelAnimationFrame(frame);
    window.clearTimeout(statusTimer);
    clearDom(); clearPhaser();
    status.remove(); style.remove();
  };
}
