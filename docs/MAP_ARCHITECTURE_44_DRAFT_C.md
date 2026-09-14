# MeMeMe — Final Map Architecture Draft C

Status: **CURRENT DESIGN SOURCE / DOCUMENTATION ONLY / NOT RUNTIME**

Draft C follows the approved colorful city-board visual reference more closely and corrects the special-location topology.

## Core structure

- **44 spaces on the main loop**: `M01..M44`
- **1 inner Jail / Police Station holding location**: `JAIL`
- **1 inner Hospital holding location**: `HOSPITAL`
- **3 Jail exit-route spaces**: `J1 -> J2 -> J3`
- **3 Hospital exit-route spaces**: `H1 -> H2 -> H3`

Canonical main-loop lap crossing remains:

`M44 -> M01`

READY remains the only lap-count / Job-salary crossing anchor.

The six branch-route spaces do **not** increase the main-loop count above 44 and do not create a second lap counter.

## Four main-loop anchor spaces

- `M01` = **READY**
- `M12` = **JAIL_GATE**
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE**

### Jail entry / exit topology

Landing on `M12 JAIL_GATE` sends the player directly to the inner `JAIL` holding location.

Approved exit route geometry:

`JAIL -> J1 -> J2 -> J3 -> M13`

There are exactly **3 exit-route spaces** after Jail: `J1 / J2 / J3`.

Do not recreate the AI-reference error `J1 / J1 / J3 / J4`.

### Hospital entry / exit topology

Landing on `M34 HOSPITAL_GATE` sends the player directly to the inner `HOSPITAL` holding location.

Approved exit route geometry:

`HOSPITAL -> H1 -> H2 -> H3 -> M35`

There are exactly **3 exit-route spaces** after Hospital: `H1 / H2 / H3`.

### Effect-driven entry

Approved authoritative effects from **TIN TỨC**, **LÁ BÀI**, or another explicitly approved player-targeting effect may also send a player directly to `JAIL` or `HOSPITAL`.

## Jail release rule — APPROVED

At the detained player's turn while in `JAIL`, roll one D6.

Release on:

`1 / 3 / 5`

Failure means the player remains in Jail and retries on their next turn.

The release chance per attempt is 50%.

## Hospital release rule — APPROVED

At the hospitalized player's turn while in `HOSPITAL`, roll one D6.

Release on exactly:

`2 / 4 / 5`

Failure means the player remains in Hospital and retries on their next turn.

The approved success set is exactly `2 / 4 / 5`.

## Post-release movement still TBD

Draft C now locks the **route shape** but intentionally does not invent the exact turn-flow semantics after a successful release roll.

Still TBD:
- whether success immediately places the player on `J1` / `H1`;
- whether the successful release roll also becomes movement distance through the 3-space exit route;
- whether release ends the turn and normal movement begins next turn.

The route geometry is approved; the timing semantics are not yet approved.

## Lottery rule — APPROVED

Landing on `M23 LOTTERY` triggers one HOST-authoritative D6.

Reward:

`D6 × 20 B$`

Payouts:

`20 / 40 / 60 / 80 / 100 / 120 B$`

Expected payout before later economy balancing: `70 B$`.

## Visual-board direction

Draft C takes the approved concept as visual inspiration:
- bright stylized island/city viewed from above;
- a readable pale main route winding around/through the city;
- large environmental landmarks for orientation;
- four fixed player HUDs in the screen corners;
- inner Jail and Hospital visibly connected to their route gates;
- district signs used as orientation landmarks;
- special spaces read by icon/color first, text second;
- central city space remains visually open enough for landmarks, camera motion and event presentation.

AI-generated numbering/text in concept images is **non-authoritative**. Stable IDs in this document and JSON are authoritative for design.

## Compatibility with earlier drafts

Draft C supersedes Draft B only where B said Jail/Hospital connectors had no movement nodes.

Still retained from Draft B/B1 where compatible:
- 44-space main loop;
- four anchor spaces;
- current content pacing positions;
- close-follow camera;
- four corner HUDs;
- TIN TỨC / LÁ BÀI naming;
- HOST authority and replay/checksum requirements.

Draft A's old four-space detours remain invalid.

## Runtime boundary

This is still a **design source only**.

Do not modify validated runtime or `src/content/city/board_city_mvp.json` until a dedicated final-map implementation milestone is explicitly opened.
