# MeMeMe Playtest 0.1.65 — Job HUD + Rounded UI

## Scope

Presentation-only polish on top of 0.1.64. Gameplay, HOST authority, replay/RNG, economy, camera, branch routing, Job continuation and Jail/Hospital release rules are unchanged.

## What changed

### Player / CPU info cards
- Replaces the vague `Có việc / Chưa việc` status with the real current Job.
- Employed players show Job title, Job level and current salary.
- Unemployed players show `Chưa có nghề` and salary `0 B$/vòng`.
- Job/salary rows update from authoritative player state, including promotion, demotion, firing and new Job selection.

### Rounded UI
- Main player cards use rounded panels.
- Rectangle-based gameplay UI panels/buttons are given rounded visuals while their original Rectangle remains as the input hitbox.
- Hover/click fill changes are mirrored by the rounded visual.
- Full-screen dim overlays remain edge-to-edge intentionally.

### Debug footer
- The red `PLAYTEST ...` / local telemetry footer at the bottom of gameplay is hidden.
- Playtest report functionality remains available from the result/report UI; only the always-visible red debug/footer label is removed.

## Manual checks

1. Start a match with an unemployed player: HUD should show `Chưa có nghề` and `Lương: 0 B$/vòng`.
2. Receive a Job: HUD should immediately show the actual Job title, level and salary.
3. Trigger Job promotion/demotion if possible: salary shown in HUD should follow the new level.
4. Open Card hand and target picker: rectangular panels/cards should have rounded corners.
5. Hover/click target cards: rounded visual should follow hover fill and input must remain clickable.
6. Confirm the red PLAYTEST/debug footer is no longer visible at the bottom of normal gameplay.
7. Re-check the previously approved camera on rolls 5/6.
8. Re-check 0.1.64 Jail/Hospital release corridor and Job mid-roll continuation for regressions.

Manual status: PENDING RON ACCEPTANCE.
