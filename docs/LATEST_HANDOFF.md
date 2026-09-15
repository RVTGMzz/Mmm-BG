# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Keep visible names **TIN TỨC / LÁ BÀI**. Never regress HOST authority, deterministic replay, multiplayer ownership, stale-token protection, camera movement-actor lock, or READY/final-result flow.

## Current candidate

**MVP 0.1.63.4 — Job Continue + Landing Effect Sync**

Latest human feedback:
- roll 5 could reach Job on step 2, resolve Job, then incorrectly stop instead of spending the remaining 3 pips;
- a destination `-20 B$` could still become visible before the token reached the destination;
- camera fix is confirmed good by Ron and must be preserved.

Manual status: **PENDING RON ACCEPTANCE** for the new Job/money behavior.

## Runtime

`CareerMinigameBoardScene0634 as ActiveBoardScene`

Inheritance:
`0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048`

## Job continuation

Job Hub is now a mid-roll interrupt rather than an automatic movement terminator.

Example locked by regression:
`D6 = 5 -> Job on step 2 -> resolve Job -> continue steps 3, 4 and 5`.

Authority stores the original roll and unspent pips in `pendingJobMovement`, which is included in checksum/replay. After Job resolution, movement resumes with no new movement RNG.

If remaining pips encounter a branch, the original D6 parity still drives HOST automatic routing:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

If a Job career outcome relocates the player into a special hold, the original movement ends there. If Job is reached on the final pip, there is nothing to resume.

## Landing-timed B$

0.1.63.4 adds a presentation-owned visible wallet snapshot.

HOST can calculate state immediately, but displayed B$ waits for the matching effect to reach the screen.

Expected order on a money destination:
`ROLL -> MOVE -> ARRIVE -> MONEY EFFECT -> HUD B$ CHANGES`.

The same principle is used for money-bearing READY, Card and TIN TỨC presentation.

## Camera retained and human-confirmed

Ron explicitly confirmed the camera fix is good.

0.1.63.2 behavior stays inherited unchanged:
- camera follows the actor still being animated;
- long rolls remain centered;
- idle camera returns to current turn;
- Overview/O stays the exception.

## Jail/Hospital retained

0.1.63.3 remains inherited and its full release-sync regression still runs under the 0.1.63.4 wrapper.

Release D6 remains release-only. Success clears the hold, sets `lastRoll = null`, returns to `PRE_ROLL_ACTION` in the same turn, then requires a fresh movement D6.

## Deterministic QA rebased intentionally

Job continuation changes gameplay routes, so the historical 0.1.62 sentinel file is preserved as history while the active sentinel is now 0.1.63.4.

32-match batch seeds `611100..611131`:
- turns avg 58.1, p50 56, p90 69, max 81;
- commands avg 94.8, p50 93, p90 112, max 126;
- final B$ total avg 1327.4;
- final spread avg 137.5, p50 129, p90 235, max 277;
- Cards avg 10.1;
- News avg 6.7;
- Mini Games avg 5.6;
- Jobs selected avg 3.8;
- Lottery count avg 1.2;
- deterministic harness checksum `b8ee25a7`.

Active exact same-seed sentinels:
- `611119` -> checksum `cb3d9c1b`, 53 turns, finish IDs `[2,3,1,0]`;
- `611113` -> checksum `93aa3912`, 49 turns, finish IDs `[3,2,1,0]`.

## Green code candidate before docs update

- HEAD `cba4d8c11036a4b19ac872362b039e99fb0493f9`;
- push run `#2304` / `34976332683`;
- artifact `mememe-playtest-0.1.63.4-job-continue-landing-sync`;
- artifact ID `10399547650`;
- size `8,593,603 bytes`;
- SHA256 `e3c511bf31d73a3d7adc8fde3c20f92b96c8e39f4eb82856f2ef51126279cd37`;
- full meaningful CI suite PASS.

## Manual check

Use `docs/PLAYTEST_0.1.63.4_JOB_CONTINUE_LANDING_SYNC.md`.

Verify especially:
- roll 5 -> Job at step 2 -> Job resolves -> exactly 3 pips continue;
- parity branch still works during resumed movement;
- `-20/+25` B$ does not appear before visual arrival;
- B$ changes when landing/effect presentation begins;
- confirmed-good camera behavior remains intact;
- Jail/Hospital still uses release D6 followed by fresh movement D6.

Do not call 0.1.63.4 accepted until Ron validates these new behaviors.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
