import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const api = readFileSync('src/core/onlineLobby0703.ts', 'utf8');
const lobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const mode = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const browser = readFileSync('src/core/browserSession.ts', 'utf8');
const transport = readFileSync('src/core/onlineTransport0702.ts', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.(?:3|4(?:\.[1236])?)/);
assert.match(worker, /cameraAllowed/);
assert.match(worker, /voiceAllowed/);
assert.match(worker, /cpuFill/);
assert.match(worker, /\[1, 2, 3\]\.find\(\(seat\) => !(?:used|humanSeats)\.has\(seat\)\)/, 'online join must auto-assign lowest free P2-P4 seat');
assert.match(worker, /players\.every\(\(player\) => player\.ready/);
assert.match(worker, /players\.length === 4/);
assert.match(worker, /bannedClientIds/);
assert.match(worker, /Kicked by host/);
assert.match(worker, /reconnectTokenHash/);
assert.match(worker, /Invalid client seat token/);
assert.match(worker, /cpuSeatIds = settings\.cpuFill/);

assert.match(api, /joinOnlineRoom0703/);
assert.match(api, /sessionStorage/);
assert.match(api, /setOnlineReady0703/);
assert.match(api, /kickOnlinePlayer0703/);
assert.match(api, /startOnlineMatch0703/);

assert.match(mode, /Cho phép Camera Call/);
assert.match(mode, /Cho phép Voice Chat/);
assert.match(mode, /Tự lấp ghế trống bằng CPU/);
assert(!mode.includes('GHẾ KHI JOIN<select id="online-seat"'));

assert.match(lobby, /data-kick-seat/);
assert.match(lobby, /BỎ READY/);
assert.match(lobby, /CHỜ READY/);
assert.match(lobby, /CPU KHI START/);
assert.match(lobby, /Camera\/Mic vẫn OFF mặc định/);
assert.match(lobby, /browserSession\.setCpuSeatIds/);

assert.match(browser, /reconnectToken: string/);
assert.match(browser, /setCpuSeatIds/);
assert.match(browser, /return this\.config\.cpuSeatIds\.includes\(seatId\)/);
assert.match(transport, /reconnectToken/);

console.log('[online-lobby-authority-0703] PASS auto-seat + room policy + ready gate + CPU fill + kick + reconnect credential');
