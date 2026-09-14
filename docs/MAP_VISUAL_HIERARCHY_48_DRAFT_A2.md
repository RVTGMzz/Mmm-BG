# MeMeMe — Map Visual Hierarchy 48 Draft A2

Status: **ACTIVE DESIGN PASS / DOCUMENTATION ONLY / NOT RUNTIME**

Builds on:
- `docs/MAP_ARCHITECTURE_FINAL.md`
- `docs/MAP_ARCHITECTURE_48_DRAFT_A.json`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.md`
- `docs/MAP_SPATIAL_LAYOUT_48_DRAFT_A1.json`

## Goal

A2 defines how the 48-space board should read under a close-follow camera. The player should understand nearby route importance in under a second without needing long text or a permanent full-map view.

This is visual hierarchy only. It does not add gameplay rules.

## Node size classes

Use relative scale classes rather than fixed pixels.

### V0 — normal / breathing
Relative visual scale: `1.00x`

Used for:
- ordinary Normal nodes;
- low-attention transition nodes.

Purpose:
- keep rhythm between stronger moments;
- avoid every space competing for attention.

### V1 — recurring content
Relative visual scale: `1.08–1.12x`

Used for:
- Money + / Money -;
- TIN TỨC;
- LÁ BÀI.

Purpose:
- clearly readable icon/category language;
- still subordinate to major feature nodes.

### V2 — feature node
Relative visual scale: `1.22–1.30x`

Used for:
- Job Hub;
- Mini Game;
- Hospital branch anchor/rejoin sign nodes;
- Jail branch anchor/rejoin sign nodes.

Purpose:
- act as local route landmarks;
- remain recognizable before the token arrives.

### V3 — primary anchor
Relative visual scale: `1.35–1.50x`

Used for:
- READY;
- a future explicitly approved board-defining feature if needed.

READY is the only guaranteed V3 node in Draft A2.

## Side-branch internal nodes

`H1..H4` and `J1..J4` should remain around V0/V1 physical footprint rather than becoming four giant special tiles.

The **location environment** carries most of the Hospital/Jail identity. This prevents the branch from looking like four separate unrelated attractions.

Recommended treatment:
- compact shared floor/path material;
- repeated location icon language;
- one large background landmark for the whole pocket;
- node identity remains visible for token placement.

## Route-line hierarchy

### Main loop
- strongest continuous route line;
- visually consistent through all five districts;
- material/edge treatment may change with district, but direction continuity must stay obvious.

### Hospital/Jail branch
- visibly secondary route line;
- must look like a detour pocket, not an alternate faster highway;
- branch entrance gets a clear sign/arrow motif;
- rejoin must visually point back to the main loop.

### No invisible topology
Every traversable edge that matters to movement must have a readable visual path at close camera scale. Do not rely on the overview map to explain adjacency.

## Node category language

Final art can change colors/icons, but semantic separation must remain stable.

- **READY** — unique start/lap emblem, largest board-node identity.
- **Money +** — positive economy icon language.
- **Money -** — negative economy icon language distinct from Money + even without reading a sign.
- **TIN TỨC** — broadcast/news language.
- **LÁ BÀI** — card/hand language.
- **Mini Game** — game-show/arcade/stage language.
- **Job Hub** — career/work/service language.
- **Hospital branch** — medical/location language.
- **Jail branch** — civic/detention/location language.

Do not put long effect descriptions directly on the physical board node. Detail belongs in UI presentation.

## District art direction

These are working art directions, not final palette locks.

### D1 — Trung tâm / READY
Feel:
- civic plaza;
- welcoming daytime city core;
- clear start-of-journey architecture.

Priority:
1. READY Plaza;
2. route readability;
3. city-opening landmark silhouette.

### D2 — Sự nghiệp & Dịch vụ
Feel:
- business/services corridor;
- cleaner structural lines;
- Job Hub and Hospital visually distinct from one another.

Priority:
1. Job Hub Tower;
2. Hospital branch pocket;
3. main-route continuity across M09..M16.

### D3 — Giải trí & Xã hội
Feel:
- brighter signage;
- entertainment/stage energy;
- social/nightlife hints without becoming the full night district yet.

Priority:
1. Mini Game M21 / Entertainment Dome;
2. curved east-side route;
3. TIN TỨC / LÁ BÀI readability among richer scenery.

### D4 — Drama & Dân sự
Feel:
- civic infrastructure mixed with louder public drama;
- stronger structural massing around Jail;
- second Mini Game landmark keeps the district from becoming visually monotone.

Priority:
1. Jail branch silhouette;
2. M28/M29 main-route anchors;
3. M31 Mini Game stage;
4. clear descent toward D5.

### D5 — Đêm thành phố / Hồi vòng
Feel:
- night market / skyline / late-lap atmosphere;
- longer horizontal breathing composition;
- visual pull back toward READY.

Priority:
1. route direction;
2. skyline/night-market identity;
3. anticipation of READY return.

## Landmark priority tiers

### L1 — board anchor
- READY Plaza.

### L2 — district anchor
- Job Hub Tower;
- Entertainment Dome;
- Civic/Jail Complex;
- Night Market Skyline.

### L3 — secondary/local anchor
- Hospital Complex;
- East Mini Game Stage;
- smaller decorative district cues.

Only one L1/L2 landmark should dominate a normal close-follow frame at a time. Avoid two giant landmarks fighting behind the active token.

## HUD-safe visual hierarchy

The four corner HUDs have permanent priority over scenery.

At normal gameplay framing:
- active token belongs near the central action corridor;
- destination and immediate continuation should remain readable without looking into a HUD corner;
- branch signage should prefer center-left/center-right zones rather than extreme top/bottom corners;
- decorative landmark peaks/signs may enter corner areas, but critical icons may not.

When a camera target would place a critical node under a HUD, presentation may offset the camera target slightly instead of moving the HUD.

## Token readability

Final board art must reserve a clean token footprint around every node.

Requirements:
- token silhouette remains distinct from the node icon;
- multiple tokens on nearby nodes remain separable;
- branch pocket art does not hide tokens behind building foregrounds;
- landing highlight may temporarily overpower decorative effects;
- selected/active token visual emphasis should not be confused with tile category color.

## Overview / minimap language

Overview should simplify rather than reproduce final art.

Recommended representation:
- main loop as one strong line;
- Hospital/Jail as two clearly attached pockets;
- node dots use category markers but minimal/no text;
- active player position highlighted;
- READY, Job Hub, Mini Game, Hospital, Jail may receive landmark icons;
- district boundaries may use subtle background segmentation.

The overview is for orientation, not for reading card/news rules.

## Camera transition language between districts

Do not hard-cut at every district boundary.

Recommended behavior for future runtime implementation:
- normal movement remains smooth continuous follow;
- environmental change becomes visible naturally over several nodes;
- strong establishing nudge may occur only when entering a major special location/branch;
- landing camera settles instead of constantly zooming in/out every node;
- overview-to-player transition should clearly return focus to the active token.

Exact tween duration/easing remains runtime tuning work.

## Draft A2 review questions

1. Is the four-tier node hierarchy visually strong enough, or should Money nodes remain V0 while only TIN TỨC/LÁ BÀI use V1?
2. Should M31 remain a second Mini Game landmark in D4?
3. Does D5 need one additional non-gameplay landmark near M39/M40 to foreshadow READY?
4. Should Hospital be L2 rather than L3 once its gameplay rules are known?
5. Does the final art want a more playful toy-city look or a more coherent stylized city look? This affects materials, not topology.

## Runtime boundary

A2 is not permission to edit runtime board data.

The current playable checkpoint remains 0.1.48 until a later milestone explicitly implements and validates the final map.
