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

export interface FinalSprintResult {
  totals: Readonly<Record<number, number>>;
  lockedPlayerIds: number[];
  overtimePlayerIds: number[];
  lowerPlayerIds: number[];
  slotsOpen: number;
  complete: boolean;
}

export interface CutTopDiceRoundResult {
  lockedPlayerIds: number[];
  rerollPlayerIds: number[];
  eliminatedPlayerIds: number[];
  slotsOpen: number;
  complete: boolean;
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

/**
 * CẮT TOP XÚC XẮC:
 * - every active player has a D6 result;
 * - highest scores lock the available Top slots;
 * - when a score group crosses the cutoff, only that tied group rerolls;
 * - players below the cutoff are eliminated immediately.
 */
export function resolveCutTopDiceRound(
  activePlayerIds: readonly number[],
  rolls: Readonly<Record<number, number>>,
  targetCount: number,
): CutTopDiceRoundResult {
  const active = [...new Set(activePlayerIds)];
  if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > active.length) {
    throw new RangeError(`Cut Top targetCount must be 1..${active.length}, got ${String(targetCount)}.`);
  }

  for (const id of active) {
    const roll = rolls[id];
    if (!Number.isInteger(roll) || roll < 1 || roll > 6) {
      throw new RangeError(`Cut Top roll for P${id} must be D6 1..6, got ${String(roll)}.`);
    }
  }

  const scoreGroups = [...new Set(active.map((id) => rolls[id]!))]
    .sort((a, b) => b - a)
    .map((score) => ({
      score,
      playerIds: active.filter((id) => rolls[id] === score).sort((a, b) => a - b),
    }));

  const locked: number[] = [];
  let reroll: number[] = [];
  let slotsOpen = targetCount;

  for (const group of scoreGroups) {
    if (slotsOpen <= 0) break;
    if (group.playerIds.length <= slotsOpen) {
      locked.push(...group.playerIds);
      slotsOpen -= group.playerIds.length;
      continue;
    }
    reroll = [...group.playerIds];
    break;
  }

  const protectedIds = new Set([...locked, ...reroll]);
  const eliminated = active
    .filter((id) => !protectedIds.has(id))
    .sort((a, b) => (rolls[a]! - rolls[b]!) || (a - b));

  return {
    lockedPlayerIds: locked,
    rerollPlayerIds: reroll,
    eliminatedPlayerIds: eliminated,
    slotsOpen,
    complete: reroll.length === 0 && slotsOpen === 0,
  };
}

/** ĐUA 3 CHẶNG: three D6 legs, totals cut Top 2; cutoff ties alone enter overtime. */
export function resolveFinalSprint(activePlayerIds: readonly number[], legRolls: Readonly<Record<number, readonly number[]>>, targetCount = 2): FinalSprintResult {
  const active = [...new Set(activePlayerIds)];
  if (!Number.isInteger(targetCount) || targetCount < 1 || targetCount > active.length) throw new RangeError('Final Sprint targetCount invalid.');
  const totals: Record<number, number> = {};
  for (const id of active) {
    const rolls = legRolls[id];
    if (!rolls || rolls.length !== 3 || rolls.some((roll) => !Number.isInteger(roll) || roll < 1 || roll > 6)) throw new RangeError('Final Sprint requires exactly three D6 rolls.');
    totals[id] = rolls[0]! + rolls[1]! + rolls[2]!;
  }
  const groups = [...new Set(active.map((id) => totals[id]!))].sort((a,b)=>b-a).map((score)=>({score,playerIds:active.filter((id)=>totals[id]===score)}));
  const locked: number[] = []; let overtime: number[] = []; let slotsOpen = targetCount;
  for (const group of groups) { if (slotsOpen <= 0) break; if (group.playerIds.length <= slotsOpen) { locked.push(...group.playerIds); slotsOpen -= group.playerIds.length; } else { overtime = [...group.playerIds]; break; } }
  const protectedIds = new Set([...locked,...overtime]);
  const lower = active.filter((id)=>!protectedIds.has(id)).sort((a,b)=>totals[a]!-totals[b]!);
  return { totals, lockedPlayerIds: locked, overtimePlayerIds: overtime, lowerPlayerIds: lower, slotsOpen, complete: overtime.length===0 && slotsOpen===0 };
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
