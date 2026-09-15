# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## Current candidate

**MVP 0.1.63.2 — Movement Actor Camera Lock**

Ron reported that 0.1.63.1 still let the moving token leave the viewport on long rolls such as 5 or 6.

Root cause:
- authoritative `currentPlayer()` can already advance to the next player before queued movement presentation finishes;
- 0.1.63.1 centered the authoritative current player instead of the actor still being animated.

0.1.63.2 fixes presentation-only camera targeting:
- active presentation `actorId` has priority over authoritative current-turn player;
- every `move_step` stays centered on the token actually moving;
- landing stays framed on the same mover;
- when presentation becomes idle, camera returns to `currentPlayer()`;
- `TỔNG QUAN / O` remains the intentional exception.

Manual status: **PENDING RON ACCEPTANCE**.

## Current runtime

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0632 as ActiveBoardScene`

Inheritance:
`0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## New regression

New files:
- `src/ui/cameraTarget0632.ts`
- `src/scenes/CareerMinigameBoardScene0632.ts`
- `tests/movement-actor-camera-lock-0632.ts`
- `docs/PLAYTEST_0.1.63.2_MOVEMENT_ACTOR_CAMERA_LOCK.md`

Critical locked case:
- P1 presentation is still moving;
- authoritative turn already says P2;
- resolver must return **P1** for camera target.

When no presentation model is active, resolver falls back to P2/current turn.

0.1.63.1 expanded edge bounds remain inherited. No gameplay intent or RNG is added.

## Presentation retained

From 0.1.63/0.1.63.1:
- landing/event UI **1.18x**;
- Card/News UI **1.14x**;
- token scale **0.82x**;
- round radii **27/31/33/36**;
- gameplay zoom **2.15x**;
- Overview **0.88x**;
- expanded camera bounds for edge centering.

Visible labels:
- `CITY • MVP 0.1.63.2 • MOVEMENT ACTOR CAMERA LOCK`
- `PLAYTEST 0.1.63.2 • CAMERA BÁM TOKEN ĐANG DI CHUYỂN`

## Gameplay retained from 0.1.62

Branch rule remains HOST-authoritative:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

No manual branch picker, no second RNG stream, and no changes to economy, Card/News, Job, Mini Game, Jail/Hospital/Lottery or READY finish-lock.

## QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

0.1.62 deterministic gameplay baseline remains valid because 0.1.63.2 is presentation-only.

Exact active sentinels remain:
- seed `611119`, checksum `9d83fad4`;
- seed `611113`, checksum `1074ba94`.

## Green code candidate before docs update

- HEAD `cd3a843d9c82f1e37fd4589eeedb3b67b76be97e`;
- push run `#2244` / `34965761179`;
- artifact `mememe-playtest-0.1.63.2-movement-actor-camera`;
- artifact ID `10395341522`;
- size `8,591,383 bytes`;
- SHA256 `bc1b9f490ea5ff0a62876cfcd6798943b2ed10f6e45e904764c08ee0be8d04ba`;
- expires 2026-09-29.

Run #2244 passed the full suite, including the new visual-mover-vs-advanced-turn camera regression.

## Next manual check

Use:
`docs/PLAYTEST_0.1.63.2_MOVEMENT_ACTOR_CAMERA_LOCK.md`

Verify especially:
- rolls 5/6 never let the moving token leave the viewport;
- camera remains on the visual mover even if turn state has already advanced;
- camera transfers cleanly after landing presentation finishes;
- Overview still works;
- long-run token snap-back does not return.

Do not call 0.1.63.2 accepted until Ron confirms it manually.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
