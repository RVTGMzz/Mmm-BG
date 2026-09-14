# MeMeMe — PLAYTEST 0.1.52 Draft D UI Fix

Status: **RUNTIME PREVIEW CANDIDATE / USER PLAYTEST REQUIRED**

## What changed from 0.1.51
- Fixed the apparent freeze caused by HUD/controls being pushed out of view by world-camera zoom.
- Added a dedicated UI camera so HUD and controls stay fixed on screen.
- Increased normal gameplay camera zoom from `1.38x` to `1.70x`.
- Branch-decision framing uses `1.25x`.
- Full-map review uses the current Draft D topology at `0.50x`.
- FULL MAP is now persistent until the user presses `TRỞ LẠI LƯỢT`.
- Added a dedicated full-map review launcher.

## Launch gameplay preview
Run:
- `START_DRAFT_D_PREVIEW.bat`

Expected URL:
- `?finalmap=3`

Check:
1. P1/P2/P3/P4 HUDs remain visible in the four corners.
2. `ĐỔ XÚC XẮC` remains visible and clickable at bottom center.
3. Camera is materially closer to the active player than 0.1.51.
4. At one of the three branch junctions, route-choice buttons are visible and clickable.
5. Choosing either route continues movement.
6. Jail/Hospital/Lottery behavior remains unchanged.

## Launch persistent full-map review
Run:
- `START_DRAFT_D_FULL_MAP.bat`

Expected URL:
- `?finalmap=3&overview=1`

Check:
1. The full map is the newest Draft D topology, including all 3 branch junctions.
2. Full-map view stays open instead of automatically returning after a timer.
3. Press `TRỞ LẠI LƯỢT` to return to the close player camera.

## What to report
Please send a screenshot or short clip if any of these occur:
- HUD or Roll Dice disappears;
- click/touch cannot activate Roll Dice;
- route-choice popup cannot be clicked;
- full-map view is clipped;
- camera is still too far or now too close;
- spaces overlap or branch paths are visually confusing.

## Safety boundary
This remains a map/camera/UI preview. It does not replace the validated 0.1.48 HOST-authoritative gameplay runtime.
