# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## Validated rollback baseline

MVP 0.1.48 remains the user-accepted HOST-authoritative rollback baseline until Ron playtests and accepts 0.1.55.

Artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Do not regress HOST authority, replay/checksum, Job, Mini Game payout ownership, audio, movement, multiplayer parity or final-result invariants from 0.1.48.

## Current canonical gameplay candidate

### MVP 0.1.55 — Draft D Canonical Integration

Status: **CI GREEN / USER PLAYTEST CANDIDATE**

This is the first candidate where `START_PLAYTEST.bat` uses Draft D as the canonical board data instead of the old compact board.

Read first:
- `docs/PLAYTEST_0.1.55_DRAFT_D_CANONICAL.md`
- `docs/GAME_DESIGN_CURRENT.md`
- `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
- `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
- `docs/MAP_BRANCHING_RULE_D2.md`
- `docs/PLAYTEST_LAUNCHER_BRANCH_POLICY.md`

Runtime/content changes:
- `src/content/city/board_city_mvp.json` = Draft D canonical board
- `src/content/core/function_tiles_mvp.json` = five distinct Mini Game slot IDs + one Job Hub
- `tests/final-map-canonical-055.ts` = canonical Draft D regression
- legacy flow/economy/function-tile tests updated to protect current rules instead of the old 20-space assumptions

### 0.1.55 CI artifact

- artifact: `mememe-playtest-0.1.55-draft-d-canonical`
- run `#1808` / `34906952458`
- runtime/package head SHA `3bd6d1b91058957dedabeed450ad2a7f83aad7e7`
- artifact ID `10373250775`
- size `8,578,183 bytes`
- SHA256 `8c09e81fc85a78cef3f0718085662f0a3e0cf710575be8221c2ad11531b44d8e`

All CI gates passed, including replay, lockstep, HOST authority, bot stress, presentation, economy, Job/Mini Game, multiplayer parity, 0.1.48 regression, preview regressions, package validation and the new 0.1.55 canonical topology test.

## 0.1.55 canonical board — LOCKED CANDIDATE

- 44 main-loop spaces `M01..M44`.
- Asymmetric Draft D city layout.
- Three real Left/Right decision junctions.
- Human canonical gameplay uses the existing authoritative branch-choice flow.
- Both choices always progress forward, use equal split-to-merge distance, and merge ahead.
- No branch cycle, backward trap or dead end.

Junctions:
- M04: left `A1`, right `M05`, merge M08
- M17: left `M18`, right `B1`, merge M21
- M35: left `C1`, right `M36`, merge M39

Anchors:
- `M01 READY`
- `M12 JAIL_GATE`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE`

## Five Mini Game spaces — LOCKED

Draft D has exactly five Mini Game spaces:
- `M09` → `MINIGAME_SLOT_01`
- `M17` → `MINIGAME_SLOT_02`
- `M26` → `MINIGAME_SLOT_03`
- `M35` → `MINIGAME_SLOT_04`
- `M44` → `MINIGAME_SLOT_05`

Spacing is roughly `8 / 9 / 9 / 9 / 9` around the main loop.
All five slot IDs currently resolve through the shared MVP Mini Game rules. IDs stay separate so 0.1.59 can later give each slot deeper identity/game variety without another board migration.

Working main-loop distribution:
- Job Hub: `M08`
- TIN TỨC: `M06 / M14 / M21 / M28 / M36 / M43`
- LÁ BÀI: `M04 / M10 / M16 / M22 / M27 / M32 / M41`
- Money+: `M03 / M13 / M25 / M39` = +25 B$
- Money-: `M07 / M18 / M30 / M40` = -20 B$

## Jail / Hospital release rule — LOCKED DESIGN

Jail:
- release D6 succeeds on `1 / 3 / 5`;
- failure = stay detained and end turn;
- successful exit route = `JAIL -> J1 -> J2 -> J3 -> M13`.

Hospital:
- release D6 succeeds on exactly `2 / 4 / 5`;
- failure = stay hospitalized and end turn;
- successful exit route = `HOSPITAL -> H1 -> H2 -> H3 -> M35`.

For both locations:
- the release die is **only** the release check;
- after successful release and the three visible exit spaces, player takes a **fresh movement D6** in the same turn;
- never reuse the release roll as movement distance.

### Scope boundary

0.1.55 contains the approved Jail/Hospital geometry/content IDs but does **not** pretend the HOST-authoritative holding-state machine is already implemented.
Full Jail/Hospital/Lottery authority is scheduled for 0.1.57.

## Mini Game eligibility while held — LOCKED DESIGN

When 0.1.57 introduces authoritative holding state:
- player in JAIL = not eligible for Mini Game;
- player in HOSPITAL = not eligible for Mini Game;
- `2+` eligible = play normally;
- exactly `1` eligible = that player **auto rank #1**;
- `0` eligible = skip Mini Game, no payout.

This eligibility rule is core and 0.1.59 may deepen Mini Game content without changing it.

## Launcher roles

- `START_PLAYTEST.bat` = canonical standard gameplay and the file Ron should use to validate 0.1.55.
- `START_DRAFT_D_PREVIEW.bat` = QA sandbox; 0.1.54 AUTO/MANUAL branch tooling remains available.
- `START_DRAFT_D_FULL_MAP.bat` = whole-topology review only.
- legacy `START_FINAL_MAP_PREVIEW.bat` stays out of clean tester packages.

Keep current labels:
- **TIN TỨC**
- **LÁ BÀI**

Canonical visual reference:
- `docs/MEMEME_UI_REFERENCE_4PLAYER_HUD_V1.png`

Do not treat AI numbering/text in that reference as authoritative.

## Gameplay upgrade roadmap

- 0.1.54 = sandbox AUTO/MANUAL branch mode — **DONE / CI GREEN**
- 0.1.55 = Draft D canonical `START_PLAYTEST` integration — **CI GREEN / USER PLAYTEST PENDING**
- 0.1.56 = give branches gameplay identity
- 0.1.57 = authoritative Jail/Hospital/Lottery + holding-state Mini Game eligibility
- 0.1.58 = deepen TIN TỨC / LÁ BÀI interaction
- 0.1.59 = deepen Job / five-space Mini Game system
- 0.1.60 = real match pacing + economy tuning

0.1.49 Legacy Effect Audit remains parallel and feeds 0.1.58.

## Immediate user gate

Ron should test **`START_PLAYTEST.bat`** from the 0.1.55 artifact and verify:
1. Roll For Order / Job still enter gameplay normally.
2. Canonical board is the larger Draft D layout.
3. Left/Right choice appears and both routes rejoin correctly.
4. Five Mini Game spaces can trigger the existing Mini Game system.
5. TIN TỨC / LÁ BÀI / money / Job still resolve normally.
6. READY lap/salary and final-result chain remain correct.

Do not use Jail/Hospital holding mechanics as an acceptance criterion for 0.1.55 because their authoritative state machine belongs to 0.1.57.

If Ron accepts 0.1.55, next runtime milestone is **0.1.56 branch gameplay identity**.

Do not merge PR #1.

## New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. 0.1.48 vẫn là validated rollback baseline. Current canonical candidate là 0.1.55 Draft D Canonical Integration, CI green, artifact mememe-playtest-0.1.55-draft-d-canonical run #1808 / 34906952458, runtime/package SHA 3bd6d1b91058957dedabeed450ad2a7f83aad7e7, artifact 10373250775, SHA256 8c09e81fc85a78cef3f0718085662f0a3e0cf710575be8221c2ad11531b44d8e. START_PLAYTEST.bat now uses Draft D: 44 main spaces, 3 forward-only equal-step Left/Right junctions, 5 Mini Game spaces M09/M17/M26/M35/M44. Jail release 1/3/5, Hospital exactly 2/4/5; release roll only checks release, success traverses 3 exit spaces then fresh movement D6 same turn. Held Jail/Hospital players cannot join Mini Games; 1 eligible auto #1, 0 eligible skip/no payout. These holding/eligibility rules are locked design but authoritative implementation is 0.1.57. If 0.1.55 user playtest passes, next is 0.1.56 branch identity. Keep TIN TỨC / LÁ BÀI. Do not merge PR #1.`
