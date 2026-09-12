import {
  hostAuthorityChecksum,
  hostAuthorityCommandSeq,
  submitClientIntent,
  type ClientIntent,
  type ClientIntentType,
  type HostAuthority,
  type HostIntentReceipt,
} from './authority';
import { computeMatchChecksum } from './checksum';
import {
  createAuthoritativeSnapshot,
  type HostSnapshotPacket,
} from './hostClient';
import type { LocalTransportAdapter, LocalTransportMessage } from './localTransport';
import {
  cloneMatchState,
  deserializeMatchState,
  serializeMatchState,
  type MatchEventValue,
  type MatchState,
} from './matchState';

export interface TwoTabJoinRequest {
  kind: 'join_request';
  roomCode: string;
  clientId: string;
  seatId: number;
}

export interface TwoTabJoinAccept {
  kind: 'join_accept';
  roomCode: string;
  clientId: string;
  seatId: number;
}

export interface TwoTabJoinReject {
  kind: 'join_reject';
  roomCode: string;
  clientId: string;
  reason: string;
}

export interface TwoTabIntentMessage {
  kind: 'intent';
  intent: ClientIntent;
}

export interface TwoTabReceiptMessage {
  kind: 'intent_receipt';
  receipt: HostIntentReceipt;
}

export interface TwoTabStateMessage {
  kind: 'state';
  commandSeq: number;
  checksum: string;
  serializedState: string;
}

export interface TwoTabSnapshotMessage {
  kind: 'snapshot';
  snapshot: HostSnapshotPacket;
}

export interface TwoTabResyncRequest {
  kind: 'resync_request';
  clientId: string;
  reason: string;
}

export type TwoTabMessage =
  | TwoTabJoinRequest
  | TwoTabJoinAccept
  | TwoTabJoinReject
  | TwoTabIntentMessage
  | TwoTabReceiptMessage
  | TwoTabStateMessage
  | TwoTabSnapshotMessage
  | TwoTabResyncRequest;

export interface TwoTabStateEvent {
  kind: 'state';
  state: MatchState;
  commandSeq: number;
  checksum: string;
  source: 'host' | 'state' | 'snapshot';
}

export interface TwoTabReceiptEvent {
  kind: 'receipt';
  receipt: HostIntentReceipt;
}

export interface TwoTabStatusEvent {
  kind: 'status';
  message: string;
  level: 'info' | 'success' | 'error';
}

export type TwoTabSessionEvent = TwoTabStateEvent | TwoTabReceiptEvent | TwoTabStatusEvent;
export type TwoTabSessionHandler = (event: TwoTabSessionEvent) => void;

function makeIntentId(clientId: string, serial: number): string {
  return `${clientId}-${Date.now().toString(36)}-${serial.toString(36)}`;
}

function cloneReceipt(receipt: HostIntentReceipt): HostIntentReceipt {
  return {
    ...receipt,
    command: receipt.command
      ? { ...receipt.command, data: { ...receipt.command.data } }
      : undefined,
  };
}

function makeSessionRejection(
  authority: HostAuthority,
  intentId: string,
  reason: string,
): HostIntentReceipt {
  return {
    intentId,
    status: 'rejected',
    hostCommandSeq: hostAuthorityCommandSeq(authority),
    checksum: hostAuthorityChecksum(authority),
    phase: authority.state.turn.phase,
    reason,
  };
}

function decodeState(
  serializedState: string,
  expectedChecksum: string,
): MatchState {
  const state = deserializeMatchState(serializedState);
  const checksum = computeMatchChecksum(state);
  if (checksum !== expectedChecksum) {
    throw new Error(`State checksum mismatch: packet ${expectedChecksum}, decoded ${checksum}.`);
  }
  return state;
}

abstract class TwoTabEventSource {
  protected readonly handlers = new Set<TwoTabSessionHandler>();

  subscribe(handler: TwoTabSessionHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  protected emit(event: TwoTabSessionEvent): void {
    for (const handler of this.handlers) handler(event);
  }
}

export class TwoTabHostSession extends TwoTabEventSource {
  readonly authority: HostAuthority;
  readonly roomCode: string;
  readonly transport: LocalTransportAdapter<TwoTabMessage>;
  private readonly seatClaims = new Map<number, string>();
  private readonly clientSeats = new Map<string, number>();
  private unsubscribeTransport?: () => void;
  private intentSerial = 0;

  constructor(
    roomCode: string,
    authority: HostAuthority,
    transport: LocalTransportAdapter<TwoTabMessage>,
  ) {
    super();
    this.roomCode = roomCode;
    this.authority = authority;
    this.transport = transport;
  }

  start(): void {
    if (this.unsubscribeTransport) return;
    this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    this.emit({
      kind: 'status',
      message: `HOST phòng ${this.roomCode} sẵn sàng.`,
      level: 'success',
    });
    this.emitCurrentState('host');
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.transport.close();
    this.handlers.clear();
  }

  controlsActor(actorId: number): boolean {
    return !this.seatClaims.has(actorId);
  }

  claimedSeatForClient(clientId: string): number | undefined {
    return this.clientSeats.get(clientId);
  }

  submitLocalIntent(
    type: ClientIntentType,
    actorId: number,
    data: Record<string, MatchEventValue> = {},
  ): HostIntentReceipt {
    this.intentSerial += 1;
    const intent: ClientIntent = {
      intentId: makeIntentId(this.transport.endpointId, this.intentSerial),
      clientId: this.transport.endpointId,
      actorId,
      type,
      observedCommandSeq: hostAuthorityCommandSeq(this.authority),
      data: { ...data },
    };

    if (!this.controlsActor(actorId)) {
      const result = makeSessionRejection(
        this.authority,
        intent.intentId,
        `P${actorId + 1} đang được điều khiển bởi tab client khác.`,
      );
      this.emit({ kind: 'receipt', receipt: result });
      return result;
    }

    return this.processIntent(intent);
  }

  private processIntent(intent: ClientIntent, replyTo?: string): HostIntentReceipt {
    const result = submitClientIntent(this.authority, intent);
    if (replyTo) {
      this.transport.send({ kind: 'intent_receipt', receipt: cloneReceipt(result) }, replyTo);
    }
    this.emit({ kind: 'receipt', receipt: cloneReceipt(result) });

    if (result.status === 'accepted') {
      this.broadcastState();
      this.broadcastSnapshotIfSafe();
    } else if (result.status === 'rejected' && replyTo) {
      this.sendState(replyTo);
      this.sendSnapshotIfSafe(replyTo);
    }

    return result;
  }

  private handleMessage(message: LocalTransportMessage<TwoTabMessage>): void {
    const payload = message.payload;

    if (payload.kind === 'join_request') {
      this.handleJoinRequest(message.from, payload);
      return;
    }

    if (payload.kind === 'intent') {
      const intent = payload.intent;
      const claimedSeat = this.clientSeats.get(intent.clientId);
      if (message.from !== intent.clientId || claimedSeat === undefined || claimedSeat !== intent.actorId) {
        const result = makeSessionRejection(
          this.authority,
          intent.intentId,
          'Client endpoint/seat claim does not match intent actor.',
        );
        this.transport.send({ kind: 'intent_receipt', receipt: result }, message.from);
        this.emit({ kind: 'receipt', receipt: result });
        return;
      }
      this.processIntent(intent, message.from);
      return;
    }

    if (payload.kind === 'resync_request') {
      if (payload.clientId !== message.from) return;
      this.emit({
        kind: 'status',
        message: `Client ${message.from} yêu cầu resync: ${payload.reason}`,
        level: 'info',
      });
      this.sendState(message.from);
      this.sendSnapshotIfSafe(message.from);
    }
  }

  private handleJoinRequest(from: string, request: TwoTabJoinRequest): void {
    if (request.roomCode !== this.roomCode || request.clientId !== from) return;
    if (!Number.isInteger(request.seatId) || request.seatId < 1 || request.seatId > 3) {
      this.transport.send(
        {
          kind: 'join_reject',
          roomCode: this.roomCode,
          clientId: request.clientId,
          reason: 'Seat phải là P2, P3 hoặc P4 trong PoC hai tab.',
        },
        from,
      );
      return;
    }

    const existingClientSeat = this.clientSeats.get(request.clientId);
    const existingSeatOwner = this.seatClaims.get(request.seatId);
    if (
      (existingClientSeat !== undefined && existingClientSeat !== request.seatId) ||
      (existingSeatOwner !== undefined && existingSeatOwner !== request.clientId)
    ) {
      this.transport.send(
        {
          kind: 'join_reject',
          roomCode: this.roomCode,
          clientId: request.clientId,
          reason: `P${request.seatId + 1} đã được tab khác giữ chỗ.`,
        },
        from,
      );
      return;
    }

    this.clientSeats.set(request.clientId, request.seatId);
    this.seatClaims.set(request.seatId, request.clientId);
    this.transport.send(
      {
        kind: 'join_accept',
        roomCode: this.roomCode,
        clientId: request.clientId,
        seatId: request.seatId,
      },
      from,
    );
    this.sendState(from);
    this.sendSnapshotIfSafe(from);
    this.emit({
      kind: 'status',
      message: `${request.clientId} đã vào phòng và giữ P${request.seatId + 1}.`,
      level: 'success',
    });
  }

  private stateMessage(): TwoTabStateMessage {
    return {
      kind: 'state',
      commandSeq: hostAuthorityCommandSeq(this.authority),
      checksum: hostAuthorityChecksum(this.authority),
      serializedState: serializeMatchState(this.authority.state),
    };
  }

  private sendState(to: string): void {
    this.transport.send(this.stateMessage(), to);
  }

  private broadcastState(): void {
    this.transport.send(this.stateMessage());
    this.emitCurrentState('host');
  }

  private emitCurrentState(source: TwoTabStateEvent['source']): void {
    this.emit({
      kind: 'state',
      state: cloneMatchState(this.authority.state),
      commandSeq: hostAuthorityCommandSeq(this.authority),
      checksum: hostAuthorityChecksum(this.authority),
      source,
    });
  }

  private createSafeSnapshot(): HostSnapshotPacket | undefined {
    if (this.authority.state.turn.phase !== 'PRE_ROLL_ACTION') return undefined;
    try {
      return createAuthoritativeSnapshot(
        this.authority.source,
        hostAuthorityCommandSeq(this.authority),
        this.authority.runtime,
      );
    } catch {
      return undefined;
    }
  }

  private sendSnapshotIfSafe(to: string): void {
    const snapshot = this.createSafeSnapshot();
    if (snapshot) this.transport.send({ kind: 'snapshot', snapshot }, to);
  }

  private broadcastSnapshotIfSafe(): void {
    const snapshot = this.createSafeSnapshot();
    if (snapshot) this.transport.send({ kind: 'snapshot', snapshot });
  }
}

export class TwoTabClientSession extends TwoTabEventSource {
  readonly roomCode: string;
  readonly clientId: string;
  readonly seatId: number;
  readonly transport: LocalTransportAdapter<TwoTabMessage>;
  joined = false;
  observedCommandSeq = 0;
  state?: MatchState;
  private unsubscribeTransport?: () => void;
  private intentSerial = 0;

  constructor(
    roomCode: string,
    clientId: string,
    seatId: number,
    transport: LocalTransportAdapter<TwoTabMessage>,
  ) {
    super();
    this.roomCode = roomCode;
    this.clientId = clientId;
    this.seatId = seatId;
    this.transport = transport;
  }

  start(): void {
    if (this.unsubscribeTransport) return;
    this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    this.transport.send(
      {
        kind: 'join_request',
        roomCode: this.roomCode,
        clientId: this.clientId,
        seatId: this.seatId,
      },
      'host',
    );
    this.emit({
      kind: 'status',
      message: `Đang xin vào phòng ${this.roomCode} với P${this.seatId + 1}...`,
      level: 'info',
    });
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.transport.close();
    this.handlers.clear();
  }

  controlsActor(actorId: number): boolean {
    return this.joined && actorId === this.seatId;
  }

  submitIntent(
    type: ClientIntentType,
    data: Record<string, MatchEventValue> = {},
  ): ClientIntent {
    if (!this.joined) throw new Error('Client chưa join host.');
    this.intentSerial += 1;
    const intent: ClientIntent = {
      intentId: makeIntentId(this.clientId, this.intentSerial),
      clientId: this.clientId,
      actorId: this.seatId,
      type,
      observedCommandSeq: this.observedCommandSeq,
      data: { ...data },
    };
    this.transport.send({ kind: 'intent', intent }, 'host');
    return intent;
  }

  requestResync(reason: string): void {
    this.transport.send(
      { kind: 'resync_request', clientId: this.clientId, reason },
      'host',
    );
  }

  private handleMessage(message: LocalTransportMessage<TwoTabMessage>): void {
    if (message.from !== 'host') return;
    const payload = message.payload;

    if (payload.kind === 'join_accept' && payload.clientId === this.clientId) {
      this.joined = true;
      this.emit({
        kind: 'status',
        message: `Đã vào phòng ${payload.roomCode} với P${payload.seatId + 1}.`,
        level: 'success',
      });
      return;
    }

    if (payload.kind === 'join_reject' && payload.clientId === this.clientId) {
      this.joined = false;
      this.emit({ kind: 'status', message: payload.reason, level: 'error' });
      return;
    }

    if (payload.kind === 'intent_receipt') {
      this.emit({ kind: 'receipt', receipt: cloneReceipt(payload.receipt) });
      if (payload.receipt.status === 'rejected' && payload.receipt.reason?.includes('stale client view')) {
        this.requestResync(payload.receipt.reason);
      }
      return;
    }

    if (payload.kind === 'state') {
      try {
        const state = decodeState(payload.serializedState, payload.checksum);
        this.state = state;
        this.observedCommandSeq = payload.commandSeq;
        this.emit({
          kind: 'state',
          state: cloneMatchState(state),
          commandSeq: payload.commandSeq,
          checksum: payload.checksum,
          source: 'state',
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.emit({ kind: 'status', message: reason, level: 'error' });
        this.requestResync(reason);
      }
      return;
    }

    if (payload.kind === 'snapshot') {
      try {
        const state = decodeState(payload.snapshot.serializedState, payload.snapshot.checksum);
        const lastSeq = state.commandLog.at(-1)?.seq ?? 0;
        if (lastSeq !== payload.snapshot.throughSeq) {
          throw new Error(
            `Snapshot boundary mismatch: packet #${payload.snapshot.throughSeq}, state #${lastSeq}.`,
          );
        }
        this.state = state;
        this.observedCommandSeq = payload.snapshot.throughSeq;
        this.emit({
          kind: 'state',
          state: cloneMatchState(state),
          commandSeq: payload.snapshot.throughSeq,
          checksum: payload.snapshot.checksum,
          source: 'snapshot',
        });
      } catch (error) {
        const reason = error instanceof Error ? error.message : String(error);
        this.emit({ kind: 'status', message: reason, level: 'error' });
      }
    }
  }
}
