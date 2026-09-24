import type { CharacterId } from './characterSystem';
import { nextRandom, type SerializableRngState } from './rng';
import { STARTER_CHARACTERS_V01 } from '../content/core/characters_starter_v01';
import {
  SECRET_BABY_CHARACTER_ID,
  SECRET_BABY_RANDOM_CHANCE,
} from '../content/core/character_secret_baby_v01';

export type CharacterSelectionModeCh02b = 'fixed' | 'random';

export interface RandomCharacterAssignmentCh02b {
  playerId: number;
  characterId: CharacterId;
  source: 'random';
  secret: boolean;
}

export interface RandomCharacterBatchCh02b {
  mode: 'concealed_batch';
  revealAt: 'match_start';
  randomPlayerIds: number[];
  assignments: RandomCharacterAssignmentCh02b[];
  secretIncluded: boolean;
  secretChancePerRandomSlot: number;
}

function uniqueSortedPlayerIds(ids: readonly number[]): number[] {
  return [...new Set(ids.filter((id) => Number.isInteger(id) && id >= 0))]
    .sort((a, b) => a - b);
}

function shuffleInPlace<T>(items: T[], rng: SerializableRngState): void {
  for (let index = items.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(nextRandom(rng) * (index + 1));
    [items[index], items[swapIndex]] = [items[swapIndex], items[index]];
  }
}

function pickStarterTokens(
  count: number,
  rng: SerializableRngState,
  occupiedCharacterIds: ReadonlySet<string>,
): CharacterId[] {
  if (count <= 0) return [];

  const allStarterIds = STARTER_CHARACTERS_V01.map((character) => character.id);
  const unused = allStarterIds.filter((id) => !occupiedCharacterIds.has(id));
  shuffleInPlace(unused, rng);

  const result: CharacterId[] = unused.slice(0, count);

  while (result.length < count) {
    const refill = [...allStarterIds];
    shuffleInPlace(refill, rng);
    for (const id of refill) {
      if (result.length >= count) break;
      // Prefer unique starter assignments inside this RANDOM batch whenever possible.
      if (!result.includes(id)) result.push(id);
    }

    // Defensive fallback for future rosters smaller than the RANDOM batch.
    if (refill.every((id) => result.includes(id)) && result.length < count) {
      result.push(refill[0]);
    }
  }

  return result;
}

/**
 * CH-02B RANDOM resolver.
 *
 * Contract:
 * - HOST calls this once for the set of players who chose RANDOM.
 * - each RANDOM slot receives an independent 5% Secret Baby eligibility roll;
 * - the batch is capped at one Secret Baby;
 * - all resulting character tokens are shuffled before being assigned to seats;
 * - reveal is deferred to match start;
 * - starter duplicates are avoided whenever roster capacity permits.
 *
 * This function only resolves pre-match Character assignment. It does not
 * activate Character passives or mutate MatchState.
 */
export function resolveRandomCharacterBatchCh02b(
  randomPlayerIds: readonly number[],
  rng: SerializableRngState,
  occupiedCharacterIds: readonly CharacterId[] = [],
): RandomCharacterBatchCh02b {
  const playerIds = uniqueSortedPlayerIds(randomPlayerIds);
  const occupied = new Set(occupiedCharacterIds);

  let secretIncluded = false;
  for (const _playerId of playerIds) {
    if (nextRandom(rng) < SECRET_BABY_RANDOM_CHANCE) secretIncluded = true;
  }

  const normalCount = Math.max(0, playerIds.length - (secretIncluded ? 1 : 0));
  const tokens = pickStarterTokens(normalCount, rng, occupied);
  if (secretIncluded) tokens.push(SECRET_BABY_CHARACTER_ID);

  // The secret roll is deliberately detached from the final player seat.
  // This is the "trải ra, trộn rồi tự chia" surprise rule.
  shuffleInPlace(tokens, rng);

  const assignments = playerIds.map<RandomCharacterAssignmentCh02b>((playerId, index) => {
    const characterId = tokens[index];
    if (!characterId) throw new Error('Random Character batch did not produce enough tokens.');
    return {
      playerId,
      characterId,
      source: 'random',
      secret: characterId === SECRET_BABY_CHARACTER_ID,
    };
  });

  return {
    mode: 'concealed_batch',
    revealAt: 'match_start',
    randomPlayerIds: playerIds,
    assignments,
    secretIncluded,
    secretChancePerRandomSlot: SECRET_BABY_RANDOM_CHANCE,
  };
}

export function isDirectSelectableCharacterCh02b(characterId: CharacterId): boolean {
  return characterId !== SECRET_BABY_CHARACTER_ID;
}
