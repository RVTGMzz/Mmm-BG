# MeMeMe — Playtest Launcher & Branch Policy

Status: **APPROVED PROJECT RULE**

This document defines the role of each Windows launcher and the branch-choice behavior expected in preview versus canonical gameplay.

## Launcher roles

### `START_PLAYTEST.bat` — canonical gameplay target

`START_PLAYTEST.bat` is the standard gameplay path MeMeMe is ultimately building toward.

Rules:
- Treat it as the canonical gameplay shell and integration target.
- New map/camera/UI mechanics may be prototyped elsewhere first, but they are not considered part of standard gameplay until intentionally integrated into this path.
- Do not replace this launcher with a map preview launcher.
- Keep the validated HOST-authoritative gameplay invariants when integrating Draft D features.

### `START_DRAFT_D_PREVIEW.bat` — map/camera sandbox

This launcher is a development and QA sandbox for testing Draft D map topology, spacing, camera framing, branch presentation, Jail/Hospital geometry and other board-specific work.

Rules:
- It is **not** the canonical gameplay mode.
- Preview-only shortcuts are allowed when they reduce repetitive QA work.
- By default, branch choices should use **AUTO BRANCH** so a tester can repeatedly roll and inspect flow without answering Left/Right at every junction.
- AUTO BRANCH must use the preview's deterministic seeded RNG so the same seed reproduces the same route decisions.
- The preview should expose an optional **AUTO / MANUAL** branch-choice toggle.
- MANUAL mode exists for targeted branch testing and should show the normal **RẼ TRÁI / RẼ PHẢI** decision UI.
- Preview convenience behavior must not silently redefine final gameplay rules.

### `START_DRAFT_D_FULL_MAP.bat` — topology review

This launcher exists only to review the whole current map.

Rules:
- Fit the complete current Draft D topology into one viewport.
- No normal turn follow camera.
- No Roll Dice interaction.
- No four-player gameplay HUD is required.
- Make junctions, alternate corridors, merge points, Jail/Hospital and major anchors easy to inspect.
- Always review the current Draft D graph, never an older circular/oval map.

### `START_FINAL_MAP_PREVIEW.bat` — legacy launcher

This is an older 0.1.50-era preview launcher.

Rules:
- Keep it only when historical A/B comparison is explicitly useful.
- It should not be presented as a normal tester choice in future clean packages.
- Future tester packages should prefer the three roles above: canonical gameplay, Draft D sandbox, and Full Map review.

## Branch-choice policy

### Canonical gameplay

When Draft D branching is eventually integrated into `START_PLAYTEST.bat`:
- a human active player chooses **RẼ TRÁI** or **RẼ PHẢI** at a real junction;
- both routes must progress forward;
- both routes must rejoin ahead;
- routes must not create infinite loops, backward traps or dead ends;
- the choice should matter through different spaces/content exposure rather than confusing navigation.

The current working Draft D uses equal step count to the merge so route choice does not secretly change lap distance.

### Preview gameplay

Default preview behavior is **AUTO BRANCH**.

AUTO BRANCH:
- chooses Left/Right automatically using deterministic seeded RNG;
- avoids stopping the tester at every junction;
- remains reproducible for bug reports;
- must still obey the same forward-only / merge-ahead topology contract.

MANUAL BRANCH:
- can be enabled for targeted QA;
- shows the Left/Right chooser;
- does not change topology or movement rules.

## Packaging direction

Future clean external playtest packages should make roles obvious instead of presenting many similarly named launchers.

Preferred visible launcher set:
1. `START_PLAYTEST.bat` — standard gameplay
2. `START_DRAFT_D_PREVIEW.bat` — current map sandbox
3. `START_DRAFT_D_FULL_MAP.bat` — full-map review

Supporting scripts such as `serve-playtest.ps1` are implementation plumbing and should not be treated as player-facing game modes.

## Guardrail

Preview implementation is allowed to be faster and more automated than canonical gameplay. However, preview-only QA conveniences must never be mistaken for final MeMeMe rules when integrating into HOST-authoritative gameplay.
