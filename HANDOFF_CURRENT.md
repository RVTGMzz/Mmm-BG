# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

MVP 0.1.48 is **PASS** by Ron's explicit runtime acceptance on 2026-09-14.

Latest validated playable artifact remains:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

No newer runtime artifact is validated yet.

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel with final-map design.

Current names stay locked:
- **TIN TỨC**
- **LÁ BÀI**

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

Do not misclassify `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` as HUD-only because of its filename. Its actual role is the approved visual reference for the city-board composition **and** four-corner HUD layout.

### Core topology
- 44 main-loop spaces `M01..M44`
- lap crossing `M44 -> M01`
- one inner `JAIL` holding location
- one inner `HOSPITAL` holding location
- Jail exit route has exactly 3 spaces: `J1 -> J2 -> J3`
- Hospital exit route has exactly 3 spaces: `H1 -> H2 -> H3`

### Four locked anchors
- `M01` READY
- `M12` JAIL_GATE -> JAIL
- `M23` LOTTERY -> D6 × 20 B$
- `M34` HOSPITAL_GATE -> HOSPITAL

Current branch geometry:
- `M12 -> JAIL -> J1 -> J2 -> J3 -> M13`
- `M34 -> HOSPITAL -> H1 -> H2 -> H3 -> M35`

The branch route spaces are not part of the 44-space main-loop count and do not create extra lap crossings.

### Jail release — approved
- roll D6 on the detained player's turn
- `1 / 3 / 5` = released
- other result = remain and retry next turn

### Hospital release — approved
- roll D6 on the hospitalized player's turn
- exactly `2 / 4 / 5` = released
- other result = remain and retry next turn

### Lottery — approved
- landing on `M23` triggers HOST D6
- reward = `D6 × 20 B$`
- payouts = `20 / 40 / 60 / 80 / 100 / 120 B$`

## Visual direction — approved Draft C1

Use `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png` as the canonical visual reference for composition/mood:
- bright stylized city/island viewed from above
- readable pale circular route winding around the city
- landmark-heavy environment
- district signs for orientation
- fixed P1/P2/P3/P4 HUDs in four screen corners
- inner Jail/Hospital visibly connected to their gates
- central city remains readable and spacious

AI image numbering/text is never authoritative.

Known AI error to correct:
- Jail branch must be `J1 / J2 / J3`, not `J1 / J1 / J3 / J4`.

## Current 44-space content pacing retained

Draft B1 remains compatible:
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
- normal camera close-follows active token
- Jail/Hospital may get dedicated transfer/release framing
- full map is explicit overview only

## Remaining special-location timing decision

Topology is now clear, but one rule remains intentionally TBD:

After a successful Jail/Hospital release roll, does the player:
- move immediately onto/through `J1..J3` or `H1..H3` using that same roll;
- enter `J1/H1` and end the turn;
- or follow another explicitly approved timing rule?

Do not infer this until Ron decides.

## Retained runtime invariants from 0.1.48

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

## Runtime boundary

Draft C/C1/C2 are design/docs only.

Do not modify `src/content/city/board_city_mvp.json` or validated runtime until a dedicated final-map implementation milestone is explicitly opened.

Latest validated playable runtime remains 0.1.48.

## Next priority

1. Keep Draft C visual direction as current map design and use the existing PNG reference already in `docs/`.
2. Decide the post-release movement timing through the 3-space Jail/Hospital exit routes.
3. Continue 0.1.49 effect audit in parallel.
4. Keep TIN TỨC / LÁ BÀI names.
5. Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 đã PASS runtime; latest validated artifact vẫn là mememe-playtest-0.1.48 run #1441 SHA 5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c. Final map hiện là Draft C: 44 main spaces; M01 READY, M12 JAIL_GATE, M23 LOTTERY D6x20 B$, M34 HOSPITAL_GATE. JAIL nằm trong map và có lối ra J1->J2->J3->M13; HOSPITAL có H1->H2->H3->M35. Jail release 1/3/5; Hospital release exactly 2/4/5; failure retries next turn. Canonical visual reference đã có sẵn tại docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png và phải hiểu là combined map+HUD reference, không phải HUD-only. AI image numbering không authoritative; Jail branch chỉ đúng 3 ô J1/J2/J3. Post-release same-turn movement vẫn TBD. Continue 0.1.49 in parallel. Do not merge PR #1.`
