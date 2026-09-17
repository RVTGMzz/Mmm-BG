# NEXT CHAT PROMPT — MeMeMe Board Game

Tiếp tục MeMeMe Board Game từ `HANDOFF_CURRENT.md` trên branch `mememe-mvp-0.1-core`.

Đọc:
1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. Ron's newest runtime feedback
4. `src/core/releaseFlow0701.ts`
5. `src/core/cpuReleaseResume066.ts`
6. `src/scenes/DirectDiceBoardScene.ts`
7. `src/scenes/CareerMinigameBoardScene0701.ts`

## Current milestone

**0.1.70.1 — Release Flow Repair + UI Density Pass**

Status: **release candidate published, waiting for Ron's human runtime test**.

Do not resume 0.1.71 yet.
Do not merge PR #1.

## What was fixed

Canonical rule:

`release-check D6 -> success -> clear hold -> same turn PRE_ROLL_ACTION + lastRoll=null -> NEW movement D6 -> move`

The historical `pendingFreshRollAfterRelease066(...)` compatibility path no longer lets `presentationBlocking` veto the authoritative fresh-roll obligation.

Human controls remain presentation-safe in `DirectDiceBoardScene`.

Runtime-affecting fix commit:
`f07ad68298bb6737e92a73dcb9a9f075160229c6`

## Validation already completed

- push CI #2924: SUCCESS
- PR CI #2925: SUCCESS
- 0.1.66 unified-flow gate: PASS
- 0.1.70.1 gate: PASS
- publisher #221: SUCCESS
- publisher exact-SHA + current-HEAD guards: PASS
- public mirror matches rebuilt compiled source
- public Pages #32 build/deploy: SUCCESS

Public test URL:
`https://ronvotri.github.io/ronvotri-MeMeMe-Web-Playtest/`

The public mirror did not need a new commit because the rebuilt runtime bundle is byte-equivalent to the already deployed mirror. The final compatibility fix affected the historical helper/test contract, not emitted runtime bytes.

## Next authority is Ron's runtime feedback

Test matrix:
- Human Jail success -> fresh D6 -> movement
- Human Hospital success -> fresh D6 -> movement
- CPU Jail success -> fresh D6 -> movement
- CPU Hospital success -> fresh D6 -> movement

Also verify:
- failed release ends turn normally;
- release face is never reused;
- Career Traits remain correct;
- release modal self-closes;
- no narration/card text leaks outside modal;
- Roll For Order remains denser/rounded;
- Mini Game ranking remains readable;
- CPU turn no longer shows the old bottom-center blank card box.

If any case fails, debug 0.1.70.1 from the runtime feedback. Do not move to 0.1.71.
If all four pass, record Ron's human acceptance before advancing.

0.1.48 remains the last explicitly user-accepted rollback baseline until Ron accepts 0.1.70.1.
Keep **TIN TỨC / LÁ BÀI**.
Do not call Runtime PASS before Ron confirms.
