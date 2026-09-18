# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT C CURRENT / DOCUMENTATION ONLY**

Current source-of-truth:
- `docs/MAP_ARCHITECTURE_44_DRAFT_C.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_C.json`
- `docs/MAP_VISUAL_BLUEPRINT_44_DRAFT_C1.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
- `docs/MAP_CONTENT_PACING_44_DRAFT_B1.json`
- `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`

Do **not** merge PR #1 unless Ron explicitly asks.

## Current board structure

- **44 spaces on the main loop**: `M01..M44`.
- `M44 -> M01` remains the canonical lap/salary crossing.
- one inner `JAIL` holding location.
- one inner `HOSPITAL` holding location.
- exactly **3 Jail exit-route spaces**: `J1 -> J2 -> J3`.
- exactly **3 Hospital exit-route spaces**: `H1 -> H2 -> H3`.

The six exit-route spaces do not increase the main-loop count and do not create extra lap crossings.

## Four locked main-loop anchors

- `M01` = **READY**
- `M12` = **JAIL_GATE** -> `JAIL`
- `M23` = **LOTTERY**
- `M34` = **HOSPITAL_GATE** -> `HOSPITAL`

## Current special-location topology

Jail:

`M12 -> JAIL -> J1 -> J2 -> J3 -> M13`

Hospital:

`M34 -> HOSPITAL -> H1 -> H2 -> H3 -> M35`

Entry from `M12` / `M34` transfers the player to the inner holding location. TIN TỨC, LÁ BÀI or another approved HOST-authoritative effect may also send a player directly there.

The route shape is approved. Exact movement timing after a successful release roll is still TBD.

## Approved Jail / Hospital release rules

### JAIL
Roll one D6 on the detained player's turn.

Release on:
`1 / 3 / 5`

Failure means remain in Jail and retry next turn.

### HOSPITAL
Roll one D6 on the hospitalized player's turn.

Release on exactly:
`2 / 4 / 5`

Failure means remain in Hospital and retry next turn.

Do not convert the Hospital rule into an even-number rule.

## Approved Lottery rule

Landing on `M23 LOTTERY` triggers one HOST-authoritative D6.

Reward:
`D6 × 20 B$`

Payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`

Expected payout before later balancing: `70 B$`.

## Current 44-space content pacing

Draft B1 remains compatible with Draft C and is retained as working content placement:
- Job Hub: `M08`
- Mini Game: `M17 / M39`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 spaces

Mini Game spacing remains `22 / 22`.

## Approved visual direction — Draft C1

The current visual blueprint follows the colorful city-board concept approved by Ron:
- bright stylized island/city seen from above;
- readable pale circular path winding through the city;
- large environmental landmarks for orientation;
- fixed four-player HUDs in the four screen corners;
- district signage and icon-first special spaces;
- inner Jail and Hospital branches visibly connected to the city;
- central city area kept visually readable rather than filled edge-to-edge with route circles.

AI-generated text and numbering in concept images are **not authoritative**. Stable IDs and topology come from Draft C docs/JSON.

Important correction from the concept image:
- Jail exit is exactly `J1 / J2 / J3`.
- Do **not** reproduce the generated error `J1 / J1 / J3 / J4`.

## HUD / camera locks retained

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum
- active player emphasized
- HUD fixed in screen space
- normal camera close-follows active token
- Jail/Hospital transfer and release route may receive dedicated camera framing
- full map is explicit overview only

## Draft history

Draft A is superseded.

Draft B is superseded where it treated Jail/Hospital connectors as presentation-only paths with no playable route spaces.

Draft B1 content pacing remains retained because the 44-space main loop did not change.

## Runtime boundary

Draft C/C1 remain design/docs only.

Do not modify `src/content/city/board_city_mvp.json` or the validated runtime until a dedicated final-map implementation milestone is explicitly opened.

Latest validated playable runtime remains MVP 0.1.48.

## Remaining design gate

The only important special-location timing rule still unresolved is what a successful release roll does immediately:
- place on `J1/H1` and end turn;
- use that roll as movement distance through the exit route;
- or another explicitly approved behavior.

Do not infer it until Ron decides.

MVP 0.1.49 Legacy Effect Audit continues in parallel.
