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

**MVP 0.1.52 — Draft D UI Fix / Close Camera / Persistent Full Map**

Read first:
1. `HANDOFF_CURRENT.md`
2. `docs/MVP_0.1.52_DRAFT_D_UI_FIX.md`
3. `docs/PLAYTEST_0.1.52_DRAFT_D_UI_FIX.md`
4. `docs/MAP_DRAFT_D_PLAYTEST_FEEDBACK_0.1.51.md`
5. `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
6. `docs/MAP_CAMERA_HUD_DRAFT_D1.md`

## Why 0.1.52 exists

0.1.51 loaded the Draft D map but looked frozen because the zoomed world camera also transformed screen HUD/controls. The Roll Dice button and HUDs could end up outside the viewport.

0.1.52 separates rendering:
- world camera = map + tokens;
- UI camera = four HUDs + Roll Dice + route chooser + toast + Full Map controls;
- UI camera stays at zoom `1.0`.

## Camera values
- active-player follow `1.70x`
- branch decision `1.25x`
- persistent full-map review `0.50x`

## Launch

Close gameplay review:
- `START_DRAFT_D_PREVIEW.bat`
- `?finalmap=3`

Persistent full-map review:
- `START_DRAFT_D_FULL_MAP.bat`
- `?finalmap=3&overview=1`

## CI candidate

- artifact `mememe-playtest-0.1.52-draft-d-ui-fix`
- run #1704 / `34896654009`
- package SHA `cf7129a054d0b82c9a97cb9aa4a8b9dd21bd602d`
- artifact ID `10368997808`
- SHA256 `bdd64be273299aa400f75782da08bb84a29462f152d42499c3d17dbee9b36081`

## Draft D retained direction
- 44 main spaces baseline;
- asymmetric board, not a simple oval;
- 3 real decision junctions;
- more breathing room between spaces;
- alternate lanes rejoin main route;
- full map is review/overview, normal turn camera stays close.

Locked special rules remain:
- M01 READY
- M12 Jail Gate
- M23 Lottery D6 × 20 B$
- M34 Hospital Gate
- Jail release `1/3/5`
- Hospital release exactly `2/4/5`
- exactly 3 visible exit spaces for each special location.

Keep **TIN TỨC / LÁ BÀI** names.
0.1.49 Legacy Effect Audit remains parallel.
Do not merge PR #1.
