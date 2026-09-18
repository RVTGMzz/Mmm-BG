import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { browserSession } from '../src/core/browserSession';
import {
  buildOnlineWebSocketUrl,
  MEMEME_ONLINE_BASE_URL,
} from '../src/core/onlineTransport0702';

const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const turnOrder = readFileSync('src/scenes/TurnOrderScene.ts', 'utf8');
const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');

const host = browserSession.configureOnlineHost('me12ab', 'host-secret', MEMEME_ONLINE_BASE_URL);
assert.equal(host.transport, 'online');
assert.equal(host.mode, 'host');
assert.equal(host.roomCode, 'ME12AB');
assert.equal(host.hostToken, 'host-secret');
const hostWs = new URL(buildOnlineWebSocketUrl(host, 'turn-order', 'host'));
assert.equal(hostWs.protocol, 'wss:');
assert.equal(hostWs.pathname, '/api/rooms/ME12AB/ws');
assert.equal(hostWs.searchParams.get('role'), 'host');
assert.equal(hostWs.searchParams.get('channel'), 'turn-order');
assert.equal(hostWs.searchParams.get('hostToken'), 'host-secret');

const client = browserSession.configureOnlineClient('ME12AB', 2, MEMEME_ONLINE_BASE_URL, 'online-test-p3', 'reconnect-secret');
assert.equal(client.transport, 'online');
assert.equal(client.mode, 'client');
assert.equal(client.seatId, 2);
assert.equal(client.hostToken, '');
assert.equal(client.reconnectToken, 'reconnect-secret');
const clientWs = new URL(buildOnlineWebSocketUrl(client, 'game', client.clientId));
assert.equal(clientWs.searchParams.get('role'), 'client');
assert.equal(clientWs.searchParams.get('seatId'), '2');
assert.equal(clientWs.searchParams.get('channel'), 'game');
assert.equal(clientWs.searchParams.get('reconnectToken'), 'reconnect-secret');
assert.equal(clientWs.searchParams.has('hostToken'), false);

const local = browserSession.configureClient('MELOCAL', 1);
assert.equal(local.transport, 'local');

assert.match(lobby, /TẠO ONLINE/);
assert.match(lobby, /createOnlineRoom0703/);
assert.match(lobby, /joinOnlineRoom0703/);
assert.match(lobby, /configureOnlineHost/);
assert.match(lobby, /configureOnlineClient/);

assert.match(turnOrder, /createBrowserSessionTransport<TurnOrderMessage>\('turn-order'/);
assert(!turnOrder.includes('new BroadcastChannelTransport'));

assert.match(demo, /createBrowserSessionTransport<TwoTabMessage>\('game'/);
assert.match(demo, /createBrowserSessionTransport<DemoShellMessage>/);
assert.match(demo, /'demo-shell'/);
assert.match(demo, /InMemoryTransportHub/, 'Solo must retain the in-memory transport');

assert.match(worker, /channel: string/);
assert.match(worker, /target\.channel !== sender\.channel/);
assert.match(worker, /attachment\.channel !== channel/);
assert.match(worker, /broadcastPresence\(channel\)/);

console.log('[online-client-transport-0702] PASS online lobby + WebSocket adapter + logical channel isolation + local fallback');
