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

## Canonical launcher roles — LOCKED

Read `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`.

### `START_PLAYTEST.bat`
- This remains the **canonical standard gameplay path / final integration target**.
- Draft D map/camera/UI work is not considered standard gameplay until intentionally integrated here.
- Do not replace this launcher with a preview launcher.

### `START_DRAFT_D_PREVIEW.bat`
- This is a **development/QA sandbox** for Draft D map, camera, spacing, branches and special-location geometry.
- It is intentionally allowed to use faster QA conveniences than standard gameplay.
- Next preview behavior should default to **AUTO BRANCH** using deterministic seeded RNG.
- It should also expose an **AUTO / MANUAL** toggle.
- MANUAL mode shows the normal `RẼ TRÁI / RẼ PHẢI` chooser.
- AUTO mode is preview convenience only and must not redefine final gameplay.

### `START_DRAFT_D_FULL_MAP.bat`
- Dedicated topology review only.
- Must fit the entire current Draft D graph into one viewport.
- No normal gameplay HUD, Roll Dice flow or follow camera.

### `START_FINAL_MAP_PREVIEW.bat`
- Legacy 0.1.50-era preview launcher.
- Keep only for historical A/B comparison when useful.
- Do not present it as a normal tester choice in future clean packages.

## Current preview milestone

### MVP 0.1.53 — Left/Right Branching + True Full Map

Status: **CI GREEN / USER PLAYTESTED OK ENOUGH TO CONTINUE**

Read first:
- `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`
- `docs/MAP_BRANCHING_RULE_D2.md`
- `docs/PLAYTEST_0.1.53_BRANCHING_FULL_MAP.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Runtime preview still uses:
- `src/content/city/board_city_final_051.json`
- `src/core/finalMapPreview052.ts`
- `src/scenes/FinalMapPreviewScene052.ts`

True full-map review scene:
- `src/scenes/FullMapReviewScene053.ts`

Regression:
- `tests/final-map-branching-053.ts`

Launch gameplay sandbox:
- `START_DRAFT_D_PREVIEW.bat`
- URL `?finalmap=3`

Launch true full-map review:
- `START_DRAFT_D_FULL_MAP.bat`
- URL `?finalmap=4`

0.1.53 CI artifact:
- `mememe-playtest-0.1.53-branching-full-map`
- run `#1734` / `34903004234`
- head SHA `555ae3d1da5fbffd4f433978f419cb7ae77d71d4`
- artifact ID `10371570469`
- SHA256 `bacab45d5c3ef0c9a7ffc6dc7d22859b5b1d069cb51ff2081440f657c8755c10`

## Left / Right branching rule — LOCKED

Canonical gameplay rule when Draft D reaches `START_PLAYTEST.bat`:
- active human player chooses **RẼ TRÁI** or **RẼ PHẢI** at a real junction;
- both routes visibly diverge;
- both always move forward in lap progress;
- neither may point backward, dead-end, or create an endless cycle;
- both merge back into a forward route before the next major section;
- current working design uses equal movement length so route choice changes content/exposure, not lap distance.

Current plans:
- node 3 / M04: left `A1` / right `M05` -> merge M08
- node 16 / M17: left `M18` / right `B1` -> merge M21
- node 34 / M35: left `C1` / right `M36` -> merge M39

Each side is exactly 4 movement steps from junction to merge.

### Preview branch QA rule

For `START_DRAFT_D_PREVIEW.bat`:
- default should be **AUTO BRANCH**;
- AUTO chooses Left/Right with deterministic seeded RNG;
- same seed must reproduce the same branch decisions;
- add a visible **AUTO / MANUAL** toggle;
- MANUAL is only for targeted route QA and shows the Left/Right chooser;
- both modes must obey the same forward-only, merge-ahead topology.

## Full-map review rule

0.1.53 uses a dedicated review scene:
- complete current Draft D topology fits into one viewport;
- no gameplay HUD;
- no Roll Dice controls;
- no follow camera;
- all three Left/Right corridors and merge points visible together;
- intended only for topology review.

## Draft D board direction

Keep:
- 44 main-loop spaces;
- asymmetric city-party silhouette;
- more breathing room between spaces;
- exactly 3 real Left/Right decision junctions;
- no dense maze and no endless wandering;
- branch routes always rejoin forward;
- gameplay camera stays close to active player;
- full map remains a separate review view.

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

## Packaging direction — LOCKED

Future clean external playtest packages should make only these roles prominent:
1. `START_PLAYTEST.bat` — standard gameplay
2. `START_DRAFT_D_PREVIEW.bat` — Draft D sandbox
3. `START_DRAFT_D_FULL_MAP.bat` — topology review

`serve-playtest.ps1` is support plumbing, not a game mode.
`START_FINAL_MAP_PREVIEW.bat` is legacy and should not be presented as a normal tester option in future clean packages.

## Parallel milestone

MVP 0.1.49 Legacy Effect Audit remains active in parallel.

Keep names:
- **TIN TỨC**
- **LÁ BÀI**

## Immediate next runtime target

Next Draft D preview build should implement the approved QA behavior:
1. AUTO BRANCH is default;
2. AUTO uses deterministic seeded RNG;
3. visible AUTO / MANUAL toggle;
4. MANUAL retains Left/Right chooser;
5. standard `START_PLAYTEST.bat` remains untouched until deliberate integration.

Do not integrate Draft D into authoritative HOST gameplay just because preview automation exists.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là validated authoritative baseline và START_PLAYTEST.bat là canonical gameplay target. Current Draft D preview milestone là 0.1.53, CI green. START_DRAFT_D_PREVIEW.bat chỉ là QA sandbox; next preview must default AUTO BRANCH using deterministic seeded RNG with an AUTO/MANUAL toggle. MANUAL shows RẼ TRÁI/RẼ PHẢI. START_DRAFT_D_FULL_MAP.bat is topology review only. START_FINAL_MAP_PREVIEW.bat is legacy and should not be a normal tester option. Three junctions are forward-only, equal-step and merge ahead. M01 READY, M12 Jail, M23 Lottery x20, M34 Hospital; Jail 1/3/5, Hospital exactly 2/4/5; each has 3 visible exit spaces. TIN TỨC / LÁ BÀI remain. Do not merge PR #1.`
