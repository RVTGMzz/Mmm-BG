import { sfxController } from './sfxController';

/**
 * CH-19 character reaction voices: short synthesised "gibberish" babble, the
 * party-game way of giving each Character a voice without spoken lines.
 * Every Character has its own pitch, pace, timbre and melody, and the
 * reaction's expression bends the contour (happy rises, angry/sad falls).
 *
 * Presentation only, deterministic per call (no Math.random), respects mute.
 */

export type VoiceExpressionCh19 = 'neutral' | 'happy' | 'angry';

type VoiceProfile = {
  pitch: number; // base Hz
  syllables: [number, number]; // min/max count
  syl: number; // syllable length (s)
  gap: number; // gap between syllables (s)
  jump: number; // melodic range (ratio)
  vibrato: number; // depth (ratio)
  wave: OscillatorType;
  formants: [number, number][]; // vowel formant pairs to cycle through
  tail?: 'sob' | 'hmph' | 'yay' | 'giggle' | 'gulp';
  gain: number;
};

const VOWELS = {
  a: [800, 1200] as [number, number],
  e: [500, 1900] as [number, number],
  i: [320, 2500] as [number, number],
  o: [500, 900] as [number, number],
  u: [340, 800] as [number, number],
};

const PROFILES: Record<string, VoiceProfile> = {
  // dramatic, teary auntie: warbling, sliding down, ends on a little sob
  'starter-crybaby': { pitch: 330, syllables: [3, 4], syl: 0.15, gap: 0.03, jump: 1.18, vibrato: 0.05, wave: 'triangle', formants: [VOWELS.o, VOWELS.a, VOWELS.u], tail: 'sob', gain: 0.5 },
  // gruff boss: low, clipped, falling "hmph"
  'starter-grumpy': { pitch: 118, syllables: [2, 3], syl: 0.1, gap: 0.04, jump: 1.08, vibrato: 0.0, wave: 'sawtooth', formants: [VOWELS.o, VOWELS.u, VOWELS.a], tail: 'hmph', gain: 0.75 },
  // nervous young guy: quick shaky chatter, rising like a question
  'starter-anxious': { pitch: 205, syllables: [5, 7], syl: 0.06, gap: 0.018, jump: 1.12, vibrato: 0.03, wave: 'sawtooth', formants: [VOWELS.e, VOWELS.i, VOWELS.a], tail: 'gulp', gain: 0.78 },
  // hyper teen: high, bouncy big jumps, ends with a "yay!"
  'starter-hyper': { pitch: 360, syllables: [4, 6], syl: 0.075, gap: 0.02, jump: 1.45, vibrato: 0.0, wave: 'square', formants: [VOWELS.a, VOWELS.i, VOWELS.e], tail: 'yay', gain: 0.36 },
  // the royal baby: cooing "goo-gaa" and a giggle
  'secret-baby': { pitch: 470, syllables: [2, 3], syl: 0.13, gap: 0.05, jump: 1.25, vibrato: 0.02, wave: 'triangle', formants: [VOWELS.u, VOWELS.a, VOWELS.o], tail: 'giggle', gain: 0.62 },
};

const hash = (n: number): number => {
  const s = Math.sin(n * 91.345 + 47.853) * 43758.5453;
  return s - Math.floor(s);
};

let context: AudioContext | undefined;
let lastAt = -1;

function audio(): AudioContext | undefined {
  if (typeof window === 'undefined' || sfxController.getState().muted) return undefined;
  if (typeof document !== 'undefined' && document.hidden) return undefined;
  const Ctor = window.AudioContext ?? (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return undefined;
  context ??= new Ctor();
  if (context.state !== 'running') void context.resume().catch(() => undefined);
  return context;
}

/** Returns false when there is no voice for this Character (caller falls back). */
export function playCharacterVoiceCh19(characterId: string | undefined, expression: VoiceExpressionCh19 = 'neutral', seed = 1): boolean {
  const profile = characterId ? PROFILES[characterId] : undefined;
  if (!profile) return false;
  const ctx = audio();
  if (!ctx) return true;
  // never stack two voices on top of each other
  if (ctx.currentTime - lastAt < 0.25) return true;
  lastAt = ctx.currentTime;

  // gains are levelled so every Character peaks near half scale (about the
  // level of the other cues); a gentle compressor keeps the babble even
  const out = ctx.createGain();
  out.gain.value = profile.gain;
  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -14;
  comp.ratio.value = 4;
  comp.attack.value = 0.003;
  comp.release.value = 0.12;
  out.connect(comp).connect(ctx.destination);
  const contour = expression === 'happy' ? 1.12 : expression === 'angry' ? 0.86 : 1;
  const count = profile.syllables[0] + Math.floor(hash(seed) * (profile.syllables[1] - profile.syllables[0] + 1));
  let at = ctx.currentTime + 0.02;

  const syllable = (start: number, f0: number, f1: number, len: number, vowel: [number, number], amp = 1) => {
    const osc = ctx.createOscillator();
    osc.type = profile.wave;
    osc.frequency.setValueAtTime(f0, start);
    osc.frequency.exponentialRampToValueAtTime(Math.max(40, f1), start + len);
    if (profile.vibrato > 0) {
      const lfo = ctx.createOscillator();
      const depth = ctx.createGain();
      lfo.frequency.value = 6.5;
      depth.gain.value = f0 * profile.vibrato;
      lfo.connect(depth).connect(osc.frequency);
      lfo.start(start);
      lfo.stop(start + len + 0.02);
    }
    // two formant filters in parallel give the vowel colour
    const env = ctx.createGain();
    env.gain.setValueAtTime(0.0001, start);
    env.gain.exponentialRampToValueAtTime(amp, start + Math.min(0.02, len * 0.25));
    env.gain.setValueAtTime(amp, start + len * 0.6);
    env.gain.exponentialRampToValueAtTime(0.0001, start + len);
    for (const [i, f] of vowel.entries()) {
      const bp = ctx.createBiquadFilter();
      bp.type = 'bandpass';
      bp.frequency.value = f;
      bp.Q.value = i === 0 ? 4 : 6;
      const g = ctx.createGain();
      g.gain.value = i === 0 ? 1.4 : 0.8;
      osc.connect(bp).connect(g).connect(env);
    }
    env.connect(out);
    osc.start(start);
    osc.stop(start + len + 0.03);
  };

  let pitch = profile.pitch * (0.96 + hash(seed * 3) * 0.08);
  for (let i = 0; i < count; i++) {
    const up = hash(seed * 7 + i) < 0.5 ? profile.jump : 1 / profile.jump;
    const drift = Math.pow(contour, (i + 1) / count);
    const next = profile.pitch * drift * (i % 2 ? up : 1);
    const len = profile.syl * (0.8 + hash(seed * 11 + i) * 0.45);
    syllable(at, pitch, next, len, profile.formants[i % profile.formants.length]);
    pitch = next;
    at += len + profile.gap;
  }

  switch (profile.tail) {
    case 'sob':
      syllable(at, pitch * 1.5, pitch * 1.2, 0.07, VOWELS.i, 0.8);
      syllable(at + 0.1, pitch * 1.45, pitch * 1.1, 0.06, VOWELS.i, 0.6);
      break;
    case 'hmph':
      syllable(at, pitch * 0.95, pitch * 0.7, 0.16, VOWELS.u, 0.9);
      break;
    case 'gulp':
      syllable(at, pitch * 1.3, pitch * 0.8, 0.09, VOWELS.u, 0.7);
      break;
    case 'yay':
      syllable(at, pitch * 1.1, pitch * 1.7, 0.18, VOWELS.a, 1);
      break;
    case 'giggle':
      for (let k = 0; k < 4; k++) syllable(at + k * 0.065, pitch * (1.35 - k * 0.05), pitch * 1.2, 0.05, VOWELS.i, 0.7 - k * 0.12);
      break;
    default:
  }
  return true;
}
