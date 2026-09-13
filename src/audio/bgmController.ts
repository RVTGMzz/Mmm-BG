import { bgmUrl, getBgmTrack, type BgmTrackDefinition } from './bgmCatalog';
import { sfxController } from './sfxController';

export type BgmTrackId = BgmTrackDefinition['id'];

export interface BgmUiState {
  muted: boolean;
  volume: number;
  currentTrackId?: BgmTrackId;
  assetError?: string;
}

type BgmListener = (state: BgmUiState) => void;

const STORAGE_KEY = 'mememe.bgm.preferences.v1';
const DEFAULT_VOLUME = 0.55;
const FADE_OUT_MS = 220;
const FADE_IN_MS = 360;

function clampVolume(value: number): number {
  if (!Number.isFinite(value)) return DEFAULT_VOLUME;
  return Math.max(0, Math.min(1, value));
}

function loadPreferences(): Pick<BgmUiState, 'muted' | 'volume'> {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return { muted: false, volume: DEFAULT_VOLUME };
    const parsed = JSON.parse(raw) as Partial<BgmUiState>;
    return {
      muted: Boolean(parsed.muted),
      volume: clampVolume(Number(parsed.volume ?? DEFAULT_VOLUME)),
    };
  } catch {
    return { muted: false, volume: DEFAULT_VOLUME };
  }
}

export class BgmController {
  private audio?: HTMLAudioElement;
  private currentTrackId?: BgmTrackId;
  private desiredTrackId?: BgmTrackId;
  private muted: boolean;
  private volume: number;
  private assetError?: string;
  private unlockInstalled = false;
  private transitionSerial = 0;
  private readonly listeners = new Set<BgmListener>();

  constructor() {
    const preferences = loadPreferences();
    this.muted = preferences.muted;
    this.volume = preferences.volume;
  }

  start(): void {
    this.installAutoplayUnlock();
  }

  playMenu(): void {
    this.setTrack('menu_mememe');
  }

  playRound(round: number): void {
    if (round >= 3) {
      this.setTrack('final_round');
      return;
    }

    // Presentation-only deterministic mapping. Audio never consumes gameplay RNG.
    this.setTrack(round === 2 ? 'city_silly' : 'city_bubble');
  }

  setMuted(muted: boolean): void {
    this.muted = muted;
    this.applyPreferences();
    this.persistPreferences();
    this.emit();
    if (!muted) void this.tryPlay();
  }

  toggleMuted(): void {
    this.setMuted(!this.muted);
  }

  setVolume(volume: number): void {
    this.volume = clampVolume(volume);
    this.applyPreferences();
    this.persistPreferences();
    this.emit();
    if (this.volume > 0) void this.tryPlay();
  }

  getState(): BgmUiState {
    return {
      muted: this.muted,
      volume: this.volume,
      currentTrackId: this.currentTrackId,
      assetError: this.assetError,
    };
  }

  subscribe(listener: BgmListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) listener(state);
  }

  private setTrack(id: BgmTrackId): void {
    this.desiredTrackId = id;
    if (this.currentTrackId === id && this.audio) {
      this.assetError = undefined;
      this.applyPreferences();
      this.emit();
      void this.tryPlay();
      return;
    }

    const serial = ++this.transitionSerial;
    void this.transitionToTrack(id, serial);
  }

  private async transitionToTrack(id: BgmTrackId, serial: number): Promise<void> {
    const previous = this.audio;
    if (previous) {
      await this.fadeAudio(previous, previous.volume, 0, FADE_OUT_MS, serial);
      if (serial !== this.transitionSerial) return;
      previous.pause();
      previous.src = '';
    }

    const track = getBgmTrack(id);
    const audio = new Audio(bgmUrl(track));
    audio.loop = true;
    audio.preload = 'auto';
    audio.autoplay = false;
    audio.muted = this.muted;
    audio.volume = 0;
    audio.addEventListener(
      'error',
      () => {
        if (this.audio !== audio) return;
        this.assetError = track.file;
        console.warn(`[BGM] Missing/unreadable audio asset: ${track.file}`);
        this.emit();
      },
      { once: true },
    );

    if (serial !== this.transitionSerial) return;
    this.audio = audio;
    this.currentTrackId = id;
    this.assetError = undefined;
    this.emit();
    await this.tryPlay(audio);
    if (serial !== this.transitionSerial) return;
    await this.fadeAudio(audio, 0, this.muted ? 0 : this.volume, FADE_IN_MS, serial);
    if (serial === this.transitionSerial) this.applyPreferences();
  }

  private fadeAudio(
    audio: HTMLAudioElement,
    from: number,
    to: number,
    durationMs: number,
    serial: number,
  ): Promise<void> {
    return new Promise((resolve) => {
      const start = performance.now();
      const tick = (now: number) => {
        if (serial !== this.transitionSerial || audio !== this.audio && to > from) {
          resolve();
          return;
        }
        const progress = Math.min(1, (now - start) / Math.max(1, durationMs));
        audio.volume = clampVolume(from + (to - from) * progress);
        if (progress >= 1) {
          resolve();
          return;
        }
        requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
  }

  private applyPreferences(): void {
    if (!this.audio) return;
    this.audio.muted = this.muted;
    this.audio.volume = this.muted ? 0 : this.volume;
  }

  private async tryPlay(audio = this.audio): Promise<void> {
    if (!audio || this.muted || this.volume <= 0) return;
    try {
      await audio.play();
    } catch {
      // Browser autoplay policy may block playback until the first gesture.
    }
  }

  private persistPreferences(): void {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ muted: this.muted, volume: this.volume }),
      );
    } catch {
      // Private browsing / storage denial should never block playtest flow.
    }
  }

  private installAutoplayUnlock(): void {
    if (this.unlockInstalled || typeof document === 'undefined') return;
    this.unlockInstalled = true;

    const unlock = () => {
      cleanup();
      void this.tryPlay();
    };
    const cleanup = () => {
      document.removeEventListener('pointerdown', unlock, true);
      document.removeEventListener('touchstart', unlock, true);
      document.removeEventListener('keydown', unlock, true);
    };

    document.addEventListener('pointerdown', unlock, true);
    document.addEventListener('touchstart', unlock, true);
    document.addEventListener('keydown', unlock, true);
  }
}

export const bgmController = new BgmController();

export function installBgmControls(): void {
  if (typeof document === 'undefined' || document.getElementById('mememe-bgm-hud')) return;

  const root = document.createElement('div');
  root.id = 'mememe-bgm-hud';
  root.className = 'mememe-bgm-hud';
  root.innerHTML = `
    <span class="bgm-label">BGM</span>
    <button class="bgm-mute" type="button" aria-label="Bật/tắt nhạc nền">🔊</button>
    <input class="bgm-volume" type="range" min="0" max="100" step="1" aria-label="Âm lượng nhạc nền" />
    <button class="sfx-mute" type="button" aria-label="Bật/tắt hiệu ứng âm thanh">FX 🔔</button>
  `;
  document.body.appendChild(root);

  const label = root.querySelector<HTMLSpanElement>('.bgm-label');
  const mute = root.querySelector<HTMLButtonElement>('.bgm-mute');
  const volume = root.querySelector<HTMLInputElement>('.bgm-volume');
  const sfxMute = root.querySelector<HTMLButtonElement>('.sfx-mute');

  mute?.addEventListener('click', () => bgmController.toggleMuted());
  volume?.addEventListener('input', () => {
    bgmController.setVolume(Number(volume.value) / 100);
  });
  sfxMute?.addEventListener('click', () => sfxController.toggleMuted());

  bgmController.subscribe((state) => {
    if (mute) {
      mute.textContent = state.muted || state.volume <= 0 ? '🔇' : '🔊';
      mute.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
    }
    if (volume) volume.value = String(Math.round(state.volume * 100));
    if (label) {
      label.textContent = state.assetError ? 'BGM ⚠' : 'BGM';
      label.title = state.assetError
        ? `Thiếu audio: ${state.assetError}`
        : `Track: ${state.currentTrackId ?? 'chưa chọn'}`;
    }
    root.classList.toggle('has-audio-error', Boolean(state.assetError));
  });

  sfxController.subscribe((state) => {
    if (!sfxMute) return;
    sfxMute.textContent = state.muted ? 'FX 🔕' : 'FX 🔔';
    sfxMute.setAttribute('aria-pressed', state.muted ? 'true' : 'false');
  });
}
