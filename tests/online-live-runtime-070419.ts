import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { MEMEME_BUILD } from '../src/buildInfo';
import { MEMEME_ONLINE_BASE_URL } from '../src/core/onlineTransport0702';

type Json = Record<string, unknown>;

const BASE = process.env.MEMEME_ONLINE_BASE_URL?.trim() || MEMEME_ONLINE_BASE_URL;
const TIMEOUT_MS = 8_000;

assert.equal(MEMEME_BUILD.version, '0.1.70.4.19');

async function jsonRequest<T extends Json>(path: string, init: RequestInit = {}): Promise<T> {
  const response = await fetch(BASE.replace(/\/+$/, '') + path, {
    ...init,
    headers: {
      'Content-Type': 'application/json',
      ...(init.headers ?? {}),
    },
  });
  const body = await response.json().catch(() => ({})) as T & { error?: string };
  assert.equal(
    response.ok,
    true,
    (init.method ?? 'GET') + ' ' + path + ' failed (' + response.status + '): ' + (body.error ?? JSON.stringify(body)),
  );
  return body;
}

function wsUrl(
  roomCode: string,
  role: 'host' | 'client',
  clientId: string,
  seatId: number,
  channel: 'game' | 'media',
  token: { hostToken?: string; reconnectToken?: string },
): string {
  const url = new URL(BASE);
  url.protocol = url.protocol === 'https:' ? 'wss:' : 'ws:';
  url.pathname = '/api/rooms/' + roomCode + '/ws';
  url.search = '';
  url.searchParams.set('role', role);
  url.searchParams.set('clientId', clientId);
  url.searchParams.set('seatId', String(seatId));
  url.searchParams.set('channel', channel);
  if (token.hostToken) url.searchParams.set('hostToken', token.hostToken);
  if (token.reconnectToken) url.searchParams.set('reconnectToken', token.reconnectToken);
  return url.toString();
}

type Waiter = {
  predicate: (value: Json) => boolean;
  resolve: (value: Json) => void;
  reject: (reason: unknown) => void;
  timer: ReturnType<typeof setTimeout>;
};

class SocketProbe {
  readonly socket: WebSocket;
  private readonly queue: Json[] = [];
  private readonly waiters = new Set<Waiter>();

  private constructor(socket: WebSocket) {
    this.socket = socket;
    socket.addEventListener('message', (event) => {
      let value: Json | undefined;
      try {
        const raw = typeof event.data === 'string'
          ? event.data
          : event.data instanceof ArrayBuffer
            ? new TextDecoder().decode(event.data)
            : String(event.data);
        value = JSON.parse(raw) as Json;
      } catch {
        return;
      }

      for (const waiter of [...this.waiters]) {
        if (!waiter.predicate(value)) continue;
        clearTimeout(waiter.timer);
        this.waiters.delete(waiter);
        waiter.resolve(value);
        return;
      }
      this.queue.push(value);
    });
  }

  static async connect(url: string): Promise<SocketProbe> {
    assert.equal(typeof WebSocket, 'function', 'Node runtime must expose the global WebSocket API.');
    const socket = new WebSocket(url);
    const probe = new SocketProbe(socket);

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error('WebSocket open timeout: ' + url)), TIMEOUT_MS);
      socket.addEventListener('open', () => {
        clearTimeout(timer);
        resolve();
      }, { once: true });
      socket.addEventListener('error', () => {
        clearTimeout(timer);
        reject(new Error('WebSocket open failed: ' + url));
      }, { once: true });
    });
    return probe;
  }

  send(payload: Json, to?: string): void {
    this.socket.send(JSON.stringify({ to, payload }));
  }

  async waitFor(predicate: (value: Json) => boolean, label: string): Promise<Json> {
    const queuedIndex = this.queue.findIndex(predicate);
    if (queuedIndex >= 0) {
      const [value] = this.queue.splice(queuedIndex, 1);
      return value;
    }

    return new Promise<Json>((resolve, reject) => {
      const waiter: Waiter = {
        predicate,
        resolve,
        reject,
        timer: setTimeout(() => {
          this.waiters.delete(waiter);
          reject(new Error('Timed out waiting for ' + label));
        }, TIMEOUT_MS),
      };
      this.waiters.add(waiter);
    });
  }

  close(): void {
    for (const waiter of this.waiters) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error('Socket closed.'));
    }
    this.waiters.clear();
    try { this.socket.close(1000, 'QA done'); } catch {}
  }
}

let roomCode = '';
let hostToken = '';
let reconnectToken = '';
let clientId = '';
let clientSeat = -1;
const deviceId = 'ci-device-' + randomUUID();
const sockets: SocketProbe[] = [];

try {
  const health = await jsonRequest<Json>('/health');
  assert.equal(health.ok, true);
  assert.equal(health.transport, 'websocket-durable-object');

  const created = await jsonRequest<Json>('/api/rooms', {
    method: 'POST',
    body: JSON.stringify({
      hostName: 'CI Host',
      deviceId: 'host-' + deviceId,
      settings: { cameraAllowed: true, voiceAllowed: true, cpuFill: true },
    }),
  });
  roomCode = String(created.roomCode ?? '');
  hostToken = String(created.hostToken ?? '');
  assert.match(roomCode, /^[A-Z0-9]{4,8}$/);
  assert.ok(hostToken.length > 20);

  clientId = 'ci-p2-' + randomUUID().replaceAll('-', '').slice(0, 12);
  const joined = await jsonRequest<Json>('/api/rooms/' + roomCode + '/join', {
    method: 'POST',
    body: JSON.stringify({
      clientId,
      displayName: 'CI P2',
      reconnectToken: '',
      deviceId,
    }),
  });
  clientSeat = Number(joined.seatId);
  reconnectToken = String(joined.reconnectToken ?? '');
  assert.equal(clientSeat, 1, 'first remote human should own P2');
  assert.ok(reconnectToken.length > 20);

  await jsonRequest<Json>('/api/rooms/' + roomCode + '/ready', {
    method: 'POST',
    body: JSON.stringify({ clientId: 'host', hostToken, ready: true }),
  });
  const ready = await jsonRequest<Json>('/api/rooms/' + roomCode + '/ready', {
    method: 'POST',
    body: JSON.stringify({ clientId, reconnectToken, ready: true }),
  });
  assert.equal(ready.canStart, true);

  const started = await jsonRequest<Json>('/api/rooms/' + roomCode + '/start', {
    method: 'POST',
    body: JSON.stringify({ hostToken }),
  });
  assert.equal(started.started, true);
  assert.deepEqual(started.cpuSeatIds, [2, 3]);

  const reclaimed = await jsonRequest<Json>('/api/rooms/' + roomCode + '/join', {
    method: 'POST',
    body: JSON.stringify({
      clientId,
      displayName: 'CI P2',
      reconnectToken,
      deviceId,
    }),
  });
  assert.equal(Number(reclaimed.seatId), clientSeat);
  assert.equal(String(reclaimed.reconnectToken), reconnectToken);

  const hostGame = await SocketProbe.connect(wsUrl(
    roomCode, 'host', 'host', 0, 'game', { hostToken },
  ));
  const clientGame = await SocketProbe.connect(wsUrl(
    roomCode, 'client', clientId, clientSeat, 'game', { reconnectToken },
  ));
  sockets.push(hostGame, clientGame);

  await hostGame.waitFor((m) => m.kind === 'relay_ready', 'host game relay_ready');
  await clientGame.waitFor((m) => m.kind === 'relay_ready', 'client game relay_ready');

  const h2c = 'h2c-' + randomUUID();
  hostGame.send({ kind: 'qa_host_to_client', nonce: h2c }, clientId);
  const h2cReceived = await clientGame.waitFor(
    (m) => m.from === 'host'
      && (m.payload as Json | undefined)?.kind === 'qa_host_to_client'
      && (m.payload as Json | undefined)?.nonce === h2c,
    'host -> P2 game relay',
  );
  assert.equal(h2cReceived.to, clientId);

  const c2h = 'c2h-' + randomUUID();
  clientGame.send({ kind: 'qa_client_to_host', nonce: c2h }, 'host');
  await hostGame.waitFor(
    (m) => m.from === clientId
      && (m.payload as Json | undefined)?.kind === 'qa_client_to_host'
      && (m.payload as Json | undefined)?.nonce === c2h,
    'P2 -> host game relay',
  );

  clientGame.close();
  const reloadedGame = await SocketProbe.connect(wsUrl(
    roomCode, 'client', clientId, clientSeat, 'game', { reconnectToken },
  ));
  sockets.push(reloadedGame);
  await reloadedGame.waitFor((m) => m.kind === 'relay_ready', 'reloaded P2 relay_ready');

  const afterReload = 'reload-' + randomUUID();
  reloadedGame.send({ kind: 'qa_after_reload', nonce: afterReload }, 'host');
  await hostGame.waitFor(
    (m) => m.from === clientId
      && (m.payload as Json | undefined)?.kind === 'qa_after_reload'
      && (m.payload as Json | undefined)?.nonce === afterReload,
    'P2 relay after reload',
  );

  const hostMedia = await SocketProbe.connect(wsUrl(
    roomCode, 'host', 'host', 0, 'media', { hostToken },
  ));
  const clientMedia = await SocketProbe.connect(wsUrl(
    roomCode, 'client', clientId, clientSeat, 'media', { reconnectToken },
  ));
  sockets.push(hostMedia, clientMedia);

  await hostMedia.waitFor((m) => m.kind === 'relay_ready', 'host media relay_ready');
  await clientMedia.waitFor((m) => m.kind === 'relay_ready', 'client media relay_ready');

  const rosterNonce = 'roster-' + randomUUID();
  hostMedia.send({
    kind: 'media_roster',
    nonce: rosterNonce,
    peers: [
      { clientId: 'host', seatId: 0, name: 'CI Host' },
      { clientId, seatId: clientSeat, name: 'CI P2' },
    ],
  });
  await clientMedia.waitFor(
    (m) => m.from === 'host'
      && (m.payload as Json | undefined)?.kind === 'media_roster'
      && (m.payload as Json | undefined)?.nonce === rosterNonce,
    'media roster host -> P2',
  );

  const signalNonce = 'signal-' + randomUUID();
  clientMedia.send({
    kind: 'media_signal',
    nonce: signalNonce,
    signal: { from: clientId, to: 'host', description: { type: 'offer', sdp: 'ci-smoke' } },
  }, 'host');
  await hostMedia.waitFor(
    (m) => m.from === clientId
      && (m.payload as Json | undefined)?.kind === 'media_signal'
      && (m.payload as Json | undefined)?.nonce === signalNonce,
    'media signal P2 -> host',
  );

  console.log(
    '[online-live-runtime-070419] PASS room=' + roomCode
      + ' seat=P' + (clientSeat + 1)
      + ' create/join/ready/start + post-start reclaim + game relay + reload relay + media relay',
  );
} finally {
  for (const socket of sockets) socket.close();
  if (roomCode && hostToken) {
    await fetch(BASE.replace(/\/+$/, '') + '/api/rooms/' + roomCode + '/close', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ hostToken, reason: 'host_left' }),
    }).catch(() => undefined);
  }
}
