# MeMeMe — Map District + Landmark Blueprint 44 Draft B4

Status: **CURRENT DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
- `docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`

All district names below are **working art-direction labels**, not final localization copy.

## Goal

Give each 11-space quarter a recognizable environmental identity while keeping the map one coherent stylized city.

The four outer corners remain the strongest orientation anchors:
- READY
- JAIL_GATE
- LOTTERY
- HOSPITAL_GATE

The inner `JAIL` and `HOSPITAL` locations should be visible landmarks without being mistaken for ordinary route spaces.

## Q1 — READY / Trung tâm & Sự nghiệp

Range:
`M01..M11`

Primary anchors:
- M01 READY Plaza
- M08 Job Hub
- approach toward M12 JAIL_GATE

Working environment:
- central plaza;
- office/service storefronts;
- transit and career signage;
- clean daytime city core.

Gameplay readability priorities:
1. READY must read immediately as home/start/lap anchor.
2. Job Hub needs a recognizable silhouette before M08.
3. M04/M10 LÁ BÀI and M06 TIN TỨC must remain readable against denser city scenery.

Transition:
Toward M10/M11, civic/police visual cues begin appearing before Jail Gate.

## Q2 — Đồn cảnh sát / Giải trí & Drama

Range:
`M12..M22`

Primary anchors:
- M12 JAIL_GATE
- inner JAIL / Police Station
- M17 Mini Game
- approach toward M23 LOTTERY

Working environment:
- civic/police frontage near the gate;
- gradually brighter entertainment signage;
- public squares / billboards / media screens;
- playful drama/social flavor.

Gameplay readability priorities:
1. M12 must read as a gate that sends the player inward, not as the Jail itself.
2. The inner Jail building must remain visually paired with M12.
3. M17 Mini Game should be the quarter's main party landmark.
4. M21 TIN TỨC and M22 LÁ BÀI must not disappear under Lottery buildup.

Transition:
M21/M22 introduces jackpot/signage language leading into M23.

## Q3 — Trúng số / Mua sắm & Đời sống

Range:
`M23..M33`

Primary anchors:
- M23 LOTTERY
- broad right-side city strip
- M34 HOSPITAL_GATE visible ahead

Working environment:
- shopping / commercial frontage;
- lifestyle signs and city-service props;
- jackpot/advertising motifs strongest near M23;
- medical/service cues begin appearing near M32/M33.

Gameplay readability priorities:
1. Lottery corner gets a strong unique jackpot silhouette.
2. M25 Money+ should not visually compete with Lottery's money fantasy.
3. M27/M32 LÁ BÀI and M28 TIN TỨC stay category-readable.
4. Hospital Gate should become recognizable before the player reaches M34.

Transition:
Near M32/M33, commercial scenery calms into medical/service architecture.

## Q4 — Bệnh viện / Đêm thành phố & Hồi vòng

Range:
`M34..M44`

Primary anchors:
- M34 HOSPITAL_GATE
- inner HOSPITAL
- M39 Mini Game
- M44/M01 READY return silhouette

Working environment:
- Hospital/service landmark near the opening of the quarter;
- evening/night-market lighting through the long return stretch;
- entertainment stage near M39;
- skyline and READY foreshadowing near M43/M44.

Gameplay readability priorities:
1. M34 must read as a gate, while the Hospital itself sits visibly inside the loop.
2. M39 Mini Game gives the late lap a second high-energy beat.
3. M43 TIN TỨC remains readable against richer late-lap lighting.
4. The player should feel the approach to READY before M01 is fully visible.

## Inner JAIL landmark

Location role:
- single off-loop Police/Jail destination;
- spatially associated with Q1/Q2 boundary;
- visible from nearby close-follow frames when practical.

Art needs:
- one building/location silhouette;
- dedicated token parking area;
- visible but compact release-roll presentation zone;
- no fake route nodes.

## Inner HOSPITAL landmark

Location role:
- single off-loop Hospital destination;
- spatially associated with Q3/Q4 boundary.

Art needs:
- one medical building/location silhouette;
- dedicated token parking area;
- release-roll presentation zone;
- no fake route nodes.

## Landmark priority

### L1 — global board anchors
- READY Plaza
- JAIL_GATE + paired inner Jail silhouette
- LOTTERY landmark
- HOSPITAL_GATE + paired inner Hospital silhouette

### L2 — quarter anchors
- Job Hub landmark at M08
- Mini Game landmark at M17
- Mini Game landmark at M39

### L3 — environmental anchors
- city skyline;
- shopping strip;
- public square;
- night market / return skyline.

Only one L1/L2 landmark should dominate a normal close-follow frame at once.

## Continuity rule

The city remains one world.

Keep consistent across all quarters:
- path/node construction language;
- scale of streets/buildings;
- token footprint;
- icon language;
- outline/material family.

Shift gradually:
- signage;
- props;
- architecture;
- lighting;
- background density.

No hard scene cuts at quarter boundaries during ordinary movement.

## HUD-safe landmark rule

Landmarks may extend toward screen corners, but critical gameplay information may not live there.

When a landmark conflicts with a player HUD:
- offset the camera target;
- crop decorative architecture first;
- preserve token + node + route cue.

## Current art-direction recommendation

For the first production mockup, favor a coherent stylized toy/collage city rather than photorealistic city blocks.

Why:
- easier to exaggerate the four corner landmarks;
- easier to preserve readable route/node icons;
- works naturally with MeMeMe's face/avatar/card comedy direction;
- lets Hospital/Jail/Job Hub/Mini Game landmarks be playful without breaking world cohesion.

This is an art-direction recommendation, not a locked final style.

## Still TBD

- final district names;
- final building designs;
- palette per quarter;
- exact landmark sprite dimensions;
- release return/re-entry node;
- successful release movement behavior.

## Next design pass

Recommended next pass: **Draft B5 camera shot + mockup production brief**.

B5 should identify the minimum concept/mockup images needed before runtime implementation:
- full overview;
- each of four corner landings;
- Jail interior-location framing;
- Hospital framing;
- M17 Mini Game framing;
- M39 Mini Game framing;
- normal mid-route close-follow frame with four HUD cards visible.
