# MeMeMe — HANDOFF CURRENT

Branch: `mememe-mvp-0.1-core`
PR: #1 (Draft/Open)

Do **not** merge PR #1 or mark it Ready unless Ron explicitly asks.

## 1. Validated rollback baseline

MVP **0.1.48** remains the user-accepted HOST-authoritative rollback baseline.

Artifact:
- `mememe-playtest-0.1.48`
- run `#1441` / `34814789556`
- runtime/package SHA `5c4a31d77fdca7b3cb5f66a6ef0f99753fddac9c`
- artifact ID `10336247664`
- SHA256 `d4fd4acb3adffb1ee5b894e9f1a87ec7f9578faae56d55869805e3d55e45ed6c`

Never regress from 0.1.48:
- HOST authority;
- replay/checksum determinism;
- remote Roll For Order;
- multiplayer Job Hub;
- Mini Game payout ownership;
- audio ownership/BGM isolation;
- stale token guard;
- final-result/podium chain.

Keep current content names:
- **TIN TỨC**
- **LÁ BÀI**

Do not revive the rejected Tiên Tri / Phép Thuật rename.

## 2. What happened in this chat session

This session moved MeMeMe from the early Final Map preview into a real Draft D gameplay candidate.

### 0.1.50 — Final Map Preview

Created a separate local preview with:
- 44 main spaces;
- READY / Jail Gate / Lottery / Hospital Gate anchors;
- Jail/Hospital 3-space exit geometry;
- local Lottery preview;
- first four-corner HUD/camera experiments.

This preview remained presentation-only and did not replace the validated 0.1.48 runtime.

### Draft D feedback from Ron

Ron manually rejected the oval/too-linear feel and asked for:
- non-circular/asymmetric route composition;
- meaningful branching;
- more space between tiles;
- fewer long straight rows;
- closer party-game camera;
- full-map only as an intentional overview.

Draft D was then defined around three forward-only branch decisions.

### 0.1.51 / 0.1.52 — Draft D camera/HUD preview work

Preview work established the desired presentation direction:
- larger world than viewport;
- close active-token camera;
- smooth movement follow;
- separate screen-space HUD camera;
- four corner HUDs;
- Overview/full-map mode;
- irregular board silhouette;
- district/landmark context.

`FinalMapPreviewScene052` is especially important as an implementation reference for the presentation architecture.

### 0.1.53 — Left/Right forward branching

Draft D gained real route decisions where both options:
- move forward;
- reconnect ahead;
- avoid cycles/dead ends/backtracking;
- continue toward READY.

### 0.1.54 — QA sandbox convenience

Preview defaults to deterministic AUTO branch for repetitive testing, with MANUAL toggle still available.

Important distinction:
- AUTO is only QA convenience;
- canonical human gameplay is manual `RẼ TRÁI / RẼ PHẢI`.

### 0.1.55 — Draft D canonical gameplay integration

`START_PLAYTEST.bat` migrated to the Draft D board data while retaining the authoritative gameplay stack.

Locked candidate:
- 44 main-loop spaces `M01..M44`;
- 3 forward-only equal-step junctions;
- 5 Mini Game spaces;
- route choice remains HOST-authoritative.

### 0.1.56 — Branch Identity

Ron asked to continue while he was preparing to sleep, so 0.1.56 was built without waiting for a manual 0.1.55 runtime acceptance pass.

Branch identities:

**AN TOÀN 🛡️**
- `A1 / A2 / A3 = Normal / Normal / Normal`
- lowest immediate volatility.

**DRAMA 🎭**
- `B1 = TIN TỨC`
- `B2 = LÁ BÀI`
- `B3 = TIN TỨC`
- highest direct event/card exposure.

**TIỀN 💰**
- `C1 = +25 B$`
- `C2 = -20 B$`
- `C3 = +25 B$`
- every stop touches the wallet.

At every junction the alternative is shown as **PHỐ CHÍNH** with mixed content.

No route has a hidden distance advantage. Split-to-merge step counts remain equal.

The branch picker now shows player-facing:
- TRÁI / PHẢI;
- route flavor;
- first tile;
- route summary;
- risk.

Do not restore technical `Node 200` or odd/even parity debug copy to the canonical player-facing picker.

## 3. 0.1.56 artifact and CI result

Artifact:
- `mememe-playtest-0.1.56-branch-identity`
- run `#1846` / `34908302700`
- runtime/package code SHA `dfa391e50666802dfc91ae2e3c585da39837bac1`
- artifact ID `10373547363`
- size `8,578,336 bytes`
- SHA256 `8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44`

All CI gates passed:
- typecheck/build;
- replay;
- lockstep;
- HOST authority;
- two-tab sync;
- bot stress;
- presentation/event queue;
- board/economy;
- Job/Mini Game;
- multiplayer parity;
- inherited 0.1.48 bugfix gate;
- 0.1.50–0.1.55 regressions;
- new 0.1.56 branch-identity gate;
- package validation/artifact upload.

**Do not confuse CI-green with user visual acceptance.**

## 4. Major finding after Ron manually tested 0.1.56

Ron tested `START_PLAYTEST.bat` on 2026-09-15 and supplied screenshots.

His feedback was correct: the canonical launcher should be the best integrated experience, but visually it still looks like an old prototype.

### Visible symptoms

- Header shows `CITY • MVP 0.1.25 • 200B$ ECONOMY` despite running the 0.1.56 package.
- Bottom-right badge also shows old 0.1.25 copy.
- Normal gameplay shows nearly the whole board instead of a close active-token camera.
- No final P1/P2/P3/P4 four-corner HUD.
- Current-player info is still a compact bottom bar; leaderboard is top-right.
- 44 main spaces plus branch corridors are squeezed into the old 1280×720 board composition.
- Many nodes/branches crowd or overlap visually, especially on the right.
- Large event overlay hides most of the board.
- Old center `MeMeMe CITY / DEMO MATCH` prototype copy survives.

### Root cause confirmed in repo

`public/START_PLAYTEST.bat` is correct. It launches standard gameplay.

`src/main.ts` is also correct in selecting:
`CareerMinigameBoardScene056 as ActiveBoardScene`.

The problem is architectural:

1. `CareerMinigameBoardScene056` is a very thin wrapper that extends `CareerMinigameBoardScene048`.
2. That preserves the 0.1.48 authoritative bugfix chain, which is good.
3. But the scene inheritance ultimately still renders through the old `DemoBoardScene` presentation shell.
4. `DemoBoardScene` assumes the entire board fits on one 1280×720 screen and draws every ordinary node as a large circle.
5. `PresentationParityBoardScene` only layered a compact bottom HUD/top-right score table on top of that old renderer. It never became the locked four-corner HUD/camera system.
6. `FinalMapPreviewScene052` already demonstrated the superior world camera + separate UI camera + close follow + four-corner HUD approach, but it remained preview-only.
7. 0.1.55 moved **board data/topology** into canonical gameplay without moving that superior **presentation architecture**.

### Separate version-label bug

Build labels are changed through a chain of exact-string replacements.

Example:
- `PartyMechanicsBoardScene` changes a 0.1.23 label into `0.1.25`.
- `TurnStakesBoardScene` later searches for `0.1.24`, which no longer exists.
- downstream wrappers then fail to find their expected previous string.

Therefore a genuine 0.1.56 runtime can still display `0.1.25`.

This must be replaced with one authoritative visible build/version source.

Full audit:
`docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`

Updated HUD/camera contract:
`docs/UI_FINAL_PLAYER_HUD.md`

## 5. Current status declaration

### 0.1.56 gameplay

**CI GREEN / FUNCTIONAL CANDIDATE**

Branch identity/content work remains valid.

### 0.1.56 presentation

**NOT USER-ACCEPTED / CANONICAL UI REWORK REQUIRED**

Do not claim the current `START_PLAYTEST.bat` look is accepted.

### 0.1.48

Still the only user-validated rollback baseline for authoritative runtime behavior.

## 6. Immediate next milestone — 0.1.56.1 Canonical Presentation Consolidation

This is now a blocker **before implementing 0.1.57 special-location authority**.

Purpose:
make `START_PLAYTEST.bat` finally become the best integrated build, while keeping gameplay state/authority untouched.

Required work:

### Camera
- normal gameplay does not show the full board;
- follow active token closely;
- smooth pan/follow during authoritative move steps;
- at branch junction, zoom out slightly to show both routes;
- after route choice, return to close follow;
- Overview button explicitly shows full map;
- Overview never becomes the default gameplay view.

### Four-corner HUD
- P1 top-left;
- P2 top-right;
- P3 bottom-left;
- P4 bottom-right;
- avatar + name + B$ minimum;
- compact hand/job/lap/status where useful;
- active player clearly highlighted;
- HUD remains screen-space and independent from board camera.

### Board readability
- stop using giant 34px ordinary circles for the whole Draft D graph;
- use smaller clean greybox markers suitable for close zoom;
- preserve asymmetric Draft D spacing;
- visibly separate branch corridors;
- integrate Job/Mini Game marker identity without stacked competing circles;
- final art is not required yet.

### Event/Card presentation
- TIN TỨC/LÁ BÀI still readable;
- do not cover the whole central playfield;
- preserve visible board/token context;
- do not cover all four HUD corners.

### Version/build UI
- one source of truth for current visible build/version;
- no chained exact-string mutation;
- no old `0.1.25` leakage.

### Safety
Do not change authoritative gameplay semantics while doing this UI pass.

Must keep green:
- replay/checksum;
- HOST authority;
- multiplayer parity;
- Roll For Order;
- Job Hub;
- Mini Game payout ownership;
- stale token guard;
- audio;
- READY/lap/final-result chain;
- 0.1.56 branch rules.

Ron must manually accept this presentation before calling it canonical.

## 7. Canonical Draft D topology / content

Main loop:
- exactly 44 spaces `M01..M44`;
- only `M44 -> M01` creates lap crossing.

Anchors:
- `M01 READY`
- `M12 JAIL_GATE`
- `M23 LOTTERY`
- `M34 HOSPITAL_GATE`

Junctions:
- after M04: left A corridor or right M05 route, merge M08;
- after M17: left M18 route or right B corridor, merge M21;
- after M35: left C corridor or right M36 route, merge M39.

Both choices always progress forward and merge ahead.
No cycle, backward trap, dead end, or endless wandering.

Five Mini Games are locked:
- `M09 -> MINIGAME_SLOT_01`
- `M17 -> MINIGAME_SLOT_02`
- `M26 -> MINIGAME_SLOT_03`
- `M35 -> MINIGAME_SLOT_04`
- `M44 -> MINIGAME_SLOT_05`

Job Hub:
- `M08`

Main-loop TIN TỨC:
- M06 / M14 / M21 / M28 / M36 / M43

Main-loop LÁ BÀI:
- M04 / M10 / M16 / M22 / M27 / M32 / M41

Main-loop Money+:
- M03 / M13 / M25 / M39 = +25 B$

Main-loop Money-:
- M07 / M18 / M30 / M40 = -20 B$

## 8. Jail / Hospital / Lottery rules already locked for 0.1.57

### Jail

Entry anchor:
`M12 JAIL_GATE -> JAIL`

Release:
- roll D6 at start of detained player's turn;
- success on `1 / 3 / 5`;
- fail = remain in Jail and turn ends;
- success traverses `JAIL -> J1 -> J2 -> J3 -> M13`;
- release die is **only** an escape check;
- after successful exit, player rolls a **fresh movement D6** in the same turn.

### Hospital

Entry anchor:
`M34 HOSPITAL_GATE -> HOSPITAL`

Release:
- roll D6 at start of hospitalized player's turn;
- success on exactly `2 / 4 / 5`;
- fail = remain in Hospital and turn ends;
- success traverses `HOSPITAL -> H1 -> H2 -> H3 -> M35`;
- release die is **only** a recovery check;
- after successful exit, player rolls a **fresh movement D6** in the same turn.

### Mini Game eligibility while held

Once holding state becomes authoritative:
- Jail player = ineligible;
- Hospital player = ineligible;
- 2+ eligible = normal Mini Game;
- exactly 1 eligible = auto rank #1;
- 0 eligible = skip / no payout.

This is a core rule and 0.1.59 must not change it.

### Lottery

`M23 LOTTERY`
- HOST rolls one D6;
- reward = `D6 × 20 B$`;
- outcomes = 20 / 40 / 60 / 80 / 100 / 120 B$;
- RNG and wallet mutation must be HOST-authoritative.

## 9. Launcher roles

`START_PLAYTEST.bat`
- canonical gameplay launcher;
- must become the best integrated presentation in 0.1.56.1;
- current 0.1.56 package is functionally useful but visually not accepted.

`START_DRAFT_D_PREVIEW.bat`
- QA sandbox;
- AUTO/MANUAL tooling;
- preview techniques may be extracted into canonical runtime;
- preview gameplay model must not replace authoritative match state.

`START_DRAFT_D_FULL_MAP.bat`
- whole-topology review only.

Legacy `START_FINAL_MAP_PREVIEW.bat`
- do not ship in clean tester packages.

## 10. Current roadmap

- 0.1.49 Legacy Effect Audit — parallel, feeds 0.1.58
- 0.1.54 AUTO/MANUAL Draft D sandbox — DONE
- 0.1.55 Draft D canonical gameplay data/topology — CI GREEN
- 0.1.56 branch identity — GAMEPLAY/CI GREEN, PRESENTATION NOT ACCEPTED
- **0.1.56.1 canonical presentation consolidation — IMMEDIATE NEXT**
- 0.1.57 authoritative Jail/Hospital/Lottery + holding-state Mini Game eligibility
- 0.1.58 TIN TỨC / LÁ BÀI depth
- 0.1.59 Job + five-space Mini Game depth
- 0.1.60 real match pacing + economy tuning

## 11. Read first in the next chat

In this order:

1. `HANDOFF_CURRENT.md`
2. `docs/START_PLAYTEST_UI_AUDIT_0.1.56.md`
3. `docs/UI_FINAL_PLAYER_HUD.md`
4. `docs/MAP_CAMERA_HUD_DRAFT_D1.md`
5. `docs/GAME_DESIGN_CURRENT.md`
6. `docs/GAMEPLAY_UPGRADE_ROADMAP_0.1.54_PLUS.md`
7. `docs/MVP_0.1.56_BRANCH_IDENTITY.md`
8. `docs/MAP_ARCHITECTURE_44_DRAFT_D.md`
9. `src/scenes/FinalMapPreviewScene052.ts` as presentation implementation reference
10. `src/scenes/CareerMinigameBoardScene056.ts`, `PresentationParityBoardScene.ts`, `DemoBoardScene.ts` to understand the old shell/root cause

Do not merge PR #1.

## 12. New-chat resume prompt

`Tiếp tục MeMeMe Board Game từ HANDOFF_CURRENT.md trên branch mememe-mvp-0.1-core. Đọc ngay docs/START_PLAYTEST_UI_AUDIT_0.1.56.md và docs/UI_FINAL_PLAYER_HUD.md. 0.1.48 vẫn là user-validated authoritative rollback baseline. 0.1.56 Branch Identity gameplay/CI đã green (artifact mememe-playtest-0.1.56-branch-identity, run #1846 / 34908302700, code SHA dfa391e50666802dfc91ae2e3c585da39837bac1, artifact 10373547363, SHA256 8f3f47d169118766edd47b5f8e8e64665ee0547db9b969b960db09a5191f8d44), nhưng Ron đã test START_PLAYTEST.bat và REJECT presentation hiện tại vì vẫn là old fixed/full-board prototype shell: header leak 0.1.25, camera quá xa, không có four-corner HUD, Draft D 44 ô bị dồn/chồng, event overlay che map. Root cause: 056 chỉ wrap 048 và authoritative chain vẫn render qua DemoBoardScene/PresentationParityBoardScene; superior world-camera + fixed UI camera chỉ đang nằm ở FinalMapPreviewScene052. Immediate next milestone là 0.1.56.1 Canonical Presentation Consolidation BEFORE 0.1.57: extract/reuse preview camera/HUD ideas into canonical authoritative START_PLAYTEST without duplicating gameplay state, close active-token follow, fixed P1 TL/P2 TR/P3 BL/P4 BR HUD, branch framing, explicit Overview only, cleaner greybox tile rendering, smaller event overlays, single authoritative build/version label source. Preserve all 0.1.48+ authority/replay/checksum/multiplayer/Job/Mini Game/audio/final result rules. Branch identities locked: A AN TOÀN Normal×3, B DRAMA TIN TỨC/LÁ BÀI/TIN TỨC, C TIỀN +25/-20/+25, other route PHỐ CHÍNH, equal distance. 5 Mini Games M09/M17/M26/M35/M44. Jail 1/3/5, Hospital exactly 2/4/5; release die only checks release, success traverses 3 exit spaces then fresh movement D6 same turn. Jail/Hospital players cannot join Mini Games; 1 eligible auto #1, 0 eligible skip/no payout. Lottery D6×20. Keep TIN TỨC/LÁ BÀI. Do not merge PR #1.`
