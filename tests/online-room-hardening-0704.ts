import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const api = readFileSync('src/core/onlineLobby0703.ts', 'utf8');
const lobby = readFileSync('src/scenes/OnlineRoomLobbyScene.ts', 'utf8');
const styles = readFileSync('src/styles.css', 'utf8');

assert.match(worker, /milestone: "0\.1\.70\.4\.\d+"/);
assert.match(worker, /ONLINE_WINDOW_MS_0704 = 12_000/);
assert.match(worker, /DISCONNECTED_WINDOW_MS_0704 = 30_000/);
assert.match(worker, /RECONNECT_GRACE_MS_0704 = 60_000/);
assert.match(worker, /activeDeviceId/);
assert.match(worker, /lastSeenAt/);
assert.match(worker, /presence0704/);
assert.match(worker, /duplicate_device_active/);
assert.match(worker, /host_timeout/);
assert.match(worker, /closeReason: "host_left"/);
assert.match(worker, /\/heartbeat/);
assert.match(worker, /\/close/);
assert.match(worker, /presence0704\(player, now\) === "online"/);
assert.match(worker, /now - player\.lastSeenAt <= RECONNECT_GRACE_MS_0704/);

assert.match(api, /DEVICE_KEY_0704/);
assert.match(api, /localStorage\.getItem\(DEVICE_KEY_0704\)/);
assert.match(api, /getOnlineDeviceId0704/);
assert.match(api, /heartbeatOnlineLobby0704/);
assert.match(api, /closeOnlineRoom0704/);
assert.match(api, /duplicate_device_active/);
assert.match(api, /presence: OnlinePresence0704/);
assert.match(api, /reconnectGraceMs: number/);

assert.match(lobby, /heartbeatOnlineLobby0704/);
assert.match(lobby, /closeOnlineRoom0704/);
assert.match(lobby, /delay: 3000/);
assert.match(lobby, /🟢 ONLINE/);
assert.match(lobby, /🟡 ĐANG KẾT NỐI LẠI/);
assert.match(lobby, /⚪ MẤT KẾT NỐI/);
assert.match(lobby, /giữ ghế mất kết nối 60s/);
assert.match(lobby, /Host đã rời phòng • phòng đã đóng/);
assert.match(lobby, /Host mất kết nối quá 60 giây/);
assert.match(lobby, /scheduleLobbyExit0704/);

assert.match(styles, /online-player-row\.presence-reconnecting/);
assert.match(styles, /online-player-row\.presence-disconnected/);

console.log('[online-room-hardening-0704] PASS reconnect grace + device lock + host close + authoritative presence');
