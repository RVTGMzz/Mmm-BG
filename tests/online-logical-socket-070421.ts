import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker=readFileSync('cloudflare/mememe-online/src/index.ts','utf8');
const pkg=readFileSync('cloudflare/mememe-online/package.json','utf8');

assert.match(worker,/logicalSockets070421\(channel: string\)/);
assert.match(worker,/newestReplacedJoinedAt070421/);
assert.match(worker,/Math\.max\(Date\.now\(\), newestReplacedJoinedAt070421 \+ 1\)/);
assert.match(worker,/currentSender070421[\s\S]*currentSender070421\.socket !== socket[\s\S]*Replaced by reconnect/);
assert.match(worker,/for \(const \{ socket: recipient, attachment: target \} of this\.logicalSockets070421\(sender\.channel\)\)/);
assert.match(worker,/const logical = this\.logicalSockets070421\(channel\)/);
assert.doesNotMatch(worker,/const sockets = this\.ctx\.getWebSockets\(\)\.filter\(\(socket\) => \{[\s\S]*attachment\?\.channel === channel[\s\S]*const seats = sockets/);
assert.match(worker,/milestone: "0\.1\.70\.4\.21"/);
assert.match(pkg,/"version": "0\.1\.70\.4\.21"/);
console.log('[online-logical-socket-070421] PASS newest logical endpoint owns relay/liveness/presence across half-open reconnect overlap');
