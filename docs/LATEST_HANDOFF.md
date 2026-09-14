# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

0.1.48 remains the validated HOST-authoritative gameplay baseline.

`START_PLAYTEST.bat` remains the **canonical gameplay / integration target**.

## Current preview milestone

**MVP 0.1.54 — AUTO BRANCH Sandbox**

Status: **CI GREEN / PACKAGE READY**

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.54_AUTO_BRANCH_SANDBOX.md`
3. `docs/PLAYTEST_0.1.54_AUTO_BRANCH_SANDBOX.md`
4. `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`
5. `docs/MAP_BRANCHING_RULE_D2.md`
6. `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`

## 0.1.54 behavior

Draft D sandbox:
- launcher `START_DRAFT_D_PREVIEW.bat`;
- default seed `5454`;
- default branch mode = **AUTO**;
- same seed reproduces same branch sequence;
- fixed toggle switches **AUTO / THỦ CÔNG**;
- MANUAL shows `RẼ TRÁI / RẼ PHẢI` chooser.

Full map:
- `START_DRAFT_D_FULL_MAP.bat`;
- topology review only.

Standard gameplay:
- `START_PLAYTEST.bat`;
- remains the canonical gameplay target and is not replaced by preview mode.

Legacy `START_FINAL_MAP_PREVIEW.bat` was removed from current tester packages.

Expected tester launchers are exactly:
- `START_PLAYTEST.bat`
- `START_DRAFT_D_PREVIEW.bat`
- `START_DRAFT_D_FULL_MAP.bat`

## CI artifact

- `mememe-playtest-0.1.54-auto-branch-sandbox`
- run #1776 / `34904669825`
- build SHA `54be2d5dae2eb8a386a5bb56fb74edabeff7ddc2`
- artifact ID `10371682282`
- SHA256 `7ec5a1090e81cf1aef35543c1a3f0c32f6285b8e84be2834e278fe0a3eceeeac`

## Draft D topology

- 44 main spaces.
- 3 real decision junctions.
- Both routes progress forward and merge ahead.
- No backward trap, dead end or branch cycle.
- Current routes use equal movement distance to merge.

Junctions:
- M04 -> A1 or M05 -> merge M08
- M17 -> M18 or B1 -> merge M21
- M35 -> C1 or M36 -> merge M39

## Locked special rules

- M01 READY
- M12 Jail Gate
- M23 Lottery = D6 × 20 B$
- M34 Hospital Gate
- Jail release `1 / 3 / 5`
- Hospital release exactly `2 / 4 / 5`
- exactly 3 visible exit spaces for each holding location.

Release timing is now locked:
- fail release → turn ends;
- success → traverse 3 exit spaces;
- then take a **fresh movement D6 in the same turn**;
- release die is not reused for movement.

Keep **TIN TỨC / LÁ BÀI** names.

## Next runtime target

**MVP 0.1.55 — Draft D Standard Gameplay Integration**

Goal: move Draft D into the real HOST-authoritative `START_PLAYTEST.bat` flow while preserving all validated 0.1.48 invariants.

Required chain:

`Roll For Order -> Job -> Draft D movement -> HOST-authoritative Left/Right choice -> TIN TỨC/LÁ BÀI/Mini Game -> Jail/Hospital/Lottery -> READY lap -> final result`

0.1.49 Legacy Effect Audit remains parallel.
Do not merge PR #1.
