# MeMeMe — Latest Handoff

Branch: `mmm-mvp-0.1-core`

Legacy PR #1 remains Draft/Open.
Do not merge or mark Ready unless Ron explicitly asks.

## Current checkpoint

**0.1.70.4.20 — Stale Room Recycle + WebSocket Keepalive**

Production Worker is LIVE.

Worker health:
- milestone: `0.1.70.4.20`
- transport: `websocket-durable-object`
- lobbyAuthority: `true`
- socketStaleMs: `120000`
- transportKeepalive: `true`

Cloudflare Worker deploy:
- source commit: `719dda74890892be6990c50056bc73965a6746a4`
- Workers Build: SUCCESS
- Build ID: `c632b158-54f4-420f-aede-dd5cb8cbe410`
- Version ID: `68ff7a16-74d7-49d2-87de-d3ecd97eb196`

## 0.1.70.4.20 fix

- active online sockets send application-level keepalive every 20 seconds;
- a socket becomes stale after 120 seconds without real transport activity;
- hibernated pre-.20 sockets fall back to `joinedAt` so old ghost sockets can finally expire;
- stale sockets are closed and ignored by room-recycle authority;
- close/error callbacks no longer fake liveness by refreshing `lastSocketActivityAt`;
- transport keepalive is swallowed by the Worker and never leaks to gameplay/media subscribers;
- a started abandoned room can release its custom code after reconnect grace.

## Custom room 123123 — LIVE PROOF

The old stuck room `123123` was successfully reclaimed on production .20.

Probe result:
- health returned milestone `0.1.70.4.20`;
- create custom room `123123` returned HTTP `201`;
- room started fresh with Host only;
- cleanup/close returned `closed: true` and `closeReason: host_left`.

The temporary one-shot room probe workflow was removed after proof.

## Validation

Full source CI rerun after production .20 became live:
- MMM MVP CI #3181
- run: `35754944337`
- attempt: 2
- conclusion: SUCCESS

Important gates:
- typecheck/build: SUCCESS
- .19 live two-device reconnect + media relay smoke: SUCCESS
- .20 stale room recycle + WebSocket keepalive: SUCCESS
- external package validation: SUCCESS
- compiled mirror publish: SUCCESS

The live .19 smoke covers:
- create/join/ready/start;
- post-start P2 seat reclaim;
- Host -> P2 and P2 -> Host game relay;
- simulated P2 socket reload/reconnect;
- authenticated media roster relay;
- authenticated media signal relay.

Wrangler Worker dry-run also passes independently.

## Public frontend

GitHub Pages:
`https://ronvotri.github.io/MeMeMe-Web-Playtest/`

Public compiled mirror remains:
`f96edc0dd2bba6a67b1f8d84eff8b2e7838f33c4`

The frontend already contains 0.1.70.4.20. Later source-only workflow/docs commits do not change compiled output.

## Cloudflare Git integration

Production Worker now uses:
- repository: `RVTGMzz/Mmm-BG`
- branch: `mmm-mvp-0.1-core`
- root: `/cloudflare/mememe-online`
- deploy command: `npx wrangler deploy`

The earlier `mememe-mvp-0.1-core` branch is historical and must not be used for production Worker deploys.

Durable Object binding remains:
- `MEMEME_ROOMS` -> `mememe-online_MeMeMeRoom`

Do not delete or recreate the Durable Object binding.

## Visual direction

Canonical visual direction:
`docs/VISUAL_STYLE_BIBLE_V0.1.md`

Title:
**Visual Style Bible v0.1**

Direction locked for future presentation work:
- chibi;
- cozy;
- rounded;
- toy-like;
- pastel/candy colour;
- mobile-first oversized readable interaction;
- soft depth and sticker-like icons;
- board/world should feel like a playful diorama rather than a technical tile grid.

The supplied casual-game references are directional moodboard material only. Do not copy their proprietary characters, logos, layouts or illustrations one-for-one.

This visual direction is subordinate to the canonical UI/UX runtime-safety contract and must preserve Host authority, deterministic RNG, reconnect ownership, CPU autoplay, modal ownership and mobile safe areas.

## Active visual implementation plan

Implementation document:
`docs/VISUAL_FOUNDATION_PASS_0.1.md`

Current visual implementation status:
- VF-01 shared design tokens: IMPLEMENTED
- VF-02 canonical button family: IMPLEMENTED
- live adoption: mode select, online room, setup footer, rule-confirm flow
- regression test: `tests/visual-foundation-v01.ts`
- VF-01.1 Vietnamese typography stabilization: IMPLEMENTED
  - removed `ui-rounded / Arial Rounded MT Bold` from canonical VF font stack;
  - canonical VF surfaces now use Vietnamese-safe system UI glyph coverage;
  - lobby placeholder is reduced to secondary metadata size so it no longer crowds/clips;
  - VF-02 primary/secondary buttons have stronger toy-like highlight + depth.
- VF-03 panel/modal shell: NEXT

Canonical rollout order:
1. shared design tokens ✅;
2. button family ✅;
3. panel/modal shell;
4. player HUD;
5. one TIN TỨC canonical sample;
6. one Job canonical sample;
7. desktop + phone-landscape foundation review.

Do not reskin the entire runtime in one pass. Components are built and validated first, then propagated.

## Runtime acceptance still pending

Automated/live infrastructure proof is PASS.

Do not call full 0.1.70.4.20 Runtime PASS until Ron confirms on real devices:
1. create room `123123` from the game UI;
2. second device joins;
3. each human acts only on own turn;
4. reload P2 during an active match and reclaim the same seat;
5. no stale black `CHỜ HOST` overlay;
6. P1/P2 camera tracks are mutually visible when both enable camera.

If those real-device checks pass, close 0.1.70.4.x as the stable baseline and proceed to 0.1.71.

Do not merge PR #1.
