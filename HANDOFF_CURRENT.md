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

Never regress:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio/BGM ownership;
- stale-token guard;
- READY/lap/final-result/podium chain.

Keep visible names **TIN TỨC / LÁ BÀI**.

## 2. Current candidate — MVP 0.1.63

**0.1.63 — UI Readability + Smooth Follow Polish**

This scope came directly from Ron's screenshot/runtime feedback on 0.1.62:
- central event/chat panel was too small;
- camera should move more softly while tokens move;
- player tokens should be slightly smaller;
- round movement spaces should be slightly larger.

The same screenshot also exposed a presentation bug: the 0.1.62 build still displayed the old 0.1.61 header/badge because canonical UI labels live inside nested containers and the 0.1.62 label updater only scanned top-level objects. 0.1.63 fixes that recursively.

Manual status: **PENDING RON ACCEPTANCE**.

## 3. Current runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene063 as ActiveBoardScene`

Inheritance:
`063 -> 062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.63 is presentation-only. It inherits all 0.1.62 gameplay authority unchanged.

## 4. 0.1.62 gameplay retained beneath 0.1.63

Live branching remains HOST-generated from the already-authoritative movement D6:
- `1 / 3 / 5` -> **TRÁI**;
- `2 / 4 / 6` -> **PHẢI**.

Rules:
- no live manual branch picker;
- no second RNG stream;
- HOST appends existing `choose_branch` command with `automatic=true` + parity metadata;
- replay wire format stays backward-compatible;
- all three Draft D forks stay forward-only and equal-step.

Dedicated regression:
- `tests/random-branch-round-tiles-062.ts`
- now explicitly proves 0.1.62 remains intact beneath the 0.1.63 wrapper.

## 5. 0.1.63 presentation changes

Implementation:
- `src/scenes/CareerMinigameBoardScene063.ts`
- `tests/ui-smooth-polish-063.ts`
- `docs/PLAYTEST_0.1.63_UI_SMOOTH_POLISH.md`

### Larger event/chat presentation

The active `MatchPresentationLayer` is wrapped presentation-only:
- landing/event contents scale **1.18x**;
- cinematic Card/News contents scale **1.14x**;
- no gameplay intent, state mutation or RNG is added.

### Smoother camera follow

The existing 2.15x close camera is retained.

0.1.63 changes follow behavior to:
- `roundPixels=false` to remove tiny pixel-step judder;
- follow lerp **0.075** on both axes for a softer glide behind moving tokens;
- Overview remains available through `TỔNG QUAN` / keyboard `O` at the inherited 0.88x overview framing.

### Smaller tokens

Player token containers render at **0.82x** presentation scale.

The authoritative token coordinate, movement queue and stale-token guard are unchanged. The wrapper reapplies 0.82x after inherited reconciliation paths that intentionally reset scale to 1.

### Larger round movement spaces

0.1.62 baseline radii were:
- normal 23;
- feature 27;
- anchor 29;
- Jail/Hospital hold 32.

0.1.63 presentation radii are:
- normal **27**;
- feature **31**;
- anchor **33**;
- Jail/Hospital hold **36**.

Coordinates, tile identity and gameplay effects remain unchanged.

### Nested build-label fix

0.1.63 recursively visits nested containers so the visible canonical UI now updates to:
- `CITY • MVP 0.1.63 • UI READABILITY + SMOOTH FOLLOW`
- `PLAYTEST 0.1.63 • LẺ ← TRÁI • CHẴN → PHẢI`

The report schema itself intentionally remains 0.1.61 because 0.1.63 does not change telemetry fields.

## 6. Locked Draft D/gameplay foundation retained

Board:
- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- M01 READY;
- M12 Jail Gate;
- M23 Lottery;
- M34 Hospital Gate;
- Mini Game spaces M09/M17/M26/M35/M44;
- no backward traps, cycles, dead ends or hidden distance shortcuts.

Branch identities remain:
- **AN TOÀN 🛡️** = Normal / Normal / Normal;
- **DRAMA 🎭** = TIN TỨC / LÁ BÀI / TIN TỨC;
- **TIỀN 💰** = +25 / -20 / +25 B$;
- comparison route = **PHỐ CHÍNH**.

Special locations remain:
- Jail node100, release 1/3/5, exit `100->101->102->103->12`, then fresh movement D6;
- Hospital node110, release 2/4/5, exit `110->111->112->113->34`, then fresh movement D6;
- Lottery = authoritative D6 × 20 B$;
- held players excluded from Mini Games.

0.1.60 economy remains unchanged:
- start 200 B$;
- first-lap READY finish-stop and spare-pip discard;
- final B$ lock + retired finishers;
- main money four -20 / four +25;
- TIỀN branch +25 / -20 / +25;
- existing Card/News values unchanged;
- Mini Game canonical total 50 B$ for 3+/4 and 30 B$ direct 1v1.

## 7. Report / QA retained

0.1.61 local Playtest Match Report remains inherited and local-only:
- deterministic from authoritative MatchState/eventLog;
- no upload/fetch;
- no gameplay intent or state mutation;
- no extra RNG;
- `COPY REPORT` remains available after result/podium.

## 8. 0.1.62 simulation/sentinel baseline retained

Because 0.1.63 is presentation-only, the active 0.1.62 deterministic gameplay fingerprints remain valid.

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

Exact active sentinels:

Seed `611119`, longest batch:
- checksum `9d83fad4`;
- 73 turns;
- 123 authoritative / 107 submitted / 16 HOST-auto commands;
- table 1765 B$, spread 175;
- finish `P2 > P4 > P1 > P3`.

Seed `611113`, largest spread:
- checksum `1074ba94`;
- 53 turns;
- 79 authoritative / 68 submitted / 11 HOST-auto commands;
- table 1465 B$, spread 253;
- finish `P4 > P3 > P1 > P2`.

Historical 0.1.61.2 fingerprints remain history only.

## 9. 0.1.63 code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `811657a9de9042ccbd9fe940342bc0ea36aac636`;
- push run `#2210` / `34951875619`;
- artifact `mememe-playtest-0.1.63-ui-smooth-polish`;
- artifact ID `10389945097`;
- size `8,591,209 bytes`;
- SHA256 `703475851f0fccefbe89a1c0eddbc98b71bd39801d78b8587f686d893c405d21`;
- expires 2026-09-29.

Run #2210 passed the complete suite, including:
- build/typecheck;
- replay / lockstep / HOST authority;
- two-tab / multiplayer / CPU stress;
- presentation/content/economy/pacing;
- Job Hub + Mini Game HOST payout ownership;
- result/podium chain;
- 0.1.48 stale-token/audio/dice gate;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- 0.1.61 local report;
- 32-match simulation harness;
- 0.1.62 exact outlier sentinels;
- 0.1.62 HOST odd/even branch regression;
- new 0.1.63 UI/smooth-follow gate;
- image/package validation;
- 0.1.63 guide copy;
- artifact upload.

## 10. Next manual test

Use `docs/PLAYTEST_0.1.63_UI_SMOOTH_POLISH.md` from the packaged artifact.

Ron should specifically check:
1. central event/chat panels are now large enough but do not dominate the board;
2. camera glides smoothly behind token movement and does not feel floaty/late;
3. tokens are smaller but still easy to track;
4. larger circles are easier to read;
5. `TỔNG QUAN / O` still exits/returns cleanly;
6. visible header/badge correctly shows 0.1.63 instead of stale 0.1.61;
7. watch long-run token snap-back after many turns;
8. finish a match and paste the Playtest Report plus subjective notes if practical.

Do **not** call 0.1.63 user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
