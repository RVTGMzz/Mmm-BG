import { bgmUrl, getBgmTrack, type BgmTrackDefinition } from './bgmCatalog';

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

    // MVP 0.1.17 keeps the first two rounds presentation-only and predictable:
    // Round 1 = Bubble, Round 2 = Silly. This guarantees no immediate repeat
    // without touching MatchState, seeded RNG, replay, or host authority state.
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

    this.audio?.pause();
    if (this.audio) this.audio.src = '';

    const track = getBgmTrack(id);
    const audio = new Audio(bgmUrl(track));
    audio.loop = true;
    audio.preload = 'auto';
    audio.autoplay = false;
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

    this.audio = audio;
    this.currentTrackId = id;
    this.assetError = undefined;
    this.applyPreferences();
    this.emit();
    void this.tryPlay();
  }

  private applyPreferences(): void {
    if (!this.audio) return;
    this.audio.muted = this.muted;
    this.audio.volume = this.volume;
  }

  private async tryPlay(): Promise<void> {
    const audio = this.audio;
    if (!audio || this.muted || this.volume <= 0) return;
    try {
      await audio.play();
    } catch {
      // Browser autoplay policy may block playback until the first gesture.
      // installAutoplayUnlock() retries from an actual user interaction.
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
  `;
  document.body.appendChild(root);

  const label = root.querySelector<HTMLSpanElement>('.bgm-label');
  const mute = root.querySelector<HTMLButtonElement>('.bgm-mute');
  const volume = root.querySelector<HTMLInputElement>('.bgm-volume');

  mute?.addEventListener('click', () => bgmController.toggleMuted());
  volume?.addEventListener('input', () => {
    bgmController.setVolume(Number(volume.value) / 100);
  });

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
}
