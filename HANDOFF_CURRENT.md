# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / DESIGN + CONTENT AUDIT / NO NEW PLAYABLE ARTIFACT YET**

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 has no validated playable artifact yet.

## Read first

1. `docs/LATEST_HANDOFF.md`
2. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
3. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
4. `docs/MAP_ARCHITECTURE_FINAL.md`
5. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
6. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
7. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`
8. `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`
9. `docs/MAP_ROUTE_OVERVIEW_48_DRAFT_A3.md`
10. `docs/MAP_CONTENT_PACING_48_DRAFT_A4.md`
11. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.md`
12. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.json`
13. `docs/UI_FINAL_PLAYER_HUD.md`

## Track A — 0.1.49 Legacy Effect Audit

Current names remain locked:
- **TIN TỨC**
- **LÁ BÀI**

The first evidenced effect-family inventory is complete in `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`.

Current adaptable directions:
- authoritative movement effects;
- held-card delivery model;
- explicit timing metadata;
- timed global effects once an authoritative duration/status layer exists.

Undefined-system effects stay deferred. Do not invent missing legacy card text.

## Track B — Final map design

Working Draft A currently uses **48 total playable nodes**:
- 40 main-loop nodes `M01..M40`;
- 4 Hospital nodes `H1..H4`;
- 4 Jail nodes `J1..J4`.

This is design work only, not runtime content.

### Draft A — architecture
- five working districts;
- Hospital and Jail are side-location pockets;
- stable node IDs and adjacency are data-driven;
- canonical lap crossing remains `M40 -> M01`.

### Draft A1 — spatial layout
Completed in:
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`

Adds irregular city-loop composition, design coordinates, landmarks, district framing, close-follow camera context and HUD-safe composition.

### Draft A2 — visual hierarchy
Completed in `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`.

Adds node size classes, main/branch hierarchy, district art priorities, landmark tiers, token readability and overview/minimap visual language.

### Draft A3 — route + overview
Completed in `docs/MAP_ROUTE_OVERVIEW_48_DRAFT_A3.md`.

Adds main/branch sign language, district boundary cues, camera shot list, four-player overview behavior and explicit full-map overview.

### Draft A4 — content pacing
Completed and approved in `docs/MAP_CONTENT_PACING_48_DRAFT_A4.md`.

Approved pacing assignments:
- `M18` = Mini Game
- `M21` = Money -
- `M31` = Normal
- `M38` = Mini Game
- `M40` = TIN TỨC

Mini Game spacing is exactly **20 / 20** around the 40-node main loop.

TIN TỨC is now:
`M06, M14, M19, M25, M33, M40`
with clockwise gaps `8, 5, 6, 8, 7, 6`.

LÁ BÀI remains:
`M04, M09, M16, M22, M27, M35, M39`.

Category totals remain unchanged.

### Draft A5 — district / landmark blueprint
Completed in:
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.md`
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.json`

A5 locks the working local visual identity used by the close-follow camera:
- D1: READY Plaza / city center;
- D2: Job Hub Tower + Hospital area;
- D3: Entertainment Dome around Mini Game M18;
- D4: Civic/Jail Complex + Civic Square;
- D5: Night Market Skyline + Mini Game M38 stage + READY return cue.

A5 also defines district transitions, landmark priority tiers, HUD-safe landmark composition and concept-art handoff targets.

A compact fallback remains available only if future runtime playtesting proves 40 main nodes too slow:
- 44 total = 36 main + 4 Hospital + 4 Jail.

It is not active. Draft A remains 48 total / 40 main.

## Final HUD / camera locks

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum per occupied HUD;
- active player highlighted;
- HUD fixed in screen space;
- normal camera follows/zooms active token;
- full-map is explicit overview only.

Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.

## Runtime boundary

Draft A through A5 are documentation/design only.

Do not move the 48-node graph, coordinates, pacing or landmark blueprint into `src/content/city/board_city_mvp.json` until a dedicated final-map implementation milestone is explicitly opened and validated.

## Next priority

1. Continue 0.1.49 effect audit without inventing missing legacy source material.
2. Next map pass can be **A6 art/mockup production brief** based on A5, or pause the design lane for visual review.
3. Keep Hospital/Jail deeper gameplay semantics TBD until explicitly approved.
4. Keep TIN TỨC / LÁ BÀI names.
5. Do not merge PR #1.
