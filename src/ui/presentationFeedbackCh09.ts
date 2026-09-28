import type { SfxCue } from '../audio/sfxController';
import type { PresentationEventModel } from './presentationModel';

export interface LandingFeedbackCh09 {
  cue: SfxCue;
  burstCount: number;
  floatingMoney: boolean;
  cameraShake?: { durationMs: number; intensity: number };
}

export function landingFeedbackCh09(model: PresentationEventModel): LandingFeedbackCh09 {
  if (model.tileType === 'character_passive') {
    return {
      cue: 'character_passive',
      burstCount: 16,
      floatingMoney: (model.amount ?? 0) !== 0,
      cameraShake: { durationMs: 90, intensity: 0.00065 },
    };
  }

  if (model.kind === 'ready_bonus') {
    return {
      cue: 'ready',
      burstCount: 14,
      floatingMoney: true,
    };
  }

  if (model.tileType === 'money') {
    return {
      cue: (model.amount ?? 0) >= 0 ? 'coin_gain' : 'coin_loss',
      burstCount: 8,
      floatingMoney: true,
    };
  }

  return {
    cue: 'land',
    burstCount: 8,
    floatingMoney: false,
  };
}

export interface DiceSettleFeedbackCh09 {
  burstCount: number;
  cameraShake: { durationMs: number; intensity: number };
}

export function diceSettleFeedbackCh09(roll: number): DiceSettleFeedbackCh09 {
  const safeRoll = Math.max(1, Math.min(6, Math.floor(roll)));
  return {
    burstCount: safeRoll === 6 ? 12 : 8,
    cameraShake: {
      durationMs: safeRoll === 6 ? 105 : 80,
      intensity: safeRoll === 6 ? 0.0008 : 0.0005,
    },
  };
}
