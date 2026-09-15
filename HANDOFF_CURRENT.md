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

## 2. Locked gameplay foundation

Draft D remains:
- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- Mini Game spaces M09/M17/M26/M35/M44;
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
- Jail node100, release 1/3/5, exit `100->101->102->103->12`, fresh movement D6 after release;
- Hospital node110, release 2/4/5, exit `110->111->112->113->34`, fresh movement D6 after recovery;
- Lottery = authoritative D6 × 20 B$;
- held players excluded from Mini Games.

Locked 0.1.60 pacing/economy:
- first-lap READY crossing stops immediately on M01 and discards spare pips;
- Job salary pays once before `finishLocked`;
- finished players retire from later turns and final B$ is immune to later Card/News/Mini effects;
- start = 200 B$;
- main money = four -20 / four +25;
- TIỀN branch = +25/-20/+25;
- Kèo Hai Cửa +20, Thuế Top 1 15%, SR all-opponent loss 20%, Phao Cứu Sinh +50/+15;
- News self +25/-30, common global +10/-10, rare global -15;
- canonical Mini Game total = 50 B$ for 3+/4 players, 30 B$ direct 1v1.

## 3. Current runtime

Launcher still activates:
`CareerMinigameBoardScene061 as ActiveBoardScene`

Runtime inheritance:
`061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

**Important:** 0.1.61.1 and 0.1.61.2 are QA/package patches only. They do **not** add runtime scenes or change gameplay rules. Visible runtime/report schema intentionally remains **0.1.61**.

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

Core QA helper:
- `src/core/playtestSimulation0611.ts`

CI gate:
- `tests/simulation-baseline-0611.ts`

CI runs **32 complete deterministic 4-CPU matches** with seeds `611100..611131` until all four players finish one lap. It uses real HOST-authoritative roll, branch, Card, Job and host-system Mini Game resolution paths.

Artifact keeps:
`SIMULATION_BASELINE_0.1.61.1.txt`

32-match baseline:
- turns avg **60.2**, p50 58, p90 68, max 77;
- commands avg **93**, p50 91, p90 106, max 119;
- final table B$ avg **1257.1**;
- final B$ spread avg **126.3**, p50 102, p90 216, max 292;
- movement rolls avg 55.5;
- release rolls avg 8.1;
- Cards avg 7.8;
- News avg 7.4;
- Mini Games avg 4.8;
- Mini payout avg 214.1 B$;
- Jobs selected avg 3.9;
- Lottery count avg 1.1;
- Lottery payout avg 75.6 B$.

First finisher P1/P2/P3/P4 = `4/9/10/9`.
Money leader P1/P2/P3/P4 = `9/6/9/10` (ties may count multiple leaders).

Outliers discovered:
- longest match = seed `611124`;
- largest final B$ spread = seed `611121`.

## 6. CPU edge case discovered by 0.1.61.1

Seed `611100`, turn 50 exposed a real CPU-decision edge case:
- CPU held `ACT_003`, a `random_other` Card;
- every possible opponent had already finished under 0.1.60 finish-lock;
- CPU still attempted `play_card`;
- HOST correctly rejected the targetless Card.

Fix in `src/core/testBot.ts`:
- if a `random_other` Card has no valid active opponent, CPU keeps the Card and rolls instead;
- Card/HOST rules remain unchanged.

`tests/test-bot-autoplay.ts` locks this fallback.

## 7. 0.1.61.2 — Deterministic Outlier Replay Pack

0.1.61.2 turns the two 0.1.61.1 outliers into **exact regression sentinels**.

New test:
- `tests/outlier-replay-0612.ts`

New package guide:
- `docs/PLAYTEST_0.1.61.2_OUTLIER_REPLAY.md`

CI output added to artifact:
- `OUTLIER_REPLAY_0.1.61.2.txt`

Each sentinel is replayed twice through the same full HOST-authoritative simulator. CI now locks exact checksum, turn/command counts, total/spread B$, roll/Card/News/Mini/Job/Lottery counts, Mini/Lottery payout totals, finish order and per-seat final B$.

### Sentinel A — seed 611124 / longest match

- checksum `adf6c230`;
- 77 turns;
- 119 commands / 119 submitted;
- final table 1042 B$, spread 151 B$;
- movement/release = 68 / 14;
- Cards 11;
- News 5;
- Mini Games 7, payout 290 B$;
- Jobs selected 4;
- Lottery 0, payout 0 B$;
- finish `P2 > P4 > P1 > P3`;
- final B$ `P1=229 / P2=246 / P3=359 / P4=208`.

### Sentinel B — seed 611121 / largest B$ spread

- checksum `a19c5b1d`;
- 64 turns;
- 97 commands / 97 submitted;
- final table 1389 B$, spread 292 B$;
- movement/release = 62 / 6;
- Cards 7;
- News 6;
- Mini Games 3, payout 105 B$;
- Jobs selected 4;
- Lottery 2, payout 160 B$;
- finish `P2 > P3 > P4 > P1`;
- final B$ `P1=362 / P2=205 / P3=325 / P4=497`.

These are **regression sentinels, not balance targets**. If human feedback later selects an intentional gameplay/economy change, rerun these same seeds, compare before/after, then deliberately update fingerprints.

## 8. 0.1.61.2 code-candidate result

Code candidate is **CI GREEN / PACKAGED**.

Candidate before this handoff update:
- HEAD `cdd3c5b3db4d1a8d79eb5ac42e9126e3fc69a61e`;
- run `#2152` / `34928020882`;
- artifact `mememe-playtest-0.1.61.2-outlier-replay`;
- artifact ID `10380243058`;
- size `8,590,431 bytes`;
- SHA256 `03e676110342e02da64941e2860cc03a5f0df059d3a61a3e8f895e41dd12e0c3`;
- expires 2026-09-29.

Run #2152 passed the complete suite, including:
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
- 0.1.61.1 32-match simulation baseline;
- 0.1.61.2 exact outlier replay fingerprints;
- package validation + artifact upload.

## 9. Status declaration

### Runtime candidate
**0.1.61 — CI GREEN, MANUAL ACCEPTANCE PENDING**

### QA/package patch
**0.1.61.2 — CI GREEN / PACKAGED CANDIDATE**

### User-validated rollback baseline
**0.1.48 only.**

## 10. Human feedback required before 0.1.62 gameplay scope

Use `docs/PLAYTEST_0.1.61.2_OUTLIER_REPLAY.md` in the current package.

Useful human payload:
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
