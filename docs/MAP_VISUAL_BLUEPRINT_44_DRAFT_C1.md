# MeMeMe — Map Visual Blueprint Draft C1

Status: **APPROVED VISUAL DIRECTION / DOCUMENTATION ONLY**

Canonical approved visual reference already stored in this branch:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Despite the filename emphasizing HUD, this PNG is the approved **combined board + four-player HUD visual reference** and must be treated as the primary visual reference for Draft C/C1.

This blueprint follows the colorful city-board concept approved by Ron on 2026-09-14.

## Core look

- landscape 3:2-ish overview composition for concept/reference;
- bright stylized island/city viewed from above;
- saturated but readable palette;
- pale circular route spaces connected by a light path;
- environmental landmarks are larger than ordinary spaces;
- central city remains open enough to read as a place, not a carpet of tiles;
- the map should feel like a lively party-game city rather than a flat spreadsheet-board.

## HUD composition

Four player HUDs remain fixed in screen space:
- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right.

Each HUD must retain at least:
- avatar;
- player name;
- B$;
- compact status indicators as needed.

The world camera moves independently underneath the HUD.

## Main route

- 44 authoritative main-loop nodes `M01..M44`;
- route should snake naturally around the city instead of forming a rigid rectangle;
- ordinary nodes use restrained neutral treatment;
- special nodes use icon/color first and text second;
- nearby scenery should help identify quarters while camera is zoomed in.

## Special-location composition

### Jail / Police Station
- one inner Jail/Police Station building/location;
- `M12 JAIL_GATE` on the main route sends the player into `JAIL`;
- exit route must contain exactly **3 spaces**: `J1 -> J2 -> J3 -> M13`;
- concept-image error `J1 / J1 / J3 / J4` is invalid and must not be reproduced.

### Hospital
- one inner Hospital building/location;
- `M34 HOSPITAL_GATE` sends the player into `HOSPITAL`;
- exit route contains exactly **3 spaces**: `H1 -> H2 -> H3 -> M35`.

Both branches should visually feel tucked inside the main loop, connected to the city rather than floating as separate mini-boards.

## Four board anchors

Keep the four strong anchors in authoritative design:
- `M01 READY`
- `M12 JAIL_GATE`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE`

Their exact art placement may bend slightly for composition, but their gameplay identity and stable IDs do not change.

## District / landmark language

Use district signage and landmark silhouettes similar in spirit to the approved concept:
- career/jobs district;
- shopping/life district;
- drama/entertainment district;
- special/odd-events district;
- central-city landmark area.

Names shown in concept art are working art labels unless separately approved as localization copy.

## Special node language

Recommended icon-first families:
- neutral ordinary space;
- money gain/loss;
- LÁ BÀI;
- TIN TỨC;
- Mini Game;
- Job Hub;
- relationship/social effect if later retained;
- shopping/store if later retained;
- rare/special space.

Do not copy accidental AI-generated duplicates or numbering errors into data.

## Camera relationship

Normal gameplay:
- close-follow active token;
- show enough nearby route and landmark context to orient the player;
- HUD remains fixed;
- special transfer to Jail/Hospital gets a short camera pan/settle;
- full-board overview remains explicit, not the default camera.

## Production note

The approved concept image at `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` is a **visual reference, not a production sprite sheet**. It defines composition, mood, density, district readability, four-corner HUD composition and special-branch presentation.

Stable IDs, topology and gameplay data come from Draft C documents, never from text/numbers rendered by an AI image.
