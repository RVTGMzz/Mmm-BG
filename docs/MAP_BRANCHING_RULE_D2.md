# MeMeMe Map Branching Rule D2

Status: **APPROVED PROJECT RULE**.

This rule applies to the Draft D topology and defines the difference between canonical gameplay choices and preview QA automation.

## Canonical player-facing rule

When Draft D branching is integrated into the standard `START_PLAYTEST.bat` gameplay path, the active human player chooses one of two directions at a real junction:

- **RẼ TRÁI**
- **RẼ PHẢI**

The choice changes which spaces/content the player passes through, but it must never send the player backward or into an endless loop.

## Preview QA rule

`START_DRAFT_D_PREVIEW.bat` is a map/camera sandbox, not the canonical gameplay mode.

Default preview behavior should be **AUTO BRANCH**:
- automatically choose Left/Right at junctions;
- use the preview's deterministic seeded RNG;
- make the same seed reproduce the same route decisions;
- avoid forcing the tester to answer Left/Right on every pass.

The preview should also expose an optional **AUTO / MANUAL** branch-choice toggle.

When set to MANUAL, the preview shows the normal **RẼ TRÁI / RẼ PHẢI** chooser for targeted branch testing.

AUTO is a QA convenience only. It must not redefine final human gameplay.

## Progress contract

Every branch is a forward corridor with a fixed rejoin point ahead of the junction. Both choices use the same number of movement steps in the current Draft D preview so choosing a direction changes exposure/content, not lap distance.

Current branch plans:

| Junction | Left first | Right first | Rejoin | Steps to rejoin |
|---|---:|---:|---:|---:|
| M04 / node 3 | A1 / 200 | M05 / 4 | M08 / 7 | 4 |
| M17 / node 16 | M18 / 17 | B1 / 210 | M21 / 20 | 4 |
| M35 / node 34 | C1 / 220 | M36 / 35 | M39 / 38 | 4 |

After the merge, movement continues along the forward main route toward READY and the next lap crossing.

## Hard guardrails

- No branch may point to an earlier progress segment.
- No branch may create its own cycle.
- No branch may re-enter another decision junction before its declared merge in this preview.
- No choice may trap the player in a dead end.
- READY remains the lap destination and only physical lap crossing.
- Jail/Hospital exit paths remain separate special-location routes, not normal left/right choices.
- Preview AUTO BRANCH must obey the same topology rules as MANUAL choice.

## Full-map review

`START_DRAFT_D_FULL_MAP.bat` is a dedicated review mode. It must fit the complete current Draft D board into one viewport, without gameplay HUD/camera-follow behavior, so topology and branch merges are easy to inspect.

## Launcher-role source of truth

See `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md` for the canonical distinction between:
- `START_PLAYTEST.bat` = standard gameplay target;
- `START_DRAFT_D_PREVIEW.bat` = Draft D QA sandbox;
- `START_DRAFT_D_FULL_MAP.bat` = topology review;
- `START_FINAL_MAP_PREVIEW.bat` = legacy preview launcher.
