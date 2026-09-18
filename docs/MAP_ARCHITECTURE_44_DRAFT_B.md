# MeMeMe — Final Map Architecture Draft B

Status: **CURRENT DESIGN SOURCE / B1–B5 BUILT / DOCUMENTATION ONLY / NOT RUNTIME**

Draft B corrects the old multi-space Hospital/Jail interpretation and follows Ron's physical-board reference.

## Core structure

- **44 spaces on the main loop**: `M01..M44`
- one singleton `JAIL` / Police Station location inside/off the ordinary loop
- one singleton `HOSPITAL` location inside/off the ordinary loop
- canonical lap edge: `M44 -> M01`
- READY remains the only lap-count / Job-salary crossing anchor

Hospital and Jail are not H1..H4 / J1..J4 chains.

## Four locked corners

The 44-space loop divides into four equal 11-edge quarters:

- `M01` = READY
- `M12` = JAIL_GATE
- `M23` = LOTTERY
- `M34` = HOSPITAL_GATE

Landing on M12 sends the player directly to `JAIL`.

Landing on M34 sends the player directly to `HOSPITAL`.

TIN TỨC, LÁ BÀI, or another approved HOST-authoritative effect may also send a player directly to either singleton location.

## Jail release — approved

While in `JAIL`, on that player's turn roll one D6.

Release faces:
`1 / 3 / 5`

Any other result means remain in Jail and retry next turn.

## Hospital release — approved

While in `HOSPITAL`, on that player's turn roll one D6.

Release faces exactly:
`2 / 4 / 5`

Any other result means remain in Hospital and retry next turn.

Do not normalize this to an even-number rule.

## Release behavior still TBD

For both singleton locations, do not infer:
- exact main-loop re-entry node after release;
- whether the successful release roll also becomes/provides normal movement that same turn.

These are the remaining special-location rule gates.

## Lottery — approved

Landing on M23 triggers one HOST-authoritative D6.

Reward:
`D6 × 20 B$`

Payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`

Expected payout before later economy balancing: `70 B$`.

## Design passes built

### B1 — content pacing
Source:
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.json`

Working highlights:
- Job Hub M08
- Mini Game M17 / M39, exact 22/22 spacing
- TIN TỨC M06 / M14 / M21 / M28 / M36 / M43
- LÁ BÀI M04 / M10 / M16 / M22 / M27 / M32 / M41
- Money+ M03 / M13 / M25 / M35
- Money- M07 / M18 / M30 / M40
- 16 Normal/breathing spaces

### B2 — spatial layout
Source:
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.json`

Working orientation:
- READY bottom-left
- JAIL_GATE top-left
- LOTTERY top-right
- HOSPITAL_GATE bottom-right
- inner Jail paired with M12
- inner Hospital paired with M34

Gate-to-location spurs are visual transfer connectors with no dice-counted nodes.

### B3 — visual hierarchy
Source:
`docs/MAP_VISUAL_HIERARCHY_44_DRAFT_B3.md`

Hierarchy:
- V0 Normal
- V1 Money / TIN TỨC / LÁ BÀI
- V2 Job Hub / Mini Game
- V3 four corner anchors

### B4 — district / landmark blueprint
Sources:
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.md`
- `docs/MAP_DISTRICT_LANDMARK_BLUEPRINT_44_DRAFT_B4.json`

Working labels only:
- Q1 READY / Trung tâm & Sự nghiệp
- Q2 Đồn cảnh sát / Giải trí & Drama
- Q3 Trúng số / Mua sắm & Đời sống
- Q4 Bệnh viện / Đêm thành phố & Hồi vòng

### B5 — camera / mockup brief
Source:
`docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

B5 defines the minimum overview, normal close-follow, four-corner, Jail/Hospital and Mini Game reference frames required before runtime implementation.

## Special-location authority

JAIL and HOSPITAL:
- are outside ordinary dice movement;
- do not count toward lap distance;
- may be reached from their gate or an approved effect;
- must become authoritative player-location state when implemented;
- must be snapshot/replay/checksum-safe;
- may receive dedicated camera framing.

## Draft A superseded

Invalid final assumptions:
- `40 main + 4 Hospital + 4 Jail`
- `M12 -> H1 -> H2 -> H3 -> H4 -> M13`
- `M28 -> J1 -> J2 -> J3 -> J4 -> M29`
- Hospital/Jail internal spaces counted as movement distance

Draft A/A1/A2/A3/A4/A5 remain design history only where they conflict with Draft B.

## Runtime boundary

Do not import Draft B/B1/B2/B3/B4/B5 into runtime until a dedicated final-map implementation milestone is explicitly opened.

Latest validated playable runtime remains MVP 0.1.48.
