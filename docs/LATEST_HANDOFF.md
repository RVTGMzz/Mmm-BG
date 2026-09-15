# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## Current candidate

**MVP 0.1.63 — UI Readability + Smooth Follow Polish**

This scope came from Ron's 0.1.62 screenshot/runtime feedback:
- central event/chat panel too small;
- camera should glide more smoothly during token movement;
- player tokens should be slightly smaller;
- round movement spaces should be slightly larger.

The screenshot also proved the 0.1.62 build header was still showing 0.1.61 because canonical labels were nested inside containers. 0.1.63 fixes those labels recursively.

Manual status: **PENDING RON ACCEPTANCE**.

## Current runtime

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene063 as ActiveBoardScene`

Inheritance:
`063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.63 is presentation-only. 0.1.62 gameplay remains unchanged underneath it.

## 0.1.63 polish details

### Event/chat UI
- landing/event contents = **1.18x**;
- Card/News cinematic contents = **1.14x**.

### Camera
- close gameplay zoom remains **2.15x**;
- Overview remains **0.88x** through `TỔNG QUAN` / `O`;
- follow uses `roundPixels=false`;
- follow lerp = **0.075** on both axes for softer movement.

### Tokens
- player token container scale = **0.82x**;
- authoritative coordinates and stale-token logic remain untouched.

### Round spaces
0.1.63 visual radii:
- normal **27**;
- feature **31**;
- anchor **33**;
- Jail/Hospital hold **36**.

0.1.62 baseline was 23/27/29/32 respectively.

### Build label fix
Visible canonical labels now update recursively to:
- `CITY • MVP 0.1.63 • UI READABILITY + SMOOTH FOLLOW`
- `PLAYTEST 0.1.63 • LẺ ← TRÁI • CHẴN → PHẢI`

The Playtest Report schema itself remains 0.1.61.

## Gameplay retained from 0.1.62

Branch rule remains:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

HOST resolves branches automatically from the movement D6. No manual branch picker, no second RNG stream, and existing `choose_branch` command compatibility remains intact.

No changes to economy, Card/News values, Job, Mini Game, Jail/Hospital/Lottery or READY finish-lock.

Draft D remains 44 main spaces, five Mini Game spaces and three equal-step forward-only forks.

Branch identities remain:
- AN TOÀN = Normal/Normal/Normal;
- DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- TIỀN = +25/-20/+25 B$;
- PHỐ CHÍNH remains the comparison route.

## QA retained

0.1.61 local Playtest Match Report remains inherited/local-only.

The current 0.1.62-routing 32-match batch remains the gameplay baseline because 0.1.63 is presentation-only:
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

## Green 0.1.63 code candidate before docs update

- HEAD `811657a9de9042ccbd9fe940342bc0ea36aac636`;
- push run `#2210` / `34951875619`;
- artifact `mememe-playtest-0.1.63-ui-smooth-polish`;
- artifact ID `10389945097`;
- size `8,591,209 bytes`;
- SHA256 `703475851f0fccefbe89a1c0eddbc98b71bd39801d78b8587f686d893c405d21`;
- expires 2026-09-29.

Run #2210 passed the complete suite, including build/typecheck, replay/lockstep/HOST authority, multiplayer/CPU stress, 0.1.48 stale-token protection, 0.1.57–0.1.61 gameplay/report gates, 0.1.62 sentinels + HOST parity routing, the new 0.1.63 UI/smooth-follow gate, package validation and artifact upload.

## Next manual check

Use:
`docs/PLAYTEST_0.1.63_UI_SMOOTH_POLISH.md`

Ron should validate:
- event/chat panel is large enough;
- camera movement feels soft rather than jerky or floaty;
- token size feels right;
- round spaces are easier to read;
- `TỔNG QUAN / O` still behaves correctly;
- visible header now says 0.1.63;
- token snap-back does not return after many turns.

Do not call 0.1.63 accepted until Ron confirms it manually.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
