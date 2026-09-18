export type PalmChoice = 'up' | 'down';
export type RpsChoice = 'rock' | 'paper' | 'scissors';
export type MiniGameMode = 'majority_minority' | 'rps';

export interface MajorityMinorityRoundResult {
  eliminatedPlayerIds: number[];
  survivingPlayerIds: number[];
  tied: boolean;
}

export interface RpsRoundResult {
  winnerId?: number;
  loserId?: number;
  tied: boolean;
}

export function minigameModeForActivePlayers(activePlayerIds: readonly number[]): MiniGameMode {
  return activePlayerIds.length <= 2 ? 'rps' : 'majority_minority';
}

/**
 * "Nhiều ra ít bị": each active player chooses palm up/down.
 * The minority side is eliminated. If both sides have equal size, nobody is eliminated.
 */
export function resolveMajorityMinorityRound(
  activePlayerIds: readonly number[],
  choices: Readonly<Record<number, PalmChoice>>,
): MajorityMinorityRoundResult {
  const active = [...new Set(activePlayerIds)];
  const up = active.filter((id) => choices[id] === 'up');
  const down = active.filter((id) => choices[id] === 'down');

  if (up.length === 0 || down.length === 0 || up.length === down.length) {
    return { eliminatedPlayerIds: [], survivingPlayerIds: active, tied: true };
  }

  const eliminated = up.length < down.length ? up : down;
  const eliminatedSet = new Set(eliminated);
  return {
    eliminatedPlayerIds: eliminated,
    survivingPlayerIds: active.filter((id) => !eliminatedSet.has(id)),
    tied: false,
  };
}

function beats(left: RpsChoice, right: RpsChoice): boolean {
  return (
    (left === 'rock' && right === 'scissors') ||
    (left === 'scissors' && right === 'paper') ||
    (left === 'paper' && right === 'rock')
  );
}

/** When exactly two players remain, MeMeMe switches to rock-paper-scissors automatically. */
export function resolveRpsRound(
  playerA: number,
  choiceA: RpsChoice,
  playerB: number,
  choiceB: RpsChoice,
): RpsRoundResult {
  if (choiceA === choiceB) return { tied: true };
  if (beats(choiceA, choiceB)) return { winnerId: playerA, loserId: playerB, tied: false };
  return { winnerId: playerB, loserId: playerA, tied: false };
}
