# MeMeMe Map Branching Rule D2

Status: **approved working rule for Draft D runtime preview**.

## Player-facing rule

At each decision junction, the active player chooses one of two directions:

- **RẼ TRÁI**
- **RẼ PHẢI**

The choice changes which spaces/content the player passes through, but it must never send the player backward or into an endless loop.

## Progress contract

Every branch is a forward corridor with a fixed rejoin point ahead of the junction. Both choices use the same number of movement steps in the current Draft D preview so choosing a direction changes exposure/content, not lap distance.

Current branch plans:

| Junction | Left first | Right first | Rejoin | Steps to rejoin |
|---|---:|---:|---:|---:|
| M04 / node 3 | A1 / 200 | M05 / 4 | M08 / 7 | 4 |
| M17 / node 16 | M18 / 17 | B1 / 210 | M21 / 20 | 4 |
| M35 / node 34 | C1 / 220 | M36 / 35 | M39 / 38 | 4 |

After the merge, movement continues along the forward main route toward READY and the next lap crossing.

## Hard guardrails

- No branch may point to an earlier progress segment.
- No branch may create its own cycle.
- No branch may re-enter another decision junction before its declared merge in this preview.
- No choice may trap the player in a dead end.
- READY remains the lap destination and only physical lap crossing.
- Jail/Hospital exit paths remain separate special-location routes, not normal left/right choices.

## Full-map review

`START_DRAFT_D_FULL_MAP.bat` is a dedicated review mode. It must fit the complete Draft D board into one viewport, without gameplay HUD/camera-follow behavior, so topology and branch merges are easy to inspect.
