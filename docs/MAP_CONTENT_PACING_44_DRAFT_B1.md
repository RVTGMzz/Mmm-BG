# MeMeMe — Map Content Pacing 44 Draft B1

Status: **CURRENT DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

## Goal

Distribute the 40 non-corner spaces around the four locked 11-space quarters while keeping pacing readable, balanced, and compatible with a close-follow camera.

Locked corners:
- `M01` = READY
- `M12` = JAIL_GATE
- `M23` = LOTTERY
- `M34` = HOSPITAL_GATE

## Approved working distribution

| Node | Role |
| --- | --- |
| M01 | READY |
| M02 | Normal |
| M03 | Money + |
| M04 | LÁ BÀI |
| M05 | Normal |
| M06 | TIN TỨC |
| M07 | Money - |
| M08 | Job Hub |
| M09 | Normal |
| M10 | LÁ BÀI |
| M11 | Normal |
| M12 | JAIL_GATE |
| M13 | Money + |
| M14 | TIN TỨC |
| M15 | Normal |
| M16 | LÁ BÀI |
| M17 | Mini Game |
| M18 | Money - |
| M19 | Normal |
| M20 | Normal |
| M21 | TIN TỨC |
| M22 | LÁ BÀI |
| M23 | LOTTERY |
| M24 | Normal |
| M25 | Money + |
| M26 | Normal |
| M27 | LÁ BÀI |
| M28 | TIN TỨC |
| M29 | Normal |
| M30 | Money - |
| M31 | Normal |
| M32 | LÁ BÀI |
| M33 | Normal |
| M34 | HOSPITAL_GATE |
| M35 | Money + |
| M36 | TIN TỨC |
| M37 | Normal |
| M38 | Normal |
| M39 | Mini Game |
| M40 | Money - |
| M41 | LÁ BÀI |
| M42 | Normal |
| M43 | TIN TỨC |
| M44 | Normal |

## Category totals

- READY: 1
- JAIL_GATE: 1
- LOTTERY: 1
- HOSPITAL_GATE: 1
- Job Hub: 1
- Mini Game: 2
- TIN TỨC: 6
- LÁ BÀI: 7
- Money +: 4
- Money -: 4
- Normal / breathing: 16

Total: **44 main-loop spaces**.

The attention-node density remains close to the earlier prototype balance rather than turning every space into an event.

## Four-quarter rhythm

The board divides into four equal 11-space quarters:

1. `M01..M11`: READY quarter
2. `M12..M22`: Jail quarter
3. `M23..M33`: Lottery quarter
4. `M34..M44`: Hospital quarter

Each quarter gets a mix of recurring content and breathing spaces. The corners themselves remain the strongest orientation anchors.

## Mini Game spacing

Mini Game positions:
- `M17`
- `M39`

Clockwise gaps:
- M17 -> M39 = 22 spaces
- M39 -> next M17 = 22 spaces

Verdict: **EXACTLY BALANCED 22 / 22**.

This is cleaner than carrying the old 40-space M18/M38 split into Draft B.

## TIN TỨC spacing

Positions:
`M06, M14, M21, M28, M36, M43`

Clockwise gaps:
`8, 7, 7, 8, 7, 7`

Verdict: **VERY EVEN**.

## LÁ BÀI spacing

Positions:
`M04, M10, M16, M22, M27, M32, M41`

Clockwise gaps:
`6, 6, 6, 5, 5, 9, 7`

The longer `M32 -> M41` gap is acceptable because it crosses the Hospital corner and Mini Game area rather than leaving the route empty.

Verdict: **GOOD**.

## Money rhythm

Money +:
`M03, M13, M25, M35`

Clockwise gaps:
`10, 12, 10, 12`

Money -:
`M07, M18, M30, M40`

Clockwise gaps:
`11, 12, 10, 11`

Verdict: **BALANCED**.

## Job Hub timing

Job Hub is at `M08`.

That places it seven spaces after READY, roughly two average D6 rolls into the lap. It remains early enough to matter for most of the round without occupying a corner.

Verdict: **GOOD WORKING POSITION**.

## Lap-length estimate

For a fair D6, reaching/crossing 44 main-loop spaces takes about **13.05 rolls per player on average**.

For four players, one physical lap each is therefore roughly **52 player turns** before extra Mini Game / TIN TỨC / LÁ BÀI presentation time and any Jail/Hospital stays are counted.

This is longer than the old 40-main-space Draft A, so match duration must be runtime-playtested before final lock.

## Corner mechanics retained

- `M12 JAIL_GATE` sends the player to `JAIL`.
- `M23 LOTTERY` rolls D6 and pays `D6 × 20 B$`.
- `M34 HOSPITAL_GATE` sends the player to `HOSPITAL`.
- `M01 READY` remains the only lap/salary crossing anchor.

Jail release faces: `1 / 3 / 5`.
Hospital release faces: `2 / 4 / 5`.
Failure means remain and retry next turn.

Still TBD:
- exact return/re-entry node after release;
- whether the successful release roll also moves the player that turn.

Do not infer either behavior.

## Design verdict

Draft B1 gives the 44-space loop a strong first-pass content rhythm:
- four corners equally spaced;
- Mini Games exactly 22/22;
- TIN TỨC nearly mathematically even;
- money polarity balanced;
- seven LÁ BÀI distributed without crowding every quarter;
- enough Normal spaces to let landmarks and camera breathe.

## Next pass

Recommended next map pass: **Draft B2 spatial + district rebuild**.

B2 should:
1. place all 44 main nodes in a new irregular loop;
2. place one `JAIL` and one `HOSPITAL` as singleton inner locations aligned with their gates;
3. preserve the four-corner silhouette;
4. rebuild district/landmark framing around the new 44-space topology;
5. keep HUD safe zones and close-follow camera contract;
6. avoid importing any of this into runtime until the final-map implementation milestone is explicitly opened.
