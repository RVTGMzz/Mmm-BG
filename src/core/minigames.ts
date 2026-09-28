import type { MiniGameBaseMode059, MiniGameThreePlusMode059 } from './miniGameSlots059';

export type PalmChoice = 'up' | 'down';
export type RpsChoice = 'rock' | 'paper' | 'scissors';
export type ThreeDoorChoice = 'a' | 'b' | 'c';
export type SoloBuoyChoice = '1' | '2' | '3';
export type MiniGameMode = MiniGameBaseMode059;

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

export interface ThreeDoorsRoundResult {
  roll: number;
  winningDoor: ThreeDoorChoice;
  eliminatedPlayerIds: number[];
  survivingPlayerIds: number[];
  tied: boolean;
}

export interface SoloBuoyRoundResult {
  survivorPlayerIds: number[];
  eliminatedPlayerIds: number[];
  counts: Readonly<Record<SoloBuoyChoice, number>>;
  tied: boolean;
}

export function minigameModeForActivePlayers(
  activePlayerIds: readonly number[],
  mode3Plus: MiniGameThreePlusMode059 = 'majority_minority',
): MiniGameMode {
  return activePlayerIds.length <= 2 ? 'rps' : mode3Plus;
}

export function threeDoorForRoll(roll: number): ThreeDoorChoice {
  if (!Number.isInteger(roll) || roll < 1 || roll > 6) {
    throw new RangeError(`Three Doors roll must be D6 1..6, got ${String(roll)}.`);
  }
  if (roll <= 2) return 'a';
  if (roll <= 4) return 'b';
  return 'c';
}

/**
 * BA CỬA:
 * - every active player secretly picks A/B/C;
 * - D6 1–2 -> A, 3–4 -> B, 5–6 -> C;
 * - players on the winning door survive;
 * - nobody hits OR everybody hits => replay with no elimination.
 */
export function resolveThreeDoorsRound(
  activePlayerIds: readonly number[],
  choices: Readonly<Record<number, ThreeDoorChoice>>,
  roll: number,
): ThreeDoorsRoundResult {
  const active = [...new Set(activePlayerIds)];
  const winningDoor = threeDoorForRoll(roll);
  const survivors = active.filter((id) => choices[id] === winningDoor);

  if (survivors.length === 0 || survivors.length === active.length) {
    return {
      roll,
      winningDoor,
      eliminatedPlayerIds: [],
      survivingPlayerIds: active,
      tied: true,
    };
  }

  const survivorSet = new Set(survivors);
  return {
    roll,
    winningDoor,
    eliminatedPlayerIds: active.filter((id) => !survivorSet.has(id)),
    survivingPlayerIds: survivors,
    tied: false,
  };
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

/**
 * PHAO ĐƠN:
 * - every active player secretly picks buoy 1/2/3;
 * - a buoy floats only when exactly one player picked it;
 * - players on crowded buoys are eliminated;
 * - if nobody is eliminated OR nobody survives, replay.
 */
export function resolveSoloBuoyRound(
  activePlayerIds: readonly number[],
  choices: Readonly<Record<number, SoloBuoyChoice>>,
): SoloBuoyRoundResult {
  const active = [...new Set(activePlayerIds)];
  const counts: Record<SoloBuoyChoice, number> = { '1': 0, '2': 0, '3': 0 };
  for (const id of active) {
    const choice = choices[id];
    if (choice === '1' || choice === '2' || choice === '3') counts[choice] += 1;
  }

  const survivors = active.filter((id) => {
    const choice = choices[id];
    return (choice === '1' || choice === '2' || choice === '3') && counts[choice] === 1;
  });

  if (survivors.length === 0 || survivors.length === active.length) {
    return {
      survivorPlayerIds: active,
      eliminatedPlayerIds: [],
      counts,
      tied: true,
    };
  }

  const survivorSet = new Set(survivors);
  return {
    survivorPlayerIds: survivors,
    eliminatedPlayerIds: active.filter((id) => !survivorSet.has(id)),
    counts,
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
