# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit**

Status: **ACTIVE / FIRST INVENTORY BUILT / NO NEW PLAYABLE ARTIFACT YET**

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

0.1.49 is not yet a validated playable checkpoint.

## Read first

1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
3. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
4. `docs/MAP_ARCHITECTURE_FINAL.md`
5. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
6. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
7. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`
8. `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`
9. `docs/UI_FINAL_PLAYER_HUD.md`
10. `docs/GAME_DESIGN_CURRENT.md`

## Track A — 0.1.49 Legacy Effect Audit

First-pass effect-family inventory exists in `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`.

Current names remain locked:
- **TIN TỨC**
- **LÁ BÀI**

Safe/adaptable directions so far:
- authoritative movement effects;
- held-card delivery model;
- explicit timing metadata;
- timed global TIN TỨC effects once a deterministic duration layer exists.

Undefined-system effects remain deferred. Do not reconstruct missing legacy cards from memory or invent new old-card text.

## Track B — final map design

Working Draft A selects **48 playable nodes**:
- 40 main loop;
- 4 Hospital branch nodes;
- 4 Jail branch nodes.

Architecture:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

### Spatial Draft A1 — completed

Files:
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`

A1 adds:
- irregular clockwise city-loop composition;
- logical design-space coordinates for all 48 nodes;
- district and landmark anchors;
- close-follow camera framing guidance;
- Hospital/Jail detour-pocket geometry;
- HUD-safe composition guidance.

Coordinates are design anchors only, not runtime pixels.

### Visual Draft A2 — completed

File:
`docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`

A2 adds:
- V0/V1/V2/V3 node importance classes;
- main-route vs side-branch visual hierarchy;
- district art-direction hierarchy;
- landmark priority tiers;
- token readability rules;
- simplified overview/minimap language;
- camera-transition guidance.

Next map pass: **A3 route/overview prototype spec**.

## Final HUD / camera locks

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$.
- Active player is clearly highlighted.
- Normal gameplay camera zooms/follows active player.
- Full-map is an explicit overview, not permanent play view.
- Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.

## Runtime boundary

Draft A/A1/A2 are design only. Do not copy the 48-node graph or coordinates into runtime board data yet.

The current validated runtime remains 0.1.48 until a dedicated later implementation milestone is opened and validated.

## Next priority

1. Continue 0.1.49 effect audit without inventing missing legacy cards.
2. Continue map design with A3 route/overview prototype spec.
3. Keep Hospital/Jail deep mechanics explicitly undefined until approved.
4. Keep TIN TỨC / LÁ BÀI names.
5. Do not merge PR #1.
