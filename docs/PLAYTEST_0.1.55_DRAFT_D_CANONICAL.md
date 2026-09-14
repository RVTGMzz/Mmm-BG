# MeMeMe MVP 0.1.55 — Draft D Canonical Integration Playtest

Status: **candidate build / canonical START_PLAYTEST integration**.

## What changed

`START_PLAYTEST.bat` remains the standard gameplay launcher, but its canonical board data is now Draft D instead of the old compact 20-space board.

0.1.55 integrates:
- 44 main-loop spaces `M01..M44`;
- three real HOST-authoritative branch-choice junctions;
- forward-only equal-step branch corridors that rejoin ahead;
- 5 Mini Game spaces at `M09 / M17 / M26 / M35 / M44`;
- Draft D coordinates scaled into the existing canonical gameplay viewport;
- existing Roll For Order, Job Hub, Cards, News, Mini Game payout, salary, replay/checksum, multiplayer and final-result systems remain in the standard flow.

## How to test

Run:

`START_PLAYTEST.bat`

Do not use the Draft D preview launcher when validating 0.1.55 canonical gameplay.

Please check:
1. Roll For Order still reaches the match normally.
2. Movement uses the larger Draft D board.
3. At a junction, the active human receives the real branch picker and can choose Left/Right.
4. Both paths continue forward and visibly rejoin.
5. Job Hub still works.
6. Mini Game can trigger from the new five-space distribution.
7. TIN TỨC / LÁ BÀI still use their current authoritative systems.
8. READY still counts the physical lap and salary correctly.
9. Four-player result flow still completes after everyone finishes the required lap.

## Important scope boundary

0.1.55 integrates the **board topology** into canonical gameplay. It does **not** falsely claim that the later special-location state machine is already finished.

The map already contains geometry/content IDs for:
- `M12 JAIL_GATE` + JAIL + `J1/J2/J3`;
- `M23 LOTTERY`;
- `M34 HOSPITAL_GATE` + HOSPITAL + `H1/H2/H3`.

But full HOST-authoritative Jail/Hospital/Lottery behavior is scheduled for **0.1.57**.

Locked future rule already recorded:
- Jail release check: `1/3/5`;
- Hospital release check: exactly `2/4/5`;
- release die only checks release;
- successful release exits through 3 spaces and then requires a **fresh movement D6** in the same turn;
- Jail/Hospital players cannot participate in Mini Games;
- 1 eligible Mini Game participant = auto rank #1;
- 0 eligible participants = skip/no payout.

## Rollback baseline

MVP 0.1.48 remains the validated rollback baseline until this 0.1.55 candidate is user-playtested and accepted.

PR #1 remains Draft/Open and must not be merged without explicit approval.
