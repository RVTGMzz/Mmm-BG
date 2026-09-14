# MeMeMe — Final Map Architecture Draft B

Status: **CURRENT DESIGN SOURCE / DOCUMENTATION ONLY / NOT RUNTIME**

Draft B corrects the old multi-space Hospital/Jail misunderstanding and now follows Ron's physical-board reference more closely.

## Core structure

The final working board uses:

- **44 spaces on the main loop** (`M01..M44`);
- **1 Hospital location** outside the main loop: `HOSPITAL`;
- **1 Jail / Police Station location** outside the main loop: `JAIL`.

Hospital and Jail are singleton special locations. They are not `H1..H4` / `J1..J4` movement chains.

Canonical lap edge:

`M44 -> M01`

READY remains the only lap-count / Job-salary crossing anchor.

## Four-corner structure

The 44-space loop divides naturally into four 11-space quarters. Working corner assignments are now:

- `M01` = **READY**
- `M12` = **JAIL_GATE**
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE**

These four corners are strong board-orientation anchors inspired by the physical reference.

### JAIL_GATE
Landing on `M12` sends the player directly to the singleton `JAIL` location.

### HOSPITAL_GATE
Landing on `M34` sends the player directly to the singleton `HOSPITAL` location.

### Other ways to enter

An approved authoritative effect may also send a player directly to `JAIL` or `HOSPITAL`, including effects from:

- **TIN TỨC**;
- **LÁ BÀI**;
- other explicitly approved player-targeting effects.

All such relocation is HOST-authoritative. The client only presents the move.

## Jail release rule — APPROVED

While a player is in `JAIL`, on that player's turn they roll one D6.

Successful release faces:

`1, 3, 5`

If the roll is not one of those values, the player remains in Jail and tries again on their next turn.

Release probability per attempt: `3/6 = 50%`.

Still intentionally undefined:
- whether a successful release roll also becomes that turn's normal movement roll;
- whether the player moves normally after being released in the same turn;
- bail / release cards / alternate release effects unless separately approved later.

Do not infer those details.

## Hospital release rule — APPROVED

While a player is in `HOSPITAL`, on that player's turn they roll one D6.

Successful release faces:

`2, 4, 5`

If the roll is not one of those values, the player remains in Hospital and tries again on their next turn.

Release probability per attempt: `3/6 = 50%`.

Note: the approved set is exactly `2 / 4 / 5`. Do not normalize it to even numbers.

Still intentionally undefined:
- whether a successful release roll also becomes that turn's normal movement roll;
- whether the player moves normally after being released in the same turn;
- Hospital fees / healing / alternate release cards unless separately approved later.

## Lottery corner — APPROVED

Landing on `M23` triggers one D6 roll.

Reward formula:

`LotteryReward = D6 × 20 B$`

Payout table:

- 1 -> `20 B$`
- 2 -> `40 B$`
- 3 -> `60 B$`
- 4 -> `80 B$`
- 5 -> `100 B$`
- 6 -> `120 B$`

Expected payout before later economy balancing: `70 B$`.

The HOST owns the lottery RNG/result and the authoritative wallet mutation.

## Special-location state contract

`JAIL` and `HOSPITAL`:

- are outside the ordinary dice path;
- do not count toward lap distance;
- do not create alternate lap crossings;
- may be reached from their main-loop gate or an approved effect;
- are authoritative player-location states;
- must be reflected by snapshot/replay/checksum once implemented;
- may receive dedicated camera framing while occupied.

## Draft A superseded

The following are invalid final-topology assumptions:

- `40 main + 4 Hospital + 4 Jail`;
- `M12 -> H1 -> H2 -> H3 -> H4 -> M13`;
- `M28 -> J1 -> J2 -> J3 -> J4 -> M29`;
- treating Hospital/Jail as ordinary movement distance.

Draft A/A1/A2/A3/A4/A5 may remain as design history, but Draft B wins wherever they conflict.

## Next Draft B work

1. Rebuild content distribution around the four locked corners.
2. Rebalance Mini Game / TIN TỨC / LÁ BÀI / money / Job Hub across the remaining 40 main-loop spaces.
3. Rebuild spatial layout around one `JAIL` and one `HOSPITAL` singleton inside/outside the visual ring.
4. Decide later what happens immediately after a successful release roll.
5. Preserve current names **TIN TỨC / LÁ BÀI**.

Do not import Draft B into runtime until a dedicated final-map implementation milestone is opened.