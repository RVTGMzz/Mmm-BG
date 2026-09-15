import { bgmController } from '../audio/bgmController';
import { sfxController } from '../audio/sfxController';

let installed = false;

type LegacyFullscreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

type LegacyFullscreenElement = HTMLElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

function isFullscreenActive(): boolean {
  const legacy = document as LegacyFullscreenDocument;
  return Boolean(document.fullscreenElement ?? legacy.webkitFullscreenElement);
}

async function toggleFullscreen(): Promise<void> {
  const legacyDocument = document as LegacyFullscreenDocument;
  const target = document.documentElement as LegacyFullscreenElement;

  try {
    if (isFullscreenActive()) {
      if (document.exitFullscreen) await document.exitFullscreen();
      else if (legacyDocument.webkitExitFullscreen) await Promise.resolve(legacyDocument.webkitExitFullscreen());
      return;
    }

    if (target.requestFullscreen) await target.requestFullscreen();
    else if (target.webkitRequestFullscreen) await Promise.resolve(target.webkitRequestFullscreen());

    const orientation = screen.orientation as unknown as {
      lock?: (orientation: string) => Promise<void>;
    };
    if (orientation.lock) void orientation.lock('landscape').catch(() => undefined);
  } catch {
    // Fullscreen/orientation may be denied by the browser. The normal responsive
    // viewport remains fully usable, so this convenience action fails silently.
  }
}

/**
 * Global presentation settings shell.
 *
 * Keep audio/display convenience controls out of gameplay-critical MatchState.
 * This panel is intentionally DOM-only so future client-side preferences can be
 * added without growing the permanent Phaser HUD.
 */
export function installSettingsPanel(): void {
  if (installed || typeof document === 'undefined') return;
  installed = true;

  const root = document.createElement('div');
  root.id = 'mememe-settings';
  root.className = 'mememe-settings';
  root.innerHTML = `
    <button class="settings-trigger" type="button" aria-label="Mở cài đặt" aria-expanded="false">⚙️</button>
    <section class="settings-panel" aria-label="Cài đặt" hidden>
      <header class="settings-head">
        <div>
          <strong>CÀI ĐẶT</strong>
          <span>Âm thanh & tùy chọn game</span>
        </div>
        <button class="settings-close" type="button" aria-label="Đóng cài đặt">×</button>
      </header>

      <div class="settings-section">
        <div class="settings-section-title">ÂM THANH</div>

        <div class="settings-row settings-row-bgm">
          <div class="settings-copy">
            <strong>Nhạc nền</strong>
            <span class="settings-bgm-status">BGM</span>
          </div>
          <button class="settings-toggle settings-bgm-toggle" type="button" aria-label="Bật/tắt nhạc nền">BẬT 🔊</button>
        </div>

        <label class="settings-volume-row">
          <span>Âm lượng nhạc</span>
          <strong class="settings-volume-value">55%</strong>
          <input class="settings-bgm-volume" type="range" min="0" max="100" step="1" aria-label="Âm lượng nhạc nền" />
        </label>

        <div class="settings-row">
          <div class="settings-copy">
            <strong>Hiệu ứng âm thanh</strong>
            <span>Dice, coin, card, reaction...</span>
          </div>
          <button class="settings-toggle settings-sfx-toggle" type="button" aria-label="Bật/tắt hiệu ứng âm thanh">BẬT 🔔</button>
        </div>
      </div>

      <div class="settings-section settings-future">
        <div class="settings-section-title">GAME</div>
        <div class="settings-row">
          <div class="settings-copy">
            <strong>Toàn màn hình</strong>
            <span>Mobile/Steam Deck: tận dụng tối đa vùng hiển thị.</span>
          </div>
          <button class="settings-toggle settings-fullscreen-toggle" type="button" aria-label="Bật/tắt toàn màn hình">⛶ TOÀN MÀN HÌNH</button>
        </div>
      </div>
    </section>
  `;
  document.body.appendChild(root);

  const trigger = root.querySelector<HTMLButtonElement>('.settings-trigger');
  const panel = root.querySelector<HTMLElement>('.settings-panel');
  const close = root.querySelector<HTMLButtonElement>('.settings-close');
  const bgmToggle = root.querySelector<HTMLButtonElement>('.settings-bgm-toggle');
  const bgmVolume = root.querySelector<HTMLInputElement>('.settings-bgm-volume');
  const volumeValue = root.querySelector<HTMLElement>('.settings-volume-value');
  const bgmStatus = root.querySelector<HTMLElement>('.settings-bgm-status');
  const sfxToggle = root.querySelector<HTMLButtonElement>('.settings-sfx-toggle');
  const fullscreenToggle = root.querySelector<HTMLButtonElement>('.settings-fullscreen-toggle');

  const setOpen = (open: boolean) => {
    if (!panel || !trigger) return;
    panel.hidden = !open;
    root.classList.toggle('is-open', open);
    trigger.setAttribute('aria-expanded', open ? 'true' : 'false');
    trigger.textContent = open ? '×' : '⚙️';
    trigger.setAttribute('aria-label', open ? 'Đóng cài đặt' : 'Mở cài đặt');
  };

  const refreshFullscreenButton = () => {
    if (!fullscreenToggle) return;
    const target = document.documentElement as LegacyFullscreenElement;
    const supported = Boolean(document.fullscreenEnabled || target.requestFullscreen || target.webkitRequestFullscreen);
    fullscreenToggle.disabled = !supported;
    fullscreenToggle.classList.toggle('is-off', !supported);
    fullscreenToggle.textContent = !supported
      ? 'KHÔNG HỖ TRỢ'
      : isFullscreenActive()
        ? '↙ THOÁT FULL'
        : '⛶ TOÀN MÀN HÌNH';
  };

  trigger?.addEventListener('click', () => {
    sfxController.play('ui_confirm');
    setOpen(panel?.hidden ?? true);
  });
  close?.addEventListener('click', () => {
    sfxController.play('ui_confirm');
    setOpen(false);
  });
  root.addEventListener('pointerdown', (event) => event.stopPropagation());
  root.addEventListener('click', (event) => event.stopPropagation());

  document.addEventListener('pointerdown', (event) => {
    if (!root.classList.contains('is-open')) return;
    if (event.target instanceof Node && root.contains(event.target)) return;
    setOpen(false);
  });
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') setOpen(false);
  });

  bgmToggle?.addEventListener('click', () => {
    sfxController.play('ui_confirm');
    bgmController.toggleMuted();
  });
  bgmVolume?.addEventListener('input', () => {
    bgmController.setVolume(Number(bgmVolume.value) / 100);
  });
  sfxToggle?.addEventListener('click', () => sfxController.toggleMuted());
  fullscreenToggle?.addEventListener('click', () => {
    sfxController.play('ui_confirm');
    void toggleFullscreen().finally(refreshFullscreenButton);
  });
  document.addEventListener('fullscreenchange', refreshFullscreenButton);
  document.addEventListener('webkitfullscreenchange', refreshFullscreenButton as EventListener);
  refreshFullscreenButton();

  bgmController.subscribe((state) => {
    const enabled = !state.muted && state.volume > 0;
    if (bgmToggle) {
      bgmToggle.textContent = enabled ? 'BẬT 🔊' : 'TẮT 🔇';
      bgmToggle.classList.toggle('is-off', !enabled);
      bgmToggle.setAttribute('aria-pressed', enabled ? 'true' : 'false');
    }
    if (bgmVolume) bgmVolume.value = String(Math.round(state.volume * 100));
    if (volumeValue) volumeValue.textContent = `${Math.round(state.volume * 100)}%`;
    if (bgmStatus) {
      bgmStatus.textContent = state.assetError
        ? `⚠ Thiếu file: ${state.assetError}`
        : state.currentTrackId
          ? 'Đang phát nhạc theo màn chơi'
          : 'Đang chuẩn bị nhạc...';
    }
    root.classList.toggle('has-audio-error', Boolean(state.assetError));
  });

  sfxController.subscribe((state) => {
    if (!sfxToggle) return;
    sfxToggle.textContent = state.muted ? 'TẮT 🔕' : 'BẬT 🔔';
    sfxToggle.classList.toggle('is-off', state.muted);
    sfxToggle.setAttribute('aria-pressed', state.muted ? 'false' : 'true');
  });
}
