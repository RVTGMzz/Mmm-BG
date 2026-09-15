# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names.

## Current automated candidate

**MVP 0.1.61 — Local Playtest Match Report**

Automated status: **CI GREEN / PACKAGED**
Manual runtime status: **PENDING RON ACCEPTANCE**

Code-candidate artifact before this documentation update:
- `mememe-playtest-0.1.61-playtest-report`
- run `#2096` / `34924768578`
- runtime/package SHA `108cd8bd4f789356a200765f5bfc943d0b0e3fdc`
- artifact ID `10379671442`
- size `8,589,092 bytes`
- SHA256 `a968c0468062df433b0d368715f4e9d251d3db8826d9eeaf71574619b59c7057`
- expires 2026-09-29.

## Runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene061 as ActiveBoardScene`

Inheritance:
`061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.61 therefore retains the complete 0.1.60 pacing/economy candidate, 0.1.59 Job/Mini depth, 0.1.58 TIN TỨC/LÁ BÀI relocation, 0.1.57 special-location authority, canonical presentation and 0.1.48 stale-token guard.

0.1.56.1 through 0.1.61 are CI-green candidates without recorded manual user acceptance.

## Why 0.1.61 exists

The 0.1.60 handoff explicitly said the next gameplay milestone should follow runtime feedback rather than be invented in advance. Since development was asked to continue without new runtime feedback, 0.1.61 adds observability only instead of changing gameplay again.

No economy, board, Card, News, Job, Mini Game, Jail/Hospital, Lottery or pacing rule was changed in 0.1.61.

## Local Playtest Report

After the authoritative result/podium exists, the result screen exposes:
`📊 BÁO CÁO PLAYTEST`

The report is deterministically derived from authoritative `MatchState` + `eventLog` and contains:
- build, board ID, seed and final checksum;
- player count + starting B$;
- observed turns, command/event counts and RNG calls;
- movement/release/Lottery roll counts;
- Card/News/Mini/Job counts;
- Mini Game triggered/skipped counts and total Mini payout;
- Jail/Hospital release-attempt counts;
- Lottery count + total payout;
- final table B$ total, average and spread;
- finish order;
- final B$, delta, laps and finish place per player.

The modal includes `COPY REPORT` so the result can be pasted directly into Discord, Notepad or ChatGPT for analysis.

## Privacy / authority contract

0.1.61 is local-only:
- no automatic telemetry upload;
- no `fetch()` call;
- no gameplay intent;
- no state mutation;
- no `Math.random` or new RNG stream;
- report generation leaves the authoritative checksum unchanged;
- identical state produces identical report.

The UI explicitly labels the report `LOCAL ONLY • KHÔNG TỰ GỬI DỮ LIỆU RA NGOÀI`.

## 0.1.60 gameplay remains locked beneath it

Finish behavior remains:
- M01 READY stops movement immediately at lap 1;
- unused pips are discarded;
- Job salary pays once before final score lock;
- finisher is skipped in future turns;
- finished B$ is immune to later Card/News/Mini effects.

Economy remains:
- start 200 B$;
- board money and TIỀN branch unchanged;
- Lottery D6 × 20;
- Kèo Hai Cửa +20;
- Thuế Top 1 15%;
- SR all-opponent loss 20%;
- Phao Cứu Sinh +50/+15;
- self News +25/-30;
- global +10/-10, rare -15;
- canonical Mini arenas distribute 50 B$ for 3+/4 players and 30 B$ direct 1v1.

## CI status

Run #2096 is fully green. It passed:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab + bot stress;
- presentation/flow/content/economy/pacing;
- Job D6 + multiplayer Job Hub;
- Mini Game HOST-system payout ownership;
- final-result/podium chain;
- 0.1.48 stale-token/audio/dice regression;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 canonical presentation;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- new 0.1.61 deterministic local-report gate;
- package validation + artifact upload.

An earlier 0.1.61 run failed only because a historical test hard-coded Scene060 as launcher. It was updated to prove `061 -> 060 -> ... -> 048`; authority/stale-token checks were preserved.

## Manual guide

`docs/PLAYTEST_0.1.61_PLAYTEST_REPORT.md`

Priority checks:
- complete a real match to podium;
- verify report button appears at the result only;
- compare report finish order/final B$ against the actual match;
- verify Mini/Lottery/Job/Jail/Hospital counts when those systems occur;
- copy report and paste elsewhere without line loss;
- check report modal/button for clipping or overlap on host/client result screens;
- continue watching long-run token snap-back;
- recheck Roll For Order, Job Hub, branches, TIN TỨC/LÁ BÀI, BGM and podium.

## Roadmap

- 0.1.54 sandbox — done
- 0.1.55 canonical topology — CI green
- 0.1.56 branch identity — CI green
- 0.1.56.1 canonical presentation — CI green, manual pending
- 0.1.57 special locations — CI green, manual pending
- 0.1.58 TIN TỨC/LÁ BÀI depth — CI green, manual pending
- 0.1.59 Job + five Mini Game depth — CI green, manual pending
- 0.1.60 pacing/economy — CI green, manual pending
- **0.1.61 local playtest report — CI green, manual pending**
- **0.1.62 must follow 0.1.61 copied runtime report + subjective feedback. Do not invent gameplay scope in advance.**

For the most useful feedback, paste the full report and add whether the match felt fast/right/slow, whether B$ spread felt right, and what felt strongest, weakest or slowest.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
