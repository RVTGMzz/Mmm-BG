# MeMeMe — MVP 0.1.52 Draft D UI Fix

Status: **CI GREEN / USER PLAYTEST PENDING**

## Why this exists
0.1.51 successfully introduced the Draft D branching board, but the first real playtest exposed a presentation blocker: world-camera zoom also affected the screen HUD and controls, pushing the Roll Dice button and player HUDs out of the visible viewport.

0.1.52 fixes that blocker and makes full-map review easier.

## Runtime changes
- New scene: `src/scenes/FinalMapPreviewScene052.ts`
- New constants/helper wrapper: `src/core/finalMapPreview052.ts`
- Reuses current Draft D graph: `src/content/city/board_city_final_051.json`
- Direct route: `?finalmap=3`

## Fixed UI architecture
- Dedicated world camera for board/tokens.
- Dedicated UI camera locked at `1.0x`.
- Main world camera ignores `uiLayer`.
- UI camera ignores world objects.
- Four player HUDs, Roll Dice, route chooser, toast, Full Map and Menu controls remain screen-space at any world zoom.

## Camera tuning
- normal active-player follow: `1.70x`
- branch decision framing: `1.25x`
- full map: `0.50x`

## Full-map review
- `FULL MAP` is persistent.
- It does not auto-return after a timer.
- Button changes to `TRỞ LẠI LƯỢT`.
- Dedicated launcher: `START_DRAFT_D_FULL_MAP.bat`
- Direct URL: `?finalmap=3&overview=1`

## Retained Draft D rules
- 44 main-loop spaces.
- 3 decision junctions.
- Jail/Hospital release rules unchanged.
- Lottery remains D6 × 20 B$.
- 0.1.48 remains the validated authoritative gameplay baseline.

## Tests
- `tests/final-map-preview-052.ts`
- Full existing regression suite remains active.

## CI artifact
- `mememe-playtest-0.1.52-draft-d-ui-fix`
- run `#1704` / `34896654009`
- head SHA `cf7129a054d0b82c9a97cb9aa4a8b9dd21bd602d`
- artifact ID `10368997808`
- SHA256 `bdd64be273299aa400f75782da08bb84a29462f152d42499c3d17dbee9b36081`

## Playtest gate
Ron should verify:
1. HUD and Roll Dice remain visible/clickable at close zoom.
2. camera distance feels right at 1.70x;
3. route-choice popup is clickable;
4. Full Map shows the current Draft D topology and stays open;
5. branch geometry remains readable.
