# MeMeMe — Latest Handoff

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Runtime checkpoint

0.1.48 is runtime **PASS** by Ron's explicit acceptance on 2026-09-14.

Latest validated playable artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

## Current milestone

**MVP 0.1.49 — Legacy Effect Audit** remains active in parallel with final-map design.

Current names remain:
- **TIN TỨC**
- **LÁ BÀI**

## Final map source-of-truth — Draft C

Read:
1. `HANDOFF_CURRENT.md`
2. `docs/MAP_ARCHITECTURE_FINAL.md`
3. `docs/MAP_ARCHITECTURE_44_DRAFT_C.md`
4. `docs/MAP_ARCHITECTURE_44_DRAFT_C.json`
5. `docs/MAP_VISUAL_BLUEPRINT_44_DRAFT_C1.md`
6. `docs/MAP_CONTENT_PACING_44_DRAFT_B1.md`
7. `docs/MAP_CAMERA_MOCKUP_BRIEF_44_DRAFT_B5.md`
8. `docs/MVP_0.1.49_LEGACY_EFFECT_AUDIT.md`
9. `docs/LEGACY_EFFECT_INVENTORY_0.1.49.md`

## Current locked structure

- 44 main-loop spaces `M01..M44`
- lap crossing `M44 -> M01`
- one inner `JAIL`
- one inner `HOSPITAL`
- Jail exit route: exactly `J1 -> J2 -> J3`
- Hospital exit route: exactly `H1 -> H2 -> H3`

Four anchors:
- `M01 READY`
- `M12 JAIL_GATE -> JAIL`
- `M23 LOTTERY -> D6 × 20 B$`
- `M34 HOSPITAL_GATE -> HOSPITAL`

Branch geometry:
- `M12 -> JAIL -> J1 -> J2 -> J3 -> M13`
- `M34 -> HOSPITAL -> H1 -> H2 -> H3 -> M35`

The six branch spaces do not count toward the 44-space main loop or create extra lap crossings.

## Approved release rules

Jail:
- D6 `1 / 3 / 5` = release
- failure = remain and retry next turn

Hospital:
- D6 exactly `2 / 4 / 5` = release
- failure = remain and retry next turn

Still TBD:
- exact same-turn behavior after successful release through the 3-space exit route.

## Lottery

Payouts:
`20 / 40 / 60 / 80 / 100 / 120 B$`.

## Current 44-space content pacing

Draft B1 remains retained because the main loop stayed at 44 spaces:
- Job Hub `M08`
- Mini Game `M17 / M39`, exact `22 / 22`
- TIN TỨC `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money+ `M03 / M13 / M25 / M35`
- Money- `M07 / M18 / M30 / M40`
- 16 Normal spaces

## Approved visual direction — Draft C1

Use the colorful stylized city/island concept approved by Ron:
- top-down lively city board;
- readable pale circular route;
- large landmarks and district signs;
- four fixed player HUDs;
- inner Jail/Hospital branches;
- central city remains readable;
- AI-generated numbering/text is not authoritative.

Known concept correction:
- Jail exit is exactly `J1 / J2 / J3`, not the generated `J1 / J1 / J3 / J4`.

## Runtime boundary

Draft C/C1 are still design/docs only.

Current playable runtime remains 0.1.48. Do not import final-map data into runtime until its own explicit implementation milestone is opened.

## Next priority

1. Keep Draft C/C1 as current final-map design.
2. Decide post-release movement timing through the 3-space Jail/Hospital exit routes.
3. Continue 0.1.49 effect audit.
4. Keep TIN TỨC / LÁ BÀI.
5. Do not merge PR #1.
