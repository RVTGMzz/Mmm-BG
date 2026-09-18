import {
  cloneDemoMatchShell,
  createDemoMatchShell,
  demoMatchResult,
  type DemoMatchShellState,
} from './demoMatch';
import type { LocalTransportAdapter, LocalTransportMessage } from './localTransport';
import type { MatchState } from './matchState';

export interface DemoShellHelloMessage {
  kind: 'shell_hello';
  clientId: string;
}

export interface DemoShellStateMessage {
  kind: 'shell_state';
  shell: DemoMatchShellState;
}

export type DemoShellMessage = DemoShellHelloMessage | DemoShellStateMessage;
export type DemoShellHandler = (shell: DemoMatchShellState) => void;

abstract class DemoShellEventSource {
  protected readonly handlers = new Set<DemoShellHandler>();

  subscribe(handler: DemoShellHandler): () => void {
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  protected emit(shell: DemoMatchShellState): void {
    const cloned = cloneDemoMatchShell(shell);
    for (const handler of this.handlers) handler(cloned);
  }
}

export class DemoShellHostSession extends DemoShellEventSource {
  shell: DemoMatchShellState;
  private unsubscribeTransport?: () => void;

  constructor(
    playerCount: number,
    readonly transport: LocalTransportAdapter<DemoShellMessage>,
    rounds = 3,
  ) {
    super();
    this.shell = createDemoMatchShell(playerCount, rounds, 'waiting');
  }

  start(): void {
    if (this.unsubscribeTransport) return;
    this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    this.emit(this.shell);
    this.broadcast();
  }

  begin(commandSeq: number): void {
    if (this.shell.status === 'active') return;
    this.shell.status = 'active';
    this.shell.revision += 1;
    this.shell.startedAtCommandSeq = commandSeq;
    this.shell.endedAtCommandSeq = null;
    this.shell.winnerIds = [];
    this.shell.winningMoney = null;
    this.emit(this.shell);
    this.broadcast();
  }

  finish(match: MatchState, commandSeq: number): void {
    if (this.shell.status !== 'active') return;
    const result = demoMatchResult(match);
    this.shell.status = 'ended';
    this.shell.revision += 1;
    this.shell.endedAtCommandSeq = commandSeq;
    this.shell.winnerIds = [...result.winnerIds];
    this.shell.winningMoney = result.winningMoney;
    this.emit(this.shell);
    this.broadcast();
  }

  resetAndBegin(playerCount: number, commandSeq = 0): void {
    const nextRevision = this.shell.revision + 1;
    this.shell = createDemoMatchShell(playerCount, this.shell.rounds, 'active');
    this.shell.revision = nextRevision;
    this.shell.startedAtCommandSeq = commandSeq;
    this.emit(this.shell);
    this.broadcast();
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.transport.close();
    this.handlers.clear();
  }

  private handleMessage(message: LocalTransportMessage<DemoShellMessage>): void {
    if (message.payload.kind !== 'shell_hello') return;
    if (message.payload.clientId !== message.from) return;
    this.transport.send(
      { kind: 'shell_state', shell: cloneDemoMatchShell(this.shell) },
      message.from,
    );
  }

  private broadcast(): void {
    this.transport.send({ kind: 'shell_state', shell: cloneDemoMatchShell(this.shell) });
  }
}

export class DemoShellClientSession extends DemoShellEventSource {
  shell?: DemoMatchShellState;
  private unsubscribeTransport?: () => void;

  constructor(
    readonly clientId: string,
    readonly transport: LocalTransportAdapter<DemoShellMessage>,
  ) {
    super();
  }

  start(): void {
    if (!this.unsubscribeTransport) {
      this.unsubscribeTransport = this.transport.subscribe((message) => this.handleMessage(message));
    }
    this.requestState();
  }

  requestState(): void {
    this.transport.send({ kind: 'shell_hello', clientId: this.clientId }, 'shell-host');
  }

  close(): void {
    this.unsubscribeTransport?.();
    this.unsubscribeTransport = undefined;
    this.transport.close();
    this.handlers.clear();
  }

  private handleMessage(message: LocalTransportMessage<DemoShellMessage>): void {
    if (message.from !== 'shell-host' || message.payload.kind !== 'shell_state') return;
    this.shell = cloneDemoMatchShell(message.payload.shell);
    this.emit(this.shell);
  }
}
