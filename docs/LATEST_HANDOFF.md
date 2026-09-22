# MeMeMe — Latest Handoff

Branch: `mmm-mvp-0.1-core`

Legacy PR #1 remains Draft/Open on `mememe-mvp-0.1-core`.
Do not merge or mark Ready unless Ron explicitly asks.

## Current checkpoint

**0.1.70.4.20 — Stale Room Recycle + WebSocket Keepalive**

Primary fix:
- abandoned started rooms must eventually release reusable custom room codes such as `123123`;
- active game/media/demo-shell sockets send application-level keepalive every 20 seconds;
- Worker expires a socket after 120 seconds without real transport activity;
- hibernated sockets created before 0.1.70.4.20 fall back to `joinedAt`, so old ghost sockets can be pruned;
- close/error callbacks do not refresh room activity;
- keepalive packets are consumed inside the Worker and never leak into gameplay/media event handlers.

## Why 0.1.70.4.20 exists

Live diagnosis of room `123123` on the previous Worker returned:

- `started: true`
- `closed: false`
- Host: disconnected
- P2: disconnected
- CPU seats: P3/P4

The old recycle rule counted every Durable Object WebSocket returned by `getWebSockets()` as alive forever. A hibernated/dead socket could therefore keep a started room code locked indefinitely.

## Source validation

Known-good source CI:
- MMM MVP CI #3177: SUCCESS
- run: `35683258683`

Earlier full .20 CI after phase/test migration:
- MMM MVP CI #3176: SUCCESS
- run: `35683212692`

The .20 gate is:
- `tests/online-stale-room-recycle-070420.ts`
- script: `test:online-stale-room-recycle-070420`

Historical .19 live Worker smoke remains in CI and verifies:
- create/join/ready/start;
- post-start P2 reclaim;
- game relay both directions;
- simulated client reload;
- media roster + signal relay.

## Public frontend

Pages:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Public mirror containing the compiled .20 frontend:
`f96edc0dd2bba6a67b1f8d84eff8b2e7838f33c4`

Pages workflow:
- run `35621418803`
- SUCCESS

## Production Worker status — DEPLOY BLOCKED

The live Worker health endpoint still reports:

`milestone: 0.1.70.4.3`

A production deploy workflow is now prepared:

`.github/workflows/deploy-online-worker.yml`

It uses Cloudflare account:
`0fd870345f30d738da3d55ad72de39ce`

GitHub currently has no usable Cloudflare deployment token under any checked alias:
- `CLOUDFLARE_API_TOKEN`
- `CF_API_TOKEN`
- `CLOUDFLARE_WORKERS_TOKEN`
- `CLOUDFLARE_TOKEN`

Therefore Wrangler cannot deploy the new Worker yet.

Required one-time repository secret:
`CLOUDFLARE_API_TOKEN`

After the secret is added, rerun **Deploy MeMeMe Online Worker**. The workflow will:
1. deploy `cloudflare/mememe-online`;
2. wait for health to report `0.1.70.4.20`;
3. fail if production did not actually update.

A separate one-shot probe remains temporarily at:
`.github/workflows/worker-probe-070420.yml`

After production .20 is live, use it to prove that stale custom code `123123` can be reclaimed and closed cleanly, then delete the temporary probe workflow.

## Runtime status

Do **not** call 0.1.70.4.20 Runtime PASS yet.

Pending:
1. production Worker deploy;
2. live reclaim of custom room `123123`;
3. two-device online test;
4. camera/voice real-device confirmation.

Cloudflare Pages `mwp-test` deployment checks are frontend previews only. They do not deploy the `mememe-online` Worker.

Do not merge PR #1.
Do not resume 0.1.71 until this checkpoint is resolved.
