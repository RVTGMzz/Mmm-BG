# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated baseline

MVP 0.1.48 is the validated authoritative gameplay baseline.

Artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress its HOST authority, replay/checksum, Job, Mini Game, audio, movement or final-result invariants.

## Current preview milestone

### MVP 0.1.52 — Draft D UI Fix

Status: **CI GREEN / USER PLAYTEST PENDING**

Read first:
- `docs/MVP_0.1.52_DRAFT_D_UI_FIX.md`
- `docs/PLAYTEST_0.1.52_DRAFT_D_UI_FIX.md`
- `docs/MAP_DRAFT_D_PLAYTEST_FEEDBACK_0.1.51.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`

Runtime preview files:
- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview052.ts`
- `src/scenes/FinalMapPreviewScene052.ts`
- `tests/final-map-preview-052.ts`

Launch close gameplay view:
- `START_DRAFT_D_PREVIEW.bat`
- URL `?finalmap=3`

Launch persistent full-map review:
- `START_DRAFT_D_FULL_MAP.bat`
- URL `?finalmap=3&overview=1`

CI artifact:
- `mememe-playtest-0.1.52-draft-d-ui-fix`
- run `#1704` / `34896654009`
- head SHA `cf7129a054d0b82c9a97cb9aa4a8b9dd21bd602d`
- artifact ID `10368997808`
- SHA256 `bdd64be273299aa400f75782da08bb84a29462f152d42499c3d17dbee9b36081`

## 0.1.51 playtest bug and 0.1.52 fix

Ron reported that 0.1.51 looked frozen immediately after load. Root cause: HUD/controls used the same zoomed world camera. `setScrollFactor(0)` stopped scrolling but did not isolate UI from zoom, so HUD and Roll Dice were pushed/scaled outside the visible viewport.

0.1.52 fixes this with two cameras:
- world camera: board + tokens;
- UI camera: fixed screen-space HUD/controls at zoom 1.0;
- world camera ignores `uiLayer`;
- UI camera ignores world objects.

This applies to:
- four corner HUDs;
- Roll Dice;
- dice result;
- route-choice popup;
- toast;
- FULL MAP / back controls.

## Draft D camera targets

Approved working values for 0.1.52:
- active-player follow: `1.70x`;
- branch decision: `1.25x`;
- persistent full-map review: `0.50x`.

Full-map mode stays open until `TRỞ LẠI LƯỢT` is pressed. It must always show the current Draft D graph, not an older circular layout.

## Draft D board direction

Ron approved the move away from the simple round/oval board.

Keep:
- 44 main-loop spaces as current baseline;
- asymmetric city-party silhouette;
- more breathing room between spaces;
- exactly 3 real decision junctions;
- alternate lanes merge back into the main route;
- avoid a dense Mario Party copy; use branching feel without visual clutter;
- normal camera close-follows active player;
- full map is review/overview only.

Canonical combined map + HUD visual reference remains:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Do not treat AI numbering/text in that image as authoritative.

## Locked anchors and special rules

Main anchors:
- `M01 READY`
- `M12 JAIL_GATE -> JAIL`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE -> HOSPITAL`

Jail:
- inner holding location;
- release D6 `1 / 3 / 5`;
- failure: remain and retry next turn;
- visible exit route exactly `J1 -> J2 -> J3`.

Hospital:
- inner holding location;
- release D6 exactly `2 / 4 / 5`;
- failure: remain and retry next turn;
- visible exit route exactly `H1 -> H2 -> H3`.

Lottery:
- roll D6;
- reward = `D6 × 20 B$`;
- payouts `20 / 40 / 60 / 80 / 100 / 120 B$`.

Still TBD for authoritative integration:
- exact same-turn movement timing after successful Jail/Hospital release.

## Content labels and parallel work

Keep current names:
- **TIN TỨC**
- **LÁ BÀI**

MVP 0.1.49 Legacy Effect Audit remains active in parallel.

## Immediate next gate

Ron tests 0.1.52 and reports:
1. whether Roll Dice/HUD remain visible and clickable;
2. whether `1.70x` camera is close enough;
3. whether route-choice popup works;
4. whether persistent Full Map shows Draft D cleanly;
5. whether branch spacing/topology feels right.

Do not integrate Draft D into HOST-authoritative gameplay until this preview gate passes.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 là validated authoritative baseline. Current preview là 0.1.52 Draft D UI Fix, CI green, artifact mememe-playtest-0.1.52-draft-d-ui-fix run #1704 SHA cf7129a054d0b82c9a97cb9aa4a8b9dd21bd602d. Launch START_DRAFT_D_PREVIEW.bat for close view and START_DRAFT_D_FULL_MAP.bat for persistent overview. 0.1.52 fixes the 0.1.51 apparent freeze by separating world and UI cameras. Follow zoom 1.70, branch 1.25, full map 0.50. Draft D keeps 44 main spaces, 3 decision junctions, M01 READY, M12 Jail, M23 Lottery x20, M34 Hospital, Jail 1/3/5 and Hospital exactly 2/4/5, each with 3 visible exit spaces. TIN TỨC / LÁ BÀI remain. Do not merge PR #1.`
