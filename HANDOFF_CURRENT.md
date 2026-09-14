# MeMeMe — HANDOFF CURRENT

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

## Read in this order

1. `HANDOFF_CURRENT.md`
2. `docs/LATEST_HANDOFF.md`
3. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
4. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`
5. `docs/MAP_ARCHITECTURE_FINAL.md`
6. `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
7. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
8. `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`
9. `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`
10. `docs/UI_FINAL_PLAYER_HUD.md`
11. `docs/GAME_DESIGN_CURRENT.md`

## Track A — 0.1.49 Legacy Effect Audit

The first structured effect-family inventory is in `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`.

Current names remain locked:
- **TIN TỨC**
- **LÁ BÀI**

The audit only uses legacy ideas that still have evidence in the repo. Missing old-card text must not be reconstructed from guesswork.

Current adaptable directions:
- authoritative movement effects;
- held-card delivery model;
- explicit timing metadata;
- timed global effects once an authoritative duration/status layer exists.

Undefined-system effects stay deferred until their systems are designed.

## Track B — Final 48-space map design

Working Draft A selects:
- **48 total playable nodes**;
- **40 main-loop nodes** `M01..M40`;
- **4 Hospital nodes** `H1..H4`;
- **4 Jail nodes** `J1..J4`.

Architecture sources:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`

### Draft A1 — spatial layout completed

Files:
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`

A1 adds:
- irregular clockwise city-loop composition;
- design-space coordinates for all 48 nodes;
- district framing anchors;
- landmark anchors;
- close-follow camera context;
- Hospital/Jail detour-pocket geometry;
- HUD-safe composition guidance.

A1 coordinates are design anchors only, not runtime pixels.

### Draft A2 — visual hierarchy completed

File:
`docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`

A2 adds:
- V0/V1/V2/V3 node importance classes;
- main-route versus side-branch hierarchy;
- district art-direction priorities;
- landmark priority tiers;
- token readability rules;
- simplified overview/minimap language;
- camera-transition guidance.

Next map pass: **A3 route/overview prototype spec**.

Hospital/Jail remain topology/location concepts only. Their deeper gameplay semantics are still TBD and must not be inferred from the map geometry.

## Final HUD / camera direction

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- each occupied HUD shows at least avatar, player name and B$;
- active player gets clear visual emphasis;
- HUD stays fixed in screen space;
- normal board camera follows/zooms to the active token;
- full-map view is explicit overview mode only.

Canonical UI contract: `docs/UI_FINAL_PLAYER_HUD.md`.

## Runtime boundary

Draft A/A1/A2 are documentation/design only.

Do not move the 48-node graph or design coordinates into runtime board data until a dedicated implementation milestone is explicitly opened and validated.

The current validated runtime remains 0.1.48.

## Next priority

1. Continue the 0.1.49 effect audit without inventing missing source material.
2. Continue final-map design with A3 route/overview prototype spec.
3. Keep the current names TIN TỨC / LÁ BÀI.
4. Keep Hospital/Jail deeper gameplay rules TBD until explicitly approved.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core của repo ronvotri/MeMeMe-BoardGame. 0.1.48 đã PASS runtime; latest validated playable artifact vẫn là mememe-playtest-0.1.48 run #1441 SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Current milestone 0.1.49 đã có legacy effect inventory, giữ tên TIN TỨC / LÁ BÀI. Map Draft A = 48 nodes đã có architecture, spatial Draft A1 và visual hierarchy Draft A2 trong docs; bước kế là A3 route/overview prototype spec. Hospital/Jail vẫn topology-only về gameplay. Final camera close-follow, 4 HUD cố định 4 góc. Không merge PR #1.`
