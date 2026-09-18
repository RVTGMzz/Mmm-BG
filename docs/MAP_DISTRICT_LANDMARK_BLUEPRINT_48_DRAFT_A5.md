# MeMeMe — Map District + Landmark Blueprint 48 Draft A5

Status: **ACTIVE DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on approved Draft A pacing:
- 48 playable nodes total;
- 40-node main loop;
- Mini Game anchors at M18 and M38;
- close-follow camera;
- four persistent corner HUDs.

## Goal

A5 defines how each district should feel visually distinct when only a local slice of the board is visible.

A player should be able to recognize the current district from environment, landmark silhouette and route treatment without needing permanent full-map view.

This file defines visual/world composition only. It does not add gameplay rules.

## Global composition rule

The board should feel like one connected stylized city, not five unrelated maps stitched together.

Keep consistent:
- node construction language;
- main-route connector language;
- token footprint/readability;
- route direction readability;
- overall world scale.

Change gradually by district:
- architecture;
- props;
- lighting;
- signage;
- background skyline;
- road/path material accents.

District transitions should happen over 1–2 nodes rather than through abrupt hard cuts.

## D1 — Trung tâm / READY

Nodes: `M01..M08`

### Identity
City center / opening plaza / clean daytime civic core.

### Primary landmark
**READY Plaza** near M01.

### Supporting environment
- central square;
- public clock/sign structure;
- planted pedestrian zone;
- city-entry signage;
- recognizable skyline opening.

### Visual role
D1 is the player's mental home base. The return toward M40/M01 should feel immediately recognizable even before READY itself is fully visible.

### Camera framing
- M01 may use the widest local landmark frame in normal gameplay;
- avoid placing READY signage directly beneath top-left or bottom-left HUD safe zones;
- M06 TIN TỨC should still read clearly against civic scenery.

### Transition to D2
Around M07–M09, architecture gradually shifts from civic plaza toward office/service structures.

## D2 — Sự nghiệp & Dịch vụ

Nodes: `M09..M16`

### Identity
Business/service corridor with cleaner geometry and a slightly more structured feel.

### Primary landmark
**Job Hub Tower** around M11.

### Secondary landmark
**Hospital Complex** around the H1..H4 pocket.

### Supporting environment
- office frontage;
- transport/service signs;
- clinic/service buildings;
- structured sidewalks;
- directional signs toward Job Hub and Hospital pocket.

### Visual role
Job Hub should be visible before the player reaches it, making M11 feel like an important appointment rather than a surprise icon.

Hospital should read as a distinct side location while the main road between M12 and M13 remains visually obvious.

### Camera framing
- keep Job Hub Tower slightly behind the route rather than covering nodes;
- Hospital branch gets a slightly wider frame when occupied;
- branch entrance/rejoin must stay readable without overview.

### Transition to D3
M15–M17 begins introducing brighter signage and entertainment accents.

## D3 — Giải trí & Xã hội

Nodes: `M17..M24`

### Identity
Brighter entertainment/social quarter with lively signs and more playful architecture.

### Primary landmark
**Entertainment Dome** centered around approved Mini Game node `M18`.

### Supporting environment
- stage lights;
- arcade/game-show motifs;
- café/social frontage;
- colorful signs;
- animated decorative screens where performance allows.

### Visual role
M18 is the first major party-event landmark of the lap. It should visually feel special before the player lands there.

M21 is now Money -, so it should return to normal recurring-node hierarchy rather than retaining old Mini Game landmark treatment.

### Camera framing
- M18 can receive stronger feature-node composition;
- M19 TIN TỨC remains readable immediately after the Mini Game area;
- keep route ahead toward M24 clear despite richer scenery.

### Transition to D4
M23–M25 gradually trades entertainment lighting for civic/public-infrastructure language.

## D4 — Drama & Dân sự

Nodes: `M25..M32`

### Identity
Civic/public-service quarter with stronger building mass, public signage and a slightly more serious city texture.

### Primary landmark
**Civic / Jail Complex** around the J1..J4 pocket.

### Secondary landmark
**Civic Square** near M31.

### Supporting environment
- municipal buildings;
- public notice boards;
- plaza/steps;
- transit barriers;
- civic signs;
- open space around M31/M32 for visual breathing room.

### Visual role
The Jail pocket is the district's strongest identity anchor, but it should not visually swallow the entire district.

M31 is intentionally Normal after A4, creating breathing space before the route enters D5.

### Camera framing
- M28/M29 must clearly communicate main-route continuity;
- Jail pocket may use a wider special-location shot;
- M31/M32 should provide calmer frames after the denser Jail section.

### Transition to D5
M31–M33 begins introducing night lighting, market signs and wider horizontal skyline composition.

## D5 — Đêm thành phố / Hồi vòng

Nodes: `M33..M40`

### Identity
Night-market / late-city return district with stronger horizontal skyline and a sense of approaching the end of the lap.

### Primary landmark
**Night Market Skyline** across the lower return route.

### Feature landmark
**Night Mini Game Stage** around approved Mini Game node `M38`.

### Supporting environment
- food/market stalls;
- neon or illuminated signs;
- rooftop silhouettes;
- festival/stage details near M38;
- route lighting that subtly points westward toward READY.

### Visual role
M38 is the second major party-event landmark, exactly half a lap from M18.

M40 is now TIN TỨC and sits immediately before READY crossing. It can visually act as a late-lap broadcast/news moment while the city center begins reappearing ahead.

### Camera framing
- M38 gets feature-node treatment without hiding M39/M40 route direction;
- M40 should visually foreshadow READY rather than feel like a dead end;
- READY Plaza silhouette may begin to re-enter the background as the player approaches M40.

### Transition to D1
`M40 -> M01` should visually feel like returning to the city center and completing a lap.

## Landmark priority

### Tier L1
Board-defining anchor:
- READY Plaza.

### Tier L2
Major district anchors:
- Job Hub Tower;
- Entertainment Dome;
- Civic/Jail Complex;
- Night Market Skyline.

### Tier L3
Secondary/local anchors:
- Hospital Complex;
- Civic Square;
- Night Mini Game Stage;
- smaller district signs and silhouettes.

Only one dominant L1/L2 landmark should occupy a normal close-follow frame at a time.

## Landmark visibility rhythm

Landmarks do not need to be fully visible from every node.

Preferred rhythm:
1. silhouette appears ahead;
2. landmark becomes readable near its district center;
3. player passes through/alongside it;
4. silhouette falls behind while next district identity begins appearing.

This makes movement feel like travel through a city rather than movement between isolated icons.

## HUD-safe composition

Four corner HUDs remain permanent screen-space UI.

Therefore:
- critical node icon and route continuation live near the central action corridor;
- landmark towers/signs may occupy corners, but essential interaction information may not;
- camera can offset slightly when a major node would otherwise sit beneath a HUD;
- decorative foreground must never obscure token landing positions.

## A5 world-art handoff targets

Before final-map runtime implementation, future art/mockup work should produce:
- one top-level board silhouette using A1 coordinates;
- one mood/landmark frame for each D1..D5 district;
- one Hospital pocket frame;
- one Jail pocket frame;
- one close-camera frame around M18;
- one close-camera frame around M38;
- one READY return frame around M40 -> M01.

These can be concept images first. They do not need to be runtime assets immediately.

## Open art questions

1. Final world style: playful toy-city, stylized modern city, or a hybrid?
2. How exaggerated should L2 landmarks be relative to ordinary buildings?
3. Does D5 lean more night-market, nightlife, festival, or skyline?
4. Should the Hospital/Jail pockets share the same ground material as their parent district or feel more self-contained?

None of these questions change topology.

## Runtime boundary

A5 is visual/world design only.

Current playable checkpoint remains 0.1.48. Do not implement A5 art/camera assumptions in runtime until the dedicated final-map milestone is opened.
