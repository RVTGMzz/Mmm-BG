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

Keep current names **TIN TỨC / LÁ BÀI**.

## 2. Locked Draft D / gameplay foundation

- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- Mini Game: M09/M17/M26/M35/M44;
- M01 READY, M12 Jail Gate, M23 Lottery, M34 Hospital Gate;
- three forward-only equal-step Left/Right junctions;
- no backward traps, cycles, dead ends or hidden shortcuts;
- human branch choice remains manual and HOST-authoritative.

Branch identities:
- **AN TOÀN 🛡️** = Normal / Normal / Normal;
- **DRAMA 🎭** = TIN TỨC / LÁ BÀI / TIN TỨC;
- **TIỀN 💰** = +25 / -20 / +25 B$;
- comparison route = **PHỐ CHÍNH**.

Locked 0.1.57 special rules:
- Jail node100, release 1/3/5, exit `100->101->102->103->12`, fresh movement D6 after successful release;
- Hospital node110, release 2/4/5, exit `110->111->112->113->34`, fresh movement D6 after successful recovery;
- Lottery = authoritative D6 × 20 B$;
- held players excluded from Mini Games.

Locked 0.1.60 pacing/economy:
- first-lap READY crossing stops immediately on M01 and discards spare pips;
- Job salary pays once before `finishLocked`;
- finished players retire from later turns and their final B$ is immune to later Card/News/Mini effects;
- start = 200 B$;
- main money = four -20 / four +25;
- TIỀN branch = +25/-20/+25;
- Kèo Hai Cửa +20, Thuế Top 1 15%, SR all-opponent loss 20%, Phao Cứu Sinh +50/+15;
- News self +25/-30, common global +10/-10, rare global -15;
- canonical Mini Game 3+/4-player total = 50 B$, direct 1v1 total = 30 B$.

## 3. Current runtime

Launcher still activates:
`CareerMinigameBoardScene061 as ActiveBoardScene`

Runtime inheritance remains:
`061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

**Important:** 0.1.61.1 is a QA/package patch. It does **not** add a new runtime scene or change gameplay rules. Visible runtime/report schema intentionally remains **0.1.61**.

0.1.56.1 through 0.1.61 have no recorded manual runtime acceptance. Do not retroactively call them user-accepted.

## 4. 0.1.61 — Local Playtest Match Report

Result screen exposes `📊 BÁO CÁO PLAYTEST` after the authoritative result/podium exists.

Report is deterministically derived from authoritative `MatchState` + `eventLog` and includes:
- board, seed, checksum;
- turns / commands / events / RNG calls;
- movement, release and Lottery rolls;
- Card / News / Mini Game / Job counts;
- Mini and Lottery payout totals;
- Jail/Hospital release attempts;
- final B$ total / average / spread;
- finish order;
- per-player final B$, delta, laps and finish position.

Privacy/authority contract:
- local-only;
- no automatic upload;
- no `fetch()` telemetry;
- no gameplay intent;
- no state mutation;
- no extra RNG / `Math.random`;
- report generation leaves checksum unchanged;
- `COPY REPORT` uses browser clipboard with local fallback.

## 5. 0.1.61.1 — Deterministic Simulation Baseline / QA Lab

Because 0.1.62 must follow real runtime feedback instead of invented gameplay scope, development continued with a QA-only patch.

New core QA helper:
- `src/core/playtestSimulation0611.ts`

New CI gate:
- `tests/simulation-baseline-0611.ts`

CI now runs **32 complete deterministic 4-CPU matches** using seeds `611100..611131` until all four players finish one lap.

The simulator uses the real HOST-authoritative paths for:
- roll;
- branch choice;
- Card use;
- Job choice;
- `host-system resolve_minigame` payout.

Mini Game ranking is deterministically rotated from seed + source event sequence so the simulation does not always favor P1. No `Math.random` or second gameplay RNG stream is added.

Artifact contains:
`SIMULATION_BASELINE_0.1.61.1.txt`

This baseline is **QA evidence only**, not a substitute for human pacing/feel feedback.

## 6. CPU edge case discovered by the new lab

First simulation attempt exposed a real CPU decision bug at seed `611100`, turn 50:
- CPU held `ACT_003`, a `random_other` Card;
- 0.1.60 finish-lock had already retired every possible opponent;
- CPU still attempted `play_card`;
- HOST correctly rejected it with `ACT_003 has no valid random target`.

Fix in `src/core/testBot.ts`:
- if a `random_other` Card has no valid active opponent, CPU keeps the Card and chooses `roll` instead;
- Card/HOST rules are unchanged and were not weakened.

Regression added to `tests/test-bot-autoplay.ts`:
- three opponents marked finished;
- actor holds `ACT_003`;
- bot must choose `roll` and keep the Card.

This regression passes in the final green candidate.

## 7. 0.1.61.1 deterministic baseline numbers

32 matches, seeds `611100..611131`:

- turns: avg **60.2**, min 51, p50 58, p90 68, max 77;
- commands: avg **93**, min 81, p50 91, p90 106, max 119;
- final table B$: avg **1257.1**, min 908, p50 1212, p90 1495, max 1634;
- final B$ spread: avg **126.3**, min 20, p50 102, p90 216, max 292;
- movement rolls: avg 55.5;
- release rolls: avg 8.1;
- Cards played: avg 7.8;
- News: avg 7.4;
- Mini Games: avg 4.8;
- Mini payout: avg 214.1 B$;
- Jobs selected: avg 3.9;
- Lottery count: avg 1.1;
- Lottery payout: avg 75.6 B$.

Seat distribution:
- first finisher counts P1/P2/P3/P4 = `4 / 9 / 10 / 9`;
- money-leader counts P1/P2/P3/P4 = `9 / 6 / 9 / 10` (ties can count multiple leaders).

Outlier seeds:
- longest match: `611124`;
- largest final B$ spread: `611121`.

Do **not** interpret these numbers alone as proof that balance is good/bad. Use them as a before/after regression baseline once human feedback selects a real gameplay change.

## 8. 0.1.61.1 code-candidate result

Code candidate is **CI GREEN / PACKAGED**.

Candidate before this handoff update:
- HEAD `c63681e77062fbe7bc9dbdd4674d7d9e2097fa14`;
- run `#2134` / `34927474226`;
- artifact `mememe-playtest-0.1.61.1-simulation-baseline`;
- artifact ID `10379994996`;
- size `8,589,813 bytes`;
- SHA256 `47fc4a7bb4ef5d8503584b7b44ae9899437b11cd9f0461e20fddb176930b5e41`;
- expires 2026-09-29.

All gates passed, including:
- build/typecheck;
- replay / lockstep / HOST authority;
- two-tab / multiplayer / bot stress;
- CPU random-target-no-opponent regression;
- presentation / Draft D / branch identity;
- Job Hub + Mini Game HOST payout ownership;
- final result / podium chain;
- 0.1.48 stale-token/audio/dice gate;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- 0.1.61 local report;
- new 0.1.61.1 32-match simulation baseline;
- package validation + artifact upload.

## 9. Status declaration

### Runtime candidate
**0.1.61 — CI GREEN, MANUAL ACCEPTANCE PENDING**

### QA/package patch
**0.1.61.1 — CI GREEN / PACKAGED CANDIDATE**

### User-validated rollback baseline
**0.1.48 only.**

## 10. Human feedback required before 0.1.62 gameplay scope

Use `docs/PLAYTEST_0.1.61.1_SIMULATION_BASELINE.md` in the current package.

For the useful human payload:
1. play a complete real match to podium;
2. open `BÁO CÁO PLAYTEST`;
3. `COPY REPORT` and paste the full block;
4. say fast / right / slow;
5. say B$ too compressed / right / too swingy;
6. identify the strongest, weakest or slowest event;
7. keep watching long-run token snap-back and host/client result ordering.

**0.1.62 must be selected from copied runtime report + subjective human feedback. Do not invent gameplay scope in advance.**

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
