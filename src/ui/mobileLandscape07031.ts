const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;

let landscapeGuard07031: HTMLDivElement | undefined;
let landscapeRequirementActive07034 = false;
const landscapeWaiters07034 = new Set<() => void>();

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

function resolveLandscapeWaiters07034(): void {
  if (portrait07031()) return;
  for (const resolve of [...landscapeWaiters07034]) resolve();
  landscapeWaiters07034.clear();
}

function refreshLandscapeGuard07031(): void {
  if (!landscapeGuard07031) return;
  const blocked = landscapeRequirementActive07034 && portrait07031();
  landscapeGuard07031.classList.toggle('is-visible', blocked);
  document.body.classList.toggle('mememe-phone-portrait', blocked);
  if (!blocked) resolveLandscapeWaiters07034();
}

export async function tryLockMobileLandscape07031(requestFullscreen = false): Promise<boolean> {
  if (!phoneLike07031()) return false;

  try {
    if (requestFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Best-effort only. Manual rotation remains the reliable fallback.
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

async function waitUntilLandscape07034(requestFullscreen: boolean): Promise<void> {
  if (!phoneLike07031()) return;

  landscapeRequirementActive07034 = true;
  refreshLandscapeGuard07031();

  await tryLockMobileLandscape07031(requestFullscreen);
  refreshLandscapeGuard07031();

  if (!portrait07031()) {
    landscapeRequirementActive07034 = false;
    refreshLandscapeGuard07031();
    return;
  }

  await new Promise<void>((resolve) => {
    const done = () => {
      landscapeWaiters07034.delete(done);
      resolve();
    };
    landscapeWaiters07034.add(done);
    refreshLandscapeGuard07031();
  });

  landscapeRequirementActive07034 = false;
  refreshLandscapeGuard07031();
}

/**
 * Splash stays visible first. Only after the player's CHẠM ĐỂ BẮT ĐẦU gesture
 * do we require landscape before entering the game.
 */
export async function requireMobileLandscapeAfterIntro07034(): Promise<void> {
  await waitUntilLandscape07034(true);
}

/**
 * Native Android/iOS pickers may return the browser to portrait. In that case
 * show only the small XOAY NGANG guard until the player rotates back.
 */
export async function waitForMobileLandscapeAfterPicker07032(): Promise<void> {
  await waitUntilLandscape07034(false);
}

export function prepareForNativePicker07033(): void {
  // Do not show the guard while the OS picker owns the screen.
  landscapeRequirementActive07034 = false;
  refreshLandscapeGuard07031();
}

export function recoverMobileLandscapeAfterPicker07031(): void {
  void waitForMobileLandscapeAfterPicker07032();
}

export function requireInitialMobileLandscape07032(): void {
  // Retained for compatibility. Initial load must NOT hide Splash anymore.
}

export function installMobileLandscapeGuard07031(): () => void {
  if (!phoneLike07031()) return () => {};

  const guard = document.createElement('div');
  guard.className = 'mememe-landscape-guard mememe-landscape-guard-simple';
  guard.setAttribute('role', 'dialog');
  guard.setAttribute('aria-live', 'polite');
  guard.setAttribute('aria-label', 'Xoay ngang điện thoại');
  guard.innerHTML = `
    <div class="mememe-landscape-card mememe-landscape-card-simple">
      <div class="mememe-landscape-phone" aria-hidden="true">📱↻</div>
      <strong>XOAY NGANG</strong>
    </div>
  `;
  document.body.appendChild(guard);
  landscapeGuard07031 = guard;

  const refresh = () => refreshLandscapeGuard07031();
  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  document.addEventListener('fullscreenchange', refresh);

  // Important: Splash is never blocked on first load.
  refresh();

  return () => {
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
    window.visualViewport?.removeEventListener('resize', refresh);
    document.removeEventListener('fullscreenchange', refresh);
    document.body.classList.remove('mememe-phone-portrait');
    landscapeWaiters07034.clear();
    guard.remove();
    if (landscapeGuard07031 === guard) landscapeGuard07031 = undefined;
  };
}
