export const VISUAL_FOUNDATION_V01 = Object.freeze({
  id: 'visual-foundation-0.1',
  phases: ['VF-01', 'VF-02'] as const,
  tokenPrefix: '--vf-',
  buttonClass: 'vf-button',
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
