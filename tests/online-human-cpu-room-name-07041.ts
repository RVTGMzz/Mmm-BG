import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const api = readFileSync('src/core/onlineLobby0703.ts', 'utf8');
const localLobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const roomLobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.4\.1"/);
assert.match(worker, /normalizeRoomName07041/);
assert.match(worker, /roomName/);
assert.match(worker, /deviceId: String\(body\.deviceId/);
assert.match(worker, /firstFreeHumanSeat07041/);
assert.match(worker, /CPU Fill never reserves lobby seats/);
assert.match(worker, /\[1, 2, 3\]\.find\(\(seat\) => !humanSeats\.has\(seat\)\)/);
assert.match(worker, /CPU Fill is only a future Start placeholder/);
assert.match(worker, /room_full_humans/);
assert.match(worker, /staleCpuSeatIds\.filter\(\(cpuSeatId\) => cpuSeatId !== seatId\)/);
assert.match(worker, /lastSeenAt: typeof player\.lastSeenAt === "number"/);

assert.match(api, /roomName: string/);
assert.match(api, /room_full_humans/);
assert.match(api, /roomName: roomName\.trim\(\) \|\| 'Phòng MeMeMe'/);

assert.match(localLobby, /id="online-room-name"/);
assert.match(localLobby, /TÊN PHÒNG/);
assert.match(localLobby, /createOnlineRoom0703\(hostName/);
assert.match(localLobby, /roomName\)/);

assert.match(roomLobby, /id="online-room-name"/);
assert.match(roomLobby, /online-room-code-line/);
assert.match(roomLobby, /state\.roomName \|\| 'PHÒNG MEMEME'/);

console.log('[online-human-cpu-room-name-07041] PASS human-over-CPU seating + custom room name + host device forwarding');
