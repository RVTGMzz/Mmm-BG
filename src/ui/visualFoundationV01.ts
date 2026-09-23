export const VISUAL_FOUNDATION_V01 = Object.freeze({
  id: 'visual-foundation-0.1',
  phases: ['VF-01', 'VF-02', 'VF-03', 'VF-04'] as const,
  tokenPrefix: '--vf-',
  buttonClass: 'vf-button',
  panelClass: 'vf-panel',
  modalClass: 'vf-modal',
});

export type VisualFoundationButtonVariantV01 =
  | 'primary'
  | 'secondary'
  | 'subtle'
  | 'danger'
  | 'success';

export type VisualFoundationButtonSizeV01 = 'sm' | 'md' | 'lg';

const BUTTON_VARIANTS_V01: readonly VisualFoundationButtonVariantV01[] = [
  'primary',
  'secondary',
  'subtle',
  'danger',
  'success',
];

const BUTTON_SIZES_V01: readonly VisualFoundationButtonSizeV01[] = ['sm', 'md', 'lg'];

export interface VisualFoundationButtonSpecV01 {
  selector: string;
  variant: VisualFoundationButtonVariantV01;
  size?: VisualFoundationButtonSizeV01;
}

/**
 * Applies the canonical VF-02 button skin without changing the button's event
 * listeners, ID, text, disabled state or gameplay semantics.
 */
export function decorateVisualFoundationButtonV01(
  button: HTMLButtonElement,
  variant: VisualFoundationButtonVariantV01 = 'primary',
  size: VisualFoundationButtonSizeV01 = 'md',
): HTMLButtonElement {
  button.classList.add(VISUAL_FOUNDATION_V01.buttonClass);

  for (const value of BUTTON_VARIANTS_V01) {
    button.classList.remove(`vf-button--${value}`);
  }
  for (const value of BUTTON_SIZES_V01) {
    button.classList.remove(`vf-button--${value}`);
  }

  button.classList.add(`vf-button--${variant}`, `vf-button--${size}`);
  button.dataset.vfButton = `${variant}:${size}`;
  return button;
}

/**
 * Decorates a live DOM surface from selector specs. Missing selectors are
 * intentionally ignored so host/client conditional controls can share specs.
 */
export function decorateVisualFoundationButtonsV01(
  root: ParentNode,
  specs: readonly VisualFoundationButtonSpecV01[],
): void {
  for (const spec of specs) {
    root.querySelectorAll<HTMLButtonElement>(spec.selector).forEach((button) => {
      decorateVisualFoundationButtonV01(button, spec.variant, spec.size ?? 'md');
    });
  }
}

/** VF-03 shared DOM panel primitive. Only style classes change; callers own gameplay. */
export type VisualFoundationPanelVariantV01 = 'compact' | 'normal' | 'wide' | 'event';

export function decorateVisualFoundationPanelV01<T extends HTMLElement>(
  panel: T,
  variant: VisualFoundationPanelVariantV01 = 'normal',
): T {
  panel.classList.add(VISUAL_FOUNDATION_V01.panelClass);
  for (const name of ['compact', 'normal', 'wide', 'event']) {
    panel.classList.remove(`vf-panel--${name}`);
  }
  panel.classList.add(`vf-panel--${variant}`);
  panel.dataset.vfPanel = variant;
  return panel;
}

export interface VisualFoundationModalHandleV01 {
  open(): void;
  close(): void;
  destroy(): void;
  readonly isOpen: boolean;
}

/**
 * One owned, focus-trapped modal at a time on a DOM surface. This handles UI
 * visibility/focus only and cannot submit an authoritative game intent.
 * Background pointer suppression remains the caller's existing backdrop.
 */
export function bindVisualFoundationModalV01(
  root: HTMLElement,
  opener: HTMLElement,
): VisualFoundationModalHandleV01 {
  const selectable = (): HTMLButtonElement[] => Array.from(
    root.querySelectorAll<HTMLButtonElement>('button:not(:disabled)'),
  ).filter((button) => !button.hidden);
  let open = !root.hidden;
  let disposed = false;

  const close = (): void => {
    if (!open || disposed) return;
    root.hidden = true;
    open = false;
    root.setAttribute('aria-hidden', 'true');
    if (root.contains(document.activeElement)) opener.focus({ preventScroll: true });
  };
  const show = (): void => {
    if (disposed || open) return;
    root.hidden = false;
    open = true;
    root.removeAttribute('aria-hidden');
    (selectable()[0] ?? root).focus({ preventScroll: true });
  };
  const onKey = (event: KeyboardEvent): void => {
    if (!open || disposed) return;
    if (event.key === 'Escape') {
      event.preventDefault();
      event.stopPropagation();
      close();
      return;
    }
    if (event.key !== 'Tab') return;
    const buttons = selectable();
    if (!buttons.length) {
      event.preventDefault();
      root.focus({ preventScroll: true });
      return;
    }
    const active = document.activeElement as HTMLButtonElement | null;
    const index = buttons.indexOf(active as HTMLButtonElement);
    const next = event.shiftKey
      ? index <= 0 ? buttons.length - 1 : index - 1
      : index < 0 || index === buttons.length - 1 ? 0 : index + 1;
    event.preventDefault();
    buttons[next]?.focus({ preventScroll: true });
  };
  root.addEventListener('keydown', onKey);

  return {
    open: show,
    close,
    get isOpen() { return open; },
    destroy() {
      if (disposed) return;
      if (open) close();
      disposed = true;
      root.removeEventListener('keydown', onKey);
    },
  };
}
