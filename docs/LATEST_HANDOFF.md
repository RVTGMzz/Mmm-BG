# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime baseline

**0.1.48** remains the user-validated HOST-authoritative rollback baseline.

Never regress:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio/BGM ownership;
- stale-token guard;
- READY/lap/final-result/podium chain.

Keep the current content names **TIN TỨC / LÁ BÀI**. Do not revive Tiên Tri / Phép Thuật.

## Current candidate

**MVP 0.1.56.1 — Canonical Presentation Consolidation**

Automated status: **CI GREEN**
Manual visual status: **PENDING RON ACCEPTANCE**

Artifact:
- `mememe-playtest-0.1.56.1-canonical-presentation`
- run `#1890` / `34914153706`
- runtime/package SHA `d3356e40ac86df1837b1f3ea6769f2e6659864ba`
- artifact ID `10375767529`
- size `8,582,289 bytes`
- SHA256 `de4ad6319db327e62269262710ec96aef96a04ee368cac807a533421e157382f`
- expires 2026-09-29

All CI gates passed, including:
- typecheck/build;
- replay + lockstep + HOST authority;
- two-tab sync + bot stress;
- board/economy/party/tactical rules;
- Job Hub + Mini Game authority;
- multiplayer presentation parity;
- inherited 0.1.48 audio/dice/stale-token bugfix gate;
- 0.1.50 through 0.1.56 Draft D regressions;
- new 0.1.56.1 canonical presentation gate;
- package validation + artifact upload.

The first 0.1.56.1 CI attempt (#1889) stopped at the old 0.1.48 static gate because that test still hard-coded `CareerMinigameBoardScene056 as ActiveBoardScene`. The gate was updated to verify the unbroken inheritance path `0561 -> 056 -> 048`, while retaining the real `movementStepDisposition` stale/duplicate assertions. No stale-token protection was loosened.

## What 0.1.56.1 changed

Canonical launcher now activates:
`CareerMinigameBoardScene0561 as ActiveBoardScene`

The new scene extends `CareerMinigameBoardScene056`, so authoritative gameplay remains inherited through the validated 0.1.48 chain.

Presentation consolidation:
- close active-token camera during normal gameplay;
- smooth Phaser camera follow of the authoritative token;
- separate fixed UI camera;
- explicit `TỔNG QUAN` / keyboard `O` full-map view;
- branch decision zoom-out, then return to close follow;
- fixed four-corner HUD: P1 TL / P2 TR / P3 BL / P4 BR;
- smaller integrated Draft D greybox markers;
- Job/Mini Game identity integrated into tile markers instead of stacked giant circles;
- compact manual branch picker that leaves route context visible;
- player-facing PHỐ CHÍNH / AN TOÀN / DRAMA / TIỀN route identity;
- TIN TỨC/LÁ BÀI presentation scaled down to preserve board context;
- visible current build/version sourced from `canonicalPresentation0561.ts`;
- active gameplay no longer depends on the chained old-version replacement for its visible 0.1.56.1 label.

Files added/changed for this pass:
- `src/scenes/CareerMinigameBoardScene0561.ts`
- `src/ui/canonicalPresentation0561.ts`
- `src/ui/BranchPicker.ts`
- `src/main.ts`
- `tests/canonical-presentation-0561.ts`
- `tests/bugfix-pass-048.ts`
- `.github/workflows/ci.yml`
- `docs/PLAYTEST_0.1.56.1_CANONICAL_PRESENTATION.md`

## Draft D rules still locked

Main board:
- 44 main spaces `M01..M44`;
- only M44 -> M01 is the lap crossing;
- M01 READY;
- M12 Jail Gate;
- M23 Lottery;
- M34 Hospital Gate;
- five Mini Game spaces M09/M17/M26/M35/M44.

Branches remain forward-only, equal-step and merge ahead.

Branch identities:
- **AN TOÀN 🛡️** = A1/A2/A3 Normal;
- **DRAMA 🎭** = B1 TIN TỨC / B2 LÁ BÀI / B3 TIN TỨC;
- **TIỀN 💰** = C1 +25 / C2 -20 / C3 +25 B$;
- comparison route = **PHỐ CHÍNH**.

Canonical human branch choice is manual Left/Right through the inherited HOST authority path. AUTO parity routing remains preview/QA behavior only.

## Manual acceptance gate

Before calling 0.1.56.1 canonical, Ron must test the actual packaged `START_PLAYTEST.bat` and verify:
- ordinary turns start close, not full-map;
- token follow never snaps backward after many turns;
- all four HUDs stay fixed and readable;
- each branch clearly shows both choices before selection;
- camera returns close after branch selection;
- Overview is explicit only;
- TIN TỨC/LÁ BÀI do not swallow the full playfield;
- visible gameplay copy says 0.1.56.1, not 0.1.25;
- Roll For Order, Job Hub, Mini Games, audio, READY/lap and final result still feel unchanged.

Guide:
`docs/PLAYTEST_0.1.56.1_CANONICAL_PRESENTATION.md`

Do **not** mark presentation user-accepted based on CI alone.

## Next milestone after manual acceptance

**0.1.57 — authoritative Jail / Hospital / Lottery + Mini Game eligibility**

Locked future rules:

Jail:
- release on 1 / 3 / 5;
- fail = stay, turn ends;
- success route `JAIL -> J1 -> J2 -> J3 -> M13`;
- release D6 is only the escape check;
- successful release then rolls a fresh movement D6 in the same turn.

Hospital:
- release exactly 2 / 4 / 5;
- fail = stay, turn ends;
- success route `HOSPITAL -> H1 -> H2 -> H3 -> M35`;
- release D6 is only the recovery check;
- successful release then rolls a fresh movement D6 in the same turn.

Lottery:
- M23;
- reward `D6 × 20 B$` = 20/40/60/80/100/120.

Mini Game eligibility once holding state is authoritative:
- Jail/Hospital player excluded;
- 2+ eligible = normal Mini Game;
- 1 eligible = auto rank #1;
- 0 eligible = skip/no payout.

Roadmap:
- 0.1.54 AUTO/MANUAL preview sandbox — done
- 0.1.55 canonical Draft D topology — CI green
- 0.1.56 branch identity — CI green
- **0.1.56.1 canonical presentation — CI green, manual acceptance pending**
- 0.1.57 special-location authority — blocked until 0.1.56.1 manual acceptance
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 pacing/economy

0.1.49 Legacy Effect Audit remains parallel input for 0.1.58.

Do not merge PR #1.
