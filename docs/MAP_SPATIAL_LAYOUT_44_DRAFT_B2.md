# MeMeMe — Map Spatial Layout 44 Draft B2

Status: **CURRENT DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`

## Goal

Rebuild the board geometry around the corrected physical-reference logic:

- 44 ordinary main-loop spaces on the outside route;
- four memorable outer corners;
- one singleton `JAIL` inside the loop;
- one singleton `HOSPITAL` inside the loop;
- a visible transfer/spur connection from each gate to its singleton location;
- no multi-space Jail/Hospital path.

## Four-corner composition

Working landscape orientation:

- bottom-left: `M01 READY`
- top-left: `M12 JAIL_GATE`
- top-right: `M23 LOTTERY`
- bottom-right: `M34 HOSPITAL_GATE`

The main loop travels clockwise:

`M01 -> ... -> M12 -> ... -> M23 -> ... -> M34 -> ... -> M44 -> M01`

Each corner is exactly 11 main-loop edges from the next corner.

## Inner singleton locations

### JAIL

`JAIL` sits inside the upper-left portion of the loop, visually associated with `M12 JAIL_GATE`.

A short inward spur/transfer lane may be drawn from `M12` to `JAIL` so the player understands where the token is being sent.

Important:
- this spur is presentation/navigation art;
- it is **not** a sequence of dice-counted spaces;
- landing on M12 or an approved effect relocates the token directly to `JAIL`.

### HOSPITAL

`HOSPITAL` sits inside the lower-right portion of the loop, visually associated with `M34 HOSPITAL_GATE`.

A short inward spur/transfer lane may connect M34 visually to the Hospital.

Important:
- the lane is not ordinary movement distance;
- the token is moved directly to the singleton location;
- Hospital release behavior remains governed by the approved release-roll rule, not path traversal.

## Design coordinate space

Draft canvas:
- width: `4000` design units
- height: `2600` design units

Coordinates are compositional anchors only. They are not authoritative state or final runtime pixels.

The route intentionally resembles an irregular rounded city frame rather than a mathematically perfect rectangle.

## Quarter framing

### Q1 — READY to JAIL_GATE
Nodes: `M01..M12`

Primary orientation anchors:
- READY Plaza near M01;
- Job Hub around M08;
- Jail Gate silhouette approaching M12.

This quarter rises from the start area into the upper-left city.

### Q2 — JAIL_GATE to LOTTERY
Nodes: `M12..M23`

Primary orientation anchors:
- inner Jail location visible near the early section;
- Mini Game at M17;
- Lottery landmark growing visible toward M23.

This quarter forms the upper city route.

### Q3 — LOTTERY to HOSPITAL_GATE
Nodes: `M23..M34`

Primary orientation anchors:
- Lottery corner at M23;
- broad right-side city route;
- Hospital Gate at M34;
- Hospital building visible inside the loop near the approach.

### Q4 — HOSPITAL_GATE to READY
Nodes: `M34..M01`

Primary orientation anchors:
- inner Hospital location;
- Mini Game at M39;
- return skyline / READY foreshadowing toward M44/M01.

## Camera rules

Normal play remains close-follow.

### Main-loop movement
- active token stays near the central action corridor;
- next 1–2 main nodes should remain readable;
- corner HUDs never move with the map camera.

### Gate relocation
When M12 or M34 triggers:
1. HOST resolves the gate effect;
2. token presentation follows the inward transfer lane;
3. camera settles on the singleton special location;
4. HUD stays fixed;
5. authoritative location is `JAIL` or `HOSPITAL`, not an intermediate spur node.

### Effect relocation
TIN TỨC / LÁ BÀI may send a player directly to the same singleton location without requiring the main-loop gate animation.

### Release
After a successful release roll, exact return/re-entry behavior is still `TBD`.

Do not design a return edge into runtime yet.

## Overview behavior

Full overview should show:
- 44-node outer loop;
- four outer corner icons;
- one inner Jail icon/location;
- one inner Hospital icon/location;
- subtle visual connectors from each gate to its paired inner location;
- all occupied player markers.

The transfer connectors should look different from ordinary main-loop edges so players do not mistake them for optional shortcuts.

## HUD-safe composition

Critical path information belongs away from the four screen corners occupied by HUD cards.

The four board corner landmarks may occupy the world corners, but camera framing should offset the active token inward enough that:
- token;
- destination;
- route continuation;
- gate-to-location transfer cue
remain readable.

## Landmark working set

These are orientation anchors, not new gameplay systems:
- READY Plaza
- Job Hub landmark
- Jail / Police Station building
- M17 Mini Game landmark
- Lottery / Jackpot landmark
- Hospital building
- M39 Mini Game landmark
- return skyline / READY approach

Final art naming/theme may change without changing node IDs.

## Runtime boundary

Draft B2 is spatial design only.

Do not copy these coordinates or transfer connectors into `src/content/city/board_city_mvp.json` until the final-map implementation milestone is explicitly opened.

## Next pass

Recommended next pass: **Draft B3 visual hierarchy + corner presentation**.

B3 should define:
- relative scale of the four corner nodes;
- gate animation/readability;
- inner Jail/Hospital visual footprint;
- Lottery roll presentation;
- how close-follow camera treats each corner;
- overview icon hierarchy.
