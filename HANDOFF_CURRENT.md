# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated authoritative baseline

MVP 0.1.48 remains the validated authoritative gameplay baseline.

Artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress HOST authority, replay/checksum, Job, Mini Game, audio, movement, or final-result invariants from 0.1.48.

## Current preview milestone

### MVP 0.1.53 — Left/Right Branching + True Full Map

Status: **CI GREEN / USER PLAYTEST NEXT**

Read first:
- `docs/MAP_BRANCHING_RULE_D2.md`
- `docs/PLAYTEST_0.1.53_BRANCHING_FULL_MAP.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Runtime preview still uses:
- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview052.ts`
- `src/scenes/FinalMapPreviewScene052.ts`

New full-map review scene:
- `src/scenes/FullMapReviewScene053.ts`

Regression:
- `tests/final-map-branching-053.ts`

Launch gameplay preview:
- `START_DRAFT_D_PREVIEW.bat`
- URL `?finalmap=3`

Launch **true full-map review**:
- `START_DRAFT_D_FULL_MAP.bat`
- URL `?finalmap=4`

0.1.53 CI artifact:
- `mememe-playtest-0.1.53-branching-full-map`
- run `#1734` / `34903004234`
- head SHA `555ae3d1da5fbffd4f433978f419cb7ae77d71d4`
- artifact ID `10371570469`
- SHA256 `bacab45d5c3ef0c9a7ffc6dc7d22859b5b1d069cb51ff2081440f657c8755c10`

## Left / Right branching rule — locked working design

At each Draft D junction, the active player chooses:
- **RẼ TRÁI**
- **RẼ PHẢI**

Both choices:
- visibly diverge;
- always move forward in lap progress;
- never point backward;
- never create a branch cycle;
- merge back into the forward route before the next major section;
- currently use equal movement length so the choice changes content/exposure, not lap distance.

Current plans:
- node 3 / M04: left `A1` / right `M05` -> merge M08
- node 16 / M17: left `M18` / right `B1` -> merge M21
- node 34 / M35: left `C1` / right `M36` -> merge M39

Each side is exactly 4 movement steps from junction to merge.

The player therefore cannot get lost or loop endlessly. After merge, movement continues toward READY and the next physical lap crossing.

## Full-map review rule

0.1.52's full-map launcher reused the gameplay scene and felt too similar to normal Draft D play.

0.1.53 replaces that launcher behavior with a dedicated review scene:
- fits the complete current Draft D topology into one viewport;
- no gameplay HUD;
- no Roll Dice controls;
- no follow camera;
- shows all three left/right corridors and merge points together;
- intended only for topology review.

Gameplay preview remains close-follow and keeps the fixed four-corner HUD/UI-camera fix from 0.1.52.

## Draft D board direction

Keep:
- 44 main-loop spaces;
- asymmetric city-party silhouette;
- more breathing room between spaces;
- exactly 3 real left/right decision junctions;
- no dense maze and no endless wandering;
- branch routes must rejoin forward;
- gameplay camera stays close to active player;
- full map is a separate review view.

Canonical combined map + HUD reference:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Do not treat AI numbering/text in the reference as authoritative.

## Locked anchors and special rules

- `M01 READY`
- `M12 JAIL_GATE -> JAIL`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE -> HOSPITAL`

Jail:
- release on D6 `1 / 3 / 5`;
- failure stays detained and retries next turn;
- visible exit route exactly `J1 -> J2 -> J3`.

Hospital:
- release on D6 exactly `2 / 4 / 5`;
- failure stays hospitalized and retries next turn;
- visible exit route exactly `H1 -> H2 -> H3`.

Lottery:
- D6 × 20 B$;
- payouts `20 / 40 / 60 / 80 / 100 / 120 B$`.

Still TBD for authoritative integration:
- exact same-turn movement timing after successful Jail/Hospital release.

## Parallel milestone

MVP 0.1.49 Legacy Effect Audit remains active in parallel.

Keep names:
- **TIN TỨC**
- **LÁ BÀI**

## Immediate next gate

Ron tests 0.1.53 and reports:
1. whether FULL MAP truly shows the complete Draft D topology comfortably;
2. whether left/right choices are visually obvious;
3. whether both routes feel different while still clearly progressing forward;
4. whether any merge point feels confusing;
5. whether gameplay close-follow camera/HUD remains usable.

Do not integrate Draft D into authoritative HOST gameplay until this preview gate passes.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là validated authoritative baseline. Current preview là 0.1.53 Left/Right Branching + True Full Map, CI green, artifact mememe-playtest-0.1.53-branching-full-map run #1734 SHA 555ae3d1da5fbffd4f433978f419cb7ae77d71d4. Gameplay = START_DRAFT_D_PREVIEW.bat / ?finalmap=3. True full map = START_DRAFT_D_FULL_MAP.bat / ?finalmap=4 using FullMapReviewScene053. Three junctions now use RẼ TRÁI / RẼ PHẢI; both choices are equal-step, forward-only, cycle-free and merge ahead. M01 READY, M12 Jail, M23 Lottery x20, M34 Hospital; Jail 1/3/5, Hospital exactly 2/4/5; each has 3 visible exit spaces. TIN TỨC / LÁ BÀI remain. Do not merge PR #1.`
