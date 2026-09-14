# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime baseline

0.1.48 is runtime **PASS** by Ron's explicit acceptance on 2026-09-14.

Validated baseline artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

## Current runtime preview milestone

**MVP 0.1.50 — Final Map Preview** is open for Ron's playtest.

Read:
- `docs/MVP_0.1.50_FINAL_MAP_PREVIEW.md`
- `docs/PLAYTEST_0.1.50_FINAL_MAP_PREVIEW.md`

Runtime preview files:
- `src/content/city/board_city_final_050.json`
- `src/core/finalMapPreview050.ts`
- `src/scenes/FinalMapPreviewScene050.ts`
- `tests/final-map-preview-050.ts`

Launch preview:
- `START_FINAL_MAP_PREVIEW.bat`
- or `?finalmap=1`

Normal `START_PLAYTEST.bat` still opens the validated gameplay flow.

CI artifact family:
- `mememe-playtest-0.1.50-final-map-preview`

## Parallel milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel.

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

## Final map source-of-truth — Draft C

Read:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_FINAL.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_C.md`
4. `docs/MAP_ARCHITECTURE_44_DRAFT_C.json`
5. `docs/MAP_VISUAL_BLUEPRINT_44_DRAFT_C1.md`
6. `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` — canonical combined map + HUD reference
7. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
8. `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_C2.md`

## Current locked structure

- 44 main-loop spaces `M01..M44`
- `M01 READY`
- `M12 JAIL_GATE -> JAIL`
- `M23 LOTTERY -> D6 × 20 B$`
- `M34 HOSPITAL_GATE -> HOSPITAL`
- Jail exit: `J1 -> J2 -> J3 -> M13`
- Hospital exit: `H1 -> H2 -> H3 -> M35`

Jail release:
- `1 / 3 / 5` = released
- failure retries next turn

Hospital release:
- exactly `2 / 4 / 5` = released
- failure retries next turn

Lottery payouts:
- `20 / 40 / 60 / 80 / 100 / 120 B$`

## 0.1.50 preview implementation

Preview currently supports:
- 44-space route;
- 4 fixed corner HUDs;
- 4 local player tokens;
- active-player camera pan;
- overview mode;
- Jail/Hospital gate transfers;
- Jail/Hospital release-face checks;
- exactly 3 visible exit-route spaces per special location;
- Lottery x20;
- Money +/-;
- placeholder feedback for TIN TỨC / LÁ BÀI / Job / Mini Game.

The preview animation after a successful Jail/Hospital release intentionally travels through all three exit spaces so Ron can inspect the branch visually.

That animation is **not** the final authoritative timing rule.

Still TBD:
- whether release roll also becomes movement;
- whether release ends the turn;
- final authoritative event/replay sequence for branch exit.

## Current 44-space content pacing

- Job Hub `M08`
- Mini Game `M17 / M39`, exact `22 / 22`
- TIN TỨC `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money+ `M03 / M13 / M25 / M35`
- Money- `M07 / M18 / M30 / M40`
- 16 Normal spaces

## Approved visual direction

Canonical image already exists at:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Treat it as combined **map + HUD** reference, not HUD-only.

Known AI correction:
- Jail exit is exactly `J1 / J2 / J3`, never `J1 / J1 / J3 / J4`.

## Next priority

1. Ron tests 0.1.50 Final Map Preview.
2. Gather feedback on map length, HUD overlap, camera, anchors, branch readability and Lottery.
3. Ron locks final post-release timing.
4. Then integrate Draft C into HOST-authoritative replay/checksum runtime.
5. Continue 0.1.49 effect audit.
6. Do not merge PR #1.
