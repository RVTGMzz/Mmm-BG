import { createRngState, type SerializableRngState } from './rng';
import type { TurnPhase, TurnPhaseSnapshot } from './turnPhase';
import type { PlayerState } from './types';

export type MatchEventValue = string | number | boolean | null;
export type MatchCommandType = 'roll' | 'choose_branch' | 'play_card';

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

export interface MatchCommand {
  seq: number;
  type: MatchCommandType;
  turnNumber: number;
  playerIndex: number;
  actorId: number;
  data: Record<string, MatchEventValue>;
}

export interface MatchTurnState extends TurnPhaseSnapshot {
  currentPlayerIndex: number;
  turnNumber: number;
  lastRoll: number | null;
}

export interface MatchState {
  schemaVersion: 2;
  boardId: string;
  seed: number;
  startingMoney: number;
  rng: SerializableRngState;
  turn: MatchTurnState;
  players: PlayerState[];
  commandLog: MatchCommand[];
  nextCommandSeq: number;
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
    schemaVersion: 2,
    boardId: options.boardId,
    seed: rng.seed,
    startingMoney,
    rng,
    turn: {
      currentPlayerIndex: 0,
      turnNumber: 1,
      lastRoll: null,
      phase: 'TURN_START',
      revision: 0,
    },
    players,
    commandLog: [],
    nextCommandSeq: 1,
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

export function appendMatchCommand(
  match: MatchState,
  type: MatchCommandType,
  actorId: number,
  data: Record<string, MatchEventValue> = {},
): MatchCommand {
  const command: MatchCommand = {
    seq: match.nextCommandSeq,
    type,
    turnNumber: match.turn.turnNumber,
    playerIndex: match.turn.currentPlayerIndex,
    actorId,
    data,
  };

  match.nextCommandSeq += 1;
  match.commandLog.push(command);
  return command;
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
  const parsed = JSON.parse(serialized) as Partial<MatchState> & { schemaVersion?: number };

  if (parsed.schemaVersion === 2) {
    return parsed as MatchState;
  }

  if (parsed.schemaVersion === 1) {
    const legacy = parsed as Partial<MatchState> & {
      boardId: string;
      seed: number;
      rng: SerializableRngState;
      turn: MatchTurnState;
      players: PlayerState[];
      eventLog: MatchEvent[];
      nextEventSeq: number;
    };

    return {
      schemaVersion: 2,
      boardId: legacy.boardId,
      seed: legacy.seed,
      startingMoney: 1000,
      rng: legacy.rng,
      turn: legacy.turn,
      players: legacy.players,
      commandLog: [],
      nextCommandSeq: 1,
      eventLog: legacy.eventLog ?? [],
      nextEventSeq: legacy.nextEventSeq ?? ((legacy.eventLog?.length ?? 0) + 1),
    };
  }

  throw new Error(`Unsupported MeMeMe match schema: ${String(parsed.schemaVersion)}`);
}

export function cloneMatchState(match: MatchState): MatchState {
  return deserializeMatchState(serializeMatchState(match));
}
