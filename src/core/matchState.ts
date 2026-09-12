import { createRngState, type SerializableRngState } from './rng';
import type { TurnPhase, TurnPhaseSnapshot } from './turnPhase';
import type { PlayerState } from './types';

export type MatchEventValue = string | number | boolean | null;

export interface MatchEvent {
  seq: number;
  type: string;
  turnNumber: number;
  playerIndex: number;
  phase: TurnPhase;
  revision: number;
  rngCalls: number;
  actorId?: number;
  data: Record<string, MatchEventValue>;
}

export interface MatchTurnState extends TurnPhaseSnapshot {
  currentPlayerIndex: number;
  turnNumber: number;
  lastRoll: number | null;
}

export interface MatchState {
  schemaVersion: 1;
  boardId: string;
  seed: number;
  rng: SerializableRngState;
  turn: MatchTurnState;
  players: PlayerState[];
  eventLog: MatchEvent[];
  nextEventSeq: number;
}

export interface CreateMatchOptions {
  boardId: string;
  startNodeId: number;
  playerNames: string[];
  seed: number;
  startingMoney?: number;
}

export function createInitialMatchState(options: CreateMatchOptions): MatchState {
  const rng = createRngState(options.seed);
  const startingMoney = options.startingMoney ?? 1000;
  const players = options.playerNames.map<PlayerState>((name, index) => ({
    id: index,
    name: name.trim() || `Player ${index + 1}`,
    nodeId: options.startNodeId,
    money: startingMoney,
    cardBlockTurns: 0,
    handCardIds: [],
    cardsPlayedThisTurn: 0,
  }));

  return {
    schemaVersion: 1,
    boardId: options.boardId,
    seed: rng.seed,
    rng,
    turn: {
      currentPlayerIndex: 0,
      turnNumber: 1,
      lastRoll: null,
      phase: 'TURN_START',
      revision: 0,
    },
    players,
    eventLog: [],
    nextEventSeq: 1,
  };
}

export function appendMatchEvent(
  match: MatchState,
  type: string,
  data: Record<string, MatchEventValue> = {},
  actorId?: number,
): MatchEvent {
  const event: MatchEvent = {
    seq: match.nextEventSeq,
    type,
    turnNumber: match.turn.turnNumber,
    playerIndex: match.turn.currentPlayerIndex,
    phase: match.turn.phase,
    revision: match.turn.revision,
    rngCalls: match.rng.calls,
    actorId,
    data,
  };

  match.nextEventSeq += 1;
  match.eventLog.push(event);
  return event;
}

export function advanceMatchTurn(match: MatchState): number {
  if (match.players.length === 0) {
    throw new Error('Cannot advance a match with no players.');
  }

  match.turn.currentPlayerIndex =
    (match.turn.currentPlayerIndex + 1) % match.players.length;
  match.turn.turnNumber += 1;
  match.turn.lastRoll = null;
  return match.turn.currentPlayerIndex;
}

export function serializeMatchState(match: MatchState): string {
  return JSON.stringify(match);
}

export function deserializeMatchState(serialized: string): MatchState {
  const parsed = JSON.parse(serialized) as MatchState;
  if (parsed.schemaVersion !== 1) {
    throw new Error(`Unsupported MeMeMe match schema: ${String(parsed.schemaVersion)}`);
  }
  return parsed;
}
