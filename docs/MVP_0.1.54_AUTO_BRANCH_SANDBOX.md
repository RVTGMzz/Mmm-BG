# MVP 0.1.54 — AUTO BRANCH Sandbox

Status: **CI GREEN / PLAYTEST PACKAGE READY**

Purpose: close the Draft D sandbox loop before authoritative Draft D integration begins.

## Runtime behavior

`START_DRAFT_D_PREVIEW.bat` now defaults to:
- `finalmap=3`
- preview seed `5454`
- `branch=auto`

AUTO BRANCH:
- chooses Left/Right automatically at the three Draft D junctions;
- uses a deterministic RNG stream derived from the preview seed;
- same seed reproduces the same branch-choice sequence;
- does not consume the normal preview dice RNG stream;
- removes repetitive Left/Right QA interruptions.

A fixed UI toggle switches:
- `NHÁNH: AUTO`
- `NHÁNH: THỦ CÔNG`

MANUAL mode reuses the normal `RẼ TRÁI / RẼ PHẢI` chooser.

## Launcher/package cleanup

The tester package now exposes exactly three Windows launchers:

1. `START_PLAYTEST.bat` — standard gameplay / integration target
2. `START_DRAFT_D_PREVIEW.bat` — Draft D sandbox
3. `START_DRAFT_D_FULL_MAP.bat` — full topology review

Legacy `START_FINAL_MAP_PREVIEW.bat` was removed from `public/` and must not ship in current tester packages.

`serve-playtest.ps1` remains support plumbing.

## Design rule locked for 0.1.55+

Jail/Hospital successful release now has a final turn-timing rule:
- failed release check ends the turn;
- successful release traverses the three visible exit spaces;
- player then takes a **fresh movement D6 roll in the same turn**;
- the release die is not reused as movement distance.

This rule is documented for authoritative integration; 0.1.54 itself remains a sandbox milestone.

## Regression coverage

New regression:
- `tests/preview-branch-mode-054.ts`

Checks:
- AUTO is default;
- MANUAL is preserved;
- same seed reproduces AUTO branch sequence;
- Draft D launcher defaults to deterministic AUTO mode;
- `START_PLAYTEST.bat` remains standard gameplay launcher;
- full-map launcher remains available;
- legacy 0.1.50 launcher is absent from tester package.

Package verification also enforces the exact three-launcher set.

## CI artifact

- workflow run: `#1776` / `34904669825`
- build head SHA: `54be2d5dae2eb8a386a5bb56fb74edabeff7ddc2`
- artifact: `mememe-playtest-0.1.54-auto-branch-sandbox`
- artifact ID: `10371682282`
- size: `8,577,128 bytes`
- SHA256: `7ec5a1090e81cf1aef35543c1a3f0c32f6285b8e84be2834e278fe0a3eceeeac`

All existing regression steps through 0.1.53 plus the new 0.1.54 test and package validation passed.

## Next runtime target

**0.1.55 — Draft D standard gameplay integration**

Goal: move the approved 44-space branching topology into the HOST-authoritative `START_PLAYTEST.bat` match flow while preserving the validated 0.1.48 gameplay invariants.

See `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`.
