# MeMeMe — Map Visual Hierarchy + Corner Presentation 44 Draft B3

Status: **CURRENT DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_SPATIAL_LAYOUT_44_DRAFT_B2.md`

## Goal

Make the four outer corners, two inner singleton locations, and recurring content readable at close camera scale without turning the board into forty-four equally loud circles.

## Visual importance classes

### V0 — breathing node
Relative footprint: `1.00x`

Used for:
- Normal spaces.

Purpose:
- preserve rhythm;
- give landmarks and recurring content room to breathe.

### V1 — recurring content
Relative footprint: `1.08–1.12x`

Used for:
- Money + / Money -;
- TIN TỨC;
- LÁ BÀI.

Purpose:
- immediately readable category icon;
- still subordinate to Mini Game, Job Hub, and corner anchors.

### V2 — feature node
Relative footprint: `1.22–1.30x`

Used for:
- Job Hub M08;
- Mini Game M17;
- Mini Game M39.

Purpose:
- act as local landmarks within each quarter.

### V3 — corner anchor
Relative footprint: `1.38–1.55x`

Used for:
- M01 READY;
- M12 JAIL_GATE;
- M23 LOTTERY;
- M34 HOSPITAL_GATE.

These four nodes define the large-scale board orientation.

READY may sit at the upper end of the V3 range because it is also the lap/salary anchor.

## Corner identity

### M01 READY
Needs:
- unique lap/start emblem;
- strongest return-home recognition;
- enough visual space for salary/lap presentation without covering the route.

### M12 JAIL_GATE
Needs:
- clearly read as a **gate/trigger**, not the Jail itself;
- directional visual cue toward the inner `JAIL` location;
- distinct Police/Jail symbol language.

When triggered, the token may visually travel along the transfer spur, but the spur has no dice-counted intermediate spaces.

### M23 LOTTERY
Needs:
- celebratory jackpot identity;
- dedicated D6 roll presentation;
- reward pop-up showing `roll × 20 B$`;
- player remains associated with M23 while the lottery payout resolves.

Do not bake the full payout table into board art. The UI can show the formula/result.

### M34 HOSPITAL_GATE
Needs:
- clearly read as a **gate/trigger**, not the Hospital itself;
- directional visual cue toward the inner `HOSPITAL` location;
- medical symbol language distinct from ordinary positive-money icons.

## Inner JAIL footprint

`JAIL` is not styled like a normal circular route node.

Recommended presentation:
- one contained building/location footprint;
- dedicated token parking spots for multiple players;
- visible D6 release-roll area when the active player is detained;
- small status label/icon such as JAIL, not a chain of fake spaces.

Release success faces remain exactly:
`1 / 3 / 5`.

Failure presentation should communicate “remain here; retry next turn” without inventing extra punishment.

## Inner HOSPITAL footprint

`HOSPITAL` is one contained building/location footprint.

Recommended presentation:
- dedicated token parking spots;
- clear medical landmark silhouette;
- release-roll area for the active player;
- no internal movement spaces.

Release success faces remain exactly:
`2 / 4 / 5`.

Do not visually imply `2 / 4 / 6` merely because two of the three faces are even.

## Gate-to-location connector language

The two transfer spurs must look different from main-loop route edges.

Recommended:
- narrower or dashed/animated transfer lane;
- directional light/arrow only while relevant;
- no node dots along the spur;
- overview may show the link subtly;
- normal gameplay may emphasize it only when a transfer occurs.

The goal is to communicate “this corner sends you there,” not “this is another route you can choose.”

## Lottery presentation hierarchy

On M23 landing:
1. corner node highlights;
2. dedicated lottery D6 is rolled by authoritative game logic;
3. result is shown clearly;
4. reward is calculated as `face × 20 B$`;
5. wallet change presentation resolves once.

Payouts:
- 1 = 20 B$
- 2 = 40 B$
- 3 = 60 B$
- 4 = 80 B$
- 5 = 100 B$
- 6 = 120 B$

The lottery presentation should feel special, but remain shorter than a full Mini Game.

## Close-follow camera behavior

### Ordinary landing
Frame:
- active token;
- landed node;
- next route continuation.

### Feature node
Job Hub / Mini Game may widen slightly to include landmark art.

### Corner landing
Camera may widen enough to establish the corner landmark and incoming/outgoing route.

### Jail/Hospital transfer
Camera follows or cuts smoothly from gate/effect origin to the inner location, then settles there.

### Detained/in-Hospital turn
At turn handoff, camera goes directly to the singleton location rather than first panning to the player's last main-loop node.

## Four-corner HUD safety

Because HUD cards occupy all screen corners, board corners should not be framed literally under the matching screen corner.

When the active token is on a V3 corner node:
- offset camera inward;
- keep the V3 node + route + landmark visible in the central gameplay corridor;
- never move the HUD to expose world art.

## Overview hierarchy

Tier A icons:
- READY
- JAIL_GATE
- LOTTERY
- HOSPITAL_GATE
- inner JAIL
- inner HOSPITAL

Tier B:
- Job Hub
- Mini Games

Tier C:
- TIN TỨC
- LÁ BÀI
- Money + / -

Tier D:
- Normal spaces

Overview should make the outer-loop / inner-special-location relationship obvious in one glance.

## Player status presentation

If a player is in `JAIL` or `HOSPITAL`, their corner HUD may show a compact location badge.

The badge is informational only and must reflect authoritative location state.

Do not permanently fill the HUD with release-rule text; detailed roll/result belongs in the location presentation when that player's turn begins.

## Still intentionally TBD

- return/re-entry main node after successful release;
- whether successful release roll also counts as movement;
- bail/release cards or Hospital alternatives unless separately approved;
- final tween durations/easing;
- final art palette/materials.

## Next pass

Recommended next design pass: **Draft B4 district + landmark blueprint** based on the four 11-space quarters and this corrected singleton-location structure.
