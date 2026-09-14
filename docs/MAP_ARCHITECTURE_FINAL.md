# MeMeMe — Final Map Architecture Track

Status: **ACTIVE DESIGN TRACK / DRAFT B CURRENT / DOCUMENTATION ONLY**

Current topology source:
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_B.json`

Do **not** merge PR #1 unless Ron explicitly asks.

## Current final-board direction

The earlier Draft A interpretation was wrong: Hospital and Jail are not four-space detour branches.

Draft B now uses:

- **44 spaces on the main map loop**: `M01..M44`;
- **1 Hospital location** outside the main loop: `HOSPITAL`;
- **1 Jail location** outside the main loop: `JAIL`.

The main map therefore satisfies the requirement of **more than 40 spaces by itself**.

Hospital and Jail are special off-board locations, not ordinary dice spaces.

## How Hospital / Jail are reached

A player is sent directly to Hospital/Jail by an approved authoritative gameplay effect, such as:

- **TIN TỨC**;
- **LÁ BÀI**;
- another explicitly approved player-targeting effect.

The player does not roll through several Hospital/Jail spaces and does not choose them as a normal path branch.

Future runtime must resolve the destination on HOST and then present the move/teleport visually.

## Main-loop structure

Working count: **44 spaces**.

Stable IDs:
`M01..M44`

Canonical lap crossing:
`M44 -> M01`

READY remains the lap/salary anchor.

The exact content assignment for M41..M44 and the complete 44-space pacing distribution will be rebuilt in the next Draft B pass.

Existing useful ideas from Draft A may be retained only where compatible with this corrected topology:
- distinct city districts;
- landmark-based orientation;
- close-follow camera;
- explicit overview mode;
- four fixed corner HUDs;
- TIN TỨC / LÁ BÀI naming;
- data-driven stable node IDs.

## Hospital

`HOSPITAL` is one off-board location.

Known:
- visually separate from the main loop;
- player can be sent there by an authoritative effect;
- camera can follow/frame the location;
- it does not count as ordinary dice movement or lap distance.

Still TBD:
- stay duration;
- skipped turns;
- fees;
- recovery;
- release conditions/cards.

## Jail

`JAIL` is one off-board location.

Known:
- visually separate from the main loop;
- player can be sent there by an authoritative effect;
- camera can follow/frame the location;
- it does not count as ordinary dice movement or lap distance.

Still TBD:
- stay duration;
- skipped turns;
- bail;
- escape roll/card;
- release conditions.

## Draft A superseded

These old structures are invalid as final topology:

- `40 main + H1..H4 + J1..J4`;
- `M12 -> H1 -> H2 -> H3 -> H4 -> M13`;
- `M28 -> J1 -> J2 -> J3 -> J4 -> M29`.

Draft A/A1/A2/A3/A4/A5 remain historical design material only. Where they conflict with Draft B, **Draft B wins**.

## Camera / HUD locks retained

- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right;
- avatar + name + B$ minimum;
- active player highlighted;
- HUD fixed in screen space;
- normal camera close-follows active player;
- camera may frame Hospital/Jail when an effect sends a player there;
- full map is explicit overview only.

## Next design work

1. Rebuild content distribution for the 44-space main loop.
2. Re-audit Mini Game spacing for 44 spaces.
3. Rebuild districts/landmarks around `M01..M44`.
4. Rebuild spatial layout with one Hospital and one Jail off-map.
5. Keep Hospital/Jail stay/exit mechanics undefined until Ron explicitly approves them.
6. Do not import the final map into runtime until its own implementation milestone is opened.
