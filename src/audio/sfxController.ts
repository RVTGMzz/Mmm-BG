export type SfxCue =
  | 'coin_gain'
  | 'coin_loss'
  | 'card_draw'
  | 'card_play'
  | 'news'
  | 'reaction'
  | 'ready'
  | 'land'
  | 'ui_confirm';

interface SfxState {
  muted: boolean;
}

type SfxListener = (state: SfxState) => void;

const STORAGE_KEY = 'mememe.sfx.preferences.v1';

function loadMuted(): boolean {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    return Boolean((JSON.parse(raw) as Partial<SfxState>).muted);
  } catch {
    return false;
  }
}

export class SfxController {
  private context?: AudioContext;
  private muted = loadMuted();
  private readonly listeners = new Set<SfxListener>();

  getState(): SfxState {
    return { muted: this.muted };
  }

  subscribe(listener: SfxListener): () => void {
    this.listeners.add(listener);
    listener(this.getState());
    return () => this.listeners.delete(listener);
  }

  toggleMuted(): void {
    this.muted = !this.muted;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ muted: this.muted }));
    } catch {
      // Storage denial never blocks gameplay.
    }
    this.emit();
  }

  play(cue: SfxCue): void {
    if (this.muted || typeof window === 'undefined') return;
    const context = this.ensureContext();
    if (!context) return;
    void context.resume().catch(() => undefined);

    const now = context.currentTime;
    switch (cue) {
      case 'coin_gain':
        this.tone(660, 940, now, 0.12, 0.11, 'sine');
        this.tone(940, 1180, now + 0.07, 0.1, 0.08, 'sine');
        break;
      case 'coin_loss':
        this.tone(360, 180, now, 0.18, 0.12, 'triangle');
        break;
      case 'card_draw':
        this.tone(420, 920, now, 0.2, 0.09, 'triangle');
        break;
      case 'card_play':
        this.tone(520, 1200, now, 0.16, 0.12, 'sawtooth');
        break;
      case 'news':
        this.tone(520, 520, now, 0.08, 0.1, 'square');
        this.tone(680, 680, now + 0.11, 0.1, 0.08, 'square');
        break;
      case 'reaction':
        this.tone(900, 720, now, 0.07, 0.05, 'sine');
        break;
      case 'ready':
        this.tone(520, 780, now, 0.12, 0.09, 'sine');
        this.tone(660, 980, now + 0.08, 0.14, 0.07, 'sine');
        break;
      case 'land':
        this.tone(180, 140, now, 0.06, 0.04, 'triangle');
        break;
      case 'ui_confirm':
        this.tone(760, 860, now, 0.05, 0.04, 'sine');
        break;
    }
  }

  private ensureContext(): AudioContext | undefined {
    if (this.context) return this.context;
    const AudioContextCtor = window.AudioContext
      ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextCtor) return undefined;
    this.context = new AudioContextCtor();
    return this.context;
  }

  private tone(
    startHz: number,
    endHz: number,
    startTime: number,
    duration: number,
    gainValue: number,
    type: OscillatorType,
  ): void {
    const context = this.context;
    if (!context) return;

    const oscillator = context.createOscillator();
    const gain = context.createGain();
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(startHz, startTime);
    oscillator.frequency.exponentialRampToValueAtTime(Math.max(20, endHz), startTime + duration);
    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(gainValue, startTime + Math.min(0.025, duration / 3));
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
    oscillator.connect(gain);
    gain.connect(context.destination);
    oscillator.start(startTime);
    oscillator.stop(startTime + duration + 0.02);
  }

  private emit(): void {
    const state = this.getState();
    for (const listener of this.listeners) listener(state);
  }
}

export const sfxController = new SfxController();
