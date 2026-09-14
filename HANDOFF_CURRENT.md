# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated authoritative baseline

MVP 0.1.48 remains the validated HOST-authoritative gameplay baseline.

Artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5d894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress HOST authority, replay/checksum, Job, Mini Game, audio, movement, or final-result invariants from 0.1.48.

## Current preview milestone

### MVP 0.1.54 — AUTO BRANCH Sandbox

Status: **CI GREEN / PLAYTEST PACKAGE READY**

Read first:
- `docs/MVP_0.1.54_AUTO_BRANCH_SANDBOX.md`
- `docs/PLAYTEST_0.1.54_AUTO_BRANCH_SANDBOX.md`
- `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`
- `docs/MAP_BRANCHING_RULE_D2.md`
- `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
- `docs/GAME_DESIGN_CURRENT.md`

Runtime additions:
- `src/core/previewBranchMode054.ts`
- `src/scenes/installPreviewBranchMode054.ts`
- `tests/preview-branch-mode-054.ts`

0.1.54 CI artifact:
- artifact: `mememe-playtest-0.1.54-auto-branch-sandbox`
- run `#1776` / `34904669825`
- build head SHA `54be2d5dae2eb8a386a5bb56fb74edabeff7ddc2`
- artifact ID `10371682282`
- size `8,577,128 bytes`
- SHA256 `7ec5a1090e81cf1aef35543c1a3f0c32f6285b8e84be2834e278fe0a3eceeeac`

## Launcher roles — LOCKED

### `START_PLAYTEST.bat`
- Standard/canonical gameplay launcher.
- Final integration target for Draft D.
- Preview behavior must never silently replace this flow.

### `START_DRAFT_D_PREVIEW.bat`
- QA sandbox only.
- 0.1.54 default URL uses `finalmap=3&seed=5454&branch=auto`.
- AUTO BRANCH chooses Left/Right without stopping the tester.
- Branch RNG is deterministic and derived from the preview seed.
- Same seed reproduces the same branch sequence.
- Fixed HUD toggle switches `NHÁNH: AUTO` / `NHÁNH: THỦ CÔNG`.
- MANUAL mode shows normal `RẼ TRÁI / RẼ PHẢI` chooser.

### `START_DRAFT_D_FULL_MAP.bat`
- Topology review only.
- Dedicated full-map scene, no normal gameplay flow.

### Legacy launcher
- `START_FINAL_MAP_PREVIEW.bat` was removed from `public/` in 0.1.54.
- CI/package validation must fail if it reappears in tester packages.

Expected tester package launchers are exactly:
1. `START_PLAYTEST.bat`
2. `START_DRAFT_D_PREVIEW.bat`
3. `START_DRAFT_D_FULL_MAP.bat`

## Draft D topology — LOCKED WORKING DESIGN

- 44 main spaces.
- Asymmetric city-party layout, not a simple oval.
- Three real branch junctions.
- Every Left/Right route moves forward and rejoins ahead.
- No backward traps, cycles, dead ends, or endless wandering.
- Current split-to-merge distance is equal on both choices.

Junctions:
- M04: left `A1`, right `M05`, merge M08
- M17: left `M18`, right `B1`, merge M21
- M35: left `C1`, right `M36`, merge M39

Canonical gameplay rule after integration:
- human active player chooses **RẼ TRÁI / RẼ PHẢI**;
- route choice must be HOST-authoritative.

## Locked anchors and special rules

- `M01 READY`
- `M12 JAIL_GATE -> JAIL`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE -> HOSPITAL`

Jail:
- release D6 `1 / 3 / 5`;
- failure ends the turn and retries next turn;
- exit path `J1 -> J2 -> J3 -> M13`.

Hospital:
- release D6 exactly `2 / 4 / 5`;
- failure ends the turn and retries next turn;
- exit path `H1 -> H2 -> H3 -> M35`.

Successful Jail/Hospital release timing is now **LOCKED**:
- traverse the three visible exit spaces;
- then take a **fresh movement D6 roll in the same turn**;
- do not reuse the release die as movement distance.

Lottery:
- roll D6;
- reward = `D6 × 20 B$`;
- payouts `20 / 40 / 60 / 80 / 100 / 120 B$`.

Keep labels:
- **TIN TỨC**
- **LÁ BÀI**

Canonical combined visual reference:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Do not treat AI numbering/text in the reference as authoritative.

## Gameplay upgrade roadmap

Read `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`.

Current sequence:
- 0.1.54 = close sandbox loop with AUTO/MANUAL QA branch mode — **DONE / CI GREEN**
- 0.1.55 = integrate Draft D into standard HOST-authoritative `START_PLAYTEST.bat`
- 0.1.56 = give branches gameplay identity
- 0.1.57 = complete Jail/Hospital/Lottery authoritative integration
- 0.1.58 = deepen TIN TỨC / LÁ BÀI player interaction
- 0.1.59 = deepen Job/Mini Game/function spaces
- 0.1.60 = real match pacing/economy playtest

0.1.49 Legacy Effect Audit remains active in parallel and feeds later TIN TỨC / LÁ BÀI work.

## Immediate next runtime target — 0.1.55

Integrate Draft D into the real `START_PLAYTEST.bat` match flow without losing 0.1.48 invariants.

Target end-to-end chain:

`Roll For Order -> Job -> Draft D movement -> HOST-authoritative Left/Right choice -> TIN TỨC/LÁ BÀI/Mini Game -> Jail/Hospital/Lottery -> READY lap -> final result`

Key requirements:
- route choice becomes a real authoritative player intent;
- replay/checksum remains deterministic;
- multiplayer/spectator parity remains intact;
- Job/Mini Game/payout/audio/final-result behavior stays intact;
- successful Jail/Hospital release gets a fresh movement roll in the same turn.

Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là validated authoritative baseline. 0.1.54 AUTO BRANCH Sandbox đã CI green, artifact mememe-playtest-0.1.54-auto-branch-sandbox run #1776 SHA 54be2d5dae2eb8a386a5bb56fb74edabeff7ddc2 artifact 10371682282 SHA256 7ec5a1090e81cf1aef35543c1a3f0c32f6285b8e84be2834e278fe0a3eceeeac. START_PLAYTEST.bat là canonical gameplay target. Draft D preview mặc định AUTO branch seed 5454, có AUTO/MANUAL toggle. Full Map là review only. Legacy START_FINAL_MAP_PREVIEW.bat đã bỏ khỏi package. Draft D có 44 main spaces, 3 forward-only equal-step junctions. Jail 1/3/5, Hospital exactly 2/4/5, Lottery D6×20. Release success đi qua 3 exit spaces rồi fresh movement D6 trong cùng lượt. Next runtime target là 0.1.55 integrate Draft D vào HOST-authoritative START_PLAYTEST flow. TIN TỨC / LÁ BÀI giữ nguyên. Do not merge PR #1.`
