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

## 2. Current candidate — MVP 0.1.63.1

**0.1.63.1 — Active Player Center Lock**

Direct human feedback on 0.1.63 showed the low-lerp follow camera could lag far enough behind a moving token that the current player left the viewport.

0.1.63.1 is a presentation-only hotfix:
- current-turn player is forced to the exact gameplay-camera center every frame;
- camera follows the token's tweened coordinates, so motion stays smooth without lag;
- camera bounds are expanded dynamically so edge/corner board spaces can still sit at screen center;
- `TỔNG QUAN / O` remains the only intentional exception to center lock.

Manual status: **PENDING RON ACCEPTANCE**.

## 3. Current runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0631 as ActiveBoardScene`

Inheritance:
`0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.63.1 does not change gameplay authority, economy or RNG.

## 4. 0.1.63 presentation polish retained

Inherited unchanged:
- central landing/event content scale **1.18x**;
- Card/News cinematic content scale **1.14x**;
- token scale **0.82x**;
- round tile radii normal/feature/anchor/hold = **27/31/33/36**;
- close gameplay zoom **2.15x**;
- Overview **0.88x**;
- recursive build-label refresh.

The old 0.1.63 low-lerp follow is no longer authoritative for normal gameplay because 0.1.63.1 center-lock runs after it every frame.

Visible labels now identify the hotfix:
- `CITY • MVP 0.1.63.1 • ACTIVE PLAYER CENTER LOCK`
- `PLAYTEST 0.1.63.1 • ACTIVE TOKEN LUÔN Ở GIỮA`

## 5. 0.1.62 gameplay retained

Branch rule remains HOST-authoritative from the movement D6:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

No live manual branch picker, no second RNG stream, and HOST continues to append the backward-compatible `choose_branch` command with `automatic=true`.

No changes to:
- economy/Card/News values;
- Job rules;
- five Mini Game arenas and HOST payout ownership;
- Jail/Hospital/Lottery;
- READY first-lap finish lock;
- finished-player final B$ immunity.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only junctions.

Branch identities remain:
- AN TOÀN = Normal/Normal/Normal;
- DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- TIỀN = +25/-20/+25 B$;
- PHỐ CHÍNH remains the comparison route.

## 6. Center-lock implementation / regression

Implementation:
- `src/scenes/CareerMinigameBoardScene0631.ts`
- `tests/active-player-center-lock-0631.ts`
- `docs/PLAYTEST_0.1.63.1_CENTER_LOCK.md`

Normal gameplay path:
- `update()` calls `centerActivePlayer0631()` after inherited updates;
- current actor token is resolved from authoritative current-player state + visual map;
- inherited lagging follow is stopped;
- camera `centerOn(token.x, token.y)` runs on the token's interpolated tween position every frame;
- Overview short-circuits this method.

Bounds:
- half viewport in world units is derived from current zoom;
- min/max board-node coordinates are expanded by those half extents plus a 96px world margin;
- this prevents camera bounds from blocking exact centering near board edges.

Regression gate proves:
- 0.1.63.1 is the active scene;
- it inherits 0.1.63;
- exact center lock runs every frame;
- Overview remains exempt;
- expanded bounds exist;
- no `submitIntent()` and no `Math.random` are introduced;
- 0.1.62 HOST parity-routing authority remains present.

## 7. Report / deterministic QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

Because 0.1.63 and 0.1.63.1 are presentation-only, the 0.1.62 deterministic gameplay baseline remains valid.

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

## 8. 0.1.63.1 code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `2a7371ae2f7bd6da0deff9d9e940ec0253216aa0`;
- push run `#2226` / `34957324629`;
- artifact `mememe-playtest-0.1.63.1-center-lock`;
- artifact ID `10391986394`;
- size `8,591,052 bytes`;
- SHA256 `0c241f8063972fcab9475cd8f2010b285d6ff55237d52b451d0294236f59860c`;
- expires 2026-09-29.

Run #2226 passed the complete suite including:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab/multiplayer/CPU stress;
- presentation/content/economy/pacing;
- 0.1.48 stale-token/audio/dice regression;
- 0.1.57–0.1.61 gameplay/report gates;
- 0.1.62 exact sentinels + HOST odd/even routing;
- 0.1.63 UI polish regression;
- new 0.1.63.1 active-player center-lock regression;
- package validation + artifact upload.

## 9. Next manual test

Use `docs/PLAYTEST_0.1.63.1_CENTER_LOCK.md` from the artifact.

Ron should specifically verify:
1. whoever owns the current turn stays in the exact screen center through every movement step;
2. long rolls cannot outrun the camera;
3. edge/corner spaces can still be centered;
4. camera movement feels smooth because it follows the token tween rather than trailing it;
5. `TỔNG QUAN / O` still works and center lock resumes immediately after returning;
6. keep watching for long-run token snap-back.

Do **not** call 0.1.63.1 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
