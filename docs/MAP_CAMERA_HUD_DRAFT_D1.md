# MeMeMe — Draft D1 Camera + HUD Contract

Status: **CURRENT VISUAL/INTERACTION DIRECTION / PREVIEW TARGET**

This document turns Ron's 0.1.50 playtest feedback into a concrete camera/HUD contract for 0.1.51.

## Default gameplay camera

Normal turns must no longer show most of the board.

Target feeling:
- active token is the visual center of the turn;
- nearby route, 3–6 surrounding spaces, landmark context and immediate branch direction are readable;
- the player feels present on the board rather than looking at a map from the sky.

Working preview zoom target:
- normal follow: roughly `1.30–1.45×` relative to 0.1.50's default 1.0 view;
- movement keeps the token near the center with smooth camera pan/follow;
- no aggressive camera snapping.

## Branch decision framing

When the active token reaches one of Draft D's three junctions:
1. movement pauses before selecting the next edge;
2. camera eases outward slightly, around `1.05–1.15×` preview zoom;
3. both alternatives and their first 2–3 spaces should be visible;
4. two clear route-choice buttons appear;
5. after selection, camera eases back to close follow and movement continues.

The choice UI must not cover either route.

## Overview mode

Full board is explicit only.

- keep an `OVERVIEW` control;
- zoom out far enough to understand the whole topology;
- return automatically or by control to the active player;
- overview is informational and does not move the authoritative token.

## Four-corner HUD

Retain the approved screen anchors:
- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right

But 0.1.50 HUD cards are too large for the closer camera.

0.1.51 target:
- reduce card footprint by roughly 20–30%;
- avatar + name + B$ are mandatory;
- lap/status become compact secondary copy/icon;
- active player gets strong highlight;
- inactive players stay readable but visually quieter;
- HUD stays screen-space and never scales with world camera.

## Action-first composition

Learn from classic party-board framing:
- board action owns the center;
- player HUDs live at the perimeter;
- dice/result/choice feedback gets a compact top-center or bottom-center treatment;
- avoid a giant permanent control panel;
- keep the route visible during most feedback animations.

## Readability constraints

- avoid HUD covering a branch junction;
- camera framing may bias slightly away from the nearest HUD corner when a token is near the viewport edge;
- special buildings can receive short dedicated pans;
- branch lines should be visibly distinct but not louder than tokens;
- route spaces do not need to be perfect circles in final art. Runtime preview circles may remain temporary hit/readability markers.

## 0.1.51 acceptance targets

Ron should be able to judge:
- whether close zoom feels more like a party game;
- whether 3 route junctions make movement less linear;
- whether route spacing is comfortable;
- whether HUDs stop dominating the screen;
- whether branch-choice framing is immediately understandable;
- whether overview remains sufficient for orientation.

This contract does not change HOST authority, replay or checksum rules by itself.