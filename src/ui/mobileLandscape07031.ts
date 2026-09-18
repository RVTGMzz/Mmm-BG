const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;

let landscapeGuard07031: HTMLDivElement | undefined;
let initialLandscapePending07033 = false;

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

function refreshLandscapeGuard07031(): void {
  if (!landscapeGuard07031) return;

  if (initialLandscapePending07033 && !portrait07031()) {
    initialLandscapePending07033 = false;
  }

  const blocked = initialLandscapePending07033 && portrait07031();
  landscapeGuard07031.classList.toggle('is-visible', blocked);
  document.body.classList.toggle('mememe-phone-portrait', blocked);
}

export async function tryLockMobileLandscape07031(requestFullscreen = false): Promise<boolean> {
  if (!phoneLike07031()) return false;

  try {
    if (requestFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen is best-effort.
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

/**
 * Only the first launch is allowed to block on portrait.
 * Once the player reaches landscape, this guard is retired for the session.
 */
export function requireInitialMobileLandscape07032(): void {
  if (!phoneLike07031()) return;
  initialLandscapePending07033 = true;
  refreshLandscapeGuard07031();
}

/**
 * Native Android/iOS pickers can reopen in portrait. After they close we do
 * silent best-effort landscape recovery only. No rotate dialog is shown again.
 */
export async function recoverMobileLandscapeSilently07033(): Promise<boolean> {
  if (!phoneLike07031()) return false;

  const delays = [0, 120, 320];
  let locked = false;
  for (const delay of delays) {
    if (delay > 0) await new Promise<void>((resolve) => window.setTimeout(resolve, delay));
    if (!portrait07031()) return true;
    locked = await tryLockMobileLandscape07031(false) || locked;
  }
  return locked || !portrait07031();
}

/**
 * Backward-compatible name used by SetupScene. It no longer blocks the editor
 * or displays the landscape guard after an image picker.
 */
export async function waitForMobileLandscapeAfterPicker07032(): Promise<void> {
  await recoverMobileLandscapeSilently07033();
}

export function prepareForNativePicker07033(): void {
  if (!phoneLike07031()) return;
  // Initial guard is already retired after the first landscape entry. Make
  // absolutely sure native picker transitions can never resurrect it.
  initialLandscapePending07033 = false;
  refreshLandscapeGuard07031();
  void tryLockMobileLandscape07031(false);
}

export function recoverMobileLandscapeAfterPicker07031(): void {
  void recoverMobileLandscapeSilently07033();
}

export function installMobileLandscapeGuard07031(): () => void {
  if (!phoneLike07031()) return () => {};

  const guard = document.createElement('div');
  guard.className = 'mememe-landscape-guard';
  guard.setAttribute('role', 'dialog');
  guard.setAttribute('aria-live', 'polite');
  guard.setAttribute('aria-label', 'Xoay ngang điện thoại để chơi MeMeMe');
  guard.innerHTML = `
    <div class="mememe-landscape-card">
      <div class="mememe-landscape-phone" aria-hidden="true">📱↻</div>
      <strong>XOAY NGANG ĐIỆN THOẠI</strong>
      <span>Xoay ngang trước, sau đó intro MeMeMe sẽ hiện.</span>
      <button type="button">THỬ XOAY NGANG</button>
      <small>Màn này chỉ xuất hiện lúc mới mở game. Sau khi vào game, MeMeMe sẽ tự thử giữ chiều ngang mà không chặn bạn nữa.</small>
    </div>
  `;
  document.body.appendChild(guard);
  landscapeGuard07031 = guard;

  const refresh = () => refreshLandscapeGuard07031();
  const silentRecover = () => {
    if (document.visibilityState !== 'visible' || initialLandscapePending07033) return;
    void recoverMobileLandscapeSilently07033();
  };

  guard.querySelector<HTMLButtonElement>('button')?.addEventListener('click', async () => {
    await tryLockMobileLandscape07031(true);
    refresh();
  });

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });
  window.addEventListener('focus', silentRecover, { passive: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('visibilitychange', silentRecover);

  requireInitialMobileLandscape07032();

  return () => {
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
    window.removeEventListener('focus', silentRecover);
    window.visualViewport?.removeEventListener('resize', refresh);
    document.removeEventListener('fullscreenchange', refresh);
    document.removeEventListener('visibilitychange', silentRecover);
    document.body.classList.remove('mememe-phone-portrait');
    guard.remove();
    if (landscapeGuard07031 === guard) landscapeGuard07031 = undefined;
  };
}
