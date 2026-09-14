# MeMeMe — Map Content Pacing 48 Draft A4

Status: **DESIGN AUDIT / DOCUMENTATION ONLY / NOT RUNTIME**

## Main-loop travel estimate

Draft A uses 40 main-loop nodes plus 8 side-location nodes, for 48 total playable nodes.

With a fair D6, the exact expected number of rolls to reach/cross 40 spaces is about **11.9 rolls per player**. For four players, one lap each therefore means roughly **47–48 player turns** before extra presentation time or side-location travel is counted.

This is viable, but match length must be playtested before 40 main nodes are final-locked.

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

High-attention nodes are `25/40 = 62.5%`. This is a healthy party-board density for a prototype.

## TIN TỨC spacing

Positions: `M06, M14, M19, M25, M33, M38`

Clockwise gaps: `8, 5, 6, 8, 5, 8`

Verdict: **GOOD**.

## LÁ BÀI spacing

Positions: `M04, M09, M16, M22, M27, M35, M39`

Clockwise gaps: `5, 7, 6, 5, 8, 4, 5`

Verdict: **GOOD**.

## Money rhythm

Money + positions: `M03, M15, M23, M34`

Gaps: `12, 8, 11, 9`

Money - positions: `M07, M18, M30, M37`

Gaps: `11, 12, 7, 10`

Verdict: **ACCEPTABLE / WELL SPREAD**.

## Job Hub position

Job Hub is at `M11`, about 10 edges after READY.

That is roughly three average D6 rolls into the first lap, which is a good onboarding position: not immediate, but early enough to matter through most of the lap.

Verdict: **GOOD**.

## Mini Game spacing risk

Current positions: `M21, M31`

Clockwise gaps:
- M21 -> M31 = 10 nodes
- M31 -> next M21 = 30 nodes

Verdict: **CURRENT CLEAREST PACING ISSUE**.

The two Mini Game anchors are concentrated in one half of the route.

### Balanced candidate

A clean 20/20 candidate is:
- Mini Game A: `M18`
- Mini Game B: `M38`

To preserve category counts:
- move M18's current Money - role to `M21`;
- move M38's current TIN TỨC role to `M31`;
- M18 becomes Mini Game;
- M38 becomes Mini Game.

All category totals remain unchanged.

Why this candidate is useful:
- exact 20/20 spacing;
- first Mini Game occurs after the early Job Hub section;
- one sits in the entertainment half;
- one sits in the late-lap/night district;
- avoids packing another major feature into the Job Hub/Hospital area.

This is a proposal only. Do not mutate architecture data until approved.

## Side-location pacing note

Each current 4-node side pocket creates four extra edges compared with the direct main edge if those internal nodes later consume ordinary movement distance.

The actual gameplay meaning of these pockets is still TBD, so A4 records only the travel consequence and does not infer rules.

## Compact fallback if 40 main nodes feels long

Keep a fallback for playtest comparison:

**44 total nodes = 36 main + 4 Hospital + 4 Jail**

Expected main-lap travel becomes about **10.8 rolls/player** while still satisfying the requirement of more than 40 playable spaces overall.

This is not a change request yet, only a prepared alternative.

## A4 provisional verdict

- 48 total playable spaces: **viable**.
- 40-node main loop: **viable but match-length sensitive**.
- Overall content density: **good**.
- TIN TỨC distribution: **good**.
- LÁ BÀI distribution: **good**.
- Money distribution: **good enough for prototype**.
- Job Hub timing: **good**.
- Mini Game spacing: **needs review before final lock**.

## Next decision

Before Draft A is final-locked, choose whether to:
1. keep Mini Games at M21/M31;
2. test the balanced M18/M38 candidate;
3. nominate another two-node split after final landmark art review.

No runtime board file changes in A4.
