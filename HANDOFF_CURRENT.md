# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoints

### MVP 0.1.48 — validated baseline
0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated baseline artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

### MVP 0.1.50 — Final Map Preview
A dedicated **runtime preview milestone is now open** so Ron can test Draft C quickly.

This preview does **not** replace the authoritative 0.1.48 gameplay chain yet.

Read:
- `docs/MVP_0.1.50_FINAL_MAP_PREVIEW.md`
- `docs/PLAYTEST_0.1.50_FINAL_MAP_PREVIEW.md`

Runtime preview files:
- `src/content/city/board_city_final_050.json`
- `src/core/finalMapPreview050.ts`
- `src/scenes/FinalMapPreviewScene050.ts`
- `tests/final-map-preview-050.ts`

Launch:
- package: `START_FINAL_MAP_PREVIEW.bat`
- URL/dev: `?finalmap=1`

Normal `START_PLAYTEST.bat` still opens the 0.1.48 gameplay flow.

CI package name:
- `mememe-playtest-0.1.50-final-map-preview`

The full regression suite plus `test:final-map-preview` must remain green before sharing a candidate build.

## Parallel milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel.

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

Legacy inventory:
- `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

## Final map — Draft C current

Read first:
1. `docs/MAP_ARCHITECTURE_FINAL.md`
2. `docs/MAP_ARCHITECTURE_44_DRAFT_C.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_C.json`
4. `docs/MAP_VISUAL_BLUEPRINT_44_DRAFT_C1.md`
5. `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` — canonical approved combined **map + four-player HUD visual reference**
6. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
7. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.json`
8. `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_C2.md`

Do not misclassify `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` as HUD-only because of its filename. It is the approved visual reference for the city-board composition **and** four-corner HUD layout.

### Core topology
- 44 main-loop spaces `M01..M44`
- lap crossing `M44 -> M01`
- one inner `JAIL` holding location
- one inner `HOSPITAL` holding location
- Jail exit route exactly `J1 -> J2 -> J3 -> M13`
- Hospital exit route exactly `H1 -> H2 -> H3 -> M35`

### Four locked anchors
- `M01` READY
- `M12` JAIL_GATE -> JAIL
- `M23` LOTTERY -> D6 × 20 B$
- `M34` HOSPITAL_GATE -> HOSPITAL

The six branch-route spaces are not part of the 44-space main-loop count and do not create extra lap crossings.

### Jail release — approved
- roll D6 on detained player's turn
- `1 / 3 / 5` = released
- other result = remain and retry next turn

### Hospital release — approved
- roll D6 on hospitalized player's turn
- exactly `2 / 4 / 5` = released
- other result = remain and retry next turn

### Lottery — approved
- landing on `M23` triggers D6
- reward = `D6 × 20 B$`
- payouts = `20 / 40 / 60 / 80 / 100 / 120 B$`

## 0.1.50 preview boundary

The preview scene currently implements the map visually/interactively with:
- 44-space route;
- four player tokens;
- four fixed corner HUDs;
- active-player camera pan;
- Overview button;
- Jail/Hospital transfers;
- release face checks;
- Lottery x20;
- Money +/-;
- placeholder feedback for TIN TỨC / LÁ BÀI / Job / Mini Game.

Important: after a successful Jail/Hospital release roll, preview code animates through all three exit spaces and rejoins the main loop **only so the branch can be visually tested**.

That animation is not a final rule decision.

## Remaining special-location timing decision

Still intentionally TBD for authoritative integration:
- does the successful release die also count as movement through `J1..J3` / `H1..H3`;
- or does release end the turn;
- or another explicitly approved timing rule.

Do not infer this from the 0.1.50 preview animation.

## Current 44-space content pacing retained

- Job Hub: `M08`
- Mini Game: `M17 / M39` with `22 / 22` spacing
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money +: `M03 / M13 / M25 / M35`
- Money -: `M07 / M18 / M30 / M40`
- Normal/breathing: 16 spaces

## HUD / camera locks

- P1 top-left
- P2 top-right
- P3 bottom-left
- P4 bottom-right
- avatar + name + B$ minimum
- active player highlighted
- HUD fixed in screen space
- normal camera follows/pans to active token
- full map is explicit overview only

## Retained authoritative invariants from 0.1.48

Do not regress these when Final Map moves into authoritative runtime:
- Remote Roll For Order host-authoritative
- Multiplayer Job Hub host-authoritative and spectator-safe
- Job mapping `1–2 A / 3–4 B / 5–6 C`
- Starting wallet `200 B$`
- Each player completes one physical lap before final scoring
- READY pays current Job salary once per crossing and increments lap
- Mini Game payout host-system-owned and one-shot
- Nhiều ra ít bị payout `30 / 20 / 10 / 0 B$`
- Direct RPS payout `25 / 15 / 5 / 0 B$`
- four approved BGM and eight supplied SFX checksum-protected
- final podium/result-input chain unchanged
- CPU remains a QA bot

## Next priority

1. Ron playtests **0.1.50 Final Map Preview**.
2. Collect feedback on route length, camera, HUD overlap, four anchors, Jail/Hospital branches and Lottery feel.
3. Ron decides the final post-release movement timing.
4. Only then integrate Draft C into HOST-authoritative replay/checksum runtime.
5. Continue 0.1.49 Legacy Effect Audit in parallel.
6. Keep TIN TỨC / LÁ BÀI names.
7. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là validated authoritative baseline. 0.1.50 Final Map Preview đã mở để playtest riêng qua START_FINAL_MAP_PREVIEW.bat / ?finalmap=1, dùng board_city_final_050.json và FinalMapPreviewScene050. Draft C = 44 main spaces; M01 READY, M12 JAIL_GATE, M23 LOTTERY D6x20 B$, M34 HOSPITAL_GATE; JAIL có J1->J2->J3->M13; HOSPITAL có H1->H2->H3->M35. Jail release 1/3/5; Hospital exactly 2/4/5. Canonical visual reference là docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png, combined map+HUD. Preview animation sau release chỉ để test hình học, không khóa final same-turn movement. 0.1.49 Legacy Effect Audit vẫn chạy song song. Do not merge PR #1.`
