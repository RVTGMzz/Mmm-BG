# MeMeMe Draft D — Playtest Feedback from 0.1.51

Status: **ACCEPTED FEEDBACK / FIX TARGET 0.1.52**

## What worked
- Draft D direction is better than the earlier circular/oval map.
- Wider spacing and visible branch lanes are moving in the right direction.
- The user still wants the board to remain readable rather than become as dense as the Mario Party reference.

## Blocking runtime bug found
On the first 0.1.51 playtest, the game appeared frozen immediately after loading:
- player tokens rendered;
- world camera rendered at the closer zoom;
- the HUD and the Roll Dice controls were no longer visible/clickable in the expected viewport;
- therefore the player could not roll or continue.

Root cause: 0.1.51 placed HUD/controls on the same zoomed world camera with `setScrollFactor(0)`. Scroll factor prevented world scrolling but did not isolate screen UI from camera zoom. The world zoom pushed/scaled the HUD and controls out of the visible viewport.

## Approved 0.1.52 fix
- Use a dedicated UI camera at zoom `1.0`.
- World camera ignores the UI layer.
- UI camera ignores the board/world objects.
- Four corner HUDs, Roll Dice, route-choice popup, toast and overview controls stay screen-space regardless of world-camera zoom.

## Camera feedback
0.1.51 was still farther away than desired.

0.1.52 working target:
- normal active-player follow: `1.70x`;
- branch decision framing: `1.25x`;
- full-map review: `0.50x`.

The desired feel is closer to a party-board game turn camera: current local area dominates the screen; full map is not the default view.

## Full-map review feedback
The full-map test must always show the newest Draft D topology for easy review.

0.1.52 behavior:
- `FULL MAP` is a persistent toggle, not a temporary two-second zoom-out;
- it stays on the Draft D board until the user presses `TRỞ LẠI LƯỢT`;
- a dedicated launcher opens directly into persistent Draft D full-map mode.

Launcher:
- `START_DRAFT_D_FULL_MAP.bat`

## Design direction retained
- 44 main-loop spaces remain the current baseline.
- 3 decision junctions remain part of Draft D.
- Keep the board asymmetric and avoid a simple circular loop.
- Keep spaces visually separated and avoid dense rows of touching spaces.
- Keep Jail/Hospital special routes and locked rules unchanged.
- Do not merge PR #1.
