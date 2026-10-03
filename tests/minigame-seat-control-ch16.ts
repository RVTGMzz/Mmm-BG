import assert from 'node:assert/strict';
import type { BrowserSessionConfig } from '../src/core/browserSession';
import { controlsMiniGameSeatCh16 } from '../src/ui/minigameSeatControlCh16';

function cfg(overrides: Partial<BrowserSessionConfig>): BrowserSessionConfig {
  return {
    mode: 'solo',
    transport: 'local',
    roomCode: '',
    clientId: 'test',
    seatId: 0,
    cpuSeatIds: [],
    onlineBaseUrl: '',
    hostToken: '',
    reconnectToken: '',
    cameraAllowed: false,
    voiceAllowed: false,
    ...overrides,
  };
}

// 1P + 3CPU: only P1 can choose.
const solo = cfg({ mode: 'solo', cpuSeatIds: [1, 2, 3] });
assert.equal(controlsMiniGameSeatCh16(solo, 0), true);
assert.equal(controlsMiniGameSeatCh16(solo, 1), false);

// 2P + 2CPU / HOTSEAT: all non-CPU humans on the same device choose sequentially.
const hotseat2 = cfg({ mode: 'solo', cpuSeatIds: [2, 3] });
assert.equal(controlsMiniGameSeatCh16(hotseat2, 0), true);
assert.equal(controlsMiniGameSeatCh16(hotseat2, 1), true);
assert.equal(controlsMiniGameSeatCh16(hotseat2, 2), false);

const hotseat4 = cfg({ mode: 'solo', cpuSeatIds: [] });
for (const id of [0, 1, 2, 3]) assert.equal(controlsMiniGameSeatCh16(hotseat4, id), true);

// Network host owns P1 only.
const host = cfg({ mode: 'host', transport: 'online', roomCode: 'ROOM', seatId: 0 });
assert.equal(controlsMiniGameSeatCh16(host, 0), true);
assert.equal(controlsMiniGameSeatCh16(host, 1), false);

// Remote client owns only its joined seat.
const client = cfg({ mode: 'client', transport: 'online', roomCode: 'ROOM', seatId: 2 });
assert.equal(controlsMiniGameSeatCh16(client, 2), true);
assert.equal(controlsMiniGameSeatCh16(client, 0), false);
assert.equal(controlsMiniGameSeatCh16(client, 3), false);

// CPU never becomes interactive even if it matches a configured seat.
const cpuClient = cfg({ mode: 'client', transport: 'online', roomCode: 'ROOM', seatId: 2, cpuSeatIds: [2] });
assert.equal(controlsMiniGameSeatCh16(cpuClient, 2), false);

console.log('[minigame-seat-control-ch16] PASS solo/hotseat/network seat ownership');
