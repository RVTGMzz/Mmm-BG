# MeMeMe — Draft D1 Camera + HUD Contract

Status: **CURRENT CANONICAL VISUAL/INTERACTION DIRECTION / REQUIRED BY 0.1.56.1**

This document originated from Ron's 0.1.50 playtest feedback and is now a required contract for canonical `START_PLAYTEST.bat` presentation after the 0.1.56 manual UI review.

Related audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

## Default gameplay camera

Normal turns must **not** show most or all of the board.

Target feeling:
- active token is the visual center of the turn;
- nearby route, roughly 3–6 surrounding spaces, landmark context and immediate branch direction are readable;
- the player feels present on the board rather than looking at a debug map from the sky.

Working target:
- normal follow should feel around the close preview range previously demonstrated in Draft D;
- movement keeps the token near the center with smooth camera pan/follow;
- no aggressive camera snapping;
- exact zoom value may be tuned in manual playtest rather than treated as a gameplay rule.

## Branch decision framing

When the active token reaches one of Draft D's three junctions:
1. movement pauses before selecting the next edge;
2. camera eases outward slightly;
3. both alternatives and their first 2–3 spaces should be visible;
4. two clear route-choice surfaces appear;
5. route flavor remains readable: PHỐ CHÍNH / AN TOÀN / DRAMA / TIỀN;
6. after selection, camera eases back to close follow and movement continues.

The choice UI must not cover either route.

## Overview mode

Full board is explicit only.

- keep an `OVERVIEW` control;
- zoom out far enough to understand the whole topology;
- return automatically or by control to the active player;
- overview is informational and does not move the authoritative token;
- overview must never become the default camera just because Draft D has 44 spaces.

## Four-corner HUD

Locked screen anchors:
- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right

Target:
- compact footprint;
- avatar + name + B$ mandatory;
- hand/job/lap/status can be compact secondary copy/icons;
- active player gets strong highlight;
- inactive players stay readable but visually quieter;
- HUD stays screen-space and never scales with world camera.

## Action-first composition

Learn from classic party-board framing without copying another game's art:
- board action owns the center;
- player HUDs live at the perimeter;
- dice/result/choice feedback gets a compact top-center or bottom-center treatment;
- avoid a giant permanent control panel;
- keep route/token context visible during most feedback animations.

## Readability constraints

- avoid HUD covering a branch junction;
- camera framing may bias slightly away from the nearest HUD corner when a token is near the viewport edge;
- Jail/Hospital can receive short dedicated pans after their authoritative holding state exists;
- branch lines should be visibly distinct but not louder than tokens;
- route spaces do not need to be perfect circles;
- current standard runtime's giant 34px circles are not a final visual requirement;
- greybox markers should be sized for the close camera, not for a forced full-board view.

## Runtime architecture rule after 0.1.56 review

The good camera/HUD behavior must not live only inside preview scenes.

`FinalMapPreviewScene052` is an implementation reference because it already demonstrates:
- large world bounds;
- separate world and UI cameras;
- fixed HUD;
- close focus;
- overview mode.

However, canonical gameplay must **not** duplicate the preview's local gameplay model. Extract/reuse presentation techniques while keeping the authoritative HOST/match/session stack as the only gameplay source of truth.

## Acceptance targets for 0.1.56.1

Ron should be able to confirm:
- `START_PLAYTEST.bat` looks more complete than the QA preview, not less;
- close zoom feels like a party game;
- 3 route junctions are readable without full-map view;
- four-corner HUDs stay fixed and readable;
- branch-choice framing is immediate;
- overview is available but never the default;
- Draft D spaces no longer visually bunch together in normal play;
- event/card surfaces preserve board context;
- no gameplay authority/regression changes were introduced by camera/HUD work.

This contract changes presentation only. HOST authority, replay/checksum and gameplay rules remain separate.
