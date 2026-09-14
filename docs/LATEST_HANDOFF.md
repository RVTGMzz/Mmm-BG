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

### A1 complete
Irregular city-loop layout, 48 design-space coordinates, district/landmark anchors, close-follow camera framing and HUD-safe composition.

### A2 complete
V0–V3 node hierarchy, main/branch route hierarchy, district art priorities, landmark tiers, token readability and overview visual language.

### A3 complete
Route sign language, district transitions, standard camera shot list, explicit overview behavior and four-player overview markers.

### A4 complete
Pacing audit found:
- 40 main spaces ≈ **11.9 D6 rolls/player** per lap;
- overall content density is healthy;
- news/card/money spread is good;
- Job Hub M11 is well positioned;
- Mini Games at M21/M31 are uneven at a 10/30 spacing.

Balanced A4 candidate for review:
- Mini Games at `M18` and `M38`;
- M21 inherits Money -;
- M31 inherits TIN TỨC;
- category totals stay unchanged.

No architecture JSON or runtime data has been changed by this proposal.

Compact fallback if future playtest says 40 main nodes is too long:
- **44 total = 36 main + 4 Hospital + 4 Jail**.

## Final HUD / camera locks

- P1 top-left, P2 top-right, P3 bottom-left, P4 bottom-right.
- Each occupied HUD shows at least avatar, player name and B$.
- Active player is highlighted.
- Normal gameplay camera follows/zooms to active token.
- Full-map is explicit overview only.
- `docs/UI_FINAL_PLAYER_HUD.md` is the UI contract.

## Runtime boundary

Map Draft A through A4 are design-only. Current validated runtime remains 0.1.48.

Do not import the final-map graph/coordinates into runtime until its own implementation milestone is explicitly opened and validated.

## Next decision

Primary map decision now:
- keep Mini Games at M21/M31; or
- test the balanced M18/M38 candidate.

Continue 0.1.49 audit in parallel. Keep Hospital/Jail deeper gameplay rules TBD until explicitly approved.
