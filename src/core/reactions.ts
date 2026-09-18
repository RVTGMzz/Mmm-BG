import type { FaceExpression, PersonalityTag } from './session';
import type { PlayerState } from './types';

export type ReactionSpeakerRole = 'caster' | 'target' | 'subject' | 'spectator';

export interface ReactionVariant {
  personalityTag: PersonalityTag | 'any';
  text: string;
  sfxId?: string;
}

export interface ReactionStep {
  sequence: number;
  delayMs: number;
  speakerRole: ReactionSpeakerRole;
  expression: FaceExpression;
  durationMs: number;
  canOverlap: boolean;
  blocking: boolean;
  variants: ReactionVariant[];
}

export interface ReactionEventDefinition {
  id: string;
  steps: ReactionStep[];
}

export interface ReactionContext {
  caster?: PlayerState;
  target?: PlayerState;
  subject?: PlayerState;
  spectator?: PlayerState;
  variables?: Record<string, string | number>;
}

export function resolveReactionSpeaker(
  role: ReactionSpeakerRole,
  context: ReactionContext,
): PlayerState | undefined {
  switch (role) {
    case 'caster':
      return context.caster;
    case 'target':
      return context.target;
    case 'subject':
      return context.subject;
    case 'spectator':
      return context.spectator;
  }
}

export function selectReactionVariant(
  step: ReactionStep,
  personality: PersonalityTag,
): ReactionVariant | undefined {
  return (
    step.variants.find((variant) => variant.personalityTag === personality) ??
    step.variants.find((variant) => variant.personalityTag === 'any') ??
    step.variants[0]
  );
}

export function formatReactionText(
  text: string,
  variables: Record<string, string | number> = {},
): string {
  return text.replace(/\{([A-Za-z0-9_]+)\}/g, (match, key: string) => {
    const value = variables[key];
    return value === undefined ? match : String(value);
  });
}
