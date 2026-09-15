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

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.63.2

**0.1.63.2 — Movement Actor Camera Lock**

Human feedback on 0.1.63.1 showed the moving token could still leave the viewport on rolls such as 5 or 6.

Root cause found:
- authoritative turn state can advance to the next player before the queued presentation/movement animation finishes;
- 0.1.63.1 centered `currentPlayer()`;
- therefore camera could center P2 while P1 was still visually animating through the remaining move steps.

0.1.63.2 fixes camera target priority:
1. if a presentation model is active, camera centers that model's `actorId`;
2. this keeps every `move_step` centered on the token actually moving;
3. landing presentation remains framed on the same player;
4. only when presentation is idle does camera return to authoritative `currentPlayer()`;
5. `TỔNG QUAN / O` remains the intentional exception.

Manual status: **PENDING RON ACCEPTANCE**.

## 3. Current runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0632 as ActiveBoardScene`

Inheritance:
`0632 -> 0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.63.2 is presentation-only. Gameplay/economy/RNG authority remains unchanged.

## 4. Camera implementation and regression

New implementation:
- `src/ui/cameraTarget0632.ts`
- `src/scenes/CareerMinigameBoardScene0632.ts`
- `tests/movement-actor-camera-lock-0632.ts`
- `docs/PLAYTEST_0.1.63.2_MOVEMENT_ACTOR_CAMERA_LOCK.md`

Key regression case now locked:
- presentation still animates P1;
- authoritative turn already says P2;
- camera target **must remain P1**.

The pure resolver `resolveCameraActor0632()` prioritizes `currentModel.actorId` over current-turn player ID. Scene camera resolution runs after inherited camera updates each frame, so it is the final pre-render camera decision.

When presentation becomes idle, resolver falls back to the authoritative current-turn player.

0.1.63.1 expanded edge bounds remain inherited, so edge/corner nodes can still occupy screen center.

No `submitIntent()` or new RNG is introduced by 0.1.63.2.

## 5. Presentation retained from 0.1.63 / 0.1.63.1

Inherited unchanged:
- landing/event content scale **1.18x**;
- Card/News cinematic content scale **1.14x**;
- token scale **0.82x**;
- round tile radii normal/feature/anchor/hold = **27/31/33/36**;
- close gameplay zoom **2.15x**;
- Overview **0.88x**;
- recursive build-label refresh;
- expanded camera bounds from 0.1.63.1.

Visible labels identify 0.1.63.2:
- `CITY • MVP 0.1.63.2 • MOVEMENT ACTOR CAMERA LOCK`
- `PLAYTEST 0.1.63.2 • CAMERA BÁM TOKEN ĐANG DI CHUYỂN`

## 6. 0.1.62 gameplay retained

Branch rule remains HOST-authoritative from the movement D6:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

No live manual branch picker and no second RNG stream.

No changes to economy, Card/News values, Job rules, five Mini Game arenas, Jail/Hospital/Lottery, READY first-lap finish lock, or finished-player final B$ immunity.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only junctions.

Branch identities remain:
- AN TOÀN = Normal/Normal/Normal;
- DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- TIỀN = +25/-20/+25 B$;
- PHỐ CHÍNH remains the comparison route.

## 7. Report / deterministic QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

Because 0.1.63.x is presentation-only, the 0.1.62 deterministic gameplay baseline remains valid.

32-match current-routing batch, seeds `611100..611131`:
- turns avg 56.7, p50 54, p90 63, max 73;
- commands avg 89.1, p50 86, p90 103, max 123;
- final table B$ avg 1342.8;
- final spread avg 120.4, p50 110, p90 188, max 253;
- Cards avg 7.9;
- News avg 6.4;
- Mini Games avg 5.0;
- Mini payout avg 230 B$;
- Lottery count avg 0.9.

Exact active sentinels remain:
- seed `611119`, checksum `9d83fad4`, 73 turns, finish `P2 > P4 > P1 > P3`;
- seed `611113`, checksum `1074ba94`, 53 turns, finish `P4 > P3 > P1 > P2`.

## 8. 0.1.63.2 code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `cd3a843d9c82f1e37fd4589eeedb3b67b76be97e`;
- push run `#2244` / `34965761179`;
- artifact `mememe-playtest-0.1.63.2-movement-actor-camera`;
- artifact ID `10395341522`;
- size `8,591,383 bytes`;
- SHA256 `bc1b9f490ea5ff0a62876cfcd6798943b2ed10f6e45e904764c08ee0be8d04ba`;
- expires 2026-09-29.

Run #2244 passed the complete suite including:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab/multiplayer/CPU stress;
- 0.1.48 stale-token/audio/dice regression;
- 0.1.57–0.1.61 gameplay/report gates;
- 0.1.62 sentinels + HOST odd/even routing;
- 0.1.63 UI polish gate;
- 0.1.63.1 edge-bound center-lock gate;
- **0.1.63.2 visual-mover-vs-advanced-turn camera regression**;
- image/package validation and artifact upload.

## 9. Next manual test

Use `docs/PLAYTEST_0.1.63.2_MOVEMENT_ACTOR_CAMERA_LOCK.md` from the artifact.

Ron should specifically verify:
1. roll 5 and 6 repeatedly and confirm the moving token never leaves the screen;
2. camera remains on the token finishing its animation even if the next turn has already begun internally;
3. after movement/landing presentation finishes, camera transfers cleanly to the next player;
4. edge/corner spaces remain centerable;
5. `TỔNG QUAN / O` still works and normal camera lock resumes on return;
6. keep watching for long-run token snap-back.

Do **not** call 0.1.63.2 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
