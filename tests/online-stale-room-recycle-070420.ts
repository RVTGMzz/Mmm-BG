import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const transport = readFileSync('src/core/onlineTransport0702.ts', 'utf8');
const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const workerPackage = readFileSync('cloudflare/mememe-online/package.json', 'utf8');

// Frontend presentation may advance while the production Worker intentionally
// remains on its validated 0.1.70.4.20 transport contract.
assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

// Client transport emits an application-level heartbeat only while a live socket is open.
assert.match(transport, /ONLINE_KEEPALIVE_INTERVAL_MS_070420 = 20_000/);
assert.match(transport, /ONLINE_KEEPALIVE_KIND_070420 = '__transport_keepalive_070420'/);
assert.match(transport, /this\.startKeepalive070420\(socket\)/);
assert.match(transport, /this\.clearKeepalive070420\(\)/);
assert.match(transport, /socket\.readyState !== WebSocket\.OPEN/);
assert.match(transport, /payload: \{ kind: ONLINE_KEEPALIVE_KIND_070420, at: Date\.now\(\) \}/);

// Worker tracks freshness per physical WebSocket, including old hibernated sockets.
assert.match(worker, /lastSeenAt: number;/);
assert.match(worker, /SOCKET_STALE_MS_070420 = 120_000/);
assert.match(worker, /typeof attachment\.lastSeenAt === "number"/);
assert.match(worker, /: attachment\.joinedAt/);
assert.match(worker, /socket\.close\(4005, "Stale transport socket\."\)/);
assert.match(worker, /this\.pruneStaleSockets070420\(now\) === 0/);

// Incoming gameplay or keepalive traffic refreshes the attachment; keepalive is swallowed
// inside the relay and never leaks into gameplay/media subscribers.
assert.match(worker, /sender\.lastSeenAt = activityAt/);
assert.match(worker, /socket\.serializeAttachment\(sender\)/);
assert.match(worker, /transportPayload\?\.kind === TRANSPORT_KEEPALIVE_KIND_070420\) return/);

// A close/error callback is not liveness. It must not move lastSocketActivityAt forward.
const closeBlock = worker.slice(
  worker.indexOf('async webSocketClose'),
  worker.indexOf('private broadcastPresence'),
);
assert.doesNotMatch(closeBlock, /storage\.put\("lastSocketActivityAt"/);

// Production identity exposes the new worker contract.
assert.match(worker, /milestone: "0\.1\.70\.4\.20"/);
assert.match(worker, /socketStaleMs: SOCKET_STALE_MS_070420/);
assert.match(worker, /transportKeepalive: true/);
assert.match(workerPackage, /"version": "0\.1\.70\.4\.20"/);

console.log('[online-stale-room-recycle-070420] PASS keepalive + ghost socket expiry + custom room recycle guard');
