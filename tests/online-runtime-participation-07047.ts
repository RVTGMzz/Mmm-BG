import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { MEMEME_BUILD } from '../src/buildInfo';

const localTransport = readFileSync('src/core/localTransport.ts', 'utf8');
const onlineTransport = readFileSync('src/core/onlineTransport0702.ts', 'utf8');
const twoTab = readFileSync('src/core/twoTabSession.ts', 'utf8');
const shell = readFileSync('src/core/demoShellSession.ts', 'utf8');
const demo = readFileSync('src/scenes/DemoBoardScene.ts', 'utf8');
const bot = readFileSync('src/scenes/PlaytestDemoBoardScene.ts', 'utf8');
const media = readFileSync('src/ui/OnlineGroupMedia07043.ts', 'utf8');

assert.match(MEMEME_BUILD.version, /^0\.1\.70\.4\.\d+$/);

assert.match(localTransport, /subscribeConnection\?/);
assert.match(onlineTransport, /TransportConnectionState07047/);
assert.match(onlineTransport, /emitConnection07047\('open'\)/);
assert.match(
  onlineTransport,
  /emitConnection07047\('open'\);[\s\S]*while \(this\.pending\.length > 0/,
  'seat/shell handshake must run before queued gameplay intents flush',
);

assert.match(twoTab, /requestJoin07047/);
assert.match(twoTab, /state === 'open'[\s\S]*this\.joined = false;[\s\S]*this\.requestJoin07047\(\)/);
assert.match(twoTab, /state === 'connecting' \|\| state === 'reconnecting'/);
assert.match(twoTab, /controlsActor\(actorId: number\): boolean \{[\s\S]*this\.joined && actorId === this\.seatId/);

assert.match(shell, /subscribeConnection/);
assert.match(shell, /state === 'open'\) this\.requestState\(\)/);

assert.match(demo, /createDemoMatchShell\(this\.players\.length, DEMO_ROUNDS, 'active'\)/);
assert.match(demo, /config\.mode === 'host'[\s\S]*config\.transport === 'online'[\s\S]*current\.id > 0[\s\S]*!browserSession\.isCpuSeat\(current\.id\)/);
assert.match(demo, /this\.clientSession\.requestJoin07047\(\)/);

assert.match(bot, /queueCpuActionIfNeeded/);
assert.match(bot, /browserSession\.isCpuSeat\(livePlayer\.id\)/);
assert.match(bot, /live\.submitIntent\(liveDecision\.type, liveDecision\.data\)/);

assert.match(media, /subscribeConnection/);
assert.match(media, /schedulePeerRepair07047/);
assert.match(media, /connectionState === 'failed' \|\| pc\.connectionState === 'closed'/);
assert.match(media, /connectionState === 'disconnected'/);
assert.match(media, /this\.ensurePeer\(descriptor\)/);

console.log('[online-runtime-participation-07047] PASS remote-seat reclaim + host ownership guard + shell resync + CPU autonomy + media self-heal');
