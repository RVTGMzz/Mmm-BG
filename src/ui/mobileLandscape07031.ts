const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;
const ORIENTATION_API_TIMEOUT_MS_07036 = 700;
const ORIENTATION_SETTLE_MS_07036 = [80, 160, 280] as const;

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

function wait07036(ms: number): Promise<void> {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function settleBoolean07036(promise: Promise<unknown>, timeoutMs: number): Promise<boolean> {
  let timeoutId = 0;
  try {
    return await Promise.race([
      promise.then(() => true).catch(() => false),
      new Promise<boolean>((resolve) => {
        timeoutId = window.setTimeout(() => resolve(false), timeoutMs);
      }),
    ]);
  } finally {
    if (timeoutId) window.clearTimeout(timeoutId);
  }
}

function releaseLandscapeRequirement07036(mode: 'landscape' | 'manual-fallback'): void {
  landscapeRequirementActive07035 = false;
  document.body.classList.remove('mememe-phone-portrait');
  document.body.dataset.mmmLandscapeEntry = mode;
  landscapeGuard07031?.classList.remove('is-visible');
  const resolve = landscapeRequirementResolve07035;
  landscapeRequirementResolve07035 = undefined;
  resolve?.();
}

function finishLandscapeRequirement07035(): void {
  if (portrait07031()) return;
  releaseLandscapeRequirement07036('landscape');
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

  if (requestFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
    // Never let a browser-specific Fullscreen promise freeze the boot gate.
    await settleBoolean07036(
      document.documentElement.requestFullscreen(),
      ORIENTATION_API_TIMEOUT_MS_07036,
    );
  }

  const orientation = screen.orientation as LockableOrientation | undefined;
  if (!orientation?.lock) return false;

  // Chrome/PWA may support this. Safari and many in-app browsers do not.
  // Bound the promise so unsupported/buggy implementations can never deadlock boot.
  return settleBoolean07036(
    orientation.lock('landscape'),
    ORIENTATION_API_TIMEOUT_MS_07036,
  );
}

async function activateLandscapeRequirement07035(): Promise<void> {
  if (!phoneLike07031() || !portrait07031()) return;

  landscapeRequirementActive07035 = true;
  document.body.dataset.mmmLandscapeEntry = 'pending';
  refreshLandscapeGuard07031();

  await new Promise<void>((resolve) => {
    landscapeRequirementResolve07035 = resolve;
    refreshLandscapeGuard07031();
  });
}

/**
 * Mobile boot gate.
 *
 * We prefer a true landscape viewport before Phaser starts. Some mobile browsers
 * cannot lock hardware orientation from a normal web tab, though, so the explicit
 * user tap is also allowed to release boot after the best-effort lock attempt.
 * That keeps the app usable: the user can rotate the phone manually afterwards
 * and Phaser.Scale.FIT will refresh on the normal resize/orientation listeners.
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
  delete document.body.dataset.mmmLandscapeEntry;
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
      <span class="mememe-landscape-note">Chạm để vào game • nếu máy không tự xoay, xoay ngang bằng tay</span>
    </button>
  `;
  document.body.appendChild(guard);
  landscapeGuard07031 = guard;

  const refresh = () => refreshLandscapeGuard07031();
  const rotateButton = guard.querySelector<HTMLButtonElement>('.mememe-landscape-card-simple');
  const rotateLabel = rotateButton?.querySelector<HTMLElement>('strong');

  rotateButton?.addEventListener('click', async () => {
    if (rotateButtonBusy07035) return;
    rotateButtonBusy07035 = true;
    rotateButton.disabled = true;
    if (rotateLabel) rotateLabel.textContent = 'ĐANG XOAY…';

    try {
      await tryLockMobileLandscape07031(true);
      refresh();

      // Give browsers that accepted orientation.lock a short time to deliver
      // resize/orientationchange. If they never do, explicit tap still enters.
      for (const delay of ORIENTATION_SETTLE_MS_07036) {
        if (!landscapeRequirementActive07035 || !portrait07031()) break;
        await wait07036(delay);
        refresh();
      }

      if (landscapeRequirementActive07035 && portrait07031()) {
        releaseLandscapeRequirement07036('manual-fallback');
      } else {
        refresh();
      }
    } finally {
      rotateButtonBusy07035 = false;
      rotateButton.disabled = false;
      if (rotateLabel) rotateLabel.textContent = 'XOAY NGANG';
      refresh();
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
