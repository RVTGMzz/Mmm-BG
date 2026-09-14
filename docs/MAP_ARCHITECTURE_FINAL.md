# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT B CURRENT / B1–B4 BUILT / DOCUMENTATION ONLY**

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

Current working node distribution:

- READY: 1
- JAIL_GATE: 1
- LOTTERY: 1
- HOSPITAL_GATE: 1
- Job Hub: 1 at `M08`
- Mini Game: 2 at `M17 / M39`
- TIN TỨC: 6 at `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: 7 at `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: 4 at `M03 / M13 / M25 / M35`
- Money -: 4 at `M07 / M18 / M30 / M40`
- Normal/breathing: 16

Mini Game spacing is exactly `22 / 22`.

TIN TỨC gaps are `8 / 7 / 7 / 8 / 7 / 7`.

A fair D6 needs about **13.05 rolls/player** to reach/cross 44 spaces, so total match duration must still be validated in runtime later.

## Draft B2 — spatial layout

Working landscape composition:
- bottom-left: READY;
- top-left: JAIL_GATE;
- top-right: LOTTERY;
- bottom-right: HOSPITAL_GATE;
- inner Jail visually paired with M12;
- inner Hospital visually paired with M34.

Transfer connectors may be shown from gate to singleton location, but they contain **no movement nodes**.

Coordinates in B2 are design anchors only, not runtime pixels or authoritative state.

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

Draft B through B4 are design/docs only.

Do not import the 44-node map, design coordinates, gate transfer connectors, or special-location rules into `src/content/city/board_city_mvp.json` until a dedicated final-map runtime milestone is explicitly opened.

The latest validated playable runtime remains MVP 0.1.48.

## Next design pass

**Draft B5 — camera shot + mockup production brief**.

B5 should specify the minimum reference/mockup frames needed before implementation:
- full overview;
- normal close-follow frame with four HUDs;
- each of four corner landings;
- Jail framing;
- Hospital framing;
- M17 Mini Game framing;
- M39 Mini Game framing.

Continue MVP 0.1.49 Legacy Effect Audit in parallel.
