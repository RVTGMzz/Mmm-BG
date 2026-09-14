# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

0.1.48 is runtime **PASS** by Ron's explicit acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 has no validated playable package yet.

## Track A — 0.1.49

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

First evidenced effect inventory:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

Do not invent missing legacy card text or silently restore old system names.

## Track B — final map design

Working Draft A: **48 playable nodes = 40 main + 4 Hospital + 4 Jail**.

Current map documents, in order:
1. `docs/MAP_ARCHITECTURE_FINAL.md`
2. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
3. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
4. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`
5. `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`
6. `docs/MAP_ROUTE_OVERVIEW_48_DRAFT_A3.md`
7. `docs/MAP_CONTENT_PACING_48_DRAFT_A4.md`
8. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.md`
9. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_48_DRAFT_A5.json`

### A1 complete
Irregular city-loop layout, 48 design-space coordinates, district/landmark anchors, close-follow camera framing and HUD-safe composition.

### A2 complete
V0–V3 node hierarchy, main/branch route hierarchy, district art priorities, landmark tiers, token readability and overview visual language.

### A3 complete
Route sign language, district transitions, standard camera shot list, explicit overview behavior and four-player overview markers.

### A4 approved
Approved affected nodes:
- `M18` = Mini Game
- `M21` = Money -
- `M31` = Normal
- `M38` = Mini Game
- `M40` = TIN TỨC

Mini Game spacing is exactly **20 / 20**.

TIN TỨC positions are `M06, M14, M19, M25, M33, M40`, with clockwise gaps `8, 5, 6, 8, 7, 6`.

Category totals remain unchanged. Architecture JSON and A1/A2/A3 are synchronized to the approved assignment.

### A5 complete
District/landmark blueprint is now recorded in both prose and data form.

Working identities:
- D1: READY Plaza / city center
- D2: Job Hub Tower + Hospital area
- D3: Entertainment Dome / Mini Game M18
- D4: Civic/Jail Complex + Civic Square
- D5: Night Market Skyline / Mini Game M38 / READY return cue

A5 also defines landmark tiers, district transitions, HUD-safe composition and concept-art handoff targets.

40 main spaces still estimate to about **11.9 D6 rolls/player** per lap. Keep this for the first final-map runtime test.

Compact fallback if future runtime playtest says 40 main nodes is too long:
- **44 total = 36 main + 4 Hospital + 4 Jail**.

The fallback is not active.

## Final HUD / camera locks

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$.
- Active player is highlighted.
- Normal gameplay camera follows/zooms to active token.
- Full-map is explicit overview only.
- `docs/UI_FINAL_PLAYER_HUD.md` is the UI contract.

## Runtime boundary

Map Draft A through A5 are design-only. Current validated runtime remains 0.1.48.

Do not import the final-map graph/coordinates/pacing/landmark blueprint into runtime until its own implementation milestone is explicitly opened and validated.

## Next direction

Continue 0.1.49 audit in parallel. The next map pass may be **A6 art/mockup production brief** based on A5, or the design lane may pause for visual review.

Keep Hospital/Jail deeper gameplay rules TBD until explicitly approved.
