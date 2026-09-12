import type { CardDefinition } from './cards';
import { computeMatchChecksum } from './checksum';
import {
  cloneMatchState,
  createInitialMatchState,
  deserializeMatchState,
  serializeMatchState,
  type MatchCommand,
  type MatchState,
} from './matchState';
import type { NewsDefinition } from './news';
import { replayMatchCommands } from './replay';
import type { BoardDefinition } from './types';

export interface HostCommandPacket {
  packetId: string;
  deliverAt: number;
  command: MatchCommand;
}

export interface HostSnapshotPacket {
  throughSeq: number;
  checksum: string;
  serializedState: string;
}

export type HostCommandReceiptStatus =
  | 'buffered'
  | 'applied'
  | 'waiting_dependency'
  | 'duplicate'
  | 'rejected';

export interface HostCommandReceipt {
  packetId: string;
  commandSeq: number;
  status: HostCommandReceiptStatus;
  ackSeq: number;
  appliedSeq: number;
  message?: string;
}

export interface HostClientPeer {
  state: MatchState;
  ackSeq: number;
  appliedSeq: number;
  pending: Map<number, MatchCommand>;
  accepted: Map<number, MatchCommand>;
  duplicatePackets: number;
  outOfOrderPackets: number;
  staleRejected: number;
  resyncRequested: boolean;
  resyncCount: number;
  errors: string[];
}

export interface HostClientRuntime {
  board: BoardDefinition;
  cards: CardDefinition[];
  news: NewsDefinition[];
}

function cloneCommand(command: MatchCommand): MatchCommand {
  return {
    ...command,
    data: { ...command.data },
  };
}

function stableCommandFingerprint(command: MatchCommand): string {
  const data = Object.fromEntries(
    Object.entries(command.data).sort(([left], [right]) => left.localeCompare(right)),
  );

  return JSON.stringify({
    seq: command.seq,
    type: command.type,
    turnNumber: command.turnNumber,
    playerIndex: command.playerIndex,
    actorId: command.actorId,
    phase: command.phase ?? null,
    revision: command.revision ?? null,
    preChecksum: command.preChecksum ?? null,
    data,
  });
}

function sameCommand(left: MatchCommand | undefined, right: MatchCommand): boolean {
  return left !== undefined && stableCommandFingerprint(left) === stableCommandFingerprint(right);
}

function commandList(peer: HostClientPeer): MatchCommand[] {
  return [...peer.accepted.values()]
    .sort((left, right) => left.seq - right.seq)
    .map(cloneCommand);
}

function createReplaySource(peer: HostClientPeer): MatchState {
  const source = createInitialMatchState({
    boardId: peer.state.boardId,
    startNodeId: peer.state.players[0]?.nodeId ?? 0,
    playerNames: peer.state.players.map((player) => player.name),
    seed: peer.state.seed,
    startingMoney: peer.state.startingMoney,
  });

  source.commandLog = commandList(peer);
  source.nextCommandSeq = source.commandLog.length + 1;
  return source;
}

function isTailDependencyWait(message: string | undefined): boolean {
  return Boolean(message?.includes('missing branch choice'));
}

function tryApplyAcceptedCommands(
  peer: HostClientPeer,
  runtime: HostClientRuntime,
): HostCommandReceiptStatus {
  if (peer.ackSeq === peer.appliedSeq) return 'applied';

  const source = createReplaySource(peer);
  const replay = replayMatchCommands(source, runtime.board, runtime.cards, runtime.news);

  if (replay.errors.length > 0) {
    if (isTailDependencyWait(replay.errors[0])) {
      return 'waiting_dependency';
    }

    peer.resyncRequested = true;
    peer.errors.push(replay.errors[0]);
    return 'rejected';
  }

  if (replay.consumedCommands !== source.commandLog.length) {
    peer.resyncRequested = true;
    peer.errors.push(
      `Client replay consumed ${replay.consumedCommands}/${source.commandLog.length} accepted commands.`,
    );
    return 'rejected';
  }

  peer.state = replay.state;
  peer.appliedSeq = peer.ackSeq;
  return 'applied';
}

function rejectPacket(
  peer: HostClientPeer,
  packet: HostCommandPacket,
  message: string,
): HostCommandReceipt {
  peer.staleRejected += 1;
  peer.resyncRequested = true;
  peer.errors.push(message);
  return {
    packetId: packet.packetId,
    commandSeq: packet.command.seq,
    status: 'rejected',
    ackSeq: peer.ackSeq,
    appliedSeq: peer.appliedSeq,
    message,
  };
}

export function createHostClientPeer(authority: MatchState, startNodeId: number): HostClientPeer {
  return {
    state: createInitialMatchState({
      boardId: authority.boardId,
      startNodeId,
      playerNames: authority.players.map((player) => player.name),
      seed: authority.seed,
      startingMoney: authority.startingMoney,
    }),
    ackSeq: 0,
    appliedSeq: 0,
    pending: new Map(),
    accepted: new Map(),
    duplicatePackets: 0,
    outOfOrderPackets: 0,
    staleRejected: 0,
    resyncRequested: false,
    resyncCount: 0,
    errors: [],
  };
}

/**
 * Receive one authoritative host command. Delivery may be duplicated or out of order.
 * ACK means the highest contiguous command sequence received. appliedSeq means the highest
 * replay-safe sequence already reflected in client gameplay state.
 */
export function receiveHostCommand(
  peer: HostClientPeer,
  packet: HostCommandPacket,
  runtime: HostClientRuntime,
): HostCommandReceipt {
  const command = packet.command;

  if (!Number.isInteger(command.seq) || command.seq <= 0) {
    return rejectPacket(peer, packet, `Invalid command sequence ${String(command.seq)}.`);
  }

  if (command.seq <= peer.ackSeq) {
    const accepted = peer.accepted.get(command.seq);
    if (sameCommand(accepted, command)) {
      peer.duplicatePackets += 1;
      return {
        packetId: packet.packetId,
        commandSeq: command.seq,
        status: 'duplicate',
        ackSeq: peer.ackSeq,
        appliedSeq: peer.appliedSeq,
      };
    }

    return rejectPacket(
      peer,
      packet,
      `Stale/conflicting command #${command.seq} does not match the already ACKed authority command.`,
    );
  }

  const existingPending = peer.pending.get(command.seq);
  if (existingPending) {
    if (sameCommand(existingPending, command)) {
      peer.duplicatePackets += 1;
      return {
        packetId: packet.packetId,
        commandSeq: command.seq,
        status: 'duplicate',
        ackSeq: peer.ackSeq,
        appliedSeq: peer.appliedSeq,
      };
    }

    return rejectPacket(
      peer,
      packet,
      `Conflicting buffered command #${command.seq} arrived before ACK.`,
    );
  }

  if (command.seq > peer.ackSeq + 1) {
    peer.outOfOrderPackets += 1;
  }

  peer.pending.set(command.seq, cloneCommand(command));

  let drained = false;
  while (peer.pending.has(peer.ackSeq + 1)) {
    const nextSeq = peer.ackSeq + 1;
    const next = peer.pending.get(nextSeq);
    if (!next) break;
    peer.pending.delete(nextSeq);
    peer.accepted.set(nextSeq, next);
    peer.ackSeq = nextSeq;
    drained = true;
  }

  if (!drained) {
    return {
      packetId: packet.packetId,
      commandSeq: command.seq,
      status: 'buffered',
      ackSeq: peer.ackSeq,
      appliedSeq: peer.appliedSeq,
    };
  }

  const status = tryApplyAcceptedCommands(peer, runtime);
  return {
    packetId: packet.packetId,
    commandSeq: command.seq,
    status,
    ackSeq: peer.ackSeq,
    appliedSeq: peer.appliedSeq,
    message: status === 'rejected' ? peer.errors.at(-1) : undefined,
  };
}

export function deliverHostPackets(
  peer: HostClientPeer,
  packets: HostCommandPacket[],
  runtime: HostClientRuntime,
): HostCommandReceipt[] {
  return [...packets]
    .sort((left, right) => left.deliverAt - right.deliverAt || left.packetId.localeCompare(right.packetId))
    .map((packet) => receiveHostCommand(peer, packet, runtime));
}

export function createAuthoritativeSnapshot(
  authority: MatchState,
  throughSeq: number,
  runtime: HostClientRuntime,
): HostSnapshotPacket {
  const source = cloneMatchState(authority);
  source.commandLog = source.commandLog
    .filter((command) => command.seq <= throughSeq)
    .sort((left, right) => left.seq - right.seq)
    .map(cloneCommand);
  source.nextCommandSeq = source.commandLog.length + 1;

  const replay = replayMatchCommands(source, runtime.board, runtime.cards, runtime.news);
  if (replay.errors.length > 0 || replay.consumedCommands !== source.commandLog.length) {
    throw new Error(
      `Cannot create authoritative snapshot through #${throughSeq}: ${replay.errors[0] ?? `${replay.consumedCommands}/${source.commandLog.length} commands consumed`}`,
    );
  }

  const state = replay.state;
  const lastSeq = state.commandLog.at(-1)?.seq ?? 0;
  if (lastSeq !== throughSeq) {
    throw new Error(`Snapshot requested through #${throughSeq}, but replay ended at #${lastSeq}.`);
  }

  return {
    throughSeq,
    checksum: computeMatchChecksum(state),
    serializedState: serializeMatchState(state),
  };
}

/** Apply a host-authoritative gameplay snapshot and discard any buffered packet already covered by it. */
export function applyAuthoritativeSnapshot(
  peer: HostClientPeer,
  snapshot: HostSnapshotPacket,
): void {
  const restored = deserializeMatchState(snapshot.serializedState);
  const checksum = computeMatchChecksum(restored);
  if (checksum !== snapshot.checksum) {
    throw new Error(
      `Snapshot checksum mismatch through #${snapshot.throughSeq}: packet ${snapshot.checksum}, restored ${checksum}.`,
    );
  }

  const lastSeq = restored.commandLog.at(-1)?.seq ?? 0;
  if (lastSeq !== snapshot.throughSeq) {
    throw new Error(
      `Snapshot command boundary mismatch: packet #${snapshot.throughSeq}, state #${lastSeq}.`,
    );
  }

  peer.state = restored;
  peer.ackSeq = snapshot.throughSeq;
  peer.appliedSeq = snapshot.throughSeq;
  peer.accepted.clear();
  for (const command of restored.commandLog) {
    peer.accepted.set(command.seq, cloneCommand(command));
  }
  for (const seq of [...peer.pending.keys()]) {
    if (seq <= snapshot.throughSeq) peer.pending.delete(seq);
  }
  peer.resyncRequested = false;
  peer.resyncCount += 1;
}

export function clientMatchesSnapshot(peer: HostClientPeer, snapshot: HostSnapshotPacket): boolean {
  return peer.appliedSeq === snapshot.throughSeq && computeMatchChecksum(peer.state) === snapshot.checksum;
}

export function clientGameplayChecksum(peer: HostClientPeer): string {
  return computeMatchChecksum(peer.state);
}
