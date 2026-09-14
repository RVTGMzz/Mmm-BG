# MeMeMe — Map Camera + Mockup Production Brief 44 Draft B5

Status: **CURRENT DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on Draft B through B4.

## Goal

Define the minimum visual-reference set required before final-map runtime implementation.

The purpose of these mockups is to validate:
- board readability under the close-follow camera;
- four fixed HUD safe zones;
- four-corner identity;
- gate-to-singleton Jail/Hospital logic;
- landmark scale;
- overview comprehension.

They are not final production art.

## Required mockup set

### MOCK-01 — Full board overview

Must show:
- all 44 main-loop nodes;
- four corner anchors;
- one inner JAIL;
- one inner HOSPITAL;
- subtle gate-to-location transfer connectors;
- Job Hub M08;
- Mini Game M17;
- Mini Game M39;
- four player markers in different positions.

Must prove:
- the main loop reads instantly;
- Jail/Hospital cannot be mistaken for multi-space routes;
- four quarters feel balanced.

### MOCK-02 — Normal close-follow gameplay frame

Focus:
- one ordinary mid-route node;
- active token;
- next 1–2 nodes;
- all four player HUD cards visible in screen corners.

Must prove:
- route and token remain readable at normal zoom;
- HUD does not cover critical board information;
- scenery supports rather than overwhelms the path.

### MOCK-03 — READY corner

Focus:
- M01 READY;
- incoming M44 approach;
- outgoing M02 route;
- READY Plaza landmark.

Must prove:
- start/lap anchor is instantly recognizable;
- salary/lap presentation has enough screen space;
- return-to-READY direction reads clearly.

### MOCK-04 — JAIL_GATE transfer

Focus:
- M12 JAIL_GATE;
- inner JAIL location;
- visual transfer spur between them.

Must prove:
- M12 is clearly a trigger/gate;
- JAIL is clearly a separate singleton location;
- spur does not look like a selectable dice path.

### MOCK-05 — Player turn while in JAIL

Focus:
- player token parked at JAIL;
- dedicated D6 release-roll presentation;
- compact HUD Jail badge.

Must communicate approved success faces:
`1 / 3 / 5`.

Must not imply:
- bail;
- extra punishment;
- a chain of cells/spaces;
- post-release movement rule, which remains TBD.

### MOCK-06 — LOTTERY corner

Focus:
- M23 LOTTERY;
- dedicated jackpot landmark;
- D6 roll result;
- reward result presentation.

Formula displayed in UI:
`D6 × 20 B$`.

Must prove:
- Lottery feels more special than Money+;
- payout presentation is quick and readable;
- board route remains visible after the result.

### MOCK-07 — HOSPITAL_GATE transfer

Focus:
- M34 HOSPITAL_GATE;
- inner HOSPITAL location;
- visual transfer spur.

Must prove:
- gate and Hospital are visually distinct;
- transfer is direct, not a sequence of movement spaces.

### MOCK-08 — Player turn while in HOSPITAL

Focus:
- token parked at HOSPITAL;
- dedicated release-roll presentation;
- compact Hospital badge on HUD.

Must communicate approved success faces exactly:
`2 / 4 / 5`.

Do not depict an even-only rule.

### MOCK-09 — Mini Game landmark frame

Produce one base composition that can validate both M17 and M39 variants.

Must show:
- V2 feature-node scale;
- local landmark;
- token landing;
- transition space for Mini Game overlay;
- four HUDs remain stable.

If the two quarters eventually have very different art direction, split this into MOCK-09A M17 and MOCK-09B M39.

## Optional mockups

### MOCK-10 — Explicit overview UI
Useful if the normal full-board overview differs substantially from the clean architecture mockup.

### MOCK-11 — Multiplayer token stack
Show two or more players sharing/occupying very close nodes or the same singleton location.

Purpose:
- verify avatar/token separation;
- verify Jail/Hospital token parking spots.

## Reference resolution strategy

Use landscape composition first.

Mockups should preserve a central safe gameplay corridor and four corner HUD safe areas rather than optimizing for one exact pixel resolution.

Recommended composition target for references:
- 16:9 landscape;
- enough margin to test HUD corners;
- do not bake final text sizes into board art.

## Mockup naming convention

Recommended names:
- `MEMEME_MAP_MOCK_01_OVERVIEW_V1.png`
- `MEMEME_MAP_MOCK_02_CLOSE_FOLLOW_V1.png`
- `MEMEME_MAP_MOCK_03_READY_V1.png`
- `MEMEME_MAP_MOCK_04_JAIL_GATE_V1.png`
- `MEMEME_MAP_MOCK_05_JAIL_TURN_V1.png`
- `MEMEME_MAP_MOCK_06_LOTTERY_V1.png`
- `MEMEME_MAP_MOCK_07_HOSPITAL_GATE_V1.png`
- `MEMEME_MAP_MOCK_08_HOSPITAL_TURN_V1.png`
- `MEMEME_MAP_MOCK_09_MINIGAME_V1.png`

Store temporary concept references under:
`docs/reference/map/`

Once runtime art/screenshots replace a concept image, the temporary concept PNG may be deleted from the active branch while the textual contract remains.

## Acceptance checklist

Before map runtime implementation begins, the visual references should prove:
- 44-node route readability;
- four corners are visually memorable;
- JAIL/HOSPITAL singleton logic is visually obvious;
- TIN TỨC/LÁ BÀI/Money remain category-readable;
- active token survives rich scenery;
- all four HUDs coexist with close-follow camera;
- overview explains topology without being required for every turn.

## Runtime boundary

B5 is a production/reference brief only.

Do not interpret mockup approval as permission to modify validated 0.1.48 runtime. Final-map implementation still needs its own explicit runtime milestone.
