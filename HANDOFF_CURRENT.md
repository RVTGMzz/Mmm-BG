# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. User-validated rollback baseline

MVP **0.1.48** remains the only user-accepted HOST-authoritative rollback baseline.

Validated artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, camera movement-actor lock, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.63.4

**0.1.63.4 — Job Continue + Landing Effect Sync**

Latest human feedback after 0.1.63.3:
1. if a movement D6 reached JOB before spending all pips, Job Hub consumed the rest of the roll and the player stopped incorrectly;
2. a destination money result such as `-20 B$` could still become visible before the token visually reached the destination;
3. Ron explicitly confirmed the camera fix is good. Preserve the 0.1.63.2 camera behavior.

Manual status: **PENDING RON ACCEPTANCE** for the new Job/money behavior.

## 3. Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0634 as ActiveBoardScene`

Inheritance:
`0634 -> 0633 -> 0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## 4. Job Hub is now a mid-roll interrupt

Gameplay authority change in 0.1.63.4:
- movement D6 is still rolled once by HOST;
- when movement reaches a Job space before all pips are spent, the player pauses on Job Hub;
- the original movement roll, next step number and remaining pip count are stored in authoritative `MatchState.pendingJobMovement`;
- after `choose_job` / Job D6 resolves, movement resumes with the **remaining pips of the original movement D6**;
- no new movement RNG is introduced;
- if resumed movement reaches a branch, HOST still applies the original roll parity automatically;
- if a Job career outcome relocates the player to Jail/Hospital, the original movement ends there;
- if Job is reached on the final pip, there are no pips to resume and the turn ends normally after Job resolution.

Concrete locked case:
`roll 5 -> Job on step 2 -> resolve Job -> continue steps 3, 4, 5`.

Implementation:
- `src/core/matchState.ts`
- `src/core/checksum.ts`
- `src/core/turnPhase.ts`
- `src/core/replay.ts`
- `src/core/authority.ts`
- `tests/job-continue-landing-sync-0634.ts`

`pendingJobMovement` participates in checksum/replay so host/client cannot disagree about unspent pips.

## 5. Visible B$ waits for the presented effect

0.1.63.4 adds a presentation-owned visible-money snapshot.

HOST may still calculate the final authoritative state immediately, but the HUD no longer exposes future money while movement is still being presented.

For a money destination such as `-20 B$`, the intended visible order is:

`ROLL -> TOKEN MOVES -> TOKEN ARRIVES -> MONEY LANDING/EFFECT STARTS -> HUD B$ CHANGES`

Money-bearing Card/News/READY presentations use the same principle: the visible wallet commits when the matching effect reaches presentation, not simply because authority is already ahead.

Implementation:
- `src/ui/landingEffectSync0634.ts`
- `src/scenes/CareerMinigameBoardScene0634.ts`

## 6. Camera status

Ron explicitly reported the camera fix is working well.

Retain 0.1.63.2 behavior unchanged:
- while presentation is active, camera follows the actor currently being animated;
- rolls 5/6 remain centered on the moving token even if authoritative turn state has advanced;
- when presentation is idle, camera returns to current turn player;
- `TỔNG QUAN / O` remains the intentional exception;
- expanded edge bounds remain inherited.

Do not casually rework this camera path in later patches without new evidence.

## 7. Jail/Hospital release retained from 0.1.63.3

0.1.63.3 remains inherited and its regression is explicitly checked beneath the 0.1.63.4 wrapper.

Release flow remains:
1. release/recovery D6 tests release only;
2. successful release traverses internal exit topology;
3. `specialHold` clears;
4. `turn.lastRoll = null`;
5. phase returns to `PRE_ROLL_ACTION` in the same turn;
6. a **fresh movement D6** is required.

Presentation still makes clear the release face is **CHỈ dùng để thoát** and the internal corridor is visually collapsed rather than looking like reused movement pips.

## 8. Branch, board and economy rules retained

Branch rule remains HOST-authoritative:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

No live manual branch picker and no second RNG stream.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only junctions.

No value changes to economy, TIN TỨC/LÁ BÀI, Job definitions, Mini Game payout tables, Lottery, READY finish lock or finished-player B$ immunity.

Presentation retained:
- landing/event scale 1.18x;
- Card/News scale 1.14x;
- token scale 0.82x;
- round radii 27/31/33/36;
- close zoom 2.15x;
- Overview 0.88x.

## 9. Deterministic baseline after intentional Job movement change

Job continuation intentionally changes routes and therefore invalidates the active 0.1.62 gameplay fingerprints. Historical `tests/outlier-replay-062.ts` is preserved unchanged as history; active sentinel coverage is now `tests/outlier-replay-0634.ts`.

32-match deterministic batch, seeds `611100..611131`:
- turns avg 58.1, min 47, p50 56, p90 69, max 81;
- commands avg 94.8, min 72, p50 93, p90 112, max 126;
- final table B$ avg 1327.4, min 730, p50 1302, p90 1527, max 1700;
- final spread avg 137.5, p50 129, p90 235, max 277;
- movement rolls avg 54.1;
- release rolls avg 8.0;
- Cards avg 10.1;
- News avg 6.7;
- Mini Games avg 5.6;
- Mini payout avg 244.5 B$;
- Jobs selected avg 3.8;
- Lottery count avg 1.2;
- Lottery payout avg 78.8 B$;
- deterministic harness checksum `b8ee25a7`.

Rebased same-seed sentinels:

Seed `611119`:
- checksum `cb3d9c1b`;
- 53 turns, 87 authoritative commands, 74 submitted, 13 HOST auto-branch commands;
- final table 730 B$, spread 60;
- finish IDs `[2,3,1,0]`;
- per-seat final B$ `[183,160,167,220]`.

Seed `611113`:
- checksum `93aa3912`;
- 49 turns, 81 authoritative commands, 69 submitted, 12 HOST auto-branch commands;
- final table 1302 B$, spread 277;
- finish IDs `[3,2,1,0]`;
- per-seat final B$ `[447,365,320,170]`.

These are regression sentinels, not balance targets.

## 10. 0.1.63.4 green code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `cba4d8c11036a4b19ac872362b039e99fb0493f9`;
- push run `#2304` / `34976332683`;
- artifact `mememe-playtest-0.1.63.4-job-continue-landing-sync`;
- artifact ID `10399547650`;
- size `8,593,603 bytes`;
- SHA256 `e3c511bf31d73a3d7adc8fde3c20f92b96c8e39f4eb82856f2ef51126279cd37`;
- expires 2026-09-29.

Run #2304 passed the complete meaningful suite, including:
- build/typecheck, replay, lockstep, HOST authority;
- two-tab/multiplayer/CPU stress;
- 0.1.48 stale-token regression;
- 0.1.57 fresh-D6 special-location rule;
- rebased 0.1.63.4 deterministic sentinels;
- 0.1.62 HOST parity routing;
- 0.1.63/0.1.63.1/0.1.63.2 presentation and camera gates;
- inherited 0.1.63.3 release/presentation sync;
- **0.1.63.4 roll 5 -> Job step 2 -> resume 3 pips + landing-timed B$ regression**;
- package validation and artifact upload.

## 11. Next manual test

Use `docs/PLAYTEST_0.1.63.4_JOB_CONTINUE_LANDING_SYNC.md` from the artifact.

Ron should verify especially:
1. roll 5, reach Job at step 2, resolve Job, then visibly continue exactly 3 more spaces;
2. if those remaining pips cross a fork, odd/even HOST routing remains correct;
3. while approaching a `-20` or `+25` destination, HUD keeps the old wallet until arrival/effect presentation;
4. money changes at the moment the destination effect appears;
5. camera remains as good as the already-confirmed 0.1.63.2 behavior;
6. Jail/Hospital still uses release D6 then fresh movement D6;
7. continue watching for long-run token snap-back.

Do **not** call 0.1.63.4 user-accepted until Ron manually validates the new Job/money behavior.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
