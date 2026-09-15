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

Keep current names **TIN TỨC / LÁ BÀI**. Do not revive Tiên Tri / Phép Thuật.

## 2. Locked Draft D foundation

- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- five Mini Game spaces M09/M17/M26/M35/M44;
- M01 READY, M12 Jail Gate, M23 Lottery, M34 Hospital Gate;
- three forward-only equal-step Left/Right junctions;
- no backward traps, cycles, dead ends or hidden shortcuts.

Branch identity remains:
- **AN TOÀN 🛡️** = A1/A2/A3 Normal;
- **DRAMA 🎭** = B1 TIN TỨC / B2 LÁ BÀI / B3 TIN TỨC;
- **TIỀN 💰** = C1 +25 / C2 -20 / C3 +25 B$;
- comparison route = **PHỐ CHÍNH**.

Canonical human branch choice remains manual Left/Right through HOST authority. AUTO parity remains preview/QA only.

## 3. Current runtime chain

Current launcher activates:
`CareerMinigameBoardScene061 as ActiveBoardScene`

Inheritance remains unbroken:
`061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.61 therefore retains:
- 0.1.60 one-lap finish lock, final B$ lock and tuned economy/pacing;
- 0.1.59 Job depth + five Mini Game arena identities;
- 0.1.58 TIN TỨC/LÁ BÀI special relocation depth;
- 0.1.57 Jail/Hospital/Lottery authority;
- 0.1.56.1 close active-token camera + fixed four-corner HUD, manual branches and Overview;
- 0.1.48 stale-token protection.

0.1.56.1 through 0.1.61 have no manual runtime acceptance recorded. Do not retroactively call any of them user-accepted.

## 4. Locked 0.1.57 special-location rules

### Jail
- hold node 100;
- release 1 / 3 / 5;
- failure = stay held, turn ends;
- success exit path `100 -> 101 -> 102 -> 103 -> 12`;
- release D6 is discarded;
- then a fresh movement D6 in the same turn.

### Hospital
- hold node 110;
- release exactly 2 / 4 / 5;
- failure = stay held, turn ends;
- success path `110 -> 111 -> 112 -> 113 -> 34`;
- recovery D6 is discarded;
- then a fresh movement D6 in the same turn.

### Lottery
- M23 rolls a separate authoritative D6;
- reward remains `D6 × 20 B$`.

Holding state remains replay/checksum critical.

## 5. Locked 0.1.60 pacing/economy rules

### One-lap finish
When a player crosses M01 and reaches `lapsCompleted = 1`:
- authoritative movement stops immediately on READY;
- unused movement pips are discarded;
- READY Job salary pays first, exactly once;
- `ready_pass.finishLocked = true`;
- player is skipped in later turns while unfinished racers remain;
- presentation shows `VỀ ĐÍCH / B$ ĐÃ KHÓA`.

### Final B$ lock
Finished players are excluded from later active-race Card targets/effects, global/special/normalize News and Mini Games. The authoritative Card layer rejects a finished target even if UI validation is bypassed.

### Economy values
Unchanged foundations:
- starting money = 200 B$;
- main board money = four -20 and four +25;
- TIỀN branch = +25 / -20 / +25;
- Job salary curves unchanged;
- Lottery = D6 × 20;
- Card rarity weights and News category weights unchanged.

Tuned Cards:
- Kèo Hai Cửa safe +20;
- Thuế Top 1 15%;
- SR all-opponent loss 20%;
- Phao Cứu Sinh +50 if poorest active racer, otherwise +15.

Tuned News:
- self +25 / -30;
- common global +10 / -10;
- rare global -15.

Canonical 3+/4-player Mini Game payouts:
- M09 = 25/15/10/0;
- M17 = 35/10/5/0;
- M26 = 20/15/10/5;
- M35 = 30/20/0/0;
- M44 = 25/15/5/5.

Every canonical 3+/4-player arena distributes 50 B$ total; direct 1v1 distributes 30 B$ total.

## 6. 0.1.61 — Local Playtest Match Report

0.1.61 intentionally adds **observability only**. It does not tune gameplay again before real runtime feedback arrives.

After the authoritative final result/podium exists, the result screen exposes:
`📊 BÁO CÁO PLAYTEST`

The report is derived only from the existing authoritative `MatchState` + `eventLog` and contains:
- build version, board ID, seed and final checksum;
- player count and starting B$;
- turns observed, command count, event count and RNG call count;
- normal movement rolls, Jail/Hospital release rolls and Lottery rolls;
- Card plays and News triggers;
- Mini Games triggered/skipped and total Mini payout;
- Job offers, selections and progress checks;
- Jail/Hospital release-attempt counts;
- Lottery count and total Lottery payout;
- final table B$ total, average and spread;
- finish order;
- each player's final B$, delta from start, laps and finish position.

`formatPlaytestMatchReport061()` creates a plain-text block suitable for Discord, Notepad or ChatGPT bug reports.

## 7. Privacy / authority contract for 0.1.61

`CareerMinigameBoardScene061` is presentation-only:
- no gameplay state mutation;
- no gameplay intent submission;
- no `Math.random`;
- no extra RNG stream;
- no automatic network upload;
- no `fetch()` telemetry;
- report modal explicitly says `LOCAL ONLY`;
- `COPY REPORT` uses the browser clipboard, with a local textarea fallback.

Building the report is regression-tested to leave the authoritative checksum unchanged and to return identical output from identical state.

## 8. 0.1.61 implementation files

Core:
- `src/core/playtestTelemetry061.ts`.

Runtime/presentation:
- `src/scenes/CareerMinigameBoardScene061.ts`;
- `src/main.ts`;
- `src/ui/canonicalPresentation0561.ts` visible build labels advanced to 0.1.61.

Tests/docs/CI:
- `tests/playtest-telemetry-061.ts`;
- updated 0.1.48 / 0.1.56.1 / 0.1.58 / 0.1.59 / 0.1.60 inheritance gates;
- `package.json`;
- `.github/workflows/ci.yml`;
- `docs/PLAYTEST_0.1.61_PLAYTEST_REPORT.md`.

## 9. 0.1.61 automated result

The code candidate is **CI GREEN / PACKAGED**.

Code-candidate artifact before this handoff documentation update:
- `mememe-playtest-0.1.61-playtest-report`
- run `#2096` / `34924768578`
- runtime/package SHA `108cd8bd4f789356a200765f5bfc943d0b0e3fdc`
- artifact ID `10379671442`
- size `8,589,092 bytes`
- SHA256 `a968c0468062df433b0d368715f4e9d251d3db8826d9eeaf71574619b59c7057`
- expires 2026-09-29.

Full suite passed, including:
- typecheck/build;
- deterministic replay + lockstep + HOST authority;
- two-tab + bot stress;
- presentation/flow/pacing/content/economy;
- Job D6 + multiplayer Job Hub;
- Mini Game HOST single-commit payout ownership;
- final-result/podium chain;
- 0.1.48 stale-token/audio/dice gate;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 canonical presentation;
- 0.1.57 special-location authority;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- new 0.1.61 deterministic local-report gate;
- package validation and artifact upload.

An earlier 0.1.61 run failed only because the historical 0.1.48 regression test still hard-coded Scene060 as the launcher. It was updated to prove the stronger chain `061 -> 060 -> ... -> 048`; stale-token and authority assertions were not weakened.

## 10. Status declaration

### 0.1.61 automated implementation
**CI GREEN / PACKAGED CANDIDATE**

### Manual runtime acceptance
**PENDING**

### Rollback baseline
**0.1.48 remains the only user-validated rollback baseline.**

Do not call 0.1.61 user-accepted from CI alone.

## 11. Manual checklist

Use:
`docs/PLAYTEST_0.1.61_PLAYTEST_REPORT.md`

Highest-value checks:
1. Play a complete real match through podium.
2. Confirm `BÁO CÁO PLAYTEST` appears only after the result exists.
3. Open the report and verify seed/checksum are visible.
4. Compare finish order with the actual race.
5. Compare per-player final B$ with the podium.
6. Check Mini/Lottery/Job/Jail/Hospital counts against events that actually occurred.
7. Press `COPY REPORT`, paste elsewhere and ensure all lines survive.
8. Check report modal/button layout for overlap or clipping, especially on multiplayer/client result screens.
9. Continue watching long-run token snap-back and final-result/podium ordering.
10. Recheck Roll For Order, multiplayer Job Hub, branches, TIN TỨC/LÁ BÀI, Lottery and BGM.

## 12. Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, manual pending
- 0.1.57 special locations — CI green, manual pending
- 0.1.58 TIN TỨC / LÁ BÀI depth — CI green, manual pending
- 0.1.59 Job + five Mini Game depth — CI green, manual pending
- 0.1.60 pacing/economy — CI green, manual pending
- **0.1.61 local playtest report — CI green, manual pending**
- **0.1.62 must be selected from 0.1.61 copied runtime report + subjective playtest feedback. Do not invent gameplay scope in advance.**

Recommended feedback payload after a real run:
- paste the full 0.1.61 report;
- say whether the match felt fast / right / slow;
- say whether final B$ felt too compressed / right / too swingy;
- identify the biggest pacing drag or strongest/weakest event.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
