# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoints

### MVP 0.1.48 — validated authoritative baseline
Ron explicitly accepted 0.1.48 runtime on 2026-09-14.

Validated baseline artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress its HOST authority, replay/checksum, Job, Mini Game, audio or final-result invariants.

### MVP 0.1.50 — comparison preview
0.1.50 proved Draft C can run as a separate Final Map preview, but Ron found:
- map too linear;
- silhouette too round/oval;
- nodes too tightly packed;
- normal camera too far away.

Keep 0.1.50 available for A/B comparison:
- launcher `START_FINAL_MAP_PREVIEW.bat`
- query `?finalmap=1`

### MVP 0.1.51 — CURRENT runtime preview candidate
Read:
- `docs/MVP_0.1.51_DRAFT_D_PREVIEW.md`
- `docs/PLAYTEST_0.1.51_DRAFT_D_PREVIEW.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`

Runtime files:
- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview051.ts`
- `src/scenes/FinalMapPreviewScene051.ts`
- `tests/final-map-preview-051.ts`

Launch:
- package: `START_DRAFT_D_PREVIEW.bat`
- URL/dev: `?finalmap=2`

0.1.51 remains a **local preview**, not the authoritative multiplayer map runtime.

## Draft D current design

### Main structure retained
- 44 main spaces `M01..M44`
- `M01 READY`
- `M12 JAIL_GATE`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE`
- `TIN TỨC / LÁ BÀI` names stay locked

Canonical combined map + HUD visual reference remains:
`docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

### New normal route branching
Draft D adds three manual route decisions for preview testing:

- after M04:
  - main `M05 -> M06 -> M07 -> M08`
  - alternate `A1 -> A2 -> A3 -> M08`
- after M17:
  - main `M18 -> M19 -> M20 -> M21`
  - alternate `B1 -> B2 -> B3 -> M21`
- after M35:
  - main `M36 -> M37 -> M38 -> M39`
  - alternate `C1 -> C2 -> C3 -> M39`

Each alternate corridor currently uses the same number of steps as the main corridor. This deliberately avoids locking shortcut/risk/reward balance before Ron playtests the navigation feel.

### Draft D spatial / visual direction
- asymmetric winding-city silhouette, not an oval;
- wider node spacing;
- avoid long dense rows;
- ordinary preview nodes use rectangles;
- alternate-route preview nodes use diamonds;
- branch corridors visually separated from main path;
- rich final art remains later, current runtime environment is blockout.

## Camera / HUD current contract

0.1.51 working values:
- normal follow zoom `1.38`
- branch-decision framing `1.10`
- overview `0.55`

Rules:
- normal gameplay shows local action, not the whole board;
- at a branch, movement pauses and camera pulls back enough to show both paths;
- player manually chooses route in preview;
- after choice, camera returns to close follow;
- full map requires explicit Overview;
- P1/P2/P3/P4 HUDs remain fixed in four corners;
- HUD cards are reduced vs 0.1.50;
- avatar + name + B$ remain core information;
- active HUD is emphasized.

## Jail / Hospital / Lottery retained

### Jail
- gate M12 sends to JAIL
- release D6 succeeds on `1 / 3 / 5`
- exit geometry exactly `J1 -> J2 -> J3 -> M13`

### Hospital
- gate M34 sends to HOSPITAL
- release D6 succeeds on exactly `2 / 4 / 5`
- exit geometry exactly `H1 -> H2 -> H3 -> M35`

### Lottery
- M23
- reward `D6 × 20 B$`
- payouts `20 / 40 / 60 / 80 / 100 / 120 B$`

Post-release same-turn movement remains intentionally TBD. Preview animation through the three exit spaces is not final authoritative timing.

## Existing main-space pacing retained

- Job Hub `M08`
- Mini Game `M17 / M39`
- TIN TỨC `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money+ `M03 / M13 / M25 / M35`
- Money- `M07 / M18 / M30 / M40`

Alternate Draft D branch nodes mirror the broad content density of the main segment they replace for preview purposes.

## Parallel work

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel.

Do not rename current systems to old legacy labels. Keep:
- TIN TỨC
- LÁ BÀI

## 0.1.51 playtest priority

Ron compares 0.1.51 with 0.1.50 and reports:
1. whether route feels less linear;
2. whether spacing is comfortable;
3. whether 3 junctions are easy to understand;
4. whether 1.38× camera is close enough;
5. whether branch pullback shows enough context;
6. whether compact HUD remains readable;
7. whether rectangular/diamond node language feels better than all circles;
8. any HUD or camera obstruction.

Only after this preview is approved should Draft D move into HOST-authoritative integration.

## Retained authoritative invariants from 0.1.48

- Remote Roll For Order host-authoritative
- Multiplayer Job Hub host-authoritative and spectator-safe
- Job mapping `1–2 A / 3–4 B / 5–6 C`
- starting wallet `200 B$`
- each player completes one physical lap before final scoring
- READY salary/lap logic stays authoritative
- Mini Game payouts host-system-owned and one-shot
- final podium/result-input chain unchanged
- CPU remains QA bot
- PR #1 remains unmerged

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 là validated authoritative baseline. Current preview milestone là 0.1.51 Draft D qua START_DRAFT_D_PREVIEW.bat / ?finalmap=2. Draft D giữ 44 main spaces và 4 anchors nhưng đổi silhouette thành asymmetric winding city, spacing rộng hơn, camera gần hơn, HUD gọn hơn và thêm 3 manual route decisions: M04 main M05-M07 vs A1-A3 rejoin M08; M17 main M18-M20 vs B1-B3 rejoin M21; M35 main M36-M38 vs C1-C3 rejoin M39. Normal zoom 1.38, branch zoom 1.10, overview 0.55. Jail 1/3/5, Hospital exactly 2/4/5, Lottery D6x20 B$, Jail/Hospital exit still exactly 3 spaces. 0.1.49 Legacy Effect Audit continues in parallel. Do not merge PR #1.`
