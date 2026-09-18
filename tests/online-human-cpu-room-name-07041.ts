import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const api = readFileSync('src/core/onlineLobby0703.ts', 'utf8');
const localLobby = readFileSync('src/scenes/LocalLobbyScene.ts', 'utf8');
const roomLobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.4\.1"/);
assert.match(worker, /deviceId: String\(body\.deviceId/);
assert.match(worker, /firstFreeHumanSeat07041/);
assert.match(worker, /CPU Fill never reserves lobby seats/);
assert.match(worker, /\[1, 2, 3\]\.find\(\(seat\) => !humanSeats\.has\(seat\)\)/);
assert.match(worker, /room_full_humans/);
assert.match(worker, /staleCpuSeatIds\.filter\(\(cpuSeatId\) => cpuSeatId !== seatId\)/);

assert.match(worker, /rawRequestedCode/);
assert.match(worker, /\^\[A-Z0-9\]\{4,8\}\$/);
assert.match(worker, /requestedRoomCode \? 1 : 6/);
assert.match(worker, /room_code_taken/);
assert.match(worker, /invalid_custom_room_code/);
assert.match(worker, /await this\.ctx\.storage\.deleteAll\(\)/);
assert.match(worker, /stalePrematch/);
assert(!worker.includes('normalizeRoomName07041'));
assert(!worker.includes('roomName'));

assert.match(api, /requestedRoomCode = ''/);
assert.match(api, /roomCode: roomCode/);
assert.match(api, /room_code_taken/);
assert.match(api, /invalid_custom_room_code/);
assert(!api.includes('roomName'));

assert.match(localLobby, /MÃ PHÒNG/);
assert.match(localLobby, /Tự đặt 4–8 ký tự/);
assert.match(localLobby, /requestedRoomCode/);
assert.match(localLobby, /createOnlineRoom0703\(hostName/);
assert.match(localLobby, /Mã phòng cần 4–8 ký tự/);
assert(!localLobby.includes('TÊN PHÒNG'));
assert(!localLobby.includes('online-room-name'));

assert.match(roomLobby, /PHÒNG <strong id="online-room-code"/);
assert(!roomLobby.includes('online-room-name'));

console.log('[online-human-cpu-custom-code-07041] PASS human-over-CPU seating + custom reusable 4-8 char room codes');
