const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;

let landscapeGuard07031: HTMLDivElement | undefined;
let enforceLandscape07031 = false;

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
  const blocked = enforceLandscape07031 && portrait07031();
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
    // Fullscreen is best-effort. The portrait guard remains the fallback.
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
 * Called from the Splash "CHẠM ĐỂ BẮT ĐẦU" gesture.
 * The intro remains visible first; only after that tap do we enforce landscape.
 */
export function activateMobileLandscapeFromIntro07031(): void {
  if (!phoneLike07031()) return;
  enforceLandscape07031 = true;
  refreshLandscapeGuard07031();
  void tryLockMobileLandscape07031(true).finally(refreshLandscapeGuard07031);
}

/**
 * Native image/camera pickers may temporarily break fullscreen/orientation lock.
 * Re-assert landscape when the browser becomes active again.
 */
export function recoverMobileLandscapeAfterPicker07031(): void {
  if (!phoneLike07031()) return;
  enforceLandscape07031 = true;
  void tryLockMobileLandscape07031(false).finally(refreshLandscapeGuard07031);
  refreshLandscapeGuard07031();
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
      <span>MeMeMe được thiết kế để chơi theo chiều ngang.</span>
      <button type="button">THỬ XOAY NGANG</button>
      <small>Nếu máy không tự xoay, hãy tắt khóa xoay màn hình rồi xoay điện thoại. Intro vẫn luôn được hiển thị trước màn này.</small>
    </div>
  `;
  document.body.appendChild(guard);
  landscapeGuard07031 = guard;

  const refresh = () => refreshLandscapeGuard07031();
  const recover = () => {
    if (document.visibilityState !== 'visible' || !enforceLandscape07031) return;
    void tryLockMobileLandscape07031(false).finally(refresh);
    refresh();
  };

  guard.querySelector<HTMLButtonElement>('button')?.addEventListener('click', async () => {
    enforceLandscape07031 = true;
    await tryLockMobileLandscape07031(true);
    refresh();
  });

  window.addEventListener('resize', refresh, { passive: true });
  window.addEventListener('orientationchange', refresh, { passive: true });
  window.addEventListener('focus', recover, { passive: true });
  window.visualViewport?.addEventListener('resize', refresh, { passive: true });
  document.addEventListener('fullscreenchange', refresh);
  document.addEventListener('visibilitychange', recover);

  // IMPORTANT: do not enforce here. Splash intro must remain visible on initial load.
  refresh();

  return () => {
    window.removeEventListener('resize', refresh);
    window.removeEventListener('orientationchange', refresh);
    window.removeEventListener('focus', recover);
    window.visualViewport?.removeEventListener('resize', refresh);
    document.removeEventListener('fullscreenchange', refresh);
    document.removeEventListener('visibilitychange', recover);
    document.body.classList.remove('mememe-phone-portrait');
    guard.remove();
    if (landscapeGuard07031 === guard) landscapeGuard07031 = undefined;
  };
}
