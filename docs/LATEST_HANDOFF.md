# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Baseline

**0.1.48** remains the only user-validated HOST-authoritative rollback baseline.

Never regress HOST authority, replay/checksum determinism, remote Roll For Order, multiplayer Job Hub, Mini Game payout ownership, audio/BGM ownership, stale-token guard, or READY/lap/final-result/podium flow.

Keep **TIN TỨC / LÁ BÀI** names.

## Current runtime

Runtime remains **0.1.61 — Local Playtest Match Report**.

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene061 as ActiveBoardScene`

Inheritance:
`061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.61 report remains local-only and deterministic. No gameplay rule was changed after 0.1.60.

Manual runtime status: **PENDING RON ACCEPTANCE**.

## Current QA/package candidate

**0.1.61.2 — Deterministic Outlier Replay Pack**

This is a QA/package patch, not a gameplay milestone. Runtime/report schema stays 0.1.61.

Code candidate before this documentation update:
- HEAD `cdd3c5b3db4d1a8d79eb5ac42e9126e3fc69a61e`;
- run `#2152` / `34928020882`;
- artifact `mememe-playtest-0.1.61.2-outlier-replay`;
- artifact ID `10380243058`;
- size `8,590,431 bytes`;
- SHA256 `03e676110342e02da64941e2860cc03a5f0df059d3a61a3e8f895e41dd12e0c3`;
- expires 2026-09-29.

Automated status: **CI GREEN / PACKAGED**.

## What 0.1.61.1 established

The 32-match deterministic QA lab still runs seeds `611100..611131` through the real HOST-authoritative flow until all four CPUs finish one lap.

Baseline:
- turns avg 60.2, p50 58, p90 68, max 77;
- commands avg 93, p50 91, p90 106, max 119;
- final table B$ avg 1257.1;
- final B$ spread avg 126.3, p50 102, p90 216, max 292;
- Cards avg 7.8;
- News avg 7.4;
- Mini Games avg 4.8;
- Mini payout avg 214.1 B$;
- Lottery count avg 1.1.

Artifact keeps `SIMULATION_BASELINE_0.1.61.1.txt`.

The lab also found and fixed the CPU edge case where an unusable `random_other` Card was attempted after all valid opponents had already finished. CPU now keeps that Card and rolls; HOST/Card rules were not weakened.

## 0.1.61.2 outlier sentinels

Two 0.1.61.1 outliers are now exact regression fixtures and each is replayed twice.

### Seed 611124 — longest match

- checksum `adf6c230`;
- 77 turns / 119 commands;
- table 1042 B$, spread 151 B$;
- movement/release 68/14;
- Cards 11, News 5;
- Mini 7 / payout 290 B$;
- Jobs 4;
- Lottery 0 / 0 B$;
- finish `P2 > P4 > P1 > P3`;
- money `P1 229 / P2 246 / P3 359 / P4 208`.

### Seed 611121 — largest B$ spread

- checksum `a19c5b1d`;
- 64 turns / 97 commands;
- table 1389 B$, spread 292 B$;
- movement/release 62/6;
- Cards 7, News 6;
- Mini 3 / payout 105 B$;
- Jobs 4;
- Lottery 2 / 160 B$;
- finish `P2 > P3 > P4 > P1`;
- money `P1 362 / P2 205 / P3 325 / P4 497`.

`tests/outlier-replay-0612.ts` locks checksum, counts, payouts, finish order and per-seat final B$. Artifact adds:
`OUTLIER_REPLAY_0.1.61.2.txt`

These are regression sentinels, **not balance targets**. Intentional future gameplay changes selected from human feedback may update them deliberately after before/after comparison.

## Locked gameplay beneath QA patch

0.1.60 remains unchanged:
- M01 finish-stop + discarded spare pips;
- final B$ lock and retired finishers;
- start 200 B$;
- Lottery D6 ×20;
- Card/News tune from 0.1.60;
- Mini Game 50 B$ total for canonical 3+/4 and 30 B$ direct 1v1;
- Jail/Hospital rules unchanged.

0.1.59 Job/Mini identities, 0.1.58 TIN TỨC/LÁ BÀI relocation, 0.1.57 special-location authority, canonical presentation and 0.1.48 stale-token protection remain inherited.

## CI status

Run #2152 passed everything:
- build/typecheck;
- replay/lockstep/HOST authority;
- two-tab/multiplayer/bot stress;
- CPU random-target fallback regression;
- board/presentation/content/economy/pacing;
- Job D6 + multiplayer Job Hub;
- Mini Game HOST single-commit payout ownership;
- result/podium chain;
- 0.1.48 stale-token/audio/dice regression;
- Draft D 0.1.50–0.1.56 gates;
- 0.1.56.1 presentation;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- 0.1.61 local report;
- 0.1.61.1 32-match baseline;
- 0.1.61.2 exact outlier replay fingerprints;
- package validation + artifact upload.

## Next step

Use:
`docs/PLAYTEST_0.1.61.2_OUTLIER_REPLAY.md`

After a real match, paste the complete 0.1.61 report and add:
- fast / right / slow;
- B$ too compressed / right / too swingy;
- strongest / weakest / slowest event.

**0.1.62 gameplay scope must follow that real report + subjective feedback. Do not invent it in advance.**

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
