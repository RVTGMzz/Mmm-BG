import type { MatchState } from './matchState';
import { targetLapsForPlayer060 } from './pacingEconomy060';

export const DEMO_MATCH_DEFAULT_ROUNDS = 3;
export const DEMO_MATCH_TARGET_LAPS = 1;

export type DemoMatchStatus = 'waiting' | 'active' | 'ended';

export interface DemoMatchShellState {
  version: 1;
  status: DemoMatchStatus;
  revision: number;
  rounds: number;
  turnLimit: number;
  startedAtCommandSeq: number;
  endedAtCommandSeq: number | null;
  winnerIds: number[];
  winningMoney: number | null;
}

export interface DemoMatchResult {
  winnerIds: number[];
  winningMoney: number;
  ranking: Array<{ playerId: number; money: number }>;
}

export interface DemoMatchLapProgress {
  completedPlayers: number;
  totalPlayers: number;
  targetLaps: number;
}

export function createDemoMatchShell(
  playerCount: number,
  rounds = DEMO_MATCH_DEFAULT_ROUNDS,
  status: DemoMatchStatus = 'waiting',
): DemoMatchShellState {
  const safePlayers = Math.max(1, Math.floor(playerCount));
  const safeRounds = Math.max(1, Math.floor(rounds));
  return {
    version: 1,
    status,
    revision: 0,
    rounds: safeRounds,
    turnLimit: safePlayers * safeRounds,
    startedAtCommandSeq: 0,
    endedAtCommandSeq: null,
    winnerIds: [],
    winningMoney: null,
  };
}

export function cloneDemoMatchShell(shell: DemoMatchShellState): DemoMatchShellState {
  return { ...shell, winnerIds: [...shell.winnerIds] };
}

export function demoMatchResult(match: MatchState): DemoMatchResult {
  const ranking = [...match.players]
    .map((player) => ({ playerId: player.id, money: player.money }))
    .sort((a, b) => b.money - a.money || a.playerId - b.playerId);

  const winningMoney = ranking[0]?.money ?? 0;
  return {
    winnerIds: ranking.filter((entry) => entry.money === winningMoney).map((entry) => entry.playerId),
    winningMoney,
    ranking,
  };
}

export function demoMatchLapProgress(match: MatchState): DemoMatchLapProgress {
  const targetLaps = match.players[0]
    ? targetLapsForPlayer060(match.players[0])
    : DEMO_MATCH_TARGET_LAPS;
  return {
    completedPlayers: match.players.filter((player) => (player.lapsCompleted ?? 0) >= targetLaps).length,
    totalPlayers: match.players.length,
    targetLaps,
  };
}

export function hasPendingLatestMiniGame(match: MatchState): boolean {
  const latest = match.eventLog.at(-1);
  if (!latest || latest.type !== 'minigame_tile') return false;
  return !match.eventLog.some(
    (event) => event.type === 'minigame_reward' && Number(event.data.sourceEventSeq) === latest.seq,
  );
}

/**
 * 0.1.66 scoring starts only after every player reaches the selected 1/2/3-lap target.
 * A final Mini Game must also finish its authoritative payout before B$ is scored.
 */
export function shouldEndDemoMatch(match: MatchState, shell: DemoMatchShellState): boolean {
  if (shell.status !== 'active' || match.players.length === 0) return false;
  if (hasPendingLatestMiniGame(match)) return false;
  const progress = demoMatchLapProgress(match);
  return progress.completedPlayers === progress.totalPlayers;
}

export function demoMatchTurnProgress(match: MatchState, shell: DemoMatchShellState): {
  completedTurns: number;
  totalTurns: number;
  currentRound: number;
} {
  const totalTurns = shell.turnLimit;
  const completedTurns = Math.min(totalTurns, Math.max(0, match.turn.turnNumber - 1));
  const playerCount = Math.max(1, match.players.length);
  const currentRound = Math.min(
    shell.rounds,
    Math.floor(Math.max(0, match.turn.turnNumber - 1) / playerCount) + 1,
  );
  return { completedTurns, totalTurns, currentRound };
}
