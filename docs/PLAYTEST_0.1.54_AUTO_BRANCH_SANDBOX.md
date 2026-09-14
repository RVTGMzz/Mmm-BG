# MeMeMe 0.1.54 — AUTO BRANCH Sandbox Playtest

Status: **Draft D sandbox milestone**.

This build exists to make repeated map QA faster before Draft D is integrated into standard gameplay.

## Which launcher should I use?

### Standard gameplay
Run:

`START_PLAYTEST.bat`

This is still the canonical gameplay path and final integration target.

### Draft D sandbox
Run:

`START_DRAFT_D_PREVIEW.bat`

0.1.54 sandbox defaults to:
- `AUTO BRANCH`;
- seed `5454`;
- close follow camera;
- fixed four-corner UI;
- automatic Left/Right branch choice at Draft D junctions.

Use the top HUD toggle:

`NHÁNH: AUTO` ↔ `NHÁNH: THỦ CÔNG`

MANUAL mode restores the normal `RẼ TRÁI / RẼ PHẢI` popup.

### Full-map topology review
Run:

`START_DRAFT_D_FULL_MAP.bat`

This is review-only, not gameplay.

## Why AUTO mode exists

Repeated map testing became tiring because every junction interrupted the roll flow. AUTO mode removes those repetitive QA clicks while keeping route choice deterministic.

Same seed = same AUTO branch sequence.

The branch RNG uses its own deterministic stream derived from the preview seed, so route QA does not need to consume the normal dice random stream.

## What has NOT changed

- AUTO is preview-only convenience.
- Human players will still choose `RẼ TRÁI / RẼ PHẢI` when Draft D reaches standard gameplay.
- 0.1.48 remains the validated HOST-authoritative gameplay baseline until deliberate 0.1.55 integration.
- Jail/Hospital/Lottery rules remain the approved Draft D design.

## Newly locked design for 0.1.55+

Successful Jail/Hospital release now has a final timing rule:

- fail release check → turn ends;
- successful release → traverse the 3 visible exit spaces;
- then take a **fresh movement D6 roll in the same turn**;
- the release die is not reused as movement distance.

This rule is documented for authoritative integration and is not the main purpose of the 0.1.54 sandbox.

## Package cleanup

The tester package should contain exactly these three launchers:

- `START_PLAYTEST.bat`
- `START_DRAFT_D_PREVIEW.bat`
- `START_DRAFT_D_FULL_MAP.bat`

The old `START_FINAL_MAP_PREVIEW.bat` must not ship anymore.

## What to check

1. Preview opens without a branch popup by default.
2. Reaching a junction automatically selects a route and movement continues.
3. `NHÁNH: AUTO` can be switched to `THỦ CÔNG`.
4. MANUAL mode shows the Left/Right chooser.
5. Switching back to AUTO removes repeated route prompts.
6. HUD/Roll Dice remain clickable.
7. Full Map still shows the complete Draft D topology.
8. `START_PLAYTEST.bat` still opens the standard gameplay flow, not the sandbox.
