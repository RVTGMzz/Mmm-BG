# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## Current candidate

**MVP 0.1.63.1 — Active Player Center Lock**

Ron reported that in 0.1.63 the current player could roll, move quickly and outrun the low-lerp camera until the token left the viewport.

0.1.63.1 fixes presentation only:
- active/current-turn token is exact-centered every normal-play frame;
- camera follows the token's tweened position, so it remains smooth without trailing lag;
- camera bounds are expanded so edge/corner tiles can still occupy screen center;
- `TỔNG QUAN / O` remains the sole intentional exception.

Manual status: **PENDING RON ACCEPTANCE**.

## Current runtime

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene0631 as ActiveBoardScene`

Inheritance:
`0631 -> 063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

## Presentation retained from 0.1.63

- landing/event UI = **1.18x**;
- Card/News cinematic UI = **1.14x**;
- token scale = **0.82x**;
- round tile radii = **27/31/33/36**;
- gameplay zoom = **2.15x**;
- Overview = **0.88x**;
- nested build labels are updated recursively.

Visible hotfix labels:
- `CITY • MVP 0.1.63.1 • ACTIVE PLAYER CENTER LOCK`
- `PLAYTEST 0.1.63.1 • ACTIVE TOKEN LUÔN Ở GIỮA`

## Gameplay retained from 0.1.62

Branch rule stays HOST-authoritative:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

No manual branch picker, no second RNG stream, no gameplay changes to economy, Card/News, Job, Mini Game, Jail/Hospital/Lottery or READY finish-lock.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only forks.

## Center-lock regression

New files:
- `src/scenes/CareerMinigameBoardScene0631.ts`
- `tests/active-player-center-lock-0631.ts`
- `docs/PLAYTEST_0.1.63.1_CENTER_LOCK.md`

The gate locks:
- 0.1.63.1 active scene;
- exact `centerOn(token.x, token.y)` during normal play;
- Overview bypass;
- enlarged bounds based on half viewport + 96 world-unit margin;
- no new gameplay intent or client RNG;
- inherited 0.1.63 UI polish and 0.1.62 HOST parity routing.

## QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

0.1.62 deterministic gameplay baseline remains valid because 0.1.63.1 is presentation-only:
- turns avg 56.7, p50 54, p90 63, max 73;
- final table B$ avg 1342.8;
- final spread avg 120.4, p50 110, p90 188, max 253.

Exact active sentinels remain:
- seed `611119`, checksum `9d83fad4`;
- seed `611113`, checksum `1074ba94`.

## Green code candidate before docs update

- HEAD `2a7371ae2f7bd6da0deff9d9e940ec0253216aa0`;
- push run `#2226` / `34957324629`;
- artifact `mememe-playtest-0.1.63.1-center-lock`;
- artifact ID `10391986394`;
- size `8,591,052 bytes`;
- SHA256 `0c241f8063972fcab9475cd8f2010b285d6ff55237d52b451d0294236f59860c`;
- expires 2026-09-29.

Run #2226 passed the full suite, including 0.1.48 stale-token protection, 0.1.62 HOST odd/even routing, 0.1.63 UI polish, new 0.1.63.1 center-lock gate, package validation and artifact upload.

## Next manual check

Use:
`docs/PLAYTEST_0.1.63.1_CENTER_LOCK.md`

Verify:
- current-turn token remains in the exact center while moving;
- long rolls cannot escape the viewport;
- edge/corner tiles can center correctly;
- Overview still works and center-lock resumes on return;
- long-run snap-back does not return.

Do not call 0.1.63.1 accepted until Ron confirms it manually.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
