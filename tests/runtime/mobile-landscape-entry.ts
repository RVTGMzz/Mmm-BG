import '../../src/mobileViewport066.css';
import {
  installMobileLandscapeGuard07031,
  requireMobileLandscapeBeforeGame07035,
} from '../../src/ui/mobileLandscape07031';

// Reproduce the real failure class: portrait phone + browser that exposes no
// usable Fullscreen/Screen Orientation lock from a normal web tab.
try {
  Object.defineProperty(document.documentElement, 'requestFullscreen', {
    configurable: true,
    value: undefined,
  });
} catch {
  // Browser may expose a non-configurable native implementation.
}
try {
  Object.defineProperty(screen.orientation, 'lock', {
    configurable: true,
    value: undefined,
  });
} catch {
  // The runtime test still verifies that a rejected/unsupported call cannot block.
}

const state = {
  resolved: false,
  error: '',
};

installMobileLandscapeGuard07031();
requireMobileLandscapeBeforeGame07035()
  .then(() => {
    state.resolved = true;
  })
  .catch((error) => {
    state.error = String(error);
  });

(window as any).mobileLandscapeEntryFixture = {
  state,
  snapshot() {
    const guard = document.querySelector<HTMLElement>('.mememe-landscape-guard');
    return {
      resolved: state.resolved,
      error: state.error,
      portrait: window.innerHeight > window.innerWidth,
      visible: Boolean(guard?.classList.contains('is-visible')),
      entryMode: document.body.dataset.mmmLandscapeEntry ?? '',
      buttonDisabled: Boolean(document.querySelector<HTMLButtonElement>('.mememe-landscape-card-simple')?.disabled),
    };
  },
};
