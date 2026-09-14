# MeMeMe — Map Spatial Layout 48 Draft A1

Status: **ACTIVE DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Architecture source:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

Spatial data:
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`

## Purpose

Draft A already defines the 48-node topology. Draft A1 adds the next design layer:

- an irregular city-shaped loop instead of a perfect circle;
- logical world-space coordinates for all 48 nodes;
- landmark anchors for close-camera orientation;
- district framing guidance;
- Hospital/Jail branch geometry;
- camera context rules compatible with the four fixed corner HUDs.

These coordinates are **design coordinates only**. They are not final runtime pixels and must not become authority/gameplay state.

## Overall silhouette

The board reads as one large clockwise city journey with five visual districts:

1. **D1 — Trung tâm / READY** climbs the west side from READY.
2. **D2 — Sự nghiệp & Dịch vụ** crosses the upper city and contains Job Hub plus the Hospital pocket.
3. **D3 — Giải trí & Xã hội** pushes toward the brighter east entertainment district.
4. **D4 — Drama & Dân sự** descends through the civic side and contains the Jail pocket.
5. **D5 — Đêm thành phố / Hồi vòng** becomes a long lower return route back toward READY.

The loop is intentionally asymmetrical. Final art should feel like a city route, not a board printed as a perfect ring.

## Spatial scale

Draft design canvas:

- width: `4000` world-design units;
- height: `2400` world-design units;
- normal main-path spacing: roughly `150–245` units;
- side-branch spacing: roughly `160–210` units.

The average main-loop step is around `208` design units. The purpose is to keep 1–2 nearby spaces readable under a close-follow camera while leaving enough breathing room for token separation and landmark art.

## District framing

### D1 — Trung tâm / READY

Route: `M01..M08`

Primary landmark: **READY Plaza**.

Camera intent:
- READY remains visually obvious whenever the player is near the lap start/end;
- the route climbs away from the plaza so the player feels they are leaving the starting district;
- avoid placing critical path labels under the top-left or bottom-left HUD corners.

### D2 — Sự nghiệp & Dịch vụ

Route: `M09..M16`

Primary landmark: **Job Hub Tower**.
Secondary landmark: **Hospital Complex**.

Camera intent:
- Job Hub should have a strong silhouette before the player reaches M11;
- Hospital must look like a separate side pocket, not a continuation of the main road;
- M12 and M13 remain visibly connected by the ordinary main route while the Hospital detour peels inward.

### D3 — Giải trí & Xã hội

Route: `M17..M24`

Primary landmark: **Entertainment Dome / Mini Game district**.

Camera intent:
- brighter/sign-heavy environment language can identify this district;
- M21 Mini Game should read as a destination landmark at close range;
- the route bends around the east side so movement feels like entering a distinct entertainment quarter.

### D4 — Drama & Dân sự

Route: `M25..M32`

Primary landmark: **Civic / Jail Complex**.
Secondary anchor: **East Mini Game Stage** near M31.

Camera intent:
- Jail branch should visibly peel inward from the M28/M29 segment;
- its return path must not visually imply a shortcut;
- M31 retains a separate secondary landmark so Jail does not dominate the whole district identity.

### D5 — Đêm thành phố / Hồi vòng

Route: `M33..M40`

Primary landmark: **Night Market / Skyline return strip**.

Camera intent:
- long lower route gives the player a sense of approaching the end of the lap;
- environmental cues should gradually point back toward READY;
- full READY should not need to be visible yet for the player to understand direction.

## Hospital branch spatial pocket

Topology remains:

`M12 -> H1 -> H2 -> H3 -> H4 -> M13`

Draft A1 places the four Hospital nodes below/inward from the D2 main route.

Design goals:
- branch has a clearly visible entrance and return direction;
- all four internal nodes fit into one recognizable Hospital location pocket;
- camera can follow movement through the pocket without changing zoom language dramatically;
- multiple player tokens can occupy different internal nodes without visually stacking into one marker.

Still undefined:
- what causes entry;
- whether entry is mandatory;
- fees;
- skipped turns;
- recovery;
- exit rules.

## Jail branch spatial pocket

Topology remains:

`M28 -> J1 -> J2 -> J3 -> J4 -> M29`

Draft A1 places the Jail pocket inward/left of the D4 outer road.

Design goals:
- branch visually reads as a contained civic location;
- M28/M29 remain readable as main-route anchors;
- branch geometry cannot be mistaken for a faster route;
- camera can frame Jail as a distinct location while preserving nearby route context.

Still undefined:
- what causes entry;
- bail;
- escape roll/card;
- skipped turns;
- stay length;
- exit semantics.

## Camera contract for the map

The board camera stays presentation-only.

### Turn focus
- transition to the active token;
- frame enough context to recognize district + nearby path;
- suggested design context radius: about `520` world units.

### Movement
- follow token smoothly;
- bias composition slightly toward the next 1–2 path nodes;
- suggested context radius: about `560` units.

### Landing
- settle closer on token + destination tile;
- keep at least one legal continuation visible when practical;
- suggested context radius: about `430` units.

### Hospital/Jail branch
- use same general camera language as normal movement;
- allow a slightly wider frame to reveal the branch pocket;
- suggested context radius: about `470` units.

### Overview
- explicit command / board intro only;
- fit complete topology;
- never required for ordinary turn comprehension.

Exact runtime zoom values remain TBD and should be tuned against actual art/resolution later.

## HUD-safe composition

HUD remains fixed in screen space:

- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right.

Therefore final environment composition should reserve the center of the gameplay frame for:

- active token;
- destination node;
- branch arrows / route continuation;
- temporary landing/event presentation.

Decorative landmarks may extend toward corners, but critical route information must not depend on those corner areas being unobstructed.

## Landmark lifecycle

The working landmarks in A1 are **orientation anchors**, not gameplay systems:

- READY Plaza;
- Job Hub Tower;
- Hospital Complex;
- Entertainment Dome;
- Civic/Jail Complex;
- East Mini Game Stage;
- Night Market / Skyline.

Their names/art can change later without changing node IDs or topology.

## Data boundary

`MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json` contains only design-space positions and camera/art guidance.

Do not import it into runtime until:

1. Draft A 48-node architecture is approved;
2. branch semantics are defined;
3. the final-map implementation milestone is explicitly opened;
4. multiplayer authority/replay regressions are planned;
5. actual camera/HUD implementation is ready to consume art-space coordinates safely.

## Next design pass

After A1, the next useful map pass is **A2 visual hierarchy**:

- exact visual size class for normal/special/branch nodes;
- route line styling and branch-entry sign language;
- district palette/material direction;
- landmark scale priorities;
- minimap/overview representation;
- camera transition notes between district boundaries.

This remains a design lane parallel to MVP 0.1.49.
