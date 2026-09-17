# NEXT CHAT PROMPT — MeMeMe Board Game

Tiếp tục MeMeMe Board Game từ `HANDOFF_CURRENT.md` trên branch `mememe-mvp-0.1-core`.

Đọc theo thứ tự:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `src/core/releaseFlow0701.ts`
4. `src/core/cpuReleaseResume066.ts`
5. `tests/unified-flow-match-length-066.ts`
6. `src/scenes/DirectDiceBoardScene.ts`
7. `src/scenes/CareerMinigameBoardScene0701.ts`
8. `src/scenes/TurnOrderScene0701.ts`
9. `src/main.ts`

## Current milestone

**0.1.70.1 — Release Flow Repair + UI Density Pass**

Do not resume 0.1.71 yet.
Do not merge PR #1.

## User runtime feedback

Ron repeatedly reproduced:
- successful **ĐƯỢC THẢ! / XUẤT VIỆN!**;
- then the game freezes instead of receiving a new movement D6.

Historical clue:
- early versions did not freeze like this;
- later the rule changed from effectively using the release die to requiring a **fresh movement D6 after release**.

Canonical contract:

`release-check D6 -> success -> consume check -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move`

Human and CPU must share the same authoritative transition.

## Current exact CI blocker

Source HEAD before handoff docs:
`ab47514ae85a3f4e89431e64dec3b9f0ab48ce9d`

PR CI:
- run #2917
- id `35286379481`

Build/typecheck PASS.
Everything through 0.1.65.1 PASS.

Failure:
`0.1.66 unified flow match length and Mini Game readability`

At:
`tests/unified-flow-match-length-066.ts`

Assertion:
`pendingFreshRollAfterRelease066(releaseResume, true, 0)`

Expected `1`, got `undefined`.

Root mismatch:
`src/core/cpuReleaseResume066.ts`

Historical general helper still does:
`if (presentationBlocking) return undefined;`

But 0.1.70.1 authoritative detector:
`pendingFreshMovementRollAfterRelease0701(...)`

is intentionally presentation-independent.

CPU helper already ignores presentation blocking.

## Immediate task

Fix the compatibility mismatch cleanly.

Preferred architecture:
- authority reports that a fresh movement D6 is owed regardless of presentation;
- UI decides when human roll control can be shown/clicked;
- CPU resumes from the same authoritative state;
- do not add another watchdog or authority source;
- preserve HOST/replay/checksum determinism.

Then run full CI through the 0.1.70.1 gate.

Only after exact HEAD CI + publisher + public mirror + Pages are all green, give Ron a test URL.

## Manual test matrix after publish

- Human Jail success -> fresh D6 -> movement
- Human Hospital success -> fresh D6 -> movement
- CPU Jail success -> fresh D6 -> movement
- CPU Hospital success -> fresh D6 -> movement

Also verify:
- failed release ends turn;
- release face is not reused;
- Career Traits remain correct;
- no text leaks outside modals;
- Roll For Order is rounded/denser;
- Mini Game ranking is fuller/clearer;
- bottom-center blank `compactCard` is gone on CPU turns.

0.1.48 remains the last explicitly user-accepted rollback baseline.
Keep **TIN TỨC / LÁ BÀI**.
Do not call Runtime PASS until Ron confirms.
