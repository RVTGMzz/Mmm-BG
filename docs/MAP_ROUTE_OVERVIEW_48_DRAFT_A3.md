# MeMeMe — Map Route + Overview Prototype Draft A3

Status: **ACTIVE DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
- `docs/MAP_VISUAL_HIERARCHY_48_DRAFT_A2.md`
- `docs/UI_FINAL_PLAYER_HUD.md`

## Goal

A3 defines how players read route direction and map orientation when the normal camera is zoomed near the active player.

It intentionally does **not** define Hospital/Jail entry rules or any new gameplay effects.

## Main-route sign language

The main loop is the strongest continuous navigation layer.

Rules:
- one continuous visual route language from `M01` through `M40` back to `M01`;
- subtle forward-direction cues may appear in road/path texture or node connectors;
- direction cues should help orientation without turning every edge into a giant arrow;
- district art may change, but the main-route connector silhouette remains consistent;
- the `M40 -> M01` READY crossing should feel like a clear lap-completion approach.

## Side-branch sign language

Hospital and Jail branches must read as attached pockets rather than alternate highways.

Recommended visual grammar:
- branch connector visually thinner/quieter than the main route;
- entry anchor has a distinct location sign/icon;
- internal branch path bends away from the main loop;
- return connector visibly points back to the next main node;
- the branch background landmark carries location identity more strongly than the individual internal nodes.

A3 does not decide when a branch is active. Future runtime UI should be capable of showing a branch gate as available/unavailable based on authoritative rules once those rules exist.

## District boundary cues

Working boundaries:

- `M08 -> M09`: D1 to D2
- `M16 -> M17`: D2 to D3
- `M24 -> M25`: D3 to D4
- `M32 -> M33`: D4 to D5
- `M40 -> M01`: D5 back to D1 / READY

Boundary cues should be environmental rather than UI-heavy:
- road/material transition;
- skyline/building-language change;
- signage/lighting shift;
- landmark silhouette appearing ahead;
- optional short district-name sting on first entry if later playtests need it.

Do not interrupt every boundary with a modal screen.

## Standard gameplay camera shot list

### Shot 1 — Turn handoff
Purpose: immediately identify whose turn begins.

Composition:
- camera glides toward active token;
- active HUD corner receives emphasis;
- local district landmark is visible when practical;
- no full-map pullback required.

### Shot 2 — Pre-roll
Purpose: show token, nearby route and immediate destination context.

Composition:
- token near central action corridor;
- next 1–2 route nodes readable;
- branch sign may be visible if physically nearby;
- four HUD corners remain unobstructed.

### Shot 3 — Movement follow
Purpose: make node-by-node travel readable and lively.

Composition:
- smooth follow with slight bias toward travel direction;
- camera should not re-center aggressively on every node;
- route ahead remains more important than scenery behind.

### Shot 4 — Landing settle
Purpose: make destination/effect ownership clear.

Composition:
- settle on token + landed node;
- one nearby continuation remains visible when practical;
- event/card/news presentation may temporarily overlay the board;
- camera does not reveal unnecessary full-board information.

### Shot 5 — Special branch pocket
Purpose: make Hospital/Jail feel like a distinct place.

Composition:
- slightly wider context than ordinary landing;
- show branch landmark plus enough internal path to understand the pocket;
- keep main-route rejoin direction legible when possible.

### Shot 6 — Major feature node
For Job Hub / Mini Game.

Composition:
- feature landmark gets stronger framing;
- gameplay overlay may take presentation priority;
- returning to board restores focus to the same authoritative token position.

### Shot 7 — Explicit overview
Purpose: orientation only.

Composition:
- fit entire graph;
- show all player positions;
- simplify art aggressively;
- special locations and READY are immediately identifiable.

### Shot 8 — Overview return
Purpose: prevent disorientation after map inspection.

Composition:
- camera transitions from overview directly back to active token;
- active HUD remains emphasized;
- local route context appears before input resumes.

## Overview map prototype

Default play should **not** keep a permanent full minimap on screen.

The explicit overview surface should show:
- main loop as the strongest continuous line;
- Hospital and Jail as two attached pockets;
- all 48 nodes as simplified dots/markers;
- READY icon;
- Job Hub icon;
- Mini Game icons at M18 and M38;
- Hospital icon;
- Jail icon;
- four player markers using their seat/avatar identity;
- active player marker emphasized;
- five district regions subtly segmented.

Do not show long TIN TỨC/LÁ BÀI text on overview.

## Overview node simplification

Recommended symbol priority:

Tier A — always iconized:
- READY
- Job Hub
- Mini Game
- Hospital
- Jail

Tier B — category dots/icons:
- TIN TỨC
- LÁ BÀI
- Money +
- Money -

Tier C — small neutral dots:
- Normal/breathing nodes
- branch internal nodes unless the player is currently inside that branch.

This keeps the overview readable at one glance.

## Four-player overview behavior

All occupied seats appear simultaneously on overview.

Seat identity stays consistent with HUD mapping:
- P1 top-left HUD identity;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right.

Overview player markers should use avatar/seat identity rather than rely on color alone.

If multiple players share the same node:
- fan/stack their overview markers slightly;
- preserve all identities;
- do not hide lower-priority players behind the active marker.

## Branch-entry future-proofing

Because entry rules are still TBD, route presentation should support these future states without redesigning the art:

- branch inactive / decorative;
- branch legal/available;
- branch forced by an authoritative effect;
- player currently inside branch;
- branch return/rejoin.

A3 defines only the visual states the UI may need. It does not define what causes them.

## District landmark visibility

At close camera scale, every district should have at least one recognizable orientation cue within a few nodes.

Working anchors:
- D1: READY Plaza
- D2: Job Hub Tower / Hospital Complex
- D3: Entertainment Dome around Mini Game M18
- D4: Civic/Jail Complex / Civic Square
- D5: Night Market Skyline / Mini Game M38 stage

The landmark does not need to be fully visible in every frame. A partial silhouette/sign is enough if it remains distinctive.

## Camera safety with four corner HUDs

Critical route information should prefer the central gameplay area.

When a destination/branch would sit under a HUD corner:
- shift camera target slightly;
- keep HUD fixed;
- never move a player HUD just to expose board art;
- preserve token + destination readability over decorative landmark framing.

## No permanent full-map dependency

A player should be able to complete a normal turn without opening overview.

Overview exists to answer broader questions such as:
- where are the other players?;
- where is READY relative to me?;
- where are major special locations?;
- what district am I in?;
- how does this branch reconnect?

Local route comprehension must come from the normal camera and board art.

## Draft A3 completion criteria

A3 is considered complete when the design has:
- main/branch route hierarchy;
- five district boundary cues;
- standard camera shot list;
- explicit overview information hierarchy;
- four-player overview marker behavior;
- future-proof branch visual states;
- HUD-safe camera rule.

These are now documented in this file.

## Next map pass

A4 board-content pacing has now been completed and approved.

Approved pacing source:
`docs/MAP_CONTENT_PACING_48_DRAFT_A4.md`

The current Mini Game anchors are M18 and M38 with exact 20/20 spacing. This remains design analysis and must not change runtime until a dedicated implementation milestone is explicitly opened.
