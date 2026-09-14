# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

0.1.48 remains the validated HOST-authoritative gameplay baseline.

`START_PLAYTEST.bat` remains the **canonical gameplay target**. Preview launchers are sandboxes/review tools only.

## Current preview milestone

**MVP 0.1.53 — Left/Right Branching + True Full Map**

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`
3. `docs/MAP_BRANCHING_RULE_D2.md`
4. `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
5. `docs/MAP_CAMERA_HUD_DRAFT_D1.md`

## Launcher roles

- `START_PLAYTEST.bat` = standard/canonical gameplay path.
- `START_DRAFT_D_PREVIEW.bat` = Draft D QA sandbox.
- `START_DRAFT_D_FULL_MAP.bat` = whole-map topology review.
- `START_FINAL_MAP_PREVIEW.bat` = legacy 0.1.50-era preview, not a normal future tester option.

## Preview branch policy

Next Draft D preview build should default to **AUTO BRANCH** so repeated map QA does not stop for every Left/Right decision.

AUTO BRANCH:
- deterministic seeded RNG;
- same seed reproduces the same branch choices;
- obeys the same forward-only / merge-ahead topology.

Preview should also expose **AUTO / MANUAL** toggle.

MANUAL:
- shows `RẼ TRÁI / RẼ PHẢI` chooser;
- intended for targeted route QA.

Canonical gameplay remains manual human choice when branching is eventually integrated into `START_PLAYTEST.bat`.

## Draft D topology

- 44 main spaces.
- 3 real decision junctions.
- Both routes progress forward and merge ahead.
- No backward trap, dead end or branch cycle.
- Current branch paths use equal movement distance to merge.

Current junctions:
- M04 -> A1 or M05 -> merge M08
- M17 -> M18 or B1 -> merge M21
- M35 -> C1 or M36 -> merge M39

## Full-map review

`START_DRAFT_D_FULL_MAP.bat` uses the dedicated 0.1.53 review scene and must fit the whole current Draft D topology into one viewport. It is not normal gameplay.

## Locked special rules

- M01 READY
- M12 Jail Gate
- M23 Lottery: D6 × 20 B$
- M34 Hospital Gate
- Jail release `1 / 3 / 5`
- Hospital release exactly `2 / 4 / 5`
- exactly 3 visible exit spaces for each holding location.

Keep **TIN TỨC / LÁ BÀI** names.
0.1.49 Legacy Effect Audit remains parallel.
Do not merge PR #1.
