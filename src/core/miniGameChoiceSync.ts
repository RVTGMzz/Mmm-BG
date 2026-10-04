import type {
  MiniGameChoiceReceiptMessage,
  MiniGameChoiceReceiptStatus,
  MiniGameChoiceRoundState,
  MiniGameChoiceStateMessage,
  MiniGameChoiceSubmitMessage,
  MiniGameChoiceSyncRequestMessage,
} from './miniGameChoiceProtocol';
import type { LocalTransportMessage } from './localTransport';
import type {
  TwoTabClientSession,
  TwoTabHostSession,
  TwoTabMessage,
} from './twoTabSession';

type HostRound = {
  sourceEventSeq: number;
  promptKey: string;
  playerIds: number[];
  allowedChoices: string[];
  choices: Map<number, string>;
};

type ChoiceReceipt = {
  status: MiniGameChoiceReceiptStatus;
  reason?: string;
};

function roundKey(sourceEventSeq: number, promptKey: string): string {
  return `${sourceEventSeq}:${promptKey}`;
}

function sortedUniquePlayerIds(playerIds: readonly number[]): number[] {
  return [...new Set(playerIds)]
    .filter((id) => Number.isInteger(id) && id >= 0 && id <= 3)
    .sort((a, b) => a - b);
}

function normalizedChoices(choices: readonly string[]): string[] {
  return [...new Set(choices.map((choice) => choice.trim()).filter(Boolean))].sort();
}

function sameList(left: readonly string[] | readonly number[], right: readonly string[] | readonly number[]): boolean {
  return left.length === right.length && left.every((value, index) => value === right[index]);
}

function publicState(round: HostRound): MiniGameChoiceRoundState {
  const submittedPlayerIds = round.playerIds.filter((id) => round.choices.has(id));
  const complete = submittedPlayerIds.length === round.playerIds.length;
  const revealedChoices = complete
    ? Object.fromEntries(round.playerIds.map((id) => [String(id), round.choices.get(id) ?? '']))
    : undefined;
  return {
    sourceEventSeq: round.sourceEventSeq,
    promptKey: round.promptKey,
    playerIds: [...round.playerIds],
    allowedChoices: [...round.allowedChoices],
    submittedPlayerIds,
    complete,
    revealedChoices,
  };
}

function cloneState(state: MiniGameChoiceRoundState): MiniGameChoiceRoundState {
  return {
    ...state,
    playerIds: [...state.playerIds],
    allowedChoices: [...state.allowedChoices],
    submittedPlayerIds: [...state.submittedPlayerIds],
    revealedChoices: state.revealedChoices ? { ...state.revealedChoices } : undefined,
  };
}

export class MiniGameChoiceHostSync {
  private readonly rounds = new Map<string, HostRound>();
  private readonly completeWaiters = new Map<string, Set<(choices: Record<number, string>) => void>>();
  private readonly unsubscribe: () => void;
  private closed = false;

  constructor(private readonly hostSession: TwoTabHostSession) {
    this.unsubscribe = hostSession.transport.subscribe((message) => this.handleMessage(message));
  }

  openRound(
    sourceEventSeq: number,
    promptKey: string,
    playerIds: readonly number[],
    allowedChoices: readonly string[],
  ): MiniGameChoiceRoundState {
    if (this.closed) throw new Error('Mini Game choice Host sync đã đóng.');
    if (!Number.isInteger(sourceEventSeq) || sourceEventSeq <= 0) throw new Error('Mini Game sourceEventSeq không hợp lệ.');
    if (!promptKey.trim()) throw new Error('Mini Game promptKey không hợp lệ.');

    const normalizedPlayers = sortedUniquePlayerIds(playerIds);
    const normalizedAllowed = normalizedChoices(allowedChoices);
    if (normalizedPlayers.length === 0) throw new Error('Mini Game choice round cần ít nhất 1 người chơi.');
    if (normalizedAllowed.length === 0) throw new Error('Mini Game choice round cần ít nhất 1 lựa chọn.');

    const key = roundKey(sourceEventSeq, promptKey);
    const existing = this.rounds.get(key);
    if (existing) {
      if (
        !sameList(existing.playerIds, normalizedPlayers)
        || !sameList(existing.allowedChoices, normalizedAllowed)
      ) {
        throw new Error(`Mini Game round ${key} bị mở lại với contract khác.`);
      }
      return publicState(existing);
    }

    // A later Mini Game event makes older ephemeral choice rounds irrelevant.
    for (const [oldKey, round] of this.rounds) {
      if (round.sourceEventSeq !== sourceEventSeq) this.rounds.delete(oldKey);
    }

    const round: HostRound = {
      sourceEventSeq,
      promptKey: promptKey.trim(),
      playerIds: normalizedPlayers,
      allowedChoices: normalizedAllowed,
      choices: new Map(),
    };
    this.rounds.set(key, round);
    this.broadcastState(round);
    return publicState(round);
  }

  state(sourceEventSeq: number, promptKey: string): MiniGameChoiceRoundState | undefined {
    const round = this.rounds.get(roundKey(sourceEventSeq, promptKey));
    return round ? publicState(round) : undefined;
  }

  submitHostChoice(
    sourceEventSeq: number,
    promptKey: string,
    playerId: number,
    choice: string,
  ): ChoiceReceipt {
    if (!this.hostSession.controlsActor(playerId)) {
      return { status: 'rejected', reason: `P${playerId + 1} đang thuộc client từ xa.` };
    }
    return this.acceptChoice(sourceEventSeq, promptKey, playerId, choice);
  }

  submitSystemChoice(
    sourceEventSeq: number,
    promptKey: string,
    playerId: number,
    choice: string,
  ): ChoiceReceipt {
    return this.acceptChoice(sourceEventSeq, promptKey, playerId, choice);
  }

  waitForComplete(sourceEventSeq: number, promptKey: string): Promise<Record<number, string>> {
    const key = roundKey(sourceEventSeq, promptKey);
    const round = this.rounds.get(key);
    if (!round) throw new Error(`Mini Game round ${key} chưa được Host mở.`);
    const state = publicState(round);
    if (state.complete && state.revealedChoices) return Promise.resolve(this.decodeChoices(state));

    return new Promise((resolve) => {
      const waiters = this.completeWaiters.get(key) ?? new Set();
      waiters.add(resolve);
      this.completeWaiters.set(key, waiters);
    });
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.unsubscribe();
    this.completeWaiters.clear();
    this.rounds.clear();
  }

  private acceptChoice(
    sourceEventSeq: number,
    promptKey: string,
    playerId: number,
    choice: string,
  ): ChoiceReceipt {
    const key = roundKey(sourceEventSeq, promptKey);
    const round = this.rounds.get(key);
    if (!round) return { status: 'rejected', reason: `Mini Game round ${key} chưa mở.` };
    if (!round.playerIds.includes(playerId)) {
      return { status: 'rejected', reason: `P${playerId + 1} không thuộc choice round này.` };
    }
    if (!round.allowedChoices.includes(choice)) {
      return { status: 'rejected', reason: `Lựa chọn ${choice} không hợp lệ cho ${promptKey}.` };
    }

    const existing = round.choices.get(playerId);
    if (existing !== undefined) {
      if (existing === choice) {
        this.broadcastState(round);
        return { status: 'duplicate' };
      }
      return { status: 'rejected', reason: `P${playerId + 1} đã chốt lựa chọn và không thể đổi.` };
    }

    round.choices.set(playerId, choice);
    this.broadcastState(round);
    this.resolveCompleteWaiters(round);
    return { status: 'accepted' };
  }

  private handleMessage(message: LocalTransportMessage<TwoTabMessage>): void {
    const payload = message.payload;

    if (payload.kind === 'minigame_choice_sync_request') {
      this.handleSyncRequest(message.from, payload);
      return;
    }

    if (payload.kind !== 'minigame_choice_submit') return;
    this.handleClientSubmit(message.from, payload);
  }

  private handleSyncRequest(from: string, request: MiniGameChoiceSyncRequestMessage): void {
    if (request.clientId !== from) return;
    if (this.hostSession.claimedSeatForClient(request.clientId) === undefined) return;

    for (const round of this.rounds.values()) {
      if (round.sourceEventSeq !== request.sourceEventSeq) continue;
      this.sendState(round, from);
    }
  }

  private handleClientSubmit(from: string, submit: MiniGameChoiceSubmitMessage): void {
    let result: ChoiceReceipt;
    const claimedSeat = this.hostSession.claimedSeatForClient(submit.clientId);
    if (submit.clientId !== from || claimedSeat === undefined || claimedSeat !== submit.playerId) {
      result = { status: 'rejected', reason: 'Client endpoint/seat claim không khớp Mini Game choice.' };
    } else {
      result = this.acceptChoice(
        submit.sourceEventSeq,
        submit.promptKey,
        submit.playerId,
        submit.choice,
      );
    }

    const receipt: MiniGameChoiceReceiptMessage = {
      kind: 'minigame_choice_receipt',
      sourceEventSeq: submit.sourceEventSeq,
      promptKey: submit.promptKey,
      playerId: submit.playerId,
      status: result.status,
      reason: result.reason,
    };
    this.hostSession.transport.send(receipt, from);

    if (result.status === 'rejected') {
      const round = this.rounds.get(roundKey(submit.sourceEventSeq, submit.promptKey));
      if (round) this.sendState(round, from);
    }
  }

  private broadcastState(round: HostRound): void {
    const message: MiniGameChoiceStateMessage = {
      kind: 'minigame_choice_state',
      state: publicState(round),
    };
    this.hostSession.transport.send(message);
  }

  private sendState(round: HostRound, to: string): void {
    const message: MiniGameChoiceStateMessage = {
      kind: 'minigame_choice_state',
      state: publicState(round),
    };
    this.hostSession.transport.send(message, to);
  }

  private resolveCompleteWaiters(round: HostRound): void {
    const state = publicState(round);
    if (!state.complete || !state.revealedChoices) return;
    const key = roundKey(round.sourceEventSeq, round.promptKey);
    const waiters = this.completeWaiters.get(key);
    if (!waiters) return;
    const choices = this.decodeChoices(state);
    this.completeWaiters.delete(key);
    for (const resolve of waiters) resolve({ ...choices });
  }

  private decodeChoices(state: MiniGameChoiceRoundState): Record<number, string> {
    const out: Record<number, string> = {};
    for (const id of state.playerIds) {
      const choice = state.revealedChoices?.[String(id)];
      if (choice !== undefined) out[id] = choice;
    }
    return out;
  }
}

type StateWaiter = {
  predicate: (state: MiniGameChoiceRoundState) => boolean;
  resolve: (state: MiniGameChoiceRoundState) => void;
  interval?: ReturnType<typeof setInterval>;
};

export class MiniGameChoiceClientSync {
  private readonly states = new Map<string, MiniGameChoiceRoundState>();
  private readonly stateWaiters = new Map<string, Set<StateWaiter>>();
  private readonly receiptWaiters = new Map<string, (receipt: MiniGameChoiceReceiptMessage) => void>();
  private readonly unsubscribe: () => void;
  private readonly unsubscribeConnection?: () => void;
  private closed = false;

  constructor(private readonly clientSession: TwoTabClientSession) {
    this.unsubscribe = clientSession.transport.subscribe((message) => this.handleMessage(message));
    this.unsubscribeConnection = clientSession.transport.subscribeConnection?.((state) => {
      if (state !== 'open') return;
      for (const cached of this.states.values()) this.requestSync(cached.sourceEventSeq);
      for (const key of this.stateWaiters.keys()) {
        const eventSeq = Number(key.split(':', 1)[0]);
        if (Number.isInteger(eventSeq) && eventSeq > 0) this.requestSync(eventSeq);
      }
    });
  }

  state(sourceEventSeq: number, promptKey: string): MiniGameChoiceRoundState | undefined {
    const state = this.states.get(roundKey(sourceEventSeq, promptKey));
    return state ? cloneState(state) : undefined;
  }

  waitForRound(sourceEventSeq: number, promptKey: string): Promise<MiniGameChoiceRoundState> {
    return this.waitForState(sourceEventSeq, promptKey, () => true);
  }

  waitForComplete(sourceEventSeq: number, promptKey: string): Promise<Record<number, string>> {
    return this.waitForState(sourceEventSeq, promptKey, (state) => state.complete)
      .then((state) => {
        const out: Record<number, string> = {};
        for (const id of state.playerIds) {
          const choice = state.revealedChoices?.[String(id)];
          if (choice !== undefined) out[id] = choice;
        }
        return out;
      });
  }

  async submitChoice(
    sourceEventSeq: number,
    promptKey: string,
    playerId: number,
    choice: string,
  ): Promise<MiniGameChoiceReceiptMessage> {
    if (this.closed) throw new Error('Mini Game choice Client sync đã đóng.');
    if (playerId !== this.clientSession.seatId) {
      throw new Error(`Client không sở hữu P${playerId + 1}.`);
    }
    await this.waitForSeatOwnership(playerId);

    const key = roundKey(sourceEventSeq, promptKey);
    const current = this.states.get(key);
    if (current?.submittedPlayerIds.includes(playerId)) {
      return Promise.resolve({
        kind: 'minigame_choice_receipt',
        sourceEventSeq,
        promptKey,
        playerId,
        status: 'duplicate',
      });
    }

    const receiptKey = `${key}:${playerId}`;
    return new Promise((resolve, reject) => {
      const previous = this.receiptWaiters.get(receiptKey);
      if (previous) {
        reject(new Error(`P${playerId + 1} đang chờ Host xác nhận Mini Game choice.`));
        return;
      }
      this.receiptWaiters.set(receiptKey, resolve);
      try {
        this.clientSession.transport.send({
          kind: 'minigame_choice_submit',
          sourceEventSeq,
          promptKey,
          clientId: this.clientSession.clientId,
          playerId,
          choice,
        }, 'host');
      } catch (error) {
        this.receiptWaiters.delete(receiptKey);
        reject(error);
      }
    });
  }

  private async waitForSeatOwnership(playerId: number): Promise<void> {
    if (this.clientSession.controlsActor(playerId)) return;
    this.clientSession.requestJoin07047();

    for (let attempt = 0; attempt < 60; attempt += 1) {
      if (this.closed) throw new Error('Mini Game choice Client sync đã đóng trong lúc reconnect.');
      if (this.clientSession.controlsActor(playerId)) return;
      if (attempt > 0 && attempt % 10 === 0) this.clientSession.requestJoin07047();
      await new Promise<void>((resolve) => setTimeout(resolve, 100));
    }

    throw new Error(`P${playerId + 1} chưa reclaim được ghế từ Host để chốt Mini Game.`);
  }

  requestSync(sourceEventSeq: number): void {
    if (this.closed) return;
    const request: MiniGameChoiceSyncRequestMessage = {
      kind: 'minigame_choice_sync_request',
      sourceEventSeq,
      clientId: this.clientSession.clientId,
    };
    this.clientSession.transport.send(request, 'host');
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    this.unsubscribe();
    this.unsubscribeConnection?.();
    for (const waiters of this.stateWaiters.values()) {
      for (const waiter of waiters) {
        if (waiter.interval) clearInterval(waiter.interval);
      }
    }
    this.stateWaiters.clear();
    this.receiptWaiters.clear();
    this.states.clear();
  }

  private waitForState(
    sourceEventSeq: number,
    promptKey: string,
    predicate: (state: MiniGameChoiceRoundState) => boolean,
  ): Promise<MiniGameChoiceRoundState> {
    const key = roundKey(sourceEventSeq, promptKey);
    const current = this.states.get(key);
    if (current && predicate(current)) return Promise.resolve(cloneState(current));
    if (this.closed) return Promise.reject(new Error('Mini Game choice Client sync đã đóng.'));

    return new Promise((resolve) => {
      const waiter: StateWaiter = {
        predicate,
        resolve,
      };
      waiter.interval = setInterval(() => this.requestSync(sourceEventSeq), 750);
      const waiters = this.stateWaiters.get(key) ?? new Set();
      waiters.add(waiter);
      this.stateWaiters.set(key, waiters);
      this.requestSync(sourceEventSeq);
    });
  }

  private handleMessage(message: LocalTransportMessage<TwoTabMessage>): void {
    if (message.from !== 'host') return;
    const payload = message.payload;

    if (payload.kind === 'minigame_choice_state') {
      const state = cloneState(payload.state);
      const key = roundKey(state.sourceEventSeq, state.promptKey);
      this.states.set(key, state);

      // Reconnect-safe ACK: the explicit receipt may be lost with the socket, but
      // authoritative Host state proving this seat is already committed is enough.
      for (const playerId of state.submittedPlayerIds) {
        const receiptKey = `${key}:${playerId}`;
        const resolveReceipt = this.receiptWaiters.get(receiptKey);
        if (!resolveReceipt) continue;
        this.receiptWaiters.delete(receiptKey);
        resolveReceipt({
          kind: 'minigame_choice_receipt',
          sourceEventSeq: state.sourceEventSeq,
          promptKey: state.promptKey,
          playerId,
          status: 'accepted',
        });
      }

      this.resolveStateWaiters(key, state);
      return;
    }

    if (payload.kind === 'minigame_choice_receipt') {
      const key = `${roundKey(payload.sourceEventSeq, payload.promptKey)}:${payload.playerId}`;
      const resolve = this.receiptWaiters.get(key);
      if (!resolve) return;
      this.receiptWaiters.delete(key);
      resolve({ ...payload });
    }
  }

  private resolveStateWaiters(key: string, state: MiniGameChoiceRoundState): void {
    const waiters = this.stateWaiters.get(key);
    if (!waiters) return;
    for (const waiter of [...waiters]) {
      if (!waiter.predicate(state)) continue;
      if (waiter.interval) clearInterval(waiter.interval);
      waiters.delete(waiter);
      waiter.resolve(cloneState(state));
    }
    if (waiters.size === 0) this.stateWaiters.delete(key);
  }
}
