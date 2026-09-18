# MeMeMe Playtest 0.1.53 — Left/Right Branching + True Full Map

## What changed

- Junction choices now read **RẼ TRÁI / RẼ PHẢI** instead of Main/Branch.
- All three junctions are forward-only and rejoin ahead of the player.
- Both choices currently take the same 4 movement steps to rejoin, so the route choice changes content/exposure without creating a distance exploit.
- No branch can loop backward or trap the player.
- Dedicated full-map review now uses `finalmap=4` and fits the whole Draft D board into one viewport with no gameplay HUD.

## Launch

### Gameplay preview
Run:

`START_DRAFT_D_PREVIEW.bat`

Check:
- each junction pauses for left/right choice;
- both choices visibly diverge;
- both choices merge back ahead;
- movement continues toward READY;
- no branch causes an endless loop.

### Full-map review
Run:

`START_DRAFT_D_FULL_MAP.bat`

Expected:
- entire board visible at once;
- all three branch corridors and rejoin points visible;
- no player HUD or dice controls covering the map;
- this view is for topology review, not gameplay.

## Retained rules

- READY remains lap crossing.
- Jail release: 1 / 3 / 5.
- Hospital release: exactly 2 / 4 / 5.
- Lottery: D6 × 20 B$.
- Jail/Hospital still use their separate three-space exit routes.

## Feedback wanted

1. Are left/right choices visually obvious enough?
2. Do branches feel different without feeling like detours that waste time?
3. Does the full-map view show enough of the board to review topology comfortably?
4. Are any rejoin points confusing?
