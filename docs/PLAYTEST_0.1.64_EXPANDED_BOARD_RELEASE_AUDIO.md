# MeMeMe — PLAYTEST 0.1.64

## Expanded Board + Release Corridor + Audio Rebalance

Human-feedback build. Manual status: **PENDING RON ACCEPTANCE**.

## 1. Board spacing

0.1.64 expands the authored board footprint to roughly 2x the previous spacing while retaining the same node IDs, edge topology, branch identities and one-lap flow.

Round movement spaces are also enlarged to **1.5x** the 0.1.63 radii.

Visual acceptance:
- no two round spaces should touch or overlap;
- especially inspect `TÙ / J1 / J2 / J3`;
- inspect `BV / H1 / H2 / H3`;
- inspect Job, Mini Game and the three branch clusters;
- the already-confirmed movement-actor camera must still keep rolls 5/6 centered.

## 2. Jail / Hospital release-in-place

The release D6 remains a release check only.

On failure:
- player remains held;
- turn ends.

On success:
1. clear the Jail/Hospital hold;
2. token stays on the current `TÙ` / `BV` holding space;
3. release D6 is discarded (`lastRoll = null`);
4. same turn returns to `PRE_ROLL_ACTION`;
5. player rolls a **fresh movement D6**;
6. that new D6 starts movement through the internal corridor.

There is no automatic corridor traversal immediately after release anymore.

## 3. Internal penalty spaces

The six internal corridor nodes are now real money spaces:
- `J1 = -20 B$`
- `J2 = -20 B$`
- `J3 = -20 B$`
- `H1 = -20 B$`
- `H2 = -20 B$`
- `H3 = -20 B$`

Normal landing semantics apply: passing over an internal space does not charge it; landing on it resolves the `-20 B$` effect.

Visible effect order remains:
`ROLL -> MOVE -> ARRIVE -> EFFECT -> HUD B$ UPDATE`.

## 4. Audio rebalance

Requested mix:
- Card SFX: **80%** of previous gain (`-20%`);
- Step SFX: **130%** of previous gain (`+30%`).

The audio files are unchanged. Runtime gain only is adjusted.

## 5. Retained rules

Must remain unchanged:
- HOST authority and replay/checksum determinism;
- odd D6 `1/3/5 -> LEFT`;
- even D6 `2/4/6 -> RIGHT`;
- Job mid-roll continuation from 0.1.63.4;
- visible-money landing sync;
- movement-actor camera lock from 0.1.63.2;
- `TỔNG QUAN / O` remains available;
- Lottery x20;
- Mini Game ownership;
- READY finish lock and final result flow;
- visible names `TIN TỨC / LÁ BÀI`.

## 6. Manual checklist

1. Play around the whole board and confirm the larger map feels spacious rather than clustered.
2. Confirm large round spaces remain separated and readable.
3. Trigger Jail. On successful release, token must remain at `TÙ` until the new movement D6 is rolled.
4. Confirm the new D6 visibly walks J1/J2/J3 when its distance requires it.
5. Land on J1/J2/J3 and verify `-20 B$` appears only on arrival.
6. Repeat the same checks for Hospital H1/H2/H3.
7. Compare Card SFX against 0.1.63.4: it should be noticeably softer.
8. Listen to each movement step: it should be noticeably stronger.
9. Roll 5/6 several times and verify the camera still follows the moving actor correctly.
10. Continue watching for long-run token snap-back.

Do not call 0.1.64 accepted until Ron validates runtime behavior.
