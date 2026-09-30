import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

class MemoryStorage {
  private readonly values = new Map<string, string>();
  get length(): number { return this.values.size; }
  clear(): void { this.values.clear(); }
  getItem(key: string): string | null { return this.values.get(key) ?? null; }
  key(index: number): string | null { return [...this.values.keys()][index] ?? null; }
  removeItem(key: string): void { this.values.delete(key); }
  setItem(key: string, value: string): void { this.values.set(key, String(value)); }
}
Object.defineProperty(globalThis, 'sessionStorage', { value: new MemoryStorage(), configurable: true });

const { browserSession } = await import('../src/core/browserSession');

browserSession.configureOnlineHost('HOST15', 'host-token-123', 'https://mememe-online.example');
let saved = browserSession.peekOnlineResume0705();
assert(saved);
assert.equal(saved.mode, 'host');
assert.equal(saved.roomCode, 'HOST15');
assert.equal(saved.hostToken, 'host-token-123');

browserSession.configureSolo([1, 2, 3]);
const restoredHost = browserSession.restoreOnlineResume0705();
assert(restoredHost);
assert.equal(restoredHost.mode, 'host');
assert.equal(restoredHost.roomCode, 'HOST15');

browserSession.clearOnlineResume0705();
assert.equal(browserSession.peekOnlineResume0705(), undefined);

browserSession.configureOnlineClient(
  'JOIN15', 2, 'https://mememe-online.example', 'client-p3', 'reconnect-token-xyz',
);
saved = browserSession.peekOnlineResume0705();
assert(saved);
assert.equal(saved.mode, 'client');
assert.equal(saved.seatId, 2);
assert.equal(saved.clientId, 'client-p3');
assert.equal(saved.reconnectToken, 'reconnect-token-xyz');

const lobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const room = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const api = readFileSync('src/core/onlineLobby0703.ts', 'utf8');

assert.match(api, /probeOnlineService0705/);
assert.match(api, /\/health/);
assert.match(lobby, /new URLSearchParams\(window\.location\.search\)\.get\('room'\)/);
assert.match(lobby, /SERVER SẴN SÀNG/);
assert.match(lobby, /lobby-online-resume/);
assert.match(lobby, /restoreOnlineResume0705/);
assert.match(room, /online-copy-link/);
assert.match(room, /searchParams\.set\('room', config\.roomCode\)/);
assert.match(room, /clearOnlineResume0705/);

console.log('[public-online-ch15] PASS health probe + invite prefill + host/client session resume + invite link + explicit resume cleanup');
