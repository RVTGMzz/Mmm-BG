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

## 2. Current gameplay candidate — MVP 0.1.62

0.1.62 was selected from direct human feedback after Ron tested the board presentation:
- zoom normal gameplay closer;
- replace rectangular movement spaces with larger round spaces;
- remove manual branch choice;
- restore luck: **odd D6 = LEFT, even D6 = RIGHT**.

Build name:
**0.1.62 — Random Branch + Round Tile Readability**

Manual runtime status: **PENDING RON ACCEPTANCE**.

## 3. Current runtime chain

`START_PLAYTEST.bat` activates:
`CareerMinigameBoardScene062 as ActiveBoardScene`

Inheritance:
`062 -> 061 -> 060 -> 059 -> 058 -> 057 -> 0561 -> 056 -> 048 -> validated authority chain`

0.1.62 therefore retains:
- 0.1.61 local Playtest Match Report;
- 0.1.60 one-lap finish lock / economy;
- 0.1.59 Job + five Mini Game arena identities;
- 0.1.58 TIN TỨC / LÁ BÀI depth;
- 0.1.57 Jail / Hospital / Lottery authority;
- 0.1.56.1 canonical camera/HUD architecture;
- 0.1.48 stale-token/audio/dice protection.

## 4. 0.1.62 authoritative random branching

Live human/CPU play no longer chooses a route manually.

Rule:
- D6 `1 / 3 / 5` -> **TRÁI**;
- D6 `2 / 4 / 6` -> **PHẢI**.

Implementation:
- `src/core/board.ts::pickParityEdge()` honors explicit parity metadata first and falls back to stable `TRÁI` / `PHẢI` edge labels on Draft D;
- `src/core/authority.ts::autoResolveParityBranches062()` owns live branch resolution;
- the movement D6 is the only source of chance, no second RNG is consumed;
- after a `roll` reaches a fork with remaining pips, HOST derives the route and appends the existing `choose_branch` command with `automatic=true` and parity metadata;
- replay wire format stays backward-compatible;
- clients do not receive a live manual `BRANCH_CHOICE` pause;
- old BranchPicker code remains dormant historical compatibility code beneath 0.1.62.

Dedicated gate:
- `tests/random-branch-round-tiles-062.ts`
- checks all three Draft D junctions for 1/3/5 LEFT and 2/4/6 RIGHT;
- uses an immediate-junction authority fixture to prove both odd/even HOST auto-routing;
- proves no client RNG and no presentation gameplay mutation.

## 5. 0.1.62 readability pass

Camera:
- normal active-token follow zoom = **2.15x** (was 1.75x);
- Overview remains **0.88x** via `TỔNG QUAN` / keyboard `O`.

Round movement spaces in `CareerMinigameBoardScene062`:
- inherited rectangular bodies are destroyed, not stacked;
- normal radius = 23px;
- feature radius = 27px;
- anchor radius = 29px;
- Jail/Hospital hold radius = 32px;
- authoritative coordinates, labels, colors and tile logic remain unchanged.

Visible 0.1.62 badge reminds:
`LẺ ← TRÁI • CHẴN → PHẢI`

This is intentionally a readability/form pass. Final per-tile art is deferred.

## 6. Locked Draft D / gameplay foundation retained

Board:
- exactly 44 main spaces `M01..M44`;
- only `M44 -> M01` crosses READY/lap;
- M01 READY;
- M12 Jail Gate;
- M23 Lottery;
- M34 Hospital Gate;
- Mini Game spaces M09/M17/M26/M35/M44;
- three forward-only equal-step Left/Right junctions;
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

0.1.60 economy remains unchanged in 0.1.62:
- start 200 B$;
- first-lap READY finish-stop and spare-pip discard;
- final B$ lock + retired finishers;
- main money four -20 / four +25;
- TIỀN branch +25 / -20 / +25;
- existing Card / News values unchanged;
- Mini Game canonical total 50 B$ for 3+/4 and 30 B$ direct 1v1.

## 7. 0.1.61 report remains available

Result screen still exposes `📊 BÁO CÁO PLAYTEST`.

Report remains:
- local-only;
- deterministic from authoritative MatchState/eventLog;
- no network upload/fetch;
- no gameplay intent or state mutation;
- no extra RNG;
- copy via browser clipboard with local fallback.

Use this report for 0.1.62 human feedback.

## 8. Simulation comparison after intentional routing change

The existing 32-match deterministic harness still runs seeds `611100..611131` through the real current HOST flow. Because 0.1.62 intentionally changes route resolution, the old 0.1.61.1 gameplay fingerprints are historical comparison data, not active balance targets.

Current 0.1.62-routing batch:
- turns avg **56.7**, min 46, p50 54, p90 63, max 73;
- commands avg **89.1**, min 69, p50 86, p90 103, max 123;
- final table B$ avg **1342.8**, min 1001, p50 1320, p90 1555, max 1765;
- final B$ spread avg **120.4**, min 27, p50 110, p90 188, max 253;
- movement rolls avg 53;
- release rolls avg 7.1;
- Cards avg 7.9;
- News avg 6.4;
- Mini Games avg 5.0;
- Mini payout avg 230 B$;
- Jobs selected avg 3.8;
- Lottery count avg 0.9;
- Lottery payout avg 63.8 B$;
- first-finisher seat counts P1/P2/P3/P4 = `11/5/6/10`;
- money-leader seat counts P1/P2/P3/P4 = `9/9/6/8`.

For comparison, historical 0.1.61.1 averages were 60.2 turns and 126.3 B$ spread. Do not treat either bot batch as a substitute for human feel feedback.

## 9. 0.1.62 exact outlier replay sentinels

Active sentinel test:
- `tests/outlier-replay-062.ts`

Historical `tests/outlier-replay-0612.ts` and its old fingerprints are retained as history but are no longer the active CI gameplay sentinel because 0.1.62 intentionally changes branching.

### Seed 611119 — longest current batch
- checksum `9d83fad4`;
- 73 turns;
- 123 authoritative commands / 107 submitted commands / 16 HOST-auto commands;
- final table 1765 B$, spread 175 B$;
- movement/release = 66/16;
- Cards 12, News 4;
- Mini Games 9, payout 415 B$;
- Jobs 4;
- Lottery 3, payout 340 B$;
- finish `P2 > P4 > P1 > P3`;
- final B$ `P1=433 / P2=403 / P3=552 / P4=377`.

### Seed 611113 — largest current B$ spread
- checksum `1074ba94`;
- 53 turns;
- 79 authoritative commands / 68 submitted commands / 11 HOST-auto commands;
- final table 1465 B$, spread 253 B$;
- movement/release = 44/13;
- Cards 4, News 7;
- Mini Games 4, payout 175 B$;
- Jobs 3;
- Lottery 2, payout 160 B$;
- finish `P4 > P3 > P1 > P2`;
- final B$ `P1=488 / P2=390 / P3=352 / P4=235`.

These are regression sentinels, not balance targets.

## 10. 0.1.62 code candidate

Code candidate before this documentation update is **FULL CI GREEN / PACKAGED**:
- HEAD `1337c81d2e8ac45d7ce824cc5d7d3080afbfd147`;
- push run `#2192` / `34941360593`;
- artifact `mememe-playtest-0.1.62-random-branch-round-tiles`;
- artifact ID `10385173205`;
- size `8,590,917 bytes`;
- SHA256 `cbc05669e7444156ceb97ad9221dd0560a47aadde5adb1eae70e5339c386c3fc`;
- expires 2026-09-29.

Run #2192 passed the complete suite including:
- build/typecheck;
- replay / lockstep / HOST authority;
- two-tab / multiplayer / CPU stress;
- random-target-no-opponent regression;
- presentation / Draft D topology / branch identities;
- Job Hub + Mini Game HOST payout ownership;
- result/podium chain;
- 0.1.48 stale-token/audio/dice gate;
- 0.1.57 special locations;
- 0.1.58 TIN TỨC/LÁ BÀI depth;
- 0.1.59 Job/five-arena depth;
- 0.1.60 finish-lock/economy;
- 0.1.61 local report;
- 32-match simulation harness;
- 0.1.62 exact outlier sentinel pack;
- 0.1.62 odd/even HOST branch + round tile/zoom gate;
- image/package validation;
- playtest guide copy;
- artifact upload.

## 11. Next manual test

Use `docs/PLAYTEST_0.1.62_RANDOM_BRANCH_ROUND_TILES.md` from the packaged artifact.

Ron should specifically check:
1. no branch picker appears in live play;
2. odd roll routes LEFT and even roll routes RIGHT whenever a fork must be resolved;
3. 2.15x follow zoom feels close enough without becoming cramped;
4. round spaces are easier to read and follow than rectangular spaces;
5. Overview/O still gives a useful full-board view;
6. watch for token snap-back after many turns;
7. finish a match and paste the complete Playtest Report plus short subjective notes.

0.1.62 must **not** be called user-accepted until Ron manually validates it.

0.1.49 Legacy Effect Audit remains historical input.

Do not merge PR #1.
