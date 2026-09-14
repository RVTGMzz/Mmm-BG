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
11. `docs/UI_FINAL_PLAYER_HUD.md`

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

Adds:
- main-route and side-route sign language;
- five district boundary cues;
- camera shot list for turn handoff, movement, landing, special locations and overview;
- four-player overview marker behavior;
- explicit full-map overview without making it permanent HUD.

### Draft A4 — content pacing audit
Completed in `docs/MAP_CONTENT_PACING_48_DRAFT_A4.md`.

Key finding:
- 40 main-loop spaces require about **11.9 D6 rolls/player** on average to reach/cross one lap;
- overall content density is healthy;
- TIN TỨC, LÁ BÀI and money distribution are well spread;
- Job Hub at M11 is a good early-lap position;
- current Mini Game placement M21/M31 is uneven at a 10/30 split.

A4 proposes a balanced test candidate:
- Mini Game at `M18` and `M38`;
- move M18's Money - role to M21;
- move M38's TIN TỨC role to M31;
- category counts stay unchanged.

This is only a proposal and has **not** changed architecture JSON or runtime.

A4 also preserves a compact fallback if 40 main nodes later play too long:
- **44 total = 36 main + 4 Hospital + 4 Jail**.

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

Draft A through A4 are documentation/design only.

Do not move the 48-node graph, coordinates or pacing proposals into `src/content/city/board_city_mvp.json` until a dedicated final-map implementation milestone is explicitly opened and validated.

## Next priority

1. Decide whether to keep Mini Games at M21/M31 or test the balanced M18/M38 A4 candidate.
2. Continue 0.1.49 effect audit without inventing missing legacy source material.
3. Keep Hospital/Jail deeper gameplay semantics TBD until explicitly approved.
4. Keep TIN TỨC / LÁ BÀI names.
5. Do not merge PR #1.
