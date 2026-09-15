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

**0.1.61.1 — Deterministic Simulation Baseline / QA Lab**

This is deliberately a QA/package patch, not a new gameplay milestone. Runtime/report schema stays 0.1.61.

Code candidate before this documentation update:
- HEAD `c63681e77062fbe7bc9dbdd4674d7d9e2097fa14`;
- run `#2134` / `34927474226`;
- artifact `mememe-playtest-0.1.61.1-simulation-baseline`;
- artifact ID `10379994996`;
- size `8,589,813 bytes`;
- SHA256 `47fc4a7bb4ef5d8503584b7b44ae9899437b11cd9f0461e20fddb176930b5e41`;
- expires 2026-09-29.

Automated status: **CI GREEN / PACKAGED**.

## What the simulation lab does

CI runs 32 complete deterministic four-CPU matches with seeds `611100..611131` through the real HOST-authoritative flow until all players finish one lap.

It covers roll, branch choice, Card use, Job choice and HOST-system Mini Game payout. Mini Game ranking is deterministically rotated from seed + source-event sequence, with no `Math.random` or second gameplay RNG stream.

Artifact includes:
`SIMULATION_BASELINE_0.1.61.1.txt`

The baseline is QA evidence only. It does not replace human pacing/feel feedback.

## CPU edge case found and fixed

The first lab run exposed seed `611100`, turn 50:
- CPU held random-target Card `ACT_003`;
- every possible opponent had already finished under 0.1.60 finish-lock;
- CPU still tried `play_card`;
- HOST correctly rejected the invalid targetless Card.

Fix:
- CPU now keeps an unusable `random_other` Card and chooses `roll` if no active opponent exists;
- Card/HOST rules are unchanged;
- `tests/test-bot-autoplay.ts` explicitly locks this fallback.

## Baseline numbers

32 deterministic matches:
- turns avg 60.2, p50 58, p90 68, max 77;
- commands avg 93, p50 91, p90 106, max 119;
- final table B$ avg 1257.1;
- final B$ spread avg 126.3, p50 102, p90 216, max 292;
- movement rolls avg 55.5;
- release rolls avg 8.1;
- Cards avg 7.8;
- News avg 7.4;
- Mini Games avg 4.8;
- Mini payout avg 214.1 B$;
- Jobs selected avg 3.9;
- Lottery count avg 1.1;
- Lottery payout avg 75.6 B$.

First finisher counts P1/P2/P3/P4 = `4/9/10/9`.
Money leader counts P1/P2/P3/P4 = `9/6/9/10` (ties may count multiple leaders).

Outliers:
- longest match seed `611124`;
- largest B$ spread seed `611121`.

Do not infer a balance change from these numbers alone. They are the baseline to compare against future changes selected from human feedback.

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

Run #2134 passed everything:
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
- package validation + artifact upload.

## Next step

Use:
`docs/PLAYTEST_0.1.61.1_SIMULATION_BASELINE.md`

After a real match, paste the complete 0.1.61 report and add:
- fast / right / slow;
- B$ too compressed / right / too swingy;
- strongest / weakest / slowest event.

**0.1.62 gameplay scope must follow that real report + subjective feedback. Do not invent it in advance.**

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
