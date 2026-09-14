# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

No newer runtime artifact is validated yet.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel with final-map design.

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

Legacy inventory:
`docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

## Final map — Draft B through B5 built

Read in this order:
1. `docs/MAP_ARCHITECTURE_FINAL.md`
2. `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`
4. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
5. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.json`
6. `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
7. `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.json`
8. `docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`
9. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.md`
10. `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.json`
11. `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

### Core topology
- 44 main-loop spaces `M01..M44`
- one singleton `JAIL`
- one singleton `HOSPITAL`
- lap crossing `M44 -> M01`

Old Draft A `H1..H4 / J1..J4` chains are superseded.

### Four locked corners
- `M01` READY
- `M12` JAIL_GATE -> JAIL
- `M23` LOTTERY -> D6 × 20 B$
- `M34` HOSPITAL_GATE -> HOSPITAL

Lottery payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`.

### Jail release — approved
- roll D6 on the detained player's turn
- `1 / 3 / 5` = released
- other result = remain and retry next turn

### Hospital release — approved
- roll D6 on the hospitalized player's turn
- exactly `2 / 4 / 5` = released
- other result = remain and retry next turn

Still TBD for both:
- exact main-loop re-entry node after release
- whether a successful release roll also provides normal movement that same turn

Do not infer these rules.

## B1 — current 44-space content pacing

- Job Hub: `M08`
- Mini Game: `M17 / M39` with exact `22 / 22` spacing
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 spaces

Fair D6 expected lap length is about **13.05 rolls/player**. Match duration still needs future runtime playtest.

## B2 — spatial layout

Working board orientation:
- READY bottom-left
- JAIL_GATE top-left
- LOTTERY top-right
- HOSPITAL_GATE bottom-right
- inner Jail paired with M12
- inner Hospital paired with M34

Gate-to-location spurs are presentation connectors only and contain no dice-counted nodes.

## B3 — visual hierarchy

- V0 Normal
- V1 Money / TIN TỨC / LÁ BÀI
- V2 Job Hub / Mini Game
- V3 four corner anchors

Jail/Hospital are building/location footprints, not ordinary route circles.

## B4 — working district / landmark blueprint

Provisional art-direction labels:
- Q1 READY / Trung tâm & Sự nghiệp
- Q2 Đồn cảnh sát / Giải trí & Drama
- Q3 Trúng số / Mua sắm & Đời sống
- Q4 Bệnh viện / Đêm thành phố & Hồi vòng

Names are not final localization copy.

## B5 — camera / mockup brief

Required reference frames before map implementation:
- full overview
- normal close-follow with four HUDs
- READY
- JAIL_GATE transfer
- JAIL turn
- LOTTERY
- HOSPITAL_GATE transfer
- HOSPITAL turn
- Mini Game frame

Canonical brief:
`docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

## HUD / camera locks retained

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum
- active player highlighted
- HUD fixed in screen space
- normal camera close-follows active token
- turn handoff for player in Jail/Hospital goes directly to singleton location
- full map is explicit overview only

## Retained runtime invariants from 0.1.48

- Remote Roll For Order host-authoritative
- Multiplayer Job Hub host-authoritative and spectator-safe
- Job mapping `1–2 A / 3–4 B / 5–6 C`
- Starting wallet `200 B$`
- Each player completes one physical lap before final scoring
- READY pays current Job salary once per crossing and increments lap
- Mini Game payout host-system-owned and one-shot
- Nhiều ra ít bị payout `30 / 20 / 10 / 0 B$`
- Direct RPS payout `25 / 15 / 5 / 0 B$`
- four approved BGM and eight supplied SFX checksum-protected
- final podium/result-input chain unchanged
- CPU remains a QA bot

## Runtime boundary

Draft B through B5 remain design/docs only.

Do not modify `src/content/city/board_city_mvp.json` or validated runtime until a dedicated final-map implementation milestone is explicitly opened.

Latest validated playable runtime remains 0.1.48.

## Next priority

1. Create/approve the B5 mockup reference set when desired.
2. Decide later the two remaining Jail/Hospital release details: re-entry node and same-turn movement.
3. Continue 0.1.49 effect audit in parallel.
4. Keep TIN TỨC / LÁ BÀI names.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 đã PASS runtime; latest validated artifact vẫn là mememe-playtest-0.1.48 run #1441 SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Final-map design hiện là Draft B through B5: 44 main spaces; M01 READY, M12 JAIL_GATE, M23 LOTTERY D6x20 B$, M34 HOSPITAL_GATE; exactly one inner JAIL and one inner HOSPITAL. Jail release 1/3/5; Hospital release exactly 2/4/5; failure retries next turn. B1 content pacing locked working, B2 spatial layout built, B3 visual hierarchy built, B4 district/landmark blueprint built, B5 mockup brief built. Re-entry node and same-turn movement after successful release are still TBD. Continue 0.1.49 in parallel. Do not merge PR #1.`
