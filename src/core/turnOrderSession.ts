import type { LocalTransportAdapter, LocalTransportMessage } from './localTransport';
import { getStarterCharacterV01 } from '../content/core/characters_starter_v01';
import { SECRET_BABY_CHARACTER_ID } from '../content/core/character_secret_baby_v01';

export interface TurnOrderPrompt {
  promptId: string;
  playerId: number;
  depth: number;
  reroll: boolean;
}

export type TurnOrderFaceExpression07042 = 'neutral' | 'happy' | 'angry';

export type TurnOrderCharacterChoiceCh02c =
  | { mode: 'fixed'; characterId: string }
  | { mode: 'random' };

export interface TurnOrderCharacterAssignmentCh02c {
  playerId: number;
  characterId: string;
  source: 'fixed' | 'random';
}

export interface TurnOrderProfileWire07042 {
  seatId: number;
  name: string;
  faces: Partial<Record<TurnOrderFaceExpression07042, string>>;
  characterChoice?: TurnOrderCharacterChoiceCh02c;
}

function normalizeProfile07042(
  profile: TurnOrderProfileWire07042 | undefined,
  expectedSeatId: number,
): TurnOrderProfileWire07042 | undefined {
  if (!profile || profile.seatId !== expectedSeatId || expectedSeatId < 0 || expectedSeatId > 3) return undefined;
  const name = profile.name.trim().slice(0, 18) || `Player ${expectedSeatId + 1}`;
  const faces: Partial<Record<TurnOrderFaceExpression07042, string>> = {};
  for (const key of ['neutral', 'happy', 'angry'] as const) {
    const value = profile.faces?.[key];
    if (typeof value !== 'string') continue;
    if (!value.startsWith('data:image/') || value.length > 220_000) continue;
    faces[key] = value;
  }
  let characterChoice: TurnOrderCharacterChoiceCh02c | undefined;
  if (profile.characterChoice?.mode === 'random') {
    characterChoice = { mode: 'random' };
  } else if (
    profile.characterChoice?.mode === 'fixed'
    && typeof profile.characterChoice.characterId === 'string'
    && getStarterCharacterV01(profile.characterChoice.characterId)
  ) {
    characterChoice = { mode: 'fixed', characterId: profile.characterChoice.characterId };
  }
  return { seatId: expectedSeatId, name, faces, ...(characterChoice ? { characterChoice } : {}) };
}

export type TurnOrderMessage =
  | { kind: 'join_request'; roomCode: string; clientId: string; seatId: number; profile?: TurnOrderProfileWire07042 }
  | { kind: 'join_accept'; roomCode: string; clientId: string; seatId: number }
  | { kind: 'join_reject'; roomCode: string; clientId: string; reason: string }
  | { kind: 'profile_sync'; roomCode: string; playerNames: string[] }
  | { kind: 'profile_update'; roomCode: string; profile: TurnOrderProfileWire07042 }
  | { kind: 'roll_prompt'; roomCode: string; prompt: TurnOrderPrompt }
  | { kind: 'roll_request'; roomCode: string; clientId: string; seatId: number; promptId: string }
  | { kind: 'roll_result'; roomCode: string; promptId: string; playerId: number; value: number }
  | { kind: 'roll_reject'; roomCode: string; clientId: string; promptId: string; reason: string }
  | { kind: 'tie_group'; roomCode: string; playerIds: number[]; value: number }
  | { kind: 'final_order'; roomCode: string; order: number[] }
  | { kind: 'character_reveal'; roomCode: string; assignments: TurnOrderCharacterAssignmentCh02c[] }
  | { kind: 'start_match'; roomCode: string };

export type TurnOrderEvent =
  | { kind: 'status'; message: string; level: 'info' | 'success' | 'error' }
  | { kind: 'profile_sync'; playerNames: string[] }
  | { kind: 'profile_update'; profile: TurnOrderProfileWire07042 }
  | { kind: 'prompt'; prompt: TurnOrderPrompt }
  | { kind: 'result'; promptId: string; playerId: number; value: number }
  | { kind: 'tie_group'; playerIds: number[]; value: number }
  | { kind: 'final_order'; order: number[] }
  | { kind: 'character_reveal'; assignments: TurnOrderCharacterAssignmentCh02c[] }
  | { kind: 'start_match' };

export type TurnOrderEventHandler = (event: TurnOrderEvent) => void;

export interface HostTurnOrderPromptHandle {
  prompt: TurnOrderPrompt;
  remote: boolean;
  result?: Promise<number>;
}

type ActiveHostPrompt = {
  prompt: TurnOrderPrompt;
  ownerClientId?: string;
  resolve?: (value: number) => void;
};

function defaultD6(): number {
  if (typeof crypto !== 'undefined' && typeof crypto.getRandomValues === 'function') {
    const value = new Uint32Array(1);
    crypto.getRandomValues(value);
    return Math.floor((value[0]! / 0x100000000) * 6) + 1;
  }
  return Math.floor(Math.random() * 6) + 1;
}

function validSeat(seatId: number): boolean {
  return Number.isInteger(seatId) && seatId >= 1 && seatId <= 3;
}

function validD6(value: number): boolean {
  return Number.isInteger(value) && value >= 1 && value <= 6;
}

function validOrder(order: readonly number[], playerCount: number): boolean {
  if (order.length !== playerCount) return false;
  const expected = Array.from({ length: playerCount }, (_, index) => index);
  const unique = new Set(order);
  return unique.size === playerCount && expected.every((id) => unique.has(id));
}

abstract class TurnOrderEventSource {
  protected readonly handlers = new Set<TurnOrderEventHandler>();

  subscribe(handler: TurnOrderEventHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  protected emit(event: TurnOrderEvent): void {
    for (const handler of this.handlers) handler(event);
  }
}

export class TurnOrderHostSession extends TurnOrderEventSource {
  readonly roomCode: string;
  readonly transport: LocalTransportAdapter<TurnOrderMessage>;
  private readonly playerNames: string[];
  private readonly rollD6: () => number;
  private readonly seatClaims = new Map<number, string>();
  private readonly clientSeats = new Map<string, number>();
  private readonly profiles = new Map<number, TurnOrderProfileWire07042>();
  private readonly claimWaiters = new Set<() => void>();
  private unsubscribeTransport?: () => void;
  private promptSerial = 0;
  private activePrompt?: ActiveHostPrompt;
  private claimsLocked = false;

  constructor(
    roomCode: string,
    playerNames: readonly string[],
    transport: LocalTransportAdapter<TurnOrderMessage>,
    rollD6: () => number = defaultD6,
  ) {
    super();
    this.roomCode = roomCode;
    this.playerNames = playerNames.map((name, index) => name.trim() || `Player ${index + 1}`);
    this.transport = transport;
    this.rollD6 = rollD6;
    this.playerNames.forEach((name, seatId) => {
      this.profiles.set(seatId, { seatId, name, faces: {} });
    });
  }

  setInitialProfiles07042(profiles: readonly TurnOrderProfileWire07042[]): void {
    for (const profile of profiles) {
      const normalized = normalizeProfile07042(profile, profile.seatId);
      if (!normalized) continue;
      this.profiles.set(normalized.seatId, normalized);
      this.playerNames[normalized.seatId] = normalized.name;
    }
  }

  start(): void {
    if (this.unsubscribeTransport) return;
    this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    this.emit({ kind: 'status', message: `ROLL HOST ${this.roomCode} sẵn sàng.`, level: 'success' });
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.activePrompt = undefined;
    this.claimWaiters.clear();
    this.transport.close();
    this.handlers.clear();
  }

  get claimedSeatIds(): number[] {
    return [...this.seatClaims.keys()].sort((a, b) => a - b);
  }

  hasRemoteSeat(seatId: number): boolean {
    return this.seatClaims.has(seatId);
  }

  waitForRemoteClaim(): Promise<void> {
    if (this.seatClaims.size > 0) return Promise.resolve();
    return new Promise((resolve) => this.claimWaiters.add(resolve));
  }

  waitForRemoteSeats07042(seatIds: readonly number[]): Promise<void> {
    const expected = [...new Set(seatIds.filter(validSeat))];
    if (expected.every((seatId) => this.seatClaims.has(seatId))) return Promise.resolve();
    return new Promise((resolve) => {
      const check = () => {
        if (!expected.every((seatId) => this.seatClaims.has(seatId))) return;
        this.claimWaiters.delete(check);
        resolve();
      };
      this.claimWaiters.add(check);
    });
  }

  lockClaims(): void {
    this.claimsLocked = true;
    const seats = this.claimedSeatIds.map((seatId) => `P${seatId + 1}`).join(', ');
    this.emit({
      kind: 'status',
      message: seats ? `Đã khóa ghế remote: ${seats}.` : 'Không có ghế remote để khóa.',
      level: 'info',
    });
  }

  beginPrompt(playerId: number, depth: number, reroll: boolean): HostTurnOrderPromptHandle {
    if (this.activePrompt) throw new Error(`Turn-order prompt ${this.activePrompt.prompt.promptId} is still active.`);
    this.promptSerial += 1;
    const prompt: TurnOrderPrompt = {
      promptId: `order-${this.promptSerial}`,
      playerId,
      depth,
      reroll,
    };
    const ownerClientId = this.seatClaims.get(playerId);
    let result: Promise<number> | undefined;
    let resolver: ((value: number) => void) | undefined;
    if (ownerClientId) result = new Promise((resolve) => { resolver = resolve; });

    this.activePrompt = { prompt, ownerClientId, resolve: resolver };
    this.transport.send({ kind: 'roll_prompt', roomCode: this.roomCode, prompt });
    this.emit({ kind: 'prompt', prompt });
    return { prompt, remote: Boolean(ownerClientId), ...(result ? { result } : {}) };
  }

  resolveHostOwnedPrompt(promptId: string): number {
    const active = this.activePrompt;
    if (!active || active.prompt.promptId !== promptId) throw new Error('Turn-order prompt is no longer active.');
    if (active.ownerClientId) throw new Error(`P${active.prompt.playerId + 1} is remote-owned for this prompt.`);
    const value = this.nextD6();
    this.finishPrompt(active, value);
    return value;
  }

  announceTie(playerIds: readonly number[], value: number): void {
    const normalized = playerIds.map((id) => Math.floor(id));
    this.transport.send({ kind: 'tie_group', roomCode: this.roomCode, playerIds: normalized, value });
    this.emit({ kind: 'tie_group', playerIds: normalized, value });
  }

  finalizeOrder(order: readonly number[]): void {
    if (!validOrder(order, this.playerNames.length)) throw new Error(`Invalid final play order: ${order.join(',')}`);
    const normalized = [...order];
    this.transport.send({ kind: 'final_order', roomCode: this.roomCode, order: normalized });
    this.emit({ kind: 'final_order', order: normalized });
  }

  revealCharactersCh02c(assignments: readonly TurnOrderCharacterAssignmentCh02c[]): void {
    const playerIds = assignments.map((assignment) => assignment.playerId);
    if (
      assignments.length !== this.playerNames.length
      || new Set(playerIds).size !== this.playerNames.length
      || !this.playerNames.every((_, playerId) => playerIds.includes(playerId))
    ) {
      throw new Error('Character reveal must assign exactly one Character to every player.');
    }
    const normalized = assignments.map((assignment) => {
      const validCharacter = Boolean(getStarterCharacterV01(assignment.characterId))
        || assignment.characterId === SECRET_BABY_CHARACTER_ID;
      if (!validCharacter) throw new Error(`Unknown Character reveal id: ${assignment.characterId}`);
      if (assignment.source === 'fixed' && assignment.characterId === SECRET_BABY_CHARACTER_ID) {
        throw new Error('Secret Baby cannot be directly fixed-selected.');
      }
      return { ...assignment };
    }).sort((a, b) => a.playerId - b.playerId);
    this.transport.send({ kind: 'character_reveal', roomCode: this.roomCode, assignments: normalized });
    this.emit({ kind: 'character_reveal', assignments: normalized });
  }

  startMatch(): void {
    this.transport.send({ kind: 'start_match', roomCode: this.roomCode });
    this.emit({ kind: 'start_match' });
  }

  private nextD6(): number {
    const value = this.rollD6();
    if (!validD6(value)) throw new Error(`Host turn-order D6 returned invalid value ${value}.`);
    return value;
  }

  private finishPrompt(active: ActiveHostPrompt, value: number): void {
    if (this.activePrompt !== active) return;
    this.transport.send({
      kind: 'roll_result',
      roomCode: this.roomCode,
      promptId: active.prompt.promptId,
      playerId: active.prompt.playerId,
      value,
    });
    this.emit({
      kind: 'result',
      promptId: active.prompt.promptId,
      playerId: active.prompt.playerId,
      value,
    });
    this.activePrompt = undefined;
    active.resolve?.(value);
  }

  private rejectRoll(to: string, clientId: string, promptId: string, reason: string): void {
    this.transport.send({
      kind: 'roll_reject',
      roomCode: this.roomCode,
      clientId,
      promptId,
      reason,
    }, to);
  }

  private handleMessage(message: LocalTransportMessage<TurnOrderMessage>): void {
    const payload = message.payload;
    if ('roomCode' in payload && payload.roomCode !== this.roomCode) return;

    if (payload.kind === 'join_request') {
      this.handleJoin(message.from, payload.clientId, payload.seatId, payload.profile);
      return;
    }

    if (payload.kind !== 'roll_request') return;
    const active = this.activePrompt;
    if (
      payload.clientId !== message.from ||
      this.clientSeats.get(payload.clientId) !== payload.seatId ||
      !active ||
      active.prompt.promptId !== payload.promptId ||
      active.prompt.playerId !== payload.seatId ||
      active.ownerClientId !== payload.clientId
    ) {
      this.rejectRoll(message.from, payload.clientId, payload.promptId, 'Roll request không khớp prompt/ghế remote đang active.');
      return;
    }

    const value = this.nextD6();
    this.finishPrompt(active, value);
  }

  private handleJoin(
    from: string,
    clientId: string,
    seatId: number,
    profile?: TurnOrderProfileWire07042,
  ): void {
    if (clientId !== from || !validSeat(seatId)) return;
    if (this.claimsLocked) {
      this.transport.send({
        kind: 'join_reject',
        roomCode: this.roomCode,
        clientId,
        reason: 'Roll For Order đã bắt đầu; ghế remote đã khóa.',
      }, from);
      return;
    }

    const existingClientSeat = this.clientSeats.get(clientId);
    const existingSeatOwner = this.seatClaims.get(seatId);
    if (
      (existingClientSeat !== undefined && existingClientSeat !== seatId) ||
      (existingSeatOwner !== undefined && existingSeatOwner !== clientId)
    ) {
      this.transport.send({
        kind: 'join_reject',
        roomCode: this.roomCode,
        clientId,
        reason: `P${seatId + 1} đã được tab khác giữ cho Roll For Order.`,
      }, from);
      return;
    }

    this.clientSeats.set(clientId, seatId);
    this.seatClaims.set(seatId, clientId);

    const normalizedProfile = normalizeProfile07042(profile, seatId);
    if (normalizedProfile) {
      this.profiles.set(seatId, normalizedProfile);
      this.playerNames[seatId] = normalizedProfile.name;
      this.emit({ kind: 'profile_update', profile: normalizedProfile });
    }

    this.transport.send({ kind: 'join_accept', roomCode: this.roomCode, clientId, seatId }, from);
    this.transport.send({ kind: 'profile_sync', roomCode: this.roomCode, playerNames: [...this.playerNames] });

    // New client receives every profile already known; everyone receives the newly joined profile.
    for (const known of this.profiles.values()) {
      if (known.seatId === seatId) continue;
      this.transport.send({ kind: 'profile_update', roomCode: this.roomCode, profile: known }, from);
    }
    if (normalizedProfile) {
      this.transport.send({ kind: 'profile_update', roomCode: this.roomCode, profile: normalizedProfile });
    }

    this.emit({ kind: 'status', message: `${clientId} giữ P${seatId + 1} cho Remote Roll.`, level: 'success' });
    for (const resolve of [...this.claimWaiters]) resolve();
  }
}

export class TurnOrderClientSession extends TurnOrderEventSource {
  readonly roomCode: string;
  readonly clientId: string;
  readonly seatId: number;
  readonly transport: LocalTransportAdapter<TurnOrderMessage>;
  joined = false;
  activePrompt?: TurnOrderPrompt;
  private unsubscribeTransport?: () => void;
  private submittedPromptId?: string;
  private readonly profile?: TurnOrderProfileWire07042;

  constructor(
    roomCode: string,
    clientId: string,
    seatId: number,
    transport: LocalTransportAdapter<TurnOrderMessage>,
    profile?: TurnOrderProfileWire07042,
  ) {
    super();
    this.roomCode = roomCode;
    this.clientId = clientId;
    this.seatId = seatId;
    this.transport = transport;
    this.profile = normalizeProfile07042(profile, seatId);
  }

  start(): void {
    if (this.unsubscribeTransport) return;
    this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    this.retryJoin();
  }

  retryJoin(): void {
    if (this.joined) return;
    this.transport.send({
      kind: 'join_request',
      roomCode: this.roomCode,
      clientId: this.clientId,
      seatId: this.seatId,
      ...(this.profile ? { profile: this.profile } : {}),
    }, 'host');
    this.emit({ kind: 'status', message: `Đang nối Remote Roll ${this.roomCode} với P${this.seatId + 1}...`, level: 'info' });
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.activePrompt = undefined;
    this.submittedPromptId = undefined;
    this.transport.close();
    this.handlers.clear();
  }

  canRoll(promptId: string): boolean {
    return Boolean(
      this.joined &&
      this.activePrompt?.promptId === promptId &&
      this.activePrompt.playerId === this.seatId &&
      this.submittedPromptId !== promptId
    );
  }

  submitRoll(promptId: string): void {
    if (!this.canRoll(promptId)) throw new Error('Remote Roll chưa tới lượt ghế này hoặc prompt đã được gửi.');
    this.submittedPromptId = promptId;
    this.transport.send({
      kind: 'roll_request',
      roomCode: this.roomCode,
      clientId: this.clientId,
      seatId: this.seatId,
      promptId,
    }, 'host');
  }

  private handleMessage(message: LocalTransportMessage<TurnOrderMessage>): void {
    if (message.from !== 'host') return;
    const payload = message.payload;
    if ('roomCode' in payload && payload.roomCode !== this.roomCode) return;

    if (payload.kind === 'join_accept' && payload.clientId === this.clientId) {
      this.joined = true;
      this.emit({ kind: 'status', message: `Remote Roll đã nối: P${payload.seatId + 1}.`, level: 'success' });
      return;
    }
    if (payload.kind === 'join_reject' && payload.clientId === this.clientId) {
      this.joined = false;
      this.emit({ kind: 'status', message: payload.reason, level: 'error' });
      return;
    }
    if (payload.kind === 'profile_sync') {
      this.emit({ kind: 'profile_sync', playerNames: [...payload.playerNames] });
      return;
    }
    if (payload.kind === 'profile_update') {
      const normalized = normalizeProfile07042(payload.profile, payload.profile.seatId);
      if (normalized) this.emit({ kind: 'profile_update', profile: normalized });
      return;
    }
    if (payload.kind === 'roll_prompt') {
      this.activePrompt = { ...payload.prompt };
      this.submittedPromptId = undefined;
      this.emit({ kind: 'prompt', prompt: { ...payload.prompt } });
      return;
    }
    if (payload.kind === 'roll_reject' && payload.clientId === this.clientId) {
      if (this.submittedPromptId === payload.promptId) this.submittedPromptId = undefined;
      this.emit({ kind: 'status', message: payload.reason, level: 'error' });
      return;
    }
    if (payload.kind === 'roll_result') {
      if (this.activePrompt?.promptId === payload.promptId) this.activePrompt = undefined;
      if (this.submittedPromptId === payload.promptId) this.submittedPromptId = undefined;
      this.emit({ kind: 'result', promptId: payload.promptId, playerId: payload.playerId, value: payload.value });
      return;
    }
    if (payload.kind === 'tie_group') {
      this.emit({ kind: 'tie_group', playerIds: [...payload.playerIds], value: payload.value });
      return;
    }
    if (payload.kind === 'final_order') {
      this.emit({ kind: 'final_order', order: [...payload.order] });
      return;
    }
    if (payload.kind === 'character_reveal') {
      this.emit({
        kind: 'character_reveal',
        assignments: payload.assignments.map((assignment) => ({ ...assignment })),
      });
      return;
    }
    if (payload.kind === 'start_match') {
      this.emit({ kind: 'start_match' });
    }
  }
}
