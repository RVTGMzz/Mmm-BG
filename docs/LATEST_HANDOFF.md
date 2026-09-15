# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep visible names **TIN TỨC / LÁ BÀI**.

## Current gameplay candidate

**MVP 0.1.62 — Random Branch + Round Tile Readability**

This scope came directly from Ron's human feedback:
- zoom active gameplay closer;
- movement/normal spaces should be larger circles, not rectangles;
- remove manual branch choice;
- luck rule = **odd LEFT / even RIGHT**.

Manual status: **PENDING RON ACCEPTANCE**.

## Current runtime

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene062 as ActiveBoardScene`

Inheritance:
`062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

### Branch authority

Live branch decisions are now HOST-generated from the already-authoritative movement D6:
- 1/3/5 -> LEFT;
- 2/4/6 -> RIGHT.

The client no longer receives a manual branch pause. HOST appends the existing `choose_branch` command with `automatic=true`, preserving command-log/replay compatibility without consuming extra RNG.

`tests/random-branch-round-tiles-062.ts` locks all three Draft D forks plus an immediate-junction authority fixture for both odd/even cases.

### Readability

- active-token follow zoom = **2.15x**;
- Overview remains **0.88x** and accessible through `TỔNG QUAN` / `O`;
- inherited rectangular tile bodies are replaced at runtime by round bodies;
- radii: normal 23, feature 27, anchor 29, Jail/Hospital hold 32;
- coordinates, labels, colors and gameplay tile logic remain unchanged;
- visible badge: `LẺ ← TRÁI • CHẴN → PHẢI`.

## Gameplay intentionally not changed

0.1.62 does not retune economy, Card/News values, Job rules, Mini Game rules, Jail/Hospital/Lottery rules or READY finish-lock.

Draft D still has 44 main spaces, five Mini Game spaces and three equal-step forward-only Left/Right junctions.

Branch identities remain:
- AN TOÀN = Normal/Normal/Normal;
- DRAMA = TIN TỨC/LÁ BÀI/TIN TỨC;
- TIỀN = +25/-20/+25 B$;
- PHỐ CHÍNH remains the comparison route.

## Report / QA retained

0.1.61 local Playtest Match Report remains inherited and local-only. It does not upload data, mutate gameplay, or consume RNG.

The existing 32-match simulator now exercises the current 0.1.62 routing. Current batch, seeds `611100..611131`:
- turns avg 56.7, p50 54, p90 63, max 73;
- commands avg 89.1, p50 86, p90 103, max 123;
- final table B$ avg 1342.8;
- final spread avg 120.4, p50 110, p90 188, max 253;
- Cards avg 7.9;
- News avg 6.4;
- Mini Games avg 5.0;
- Mini payout avg 230 B$;
- Lottery count avg 0.9.

Historical 0.1.61.1 fingerprints remain comparison data. They are not rewritten as though the gameplay change never happened.

## 0.1.62 exact outlier sentinels

Active test: `tests/outlier-replay-062.ts`.

Seed `611119`, longest current batch:
- checksum `9d83fad4`;
- 73 turns;
- 123 authoritative / 107 submitted / 16 HOST-auto commands;
- 1765 B$ table total, spread 175;
- Mini 9 / 415 B$;
- Lottery 3 / 340 B$;
- finish `P2 > P4 > P1 > P3`.

Seed `611113`, largest current spread:
- checksum `1074ba94`;
- 53 turns;
- 79 authoritative / 68 submitted / 11 HOST-auto commands;
- 1465 B$ table total, spread 253;
- Mini 4 / 175 B$;
- Lottery 2 / 160 B$;
- finish `P4 > P3 > P1 > P2`.

Historical `tests/outlier-replay-0612.ts` remains in the repo as historical 0.1.61.2 fingerprint evidence, but is no longer the active gameplay sentinel after the intentional branch-rule change.

## Green code candidate before this docs update

- HEAD `1337c81d2e8ac45d7ce824cc5d7d3080afbfd147`;
- push run `#2192` / `34941360593`;
- artifact `mememe-playtest-0.1.62-random-branch-round-tiles`;
- artifact ID `10385173205`;
- size `8,590,917 bytes`;
- SHA256 `cbc05669e7444156ceb97ad9221dd0560a47aadde5adb1eae70e5339c386c3fc`;
- expires 2026-09-29.

Run #2192 passed the complete suite, including the new HOST parity-routing gate, round-tile/zoom gate, exact 0.1.62 sentinels, package validation and artifact upload.

## Next step

Use:
`docs/PLAYTEST_0.1.62_RANDOM_BRANCH_ROUND_TILES.md`

Ron should validate:
- no manual branch picker appears;
- odd really goes LEFT, even really goes RIGHT when a fork is resolved;
- 2.15x zoom feels right;
- round spaces are easier to read;
- Overview remains useful;
- token snap-back does not return after many turns;
- full-match Playtest Report is copied back with quick subjective notes.

Do not call 0.1.62 accepted until Ron confirms it manually.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
