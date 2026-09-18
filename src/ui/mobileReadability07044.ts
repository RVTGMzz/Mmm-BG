export const MOBILE_UI_BUILD_07044 = '0.1.70.4.4';

export const MOBILE_UI_FONT_07044 =
  '"Arial Rounded MT Bold", ui-rounded, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif';

export function isCompactLandscape07044(): boolean {
  if (typeof window === 'undefined') return false;

  const width = Math.max(1, window.innerWidth);
  const height = Math.max(1, window.innerHeight);
  const landscape = width >= height;
  const shortEdge = Math.min(width, height);
  const longEdge = Math.max(width, height);
  const coarsePointer = typeof window.matchMedia === 'function'
    ? window.matchMedia('(pointer: coarse)').matches
    : false;
  const touchDevice = typeof navigator !== 'undefined' && navigator.maxTouchPoints > 0;

  return landscape && (coarsePointer || touchDevice) && shortEdge <= 700 && longEdge <= 1180;
}
