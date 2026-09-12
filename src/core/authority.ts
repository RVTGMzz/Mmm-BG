import {
  getValidTargets,
  pickRandomOtherTarget,
  type CardDefinition,
} from './cards';
import { computeMatchChecksum } from './checksum';
import {
  captureMatchCommandEnvelope,
  cloneMatchState,
  createInitialMatchState,
  type MatchCommand,
  type MatchCommandType,
  type MatchEventValue,
  type MatchState,
} from './matchState';
import type { NewsDefinition } from './news';
import { replayMatchCommands } from './replay';
import { createRandomSource } from './rng';
import type { BoardDefinition, PlayerState } from './types';

export type ClientIntentType = 'roll' | 'choose_branch' | 'play_card';

export interface ClientIntent {
  intentId: string;
  clientId: string;
  actorId: number;
  type: ClientIntentType;
  /** Highest authoritative command sequence the client had observed when creating this intent. */
  observedCommandSeq: number;
  data: Record<string, MatchEventValue>;
}

export type HostIntentStatus = 'accepted' | 'duplicate' | 'rejected';

export interface HostIntentReceipt {
  intentId: string;
  status: HostIntentStatus;
  hostCommandSeq: number;
  checksum: string;
  phase: MatchState['turn']['phase'];
  command?: MatchCommand;
  reason?: string;
}

export interface HostAuthorityRuntime {
  board: BoardDefinition;
  cards: CardDefinition[];
  news: NewsDefinition[];
}

export interface HostAuthority {
  source: MatchState;
  state: MatchState;
  runtime: HostAuthorityRuntime;
  receipts: Map<string, HostIntentReceipt>;
}

function currentPlayer(state: MatchState): PlayerState | undefined {
  return state.players[state.turn.currentPlayerIndex];
}

function hostCommandSeq(authority: HostAuthority): number {
  return authority.source.commandLog.at(-1)?.seq ?? 0;
}

function receipt(
  authority: HostAuthority,
  intent: ClientIntent,
  status: HostIntentStatus,
  options: { command?: MatchCommand; reason?: string } = {},
): HostIntentReceipt {
  return {
    intentId: intent.intentId,
    status,
    hostCommandSeq: hostCommandSeq(authority),
    checksum: computeMatchChecksum(authority.state),
    phase: authority.state.turn.phase,
    command: options.command,
    reason: options.reason,
  };
}

function cloneReceipt(source: HostIntentReceipt, status: HostIntentStatus = source.status): HostIntentReceipt {
  return {
    ...source,
    status,
    command: source.command
      ? { ...source.command, data: { ...source.command.data } }
      : undefined,
  };
}

function makeCommand(
  authority: HostAuthority,
  type: MatchCommandType,
  actorId: number,
  data: Record<string, MatchEventValue>,
): MatchCommand {
  const envelope = captureMatchCommandEnvelope(authority.state);
  return {
    seq: authority.source.nextCommandSeq,
    type,
    turnNumber: envelope.turnNumber,
    playerIndex: envelope.playerIndex,
    actorId,
    data: { ...data },
    phase: envelope.phase,
    revision: envelope.revision,
    preChecksum: envelope.preChecksum,
  };
}

function sourceWithCommand(authority: HostAuthority, command: MatchCommand): MatchState {
  const candidate = cloneMatchState(authority.source);
  candidate.commandLog.push({ ...command, data: { ...command.data } });
  candidate.nextCommandSeq = command.seq + 1;
  return candidate;
}

function commitCommand(
  authority: HostAuthority,
  candidateSource: MatchState,
  nextState: MatchState,
): void {
  authority.source = candidateSource;
  authority.state = nextState;
}

function isWaitingForBranch(message: string | undefined): boolean {
  return Boolean(message?.includes('missing branch choice'));
}

function replayCandidate(
  authority: HostAuthority,
  candidateSource: MatchState,
): { accepted: boolean; waitingBranch: boolean; state: MatchState; reason?: string } {
  const replay = replayMatchCommands(
    candidateSource,
    authority.runtime.board,
    authority.runtime.cards,
    authority.runtime.news,
  );

  if (replay.errors.length === 0 && replay.consumedCommands === candidateSource.commandLog.length) {
    return { accepted: true, waitingBranch: false, state: replay.state };
  }

  if (isWaitingForBranch(replay.errors[0]) && replay.state.turn.phase === 'BRANCH_CHOICE') {
    return { accepted: true, waitingBranch: true, state: replay.state };
  }

  return {
    accepted: false,
    waitingBranch: false,
    state: replay.state,
    reason:
      replay.errors[0] ??
      `Host replay consumed ${replay.consumedCommands}/${candidateSource.commandLog.length} commands.`,
  };
}

function validateIntentEnvelope(authority: HostAuthority, intent: ClientIntent): string | undefined {
  if (!intent.intentId.trim()) return 'intentId is required.';
  if (!intent.clientId.trim()) return 'clientId is required.';

  const expectedSeq = hostCommandSeq(authority);
  if (intent.observedCommandSeq !== expectedSeq) {
    return `stale client view: observed #${intent.observedCommandSeq}, host is #${expectedSeq}.`;
  }

  const actor = currentPlayer(authority.state);
  if (!actor) return `missing current player index ${authority.state.turn.currentPlayerIndex}.`;
  if (intent.actorId !== actor.id) {
    return `actor P${intent.actorId} is not current P${actor.id}.`;
  }

  return undefined;
}

function validateIntentPhase(authority: HostAuthority, intent: ClientIntent): string | undefined {
  if (intent.type === 'choose_branch') {
    return authority.state.turn.phase === 'BRANCH_CHOICE'
      ? undefined
      : `choose_branch is invalid during ${authority.state.turn.phase}.`;
  }

  if (intent.type === 'roll' || intent.type === 'play_card') {
    return authority.state.turn.phase === 'PRE_ROLL_ACTION'
      ? undefined
      : `${intent.type} is invalid during ${authority.state.turn.phase}.`;
  }

  return `unsupported intent type ${String(intent.type)}.`;
}

function buildPlayCardData(
  authority: HostAuthority,
  intent: ClientIntent,
): { data?: Record<string, MatchEventValue>; reason?: string } {
  const caster = currentPlayer(authority.state);
  if (!caster) return { reason: 'missing current player.' };
  if (caster.cardBlockTurns > 0) return { reason: `${caster.name} is card-locked.` };

  const cardId = String(intent.data.cardId ?? '');
  if (!cardId) return { reason: 'play_card requires cardId.' };
  if (!caster.handCardIds.includes(cardId)) {
    return { reason: `${caster.name} does not hold ${cardId}.` };
  }

  const card = authority.runtime.cards.find((entry) => entry.id === cardId);
  if (!card) return { reason: `cannot find card ${cardId}.` };

  let targetId = -1;
  if (card.targetMode === 'single_other') {
    targetId = Number(intent.data.targetId);
    const validTargets = getValidTargets(authority.state.players, caster.id);
    if (!Number.isInteger(targetId) || !validTargets.some((target) => target.id === targetId)) {
      return { reason: `invalid target ${String(intent.data.targetId)} for ${cardId}.` };
    }
  } else if (card.targetMode === 'random_other') {
    const rngClone = { ...authority.state.rng };
    const target = pickRandomOtherTarget(
      authority.state.players,
      caster.id,
      createRandomSource(rngClone),
    );
    if (!target) return { reason: `${cardId} has no valid random target.` };
    targetId = target.id;
  }

  return {
    data: {
      cardId,
      targetId,
    },
  };
}

export function createHostAuthority(
  source: MatchState,
  runtime: HostAuthorityRuntime,
): HostAuthority {
  const cloned = cloneMatchState(source);
  const replay = replayMatchCommands(cloned, runtime.board, runtime.cards, runtime.news);

  if (replay.errors.length > 0 || replay.consumedCommands !== cloned.commandLog.length) {
    throw new Error(
      `Cannot create host authority from invalid command stream: ${replay.errors[0] ?? `${replay.consumedCommands}/${cloned.commandLog.length} commands consumed`}`,
    );
  }

  return {
    source: cloned,
    state: replay.state,
    runtime,
    receipts: new Map(),
  };
}

export function createEmptyHostAuthority(
  options: {
    boardId: string;
    startNodeId: number;
    playerNames: string[];
    seed: number;
    startingMoney?: number;
  },
  runtime: HostAuthorityRuntime,
): HostAuthority {
  const source = createInitialMatchState(options);
  return createHostAuthority(source, runtime);
}

/**
 * Convert a client intent into a host-stamped authoritative command.
 * The client never supplies turn/phase/revision/checksum or random outcomes.
 */
export function submitClientIntent(
  authority: HostAuthority,
  intent: ClientIntent,
): HostIntentReceipt {
  const duplicate = authority.receipts.get(intent.intentId);
  if (duplicate) return cloneReceipt(duplicate, 'duplicate');

  const envelopeError = validateIntentEnvelope(authority, intent);
  const phaseError = validateIntentPhase(authority, intent);
  const rejection = envelopeError ?? phaseError;
  if (rejection) {
    const result = receipt(authority, intent, 'rejected', { reason: rejection });
    authority.receipts.set(intent.intentId, result);
    return cloneReceipt(result);
  }

  let type: MatchCommandType;
  let data: Record<string, MatchEventValue> = {};

  if (intent.type === 'roll') {
    type = 'roll';
  } else if (intent.type === 'choose_branch') {
    type = 'choose_branch';
    const to = Number(intent.data.to);
    if (!Number.isInteger(to)) {
      const result = receipt(authority, intent, 'rejected', { reason: 'choose_branch requires integer `to`.' });
      authority.receipts.set(intent.intentId, result);
      return cloneReceipt(result);
    }
    data = { to };
  } else {
    type = 'play_card';
    const cardData = buildPlayCardData(authority, intent);
    if (!cardData.data) {
      const result = receipt(authority, intent, 'rejected', { reason: cardData.reason ?? 'invalid card intent.' });
      authority.receipts.set(intent.intentId, result);
      return cloneReceipt(result);
    }
    data = cardData.data;
  }

  const command = makeCommand(authority, type, intent.actorId, data);
  const candidateSource = sourceWithCommand(authority, command);
  const replay = replayCandidate(authority, candidateSource);

  if (!replay.accepted) {
    const result = receipt(authority, intent, 'rejected', { reason: replay.reason });
    authority.receipts.set(intent.intentId, result);
    return cloneReceipt(result);
  }

  commitCommand(authority, candidateSource, replay.state);
  const result = receipt(authority, intent, 'accepted', { command });
  authority.receipts.set(intent.intentId, result);
  return cloneReceipt(result);
}

export function hostAuthorityChecksum(authority: HostAuthority): string {
  return computeMatchChecksum(authority.state);
}

export function hostAuthorityCommandSeq(authority: HostAuthority): number {
  return hostCommandSeq(authority);
}
