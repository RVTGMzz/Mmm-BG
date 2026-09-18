import { browserSession, normalizeRoomCode, type BrowserSessionConfig } from './browserSession';
import {
  BroadcastChannelTransport,
  type LocalTransportAdapter,
  type LocalTransportHandler,
  type LocalTransportMessage,
} from './localTransport';

export const MEMEME_ONLINE_BASE_URL = 'https://mememe-online.lengochung28191.workers.dev';

export type SessionLogicalChannel = 'game' | 'turn-order' | 'demo-shell';

export interface OnlineRoomCreateResult {
  ok: true;
  roomCode: string;
  hostToken: string;
  websocketUrl: string;
}

export interface OnlineRoomStatus {
  ok: boolean;
  roomCode?: string;
  connections?: number;
  error?: string;
}

interface OnlineRelayEnvelope<T> {
  from?: string;
  to?: string;
  payload?: T;
  kind?: string;
  error?: string;
}

interface OnlineTransportOptions {
  baseUrl: string;
  roomCode: string;
  endpointId: string;
  role: 'host' | 'client';
  seatId: number;
  hostToken?: string;
  channel: SessionLogicalChannel;
}

function normalizedBaseUrl(value: string): string {
  return value.trim().replace(/\/+$/, '');
}

export async function createOnlineRoom(
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineRoomCreateResult> {
  const response = await fetch(`${normalizedBaseUrl(baseUrl)}/api/rooms`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  const body = await response.json() as Partial<OnlineRoomCreateResult> & { error?: string };
  if (!response.ok || body.ok !== true || !body.roomCode || !body.hostToken) {
    throw new Error(body.error ? `Không tạo được phòng: ${body.error}` : 'Không tạo được phòng online.');
  }
  return body as OnlineRoomCreateResult;
}

export async function readOnlineRoomStatus(
  roomCode: string,
  baseUrl = MEMEME_ONLINE_BASE_URL,
): Promise<OnlineRoomStatus> {
  const room = normalizeRoomCode(roomCode);
  if (!room) return { ok: false, error: 'invalid_room_code' };
  const response = await fetch(`${normalizedBaseUrl(baseUrl)}/api/rooms/${room}/status`);
  const body = await response.json() as OnlineRoomStatus;
  return response.ok ? body : { ...body, ok: false };
}

export function buildOnlineWebSocketUrl(
  config: Pick<BrowserSessionConfig, 'mode' | 'roomCode' | 'clientId' | 'seatId' | 'onlineBaseUrl' | 'hostToken'>,
  channel: SessionLogicalChannel,
  endpointId = config.clientId,
): string {
  if (config.mode === 'solo') throw new Error('Solo session không dùng WebSocket online.');
  const base = new URL(normalizedBaseUrl(config.onlineBaseUrl || MEMEME_ONLINE_BASE_URL));
  base.protocol = base.protocol === 'https:' ? 'wss:' : 'ws:';
  base.pathname = `/api/rooms/${normalizeRoomCode(config.roomCode)}/ws`;
  base.search = '';
  base.searchParams.set('role', config.mode === 'host' ? 'host' : 'client');
  base.searchParams.set('clientId', endpointId);
  base.searchParams.set('seatId', String(config.mode === 'host' ? 0 : config.seatId));
  base.searchParams.set('channel', channel);
  if (config.mode === 'host' && config.hostToken) base.searchParams.set('hostToken', config.hostToken);
  return base.toString();
}

export class OnlineWebSocketTransport<T> implements LocalTransportAdapter<T> {
  readonly endpointId: string;
  private readonly options: OnlineTransportOptions;
  private readonly handlers = new Set<LocalTransportHandler<T>>();
  private readonly pending: string[] = [];
  private socket?: WebSocket;
  private reconnectTimer?: ReturnType<typeof setTimeout>;
  private reconnectAttempt = 0;
  private closed = false;

  constructor(options: OnlineTransportOptions) {
    if (!options.endpointId.trim()) throw new Error('endpointId is required.');
    this.endpointId = options.endpointId;
    this.options = { ...options, baseUrl: normalizedBaseUrl(options.baseUrl) };
    this.connect();
  }

  send(payload: T, to?: string): void {
    if (this.closed) throw new Error(`Endpoint ${this.endpointId} is closed.`);
    const serialized = JSON.stringify({ to, payload });
    if (this.socket?.readyState === WebSocket.OPEN) {
      this.socket.send(serialized);
      return;
    }
    this.pending.push(serialized);
    if (this.pending.length > 64) this.pending.shift();
  }

  subscribe(handler: LocalTransportHandler<T>): () => void {
    if (this.closed) throw new Error(`Endpoint ${this.endpointId} is closed.`);
    this.handlers.add(handler);
    return () => this.handlers.delete(handler);
  }

  close(): void {
    if (this.closed) return;
    this.closed = true;
    if (this.reconnectTimer) clearTimeout(this.reconnectTimer);
    this.reconnectTimer = undefined;
    this.handlers.clear();
    this.pending.length = 0;
    this.socket?.close(1000, 'Scene closed.');
    this.socket = undefined;
  }

  private connect(): void {
    if (this.closed) return;
    const url = new URL(normalizedBaseUrl(this.options.baseUrl));
    url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
    url.pathname = `/api/rooms/${normalizeRoomCode(this.options.roomCode)}/ws`;
    url.search = '';
    url.searchParams.set('role', this.options.role);
    url.searchParams.set('clientId', this.endpointId);
    url.searchParams.set('seatId', String(this.options.seatId));
    url.searchParams.set('channel', this.options.channel);
    if (this.options.role === 'host' && this.options.hostToken) {
      url.searchParams.set('hostToken', this.options.hostToken);
    }

    const socket = new WebSocket(url.toString());
    this.socket = socket;

    socket.addEventListener('open', () => {
      if (this.closed || this.socket !== socket) return;
      this.reconnectAttempt = 0;
      while (this.pending.length > 0 && socket.readyState === WebSocket.OPEN) {
        const message = this.pending.shift();
        if (message) socket.send(message);
      }
    });

    socket.addEventListener('message', (event: MessageEvent<string>) => {
      if (this.closed || this.socket !== socket || typeof event.data !== 'string') return;
      let envelope: OnlineRelayEnvelope<T>;
      try {
        envelope = JSON.parse(event.data) as OnlineRelayEnvelope<T>;
      } catch {
        return;
      }
      if (!envelope.from || envelope.payload === undefined) return;
      if (envelope.from === this.endpointId) return;
      if (envelope.to && envelope.to !== this.endpointId) return;
      const message: LocalTransportMessage<T> = {
        from: envelope.from,
        to: envelope.to,
        payload: envelope.payload,
      };
      for (const handler of this.handlers) handler(message);
    });

    socket.addEventListener('close', () => {
      if (this.closed || this.socket !== socket) return;
      this.socket = undefined;
      this.scheduleReconnect();
    });

    socket.addEventListener('error', () => {
      if (this.closed || this.socket !== socket) return;
      try { socket.close(); } catch { /* browser will trigger close/reconnect */ }
    });
  }

  private scheduleReconnect(): void {
    if (this.closed || this.reconnectTimer) return;
    const delay = Math.min(5000, 350 * 2 ** Math.min(this.reconnectAttempt, 4));
    this.reconnectAttempt += 1;
    this.reconnectTimer = setTimeout(() => {
      this.reconnectTimer = undefined;
      this.connect();
    }, delay);
  }
}

function localChannelName(channel: SessionLogicalChannel): string {
  if (channel === 'game') return browserSession.channelName;
  return `${browserSession.channelName}-${channel}`;
}

export function createBrowserSessionTransport<T>(
  channel: SessionLogicalChannel,
  endpointId: string,
): LocalTransportAdapter<T> {
  const config = browserSession.current;
  if (config.mode === 'solo') {
    throw new Error('Solo session phải dùng InMemoryTransportHub.');
  }

  if (config.transport === 'local') {
    return new BroadcastChannelTransport<T>(localChannelName(channel), endpointId);
  }

  return new OnlineWebSocketTransport<T>({
    baseUrl: config.onlineBaseUrl || MEMEME_ONLINE_BASE_URL,
    roomCode: config.roomCode,
    endpointId,
    role: config.mode === 'host' ? 'host' : 'client',
    seatId: config.mode === 'host' ? 0 : config.seatId,
    hostToken: config.hostToken,
    channel,
  });
}
