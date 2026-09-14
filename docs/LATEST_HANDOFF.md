# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

0.1.48 is runtime **PASS** by Ron's explicit acceptance on 2026-09-14.

Latest validated playable artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel with final-map design.

Current names remain:
- **TIN TỨC**
- **LÁ BÀI**

## Final map source-of-truth

Draft B through B5 are now built.

Read:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_FINAL.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
4. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
5. `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
6. `docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`
7. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.md`
8. `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`
9. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
10. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

## Current locked structure

- 44 main-loop spaces `M01..M44`
- exactly one `JAIL`
- exactly one `HOSPITAL`
- lap crossing `M44 -> M01`

Four corners:
- M01 READY
- M12 JAIL_GATE -> JAIL
- M23 LOTTERY -> D6 × 20 B$
- M34 HOSPITAL_GATE -> HOSPITAL

Lottery payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`.

Jail release:
- D6 `1 / 3 / 5` = release
- failure = remain and retry next turn

Hospital release:
- D6 exactly `2 / 4 / 5` = release
- failure = remain and retry next turn

Still TBD:
- main-loop re-entry node after successful release
- whether successful release also grants normal movement that turn

## B1 content pacing

- Job Hub M08
- Mini Game M17 / M39, exact 22/22 split
- TIN TỨC M06 / M14 / M21 / M28 / M36 / M43
- LÁ BÀI M04 / M10 / M16 / M22 / M27 / M32 / M41
- Money+ M03 / M13 / M25 / M35
- Money- M07 / M18 / M30 / M40
- 16 Normal spaces

Expected fair-D6 lap length: about 13.05 rolls/player.

## B2 spatial layout

Working landscape orientation:
- READY bottom-left
- JAIL_GATE top-left
- LOTTERY top-right
- HOSPITAL_GATE bottom-right
- inner Jail paired with M12
- inner Hospital paired with M34

Gate transfer spurs contain no movement nodes.

## B3 visual hierarchy

- V0 Normal
- V1 Money / TIN TỨC / LÁ BÀI
- V2 Job Hub / Mini Game
- V3 four corners

## B4 working quarter themes

- Q1 READY / Trung tâm & Sự nghiệp
- Q2 Đồn cảnh sát / Giải trí & Drama
- Q3 Trúng số / Mua sắm & Đời sống
- Q4 Bệnh viện / Đêm thành phố & Hồi vòng

These are provisional art labels, not final names.

## B5 mockup brief

Minimum references:
- overview
- normal close-follow + four HUDs
- READY
- JAIL_GATE transfer
- JAIL turn
- LOTTERY
- HOSPITAL_GATE transfer
- HOSPITAL turn
- Mini Game feature frame

## Runtime boundary

Draft B through B5 are still design/docs only.

Current playable runtime remains 0.1.48. Do not import final-map data into runtime until its own explicit implementation milestone is opened.

## Next priority

1. Build/approve B5 visual mockups when desired.
2. Decide the two remaining release rules later.
3. Continue 0.1.49 effect audit.
4. Keep TIN TỨC / LÁ BÀI.
5. Do not merge PR #1.
