const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;

let landscapeGuard07031: HTMLDivElement | undefined;
let landscapeRequirementActive07035 = false;
let landscapeRequirementResolve07035: (() => void) | undefined;
let rotateButtonBusy07035 = false;

function phoneLike07031(): boolean {
  const coarse = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
  const shortEdge = Math.min(
    window.screen?.width || window.innerWidth,
    window.screen?.height || window.innerHeight,
  );
  return PHONE_UA_RE.test(navigator.userAgent) || (coarse && shortEdge <= 700);
}

function portrait07031(): boolean {
  return window.innerHeight > window.innerWidth;
}

type LockableOrientation = ScreenOrientation & {
  lock?: (orientation: 'landscape') => Promise<void>;
};

function finishLandscapeRequirement07035(): void {
  if (portrait07031()) return;
  landscapeRequirementActive07035 = false;
  document.body.classList.remove('mememe-phone-portrait');
  landscapeGuard07031?.classList.remove('is-visible');
  const resolve = landscapeRequirementResolve07035;
  landscapeRequirementResolve07035 = undefined;
  resolve?.();
}

function refreshLandscapeGuard07031(): void {
  if (!landscapeGuard07031) return;
  const blocked = landscapeRequirementActive07035 && portrait07031();
  landscapeGuard07031.classList.toggle('is-visible', blocked);
  document.body.classList.toggle('mememe-phone-portrait', blocked);
  if (!blocked && landscapeRequirementActive07035) finishLandscapeRequirement07035();
}

export async function tryLockMobileLandscape07031(requestFullscreen = false): Promise<boolean> {
  if (!phoneLike07031()) return false;

  try {
    if (requestFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen is best-effort. Manual rotation remains available.
  }

  const orientation = screen.orientation as LockableOrientation | undefined;
  if (!orientation?.lock) return false;

  try {
    await orientation.lock('landscape');
    return true;
  } catch {
    return false;
  }
}

async function activateLandscapeRequirement07035(): Promise<void> {
  if (!phoneLike07031() || !portrait07031()) return;

  landscapeRequirementActive07035 = true;
  refreshLandscapeGuard07031();

  await new Promise<void>((resolve) => {
    landscapeRequirementResolve07035 = resolve;
    refreshLandscapeGuard07031();
  });
}

/**
 * Mobile boot authority:
 * do not create Phaser until the phone is landscape, so Splash/intro starts fresh.
 */
export async function requireMobileLandscapeBeforeGame07035(): Promise<void> {
  await activateLandscapeRequirement07035();
}

/**
 * Native image pickers can return Android/iOS to portrait.
 * Reuse the same tappable XOAY NGANG gate before opening the face editor.
 */
export async function waitForMobileLandscapeAfterPicker07032(): Promise<void> {
  await activateLandscapeRequirement07035();
}

export function prepareForNativePicker07033(): void {
  // Let the native picker own the screen. If it returns portrait, the same
  // landscape gate will be activated by waitForMobileLandscapeAfterPicker07032.
  landscapeRequirementActive07035 = false;
  landscapeRequirementResolve07035 = undefined;
  landscapeGuard07031?.classList.remove('is-visible');
  document.body.classList.remove('mememe-phone-portrait');
}

export function recoverMobileLandscapeAfterPicker07031(): void {
  void waitForMobileLandscapeAfterPicker07032();
}

export function requireInitialMobileLandscape07032(): void {
  // Compatibility shim. Boot now awaits requireMobileLandscapeBeforeGame07035.
}

export function installMobileLandscapeGuard07031(): () => void {
  if (!phoneLike07031()) return () => {};

  const guard = document.createElement('div');
  guard.className = 'mememe-landscape-guard mememe-landscape-guard-simple';
  guard.setAttribute('role', 'dialog');
  guard.setAttribute('aria-live', 'polite');
  guard.setAttribute('aria-label', 'Xoay ngang điện thoại');
  guard.innerHTML = `
    <button class="mememe-landscape-card mememe-landscape-card-simple" type="button">
      <span class="mememe-landscape-phone" aria-hidden="true">📱↻</span>
      <strong>XOAY NGANG</strong>
    </button>
  `;
  document.body.appendChild(guard);
  landscapeGuard07031 = guard;

  const refresh = () => refreshLandscapeGuard07031();
  const rotateButton = guard.querySelector<HTMLButtonElement>('.mememe-landscape-card-simple');

  rotateButton?.addEventListener('click', async () => {
    if (rotateButtonBusy07035) return;
    rotateButtonBusy07035 = true;
    rotateButton.disabled = true;

    try {
      await tryLockMobileLandscape07031(true);
      refresh();
      window.setTimeout(refresh, 120);
      window.setTimeout(refresh, 320);
    } finally {
      window.setTimeout(() => {
        rotateButtonBusy07035 = false;
        rotateButton.disabled = false;
        refresh();
      }, 360);
    }
  });

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  document.addEventListener('fullscreenchange', refresh);

  refresh();

  return () => {
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
    window.visualViewport?.removeEventListener('resize', refresh);
    document.removeEventListener('fullscreenchange', refresh);
    document.body.classList.remove('mememe-phone-portrait');
    landscapeRequirementResolve07035 = undefined;
    guard.remove();
    if (landscapeGuard07031 === guard) landscapeGuard07031 = undefined;
  };
}
