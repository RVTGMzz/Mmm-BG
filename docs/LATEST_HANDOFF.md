# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 unless Ron explicitly asks.

## Runtime baseline

0.1.48 remains the validated HOST-authoritative baseline accepted by Ron.

Artifact:
- `mememe-playtest-0.1.48`
- run #1441 / `34814789556`
- SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`

## Current preview milestone

**MVP 0.1.51 — Draft D Branching Map + Close Camera Preview**

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
3. `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
4. `docs/MVP_0.1.51_DRAFT_D_PREVIEW.md`
5. `docs/PLAYTEST_0.1.51_DRAFT_D_PREVIEW.md`

Runtime:
- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview051.ts`
- `src/scenes/FinalMapPreviewScene051.ts`
- `tests/final-map-preview-051.ts`

Launch:
- `START_DRAFT_D_PREVIEW.bat`
- query `?finalmap=2`

0.1.50 remains available via `START_FINAL_MAP_PREVIEW.bat` / `?finalmap=1` for direct A/B comparison.

## Draft D direction locked from Ron's 0.1.50 feedback

- keep 44 main spaces;
- stop reading as a neat oval/circle;
- use asymmetric winding city route;
- increase space between nodes;
- avoid long packed rows;
- add 3 real route decisions;
- normal camera much closer;
- HUD cards smaller;
- full map only through Overview;
- ordinary preview nodes may be rectangular and branch nodes diamond-shaped instead of all circles.

## Three route decisions

1. After M04:
   - main M05 → M06 → M07 → M08
   - alternate A1 → A2 → A3 → M08
2. After M17:
   - main M18 → M19 → M20 → M21
   - alternate B1 → B2 → B3 → M21
3. After M35:
   - main M36 → M37 → M38 → M39
   - alternate C1 → C2 → C3 → M39

The two paths at each junction intentionally use equal step counts in the first preview. Shortcut/risk/reward balance is not yet locked.

## Camera / HUD preview values

- normal follow zoom `1.38`
- branch decision zoom `1.10`
- overview zoom `0.55`
- P1/P2/P3/P4 fixed at four screen corners
- compact avatar + name + B$ HUD
- active HUD emphasized

## Retained anchors and rules

- M01 READY
- M12 JAIL_GATE
- M23 LOTTERY, D6 × 20 B$
- M34 HOSPITAL_GATE
- Jail release 1/3/5
- Hospital release exactly 2/4/5
- Jail exit exactly J1 → J2 → J3 → M13
- Hospital exit exactly H1 → H2 → H3 → M35
- TIN TỨC / LÁ BÀI naming retained

Canonical combined map + HUD visual reference:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Post-release same-turn behavior remains TBD and must not be inferred from preview animation.

## Parallel work

0.1.49 Legacy Effect Audit continues in parallel.

## Next gate

Ron playtests 0.1.51 and compares against 0.1.50 for:
- branch feel;
- route spacing;
- camera comfort;
- HUD obstruction/readability;
- tile-shape direction;
- overview orientation.

Only after approval should Draft D move into authoritative integration.
