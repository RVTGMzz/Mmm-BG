import type { MatchState } from './matchState';

export const DEMO_MATCH_DEFAULT_ROUNDS = 3;

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
  return {
    ...shell,
    winnerIds: [...shell.winnerIds],
  };
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

/**
 * Temporary demo rule only, not final game design:
 * after N full rounds, the player(s) with the most B$ win. Ties share the win.
 */
export function shouldEndDemoMatch(match: MatchState, shell: DemoMatchShellState): boolean {
  return shell.status === 'active' && match.turn.turnNumber > shell.turnLimit;
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
