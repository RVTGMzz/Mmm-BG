export const MMM_LOGICAL_WIDTH_0705 = 1280;
export const MMM_LOGICAL_HEIGHT_0705 = 720;

export type SteamDeckFullscreenShellMode0705 =
  | 'standard-fit'
  | 'steam-deck-fullscreen-shell';

export interface SteamDeckFullscreenPolicy0705 {
  viewportWidth: number;
  viewportHeight: number;
  viewportAspect: number;
  fitScale: number;
  fittedWidth: number;
  fittedHeight: number;
  horizontalInset: number;
  verticalInset: number;
  mode: SteamDeckFullscreenShellMode0705;
  strategy: 'fit' | 'fit-with-ambient-bleed';
  cropX: 0;
  cropY: 0;
  safeLogicalRect: {
    x: 0;
    y: 0;
    width: typeof MMM_LOGICAL_WIDTH_0705;
    height: typeof MMM_LOGICAL_HEIGHT_0705;
  };
}

function finiteViewportDimension0705(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.max(1, value);
}

function stable0705(value: number): number {
  return Math.round(value * 1000) / 1000;
}

/**
 * Steam Deck is 16:10 while MMM's authored gameplay surface is 16:9.
 *
 * We deliberately DO NOT use ENVELOP/COVER here: that would crop the left/right
 * edge of the authored 1280x720 surface, exactly where the four-corner HUD and
 * modal-safe lanes live. Instead the game stays FIT and the excess handheld
 * viewport becomes an ambient MMM shell behind the canvas.
 */
export function resolveSteamDeckFullscreen0705(
  viewportWidth: number,
  viewportHeight: number,
): SteamDeckFullscreenPolicy0705 {
  const width = finiteViewportDimension0705(viewportWidth);
  const height = finiteViewportDimension0705(viewportHeight);
  const fitScale = Math.min(
    width / MMM_LOGICAL_WIDTH_0705,
    height / MMM_LOGICAL_HEIGHT_0705,
  );
  const fittedWidth = MMM_LOGICAL_WIDTH_0705 * fitScale;
  const fittedHeight = MMM_LOGICAL_HEIGHT_0705 * fitScale;
  const horizontalInset = Math.max(0, (width - fittedWidth) / 2);
  const verticalInset = Math.max(0, (height - fittedHeight) / 2);
  const aspect = width / height;

  // Covers Steam Deck / common 16:10 handheld and laptop viewports without
  // taking over the existing phone-landscape path. A small tolerance accounts
  // for browser UI reducing the visible height.
  const steamDeckLike =
    width >= 900 &&
    height >= 600 &&
    aspect >= 1.52 &&
    aspect <= 1.72 &&
    verticalInset >= 8 &&
    horizontalInset <= 1;

  return {
    viewportWidth: stable0705(width),
    viewportHeight: stable0705(height),
    viewportAspect: stable0705(aspect),
    fitScale: stable0705(fitScale),
    fittedWidth: stable0705(fittedWidth),
    fittedHeight: stable0705(fittedHeight),
    horizontalInset: stable0705(horizontalInset),
    verticalInset: stable0705(verticalInset),
    mode: steamDeckLike ? 'steam-deck-fullscreen-shell' : 'standard-fit',
    strategy: steamDeckLike ? 'fit-with-ambient-bleed' : 'fit',
    cropX: 0,
    cropY: 0,
    safeLogicalRect: {
      x: 0,
      y: 0,
      width: MMM_LOGICAL_WIDTH_0705,
      height: MMM_LOGICAL_HEIGHT_0705,
    },
  };
}

export function syncSteamDeckFullscreenShell0705(): SteamDeckFullscreenPolicy0705 {
  const visibleWidth = window.visualViewport?.width ?? window.innerWidth;
  const visibleHeight = window.visualViewport?.height ?? window.innerHeight;
  const policy = resolveSteamDeckFullscreen0705(visibleWidth, visibleHeight);
  const app = document.getElementById('app');

  document.documentElement.setAttribute('data-mmm-viewport-shell', policy.mode);
  app?.setAttribute('data-mmm-viewport-shell', policy.mode);

  document.documentElement.style.setProperty(
    '--mmm-shell-band-y',
    `${policy.verticalInset}px`,
  );
  document.documentElement.style.setProperty(
    '--mmm-fit-width',
    `${policy.fittedWidth}px`,
  );
  document.documentElement.style.setProperty(
    '--mmm-fit-height',
    `${policy.fittedHeight}px`,
  );

  return policy;
}
