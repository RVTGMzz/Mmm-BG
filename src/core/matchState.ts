import { computeMatchChecksum } from './checksum';
import { createRngState, type SerializableRngState } from './rng';
import type { TurnPhase, TurnPhaseSnapshot } from './turnPhase';
import type { PlayerState } from './types';

export type MatchEventValue = string | number | boolean | null;
export type MatchCommandType = 'roll' | 'choose_branch' | 'play_card' | 'choose_job';

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

export interface MatchCommandEnvelope {
  turnNumber: number;
  playerIndex: number;
  phase: TurnPhase;
  revision: number;
  preChecksum: string;
}

export interface MatchCommand {
  seq: number;
  type: MatchCommandType;
  turnNumber: number;
  playerIndex: number;
  actorId: number;
  data: Record<string, MatchEventValue>;
  phase?: TurnPhase;
  revision?: number;
  preChecksum?: string;
}

export interface MatchTurnState extends TurnPhaseSnapshot {
  currentPlayerIndex: number;
  turnNumber: number;
  lastRoll: number | null;
}

export interface MatchState {
  schemaVersion: 3;
  boardId: string;
  seed: number;
  startingMoney: number;
  rng: SerializableRngState;
  turn: MatchTurnState;
  players: PlayerState[];
  /** Stable player IDs in actual play order. Omitted means legacy identity order [0,1,2,...]. */
  playOrder?: number[];
  commandLog: MatchCommand[];
  nextCommandSeq: number;
  eventLog: MatchEvent[];
  nextEventSeq: number;
  pendingJobOfferIds?: string[];
  pendingJobPlayerId?: number;
}

export interface CreateMatchOptions {
  boardId: string;
  startNodeId: number;
  playerNames: string[];
  seed: number;
  startingMoney?: number;
  playOrder?: number[];
}

let configuredInitialPlayOrder: number[] | undefined;

function normalizePlayOrder(order: readonly number[] | undefined, playerCount: number): number[] | undefined {
  if (!order || order.length !== playerCount) return undefined;
  const normalized = order.map((value) => Math.floor(value));
  const expected = Array.from({ length: playerCount }, (_, index) => index);
  const unique = new Set(normalized);
  if (unique.size !== playerCount) return undefined;
  if (!expected.every((id) => unique.has(id))) return undefined;
  return normalized;
}

/** Configure the next browser-created matches after the pregame Roll For Order ceremony. */
export function configureInitialPlayOrder(order?: readonly number[]): void {
  configuredInitialPlayOrder = order ? [...order] : undefined;
}

export function createInitialMatchState(options: CreateMatchOptions): MatchState {
  const rng = createRngState(options.seed);
  const startingMoney = options.startingMoney ?? 200;
  const players = options.playerNames.map<PlayerState>((name, index) => ({
    id: index,
    name: name.trim() || `Player ${index + 1}`,
    nodeId: options.startNodeId,
    money: startingMoney,
    cardBlockTurns: 0,
    handCardIds: [],
    cardsPlayedThisTurn: 0,
  }));
  const playOrder = normalizePlayOrder(options.playOrder ?? configuredInitialPlayOrder, players.length);

  return {
    schemaVersion: 3,
    boardId: options.boardId,
    seed: rng.seed,
    startingMoney,
    rng,
    turn: {
      currentPlayerIndex: playOrder?.[0] ?? 0,
      turnNumber: 1,
      lastRoll: null,
      phase: 'TURN_START',
      revision: 0,
    },
    players,
    ...(playOrder ? { playOrder } : {}),
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

export function captureMatchCommandEnvelope(match: MatchState): MatchCommandEnvelope {
  return {
    turnNumber: match.turn.turnNumber,
    playerIndex: match.turn.currentPlayerIndex,
    phase: match.turn.phase,
    revision: match.turn.revision,
    preChecksum: computeMatchChecksum(match),
  };
}

export function appendMatchCommand(
  match: MatchState,
  type: MatchCommandType,
  actorId: number,
  data: Record<string, MatchEventValue> = {},
  envelope: MatchCommandEnvelope = captureMatchCommandEnvelope(match),
): MatchCommand {
  const command: MatchCommand = {
    seq: match.nextCommandSeq,
    type,
    turnNumber: envelope.turnNumber,
    playerIndex: envelope.playerIndex,
    actorId,
    data,
    phase: envelope.phase,
    revision: envelope.revision,
    preChecksum: envelope.preChecksum,
  };

  match.nextCommandSeq += 1;
  match.commandLog.push(command);
  return command;
}

export function advanceMatchTurn(match: MatchState): number {
  if (match.players.length === 0) {
    throw new Error('Cannot advance a match with no players.');
  }

  const order = normalizePlayOrder(match.playOrder, match.players.length)
    ?? match.players.map((player) => player.id);
  const currentPosition = order.indexOf(match.turn.currentPlayerIndex);
  const nextPosition = currentPosition >= 0 ? (currentPosition + 1) % order.length : 0;
  match.turn.currentPlayerIndex = order[nextPosition] ?? 0;
  match.turn.turnNumber += 1;
  match.turn.lastRoll = null;
  delete match.pendingJobOfferIds;
  delete match.pendingJobPlayerId;
  return match.turn.currentPlayerIndex;
}

export function serializeMatchState(match: MatchState): string {
  return JSON.stringify(match);
}

function legacyPhaseForCommand(type: MatchCommandType): TurnPhase {
  if (type === 'choose_branch') return 'BRANCH_CHOICE';
  if (type === 'choose_job') return 'JOB_CHOICE';
  return 'PRE_ROLL_ACTION';
}

function migrateLegacyCommands(commands: MatchCommand[] | undefined): MatchCommand[] {
  return (commands ?? []).map((command) => ({
    ...command,
    data: { ...command.data },
    phase: command.phase ?? legacyPhaseForCommand(command.type),
    revision: command.revision ?? -1,
    preChecksum: command.preChecksum ?? '',
  }));
}

export function deserializeMatchState(serialized: string): MatchState {
  const parsed = JSON.parse(serialized) as Partial<MatchState> & { schemaVersion?: number };

  if (parsed.schemaVersion === 3) {
    return parsed as MatchState;
  }

  if (parsed.schemaVersion === 2) {
    const legacy = parsed as unknown as Omit<MatchState, 'schemaVersion'> & { schemaVersion: 2 };
    const commandLog = migrateLegacyCommands(legacy.commandLog);
    return {
      ...legacy,
      schemaVersion: 3,
      commandLog,
      nextCommandSeq: legacy.nextCommandSeq ?? commandLog.length + 1,
    };
  }

  if (parsed.schemaVersion === 1) {
    const legacy = parsed as unknown as {
      boardId: string;
      seed: number;
      rng: SerializableRngState;
      turn: MatchTurnState;
      players: PlayerState[];
      eventLog: MatchEvent[];
      nextEventSeq: number;
    };

    return {
      schemaVersion: 3,
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
