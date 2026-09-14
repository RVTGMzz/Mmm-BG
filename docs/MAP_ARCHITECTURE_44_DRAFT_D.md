# MeMeMe — Final Map Architecture Draft D

Status: **CURRENT DESIGN DIRECTION / USER FEEDBACK LOCKED / RUNTIME PREVIEW NEXT**

Draft D follows Ron's 0.1.50 playtest feedback: the map logic works, but the route feels too linear, too evenly circular, too dense, and the default camera is too far away.

## Design goals locked from playtest

- Keep the readable 44-space main-loop foundation.
- Stop presenting the board as a neat oval/circle.
- Use an **asymmetric, winding city-party route** with visible changes of direction.
- Increase center-to-center spacing between route spaces so tokens/icons breathe.
- Avoid long uninterrupted rows of tightly packed spaces.
- Add **3 real route-decision branches** so the board does not feel like a single rail.
- Keep Jail and Hospital as their own approved special branches.
- Default gameplay camera must be much closer to the active player.
- Full-board view becomes an explicit overview mode, not the normal turn camera.
- Keep fixed four-corner player HUDs, but make them more compact so the board/action dominates the screen.

## Main-loop invariants retained

- 44 authoritative main-loop IDs `M01..M44`.
- `M01` READY.
- `M12` JAIL_GATE.
- `M23` LOTTERY, payout `D6 × 20 B$`.
- `M34` HOSPITAL_GATE.
- READY remains the lap crossing.
- TIN TỨC / LÁ BÀI naming remains locked.

## Special branches retained

### Jail

`M12 -> JAIL`

Release roll succeeds on:
`1 / 3 / 5`

Exit geometry remains exactly:
`JAIL -> J1 -> J2 -> J3 -> M13`

### Hospital

`M34 -> HOSPITAL`

Release roll succeeds on exactly:
`2 / 4 / 5`

Exit geometry remains exactly:
`HOSPITAL -> H1 -> H2 -> H3 -> M35`

The exact authoritative same-turn behavior after release remains a separate rule decision.

## Three route-decision branches

Draft D introduces three normal map route decisions in addition to Jail/Hospital.

Working junctions:

### Branch A
- decision after `M04`
- main path reaches `M08` through `M05 -> M06 -> M07`
- alternate path reaches `M08` through `A1 -> A2 -> A3`

### Branch B
- decision after `M17`
- main path reaches `M21` through `M18 -> M19 -> M20`
- alternate path reaches `M21` through `B1 -> B2 -> B3`

### Branch C
- decision after `M35`
- main path reaches `M39` through `M36 -> M37 -> M38`
- alternate path reaches `M39` through `C1 -> C2 -> C3`

Each alternate route has the **same step count** as the corresponding main segment in the first preview. This deliberately avoids locking shortcut/risk balance before playtest.

For the preview, alternate nodes should mirror the skipped segment's broad content density so choosing a route tests navigation and feel rather than secretly changing the economy.

## Spatial rule

Target route spacing:
- ordinary adjacent spaces should generally read around 1.2–1.35× farther apart than 0.1.50;
- avoid more than 4–6 spaces reading as one long straight row;
- use bends, diagonals and district landmarks to break rhythm;
- branch corridors need visible separation from the main route so the choice is obvious when camera zooms out slightly.

Coordinates remain design/runtime-preview coordinates, not final art pixels.

## Board silhouette

Draft D must **not** read as a circle or oval.

Preferred silhouette:
- broad lower route;
- right-side climb;
- middle route cutting back through the city;
- upper route bending across districts;
- interior descents/rejoins;
- three optional branch corridors visible as genuine alternatives.

The board may still form one lap logically, but visually it should feel like travelling through a city rather than orbiting a ring.

## Route-choice interaction

0.1.51 preview should pause at a route junction and let the active player choose between the two visible paths.

Preview requirement:
- show enough of both alternatives at the decision moment;
- do not auto-pick solely from die parity;
- clearly indicate rejoin direction;
- after choice, camera returns to close-follow movement.

This is preview interaction only until integrated with HOST-authoritative command/replay rules.

## Visual references

Canonical combined map/HUD visual reference remains:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Additional visual lessons approved from Ron's 2026-09-15 references:
- learn route branching and irregularity from dense party-board examples;
- **do not** copy their extreme node density;
- learn the close, action-first camera/HUD feeling from classic party-board framing;
- keep MeMeMe's own bright city identity.

## Supersession

Draft D supersedes Draft C for:
- route silhouette;
- ordinary route spacing;
- normal route branching;
- default camera distance;
- HUD compactness.

Draft C remains the source for:
- 44 main-space identities;
- four anchor identities;
- Jail/Hospital topology and release faces;
- Lottery multiplier;
- current TIN TỨC / LÁ BÀI vocabulary.

## Runtime target

Next preview milestone: **MVP 0.1.51 — Branching Map + Close Camera Preview**.

0.1.50 remains available as the comparison build.
Do not merge PR #1.