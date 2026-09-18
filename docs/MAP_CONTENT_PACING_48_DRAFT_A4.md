# MeMeMe — Map Content Pacing 48 Draft A4

Status: **APPROVED DESIGN AUDIT / DOCUMENTATION ONLY / NOT RUNTIME**

## Main-loop travel estimate

Draft A uses 40 main-loop nodes plus 8 side-location nodes, for 48 total playable nodes.

With a fair D6, the exact expected number of rolls to reach/cross 40 spaces is about **11.9 rolls per player**. For four players, one lap each therefore means roughly **47–48 player turns** before extra presentation time or side-location travel is counted.

This is viable, but match length must be playtested before 40 main nodes are final-locked for runtime.

Comparison:

| Main-loop spaces | Expected D6 rolls/player |
| ---: | ---: |
| 34 | ~10.2 |
| 36 | ~10.8 |
| 40 | ~11.9 |
| 44 | ~13.0 |
| 48 | ~14.2 |

Important: the user requirement is **more than 40 total playable spaces**, not necessarily more than 40 spaces on the main lap.

## Current content density

Main loop:
- READY: 1
- Job Hub: 1
- Mini Game: 2
- LÁ BÀI: 7
- TIN TỨC: 6
- Money +: 4
- Money -: 4
- Normal / breathing / topology nodes: 15

High-attention node density remains unchanged by the pacing rebalance.

## TIN TỨC spacing

Approved positions: `M06, M14, M19, M25, M33, M40`

Clockwise gaps: `8, 5, 6, 8, 7, 6`

Verdict: **VERY GOOD**.

The displaced M38 TIN TỨC role moves to M40 rather than M31 so news does not cluster around M31/M33.

## LÁ BÀI spacing

Positions: `M04, M09, M16, M22, M27, M35, M39`

Clockwise gaps: `5, 7, 6, 5, 8, 4, 5`

Verdict: **GOOD**.

## Money rhythm

Money + positions: `M03, M15, M23, M34`

Gaps: `12, 8, 11, 9`

Money - positions: `M07, M21, M30, M37`

Gaps: `14, 9, 7, 10`

Verdict: **ACCEPTABLE**.

The negative-money rhythm is slightly less even than the original draft, but the trade is worthwhile because Mini Game pacing becomes exact 20/20 while category totals stay unchanged.

## Job Hub position

Job Hub is at `M11`, about 10 edges after READY.

That is roughly three average D6 rolls into the first lap, which is a good onboarding position: not immediate, but early enough to matter through most of the lap.

Verdict: **GOOD**.

## Mini Game spacing — approved

Approved positions: `M18, M38`

Clockwise gaps:
- M18 -> M38 = 20 nodes
- M38 -> next M18 = 20 nodes

Verdict: **EXCELLENT / APPROVED FOR DRAFT A**.

Ron approved this direction on 2026-09-14.

The earlier `M21 / M31` Mini Game placement is superseded.

Affected-role rebalance:
- M18: Money - -> Mini Game
- M21: Mini Game -> Money -
- M31: Mini Game -> Normal
- M38: TIN TỨC -> Mini Game
- M40: Normal -> TIN TỨC

All category totals remain unchanged.

## Side-location pacing note

Each current 4-node side pocket creates four extra edges compared with the direct main edge if those internal nodes later consume ordinary movement distance.

The actual gameplay meaning of these pockets is still TBD, so A4 records only the travel consequence and does not infer rules.

## Compact fallback if 40 main nodes feels long

Keep a fallback for playtest comparison:

**44 total nodes = 36 main + 4 Hospital + 4 Jail**

Expected main-lap travel becomes about **10.8 rolls/player** while still satisfying the requirement of more than 40 playable spaces overall.

This is not an active change. Draft A remains 48 total / 40 main for the first final-map runtime test.

## A4 approved verdict

- 48 total playable spaces: **approved Draft A target**.
- 40-node main loop: **keep for first runtime map test; match-length sensitive**.
- Overall content density: **good**.
- TIN TỨC distribution: **very good**.
- LÁ BÀI distribution: **good**.
- Money distribution: **acceptable**.
- Job Hub timing: **good**.
- Mini Game spacing at M18/M38: **approved / 20–20**.

## Runtime boundary

A4 changes design source-of-truth only.

No runtime board file changes are authorized by this document. Current validated playable runtime remains 0.1.48 until a dedicated final-map implementation milestone is opened and validated.
