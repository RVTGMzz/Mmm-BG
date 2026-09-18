import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const worker = readFileSync('cloudflare/mememe-online/src/index.ts', 'utf8');
const config = readFileSync('cloudflare/mememe-online/wrangler.jsonc', 'utf8');
const pkg = readFileSync('cloudflare/mememe-online/package.json', 'utf8');

assert.match(config, /"name": "mememe-online"/);
assert.match(config, /"MEMEME_ROOMS"/);
assert.match(config, /"class_name": "MeMeMeRoom"/);
assert.match(config, /"storage": "sqlite"/);
assert.match(config, /"compatibility_date": "2026-09-18"/);

assert.match(worker, /class MeMeMeRoom extends DurableObject/);
assert.match(worker, /ctx\.acceptWebSocket\(server\)/);
assert.match(worker, /serializeAttachment/);
assert.match(worker, /deserializeAttachment/);
assert.match(worker, /POST" && url\.pathname === "\/api\/rooms"/);
assert.match(worker, /hostTokenHash/);
assert.match(worker, /Seat already occupied/);
assert.match(worker, /Replaced by reconnect/);
assert.match(worker, /host_offline/);
assert.match(worker, /https:\/\/ronvotri\.github\.io/);
assert(!worker.includes('Math.random('), 'room IDs/tokens must use crypto, not Math.random');

assert.match(pkg, /"wrangler": "\^4\.102\.0"/);
console.log('[online-worker-foundation-0702] PASS Worker + SQLite Durable Object + hibernating WebSocket relay');
