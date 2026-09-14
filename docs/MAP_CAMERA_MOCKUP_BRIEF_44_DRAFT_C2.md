# MeMeMe — Map Camera + Mockup Brief 44 Draft C2

Status: **CURRENT VISUAL PRODUCTION BRIEF / DOCUMENTATION ONLY**

Builds on Draft C topology and Draft C1 visual direction.

## Goal

Validate the approved colorful city-board direction under real gameplay framing before runtime implementation.

## MOCK-01 — Full overview

Must show:
- all 44 main-loop nodes;
- M01 READY;
- M12 JAIL_GATE;
- M23 LOTTERY;
- M34 HOSPITAL_GATE;
- inner JAIL;
- `J1 -> J2 -> J3` exit route;
- inner HOSPITAL;
- `H1 -> H2 -> H3` exit route;
- Job Hub M08;
- Mini Game M17 and M39;
- four player markers;
- district landmarks/signage.

The concept must make the main route obvious at a glance even with rich scenery.

## MOCK-02 — Normal close-follow

Show:
- active token;
- current node plus roughly 2–4 nearby route spaces;
- one nearby landmark for orientation;
- all four HUD cards fixed in screen corners.

The map should feel dense and alive without hiding the route.

## MOCK-03 — READY

Focus on M01 and the M44 -> M01 -> M02 flow.

READY should read as a major landmark, not an ordinary white circle.

## MOCK-04 — Jail Gate + branch overview

Show:
- M12 JAIL_GATE;
- inner JAIL building/location;
- exit route `J1 / J2 / J3`;
- rejoin toward M13.

Must prove that:
- M12 is the entry trigger;
- JAIL is the holding location;
- there are exactly 3 exit-route spaces;
- the AI-concept error `J1 / J1 / J3 / J4` is not reproduced.

## MOCK-05 — Jail turn

Show player parked at JAIL with release-roll UI.

Success faces:
`1 / 3 / 5`.

Do not visually imply post-release timing semantics that have not been approved yet.

## MOCK-06 — Lottery

Show M23 LOTTERY with a distinct jackpot landmark and quick reward presentation.

Formula:
`D6 × 20 B$`.

## MOCK-07 — Hospital Gate + branch overview

Show:
- M34 HOSPITAL_GATE;
- inner HOSPITAL;
- exit route `H1 / H2 / H3`;
- rejoin toward M35.

## MOCK-08 — Hospital turn

Show player parked at HOSPITAL with release-roll UI.

Success faces exactly:
`2 / 4 / 5`.

## MOCK-09 — Mini Game feature

Use M17 or M39 and prove:
- V2 feature node scale;
- nearby scenery;
- transition space for Mini Game overlay;
- four HUDs remain stable.

## Visual language

Use Draft C1 direction:
- colorful stylized city/island;
- top-down/three-quarter aerial presentation;
- pale route circles;
- icon/color-first special spaces;
- larger landmarks/buildings;
- district signs;
- central space not overcrowded;
- four fixed HUDs.

## Reference-image rules

Concept image text, duplicated node numbers and AI geometry mistakes are not data.

Authoritative design comes from Draft C IDs/JSON.

Temporary reference images should live under:
`docs/reference/map/`

Recommended current overview filename:
`MEMEME_MAP_REFERENCE_CITY_DRAFT_C_V1.png`

## Runtime boundary

C2 is reference/design only.

Do not modify validated 0.1.48 runtime until a dedicated final-map implementation milestone is explicitly opened.
