# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT B CURRENT / B1–B5 BUILT / DOCUMENTATION ONLY**

Current source-of-truth:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.json`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.json`
- `docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.md`
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.json`
- `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

Do **not** merge PR #1 unless Ron explicitly asks.

## Current board structure

- **44 spaces on the main loop**: `M01..M44`.
- exactly one singleton `JAIL` location inside/off the ordinary loop.
- exactly one singleton `HOSPITAL` location inside/off the ordinary loop.
- `M44 -> M01` is the canonical lap/salary crossing.
- Hospital/Jail transfer spurs are presentation connectors, not dice-counted paths.

Draft A's old `H1..H4` / `J1..J4` chains are superseded.

## Four locked corners

The loop is divided into four equal 11-edge quarters:

- `M01` = **READY**
- `M12` = **JAIL_GATE** -> `JAIL`
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE** -> `HOSPITAL`

TIN TỨC, LÁ BÀI, or another approved HOST-authoritative effect may also send a player directly to Jail/Hospital.

## Approved Jail / Hospital rules

### JAIL
On the detained player's turn, roll one D6.

Release on:
`1 / 3 / 5`

Failure means remain in Jail and retry next turn.

### HOSPITAL
On the hospitalized player's turn, roll one D6.

Release on exactly:
`2 / 4 / 5`

Failure means remain in Hospital and retry next turn.

Still TBD for both:
- exact main-loop re-entry/return node after release;
- whether the successful release roll also provides normal movement that same turn.

Do not infer either rule.

## Approved Lottery rule

Landing on `M23 LOTTERY` triggers one HOST-authoritative D6.

Reward:
`D6 × 20 B$`

Payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`

Expected payout before later balancing: `70 B$`.

## Draft B1 — content pacing

Current working distribution:
- Job Hub: `M08`
- Mini Game: `M17 / M39`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 spaces

Mini Game spacing is exactly `22 / 22`.

TIN TỨC gaps are `8 / 7 / 7 / 8 / 7 / 7`.

A fair D6 needs about **13.05 rolls/player** to reach/cross 44 spaces, so total match duration must still be runtime-playtested later.

## Draft B2 — spatial layout

Working landscape composition:
- bottom-left: READY;
- top-left: JAIL_GATE;
- top-right: LOTTERY;
- bottom-right: HOSPITAL_GATE;
- inner Jail visually paired with M12;
- inner Hospital visually paired with M34.

Transfer connectors from gate to singleton location contain **no movement nodes**.

B2 coordinates are design anchors only, not runtime pixels or authoritative state.

## Draft B3 — visual hierarchy

Relative hierarchy:
- V0: Normal
- V1: Money / TIN TỨC / LÁ BÀI
- V2: Job Hub / Mini Game
- V3: the four corner anchors

Jail and Hospital are location footprints/buildings, not ordinary route circles.

M12/M34 must visually read as **gates**, distinct from the actual inner Jail/Hospital.

## Draft B4 — district / landmark blueprint

Working art-direction quarters:
- Q1: READY / Trung tâm & Sự nghiệp
- Q2: Đồn cảnh sát / Giải trí & Drama
- Q3: Trúng số / Mua sắm & Đời sống
- Q4: Bệnh viện / Đêm thành phố & Hồi vòng

These names are provisional art-direction labels, not final localization copy.

Primary landmark hierarchy:
- READY Plaza
- Jail Gate + inner Police/Jail location
- Lottery landmark
- Hospital Gate + inner Hospital location
- Job Hub M08
- Mini Game M17
- Mini Game M39

## Draft B5 — camera / mockup production brief

Required visual references before runtime implementation:
- full board overview;
- normal close-follow frame with all four HUDs;
- READY corner;
- JAIL_GATE transfer;
- player turn while in JAIL;
- LOTTERY corner;
- HOSPITAL_GATE transfer;
- player turn while in HOSPITAL;
- Mini Game feature frame.

Canonical brief:
`docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

Temporary concept images should use the naming convention in B5 and live under `docs/reference/map/` until runtime art/screenshots replace them.

## HUD / camera locks retained

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum
- active HUD emphasized
- HUD fixed in screen space
- normal camera close-follows active token
- turn handoff for a player in Jail/Hospital goes directly to that singleton location
- full map is explicit overview only

## Runtime boundary

Draft B through B5 are design/docs only.

Do not import the 44-node map, design coordinates, gate transfer connectors, or special-location rules into `src/content/city/board_city_mvp.json` until a dedicated final-map runtime milestone is explicitly opened.

The latest validated playable runtime remains MVP 0.1.48.

## Current remaining design gates

Before final-map runtime work, the two unresolved special-location rules are:
1. where a released player re-enters the main loop;
2. whether a successful release roll also grants normal movement that turn.

Everything else in Draft B through B5 may continue as visual/mockup work without changing runtime.

MVP 0.1.49 Legacy Effect Audit continues in parallel.
