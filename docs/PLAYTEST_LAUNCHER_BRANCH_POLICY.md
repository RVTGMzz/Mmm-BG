# MeMeMe — Playtest Launcher & Branch Policy

Status: **APPROVED PROJECT RULE / IMPLEMENTED IN 0.1.54**

This document defines the role of each Windows launcher and the branch-choice behavior expected in preview versus canonical gameplay.

## Launcher roles

### `START_PLAYTEST.bat` — canonical gameplay target

`START_PLAYTEST.bat` is the standard gameplay path MeMeMe is building toward.

Rules:
- Treat it as the canonical gameplay shell and integration target.
- New map/camera/UI mechanics may be prototyped elsewhere first, but they are not standard gameplay until intentionally integrated here.
- Do not replace this launcher with a map preview launcher.
- Keep the validated 0.1.48 HOST-authoritative invariants when integrating Draft D.

### `START_DRAFT_D_PREVIEW.bat` — map/camera sandbox

This launcher is development/QA only.

0.1.54 behavior:
- default = **AUTO BRANCH**;
- default reproducible seed = `5454`;
- branch RNG uses a deterministic stream derived from that seed;
- same seed reproduces the same branch-choice sequence;
- fixed HUD toggle switches **AUTO / THỦ CÔNG**;
- MANUAL shows the normal **RẼ TRÁI / RẼ PHẢI** decision UI.

AUTO is a QA convenience so testers can repeatedly roll without answering every junction. It must never redefine final human gameplay.

### `START_DRAFT_D_FULL_MAP.bat` — topology review

This launcher exists only to inspect the whole Draft D graph.

Rules:
- fit the full current topology into one viewport;
- no normal follow camera;
- no Roll Dice interaction;
- no normal four-player gameplay HUD requirement;
- show junctions, alternate corridors, merge points, Jail/Hospital and anchors clearly.

### Legacy 0.1.50 launcher

`START_FINAL_MAP_PREVIEW.bat` is legacy.

As of 0.1.54:
- it is removed from `public/`;
- it must not ship in tester packages;
- historical code/routes can remain in Git history for regression/A-B reference.

## Branch-choice policy

### Canonical gameplay

When Draft D is integrated into `START_PLAYTEST.bat`:
- the active human chooses **RẼ TRÁI** or **RẼ PHẢI** at a real junction;
- both routes progress forward;
- both routes rejoin ahead;
- no route creates an infinite loop, backward trap or dead end;
- route identity comes from content/exposure, not confusing navigation;
- current working topology keeps equal step count between split and merge.

### Preview gameplay

AUTO BRANCH:
- chooses Left/Right automatically with deterministic seeded RNG;
- avoids repetitive QA clicks;
- remains reproducible for bug reports;
- obeys the same forward-only / merge-ahead topology contract.

MANUAL BRANCH:
- is available from the fixed preview HUD toggle;
- shows the normal Left/Right chooser;
- does not change topology or movement rules.

## Clean tester package rule

The expected visible launcher set is exactly:

1. `START_PLAYTEST.bat` — standard gameplay
2. `START_DRAFT_D_PREVIEW.bat` — current map sandbox
3. `START_DRAFT_D_FULL_MAP.bat` — full-map review

`serve-playtest.ps1` is support plumbing, not a player-facing mode.

CI/package validation should fail if the old `START_FINAL_MAP_PREVIEW.bat` reappears.

## Guardrail

Preview implementation may be faster and more automated than canonical gameplay. Preview-only QA conveniences must never be mistaken for final MeMeMe rules when Draft D is integrated into HOST-authoritative gameplay.
