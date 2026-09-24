import type { CharacterId } from './characterSystem';
import { createRngState, type SerializableRngState } from './rng';
import {
  resolveRandomCharacterBatchCh02b,
  type RandomCharacterAssignmentCh02b,
} from './characterRandomSelectionCh02b';
import { getStarterCharacterV01 } from '../content/core/characters_starter_v01';
import {
  SECRET_BABY_CHARACTER_ID,
  SECRET_BABY_V01,
} from '../content/core/character_secret_baby_v01';

export type CharacterSelectionModeCh02c = 'fixed' | 'random';

export interface CharacterSelectionIntentCh02c {
  playerId: number;
  mode: CharacterSelectionModeCh02c;
  characterId?: CharacterId;
}

export interface CharacterRevealAssignmentCh02c {
  playerId: number;
  characterId: CharacterId;
  source: CharacterSelectionModeCh02c;
  secret: boolean;
}

function hashTextCh02c(value: string): number {
  let hash = 0x811c9dc5;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/**
 * Creates one serializable HOST-owned RNG for the pre-match Character batch.
 * Browsers use crypto for the seed. The fallback remains Math.random-free and
 * still materializes an explicit seed that can be logged/replayed.
 */
export function createPregameCharacterRngCh02c(salt = ''): SerializableRngState {
  let seed = 0;
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const values = new Uint32Array(1);
    crypto.getRandomValues(values);
    seed = values[0] ?? 0;
  } else {
    seed = hashTextCh02c(`${Date.now()}|${salt}`);
  }
  return createRngState(seed);
}

export function resolveCharacterAssignmentsCh02c(
  intents: readonly CharacterSelectionIntentCh02c[],
  rng: SerializableRngState,
): CharacterRevealAssignmentCh02c[] {
  const normalized = [...intents]
    .map((intent) => ({ ...intent, playerId: Math.floor(intent.playerId) }))
    .sort((a, b) => a.playerId - b.playerId);

  const seen = new Set<number>();
  const fixed: CharacterRevealAssignmentCh02c[] = [];
  const randomIds: number[] = [];
  const occupiedFixed: CharacterId[] = [];

  for (const intent of normalized) {
    if (intent.playerId < 0 || intent.playerId > 3 || seen.has(intent.playerId)) {
      throw new Error(`Invalid/duplicate Character selection seat P${intent.playerId + 1}.`);
    }
    seen.add(intent.playerId);

    if (intent.mode === 'random') {
      randomIds.push(intent.playerId);
      continue;
    }

    if (!intent.characterId || !getStarterCharacterV01(intent.characterId)) {
      throw new Error(`Fixed Character selection for P${intent.playerId + 1} must be a visible starter Character.`);
    }
    occupiedFixed.push(intent.characterId);
    fixed.push({
      playerId: intent.playerId,
      characterId: intent.characterId,
      source: 'fixed',
      secret: false,
    });
  }

  const randomBatch = resolveRandomCharacterBatchCh02b(randomIds, rng, occupiedFixed);
  const random: CharacterRevealAssignmentCh02c[] = randomBatch.assignments.map(
    (assignment: RandomCharacterAssignmentCh02b) => ({
      playerId: assignment.playerId,
      characterId: assignment.characterId,
      source: 'random',
      secret: assignment.secret,
    }),
  );

  return [...fixed, ...random].sort((a, b) => a.playerId - b.playerId);
}

export function characterDisplayLabelCh02c(characterId: CharacterId): string {
  const starter = getStarterCharacterV01(characterId);
  if (starter) return starter.archetypeLabel;
  if (characterId === SECRET_BABY_CHARACTER_ID) return SECRET_BABY_V01.archetypeLabel;
  return '???';
}
