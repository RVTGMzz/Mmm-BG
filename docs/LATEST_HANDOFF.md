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

Current public compiled mirror:
`73684a5a0dcb810c1a378f081dec5dd0a0bd5604`

Pages workflow:
- run: `35811832269`
- conclusion: SUCCESS

This public build contains:
- 0.1.70.4.20 Worker-compatible frontend;
- Visual Foundation VF-01 + VF-02;
- Vietnamese typography stabilization;
- Roguelike Lap Shuffle 0.1.

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

## Roguelike Lap Shuffle 0.1

Implementation document:
`docs/ROGUELIKE_LAP_SHUFFLE_0.1.md`

Status:
**IMPLEMENTED / CI PASS / RUNTIME RETEST REQUIRED**

Rule:
- first player to cross Start for lap N triggers exactly one global shuffle for lap N;
- later players reaching the same lap do not reshuffle;
- graph topology and coordinates stay fixed;
- tile content bundles move together.

Locked positions:
- Start;
- Job;
- Police/Jail gate + hold;
- Jail Exit 1/2/3;
- Hospital gate + hold;
- Hospital Exit 1/2/3.

Mutable pool includes:
- TIN TỨC;
- LÁ BÀI;
- money +/-;
- Mini Game;
- Lottery;
- ordinary spaces.

Authority:
- uses serializable HOST RNG only;
- no `Math.random()`;
- layout lives in MatchState;
- layout is checksum-covered;
- layout serializes for reconnect/snapshot;
- replay deterministically reconstructs the same shuffle.

Presentation:
- global `board_shuffle` event;
- “BÀN CỜ ĐÃ BIẾN ĐỔI!”;
- board tiles update on the presentation beat, not early;
- shuffled tiles pop/flip into their authoritative identities.

Validation:
- MMM MVP CI #3192
- run: `35811772094`
- conclusion: SUCCESS
- typecheck/build: SUCCESS
- retained outlier replay rebased intentionally for the new HOST RNG consumption;
- `test:roguelike-lap-shuffle-071`: SUCCESS
- compiled mirror publish: SUCCESS

Retained deterministic sentinels after the intentional gameplay change:
- seed 611102 checksum `70355e64`;
- seed 611112 checksum `143e052b`.

Do not call this feature Runtime PASS until real play confirms one-shuffle-per-lap, locked nodes, correct visible/effective tile identity, two-device parity and reconnect restoration.

## 0.1.70.4.21 — Final Modal Ownership + Career Layout

Status:
**SOURCE IMPLEMENTED / CI PASS / PUBLIC DEPLOYED / RUNTIME RETEST REQUIRED**

Runtime feedback that triggered this pass:
- loose board/event narration could reappear behind a Card/News modal after later scene wrappers ran;
- Job Hub / nhận việc layout still felt crowded and visually unbalanced.

Changes:
- final active scene now runs a last-frame modal ownership guard after all inherited update layers;
- any loose non-canonical Text is hidden while a real modal is active;
- player HUD/token identity, reaction bubbles and continue hints stay protected;
- Job Hub is rebuilt as three compact rounded career cards;
- each Job card keeps one readable Lv1/Lv2/Lv3 salary line and one XEM CHI TIẾT action;
- redundant “lương khởi điểm” copy is removed;
- Job detail uses a smaller centered career sheet;
- Job result presentation is rebuilt as one centered cream/yellow card with “ĐÃ NHẬN VIỆC” instead of split left/right text;
- Job surfaces use Vietnamese-safe system UI fonts.

Regression gate:
- `tests/final-modal-career-layout-070421.ts`

Validation:
- source HEAD: `d9cb0623f8f5db8dfaae2206e456eec9fd460b4a`
- MMM MVP CI #3201
- run: `35813758452`
- conclusion: SUCCESS
- 0.1.70.4.21 final modal ownership + career layout: SUCCESS
- Roguelike Lap Shuffle gate: SUCCESS
- package validation: SUCCESS
- compiled mirror publish: SUCCESS
- public mirror: `6a87a8072de9d9f3cddf48021468d1dfe76c07a6`
- Pages run: `35813830898`
- Pages conclusion: SUCCESS

Do not call Runtime PASS until Ron rechecks the exact leak screenshot scenario and Job Hub/result flow.

## Runtime acceptance still pending

Automated/live infrastructure proof is PASS.

Do not call full 0.1.70.4.20 Runtime PASS until Ron confirms on real devices:
1. create room `123123` from the game UI;
2. second device joins;
3. each human acts only on own turn;
4. reload P2 during an active match and reclaim the same seat;
5. no stale black `CHỜ HOST` overlay;
6. P1/P2 camera tracks are mutually visible when both enable camera.

0.1.70.4.20 online acceptance is still not formally closed. By explicit user request, the Roguelike Lap Shuffle gameplay layer has already been implemented on the active playtest branch; do not interpret that as a retroactive Runtime PASS for the .20 online checkpoint.

Do not merge PR #1.
