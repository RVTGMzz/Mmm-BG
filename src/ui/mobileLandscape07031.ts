const PHONE_UA_RE = /Android|iPhone|iPod|Mobile/i;

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

export async function tryLockMobileLandscape07031(requestFullscreen = false): Promise<boolean> {
  if (!phoneLike07031()) return false;

  try {
    if (requestFullscreen && !document.fullscreenElement && document.documentElement.requestFullscreen) {
      await document.documentElement.requestFullscreen();
    }
  } catch {
    // Fullscreen is best-effort. The portrait guard remains authoritative fallback.
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
      <button type="button">MỞ CHẾ ĐỘ NGANG</button>
      <small>Nếu máy không tự xoay, hãy tắt khóa xoay màn hình rồi xoay điện thoại.</small>
    </div>
  `;
  document.body.appendChild(guard);

  const refresh = () => {
    const blocked = portrait07031();
    guard.classList.toggle('is-visible', blocked);
    document.body.classList.toggle('mememe-phone-portrait', blocked);
  };

  guard.querySelector<HTMLButtonElement>('button')?.addEventListener('click', async () => {
    await tryLockMobileLandscape07031(true);
    refresh();
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
    guard.remove();
  };
}
